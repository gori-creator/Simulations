import { defineSimulation, ease, FixedStepper, offscreenCanvas, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { amplitudeRatio, driveAngle, drivePhase, F0, integrate, OMEGA0, phaseShift, readPhasor, resonanceOmega, step, type Drive, type State } from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;
const TAU = 2 * Math.PI;
/** Belastungsgrenze der Spiralfeder (Auslenkung des Rades). */
const LIMIT = 120 * DEG;
/** Abstand der gespeicherten Messwerte (Simulationszeit) in s. */
const SAMPLE = 1 / 120;
/** Größte Erregerfrequenz in den Diagrammen (Hz). */
const F_MAX = 1.5;
/** Frequenzen der automatischen Messreihe (Hz), um f₀ dichter. */
const SWEEP = [0.1, 0.2, 0.28, 0.34, 0.39, 0.43, 0.46, 0.48, 0.5, 0.52, 0.54, 0.57, 0.61, 0.66, 0.73, 0.82, 0.95, 1.1, 1.3, 1.5];

type Speed = 'slow' | 'normal' | 'fast';
const SPEED: Record<Speed, number> = { slow: 0.25, normal: 1, fast: 4 };

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/**
 * Lage im Foto `rad.webp` (384 × 376 px, Frontansicht): Radmitte, Radius der
 * Kupferscheibe innerhalb des Skalenrings. Verwendet wird nur die Scheibe
 * (kreisförmig ausgeschnitten, ohne Skala mit Zahlen und ohne Fuß). Die
 * Spiralfeder des Fotos würde starr mitdrehen; sie wird deshalb bis `fill`
 * mit der Kupferfarbe übermalt, die ringsum bei `sample` gemessen wird
 * (die gebürstete Scheibe ändert ihre Helligkeit nur mit dem Winkel).
 */
const WHEEL_IMG = { cx: 192, cy: 182, r: 140, fill: 83, fade: 93, sample: [96, 106] as const };

/** Aufrunden auf einen „glatten“ Wert für Achsen (in Grad). */
function niceCeil(x: number): number {
  for (const v of [10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 140]) if (v >= x) return v;
  return 140;
}

function niceWindow(T: number): number {
  for (const w of [4, 5, 6, 8, 10, 15, 20, 30, 40, 60]) if (w >= T) return w;
  return 60;
}

interface Point {
  f: number;
  amp: number;
  shift: number;
  over: boolean;
}

interface Layout {
  scene: Rect;
  time: Rect;
  res: Rect;
  phase: Rect | null;
  tall: boolean;
}

interface Geo {
  r: Rect;
  small: boolean;
  cx: number;
  cy: number;
  /** Radius der Skala (außen) und des Rades (außen). */
  Rs: number;
  Rw: number;
  /** Länge des Erregerhebels. */
  lever: number;
  /** Motor (Achse) und Exzenterradius. */
  mx: number;
  my: number;
  re: number;
  /** Zeigerdiagramm. */
  card: Rect;
}

/**
 * Erzwungene Schwingung und Resonanz am Pohlschen Rad: Motor mit Exzenter,
 * Spiralfeder, Wirbelstrombremse; Einschwingvorgang, Resonanzkurve und
 * Phasenverschiebung als Messpunkte mit theoretischen Kurven, Zeigerdiagramm
 * und Resonanzkatastrophe.
 */
export default defineSimulation({
  id: 'resonanz',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.32, aspectNarrow: 0.42 },
  images: { wheel: 'rad.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fE',
      type: 'number',
      label: L('Erregerfrequenz f_E', 'Driving frequency f_E'),
      help: L('Drehfrequenz des Motors. Oder: Linie im Resonanzdiagramm ziehen.', 'Rotation frequency of the motor. Or drag the line in the resonance graph.'),
      min: 0.05,
      max: F_MAX,
      step: 0.01,
      default: 0.3,
      unit: 'Hz',
    },
    {
      key: 'damp',
      type: 'number',
      label: L('Dämpfung δ (Wirbelstrombremse)', 'Damping δ (eddy-current brake)'),
      help: L('Abklingkonstante; ein größerer Strom durch die Bremse dämpft stärker.', 'Decay constant; a larger current through the brake damps more strongly.'),
      min: 0.03,
      max: 1.5,
      step: 0.01,
      default: 0.25,
      unit: '1/s',
    },
    { key: 'amp', type: 'number', label: L('Erregeramplitude φ̂_E', 'Driving amplitude φ̂_E'), min: 2, max: 15, step: 1, default: 5, unit: '°' },
    { key: 'theory', type: 'boolean', group: 'view', label: L('Theoretische Kurven', 'Theoretical curves'), default: true },
    { key: 'phase', type: 'boolean', group: 'view', label: L('Diagramm der Phasenverschiebung', 'Graph of the phase shift'), default: true },
    {
      key: 'speed',
      type: 'choice',
      group: 'view',
      label: L('Ablauf', 'Speed'),
      options: [
        { value: 'slow', label: L('Zeitlupe', 'slow motion') },
        { value: 'normal', label: L('normal', 'normal') },
        { value: 'fast', label: L('Zeitraffer (×4)', 'fast (×4)') },
      ],
      default: 'normal',
    },
  ],
  actions: [
    { id: 'go', label: L('Start aus der Ruhe', 'Start from rest'), primary: true },
    { id: 'skip', label: L('Einschwingen abwarten', 'Wait until steady') },
    { id: 'auto', label: L('Resonanzkurve aufnehmen', 'Record resonance curve') },
    { id: 'clear', label: L('Messpunkte löschen', 'Clear data') },
  ],
  readouts: [
    { key: 'f0', label: L('Eigenfrequenz', 'Natural frequency') },
    { key: 'state', label: L('Messung', 'Measurement') },
    { key: 'amp', label: L('Amplitude (Theorie)', 'Amplitude (theory)'), spoiler: true },
    { key: 'shift', label: L('Phasenverschiebung (Theorie)', 'Phase shift (theory)'), spoiler: true },
    { key: 'table', label: L('Messwerte', 'Measured values') },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Langsame Erregung', 'Slow driving'), values: {} },
    { id: 'res', label: L('Resonanz: f_E = f₀', 'Resonance: f_E = f₀'), values: { fE: 0.5 } },
    { id: 'high', label: L('Schnelle Erregung: Gegenphase', 'Fast driving: antiphase'), values: { fE: 1 } },
    { id: 'strong', label: L('Starke Dämpfung', 'Strong damping'), values: { fE: 0.5, damp: 1 } },
    { id: 'weak', label: L('Schwache Dämpfung, Zeitraffer', 'Weak damping, fast'), values: { fE: 0.45, damp: 0.08, speed: 'fast' } },
    { id: 'cat', label: L('Resonanzkatastrophe', 'Resonance disaster'), values: { fE: 0.5, damp: 0.03, amp: 10 } },
  ],
  strings: {
    de: {
      canvas: 'Pohlsches Rad mit Spiralfeder, Motor mit Exzenter und Wirbelstrombremse, Zeigerdiagramm sowie Diagramme der Auslenkung über der Zeit, der Resonanzkurve und der Phasenverschiebung',
      axisT: 't in s',
      axisF: 'f_E in Hz',
      chipT: 'φ in °',
      chipAmp: 'Amplitude φ̂ in °',
      chipShift: 'Phasenverschiebung Δφ',
      rad: 'Rad',
      erreger: 'Erreger',
      motor: 'Motor',
      brake: 'Wirbelstrombremse',
      phasor: 'Zeigerdiagramm',
      lag: 'Δφ = {d}°',
      lagText: 'Das Rad hinkt um {d}° hinterher.',
      inPhase: 'Rad und Erreger schwingen fast gleichphasig.',
      quarter: 'Das Rad hinkt um etwa eine Viertelperiode hinterher.',
      anti: 'Rad und Erreger schwingen fast gegenphasig.',
      limit: 'Belastungsgrenze',
      settling: 'Einschwingen …',
      steady: 'eingeschwungen',
      broken: 'Resonanzkatastrophe: Belastungsgrenze überschritten!',
      brokenShort: 'Resonanzkatastrophe!',
      jump: 'Zeitsprung + {s} s',
      empty: 'Hier erscheinen die Messpunkte.',
      emptyHint: 'Warte, bis das Rad eingeschwungen ist.',
      f0: 'f₀',
      fR: 'f_[R]',
      fE: 'f_[E] = {f} Hz',
      top: 'f_[E] = {f} Hz · f₀ = 0,50 Hz',
      f0Text: '<var>f</var>₀ = 0,50 Hz (<var>T</var>₀ = 2,00 s); Resonanz bei <var>f</var><sub>R</sub> = √(<var>f</var>₀² − <var>δ</var>²/(2π²)) ≈ {fr} Hz',
      ampText: '<var>φ̂</var> = <var>φ̂</var><sub>E</sub> · <span class="frac"><span><var>ω</var>₀²</span><span>√((<var>ω</var>₀² − <var>ω</var><sub>E</sub>²)² + (2<var>δω</var><sub>E</sub>)²)</span></span> ≈ <strong>{a}°</strong> ({r}-fach)',
      shiftText: 'Δ<var>φ</var> = arctan <span class="frac"><span>2<var>δω</var><sub>E</sub></span><span><var>ω</var>₀² − <var>ω</var><sub>E</sub>²</span></span> ≈ <strong>{d}°</strong>',
      stateSettling: 'Einschwingen … (Amplitude ändert sich noch)',
      stateSteady: 'eingeschwungen: <var>φ̂</var> = {a}°, Δ<var>φ</var> = {d}° – als Messpunkt eingetragen',
      stateBroken: 'Resonanzkatastrophe: Die Auslenkung hat die Belastungsgrenze von ±120° überschritten. Dämpfung erhöhen oder Erregerfrequenz ändern.',
      stateAuto: 'Messreihe läuft: Punkt {i} von {n}',
      thF: 'f_E in Hz',
      thA: 'φ̂ in °',
      thD: 'Δφ in °',
      none: 'Noch keine Messwerte.',
      over: '> 120',
      now: 't = {t} s · φ = {p}° · φ_E = {e}°',
    },
    en: {
      canvas: 'Pohl’s wheel with a spiral spring, a motor with an eccentric and an eddy-current brake, a phasor diagram and graphs of the deflection against time, the resonance curve and the phase shift',
      axisT: 't in s',
      axisF: 'f_E in Hz',
      chipT: 'φ in °',
      chipAmp: 'amplitude φ̂ in °',
      chipShift: 'phase shift Δφ',
      rad: 'wheel',
      erreger: 'driver',
      motor: 'motor',
      brake: 'eddy-current brake',
      phasor: 'Phasor diagram',
      lag: 'Δφ = {d}°',
      lagText: 'The wheel lags behind by {d}°.',
      inPhase: 'Wheel and driver are almost in phase.',
      quarter: 'The wheel lags behind by about a quarter period.',
      anti: 'Wheel and driver are almost in antiphase.',
      limit: 'load limit',
      settling: 'settling …',
      steady: 'steady state',
      broken: 'Resonance disaster: load limit exceeded!',
      brokenShort: 'Resonance disaster!',
      jump: 'time jump + {s} s',
      empty: 'Your data points will appear here.',
      emptyHint: 'Wait until the wheel has settled.',
      f0: 'f₀',
      fR: 'f_[R]',
      fE: 'f_[E] = {f} Hz',
      top: 'f_[E] = {f} Hz · f₀ = 0.50 Hz',
      f0Text: '<var>f</var>₀ = 0.50 Hz (<var>T</var>₀ = 2.00 s); resonance at <var>f</var><sub>R</sub> = √(<var>f</var>₀² − <var>δ</var>²/(2π²)) ≈ {fr} Hz',
      ampText: '<var>φ̂</var> = <var>φ̂</var><sub>E</sub> · <span class="frac"><span><var>ω</var>₀²</span><span>√((<var>ω</var>₀² − <var>ω</var><sub>E</sub>²)² + (2<var>δω</var><sub>E</sub>)²)</span></span> ≈ <strong>{a}°</strong> ({r} times)',
      shiftText: 'Δ<var>φ</var> = arctan <span class="frac"><span>2<var>δω</var><sub>E</sub></span><span><var>ω</var>₀² − <var>ω</var><sub>E</sub>²</span></span> ≈ <strong>{d}°</strong>',
      stateSettling: 'settling … (the amplitude is still changing)',
      stateSteady: 'steady state: <var>φ̂</var> = {a}°, Δ<var>φ</var> = {d}° – recorded as a data point',
      stateBroken: 'Resonance disaster: the deflection exceeded the load limit of ±120°. Increase the damping or change the driving frequency.',
      stateAuto: 'recording: point {i} of {n}',
      thF: 'f_E in Hz',
      thA: 'φ̂ in °',
      thD: 'Δφ in °',
      none: 'No data yet.',
      over: '> 120',
      now: 't = {t} s · φ = {p}° · φ_E = {e}°',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const small = () => surface.width < 700;
    const radColor = () => ctx.theme.series[0]!;
    const eColor = () => ctx.theme.series[2]!;
    const shiftColor = () => ctx.theme.series[4]!;
    const red = () => ctx.theme.series[1]!;
    const n = (v: number, d: number) => fmt.num(v, d);

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const tall = w < 640 && h > w * 0.9;
      let scene: Rect;
      let col: Rect;
      if (!tall) {
        const sw = Math.round(w * (w < 760 ? 0.5 : 0.46));
        scene = { x: 0, y: 0, w: sw, h };
        col = { x: sw + 10, y: 0, w: w - sw - 10, h };
      } else {
        const sh = Math.round(Math.min(h * 0.5, w * 1.12));
        scene = { x: 0, y: 0, w, h: sh };
        col = { x: 0, y: sh + 8, w, h: h - sh - 8 };
      }
      const gap = 8;
      const shares = p.phase ? [0.32, 0.4, 0.28] : [0.4, 0.6];
      const avail = col.h - gap * (shares.length - 1);
      const rects: Rect[] = [];
      let y = col.y;
      for (const s of shares) {
        const hh = avail * s;
        rects.push({ x: col.x, y, w: col.w, h: hh });
        y += hh + gap;
      }
      return { scene, time: rects[0]!, res: rects[1]!, phase: p.phase ? rects[2]! : null, tall };
    }
    let lay = computeLayout();
    const HIDDEN: Rect = { x: -10, y: -10, w: 1, h: 1 };
    const plotOpts = { equalAspect: false, pan: false, zoom: false, controls: false } as const;
    const plotT = new Plot(surface, { ...plotOpts, x: [0, 10], y: [-10, 10], region: () => lay.time, xAxis: { label: ctx.t('axisT') }, yAxis: { label: '', numbers: false } });
    const plotR = new Plot(surface, { ...plotOpts, x: [0, F_MAX], y: [0, 40], region: () => lay.res, xAxis: { label: ctx.t('axisF') }, yAxis: { label: '', numbers: false } });
    const plotP = new Plot(surface, { ...plotOpts, x: [0, F_MAX], y: [0, 180], region: () => lay.phase ?? HIDDEN, xAxis: { label: ctx.t('axisF') }, yAxis: { label: '', numbers: false } });

    /* ---------- Zustand ---------- */
    /** Phasenversatz des Motors; bei einer neuen Erregerfrequenz so gesetzt, dass die Drehung stetig bleibt. */
    let phase0 = 0;
    let lastFE = p.fE;
    const drive = (): Drive => {
      if (p.fE !== lastFE) {
        const psi = TAU * lastFE * t + phase0;
        phase0 = psi - TAU * p.fE * t;
        lastFE = p.fE;
      }
      return { ampE: p.amp * DEG, omegaE: TAU * p.fE, delta: p.damp, omega0: OMEGA0, phase0 };
    };
    let s: State = [0, 0];
    let t = 0;
    let nextSample = 0;
    let hist: { t: number[]; phi: number[]; e: number[] } = { t: [], phi: [], e: [] };
    const stepper = new FixedStepper(0.001);
    let points: Point[] = [];
    let broken = false;
    /** Einschwingen verfolgen: Amplituden der letzten Erregerperioden. */
    let cycleIndex = 0;
    let cycleMax = 0;
    let amps: number[] = [];
    let tChange = 0;
    let steady = false;
    let liveAmp = 0;
    let liveShift = 0;
    let auto: { i: number; next: number } | null = null;
    let jumpNote: { s: number; until: number } | null = null;
    const pop = new Tween(500, ease.outBack);
    const flash = new Tween(900, ease.outCubic);
    let rangeT = 10;
    let wasSteady = false;
    let lastFrame = performance.now();

    function resetTracking(): void {
      cycleIndex = Math.floor(drivePhase(drive(), t) / TAU);
      cycleMax = Math.abs(s[0]);
      amps = [];
      tChange = t;
      steady = false;
    }

    function restart(): void {
      s = [0, 0];
      t = 0;
      phase0 = 0;
      lastFE = p.fE;
      nextSample = 0;
      hist = { t: [0], phi: [0], e: [0] };
      stepper.reset();
      broken = false;
      liveAmp = 0;
      liveShift = 0;
      jumpNote = null;
      resetTracking();
    }

    function record(over = false): void {
      const d = drive();
      const ph = readPhasor(d, t, s);
      const pt: Point = { f: p.fE, amp: over ? LIMIT : ph.amp, shift: over ? phaseShift(d.omegaE, OMEGA0, p.damp) : clamp(ph.shift, 0, Math.PI), over };
      points = [...points.filter((q) => Math.abs(q.f - pt.f) > 0.004), pt].sort((a, b) => a.f - b.f);
      pop.play();
      updateReadouts();
    }

    /** Einschwingvorgang überspringen: lange genug weiterrechnen (ohne Anzeige). */
    function skipTransient(silent: boolean): void {
      const d = drive();
      const duration = clamp(7 / p.damp, 12, 240);
      const res = integrate(d, t, s, duration, 0.002, LIMIT);
      if (res.exceeded) {
        if (silent) {
          // Messreihe: Punkt über der Belastungsgrenze markieren, Rad anhalten und weitermachen
          t = res.t;
          s = [0, 0];
          record(true);
        } else {
          t = res.t;
          s = [Math.sign(res.s[0]) * LIMIT, 0];
          breakDown();
        }
      } else {
        t = res.t;
        s = res.s;
        record(false);
        steady = true;
      }
      const ph = readPhasor(d, t, s);
      liveAmp = ph.amp;
      liveShift = ph.shift;
      hist = { t: [t], phi: [s[0]], e: [driveAngle(d, t)] };
      nextSample = t + SAMPLE;
      stepper.reset();
      jumpNote = { s: duration, until: performance.now() + 2200 };
      resetTracking();
      steady = !res.exceeded;
    }

    function breakDown(): void {
      broken = true;
      auto = null;
      ctx.clock.pause();
      flash.play();
      updateReadouts();
    }

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      ctx.readout('now', tr('now', { t: fmt.fixed(t, 2), p: n(s[0] / DEG, 1), e: n(driveAngle(drive(), t) / DEG, 1) }));
    }

    function updateReadouts(): void {
      const d = drive();
      const fr = resonanceOmega(OMEGA0, p.damp) / TAU;
      ctx.readout('f0', { html: tr('f0Text', { fr: n(fr, 3) }) });
      const ratio = amplitudeRatio(d.omegaE, OMEGA0, p.damp);
      ctx.readout('amp', { html: tr('ampText', { a: n(p.amp * ratio, 1), r: n(ratio, 2) }) });
      ctx.readout('shift', { html: tr('shiftText', { d: n(phaseShift(d.omegaE, OMEGA0, p.damp) / DEG, 0) }) });
      if (broken) ctx.readout('state', ctx.t('stateBroken'));
      else if (auto) ctx.readout('state', tr('stateAuto', { i: String(Math.min(auto.i + 1, SWEEP.length)), n: String(SWEEP.length) }));
      else if (steady) ctx.readout('state', { html: tr('stateSteady', { a: n(liveAmp / DEG, 1), d: n(clamp(liveShift, 0, Math.PI) / DEG, 0) }) });
      else ctx.readout('state', ctx.t('stateSettling'));
      if (points.length) {
        const rows = points
          .map((q) => `<tr><td>${n(q.f, 2)}</td><td>${q.over ? ctx.t('over') : n(q.amp / DEG, 1)}</td><td>${q.over ? '–' : n(q.shift / DEG, 0)}</td></tr>`)
          .join('');
        ctx.readout('table', { html: `<table class="mini-table"><tr><th>${ctx.t('thF')}</th><th>${ctx.t('thA')}</th><th>${ctx.t('thD')}</th></tr>${rows}</table>` });
      } else ctx.readout('table', ctx.t('none'));
      ctx.setAction('skip', { enabled: !ctx.locked && !broken });
      ctx.setAction('auto', { enabled: !ctx.locked, label: ctx.lang === 'de' ? (auto ? 'Messreihe anhalten' : 'Resonanzkurve aufnehmen') : auto ? 'Stop recording' : 'Record resonance curve' });
      ctx.setAction('clear', { enabled: !ctx.locked && points.length > 0 });
      updateNow();
    }

    /* ---------- Ziehen: Erregerfrequenz im Resonanzdiagramm ---------- */
    plotR.addHandle({
      get: () => [p.fE, Math.max(0, liveAmp / DEG)],
      set: (x) => {
        auto = null;
        ctx.set({ fE: clamp(x, 0.05, F_MAX) });
      },
      axis: 'x',
      enabled: () => !ctx.locked,
      color: () => eColor(),
    });
    plotP.addHandle({
      get: () => [p.fE, clamp(liveShift, 0, Math.PI) / DEG],
      set: (x) => {
        auto = null;
        ctx.set({ fE: clamp(x, 0.05, F_MAX) });
      },
      axis: 'x',
      enabled: () => !ctx.locked && p.phase,
      color: () => eColor(),
    });

    /* ---------- Zeichenhilfen ---------- */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\[([^\]]*)\]/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sub: false });
        out.push({ t: mm[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }

    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const g = surface.g;
      const theme = ctx.theme;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const sz = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${sz}px ${theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): number {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center', false);
      return w;
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

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 10): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(head, len * 0.6);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5);
      g.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5);
      g.closePath();
      g.fill();
    }

    /** Etikett oben links im Diagramm (Achsenname), gibt das Rechteck zurück. */
    function chip(r: Rect, x: number, label: string, color: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const sz = small() ? 11 : 12;
      const w = richWidth(label, sz) + 12;
      const h = sz + 8;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)';
      roundRect(g, x, r.y + 5, w, h, 6);
      g.fill();
      richText(label, x + 6, r.y + 5 + h / 2 + 0.5, sz, color, 'left', false);
      return { x, y: r.y + 5, w, h };
    }

    function frame(r: Rect): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      g.stroke();
      g.restore();
    }

    /* ---------- Szene ---------- */
    function buildGeo(r: Rect): Geo {
      const sm = small();
      const pad = sm ? 10 : 14;
      const top = r.y + (sm ? 34 : 40);
      const wheelH = (r.h - (top - r.y)) * (lay.tall ? 0.66 : 0.6);
      const Rs = Math.max(60, Math.min(r.w * 0.36, wheelH / 2 - 6));
      const cx = r.x + pad + Rs + 4;
      const cy = top + Rs + 4;
      const lever = Rs + (sm ? 20 : 26);
      const re = lever * Math.sin(p.amp * DEG);
      const mx = cx + lever;
      const my = Math.min(cy + Rs + (sm ? 46 : 60) + re, r.y + r.h - re - (sm ? 26 : 34));
      const cardTop = cy + Rs + (sm ? 26 : 34);
      const cardRight = mx - re - (sm ? 30 : 40);
      const card: Rect = { x: r.x + pad, y: cardTop, w: Math.max(80, cardRight - r.x - pad), h: Math.max(60, r.y + r.h - pad - cardTop) };
      return { r, small: sm, cx, cy, Rs, Rw: Rs - (sm ? 22 : 26), lever, mx, my, re, card };
    }

    /** Punkt auf einem Kreis um die Radachse; a = Winkel von oben im Uhrzeigersinn. */
    const polar = (g0: Geo, a: number, rr: number): [number, number] => [g0.cx + rr * Math.sin(a), g0.cy - rr * Math.cos(a)];

    function drawScale(g0: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const inner = g0.Rw + 4;
      const outer = g0.Rs;
      const a0 = -150 * DEG;
      const a1 = 150 * DEG;
      // Skalenring (feststehend)
      g.save();
      g.beginPath();
      g.arc(g0.cx, g0.cy, outer, a0 - Math.PI / 2, a1 - Math.PI / 2);
      g.arc(g0.cx, g0.cy, inner, a1 - Math.PI / 2, a0 - Math.PI / 2, true);
      g.closePath();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = dark ? '#d9cfae' : '#f6efd6';
      g.fill();
      g.restore();
      // Ausschlag (Amplitude) als Band
      const A = Math.min(liveAmp, 150 * DEG);
      if (A > 0.5 * DEG) {
        g.fillStyle = withAlpha(radColor(), dark ? 0.32 : 0.22);
        g.beginPath();
        g.arc(g0.cx, g0.cy, inner + 7, -A - Math.PI / 2, A - Math.PI / 2);
        g.arc(g0.cx, g0.cy, inner, A - Math.PI / 2, -A - Math.PI / 2, true);
        g.closePath();
        g.fill();
      }
      // Belastungsgrenze
      g.fillStyle = withAlpha(red(), flash.running ? 0.35 + 0.5 * (1 - flash.value) : 0.28);
      for (const sgn of [-1, 1]) {
        g.beginPath();
        g.arc(g0.cx, g0.cy, outer, sgn > 0 ? LIMIT - Math.PI / 2 : a0 - Math.PI / 2, sgn > 0 ? a1 - Math.PI / 2 : -LIMIT - Math.PI / 2);
        g.arc(g0.cx, g0.cy, inner, sgn > 0 ? a1 - Math.PI / 2 : -LIMIT - Math.PI / 2, sgn > 0 ? LIMIT - Math.PI / 2 : a0 - Math.PI / 2, true);
        g.closePath();
        g.fill();
      }
      // Teilung
      const ink = '#3d2f0c';
      g.strokeStyle = ink;
      g.lineCap = 'butt';
      for (let dgr = -150; dgr <= 150; dgr += 5) {
        const a = dgr * DEG;
        const major = dgr % 30 === 0;
        const mid = dgr % 10 === 0;
        const len = major ? 8 : mid ? 5.5 : 3;
        const [x0, y0] = polar(g0, a, inner);
        const [x1, y1] = polar(g0, a, inner + len);
        g.lineWidth = major ? 1.4 : 1;
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
        g.stroke();
        if (major) {
          const [tx, ty] = polar(g0, a, inner + (outer - inner) * 0.66);
          g.save();
          g.translate(tx, ty);
          g.rotate(a);
          text(g, dgr === 0 ? '0' : `${dgr < 0 ? '−' : ''}${Math.abs(dgr)}`, 0, 0.5, { font: `700 ${g0.small ? 8.5 : 9.5}px ${theme.font}`, color: Math.abs(dgr) >= 120 ? '#8a1f1f' : ink });
          g.restore();
        }
      }
    }

    function drawSpiral(g0: Geo, phi: number, phiE: number, hot: boolean): void {
      const g = surface.g;
      const rin = g0.small ? 9 : 11;
      const rout = g0.Rw * 0.46;
      const turns = 4;
      const N = 220;
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const pass of [0, 1]) {
        g.strokeStyle = pass === 0 ? 'rgba(0,0,0,0.35)' : hot ? red() : ctx.theme.dark ? '#d3dae3' : '#7e8794';
        g.lineWidth = pass === 0 ? 3.2 : 1.9;
        g.beginPath();
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          const rr = rin + (rout - rin) * u;
          // Winkel von rechts (3 Uhr) im Uhrzeigersinn: innen dreht das Rad, außen der Erregerhebel
          const a = -TAU * turns * (1 - u) + phi * (1 - u) + phiE * u;
          const x = g0.cx + rr * Math.cos(a) + (pass === 0 ? 0.8 : 0);
          const y = g0.cy + rr * Math.sin(a) + (pass === 0 ? 1.2 : 0);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      g.restore();
    }

    /** Farben der Kupferscheibe je Winkel (aus dem Foto gemessen, einmal je Bild). */
    let wheelColors: { img: HTMLImageElement; colors: string[] | null } | null = null;
    function sampleWheel(img: HTMLImageElement): string[] | null {
      if (wheelColors?.img === img) return wheelColors.colors;
      let colors: string[] | null = null;
      try {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const cg = c.getContext('2d')!;
        cg.drawImage(img, 0, 0);
        const data = cg.getImageData(0, 0, img.width, img.height).data;
        colors = [];
        for (let i = 0; i < 180; i++) {
          let r = 0;
          let gg = 0;
          let b = 0;
          let n = 0;
          for (let da = -0.8; da <= 0.8; da += 0.4) {
            const a = ((i * 2 + da) * Math.PI) / 180;
            for (let rr = WHEEL_IMG.sample[0]; rr <= WHEEL_IMG.sample[1]; rr += 2) {
              const x = Math.round(WHEEL_IMG.cx + rr * Math.sin(a));
              const y = Math.round(WHEEL_IMG.cy - rr * Math.cos(a));
              const k = (y * img.width + x) * 4;
              r += data[k]!;
              gg += data[k + 1]!;
              b += data[k + 2]!;
              n++;
            }
          }
          colors.push(`rgb(${Math.round(r / n)},${Math.round(gg / n)},${Math.round(b / n)})`);
        }
      } catch {
        colors = null;
      }
      wheelColors = { img, colors };
      return colors;
    }

    /** Kupferscheibe aus dem Foto (kreisförmig, Feder übermalt), vorab gerendert. */
    let wheelSprite: { key: string; canvas: HTMLCanvasElement } | null = null;
    function photoWheel(img: HTMLImageElement, Rw: number): HTMLCanvasElement | null {
      const key = `${Math.round(Rw * 2)}|${surface.dpr}`;
      if (wheelSprite?.key === key) return wheelSprite.canvas;
      const colors = sampleWheel(img);
      if (!colors) return null;
      const d = Rw * 2;
      const k = Rw / WHEEL_IMG.r;
      const { canvas, g } = offscreenCanvas(d, d, surface.dpr);
      g.save();
      g.beginPath();
      g.arc(Rw, Rw, Rw, 0, TAU);
      g.clip();
      g.drawImage(img, WHEEL_IMG.cx - WHEEL_IMG.r, WHEEL_IMG.cy - WHEEL_IMG.r, WHEEL_IMG.r * 2, WHEEL_IMG.r * 2, 0, 0, d, d);
      g.restore();
      // Mitte (mit der starren Feder des Fotos) in der gemessenen Kupferfarbe übermalen, weich auslaufend
      const fill = offscreenCanvas(d, d, surface.dpr);
      const f = fill.g;
      const R = WHEEL_IMG.fade * k;
      for (let i = 0; i < 180; i++) {
        const a0 = ((i * 2 - 1.3) * Math.PI) / 180 - Math.PI / 2;
        const a1 = ((i * 2 + 1.3) * Math.PI) / 180 - Math.PI / 2;
        f.fillStyle = colors[i]!;
        f.beginPath();
        f.moveTo(Rw, Rw);
        f.arc(Rw, Rw, R, a0, a1);
        f.closePath();
        f.fill();
      }
      f.globalCompositeOperation = 'destination-in';
      const mask = f.createRadialGradient(Rw, Rw, 0, Rw, Rw, R);
      mask.addColorStop(0, 'rgba(0,0,0,1)');
      mask.addColorStop(WHEEL_IMG.fill / WHEEL_IMG.fade, 'rgba(0,0,0,1)');
      mask.addColorStop(1, 'rgba(0,0,0,0)');
      f.fillStyle = mask;
      f.fillRect(0, 0, d, d);
      g.drawImage(fill.canvas, 0, 0, d, d);
      wheelSprite = { key, canvas };
      return canvas;
    }

    function drawWheel(g0: Geo, phi: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const Rw = g0.Rw;
      const rim = g0.small ? 11 : 14;
      g.save();
      g.translate(g0.cx, g0.cy);
      const img = ctx.images.get('wheel');
      const photo = img ? photoWheel(img, Rw) : null;
      if (photo) {
        // Foto: Kupferscheibe dreht sich als Ganzes; Schatten der (runden) Scheibe steht fest
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.3)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 3;
        g.fillStyle = '#9a5a2c';
        g.beginPath();
        g.arc(0, 0, Rw - 0.5, 0, TAU);
        g.fill();
        g.restore();
        g.save();
        g.rotate(phi);
        g.drawImage(photo, -Rw, -Rw, Rw * 2, Rw * 2);
        g.restore();
        g.strokeStyle = 'rgba(60,25,5,0.45)';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(0, 0, Rw - 0.5, 0, TAU);
        g.stroke();
      } else {
        // Speichen (drehen mit)
        g.save();
        g.rotate(phi);
        g.strokeStyle = dark ? '#8a6a4f' : '#9a6b45';
        g.lineWidth = g0.small ? 4 : 5;
        g.lineCap = 'round';
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          g.beginPath();
          g.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
          g.lineTo(Math.cos(a) * (Rw - rim + 2), Math.sin(a) * (Rw - rim + 2));
          g.stroke();
        }
        g.restore();
        // Kupferring
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.3)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 3;
        const cu = g.createRadialGradient(-Rw * 0.3, -Rw * 0.35, Rw * 0.2, 0, 0, Rw);
        cu.addColorStop(0, '#f0b98a');
        cu.addColorStop(0.55, '#c47a43');
        cu.addColorStop(0.85, '#9a5a2c');
        cu.addColorStop(1, '#7a4420');
        g.fillStyle = cu;
        g.beginPath();
        g.arc(0, 0, Rw, 0, TAU);
        g.arc(0, 0, Rw - rim, 0, TAU, true);
        g.fill('evenodd');
        g.restore();
        // Glanzkante
        g.strokeStyle = 'rgba(255,230,200,0.55)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.arc(0, 0, Rw - 1.5, Math.PI * 1.05, Math.PI * 1.6);
        g.stroke();
        g.strokeStyle = 'rgba(60,25,5,0.5)';
        g.beginPath();
        g.arc(0, 0, Rw - rim + 0.8, 0, TAU);
        g.stroke();
      }
      // Zeiger am Rad (zeigt in die Skala)
      g.save();
      g.rotate(phi);
      g.fillStyle = dark ? '#f4f6f8' : '#1b2330';
      g.beginPath();
      g.moveTo(-3.5, -Rw + 2);
      g.lineTo(3.5, -Rw + 2);
      g.lineTo(1.4, -g0.Rs + 3);
      g.lineTo(-1.4, -g0.Rs + 3);
      g.closePath();
      g.fill();
      g.restore();
      g.restore();
    }

    function drawHub(g0: Geo): void {
      const g = surface.g;
      const rad = g0.small ? 9 : 11;
      const grad = g.createRadialGradient(g0.cx - rad * 0.3, g0.cy - rad * 0.3, 1, g0.cx, g0.cy, rad);
      grad.addColorStop(0, '#f2f4f7');
      grad.addColorStop(1, '#6d7682');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(g0.cx, g0.cy, rad, 0, TAU);
      g.fill();
      g.fillStyle = '#3a414b';
      g.beginPath();
      g.arc(g0.cx, g0.cy, rad * 0.35, 0, TAU);
      g.fill();
    }

    function drawBrake(g0: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = g0.small;
      const x = g0.cx;
      const yTop = g0.cy + g0.Rw - (sm ? 16 : 20);
      const w = sm ? 24 : 30;
      const hPole = sm ? 30 : 38;
      // Feld (je stärker die Dämpfung, desto deutlicher)
      const k = clamp(p.damp / 1.5, 0, 1);
      if (k > 0.03) {
        const glow = g.createRadialGradient(x, yTop + hPole * 0.4, 2, x, yTop + hPole * 0.4, w * 1.6);
        glow.addColorStop(0, withAlpha(radColor(), 0.15 + 0.45 * k));
        glow.addColorStop(1, withAlpha(radColor(), 0));
        g.fillStyle = glow;
        g.beginPath();
        g.arc(x, yTop + hPole * 0.4, w * 1.6, 0, TAU);
        g.fill();
      }
      // Polschuh (vor dem Rad)
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 2;
      const iron = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      iron.addColorStop(0, '#3c434d');
      iron.addColorStop(0.5, '#8d96a3');
      iron.addColorStop(1, '#3c434d');
      g.fillStyle = iron;
      roundRect(g, x - w / 2, yTop, w, hPole, 3);
      g.fill();
      g.restore();
      // Spule
      const cw = w + (sm ? 12 : 16);
      const ch = sm ? 20 : 26;
      const cyc = yTop + hPole - 2;
      const coil = g.createLinearGradient(0, cyc, 0, cyc + ch);
      coil.addColorStop(0, '#e19a52');
      coil.addColorStop(0.5, '#b8692b');
      coil.addColorStop(1, '#8a4a1c');
      g.fillStyle = coil;
      roundRect(g, x - cw / 2, cyc, cw, ch, 4);
      g.fill();
      g.strokeStyle = 'rgba(70,30,5,0.45)';
      g.lineWidth = 1;
      g.beginPath();
      for (let yy = cyc + 3; yy < cyc + ch - 1; yy += 3) {
        g.moveTo(x - cw / 2 + 2, yy);
        g.lineTo(x + cw / 2 - 2, yy);
      }
      g.stroke();
      // Kabel
      g.strokeStyle = dark ? '#c9a24a' : '#3a414b';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x + cw / 2, cyc + ch * 0.5);
      g.bezierCurveTo(x + cw / 2 + 14, cyc + ch * 0.5, x + cw / 2 + 10, cyc + ch + 12, x + cw / 2 + 26, cyc + ch + 10);
      g.stroke();
      if (!sm || g0.Rs > 100) text(g, ctx.t('brake'), x - cw / 2 - 6, cyc + ch * 0.5, { font: `600 ${sm ? 10 : 11}px ${theme.font}`, color: theme.muted, align: 'right' });
    }

    function drawDrive(g0: Geo, phiE: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = g0.small;
      const d = drive();
      const psi = drivePhase(d, t);
      // Hebelende und Exzenterzapfen
      const lx = g0.cx + g0.lever * Math.cos(phiE);
      const ly = g0.cy + g0.lever * Math.sin(phiE);
      const px = g0.mx + g0.re * Math.cos(psi + Math.PI / 2) * -1;
      const py = g0.my + g0.re * Math.sin(psi);
      // Motorgehäuse
      const box = Math.max(g0.re * 2 + (sm ? 18 : 24), sm ? 40 : 52);
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const body = g.createLinearGradient(g0.mx - box / 2, 0, g0.mx + box / 2, 0);
      body.addColorStop(0, dark ? '#2b3340' : '#3c4552');
      body.addColorStop(0.5, dark ? '#4a5463' : '#5d6878');
      body.addColorStop(1, dark ? '#2b3340' : '#3c4552');
      g.fillStyle = body;
      roundRect(g, g0.mx - box / 2, g0.my - box / 2, box, box, 8);
      g.fill();
      g.restore();
      text(g, ctx.t('motor'), g0.mx, g0.my + box / 2 + (sm ? 9 : 11), { font: `600 ${sm ? 10 : 11}px ${theme.font}`, color: theme.muted });
      // Exzenterscheibe (dreht)
      const dr = g0.re + (sm ? 7 : 9);
      const disk = g.createRadialGradient(g0.mx - dr * 0.3, g0.my - dr * 0.3, 2, g0.mx, g0.my, dr);
      disk.addColorStop(0, '#eef1f5');
      disk.addColorStop(1, '#8a939f');
      g.fillStyle = disk;
      g.beginPath();
      g.arc(g0.mx, g0.my, dr, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.25)';
      g.lineWidth = 1;
      g.stroke();
      // Markierung auf der Scheibe
      g.strokeStyle = 'rgba(40,46,56,0.55)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(g0.mx, g0.my);
      g.lineTo(px, py);
      g.stroke();
      g.fillStyle = '#3a414b';
      g.beginPath();
      g.arc(g0.mx, g0.my, 3, 0, TAU);
      g.fill();
      // Schubstange
      g.strokeStyle = dark ? '#c3cbd6' : '#5d6570';
      g.lineWidth = sm ? 3 : 3.5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(lx, ly);
      g.stroke();
      g.fillStyle = eColor();
      g.beginPath();
      g.arc(px, py, sm ? 4 : 5, 0, TAU);
      g.fill();
      // Erregerhebel (an der Achse, außen an der Spiralfeder)
      const r0 = g0.Rw * 0.46;
      g.strokeStyle = dark ? '#aeb7c4' : '#4a5361';
      g.lineWidth = sm ? 4 : 5;
      g.beginPath();
      g.moveTo(g0.cx + r0 * Math.cos(phiE), g0.cy + r0 * Math.sin(phiE));
      g.lineTo(lx, ly);
      g.stroke();
      g.fillStyle = eColor();
      g.beginPath();
      g.arc(lx, ly, sm ? 4 : 5, 0, TAU);
      g.fill();
      richText(ctx.t('erreger'), lx + 2, ly - (sm ? 12 : 14), sm ? 10.5 : 11.5, eColor(), 'center');
    }

    function drawPhasor(g0: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = g0.small;
      const R0 = g0.card;
      card(R0);
      const pad = sm ? 8 : 12;
      richText(ctx.t('phasor'), R0.x + pad, R0.y + (sm ? 13 : 15), sm ? 11 : 12, theme.text, 'left', false);
      const d = drive();
      const shift = clamp(liveShift, -Math.PI, Math.PI);
      // flache Karte (Handy): Kreis rechts in voller Höhe, Titel und Δφ links
      const wide = R0.w > 1.7 * R0.h;
      const footer = wide ? 6 : sm ? 26 : 30;
      const avail = wide ? Math.min(R0.w * 0.55, R0.h - 12) : Math.min(R0.w - 2 * pad, R0.h - (sm ? 26 : 30) - footer);
      const R = Math.max(14, avail / 2 - 4);
      const cx = wide ? R0.x + R0.w - pad - 22 - avail / 2 : R0.x + R0.w / 2;
      const cy = wide ? R0.y + R0.h / 2 : R0.y + (sm ? 26 : 30) + avail / 2;
      g.strokeStyle = withAlpha(theme.text, 0.25);
      g.lineWidth = 1;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(cx - R - 4, cy);
      g.lineTo(cx + R + 4, cy);
      g.stroke();
      const aE = drivePhase(d, t);
      const aR = aE - (steady || liveAmp > 0.2 * DEG ? shift : 0);
      // Zeigerlängen im Verhältnis der Amplituden (der längere füllt den Kreis, der kürzere bleibt sichtbar)
      const q = liveAmp / (p.amp * DEG);
      const lenE = q > 1 ? Math.max(R * 0.16, (R * 0.95) / q) : R * 0.95;
      const lenR = q > 1 ? R * 0.95 : Math.max(R * 0.12, R * 0.95 * q);
      // Winkel zwischen den Zeigern
      if (liveAmp > 0.2 * DEG && Math.abs(shift) > 2 * DEG) {
        const rr = Math.max(10, Math.min(R * 0.42, sm ? 22 : 28, 0.8 * Math.min(lenE, lenR)));
        g.fillStyle = withAlpha(shiftColor(), 0.16);
        g.strokeStyle = shiftColor();
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, rr, -aE, -aR, shift < 0);
        g.closePath();
        g.fill();
        g.beginPath();
        g.arc(cx, cy, rr, -aE, -aR, shift < 0);
        g.stroke();
      }
      arrowPx(cx, cy, cx + lenE * Math.cos(aE), cy - lenE * Math.sin(aE), eColor(), sm ? 2.6 : 3, sm ? 9 : 10);
      if (liveAmp > 0.2 * DEG) arrowPx(cx, cy, cx + lenR * Math.cos(aR), cy - lenR * Math.sin(aR), radColor(), sm ? 2.8 : 3.2, sm ? 9 : 11);
      g.fillStyle = theme.text;
      g.beginPath();
      g.arc(cx, cy, 2.4, 0, TAU);
      g.fill();
      // Beschriftungen an den Spitzen
      const lab = (a: number, len: number, str: string, color: string) => {
        const lx = cx + (len + 12) * Math.cos(a);
        const ly = cy - (len + 12) * Math.sin(a);
        richText(str, clamp(lx, R0.x + 22, R0.x + R0.w - 22), clamp(ly, R0.y + 26, R0.y + R0.h - footer), sm ? 10.5 : 11.5, color, 'center');
      };
      lab(aE, lenE, ctx.t('erreger'), eColor());
      if (liveAmp > 0.2 * DEG) lab(aR, lenR, ctx.t('rad'), radColor());
      // Fußzeile: Phasenverschiebung
      // vorzeichenrichtig wie der Bogen (negativ nur kurz beim Einschwingen: das Rad eilt voraus)
      const dd = shift / DEG;
      const msg = liveAmp < 0.2 * DEG ? '' : tr('lag', { d: n(dd, 0) });
      if (msg && wide) richText(msg, R0.x + pad, R0.y + R0.h - 16, sm ? 12 : 13, shiftColor(), 'left', false);
      else if (msg) richText(msg, cx, R0.y + R0.h - footer / 2 - 2, sm ? 12 : 13, shiftColor(), 'center', false);
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const g0 = buildGeo(r);
      const sm = g0.small;
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      const wall = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f1f4f8');
      wall.addColorStop(1, dark ? '#101824' : '#e1e7ee');
      g.fillStyle = wall;
      g.fillRect(r.x, r.y, r.w, r.h);
      // Grundplatte hinter dem Rad
      const plateR = g0.Rs + (sm ? 8 : 10);
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.fillStyle = dark ? '#222c3b' : '#dfe5ec';
      roundRect(g, g0.cx - plateR, g0.cy - plateR, plateR * 2, plateR * 2 + (sm ? 10 : 14), 18);
      g.fill();
      g.restore();
      const d = drive();
      const phiE = driveAngle(d, t);
      drawScale(g0);
      drawWheel(g0, s[0]);
      drawSpiral(g0, s[0], phiE, broken);
      drawHub(g0);
      drawBrake(g0);
      drawDrive(g0, phiE);
      drawPhasor(g0);
      // Anzeigen oben
      const size = sm ? 11 : 12;
      pill(r.x + 8, r.y + 8, `t = ${fmt.fixed(t, 1)} s`, theme.text, 'left', size);
      pill(r.x + r.w - 8, r.y + 8, tr('top', { f: fmt.fixed(p.fE, 2) }), theme.text, 'right', size);
      if (broken) {
        const k = flash.running ? 1 + 0.08 * Math.sin(Math.PI * flash.t) : 1;
        g.save();
        g.translate(g0.cx, g0.cy);
        g.scale(k, k);
        pill(0, -11, ctx.t(sm ? 'brokenShort' : 'broken'), red(), 'center', size + 1, withAlpha(red(), 0.94));
        g.restore();
      } else if (jumpNote && performance.now() < jumpNote.until) {
        pill(g0.cx, g0.cy + (sm ? 22 : 26), tr('jump', { s: fmt.num(jumpNote.s, 0) }), theme.muted, 'center', size);
      }
      g.restore();
    }

    /* ---------- Diagramme ---------- */
    function yTicks(plot: Plot, gutter: number, ticks: number[], dec: number, suffix = ''): void {
      const theme = ctx.theme;
      for (const v of ticks) {
        plot.hline(v, { color: theme.grid, width: 1 });
      }
      for (const v of ticks) plot.textPx(gutter - 6, plot.py(v), `${fmt.num(v, dec)}${suffix}`, { color: theme.muted, size: 12, align: 'right', baseline: 'middle' });
    }

    function drawTime(R0: Rect, dt: number): void {
      const plot = plotT;
      const theme = ctx.theme;
      const sm = small();
      const W = niceWindow(Math.max(4, 3.2 / p.fE));
      const t0 = Math.max(hist.t[0] ?? 0, t - 0.88 * W);
      // Bereich weich nachführen
      let mx = p.amp;
      const i0 = hist.t.findIndex((tt) => tt >= t0 - 0.2);
      for (let i = Math.max(0, i0); i < hist.phi.length; i++) mx = Math.max(mx, Math.abs(hist.phi[i]!) / DEG);
      // nach einem Zeitsprung ist der Verlauf noch kurz: die eingeschwungene Amplitude gleich mit einplanen
      mx = Math.max(mx, Math.abs(s[0]) / DEG, steady ? liveAmp / DEG : 0);
      const target = Math.max(6, Math.min(140, mx * 1.2));
      rangeT = prefersReducedMotion() ? target : rangeT + (target - rangeT) * Math.min(1, dt * 4);
      if (Math.abs(rangeT - target) < 0.05) rangeT = target;
      plot.setRangePadded([t0, t0 + W], [-rangeT, rangeT], { left: sm ? 38 : 44, right: 10, top: 8, bottom: 6 });
      const g = plot.begin();
      plot.grid({ minor: false });
      const p10 = 10 ** Math.floor(Math.log10(rangeT / 1.2));
      const stepY = [5, 2, 1].map((f) => f * p10).find((v) => v <= rangeT / 1.2) ?? p10;
      const ticks = [-2, -1, 1, 2].map((k) => k * stepY).filter((v) => Math.abs(v) < rangeT * 0.95);
      plot.axes();
      const gutter = plot.px(t0);
      if (t0 > 0) plot.vline(t0, { color: theme.axis, width: 1.5 });
      yTicks(plot, gutter, t0 > 0 ? [...ticks, 0] : ticks, 0);
      // Belastungsgrenze
      if (rangeT > 100) for (const sg of [-1, 1]) plot.hline(sg * 120, { color: red(), width: 1.4, dash: [6, 4], alpha: 0.8 });
      // Kurven
      const r = plot.rect;
      const start = Math.max(0, i0);
      const count = hist.t.length - start;
      const stride = Math.max(1, Math.floor(count / (r.w * 1.5)));
      const ptsE: [number, number][] = [];
      const ptsR: [number, number][] = [];
      for (let i = start; i < hist.t.length; i += stride) {
        ptsE.push([hist.t[i]!, hist.e[i]! / DEG]);
        ptsR.push([hist.t[i]!, hist.phi[i]! / DEG]);
      }
      ptsE.push([t, driveAngle(drive(), t) / DEG]);
      ptsR.push([t, s[0] / DEG]);
      plot.polyline(ptsE, { color: eColor(), width: 2, dash: [6, 4] });
      plot.polyline(ptsR, { color: radColor(), width: 2.6 });
      plot.point(t, driveAngle(drive(), t) / DEG, { color: eColor(), radius: 4 });
      plot.point(t, s[0] / DEG, { color: radColor(), radius: 5 });
      // Etikett und Legende
      const c = chip(r, gutter + 6, ctx.t('chipT'), theme.text);
      const fs = sm ? 11 : 12;
      const ly = c.y + c.h / 2;
      let lx = c.x + c.w + 10;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)';
      g.font = `700 ${fs}px ${theme.font}`;
      const legW = 20 + g.measureText(ctx.t('rad')).width + 14 + 20 + g.measureText(ctx.t('erreger')).width + 10;
      roundRect(g, lx - 4, c.y, legW, c.h, 6);
      g.fill();
      g.strokeStyle = radColor();
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(lx, ly);
      g.lineTo(lx + 14, ly);
      g.stroke();
      text(g, ctx.t('rad'), lx + 18, ly + 0.5, { font: `700 ${fs}px ${theme.font}`, color: radColor(), align: 'left' });
      lx += 18 + g.measureText(ctx.t('rad')).width + 14;
      g.strokeStyle = eColor();
      g.lineWidth = 2;
      g.setLineDash([5, 3]);
      g.beginPath();
      g.moveTo(lx, ly);
      g.lineTo(lx + 14, ly);
      g.stroke();
      g.setLineDash([]);
      text(g, ctx.t('erreger'), lx + 18, ly + 0.5, { font: `700 ${fs}px ${theme.font}`, color: eColor(), align: 'left' });
      // Zustand
      const st = broken ? null : steady ? ctx.t('steady') : ctx.t('settling');
      if (st && r.w > 300) richText(st, r.x + r.w - 10, r.y + r.h - 12, fs, steady ? theme.series[2]! : theme.muted, 'right', true, 700);
      plot.end();
      frame(R0);
    }

    function drawRes(R0: Rect): void {
      const plot = plotR;
      const theme = ctx.theme;
      const sm = small();
      const ratioPeak = amplitudeRatio(Math.max(resonanceOmega(OMEGA0, p.damp), 1e-6), OMEGA0, p.damp);
      const theoryPeak = p.theory ? p.amp * ratioPeak : 0;
      const measured = points.reduce((m, q) => Math.max(m, q.amp / DEG), 0);
      const yMax = niceCeil(Math.max(theoryPeak, measured, liveAmp / DEG, p.amp * 1.5) * 1.12);
      plot.setRangePadded([0, F_MAX], [0, yMax], { left: sm ? 38 : 44, right: 12, top: 30, bottom: 20 });
      plot.begin();
      plot.grid({ minor: false });
      const step = yMax <= 20 ? 5 : yMax <= 50 ? 10 : yMax <= 100 ? 20 : 30;
      const ticks: number[] = [];
      for (let v = step; v <= yMax * 0.98; v += step) ticks.push(v);
      plot.axes();
      yTicks(plot, plot.px(0), ticks, 0);
      // Eigenfrequenz
      plot.segment([F0, 0], [F0, yMax * 2], { color: theme.muted, width: 1.2, dash: [4, 4] });
      plot.text(F0, 0, ctx.t('f0'), { color: theme.muted, size: 12, weight: 'bold', align: 'left', baseline: 'bottom', offset: [4, -4] });
      // Belastungsgrenze
      if (yMax > 120) {
        plot.hline(120, { color: red(), width: 1.4, dash: [6, 4], alpha: 0.85 });
        plot.text(F_MAX, 120, ctx.t('limit'), { color: red(), size: 11, weight: 'bold', align: 'right', baseline: 'bottom', offset: [-4, -3] });
      }
      // Theorie
      if (p.theory) {
        const f = (x: number) => Math.min(yMax * 1.5, p.amp * amplitudeRatio(TAU * x, OMEGA0, p.damp));
        plot.fn(f, { color: radColor(), width: 2.2, from: 0, to: F_MAX, alpha: 0.55 });
      }
      // Messpunkte
      points.forEach((q, i) => {
        const last = i === points.length - 1 && pop.running;
        if (q.over) {
          const [px, py] = plot.toPx(q.f, 120);
          const g = surface.g;
          g.fillStyle = red();
          g.beginPath();
          g.moveTo(px, py - 7);
          g.lineTo(px - 6, py + 4);
          g.lineTo(px + 6, py + 4);
          g.closePath();
          g.fill();
        } else plot.point(q.f, q.amp / DEG, { color: radColor(), radius: last ? 5 * Math.max(0.3, pop.value) : 5 });
      });
      // aktuelle Erregerfrequenz
      plot.segment([p.fE, 0], [p.fE, yMax * 2], { color: eColor(), width: 1.6, dash: [5, 4] });
      const r = plot.rect;
      chip(r, plot.px(0) + 6, ctx.t('chipAmp'), radColor());
      if (!points.length && !p.theory) {
        plot.textPx(r.x + r.w / 2 + 16, r.y + r.h * 0.45, ctx.t('empty'), { color: theme.muted, size: 13, weight: '600', align: 'center' });
        plot.textPx(r.x + r.w / 2 + 16, r.y + r.h * 0.45 + 18, ctx.t('emptyHint'), { color: theme.muted, size: 12, align: 'center' });
      }
      plot.end();
      frame(R0);
    }

    function drawPhase(R0: Rect): void {
      const plot = plotP;
      const theme = ctx.theme;
      const sm = small();
      plot.setRangePadded([0, F_MAX], [0, 180], { left: sm ? 38 : 44, right: 12, top: 28, bottom: 20 });
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      yTicks(plot, plot.px(0), [90, 180], 0, '°');
      plot.segment([F0, 0], [F0, 400], { color: theme.muted, width: 1.2, dash: [4, 4] });
      if (p.theory) plot.fn((x) => phaseShift(TAU * x, OMEGA0, p.damp) / DEG, { color: shiftColor(), width: 2.2, from: 0, to: F_MAX, alpha: 0.6 });
      points.forEach((q, i) => {
        if (q.over) return;
        const last = i === points.length - 1 && pop.running;
        plot.point(q.f, q.shift / DEG, { color: shiftColor(), radius: last ? 5 * Math.max(0.3, pop.value) : 5 });
      });
      plot.segment([p.fE, 0], [p.fE, 400], { color: eColor(), width: 1.6, dash: [5, 4] });
      chip(plot.rect, plot.px(0) + 6, ctx.t('chipShift'), shiftColor());
      plot.end();
      frame(R0);
    }

    /* ---------- Ablauf ---------- */
    function autoStep(): void {
      if (!auto) return;
      if (auto.i >= SWEEP.length) {
        auto = null;
        updateReadouts();
        return;
      }
      const f = SWEEP[auto.i]!;
      ctx.set({ fE: f });
      skipTransient(true);
      auto.i++;
      auto.next = performance.now() + (prefersReducedMotion() ? 120 : 420);
      updateReadouts();
    }

    restart();

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace') {
          restart();
          points = [];
          auto = null;
          ctx.clock.pause();
        } else {
          if (changed.has('fE')) {
            if (broken && source === 'input') restart();
            resetTracking();
          }
          if (changed.has('damp') || changed.has('amp')) {
            points = [];
            if (broken && source === 'input') restart();
            resetTracking();
          }
          if (source === 'input' && (changed.has('fE') || changed.has('damp') || changed.has('amp'))) auto = null;
        }
        lay = computeLayout();
        plotT.resize();
        plotR.resize();
        plotP.resize();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          auto = null;
          restart();
          updateReadouts();
          ctx.clock.play();
        } else if (id === 'skip') {
          if (broken) return;
          auto = null;
          skipTransient(false);
          if (!broken) ctx.clock.play();
          updateReadouts();
          ctx.requestRender();
        } else if (id === 'auto') {
          if (auto) {
            auto = null;
          } else {
            if (broken) restart();
            points = [];
            auto = { i: 0, next: 0 };
            ctx.clock.play();
          }
          updateReadouts();
        } else if (id === 'clear') {
          points = [];
          updateReadouts();
        }
      },

      tick(dt) {
        if (broken) return;
        if (auto && performance.now() >= auto.next) autoStep();
        const h = dt * SPEED[p.speed as Speed];
        const d = drive();
        let finished = false;
        stepper.run(h, (hh) => {
          if (broken) return;
          s = step(d, t, s, hh);
          t += hh;
          const a = Math.abs(s[0]);
          if (a > LIMIT) {
            s = [Math.sign(s[0]) * LIMIT, 0];
            finished = true;
            broken = true;
            return;
          }
          cycleMax = Math.max(cycleMax, a);
          if (t >= nextSample - 1e-9) {
            hist.t.push(t);
            hist.phi.push(s[0]);
            hist.e.push(driveAngle(d, t));
            nextSample += SAMPLE;
          }
          // Ende einer Erregerperiode: Amplitude dieser Periode festhalten
          const ci = Math.floor(drivePhase(d, t) / TAU);
          if (ci !== cycleIndex) {
            cycleIndex = ci;
            amps.push(cycleMax);
            if (amps.length > 6) amps.shift();
            liveAmp = cycleMax;
            liveShift = readPhasor(d, t, s).shift;
            cycleMax = a;
            const k = amps.length;
            const stable =
              k >= 3 && t - tChange > 3 / p.fE && Math.abs(amps[k - 1]! - amps[k - 2]!) < 0.004 * amps[k - 1]! + 0.02 * DEG && Math.abs(amps[k - 2]! - amps[k - 3]!) < 0.004 * amps[k - 2]! + 0.02 * DEG;
            if (stable && !steady) {
              steady = true;
              record(false);
            } else if (!stable && steady && Math.abs(amps[k - 1]! - amps[k - 2]!) > 0.02 * amps[k - 1]!) steady = false;
          } else liveAmp = Math.max(liveAmp, cycleMax);
        });
        if (finished) breakDown();
        if (steady !== wasSteady) {
          wasSteady = steady;
          updateReadouts();
        }
        // alte Messwerte verwerfen
        const W = niceWindow(Math.max(4, 3.2 / p.fE));
        const cut = hist.t.findIndex((tt) => tt >= t - W - 1);
        if (cut > 400) {
          hist.t.splice(0, cut);
          hist.phi.splice(0, cut);
          hist.e.splice(0, cut);
        }
        updateNow();
      },

      resetTime() {
        auto = null;
        restart();
        updateReadouts();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        lay = computeLayout();
        plotT.resize();
        plotR.resize();
        plotP.resize();
        surface.begin();
        drawScene(lay.scene);
        drawTime(lay.time, dt);
        drawRes(lay.res);
        if (lay.phase) drawPhase(lay.phase);
        if (pop.running || flash.running || (jumpNote && now < jumpNote.until)) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
