import { clamp, defineSimulation, ease, measureSubText, mixColor, prefersReducedMotion, roundRect, seededRandom, subText, Surface, Tween, withAlpha, type Rect, type SubTextStyle } from '../../../sim-core';
import {
  braggAngle,
  D1,
  D2,
  deBroglie,
  electronSpeed,
  fitOrigin,
  latticeFromSlope,
  momentum,
  noisy,
  pickTarget,
  ringRadius,
  ringRadiusApprox,
  SCREEN_DISTANCE,
  U_MAX,
  U_MIN,
  type Target,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Sichtbarer Radius des Leuchtschirms in mm. */
const SCREEN_MM = 45;
/** Diagrammachsen: U bis 8,5 kV, 1/√U bis 0,75, r bis 40 mm. */
const U_AXIS = 8.5;
const INV_AXIS = 0.75;
const R_AXIS = 40;
/** Messreihe automatisch: Spannungen in kV. */
const AUTO_U = [2.5, 3, 3.5, 4, 5, 6, 7, 8];
/** Ablesegenauigkeit beim Messen der Ringe (relativ). */
const READ_NOISE = 0.015;
const MAX_POINTS = 12;
const MAX_HITS = 1700;
/** Lebensdauer eines Leuchtpunkts auf dem Schirm in s. */
const HIT_LIFE = 7;

type Chart = 'rU' | 'rinv';

interface Lay {
  side: boolean;
  scene: Rect;
  chart: Rect;
  info: Rect;
}

interface TubeGeo {
  r: Rect;
  sm: boolean;
  /** Kolben: Mitte und Radius; Hals: oben/unten, links. */
  bx: number;
  by: number;
  Rb: number;
  neckX: number;
  neckH: number;
  cathX: number;
  anodeX: number;
  foilX: number;
  screenX: number;
  /** Pixel je mm (Seitenansicht). */
  k: number;
}

interface ScreenGeo {
  r: Rect;
  sm: boolean;
  cx: number;
  cy: number;
  R: number;
  /** Pixel je mm. */
  k: number;
}

interface Flyer {
  /** Fortschritt 0 … 1 vom Glühdraht bis zum Schirm. */
  s: number;
  target: Target;
  /** Ablenkung in mm auf dem Schirm und Winkel um die Achse. */
  rr: number;
  phi: number;
}

interface Hit {
  r: number;
  phi: number;
  t: number;
}

interface Point {
  U: number;
  r1: number;
  r2: number;
  born: number;
}

/**
 * Elektronenbeugung an Graphit: Elektronenbeugungsröhre in der Seitenansicht
 * (Glühkathode, Anode, Graphitfolie, Leuchtschirm) mit fliegenden Elektronen
 * und de-Broglie-Welle, der Leuchtschirm von vorn mit statistisch
 * entstehenden Beugungsringen und einem ziehbaren Messkreis, das Diagramm
 * Ringradius r über U bzw. über 1/√U mit Messreihe und die Rechnung
 * λ = h/(m·v), 2d · sin θ = λ, r = L · tan 2θ.
 */
export default defineSimulation({
  id: 'elektronenbeugung',
  animated: true,
  hint: L(
    'Tipp: Den Griff des gestrichelten Messkreises auf dem Schirm ziehen und auf einen Ring legen.',
    'Tip: Drag the handle of the dashed measuring circle on the screen onto a ring.',
  ),
  layout: { aspect: 1.5, aspectNarrow: 0.45 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'U',
      type: 'number',
      label: L('Beschleunigungsspannung U', 'Accelerating voltage U'),
      help: L('Je größer U, desto schneller die Elektronen und desto kleiner ihre Wellenlänge λ.', 'The greater U, the faster the electrons and the smaller their wavelength λ.'),
      min: U_MIN,
      max: U_MAX,
      step: 0.1,
      default: 4,
      unit: 'kV',
    },
    {
      key: 'ch',
      type: 'choice',
      label: L('Diagramm', 'Graph'),
      options: [
        { value: 'rU', label: L('r über U', 'r against U') },
        { value: 'rinv', label: L('r über 1/√U', 'r against 1/√U') },
      ],
      default: 'rU',
    },
    {
      key: 'rm',
      type: 'number',
      label: L('Messkreis: Radius', 'Measuring circle: radius'),
      help: L('Oder: den Griff des gestrichelten Kreises auf dem Schirm ziehen und auf einen Ring legen.', 'Or drag the handle of the dashed circle on the screen onto a ring.'),
      min: 3,
      max: 40,
      step: 0.1,
      default: 18,
      unit: 'mm',
      visibleIf: (v) => v.meas === true,
    },
    { key: 'meas', type: 'boolean', group: 'view', label: L('Messkreis auf dem Schirm', 'Measuring circle on the screen'), default: true },
    { key: 'hits', type: 'boolean', group: 'view', label: L('Einzelne Elektronen auf dem Schirm', 'Single electrons on the screen'), default: true },
    { key: 'wave', type: 'boolean', group: 'view', label: L('de-Broglie-Welle im Strahl (stark vergrößert)', 'de Broglie wave in the beam (greatly enlarged)'), default: true },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  actions: [
    { id: 'rec', label: L('Messwert aufnehmen', 'Record a data point'), primary: true },
    { id: 'auto', label: L('Messreihe automatisch', 'Automatic series') },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data') },
  ],
  readouts: [
    { key: 'lam', label: L('de-Broglie-Wellenlänge', 'de Broglie wavelength'), spoiler: true },
    { key: 'ring', label: L('Ringe auf dem Schirm', 'Rings on the screen'), spoiler: true },
    { key: 'meas', label: L('Messkreis', 'Measuring circle') },
    { key: 'table', label: L('Messtabelle', 'Table of measurements') },
    { key: 'fit', label: L('Auswertung', 'Analysis'), spoiler: true },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'start', label: L('U = 4 kV', 'U = 4 kV'), values: {} },
    { id: 'low', label: L('Kleine Spannung: große Ringe', 'Low voltage: large rings'), values: { U: 2.5 } },
    { id: 'high', label: L('Große Spannung: kleine Ringe', 'High voltage: small rings'), values: { U: 7.5 } },
    { id: 'lin', label: L('Linearisierung: r über 1/√U', 'Linearisation: r against 1/√U'), values: { ch: 'rinv' } },
    { id: 'meas', label: L('Ring ausmessen', 'Measure a ring'), values: { U: 5, rm: 8, val: false } },
  ],
  strings: {
    de: {
      canvas:
        'Elektronenbeugungsröhre von der Seite: Glühkathode, Anode mit Beschleunigungsspannung U, Graphitfolie und Leuchtschirm; Elektronen fliegen als Punkte durch die Röhre, im Strahl ist die de-Broglie-Welle angedeutet. Darunter der Leuchtschirm von vorn: Einzelne Elektronen treffen auf, nach und nach entstehen zwei Beugungsringe; ein ziehbarer gestrichelter Kreis dient zum Ausmessen. Rechts das Diagramm Ringradius r über U bzw. über 1/√U mit Messpunkten und die Rechnung λ = h/(m·v).',
      tube: 'Elektronenbeugungsröhre',
      tubeS: 'Röhre',
      cathode: 'Kathode',
      anode: 'Anode',
      foil: 'Graphit',
      screen: 'Schirm',
      wave: 'λ (vergrößert)',
      front: 'Leuchtschirm von vorn',
      frontS: 'Schirm von vorn',
      dist: 'L = 13,5 cm',
      ring1: 'r_1 = {r} mm',
      ring2: 'r_2 = {r} mm',
      ring1S: 'r_1',
      ring2S: 'r_2',
      measLab: 'r = {r} mm',
      fits1: 'passt zu Ring 1',
      fits2: 'passt zu Ring 2',
      chartU: 'Ringradius r über U',
      chartInv: 'Ringradius r über 1/√U',
      chartUS: 'r über U',
      chartInvS: 'r über 1/√U',
      axisU: 'U in kV',
      axisInv: '1/√U in 1/√kV',
      axisR: 'r in mm',
      legend1: 'Ring 1',
      legend2: 'Ring 2',
      empty: '„Messwert aufnehmen“ – hier erscheinen die Messpunkte.',
      emptyS: 'Messwerte aufnehmen …',
      infoTitle: 'Elektronen als Welle',
      infoTitleS: 'Elektronen',
      lam:
        'Energie: <var>e</var> · <var>U</var> = ½ · <var>m</var> · <var>v</var><sup>2</sup> ⇒ <var>v</var> = √(2 · <var>e</var> · <var>U</var> / <var>m</var>) = {v} m/s<br>Impuls: <var>p</var> = <var>m</var> · <var>v</var> = {p} kg · m/s<br><var>λ</var> = <span class="frac"><span><var>h</var></span><span><var>p</var></span></span> = <span class="frac"><span>6,626 · 10<sup>−34</sup> J · s</span><span>{p} kg · m/s</span></span> = <strong>{lam} pm</strong> = {lamM} m',
      ring:
        'Bragg-Bedingung 2 · <var>d</var> · sin <var>θ</var> = <var>λ</var>, Ablenkung um 2<var>θ</var>, Ring mit <var>r</var> = <var>L</var> · tan 2<var>θ</var> (<var>L</var> = 13,5 cm):<br>innerer Ring (<var>d</var><sub>1</sub> = 0,213 nm): <var>θ</var><sub>1</sub> = {t1}°, <strong><var>r</var><sub>1</sub> = {r1} mm</strong> (Näherung <var>r</var> ≈ <var>L</var> · <var>λ</var> / <var>d</var>: {a1} mm)<br>äußerer Ring (<var>d</var><sub>2</sub> = 0,123 nm): <var>θ</var><sub>2</sub> = {t2}°, <strong><var>r</var><sub>2</sub> = {r2} mm</strong> (Näherung: {a2} mm)',
      measOff: 'Messkreis ausgeblendet.',
      measOn: 'Messkreis: <var>r</var> = <strong>{r} mm</strong>{fit}',
      measFit: ' – liegt auf Ring {k}',
      thU: 'U in kV',
      thR1: 'r₁ in mm',
      thR2: 'r₂ in mm',
      thL: 'λ in pm',
      none: 'Noch keine Messwerte – „Messwert aufnehmen“ oder „Messreihe automatisch“.',
      fitFew: 'Für die Auswertung fehlen noch Messwerte (mindestens zwei).',
      fit: 'Ursprungsgeraden <var>r</var> = <var>k</var> · <span class="frac"><span>1</span><span>√<var>U</var></span></span>: <var>k</var><sub>1</sub> ≈ {k1} mm · √kV, <var>k</var><sub>2</sub> ≈ {k2} mm · √kV.<br>Mit <var>r</var> ≈ <var>L</var> · <var>λ</var> / <var>d</var> und <var>λ</var> = <var>h</var> / √(2 · <var>m</var> · <var>e</var> · <var>U</var>) folgt <var>d</var> = <span class="frac"><span><var>L</var> · <var>h</var></span><span><var>k</var> · √(2 · <var>m</var> · <var>e</var>)</span></span>: <strong><var>d</var><sub>1</sub> ≈ {d1} nm</strong>, <strong><var>d</var><sub>2</sub> ≈ {d2} nm</strong> (Tabellenwerte für Graphit: 0,213 nm und 0,123 nm; wegen der Näherung <var>r</var> ≈ <var>L</var> · <var>λ</var> / <var>d</var> fällt <var>d</var><sub>2</sub> etwa 1 % zu klein aus).',
    },
    en: {
      canvas:
        'Electron diffraction tube seen from the side: hot cathode, anode with accelerating voltage U, graphite foil and fluorescent screen; electrons fly through the tube as dots and the de Broglie wave is indicated in the beam. Below it the screen seen from the front: single electrons arrive and two diffraction rings build up; a draggable dashed circle is used for measuring. On the right the graph of ring radius r against U or against 1/√U with data points and the calculation λ = h/(m·v).',
      tube: 'Electron diffraction tube',
      tubeS: 'Tube',
      cathode: 'cathode',
      anode: 'anode',
      foil: 'graphite',
      screen: 'screen',
      wave: 'λ (enlarged)',
      front: 'Screen seen from the front',
      frontS: 'Screen (front)',
      dist: 'L = 13.5 cm',
      ring1: 'r_1 = {r} mm',
      ring2: 'r_2 = {r} mm',
      ring1S: 'r_1',
      ring2S: 'r_2',
      measLab: 'r = {r} mm',
      fits1: 'matches ring 1',
      fits2: 'matches ring 2',
      chartU: 'Ring radius r against U',
      chartInv: 'Ring radius r against 1/√U',
      chartUS: 'r against U',
      chartInvS: 'r against 1/√U',
      axisU: 'U in kV',
      axisInv: '1/√U in 1/√kV',
      axisR: 'r in mm',
      legend1: 'ring 1',
      legend2: 'ring 2',
      empty: '“Record a data point” – the points appear here.',
      emptyS: 'Record data …',
      infoTitle: 'Electrons as waves',
      infoTitleS: 'Electrons',
      lam:
        'Energy: <var>e</var> · <var>U</var> = ½ · <var>m</var> · <var>v</var><sup>2</sup> ⇒ <var>v</var> = √(2 · <var>e</var> · <var>U</var> / <var>m</var>) = {v} m/s<br>Momentum: <var>p</var> = <var>m</var> · <var>v</var> = {p} kg · m/s<br><var>λ</var> = <span class="frac"><span><var>h</var></span><span><var>p</var></span></span> = <span class="frac"><span>6.626 · 10<sup>−34</sup> J · s</span><span>{p} kg · m/s</span></span> = <strong>{lam} pm</strong> = {lamM} m',
      ring:
        'Bragg condition 2 · <var>d</var> · sin <var>θ</var> = <var>λ</var>, deflection by 2<var>θ</var>, ring with <var>r</var> = <var>L</var> · tan 2<var>θ</var> (<var>L</var> = 13.5 cm):<br>inner ring (<var>d</var><sub>1</sub> = 0.213 nm): <var>θ</var><sub>1</sub> = {t1}°, <strong><var>r</var><sub>1</sub> = {r1} mm</strong> (approximation <var>r</var> ≈ <var>L</var> · <var>λ</var> / <var>d</var>: {a1} mm)<br>outer ring (<var>d</var><sub>2</sub> = 0.123 nm): <var>θ</var><sub>2</sub> = {t2}°, <strong><var>r</var><sub>2</sub> = {r2} mm</strong> (approximation: {a2} mm)',
      measOff: 'Measuring circle hidden.',
      measOn: 'Measuring circle: <var>r</var> = <strong>{r} mm</strong>{fit}',
      measFit: ' – lies on ring {k}',
      thU: 'U in kV',
      thR1: 'r₁ in mm',
      thR2: 'r₂ in mm',
      thL: 'λ in pm',
      none: 'No data yet – “Record a data point” or “Automatic series”.',
      fitFew: 'More data are needed for the analysis (at least two points).',
      fit: 'Lines through the origin <var>r</var> = <var>k</var> · <span class="frac"><span>1</span><span>√<var>U</var></span></span>: <var>k</var><sub>1</sub> ≈ {k1} mm · √kV, <var>k</var><sub>2</sub> ≈ {k2} mm · √kV.<br>With <var>r</var> ≈ <var>L</var> · <var>λ</var> / <var>d</var> and <var>λ</var> = <var>h</var> / √(2 · <var>m</var> · <var>e</var> · <var>U</var>) we get <var>d</var> = <span class="frac"><span><var>L</var> · <var>h</var></span><span><var>k</var> · √(2 · <var>m</var> · <var>e</var>)</span></span>: <strong><var>d</var><sub>1</sub> ≈ {d1} nm</strong>, <strong><var>d</var><sub>2</sub> ≈ {d2} nm</strong> (table values for graphite: 0.213 nm and 0.123 nm; because of the approximation <var>r</var> ≈ <var>L</var> · <var>λ</var> / <var>d</var>, <var>d</var><sub>2</sub> comes out about 1 % too small).',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    const chart = (): Chart => (p.ch === 'rinv' ? 'rinv' : 'rU');
    const blue = () => ctx.theme.series[0]!;
    const orange = () => ctx.theme.series[3]!;
    const c1 = () => ctx.theme.series[5]!;
    const c2 = () => ctx.theme.series[4]!;
    /** Ringradien in mm zur Spannung in kV (genaue Formel r = L · tan 2θ). */
    const r1Of = (U: number) => (ringRadius(U * 1000, D1) ?? 0) * 1000;
    const r2Of = (U: number) => (ringRadius(U * 1000, D2) ?? 0) * 1000;

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
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.37, 250, 400));
        const ch = Math.round((h - 10) * 0.58);
        return { side, scene: { x: 0, y: 0, w: w - pw - 12, h }, chart: { x: w - pw, y: 0, w: pw, h: ch }, info: { x: w - pw, y: ch + 10, w: pw, h: h - ch - 10 } };
      }
      const sh = Math.round(h * 0.54);
      const ch = Math.round((h - sh - 20) * 0.56);
      return { side, scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh + 10, w, h: ch }, info: { x: 0, y: sh + 20 + ch, w, h: h - sh - 20 - ch } };
    }

    function splitScene(r: Rect): { tube: Rect; front: Rect } {
      const th = Math.round(r.h * 0.4);
      return { tube: { x: r.x, y: r.y, w: r.w, h: th }, front: { x: r.x, y: r.y + th, w: r.w, h: r.h - th } };
    }

    function tubeGeo(r: Rect): TubeGeo {
      const sm = r.w < 440;
      const top = r.y + (sm ? 34 : 40);
      const bot = r.y + r.h - (sm ? 24 : 30);
      const Rb = Math.max(24, Math.min((bot - top) / 2, r.w * 0.2));
      const by = (top + bot) / 2;
      const bx = r.x + r.w - Rb - (sm ? 14 : 22);
      const neckX = r.x + (sm ? 12 : 18);
      const neckH = Rb * 0.42;
      const foilX = bx - Rb * 0.97;
      const screenX = bx + Rb * 0.97;
      const cathX = neckX + (sm ? 16 : 24);
      const anodeX = cathX + Math.max(28, (foilX - cathX) * 0.3);
      return { r, sm, bx, by, Rb, neckX, neckH, cathX, anodeX, foilX, screenX, k: (screenX - foilX) / (SCREEN_DISTANCE * 1000) };
    }

    function screenGeo(r: Rect): ScreenGeo {
      const sm = r.w < 440;
      const R = Math.max(40, Math.min((r.h - (sm ? 44 : 54)) / 2, r.w * 0.36));
      const cx = r.x + r.w / 2;
      const cy = r.y + (sm ? 30 : 36) + R;
      return { r, sm, cx, cy, R, k: R / SCREEN_MM };
    }

    /* ---------- Elektronen ---------- */
    const rand = seededRandom(20261020);
    const noiseRand = seededRandom(31);
    let flyers: Flyer[] = [];
    let hits: Hit[] = [];
    let spawnAcc = 0;
    let simT = 0;
    /** Treffer, die vor diesem Zeitpunkt entstanden sind, verblassen schnell (Spannung geändert). */
    let staleBefore = -1;
    let staleAt = 0;

    /** Ablenkung (mm) für ein Ziel: Ringe mit kleiner Breite, Untergrund breit gestreut. */
    function deflect(target: Target): number {
      const g = () => {
        const u = Math.max(1e-9, rand());
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rand());
      };
      if (target === 0) return Math.abs(g()) * 0.55;
      if (target === 1) return r1Of(p.U) + g() * 0.42;
      if (target === 2) return r2Of(p.U) + g() * 0.5;
      return Math.abs(g()) * 14;
    }

    function addHit(): void {
      const target = pickTarget(rand);
      hits.push({ r: deflect(target), phi: rand() * TAU, t: simT });
    }

    function fillStatic(): void {
      hits = [];
      for (let i = 0; i < 1100; i++) addHit();
    }

    function tickElectrons(dt: number): void {
      simT += dt;
      // Fluggeschwindigkeit im Bild wächst mit v ∝ √U
      const speed = 0.55 * Math.sqrt(p.U / 4);
      for (const f of flyers) {
        f.s += dt * speed;
        if (f.s >= 1) {
          hits.push({ r: f.rr, phi: f.phi, t: simT });
          // viele unsichtbare Elektronen landen mit: das Muster entsteht schneller
          for (let k = 0; k < 4; k++) addHit();
        }
      }
      flyers = flyers.filter((f) => f.s < 1);
      spawnAcc += dt * 34;
      while (spawnAcc >= 1) {
        spawnAcc -= 1;
        const target = pickTarget(rand);
        flyers.push({ s: 0, target, rr: deflect(target), phi: rand() * TAU });
      }
      const stale = (h: Hit) => (h.t < staleBefore ? simT - staleAt < 0.6 : true);
      hits = hits.filter((h) => simT - h.t < HIT_LIFE && stale(h));
      if (hits.length > MAX_HITS) hits = hits.slice(hits.length - MAX_HITS);
      autoStep();
    }

    /* ---------- Messreihe ---------- */
    let points: Point[] = [];
    let autoRun = false;
    let autoIdx = 0;
    let autoWait = 0;

    function record(): void {
      const pt: Point = { U: p.U, r1: noisy(r1Of(p.U), READ_NOISE, noiseRand), r2: noisy(r2Of(p.U), READ_NOISE, noiseRand), born: prefersReducedMotion() ? -1e9 : performance.now() };
      points = [...points.filter((q) => Math.abs(q.U - p.U) > 1e-6), pt].sort((a, b) => a.U - b.U).slice(-MAX_POINTS);
      updateTable();
    }

    function autoStep(): void {
      if (!autoRun) return;
      const settled = Math.abs((soft.get('r1') ?? 0) - r1Of(p.U)) < 0.05;
      if (!settled) {
        autoWait = 0;
        return;
      }
      autoWait += frameDt || 0.016;
      if (autoWait < 0.45) return;
      autoWait = 0;
      record();
      autoIdx++;
      if (autoIdx >= AUTO_U.length) {
        autoRun = false;
        return;
      }
      ctx.set({ U: AUTO_U[autoIdx]! });
    }

    /* Text mit Index über den Kern-Helfer `subText` (Indexgröße wie bisher auf ganze Pixel gerundet). */
    const subStyle = (size: number, color: string, weight: number, align: CanvasTextAlign = 'left'): SubTextStyle => ({
      size,
      family: ctx.theme.font,
      weight,
      color,
      align,
      subScale: Math.round(size * 0.74) / size,
      subShift: 0.3,
    });
    function richWidth(str: string, size: number, weight = 700): number {
      return measureSubText(surface.g, str, subStyle(size, '', weight));
    }
    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      return subText(surface.g, str, x, y, { ...subStyle(size, color, weight, align), ...(halo ? { halo } : {}) });
    }
    const haloCol = () => (ctx.theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)');

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string, onDark = false): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark || onDark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (onDark ? 'rgba(8,14,12,0.8)' : theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = color.startsWith('#') ? withAlpha(color, 0.5) : 'rgba(255,255,255,0.3)';
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center');
      return { x: x0, y, w, h };
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 7): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.45);
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

    function sciCanvas(v: number, d = 2): string {
      const e = Math.floor(Math.log10(Math.abs(v)));
      return `${fx(v / 10 ** e, d)} · 10^${e < 0 ? `−${-e}` : e}`;
    }
    function sciHtml(v: number, d = 2): string {
      const e = Math.floor(Math.log10(Math.abs(v)));
      return `${fx(v / 10 ** e, d)} · 10<sup>${e < 0 ? `−${-e}` : e}</sup>`;
    }
    /** Hochzahl auf der Zeichenfläche: „10^7“ → kleine erhöhte Ziffern. */
    function supText(str: string, x: number, y: number, size: number, color: string, weight = 700): number {
      const g = surface.g;
      const i = str.indexOf('^');
      if (i < 0) return richText(str, x, y, size, color, 'left', weight);
      const m = /^\^([−\d]+)/.exec(str.slice(i));
      const head = str.slice(0, i);
      const exp = m ? m[1]! : '';
      const tail = str.slice(i + (m ? m[0].length : 1));
      let w = richText(head, x, y, size, color, 'left', weight);
      g.font = `${weight} ${Math.round(size * 0.7)}px ${ctx.theme.font}`;
      g.fillStyle = color;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(exp, x + w, y - size * 0.38);
      w += g.measureText(exp).width + 1;
      w += richText(tail, x + w, y, size, color, 'left', weight);
      return w;
    }
    function supWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      const i = str.indexOf('^');
      if (i < 0) return richWidth(str, size, weight);
      const m = /^\^([−\d]+)/.exec(str.slice(i));
      g.font = `${weight} ${Math.round(size * 0.7)}px ${ctx.theme.font}`;
      const ew = g.measureText(m ? m[1]! : '').width + 1;
      return richWidth(str.slice(0, i), size, weight) + ew + richWidth(str.slice(i + (m ? m[0].length : 1)), size, weight);
    }

    /* ---------- Röhre (Seitenansicht) ---------- */
    function drawTube(T: TubeGeo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const { bx, by, Rb, neckX, neckH } = T;
      const r = T.r;
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * 10);
      // Glaskörper: Hals und Kolben
      const glassPath = () => {
        g.beginPath();
        const a = Math.asin(clamp(neckH / Rb, 0, 0.99));
        g.moveTo(neckX + neckH, by - neckH);
        g.lineTo(bx - Rb * Math.cos(a), by - neckH);
        g.arc(bx, by, Rb, Math.PI + a, Math.PI - a, false);
        g.lineTo(neckX + neckH, by + neckH);
        g.arc(neckX + neckH, by, neckH, Math.PI / 2, (3 * Math.PI) / 2);
        g.closePath();
      };
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.22)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 5;
      const inner = g.createRadialGradient(bx - Rb * 0.3, by - Rb * 0.35, Rb * 0.1, bx, by, Rb * 1.1);
      inner.addColorStop(0, dark ? '#1b2636' : '#e9f0f8');
      inner.addColorStop(1, dark ? '#0d141f' : '#c9d6e4');
      g.fillStyle = inner;
      glassPath();
      g.fill();
      g.restore();
      // Vakuum dunkel im Inneren, damit Strahl und Leuchten wirken
      g.save();
      glassPath();
      g.clip();
      const vac = g.createRadialGradient(bx, by, Rb * 0.2, bx, by, Rb * 1.2);
      vac.addColorStop(0, 'rgba(10,18,30,0.92)');
      vac.addColorStop(1, 'rgba(6,10,18,0.98)');
      g.fillStyle = vac;
      g.fillRect(r.x, r.y, r.w, r.h);
      // Leuchtschicht auf der Kolbenrückseite
      g.strokeStyle = 'rgba(120,255,170,0.22)';
      g.lineWidth = 5;
      g.beginPath();
      g.arc(bx, by, Rb - 3, -0.75, 0.75);
      g.stroke();
      g.restore();
      // Glasrand mit Glanz
      g.strokeStyle = dark ? 'rgba(200,220,245,0.45)' : 'rgba(110,135,165,0.65)';
      g.lineWidth = 1.6;
      glassPath();
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(bx, by, Rb - 6, -2.6, -1.9);
      g.stroke();
      g.restore();
    }

    /** Kathode, Anode, Graphitfolie, Spannungsquelle und Beschriftungen. */
    function drawElectrodes(T: TubeGeo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { by, neckH, cathX, anodeX, foilX, sm } = T;
      g.save();
      g.globalAlpha *= ik;
      // Glühdraht (glüht)
      const heat = 0.75 + 0.25 * Math.sin(simT * 7);
      const fg = g.createRadialGradient(cathX, by, 0, cathX, by, neckH * 0.9);
      fg.addColorStop(0, `rgba(255,170,80,${0.55 * heat})`);
      fg.addColorStop(1, 'rgba(255,120,40,0)');
      g.fillStyle = fg;
      g.beginPath();
      g.arc(cathX, by, neckH * 0.9, 0, TAU);
      g.fill();
      g.strokeStyle = '#ffb36b';
      g.lineWidth = 1.8;
      g.beginPath();
      for (let k = 0; k <= 8; k++) {
        const y = by - neckH * 0.45 + (k / 8) * neckH * 0.9;
        const x = cathX - 3 + (k % 2 ? 4 : 0);
        if (k) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      // Anode: Lochblende
      const ag = g.createLinearGradient(anodeX - 3, 0, anodeX + 3, 0);
      ag.addColorStop(0, '#6f7884');
      ag.addColorStop(0.5, '#d6dce3');
      ag.addColorStop(1, '#5b636e');
      g.fillStyle = ag;
      g.fillRect(anodeX - 2.5, by - neckH * 0.85, 5, neckH * 0.85 - 3);
      g.fillRect(anodeX - 2.5, by + 3, 5, neckH * 0.85 - 3);
      // Graphitfolie auf einem Netz
      g.fillStyle = '#2b2f36';
      g.fillRect(foilX - 2, by - neckH * 0.75, 4, neckH * 1.5);
      g.strokeStyle = 'rgba(180,190,205,0.6)';
      g.lineWidth = 1;
      g.strokeRect(foilX - 2.5, by - neckH * 0.75, 5, neckH * 1.5);
      // Spannungsquelle unter dem Hals
      const sy = by + neckH + (sm ? 13 : 17);
      g.strokeStyle = withAlpha(orange(), 0.85);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(cathX, by + neckH * 0.45);
      g.lineTo(cathX, sy);
      g.lineTo(anodeX, sy);
      g.lineTo(anodeX, by + neckH * 0.85);
      g.stroke();
      // U ist eine Eingabe (keine Lösung) und bleibt auch im Aufgabenmodus sichtbar
      const lab = `U = ${fx(ease2('Ushow', p.U, 9), 1)} kV`;
      pill((cathX + anodeX) / 2, sy - (sm ? 10.5 : 11.5), lab, orange(), 'center', sm ? 10.5 : 11.5);
      // Beschriftungen über dem Hals
      const fs = sm ? 10 : 11;
      const ly = by - neckH - (sm ? 9 : 11);
      richText(ctx.t('cathode'), cathX - 6, ly, fs, theme.muted, 'left', 650);
      if (anodeX - cathX > 60) richText(ctx.t('anode'), anodeX, ly, fs, theme.muted, 'center', 650);
      richText(ctx.t('foil'), foilX + 4, ly, fs, theme.muted, 'right', 650);
      g.restore();
    }

    /** Elektronenstrahl, fliegende Elektronen, de-Broglie-Welle, Kegel zu den Ringen. */
    function drawBeam(T: TubeGeo, ik: number, r1: number, r2: number): void {
      const g = surface.g;
      const { by, cathX, anodeX, foilX, screenX, k, sm } = T;
      g.save();
      g.globalAlpha *= ik;
      // Kegel zu den Ringen (Seitenansicht: ±r)
      const cone = (rr: number, col: string, a: number) => {
        g.strokeStyle = withAlpha(col, a);
        g.lineWidth = 1.2;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(foilX, by);
        g.lineTo(screenX, by - rr * k);
        g.moveTo(foilX, by);
        g.lineTo(screenX, by + rr * k);
        g.stroke();
        g.setLineDash([]);
      };
      cone(r1, mixColor(c1(), '#ffffff', 0.35), 0.55);
      cone(r2, mixColor(c2(), '#ffffff', 0.35), 0.55);
      // Strahl
      const bg = g.createLinearGradient(cathX, 0, screenX, 0);
      bg.addColorStop(0, 'rgba(130,180,255,0.0)');
      bg.addColorStop(0.2, 'rgba(130,180,255,0.35)');
      bg.addColorStop(1, 'rgba(130,180,255,0.25)');
      g.strokeStyle = bg;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cathX + 4, by);
      g.lineTo(screenX, by);
      g.stroke();
      // de-Broglie-Welle zwischen Anode und Folie: Wellenlänge im Bild ∝ λ
      const wa = ease2('waveA', p.wave ? 1 : 0, 6);
      if (wa > 0.01) {
        const lamPx = (deBroglie(ease2('Uw', p.U, 8) * 1000) * 1e12) * (sm ? 0.62 : 0.85);
        const amp = T.neckH * 0.32;
        const x0 = anodeX + 8;
        const x1 = foilX - 6;
        const ph = simT * 2.2 * Math.sqrt(p.U / 4);
        g.save();
        g.globalAlpha *= wa;
        g.strokeStyle = mixColor(blue(), '#ffffff', 0.4);
        g.lineWidth = 1.6;
        g.beginPath();
        for (let x = x0; x <= x1; x += 1) {
          const env = Math.min(1, (x - x0) / 12, (x1 - x) / 12);
          const y = by + Math.sin(TAU * ((x - x0) / lamPx - ph)) * amp * env;
          if (x === x0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        // Maß für λ über der Welle
        if (x1 - x0 > lamPx * 2.5) {
          const mx = x0 + ((((ph % 1) + 1) % 1) * lamPx) + lamPx * 0.25 + Math.ceil((x1 - x0) / lamPx / 2 - 1) * lamPx;
          const yy = by - amp - 6;
          if (mx + lamPx < x1) {
            g.strokeStyle = 'rgba(200,220,255,0.85)';
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(mx, yy - 3);
            g.lineTo(mx, yy + 3);
            g.moveTo(mx, yy);
            g.lineTo(mx + lamPx, yy);
            g.moveTo(mx + lamPx, yy - 3);
            g.lineTo(mx + lamPx, yy + 3);
            g.stroke();
          }
        }
        g.restore();
      }
      // fliegende Elektronen
      for (const f of flyers) {
        const s = f.s;
        let x: number;
        let y = by;
        const a1 = 0.18;
        const a2 = 0.5;
        if (s < a1) {
          // Beschleunigung zwischen Kathode und Anode: x ∝ t²
          x = cathX + (anodeX - cathX) * (s / a1) ** 2;
        } else if (s < a2) x = anodeX + (foilX - anodeX) * ((s - a1) / (a2 - a1));
        else {
          const u = (s - a2) / (1 - a2);
          x = foilX + (screenX - foilX) * u;
          y = by + Math.cos(f.phi) * f.rr * k * u;
        }
        g.fillStyle = 'rgba(150,200,255,0.95)';
        g.beginPath();
        g.arc(x, y, sm ? 1.6 : 2, 0, TAU);
        g.fill();
      }
      // Leuchtpunkte am Schirm (Seitenansicht)
      for (const [rr, col] of [
        [0, '#c8ffe0'],
        [r1, '#9dffc2'],
        [r2, '#9dffc2'],
      ] as const) {
        for (const sgn of rr ? [-1, 1] : [1]) {
          const y = by + sgn * rr * k;
          const gl = g.createRadialGradient(screenX, y, 0, screenX, y, 9);
          gl.addColorStop(0, withAlpha(col, 0.9));
          gl.addColorStop(1, withAlpha(col, 0));
          g.fillStyle = gl;
          g.beginPath();
          g.arc(screenX, y, 9, 0, TAU);
          g.fill();
        }
      }
      g.restore();
    }

    function drawTubeLabels(T: TubeGeo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { by, Rb, bx, foilX, screenX, sm } = T;
      const r = T.r;
      g.save();
      g.globalAlpha *= ik;
      const fs = sm ? 10.5 : 11.5;
      richText(ctx.t(r.w < 400 ? 'tubeS' : 'tube'), r.x + 14, r.y + (sm ? 16 : 19), sm ? 12 : 13, theme.text, 'left', 750);
      // Maß L unter dem Kolben
      const yy = by + Rb + (sm ? 10 : 13);
      if (yy < r.y + r.h - 4) {
        g.strokeStyle = theme.muted;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(foilX, yy - 4);
        g.lineTo(foilX, yy + 4);
        g.moveTo(screenX, yy - 4);
        g.lineTo(screenX, yy + 4);
        g.stroke();
        arrowPx(bx, yy, foilX + 1, yy, theme.muted, 1.2, 6);
        arrowPx(bx, yy, screenX - 1, yy, theme.muted, 1.2, 6);
        const lab = ctx.t('dist');
        const w = richWidth(lab, fs, 650) + 10;
        g.fillStyle = theme.bg;
        g.fillRect(bx - w / 2, yy - 8, w, 16);
        richText(lab, bx, yy, fs, theme.muted, 'center', 650);
      }
      // λ-Hinweis an der Welle
      const wa = soft.get('waveA') ?? 0;
      if (wa > 0.05 && !sm) {
        g.globalAlpha *= wa;
        richText(ctx.t('wave'), (T.anodeX + foilX) / 2, by + T.neckH + (sm ? 10 : 12), fs - 1, mixColor(blue(), theme.text, 0.3), 'center', 650, haloCol());
      }
      g.restore();
    }

    /* ---------- Leuchtschirm (Vorderansicht) ---------- */
    let lastScreen: ScreenGeo | null = null;
    let measHover = false;
    let measDrag = false;

    function drawFront(S: ScreenGeo, ik: number, r1: number, r2: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { cx, cy, R, k, sm } = S;
      const grow = stage(0.35, 0.6, ease.outCubic);
      g.save();
      g.globalAlpha *= ik;
      richText(ctx.t(S.r.w < 400 ? 'frontS' : 'front'), S.r.x + 14, S.r.y + (sm ? 14 : 17), sm ? 12 : 13, theme.text, 'left', 750);
      // Glasrand
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.25)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      const rim = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rim.addColorStop(0, theme.dark ? '#46546a' : '#dbe3ec');
      rim.addColorStop(1, theme.dark ? '#1c2533' : '#8e9db0');
      g.fillStyle = rim;
      g.beginPath();
      g.arc(cx, cy, R + 7, 0, TAU);
      g.fill();
      g.restore();
      // Schirm
      const sg = g.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      sg.addColorStop(0, '#0f1d17');
      sg.addColorStop(1, '#050a08');
      g.fillStyle = sg;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.fill();
      g.save();
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.clip();
      // weiches Leuchten der Ringe (Erwartung)
      const glowRing = (rr: number, a: number, w: number) => {
        if (rr * k * grow < 1) return;
        g.save();
        g.strokeStyle = `rgba(120,255,170,${a})`;
        g.shadowColor = 'rgba(120,255,170,0.9)';
        g.shadowBlur = 10;
        g.lineWidth = w;
        g.beginPath();
        g.arc(cx, cy, rr * k * grow, 0, TAU);
        g.stroke();
        g.restore();
      };
      const hitsOn = ease2('hitsA', p.hits ? 1 : 0, 5);
      glowRing(r1, 0.32 + 0.3 * (1 - hitsOn), Math.max(2, 0.9 * k));
      glowRing(r2, 0.22 + 0.25 * (1 - hitsOn), Math.max(2, 1.0 * k));
      const cg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(10, 3 * k));
      cg.addColorStop(0, 'rgba(220,255,235,0.95)');
      cg.addColorStop(0.35, 'rgba(120,255,170,0.55)');
      cg.addColorStop(1, 'rgba(120,255,170,0)');
      g.fillStyle = cg;
      g.beginPath();
      g.arc(cx, cy, Math.max(10, 3 * k), 0, TAU);
      g.fill();
      // einzelne Treffer
      if (hitsOn > 0.01) {
        g.fillStyle = '#b4ffd0';
        const dot = sm ? 1.2 : 1.5;
        for (const h of hits) {
          const age = simT - h.t;
          let a = age < 0.15 ? 1 : Math.max(0, 1 - (age - 0.15) / (HIT_LIFE - 0.15));
          if (h.t < staleBefore) a *= Math.max(0, 1 - (simT - staleAt) / 0.6);
          if (a < 0.03) continue;
          g.globalAlpha = ik * hitsOn * a * 0.85;
          const rr = h.r * k * grow;
          g.fillRect(cx + Math.cos(h.phi) * rr - dot / 2, cy + Math.sin(h.phi) * rr - dot / 2, dot, dot);
        }
        g.globalAlpha = ik;
      }
      // Glanz
      const gl = g.createLinearGradient(cx - R, cy - R, cx, cy);
      gl.addColorStop(0, 'rgba(255,255,255,0.10)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      // mm-Skala (Folie) waagrecht durch die Mitte
      g.strokeStyle = 'rgba(200,230,215,0.4)';
      g.lineWidth = 1;
      g.beginPath();
      for (let mm = -40; mm <= 40; mm += 5) {
        const x = cx + mm * k;
        const big = mm % 10 === 0;
        g.moveTo(x + 0.5, cy + R * 0.0 + (big ? -5 : -3));
        g.lineTo(x + 0.5, cy + (big ? 5 : 3));
      }
      g.moveTo(cx - 40 * k, cy + 0.5);
      g.lineTo(cx + 40 * k, cy + 0.5);
      g.stroke();
      g.restore();
      // Zahlen der mm-Skala erst nach Messkreis und Pfeil (siehe unten), mit Rand in Schirmfarbe,
      // damit Kreis oder Pfeil sie nicht durchkreuzen
      const scaleNumbers = () => {
        g.save();
        g.font = `600 ${sm ? 9.5 : 10}px ${theme.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'top';
        g.lineJoin = 'round';
        g.lineWidth = 3;
        g.strokeStyle = 'rgba(6,14,11,0.85)';
        g.fillStyle = 'rgba(200,230,215,0.65)';
        for (let mm = 10; mm <= 40; mm += 10) {
          if (sm && mm % 20) continue;
          g.strokeText(String(mm), cx + mm * k, cy + 7);
          g.fillText(String(mm), cx + mm * k, cy + 7);
        }
        g.restore();
      };
      // Ringbeschriftungen (links unten außen); im Aufgabenmodus verdeckt, solange „Ringe“ verdeckt ist
      if (!ctx.isHidden('ring')) {
        const fs = sm ? 10.5 : 11.5;
        // links außerhalb des Schirms, mit Hinweislinie zum Ring
        const ph = fs + 11;
        const place = (rr: number, key: string, col: string, ang: number, yy: number) => {
          const x = cx + Math.cos(ang) * rr * k * grow;
          const y = cy + Math.sin(ang) * rr * k * grow;
          const lab = tr(key, { r: fx(rr, 1) });
          const w = richWidth(lab, fs) + 16;
          const xx = clamp(cx - R - 14 - w, S.r.x + 6, S.r.x + S.r.w - 6 - w);
          g.strokeStyle = withAlpha(col, 0.85);
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(xx + w, yy + ph / 2);
          g.stroke();
          g.fillStyle = col;
          g.beginPath();
          g.arc(x, y, 2.5, 0, TAU);
          g.fill();
          pill(xx, yy, lab, col, 'left', fs);
        };
        place(r1, 'ring1', c1(), Math.PI * 1.18, cy - R * 0.55 - ph / 2);
        place(r2, 'ring2', c2(), Math.PI * 0.8, cy + R * 0.55 - ph / 2);
      }
      // Messkreis
      const mA = ease2('measA', p.meas ? 1 : 0, 6);
      if (mA > 0.01) {
        const rm = ease2('rm', p.rm, 14, measDrag);
        const fit = Math.abs(p.rm - r1) < 0.35 ? 1 : Math.abs(p.rm - r2) < 0.35 ? 2 : 0;
        const col = fit ? mixColor(orange(), '#7dffa8', 0.6) : orange();
        g.save();
        g.globalAlpha *= mA;
        g.strokeStyle = col;
        g.lineWidth = fit ? 2.2 : 1.8;
        g.setLineDash([6, 5]);
        g.beginPath();
        g.arc(cx, cy, rm * k, 0, TAU);
        g.stroke();
        g.setLineDash([]);
        // Griff
        const ha = -Math.PI / 4;
        const hx = cx + Math.cos(ha) * rm * k;
        const hy = cy + Math.sin(ha) * rm * k;
        if (!ctx.locked) {
          g.fillStyle = withAlpha(orange(), measHover || measDrag ? 0.35 : 0.18);
          g.beginPath();
          g.arc(hx, hy, measHover || measDrag ? 13 : 10, 0, TAU);
          g.fill();
        }
        g.fillStyle = theme.bg;
        g.strokeStyle = col;
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(hx, hy, 6, 0, TAU);
        g.fill();
        g.stroke();
        // Radius-Pfeil und Wert
        arrowPx(cx, cy, hx - Math.cos(ha) * 8, hy - Math.sin(ha) * 8, withAlpha(orange(), 0.9), 1.4, 6);
        const lab = tr('measLab', { r: fx(rm, 1) }) + (fit ? ` ✓` : '');
        const fs = sm ? 10.5 : 11.5;
        const w = richWidth(lab, fs) + 16;
        pill(clamp(hx + 12, S.r.x + 6, S.r.x + S.r.w - 6 - w), clamp(hy - 30, S.r.y + 24, S.r.y + S.r.h - 26), lab, orange(), 'left', fs, fit ? withAlpha(orange(), 0.95) : undefined);
        g.restore();
        measHandle = { x: hx, y: hy };
      } else measHandle = null;
      scaleNumbers();
      g.restore();
    }
    let measHandle: { x: number; y: number } | null = null;

    function drawScene(r: Rect): void {
      const g = surface.g;
      const { tube, front } = splitScene(r);
      const ik = stage(0, 0.5);
      // Hintergrundkarte der Szene
      card(r);
      g.save();
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.clip();
      const T = tubeGeo(tube);
      const S = screenGeo(front);
      lastScreen = S;
      const r1 = ease2('r1', r1Of(p.U), 7);
      const r2 = ease2('r2', r2Of(p.U), 7);
      drawTube(T, ik);
      g.save();
      g.beginPath();
      g.arc(T.bx, T.by, T.Rb - 1, 0, TAU);
      g.rect(T.neckX, T.by - T.neckH, T.bx - T.neckX, 2 * T.neckH);
      g.clip();
      drawBeam(T, stage(0.25, 0.5), r1, r2);
      g.restore();
      drawElectrodes(T, ik);
      drawTubeLabels(T, ik);
      // Trennlinie
      g.strokeStyle = ctx.theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + 14, front.y + 0.5);
      g.lineTo(r.x + r.w - 14, front.y + 0.5);
      g.stroke();
      drawFront(S, stage(0.2, 0.5), r1, r2);
      g.restore();
    }

    /* ---------- Diagramm ---------- */
    let shownCh: Chart = chart();
    let fromCh: Chart = shownCh;
    const chSwap = new Tween(520, ease.linear);

    function drawChartContent(R: Rect, ch: Chart, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = R.w < 330 || R.h < 200;
      const fs = sm ? 10.5 : 11.5;
      const padL = sm ? 36 : 42;
      const A: Rect = { x: R.x + padL, y: R.y + (sm ? 52 : 60), w: R.w - padL - (sm ? 14 : 18), h: R.h - (sm ? 52 : 60) - (sm ? 26 : 30) };
      if (A.w < 50 || A.h < 40) return;
      const xMax = ch === 'rU' ? U_AXIS : INV_AXIS;
      const X = (x: number) => A.x + (x / xMax) * A.w;
      const Y = (y: number) => A.y + A.h - (y / R_AXIS) * A.h;
      const xOf = (U: number) => (ch === 'rU' ? U : 1 / Math.sqrt(U));
      g.save();
      g.globalAlpha *= alpha;
      // Gitter und Achsen
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      const ys = A.h < 120 ? 20 : 10;
      for (let y = ys; y < R_AXIS + 1e-9; y += ys) {
        g.moveTo(A.x, Math.round(Y(y)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(y)) + 0.5);
      }
      const xs = ch === 'rU' ? (A.w < 220 ? 2 : 1) : A.w < 220 ? 0.2 : 0.1;
      for (let x = xs; x < xMax + 1e-9; x += xs) {
        g.moveTo(Math.round(X(x)) + 0.5, A.y);
        g.lineTo(Math.round(X(x)) + 0.5, A.y + A.h);
      }
      g.stroke();
      const font = `${fs}px ${theme.font}`;
      g.font = font;
      for (let y = 0; y < R_AXIS + 1e-9; y += ys) richText(n(y, 0), A.x - 6, Y(y), fs, theme.muted, 'right', 500);
      const xTitle = ctx.t(ch === 'rU' ? 'axisU' : 'axisInv');
      const tw = richWidth(xTitle, fs, 600);
      for (let x = 0; x < xMax + 1e-9; x += xs) {
        const xx = X(x);
        if (xx + 12 > A.x + A.w - tw - 6 && x > 0) continue;
        richText(ch === 'rU' ? n(x, 0) : n(x, 1), xx, A.y + A.h + 11, fs, theme.muted, 'center', 500);
      }
      richText(xTitle, A.x + A.w, A.y + A.h + 11, fs, theme.muted, 'right', 600);
      richText(ctx.t('axisR'), A.x - padL + 8, A.y - 12, fs, theme.muted, 'left', 600);
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y - 4);
      g.lineTo(A.x + 0.5, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w + 4, A.y + A.h + 0.5);
      g.stroke();
      // nicht einstellbarer Bereich
      g.fillStyle = withAlpha(theme.muted, theme.dark ? 0.07 : 0.05);
      if (ch === 'rU') g.fillRect(A.x, A.y, X(U_MIN) - A.x, A.h);
      else g.fillRect(X(1 / Math.sqrt(U_MIN)), A.y, A.x + A.w - X(1 / Math.sqrt(U_MIN)), A.h);
      // Kurven (Theorie)
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 4, A.w + 4, A.h + 4);
      g.clip();
      for (const [f, col] of [
        [r1Of, c1()],
        [r2Of, c2()],
      ] as const) {
        g.strokeStyle = withAlpha(col, 0.85);
        g.lineWidth = sm ? 2 : 2.4;
        g.lineJoin = 'round';
        g.beginPath();
        const U0 = ch === 'rU' ? 0.9 : 1 / (INV_AXIS * INV_AXIS);
        let first = true;
        for (let i = 0; i <= 90; i++) {
          const U = ch === 'rU' ? U0 + ((U_AXIS - U0) * i) / 90 : 1 / ((INV_AXIS * Math.max(1e-3, i)) / 90) ** 2;
          const rr = f(U);
          const x = X(xOf(U));
          const y = Y(rr);
          if (!Number.isFinite(y) || rr <= 0) continue;
          if (first) {
            g.moveTo(x, y);
            first = false;
          } else g.lineTo(x, y);
        }
        g.stroke();
      }
      // Ausgleichsgeraden in der Linearisierung
      if (ch === 'rinv' && points.length >= 2) {
        for (const key of ['r1', 'r2'] as const) {
          const kk = fitOrigin(points.map((q) => [1 / Math.sqrt(q.U), q[key]] as const));
          if (!kk) continue;
          g.strokeStyle = withAlpha(orange(), 0.9);
          g.lineWidth = 1.6;
          g.setLineDash([6, 4]);
          g.beginPath();
          g.moveTo(X(0), Y(0));
          g.lineTo(X(INV_AXIS), Y(kk * INV_AXIS));
          g.stroke();
          g.setLineDash([]);
        }
      }
      // Messpunkte
      const now = performance.now();
      for (const q of points) {
        const pop = clamp((now - q.born) / 450, 0, 1);
        if (pop < 1) animating = true;
        const sc = ease.outBack(pop);
        for (const [rr, col] of [
          [q.r1, c1()],
          [q.r2, c2()],
        ] as const) {
          const x = X(xOf(q.U));
          const y = Y(rr);
          g.fillStyle = col;
          g.beginPath();
          g.arc(x, y, 4.5 * sc, 0, TAU);
          g.fill();
          g.strokeStyle = theme.bg;
          g.lineWidth = 1.6;
          g.stroke();
        }
      }
      g.restore();
      // aktueller Zustand
      const Ue = ease2('Uchart', p.U, 9);
      const breathe = prefersReducedMotion() || !ctx.clock.playing ? 0 : 0.5 + 0.5 * Math.sin(now / 320);
      for (const [rr, col] of [
        [r1Of(Ue), c1()],
        [r2Of(Ue), c2()],
      ] as const) {
        const x = X(xOf(Ue));
        const y = Y(rr);
        g.fillStyle = withAlpha(col, 0.18 + 0.1 * breathe);
        g.beginPath();
        g.arc(x, y, 10 + 3 * breathe, 0, TAU);
        g.fill();
        g.fillStyle = theme.bg;
        g.beginPath();
        g.arc(x, y, 5.5, 0, TAU);
        g.fill();
        g.strokeStyle = col;
        g.lineWidth = 2.6;
        g.stroke();
      }
      if (breathe > 0) animating = true;
      // Senkrechte bei U
      g.strokeStyle = withAlpha(orange(), 0.6);
      g.lineWidth = 1.2;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(X(xOf(Ue)), A.y + A.h);
      g.lineTo(X(xOf(Ue)), Y(r2Of(Ue)) + 10);
      g.stroke();
      g.setLineDash([]);
      if (!points.length) {
        g.font = `600 ${fs}px ${theme.font}`;
        // langen Hinweis nur, wenn er vollständig in den Diagrammbereich passt
        const msg = A.w >= 280 && g.measureText(ctx.t('empty')).width + 22 <= A.w - 8 ? ctx.t('empty') : ctx.t('emptyS');
        const w = Math.min(A.w - 8, g.measureText(msg).width + 22);
        const ex = ch === 'rU' ? A.x + A.w - w - 4 : A.x + 4;
        const ey = A.y + 4;
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.9)';
        roundRect(g, ex, ey, w, fs + 12, (fs + 12) / 2);
        g.fill();
        richText(msg, ex + w / 2, ey + (fs + 12) / 2 + 0.5, fs, theme.muted, 'center', 600);
      }
      g.restore();
    }

    function drawChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 200;
      const fs = sm ? 11 : 12;
      const ty = R.y + (sm ? 17 : 20);
      const title = ctx.t(chart() === 'rU' ? (R.w < 340 ? 'chartUS' : 'chartU') : R.w < 340 ? 'chartInvS' : 'chartInv');
      const tw = richText(title, R.x + 14, ty, fs + 1, theme.text, 'left', 750);
      // Legende
      let lx = R.x + R.w - 14;
      for (const [lab, col] of [
        [ctx.t('legend2'), c2()],
        [ctx.t('legend1'), c1()],
      ] as const) {
        const w = richWidth(lab, fs, 700);
        if (lx - w - 22 < R.x + 14 + tw + 10) break;
        richText(lab, lx, ty, fs, col, 'right', 700);
        g.fillStyle = col;
        g.beginPath();
        g.arc(lx - w - 10, ty, 4.5, 0, TAU);
        g.fill();
        lx -= w + 28;
      }
      if (chSwap.running) {
        const u = chSwap.t;
        if (u < 0.45) drawChartContent(R, fromCh, 1 - u / 0.45);
        else drawChartContent(R, shownCh, (u - 0.45) / 0.55);
      } else drawChartContent(R, shownCh, stage(0.35, 0.6));
      g.restore();
    }

    /* ---------- Karte „Elektronen als Welle“ ---------- */
    function drawInfo(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 160;
      const pad = sm ? 12 : 16;
      const ty = R.y + (sm ? 17 : 20);
      richText(ctx.t(R.w < 300 ? 'infoTitleS' : 'infoTitle'), R.x + pad, ty, sm ? 12 : 13, theme.text, 'left', 750);
      const U = ease2('Uinfo', p.U, 9);
      const v = electronSpeed(U * 1000);
      const lam = deBroglie(U * 1000) * 1e12;
      // Werte nur, wenn das passende Ergebnis nicht verdeckt ist (Schalter „Werte im Bild“ bzw. Aufgabenmodus)
      const valLam = !ctx.isHidden('lam');
      const valRing = !ctx.isHidden('ring');
      const rows: [string, string][] = [
        [`e · U = ½ · m · v²`, theme.muted],
        [`v = √(2 · e · U / m) = ${valLam ? `${sciCanvas(v, 2)} m/s` : '?'}`, theme.text],
        [`λ = h / (m · v) = ${valLam ? `${fx(lam, 1)} pm` : '?'}`, mixColor(blue(), theme.text, theme.dark ? 0.1 : 0.2)],
        [`r_1 = L · tan 2θ_1 = ${valRing ? `${fx(r1Of(U), 1)} mm` : '?'}`, c1()],
        [`r_2 = L · tan 2θ_2 = ${valRing ? `${fx(r2Of(U), 1)} mm` : '?'}`, c2()],
      ];
      if (R.h > 175) rows.splice(3, 0, [`2 · d · sin θ = λ`, theme.muted]);
      const top = ty + (sm ? 14 : 18);
      const avail = R.y + R.h - top - (sm ? 8 : 12);
      const lh = clamp(avail / rows.length, 15, sm ? 22 : 28);
      let y = top + lh / 2 + Math.max(0, (avail - lh * rows.length) / 3);
      for (const [txt, col] of rows) {
        let s = clamp(lh * 0.56, 11, sm ? 12.5 : 14);
        while (s > 10.5 && supWidth(txt, s) > R.w - 2 * pad) s -= 0.5;
        supText(txt, R.x + pad, y, s, col, 700);
        y += lh;
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const U = p.U * 1000;
      const lam = deBroglie(U);
      ctx.readout('lam', { html: tr('lam', { v: sciHtml(electronSpeed(U), 2), p: sciHtml(momentum(U), 2), lam: fx(lam * 1e12, 1), lamM: sciHtml(lam, 2) }) });
      const deg = (x: number | null) => (x === null ? '–' : fx((x * 180) / Math.PI, 2));
      ctx.readout('ring', {
        html: tr('ring', {
          t1: deg(braggAngle(D1, lam)),
          t2: deg(braggAngle(D2, lam)),
          r1: fx(r1Of(p.U), 1),
          r2: fx(r2Of(p.U), 1),
          a1: fx(ringRadiusApprox(U, D1) * 1000, 1),
          a2: fx(ringRadiusApprox(U, D2) * 1000, 1),
        }),
      });
      updateMeas();
      ctx.setAction('rec', { enabled: !ctx.locked });
      ctx.setAction('auto', { enabled: !ctx.locked });
    }

    function updateMeas(): void {
      if (!p.meas) {
        ctx.readout('meas', ctx.t('measOff'));
        return;
      }
      const k = Math.abs(p.rm - r1Of(p.U)) < 0.35 ? 1 : Math.abs(p.rm - r2Of(p.U)) < 0.35 ? 2 : 0;
      ctx.readout('meas', { html: tr('measOn', { r: fx(p.rm, 1), fit: k ? tr('measFit', { k: String(k) }) : '' }) });
    }

    /** Stand der λ-Spalte beim letzten Aufbau der Tabelle (Aufdecken einzelner Ergebnisse ruft kein `hiddenChange`). */
    let tableLam = true;
    function updateTable(): void {
      if (!points.length) {
        ctx.readout('table', ctx.t('none'));
        ctx.readout('fit', ctx.t('fitFew'));
      } else {
        // λ ist berechnet (Lösung von Aufgabe 1) und fehlt, solange „de-Broglie-Wellenlänge“ verdeckt ist
        const showLam = !ctx.isHidden('lam');
        tableLam = showLam;
        const head = [ctx.t('thU'), ctx.t('thR1'), ctx.t('thR2'), ...(showLam ? [ctx.t('thL')] : [])];
        const rows = points.map(
          (q) => `<tr><td>${fx(q.U, 1)}</td><td>${fx(q.r1, 1)}</td><td>${fx(q.r2, 1)}</td>${showLam ? `<td>${fx(deBroglie(q.U * 1000) * 1e12, 1)}</td>` : ''}</tr>`,
        );
        ctx.readout('table', { html: `<table class="mini-table"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>` });
        if (points.length < 2) ctx.readout('fit', ctx.t('fitFew'));
        else {
          // r in m über 1/√U mit U in V; Steigung zusätzlich in mm · √kV für die Anzeige
          const k1 = fitOrigin(points.map((q) => [1 / Math.sqrt(q.U * 1000), q.r1 / 1000] as const))!;
          const k2 = fitOrigin(points.map((q) => [1 / Math.sqrt(q.U * 1000), q.r2 / 1000] as const))!;
          const kmm = (k: number) => fx(k * 1000 * Math.sqrt(1000), 1);
          ctx.readout('fit', { html: tr('fit', { k1: kmm(k1), k2: kmm(k2), d1: fx(latticeFromSlope(k1) * 1e9, 3), d2: fx(latticeFromSlope(k2) * 1e9, 3) }) });
        }
      }
      ctx.setAction('clear', { enabled: points.length > 0 && !ctx.locked });
    }

    /* ---------- Ziehen des Messkreises ---------- */
    function hitMeas(px: number, py: number): boolean {
      if (!measHandle || ctx.locked || !p.meas) return false;
      if (Math.hypot(px - measHandle.x, py - measHandle.y) < 16) return true;
      // auch auf dem Kreis selbst greifen
      const S = lastScreen;
      if (!S) return false;
      const d = Math.hypot(px - S.cx, py - S.cy);
      return Math.abs(d - p.rm * S.k) < 7 && d < S.R;
    }
    function measTo(px: number, py: number): void {
      const S = lastScreen;
      if (!S) return;
      const rm = Math.round(clamp(Math.hypot(px - S.cx, py - S.cy) / S.k, 3, 40) * 10) / 10;
      if (rm !== p.rm) ctx.set({ rm });
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitMeas(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (!hitMeas(q.px, q.py)) return false;
        measDrag = true;
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (measDrag) measTo(q.px, q.py);
      },
      pointerUp: () => {
        measDrag = false;
        surface.setCursor(measHover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitMeas(q.px, q.py) : false;
        if (h !== measHover) {
          measHover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (source === 'init') {
          intro.play();
          if (prefersReducedMotion()) fillStatic();
          else queueMicrotask(() => ctx.clock.play());
          shownCh = chart();
        }
        if (source !== 'sim') autoRun = false;
        if (changed.has('U') && source !== 'init') {
          // alte Treffer passen nicht mehr zu den neuen Ringen: schnell ausblenden
          staleBefore = simT;
          staleAt = simT;
          if (prefersReducedMotion() || !ctx.clock.playing) fillStatic();
        }
        if (source === 'replace') {
          points = [];
          if (!prefersReducedMotion()) ctx.clock.play();
        }
        updateReadouts();
        updateTable();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'rec') {
          autoRun = false;
          record();
        } else if (id === 'auto') {
          points = [];
          autoRun = true;
          autoIdx = 0;
          autoWait = 0;
          if (!ctx.clock.playing && !prefersReducedMotion()) ctx.clock.play();
          ctx.set({ U: AUTO_U[0]! });
          if (prefersReducedMotion()) {
            // ohne Bewegung: Messreihe sofort
            for (const U of AUTO_U) points.push({ U, r1: noisy(r1Of(U), READ_NOISE, noiseRand), r2: noisy(r2Of(U), READ_NOISE, noiseRand), born: -1e9 });
            autoRun = false;
          }
          updateTable();
        } else if (id === 'clear') {
          autoRun = false;
          points = [];
          updateTable();
        }
        ctx.requestRender();
      },

      hiddenChange() {
        updateTable();
        ctx.requestRender();
      },

      tick(dt) {
        tickElectrons(Math.min(dt, 0.05));
      },

      resetTime() {
        flyers = [];
        hits = [];
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        if (chart() !== shownCh) {
          fromCh = shownCh;
          shownCh = chart();
          chSwap.play();
        }
        // ohne laufende Uhr trotzdem die Messreihe fortsetzen
        if (autoRun && !ctx.clock.playing) autoStep();
        if (points.length && tableLam === ctx.isHidden('lam')) updateTable();
        const lay = computeLayout();
        surface.begin();
        drawScene(lay.scene);
        drawChart(lay.chart, stage(0.2, 0.5));
        drawInfo(lay.info, stage(0.32, 0.5));
        if (animating || intro.running || chSwap.running || autoRun || measDrag || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
