import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  coefficients,
  convergenceAt,
  correctDecimals,
  degreeForDecimals,
  factorial,
  fnDerivative,
  FNS,
  lagrangeBound,
  lagrangeSharp,
  matchOrder,
  remainder,
  sameAsPrevious,
  smallAngleError,
  smallAngleLimit,
  smallAngleRelError,
  smallAngleRelLimit,
  taylor,
  toDeg,
  toRad,
  validInterval,
  type FnKey,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Höchster Grad. */
const NMAX = 15;
/** „Alle Grade durchlaufen“ geht bis zu diesem Grad … */
const RUN_N = 12;
/** … mit dieser Zeit je Grad (ms). */
const RUN_STEP_MS = 620;
/** Grenzen der Kleinwinkelnäherung (einmal berechnet). */
const SMALL_ABS = smallAngleLimit(0.01);
const SMALL_REL = smallAngleRelLimit(0.01);

type ViewKey = 'approx' | 'terms' | 'band' | 'match' | 'conv' | 'calc' | 'small';
type Vals = Record<string, unknown>;
const isView =
  (...vs: ViewKey[]) =>
  (v: Vals) =>
    vs.includes(v.view as ViewKey);

/** Bildausschnitt und Name je Funktion. */
const VIEW: Record<FnKey, { x: [number, number]; y: [number, number]; name: string; plain: string }> = {
  sin: { x: [-7, 7], y: [-3, 3], name: '\\t{sin} x', plain: 'sin x' },
  cos: { x: [-7, 7], y: [-3, 3], name: '\\t{cos} x', plain: 'cos x' },
  exp: { x: [-4, 4], y: [-2, 10], name: 'e^x', plain: 'eˣ' },
  ln: { x: [-1.6, 4], y: [-4, 3], name: '\\t{ln}(1 + x)', plain: 'ln(1 + x)' },
  geo: { x: [-3, 3], y: [-4, 6], name: '\\f{1}{1 − x}', plain: '1/(1 − x)' },
};

/** Hochgestellte und tiefgestellte Ziffern. */
const sup = (s: string) =>
  s
    .replace('-', '⁻')
    .split('')
    .map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)] ?? c)
    .join('');
const subDigits = (n: number) =>
  String(n)
    .split('')
    .map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])
    .join('');

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

/** Treppen-Verlauf für „Alle Grade durchlaufen“: je Grad ein weicher Schritt, danach kurz stehen bleiben. */
function stairs(steps: number): (t: number) => number {
  return (t) => {
    const s = clamp01(t) * steps;
    const k = Math.min(steps - 1, Math.floor(s));
    return (k + ease.inOutCubic(clamp01((s - k) / 0.55))) / steps;
  };
}

/**
 * Taylorpolynome in sieben Ansichten:
 * – „Näherung“: Tₙ schmiegt sich an der Entwicklungsstelle a an f; Prüfstelle mit Fehler,
 *   Lagrange-Abschätzung (auch die schärfere bei Tₙ = Tₙ₊₁) und Fehlerdiagramm für n = 0 … 15.
 * – „Summanden“: Tₙ entsteht Schritt für Schritt; der neue Summand wächst ein, die Tabelle
 *   zeigt, wie aus f⁽ᵏ⁾(a) und k! die Koeffizienten werden.
 * – „ε-Schlauch“: Wo weicht Tₙ um weniger als ε von f ab?
 * – „Ableitungen anpassen“: Tₙ übernimmt Wert, Steigung, Krümmung … – Häkchen erscheinen
 *   nacheinander, f⁽ʲ⁾ und Tₙ⁽ʲ⁾ liegen übereinander.
 * – „Konvergenzradius“: alle Grade übereinander; außerhalb des Konvergenzintervalls
 *   „explodieren“ die Polynome, der Fehler wächst mit n (logarithmisches Diagramm).
 * – „Taschenrechner“: Partialsummen als Tabelle, die richtigen Stellen werden fett.
 * – „Kleinwinkel“: sin φ ≈ φ beim Pendel, mit Fehler in Prozent und Gradangabe.
 */
