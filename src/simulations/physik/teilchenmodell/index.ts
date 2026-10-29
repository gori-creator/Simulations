import { clamp, defineSimulation, drawCard, ease, FixedStepper, mixColor, offscreenCanvas, prefersReducedMotion, roundRect, scaledSprite, seededRandom, shade, Surface, text, tintedSprite, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  diffusionFactor,
  enthalpy,
  GAS,
  kelvin,
  latentHeats,
  latticeSites,
  LIQUID,
  MD,
  meanKineticEnergy,
  meanSpeed,
  thermostatOptions,
  modelKT,
  ParticleBox,
  phaseState,
  SAMPLE_MASS,
  SOLID,
  SPEED_SCALE,
  speedDensity,
  SwapLattice,
  swapRate,
  THETA_MAX,
  THETA_MIN,
  timeToMix,
  WATER,
  type Phase,
  type PhaseState,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Zeitraffer beim Heizen: 1 s im Bild entspricht 40 s Heizzeit. */
const TIME_LAPSE = 40;
/** Histogramm: 16 Klassen zu je 100 m/s. */
const BINS = 16;
const V_MAX = 1600;
/** Farbskala der Teilchen: langsam (blau) … schnell (rot), in m/s. */
const V_LO = 150;
const V_HI = 1250;
const SHADES = 28;
/** Gezeichneter Teilchenradius (Anteil am Durchmesser des Modells). */
const R_DRAW = 0.4;
/** Thermometer-Skala in °C. */
const SCALE_LO = -40;
const SCALE_HI = 140;
/** Diffusion: Gitter je Glas und Tropfengröße. */
const D_COLS = 10;
const D_ROWS = 12;
const D_INK = 40;

type Mode = 'state' | 'diff';

interface Lay {
  side: boolean;
  scene: Rect;
  a: Rect;
  b: Rect;
}

interface Sample {
  t: number;
  th: number;
  ph: Phase;
  dir: number;
}

interface Swap {
  i: number;
  from: number;
  to: number;
  t0: number;
  dur: number;
  side: number;
}

interface Beaker {
  lat: SwapLattice;
  busy: Float64Array;
  swaps: Swap[];
  acc: number;
  clock: number;
  inkFade: Float64Array;
  rand: () => number;
}

/**
 * Teilchenmodell und Temperatur: Wasser in einem Zylinder mit Kolben auf einer
 * Heiz- und Kühlplatte. Die Teilchen schwingen im Eis um Gitterplätze, gleiten
 * in der Flüssigkeit aneinander vorbei und fliegen im Dampf frei; Farbe =
 * Geschwindigkeit. Live: Temperatur-Zeit-Diagramm mit Schmelz- und Siedeplateau,
 * Geschwindigkeitsverteilung. Zweiter Versuch: Diffusion von Tinte in kaltem und
 * warmem Wasser nebeneinander.
 */
export default defineSimulation({
  id: 'teilchenmodell',
  animated: true,
  dragHint: true,
  hint: { de: 'Tipp: Tippe ein Teilchen an, um seinen Weg zu verfolgen.', en: 'Tip: Tap a particle to follow its path.' },
  layout: { aspect: 1.55, aspectNarrow: 0.46 },
  images: { thermo: 'thermometer.webp', plate: 'heizplatte.webp', pipette: 'pipette.webp', table: 'tischkante.webp', beaker: 'becherglas.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'state', label: L('Aggregatzustände', 'States of matter') },
        { value: 'diff', label: L('Diffusion', 'Diffusion') },
      ],
      default: 'state',
    },
    {
      key: 'heat',
      type: 'choice',
      label: L('Heiz- und Kühlplatte', 'Hot and cold plate'),
      options: [
        { value: 'cool', label: L('Kühlen', 'Cool') },
        { value: 'off', label: L('Aus', 'Off') },
        { value: 'heat', label: L('Heizen', 'Heat') },
      ],
      default: 'off',
      visibleIf: (v) => v.mode === 'state',
    },
    {
      key: 'T',
      type: 'number',
      label: L('Temperatur ϑ', 'Temperature ϑ'),
      help: L('Oder: am Thermometer ziehen. Beim Heizen und Kühlen läuft der Regler mit.', 'Or drag the thermometer. While heating or cooling, the slider follows.'),
      min: THETA_MIN,
      max: THETA_MAX,
      step: 1,
      default: -20,
      unit: '°C',
      visibleIf: (v) => v.mode === 'state',
    },
    {
      key: 'pw',
      type: 'number',
      label: L('Leistung der Platte P', 'Power of the plate P'),
      help: L('Probe: 0,5 kg Wasser. Das Heizen läuft im Zeitraffer (1 s im Bild = 40 s).', 'Sample: 0.5 kg of water. Heating runs in time-lapse (1 s on screen = 40 s).'),
      min: 200,
      max: 2000,
      step: 100,
      default: 1000,
      unit: 'W',
      visibleIf: (v) => v.mode === 'state',
    },
    { key: 'tc', type: 'number', label: L('Temperatur im kalten Glas', 'Temperature of the cold glass'), min: 1, max: 40, step: 1, default: 10, unit: '°C', visibleIf: (v) => v.mode === 'diff' },
    { key: 'tw', type: 'number', label: L('Temperatur im warmen Glas', 'Temperature of the warm glass'), min: 40, max: 95, step: 1, default: 70, unit: '°C', visibleIf: (v) => v.mode === 'diff' },
    { key: 'bonds', type: 'boolean', group: 'view', label: L('Anziehung zwischen den Teilchen (Bindungen)', 'Attraction between the particles (bonds)'), default: true, visibleIf: (v) => v.mode === 'state' },
    { key: 'arr', type: 'boolean', group: 'view', label: L('Geschwindigkeitspfeile', 'Velocity arrows'), default: false, visibleIf: (v) => v.mode === 'state' },
  ],
  actions: [{ id: 'drop', label: L('Tinte eintropfen', 'Add a drop of ink'), primary: true, visibleIf: (v) => v.mode === 'diff' }],
  readouts: [
    { key: 'phase', label: L('Aggregatzustand', 'State of matter') },
    { key: 'temp', label: L('Temperatur und Teilchenbewegung', 'Temperature and particle motion'), spoiler: true },
    { key: 'latent', label: L('Energie für die Übergänge', 'Energy for the changes of state'), spoiler: true },
    { key: 'mix', label: L('Durchmischung', 'Mixing') },
    { key: 'why', label: L('Warum schneller?', 'Why faster?'), spoiler: true },
    { key: 't90', label: L('90 % durchmischt', '90 % mixed'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Eis bei −20 °C', 'Ice at −20 °C'), values: {} },
    { id: 'heat', label: L('Vom Eis zum Dampf', 'From ice to steam'), values: { heat: 'heat' } },
    { id: 'melt', label: L('Schmelzen: ϑ bleibt bei 0 °C', 'Melting: ϑ stays at 0 °C'), values: { T: 0, heat: 'heat', pw: 500 } },
    { id: 'cool', label: L('Dampf abkühlen', 'Cooling steam'), values: { T: 130, heat: 'cool', pw: 2000 } },
    { id: 'gas', label: L('Gas mit Geschwindigkeitspfeilen', 'Gas with velocity arrows'), values: { T: 120, arr: true } },
    { id: 'diff', label: L('Diffusion: kalt und warm', 'Diffusion: cold and warm'), values: { mode: 'diff' } },
  ],
  strings: {
    de: {
      canvas:
        'Teilchenmodell: Wasser in einem Zylinder mit Kolben auf einer Heiz- und Kühlplatte, daneben ein Thermometer. Die Teilchen sind als Kugeln gezeichnet, ihre Farbe zeigt die Geschwindigkeit (blau langsam, rot schnell). Rechts das Temperatur-Zeit-Diagramm mit Schmelz- und Siedeplateau und die Verteilung der Geschwindigkeiten. Im zweiten Versuch verteilt sich Tinte in einem kalten und einem warmen Glas Wasser.',
      solid: 'fest',
      liquid: 'flüssig',
      gas: 'gasförmig',
      melting: 'Schmelzen',
      freezing: 'Erstarren',
      boiling: 'Sieden',
      condensing: 'Kondensieren',
      chartT: 'Temperatur-Zeit-Diagramm',
      chartTS: 'ϑ-t-Diagramm',
      axisT: 't in min',
      axisTh: 'ϑ in °C',
      meltLine: 'Schmelztemperatur',
      boilLine: 'Siedetemperatur',
      emptyT: '„Heizen“ oder „Kühlen“ – hier entsteht das Diagramm.',
      emptyTS: 'Heizen oder Kühlen …',
      histTitle: 'Geschwindigkeiten der Teilchen',
      histTitleS: 'Geschwindigkeiten',
      histAxis: 'v in m/s',
      histShare: 'Anteil',
      model: 'Modell',
      mean: 'Ø {v} m/s',
      hint: 'Tippe ein Teilchen an, um seinen Weg zu verfolgen.',
      hintS: 'Teilchen antippen: Weg verfolgen',
      hintOn: 'Ein anderes Teilchen antippen – oder daneben, um aufzuhören.',
      hintOnS: 'Daneben tippen: nicht mehr verfolgen',
      limitHi: '130 °C erreicht – Platte aus',
      limitLo: '−30 °C erreicht – Platte aus',
      cold: 'kalt',
      warm: 'warm',
      mixTitle: 'Durchmischung',
      axisS: 't in s',
      mixAxis: 'in %',
      emptyMix: '„Tinte eintropfen“ – hier entsteht das Diagramm.',
      emptyMixS: 'Tinte eintropfen …',
      compare: 'Vergleich',
      after: 'nach {t} s',
      pending: '90 % noch nicht erreicht',
      pendingS: 'läuft …',
      hintD: 'Gleiche Tropfen, gleiche Gläser – nur die Temperatur ist verschieden.',
      hintDS: 'Nur die Temperatur ist verschieden.',
      phaseSolid: '<strong>fest</strong> (Eis): Die Teilchen schwingen um feste Plätze im Gitter.',
      phaseMelting: '<strong>{verb}</strong>: {pct} % flüssig, {rest} % fest. Die Temperatur bleibt bei 0 °C – die Energie {what}.',
      phaseLiquid: '<strong>flüssig</strong> (Wasser): Die Teilchen halten noch zusammen, gleiten aber aneinander vorbei.',
      phaseBoiling: '<strong>{verb}</strong>: {pct} % gasförmig, {rest} % flüssig. Die Temperatur bleibt bei 100 °C – die Energie {what}.',
      phaseGas: '<strong>gasförmig</strong> (Wasserdampf): Die Teilchen fliegen frei und füllen den ganzen Raum.',
      whatIn: 'löst Bindungen zwischen den Teilchen',
      whatOut: 'wird frei, weil neue Bindungen entstehen',
      whatOff: 'steckt in den Bindungen, nicht in der Bewegung',
      temp:
        '<var>T</var> = <var>ϑ</var> + 273 K = {th} + 273 K = <strong>{T} K</strong><br>Mittlere Bewegungsenergie: <var>E</var> = <span class="frac"><span>3</span><span>2</span></span> · <var>k</var> · <var>T</var> ≈ {E} · 10<sup>−21</sup> J<br>Die Teilchen sind im Mittel ≈ <strong>{v} m/s</strong> schnell.',
      latent:
        'Schmelzen: <var>Q</var> = <var>m</var> · <var>q</var><sub>s</sub> = 0,5 kg · 334 <span class="frac"><span>kJ</span><span>kg</span></span> = {qs} kJ → bei <var>P</var> = {P} W: <var>t</var> = <span class="frac"><span><var>Q</var></span><span><var>P</var></span></span> ≈ {ts} min<br>Verdampfen: <var>Q</var> = <var>m</var> · <var>q</var><sub>v</sub> = 0,5 kg · 2257 <span class="frac"><span>kJ</span><span>kg</span></span> ≈ {qv} kJ → <var>t</var> ≈ {tv} min',
      nowState: 't = {t} min · ϑ = {th} °C · zugeführte Energie Q = {q} kJ',
      nowStateCool: 't = {t} min · ϑ = {th} °C · abgegebene Energie Q = {q} kJ',
      nowStateOff: 't = {t} min · ϑ = {th} °C · Platte aus',
      mixText: 'kalt ({tc} °C): <strong>{mc} %</strong> · warm ({tw} °C): <strong>{mw} %</strong>',
      mixNone: 'Noch keine Tinte im Wasser – „Tinte eintropfen“.',
      why: 'Wasserteilchen im Mittel: kalt ≈ {vc} m/s, warm ≈ {vw} m/s.<br>Bei {tw} °C wechseln die Teilchen etwa <strong>{f}-mal so oft</strong> den Platz wie bei {tc} °C – die Tinte verteilt sich entsprechend schneller.',
      t90: 'kalt ({tc} °C): nach ≈ <strong>{a} s</strong> · warm ({tw} °C): nach ≈ <strong>{b} s</strong> (bei gleichbleibender Temperatur, Zeitraffer)',
      nowDiff: 't = {t} s nach dem Eintropfen',
      nowDiffNone: 'Tinte noch nicht eingetropft',
    },
    en: {
      canvas:
        'Particle model: water in a cylinder with a piston on a hot and cold plate, next to it a thermometer. The particles are drawn as balls, their colour shows the speed (blue slow, red fast). On the right the temperature–time graph with the melting and boiling plateaus and the distribution of speeds. In the second experiment ink spreads in a glass of cold and a glass of warm water.',
      solid: 'solid',
      liquid: 'liquid',
      gas: 'gas',
      melting: 'melting',
      freezing: 'freezing',
      boiling: 'boiling',
      condensing: 'condensing',
      chartT: 'Temperature–time graph',
      chartTS: 'ϑ–t graph',
      axisT: 't in min',
      axisTh: 'ϑ in °C',
      meltLine: 'melting point',
      boilLine: 'boiling point',
      emptyT: '“Heat” or “Cool” – the graph appears here.',
      emptyTS: 'Heat or cool …',
      histTitle: 'Speeds of the particles',
      histTitleS: 'Speeds',
      histAxis: 'v in m/s',
      histShare: 'share',
      model: 'model',
      mean: 'mean {v} m/s',
      hint: 'Tap a particle to follow its path.',
      hintS: 'Tap a particle: follow it',
      hintOn: 'Tap another particle – or next to it to stop.',
      hintOnS: 'Tap next to it to stop',
      limitHi: '130 °C reached – plate off',
      limitLo: '−30 °C reached – plate off',
      cold: 'cold',
      warm: 'warm',
      mixTitle: 'Mixing',
      axisS: 't in s',
      mixAxis: 'in %',
      emptyMix: '“Add a drop of ink” – the graph appears here.',
      emptyMixS: 'Add ink …',
      compare: 'Comparison',
      after: 'after {t} s',
      pending: '90 % not reached yet',
      pendingS: 'running …',
      hintD: 'Same drops, same glasses – only the temperature differs.',
      hintDS: 'Only the temperature differs.',
      phaseSolid: '<strong>solid</strong> (ice): the particles vibrate about fixed places in the lattice.',
      phaseMelting: '<strong>{verb}</strong>: {pct} % liquid, {rest} % solid. The temperature stays at 0 °C – the energy {what}.',
      phaseLiquid: '<strong>liquid</strong> (water): the particles still stick together but slide past each other.',
      phaseBoiling: '<strong>{verb}</strong>: {pct} % gas, {rest} % liquid. The temperature stays at 100 °C – the energy {what}.',
      phaseGas: '<strong>gas</strong> (steam): the particles fly freely and fill the whole space.',
      whatIn: 'breaks bonds between the particles',
      whatOut: 'is released because new bonds form',
      whatOff: 'is stored in the bonds, not in the motion',
      temp:
        '<var>T</var> = <var>ϑ</var> + 273 K = {th} + 273 K = <strong>{T} K</strong><br>Mean kinetic energy: <var>E</var> = <span class="frac"><span>3</span><span>2</span></span> · <var>k</var> · <var>T</var> ≈ {E} · 10<sup>−21</sup> J<br>On average the particles move at about <strong>{v} m/s</strong>.',
      latent:
        'Melting: <var>Q</var> = <var>m</var> · <var>L</var><sub>f</sub> = 0.5 kg · 334 <span class="frac"><span>kJ</span><span>kg</span></span> = {qs} kJ → at <var>P</var> = {P} W: <var>t</var> = <span class="frac"><span><var>Q</var></span><span><var>P</var></span></span> ≈ {ts} min<br>Vaporising: <var>Q</var> = <var>m</var> · <var>L</var><sub>v</sub> = 0.5 kg · 2257 <span class="frac"><span>kJ</span><span>kg</span></span> ≈ {qv} kJ → <var>t</var> ≈ {tv} min',
      nowState: 't = {t} min · ϑ = {th} °C · energy supplied Q = {q} kJ',
      nowStateCool: 't = {t} min · ϑ = {th} °C · energy given off Q = {q} kJ',
      nowStateOff: 't = {t} min · ϑ = {th} °C · plate off',
      mixText: 'cold ({tc} °C): <strong>{mc} %</strong> · warm ({tw} °C): <strong>{mw} %</strong>',
      mixNone: 'No ink in the water yet – “Add a drop of ink”.',
      why: 'Water particles on average: cold ≈ {vc} m/s, warm ≈ {vw} m/s.<br>At {tw} °C the particles change places about <strong>{f} times as often</strong> as at {tc} °C – so the ink spreads faster.',
      t90: 'cold ({tc} °C): after ≈ <strong>{a} s</strong> · warm ({tw} °C): after ≈ <strong>{b} s</strong> (at constant temperature, time-lapse)',
      nowDiff: 't = {t} s after adding the ink',
      nowDiffNone: 'no ink added yet',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    // Platzhalter einsetzen; zwischen Zahl und Einheit ein geschütztes Leerzeichen (kein Zeilenumbruch in „580 m/s“)
    const tr = (key: string, vars: Record<string, string>) =>
      ctx
        .t(key)
        .replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')
        .replace(/(\d) (?=(?:°C|m\/s|K|kJ|kg|W|min|s|J|%)(?![\p{L}]))/gu, '$1\u00a0');
    const n = (v: number, d: number) => fmt.num(v, d);
    const mode = (): Mode => (p.mode === 'diff' ? 'diff' : 'state');
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const teal = () => ctx.theme.series[5]!;
    const phaseColor = (k: number) => (k === 0 ? blue() : k === 1 ? teal() : purple());

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, instant = false): number {
      const cur = soft.get(key);
      if (cur === undefined || instant || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-3 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1300, ease.linear);
    /** Fortschritt eines zeitversetzten Teils der Einstiegsanimation (0 … 1, mit Easing). */
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.4, 228, 380));
        const ah = Math.round((h - 10) * 0.55);
        return { side, scene: { x: 0, y: 0, w: w - pw - 12, h }, a: { x: w - pw, y: 0, w: pw, h: ah }, b: { x: w - pw, y: ah + 10, w: pw, h: h - ah - 10 } };
      }
      const sh = Math.round(h * 0.5);
      const ah = Math.round((h - sh - 20) * 0.55);
      return { side, scene: { x: 0, y: 0, w, h: sh }, a: { x: 0, y: sh + 10, w, h: ah }, b: { x: 0, y: sh + 20 + ah, w, h: h - sh - 20 - ah } };
    }

    /* ---------- Farben und vorgerenderte Kugeln ---------- */
    let paletteKey = '';
    let palette: string[] = [];
    function speedPalette(): string[] {
      const th = ctx.theme;
      const key = `${th.dark}|${th.series.join(',')}`;
      if (key === paletteKey) return palette;
      paletteKey = key;
      const b = blue();
      const o = orange();
      const r = red();
      const stops: [number, string][] = [
        [0, mixColor(b, '#0a1a44', 0.35)],
        [0.24, b],
        [0.46, mixColor(b, '#eef3fa', 0.72)],
        [0.6, mixColor(o, '#fff4e6', 0.55)],
        [0.78, o],
        [1, r],
      ];
      palette = [];
      for (let i = 0; i < SHADES; i++) {
        const t = i / (SHADES - 1);
        let k = 0;
        while (k < stops.length - 2 && t > stops[k + 1]![0]) k++;
        const [t0, c0] = stops[k]!;
        const [t1, c1] = stops[k + 1]!;
        palette.push(mixColor(c0, c1, (t - t0) / (t1 - t0)));
      }
      return palette;
    }
    const shadeOf = (vReal: number) => Math.round(clamp((vReal - V_LO) / (V_HI - V_LO), 0, 1) * (SHADES - 1));

    const sprites = new Map<string, HTMLCanvasElement>();
    /** Glänzende Kugel mit weichem Schatten (vorab gerendert). */
    function ball(color: string, r: number): HTMLCanvasElement {
      const rr = Math.max(2, Math.round(r * 4) / 4);
      const key = `${color}|${rr}|${surface.dpr}|${ctx.theme.dark}`;
      const hit = sprites.get(key);
      if (hit) return hit;
      if (sprites.size > 160) sprites.clear();
      const m = rr * 0.9;
      const size = 2 * (rr + m);
      const { canvas, g } = offscreenCanvas(size, size, surface.dpr);
      const c = rr + m;
      const dpr = surface.dpr;
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,32,56,0.28)';
      g.shadowBlur = rr * 0.7 * dpr;
      g.shadowOffsetX = rr * 0.14 * dpr;
      g.shadowOffsetY = rr * 0.32 * dpr;
      g.fillStyle = shade(color, -0.3);
      g.beginPath();
      g.arc(c, c, rr * 0.96, 0, TAU);
      g.fill();
      g.restore();
      const body = g.createRadialGradient(c - rr * 0.38, c - rr * 0.42, rr * 0.08, c, c, rr);
      body.addColorStop(0, mixColor(color, '#ffffff', 0.62));
      body.addColorStop(0.42, color);
      body.addColorStop(1, shade(color, -0.38));
      g.fillStyle = body;
      g.beginPath();
      g.arc(c, c, rr, 0, TAU);
      g.fill();
      // Glanzlicht und Randlicht
      const gl = g.createRadialGradient(c - rr * 0.36, c - rr * 0.44, 0, c - rr * 0.36, c - rr * 0.44, rr * 0.5);
      gl.addColorStop(0, 'rgba(255,255,255,0.85)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.beginPath();
      g.arc(c, c, rr, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.22)';
      g.lineWidth = Math.max(0.6, rr * 0.08);
      g.beginPath();
      g.arc(c, c, rr * 0.9, Math.PI * 0.15, Math.PI * 0.75);
      g.stroke();
      sprites.set(key, canvas);
      return canvas;
    }
    function drawBall(color: string, x: number, y: number, r: number, scale = 1, alpha = 1): void {
      if (scale <= 0.01 || alpha <= 0.01) return;
      const g = surface.g;
      const sp = ball(color, r);
      const rr = Math.max(2, Math.round(r * 4) / 4);
      const half = (rr + rr * 0.9) * scale;
      if (alpha < 1) {
        g.save();
        g.globalAlpha *= alpha;
      }
      g.drawImage(sp, x - half, y - half, 2 * half, 2 * half);
      if (alpha < 1) g.restore();
    }

    /* ---------- Zeichenhilfen ---------- */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      text(g, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: fill ? '#ffffff' : color });
      return { x: x0, y, w, h };
    }

    function pillWidth(label: string, size = 12): number {
      const g = surface.g;
      g.font = `700 ${size}px ${ctx.theme.font}`;
      return g.measureText(label).width + 16;
    }

    /** Infokarte im einheitlichen Stil (sim-core). */
    function card(r: Rect): void {
      drawCard(surface.g, r, ctx.theme);
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.55);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
    }

    function haloText(label: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineWidth = 3.5;
      g.lineJoin = 'round';
      g.strokeStyle = ctx.theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
      g.strokeText(label, x, y);
      g.fillStyle = color;
      g.fillText(label, x, y);
    }

    /** „Schöne“ Schrittweite (1, 2, 5 · 10^k) von mindestens x. */
    function niceStep(x: number): number {
      const q = 10 ** Math.floor(Math.log10(Math.max(1e-9, x)));
      for (const m of [1, 2, 5, 10]) if (m * q >= x - 1e-12) return m * q;
      return 10 * q;
    }

    function drawRoom(r: Rect, tableH: number): number {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const tableY = r.y + r.h - tableH;
      const wall = g.createLinearGradient(0, r.y, 0, tableY);
      wall.addColorStop(0, dark ? '#172131' : '#f4f7fb');
      wall.addColorStop(1, dark ? '#101824' : '#e1e8f0');
      g.fillStyle = wall;
      g.fillRect(r.x, r.y, r.w, tableY - r.y);
      // weiches Licht von links oben
      const glow = g.createRadialGradient(r.x + r.w * 0.25, r.y, 10, r.x + r.w * 0.25, r.y, r.w * 0.8);
      glow.addColorStop(0, dark ? 'rgba(120,160,220,0.08)' : 'rgba(255,255,255,0.7)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = glow;
      g.fillRect(r.x, r.y, r.w, tableY - r.y);
      const wood = ctx.images.get('table');
      if (wood) {
        // Foto der Tischkante, waagerecht abwechselnd gespiegelt gekachelt (keine Nahtstellen);
        // ganzzahlige Kachelbreite und 1 px Überlappung, sonst bleibt am Kachelrand ein heller Streifen
        const tw = Math.round((tableH * wood.width) / wood.height);
        for (let i = 0, x = r.x; x < r.x + r.w; i++, x += tw) {
          g.drawImage(scaledSprite(wood, tw + 1, tableH, surface.dpr, { flipX: i % 2 === 1 }), x, tableY, tw + 1, tableH);
        }
        if (dark) {
          g.fillStyle = 'rgba(0,0,0,0.45)';
          g.fillRect(r.x, tableY, r.w, tableH);
        }
        g.fillStyle = 'rgba(255,255,255,0.22)';
        g.fillRect(r.x, tableY, r.w, 1.5);
        return tableY;
      }
      const table = g.createLinearGradient(0, tableY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c9a273');
      table.addColorStop(1, dark ? '#30251b' : '#9f774c');
      g.fillStyle = table;
      g.fillRect(r.x, tableY, r.w, r.y + r.h - tableY);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.fillRect(r.x, tableY, r.w, 1.5);
      // Maserung
      g.strokeStyle = dark ? 'rgba(0,0,0,0.16)' : 'rgba(90,60,30,0.12)';
      g.lineWidth = 1;
      g.beginPath();
      for (let k = 1; k <= 3; k++) {
        const yy = tableY + (k * tableH) / 4;
        g.moveTo(r.x, yy);
        for (let x = r.x; x <= r.x + r.w; x += 40) g.lineTo(x, yy + Math.sin(x * 0.03 + k) * 1.2);
      }
      g.stroke();
      return tableY;
    }

    /* ================================================================== */
    /* Versuch 1: Aggregatzustände                                         */
    /* ================================================================== */

    const rand = seededRandom(20261018);
    let box: ParticleBox | null = null;
    let nTotal = 0;
    let boxW = 0;
    let bondPairs: Int16Array = new Int16Array(0);
    let H = enthalpy(p.T);
    let st: PhaseState = phaseState(H);
    let simT = 0;
    let dir = 0;
    let history: Sample[] = [];
    let oldHistory: Sample[] = [];
    let oldRange = 1;
    const fadeOld = new Tween(700, ease.outCubic);
    const histo = new Float64Array(BINS);
    let histoReady = false;
    /** Geglättetes Verhältnis Ø (Teilchen) / Ø (Sollwert). */
    let meanR = 1;
    let gasFrac = st.gas;
    let pistonH = 0;
    /** Zeit in s seit dem letzten Zustandswechsel (für den Thermostat). */
    let sinceTransition = Infinity;
    const stepper = new FixedStepper(1 / 300);
    const limitNote = new Tween(2600, ease.linear);
    let limitText = '';
    let tracked = -1;
    const trail: [number, number][] = [];
    let thermoDrag = false;
    let thermoHover = false;
    let lastNow = '';

    interface StateGeo {
      r: Rect;
      sm: boolean;
      pad: number;
      hdrY: number;
      tableY: number;
      plateTop: number;
      /** Innenraum des Zylinders (Pixel) und Maßstab (Pixel je Teilchendurchmesser). */
      ix: number;
      iw: number;
      iy0: number;
      iyB: number;
      s: number;
      Hi: number;
      cx: number;
      glassX: number;
      glassW: number;
      gw: number;
      /** Thermometer: Mitte der Röhre, oben, Kugelmitte. */
      tx: number;
      tTop: number;
      tBulb: number;
      tScaleTop: number;
      tScaleBot: number;
    }

    function stateGeo(r: Rect): StateGeo {
      const sm = r.w < 440;
      const pad = sm ? 10 : 16;
      const hdrY = r.y + (sm ? 10 : 14);
      const tableH = sm ? 24 : 30;
      const tableY = r.y + r.h - tableH;
      const plateH = sm ? 22 : 28;
      const plateTop = tableY - plateH;
      const tz = sm ? 66 : 86;
      const zoneX = r.x + pad;
      const zoneW = r.w - 2 * pad - tz;
      const gw = sm ? 5 : 7;
      const top = r.y + (sm ? 62 : 72);
      const bottomGlass = sm ? 6 : 8;
      const ih = plateTop - bottomGlass - top;
      const iw = Math.max(80, Math.min(zoneW - 2 * gw - 10, ih * 1.02));
      const nn = iw / 14 >= 21 ? 60 : 48;
      const W = nn === 60 ? 14 : 11.6;
      const s = iw / W;
      const cx = zoneX + zoneW / 2;
      const ix = cx - iw / 2;
      const tx = r.x + r.w - pad - tz + (sm ? 16 : 20);
      const tTop = top - 6;
      const tBulb = tableY - (sm ? 14 : 17);
      return {
        r,
        sm,
        pad,
        hdrY,
        tableY,
        plateTop,
        ix,
        iw,
        iy0: top,
        iyB: plateTop - bottomGlass,
        s,
        Hi: ih / s,
        cx,
        glassX: ix - gw,
        glassW: iw + 2 * gw,
        gw,
        tx,
        tTop,
        tBulb,
        tScaleTop: tTop + 14,
        tScaleBot: tBulb - (sm ? 22 : 26),
      };
    }

    const thetaToY = (G: StateGeo, th: number) => G.tScaleBot - ((th - SCALE_LO) / (SCALE_HI - SCALE_LO)) * (G.tScaleBot - G.tScaleTop);
    const yToTheta = (G: StateGeo, y: number) => SCALE_LO + ((G.tScaleBot - y) / (G.tScaleBot - G.tScaleTop)) * (SCALE_HI - SCALE_LO);

    /** Kolbenhöhe (Teilchendurchmesser): auf der kondensierten Phase, mit Dampf höher. */
    function pistonTarget(G: StateGeo): number {
      if (!box) return 6;
      const hMin = box.condensedHeight() + 1.1;
      const hMax = Math.max(hMin + 1, (G.Hi - 2.2) * (kelvin(Math.max(100, st.theta)) / kelvin(THETA_MAX)));
      return hMin + (hMax - hMin) * clamp(gasFrac, 0, 1);
    }

    function ensureBox(G: StateGeo): void {
      const nn = G.iw / 14 >= 21 ? 60 : 48;
      if (box && nn === nTotal) {
        box.width = boxW;
        return;
      }
      nTotal = nn;
      boxW = nn === 60 ? 14 : 11.6;
      const cols = nn === 60 ? 10 : 8;
      const sites = latticeSites(cols, 6, boxW);
      box = new ParticleBox(nn, boxW, Math.max(6, G.Hi - 2.2), sites, rand);
      gasFrac = st.gas;
      box.height = pistonTarget(G);
      pistonH = box.height;
      box.arrange(Math.round(st.solid * nn), Math.round(st.gas * nn), modelKT(st.theta));
      // Beim Einsortieren wird Lageenergie frei: kurz straffer regeln (wie nach einem Zustandswechsel)
      sinceTransition = 0;
      // Nachbarplätze im Gitter (für die gezeichneten Bindungen)
      const pairs: number[] = [];
      for (let a = 0; a < sites.length; a++) {
        for (let b = a + 1; b < sites.length; b++) {
          const d = Math.hypot(sites[a]!.x - sites[b]!.x, sites[a]!.y - sites[b]!.y);
          if (d < MD.spacing * 1.2) pairs.push(a, b);
        }
      }
      bondPairs = Int16Array.from(pairs);
      tracked = -1;
      trail.length = 0;
      histoReady = false;
    }

    function resetHistory(): void {
      if (history.length > 1) {
        oldHistory = history;
        oldRange = soft.get('tmax') ?? 60;
        fadeOld.play();
      }
      simT = 0;
      history = [{ t: 0, th: st.theta, ph: st.phase, dir: 0 }];
    }

    /** Temperatur direkt einstellen (Regler, Thermometer, Beispiel). */
    function setTheta(theta: number): void {
      H = enthalpy(clamp(theta, THETA_MIN, THETA_MAX));
      st = phaseState(H);
      resetHistory();
      if (box) box.syncRoles(Math.round(st.solid * box.n), Math.round(st.gas * box.n), modelKT(st.theta));
    }

    function record(): void {
      const last = history[history.length - 1];
      if (!last || simT - last.t >= 2 || Math.abs(st.theta - last.th) >= 0.6 || last.ph !== st.phase || last.dir !== dir) {
        history.push({ t: simT, th: st.theta, ph: st.phase, dir });
        if (history.length > 1600) history = history.filter((q, i) => i % 2 === 0 || i === history.length - 1 || q.ph !== history[i - 1]?.ph);
      } else {
        // letzter Punkt läuft mit (Kurve endet immer genau „jetzt“)
        const prev = history[history.length - 2];
        if (prev && last.t - prev.t < 2) {
          last.t = simT;
          last.th = st.theta;
        } else history.push({ t: simT, th: st.theta, ph: st.phase, dir });
      }
    }

    function tickState(dt: number): void {
      const sign = p.heat === 'heat' ? 1 : p.heat === 'cool' ? -1 : 0;
      const P = sign * p.pw;
      if (P !== 0) {
        const lo = enthalpy(THETA_MIN);
        const hi = enthalpy(THETA_MAX);
        H += P * dt * TIME_LAPSE;
        if ((P > 0 && H >= hi) || (P < 0 && H <= lo)) {
          H = clamp(H, lo, hi);
          limitText = ctx.t(H >= hi ? 'limitHi' : 'limitLo');
          limitNote.play();
          ctx.set({ heat: 'off' });
        }
      }
      dir = sign;
      simT += dt * TIME_LAPSE;
      st = phaseState(H);
      record();
      const kT = modelKT(st.theta);
      if (box) {
        box.syncRoles(Math.round(st.solid * box.n), Math.round(st.gas * box.n), kT);
        gasFrac += (box.count(GAS) / box.n - gasFrac) * (1 - Math.exp(-dt * 2.2));
        const G = stateGeo(computeLayout().scene);
        pistonH = pistonTarget(G);
        box.height = pistonH;
        const b = box;
        // Beim Schmelzen und Sieden regelt der Thermostat straffer (siehe THERMOSTAT im Modell)
        sinceTransition = st.phase === 'melting' || st.phase === 'boiling' ? 0 : sinceTransition + dt;
        const thermo = thermostatOptions(st.phase, kT, sinceTransition);
        stepper.run(Math.min(dt, 0.05), (h) => b.step(h, thermo));
        // Histogramm (gleitender Mittelwert) und mittlere Geschwindigkeit
        const inst = new Float64Array(BINS);
        let sum = 0;
        for (let i = 0; i < b.n; i++) {
          const v = Math.hypot(b.vx[i]!, b.vy[i]!) * SPEED_SCALE;
          sum += v;
          const k = Math.floor((v / V_MAX) * BINS);
          if (k < BINS) inst[k]! += 1 / b.n;
        }
        const a = histoReady ? 1 - Math.exp(-dt * 1.6) : 1;
        for (let k = 0; k < BINS; k++) histo[k]! += (inst[k]! - histo[k]!) * a;
        // Geglättet wird das Verhältnis zum Sollwert, nicht der Wert selbst: So folgt
        // die Anzeige beim schnellen Heizen und Kühlen der Temperatur ohne Nachlauf.
        const vRef = meanSpeed(st.theta);
        meanR += (sum / b.n / vRef - meanR) * (histoReady ? 1 - Math.exp(-dt * 1.2) : 1);
        histoReady = true;
        if (tracked >= 0 && tracked < b.n) {
          trail.push([b.x[tracked]!, b.y[tracked]!]);
          if (trail.length > 150) trail.shift();
        }
      }
      if (Math.round(st.theta) !== p.T) ctx.set({ T: Math.round(st.theta) });
      updateNow();
    }

    /* ---------- Zeichnen: Szene ---------- */
    function drawChips(G: StateGeo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = G.sm;
      const fsz = sm ? 11.5 : 12.5;
      const fr = [ease2('fs', st.solid, 6), ease2('fl', st.liquid, 6), ease2('fg', st.gas, 6)];
      const labels = [ctx.t('solid'), ctx.t('liquid'), ctx.t('gas')];
      const widths = labels.map((l) => pillWidth(l, fsz) + 4);
      const conn = sm ? 28 : 44;
      const total = widths.reduce((a, b) => a + b, 0) + 2 * conn;
      let x = clamp(G.cx - total / 2, G.r.x + G.pad, G.tx - 40 - total);
      const y = G.hdrY;
      const h = fsz + 13;
      const active = st.phase === 'melting' ? 0 : st.phase === 'boiling' ? 1 : -1;
      g.save();
      g.globalAlpha *= ik;
      for (let k = 0; k < 3; k++) {
        const w = widths[k]!;
        const col = phaseColor(k);
        const f = fr[k]!;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.14)';
        g.shadowBlur = 6 + 6 * f;
        g.shadowOffsetY = 2;
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.96)';
        roundRect(g, x, y, w, h, h / 2);
        g.fill();
        g.restore();
        // Füllung wächst mit dem Anteil von links
        if (f > 0.004) {
          g.save();
          roundRect(g, x, y, w, h, h / 2);
          g.clip();
          const grad = g.createLinearGradient(0, y, 0, y + h);
          grad.addColorStop(0, shade(col, 0.12));
          grad.addColorStop(1, shade(col, -0.12));
          g.fillStyle = grad;
          g.fillRect(x, y, w * f, h);
          g.restore();
        }
        g.strokeStyle = withAlpha(col, 0.35 + 0.5 * f);
        g.lineWidth = 1.2;
        roundRect(g, x + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
        // Schrift: auf der Füllung weiß, sonst farbig (über einen Schnitt getrennt)
        const font = `700 ${fsz}px ${theme.font}`;
        text(g, labels[k]!, x + w / 2, y + h / 2 + 0.5, { font, color: col });
        if (f > 0.004) {
          g.save();
          g.beginPath();
          g.rect(x, y, w * f, h);
          g.clip();
          text(g, labels[k]!, x + w / 2, y + h / 2 + 0.5, { font, color: '#ffffff' });
          g.restore();
        }
        x += w;
        if (k < 2) {
          const on = active === k;
          const a = ease2(`conn${k}`, on ? 1 : 0, 6);
          const cy = y + h / 2;
          const x0 = x + 5;
          const x1 = x + conn - 5;
          const c = mixColor(theme.muted, k === 0 ? teal() : purple(), a);
          g.strokeStyle = withAlpha(theme.muted, 0.35);
          g.lineWidth = 1.5;
          g.setLineDash([2, 3]);
          g.beginPath();
          g.moveTo(x0, cy);
          g.lineTo(x1, cy);
          g.stroke();
          g.setLineDash([]);
          if (a > 0.02) {
            const back = dir < 0;
            g.save();
            g.globalAlpha *= a;
            arrowPx(back ? x1 : x0, cy, back ? x0 : x1, cy, c, 2.2, 7);
            // wandernde Punkte in Richtung des Übergangs
            if (!prefersReducedMotion() && dir !== 0) {
              const ph = (performance.now() / 900) % 1;
              for (let q = 0; q < 2; q++) {
                const u = (ph + q * 0.5) % 1;
                const px = back ? x1 - (x1 - x0) * u : x0 + (x1 - x0) * u;
                g.fillStyle = withAlpha(theme.bg, 0.95);
                g.beginPath();
                g.arc(px, cy, 2, 0, TAU);
                g.fill();
              }
              animating = true;
            }
            const verb = k === 0 ? (dir < 0 ? 'freezing' : 'melting') : dir < 0 ? 'condensing' : 'boiling';
            haloText(ctx.t(verb), x + conn / 2, y + h + (sm ? 10 : 11), `700 ${sm ? 11 : 12}px ${theme.font}`, k === 0 ? teal() : purple());
            g.restore();
          }
          x += conn;
        }
      }
      g.restore();
    }

    function drawPlate(G: StateGeo, heatVis: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const px0 = G.glassX - (G.sm ? 12 : 18);
      const pw0 = G.glassW + (G.sm ? 24 : 36);
      const top = G.plateTop;
      const bot = G.tableY;
      const photo = ctx.images.get('plate');
      if (photo) {
        drawPlatePhoto(photo, px0, top, pw0, bot - top, heatVis, G);
        return;
      }
      // Gehäuse
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.25)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const body = g.createLinearGradient(0, top, 0, bot);
      body.addColorStop(0, dark ? '#3a424e' : '#5b6572');
      body.addColorStop(1, dark ? '#20252d' : '#353c46');
      g.fillStyle = body;
      roundRect(g, px0, top + 4, pw0, bot - top - 3, 5);
      g.fill();
      g.restore();
      // Platte (oben), glüht beim Heizen, bereift beim Kühlen
      const hot = Math.max(0, heatVis);
      const cold = Math.max(0, -heatVis);
      let plate = dark ? '#6c7480' : '#8d96a3';
      if (hot > 0) plate = mixColor(plate, '#ff5a1f', hot * 0.9);
      if (cold > 0) plate = mixColor(plate, dark ? '#9fd3ff' : '#d8efff', cold * 0.85);
      const pg = g.createLinearGradient(0, top, 0, top + 7);
      pg.addColorStop(0, shade(plate, 0.25));
      pg.addColorStop(1, shade(plate, -0.15));
      g.fillStyle = pg;
      roundRect(g, px0 + 6, top, pw0 - 12, 7, 3);
      g.fill();
      if (hot > 0.01) {
        // Glühen nach oben in den Zylinder
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.75);
        gl.addColorStop(0, `rgba(255,110,40,${0.42 * hot})`);
        gl.addColorStop(1, 'rgba(255,110,40,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.75, G.glassW * 2, G.glassW * 0.75 + 8);
        // Heizwendel als glühende Bögen auf der Vorderseite
        g.strokeStyle = `rgba(255,${Math.round(150 + 60 * hot)},90,${0.75 * hot})`;
        g.lineWidth = 1.6;
        g.beginPath();
        const yy = top + 3.5;
        for (let x = px0 + 14; x < px0 + pw0 - 14; x += 9) {
          g.moveTo(x, yy);
          g.quadraticCurveTo(x + 4.5, yy - 2.2, x + 9, yy);
        }
        g.stroke();
      }
      if (cold > 0.01) {
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.7);
        gl.addColorStop(0, `rgba(120,190,255,${0.36 * cold})`);
        gl.addColorStop(1, 'rgba(120,190,255,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.7, G.glassW * 2, G.glassW * 0.7 + 8);
        // Reifkristalle an der Vorderkante
        g.strokeStyle = `rgba(255,255,255,${0.85 * cold})`;
        g.lineWidth = 1;
        const step = G.sm ? 16 : 20;
        for (let x = px0 + 14; x < px0 + pw0 - 10; x += step) {
          const cy = top + 12 + ((x * 7) % 5);
          const rr = 3 + ((x * 13) % 3);
          g.beginPath();
          for (let k = 0; k < 3; k++) {
            const a = (k * Math.PI) / 3;
            g.moveTo(x - Math.cos(a) * rr, cy - Math.sin(a) * rr);
            g.lineTo(x + Math.cos(a) * rr, cy + Math.sin(a) * rr);
          }
          g.stroke();
        }
      }
      // Drehknopf
      const kx = px0 + pw0 - (G.sm ? 14 : 18);
      const ky = top + (bot - top) / 2 + 3;
      const kr = G.sm ? 5 : 6.5;
      g.fillStyle = dark ? '#151a20' : '#23282f';
      g.beginPath();
      g.arc(kx, ky, kr, 0, TAU);
      g.fill();
      g.strokeStyle = heatVis > 0.05 ? '#ff8a4c' : heatVis < -0.05 ? '#8fd0ff' : '#c9d1da';
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      const ang = -Math.PI / 2 + heatVis * 1.1;
      g.beginPath();
      g.moveTo(kx, ky);
      g.lineTo(kx + Math.cos(ang) * kr * 0.8, ky + Math.sin(ang) * kr * 0.8);
      g.stroke();
      // Kontrollleuchte
      const lx = px0 + (G.sm ? 12 : 16);
      const lamp = heatVis > 0.05 ? `rgba(255,120,50,${0.4 + 0.6 * hot})` : heatVis < -0.05 ? `rgba(110,190,255,${0.4 + 0.6 * cold})` : dark ? '#404854' : '#6b7480';
      g.fillStyle = lamp;
      g.beginPath();
      g.arc(lx, ky, G.sm ? 2.5 : 3, 0, TAU);
      g.fill();
    }

    /**
     * Heizplatte als Foto. Das Foto ist höher als die flache Platte im Aufbau;
     * damit nichts verzerrt wird, bleiben die Enden (rechts mit Drehknopf und
     * Kontrolllampe) maßstabsgetreu, nur das gleichförmige Mittelstück wird
     * waagerecht gestreckt. Glühen, Knopfstellung und Lampe kommen darüber.
     */
    const PLATE_SRC = { top: 16, bottom: 303, left: 300, right: 1250, width: 1600, glass: 50, knobX: 1375, knobY: 180, knobR: 60, ledX: 1497, ledY: 180 };
    function drawPlatePhoto(img: HTMLImageElement, x: number, top: number, w: number, h: number, heatVis: number, G: StateGeo): void {
      const g = surface.g;
      const P = PLATE_SRC;
      const k = h / (P.bottom - P.top);
      const lw = P.left * k;
      const rw = (P.width - P.right) * k;
      const mw = Math.max(1, w - lw - rw);
      const piece = (sx: number, sw: number, dx: number, dw: number) => {
        const crop = { x: sx, y: P.top, w: sw, h: P.bottom - P.top };
        g.drawImage(scaledSprite(img, dw, h, surface.dpr, { crop }), dx, top, dw, h);
      };
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.25)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      piece(0, P.left, x, lw + 0.5);
      piece(P.left, P.right - P.left, x + lw, mw + 0.5);
      piece(P.right, P.width - P.right, x + lw + mw, rw);
      g.restore();
      const hot = Math.max(0, heatVis);
      const cold = Math.max(0, -heatVis);
      // Glaskeramik oben: glüht beim Heizen, wird beim Kühlen bläulich
      const gh = (P.glass - P.top) * k;
      if (hot > 0.01 || cold > 0.01) {
        g.fillStyle = hot > 0 ? `rgba(255,90,31,${0.75 * hot})` : `rgba(150,205,255,${0.6 * cold})`;
        roundRect(g, x + 20 * k, top + 0.5, w - 40 * k, gh, Math.min(3, gh / 2));
        g.fill();
      }
      if (hot > 0.01) {
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.8);
        gl.addColorStop(0, `rgba(255,110,40,${0.42 * hot})`);
        gl.addColorStop(1, 'rgba(255,110,40,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.8, G.glassW * 2, G.glassW * 0.8 + 8);
      }
      if (cold > 0.01) {
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.7);
        gl.addColorStop(0, `rgba(120,190,255,${0.36 * cold})`);
        gl.addColorStop(1, 'rgba(120,190,255,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.7, G.glassW * 2, G.glassW * 0.7 + 8);
        // Reifkristalle an der Vorderkante
        g.strokeStyle = `rgba(255,255,255,${0.85 * cold})`;
        g.lineWidth = 1;
        const step = G.sm ? 16 : 20;
        for (let xx = x + 14; xx < x + lw + mw - 10; xx += step) {
          const cy = top + gh + 5 + ((xx * 7) % 5) * 0.6;
          const rr = 2.5 + ((xx * 13) % 3) * 0.6;
          g.beginPath();
          for (let q = 0; q < 3; q++) {
            const a = (q * Math.PI) / 3;
            g.moveTo(xx - Math.cos(a) * rr, cy - Math.sin(a) * rr);
            g.lineTo(xx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
          }
          g.stroke();
        }
      }
      // Stellung des Drehknopfs und Kontrolllampe
      const rx = x + lw + mw - P.right * k;
      const kx = rx + P.knobX * k;
      const ky = top + (P.knobY - P.top) * k;
      const kr = P.knobR * k;
      g.strokeStyle = heatVis > 0.05 ? '#ff8a4c' : heatVis < -0.05 ? '#8fd0ff' : '#c9d1da';
      g.lineWidth = Math.max(1.2, kr * 0.25);
      g.lineCap = 'round';
      const ang = -Math.PI / 2 + heatVis * 1.1;
      g.beginPath();
      g.moveTo(kx, ky);
      g.lineTo(kx + Math.cos(ang) * kr * 0.75, ky + Math.sin(ang) * kr * 0.75);
      g.stroke();
      if (Math.abs(heatVis) > 0.05) {
        g.fillStyle = heatVis > 0 ? `rgba(255,120,50,${0.4 + 0.6 * hot})` : `rgba(110,190,255,${0.4 + 0.6 * cold})`;
        g.beginPath();
        g.arc(rx + P.ledX * k, top + (P.ledY - P.top) * k, Math.max(2, 14 * k), 0, TAU);
        g.fill();
      }
    }

    function drawCylinder(G: StateGeo, front: boolean, ik: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const top = G.iy0 - 4;
      const bot = G.plateTop;
      const x0 = G.glassX;
      const w = G.glassW;
      if (!front) {
        // Innenraum: zart getöntes Glas, nach unten etwas dunkler
        const inner = g.createLinearGradient(0, G.iy0, 0, G.iyB);
        inner.addColorStop(0, dark ? 'rgba(30,44,64,0.55)' : 'rgba(234,241,249,0.9)');
        inner.addColorStop(1, dark ? 'rgba(20,30,46,0.75)' : 'rgba(218,228,240,0.95)');
        g.save();
        g.globalAlpha *= ik;
        g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.18)';
        g.shadowBlur = 14;
        g.shadowOffsetY = 4;
        g.fillStyle = inner;
        roundRect(g, x0, top, w, bot - top, 6);
        g.fill();
        g.restore();
        return;
      }
      g.save();
      g.globalAlpha *= ik;
      // Glaswände
      const wall = (xa: number, left: boolean) => {
        const gr = g.createLinearGradient(xa, 0, xa + G.gw, 0);
        gr.addColorStop(0, dark ? 'rgba(170,200,235,0.30)' : 'rgba(150,175,205,0.55)');
        gr.addColorStop(left ? 0.35 : 0.65, dark ? 'rgba(220,235,255,0.42)' : 'rgba(255,255,255,0.85)');
        gr.addColorStop(1, dark ? 'rgba(150,180,220,0.22)' : 'rgba(140,165,195,0.5)');
        g.fillStyle = gr;
        g.fillRect(xa, top, G.gw, bot - top);
      };
      wall(x0, true);
      wall(x0 + w - G.gw, false);
      // Boden
      const bg = g.createLinearGradient(0, G.iyB, 0, bot);
      bg.addColorStop(0, dark ? 'rgba(190,215,245,0.35)' : 'rgba(255,255,255,0.8)');
      bg.addColorStop(1, dark ? 'rgba(120,150,190,0.3)' : 'rgba(150,175,205,0.6)');
      g.fillStyle = bg;
      g.fillRect(x0, G.iyB, w, bot - G.iyB);
      // Rand oben
      g.fillStyle = dark ? 'rgba(210,228,250,0.5)' : 'rgba(255,255,255,0.95)';
      roundRect(g, x0 - 2, top - 2, G.gw + 4, 5, 2);
      g.fill();
      roundRect(g, x0 + w - G.gw - 2, top - 2, G.gw + 4, 5, 2);
      g.fill();
      // Lichtreflex auf dem Glas
      const sh = g.createLinearGradient(x0, 0, x0 + w, 0);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.08, dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.28)');
      sh.addColorStop(0.16, 'rgba(255,255,255,0)');
      sh.addColorStop(0.86, 'rgba(255,255,255,0)');
      sh.addColorStop(0.92, dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.18)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sh;
      g.fillRect(x0, top, w, bot - top);
      // Skala am Glas
      g.strokeStyle = dark ? 'rgba(220,232,250,0.35)' : 'rgba(60,80,110,0.35)';
      g.lineWidth = 1;
      g.beginPath();
      for (let yy = G.iyB - G.s; yy > G.iy0 + 4; yy -= G.s) {
        const big = Math.round((G.iyB - yy) / G.s) % 2 === 0;
        g.moveTo(x0 + G.gw, Math.round(yy) + 0.5);
        g.lineTo(x0 + G.gw + (big ? 9 : 5), Math.round(yy) + 0.5);
      }
      g.stroke();
      g.restore();
    }

    function drawPiston(G: StateGeo, ik: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const yb = G.iyB - pistonH * G.s;
      const th = Math.max(8, 0.42 * G.s);
      const x0 = G.ix + 0.5;
      const w = G.iw - 1;
      g.save();
      g.globalAlpha *= ik;
      // Kolbenscheibe aus Metall
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const mg = g.createLinearGradient(0, yb - th, 0, yb);
      mg.addColorStop(0, dark ? '#c5ccd6' : '#eef1f5');
      mg.addColorStop(0.5, dark ? '#8d96a3' : '#b9c1cc');
      mg.addColorStop(1, dark ? '#5d6570' : '#87909c');
      g.fillStyle = mg;
      roundRect(g, x0, yb - th, w, th, 3);
      g.fill();
      g.restore();
      // Dichtringe
      g.fillStyle = dark ? '#1b1f25' : '#2c3138';
      g.fillRect(x0, yb - th * 0.62, 3, th * 0.26);
      g.fillRect(x0 + w - 3, yb - th * 0.62, 3, th * 0.26);
      // Gewicht auf dem Kolben (sorgt für gleichbleibenden Druck)
      const ww = Math.min(w * 0.42, 6 * G.s);
      const wh = Math.max(12, 1.15 * G.s);
      const wx = G.cx - ww / 2;
      const wy = yb - th - wh;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      const iron = g.createLinearGradient(wx, 0, wx + ww, 0);
      iron.addColorStop(0, dark ? '#2b3038' : '#3c434d');
      iron.addColorStop(0.35, dark ? '#59616d' : '#6f7884');
      iron.addColorStop(1, dark ? '#23272e' : '#30363e');
      g.fillStyle = iron;
      roundRect(g, wx, wy, ww, wh, 4);
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.fillRect(wx + 3, wy + 2, ww - 6, 1.4);
      g.restore();
    }

    /**
     * Thermometer-Foto (Glasröhre ohne Skala, nur die Kugel gefüllt): Mitte der
     * Röhre, Kugelmitte und -radius, Oberkante der Röhre und Grenzen des
     * gleichförmigen Röhrenstücks (Bildpixel). Nur dieses Stück wird in der
     * Länge gestreckt; Kopf und Kugel bleiben maßstabsgetreu.
     */
    const THERMO_SRC = { cx: 99.5, bulbY: 1310, bulbR: 100, top: 10, tubeA: 60, tubeB: 1180 };
    function drawThermoPhoto(img: HTMLImageElement, x: number, top: number, by: number, br: number, color: string): void {
      const g = surface.g;
      const T = THERMO_SRC;
      const k = br / T.bulbR;
      const w = img.width * k;
      const x0 = x - T.cx * k;
      const yA = top + (T.tubeA - T.top) * k;
      const yB = by - (T.bulbY - T.tubeB) * k;
      const hBot = (img.height - T.tubeB) * k;
      const dpr = surface.dpr;
      const head = { x: 0, y: T.top, w: img.width, h: T.tubeA - T.top };
      g.drawImage(scaledSprite(img, w, yA - top, dpr, { crop: head }), x0, top, w, yA - top + 0.5);
      if (yB > yA) {
        const tube = { x: 0, y: T.tubeA, w: img.width, h: T.tubeB - T.tubeA };
        g.drawImage(scaledSprite(img, w, yB - yA, dpr, { crop: tube }), x0, yA, w, yB - yA + 0.5);
      }
      // Kugel in der Farbe der Säule
      const bulb = { x: 0, y: T.tubeB, w: img.width, h: img.height - T.tubeB };
      g.drawImage(tintedSprite(img, w, hBot, dpr, color, { crop: bulb, lift: 0.35 }), x0, yB, w, hBot);
    }

    function drawThermo(G: StateGeo, shown: number, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = G.sm;
      const tw = sm ? 12 : 14;
      const br = sm ? 11 : 13;
      const x = G.tx;
      const top = G.tTop;
      const by = G.tBulb;
      const liquid = red();
      g.save();
      g.globalAlpha *= stage(0.15, 0.5);
      // Stativfuß
      g.fillStyle = dark ? '#2a3039' : '#4a525d';
      roundRect(g, x - br - 6, G.tableY - 5, 2 * br + 12, 5, 2);
      g.fill();
      // Glasröhre mit Kugel
      const photo = ctx.images.get('thermo');
      if (photo) drawThermoPhoto(photo, x, top, by, br, liquid);
      else {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.2)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 3;
        g.fillStyle = dark ? 'rgba(200,220,245,0.16)' : 'rgba(255,255,255,0.9)';
        g.beginPath();
        g.moveTo(x - tw / 2, top + tw / 2);
        g.arc(x, top + tw / 2, tw / 2, Math.PI, 0);
        g.lineTo(x + tw / 2, by - br * 0.7);
        g.arc(x, by, br, -Math.PI / 2 + 0.6, Math.PI * 1.5 - 0.6);
        g.closePath();
        g.fill();
        g.restore();
        g.strokeStyle = dark ? 'rgba(200,220,245,0.45)' : 'rgba(110,130,160,0.55)';
        g.lineWidth = 1.2;
        g.stroke();
      }
      // Flüssigkeit
      const cap = sm ? 4 : 5;
      const yTop = clamp(thetaToY(G, shown), top + 6, by);
      g.fillStyle = liquid;
      if (photo) {
        // Säule bis in den Hals der fotografierten Kugel
        roundRect(g, x - cap / 2, yTop, cap, by - br * 0.6 - yTop, cap / 2);
        g.fill();
      } else {
        g.beginPath();
        g.arc(x, by, br - 3, 0, TAU);
        g.fill();
        roundRect(g, x - cap / 2, yTop, cap, by - yTop, cap / 2);
        g.fill();
        const hl = g.createRadialGradient(x - br * 0.35, by - br * 0.35, 1, x, by, br);
        hl.addColorStop(0, 'rgba(255,255,255,0.55)');
        hl.addColorStop(0.5, 'rgba(255,255,255,0)');
        g.fillStyle = hl;
        g.beginPath();
        g.arc(x, by, br - 3, 0, TAU);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.5)';
        g.fillRect(x - tw / 2 + 2.5, top + tw / 2, 1.5, by - br - top - tw / 2);
      }
      // Skala
      const lx = x + tw / 2 + 4;
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1;
      g.beginPath();
      for (let th = SCALE_LO; th <= SCALE_HI; th += 10) {
        const yy = Math.round(thetaToY(G, th)) + 0.5;
        const big = th % 20 === 0;
        g.moveTo(lx, yy);
        g.lineTo(lx + (big ? 7 : 4), yy);
      }
      g.stroke();
      const font = `600 ${sm ? 10.5 : 11}px ${theme.font}`;
      for (let th = SCALE_LO; th <= SCALE_HI; th += 20) {
        const special = th === WATER.melt || th === WATER.boil;
        text(g, th < 0 ? `−${-th}` : String(th), lx + 10, thetaToY(G, th), { font: special ? `800 ${sm ? 10.5 : 11}px ${theme.font}` : font, color: th === 0 ? teal() : th === 100 ? purple() : theme.muted, align: 'left' });
      }
      text(g, '°C', lx + 10, G.tScaleTop - 13, { font: `700 ${sm ? 10.5 : 11}px ${theme.font}`, color: theme.muted, align: 'left' });
      // Griff an der Säule
      const hot = thermoHover || thermoDrag;
      if (!ctx.locked) {
        g.fillStyle = withAlpha(liquid, hot ? 0.3 : 0.14);
        g.beginPath();
        g.arc(x, yTop, hot ? 11 : 8, 0, TAU);
        g.fill();
        g.fillStyle = theme.dark ? '#10161f' : '#ffffff';
        g.beginPath();
        g.arc(x, yTop, 4.5, 0, TAU);
        g.fill();
        g.strokeStyle = liquid;
        g.lineWidth = 2;
        g.stroke();
      }
      g.restore();
      // Anzeige oben
      const lab = `${n(Math.round(shown), 0)} °C`;
      const pwid = pillWidth(lab, sm ? 12 : 13);
      const px = clamp(x, G.r.x + pwid / 2 + 4, G.r.x + G.r.w - pwid / 2 - 4);
      g.save();
      g.globalAlpha *= ik;
      pill(px, G.hdrY, lab, liquid, 'center', sm ? 12 : 13);
      g.restore();
    }

    function particleColor(i: number): string {
      const b = box!;
      return speedPalette()[shadeOf(Math.hypot(b.vx[i]!, b.vy[i]!) * SPEED_SCALE)]!;
    }

    function drawParticles(G: StateGeo, ik: number): void {
      const g = surface.g;
      const b = box!;
      const theme = ctx.theme;
      const X = (x: number) => G.ix + x * G.s;
      const Y = (y: number) => G.iyB - y * G.s;
      const rad = R_DRAW * G.s;
      g.save();
      g.beginPath();
      g.rect(G.ix, G.iy0 - 2, G.iw, G.iyB - G.iy0 + 2);
      g.clip();
      // Bindungen: im Festkörper als zarte Federn, in der Flüssigkeit lockere Linien
      const bondA = ease2('bonds', p.bonds ? 1 : 0, 6);
      if (bondA > 0.01) {
        const col = theme.dark ? '#b8c7dc' : '#5a6b84';
        g.lineCap = 'round';
        g.strokeStyle = withAlpha(col, 0.55 * bondA);
        g.lineWidth = Math.max(1.2, G.s * 0.07);
        g.beginPath();
        for (let q = 0; q < bondPairs.length; q += 2) {
          const ia = b.owner[bondPairs[q]!]!;
          const ib = b.owner[bondPairs[q + 1]!]!;
          if (ia < 0 || ib < 0) continue;
          const a = Math.min(b.tether[ia]!, b.tether[ib]!);
          if (a < 0.5) continue;
          spring(g, X(b.x[ia]!), Y(b.y[ia]!), X(b.x[ib]!), Y(b.y[ib]!), rad);
        }
        g.stroke();
        // Flüssigkeit: Nachbarn in Reichweite der Anziehung
        g.strokeStyle = withAlpha(col, 0.3 * bondA);
        g.lineWidth = Math.max(1, G.s * 0.05);
        g.setLineDash([2, 3]);
        g.beginPath();
        for (let i = 0; i < b.n; i++) {
          if (b.role[i] !== LIQUID) continue;
          for (let j = i + 1; j < b.n; j++) {
            if (b.role[j] === GAS) continue;
            if (b.role[j] === SOLID && b.tether[j]! > 0.5) continue;
            const dx = b.x[j]! - b.x[i]!;
            const dy = b.y[j]! - b.y[i]!;
            const d2 = dx * dx + dy * dy;
            if (d2 > 1.25 * 1.25) continue;
            const d = Math.sqrt(d2);
            const ux = dx / d;
            const uy = dy / d;
            g.moveTo(X(b.x[i]! + ux * R_DRAW), Y(b.y[i]! + uy * R_DRAW));
            g.lineTo(X(b.x[j]! - ux * R_DRAW), Y(b.y[j]! - uy * R_DRAW));
          }
        }
        g.stroke();
        g.setLineDash([]);
      }
      // Teilchen (von hinten nach vorn: Gas zuletzt)
      const order = Array.from({ length: b.n }, (_, i) => i);
      for (const i of order) {
        const pop = intro.running ? ease.outBack(clamp((intro.t - 0.1 - (i / b.n) * 0.45) / 0.35, 0, 1)) : 1;
        drawBall(particleColor(i), X(b.x[i]!), Y(b.y[i]!), rad, pop);
      }
      // Spur des verfolgten Teilchens
      if (tracked >= 0 && trail.length > 1) {
        const col = green();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        for (let k = 1; k < trail.length; k++) {
          const a = k / trail.length;
          g.strokeStyle = withAlpha(col, 0.75 * a);
          g.lineWidth = 0.8 + 1.8 * a;
          g.beginPath();
          g.moveTo(X(trail[k - 1]![0]), Y(trail[k - 1]![1]));
          g.lineTo(X(trail[k]![0]), Y(trail[k]![1]));
          g.stroke();
        }
      }
      if (tracked >= 0 && tracked < b.n) {
        const tx = X(b.x[tracked]!);
        const ty = Y(b.y[tracked]!);
        g.strokeStyle = green();
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(tx, ty, rad + 4, 0, TAU);
        g.stroke();
        g.strokeStyle = withAlpha(theme.bg, 0.9);
        g.lineWidth = 1;
        g.beginPath();
        g.arc(tx, ty, rad + 6, 0, TAU);
        g.stroke();
      }
      // Geschwindigkeitspfeile
      const arrA = ease2('arr', p.arr ? 1 : 0, 6);
      if (arrA > 0.01) {
        g.save();
        g.globalAlpha *= arrA;
        const k = 0.13 * G.s;
        const col = theme.dark ? 'rgba(235,242,250,0.92)' : 'rgba(22,30,44,0.85)';
        for (let i = 0; i < b.n; i++) {
          const x = X(b.x[i]!);
          const y = Y(b.y[i]!);
          const vx = b.vx[i]!;
          const vy = b.vy[i]!;
          const v = Math.hypot(vx, vy);
          if (v * k < rad * 0.6) continue;
          const ux = vx / v;
          const uy = vy / v;
          arrowPx(x + ux * rad * 0.5, y - uy * rad * 0.5, x + vx * k, y - vy * k, col, Math.max(1.4, G.s * 0.06), Math.max(5, G.s * 0.22));
        }
        g.restore();
      }
      g.restore();
      void ik;
    }

    /** Kleine Feder zwischen zwei Kugeln (nur im freien Zwischenraum). */
    function spring(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, rad: number): void {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const d = Math.hypot(dx, dy);
      if (d < 2 * rad + 2) return;
      const ux = dx / d;
      const uy = dy / d;
      const a = rad * 0.92;
      const free = d - 2 * a;
      const sx = x0 + ux * a;
      const sy = y0 + uy * a;
      const amp = Math.min(2.6, free * 0.28);
      g.moveTo(sx, sy);
      const coils = 3;
      for (let k = 1; k <= coils * 2; k++) {
        const u = (k - 0.5) / (coils * 2);
        const side = k % 2 ? 1 : -1;
        g.lineTo(sx + ux * free * u - uy * amp * side, sy + uy * free * u + ux * amp * side);
      }
      g.lineTo(sx + ux * free, sy + uy * free);
    }

    function drawStateScene(r: Rect): StateGeo {
      const g = surface.g;
      const G = stateGeo(r);
      ensureBox(G);
      const ik = stage(0, 0.5);
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawRoom(r, r.y + r.h - G.tableY);
      const playing = ctx.clock.playing;
      const heatVis = ease2('heatVis', playing ? (p.heat === 'heat' ? 1 : p.heat === 'cool' ? -1 : 0) : (p.heat === 'heat' ? 0.55 : p.heat === 'cool' ? -0.55 : 0), 3);
      drawPlate(G, heatVis);
      drawCylinder(G, false, ik);
      drawParticles(G, ik);
      drawPiston(G, ik);
      drawCylinder(G, true, ik);
      const shown = intro.running ? SCALE_LO + (st.theta - SCALE_LO) * stage(0.2, 0.7, ease.inOutCubic) : ease2('thermo', st.theta, thermoDrag ? 30 : 7);
      drawThermo(G, shown, ik);
      drawChips(G, ik);
      // Hinweis auf dem Tisch
      const hint = tracked >= 0 ? ctx.t(G.sm ? 'hintOnS' : 'hintOn') : ctx.t(G.sm ? 'hintS' : 'hint');
      text(g, hint, r.x + r.w / 2, G.tableY + (r.y + r.h - G.tableY) / 2 + 1, { font: `600 ${G.sm ? 11 : 11.5}px ${ctx.theme.font}`, color: ctx.theme.dark ? 'rgba(236,224,206,0.85)' : 'rgba(58,38,18,0.82)' });
      // Grenze erreicht
      if (limitNote.running) {
        const u = limitNote.t;
        const a = u < 0.1 ? u / 0.1 : u > 0.8 ? (1 - u) / 0.2 : 1;
        g.save();
        g.globalAlpha *= a;
        pill(G.cx, G.iy0 + 10, limitText, orange(), 'center', G.sm ? 11 : 12);
        g.restore();
      }
      g.restore();
      return G;
    }

    /* ---------- Zeichnen: Temperatur-Zeit-Diagramm ---------- */
    function drawTChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 320 || R.h < 200;
      const fs = sm ? 11 : 12;
      const ty = R.y + (sm ? 17 : 20);
      text(g, ctx.t(R.w < 300 ? 'chartTS' : 'chartT'), R.x + 14, ty, { font: `700 ${fs + 1}px ${theme.font}`, color: theme.text, align: 'left' });
      const tShown = ease2('tnow', simT / 60, 10);
      text(g, `t = ${fmt.fixed(tShown, 1)} min`, R.x + R.w - 14, ty, { font: `700 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      const padL = sm ? 36 : 42;
      const A: Rect = { x: R.x + padL, y: R.y + (sm ? 48 : 54), w: R.w - padL - 14, h: R.h - (sm ? 48 : 54) - (sm ? 26 : 30) };
      if (A.w < 40 || A.h < 40) {
        g.restore();
        return;
      }
      const target = Math.max(2, niceStep(Math.max(2, (simT / 60) * 1.15) / 4) * Math.ceil(((simT / 60) * 1.15) / niceStep(Math.max(2, (simT / 60) * 1.15) / 4)));
      const tMax = ease2('tmax', target, 4);
      const X = (tm: number) => A.x + (tm / tMax) * A.w;
      const Y = (th: number) => A.y + A.h - ((th - SCALE_LO) / (SCALE_HI - SCALE_LO)) * A.h;
      // Gitter und Achsen
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      const dy = A.h < 150 ? 40 : 20;
      for (let th = SCALE_LO; th <= SCALE_HI; th += dy) {
        const yy = Math.round(Y(th)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      const xs = niceStep(tMax / (A.w < 220 ? 3 : 5));
      for (let tm = xs; tm < tMax + 1e-9; tm += xs) {
        const xx = Math.round(X(tm)) + 0.5;
        g.moveTo(xx, A.y);
        g.lineTo(xx, A.y + A.h);
      }
      g.stroke();
      const font = `${fs}px ${theme.font}`;
      for (let th = SCALE_LO; th <= SCALE_HI; th += dy) text(g, th < 0 ? `−${-th}` : String(th), A.x - 6, Y(th), { font, color: theme.muted, align: 'right' });
      for (let tm = 0; tm < tMax + 1e-9; tm += xs) {
        const xx = X(tm);
        if (xx > A.x + A.w - 26 && tm > 0) continue;
        text(g, n(tm, 1), xx, A.y + A.h + 11, { font, color: theme.muted });
      }
      text(g, ctx.t('axisT'), A.x + A.w, A.y + A.h + 11, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      text(g, ctx.t('axisTh'), A.x - padL + 14, A.y - 12, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'left' });
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.lineTo(A.x + A.w, A.y + A.h);
      g.stroke();
      // Schmelz- und Siedetemperatur
      for (const [th, col, key] of [
        [WATER.melt, teal(), 'meltLine'],
        [WATER.boil, purple(), 'boilLine'],
      ] as const) {
        const yy = Y(th);
        g.strokeStyle = withAlpha(col, 0.7);
        g.lineWidth = 1.2;
        g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
        g.stroke();
        g.setLineDash([]);
        // Beschriftung dort, wo die Kurve nicht verläuft (unten links, unten rechts, oben …)
        const lab = `${ctx.t(key)} ${th} °C`;
        const lf = `600 ${sm ? 10.5 : 11}px ${theme.font}`;
        g.font = lf;
        const lw = g.measureText(lab).width + 6;
        const pts = history.map((q) => [A.x + (q.t / 60 / tMax) * A.w, Y(q.th)] as const);
        pts.push([A.x + (simT / 60 / tMax) * A.w, Y(st.theta)]);
        const free = (x0: number, yc: number) => {
          for (let i = 0; i < pts.length; i++) {
            const [px, py] = pts[i]!;
            if (px > x0 - 8 && px < x0 + lw + 8 && Math.abs(py - yc) < 12) return false;
            const prev = pts[i - 1];
            // senkrechte Abschnitte der Kurve
            if (prev && px > x0 - 8 && px < x0 + lw + 8 && Math.min(py, prev[1]) < yc + 8 && Math.max(py, prev[1]) > yc - 8) return false;
          }
          return true;
        };
        const cands: [number, number][] = [
          [A.x + 6, yy + 9],
          [A.x + A.w - lw - 4, yy + 9],
          [A.x + 6, yy - 9],
          [A.x + A.w - lw - 4, yy - 9],
        ];
        const spot = cands.find(([x0, yc]) => free(x0, yc));
        const la = ease2(`${key}A`, spot ? 1 : 0, 6);
        if (spot || la > 0.01) {
          const lx = ease2(`${key}X`, spot ? spot[0] : (soft.get(`${key}X`) ?? A.x + 6), 7);
          const ly = ease2(`${key}Y`, spot ? spot[1] - yy : (soft.get(`${key}Y`) ?? 9), 7);
          g.save();
          g.globalAlpha *= la;
          haloText(lab, lx, yy + ly, lf, col, 'left');
          g.restore();
        }
      }
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 6, A.w + 6, A.h + 12);
      g.clip();
      // alte Kurve blendet aus
      if (fadeOld.running && oldHistory.length > 1) {
        g.globalAlpha *= 1 - fadeOld.value;
        const Xo = (tm: number) => A.x + (tm / oldRange) * A.w;
        g.strokeStyle = withAlpha(red(), 0.6);
        g.lineWidth = 2.4;
        g.beginPath();
        oldHistory.forEach((q, i) => (i ? g.lineTo(Xo(q.t / 60), Y(q.th)) : g.moveTo(Xo(q.t / 60), Y(q.th))));
        g.stroke();
        g.globalAlpha /= Math.max(1e-6, 1 - fadeOld.value);
      }
      // Plateaus als Bänder mit Beschriftung
      let k = 0;
      while (k < history.length) {
        const ph = history[k]!.ph;
        if (ph !== 'melting' && ph !== 'boiling') {
          k++;
          continue;
        }
        let e = k;
        while (e + 1 < history.length && history[e + 1]!.ph === ph) e++;
        const t0 = history[k]!.t / 60;
        const t1 = history[e]!.t / 60;
        const x0 = X(t0);
        const x1 = X(t1);
        const col = ph === 'melting' ? teal() : purple();
        const yy = Y(history[k]!.th);
        const id = `band${k}`;
        const a = ease2(id, x1 - x0 > 6 ? 1 : 0, 4);
        if (a > 0.01) {
          g.fillStyle = withAlpha(col, 0.12 * a);
          g.fillRect(x0, A.y, x1 - x0, A.h);
          const dirs = history.slice(k, e + 1).map((q) => q.dir);
          const net = dirs.reduce((s2, d) => s2 + d, 0);
          const verb = ph === 'melting' ? (net < 0 ? 'freezing' : 'melting') : net < 0 ? 'condensing' : 'boiling';
          const lab = ctx.t(verb);
          const wl = pillWidth(lab, sm ? 10.5 : 11);
          if (x1 - x0 > wl * 0.6) {
            g.save();
            g.globalAlpha *= a;
            const cxl = clamp((x0 + x1) / 2, A.x + wl / 2 + 2, A.x + A.w - wl / 2 - 2);
            pill(cxl, yy - (sm ? 30 : 34), lab, col, 'center', sm ? 10.5 : 11);
            g.restore();
          }
        }
        k = e + 1;
      }
      // Kurve
      if (history.length > 1) {
        g.save();
        g.shadowColor = withAlpha(red(), 0.35);
        g.shadowBlur = 6;
        g.strokeStyle = red();
        g.lineWidth = sm ? 2.6 : 3;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.beginPath();
        history.forEach((q, i) => (i ? g.lineTo(X(q.t / 60), Y(q.th)) : g.moveTo(X(q.t / 60), Y(q.th))));
        g.stroke();
        g.restore();
      }
      // aktueller Punkt
      const hx = X(simT / 60);
      const hy = Y(st.theta);
      const pulse = prefersReducedMotion() || !ctx.clock.playing ? 0 : 0.5 + 0.5 * Math.sin(performance.now() / 260);
      g.fillStyle = withAlpha(red(), 0.18 + 0.12 * pulse);
      g.beginPath();
      g.arc(hx, hy, 9 + 3 * pulse, 0, TAU);
      g.fill();
      g.fillStyle = red();
      g.beginPath();
      g.arc(hx, hy, 5, 0, TAU);
      g.fill();
      g.strokeStyle = theme.bg;
      g.lineWidth = 2;
      g.stroke();
      g.restore();
      if (simT < 0.5 && !ctx.clock.playing) {
        const msg = ctx.t(A.w < 250 ? 'emptyTS' : 'emptyT');
        g.font = `600 ${fs}px ${theme.font}`;
        const w = g.measureText(msg).width + 24;
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.92)';
        roundRect(g, A.x + A.w / 2 - w / 2, A.y + A.h * 0.12, w, 26, 13);
        g.fill();
        text(g, msg, A.x + A.w / 2, A.y + A.h * 0.12 + 13, { font: g.font, color: theme.muted });
      }
      g.restore();
    }

    /* ---------- Zeichnen: Histogramm ---------- */
    function drawHisto(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 320 || R.h < 160;
      const fs = sm ? 11 : 12;
      const ty = R.y + (sm ? 17 : 20);
      text(g, ctx.t(R.w < 300 ? 'histTitleS' : 'histTitle'), R.x + 14, ty, { font: `700 ${fs + 1}px ${theme.font}`, color: theme.text, align: 'left' });
      const mv = ease2('meanR', meanR, 4) * meanSpeed(st.theta);
      const meanLab = tr('mean', { v: n(Math.round(mv / 10) * 10, 0) });
      text(g, meanLab, R.x + R.w - 14, ty, { font: `700 ${fs}px ${theme.font}`, color: theme.text, align: 'right' });
      const A: Rect = { x: R.x + 16, y: R.y + (sm ? 36 : 42), w: R.w - 32, h: R.h - (sm ? 36 : 42) - (sm ? 32 : 36) };
      if (A.w < 40 || A.h < 24) {
        g.restore();
        return;
      }
      const pal = speedPalette();
      const mean = meanSpeed(st.theta);
      const curve = (v: number) => speedDensity(v, mean) * (V_MAX / BINS);
      let top = 0;
      for (let k = 0; k < BINS; k++) top = Math.max(top, histo[k]!);
      top = Math.max(top, curve(mean * 0.8));
      const yMax = ease2('hmax', Math.max(0.12, top * 1.18), 3);
      const X = (v: number) => A.x + (v / V_MAX) * A.w;
      const Y = (f: number) => A.y + A.h - (f / yMax) * A.h;
      const bw = A.w / BINS;
      const grow = stage(0.35, 0.5);
      for (let k = 0; k < BINS; k++) {
        const hv = ease2(`hb${k}`, histo[k]!, 6) * grow;
        const x = A.x + k * bw + 1.5;
        const y = Y(hv);
        const hh = A.y + A.h - y;
        if (hh < 0.5) continue;
        const col = pal[shadeOf((k + 0.5) * (V_MAX / BINS))]!;
        const gr = g.createLinearGradient(0, y, 0, A.y + A.h);
        gr.addColorStop(0, shade(col, 0.15));
        gr.addColorStop(1, shade(col, -0.12));
        g.fillStyle = gr;
        roundRect(g, x, y, bw - 3, hh, Math.min(4, hh / 2, (bw - 3) / 2));
        g.fill();
      }
      // Modellkurve
      g.strokeStyle = withAlpha(theme.text, 0.7);
      g.lineWidth = 1.6;
      g.setLineDash([4, 3]);
      g.beginPath();
      for (let i = 0; i <= 80; i++) {
        const v = (i / 80) * V_MAX;
        const y = Y(curve(v) * grow);
        if (i) g.lineTo(X(v), y);
        else g.moveTo(X(v), y);
      }
      g.stroke();
      g.setLineDash([]);
      // Mittelwert
      const mx = X(mv);
      g.strokeStyle = theme.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(mx, A.y + 4);
      g.lineTo(mx, A.y + A.h);
      g.stroke();
      g.fillStyle = theme.text;
      g.beginPath();
      g.moveTo(mx - 5, A.y);
      g.lineTo(mx + 5, A.y);
      g.lineTo(mx, A.y + 6);
      g.closePath();
      g.fill();
      haloText('Ø', mx + 6, A.y + 4, `700 ${fs}px ${theme.font}`, theme.text, 'left');
      // Legende Modellkurve
      g.strokeStyle = withAlpha(theme.text, 0.7);
      g.lineWidth = 1.6;
      g.setLineDash([4, 3]);
      const lx = A.x + A.w - 4;
      g.font = `600 ${fs - 0.5}px ${theme.font}`;
      const lw = g.measureText(ctx.t('model')).width;
      g.beginPath();
      g.moveTo(lx - lw - 26, A.y + 6);
      g.lineTo(lx - lw - 6, A.y + 6);
      g.stroke();
      g.setLineDash([]);
      haloText(ctx.t('model'), lx, A.y + 6, `600 ${fs - 0.5}px ${theme.font}`, theme.muted, 'right');
      // Farbband als x-Achse (gleiche Farben wie die Teilchen)
      const by = A.y + A.h + 3;
      const band = g.createLinearGradient(A.x, 0, A.x + A.w, 0);
      for (let i = 0; i <= 16; i++) {
        const v = (i / 16) * V_MAX;
        band.addColorStop(i / 16, pal[shadeOf(v)]!);
      }
      g.fillStyle = band;
      roundRect(g, A.x, by, A.w, 4, 2);
      g.fill();
      const font = `${fs}px ${theme.font}`;
      const stepV = A.w < 230 ? 800 : 400;
      for (let v = 0; v <= V_MAX; v += stepV) {
        const xx = X(v);
        if (v === V_MAX) continue;
        text(g, n(v, 0), xx, by + 14, { font, color: theme.muted, align: v === 0 ? 'left' : 'center' });
      }
      text(g, ctx.t('histAxis'), A.x + A.w, by + 14, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      g.restore();
    }

    /* ---------- Antippen und Ziehen ---------- */
    let lastStateGeo: StateGeo | null = null;
    function hitThermo(px: number, py: number): boolean {
      const G = lastStateGeo;
      if (!G || mode() !== 'state' || ctx.locked) return false;
      return Math.abs(px - G.tx) < 20 && py > G.tTop - 6 && py < G.tBulb + 16;
    }
    function hitParticle(px: number, py: number): number {
      const G = lastStateGeo;
      if (mode() === 'state') {
        if (!G || !box) return -1;
        if (px < G.ix || px > G.ix + G.iw || py < G.iy0 || py > G.iyB) return -1;
        let best = -1;
        let bd = (R_DRAW * G.s + 10) ** 2;
        for (let i = 0; i < box.n; i++) {
          const d = (G.ix + box.x[i]! * G.s - px) ** 2 + (G.iyB - box.y[i]! * G.s - py) ** 2;
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        return best;
      }
      return -1;
    }
    function inScene(px: number, py: number): boolean {
      const r = computeLayout().scene;
      return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }
    function thermoTo(py: number): void {
      const G = lastStateGeo;
      if (!G) return;
      const th = Math.round(clamp(yToTheta(G, py), THETA_MIN, THETA_MAX));
      if (th === p.T && Math.abs(st.theta - th) < 0.5) return;
      setTheta(th);
      ctx.set({ T: th });
      ctx.requestRender();
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitThermo(px, py) || (inScene(px, py) && (hitParticle(px, py) >= 0 || hitDiff(px, py) !== null || tracked >= 0 || dTracked !== null)),
      pointerDown: (q: { px: number; py: number }) => {
        if (hitThermo(q.px, q.py)) {
          thermoDrag = true;
          surface.setCursor('grabbing');
          thermoTo(q.py);
          return true;
        }
        if (mode() === 'state') {
          const i = hitParticle(q.px, q.py);
          tracked = i;
          trail.length = 0;
          ctx.requestRender();
          return true;
        }
        dTracked = hitDiff(q.px, q.py);
        dTrail.length = 0;
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (thermoDrag) thermoTo(q.py);
      },
      pointerUp: () => {
        thermoDrag = false;
        surface.setCursor(thermoHover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const th = q ? hitThermo(q.px, q.py) : false;
        const part = q && !th ? hitParticle(q.px, q.py) >= 0 || hitDiff(q.px, q.py) !== null : false;
        if (th !== thermoHover) {
          thermoHover = th;
          ctx.requestRender();
        }
        surface.setCursor(th ? 'grab' : part ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ================================================================== */
    /* Versuch 2: Diffusion                                                */
    /* ================================================================== */

    function makeBeaker(seed: number): Beaker {
      const lat = new SwapLattice(D_COLS, D_ROWS);
      return { lat, busy: new Float64Array(lat.n), swaps: [], acc: 0, clock: 0, inkFade: new Float64Array(lat.n), rand: seededRandom(seed) };
    }
    const beakers: [Beaker, Beaker] = [makeBeaker(7), makeBeaker(8)];
    /** Zitterbewegung: Phasen und Frequenzen je Teilchen (in beiden Gläsern gleich). */
    const jit = (() => {
      const r = seededRandom(99);
      const nn = D_COLS * D_ROWS;
      const a = new Float64Array(nn * 6);
      for (let i = 0; i < nn * 6; i++) a[i] = i % 6 < 4 ? r() * TAU : 1.3 + r() * 1.3;
      return a;
    })();
    let dropped = false;
    let tD = 0;
    let mixHist: { t: number; m0: number; m1: number }[] = [];
    const dropAnim = new Tween(1500, ease.linear);
    let impacted = true;
    let autoDrop = false;
    let dTracked: [number, number] | null = null;
    const dTrail: [number, number][] = [];
    const t90: [number | null, number | null] = [null, null];

    const dropPoint = (lat: SwapLattice): [number, number] => [lat.width / 2, lat.height - 1.4];

    function startDrop(): void {
      for (const b of beakers) {
        b.lat.ink.fill(0);
        b.lat.field.fill(0);
        b.inkFade.fill(0);
      }
      dropped = false;
      impacted = false;
      tD = 0;
      mixHist = [];
      t90[0] = t90[1] = null;
      dropAnim.play();
      if (!dropAnim.running) impact();
    }

    function impact(): void {
      impacted = true;
      for (const b of beakers) {
        const [cx, cy] = dropPoint(b.lat);
        b.lat.drop(cx, cy, D_INK);
      }
      dropped = true;
      tD = 0;
      mixHist = [{ t: 0, m0: 0, m1: 0 }];
    }

    function resetDiff(): void {
      for (const [k, b] of beakers.entries()) {
        const fresh = makeBeaker(7 + k);
        b.lat = fresh.lat;
        b.busy = fresh.busy;
        b.swaps = [];
        b.acc = 0;
        b.clock = 0;
        b.inkFade = fresh.inkFade;
        b.rand = fresh.rand;
      }
      dropped = false;
      impacted = true;
      tD = 0;
      mixHist = [];
      t90[0] = t90[1] = null;
      dTracked = null;
      dTrail.length = 0;
    }

    const thetaOf = (k: number) => (k === 0 ? p.tc : p.tw);
    const hopDur = (theta: number) => clamp(0.5 / (swapRate(theta) * 5.3), 0.07, 0.26);

    function tickDiff(dt: number): void {
      dt = Math.min(dt, 0.05);
      if (!impacted && dropAnim.t >= 0.55) impact();
      if (autoDrop && !intro.running && !dropAnim.running && !dropped) {
        autoDrop = false;
        startDrop();
      }
      for (const [k, b] of beakers.entries()) {
        const th = thetaOf(k);
        const rate = swapRate(th);
        b.clock += dt;
        const now = b.clock;
        b.swaps = b.swaps.filter((s) => now < s.t0 + s.dur);
        if (dropped) b.lat.evolve(dt, rate);
        b.acc += rate * b.lat.bondCount * dt;
        const dur = hopDur(th);
        while (b.acc >= 1) {
          b.acc -= 1;
          for (let tries = 0; tries < 8; tries++) {
            const q = Math.floor(b.rand() * b.lat.bondCount);
            const k1 = b.lat.bonds[2 * q]!;
            const k2 = b.lat.bonds[2 * q + 1]!;
            const i1 = b.lat.at[k1]!;
            const i2 = b.lat.at[k2]!;
            if (b.busy[i1]! > now || b.busy[i2]! > now) continue;
            b.lat.swap(q);
            b.busy[i1] = b.busy[i2] = now + dur;
            const side = b.rand() < 0.5 ? 1 : -1;
            b.swaps.push({ i: i1, from: k1, to: k2, t0: now, dur, side }, { i: i2, from: k2, to: k1, t0: now, dur, side });
            break;
          }
        }
        // Tinte färbt sich nach dem Aufprall von der Mitte aus ein
        if (dropped) {
          const [cx, cy] = dropPoint(b.lat);
          for (let i = 0; i < b.lat.n; i++) {
            if (!b.lat.ink[i]) continue;
            const kk = b.lat.where[i]!;
            const d = Math.hypot(b.lat.px[kk]! - cx, b.lat.py[kk]! - cy);
            if (tD > d * 0.07) b.inkFade[i] = Math.min(1, b.inkFade[i]! + dt / 0.35);
          }
        }
      }
      if (dropped) {
        tD += dt;
        const m0 = beakers[0].lat.mixing();
        const m1 = beakers[1].lat.mixing();
        const last = mixHist[mixHist.length - 1];
        if (!last || tD - last.t >= 0.1) mixHist.push({ t: tD, m0, m1 });
        if (t90[0] === null && m0 >= 0.9) t90[0] = tD;
        if (t90[1] === null && m1 >= 0.9) t90[1] = tD;
      }
      if (dTracked) {
        const pos = diffPos(dTracked[0], dTracked[1]);
        if (pos) {
          dTrail.push(pos);
          if (dTrail.length > 150) dTrail.shift();
        }
      }
      updateNow();
    }

    interface DiffGeo {
      r: Rect;
      sm: boolean;
      tableY: number;
      /** je Glas: Innenraum links, Wasseroberfläche oben, Boden, Maßstab. */
      cx: [number, number];
      ix: [number, number];
      iw: number;
      top: number;
      water: number;
      bottom: number;
      s: number;
      glassTop: number;
    }

    function diffGeo(r: Rect): DiffGeo {
      const sm = r.w < 440;
      const tableH = sm ? 24 : 30;
      const tableY = r.y + r.h - tableH;
      const lat = beakers[0].lat;
      const room = sm ? 52 : 64;
      const half = r.w / 2;
      const availH = tableY - r.y - room - 20;
      const s = Math.min((half * (sm ? 0.8 : 0.84)) / lat.width, availH / (lat.height * 1.24));
      const iw = lat.width * s;
      const bottom = tableY - (sm ? 6 : 8);
      const water = bottom - lat.height * s;
      const glassTop = bottom - lat.height * s * 1.24;
      const cx: [number, number] = [r.x + half * 0.5 + half * 0.03, r.x + half * 1.5 - half * 0.03];
      return { r, sm, tableY, cx, ix: [cx[0] - iw / 2, cx[1] - iw / 2], iw, top: glassTop, water, bottom, s, glassTop };
    }

    let lastDiffGeo: DiffGeo | null = null;

    /** Lage eines Teilchens in Pixeln (Gitterplatz + Zittern + Platzwechsel). */
    function diffPos(k: number, i: number): [number, number] | null {
      const D = lastDiffGeo;
      if (!D) return null;
      const b = beakers[k]!;
      const lat = b.lat;
      const th = thetaOf(k);
      const amp = 0.075 * Math.sqrt(kelvin(th) / kelvin(20));
      const tt = b.clock * Math.sqrt(kelvin(th) / kelvin(20));
      const j = i * 6;
      let x = lat.px[lat.where[i]!]!;
      let y = lat.py[lat.where[i]!]!;
      const sw = b.swaps.find((s) => s.i === i);
      if (sw) {
        const u = ease.inOutCubic(clamp((b.clock - sw.t0) / sw.dur, 0, 1));
        const ax = lat.px[sw.from]!;
        const ay = lat.py[sw.from]!;
        const bx = lat.px[sw.to]!;
        const by = lat.py[sw.to]!;
        const off = Math.sin(Math.PI * u) * 0.3 * sw.side;
        const dx = bx - ax;
        const dy = by - ay;
        const d = Math.hypot(dx, dy) || 1;
        x = ax + dx * u - (dy / d) * off;
        y = ay + dy * u + (dx / d) * off;
      }
      x += amp * (Math.sin(TAU * jit[j + 4]! * tt + jit[j]!) + 0.6 * Math.sin(TAU * jit[j + 5]! * 1.7 * tt + jit[j + 1]!)) / 1.6;
      y += amp * (Math.sin(TAU * jit[j + 5]! * tt + jit[j + 2]!) + 0.6 * Math.sin(TAU * jit[j + 4]! * 1.6 * tt + jit[j + 3]!)) / 1.6;
      return [D.ix[k]! + x * D.s, D.bottom - y * D.s];
    }

    /** Tastatur wie Antippen: ein Teilchen verfolgen (bzw. im Diffusionsversuch je Glas eines). */
    function updateKeyTargets(): void {
      const de = ctx.lang === 'de';
      if (mode() === 'state') {
        const n = box?.n ?? 0;
        ctx.setKeyTargets([
          {
            id: 'follow',
            label: tracked >= 0 ? (de ? 'Ein anderes Teilchen verfolgen' : 'Follow another particle') : de ? 'Ein Teilchen verfolgen' : 'Follow a particle',
            disabled: n === 0,
            activate: () => {
              tracked = n ? (tracked + 1) % n : -1;
              trail.length = 0;
              ctx.requestRender();
            },
          },
          {
            id: 'stop',
            label: de ? 'Verfolgen beenden' : 'Stop following',
            disabled: tracked < 0,
            activate: () => {
              tracked = -1;
              trail.length = 0;
              ctx.requestRender();
            },
          },
        ]);
        return;
      }
      ctx.setKeyTargets(
        ([0, 1] as const).map((k) => ({
          id: `glass${k}`,
          label: de ? `Ein Teilchen im ${ctx.t(k === 0 ? 'cold' : 'warm')}en Glas verfolgen` : `Follow a particle in the ${ctx.t(k === 0 ? 'cold' : 'warm')} glass`,
          disabled: beakers[k].lat.n === 0,
          activate: () => {
            const i = dTracked && dTracked[0] === k ? (dTracked[1] + 1) % beakers[k].lat.n : 0;
            dTracked = [k, i];
            dTrail.length = 0;
            ctx.requestRender();
          },
        })),
      );
    }

    function hitDiff(px: number, py: number): [number, number] | null {
      const D = lastDiffGeo;
      if (mode() !== 'diff' || !D) return null;
      for (const k of [0, 1] as const) {
        if (px < D.ix[k] || px > D.ix[k] + D.iw || py < D.water - 4 || py > D.bottom) continue;
        let best = -1;
        let bd = (R_DRAW * D.s + 8) ** 2;
        for (let i = 0; i < beakers[k].lat.n; i++) {
          const q = diffPos(k, i)!;
          const d = (q[0] - px) ** 2 + (q[1] - py) ** 2;
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        if (best >= 0) return [k, best];
      }
      return null;
    }

    function drawBeaker(D: DiffGeo, k: 0 | 1, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const b = beakers[k];
      const lat = b.lat;
      const th = ease2(`dth${k}`, thetaOf(k), 5);
      const warmth = clamp((th - 20) / 70, 0, 1);
      const coldness = clamp((25 - th) / 24, 0, 1);
      const x0 = D.ix[k] - (D.sm ? 5 : 7);
      const w = D.iw + 2 * (D.sm ? 5 : 7);
      const top = D.glassTop;
      const bot = D.bottom + (D.sm ? 5 : 7);
      const pop = stage(0.05 + k * 0.08, 0.5);
      g.save();
      g.globalAlpha *= pop;
      g.translate(0, (1 - pop) * 12);
      // Glas innen
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.18)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      const inner = g.createLinearGradient(0, top, 0, bot);
      inner.addColorStop(0, dark ? 'rgba(30,44,64,0.5)' : 'rgba(238,244,250,0.9)');
      inner.addColorStop(1, dark ? 'rgba(22,32,48,0.75)' : 'rgba(222,232,243,0.95)');
      g.fillStyle = inner;
      roundRect(g, x0, top, w, bot - top, 8);
      g.fill();
      g.restore();
      // Temperatur als zarter Farbschimmer (kalt bläulich, warm orange)
      const tint = g.createLinearGradient(0, D.water, 0, D.bottom);
      const tc = k === 0 ? blue() : orange();
      const ta = k === 0 ? 0.1 + 0.12 * coldness : 0.08 + 0.14 * warmth;
      tint.addColorStop(0, withAlpha(tc, ta * 0.6));
      tint.addColorStop(1, withAlpha(tc, ta));
      g.fillStyle = tint;
      g.fillRect(D.ix[k], D.water, D.iw, D.bottom - D.water);
      // Teilchen
      g.save();
      g.beginPath();
      g.rect(D.ix[k] - 2, D.water - D.s * 0.6, D.iw + 4, D.bottom - D.water + D.s * 0.6);
      g.clip();
      const rad = R_DRAW * D.s;
      const water = dark ? mixColor(blue(), '#7f90a6', 0.62) : mixColor(blue(), '#dbe7f5', 0.62);
      const ink = dark ? mixColor(purple(), '#e040fb', 0.35) : purple();
      // Spur
      if (dTracked && dTracked[0] === k && dTrail.length > 1) {
        g.lineCap = 'round';
        for (let q = 1; q < dTrail.length; q++) {
          const a = q / dTrail.length;
          g.strokeStyle = withAlpha(green(), 0.75 * a);
          g.lineWidth = 1 + 2 * a;
          g.beginPath();
          g.moveTo(dTrail[q - 1]![0], dTrail[q - 1]![1]);
          g.lineTo(dTrail[q]![0], dTrail[q]![1]);
          g.stroke();
        }
      }
      for (let i = 0; i < lat.n; i++) {
        const q = diffPos(k, i)!;
        const f = b.inkFade[i]!;
        const ipop = intro.running ? ease.outBack(clamp((intro.t - 0.12 - (lat.where[i]! / lat.n) * 0.4) / 0.35, 0, 1)) : 1;
        if (f > 0.02) {
          const colorKey = Math.round(f * 6) / 6;
          drawBall(colorKey >= 1 ? ink : mixColor(water, ink, colorKey), q[0], q[1], rad, ipop);
        } else drawBall(water, q[0], q[1], rad, ipop);
      }
      if (dTracked && dTracked[0] === k) {
        const q = diffPos(k, dTracked[1])!;
        g.strokeStyle = green();
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(q[0], q[1], rad + 4, 0, TAU);
        g.stroke();
      }
      g.restore();
      // Wasseroberfläche
      g.strokeStyle = dark ? 'rgba(170,205,240,0.45)' : 'rgba(70,120,180,0.35)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(D.ix[k], D.water - D.s * 0.55);
      g.lineTo(D.ix[k] + D.iw, D.water - D.s * 0.55);
      g.stroke();
      const beakerImg = ctx.images.get('beaker');
      if (beakerImg) {
        // Foto: Außenkanten der Wände auf x0 … x0 + w, Rand auf top, Boden auf bot; der Ausguss
        // zeigt nach außen (rechtes Glas gespiegelt), damit sich die Gläser nicht berühren
        const B = BEAKER_IMG;
        const sx = w / (B.right - B.left);
        const sy = (bot - top) / (B.bottom - B.top);
        g.save();
        if (k === 1) {
          g.translate(2 * x0 + w, 0);
          g.scale(-1, 1);
        }
        g.drawImage(beakerImg, x0 - B.left * sx, top - B.top * sy, B.w * sx, B.h * sy);
        g.restore();
      } else {
        // Glaswand vorn
        const gw = D.sm ? 5 : 7;
        for (const [xa, left] of [
          [x0, true],
          [x0 + w - gw, false],
        ] as const) {
          const gr = g.createLinearGradient(xa, 0, xa + gw, 0);
          gr.addColorStop(0, dark ? 'rgba(170,200,235,0.3)' : 'rgba(150,175,205,0.55)');
          gr.addColorStop(left ? 0.35 : 0.65, dark ? 'rgba(220,235,255,0.42)' : 'rgba(255,255,255,0.85)');
          gr.addColorStop(1, dark ? 'rgba(150,180,220,0.22)' : 'rgba(140,165,195,0.5)');
          g.fillStyle = gr;
          g.fillRect(xa, top, gw, bot - top);
        }
        const bg = g.createLinearGradient(0, D.bottom, 0, bot);
        bg.addColorStop(0, dark ? 'rgba(190,215,245,0.35)' : 'rgba(255,255,255,0.8)');
        bg.addColorStop(1, dark ? 'rgba(120,150,190,0.3)' : 'rgba(150,175,205,0.6)');
        g.fillStyle = bg;
        roundRect(g, x0, D.bottom, w, bot - D.bottom, 4);
        g.fill();
        // Ausguss und Rand
        g.fillStyle = dark ? 'rgba(210,228,250,0.5)' : 'rgba(255,255,255,0.95)';
        roundRect(g, x0 - 3, top - 2, gw + 5, 5, 2);
        g.fill();
        roundRect(g, x0 + w - gw - 2, top - 2, gw + 5, 5, 2);
        g.fill();
        // Lichtreflex
        const sh = g.createLinearGradient(x0, 0, x0 + w, 0);
        sh.addColorStop(0, 'rgba(255,255,255,0)');
        sh.addColorStop(0.1, dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)');
        sh.addColorStop(0.18, 'rgba(255,255,255,0)');
        g.fillStyle = sh;
        g.fillRect(x0, top, w, bot - top);
      }
      // Dampfschwaden über dem warmen Glas
      if (k === 1 && warmth > 0.3) {
        const a = (warmth - 0.3) / 0.7;
        const tt = b.clock;
        g.lineCap = 'round';
        for (let q = 0; q < 3; q++) {
          const sx = D.cx[k] + (q - 1) * D.iw * 0.22;
          const ph = (tt * 0.35 + q * 0.33) % 1;
          g.strokeStyle = dark ? `rgba(220,230,245,${0.22 * a * Math.sin(Math.PI * ph)})` : `rgba(140,155,175,${0.3 * a * Math.sin(Math.PI * ph)})`;
          g.lineWidth = D.sm ? 3 : 4;
          g.beginPath();
          const y0 = D.water - D.s * 1.2 - ph * D.s * 2.2;
          for (let s2 = 0; s2 <= 10; s2++) {
            const yy = y0 - s2 * D.s * 0.28;
            const xx = sx + Math.sin(s2 * 0.7 + tt * 1.4 + q) * D.s * 0.35;
            if (s2) g.lineTo(xx, yy);
            else g.moveTo(xx, yy);
          }
          g.stroke();
        }
      }
      g.restore();
      // Beschriftung oben
      const lab = `${ctx.t(k === 0 ? 'cold' : 'warm')} · ${n(Math.round(th), 0)} °C`;
      g.save();
      g.globalAlpha *= ik;
      const pa = dropAnim.running ? 1 - Math.sin(Math.PI * clamp(dropAnim.t * 1.1, 0, 1)) * 0.85 : 1;
      g.globalAlpha *= pa;
      pill(D.cx[k], Math.max(D.r.y + 8, D.glassTop - (D.sm ? 56 : 66)), lab, k === 0 ? blue() : red(), 'center', D.sm ? 12 : 13);
      g.restore();
    }

    /** Becherglas-Foto (Bildpixel): Außenkanten der Wände, Oberkante des Rands, Unterkante des Bodens. */
    const BEAKER_IMG = { w: 816, h: 1000, left: 65, right: 802, top: 2, bottom: 998 };
    /** Pipetten-Foto: Mitte, Glasröhre (oben/unten) und ihre Breite (Bildpixel). */
    const PIPETTE_SRC = { cx: 107.5, tubeA: 420, tubeB: 1170, tubeW: 129 };
    function drawPipettes(D: DiffGeo): void {
      if (!dropAnim.running) return;
      const g = surface.g;
      const dark = ctx.theme.dark;
      const u = dropAnim.t;
      const appear = clamp(u / 0.18, 0, 1);
      const leave = clamp((u - 0.7) / 0.3, 0, 1);
      const a = ease.outCubic(appear) * (1 - leave);
      for (const k of [0, 1] as const) {
        const cx = D.cx[k];
        const tip = D.glassTop + (D.water - D.glassTop) * 0.35 - (1 - ease.outCubic(appear)) * 18 - leave * 24;
        const len = D.sm ? 46 : 62;
        const tw = D.sm ? 6 : 8;
        g.save();
        g.globalAlpha *= a;
        const photo = ctx.images.get('pipette');
        const fill = 1 - clamp((u - 0.25) / 0.2, 0, 1);
        if (photo) {
          // Foto (leer): Spitze unten auf dem Tropfpunkt, die Tinte liegt gezeichnet darüber
          const P = PIPETTE_SRC;
          const k = (len + (D.sm ? 14 : 18)) / photo.height;
          const pw = photo.width * k;
          const ph = photo.height * k;
          const py = tip - ph;
          g.drawImage(scaledSprite(photo, pw, ph, surface.dpr), cx - P.cx * k, py, pw, ph);
          const inkW = P.tubeW * k * 0.62;
          const inkBot = py + P.tubeB * k;
          const inkH = (P.tubeB - P.tubeA) * k * 0.45 * fill;
          g.fillStyle = purple();
          roundRect(g, cx - inkW / 2, inkBot - inkH, inkW, inkH, Math.min(inkW / 2, inkH / 2));
          g.fill();
        } else {
          // Glasröhrchen
          g.fillStyle = dark ? 'rgba(200,220,245,0.35)' : 'rgba(255,255,255,0.9)';
          g.strokeStyle = dark ? 'rgba(200,220,245,0.6)' : 'rgba(110,130,160,0.6)';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(cx - 1.5, tip);
          g.lineTo(cx - tw / 2, tip - len * 0.35);
          g.lineTo(cx - tw / 2, tip - len);
          g.lineTo(cx + tw / 2, tip - len);
          g.lineTo(cx + tw / 2, tip - len * 0.35);
          g.lineTo(cx + 1.5, tip);
          g.closePath();
          g.fill();
          g.stroke();
          // Tinte im Röhrchen
          g.fillStyle = purple();
          g.fillRect(cx - tw / 2 + 1.5, tip - len * 0.35 - len * 0.3 * fill, tw - 3, len * 0.3 * fill);
          // Gummihütchen
          const bulb = g.createLinearGradient(cx - tw, 0, cx + tw, 0);
          bulb.addColorStop(0, '#8a2b2b');
          bulb.addColorStop(0.4, '#d65a4a');
          bulb.addColorStop(1, '#7a2222');
          g.fillStyle = bulb;
          roundRect(g, cx - tw * 0.85, tip - len - (D.sm ? 14 : 18), tw * 1.7, D.sm ? 16 : 20, tw * 0.8);
          g.fill();
        }
        g.restore();
        // fallender Tropfen
        if (u > 0.3 && u < 0.56) {
          const f = (u - 0.3) / 0.26;
          const y = tip + (D.water - D.s * 0.5 - tip) * f * f;
          const rr = D.sm ? 3.5 : 4.5;
          g.fillStyle = purple();
          g.beginPath();
          g.moveTo(cx, y - rr * 1.8);
          g.quadraticCurveTo(cx + rr, y - rr * 0.2, cx, y + rr);
          g.quadraticCurveTo(cx - rr, y - rr * 0.2, cx, y - rr * 1.8);
          g.fill();
        }
        // Aufprall: Ringwelle
        if (u >= 0.55 && u < 1) {
          const f = (u - 0.55) / 0.45;
          g.strokeStyle = withAlpha(purple(), 0.6 * (1 - f));
          g.lineWidth = 2;
          g.beginPath();
          g.ellipse(cx, D.water - D.s * 0.55, 4 + f * D.iw * 0.3, 2 + f * 4, 0, 0, TAU);
          g.stroke();
        }
      }
    }

    function drawDiffScene(r: Rect): DiffGeo {
      const g = surface.g;
      const D = diffGeo(r);
      lastDiffGeo = D;
      const ik = stage(0, 0.5);
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawRoom(r, r.y + r.h - D.tableY);
      drawBeaker(D, 0, ik);
      drawBeaker(D, 1, ik);
      drawPipettes(D);
      const hint = ctx.t(D.sm ? 'hintDS' : 'hintD');
      text(g, hint, r.x + r.w / 2, D.tableY + (r.y + r.h - D.tableY) / 2 + 1, { font: `600 ${D.sm ? 11 : 11.5}px ${ctx.theme.font}`, color: ctx.theme.dark ? 'rgba(236,224,206,0.85)' : 'rgba(58,38,18,0.82)' });
      g.restore();
      return D;
    }

    function drawMixChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 320 || R.h < 200;
      const fs = sm ? 11 : 12;
      const ty = R.y + (sm ? 17 : 20);
      text(g, ctx.t('mixTitle'), R.x + 14, ty, { font: `700 ${fs + 1}px ${theme.font}`, color: theme.text, align: 'left' });
      // Legende
      let lx = R.x + R.w - 14;
      for (const [lab, col] of [
        [ctx.t('warm'), red()],
        [ctx.t('cold'), blue()],
      ] as const) {
        g.font = `700 ${fs}px ${theme.font}`;
        const w = g.measureText(lab).width;
        text(g, lab, lx, ty, { font: g.font, color: col, align: 'right' });
        g.strokeStyle = col;
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(lx - w - 22, ty);
        g.lineTo(lx - w - 6, ty);
        g.stroke();
        lx -= w + 34;
      }
      const padL = sm ? 36 : 42;
      const A: Rect = { x: R.x + padL, y: R.y + (sm ? 48 : 54), w: R.w - padL - 14, h: R.h - (sm ? 48 : 54) - (sm ? 26 : 30) };
      if (A.w < 40 || A.h < 40) {
        g.restore();
        return;
      }
      const target = Math.max(20, niceStep(Math.max(20, tD * 1.15) / 4) * Math.ceil((tD * 1.15) / niceStep(Math.max(20, tD * 1.15) / 4)));
      const tMax = ease2('dtmax', target, 4);
      const X = (t: number) => A.x + (t / tMax) * A.w;
      const Y = (m: number) => A.y + A.h - m * A.h;
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let m = 0; m <= 1.0001; m += 0.25) {
        const yy = Math.round(Y(m)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      const xs = niceStep(tMax / (A.w < 220 ? 3 : 5));
      for (let t = xs; t < tMax + 1e-9; t += xs) {
        const xx = Math.round(X(t)) + 0.5;
        g.moveTo(xx, A.y);
        g.lineTo(xx, A.y + A.h);
      }
      g.stroke();
      const font = `${fs}px ${theme.font}`;
      for (let m = 0; m <= 1.0001; m += A.h < 120 ? 0.5 : 0.25) text(g, n(m * 100, 0), A.x - 6, Y(m), { font, color: theme.muted, align: 'right' });
      for (let t = 0; t < tMax + 1e-9; t += xs) {
        const xx = X(t);
        if (xx > A.x + A.w - 24 && t > 0) continue;
        text(g, n(t, 0), xx, A.y + A.h + 11, { font, color: theme.muted });
      }
      text(g, ctx.t('axisS'), A.x + A.w, A.y + A.h + 11, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      text(g, ctx.t('mixAxis'), A.x - padL + 14, A.y - 12, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'left' });
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.lineTo(A.x + A.w, A.y + A.h);
      g.stroke();
      // 90-%-Linie
      g.strokeStyle = withAlpha(theme.muted, 0.7);
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(A.x, Y(0.9));
      g.lineTo(A.x + A.w, Y(0.9));
      g.stroke();
      g.setLineDash([]);
      haloText('90 %', A.x + 6, Y(0.9) + 9, `600 ${sm ? 10.5 : 11}px ${theme.font}`, theme.muted, 'left');
      if (mixHist.length > 1) {
        for (const [key, col] of [
          ['m0', blue()],
          ['m1', red()],
        ] as const) {
          g.save();
          g.shadowColor = withAlpha(col, 0.35);
          g.shadowBlur = 6;
          g.strokeStyle = col;
          g.lineWidth = sm ? 2.6 : 3;
          g.lineJoin = 'round';
          g.beginPath();
          mixHist.forEach((q, i) => (i ? g.lineTo(X(q.t), Y(q[key])) : g.moveTo(X(q.t), Y(q[key]))));
          g.stroke();
          g.restore();
          const last = mixHist[mixHist.length - 1]!;
          g.fillStyle = col;
          g.beginPath();
          g.arc(X(last.t), Y(last[key]), 4.5, 0, TAU);
          g.fill();
          g.strokeStyle = theme.bg;
          g.lineWidth = 2;
          g.stroke();
        }
        // Markierung beim Erreichen von 90 %
        for (const k of [0, 1] as const) {
          const t = t90[k];
          if (t === null) continue;
          const col = k === 0 ? blue() : red();
          const a = ease2(`t90${k}`, 1, 5);
          g.save();
          g.globalAlpha *= a;
          g.strokeStyle = withAlpha(col, 0.6);
          g.setLineDash([3, 3]);
          g.beginPath();
          g.moveTo(X(t), Y(0.9));
          g.lineTo(X(t), A.y + A.h);
          g.stroke();
          g.setLineDash([]);
          const lab = `${n(Math.round(t), 0)} s`;
          const wl = pillWidth(lab, sm ? 10.5 : 11);
          pill(clamp(X(t), A.x + wl / 2, A.x + A.w - wl / 2), A.y + A.h - (sm ? 24 : 28) - (k === 0 ? 0 : sm ? 24 : 27), lab, col, 'center', sm ? 10.5 : 11);
          g.restore();
        }
      } else {
        const msg = ctx.t(A.w < 250 ? 'emptyMixS' : 'emptyMix');
        g.font = `600 ${fs}px ${theme.font}`;
        const w = g.measureText(msg).width + 24;
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.92)';
        roundRect(g, A.x + A.w / 2 - w / 2, A.y + A.h * 0.4, w, 26, 13);
        g.fill();
        text(g, msg, A.x + A.w / 2, A.y + A.h * 0.4 + 13, { font: g.font, color: theme.muted });
      }
      g.restore();
    }

    function drawCompare(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 320 || R.h < 150;
      const fs = sm ? 11 : 12;
      text(g, ctx.t('compare'), R.x + 14, R.y + (sm ? 17 : 20), { font: `700 ${fs + 1}px ${theme.font}`, color: theme.text, align: 'left' });
      const last = mixHist[mixHist.length - 1];
      const top = R.y + (sm ? 30 : 36);
      const avail = R.y + R.h - top - (sm ? 36 : 44);
      const rad = clamp(Math.min(avail / 2, R.w / 8), 16, 46);
      for (const k of [0, 1] as const) {
        const cx = R.x + R.w * (k === 0 ? 0.27 : 0.73);
        const cy = top + rad + 2;
        const col = k === 0 ? blue() : red();
        const m = ease2(`ring${k}`, dropped && last ? (k === 0 ? last.m0 : last.m1) : 0, 6);
        g.strokeStyle = withAlpha(theme.muted, 0.18);
        g.lineWidth = Math.max(6, rad * 0.24);
        g.beginPath();
        g.arc(cx, cy, rad, 0, TAU);
        g.stroke();
        if (m > 0.003) {
          g.strokeStyle = col;
          g.lineCap = 'round';
          g.beginPath();
          g.arc(cx, cy, rad, -Math.PI / 2, -Math.PI / 2 + TAU * m);
          g.stroke();
        }
        text(g, `${n(Math.round(m * 100), 0)} %`, cx, cy + 1, { font: `800 ${clamp(rad * 0.48, 12, 20)}px ${theme.font}`, color: theme.text });
        const th = thetaOf(k);
        const y1 = cy + rad + (sm ? 14 : 17);
        text(g, `${ctx.t(k === 0 ? 'cold' : 'warm')} · ${n(th, 0)} °C`, cx, y1, { font: `700 ${fs}px ${theme.font}`, color: col });
        const t = t90[k];
        const sub = t !== null ? `90 % ${tr('after', { t: n(Math.round(t), 0) })}` : dropped ? ctx.t(R.w < 300 ? 'pendingS' : 'pending') : '';
        if (sub && y1 + 16 < R.y + R.h - 4) text(g, sub, cx, y1 + (sm ? 15 : 17), { font: `600 ${fs - 0.5}px ${theme.font}`, color: theme.muted });
      }
      g.restore();
    }

    /* ================================================================== */
    /* Ergebnisse                                                          */
    /* ================================================================== */
    function updateNow(): void {
      let s: string;
      if (mode() === 'state') {
        // Energie seit Beginn des Diagramms (Summe aus Heizen und Kühlen)
        const q = H - (history[0] ? enthalpy(history[0].th) : H);
        s =
          p.heat === 'off' && Math.abs(q) < 1
            ? tr('nowStateOff', { t: fmt.fixed(simT / 60, 1), th: n(Math.round(st.theta), 0) })
            : tr(q < 0 ? 'nowStateCool' : 'nowState', { t: fmt.fixed(simT / 60, 1), th: n(Math.round(st.theta), 0), q: n(Math.round(Math.abs(q) / 1000), 0) });
      } else s = dropped ? tr('nowDiff', { t: fmt.fixed(tD, 1) }) : ctx.t('nowDiffNone');
      if (s !== lastNow) {
        lastNow = s;
        ctx.readout('now', s);
      }
      if (mode() === 'state') updatePhaseReadouts();
      else updateMixReadout();
    }

    let lastPhase = '';
    function updatePhaseReadouts(): void {
      const verbs: Record<string, string> = { melting: dir < 0 ? 'Erstarren' : 'Schmelzen', boiling: dir < 0 ? 'Kondensieren' : 'Sieden' };
      const verbsEn: Record<string, string> = { melting: dir < 0 ? 'freezing' : 'melting', boiling: dir < 0 ? 'condensing' : 'boiling' };
      const verb = (ctx.lang === 'de' ? verbs : verbsEn)[st.phase] ?? '';
      const what = ctx.t(dir > 0 ? 'whatIn' : dir < 0 ? 'whatOut' : 'whatOff');
      let html = '';
      if (st.phase === 'solid') html = ctx.t('phaseSolid');
      else if (st.phase === 'liquid') html = ctx.t('phaseLiquid');
      else if (st.phase === 'gas') html = ctx.t('phaseGas');
      else if (st.phase === 'melting') html = tr('phaseMelting', { verb, pct: n(Math.round(st.liquid * 100), 0), rest: n(100 - Math.round(st.liquid * 100), 0), what });
      else html = tr('phaseBoiling', { verb, pct: n(Math.round(st.gas * 100), 0), rest: n(100 - Math.round(st.gas * 100), 0), what });
      const th = Math.round(st.theta);
      const temp = tr('temp', {
        th: th < 0 ? `(${n(th, 0)})` : n(th, 0),
        T: n(th + 273, 0),
        E: n(meanKineticEnergy(th) * 1e21, 2),
        v: n(Math.round(meanSpeed(th) / 10) * 10, 0),
      });
      const key = html + temp;
      if (key === lastPhase) return;
      lastPhase = key;
      ctx.readout('phase', { html });
      ctx.readout('temp', { html: temp });
    }

    let lastMix = '';
    function updateMixReadout(): void {
      const last = mixHist[mixHist.length - 1];
      const s = dropped && last ? tr('mixText', { tc: n(p.tc, 0), tw: n(p.tw, 0), mc: n(Math.round(last.m0 * 100), 0), mw: n(Math.round(last.m1 * 100), 0) }) : ctx.t('mixNone');
      if (s === lastMix) return;
      lastMix = s;
      ctx.readout('mix', { html: s });
    }

    function updateReadouts(): void {
      lastPhase = '';
      lastMix = '';
      lastNow = '';
      if (mode() === 'state') {
        const { melt, boil } = latentHeats();
        ctx.readout('latent', {
          html: tr('latent', {
            qs: n(melt / 1000, 0),
            qv: n(Math.round(boil / 1000), 0),
            P: n(p.pw, 0),
            ts: n(melt / p.pw / 60, 1),
            tv: n(boil / p.pw / 60, 1),
          }),
        });
        ctx.readout('mix', null);
        ctx.readout('why', null);
        ctx.readout('t90', null);
      } else {
        ctx.readout('phase', null);
        ctx.readout('temp', null);
        ctx.readout('latent', null);
        ctx.readout('why', {
          html: tr('why', {
            vc: n(Math.round(meanSpeed(p.tc) / 10) * 10, 0),
            vw: n(Math.round(meanSpeed(p.tw) / 10) * 10, 0),
            tc: n(p.tc, 0),
            tw: n(p.tw, 0),
            f: n(diffusionFactor(p.tw) / diffusionFactor(p.tc), 1),
          }),
        });
        const [cx, cy] = dropPoint(beakers[0].lat);
        ctx.readout('t90', {
          html: tr('t90', {
            tc: n(p.tc, 0),
            tw: n(p.tw, 0),
            a: n(Math.round(timeToMix(D_COLS, D_ROWS, D_INK, p.tc, 0.9, [cx, cy])), 0),
            b: n(Math.round(timeToMix(D_COLS, D_ROWS, D_INK, p.tw, 0.9, [cx, cy])), 0),
          }),
        });
      }
      void SAMPLE_MASS;
      updateNow();
    }

    function startIntro(): void {
      intro.play();
      if (!intro.running) return;
      soft.delete('tmax');
      soft.delete('dtmax');
    }

    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        const full = source === 'init' || source === 'replace';
        if (source === 'init' || changed.has('mode')) {
          startIntro();
          tracked = -1;
          trail.length = 0;
          dTracked = null;
          dTrail.length = 0;
        }
        if (mode() === 'state') {
          if ((changed.has('T') && source !== 'sim') || full) {
            if (source === 'init') {
              H = enthalpy(p.T);
              st = phaseState(H);
              history = [{ t: 0, th: st.theta, ph: st.phase, dir: 0 }];
              simT = 0;
            } else setTheta(p.T);
          }
          if (changed.has('heat') && source === 'input' && p.heat !== 'off' && !ctx.clock.playing) ctx.clock.play();
        } else if (full || changed.has('mode')) {
          resetDiff();
          if (prefersReducedMotion()) impact();
          else autoDrop = true;
        }
        // erst nach dem Start des Hosts (sonst zeigt der Abspielknopf den falschen Zustand)
        if (source === 'init' && !prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        if (source === 'replace' && !prefersReducedMotion() && (p.heat !== 'off' || mode() === 'diff')) ctx.clock.play();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'drop' && mode() === 'diff') {
          autoDrop = false;
          startDrop();
          if (!ctx.clock.playing) ctx.clock.play();
          updateReadouts();
        }
      },

      tick(dt) {
        if (mode() === 'state') tickState(dt);
        else tickDiff(dt);
      },

      resetTime() {
        if (mode() === 'state') {
          resetHistory();
          updateNow();
        } else {
          startDrop();
          updateReadouts();
        }
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        updateKeyTargets();
        const lay = computeLayout();
        surface.begin();
        const ia = stage(0.2, 0.5);
        const ib = stage(0.32, 0.5);
        if (mode() === 'state') {
          lastStateGeo = drawStateScene(lay.scene);
          drawTChart(lay.a, ia);
          drawHisto(lay.b, ib);
        } else {
          drawDiffScene(lay.scene);
          drawMixChart(lay.a, ia);
          drawCompare(lay.b, ib);
        }
        if (animating || intro.running || fadeOld.running || limitNote.running || dropAnim.running) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
