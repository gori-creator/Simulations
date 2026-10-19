import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  commonPoints,
  compareAt,
  compareIntervals,
  curveClass,
  curveKind,
  domain,
  EXPONENTS,
  intersections,
  isEven,
  limits,
  monotony,
  morphValue,
  N_MAX,
  N_MIN,
  power,
  range,
  symmetry,
  type CurveClass,
  type Limit,
  type RangeKind,
  type Trend,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const NE = EXPONENTS.length;
const unit = (n: number) => EXPONENTS.map((k) => (k === n ? 1 : 0));

type View = 'single' | 'family' | 'compare';
type Pt = [number, number];

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number } | null = null;
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
    this.goal = goal;
    this.tau = tau;
    this.tw = null;
  }
  glide(goal: number, dur: number, delay: number, now: number): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur };
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
      this.v = lerp(tw.from, tw.to, ease.inOutCubic(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return false;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-4 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/**
 * Weicher Übergang zwischen Exponenten: Gewichte über alle n (Summe 1).
 * Wird ein Übergang unterbrochen, startet der nächste beim aktuellen Mischzustand.
 */
class Morph {
  private from: number[];
  private to: number[];
  private t0 = 0;
  private dur = 0;
  target: number;
  constructor(n: number) {
    this.from = unit(n);
    this.to = unit(n);
    this.target = n;
  }
  at(now: number): number[] {
    if (this.dur <= 0) return this.to;
    const e = ease.inOutCubic(clamp01((now - this.t0) / this.dur));
    if (e >= 1) return this.to;
    return this.from.map((f, i) => f + (this.to[i]! - f) * e);
  }
  busy(now: number): boolean {
    return this.dur > 0 && now < this.t0 + this.dur;
  }
  go(n: number, dur: number, now: number): void {
    this.from = this.at(now);
    this.to = unit(n);
    this.target = n;
    this.t0 = now;
    this.dur = dur;
  }
  jump(n: number): void {
    this.from = unit(n);
    this.to = unit(n);
    this.target = n;
    this.dur = 0;
  }
}

/** Symmetrie-Animation: rechter Teil wird gespiegelt (gerades n) bzw. gedreht (ungerades n). */
interface SymAnim {
  t0: number;
  n: number;
  x0: number;
}
const SYM = { show: 600, move: 1900, hold: 2300, fade: 600 };
const SYM_END = SYM.show + SYM.move + SYM.hold + SYM.fade;

/** Vergleich: senkrechte Linie fährt von links nach rechts. */
interface Sweep {
  t0: number;
  from: number;
  to: number;
  dur: number;
}

const TABLE_X7 = [-2, -1, -0.5, 0, 0.5, 1, 2];
const TABLE_X5 = [-2, -1, 0, 1, 2];

/**
 * Potenzfunktionen f(x) = a · xⁿ mit ganzzahligem n von −4 bis 6. Beim Ändern
 * von n verwandelt sich der Graph weich (die Funktionswerte werden in einer
 * beschränkten Größe gemischt, so springt nichts durch die Polstelle).
 * Ansichten: ein Graph mit Steckbrief und Wertetabelle, die Familie gleicher
 * Symmetrie mit gemeinsamen Punkten und der Vergleich zweier Potenzfunktionen
 * mit Schnittpunkten. Aktion „Symmetrie zeigen“ spiegelt bzw. dreht den
 * rechten Teil des Graphen. Griffe: Q(1 | a) für den Streckfaktor, P auf dem Graphen.
 */
export default defineSimulation({
  id: 'potenzfunktionen',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  groups: [
    { id: 'point', label: L('Punkt P (Punktprobe)', 'Point P (checking a point)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'single', label: L('Ein Graph mit Steckbrief', 'One graph with key features') },
        { value: 'family', label: L('Familie: gleiche Symmetrie', 'Family: same symmetry') },
        { value: 'compare', label: L('Zwei Potenzfunktionen vergleichen', 'Compare two power functions') },
      ],
      default: 'single',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Exponent n', 'Exponent n'),
      help: L('Ganze Zahl von −4 bis 6. Gerade n: achsensymmetrisch, ungerade n: punktsymmetrisch; negative n: Hyperbeln.', 'Integer from −4 to 6. Even n: symmetric about the y-axis, odd n: symmetric about the origin; negative n: hyperbolas.'),
      min: N_MIN,
      max: N_MAX,
      step: 1,
      default: 2,
    },
    {
      key: 'm',
      type: 'number',
      label: L('Exponent m der zweiten Funktion g', 'Exponent m of the second function g'),
      min: N_MIN,
      max: N_MAX,
      step: 1,
      default: 4,
      visibleIf: (v) => v.view === 'compare',
    },
    {
      key: 'a',
      type: 'number',
      label: L('Streckfaktor a', 'Stretch factor a'),
      help: L('|a| > 1: gestreckt, |a| < 1: gestaucht, a < 0: an der x-Achse gespiegelt. Auch am Punkt Q(1 | a) ziehen.', '|a| > 1: stretched, |a| < 1: compressed, a < 0: reflected in the x-axis. You can also drag the point Q(1 | a).'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 1,
    },
    {
      key: 'x',
      type: 'number',
      group: 'point',
      label: L('Stelle x von P', 'Position x of P'),
      help: L('P liegt auf dem Graphen; auch direkt am Punkt ziehen.', 'P lies on the graph; you can also drag the point.'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 1.5,
      visibleIf: (v) => v.view === 'single',
    },
    { key: 'asym', type: 'boolean', group: 'view', label: L('Asymptoten (bei n < 0)', 'Asymptotes (for n < 0)'), default: true },
    { key: 'info', type: 'boolean', group: 'view', label: L('Steckbrief und Werte im Bild', 'Key features and values in the picture'), help: L('Aus: Werte durch „?“ ersetzt (für Aufgaben).', 'Off: values replaced by “?” (for tasks).'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'sym', label: L('Symmetrie zeigen', 'Show symmetry'), primary: true, visibleIf: (v) => v.view !== 'compare' },
    { id: 'tour', label: L('Alle Exponenten durchlaufen', 'Run through all exponents'), visibleIf: (v) => v.view !== 'compare' },
    { id: 'sweep', label: L('Vergleich von links nach rechts', 'Compare from left to right'), primary: true, visibleIf: (v) => v.view === 'compare' },
  ],
  readouts: [
    { key: 'eq', label: L('Funktionsterm', 'Function') },
    { key: 'kind', label: L('Graph', 'Graph'), spoiler: true },
    { key: 'D', label: L('Definitionsmenge', 'Domain'), spoiler: true },
    { key: 'W', label: L('Wertemenge', 'Range'), spoiler: true },
    { key: 'sym', label: L('Symmetrie', 'Symmetry'), spoiler: true },
    { key: 'mono', label: L('Monotonie', 'Monotonicity'), spoiler: true },
    { key: 'lim', label: L('Verhalten', 'Behaviour'), spoiler: true },
    { key: 'asym', label: L('Asymptoten', 'Asymptotes'), spoiler: true },
    { key: 'probe', label: L('Punktprobe', 'Checking a point'), spoiler: true },
    { key: 'common', label: L('Gemeinsame Punkte', 'Common points'), spoiler: true },
    { key: 'cut', label: L('Schnittpunkte', 'Intersection points'), spoiler: true },
    { key: 'cmp', label: L('Vergleich', 'Comparison'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Normalparabel y = x²', 'Standard parabola y = x²'), values: {} },
    { id: 'cubic', label: L('Kubische Parabel y = 0,5 · x³', 'Cubic parabola y = 0.5 · x³'), values: { n: 3, a: 0.5, x: 2 } },
    { id: 'hyp2', label: L('Hyperbel 2. Ordnung y = x⁻²', 'Hyperbola of order 2: y = x⁻²'), values: { n: -2, x: 0.5 } },
    { id: 'neg', label: L('Gespiegelt: y = −2 · x⁻³', 'Reflected: y = −2 · x⁻³'), values: { n: -3, a: -2, x: 1 } },
    { id: 'family', label: L('Familie der geraden Exponenten', 'Family of even exponents'), values: { view: 'family', n: 4 } },
    { id: 'compare', label: L('x² und x⁴ im Vergleich', 'x² and x⁴ compared'), values: { view: 'compare', n: 2, m: 4 } },
  ],
  strings: {
    de: { canvas: 'Koordinatensystem mit dem Graphen der Potenzfunktion f(x) = a · xⁿ, daneben ein Steckbrief (Definitions- und Wertemenge, Symmetrie, Monotonie, Verhalten) und eine Wertetabelle. Weitere Ansichten: Familie gleicher Symmetrie mit gemeinsamen Punkten und Vergleich zweier Potenzfunktionen.' },
    en: { canvas: 'Coordinate system with the graph of the power function f(x) = a · xⁿ, next to it key features (domain, range, symmetry, monotonicity, behaviour) and a table of values. Further views: a family with the same symmetry and its common points, and a comparison of two power functions.' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    /** „nicht definiert“ (aufrecht gesetzt) */
    const ND = tt('\\t{n. d.}', '\\t{undef.}');
    const reduced = () => prefersReducedMotion();
    const editable = () => !ctx.locked;
    const view = () => p.view as View;

    /* ---------- Farben ---------- */

    const classColor = (c: CurveClass): string => {
      const s = th().series;
      if (c === 'evenPos') return s[0]!;
      if (c === 'oddPos') return s[1]!;
      if (c === 'evenNeg') return s[2]!;
      if (c === 'oddNeg') return s[4]!;
      return mixColor(th().muted, th().text, 0.15);
    };
    const nColor = (n: number) => classColor(curveClass(n));
    const C = () => {
      const s = th().series;
      return { P: s[3]!, Q: s[5]!, f: s[0]!, g: s[1]!, cut: s[3]!, sym: s[3]! };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)');

    /* ---------- Aufteilung ---------- */

    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wide()) {
        const ph = Math.round(h * 0.5);
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 4, y: ph + 8, w: w - 8, h: h - ph - 12 } };
      }
      const colW = Math.round(Math.min(340, Math.max(232, w * 0.33)));
      return { plot: { x: 0, y: 0, w: w - colW - 6, h }, col: { x: w - colW, y: 6, w: colW - 6, h: h - 12 } };
    }
    const textSize = () => {
      const w = surface.width;
      return !wide() ? 12.5 : w < 700 ? 12 : w < 900 ? 12.5 : 13.5;
    };

    const plot = new Plot(surface, { x: [-3.2, 3.2], y: [-3.2, 3.2], region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Zustand ---------- */

    const fixX = (x: number, n: number) => (n <= 0 && Math.abs(x) < 0.05 ? 0.1 : x);
    const MF = new Morph(p.n);
    const MG = new Morph(p.m);
    const A = new Chan(p.a);
    const X = new Chan(fixX(p.x, p.n));
    let sym: SymAnim | null = null;
    let sweep: Sweep | null = null;
    let tourTimer: ReturnType<typeof setTimeout> | null = null;
    let intro: number | null = reduced() ? null : performance.now();
    let viewFade = 1;
    let viewT0 = -Infinity;
    let cardT0 = -Infinity;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let lastQ = -Infinity;
    const grab = () => {
      lastDrag = performance.now();
    };
    const dragging = () => performance.now() - lastDrag < 300;

    /* ---------- Hilfen für Texte ---------- */

    const P1 = (v: number) => fmt.num(Math.round(v * 10) / 10, 1);
    const N = (v: number) => {
      const r = Math.abs(v);
      return fmt.num(v, r !== 0 && r < 0.1 ? 3 : r >= 100 ? 1 : 2);
    };
    const hidden = () => !p.info;
    const Q = (s: string) => (hidden() ? '?' : s);
    const expTxt = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
    const R = '\\t{ℝ}';

    /** Potenz xⁿ als Formel (x¹ = x). */
    const xPow = (n: number, x = 'x') => (n === 1 ? x : `${x}^{${expTxt(n)}}`);
    /** Funktionsterm, z. B. „f(x) = 0,5 · x⁴“ oder „f(x) = x⁻² = 1/x²“. */
    function termSrc(a: number, n: number, name = 'f'): string {
      const ar = Math.round(a * 10) / 10;
      const head = `${name}(x) = `;
      if (ar === 0) return `${head}0`;
      const coef = ar === 1 ? '' : ar === -1 ? '−' : `${P1(ar)} · `;
      if (n === 0) return `${head}${coef}x^{0} = ${P1(ar)}`;
      if (n > 0) return `${head}${coef}${xPow(n)}`;
      const k = -n;
      return `${head}${coef}${xPow(n)} = ${ar < 0 ? '−' : ''}\\f{${P1(Math.abs(ar))}}{${xPow(k)}}`;
    }
    const kindTxt = (n: number) => {
      const k = curveKind(n);
      if (k.kind === 'parabola') return tt(`Parabel ${k.order}. Ordnung`, `parabola of order ${k.order}`);
      if (k.kind === 'hyperbola') return tt(`Hyperbel ${k.order}. Ordnung`, `hyperbola of order ${k.order}`);
      if (k.kind === 'line') return tt('Ursprungsgerade', 'line through the origin');
      return tt('Parallele zur x-Achse', 'line parallel to the x-axis');
    };
    const classTxt = (c: CurveClass) =>
      ({
        evenPos: tt('n gerade, n > 0', 'n even, n > 0'),
        oddPos: tt('n ungerade, n > 0', 'n odd, n > 0'),
        evenNeg: tt('n gerade, n < 0', 'n even, n < 0'),
        oddNeg: tt('n ungerade, n < 0', 'n odd, n < 0'),
        const: 'n = 0',
      })[c];
    const rangeSrc = (r: RangeKind, a: number) =>
      ({
        R,
        'R0+': `${R}_{0}^{+}`,
        'R0-': `${R}_{0}^{−}`,
        'R+': `${R}^{+}`,
        'R-': `${R}^{−}`,
        'R\\0': `${R} \\ {0}`,
        const: `{${P1(a)}}`,
      })[r];
    const rangeHtml = (r: RangeKind, a: number) =>
      ({
        R: 'ℝ',
        'R0+': 'ℝ<sub>0</sub><sup>+</sup>',
        'R0-': 'ℝ<sub>0</sub><sup>−</sup>',
        'R+': 'ℝ<sup>+</sup>',
        'R-': 'ℝ<sup>−</sup>',
        'R\\0': 'ℝ \\ {0}',
        const: `{${fmt.num(a)}}`,
      })[r];
    const trendTxt = (t: Trend) => (t === 'inc' ? tt('steigend', 'increasing') : t === 'dec' ? tt('fallend', 'decreasing') : tt('konstant', 'constant'));
    function monoTxt(a: number, n: number): string {
      const m = monotony(a, n);
      if (m.left === 'const') return tt('konstant', 'constant');
      if (m.whole) return tt(`streng monoton ${trendTxt(m.left)} in ℝ`, `strictly ${trendTxt(m.left)} on ℝ`);
      if (m.left === m.right) return tt(`${trendTxt(m.left)} für x\u00a0<\u00a00 und für x\u00a0>\u00a00`, `${trendTxt(m.left)} for x\u00a0<\u00a00 and for x\u00a0>\u00a00`);
      const le = n > 0 ? '≤' : '<';
      const ge = n > 0 ? '≥' : '>';
      return tt(`${trendTxt(m.left)} für x\u00a0${le}\u00a00, ${trendTxt(m.right)} für x\u00a0${ge}\u00a00`, `${trendTxt(m.left)} for x\u00a0${le}\u00a00, ${trendTxt(m.right)} for x\u00a0${ge}\u00a00`);
    }
    const limTxt = (l: Limit) => (l === '+inf' ? '+∞' : l === '-inf' ? '−∞' : fmt.num(l));
    function infTxt(a: number, n: number): string {
      const l = limits(a, n);
      if (l.negInf === l.posInf) return `x → ±∞: f(x) → ${limTxt(l.posInf)}`;
      return `x → −∞: f(x) → ${limTxt(l.negInf)};  x → +∞: f(x) → ${limTxt(l.posInf)}`;
    }
    function zeroTxt(a: number, n: number): string {
      const l = limits(a, n);
      if (n === 0) return tt(`x → 0: f(x) = ${fmt.num(a)} (0 ∉ D)`, `x → 0: f(x) = ${fmt.num(a)} (0 ∉ D)`);
      if (n > 0) return tt('x → 0: f(x) → 0, Graph durch O', 'x → 0: f(x) → 0, graph through O');
      if (l.zeroLeft === l.zeroRight) return tt(`x → 0: f(x) → ${limTxt(l.zeroRight)} (Polstelle)`, `x → 0: f(x) → ${limTxt(l.zeroRight)} (pole)`);
      return tt(`x → 0: links ${limTxt(l.zeroLeft)}, rechts ${limTxt(l.zeroRight)}`, `x → 0: ${limTxt(l.zeroLeft)} from the left, ${limTxt(l.zeroRight)} from the right`);
    }
    const symTxt = (n: number) => (symmetry(n) === 'axis' ? tt('achsensymmetrisch zur y-Achse', 'symmetric about the y-axis') : tt('punktsymmetrisch zum Ursprung', 'symmetric about the origin'));

    /* ---------- Ergebnisse (Text) ---------- */

    function updateReadouts(): void {
      const a = p.a;
      const n = p.n;
      const v = (s: string) => `<var>${s}</var>`;
      const frac = (num: string, den: string) => `<span class="frac"><span>${num}</span><span>${den}</span></span>`;
      const supE = (k: number) => (k === 1 ? '' : `<sup>${expTxt(k)}</sup>`);
      const termHtml = (aa: number, k: number, name: string) => {
        const coef = aa === 1 ? '' : aa === -1 ? '−' : `${fmt.num(aa)} · `;
        if (aa === 0) return `${v(name)}(${v('x')}) = 0`;
        if (k === 0) return `${v(name)}(${v('x')}) = ${coef}${v('x')}<sup>0</sup> = ${fmt.num(aa)}`;
        if (k > 0) return `${v(name)}(${v('x')}) = ${coef}${v('x')}${supE(k)}`;
        return `${v(name)}(${v('x')}) = ${coef}${v('x')}<sup>${expTxt(k)}</sup> = ${aa < 0 ? '−' : ''}${frac(fmt.num(Math.abs(aa)), `${v('x')}${supE(-k)}`)}`;
      };
      const all = ['kind', 'D', 'W', 'sym', 'mono', 'lim', 'asym', 'probe', 'common', 'cut', 'cmp'];
      for (const k of all) ctx.readout(k, null);
      if (view() === 'compare') {
        ctx.readout('eq', { html: `${termHtml(a, n, 'f')}; &nbsp; ${termHtml(a, p.m, 'g')}` });
        const xs = intersections(a, n, p.m);
        if (!xs) {
          ctx.readout('cut', a === 0 ? tt('a = 0: Beide Graphen liegen auf der x-Achse.', 'a = 0: both graphs lie on the x-axis.') : tt('n = m: Die Graphen sind gleich.', 'n = m: the graphs are identical.'));
        } else {
          ctx.readout('cut', xs.map((x) => fmt.point(x, power(a, n, x))).join(', '));
          ctx.readout('cmp', compareLines(a, n, p.m).join('; '));
        }
        return;
      }
      ctx.readout('eq', { html: termHtml(a, n, 'f') });
      if (a === 0) {
        ctx.readout('kind', tt('a = 0: Nullfunktion (keine Potenzfunktion im eigentlichen Sinn)', 'a = 0: zero function (not a power function in the proper sense)'));
        return;
      }
      ctx.readout('kind', `${kindTxt(n)} (${classTxt(curveClass(n))})`);
      ctx.readout('D', { html: `${v('D')} = ${domain(n) === 'R' ? 'ℝ' : 'ℝ \\ {0}'}` });
      ctx.readout('W', { html: `${v('W')} = ${rangeHtml(range(a, n), a)}` });
      ctx.readout('sym', `${symTxt(n)}: f(−x) = ${isEven(n) ? 'f(x)' : '−f(x)'}`);
      ctx.readout('mono', monoTxt(a, n));
      ctx.readout('lim', `${infTxt(a, n)}; ${zeroTxt(a, n)}`);
      ctx.readout('asym', n < 0 ? tt('x = 0 (senkrecht, Polstelle) und y = 0 (waagrecht)', 'x = 0 (vertical, pole) and y = 0 (horizontal)') : tt('keine', 'none'));
      if (view() === 'single') {
        const x = fixX(p.x, n);
        const y = power(a, n, x);
        const xb = x < 0 ? `(${fmt.num(x)})` : fmt.num(x);
        const coef = a === 1 ? '' : `${fmt.num(a)} · `;
        ctx.readout('probe', { html: `P${fmt.point(x, y)}: ${v('f')}(${fmt.num(x)}) = ${coef}${xb}<sup>${expTxt(n)}</sup> ${approxEq(y)} ${fmt.num(y, 3)}` });
      }
      if (view() === 'family') ctx.readout('common', commonPoints(a, n).map(([x, y]) => fmt.point(x, y)).join(', '));
    }
    const approxEq = (y: number) => (Math.abs(y * 1000 - Math.round(y * 1000)) < 1e-6 ? '=' : '≈');

    /** Vergleich in Worten: auf welchen Intervallen welcher Graph oben liegt. */
    function compareLines(a: number, n: number, m: number): string[] {
      const iv = compareIntervals(a, n, m);
      const rel = (s: number) => (s > 0 ? 'f(x) > g(x)' : s < 0 ? 'f(x) < g(x)' : 'f(x) = g(x)');
      const used = new Set<number>();
      const out: string[] = [];
      iv.forEach((q, i) => {
        if (used.has(i)) return;
        // symmetrische Außenteile zusammenfassen: |x| > 1
        if (q.from === -Infinity && iv.length > 1) {
          const last = iv[iv.length - 1]!;
          if (last.to === Infinity && last.sign === q.sign && last.from === -q.to) {
            used.add(iv.length - 1);
            out.push(`|x| > ${fmt.num(last.from)}: ${rel(q.sign)}`);
            return;
          }
        }
        let range0: string;
        if (q.from === -Infinity) range0 = `x < ${fmt.num(q.to)}`;
        else if (q.to === Infinity) range0 = `x > ${fmt.num(q.from)}`;
        else if (q.from === -q.to && q.from < 0) range0 = n > 0 && m > 0 ? `0 < |x| < ${fmt.num(q.to)}` : `${fmt.num(q.from)} < x < ${fmt.num(q.to)}, x ≠ 0`;
        else range0 = `${fmt.num(q.from)} < x < ${fmt.num(q.to)}`;
        out.push(`${range0}: ${rel(q.sign)}`);
      });
      return out;
    }

    function syncActions(): void {
      ctx.setAction('sym', { enabled: !ctx.locked && p.a !== 0 });
      ctx.setAction('tour', { enabled: !ctx.locked, label: tourTimer ? tt('Durchlauf anhalten', 'Stop') : tt('Alle Exponenten durchlaufen', 'Run through all exponents') });
      ctx.setAction('sweep', { enabled: !ctx.locked && p.a !== 0 && p.n !== p.m });
    }

    /* ---------- Griffe ---------- */

    plot.addHandle({
      get: () => [1, A.v],
      set: (_x, y) => {
        grab();
        lastQ = performance.now();
        ctx.set({ a: Math.max(-3, Math.min(3, y)) });
      },
      axis: 'y',
      enabled: () => editable() && !sym,
      color: () => C().Q,
    });
    plot.addHandle({
      get: () => {
        const x = X.v;
        return [x, shownF(performance.now())(x)];
      },
      set: (x) => {
        grab();
        let xx = Math.max(-3, Math.min(3, x));
        if (p.n <= 0 && Math.abs(xx) < 0.1) xx = xx < 0 ? -0.1 : 0.1;
        ctx.set({ x: xx });
      },
      axis: 'x',
      enabled: () => editable() && view() === 'single' && !sym && Math.abs(p.a) > 0,
      color: () => C().P,
    });

    /* ---------- Funktionen im Bild (gemischt während des Übergangs) ---------- */

    const yScale = () => {
      const b = plot.bounds;
      return Math.max(1, (b.yMax - b.yMin) / 2);
    };
    function weightsOf(m: Morph, now: number): { n: number; w: number }[] {
      const ws = m.at(now);
      const out: { n: number; w: number }[] = [];
      for (let i = 0; i < NE; i++) if (ws[i]! > 1e-5) out.push({ n: EXPONENTS[i]!, w: ws[i]! });
      return out;
    }
    function shownF(now: number, m: Morph = MF): (x: number, side?: 1 | -1) => number {
      const ws = weightsOf(m, now);
      const a = A.v;
      const Y = yScale();
      return (x, side = 1) => morphValue(ws, a, x, Y, side);
    }
    /** Farbe während des Übergangs: Mischung der beiden stärksten Klassenfarben. */
    function morphColor(m: Morph, now: number): string {
      const ws = weightsOf(m, now).sort((u, w) => w.w - u.w);
      const c0 = nColor(ws[0]!.n);
      if (ws.length < 2) return c0;
      return mixColor(c0, nColor(ws[1]!.n), ws[1]!.w / (ws[0]!.w + ws[1]!.w));
    }
    const weightWhere = (m: Morph, now: number, pred: (n: number) => boolean) => weightsOf(m, now).reduce((s, q) => s + (pred(q.n) ? q.w : 0), 0);

    /** Ein Ast (side = ±1) als Pixelpfad; reveal (0…1) lässt ihn vom Ursprung aus wachsen. */
    function branch(f: (x: number, side?: 1 | -1) => number, side: 1 | -1, reveal = 1): Pt[] {
      const { xMin, xMax } = plot.bounds;
      const r = plot.rect;
      const lo = side > 0 ? Math.max(0, xMin) : Math.max(0, -xMax);
      const hi = side > 0 ? xMax : -xMin;
      if (hi <= lo) return [];
      const end = lo + (hi - lo) * reveal;
      const n = 420;
      const pts: Pt[] = [];
      const yLo = r.y - r.h * 3;
      const yHi = r.y + r.h * 4;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const d = lo + (end - lo) * u * u;
        const x = side * d;
        const y = f(x, side);
        if (!Number.isFinite(y)) continue;
        pts.push([plot.px(x), Math.max(yLo, Math.min(yHi, plot.py(y)))]);
      }
      return pts;
    }

    /* ---------- Formeln ---------- */

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight });
    function fit(src: string, maxW: number, size: number, color: string, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /* ---------- Zeichnen: Hilfen ---------- */

    function pill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? textSize();
      const box = opts.maxW ? fit(src, opts.maxW, size, opts.color ?? th().text, 700) : formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      const align = opts.align ?? 'center';
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 9, y: base - box.asc - 6, w: box.w + 18, h: box.asc + box.desc + 12 };
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 11);
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.5;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 11);
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    /** Formel mit Halo direkt im Koordinatensystem. */
    function label(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = textSize(), alpha = 1): Rect {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 4, y: base - box.asc - 2, w: box.w + 8, h: box.asc + box.desc + 4 };
      if (alpha <= 0.01) return rr;
      g.save();
      g.globalAlpha = alpha * 0.85;
      g.fillStyle = th().bg;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 6);
      g.fill();
      g.globalAlpha = alpha;
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    /** Beschriftung in die Zeichenfläche klemmen (nicht unter die Zoom-Knöpfe). */
    function clampLabel(x: number, y: number, w: number, h = 22): [number, number] {
      const r = plot.rect;
      let cx = Math.max(r.x + 6 + w / 2, Math.min(r.x + r.w - 6 - w / 2, x));
      const cy = Math.max(r.y + h / 2 + 4, Math.min(r.y + r.h - h / 2 - 4, y));
      if (cx + w / 2 > r.x + r.w - 52 && cy < r.y + 128) cx = r.x + r.w - 52 - w / 2;
      return [cx, cy];
    }

    function stroke(pts: Pt[], color: string, width: number, opts: { dash?: number[]; glow?: boolean; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const g = surface.g;
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      if (opts.glow) {
        g.shadowColor = th().dark ? mixColor(color, '#000000', 0, 0.6) : mixColor(color, '#ffffff', 0, 0.4);
        g.shadowBlur = th().dark ? 10 : 7;
      }
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
    }

    function arrowHead(x: number, y: number, ang: number, color: string, size = 9): void {
      const g = surface.g;
      g.save();
      g.fillStyle = color;
      g.translate(x, y);
      g.rotate(ang);
      g.beginPath();
      g.moveTo(size * 0.5, 0);
      g.lineTo(-size * 0.6, -size * 0.55);
      g.lineTo(-size * 0.3, 0);
      g.lineTo(-size * 0.6, size * 0.55);
      g.closePath();
      g.fill();
      g.restore();
    }

    function dot(x: number, y: number, color: string, r: number, hollow = false): void {
      if (r <= 0.2) return;
      const g = surface.g;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      g.fillStyle = hollow ? th().bg : color;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = hollow ? color : th().bg;
      g.lineWidth = hollow ? 2.2 : 1.6;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
    }

    const inside = (x: number, y: number, m = 0) => {
      const r = plot.rect;
      return x > r.x + m && x < r.x + r.w - m && y > r.y + m && y < r.y + r.h - m;
    };

    /** Graph (beide Äste) zeichnen; verbindet die Äste im Ursprung, wenn dort keine Polstelle ist. */
    function drawGraph(m: Morph, now: number, color: string, width: number, reveal: number, opts: { alpha?: number; glow?: boolean; dash?: number[] } = {}): { left: Pt[]; right: Pt[] } {
      const f = shownF(now, m);
      const left = branch(f, -1, reveal);
      const right = branch(f, 1, reveal);
      const pole = weightWhere(m, now, (n) => n < 0) > 1e-4;
      if (!pole && left.length && right.length) stroke([...left.slice().reverse(), ...right], color, width, opts);
      else {
        stroke(left, color, width, opts);
        stroke(right, color, width, opts);
      }
      // n = 0: Lücke bei x = 0 (0⁰ wird nicht betrachtet)
      const w0 = weightWhere(m, now, (n) => n === 0);
      if (w0 > 0.5 && reveal > 0.05) {
        const g = surface.g;
        g.save();
        g.globalAlpha = (opts.alpha ?? 1) * clamp01((w0 - 0.5) / 0.4);
        dot(plot.px(0), plot.py(A.v), color, 4.5, true);
        g.restore();
      }
      return { left, right };
    }

    /* ---------- Szene ---------- */

    interface K {
      graph: number;
      labels: number;
      pts: number;
      cards: number;
      stagger: number;
    }

    function drawAsymptotes(m: Morph, now: number, k: K): void {
      if (!p.asym) return;
      const wn = weightWhere(m, now, (n) => n < 0);
      if (wn < 0.01) return;
      const g = surface.g;
      const r = plot.rect;
      const ox = Math.round(plot.px(0)) + 0.5;
      const oy = Math.round(plot.py(0)) + 0.5;
      const col = mixColor(morphColor(m, now), th().text, 0.15);
      const a = wn * k.labels;
      g.save();
      g.globalAlpha = 0.9 * a;
      g.strokeStyle = col;
      g.lineWidth = 2.2;
      g.setLineDash([8, 6]);
      g.beginPath();
      if (ox > r.x && ox < r.x + r.w) {
        g.moveTo(ox, oy - (oy - r.y) * k.labels);
        g.lineTo(ox, oy + (r.y + r.h - oy) * k.labels);
      }
      if (oy > r.y && oy < r.y + r.h) {
        g.moveTo(ox - (ox - r.x) * k.labels, oy);
        g.lineTo(ox + (r.x + r.w - ox) * k.labels, oy);
      }
      g.stroke();
      g.restore();
      const size = textSize() - 0.5;
      if (ox > r.x + 60 && ox < r.x + r.w - 60) label(ox - 8, r.y + 20, 'x = 0', col, 'right', size, a);
      if (oy > r.y + 150 && oy < r.y + r.h - 20) {
        // waagrechte Asymptote: rechts, auf der Seite ohne Ast
        const below = A.v > 0;
        label(r.x + r.w - 30, oy + (below ? 14 : -14), 'y = 0', col, 'right', size, a);
      }
    }

    function drawSingle(now: number, k: K): void {
      const c = C();
      const r = plot.rect;
      const size = textSize();
      const col = morphColor(MF, now);
      drawAsymptotes(MF, now, k);

      // Hilfe für a: von (1 | 0) senkrecht nach Q(1 | a)
      drawQGuide(now);

      // Symmetrie-Animation (unter dem Graphen beginnen, damit der Geist darüber liegt)
      const symK = sym ? symState(now) : null;
      const baseAlpha = symK ? 1 - 0.7 * symK.dim : 1;
      const { right } = drawGraph(MF, now, col, 3.4, k.graph, { glow: true, alpha: baseAlpha });
      if (sym && symK) drawSym(now, sym, symK, right, col);

      drawQ(k);
      drawCurveName(now, col, k);

      // Punkt P mit Punktprobe
      if (!sym && Math.abs(A.v) > 1e-3) {
        const f = shownF(now);
        const x = X.v;
        const y = f(x, x < 0 ? -1 : 1);
        const px = plot.px(x);
        const py = plot.py(y);
        if (Number.isFinite(py) && inside(px, py, 2)) {
          const g = surface.g;
          // Hilfslinien zu den Achsen
          g.save();
          g.globalAlpha = 0.6 * k.pts;
          g.strokeStyle = c.P;
          g.lineWidth = 1.4;
          g.setLineDash([4, 4]);
          g.beginPath();
          g.moveTo(px, py);
          g.lineTo(px, plot.py(0));
          g.moveTo(px, py);
          g.lineTo(plot.px(0), py);
          g.stroke();
          g.restore();
          dot(px, py, c.P, 6.5 * ease.outBack(k.pts));
          label(px + (x >= 0 ? 10 : -10), py + (y >= 0 ? -15 : 15), 'P', c.P, x >= 0 ? 'left' : 'right', size + 1, k.pts * k.labels);
        } else if (Number.isFinite(px) && Number.isFinite(py)) {
          const ex = Math.max(r.x + 16, Math.min(r.x + r.w - 16, px));
          const ey = Math.max(r.y + 16, Math.min(r.y + r.h - 16, py));
          const ang = Math.atan2(py - ey, px - ex);
          dot(ex, ey, c.P, 5.5 * k.pts);
          arrowHead(ex + Math.cos(ang) * 13, ey + Math.sin(ang) * 13, ang, c.P, 11);
        }
        // Rechnung
        if (p.info && k.pts > 0.5) {
          const n = MF.target;
          const a = Math.round(A.v * 10) / 10;
          const xr = Math.round(x * 10) / 10;
          const yv = power(a, n, xr);
          if (Number.isFinite(yv)) {
            const xb = xr < 0 ? `(${fmt.num(xr)})` : fmt.num(xr);
            const coef = a === 1 ? '' : a === -1 ? '−' : `${P1(a)} · `;
            const src = `P: f(${fmt.num(xr)}) = ${coef}${xb}^{${expTxt(n)}} ${approxEq(yv)} ${fmt.num(yv, 3)}`;
            // oben, wenn beide Enden des Graphen nach unten zeigen, sonst unten
            const down = shownF(now)(-2.2, -1) < 0 && shownF(now)(2.2) < 0;
            pill(r.x + (wide() ? (r.w - 50) / 2 : r.w / 2), down ? r.y + 26 : r.y + r.h - 26, src, { border: c.P, size: size - 0.5, maxW: r.w - 40, alpha: clamp01((k.pts - 0.5) * 2) });
          }
        }
      }
      if (sym && symK) drawSymCaption(now, sym, symK);
    }

    function drawQGuide(now: number): void {
      const g = surface.g;
      const qGuide = clamp01(1 - (now - lastQ - 900) / 500);
      if (qGuide <= 0) return;
      const c = C();
      const x1 = plot.px(1);
      const y0 = plot.py(0);
      const y1 = plot.py(A.v);
      g.save();
      g.globalAlpha = qGuide;
      g.strokeStyle = c.Q;
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(x1, y0);
      g.lineTo(x1, y1);
      g.stroke();
      g.restore();
      if (Math.abs(y1 - y0) > 10) arrowHead(x1, y1, y1 < y0 ? -Math.PI / 2 : Math.PI / 2, c.Q, 9);
      label(x1 + 9, (y0 + y1) / 2, `a = ${P1(A.v)}`, c.Q, 'left', textSize(), qGuide);
    }

    function drawQ(k: K): void {
      const c = C();
      const xq = plot.px(1);
      const yq = plot.py(A.v);
      if (!inside(xq, yq)) return;
      const g = surface.g;
      g.save();
      g.globalAlpha = k.pts;
      g.fillStyle = th().bg;
      g.strokeStyle = c.Q;
      g.lineWidth = 2.6;
      g.beginPath();
      g.arc(xq, yq, 5.5, 0, TAU);
      g.fill();
      g.stroke();
      g.restore();
      if (view() !== 'family') {
        const txt = hidden() ? 'Q(1 | a)' : `Q(1 | ${P1(A.v)})`;
        // nicht auf P legen: liegt P nahe bei Q, Beschriftung nach links
        const nearP = view() === 'single' && Math.abs(X.v - 1) < 0.45;
        label(xq + (nearP ? -10 : 10), yq + 15, txt, c.Q, nearP ? 'right' : 'left', textSize() - 1, k.labels * k.pts);
      }
    }

    function drawCurveName(now: number, col: string, k: K): void {
      if (k.graph < 0.95) return;
      const r = plot.rect;
      const f = shownF(now);
      // Stelle suchen, an der der Graph rechts noch sicher im Bild ist
      const { xMax } = plot.bounds;
      for (let i = 0; i < 60; i++) {
        const x = xMax - (30 + i * 6) / plot.scale.x;
        if (x <= 0.15) break;
        const y = f(x);
        const px = plot.px(x);
        const py = plot.py(y);
        if (!inside(px, py, 26)) continue;
        if (px > r.x + r.w - 56 && py < r.y + 132) continue;
        const up = A.v >= 0 ? -1 : 1;
        if (view() === 'single') {
          const xp = X.v;
          const pp: Pt = [plot.px(xp), plot.py(f(xp, xp < 0 ? -1 : 1))];
          if (Math.hypot(pp[0] - px, pp[1] - py - up * 17) < 34) continue;
        }
        label(px, py + up * 17, 'f', col, 'center', textSize() + 4, k.labels);
        return;
      }
    }

    /* ---------- Symmetrie ---------- */

    function symState(now: number): { show: number; move: number; dim: number; hold: number; fade: number } {
      const t = now - sym!.t0;
      const show = ease.outCubic(clamp01(t / SYM.show));
      const move = ease.inOutCubic(clamp01((t - SYM.show) / SYM.move));
      const hold = clamp01((t - SYM.show - SYM.move) / 300);
      const fade = 1 - clamp01((t - SYM.show - SYM.move - SYM.hold) / SYM.fade);
      return { show, move, dim: show * fade, hold, fade };
    }

    function symMap(s: SymAnim, e: number): (pt: Pt) => Pt {
      const ox = plot.px(0);
      const oy = plot.py(0);
      if (symmetry(s.n) === 'axis') {
        const c = Math.cos(Math.PI * e);
        return ([x, y]) => [ox + (x - ox) * c, y];
      }
      const ang = -Math.PI * e;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      return ([x, y]) => {
        const dx = x - ox;
        const dy = y - oy;
        return [ox + dx * ca - dy * sa, oy + dx * sa + dy * ca];
      };
    }

    function drawSym(now: number, s: SymAnim, k: ReturnType<typeof symState>, right: Pt[], col: string): void {
      const g = surface.g;
      const c = C();
      const ox = plot.px(0);
      const oy = plot.py(0);
      const r = plot.rect;
      const axis = symmetry(s.n) === 'axis';
      const a = k.show * k.fade;
      // Spiegelachse bzw. Drehzentrum
      g.save();
      g.globalAlpha = a;
      if (axis) {
        g.strokeStyle = c.sym;
        g.lineWidth = 3;
        g.shadowColor = mixColor(c.sym, th().bg, 0, 0.6);
        g.shadowBlur = 10;
        g.beginPath();
        g.moveTo(ox, r.y);
        g.lineTo(ox, r.y + r.h);
        g.stroke();
      } else {
        const pulse = 1 + 0.25 * Math.sin((now - s.t0) / 160);
        g.fillStyle = mixColor(c.sym, th().bg, 0, 0.25);
        g.beginPath();
        g.arc(ox, oy, 16 * pulse, 0, TAU);
        g.fill();
        g.fillStyle = c.sym;
        g.beginPath();
        g.arc(ox, oy, 5, 0, TAU);
        g.fill();
        // Drehpfeil
        if (k.move > 0.01) {
          g.strokeStyle = c.sym;
          g.lineWidth = 2.6;
          g.beginPath();
          g.arc(ox, oy, 30, 0, -Math.PI * k.move, true);
          g.stroke();
          const ang = -Math.PI * k.move;
          arrowHead(ox + 30 * Math.cos(ang), oy + 30 * Math.sin(ang), ang - Math.PI / 2, c.sym, 11);
        }
      }
      g.restore();

      // Echos (Zwischenstellungen) und der bewegte Teil
      const map = symMap(s, k.move);
      for (const e of [0.25, 0.5, 0.75]) {
        if (k.move < e) continue;
        const mm = symMap(s, e);
        stroke(right.map(mm), col, 2, { alpha: 0.18 * a, dash: [3, 6] });
      }
      stroke(right.map(map), c.sym, 4, { glow: true, alpha: a });

      // Punktpaar P und P'
      const y0 = power(A.v, s.n, s.x0);
      const P: Pt = [plot.px(s.x0), plot.py(y0)];
      const P2 = map(P);
      const size = textSize();
      if (Number.isFinite(P[1])) {
        if (k.hold > 0) {
          const Pm: Pt = [plot.px(-s.x0), plot.py(power(A.v, s.n, -s.x0))];
          g.save();
          g.globalAlpha = k.hold * k.fade;
          g.strokeStyle = c.sym;
          g.lineWidth = 1.8;
          g.setLineDash([5, 5]);
          g.beginPath();
          g.moveTo(P[0], P[1]);
          g.lineTo(Pm[0], Pm[1]);
          g.stroke();
          g.setLineDash([]);
          // gleiche Abstände markieren
          const mx = axis ? ox : ox;
          const my = axis ? P[1] : oy;
          for (const q of [P, Pm]) {
            const hx = (q[0] + mx) / 2;
            const hy = (q[1] + my) / 2;
            const ang = Math.atan2(q[1] - my, q[0] - mx) + Math.PI / 2;
            g.beginPath();
            g.moveTo(hx - Math.cos(ang) * 6, hy - Math.sin(ang) * 6);
            g.lineTo(hx + Math.cos(ang) * 6, hy + Math.sin(ang) * 6);
            g.stroke();
          }
          if (axis) {
            g.strokeRect(ox, P[1] - (P[1] > oy ? 0 : 0) - 9, 9, 9);
          }
          g.restore();
        }
        g.save();
        g.globalAlpha = a;
        dot(P[0], P[1], c.P, 6);
        dot(P2[0], P2[1], c.sym, 6);
        g.restore();
        const xs = fmt.num(s.x0);
        label(P[0] + 10, P[1] + (y0 >= 0 ? -15 : 15), `P(${xs} | ${N(y0)})`, c.P, 'left', size - 0.5, a);
        if (k.hold > 0) {
          const ym = power(A.v, s.n, -s.x0);
          label(P2[0] - 10, P2[1] + (ym >= 0 ? -15 : 15), `P'(${fmt.num(-s.x0)} | ${N(ym)})`, c.sym, 'right', size - 0.5, k.hold * k.fade);
        }
      }
    }

    function drawSymCaption(now: number, s: SymAnim, k: ReturnType<typeof symState>): void {
      const r = plot.rect;
      const axis = symmetry(s.n) === 'axis';
      const size = textSize() + 0.5;
      const maxW = r.w - (wide() ? 110 : 30);
      const cx = r.x + (wide() ? (r.w - 50) / 2 : r.w / 2);
      const y = r.y + 26 + (1 - k.show) * -10;
      const t = now - s.t0;
      let src: string;
      if (t < SYM.show + SYM.move) src = axis ? tt('Gerades n: rechten Teil an der y-Achse spiegeln', 'Even n: reflect the right part in the y-axis') : tt('Ungerades n: rechten Teil um 180° um O drehen', 'Odd n: rotate the right part through 180° about O');
      else {
        const x = fmt.num(s.x0);
        const y0 = power(A.v, s.n, s.x0);
        src = axis ? `f(−x) = f(x),  f(−${x}) = f(${x}) ${approxEq(y0)} ${N(y0)}` : `f(−x) = −f(x),  f(−${x}) = −f(${x}) ${approxEq(y0)} ${N(-y0)}`;
      }
      pill(cx, y, src, { border: C().sym, size, alpha: k.show * k.fade, maxW });
    }

    /* ---------- Familie ---------- */

    function familyMembers(n: number): number[] {
      return EXPONENTS.filter((k) => isEven(k) === isEven(n));
    }

    function drawFamily(now: number, k: K): void {
      const size = textSize();
      const n = p.n;
      const members = familyMembers(n);
      const g = surface.g;
      // blasse Familienmitglieder (feste Kurven ohne Übergang)
      for (const mn of members) {
        if (mn === MF.target) continue;
        const ms = new Morph(mn);
        drawGraph(ms, now, nColor(mn), 2, k.graph, { alpha: 0.38 * viewFade });
      }
      drawAsymptotes(MF, now, k);
      drawQGuide(now);
      const symK = sym ? symState(now) : null;
      const col = morphColor(MF, now);
      const { right } = drawGraph(MF, now, col, 3.6, k.graph, { glow: true, alpha: symK ? 1 - 0.7 * symK.dim : 1 });
      if (sym && symK) drawSym(now, sym, symK, right, col);

      // gemeinsame Punkte
      const a = A.v;
      const cps = commonPoints(a, MF.target);
      const kp = ease.outBack(clamp01(k.pts));
      cps.forEach(([x, y], i) => {
        const px = plot.px(x);
        const py = plot.py(y);
        if (!inside(px, py)) return;
        const pop = ease.outBack(clamp01(k.pts * 1.6 - i * 0.25));
        g.save();
        g.globalAlpha = 0.25 * pop;
        g.fillStyle = th().text;
        g.beginPath();
        g.arc(px, py, 13 * pop, 0, TAU);
        g.fill();
        g.restore();
        dot(px, py, th().text, 5.5 * pop);
        if (sym) return;
        const txt = hidden() ? '?' : fmt.point(x, y);
        const right = x >= 0;
        // (0 | 0) unterhalb rechts, die anderen außen neben dem Punkt
        const dy = x === 0 ? (a >= 0 ? 17 : -17) : y >= 0 ? 16 : -16;
        label(right ? px + 12 : px - 12, py + dy, txt, th().text, right ? 'left' : 'right', size - 0.5, k.labels * kp);
      });
      drawQ(k);
      drawCurveName(now, col, k);
      if (sym && symK) drawSymCaption(now, sym, symK);
    }

    /* ---------- Vergleich ---------- */

    function drawCompare(now: number, k: K): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const size = textSize();
      const f = shownF(now, MF);
      const gf = shownF(now, MG);
      // Fläche zwischen den Graphen, gefärbt nach dem oberen Graphen
      const { xMin, xMax } = plot.bounds;
      const steps = Math.ceil(r.w / 2);
      const clampY = (y: number) => Math.max(r.y - 20, Math.min(r.y + r.h + 20, plot.py(y)));
      for (const which of [1, -1]) {
        g.save();
        g.globalAlpha = (th().dark ? 0.2 : 0.13) * k.graph;
        g.fillStyle = which > 0 ? c.f : c.g;
        g.beginPath();
        for (let i = 0; i < steps; i++) {
          const x0 = xMin + ((xMax - xMin) * i) / steps;
          const x1 = xMin + ((xMax - xMin) * (i + 1)) / steps;
          if (x0 < 0 && x1 > 0) continue;
          const xm = (x0 + x1) / 2;
          const d = f(xm) - gf(xm);
          if (!(Math.sign(d) === which)) continue;
          const a0 = clampY(f(x0));
          const a1 = clampY(f(x1));
          const b0 = clampY(gf(x0));
          const b1 = clampY(gf(x1));
          if (![a0, a1, b0, b1].every(Number.isFinite)) continue;
          const p0 = plot.px(x0);
          const p1 = plot.px(x1) + 0.6;
          g.moveTo(p0, a0);
          g.lineTo(p1, a1);
          g.lineTo(p1, b1);
          g.lineTo(p0, b0);
          g.closePath();
        }
        g.fill();
        g.restore();
      }
      drawAsymptotes(MF.target < 0 ? MF : MG, now, k);
      drawQGuide(now);
      drawGraph(MG, now, c.g, 3.2, k.graph, { glow: true });
      drawGraph(MF, now, c.f, 3.2, k.graph, { glow: true });

      // Schnittpunkte
      const xs = intersections(p.a, p.n, p.m) ?? [];
      const morphing = MF.busy(now) || MG.busy(now);
      xs.forEach((x, i) => {
        const y = power(A.v, p.n, x);
        const px = plot.px(x);
        const py = plot.py(y);
        if (!inside(px, py) || morphing) return;
        const pop = ease.outBack(clamp01(k.pts * 1.6 - i * 0.25));
        dot(px, py, c.cut, 6 * pop);
        const txt = hidden() ? '?' : fmt.point(x, y);
        const right = x >= 0;
        label(px + (right ? 11 : -11), py + (x === 0 ? 17 : A.v >= 0 ? -16 : 16), txt, c.cut, right ? 'left' : 'right', size - 0.5, k.labels * pop);
      });

      // Namen
      labelEnds(now, k);
      drawQ(k);

      // Durchfahren
      if (sweep) {
        const t = clamp01((now - sweep.t0) / sweep.dur);
        const x = lerp(sweep.from, sweep.to, ease.inOutCubic(t));
        const fade = Math.min(clamp01(t * 8), 1 - clamp01((t - 0.94) / 0.06));
        const px = plot.px(x);
        g.save();
        g.globalAlpha = 0.7 * fade;
        g.strokeStyle = th().text;
        g.lineWidth = 1.6;
        g.setLineDash([6, 5]);
        g.beginPath();
        g.moveTo(px, r.y);
        g.lineTo(px, r.y + r.h);
        g.stroke();
        g.restore();
        const fy = power(A.v, p.n, x);
        const gy = power(A.v, p.m, x);
        g.save();
        g.globalAlpha = fade;
        if (Number.isFinite(fy) && inside(px, plot.py(fy))) dot(px, plot.py(fy), c.f, 6);
        if (Number.isFinite(gy) && inside(px, plot.py(gy))) dot(px, plot.py(gy), c.g, 6);
        g.restore();
        const s = compareAt(A.v, p.n, p.m, x);
        const rel = s > 0 ? '>' : s < 0 ? '<' : '=';
        const fv = Number.isFinite(fy) ? N(fy) : ND;
        const gv = Number.isFinite(gy) ? N(gy) : ND;
        const src = Number.isNaN(s) ? `x = ${fmt.num(x, 2)}:  \\c{f}{f(x) = ${fv}},  \\c{g}{g(x) = ${gv}}` : `x = ${fmt.num(x, 2)}:  \\c{f}{f(x) = ${fv}}  ${rel}  \\c{g}{g(x) = ${gv}}`;
        const box = formula(g, src, { ...fstyle(size, th().text, 700), palette: { f: c.f, g: c.g } });
        const bw = Math.min(box.w, r.w - 40);
        const [cx] = clampLabel(r.x + r.w / 2, r.y + r.h - 26, bw + 18);
        drawPalettePill(cx, r.y + r.h - 26, src, size, fade);
      }
    }

    function drawPalettePill(x: number, y: number, src: string, size: number, alpha: number): void {
      const g = surface.g;
      const c = C();
      const box = formula(g, src, { ...fstyle(size, th().text, 700), palette: { f: c.f, g: c.g } });
      const left = x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      g.save();
      g.globalAlpha = alpha;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      roundRect(g, left - 9, base - box.asc - 6, box.w + 18, box.asc + box.desc + 12, 11);
      g.fill();
      g.restore();
      box.draw(g, left, base);
      g.restore();
    }

    /** Namen f und g an den rechten Enden der Graphen (ohne Überlappung). */
    function labelEnds(now: number, k: K): void {
      if (k.graph < 0.95) return;
      const r = plot.rect;
      const c = C();
      const { xMax } = plot.bounds;
      const placed: Rect[] = [];
      const items: [Morph, string, string][] = [
        [MF, 'f', c.f],
        [MG, 'g', c.g],
      ];
      for (const [m, name, col] of items) {
        const f = shownF(now, m);
        for (let i = 0; i < 80; i++) {
          const x = xMax - (30 + i * 6) / plot.scale.x;
          if (x <= 0.15) break;
          const px = plot.px(x);
          const py = plot.py(f(x)) + (A.v >= 0 ? -18 : 18);
          if (!inside(px, py, 22)) continue;
          if (px > r.x + r.w - 56 && py < r.y + 132) continue;
          if (placed.some((q) => Math.abs(q.x - px) < 30 && Math.abs(q.y - py) < 26)) continue;
          label(px, py, name, col, 'center', textSize() + 4, k.labels);
          placed.push({ x: px, y: py, w: 0, h: 0 });
          break;
        }
      }
    }

    /* ---------- Karten ---------- */

    function cardFrame(r: Rect, alpha: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.97)';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      g.restore();
    }

    /** Geschütztes Leerzeichen: kleine Formelteile nicht umbrechen. */
    const nb = (s: string) => s.replace(/ /g, ' ');
    const LAB = 'lab';

    interface InfoItem {
      label?: string;
      value: string;
      swatch?: string;
      muted?: boolean;
    }
    interface InfoLine {
      src: string;
      item: number;
      first: boolean;
      swatch?: string;
      muted?: boolean;
    }

    /** Werte für x → ±∞ und nahe 0 (Kartenfassung). */
    function infValue(a: number, n: number): string {
      const l = limits(a, n);
      if (l.negInf === l.posInf) return nb(`f(x) → ${limTxt(l.posInf)}`);
      return `${nb(`x → −∞: f(x) → ${limTxt(l.negInf)}`)}, ${nb(`x → +∞: f(x) → ${limTxt(l.posInf)}`)}`;
    }
    function zeroValue(a: number, n: number): string {
      const l = limits(a, n);
      if (n === 0) return tt(`f(x) = ${fmt.num(a)}, aber ${nb('0 ∉ D')}`, `f(x) = ${fmt.num(a)}, but ${nb('0 ∉ D')}`);
      if (n > 0) return tt(`${nb('f(x) → 0')}, Graph durch O`, `${nb('f(x) → 0')}, graph through O`);
      if (l.zeroLeft === l.zeroRight) return tt(`${nb(`f(x) → ${limTxt(l.zeroRight)}`)} (Polstelle)`, `${nb(`f(x) → ${limTxt(l.zeroRight)}`)} (pole)`);
      return tt(`links ${nb(`→ ${limTxt(l.zeroLeft)}`)}, rechts ${nb(`→ ${limTxt(l.zeroRight)}`)} (Polstelle)`, `${nb(`→ ${limTxt(l.zeroLeft)}`)} from the left, ${nb(`→ ${limTxt(l.zeroRight)}`)} from the right (pole)`);
    }

    function infoData(): { title: string; chip: string | null; chipColor: string; head: string; headColor: string; items: InfoItem[] } {
      const a = Math.round(p.a * 10) / 10;
      const n = p.n;
      const items: InfoItem[] = [];
      if (view() === 'compare') {
        const c = C();
        const short = (k: number, name: string) => termSrc(a, k, name).split(' = ').slice(0, 2).join(' = ');
        const head = hidden() ? 'f(x) = a · x^{n},  g(x) = a · x^{m}' : `\\c{f}{${short(n, 'f')}},  \\c{g}{${short(p.m, 'g')}}`;
        const xs = intersections(a, n, p.m);
        if (!xs) items.push({ value: a === 0 ? tt('a = 0: beide Graphen liegen auf der x-Achse', 'a = 0: both graphs lie on the x-axis') : tt('n = m: Die Graphen sind gleich.', 'n = m: the graphs are identical.'), muted: true });
        else {
          items.push({ label: tt('Schnittpunkte', 'Intersections'), value: hidden() ? '?' : xs.map((x) => nb(fmt.point(x, power(a, n, x)))).join('  '), swatch: c.cut });
          for (const line of compareLines(a, n, p.m)) {
            const [range0, rel] = line.split(': ');
            items.push({ label: nb(range0!), value: hidden() ? '?' : nb(rel!) });
          }
        }
        return { title: tt('Vergleich', 'Comparison'), chip: null, chipColor: c.f, head, headColor: th().text, items };
      }
      const col = nColor(n);
      const head = hidden() ? 'f(x) = a · x^{n}' : termSrc(a, n);
      if (a === 0) {
        items.push({ value: tt('a = 0: Nullfunktion, keine Potenzfunktion', 'a = 0: zero function, not a power function'), muted: true });
        return { title: tt('Steckbrief', 'Key features'), chip: null, chipColor: col, head, headColor: col, items };
      }
      const D = Q(domain(n) === 'R' ? R : nb(`${R} \\ {0}`));
      const W = Q(nb(rangeSrc(range(a, n), a)));
      items.push({ value: `${nb(`D = ${D}`)}     ${nb(`W = ${W}`)}` });
      items.push({ label: tt('Symmetrie', 'Symmetry'), value: Q(symTxt(n)), swatch: C().sym });
      items.push({ label: tt('Monotonie', 'Monotonicity'), value: Q(monoTxt(a, n)) });
      items.push({ label: nb('x → ±∞'), value: Q(infValue(a, n)) });
      items.push({ label: tt('Nahe 0', 'Near 0'), value: Q(zeroValue(a, n)) });
      if (n < 0) items.push({ label: tt('Asymptoten', 'Asymptotes'), value: Q(nb('x = 0') + ', ' + nb('y = 0')), swatch: mixColor(col, th().text, 0.15) });
      return { title: tt('Steckbrief', 'Key features'), chip: hidden() ? null : kindTxt(n), chipColor: col, head, headColor: col, items };
    }

    const infoStyle = (size: number, color: string, weight = 600): FormulaStyle => ({ ...fstyle(size, color, weight), palette: { [LAB]: th().muted, f: C().f, g: C().g } });

    /** Einträge mit Bezeichnung in Zeilen umbrechen (Folgezeilen eingerückt). */
    function wrapItems(items: InfoItem[], maxW: number, size: number): InfoLine[] {
      const g = surface.g;
      const out: InfoLine[] = [];
      items.forEach((it, idx) => {
        const sw = it.swatch ? 15 : 0;
        const words = it.value.split(' ');
        let line = it.label ? `\\c{${LAB}}{${it.label}:}` : '';
        let hasWord = false;
        let first = true;
        const avail = () => maxW - sw - (first ? 0 : 12);
        for (const w of words) {
          const cand = line ? `${line} ${w}` : w;
          if (hasWord && formula(g, cand, infoStyle(size, th().text)).w > avail()) {
            out.push({ src: line, item: idx, first, swatch: first ? it.swatch : undefined, muted: it.muted });
            first = false;
            line = w;
          } else line = cand;
          hasWord = true;
        }
        out.push({ src: line, item: idx, first, swatch: first ? it.swatch : undefined, muted: it.muted });
      });
      return out;
    }

    function headBox(src: string, maxW: number, size: number, color: string): FormulaBox {
      const g = surface.g;
      let hs = size + 4;
      let hb = formula(g, src, infoStyle(hs, color, 700));
      while (hb.w > maxW && hs > 10.5) {
        hs -= 0.5;
        hb = formula(g, src, infoStyle(hs, color, 700));
      }
      return hb;
    }

    const infoPad = () => (wide() ? 13 : 10);

    function infoLayout(w: number, size: number): { data: ReturnType<typeof infoData>; lines: InfoLine[]; hb: FormulaBox; height: number; lh: number; gap: number } {
      const pad = infoPad();
      const data = infoData();
      const lines = wrapItems(data.items, w - 2 * pad, size);
      const hb = headBox(data.head, w - 2 * pad, size, data.headColor);
      const lh = size * 1.4;
      const gap = size * 0.4;
      const items = new Set(lines.map((l) => l.item)).size;
      const height = pad * 2 + size + 10 + hb.asc + hb.desc + 8 + lines.length * lh + Math.max(0, items - 1) * gap;
      return { data, lines, hb, height, lh, gap };
    }

    function drawInfo(r: Rect, size: number, alpha: number, stagger: number, now: number): void {
      const g = surface.g;
      const pad = infoPad();
      const { data, lines, hb, lh, gap } = infoLayout(r.w, size);
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const title = formula(g, data.title, fstyle(size - 1, th().muted, 700));
      title.draw(g, r.x + pad, r.y + pad + title.asc);
      const change = clamp01((now - cardT0) / 420);
      // Klassen-Chip rechts oben
      if (data.chip) {
        const cb = fit(data.chip, r.w - 2 * pad - title.w - 30, size - 1.5, data.chipColor, 700);
        const cw = cb.w + 24;
        const cx = r.x + r.w - pad - cw;
        const cy = r.y + pad - 3;
        const ch = title.asc + title.desc + 6;
        g.save();
        g.globalAlpha = alpha * (0.4 + 0.6 * change);
        g.fillStyle = mixColor(data.chipColor, th().bg, 0, th().dark ? 0.22 : 0.12);
        roundRect(g, cx, cy, cw, ch, 9);
        g.fill();
        g.fillStyle = data.chipColor;
        g.beginPath();
        g.arc(cx + 9, cy + ch / 2, 3.5, 0, TAU);
        g.fill();
        cb.draw(g, cx + 17, cy + ch / 2 + (cb.asc - cb.desc) / 2);
        g.restore();
      }
      let y = r.y + pad + title.asc + title.desc + 10 + hb.asc;
      g.save();
      g.globalAlpha = alpha * (0.35 + 0.65 * ease.outCubic(change));
      hb.draw(g, r.x + pad + (1 - ease.outCubic(change)) * 6, y);
      g.restore();
      y += hb.desc + 8;
      // Zeilen gleichmäßig verteilen, wenn Platz ist
      const items = new Set(lines.map((l) => l.item)).size;
      const spare = r.y + r.h - pad - y - (lines.length * lh + Math.max(0, items - 1) * gap);
      const extra = spare > 0 ? Math.min(size * 0.5, spare / Math.max(1, items)) : 0;
      let lastItem = -1;
      lines.forEach((ln) => {
        if (ln.item !== lastItem && lastItem >= 0) y += gap + extra;
        lastItem = ln.item;
        const cy = y + lh / 2;
        const aa = clamp01(stagger * (items + 2) - ln.item) * clamp01(change * 2.2 - ln.item * 0.12);
        g.save();
        g.globalAlpha = alpha * (0.25 + 0.75 * ease.outCubic(aa));
        const off = (1 - ease.outCubic(aa)) * 8;
        const sw = data.items[ln.item]!.swatch ? 15 : 0;
        if (ln.swatch) {
          g.fillStyle = ln.swatch;
          roundRect(g, r.x + pad + off, cy - 4.5, 9, 9, 2.5);
          g.fill();
        }
        const box = formula(g, ln.src, infoStyle(size, ln.muted ? th().muted : th().text));
        box.draw(g, r.x + pad + sw + (ln.first ? 0 : 12) + off, cy + (box.asc - box.desc) / 2);
        g.restore();
        y += lh;
      });
      g.restore();
    }

    function infoHeight(size: number, w: number): number {
      return infoLayout(w, size).height;
    }


    /* ----- Wertetabelle bzw. Familien-Karte ----- */

    interface Chip {
      n: number;
      r: Rect;
    }
    let chips: Chip[] = [];

    /** Waagrechte Tabelle auf dem Handy und bei flacher Bühne (Tablet). */
    const tableHorizontal = () => {
      if (!wide() || view() === 'family') return !wide();
      const col = regions().col;
      const s = textSize() + 0.5;
      return infoHeight(s, col.w) + 10 + 26 + s * 1.4 + 8 * s * 1.35 + 12 > col.h;
    };
    function tableXs(r: Rect, size: number, horizontal: boolean): number[] {
      if (horizontal) return (r.w - 20 - 44) / 7 >= size * 3.1 ? TABLE_X7 : TABLE_X5;
      const head = 26 + size * 1.4;
      return (r.h - head) / 8 >= size * 1.45 ? TABLE_X7 : TABLE_X5;
    }

    function cellValue(m: Morph, now: number, x: number, target: number): string {
      if (x === 0 && target <= 0) return ND;
      const v = shownF(now, m)(x, x < 0 ? -1 : 1);
      if (!Number.isFinite(v)) return ND;
      return Q(N(Math.round(v * 1000) / 1000));
    }

    function drawTable(r: Rect, size: number, alpha: number, now: number): void {
      const g = surface.g;
      const pad = wide() ? 13 : 10;
      const c = C();
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const cmp = view() === 'compare';
      const titleSrc = tt('Wertetabelle', 'Table of values');
      const tb = fit(titleSrc, r.w - 2 * pad, size, th().text, 800);
      tb.draw(g, r.x + pad, r.y + pad + tb.asc);
      const top = r.y + pad + tb.asc + tb.desc + 10;
      const inner = r.w - 2 * pad;
      const horizontal = tableHorizontal();
      const xs = tableXs({ ...r, h: r.h }, size, horizontal);
      const fName = 'f(x)';
      const cols: { name: string; m: Morph; target: number; color: string }[] = [{ name: fName, m: MF, target: p.n, color: cmp ? c.f : nColor(p.n) }];
      if (cmp) cols.push({ name: 'g(x)', m: MG, target: p.m, color: c.g });
      const curX = view() === 'single' ? Math.round(p.x * 10) / 10 : null;
      if (horizontal) {
        const rowsN = cols.length + 1;
        const lh = Math.min(size * 2, (r.y + r.h - pad - top) / rowsN);
        const headW = 44;
        const cw = (inner - headW) / xs.length;
        const rowLabel = (s: string, i: number, color: string) => {
          const bx = fit(s, headW - 6, size - 0.5, color, 700);
          bx.draw(g, r.x + pad, top + lh * i + lh / 2 + (bx.asc - bx.desc) / 2);
        };
        rowLabel('x', 0, th().muted);
        cols.forEach((cl, j) => rowLabel(cl.name, j + 1, cl.color));
        g.strokeStyle = th().dark ? '#2c3648' : '#e3e8ef';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(r.x + pad, Math.round(top + lh) + 0.5);
        g.lineTo(r.x + r.w - pad, Math.round(top + lh) + 0.5);
        g.moveTo(Math.round(r.x + pad + headW - 4) + 0.5, top + 2);
        g.lineTo(Math.round(r.x + pad + headW - 4) + 0.5, top + lh * rowsN - 2);
        g.stroke();
        xs.forEach((x, i) => {
          const cx = r.x + pad + headW + cw * i + cw / 2;
          if (curX !== null && Math.abs(curX - x) < 1e-9) {
            g.fillStyle = mixColor(c.P, th().bg, 0, th().dark ? 0.2 : 0.13);
            roundRect(g, cx - cw / 2 + 1, top + 2, cw - 2, lh * rowsN - 4, 7);
            g.fill();
          }
          const bx = fit(fmt.num(x), cw - 4, size, th().text, 700);
          bx.draw(g, cx - bx.w / 2, top + lh / 2 + (bx.asc - bx.desc) / 2);
          const vals = cols.map((cl) => shownF(now, cl.m)(x, x < 0 ? -1 : 1));
          cols.forEach((cl, j) => {
            const s = cellValue(cl.m, now, x, cl.target);
            const big = cmp && Number.isFinite(vals[0]!) && Number.isFinite(vals[1]!) && Math.abs(vals[j]! - vals[1 - j]!) > 1e-6 && vals[j]! > vals[1 - j]!;
            const bv = fit(s, cw - 4, size - 0.5, s === ND ? th().muted : cmp ? cl.color : th().text, big ? 800 : 600);
            bv.draw(g, cx - bv.w / 2, top + lh * (j + 1) + lh / 2 + (bv.asc - bv.desc) / 2);
          });
        });
      } else {
        const rowsN = xs.length + 1;
        const lh = Math.min(size * 1.9, Math.max(size * 1.3, (r.y + r.h - pad - top) / rowsN));
        const colX = cmp ? [r.x + pad + inner * 0.26, r.x + pad + inner * 0.63, r.x + pad + inner] : [r.x + pad + inner * 0.36, r.x + pad + inner];
        const colW = cmp ? [inner * 0.26, inner * 0.37, inner * 0.37] : [inner * 0.36, inner * 0.64];
        const head = ['x', ...cols.map((cl) => cl.name)];
        head.forEach((hd, j) => {
          const box = fit(hd, colW[j]! - 6, size - 0.5, j === 0 ? th().muted : cols[j - 1]!.color, 700);
          box.draw(g, colX[j]! - box.w, top + lh / 2 + (box.asc - box.desc) / 2);
        });
        g.strokeStyle = th().dark ? '#2c3648' : '#e3e8ef';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(r.x + pad, Math.round(top + lh) + 0.5);
        g.lineTo(r.x + r.w - pad, Math.round(top + lh) + 0.5);
        g.stroke();
        xs.forEach((x, i) => {
          const yy = top + lh * (i + 1);
          if (curX !== null && Math.abs(curX - x) < 1e-9) {
            g.fillStyle = mixColor(c.P, th().bg, 0, th().dark ? 0.2 : 0.13);
            roundRect(g, r.x + pad - 5, yy + 2, inner + 10, lh - 4, 7);
            g.fill();
          }
          const bx = fit(fmt.num(x), colW[0]! - 6, size, th().text, 700);
          bx.draw(g, colX[0]! - bx.w, yy + lh / 2 + (bx.asc - bx.desc) / 2);
          const vals = cols.map((cl) => shownF(now, cl.m)(x, x < 0 ? -1 : 1));
          cols.forEach((cl, j) => {
            const s = cellValue(cl.m, now, x, cl.target);
            const big = cmp && Number.isFinite(vals[0]!) && Number.isFinite(vals[1]!) && Math.abs(vals[j]! - vals[1 - j]!) > 1e-6 && vals[j]! > vals[1 - j]!;
            const bv = fit(s, colW[j + 1]! - 6, size, s === ND ? th().muted : cmp ? cl.color : th().text, big ? 800 : 600);
            bv.draw(g, colX[j + 1]! - bv.w, yy + lh / 2 + (bv.asc - bv.desc) / 2);
          });
        });
      }
      g.restore();
    }

    function drawFamilyCard(r: Rect, size: number, alpha: number): void {
      const g = surface.g;
      const pad = wide() ? 13 : 10;
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const n = p.n;
      const even = isEven(n);
      const tb = fit(even ? tt('Familie: gerade Exponenten', 'Family: even exponents') : tt('Familie: ungerade Exponenten', 'Family: odd exponents'), r.w - 2 * pad, size, th().text, 800);
      tb.draw(g, r.x + pad, r.y + pad + tb.asc);
      let y = r.y + pad + tb.asc + tb.desc + 10;
      // Chips der Familienmitglieder (antippbar)
      chips = [];
      const members = familyMembers(n);
      const chipH = size * 2;
      const gap = 6;
      const cw = (r.w - 2 * pad - gap * (members.length - 1)) / members.length;
      members.forEach((mn, i) => {
        const cx = r.x + pad + i * (cw + gap);
        const cur = mn === n;
        const col = nColor(mn);
        g.save();
        g.fillStyle = mixColor(col, th().bg, 0, cur ? (th().dark ? 0.32 : 0.2) : th().dark ? 0.12 : 0.07);
        roundRect(g, cx, y, cw, chipH, 9);
        g.fill();
        if (cur) {
          g.strokeStyle = col;
          g.lineWidth = 2;
          roundRect(g, cx + 1, y + 1, cw - 2, chipH - 2, 8);
          g.stroke();
        }
        const bx = fit(xPow(mn), cw - 6, size + 1, col, cur ? 800 : 700);
        bx.draw(g, cx + cw / 2 - bx.w / 2, y + chipH / 2 + (bx.asc - bx.desc) / 2);
        g.restore();
        chips.push({ n: mn, r: { x: cx, y, w: cw, h: chipH } });
      });
      y += chipH + 12;
      // Erklärung der gemeinsamen Punkte
      const a = Math.round(A.goal * 10) / 10;
      const aS = P1(a);
      const lines: { f: string; color: string }[] = [];
      lines.push({ f: tt(`Alle durch ${fmt.point(1, a)}, denn 1^{n} = 1`, `All pass through ${fmt.point(1, a)}, since 1^{n} = 1`), color: th().text });
      if (even) lines.push({ f: tt(`Alle durch ${fmt.point(-1, a)}: (−1)^{n} = 1`, `All pass through ${fmt.point(-1, a)}: (−1)^{n} = 1`), color: th().text });
      else lines.push({ f: tt(`Alle durch ${fmt.point(-1, -a)}: (−1)^{n} = −1`, `All pass through ${fmt.point(-1, -a)}: (−1)^{n} = −1`), color: th().text });
      lines.push({ f: tt('Für n > 0 durch (0 | 0): 0^{n} = 0', 'For n > 0 through (0 | 0): 0^{n} = 0'), color: th().text });
      lines.push({ f: tt('Für n ≤ 0 ist 0 nicht in D.', 'For n ≤ 0, 0 is not in D.'), color: th().muted });
      if (Math.abs(a) !== 1) lines.push({ f: tt(`Streckfaktor a = ${aS}: alle Werte · ${aS}`, `Stretch factor a = ${aS}: all values · ${aS}`), color: th().muted });
      const lh = Math.min(size * 1.9, Math.max(size * 1.4, (r.y + r.h - pad - y) / lines.length));
      lines.forEach((ln, i) => {
        const bx = fit(hidden() && i < 3 ? '?' : ln.f, r.w - 2 * pad - 14, size - 0.5, ln.color, 600);
        const cy = y + lh * i + lh / 2;
        if (i < 3) {
          g.fillStyle = th().text;
          g.beginPath();
          g.arc(r.x + pad + 4, cy, 3.2, 0, TAU);
          g.fill();
        }
        bx.draw(g, r.x + pad + 14, cy + (bx.asc - bx.desc) / 2);
      });
      g.restore();
    }

    surface.addTarget({
      contains: (px, py) => view() === 'family' && chips.some((c) => px >= c.r.x && px <= c.r.x + c.r.w && py >= c.r.y && py <= c.r.y + c.r.h),
      pointerDown: (pt) => {
        if (ctx.locked) return false;
        const hit = chips.find((c) => pt.px >= c.r.x && pt.px <= c.r.x + c.r.w && pt.py >= c.r.y && pt.py <= c.r.y + c.r.h);
        if (!hit) return false;
        stopTour();
        ctx.set({ n: hit.n });
        return true;
      },
      pointerMove: () => {},
      pointerUp: () => {},
      hover: (pt) => {
        const on = !!pt && !ctx.locked && chips.some((c) => pt.px >= c.r.x && pt.px <= c.r.x + c.r.w && pt.py >= c.r.y && pt.py <= c.r.y + c.r.h);
        surface.setCursor(on ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Bild ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      anim = A.step(now, dt) || anim;
      anim = X.step(now, dt) || anim;
      if (MF.busy(now) || MG.busy(now)) anim = true;
      if (sym) {
        if (now - sym.t0 >= SYM_END) sym = null;
        else anim = true;
      }
      if (sweep) {
        if (now - sweep.t0 >= sweep.dur) sweep = null;
        else anim = true;
      }
      if (now - cardT0 < 600) anim = true;
      viewFade = reduced() ? 1 : ease.outCubic(clamp01((now - viewT0) / 600));
      if (viewFade < 1) anim = true;
      if (now - lastQ < 1500) anim = true;

      let k: K & { cards: number } = { graph: 1, labels: 1, pts: 1, cards: 1, stagger: 1 };
      if (intro !== null) {
        const t = now - intro;
        if (t > 2100) intro = null;
        else {
          anim = true;
          k = {
            graph: ease.inOutCubic(clamp01((t - 150) / 1200)),
            labels: ease.outCubic(clamp01((t - 700) / 700)),
            pts: clamp01((t - 1100) / 600),
            cards: ease.outCubic(clamp01((t - 200) / 700)),
            stagger: clamp01((t - 450) / 1300),
          };
        }
      }
      if (viewFade < 1) k = { ...k, graph: Math.min(k.graph, viewFade), pts: Math.min(k.pts, viewFade), labels: Math.min(k.labels, viewFade) };

      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      plot.begin();
      if (p.grid) plot.grid();
      plot.axes();
      const v = view();
      if (v === 'single') drawSingle(now, k);
      else if (v === 'family') drawFamily(now, k);
      else drawCompare(now, k);
      plot.end();

      // Karten
      const col = regions().col;
      const gap = 10;
      let size = textSize() + 0.5;
      const horizontal = tableHorizontal();
      const tableNeed = (s: number) => (v === 'family' ? 26 + s * 2 + 12 + 5 * s * 1.5 + 12 : horizontal ? 26 + s * 1.4 + (v === 'compare' ? 3 : 2) * s * 1.8 + 14 : 26 + s * 1.4 + 8 * s * 1.35 + 12);
      while (size > 11 && infoHeight(size, col.w) + gap + tableNeed(size) > col.h) size -= 0.5;
      const ih = horizontal && v !== 'family' ? col.h - gap - tableNeed(size) : Math.min(col.h - gap - tableNeed(size), Math.max(infoHeight(size, col.w), (col.h - gap) * 0.5));
      const slide = (1 - k.cards) * 14;
      const ca = k.cards;
      drawInfo({ x: col.x + slide, y: col.y, w: col.w, h: ih }, size, ca, k.stagger, now);
      const tr: Rect = { x: col.x + slide, y: col.y + ih + gap, w: col.w, h: col.h - ih - gap };
      if (v === 'family') drawFamilyCard(tr, size, ca);
      else {
        chips = [];
        drawTable(tr, size, ca, now);
      }
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge bei Änderungen ---------- */

    function stopTour(): void {
      if (tourTimer) clearTimeout(tourTimer);
      tourTimer = null;
      syncActions();
    }

    function tourStep(next: number): void {
      tourTimer = null;
      if (next > N_MAX) {
        syncActions();
        return;
      }
      ctx.set({ n: next });
      tourTimer = setTimeout(() => tourStep(next + 1), 1500);
      syncActions();
    }

    /** Stelle für das Punktpaar der Symmetrie-Animation: |f(x₀)| etwa 1,6 und gut sichtbar. */
    function symX0(n: number): number {
      if (view() === 'single') {
        const x = Math.abs(fixX(p.x, n));
        const y = Math.abs(power(p.a, n, x));
        const b = plot.bounds;
        if (x >= 0.3 && y < (b.yMax - b.yMin) * 0.4) return Math.round(x * 10) / 10;
      }
      if (n === 0) return 1.5;
      const x = (1.6 / Math.max(0.1, Math.abs(p.a))) ** (1 / n);
      return Math.round(Math.max(0.4, Math.min(2.4, x)) * 10) / 10;
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = reduced() || source === 'init';
        const user = source === 'input' || source === 'replace';
        if (user && (changed.has('n') || changed.has('view') || changed.has('m'))) stopTour();
        if (user && ['n', 'a', 'view', 'm', 'x'].some((key) => changed.has(key))) {
          sym = null;
          sweep = null;
        }
        if (changed.has('n')) {
          const prevN = MF.target;
          if (instant) MF.jump(p.n);
          else MF.go(p.n, tourTimer ? 1000 : source === 'replace' ? 900 : 700, now);
          cardT0 = instant ? -Infinity : now;
          if (p.n <= 0 && Math.abs(p.x) < 0.05 && source === 'input') ctx.set({ x: 0.1 });
          // Familie wechselt (gerade ↔ ungerade): neu einblenden
          if (view() === 'family' && !instant && isEven(p.n) !== isEven(prevN)) viewT0 = now;
        }
        if (changed.has('m')) {
          if (instant) MG.jump(p.m);
          else MG.go(p.m, 700, now);
          cardT0 = instant ? -Infinity : now;
        }
        if (changed.has('a')) {
          if (instant) A.jump(p.a);
          else if (source === 'replace') A.glide(p.a, 750, 100, now);
          else A.follow(p.a, dragging() ? 0.05 : 0.2);
        }
        if (changed.has('x') || changed.has('n')) {
          const xv = fixX(p.x, p.n);
          if (instant) X.jump(xv);
          else if (source === 'replace') X.glide(xv, 750, 150, now);
          else X.follow(xv, dragging() ? 0.04 : 0.2);
        }
        if (changed.has('view') && source !== 'init') {
          viewT0 = now;
          cardT0 = now;
        }
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'sym') {
          if (p.a === 0) return;
          stopTour();
          if (reduced()) {
            sym = { t0: now - SYM.show - SYM.move, n: p.n, x0: symX0(p.n) };
          } else sym = { t0: now, n: p.n, x0: symX0(p.n) };
        } else if (id === 'tour') {
          if (tourTimer) stopTour();
          else {
            sym = null;
            tourStep(N_MIN);
          }
        } else if (id === 'sweep') {
          if (p.a === 0 || p.n === p.m) return;
          const b = plot.bounds;
          sweep = { t0: now, from: b.xMin + 0.1, to: b.xMax - 0.1, dur: reduced() ? 1 : 7000 };
        }
        ctx.requestRender();
      },

      render,
      resetView: () => plot.resetView(),
      destroy: () => {
        if (tourTimer) clearTimeout(tourTimer);
        surface.destroy();
      },
    };
  },
});
