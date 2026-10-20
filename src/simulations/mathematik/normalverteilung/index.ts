import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, seededRandom, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  binomCdf,
  binomMoments,
  binomPmf,
  cdf,
  inflectionTangents,
  laplaceMinN,
  laplaceOk,
  maxSigmaFor,
  morphStandard,
  normalApproxCdf,
  normalSample,
  pdf,
  pdfMax,
  prob,
  probOfBound,
  quantile,
  sampleStats,
  sigmaRule,
  tolerance,
  zScore,
  type QuantKind,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Sit = 'abs' | 'iq' | 'fill';
type Typ = 'between' | 'le' | 'ge' | 'eq';
type Mode = 'area' | 'quant' | 'cmp' | 'binom' | 'sample';
type Vals = Record<string, unknown>;
const isMode =
  (...m: Mode[]) =>
  (v: Vals) =>
    m.includes(v.mode as Mode);

/** Halbe Breite des z-Bereichs in der standardisierten Ansicht. */
const Z_HALF = 4.2;
/** Dauer der Suche „Grenze suchen“ (ms). */
const FIND_MS = 1700;
/** Dauer des Fallens eines Stichprobenwerts (ms). */
const FALL_MS = 650;

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
    this.tw = null;
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
    if (Math.abs(this.goal - this.v) <= 1e-6 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/**
 * Normalverteilung in fünf Ansichten:
 * – „Fläche“: Glockenkurve mit ziehbaren Grenzen, Wahrscheinlichkeit als Fläche (die Zahl zählt mit),
 *   darunter Φ mit der Differenz Φ(b) − Φ(a); Sigma-Regeln per Knopf, Sonderfall P(X = a) = 0,
 *   „Standardisieren“ als Animation (x-Achse wird zur z-Achse, die Fläche bleibt gleich) und
 *   Eigenschaften der Glocke (Hochpunkt, Wendestellen mit Wendetangenten, Gesamtfläche 1).
 * – „Umkehrung“: Wahrscheinlichkeit vorgegeben, Grenze gesucht – die Fläche wird gezogen,
 *   die z-Tabelle rückwärts gelesen (z. B. „Welcher IQ wird nur von 5 % übertroffen?“).
 * – „Vergleich“: zwei Abfüllanlagen mit verschiedenem μ und σ und eine Toleranz.
 * – „Binomialverteilung nähern“: Histogramm von B(n; p) mit Glockenkurve, Stetigkeitskorrektur,
 *   Laplace-Bedingung σ > 3 und größter Näherungsfehler für alle n.
 * – „Stichprobe“: Zufallswerte fallen ins Histogramm, das sich der Dichtekurve nähert.
 */
export default defineSimulation({
  id: 'normalverteilung',
  dragHint: true,
  layout: { aspect: 1.58, aspectNarrow: 0.44 },
  groups: [
    { id: 'dist', label: L('Verteilung', 'Distribution') },
    { id: 'int', label: L('Ereignis', 'Event') },
    { id: 'cmp', label: L('Zwei Anlagen', 'Two machines') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'area', label: L('Fläche', 'Area') },
        { value: 'quant', label: L('Umkehrung: Grenze gesucht', 'Inverse: find the bound') },
        { value: 'cmp', label: L('Zwei Verteilungen vergleichen', 'Compare two distributions') },
        { value: 'binom', label: L('Binomialverteilung nähern', 'Approximating the binomial') },
        { value: 'sample', label: L('Stichprobe', 'Sample') },
      ],
      default: 'area',
    },
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'abs', label: L('allgemein (μ, σ wählbar)', 'general (choose μ, σ)') },
        { value: 'iq', label: L('Intelligenzquotient (μ = 100, σ = 15)', 'IQ (μ = 100, σ = 15)') },
        { value: 'fill', label: L('Abfüllmenge (μ = 500 ml, σ = 4 ml)', 'Filling volume (μ = 500 ml, σ = 4 ml)') },
      ],
      default: 'abs',
      visibleIf: isMode('area', 'quant', 'sample'),
    },
    { key: 'mu', type: 'number', group: 'dist', label: L('Erwartungswert μ', 'Mean μ'), min: -3, max: 3, step: 0.1, default: 0, visibleIf: (v) => v.sit === 'abs' && isMode('area', 'quant', 'sample')(v) },
    {
      key: 'sg',
      type: 'number',
      group: 'dist',
      label: L('Standardabweichung σ', 'Standard deviation σ'),
      help: L('Kleines σ: schmale, hohe Glocke – die Fläche bleibt 1.', 'Small σ: narrow, tall bell – the area stays 1.'),
      min: 0.2,
      max: 2.5,
      step: 0.1,
      default: 1,
      visibleIf: (v) => v.sit === 'abs' && isMode('area', 'quant', 'sample')(v),
    },
    {
      key: 'typ',
      type: 'choice',
      group: 'int',
      label: L('Art', 'Type'),
      options: [
        { value: 'between', label: L('a ≤ X ≤ b', 'a ≤ X ≤ b') },
        { value: 'le', label: L('X ≤ b', 'X ≤ b') },
        { value: 'ge', label: L('X ≥ a', 'X ≥ a') },
        { value: 'eq', label: L('X = a', 'X = a') },
      ],
      default: 'between',
      visibleIf: isMode('area'),
    },
    { key: 'a', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: -6, max: 6, step: 0.1, default: -1, visibleIf: (v) => v.mode === 'area' && v.sit === 'abs' && v.typ !== 'le' },
    { key: 'b', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: -6, max: 6, step: 0.1, default: 1, visibleIf: (v) => v.mode === 'area' && v.sit === 'abs' && v.typ !== 'ge' && v.typ !== 'eq' },
    { key: 'ia', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: 40, max: 160, step: 1, default: 85, visibleIf: (v) => v.mode === 'area' && v.sit === 'iq' && v.typ !== 'le' },
    { key: 'ib', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: 40, max: 160, step: 1, default: 115, visibleIf: (v) => v.mode === 'area' && v.sit === 'iq' && v.typ !== 'ge' && v.typ !== 'eq' },
    { key: 'fa', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: 484, max: 516, step: 0.5, default: 496, unit: 'ml', visibleIf: (v) => v.mode === 'area' && v.sit === 'fill' && v.typ !== 'le' },
    { key: 'fb', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: 484, max: 516, step: 0.5, default: 504, unit: 'ml', visibleIf: (v) => v.mode === 'area' && v.sit === 'fill' && v.typ !== 'ge' && v.typ !== 'eq' },
    {
      key: 'qt',
      type: 'choice',
      group: 'int',
      label: L('Gesucht', 'Find'),
      options: [
        { value: 'le', label: L('x mit P(X ≤ x) = p', 'x with P(X ≤ x) = p') },
        { value: 'ge', label: L('x mit P(X ≥ x) = p', 'x with P(X ≥ x) = p') },
        { value: 'mid', label: L('μ ± c mit Anteil p', 'μ ± c with share p') },
      ],
      default: 'le',
      visibleIf: isMode('quant'),
    },
    {
      key: 'qp',
      type: 'number',
      group: 'int',
      label: L('Wahrscheinlichkeit p', 'Probability p'),
      help: L('Auch die Grenze im Bild ziehen.', 'You can also drag the bound in the picture.'),
      min: 0.5,
      max: 99.5,
      step: 0.5,
      default: 95,
      unit: '%',
      visibleIf: isMode('quant'),
    },
    { key: 'm1', type: 'number', group: 'cmp', label: L('Anlage A: μ', 'Machine A: μ'), min: 490, max: 510, step: 0.5, default: 500, unit: 'ml', visibleIf: isMode('cmp') },
    { key: 's1', type: 'number', group: 'cmp', label: L('Anlage A: σ', 'Machine A: σ'), min: 1, max: 8, step: 0.5, default: 4, unit: 'ml', visibleIf: isMode('cmp') },
    { key: 'm2', type: 'number', group: 'cmp', label: L('Anlage B: μ', 'Machine B: μ'), min: 490, max: 510, step: 0.5, default: 502, unit: 'ml', visibleIf: isMode('cmp') },
    { key: 's2', type: 'number', group: 'cmp', label: L('Anlage B: σ', 'Machine B: σ'), min: 1, max: 8, step: 0.5, default: 2.5, unit: 'ml', visibleIf: isMode('cmp') },
    {
      key: 'tl',
      type: 'number',
      group: 'cmp',
      label: L('Toleranz: untere Grenze', 'Tolerance: lower limit'),
      help: L('Auch die Grenzen im Bild ziehen.', 'You can also drag the limits in the picture.'),
      min: 480,
      max: 520,
      step: 0.5,
      default: 495,
      unit: 'ml',
      visibleIf: isMode('cmp'),
    },
    { key: 'tu', type: 'number', group: 'cmp', label: L('Toleranz: obere Grenze', 'Tolerance: upper limit'), min: 480, max: 520, step: 0.5, default: 505, unit: 'ml', visibleIf: isMode('cmp') },
    { key: 'bn', type: 'number', group: 'dist', label: L('Anzahl der Versuche n', 'Number of trials n'), min: 5, max: 200, step: 1, default: 50, visibleIf: isMode('binom') },
    { key: 'bp', type: 'number', group: 'dist', label: L('Trefferwahrscheinlichkeit p', 'Probability of success p'), min: 0.05, max: 0.95, step: 0.05, default: 0.3, visibleIf: isMode('binom') },
    { key: 'bk', type: 'number', group: 'int', label: L('P(X ≤ k): k', 'P(X ≤ k): k'), min: 0, max: 200, step: 1, default: 12, help: L('Auch die Grenze im Diagramm ziehen.', 'You can also drag the bound in the chart.'), visibleIf: isMode('binom') },
    { key: 'cc', type: 'boolean', group: 'int', label: L('Stetigkeitskorrektur (k + 0,5)', 'Continuity correction (k + 0.5)'), default: true, visibleIf: isMode('binom') },
    {
      key: 'zs',
      type: 'boolean',
      group: 'view',
      label: L('Standardisiert (z-Achse)', 'Standardised (z axis)'),
      help: L('Verschiebt und staucht die Glocke zu N(0; 1). Die Fläche bleibt gleich.', 'Shifts and squeezes the bell into N(0; 1). The area stays the same.'),
      default: false,
      visibleIf: isMode('area'),
    },
    { key: 'prop', type: 'boolean', group: 'view', label: L('Eigenschaften der Glocke', 'Properties of the bell'), help: L('Hochpunkt, Wendestellen mit Wendetangenten, Gesamtfläche 1.', 'Maximum, points of inflection with tangents, total area 1.'), default: false, visibleIf: isMode('area') },
    { key: 'cdf', type: 'boolean', group: 'view', label: L('Verteilungsfunktion Φ zeigen', 'Show the distribution function Φ'), default: true, visibleIf: isMode('area') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeit zeigen', 'Show the probability'), help: L('Aus: Ergebnisse im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: results in the picture replaced by “?” (for tasks).'), default: true, visibleIf: (v) => v.mode !== 'sample' },
  ],
  actions: [
    { id: 'r1', label: L('μ ± σ', 'μ ± σ'), primary: true, visibleIf: isMode('area') },
    { id: 'r2', label: L('μ ± 2σ', 'μ ± 2σ'), visibleIf: isMode('area') },
    { id: 'r3', label: L('μ ± 3σ', 'μ ± 3σ'), visibleIf: isMode('area') },
    { id: 'std', label: L('Standardisieren', 'Standardise'), visibleIf: isMode('area') },
    { id: 'find', label: L('Grenze suchen', 'Find the bound'), primary: true, visibleIf: isMode('quant') },
    { id: 'ctr', label: L('Beide mittig einstellen', 'Centre both machines'), primary: true, visibleIf: isMode('cmp') },
    { id: 'kmu', label: L('k = μ', 'k = μ'), visibleIf: isMode('binom') },
    { id: 'draw', label: L('50 Werte ziehen', 'Draw 50 values'), primary: true, visibleIf: isMode('sample') },
    { id: 'many', label: L('1000 Werte auf einmal', '1000 values at once'), visibleIf: isMode('sample') },
    { id: 'clear', label: L('Stichprobe löschen', 'Clear the sample'), visibleIf: isMode('sample') },
  ],
  readouts: [
    { key: 'p', label: L('Wahrscheinlichkeit', 'Probability'), spoiler: true },
    { key: 'z', label: L('Standardisiert', 'Standardised'), spoiler: true },
    { key: 'q', label: L('Gesuchte Grenze', 'Bound found'), spoiler: true },
    { key: 'cmp', label: L('Anteil im Toleranzbereich', 'Share within tolerance'), spoiler: true },
    { key: 'bin', label: L('Binomialverteilung und Näherung', 'Binomial and approximation'), spoiler: true },
    { key: 'smp', label: L('Stichprobe', 'Sample') },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'std', label: L('Standardnormalverteilung', 'Standard normal distribution'), values: {} },
    { id: 'iq', label: L('IQ über 130', 'IQ above 130'), values: { sit: 'iq', typ: 'ge', ia: 130 } },
    { id: 'fill', label: L('Flasche mit weniger als 495 ml', 'Bottle with less than 495 ml'), values: { sit: 'fill', typ: 'le', fb: 495 } },
    { id: 'zstd', label: L('Standardisieren: IQ zwischen 115 und 130', 'Standardise: IQ between 115 and 130'), values: { sit: 'iq', typ: 'between', ia: 115, ib: 130, zs: true } },
    { id: 'props', label: L('Eigenschaften der Glocke', 'Properties of the bell'), values: { prop: true, cdf: false } },
    { id: 'narrow', label: L('Sehr kleines σ: schmal und hoch', 'Very small σ: narrow and tall'), values: { sg: 0.2, a: -0.2, b: 0.2, prop: true } },
    { id: 'point', label: L('Sonderfall P(X = a) = 0', 'Special case P(X = a) = 0'), values: { typ: 'eq', a: 1 } },
    { id: 'quant', label: L('Welcher IQ wird nur von 5 % übertroffen?', 'Which IQ is exceeded by only 5 %?'), values: { mode: 'quant', sit: 'iq', qt: 'ge', qp: 5 } },
    { id: 'quant95', label: L('Abfüllung: mittlere 95 %', 'Filling: middle 95 %'), values: { mode: 'quant', sit: 'fill', qt: 'mid', qp: 95 } },
    { id: 'cmp', label: L('Zwei Abfüllanlagen vergleichen', 'Compare two filling machines'), values: { mode: 'cmp' } },
    { id: 'cmpShift', label: L('Schmal, aber verschoben', 'Narrow, but shifted'), values: { mode: 'cmp', m2: 504, s2: 2 } },
    { id: 'binom', label: L('Binomial nähern: n = 100, p = 0,5', 'Approximate the binomial: n = 100, p = 0.5'), values: { mode: 'binom', bn: 100, bp: 0.5, bk: 55 } },
    { id: 'binomBad', label: L('Näherung zu grob: n = 20, p = 0,1', 'Approximation too rough: n = 20, p = 0.1'), values: { mode: 'binom', bn: 20, bp: 0.1, bk: 1 } },
    { id: 'lapEdge', label: L('Laplace knapp verfehlt: n = 100, p = 0,1', 'Laplace just missed: n = 100, p = 0.1'), values: { mode: 'binom', bn: 100, bp: 0.1, bk: 10 } },
    { id: 'sample', label: L('Stichprobe: Abfüllanlage', 'Sample: filling machine'), values: { mode: 'sample', sit: 'fill' } },
  ],
  strings: {
    de: {
      canvas:
        'Glockenkurve der Normalverteilung mit ziehbaren Grenzen a und b; die Fläche darunter ist die Wahrscheinlichkeit, darunter die Verteilungsfunktion Φ. Weitere Ansichten: Grenze zu einer vorgegebenen Wahrscheinlichkeit suchen (z-Tabelle rückwärts), zwei Abfüllanlagen mit Toleranzbereich vergleichen, Binomialverteilung durch die Glocke nähern und Stichproben ziehen. Daneben Karten mit Rechnung, Standardisierung und Sigma-Regeln.',
    },
    en: {
      canvas:
        'Bell curve of the normal distribution with draggable bounds a and b; the area under it is the probability, below it the distribution function Φ. Further views: find the bound for a given probability (z table backwards), compare two filling machines with a tolerance range, approximate the binomial distribution by the bell and draw samples. Next to it cards with the calculation, standardisation and sigma rules.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as 'de' | 'en';
    const say = (s: Txt) => s[lang];
    const editable = () => !ctx.locked;
    const mode = () => p.mode as Mode;
    const sit = () => p.sit as Sit;
    const typ = () => p.typ as Typ;
    const qt = () => p.qt as QuantKind;

    /* ---------- Farben (gleiche Größe = gleiche Farbe in Bild, Karten, Ergebnissen) ---------- */
    const col = {
      f: () => th().series[0]!,
      area: () => th().series[4]!,
      cdf: () => th().series[5]!,
      a: () => th().series[3]!,
      b: () => th().series[1]!,
      rule: () => th().series[2]!,
      bar: () => th().series[3]!,
      q: () => th().series[1]!,
      A: () => th().series[0]!,
      B: () => th().series[3]!,
      tol: () => th().series[2]!,
      warn: () => th().series[1]!,
    };

    /* ---------- Zahlen ---------- */
    const pct = (v: number, d?: number) => `${fmt.num(v * 100, d ?? (v < 0.001 && v > 0 ? 3 : 1))} %`;
    const p4 = (v: number) => fmt.fixed(v, 4);
    const Q = (s: string) => (p.show ? s : '?');
    const M = '\\t{ml}';

    /* ---------- Verteilung der Ansichten „Fläche“, „Umkehrung“, „Stichprobe“ ---------- */
    function dist(): { mu: number; s: number; a: number; b: number; unit: string; dec: number; step: number } {
      if (sit() === 'iq') return { mu: 100, s: 15, a: p.ia, b: p.ib, unit: '', dec: 0, step: 1 };
      if (sit() === 'fill') return { mu: 500, s: 4, a: p.fa, b: p.fb, unit: ' ml', dec: 1, step: 0.5 };
      return { mu: p.mu, s: p.sg, a: p.a, b: p.b, unit: '', dec: 1, step: 0.1 };
    }
    const xRangeOf = (): [number, number] => {
      const d = dist();
      // allgemein: fester Ausschnitt −6 … 6 (Form der Glocke vergleichbar), aber μ ± 4σ immer ganz im Bild
      return sit() === 'abs' ? [Math.min(-6, d.mu - 4 * d.s), Math.max(6, d.mu + 4 * d.s)] : [d.mu - 4 * d.s, d.mu + 4 * d.s];
    };
    /** Wirksame Grenzen (−∞ / +∞ bei einseitigen Ereignissen, a = b bei X = a). */
    function boundsOf(a: number, b: number): { lo: number; hi: number } {
      const t = typ();
      if (t === 'le') return { lo: -Infinity, hi: b };
      if (t === 'ge') return { lo: a, hi: Infinity };
      if (t === 'eq') return { lo: a, hi: a };
      return { lo: Math.min(a, b), hi: Math.max(a, b) };
    }
    function P(): number {
      const d = dist();
      const { lo, hi } = boundsOf(d.a, d.b);
      return prob(lo, hi, d.mu, d.s);
    }
    const xn = (v: number) => fmt.num(v, dist().dec);
    const xUnit = (v: number) => `${xn(v)}${dist().unit}`;

    /* ---------- Angezeigter Zustand ---------- */
    const d0 = dist();
    const MU = new Chan(d0.mu);
    const SG = new Chan(d0.s);
    const A = new Chan(d0.a);
    const B = new Chan(d0.b);
    const X0 = new Chan(xRangeOf()[0]);
    const X1 = new Chan(xRangeOf()[1]);
    const ZT = new Chan(p.zs ? 1 : 0);
    const PROP = new Chan(p.prop ? 1 : 0);
    const PV = new Chan(P());
    const QP = new Chan(p.qp);
    const M1 = new Chan(p.m1);
    const S1 = new Chan(p.s1);
    const M2 = new Chan(p.m2);
    const S2 = new Chan(p.s2);
    const TL = new Chan(p.tl);
    const TU = new Chan(p.tu);
    const I1 = new Chan(0);
    const I2 = new Chan(0);
    const KB = new Chan(Math.min(p.bk, p.bn));
    const allChans = [MU, SG, A, B, X0, X1, ZT, PROP, PV, QP, M1, S1, M2, S2, TL, TU, I1, I2, KB];

    let intro: number | null = null;
    let fade: number | null = null;
    let cardFade: number | null = null;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    const touch = () => {
      lastDrag = performance.now();
    };

    /* ---------- Aufteilung (Breite und Höhe: Tablets nutzen das Nebeneinander-Layout) ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const F = (big: number, small: number) => (sm() ? small : big);
    function regions(): { main: Rect; cdf: Rect | null; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      let main: Rect;
      let colR: Rect;
      const withCdf = p.cdf && mode() === 'area';
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.37, 250, 372));
        main = { x: 0, y: 0, w: w - cw - 12, h };
        colR = { x: w - cw, y: 0, w: cw, h };
      } else {
        const mh = Math.round(clamp(w * (withCdf ? 1.18 : 0.88), 280, h * 0.56));
        main = { x: 0, y: 0, w, h: mh };
        colR = { x: 0, y: mh + 10, w, h: h - mh - 10 };
      }
      if (!withCdf) return { main, cdf: null, col: colR, wide: isWide() };
      const dh = Math.round(main.h * 0.6);
      return { main: { ...main, h: dh }, cdf: { x: main.x, y: main.y + dh + 8, w: main.w, h: main.h - dh - 8 }, col: colR, wide: isWide() };
    }
    const HIDDEN: Rect = { x: -10, y: -10, w: 1, h: 1 };
    const plot = new Plot(surface, { x: [-6, 6], y: [0, 0.45], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().main, xAxis: { label: 'x' }, yAxis: { label: '' } });
    const plotC = new Plot(surface, { x: [-6, 6], y: [0, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().cdf ?? HIDDEN, xAxis: { label: 'x' }, yAxis: { label: '' } });

    /** Standardisierung im aktuellen Zwischenstand. */
    const morph = () => morphStandard(ZT.v, MU.v, SG.v);
    /** Sichtbarer x-Bereich in der Ansicht „Fläche“ (gleitet beim Standardisieren zum z-Bereich). */
    function areaRange(): [number, number] {
      const m = morph();
      const t = ZT.v;
      // Fenster um die wandernde Glocke: am Ende genau −4,2 … 4,2 auf der z-Achse
      return [lerp(m.map(X0.v), m.mu - Z_HALF * m.sigma, t), lerp(m.map(X1.v), m.mu + Z_HALF * m.sigma, t)];
    }

    /* ---------- Griffe ---------- */
    const keyOf = (which: 'a' | 'b') => (sit() === 'abs' ? which : sit() === 'iq' ? (which === 'a' ? 'ia' : 'ib') : which === 'a' ? 'fa' : 'fb');
    function setBound(which: 'a' | 'b', xt: number): void {
      touch();
      const d = dist();
      const [x0, x1] = xRangeOf();
      const x = morph().unmap(xt);
      const v = Math.round(clamp(x, x0, x1) / d.step) * d.step;
      ctx.set({ [keyOf(which)]: Number(v.toFixed(2)) });
    }
    plot.addHandle({ get: () => [morph().map(A.v), 0], set: (x) => setBound('a', x), axis: 'x', enabled: () => editable() && mode() === 'area' && typ() !== 'le', color: () => col.a() });
    plot.addHandle({ get: () => [morph().map(B.v), 0], set: (x) => setBound('b', x), axis: 'x', enabled: () => editable() && mode() === 'area' && typ() !== 'ge' && typ() !== 'eq', color: () => col.b() });
    // Umkehrung: Grenze ziehen → Wahrscheinlichkeit
    const quantNow = () => quantile(qt(), clamp(QP.v, 0.01, 99.99) / 100, MU.v, SG.v);
    const setQuant = (x: number) => {
      touch();
      const d = dist();
      const v = probOfBound(qt(), x, d.mu, d.s) * 100;
      ctx.set({ qp: clamp(Math.round(v * 2) / 2, 0.5, 99.5) });
    };
    plot.addHandle({ get: () => [Number.isFinite(quantNow().hi) ? quantNow().hi : quantNow().lo, 0], set: (x) => setQuant(x), axis: 'x', enabled: () => editable() && mode() === 'quant', color: () => col.q() });
    plot.addHandle({ get: () => [quantNow().lo, 0], set: (x) => setQuant(x), axis: 'x', enabled: () => editable() && mode() === 'quant' && qt() === 'mid', color: () => col.q() });
    // Vergleich: Toleranzgrenzen und Erwartungswerte
    const half = (v: number) => Math.round(v * 2) / 2;
    plot.addHandle({ get: () => [TL.v, 0], set: (x) => (touch(), ctx.set({ tl: clamp(half(x), 480, 520) })), axis: 'x', enabled: () => editable() && mode() === 'cmp', color: () => col.tol() });
    plot.addHandle({ get: () => [TU.v, 0], set: (x) => (touch(), ctx.set({ tu: clamp(half(x), 480, 520) })), axis: 'x', enabled: () => editable() && mode() === 'cmp', color: () => col.tol() });
    plot.addHandle({ get: () => [M1.v, pdfMax(S1.v)], set: (x) => (touch(), ctx.set({ m1: clamp(half(x), 490, 510) })), axis: 'x', enabled: () => editable() && mode() === 'cmp', color: () => col.A() });
    plot.addHandle({ get: () => [M2.v, pdfMax(S2.v)], set: (x) => (touch(), ctx.set({ m2: clamp(half(x), 490, 510) })), axis: 'x', enabled: () => editable() && mode() === 'cmp', color: () => col.B() });
    // Grenze k der Binomialverteilung (bei k + 0,5 bzw. k)
    plot.addHandle({
      get: () => [KB.v + (p.cc ? 0.5 : 0), 0],
      set: (x) => {
        touch();
        ctx.set({ bk: clamp(Math.round(x - (p.cc ? 0.5 : 0)), 0, p.bn) });
      },
      axis: 'x',
      enabled: () => editable() && mode() === 'binom',
      color: () => col.b(),
    });

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({
      f: col.f(),
      A: col.area(),
      c: col.cdf(),
      a: col.a(),
      b: col.b(),
      r: col.rule(),
      m: th().muted,
      q: col.q(),
      P: col.A(),
      R: col.B(),
      t: col.tol(),
    });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
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

    /* ---------- Zeichenhilfen ---------- */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; bounds?: Rect; fill?: string } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? F(13, 12);
      const color = opts.color ?? th().text;
      const box = opts.maxW ? fit(src, opts.maxW, size, color, 700) : formula(g, src, fstyle(size, color, 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      let base = y + (box.asc - box.desc) / 2;
      if (opts.bounds) base = clamp(base, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 7, y: base - box.asc - 4, w: box.w + 14, h: box.asc + box.desc + 8 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)');
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 7;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(10, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(10, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    const pillW = (src: string, size: number) => formula(surface.g, src, fstyle(size, th().text, 700)).w + 14;

    function dot(x: number, y: number, color: string, r: number, alpha = 1): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01) return;
      g.save();
      g.globalAlpha *= alpha;
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
      g.restore();
    }

    function vline(pl: Plot, x: number, y0: number, y1: number, color: string, width: number, dash?: number[], alpha = 1): void {
      const g = surface.g;
      if (alpha <= 0.01) return;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(pl.px(x), pl.py(y0));
      g.lineTo(pl.px(x), pl.py(y1));
      g.stroke();
      g.restore();
    }

    /** Kurve über [x0, x1] mit weichem Schatten; reveal (0 … 1) zeichnet von links nach rechts. */
    function curve(pl: Plot, f: (x: number) => number, color: string, width: number, reveal = 1, alpha = 1): void {
      const g = surface.g;
      const r = pl.rect;
      if (reveal <= 0.001 || alpha <= 0.01) return;
      g.save();
      g.globalAlpha *= alpha;
      g.beginPath();
      g.rect(r.x, r.y - 4, r.w * reveal, r.h + 8);
      g.clip();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : mixColor(color, '#ffffff', 0.45, 0.6);
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      pl.fn(f, { color, width });
      g.restore();
      if (width >= 2.5 && reveal > 0.001) {
        g.save();
        g.globalAlpha *= alpha * 0.45;
        g.beginPath();
        g.rect(r.x, r.y - 4, r.w * reveal, r.h + 8);
        g.clip();
        g.translate(0, -width * 0.25);
        pl.fn(f, { color: withAlpha('#ffffff', th().dark ? 0.35 : 0.6), width: Math.max(1, width * 0.28) });
        g.restore();
      }
    }

    /** Fläche unter f zwischen lo und hi mit Verlauf nach unten. */
    function areaFill(pl: Plot, f: (x: number) => number, lo: number, hi: number, color: string, alpha: number): void {
      if (alpha <= 0.005) return;
      const g = surface.g;
      const r = pl.rect;
      const [xa, xb] = [Math.max(lo, pl.toWorld(r.x, 0)[0]), Math.min(hi, pl.toWorld(r.x + r.w, 0)[0])];
      if (!(xb > xa)) return;
      const n = Math.max(24, Math.round(((pl.px(xb) - pl.px(xa)) / 2) | 0));
      g.save();
      g.beginPath();
      g.moveTo(pl.px(xa), pl.py(0));
      for (let i = 0; i <= n; i++) {
        const x = xa + ((xb - xa) * i) / n;
        g.lineTo(pl.px(x), pl.py(f(x)));
      }
      g.lineTo(pl.px(xb), pl.py(0));
      g.closePath();
      const grad = g.createLinearGradient(0, r.y, 0, pl.py(0));
      grad.addColorStop(0, withAlpha(color, alpha * 1.25));
      grad.addColorStop(1, withAlpha(color, alpha * 0.7));
      g.fillStyle = grad;
      g.fill();
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
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.14 : 0.08));
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

    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const pad = F(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = F(13.5, 12.5);
      const rb = right ? formula(g, right, fstyle(F(12, 11), color, 700)) : null;
      const room = R.w - 2 * pad - 15 - (rb ? rb.w + 10 : 0);
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      if (rb) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      return ty;
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      draw: number;
      area: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, draw: 1, area: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 2800) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        draw: ease.inOutCubic(clamp01((t - 150) / 1050)),
        area: ease.outCubic(clamp01((t - 750) / 700)),
        labels: ease.outCubic(clamp01((t - 1100) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 700) / 1500),
      };
    }

    /* =====================================================================
     * Ansicht „Fläche“
     * ===================================================================== */
    function axisLabelX(t: number): string {
      if (t > 0.5) return 'z';
      return sit() === 'iq' ? 'IQ' : sit() === 'fill' ? 'x in ml' : 'x';
    }

    function drawArea(k: Intro): void {
      const g = surface.g;
      const theme = th();
      const t = ZT.v;
      const m = morph();
      const mu = m.mu;
      const s = m.sigma;
      const [rx0, rx1] = areaRange();
      const yMax = Math.max(sit() === 'abs' ? 0.42 : 0, pdfMax(s)) * 1.2;
      plot.setAxes({ x: { label: axisLabelX(t) } });
      plot.setRangePadded([rx0, rx1], [0, yMax], { left: F(44, 36), bottom: F(26, 24), top: 12, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const f = (x: number) => pdf(x, mu, s);
      const aT = m.map(A.v);
      const bT = m.map(B.v);
      const tp = typ();
      const lo = tp === 'le' ? rx0 - 1 : tp === 'ge' ? aT : tp === 'eq' ? aT : Math.min(aT, bT);
      const hi = tp === 'ge' ? rx1 + 1 : tp === 'le' ? bT : tp === 'eq' ? aT : Math.max(aT, bT);
      // Fläche (beim Einstieg nach dem Zeichnen der Kurve)
      areaFill(plot, f, lo, hi, col.area(), (theme.dark ? 0.4 : 0.3) * k.area);
      // Eigenschaften: Gesamtfläche angedeutet
      const pr = PROP.v * k.labels;
      if (pr > 0.01) areaFill(plot, f, rx0 - 1, rx1 + 1, col.f(), (theme.dark ? 0.08 : 0.06) * pr);
      // μ und σ-Markierungen
      vline(plot, mu, 0, f(mu), withAlpha(theme.text, 0.45), 1.4, [6, 4], k.labels);
      for (const sg of [-1, 1]) vline(plot, mu + sg * s, 0, f(mu + sg * s), withAlpha(theme.text, 0.35), 1.2, [3, 4], k.labels);
      // Kurve
      curve(plot, f, col.f(), F(3.2, 2.8), k.draw);
      // Wendestellen und Wendetangenten
      if (pr > 0.01) drawProperties(mu, s, pr);
      for (const sg of [-1, 1]) dot(plot.px(mu + sg * s), plot.py(f(mu + sg * s)), col.f(), 3.6, k.labels * (1 - pr));
      // σ-Klammer
      if (pr < 0.99) {
        const yb = f(mu + s) * 0.55;
        const x1p = plot.px(mu);
        const x2p = plot.px(mu + s);
        const ybp = plot.py(yb);
        g.save();
        g.globalAlpha *= k.labels * (1 - pr);
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(x1p, ybp - 4);
        g.lineTo(x1p, ybp + 4);
        g.moveTo(x1p, ybp);
        g.lineTo(x2p, ybp);
        g.moveTo(x2p, ybp - 4);
        g.lineTo(x2p, ybp + 4);
        g.stroke();
        g.restore();
        if (x2p - x1p > 16) fpill((x1p + x2p) / 2, ybp - 14, t > 0.5 ? '1' : 'σ', { size: F(12, 11), alpha: k.labels * (1 - pr) * 0.95 });
      }
      // Grenzen
      const bound = (x: number, c: string, name: string) => {
        vline(plot, x, 0, f(x), c, 2.4, undefined, k.labels);
        dot(plot.px(x), plot.py(0), c, F(7, 6.5), k.labels);
        fpill(plot.px(x), plot.py(0) - lerp(F(22, 20), F(46, 42), clamp01(t * 2)), `\\c{${name}}{${name}}`, { size: F(12.5, 11.5), alpha: k.labels, border: withAlpha(c, 0.6), bounds: r });
      };
      if (tp !== 'le') bound(aT, col.a(), 'a');
      if (tp !== 'ge' && tp !== 'eq') bound(bT, col.b(), 'b');
      // Flächenwert (zählt mit)
      if (tp === 'eq') {
        const ax = plot.px(aT);
        const src = `P(X = \\c{a}{a}) = \\c{A}{${Q('0')}}`;
        const w = pillW(src, F(14, 12.5));
        const right = ax + 14 + w < r.x + r.w - 8;
        fpill(right ? ax + 14 : ax - 14, plot.py(f(aT) * 0.55), src, { align: right ? 'left' : 'right', size: F(14, 12.5), alpha: k.labels, border: withAlpha(col.area(), 0.6), bounds: r });
      } else {
        const xa = Math.max(lo, rx0);
        const xb = Math.min(hi, rx1);
        const xm = clamp(clamp(mu, xa, xb), rx0 + (rx1 - rx0) * 0.08, rx1 - (rx1 - rx0) * 0.08);
        const ym = Math.max(f(clamp(mu, xa, xb)) * lerp(0.4, 0.22, PROP.v), yMax * 0.1);
        fpill(plot.px(xm), plot.py(ym), `\\c{A}{${Q(pct(PV.v))}}`, { size: F(15, 13.5), alpha: k.labels, border: withAlpha(col.area(), 0.7), bounds: r });
      }
      // μ-Beschriftung oben
      fpill(plot.px(mu) + 8, r.y + 16, t > 0.5 ? 'μ = 0' : 'μ', { align: 'left', size: F(12, 11), alpha: k.labels * 0.95, bounds: r });
      // Zuordnung x → z während und nach dem Standardisieren: alte Skala wandert mit
      if (t > 0.01) drawXScale(t);
      // Hinweise oben links
      let hy = r.y + 18;
      const note = (src: string, color: string) => {
        const rr = fpill(r.x + 10, hy, src, { align: 'left', size: F(12, 11), alpha: k.labels, border: withAlpha(color, 0.6), maxW: r.w * 0.55 });
        hy = rr.y + rr.h + 14;
      };
      if (t > 0.01 && t < 0.99) note(`\\t{${say(L('Fläche bleibt gleich', 'Area stays the same'))}:} \\c{A}{${Q(pct(PV.v))}}`, col.area());
      else if (t >= 0.99) note(`z = \\f{x − μ}{σ}`, col.area());
      if (pr > 0.01 && t < 0.01) note(`\\t{${say(L('Gesamtfläche', 'Total area'))}} = \\c{f}{1}`, col.f());
      if (tp === 'between' && dist().a > dist().b) note(`\\c{b}{\\t{a > b: ${say(L('Grenzen vertauscht', 'bounds swapped'))}}}`, col.b());
      plot.end();
    }

    /** Hochpunkt, Wendestellen mit Wendetangenten, Gesamtfläche 1. */
    function drawProperties(mu: number, s: number, a: number): void {
      const g = surface.g;
      const r = plot.rect;
      const ym = pdfMax(s);
      // Hochpunkt
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = withAlpha(col.f(), 0.7);
      g.setLineDash([3, 4]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(r.x, plot.py(ym));
      g.lineTo(plot.px(mu), plot.py(ym));
      g.stroke();
      g.restore();
      dot(plot.px(mu), plot.py(ym), col.f(), 5, a);
      const maxSrc = `\\t{Max:} \\f{1}{σ\\r{2π}} ≈ ${fmt.num(ym, 3)}`;
      const left = plot.px(mu) - r.x > pillW(maxSrc, F(12, 11)) + 30;
      fpill(plot.px(mu) + (left ? -14 : 14), plot.py(ym) + 4, maxSrc, { align: left ? 'right' : 'left', size: F(12, 11), alpha: a, border: withAlpha(col.f(), 0.5), bounds: r });
      // Wendetangenten
      for (const tg of inflectionTangents(mu, s)) {
        const x0 = tg.root;
        const x1 = tg.x + (tg.x - tg.root) * 0.55;
        const y = (x: number) => tg.y + tg.slope * (x - tg.x);
        g.save();
        g.globalAlpha *= a;
        g.strokeStyle = col.rule();
        g.lineWidth = 2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(plot.px(x0), plot.py(0));
        g.lineTo(plot.px(x1), plot.py(y(x1)));
        g.stroke();
        g.restore();
        dot(plot.px(tg.x), plot.py(tg.y), col.rule(), 5, a);
        dot(plot.px(x0), plot.py(0), col.rule(), 3.5, a);
      }
      const [l, rr] = inflectionTangents(mu, s);
      if (rr && l) {
        const label = `\\c{r}{\\t{${say(L('Wendestelle', 'inflection'))}} μ + σ}`;
        const lw = pillW(label, F(11.5, 11));
        const fitsRight = plot.px(rr.x) + 12 + lw < r.x + r.w - 10;
        // ohne Platz rechts (flache, weit rechts liegende Glocke) steht die Wendestelle nur in der Karte
        if (fitsRight) fpill(plot.px(rr.x) + 12, plot.py(rr.y) + 2, label, { align: 'left', size: F(11.5, 11), alpha: a, bounds: r });
      }
    }

    /** Alte x-Skala (μ + kσ) über der z-Achse: wandert beim Standardisieren mit. */
    function drawXScale(t: number): void {
      const g = surface.g;
      const theme = th();
      const r = plot.rect;
      const m = morph();
      const y = plot.py(0) - 6;
      const d = dist();
      g.save();
      g.globalAlpha *= clamp01(t * 1.6);
      for (let kk = -3; kk <= 3; kk++) {
        const x = MU.v + kk * SG.v;
        const px = plot.px(m.map(x));
        if (px < r.x + 14 || px > r.x + r.w - 14) continue;
        g.strokeStyle = withAlpha(col.area(), 0.8);
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(px, y);
        g.lineTo(px, y - 7);
        g.stroke();
        g.font = `650 ${F(11, 10.5)}px ${theme.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'bottom';
        g.lineWidth = 3;
        g.strokeStyle = theme.bg;
        const lab = fmt.num(x, d.dec);
        g.strokeText(lab, px, y - 9);
        g.fillStyle = col.area();
        g.fillText(lab, px, y - 9);
      }
      g.restore();
    }

    function drawCdf(R: Rect, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const t = ZT.v;
      const m = morph();
      const [rx0, rx1] = areaRange();
      plotC.setAxes({ x: { label: axisLabelX(t) } });
      plotC.setRangePadded([rx0, rx1], [0, 1], { left: F(44, 36), bottom: F(22, 20), top: 22, right: 14 });
      plotC.begin();
      plotC.grid();
      plotC.axes();
      const Fn = (x: number) => cdf(x, m.mu, m.sigma);
      curve(plotC, Fn, col.cdf(), 2.6, k.draw);
      const r = plotC.rect;
      g.save();
      g.globalAlpha *= k.panel;
      g.font = `700 ${F(11.5, 10.5)}px ${theme.font}`;
      g.fillStyle = col.cdf();
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(t > 0.5 ? 'Φ(z) = P(Z ≤ z)' : say(L('Verteilungsfunktion Φ(x) = P(X ≤ x)', 'Distribution function Φ(x) = P(X ≤ x)')), r.x + 8, R.y + 10);
      g.restore();
      const tp = typ();
      const hasA = tp !== 'le';
      const hasB = tp !== 'ge' && tp !== 'eq';
      const aT = m.map(A.v);
      const bT = m.map(B.v);
      const fa = hasA ? Fn(aT) : 0;
      const fb = hasB ? Fn(bT) : tp === 'eq' ? fa : 1;
      const mark = (x: number, v: number, c: string, name: string) => {
        g.save();
        g.globalAlpha *= k.labels;
        plotC.segment([x, 0], [x, v], { color: withAlpha(c, 0.6), width: 1.4, dash: [4, 3] });
        plotC.segment([rx0, v], [x, v], { color: withAlpha(c, 0.6), width: 1.4, dash: [4, 3] });
        g.restore();
        dot(plotC.px(x), plotC.py(v), c, 4.5, k.labels);
        if (p.show) fpill(plotC.px(rx0) + 8, plotC.py(v) + (v > 0.82 ? 12 : -12), `Φ(\\c{${name}}{${name}}) ≈ ${p4(v)}`, { align: 'left', size: F(11.5, 10.5), color: c, alpha: k.labels, bounds: r });
      };
      if (hasA) mark(aT, fa, col.a(), 'a');
      if (hasB) mark(bT, fb, col.b(), 'b');
      // Differenz als Balken am rechten Rand
      if (tp !== 'eq') {
        const xr = r.x + r.w - 20;
        const y1 = plotC.py(Math.min(fa, fb));
        const y2 = plotC.py(Math.max(fa, fb));
        g.save();
        g.globalAlpha *= k.area;
        g.fillStyle = withAlpha(col.area(), theme.dark ? 0.6 : 0.45);
        roundRect(g, xr - 6, y2, 12, Math.max(1, y1 - y2), 4);
        g.fill();
        g.strokeStyle = col.area();
        g.lineWidth = 1.5;
        roundRect(g, xr - 6, y2, 12, Math.max(1, y1 - y2), 4);
        g.stroke();
        g.restore();
      }
      plotC.end();
    }

    /* =====================================================================
     * Ansicht „Umkehrung“
     * ===================================================================== */
    function drawQuant(k: Intro): void {
      const theme = th();
      const mu = MU.v;
      const s = SG.v;
      const [rx0, rx1] = [X0.v, X1.v];
      const yMax = Math.max(sit() === 'abs' ? 0.42 : 0, pdfMax(s)) * 1.2;
      plot.setAxes({ x: { label: axisLabelX(0) } });
      plot.setRangePadded([rx0, rx1], [0, yMax], { left: F(44, 36), bottom: F(26, 24), top: 34, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const f = (x: number) => pdf(x, mu, s);
      const q = quantNow();
      const lo = Number.isFinite(q.lo) ? q.lo : rx0 - 1;
      const hi = Number.isFinite(q.hi) ? q.hi : rx1 + 1;
      areaFill(plot, f, lo, hi, col.q(), (theme.dark ? 0.36 : 0.26) * k.area);
      vline(plot, mu, 0, f(mu), withAlpha(theme.text, 0.45), 1.4, [6, 4], k.labels);
      curve(plot, f, col.f(), F(3.2, 2.8), k.draw);
      const bounds = [q.lo, q.hi].filter((x) => Number.isFinite(x));
      const unknown = !p.show;
      bounds.forEach((x, i) => {
        vline(plot, x, 0, Math.max(f(x), yMax * 0.04), col.q(), 2.4, undefined, k.labels);
        dot(plot.px(x), plot.py(0), col.q(), F(7, 6.5), k.labels);
        const right = (qt() === 'mid' && i === 1) || (qt() === 'le') || (qt() === 'ge' && plot.px(x) < r.x + r.w * 0.35);
        const name = qt() === 'mid' ? (i === 0 ? 'x_1' : 'x_2') : 'x';
        const src = `\\c{q}{${name} ${unknown ? '= ?' : `≈ ${fmt.num(x, 2)}`}}`;
        fpill(plot.px(x) + (right ? 10 : -10), plot.py(yMax * 0.62) - (qt() === 'mid' ? 0 : 0), src, { align: right ? 'left' : 'right', size: F(12.5, 11.5), alpha: k.labels, border: withAlpha(col.q(), 0.6), bounds: r });
      });
      // Flächenwert
      const xa = Math.max(lo, rx0);
      const xb = Math.min(hi, rx1);
      const xmid = qt() === 'mid' ? mu : qt() === 'le' ? Math.max(rx0 + (xb - rx0) * 0.5, Math.min(mu, xb - (rx1 - rx0) * 0.06)) : Math.min(rx1 - (rx1 - xa) * 0.5, Math.max(mu, xa + (rx1 - rx0) * 0.06));
      const yy = Math.max(f(clamp(xmid, xa, xb)) * 0.4, yMax * 0.1);
      fpill(plot.px(xmid), plot.py(yy), `\\c{q}{${pct(QP.v / 100)}}`, { size: F(15, 13.5), alpha: k.labels, border: withAlpha(col.q(), 0.7), bounds: r });
      // Kopf: Frage
      const pq = fmt.num(p.qp, 1);
      const ask =
        qt() === 'le'
          ? `\\t{${say(L('Gesucht', 'Find'))}:} x \\t{${say(L('mit', 'with'))}} P(X ≤ x) = ${pq} %`
          : qt() === 'ge'
            ? `\\t{${say(L('Gesucht', 'Find'))}:} x \\t{${say(L('mit', 'with'))}} P(X ≥ x) = ${pq} %`
            : `\\t{${say(L('Gesucht', 'Find'))}:} c \\t{${say(L('mit', 'with'))}} P(μ − c ≤ X ≤ μ + c) = ${pq} %`;
      fpill(r.x + 10, r.y + 18, ask, { align: 'left', size: F(12.5, 11.5), alpha: k.panel, border: withAlpha(col.q(), 0.6), maxW: r.w - 40 });
      if (!dragging()) fpill(r.x + r.w - 10, r.y + 50, `\\c{m}{\\t{${say(L('Grenze ziehen', 'Drag the bound'))}}}`, { align: 'right', size: F(11.5, 11), alpha: k.labels * 0.9 });
      plot.end();
    }

    /* =====================================================================
     * Ansicht „Vergleich“
     * ===================================================================== */
    function cmpRange(): [number, number] {
      const lo = Math.min(M1.v - 3.6 * S1.v, M2.v - 3.6 * S2.v, TL.v - 2, TU.v - 2);
      const hi = Math.max(M1.v + 3.6 * S1.v, M2.v + 3.6 * S2.v, TL.v + 2, TU.v + 2);
      return [lo, hi];
    }
    function drawCmp(k: Intro): void {
      const g = surface.g;
      const theme = th();
      const [x0, x1] = cmpRange();
      const yMax = Math.max(pdfMax(S1.v), pdfMax(S2.v)) * 1.32;
      plot.setAxes({ x: { label: 'x in ml' } });
      plot.setRangePadded([x0, x1], [0, yMax], { left: F(44, 36), bottom: F(26, 24), top: 34, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const tl = Math.min(TL.v, TU.v);
      const tu = Math.max(TL.v, TU.v);
      // Toleranzbereich
      g.save();
      g.globalAlpha *= k.panel;
      const bandX0 = plot.px(tl);
      const bandX1 = plot.px(tu);
      const grad = g.createLinearGradient(0, r.y, 0, plot.py(0));
      grad.addColorStop(0, withAlpha(col.tol(), theme.dark ? 0.04 : 0.03));
      grad.addColorStop(1, withAlpha(col.tol(), theme.dark ? 0.16 : 0.12));
      g.fillStyle = grad;
      g.fillRect(bandX0, r.y, bandX1 - bandX0, plot.py(0) - r.y);
      g.restore();
      for (const x of [tl, tu]) vline(plot, x, 0, yMax * 0.93, col.tol(), 1.8, [6, 4], k.panel);
      const fA = (x: number) => pdf(x, M1.v, S1.v);
      const fB = (x: number) => pdf(x, M2.v, S2.v);
      areaFill(plot, fA, tl, tu, col.A(), (theme.dark ? 0.24 : 0.17) * k.area);
      areaFill(plot, fB, tl, tu, col.B(), (theme.dark ? 0.24 : 0.17) * k.area);
      // Ausschuss rot schraffiert angedeutet
      for (const [fn, a, b] of [
        [fA, x0 - 1, tl],
        [fA, tu, x1 + 1],
        [fB, x0 - 1, tl],
        [fB, tu, x1 + 1],
      ] as [(x: number) => number, number, number][]) areaFill(plot, fn, a, b, col.warn(), (theme.dark ? 0.12 : 0.08) * k.area);
      curve(plot, fA, col.A(), F(3, 2.6), k.draw);
      curve(plot, fB, col.B(), F(3, 2.6), k.draw);
      // Beschriftung der Glocken
      const tagA = `\\c{P}{A}`;
      const tagB = `\\c{R}{B}`;
      const close = Math.abs(plot.px(M1.v) - plot.px(M2.v)) < 40 && Math.abs(plot.py(pdfMax(S1.v)) - plot.py(pdfMax(S2.v))) < 30;
      fpill(plot.px(M1.v) - (close ? 16 : 0), plot.py(pdfMax(S1.v)) - 22, tagA, { size: F(13, 12), alpha: k.labels, border: withAlpha(col.A(), 0.7), bounds: r });
      fpill(plot.px(M2.v) + (close ? 16 : 0), plot.py(pdfMax(S2.v)) - 22, tagB, { size: F(13, 12), alpha: k.labels, border: withAlpha(col.B(), 0.7), bounds: r });
      dot(plot.px(M1.v), plot.py(pdfMax(S1.v)), col.A(), F(6, 5.5), k.labels);
      dot(plot.px(M2.v), plot.py(pdfMax(S2.v)), col.B(), F(6, 5.5), k.labels);
      // Toleranzgrenzen
      for (const x of [tl, tu]) {
        dot(plot.px(x), plot.py(0), col.tol(), F(7, 6.5), k.labels);
      }
      const lab = (x: number, right: boolean) => fpill(plot.px(x) + (right ? 8 : -8), r.y + 18, `\\c{t}{${fmt.num(x, 1)} ${M}}`, { align: right ? 'left' : 'right', size: F(12, 11), alpha: k.labels, border: withAlpha(col.tol(), 0.6), bounds: r });
      lab(tl, false);
      lab(tu, true);
      const mid = (bandX0 + bandX1) / 2;
      if (bandX1 - bandX0 > 90) fpill(mid, r.y + 50, `\\c{t}{\\t{${say(L('Toleranz', 'Tolerance'))}}}`, { size: F(11.5, 11), alpha: k.labels * 0.95 });
      plot.end();
    }

    /* =====================================================================
     * Ansicht „Binomialverteilung nähern“
     * ===================================================================== */
    let barsFrom: number[] = binomPmf(p.bn, p.bp);
    let barsTo: number[] = barsFrom;
    const barTween = new Tween(650, ease.inOutCubic);
    const barsNow = (): number[] => {
      if (!barTween.running) return barsTo;
      const t = barTween.value;
      const n = Math.max(barsFrom.length, barsTo.length);
      return Array.from({ length: n }, (_, i) => (barsFrom[i] ?? 0) + ((barsTo[i] ?? 0) - (barsFrom[i] ?? 0)) * t);
    };
    /** Maximaler Näherungsfehler max_k |P(X ≤ k) − Näherung| für n = 5 … 200 (zwischengespeichert). */
    const errCache = new Map<string, number[]>();
    function errCurve(pp: number, cc: boolean): number[] {
      const key = `${pp.toFixed(2)}|${cc}`;
      let v = errCache.get(key);
      if (!v) {
        v = [];
        for (let n = 5; n <= 200; n++) {
          const pmf = binomPmf(n, pp);
          const { mu, sigma } = binomMoments(n, pp);
          let acc = 0;
          let mx = 0;
          for (let kk = 0; kk <= n; kk++) {
            acc += pmf[kk]!;
            mx = Math.max(mx, Math.abs(acc - cdf(kk + (cc ? 0.5 : 0), mu, sigma)));
          }
          v.push(mx);
        }
        errCache.set(key, v);
      }
      return v;
    }

    function drawBinom(k: Intro): void {
      const g = surface.g;
      const theme = th();
      const n = p.bn;
      const { mu, sigma } = binomMoments(n, p.bp);
      const bars = barsNow();
      const x0 = Math.max(-0.5, Math.floor(mu - 4.2 * Math.max(sigma, 1)) - 0.5);
      const x1 = Math.min(n + 0.5, Math.ceil(mu + 4.2 * Math.max(sigma, 1)) + 0.5);
      const yMax = Math.max(...bars.slice(Math.max(0, Math.ceil(x0)), Math.floor(x1) + 1), pdf(mu, mu, sigma)) * 1.34;
      plot.setAxes({ x: { label: 'k' } });
      plot.setRangePadded([x0, x1], [0, yMax], { left: F(46, 38), bottom: F(26, 24), top: 34, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const shownK = KB.v;
      const kLine = shownK + (p.cc ? 0.5 : 0);
      const f = (x: number) => pdf(x, mu, sigma);
      areaFill(plot, f, x0, Math.min(kLine, x1), col.area(), (theme.dark ? 0.26 : 0.18) * k.area);
      // Balken (wachsen beim Einstieg von links nach rechts)
      const bw = plot.scale.x;
      const kMin = Math.max(0, Math.ceil(x0));
      const kMax = Math.min(n, Math.floor(x1));
      for (let kk = kMin; kk <= kMax; kk++) {
        const grow = ease.outCubic(clamp01(k.draw * 1.6 - ((kk - kMin) / Math.max(1, kMax - kMin)) * 0.6));
        const h = (bars[kk] ?? 0) * grow;
        if (h <= 0) continue;
        const [px0, py] = plot.toPx(kk - 0.5, h);
        const pyb = plot.py(0);
        const on = kk <= Math.round(shownK);
        const inset = bw > 6 ? 1 : 0;
        const gr = g.createLinearGradient(0, py, 0, pyb);
        const c = on ? col.bar() : theme.muted;
        gr.addColorStop(0, withAlpha(c, on ? (theme.dark ? 0.85 : 0.72) : theme.dark ? 0.42 : 0.3));
        gr.addColorStop(1, withAlpha(c, on ? (theme.dark ? 0.6 : 0.5) : theme.dark ? 0.25 : 0.18));
        g.fillStyle = gr;
        g.fillRect(px0 + inset, py, Math.max(1, bw - 2 * inset), pyb - py);
        if (bw > 10) {
          g.strokeStyle = on ? col.bar() : withAlpha(theme.muted, 0.6);
          g.lineWidth = 1;
          g.strokeRect(px0 + inset + 0.5, py + 0.5, Math.max(1, bw - 2 * inset) - 1, pyb - py - 0.5);
        }
      }
      curve(plot, f, col.f(), F(3, 2.6), ease.outCubic(clamp01((k.draw - 0.3) / 0.7)));
      vline(plot, mu, 0, f(mu), withAlpha(theme.text, 0.45), 1.4, [6, 4], k.labels);
      // Grenze k
      const kx = plot.px(kLine);
      g.save();
      g.globalAlpha *= k.labels;
      g.strokeStyle = col.b();
      g.lineWidth = 2.2;
      g.setLineDash([6, 4]);
      g.beginPath();
      g.moveTo(kx, r.y + 70);
      g.lineTo(kx, plot.py(0));
      g.stroke();
      g.restore();
      dot(kx, plot.py(0), col.b(), F(7, 6.5), k.labels);
      fpill(kx, r.y + 84, p.cc ? `\\c{b}{k + 0,5 = ${fmt.num(Math.round(shownK) + 0.5, 1)}}` : `\\c{b}{k = ${fmt.num(Math.round(shownK), 0)}}`, { size: F(12.5, 11.5), alpha: k.labels, border: withAlpha(col.b(), 0.6), bounds: r });
      // Legende und Laplace-Bedingung
      const ok = laplaceOk(n, p.bp);
      const edge = Math.abs(sigma - 3) < 1e-9;
      const lapSrc = ok ? `\\c{r}{σ ≈ ${fmt.num(sigma, 2)} > 3 ✓}` : edge ? `\\c{b}{σ = 3 – \\t{${say(L('nicht > 3', 'not > 3'))}}}` : `\\c{b}{σ ≈ ${fmt.num(sigma, 2)} ≤ 3 ✗}`;
      const leg = fpill(r.x + 10, r.y + 18, `\\c{a}{B(${n}; ${fmt.num(p.bp, 2)})}  \\c{f}{N(${fmt.num(mu, 1)}; ${fmt.num(sigma, 2)}²)}`, { align: 'left', size: F(12.5, 11.5), alpha: k.panel, maxW: r.w - 30 });
      const lw = pillW(lapSrc, F(12.5, 11.5));
      const room = leg.x + leg.w + 10 + lw < r.x + r.w - 10;
      fpill(room ? r.x + r.w - 10 : r.x + 10, room ? r.y + 18 : leg.y + leg.h + 16, lapSrc, { align: room ? 'right' : 'left', size: F(12.5, 11.5), alpha: k.labels, border: withAlpha(ok ? col.rule() : col.b(), 0.7) });
      plot.end();
    }

    /* =====================================================================
     * Ansicht „Stichprobe“
     * ===================================================================== */
    let rngSeed = 1;
    let rnd = seededRandom(rngSeed);
    let samples: number[] = [];
    let falling: { x: number; t0: number }[] = [];
    let shownCounts: number[] = [];
    let shownStats = { n: 0, mean: 0, sd: 0 };
    function binEdges(): { lo: number; w: number; count: number } {
      const d = dist();
      const [lo, hi] = xRangeOf();
      const w = d.s / 3;
      return { lo, w, count: Math.ceil((hi - lo) / w) };
    }
    function targetCounts(now: number): number[] {
      const { lo, w, count } = binEdges();
      const out = new Array<number>(count).fill(0);
      const pending = new Set(falling.filter((fv) => now - fv.t0 < FALL_MS).map((fv) => fv.x));
      for (const x of samples) {
        if (pending.has(x)) continue;
        const i = Math.floor((x - lo) / w);
        if (i >= 0 && i < count) out[i]!++;
      }
      return out;
    }
    function drawSample(k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const d = dist();
      const [x0, x1] = [X0.v, X1.v];
      const { lo, w, count } = binEdges();
      const N = Math.max(1, samples.length);
      const yMax = pdfMax(SG.v) * 1.38;
      plot.setAxes({ x: { label: axisLabelX(0) } });
      plot.setRangePadded([x0, x1], [0, yMax], { left: F(46, 38), bottom: F(26, 24), top: 34, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      for (let i = 0; i < count; i++) {
        const c = shownCounts[i] ?? 0;
        if (c <= 0.001) continue;
        const h = Math.min(yMax * 0.98, c / (N * w));
        const [px0, py] = plot.toPx(lo + i * w, h);
        const [px1, pyb] = plot.toPx(lo + (i + 1) * w, 0);
        const xc = lo + (i + 0.5) * w;
        const inside = xc >= d.mu - d.s && xc <= d.mu + d.s;
        const c0 = inside ? col.area() : col.bar();
        const gr = g.createLinearGradient(0, py, 0, pyb);
        gr.addColorStop(0, withAlpha(c0, theme.dark ? 0.7 : 0.55));
        gr.addColorStop(1, withAlpha(c0, theme.dark ? 0.45 : 0.35));
        g.fillStyle = gr;
        g.fillRect(px0 + 1, py, px1 - px0 - 2, pyb - py);
        g.strokeStyle = c0;
        g.lineWidth = 1;
        g.strokeRect(px0 + 1.5, py + 0.5, px1 - px0 - 3, pyb - py - 0.5);
      }
      curve(plot, (x) => pdf(x, MU.v, SG.v), col.f(), F(3, 2.6), k.draw);
      for (const sg of [-1, 1]) vline(plot, MU.v + sg * SG.v, 0, pdf(MU.v + sg * SG.v, MU.v, SG.v), withAlpha(theme.text, 0.35), 1.2, [3, 4], k.labels);
      for (const fv of falling) {
        const t = (now - fv.t0) / FALL_MS;
        if (t < 0 || t >= 1) continue;
        const yy = yMax * (1 - ease.inCubic(t)) * 0.95;
        dot(plot.px(fv.x), plot.py(yy), col.bar(), F(4.2, 3.6), 0.95);
      }
      if (!samples.length) {
        fpill(r.x + r.w / 2, r.y + r.h * 0.3, `\\c{m}{\\t{${say(L('„50 Werte ziehen“ – hier entsteht das Histogramm.', '“Draw 50 values” – the histogram builds up here.'))}}}`, { size: F(13, 11.5), alpha: k.labels, maxW: r.w - 40 });
      }
      fpill(r.x + 10, r.y + 18, `\\c{f}{N(${xn(d.mu)}; ${xn(d.s)}²)}  \\c{m}{n = ${Math.round(shownStats.n)}}`, { align: 'left', size: F(12.5, 11.5), alpha: k.panel });
      if (isWide() && r.w > 470) fpill(r.x + r.w - 10, r.y + 18, `\\c{m}{\\t{${say(L('Höhe = rel. Häufigkeit : Klassenbreite', 'height = rel. frequency : class width'))}}}`, { align: 'right', size: F(11, 10.5), alpha: k.labels });
      plot.end();
    }
    function drawSamples(count: number): void {
      const d = dist();
      const now = performance.now();
      const fresh: number[] = [];
      for (let i = 0; i < count; i++) fresh.push(normalSample(rnd, d.mu, d.s));
      samples = samples.concat(fresh);
      if (!reduced()) {
        const show = count <= 60 ? fresh : fresh.filter((_, i) => i % Math.ceil(count / 60) === 0);
        const span = count <= 60 ? 900 : 700;
        falling = falling.filter((fv) => now - fv.t0 < FALL_MS).concat(show.map((x, i) => ({ x, t0: now + (i / show.length) * span })));
      }
      updateReadouts();
      ctx.requestRender();
    }
    function clearSamples(): void {
      samples = [];
      falling = [];
      shownCounts = [];
      shownStats = { n: 0, mean: 0, sd: 0 };
      rngSeed += 1;
      rnd = seededRandom(rngSeed);
      updateReadouts();
      ctx.requestRender();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    interface Row {
      src: string;
      color?: string;
      size?: number;
      weight?: number;
      gap?: number;
      at?: number;
    }
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: Row[], right?: string): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const boxes = rows.map((r) => fit(r.src, maxW, r.size ?? F(13.5, 12.5), r.color ?? th().text, r.weight ?? 600));
      const h = 38 + boxes.reduce((s, b, i) => s + rowH(b) + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 38;
      boxes.forEach((b, i) => {
        const a = rows[i]!.at ?? clamp01(k.stagger * (rows.length + 2) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        b.draw(g, R.x + pad + (1 - ease.outCubic(a)) * 10, y + b.asc);
        g.restore();
        y += rowH(b) + (rows[i]!.gap ?? 8);
      });
      return h;
    }

    function headSrc(): string {
      const d = dist();
      if (sit() === 'iq') return `\\c{m}{\\t{IQ:}} μ = 100, σ = 15`;
      if (sit() === 'fill') return `\\c{m}{\\t{${say(L('Abfüllung', 'Filling'))}:}} μ = 500 ${M}, σ = 4 ${M}`;
      return `X \\t{~} N(μ = ${fmt.num(d.mu, 1)}; σ = ${fmt.num(d.s, 1)})`;
    }

    /** Wahrscheinlichkeit mit Rechnung. */
    function probCard(k: Intro): CardFn {
      return (R, measure) => {
        const d = dist();
        const z = (x: number) => fmt.num(zScore(x, d.mu, d.s), 2);
        const rows: Row[] = [{ src: headSrc(), size: F(13, 12), gap: 10 }];
        const val = `\\c{A}{${Q(p4(PV.v))}}`;
        const tp = typ();
        if (tp === 'le') {
          rows.push({ src: `\\c{A}{P(X ≤ \\c{b}{${xn(d.b)}})} = Φ(\\c{b}{${xn(d.b)}})` });
          rows.push({ src: `= Φ(${Q(z(d.b))}) ≈ ${val}`, gap: 10 });
        } else if (tp === 'ge') {
          rows.push({ src: `\\c{A}{P(X ≥ \\c{a}{${xn(d.a)}})} = 1 − Φ(\\c{a}{${xn(d.a)}})` });
          rows.push({ src: `= 1 − Φ(${Q(z(d.a))}) ≈ ${val}`, gap: 10 });
        } else if (tp === 'eq') {
          const h1 = d.s * 0.1;
          const h2 = d.s * 0.01;
          rows.push({ src: `\\c{A}{P(X = \\c{a}{${xn(d.a)}})} = \\c{A}{${Q('0')}}`, size: F(14.5, 13.5) });
          rows.push({ src: `\\c{m}{\\t{${say(L('Eine Strecke hat keine Fläche:', 'A line has no area:'))}}}`, size: F(12, 11), gap: 6 });
          rows.push({ src: `P(${xn(d.a)} − ${fmt.num(h1, 3)} ≤ X ≤ ${xn(d.a)} + ${fmt.num(h1, 3)}) ≈ ${Q(fmt.num(prob(d.a - h1, d.a + h1, d.mu, d.s), 4))}`, size: F(12.5, 11.5), gap: 6 });
          rows.push({ src: `P(${xn(d.a)} − ${fmt.num(h2, 4)} ≤ X ≤ ${xn(d.a)} + ${fmt.num(h2, 4)}) ≈ ${Q(fmt.num(prob(d.a - h2, d.a + h2, d.mu, d.s), 5))}`, size: F(12.5, 11.5), gap: 10 });
        } else {
          const lo = Math.min(d.a, d.b);
          const hi = Math.max(d.a, d.b);
          rows.push({ src: `\\c{A}{P(\\c{a}{${xn(lo)}} ≤ X ≤ \\c{b}{${xn(hi)}})} = Φ(\\c{b}{${xn(hi)}}) − Φ(\\c{a}{${xn(lo)}})` });
          rows.push({ src: `≈ ${Q(p4(cdf(hi, d.mu, d.s)))} − ${Q(p4(cdf(lo, d.mu, d.s)))} ≈ ${val}`, gap: 10 });
        }
        if (tp !== 'eq') rows.push({ src: `\\c{m}{\\t{${say(L('Fläche', 'Area'))}} ≈} \\c{A}{\\b{${Q(pct(PV.v))}}}`, size: F(15, 14) });
        return formulaCard(R, measure, k, say(L('Wahrscheinlichkeit = Fläche', 'Probability = area')), col.area(), rows);
      };
    }

    /** Standardisieren: z-Werte und gleiche Fläche. */
    function stdCard(k: Intro): CardFn {
      return (R, measure) => {
        const d = dist();
        const z = (x: number) => Q(fmt.num(zScore(x, d.mu, d.s), 2));
        const zf = (x: number, c: string, name: string) => `\\c{${c}}{${name}} = \\f{${xn(x)} − ${xn(d.mu)}}{${xn(d.s)}} = ${z(x)}`;
        const tp = typ();
        const rows: Row[] = [{ src: `z = \\f{x − μ}{σ}  ⇒  Z \\t{~} N(0; 1)`, size: F(14, 13), gap: 10 }];
        if (tp === 'le') rows.push({ src: zf(d.b, 'b', 'z') });
        else if (tp === 'ge' || tp === 'eq') rows.push({ src: zf(d.a, 'a', 'z') });
        else {
          rows.push({ src: zf(Math.min(d.a, d.b), 'a', 'z_1'), gap: 6 });
          rows.push({ src: zf(Math.max(d.a, d.b), 'b', 'z_2') });
        }
        rows.push({ src: `\\c{m}{\\t{${say(L('Verschieben um μ, stauchen mit σ:', 'Shift by μ, squeeze by σ:'))}}}`, size: F(12, 11), gap: 4 });
        rows.push({ src: `\\c{m}{\\t{${say(L('Die Fläche bleibt gleich groß.', 'The area stays the same.'))}}}`, size: F(12, 11) });
        return formulaCard(R, measure, k, say(L('Standardisieren', 'Standardising')), col.area(), rows, `\\c{A}{${Q(pct(PV.v))}}`);
      };
    }

    function propCard(k: Intro): CardFn {
      return (R, measure) => {
        const s = dist().s;
        const mu = dist().mu;
        const rows: Row[] = [
          { src: `\\t{${say(L('Hochpunkt', 'Maximum'))}:} φ(μ) = \\f{1}{σ\\r{2π}} ≈ \\c{f}{${fmt.num(pdfMax(s), 3)}}`, gap: 8 },
          { src: `\\c{r}{\\t{${say(L('Wendestellen', 'Inflection points'))}:} x = μ ± σ = ${xn(mu - s)}; ${xn(mu + s)}}`, gap: 6 },
          { src: `\\c{m}{\\t{${say(L('Wendetangenten: Nullstellen bei', 'Inflection tangents: roots at'))}} μ ± 2σ}`, size: F(12, 11), gap: 8 },
          { src: `\\t{${say(L('symmetrisch zu', 'symmetric about'))}} x = μ;  \\t{${say(L('Gesamtfläche', 'total area'))}} = \\c{f}{1}`, size: F(13, 12) },
        ];
        return formulaCard(R, measure, k, say(L('Eigenschaften der Glocke', 'Properties of the bell')), col.f(), rows);
      };
    }

    function rulesCard(k: Intro, hitOf: (kk: number) => boolean): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        const lh = F(25, 23);
        const h = 38 + 3 * lh + 54;
        if (measure) return h;
        card({ ...R, h }, col.rule());
        cardTitle(R, say(L('Sigma-Regeln', 'Sigma rules')), col.rule());
        const fs = F(13.5, 12.5);
        for (let kk = 1; kk <= 3; kk++) {
          const y = R.y + 36 + (kk - 1) * lh;
          const a = ease.outCubic(clamp01(k.stagger * 5 - kk + 1));
          g.save();
          g.globalAlpha *= a;
          const hit = hitOf(kk);
          if (hit) {
            g.fillStyle = withAlpha(col.rule(), theme.dark ? 0.22 : 0.14);
            roundRect(g, R.x + pad - 6, y, R.w - 2 * pad + 12, lh - 3, 6);
            g.fill();
          }
          const kk1 = kk === 1 ? '' : String(kk);
          const b1 = fit(`P(μ − ${kk1}σ ≤ X ≤ μ + ${kk1}σ)`, (R.w - 2 * pad) * 0.68, fs, hit ? col.rule() : theme.text);
          b1.draw(g, R.x + pad, y + lh / 2 + (b1.asc - b1.desc) / 2 - 1);
          const b2 = formula(g, `≈ ${fmt.num(sigmaRule(kk) * 100, 1)} %`, fstyle(fs, hit ? col.rule() : theme.text, 750));
          b2.draw(g, R.x + R.w - pad - b2.w, y + lh / 2 + (b2.asc - b2.desc) / 2 - 1);
          g.restore();
        }
        const y = R.y + 36 + 3 * lh + 8;
        const b = fit('φ(x) = \\f{1}{σ\\r{2π}} · e^{−\\f{(x − μ)²}{2σ²}}', R.w - 2 * pad, F(14, 13));
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        b.draw(g, R.x + pad, y + b.asc + 4);
        g.restore();
        return h;
      };
    }

    /** Umkehrung: Rechenweg. */
    function quantCard(k: Intro): CardFn {
      return (R, measure) => {
        const d = dist();
        const q = quantile(qt(), p.qp / 100, d.mu, d.s);
        const pq = fmt.num(p.qp / 100, 3);
        const phi = fmt.num(q.phi, 4);
        const zS = Q(fmt.num(q.z, 4));
        const rows: Row[] = [{ src: headSrc(), size: F(13, 12), gap: 10 }];
        if (qt() === 'le') rows.push({ src: `① P(X ≤ x) = ${pq}  ⇔  Φ(z) = \\c{q}{${phi}}` });
        else if (qt() === 'ge') rows.push({ src: `① 1 − Φ(z) = ${pq}  ⇔  Φ(z) = \\c{q}{${phi}}` });
        else rows.push({ src: `① 2Φ(z) − 1 = ${pq}  ⇔  Φ(z) = \\c{q}{${phi}}` });
        rows.push({ src: `② z = Φ^{−1}(${phi}) ≈ \\c{q}{${zS}}  \\c{m}{(\\t{${say(L('Tabelle rückwärts', 'table backwards'))}})}` });
        if (qt() === 'mid') {
          const c = q.z * d.s;
          rows.push({ src: `③ c = z · σ ≈ ${Q(fmt.num(c, 2))}${d.unit ? ` ${M}` : ''}` });
          rows.push({ src: `\\c{q}{[μ − c; μ + c] ≈ [${Q(fmt.num(q.lo, 2))}; ${Q(fmt.num(q.hi, 2))}]}`, size: F(14.5, 13.5), weight: 700 });
        } else {
          const x = qt() === 'le' ? q.hi : q.lo;
          const op = !p.show ? '+' : q.z < 0 ? '−' : '+';
          rows.push({ src: `③ x = μ + z · σ = ${xn(d.mu)} ${op} ${Q(fmt.num(Math.abs(q.z), 4))} · ${xn(d.s)}` });
          rows.push({ src: `\\c{q}{x ≈ \\b{${Q(fmt.num(x, 2))}}${d.unit ? ` ${M}` : ''}}`, size: F(15, 14), weight: 700 });
        }
        return formulaCard(R, measure, k, say(L('Rückwärts rechnen', 'Working backwards')), col.q(), rows);
      };
    }

    /** z-Tabelle rückwärts lesen: Φ(z) um den gesuchten Wert herum. */
    function tableCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        const rows = 7;
        const lh = F(22, 21);
        const h = 38 + 22 + rows * lh + 10;
        if (measure) return h;
        const d = dist();
        const q = quantile(qt(), p.qp / 100, d.mu, d.s);
        const zc = Math.floor(q.z * 100) / 100;
        const zs = Array.from({ length: rows }, (_, i) => zc + (i - 3) * 0.01);
        card({ ...R, h }, col.q());
        cardTitle(R, say(L('z-Tabelle rückwärts lesen', 'Reading the z table backwards')), col.q(), p.show ? `\\c{q}{Φ(z) = ${fmt.num(q.phi, 4)}}` : undefined);
        const x0 = R.x + pad;
        const cz = x0 + 8;
        const cphi = x0 + (R.w - 2 * pad) * 0.42;
        const yH = R.y + 46;
        g.font = `700 ${F(12, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText('z', cz, yH);
        g.fillText('Φ(z)', cphi, yH);
        g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x0, yH + 11);
        g.lineTo(R.x + R.w - pad, yH + 11);
        g.stroke();
        const yRow = (i: number) => yH + 22 + i * lh;
        zs.forEach((z, i) => {
          const a = ease.outCubic(clamp01(k.stagger * (rows + 2) - i));
          const near = p.show && (i === 3 || i === 4);
          g.save();
          g.globalAlpha *= a;
          if (near) {
            g.fillStyle = withAlpha(col.q(), theme.dark ? 0.16 : 0.1);
            roundRect(g, x0 - 4, yRow(i) - lh / 2 + 2, R.w - 2 * pad + 8, lh - 4, 6);
            g.fill();
          }
          g.font = `${near ? 750 : 600} ${F(13, 12)}px ${theme.font}`;
          g.fillStyle = near ? th().text : withAlpha(th().text, 0.85);
          g.fillText(fmt.fixed(z, 2), cz, yRow(i));
          g.fillText(fmt.fixed(cdf(z, 0, 1), 4), cphi, yRow(i));
          g.restore();
        });
        // gesuchter Wert zwischen den Zeilen: Marke rechts neben der Φ-Spalte
        if (p.show) {
          const frac = clamp01((q.z - zc) / 0.01);
          const yy = lerp(yRow(3), yRow(4), frac);
          const xr = R.x + R.w - pad;
          g.font = `750 ${F(13, 12)}px ${theme.font}`;
          const xs = cphi + g.measureText('0,0000').width + 10;
          const a = ease.outCubic(k.stagger);
          g.save();
          g.globalAlpha *= a;
          g.strokeStyle = col.q();
          g.lineWidth = 1.8;
          g.setLineDash([4, 3]);
          g.beginPath();
          g.moveTo(xs, yy);
          g.lineTo(xr - 8, yy);
          g.stroke();
          g.setLineDash([]);
          g.fillStyle = col.q();
          g.beginPath();
          g.moveTo(xs - 2, yy);
          g.lineTo(xs + 6, yy - 5);
          g.lineTo(xs + 6, yy + 5);
          g.closePath();
          g.fill();
          g.restore();
          const zsrc = `\\c{q}{z ≈ ${fmt.num(q.z, 3)}}`;
          if (xr - xs > pillW(zsrc, F(11.5, 11)) + 14) fpill(xr, yy + (frac < 0.5 ? 13 : -13), zsrc, { align: 'right', size: F(11.5, 11), alpha: a, border: withAlpha(col.q(), 0.6) });
        }
        return h;
      };
    }

    /** Vergleich: Anteile im Toleranzbereich mit Balken. */
    function cmpCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        const lh = F(58, 54);
        const h = 38 + 2 * lh + 34;
        if (measure) return h;
        card({ ...R, h }, col.tol());
        cardTitle(R, say(L('Anteil im Toleranzbereich', 'Share within tolerance')), col.tol(), `\\c{t}{${fmt.num(Math.min(p.tl, p.tu), 1)} … ${fmt.num(Math.max(p.tl, p.tu), 1)} ${M}}`);
        const ta = tolerance(p.m1, p.s1, p.tl, p.tu);
        const tb = tolerance(p.m2, p.s2, p.tl, p.tu);
        const rowsD: [string, string, number, number, number, number][] = [
          ['A', 'P', p.m1, p.s1, I1.v, ta.reject],
          ['B', 'R', p.m2, p.s2, I2.v, tb.reject],
        ];
        rowsD.forEach(([name, key, m, s, share, rej], i) => {
          const y = R.y + 40 + i * lh;
          const c = i === 0 ? col.A() : col.B();
          const a = ease.outCubic(clamp01(k.stagger * 4 - i));
          g.save();
          g.globalAlpha *= a;
          const head = fit(`\\c{${key}}{\\b{${name}}}: N(${fmt.num(m, 1)}; ${fmt.num(s, 1)}²)   \\c{${key}}{\\b{${Q(pct(share))}}}`, R.w - 2 * pad, F(13.5, 12.5));
          head.draw(g, R.x + pad, y + head.asc);
          const by = y + head.asc + head.desc + 6;
          const bw = R.w - 2 * pad;
          g.fillStyle = theme.dark ? '#222b39' : '#eef1f5';
          roundRect(g, R.x + pad, by, bw, 10, 5);
          g.fill();
          if (p.show) {
            const gr = g.createLinearGradient(R.x + pad, 0, R.x + pad + bw, 0);
            gr.addColorStop(0, mixColor(c, '#ffffff', 0.25));
            gr.addColorStop(1, c);
            g.fillStyle = gr;
            roundRect(g, R.x + pad, by, Math.max(6, bw * clamp01(share)), 10, 5);
            g.fill();
          }
          const sub = formula(g, `\\c{m}{\\t{${say(L('Ausschuss', 'Rejects'))}} ≈ ${Q(fmt.num(Math.round(rej * 1000), 0))} \\t{${say(L('von 1000', 'per 1000'))}}}`, fstyle(F(12, 11), theme.muted, 600));
          sub.draw(g, R.x + pad, by + 14 + sub.asc);
          g.restore();
        });
        const better = ta.inside > tb.inside + 1e-9 ? 'A' : tb.inside > ta.inside + 1e-9 ? 'B' : null;
        const verdict = !p.show
          ? `\\c{m}{\\t{${say(L('Welche Anlage hält die Toleranz besser ein?', 'Which machine keeps the tolerance better?'))}}}`
          : better
            ? `\\c{t}{✓ \\t{${say(L(`Anlage ${better} hält die Toleranz besser ein.`, `Machine ${better} keeps the tolerance better.`))}}}`
            : `\\c{t}{\\t{${say(L('Beide gleich gut.', 'Both equally good.'))}}}`;
        const vb = fit(verdict, R.w - 2 * pad, F(13, 12), th().text, 700);
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        vb.draw(g, R.x + pad, R.y + h - 16);
        g.restore();
        return h;
      };
    }

    /** Vergleich: Rechnung mit z-Werten. */
    function cmpWhyCard(k: Intro): CardFn {
      return (R, measure) => {
        const lo = Math.min(p.tl, p.tu);
        const hi = Math.max(p.tl, p.tu);
        const row = (key: string, name: string, m: number, s: number): Row => {
          const z1 = (lo - m) / s;
          const z2 = (hi - m) / s;
          return { src: `\\c{${key}}{${name}}: Φ(${Q(fmt.num(z2, 2))}) − Φ(${Q(fmt.num(z1, 2))}) ≈ \\c{${key}}{${Q(p4(tolerance(m, s, lo, hi).inside))}}`, gap: 8 };
        };
        const sMax = maxSigmaFor(lo, hi, 0.99);
        const rows: Row[] = [
          { src: `P(${fmt.num(lo, 1)} ≤ X ≤ ${fmt.num(hi, 1)}) = Φ(z_2) − Φ(z_1)`, size: F(13, 12), gap: 8 },
          row('P', 'A', p.m1, p.s1),
          row('R', 'B', p.m2, p.s2),
          { src: `\\c{m}{\\t{${say(L('Mittig eingestellt reicht für 99 %:', 'Centred, 99 % needs'))}} σ ≤ ${fmt.num(sMax, 2)} ${M}}`, size: F(12, 11) },
        ];
        return formulaCard(R, measure, k, say(L('Rechnung mit z-Werten', 'Calculation with z values')), col.tol(), rows);
      };
    }

    function binomCard(k: Intro): CardFn {
      return (R, measure) => {
        const n = p.bn;
        const kk = Math.min(p.bk, n);
        const { mu, sigma } = binomMoments(n, p.bp);
        const ex = binomCdf(n, p.bp, kk);
        const ap = normalApproxCdf(n, p.bp, kk, p.cc);
        const other = normalApproxCdf(n, p.bp, kk, !p.cc);
        const ok = laplaceOk(n, p.bp);
        const nMin = laplaceMinN(p.bp);
        const zc = (kk + (p.cc ? 0.5 : 0) - mu) / sigma;
        const rows: Row[] = [
          { src: `X \\t{~} \\c{a}{B(${n}; ${fmt.num(p.bp, 2)})}:  μ = n · p = ${fmt.num(mu, 2)}`, gap: 6 },
          { src: `σ = \\r{n · p · (1 − p)} ≈ ${fmt.num(sigma, 3)}`, gap: 10 },
          { src: `\\c{a}{P(X ≤ ${kk})} = ${Q(p4(ex))}   \\c{m}{(\\t{${say(L('exakt', 'exact'))}})}`, gap: 6 },
          { src: `≈ \\c{f}{Φ(\\f{${p.cc ? `${kk} + 0,5` : String(kk)} − ${fmt.num(mu, 2)}}{${fmt.num(sigma, 3)}})} = Φ(${fmt.num(zc, 2)}) ≈ \\c{A}{${Q(p4(ap))}}`, gap: 8 },
          { src: `\\c{m}{\\t{${say(L('Abweichung', 'difference'))}}: ${Q(Math.abs(ex - ap) < 5e-5 ? `< ${fmt.num(0.0001, 4)}` : fmt.num(Math.abs(ex - ap), 4))};  \\t{${p.cc ? say(L('ohne Korrektur', 'without correction')) : say(L('mit Korrektur', 'with correction'))}}: ${Q(p4(other))}}`, size: F(12, 11), gap: 8 },
          ok
            ? { src: `\\c{r}{✓ \\t{${say(L('Laplace-Bedingung σ > 3 erfüllt', 'Laplace condition σ > 3 holds'))}}}`, size: F(12.5, 11.5) }
            : { src: `\\c{b}{✗ \\t{${say(L(`σ ≤ 3: erst ab n = ${nMin} ist σ > 3`, `σ ≤ 3: only from n = ${nMin} is σ > 3`))}}}`, size: F(12.5, 11.5) },
        ];
        return formulaCard(R, measure, k, say(L('Binomialverteilung und Normalverteilung', 'Binomial and normal distribution')), col.bar(), rows);
      };
    }

    function errCard(k: Intro): CardFn {
      return (R, measure) => {
        const hh = clamp(R.h, 150, F(220, 200));
        if (measure) return R.h < 150 ? 9999 : hh;
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        card({ ...R, h: hh });
        cardTitle(R, say(L('Größter Näherungsfehler für n = 5 … 200', 'Largest error for n = 5 … 200')), theme.muted);
        const errs = errCurve(p.bp, p.cc);
        const top = R.y + 44;
        const bottom = R.y + hh - 24;
        const x0 = R.x + pad + 36;
        const x1 = R.x + R.w - pad;
        const hi = Math.max(0.02, ...errs) * 1.1;
        const X = (n: number) => x0 + ((n - 5) / 195) * (x1 - x0);
        const Y = (v: number) => bottom - (v / hi) * (bottom - top);
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        g.strokeStyle = theme.gridMinor;
        g.lineWidth = 1;
        g.font = `600 ${F(11, 10.5)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        for (const v of [0, hi / 2, hi]) {
          g.beginPath();
          g.moveTo(x0, Y(v));
          g.lineTo(x1, Y(v));
          g.stroke();
          g.textAlign = 'right';
          g.textBaseline = 'middle';
          g.fillText(fmt.num(v, 3), x0 - 5, Y(v));
        }
        g.textAlign = 'center';
        g.textBaseline = 'top';
        for (const n of [5, 50, 100, 150, 200]) g.fillText(String(n), X(n), bottom + 5);
        const nLap = 9 / (p.bp * (1 - p.bp));
        if (nLap <= 200) {
          const xl = X(Math.max(5, nLap));
          g.fillStyle = withAlpha(col.rule(), theme.dark ? 0.14 : 0.09);
          g.fillRect(xl, top, x1 - xl, bottom - top);
          g.strokeStyle = col.rule();
          g.setLineDash([4, 4]);
          g.beginPath();
          g.moveTo(xl, top);
          g.lineTo(xl, bottom);
          g.stroke();
          g.setLineDash([]);
          g.font = `700 ${F(11, 10.5)}px ${theme.font}`;
          g.fillStyle = col.rule();
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText('σ > 3', Math.min(xl + 5, x1 - 34), top + 9);
        }
        g.strokeStyle = col.b();
        g.lineWidth = 2;
        g.lineJoin = 'round';
        g.beginPath();
        const upto = Math.max(1, Math.round(errs.length * clamp01(k.draw)));
        errs.slice(0, upto).forEach((e, i) => {
          if (i === 0) g.moveTo(X(i + 5), Y(e));
          else g.lineTo(X(i + 5), Y(e));
        });
        g.stroke();
        g.restore();
        const cur = errs[p.bn - 5];
        if (cur !== undefined) dot(X(p.bn), Y(cur), col.b(), 4.5, k.labels);
        return hh;
      };
    }

    function sampleCard(k: Intro): CardFn {
      return (R, measure) => {
        const d = dist();
        const st1 = sampleStats(samples, d.mu - d.s, d.mu + d.s);
        const st2 = sampleStats(samples, d.mu - 2 * d.s, d.mu + 2 * d.s);
        const has = samples.length > 0;
        const rows: Row[] = [
          { src: `\\t{${say(L('Anzahl', 'size'))}}: n = ${Math.round(shownStats.n)}`, gap: 8 },
          { src: `\\t{${say(L('Mittelwert', 'mean'))}}: \\c{a}{x̄ ≈ ${has ? fmt.num(shownStats.mean, 2) : '–'}}   \\c{m}{(μ = ${xn(d.mu)})}`, gap: 8 },
          { src: `\\t{${say(L('Standardabweichung', 'standard deviation'))}}: \\c{a}{s ≈ ${has ? fmt.num(shownStats.sd, 2) : '–'}}   \\c{m}{(σ = ${xn(d.s)})}`, gap: 8 },
          { src: `\\t{${say(L('Anteil in', 'share in'))}} μ ± σ: \\c{A}{${has ? pct(st1.share) : '–'}}   \\c{m}{(${fmt.num(sigmaRule(1) * 100, 1)} %)}`, gap: 8 },
          { src: `\\t{${say(L('Anteil in', 'share in'))}} μ ± 2σ: \\c{A}{${has ? pct(st2.share) : '–'}}   \\c{m}{(${fmt.num(sigmaRule(2) * 100, 1)} %)}` },
        ];
        return formulaCard(R, measure, k, say(L('Stichprobe', 'Sample')), col.bar(), rows);
      };
    }

    /** Karte mit umbrochenem Text (Hinweis, Stolperstein). */
    function textCard(k: Intro, title: string, accent: string, body: string): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const pad = F(14, 12);
        const size = F(12.5, 11.5);
        const lh = size * 1.38;
        const font = `500 ${size}px ${th().font}`;
        g.font = font;
        const lines: string[] = [];
        let cur = '';
        for (const w of body.split(' ')) {
          const test = cur ? `${cur} ${w}` : w;
          if (g.measureText(test).width > R.w - 2 * pad && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
        const h = 38 + lines.length * lh + 8;
        if (measure) return h;
        card({ ...R, h }, accent);
        cardTitle(R, title, accent);
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        g.font = font;
        g.fillStyle = th().muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        lines.forEach((ln, i) => g.fillText(ln, R.x + pad, R.y + 38 + lh / 2 + i * lh));
        g.restore();
        return h;
      };
    }
    function hintCard(k: Intro): CardFn {
      const m = mode();
      if (m === 'cmp')
        return textCard(k, say(L('Worauf kommt es an?', 'What matters?')), col.tol(), say(L('Ein kleines σ allein reicht nicht: Die Glocke muss auch mittig im Toleranzbereich sitzen. Ziehe die Hochpunkte A und B oder die grünen Grenzen.', 'A small σ alone is not enough: the bell must also sit in the middle of the tolerance range. Drag the peaks A and B or the green limits.')));
      if (typ() === 'eq')
        return textCard(k, say(L('Warum 0?', 'Why 0?')), col.area(), say(L('Bei einer stetigen Zufallsgröße zählt nur Fläche. Über einem einzelnen Punkt liegt keine Fläche – je schmaler das Intervall um a, desto kleiner die Wahrscheinlichkeit.', 'For a continuous random variable only area counts. There is no area above a single point – the narrower the interval around a, the smaller the probability.')));
      const tail = p.cdf
        ? L(' Ziehe a und b; im Φ-Diagramm wächst Φ(b) − Φ(a) als Balken mit.', ' Drag a and b; in the Φ chart, Φ(b) − Φ(a) grows as a bar.')
        : L(' Ziehe a und b oder drücke „μ ± σ“.', ' Drag a and b or press “μ ± σ”.');
      return textCard(k, say(L('Ablesen', 'Reading off')), col.area(), say(L('Es zählt die Fläche, nicht die Höhe der Kurve.', 'The area counts, not the height of the curve.')) + say(tail));
    }

    function cardsFor(k: Intro): CardFn[] {
      const m = mode();
      if (m === 'quant') return [quantCard(k), tableCard(k)];
      if (m === 'cmp') return [cmpCard(k), cmpWhyCard(k), hintCard(k)];
      if (m === 'binom') return [binomCard(k), errCard(k)];
      if (m === 'sample') return [sampleCard(k), rulesCard(k, () => false)];
      const d = dist();
      const { lo, hi } = boundsOf(d.a, d.b);
      const hitOf = (kk: number) => typ() === 'between' && Math.abs(lo - (d.mu - kk * d.s)) < 1e-6 && Math.abs(hi - (d.mu + kk * d.s)) < 1e-6;
      const list: CardFn[] = [probCard(k)];
      if (p.zs) list.push(stdCard(k));
      if (p.prop) list.push(propCard(k));
      list.push(rulesCard(k, hitOf));
      list.push(hintCard(k));
      return list;
    }

    function drawColumn(Cr: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const list = cardsFor(k);
      const gap = F(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !isWide() && Cr.w >= 600;
      const place = (cf: CardFn, R: Rect, i: number) => {
        const hh = cf(R, true);
        if (hh <= 0 || hh > R.h + 1) return -1;
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        cf({ ...R, h: Math.min(hh, R.h) }, false);
        g.restore();
        return hh;
      };
      if (two) {
        const cw = (Cr.w - gap) / 2;
        let yL = Cr.y;
        let yR = Cr.y;
        list.forEach((cf, i) => {
          const leftCol = yL <= yR;
          const x = leftCol ? Cr.x : Cr.x + cw + gap;
          const y = leftCol ? yL : yR;
          const hh = place(cf, { x, y, w: cw, h: Cr.y + Cr.h - y }, i);
          if (hh < 0) return;
          if (leftCol) yL += hh + gap;
          else yR += hh + gap;
        });
        return;
      }
      let y = Cr.y;
      list.forEach((cf, i) => {
        const hh = place(cf, { x: Cr.x, y, w: Cr.w, h: Cr.y + Cr.h - y }, i);
        if (hh >= 0) y += hh + gap;
      });
    }

    /* ---------- Ergebnisse ---------- */
    const v = (s: string) => `<var>${s}</var>`;
    function updateReadouts(): void {
      for (const key of ['p', 'z', 'q', 'cmp', 'bin', 'smp']) ctx.readout(key, null);
      const d = dist();
      const m = mode();
      if (m === 'area') {
        const pv = P();
        const tp = typ();
        const z = (x: number) => fmt.num(zScore(x, d.mu, d.s), 2);
        if (tp === 'le') {
          ctx.readout('p', { html: `P(${v('X')} ≤ ${xUnit(d.b)}) = Φ(${z(d.b)}) ≈ <strong>${p4(pv)}</strong> ≈ ${pct(pv)}` });
          ctx.readout('z', { html: `${v('z')} = ${z(d.b)}` });
        } else if (tp === 'ge') {
          ctx.readout('p', { html: `P(${v('X')} ≥ ${xUnit(d.a)}) = 1 − Φ(${z(d.a)}) ≈ <strong>${p4(pv)}</strong> ≈ ${pct(pv)}` });
          ctx.readout('z', { html: `${v('z')} = ${z(d.a)}` });
        } else if (tp === 'eq') {
          ctx.readout('p', { html: `P(${v('X')} = ${xUnit(d.a)}) = <strong>0</strong>` });
          ctx.readout('z', { html: `${v('z')} = ${z(d.a)}` });
        } else {
          const lo = Math.min(d.a, d.b);
          const hi = Math.max(d.a, d.b);
          ctx.readout('p', { html: `P(${xn(lo)} ≤ ${v('X')} ≤ ${xUnit(hi)}) = Φ(${z(hi)}) − Φ(${z(lo)}) ≈ <strong>${p4(pv)}</strong> ≈ ${pct(pv)}` });
          ctx.readout('z', { html: `${v('z')}<sub>1</sub> = ${z(lo)}, ${v('z')}<sub>2</sub> = ${z(hi)}` });
        }
      } else if (m === 'quant') {
        const q = quantile(qt(), p.qp / 100, d.mu, d.s);
        const pq = fmt.num(p.qp, 1);
        const zz = fmt.num(q.z, 4);
        if (qt() === 'mid') ctx.readout('q', { html: `P(μ − ${v('c')} ≤ ${v('X')} ≤ μ + ${v('c')}) = ${pq} % ⇒ ${v('z')} = Φ<sup>−1</sup>(${fmt.num(q.phi, 4)}) ≈ ${zz} ⇒ [${fmt.num(q.lo, 2)}; ${fmt.num(q.hi, 2)}]${d.unit}` });
        else {
          const x = qt() === 'le' ? q.hi : q.lo;
          ctx.readout('q', { html: `P(${v('X')} ${qt() === 'le' ? '≤' : '≥'} ${v('x')}) = ${pq} % ⇒ ${v('z')} = Φ<sup>−1</sup>(${fmt.num(q.phi, 4)}) ≈ ${zz} ⇒ ${v('x')} = ${xn(d.mu)} ${q.z < 0 ? '−' : '+'} ${fmt.num(Math.abs(q.z), 4)} · ${xn(d.s)} ≈ <strong>${fmt.num(x, 2)}${d.unit}</strong>` });
        }
      } else if (m === 'cmp') {
        const ta = tolerance(p.m1, p.s1, p.tl, p.tu);
        const tb = tolerance(p.m2, p.s2, p.tl, p.tu);
        ctx.readout('cmp', { html: `A: ≈ <strong>${p4(ta.inside)}</strong> (${pct(ta.inside)}) · B: ≈ <strong>${p4(tb.inside)}</strong> (${pct(tb.inside)})` });
      } else if (m === 'binom') {
        const kk = Math.min(p.bk, p.bn);
        const { mu, sigma } = binomMoments(p.bn, p.bp);
        ctx.readout('bin', { html: `μ = ${fmt.num(mu, 2)}, σ ≈ ${fmt.num(sigma, 3)}; P(${v('X')} ≤ ${kk}) = ${p4(binomCdf(p.bn, p.bp, kk))} (${say(L('exakt', 'exact'))}) ≈ ${p4(normalApproxCdf(p.bn, p.bp, kk, p.cc))} (${say(L('genähert', 'approximated'))})` });
      } else {
        const st = sampleStats(samples, d.mu - d.s, d.mu + d.s);
        ctx.readout('smp', samples.length ? { html: `${v('n')} = ${samples.length}: x̄ ≈ ${fmt.num(st.mean, 2)}, ${v('s')} ≈ ${fmt.num(st.sd, 2)}, ${say(L('Anteil in', 'share in'))} μ ± σ: ${pct(st.share)}` } : null);
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      for (const c of allChans) if (c.step(now, dt)) anim = true;
      if (intro !== null) anim = true;
      if (barTween.running) anim = true;
      // Stichprobe: Histogramm und Kennzahlen gleiten zu den Zielwerten
      if (mode() === 'sample') {
        const target = targetCounts(now);
        const kk = reduced() ? 1 : 1 - Math.exp(-dt * 10);
        shownCounts = target.map((tg, i) => {
          const c = shownCounts[i] ?? 0;
          if (Math.abs(tg - c) < 0.01) return tg;
          anim = true;
          return c + (tg - c) * kk;
        });
        const st = sampleStats(samples, 0, 0);
        const goal = { n: samples.length, mean: samples.length ? st.mean : 0, sd: samples.length ? st.sd : 0 };
        if (shownStats.n === 0 && goal.n > 0) shownStats = { ...goal, n: 0 };
        for (const key of ['n', 'mean', 'sd'] as const) {
          const diff = goal[key] - shownStats[key];
          if (Math.abs(diff) > 1e-3 * (1 + Math.abs(goal[key]))) {
            shownStats[key] += diff * kk;
            anim = true;
          } else shownStats[key] = goal[key];
        }
        if (falling.some((fv) => now - fv.t0 < FALL_MS)) anim = true;
      }
      const k = introState(now);
      let fadeIn = 1;
      if (fade !== null) {
        const t = (now - fade) / 520;
        if (t >= 1) fade = null;
        else {
          fadeIn = ease.outCubic(clamp01(t));
          anim = true;
        }
      }
      if (cardFade !== null) anim = true;
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      plotC.resize();
      g.save();
      g.globalAlpha = k.panel * fadeIn;
      g.translate(0, (1 - k.panel * fadeIn) * 10);
      const m = mode();
      if (m === 'area') {
        drawArea(k);
        if (R.cdf) drawCdf(R.cdf, k);
      } else if (m === 'quant') drawQuant(k);
      else if (m === 'cmp') drawCmp(k);
      else if (m === 'binom') drawBinom(k);
      else drawSample(k, now);
      g.restore();
      drawColumn(R.col, now, k);
      if (anim || dragging()) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retarget(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const d = dist();
      const [x0, x1] = xRangeOf();
      const targets: [Chan, number][] = [
        [MU, d.mu],
        [SG, d.s],
        [A, d.a],
        [B, d.b],
        [X0, x0],
        [X1, x1],
        [M1, p.m1],
        [S1, p.s1],
        [M2, p.m2],
        [S2, p.s2],
        [TL, p.tl],
        [TU, p.tu],
        [KB, Math.min(p.bk, p.bn)],
      ];
      targets.forEach(([c, val], i) => {
        if (instant) c.jump(val);
        else if (dragging()) c.follow(val, 0.04);
        else if (source === 'input') {
          if (Math.abs(c.goal - val) > 1e-12) c.follow(val, 0.14);
        } else if (Math.abs(c.goal - val) > 1e-12) c.glide(val, 800, i * 20, now);
      });
      const flags: [Chan, number, number][] = [
        [ZT, p.zs ? 1 : 0, 1300],
        [PROP, p.prop ? 1 : 0, 600],
      ];
      for (const [c, val, dur] of flags) {
        if (instant) c.jump(val);
        else if (c.goal !== val) c.glide(val, dur, 0, now);
      }
      // Zahlen zählen
      const counters: [Chan, number][] = [
        [PV, P()],
        [I1, tolerance(p.m1, p.s1, p.tl, p.tu).inside],
        [I2, tolerance(p.m2, p.s2, p.tl, p.tu).inside],
      ];
      for (const [c, val] of counters) {
        if (instant) c.jump(val);
        else if (dragging()) c.follow(val, 0.05);
        else if (Math.abs(c.goal - val) > 1e-12) c.glide(val, 750, 0, now, ease.outCubic);
      }
      // Umkehrung: Wahrscheinlichkeit gleitet (Grenze folgt)
      if (instant) QP.jump(p.qp);
      else if (dragging()) QP.follow(p.qp, 0.04);
      else if (QP.goal !== p.qp) QP.glide(p.qp, 700, 0, now);
    }

    /** „Grenze suchen“: Die Fläche wächst bzw. schrumpft von der Mitte aus, bis sie p erreicht. */
    function startFind(now: number): void {
      if (reduced()) {
        QP.jump(p.qp);
        return;
      }
      QP.jump(qt() === 'mid' ? 0.5 : 50);
      QP.glide(p.qp, FIND_MS, 250, now);
    }
    /** Einstieg: Zahlen zählen von 0 an. */
    function startIntro(now: number): void {
      if (reduced()) {
        intro = null;
        return;
      }
      intro = now;
      PV.jump(0);
      PV.glide(P(), 1100, 900, now, ease.outCubic);
      I1.jump(0);
      I2.jump(0);
      I1.glide(tolerance(p.m1, p.s1, p.tl, p.tu).inside, 1100, 900, now, ease.outCubic);
      I2.glide(tolerance(p.m2, p.s2, p.tl, p.tu).inside, 1100, 1050, now, ease.outCubic);
      if (mode() === 'quant') startFind(now + 600);
    }

    function setRule(kk: number): void {
      const d = dist();
      const lo = d.mu - kk * d.s;
      const hi = d.mu + kk * d.s;
      if (sit() === 'abs') ctx.set({ typ: 'between', a: Number(lo.toFixed(2)), b: Number(hi.toFixed(2)) });
      else if (sit() === 'iq') ctx.set({ typ: 'between', ia: lo, ib: hi });
      else ctx.set({ typ: 'between', fa: lo, fb: hi });
    }

    let prevMode: Mode = mode();
    return {
      update(changed, source) {
        const now = performance.now();
        const sitChanged = changed.has('sit') && source !== 'init';
        if (sitChanged) {
          // andere Größenordnung: Bild neu aufbauen statt gleiten
          const d = dist();
          const [x0, x1] = xRangeOf();
          MU.jump(d.mu);
          SG.jump(d.s);
          A.jump(d.a);
          B.jump(d.b);
          X0.jump(x0);
          X1.jump(x1);
          if (!reduced()) fade = now;
        }
        retarget(now, source);
        if (sitChanged) {
          PV.jump(P());
          QP.jump(p.qp);
        }
        if (source === 'init') startIntro(now);
        else {
          if (mode() !== prevMode && !reduced()) {
            fade = now;
            cardFade = now;
          }
          if (mode() === 'quant' && (mode() !== prevMode || changed.has('qt') || sitChanged || source === 'replace')) startFind(now);
          if (changed.has('typ') && !reduced()) cardFade = now;
        }
        // neue Verteilung → alte Stichprobe passt nicht mehr
        if (source !== 'init' && (changed.has('sit') || changed.has('mu') || changed.has('sg'))) clearSamples();
        if (changed.has('bn') || changed.has('bp')) {
          barsFrom = barsNow();
          barsTo = binomPmf(p.bn, p.bp);
          if (source === 'init' || reduced()) barsFrom = barsTo;
          else barTween.play();
          if (p.bk > p.bn && source === 'input') ctx.set({ bk: p.bn });
        }
        prevMode = mode();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'r1') setRule(1);
        else if (id === 'r2') setRule(2);
        else if (id === 'r3') setRule(3);
        else if (id === 'std') ctx.set({ zs: !p.zs });
        else if (id === 'find') {
          startFind(now);
          ctx.requestRender();
        } else if (id === 'ctr') {
          const c = half((Math.min(p.tl, p.tu) + Math.max(p.tl, p.tu)) / 2);
          ctx.set({ m1: clamp(c, 490, 510), m2: clamp(c, 490, 510) });
        } else if (id === 'kmu') ctx.set({ bk: Math.round(p.bn * p.bp) });
        else if (id === 'draw') drawSamples(50);
        else if (id === 'many') drawSamples(1000);
        else if (id === 'clear') clearSamples();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
