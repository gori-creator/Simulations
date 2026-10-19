import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { avoidOne, B_MAX, B_MIN, bracket, changeOfBase, flipAcrossDiagonal, log, pow, powerLaw, productLaw, quotientLaw } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type View = 'inverse' | 'laws' | 'solve';
type Law = 'prod' | 'quot' | 'pow';
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
    if (this.tw && this.goal === goal) return;
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

/** Zeitplan der Spiegelung an y = x (ms). */
const MIR = { show: 550, move: 1900, hold: 2600, fade: 700 };
const MIR_END = MIR.show + MIR.move + MIR.hold + MIR.fade;
/** Zeitplan „Lösung zeigen“ (ms). */
const SOL = { line: 900, drop: 650, pop: 500 };
const TABLE_XS = [-2, -1, 0, 1, 2, 3];
/** Basen zum Antippen. */
const CHIPS: { id: string; b: number | 'e' }[] = [
  { id: '2', b: 2 },
  { id: 'e', b: 'e' },
  { id: '10', b: 10 },
  { id: '0.5', b: 0.5 },
];

/**
 * Logarithmus als Umkehrung des Potenzierens: log_b(y) = x ⇔ bˣ = y.
 * Drei Ansichten: „Umkehrung“ (Graphen von bˣ und log_b x mit animierter
 * Spiegelung an y = x, ziehbarer Punkt P mit gespiegeltem Partner P'),
 * „Rechengesetze“ (Produkt-, Quotienten- und Potenzregel als aneinandergelegte
 * Pfeile auf einer logarithmischen Skala – die Idee des Rechenschiebers) und
 * „Gleichung lösen“ (bˣ = c grafisch ablesen, eingrenzen und mit dem
 * Basiswechsel lg c / lg b berechnen).
 */
