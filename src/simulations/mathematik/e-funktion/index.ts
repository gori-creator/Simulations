import { defineSimulation, ease, formatNumber, mixColor, Plot, prefersReducedMotion, roundRect, Surface, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { B_MAX, B_MIN, balanceAt, centralDiff, compound, E, gapToE, isE, N_STEPS, nAt, periodOf, ratio, snapBase, tangentZero, type Period } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const X0_MIN = -3;
const X0_MAX = 2;
const NS_MAX = N_STEPS.length - 1;

type View = 'base' | 'tangent' | 'limit';
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
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Zeitplan einer Aktion: Abschnitte mit Zielwert und Dauer (ms), weich verbunden. */
interface Timeline {
  t0: number;
  from: number;
  legs: { to: number; dur: number }[];
}
function timelineValue(tl: Timeline, now: number): { v: number; done: boolean } {
  let t = now - tl.t0;
  let from = tl.from;
  for (const leg of tl.legs) {
    if (t < leg.dur) return { v: lerp(from, leg.to, ease.inOutCubic(clamp01(t / leg.dur))), done: false };
    t -= leg.dur;
    from = leg.to;
  }
  return { v: from, done: true };
}
const timelineDur = (tl: { legs: { dur: number }[] }) => tl.legs.reduce((s, l) => s + l.dur, 0);

/** Zahlen mit Tausendergruppen (schmales Leerzeichen bzw. Komma im Englischen). */
function groupInt(n: number, lang: string): string {
  const s = String(Math.round(n));
  if (s.length <= 4) return s;
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'de' ? ' ' : ',');
}

/**
 * Die natürliche Exponentialfunktion in drei Ansichten:
 * „Die besondere Basis“ – Graph von bˣ und seiner Ableitung ln b · bˣ; ihr
 * Verhältnis ln b ist konstant und für b = e genau 1, dann fallen beide
 * Graphen zusammen (die Basis rastet bei e ein).
 * „Tangente“ – ziehbarer Punkt P auf y = eˣ, Tangente mit Steigungsdreieck
 * (Grundseite 1, Höhe f(x₀)), wahlweise mit Umkehrfunktion ln x.
 * „e entsteht“ – (1 + 1/n)ⁿ als Zinseszins-Treppe und als Folge, die sich e nähert.
 */
