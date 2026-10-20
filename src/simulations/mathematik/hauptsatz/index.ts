import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  APPS,
  areaParts,
  DEFAULT_COEFFS,
  features,
  integralFn,
  mathFn,
  quotientTable,
  rangeOf,
  riemann,
  riemannBoxes,
  stripMean,
  stripRange,
  type AppKey,
  type Coeffs,
  type Features,
  type Fn,
  type FnKey,
  type RiemannKind,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Mode = 'area' | 'diff' | 'calc' | 'graph' | 'riem';
type Kind = 'math' | 'app';
type Bottom = 'I' | 'F' | 'R';
type Lng = 'de' | 'en';
const MODES: Mode[] = ['area', 'diff', 'calc', 'graph', 'riem'];
const bottomOf = (m: Mode): Bottom => (m === 'calc' ? 'F' : m === 'riem' ? 'R' : 'I');
const COEF_KEYS = ['lm', 'lt', 'k3', 'k2', 'k1', 'k0', 'sa', 'sb', 'ea', 'eb', 'ia', 'gm', 'gs', 's1', 's2', 'sj'] as const;
type CoefKey = (typeof COEF_KEYS)[number];
/** n-Werte beim „Verfeinern“. */
const REFINE_NS = [1, 2, 4, 8, 16, 32, 64];
/** Kleinste Streifenbreite beim „h gegen 0“. */
const H_MIN = 0.01;

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
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Texte und Einheiten einer Anwendung. */
interface AppMeta {
  title: Txt;
  /** Name der Variablen (t oder x) */
  v: string;
  uX: Txt;
  /** Name und Einheit der Änderungsrate */
  f: string;
  uF: Txt;
  /** Name und Einheit des Bestands */
  I: string;
  uI: Txt;
  fSrc: string;
  FSrc: string;
  rate: Txt;
  amount: Txt;
  /** Satz zur Deutung; {a}, {b}, {v} werden ersetzt */
  pos: Txt;
  neg: Txt;
  /** Hinweis zur Situation */
  note: Txt;
}

const APP_META: Record<AppKey, AppMeta> = {
  car: {
    title: L('Auto: Geschwindigkeit → Weg', 'Car: speed → distance'),
    v: 't',
    uX: L('s', 's'),
    f: 'v',
    uF: L('m/s', 'm/s'),
    I: 's',
    uI: L('m', 'm'),
    fSrc: 'v(t) = 3t \\c{m}{| 15 | 15 − 3(t − 20)}',
    FSrc: 's(t) = 1,5t² \\c{m}{| 37,5 + 15(t − 5) | …}',
    rate: L('Geschwindigkeit', 'speed'),
    amount: L('zurückgelegter Weg', 'distance travelled'),
    pos: L('Von t = {a} s bis {b} s fährt das Auto {v} m weit.', 'From t = {a} s to {b} s the car travels {v} m.'),
    neg: L('Rückwärts gerechnet (b < a): {v} m.', 'Counted backwards (b < a): {v} m.'),
    note: L('Anfahren mit 3 m/s², 15 s mit 15 m/s (54 km/h), Bremsen mit 3 m/s².', 'Starting off at 3 m/s², 15 s at 15 m/s (54 km/h), braking at 3 m/s².'),
  },
  lake: {
    title: L('Stausee: Zufluss → Wassermenge', 'Reservoir: inflow → amount of water'),
    v: 't',
    uX: L('Monate', 'months'),
    f: 'q',
    uF: L('Mio. m³/Monat', 'million m³/month'),
    I: 'V',
    uI: L('Mio. m³', 'million m³'),
    fSrc: 'q(t) = 3 · \\t{cos}(\\f{π}{6}t)',
    FSrc: 'V(t) = \\f{18}{π} · \\t{sin}(\\f{π}{6}t)',
    rate: L('Netto-Zufluss (Zufluss − Abfluss)', 'net inflow (inflow − outflow)'),
    amount: L('Änderung der Wassermenge', 'change in the amount of water'),
    pos: L('Von Monat {a} bis {b} nimmt die Wassermenge um {v} Mio. m³ zu.', 'From month {a} to {b} the amount of water grows by {v} million m³.'),
    neg: L('Von Monat {a} bis {b} nimmt die Wassermenge um {v} Mio. m³ ab.', 'From month {a} to {b} the amount of water falls by {v} million m³.'),
    note: L('Im Frühjahr fließt mehr zu als ab, im Sommer umgekehrt. Am meisten Wasser ist im See, wenn q das Vorzeichen von + nach − wechselt.', 'In spring more flows in than out, in summer the other way round. The lake is fullest when q changes sign from + to −.'),
  },
  solar: {
    title: L('Solaranlage: Leistung → Energie', 'Solar panels: power → energy'),
    v: 't',
    uX: L('h (Uhrzeit)', 'h (time of day)'),
    f: 'P',
    uF: L('kW', 'kW'),
    I: 'E',
    uI: L('kWh', 'kWh'),
    fSrc: 'P(t) = 4 · \\t{sin}(\\f{π}{12}(t − 6))  \\c{m}{(6 – 18 Uhr)}',
    FSrc: 'E(t) = \\f{48}{π}(1 − \\t{cos}(\\f{π}{12}(t − 6)))',
    rate: L('elektrische Leistung', 'electrical power'),
    amount: L('erzeugte Energie', 'energy produced'),
    pos: L('Zwischen {a} und {b} Uhr erzeugt die Anlage {v} kWh.', 'Between {a} and {b} o’clock the panels produce {v} kWh.'),
    neg: L('Rückwärts gerechnet (b < a): {v} kWh.', 'Counted backwards (b < a): {v} kWh.'),
    note: L('Sonniger Tag, höchstens 4 kW um 12 Uhr. Ein Haushalt braucht etwa 10 kWh pro Tag.', 'Sunny day, at most 4 kW at noon. A household uses about 10 kWh per day.'),
  },
  cost: {
    title: L('Grenzkosten → Gesamtkosten', 'Marginal cost → total cost'),
    v: 'x',
    uX: L('ME', 'units'),
    f: 'K′',
    uF: L('GE/ME', 'MU/unit'),
    I: 'K',
    uI: L('GE', 'MU'),
    fSrc: 'K′(x) = 0,3x² − 3x + 10',
    FSrc: 'K_v(x) = 0,1x³ − 1,5x² + 10x',
    rate: L('Grenzkosten', 'marginal cost'),
    amount: L('variable Kosten', 'variable cost'),
    pos: L('Die Produktion von {a} bis {b} ME verursacht {v} GE variable Kosten.', 'Producing from {a} to {b} units causes {v} MU of variable cost.'),
    neg: L('Rückwärts gerechnet (b < a): {v} GE.', 'Counted backwards (b < a): {v} MU.'),
    note: L('Gesamtkosten = Fixkosten + variable Kosten. Die Fixkosten sind die Konstante C. Am Minimum der Grenzkosten (x = 5) wechselt K die Krümmung.', 'Total cost = fixed cost + variable cost. The fixed cost is the constant C. At the minimum of the marginal cost (x = 5) K changes its curvature.'),
  },
  pop: {
    title: L('Neubaugebiet: Zuzugsrate → Einwohner', 'New district: growth rate → residents'),
    v: 't',
    uX: L('Jahre', 'years'),
    f: 'r',
    uF: L('Tsd./Jahr', 'thousand/year'),
    I: 'N',
    uI: L('Tsd.', 'thousand'),
    fSrc: 'r(t) = \\f{6 · \\t{e}^{−0,5(t − 10)}}{(1 + \\t{e}^{−0,5(t − 10)})²}',
    FSrc: 'N(t) = \\f{12}{1 + \\t{e}^{−0,5(t − 10)}}',
    rate: L('Wachstumsrate', 'growth rate'),
    amount: L('Zuwachs an Einwohnern', 'increase in residents'),
    pos: L('Von Jahr {a} bis {b} ziehen {v} Tausend Menschen zu.', 'From year {a} to {b}, {v} thousand people move in.'),
    neg: L('Rückwärts gerechnet (b < a): {v} Tausend.', 'Counted backwards (b < a): {v} thousand.'),
    note: L('Logistisches Wachstum bis 12 000 Einwohner. Die Rate ist im Jahr 10 am größten – dort hat die Einwohnerzahl ihren Wendepunkt.', 'Logistic growth up to 12,000 residents. The rate is largest in year 10 – there the number of residents has its point of inflection.'),
  },
  drug: {
    title: L('Medikament: Aufnahmerate → Menge', 'Medicine: absorption rate → amount'),
    v: 't',
    uX: L('h', 'h'),
    f: 'r',
    uF: L('mg/h', 'mg/h'),
    I: 'M',
    uI: L('mg', 'mg'),
    fSrc: 'r(t) = 40t · \\t{e}^{−0,5t}',
    FSrc: 'M(t) = −80t · \\t{e}^{−0,5t} − 160 · \\t{e}^{−0,5t}',
    rate: L('Aufnahmerate', 'absorption rate'),
    amount: L('aufgenommene Wirkstoffmenge', 'amount absorbed'),
    pos: L('Von t = {a} h bis {b} h nimmt der Körper {v} mg Wirkstoff auf.', 'From t = {a} h to {b} h the body absorbs {v} mg of the drug.'),
    neg: L('Rückwärts gerechnet (b < a): {v} mg.', 'Counted backwards (b < a): {v} mg.'),
    note: L('Tablette mit 160 mg Wirkstoff (vereinfachtes Modell). Nach 2 h ist die Rate am größten.', 'Tablet with 160 mg of active substance (simplified model). After 2 h the rate is largest.'),
  },
  rain: {
    title: L('Gewitter: Regenintensität → Regenmenge', 'Thunderstorm: rain intensity → rainfall'),
    v: 't',
    uX: L('h', 'h'),
    f: 'i',
    uF: L('mm/h', 'mm/h'),
    I: 'R',
    uI: L('mm', 'mm'),
    fSrc: 'i(t) = 10 · \\t{e}^{−\\f{(t − 3)²}{2}}',
    FSrc: 'R(t) = 10\\r{\\f{π}{2}} · \\t{erf}(\\f{t − 3}{\\r{2}})',
    rate: L('Regenintensität', 'rain intensity'),
    amount: L('Regenmenge', 'rainfall'),
    pos: L('Zwischen {a} h und {b} h fallen {v} mm Regen, also {v} Liter pro m².', 'Between {a} h and {b} h, {v} mm of rain fall, i.e. {v} litres per m².'),
    neg: L('Rückwärts gerechnet (b < a): {v} mm.', 'Counted backwards (b < a): {v} mm.'),
    note: L('Glockenförmiger Verlauf mit höchstens 10 mm/h. Die Stammfunktion ist nicht elementar (Fehlerfunktion erf).', 'Bell-shaped with at most 10 mm/h. The antiderivative is not elementary (error function erf).'),
  },
  breath: {
    title: L('Atmung: Luftstrom → Luftmenge', 'Breathing: air flow → volume'),
    v: 't',
    uX: L('s', 's'),
    f: 'v',
    uF: L('L/s', 'L/s'),
    I: 'V',
    uI: L('L', 'L'),
    fSrc: 'v(t) = 0,5 · \\t{sin}(\\f{2π}{5}t)',
    FSrc: 'V(t) = −\\f{1,25}{π} · \\t{cos}(\\f{2π}{5}t)',
    rate: L('Luftstrom (+ ein, − aus)', 'air flow (+ in, − out)'),
    amount: L('Luft in der Lunge (Änderung)', 'air in the lungs (change)'),
    pos: L('Von {a} s bis {b} s strömen {v} L Luft in die Lunge.', 'From {a} s to {b} s, {v} L of air flow into the lungs.'),
    neg: L('Von {a} s bis {b} s strömen {v} L Luft aus der Lunge.', 'From {a} s to {b} s, {v} L of air flow out of the lungs.'),
    note: L('Ein Atemzug dauert 5 s: 2,5 s einatmen, 2,5 s ausatmen. Nach einem ganzen Atemzug ist das Integral 0.', 'One breath lasts 5 s: 2.5 s in, 2.5 s out. After a full breath the integral is 0.'),
  },
};

/** Startwerte für a, x, h beim Wechsel der mathematischen Funktion. */
const FN_START: Record<FnKey, { a: number; x: number; h: number }> = {
  lin: { a: 0, x: 3, h: 0.8 },
  par: { a: -1, x: 2, h: 0.8 },
  sin: { a: 0, x: 3.14, h: 0.6 },
  cos: { a: 0, x: 1.57, h: 0.6 },
  exp: { a: -2, x: 1.5, h: 0.8 },
  inv: { a: 1, x: 2.72, h: 0.5 },
  gauss: { a: -2, x: 1, h: 0.5 },
  step: { a: -2, x: 3, h: 0.5 },
};

/**
 * Integralfunktion und Hauptsatz der Differential- und Integralrechnung.
 * Oben der Graph von f mit der orientierten Fläche von der (ziehbaren) unteren
 * Grenze a bis x, darunter je nach Ansicht die Integralfunktion I_a, die Schar
 * der Stammfunktionen F + C oder das Konvergenzdiagramm der Riemann-Summen.
 * Fünf Ansichten: Integralfunktion (Fläche wächst, Flächenbilanz), Ableitung
 * der Flächenfunktion (Streifen h → 0, Mittelwert zwischen min und max),
 * Berechnen mit F(b) − F(a) (Rechenweg, Konstante kürzt sich), Zusammenhang der
 * Graphen (Null-, Extrem- und Wendestellen, a verschieben) und Riemann-Summen.
 * Acht mathematische Funktionen mit Koeffizienten und acht Anwendungen mit Einheiten.
 */