export default defineSimulation({
  id: 'logarithmus',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  groups: [
    { id: 'base', label: L('Basis', 'Base') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'inverse', label: L('Umkehrung des Potenzierens', 'Inverse of exponentiation') },
        { value: 'laws', label: L('Rechengesetze', 'Laws of logarithms') },
        { value: 'solve', label: L('Exponentialgleichung lösen', 'Solving an exponential equation') },
      ],
      default: 'inverse',
    },
    {
      key: 'b',
      type: 'number',
      group: 'base',
      label: L('Basis b', 'Base b'),
      help: L('b > 0 und b ≠ 1. Für b < 1 sind beide Graphen fallend. Auch am Punkt B(1 | b) ziehen oder unter „Basis“ im Bild antippen.', 'b > 0 and b ≠ 1. For b < 1 both graphs are decreasing. You can also drag the point B(1 | b) or tap a base in the picture.'),
      min: B_MIN,
      max: B_MAX,
      step: 0.05,
      default: 2,
      visibleIf: (v) => !v.e,
    },
    {
      key: 'e',
      type: 'boolean',
      group: 'base',
      label: L('Basis e ≈ 2,718 (natürlicher Logarithmus ln)', 'Base e ≈ 2.718 (natural logarithm ln)'),
      default: false,
    },
    {
      key: 'x',
      type: 'number',
      label: L('Hochzahl x des Punktes P', 'Exponent x of the point P'),
      help: L('P(x | bˣ) liegt auf dem Graphen von bˣ, sein Spiegelbild P\'(bˣ | x) auf dem Graphen von log_b. Auch direkt an P oder P\' ziehen.', 'P(x | bˣ) lies on the graph of bˣ, its mirror image P\'(bˣ | x) on the graph of log_b. You can also drag P or P\' directly.'),
      min: -4,
      max: 4,
      step: 0.1,
      default: 2,
      visibleIf: (v) => v.view === 'inverse',
    },
    {
      key: 'law',
      type: 'choice',
      label: L('Rechengesetz', 'Law'),
      options: [
        { value: 'prod', label: L('Produktregel', 'Product rule') },
        { value: 'quot', label: L('Quotientenregel', 'Quotient rule') },
        { value: 'pow', label: L('Potenzregel', 'Power rule') },
      ],
      default: 'prod',
      visibleIf: (v) => v.view === 'laws',
    },
    {
      key: 'u',
      type: 'number',
      label: L('Zahl u', 'Number u'),
      help: L('Auch am Ende des blauen Pfeils ziehen.', 'You can also drag the end of the blue arrow.'),
      min: 0.1,
      max: 100,
      step: 0.1,
      default: 4,
      visibleIf: (v) => v.view === 'laws',
    },
    {
      key: 'v',
      type: 'number',
      label: L('Zahl v', 'Number v'),
      help: L('Auch am Ende des lila Pfeils ziehen.', 'You can also drag the end of the purple arrow.'),
      min: 0.1,
      max: 100,
      step: 0.1,
      default: 8,
      visibleIf: (v) => v.view === 'laws' && v.law !== 'pow',
    },
    {
      key: 'r',
      type: 'number',
      label: L('Hochzahl r', 'Exponent r'),
      min: -3,
      max: 4,
      step: 0.5,
      default: 3,
      visibleIf: (v) => v.view === 'laws' && v.law === 'pow',
    },
    {
      key: 'c',
      type: 'number',
      label: L('Rechte Seite c der Gleichung bˣ = c', 'Right-hand side c of bˣ = c'),
      help: L('c > 0; für c ≤ 0 gibt es keine Lösung, denn bˣ ist immer positiv. Auch am Schnittpunkt S ziehen.', 'c > 0; for c ≤ 0 there is no solution because bˣ is always positive. You can also drag the intersection point S.'),
      min: 0.01,
      max: 1000,
      step: 0.01,
      default: 10,
      visibleIf: (v) => v.view === 'solve',
    },
    { key: 'info', type: 'boolean', group: 'view', label: L('Ergebnisse im Bild', 'Results in the picture'), help: L('Aus: Logarithmen und Lösungen durch „?“ ersetzt (für Aufgaben).', 'Off: logarithms and solutions replaced by “?” (for tasks).'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'mirror', label: L('An y = x spiegeln', 'Reflect in y = x'), primary: true, visibleIf: (v) => v.view === 'inverse' },
    { id: 'build', label: L('Pfeile aneinanderlegen', 'Put the arrows together'), primary: true, visibleIf: (v) => v.view === 'laws' },
    { id: 'solve', label: L('Lösung zeigen', 'Show solution'), primary: true, visibleIf: (v) => v.view === 'solve' },
  ],
  readouts: [
    { key: 'def', label: L('Kernfrage', 'Key question') },
    { key: 'props', label: L('Logarithmusfunktion', 'Logarithmic function'), spoiler: true },
    { key: 'law', label: L('Rechengesetz', 'Law') },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'eq', label: L('Gleichung', 'Equation') },
    { key: 'sol', label: L('Lösung', 'Solution'), spoiler: true },
    { key: 'check', label: L('Probe', 'Check'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('log₂ als Umkehrung von 2ˣ', 'log₂ as the inverse of 2ˣ'), values: {} },
    { id: 'half', label: L('Basis 0,5: beide Graphen fallend', 'Base 0.5: both graphs decreasing'), values: { b: 0.5, x: -2 } },
    { id: 'ln', label: L('Natürlicher Logarithmus ln', 'Natural logarithm ln'), values: { e: true, x: 1 } },
    { id: 'prod', label: L('Produktregel: lg 20 + lg 50 = lg 1000', 'Product rule: lg 20 + lg 50 = lg 1000'), values: { view: 'laws', b: 10, u: 20, v: 50 } },
    { id: 'solve2', label: L('Gleichung 2ˣ = 10', 'Equation 2ˣ = 10'), values: { view: 'solve', c: 10 } },
    { id: 'solve3', label: L('Gleichung 3ˣ = 50', 'Equation 3ˣ = 50'), values: { view: 'solve', b: 3, c: 50 } },
  ],
  strings: {
    de: { canvas: 'Koordinatensystem mit den Graphen von y = bˣ und y = log_b x, die an der Geraden y = x gespiegelt sind, daneben ein Steckbrief und eine Wertetabelle. Weitere Ansichten: Rechengesetze als Pfeile auf einer logarithmischen Skala und das grafische und rechnerische Lösen der Gleichung bˣ = c.' },
    en: { canvas: 'Coordinate system with the graphs of y = bˣ and y = log_b x, reflected in the line y = x, next to it key features and a table of values. Further views: the laws of logarithms as arrows on a logarithmic scale, and solving the equation bˣ = c graphically and by calculation.' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const reduced = () => prefersReducedMotion();
    const editable = () => !ctx.locked;
    const view = () => p.view as View;
    const law = () => p.law as Law;
    const R = '\\t{ℝ}';

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { exp: s[0]!, log: s[1]!, P: s[3]!, B: s[5]!, a1: s[0]!, a2: s[4]!, res: s[2]!, c: s[3]!, x: s[2]!, diag: mixColor(th().muted, th().text, 0.25) };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)');

    /* ---------- Aufteilung ---------- */

    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wide()) {
        const ph = Math.round(h * 0.5);
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 4, y: ph + 8, w: w - 8, h: h - ph - 12 } };
      }
      const colW = Math.round(Math.min(340, Math.max(236, w * 0.33)));
      return { plot: { x: 0, y: 0, w: w - colW - 6, h }, col: { x: w - colW, y: 6, w: colW - 6, h: h - 12 } };
    }
    const textSize = () => {
      const w = surface.width;
      return !wide() ? 12.5 : w < 700 ? 12 : w < 900 ? 12.5 : 13.5;
    };

    const plot = new Plot(surface, {
      x: [-3.3, 7.3],
      y: [-3.3, 7.3],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().plot,
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });

    /* ---------- Zustand ---------- */

    const baseOf = () => (p.e ? Math.E : p.b);
    /** Die Basis wird im Logarithmus gemischt (ln b), so verläuft der Übergang gleichmäßig. */
    const LB = new Chan(Math.log(baseOf()));
    const bNow = () => Math.exp(LB.v);
    const X = new Chan(p.x);
    const U = new Chan(Math.log(p.u));
    const V = new Chan(Math.log(p.v));
    const RR = new Chan(p.r);
    const Cc = new Chan(Math.log(p.c));
    // Bildausschnitt (Kamera) des Koordinatensystems
    const FX0 = new Chan(-3.3);
    const FX1 = new Chan(7.3);
    const FY0 = new Chan(-3.3);
    const FY1 = new Chan(7.3);
    // Bereich der logarithmischen Skala (Rechengesetze)
    const S0 = new Chan(-1);
    const S1 = new Chan(6);
    let frameReady = false;
    let rulerReady = false;
    let mir: number | null = null;
    let build: number | null = null;
    let sol: number | null = null;
    let intro: number | null = reduced() ? null : performance.now();
    let viewT0 = -Infinity;
    let cardT0 = -Infinity;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let lastB = -Infinity;
    let prevB = p.b;
    const grab = () => {
      lastDrag = performance.now();
    };
    const dragging = () => performance.now() - lastDrag < 350;

    /* ---------- Zahlen und Formeltexte ---------- */

    const hidden = () => !p.info;
    const Q = (s: string) => (hidden() ? '?' : s);
    /** Gerundet mit d Nachkommastellen; „=“ oder „≈“ je nachdem, ob gerundet wurde. */
    const exactTo = (v: number, d: number) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-7;
    const eqs = (v: number, d: number) => (exactTo(v, d) ? '=' : '≈');
    const rnd = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;
    /** Logarithmen: bis zu 4 Nachkommastellen. */
    const N4 = (v: number) => fmt.num(rnd(v, 4) + 0, 4);
    /** Werte wie bˣ: etwa 4 gültige Ziffern. */
    function NV(v: number): string {
      const a = Math.abs(v);
      if (a === 0) return '0';
      const d = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 0.1 ? 3 : Math.min(6, 2 - Math.floor(Math.log10(a)) + 1);
      return fmt.num(rnd(v, d) + 0, d);
    }
    const dV = (v: number) => {
      const a = Math.abs(v);
      return a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 0.1 ? 3 : Math.min(6, 2 - Math.floor(Math.log10(a || 1)) + 1);
    };
    const eqV = (v: number) => eqs(v, dV(v));
    /** Basis im Bild: während des Übergangs die mitlaufende Zahl, sonst e bzw. der Reglerwert. */
    const settled = () => Math.abs(bNow() - baseOf()) < 1e-6 * baseOf();
    const bNum = () => (settled() ? fmt.num(p.b) : fmt.num(rnd(bNow(), 2)));
    const bTxt = () => (p.e && settled() ? '\\t{e}' : bNum());
    /** Name des Logarithmus: ln, log₁₀ oder log_b. */
    const logName = () => (p.e && settled() ? 'ln' : `log_{${bNum()}}`);
    /** Potenz b^x als Formel; Basis mit Komma wird nicht geklammert (wie im Schulbuch: 0,5ˣ). */
    const powSrc = (xs: string) => `${bTxt()}^{${xs}}`;
    const num = (v: number) => fmt.num(v);
    /** Zahl in einer Formel: negative Zahlen in Klammern, wenn sie als Faktor stehen. */
    const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

    /* ---------- Ergebnisse (Text) ---------- */

    function updateReadouts(): void {
      for (const k of ['def', 'props', 'law', 'calc', 'eq', 'sol', 'check']) ctx.readout(k, null);
      const b = baseOf();
      const bH = p.e ? 'e' : fmt.num(p.b);
      const v = (s: string) => `<var>${s}</var>`;
      const lname = p.e ? 'ln' : `log<sub>${bH}</sub>`;
      const frac = (n: string, d: string) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
      if (view() === 'inverse') {
        const x = p.x;
        const y = pow(b, x);
        ctx.readout('def', { html: `${lname} ${v('y')} = ${v('x')} &nbsp;⇔&nbsp; ${bH}<sup>${v('x')}</sup> = ${v('y')}; &nbsp; P: ${bH}<sup>${num(x)}</sup> ${eqV(y)} ${NV(y)} &nbsp;⇔&nbsp; ${lname} ${NV(y)} ${eqs(log(b, rnd(y, dV(y))), 4)} ${num(x)}` });
        const pt = p.e ? (de ? '(e | 1)' : '(e, 1)') : fmt.point(b, 1);
        ctx.readout('props', { html: `${v('D')} = ℝ<sup>+</sup>, ${v('W')} = ℝ, ${tt('Nullstelle', 'zero')} ${v('x')} = 1, ${tt('Punkt', 'point')} ${pt}, ${tt('Asymptote', 'asymptote')} ${v('x')} = 0, ${b > 1 ? tt('streng monoton steigend', 'strictly increasing') : tt('streng monoton fallend', 'strictly decreasing')}` });
        return;
      }
      if (view() === 'laws') {
        const u = p.u;
        const w = p.v;
        if (law() === 'prod') {
          const r = productLaw(b, u, w);
          ctx.readout('law', { html: `${lname}(${v('u')} · ${v('v')}) = ${lname} ${v('u')} + ${lname} ${v('v')}` });
          ctx.readout('calc', { html: `${lname}(${num(u)} · ${num(w)}) = ${lname} ${num(u)} + ${lname} ${num(w)} ${eqs(r.lu, 4)} ${N4(r.lu)} + ${N4(r.lv)} ${eqs(r.sum, 4)} ${N4(r.sum)} = ${lname} ${NV(r.value)}` });
        } else if (law() === 'quot') {
          const r = quotientLaw(b, u, w);
          ctx.readout('law', { html: `${lname} ${frac(v('u'), v('v'))} = ${lname} ${v('u')} − ${lname} ${v('v')}` });
          ctx.readout('calc', { html: `${lname} ${frac(num(u), num(w))} = ${lname} ${num(u)} − ${lname} ${num(w)} ${eqs(r.lu, 4)} ${N4(r.lu)} − ${N4(r.lv)} ${eqs(r.diff, 4)} ${N4(r.diff)} = ${lname} ${NV(r.value)}` });
        } else {
          const r = powerLaw(b, u, p.r);
          ctx.readout('law', { html: `${lname}(${v('u')}<sup>${v('r')}</sup>) = ${v('r')} · ${lname} ${v('u')}` });
          ctx.readout('calc', { html: `${lname}(${num(u)}<sup>${num(p.r)}</sup>) = ${par(num(p.r))} · ${lname} ${num(u)} ${eqs(r.lu, 4)} ${par(num(p.r))} · ${N4(r.lu)} ${eqs(r.prod, 4)} ${N4(r.prod)}` });
        }
        return;
      }
      const c = p.c;
      ctx.readout('eq', { html: `${bH}<sup>${v('x')}</sup> = ${num(c)}` });
      const x = log(b, c);
      const cb = changeOfBase(b, c);
      const lgTxt = (s: string) => `lg ${s}`;
      const solHtml = p.e
        ? `${v('x')} = ln ${num(c)} ${eqs(x, 4)} ${N4(x)}`
        : p.b === 10
          ? `${v('x')} = lg ${num(c)} ${eqs(x, 4)} ${N4(x)}`
          : `${v('x')} = ${lname} ${num(c)} = ${frac(lgTxt(num(c)), lgTxt(bH))} ${eqs(x, 4)} ${frac(N4(cb.num), N4(cb.den))} ${eqs(x, 4)} ${N4(x)}`;
      ctx.readout('sol', { html: solHtml });
      const back = pow(b, rnd(x, 4));
      ctx.readout('check', { html: `${bH}<sup>${N4(x)}</sup> ${eqV(back)} ${NV(back)}` });
    }

    function syncActions(): void {
      ctx.setAction('mirror', { enabled: !ctx.locked });
      ctx.setAction('build', { enabled: !ctx.locked });
      ctx.setAction('solve', { enabled: !ctx.locked });
    }

    /* ---------- Formeln ---------- */

    const palette = () => {
      const c = C();
      return { e: c.exp, l: c.log, p: c.P, a: c.a1, v: c.a2, r: c.res, c: c.c, x: c.x, m: th().muted, lab: th().muted, b: c.B };
    };
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fit(src: string, maxW: number, size: number, color: string, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
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
      if ((opts.alpha ?? 1) <= 0.01) return rr;
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

    /** Formel mit Halo direkt im Bild. */
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

    /** Breite einer Beschriftung (für das Einklemmen in den Bildrand). */
    const labelW = (src: string, size = textSize()) => formula(surface.g, src, fstyle(size, th().text, 700)).w + 8;

    /** Anker so verschieben, dass die Beschriftung ganz im Rechteck bleibt. */
    function clampAnchor(x: number, y: number, w: number, align: 'left' | 'center' | 'right', r: Rect, m = 6, h = 22): [number, number] {
      const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      const nl = clamp(left, r.x + m, r.x + r.w - m - w);
      const ny = clamp(y, r.y + h / 2 + m, r.y + r.h - h / 2 - m);
      return [x + (nl - left), ny];
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
      g.lineWidth = hollow ? 2.4 : 1.6;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
    }

    const inside = (x: number, y: number, m = 0) => {
      const r = plot.rect;
      return x > r.x + m && x < r.x + r.w - m && y > r.y + m && y < r.y + r.h - m;
    };

    /* ---------- Kurven ---------- */

    /** Punkte (t | bᵗ) für t von t0 bis t1, in Pixel; swap = true liefert die Spiegelkurve (bᵗ | t). */
    function curve(b: number, t0: number, t1: number, swap: boolean, map?: (pt: Pt) => Pt, n = 520): Pt[] {
      const r = plot.rect;
      const out: Pt[] = [];
      const lo = r.y - r.h * 2;
      const hi = r.y + r.h * 3;
      const loX = r.x - r.w * 2;
      const hiX = r.x + r.w * 3;
      for (let i = 0; i <= n; i++) {
        const t = t0 + ((t1 - t0) * i) / n;
        const y = b ** t;
        let w: Pt = swap ? [y, t] : [t, y];
        if (map) w = map(w);
        const px = plot.px(w[0]);
        const py = plot.py(w[1]);
        if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
        out.push([clamp(px, loX, hiX), clamp(py, lo, hi)]);
      }
      return out;
    }

    /** Parameterbereich, in dem (t | bᵗ) sichtbar sein kann. */
    function expSpan(): [number, number] {
      const { xMin, xMax } = plot.bounds;
      return [xMin - 0.2, xMax + 0.2];
    }
    function logSpan(): [number, number] {
      const { yMin, yMax } = plot.bounds;
      return [yMin - 0.2, yMax + 0.2];
    }

    /* ---------- Bildausschnitt ---------- */

    function inverseFrame(): [number, number, number, number] {
      const r = regions().plot;
      const s = Math.min(r.w / 10.6, r.h / 10.6);
      const hw = r.w / (2 * s);
      const hh = r.h / (2 * s);
      return [2 - hw, 2 + hw, 2 - hh, 2 + hh];
    }
    let solveTarget: [number, number, number, number] = [-1.5, 4.5, -1, 13];
    function solveFrame(): [number, number, number, number] {
      if (dragging()) return solveTarget;
      const b = baseOf();
      const c = p.c;
      const xs = log(b, c);
      // kleines c: Ausschnitt eng um die Lösung (sonst läge y = c auf der x-Achse)
      const small = c < 1.2;
      const lo = small ? Math.min(-0.4, xs - 1.3) : Math.min(-1.5, xs - 1.3);
      const hi = small ? Math.max(0.4, xs + 1.3) : Math.max(2.5, xs + 1.3);
      const top = small ? c * 1.9 : Math.max(c * 1.32, 2.4);
      const r = regions().plot;
      const bottom = -top * (34 / Math.max(120, r.h));
      // links Platz für die Zahlen an der y-Achse (in Pixeln gerechnet)
      const u = (hi - lo) / Math.max(120, r.w - 60);
      const left = Math.min(lo - 10 * u, -50 * u);
      solveTarget = [left, hi, bottom, top];
      return solveTarget;
    }
    function frameTarget(): [number, number, number, number] {
      return view() === 'solve' ? solveFrame() : inverseFrame();
    }
    function stepFrame(now: number, dt: number, instant: boolean): boolean {
      const [a, b, c, d] = frameTarget();
      const chans = [FX0, FX1, FY0, FY1];
      const goals = [a, b, c, d];
      if (instant || !frameReady) {
        chans.forEach((ch, i) => ch.jump(goals[i]!));
        frameReady = true;
      } else chans.forEach((ch, i) => ch.follow(goals[i]!, 0.28));
      let moving = false;
      for (const ch of chans) moving = ch.step(now, dt) || moving;
      plot.setRange([FX0.v, FX1.v], [FY0.v, FY1.v]);
      return moving;
    }

    /* ---------- Griffe ---------- */

    plot.addHandle({
      get: () => [X.v, bNow() ** X.v],
      set: (x) => {
        grab();
        ctx.set({ x: clamp(x, -4, 4) });
      },
      axis: 'x',
      enabled: () => editable() && view() === 'inverse' && mir === null,
      color: () => C().P,
    });
    plot.addHandle({
      get: () => [bNow() ** X.v, X.v],
      set: (_x, y) => {
        grab();
        ctx.set({ x: clamp(y, -4, 4) });
      },
      axis: 'y',
      enabled: () => editable() && view() === 'inverse' && mir === null,
      color: () => C().P,
    });
    function setBase(b: number): void {
      grab();
      lastB = performance.now();
      const nb = avoidOne(clamp(b, B_MIN, B_MAX), p.e ? Math.E : p.b);
      ctx.set({ e: false, b: nb });
    }
    plot.addHandle({
      get: () => [1, bNow()],
      set: (_x, y) => setBase(y),
      axis: 'y',
      enabled: () => editable() && view() === 'inverse' && mir === null,
      color: () => C().B,
    });
    plot.addHandle({
      get: () => [bNow(), 1],
      set: (x) => setBase(x),
      axis: 'x',
      enabled: () => editable() && view() === 'inverse' && mir === null,
      color: () => C().B,
    });
    plot.addHandle({
      get: () => {
        const c = Math.exp(Cc.v);
        return [log(bNow(), c), c];
      },
      set: (_x, y) => {
        grab();
        const top = plot.bounds.yMax;
        ctx.set({ c: clamp(y, 0.01, Math.min(1000, top)) });
      },
      axis: 'y',
      enabled: () => editable() && view() === 'solve',
      color: () => C().c,
    });

    /* ---------- Gemeinsame Teile des Koordinatensystems ---------- */

    interface K {
      graph: number;
      logG: number;
      labels: number;
      pts: number;
      cards: number;
      stagger: number;
    }

    /* ---------- Ansicht „Umkehrung“ ---------- */

    function mirState(now: number): { show: number; move: number; hold: number; fade: number } {
      const t = now - mir!;
      return {
        show: ease.outCubic(clamp01(t / MIR.show)),
        move: ease.inOutCubic(clamp01((t - MIR.show) / MIR.move)),
        hold: ease.outCubic(clamp01((t - MIR.show - MIR.move) / 500)),
        fade: 1 - clamp01((t - MIR.show - MIR.move - MIR.hold) / MIR.fade),
      };
    }

    function drawDiagonal(alpha: number, glow: number, b: number, phase: 'line' | 'label'): void {
      const g = surface.g;
      const c = C();
      const { xMin, xMax, yMin, yMax } = plot.bounds;
      const lo = Math.max(xMin, yMin);
      const hi = Math.min(xMax, yMax);
      if (hi <= lo) return;
      if (phase === 'label') {
        if (alpha > 0.95) {
          // Beschriftung am oberen Ende (b > 1) bzw. unten links (b < 1: oben rechts steht die Bildunterschrift)
          const t = b > 1 ? hi - 0.9 : lo + 0.7;
          const r = plot.rect;
          const [lx, ly] = clampAnchor(plot.px(t) + 8, plot.py(t) + 2, labelW('y = x'), 'left', r);
          tryLabel(lx, ly, 'y = x', c.diag, 'left', textSize(), Math.min(1, (alpha - 0.95) * 20));
        }
        return;
      }
      const a: Pt = [plot.px(lo), plot.py(lo)];
      const bb: Pt = [plot.px(lo + (hi - lo) * alpha), plot.py(lo + (hi - lo) * alpha)];
      g.save();
      if (glow > 0) {
        g.globalAlpha = 0.22 * glow;
        g.strokeStyle = th().series[3]!;
        g.lineWidth = 7;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(bb[0], bb[1]);
        g.stroke();
      }
      g.globalAlpha = 0.85;
      g.strokeStyle = c.diag;
      g.lineWidth = 1.8;
      g.setLineDash([7, 6]);
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(bb[0], bb[1]);
      g.stroke();
      g.restore();
    }

    function drawAsymptotes(b: number, k: K, phase: 'line' | 'label'): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const ox = Math.round(plot.px(0)) + 0.5;
      const oy = Math.round(plot.py(0)) + 0.5;
      if (phase === 'label') {
        const size = textSize() - 1;
        // „x = 0“ an der y-Achse auf der Seite ohne Graph, „y = 0“ unter den Achsenzahlen
        if (ox > r.x + 50 && ox < r.x + r.w - 50) tryLabel(ox - 8, b > 1 ? r.y + 22 : r.y + r.h - 16, 'x = 0', c.log, 'right', size, k.labels * k.logG);
        if (oy > r.y + 20 && oy < r.y + r.h - 40) {
          if (b > 1) tryLabel(r.x + 10, oy + 28, 'y = 0', c.exp, 'left', size, k.labels * k.graph);
          else tryLabel(r.x + r.w - 10, oy + 28, 'y = 0', c.exp, 'right', size, k.labels * k.graph);
        }
        return;
      }
      g.save();
      g.lineWidth = 2.2;
      g.setLineDash([8, 6]);
      // x = 0 ist Asymptote von log_b, y = 0 von bˣ
      if (ox > r.x && ox < r.x + r.w) {
        g.globalAlpha = 0.75 * k.logG;
        g.strokeStyle = c.log;
        g.beginPath();
        g.moveTo(ox, r.y);
        g.lineTo(ox, r.y + r.h);
        g.stroke();
      }
      if (oy > r.y && oy < r.y + r.h) {
        g.globalAlpha = 0.75 * k.graph;
        g.strokeStyle = c.exp;
        g.beginPath();
        g.moveTo(r.x, oy);
        g.lineTo(r.x + r.w, oy);
        g.stroke();
      }
      g.restore();
    }

    /** Kurvennamen: Stelle auf der Kurve nahe dem oberen Rand suchen, an der beide Namen frei stehen. */
    function drawNames(b: number, k: K): void {
      if (k.labels <= 0) return;
      const { yMax } = plot.bounds;
      const r = plot.rect;
      const c = C();
      const size = textSize() + 1.5;
      const up = b > 1;
      const eSrc = `y = ${powSrc('x')}`;
      const lSrc = `y = ${logName()} x`;
      const ea = up ? 'right' : 'left';
      for (let i = 0; i < 90; i++) {
        const y = yMax - (44 + i * 6) / plot.scale.y;
        if (y <= 0.3) break;
        const x = log(b, y);
        if (!Number.isFinite(x)) continue;
        const ex = plot.px(x);
        const ey = plot.py(y);
        const lx = plot.px(y);
        const ly = plot.py(x);
        if (!inside(ex, ey, 30) || !inside(lx, ly, 30)) continue;
        const [ax, ay] = clampAnchor(ex + (up ? -12 : 12), ey - 4, labelW(eSrc, size), ea, r);
        const [bx, by] = clampAnchor(lx + 8, ly + (up ? 18 : -18), labelW(lSrc, size), 'left', r);
        const ra = labelBox(ax, ay, eSrc, ea, size);
        const rb = labelBox(bx, by, lSrc, 'left', size);
        if (overlaps(ra, rb) || placed.some((q) => overlaps(q, ra) || overlaps(q, rb))) continue;
        tryLabel(ax, ay, eSrc, c.exp, ea, size, k.labels, true);
        tryLabel(bx, by, lSrc, c.log, 'left', size, k.labels * k.logG, true);
        return;
      }
    }

    /* Beschriftungen ohne Überlappung: belegte Rechtecke dieses Bildes */
    let placed: Rect[] = [];
    const overlaps = (a: Rect, q: Rect) => a.x < q.x + q.w && q.x < a.x + a.w && a.y < q.y + q.h && q.y < a.y + a.h;
    function labelBox(x: number, y: number, src: string, align: 'left' | 'center' | 'right', size: number): Rect {
      const box = formula(surface.g, src, fstyle(size, th().text, 700));
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      return { x: left - 4, y: base - box.asc - 2, w: box.w + 8, h: box.asc + box.desc + 4 };
    }
    /** Beschriftung nur zeichnen, wenn sie frei steht (oder erzwungen). */
    function tryLabel(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right', size: number, alpha: number, force = false): boolean {
      const rr = labelBox(x, y, src, align, size);
      if (!force && placed.some((q) => overlaps(q, rr))) return false;
      placed.push(rr);
      label(x, y, src, color, align, size, alpha);
      return true;
    }
    type Spot = 'UL' | 'UR' | 'DL' | 'DR' | 'L' | 'R';
    const SPOT: Record<Spot, [number, number, 'left' | 'right']> = {
      UL: [-11, -15, 'right'],
      UR: [11, -15, 'left'],
      DL: [-11, 16, 'right'],
      DR: [11, 16, 'left'],
      L: [-13, 0, 'right'],
      R: [13, 0, 'left'],
    };
    /** Beschriftung neben einem Punkt: die erste freie der Wunschstellen; sonst (force) die erste. */
    function labelNear(px: number, py: number, src: string, color: string, size: number, alpha: number, spots: Spot[], force = false): void {
      const r = plot.rect;
      for (const sp of spots) {
        const [dx, dy, al] = SPOT[sp];
        const [ax, ay] = clampAnchor(px + dx, py + dy, labelW(src, size), al, r);
        if (tryLabel(ax, ay, src, color, al, size, alpha)) return;
      }
      if (force) {
        const [dx, dy, al] = SPOT[spots[0]!];
        const [ax, ay] = clampAnchor(px + dx, py + dy, labelW(src, size), al, r);
        tryLabel(ax, ay, src, color, al, size, alpha, true);
      }
    }
    const dotBox = (x: number, y: number): Rect => ({ x: x - 7, y: y - 7, w: 14, h: 14 });

    function drawInverse(now: number, k: K): void {
      const c = C();
      const b = bNow();
      const size = textSize();
      const ms = mir !== null ? mirState(now) : null;
      const glow = ms ? ms.show * ms.fade : 0;
      const up = b > 1;
      placed = [];
      const cap = captionInfo(now, ms, b, k);
      if (cap) placed.push(cap.rect);

      drawDiagonal(k.labels, glow, b, 'line');
      drawAsymptotes(b, k, 'line');
      const [e0, e1] = expSpan();
      const [l0, l1] = logSpan();
      const logAlpha = ms ? 1 - 0.85 * ms.show * (1 - ms.hold) : 1;
      // Exponentialgraph
      stroke(curve(b, e0, e0 + (e1 - e0) * k.graph, false), c.exp, 3.4, { glow: true });
      // Logarithmusgraph (wächst nach dem Exponentialgraphen von unten herein)
      if (k.logG > 0) stroke(curve(b, l0, l0 + (l1 - l0) * k.logG, true), c.log, 3.4, { glow: true, alpha: logAlpha });
      // Spiegelung: eine Kopie des Exponentialgraphen klappt um y = x
      if (ms) drawMirror(ms, b);

      // Punkte (zuerst als Hindernisse für die Beschriftungen vormerken)
      const kp = ease.outBack(clamp01(k.pts));
      const Z1: Pt = [plot.px(0), plot.py(1)];
      const Z2: Pt = [plot.px(1), plot.py(0)];
      const Bp: Pt = [plot.px(1), plot.py(b)];
      const Bm: Pt = [plot.px(b), plot.py(1)];
      const xP = X.v;
      const yP = b ** xP;
      const P: Pt = [plot.px(xP), plot.py(yP)];
      const P2: Pt = [plot.px(yP), plot.py(xP)];
      const bq = Math.abs(b - 1) > 0.02;
      const pts: Pt[] = [Z1, Z2];
      if (bq) pts.push(Bp, Bm);
      if (!ms) pts.push(P, P2);
      for (const q of pts) if (inside(q[0], q[1])) placed.push(dotBox(q[0], q[1]));

      const showBguide = clamp01(1 - (now - lastB - 900) / 500);
      if (showBguide > 0) {
        const g = surface.g;
        g.save();
        g.globalAlpha = showBguide * 0.8;
        g.strokeStyle = c.B;
        g.lineWidth = 2;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(Bp[0], plot.py(0));
        g.lineTo(Bp[0], Bp[1]);
        g.moveTo(plot.px(0), Bm[1]);
        g.lineTo(Bm[0], Bm[1]);
        g.stroke();
        g.restore();
      }
      if (inside(Z1[0], Z1[1])) dot(Z1[0], Z1[1], c.exp, 5 * kp);
      if (inside(Z2[0], Z2[1])) dot(Z2[0], Z2[1], c.log, 5 * kp);
      if (bq && inside(Bp[0], Bp[1])) dot(Bp[0], Bp[1], c.B, 5.5 * kp, true);
      if (bq && inside(Bm[0], Bm[1])) dot(Bm[0], Bm[1], c.B, 5.5 * kp, true);
      if (!ms) drawPair(b, k, P, P2);

      // Beschriftungen nach Wichtigkeit
      const la = k.labels * k.pts;
      if (!ms) {
        const xs = num(rnd(xP, 1));
        const ys = NV(yP);
        if (inside(P[0], P[1], 2)) labelNear(P[0], P[1], hidden() ? 'P' : `P(${xs} | ${ys})`, c.P, size, la, up ? ['UL', 'DR', 'L', 'UR'] : ['UR', 'DL', 'R', 'UL'], true);
        if (inside(P2[0], P2[1], 2)) labelNear(P2[0], P2[1], hidden() ? "P'" : `P'(${ys} | ${xs})`, c.P, size, la, up ? ['DR', 'UL', 'R', 'DL'] : ['UR', 'DL', 'R', 'DR'], true);
      }
      const bLab = bTxt();
      if (bq && inside(Bp[0], Bp[1])) labelNear(Bp[0], Bp[1], `B(1 | ${bLab})`, c.B, size - 1, la, up ? ['UL', 'L', 'DR'] : ['UR', 'R', 'DL']);
      if (bq && inside(Bm[0], Bm[1])) labelNear(Bm[0], Bm[1], `B'(${bLab} | 1)`, c.B, size - 1, la, up ? ['DR', 'R', 'UL'] : ['UR', 'R', 'DL']);
      if (inside(Z1[0], Z1[1])) labelNear(Z1[0], Z1[1], '(0 | 1)', c.exp, size - 1, la, up ? ['UL', 'L', 'DL'] : ['DL', 'L', 'UR']);
      if (inside(Z2[0], Z2[1])) labelNear(Z2[0], Z2[1], '(1 | 0)', c.log, size - 1, la, up ? ['UL', 'DR', 'UR'] : ['DL', 'UR', 'DR']);
      drawNames(b, k);
      drawDiagonal(k.labels, glow, b, 'label');
      drawAsymptotes(b, k, 'label');
      if (cap) pill(cap.cx, cap.cy, cap.src, { border: cap.border, size: cap.size, alpha: cap.alpha, maxW: cap.maxW });
    }

    /** P(x | bˣ) und P'(bˣ | x) mit Lot auf y = x und gleichen Abständen. */
    function drawPair(b: number, k: K, P: Pt, P2: Pt): void {
      const g = surface.g;
      const c = C();
      const x = X.v;
      const y = b ** x;
      const okP = inside(P[0], P[1], 2);
      const okQ = inside(P2[0], P2[1], 2);
      const m = (x + y) / 2;
      const F: Pt = [plot.px(m), plot.py(m)];
      const a = k.pts;
      if (okP || okQ) {
        // Verbindung P–P' (senkrecht zu y = x) mit Lotfußpunkt
        g.save();
        g.globalAlpha = 0.75 * a;
        g.strokeStyle = c.P;
        g.lineWidth = 1.8;
        g.setLineDash([5, 5]);
        g.beginPath();
        g.moveTo(P[0], P[1]);
        g.lineTo(P2[0], P2[1]);
        g.stroke();
        g.setLineDash([]);
        const len = Math.hypot(P2[0] - P[0], P2[1] - P[1]);
        if (len > 30 && inside(F[0], F[1], 4)) {
          // rechter Winkel am Fußpunkt und gleich lange Hälften
          const ux = (P2[0] - P[0]) / len;
          const uy = (P2[1] - P[1]) / len;
          const vx = 1 / Math.SQRT2;
          const vy = -1 / Math.SQRT2; // Richtung von y = x in Pixeln
          const s = 8;
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(F[0] + ux * s, F[1] + uy * s);
          g.lineTo(F[0] + ux * s + vx * s, F[1] + uy * s + vy * s);
          g.lineTo(F[0] + vx * s, F[1] + vy * s);
          g.stroke();
          for (const q of [P, P2]) {
            const hx = (q[0] + F[0]) / 2;
            const hy = (q[1] + F[1]) / 2;
            g.beginPath();
            g.moveTo(hx - vx * 5, hy - vy * 5);
            g.lineTo(hx + vx * 5, hy + vy * 5);
            g.stroke();
          }
        }
        g.restore();
      }
      if (okP) dot(P[0], P[1], c.P, 6.5 * ease.outBack(a));
      else edgeArrow(P, c.P, a);
      if (okQ) dot(P2[0], P2[1], c.P, 6.5 * ease.outBack(a), true);
      else edgeArrow(P2, c.P, a);
    }

    /** Punkt außerhalb des Bildes: kleiner Pfeil am Rand in seine Richtung. */
    function edgeArrow(q: Pt, color: string, a: number): void {
      const r = plot.rect;
      if (!Number.isFinite(q[0]) || !Number.isFinite(q[1])) return;
      const ex = clamp(q[0], r.x + 16, r.x + r.w - 16);
      const ey = clamp(q[1], r.y + 16, r.y + r.h - 16);
      const ang = Math.atan2(q[1] - ey, q[0] - ex);
      const g = surface.g;
      g.save();
      g.globalAlpha = a;
      dot(ex, ey, color, 5);
      arrowHead(ex + Math.cos(ang) * 13, ey + Math.sin(ang) * 13, ang, color, 11);
      g.restore();
    }

    function drawMirror(ms: ReturnType<typeof mirState>, b: number): void {
      const g = surface.g;
      const c = C();
      const [e0, e1] = expSpan();
      const a = ms.show * ms.fade;
      const col = mixColor(c.exp, c.log, ms.move);
      const flip = (pt: Pt) => flipAcrossDiagonal(pt, ms.move);
      // Echos (Zwischenstellungen)
      for (const e of [0.25, 0.5, 0.75]) {
        if (ms.move < e) continue;
        stroke(curve(b, e0, e1, false, (pt) => flipAcrossDiagonal(pt, e), 260), mixColor(c.exp, c.log, e), 2, { alpha: 0.22 * a, dash: [3, 6] });
      }
      // Kopie wirkt beim Umklappen dünner (Blatt von der Kante gesehen)
      const edge = Math.abs(Math.cos(Math.PI * ms.move));
      stroke(curve(b, e0, e1, false, flip), col, 2.4 + 2 * edge, { glow: true, alpha: a * (1 - 0.75 * ms.hold) });
      // Musterpunkte wandern auf dem Lot zu y = x
      const r = plot.rect;
      for (const x0 of [-1, 0, 1, 2]) {
        const y0 = b ** x0;
        const A: Pt = [plot.px(x0), plot.py(y0)];
        const Bq: Pt = [plot.px(y0), plot.py(x0)];
        if (!inside(A[0], A[1], 4) || !inside(Bq[0], Bq[1], 4)) continue;
        const cur = flip([x0, y0]);
        const Cp: Pt = [plot.px(cur[0]), plot.py(cur[1])];
        g.save();
        g.globalAlpha = 0.8 * a;
        g.strokeStyle = th().series[3]!;
        g.lineWidth = 1.6;
        g.setLineDash([4, 5]);
        g.beginPath();
        g.moveTo(A[0], A[1]);
        g.lineTo(Cp[0], Cp[1]);
        g.stroke();
        g.restore();
        g.save();
        g.globalAlpha = a;
        dot(A[0], A[1], c.exp, 5);
        dot(Cp[0], Cp[1], col, 5.5);
        g.restore();
        if (ms.hold > 0 && x0 === 2 && Math.hypot(Bq[0] - A[0], Bq[1] - A[1]) > 40) {
          const yl = NV(y0);
          const up = b > 1;
          const [lx, ly] = clampAnchor(A[0] + (up ? -10 : 10), A[1] - 15, labelW(`(2 | ${yl})`), up ? 'right' : 'left', r);
          label(lx, ly, `(2 | ${yl})`, c.exp, up ? 'right' : 'left', textSize() - 1, ms.hold * ms.fade);
          const [mx, my] = clampAnchor(Bq[0] + 10, Bq[1] + (up ? 16 : -16), labelW(`(${yl} | 2)`), 'left', r);
          label(mx, my, `(${yl} | 2)`, c.log, 'left', textSize() - 1, ms.hold * ms.fade);
        }
      }
    }

    /**
     * Platz für die Bildunterschrift: Für b > 1 liegt rechts unten (x > 1, y < 0)
     * kein Graph, für b < 1 rechts oben (x > 1, y > 1) – nur die Gerade y = x.
     */
    function captionSpot(w: number, b: number): [number, number] {
      const r = plot.rect;
      const y = b > 1 ? r.y + r.h - 24 : r.y + 24;
      const left = Math.max(plot.px(1.15), r.x + 10);
      const free = r.x + r.w - 10 - left;
      if (w <= free) return [r.x + r.w - 10 - w / 2, y];
      return [r.x + r.w / 2, y];
    }

    function captionInfo(now: number, ms: ReturnType<typeof mirState> | null, b: number, k: K): { src: string; cx: number; cy: number; size: number; border: string; alpha: number; maxW: number; rect: Rect } | null {
      const r = plot.rect;
      const size = textSize();
      const maxW = r.w - 24;
      let src: string;
      let sz = size;
      let alpha: number;
      let border: string;
      let dy = 0;
      if (ms) {
        const t = now - mir!;
        src =
          t < MIR.show + MIR.move
            ? tt(`Spiegeln an y = x:  (x | ${powSrc('x')})  →  (${powSrc('x')} | x)`, `Reflect in y = x:  (x | ${powSrc('x')})  →  (${powSrc('x')} | x)`)
            : tt(`\\c{l}{y = ${logName()} x} ist die Umkehrfunktion von \\c{e}{y = ${powSrc('x')}}`, `\\c{l}{y = ${logName()} x} is the inverse function of \\c{e}{y = ${powSrc('x')}}`);
        sz = size + 0.5;
        alpha = ms.show * ms.fade;
        border = th().series[3]!;
        dy = (1 - ms.show) * 10 * (b > 1 ? 1 : -1);
      } else {
        if (k.pts < 0.5) return null;
        const x = rnd(X.v, 1);
        const y = b ** x;
        const xs = num(x);
        const ys = NV(y);
        src = hidden()
          ? `\\c{e}{${powSrc('x')} = y}   ⇔   \\c{l}{${logName()} y = x}`
          : `\\c{e}{${powSrc(xs)} ${eqV(y)} ${ys}}   ⇔   \\c{l}{${logName()} ${ys} ${eqV(y)} ${xs}}`;
        alpha = clamp01((k.pts - 0.5) * 2);
        border = C().P;
      }
      const w = Math.min(maxW, labelW(src, sz) + 10);
      const [cx, cy] = captionSpot(w + 4, b);
      const rect = { x: cx - w / 2 - 6, y: cy - 16, w: w + 12, h: 32 };
      return { src, cx, cy: cy + dy, size: sz, border, alpha, maxW, rect };
    }

    /* ---------- Ansicht „Gleichung lösen“ ---------- */

    function solState(now: number): { line: number; drop: number; pop: number } {
      if (sol === null) return { line: 1, drop: 1, pop: 1 };
      const t = now - sol;
      return {
        line: ease.inOutCubic(clamp01(t / SOL.line)),
        drop: ease.inOutCubic(clamp01((t - SOL.line) / SOL.drop)),
        pop: ease.outBack(clamp01((t - SOL.line - SOL.drop) / SOL.pop)),
      };
    }

    function drawSolve(now: number, k: K): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const size = textSize();
      const b = bNow();
      const cv = Math.exp(Cc.v);
      const xs = log(b, cv);
      const st = solState(now);
      const show = !hidden();
      const [e0, e1] = expSpan();
      const ox = plot.px(0);
      const oy = plot.py(0);

      // Eingrenzen: Streifen zwischen k und k + 1
      const br = bracket(baseOf(), p.c);
      if (br && show && !br.exact) {
        const xa = plot.px(br.lo);
        const xb = plot.px(br.hi);
        if (xb - xa > 18) {
          const al = 0.6 * k.pts * st.pop;
          g.save();
          g.globalAlpha = al;
          g.fillStyle = mixColor(c.x, th().bg, 0, th().dark ? 0.16 : 0.1);
          g.fillRect(xa, r.y, xb - xa, r.h);
          g.restore();
          // Potenzen an den Streifenrändern
          for (const [kk, pv] of [
            [br.lo, br.powLo],
            [br.hi, br.powHi],
          ] as const) {
            const px = plot.px(kk);
            const py = plot.py(pv);
            if (!inside(px, py, 2)) continue;
            g.save();
            g.globalAlpha = 0.7 * k.pts * st.pop;
            g.strokeStyle = c.x;
            g.lineWidth = 1.4;
            g.setLineDash([3, 4]);
            g.beginPath();
            g.moveTo(px, oy);
            g.lineTo(px, py);
            g.lineTo(ox, py);
            g.stroke();
            g.restore();
            g.save();
            g.globalAlpha = k.pts * st.pop;
            dot(px, py, c.exp, 4);
            g.restore();
            const src = `${powSrc(num(kk))} = ${NV(pv)}`;
            const left = b > 1 ? kk === br.lo : kk === br.hi;
            const [lx, ly] = clampAnchor(px + (left ? -9 : 9), py + (left ? -13 : 13) * (b > 1 ? 1 : -1), labelW(src, size - 1), left ? 'right' : 'left', r);
            label(lx, ly, src, c.exp, left ? 'right' : 'left', size - 1, k.labels * k.pts * st.pop);
          }
        }
      }

      // Exponentialgraph
      stroke(curve(b, e0, e0 + (e1 - e0) * k.graph, false), c.exp, 3.4, { glow: true });
      // Name
      const nameY = Math.min(plot.bounds.yMax - 30 / plot.scale.y, cv * 1.18);
      const nx = log(b, nameY);
      if (Number.isFinite(nx)) {
        const src = `y = ${powSrc('x')}`;
        const up = b > 1;
        const [lx, ly] = clampAnchor(plot.px(nx) + (up ? -12 : 12), plot.py(nameY) - 6, labelW(src, size + 1.5), up ? 'right' : 'left', r);
        label(lx, ly, src, c.exp, up ? 'right' : 'left', size + 1.5, k.labels);
      }

      // Waagrechte y = c (fährt von der y-Achse aus herein)
      const cy = plot.py(cv);
      const S: Pt = [plot.px(xs), cy];
      const lineEnd = lerp(r.x, r.x + r.w, st.line);
      g.save();
      g.globalAlpha = k.pts;
      g.strokeStyle = c.c;
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(r.x, cy);
      g.lineTo(lineEnd, cy);
      g.stroke();
      g.restore();
      const cSrc = `y = ${num(rnd(cv, 2))}`;
      const cLeft = b > 1; // Beschriftung auf der Seite, auf der der Graph nicht ist
      if (cLeft) {
        // links von S über der Geraden ist frei; liegt die y-Achse dort, rechts neben ihr
        const lx0 = ox < S[0] - 20 ? Math.max(r.x + 10, ox + 10) : r.x + 10;
        const [lx, ly] = clampAnchor(lx0, cy - 13, labelW(cSrc), 'left', r);
        label(lx, ly, cSrc, c.c, 'left', size, k.labels * k.pts);
      } else {
        const [lx, ly] = clampAnchor(r.x + r.w - 10, cy - 13, labelW(cSrc), 'right', r);
        label(lx, ly, cSrc, c.c, 'right', size, k.labels * k.pts);
      }

      // Lot vom Schnittpunkt auf die x-Achse
      if (Number.isFinite(S[0]) && inside(S[0], S[1], -2) && st.line > 0.98) {
        const yEnd = lerp(S[1], oy, st.drop);
        g.save();
        g.strokeStyle = c.x;
        g.lineWidth = 2;
        g.setLineDash([6, 5]);
        g.beginPath();
        g.moveTo(S[0], S[1]);
        g.lineTo(S[0], yEnd);
        g.stroke();
        g.restore();
        if (st.drop > 0.05 && Math.abs(yEnd - S[1]) > 12) arrowHead(S[0], yEnd - (yEnd > S[1] ? 5 : -5), yEnd > S[1] ? Math.PI / 2 : -Math.PI / 2, c.x, 10);
        dot(S[0], S[1], c.c, 6.5);
        label(S[0] + (b > 1 ? 11 : -11), S[1] - 15, 'S', c.c, b > 1 ? 'left' : 'right', size + 1, k.labels);
        // Ergebnis an der x-Achse
        if (st.drop > 0.95) {
          const xv = show ? `x ${eqs(xs, 2)} ${num(rnd(xs, 2))}` : 'x = ?';
          const pr = { size, border: c.x, color: c.x, alpha: clamp01(st.pop) };
          const w = labelW(xv, size) + 12;
          const px = clamp(S[0], r.x + w / 2 + 6, r.x + r.w - w / 2 - 6);
          const below = oy + 24 < r.y + r.h - 14;
          pill(px, below ? oy + 24 : oy - 24, xv, pr);
          dot(S[0], oy, c.x, 4.5 * clamp01(st.pop));
        }
      } else if (Number.isFinite(S[0]) && st.line > 0.98) {
        edgeArrow(S, c.c, k.pts);
      }
    }

    /* ---------- Ansicht „Rechengesetze“ (logarithmische Skala) ---------- */

    interface Seg {
      from: number;
      to: number;
      color: string;
      lane: number;
      label: string;
      reveal: number;
    }
    interface Knob {
      key: 'u' | 'v';
      px: number;
      py: number;
    }
    let knobs: Knob[] = [];
    let rulerMap: { x0: number; x1: number; s0: number; s1: number } | null = null;
    let dragKnob: Knob['key'] | null = null;

    function buildState(now: number): (i: number) => number {
      if (build === null) return () => 1;
      const t = now - build;
      return (i) => ease.inOutCubic(clamp01((t - i * 650) / 600));
    }

    /** Ziel-Bereich der Skala aus allen beteiligten Positionen. */
    function rulerTarget(): [number, number] {
      const b = baseOf();
      const lu = log(b, p.u);
      const lv = log(b, p.v);
      const pos = [0, lu];
      if (law() === 'prod') pos.push(lu + lv);
      else if (law() === 'quot') pos.push(lu - lv);
      else pos.push(p.r * lu);
      let lo = Math.min(...pos);
      let hi = Math.max(...pos);
      const span = Math.max(2.4, hi - lo);
      const mid = (lo + hi) / 2;
      lo = mid - span / 2;
      hi = mid + span / 2;
      const pad = span * 0.1;
      return [lo - pad, hi + pad];
    }

    function drawLaws(now: number, k: K, alpha: number): void {
      const g = surface.g;
      const c = C();
      const r = regions().plot;
      const size = textSize();
      const b = bNow();
      const lb = Math.log(b);
      const lu = U.v / lb;
      const lv = V.v / lb;
      const rr = RR.v;
      const lname = logName();
      const ok = Math.abs(lb) > 1e-3;
      g.save();
      g.globalAlpha = alpha;

      // Kopfzeile: das Gesetz allgemein
      const head =
        law() === 'prod'
          ? `${lname}(\\c{a}{u} · \\c{v}{v}) = \\c{a}{${lname} u} + \\c{v}{${lname} v}`
          : law() === 'quot'
            ? `${lname} \\f{\\c{a}{u}}{\\c{v}{v}} = \\c{a}{${lname} u} − \\c{v}{${lname} v}`
            : `${lname}(\\c{a}{u}^{r}) = r · \\c{a}{${lname} u}`;
      const headY = r.y + 30;
      pill(r.x + r.w / 2, headY, head, { size: size + 1.5, maxW: r.w - 30, alpha: k.labels });

      // Skala
      const m = wide() ? 34 : 18;
      const x0 = r.x + m;
      const x1 = r.x + r.w - m;
      const s0 = S0.v;
      const s1 = S1.v;
      const X0 = (s: number) => x0 + ((s - s0) / (s1 - s0)) * (x1 - x0);
      rulerMap = { x0, x1, s0, s1 };
      const rh = Math.round(clamp(r.h * 0.19, 58, 88));
      const ry = Math.round(r.y + r.h * 0.6 - rh / 2);
      const rect: Rect = { x: x0 - 12, y: ry, w: x1 - x0 + 24, h: rh };
      // Lineal mit Schatten und zwei Hälften: oben die Zahlen y, unten die Logarithmen
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      g.fillStyle = mixColor(th().bg, th().text, th().dark ? 0.07 : 0.025);
      roundRect(g, rect.x, rect.y, rect.w, rect.h, 10);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, rect.x, rect.y, rect.w, rect.h, 10);
      g.clip();
      const grad = g.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
      grad.addColorStop(0, mixColor(th().bg, c.a1, 0, th().dark ? 0.05 : 0.03));
      grad.addColorStop(0.5, mixColor(th().bg, c.a1, 0, th().dark ? 0.1 : 0.06));
      grad.addColorStop(0.5, mixColor(th().bg, c.log, 0, th().dark ? 0.12 : 0.06));
      grad.addColorStop(1, mixColor(th().bg, c.log, 0, th().dark ? 0.06 : 0.03));
      g.fillStyle = grad;
      g.fillRect(rect.x, rect.y, rect.w, rect.h);
      g.strokeStyle = th().dark ? '#3a4558' : '#d5dbe4';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(rect.x, Math.round(ry + rh / 2) + 0.5);
      g.lineTo(rect.x + rect.w, Math.round(ry + rh / 2) + 0.5);
      g.stroke();
      // feine Teilung: Zahlen 1…9 · 10ᵏ an ihren logarithmischen Stellen (oben)
      const mid = ry + rh / 2;
      if (ok) {
        const lo = Math.min(b ** s0, b ** s1);
        const hi = Math.max(b ** s0, b ** s1);
        const k0 = Math.floor(Math.log10(lo));
        const k1 = Math.ceil(Math.log10(hi));
        if (k1 - k0 < 14) {
          g.strokeStyle = mixColor(th().muted, th().bg, 0.2);
          for (let e = k0; e <= k1; e++) {
            for (let d = 1; d <= 9; d++) {
              const val = d * 10 ** e;
              const s = Math.log(val) / lb;
              if (s < s0 || s > s1) continue;
              const px = X0(s);
              g.lineWidth = d === 1 ? 1.4 : 1;
              g.beginPath();
              g.moveTo(Math.round(px) + 0.5, mid);
              g.lineTo(Math.round(px) + 0.5, mid - (d === 1 ? 12 : d === 5 ? 9 : 6));
              g.stroke();
            }
          }
        }
      }
      // ganze Logarithmen k (unten) und Potenzen bᵏ (oben)
      const pxPerUnit = (x1 - x0) / (s1 - s0);
      const every = pxPerUnit >= 44 ? 1 : pxPerUnit >= 22 ? 2 : pxPerUnit >= 9 ? 5 : 10;
      const half = pxPerUnit >= 70;
      g.strokeStyle = th().text;
      for (let s = Math.ceil(s0 * 2) / 2; s <= s1; s += 0.5) {
        const isInt = Number.isInteger(s);
        if (!isInt && !half) continue;
        if (isInt && s % every !== 0) {
          // nur kurzer Strich
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(Math.round(X0(s)) + 0.5, mid);
          g.lineTo(Math.round(X0(s)) + 0.5, mid + 6);
          g.stroke();
          continue;
        }
        const px = Math.round(X0(s)) + 0.5;
        g.lineWidth = isInt ? 1.6 : 1;
        g.beginPath();
        g.moveTo(px, mid - (isInt ? 0 : 0));
        g.lineTo(px, mid + (isInt ? 12 : 7));
        g.stroke();
        if (!isInt) continue;
        const lbox = formula(g, num(s), fstyle(size, th().text, 700));
        lbox.draw(g, px - lbox.w / 2, mid + 12 + lbox.asc + 3);
        if (ok) {
          const val = b ** s;
          const vs = p.e && s !== 0 && s !== 1 ? `\\t{e}^{${num(s)}}` : NV(val);
          const vbox = formula(g, vs, fstyle(size, th().text, 700));
          if (vbox.w < pxPerUnit * every - 6 || every > 1) vbox.draw(g, px - vbox.w / 2, mid - 14);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(px, mid);
          g.lineTo(px, mid - 4);
          g.stroke();
        }
      }
      g.restore();
      // Achsentitel links außen auf dem Lineal
      const cap = (s: string, y: number, col: string) => {
        const bx = formula(g, s, fstyle(size - 2, col, 700));
        g.save();
        g.globalAlpha = alpha * 0.9;
        bx.draw(g, rect.x + 6, y);
        g.restore();
      };
      cap(tt('Zahl', 'number'), ry + 13, th().muted);
      cap(lname, ry + rh - 6, th().muted);

      // Pfeile
      const B = buildState(now);
      const segs: Seg[] = [];
      const uS = NV(Math.exp(U.v));
      const vS = NV(Math.exp(V.v));
      const lS = (s: string, val: number) => (hidden() ? `${lname} ${s}` : `${lname} ${s} ${eqs(val, 4)} ${N4(val)}`);
      if (law() === 'prod') {
        segs.push({ from: 0, to: lu, color: c.a1, lane: 1, label: lS(uS, lu), reveal: B(0) });
        segs.push({ from: lu, to: lu + lv, color: c.a2, lane: 1, label: lS(vS, lv), reveal: B(1) });
      } else if (law() === 'quot') {
        segs.push({ from: 0, to: lu, color: c.a1, lane: 1, label: lS(uS, lu), reveal: B(0) });
        segs.push({ from: lu, to: lu - lv, color: c.a2, lane: 2, label: lS(vS, lv), reveal: B(1) });
      } else {
        const n = Math.ceil(Math.abs(rr) - 1e-9);
        const sg = Math.sign(rr) || 1;
        for (let i = 0; i < n; i++) {
          const f = Math.min(i + 1, Math.abs(rr));
          const first = sg > 0 ? lS(uS, lu) : hidden() ? `−${lname} ${uS}` : `−${lname} ${uS} ${eqs(lu, 4)} ${N4(-lu)}`;
          segs.push({ from: sg * i * lu, to: sg * f * lu, color: i % 2 ? mixColor(c.a1, th().text, 0.25) : c.a1, lane: 1, label: i === 0 ? first : '', reveal: build === null ? 1 : ease.inOutCubic(clamp01((now - build - i * 420) / 400)) });
        }
      }
      const resTo = law() === 'prod' ? lu + lv : law() === 'quot' ? lu - lv : rr * lu;
      const resStart = law() === 'pow' ? Math.ceil(Math.abs(rr)) * 420 + 150 : 1400;
      const resReveal = build === null ? 1 : ease.inOutCubic(clamp01((now - build - resStart) / 650));
      const valRes = law() === 'prod' ? Math.exp(U.v + V.v) : law() === 'quot' ? Math.exp(U.v - V.v) : Math.exp(U.v * rr);
      const resLabel = hidden() ? `${lname} ${resValSrc()} = ?` : `${lname} ${resValSrc()} ${eqs(resTo, 4)} ${N4(resTo)}`;

      const laneY = (lane: number) => (lane > 0 ? ry - 28 - (lane - 1) * 48 : ry + rh + 28);

      // Potenzschreibweise: die Logarithmen sind die Hochzahlen
      {
        const ex = (v: number) => num(rnd(v, 2));
        const approx = (vals: number[]) => (vals.every((q) => exactTo(q, 2)) ? '=' : '≈');
        const bb = baseOf();
        const u0 = p.u;
        const v0 = p.v;
        const us = num(u0);
        const vs = num(v0);
        const P = (e: string) => powSrc(e);
        let src: string;
        if (law() === 'prod') {
          const q = productLaw(bb, u0, v0);
          const a = approx([q.lu, q.lv]);
          src = `\\c{a}{${us}} · \\c{v}{${vs}} ${a} \\c{a}{${P(ex(q.lu))}} · \\c{v}{${P(ex(q.lv))}} ${a} \\c{r}{${P(Q(ex(q.sum)))}} ${eqV(q.value)} \\c{r}{${Q(NV(q.value))}}`;
        } else if (law() === 'quot') {
          const q = quotientLaw(bb, u0, v0);
          const a = approx([q.lu, q.lv]);
          src = `\\c{a}{${us}} : \\c{v}{${vs}} ${a} \\c{a}{${P(ex(q.lu))}} : \\c{v}{${P(ex(q.lv))}} ${a} \\c{r}{${P(Q(ex(q.diff)))}} ${eqV(q.value)} \\c{r}{${Q(NV(q.value))}}`;
        } else {
          const q = powerLaw(bb, u0, p.r);
          const a = approx([q.lu]);
          const rs = num(p.r);
          src = `\\c{a}{${par(us)}}^{${rs}} ${a} (\\c{a}{${P(ex(q.lu))}})^{${rs}} ${a} \\c{r}{${P(Q(ex(q.prod)))}} ${eqV(q.value)} \\c{r}{${Q(NV(q.value))}}`;
        }
        const topLane = law() === 'quot' ? 2 : 1;
        const yTop = laneY(topLane) - 40;
        const yHead = headY + 22;
        if (yTop - yHead > 34) {
          const fa = build === null ? 1 : ease.outCubic(clamp01((now - build - 300) / 600));
          const box = fit(src, r.w - 40, size + 5, th().text, 700);
          g.save();
          g.globalAlpha = alpha * k.labels * fa;
          box.draw(g, r.x + r.w / 2 - box.w / 2, (yTop + yHead) / 2 + (box.asc - box.desc) / 2);
          g.restore();
        }
      }
      const placed: Rect[] = [];
      knobs = [];
      const drawSeg = (sg: Seg, width: number) => {
        if (sg.reveal <= 0) return;
        const y = laneY(sg.lane);
        const a0 = X0(sg.from);
        const a1 = X0(lerp(sg.from, sg.to, sg.reveal));
        const dir = Math.sign(a1 - a0) || 1;
        // Lote zur Skala
        g.save();
        g.globalAlpha = alpha * 0.55 * sg.reveal;
        g.strokeStyle = sg.color;
        g.lineWidth = 1.3;
        g.setLineDash([3, 4]);
        g.beginPath();
        const toward = sg.lane > 0 ? ry : ry + rh;
        g.moveTo(a1, y);
        g.lineTo(a1, toward);
        if (sg.from === 0 || sg.lane === 2) {
          g.moveTo(a0, y);
          g.lineTo(a0, toward);
        }
        g.stroke();
        g.restore();
        if (Math.abs(a1 - a0) < 2) return;
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = sg.color;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : mixColor(sg.color, '#ffffff', 0, 0.5);
        g.shadowBlur = 6;
        g.beginPath();
        g.moveTo(a0, y);
        g.lineTo(a1 - dir * 6, y);
        g.stroke();
        g.restore();
        arrowHead(a1 - dir * 2, y, dir > 0 ? 0 : Math.PI, sg.color, 14);
        // Anfangsmarke
        g.save();
        g.fillStyle = sg.color;
        g.fillRect(a0 - 1.5, y - 7, 3, 14);
        g.restore();
        if (sg.label && sg.reveal > 0.6) {
          const w = labelW(sg.label, size);
          const lx = clamp((a0 + a1) / 2, r.x + w / 2 + 4, r.x + r.w - w / 2 - 4);
          let ly = sg.lane > 0 ? y - 17 : y + 19;
          const hit = () => placed.some((q) => Math.abs(q.x - lx) < (q.w + w) / 2 + 4 && Math.abs(q.y - ly) < 20);
          let tries = 0;
          while (hit() && tries < 3) {
            ly += sg.lane > 0 ? -21 : 21;
            tries++;
          }
          label(lx, ly, sg.label, sg.color, 'center', size, k.labels * clamp01((sg.reveal - 0.6) * 2.5));
          placed.push({ x: lx, y: ly, w, h: 20 });
        }
      };
      segs.forEach((sg) => drawSeg(sg, 4));
      drawSeg({ from: 0, to: resTo, color: c.res, lane: 0, label: resLabel, reveal: resReveal }, 4.5);

      // Ziehgriffe an den Pfeilenden (u und v)
      const uSign = law() === 'pow' && rr < 0 ? -1 : 1;
      const uEnd = X0(uSign * lu);
      if (!(law() === 'pow' && Math.abs(rr) < 1)) knobs.push({ key: 'u', px: uEnd, py: laneY(1) });
      if (law() !== 'pow') knobs.push({ key: 'v', px: X0(law() === 'prod' ? lu + lv : lu - lv), py: laneY(law() === 'prod' ? 1 : 2) });
      if (editable()) {
        for (const kn of knobs) {
          const col = kn.key === 'u' ? c.a1 : c.a2;
          g.save();
          g.globalAlpha = alpha * (dragKnob === kn.key ? 0.3 : 0.16) * B(kn.key === 'u' ? 0 : 1);
          g.fillStyle = col;
          g.beginPath();
          g.arc(kn.px, kn.py, dragKnob === kn.key ? 15 : 12, 0, TAU);
          g.fill();
          g.restore();
        }
      }

      // Marke für u auf der Skala und Ergebnis
      const markU = (s: number, col: string, top: boolean, a: number) => {
        const px = X0(s);
        g.save();
        g.globalAlpha = alpha * a;
        g.fillStyle = col;
        g.beginPath();
        if (top) {
          g.moveTo(px - 6, ry - 1);
          g.lineTo(px + 6, ry - 1);
          g.lineTo(px, ry + 8);
        } else {
          g.moveTo(px - 6, ry + rh + 1);
          g.lineTo(px + 6, ry + rh + 1);
          g.lineTo(px, ry + rh - 8);
        }
        g.closePath();
        g.fill();
        g.restore();
      };
      markU(lu, c.a1, true, B(0));
      markU(resTo, c.res, false, resReveal);
      markU(resTo, c.res, true, resReveal);

      // Unten: Multiplizieren der Zahlen ⇔ Addieren der Logarithmen
      if (resReveal > 0.9) {
        const opS = law() === 'prod' ? `${uS} · ${vS}` : law() === 'quot' ? `${uS} : ${vS}` : `${uS}^{${num(rnd(rr, 1))}}`;
        const vr = hidden() ? '?' : NV(valRes);
        const src =
          law() === 'prod'
            ? tt(`Zahlen multiplizieren:  \\c{a}{${uS}} · \\c{v}{${vS}} ${eqV(valRes)} \\c{r}{${vr}}   ⇔   Logarithmen addieren`, `Multiply the numbers:  \\c{a}{${uS}} · \\c{v}{${vS}} ${eqV(valRes)} \\c{r}{${vr}}   ⇔   add the logarithms`)
            : law() === 'quot'
              ? tt(`Zahlen dividieren:  \\c{a}{${uS}} : \\c{v}{${vS}} ${eqV(valRes)} \\c{r}{${vr}}   ⇔   Logarithmen subtrahieren`, `Divide the numbers:  \\c{a}{${uS}} : \\c{v}{${vS}} ${eqV(valRes)} \\c{r}{${vr}}   ⇔   subtract the logarithms`)
              : tt(`Potenzieren:  \\c{a}{${opS}} ${eqV(valRes)} \\c{r}{${vr}}   ⇔   Logarithmus vervielfachen`, `Raise to a power:  \\c{a}{${opS}} ${eqV(valRes)} \\c{r}{${vr}}   ⇔   multiply the logarithm`);
        pill(r.x + r.w / 2, r.y + r.h - 24, src, { size, maxW: r.w - 24, alpha: clamp01((resReveal - 0.9) * 10) * k.labels, border: c.res });
      }
      g.restore();

      function resValSrc(): string {
        if (law() === 'prod') return hidden() ? `(${uS} · ${vS})` : NV(valRes);
        if (law() === 'quot') return hidden() ? `\\f{${uS}}{${vS}}` : NV(valRes);
        return `${par(uS)}^{${num(rnd(rr, 1))}}`;
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
    const nb = (s: string) => s.replace(/ /g, '\u00a0');
    const LAB = 'lab';

    interface InfoItem {
      label?: string;
      value: string;
      swatch?: string;
      dash?: boolean;
      muted?: boolean;
    }
    interface InfoLine {
      src: string;
      item: number;
      first: boolean;
      swatch?: string;
      muted?: boolean;
    }
    interface CardData {
      title: string;
      chip: string | null;
      chipColor: string;
      head: string;
      headColor: string;
      items: InfoItem[];
    }

    function cardData(): CardData {
      const c = C();
      const b = baseOf();
      const items: InfoItem[] = [];
      const bs = bTxt();
      const lname = logName();
      if (view() === 'inverse') {
        items.push({ value: `${nb(`D = ${R}^{+}`)}     ${nb(`W = ${R}`)}` });
        items.push({ label: tt('Nullstelle', 'Zero'), value: `${nb('x = 1,')} ${tt('denn', 'since')} ${nb(`${powSrc('0')} = 1`)}`, swatch: c.log });
        items.push({ label: tt('Punkt', 'Point'), value: `${nb(`(${bs} | 1),`)} ${tt('denn', 'since')} ${nb(`${powSrc('1')} = ${bs}`)}`, swatch: c.B });
        items.push({ label: tt('Asymptote', 'Asymptote'), value: `${nb('x = 0')} ${tt('(die y-Achse)', '(the y-axis)')}`, swatch: c.log, dash: true });
        items.push({ label: tt('Monotonie', 'Monotonicity'), value: b > 1 ? tt(`streng monoton steigend ${nb('(b > 1)')}`, `strictly increasing ${nb('(b > 1)')}`) : tt(`streng monoton fallend ${nb('(0 < b < 1)')}`, `strictly decreasing ${nb('(0 < b < 1)')}`) });
        items.push({ label: tt('Umkehrfunktion', 'Inverse function'), value: `\\c{e}{${nb(`y = ${powSrc('x')}`)}}`, swatch: c.exp });
        return { title: tt('Steckbrief', 'Key features'), chip: p.e ? tt('natürlicher Log.', 'natural log') : p.b === 10 ? tt('Zehnerlog. lg', 'common log lg') : null, chipColor: c.log, head: `f(x) = ${lname} x`, headColor: c.log, items };
      }
      if (view() === 'laws') {
        const u = p.u;
        const v = p.v;
        const us = num(u);
        const vs = num(v);
        const H = (s: string) => Q(s);
        if (law() === 'prod') {
          const q = productLaw(b, u, v);
          const s1 = exactTo(q.lu, 4) && exactTo(q.lv, 4) ? '=' : '≈';
          items.push({ value: `${s1} ${H(nb(`${N4(q.lu)} + ${N4(q.lv)}`))} ${s1 === '=' ? eqs(q.sum, 4) : '≈'} ${H(N4(q.sum))}` });
          items.push({ label: tt('Probe', 'Check'), value: H(`${nb(`${powSrc(N4(q.sum))} ${eqV(q.value)} ${NV(q.value)}`)} = ${nb(`${us} · ${vs}`)}`), swatch: c.res });
          items.push({ label: tt('Begründung', 'Reason'), value: `${nb(`${bs}^{m} · ${bs}^{n} = ${bs}^{m + n}`)}: ${tt('Beim Multiplizieren addieren sich die Hochzahlen.', 'when multiplying, the exponents add up.')}`, muted: true });
          items.push({ label: tt('Merke', 'Remember'), value: tt('Aus „mal“ wird „plus“: Der Logarithmus macht aus Punktrechnung Strichrechnung.', '“times” becomes “plus”: logarithms turn multiplication into addition.'), muted: true });
          return { title: tt('Produktregel', 'Product rule'), chip: null, chipColor: c.res, head: `${lname}(${us} · ${vs}) = \\c{a}{${lname} ${us}} + \\c{v}{${lname} ${vs}}`, headColor: th().text, items };
        }
        if (law() === 'quot') {
          const q = quotientLaw(b, u, v);
          const s1 = exactTo(q.lu, 4) && exactTo(q.lv, 4) ? '=' : '≈';
          items.push({ value: `${s1} ${H(nb(`${N4(q.lu)} − ${N4(q.lv)}`))} ${s1 === '=' ? eqs(q.diff, 4) : '≈'} ${H(N4(q.diff))}` });
          items.push({ label: tt('Probe', 'Check'), value: H(`${nb(`${powSrc(N4(q.diff))} ${eqV(q.value)} ${NV(q.value)}`)} = ${nb(`${us} : ${vs}`)}`), swatch: c.res });
          items.push({ label: tt('Begründung', 'Reason'), value: `${nb(`${bs}^{m} : ${bs}^{n} = ${bs}^{m − n}`)}: ${tt('Beim Dividieren subtrahieren sich die Hochzahlen.', 'when dividing, the exponents are subtracted.')}`, muted: true });
          items.push({ label: tt('Merke', 'Remember'), value: tt('Aus „geteilt“ wird „minus“.', '“divided by” becomes “minus”.'), muted: true });
          return { title: tt('Quotientenregel', 'Quotient rule'), chip: null, chipColor: c.res, head: `${lname} \\f{${us}}{${vs}} = \\c{a}{${lname} ${us}} − \\c{v}{${lname} ${vs}}`, headColor: th().text, items };
        }
        const q = powerLaw(b, u, p.r);
        const rs = num(p.r);
        const s1 = exactTo(q.lu, 4) ? '=' : '≈';
        items.push({ value: `${s1} ${H(nb(`${par(rs)} · ${N4(q.lu)}`))} ${s1 === '=' ? eqs(q.prod, 4) : '≈'} ${H(N4(q.prod))}` });
        items.push({ label: tt('Probe', 'Check'), value: H(`${nb(`${powSrc(N4(q.prod))} ${eqV(q.value)} ${NV(q.value)}`)} = ${nb(`${par(us)}^{${rs}}`)}`), swatch: c.res });
        items.push({ label: tt('Begründung', 'Reason'), value: `${nb(`(${bs}^{m})^{r} = ${bs}^{r · m}`)}: ${tt('Beim Potenzieren multipliziert sich die Hochzahl.', 'raising to a power multiplies the exponent.')}`, muted: true });
        items.push({ label: tt('Merke', 'Remember'), value: tt('Aus „hoch r“ wird „r mal“.', '“to the power r” becomes “r times”.'), muted: true });
        return { title: tt('Potenzregel', 'Power rule'), chip: null, chipColor: c.res, head: `${lname}(${us}^{${rs}}) = ${par(rs)} · \\c{a}{${lname} ${us}}`, headColor: th().text, items };
      }
      // Gleichung lösen
      const cS = num(p.c);
      const x = log(b, p.c);
      const br = bracket(b, p.c);
      if (br) {
        if (br.exact) items.push({ label: tt('Ablesen', 'Read off'), value: Q(nb(`${powSrc(num(br.lo))} = ${NV(br.powLo)}`)), swatch: c.exp });
        else {
          const rel = b > 1 ? '<' : '>';
          items.push({ label: tt('Eingrenzen', 'Narrow down'), value: Q(`${nb(`${powSrc(num(br.lo))} = ${NV(br.powLo)}`)} ${rel} ${cS} ${rel} ${nb(`${NV(br.powHi)} = ${powSrc(num(br.hi))}`)}, ${tt('also', 'so')} ${nb(`${num(br.lo)} < x < ${num(br.hi)}`)}`), swatch: c.exp });
        }
      }
      items.push({ label: tt('Logarithmieren', 'Take logs'), value: Q(nb(`x = ${lname} ${cS}`)), swatch: c.x });
      if (!p.e && p.b !== 10) {
        const cb = changeOfBase(b, p.c);
        const F4 = (v: number) => (Number.isInteger(v) ? num(v) : fmt.fixed(v, 4));
        const s1 = exactTo(cb.num, 4) && exactTo(cb.den, 4) ? '=' : '≈';
        items.push({ label: tt('Basiswechsel', 'Change of base'), value: Q(`${nb(`x = \\f{lg ${cS}}{lg ${bs}}`)} ${nb(`${s1} \\f{${F4(cb.num)}}{${F4(cb.den)}}`)} ${nb(`${s1 === '=' ? eqs(x, 4) : '≈'} \\b{${N4(x)}}`)}`), swatch: c.x });
      } else items.push({ label: tt('Taschenrechner', 'Calculator'), value: Q(`${nb(`x = ${lname} ${cS}`)} ${eqs(x, 4)} \\b{${N4(x)}}`), swatch: c.x });
      const back = pow(b, rnd(x, 4));
      items.push({ label: tt('Probe', 'Check'), value: Q(nb(`${powSrc(N4(x))} ${eqV(back)} ${NV(back)}`)), swatch: c.c });
      items.push({ value: tt(`Für c ≤ 0 keine Lösung, denn ${nb(`${powSrc('x')} > 0`)}.`, `No solution for c ≤ 0, since ${nb(`${powSrc('x')} > 0`)}.`), muted: true });
      return { title: tt('Exponentialgleichung', 'Exponential equation'), chip: null, chipColor: c.x, head: `${powSrc('x')} = ${cS}`, headColor: c.exp, items };
    }

    const infoStyle = (size: number, color: string, weight = 600): FormulaStyle => ({ ...fstyle(size, color, weight), palette: { ...palette(), [LAB]: th().muted } });

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
      let hs = size + 3;
      let hb = formula(g, src, infoStyle(hs, color, 700));
      while (hb.w > maxW && hs > 10) {
        hs -= 0.5;
        hb = formula(g, src, infoStyle(hs, color, 700));
      }
      return hb;
    }

    const cardPad = () => (wide() ? 13 : 10);

    function cardLayout(w: number, size: number): { data: CardData; lines: InfoLine[]; hb: FormulaBox; height: number; lh: number; gap: number } {
      const pad = cardPad();
      const data = cardData();
      const lines = wrapItems(data.items, w - 2 * pad, size);
      const hb = headBox(data.head, w - 2 * pad, size, data.headColor);
      const lh = size * 1.42;
      const gap = size * 0.4;
      const items = new Set(lines.map((l) => l.item)).size;
      const height = pad * 2 + size + 10 + hb.asc + hb.desc + 10 + lines.length * lh + Math.max(0, items - 1) * gap;
      return { data, lines, hb, height, lh, gap };
    }

    function drawCard(r: Rect, size: number, alpha: number, stagger: number, now: number): void {
      const g = surface.g;
      const pad = cardPad();
      const { data, lines, hb, lh, gap } = cardLayout(r.w, size);
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const title = formula(g, data.title, fstyle(size - 1, th().muted, 700));
      title.draw(g, r.x + pad, r.y + pad + title.asc);
      const change = reduced() ? 1 : clamp01((now - cardT0) / 420);
      if (data.chip) {
        const cb = fit(data.chip, r.w - 2 * pad - title.w - 30, size - 1.5, data.chipColor, 700);
        const cw = cb.w + 24;
        const cx = r.x + r.w - pad - cw;
        const cy = r.y + pad - 3;
        const ch = title.asc + title.desc + 6;
        g.save();
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
      y += hb.desc + 10;
      const items = new Set(lines.map((l) => l.item)).size;
      const spare = r.y + r.h - pad - y - (lines.length * lh + Math.max(0, items - 1) * gap);
      const extra = spare > 0 ? Math.min(size * 0.55, spare / Math.max(1, items)) : 0;
      let lastItem = -1;
      lines.forEach((ln) => {
        if (ln.item !== lastItem && lastItem >= 0) y += gap + extra;
        lastItem = ln.item;
        const cy = y + lh / 2;
        const aa = clamp01(stagger * (items + 2) - ln.item) * clamp01(change * 2.2 - ln.item * 0.12);
        g.save();
        g.globalAlpha = alpha * (0.25 + 0.75 * ease.outCubic(aa));
        const off = (1 - ease.outCubic(aa)) * 8;
        const it = data.items[ln.item]!;
        const sw = it.swatch ? 15 : 0;
        if (ln.swatch) {
          g.fillStyle = ln.swatch;
          if (it.dash) {
            g.fillRect(r.x + pad + off, cy - 1.5, 3.5, 3);
            g.fillRect(r.x + pad + off + 5.5, cy - 1.5, 3.5, 3);
          } else {
            roundRect(g, r.x + pad + off, cy - 4.5, 9, 9, 2.5);
            g.fill();
          }
        }
        const box = formula(g, ln.src, infoStyle(size, ln.muted ? th().muted : th().text));
        box.draw(g, r.x + pad + sw + (ln.first ? 0 : 12) + off, cy + (box.asc - box.desc) / 2);
        g.restore();
        y += lh;
      });
      g.restore();
    }

    /** Wertetabelle der Potenzen (waagrecht): x und y = bˣ, rückwärts gelesen log_b y = x. */
    function tableNeed(size: number): number {
      return cardPad() * 2 + size + 10 + 3 * size * 1.75 + 4;
    }
    function drawTable(r: Rect, size: number, alpha: number): void {
      const g = surface.g;
      const pad = cardPad();
      const c = C();
      const b = bNow();
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const tb = fit(tt(`Wertetabelle von y = ${powSrc('x')}`, `Table of values of y = ${powSrc('x')}`), r.w - 2 * pad, size, th().text, 800);
      tb.draw(g, r.x + pad, r.y + pad + tb.asc);
      const top = r.y + pad + tb.asc + tb.desc + 8;
      const rows = 3;
      const lh = Math.min(size * 2, (r.y + r.h - pad - top) / rows);
      const headW = Math.min(64, (r.w - 2 * pad) * 0.24);
      const inner = r.w - 2 * pad;
      const cw = (inner - headW) / TABLE_XS.length;
      const rowLabel = (s: string, i: number, color: string) => {
        const bx = fit(s, headW - 6, size - 0.5, color, 700);
        bx.draw(g, r.x + pad, top + lh * i + lh / 2 + (bx.asc - bx.desc) / 2);
      };
      rowLabel('x', 0, c.log);
      rowLabel(`y = ${powSrc('x')}`, 1, c.exp);
      g.strokeStyle = th().dark ? '#2c3648' : '#e3e8ef';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + pad, Math.round(top + lh) + 0.5);
      g.lineTo(r.x + r.w - pad, Math.round(top + lh) + 0.5);
      g.moveTo(Math.round(r.x + pad + headW - 4) + 0.5, top + 2);
      g.lineTo(Math.round(r.x + pad + headW - 4) + 0.5, top + lh * 2 - 2);
      g.stroke();
      const curX = rnd(p.x, 1);
      let pick = TABLE_XS.includes(curX) ? curX : 3;
      if (!TABLE_XS.includes(pick)) pick = 3;
      TABLE_XS.forEach((x, i) => {
        const cx = r.x + pad + headW + cw * i + cw / 2;
        if (x === pick) {
          g.fillStyle = mixColor(c.P, th().bg, 0, th().dark ? 0.2 : 0.13);
          roundRect(g, cx - cw / 2 + 1, top + 2, cw - 2, lh * 2 - 4, 7);
          g.fill();
        }
        const bx = fit(num(x), cw - 4, size, th().text, 700);
        bx.draw(g, cx - bx.w / 2, top + lh / 2 + (bx.asc - bx.desc) / 2);
        const yv = b ** x;
        const s = hidden() ? '?' : NV(yv);
        const bv = fit(s, cw - 4, size - 0.5, th().text, 600);
        bv.draw(g, cx - bv.w / 2, top + lh + lh / 2 + (bv.asc - bv.desc) / 2);
      });
      // rückwärts gelesen
      const yp = b ** pick;
      const src = hidden()
        ? tt(`Rückwärts: \\c{l}{${logName()} y = x}`, `Backwards: \\c{l}{${logName()} y = x}`)
        : tt(`Rückwärts: \\c{l}{${logName()} ${NV(yp)} ${eqV(yp)} ${num(pick)}}`, `Backwards: \\c{l}{${logName()} ${NV(yp)} ${eqV(yp)} ${num(pick)}}`);
      const fb = fit(src, inner, size - 0.5, th().text, 700);
      fb.draw(g, r.x + pad, top + lh * 2 + lh / 2 + (fb.asc - fb.desc) / 2 + 2);
      g.restore();
    }

    /* ---------- Basis-Chips ---------- */

    interface ChipBox {
      id: string;
      r: Rect;
    }
    let chipBoxes: ChipBox[] = [];
    const chipActive = (id: string) => (id === 'e' ? p.e : !p.e && Math.abs(p.b - Number(id)) < 1e-9);
    function drawChips(r: Rect, size: number, alpha: number): void {
      const g = surface.g;
      chipBoxes = [];
      const lab = formula(g, tt('Basis b:', 'Base b:'), fstyle(size - 0.5, th().muted, 700));
      g.save();
      g.globalAlpha = alpha;
      lab.draw(g, r.x + 4, r.y + r.h / 2 + (lab.asc - lab.desc) / 2);
      const gap = 6;
      const x0 = r.x + 4 + lab.w + 10;
      const cw = Math.min(64, (r.x + r.w - x0 - gap * (CHIPS.length - 1)) / CHIPS.length);
      CHIPS.forEach((ch, i) => {
        const cx = x0 + i * (cw + gap);
        const on = chipActive(ch.id);
        const col = C().log;
        g.save();
        g.fillStyle = mixColor(col, th().bg, 0, on ? (th().dark ? 0.32 : 0.18) : th().dark ? 0.1 : 0.06);
        roundRect(g, cx, r.y, cw, r.h, 9);
        g.fill();
        if (on) {
          g.strokeStyle = col;
          g.lineWidth = 2;
          roundRect(g, cx + 1, r.y + 1, cw - 2, r.h - 2, 8);
          g.stroke();
        }
        const src = ch.b === 'e' ? '\\t{e}' : num(ch.b);
        const bx = fit(src, cw - 6, size + 0.5, on ? col : th().text, on ? 800 : 700);
        bx.draw(g, cx + cw / 2 - bx.w / 2, r.y + r.h / 2 + (bx.asc - bx.desc) / 2);
        g.restore();
        chipBoxes.push({ id: ch.id, r: { x: cx, y: r.y, w: cw, h: r.h } });
      });
      g.restore();
    }

    const inRect = (q: Rect, x: number, y: number) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h;
    const knobAt = (x: number, y: number, touch: boolean) => (view() === 'laws' ? knobs.find((k) => Math.hypot(k.px - x, k.py - y) < (touch ? 26 : 16)) : undefined);

    function knobValue(key: 'u' | 'v', px: number): number | null {
      if (!rulerMap) return null;
      const { x0, x1, s0, s1 } = rulerMap;
      const s = s0 + ((px - x0) / (x1 - x0)) * (s1 - s0);
      const b = baseOf();
      if (key === 'u') return law() === 'pow' && p.r < 0 ? b ** -s : b ** s;
      const lu = log(b, p.u);
      return law() === 'prod' ? b ** (s - lu) : b ** (lu - s);
    }

    surface.addTarget({
      contains: (x, y) => chipBoxes.some((c) => inRect(c.r, x, y)) || !!knobAt(x, y, true) || dragKnob !== null,
      pointerDown: (pt) => {
        if (ctx.locked) return false;
        const hit = chipBoxes.find((c) => inRect(c.r, pt.px, pt.py));
        if (hit) {
          const ch = CHIPS.find((c) => c.id === hit.id)!;
          lastB = performance.now();
          if (ch.b === 'e') ctx.set({ e: true });
          else ctx.set({ e: false, b: ch.b });
          return true;
        }
        const kn = knobAt(pt.px, pt.py, pt.type === 'touch');
        if (kn) {
          dragKnob = kn.key;
          grab();
          ctx.requestRender();
          return true;
        }
        return false;
      },
      pointerMove: (pt) => {
        if (!dragKnob) return;
        grab();
        const v = knobValue(dragKnob, pt.px);
        if (v === null || !Number.isFinite(v)) return;
        const val = clamp(v, 0.1, 100);
        if (dragKnob === 'u') ctx.set({ u: val });
        else ctx.set({ v: val });
      },
      pointerUp: () => {
        dragKnob = null;
        grab();
        ctx.requestRender();
      },
      hover: (pt) => {
        const on = !!pt && !ctx.locked && (chipBoxes.some((c) => inRect(c.r, pt.px, pt.py)) || !!knobAt(pt.px, pt.py, false));
        surface.setCursor(on ? (knobAt(pt!.px, pt!.py, false) ? 'grab' : 'pointer') : '');
      },
      wheel: () => false,
    });

    /* ---------- Bild ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      for (const ch of [LB, X, U, V, RR, Cc]) anim = ch.step(now, dt) || anim;
      if (mir !== null) {
        if (now - mir >= MIR_END) mir = null;
        else anim = true;
      }
      if (build !== null) {
        const dur = law() === 'pow' ? Math.ceil(Math.abs(p.r)) * 420 + 900 : 2200;
        if (now - build >= dur) build = null;
        else anim = true;
      }
      if (sol !== null) {
        if (now - sol >= SOL.line + SOL.drop + SOL.pop) sol = null;
        else anim = true;
      }
      if (now - cardT0 < 600) anim = true;
      const viewFade = reduced() ? 1 : ease.outCubic(clamp01((now - viewT0) / 600));
      if (viewFade < 1) anim = true;
      if (now - lastB < 1500) anim = true;

      let k: K = { graph: 1, logG: 1, labels: 1, pts: 1, cards: 1, stagger: 1 };
      if (intro !== null) {
        const t = now - intro;
        if (t > 2600) intro = null;
        else {
          anim = true;
          k = {
            graph: ease.inOutCubic(clamp01((t - 150) / 1100)),
            logG: ease.inOutCubic(clamp01((t - 900) / 1100)),
            labels: ease.outCubic(clamp01((t - 800) / 700)),
            pts: clamp01((t - 1500) / 600),
            cards: ease.outCubic(clamp01((t - 200) / 700)),
            stagger: clamp01((t - 450) / 1300),
          };
        }
      }
      if (viewFade < 1) k = { ...k, graph: Math.min(k.graph, viewFade), logG: Math.min(k.logG, viewFade), pts: Math.min(k.pts, viewFade), labels: Math.min(k.labels, viewFade) };

      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      const v = view();
      if (stepFrame(now, dt, false)) anim = true;
      if (v === 'laws') {
        // Skala folgt (außer beim Ziehen eines Pfeilendes)
        const [a, b] = rulerTarget();
        if (!rulerReady) {
          S0.jump(a);
          S1.jump(b);
          rulerReady = true;
        } else if (!dragging() && dragKnob === null) {
          S0.follow(a, 0.3);
          S1.follow(b, 0.3);
        }
        anim = S0.step(now, dt) || anim;
        anim = S1.step(now, dt) || anim;
        drawLaws(now, k, viewFade);
      } else {
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();
        if (v === 'inverse') drawInverse(now, k);
        else drawSolve(now, k);
        plot.end();
      }

      // Spalte: Basis-Chips und Karten
      const col = regions().col;
      const gap = 10;
      const chipH = 30;
      const slide = (1 - k.cards) * 14;
      drawChips({ x: col.x + slide, y: col.y + 2, w: col.w, h: chipH }, textSize(), k.cards);
      const top = col.y + chipH + gap;
      const avail = col.h - chipH - gap;
      let size = textSize() + 0.5;
      if (v === 'inverse') {
        while (size > 11 && cardLayout(col.w, size).height + gap + tableNeed(size) > avail) size -= 0.5;
        const ih = Math.max(cardLayout(col.w, size).height, avail - gap - Math.max(tableNeed(size), avail * 0.3));
        drawCard({ x: col.x + slide, y: top, w: col.w, h: Math.min(ih, avail - gap - tableNeed(size)) }, size, k.cards, k.stagger, now);
        const used = Math.min(ih, avail - gap - tableNeed(size));
        drawTable({ x: col.x + slide, y: top + used + gap, w: col.w, h: avail - used - gap }, size, k.cards);
      } else {
        while (size > 11 && cardLayout(col.w, size).height > avail) size -= 0.5;
        drawCard({ x: col.x + slide, y: top, w: col.w, h: avail }, size, k.cards, k.stagger, now);
      }
      if (anim) ctx.requestRender();
    }

    /* ---------- Änderungen ---------- */

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = reduced() || source === 'init';
        const user = source === 'input' || source === 'replace';
        // b = 1 ist keine zulässige Basis: zur Seite springen, aus der gezogen wurde
        if (changed.has('b') && Math.abs(p.b - 1) < 0.025) ctx.set({ b: avoidOne(p.b, prevB) });
        if (changed.has('b')) prevB = p.b;
        if (user && ['b', 'e', 'view', 'x'].some((key) => changed.has(key))) mir = null;
        if (changed.has('b') || changed.has('e')) {
          const goal = Math.log(baseOf());
          if (instant) LB.jump(goal);
          else if (source === 'replace') LB.glide(goal, 800, 0, now);
          else LB.follow(goal, dragging() ? 0.05 : 0.22);
          if (!instant) cardT0 = now;
          if (source === 'input' && !dragging()) lastB = now;
        }
        const chanFor: [string, Chan, () => number][] = [
          ['x', X, () => p.x],
          ['u', U, () => Math.log(p.u)],
          ['v', V, () => Math.log(p.v)],
          ['r', RR, () => p.r],
          ['c', Cc, () => Math.log(p.c)],
        ];
        for (const [key, ch, goal] of chanFor) {
          if (!changed.has(key)) continue;
          if (instant) ch.jump(goal());
          else if (source === 'replace') ch.glide(goal(), 800, 120, now);
          else ch.follow(goal(), dragging() ? 0.05 : 0.2);
        }
        if (changed.has('view') && source !== 'init') {
          viewT0 = now;
          cardT0 = now;
          if (p.view === 'laws' && !instant) build = now;
          if (p.view === 'solve' && !instant) sol = now;
        }
        if (changed.has('law') && source !== 'init') {
          cardT0 = now;
          if (!instant) build = now;
        }
        if (source === 'init' && p.view === 'laws' && !reduced()) build = now + 900;
        if (source === 'init' && p.view === 'solve' && !reduced()) sol = now + 1100;
        if (changed.has('info') && source !== 'init') cardT0 = now;
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'mirror') {
          mir = reduced() ? now - MIR.show - MIR.move : now;
        } else if (id === 'build') {
          build = reduced() ? null : now;
        } else if (id === 'solve') {
          if (!p.info) ctx.set({ info: true });
          sol = reduced() ? null : now;
          cardT0 = now;
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