export default defineSimulation({
  id: 'e-funktion',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.52 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'base', label: L('Die besondere Basis', 'The special base') },
        { value: 'tangent', label: L('Tangente an y = eˣ', 'Tangent to y = eˣ') },
        { value: 'limit', label: L('e entsteht: (1 + 1/n)ⁿ', 'Where e comes from: (1 + 1/n)ⁿ') },
      ],
      default: 'base',
    },
    {
      key: 'b',
      type: 'number',
      label: L('Basis b', 'Base b'),
      help: L('Von 1,5 bis 4. Nahe 2,718 rastet die Basis bei e ein. Auch am Punkt (1 | b) ziehen.', 'From 1.5 to 4. Close to 2.718 the base snaps to e. You can also drag the point (1 | b).'),
      min: B_MIN,
      max: B_MAX,
      step: 0.01,
      default: 2,
      display: (v, lang) => (isE(v) ? `e ≈ ${formatNumber(E, lang, { decimals: 3 })}` : formatNumber(v, lang, { decimals: 2, fixed: true })),
      visibleIf: (v) => v.view === 'base',
    },
    {
      key: 'x0',
      type: 'number',
      label: L('Stelle x₀ von P', 'Position x₀ of P'),
      help: L('P liegt auf dem Graphen von y = eˣ; auch direkt am Punkt ziehen.', 'P lies on the graph of y = eˣ; you can also drag the point.'),
      min: X0_MIN,
      max: X0_MAX,
      step: 0.01,
      default: 1,
      visibleIf: (v) => v.view === 'tangent',
    },
    {
      key: 'ns',
      type: 'number',
      label: L('Anzahl n der Zinsperioden', 'Number n of interest periods'),
      help: L('Logarithmische Stufen von 1 bis 1 000 000 (jährlich, monatlich, täglich, minütlich …).', 'Logarithmic steps from 1 to 1,000,000 (yearly, monthly, daily, every minute …).'),
      min: 0,
      max: NS_MAX,
      step: 1,
      default: 8,
      display: (v, lang) => `n = ${groupInt(nAt(v), lang)}`,
      visibleIf: (v) => v.view === 'limit',
    },
    { key: 'inv', type: 'boolean', group: 'view', label: L('Umkehrfunktion ln x (Spiegelung an y = x)', 'Inverse function ln x (reflection in y = x)'), default: false, visibleIf: (v) => v.view === 'tangent' },
    { key: 'info', type: 'boolean', group: 'view', label: L('Werte im Bild', 'Values in the picture'), help: L('Aus: Werte durch „?“ ersetzt (für Aufgaben).', 'Off: values replaced by “?” (for tasks).'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'find', label: L('Basis e suchen', 'Search for base e'), primary: true, visibleIf: (v) => v.view === 'base' },
    { id: 'ride', label: L('Punkt entlangfahren', 'Move the point along'), primary: true, visibleIf: (v) => v.view === 'tangent' },
    { id: 'grow', label: L('n wachsen lassen', 'Let n grow'), primary: true, visibleIf: (v) => v.view === 'limit' },
  ],
  readouts: [
    { key: 'f', label: L('Funktion', 'Function') },
    { key: 'df', label: L('Ableitung', 'Derivative'), spoiler: true },
    { key: 'ratio', label: L('Verhältnis', 'Ratio'), spoiler: true },
    { key: 'tan0', label: L('Tangente in (0 | 1)', 'Tangent at (0 | 1)'), spoiler: true },
    { key: 'P', label: L('Punkt P', 'Point P') },
    { key: 'm', label: L('Steigung in P', 'Slope at P'), spoiler: true },
    { key: 'tan', label: L('Tangente', 'Tangent'), spoiler: true },
    { key: 'zero', label: L('Nullstelle der Tangente', 'Zero of the tangent'), spoiler: true },
    { key: 'n', label: L('Zinsperioden', 'Interest periods') },
    { key: 'an', label: L('Kontostand nach 1 Jahr', 'Balance after 1 year'), spoiler: true },
    { key: 'gap', label: L('Abstand zu e', 'Distance from e'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Basis 2: f′ liegt unter f', 'Base 2: f′ lies below f'), values: {} },
    { id: 'b3', label: L('Basis 3: f′ liegt über f', 'Base 3: f′ lies above f'), values: { b: 3 } },
    { id: 'be', label: L('Basis e: f′ = f', 'Base e: f′ = f'), values: { b: 2.72 } },
    { id: 'tan0', label: L('Tangente in (0 | 1): y = x + 1', 'Tangent at (0 | 1): y = x + 1'), values: { view: 'tangent', x0: 0 } },
    { id: 'inv', label: L('Umkehrfunktion ln x', 'Inverse function ln x'), values: { view: 'tangent', x0: 1, inv: true } },
    { id: 'month', label: L('Zinseszins monatlich: n = 12', 'Compound interest monthly: n = 12'), values: { view: 'limit', ns: 8 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen von y = bˣ und seiner Ableitung, daneben das Verhältnis f′(x) : f(x) = ln b und eine Wertetabelle. Weitere Ansichten: Tangente an y = eˣ mit Steigungsdreieck und die Folge (1 + 1/n)ⁿ als Zinseszins-Treppe.',
    },
    en: {
      canvas: 'Coordinate system with the graph of y = bˣ and its derivative, next to it the ratio f′(x) : f(x) = ln b and a table of values. Further views: tangent to y = eˣ with slope triangle and the sequence (1 + 1/n)ⁿ as a compound interest staircase.',
    },
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
    const hidden = () => !p.info;
    const Q = (s: string) => (hidden() ? '?' : s);

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { f: s[0]!, d: s[1]!, ln: s[2]!, tan: s[3]!, B: s[5]!, P: s[3]!, interest: s[3]!, lim: s[2]! };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)');

    /* ---------- Aufteilung ---------- */

    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wide()) {
        const ph = Math.round(h * 0.52);
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 4, y: ph + 8, w: w - 8, h: h - ph - 12 } };
      }
      const colW = Math.round(Math.min(340, Math.max(236, w * 0.32)));
      return { plot: { x: 0, y: 0, w: w - colW - 6, h }, col: { x: w - colW, y: 6, w: colW - 6, h: h - 12 } };
    }
    const textSize = () => {
      const w = surface.width;
      return !wide() ? 12.5 : w < 700 ? 12 : w < 900 ? 12.5 : 13.5;
    };
    const OFF: Rect = { x: -400, y: -400, w: 40, h: 40 };

    const plot = new Plot(surface, {
      x: [-3, 2.4],
      y: [-0.9, 5.2],
      pan: false,
      zoom: false,
      controls: false,
      region: () => (view() === 'limit' ? OFF : regions().plot),
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });
    const cplot = new Plot(surface, {
      x: [0, 1],
      y: [0.8, 3],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => (view() === 'limit' ? regions().plot : OFF),
      xAxis: { label: tt('t in Jahren', 't in years'), minStep: 0.1 },
      yAxis: { label: tt('Kontostand in €', 'balance in €'), minStep: 0.25 },
    });

    /* ---------- Zustand ---------- */

    const rangeOf = (v: View, inv: boolean): [number, number, number, number] =>
      v === 'tangent' ? (inv ? [-3.8, 7.8, -3.8, 7.8] : [-3.9, 2.7, -1.1, 7.8]) : [-3, 2.4, -0.9, 5.2];
    const r0 = rangeOf(view(), p.inv);
    const RX0 = new Chan(r0[0]);
    const RX1 = new Chan(r0[1]);
    const RY0 = new Chan(r0[2]);
    const RY1 = new Chan(r0[3]);
    const B = new Chan(snapBase(p.b));
    const X = new Chan(p.x0);
    const INV = new Chan(p.inv ? 1 : 0);
    /** Treppe: Übergang zwischen zwei n */
    let nFrom = nAt(p.ns);
    let nTo = nAt(p.ns);
    let nT0 = -Infinity;
    const N_DUR = 650;
    const AN = new Chan(compound(nAt(p.ns)));
    const LOGN = new Chan(Math.log10(nAt(p.ns)));
    let findTl: Timeline | null = null;
    let rideTl: Timeline | null = null;
    let actionTimer: ReturnType<typeof setTimeout> | null = null;
    let tourTimer: ReturnType<typeof setTimeout> | null = null;
    let snapT0 = -Infinity;
    let intro: number | null = reduced() ? null : performance.now();
    let viewT0 = -Infinity;
    let cardT0 = -Infinity;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const grab = () => {
      lastDrag = performance.now();
    };
    const dragging = () => performance.now() - lastDrag < 300;

    /* ---------- Texte ---------- */

    const EU = '\\t{e}';
    const bTxt = (b: number, dec = 2) => (Math.abs(b - E) < 1e-9 ? EU : fmt.num(b, dec));
    const N3 = (v: number) => fmt.num(v, Math.abs(v) < 0.01 && v !== 0 ? 5 : Math.abs(v) < 1 ? 4 : 3);
    const nTxt = (n: number) => groupInt(n, ctx.lang);
    const periodTxt = (q: Period | null): string | null => {
      if (!q) return null;
      return {
        year: tt('jährlich', 'yearly'),
        half: tt('halbjährlich', 'half-yearly'),
        quarter: tt('vierteljährlich', 'quarterly'),
        month: tt('monatlich', 'monthly'),
        week: tt('wöchentlich', 'weekly'),
        day: tt('täglich', 'daily'),
        hour: tt('stündlich', 'hourly'),
        minute: tt('minütlich', 'every minute'),
      }[q];
    };
    const approx = (v: number, dec: number) => (Math.abs(v * 10 ** dec - Math.round(v * 10 ** dec)) < 1e-9 ? '=' : '≈');

    function updateReadouts(): void {
      for (const k of ['f', 'df', 'ratio', 'tan0', 'P', 'm', 'tan', 'zero', 'n', 'an', 'gap']) ctx.readout(k, null);
      const v = (s: string) => `<var>${s}</var>`;
      const fx = `${v('f')}(${v('x')})`;
      const dfx = `${v('f')}′(${v('x')})`;
      if (view() === 'base') {
        const b = snapBase(p.b);
        const be = isE(p.b);
        const bH = be ? 'e' : fmt.num(b);
        const lb = ratio(b);
        ctx.readout('f', { html: `${fx} = ${bH}<sup>${v('x')}</sup>` });
        ctx.readout('df', { html: be ? `${dfx} = e<sup>${v('x')}</sup> = ${fx}` : `${dfx} = ln ${bH} · ${bH}<sup>${v('x')}</sup> ≈ ${fmt.num(lb, 4)} · ${bH}<sup>${v('x')}</sup>` });
        ctx.readout('ratio', { html: be ? `${dfx} : ${fx} = ln e = 1` : `${dfx} : ${fx} = ln ${bH} ≈ ${fmt.num(lb, 4)} (${tt('für alle', 'for all')} ${v('x')})` });
        ctx.readout('tan0', { html: be ? `${v('y')} = ${v('x')} + 1` : `${v('y')} ≈ ${fmt.num(lb, 4)} · ${v('x')} + 1` });
      } else if (view() === 'tangent') {
        const x0 = p.x0;
        const y0 = Math.exp(x0);
        ctx.readout('f', { html: `${fx} = e<sup>${v('x')}</sup>` });
        ctx.readout('P', `P${fmt.point(x0, Math.round(y0 * 1000) / 1000, 3)}`);
        ctx.readout('m', { html: `${v('m')} = ${v('f')}′(${fmt.num(x0)}) = e<sup>${fmt.num(x0)}</sup> ≈ ${N3(y0)} = ${v('f')}(${fmt.num(x0)})` });
        const c = y0 * (1 - x0);
        const cTxt = Math.abs(c) < 5e-4 ? '' : ` ${c < 0 ? '−' : '+'} ${N3(Math.abs(c))}`;
        ctx.readout('tan', { html: `${v('y')} = e<sup>${v('x')}<sub>0</sub></sup> · (${v('x')} − ${v('x')}<sub>0</sub> + 1) ≈ ${N3(y0)} · ${v('x')}${cTxt}` });
        ctx.readout('zero', { html: `${v('x')} = ${v('x')}<sub>0</sub> − 1 = ${fmt.num(tangentZero(x0))}` });
      } else {
        const n = nAt(p.ns);
        const an = compound(n);
        const per = periodTxt(periodOf(n));
        ctx.readout('n', `n = ${nTxt(n)}${per ? ` (${per})` : ''}`);
        ctx.readout('an', { html: `(1 + <span class="frac"><span>1</span><span>${nTxt(n)}</span></span>)<sup>${nTxt(n)}</sup> ${approx(an, 4)} ${fmt.fixed(an, n >= 1000 ? 6 : 4)} €` });
        ctx.readout('gap', `e − (1 + 1/n)ⁿ ≈ ${fmt.num(gapToE(n), gapToE(n) < 1e-4 ? 7 : 4)}`);
      }
    }

    function syncActions(): void {
      ctx.setAction('find', { enabled: editable() });
      ctx.setAction('ride', { enabled: editable() });
      ctx.setAction('grow', { enabled: editable(), label: tourTimer ? tt('Anhalten', 'Stop') : tt('n wachsen lassen', 'Let n grow') });
    }

    /* ---------- Griffe ---------- */

    plot.addHandle({
      get: () => [1, B.v],
      set: (_x, y) => {
        grab();
        stopActions();
        ctx.set({ b: Math.max(B_MIN, Math.min(B_MAX, y)) });
      },
      axis: 'y',
      enabled: () => editable() && view() === 'base' && !findTl,
      color: () => C().B,
    });
    plot.addHandle({
      get: () => [X.v, Math.exp(X.v)],
      set: (x) => {
        grab();
        stopActions();
        ctx.set({ x0: Math.max(X0_MIN, Math.min(X0_MAX, x)) });
      },
      axis: 'x',
      enabled: () => editable() && view() === 'tangent' && !rideTl,
      color: () => C().P,
    });

    /* ---------- Formeln und Zeichenhilfen ---------- */

    const fstyle = (size: number, color = th().text, weight = 600, palette?: Record<string, string>): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette });
    const pal = () => {
      const c = C();
      return { f: c.f, d: c.d, t: c.tan, ln: c.ln, m: th().muted, i: c.interest, b: c.B };
    };
    function fit(src: string, maxW: number, size: number, color: string, weight = 600, min = 10): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight, pal()));
      while (box.w > maxW && s > min) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight, pal()));
      }
      return box;
    }

    function pill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; glow?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? textSize();
      const box = fit(src, opts.maxW ?? 9999, size, opts.color ?? th().text, 700);
      const align = opts.align ?? 'center';
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 10, y: base - box.asc - 7, w: box.w + 20, h: box.asc + box.desc + 14 };
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = opts.glow && opts.border ? mixColor(opts.border, th().bg, 0, 0.55 * opts.glow) : th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 10 + (opts.glow ?? 0) * 14;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 12);
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.6;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 12);
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    /** Formel mit Halo direkt im Koordinatensystem, in die Zeichenfläche geklemmt. */
    function label(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = textSize(), alpha = 1, bounds?: Rect): Rect {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700, pal()));
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      let base = y + (box.asc - box.desc) / 2;
      const r = bounds ?? curRect();
      left = Math.max(r.x + 6, Math.min(r.x + r.w - 6 - box.w, left));
      base = Math.max(r.y + 4 + box.asc, Math.min(r.y + r.h - 4 - box.desc, base));
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
    const curRect = () => (view() === 'limit' ? cplot.rect : plot.rect);

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

    const inside = (r: Rect, x: number, y: number, m = 0) => x > r.x + m && x < r.x + r.w - m && y > r.y + m && y < r.y + r.h - m;

    /** Graph als Pixelpfad über den sichtbaren x-Bereich; reveal (0…1) lässt ihn von links wachsen. */
    function path(f: (x: number) => number, reveal = 1, from?: number, to?: number): Pt[] {
      const { xMin, xMax } = plot.bounds;
      const r = plot.rect;
      const lo = from ?? xMin;
      const hi = lo + ((to ?? xMax) - lo) * reveal;
      const n = 320;
      const pts: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const x = lo + ((hi - lo) * i) / n;
        const y = f(x);
        if (!Number.isFinite(y)) continue;
        pts.push([plot.px(x), Math.max(r.y - r.h * 2, Math.min(r.y + r.h * 3, plot.py(y)))]);
      }
      return pts;
    }

    /** Senkrecht angetragenen Namen an der Stelle des Graphen suchen, die sicher im Bild liegt. */
    function curveLabel(f: (x: number) => number, name: string, color: string, alpha: number, side: -1 | 1, avoid: Rect[] = []): Rect | null {
      const r = plot.rect;
      const { xMax } = plot.bounds;
      for (let i = 0; i < 90; i++) {
        const x = xMax - (36 + i * 6) / plot.scale.x;
        const px = plot.px(x);
        const py = plot.py(f(x));
        if (!inside(r, px, py, 30)) continue;
        // Normale zur Kurve: links oberhalb (side −1) bzw. rechts unterhalb (side 1)
        const dy = plot.py(f(x + 0.01)) - py;
        const dx = plot.px(x + 0.01) - px;
        const len = Math.hypot(dx, dy) || 1;
        const nx = (dy / len) * side * -1;
        const ny = (-dx / len) * side * -1;
        const lx = px + nx * 20;
        const ly = py + ny * 20;
        if (avoid.some((q) => lx > q.x - 18 && lx < q.x + q.w + 18 && ly > q.y - 14 && ly < q.y + q.h + 14)) continue;
        return label(lx, ly, name, color, 'center', textSize() + 2, alpha);
      }
      return null;
    }

    /* ---------- Ansicht „Die besondere Basis“ ---------- */

    interface K {
      graph: number;
      labels: number;
      pts: number;
      cards: number;
      stagger: number;
    }

    function drawBase(now: number, k: K): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const size = textSize();
      const b = B.v;
      const lb = Math.log(b);
      const f = (x: number) => b ** x;
      const d = (x: number) => lb * b ** x;
      const close = clamp01(1 - Math.abs(b - E) / 0.08);
      const atE = Math.abs(b - E) < 2e-3;
      const pulse = reduced() ? 0 : clamp01(1 - (now - snapT0) / 1100);

      const fp = path(f, k.graph);
      const dp = path(d, k.graph);
      // Fläche zwischen f und f′: schrumpft bei b = e auf null
      if (fp.length > 1 && dp.length > 1) {
        g.save();
        g.globalAlpha = (th().dark ? 0.2 : 0.13) * (1 - close * 0.9);
        g.fillStyle = b < E ? c.f : c.d;
        g.beginPath();
        fp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        for (let i = dp.length - 1; i >= 0; i--) g.lineTo(dp[i]![0], dp[i]![1]);
        g.closePath();
        g.fill();
        g.restore();
      }

      // Tangente in (0 | 1) mit Steigungsdreieck (Δx = 1, Δy = ln b)
      const ka = clamp01(k.pts * 1.4);
      const x0p = plot.px(0);
      const y1p = plot.py(1);
      if (ka > 0) {
        const { xMin, xMax } = plot.bounds;
        g.save();
        g.globalAlpha = 0.85 * ka;
        g.strokeStyle = c.tan;
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(plot.px(xMin), plot.py(1 + lb * xMin));
        g.lineTo(plot.px(xMax), plot.py(1 + lb * xMax));
        g.stroke();
        g.restore();
        const A: Pt = [x0p, y1p];
        const Bp: Pt = [plot.px(1), y1p];
        const Cp: Pt = [plot.px(1), plot.py(1 + lb)];
        g.save();
        g.globalAlpha = ka;
        g.fillStyle = mixColor(c.tan, th().bg, 0, th().dark ? 0.24 : 0.16);
        g.beginPath();
        g.moveTo(A[0], A[1]);
        g.lineTo(Bp[0], Bp[1]);
        g.lineTo(Cp[0], Cp[1]);
        g.closePath();
        g.fill();
        g.strokeStyle = c.tan;
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(A[0], A[1]);
        g.lineTo(Bp[0], Bp[1]);
        g.lineTo(Cp[0], Cp[1]);
        g.stroke();
        g.restore();
        label((A[0] + Bp[0]) / 2, y1p + 13, '1', c.tan, 'center', size - 0.5, ka * k.labels);
        const hTxt = atE ? '1' : hidden() ? 'ln b' : `ln ${bTxt(b)} ≈ ${fmt.num(lb, 2)}`;
        label(Bp[0] + 8, (y1p + Cp[1]) / 2, hTxt, c.tan, 'left', size - 0.5, ka * k.labels);
      }

      // Weicher Schein, wenn die Graphen zusammenfallen
      if (close > 0 && fp.length > 1) {
        const glowCol = mixColor(c.f, c.d, 0.5);
        stroke(fp, glowCol, 10 + 8 * pulse, { alpha: (0.18 + 0.25 * pulse) * close });
      }
      stroke(fp, c.f, 3.4, { glow: true });
      stroke(dp, c.d, 3, { dash: [10, 7], alpha: 0.95 });

      // f′(0) = ln b auf dem Graphen von f′
      if (ka > 0) {
        const dy = plot.py(lb);
        dot(x0p, dy, c.d, 5 * ease.outBack(ka));
        dot(x0p, y1p, c.f, 5 * ease.outBack(ka));
        if (!atE) label(x0p - 9, dy + (lb < 1 ? 12 : -12), hidden() ? 'f′(0)' : `f′(0) ≈ ${fmt.num(lb, 2)}`, c.d, 'right', size - 1, ka * k.labels);
        label(x0p - 9, y1p + (lb < 1 || atE ? -12 : 12), atE ? 'f(0) = f′(0) = 1' : 'f(0) = 1', c.f, 'right', size - 1, ka * k.labels);
      }

      // Griff (1 | b)
      const hx = plot.px(1);
      const hy = plot.py(b);
      if (pulse > 0 && inside(r, hx, hy)) {
        g.save();
        g.globalAlpha = 0.5 * pulse;
        g.strokeStyle = c.B;
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(hx, hy, 8 + (1 - pulse) * 26, 0, TAU);
        g.stroke();
        g.restore();
      }
      label(hx - 12, hy - 4, `(1 | ${hidden() && !atE ? 'b' : bTxt(b)})`, c.B, 'right', size - 0.5, k.labels * ka);

      // Namen
      const placed: Rect[] = [];
      const lf = curveLabel(f, atE ? `f = f′` : `f(x) = ${hidden() && !atE ? 'b' : bTxt(b)}^{x}`, c.f, k.labels, -1);
      if (lf) placed.push(lf);
      if (!atE || close < 0.99) curveLabel(d, 'f′', c.d, k.labels * (1 - close), 1, placed);

      // Aussage oben bzw. unten
      const top = r.y + r.h - 28;
      const src = atE
        ? tt(`b = ${EU}:  \\c{d}{f′(x)} = \\c{f}{f(x)}`, `b = ${EU}:  \\c{d}{f′(x)} = \\c{f}{f(x)}`)
        : hidden()
          ? `\\c{d}{f′(x)} = ln b · \\c{f}{f(x)}`
          : `\\c{d}{f′(x)} = ln ${bTxt(b)} · \\c{f}{f(x)} ≈ ${fmt.num(lb, 3)} · \\c{f}{f(x)}`;
      pill(r.x + r.w / 2, top, src, { border: atE ? mixColor(c.f, c.d, 0.5) : undefined, size: size + (atE ? 1 : 0), alpha: k.labels, maxW: r.w - 40, glow: atE ? 0.5 + pulse : 0 });
    }

    /* ---------- Ansicht „Tangente“ ---------- */

    function drawTangent(k: K): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const size = textSize();
      const f = Math.exp;
      const x0 = X.v;
      const y0 = Math.exp(x0);
      const inv = INV.v;
      const { xMin, xMax } = plot.bounds;

      // Asymptote y = 0
      const yAx = plot.py(0);
      label(r.x + 10, yAx - 13, tt('Asymptote y = 0', 'asymptote y = 0'), th().muted, 'left', size - 1.5, k.labels * 0.9);

      // Umkehrfunktion: Spiegelachse y = x
      if (inv > 0.001) {
        g.save();
        g.globalAlpha = 0.7 * clamp01(inv * 2);
        g.strokeStyle = th().muted;
        g.lineWidth = 1.6;
        g.setLineDash([7, 6]);
        g.beginPath();
        g.moveTo(plot.px(xMin), plot.py(xMin));
        g.lineTo(plot.px(xMax), plot.py(xMax));
        g.stroke();
        g.restore();
      }

      // Steigungsdreieck N(x₀ − 1 | 0), F(x₀ | 0), P
      const ka = clamp01(k.pts * 1.3);
      const P: Pt = [plot.px(x0), plot.py(y0)];
      const N: Pt = [plot.px(x0 - 1), yAx];
      const F: Pt = [plot.px(x0), yAx];
      if (ka > 0) {
        g.save();
        g.globalAlpha = ka;
        g.fillStyle = mixColor(c.tan, th().bg, 0, th().dark ? 0.24 : 0.15);
        g.beginPath();
        g.moveTo(N[0], N[1]);
        g.lineTo(F[0], F[1]);
        g.lineTo(P[0], P[1]);
        g.closePath();
        g.fill();
        g.restore();
        // Höhe = Funktionswert (gestrichelt, Farbe von f)
        g.save();
        g.globalAlpha = ka;
        g.strokeStyle = c.f;
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(F[0], F[1]);
        g.lineTo(P[0], P[1]);
        g.stroke();
        // Grundseite 1
        g.strokeStyle = c.tan;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(N[0], N[1]);
        g.lineTo(F[0], F[1]);
        g.stroke();
        // rechter Winkel
        const s = Math.min(9, Math.abs(F[1] - P[1]) * 0.4);
        if (s > 3) {
          g.lineWidth = 1.3;
          g.strokeStyle = th().muted;
          g.strokeRect(F[0] - s, F[1] - s, s, s);
        }
        g.restore();
      }
      // Tangente
      const tl = (x: number) => y0 * (x - x0 + 1);
      stroke(
        [
          [plot.px(xMin), plot.py(tl(xMin))],
          [plot.px(xMax), plot.py(tl(xMax))],
        ],
        c.tan,
        2.6,
        { alpha: 0.95 * ka },
      );

      // Graph von f und (gespiegelt) ln
      const fp = path(f, k.graph);
      if (inv > 0.001) {
        // Jeder Punkt wandert zu seinem Spiegelpunkt an y = x
        const m = ease.inOutCubic(inv);
        const pts: Pt[] = [];
        const n = 360;
        for (let i = 0; i <= n; i++) {
          const x = -7 + (10 * i) / n;
          const y = Math.exp(x);
          const wx = lerp(x, y, m);
          const wy = lerp(y, x, m);
          pts.push([plot.px(wx), Math.max(r.y - r.h, Math.min(r.y + r.h * 2, plot.py(wy)))]);
        }
        stroke(pts, mixColor(c.f, c.ln, m), 3.2, { glow: true, alpha: clamp01(inv * 3) });
        if (m > 0.6) {
          const xl = Math.min(xMax - 0.6, 6.2);
          label(plot.px(xl), plot.py(Math.log(xl)) + 18, `g(x) = ln x`, c.ln, 'center', size + 1, (m - 0.6) / 0.4);
          label(plot.px(xMax - 0.4), plot.py(xMax - 0.4) - 4, 'y = x', th().muted, 'right', size - 1, (m - 0.6) / 0.4);
        }
        // P′(e^x₀ | x₀)
        const Pm: Pt = [plot.px(lerp(x0, y0, m)), plot.py(lerp(y0, x0, m))];
        if (m > 0.05 && inside(r, Pm[0], Pm[1])) {
          g.save();
          g.globalAlpha = m * 0.7;
          g.strokeStyle = c.ln;
          g.lineWidth = 1.4;
          g.setLineDash([4, 4]);
          g.beginPath();
          g.moveTo(P[0], P[1]);
          g.lineTo(plot.px(y0), plot.py(x0));
          g.stroke();
          g.restore();
          dot(Pm[0], Pm[1], c.ln, 5.5);
          if (m > 0.8) label(Pm[0] + 10, Pm[1] + 14, hidden() ? "P'" : `P'${fmt.point(Math.round(y0 * 100) / 100, Math.round(x0 * 100) / 100)}`, c.ln, 'left', size - 1, (m - 0.8) / 0.2);
        }
      }
      stroke(fp, c.f, 3.4, { glow: true });

      // Punkte und Beschriftungen
      if (ka > 0) {
        const one = plot.py(1);
        dot(plot.px(0), one, th().text, 3.8 * ka);
        if (Math.abs(x0) > 0.35 || Math.abs(y0 - 1) > 0.5) label(plot.px(0) - 8, one - 11, '(0 | 1)', th().muted, 'right', size - 1.5, ka * k.labels);
        dot(N[0], N[1], c.tan, 5 * ease.outBack(ka));
        const nTxt0 = hidden() ? 'N' : `N(${fmt.num(Math.round((x0 - 1) * 100) / 100)} | 0)`;
        label(N[0] - 8, N[1] - 14, nTxt0, c.tan, 'right', size - 1, ka * k.labels);
        label((N[0] + F[0]) / 2, N[1] + 14, '1', c.tan, 'center', size, ka * k.labels);
        // Höhe = f(x₀)
        const hTxt = hidden() ? `f(x_{0})` : `f(x_{0}) ≈ ${fmt.num(y0, 2)}`;
        const tall = F[1] - P[1] > 34;
        label(F[0] + 9, tall ? (F[1] + P[1]) / 2 : P[1] - 16, hTxt, c.f, 'left', size - 0.5, ka * k.labels);
        label(P[0] - 12, P[1] - 15, hidden() ? 'P' : `P(${fmt.num(Math.round(x0 * 100) / 100)} | ${fmt.num(y0, 2)})`, c.P, 'right', size, ka * k.labels);
      }
      curveLabel(f, `f(x) = ${EU}^{x}`, c.f, k.labels, -1, []);

      // Merksatz-Pille oben links
      const src = hidden() ? `m = \\c{d}{f′(x_{0})} = \\c{f}{f(x_{0})}` : `m = \\c{d}{f′(x_{0})} = \\c{f}{f(x_{0})} ≈ ${fmt.num(y0, 3)}`;
      const box = fit(src, r.w - 40, size, th().text, 700);
      pill(r.x + 18 + Math.min(box.w, r.w - 40) / 2 + 2, r.y + 24, src, { border: c.tan, size, alpha: k.labels, maxW: r.w - 40 });
    }

    /* ---------- Ansicht „e entsteht“ ---------- */

    function stairValue(t: number, now: number): number {
      const e = reduced() ? 1 : ease.inOutCubic(clamp01((now - nT0) / N_DUR));
      if (e >= 1) return balanceAt(nTo, t);
      return lerp(balanceAt(nFrom, t), balanceAt(nTo, t), e);
    }

    function drawLimit(now: number, k: K): void {
      const g = surface.g;
      const c = C();
      const r = cplot.rect;
      const size = textSize();
      const morphing = now - nT0 < N_DUR && !reduced();
      const n = nTo;
      const reveal = k.graph;
      const tEnd = reveal;
      const x0 = cplot.px(0);
      const y1p = cplot.py(1);

      // e-Linie und stetige Verzinsung eᵗ
      const ye = cplot.py(E);
      g.save();
      g.globalAlpha = 0.9 * k.labels;
      g.strokeStyle = c.lim;
      g.lineWidth = 1.8;
      g.setLineDash([8, 6]);
      g.beginPath();
      g.moveTo(cplot.px(0), ye);
      g.lineTo(cplot.px(1.02), ye);
      g.stroke();
      g.restore();
      const cont: Pt[] = [];
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * tEnd;
        cont.push([cplot.px(t), cplot.py(Math.exp(t))]);
      }
      stroke(cont, c.lim, 2.2, { dash: [3, 5], alpha: 0.9 });

      // Treppe (Kontostand) mit Fläche
      const steps = Math.max(2, Math.ceil(r.w * 1.5));
      const pts: Pt[] = [];
      let prevY = stairValue(0, now);
      pts.push([x0, cplot.py(prevY)]);
      for (let i = 1; i <= steps; i++) {
        const t = (i / steps) * tEnd;
        const y = stairValue(Math.min(1, t), now);
        const px = cplot.px(t);
        if (Math.abs(y - prevY) > 1e-12) pts.push([px, cplot.py(prevY)]);
        pts.push([px, cplot.py(y)]);
        prevY = y;
      }
      const base = cplot.py(cplot.bounds.yMin);
      g.save();
      const grad = g.createLinearGradient(0, cplot.py(E), 0, base);
      grad.addColorStop(0, mixColor(c.f, th().bg, 0, th().dark ? 0.42 : 0.3));
      grad.addColorStop(1, mixColor(c.f, th().bg, 0, th().dark ? 0.1 : 0.06));
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(x0, base);
      pts.forEach(([x, y]) => g.lineTo(x, y));
      g.lineTo(pts[pts.length - 1]![0], base);
      g.closePath();
      g.fill();
      g.restore();

      // Säulen trennen und Zinsen (Sprünge) hervorheben, solange man sie einzeln sieht
      const colW = (cplot.px(1) - x0) / n;
      const sep = clamp01((colW - 4) / 10) * (morphing ? 0 : 1);
      if (sep > 0 && n <= 200) {
        g.save();
        g.globalAlpha = sep;
        for (let kk = 1; kk <= n; kk++) {
          const t = kk / n;
          if (t > tEnd + 1e-9) break;
          const px = cplot.px(t);
          const yLo = cplot.py(balanceAt(n, (kk - 1) / n));
          const yHi = cplot.py(balanceAt(n, t));
          g.strokeStyle = th().bg;
          g.lineWidth = Math.min(2, colW * 0.12);
          g.beginPath();
          g.moveTo(px, base);
          g.lineTo(px, yLo);
          g.stroke();
          // Zinsen am Ende der Periode
          g.strokeStyle = c.interest;
          g.lineWidth = Math.max(2, Math.min(4, colW * 0.18));
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(px, yLo);
          g.lineTo(px, yHi);
          g.stroke();
        }
        g.restore();
      }
      stroke(pts, c.f, 2.6, { glow: true });

      // Startwert 1 €
      dot(x0, y1p, c.f, 4.5 * k.pts);
      label(x0 + 10, y1p + 14, '1 €', c.f, 'left', size - 1, k.labels);

      // Linienbeschriftungen
      label(cplot.px(1) + 8, ye - 12, hidden() ? EU : `${EU} ≈ ${fmt.num(E, 5)}`, c.lim, 'left', size - 0.5, k.labels);
      const tc = 0.55;
      label(cplot.px(tc) - 6, cplot.py(Math.exp(tc)) - 16, `${EU}^{t}`, c.lim, 'right', size, k.labels);

      // Endwert nach einem Jahr (zählt mit)
      if (reveal > 0.98) {
        const an = AN.v;
        const ey = cplot.py(stairValue(1, now));
        const ex = cplot.px(1);
        dot(ex, ey, c.f, 6 * ease.outBack(k.pts));
        const dec = n >= 1000 ? 5 : 4;
        label(ex + 9, ey + 13, hidden() ? '?' : `${fmt.fixed(an, dec)} €`, c.f, 'left', size, k.labels);
      }
      // Erklärung der Säulen
      if (sep > 0.5 && n <= 60) {
        label(r.x + 54, r.y + 22, tt(`\\c{i}{▮} Zinsen am Ende jeder Periode`, `\\c{i}{▮} interest at the end of each period`), th().muted, 'left', size - 1.5, k.labels * sep);
      }
      // Kopfzeile
      const per = periodTxt(periodOf(n));
      const nShown = Math.round(10 ** LOGN.v);
      const head = `n = ${nTxt(nShown)}${per && !morphing ? ` (${per})` : ''}:  (1 + \\f{1}{n})^{n}`;
      pill(r.x + r.w / 2 + (wide() ? 10 : 0), r.y + r.h - 64, head, { size: size + 0.5, alpha: k.labels, border: c.f, maxW: r.w - 30 });
    }

    /* ---------- Karten ---------- */

    function cardFrame(r: Rect, alpha: number, glow = 0, glowColor?: string): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = glow > 0 && glowColor ? mixColor(glowColor, th().bg, 0, 0.5 * glow) : th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14 + glow * 10;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.97)';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = glow > 0 && glowColor ? mixColor(th().dark ? '#273142' : '#e3e8ef', glowColor, glow) : th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1 + glow;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      g.restore();
    }

    const cardPad = () => (wide() ? 13 : 10);

    /** Titel einer Karte (mit optionalem Chip rechts); gibt die y-Position darunter zurück. */
    function cardTitle(r: Rect, title: string, size: number, chip?: { text: string; color: string; alpha: number }): number {
      const g = surface.g;
      const pad = cardPad();
      const tb = fit(title, r.w - 2 * pad - (chip ? 90 : 0), size - 0.5, th().muted, 700);
      tb.draw(g, r.x + pad, r.y + pad + tb.asc);
      if (chip && chip.alpha > 0.01) {
        const cb = fit(chip.text, 110, size - 1.5, chip.color, 700);
        const cw = cb.w + 24;
        const cx = r.x + r.w - pad - cw;
        const ch = tb.asc + tb.desc + 6;
        const cy = r.y + pad - 3;
        g.save();
        g.globalAlpha *= chip.alpha;
        g.fillStyle = mixColor(chip.color, th().bg, 0, th().dark ? 0.24 : 0.13);
        roundRect(g, cx, cy, cw, ch, 9);
        g.fill();
        g.fillStyle = chip.color;
        g.beginPath();
        g.arc(cx + 9, cy + ch / 2, 3.5, 0, TAU);
        g.fill();
        cb.draw(g, cx + 17, cy + ch / 2 + (cb.asc - cb.desc) / 2);
        g.restore();
      }
      return r.y + pad + tb.asc + tb.desc + 8;
    }

    interface Line {
      src: string;
      color?: string;
      weight?: number;
      scale?: number;
      bullet?: string;
    }

    /** Zeilen gleichmäßig in einer Karte verteilen (verkleinert, wenn nötig). */
    function cardLines(r: Rect, y: number, lines: Line[], size: number, stagger: number, change: number): void {
      const g = surface.g;
      const pad = cardPad();
      const avail = r.y + r.h - pad - y;
      const need = lines.reduce((s, l) => s + size * (l.scale ?? 1) * 1.45, 0);
      const k = need > avail ? avail / need : 1;
      const spare = Math.max(0, avail - need);
      const extra = Math.min(size * 0.6, spare / Math.max(1, lines.length));
      lines.forEach((ln, i) => {
        const s = Math.max(10, size * (ln.scale ?? 1) * Math.min(1, k + 0.08));
        const lh = s * 1.45 * Math.min(1, k) + extra;
        const aa = clamp01(stagger * (lines.length + 2) - i) * clamp01(change * 2.4 - i * 0.12);
        g.save();
        g.globalAlpha *= 0.25 + 0.75 * ease.outCubic(aa);
        const off = (1 - ease.outCubic(aa)) * 8;
        const bw = ln.bullet ? 15 : 0;
        if (ln.bullet) {
          g.fillStyle = ln.bullet;
          roundRect(g, r.x + pad + off, y + lh / 2 - 4.5, 9, 9, 2.5);
          g.fill();
        }
        const box = fit(ln.src, r.w - 2 * pad - bw, s, ln.color ?? th().text, ln.weight ?? 600);
        box.draw(g, r.x + pad + bw + off, y + lh / 2 + (box.asc - box.desc) / 2);
        g.restore();
        y += lh;
      });
    }

    /** Karte „Verhältnis“: Formeln und Skala für ln b mit der Marke e. */
    function drawRatioCard(r: Rect, size: number, alpha: number, stagger: number, now: number): void {
      const g = surface.g;
      const c = C();
      const pad = cardPad();
      const b = B.v;
      const lb = Math.log(b);
      const close = clamp01(1 - Math.abs(b - E) / 0.08);
      const atE = Math.abs(b - E) < 2e-3;
      const pulse = reduced() ? 0 : clamp01(1 - (now - snapT0) / 1100);
      const change = clamp01((now - cardT0) / 420);
      cardFrame(r, alpha, atE ? 0.6 + pulse * 0.4 : 0, mixColor(c.f, c.d, 0.5));
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      let y = cardTitle(r, tt('Steigung und Funktionswert', 'Slope and function value'), size, { text: `b = ${EU}`, color: mixColor(c.f, c.d, 0.5), alpha: close });
      const bS = hidden() && !atE ? 'b' : bTxt(b);
      // Formeln
      const f1 = `\\c{f}{f(x) = ${bS}^{x}}`;
      const f2 = atE ? `\\c{d}{f′(x) = ${EU}^{x} = f(x)}` : `\\c{d}{f′(x) = ln ${bS} · ${bS}^{x}}`;
      const fb1 = fit(f1, r.w - 2 * pad, size + 2, th().text, 700);
      fb1.draw(g, r.x + pad, y + fb1.asc);
      y += fb1.asc + fb1.desc + 6;
      const fb2 = fit(f2, r.w - 2 * pad, size + 2, th().text, 700);
      fb2.draw(g, r.x + pad, y + fb2.asc);
      y += fb2.asc + fb2.desc + 10;

      // Skala: Lage von ln b (= f′(x) : f(x)) zwischen ln 1,5 und ln 4
      const avail = r.y + r.h - pad - y;
      const scaleH = Math.min(78, Math.max(56, avail - size * 3.2));
      const sx0 = r.x + pad + 8;
      const sx1 = r.x + r.w - pad - 8;
      const l0 = Math.log(B_MIN);
      const l1 = Math.log(B_MAX);
      const sxOf = (l: number) => sx0 + ((l - l0) / (l1 - l0)) * (sx1 - sx0);
      const ly = y + scaleH * 0.52;
      g.save();
      // Band
      const grad = g.createLinearGradient(sx0, 0, sx1, 0);
      grad.addColorStop(0, mixColor(c.f, th().bg, 0, 0.35));
      grad.addColorStop((1 - l0) / (l1 - l0), mixColor(mixColor(c.f, c.d, 0.5), th().bg, 0, 0.6));
      grad.addColorStop(1, mixColor(c.d, th().bg, 0, 0.35));
      g.fillStyle = grad;
      roundRect(g, sx0, ly - 4, sx1 - sx0, 8, 4);
      g.fill();
      g.restore();
      const ticks: [number, string][] = [
        [1.5, fmt.num(1.5)],
        [2, '2'],
        [E, EU],
        [3, '3'],
        [4, '4'],
      ];
      for (const [tb, txt] of ticks) {
        const xx = sxOf(Math.log(tb));
        const isEt = tb === E;
        g.strokeStyle = isEt ? th().text : th().muted;
        g.lineWidth = isEt ? 2 : 1.2;
        g.beginPath();
        g.moveTo(xx, ly - (isEt ? 9 : 6));
        g.lineTo(xx, ly + (isEt ? 9 : 6));
        g.stroke();
        const top = fit(txt, 40, size - 1.5, isEt ? th().text : th().muted, isEt ? 800 : 600);
        top.draw(g, xx - top.w / 2, ly - 13);
        const bot = fit(isEt ? '1' : fmt.num(Math.log(tb), 2), 50, size - 2, isEt ? th().text : th().muted, isEt ? 800 : 600);
        bot.draw(g, xx - bot.w / 2, ly + 13 + bot.asc);
      }
      const lt = fit('b', 20, size - 1.5, th().muted, 600);
      lt.draw(g, sx0 - 4 - lt.w, ly - 13);
      // Marke
      const mx = sxOf(Math.max(l0, Math.min(l1, lb)));
      const mcol = atE ? mixColor(c.f, c.d, 0.5) : c.d;
      g.save();
      g.shadowColor = mixColor(mcol, th().bg, 0, 0.6);
      g.shadowBlur = 8 + pulse * 10;
      g.fillStyle = mcol;
      g.beginPath();
      g.arc(mx, ly, 7 + pulse * 3, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(mx, ly, 7 + pulse * 3, 0, TAU);
      g.stroke();
      y += scaleH;

      // Aussage
      const lines: Line[] = atE
        ? [
            { src: `\\c{d}{f′(x)} : \\c{f}{f(x)} = ln ${EU} = 1`, weight: 800 },
            { src: tt('Die Funktion ist ihre eigene Ableitung.', 'The function is its own derivative.'), color: th().muted },
          ]
        : [
            { src: `\\c{d}{f′(x)} : \\c{f}{f(x)} = ln ${bS}${hidden() ? '' : ` ≈ ${fmt.num(lb, 3)}`}`, weight: 700 },
            { src: tt(`für jedes x gleich, ${lb < 1 ? 'kleiner' : 'größer'} als 1`, `the same for every x, ${lb < 1 ? 'less' : 'greater'} than 1`), color: th().muted },
          ];
      cardLines(r, y, lines, size, stagger, change);
      g.restore();
    }

    /** Karte „Wertetabelle“: f, f′ (numerisch) und Verhältnis für einige x. */
    function drawValueTable(r: Rect, size: number, alpha: number): void {
      const g = surface.g;
      const c = C();
      const pad = cardPad();
      const b = B.v;
      const atE = Math.abs(b - E) < 2e-3;
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const top = cardTitle(r, tt('Wertetabelle (f′ über Differenzenquotient)', 'Table of values (f′ from difference quotient)'), size);
      const xs = [-1, 0, 1, 2];
      const inner = r.w - 2 * pad;
      const rows = xs.length + 1;
      const lh = Math.min(size * 1.9, (r.y + r.h - pad - top) / rows);
      const colR = [0.16, 0.44, 0.72, 1].map((q) => r.x + pad + inner * q);
      const head = ['x', '\\c{f}{f(x)}', '\\c{d}{f′(x)}', '\\c{d}{f′}:\\c{f}{f}'];
      head.forEach((h, j) => {
        const bx = fit(h, inner * 0.27, size - 0.5, th().muted, 700);
        bx.draw(g, colR[j]! - bx.w, top + lh / 2 + (bx.asc - bx.desc) / 2);
      });
      g.strokeStyle = th().dark ? '#2c3648' : '#e3e8ef';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + pad, Math.round(top + lh) + 0.5);
      g.lineTo(r.x + r.w - pad, Math.round(top + lh) + 0.5);
      g.stroke();
      const f = (x: number) => b ** x;
      // Spalte „Verhältnis“ hervorheben: überall derselbe Wert
      g.fillStyle = mixColor(atE ? mixColor(c.f, c.d, 0.5) : c.d, th().bg, 0, th().dark ? 0.16 : 0.09);
      roundRect(g, colR[2]! + 6, top + lh + 3, colR[3]! - colR[2]! - 2, lh * xs.length - 6, 7);
      g.fill();
      xs.forEach((x, i) => {
        const yy = top + lh * (i + 1) + lh / 2;
        const fv = f(x);
        const dv = centralDiff(f, x, 1e-4);
        const cells = [fmt.num(x), Q(fmt.num(fv, 3)), Q(fmt.num(dv, 3)), Q(fmt.num(dv / fv, 3))];
        cells.forEach((s, j) => {
          const col = j === 0 ? th().text : j === 1 ? c.f : j === 2 ? c.d : th().text;
          const bx = fit(s, inner * 0.27, size, col, j === 3 ? 800 : 600);
          bx.draw(g, colR[j]! - bx.w, yy + (bx.asc - bx.desc) / 2);
        });
      });
      g.restore();
    }

    /** Karte „Tangente in P“ */
    function drawTangentCard(r: Rect, size: number, alpha: number, stagger: number, now: number): void {
      const g = surface.g;
      const c = C();
      const x0 = X.v;
      const y0 = Math.exp(x0);
      const change = clamp01((now - cardT0) / 420);
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const y = cardTitle(r, tt('Tangente in P', 'Tangent at P'), size);
      const xs = fmt.num(Math.round(x0 * 100) / 100);
      const m = Q(fmt.num(y0, 3));
      const cc = y0 * (1 - x0);
      const tline = Math.abs(cc) < 5e-4 ? `y ≈ ${m} · x` : `y ≈ ${m} · x ${cc < 0 ? '−' : '+'} ${Q(fmt.num(Math.abs(cc), 3))}`;
      const lines: Line[] = [
        { src: `\\c{t}{t: y = ${EU}^{x_{0}} · (x − x_{0} + 1)}`, weight: 700, scale: 1.05 },
        { src: `x_{0} = ${xs}:  ${tline}`, scale: 1 },
        { src: `\\c{t}{m} = \\c{d}{f′(x_{0})} = \\c{f}{f(x_{0})} ≈ ${m}`, bullet: c.f },
        { src: tt(`Nullstelle der Tangente: x_{0} − 1 = ${Q(fmt.num(Math.round((x0 - 1) * 100) / 100))}`, `zero of the tangent: x_{0} − 1 = ${Q(fmt.num(Math.round((x0 - 1) * 100) / 100))}`), bullet: c.tan },
        { src: tt('Grundseite 1, Höhe f(x_{0}): Steigung = f(x_{0})', 'base 1, height f(x_{0}): slope = f(x_{0})'), color: th().muted },
      ];
      cardLines(r, y, lines, size, stagger, change);
      g.restore();
    }

    /** Karte „Steckbrief von eˣ“ */
    function drawPropsCard(r: Rect, size: number, alpha: number, stagger: number, now: number): void {
      const g = surface.g;
      const c = C();
      const change = clamp01((now - cardT0) / 420);
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const y = cardTitle(r, tt(`Steckbrief von f(x) = ${EU}^{x}`, `Key features of f(x) = ${EU}^{x}`), size);
      const R = '\\t{ℝ}';
      const lines: Line[] = [
        { src: `D = ${R},   W = ${R}^{+}`, weight: 700 },
        { src: tt(`Asymptote y = 0 für x → −∞; keine Nullstelle`, `asymptote y = 0 as x → −∞; no zero`) },
        { src: tt(`Schnittpunkt mit der y-Achse (0 | 1)`, `y-intercept (0 | 1)`) },
        { src: tt(`streng monoton steigend, linksgekrümmt`, `strictly increasing, convex`) },
        { src: `\\c{d}{f′(x)} = \\c{f}{${EU}^{x}}  ${tt('(eigene Ableitung)', '(its own derivative)')}`, bullet: c.d },
        { src: tt(`Stammfunktion F(x) = ${EU}^{x} + C`, `antiderivative F(x) = ${EU}^{x} + C`) },
        { src: tt(`Umkehrfunktion ln x:  ln(${EU}^{x}) = x`, `inverse function ln x:  ln(${EU}^{x}) = x`), bullet: c.ln },
      ];
      cardLines(r, y, lines, size - 0.5, stagger, change);
      g.restore();
    }

    /** Karte „Folge (1 + 1/n)ⁿ“ mit logarithmischer n-Achse. */
    function drawSeqCard(r: Rect, size: number, alpha: number, k: K): void {
      const g = surface.g;
      const c = C();
      const pad = cardPad();
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const top = cardTitle(r, tt('Folge (1 + \\f{1}{n})^{n}', 'Sequence (1 + \\f{1}{n})^{n}'), size);
      const ch: Rect = { x: r.x + pad + 34, y: top + 6, w: r.w - 2 * pad - 40, h: r.y + r.h - pad - 22 - top - 6 };
      const yLo = 1.9;
      const yHi = 2.8;
      const X_ = (l: number) => ch.x + (l / 6) * ch.w;
      const Y_ = (v: number) => ch.y + ch.h - ((v - yLo) / (yHi - yLo)) * ch.h;
      // Gitter und Achsen
      g.lineWidth = 1;
      for (const v of [2, 2.25, 2.5]) {
        g.strokeStyle = th().gridMinor;
        g.beginPath();
        g.moveTo(ch.x, Math.round(Y_(v)) + 0.5);
        g.lineTo(ch.x + ch.w, Math.round(Y_(v)) + 0.5);
        g.stroke();
        const bx = fit(fmt.num(v), 32, size - 2.5, th().muted, 600);
        bx.draw(g, ch.x - 6 - bx.w, Y_(v) + (bx.asc - bx.desc) / 2);
      }
      for (let l = 0; l <= 6; l++) {
        g.strokeStyle = th().gridMinor;
        g.beginPath();
        g.moveTo(Math.round(X_(l)) + 0.5, ch.y);
        g.lineTo(Math.round(X_(l)) + 0.5, ch.y + ch.h);
        g.stroke();
        const txt = l === 0 ? '1' : l === 1 ? '10' : l === 2 ? '100' : `10^{${l}}`;
        const bx = fit(txt, 40, size - 2.5, th().muted, 600);
        bx.draw(g, X_(l) - bx.w / 2, ch.y + ch.h + 6 + bx.asc);
      }
      const nl = fit('n', 20, size - 1.5, th().muted, 600);
      nl.draw(g, ch.x + ch.w - nl.w, ch.y + ch.h - 5);
      // e-Linie
      g.save();
      g.strokeStyle = c.lim;
      g.lineWidth = 1.8;
      g.setLineDash([7, 5]);
      g.beginPath();
      g.moveTo(ch.x, Y_(E));
      g.lineTo(ch.x + ch.w, Y_(E));
      g.stroke();
      g.restore();
      const el = fit(EU, 20, size - 0.5, c.lim, 800);
      el.draw(g, ch.x - 6 - el.w, Y_(E) + (el.asc - el.desc) / 2);
      // Punkte der Folge (bis zur aktuellen Stufe kräftig)
      const cur = LOGN.v;
      N_STEPS.forEach((nv) => {
        const l = Math.log10(nv);
        const on = l <= cur + 1e-6;
        const px = X_(l);
        const py = Y_(compound(nv));
        g.fillStyle = on ? c.f : mixColor(th().muted, th().bg, 0.4);
        g.globalAlpha = alpha * (on ? 0.9 : 0.35) * k.pts;
        g.beginPath();
        g.arc(px, py, on ? 3.3 : 2.4, 0, TAU);
        g.fill();
      });
      g.globalAlpha = alpha;
      // aktueller Punkt (gleitet weich)
      const an = AN.v;
      const px = X_(cur);
      const py = Y_(an);
      g.save();
      g.globalAlpha = alpha * 0.25;
      g.fillStyle = c.f;
      g.beginPath();
      g.arc(px, py, 11, 0, TAU);
      g.fill();
      g.restore();
      dot(px, py, c.f, 5.5 * k.pts);
      g.restore();
    }

    /** Karte „Zinseszins“ mit mitzählenden Werten. */
    function drawInterestCard(r: Rect, size: number, alpha: number, stagger: number, now: number): void {
      const g = surface.g;
      const c = C();
      const change = clamp01((now - cardT0) / 420);
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const y = cardTitle(r, tt('Zinseszins: 1 € zu 100 % pro Jahr', 'Compound interest: €1 at 100 % per year'), size);
      const n = Math.max(1, Math.round(10 ** LOGN.v));
      const nShown = nTo;
      const morph = Math.abs(LOGN.v - Math.log10(nShown)) > 1e-3;
      const nn = morph ? n : nShown;
      const per = periodTxt(periodOf(nn));
      const an = AN.v;
      const dec = nShown >= 1000 ? 6 : 4;
      const rate = 100 / nn;
      const lines: Line[] = [
        { src: `n = ${nTxt(nn)}${per && !morph ? `  (${per})` : ''}`, weight: 800, scale: 1.1 },
        { src: tt(`Zinssatz je Periode: 100 % : ${nTxt(nn)} ${approx(rate, 4)} ${fmt.num(rate, rate < 0.01 ? 6 : 4)} %`, `rate per period: 100 % ÷ ${nTxt(nn)} ${approx(rate, 4)} ${fmt.num(rate, rate < 0.01 ? 6 : 4)} %`), color: th().muted },
        { src: `\\c{f}{(1 + \\f{1}{n})^{n} ≈ ${Q(fmt.fixed(an, dec))} €}`, weight: 800, scale: 1.15 },
        { src: tt(`Abstand zu ${EU}: ${Q(fmt.num(Math.max(0, E - an), E - an < 1e-4 ? 7 : 4))}`, `distance from ${EU}: ${Q(fmt.num(Math.max(0, E - an), E - an < 1e-4 ? 7 : 4))}`), bullet: c.lim },
        { src: tt(`n → ∞:  (1 + \\f{1}{n})^{n} → ${EU}`, `n → ∞:  (1 + \\f{1}{n})^{n} → ${EU}`), color: th().muted },
      ];
      cardLines(r, y, lines, size, stagger, change);
      g.restore();
    }

    /* ---------- Bild ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      if (findTl) {
        const tv = timelineValue(findTl, now);
        B.jump(tv.v);
        anim = true;
        if (tv.done) findTl = null;
      } else anim = B.step(now, dt) || anim;
      if (rideTl) {
        const tv = timelineValue(rideTl, now);
        X.jump(tv.v);
        anim = true;
        if (tv.done) rideTl = null;
      } else anim = X.step(now, dt) || anim;
      anim = INV.step(now, dt) || anim;
      anim = AN.step(now, dt) || anim;
      anim = LOGN.step(now, dt) || anim;
      for (const ch of [RX0, RX1, RY0, RY1]) anim = ch.step(now, dt) || anim;
      if (now - nT0 < N_DUR) anim = true;
      if (now - snapT0 < 1200) anim = true;
      if (now - cardT0 < 700) anim = true;
      const viewFade = reduced() ? 1 : ease.outCubic(clamp01((now - viewT0) / 600));
      if (viewFade < 1) anim = true;

      let k: K = { graph: 1, labels: 1, pts: 1, cards: 1, stagger: 1 };
      if (intro !== null) {
        const t = now - intro;
        if (t > 2200) intro = null;
        else {
          anim = true;
          k = {
            graph: ease.inOutCubic(clamp01((t - 150) / 1200)),
            labels: ease.outCubic(clamp01((t - 800) / 700)),
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
      const v = view();
      if (v === 'limit') {
        cplot.resize();
        cplot.setRangePadded([0, 1], [0.8, 2.95], { left: 46, bottom: 34, top: 14, right: wide() ? 96 : 84 });
        cplot.begin();
        if (p.grid) cplot.grid();
        cplot.axes();
        drawLimit(now, k);
        cplot.end();
      } else {
        plot.resize();
        plot.setRange([RX0.v, RX1.v], [RY0.v, RY1.v]);
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();
        if (v === 'base') drawBase(now, k);
        else drawTangent(k);
        plot.end();
      }

      // Karten
      const col = regions().col;
      const gap = 10;
      const size = textSize() + 0.5;
      const slide = (1 - k.cards) * 14;
      const ca = k.cards;
      const split = v === 'base' ? 0.56 : v === 'tangent' ? 0.47 : 0.52;
      const h1 = Math.round((col.h - gap) * split);
      const r1: Rect = { x: col.x + slide, y: col.y, w: col.w, h: h1 };
      const r2: Rect = { x: col.x + slide, y: col.y + h1 + gap, w: col.w, h: col.h - h1 - gap };
      const cs = Math.min(size, wide() ? size : size - 0.5);
      if (v === 'base') {
        drawRatioCard(r1, cs, ca, k.stagger, now);
        drawValueTable(r2, cs, ca);
      } else if (v === 'tangent') {
        drawTangentCard(r1, cs, ca, k.stagger, now);
        drawPropsCard(r2, cs, ca, k.stagger, now);
      } else {
        drawSeqCard(r1, cs, ca, k);
        drawInterestCard(r2, cs, ca, k.stagger, now);
      }
      if (anim) ctx.requestRender();
    }

    /* ---------- Aktionen ---------- */

    function stopActions(): void {
      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = null;
      if (findTl) {
        findTl = null;
        B.jump(snapBase(p.b));
      }
      if (rideTl) {
        rideTl = null;
        X.jump(p.x0);
      }
      stopTour();
    }
    function stopTour(): void {
      if (tourTimer) clearTimeout(tourTimer);
      tourTimer = null;
      syncActions();
    }
    function tourStep(next: number): void {
      tourTimer = null;
      if (next > NS_MAX) {
        syncActions();
        return;
      }
      ctx.set({ ns: next });
      tourTimer = setTimeout(() => tourStep(next + 1), next < 9 ? 900 : 620);
      syncActions();
    }

    function retarget(now: number, instant: boolean): void {
      const rg = rangeOf(view(), p.inv);
      [RX0, RX1, RY0, RY1].forEach((ch, i) => (instant ? ch.jump(rg[i]!) : ch.glide(rg[i]!, 800, 0, now)));
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = reduced() || source === 'init';
        const user = source === 'input' || source === 'replace';
        if (user && (changed.has('view') || changed.has('b') || changed.has('x0') || (changed.has('ns') && source === 'replace'))) {
          if (actionTimer) clearTimeout(actionTimer);
          actionTimer = null;
          findTl = null;
          rideTl = null;
        }
        if (user && (changed.has('view') || changed.has('ns'))) stopTour();
        if (changed.has('b')) {
          const target = snapBase(p.b);
          const wasE = Math.abs(B.goal - E) < 1e-9;
          if (target === E && (!wasE || source === 'replace')) snapT0 = now;
          if (instant) B.jump(target);
          else if (source === 'replace') B.glide(target, 800, 80, now);
          else if (!findTl) B.follow(target, dragging() ? 0.05 : target === E ? 0.12 : 0.18);
          cardT0 = instant ? -Infinity : Math.max(cardT0, now - 300);
        }
        if (changed.has('x0') && !rideTl) {
          if (instant) X.jump(p.x0);
          else if (source === 'replace') X.glide(p.x0, 800, 80, now);
          else X.follow(p.x0, dragging() ? 0.04 : 0.18);
        }
        if (changed.has('inv')) {
          if (instant) INV.jump(p.inv ? 1 : 0);
          else INV.glide(p.inv ? 1 : 0, 1300, p.inv ? 350 : 0, now);
          retarget(now, instant);
        }
        if (changed.has('ns')) {
          const n = nAt(p.ns);
          if (instant) {
            nFrom = n;
            nTo = n;
            nT0 = -Infinity;
            AN.jump(compound(n));
            LOGN.jump(Math.log10(n));
          } else {
            // aktuellen Zwischenstand als Start nehmen
            nFrom = nTo;
            nTo = n;
            nT0 = now;
            AN.glide(compound(n), N_DUR, 0, now);
            LOGN.glide(Math.log10(n), N_DUR, 0, now);
          }
        }
        if (changed.has('view')) {
          retarget(now, true);
          if (source !== 'init') {
            viewT0 = instant ? -Infinity : now;
            cardT0 = instant ? -Infinity : now;
          }
        }
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'find') {
          stopActions();
          const legs = [
            { to: B_MIN, dur: 900 },
            { to: B_MAX, dur: 4200 },
            { to: E, dur: 1700 },
          ];
          if (reduced()) {
            ctx.set({ b: 2.72 });
            return;
          }
          findTl = { t0: now, from: B.v, legs };
          actionTimer = setTimeout(() => {
            actionTimer = null;
            findTl = null;
            B.jump(E);
            snapT0 = performance.now();
            if (p.b === 2.72) {
              updateReadouts();
              ctx.requestRender();
            } else ctx.set({ b: 2.72 });
          }, timelineDur({ legs }));
        } else if (id === 'ride') {
          stopActions();
          if (reduced()) return;
          const back = p.x0;
          const legs = [
            { to: X0_MIN, dur: 1400 },
            { to: X0_MAX, dur: 5600 },
            { to: back, dur: 1500 },
          ];
          rideTl = { t0: now, from: X.v, legs };
          actionTimer = setTimeout(() => {
            actionTimer = null;
            rideTl = null;
            X.jump(p.x0);
            ctx.requestRender();
          }, timelineDur({ legs }));
        } else if (id === 'grow') {
          if (tourTimer) stopTour();
          else tourStep(0);
        }
        ctx.requestRender();
      },

      render,
      destroy: () => {
        if (tourTimer) clearTimeout(tourTimer);
        if (actionTimer) clearTimeout(actionTimer);
        surface.destroy();
      },
    };
  },
});