export default defineSimulation({
  id: 'taylor-polynome',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.46 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'approx', label: L('Näherung und Fehler', 'Approximation and error') },
        { value: 'terms', label: L('Summand für Summand', 'Term by term') },
        { value: 'match', label: L('Ableitungen anpassen', 'Matching derivatives') },
        { value: 'band', label: L('ε-Schlauch', 'ε-band') },
        { value: 'conv', label: L('Konvergenzradius', 'Radius of convergence') },
        { value: 'calc', label: L('Wie rechnet der Taschenrechner?', 'How does a calculator do it?') },
        { value: 'small', label: L('Kleinwinkelnäherung (Pendel)', 'Small-angle approximation (pendulum)') },
      ],
      default: 'approx',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'sin', label: L('sin x', 'sin x') },
        { value: 'cos', label: L('cos x', 'cos x') },
        { value: 'exp', label: L('eˣ', 'eˣ') },
        { value: 'ln', label: L('ln(1 + x)', 'ln(1 + x)') },
        { value: 'geo', label: L('1/(1 − x)', '1/(1 − x)') },
      ],
      default: 'sin',
      visibleIf: (v) => v.view !== 'small',
    },
    { key: 'n', type: 'number', label: L('Grad n', 'Degree n'), min: 0, max: NMAX, step: 1, default: 3, visibleIf: (v) => v.view !== 'small' },
    {
      key: 'a',
      type: 'number',
      label: L('Entwicklungsstelle a', 'Centre a'),
      min: -3.2,
      max: 3.2,
      step: 0.1,
      default: 0,
      help: L('Auch den Punkt auf dem Graphen ziehen. Bei ln(1 + x) mindestens −0,9, bei 1/(1 − x) höchstens 0,5.', 'You can also drag the point on the graph. For ln(1 + x) at least −0.9, for 1/(1 − x) at most 0.5.'),
      visibleIf: (v) => v.view !== 'small',
    },
    {
      key: 'x',
      type: 'number',
      label: L('Prüfstelle x', 'Test point x'),
      help: L('Auch im Bild ziehen.', 'You can also drag it in the picture.'),
      min: -6,
      max: 6,
      step: 0.1,
      default: 2,
      visibleIf: isView('approx', 'conv', 'calc'),
    },
    {
      key: 'eps',
      type: 'choice',
      label: L('Toleranz ε', 'Tolerance ε'),
      options: [
        { value: '0.5', label: L('0,5', '0.5') },
        { value: '0.1', label: L('0,1', '0.1') },
        { value: '0.01', label: L('0,01', '0.01') },
        { value: '0.001', label: L('0,001', '0.001') },
      ],
      default: '0.1',
      help: L('Wo gilt |f(x) − Tₙ(x)| < ε?', 'Where does |f(x) − Tₙ(x)| < ε hold?'),
      visibleIf: isView('band'),
    },
    {
      key: 'dk',
      type: 'number',
      label: L('Verglichene Ableitung j', 'Compared derivative j'),
      help: L('0: Funktionswert, 1: Steigung, 2: Krümmung … Auch eine Zeile der Tabelle antippen.', '0: value, 1: slope, 2: curvature … You can also tap a row of the table.'),
      min: 0,
      max: 4,
      step: 1,
      default: 1,
      visibleIf: isView('match'),
    },
    {
      key: 'phi',
      type: 'number',
      label: L('Auslenkung φ', 'Deflection φ'),
      help: L('Auch den Punkt auf dem Graphen ziehen.', 'You can also drag the point on the graph.'),
      min: 0,
      max: 90,
      step: 1,
      default: 20,
      unit: '°',
      visibleIf: isView('small'),
    },
    { key: 'err', type: 'boolean', group: 'view', label: L('Fehler und Konvergenzbereich zeigen', 'Show error and interval of convergence'), default: true, visibleIf: isView('approx', 'band', 'calc') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show the values'), help: L('Aus: Koeffizienten und Ergebnisse im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: coefficients and results in the picture replaced by “?” (for tasks).'), default: true },
  ],
  actions: [
    { id: 'up', label: L('Grad erhöhen', 'Increase degree'), primary: true, visibleIf: (v) => v.view !== 'small' },
    { id: 'down', label: L('Grad senken', 'Decrease degree'), visibleIf: (v) => v.view !== 'small' },
    { id: 'run', label: L('Alle Grade durchlaufen', 'Run through all degrees'), visibleIf: (v) => v.view !== 'small' },
  ],
  readouts: [
    { key: 'poly', label: L('Taylorpolynom', 'Taylor polynomial'), spoiler: true },
    { key: 'err', label: L('Fehler an der Prüfstelle', 'Error at the test point'), spoiler: true },
    { key: 'valid', label: L('Gültigkeitsbereich', 'Range of validity'), spoiler: true },
    { key: 'fit', label: L('Übereinstimmung bei a', 'Agreement at a'), spoiler: true },
    { key: 'conv', label: L('Konvergenz', 'Convergence'), spoiler: true },
    { key: 'calc', label: L('Richtige Nachkommastellen', 'Correct decimals'), spoiler: true },
    { key: 'small', label: L('Kleinwinkelnäherung', 'Small-angle approximation'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'sin', label: L('sin x um 0', 'sin x about 0'), values: {} },
    { id: 'exp', label: L('eˣ: Näherung für e', 'eˣ: approximating e'), values: { fn: 'exp', n: 4, a: 0, x: 1 } },
    { id: 'terms', label: L('Summand für Summand: sin x', 'Term by term: sin x'), values: { view: 'terms', fn: 'sin', n: 5, a: 0 } },
    { id: 'match', label: L('Wert, Steigung, Krümmung: cos x', 'Value, slope, curvature: cos x'), values: { view: 'match', fn: 'cos', n: 2, a: 0.5, dk: 2 } },
    { id: 'cos', label: L('cos x um π', 'cos x about π'), values: { fn: 'cos', n: 2, a: 3.1, x: 2 } },
    { id: 'band', label: L('ε-Schlauch: eˣ', 'ε-band: eˣ'), values: { view: 'band', fn: 'exp', n: 4, a: 0, eps: '0.01' } },
    { id: 'conv', label: L('Konvergenzradius: ln(1 + x) explodiert', 'Radius of convergence: ln(1 + x) blows up'), values: { view: 'conv', fn: 'ln', n: 12, a: 0, x: 1.5 } },
    { id: 'geo', label: L('Geometrische Reihe: nur für |x| < 1', 'Geometric series: only for |x| < 1'), values: { view: 'conv', fn: 'geo', n: 12, a: 0, x: -1.3 } },
    { id: 'calcE', label: L('Taschenrechner: e auf 6 Stellen', 'Calculator: e to 6 decimals'), values: { view: 'calc', fn: 'exp', n: 9, a: 0, x: 1 } },
    { id: 'calcSin', label: L('Taschenrechner: sin 0,5', 'Calculator: sin 0.5'), values: { view: 'calc', fn: 'sin', n: 7, a: 0, x: 0.5 } },
    { id: 'small', label: L('Pendel: sin φ ≈ φ', 'Pendulum: sin φ ≈ φ'), values: { view: 'small', phi: 20 } },
    { id: 'even', label: L('Sonderfall: sin x bei geradem n', 'Special case: sin x with even n'), values: { view: 'match', fn: 'sin', n: 4, a: 0, dk: 4 } },
    { id: 'zero', label: L('Sonderfall: n = 0 ist waagerecht', 'Special case: n = 0 is horizontal'), values: { fn: 'exp', n: 0, a: 0.5, x: 1.5 } },
    { id: 'lnEdge', label: L('Sonderfall: ln(1 + x) mit a nahe −1', 'Special case: ln(1 + x) with a close to −1'), values: { view: 'conv', fn: 'ln', n: 8, a: -0.9, x: -0.7 } },
    { id: 'geoOne', label: L('Sonderfall: 1/(1 − x) an x = 1', 'Special case: 1/(1 − x) at x = 1'), values: { view: 'calc', fn: 'geo', n: 10, a: 0, x: 1 } },
  ],
  strings: {
    de: {
      canvas:
        'Koordinatensystem mit dem Graphen von f und dem Taylorpolynom Tₙ zur ziehbaren Entwicklungsstelle a. Ansichten: Näherung mit Prüfstelle, Fehler und Lagrange-Abschätzung; Summand für Summand mit Koeffiziententabelle; Ableitungen anpassen mit Häkchen für Wert, Steigung und Krümmung; ε-Schlauch; Konvergenzradius mit allen Graden und logarithmischem Fehlerdiagramm; Taschenrechner mit Partialsummen und fett markierten richtigen Stellen; Kleinwinkelnäherung sin φ ≈ φ am Pendel. Daneben Karten mit Rechnung und Erklärung.',
    },
    en: {
      canvas:
        'Coordinate system with the graph of f and the Taylor polynomial Tₙ about the draggable centre a. Views: approximation with test point, error and Lagrange bound; term by term with a table of coefficients; matching derivatives with ticks for value, slope and curvature; ε-band; radius of convergence with all degrees and a logarithmic error chart; calculator with partial sums and the correct digits in bold; small-angle approximation sin φ ≈ φ at a pendulum. Next to it cards with calculation and explanation.',
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
    const key = () => p.fn as FnKey;
    const fn = () => FNS[key()];
    const view = () => p.view as ViewKey;
    const eps = () => Number(p.eps);
    /** Entwicklungsstelle im zulässigen Bereich der Funktion. */
    const aOf = (k: FnKey, a: number) => clamp(a, FNS[k].aMin, FNS[k].aMax);
    const aEff = () => aOf(key(), p.a);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Farben (gleiche Größe = gleiche Farbe in Bild, Karten, Ergebnissen) ---------- */
    const col = {
      f: () => th().series[0]!,
      T: () => th().series[3]!,
      a: () => th().series[4]!,
      x: () => th().series[1]!,
      conv: () => th().series[2]!,
      band: () => th().series[5]!,
    };

    /* ---------- Zahlen und Terme ---------- */
    const n2 = (v: number) => fmt.num(v, 2);
    /** Zahl kompakt: Dezimalzahl oder Zehnerpotenz-Schreibweise für sehr große/kleine Werte. */
    function small(v: number, dec = 4): string {
      if (!Number.isFinite(v)) return '–';
      if (v === 0) return '0';
      if (Math.abs(v) >= 1e-3 && Math.abs(v) < 1e6) return fmt.num(v, dec);
      const e = Math.floor(Math.log10(Math.abs(v)));
      const m = v / 10 ** e;
      return `${fmt.num(m, 2)} · 10${sup(String(e))}`;
    }
    /** Koeffizient als Formel: exakter Bruch, wenn möglich, sonst Dezimalzahl. */
    function coefSrc(c: number, k: number): { sign: number; body: string } {
      const sign = c < 0 ? -1 : 1;
      const v = Math.abs(c);
      for (const den of [1, k || 1, factorial(k)]) {
        const num = v * den;
        if (Math.round(num) >= 1 && Math.abs(num - Math.round(num)) < 1e-9 && Math.round(num) <= 9999 && den <= 1e7) {
          const nn = Math.round(num);
          if (den === 1) return { sign, body: String(nn) };
          return { sign, body: `\\f{${nn}}{${den}}` };
        }
      }
      return { sign, body: v < 1e-3 ? small(v) : fmt.num(v, 3) };
    }
    function powSrc(a: number, k: number): string {
      const base = Math.abs(a) < 1e-9 ? 'x' : `(x ${a > 0 ? '−' : '+'} ${fmt.num(Math.abs(a), 1)})`;
      if (k === 0) return '';
      return k === 1 ? base : `${base}^${k}`;
    }
    function termSrc(c: number, k: number, a: number, first: boolean): string {
      const { sign, body } = coefSrc(c, k);
      const pw = powSrc(a, k);
      const coef = pw && body === '1' ? '' : body;
      const term = pw ? `${coef}${coef && !coef.startsWith('\\f') ? ' · ' : ''}${pw}` : body;
      return first ? `${sign < 0 ? '−' : ''}${term}` : ` ${sign < 0 ? '−' : '+'} ${term}`;
    }
    /** Tₙ als Formelquelle (höchstens `maxTerms` Summanden ≠ 0, dann „+ …“). */
    function polySrc(n: number, maxTerms: number): string {
      const a = aEff();
      const c = coefficients(fn(), a, n);
      const parts: string[] = [];
      let more = false;
      for (let k = 0; k <= n; k++) {
        if (c[k] === 0) continue;
        if (parts.length >= maxTerms) {
          more = true;
          break;
        }
        parts.push(termSrc(c[k]!, k, a, parts.length === 0));
      }
      if (!parts.length) return '0';
      return parts.join('') + (more ? ' + …' : '');
    }
    const plain = (s: string) =>
      s
        .replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
        .replace(/\\t\{([^}]*)\}/g, '$1')
        .replace(/\^(\d+)/g, (_m, d: string) => sup(d));
    /** Name der j-ten Ableitung als Formel (f, f′, f″, f‴, f⁽⁴⁾). */
    const dName = (base: string, j: number, sub?: string) => {
      const s = sub !== undefined ? `${base}_{${sub}}` : base;
      if (j === 0) return s;
      if (j <= 3) return `${s}${'′″‴'[j - 1]}`;
      return `${s}^{(${j})}`;
    };

    /* ---------- Angezeigter Zustand ---------- */
    const A = new Chan(aEff());
    const NV = new Chan(p.n);
    const X = new Chan(p.x);
    const PH = new Chan(toRad(p.phi));
    const DK = new Chan(p.dk);
    const rangeFor = (): { x: [number, number]; y: [number, number] } => (view() === 'small' ? { x: [-0.08, 1.66], y: [-0.12, 1.78] } : VIEW[key()]);
    const RX0 = new Chan(rangeFor().x[0]);
    const RX1 = new Chan(rangeFor().x[1]);
    const RY0 = new Chan(rangeFor().y[0]);
    const RY1 = new Chan(rangeFor().y[1]);
    const allChans = [A, NV, X, PH, DK, RX0, RX1, RY0, RY1];

    let intro: number | null = null;
    let viewFade: number | null = null;
    let cardFade: number | null = null;
    /** Funktionswechsel: alte Kurven blenden aus. */
    let fnFade: { from: FnKey; a: number; nv: number; t0: number } | null = null;
    /** Zeitpunkt, ab dem die Häkchen (Ansicht „Ableitungen“) nacheinander erscheinen. */
    let checkT0 = -Infinity;
    let running = false;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    const touch = () => {
      lastDrag = performance.now();
    };
    /** Angezeigte Ränder des Gültigkeitsbereichs (gleiten weich zum Zielwert). */
    let shownBand: [number, number] | null = null;
    /** Antippbare Zeilen der Ableitungstabelle. */
    let rowHits: { r: Rect; k: number }[] = [];

    /* ---------- Polynome (Koeffizienten zwischengespeichert) ---------- */
    const coefCache = new Map<string, number[]>();
    function cs(k: FnKey, a: number): number[] {
      const id = `${k}|${a}`;
      let c = coefCache.get(id);
      if (!c) {
        c = coefficients(FNS[k], a, NMAX + 6);
        if (coefCache.size > 80) coefCache.clear();
        coefCache.set(id, c);
      }
      return c;
    }
    /** Tₖ(x) */
    function Tk(k: FnKey, a: number, n: number, x: number): number {
      const c = cs(k, a);
      let y = 0;
      for (let i = n; i >= 0; i--) y = y * (x - a) + c[i]!;
      return y;
    }
    /** j-te Ableitung von Tₙ an der Stelle x. */
    function Tkd(k: FnKey, a: number, n: number, j: number, x: number): number {
      if (j > n) return 0;
      const c = cs(k, a);
      let y = 0;
      for (let i = n; i >= j; i--) y = y * (x - a) + c[i]! * (factorial(i) / factorial(i - j));
      return y;
    }
    /** Angezeigtes Polynom bei gleitendem Grad nv (zwischen zwei Graden überblendet). */
    function polyAt(x: number, nv = NV.v, k: FnKey = key(), a = A.v): number {
      const k0 = Math.min(NMAX, Math.floor(nv + 1e-9));
      const u = nv - k0;
      const v0 = Tk(k, a, k0, x);
      if (u < 1e-6 || k0 >= NMAX) return v0;
      return lerp(v0, Tk(k, a, k0 + 1, x), u);
    }
    /** Ableitung des angezeigten Polynoms bei gleitender Ordnung jv (für die Ansicht „Ableitungen“). */
    function polyDerivAt(x: number, jv: number): number {
      const j0 = Math.floor(jv + 1e-9);
      const u = jv - j0;
      const at = (j: number) => {
        const k0 = Math.min(NMAX, Math.floor(NV.v + 1e-9));
        const w = NV.v - k0;
        const d0 = Tkd(key(), A.v, k0, j, x);
        return w < 1e-6 || k0 >= NMAX ? d0 : lerp(d0, Tkd(key(), A.v, k0 + 1, j, x), w);
      };
      const v0 = at(j0);
      return u < 1e-6 ? v0 : lerp(v0, at(j0 + 1), u);
    }
    function fDerivAt(x: number, jv: number, k: FnKey = key()): number {
      const j0 = Math.floor(jv + 1e-9);
      const u = jv - j0;
      const v0 = fnDerivative(FNS[k], j0, x);
      return u < 1e-6 ? v0 : lerp(v0, fnDerivative(FNS[k], j0 + 1, x), u);
    }
    /** Angezeigter Grad (für Beschriftungen; zählt beim Überblenden mit). */
    const shownN = () => clamp(Math.round(NV.v), 0, NMAX);

    /* ---------- Gültigkeitsbereich (zwischengespeichert) ---------- */
    const bandCache = new Map<string, [number, number]>();
    function bandFor(n: number, a = aEff()): [number, number] {
      const id = `${key()}|${a.toFixed(3)}|${n}|${p.eps}`;
      let v = bandCache.get(id);
      if (!v) {
        const [lo, hi] = VIEW[key()].x;
        v = validInterval(fn(), a, n, eps(), lo, hi);
        if (bandCache.size > 600) bandCache.clear();
        bandCache.set(id, v);
      }
      return v;
    }

    /* ---------- Aufteilung (Breite und Höhe: Tablets nutzen das Nebeneinander-Layout) ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const F = (big: number, smallSize: number) => (sm() ? smallSize : big);
    function regions(): { plot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.36, 250, 384));
        return { plot: { x: 0, y: 0, w: w - cw - 12, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(w * 0.9, 270, h * 0.5));
      return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const plot = new Plot(surface, { x: [-7, 7], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Griffe ---------- */
    const handleY = () => {
      if (view() === 'match') return fDerivAt(A.v, DK.v);
      return fn().f(A.v);
    };
    plot.addHandle({
      get: () => [A.v, handleY()],
      set: (x) => {
        touch();
        ctx.set({ a: Math.round(clamp(x, fn().aMin, fn().aMax) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => editable() && !running && view() !== 'small',
      color: () => col.a(),
    });
    plot.addHandle({
      get: () => [X.v, 0],
      set: (x) => {
        touch();
        ctx.set({ x: Math.round(clamp(x, -6, 6) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => editable() && (view() === 'conv' || view() === 'calc' || (view() === 'approx' && p.err)),
      color: () => col.x(),
    });
    plot.addHandle({
      get: () => [PH.v, Math.sin(PH.v)],
      set: (x) => {
        touch();
        ctx.set({ phi: clamp(Math.round(toDeg(x)), 0, 90) });
      },
      axis: 'x',
      enabled: () => editable() && view() === 'small',
      color: () => col.x(),
    });
    new TapTarget(surface, {
      hit: (px, py) => {
        if (view() !== 'match' || !editable()) return null;
        const h = rowHits.find((rh) => px >= rh.r.x && px <= rh.r.x + rh.r.w && py >= rh.r.y && py <= rh.r.y + rh.r.h);
        return h ? String(h.k) : null;
      },
      onTap: (id) => {
        if (editable()) ctx.set({ dk: Number(id) });
      },
    });

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({ f: col.f(), T: col.T(), a: col.a(), x: col.x(), c: col.conv(), b: col.band(), m: th().muted });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /* ---------- Zeichenhilfen ---------- */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; bounds?: Rect } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? F(13, 12);
      const color = opts.color ?? th().text;
      const box = opts.maxW ? fit(src, opts.maxW, size, color, 700) : formula(g, src, fstyle(size, color, 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const B = opts.bounds ?? plot.rect;
      left = clamp(left, B.x + 10, B.x + B.w - box.w - 10);
      const base = clamp(y + (box.asc - box.desc) / 2, B.y + box.asc + 7, B.y + B.h - box.desc - 7);
      const rr = { x: left - 7, y: base - box.asc - 4, w: box.w + 14, h: box.asc + box.desc + 8 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)';
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

    function dot(x: number, y: number, color: string, r: number, alpha = 1): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
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

    /** Zeichnet `draw` nur innerhalb des Streifens [x0, x1] (Pixel) der Plotfläche. */
    function clipped(x0: number, x1: number, draw: () => void): void {
      const g = surface.g;
      const r = plot.rect;
      g.save();
      g.beginPath();
      g.rect(x0, r.y - 2, Math.max(0, x1 - x0), r.h + 4);
      g.clip();
      draw();
      g.restore();
    }

    /** Graph von f (bzw. f⁽ʲ⁾) mit Schatten und Glanzlinie; Polstelle und Definitionslücke ausgespart. */
    function drawF(k: FnKey, width: number, j: number | null = null): void {
      const g = surface.g;
      const f = j === null ? FNS[k].f : (x: number) => fDerivAt(x, j, k);
      const pieces: { from?: number; to?: number }[] = k === 'geo' ? [{ to: 1 - 1e-3 }, { from: 1 + 1e-3 }] : k === 'ln' ? [{ from: -1 + 1e-4 }] : [{}];
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.45, 0.6);
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      for (const pc of pieces) plot.fn(f, { color: col.f(), width, ...pc });
      g.restore();
      g.save();
      g.globalAlpha *= 0.45;
      g.translate(0, -width * 0.25);
      for (const pc of pieces) plot.fn(f, { color: withAlpha('#ffffff', th().dark ? 0.3 : 0.6), width: Math.max(1, width * 0.28), ...pc });
      g.restore();
    }

    function drawPoly(f: (x: number) => number, width = 3, alpha = 1): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.85)';
      g.shadowBlur = 4;
      plot.fn(f, { color: col.T(), width, dash: [9, 5] });
      g.restore();
    }

    /** Konvergenzintervall als Streifen mit gestrichelten Rändern. */
    function shadeConv(alpha: number): void {
      const g = surface.g;
      const r = plot.rect;
      const R = fn().radius(A.v);
      if (!Number.isFinite(R) || alpha <= 0.01) return;
      const x0 = plot.px(A.v - R);
      const x1 = plot.px(A.v + R);
      g.save();
      g.globalAlpha *= alpha;
      const l = clamp(x0, r.x, r.x + r.w);
      const rr = clamp(x1, r.x, r.x + r.w);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, withAlpha(col.conv(), th().dark ? 0.06 : 0.04));
      grad.addColorStop(1, withAlpha(col.conv(), th().dark ? 0.16 : 0.11));
      g.fillStyle = grad;
      g.fillRect(l, r.y, rr - l, r.h);
      g.strokeStyle = withAlpha(col.conv(), 0.75);
      g.setLineDash([6, 5]);
      g.lineWidth = 1.5;
      g.beginPath();
      for (const xx of [x0, x1]) {
        if (xx > r.x && xx < r.x + r.w) {
          g.moveTo(xx, r.y);
          g.lineTo(xx, r.y + r.h);
        }
      }
      g.stroke();
      g.restore();
    }

    /* ---------- Karten ---------- */
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
      poly: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, draw: 1, poly: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 2900) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        draw: ease.inOutCubic(clamp01((t - 150) / 1000)),
        poly: ease.outCubic(clamp01((t - 650) / 900)),
        labels: ease.outCubic(clamp01((t - 1100) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 700) / 1500),
      };
    }

    /* =====================================================================
     * Zeichenfläche
     * ===================================================================== */
    /** Legende oben links (mehrere Pillen untereinander). */
    function legend(items: { src: string; color: string }[], alpha: number): void {
      const r = plot.rect;
      let y = r.y + 18;
      for (const it of items) {
        const rr = fpill(r.x + 10, y, it.src, { align: 'left', size: F(12.5, 11.5), alpha, border: withAlpha(it.color, 0.55), maxW: r.w * 0.62 });
        y = rr.y + rr.h + 14;
      }
    }

    /** Entwicklungsstelle: Lot und Punkt mit Beschriftung. */
    function centre(k: Intro, y: number): void {
      const a = A.v;
      const g = surface.g;
      if (!Number.isFinite(y)) return;
      g.save();
      g.globalAlpha *= k.draw;
      plot.segment([a, 0], [a, y], { color: withAlpha(col.a(), 0.6), width: 1.4, dash: [4, 4] });
      g.restore();
      const pop = intro !== null ? ease.outBack(clamp01((k.draw - 0.3) / 0.5)) : 1;
      dot(plot.px(a), plot.py(y), col.a(), F(7, 6.5) * pop, k.draw);
      const [axp, ayp] = plot.toPx(a, y);
      const right = axp < plot.rect.x + plot.rect.w * 0.7;
      fpill(axp + (right ? 14 : -14), ayp - 22, `\\c{a}{a = ${fmt.num(aEff(), 1)}}`, { align: right ? 'left' : 'right', size: F(12.5, 11.5), alpha: k.labels, border: withAlpha(col.a(), 0.5) });
    }

    /** Prüfstelle x mit Abstand zwischen f(x) und Tₙ(x). */
    function testPoint(k: Intro, pf: (x: number) => number): void {
      const g = surface.g;
      const r = plot.rect;
      const x = X.v;
      const yf = fn().f(x);
      const yt = pf(x);
      const px = plot.px(x);
      g.save();
      g.globalAlpha *= k.labels;
      plot.segment([x, 0], [x, Number.isFinite(yf) ? yf : 0], { color: withAlpha(col.x(), 0.5), width: 1.2, dash: [3, 3] });
      if (Number.isFinite(yf) && Number.isFinite(yt)) {
        const pf1 = clamp(plot.py(yf), r.y - 4, r.y + r.h + 4);
        const pt1 = clamp(plot.py(yt), r.y - 4, r.y + r.h + 4);
        g.strokeStyle = col.x();
        g.lineWidth = 3.2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(px, pf1);
        g.lineTo(px, pt1);
        g.stroke();
      }
      g.restore();
      if (Number.isFinite(yf)) dot(px, plot.py(yf), col.f(), 4.5, k.labels);
      if (Number.isFinite(yt) && Math.abs(plot.py(yt) - r.y - r.h / 2) < r.h) dot(px, plot.py(yt), col.T(), 4.5, k.labels);
      fpill(px + 10, plot.py(0) + 16, '\\c{x}{x}', { align: 'left', size: F(12.5, 11.5), alpha: k.labels });
    }

    function drawPlot(now: number, k: Intro): void {
      const g = surface.g;
      const v = view();
      plot.setAxes({ x: { label: v === 'small' ? 'φ' : 'x', degrees: v === 'small' }, y: { label: 'y' } });
      plot.setRangePadded([RX0.v, RX1.v], [RY0.v, RY1.v], { left: F(36, 32), bottom: F(24, 22), top: 10, right: 12 });
      plot.begin();
      plot.grid();
      plot.axes();
      if (v === 'small') {
        drawSmall(k);
        plot.end();
        return;
      }
      // Funktionswechsel: alte Kurven blenden aus
      let ff = 1;
      if (fnFade) {
        const t = (now - fnFade.t0) / 650;
        if (t >= 1) fnFade = null;
        else {
          ff = ease.inOutCubic(clamp01(t));
          const old = fnFade;
          g.save();
          g.globalAlpha *= 1 - ff;
          drawF(old.from, 2.6);
          drawPoly((x) => polyAt(x, old.nv, old.from, old.a), 2.6);
          g.restore();
        }
      }
      g.save();
      g.globalAlpha *= ff;
      if (v === 'approx') drawApprox(k);
      else if (v === 'terms') drawTerms(k);
      else if (v === 'band') drawBand(k);
      else if (v === 'match') drawMatch(k);
      else if (v === 'conv') drawConv(k);
      else drawCalc(k);
      g.restore();
      plot.end();
    }

    /** f zeichnet sich beim Einstieg von links nach rechts, Tₙ wächst von a aus. */
    function fAndPoly(k: Intro, polyWidth = 3): void {
      const r = plot.rect;
      clipped(r.x, r.x + r.w * k.draw, () => drawF(key(), F(3.2, 2.8)));
      const ax = plot.px(A.v);
      const spread = Math.max(ax - r.x, r.x + r.w - ax) * k.poly;
      clipped(ax - spread, ax + spread, () => drawPoly((x) => polyAt(x), polyWidth));
    }

    function nameLegend(k: Intro, extra: { src: string; color: string }[] = []): void {
      legend([{ src: `\\c{f}{f(x) = ${VIEW[key()].name}}`, color: col.f() }, { src: `\\c{T}{T_{${shownN()}}(x)}`, color: col.T() }, ...extra], k.labels);
    }

    function drawApprox(k: Intro): void {
      if (p.err) shadeConv(k.labels);
      fAndPoly(k);
      if (p.err) testPoint(k, (x) => polyAt(x));
      centre(k, fn().f(A.v));
      nameLegend(k);
    }

    function drawTerms(k: Intro): void {
      const g = surface.g;
      const r = plot.rect;
      const a = A.v;
      const nv = NV.v;
      const top = Math.min(NMAX, Math.ceil(nv - 1e-6));
      const grow = Math.abs(top - nv) < 1e-6 ? 1 : nv - Math.floor(nv);
      const ax = plot.px(a);
      const spread = Math.max(ax - r.x, r.x + r.w - ax) * k.poly;
      clipped(r.x, r.x + r.w * k.draw, () => drawF(key(), F(3.2, 2.8)));
      clipped(ax - spread, ax + spread, () => {
        // Vorgänger T₀ … Tₙ₋₁ blass, vom Lila ins Orange
        for (let j = 0; j < top; j++) {
          const t = top <= 1 ? 1 : j / (top - 1);
          plot.fn((x) => Tk(key(), a, j, x), { color: withAlpha(mixColor(col.a(), col.T(), t), 0.22 + 0.33 * t), width: 1.4 });
        }
        // neuester Summand cₙ(x − a)ⁿ als eigene Kurve; wächst beim Gradwechsel ein
        const c = cs(key(), a)[top]!;
        if (c !== 0 && top > 0) {
          g.save();
          g.globalAlpha *= 0.4 + 0.6 * grow;
          plot.fn((x) => grow * c * (x - a) ** top, { color: col.a(), width: 2.4, dash: [2, 4] });
          g.restore();
        }
        drawPoly((x) => polyAt(x));
      });
      centre(k, fn().f(a));
      const extra: { src: string; color: string }[] = [];
      const n = shownN();
      const cn = cs(key(), aEff())[n]!;
      if (n > 0) extra.push({ src: cn === 0 ? `\\c{a}{\\t{${say(L('neuer Summand', 'new term'))}}: 0 → T_{${n}} = T_{${n - 1}}}` : `\\c{a}{\\t{${say(L('neuer Summand', 'new term'))}}: ${p.show ? termSrc(cn, n, aEff(), true) : '?'}}`, color: col.a() });
      nameLegend(k, extra);
    }

    function drawBand(k: Intro): void {
      const g = surface.g;
      const theme = th();
      const r = plot.rect;
      const f = fn();
      const v = VIEW[key()];
      const e = eps();
      shadeConv(k.labels * 0.8);
      g.save();
      g.globalAlpha *= k.labels;
      // Schlauch: mindestens 3 px breit, damit er auch bei kleinem ε sichtbar bleibt
      const half = Math.max(e, 1.5 / plot.scale.y);
      const xs0 = key() === 'ln' ? -1 + 1e-3 : v.x[0];
      g.fillStyle = withAlpha(col.band(), theme.dark ? 0.24 : 0.17);
      const pieces: [number, number][] = key() === 'geo' ? [[v.x[0], 1 - 1e-2], [1 + 1e-2, v.x[1]]] : [[xs0, v.x[1]]];
      for (const [from, to] of pieces) {
        g.beginPath();
        const N = 240;
        for (let i = 0; i <= N; i++) {
          const xx = from + ((to - from) * i) / N;
          const [px, py] = plot.toPx(xx, f.f(xx) + half);
          if (i === 0) g.moveTo(px, clamp(py, r.y - 50, r.y + r.h + 50));
          else g.lineTo(px, clamp(py, r.y - 50, r.y + r.h + 50));
        }
        for (let i = N; i >= 0; i--) {
          const xx = from + ((to - from) * i) / N;
          const [px, py] = plot.toPx(xx, f.f(xx) - half);
          g.lineTo(px, clamp(py, r.y - 50, r.y + r.h + 50));
        }
        g.closePath();
        g.fill();
      }
      g.restore();
      fAndPoly(k);
      if (shownBand && shownBand[1] - shownBand[0] > 1e-6) {
        const [l, rr] = shownBand;
        const x0 = plot.px(l);
        const x1 = plot.px(rr);
        g.save();
        g.globalAlpha *= k.labels;
        g.fillStyle = withAlpha(col.band(), theme.dark ? 0.1 : 0.07);
        g.fillRect(x0, r.y, x1 - x0, r.h);
        const yb = clamp(plot.py(0), r.y + 8, r.y + r.h - 8);
        g.strokeStyle = col.band();
        g.lineWidth = 6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x0, yb);
        g.lineTo(x1, yb);
        g.stroke();
        g.lineWidth = 2;
        g.setLineDash([4, 4]);
        g.beginPath();
        for (const xx of [x0, x1]) {
          g.moveTo(xx, r.y);
          g.lineTo(xx, r.y + r.h);
        }
        g.stroke();
        g.restore();
        const lab = p.show;
        if (lab) {
          fpill(x0 - 6, yb - 22, `\\c{b}{${n2(l)}}`, { align: 'right', size: F(12, 11), alpha: k.labels, border: withAlpha(col.band(), 0.6) });
          fpill(x1 + 6, yb - 22, `\\c{b}{${n2(rr)}}`, { align: 'left', size: F(12, 11), alpha: k.labels, border: withAlpha(col.band(), 0.6) });
        }
      }
      centre(k, fn().f(A.v));
      nameLegend(k, [{ src: `\\c{b}{f ± ε,  ε = ${fmt.num(e, 3)}}`, color: col.band() }]);
    }

    function drawMatch(k: Intro): void {
      const r = plot.rect;
      const jv = DK.v;
      const j = clamp(Math.round(jv), 0, 4);
      const ax = plot.px(A.v);
      clipped(r.x, r.x + r.w * k.draw, () => drawF(key(), F(3.2, 2.8), jv));
      const spread = Math.max(ax - r.x, r.x + r.w - ax) * k.poly;
      clipped(ax - spread, ax + spread, () => drawPoly((x) => polyDerivAt(x, jv)));
      // Steigung (j = 0) bzw. Tangente an f⁽ʲ⁾ bei a: zeigt, was übereinstimmt
      const ya = fDerivAt(A.v, jv);
      if (Number.isFinite(ya)) {
        const s = fDerivAt(A.v, jv + 1);
        if (Number.isFinite(s)) {
          const w = (RX1.v - RX0.v) * 0.09;
          plot.segment([A.v - w, ya - s * w], [A.v + w, ya + s * w], { color: withAlpha(col.a(), 0.75 * k.labels), width: 2 });
        }
      }
      centre(k, ya);
      const n = shownN();
      const fN = dName('f', j);
      const tN = dName('T', j, String(n));
      const note = j > n ? `\\c{m}{\\t{${say(L('Grad', 'degree'))}} ${n} < ${j}: ${tN} = 0}` : '';
      legend(
        [
          { src: `\\c{f}{${fN}(x)}  \\c{m}{\\t{${say(L('von', 'of'))}} f(x) = ${VIEW[key()].name}}`, color: col.f() },
          { src: `\\c{T}{${tN}(x)}${note ? `   ${note}` : ''}`, color: col.T() },
        ],
        k.labels,
      );
    }

    function drawConv(k: Intro): void {
      const g = surface.g;
      const r = plot.rect;
      const a = A.v;
      shadeConv(k.labels);
      clipped(r.x, r.x + r.w * k.draw, () => drawF(key(), F(3.2, 2.8)));
      const ax = plot.px(a);
      const spread = Math.max(ax - r.x, r.x + r.w - ax) * k.poly;
      const nv = NV.v;
      const top = Math.floor(nv + 1e-9);
      clipped(ax - spread, ax + spread, () => {
        // alle Grade übereinander: frühe blass, späte kräftiger
        for (let j = 0; j < top; j++) {
          const t = top <= 1 ? 1 : j / (top - 1);
          g.save();
          g.globalAlpha *= 0.18 + 0.4 * t;
          plot.fn((x) => Tk(key(), a, j, x), { color: mixColor(col.a(), col.T(), t), width: 1.3 });
          g.restore();
        }
        drawPoly((x) => polyAt(x));
      });
      testPoint(k, (x) => polyAt(x));
      centre(k, fn().f(a));
      const R = fn().radius(aEff());
      const rs = Number.isFinite(R) ? `\\c{c}{r = ${fmt.num(R, 1)}}` : '\\c{c}{r = ∞}';
      nameLegend(k, [{ src: rs, color: col.conv() }]);
      // Hinweis an der Prüfstelle
      const where = convergenceAt(fn(), aEff(), p.x);
      if (where !== 'inside' && fn().f(p.x) === fn().f(p.x)) {
        const px = plot.px(X.v);
        const right = px < r.x + r.w * 0.6;
        fpill(px + (right ? 12 : -12), r.y + r.h * 0.3, where === 'edge' ? `\\c{c}{\\t{${say(L('Randpunkt', 'boundary point'))}}}` : `\\c{x}{\\t{${say(L('außerhalb: divergiert', 'outside: diverges'))}}}`, { align: right ? 'left' : 'right', size: F(12, 11), alpha: k.labels, border: withAlpha(where === 'edge' ? col.conv() : col.x(), 0.6) });
      }
    }

    function drawCalc(k: Intro): void {
      if (p.err) shadeConv(k.labels);
      fAndPoly(k);
      testPoint(k, (x) => polyAt(x));
      centre(k, fn().f(A.v));
      nameLegend(k);
    }

    /** Kleinwinkelnäherung: sin φ und φ, Grenzen 22,5° und 14°, Pendel als Bild. */
    function drawSmall(k: Intro): void {
      const g = surface.g;
      const theme = th();
      const r = plot.rect;
      const phi = PH.v;
      // Bereich |sin φ − φ| < 0,01
      g.save();
      g.globalAlpha *= k.labels;
      const x0 = plot.px(0);
      const x1 = plot.px(SMALL_ABS);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, withAlpha(col.conv(), theme.dark ? 0.05 : 0.03));
      grad.addColorStop(1, withAlpha(col.conv(), theme.dark ? 0.18 : 0.12));
      g.fillStyle = grad;
      g.fillRect(x0, r.y, x1 - x0, r.h);
      g.strokeStyle = withAlpha(col.conv(), 0.8);
      g.lineWidth = 1.5;
      g.setLineDash([6, 5]);
      g.beginPath();
      g.moveTo(x1, r.y);
      g.lineTo(x1, r.y + r.h);
      g.stroke();
      g.setLineDash([2, 4]);
      g.strokeStyle = withAlpha(col.conv(), 0.6);
      const xr = plot.px(SMALL_REL);
      g.beginPath();
      g.moveTo(xr, plot.py(0.5));
      g.lineTo(xr, r.y + r.h);
      g.stroke();
      g.restore();
      // Kurven
      clipped(r.x, r.x + r.w * k.draw, () => {
        drawF('sin', F(3.2, 2.8));
      });
      clipped(r.x, r.x + r.w * k.poly, () => {
        g.save();
        g.globalAlpha *= 0.75;
        plot.fn((x) => x - x ** 3 / 6, { color: col.a(), width: 1.6, dash: [2, 4] });
        g.restore();
        drawPoly((x) => x);
      });
      // Fehler bei φ
      const ys = Math.sin(phi);
      const px = plot.px(phi);
      g.save();
      g.globalAlpha *= k.labels;
      plot.segment([phi, 0], [phi, ys], { color: withAlpha(col.x(), 0.5), width: 1.2, dash: [3, 3] });
      g.strokeStyle = col.x();
      g.lineWidth = 3.2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(px, plot.py(ys));
      g.lineTo(px, plot.py(phi));
      g.stroke();
      g.restore();
      dot(px, plot.py(phi), col.T(), 4.5, k.labels);
      // Grenzen beschriften (unten, im grünen Bereich bzw. daneben)
      fpill(x1 + 6, plot.py(0.06) - 4, `\\c{c}{${fmt.num(toDeg(SMALL_ABS), 1)}°: |\\t{sin} φ − φ| = 0,01}`, { align: 'left', size: F(11.5, 11), alpha: k.labels, border: withAlpha(col.conv(), 0.5) });
      fpill(xr - 6, plot.py(0.06) - 4, `\\c{c}{${fmt.num(toDeg(SMALL_REL), 1)}°: 1 %}`, { align: 'right', size: F(11.5, 11), alpha: k.labels, border: withAlpha(col.conv(), 0.5) });
      // Legende unten rechts (unter der Sinuskurve ist Platz)
      const lx = r.x + r.w - 10;
      const yb = plot.py(0);
      const items = [
        { src: `\\c{f}{\\t{sin} φ}`, c: col.f() },
        { src: `\\c{T}{T_1(φ) = φ}`, c: col.T() },
        { src: `\\c{a}{T_3(φ) = φ − \\f{φ^3}{6}}`, c: col.a() },
      ];
      let yy = Math.min(plot.py(0.8) + 14, yb - 30 - (items.length - 1) * 34);
      for (const it of items) {
        fpill(lx, yy, it.src, { align: 'right', size: F(12, 11), alpha: k.labels, border: withAlpha(it.c, 0.5) });
        yy += 34;
      }
      drawPendulum(k, phi);
    }

    /** Pendel: waagerechte Auslenkung l · sin φ gegen Bogenlänge l · φ. */
    function drawPendulum(k: Intro, phi: number): void {
      const g = surface.g;
      const theme = th();
      const r = plot.rect;
      // Platz oberhalb der Geraden y = φ: Kärtchen rechts der y-Achse, so groß wie möglich
      const left = plot.px(0) + 12;
      let Lp = Math.min(r.h * 0.42, r.w * 0.3, 190);
      const boxOf = (l: number) => ({ x: left, y: r.y + 10, w: Math.max(l + 64, sm() ? 96 : 150), h: l + 66 });
      for (let i = 0; i < 20 && Lp > 74; i++) {
        const b = boxOf(Lp);
        const yLine = plot.toWorld(0, b.y + b.h)[1];
        if (b.x + b.w < plot.px(yLine) - 10) break;
        Lp *= 0.92;
      }
      const box = boxOf(Lp);
      const cx = box.x + 26;
      const cy = box.y + 18;
      const bx = cx + Lp * Math.sin(phi);
      const by = cy + Lp * Math.cos(phi);
      g.save();
      g.globalAlpha *= k.panel;
      // Hintergrund-Kärtchen
      g.save();
      g.fillStyle = theme.dark ? 'rgba(15,20,30,0.82)' : 'rgba(255,255,255,0.86)';
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      roundRect(g, box.x, box.y, box.w, box.h, 12);
      g.fill();
      g.restore();
      // Aufhängung
      g.fillStyle = theme.dark ? '#5b6678' : '#8a94a6';
      roundRect(g, cx - 22, cy - 6, 44, 6, 3);
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1.2;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx, cy + Lp + 6);
      g.stroke();
      g.setLineDash([]);
      // Bogen l · φ und Strecke l · sin φ
      g.strokeStyle = col.T();
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(cx, cy, Lp, Math.PI / 2 - phi, Math.PI / 2, false);
      g.stroke();
      g.strokeStyle = col.f();
      g.beginPath();
      g.moveTo(cx, by);
      g.lineTo(bx, by);
      g.stroke();
      // Winkel
      g.strokeStyle = withAlpha(theme.text, 0.7);
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(cx, cy, 24, Math.PI / 2 - phi, Math.PI / 2, false);
      g.stroke();
      // Faden und Kugel
      g.strokeStyle = theme.dark ? '#c4ccd8' : '#4a5568';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(bx, by);
      g.stroke();
      g.restore();
      dot(bx, by, theme.dark ? '#aab4c4' : '#5a6578', 9, k.panel);
      if (phi > 0.2) {
        const am = Math.PI / 2 - phi / 2;
        g.save();
        g.globalAlpha *= k.labels;
        g.font = `italic 700 ${F(13, 12)}px ${theme.mathFont}`;
        g.fillStyle = theme.text;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText('φ', cx + 36 * Math.cos(am), cy + 36 * Math.sin(am));
        g.restore();
      }
      // Beschriftung: Bogen l · φ (orange) und Auslenkung l · sin φ (blau)
      g.save();
      g.globalAlpha *= k.labels;
      g.font = `700 ${F(11.5, 11)}px ${theme.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = col.T();
      g.fillText(sm() ? 'l · φ' : say(L('Bogen l · φ', 'arc l · φ')), box.x + 10, box.y + box.h - 24);
      g.fillStyle = col.f();
      g.fillText(sm() ? 'l · sin φ' : say(L('Auslenkung l · sin φ', 'offset l · sin φ')), box.x + 10, box.y + box.h - 10);
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    interface Row {
      src: string;
      /** Statt Formel: einfacher Text, der umbrochen wird. */
      text?: boolean;
      color?: string;
      size?: number;
      weight?: number;
      gap?: number;
    }
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: Row[], right?: string): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const boxes: FormulaBox[] = rows.map((r) => {
        if (!r.text) return fit(r.src, maxW, r.size ?? F(13.5, 12.5), r.color ?? th().text, r.weight ?? 600);
        // Text: umbrechen und als Kasten mit passender Höhe zeichnen
        const size = r.size ?? F(12.5, 11.5);
        const font = `${r.weight ?? 600} ${size}px ${th().font}`;
        const lines = wrapLines(r.src, maxW, font);
        const lh = size * 1.35;
        return {
          w: maxW,
          asc: size * 0.8,
          desc: (lines.length - 1) * lh + size * 0.3,
          draw: (gg: CanvasRenderingContext2D, x: number, y: number) => {
            gg.font = font;
            gg.fillStyle = r.color ?? th().text;
            gg.textAlign = 'left';
            gg.textBaseline = 'alphabetic';
            lines.forEach((ln, i) => gg.fillText(ln, x, y + i * lh));
          },
        };
      });
      const h = 38 + boxes.reduce((s, b, i) => s + rowH(b) + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 38;
      boxes.forEach((b, i) => {
        const a = ease.outCubic(clamp01(k.stagger * (rows.length + 2) - i));
        g.save();
        g.globalAlpha *= a;
        b.draw(g, R.x + pad + (1 - a) * 10, y + b.asc);
        g.restore();
        y += rowH(b) + (rows[i]!.gap ?? 8);
      });
      return h;
    }

    /** Zerlegt einen Text in Zeilen, die höchstens maxW breit sind. */
    function wrapLines(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    /** Karte mit umbrochenem Text (Hinweis, Sonderfall). */
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

    /** Taylorpolynom als Formel. */
    function polyCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const n = shownN();
        const pad = F(14, 12);
        const maxW = R.w - 2 * pad;
        const fs = F(15, 13.5);
        let src = `\\c{T}{T_{${n}}(x)} = ?`;
        if (p.show) {
          let m = n > 6 ? 4 : 6;
          src = `\\c{T}{T_{${n}}(x)} = ${polySrc(n, m)}`;
          while (m > 1 && formula(g, src, fstyle(fs)).w > maxW * 1.12) {
            m--;
            src = `\\c{T}{T_{${n}}(x)} = ${polySrc(n, m)}`;
          }
        }
        const rows: Row[] = [
          { src: 'T_n(x) = \\c{m}{\\t{Σ}}_{k=0}^{n} \\f{f^{(k)}(a)}{k!} · (x − a)^k', size: F(14, 13), gap: 10 },
          { src, size: fs },
        ];
        return formulaCard(R, measure, k, say(L('Taylorpolynom', 'Taylor polynomial')), col.T(), rows, `\\c{T}{n = ${n}}`);
      };
    }

    /** Fehler an der Prüfstelle mit Lagrange-Abschätzung. */
    function errCard(k: Intro): CardFn {
      return (R, measure) => {
        const f = fn();
        const a = aEff();
        const x = X.v;
        const n = shownN();
        const yf = f.f(x);
        const yt = polyAt(x);
        const xs = n2(x);
        const rows: Row[] = [];
        if (!Number.isFinite(yf)) rows.push({ src: `\\c{m}{f(${xs}) \\t{${say(L('ist nicht definiert', 'is not defined'))}}}` });
        else {
          rows.push({ src: `\\c{f}{f(${xs}) ≈ ${Q(small(yf))}},   \\c{T}{T_{${n}}(${xs}) ≈ ${Q(small(yt))}}`, gap: 8 });
          rows.push({ src: `\\c{x}{|R_{${n}}(${xs})| = |f(x) − T_{${n}}(x)| ≈ \\b{${Q(small(Math.abs(yf - yt)))}}}`, gap: 10 });
          const lb = lagrangeBound(key(), a, n, p.x);
          if (lb !== null) {
            const M = key() === 'exp' ? `e^{${fmt.num(Math.max(a, p.x), 1)}}` : '1';
            rows.push({ src: `\\c{m}{\\t{Lagrange}:} |R_{${n}}| ≤ ${M} · \\f{|x − a|^{${n + 1}}}{${n + 1}!} ≈ ${Q(small(lb))}`, size: F(13, 12), gap: 6 });
            const sh = lagrangeSharp(key(), a, n, p.x);
            if (sh && sh.m > n) rows.push({ src: `\\c{m}{\\t{${say(L('wegen', 'since'))}} T_{${n}} = T_{${sh.m}}: \\t{${say(L('sogar', 'even'))}} ≤ \\f{|x − a|^{${sh.m + 1}}}{${sh.m + 1}!} ≈ ${Q(small(sh.bound))}}`, size: F(12.5, 11.5), gap: 6 });
          } else rows.push({ src: `\\c{m}{\\t{${say(L('Hier keine einfache Lagrange-Schranke.', 'No simple Lagrange bound here.'))}}}`, size: F(12, 11) });
        }
        return formulaCard(R, measure, k, say(L('Fehler an der Prüfstelle', 'Error at the test point')), col.x(), rows);
      };
    }

    /** Logarithmisches Fehlerdiagramm |Rₙ(x)| über n (Balken oder Linie). */
    function errChart(k: Intro, title: string, asLine: boolean): CardFn {
      return (R, measure) => {
        const hh = clamp(R.h, 140, F(210, 190));
        if (measure) return R.h < 140 ? 9999 : hh;
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        const a = A.v;
        const x = X.v;
        const fx = fn().f(x);
        card({ ...R, h: hh });
        cardTitle(R, title, col.x());
        const top = R.y + 44;
        const bottom = R.y + hh - 22;
        if (!Number.isFinite(fx)) {
          g.font = `600 ${F(12, 11)}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(say(L('f(x) ist hier nicht definiert.', 'f(x) is not defined here.')), R.x + pad, (top + bottom) / 2);
          return hh;
        }
        const errs = Array.from({ length: NMAX + 1 }, (_, j) => Math.abs(fx - Tk(key(), a, j, x)));
        const lg = errs.map((e) => (e > 1e-16 ? Math.log10(e) : -16));
        const hi = Math.max(1, Math.ceil(Math.max(...lg)));
        const lo = Math.max(-16, Math.min(-6, Math.floor(Math.min(...lg))));
        const x0 = R.x + pad + 34;
        const x1 = R.x + R.w - pad;
        const bw = (x1 - x0) / (NMAX + 1);
        const Y = (v: number) => lerp(bottom, top, (clamp(v, lo, hi) - lo) / (hi - lo));
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        g.strokeStyle = theme.gridMinor;
        g.lineWidth = 1;
        const stepE = Math.max(1, Math.round((hi - lo) / 4));
        for (let e = lo; e <= hi; e += stepE) {
          g.beginPath();
          g.moveTo(x0, Y(e));
          g.lineTo(x1, Y(e));
          g.stroke();
          g.font = `600 ${F(11, 10.5)}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'right';
          g.textBaseline = 'middle';
          g.fillText(e === 0 ? '1' : `10${sup(String(e))}`, x0 - 5, Y(e));
        }
        g.restore();
        const nv = NV.v;
        const n = shownN();
        const where = convergenceAt(fn(), aEff(), p.x);
        const cOut = where === 'outside' ? col.x() : col.conv();
        const pts: [number, number][] = [];
        lg.forEach((v, j) => {
          const vis = asLine ? clamp01(nv - j + 1) : 1;
          const grow = ease.outCubic(clamp01(k.poly * 1.4 - j / 30));
          const on = j === n;
          const cx = x0 + (j + 0.5) * bw;
          const yy = lerp(bottom, Y(v), grow);
          if (asLine) {
            if (vis > 0.01) pts.push([cx, yy]);
          } else {
            g.fillStyle = on ? col.x() : withAlpha(col.x(), theme.dark ? 0.42 : 0.32);
            roundRect(g, x0 + j * bw + 1.5, yy, bw - 3, Math.max(0, bottom - yy), Math.min(3, (bw - 3) / 2));
            g.fill();
          }
          if (j % 5 === 0 || on) {
            g.font = `${on ? 750 : 600} ${F(11, 10.5)}px ${theme.font}`;
            g.fillStyle = on ? col.x() : theme.muted;
            g.textAlign = 'center';
            g.textBaseline = 'top';
            g.fillText(String(j), cx, bottom + 5);
          }
        });
        if (asLine && pts.length) {
          g.save();
          g.strokeStyle = cOut;
          g.lineWidth = 2.2;
          g.lineJoin = 'round';
          g.beginPath();
          pts.forEach(([px, py], i) => (i === 0 ? g.moveTo(px, py) : g.lineTo(px, py)));
          g.stroke();
          g.restore();
          pts.forEach(([px, py], i) => dot(px, py, i === n ? col.x() : cOut, i === n ? 5 : 3.4, clamp01(nv - i + 1)));
          const last = pts[pts.length - 1]!;
          const tag = where === 'outside' ? say(L('wächst', 'grows')) : where === 'edge' ? say(L('fällt langsam', 'falls slowly')) : say(L('fällt', 'falls'));
          g.font = `750 ${F(11.5, 11)}px ${theme.font}`;
          g.fillStyle = cOut;
          g.textAlign = 'right';
          g.textBaseline = 'bottom';
          g.fillText(tag, x1, Math.max(top + 12, Math.min(last[1] - 8, bottom - 4)));
        }
        return hh;
      };
    }

    /** Tabelle k | f⁽ᵏ⁾(a) | k! | cₖ – zeigt, woher die Koeffizienten kommen. */
    function coefCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        const n = shownN();
        const lh = F(25, 23);
        const want = 70 + (n + 1) * lh + 6;
        if (measure) return R.h < 70 + 3 * lh ? 9999 : Math.min(R.h, want);
        const h = Math.min(R.h, want);
        card({ ...R, h }, col.a());
        cardTitle(R, say(L('Vom Ableitungswert zum Koeffizienten', 'From derivative to coefficient')), col.a());
        const f = fn();
        const a = aEff();
        const c = cs(key(), a);
        const fs = F(13, 12);
        const cols = [R.x + pad, R.x + pad + R.w * 0.11, R.x + pad + R.w * 0.42, R.x + pad + R.w * 0.62];
        let y = R.y + 48;
        ['k', 'f^{(k)}(a)', 'k!', 'c_k = \\f{f^{(k)}(a)}{k!}'].forEach((s, i) => {
          const b = fit(`\\c{m}{${s}}`, R.w * 0.32, F(12, 11));
          b.draw(g, cols[i]!, y + (b.asc - b.desc) / 2);
        });
        y += 22;
        g.strokeStyle = theme.dark ? '#273142' : '#e3e8ef';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y - 8);
        g.lineTo(R.x + R.w - pad, y - 8);
        g.stroke();
        const maxRows = Math.max(2, Math.floor((R.y + h - 4 - y) / lh));
        const first = Math.max(0, n + 1 - maxRows);
        for (let kk = first; kk <= n; kk++) {
          const newest = kk === Math.min(NMAX, Math.ceil(NV.v - 1e-6));
          const fade = clamp01(NV.v - kk + 1) * ease.outCubic(clamp01(k.stagger * (n + 3) - (kk - first)));
          const yy = y + (kk - first) * lh + lh / 2 - 4;
          g.save();
          g.globalAlpha *= fade;
          if (newest) {
            g.fillStyle = withAlpha(col.a(), theme.dark ? 0.18 : 0.1);
            roundRect(g, R.x + pad - 6, yy - lh / 2 + 2, R.w - 2 * pad + 12, lh - 3, 7);
            g.fill();
          }
          const d = f.d(kk, a);
          const dz = Math.abs(d) < 1e-12;
          const ck = c[kk]!;
          const cells = [String(kk), Q(dz ? '0' : small(d)), factorial(kk) < 1e6 ? String(factorial(kk)) : small(factorial(kk)), Q(ck === 0 ? '0' : termSrc(ck, kk, 0, true).replace(/ · x(\^\d+)?$|x(\^\d+)?$/, '') || '1')];
          cells.forEach((s, i) => {
            const color = i === 3 ? (dz ? theme.muted : col.T()) : dz && i === 1 ? theme.muted : theme.text;
            const b = fit(s, R.w * (i === 3 ? 0.3 : i === 0 ? 0.08 : 0.27), fs, color, newest ? 750 : 600);
            b.draw(g, cols[i]!, yy + (b.asc - b.desc) / 2);
          });
          g.restore();
        }
        return h;
      };
    }

    /** Ableitungen anpassen: Vergleichsleiste mit Häkchen, die nacheinander erscheinen. */
    function matchCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        const n = shownN();
        const rowsN = Math.min(Math.max(n + 2, 3), 7);
        const lh = F(30, 28);
        const a = aEff();
        const f = fn();
        const m = matchOrder(f, a, n);
        const foot =
          m > n
            ? say(L(`Übereinstimmung sogar bis zur ${m}. Ableitung, weil der nächste Koeffizient 0 ist.`, `Agreement even up to derivative ${m}, because the next coefficient is 0.`))
            : n === 0
              ? say(L('T₀ übernimmt nur den Wert: eine waagerechte Gerade.', 'T₀ only takes over the value: a horizontal line.'))
              : say(L(`Tₙ übernimmt Wert und die ersten ${n} Ableitungen. Zeile antippen: Graphen vergleichen.`, `Tₙ takes over the value and the first ${n} derivatives. Tap a row to compare graphs.`));
        const footFont = `600 ${F(12, 11)}px ${theme.font}`;
        const footLines = wrapLines(foot, R.w - 2 * pad, footFont);
        const footH = footLines.length * F(16, 15) + 10;
        const want = 66 + rowsN * lh + footH + 6;
        if (measure) return R.h < 66 + 3 * lh + footH ? 9999 : Math.min(R.h, want);
        const h = Math.min(R.h, want);
        card({ ...R, h }, col.a());
        cardTitle(R, say(L('Was Tₙ bei a übernimmt', 'What Tₙ takes over at a')), col.a(), `\\c{T}{n = ${n}}`);
        const names = [L('Wert', 'value'), L('Steigung', 'slope'), L('Krümmung', 'curvature')];
        const cx = [R.x + pad, R.x + pad + R.w * 0.3, R.x + pad + R.w * 0.6, R.x + R.w - pad - 14];
        let y = R.y + 48;
        [`\\c{m}{\\t{${say(L('Ableitung', 'derivative'))}}}`, `\\c{f}{f^{(k)}(a)}`, `\\c{T}{T_{${n}}^{(k)}(a)}`].forEach((s, i) => {
          const b = fit(s, R.w * 0.28, F(12, 11));
          b.draw(g, cx[i]!, y + (b.asc - b.desc) / 2);
        });
        y += 18;
        g.strokeStyle = theme.dark ? '#273142' : '#e3e8ef';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y - 6);
        g.lineTo(R.x + R.w - pad, y - 6);
        g.stroke();
        rowHits = [];
        const maxRows = Math.max(2, Math.floor((R.y + h - footH - y) / lh));
        const sel = clamp(Math.round(DK.v), 0, 4);
        for (let j = 0; j < Math.min(rowsN, maxRows); j++) {
          const yy = y + j * lh + lh / 2;
          const fa = f.d(j, a);
          const ta = j <= n ? fa : 0;
          const agree = Math.abs(fa - ta) <= 1e-9 * (1 + Math.abs(fa));
          const rowR = { x: R.x + pad - 6, y: yy - lh / 2 + 2, w: R.w - 2 * pad + 12, h: lh - 3 };
          if (j <= 4) rowHits.push({ r: rowR, k: j });
          const a0 = ease.outCubic(clamp01(k.stagger * (rowsN + 2) - j));
          g.save();
          g.globalAlpha *= a0;
          if (j === sel) {
            g.fillStyle = withAlpha(col.a(), theme.dark ? 0.2 : 0.11);
            roundRect(g, rowR.x, rowR.y, rowR.w, rowR.h, 8);
            g.fill();
            g.strokeStyle = withAlpha(col.a(), 0.6);
            g.lineWidth = 1.2;
            roundRect(g, rowR.x + 0.5, rowR.y + 0.5, rowR.w - 1, rowR.h - 1, 8);
            g.stroke();
          }
          const nm = j < 3 ? say(names[j]!) : `${j}. ${say(L('Abl.', 'der.'))}`;
          const lab = fit(`${dName('f', j)}  \\c{m}{\\t{${nm}}}`, R.w * 0.29, F(12.5, 11.5), theme.text, j === sel ? 750 : 600);
          lab.draw(g, cx[0]!, yy + (lab.asc - lab.desc) / 2);
          const bf = fit(`\\c{f}{${Q(small(fa, 3))}}`, R.w * 0.27, F(13, 12));
          bf.draw(g, cx[1]!, yy + (bf.asc - bf.desc) / 2);
          const bt = fit(`\\c{T}{${Q(small(ta, 3))}}`, R.w * 0.27, F(13, 12));
          bt.draw(g, cx[2]!, yy + (bt.asc - bt.desc) / 2);
          g.restore();
          // Häkchen nacheinander, mit kleinem „Pop“
          const tt = reduced() ? 1 : clamp01((now - checkT0 - 200 - j * 170) / 320);
          if (tt > 0) {
            const s = ease.outBack(tt);
            const ok = agree;
            const c0 = ok ? col.conv() : col.x();
            g.save();
            g.globalAlpha *= a0 * clamp01(tt * 2);
            g.translate(cx[3]!, yy);
            g.scale(s, s);
            g.fillStyle = withAlpha(c0, theme.dark ? 0.25 : 0.15);
            g.beginPath();
            g.arc(0, 0, 11, 0, TAU);
            g.fill();
            g.strokeStyle = c0;
            g.lineWidth = 2.4;
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.beginPath();
            if (ok) {
              g.moveTo(-5, 0.5);
              g.lineTo(-1.5, 4);
              g.lineTo(5.5, -4);
            } else {
              g.moveTo(-4, -4);
              g.lineTo(4, 4);
              g.moveTo(4, -4);
              g.lineTo(-4, 4);
            }
            g.stroke();
            g.restore();
          }
        }
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        g.font = footFont;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        footLines.forEach((ln, i) => g.fillText(ln, R.x + pad, R.y + h - footH + 4 + F(8, 7.5) + i * F(16, 15)));
        g.restore();
        return h;
      };
    }

    function bandCard(k: Intro): CardFn {
      return (R, measure) => {
        const n = shownN();
        const [l, r] = shownBand ?? bandFor(p.n);
        const rows: Row[] = [];
        if (r - l < 1e-6) rows.push({ src: `\\c{x}{\\t{${say(L('Nirgends – selbst bei a nicht (ε zu klein?)', 'Nowhere – not even at a (ε too small?)'))}}}` });
        else {
          rows.push({ src: `\\c{b}{${Q(n2(l))} < x < ${Q(n2(r))}}`, size: F(15, 14), gap: 8 });
          rows.push({ src: `\\c{m}{\\t{${say(L('Breite', 'width'))}}: ${Q(n2(r - l))}   (n = ${n}, ε = ${fmt.num(eps(), 3)})}`, size: F(12.5, 11.5) });
          const [vx0, vx1] = VIEW[key()].x;
          if (Math.abs(l - vx0) < 1e-6 || Math.abs(r - vx1) < 1e-6) rows.push({ src: `\\c{m}{\\t{${say(L('am Rand des Bildausschnitts abgeschnitten', 'cut off at the edge of the picture'))}}}`, size: F(11.5, 11) });
        }
        const Rr = fn().radius(aEff());
        if (Number.isFinite(Rr)) rows.push({ src: `\\c{c}{\\t{${say(L('Konvergenzintervall', 'interval of convergence'))}}: |x − a| < ${fmt.num(Rr, 1)}}`, size: F(12.5, 11.5) });
        return formulaCard(R, measure, k, say(L('Gültigkeitsbereich |f(x) − Tₙ(x)| < ε', 'Range |f(x) − Tₙ(x)| < ε')), col.band(), rows);
      };
    }

    function widthCard(k: Intro): CardFn {
      return (R, measure) => {
        const hh = clamp(R.h, 130, F(190, 170));
        if (measure) return R.h < 130 ? 9999 : hh;
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        card({ ...R, h: hh });
        cardTitle(R, say(L('Breite des Bereichs für n = 0 … 15', 'Width of the range for n = 0 … 15')), col.band());
        const top = R.y + 44;
        const bottom = R.y + hh - 22;
        const widths = Array.from({ length: NMAX + 1 }, (_, j) => {
          const [a0, a1] = bandFor(j);
          return a1 - a0;
        });
        const [vx0, vx1] = VIEW[key()].x;
        const maxW2 = vx1 - vx0;
        const x0 = R.x + pad + 26;
        const x1 = R.x + R.w - pad;
        const bw = (x1 - x0) / (NMAX + 1);
        const Y = (v: number) => lerp(bottom, top, v / maxW2);
        g.strokeStyle = theme.gridMinor;
        g.lineWidth = 1;
        g.font = `600 ${F(11, 10.5)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        for (const v of [0, maxW2 / 2, maxW2]) {
          g.beginPath();
          g.moveTo(x0, Y(v));
          g.lineTo(x1, Y(v));
          g.stroke();
          g.fillText(fmt.num(v, 0), x0 - 4, Y(v));
        }
        const Rr = fn().radius(aEff());
        if (Number.isFinite(Rr)) {
          const yc = Y(Math.min(2 * Rr, maxW2));
          g.strokeStyle = col.conv();
          g.setLineDash([5, 4]);
          g.beginPath();
          g.moveTo(x0, yc);
          g.lineTo(x1, yc);
          g.stroke();
          g.setLineDash([]);
        }
        const n = shownN();
        widths.forEach((w, j) => {
          const grow = ease.outCubic(clamp01(k.poly * 1.4 - j / 30));
          const yy = lerp(bottom, Y(w), grow);
          const on = j === n;
          g.fillStyle = on ? col.band() : withAlpha(col.band(), theme.dark ? 0.42 : 0.32);
          roundRect(g, x0 + j * bw + 1.5, yy, bw - 3, Math.max(0, bottom - yy), Math.min(3, (bw - 3) / 2));
          g.fill();
          if (j % 5 === 0 || on) {
            g.font = `${on ? 750 : 600} ${F(11, 10.5)}px ${theme.font}`;
            g.fillStyle = on ? col.band() : theme.muted;
            g.textAlign = 'center';
            g.textBaseline = 'top';
            g.fillText(String(j), x0 + (j + 0.5) * bw, bottom + 5);
          }
        });
        return hh;
      };
    }

    /** Konvergenzradius: Abstand zur Polstelle bzw. Definitionslücke und Urteil an der Prüfstelle. */
    function convCard(k: Intro): CardFn {
      return (R, measure) => {
        const a = aEff();
        const Rr = fn().radius(a);
        const q = Math.abs(p.x - a);
        const where = convergenceAt(fn(), a, p.x);
        const rows: Row[] = [];
        if (key() === 'ln') rows.push({ src: `\\t{${say(L('Definitionslücke bei', 'not defined at'))}} x = −1:  r = 1 + a = \\c{c}{${fmt.num(Rr, 1)}}`, gap: 8 });
        else if (key() === 'geo') rows.push({ src: `\\t{${say(L('Polstelle bei', 'pole at'))}} x = 1:  r = |1 − a| = \\c{c}{${fmt.num(Rr, 1)}}`, gap: 8 });
        else rows.push({ src: `\\c{c}{r = ∞}: \\t{${say(L('konvergiert für alle x', 'converges for all x'))}}`, gap: 8 });
        if (Number.isFinite(Rr)) {
          rows.push({ src: `\\c{c}{\\t{${say(L('Konvergenzintervall', 'interval of convergence'))}}: ${fmt.num(a - Rr, 1)} < x < ${fmt.num(a + Rr, 1)}}`, size: F(12.5, 11.5), gap: 8 });
          const cmp = where === 'inside' ? '<' : where === 'edge' ? '=' : '>';
          rows.push({ src: `|x − a| = ${n2(q)} ${cmp} r`, gap: 6 });
          if (where === 'inside') rows.push({ src: `\\c{c}{✓ T_n(x) → f(x) \\t{${say(L('für n → ∞', 'as n → ∞'))}}}`, size: F(13, 12), weight: 700 });
          else if (where === 'edge') rows.push({ src: say(L('Randpunkt: Ob die Reihe hier konvergiert, muss man einzeln prüfen.', 'Boundary point: whether the series converges here must be checked separately.')), text: true, color: col.conv(), weight: 700 });
          else rows.push({ src: say(L('✗ divergiert: Mehr Summanden machen den Fehler größer.', '✗ diverges: more terms make the error larger.')), text: true, color: col.x(), weight: 700 });
        } else {
          rows.push({ src: say(L('Für großes |x − a| braucht man aber viele Summanden.', 'For large |x − a| you need many terms, though.')), text: true, color: th().muted });
        }
        return formulaCard(R, measure, k, say(L('Konvergenzradius', 'Radius of convergence')), col.conv(), rows);
      };
    }

    /** Taschenrechner: Partialsummen, richtige Nachkommastellen fett. */
    function calcCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = F(14, 12);
        const n = p.n;
        const lh = F(23, 22);
        const head = 96;
        const want = head + (n + 1) * lh + 32;
        if (measure) return R.h < head + 3 * lh + 32 ? 9999 : Math.min(R.h, want);
        const h = Math.min(R.h, want);
        const a = aEff();
        const x = p.x;
        const exact = fn().f(x);
        const D = sm() ? 6 : 8;
        card({ ...R, h }, col.T());
        cardTitle(R, say(L('Partialsummen', 'Partial sums')), col.T(), `\\c{m}{x = ${n2(x)}}`);
        // exakter Wert
        const ex = Number.isFinite(exact) ? `\\c{f}{f(${n2(x)}) = ${Q(fmt.fixed(exact, D))}…}` : `\\c{x}{f(${n2(x)}) \\t{${say(L('nicht definiert', 'not defined'))}}}`;
        const eb = fit(ex, R.w - 2 * pad, F(13.5, 12.5));
        eb.draw(g, R.x + pad, R.y + 52 + (eb.asc - eb.desc) / 2);
        const c0 = R.x + pad;
        const c1 = R.x + pad + R.w * 0.12;
        const c2 = R.x + R.w - pad;
        let y = R.y + 38 + 30 + 10;
        g.font = `700 ${F(12, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText('k', c0, y);
        g.fillText('Tₖ(x)', c1, y);
        g.textAlign = 'right';
        if (p.show) g.fillText(say(L('richtig', 'correct')), c2, y);
        y += 12;
        g.strokeStyle = theme.dark ? '#273142' : '#e3e8ef';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y);
        g.lineTo(R.x + R.w - pad, y);
        g.stroke();
        y += 4;
        const maxRows = Math.max(2, Math.floor((R.y + h - 30 - y) / lh));
        const first = Math.max(0, n + 1 - maxRows);
        const c = cs(key(), a);
        let s = 0;
        let pw = 1;
        const fsz = F(13, 12);
        for (let j = 0; j <= n; j++) {
          s += c[j]! * pw;
          pw *= x - a;
          if (j < first) continue;
          const yy = y + (j - first) * lh + lh / 2;
          const vis = clamp01(NV.v - j + 1) * ease.outCubic(clamp01(k.stagger * (n + 3) - (j - first)));
          if (vis <= 0.01) continue;
          const d = Number.isFinite(exact) ? correctDecimals(s, exact, D) : -1;
          let src: string;
          if (Math.abs(s) >= 1e5) src = small(s);
          else {
            const str = fmt.fixed(s, D);
            const sepI = str.search(/[,.]/);
            const cut = !p.show || d < 0 ? 0 : d === 0 ? sepI : sepI + 1 + d;
            src = cut > 0 ? `\\b{${str.slice(0, cut)}}\\c{m}{${str.slice(cut)}}` : `\\c{m}{${str}}`;
          }
          g.save();
          g.globalAlpha *= vis;
          if (j === n) {
            g.fillStyle = withAlpha(col.T(), theme.dark ? 0.16 : 0.09);
            roundRect(g, R.x + pad - 6, yy - lh / 2 + 1, R.w - 2 * pad + 12, lh - 2, 7);
            g.fill();
          }
          g.font = `${j === n ? 750 : 600} ${fsz}px ${theme.font}`;
          g.fillStyle = theme.text;
          g.textAlign = 'left';
          g.fillText(String(j), c0, yy);
          const b = formula(g, src, fstyle(fsz, theme.text, 600));
          b.draw(g, c1, yy + (b.asc - b.desc) / 2);
          if (p.show) {
            g.textAlign = 'right';
            g.fillStyle = d > 0 ? col.conv() : theme.muted;
            g.font = `700 ${fsz}px ${theme.font}`;
            g.fillText(d < 0 ? '–' : String(d), c2, yy);
          }
          g.restore();
        }
        // Fuß: wie viele Summanden für 6 Stellen?
        const need = Number.isFinite(exact) ? degreeForDecimals(fn(), a, x, 6, 60) : null;
        const foot = !p.show
          ? say(L('Wie viele Summanden braucht man für 6 Nachkommastellen?', 'How many terms are needed for 6 decimals?'))
          : !Number.isFinite(exact)
            ? say(L('f(x) nicht definiert: kein Grenzwert.', 'f(x) not defined: no limit.'))
            : need === null
            ? say(L('x außerhalb des Konvergenzintervalls', 'x outside the interval of convergence'))
            : say(L(`Für 6 richtige Nachkommastellen: n = ${need}`, `6 correct decimals need n = ${need}`));
        const fb = fit(`\\c{m}{\\t{${foot}}}`, R.w - 2 * pad, F(12, 11));
        fb.draw(g, R.x + pad, R.y + h - 14);
        return h;
      };
    }

    function smallCard(k: Intro): CardFn {
      return (R, measure) => {
        const phi = PH.v;
        const deg = toDeg(phi);
        const e = smallAngleError(phi);
        const rel = smallAngleRelError(phi);
        const ok = rel < 0.01;
        const rows: Row[] = [
          { src: `φ = ${fmt.num(deg, 0)}° = \\f{${fmt.num(deg, 0)} · π}{180} ≈ \\c{T}{${fmt.num(phi, 4)}}`, gap: 10 },
          { src: `\\c{f}{\\t{sin} φ ≈ ${fmt.num(Math.sin(phi), 4)}}`, gap: 8 },
          { src: `\\c{x}{φ − \\t{sin} φ ≈ ${Q(fmt.num(e, 4))}}`, gap: 8 },
          { src: `\\c{x}{\\t{${say(L('relativ', 'relative'))}}: \\f{φ − \\t{sin} φ}{\\t{sin} φ} ≈ \\b{${Q(`${fmt.num(rel * 100, 2)} %`)}}}`, gap: 10 },
          { src: p.show ? (e < 0.01 ? `\\c{c}{✓ |\\t{sin} φ − φ| < 0,01}` : `\\c{x}{✗ |\\t{sin} φ − φ| ≥ 0,01}`) : `\\c{m}{|\\t{sin} φ − φ| < 0,01 ?}`, weight: 700, size: F(13, 12), gap: 6 },
          { src: p.show ? (ok ? `\\c{c}{✓ \\t{${say(L('relativer Fehler unter 1 %', 'relative error below 1 %'))}}}` : `\\c{x}{✗ \\t{${say(L('relativer Fehler über 1 %', 'relative error above 1 %'))}}}`) : `\\c{m}{\\t{${say(L('relativer Fehler unter 1 %?', 'relative error below 1 %?'))}}}`, weight: 700, size: F(13, 12) },
        ];
        return formulaCard(R, measure, k, say(L('sin φ ≈ φ', 'sin φ ≈ φ')), col.x(), rows, `\\c{T}{${fmt.num(deg, 0)}°}`);
      };
    }

    function limitsCard(k: Intro): CardFn {
      return (R, measure) => {
        const rows: Row[] = [
          { src: `|\\t{sin} φ − φ| < 0,01  ⇔  φ < ${fmt.num(SMALL_ABS, 4)} ≈ \\c{c}{${fmt.num(toDeg(SMALL_ABS), 1)}°}`, size: F(13, 12), gap: 8 },
          { src: `\\t{${say(L('relativer Fehler', 'relative error'))}} < 1 %  ⇔  φ < \\c{c}{${fmt.num(toDeg(SMALL_REL), 1)}°}`, size: F(13, 12), gap: 8 },
          { src: `\\t{${say(L('Grund', 'reason'))}}: \\t{sin} φ = φ − \\f{φ^3}{6} + … ⇒ \\t{${say(L('Fehler', 'error'))}} ≈ \\f{φ^3}{6}`, size: F(13, 12), gap: 8 },
          { src: `\\c{m}{\\t{${say(L('Pendel: Mit sin φ ≈ φ gilt T = 2π', 'Pendulum: with sin φ ≈ φ, T = 2π'))}}\\r{\\f{l}{g}}}`, size: F(12.5, 11.5) },
        ];
        return formulaCard(R, measure, k, say(L('Wie weit reicht die Näherung?', 'How far does it reach?')), col.conv(), rows);
      };
    }

    /** Sonderfälle als Hinweiskarte (höchstens einer, der wichtigste zuerst). */
    function noteFor(): { title: Txt; body: Txt; accent: string } | null {
      const v = view();
      if (v === 'small') return null;
      const n = p.n;
      const a = aEff();
      const k = key();
      const usesX = v === 'approx' || v === 'conv' || v === 'calc';
      if (usesX && k === 'geo' && Math.abs(p.x - 1) < 1e-9)
        return { title: L('Polstelle x = 1', 'Pole x = 1'), body: L('Hier ist f nicht definiert. Die Partialsummen 1, 2, 3, … wachsen über alle Grenzen – die geometrische Reihe divergiert.', 'f is not defined here. The partial sums 1, 2, 3, … grow without bound – the geometric series diverges.'), accent: col.x() };
      if (usesX && k === 'geo' && Math.abs(a) < 1e-9 && Math.abs(p.x + 1) < 1e-9)
        return { title: L('Randpunkt x = −1', 'Boundary point x = −1'), body: L('Die Partialsummen springen 1, 0, 1, 0, … hin und her und kommen nicht zur Ruhe, obwohl f(−1) = 0,5 ist.', 'The partial sums jump 1, 0, 1, 0, … back and forth and never settle, although f(−1) = 0.5.'), accent: col.conv() };
      if (usesX && k === 'ln' && convergenceAt(fn(), a, p.x) === 'edge' && p.x > a)
        return { title: L('Randpunkt', 'Boundary point'), body: L('Am rechten Rand konvergiert die Reihe noch – aber sehr langsam und abwechselnd zu groß und zu klein (bei a = 0 gegen ln 2 ≈ 0,6931).', 'At the right boundary the series still converges – but very slowly, alternately too large and too small (for a = 0 towards ln 2 ≈ 0.6931).'), accent: col.conv() };
      if (k === 'ln' && a <= -0.7)
        return { title: L('a nahe der Definitionslücke', 'a close to the gap'), body: L(`Der Konvergenzradius ist nur r = 1 + a = ${fmt.num(1 + a, 1)}. Schon kurz neben a explodieren die Polynome.`, `The radius of convergence is only r = 1 + a = ${fmt.num(1 + a, 1)}. Just next to a the polynomials blow up.`), accent: col.x() };
      if (usesX && convergenceAt(fn(), a, p.x) === 'outside' && v !== 'conv')
        return { title: L('Außerhalb des Konvergenzintervalls', 'Outside the interval of convergence'), body: L('Hier wird der Fehler mit wachsendem n größer, nicht kleiner. Die Ansicht „Konvergenzradius“ zeigt alle Grade übereinander.', 'Here the error grows with n instead of shrinking. The view “Radius of convergence” shows all degrees at once.'), accent: col.x() };
      if (n === 0) return { title: L('Sonderfall n = 0', 'Special case n = 0'), body: L('T₀(x) = f(a) ist eine waagerechte Gerade: Sie übernimmt nur den Funktionswert, noch keine Steigung.', 'T₀(x) = f(a) is a horizontal line: it only takes over the value, no slope yet.'), accent: col.a() };
      if (sameAsPrevious(fn(), a, n))
        return {
          title: L(`Warum ist T${subDigits(n)} = T${subDigits(n - 1)}?`, `Why is T${subDigits(n)} = T${subDigits(n - 1)}?`),
          body: L(`Die ${n}. Ableitung ist bei a gleich 0, also auch der neue Koeffizient c${subDigits(n)}. Bei sin x um 0 sind alle geraden Ableitungen 0 (sin 0 = 0).`, `The ${n}th derivative is 0 at a, so the new coefficient c${subDigits(n)} is 0, too. For sin x about 0 all even derivatives vanish (sin 0 = 0).`),
          accent: col.a(),
        };
      return null;
    }

    function cardsFor(k: Intro, now: number): CardFn[] {
      const v = view();
      const list: CardFn[] = [];
      if (v === 'small') return [smallCard(k), limitsCard(k)];
      if (v === 'approx') {
        list.push(polyCard(k));
        if (p.err) list.push(errCard(k));
      } else if (v === 'terms') list.push(polyCard(k), coefCard(k));
      else if (v === 'band') list.push(polyCard(k), bandCard(k));
      else if (v === 'match') list.push(matchCard(k, now));
      else if (v === 'conv') list.push(convCard(k), errChart(k, say(L('Fehler |Rₙ(x)| für n = 0 … 15 (log.)', 'Error |Rₙ(x)| for n = 0 … 15 (log)')), true));
      else list.push(calcCard(k));
      const note = noteFor();
      if (note) {
        // in der Tabellen-Ansicht zuerst, sonst würde die lange Tabelle den Hinweis verdrängen
        const nc = textCard(k, say(note.title), note.accent, say(note.body));
        if (v === 'calc' || v === 'terms') list.unshift(nc);
        else list.push(nc);
      }
      if (v === 'approx' && p.err && p.show) list.push(errChart(k, say(L('Fehler |Rₙ(x)| für n = 0 … 15', 'Error |Rₙ(x)| for n = 0 … 15')), false));
      if (v === 'band') list.push(widthCard(k));
      if (v === 'match') list.push(polyCard(k));
      if (v === 'calc') list.push(polyCard(k));
      return list;
    }

    function drawColumn(Cr: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const list = cardsFor(k, now);
      const gap = F(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      if (view() !== 'match') rowHits = [];
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
    function updateReadouts(): void {
      for (const id of ['poly', 'err', 'valid', 'fit', 'conv', 'calc', 'small']) ctx.readout(id, null);
      const v = view();
      if (v === 'small') {
        const phi = toRad(p.phi);
        ctx.readout('small', `φ = ${p.phi}° ≈ ${fmt.num(phi, 4)}: sin φ ≈ ${fmt.num(Math.sin(phi), 4)}, φ − sin φ ≈ ${fmt.num(smallAngleError(phi), 4)} (${fmt.num(smallAngleRelError(phi) * 100, 2)} %)`);
        return;
      }
      const f = fn();
      const a = aEff();
      const n = p.n;
      ctx.readout('poly', `T${subDigits(n)}(x) = ${plain(polySrc(n, 6))}`);
      if (v === 'approx' || v === 'calc' || v === 'conv') {
        const r = remainder(f, a, n, p.x);
        ctx.readout('err', Number.isFinite(r) ? `f(${n2(p.x)}) − T${subDigits(n)}(${n2(p.x)}) ≈ ${small(r)}` : say(L('f ist an der Prüfstelle nicht definiert', 'f is not defined at the test point')));
      }
      if (v === 'band') {
        const [l, r] = bandFor(n);
        ctx.readout('valid', r - l < 1e-9 ? say(L('Nirgends – selbst bei a nicht', 'Nowhere – not even at a')) : `${n2(l)} < x < ${n2(r)} (${say(L('Breite', 'width'))} ${n2(r - l)}) ${say(L('für', 'for'))} ε = ${fmt.num(eps(), 3)}`);
      }
      if (v === 'match') {
        const m = matchOrder(f, a, n);
        ctx.readout('fit', m > n ? say(L(`Wert und ${m} Ableitungen stimmen überein (mehr als n = ${n}, weil c${subDigits(n + 1)} = 0)`, `Value and ${m} derivatives agree (more than n = ${n}, because c${subDigits(n + 1)} = 0)`)) : say(L(`Wert und ${n} Ableitungen stimmen überein`, `Value and ${n} derivatives agree`)));
      }
      if (v === 'conv') {
        const R = f.radius(a);
        const where = convergenceAt(f, a, p.x);
        const w = where === 'inside' ? say(L('konvergiert', 'converges')) : where === 'edge' ? say(L('Randpunkt', 'boundary point')) : say(L('divergiert', 'diverges'));
        ctx.readout('conv', Number.isFinite(R) ? `r = ${fmt.num(R, 1)}, |x − a| = ${n2(Math.abs(p.x - a))}: ${w}` : `r = ∞: ${w}`);
      }
      if (v === 'calc') {
        const ex = f.f(p.x);
        if (Number.isFinite(ex)) {
          const t = taylor(f, a, n, p.x);
          const d = correctDecimals(t, ex, 10);
          ctx.readout('calc', `T${subDigits(n)}(${n2(p.x)}) ≈ ${fmt.fixed(t, 8)}, f(${n2(p.x)}) ≈ ${fmt.fixed(ex, 8)}: ${d < 0 ? say(L('keine Stelle richtig', 'no digit correct')) : say(L(`${d} Nachkommastellen richtig`, `${d} decimals correct`))}`);
        }
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      for (const c of allChans) if (c.step(now, dt)) anim = true;
      if (running && !NV.busy) running = false;
      if (intro !== null || fnFade !== null || cardFade !== null) anim = true;
      if (view() === 'match' && !reduced() && now - checkT0 < 200 + 7 * 170 + 400) anim = true;
      // Gültigkeitsbereich gleitet
      if (view() === 'band') {
        const goal = bandFor(p.n);
        if (!shownBand || reduced() || dragging()) shownBand = goal;
        else {
          const kk = 1 - Math.exp(-dt * 8);
          const next: [number, number] = [shownBand[0] + (goal[0] - shownBand[0]) * kk, shownBand[1] + (goal[1] - shownBand[1]) * kk];
          if (Math.abs(next[0] - goal[0]) + Math.abs(next[1] - goal[1]) < 1e-3) shownBand = goal;
          else {
            shownBand = next;
            anim = true;
          }
        }
      }
      const k = introState(now);
      let fadeIn = 1;
      if (viewFade !== null) {
        const t = (now - viewFade) / 520;
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
      g.save();
      g.globalAlpha = k.panel * lerp(0.25, 1, fadeIn);
      g.translate(0, (1 - k.panel * fadeIn) * 10);
      drawPlot(now, k);
      g.restore();
      drawColumn(R.col, now, k);
      if (anim || dragging()) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retarget(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const rg = rangeFor();
      const targets: [Chan, number, number][] = [
        [A, aEff(), 750],
        [X, p.x, 650],
        [PH, toRad(p.phi), 650],
        [DK, p.dk, 600],
        [RX0, rg.x[0], 700],
        [RX1, rg.x[1], 700],
        [RY0, rg.y[0], 700],
        [RY1, rg.y[1], 700],
      ];
      for (const [c, val, dur] of targets) {
        if (instant) c.jump(val);
        else if (Math.abs(c.goal - val) < 1e-12) continue;
        else if (dragging()) c.follow(val, 0.05);
        else if (source === 'input' && c !== DK && c.goal !== val && Math.abs(c.goal - val) < 0.35) c.follow(val, 0.12);
        else c.glide(val, dur, 0, now);
      }
      // Grad: zählt weich (über die Zwischengrade), außer beim Durchlaufen
      if (running && source === 'sim') return;
      if (source === 'input' || source === 'replace') running = false;
      if (instant) NV.jump(p.n);
      else if (Math.abs(NV.goal - p.n) > 1e-9) NV.glide(p.n, 380 + 110 * Math.min(8, Math.abs(NV.v - p.n)), 0, now);
    }

    /** Einstieg: f zeichnet sich, dann wächst Tₙ Grad für Grad, die Karten gleiten herein. */
    function startIntro(now: number): void {
      if (reduced()) {
        intro = null;
        return;
      }
      intro = now;
      NV.jump(0);
      if (p.n > 0) NV.glide(p.n, 500 + p.n * 110, 700, now, ease.inOutCubic);
      checkT0 = now + 900;
    }

    let prevKey: FnKey = key();
    let prevView: ViewKey = view();
    return {
      update(changed, source) {
        const now = performance.now();
        if (changed.has('fn') && source === 'input' && Math.abs(aEff() - p.a) > 1e-9) ctx.set({ a: aEff() });
        if (source === 'init') {
          retarget(now, source);
          startIntro(now);
        } else {
          if (key() !== prevKey) {
            if (!reduced()) fnFade = { from: prevKey, a: A.v, nv: NV.v, t0: now };
            A.jump(aEff());
            shownBand = null;
          }
          if (view() !== prevView) {
            if (!reduced()) {
              viewFade = now;
              cardFade = now;
            }
            shownBand = null;
          }
          retarget(now, source);
          if (['n', 'a', 'fn', 'view'].some((id) => changed.has(id))) checkT0 = now;
        }
        prevKey = key();
        prevView = view();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'up' || id === 'down') {
          running = false;
          const next = clamp(p.n + (id === 'up' ? 1 : -1), 0, NMAX);
          if (next !== p.n) ctx.set({ n: next });
        } else if (id === 'run') {
          if (reduced()) {
            ctx.set({ n: RUN_N });
            return;
          }
          running = true;
          ctx.set({ n: RUN_N });
          NV.jump(0);
          NV.glide(RUN_N, RUN_N * RUN_STEP_MS, 200, now, stairs(RUN_N));
          checkT0 = now;
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
