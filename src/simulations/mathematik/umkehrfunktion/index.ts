import { defineSimulation, ease, formatPiFraction, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  clampA,
  foldPoint,
  footOnDiagonal,
  inDomain,
  levelHits,
  makeFn,
  mirror,
  monoPieces,
  partner,
  repeatedValues,
  sampleGraph,
  slopeTriangle,
  startA,
  stepsOf,
  valueTable,
  type DomKey,
  type Fn,
  type FnKey,
  type Interval,
  type Steps,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type View = 'mirror' | 'test' | 'deriv';
type P2 = [number, number];
const VIEWS: View[] = ['mirror', 'test', 'deriv'];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Dauer des Umklappens an y = x (ms). */
const FOLD_MS = 2800;
/** Dauer der wandernden waagrechten Geraden (ms). */
const SCAN_MS = 6200;
/** Dauer der Wanderung von P (ms). */
const WALK_MS = 7000;
/** Abstand der Schritte im Rechenweg (ms). */
const STEP_MS = 850;
/** Bereich, in dem die Graphen einmal abgetastet werden (deckt alle Bildausschnitte ab). */
const SX: P2 = [-7, 8];
const SY: P2 = [-8, 9];

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

/** Abgetastete Graphen einer Funktion (Weltkoordinaten), einmal pro Funktion berechnet. */
interface Graphs {
  /** Graph von f auf D_f */
  used: P2[][];
  /** nicht benutzter Teil des Terms (eingeschränkte Definitionsmenge) */
  unused: P2[][];
}

/**
 * Umkehrfunktionen als Spiegelung an y = x. Drei Ansichten: „Spiegeln“ (der
 * Graph klappt wie eine Folie um die Gerade y = x, P(a | b) wandert zu
 * P′(b | a), Definitions- und Wertemenge wandern als farbige Intervalle von
 * einer Achse zur anderen; dazu Rechenweg und Wertetabelle mit getauschten
 * Spalten), „Umkehrbar?“ (waagrechte Gerade wandert über den Graphen,
 * Monotonie, Einschränkung der Definitionsmenge bei x² und sin) und
 * „Ableitung“ (Tangente und Steigungsdreieck werden mitgespiegelt, die
 * Katheten tauschen: (f⁻¹)′(b) = 1 / f′(a), Sonderfall senkrechte Tangente).
 */
export default defineSimulation({
  id: 'umkehrfunktion',
  dragHint: true,
  hint: { de: 'Tipp: Zieh den Punkt P auf dem Graphen – P′ ist sein Spiegelbild an y = x.', en: 'Tip: Drag point P on the graph – P′ is its mirror image in y = x.' },
  layout: { aspect: 1.55, aspectNarrow: 0.42 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'mirror', label: L('Spiegeln an y = x', 'Reflect in y = x') },
        { value: 'test', label: L('Umkehrbar?', 'Invertible?') },
        { value: 'deriv', label: L('Ableitung von f⁻¹', 'Derivative of f⁻¹') },
      ],
      default: 'mirror',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion f', 'Function f'),
      options: [
        { value: 'lin', label: L('f(x) = 2x − 1', 'f(x) = 2x − 1') },
        { value: 'sq', label: L('f(x) = x²', 'f(x) = x²') },
        { value: 'cube', label: L('f(x) = 0,5x³', 'f(x) = 0.5x³') },
        { value: 'exp', label: L('f(x) = eˣ', 'f(x) = eˣ') },
        { value: 'hyp', label: L('f(x) = 1/x', 'f(x) = 1/x') },
        { value: 'sin', label: L('f(x) = sin x (Ausblick)', 'f(x) = sin x (outlook)') },
      ],
      default: 'sq',
    },
    {
      key: 'dom',
      type: 'choice',
      label: L('Definitionsmenge', 'Domain'),
      help: L('x²: x ≥ 0 bzw. x ≤ 0. sin: [−π/2; π/2] bzw. [π/2; 3π/2].', 'x²: x ≥ 0 or x ≤ 0. sin: [−π/2, π/2] or [π/2, 3π/2].'),
      options: [
        { value: 'pos', label: L('steigender Ast', 'increasing branch') },
        { value: 'neg', label: L('fallender Ast', 'decreasing branch') },
        { value: 'all', label: L('ganz ℝ', 'all of ℝ') },
      ],
      default: 'pos',
      visibleIf: (v) => v.fn === 'sq' || v.fn === 'sin',
    },
    {
      key: 'x',
      type: 'number',
      label: L('Stelle a von P(a | f(a))', 'Position a of P(a | f(a))'),
      help: L('Auch P oder P′ im Bild ziehen.', 'You can also drag P or P′ in the picture.'),
      min: -5,
      max: 5,
      step: 0.1,
      default: 1.5,
    },
    { key: 'inv', type: 'boolean', group: 'view', label: L('Graph von f⁻¹ zeigen', 'Show the graph of f⁻¹'), default: true },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Lösungen zeigen', 'Show solutions'),
      help: L('Aus: Term von f⁻¹, P′, Mengen und Steigungen im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: the term of f⁻¹, P′, the sets and slopes in the picture replaced by “?” (for tasks).'),
      default: true,
    },
  ],
  actions: [
    { id: 'mirror', label: L('An y = x spiegeln', 'Reflect in y = x'), primary: true },
    { id: 'steps', label: L('Rechenweg Schritt für Schritt', 'Working step by step'), visibleIf: (v) => v.view === 'mirror' },
    { id: 'scan', label: L('Waagrechte Gerade wandern lassen', 'Sweep a horizontal line'), visibleIf: (v) => v.view === 'test' },
    { id: 'walk', label: L('P entlang des Graphen wandern lassen', 'Move P along the graph'), visibleIf: (v) => v.view === 'deriv' },
  ],
  readouts: [
    { key: 'inv', label: L('Umkehrfunktion', 'Inverse function'), spoiler: true },
    { key: 'pts', label: L('Punkt und Spiegelpunkt', 'Point and image'), spoiler: true },
    { key: 'sets', label: L('Definitions- und Wertemenge', 'Domain and range'), spoiler: true },
    { key: 'test', label: L('Umkehrbar?', 'Invertible?'), spoiler: true },
    { key: 'slope', label: L('Steigungen', 'Slopes'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'sqrt', label: L('Wurzelfunktion als Umkehrung von x²', 'Square root as the inverse of x²'), values: {} },
    { id: 'lin', label: L('Gerade: f(3) = 5, also f⁻¹(5) = 3', 'Line: f(3) = 5, so f⁻¹(5) = 3'), values: { fn: 'lin', x: 3 } },
    { id: 'all', label: L('x² auf ganz ℝ: nicht umkehrbar', 'x² on all of ℝ: not invertible'), values: { view: 'test', fn: 'sq', dom: 'all', x: 2 } },
    { id: 'ln', label: L('eˣ und ln x: (ln x)′ = 1/x', 'eˣ and ln x: (ln x)′ = 1/x'), values: { view: 'deriv', fn: 'exp', x: 1 } },
    { id: 'cube', label: L('Waagrechte Tangente wird senkrecht', 'Horizontal tangent turns vertical'), values: { view: 'deriv', fn: 'cube', x: 0 } },
    { id: 'sin', label: L('Sinus einschränken: arcsin (Ausblick)', 'Restricting sine: arcsin (outlook)'), values: { view: 'test', fn: 'sin', dom: 'pos', x: 0.5 } },
  ],
  strings: {
    de: {
      canvas:
        'Koordinatensystem mit der Spiegelachse y = x, dem Graphen von f, dem Graphen der Umkehrfunktion f⁻¹ und einem ziehbaren Punkt P mit seinem Spiegelbild P′. Je nach Ansicht: Definitions- und Wertemenge als farbige Intervalle an den Achsen, eine waagrechte Gerade zum Prüfen der Umkehrbarkeit oder Tangenten mit Steigungsdreiecken in P und P′. Daneben Karten mit Rechenweg, Wertetabelle und Ableitung der Umkehrfunktion.',
    },
    en: {
      canvas:
        'Coordinate system with the mirror line y = x, the graph of f, the graph of the inverse f⁻¹ and a draggable point P with its image P′. Depending on the view: domain and range as coloured intervals on the axes, a horizontal line for checking invertibility, or tangents with slope triangles at P and P′. Next to it cards with the working, a table of values and the derivative of the inverse.',
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
    const T = (de: string, en: string) => (lang === 'de' ? de : en);
    const editable = () => !ctx.locked;
    const view = () => p.view as View;
    const key = () => p.fn as FnKey;
    const dom = () => p.dom as DomKey;
    const show = () => p.show;
    const S = (s: string) => (show() ? s : '?');
    /** Kürzel der Wertemenge: W_f (DE), R_f für „range“ (EN) */
    const WS = lang === 'en' ? 'R' : 'W';

    /* ---------- Farben ---------- */
    const col = {
      f: () => th().series[0]!,
      i: () => th().series[3]!,
      /** D_f = W_f⁻¹ und alles, was zu x-Werten von f gehört (Δx) */
      D: () => th().series[2]!,
      /** W_f = D_f⁻¹ und alles, was zu y-Werten von f gehört (Δy) */
      W: () => th().series[4]!,
      bad: () => th().series[1]!,
      line: () => th().series[5]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const eq = (v: number, d = 2) => ctx.fmt.rel(v, d);
    /** Kleine Steigungen mit mehr Stellen (sonst wäre 1 : 0,05 irreführend). */
    const NS = (v: number) => (Math.abs(v) < 0.095 && Math.abs(v) > 5e-5 ? N(v, 4) : N(v));
    /* ---------- Funktionen ---------- */
    const fnCache = new Map<string, Fn>();
    function fnOf(k: FnKey, d: DomKey): Fn {
      const id = `${k}:${k === 'sq' || k === 'sin' ? d : 'all'}`;
      let fn = fnCache.get(id);
      if (!fn) {
        fn = makeFn(k, d);
        fnCache.set(id, fn);
      }
      return fn;
    }
    const fnNow = () => fnOf(key(), dom());
    const stepCache = new Map<string, Steps>();
    function stepsNow(): Steps {
      const id = `${key()}:${dom()}`;
      let s = stepCache.get(id);
      if (!s) {
        s = stepsOf(key(), dom(), lang);
        stepCache.set(id, s);
      }
      return s;
    }
    const graphCache = new Map<Fn, Graphs>();
    function graphsOf(fn: Fn): Graphs {
      let gr = graphCache.get(fn);
      if (gr) return gr;
      const used = sampleGraph(fn.f, fn.D, SX[0], SX[1], SY[0], SY[1], 0.04) as P2[][];
      const all = sampleGraph(fn.f, fn.natural, SX[0], SX[1], SY[0], SY[1], 0.04) as P2[][];
      const unused: P2[][] = [];
      if (fn.inv === null || fn.D !== fn.natural) {
        for (const part of all) {
          let cur: P2[] = [];
          for (const pt of part) {
            if (!inDomain(fn, pt[0])) cur.push(pt);
            else {
              if (cur.length > 1) unused.push(cur);
              cur = [];
            }
          }
          if (cur.length > 1) unused.push(cur);
        }
      }
      gr = { used, unused: fn.inv === null ? [] : unused };
      graphCache.set(fn, gr);
      return gr;
    }

    /* ---------- angezeigter Zustand ---------- */
    const W0 = new Chan(fnNow().window[0]);
    const W1 = new Chan(fnNow().window[1]);
    const AX = new Chan(clampA(fnNow(), p.x));
    const mw = Object.fromEntries(VIEWS.map((v) => [v, new Chan(v === p.view ? 1 : 0)])) as Record<View, Chan>;
    const kInv = new Chan(p.inv ? 1 : 0);
    const kShow = new Chan(p.show ? 1 : 0);
    let fnFade: { from: Fn; t0: number; dur: number } | null = null;
    let morphB: { from: number; t0: number; dur: number } | null = null;
    let fold: { t0: number; dur: number } | null = null;
    let scan: { t0: number; dur: number; max: number } | null = null;
    let walk: { t0: number; dur: number; lo: number; hi: number; a0: number } | null = null;
    let steps: { t0: number } | null = null;
    let intro: number | null = null;
    let cardFade: number | null = null;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    const dragging = () => performance.now() - lastDrag < 250;
    let prevView: View = view();
    /** Stand vor der letzten Änderung (für die Überblendung beim Funktionswechsel). */
    let lastFn: Fn = fnNow();
    let lastB = lastFn.f(clampA(lastFn, p.x));

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    function cnt(id: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(id);
      if (!e) {
        e = { c: new Chan(v), at: -1 };
        nums.set(id, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (!Number.isFinite(e.c.v) || Math.abs(e.c.v - v) > 30) e.c.jump(v);
        e.c.follow(v, dragging() || walk ? 0.04 : 0.16);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { plot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.34, 232, 372));
        return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(Math.min(w, h * 0.5), 240, w));
      return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const plot = new Plot(surface, { x: [-5, 5], y: [-5, 5], pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Punkt P ---------- */
    function walkA(now: number): number | null {
      if (!walk) return null;
      const u = clamp01((now - walk.t0) / walk.dur);
      const span = walk.hi - walk.lo;
      const c0 = clamp(1 - (2 * (walk.a0 - walk.lo)) / Math.max(1e-9, span), -1, 1);
      const phi = Math.acos(c0);
      const s = ease.inOutCubic(u);
      return walk.lo + span * (0.5 - 0.5 * Math.cos(phi + TAU * s));
    }
    /** Angezeigte Stelle a und Funktionswert b von P. */
    function shownP(now: number): { a: number; b: number } {
      const fn = fnNow();
      const wa = walkA(now);
      const a = wa !== null ? clampA(fn, wa) : AX.v;
      const b = fn.f(a);
      if (morphB) {
        const t = clamp01((now - morphB.t0) / morphB.dur);
        return { a, b: lerp(morphB.from, b, ease.inOutCubic(t)) };
      }
      return { a, b };
    }
    /** Nächste Stelle a auf dem Graphen zu einem Punkt (in Pixeln gemessen). */
    function nearestA(x: number, y: number): number {
      const fn = fnNow();
      const [lo, hi] = fn.pRange;
      const tx = plot.px(x);
      const ty = plot.py(y);
      let best = clampA(fn, x);
      let bd = Infinity;
      for (let i = 0; i <= 300; i++) {
        const a = lo + ((hi - lo) * i) / 300;
        if (!inDomain(fn, a) || (fn.gap !== undefined && Math.abs(a - fn.gap) < 0.3)) continue;
        const d = Math.hypot(plot.px(a) - tx, plot.py(fn.f(a)) - ty);
        if (d < bd) {
          bd = d;
          best = a;
        }
      }
      return best;
    }
    const setA = (a: number) => {
      lastDrag = performance.now();
      ctx.set({ x: Math.round(clampA(fnNow(), a) * 10) / 10 });
    };
    const busy = () => fold !== null || walk !== null || scan !== null;
    plot.addHandle({
      get: () => {
        const P = shownP(performance.now());
        return [P.a, P.b];
      },
      set: (x, y) => setA(nearestA(x, y)),
      axis: 'both',
      enabled: () => editable() && !busy(),
      color: () => col.f(),
    });
    plot.addHandle({
      get: () => {
        const P = shownP(performance.now());
        return [P.b, P.a];
      },
      set: (x, y) => setA(nearestA(y, x)),
      axis: 'both',
      enabled: () => editable() && !busy() && fnNow().inv !== null && p.inv,
      color: () => col.i(),
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), i: col.i(), D: col.D(), W: col.W(), b: col.bad(), l: col.line(), m: th().muted },
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
          out += buf.replace(/(^|[^\p{L}])(\p{L})(?![\p{L}])/gu, (_, pre: string, ch: string) => (ch === 'π' || ch === 'ℝ' ? `${pre}${ch}` : `${pre}<var>${ch}</var>`));
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
            else if (cmd === 'c') {
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

    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
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
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.36 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }

    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht). */
    function strokePts(pts: P2[], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
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
        g.strokeStyle = withAlpha('#ffffff', th().dark ? 0.2 : 0.38);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }
    const toPx = (pts: P2[]): P2[] => pts.map(([x, y]) => [plot.px(x), plot.py(y)]);
    const swapPts = (pts: P2[]): P2[] => pts.map(([x, y]) => [y, x]);

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

    function cardTitle(R: Rect, title: string, color: string, right?: string): void {
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
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(title, R.x + pad + 15, ty);
      const tw = g.measureText(title).width;
      if (right) {
        const rb = formula(g, right, fstyle(fs(12, 11), color, 700));
        if (R.x + pad + 15 + tw + 12 + rb.w < R.x + R.w - pad) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      }
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
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

    /* ---------- Einstieg und Abläufe ---------- */
    interface Intro {
      panel: number;
      reveal: number;
      line: number;
      fold: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, line: 1, fold: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3200) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 80) / 1000)),
        line: ease.outCubic(clamp01((t - 550) / 650)),
        fold: clamp01((t - 1150) / 1500),
        labels: ease.outCubic(clamp01((t - 2300) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 700) / 1600),
      };
    }
    /** Fortschritt des Umklappens (null: kein Umklappen; negativ: noch nicht begonnen). */
    function foldT(now: number, k: Intro): number | null {
      if (fold) return (now - fold.t0) / fold.dur;
      if (intro !== null && p.inv && k.fold < 1) return k.fold;
      return null;
    }
    /** Lage der waagrechten Geraden y = c beim Wandern. */
    function scanC(now: number, b: number): number | null {
      if (!scan) return null;
      const u = clamp01((now - scan.t0) / scan.dur);
      const lo = W0.v + 0.25;
      const hi = W1.v - 0.25;
      if (u < 0.22) return lerp(b, lo, ease.inOutCubic(u / 0.22));
      if (u < 0.78) return lerp(lo, hi, ease.inOutCubic((u - 0.22) / 0.56));
      return lerp(hi, b, ease.inOutCubic((u - 0.78) / 0.22));
    }
    /** Fortschritt der Schritte im Rechenweg (je Zeile 0 … 1). */
    function stepAt(now: number, i: number): number {
      if (!steps) return 1;
      return ease.outCubic(clamp01((now - steps.t0 - 150 - i * STEP_MS) / 520));
    }

    /* =====================================================================
     * Koordinatensystem
     * ===================================================================== */
    interface Frame {
      fn: Fn;
      a: number;
      b: number;
      /** Umklappen: 0 … 1, null wenn keines läuft */
      ft: number | null;
      k: Intro;
      now: number;
    }

    /** Perspektive beim Umklappen: Punkte über der Ebene erscheinen größer. */
    function project(q: { x: number; y: number; z: number }): { px: number; py: number; s: number } {
      const c = (W0.v + W1.v) / 2;
      const D = 3 * (W1.v - W0.v);
      const s = D / Math.max(0.2 * D, D - q.z);
      return { px: plot.px(c + (q.x - c) * s), py: plot.py(c + (q.y - c) * s), s };
    }

    function drawMirrorLine(F: Frame): void {
      const g = surface.g;
      const r = plot.rect;
      const a = F.k.line;
      if (a <= 0.01) return;
      const lo = W0.v - 2;
      const hi = W1.v + 2;
      const t = lerp(0.5, 1, a);
      const m = (lo + hi) / 2;
      const p0 = plot.toPx(lerp(m, lo, t), lerp(m, lo, t));
      const p1 = plot.toPx(lerp(m, hi, t), lerp(m, hi, t));
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = withAlpha(th().muted, 0.95);
      g.lineWidth = 2;
      g.setLineDash([9, 6]);
      g.beginPath();
      g.moveTo(p0[0], p0[1]);
      g.lineTo(p1[0], p1[1]);
      g.stroke();
      g.restore();
      // Beschriftung oben rechts an der Geraden
      const u = Math.min(plot.bounds.xMax, plot.bounds.yMax) - (W1.v - W0.v) * 0.09;
      fpill(plot.px(u) - 14, plot.py(u) + 16, 'y = x', { align: 'right', size: fs(12.5, 11.5), color: th().muted, alpha: a * F.k.labels, bounds: r });
    }

    /** Graph von f (benutzter Teil kräftig, nicht benutzter Teil blass gestrichelt). */
    function drawF(fn: Fn, alpha: number, reveal: number): void {
      if (alpha <= 0.01) return;
      const gr = graphsOf(fn);
      const xr = lerp(W0.v - 0.5, W1.v + 0.5, reveal);
      const cut = (pts: P2[]) => (reveal >= 1 ? pts : pts.filter((q) => q[0] <= xr));
      const test = mw.test.v;
      for (const part of gr.unused) strokePts(toPx(cut(part)), withAlpha(col.f(), th().dark ? 0.42 : 0.34), fs(2.4, 2), { dash: [6, 6], alpha: alpha * (0.75 + 0.25 * test) });
      for (const part of gr.used) strokePts(toPx(cut(part)), col.f(), fs(3.4, 2.9), { glow: true, alpha });
    }

    /** Graph der Umkehrfunktion bzw. der gespiegelten Relation (nicht umkehrbar). */
    function drawInv(fn: Fn, alpha: number): void {
      if (alpha <= 0.01) return;
      const gr = graphsOf(fn);
      const ok = fn.inv !== null;
      const c = ok ? col.i() : col.bad();
      for (const part of gr.used) strokePts(toPx(swapPts(part)), c, ok ? fs(3.4, 2.9) : fs(2.8, 2.4), { glow: ok, dash: ok ? undefined : [8, 6], alpha });
    }

    /** Das Umklappen: eine Kopie des Graphen dreht sich im Raum um y = x. */
    function drawFold(F: Frame, t: number): void {
      if (t < 0) return;
      const g = surface.g;
      const te = ease.inOutCubic(clamp01(t));
      const fn = F.fn;
      const ok = fn.inv !== null;
      const gr = graphsOf(fn);
      const target = ok ? col.i() : col.bad();
      const lift = Math.sin(Math.PI * te);
      // Wanderspuren: einzelne Punkte laufen senkrecht zu y = x zu ihrem Spiegelbild
      const span = W1.v - W0.v;
      const marks: P2[] = [];
      for (const part of gr.used) {
        let last = -Infinity;
        for (const pt of part) {
          const inView = pt[0] > W0.v && pt[0] < W1.v && pt[1] > W0.v && pt[1] < W1.v;
          if (inView && pt[0] - last >= span / 9) {
            marks.push(pt);
            last = pt[0];
          }
        }
      }
      g.save();
      g.globalAlpha *= 0.7 * Math.min(1, t * 4) * Math.min(1, (1.08 - t) * 4);
      g.setLineDash([2, 4]);
      g.lineWidth = 1.2;
      g.strokeStyle = withAlpha(th().muted, 0.8);
      for (const m of marks) {
        const a0 = plot.toPx(m[0], m[1]);
        const a1 = plot.toPx(m[1], m[0]);
        g.beginPath();
        g.moveTo(a0[0], a0[1]);
        g.lineTo(a1[0], a1[1]);
        g.stroke();
      }
      g.setLineDash([]);
      for (const m of marks) {
        const q = foldPoint(m, te);
        dot(plot.px(q.x), plot.py(q.y), withAlpha(th().muted, 1), 2.4, 0.8);
      }
      g.restore();
      for (const part of gr.used) {
        const q3 = part.map((pt) => foldPoint(pt, te));
        // Schatten auf der Ebene (Licht von links oben)
        if (lift > 0.02) {
          const sh: P2[] = q3.map((q) => [plot.px(q.x + q.z * 0.1), plot.py(q.y - q.z * 0.16)]);
          g.save();
          g.filter = 'blur(3px)';
          strokePts(sh, th().dark ? 'rgba(0,0,0,0.9)' : 'rgba(16,24,40,0.55)', 4, { alpha: 0.32 * lift });
          g.restore();
        }
        const pr = q3.map(project);
        const avgS = pr.reduce((s, q) => s + q.s, 0) / Math.max(1, pr.length);
        const px: P2[] = pr.map((q) => [q.px, q.py]);
        // Farbe blendet von f nach f⁻¹ über (ohne Mischfarbe)
        strokePts(px, col.f(), fs(3.4, 2.9) * avgS, { glow: true, alpha: 1 - te });
        strokePts(px, target, fs(3.4, 2.9) * avgS, { glow: true, alpha: te, dash: ok ? undefined : [8, 6] });
      }
      // Punkt P wandert mit; sein Fußpunkt läuft geradlinig senkrecht zu y = x
      const P: P2 = [F.a, F.b];
      const Q = mirror(P);
      const pp = plot.toPx(P[0], P[1]);
      const qp = plot.toPx(Q[0], Q[1]);
      g.save();
      g.strokeStyle = withAlpha(th().text, 0.4 * clamp01(t * 3));
      g.lineWidth = 1.4;
      g.setLineDash([4, 5]);
      g.beginPath();
      g.moveTo(pp[0], pp[1]);
      g.lineTo(qp[0], qp[1]);
      g.stroke();
      g.restore();
      const qf = foldPoint(P, te);
      const prj = project(qf);
      const c = te < 0.5 ? col.f() : target;
      halo(prj.px, prj.py, c, 16, 0.6);
      dot(prj.px, prj.py, c, 6.5 * Math.min(1.25, prj.s));
      // Intervalle (Ansicht „Spiegeln“) und Steigungsdreieck (Ansicht „Ableitung“) klappen mit
      if (mw.mirror.v > 0.02) drawSetBars(F, mw.mirror.v * F.k.labels * (1 - 0.55 * lift), te);
      if (mw.deriv.v > 0.02 && ok) drawTangentFold(F, te, mw.deriv.v);
    }

    /* ---------- Definitions- und Wertemenge als Intervalle an den Achsen ---------- */
    /** Intervalle in den sichtbaren Bereich geschnitten. */
    function visiblePieces(set: readonly Interval[]): { lo: number; hi: number; loEnd: 'in' | 'out' | 'open'; hiEnd: 'in' | 'out' | 'open' }[] {
      const out: { lo: number; hi: number; loEnd: 'in' | 'out' | 'open'; hiEnd: 'in' | 'out' | 'open' }[] = [];
      const vlo = W0.v - 1.5;
      const vhi = W1.v + 1.5;
      for (const s of set) {
        const lo = Math.max(s.lo, vlo);
        const hi = Math.min(s.hi, vhi);
        if (!(hi > lo)) continue;
        out.push({ lo, hi, loEnd: s.lo < vlo ? 'open' : s.loIn ? 'in' : 'out', hiEnd: s.hi > vhi ? 'open' : s.hiIn ? 'in' : 'out' });
      }
      return out;
    }
    /**
     * Ein Intervall als Balken. `axis` x: auf der x-Achse, Versatz `off` (Pixel, nach oben);
     * y: auf der y-Achse, Versatz nach rechts. Mit `t` (Umklappen) wird der Balken mitgedreht.
     */
    function drawBar(set: readonly Interval[], axis: 'x' | 'y', off: number, color: string, alpha: number, t = 0): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const offW = off / plot.scale.x;
      const at = (u: number): P2 => {
        const w: P2 = axis === 'x' ? [u, offW] : [offW, u];
        if (t <= 0) return [plot.px(w[0]), plot.py(w[1])];
        const pr = project(foldPoint(w, t));
        return [pr.px, pr.py];
      };
      for (const pc of visiblePieces(set)) {
        const a = at(pc.lo);
        const b = at(pc.hi);
        g.save();
        g.globalAlpha *= alpha;
        g.lineCap = 'round';
        const grad = g.createLinearGradient(a[0], a[1], b[0], b[1]);
        const c0 = withAlpha(color, pc.loEnd === 'open' ? 0 : 0.8);
        const c1 = withAlpha(color, pc.hiEnd === 'open' ? 0 : 0.8);
        grad.addColorStop(0, c0);
        grad.addColorStop(pc.loEnd === 'open' ? 0.18 : 0, withAlpha(color, 0.8));
        grad.addColorStop(pc.hiEnd === 'open' ? 0.82 : 1, withAlpha(color, 0.8));
        grad.addColorStop(1, c1);
        g.strokeStyle = grad;
        g.lineWidth = t > 0 ? 3.5 : 6;
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
        g.restore();
        if (pc.loEnd !== 'open') dot(a[0], a[1], color, 4.5, alpha, pc.loEnd === 'out');
        if (pc.hiEnd !== 'open') dot(b[0], b[1], color, 4.5, alpha, pc.hiEnd === 'out');
      }
    }
    /** Lage für die Beschriftung eines Intervalls (Mitte des sichtbaren Teils, eher im positiven Bereich). */
    function barLabelPos(set: readonly Interval[]): number | null {
      const pcs = visiblePieces(set);
      if (!pcs.length) return null;
      const last = pcs[pcs.length - 1]!;
      const lo = Math.max(last.lo, W0.v + 0.3);
      const hi = Math.min(last.hi, W1.v - 0.3);
      if (!(hi >= lo)) return null;
      return lerp(lo, hi, 0.72);
    }
    function drawSetBars(F: Frame, alpha: number, foldTe: number | null, invAlpha = 0): void {
      if (alpha <= 0.01) return;
      const fn = F.fn;
      const r = plot.rect;
      const OFF = 7;
      const sz = fs(12, 11);
      if (foldTe === null) {
        // Balken von f: D_f auf der x-Achse, W_f rechts an der y-Achse
        drawBar(fn.D, 'x', 0, col.D(), alpha);
        drawBar(fn.W, 'y', OFF, col.W(), alpha);
        const kI = invAlpha * (fn.inv ? 1 : 0);
        if (kI > 0.01) {
          // Balken von f⁻¹: gespiegelt – D_f⁻¹ = W_f oberhalb der x-Achse, W_f⁻¹ = D_f auf der y-Achse
          drawBar(fn.W, 'x', OFF, col.W(), alpha * kI);
          drawBar(fn.D, 'y', 0, col.D(), alpha * kI);
        }
        const la = alpha * F.k.labels;
        const dx = barLabelPos(fn.D);
        if (dx !== null) fpill(plot.px(dx), plot.py(0) + 17, '\\c{D}{D_f}', { size: sz, alpha: la, bounds: r, border: withAlpha(col.D(), 0.55) });
        const wy = barLabelPos(fn.W);
        if (wy !== null) fpill(plot.px(0) + OFF + 10, plot.py(wy), `\\c{W}{${WS}_f}`, { size: sz, align: 'left', alpha: la, bounds: r, border: withAlpha(col.W(), 0.55) });
        if (kI > 0.01) {
          const ix = barLabelPos(fn.W);
          if (ix !== null) fpill(plot.px(ix), plot.py(0) - OFF - 15, '\\c{W}{D_{f^{−1}}}', { size: sz, alpha: la * kI, bounds: r, border: withAlpha(col.W(), 0.55) });
          const iy = barLabelPos(fn.D);
          if (iy !== null) fpill(plot.px(0) - 10, plot.py(iy), `\\c{D}{${WS}_{f^{−1}}}`, { size: sz, align: 'right', alpha: la * kI, bounds: r, border: withAlpha(col.D(), 0.55) });
        }
        return;
      }
      // beim Umklappen: Kopien der Balken drehen sich mit
      drawBar(fn.D, 'x', 0, col.D(), alpha * 0.9, foldTe);
      drawBar(fn.W, 'y', OFF, col.W(), alpha * 0.9, foldTe);
    }

    /* ---------- Punkte P und P′ ---------- */
    function drawPoints(F: Frame, invAlpha: number): void {
      const g = surface.g;
      const r = plot.rect;
      const { a, b } = F;
      if (!Number.isFinite(b)) return;
      const P: P2 = [a, b];
      const Q = mirror(P);
      const pp = plot.toPx(P[0], P[1]);
      const qp = plot.toPx(Q[0], Q[1]);
      const la = F.k.labels;
      const sz = fs(12.5, 11.5);
      const ok = F.fn.inv !== null;
      // Verbindung P–P′ mit Mittelpunkt auf y = x und rechtem Winkel
      const conn = invAlpha * (0.4 + 0.6 * mw.mirror.v) * (ok ? 1 : 0);
      if (conn > 0.01 && Math.abs(a - b) > 1e-6) {
        g.save();
        g.globalAlpha *= conn;
        g.strokeStyle = withAlpha(th().text, 0.55);
        g.lineWidth = 1.5;
        g.setLineDash([5, 5]);
        g.beginPath();
        g.moveTo(pp[0], pp[1]);
        g.lineTo(qp[0], qp[1]);
        g.stroke();
        g.setLineDash([]);
        const M = footOnDiagonal(P);
        const [mx, my] = plot.toPx(M[0], M[1]);
        if (Math.hypot(pp[0] - mx, pp[1] - my) > 22) {
          const s = 9;
          const ux = Math.SQRT1_2;
          const uy = -Math.SQRT1_2;
          const sx = Math.sign(b - a) || 1;
          const vx = -Math.SQRT1_2 * sx;
          const vy = -Math.SQRT1_2 * sx;
          g.strokeStyle = withAlpha(th().text, 0.7);
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(mx + ux * s, my + uy * s);
          g.lineTo(mx + ux * s + vx * s, my + uy * s + vy * s);
          g.lineTo(mx + vx * s, my + vy * s);
          g.stroke();
        }
        g.restore();
        dot(mx, my, th().muted, 3.6, conn * mw.mirror.v);
        if (mw.mirror.v > 0.3 && Math.hypot(pp[0] - mx, pp[1] - my) > 46) {
          const mm = cnt('m', M[0]);
          fpill(mx + (b > a ? 14 : -14), my + (b > a ? 12 : -12), `M(${S(N(mm))} | ${S(N(mm))})`, { align: b > a ? 'left' : 'right', size: fs(11.5, 11), color: th().muted, alpha: la * conn * mw.mirror.v, bounds: r });
        }
      }
      // P′ auf dem Graphen von f⁻¹
      if (ok && invAlpha > 0.01) {
        halo(qp[0], qp[1], col.i(), 20, invAlpha * 0.7);
        dot(qp[0], qp[1], col.i(), 6.5, invAlpha);
        const ca = cnt('a', a);
        const cb = cnt('b', b);
        const right = qp[0] < r.x + r.w * 0.62;
        const up = Q[1] > Q[0];
        fpill(qp[0] + (right ? 12 : -12), qp[1] + (up ? -18 : 18), `\\c{i}{P′(${S(N(cb))} | ${S(N(ca))})}`, { align: right ? 'left' : 'right', size: sz, alpha: la * invAlpha, bounds: r });
      }
      halo(pp[0], pp[1], col.f(), 20, 0.7);
      dot(pp[0], pp[1], col.f(), 6.5);
      const ca = cnt('a', a);
      const cb = cnt('b', b);
      const right = pp[0] < r.x + r.w * 0.62;
      const up = P[1] > P[0];
      fpill(pp[0] + (right ? 12 : -12), pp[1] + (up ? -18 : 18), `\\c{f}{P(${N(ca)} | ${N(cb)})}`, { align: right ? 'left' : 'right', size: sz, alpha: la, bounds: r });
    }

    /* ---------- Graphen beschriften ---------- */
    function labelGraphs(F: Frame, invAlpha: number): void {
      const r = plot.rect;
      const fn = F.fn;
      const gr = graphsOf(fn);
      const avoid: P2[] = [plot.toPx(0, 0), plot.toPx(F.a, F.b), plot.toPx(F.b, F.a), plot.toPx(F.a + 1.2, F.b), plot.toPx(F.b + 1.2, F.a)];
      const inner = (x: number, y: number) => x > r.x + 30 && x < r.x + r.w - 40 && y > r.y + 50 && y < r.y + r.h - 30;
      function spot(parts: P2[][], swap: boolean): P2 | null {
        let best: P2 | null = null;
        let bd = -1;
        for (const part of parts)
          for (let i = 0; i < part.length; i += 3) {
            const w = part[i]!;
            const [x, y] = swap ? plot.toPx(w[1], w[0]) : plot.toPx(w[0], w[1]);
            if (!inner(x, y)) continue;
            const d = Math.min(...avoid.map(([ax, ay]) => Math.hypot(x - ax, y - ay)));
            if (d > bd) {
              bd = d;
              best = [x, y];
            }
          }
        return best;
      }
      const la = F.k.labels;
      const sf = spot(gr.used, false);
      if (sf) {
        avoid.push(sf);
        fpill(sf[0] - 12, sf[1] - 16, '\\c{f}{\\t{G}_f}', { align: 'right', size: fs(13.5, 12.5), alpha: la, border: withAlpha(col.f(), 0.5), bounds: r });
      }
      if (invAlpha > 0.01) {
        const si = spot(gr.used, true);
        const ok = fn.inv !== null;
        if (si) {
          const src = ok ? (fn.selfInverse ? `\\c{i}{\\t{G}_{f^{−1}} = \\t{G}_f}` : '\\c{i}{\\t{G}_{f^{−1}}}') : `\\c{b}{\\t{${T('keine Funktion', 'not a function')}}}`;
          fpill(si[0] + 12, si[1] + 16, src, { align: 'left', size: fs(13.5, 12.5), alpha: la * invAlpha, border: withAlpha(ok ? col.i() : col.bad(), 0.5), bounds: r });
        }
      }
    }

    /* ---------- Ansicht „Umkehrbar?“: waagrechte Gerade ---------- */
    function drawLevelTest(F: Frame, alpha: number, invAlpha: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const r = plot.rect;
      const fn = F.fn;
      const sc = scanC(F.now, F.b);
      const c = sc ?? F.b;
      const hits = levelHits(fn, c, W0.v - 1, W1.v + 1);
      if (scan) scan.max = Math.max(scan.max, hits.length);
      const many = hits.length >= 2;
      const lc = many ? col.bad() : col.line();
      const y = plot.py(c);
      g.save();
      g.globalAlpha *= alpha;
      const grad = g.createLinearGradient(r.x, 0, r.x + r.w, 0);
      grad.addColorStop(0, withAlpha(lc, 0));
      grad.addColorStop(0.08, withAlpha(lc, 0.85));
      grad.addColorStop(0.92, withAlpha(lc, 0.85));
      grad.addColorStop(1, withAlpha(lc, 0));
      g.strokeStyle = grad;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(r.x, y);
      g.lineTo(r.x + r.w, y);
      g.stroke();
      // senkrechte Gerade x = c beim gespiegelten Graphen
      if (invAlpha > 0.01) {
        const x = plot.px(c);
        const gv = g.createLinearGradient(0, r.y, 0, r.y + r.h);
        gv.addColorStop(0, withAlpha(lc, 0));
        gv.addColorStop(0.08, withAlpha(lc, 0.5 * invAlpha));
        gv.addColorStop(0.92, withAlpha(lc, 0.5 * invAlpha));
        gv.addColorStop(1, withAlpha(lc, 0));
        g.strokeStyle = gv;
        g.lineWidth = 1.6;
        g.setLineDash([6, 5]);
        g.beginPath();
        g.moveTo(x, r.y);
        g.lineTo(x, r.y + r.h);
        g.stroke();
        g.setLineDash([]);
      }
      g.restore();
      for (const hx of hits) {
        const [px, py] = plot.toPx(hx, c);
        halo(px, py, lc, 18, alpha * 0.9);
        dot(px, py, lc, 5.5, alpha);
        if (invAlpha > 0.01) dot(plot.px(c), plot.py(hx), lc, 4.5, alpha * invAlpha, true);
      }
      // Zähler am rechten Rand
      const n = hits.length;
      const src = `\\c{${many ? 'b' : 'l'}}{y = ${N(cnt('c', c))}:  ${n} ${n === 1 ? T('Schnittpunkt', 'intersection') : T('Schnittpunkte', 'intersections')}}`;
      fpill(r.x + r.w - 12, y + (y > r.y + 60 ? -18 : 18), src, { align: 'right', size: fs(12, 11), alpha: alpha * F.k.labels, border: withAlpha(lc, 0.6), bounds: r });
      // Monotonie-Hinweise am Graphen
      const pcs = monoPieces(fn, Math.max(W0.v, SX[0]), Math.min(W1.v, SX[1]));
      for (const pc of pcs) {
        const lo = Math.max(pc.lo, W0.v + 0.2);
        const hi = Math.min(pc.hi, W1.v - 0.2);
        if (!(hi - lo > 0.5)) continue;
        // sichtbarer Teil des Stücks (Funktionswerte im Bild, mit Rand)
        const xs: number[] = [];
        for (let i = 0; i <= 60; i++) {
          const x = lerp(lo, hi, i / 60);
          const y = fn.f(x);
          if (Number.isFinite(y) && y > W0.v + 0.5 && y < W1.v - 0.6) xs.push(x);
        }
        if (xs.length < 3) continue;
        // Mitte des sichtbaren Teils, nicht auf dem Punkt P
        let xm = xs[Math.floor(xs.length / 2)]!;
        if (Math.abs(xm - F.a) < 0.6) {
          const alt = xs.filter((x) => Math.abs(x - F.a) >= 0.6);
          if (!alt.length) continue;
          xm = alt[Math.floor(alt.length / 2)]!;
        }
        const ym = fn.f(xm);
        const [px, py] = plot.toPx(xm, ym);
        const arrow = pc.dir === 'inc' ? '↗' : '↘';
        const txt = pc.dir === 'inc' ? T('steigt', 'increases') : T('fällt', 'decreases');
        fpill(px + 10, py + (pc.dir === 'inc' ? 16 : -16), `\\t{${arrow} ${txt}}`, { align: 'left', size: fs(11.5, 11), color: pc.used ? col.f() : th().muted, alpha: alpha * F.k.labels * (pc.used ? 1 : 0.8), bounds: r });
      }
    }

    /* ---------- Ansicht „Ableitung“: Tangenten und Steigungsdreiecke ---------- */
    /** Waagrechte Kathete so, dass beide Katheten gut sichtbar sind (in Einheiten). */
    function triDx(a: number, m: number): number {
      const span = W1.v - W0.v;
      let dx = Math.abs(m) <= 1.6 ? span / 8 : (span / 8) * (1.6 / Math.abs(m));
      dx = Math.max(dx, span / 40);
      // Richtung: nach rechts, außer am rechten Rand
      if (a + dx > W1.v - span * 0.12) dx = -dx;
      return dx;
    }
    function drawTriangle(tri: { P: P2; C: P2; Q: P2 }, legH: string, legV: string, alpha: number, map: (w: P2) => P2): void {
      const g = surface.g;
      const P = map(tri.P);
      const C = map(tri.C);
      const Q = map(tri.Q);
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(th().muted, th().dark ? 0.16 : 0.1);
      g.beginPath();
      g.moveTo(P[0], P[1]);
      g.lineTo(C[0], C[1]);
      g.lineTo(Q[0], Q[1]);
      g.closePath();
      g.fill();
      g.lineCap = 'round';
      g.strokeStyle = legH;
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(P[0], P[1]);
      g.lineTo(C[0], C[1]);
      g.stroke();
      g.strokeStyle = legV;
      g.beginPath();
      g.moveTo(C[0], C[1]);
      g.lineTo(Q[0], Q[1]);
      g.stroke();
      g.restore();
    }
    function tangentSeg(P: P2, dir: P2, lenPx: number): [P2, P2] {
      const s = plot.scale.x;
      const l = Math.hypot(dir[0], dir[1]) || 1;
      const ux = (dir[0] / l) * (lenPx / s);
      const uy = (dir[1] / l) * (lenPx / s);
      return [
        [P[0] - ux, P[1] - uy],
        [P[0] + ux, P[1] + uy],
      ];
    }
    function drawDeriv(F: Frame, alpha: number, invAlpha: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const r = plot.rect;
      const fn = F.fn;
      const { a, b } = F;
      const m = fn.df(a);
      const ok = fn.inv !== null;
      const flat = Math.abs(m) < 1e-9;
      const L = fs(120, 90);
      const sz = fs(12, 11);
      const dx = triDx(a, m);
      const tri = slopeTriangle(a, b, m, dx);
      const pxw = (w: P2): P2 => plot.toPx(w[0], w[1]);
      // Tangente an f in P
      const [t0, t1] = tangentSeg([a, b], [1, m], L);
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = col.f();
      g.lineWidth = 2.2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(plot.px(t0[0]), plot.py(t0[1]));
      g.lineTo(plot.px(t1[0]), plot.py(t1[1]));
      g.stroke();
      g.restore();
      if (!flat) drawTriangle(tri, col.D(), col.W(), alpha, pxw);
      // Kathetenlängen an P
      const la = alpha * F.k.labels;
      const cdx = cnt('dx', Math.abs(dx));
      const cdy = cnt('dy', Math.abs(m * dx));
      // auf schmalen Bildschirmen stehen die Kathetenlängen nur in der Karte
      if (!flat && !sm()) {
        const Cp = pxw(tri.C);
        const Pp = pxw(tri.P);
        const Qp = pxw(tri.Q);
        fpill((Pp[0] + Cp[0]) / 2, Cp[1] + (m * dx > 0 ? 15 : -15), `\\c{D}{${S(N(cdx))}}`, { size: sz - 0.5, alpha: la, bounds: r });
        if (Math.abs(Qp[1] - Cp[1]) > 18) fpill(Cp[0] + (dx > 0 ? 10 : -10), (Cp[1] + Qp[1]) / 2, `\\c{W}{${S(N(cdy))}}`, { align: dx > 0 ? 'left' : 'right', size: sz - 0.5, alpha: la, bounds: r });
      }
      const cm = cnt('mf', m);
      const pp = plot.toPx(a, b);
      const left = pp[0] > r.x + r.w * 0.5;
      // auf schmalen Bildschirmen stehen die Steigungen nur in der Karte
      if (!sm()) fpill(pp[0] + (left ? -16 : 16), pp[1] + (b > a ? 34 : -34), `\\c{f}{m = f′(${N(cnt('a', a))}) ${show() ? `${eq(m)} ${NS(cm)}` : '= ?'}}`, { align: left ? 'right' : 'left', size: sz, alpha: la, border: withAlpha(col.f(), 0.55), bounds: r });
      // gespiegelt: Tangente an f⁻¹ in P′, Katheten getauscht
      const ia = alpha * invAlpha;
      if (ia <= 0.01) return;
      const c2 = ok ? col.i() : col.bad();
      const Q: P2 = [b, a];
      const qp = plot.toPx(Q[0], Q[1]);
      const [s0, s1] = tangentSeg(Q, [m, 1], L);
      g.save();
      g.globalAlpha *= ia;
      g.strokeStyle = c2;
      g.lineWidth = 2.2;
      g.lineCap = 'round';
      if (flat) g.setLineDash([7, 5]);
      g.beginPath();
      g.moveTo(plot.px(s0[0]), plot.py(s0[1]));
      g.lineTo(plot.px(s1[0]), plot.py(s1[1]));
      g.stroke();
      g.restore();
      const mapM = (w: P2): P2 => plot.toPx(w[1], w[0]);
      if (!flat) drawTriangle(tri, col.D(), col.W(), ia, mapM);
      if (!flat && !sm()) {
        const Cp = mapM(tri.C);
        const Pp = mapM(tri.P);
        const Qp = mapM(tri.Q);
        // jetzt waagrecht: Δy von f (lila), senkrecht: Δx von f (grün)
        if (Math.abs(Qp[0] - Cp[0]) > 18) fpill((Cp[0] + Qp[0]) / 2, Cp[1] + (dx > 0 ? -15 : 15), `\\c{W}{${S(N(cdy))}}`, { size: sz - 0.5, alpha: ia * F.k.labels, bounds: r });
        fpill(Cp[0] + (m * dx > 0 ? 10 : -10), (Cp[1] + Pp[1]) / 2, `\\c{D}{${S(N(cdx))}}`, { align: m * dx > 0 ? 'left' : 'right', size: sz - 0.5, alpha: ia * F.k.labels, bounds: r });
      }
      const left2 = qp[0] > r.x + r.w * 0.5;
      const src = !show()
        ? `\\c{i}{m′ = ?}`
        : flat
          ? `\\c{b}{\\t{${T('senkrechte Tangente', 'vertical tangent')}}}`
          : `\\c{i}{m′ = \\f{1}{${NS(cm)}} ${eq(1 / m)} ${N(cnt('mi', 1 / m))}}`;
      // P′ nahe bei P: auf die andere Seite als die Steigung von f
      const downQ = Math.hypot(qp[0] - pp[0], qp[1] - pp[1]) < 70 ? !(b > a) : a > b;
      if (!sm() || flat) fpill(qp[0] + (left2 ? -16 : 16), qp[1] + (downQ ? 34 : -34), src, { align: left2 ? 'right' : 'left', size: sz, alpha: ia * F.k.labels, border: withAlpha(c2, 0.55), bounds: r });
    }
    /** Tangente und Steigungsdreieck klappen beim Umklappen mit. */
    function drawTangentFold(F: Frame, te: number, alpha: number): void {
      const g = surface.g;
      const { a, b } = F;
      const m = F.fn.df(a);
      const L = fs(120, 90);
      const [t0, t1] = tangentSeg([a, b], [1, m], L);
      const p0 = project(foldPoint(t0, te));
      const p1 = project(foldPoint(t1, te));
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = te < 0.5 ? col.f() : col.i();
      g.lineWidth = 2.2 * ((p0.s + p1.s) / 2);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(p0.px, p0.py);
      g.lineTo(p1.px, p1.py);
      g.stroke();
      g.restore();
      if (Math.abs(m) < 1e-9) return;
      const tri = slopeTriangle(a, b, m, triDx(a, m));
      drawTriangle(tri, col.D(), col.W(), alpha, (w) => {
        const q = project(foldPoint(w, te));
        return [q.px, q.py];
      });
    }

    function drawPlot(F: Frame): void {
      const lo = W0.v;
      const hi = W1.v;
      const pad = (hi - lo) * 0.03;
      plot.setRange([lo - pad, hi + pad], [lo - pad, hi + pad]);
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const k = F.k;
      const fnNowV = F.fn;
      const ok = fnNowV.inv !== null;
      // Überblendung beim Wechsel der Funktion
      let kNew = 1;
      if (fnFade) {
        const t = clamp01((F.now - fnFade.t0) / fnFade.dur);
        kNew = ease.inOutCubic(t);
        drawF(fnFade.from, 1 - kNew, 1);
        drawInv(fnFade.from, (1 - kNew) * kInv.v);
      }
      drawMirrorLine(F);
      const foldOn = F.ft !== null;
      const invStatic = kInv.v * (foldOn ? 0 : 1) * kNew;
      // Intervalle unter den Graphen
      drawSetBars(F, mw.mirror.v * k.labels * kNew, null, invStatic);
      drawInv(fnNowV, invStatic);
      drawF(fnNowV, kNew, Math.min(k.reveal, fnFade ? kNew : 1));
      if (F.ft !== null) drawFold(F, F.ft);
      drawLevelTest(F, mw.test.v * k.labels, invStatic);
      drawDeriv(F, mw.deriv.v * k.labels, invStatic);
      labelGraphs(F, invStatic);
      drawPoints(F, ok ? invStatic : 0);
      // Legende oben links
      const s = stepsNow();
      fpill(r.x + 10, r.y + 18, `\\c{f}{${s.f}}`, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.w * 0.62 });
      plot.end();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    interface RowSpec {
      src: string;
      text?: boolean;
      color?: string;
      size?: number;
      weight?: number;
      gap?: number;
      at?: number;
      hl?: string;
    }
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null, lines, font, h: lines.length * size * 1.3 };
        }
        const box = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600);
        return { box, lines: [] as string[], font: '', h: rowH(box) };
      });
      const h = 36 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 36;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = row.at ?? clamp01(k.stagger * (rows.length + 2) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, it.h + 6, 7);
          g.fill();
        }
        const dx = (1 - ease.outCubic(a)) * 10;
        if (it.box) it.box.draw(g, R.x + pad + dx, y + it.box.asc);
        else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, R.x + pad + dx, y + size * 0.65 + j * size * 1.3));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      return h;
    }
    const note = (de: string, en: string, extra: Partial<RowSpec> = {}): RowSpec => ({ src: T(de, en), text: true, size: fs(12, 11), color: th().muted, gap: 6, ...extra });

    /** Rechenweg „nach x auflösen, x und y tauschen“ (Ansicht „Spiegeln“). */
    function stepsCard(F: Frame): CardFn {
      return (R, measure) => {
        const s = stepsNow();
        const ok = F.fn.inv !== null;
        const sz = fs(13.5, 12.5);
        const lab = fs(12, 11);
        const rows: RowSpec[] = [{ src: `\\c{f}{${s.f}}`, size: sz, at: stepAt(F.now, 0), gap: 10 }];
        let i = 1;
        if (!show()) {
          rows.push({ src: `\\c{i}{f^{−1}(x) = ?}`, size: fs(15, 13.5), gap: 8 });
          rows.push(note('Löse y = f(x) nach x auf und tausche dann x und y.', 'Solve y = f(x) for x, then swap x and y.'));
          return formulaCard(R, measure, F.k, T('Umkehrfunktion bestimmen', 'Finding the inverse'), col.i(), rows);
        }
        rows.push({ src: `\\c{m}{① ${T('nach x auflösen', 'solve for x')}}`, size: lab, color: th().muted, gap: 4, at: stepAt(F.now, i++) });
        for (const st of s.solve) rows.push({ src: st.note ? `${st.src}   \\c{m}{${st.note}}` : st.src, size: sz, at: stepAt(F.now, i++), gap: 6 });
        if (ok) {
          rows[rows.length - 1]!.gap = 10;
          rows.push({ src: `\\c{m}{② ${T('x und y tauschen', 'swap x and y')}}`, size: lab, color: th().muted, gap: 4, at: stepAt(F.now, i++) });
          rows.push({ src: `\\b{\\c{i}{${s.inv}}}`, size: fs(15.5, 14), at: stepAt(F.now, i), gap: 10, hl: col.i() });
          rows.push({ src: `\\c{W}{D_{f^{−1}} = ${WS}_f = ${s.W}}`, size: fs(12.5, 11.5), at: stepAt(F.now, i + 1), gap: 4 });
          rows.push({ src: `\\c{D}{${WS}_{f^{−1}} = D_f = ${s.D}}`, size: fs(12.5, 11.5), at: stepAt(F.now, i + 1) });
        } else {
          rows.push({ src: `\\c{b}{${T('keine eindeutige Lösung', 'no unique solution')} ⇒ ${T('nicht umkehrbar', 'not invertible')}}`, size: fs(13, 12), at: stepAt(F.now, i), hl: col.bad(), gap: 8 });
          rows.push(note('Einschränken der Definitionsmenge auf einen streng monotonen Teil hilft (Ansicht „Umkehrbar?“).', 'Restricting the domain to a strictly monotonic part helps (view “Invertible?”).', { at: stepAt(F.now, i + 1) }));
        }
        return formulaCard(R, measure, F.k, T('Umkehrfunktion bestimmen', 'Finding the inverse'), col.i(), rows);
      };
    }

    /** Zahl in der Tabelle (bei sin als Vielfaches von π). */
    function cellNum(v: number, pi: boolean): string {
      if (pi) {
        const s = formatPiFraction(v);
        if (s !== null) return s;
      }
      if (Math.abs(v) >= 100) return N(v, 0);
      return N(v, 2);
    }

    /** Wertetabelle von f und f⁻¹: die Spalten tauschen beim Spiegeln die Plätze. */
    function tableCard(F: Frame): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const rows = valueTable(F.fn);
        const ok = F.fn.inv !== null;
        const rH = fs(20, 18);
        const h = 36 + 26 + (rows.length + 1) * rH + 10;
        if (measure) return h;
        card({ ...R, h }, col.D());
        cardTitle(R, T('Wertetabelle', 'Table of values'), col.D(), ok ? T('Spalten tauschen', 'columns swap') : undefined);
        const inner = R.w - 2 * pad;
        const gapC = 14;
        const tw = (inner - gapC) / 2;
        const xL = R.x + pad;
        const xR = xL + tw + gapC;
        const cA = (x0: number) => x0 + tw * 0.27;
        const cB = (x0: number) => x0 + tw * 0.75;
        // Tauschen: beim Umklappen bzw. im Rechenweg
        let swapK = 1;
        if (F.ft !== null) swapK = ease.inOutCubic(clamp01(F.ft));
        const hy = R.y + 48;
        const fsz = fs(12.5, 11.5);
        const head = (x: number, src: string, color: string, alpha = 1) => {
          const b = formula(g, src, fstyle(fsz, color, 700));
          g.save();
          g.globalAlpha *= alpha;
          b.draw(g, x - b.w / 2, hy + (b.asc - b.desc) / 2);
          g.restore();
        };
        // Kopfzeilen
        g.fillStyle = withAlpha(col.f(), theme.dark ? 0.16 : 0.08);
        roundRect(g, xL - 4, hy - 12, tw + 8, (rows.length + 1) * rH + 18, 8);
        g.fill();
        g.fillStyle = withAlpha(ok ? col.i() : col.bad(), theme.dark ? 0.16 : 0.08);
        roundRect(g, xR - 4, hy - 12, tw + 8, (rows.length + 1) * rH + 18, 8);
        g.fill();
        head(cA(xL), '\\c{D}{x}', col.D());
        head(cB(xL), '\\c{W}{f(x)}', col.W());
        head(cA(xR), ok ? '\\c{W}{x}' : '\\c{b}{x}', col.W());
        head(cB(xR), ok ? '\\c{D}{f^{−1}(x)}' : '\\c{b}{y}', ok ? col.D() : col.bad());
        const rep = repeatedValues(rows);
        const all: { x: number; y: number; pi?: boolean; cur: boolean }[] = rows.map((rw) => ({ ...rw, cur: false }));
        all.push({ x: F.a, y: F.b, cur: true });
        const font = `650 ${fs(12, 11.5)}px ${theme.font}`;
        all.forEach((rw, i) => {
          const y = hy + 22 + i * rH;
          const a = clamp01(F.k.stagger * (all.length + 2) - i);
          const isRep = rep !== null && !rw.cur && (i === rep[0] || i === rep[1]);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          if (rw.cur) {
            g.fillStyle = withAlpha(col.f(), theme.dark ? 0.24 : 0.14);
            roundRect(g, xL - 2, y - rH / 2 + 1, tw + 4, rH - 2, 6);
            g.fill();
            g.fillStyle = withAlpha(ok ? col.i() : col.bad(), theme.dark ? 0.24 : 0.14);
            roundRect(g, xR - 2, y - rH / 2 + 1, tw + 4, rH - 2, 6);
            g.fill();
          }
          if (isRep) {
            g.strokeStyle = withAlpha(col.bad(), 0.8);
            g.lineWidth = 1.4;
            roundRect(g, xL - 2, y - rH / 2 + 1, tw + 4, rH - 2, 6);
            g.stroke();
          }
          g.font = font;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          const xs = rw.cur ? N(cnt('a', rw.x)) : cellNum(rw.x, !!rw.pi);
          const ys = rw.cur ? N(cnt('b', rw.y)) : cellNum(rw.y, false);
          g.fillStyle = theme.text;
          g.fillText(xs, cA(xL), y);
          g.fillStyle = isRep ? col.bad() : theme.text;
          g.fillText(ys, cB(xL), y);
          // rechte Tabelle: die Werte wandern beim Tauschen in die andere Spalte
          // auf einem Bogen, damit sich die Zahlen nicht überdecken
          const arc = Math.sin(Math.PI * swapK) * rH * 0.45;
          g.fillStyle = ok ? theme.text : col.bad();
          g.fillText(ys, lerp(cB(xR), cA(xR), swapK), y - arc);
          g.fillText(show() ? xs : '?', lerp(cA(xR), cB(xR), swapK), y + arc);
          g.restore();
        });
        return h;
      };
    }

    /** Spiegelung in Zahlen. */
    function mirrorCard(F: Frame): CardFn {
      return (R, measure) => {
        const ok = F.fn.inv !== null;
        const { a, b } = F;
        const ca = N(cnt('a', a));
        const cb = N(cnt('b', b));
        const m = (a + b) / 2;
        const rows: RowSpec[] = [
          { src: `\\c{f}{P(${ca} | ${cb})}  ↦  \\c{i}{P′(${S(cb)} | ${S(ca)})}`, size: fs(14, 13) },
          { src: `M(${S(N(cnt('m', m)))} | ${S(N(cnt('m', m)))}) \\c{m}{${T('liegt auf', 'lies on')}} y = x`, size: fs(12.5, 11.5) },
          note('Die Verbindung PP′ steht senkrecht auf y = x und wird von ihr halbiert.', 'The segment PP′ is perpendicular to y = x and is bisected by it.'),
        ];
        if (F.fn.selfInverse) rows.push(note('1/x ist zu sich selbst invers: Der Graph ist symmetrisch zu y = x, P′ liegt wieder auf dem Graphen von f.', '1/x is its own inverse: the graph is symmetric about y = x, P′ lies on the graph of f again.', { color: col.i() }));
        if (!ok) rows.push(note('Das Spiegelbild ist kein Funktionsgraph: Zu einem x-Wert gehören mehrere y-Werte.', 'The image is not the graph of a function: one x-value has several y-values.', { color: col.bad() }));
        return formulaCard(R, measure, F.k, T('Spiegeln an y = x', 'Reflecting in y = x'), th().muted, rows);
      };
    }

    /** Ansicht „Umkehrbar?“: waagrechte Gerade und Monotonie. */
    function testCard(F: Frame): CardFn {
      return (R, measure) => {
        const fn = F.fn;
        const ok = fn.inv !== null;
        const c = scanC(F.now, F.b) ?? F.b;
        const n = levelHits(fn, c, W0.v - 1, W1.v + 1).length;
        const rows: RowSpec[] = [
          { src: `${T('Gerade', 'Line')} \\c{l}{y = ${N(cnt('c', c))}}: \\c{${n >= 2 ? 'b' : 'l'}}{${n} ${n === 1 ? T('Schnittpunkt', 'intersection') : T('Schnittpunkte', 'intersections')}}`, size: fs(13.5, 12.5) },
        ];
        if (scan) rows.push({ src: `\\c{m}{${T('bisher höchstens', 'so far at most')}} ${scan.max}`, size: fs(12.5, 11.5) });
        rows.push(note('Umkehrbar ⇔ jede waagrechte Gerade schneidet den Graphen höchstens einmal (jeder Funktionswert kommt nur einmal vor).', 'Invertible ⇔ every horizontal line meets the graph at most once (every value occurs only once).', { color: th().text, size: fs(12.5, 11.5) }));
        const mono: Record<string, Txt> = {
          lin: L('f ist streng monoton steigend (Steigung 2 > 0) ⇒ umkehrbar.', 'f is strictly increasing (slope 2 > 0) ⇒ invertible.'),
          'sq:pos': L('Für x ≥ 0 ist f streng monoton steigend ⇒ umkehrbar, f⁻¹(x) = √x.', 'For x ≥ 0, f is strictly increasing ⇒ invertible, f⁻¹(x) = √x.'),
          'sq:neg': L('Für x ≤ 0 ist f streng monoton fallend ⇒ umkehrbar, f⁻¹(x) = −√x.', 'For x ≤ 0, f is strictly decreasing ⇒ invertible, f⁻¹(x) = −√x.'),
          'sq:all': L('f fällt für x ≤ 0 und steigt für x ≥ 0: f(−2) = f(2) = 4 ⇒ nicht umkehrbar. Abhilfe: Definitionsmenge einschränken.', 'f decreases for x ≤ 0 and increases for x ≥ 0: f(−2) = f(2) = 4 ⇒ not invertible. Remedy: restrict the domain.'),
          cube: L('f′(0) = 0, aber f′ wechselt dort nicht das Vorzeichen: f ist trotzdem streng monoton steigend ⇒ umkehrbar.', 'f′(0) = 0, but f′ does not change sign there: f is still strictly increasing ⇒ invertible.'),
          exp: L('eˣ ist streng monoton steigend ⇒ umkehrbar; die Umkehrfunktion ist ln x.', 'eˣ is strictly increasing ⇒ invertible; the inverse is ln x.'),
          hyp: L('Auf jedem Ast streng monoton fallend, auf ganz D aber nicht monoton. Trotzdem umkehrbar: Auf dem linken Ast sind alle Funktionswerte negativ, auf dem rechten positiv. Monotonie ist hinreichend, nicht notwendig.', 'Strictly decreasing on each branch, but not monotonic on the whole domain. Still invertible: on the left branch all values are negative, on the right branch all are positive. Monotonicity is sufficient, not necessary.'),
          'sin:pos': L('Auf [−π/2; π/2] streng monoton steigend ⇒ umkehrbar, f⁻¹(x) = arcsin x.', 'On [−π/2, π/2] strictly increasing ⇒ invertible, f⁻¹(x) = arcsin x.'),
          'sin:neg': L('Auf [π/2; 3π/2] streng monoton fallend ⇒ umkehrbar, f⁻¹(x) = π − arcsin x.', 'On [π/2, 3π/2] strictly decreasing ⇒ invertible, f⁻¹(x) = π − arcsin x.'),
          'sin:all': L('sin ist periodisch: Jeder Wert zwischen −1 und 1 kommt unendlich oft vor ⇒ nicht umkehrbar.', 'sin is periodic: every value between −1 and 1 occurs infinitely often ⇒ not invertible.'),
        };
        const id = fn.key === 'sq' || fn.key === 'sin' ? `${fn.key}:${fn.dom}` : fn.key;
        let txt = say(mono[id]!);
        if (!show()) txt = T('Ist f streng monoton? Lass die Gerade wandern und entscheide.', 'Is f strictly monotonic? Sweep the line and decide.');
        rows.push({ src: txt, text: true, size: fs(12.5, 11.5), color: show() ? (ok ? col.f() : col.bad()) : th().muted, weight: 650, hl: show() ? (ok ? col.D() : col.bad()) : undefined, gap: 6 });
        const verdict = show() ? (ok ? `\\c{D}{${T('umkehrbar', 'invertible')} ✓}` : `\\c{b}{${T('nicht umkehrbar', 'not invertible')}}`) : '?';
        return formulaCard(R, measure, F.k, T('Umkehrbar?', 'Invertible?'), ok ? col.D() : col.bad(), rows, verdict);
      };
    }

    /** Definitionsmenge einschränken (x² und sin) bzw. D und W. */
    function domCard(F: Frame): CardFn {
      return (R, measure) => {
        const fn = F.fn;
        const s = stepsNow();
        const rows: RowSpec[] = [];
        if (fn.key === 'sq' || fn.key === 'sin') {
          const opts: [DomKey, string, string][] =
            fn.key === 'sq'
              ? [
                  ['pos', 'x ≥ 0', '\\r{x}'],
                  ['neg', 'x ≤ 0', '−\\r{x}'],
                  ['all', '\\t{ℝ}', ''],
                ]
              : [
                  ['pos', '[−\\f{π}{2}; \\f{π}{2}]', '\\t{arcsin} x'],
                  ['neg', '[\\f{π}{2}; \\f{3π}{2}]', 'π − \\t{arcsin} x'],
                  ['all', '\\t{ℝ}', ''],
                ];
          for (const [d, D, inv] of opts) {
            const on = d === fn.dom;
            const res = inv ? `f^{−1}(x) = ${S(inv)}` : `\\c{b}{\\t{${T('nicht umkehrbar', 'not invertible')}}}`;
            rows.push({ src: `\\c{D}{D = ${lang === 'en' ? D.replace('; ', ', ') : D}}  →  ${inv ? `\\c{i}{${res}}` : res}`, size: fs(13, 12), hl: on ? (inv ? col.D() : col.bad()) : undefined, gap: 9 });
          }
          rows.push(note('Man schränkt auf einen Teil ein, auf dem f streng monoton ist.', 'Restrict to a part on which f is strictly monotonic.'));
          return formulaCard(R, measure, F.k, T('Definitionsmenge einschränken', 'Restricting the domain'), col.D(), rows);
        }
        rows.push({ src: `\\c{D}{D_f = ${s.D}}    \\c{W}{${WS}_f = ${s.W}}`, size: fs(13.5, 12.5) });
        rows.push({ src: `\\c{W}{D_{f^{−1}} = ${S(s.W)}}    \\c{D}{${WS}_{f^{−1}} = ${S(s.D)}}`, size: fs(13.5, 12.5) });
        rows.push(note('Keine Einschränkung nötig: f ist auf der ganzen Definitionsmenge umkehrbar.', 'No restriction needed: f is invertible on all of its domain.'));
        return formulaCard(R, measure, F.k, T('Definitions- und Wertemenge', 'Domain and range'), col.D(), rows);
      };
    }

    /** Ansicht „Ableitung“: (f⁻¹)′(b) = 1 / f′(a). */
    function derivCard(F: Frame): CardFn {
      return (R, measure) => {
        const fn = F.fn;
        const s = stepsNow();
        const ok = fn.inv !== null;
        const { a, b } = F;
        const m = fn.df(a);
        const flat = Math.abs(m) < 1e-9;
        const ca = N(cnt('a', a));
        const cb = N(cnt('b', b));
        const cm = NS(cnt('mf', m));
        const rows: RowSpec[] = [
          { src: `\\c{f}{${s.d}}`, size: fs(13.5, 12.5) },
          { src: `\\c{f}{m = f′(${ca}) ${show() ? `${eq(m)} ${cm}` : '= ?'}}`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\b{(f^{−1})′(b) = \\f{1}{f′(a)}}  \\c{m}{${T('mit', 'with')} b = f(a)}`, size: fs(14.5, 13) },
        ];
        if (!ok) {
          rows.push(note('f ist hier nicht umkehrbar – erst die Definitionsmenge einschränken.', 'f is not invertible here – restrict the domain first.', { color: col.bad() }));
        } else if (!show()) {
          // Aufgabenmodus: weder Steigung noch Sonderfall „senkrechte Tangente“ verraten
          rows.push({ src: `\\c{i}{(f^{−1})′(${cb}) = ?}`, size: fs(14, 13), hl: col.i() });
          rows.push({ src: `\\c{i}{(f^{−1})′(x) = ?}`, size: fs(13.5, 12.5) });
        } else if (flat) {
          rows.push({ src: `\\c{b}{f′(${ca}) = 0  ⇒  ${T('senkrechte Tangente in', 'vertical tangent at')} P′(${cb} | ${ca})}`, size: fs(13, 12), hl: col.bad() });
          rows.push(note('f⁻¹ ist dort nicht differenzierbar (Steigung „unendlich“).', 'f⁻¹ is not differentiable there (slope “infinite”).'));
        } else {
          rows.push({ src: `\\c{i}{(f^{−1})′(${cb}) = \\f{1}{${cm}}} ${eq(1 / m, 3)} \\b{${N(cnt('mi', 1 / m), 3)}}`, size: fs(14, 13), hl: col.i() });
          rows.push({ src: `\\c{i}{${s.dinv}}`, size: fs(13.5, 12.5) });
          if (fn.key === 'exp') rows.push(note('So erhält man die Ableitung des natürlichen Logarithmus: (ln x)′ = 1/x.', 'This gives the derivative of the natural logarithm: (ln x)′ = 1/x.', { color: col.i() }));
          if (fn.key === 'cube' && Math.abs(a) < 0.35) rows.push(note('In der Nähe von 0 wird f sehr flach, f⁻¹ also sehr steil.', 'Near 0, f becomes very flat, so f⁻¹ becomes very steep.'));
        }
        return formulaCard(R, measure, F.k, T('Ableitung der Umkehrfunktion', 'Derivative of the inverse'), col.i(), rows);
      };
    }

    /** Steigungsdreieck: Katheten tauschen. */
    function triCard(F: Frame): CardFn {
      return (R, measure) => {
        const m = F.fn.df(F.a);
        const flat = Math.abs(m) < 1e-9;
        const dx = Math.abs(triDx(F.a, m));
        const dy = Math.abs(m * dx);
        const cdx = N(cnt('dx', dx));
        const cdy = N(cnt('dy', dy));
        // Aufgabenmodus: Kathetenlängen (und den Sonderfall m = 0) nicht verraten
        const rows: RowSpec[] = !show()
          ? [
              { src: `\\c{f}{${T('an', 'at')} P:}  \\c{D}{Δx = ?},  \\c{W}{Δy = ?}`, size: fs(13, 12) },
              { src: `\\c{i}{${T('an', 'at')} P′:}  \\c{W}{Δx = ?},  \\c{D}{Δy = ?}`, size: fs(13, 12), gap: 10 },
              { src: `m = \\f{\\c{W}{Δy}}{\\c{D}{Δx}}  \\c{m}{→}  m′ = \\f{\\c{D}{Δx}}{\\c{W}{Δy}}`, size: fs(13.5, 12.5) },
            ]
          : flat
          ? [note('Waagrechte Tangente: Die senkrechte Kathete hat die Länge 0. Gespiegelt wird die waagrechte Kathete 0 – Division durch 0, keine Steigung.', 'Horizontal tangent: the vertical leg has length 0. Reflected, the horizontal leg becomes 0 – division by 0, no slope.', { color: th().text })]
          : [
              { src: `\\c{f}{${T('an', 'at')} P:}  \\c{D}{Δx = ${cdx}},  \\c{W}{Δy = ${cdy}}`, size: fs(13, 12) },
              { src: `\\c{i}{${T('an', 'at')} P′:}  \\c{W}{Δx = ${cdy}},  \\c{D}{Δy = ${cdx}}`, size: fs(13, 12), gap: 10 },
              { src: `m = \\f{\\c{W}{Δy}}{\\c{D}{Δx}}  \\c{m}{→}  m′ = \\f{\\c{D}{Δx}}{\\c{W}{Δy}} = \\f{1}{m}`, size: fs(13.5, 12.5) },
              note('Beim Spiegeln tauschen die Katheten ihre Rollen: aus der waagrechten wird die senkrechte und umgekehrt.', 'Reflecting swaps the legs: the horizontal one becomes vertical and vice versa.'),
            ];
        return formulaCard(R, measure, F.k, T('Steigungsdreieck', 'Slope triangle'), col.W(), rows);
      };
    }

    function cardsFor(v: View, F: Frame): CardFn[] {
      if (v === 'mirror') return [stepsCard(F), tableCard(F), mirrorCard(F)];
      if (v === 'test') return [testCard(F), domCard(F), tableCard(F)];
      return [derivCard(F), triCard(F), mirrorCard(F)];
    }

    function drawColumn(C: Rect, F: Frame): void {
      const g = surface.g;
      const list = cardsFor(view(), F);
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (F.now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !regions().wide && C.w >= 420;
      const place = (fn: CardFn, R: Rect, i: number) => {
        const hh = fn(R, true);
        if (hh <= 0 || hh > R.h + 1) return -1;
        g.save();
        const a = clamp01(F.k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
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
      const fn = fnNow();
      const s = stepsNow();
      const ok = fn.inv !== null;
      const a = clampA(fn, p.x);
      const b = fn.f(a);
      ctx.readout('inv', { html: ok ? toHtml(s.inv) : T('nicht umkehrbar', 'not invertible') });
      ctx.readout('pts', { html: ok ? `<var>P</var>(${N(a)} | ${N(b)}) ↦ <var>P</var>′(${N(b)} | ${N(a)})` : `<var>P</var>(${N(a)} | ${N(b)})` });
      ctx.readout('sets', {
        html: ok
          ? `${toHtml(`D_f = ${s.D}`)}, ${toHtml(`${WS}_f = ${s.W}`)} · ${toHtml(`D_{f^{−1}} = ${s.W}`)}, ${toHtml(`${WS}_{f^{−1}} = ${s.D}`)}`
          : `${toHtml(`D_f = ${s.D}`)}, ${toHtml(`${WS}_f = ${s.W}`)}`,
      });
      if (view() === 'test' || !ok) {
        const pa = partner(fn.key, fn.dom, a);
        ctx.readout('test', {
          html: ok
            ? T('umkehrbar: jeder Funktionswert kommt nur einmal vor', 'invertible: every value occurs only once')
            : pa !== null
              ? `${T('nicht umkehrbar', 'not invertible')}: <var>f</var>(${N(pa)}) = <var>f</var>(${N(a)}) = ${N(b)}`
              : T('nicht umkehrbar', 'not invertible'),
        });
      } else ctx.readout('test', null);
      if (view() === 'deriv' && ok) {
        const m = fn.df(a);
        ctx.readout('slope', {
          html:
            Math.abs(m) < 1e-9
              ? `<var>f</var>′(${N(a)}) = 0 ⇒ ${T('senkrechte Tangente an', 'vertical tangent of')} <var>f</var><sup>−1</sup> ${T('in', 'at')} (${N(b)} | ${N(a)})`
              : `<var>f</var>′(${N(a)}) ${eq(m)} ${NS(m)} · (<var>f</var><sup>−1</sup>)′(${N(b)}) = <span class="frac"><span>1</span><span>${NS(m)}</span></span> ${eq(1 / m, 3)} <strong>${N(1 / m, 3)}</strong>`,
        });
      } else ctx.readout('slope', null);
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      frameNow = now;
      frameDt = dt;
      numsBusy = false;
      let anim = false;
      const chans: Chan[] = [W0, W1, AX, kInv, kShow, ...Object.values(mw)];
      for (const c of chans) if (c.step(now, dt)) anim = true;
      if (fnFade && now - fnFade.t0 > fnFade.dur) fnFade = null;
      if (morphB && now - morphB.t0 > morphB.dur) morphB = null;
      if (fold && now - fold.t0 > fold.dur) fold = null;
      if (scan && now - scan.t0 > scan.dur) scan = null;
      if (walk && now - walk.t0 > walk.dur) walk = null;
      if (steps && now - steps.t0 > 9000) steps = null;
      if (fnFade || morphB || fold || scan || walk || steps || intro !== null || dragging()) anim = true;
      const k = introState(now);
      const fn = fnNow();
      const P = shownP(now);
      const F: Frame = { fn, a: P.a, b: P.b, ft: foldT(now, k), k, now };
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawPlot(F);
      g.restore();
      drawColumn(R.col, F);
      if (cardFade !== null || numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function cancelStories(): void {
      fold = null;
      scan = null;
      walk = null;
      steps = null;
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const fnChanged = changed.has('fn') || changed.has('dom');
        const oldFn = lastFn;
        const oldB = lastB;
        if (source === 'input') {
          if (fnChanged) ctx.set({ x: startA(key(), dom()) });
          else if (changed.has('x')) {
            const a = Math.round(clampA(fnNow(), p.x) * 10) / 10;
            if (Math.abs(a - p.x) > 1e-9) ctx.set({ x: a });
          }
        }
        const user = source === 'input' || source === 'replace';
        if (user && [...changed].some((c) => c !== 'show' && c !== 'inv')) cancelStories();
        const instant = source === 'init' || reduced();
        const fn = fnNow();
        const a = clampA(fn, p.x);
        // Bildausschnitt
        if (instant) {
          W0.jump(fn.window[0]);
          W1.jump(fn.window[1]);
        } else if (W0.goal !== fn.window[0] || W1.goal !== fn.window[1]) {
          W0.glide(fn.window[0], 800, 0, now);
          W1.glide(fn.window[1], 800, 0, now);
        }
        // Punkt P
        if (instant) AX.jump(a);
        else if (fnChanged || source === 'replace') AX.glide(a, 850, 0, now);
        else AX.follow(a, dragging() ? 0.04 : 0.18);
        if (!instant && oldFn !== fn) {
          // alten Graphen ausblenden, neuen einblenden; P gleitet auf den neuen Graphen
          fnFade = { from: oldFn, t0: now, dur: 750 };
          morphB = { from: oldB, t0: now, dur: 850 };
        }
        // Ansicht und Schalter
        for (const v of VIEWS) {
          const goal = v === view() ? 1 : 0;
          if (instant) mw[v].jump(goal);
          else if (mw[v].goal !== goal) mw[v].glide(goal, 560, goal ? 120 : 0, now);
        }
        if (instant) {
          kInv.jump(p.inv ? 1 : 0);
          kShow.jump(p.show ? 1 : 0);
        } else {
          kInv.follow(p.inv ? 1 : 0, 0.2);
          kShow.follow(p.show ? 1 : 0, 0.2);
        }
        if (changed.has('view') && view() !== prevView && !instant) cardFade = now;
        if (source === 'init' && !reduced()) intro = now;
        prevView = view();
        lastFn = fn;
        lastB = shownP(now).b;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        cancelStories();
        intro = null;
        const fn = fnNow();
        if (id === 'mirror') {
          if (!reduced()) fold = { t0: now, dur: FOLD_MS };
          if (!p.inv) ctx.set({ inv: true });
          kInv.jump(1);
        } else if (id === 'steps') {
          if (!p.show) ctx.set({ show: true });
          if (!reduced()) {
            steps = { t0: now };
            const n = stepsNow().solve.length;
            // beim Schritt „x und y tauschen“ klappt der Graph um
            fold = { t0: now + 150 + (n + 2) * STEP_MS, dur: FOLD_MS };
          }
          if (!p.inv) ctx.set({ inv: true });
          kInv.jump(1);
        } else if (id === 'scan') {
          if (!reduced()) scan = { t0: now, dur: SCAN_MS, max: 0 };
        } else if (id === 'walk') {
          if (!reduced()) {
            const a0 = clampA(fn, p.x);
            let [lo, hi] = fn.pRange;
            if (fn.gap !== undefined) {
              if (a0 > fn.gap) lo = fn.gap + 0.3;
              else hi = fn.gap - 0.3;
            }
            walk = { t0: now, dur: WALK_MS, lo, hi, a0 };
          }
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