export default defineSimulation({
  id: 'hauptsatz',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.4 },
  groups: [
    { id: 'coef', label: L('Koeffizienten von f', 'Coefficients of f') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'area', label: L('Integralfunktion', 'Integral function') },
        { value: 'diff', label: L('Ableitung: h → 0', 'Derivative: h → 0') },
        { value: 'calc', label: L('Berechnen: F(b) − F(a)', 'Evaluate: F(b) − F(a)') },
        { value: 'graph', label: L('Graph f ↔ Graph I', 'Graph f ↔ graph I') },
        { value: 'riem', label: L('Riemann-Summen', 'Riemann sums') },
      ],
      default: 'area',
    },
    {
      key: 'kind',
      type: 'choice',
      label: L('Funktion aus', 'Function from'),
      options: [
        { value: 'math', label: L('Mathematik', 'Mathematics') },
        { value: 'app', label: L('Anwendung', 'Application') },
      ],
      default: 'math',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion f', 'Function f'),
      options: [
        { value: 'lin', label: L('Gerade', 'Line') },
        { value: 'par', label: L('Polynom', 'Polynomial') },
        { value: 'sin', label: L('sin', 'sin') },
        { value: 'cos', label: L('cos', 'cos') },
        { value: 'exp', label: L('eˣ', 'eˣ') },
        { value: 'inv', label: L('1/x', '1/x') },
        { value: 'gauss', label: L('Glocke', 'Bell curve') },
        { value: 'step', label: L('Treppe', 'Step') },
      ],
      default: 'par',
      visibleIf: (v) => v.kind === 'math',
    },
    {
      key: 'app',
      type: 'choice',
      label: L('Anwendung', 'Application'),
      options: [
        { value: 'car', label: L('Auto', 'Car') },
        { value: 'lake', label: L('Stausee', 'Reservoir') },
        { value: 'solar', label: L('Solaranlage', 'Solar panels') },
        { value: 'cost', label: L('Kosten', 'Cost') },
        { value: 'pop', label: L('Einwohner', 'Residents') },
        { value: 'drug', label: L('Medikament', 'Medicine') },
        { value: 'rain', label: L('Regen', 'Rain') },
        { value: 'breath', label: L('Atmung', 'Breathing') },
      ],
      default: 'car',
      visibleIf: (v) => v.kind === 'app',
    },
    { key: 'lm', type: 'number', group: 'coef', label: L('Steigung m', 'Slope m'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'lin' },
    { key: 'lt', type: 'number', group: 'coef', label: L('y-Abschnitt t', 'y-intercept t'), min: -3, max: 3, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'lin' },
    { key: 'k3', type: 'number', group: 'coef', label: L('Koeffizient bei x³', 'Coefficient of x³'), min: -1, max: 1, step: 0.05, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' },
    { key: 'k2', type: 'number', group: 'coef', label: L('Koeffizient bei x²', 'Coefficient of x²'), min: -2, max: 2, step: 0.05, default: 0.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' },
    { key: 'k1', type: 'number', group: 'coef', label: L('Koeffizient bei x', 'Coefficient of x'), min: -3, max: 3, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' },
    { key: 'k0', type: 'number', group: 'coef', label: L('Absolutglied', 'Constant term'), min: -3, max: 3, step: 0.1, default: -1, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' },
    {
      key: 'sa',
      type: 'number',
      group: 'coef',
      label: L('Amplitude A', 'Amplitude A'),
      help: L('f(x) = A · sin(bx) bzw. A · cos(bx)', 'f(x) = A · sin(bx) or A · cos(bx)'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 1,
      visibleIf: (v) => v.kind === 'math' && (v.fn === 'sin' || v.fn === 'cos'),
    },
    { key: 'sb', type: 'number', group: 'coef', label: L('Frequenz b', 'Frequency b'), min: 0.2, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && (v.fn === 'sin' || v.fn === 'cos') },
    { key: 'ea', type: 'number', group: 'coef', label: L('Faktor c', 'Factor c'), help: L('f(x) = c · e^(kx)', 'f(x) = c · e^(kx)'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'exp' },
    { key: 'eb', type: 'number', group: 'coef', label: L('Wachstumsfaktor k', 'Growth factor k'), min: -1.5, max: 1.5, step: 0.05, default: 0.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'exp' },
    { key: 'ia', type: 'number', group: 'coef', label: L('Zähler c', 'Numerator c'), help: L('f(x) = c/x für x > 0', 'f(x) = c/x for x > 0'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'inv' },
    { key: 'gm', type: 'number', group: 'coef', label: L('Lage μ (Mitte)', 'Position μ (centre)'), min: -3, max: 3, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'gauss' },
    { key: 'gs', type: 'number', group: 'coef', label: L('Breite σ', 'Width σ'), min: 0.3, max: 2, step: 0.05, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'gauss' },
    { key: 's1', type: 'number', group: 'coef', label: L('Wert links', 'Value on the left'), min: -3, max: 3, step: 0.5, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    { key: 's2', type: 'number', group: 'coef', label: L('Wert rechts', 'Value on the right'), help: L('Gleiche Werte: konstante Funktion.', 'Equal values: constant function.'), min: -3, max: 3, step: 0.5, default: -0.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    { key: 'sj', type: 'number', group: 'coef', label: L('Sprungstelle', 'Position of the jump'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    {
      key: 'a',
      type: 'number',
      label: L('untere Grenze a', 'Lower limit a'),
      help: L('Auch a und x auf der x-Achse ziehen.', 'You can also drag a and x along the x-axis.'),
      min: -6,
      max: 30,
      step: 0.01,
      default: -1,
    },
    { key: 'x', type: 'number', label: L('obere Grenze x (bzw. b)', 'Upper limit x (or b)'), min: -6, max: 30, step: 0.01, default: 2 },
    {
      key: 'h',
      type: 'number',
      label: L('Streifenbreite h', 'Strip width h'),
      help: L('Auch am Rand des Streifens ziehen.', 'You can also drag the edge of the strip.'),
      min: 0.01,
      max: 5,
      step: 0.01,
      default: 0.8,
      visibleIf: (v) => v.mode === 'diff',
    },
    {
      key: 'c',
      type: 'number',
      label: L('Konstante C der Stammfunktion', 'Constant C of the antiderivative'),
      help: L('F(x) + C ist auch eine Stammfunktion. Bei den Kosten: Fixkosten.', 'F(x) + C is an antiderivative too. For the cost: fixed cost.'),
      min: -20,
      max: 20,
      step: 0.5,
      default: 0,
      visibleIf: (v) => v.mode === 'calc',
    },
    {
      key: 'rm',
      type: 'choice',
      label: L('Stützstelle der Streifen', 'Sample point of the strips'),
      options: [
        { value: 'left', label: L('links', 'left') },
        { value: 'right', label: L('rechts', 'right') },
        { value: 'mid', label: L('Mitte', 'midpoint') },
        { value: 'trap', label: L('Trapez', 'trapezoid') },
      ],
      default: 'left',
      visibleIf: (v) => v.mode === 'riem',
    },
    { key: 'n', type: 'number', label: L('Anzahl Streifen n', 'Number of strips n'), min: 1, max: 100, step: 1, default: 4, visibleIf: (v) => v.mode === 'riem' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Ergebnisse im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: results in the picture replaced by “?” (for tasks).'), default: true },
    { key: 'full', type: 'boolean', group: 'view', label: L('ganzen Graphen von I zeigen', 'Show the whole graph of I'), default: true, visibleIf: (v) => v.mode === 'area' || v.mode === 'diff' || v.mode === 'graph' },
    { key: 'mark', type: 'boolean', group: 'view', label: L('Null-, Extrem- und Wendestellen', 'Zeros, extrema and points of inflection'), default: true, visibleIf: (v) => v.mode === 'graph' || v.mode === 'area' },
    { key: 'fam', type: 'boolean', group: 'view', label: L('Schar zeigen (F + C bzw. andere a)', 'Show the family (F + C or other a)'), default: true, visibleIf: (v) => v.mode === 'calc' || v.mode === 'graph' },
    { key: 'tan', type: 'boolean', group: 'view', label: L('Sekante und Tangente', 'Secant and tangent'), default: true, visibleIf: (v) => v.mode === 'diff' },
  ],
  actions: [
    { id: 'grow', label: L('Fläche wachsen lassen', 'Let the area grow'), primary: true, visibleIf: (v) => v.mode === 'area' || v.mode === 'graph' },
    { id: 'shrink', label: L('h gegen 0 gehen lassen', 'Let h tend to 0'), primary: true, visibleIf: (v) => v.mode === 'diff' },
    { id: 'steps', label: L('Rechenweg Schritt für Schritt', 'Working step by step'), primary: true, visibleIf: (v) => v.mode === 'calc' },
    { id: 'refine', label: L('Streifen verfeinern', 'Refine the strips'), primary: true, visibleIf: (v) => v.mode === 'riem' },
    { id: 'sweep', label: L('untere Grenze a wandern lassen', 'Move the lower limit a'), visibleIf: (v) => v.mode === 'graph' },
  ],
  readouts: [
    { key: 'fn', label: L('Funktion und Stammfunktion', 'Function and antiderivative') },
    { key: 'int', label: L('Integral', 'Integral'), spoiler: true },
    { key: 'bal', label: L('Flächenbilanz', 'Signed area'), spoiler: true },
    { key: 'dq', label: L('Differenzenquotient', 'Difference quotient'), spoiler: true },
    { key: 'riem', label: L('Riemann-Summe', 'Riemann sum'), spoiler: true },
    { key: 'feat', label: L('Graph von Iₐ', 'Graph of Iₐ'), spoiler: true },
    { key: 'sit', label: L('Anwendung', 'Application'), spoiler: true },
  ],
  presets: [
    { id: 'par', label: L('Parabel, a = −1', 'Parabola, a = −1'), values: {} },
    { id: 'car', label: L('Auto: aus der Geschwindigkeit den Weg', 'Car: distance from speed'), values: { kind: 'app', app: 'car', a: 0, x: 25 } },
    { id: 'solar', label: L('Solaranlage: Tagesertrag in kWh', 'Solar panels: daily yield in kWh'), values: { kind: 'app', app: 'solar', a: 0, x: 24 } },
    { id: 'lake', label: L('Stausee: wann ist am meisten Wasser drin?', 'Reservoir: when is it fullest?'), values: { mode: 'graph', kind: 'app', app: 'lake', a: 0, x: 12 } },
    { id: 'drug', label: L('Medikament: Wendepunkt der Menge', 'Medicine: inflection of the amount'), values: { mode: 'graph', kind: 'app', app: 'drug', a: 0, x: 8 } },
    { id: 'cost', label: L('Kosten: Fixkosten als Konstante C', 'Cost: fixed cost as the constant C'), values: { mode: 'calc', kind: 'app', app: 'cost', a: 0, x: 10, c: 20 } },
    { id: 'pop', label: L('Neubaugebiet: logistisches Wachstum', 'New district: logistic growth'), values: { mode: 'graph', kind: 'app', app: 'pop', a: 0, x: 20 } },
    { id: 'rain', label: L('Gewitter: Regenmenge mit Streifen', 'Thunderstorm: rainfall with strips'), values: { mode: 'riem', kind: 'app', app: 'rain', a: 0, x: 6, n: 6, rm: 'mid' } },
    { id: 'breath', label: L('Atemzug: ein- und ausatmen', 'One breath: in and out'), values: { kind: 'app', app: 'breath', a: 0, x: 5 } },
    { id: 'shrink', label: L('Streifen h → 0: I′ = f', 'Strip h → 0: I′ = f'), values: { mode: 'diff', x: 2, h: 1 } },
    { id: 'sin', label: L('∫₀^π sin x dx = 2', '∫₀^π sin x dx = 2'), values: { mode: 'calc', fn: 'sin', a: 0, x: 3.14 } },
    { id: 'inv', label: L('∫₁^e 1/x dx = 1', '∫₁^e 1/x dx = 1'), values: { mode: 'calc', fn: 'inv', a: 1, x: 2.72 } },
    { id: 'cubic', label: L('Polynom 3. Grades: Hoch-, Tief- und Wendepunkt', 'Cubic: maximum, minimum, inflection'), values: { mode: 'graph', k3: 0.25, k2: 0, k1: -1, k0: 0, a: -3, x: 3 } },
    { id: 'riem', label: L('Riemann-Summe von x² auf [0; 2]', 'Riemann sum of x² on [0, 2]'), values: { mode: 'riem', k2: 1, k0: 0, a: 0, x: 2, n: 4 } },
    { id: 'step', label: L('Sprungstelle: I hat dort einen Knick', 'Jump: I has a kink there'), values: { fn: 'step', a: -2, x: 3 } },
    { id: 'gauss', label: L('Glockenkurve: Fläche gegen √(2π)', 'Bell curve: area towards √(2π)'), values: { fn: 'gauss', a: -4, x: 4 } },
  ],
  strings: {
    de: {
      canvas:
        'Oben der Graph von f mit der orientierten Fläche (grün oberhalb, rot unterhalb der x-Achse) zwischen der unteren Grenze a und der oberen Grenze x; darunter je nach Ansicht die Integralfunktion I_a mit Sekante und Tangente, die Schar der Stammfunktionen F + C mit F(b) − F(a) oder die Konvergenz der Riemann-Summen. Rechts Karten mit Definition, Flächenbilanz, Rechenweg und Anwendung.',
    },
    en: {
      canvas:
        'At the top the graph of f with the signed area (green above, red below the x-axis) between the lower limit a and the upper limit x; below, depending on the view, the integral function I_a with secant and tangent, the family of antiderivatives F + C with F(b) − F(a), or the convergence of the Riemann sums. On the right, cards with definition, signed area, working and application.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const say = (s: Txt) => s[lang];
    const editable = () => !ctx.locked;
    const mode = () => p.mode as Mode;
    const kind = () => p.kind as Kind;
    const fnKey = () => p.fn as FnKey;
    const appKey = () => p.app as AppKey;
    const rmKind = () => p.rm as RiemannKind;
    const meta = () => (kind() === 'app' ? APP_META[appKey()] : null);

    /* ---------- Farben ---------- */
    const col = {
      f: () => th().series[0]!,
      I: () => th().series[3]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      h: () => th().series[4]!,
      a: () => th().series[5]!,
      F: () => th().series[4]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 3) => fmt.num(clean(v, d), d);
    /** Stellen nach Größe: große Werte mit weniger Nachkommastellen. */
    const nd = (v: number) => (Math.abs(v) >= 100 ? 1 : Math.abs(v) >= 10 ? 2 : 3);
    const NV = (v: number) => N(v, nd(v));
    const isExact = (v: number, d = 3) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eq = (v: number, d = 3) => (isExact(v, d) ? '=' : '≈');
    const lim = (v: number) => {
      const D = exactFn().x;
      return clamp(v, D[0], D[1]);
    };

    /* ---------- Funktionen ---------- */
    const coefNow = (): Coeffs => {
      const c = { ...DEFAULT_COEFFS };
      for (const k of COEF_KEYS) c[k] = p[k] as number;
      return c;
    };
    function build(k: Kind, f: FnKey, a: AppKey, c: Coeffs): Fn {
      return k === 'app' ? APPS[a] : mathFn(f, c);
    }
    const exactFn = (): Fn => build(kind(), fnKey(), appKey(), coefNow());

    /* Angezeigte Koeffizienten gleiten; beim Wechsel der Funktion wird überblendet. */
    const CC = Object.fromEntries(COEF_KEYS.map((k) => [k, new Chan(p[k] as number)])) as Record<CoefKey, Chan>;
    const coefShown = (): Coeffs => {
      const c = { ...DEFAULT_COEFFS };
      for (const k of COEF_KEYS) c[k] = CC[k].v;
      return c;
    };
    let morph: { from: Fn; t0: number; dur: number } | null = null;
    let morphK = 1;
    function shownFn(): Fn {
      const cur = build(kind(), fnKey(), appKey(), coefShown());
      if (!morph || morphK >= 1) return cur;
      const old = morph.from;
      const k = morphK;
      const mix = (u: number, v: number) => (Number.isFinite(u) ? lerp(u, v, k) : v);
      return {
        f: (x) => mix(old.f(x), cur.f(x)),
        F: (x) => mix(old.F(x), cur.F(x)),
        x: cur.x,
        jumps: k < 0.5 ? old.jumps : cur.jumps,
        kinks: cur.kinks,
      };
    }

    /* ---------- angezeigter Zustand ---------- */
    const A = new Chan(lim(p.a));
    const X = new Chan(lim(p.x));
    const Hh = new Chan(p.h);
    const Cc = new Chan(p.c);
    const rng = { x0: new Chan(-4), x1: new Chan(4), fy0: new Chan(-2), fy1: new Chan(2), iy0: new Chan(-2), iy1: new Chan(2), by0: new Chan(-2), by1: new Chan(2) };
    const mw = Object.fromEntries(MODES.map((m) => [m, new Chan(m === p.mode ? 1 : 0)])) as Record<Mode, Chan>;
    const kMark = new Chan(p.mark ? 1 : 0);
    const kFam = new Chan(p.fam ? 1 : 0);
    const kTan = new Chan(p.tan ? 1 : 0);
    const kFull = new Chan(p.full ? 1 : 0);
    let intro: number | null = null;
    let grow: { t0: number; dur: number } | null = null;
    let shrink: { t0: number; dur: number; from: number } | null = null;
    let refine: { t0: number; step: number } | null = null;
    let steps: { t0: number } | null = null;
    let sweep: { t0: number; dur: number } | null = null;
    let bottomFade: { t0: number; from: Bottom } | null = null;
    let cardFade: number | null = null;
    let nFrom: { n: number; kind: RiemannKind; t0: number } | null = null;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    let feat: Features = features(exactFn());
    let conv: Record<RiemannKind, number[]> = { left: [], right: [], mid: [], trap: [] };
    let prevMode: Mode = mode();
    let prevN = p.n;
    let prevRm: RiemannKind = rmKind();

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { top: Rect; bot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.33, 226, 360));
        const lw = w - cw - 10;
        const t1 = Math.round(h * 0.53);
        return { top: { x: 0, y: 0, w: lw, h: t1 }, bot: { x: 0, y: t1 + 6, w: lw, h: h - t1 - 6 }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(h * 0.52, 300, w * 1.3));
      const t1 = Math.round(ph * 0.52);
      return { top: { x: 0, y: 0, w, h: t1 }, bot: { x: 0, y: t1 + 6, w, h: ph - t1 - 6 }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const PAD = () => ({ left: fs(46, 38), bottom: fs(24, 22), top: fs(38, 34), right: fs(16, 12) });
    const plot = new Plot(surface, { x: [-4, 4], y: [-2, 2], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top });
    const plotB = new Plot(surface, { x: [-4, 4], y: [-2, 2], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot });

    plot.addHandle({
      get: () => [A.v, 0],
      set: (x) => {
        lastDrag = performance.now();
        ctx.set({ a: Math.round(lim(x) * 100) / 100 });
      },
      axis: 'x',
      enabled: () => editable() && !sweep,
      color: () => col.a(),
    });
    plot.addHandle({
      get: () => [X.v, 0],
      set: (x) => {
        lastDrag = performance.now();
        ctx.set({ x: Math.round(lim(x) * 100) / 100 });
      },
      axis: 'x',
      enabled: () => editable(),
      color: () => col.I(),
    });
    plot.addHandle({
      get: () => [X.v + Hh.v, 0],
      set: (x) => {
        lastDrag = performance.now();
        ctx.set({ h: Math.round(clamp(x - p.x, H_MIN, 5) * 100) / 100 });
      },
      axis: 'x',
      enabled: () => editable() && mode() === 'diff' && !shrink,
      color: () => col.h(),
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), I: col.I(), p: col.pos(), n: col.neg(), h: col.h(), a: col.a(), F: col.F(), m: th().muted },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /** Zahl als Formeltext: abbrechende Dezimalzahl oder kleiner Bruch. */
    function q(v: number): string {
      if (isExact(v, 3)) return N(v, 3);
      for (let d = 2; d <= 48; d++) {
        const n0 = v * d;
        if (Math.abs(n0 - Math.round(n0)) < 1e-7) return `${v < 0 ? '−' : ''}\\f{${Math.abs(Math.round(n0))}}{${d}}`;
      }
      return N(v, 3);
    }
    /** Summe von Gliedern c·Potenz (Nullen fallen weg, Einsen vor x auch). */
    function polySrc(terms: [number, string][]): string {
      let s = '';
      for (const [c, v] of terms) {
        if (Math.abs(c) < 1e-12) continue;
        const neg = c < 0;
        const abs = q(Math.abs(c));
        const num = v && abs === '1' ? '' : abs;
        s += s ? ` ${neg ? '−' : '+'} ${num}${v}` : `${neg ? '−' : ''}${num}${v}`;
      }
      return s || '0';
    }
    /** Faktor vor einer Funktion (1 → leer, −1 → −). */
    const fac = (c: number, tail = ' · ') => (Math.abs(c - 1) < 1e-12 ? '' : Math.abs(c + 1) < 1e-12 ? '−' : `${q(c)}${tail}`);

    /** f und eine Stammfunktion F als Formeltext (Kurzschrift aus formula.ts). */
    function fnSrc(): { f: string; F: string; note: string | null; noAnti: boolean } {
      const m = meta();
      if (m) return { f: m.fSrc, F: m.FSrc, note: appKey() === 'rain' ? say(L('Fehlerfunktion erf (nicht elementar)', 'error function erf (not elementary)')) : null, noAnti: false };
      const c = coefNow();
      switch (fnKey()) {
        case 'lin':
          return { f: `f(x) = ${polySrc([[c.lm, 'x'], [c.lt, '']])}`, F: `F(x) = ${polySrc([[c.lm / 2, 'x²'], [c.lt, 'x']])}`, note: null, noAnti: false };
        case 'par':
          return {
            f: `f(x) = ${polySrc([[c.k3, 'x³'], [c.k2, 'x²'], [c.k1, 'x'], [c.k0, '']])}`,
            F: `F(x) = ${polySrc([[c.k3 / 4, 'x⁴'], [c.k2 / 3, 'x³'], [c.k1 / 2, 'x²'], [c.k0, 'x']])}`,
            note: null,
            noAnti: false,
          };
        case 'sin': {
          const bx = Math.abs(c.sb - 1) < 1e-12 ? 'x' : `${q(c.sb)}x`;
          return { f: `f(x) = ${fac(c.sa)}\\t{sin}(${bx})`, F: `F(x) = ${fac(-c.sa / c.sb)}\\t{cos}(${bx})`, note: null, noAnti: false };
        }
        case 'cos': {
          const bx = Math.abs(c.sb - 1) < 1e-12 ? 'x' : `${q(c.sb)}x`;
          return { f: `f(x) = ${fac(c.sa)}\\t{cos}(${bx})`, F: `F(x) = ${fac(c.sa / c.sb)}\\t{sin}(${bx})`, note: null, noAnti: false };
        }
        case 'exp': {
          if (Math.abs(c.eb) < 1e-12) return { f: `f(x) = ${q(c.ea)}`, F: `F(x) = ${polySrc([[c.ea, 'x']])}`, note: null, noAnti: false };
          const kx = Math.abs(c.eb - 1) < 1e-12 ? 'x' : `${q(c.eb)}x`;
          return { f: `f(x) = ${fac(c.ea)}\\t{e}^{${kx}}`, F: `F(x) = ${fac(c.ea / c.eb)}\\t{e}^{${kx}}`, note: null, noAnti: false };
        }
        case 'inv':
          return { f: `f(x) = \\f{${q(c.ia)}}{x}`, F: `F(x) = ${fac(c.ia)}\\t{ln} x`, note: say(L('für x > 0', 'for x > 0')), noAnti: false };
        case 'gauss': {
          const sh = Math.abs(c.gm) < 1e-12 ? 'x' : `(x ${c.gm > 0 ? '−' : '+'} ${q(Math.abs(c.gm))})`;
          const s2 = q(2 * c.gs * c.gs);
          return {
            f: `f(x) = \\t{e}^{−\\f{${sh}²}{${s2}}}`,
            F: `F(x) = ${q(c.gs)} · \\r{\\f{π}{2}} · \\t{erf}(\\f{${sh.replace(/^\(|\)$/g, '')}}{${q(c.gs)}\\r{2}})`,
            note: say(L('Fehlerfunktion erf (nicht elementar)', 'error function erf (not elementary)')),
            noAnti: false,
          };
        }
        case 'step': {
          const jump = Math.abs(c.s1 - c.s2) > 1e-12;
          const j = q(c.sj);
          if (!jump) return { f: `f(x) = ${q(c.s1)}`, F: `F(x) = ${polySrc([[c.s1, 'x']])}`, note: say(L('konstante Funktion', 'constant function')), noAnti: false };
          return {
            f: `f(x) = ${q(c.s1)} \\c{m}{(x < ${j})},  ${q(c.s2)} \\c{m}{(x ≥ ${j})}`,
            F: `I(x) = ${q(c.s1)} · \\t{min}(x; ${j}) ${c.s2 < 0 ? '−' : '+'} ${q(Math.abs(c.s2))} · \\t{max}(0; x − ${j})`,
            note: say(L('Sprung: keine Stammfunktion auf ganz ℝ', 'jump: no antiderivative on all of ℝ')),
            noAnti: true,
          };
        }
      }
    }

    /** Kurzschrift → HTML für die Ergebnisse unter der Bühne. */
    function toHtml(src: string): string {
      let i = 0;
      const group = (): string => {
        if (src[i] !== '{') return src[i++] ?? '';
        i++;
        const out = seq('}');
        i++;
        return out;
      };
      const seq = (end?: string): string => {
        let out = '';
        let buf = '';
        const flush = () => {
          out += buf.replace(/(^|[^\p{L}])(\p{L})(?![\p{L}])/gu, (_, pre: string, ch: string) => (ch === 'π' ? `${pre}${ch}` : `${pre}<var>${ch}</var>`));
          buf = '';
        };
        while (i < src.length && src[i] !== end) {
          const ch = src[i]!;
          if (ch === '\\' && 'frcbti'.includes(src[i + 1] ?? '')) {
            const cmd = src[i + 1]!;
            i += 2;
            flush();
            if (cmd === 'f') {
              const a = group();
              out += `<span class="frac"><span>${a}</span><span>${group()}</span></span>`;
            } else if (cmd === 'r') out += `√(${group()})`;
            else if (cmd === 'i') {
              const lo = group();
              out += `∫<sub>${lo}</sub><sup>${group()}</sup>`;
            } else if (cmd === 'c') {
              group();
              out += group();
            } else if (cmd === 'b') out += `<strong>${group()}</strong>`;
            else out += group();
          } else if (ch === '_' || ch === '^') {
            flush();
            i++;
            out += ch === '_' ? `<sub>${group()}</sub>` : `<sup>${group()}</sup>`;
          } else {
            buf += ch;
            i++;
          }
        }
        flush();
        return out;
      };
      return seq();
    }

    /* ---------- Zeichenhilfen ---------- */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; bounds?: Rect } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const box = opts.maxW ? fit(src, opts.maxW, size, color, 700) : formula(g, src, fstyle(size, color, 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      let base = y + (box.asc - box.desc) / 2;
      if (opts.bounds) base = clamp(base, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
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
    const pillW = (src: string, size: number) => formula(surface.g, src, fstyle(size, th().text, 700)).w + 16;

    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01) return;
      g.save();
      g.globalAlpha *= alpha;
      if (hollow) {
        g.fillStyle = th().bg;
        g.strokeStyle = color;
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        return;
      }
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

    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht). */
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
        let pen = false;
        for (const [x, y] of pts) {
          if (!Number.isFinite(y)) {
            pen = false;
            continue;
          }
          if (pen) g.lineTo(x, y);
          else g.moveTo(x, y);
          pen = true;
        }
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
        g.strokeStyle = withAlpha('#ffffff', th().dark ? 0.2 : 0.38);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }

    /** Werte einer Funktion als Pixelpunkte; an Sprungstellen wird die Linie unterbrochen. */
    function sample(pl: Plot, f: (x: number) => number, x0: number, x1: number, jumps: number[] = []): [number, number][] {
      const out: [number, number][] = [];
      if (!(x1 > x0)) return out;
      const r = pl.rect;
      const count = Math.round(clamp(((pl.px(x1) - pl.px(x0)) / Math.max(1, r.w)) * r.w * 0.9, 24, 900));
      const lim2 = r.h * 3;
      const js = jumps.filter((j) => j > x0 && j < x1).sort((u, v) => u - v);
      const segs: [number, number][] = [];
      let s0 = x0;
      for (const j of js) {
        segs.push([s0, j - 1e-9]);
        s0 = j;
      }
      segs.push([s0, x1]);
      segs.forEach(([u0, u1], si) => {
        if (si > 0) out.push([NaN, NaN]);
        const c = Math.max(4, Math.round((count * (u1 - u0)) / (x1 - x0)));
        for (let i = 0; i <= c; i++) {
          const x = u0 + ((u1 - u0) * i) / c;
          const y = f(x);
          out.push([pl.px(x), Number.isFinite(y) ? clamp(pl.py(y), r.y - lim2, r.y + r.h + lim2) : NaN]);
        }
      });
      return out;
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
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.13 : 0.075));
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
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      const room0 = R.w - 2 * pad - 15;
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 10.5) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      const tw = g.measureText(shown).width;
      if (right) {
        const rb = formula(g, right, fstyle(fs(12, 11), color, 700));
        if (R.x + pad + 15 + tw + 12 + rb.w < R.x + R.w - pad) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      }
      return ty;
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const words = str.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(head, len * 0.5);
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

    /* ---------- Zustand pro Bild ---------- */
    interface View {
      fn: Fn;
      a: number;
      /** obere Grenze (Zielwert) */
      x: number;
      /** obere Grenze, bis zu der die Fläche gerade gefüllt ist (Einstieg, „wachsen lassen“) */
      xs: number;
      h: number;
      c: number;
      n: number;
      I: (t: number) => number;
    }
    interface Intro {
      panel: number;
      reveal: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3000) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 80) / 1000)),
        labels: ease.outCubic(clamp01((t - 1100) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 700) / 1500),
      };
    }
    /** Anteil der gefüllten Fläche (Einstieg und „Fläche wachsen lassen“). */
    function growK(now: number): number {
      if (intro !== null) return ease.inOutCubic(clamp01((now - intro - 650) / 1500));
      if (grow) return ease.inOutCubic(clamp01((now - grow.t0) / grow.dur));
      return 1;
    }
    function shownH(now: number): number {
      if (!shrink) return Hh.v;
      const t = clamp01((now - shrink.t0) / shrink.dur);
      // geometrisch kleiner werden, damit man die kleinen h auch sieht
      return Math.exp(lerp(Math.log(shrink.from), Math.log(H_MIN), ease.inOutCubic(t)));
    }
    function shownN(now: number): number {
      if (!refine) return p.n;
      const i = Math.floor((now - refine.t0) / refine.step);
      return REFINE_NS[clamp(i, 0, REFINE_NS.length - 1)]!;
    }
    function shownA(now: number): number {
      if (!sweep) return A.v;
      const t = clamp01((now - sweep.t0) / sweep.dur);
      const D = exactFn().x;
      const span = (D[1] - D[0]) * 0.32;
      return clamp(p.a + Math.sin(TAU * ease.inOutCubic(t)) * span * Math.sin(Math.PI * t), D[0], D[1]);
    }
    function viewOf(now: number): View {
      const fn = shownFn();
      const a = shownA(now);
      const x = X.v;
      const xs = lerp(a, x, growK(now));
      const F0 = fn.F(a);
      return { fn, a, x, xs, h: shownH(now), c: Cc.v, n: shownN(now), I: (t) => fn.F(t) - F0 };
    }

    /* ---------- Bereiche ---------- */
    function retargetRanges(now: number, instant: boolean): void {
      const fn = exactFn();
      const [x0, x1] = fn.x;
      const xb = lim(p.x);
      const keyX = [lim(p.a), xb, ...feat.zeros.map((z) => z.x), ...feat.ext.map((e) => e.x)];
      const fr = robustRange(fn.f, x0, x1, keyX.map((t) => fn.f(t)));
      const fLo = Math.min(0, fr.lo);
      const fHi = Math.max(0, fr.hi);
      const fSpan = Math.max(0.5, fHi - fLo);
      const a = lim(p.a);
      const ir = robustRange((t) => integralFn(fn, a, t), x0, x1, keyX.map((t) => integralFn(fn, a, t)));
      if (mode() === 'graph') {
        // Schar und „a wandern lassen“: auch die verschobenen Graphen sollen ins Bild passen
        const span = x1 - x0;
        for (const s of [-0.15, 0.15]) {
          const shift = integralFn(fn, a, clamp(a + s * span, x0, x1));
          ir.lo = Math.min(ir.lo, ir.lo - shift);
          ir.hi = Math.max(ir.hi, ir.hi - shift);
        }
      }
      const iLo = Math.min(0, ir.lo);
      const iHi = Math.max(0, ir.hi);
      const iSpan = Math.max(0.5, iHi - iLo);
      // Stammfunktion F + C (Ansicht „Berechnen“): Schar um den gewählten Wert
      const Fr = robustRange((t) => fn.F(t) + p.c, x0, x1, keyX.map((t) => fn.F(t) + p.c));
      const famStep = famSpacing(fn);
      const bLo = Math.min(Fr.lo - 2.2 * famStep, p.c);
      const bHi = Math.max(Fr.hi + 2.2 * famStep, p.c);
      const goals: [Chan, number][] = [
        [rng.x0, x0],
        [rng.x1, x1],
        [rng.fy0, fLo - fSpan * 0.08],
        [rng.fy1, fHi + fSpan * 0.1],
        [rng.iy0, iLo - iSpan * 0.1],
        [rng.iy1, iHi + iSpan * 0.14],
        [rng.by0, bLo],
        [rng.by1, bHi],
      ];
      for (const [ch, v] of goals) {
        if (instant || reduced()) ch.jump(v);
        else if (dragging()) ch.follow(v, 0.25);
        else ch.glide(v, 750, 0, now);
      }
    }
    /**
     * Wertebereich für die Achse: ganze Kurve, wenn sie nicht viel weiter ausschlägt
     * als der Hauptteil; sonst nur der Hauptteil (Ränder dürfen hinauslaufen).
     * Die wichtigen Punkte (Grenzen, Null-, Extrem- und Wendestellen) sind immer enthalten.
     */
    function robustRange(f: (x: number) => number, x0: number, x1: number, must: number[]): { lo: number; hi: number } {
      const ys: number[] = [];
      for (let i = 0; i <= 300; i++) {
        const y = f(x0 + ((x1 - x0) * i) / 300);
        if (Number.isFinite(y)) ys.push(y);
      }
      if (!ys.length) return { lo: -1, hi: 1 };
      ys.sort((u, v) => u - v);
      const q0 = ys[Math.floor(ys.length * 0.08)]!;
      const q1 = ys[Math.ceil(ys.length * 0.92) - 1]!;
      const span = Math.max(1e-6, q1 - q0);
      const mn = ys[0]!;
      const mx = ys[ys.length - 1]!;
      let lo = mn >= q0 - 0.3 * span ? mn : q0 - 0.15 * span;
      let hi = mx <= q1 + 0.3 * span ? mx : q1 + 0.15 * span;
      for (const v of must) if (Number.isFinite(v)) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      return { lo, hi };
    }

    /** Abstand der Kurven in der Schar F + C. */
    function famSpacing(fn: Fn): number {
      const r = rangeOf(fn.F, fn.x[0], fn.x[1], 200);
      const span = Math.max(1, r.hi - r.lo);
      const raw = span / 3;
      const pw = 10 ** Math.floor(Math.log10(raw));
      const m = raw / pw;
      return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * pw;
    }

    function computeConv(): void {
      const fn = exactFn();
      const a = lim(p.a);
      const b = lim(p.x);
      const out: Record<RiemannKind, number[]> = { left: [], right: [], mid: [], trap: [] };
      for (const k of ['left', 'right', 'mid', 'trap'] as RiemannKind[]) for (let n = 1; n <= 100; n++) out[k].push(riemann(fn.f, a, b, n, k));
      conv = out;
    }

    /* =====================================================================
     * Oberes Bild: Graph von f mit Fläche
     * ===================================================================== */
    function axisLabels(): { x: string; y: string; I: string; F: string } {
      const m = meta();
      if (!m) return { x: 'x', y: 'y', I: 'y', F: 'y' };
      return { x: `${m.v} in ${say(m.uX)}`, y: `${m.f} in ${say(m.uF)}`, I: `${m.I} in ${say(m.uI)}`, F: `${m.I} in ${say(m.uI)}` };
    }

    function fillArea(pl: Plot, V: View, lo: number, hi: number, alpha: number): void {
      if (!(hi > lo) || alpha <= 0.01) return;
      const g = surface.g;
      const dark = th().dark;
      const y0 = pl.py(0);
      for (const sign of [1, -1]) {
        const color = sign > 0 ? col.pos() : col.neg();
        const pts = sample(pl, (x) => (sign > 0 ? Math.max(V.fn.f(x), 0) : Math.min(V.fn.f(x), 0)), lo, hi, V.fn.jumps);
        g.save();
        g.globalAlpha *= alpha;
        const top = sign > 0 ? pl.py(rng.fy1.v) : pl.py(rng.fy0.v);
        const grad = g.createLinearGradient(0, top, 0, y0);
        grad.addColorStop(0, withAlpha(color, dark ? 0.55 : 0.42));
        grad.addColorStop(1, withAlpha(color, dark ? 0.22 : 0.14));
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(pl.px(lo), y0);
        for (const [px, py] of pts) if (Number.isFinite(py)) g.lineTo(px, py);
        g.lineTo(pl.px(hi), y0);
        g.closePath();
        g.fill();
        g.restore();
      }
    }

    function drawTop(V: View, now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const lab = axisLabels();
      plot.setAxes({ x: { label: lab.x }, y: { label: lab.y } });
      plot.setRangePadded([rng.x0.v, rng.x1.v], [rng.fy0.v, rng.fy1.v], PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const lo = Math.min(V.a, V.xs);
      const hi = Math.max(V.a, V.xs);
      const w = (m: Mode) => mw[m].v;
      const areaA = clamp01(w('area') + w('calc') + w('graph') + w('diff') * 0.45 + w('riem') * 0.22);
      fillArea(plot, V, lo, hi, areaA);
      // Riemann-Streifen
      if (w('riem') > 0.01) drawRiemannBoxes(V, now, w('riem'));
      // Streifen der Breite h (Ableitung)
      if (w('diff') > 0.01) drawStrip(V, w('diff') * k.labels);
      // Graph von f, beim Einstieg von links nach rechts
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      const xr = lerp(x0, x1, k.reveal);
      strokePts(sample(plot, V.fn.f, x0, xr, V.fn.jumps), col.f(), fs(3.2, 2.7), { glow: true });
      // Sprungstellen: gefüllter und leerer Punkt
      for (const j of V.fn.jumps ?? []) {
        if (j < x0 || j > xr) continue;
        dot(plot.px(j), plot.py(V.fn.f(j - 1e-9)), col.f(), 4.5, 1, true);
        dot(plot.px(j), plot.py(V.fn.f(j)), col.f(), 4.5);
      }
      // Kurvenmerkmale (Null- und Extremstellen von f)
      const km = w('graph') * kMark.v * k.labels;
      if (km > 0.01) drawFeaturesTop(V, km);
      // Grenzen a und x
      const la = k.labels;
      g.save();
      g.globalAlpha *= la;
      plot.segment([V.a, 0], [V.a, V.fn.f(V.a)], { color: col.a(), width: 2.2 });
      plot.segment([V.xs, 0], [V.xs, V.fn.f(V.xs)], { color: col.I(), width: 2.2 });
      g.restore();
      dot(plot.px(V.a), plot.py(0), col.a(), 6.5, la);
      dot(plot.px(V.xs), plot.py(0), col.I(), 6.5, la);
      const yAx = plot.py(0);
      const below = yAx + 17 > r.y + r.h - 6 ? yAx - 17 : yAx + 17;
      const calc = w('calc');
      fpill(plot.px(V.a), below, '\\c{a}{a}', { color: col.a(), size: fs(12.5, 11.5), alpha: la * 0.95, bounds: r });
      fpill(plot.px(V.xs), below, calc > 0.5 ? '\\c{I}{b}' : '\\c{I}{x}', { color: col.I(), size: fs(12.5, 11.5), alpha: la * 0.95, bounds: r });
      // Flächenwert in der Fläche
      if (w('riem') < 0.5) {
        const val = V.I(V.xs);
        const mid = (lo + hi) / 2;
        const fm = V.fn.f(mid);
        const m = meta();
        const name = m ? `${m.I}` : `I_{${N(V.a, 2)}}(${N(V.xs, 2)})`;
        const unit = m ? ` \\t{${say(m.uI)}}` : '';
        const src = `${name} ${p.show ? `${eq(val)} ${NV(val)}${unit}` : '= ?'}`;
        const px = plot.px(mid);
        const inside = Math.abs(plot.py(fm) - yAx) > 60 && Math.abs(plot.px(hi) - plot.px(lo)) > pillW(src, fs(13, 12)) + 10;
        const py = inside ? (plot.py(fm) + yAx) / 2 : fm >= 0 ? Math.min(plot.py(fm), yAx) - 22 : Math.max(plot.py(fm), yAx) + 22;
        fpill(px, py, src, { color: val >= 0 ? mixColor(col.pos(), theme.text, 0.25) : mixColor(col.neg(), theme.text, 0.2), border: withAlpha(val >= 0 ? col.pos() : col.neg(), 0.6), size: fs(13, 12), alpha: la * clamp01(1 - w('diff') * 1.5), bounds: r });
      }
      // Legende
      const src = fnSrc();
      fpill(r.x + 10, r.y + 18, `\\c{f}{${src.f}}`, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.w - 40 });
      plot.end();
    }

    /** Streifen [x; x + h] mit Mittelwert-Rechteck zwischen kleinstem und größtem Wert. */
    function drawStrip(V: View, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const x = V.x;
      const x2 = x + V.h;
      const D = V.fn.x;
      if (x2 > D[1] + 1e-9) return;
      const r = plot.rect;
      const m = stripMean(V.fn, x, V.h);
      const mm = stripRange(V.fn, x, V.h, 48);
      g.save();
      g.globalAlpha *= alpha;
      // Fläche unter f auf dem Streifen
      const pts = sample(plot, V.fn.f, x, x2, V.fn.jumps);
      const y0 = plot.py(0);
      g.fillStyle = withAlpha(col.h(), theme.dark ? 0.42 : 0.3);
      g.beginPath();
      g.moveTo(plot.px(x), y0);
      for (const [px, py] of pts) if (Number.isFinite(py)) g.lineTo(px, py);
      g.lineTo(plot.px(x2), y0);
      g.closePath();
      g.fill();
      // Mittelwert-Rechteck (gleiche Fläche wie der Streifen)
      const rx0 = plot.px(x);
      const rx1 = plot.px(x2);
      const ry = plot.py(m);
      g.strokeStyle = col.h();
      g.lineWidth = 2;
      g.setLineDash([5, 3]);
      g.strokeRect(rx0, Math.min(ry, y0), rx1 - rx0, Math.abs(y0 - ry));
      g.setLineDash([]);
      // kleinster und größter Wert
      const ext = Math.max(10, (rx1 - rx0) * 0.25);
      g.strokeStyle = withAlpha(theme.muted, 0.9);
      g.lineWidth = 1.3;
      g.setLineDash([2, 3]);
      for (const v of [mm.min, mm.max]) {
        const yy = Math.round(plot.py(v)) + 0.5;
        g.beginPath();
        g.moveTo(rx0 - ext, yy);
        g.lineTo(rx1 + ext, yy);
        g.stroke();
      }
      g.setLineDash([]);
      g.restore();
      // Beschriftungen
      const sz = fs(12, 11);
      const room = rx1 + ext + 8 + 90 < r.x + r.w;
      const lx = room ? rx1 + ext + 6 : rx0 - ext - 6;
      const al = room ? 'left' : 'right';
      if (Math.abs(plot.py(mm.max) - plot.py(mm.min)) > 26) {
        fpill(lx, plot.py(mm.max), `\\c{m}{max}`, { align: al, size: sz - 0.5, alpha: alpha * 0.9, color: theme.muted });
        fpill(lx, plot.py(mm.min), `\\c{m}{min}`, { align: al, size: sz - 0.5, alpha: alpha * 0.9, color: theme.muted });
      }
      const hy = clamp(Math.min(ry, y0) - 16, r.y + 44, r.y + r.h - 20);
      fpill((rx0 + rx1) / 2, hy, `\\c{h}{h = ${N(V.h, 2)}}`, { size: sz, alpha, border: withAlpha(col.h(), 0.6), bounds: r });
    }

    /** Riemann-Streifen; beim Wechsel von n oder der Art wachsen die neuen Streifen aus den alten. */
    function drawRiemannBoxes(V: View, now: number, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const kindNow = rmKind();
      const boxes = riemannBoxes(V.fn.f, V.a, V.xs, V.n, kindNow);
      let k = 1;
      let old: ReturnType<typeof riemannBoxes> | null = null;
      if (nFrom) {
        k = ease.inOutCubic(clamp01((now - nFrom.t0) / 600));
        if (k >= 1) nFrom = null;
        else old = riemannBoxes(V.fn.f, V.a, V.xs, nFrom.n, nFrom.kind);
      }
      const oldAt = (xc: number): [number, number] | null => {
        if (!old) return null;
        for (const b of old) if ((xc - b.l) * (xc - b.r) <= 0) {
          const t = (xc - b.l) / (b.r - b.l || 1);
          const y = lerp(b.yl, b.yr, t);
          return [y, y];
        }
        return null;
      };
      const y0 = plot.py(0);
      const thin = Math.abs(plot.px(boxes[0]?.r ?? 0) - plot.px(boxes[0]?.l ?? 0)) < 5;
      g.save();
      g.globalAlpha *= alpha;
      for (const b of boxes) {
        let yl = b.yl;
        let yr = b.yr;
        const o = oldAt((b.l + b.r) / 2);
        if (o) {
          yl = lerp(o[0], b.yl, k);
          yr = lerp(o[1], b.yr, k);
        }
        const xl = plot.px(b.l);
        const xr = plot.px(b.r);
        const pos = (yl + yr) / 2 * (b.r - b.l) >= 0;
        const color = pos ? col.pos() : col.neg();
        g.fillStyle = withAlpha(col.h(), theme.dark ? 0.32 : 0.22);
        g.beginPath();
        g.moveTo(xl, y0);
        g.lineTo(xl, plot.py(yl));
        g.lineTo(xr, plot.py(yr));
        g.lineTo(xr, y0);
        g.closePath();
        g.fill();
        g.strokeStyle = withAlpha(thin ? col.h() : mixColor(col.h(), color, 0.25), thin ? 0.55 : 0.95);
        g.lineWidth = thin ? 0.8 : 1.5;
        g.stroke();
        // Stützstelle
        if (!thin && kindNow !== 'trap') {
          const xs = kindNow === 'left' ? b.l : kindNow === 'right' ? b.r : (b.l + b.r) / 2;
          dot(plot.px(xs), plot.py(yl), col.h(), 3.2);
        }
      }
      g.restore();
    }

    /** Null- und Extremstellen von f mit senkrechten Hilfslinien bis ins untere Bild. */
    function drawFeaturesTop(V: View, alpha: number): void {
      const r = plot.rect;
      for (const z of feat.zeros) {
        dot(plot.px(z.x), plot.py(0), z.sign === 0 ? th().muted : z.sign < 0 ? col.neg() : col.pos(), 5, alpha, true);
      }
      for (const e of feat.ext) {
        const y = V.fn.f(e.x);
        dot(plot.px(e.x), plot.py(y), col.h(), 5, alpha);
        fpill(plot.px(e.x), plot.py(y) + (e.kind === 'max' ? -18 : 18), e.kind === 'max' ? '\\c{h}{HP}' : '\\c{h}{TP}', { size: fs(11.5, 11), alpha: alpha * 0.95, color: col.h(), bounds: r });
      }
    }

    /* =====================================================================
     * Unteres Bild: Integralfunktion, Stammfunktionen oder Konvergenz
     * ===================================================================== */
    function drawI(V: View, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const lab = axisLabels();
      plotB.setAxes({ x: { label: lab.x }, y: { label: lab.I } });
      plotB.setRangePadded([rng.x0.v, rng.x1.v], [rng.iy0.v, rng.iy1.v], PAD());
      plotB.resize();
      g.save();
      g.globalAlpha *= alpha;
      plotB.begin();
      plotB.grid();
      plotB.axes();
      const r = plotB.rect;
      const w = (m: Mode) => mw[m].v;
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      // steigt / fällt (Vorzeichen von f) als Band an der x-Achse
      const kg = w('graph') * k.labels;
      if (kg > 0.01) {
        const y0 = plotB.py(0);
        const pts = 160;
        for (let i = 0; i < pts; i++) {
          const u0 = lerp(x0, x1, i / pts);
          const u1 = lerp(x0, x1, (i + 1) / pts);
          const v = V.fn.f((u0 + u1) / 2);
          if (Math.abs(v) < 1e-9) continue;
          g.fillStyle = withAlpha(v > 0 ? col.pos() : col.neg(), (theme.dark ? 0.55 : 0.45) * kg);
          g.fillRect(plotB.px(u0), y0 - 3, plotB.px(u1) - plotB.px(u0) + 0.5, 6);
        }
      }
      // Schar: andere untere Grenzen (nur senkrecht verschoben)
      const kf = w('graph') * kFam.v * k.labels;
      if (kf > 0.01) {
        const D = V.fn.x;
        const span = D[1] - D[0];
        for (const s of [-0.3, -0.15, 0.15, 0.3]) {
          const a2 = clamp(V.a + s * span, D[0], D[1]);
          if (Math.abs(a2 - V.a) < 1e-6) continue;
          const F0 = V.fn.F(a2);
          strokePts(sample(plotB, (t) => V.fn.F(t) - F0, x0, x1, []), withAlpha(theme.muted, 0.7), 1.3, { dash: [5, 5], alpha: kf });
        }
      }
      // ganzer Graph von I (blass) und Spur bis x
      const full = kFull.v;
      if (full > 0.01) strokePts(sample(plotB, V.I, x0, lerp(x0, x1, k.reveal), []), withAlpha(col.I(), theme.dark ? 0.5 : 0.42), 2, { dash: [6, 5], alpha: full });
      const lo = Math.min(V.a, V.xs);
      const hi = Math.max(V.a, V.xs);
      strokePts(sample(plotB, V.I, lo, hi, []), col.I(), fs(3.4, 2.8), { glow: true });
      // Säule I(x) in der Farbe der Fläche
      const ix = V.I(V.xs);
      const yx = plotB.py(ix);
      const y0 = plotB.py(0);
      g.save();
      g.globalAlpha *= k.labels * (1 - w('diff') * 0.6);
      const bc = ix >= 0 ? col.pos() : col.neg();
      const grad = g.createLinearGradient(0, yx, 0, y0);
      grad.addColorStop(0, withAlpha(bc, theme.dark ? 0.75 : 0.65));
      grad.addColorStop(1, withAlpha(bc, 0.15));
      g.fillStyle = grad;
      roundRect(g, plotB.px(V.xs) - 3, Math.min(yx, y0), 6, Math.abs(y0 - yx), 3);
      g.fill();
      g.restore();
      // Sekante und Tangente
      const kd = w('diff') * kTan.v * k.labels;
      if (kd > 0.01) drawSecant(V, kd);
      // Hoch-, Tief- und Wendepunkte von I
      const km = w('graph') * kMark.v * k.labels;
      if (km > 0.01) drawFeaturesI(V, km);
      dot(plotB.px(V.a), plotB.py(0), col.a(), 5.5, k.labels);
      dot(plotB.px(V.xs), yx, col.I(), 6, k.labels);
      // Beschriftungen
      const m = meta();
      const name = m ? `${m.I}(${m.v})` : 'I_a(x)';
      fpill(r.x + 10, r.y + 18, m ? `\\c{I}{${name} = \\i{${N(V.a, 2)}}{${m.v}} ${m.f}(u) du}` : `\\c{I}{I_a(x) = \\i{a}{x} f(t) dt}`, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.I(), 0.5), maxW: r.w - 40 });
      if (w('diff') < 0.5) {
        const src = `\\c{I}{(${N(V.xs, 2)} | ${p.show ? NV(ix) : '?'})}`;
        const right = plotB.px(V.xs) < r.x + r.w * 0.7;
        fpill(plotB.px(V.xs) + (right ? 12 : -12), clamp(yx - 18, r.y + 46, r.y + r.h - 26), src, { align: right ? 'left' : 'right', size: fs(12, 11), alpha: k.labels, color: col.I(), bounds: r });
      }
      if ((Math.abs(plotB.px(V.a) - plotB.px(V.xs)) > 46 || w('graph') > 0.5) && w('diff') < 0.5) {
        const ay = clamp(y0 + 18, r.y + 46, r.y + r.h - 14);
        fpill(plotB.px(V.a), ay, m ? `${m.I}(${N(V.a, 2)}) = 0` : 'I_a(a) = 0', { size: fs(11.5, 11), alpha: k.labels * 0.9, color: col.a(), bounds: r });
      }
      plotB.end();
      g.restore();
    }

    function drawSecant(V: View, alpha: number): void {
      const r = plotB.rect;
      const x = V.x;
      const x2 = x + V.h;
      if (x2 > V.fn.x[1] + 1e-9) return;
      const y1 = V.I(x);
      const y2 = V.I(x2);
      const ms = (y2 - y1) / V.h;
      const mt = V.fn.f(x);
      const ext = (rng.x1.v - rng.x0.v) * 0.12;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      plotB.segment([x - ext, y1 - mt * ext], [x + V.h + ext * 1.5, y1 + mt * (V.h + ext * 1.5)], { color: withAlpha(col.f(), 0.85), width: 1.8, dash: [6, 4] });
      plotB.segment([x - ext, y1 - ms * ext], [x2 + ext, y2 + ms * ext], { color: col.h(), width: 2.4 });
      // Steigungsdreieck der Sekante
      plotB.segment([x, y1], [x2, y1], { color: withAlpha(col.h(), 0.7), width: 1.4 });
      plotB.segment([x2, y1], [x2, y2], { color: withAlpha(col.h(), 0.7), width: 1.4 });
      g.restore();
      dot(plotB.px(x2), plotB.py(y2), col.h(), 4.5, alpha);
      const sz = fs(12, 11);
      const ly = clamp(plotB.py((y1 + y2) / 2), r.y + 46, r.y + r.h - 40);
      const right = plotB.px(x2) + 140 < r.x + r.w;
      const lx = right ? plotB.px(x2) + 12 : plotB.px(x) - 12;
      fpill(lx, ly, `\\c{h}{m_{Sek} ${p.show ? `≈ ${N(ms, 3)}` : '= ?'}}`, { align: right ? 'left' : 'right', size: sz, alpha, border: withAlpha(col.h(), 0.6), bounds: r });
      fpill(lx, ly + 26, `\\c{f}{m_{Tan} = f(${N(x, 2)}) ${p.show ? `${eq(mt)} ${N(mt, 3)}` : '= ?'}}`, { align: right ? 'left' : 'right', size: sz, alpha, border: withAlpha(col.f(), 0.5), bounds: r });
    }

    function drawFeaturesI(V: View, alpha: number): void {
      const g = surface.g;
      const r = plotB.rect;
      const topR = plot.rect;
      const labels: { px: number; py: number; src: string; color: string; up: boolean }[] = [];
      const guide = (x: number, color: string) => {
        const px = plotB.px(x);
        g.save();
        g.globalAlpha *= alpha * 0.8;
        g.strokeStyle = withAlpha(color, 0.65);
        g.lineWidth = 1.2;
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(px, topR.y + 34);
        g.lineTo(px, r.y + r.h);
        g.stroke();
        g.restore();
      };
      for (const z of feat.zeros) {
        const y = V.I(z.x);
        const color = z.sign === 0 ? th().muted : z.sign > 0 ? col.neg() : col.pos();
        guide(z.x, color);
        dot(plotB.px(z.x), plotB.py(y), z.sign === 0 ? th().muted : col.I(), 5.5, alpha);
        const src = z.sign === 0 ? say(L('Terrasse', 'saddle')) : z.sign < 0 ? say(L('HP', 'max')) : say(L('TP', 'min'));
        labels.push({ px: plotB.px(z.x), py: plotB.py(y), src, color: z.sign === 0 ? th().muted : z.sign < 0 ? col.pos() : col.neg(), up: z.sign < 0 });
      }
      for (const e of feat.ext) {
        const y = V.I(e.x);
        guide(e.x, col.h());
        dot(plotB.px(e.x), plotB.py(y), col.h(), 5, alpha, true);
        labels.push({ px: plotB.px(e.x), py: plotB.py(y), src: say(L('WP', 'infl.')), color: col.h(), up: false });
      }
      for (const l of labels) fpill(l.px, l.py + (l.up ? -18 : 18), `\\t{${l.src}}`, { size: fs(11.5, 11), alpha: alpha * 0.95, color: l.color, bounds: r });
    }

    /** Ansicht „Berechnen“: Schar F + C, F(a) und F(b), Differenz als Klammer. */
    function drawF(V: View, now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const lab = axisLabels();
      plotB.setAxes({ x: { label: lab.x }, y: { label: lab.F } });
      plotB.setRangePadded([rng.x0.v, rng.x1.v], [rng.by0.v, rng.by1.v], { ...PAD(), right: fs(96, 70) });
      plotB.resize();
      g.save();
      g.globalAlpha *= alpha;
      plotB.begin();
      plotB.grid();
      plotB.axes();
      const r = plotB.rect;
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      const st = stepsK(now);
      const step = famSpacing(V.fn);
      const kf = kFam.v * k.labels;
      if (kf > 0.01) {
        for (let j = -3; j <= 3; j++) {
          if (j === 0) continue;
          const cc = V.c + j * step;
          strokePts(sample(plotB, (t) => V.fn.F(t) + cc, x0, x1, []), withAlpha(col.F(), theme.dark ? 0.4 : 0.32), 1.3, { alpha: kf * clamp01(1.4 - Math.abs(j) * 0.25) });
        }
      }
      const Fc = (t: number) => V.fn.F(t) + V.c;
      strokePts(sample(plotB, Fc, x0, lerp(x0, x1, k.reveal), []), col.F(), fs(3.2, 2.7), { glow: true });
      const a = V.a;
      const b = V.xs;
      const ya = plotB.py(Fc(a));
      const yb = plotB.py(Fc(b));
      const pa = plotB.px(a);
      const pb = plotB.px(b);
      const bx = r.x + r.w - fs(82, 60);
      const s1 = st[1];
      const s2 = st[2];
      const s3 = st[3];
      // Hilfslinien zu den Punkten
      g.save();
      g.globalAlpha *= k.labels;
      g.setLineDash([3, 4]);
      g.lineWidth = 1.3;
      g.strokeStyle = withAlpha(col.a(), 0.75 * s1);
      g.beginPath();
      g.moveTo(pa, plotB.py(0));
      g.lineTo(pa, ya);
      g.lineTo(lerp(pa, bx, s2), ya);
      g.stroke();
      g.strokeStyle = withAlpha(col.I(), 0.75 * s1);
      g.beginPath();
      g.moveTo(pb, plotB.py(0));
      g.lineTo(pb, yb);
      g.lineTo(lerp(pb, bx, s2), yb);
      g.stroke();
      g.setLineDash([]);
      g.restore();
      dot(pa, ya, col.a(), 5.5 * ease.outBack(s1), k.labels);
      dot(pb, yb, col.I(), 5.5 * ease.outBack(s1), k.labels);
      const sz = fs(12, 11);
      if (s1 > 0.05) {
        fpill(pa + (pa < pb ? -10 : 10), ya - 16, `\\c{a}{F(a)${V.c !== 0 ? ' + C' : ''}}`, { align: pa < pb ? 'right' : 'left', size: sz, alpha: s1 * k.labels, color: col.a(), bounds: r });
        fpill(pb + (pa < pb ? 10 : -10), yb - 16, `\\c{I}{F(b)${V.c !== 0 ? ' + C' : ''}}`, { align: pa < pb ? 'left' : 'right', size: sz, alpha: s1 * k.labels, color: col.I(), bounds: r });
      }
      // Klammer mit der Differenz
      if (s2 > 0.02) {
        const pos = Fc(b) - Fc(a) >= 0;
        const colr = pos ? col.pos() : col.neg();
        g.save();
        g.globalAlpha *= s2 * k.labels;
        const yStart = ya;
        const yEnd = ya + (yb - ya) * ease.outCubic(s2);
        g.fillStyle = withAlpha(colr, theme.dark ? 0.3 : 0.18);
        roundRect(g, bx - 7, Math.min(yStart, yEnd), 14, Math.abs(yEnd - yStart), 6);
        g.fill();
        arrowPx(bx, yStart, bx, yEnd, colr, 2.4, 9);
        g.restore();
        if (s3 > 0.02) {
          const val = Fc(b) - Fc(a);
          fpill(bx + 8, (ya + yb) / 2, `\\c{${pos ? 'p' : 'n'}}{Δ ${p.show ? `${eq(val)} ${NV(val)}` : '= ?'}}`, { align: 'left', size: sz, alpha: s3 * k.labels, border: withAlpha(colr, 0.6), bounds: r });
        }
      }
      const src = fnSrc();
      fpill(r.x + 10, r.y + 18, `\\c{F}{${src.F}${V.c !== 0 ? ` + C` : ''}}`, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.F(), 0.5), maxW: r.w - 40 });
      if (V.c !== 0 || kf > 0.5) fpill(r.x + r.w - 10, r.y + 18, `C = ${N(V.c, 2)}`, { align: 'right', size: fs(12, 11), alpha: k.labels, color: col.F(), bounds: r });
      plotB.end();
      g.restore();
    }

    /** Fortschritt der Schritte im Rechenweg (0 … 1 je Schritt; ohne Animation alles 1). */
    function stepsK(now: number): [number, number, number, number, number] {
      if (!steps) return [1, 1, 1, 1, 1];
      const t = now - steps.t0;
      const e = (i: number) => ease.outCubic(clamp01((t - 200 - i * 1100) / 650));
      return [e(0), e(1), e(2), e(3), e(4)];
    }

    /** Ansicht „Riemann“: Summen über n (logarithmisch) für alle vier Arten. */
    function drawR(V: View, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const exact = V.I(V.xs);
      plotB.setAxes({ x: { label: 'n', format: (v: number) => fmt.num(2 ** v, 0), minStep: 1 }, y: { label: meta() ? `${meta()!.I} in ${say(meta()!.uI)}` : 'S_n' } });
      plotB.setRangePadded([0, Math.log2(100)], [rng.by0.v, rng.by1.v], { ...PAD(), left: fs(52, 44) });
      plotB.resize();
      g.save();
      g.globalAlpha *= alpha;
      plotB.begin();
      plotB.grid();
      plotB.axes();
      const r = plotB.rect;
      plotB.hline(exact, { color: withAlpha(theme.text, 0.6), width: 1.4, dash: [6, 4] });
      const kinds: RiemannKind[] = ['left', 'right', 'mid', 'trap'];
      const colors: Record<RiemannKind, string> = { left: th().series[0]!, right: th().series[1]!, mid: th().series[2]!, trap: th().series[3]! };
      const cur = rmKind();
      const nShow = V.n;
      const reveal = k.reveal;
      for (const kk of kinds) {
        const list = conv[kk];
        if (!list.length) continue;
        const on = kk === cur;
        const pts: [number, number][] = [];
        const nMax = Math.max(1, Math.round(lerp(1, 100, reveal)));
        for (let n = 1; n <= nMax; n++) pts.push([plotB.px(Math.log2(n)), plotB.py(list[n - 1]!)]);
        strokePts(pts, colors[kk], on ? 2.8 : 1.4, { alpha: on ? 1 : 0.45, glow: on });
        if (on) {
          for (const n of REFINE_NS) if (n <= nMax) dot(plotB.px(Math.log2(n)), plotB.py(list[n - 1]!), colors[kk], 3.4, 0.9);
        }
      }
      const sNow = riemann(V.fn.f, V.a, V.xs, nShow, cur);
      const px = plotB.px(Math.log2(nShow));
      const py = plotB.py(sNow);
      g.save();
      g.globalAlpha *= k.labels;
      g.strokeStyle = withAlpha(col.h(), 0.6);
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(px, r.y + r.h);
      g.lineTo(px, py);
      g.stroke();
      g.setLineDash([]);
      g.restore();
      dot(px, py, colors[cur], 6.5, k.labels);
      const right = px < r.x + r.w * 0.6;
      fpill(px + (right ? 12 : -12), clamp(py - 18, r.y + 46, r.y + r.h - 26), `S_{${nShow}} ${p.show ? `≈ ${NV(sNow)}` : '= ?'}`, { align: right ? 'left' : 'right', size: fs(12, 11), alpha: k.labels, color: colors[cur], bounds: r });
      fpill(r.x + r.w - 10, plotB.py(exact) + (plotB.py(exact) < r.y + 60 ? 18 : -16), `\\i{a}{b} f ${p.show ? `${eq(exact)} ${NV(exact)}` : '= ?'}`, { align: 'right', size: fs(11.5, 11), alpha: k.labels * 0.95, color: theme.muted, bounds: r });
      fpill(r.x + 10, r.y + 18, say(L('Riemann-Summe S_n über n', 'Riemann sum S_n against n')), { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.h(), 0.5), maxW: r.w * 0.6 });
      plotB.end();
      g.restore();
    }

    /** Senkrechte Verbindung zwischen oberem und unterem Bild an der Stelle x. */
    function drawLink(V: View, k: Intro): void {
      const g = surface.g;
      if (bottomOf(mode()) === 'R') return;
      const px = plot.px(V.xs);
      const top = plot.py(0);
      const bot = plotB.rect.y + plotB.rect.h;
      g.save();
      g.globalAlpha *= 0.55 * k.labels * (1 - mw.riem.v);
      g.strokeStyle = col.I();
      g.lineWidth = 1.2;
      g.setLineDash([2, 4]);
      g.beginPath();
      g.moveTo(px, top);
      g.lineTo(px, bot);
      g.stroke();
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);

    /** Karte aus Formelzeilen (mit gestaffeltem Einblenden). */
    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number }[], right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad;
      const boxes = rows.map((r) => fit(r.src, maxW, r.size ?? fs(13.5, 12.5), r.color ?? th().text, r.weight ?? 600));
      const h = 36 + boxes.reduce((s, b, i) => s + rowH(b) + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 36;
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

    /** Fließtext-Zeilen (umbrechend) für Karten. */
    function textBlock(R: Rect, y: number, str: string, color: string, size: number, draw: boolean, weight = 500): number {
      const pad = fs(14, 12);
      const font = `${weight} ${size}px ${th().font}`;
      const lines = wrapText(str, R.w - 2 * pad, font);
      const lh = size * 1.32;
      if (draw) {
        const g = surface.g;
        g.font = font;
        g.fillStyle = color;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        lines.forEach((ln, i) => g.fillText(ln, R.x + pad, y + lh / 2 + i * lh));
      }
      return lines.length * lh;
    }

    function defCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const m = meta();
        const iv = V.I(V.xs);
        const rows = [
          { src: '\\c{I}{I_a(x) = \\i{a}{x} f(t) dt}', size: fs(15, 13.5) },
          { src: `\\c{I}{I_{${N(V.a, 2)}}(${N(V.xs, 2)})} ${p.show ? `${eq(iv)} \\b{${NV(iv)}}` : '= ?'}${m ? ` \\t{${say(m.uI)}}` : ''}`, size: fs(14, 13) },
          { src: `\\c{a}{I_a(a) = 0}  \\c{m}{${say(L('(leere Fläche)', '(empty area)'))}}`, size: fs(12.5, 11.5), color: th().muted },
          { src: `\\c{m}{${say(L('x < a: Fläche wird negativ gezählt', 'x < a: area is counted negatively'))}}`, size: fs(12, 11), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Integralfunktion', 'Integral function')), col.I(), rows);
      };
    }

    function balanceCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const pad = fs(14, 12);
        const h = fs(150, 138);
        if (measure) return h;
        const parts = areaParts(V.fn, V.a, V.xs);
        card({ ...R, h }, col.pos());
        cardTitle(R, say(L('Flächenbilanz', 'Signed area')), col.pos());
        const x0 = R.x + pad;
        const x1 = R.x + R.w - pad;
        const y = R.y + 40;
        const tot = Math.max(1e-9, parts.pos + parts.neg);
        // Balken: grüner und roter Anteil
        g.fillStyle = withAlpha(th().muted, 0.15);
        roundRect(g, x0, y, x1 - x0, 14, 7);
        g.fill();
        g.save();
        roundRect(g, x0, y, x1 - x0, 14, 7);
        g.clip();
        const wp = ((x1 - x0) * parts.pos * k.stagger) / tot;
        const wn = ((x1 - x0) * parts.neg * k.stagger) / tot;
        g.fillStyle = col.pos();
        g.fillRect(x0, y, wp, 14);
        g.fillStyle = col.neg();
        g.fillRect(x0 + wp, y, wn, 14);
        g.restore();
        const sz = fs(13, 12);
        const rowsSrc = [
          `\\c{p}{A^+ ${p.show ? `≈ ${NV(parts.pos)}` : '= ?'}}   \\c{n}{A^− ${p.show ? `≈ ${NV(parts.neg)}` : '= ?'}}`,
          `${say(L('Integral', 'Integral'))}: ${V.xs >= V.a ? '' : '−('}A^+ − A^−${V.xs >= V.a ? '' : ')'} ${p.show ? `≈ \\b{${NV(parts.integral)}}` : '= ?'}`,
          `${say(L('Flächeninhalt', 'Area'))}: A^+ + A^− ${p.show ? `≈ ${NV(parts.area)}` : '= ?'}`,
        ];
        let yy = y + 26;
        rowsSrc.forEach((s, i) => {
          const b = fit(s, R.w - 2 * pad, sz, i === 0 ? th().text : th().text, 650);
          const a = clamp01(k.stagger * 4 - i);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          b.draw(g, x0, yy + b.asc);
          g.restore();
          yy += rowH(b) + 9;
        });
        return h;
      };
    }

    function appCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const m = meta();
        if (!m) return 0;
        const g = surface.g;
        const pad = fs(14, 12);
        const sz = fs(12.5, 11.5);
        const iv = V.I(V.xs);
        const tpl = iv >= 0 || V.xs < V.a ? m.pos : m.neg;
        const sentence = say(tpl)
          .replace('{a}', N(V.a, 2))
          .replace('{b}', N(V.xs, 2))
          .replace(/\{v\}/g, p.show ? NV(Math.abs(iv)) : '?');
        const rate = `${m.f}: ${say(m.rate)} ${say(L('in', 'in'))} ${say(m.uF)}`;
        const amt = `${m.I}: ${say(m.amount)} ${say(L('in', 'in'))} ${say(m.uI)}`;
        const meas = (draw: boolean, y0: number) => {
          let y = y0;
          y += textBlock(R, y, rate, col.f(), sz, draw, 650) + 2;
          y += textBlock(R, y, amt, col.I(), sz, draw, 650) + 8;
          y += textBlock(R, y, sentence, th().text, sz + 0.5, draw, 650) + 6;
          y += textBlock(R, y, say(m.note), th().muted, sz - 0.5, draw, 500);
          return y - y0;
        };
        // Bestandsbalken (Anteil am größten Bestand im Bereich)
        const barH = 12;
        const h = 36 + meas(false, 0) + barH + 22;
        if (measure) return h;
        card({ ...R, h }, col.I());
        cardTitle(R, say(m.title), col.I());
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        let y = R.y + 36;
        const D = V.fn.x;
        const top = rangeOf((t) => Math.abs(V.I(t)), D[0], D[1], 120).hi || 1;
        const frac = clamp01(Math.abs(iv) / top);
        const x0 = R.x + pad;
        const x1 = R.x + R.w - pad;
        g.fillStyle = withAlpha(th().muted, 0.15);
        roundRect(g, x0, y, x1 - x0, barH, barH / 2);
        g.fill();
        const grad = g.createLinearGradient(x0, 0, x1, 0);
        const bc = iv >= 0 ? col.pos() : col.neg();
        grad.addColorStop(0, mixColor(bc, '#ffffff', 0.25));
        grad.addColorStop(1, bc);
        g.fillStyle = grad;
        roundRect(g, x0, y, Math.max(barH, (x1 - x0) * frac), barH, barH / 2);
        if (frac > 0.002) g.fill();
        y += barH + 12;
        meas(true, y);
        g.restore();
        return h;
      };
    }

    function fnCard(k: Intro): CardFn {
      return (R, measure) => {
        const src = fnSrc();
        const rows: { src: string; color?: string; size?: number }[] = [
          { src: `\\c{f}{${src.f}}`, size: fs(13.5, 12.5) },
          { src: `\\c{F}{${src.F}}`, size: fs(13.5, 12.5) },
        ];
        if (src.note) rows.push({ src: `\\c{m}{${src.note}}`, size: fs(12, 11), color: th().muted });
        return formulaCard(R, measure, k, say(L('Funktion und Stammfunktion', 'Function and antiderivative')), col.F(), rows);
      };
    }

    function hsCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const x = V.x;
        const dq = stripMean(V.fn, x, V.h);
        const mm = stripRange(V.fn, x, V.h, 48);
        const fx = V.fn.f(x);
        const rows = [
          { src: `\\f{I_a(x + \\c{h}{h}) − I_a(x)}{\\c{h}{h}} = \\f{1}{\\c{h}{h}}\\i{x}{x+h} f(t) dt`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\c{h}{h = ${N(V.h, 3)}}:  \\c{h}{m_{Sek}} ${p.show ? `≈ ${N(dq, 4)}` : '= ?'}`, size: fs(13.5, 12.5) },
          { src: `\\c{m}{min ≈ ${N(mm.min, 3)} ≤} \\c{h}{${p.show ? N(dq, 3) : '?'}} \\c{m}{≤ max ≈ ${N(mm.max, 3)}}`, size: fs(12.5, 11.5) },
          { src: `h → 0:  \\c{h}{m_{Sek}} → \\c{f}{f(${N(x, 2)}) ${p.show ? `${eq(fx)} ${N(fx, 4)}` : '= ?'}}`, size: fs(13.5, 12.5) },
          { src: `\\b{\\c{I}{I_a′(x)} = \\c{f}{f(x)}}`, size: fs(15.5, 14) },
        ];
        return formulaCard(R, measure, k, say(L('Hauptsatz, Teil 1', 'Fundamental theorem, part 1')), col.h(), rows);
      };
    }

    function tableCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const hs = [1, 0.5, 0.1, 0.01, 0.001];
        const fit2 = (hv: number) => V.x + hv <= V.fn.x[1] + 1e-9;
        const tab = quotientTable(V.fn, V.x, hs.filter(fit2));
        const rH = fs(21, 19);
        const h = 58 + tab.length * rH + 6;
        if (measure) return h;
        card({ ...R, h }, col.h());
        cardTitle(R, say(L('Tabelle: h → 0', 'Table: h → 0')), col.h());
        const cols = [R.x + pad, R.x + pad + (R.w - 2 * pad) * 0.62, R.x + R.w - pad];
        const hy = R.y + 42;
        g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText('h', cols[0]!, hy);
        g.textAlign = 'right';
        g.fillText(say(L('Differenzenquotient', 'difference quotient')), cols[1]!, hy);
        g.fillText(say(L('Abweichung', 'error')), cols[2]!, hy);
        // Zeile, die zum aktuellen h passt
        let best = 0;
        tab.forEach((t, i) => {
          if (Math.abs(Math.log(t.h / V.h)) < Math.abs(Math.log(tab[best]!.h / V.h))) best = i;
        });
        tab.forEach((t, i) => {
          const y = hy + 18 + i * rH;
          const a = clamp01(k.stagger * (tab.length + 2) - i);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          if (i === best) {
            g.fillStyle = withAlpha(col.h(), theme.dark ? 0.2 : 0.12);
            roundRect(g, R.x + pad - 6, y - rH / 2 + 1, R.w - 2 * pad + 12, rH - 2, 7);
            g.fill();
          }
          g.font = `650 ${fs(12, 11.5)}px ${theme.font}`;
          g.fillStyle = theme.text;
          g.textAlign = 'left';
          g.fillText(fmt.num(t.h, 3), cols[0]!, y);
          g.textAlign = 'right';
          g.fillText(p.show ? fmt.num(t.q, 5) : '?', cols[1]!, y);
          g.fillStyle = theme.muted;
          g.fillText(p.show ? fmt.signed(t.err, 5) : '?', cols[2]!, y);
          g.restore();
        });
        return h;
      };
    }

    function calcCard(V: View, now: number, k: Intro): CardFn {
      return (R, measure) => {
        const st = stepsK(now);
        const src = fnSrc();
        const a = V.a;
        const b = V.xs;
        const Fa = V.fn.F(a);
        const Fb = V.fn.F(b);
        const val = Fb - Fa;
        const m = meta();
        const fName = m ? `${m.f}(${m.v})` : 'f(x)';
        const dv = m ? `d${m.v}` : 'dx';
        const s = (v: string) => (p.show ? v : '?');
        const C = V.c;
        const cTxt = Math.abs(C) > 1e-9 ? ` ${C > 0 ? '+' : '−'} ${N(Math.abs(C), 2)}` : '';
        const fsz = fs(13.5, 12.5);
        const rows: { src: string; color?: string; size?: number; gap?: number; at?: number }[] = [
          { src: `\\c{m}{① ${say(L('Stammfunktion bestimmen', 'Find an antiderivative'))}}`, size: fs(12, 11), color: th().muted, at: st[0], gap: 4 },
          { src: `\\c{F}{${src.F}${cTxt ? ' + C' : ''}}`, size: fsz, at: st[0], gap: 10 },
          { src: `\\c{m}{② ${say(L('Grenzen einsetzen', 'Insert the limits'))}}`, size: fs(12, 11), color: th().muted, at: st[1], gap: 4 },
          { src: `\\c{I}{F(${N(b, 2)})${cTxt} ${eq(Fb + C)} ${s(NV(Fb + C))}}`, size: fsz, at: st[1], gap: 4 },
          { src: `\\c{a}{F(${N(a, 2)})${cTxt} ${eq(Fa + C)} ${s(NV(Fa + C))}}`, size: fsz, at: st[1], gap: 10 },
          { src: `\\c{m}{③ ${say(L('Differenz bilden', 'Take the difference'))}}`, size: fs(12, 11), color: th().muted, at: st[2], gap: 4 },
          { src: `\\i{${N(a, 2)}}{${N(b, 2)}} ${fName} ${dv} = \\c{I}{F(${N(b, 2)})} − \\c{a}{F(${N(a, 2)})}`, size: fsz, at: st[2], gap: 10 },
          { src: `= ${s(NV(Fb + C))} − ${p.show && Fa + C < 0 ? '(' : ''}${s(NV(Fa + C))}${p.show && Fa + C < 0 ? ')' : ''} ${p.show ? `${eq(val)} \\b{${NV(val)}}` : '= ?'}${m ? ` \\t{${say(m.uI)}}` : ''}`, size: fs(15, 13.5), at: st[3], gap: 10 },
          { src: `\\c{m}{(F(b) + C) − (F(a) + C) = F(b) − F(a)}`, size: fs(12, 11), color: th().muted, at: st[4], gap: 4 },
          { src: `\\c{m}{→ ${appKey() === 'cost' && kind() === 'app' ? say(L('die Fixkosten C kürzen sich', 'the fixed cost C cancels')) : say(L('die Konstante C kürzt sich', 'the constant C cancels'))}}`, size: fs(12, 11), color: th().muted, at: st[4] },
        ];
        if (src.noAnti) rows.push({ src: `\\c{n}{${say(L('Sprungstelle: I ist dort nicht differenzierbar', 'Jump: I is not differentiable there'))}}`, size: fs(12, 11), at: st[4] });
        return formulaCard(R, measure, k, say(L('Rechenweg', 'Working')), col.F(), rows, `C = ${N(C, 2)}`);
      };
    }

    function graphCard(k: Intro): CardFn {
      return (R, measure) => {
        const list = (xs: number[]) => (xs.length ? xs.slice(0, 3).map((x) => N(x, 2)).join('; ') + (xs.length > 3 ? ' …' : '') : '–');
        const hp = feat.zeros.filter((z) => z.sign < 0).map((z) => z.x);
        const tp = feat.zeros.filter((z) => z.sign > 0).map((z) => z.x);
        const tr = feat.zeros.filter((z) => z.sign === 0).map((z) => z.x);
        const wp = feat.ext.map((e) => e.x);
        const s = (v: string) => (p.show ? v : '?');
        const rows: { src: string; color?: string; size?: number; gap?: number }[] = [
          { src: `\\c{p}{f > 0} ⇒ \\c{I}{I_a ${say(L('steigt', 'increases'))}},  \\c{n}{f < 0} ⇒ \\c{I}{I_a ${say(L('fällt', 'decreases'))}}`, size: fs(13, 12) },
          { src: `\\c{m}{${say(L('f = 0 mit VZW + → −', 'f = 0, sign + → −'))}} ⇒ \\c{p}{${say(L('HP', 'max'))}: x ≈ ${s(list(hp))}}`, size: fs(12.5, 11.5) },
          { src: `\\c{m}{${say(L('f = 0 mit VZW − → +', 'f = 0, sign − → +'))}} ⇒ \\c{n}{${say(L('TP', 'min'))}: x ≈ ${s(list(tp))}}`, size: fs(12.5, 11.5) },
          { src: `\\c{m}{${say(L('Extremstelle von f', 'extremum of f'))}} ⇒ \\c{h}{${say(L('WP', 'inflection'))}: x ≈ ${s(list(wp))}}`, size: fs(12.5, 11.5) },
        ];
        if (tr.length) rows.push({ src: `\\c{m}{${say(L('f = 0 ohne VZW', 'f = 0, no sign change'))}} ⇒ ${say(L('Terrassenpunkt', 'saddle point'))}: x ≈ ${s(list(tr))}`, size: fs(12, 11) });
        return formulaCard(R, measure, k, say(L('Graph f ↔ Graph I', 'Graph f ↔ graph I')), col.I(), rows);
      };
    }

    function shiftCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const rows: { src: string; color?: string; size?: number; gap?: number }[] = [
          { src: `\\c{a}{a = ${N(V.a, 2)}}:  I_a(a) = 0`, size: fs(13.5, 12.5) },
          { src: `I_{\\c{a}{b}}(x) = I_a(x) − I_a(\\c{a}{b})`, size: fs(13.5, 12.5) },
          { src: `\\c{m}{${say(L('anderes a: Graph nur senkrecht verschoben', 'other a: graph only shifted vertically'))}}`, size: fs(12, 11), color: th().muted },
          { src: `\\c{m}{${say(L('Extrem- und Wendestellen bleiben gleich', 'extrema and inflection points stay'))}}`, size: fs(12, 11), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Untere Grenze a', 'Lower limit a')), col.a(), rows);
      };
    }

    function riemCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const n = V.n;
        const kindNow = rmKind();
        const sNow = riemann(V.fn.f, V.a, V.xs, n, kindNow);
        const ex = V.I(V.xs);
        const hv = (V.xs - V.a) / n;
        const def: Record<RiemannKind, string> = {
          left: 'S_n = h · (f(x_0) + … + f(x_{n−1}))',
          right: 'S_n = h · (f(x_1) + … + f(x_n))',
          mid: 'S_n = h · \\t{Σ} f(\\f{x_{i−1} + x_i}{2})',
          trap: 'S_n = h · (\\f{f(x_0)}{2} + f(x_1) + … + \\f{f(x_n)}{2})',
        };
        const s = (v: string) => (p.show ? v : '?');
        const rows: { src: string; color?: string; size?: number; gap?: number }[] = [
          { src: `\\c{h}{${def[kindNow]}}`, size: fs(13, 12) },
          { src: `h = \\f{b − a}{n} = \\f{${N(V.xs - V.a, 2)}}{${n}} ${eq(hv, 4)} ${N(hv, 4)}`, size: fs(13, 12) },
          { src: `\\c{h}{S_{${n}} ≈ ${s(NV(sNow))}}   \\i{a}{b} f ${eq(ex)} ${s(NV(ex))}`, size: fs(14, 13) },
          { src: `\\c{m}{${say(L('Abweichung', 'error'))}: ${s(fmt.signed(clean(sNow - ex, 4), 4))}}`, size: fs(12.5, 11.5), color: th().muted },
          { src: `\\c{m}{n → ∞: S_n → \\i{a}{b} f(x) dx}`, size: fs(12.5, 11.5), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Riemann-Summe', 'Riemann sum')), col.h(), rows, `n = ${n}`);
      };
    }

    function compareCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const kinds: RiemannKind[] = ['left', 'right', 'mid', 'trap'];
        const names: Record<RiemannKind, Txt> = { left: L('links', 'left'), right: L('rechts', 'right'), mid: L('Mitte', 'midpoint'), trap: L('Trapez', 'trapezoid') };
        const colors: Record<RiemannKind, string> = { left: theme.series[0]!, right: theme.series[1]!, mid: theme.series[2]!, trap: theme.series[3]! };
        const rH = fs(21, 19);
        const h = 58 + kinds.length * rH + 6;
        if (measure) return h;
        card({ ...R, h });
        cardTitle(R, say(L('Vergleich bei gleichem n', 'Comparison for the same n')), theme.muted, `n = ${V.n}`);
        const ex = V.I(V.xs);
        const cols = [R.x + pad + 14, R.x + pad + (R.w - 2 * pad) * 0.64, R.x + R.w - pad];
        const hy = R.y + 42;
        g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText(say(L('Art', 'type')), cols[0]!, hy);
        g.textAlign = 'right';
        g.fillText('S_n', cols[1]!, hy);
        g.fillText(say(L('Abweichung', 'error')), cols[2]!, hy);
        kinds.forEach((kk, i) => {
          const y = hy + 18 + i * rH;
          const v = riemann(V.fn.f, V.a, V.xs, V.n, kk);
          const a = clamp01(k.stagger * 6 - i);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          if (kk === rmKind()) {
            g.fillStyle = withAlpha(colors[kk], theme.dark ? 0.2 : 0.12);
            roundRect(g, R.x + pad - 6, y - rH / 2 + 1, R.w - 2 * pad + 12, rH - 2, 7);
            g.fill();
          }
          g.fillStyle = colors[kk];
          g.beginPath();
          g.arc(R.x + pad + 4, y, 4, 0, TAU);
          g.fill();
          g.font = `650 ${fs(12, 11.5)}px ${theme.font}`;
          g.fillStyle = theme.text;
          g.textAlign = 'left';
          g.fillText(say(names[kk]), cols[0]!, y);
          g.textAlign = 'right';
          g.fillText(p.show ? fmt.num(v, 4) : '?', cols[1]!, y);
          g.fillStyle = theme.muted;
          g.fillText(p.show ? fmt.signed(clean(v - ex, 4), 4) : '?', cols[2]!, y);
          g.restore();
        });
        return h;
      };
    }

    function cardsFor(m: Mode, V: View, now: number, k: Intro): CardFn[] {
      const app = kind() === 'app';
      const list: CardFn[] = [];
      if (m === 'area') {
        list.push(defCard(V, k), balanceCard(V, k));
        list.push(app ? appCard(V, k) : fnCard(k));
      } else if (m === 'diff') {
        list.push(hsCard(V, k), tableCard(V, k));
        if (app) list.push(appCard(V, k));
      } else if (m === 'calc') {
        list.push(calcCard(V, now, k), fnCard(k));
        if (app) list.push(appCard(V, k));
      } else if (m === 'graph') {
        list.push(graphCard(k), shiftCard(V, k));
        list.push(app ? appCard(V, k) : fnCard(k));
      } else {
        list.push(riemCard(V, k), compareCard(V, k));
        if (app) list.push(appCard(V, k));
      }
      return list;
    }

    function drawColumn(C: Rect, V: View, now: number, k: Intro): void {
      const g = surface.g;
      const list = cardsFor(mode(), V, now, k);
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !regions().wide && C.w >= 420;
      const place = (fn: CardFn, R: Rect, i: number) => {
        const hh = fn(R, true);
        if (hh <= 0 || hh > R.h + 1) return -1;
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        fn({ ...R, h: Math.min(hh, R.h) }, false);
        g.restore();
        return hh;
      };
      if (two) {
        const cw = (C.w - gap) / 2;
        let yL = C.y;
        let yR = C.y;
        list.forEach((fn, i) => {
          if (i === 0) {
            const hh = place(fn, { x: C.x, y: C.y, w: C.w, h: C.h }, i);
            if (hh >= 0) yL = yR = C.y + hh + gap;
            return;
          }
          const leftCol = yL <= yR;
          const x = leftCol ? C.x : C.x + cw + gap;
          const y = leftCol ? yL : yR;
          const hh = place(fn, { x, y, w: cw, h: C.y + C.h - y }, i);
          if (hh < 0) return;
          if (leftCol) yL += hh + gap;
          else yR += hh + gap;
        });
        return;
      }
      let y = C.y;
      list.forEach((fn, i) => {
        const hh = place(fn, { x: C.x, y, w: C.w, h: C.y + C.h - y }, i);
        if (hh >= 0) y += hh + gap;
      });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const fn = exactFn();
      const a = lim(p.a);
      const b = lim(p.x);
      const src = fnSrc();
      const m = meta();
      const v = (s: string) => `<var>${s}</var>`;
      ctx.readout('fn', { html: `${toHtml(src.f)}<br>${toHtml(src.F)}${src.note ? ` (${src.note})` : ''}` });
      const iv = integralFn(fn, a, b);
      const u = m ? ` ${say(m.uI)}` : '';
      const dv = m ? m.v : 'x';
      const fN = m ? m.f : 'f';
      ctx.readout('int', { html: `∫<sub>${N(a, 2)}</sub><sup>${N(b, 2)}</sup> ${v(fN)}(${v(dv)}) d${v(dv)} = ${v('F')}(${N(b, 2)}) − ${v('F')}(${N(a, 2)}) = ${NV(fn.F(b))} − ${fn.F(a) < 0 ? `(${NV(fn.F(a))})` : NV(fn.F(a))} ${eq(iv)} <strong>${NV(iv)}${u}</strong>` });
      const parts = areaParts(fn, a, b);
      ctx.readout('bal', { html: `<var>A</var><sup>+</sup> ≈ ${NV(parts.pos)}, <var>A</var><sup>−</sup> ≈ ${NV(parts.neg)} · ${say(L('Flächeninhalt', 'area'))} ${v('A')}<sup>+</sup> + ${v('A')}<sup>−</sup> ≈ ${NV(parts.area)}${u}` });
      if (mode() === 'diff' && b + p.h <= fn.x[1] + 1e-9) {
        const dq = stripMean(fn, b, p.h);
        const fx = fn.f(b);
        ctx.readout('dq', { html: `<span class="frac"><span>${v('I')}(${v('x')} + ${v('h')}) − ${v('I')}(${v('x')})</span><span>${v('h')}</span></span> ≈ ${N(dq, 4)} (${v('h')} = ${N(p.h, 2)}) → ${v('f')}(${N(b, 2)}) ${eq(fx)} ${N(fx, 4)}` });
      } else ctx.readout('dq', null);
      if (mode() === 'riem') {
        const s = riemann(fn.f, a, b, p.n, rmKind());
        ctx.readout('riem', { html: `${v('S')}<sub>${p.n}</sub> ≈ <strong>${NV(s)}</strong> · ${say(L('Abweichung', 'error'))} ${fmt.signed(clean(s - iv, 4), 4)}` });
      } else ctx.readout('riem', null);
      if (mode() === 'graph') {
        const list = (xs: number[]) => (xs.length ? xs.map((x) => N(x, 3)).join('; ') : '–');
        ctx.readout('feat', {
          html: `${say(L('Extremstellen', 'Extrema'))} (${say(L('Nullstellen von f', 'zeros of f'))}): ${list(feat.zeros.filter((z) => z.sign !== 0).map((z) => z.x))} · ${say(L('Wendestellen', 'Inflection points'))} (${say(L('Extremstellen von f', 'extrema of f'))}): ${list(feat.ext.map((e) => e.x))}`,
        });
      } else ctx.readout('feat', null);
      if (m) {
        const tpl = iv >= 0 || b < a ? m.pos : m.neg;
        ctx.readout('sit', { html: say(tpl).replace('{a}', N(a, 2)).replace('{b}', N(b, 2)).replace(/\{v\}/g, NV(Math.abs(iv))) });
      } else ctx.readout('sit', null);
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      if (morph) {
        const t = (now - morph.t0) / morph.dur;
        if (t >= 1) {
          morph = null;
          morphK = 1;
        } else {
          morphK = ease.inOutCubic(clamp01(t));
          anim = true;
        }
      }
      const chans: Chan[] = [A, X, Hh, Cc, kMark, kFam, kTan, kFull, ...Object.values(rng), ...Object.values(mw), ...Object.values(CC)];
      for (const c of chans) if (c.step(now, dt)) anim = true;
      if (grow && now - grow.t0 > grow.dur) grow = null;
      if (shrink && now - shrink.t0 > shrink.dur) shrink = null;
      if (refine && now - refine.t0 > refine.step * REFINE_NS.length + 400) refine = null;
      if (steps && now - steps.t0 > 6000) steps = null;
      if (sweep && now - sweep.t0 > sweep.dur) sweep = null;
      if (grow || shrink || refine || steps || sweep || nFrom || intro !== null || dragging()) anim = true;
      const k = introState(now);
      const V = viewOf(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawTop(V, now, k);
      // unteres Bild, beim Wechsel der Art überblendet
      const cur = bottomOf(mode());
      let fadeIn = 1;
      if (bottomFade) {
        const t = (now - bottomFade.t0) / 560;
        if (t >= 1 || bottomFade.from === cur) bottomFade = null;
        else {
          fadeIn = ease.outCubic(clamp01(t));
          anim = true;
        }
      }
      const drawBottom = (b: Bottom, alpha: number) => {
        if (b === 'I') drawI(V, k, alpha);
        else if (b === 'F') drawF(V, now, k, alpha);
        else drawR(V, k, alpha);
      };
      if (bottomFade && fadeIn < 1) {
        g.save();
        g.translate(0, -fadeIn * 8);
        drawBottom(bottomFade.from, 1 - fadeIn);
        g.restore();
      }
      g.save();
      g.translate(0, (1 - fadeIn) * 12);
      drawBottom(cur, fadeIn);
      g.restore();
      drawLink(V, k);
      g.restore();
      drawColumn(R.col, V, now, k);
      if (cardFade !== null) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function startMorph(now: number, dur = 750): void {
      if (reduced()) {
        morph = null;
        morphK = 1;
        return;
      }
      morph = { from: shownFn(), t0: now, dur };
      morphK = 0;
    }

    function retargetCoefs(now: number, instant: boolean, quick: boolean): void {
      for (const key of COEF_KEYS) {
        const v = p[key] as number;
        if (instant || reduced()) CC[key].jump(v);
        else if (quick) CC[key].follow(v, dragging() ? 0.06 : 0.16);
        else CC[key].glide(v, 700, 0, now);
      }
    }

    function retargetLimits(now: number, instant: boolean, source: string): void {
      const a = lim(p.a);
      const x = lim(p.x);
      if (instant || reduced()) {
        A.jump(a);
        X.jump(x);
        Hh.jump(p.h);
        Cc.jump(p.c);
        return;
      }
      if (source === 'replace') {
        A.glide(a, 800, 0, now);
        X.glide(x, 900, 120, now);
        Hh.glide(p.h, 700, 0, now);
        Cc.glide(p.c, 800, 0, now);
      } else {
        const tau = dragging() ? 0.05 : 0.2;
        A.follow(a, tau);
        X.follow(x, tau);
        Hh.follow(p.h, tau);
        Cc.follow(p.c, dragging() ? 0.05 : 0.25);
      }
    }

    function retargetModes(now: number, instant: boolean): void {
      for (const m of MODES) {
        const goal = m === mode() ? 1 : 0;
        if (instant || reduced()) mw[m].jump(goal);
        else if (mw[m].goal !== goal) mw[m].glide(goal, 560, goal ? 120 : 0, now);
      }
      const flags: [Chan, boolean][] = [
        [kMark, p.mark],
        [kFam, p.fam],
        [kTan, p.tan],
        [kFull, p.full],
      ];
      for (const [c, on] of flags) {
        if (instant || reduced()) c.jump(on ? 1 : 0);
        else c.follow(on ? 1 : 0, 0.18);
      }
    }

    function cancelStories(): void {
      grow = null;
      shrink = null;
      refine = null;
      steps = null;
      sweep = null;
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const fnChanged = changed.has('kind') || changed.has('fn') || changed.has('app');
        // Beim eigenen Wechsel der Funktion passende Grenzen einstellen
        if (source === 'input' && fnChanged) {
          if (kind() === 'app') {
            const ap = APPS[appKey()];
            ctx.set({ a: ap.a, x: ap.b, h: ap.h, n: ap.n, c: ap.c });
          } else {
            const st = FN_START[fnKey()];
            ctx.set({ a: st.a, x: st.x, h: st.h, c: 0 });
          }
        }
        // Grenzen im Definitionsbereich halten (nur bei eigener Eingabe)
        if (source === 'input' && (changed.has('a') || changed.has('x'))) {
          const a = lim(p.a);
          const x = lim(p.x);
          if (a !== p.a || x !== p.x) ctx.set({ a, x });
        }
        if (source === 'input' && changed.has('h')) {
          const D = exactFn().x;
          if (p.x + p.h > D[1]) ctx.set({ h: Math.max(H_MIN, Math.floor((D[1] - p.x) * 100) / 100) });
        }
        const instant = source === 'init';
        if (source === 'input' || source === 'replace') {
          if ([...changed].some((key) => key !== 'show' && key !== 'full' && key !== 'mark' && key !== 'fam' && key !== 'tan')) cancelStories();
        }
        if (fnChanged && !instant) startMorph(now, source === 'replace' ? 850 : 750);
        const coefChanged = COEF_KEYS.some((key) => changed.has(key));
        retargetCoefs(now, instant, coefChanged && source !== 'replace');
        retargetLimits(now, instant, source);
        if (changed.has('mode') && !instant && mode() !== prevMode) {
          if (bottomOf(prevMode) !== bottomOf(mode()) && !reduced()) bottomFade = { t0: now, from: bottomOf(prevMode) };
          if (!reduced()) cardFade = now;
        }
        if ((changed.has('n') || changed.has('rm')) && !instant && !refine && !reduced()) nFrom = { n: changed.has('n') ? prevN : p.n, kind: changed.has('rm') ? prevRm : rmKind(), t0: now };
        feat = features(exactFn());
        retargetModes(now, instant);
        retargetRanges(now, instant);
        computeConv();
        // Bereich des Konvergenzdiagramms
        if (mode() === 'riem') {
          let lo = Infinity;
          let hi = -Infinity;
          for (const list of Object.values(conv)) for (let n = 0; n < list.length; n++) {
            lo = Math.min(lo, list[n]!);
            hi = Math.max(hi, list[n]!);
          }
          const span = Math.max(0.2, hi - lo);
          if (instant || reduced()) {
            rng.by0.jump(lo - span * 0.12);
            rng.by1.jump(hi + span * 0.22);
          } else {
            rng.by0.glide(lo - span * 0.12, 700, 0, now);
            rng.by1.glide(hi + span * 0.22, 700, 0, now);
          }
        }
        if (source === 'init') {
          if (!reduced()) intro = now;
          if (intro !== null) {
            // Einstieg: x läuft von a zur oberen Grenze (die Fläche füllt sich)
            A.jump(lim(p.a));
            X.jump(lim(p.x));
          }
        }
        prevMode = mode();
        prevN = p.n;
        prevRm = rmKind();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        cancelStories();
        if (id === 'grow') {
          if (!reduced()) grow = { t0: now, dur: 2400 };
        } else if (id === 'shrink') {
          const from = Math.max(p.h, 0.2);
          if (!reduced()) shrink = { t0: now, dur: 3600, from };
          ctx.set({ h: H_MIN });
          Hh.jump(H_MIN);
        } else if (id === 'steps') {
          if (!reduced()) steps = { t0: now };
        } else if (id === 'refine') {
          if (!reduced()) refine = { t0: now, step: 800 };
          nFrom = null;
          ctx.set({ n: 64 });
        } else if (id === 'sweep') {
          if (!reduced()) sweep = { t0: now, dur: 5200 };
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});

