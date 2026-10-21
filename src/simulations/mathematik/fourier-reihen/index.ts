import { defineSimulation, ease, formatPiFraction, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  coefficients,
  evalSeries,
  features,
  jumpHeight,
  maxOfSeries,
  polar,
  powerOf,
  shareOf,
  sigma,
  targetOf,
  wrap,
  type Coeffs,
  type SeriesSpec,
  type SigKey,
  type SmoothKey,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const PI = Math.PI;
const TAU = 2 * PI;
const DEG = PI / 180;
/** Höchste Ordnung, die die Simulation darstellt. */
const NMAX = 50;
/** „Aufbau abspielen“ geht bis zu dieser Ordnung. */
const RUN_N = 25;
/** x-Bereich der Diagramme: zwei Perioden und etwas Rand. */
const X0 = -2 * PI - 0.3;
const X1 = 2 * PI + 0.3;
/** Dauer einer Periode im Bild (s) bei normaler Geschwindigkeit. */
const VIS_PERIOD = 4;

type View = 'sum' | 'epi' | 'stack' | 'spec';
type Lng = 'de' | 'en';

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number; e: (t: number) => number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    if (this.tw) this.tw = null;
    this.goal = goal;
    this.tau = tau;
  }
  glide(goal: number, dur: number, delay: number, now: number, e: (t: number) => number = ease.inOutCubic): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur: Math.max(1, dur), e };
  }
  get busy(): boolean {
    return this.tw !== null || this.v !== this.goal;
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, tw.e(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return true;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-4 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** „Aufbau abspielen“: die Glieder kommen nacheinander dazu. */
interface Story {
  t0: number;
  ks: number[];
  step: number;
  end: number;
}

/**
 * Fourier-Reihen: Rechteck, Sägezahn, Dreieck, Trapez, Pulsfolge, Einweg-
 * und Zweiweggleichrichtung sowie ein eigener Klang werden aus Sinus- und
 * Kosinusschwingungen aufgebaut. Vier Ansichten: Partialsumme mit Prüfstelle
 * und Gibbs-Phänomen, rotierende Zeiger (Epizykel), die das Signal zeichnen,
 * gestapelte Teilschwingungen mit ihrer Summe an der Prüfstelle sowie
 * Amplituden-, Phasen- und Energiespektrum (Parseval). Dazu Amplitude,
 * Phasenverschiebung, Tastgrad, Glättung (Fejér, Lanczos) und Klang.
 */
export default defineSimulation({
  id: 'fourier-reihen',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.5 },
  groups: [
    { id: 'sig', label: L('Signal formen', 'Shape the signal') },
    { id: 'own', label: L('Eigener Klang: Amplituden cₖ', 'Own sound: amplitudes cₖ') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'sum', label: L('Partialsumme', 'Partial sum') },
        { value: 'epi', label: L('Zeiger (Epizykel)', 'Phasors (epicycles)') },
        { value: 'stack', label: L('Teilschwingungen gestapelt', 'Stacked harmonics') },
        { value: 'spec', label: L('Spektrum und Energie', 'Spectrum and energy') },
      ],
      default: 'sum',
    },
    {
      key: 'sig',
      type: 'choice',
      label: L('Signal', 'Signal'),
      options: [
        { value: 'sq', label: L('Rechteck', 'Square wave') },
        { value: 'saw', label: L('Sägezahn', 'Sawtooth') },
        { value: 'tri', label: L('Dreieck', 'Triangle') },
        { value: 'trap', label: L('Trapez', 'Trapezoid') },
        { value: 'pulse', label: L('Pulsfolge (Tastgrad)', 'Pulse train (duty cycle)') },
        { value: 'half', label: L('Einweggleichrichtung', 'Half-wave rectified sine') },
        { value: 'full', label: L('Zweiweggleichrichtung', 'Full-wave rectified sine') },
        { value: 'own', label: L('Eigener Klang', 'Own sound') },
      ],
      default: 'sq',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Höchste Ordnung N', 'Highest order N'),
      help: L('Ordnung der höchsten Teilschwingung in der Partialsumme. Im Spektrum kann man auch einen Balken antippen.', 'Order of the highest harmonic in the partial sum. In the spectrum you can also tap a bar.'),
      min: 1,
      max: NMAX,
      step: 1,
      default: 3,
    },
    { key: 'amp', type: 'number', group: 'sig', label: L('Amplitude A', 'Amplitude A'), help: L('Streckt das Signal: g(x) = A · f(x − φ).', 'Stretches the signal: g(x) = A · f(x − φ).'), min: 0.2, max: 2, step: 0.1, default: 1 },
    {
      key: 'ph',
      type: 'number',
      group: 'sig',
      label: L('Phasenverschiebung φ', 'Phase shift φ'),
      help: L('Verschiebt das Signal nach rechts. Die Amplituden bleiben gleich, nur die Phasen ändern sich.', 'Shifts the signal to the right. The amplitudes stay the same, only the phases change.'),
      min: -180,
      max: 180,
      step: 15,
      default: 0,
      unit: '°',
    },
    {
      key: 'd',
      type: 'number',
      group: 'sig',
      label: L('Tastgrad d', 'Duty cycle d'),
      help: L('Anteil der Periode, in dem das Signal „an“ ist (Pulsweitenmodulation).', 'Fraction of the period during which the signal is “on” (pulse-width modulation).'),
      min: 5,
      max: 95,
      step: 5,
      default: 50,
      unit: '%',
      visibleIf: (v) => v.sig === 'pulse',
    },
    {
      key: 'w',
      type: 'number',
      group: 'sig',
      label: L('Flankenanteil w', 'Edge share w'),
      help: L('Breite der schrägen Flanken: w → 0 ergibt das Rechteck, w = 100 % ein (um 90° verschobenes) Dreieck.', 'Width of the sloped edges: w → 0 gives the square wave, w = 100 % a triangle (shifted by 90°).'),
      min: 5,
      max: 100,
      step: 5,
      default: 40,
      unit: '%',
      visibleIf: (v) => v.sig === 'trap',
    },
    ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map((k) => ({
      key: `c${k}` as `c${typeof k}`,
      type: 'number' as const,
      group: 'own',
      label: L(`c${'₁₂₃₄₅₆₇₈'[k - 1]} (sin ${k === 1 ? '' : k}x)`, `c${'₁₂₃₄₅₆₇₈'[k - 1]} (sin ${k === 1 ? '' : k}x)`),
      min: -1,
      max: 1,
      step: 0.05,
      default: [1, 0, 0.5, 0, 0.3, 0, 0.15, 0][k - 1]!,
      visibleIf: (v: Record<string, unknown>) => v.sig === 'own',
    })),
    {
      key: 'sm',
      type: 'choice',
      label: L('Glättung (σ-Faktoren)', 'Smoothing (σ factors)'),
      help: L('Dämpft die hohen Glieder und mildert das Überschwingen an Sprüngen.', 'Damps the high terms and reduces the overshoot at jumps.'),
      options: [
        { value: 'none', label: L('keine', 'none') },
        { value: 'fejer', label: L('Fejér (Mittelwert der Partialsummen)', 'Fejér (mean of partial sums)') },
        { value: 'lanczos', label: L('Lanczos (sinc-Faktoren)', 'Lanczos (sinc factors)') },
      ],
      default: 'none',
    },
    {
      key: 'x',
      type: 'number',
      label: L('Prüfstelle x', 'Test point x'),
      help: L('Auch im Bild ziehen.', 'You can also drag it in the picture.'),
      min: -6,
      max: 6,
      step: 0.05,
      default: 1.2,
      visibleIf: (v) => v.view === 'sum' || v.view === 'stack',
    },
    {
      key: 'f0',
      type: 'number',
      label: L('Grundfrequenz f₀', 'Fundamental frequency f₀'),
      help: L('Für den Klang, die Zeitachse und das Spektrum in Hz. Periode T = 1/f₀.', 'For the sound, the time axis and the spectrum in Hz. Period T = 1/f₀.'),
      min: 20,
      max: 1000,
      step: 1,
      default: 220,
      unit: 'Hz',
    },
    { key: 'tax', type: 'boolean', group: 'view', label: L('Zeitachse in ms statt x', 'Time axis in ms instead of x'), default: false },
    { key: 'parts', type: 'boolean', group: 'view', label: L('Teilschwingungen zeigen', 'Show the harmonics'), default: true, visibleIf: (v) => v.view === 'sum' },
    { key: 'spec', type: 'boolean', group: 'view', label: L('Amplitudenspektrum zeigen', 'Show the amplitude spectrum'), default: true, visibleIf: (v) => v.view === 'sum' },
    { key: 'tgt', type: 'boolean', group: 'view', label: L('Zielsignal zeigen', 'Show the target signal'), default: true },
    { key: 'gib', type: 'boolean', group: 'view', label: L('Gibbs-Überschwingen markieren', 'Mark the Gibbs overshoot'), default: true, visibleIf: (v) => v.view === 'sum' },
    { key: 'info', type: 'boolean', group: 'view', label: L('Werte im Bild', 'Values in the picture'), help: L('Aus: Zahlen im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: numbers in the picture replaced by “?” (for tasks).'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false, visibleIf: (v) => v.view === 'epi' },
  ],
  actions: [
    { id: 'add', label: L('Teilschwingung hinzufügen', 'Add a harmonic'), primary: true },
    { id: 'rem', label: L('Teilschwingung entfernen', 'Remove a harmonic') },
    { id: 'run', label: L('Aufbau abspielen', 'Play the build-up') },
    { id: 'go', label: L('Zeiger starten', 'Start the phasors'), visibleIf: (v) => v.view === 'epi' },
    { id: 'snd', label: L('Klang anhören', 'Play sound') },
  ],
  readouts: [
    { key: 'series', label: L('Fourier-Reihe', 'Fourier series') },
    { key: 'coef', label: L('Koeffizienten', 'Coefficients'), spoiler: true },
    { key: 'val', label: L('An der Prüfstelle', 'At the test point'), spoiler: true },
    { key: 'energy', label: L('Energieanteil (Parseval)', 'Share of power (Parseval)'), spoiler: true },
    { key: 'gibbs', label: L('Größter Wert von S_N', 'Largest value of S_N'), spoiler: true },
    { key: 'freq', label: L('Frequenzen', 'Frequencies') },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  resultsParam: 'info',
  presets: [
    { id: 'sq', label: L('Rechteck bis k = 3', 'Square wave up to k = 3'), values: {} },
    { id: 'epi', label: L('Zeiger zeichnen ein Rechteck', 'Phasors draw a square wave'), values: { view: 'epi', n: 7 } },
    { id: 'gibbs', label: L('Gibbs-Phänomen', 'Gibbs phenomenon'), values: { sig: 'sq', n: 30, x: 0.1 } },
    { id: 'fejer', label: L('Glättung nach Fejér gegen Gibbs', 'Fejér smoothing against Gibbs'), values: { sig: 'sq', n: 30, x: 0.1, sm: 'fejer' } },
    { id: 'saw', label: L('Sägezahn', 'Sawtooth'), values: { sig: 'saw', n: 6 } },
    { id: 'tri', label: L('Dreieck: schnelle Konvergenz', 'Triangle: fast convergence'), values: { sig: 'tri', n: 3 } },
    { id: 'clar', label: L('Klarinette: fast nur ungeradzahlige Teiltöne (k = 1, 3, 5, …)', 'Clarinet: almost only odd harmonics (k = 1, 3, 5, …)'), values: { view: 'spec', sig: 'sq', n: 11, f0: 147 } },
    { id: 'violin', label: L('Geige: Sägezahn mit allen Obertönen', 'Violin: sawtooth with all overtones'), values: { view: 'stack', sig: 'saw', n: 8, f0: 440, x: 2 } },
    { id: 'flute', label: L('Flöte: fast reiner Sinus', 'Flute: almost a pure sine'), values: { view: 'spec', sig: 'tri', n: 5, f0: 523 } },
    { id: 'synth', label: L('Synthesizer: eigener Klang aus Zeigern', 'Synthesizer: own sound from phasors'), values: { view: 'epi', sig: 'own', n: 8, c1: 1, c2: 0.5, c3: 0.35, c4: 0.25, c5: 0, c6: 0, c7: 0, c8: 0 } },
    { id: 'half', label: L('Gleichgerichteter Wechselstrom (Einweg)', 'Rectified alternating current (half-wave)'), values: { sig: 'half', n: 6 } },
    { id: 'full', label: L('Netzteil: Zweiweggleichrichter, 50 Hz', 'Power supply: full-wave rectifier, 50 Hz'), values: { view: 'spec', sig: 'full', n: 8, f0: 50, tax: true } },
    { id: 'pwm', label: L('LED-Dimmer: Pulsweitenmodulation 25 %', 'LED dimmer: pulse-width modulation 25 %'), values: { sig: 'pulse', d: 25, n: 20, f0: 500, tax: true, x: 0.5 } },
    { id: 'clock', label: L('Digitales Taktsignal', 'Digital clock signal'), values: { view: 'stack', sig: 'pulse', d: 50, n: 9, f0: 1000, tax: true, x: 0.6 } },
    { id: 'trap', label: L('Trapez: zwischen Rechteck und Dreieck', 'Trapezoid: between square and triangle'), values: { view: 'spec', sig: 'trap', w: 40, n: 15 } },
    { id: 'phase', label: L('Phasenverschiebung: nur die Phasen ändern sich', 'Phase shift: only the phases change'), values: { view: 'spec', sig: 'saw', n: 8, ph: 90 } },
  ],
  strings: {
    de: {
      canvas:
        'Fourier-Reihe: Partialsumme über dem Zielsignal mit Prüfstelle und Gibbs-Überschwingen, rotierende Zeiger (Epizykel), deren Summe das Signal zeichnet, gestapelte Teilschwingungen mit ihrer Summe an der Prüfstelle sowie Amplituden-, Phasen- und Energiespektrum nach Parseval. Daneben Karten mit der Reihe, den Koeffizienten und dem Energieanteil.',
    },
    en: {
      canvas:
        'Fourier series: partial sum over the target signal with a test point and the Gibbs overshoot, rotating phasors (epicycles) whose sum draws the signal, stacked harmonics with their sum at the test point and the amplitude, phase and energy spectrum after Parseval. Next to it cards with the series, the coefficients and the share of power.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const say = (s: { de: string; en: string }) => s[lang];
    const n = (v: number, d = 2) => fmt.num(v, d);
    const editable = () => !ctx.locked;
    const view = () => p.view as View;
    const sig = () => p.sig as SigKey;
    const smooth = () => p.sm as SmoothKey;
    const Q = (s: string) => (p.info ? s : '?');

    /* ---------- Farben ---------- */
    const col = {
      S: () => th().series[0]!,
      f: () => th().muted,
      x: () => th().series[1]!,
      E: () => th().series[5]!,
    };
    const PAL = [3, 2, 4, 5, 1];
    /** Farbe der Teilschwingung nach ihrem Rang unter den Gliedern ≠ 0. */
    const hc = (rank: number) => th().series[PAL[rank % PAL.length]!]!;

    /* ---------- Signal ---------- */
    const own = () => [p.c1, p.c2, p.c3, p.c4, p.c5, p.c6, p.c7, p.c8] as number[];
    const specNow = (): SeriesSpec => ({ sig: sig(), shape: { d: p.d / 100, w: p.w / 100, c: own() }, A: p.amp, phi: p.ph * DEG });
    let spec = specNow();
    let coT: Coeffs = coefficients(spec, NMAX);
    /** Rang jedes k unter den Gliedern ≠ 0 (für die Farben), −1 für Nullglieder. */
    let rank = new Int16Array(NMAX + 1);
    function computeRanks(): void {
      rank = new Int16Array(NMAX + 1).fill(-1);
      let r = 0;
      for (let k = 1; k <= NMAX; k++) if (Math.hypot(coT.a[k]!, coT.b[k]!) > 1e-9) rank[k] = r++;
    }
    computeRanks();
    const nonzero = (k: number) => rank[k]! >= 0;
    const hk = (k: number) => hc(Math.max(0, rank[k]!));

    /* Angezeigte Koeffizienten (weiche Überblendung bei jedem Wechsel des Signals) */
    const coD: Coeffs = { mean: coT.mean, a: new Float64Array(coT.a), b: new Float64Array(coT.b), K: NMAX };
    let coFrom: Coeffs = { mean: coT.mean, a: new Float64Array(coT.a), b: new Float64Array(coT.b), K: NMAX };
    let morph: { t0: number; dur: number } | null = null;
    /* Zielsignal: weiche Überblendung zwischen altem und neuem Signal */
    let tgtFrom: SeriesSpec = spec;
    let tgtMorph: { t0: number; dur: number } | null = null;
    let tgtK = 1;
    /* Gewichte der Glieder (0 … σₖ): neue Glieder wachsen, entfernte schrumpfen */
    const wC = Array.from({ length: NMAX + 1 }, (_, k) => new Chan(k === 0 ? 1 : 0));
    const wA = new Float64Array(NMAX + 1);
    wA[0] = 1;
    let story: Story | null = null;
    let fresh: { k: number; t0: number; sign: 1 | -1 } | null = null;
    let suppress = false;
    let intro: number | null = null;
    let lastTime = performance.now();
    let viewFade: { t0: number; from: View } | null = null;
    /** Phase der Zeiger x = ω·t (rad). */
    let xt = 0.9;
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    /** Exakter größter Wert der Partialsumme (für die Gibbs-Linie, beim Update berechnet). */
    let gibbsExact: number | null = null;
    /** Keine Überblendung mehr aktiv? */
    const settled = () => !morph && !story && wC.every((c) => !c.busy);
    /** Stand vor der letzten Änderung (für gestaffelte Übergänge). */
    let prevN = p.n;
    let prevView = p.view as View;

    /* Zahlen, die im Bild weich zählen */
    const num = {
      share: new Chan(0),
      val: new Chan(0),
      max: new Chan(1),
      yLo: new Chan(-1.6),
      yHi: new Chan(1.6),
      amp: new Chan(1.3),
      kShow: new Chan(12),
      reach: new Chan(1.5),
    };

    function wTarget(k: number): number {
      return k >= 1 && k <= p.n ? sigma(smooth(), k, p.n) : 0;
    }

    /** Wertebereich des Zielsignals (für die y-Achse). */
    function targetRange(s: SeriesSpec): { lo: number; hi: number } {
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = 0; i <= 400; i++) {
        const y = targetOf(s, -PI + (TAU * i) / 400);
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      return { lo, hi };
    }

    function retargetRange(now: number, instant: boolean): void {
      const { lo, hi } = targetRange(spec);
      const span = Math.max(0.6, hi - lo);
      const yl = Math.min(lo, 0) - span * 0.22 - 0.05;
      const yh = Math.max(hi, 0) + span * 0.3 + 0.05;
      let amax = 0;
      for (let k = 1; k <= NMAX; k++) amax = Math.max(amax, Math.hypot(coT.a[k]!, coT.b[k]!));
      const ampR = Math.max(amax, Math.abs(coT.mean), 0.05);
      if (instant) {
        num.yLo.jump(yl);
        num.yHi.jump(yh);
        num.amp.jump(ampR);
      } else {
        num.yLo.glide(yl, 700, 0, now);
        num.yHi.glide(yh, 700, 0, now);
        num.amp.glide(ampR, 700, 0, now);
      }
    }

    /** Signal neu berechnen und weich überblenden. */
    function retargetSignal(now: number, instant: boolean, dur = 750): void {
      const next = specNow();
      const sameSig = next.sig === spec.sig;
      coFrom = { mean: coD.mean, a: new Float64Array(coD.a), b: new Float64Array(coD.b), K: NMAX };
      tgtFrom = morphTargetSpec(now);
      spec = next;
      coT = coefficients(spec, NMAX);
      computeRanks();
      if (instant || reduced()) {
        coD.mean = coT.mean;
        coD.a.set(coT.a);
        coD.b.set(coT.b);
        morph = null;
        tgtMorph = null;
      } else {
        morph = { t0: now, dur };
        tgtMorph = { t0: now, dur: sameSig ? dur * 0.8 : dur };
      }
      retargetRange(now, instant || reduced());
    }

    /** Beim Überblenden: welches Signal gerade „von“ ist (Annäherung: das alte). */
    function morphTargetSpec(now: number): SeriesSpec {
      if (tgtMorph && now - tgtMorph.t0 < tgtMorph.dur && tgtK < 0.5) return tgtFrom;
      return spec;
    }

    function stepMorph(now: number): boolean {
      if (!morph) return false;
      const raw = (now - morph.t0) / morph.dur;
      if (raw >= 1) {
        coD.mean = coT.mean;
        coD.a.set(coT.a);
        coD.b.set(coT.b);
        morph = null;
        return true;
      }
      const stag = 0.3;
      coD.mean = lerp(coFrom.mean, coT.mean, ease.inOutCubic(clamp01(raw / (1 - stag))));
      for (let k = 1; k <= NMAX; k++) {
        const u = ease.inOutCubic(clamp01((raw - (stag * (k - 1)) / NMAX) / (1 - stag)));
        coD.a[k] = lerp(coFrom.a[k]!, coT.a[k]!, u);
        coD.b[k] = lerp(coFrom.b[k]!, coT.b[k]!, u);
      }
      return true;
    }

    /** Gewichte neu setzen (gleiten bzw. springen). */
    function retargetWeights(now: number, mode: 'glide' | 'jump' | 'intro', oldN = p.n): void {
      if (mode === 'jump' || reduced()) {
        for (let k = 1; k <= NMAX; k++) wC[k]!.jump(wTarget(k));
        return;
      }
      if (mode === 'intro') {
        let i = 0;
        let count = 0;
        for (let k = 1; k <= p.n; k++) if (nonzero(k)) count++;
        const stepMs = Math.min(240, 1700 / Math.max(1, count));
        for (let k = 1; k <= NMAX; k++) {
          wC[k]!.jump(0);
          const goal = wTarget(k);
          if (goal > 0) {
            const delay = 450 + (nonzero(k) ? i++ : i) * stepMs;
            wC[k]!.glide(goal, 620, delay, now, ease.outCubic);
          }
        }
        return;
      }
      const tau = dragging() ? 0.06 : 0;
      for (let k = 1; k <= NMAX; k++) {
        const goal = wTarget(k);
        if (Math.abs(goal - wC[k]!.goal) < 1e-12) continue;
        if (tau > 0) {
          wC[k]!.follow(goal, tau);
          continue;
        }
        const added = k > oldN && k <= p.n;
        const removed = k <= oldN && k > p.n;
        const delay = added ? Math.max(0, k - oldN - 1) * 70 : removed ? Math.max(0, oldN - k) * 45 : 0;
        wC[k]!.glide(goal, added ? 640 : 480, Math.min(delay, 700), now, added ? ease.outCubic : ease.inOutCubic);
      }
    }

    function cancelStory(): void {
      if (!story) return;
      story = null;
      for (let k = 1; k <= NMAX; k++) wC[k]!.follow(wTarget(k), 0.12);
    }

    /* ---------- Werte der Partialsumme ---------- */
    const S = (x: number) => evalSeries(coD, NMAX, x, wA);
    const H = (k: number, x: number) => wA[k]! * (coD.a[k]! * Math.cos(k * x) + coD.b[k]! * Math.sin(k * x));
    /** Zielsignal (beim Wechsel überblendet). */
    const T = (x: number) => (tgtMorph ? lerp(targetOf(tgtFrom, x), targetOf(spec, x), tgtK) : targetOf(spec, x));
    /** Ordnung, die gerade „dran“ ist (für Beschriftungen). */
    function shownN(now: number): number {
      if (story) {
        const i = Math.floor((now - story.t0 - 300) / story.step);
        const ks = story.ks;
        if (i < 0) return ks[0] ?? 1;
        return ks[Math.min(i, ks.length - 1)] ?? p.n;
      }
      return p.n;
    }

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { main: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.31, 232, 350));
        return { main: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const mh = Math.round(clamp(h * 0.53, 260, w * 1.15));
      return { main: { x: 0, y: 0, w, h: mh }, col: { x: 0, y: mh + 8, w, h: h - mh - 8 }, wide: false };
    }

    /* ---------- Plots der Ansicht „Partialsumme“ ---------- */
    function sumRegions(R: Rect): { main: Rect; parts: Rect | null } {
      if (!p.parts) return { main: R, parts: null };
      const mh = Math.round(R.h * 0.63);
      return { main: { x: R.x, y: R.y, w: R.w, h: mh }, parts: { x: R.x, y: R.y + mh + 8, w: R.w, h: R.h - mh - 8 } };
    }
    const HIDDEN: Rect = { x: -10, y: -10, w: 1, h: 1 };
    const axisFmt = () => (p.tax ? { pi: true, format: (v: number) => `${n((v / TAU) * (1000 / p.f0), msDigits())}` } : { pi: true });
    const msDigits = () => (1000 / p.f0 >= 20 ? 0 : 1000 / p.f0 >= 2 ? 1 : 2);
    const plot = new Plot(surface, {
      x: [X0, X1],
      y: [-1.6, 1.6],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => (view() === 'sum' || (viewFade && viewFade.from === 'sum') ? sumRegions(regions().main).main : HIDDEN),
      xAxis: { pi: true },
    });
    const plotH = new Plot(surface, {
      x: [X0, X1],
      y: [-1.4, 1.4],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => (view() === 'sum' || (viewFade && viewFade.from === 'sum') ? (sumRegions(regions().main).parts ?? HIDDEN) : HIDDEN),
      xAxis: { pi: true, numbers: false },
      yAxis: { numbers: false },
    });
    plot.addHandle({
      get: () => [p.x, 0],
      set: (x) => {
        lastDrag = performance.now();
        ctx.set({ x: Math.round(clamp(x, -6, 6) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => editable() && view() === 'sum',
      color: () => col.x(),
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { S: col.S(), x: col.x(), m: th().muted, E: col.E() },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    /**
     * Lange Formel in höchstens zwei Zeilen setzen: an einem Plus- oder Minuszeichen
     * außerhalb von {…} umbrechen, so dass die erste Zeile möglichst voll wird.
     */
    function wrapFormula(src: string, maxW: number, size: number, color: string, weight = 600): FormulaBox[] {
      const g = surface.g;
      const whole = formula(g, src, fstyle(size, color, weight));
      if (whole.w <= maxW) return [whole];
      const cuts: number[] = [];
      let depth = 0;
      for (let i = 0; i < src.length; i++) {
        const ch = src[i]!;
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        else if (depth === 0 && i > 0 && (ch === '+' || ch === '−') && src[i - 1] === ' ') cuts.push(i);
      }
      for (let j = cuts.length - 1; j >= 0; j--) {
        const a = src.slice(0, cuts[j]!).trimEnd();
        const first = formula(g, a, fstyle(size, color, weight));
        if (first.w <= maxW || j === 0) {
          const rest = fit(`   ${src.slice(cuts[j]!)}`, maxW, size, color, weight);
          return [first.w <= maxW ? first : fit(a, maxW, size, color, weight), rest];
        }
      }
      return [fit(src, maxW, size, color, weight)];
    }
    const sub = (k: number) => `_{${k}}`;
    /** Winkel als Vielfaches von π (Formel-Kurzschrift). */
    function piText(rad: number): string {
      const f = formatPiFraction(rad, [1, 2, 3, 4, 6, 12]);
      return f ?? n(rad, 2);
    }

    /** Reihe des Signals in Kurzschrift (für die Karte). */
    function seriesSrc(): string {
      const s = sig();
      switch (s) {
        case 'sq':
          return 'f(x) = \\f{4}{π}(\\t{sin} x + \\f{1}{3}\\t{sin} 3x + \\f{1}{5}\\t{sin} 5x + …)';
        case 'saw':
          return 'f(x) = \\f{2}{π}(\\t{sin} x − \\f{1}{2}\\t{sin} 2x + \\f{1}{3}\\t{sin} 3x − …)';
        case 'tri':
          return 'f(x) = \\f{8}{π²}(\\t{cos} x + \\f{1}{9}\\t{cos} 3x + \\f{1}{25}\\t{cos} 5x + …)';
        case 'trap':
          return `f(x) = \\f{4}{π} \\t{Σ} \\f{\\t{sin}(kα)}{kα} · \\f{\\t{sin} kx}{k}`;
        case 'pulse':
          return `f(x) = d + \\t{Σ} \\f{2 \\t{sin}(πkd)}{πk} \\t{cos} kx`;
        case 'half':
          return 'f(x) = \\f{1}{π} + \\f{1}{2}\\t{sin} x − \\f{2}{π}(\\f{1}{3}\\t{cos} 2x + \\f{1}{15}\\t{cos} 4x + …)';
        case 'full':
          return 'f(x) = \\f{2}{π} − \\f{4}{π}(\\f{1}{3}\\t{cos} 2x + \\f{1}{15}\\t{cos} 4x + \\f{1}{35}\\t{cos} 6x + …)';
        case 'own': {
          const parts: string[] = [];
          own().forEach((c, i) => {
            if (Math.abs(c) < 1e-9) return;
            const k = i + 1;
            const mag = n(Math.abs(c), 2);
            const term = `${mag === '1' ? '' : mag + ' '}\\t{sin} ${k === 1 ? '' : k}x`;
            parts.push(parts.length === 0 ? (c < 0 ? `−${term}` : term) : `${c < 0 ? '−' : '+'} ${term}`);
          });
          return `f(x) = ${parts.length ? parts.join(' ') : '0'}`;
        }
      }
    }
    /** Zusatz zur Reihe (Parameter der Form). */
    function seriesNote(): string | null {
      const s = sig();
      // nur ohne Phasenverschiebung ist der Puls gerade (reine Kosinusreihe)
      if (s === 'pulse') return `d = ${n(p.d / 100, 2)}${p.ph === 0 ? say(L(', nur cos-Glieder', ', cosine terms only')) : ''}`;
      if (s === 'trap') return `α = \\f{w · π}{2} = ${n((p.w / 100) * (PI / 2), 3)}${say(L(', k ungerade', ', k odd'))}`;
      return null;
    }

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
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${th().font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }
    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const g = surface.g;
      const theme = th();
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${theme.font}`;
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
    /** Formel in einer Pille (y: Mitte). */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; bounds?: Rect } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const box = opts.maxW ? fit(src, opts.maxW, size, color, 700) : formula(g, src, fstyle(size, color, 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
      g.save();
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)';
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    /** Formel mit hellem Halo (y: Mitte). */
    function flabel(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = fs(13, 12), alpha = 1, bounds?: Rect): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (bounds) left = clamp(left, bounds.x + 4, bounds.x + bounds.w - box.w - 4);
      const base = y + (box.asc - box.desc) / 2;
      g.save();
      g.globalAlpha *= alpha * 0.86;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha /= 0.86;
      box.draw(g, left, base);
      g.restore();
    }

    function panel(r: Rect, alpha = 1): void {
      const g = surface.g;
      const dark = th().dark;
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#192233' : '#fbfcfe');
      bg.addColorStop(1, dark ? '#121925' : '#eef2f7');
      g.fillStyle = bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 14);
      g.fill();
      g.restore();
      const gl = g.createRadialGradient(r.x + r.w * 0.25, r.y, 10, r.x + r.w * 0.3, r.y + r.h * 0.2, Math.max(r.w, r.h) * 0.8);
      gl.addColorStop(0, dark ? 'rgba(140,180,255,0.07)' : 'rgba(255,255,255,0.75)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.save();
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 14);
      g.clip();
      g.fillStyle = gl;
      g.fillRect(r.x, r.y, r.w, r.h);
      g.restore();
      g.strokeStyle = dark ? '#273142' : '#dfe5ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 14);
      g.stroke();
      g.restore();
    }

    function card(r: Rect, accent?: string): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      if (accent) {
        const grad = g.createLinearGradient(r.x, r.y, r.x, r.y + Math.min(80, r.h));
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.12 : 0.07));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
        g.fill();
      }
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function cardTitle(R: Rect, title: string, color: string, right?: string, rightColor?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      const tw = richText(title, R.x + pad + 15, ty, fs(13.5, 12.5), th().text, 'left', false, 750);
      if (right) {
        const rw = richWidth(right, fs(12, 11), 650);
        if (R.x + pad + 15 + tw + 12 + rw < R.x + R.w - pad) richText(right, R.x + R.w - pad, ty, fs(12, 11), rightColor ?? th().muted, 'right', false, 650);
      }
      return ty;
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.5);
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

    function dot(x: number, y: number, color: string, r: number): void {
      const g = surface.g;
      if (r <= 0.2) return;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0.5, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.45));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
    }

    /** Kurve in Pixeln zeichnen (mit optionalem Glanz/Schatten). */
    function strokePts(pts: [number, number][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      const path = () => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      };
      if (opts.glow) {
        g.save();
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.65)' : mixColor(color, '#ffffff', 0.4, 0.55);
        g.shadowBlur = th().dark ? 9 : 7;
        g.shadowOffsetY = 2;
        g.strokeStyle = color;
        g.lineWidth = width;
        path();
        g.stroke();
        g.restore();
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      path();
      g.stroke();
      if (opts.glow && width >= 2.5) {
        g.translate(0, -width * 0.22);
        g.strokeStyle = withAlpha('#ffffff', th().dark ? 0.22 : 0.4);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }

    /** Werte einer Funktion über [x0, x1] als Pixelpunkte. */
    function sample(f: (x: number) => number, x0: number, x1: number, px: (x: number) => number, py: (y: number) => number, count: number): [number, number][] {
      const out: [number, number][] = [];
      for (let i = 0; i <= count; i++) {
        const x = x0 + ((x1 - x0) * i) / count;
        out.push([px(x), py(f(x))]);
      }
      return out;
    }

    const shareNow = () => shareOf(coD, powerOf(spec), NMAX, wA);
    const fmtPct = (v: number, d = 1) => `${n(v * 100, d)} %`;

    /* =====================================================================
     * Ansicht 1: Partialsumme
     * ===================================================================== */
    function drawSum(R: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const SR = sumRegions(R);
      plot.setRange([X0, X1], [num.yLo.v, num.yHi.v]);
      plot.setAxes({ x: axisFmt() });
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      // Zielsignal (gestrichelt), beim Einstieg von links nach rechts gezeichnet
      if (p.tgt) {
        g.save();
        g.beginPath();
        g.rect(r.x, r.y, r.w * k.reveal, r.h);
        g.clip();
        plot.fn(T, { color: withAlpha(col.f(), theme.dark ? 0.85 : 0.75), width: 2, dash: [6, 5] });
        g.restore();
      }
      // frisch hinzugekommene Teilschwingung: kurz in ihrer Farbe sichtbar
      if (fresh && now - fresh.t0 < 1600 && nonzero(fresh.k)) {
        const a = 1 - clamp01((now - fresh.t0) / 1600);
        const kk = fresh.k;
        const amp = sigma(smooth(), kk, Math.max(p.n, kk));
        plot.fn((x) => amp * (coD.a[kk]! * Math.cos(kk * x) + coD.b[kk]! * Math.sin(kk * x)), { color: hk(kk), width: 2, alpha: 0.85 * a });
      }
      // Partialsumme
      const N = shownN(now);
      const cnt = Math.round(clamp(r.w * 1.2, 300, 900));
      const pts = sample(S, X0, X1, (x) => plot.px(x), (y) => plot.py(y), cnt);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      strokePts(pts, col.S(), sm() ? 2.6 : 3.2, { glow: true, alpha: k.curve });
      g.restore();
      // Gibbs-Linie
      const J = jumpHeight(sig()) * p.amp;
      if (p.gib && J > 0 && p.n >= 3 && k.labels > 0.01) {
        let my = -Infinity;
        for (const [, py] of pts) my = Math.max(my, plot.toWorld(0, py)[1]);
        num.max.follow(settled() && gibbsExact !== null ? gibbsExact : my, 0.08);
        const top = targetRange(spec).hi;
        if (my > top + 0.01 * p.amp) {
          plot.hline(num.max.v, { color: withAlpha(col.x(), 0.55), width: 1.2, dash: [3, 4] });
          plot.hline(top, { color: withAlpha(col.f(), 0.4), width: 1, dash: [2, 5] });
          const pct = (num.max.v - top) / J;
          const lab = p.info ? `max ≈ ${n(num.max.v, 3)}  (+${n(pct * 100, 1)} % ${say(L('der Sprunghöhe', 'of the jump'))})` : 'max ≈ ?';
          flabel(r.x + r.w - 10, plot.py(num.max.v) - 12, lab, col.x(), 'right', fs(12, 11), k.labels, r);
        }
      }
      // Prüfstelle
      const x = p.x;
      const sx = S(x);
      const fx = T(x);
      const px = plot.px(x);
      g.save();
      g.globalAlpha *= k.labels;
      plot.segment([x, 0], [x, Math.min(fx, sx)], { color: withAlpha(col.x(), 0.4), width: 1.2, dash: [3, 3] });
      plot.segment([x, fx], [x, sx], { color: col.x(), width: 3 });
      g.restore();
      dot(px, plot.py(sx), col.S(), 5 * k.labels);
      if (p.tgt) dot(px, plot.py(fx), mixColor(col.f(), theme.bg, 0.1), 3.5 * k.labels);
      // Abtastpunkt, wenn die Uhr läuft
      if (ctx.clock.playing) {
        const xs = X0 + ((((xt % (X1 - X0)) + (X1 - X0)) % (X1 - X0)));
        g.save();
        g.fillStyle = withAlpha(col.S(), 0.2);
        g.beginPath();
        g.arc(plot.px(xs), plot.py(S(xs)), 12, 0, TAU);
        g.fill();
        g.restore();
        dot(plot.px(xs), plot.py(S(xs)), col.S(), 5.5);
      }
      // Wert an der Prüfstelle
      if (k.labels > 0.01) {
        num.val.follow(sx, dragging() ? 0.02 : 0.15);
        const lab = `S${sub(N)}(${n(x, 2)}) ${p.info ? `≈ ${n(num.val.v, 3)}` : '= ?'}`;
        const right = px < r.x + r.w * 0.62;
        const ly = clamp(plot.py(sx) + (sx > fx ? -18 : 18), r.y + 60, r.y + r.h - 34);
        flabel(px + (right ? 12 : -12), ly, lab, col.x(), right ? 'left' : 'right', fs(13, 12), k.labels, r);
      }
      // Legende
      fpill(r.x + 10, r.y + 18, `\\c{S}{S${sub(N)}(x)}${smooth() !== 'none' ? `  \\c{m}{(σ: ${smooth() === 'fejer' ? 'Fejér' : 'Lanczos'})}` : ''}`, { align: 'left', size: fs(13.5, 12.5), alpha: k.labels, border: withAlpha(col.S(), 0.5) });
      if (p.tgt) flabel(r.x + 12, r.y + 46, p.amp !== 1 || p.ph !== 0 ? `\\c{m}{g(x) = ${p.amp !== 1 ? n(p.amp, 1) + ' · ' : ''}f(x${p.ph !== 0 ? ` ${p.ph > 0 ? '−' : '+'} ${piText(Math.abs(p.ph) * DEG)}` : ''})}` : '\\c{m}{f(x)}', col.f(), 'left', fs(12.5, 11.5), k.labels);
      if (p.tax) flabel(r.x + r.w - 10, r.y + r.h - 34, `t in ms (T = ${n(1000 / p.f0, msDigits() + 1)} ms)`, theme.muted, 'right', fs(11.5, 11), k.labels, r);
      plot.end();
      drawStoryCaption(r, now);
      if (SR.parts) drawParts(now, k);
    }

    function drawParts(now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const amax = num.amp.v * 1.18;
      plotH.setRange([X0, X1], [-amax, amax]);
      plotH.resize();
      plotH.begin();
      plotH.grid({ minor: false });
      plotH.axes();
      const newest = story ? shownN(now) : fresh && now - fresh.t0 < 1600 ? fresh.k : p.n;
      const r = plotH.rect;
      const cnt = Math.round(clamp(r.w, 240, 700));
      if (Math.abs(coD.mean) > 1e-6) {
        plotH.hline(coD.mean, { color: withAlpha(theme.muted, 0.8), width: 1.6, dash: [5, 4] });
        flabel(r.x + r.w - 8, plotH.py(coD.mean) - 10, '\\f{a_0}{2}', theme.muted, 'right', fs(11.5, 11), k.labels, r);
      }
      for (let kk = 1; kk <= NMAX; kk++) {
        if (wA[kk]! < 0.003 || !nonzero(kk)) continue;
        const on = kk === newest;
        const pts = sample((x) => H(kk, x), X0, X1, (x) => plotH.px(x), (y) => plotH.py(y), cnt);
        strokePts(pts, hk(kk), on ? 2.6 : 1.4, { alpha: (on ? 1 : 0.5) * clamp01(wA[kk]! * 3), glow: on });
      }
      g.save();
      g.globalAlpha *= k.labels;
      richText(say(L('Teilschwingungen', 'Harmonics')), r.x + 10, r.y + 12, fs(12, 11), theme.muted, 'left', true, 700);
      if (nonzero(newest) && wA[newest]! > 0.05) {
        const c = polar(coD.a[newest]!, coD.b[newest]!);
        flabel(r.x + r.w - 8, r.y + 12, `k = ${newest}:  Â${sub(newest)} = ${Q(n(c.amp, 3))}`, hk(newest), 'right', fs(12, 11), 1, r);
      }
      g.restore();
      plotH.end();
    }

    /** Untertitel beim „Aufbau abspielen“. */
    function drawStoryCaption(r: Rect, now: number): void {
      if (!story) return;
      const t = now - story.t0 - 300;
      const i = clamp(Math.floor(t / story.step), 0, story.ks.length - 1);
      const kk = story.ks[i]!;
      const fade = Math.min(1, (t - i * story.step) / 220 + 0.2);
      const c = polar(coT.a[kk]!, coT.b[kk]!);
      const term = termSrc(kk);
      const src = `\\c{m}{k = ${kk}:}  + ${term}${p.info ? `   \\c{m}{(Â = ${n(c.amp, 3)})}` : ''}`;
      fpill(r.x + r.w / 2, r.y + r.h - 26 - (1 - ease.outCubic(clamp01(fade))) * 8, src, { color: hk(kk), border: hk(kk), alpha: clamp01(fade) * 0.98, maxW: r.w - 40, bounds: r });
    }

    /** Glied k in Kurzschrift (mit Zahlen). */
    function termSrc(kk: number): string {
      const a = coT.a[kk]!;
      const b = coT.b[kk]!;
      const kx = kk === 1 ? 'x' : `${kk}x`;
      const bits: string[] = [];
      if (Math.abs(b) > 1e-9) bits.push(`${n(b, 3)} \\t{sin} ${kx}`);
      if (Math.abs(a) > 1e-9) bits.push(`${bits.length && a > 0 ? '+ ' : ''}${n(a, 3)} \\t{cos} ${kx}`);
      return bits.length ? bits.join(' ') : '0';
    }

    /* =====================================================================
     * Ansicht 2: Zeiger (Epizykel)
     * ===================================================================== */
    function drawEpi(R: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      panel(R, k.panel);
      const pad = fs(14, 10);
      const top = R.y + fs(48, 44);
      const bottom = R.y + R.h - fs(30, 26);
      const H2 = (bottom - top) / 2;
      const cy0 = top + H2;
      const yr = Math.max(num.yHi.v, -num.yLo.v, 0.3) * 0.98;
      const circW = clamp(Math.min(R.w * (R.h > R.w * 0.8 ? 0.55 : 0.46), H2 * 2.2), 110, 480);
      // Reichweite der Zeigerkette: größter Zeiger ganz, die übrigen zu 40 % (sie zeigen selten gleichzeitig nach außen)
      let aBig = 0;
      let aSum = 0;
      for (let kk = 1; kk <= NMAX; kk++) {
        if (!nonzero(kk)) continue;
        const a = Math.hypot(coD.a[kk]!, coD.b[kk]!) * wA[kk]!;
        aBig = Math.max(aBig, a);
        aSum += a;
      }
      const reach = Math.abs(coD.mean) + aBig + 0.4 * (aSum - aBig);
      num.reach.follow(Math.max(reach, 0.2), 0.25);
      const u = Math.min(H2 / yr, (circW / 2 - 6) / num.reach.v, (H2 * 1.05) / num.reach.v);
      const cx = R.x + pad + circW / 2;
      const traceX0 = R.x + pad + circW + fs(26, 16);
      const traceX1 = R.x + R.w - pad;
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      // Achsen der Spur
      g.strokeStyle = withAlpha(theme.axis, 0.45);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(traceX0, Math.round(cy0) + 0.5);
      g.lineTo(traceX1, Math.round(cy0) + 0.5);
      g.stroke();
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (const yy of [-1, 1].map((s) => s * Math.max(0.5, Math.round(yr * 0.75 * 2) / 2))) {
        g.moveTo(traceX0, Math.round(cy0 - yy * u) + 0.5);
        g.lineTo(traceX1, Math.round(cy0 - yy * u) + 0.5);
      }
      g.stroke();
      // Perioden-Marken auf der Spur (rückwärts: Vergangenheit rechts)
      const span = 2 * TAU;
      const pxPer = (traceX1 - traceX0) / span;
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      for (let j = 1; j <= 2; j++) {
        const xx = traceX0 + j * TAU * pxPer;
        g.strokeStyle = withAlpha(theme.muted, 0.35);
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(Math.round(xx) + 0.5, top);
        g.lineTo(Math.round(xx) + 0.5, bottom);
        g.stroke();
        g.setLineDash([]);
        const lab = p.tax ? `−${n((j * 1000) / p.f0, msDigits())} ms` : `−${2 * j}π`;
        g.fillText(lab, Math.min(xx, traceX1 - 22), bottom + 6);
      }
      g.textAlign = 'left';
      g.fillText(say(L('jetzt', 'now')), traceX0 + 3, bottom + 6);
      // Zielsignal auf der Spur
      const cnt = Math.round(clamp((traceX1 - traceX0) * 1.2, 160, 700));
      if (p.tgt) {
        const tp = sample((s) => T(xt - s), 0, span, (s) => traceX0 + s * pxPer, (y) => cy0 - y * u, cnt);
        strokePts(tp, withAlpha(col.f(), theme.dark ? 0.85 : 0.7), 1.8, { dash: [6, 5], alpha: k.labels });
      }
      // Spur der Partialsumme mit Verlauf (ältere Teile blasser)
      const sp = sample((s) => S(xt - s), 0, span * k.reveal, (s) => traceX0 + s * pxPer, (y) => cy0 - y * u, cnt);
      const grad = g.createLinearGradient(traceX0, 0, traceX1, 0);
      grad.addColorStop(0, col.S());
      grad.addColorStop(1, withAlpha(col.S(), 0.35));
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.S(), '#ffffff', 0.4, 0.5);
      g.shadowBlur = 6;
      g.strokeStyle = grad;
      g.lineWidth = sm() ? 2.6 : 3.2;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.beginPath();
      sp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
      // Zeigerkette
      let zx = cx;
      let zy = cy0 - coD.mean * u;
      // Ruhelage/Gleichanteil
      g.strokeStyle = withAlpha(theme.axis, 0.35);
      g.setLineDash([3, 5]);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R.x + pad, Math.round(cy0) + 0.5);
      g.lineTo(traceX0 - 6, Math.round(cy0) + 0.5);
      g.stroke();
      g.setLineDash([]);
      if (Math.abs(coD.mean) > 1e-6) {
        g.strokeStyle = withAlpha(theme.muted, 0.8);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(cx, cy0);
        g.lineTo(cx, zy);
        g.stroke();
        flabel(cx - 8, (cy0 + zy) / 2, '\\f{a_0}{2}', theme.muted, 'right', fs(11.5, 11), k.labels, R);
      }
      const chain: { x: number; y: number; r: number; kk: number; ex: number; ey: number }[] = [];
      for (let kk = 1; kk <= NMAX; kk++) {
        const w = wA[kk]!;
        if (w < 0.002 || !nonzero(kk)) continue;
        const c = polar(coD.a[kk]!, coD.b[kk]!);
        const rad = c.amp * w * u;
        const ang = kk * xt + c.phase;
        const ex = zx + rad * Math.cos(ang);
        const ey = zy - rad * Math.sin(ang);
        chain.push({ x: zx, y: zy, r: rad, kk, ex, ey });
        zx = ex;
        zy = ey;
      }
      // Kreise
      for (const c of chain) {
        if (c.r < 1.5) continue;
        g.save();
        g.strokeStyle = withAlpha(hk(c.kk), theme.dark ? 0.42 : 0.38);
        g.lineWidth = 1.3;
        g.fillStyle = withAlpha(hk(c.kk), theme.dark ? 0.05 : 0.04);
        g.beginPath();
        g.arc(c.x, c.y, c.r, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
      }
      // Zeiger
      for (const c of chain) {
        if (c.r < 1) continue;
        arrowPx(c.x, c.y, c.ex, c.ey, hk(c.kk), c.r > 30 ? 2.6 : c.r > 10 ? 2 : 1.4, Math.min(9, c.r * 0.45));
      }
      if (chain.length) dot(cx, cy0 - coD.mean * u, theme.text, 3);
      // Verbindung Spitze → Spur
      const sy = cy0 - S(xt) * u;
      g.strokeStyle = withAlpha(col.x(), 0.75);
      g.lineWidth = 1.4;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(zx, zy);
      g.lineTo(traceX0, sy);
      g.stroke();
      g.setLineDash([]);
      dot(zx, zy, col.x(), 4.5);
      g.save();
      g.fillStyle = withAlpha(col.S(), 0.22);
      g.beginPath();
      g.arc(traceX0, sy, 11, 0, TAU);
      g.fill();
      g.restore();
      dot(traceX0, sy, col.S(), 5.5);
      // erste Zeiger beschriften
      let lab = 0;
      for (const c of chain) {
        if (lab >= 3 || c.r < 16) continue;
        const mx = (c.x + c.ex) / 2;
        const my = (c.y + c.ey) / 2;
        const nx = -(c.ey - c.y) / Math.max(1, c.r);
        const ny = (c.ex - c.x) / Math.max(1, c.r);
        flabel(mx + nx * 12, my + ny * 12, `k = ${c.kk}`, hk(c.kk), 'center', fs(11.5, 11), k.labels * 0.95);
        lab++;
      }
      g.restore();
      // Kopfzeile
      const cntZ = chain.length;
      const N = shownN(now);
      fpill(R.x + 12, R.y + 22, `\\c{S}{S${sub(N)}}: ${cntZ} ${say(L('Zeiger', 'phasors'))}`, { align: 'left', size: fs(13, 12), alpha: k.labels, border: withAlpha(col.S(), 0.5) });
      const xw = ((xt % TAU) + TAU) % TAU;
      const right = p.tax ? `t = ${n((xw / TAU) * (1000 / p.f0), msDigits() + 1)} ms` : `x = ω t = ${n(xw, 2)}`;
      if (R.w > 360) fpill(R.x + R.w - 12, R.y + 22, right, { align: 'right', size: fs(12.5, 11.5), alpha: k.labels, color: theme.muted });
      if (!ctx.clock.playing && !reduced() && k.labels > 0.99) richText(say(L('▶ Zeiger starten: Abspielen', '▶ Start the phasors: press play')), R.x + R.w / 2, R.y + R.h - 12, fs(11.5, 11), theme.muted, 'center', true, 650);
      drawStoryCaption({ x: R.x, y: R.y, w: R.w, h: R.h - 22 }, now);
    }

    /* =====================================================================
     * Ansicht 3: gestapelte Teilschwingungen
     * ===================================================================== */
    let stackGeo: { x0: number; x1: number; y0: number; y1: number } | null = null;
    function drawStack(R: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      panel(R, k.panel);
      const pad = fs(12, 8);
      const valW = fs(78, 62);
      const labW = fs(84, 58);
      const x0 = R.x + pad + labW;
      const x1 = R.x + R.w - pad - valW;
      const top = R.y + fs(44, 40);
      const bottom = R.y + R.h - pad - (p.tax ? 16 : 4);
      const sumH = clamp((bottom - top) * 0.3, 70, 170);
      const laneArea = bottom - top - sumH - 10;
      const ks: number[] = [];
      for (let kk = 1; kk <= NMAX; kk++) if (nonzero(kk) && wA[kk]! > 0.004) ks.push(kk);
      const laneMin = fs(34, 30);
      const maxLanes = Math.max(1, Math.floor(laneArea / laneMin));
      const shown = ks.length > maxLanes ? ks.slice(0, maxLanes - 1) : ks;
      const rest = ks.length > maxLanes ? ks.slice(maxLanes - 1) : [];
      const lanes = shown.length + (rest.length ? 1 : 0);
      const laneH = lanes ? Math.min(fs(64, 52), laneArea / Math.max(lanes, 1)) : laneMin;
      const X = (x: number) => x0 + ((x - X0) / (X1 - X0)) * (x1 - x0);
      stackGeo = { x0, x1, y0: top, y1: bottom };
      const amax = Math.max(num.amp.v, 0.05);
      const xs = clamp(p.x, X0, X1);
      const xsPx = X(xs);
      const cnt = Math.round(clamp((x1 - x0) * 0.9, 160, 600));
      const vf = fs(12.5, 11.5);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      // Bahnen
      let y = top;
      const fresh0 = fresh && now - fresh.t0 < 1600 ? fresh.k : -1;
      const drawLane = (label: string, f: (x: number) => number, color: string, alpha: number, value: number, hot: boolean) => {
        const cy = y + laneH / 2;
        const half = laneH / 2 - 5;
        const off = (1 - alpha) * 16;
        g.save();
        g.globalAlpha *= clamp01(alpha * 1.4);
        g.translate(off, 0);
        g.fillStyle = withAlpha(color, theme.dark ? (hot ? 0.16 : 0.07) : hot ? 0.12 : 0.05);
        roundRect(g, x0 - 4, y + 2, x1 - x0 + 8, laneH - 4, 8);
        g.fill();
        g.strokeStyle = withAlpha(theme.axis, 0.25);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x0, Math.round(cy) + 0.5);
        g.lineTo(x1, Math.round(cy) + 0.5);
        g.stroke();
        const pts = sample(f, X0, X1, X, (v) => cy - (v / amax) * half, cnt);
        strokePts(pts, color, hot ? 2.4 : 1.8, { glow: hot });
        flabel(R.x + pad + 2, cy, label, color, 'left', fs(12, 11), 1);
        const vy = cy - (f(xs) / amax) * half;
        dot(xsPx, vy, color, 3.8);
        richText(p.info ? fmt.signed(value, 3) : '?', R.x + R.w - pad - 4, cy, vf, color, 'right', false, 750);
        g.restore();
        y += laneH;
      };
      if (Math.abs(coD.mean) > 1e-6 && lanes < maxLanes + 1) {
        // Gleichanteil als schmale Zeile über den Bahnen
        richText(`a₀/2 = ${p.info ? fmt.num(coD.mean, 3) : '?'}`, R.x + R.w - pad - 4, top - 12, fs(11.5, 11), theme.muted, 'right', false, 700);
      }
      for (const kk of shown) {
        const v = H(kk, xs);
        drawLane(`k = ${kk}`, (x) => H(kk, x), hk(kk), clamp01(wA[kk]! / Math.max(0.05, sigma(smooth(), kk, Math.max(p.n, kk)))), v, kk === fresh0 || (story !== null && kk === shownN(now)));
      }
      if (rest.length) {
        const v = rest.reduce((s, kk) => s + H(kk, xs), 0);
        drawLane(`+${rest.length}`, (x) => rest.reduce((s, kk) => s + H(kk, x), 0), theme.muted, 1, v, false);
      }
      // Summenbahn
      const sy0 = bottom - sumH;
      const scy = sy0 + sumH / 2;
      const yr = Math.max(num.yHi.v, -num.yLo.v) * 0.95;
      const su = (sumH / 2 - 6) / yr;
      g.save();
      g.fillStyle = withAlpha(col.S(), theme.dark ? 0.08 : 0.05);
      roundRect(g, x0 - 4, sy0, x1 - x0 + 8, sumH, 10);
      g.fill();
      g.strokeStyle = withAlpha(col.S(), 0.35);
      g.lineWidth = 1.2;
      roundRect(g, x0 - 3.5, sy0 + 0.5, x1 - x0 + 7, sumH - 1, 10);
      g.stroke();
      g.strokeStyle = withAlpha(theme.axis, 0.35);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0, Math.round(scy) + 0.5);
      g.lineTo(x1, Math.round(scy) + 0.5);
      g.stroke();
      if (p.tgt) strokePts(sample(T, X0, X1, X, (v) => scy - v * su, cnt), withAlpha(col.f(), 0.8), 1.8, { dash: [6, 5] });
      strokePts(sample(S, X0, X1, X, (v) => scy - v * su, cnt), col.S(), 3, { glow: true });
      g.restore();
      const N = shownN(now);
      flabel(R.x + pad + 2, scy, `\\c{S}{S${sub(N)}(x)}`, col.S(), 'left', fs(13, 12), 1);
      const sv = S(xs);
      num.val.follow(sv, dragging() ? 0.02 : 0.15);
      dot(xsPx, scy - sv * su, col.S(), 5);
      // Summenstrich und Ergebnis
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(R.x + R.w - pad - valW + 8, sy0 - 4);
      g.lineTo(R.x + R.w - pad - 2, sy0 - 4);
      g.stroke();
      richText(p.info ? `= ${fmt.num(num.val.v, 3)}` : '= ?', R.x + R.w - pad - 4, scy, fs(14, 12.5), col.S(), 'right', false, 800);
      // Prüfstelle über alle Bahnen
      g.strokeStyle = withAlpha(col.x(), 0.8);
      g.lineWidth = 2;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(xsPx, top - 4);
      g.lineTo(xsPx, bottom);
      g.stroke();
      g.setLineDash([]);
      const hot = hoverStack || dragStack;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 5;
      g.fillStyle = col.x();
      g.beginPath();
      g.arc(xsPx, top - 6, hot ? 8 : 6.5, 0, TAU);
      g.fill();
      g.restore();
      // x-Beschriftung unten
      if (p.tax) {
        g.font = `600 ${fs(11, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'center';
        g.textBaseline = 'top';
        for (const xv of [-TAU, -PI, PI, TAU]) g.fillText(`${n((xv / TAU) * (1000 / p.f0), msDigits())} ms`, X(xv), bottom + 2);
      }
      g.restore();
      // Kopf
      const head = `x = ${n(p.x, 2)}${p.tax ? ` (t = ${n((p.x / TAU) * (1000 / p.f0), msDigits() + 1)} ms)` : ''}`;
      fpill(R.x + 12, R.y + 20, `${say(L('Summe an der Stelle', 'Sum at'))} ${head}`, { align: 'left', size: fs(12.5, 11.5), alpha: k.labels, border: withAlpha(col.x(), 0.5), maxW: R.w - 40 });
      drawStoryCaption({ x: R.x, y: R.y, w: R.w, h: sy0 - R.y + 8 }, now);
    }

    /* =====================================================================
     * Ansicht 4: Spektrum und Energie
     * ===================================================================== */
    let barHits: { k: number; x0: number; x1: number; y0: number; y1: number }[] = [];
    let hoverBar: number | null = null;
    function drawSpecView(R: Rect, now: number, k: Intro): void {
      const wide = R.w >= 330;
      const gap = fs(10, 8);
      const ampH = Math.round(R.h * (R.w >= 520 ? 0.54 : 0.5));
      drawAmpSpectrum({ x: R.x, y: R.y, w: R.w, h: ampH }, now, k, true);
      const rest = { x: R.x, y: R.y + ampH + gap, w: R.w, h: R.h - ampH - gap };
      if (wide) {
        const w1 = Math.round((rest.w - gap) * (R.w >= 520 ? 0.47 : 0.5));
        drawPhaseSpectrum({ x: rest.x, y: rest.y, w: w1, h: rest.h }, k);
        drawEnergyChart({ x: rest.x + w1 + gap, y: rest.y, w: rest.w - w1 - gap, h: rest.h }, now, k);
      } else {
        const h1 = Math.round((rest.h - gap) * 0.45);
        drawPhaseSpectrum({ x: rest.x, y: rest.y, w: rest.w, h: h1 }, k);
        drawEnergyChart({ x: rest.x, y: rest.y + h1 + gap, w: rest.w, h: rest.h - h1 - gap }, now, k);
      }
    }

    /** Amplitudenspektrum (groß in der Spektrum-Ansicht, klein als Karte). */
    function drawAmpSpectrum(R: Rect, now: number, k: Intro, big: boolean): void {
      const g = surface.g;
      const theme = th();
      if (big) panel(R, k.panel);
      else card(R);
      const ty = big ? R.y + 20 : cardTitle(R, say(L('Amplitudenspektrum', 'Amplitude spectrum')), col.S(), say(L('Balken antippen', 'tap a bar')));
      if (big) {
        richText(say(L('Amplitudenspektrum Â_[k]', 'Amplitude spectrum Â_[k]')), R.x + 14, ty, fs(13.5, 12.5), theme.text, 'left', false, 750);
        const note = say(L('Balken antippen: N wählen', 'tap a bar to choose N'));
        if (R.w > 380) richText(note, R.x + R.w - 14, ty, fs(11.5, 11), theme.muted, 'right', false, 650);
      }
      const kShow = Math.round(num.kShow.v);
      const left = R.x + (big ? 44 : 30);
      const right = R.x + R.w - (big ? 16 : 12);
      const top = ty + (big ? 22 : 18);
      const hzRow = big && R.h > 170;
      const bottom = R.y + R.h - (hzRow ? 40 : 24);
      if (bottom - top < 24) return;
      const bw = (right - left) / (kShow + 1);
      const amax = Math.max(num.amp.v, 0.05) * 1.08;
      const Y = (a: number) => bottom - (a / amax) * (bottom - top);
      // Gitter
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      const stepA = amax > 1.6 ? 0.5 : amax > 0.8 ? 0.25 : amax > 0.3 ? 0.1 : 0.05;
      for (let a = stepA; a < amax; a += stepA) {
        const yy = Math.round(Y(a)) + 0.5;
        g.beginPath();
        g.moveTo(left, yy);
        g.lineTo(right, yy);
        g.stroke();
        if (big || a / stepA === Math.round(a / stepA)) g.fillText(n(a, 2), left - 5, yy);
      }
      // Hüllkurve 1/k bzw. 1/k²
      const fe = features(spec, 24);
      if (big && fe.decay > 0) {
        let c = 0;
        for (let kk = 1; kk <= 24; kk++) c = Math.max(c, Math.hypot(coT.a[kk]!, coT.b[kk]!) * kk ** fe.decay);
        const pts: [number, number][] = [];
        for (let i = 0; i <= 200; i++) {
          const kk = 0.85 + ((kShow + 0.4 - 0.85) * i) / 200;
          pts.push([left + (kk + 0.5) * bw, Y(Math.min(amax, c / kk ** fe.decay))]);
        }
        strokePts(pts, withAlpha(theme.muted, 0.7), 1.4, { dash: [4, 4], alpha: k.labels });
        const kl = Math.min(kShow - 1, 8) + 0.5;
        const lx = left + (kl + 0.5) * bw;
        flabel(lx, Y(Math.min(amax, c / kl ** fe.decay)) - 22, fe.decay === 1 ? '∼ \\f{1}{k}' : '∼ \\f{1}{k²}', theme.muted, 'center', fs(12, 11), k.labels, R);
      }
      // Balken
      barHits = big ? [] : barHits;
      const N = shownN(now);
      for (let kk = 0; kk <= kShow; kk++) {
        const full = kk === 0 ? Math.abs(coD.mean) : Math.hypot(coD.a[kk]!, coD.b[kk]!);
        const w = kk === 0 ? 1 : wA[kk]!;
        const cx = left + (kk + 0.5) * bw;
        const bx = cx - bw * 0.32;
        const bww = Math.max(2, bw * 0.64);
        const grow = clamp01(k.bars * (kShow + 3) - kk * 0.8);
        if (full > 1e-6) {
          // volle Amplitude als Umriss
          g.strokeStyle = withAlpha(kk === 0 ? theme.muted : hk(kk), 0.55);
          g.lineWidth = 1.2;
          g.setLineDash([3, 3]);
          g.strokeRect(bx + 0.5, Y(full * grow), bww - 1, (bottom - Y(full * grow)));
          g.setLineDash([]);
          const hh = full * w * grow;
          if (hh > 1e-6) {
            const color = kk === 0 ? theme.muted : hk(kk);
            const grad = g.createLinearGradient(0, Y(hh), 0, bottom);
            grad.addColorStop(0, mixColor(color, '#ffffff', theme.dark ? 0.1 : 0.2));
            grad.addColorStop(1, color);
            g.save();
            if (kk === N || hoverBar === kk) {
              g.shadowColor = withAlpha(color, 0.7);
              g.shadowBlur = 10;
            }
            g.fillStyle = grad;
            roundRect(g, bx, Y(hh), bww, bottom - Y(hh), Math.min(4, bww / 3));
            g.fill();
            g.restore();
          }
        } else if (kk > 0 && kk <= kShow) {
          g.fillStyle = withAlpha(theme.muted, 0.4);
          g.fillRect(cx - 2, bottom - 2, 4, 2);
        }
        // Beschriftung k
        const every = bw < 13 ? 5 : bw < 22 ? 2 : 1;
        if ((kk % every === 0 && (kk === N || Math.abs(kk - N) >= Math.max(2, every))) || kk === N) {
          g.font = `${kk === N ? 800 : 600} ${fs(11, 11)}px ${theme.font}`;
          g.fillStyle = kk === N ? col.S() : theme.muted;
          g.textAlign = 'center';
          g.textBaseline = 'top';
          g.fillText(String(kk), cx, bottom + 4);
          if (hzRow && (kk % (every * (bw < 30 ? 2 : 1)) === 0) && kk > 0) {
            g.font = `600 ${fs(10.5, 10.5)}px ${theme.font}`;
            g.fillStyle = withAlpha(theme.muted, 0.85);
            const hz = kk * p.f0;
            g.fillText(hz >= 1000 ? `${n(hz / 1000, 1)}k` : String(Math.round(hz)), cx, bottom + 19);
          }
        }
        if (big) barHits.push({ k: kk, x0: cx - bw / 2, x1: cx + bw / 2, y0: top - 6, y1: bottom + 20 });
      }
      // Achse
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(left, bottom + 0.5);
      g.lineTo(right, bottom + 0.5);
      g.stroke();
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'top';
      if (big) {
        g.textAlign = 'left';
        g.fillText('k', right - 8, bottom - 16);
        if (hzRow) g.fillText(say(L('Hz', 'Hz')), R.x + 10, bottom + 19);
      }
      // Grenze N
      const nx = left + (Math.min(p.n, kShow) + 1) * bw;
      if (p.n < kShow) {
        g.strokeStyle = withAlpha(col.S(), 0.6);
        g.lineWidth = 1.4;
        g.setLineDash([4, 3]);
        g.beginPath();
        g.moveTo(nx, top - 2);
        g.lineTo(nx, bottom);
        g.stroke();
        g.setLineDash([]);
        if (big) flabel(nx + 6, top + 8, `N = ${p.n}`, col.S(), 'left', fs(12, 11), k.labels, R);
      }
      // Wert unter dem Zeiger
      if (big && hoverBar !== null && hoverBar <= kShow) {
        const kk = hoverBar;
        const a = kk === 0 ? Math.abs(coT.mean) : Math.hypot(coT.a[kk]!, coT.b[kk]!);
        const cx = left + (kk + 0.5) * bw;
        fpill(cx, Y(a) - 18, `${kk === 0 ? '\\f{a_0}{2}' : `Â${sub(kk)}`} = ${Q(n(a, 3))}  ·  ${Math.round(kk * p.f0)} Hz`, { size: fs(12, 11), bounds: R, color: kk === 0 ? theme.text : hk(kk) });
      }
    }

    function drawPhaseSpectrum(R: Rect, k: Intro): void {
      const g = surface.g;
      const theme = th();
      panel(R, k.panel);
      const ty = R.y + 18;
      richText(say(L('Phasenspektrum', 'Phase spectrum')), R.x + 14, ty, fs(13, 12), theme.text, 'left', false, 750);
      if (R.w > 300) richText('Â · sin(kx + φ_[k])', R.x + R.w - 14, ty, fs(11.5, 11), theme.muted, 'right', false, 650);
      const kShow = Math.round(num.kShow.v);
      const left = R.x + 42;
      const right = R.x + R.w - 12;
      const top = ty + 18;
      const bottom = R.y + R.h - 22;
      if (bottom - top < 30) return;
      const bw = (right - left) / (kShow + 1);
      const cyy = (top + bottom) / 2;
      const Y = (deg: number) => cyy - (deg / 180) * ((bottom - top) / 2);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      for (const dg of [-180, -90, 90, 180]) {
        const yy = Math.round(Y(dg)) + 0.5;
        g.beginPath();
        g.moveTo(left, yy);
        g.lineTo(right, yy);
        g.stroke();
        g.fillText(`${dg < 0 ? '−' : ''}${Math.abs(dg)}°`, left - 5, yy);
      }
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(left, Math.round(cyy) + 0.5);
      g.lineTo(right, Math.round(cyy) + 0.5);
      g.stroke();
      g.fillText('0°', left - 5, cyy);
      for (let kk = 1; kk <= kShow; kk++) {
        if (!nonzero(kk)) continue;
        const c = polar(coD.a[kk]!, coD.b[kk]!);
        if (c.amp < 1e-6) continue;
        const cx = left + (kk + 0.5) * bw;
        const yy = Y((c.phase / DEG) * k.bars);
        const on = kk <= p.n;
        g.strokeStyle = withAlpha(hk(kk), on ? 0.8 : 0.3);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(cx, cyy);
        g.lineTo(cx, yy);
        g.stroke();
        if (on) dot(cx, yy, hk(kk), Math.min(5, bw * 0.3 + 1.5));
        else {
          g.fillStyle = withAlpha(hk(kk), 0.35);
          g.beginPath();
          g.arc(cx, yy, Math.min(3.5, bw * 0.25 + 1), 0, TAU);
          g.fill();
        }
      }
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText('k', right - 8, bottom + 4);
    }

    function drawEnergyChart(R: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      panel(R, k.panel);
      const ty = R.y + 18;
      richText(say(L('Energieanteil (Parseval)', 'Share of power (Parseval)')), R.x + 14, ty, fs(13, 12), theme.text, 'left', false, 750);
      const kShow = Math.round(num.kShow.v);
      const left = R.x + 42;
      const right = R.x + R.w - 12;
      const top = ty + 34;
      const bottom = R.y + R.h - 22;
      if (bottom - top < 24) return;
      const bw = (right - left) / (kShow + 1);
      const Y = (s: number) => bottom - s * (bottom - top);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      for (const s of [0.5, 1]) {
        const yy = Math.round(Y(s)) + 0.5;
        g.beginPath();
        g.moveTo(left, yy);
        g.lineTo(right, yy);
        g.stroke();
        g.fillText(`${s * 100} %`, left - 5, yy);
      }
      const P = powerOf(spec);
      const N = shownN(now);
      let cum = coT.mean * coT.mean;
      for (let kk = 0; kk <= kShow; kk++) {
        if (kk > 0) cum += (coT.a[kk]! ** 2 + coT.b[kk]! ** 2) / 2;
        const s = P > 0 ? Math.min(1, cum / P) : 1;
        const cx = left + (kk + 0.5) * bw;
        const grow = clamp01(k.bars * (kShow + 3) - kk * 0.8);
        const on = kk <= p.n;
        const color = on ? col.E() : withAlpha(theme.muted, 0.35);
        g.fillStyle = kk === N ? mixColor(col.E(), '#ffffff', 0.15) : color;
        const hh = s * grow;
        roundRect(g, cx - bw * 0.34, Y(hh), Math.max(2, bw * 0.68), bottom - Y(hh), Math.min(3, bw / 4));
        g.fill();
      }
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(left, bottom + 0.5);
      g.lineTo(right, bottom + 0.5);
      g.stroke();
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText('N', right - 10, bottom + 4);
      // Wert für das aktuelle N
      num.share.follow(shareNow(), 0.18);
      const xN = left + (Math.min(p.n, kShow) + 0.5) * bw;
      const lab = `N = ${p.n}:  ${p.info ? fmtPct(num.share.v, 2) : '?'}`;
      fpill(xN, ty + 18, lab, { color: col.E(), border: withAlpha(col.E(), 0.6), size: fs(12.5, 11.5), bounds: R, alpha: k.labels });
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    function seriesCard(R: Rect, measure: boolean, k: Intro): number {
      const g = surface.g;
      const theme = th();
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad;
      const gen = '\\c{m}{f(x) ≈ \\f{a_0}{2} + \\t{Σ} (a_k \\t{cos} kx + b_k \\t{sin} kx)}';
      const b0 = fit(gen, maxW, fs(12.5, 11.5), theme.muted, 600);
      const b1s = wrapFormula(seriesSrc(), maxW, fs(15, 13.5), theme.text, 650);
      const note = seriesNote();
      const b2 = note ? fit(note, maxW, fs(12, 11), theme.muted, 600) : null;
      const shift = p.amp !== 1 || p.ph !== 0;
      const b3 = shift ? fit(`g(x) = ${p.amp !== 1 ? n(p.amp, 1) + ' · ' : ''}f(x${p.ph !== 0 ? ` ${p.ph > 0 ? '−' : '+'} ${piText(Math.abs(p.ph) * DEG)}` : ''})`, maxW, fs(13, 12), col.S(), 700) : null;
      // Koeffizienten-Chips: erste Glieder ≠ 0
      const chips: { src: string; color: string }[] = [];
      if (Math.abs(coT.mean) > 1e-9) chips.push({ src: `\\f{a_0}{2} = ${Q(n(coT.mean, 3))}`, color: theme.text });
      for (let kk = 1; kk <= NMAX && chips.length < 4; kk++) {
        if (!nonzero(kk)) continue;
        const a = coD.a[kk]!;
        const b = coD.b[kk]!;
        const c = Math.abs(b) >= Math.abs(a) ? `b${sub(kk)} = ${Q(n(b, 3))}` : `a${sub(kk)} = ${Q(n(a, 3))}`;
        chips.push({ src: c, color: hk(kk) });
      }
      const chipH = fs(24, 22);
      // Chips in Zeilen
      const chipBoxes = chips.map((c) => ({ ...c, box: formula(g, c.src, fstyle(fs(12, 11), c.color, 700)) }));
      const rows: (typeof chipBoxes)[] = [[]];
      let rw = 0;
      for (const c of chipBoxes) {
        const w = c.box.w + 14;
        if (rw + w > maxW && rows[rows.length - 1]!.length) {
          rows.push([]);
          rw = 0;
        }
        rows[rows.length - 1]!.push(c);
        rw += w + 6;
      }
      const lines = [b0, ...b1s, b2, b3].filter((b): b is FormulaBox => !!b);
      const h = 34 + lines.reduce((s, b) => s + b.asc + b.desc + 8, 0) + rows.length * (chipH + 6) + 8;
      if (measure) return h;
      g.save();
      card({ ...R, h }, col.S());
      cardTitle(R, say(L('Fourier-Reihe', 'Fourier series')), col.S(), `N = ${p.n}`, col.S());
      let y = R.y + 32;
      for (const b of lines) {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      }
      let ci = 0;
      for (const row of rows) {
        let x = R.x + pad;
        for (const c of row) {
          const a = clamp01(k.stagger * 6 - ci);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          g.fillStyle = withAlpha(c.color === theme.text ? theme.muted : c.color, theme.dark ? 0.18 : 0.12);
          roundRect(g, x, y, c.box.w + 14, chipH, chipH / 2);
          g.fill();
          c.box.draw(g, x + 7, y + chipH / 2 + (c.box.asc - c.box.desc) / 2);
          g.restore();
          x += c.box.w + 20;
          ci++;
        }
        y += chipH + 6;
      }
      g.restore();
      return h;
    }

    function energyCard(R: Rect, measure: boolean, now: number, k: Intro): number {
      const g = surface.g;
      const theme = th();
      const pad = fs(14, 12);
      const h = fs(132, 118);
      if (measure) return h;
      card({ ...R, h }, col.E());
      cardTitle(R, say(L('Energieanteil (Parseval)', 'Share of power (Parseval)')), col.E());
      num.share.follow(shareNow(), 0.18);
      const big = fs(26, 22);
      const N = shownN(now);
      g.font = `800 ${big}px ${theme.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = col.E();
      const y1 = R.y + 34 + big / 2;
      g.fillText(p.info ? fmtPct(num.share.v * Math.min(1, k.bars * 1.2), 1) : '? %', R.x + pad, y1);
      const bw = g.measureText(p.info ? '100,0 %' : '? %').width;
      const tx = R.x + pad + bw + 10;
      const room = R.x + R.w - pad - tx;
      const f11 = fs(11.5, 11);
      const rowsL = [say(L(`in den Gliedern bis N = ${N}`, `in the terms up to N = ${N}`)), say(L('(Gleichanteil eingerechnet)', '(DC part included)'))];
      const rowsS = [say(L(`bis N = ${N}`, `up to N = ${N}`)), say(L('mit Gleichanteil', 'incl. DC part'))];
      const rowsUse = rowsL.every((r) => richWidth(r, f11, 600) <= room) ? rowsL : rowsS.every((r) => richWidth(r, f11, 600) <= room) ? rowsS : null;
      if (rowsUse) rowsUse.forEach((r, i) => richText(r, tx, y1 - 7 + i * 15, f11, theme.muted, 'left', false, 600));
      // Balken mit Anteilen der Glieder
      const bx0 = R.x + pad;
      const bx1 = R.x + R.w - pad;
      const by = y1 + big / 2 + 10;
      g.fillStyle = withAlpha(theme.muted, 0.18);
      roundRect(g, bx0, by, bx1 - bx0, 12, 6);
      g.fill();
      const P = powerOf(spec);
      g.save();
      roundRect(g, bx0, by, bx1 - bx0, 12, 6);
      g.clip();
      let x = bx0;
      const segs: [number, string][] = [[coD.mean * coD.mean, theme.muted]];
      for (let kk = 1; kk <= NMAX; kk++) if (nonzero(kk) && wA[kk]! > 0.001) segs.push([(wA[kk]! ** 2 * (coD.a[kk]! ** 2 + coD.b[kk]! ** 2)) / 2, hk(kk)]);
      for (const [e, c] of segs) {
        const ww = P > 0 ? ((bx1 - bx0) * e * Math.min(1, k.bars * 1.2)) / P : 0;
        if (ww <= 0) continue;
        g.fillStyle = c;
        g.fillRect(x, by, ww, 12);
        g.fillStyle = withAlpha('#ffffff', 0.55);
        g.fillRect(x + ww - 1, by, 1, 12);
        x += ww;
      }
      g.restore();
      const fb = fit(`P = (\\f{a_0}{2})² + \\f{1}{2} \\t{Σ} (a_k² + b_k²) = ${Q(n(P, 4))}`, R.w - 2 * pad, fs(12, 11), theme.muted, 600);
      fb.draw(g, R.x + pad, by + 22 + fb.asc);
      return h;
    }

    function miniSpecCard(R: Rect, measure: boolean, now: number, k: Intro): number {
      const h = clamp(R.h, 120, 200);
      if (measure) return h;
      drawAmpSpectrum({ ...R, h }, now, k, false);
      return h;
    }

    function featureCard(R: Rect, measure: boolean, k: Intro): number {
      const g = surface.g;
      const theme = th();
      const pad = fs(14, 12);
      const fe = features(spec, 24);
      const rows: { src: string; color: string }[] = [];
      if (fe.odd) rows.push({ src: say(L('ungerade Funktion → nur Sinusglieder (a_k = 0)', 'odd function → sine terms only (a_k = 0)')), color: col.S() });
      else if (fe.even) rows.push({ src: say(L('gerade Funktion → nur Kosinusglieder (b_k = 0)', 'even function → cosine terms only (b_k = 0)')), color: col.S() });
      else rows.push({ src: say(L('weder gerade noch ungerade → sin- und cos-Glieder', 'neither even nor odd → sine and cosine terms')), color: theme.muted });
      if (fe.halfWave) rows.push({ src: say(L('g(x + π) = −g(x) → nur ungerade k', 'g(x + π) = −g(x) → odd k only')), color: th().series[3]! });
      else if (fe.evenOnly) rows.push({ src: say(L('Periode π → nur gerade k (doppelte Frequenz)', 'period π → even k only (double frequency)')), color: th().series[3]! });
      if (Math.abs(coT.mean) > 1e-9) rows.push({ src: `${say(L('Gleichanteil', 'DC part'))} \\f{a_0}{2} = ${Q(n(coT.mean, 3))}`, color: theme.text });
      if (fe.decay === 1) rows.push({ src: say(L('Sprünge → Â_k ∼ \\f{1}{k}, Gibbs ≈ 9 %', 'jumps → Â_k ∼ \\f{1}{k}, Gibbs ≈ 9 %')), color: col.x() });
      else if (fe.decay === 2) rows.push({ src: say(L('nur Knicke → Â_k ∼ \\f{1}{k²}, schnelle Konvergenz', 'kinks only → Â_k ∼ \\f{1}{k²}, fast convergence')), color: th().series[2]! });
      // endlich viele Glieder: exakt ab der höchsten Ordnung mit cₖ ≠ 0
      else if (fe.top === 0) rows.push({ src: say(L('alle cₖ = 0 → S_N = 0 für jedes N', 'all cₖ = 0 → S_N = 0 for every N')), color: th().series[2]! });
      else rows.push({ src: say(L(`endlich viele Glieder → exakt ab N = ${fe.top}`, `finitely many terms → exact from N = ${fe.top}`)), color: th().series[2]! });
      // Zeilen, die nicht passen, am Pfeil umbrechen
      const maxW = R.w - 2 * pad - 16;
      const fsz = fs(12.5, 11.5);
      const boxes: FormulaBox[][] = rows.map((r) => {
        const whole = formula(g, r.src, fstyle(fsz, theme.text, 600));
        if (whole.w <= maxW || !r.src.includes(' → ')) return [whole.w <= maxW ? whole : fit(r.src, maxW, fsz, theme.text, 600)];
        const [a, b] = r.src.split(' → ');
        let second = fit(`→ ${b}`, maxW - 8, fsz, theme.muted, 600);
        // sehr schmale Karte (Handy): Klammerzusatz wie „(a_k = 0)“ weglassen statt abschneiden
        if (second.w > maxW - 8 && b!.includes(' (')) second = fit(`→ ${b!.slice(0, b!.indexOf(' ('))}`, maxW - 8, fsz, theme.muted, 600);
        return [fit(a!, maxW, fsz, theme.text, 600), second];
      });
      const lineH = (b: FormulaBox) => Math.max(b.asc + b.desc, 14);
      const h = 34 + boxes.reduce((s, bs) => s + bs.reduce((t, b) => t + lineH(b) + 2, 0) + 6, 0) + 4;
      if (measure) return h;
      card({ ...R, h });
      cardTitle(R, say(L('Merkmale', 'Features')), th().series[4]!);
      let y = R.y + 32;
      boxes.forEach((bs, i) => {
        const a = clamp01(k.stagger * (rows.length + 1) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        g.fillStyle = rows[i]!.color;
        const bh0 = lineH(bs[0]!);
        roundRect(g, R.x + pad, y + bh0 / 2 - 4, 8, 8, 2.5);
        g.fill();
        bs.forEach((b, j) => {
          const bh = lineH(b);
          b.draw(g, R.x + pad + 16 + (j ? 8 : 0) + (1 - ease.outCubic(a)) * 8, y + bh / 2 + (b.asc - b.desc) / 2);
          y += bh + 2;
        });
        g.restore();
        y += 6;
      });
      return h;
    }

    function phasorCard(R: Rect, measure: boolean, k: Intro): number {
      const g = surface.g;
      const theme = th();
      const pad = fs(14, 12);
      const ks: number[] = [];
      for (let kk = 1; kk <= p.n && ks.length < 7; kk++) if (nonzero(kk)) ks.push(kk);
      const rowH = fs(22, 20);
      const avail = Math.max(1, Math.floor((R.h - 62) / rowH));
      const list = ks.slice(0, Math.max(1, avail));
      const h = 58 + list.length * rowH + 6;
      if (measure) return Math.min(h, 58 + 7 * rowH + 6);
      card({ ...R, h });
      cardTitle(R, say(L('Zeiger', 'Phasors')), col.x(), 'Â · sin(kx + φ)');
      const cols = [R.x + pad + 26, R.x + pad + 26 + (R.w - 2 * pad - 26) * 0.42, R.x + R.w - pad];
      const hy = R.y + 42;
      g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      g.fillText('k', R.x + pad, hy);
      g.textAlign = 'right';
      g.fillText(say(L('Länge Â', 'length Â')), cols[1]!, hy);
      g.fillText(say(L('Startwinkel φ', 'start angle φ')), cols[2]!, hy);
      list.forEach((kk, i) => {
        const y = hy + 18 + i * rowH;
        const a = clamp01(k.stagger * (list.length + 1) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        const c = polar(coD.a[kk]!, coD.b[kk]!);
        // kleiner rotierender Zeiger
        const rr = 7;
        const cx = R.x + pad + 6;
        g.strokeStyle = withAlpha(hk(kk), 0.5);
        g.lineWidth = 1;
        g.beginPath();
        g.arc(cx, y, rr, 0, TAU);
        g.stroke();
        const ang = kk * xt + c.phase;
        arrowPx(cx, y, cx + rr * Math.cos(ang), y - rr * Math.sin(ang), hk(kk), 1.6, 4);
        g.font = `700 ${fs(12, 11.5)}px ${theme.font}`;
        g.fillStyle = hk(kk);
        g.textAlign = 'left';
        g.fillText(String(kk), R.x + pad + 18, y);
        g.textAlign = 'right';
        g.fillStyle = theme.text;
        g.font = `600 ${fs(12, 11.5)}px ${theme.font}`;
        g.fillText(Q(n(c.amp * wA[kk]!, 3)), cols[1]!, y);
        g.fillText(p.info ? `${n(c.phase / DEG, 0)}°` : '?', cols[2]!, y);
        g.restore();
      });
      return h;
    }

    function signalCard(R: Rect, measure: boolean, now: number, k: Intro): number {
      const g = surface.g;
      const theme = th();
      const h = clamp(R.h, 120, 190);
      if (measure) return h;
      card({ ...R, h });
      const N = shownN(now);
      cardTitle(R, say(L('Signal', 'Signal')), col.S(), `S_[${N}] · f`, col.S());
      const A: Rect = { x: R.x + 12, y: R.y + 34, w: R.w - 24, h: h - 44 };
      const yr = Math.max(num.yHi.v, -num.yLo.v) * 0.9;
      const X = (x: number) => A.x + ((x + TAU) / (2 * TAU)) * A.w;
      const Y = (y: number) => A.y + A.h / 2 - (y / yr) * (A.h / 2);
      g.strokeStyle = withAlpha(theme.axis, 0.4);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(A.x, Math.round(Y(0)) + 0.5);
      g.lineTo(A.x + A.w, Math.round(Y(0)) + 0.5);
      g.stroke();
      const cnt = Math.round(clamp(A.w * 1.2, 160, 500));
      if (p.tgt) strokePts(sample(T, -TAU, TAU, X, Y, cnt), withAlpha(col.f(), 0.8), 1.6, { dash: [5, 4] });
      strokePts(sample(S, -TAU, TAU * (2 * k.reveal - 1), X, Y, cnt), col.S(), 2.6, { glow: true });
      return h;
    }

    type CardFn = (R: Rect, measure: boolean) => number;
    function drawColumn(C: Rect, now: number, k: Intro): void {
      const v = view();
      const list: CardFn[] = [(R, m) => seriesCard(R, m, k)];
      if (v === 'sum') {
        if (p.spec) list.push((R, m) => miniSpecCard(R, m, now, k));
        list.push((R, m) => energyCard(R, m, now, k));
        list.push((R, m) => featureCard(R, m, k));
      } else if (v === 'epi') {
        list.push((R, m) => phasorCard(R, m, k));
        list.push((R, m) => energyCard(R, m, now, k));
      } else if (v === 'stack') {
        list.push((R, m) => miniSpecCard(R, m, now, k));
        list.push((R, m) => featureCard(R, m, k));
        list.push((R, m) => energyCard(R, m, now, k));
      } else {
        list.push((R, m) => signalCard(R, m, now, k));
        list.push((R, m) => featureCard(R, m, k));
      }
      const gap = fs(10, 8);
      const g = surface.g;
      // Zweispaltig auf dem Handy, wenn Platz
      const two = !regions().wide && C.w >= 340;
      if (two) {
        const cw = (C.w - gap) / 2;
        let yL = C.y;
        let yR = C.y;
        list.forEach((fn, i) => {
          const leftCol = i === 0 ? true : yL <= yR;
          const x = i === 0 ? C.x : leftCol ? C.x : C.x + cw + gap;
          const w = i === 0 ? C.w : cw;
          const y = i === 0 ? yL : leftCol ? yL : yR;
          const avail = C.y + C.h - y;
          const hh = fn({ x, y, w, h: avail }, true);
          if (hh > avail + 1) return;
          g.save();
          slideIn(k, i);
          fn({ x, y, w, h: Math.min(hh, avail) }, false);
          g.restore();
          if (i === 0) {
            yL += hh + gap;
            yR = yL;
          } else if (leftCol) yL += hh + gap;
          else yR += hh + gap;
        });
        return;
      }
      let y = C.y;
      list.forEach((fn, i) => {
        const avail = C.y + C.h - y;
        const hh = fn({ x: C.x, y, w: C.w, h: avail }, true);
        if (hh > avail + 1) return;
        g.save();
        slideIn(k, i);
        fn({ x: C.x, y, w: C.w, h: Math.min(hh, avail) }, false);
        g.restore();
        y += hh + gap;
      });
    }

    function slideIn(k: Intro, i: number): void {
      const a = clamp01(k.cards * 1.6 - i * 0.25);
      const g = surface.g;
      g.globalAlpha *= ease.outCubic(a);
      g.translate((1 - ease.outCubic(a)) * 18, 0);
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const v = (s: string) => `<var>${s}</var>`;
      const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
      const s = sig();
      const html: Record<SigKey, string> = {
        sq: `${v('f')}(${v('x')}) = ${frac('4', 'π')}(sin ${v('x')} + ${frac('1', '3')} sin 3${v('x')} + ${frac('1', '5')} sin 5${v('x')} + …)`,
        saw: `${v('f')}(${v('x')}) = ${frac('2', 'π')}(sin ${v('x')} − ${frac('1', '2')} sin 2${v('x')} + ${frac('1', '3')} sin 3${v('x')} − …)`,
        tri: `${v('f')}(${v('x')}) = ${frac('8', 'π²')}(cos ${v('x')} + ${frac('1', '9')} cos 3${v('x')} + ${frac('1', '25')} cos 5${v('x')} + …)`,
        trap: `${v('f')}(${v('x')}) = ${frac('4', 'π')} Σ ${frac(`sin(${v('k')}${v('α')})`, `${v('k')}${v('α')}`)} · ${frac(`sin ${v('k')}${v('x')}`, v('k'))} (${v('k')} ${say(L('ungerade', 'odd'))}, ${v('α')} = ${n((p.w / 100) * (PI / 2), 3)})`,
        pulse: `${v('f')}(${v('x')}) = ${v('d')} + Σ ${frac(`2 sin(π${v('k')}${v('d')})`, `π${v('k')}`)} cos ${v('k')}${v('x')} (${v('d')} = ${n(p.d / 100, 2)})`,
        half: `${v('f')}(${v('x')}) = ${frac('1', 'π')} + ${frac('1', '2')} sin ${v('x')} − ${frac('2', 'π')}(${frac('1', '3')} cos 2${v('x')} + ${frac('1', '15')} cos 4${v('x')} + …)`,
        full: `${v('f')}(${v('x')}) = ${frac('2', 'π')} − ${frac('4', 'π')}(${frac('1', '3')} cos 2${v('x')} + ${frac('1', '15')} cos 4${v('x')} + ${frac('1', '35')} cos 6${v('x')} + …)`,
        own: `${v('f')}(${v('x')}) = ${own()
          .map((c, i) => {
            if (Math.abs(c) < 1e-9) return '';
            // Koeffizient 1 nicht hinschreiben: „sin x“ statt „1 sin x“
            const mag = n(Math.abs(c), 2);
            return `${c < 0 ? '− ' : '+ '}${mag === '1' ? '' : mag + ' '}sin ${i === 0 ? '' : i + 1}${v('x')}`;
          })
          .filter(Boolean)
          .join(' ')
          .replace(/^\+ /, '') || '0'}`,
      };
      let main = html[s];
      if (p.amp !== 1 || p.ph !== 0) main += `<br>${v('g')}(${v('x')}) = ${p.amp !== 1 ? n(p.amp, 1) + ' · ' : ''}${v('f')}(${v('x')}${p.ph !== 0 ? ` ${p.ph > 0 ? '−' : '+'} ${piText(Math.abs(p.ph) * DEG)}` : ''})`;
      ctx.readout('series', { html: main });
      // Koeffiziententabelle
      const rows: string[] = [];
      if (Math.abs(coT.mean) > 1e-9) rows.push(`<tr><td>0</td><td>${n(2 * coT.mean, 4)}</td><td>–</td><td>${n(Math.abs(coT.mean), 4)}</td><td>–</td></tr>`);
      for (let kk = 1; kk <= Math.min(p.n, NMAX) && rows.length < 10; kk++) {
        if (!nonzero(kk)) continue;
        const c = polar(coT.a[kk]!, coT.b[kk]!);
        rows.push(`<tr${kk === p.n ? ' class="is-current"' : ''}><td>${kk}</td><td>${n(coT.a[kk]!, 4)}</td><td>${n(coT.b[kk]!, 4)}</td><td>${n(c.amp, 4)}</td><td>${n(c.phase / DEG, 1)}°</td></tr>`);
      }
      ctx.readout('coef', {
        html: `<table class="mini-table"><tr><th>${v('k')}</th><th>${v('a')}<sub>${v('k')}</sub></th><th>${v('b')}<sub>${v('k')}</sub></th><th>Â<sub>${v('k')}</sub></th><th>${v('φ')}<sub>${v('k')}</sub></th></tr>${rows.join('')}</table>`,
      });
      // Prüfstelle
      const w = Array.from({ length: NMAX + 1 }, (_, kk) => (kk === 0 ? 1 : wTarget(kk)));
      const sx = evalSeries(coT, NMAX, p.x, w);
      const fx = targetOf(spec, p.x);
      const exact = Math.abs(fx - Math.round(fx * 1e4) / 1e4) < 1e-12;
      ctx.readout('val', { html: `${v('S')}<sub>${p.n}</sub>(${n(p.x, 2)}) ≈ <strong>${n(sx, 4)}</strong>, ${v('f')}(${n(p.x, 2)}) ${exact ? '=' : '≈'} ${n(fx, 4)} · ${say(L('Abweichung', 'deviation'))} ${n(Math.abs(sx - fx), 4)}` });
      // Energie
      const P = powerOf(spec);
      const share = shareOf(coT, P, NMAX, w);
      ctx.readout('energy', {
        html: `${v('P')} = (${frac(`${v('a')}<sub>0</sub>`, '2')})² + ${frac('1', '2')} Σ (${v('a')}<sub>${v('k')}</sub>² + ${v('b')}<sub>${v('k')}</sub>²) = ${n(P, 4)} · ${say(L(`in den Gliedern bis ${v('N')} = ${p.n}`, `in the terms up to ${v('N')} = ${p.n}`))}: <strong>${n(share * 100, 2)} %</strong>${smooth() !== 'none' ? say(L(' (mit Glättung)', ' (with smoothing)')) : ''}`,
      });
      // Gibbs
      const J = jumpHeight(s) * p.amp;
      const m = maxOfSeries(coT, NMAX, w, 1200);
      gibbsExact = m.y;
      const top = targetRange(spec).hi;
      if (J > 0) {
        const pct = ((m.y - top) / J) * 100;
        ctx.readout('gibbs', { html: `max ${v('S')}<sub>${p.n}</sub> ≈ <strong>${n(m.y, 3)}</strong> ${say(L('statt', 'instead of'))} ${n(top, 3)} → ${pct > 0.05 ? `${say(L('Überschwingen', 'overshoot'))} ${n(pct, 2)} % ${say(L('der Sprunghöhe', 'of the jump'))} ${n(J, 2)}` : say(L('kein Überschwingen', 'no overshoot'))}` });
      } else ctx.readout('gibbs', { html: `max ${v('S')}<sub>${p.n}</sub> ≈ ${n(m.y, 3)} – ${say(L('kein Sprung, also kein Gibbs-Phänomen', 'no jump, so no Gibbs phenomenon'))}` });
      // Frequenzen
      const fl: string[] = [];
      for (let kk = 1; kk <= p.n && fl.length < 5; kk++) if (nonzero(kk)) fl.push(`${Math.round(kk * p.f0)} Hz`);
      ctx.readout('freq', { html: `${v('f')}<sub>0</sub> = ${p.f0} Hz, ${v('T')} = ${frac('1', `${v('f')}<sub>0</sub>`)} = ${n(1000 / p.f0, 3)} ms · ${say(L('Teilschwingungen bei', 'harmonics at'))} ${fl.join(', ')}${fl.length >= 5 ? ' …' : ''}` });
      updateNow();
      ctx.setAction('add', { enabled: editable() && p.n < NMAX });
      ctx.setAction('rem', { enabled: editable() && p.n > 1 });
      ctx.setAction('go', { label: say(ctx.clock.playing ? L('Zeiger anhalten', 'Stop the phasors') : L('Zeiger starten', 'Start the phasors')) });
    }

    function updateNow(): void {
      if (view() !== 'epi' && !ctx.clock.playing) {
        ctx.readout('now', null);
        return;
      }
      const xw = ((xt % TAU) + TAU) % TAU;
      const t = (xw / TAU) * (1000 / p.f0);
      ctx.readout('now', { html: `<var>x</var> = <var>ω</var><var>t</var> = ${n(xw, 2)} (${n(t, 3)} ms) · <var>S</var><sub>${p.n}</sub> = ${n(S(xt), 3)}` });
    }

    /* ---------- Klang (Web Audio, nur nach Klick) ---------- */
    interface Rig {
      ac: AudioContext;
      master: GainNode;
      osc: OscillatorNode;
    }
    let rig: Rig | null = null;
    let lastWave = 0;
    function waveOf(ac: AudioContext): PeriodicWave {
      const K = NMAX + 1;
      const real = new Float32Array(K);
      const imag = new Float32Array(K);
      for (let kk = 1; kk <= NMAX; kk++) {
        // nur hörbare Glieder (unter 12 kHz)
        if (kk * p.f0 > 12000) break;
        real[kk] = wA[kk]! * coD.a[kk]!;
        imag[kk] = wA[kk]! * coD.b[kk]!;
      }
      if (real.every((x) => x === 0) && imag.every((x) => x === 0)) imag[1] = 1e-4;
      return ac.createPeriodicWave(real, imag);
    }
    function startAudio(): void {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const AC = w.AudioContext ?? w.webkitAudioContext;
      if (!AC) return;
      const ac = new AC();
      const master = ac.createGain();
      master.gain.value = 0;
      master.gain.setTargetAtTime(0.07, ac.currentTime, 0.06);
      master.connect(ac.destination);
      const osc = ac.createOscillator();
      osc.setPeriodicWave(waveOf(ac));
      osc.frequency.value = clamp(p.f0, 20, 2000);
      osc.connect(master);
      osc.start();
      rig = { ac, master, osc };
      void ac.resume();
    }
    function stopAudio(): void {
      if (!rig) return;
      const r = rig;
      rig = null;
      r.master.gain.setTargetAtTime(0, r.ac.currentTime, 0.04);
      window.setTimeout(() => void r.ac.close(), 300);
    }
    function updateAudio(force = false): void {
      ctx.setAction('snd', { label: say(rig ? L('Klang aus', 'Sound off') : L('Klang anhören', 'Play sound')) });
      if (!rig) return;
      const now = performance.now();
      if (!force && now - lastWave < 70) return;
      lastWave = now;
      rig.osc.setPeriodicWave(waveOf(rig.ac));
      rig.osc.frequency.setTargetAtTime(clamp(p.f0, 20, 2000), rig.ac.currentTime, 0.03);
    }

    /* ---------- Bedienung: Ziehen im Stapel, Antippen im Spektrum ---------- */
    let dragStack = false;
    let hoverStack = false;
    function hitStack(px: number, py: number): boolean {
      if (!editable() || view() !== 'stack' || !stackGeo) return false;
      const s = stackGeo;
      return px >= s.x0 - 10 && px <= s.x1 + 10 && py >= s.y0 - 16 && py <= s.y1;
    }
    function stackTo(px: number): void {
      if (!stackGeo) return;
      const s = stackGeo;
      const x = X0 + ((px - s.x0) / (s.x1 - s.x0)) * (X1 - X0);
      lastDrag = performance.now();
      ctx.set({ x: Math.round(clamp(x, -6, 6) * 20) / 20 });
    }
    function hitBar(px: number, py: number): number | null {
      if (view() !== 'spec') return null;
      for (const h of barHits) if (px >= h.x0 && px <= h.x1 && py >= h.y0 && py <= h.y1) return h.k;
      return null;
    }
    surface.addTarget({
      contains: (px: number, py: number) => hitStack(px, py) || hitBar(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        if (hitStack(q.px, q.py)) {
          dragStack = true;
          surface.setCursor('grabbing');
          stackTo(q.px);
          return true;
        }
        const kk = hitBar(q.px, q.py);
        if (kk !== null) {
          if (editable() && kk >= 1) {
            const old = p.n;
            ctx.set({ n: kk });
            if (kk > old) fresh = { k: kk, t0: performance.now(), sign: 1 };
          }
          return true;
        }
        return false;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (dragStack) stackTo(q.px);
      },
      pointerUp: () => {
        dragStack = false;
        surface.setCursor(hoverStack ? 'grab' : hoverBar !== null ? 'pointer' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const hs = q ? hitStack(q.px, q.py) : false;
        const hb = q ? hitBar(q.px, q.py) : null;
        if (hs !== hoverStack || hb !== hoverBar) {
          hoverStack = hs;
          hoverBar = hb;
          ctx.requestRender();
        }
        surface.setCursor(hs ? 'grab' : hb !== null && editable() ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      reveal: number;
      curve: number;
      labels: number;
      cards: number;
      stagger: number;
      bars: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, curve: 1, labels: 1, cards: 1, stagger: 1, bars: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 2600) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 100) / 1100)),
        curve: ease.outCubic(clamp01((t - 350) / 500)),
        labels: ease.outCubic(clamp01((t - 900) / 600)),
        cards: clamp01((t - 200) / 900),
        stagger: clamp01((t - 700) / 1400),
        bars: ease.outCubic(clamp01((t - 300) / 1500)),
      };
    }

    function startIntro(now: number): void {
      if (reduced()) {
        intro = null;
        retargetWeights(now, 'jump');
        return;
      }
      intro = now;
      retargetWeights(now, 'intro');
      num.share.jump(0);
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      // Übergänge fortschreiben
      if (stepMorph(now)) anim = true;
      if (tgtMorph) {
        const t = (now - tgtMorph.t0) / tgtMorph.dur;
        if (t >= 1) {
          tgtMorph = null;
          tgtK = 1;
        } else {
          tgtK = ease.inOutCubic(clamp01(t));
          anim = true;
        }
      }
      if (story && now - story.t0 > story.end) story = null;
      if (story) anim = true;
      for (let kk = 1; kk <= NMAX; kk++) {
        if (wC[kk]!.step(now, dt)) anim = true;
        wA[kk] = wC[kk]!.v;
      }
      const kShowGoal = Math.min(NMAX, Math.max(12, p.n + 3));
      if (num.kShow.goal !== kShowGoal) num.kShow.follow(kShowGoal, 0.2);
      for (const c of Object.values(num)) if (c.step(now, dt)) anim = true;
      if (fresh && now - fresh.t0 < 1700) anim = true;
      const k = introState(now);
      if (intro !== null) anim = true;
      // Ansicht wechseln: alte ausblenden, neue einblenden
      let fadeIn = 1;
      if (viewFade) {
        const t = (now - viewFade.t0) / 560;
        if (t >= 1) viewFade = null;
        else {
          fadeIn = ease.outCubic(clamp01(t));
          anim = true;
        }
      }
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      plotH.resize();
      const drawView = (v: View) => {
        if (v === 'sum') drawSum(R.main, now, k);
        else if (v === 'epi') drawEpi(R.main, now, k);
        else if (v === 'stack') drawStack(R.main, now, k);
        else drawSpecView(R.main, now, k);
      };
      if (viewFade && fadeIn < 1 && viewFade.from !== view()) {
        g.save();
        g.globalAlpha = 1 - fadeIn;
        g.translate(0, -fadeIn * 10);
        drawView(viewFade.from);
        g.restore();
      }
      g.save();
      g.globalAlpha = fadeIn;
      g.translate(0, (1 - fadeIn) * 14);
      drawView(view());
      g.restore();
      drawColumn(R.col, now, k);
      if (rig && anim) updateAudio();
      if (anim || ctx.clock.playing || dragStack) ctx.requestRender();
    }

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => {
      ctx.setAction('go', { label: say(ctx.clock.playing ? L('Zeiger anhalten', 'Stop the phasors') : L('Zeiger starten', 'Start the phasors')) });
      updateNow();
      ctx.requestRender();
    });

    function startView(now: number, from: View | null): void {
      if (from && from !== view() && !reduced()) viewFade = { t0: now, from };
      if (view() === 'epi' && !reduced() && !ctx.locked) ctx.clock.play();
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const shapeKeys = ['sig', 'amp', 'ph', 'd', 'w', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
        const sigChanged = shapeKeys.some((key) => changed.has(key));
        if (source === 'init') {
          retargetSignal(now, true);
          num.kShow.jump(Math.min(NMAX, Math.max(12, p.n + 3)));
          startIntro(now);
          startView(now, null);
        } else if (source === 'replace') {
          // Beispiel oder Link: alles weich überblenden, Glieder fliegen neu ein
          const prev = prevView;
          story = null;
          retargetSignal(now, false, 800);
          if (reduced()) retargetWeights(now, 'jump');
          else {
            let i = 0;
            let count = 0;
            for (let kk = 1; kk <= p.n; kk++) if (nonzero(kk)) count++;
            const stepMs = Math.min(110, 1300 / Math.max(1, count));
            for (let kk = 1; kk <= NMAX; kk++) {
              const goal = wTarget(kk);
              if (goal > 0 && nonzero(kk)) {
                wC[kk]!.glide(goal, 560, 200 + i++ * stepMs, now, ease.outCubic);
              } else wC[kk]!.glide(goal, 420, 0, now);
            }
          }
          startView(now, changed.has('view') ? prev : null);
          if (view() !== 'epi' && ctx.clock.playing) ctx.clock.pause();
        } else {
          if (sigChanged) {
            const fast = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'amp', 'ph', 'd', 'w'].some((key) => changed.has(key));
            retargetSignal(now, false, fast ? (dragging() ? 260 : 520) : 800);
          }
          if (changed.has('n') || changed.has('sm') || sigChanged) {
            if (suppress && source === 'sim') suppress = false;
            else {
              if (source === 'input') cancelStory();
              if (!story) retargetWeights(now, 'glide', prevN);
            }
          }
          if (changed.has('view')) startView(now, prevView);
          if (changed.has('n') && source === 'input' && p.n > prevN) fresh = { k: p.n, t0: now, sign: 1 };
        }
        prevN = p.n;
        prevView = view();
        updateReadouts();
        updateAudio(true);
        ctx.requestRender();
      },

      action(id) {
        if (id === 'snd') {
          if (rig) stopAudio();
          else startAudio();
          updateAudio(true);
          return;
        }
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'go') {
          ctx.clock.toggle();
          return;
        }
        if (id === 'add' || id === 'rem') {
          cancelStory();
          const next = clamp(p.n + (id === 'add' ? 1 : -1), 1, NMAX);
          if (next === p.n) return;
          // bei „hinzufügen“ bis zum nächsten Glied ≠ 0 springen
          let target = next;
          if (id === 'add') while (target < NMAX && !nonzero(target)) target++;
          else while (target > 1 && !nonzero(target)) target--;
          ctx.set({ n: target });
          if (id === 'add') fresh = { k: target, t0: now, sign: 1 };
        } else if (id === 'run') {
          const Nr = sig() === 'own' ? 8 : Math.max(RUN_N, Math.min(p.n, NMAX));
          const ks: number[] = [];
          for (let kk = 1; kk <= Nr; kk++) if (nonzero(kk)) ks.push(kk);
          if (!ks.length) return;
          if (reduced()) {
            ctx.set({ n: Nr });
            return;
          }
          const step = clamp(7000 / ks.length, 280, 800);
          story = { t0: now, ks, step, end: 300 + ks.length * step + 600 };
          for (let kk = 1; kk <= NMAX; kk++) wC[kk]!.jump(0);
          ks.forEach((kk, i) => wC[kk]!.glide(sigma(smooth(), kk, Nr), Math.min(step * 0.85, 560), 300 + i * step, now, ease.outCubic));
          suppress = p.n !== Nr;
          ctx.set({ n: Nr });
          num.share.jump(0);
        }
        ctx.requestRender();
      },

      tick(dt) {
        const f = view() === 'epi' ? (p.slow ? 0.25 : 1) : 1;
        xt += (dt * TAU * f) / VIS_PERIOD;
        if (xt > 1e6) xt = wrap(xt);
        updateNow();
      },

      resetTime() {
        xt = 0.9;
        updateNow();
      },

      render,
      destroy: () => {
        offClock();
        stopAudio();
        surface.destroy();
      },
    };
  },
});
