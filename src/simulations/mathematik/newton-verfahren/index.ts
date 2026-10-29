import { defineSimulation, drawArrowHead, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { basinMap, classify, FNS, isCycle, iterate, matchingDecimals, nearestRootIndex, quadConstant, sequence, type Fn, type FnKey, type Outcome, type Step } from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Pt = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Höchste Schrittzahl. */
const KMAX = 10;
/** Dauer eines Schritts mit der ganzen Erklär-Animation (ms). */
const STEP_MS = 2700;
/** Dauer späterer Schritte beim Abspielen (ms). */
const FAST_MS = 1500;
/** Dauer je Schritt, wenn mehrere auf einmal neu entstehen (ms). */
const REVEAL_MS = 650;
/** Grenzen des Startwerts (wie beim Regler). */
const X0_MIN = -3;
const X0_MAX = 4;

/**
 * Phasen eines Schritts (Anteile seiner Dauer): Lot zum Graphen, Tangente wächst,
 * Punkt gleitet auf der Tangente zur x-Achse (Steigungsdreieck entsteht), neuer
 * Näherungswert leuchtet auf.
 */
const PH = {
  lot: [0, 0.2] as const,
  tan: [0.17, 0.45] as const,
  slide: [0.45, 0.72] as const,
  pop: [0.7, 0.9] as const,
};
const ph = (u: number, r: readonly [number, number]) => clamp01((u - r[0]) / (r[1] - r[0]));

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
    if (Math.abs(this.goal - this.v) <= 1e-6 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Term, Ableitung, Grundausschnitt und guter Startwert je Funktion. */
interface FnMeta {
  term: string;
  dterm: string;
  x: [number, number];
  y: [number, number];
  start: number;
}
const META: Record<FnKey, FnMeta> = {
  sq2: { term: 'x² − 2', dterm: '2x', x: [-0.8, 2.6], y: [-2.4, 4.6], start: 1 },
  cubic: { term: 'x³ − 2x − 5', dterm: '3x² − 2', x: [-0.6, 3.4], y: [-9, 15], start: 2 },
  cos: { term: '\\t{cos} x − x', dterm: '−\\t{sin} x − 1', x: [-1.2, 2.6], y: [-2.6, 1.8], start: 1 },
  three: { term: 'x³ − 3x + 1', dterm: '3x² − 3', x: [-3, 3], y: [-5, 6], start: 0.5 },
  cycle: { term: 'x³ − 2x + 2', dterm: '3x² − 2', x: [-3, 2.4], y: [-5, 8], start: 0 },
  dbl: { term: 'x³ − 3x + 2', dterm: '3x² − 3', x: [-3, 3], y: [-5, 8], start: 2 },
};

/** Was die Karten gerade erklären. */
type Kind = 'start' | 'how' | 'heron' | 'quad' | 'double' | 'jump' | 'flat' | 'cycle' | 'far';

/**
 * Newton-Verfahren Schritt für Schritt (Jgst. 11).
 * Hauptanimation je Schritt: vom Punkt (x_n | 0) senkrecht zum Graphen, die
 * Tangente wächst aus dem Kurvenpunkt in beide Richtungen, ein Punkt gleitet auf
 * ihr zur x-Achse, das Steigungsdreieck mit f(x_n) und x_n − x_{n+1} zeigt, woher
 * die Formel kommt, und der neue Näherungswert leuchtet auf. Eine Lupe vergrößert
 * die immer kleineren Schritte, eine Tabelle zeigt die richtigen Stellen (fett).
 * Der Startwert ist ziehbar (auch Antippen der x-Achse). Sonderfälle sind gestaltet:
 * waagrechte Tangente, Zyklus (Kreislauf-Pfeile), Sprung zu einer anderen Nullstelle,
 * doppelte Nullstelle (langsam); optional werden die Einzugsbereiche eingefärbt.
 */
export default defineSimulation({
  id: 'newton-verfahren',
  dragHint: true,
  hint: { de: 'Tipp: Zieh den Startwert x₀ auf der x-Achse.', en: 'Tip: Drag the starting value x₀ on the x-axis.' },
  layout: { aspect: 1.42, aspectNarrow: 0.38 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion f', 'Function f'),
      options: [
        { value: 'sq2', label: L('x² − 2 (√2, Heron)', 'x² − 2 (√2, Heron)') },
        { value: 'cubic', label: L('x³ − 2x − 5 (Newtons Beispiel)', 'x³ − 2x − 5 (Newton’s example)') },
        { value: 'cos', label: L('cos x − x (cos x = x)', 'cos x − x (cos x = x)') },
        { value: 'three', label: L('x³ − 3x + 1 (drei Nullstellen)', 'x³ − 3x + 1 (three zeros)') },
        { value: 'cycle', label: L('x³ − 2x + 2 (Zyklus)', 'x³ − 2x + 2 (cycle)') },
        { value: 'dbl', label: L('x³ − 3x + 2 (doppelte Nullstelle)', 'x³ − 3x + 2 (double zero)') },
      ],
      default: 'sq2',
    },
    {
      key: 'x0',
      type: 'number',
      label: L('Startwert x₀', 'Starting value x₀'),
      help: L('Auch den Punkt x₀ auf der x-Achse ziehen oder auf die x-Achse tippen.', 'You can also drag the point x₀ along the x-axis or tap the x-axis.'),
      min: X0_MIN,
      max: X0_MAX,
      step: 0.01,
      default: 1,
    },
    {
      key: 'k',
      type: 'number',
      label: L('Anzahl Schritte n', 'Number of steps n'),
      help: L('Auch mit „Nächster Schritt“ oder „Alles abspielen“.', 'Also with “Next step” or “Play all”.'),
      min: 0,
      max: KMAX,
      step: 1,
      default: 1,
    },
    {
      key: 'zoom',
      type: 'boolean',
      group: 'view',
      label: L('Lupe für kleine Schritte', 'Magnifier for small steps'),
      help: L('Vergrößert den letzten Schritt, sobald er im Bild zu klein wird.', 'Magnifies the latest step as soon as it gets too small to see.'),
      default: true,
    },
    {
      key: 'basin',
      type: 'boolean',
      group: 'view',
      label: L('Einzugsbereiche färben', 'Colour the basins of attraction'),
      help: L('Färbt jeden Startwert auf der x-Achse nach der Nullstelle, zu der das Verfahren von dort aus führt.', 'Colours every starting value on the x-axis by the zero the method reaches from there.'),
      default: false,
    },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Werte zeigen', 'Show values'),
      help: L('Aus: Näherungswerte und Nullstellen erscheinen als „?“ – im Bild und in den Karten (für Aufgaben).', 'Off: approximations and zeros appear as “?” – in the picture and on the cards (for tasks).'),
      default: true,
    },
  ],
  actions: [
    { id: 'step', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'play', label: L('Alles abspielen', 'Play all') },
    { id: 'restart', label: L('Neu starten', 'Start again') },
  ],
  readouts: [
    { key: 'xk', label: L('Näherungswert', 'Approximation'), spoiler: true },
    { key: 'fxk', label: L('Funktionswert', 'Function value'), spoiler: true },
    { key: 'rule', label: L('Letzter Schritt', 'Latest step'), spoiler: true },
    { key: 'state', label: L('Verlauf', 'Behaviour'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'sqrt2', label: L('√2 mit x₀ = 1 (wie Heron)', '√2 with x₀ = 1 (like Heron)'), values: {} },
    { id: 'newton', label: L('Newtons Beispiel x³ − 2x − 5', 'Newton’s example x³ − 2x − 5'), values: { fn: 'cubic', x0: 2, k: 3 } },
    { id: 'cos', label: L('cos x = x', 'cos x = x'), values: { fn: 'cos', x0: 1, k: 3 } },
    { id: 'flat', label: L('Waagrechte Tangente', 'Horizontal tangent'), values: { fn: 'three', x0: 1, k: 1 } },
    { id: 'cycle', label: L('Zyklus: 0 → 1 → 0 → …', 'Cycle: 0 → 1 → 0 → …'), values: { fn: 'cycle', x0: 0, k: 4 } },
    { id: 'jump', label: L('Sprung zur anderen Nullstelle', 'Jump to another zero'), values: { fn: 'three', x0: 0.95, k: 5, basin: true } },
  ],
  strings: {
    de: {
      canvas:
        'Koordinatensystem mit dem Graphen von f und einem ziehbaren Startwert x₀ auf der x-Achse. Für jeden Schritt des Newton-Verfahrens führt ein Lot zum Graphen, dort wird die Tangente angelegt, und ihr Schnittpunkt mit der x-Achse ist der nächste Näherungswert; ein Steigungsdreieck zeigt f(xₙ) und xₙ − xₙ₊₁. Eine Lupe vergrößert kleine Schritte. Auf Wunsch sind die Einzugsbereiche eingefärbt und unten mit A, B, C (Nullstelle von links) bzw. „–“ (keine Nullstelle) beschriftet. Rechts bzw. darunter Karten mit der Rechnung, einer Erklärung zum Verlauf und einer Tabelle der Näherungswerte mit fett gedruckten richtigen Stellen.',
    },
    en: {
      canvas:
        'Coordinate system with the graph of f and a draggable starting value x₀ on the x-axis. For each step of Newton’s method a vertical line leads to the graph, the tangent is drawn there, and its x-intercept is the next approximation; a slope triangle shows f(xₙ) and xₙ − xₙ₊₁. A magnifier enlarges small steps. Optionally the basins of attraction are coloured and labelled A, B, C at the bottom (zeros from the left) or “–” (no zero). On the right or below, cards with the calculation, an explanation of the behaviour and a table of approximations with the correct digits in bold.',
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
    const key = () => p.fn as FnKey;
    const fnNow = (): Fn => FNS[key()];
    const meta = () => META[key()];
    const kNow = () => clamp(Math.round(p.k), 0, KMAX);

    /* ---------- Farben: gleiche Größe = gleiche Farbe ---------- */
    const col = {
      /** Graph von f und Funktionswerte f(x_n) */
      f: () => th().series[0]!,
      /** Tangente und ihre Steigung f′(x_n) */
      t: () => th().series[3]!,
      /** Näherungswerte x_n */
      x: () => th().series[4]!,
      /** Nullstelle, richtige Stellen */
      r: () => th().series[2]!,
      /** Scheitern: waagrechte Tangente, Zyklus, Davonlaufen */
      bad: () => th().series[1]!,
    };
    /* Flächen, Ränder, Schatten und Glanz nur aus dem Theme gemischt */
    /** Schatten: dunkel aus dem Hintergrund, hell aus der Textfarbe (Deckkraft je Modus). */
    const shade = (dark: number, light: number) => (th().dark ? mixColor(th().bg, th().bg, 0, dark) : mixColor(th().text, th().text, 0, light));
    /** Kartenfläche (im Dunkeln etwas heller als der Hintergrund). */
    const surf = (alpha = 1) => mixColor(th().bg, th().text, th().dark ? 0.045 : 0, alpha);
    /** Kartenrand. */
    const edgeLine = () => mixColor(th().bg, th().text, th().dark ? 0.15 : 0.11);
    /** Pillenhintergrund (leicht durchscheinend). */
    const pillBg = () => mixColor(th().bg, th().text, th().dark ? 0.03 : 0, th().dark ? 0.9 : 0.94);
    /** Glanzlicht: helle Farbe des Themes. */
    const shine = () => (th().dark ? th().text : th().bg);
    /** Farben der Einzugsbereiche (je Nullstelle). */
    const basinCol = (i: number) => (i < 0 ? th().muted : [th().series[2]!, th().series[5]!, mixColor(th().series[4]!, th().series[1]!, 0.5)][i % 3]!);

    /* ---------- Zahlen ---------- */
    const N = (v: number, d = 4) => fmt.num(v, d);
    const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const supTxt = (n: number) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((c) => SUP[Number(c)]).join('');
    const isExact = (v: number, d: number) => ctx.fmt.isExact(v, d);
    const eqs = (v: number, d: number) => ctx.fmt.rel(v, d);
    /** Zerlegung m · 10^e (für sehr kleine oder große Werte). */
    function sciParts(v: number): { m: number; e: number } {
      let e = Math.floor(Math.log10(Math.abs(v)));
      let m = v / 10 ** e;
      if (Math.abs(Math.round(m * 10) / 10) >= 10) {
        e += 1;
        m = v / 10 ** e;
      }
      return { m, e };
    }
    const tiny = (v: number) => v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e6);
    /** Zahl als Formeltext (sehr kleine Werte mit Zehnerpotenz). */
    function numSrc(v: number, d = 6): string {
      if (!Number.isFinite(v)) return '–';
      if (!tiny(v)) return fmt.num(v, d);
      const { m, e } = sciParts(v);
      return `${fmt.fixed(m, 1)} · 10^{${e < 0 ? '−' : ''}${Math.abs(e)}}`;
    }
    /** Zahl als Text (sehr kleine Werte mit Zehnerpotenz). */
    function numTxt(v: number, d = 4): string {
      if (!Number.isFinite(v)) return '–';
      if (!tiny(v)) return fmt.num(v, d);
      const { m, e } = sciParts(v);
      return `${fmt.fixed(m, 1)}·10${supTxt(e)}`;
    }
    /** Wird v mit d Nachkommastellen (numSrc) genau angezeigt? */
    const shownExact = (v: number, d: number) => Number.isFinite(v) && !tiny(v) && isExact(v, d);
    /** Buchstaben der Nullstellen (von links), auch für die Einzugsbereiche. */
    const rootLetter = (i: number) => (i < 0 ? '–' : 'ABC'[i] ?? '?');
    const hide = () => !p.show;
    const Q = (s: string) => (hide() ? '?' : s);

    /* ---------- angezeigter Zustand ---------- */
    const X0 = new Chan(p.x0);
    const view = { x0: new Chan(-3), x1: new Chan(3), y0: new Chan(-3), y1: new Chan(5) };
    /** Lupe: Mitte und log10 der Breite (x), Mitte und log10 der Höhe (y), Sichtbarkeit, Lage (0/1 je Achse) */
    const lupe = { c: new Chan(1), lw: new Chan(0), yc: new Chan(0), lh: new Chan(0), a: new Chan(0), qx: new Chan(1), qy: new Chan(1) };
    let lupeCorner: [number, number] = [1, 1];
    let lupeInit = true;
    const kBasin = new Chan(p.basin ? 1 : 0);
    const kZoom = new Chan(p.zoom ? 1 : 0);
    /** Rollen der Tabelle (Zeilen) */
    const scroll = new Chan(0);
    const chans: Chan[] = [X0, view.x0, view.x1, view.y0, view.y1, ...Object.values(lupe), kBasin, kZoom, scroll];

    /** Startzeit und Dauer der Animation je Schritt (−∞: fertig gezeichnet). */
    const start: number[] = new Array<number>(KMAX).fill(-Infinity);
    const dur: number[] = new Array<number>(KMAX).fill(1);
    const prog = (i: number, now: number) => clamp01((now - start[i]!) / dur[i]!);
    function completeAll(): void {
      start.fill(-Infinity);
    }
    function scheduleReveal(from: number, to: number, t0: number, each: number): void {
      for (let i = from; i < to; i++) {
        start[i] = t0 + (i - from) * each;
        dur[i] = each;
      }
    }
    /** Zeitpunkt, an dem die Schritte 0 … k − 1 fertig sind. */
    function endTime(k = kNow()): number {
      let t = -Infinity;
      for (let i = 0; i < k; i++) t = Math.max(t, start[i]! + dur[i]!);
      return t;
    }

    let intro: number | null = null;
    let morph: { from: FnKey; t0: number; dur: number } | null = null;
    let gone: { key: FnKey; steps: Step[]; xs: number[]; from: number; t0: number } | null = null;
    let basinSweep: number | null = null;
    let cardFade: number | null = null;
    let lastKind: Kind | null = null;
    let autoplay = false;
    let autoTimer: ReturnType<typeof setTimeout> | null = null;
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    let hoverAxis: number | null = null;
    let lastTime = performance.now();
    let prevK = kNow();
    let prevFn: FnKey = key();
    let prevX0 = p.x0;
    /** Zeitpunkt des letzten eigenen Funktionswechsels (der passende Startwert folgt sofort danach). */
    let fnSwitchAt = -Infinity;
    /** Erklärkarten ohne Fließtext (wenn die Spalte niedrig ist) */
    let shortNotes = false;

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { plot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.35, 236, 384));
        return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph2 = Math.round(clamp(Math.min(w * 1.02, h * 0.47), 250, h * 0.6));
      return { plot: { x: 0, y: 0, w, h: ph2 }, col: { x: 0, y: ph2 + 10, w, h: h - ph2 - 10 }, wide: false };
    }
    const PAD = () => ({ left: fs(40, 34), bottom: fs(28, 26), top: fs(48, 44), right: fs(16, 12) });
    const plot = new Plot(surface, { x: [-3, 3], y: [-3, 5], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    plot.addHandle({
      get: () => [X0.v, 0],
      set: (x) => {
        lastDrag = performance.now();
        const v = Math.round(clamp(x, X0_MIN, X0_MAX) * 100) / 100;
        if (v !== p.x0) ctx.set({ x0: v });
      },
      axis: 'x',
      enabled: editable,
      color: () => col.x(),
    });

    // Antippen der x-Achse: dort starten
    new TapTarget(surface, {
      hit: (px, py) => {
        if (!editable()) return null;
        const r = plot.rect;
        if (px < r.x + 6 || px > r.x + r.w - 6 || py < r.y || py > r.y + r.h) return null;
        if (Math.abs(py - plot.py(0)) > 13) return null;
        if (Math.abs(px - plot.px(X0.v)) < 28) return null;
        const x = plot.toWorld(px, py)[0];
        if (x < X0_MIN || x > X0_MAX) return null;
        return x.toFixed(2);
      },
      onHover: (id) => {
        hoverAxis = id === null ? null : Number(id);
        ctx.requestRender();
      },
      onTap: (id) => {
        if (!editable()) return;
        stopAuto();
        hoverAxis = null;
        ctx.set({ x0: Number(id) });
      },
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), t: col.t(), x: col.x(), r: col.r(), b: col.bad(), m: th().muted, b0: basinCol(0), b1: basinCol(1), b2: basinCol(2), bn: basinCol(-1) },
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
      g.fillStyle = pillBg();
      g.shadowColor = shade(0.45, 0.14);
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
    const pillSize = (src: string, size: number) => {
      const b = formula(surface.g, src, fstyle(size, th().text, 700));
      return { w: b.w + 16, h: b.asc + b.desc + 10 };
    };

    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01) return;
      g.save();
      g.globalAlpha *= alpha;
      if (hollow) {
        g.fillStyle = th().bg;
        g.strokeStyle = color;
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        return;
      }
      g.save();
      g.shadowColor = shade(0.55, 0.28);
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0.5, x, y, r);
      grad.addColorStop(0, mixColor(color, shine(), 0.45));
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
    function strokePts(pts: Pt[], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
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
        g.shadowColor = th().dark ? shade(0.65, 0) : mixColor(color, shine(), 0.4, 0.55);
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
        g.strokeStyle = mixColor(shine(), shine(), 0, th().dark ? 0.2 : 0.38);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5) return;
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
      arrowHead(x1, y1, ux, uy, color, hd);
    }
    function arrowHead(x: number, y: number, ux: number, uy: number, color: string, hd: number): void {
      // gemeinsame Form aus sim-core
      drawArrowHead(surface.g, x, y, Math.atan2(uy, ux), hd, color);
    }

    function card(r: Rect, accent?: string): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = shade(0.5, 0.1);
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = surf();
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
      g.strokeStyle = edgeLine();
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

    /* =====================================================================
     * Zustand pro Bild
     * ===================================================================== */
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
      if (t > 2600) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 80) / 1000)),
        labels: ease.outCubic(clamp01((t - 700) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 600) / 1400),
      };
    }

    interface Shown {
      fn: Fn;
      /** angezeigte Funktion (beim Wechsel überblendet) */
      f: (x: number) => number;
      steps: Step[];
      xs: number[];
      x0: number;
      outcome: Outcome;
      kind: Kind;
      /** Nullstelle, gegen die die Folge läuft (für richtige Stellen und Fehler) */
      target: number | null;
      targetIndex: number;
    }

    /** Was erklären die Karten? (aus Folge und langfristigem Verlauf) */
    function kindOf(fn: Fn, x0: number, steps: Step[], xs: number[], outcome: Outcome): Kind {
      if (!steps.length) return 'start';
      const last = steps[steps.length - 1]!;
      if (last.next === null) return 'flat';
      if (last.status === 'far') return 'far';
      if (isCycle(xs)) return 'cycle';
      if (outcome.kind === 'cycle' && steps.length >= 3) return 'cycle';
      if (outcome.kind !== 'root' && steps.length >= 3) return 'far';
      if (outcome.kind === 'root') {
        if (fn.mult[outcome.index]! > 1) return 'double';
        if (outcome.index !== nearestRootIndex(fn, x0)) return 'jump';
        return key() === 'sq2' ? 'heron' : 'quad';
      }
      return 'how';
    }

    let shownCache: { k: string; s: Shown } | null = null;
    function shownBase(): Omit<Shown, 'f'> {
      const fn = fnNow();
      const x0 = X0.v;
      const k = kNow();
      const ck = `${key()}|${x0}|${k}`;
      if (shownCache && shownCache.k === ck) return shownCache.s;
      const steps = iterate(fn, x0, k);
      const xs = sequence(fn, x0, k);
      const outcome = classify(fn, x0);
      const kind = kindOf(fn, x0, steps, xs, outcome);
      const target = outcome.kind === 'root' ? outcome.root : null;
      const s: Shown = { fn, f: fn.f, steps, xs, x0, outcome, kind, target, targetIndex: outcome.kind === 'root' ? outcome.index : -1 };
      shownCache = { k: ck, s };
      return s;
    }
    function shown(now: number): Shown {
      const b = shownBase();
      if (!morph) return { ...b, f: b.fn.f };
      const t = clamp01((now - morph.t0) / morph.dur);
      if (t >= 1) return { ...b, f: b.fn.f };
      const old = FNS[morph.from].f;
      const cur = b.fn.f;
      const k = ease.inOutCubic(t);
      return { ...b, f: (x) => lerp(old(x), cur(x), k) };
    }

    /* =====================================================================
     * Ansicht: Grundausschnitt, erweitert um die Näherungswerte
     * ===================================================================== */
    function viewGoal(): { x0: number; x1: number; y0: number; y1: number } {
      const m = meta();
      const fn = fnNow();
      let [a, b] = m.x;
      let [c, d] = m.y;
      const W = b - a;
      const H = d - c;
      const xs = sequence(fn, p.x0, kNow());
      for (const x of xs) {
        if (x >= m.x[0] - W && x <= m.x[1] + W) {
          a = Math.min(a, x - W * 0.07);
          b = Math.max(b, x + W * 0.07);
        }
      }
      for (const x of xs.slice(0, Math.max(1, kNow()))) {
        if (x < a || x > b) continue;
        const y = fn.f(x);
        if (y >= m.y[0] - H && y <= m.y[1] + H) {
          c = Math.min(c, y - H * 0.08);
          d = Math.max(d, y + H * 0.08);
        }
      }
      return { x0: a, x1: b, y0: c, y1: d };
    }
    function retargetView(now: number, instant: boolean): void {
      const goal = viewGoal();
      const pairs: [Chan, number][] = [
        [view.x0, goal.x0],
        [view.x1, goal.x1],
        [view.y0, goal.y0],
        [view.y1, goal.y1],
      ];
      for (const [ch, v] of pairs) {
        if (instant || reduced()) ch.jump(v);
        else if (dragging()) ch.follow(v, 0.3);
        else if (Math.abs(ch.goal - v) > 1e-9) ch.glide(v, 850, 0, now);
      }
    }

    /* =====================================================================
     * Zeichnen eines Schritts (im Hauptbild und in der Lupe)
     * ===================================================================== */
    interface Map {
      X: (x: number) => number;
      Y: (y: number) => number;
      r: Rect;
      lupe: boolean;
    }

    /**
     * Schritt i (von x_i zu x_{i+1}) mit Fortschritt u ∈ [0; 1] und Hervorhebung em
     * (1: aktueller Schritt mit Steigungsdreieck und Beschriftung, 0: blass).
     */
    function drawStep(M: Map, s: Step, i: number, u: number, em: number, alpha: number): void {
      if (u <= 0 || alpha <= 0.01) return;
      const g = surface.g;
      const theme = th();
      const xn = s.x;
      const fx = s.fx;
      const px = M.X(xn);
      const py0 = M.Y(0);
      const pyf = M.Y(fx);
      const lotK = ease.outCubic(ph(u, PH.lot));
      const big = M.lupe ? 1 : 0;
      g.save();
      g.globalAlpha *= alpha;
      // Lot von (x_i | 0) zum Graphen: blass gestrichelt, beim aktuellen Schritt als Kathete f(x_i)
      const yTop = lerp(py0, pyf, lotK);
      g.save();
      g.lineCap = 'round';
      g.setLineDash([4, 4]);
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.lineWidth = 1.4;
      g.globalAlpha *= 1 - em * 0.85;
      g.beginPath();
      g.moveTo(px, py0);
      g.lineTo(px, yTop);
      g.stroke();
      g.restore();
      if (em > 0.01) {
        g.save();
        g.globalAlpha *= em;
        g.strokeStyle = col.f();
        g.lineWidth = 2.6 + big * 0.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(px, py0);
        g.lineTo(px, yTop);
        g.stroke();
        g.restore();
      }
      // Kurvenpunkt
      const popK = ph(u, [0.15, 0.3]);
      if (popK > 0) dot(px, pyf, col.f(), (3.4 + 1.8 * em) * ease.outBack(popK), 1);
      if (u < PH.tan[0]) {
        g.restore();
        return;
      }
      const tk = ease.inOutCubic(ph(u, PH.tan));
      const r = M.r;
      if (s.next === null) {
        // waagrechte Tangente: wächst bis an den Rand, kein Schnittpunkt
        const ext = Math.max(px - r.x, r.x + r.w - px) * tk;
        g.save();
        g.strokeStyle = col.bad();
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(px - ext, pyf);
        g.lineTo(px + ext, pyf);
        g.stroke();
        g.restore();
        if (tk > 0.98) {
          // Pfeilspitzen: „läuft parallel zur x-Achse“
          arrowHead(r.x + 8, pyf, -1, 0, col.bad(), 9);
          arrowHead(r.x + r.w - 8, pyf, 1, 0, col.bad(), 9);
        }
        g.restore();
        return;
      }
      const nx = s.next;
      const d = nx - xn;
      const tanY = (x: number) => fx + s.dfx * (x - xn);
      // Tangente wächst aus dem Kurvenpunkt in beide Richtungen
      const back = xn - d * 0.4 * tk;
      const fwd = xn + d * 1.2 * tk;
      const tw = lerp(1.6, 2.8 + big * 0.3, em);
      g.save();
      if (em > 0.5) {
        g.shadowColor = theme.dark ? shade(0.6, 0) : withAlpha(col.t(), 0.35);
        g.shadowBlur = 6;
      }
      g.strokeStyle = withAlpha(col.t(), lerp(0.5, 1, em));
      g.lineWidth = tw;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(M.X(back), M.Y(tanY(back)));
      g.lineTo(M.X(fwd), M.Y(tanY(fwd)));
      g.stroke();
      g.restore();
      const sk = ease.inOutCubic(ph(u, PH.slide));
      const pnx = M.X(nx);
      // Steigungsdreieck (nur beim hervorgehobenen Schritt)
      const huge = Math.abs(pyf - py0) > M.r.h * 1.5 || Math.abs(pnx - px) > M.r.w * 1.5;
      if (em > 0.01 && sk > 0 && !huge) {
        g.save();
        g.globalAlpha *= em;
        const hx = lerp(px, pnx, sk);
        g.fillStyle = withAlpha(col.t(), theme.dark ? 0.2 : 0.13);
        g.beginPath();
        g.moveTo(px, pyf);
        g.lineTo(px, py0);
        g.lineTo(hx, py0);
        g.lineTo(lerp(px, pnx, sk), lerp(pyf, py0, sk));
        g.closePath();
        g.fill();
        // Kathete x_i − x_{i+1} auf der x-Achse
        g.strokeStyle = withAlpha(col.x(), 0.85);
        g.lineWidth = 4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(px, py0);
        g.lineTo(hx, py0);
        g.stroke();
        // rechter Winkel
        const sx = Math.sign(pnx - px) || 1;
        const sy = Math.sign(pyf - py0) || 1;
        const q = Math.min(9, Math.abs(pnx - px) * 0.3, Math.abs(pyf - py0) * 0.3);
        if (q > 3) {
          g.strokeStyle = withAlpha(theme.text, 0.6);
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(px + sx * q, py0);
          g.lineTo(px + sx * q, py0 + sy * q);
          g.lineTo(px, py0 + sy * q);
          g.stroke();
        }
        g.restore();
      }
      // Punkt gleitet auf der Tangente zur x-Achse
      if (sk > 0 && sk < 1) {
        const gx = lerp(xn, nx, sk);
        dot(M.X(gx), M.Y(tanY(gx)), col.t(), 4.5, 1);
      }
      // neuer Näherungswert leuchtet auf
      const pk = ph(u, PH.pop);
      if (pk > 0 && pk < 1) {
        g.save();
        g.globalAlpha *= (1 - pk) * 0.8;
        g.strokeStyle = col.x();
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(pnx, py0, 6 + pk * 22, 0, TAU);
        g.stroke();
        g.restore();
      }
      g.restore();
      // Beschriftung des Steigungsdreiecks
      if (em > 0.5 && sk > 0.6) drawTriangleLabels(M, s, i, alpha * em * ease.outCubic(ph(u, [0.6, 0.8])));
    }

    function drawTriangleLabels(M: Map, s: Step, i: number, a: number): void {
      if (a <= 0.01 || s.next === null) return;
      const r = M.r;
      const px = M.X(s.x);
      const pnx = M.X(s.next);
      const py0 = M.Y(0);
      const pyf = M.Y(s.fx);
      const sz = fs(12, 11);
      const side = Math.sign(px - pnx) || 1;
      const hgt = Math.abs(pyf - py0);
      const wid = Math.abs(px - pnx);
      // Kathete f(x_i) neben dem Lot (außerhalb des Dreiecks)
      if (hgt > 34) {
        const src = `\\c{f}{f(x_{${i}})}`;
        const ps = pillSize(src, sz);
        fpill(px + side * (ps.w / 2 + 6), (py0 + pyf) / 2, src, { size: sz, alpha: a, bounds: r });
      }
      // Kathete x_i − x_{i+1} im Dreieck an der x-Achse
      const hsrc = `\\c{x}{x_{${i}} − x_{${i + 1}}}`;
      const hs = pillSize(hsrc, sz - 0.5);
      if (wid > hs.w + 14 && hgt > hs.h + 18) {
        const dy = (Math.sign(pyf - py0) || -1) * (hs.h / 2 + 6);
        fpill((px + pnx) / 2 + side * Math.min(wid * 0.16, 30), py0 + dy, hsrc, { size: sz - 0.5, alpha: a, bounds: r });
      }
      // Steigung der Tangente hinter dem Kurvenpunkt
      if (hgt > 28 && !M.lupe) {
        const xb = s.x - (s.next - s.x) * 0.22;
        const yb = s.fx + s.dfx * (xb - s.x);
        const src = `\\c{t}{${say(L('Steigung', 'slope'))} f′(x_{${i}})}`;
        const ps = pillSize(src, sz - 0.5);
        const lx = M.X(xb) + side * (ps.w / 2 + 4);
        const ly = M.Y(yb) - Math.sign(py0 - pyf || 1) * 14;
        if (lx - ps.w / 2 > r.x + 4 && lx + ps.w / 2 < r.x + r.w - 4 && ly > r.y + 40 && ly < r.y + r.h - 10) fpill(lx, ly, src, { size: sz - 0.5, alpha: a * 0.95, bounds: r });
      }
    }

    /** Hervorhebung von Schritt i: verblasst, sobald der nächste Schritt beginnt. */
    function emph(i: number, count: number, now: number): number {
      if (i === count - 1) return 1;
      return 1 - ease.inOutCubic(ph(prog(i + 1, now), [0, 0.2]));
    }
    /** Ist x_i schon auf der x-Achse angekommen? (0 … 1) */
    function pointIn(i: number, now: number): number {
      if (i === 0) return 1;
      return ph(prog(i - 1, now), [PH.pop[0], PH.pop[0] + 0.08]);
    }
    /** Schritt, der gerade läuft bzw. zuletzt begonnen hat (−1: keiner). */
    function activeStep(count: number, now: number): number {
      let a = -1;
      for (let i = 0; i < count; i++) if (prog(i, now) > 0) a = i;
      return a;
    }

    /* =====================================================================
     * Hauptbild
     * ===================================================================== */
    function sampleF(f: (x: number) => number, x0: number, x1: number, X: (x: number) => number, Y: (y: number) => number, r: Rect, count: number): Pt[] {
      const out: Pt[] = [];
      if (!(x1 > x0)) return out;
      const lim2 = r.h * 3;
      for (let i = 0; i <= count; i++) {
        const x = x0 + ((x1 - x0) * i) / count;
        const y = f(x);
        out.push([X(x), Number.isFinite(y) ? clamp(Y(y), r.y - lim2, r.y + r.h + lim2) : NaN]);
      }
      return out;
    }

    let basinCache: { key: string; vals: number[] } | null = null;
    function basinVals(n: number): number[] {
      const x0 = view.x0.v;
      const x1 = view.x1.v;
      const ck = `${key()}|${x0.toFixed(5)}|${x1.toFixed(5)}|${n}`;
      if (basinCache && basinCache.key === ck) return basinCache.vals;
      const starts: number[] = [];
      for (let i = 0; i < n; i++) starts.push(plot.toWorld(plot.rect.x + ((i + 0.5) / n) * plot.rect.w, 0)[0]);
      const vals = basinMap(fnNow(), starts, 60);
      basinCache = { key: ck, vals };
      return vals;
    }

    function drawBasins(alpha: number, now: number): void {
      const g = surface.g;
      const r = plot.rect;
      const n = Math.max(40, Math.round(r.w / 2));
      const vals = basinVals(n);
      const sweep = basinSweep === null ? 1 : ease.inOutCubic(clamp01((now - basinSweep) / 900));
      const y0 = plot.py(0);
      const wpx = r.w / n;
      const dark = th().dark;
      g.save();
      g.globalAlpha *= alpha;
      for (let i = 0; i < n; i++) {
        const x = r.x + i * wpx;
        if (x > r.x + r.w * sweep) break;
        const v = vals[i]!;
        const c = basinCol(v);
        g.fillStyle = mixColor(c, c, 0, v < 0 ? 0.05 : dark ? 0.08 : 0.085);
        g.fillRect(x, r.y, wpx + 0.6, r.h);
        g.fillStyle = v < 0 ? withAlpha(th().muted, 0.55) : c;
        g.fillRect(x, y0 - 4, wpx + 0.6, 8);
      }
      // Buchstaben je Bereich (nicht nur über die Farbe unterscheidbar): A, B, C wie in der Karte, „–“ ohne Nullstelle
      const ly = r.y + r.h - 11;
      g.font = `800 ${fs(12, 11)}px ${th().font}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      let i0 = 0;
      for (let i = 1; i <= n; i++) {
        if (i < n && vals[i] === vals[i0]) continue;
        const xa = r.x + i0 * wpx;
        const xb = r.x + i * wpx;
        if (xb - xa >= 16 && (xa + xb) / 2 <= r.x + r.w * sweep) {
          const v = vals[i0]!;
          g.strokeStyle = th().bg;
          g.lineWidth = 3;
          g.strokeText(rootLetter(v), (xa + xb) / 2, ly);
          g.fillStyle = v < 0 ? th().muted : basinCol(v);
          g.fillText(rootLetter(v), (xa + xb) / 2, ly);
        }
        i0 = i;
      }
      g.restore();
    }

    /** Zyklus als Kreislauf: Bogen hin über der Achse, Bogen zurück darunter. */
    function drawCycle(xa: number, xb: number, alpha: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const pa = plot.px(Math.min(xa, xb));
      const pb = plot.px(Math.max(xa, xb));
      const y0 = plot.py(0);
      const h = clamp((pb - pa) * 0.32, 18, 46);
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = col.bad();
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      const arc = (from: number, to: number, up: number) => {
        const mx = (from + to) / 2;
        const my = y0 + up * h * 2;
        g.beginPath();
        g.moveTo(from, y0 + up * 9);
        g.quadraticCurveTo(mx, my, to, y0 + up * 9);
        g.stroke();
        // Spitze in Richtung der Kurve am Ende
        const tx = to - mx;
        const ty = y0 + up * 9 - my;
        const len = Math.hypot(tx, ty) || 1;
        arrowHead(to, y0 + up * 9, tx / len, ty / len, col.bad(), 9);
      };
      arc(pa + 4, pb - 4, -1);
      arc(pb - 4, pa + 4, 1);
      g.restore();
      fpill((pa + pb) / 2, y0 + h + 20, `\\c{b}{${say(L('Zyklus', 'cycle'))}}`, { size: fs(12, 11), alpha, border: withAlpha(col.bad(), 0.6), bounds: plot.rect });
    }

    function drawPlot(V: Shown, now: number, k: Intro): void {
      plot.setRangePadded([view.x0.v, view.x1.v], [view.y0.v, view.y1.v], PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const M: Map = { X: (x) => plot.px(x), Y: (y) => plot.py(y), r, lupe: false };
      const xa = plot.toWorld(r.x, 0)[0];
      const xb = plot.toWorld(r.x + r.w, 0)[0];
      // Einzugsbereiche
      if (kBasin.v > 0.01) drawBasins(kBasin.v * k.labels, now);
      // Graph von f, beim Einstieg von links nach rechts
      const xr = lerp(xa, xb, k.reveal);
      strokePts(sampleF(V.f, xa, xr, M.X, M.Y, r, Math.round(clamp(r.w * 0.8, 120, 700))), col.f(), fs(3.3, 2.8), { glow: true });
      // Nullstellen (verraten die Lösung → nur mit „Werte zeigen“)
      if (!hide() && !morph) {
        V.fn.roots.forEach((x, j) => {
          if (x < xa || x > xb) return;
          const c = kBasin.v > 0.5 ? basinCol(j) : col.r();
          dot(plot.px(x), plot.py(0), c, 6, k.labels * 0.95, true);
          // mit Einzugsbereichen: Buchstabe der Nullstelle wie unten im Bereich und in der Karte
          if (kBasin.v > 0.5) {
            const g = surface.g;
            g.save();
            g.globalAlpha *= k.labels * kBasin.v;
            g.font = `800 ${fs(12, 11)}px ${th().font}`;
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            g.lineJoin = 'round';
            g.strokeStyle = th().bg;
            g.lineWidth = 3;
            g.strokeText(rootLetter(j), plot.px(x) + 7, plot.py(0) - 13);
            g.fillStyle = c;
            g.fillText(rootLetter(j), plot.px(x) + 7, plot.py(0) - 13);
            g.restore();
          }
        });
      }
      // verschwindende Schritte (nach Zurücksetzen oder Wechsel der Funktion)
      if (gone) {
        const t = (now - gone.t0) / 420;
        if (t >= 1) gone = null;
        else {
          const ga = 1 - ease.outCubic(clamp01(t));
          for (let i = gone.from; i < gone.steps.length; i++) drawStep(M, gone.steps[i]!, i, 1, i === gone.steps.length - 1 ? 1 : 0, ga * 0.9);
          for (let i = gone.from + 1; i < gone.xs.length; i++) dot(plot.px(gone.xs[i]!), plot.py(0), col.x(), 4.5, ga);
        }
      }
      // Schritte
      const count = morph ? 0 : V.steps.length;
      for (let i = 0; i < count; i++) {
        const u = prog(i, now);
        drawStep(M, V.steps[i]!, i, u, emph(i, count, now), k.labels);
      }
      // Zyklus als Kreislauf
      if (V.kind === 'cycle' && count >= 2) {
        const last = V.xs.length - 1;
        const done = ph(prog(count - 1, now), [0.85, 1]);
        const cv = V.outcome.kind === 'cycle' && !isCycle(V.xs) ? V.outcome.values : [V.xs[last]!, V.xs[last - 1]!];
        drawCycle(cv[0]!, cv[1]!, done * k.labels);
      }
      // Näherungswerte auf der x-Achse
      const axisY = plot.py(0);
      const pts = morph ? [V.x0] : V.xs;
      for (let i = pts.length - 1; i >= 1; i--) {
        const a = pointIn(i, now);
        if (a <= 0) continue;
        const newest = i === pts.length - 1;
        dot(plot.px(pts[i]!), axisY, col.x(), (newest ? 5.5 : 4.2) * ease.outBack(clamp01(a * 1.4)), (newest ? 1 : 0.75) * k.labels);
      }
      // Vorschau beim Überfahren der x-Achse
      if (hoverAxis !== null) {
        dot(plot.px(hoverAxis), axisY, col.x(), 6, 0.45, true);
        fpill(plot.px(hoverAxis), axisY - 22, `\\c{x}{x_0 = ${N(hoverAxis, 2)}?}`, { size: fs(11.5, 11), alpha: 0.85, bounds: r });
      }
      // Startwert
      dot(plot.px(V.x0), axisY, col.x(), 7.5, k.labels);
      drawPointLabels(V, now, k, pts);
      drawOffscreen(V, now, k);
      if (k.labels > 0.01) drawLupe(V, now, k);
      // Legende
      fpill(r.x + 10, r.y + 20, `\\c{f}{f(x) = ${meta().term}}`, { align: 'left', size: fs(13.5, 12.5), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.w * 0.6 });
      plot.end();
    }

    /** Beschriftungen x_i an der x-Achse (ohne Überlappung; der neueste Wert zuerst). */
    function drawPointLabels(V: Shown, now: number, k: Intro, pts: number[]): void {
      const r = plot.rect;
      const axisY = plot.py(0);
      const placed: { l: number; r: number; side: number }[] = [];
      const order = pts.map((_, i) => i).sort((a, b) => (b === pts.length - 1 ? 1 : a === pts.length - 1 ? -1 : a === 0 ? -1 : b === 0 ? 1 : b - a));
      const sz = fs(12.5, 11.5);
      for (const i of order) {
        const a = pointIn(i, now) * k.labels;
        if (a <= 0.01) continue;
        const x = pts[i]!;
        const px = plot.px(x);
        if (px < r.x + 4 || px > r.x + r.w - 4) continue;
        const newest = i === pts.length - 1 && i > 0;
        const fy = V.fn.f(x);
        const side = fy > 0 ? 1 : -1;
        let src = `\\c{x}{x_{${i}}}`;
        if (newest && !hide()) {
          const val = `\\c{x}{x_{${i}} ${eqs(x, 4)} ${N(x, 4)}}`;
          const w = pillSize(val, sz).w;
          if (!placed.some((q) => q.side === side && px + w / 2 > q.l - 4 && px - w / 2 < q.r + 4)) src = val;
        }
        if (i === 0 && !newest) src = `\\c{x}{x_0}`;
        const w = pillSize(src, sz).w;
        if (placed.some((q) => q.side === side && px + w / 2 > q.l - 4 && px - w / 2 < q.r + 4)) continue;
        placed.push({ l: px - w / 2, r: px + w / 2, side });
        fpill(px, axisY + side * fs(19, 18), src, { size: sz, alpha: a, bounds: r, color: col.x() });
      }
    }

    /** Näherungswerte außerhalb des Bildes: Pfeil am Rand. */
    function drawOffscreen(V: Shown, now: number, k: Intro): void {
      if (morph) return;
      const r = plot.rect;
      const axisY = clamp(plot.py(0), r.y + 50, r.y + r.h - 30);
      for (let i = V.xs.length - 1; i >= 1; i--) {
        const x = V.xs[i]!;
        const px = plot.px(x);
        if (px >= r.x && px <= r.x + r.w) continue;
        const a = pointIn(i, now) * k.labels;
        if (a <= 0.01) return;
        const left = px < r.x;
        const ex = left ? r.x + 8 : r.x + r.w - 8;
        const g = surface.g;
        g.save();
        g.globalAlpha *= a;
        arrowPx(ex + (left ? 34 : -34), axisY, ex, axisY, col.x(), 3, 11);
        g.restore();
        fpill(ex + (left ? 44 : -44), axisY - 22, `\\c{x}{x_{${i}} ${hide() ? '= ?' : `≈ ${numSrc(x, 2)}`}}`, { align: left ? 'left' : 'right', size: fs(12, 11), alpha: a, border: withAlpha(col.x(), 0.55), bounds: r });
        return;
      }
    }

    /* =====================================================================
     * Lupe
     * ===================================================================== */
    function lupeSize(): { w: number; h: number } {
      const r = plot.rect;
      const w = clamp(r.w * 0.34, 140, 270);
      const h = clamp(w * 0.66, 104, Math.min(196, r.h * 0.42));
      return { w, h };
    }
    function lupeRectAt(qx: number, qy: number): Rect {
      const r = plot.rect;
      const { w, h } = lupeSize();
      const top = r.y + 48;
      const bot = r.y + r.h - h - 34;
      return { x: lerp(r.x + 12, r.x + r.w - w - 12, qx), y: lerp(top, Math.max(top, bot), qy), w, h };
    }

    /** Ziel der Lupe: der zuletzt begonnene Schritt (Lot, Tangente, neuer Wert). */
    function lupeGoal(V: Shown, now: number): { c: number; lw: number; yc: number; lh: number; on: boolean } | null {
      const count = morph ? 0 : V.steps.length;
      const j = activeStep(count, now);
      if (j < 0) return null;
      const s = V.steps[j]!;
      if (s.next === null) return null;
      const lo = Math.min(s.x, s.next);
      const hi = Math.max(s.x, s.next);
      const span = hi - lo;
      const W = Math.max(span * 1.9, 4e-13 * Math.max(1, Math.abs(s.x)));
      const H = Math.max(Math.abs(s.fx) * 1.7, Math.abs(s.dfx) * W * 0.25, 1e-15);
      const pxSpan = Math.abs(plot.px(hi) - plot.px(lo));
      const pyH = Math.abs(plot.py(s.fx) - plot.py(0));
      const on = p.zoom && pxSpan < 40 && pyH < 40 && span > 1e-11 * Math.max(1, Math.abs(s.x));
      return { c: (lo + hi) / 2, lw: Math.log10(W), yc: s.fx / 2, lh: Math.log10(H), on };
    }

    function retargetLupe(V: Shown, now: number, dt: number): boolean {
      const goal = lupeGoal(V, now);
      const on = !!goal && goal.on && kZoom.v > 0.5 && !morph;
      let moving = false;
      if (goal) {
        if (lupeInit || reduced()) {
          lupe.c.jump(goal.c);
          lupe.lw.jump(goal.lw);
          lupe.yc.jump(goal.yc);
          lupe.lh.jump(goal.lh);
          lupeInit = false;
        } else {
          const tau = dragging() ? 0.06 : 0.32;
          lupe.c.follow(goal.c, tau);
          lupe.lw.follow(goal.lw, tau);
          lupe.yc.follow(goal.yc, tau);
          lupe.lh.follow(goal.lh, tau);
        }
      }
      lupe.a.follow(on ? 1 : 0, reduced() ? 0 : 0.18);
      // Lage: Ecke mit möglichst wenig Inhalt (mit Zurückhaltung beim Wechseln)
      if (on || lupe.a.v > 0.01) {
        const score = (qx: number, qy: number) => lupeScore(lupeRectAt(qx, qy), V, goal) + qy * 0.6;
        const cur = score(lupeCorner[0], lupeCorner[1]);
        let best = lupeCorner;
        let bestS = cur;
        for (const q of [[1, 0], [0, 1], [1, 1], [0, 0]] as [number, number][]) {
          const sc = score(q[0], q[1]);
          if (sc < bestS * 0.7 - 0.4) {
            best = q;
            bestS = sc;
          }
        }
        if (best !== lupeCorner) lupeCorner = best;
        if (lupe.a.v < 0.02 || reduced()) {
          lupe.qx.jump(lupeCorner[0]);
          lupe.qy.jump(lupeCorner[1]);
        } else {
          lupe.qx.follow(lupeCorner[0], 0.22);
          lupe.qy.follow(lupeCorner[1], 0.22);
        }
      }
      for (const c of Object.values(lupe)) if (c.step(now, dt)) moving = true;
      return moving;
    }

    /** Schneidet die Strecke a–b das Rechteck R (mit 6 px Rand)? (Liang-Barsky) */
    function segHitsRect(a: Pt, b: Pt, R: Rect): boolean {
      const x0 = R.x - 6;
      const x1 = R.x + R.w + 6;
      const y0 = R.y - 6;
      const y1 = R.y + R.h + 6;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      let t0 = 0;
      let t1 = 1;
      const tests: [number, number][] = [
        [-dx, a[0] - x0],
        [dx, x1 - a[0]],
        [-dy, a[1] - y0],
        [dy, y1 - a[1]],
      ];
      for (const [pp, q] of tests) {
        if (pp === 0) {
          if (q < 0) return false;
        } else {
          const t = q / pp;
          if (pp < 0) t0 = Math.max(t0, t);
          else t1 = Math.min(t1, t);
          if (t0 > t1) return false;
        }
      }
      return true;
    }

    /** Wie viel von Graph, Punkten und Ziel läge unter der Lupe? (kleiner = besser) */
    function lupeScore(R: Rect, V: Shown, goal: { c: number; yc: number } | null): number {
      const r = plot.rect;
      const inside = (x: number, y: number) => x > R.x - 6 && x < R.x + R.w + 6 && y > R.y - 6 && y < R.y + R.h + 6;
      let s = 0;
      const n = 120;
      let prev: Pt | null = null;
      for (let i = 0; i <= n; i++) {
        const px = r.x + (r.w * i) / n;
        const x = plot.toWorld(px, 0)[0];
        const cur: Pt = [px, clamp(plot.py(V.fn.f(x)), r.y - 50, r.y + r.h + 50)];
        if (prev && segHitsRect(prev, cur, R)) s += 1;
        prev = cur;
      }
      for (const x of V.xs) if (inside(plot.px(x), plot.py(0))) s += 4;
      for (const st of V.steps) if (inside(plot.px(st.x), plot.py(st.fx))) s += 3;
      if (goal && inside(plot.px(goal.c), plot.py(goal.yc))) s += 60;
      const ay = plot.py(0);
      if (ay > R.y && ay < R.y + R.h) s += 6;
      return s;
    }

    function drawLupe(V: Shown, now: number, k: Intro): void {
      const a = lupe.a.v * k.labels;
      if (a <= 0.01) return;
      const g = surface.g;
      const theme = th();
      const LR = lupeRectAt(lupe.qx.v, lupe.qy.v);
      const W = 10 ** lupe.lw.v;
      const H = 10 ** lupe.lh.v;
      const cx = lupe.c.v;
      const cy = lupe.yc.v;
      const inner: Rect = { x: LR.x + 1, y: LR.y + 1, w: LR.w - 2, h: LR.h - 2 };
      const X = (x: number) => inner.x + inner.w / 2 + ((x - cx) / W) * inner.w;
      const Y = (y: number) => inner.y + inner.h / 2 - ((y - cy) / H) * inner.h;
      const M: Map = { X, Y, r: inner, lupe: true };
      // Rahmen im Hauptbild und Verbindungslinien
      const fx0 = plot.px(cx - W / 2);
      const fx1 = plot.px(cx + W / 2);
      const fy0 = plot.py(cy + H / 2);
      const fy1 = plot.py(cy - H / 2);
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1.4;
      let fr: Rect;
      if (fx1 - fx0 < 10 || fy1 - fy0 < 10) {
        const mx = (fx0 + fx1) / 2;
        const my = (fy0 + fy1) / 2;
        fr = { x: mx - 9, y: my - 9, w: 18, h: 18 };
        g.beginPath();
        g.arc(mx, my, 9, 0, TAU);
        g.stroke();
      } else {
        fr = { x: fx0, y: fy0, w: fx1 - fx0, h: fy1 - fy0 };
        g.strokeRect(fr.x, fr.y, fr.w, fr.h);
      }
      g.setLineDash([3, 4]);
      g.lineWidth = 1.1;
      g.strokeStyle = withAlpha(theme.muted, 0.7);
      const cornersA: Pt[] = [
        [fr.x, fr.y],
        [fr.x + fr.w, fr.y],
        [fr.x, fr.y + fr.h],
        [fr.x + fr.w, fr.y + fr.h],
      ];
      const cornersB: Pt[] = [
        [LR.x, LR.y],
        [LR.x + LR.w, LR.y],
        [LR.x, LR.y + LR.h],
        [LR.x + LR.w, LR.y + LR.h],
      ];
      // zwei äußere Verbindungslinien: die Ecken, die einander „sehen“
      const fcx = fr.x + fr.w / 2;
      const fcy = fr.y + fr.h / 2;
      const lcx = LR.x + LR.w / 2;
      const lcy = LR.y + LR.h / 2;
      const pairs = Math.abs(lcx - fcx) > Math.abs(lcy - fcy) ? (lcy > fcy === lcx > fcx ? [1, 2] : [0, 3]) : lcx > fcx === lcy > fcy ? [1, 2] : [0, 3];
      for (const c of pairs) {
        g.beginPath();
        g.moveTo(cornersA[c]![0], cornersA[c]![1]);
        g.lineTo(cornersB[c]![0], cornersB[c]![1]);
        g.stroke();
      }
      g.setLineDash([]);
      // Fenster
      g.save();
      g.shadowColor = shade(0.6, 0.2);
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      g.fillStyle = theme.bg;
      roundRect(g, LR.x, LR.y, LR.w, LR.h, 12);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, LR.x, LR.y, LR.w, LR.h, 12);
      g.clip();
      g.fillStyle = withAlpha(col.x(), theme.dark ? 0.07 : 0.04);
      g.fillRect(LR.x, LR.y, LR.w, LR.h);
      // x-Achse
      const ay = Y(0);
      g.strokeStyle = withAlpha(theme.axis, 0.9);
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(LR.x, ay);
      g.lineTo(LR.x + LR.w, ay);
      g.stroke();
      // Graph
      const xl = cx - W * 0.6;
      const xr = cx + W * 0.6;
      strokePts(sampleF(V.f, xl, xr, X, Y, inner, 90), col.f(), 2.8, { glow: true });
      // Nullstelle
      if (!hide()) for (const z of V.fn.roots) if (z > xl && z < xr) dot(X(z), ay, col.r(), 5, 1, true);
      // die letzten beiden Schritte
      const count = V.steps.length;
      for (let i = Math.max(0, count - 2); i < count; i++) drawStep(M, V.steps[i]!, i, prog(i, now), emph(i, count, now), 1);
      for (let i = Math.max(1, count - 2); i <= count; i++) {
        const x = V.xs[i];
        if (x === undefined) continue;
        const pa = pointIn(i, now);
        if (pa > 0) dot(X(x), ay, col.x(), i === count ? 5.5 : 4.2, pa);
      }
      // Beschriftungen der Punkte
      const sz = fs(12, 11);
      const done: number[] = [];
      for (let i = count; i >= Math.max(0, count - 2); i--) {
        const x = V.xs[i];
        if (x === undefined || pointIn(i, now) <= 0.05) continue;
        const px = X(x);
        if (px < inner.x || px > inner.x + inner.w || done.some((q) => Math.abs(q - px) < 34)) continue;
        done.push(px);
        const side = V.fn.f(x) > 0 ? 1 : -1;
        fpill(px, ay + side * 18, `\\c{x}{x_{${i}}}`, { size: sz, alpha: pointIn(i, now), bounds: inner, color: col.x() });
      }
      g.restore();
      // Vergrößerung
      const main = (view.x1.v - view.x0.v) / W;
      const e = Math.floor(Math.log10(Math.max(1, main)));
      const mag = main < 1e4 ? `× ${fmt.num(Math.round(main / 10 ** Math.max(0, e - 1)) * 10 ** Math.max(0, e - 1), 0)}` : `× 10^{${e}}`;
      fpill(LR.x + 8, LR.y + 16, `\\c{m}{${say(L('Lupe', 'zoom'))}} ${mag}`, { align: 'left', size: fs(11.5, 11), alpha: 0.95 });
      g.strokeStyle = withAlpha(col.x(), 0.55);
      g.lineWidth = 1.6;
      roundRect(g, LR.x + 0.5, LR.y + 0.5, LR.w - 1, LR.h - 1, 12);
      g.stroke();
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    type Row = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: Row[], right?: string): number {
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
        const a = (rows[i]!.at ?? 1) * clamp01(k.stagger * (rows.length + 2) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        b.draw(g, R.x + pad + (1 - ease.outCubic(a)) * 10, y + b.asc);
        g.restore();
        y += rowH(b) + (rows[i]!.gap ?? 8);
      });
      return h;
    }

    /** Karte aus Formelzeilen und Fließtext. */
    function mixedCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: Row[], note: string, right?: string): number {
      const pad = fs(14, 12);
      const size = fs(12.5, 11.5);
      const font = `500 ${size}px ${th().font}`;
      const lines = note && !shortNotes ? wrapText(note, R.w - 2 * pad, font) : [];
      const lh = size * 1.34;
      const base = formulaCard({ ...R, h: 0 }, true, k, title, accent, rows, right);
      const h = base + lines.length * lh + (lines.length ? 4 : 0);
      if (measure) return h;
      card({ ...R, h }, accent);
      formulaCardBody(R, k, title, accent, rows, right);
      const g = surface.g;
      g.save();
      g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 3 - 1));
      g.font = font;
      g.fillStyle = th().muted;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      lines.forEach((ln, i) => g.fillText(ln, R.x + pad, R.y + base - 4 + lh / 2 + i * lh));
      g.restore();
      return h;
    }
    /** Inhalt einer Formelkarte ohne Hintergrund (für zusammengesetzte Karten). */
    function formulaCardBody(R: Rect, k: Intro, title: string, accent: string, rows: Row[], right?: string): void {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad;
      cardTitle(R, title, accent, right);
      let y = R.y + 36;
      rows.forEach((r, i) => {
        const b = fit(r.src, maxW, r.size ?? fs(13.5, 12.5), r.color ?? th().text, r.weight ?? 600);
        const a = (r.at ?? 1) * clamp01(k.stagger * (rows.length + 2) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        b.draw(g, R.x + pad + (1 - ease.outCubic(a)) * 10, y + b.asc);
        g.restore();
        y += rowH(b) + (r.gap ?? 8);
      });
    }

    /** Rechnung des aktuellen Schritts; die Zahlen erscheinen passend zur Animation. */
    function stepCard(V: Shown, now: number, k: Intro, compact: boolean): CardFn {
      return (R, measure) => {
        const m = meta();
        const i = morph ? -1 : activeStep(V.steps.length, now);
        const rows: Row[] = [
          { src: `\\c{f}{f(x) = ${m.term}}    \\c{t}{f′(x) = ${m.dterm}}`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\c{x}{x_{n+1}} = \\c{x}{x_n} − \\f{\\c{f}{f(x_n)}}{\\c{t}{f′(x_n)}}`, size: fs(16, 14.5), weight: 650, gap: 10 },
        ];
        const xv = (j: number, v: number) => (j === 0 ? N(v, 4) : Q(numSrc(v, 6)));
        if (i < 0) {
          rows.push({ src: `\\c{m}{${say(L('Start:', 'Start:'))}}  \\c{x}{x_0 = ${N(V.x0, 2)}}`, size: fs(14, 13) });
          rows.push({ src: `\\c{m}{${say(L('Drücke „Nächster Schritt“.', 'Press “Next step”.'))}}`, size: fs(12.5, 11.5), color: th().muted });
        } else {
          const s = V.steps[i]!;
          const u = prog(i, now);
          const x = xv(i, s.x);
          // „=“ nur, wenn alle eingesetzten Zahlen ungerundet dastehen
          const xExact = i === 0 || shownExact(s.x, 6);
          if (s.fx === 0 && s.next === s.x) {
            // schon auf der Nullstelle: nicht durch f′ teilen (dort kann f′ = 0 sein)
            rows.push({ src: `\\c{f}{f(${x}) = 0}  ⇒  \\c{x}{x_{${i + 1}} = ${x}}`, size: fs(15, 13.5), gap: 8, at: ease.outCubic(ph(u, [0.1, 0.4])) });
            rows.push({ src: `\\c{r}{${say(L('Nullstelle gefunden', 'zero found'))}}`, size: fs(13, 12), at: ease.outCubic(ph(u, [0.4, 0.7])) });
          } else if (s.next === null) {
            const sep0 = hide() || (xExact && shownExact(s.fx, 4)) ? '=' : '≈';
            rows.push({ src: `\\c{x}{x_{${i + 1}}} ${sep0} ${x} − \\f{\\c{f}{${Q(numSrc(s.fx, 4))}}}{\\c{b}{0}}`, size: fs(15, 13.5), at: ease.outCubic(ph(u, [0.1, 0.4])) });
            rows.push({ src: `\\c{b}{f′(${x}) = 0  ⇒  ${say(L('Division durch 0', 'division by 0'))}}`, size: fs(13, 12), at: ease.outCubic(ph(u, [0.4, 0.7])) });
          } else {
            const fv = u >= PH.lot[1] ? Q(numSrc(s.fx, 6)) : `f(${x})`;
            const dv = u >= PH.tan[1] ? Q(numSrc(s.dfx, 6)) : `f′(${x})`;
            const resV = `${hide() || shownExact(s.next, 7) ? '=' : '≈'} \\c{x}{${Q(numSrc(s.next, 7))}}`;
            const sep = hide() || (xExact && (u < PH.lot[1] || shownExact(s.fx, 6)) && (u < PH.tan[1] || shownExact(s.dfx, 6))) ? '=' : '≈';
            const sub = `\\c{x}{x_{${i + 1}}} ${sep} ${x} − \\f{\\c{f}{${fv}}}{\\c{t}{${dv}}}`;
            const full = `${sub}  ${u >= PH.pop[0] ? resV : ''}`;
            const wide = formula(surface.g, `${sub}  ${resV}`, fstyle(fs(15, 13.5))).w <= R.w - 2 * fs(14, 12);
            if (wide) rows.push({ src: full, size: fs(15, 13.5), gap: 10 });
            else {
              rows.push({ src: sub, size: fs(15, 13.5), gap: 4 });
              rows.push({ src: `\\c{x}{x_{${i + 1}}} ${resV}`, size: fs(15, 13.5), gap: 10, at: u >= PH.pop[0] ? 1 : 0 });
            }
            if (!compact) rows.push({ src: `\\c{m}{${say(L('Steigungsdreieck', 'Slope triangle'))}:}  \\c{t}{f′(x_n)} = \\f{\\c{f}{f(x_n)}}{\\c{x}{x_n − x_{n+1}}}`, size: fs(12.5, 11.5), at: i === 0 || u < 1 ? ease.outCubic(ph(u, PH.slide)) : 1 });
          }
        }
        const right = i >= 0 ? `\\c{t}{${say(L('Schritt', 'step'))} ${i + 1}}` : undefined;
        return formulaCard(R, measure, k, say(L('Newton-Schritt', 'Newton step')), col.t(), rows, right);
      };
    }

    /** Liste der richtigen Stellen „0 → 1 → 2 → 5 → 11“. */
    function digitsChain(V: Shown, upto: number): string {
      if (V.target === null) return '';
      const ds: number[] = [];
      for (let i = 0; i <= upto && i < V.xs.length; i++) ds.push(matchingDecimals(V.xs[i]!, V.target, 12));
      // nach Erreichen der Höchstzahl (Rechengenauigkeit) nicht weiterzählen
      const top = Math.max(...ds);
      ds.length = ds.indexOf(top) + 1;
      // ab dort, wo die Stellenzahl nur noch wächst (Anfang „springt“ oft noch)
      let s0 = ds.length - 1;
      while (s0 > 0 && ds[s0 - 1]! < ds[s0]! && ds[s0 - 1]! >= 0) s0--;
      if (s0 >= ds.length - 1) s0 = Math.max(0, ds.length - 2);
      return ds.slice(s0).map((d) => (d < 0 ? '–' : String(d))).join(' → ');
    }

    /** Wie viele Zeilen der Tabelle sind schon da? */
    function rowsIn(V: Shown, now: number): number {
      let n = 1;
      for (let i = 1; i < V.xs.length; i++) if (pointIn(i, now) > 0) n = i + 1;
      return morph ? 1 : n;
    }

    function statusCard(V: Shown, k: Intro): CardFn {
      const s = (v: string) => Q(v);
      const sz = fs(13, 12);
      const last = V.steps[V.steps.length - 1];
      switch (V.kind) {
        case 'start':
        case 'how':
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('So geht’s', 'How it works')), col.x(), [
              { src: `\\c{m}{①}  ${say(L('senkrecht von', 'straight up from'))} \\c{x}{(x_n | 0)} ${say(L('zum Graphen', 'to the graph'))}`, size: sz, gap: 6 },
              { src: `\\c{m}{②}  \\c{t}{${say(L('Tangente', 'tangent'))}} ${say(L('im Punkt', 'at the point'))} \\c{f}{(x_n | f(x_n))}`, size: sz, gap: 6 },
              { src: `\\c{m}{③}  ${say(L('Schnitt mit der x-Achse:', 'x-intercept:'))} \\c{x}{x_{n+1}}`, size: sz },
            ], say(L('Liegt x₀ nahe genug an einer Nullstelle, kommt man ihr sehr schnell näher.', 'If x₀ is close enough to a zero, the approximations close in on it very quickly.')));
        case 'heron':
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('Newton = Heron', 'Newton = Heron')), col.r(), [
              { src: `x_{n+1} = x_n − \\f{x_n² − 2}{2x_n} = \\f{1}{2}\\b{(}x_n + \\f{2}{x_n}\\b{)}`, size: fs(13.5, 12.5), gap: 10 },
              { src: `\\c{m}{${say(L('Fehler', 'error'))}:}  e_{n+1} ≈ \\f{e_n²}{2\\r{2}}  \\c{m}{(${say(L('quadratisch', 'quadratic'))})}`, size: sz },
            ], say(L('Für x² − 2 rechnet das Newton-Verfahren genau wie das Heron-Verfahren: Mittelwert aus x und 2 : x.', 'For x² − 2 Newton’s method computes exactly like Heron’s method: the mean of x and 2 : x.')));
        case 'quad': {
          const C = V.target !== null ? quadConstant(V.fn, V.target) : NaN;
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('Quadratische Konvergenz', 'Quadratic convergence')), col.r(), [
              { src: `\\c{r}{x^* ${hide() ? '= ?' : `≈ ${N(V.target ?? 0, 6)}`}}   e_n = |x_n − x^*|`, size: sz, gap: 8 },
              { src: `e_{n+1} ≈ C · e_n²   \\c{m}{(C ${hide() ? '= ?' : `≈ ${N(C, 3)}`})}`, size: sz },
            ], say(L('Der Fehler wird mit jedem Schritt etwa quadriert: Die Zahl der richtigen Stellen verdoppelt sich ungefähr.', 'The error is roughly squared in each step: the number of correct digits roughly doubles.')));
        }
        case 'double':
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('Doppelte Nullstelle: langsam', 'Double zero: slow')), col.t(), [
              { src: `f(x) = (x − 1)² · (x + 2)   \\c{t}{f′(1) = 0}`, size: sz, gap: 8 },
              { src: `e_{n+1} ≈ \\f{1}{2} · e_n   \\c{m}{(${say(L('linear', 'linear'))})}`, size: sz },
            ], say(L('Dort berührt der Graph die x-Achse. Der Fehler halbiert sich nur – für eine Stelle mehr braucht man etwa 3 Schritte.', 'The graph touches the x-axis there. The error is only halved – one more digit takes about 3 steps.')));
        case 'jump': {
          const r = V.target ?? 0;
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('Sprung zu einer anderen Nullstelle', 'Jump to another zero')), col.x(), [
              { src: `\\c{x}{x_0 = ${N(V.x0, 2)}}  →  \\c{r}{x^* ${hide() ? '= ?' : `≈ ${N(r, 4)}`}}`, size: sz, gap: 8 },
              { src: `\\c{m}{${say(L('nächste Nullstelle wäre', 'nearest zero would be'))}} ${hide() ? '?' : `≈ ${N(V.fn.roots[nearestRootIndex(V.fn, V.x0)]!, 4)}`}`, size: fs(12.5, 11.5), color: th().muted },
            ], say(L('Nahe einem Extrempunkt ist die Tangente fast waagrecht – ihr Schnittpunkt mit der x-Achse liegt weit weg.', 'Near a turning point the tangent is almost horizontal – its x-intercept lies far away.')));
        }
        case 'flat':
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('Waagrechte Tangente', 'Horizontal tangent')), col.bad(), [
              { src: `\\c{t}{f′(${last ? N(last.x, 4) : ''}) = 0}  ⇒  \\c{b}{${say(L('kein Schnittpunkt', 'no intercept'))}}`, size: sz },
            ], say(L('Die Tangente verläuft parallel zur x-Achse. Das Verfahren bricht ab – wähle einen anderen Startwert.', 'The tangent runs parallel to the x-axis. The method stops – choose another starting value.')));
        case 'cycle': {
          const exact = isCycle(V.xs);
          const vals = V.outcome.kind === 'cycle' && !exact ? V.outcome.values : [V.xs[V.xs.length - 1]!, V.xs[V.xs.length - 2]!];
          const b = vals[0]!;
          const a = vals[1]!;
          const approx = !isExact(a, 3) || !isExact(b, 3);
          const cyc = (v: number) => `${approx ? '≈ ' : ''}${N(v, 3)}`;
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('Zyklus', 'Cycle')), col.bad(), [
              { src: `\\c{x}{${s(cyc(b))} → ${s(cyc(a))} → ${s(cyc(b))} → …}`, size: sz },
            ], say(L('Die Tangenten schicken sich gegenseitig zurück: Die Folge springt endlos hin und her und findet keine Nullstelle.', 'The tangents send each other back: the sequence jumps back and forth for ever and finds no zero.')));
        }
        case 'far':
          return (R, measure) =>
            mixedCard(R, measure, k, say(L('Kein Ziel in Sicht', 'No target in sight')), col.bad(), [], say(L('Die Werte springen weit umher oder laufen davon. Wähle einen Startwert näher an einer Nullstelle.', 'The values jump far around or run away. Choose a starting value closer to a zero.')));
      }
    }

    function basinCard(V: Shown, k: Intro): CardFn {
      return (R, measure) => {
        const parts = V.fn.roots.map((r, j) => `\\c{b${j}}{● ${rootLetter(j)}} ${hide() ? '= ?' : `${eqs(r, 3)} ${N(r, 3)}`}`);
        const rows: Row[] = [
          { src: parts.join('    '), size: fs(13, 12), gap: 6 },
          { src: `\\c{bn}{● –} \\c{m}{${say(L('keine Nullstelle (Zyklus, waagrecht, davon)', 'no zero (cycle, horizontal, runs off)'))}}`, size: fs(12, 11) },
        ];
        return formulaCard(R, measure, k, say(L('Einzugsbereiche: Startwert → Nullstelle', 'Basins: start → zero')), basinCol(0), rows);
      };
    }

    /** Tabelle der Näherungswerte, richtige Stellen fett; füllt den Rest der Spalte. */
    function tableCard(V: Shown, now: number, k: Intro, R0: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = fs(14, 12);
      // Hinweis unten
      const noteFont = `500 ${fs(12, 11)}px ${theme.font}`;
      let note = '';
      const nIn = rowsIn(V, now);
      const lastD = V.target === null ? -1 : matchingDecimals(V.xs[nIn - 1]!, V.target, 12);
      if (V.target !== null && (V.kind === 'heron' || V.kind === 'quad' || V.kind === 'jump') && nIn >= 3 && lastD >= 2) {
        note = hide()
          ? say(L('Fett: richtige Stellen. Ihre Anzahl verdoppelt sich ungefähr.', 'Bold: correct digits. Their number roughly doubles.'))
          : `${say(L('Richtige Stellen', 'Correct digits'))}: ${digitsChain(V, nIn - 1)}${say(L(' – sie verdoppeln sich ungefähr.', ' – they roughly double.'))}`;
      } else if (V.kind === 'double' && nIn >= 3 && V.target !== null && V.xs[nIn - 1] !== V.target) note = say(L('Langsam: Der Fehler halbiert sich nur.', 'Slow: the error is only halved.'));
      else if (V.kind === 'cycle') note = say(L('Die Werte wiederholen sich – kein Fortschritt.', 'The values repeat – no progress.'));
      else if (V.kind === 'flat') note = say(L('Kein weiterer Näherungswert möglich.', 'No further approximation possible.'));
      const noteLines = note ? wrapText(note, R0.w - 2 * pad, noteFont).slice(0, 3) : [];
      const nlh = fs(12, 11) * 1.32;
      // nur so hoch wie nötig (mindestens Platz für 4 Zeilen)
      const needH = 44 + 12 + Math.max(4, V.xs.length) * fs(22, 20) + (noteLines.length ? noteLines.length * nlh + 6 : 0) + 10;
      const R: Rect = { ...R0, h: Math.min(R0.h, needH) };
      card(R, col.x());
      cardTitle(R, say(L('Näherungswerte', 'Approximations')), col.x(), hide() || V.target === null ? undefined : `\\c{r}{${say(L('fett: richtige Stellen', 'bold: correct digits'))}}`);
      const fsz = fs(12.5, 11.5);
      const mono = (w: number) => `${w} ${fsz}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      g.font = mono(500);
      const cw = g.measureText('0').width;
      const inner = R.w - 2 * pad;
      const nW = fs(24, 20);
      const sample = '−8,8·10⁻¹⁰';
      g.font = `600 ${fs(12, 11)}px ${theme.font}`;
      const smallW = g.measureText(sample).width;
      // Spalten: n | x_n | f(x_n) | Fehler (schmal: ohne f(x_n))
      let dec = 10;
      let withF = true;
      const need = (d: number, f: boolean) => nW + (d + 3) * cw + 12 + (f ? smallW + 12 : 0) + smallW;
      while (need(dec, withF) > inner && dec > 6) dec--;
      if (need(dec, withF) > inner) withF = false;
      while (need(dec, withF) > inner && dec > 4) dec--;
      const c0 = R.x + pad;
      const c1 = c0 + nW;
      const c3 = R.x + R.w - pad;
      const c2 = withF ? c3 - smallW - 12 : c3;
      const hy = R.y + 44;
      const hf = `700 ${fs(11.5, 11)}px ${theme.font}`;
      const label = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign) => {
        g.font = font;
        g.fillStyle = color;
        g.textAlign = align;
        g.textBaseline = 'middle';
        g.fillText(s, x, y);
      };
      label('n', c0, hy, hf, theme.muted, 'left');
      label('xₙ', c1, hy, hf, col.x(), 'left');
      if (withF) label('f(xₙ)', c2, hy, hf, col.f(), 'right');
      label(say(L('Fehler', 'error')), c3, hy, hf, theme.muted, 'right');
      const bodyTop = hy + 12;
      const bodyBot = R.y + R.h - 8 - noteLines.length * nlh - (noteLines.length ? 6 : 0);
      // Zeilenhöhe: normal 22 px (schmal 20 px), bei Platzmangel bis 17 px, damit mehr Zeilen sichtbar bleiben
      const rH = clamp((bodyBot - bodyTop) / Math.max(1, nIn), 17, fs(22, 20));
      const fitRows = Math.max(1, Math.floor((bodyBot - bodyTop) / rH));
      scroll.follow(Math.max(0, nIn - fitRows), reduced() ? 0 : 0.18);
      const off = scroll.v;
      g.save();
      g.beginPath();
      g.rect(R.x, bodyTop, R.w, bodyBot - bodyTop);
      g.clip();
      for (let i = 0; i < V.xs.length; i++) {
        const y = bodyTop + (i - off + 0.5) * rH;
        if (y < bodyTop - rH || y > bodyBot + rH) continue;
        let a = (k.stagger >= 1 ? 1 : clamp01(k.stagger * 8 - (i - off))) * (morph ? (i === 0 ? 1 : 0) : pointIn(i, now));
        if (a <= 0.001) continue;
        a = ease.outCubic(a);
        g.save();
        g.globalAlpha *= a;
        if (i === nIn - 1) {
          g.fillStyle = withAlpha(col.x(), theme.dark ? 0.16 : 0.08);
          roundRect(g, R.x + pad - 6, y - rH / 2 + 1, R.w - 2 * pad + 12, rH - 2, 6);
          g.fill();
        }
        const x = V.xs[i]!;
        label(String(i), c0, y, `700 ${fsz}px ${theme.font}`, theme.muted, 'left');
        if (hide() && i > 0) {
          label('?', c1, y, mono(700), col.x(), 'left');
          if (withF) label('?', c2, y, mono(600), theme.muted, 'right');
          label('?', c3, y, mono(600), theme.muted, 'right');
          g.restore();
          continue;
        }
        const lead = Math.max(1, Math.floor(Math.log10(Math.abs(x) || 1)) + 1);
        const sv = Math.abs(x) >= 1e6 ? numTxt(x, 2) : fmt.fixed(x, Math.max(1, dec + 1 - lead - (lead > 1 ? 1 : 0)));
        const sep = fmt.decimalSeparator;
        const md = V.target === null ? -1 : Math.min(dec, matchingDecimals(x, V.target, 12));
        const ci = sv.indexOf(sep);
        const cut = V.target === null || ci < 0 ? 0 : md < 0 ? 0 : Math.min(sv.length, md === 0 ? ci : ci + 1 + md);
        const a0 = sv.slice(0, cut);
        const b0 = sv.slice(cut);
        g.font = mono(800);
        const wa = g.measureText(a0).width;
        label(a0, c1, y, mono(800), col.r(), 'left');
        label(b0, c1 + wa, y, mono(500), withAlpha(theme.text, theme.dark ? 0.8 : 0.75), 'left');
        const fx = V.fn.f(x);
        if (withF) label(numTxt(fx, Math.abs(fx) >= 1000 ? 0 : Math.abs(fx) >= 100 ? 2 : 4), c2, y, `600 ${fs(12, 11)}px ${theme.font}`, col.f(), 'right');
        const err = V.target === null ? '–' : numTxt(Math.abs(x - V.target), 4);
        label(err, c3, y, `600 ${fs(12, 11)}px ${theme.font}`, theme.muted, 'right');
        g.restore();
      }
      g.restore();
      // Hinweis auf weitere Zeilen oben
      if (off > 0.3) {
        g.save();
        const grad = g.createLinearGradient(0, bodyTop, 0, bodyTop + 14);
        grad.addColorStop(0, surf(1));
        grad.addColorStop(1, surf(0));
        g.fillStyle = grad;
        g.fillRect(R.x + 2, bodyTop, R.w - 4, 14);
        g.restore();
      }
      g.save();
      g.globalAlpha *= ease.outCubic(k.stagger);
      noteLines.forEach((ln, i) => label(ln, R.x + pad, bodyBot + 6 + nlh / 2 + i * nlh, noteFont, V.target !== null && V.kind !== 'double' ? mixColor(col.r(), theme.text, 0.35) : theme.muted, 'left'));
      g.restore();
    }

    function drawColumn(C: Rect, V: Shown, now: number, k: Intro): void {
      const g = surface.g;
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const compact = C.h < 470 && regions().wide;
      const step = stepCard(V, now, k, compact);
      const status = statusCard(V, k);
      const basin = p.basin ? basinCard(V, k) : null;
      const minTable = 44 + 12 + clamp(V.xs.length, 2, 3) * fs(22, 20) + 34;
      /** knappste Tabelle (2 enge Zeilen), bevor die Erklärkarte weichen muss */
      const tightTable = 44 + 12 + 2 * 17 + 30;
      shortNotes = false;
      const hs = step(C, true);
      let hst = status(C, true);
      let hb = basin ? basin(C, true) : 0;
      // Platz: Rechnung, Erklärung, (Einzugsbereiche), Tabelle – notfalls kürzer bzw. ohne die hinteren Karten
      const free = () => C.h - hs - (hst ? hst + gap : 0) - (hb ? hb + gap : 0) - gap;
      if (free() < minTable) {
        shortNotes = true;
        hst = status(C, true);
      }
      if (free() < minTable) hb = 0;
      if (free() < tightTable && V.kind !== 'flat' && V.kind !== 'cycle' && V.kind !== 'far') hst = 0;
      const place = (fn: CardFn, R: Rect, i: number) => {
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        fn(R, false);
        g.restore();
      };
      let y = C.y;
      place(step, { x: C.x, y, w: C.w, h: hs }, 0);
      y += hs + gap;
      if (hst) {
        place(status, { x: C.x, y, w: C.w, h: hst }, 1);
        y += hst + gap;
      }
      if (basin && hb) {
        place(basin, { x: C.x, y, w: C.w, h: hb }, 2);
        y += hb + gap;
      }
      const th2 = C.y + C.h - y;
      if (th2 >= 44 + 12 + fs(22, 20) + 8) {
        g.save();
        const a = clamp01(k.cards * 1.6 - 0.75);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        tableCard(V, now, k, { x: C.x, y, w: C.w, h: th2 });
        g.restore();
      }
    }

    /* =====================================================================
     * Ergebnisse
     * ===================================================================== */
    function updateReadouts(): void {
      const fn = fnNow();
      const k = kNow();
      const steps = iterate(fn, p.x0, k);
      const xs = sequence(fn, p.x0, k);
      const n = xs.length - 1;
      const v = (s: string) => `<var>${s}</var>`;
      const xi = (i: number) => `${v('x')}<sub>${i}</sub>`;
      const html = (s: string) => s.replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>').replace(/ · 10<sup>/g, ' · 10<sup>');
      const xn = xs[n]!;
      ctx.readout('xk', { html: `${xi(n)} ${shownExact(xn, 8) ? '=' : '≈'} <strong>${html(numSrc(xn, 8))}</strong>` });
      const fl = fn.f(xn);
      ctx.readout('fxk', { html: `${v('f')}(${xi(n)}) ${shownExact(fl, 6) ? '=' : '≈'} ${html(numSrc(fl, 6))}` });
      const last = steps[steps.length - 1];
      if (!last) ctx.readout('rule', { html: `${say(L('Startwert', 'Starting value'))} ${xi(0)} = ${N(p.x0, 2)}` });
      else if (last.fx === 0 && last.next === last.x) ctx.readout('rule', { html: `${v('f')}(${N(last.x, 4)}) = 0: ${say(L('Nullstelle gefunden', 'zero found'))}` });
      else if (last.next === null) ctx.readout('rule', { html: `${v('f')}′(${N(last.x, 4)}) = 0: ${say(L('waagrechte Tangente, kein neuer Wert', 'horizontal tangent, no new value'))}` });
      else {
        const i = steps.length - 1;
        ctx.readout('rule', {
          html: `${xi(i + 1)} = ${xi(i)} − <span class="frac"><span>${v('f')}(${xi(i)})</span><span>${v('f')}′(${xi(i)})</span></span> ${shownExact(last.x, 6) && shownExact(last.fx, 6) && shownExact(last.dfx, 6) ? '=' : '≈'} ${html(numSrc(last.x, 6))} − <span class="frac"><span>${html(numSrc(last.fx, 6))}</span><span>${html(numSrc(last.dfx, 6))}</span></span> ${shownExact(last.next, 6) ? '=' : '≈'} ${html(numSrc(last.next, 6))}`,
        });
      }
      const o = classify(fn, p.x0);
      const kind = kindOf(fn, p.x0, steps, xs, o);
      const txt: Record<Kind, string> = {
        start: say(L('Noch kein Schritt.', 'No step yet.')),
        how: say(L('Weitere Schritte nötig.', 'More steps needed.')),
        heron: '',
        quad: '',
        double: '',
        jump: '',
        flat: say(L('Waagrechte Tangente – das Verfahren bricht ab.', 'Horizontal tangent – the method stops.')),
        cycle: say(L('Zyklus – die Folge springt hin und her.', 'Cycle – the sequence jumps back and forth.')),
        far: say(L('Die Folge springt umher oder läuft davon.', 'The sequence wanders about or runs away.')),
      };
      let state = txt[kind];
      if (o.kind === 'root' && (kind === 'heron' || kind === 'quad' || kind === 'double' || kind === 'jump' || kind === 'how')) {
        const speed = fn.mult[o.index]! > 1 ? say(L('langsam: doppelte Nullstelle', 'slowly: double zero')) : say(L('quadratisch', 'quadratically'));
        state = `${say(L('konvergiert gegen', 'converges to'))} ${v('x')}<sup>*</sup> ${eqs(o.root, 8)} ${N(o.root, 8)} (${speed})${kind === 'jump' ? say(L(', nicht die nächstgelegene Nullstelle', ', not the nearest zero')) : ''}`;
      } else if (o.kind === 'cycle' && kind === 'how') state = say(L('wird in einen Zyklus geraten', 'will end up in a cycle'));
      ctx.readout('state', { html: state });
    }

    /* =====================================================================
     * Aktionen und Abspielen
     * ===================================================================== */
    /** Ist kein weiterer sinnvoller Schritt möglich? */
    function terminal(k = kNow()): boolean {
      if (k >= KMAX) return true;
      const steps = iterate(fnNow(), p.x0, k);
      const last = steps[steps.length - 1];
      if (last && (last.next === null || last.status !== 'ok')) return true;
      // genau auf der Nullstelle angekommen: weitere Schritte ändern nichts
      if (last && last.next === last.x) return true;
      return false;
    }
    /** Lohnt sich ein weiterer Schritt beim Abspielen? (angekommen oder Zyklus erkannt) */
    function settled(k = kNow()): boolean {
      if (terminal(k)) return true;
      const xs = sequence(fnNow(), p.x0, k);
      const n = xs.length - 1;
      if (n >= 1 && Math.abs(xs[n]! - xs[n - 1]!) <= 1e-11 * Math.max(1, Math.abs(xs[n]!))) return true;
      if (n >= 4 && isCycle(xs)) return true;
      return false;
    }
    function updateActions(): void {
      ctx.setAction('step', { enabled: editable() && !terminal() });
      ctx.setAction('play', { label: autoplay ? L('Anhalten', 'Pause')[lang] : L('Alles abspielen', 'Play all')[lang], enabled: editable() });
      ctx.setAction('restart', { enabled: editable() && kNow() > 0 });
    }
    function stopAuto(): void {
      autoplay = false;
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = null;
      updateActions();
    }
    function scheduleAuto(): void {
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = null;
      if (!autoplay) return;
      const wait = Math.max(0, endTime() - performance.now()) + (reduced() ? 700 : 350);
      autoTimer = setTimeout(() => {
        autoTimer = null;
        if (!autoplay || ctx.locked) return;
        if (settled()) {
          stopAuto();
          return;
        }
        ctx.set({ k: kNow() + 1 });
        scheduleAuto();
      }, wait);
    }

    /* =====================================================================
     * Rendern
     * ===================================================================== */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      for (const c of chans) if (c.step(now, dt)) anim = true;
      if (morph && now - morph.t0 > morph.dur) {
        morph = null;
        anim = true;
      }
      if (basinSweep !== null && now - basinSweep > 950) basinSweep = null;
      const k = introState(now);
      const V = shown(now);
      if (V.kind !== lastKind) {
        if (lastKind !== null && !reduced() && intro === null) cardFade = now;
        lastKind = V.kind;
      }
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.setRangePadded([view.x0.v, view.x1.v], [view.y0.v, view.y1.v], PAD());
      plot.resize();
      if (retargetLupe(V, now, dt)) anim = true;
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawPlot(V, now, k);
      g.restore();
      drawColumn(R.col, V, now, k);
      if (endTime(V.steps.length) > now - 50 || morph || gone || intro !== null || cardFade !== null || basinSweep !== null || dragging()) anim = true;
      if (anim) ctx.requestRender();
    }

    /* =====================================================================
     * Übergänge
     * ===================================================================== */
    function replayAll(now: number, delay: number): void {
      const k = kNow();
      if (reduced()) {
        completeAll();
        return;
      }
      scheduleReveal(0, k, now + delay, k <= 1 ? STEP_MS * 0.85 : REVEAL_MS);
    }
    function snapshotSteps(): { steps: Step[]; xs: number[] } {
      const fn = FNS[prevFn];
      return { steps: iterate(fn, X0.v, prevK), xs: sequence(fn, X0.v, prevK) };
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = source === 'init' || reduced();
        // Eigener Wechsel der Funktion: passenden Startwert einstellen
        if (source === 'input' && changed.has('fn') && p.fn !== prevFn) ctx.set({ x0: META[key()].start });
        if ((source === 'input' || source === 'replace') && autoplay) stopAuto();
        const fnChanged = key() !== prevFn;
        const x0Changed = p.x0 !== prevX0;
        const k = kNow();
        const kChanged = k !== prevK;
        if (source === 'init') {
          X0.jump(p.x0);
          completeAll();
          if (!reduced()) {
            intro = now;
            replayAll(now, 900);
          }
        } else if (fnChanged || source === 'replace') {
          if (!reduced() && (fnChanged || x0Changed || kChanged || prevK > 0)) {
            const snap = snapshotSteps();
            gone = { key: prevFn, steps: snap.steps, xs: snap.xs, from: 0, t0: now };
          }
          if (fnChanged && !reduced()) morph = { from: prevFn, t0: now, dur: 750 };
          if (fnChanged) fnSwitchAt = now;
          if (instant) X0.jump(p.x0);
          else X0.glide(p.x0, 750, 0, now);
          completeAll();
          replayAll(now, fnChanged || x0Changed ? 780 : 320);
          if (source === 'replace' && !reduced()) cardFade = now;
          lupeInit = true;
        } else {
          if (x0Changed && now - fnSwitchAt < 40) {
            // passender Startwert nach eigenem Funktionswechsel: mitgleiten, Schritte entstehen danach neu
            if (reduced()) X0.jump(p.x0);
            else X0.glide(p.x0, 750, 0, now);
          } else if (x0Changed) {
            const big = Math.abs(p.x0 - prevX0) > 0.3;
            if (source === 'sim' && dragging()) {
              X0.follow(p.x0, 0.03);
              if (!kChanged) completeAll();
            } else if (reduced()) {
              X0.jump(p.x0);
              completeAll();
            } else if (big && !kChanged) {
              // großer Sprung (Antippen, Eingabe): alte Schritte blenden aus, neue entstehen nach dem Gleiten
              const snap = snapshotSteps();
              gone = { key: prevFn, steps: snap.steps, xs: snap.xs, from: 0, t0: now };
              X0.glide(p.x0, 600, 0, now);
              completeAll();
              replayAll(now, 620);
            } else {
              X0.glide(p.x0, 400, 0, now);
              if (!kChanged) completeAll();
            }
            if (source === 'sim' && dragging() && autoplay) stopAuto();
          }
          if (kChanged) {
            if (k > prevK) {
              if (reduced()) completeAll();
              else if (k === prevK + 1) {
                const t0 = Math.max(now, endTime(prevK));
                start[prevK] = t0;
                dur[prevK] = autoplay && prevK >= 3 ? FAST_MS : STEP_MS;
              } else {
                const t0 = Math.max(now, endTime(prevK));
                scheduleReveal(prevK, k, t0, REVEAL_MS);
              }
            } else {
              if (!reduced()) {
                const snap = snapshotSteps();
                gone = { key: prevFn, steps: snap.steps, xs: snap.xs, from: k, t0: now };
              }
              for (let i = k; i < KMAX; i++) start[i] = -Infinity;
            }
          }
        }
        if (changed.has('basin')) {
          if (instant) kBasin.jump(p.basin ? 1 : 0);
          else {
            kBasin.follow(p.basin ? 1 : 0, 0.15);
            if (p.basin) basinSweep = now;
          }
        }
        if (changed.has('zoom')) {
          if (instant) kZoom.jump(p.zoom ? 1 : 0);
          else kZoom.follow(p.zoom ? 1 : 0, 0.12);
        }
        if (source === 'init') {
          kBasin.jump(p.basin ? 1 : 0);
          kZoom.jump(p.zoom ? 1 : 0);
        }
        retargetView(now, instant);
        prevK = k;
        prevFn = key();
        prevX0 = p.x0;
        shownCache = null;
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'step') {
          stopAuto();
          if (!terminal()) ctx.set({ k: kNow() + 1 });
        } else if (id === 'play') {
          if (autoplay) stopAuto();
          else {
            if (settled()) ctx.set({ k: 0 });
            if (reduced()) {
              // ohne Bewegung: gleich alle sinnvollen Schritte zeigen
              let k = kNow();
              while (!settled(k)) k++;
              ctx.set({ k });
              updateActions();
              return;
            }
            autoplay = true;
            updateActions();
            scheduleAuto();
          }
        } else if (id === 'restart') {
          stopAuto();
          ctx.set({ k: 0 });
        }
        ctx.requestRender();
      },

      render,
      destroy: () => {
        stopAuto();
        surface.destroy();
      },
    };
  },
});
