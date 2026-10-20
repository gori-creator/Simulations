import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  angleBetween,
  angleFromSides,
  counterPointX,
  figure,
  lengths,
  measureCm,
  pieceRatios,
  pondGeometry,
  shadowLengths,
  sideAB,
  sideRange,
  solveTask,
  TASKS,
  treeHeight,
  type Ask,
  type Figure,
  type Pt,
  type SegKey,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

type Mode = 'v' | 'x' | 'calc' | 'baum' | 'teich';
type Scene = 'fig' | 'baum' | 'teich';
const sceneOf = (m: Mode): Scene => (m === 'baum' ? 'baum' : m === 'teich' ? 'teich' : 'fig');
type Vals = Record<string, unknown>;
const isMode =
  (...m: Mode[]) =>
  (v: Vals) =>
    m.includes(v.mode as Mode);

/** Ziehbare Elemente. */
type DragId = 'a' | 'b' | 'a2' | 'b2' | 'ray' | 'sun' | 'stick' | 'tree' | 'p2' | 'pb';

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
  get gliding(): boolean {
    return this.tw !== null;
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

/** Namen der Strecken in der Formel-Kurzschrift (mit Farbschlüssel). */
const SEG: Record<SegKey, { src: string; key: string; ray: 1 | 2 | 0 }> = {
  za: { src: 'ZA', key: 'a', ray: 1 },
  za2: { src: 'ZA′', key: 'A', ray: 1 },
  aa2: { src: 'AA′', key: 'A', ray: 1 },
  zb: { src: 'ZB', key: 'b', ray: 2 },
  zb2: { src: 'ZB′', key: 'B', ray: 2 },
  bb2: { src: 'BB′', key: 'B', ray: 2 },
  ab: { src: 'AB', key: 'p', ray: 0 },
  a2b2: { src: 'A′B′', key: 'P', ray: 0 },
};
const seg = (k: SegKey) => `\\c{${SEG[k].key}}{\\o{${SEG[k].src}}}`;

/** Texte zu den Aufgaben des Rechenmodus. */
const ASK_INFO: Record<Ask, { name: Txt }> = {
  zb2: { name: L('1. Strahlensatz', '1st intercept theorem') },
  bb2: { name: L('1. Strahlensatz (Abschnitte)', '1st theorem (pieces)') },
  a2b2: { name: L('2. Strahlensatz', '2nd intercept theorem') },
  ab: { name: L('2. Strahlensatz', '2nd intercept theorem') },
  zb: { name: L('1. Strahlensatz', '1st intercept theorem') },
};

/**
 * Strahlensätze an V- und X-Figur. Hauptansicht: zwei Strahlen mit Zentrum Z,
 * die von zwei Parallelen geschnitten werden; alle Punkte ziehbar, Maßlinien an
 * den Strahlen, ähnliche Dreiecke eingefärbt. Rechts Karten mit Streckenvergleich
 * (farbige Maßstäbe), 1. und 2. Strahlensatz mit eingesetzten Zahlen, Abschnitte-Form,
 * Sonderfällen und – ohne Parallelität – der Umkehrung. Hauptanimation „Parallele
 * verschieben“: die Parallele gleitet von AB nach A′B′ (bei der X-Figur durch Z hindurch).
 * Rechenmodus „Unbekannte Strecke x“ mit Lösung Schritt für Schritt und zwei
 * gezeichnete Anwendungen (Baumhöhe über den Schatten, Teichbreite mit Peilstäben)
 * mit einer Animation, die die Messung durchspielt.
 */
export default defineSimulation({
  id: 'strahlensaetze',
  dragHint: true,
  layout: { aspect: 1.4, aspectNarrow: 0.42 },
  groups: [
    { id: 'fig', label: L('Figur', 'Figure') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'v', label: L('V-Figur', 'V shape') },
        { value: 'x', label: L('X-Figur', 'X shape') },
        { value: 'calc', label: L('Unbekannte Strecke x', 'Unknown length x') },
        { value: 'baum', label: L('Anwendung: Baumhöhe', 'Application: tree height') },
        { value: 'teich', label: L('Anwendung: Teichbreite', 'Application: width of a pond') },
      ],
      default: 'v',
    },
    {
      key: 'ask',
      type: 'choice',
      label: L('Gesucht', 'Unknown'),
      options: [
        { value: 'zb2', label: L('|ZB′|', 'ZB′') },
        { value: 'bb2', label: L('|BB′| (Abschnitt)', 'BB′ (piece)') },
        { value: 'a2b2', label: L('|A′B′|', 'A′B′') },
        { value: 'ab', label: L('|AB|', 'AB') },
        { value: 'zb', label: L('|ZB|', 'ZB') },
      ],
      default: 'zb2',
      visibleIf: isMode('calc'),
    },
    {
      key: 'a',
      type: 'number',
      group: 'fig',
      label: L('|ZA|', 'ZA'),
      help: L('Auch die Punkte in der Figur ziehen.', 'You can also drag the points in the figure.'),
      min: 1,
      max: 8,
      step: 0.1,
      default: 3,
      unit: 'cm',
      visibleIf: isMode('v', 'x', 'calc'),
    },
    { key: 'b', type: 'number', group: 'fig', label: L('|ZB|', 'ZB'), min: 1, max: 8, step: 0.1, default: 4, unit: 'cm', visibleIf: isMode('v', 'x', 'calc') },
    {
      key: 'k',
      type: 'number',
      group: 'fig',
      label: L('Verhältnis |ZA′| : |ZA|', 'Ratio ZA′ : ZA'),
      help: L('Bei der X-Figur ist der Streckfaktor negativ: k = −|ZA′| : |ZA|.', 'In the X shape the scale factor is negative: k = −ZA′ : ZA.'),
      min: 0.2,
      max: 3,
      step: 0.05,
      default: 2,
      visibleIf: isMode('v', 'x', 'calc'),
    },
    { key: 'th', type: 'number', group: 'fig', label: L('Winkel zwischen den Strahlen', 'Angle between the rays'), min: 10, max: 150, step: 1, default: 40, unit: '°', visibleIf: isMode('v', 'x') },
    {
      key: 'c',
      type: 'number',
      group: 'fig',
      label: L('|AB|', 'AB'),
      help: L('Muss zu |ZA| und |ZB| passen (Dreiecksungleichung).', 'Must fit ZA and ZB (triangle inequality).'),
      min: 0.5,
      max: 15,
      step: 0.1,
      default: 2.6,
      unit: 'cm',
      visibleIf: isMode('calc'),
    },
    { key: 'xf', type: 'boolean', group: 'fig', label: L('X-Figur', 'X shape'), default: false, visibleIf: isMode('calc') },
    {
      key: 'par',
      type: 'boolean',
      group: 'fig',
      label: L('A′B′ parallel zu AB', 'A′B′ parallel to AB'),
      help: L('Ausschalten, um B′ frei zu verschieben: Gelten die Verhältnisse dann noch?', 'Switch off to move B′ freely: do the ratios still hold?'),
      default: true,
      visibleIf: isMode('v', 'x'),
    },
    { key: 'kb', type: 'number', group: 'fig', label: L('Verhältnis |ZB′| : |ZB|', 'Ratio ZB′ : ZB'), min: 0.2, max: 3, step: 0.05, default: 1.6, visibleIf: (v) => isMode('v', 'x')(v) && !v.par },
    { key: 'ht', type: 'number', group: 'fig', label: L('Baumhöhe (wirklich)', 'Tree height (true)'), min: 5, max: 20, step: 0.5, default: 12, unit: 'm', visibleIf: isMode('baum') },
    { key: 'st', type: 'number', group: 'fig', label: L('Stablänge s', 'Stick length s'), min: 1, max: 2.5, step: 0.1, default: 1.5, unit: 'm', visibleIf: isMode('baum') },
    {
      key: 'el',
      type: 'number',
      group: 'fig',
      label: L('Sonnenhöhe', 'Sun elevation'),
      help: L('Auch die Sonne ziehen.', 'You can also drag the sun.'),
      min: 20,
      max: 60,
      step: 0.01,
      default: 35,
      unit: '°',
      visibleIf: isMode('baum'),
    },
    { key: 'w', type: 'number', group: 'fig', label: L('Teichbreite (wirklich)', 'Pond width (true)'), min: 8, max: 40, step: 0.5, default: 24, unit: 'm', visibleIf: isMode('teich') },
    { key: 'kt', type: 'number', group: 'fig', label: L('Verkleinerung |ZA| : |ZA′|', 'Reduction ZA : ZA′'), min: 2, max: 6, step: 1, default: 4, visibleIf: isMode('teich') },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Ergebnis zeigen', 'Show the result'),
      help: L('Für Aufgaben ausschalten: Die gesuchte Größe erscheint dann als „?“.', 'Switch off for tasks: the unknown appears as “?”.'),
      default: true,
      visibleIf: isMode('calc', 'baum', 'teich'),
    },
    { key: 'tri', type: 'boolean', group: 'view', label: L('Ähnliche Dreiecke einfärben', 'Shade the similar triangles'), default: true, visibleIf: isMode('v', 'x', 'calc') },
  ],
  actions: [
    { id: 'slide', label: L('Parallele verschieben', 'Slide the parallel'), primary: true, visibleIf: isMode('v', 'x') },
    { id: 'conv', label: L('B′ angleichen (Umkehrung)', 'Adjust B′ (converse)'), visibleIf: (v) => isMode('v', 'x')(v) && !v.par },
    { id: 'solve', label: L('Schritt für Schritt lösen', 'Solve step by step'), primary: true, visibleIf: isMode('calc') },
    { id: 'measure', label: L('Messung durchspielen', 'Play the measurement'), primary: true, visibleIf: isMode('baum', 'teich') },
  ],
  readouts: [
    { key: 'giv', label: L('Gegeben', 'Given') },
    { key: 'r1', label: L('1. Strahlensatz', '1st intercept theorem') },
    { key: 'r2', label: L('2. Strahlensatz', '2nd intercept theorem') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'v', label: L('V-Figur, k = 2', 'V shape, k = 2'), values: {} },
    { id: 'x', label: L('X-Figur: andere Seite von Z', 'X shape: other side of Z'), values: { mode: 'x', a: 4, b: 5, k: 0.75 } },
    { id: 'nopar', label: L('Nicht parallel: Verhältnisse zerfallen', 'Not parallel: the ratios fall apart'), values: { par: false, kb: 1.4 } },
    { id: 'calc', label: L('Unbekannte Strecke x (Abschnitte)', 'Unknown length x (pieces)'), values: { mode: 'calc', ask: 'bb2', a: 2.5, b: 3, c: 2, k: 2.4 } },
    { id: 'baum', label: L('Baumhöhe über den Schatten', 'Tree height from shadows'), values: { mode: 'baum', ht: 12, st: 1.5, el: 36.87 } },
    { id: 'teich', label: L('Breite eines Teichs', 'Width of a pond'), values: { mode: 'teich', w: 24, kt: 4 } },
  ],
  strings: {
    de: {
      canvas:
        'Zwei Strahlen mit gemeinsamem Punkt Z werden von zwei Geraden geschnitten (V- oder X-Figur). Die Punkte A, B, A′ und B′ lassen sich ziehen; Maßlinien zeigen die Längen. Rechts farbige Maßstäbe zum Streckenvergleich und Karten zum 1. und 2. Strahlensatz mit eingesetzten Zahlen. Dazu ein Rechenmodus mit unbekannter Strecke x und zwei Anwendungen: die Höhe eines Baumes über den Schatten und die Breite eines Teichs.',
    },
    en: {
      canvas:
        'Two rays from a common point Z are cut by two lines (V or X shape). The points A, B, A′ and B′ can be dragged; dimension lines show the lengths. On the right, coloured scale bars compare the segments, and cards show the 1st and 2nd intercept theorems with numbers. Plus a mode with an unknown length x and two applications: the height of a tree from its shadow and the width of a pond.',
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
    const scene = () => sceneOf(mode());
    const ask = () => p.ask as Ask;
    const isX = () => (mode() === 'calc' ? p.xf : mode() === 'x');
    const sideSign = () => (isX() ? -1 : 1);

    /* ---------- Farben ---------- */
    const col = {
      r1: () => th().series[0]!,
      r2: () => th().series[1]!,
      par: () => th().series[2]!,
      k: () => th().series[4]!,
      x: () => th().series[3]!,
      bad: () => th().series[3]!,
      sun: () => th().series[3]!,
    };
    /** heller Ton für die ungestrichenen Strecken (ZA, ZB, AB) */
    const light = (c: string) => mixColor(c, th().bg, th().dark ? 0.42 : 0.5);
    /** mittlerer Ton für die Abschnitte AA′, BB′ */
    const mid = (c: string) => mixColor(c, th().bg, th().dark ? 0.2 : 0.25);
    const segCol = (k: SegKey): string => {
      const base = SEG[k].ray === 1 ? col.r1() : SEG[k].ray === 2 ? col.r2() : col.par();
      if (k === 'za' || k === 'zb' || k === 'ab') return light(base);
      if (k === 'aa2' || k === 'bb2') return mid(base);
      return base;
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => fmt.num(clean(v, d), d);
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eq = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    const M = '\\t{m}';

    /* ---------- Zielwerte ---------- */
    const cClamped = () => {
      const [lo, hi] = sideRange(p.a, p.b);
      return clamp(p.c, lo, hi);
    };
    const thTarget = () => (mode() === 'calc' ? angleFromSides(p.a, p.b, cClamped()) : p.th);
    const kaTarget = () => sideSign() * p.k;
    const kbTarget = () => sideSign() * (mode() === 'calc' || p.par ? p.k : p.kb);
    const nonPar = () => (mode() === 'v' || mode() === 'x') && !p.par && Math.abs(p.kb - p.k) > 1e-9;
    const figT = (): Figure => figure(p.a, p.b, thTarget(), kaTarget(), kbTarget());

    /* ---------- angezeigter Zustand ---------- */
    const A = new Chan(p.a);
    const B = new Chan(p.b);
    const TH = new Chan(thTarget());
    const KA = new Chan(kaTarget());
    const KB = new Chan(kbTarget());
    const HT = new Chan(p.ht);
    const ST = new Chan(p.st);
    const EL = new Chan(p.el);
    const W = new Chan(p.w);
    const KT = new Chan(p.kt);
    const wNoPar = new Chan(nonPar() ? 1 : 0);
    const wTri = new Chan(p.tri ? 1 : 0);
    const views = {
      fig: { cx: new Chan(0), cy: new Chan(0), s: new Chan(40), r: new Chan(-rad(p.th) / 2) },
      baum: { cx: new Chan(0), cy: new Chan(0), s: new Chan(20) },
      teich: { cx: new Chan(0), cy: new Chan(0), s: new Chan(10) },
    };
    const allChans = (): Chan[] => [A, B, TH, KA, KB, HT, ST, EL, W, KT, wNoPar, wTri, ...Object.values(views).flatMap((v) => [v.cx, v.cy, v.s]), views.fig.r];

    let intro: number | null = null;
    let sceneFade: { from: Scene; t0: number } | null = null;
    let cardFade: number | null = null;
    /** „Parallele verschieben“: Spur der durchlaufenen Parallelen */
    let trace: { from: number } | null = null;
    let slideAnim: { t0: number; dur: number } | null = null;
    let steps: { t0: number } | null = null;
    let story: { kind: 'baum' | 'teich'; t0: number } | null = null;
    let drag: DragId | null = null;
    let hover: DragId | null = null;
    let hits: { id: DragId; x: number; y: number; r: number }[] = [];
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;
    let prevMode: Mode = mode();
    let lastSize = { w: 0, h: 0 };

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { main: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.37, 236, 372));
        return { main: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const mh = Math.round(clamp(h * 0.47, 280, w * 1.05));
      return { main: { x: 0, y: 0, w, h: mh }, col: { x: 0, y: mh + 10, w, h: h - mh - 10 }, wide: false };
    }

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({
      a: col.r1(),
      A: col.r1(),
      b: col.r2(),
      B: col.r2(),
      p: col.par(),
      P: col.par(),
      k: col.k(),
      x: col.x(),
      bad: col.bad(),
      s: col.sun(),
      m: th().muted,
      ok: col.par(),
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
      const size = opts.size ?? fs(13, 12);
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
      g.fillStyle = opts.fill ?? mixColor(th().bg, th().bg, 0, th().dark ? 0.92 : 0.95);
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
    const pillSize = (src: string, size: number) => {
      const b = formula(surface.g, src, fstyle(size, th().text, 700));
      return { w: b.w + 14, h: b.asc + b.desc + 8 };
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

    function line(p0: Px, p1: Px, color: string, width: number, opts: { dash?: number[]; alpha?: number; cap?: CanvasLineCap; glow?: boolean } = {}): void {
      const g = surface.g;
      if ((opts.alpha ?? 1) <= 0.01) return;
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = opts.cap ?? 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      if (opts.glow) {
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : mixColor(color, '#ffffff', 0.4, 0.55);
        g.shadowBlur = 6;
        g.shadowOffsetY = 1.5;
      }
      g.beginPath();
      g.moveTo(p0[0], p0[1]);
      g.lineTo(p1[0], p1[1]);
      g.stroke();
      g.restore();
    }

    function arrowHead(tip: Px, dir: Px, color: string, size: number): void {
      const g = surface.g;
      const l = Math.hypot(dir[0], dir[1]) || 1;
      const ux = dir[0] / l;
      const uy = dir[1] / l;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(tip[0], tip[1]);
      g.lineTo(tip[0] - ux * size - uy * size * 0.45, tip[1] - uy * size + ux * size * 0.45);
      g.lineTo(tip[0] - ux * size + uy * size * 0.45, tip[1] - uy * size - ux * size * 0.45);
      g.closePath();
      g.fill();
    }

    function card(r: Rect, accent?: string): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = mixColor(theme.bg, theme.text, theme.dark ? 0.04 : 0);
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
      g.strokeStyle = theme.grid;
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
      const rb = right ? formula(g, right, fstyle(fs(12.5, 11.5), color, 700)) : null;
      const room0 = R.w - 2 * pad - 15 - (rb ? rb.w + 10 : 0);
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      if (rb) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      return ty;
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      for (const para of str.split('\n')) {
        let cur = '';
        for (const w of para.split(' ')) {
          const test = cur ? `${cur} ${w}` : w;
          if (g.measureText(test).width > maxW && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
      }
      return lines;
    }

    /* =====================================================================
     * Einstieg
     * ===================================================================== */
    interface Intro {
      panel: number;
      rays: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, rays: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3200) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        rays: ease.inOutCubic(clamp01((t - 100) / 800)),
        labels: ease.outCubic(clamp01((t - 1900) / 700)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 700) / 1500),
      };
    }

    /* =====================================================================
     * Ansichten (Weltkoordinaten → Pixel)
     * ===================================================================== */
    interface View {
      cx: number;
      cy: number;
      s: number;
      /** Drehung der Welt (Bogenmaß), damit die Winkelhalbierende waagrecht liegt */
      rot: number;
      R: Rect;
    }
    const rotP = (q: Pt, r: number): Pt => [q[0] * Math.cos(r) - q[1] * Math.sin(r), q[0] * Math.sin(r) + q[1] * Math.cos(r)];
    const toPx = (v: View, q: Pt): Px => {
      const [x, y] = v.rot ? rotP(q, v.rot) : q;
      return [v.R.x + v.R.w / 2 + (x - v.cx) * v.s, v.R.y + v.R.h / 2 - (y - v.cy) * v.s];
    };
    const toWorld = (v: View, x: number, y: number): Pt => {
      const q: Pt = [v.cx + (x - v.R.x - v.R.w / 2) / v.s, v.cy - (y - v.R.y - v.R.h / 2) / v.s];
      return v.rot ? rotP(q, -v.rot) : q;
    };
    function fitBox(R: Rect, box: [number, number, number, number], pad: { l: number; r: number; t: number; b: number }, sMax: number): { cx: number; cy: number; s: number } {
      const [x0, y0, x1, y1] = box;
      const aw = Math.max(40, R.w - pad.l - pad.r);
      const ah = Math.max(40, R.h - pad.t - pad.b);
      const s = Math.min(sMax, aw / Math.max(1e-6, x1 - x0), ah / Math.max(1e-6, y1 - y0));
      const ax = R.x + pad.l + aw / 2;
      const ay = R.y + pad.t + ah / 2;
      return { cx: (x0 + x1) / 2 - (ax - (R.x + R.w / 2)) / s, cy: (y0 + y1) / 2 + (ay - (R.y + R.h / 2)) / s, s };
    }
    function boxOf(pts: Pt[]): [number, number, number, number] {
      return [Math.min(...pts.map((q) => q[0])), Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[1]))];
    }
    const figRot = () => -rad(thTarget()) / 2;
    function figGoal(): { cx: number; cy: number; s: number; r: number } {
      const R = regions().main;
      const f = figT();
      const pts: Pt[] = [f.z, f.a, f.b, f.a2, f.b2];
      if (nonPar()) pts.push([kaTarget() * p.b, 0]);
      // oben Platz für die Kopfzeile und die äußeren Maßlinien (bis ca. 50 px neben dem Strahl)
      const pad = sm() ? { l: 36, r: 36, t: 76, b: 40 } : { l: 50, r: 50, t: 84, b: 48 };
      // Drehung so wählen, dass die Figur möglichst groß wird (bevorzugt: Winkelhalbierende waagrecht)
      let best: { cx: number; cy: number; s: number; r: number } | null = null;
      let bestScore = -1;
      for (const [r, pref] of [
        [figRot(), 1.05],
        [figRot() + Math.PI / 2, 1],
        [0, 1],
        [2 * figRot(), 1],
      ] as [number, number][]) {
        const bx = boxOf(pts.map((q) => rotP(q, r)));
        const v = { ...fitBox(R, bx, pad, 90), r };
        // sehr schmale, hohe Figuren wirken gedrängt (Beschriftungen) – leicht benachteiligen
        const slim = (bx[3] - bx[1]) / Math.max(1e-6, bx[2] - bx[0]) > 2.2 ? 0.8 : 1;
        if (v.s * pref * slim > bestScore) {
          bestScore = v.s * pref * slim;
          best = v;
        }
      }
      return best!;
    }
    function baumGoal(): { cx: number; cy: number; s: number } {
      const R = regions().main;
      const { dTree } = shadowLengths(p.ht, p.st, p.el);
      const box: [number, number, number, number] = [-0.4, 0, dTree + p.ht * 0.32 + 0.6, p.ht];
      const pad = sm() ? { l: 26, r: 64, t: 70, b: 82 } : { l: 34, r: 92, t: 84, b: 92 };
      return fitBox(R, box, pad, 60);
    }
    function teichGoal(): { cx: number; cy: number; s: number } {
      const R = regions().main;
      const t = pondGeometry(p.w, p.kt);
      const box: [number, number, number, number] = [-0.08 * p.w, Math.min(t.A2[1], t.B2[1]) - 0.04 * p.w, 1.08 * p.w, 0.36 * p.w];
      const pad = sm() ? { l: 24, r: 24, t: 54, b: 30 } : { l: 34, r: 34, t: 60, b: 34 };
      return fitBox(R, box, pad, 40);
    }
    function retargetViews(now: number, instant: boolean): void {
      const fg = figGoal();
      if (instant || reduced()) views.fig.r.jump(fg.r);
      else if (Math.abs(views.fig.r.goal - fg.r) > 1e-9) views.fig.r.glide(fg.r, 800, 0, now);
      const goals: [{ cx: Chan; cy: Chan; s: Chan }, { cx: number; cy: number; s: number }][] = [
        [views.fig, fg],
        [views.baum, baumGoal()],
        [views.teich, teichGoal()],
      ];
      for (const [v, gl] of goals) {
        for (const [c, val] of [
          [v.cx, gl.cx],
          [v.cy, gl.cy],
          [v.s, gl.s],
        ] as [Chan, number][]) {
          if (instant || reduced()) c.jump(val);
          else if (Math.abs(c.goal - val) > 1e-9 * (1 + Math.abs(val))) c.glide(val, 800, 0, now);
        }
      }
    }
    const viewOf = (s: Scene): View => {
      const v = views[s];
      return { cx: v.cx.v, cy: v.cy.v, s: v.s.v, rot: s === 'fig' ? views.fig.r.v : 0, R: regions().main };
    };

    /* =====================================================================
     * Figur (V, X, Rechenmodus)
     * ===================================================================== */
    function shownFig(): Figure {
      return figure(A.v, B.v, TH.v, KA.v, KB.v);
    }

    function paper(R: Rect, alpha: number): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = mixColor(theme.bg, theme.text, theme.dark ? 0.02 : 0.006);
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.fill();
      g.restore();
      g.strokeStyle = theme.grid;
      g.lineWidth = 1.2;
      roundRect(g, R.x + 1.5, R.y + 1.5, R.w - 3, R.h - 3, 14);
      g.stroke();
      g.restore();
    }

    /** Millimeterpapier-Gitter in cm (bei kleinem Maßstab 2 cm). */
    function cmGrid(V: View, alpha: number, z: Px): void {
      const g = surface.g;
      const R = V.R;
      const step = (V.s >= 16 ? 1 : V.s >= 7 ? 2 : 5) * V.s;
      g.save();
      g.globalAlpha *= alpha;
      g.lineWidth = 1;
      for (let i = Math.ceil((R.x - z[0]) / step); z[0] + i * step <= R.x + R.w; i++) {
        const x = Math.round(z[0] + i * step) + 0.5;
        g.strokeStyle = th().gridMinor;
        g.beginPath();
        g.moveTo(x, R.y);
        g.lineTo(x, R.y + R.h);
        g.stroke();
      }
      for (let j = Math.ceil((R.y - z[1]) / step); z[1] + j * step <= R.y + R.h; j++) {
        const y = Math.round(z[1] + j * step) + 0.5;
        g.strokeStyle = th().gridMinor;
        g.beginPath();
        g.moveTo(R.x, y);
        g.lineTo(R.x + R.w, y);
        g.stroke();
      }
      g.restore();
    }

    /** Maßlinie neben der Strecke P→Q im Abstand off (Pixel) zur Seite n (Einheitsnormale in Pixeln). */
    function dimLine(P: Px, Q: Px, n: Px, off: number, color: string, label: string, alpha: number, progress = 1, labelColor?: string, R?: Rect): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const q: Px = [lerp(P[0], Q[0], progress), lerp(P[1], Q[1], progress)];
      const len = Math.hypot(q[0] - P[0], q[1] - P[1]);
      if (len < 2) return;
      const a: Px = [P[0] + n[0] * off, P[1] + n[1] * off];
      const b: Px = [q[0] + n[0] * off, q[1] + n[1] * off];
      g.save();
      g.globalAlpha *= alpha;
      // Hilfslinien
      g.strokeStyle = withAlpha(th().muted, 0.45);
      g.lineWidth = 1;
      g.setLineDash([2, 3]);
      g.beginPath();
      g.moveTo(P[0] + n[0] * 4, P[1] + n[1] * 4);
      g.lineTo(a[0] + n[0] * 4, a[1] + n[1] * 4);
      g.moveTo(q[0] + n[0] * 4, q[1] + n[1] * 4);
      g.lineTo(b[0] + n[0] * 4, b[1] + n[1] * 4);
      g.stroke();
      g.setLineDash([]);
      const ux = (b[0] - a[0]) / len;
      const uy = (b[1] - a[1]) / len;
      const hd = Math.min(7, len * 0.35);
      line([a[0] + ux * hd * 0.6, a[1] + uy * hd * 0.6], [b[0] - ux * hd * 0.6, b[1] - uy * hd * 0.6], color, 1.8);
      arrowHead(a, [-ux, -uy], color, hd);
      arrowHead(b, [ux, uy], color, hd);
      g.restore();
      if (progress > 0.3) {
        const sz = fs(12.5, 11.5);
        const ps = pillSize(label, sz);
        const along = len > ps.w + 14 ? 0 : (ps.h / 2 + 4);
        fpill((a[0] + b[0]) / 2 + n[0] * along, (a[1] + b[1]) / 2 + n[1] * along, label, { color: labelColor ?? color, size: sz, alpha: alpha * clamp01((progress - 0.3) / 0.5), bounds: R });
      }
    }

    /** Pfeilspitzen „>“ als Zeichen für parallele Geraden. */
    function parMarks(P: Px, Q: Px, dir: Px, color: string, count: number, alpha: number): void {
      const g = surface.g;
      const l = Math.hypot(dir[0], dir[1]) || 1;
      const ux = dir[0] / l;
      const uy = dir[1] / l;
      const mx = (P[0] + Q[0]) / 2;
      const my = (P[1] + Q[1]) / 2;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (let i = 0; i < count; i++) {
        const cx = mx + ux * (i - (count - 1) / 2) * 6;
        const cy = my + uy * (i - (count - 1) / 2) * 6;
        g.beginPath();
        g.moveTo(cx - ux * 5 - uy * 5, cy - uy * 5 + ux * 5);
        g.lineTo(cx, cy);
        g.lineTo(cx - ux * 5 + uy * 5, cy - uy * 5 - ux * 5);
        g.stroke();
      }
      g.restore();
    }

    /** Punkt mit Namen; ziehbare Punkte bekommen einen Griff. */
    function point(q: Px, name: string, color: string, away: Px, opts: { hollow?: boolean; id?: DragId; alpha?: number; r?: number; nameAlpha?: number } = {}): void {
      const g = surface.g;
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return;
      const r = opts.r ?? fs(6.5, 6);
      if (opts.id && editable()) {
        const on = hover === opts.id || drag === opts.id;
        g.save();
        g.globalAlpha *= a;
        g.fillStyle = withAlpha(color, on ? 0.26 : 0.12);
        g.beginPath();
        g.arc(q[0], q[1], on ? r + 9 : r + 6, 0, TAU);
        g.fill();
        g.restore();
        hits.push({ id: opts.id, x: q[0], y: q[1], r: fs(18, 22) });
      }
      dot(q[0], q[1], color, r, a, opts.hollow);
      const l = Math.hypot(away[0], away[1]) || 1;
      const sz = fs(15, 13.5);
      g.save();
      g.globalAlpha *= a * (opts.nameAlpha ?? 1);
      g.font = `800 ${sz}px ${th().font}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const tx = q[0] + (away[0] / l) * (r + 12);
      const ty = q[1] + (away[1] / l) * (r + 12);
      g.lineWidth = 4;
      g.strokeStyle = mixColor(th().bg, th().bg, 0, th().dark ? 0.9 : 0.95);
      g.lineJoin = 'round';
      g.strokeText(name, tx, ty);
      g.fillStyle = color;
      g.fillText(name, tx, ty);
      g.restore();
    }

    /** Stelle eines Werts auf dem Strahl in Pixeln: Abstand von Z nach |ZP|. */
    function drawFig(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const V = viewOf('fig');
      const R = V.R;
      const f = shownFig();
      const Lg = lengths(f);
      const P = (q: Pt) => toPx(V, q);
      const z = P(f.z);
      const a = P(f.a);
      const b = P(f.b);
      const a2 = P(f.a2);
      const b2 = P(f.b2);
      const unit = (q: Px): Px => {
        const l = Math.hypot(q[0], q[1]) || 1;
        return [q[0] / l, q[1] / l];
      };
      const e1 = P([Math.cos(rad(TH.v)), Math.sin(rad(TH.v))]);
      const e2 = P([1, 0]);
      const u1 = unit([e1[0] - z[0], e1[1] - z[1]]);
      const u2 = unit([e2[0] - z[0], e2[1] - z[1]]);
      // Normalen nach außen (vom Inneren des Winkels weg)
      const outOf = (u: Px, other: Px): Px => {
        const n: Px = [u[1], -u[0]];
        return n[0] * other[0] + n[1] * other[1] > 0 ? [-n[0], -n[1]] : n;
      };
      const out1 = outOf(u1, u2);
      const out2 = outOf(u2, u1);
      /** Richtung für Punktnamen: in den Innenwinkel des Dreiecks */
      const inner = (q: Px, q1: Px, q2: Px, fb: Px): Px => {
        const d1 = unit([q1[0] - q[0], q1[1] - q[1]]);
        const d2 = unit([q2[0] - q[0], q2[1] - q[1]]);
        const d: Px = [d1[0] + d2[0], d1[1] + d2[1]];
        return Math.hypot(d[0], d[1]) < 0.15 ? fb : d;
      };
      const lab = k.labels;
      g.save();
      g.globalAlpha *= alpha;
      paper(R, 1);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      cmGrid(V, 0.9 * k.panel, z);
      // ähnliche Dreiecke
      const tri = wTri.v * k.panel;
      if (tri > 0.01) {
        g.save();
        g.globalAlpha *= tri;
        const tc = col.k();
        g.fillStyle = withAlpha(tc, theme.dark ? 0.12 : 0.08);
        g.beginPath();
        g.moveTo(z[0], z[1]);
        g.lineTo(a2[0], a2[1]);
        g.lineTo(b2[0], b2[1]);
        g.closePath();
        g.fill();
        g.fillStyle = withAlpha(tc, theme.dark ? 0.2 : 0.14);
        g.beginPath();
        g.moveTo(z[0], z[1]);
        g.lineTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.closePath();
        g.fill();
        g.restore();
      }
      // Strahlen bzw. Geraden durch Z
      const far = (R.w + R.h) * 2;
      const rl = k.rays;
      const X = isX();
      g.save();
      g.globalAlpha *= 0.85;
      for (const u of [u1, u2]) {
        line(z, [z[0] + u[0] * far * rl, z[1] + u[1] * far * rl], withAlpha(theme.muted, 0.7), 1.4);
        line(z, [z[0] - u[0] * far * rl, z[1] - u[1] * far * rl], withAlpha(theme.muted, 0.7), 1.4, { dash: [5, 5], alpha: X ? 1 : clamp01(-KA.v * 4) * 0.8 });
      }
      g.restore();
      // Spur der verschobenen Parallelen
      if (trace) {
        const from = trace.from;
        const to = KA.v;
        const lo = Math.min(from, to);
        const hi = Math.max(from, to);
        for (let t = Math.ceil(lo * 2) / 2; t <= hi + 1e-9; t += 0.5) {
          if (Math.abs(t) < 1e-9 || Math.abs(t - from) < 1e-9 || Math.abs(t - to) < 0.08) continue;
          const pa = P([t * f.a[0], t * f.a[1]]);
          const pb = P([t * f.b[0], t * f.b[1]]);
          line(pa, pb, light(col.par()), 1.6, { dash: [6, 5], alpha: 0.7 * k.panel });
          if (Math.abs(t * 2 - Math.round(t * 2)) < 1e-9 && Math.abs(t - Math.round(t)) < 1e-9) {
            const mx = (pa[0] + pb[0]) / 2;
            const my = (pa[1] + pb[1]) / 2;
            fpill(mx, my, `\\c{k}{${N(t, 1)}}`, { size: fs(11, 11), alpha: 0.75 * k.panel, color: col.k() });
          }
        }
      }
      // Strecken auf den Strahlen
      const segW = fs(5, 4.2);
      const ray = (p0: Px, p1: Px, c: string, w = segW) => line(p0, p1, c, w * rl, { glow: true, cap: 'round' });
      const sameSide = KA.v > 0;
      if (sameSide && Math.abs(KA.v) > 1) {
        ray(a, a2, col.r1());
        ray(z, a, light(col.r1()));
      } else if (sameSide) {
        ray(z, a, light(col.r1()));
        ray(z, a2, col.r1());
      } else {
        ray(z, a, light(col.r1()));
        ray(z, a2, col.r1());
      }
      if (KB.v > 0 && Math.abs(KB.v) > 1) {
        ray(b, b2, col.r2());
        ray(z, b, light(col.r2()));
      } else if (KB.v > 0) {
        ray(z, b, light(col.r2()));
        ray(z, b2, col.r2());
      } else {
        ray(z, b, light(col.r2()));
        ray(z, b2, col.r2());
      }
      // Parallele durch A′ (gestrichelt), wenn B′ nicht passt
      const np = wNoPar.v;
      const bStar = P([KA.v * f.b[0], 0]);
      if (np > 0.01) {
        line(a2, bStar, col.par(), 2.2, { dash: [7, 5], alpha: np * lab });
        dot(bStar[0], bStar[1], col.par(), 4.5, np * lab, true);
        // Gegenbeispiel zur Umkehrung des 2. Strahlensatzes: Kreis um A′
        const x2 = counterPointX(A.v, B.v, TH.v, KA.v);
        if (x2 * KA.v > 0 && Math.abs(x2 - KA.v * B.v) > 0.3) {
          const b3 = P([x2, 0]);
          const rr = Math.hypot(bStar[0] - a2[0], bStar[1] - a2[1]);
          const t1 = Math.atan2(bStar[1] - a2[1], bStar[0] - a2[0]);
          const t2 = Math.atan2(b3[1] - a2[1], b3[0] - a2[0]);
          g.save();
          g.globalAlpha *= np * lab * 0.75;
          g.strokeStyle = withAlpha(theme.muted, 0.8);
          g.lineWidth = 1.2;
          g.setLineDash([3, 4]);
          g.beginPath();
          let d = t2 - t1;
          while (d > Math.PI) d -= TAU;
          while (d < -Math.PI) d += TAU;
          g.arc(a2[0], a2[1], rr, t1 - Math.sign(d) * 0.12, t1 + d + Math.sign(d) * 0.12, d < 0);
          g.stroke();
          g.restore();
          line(a2, b3, withAlpha(theme.muted, 0.9), 1.4, { dash: [2, 4], alpha: np * lab * 0.8 });
          point(b3, 'B″', theme.muted, [-out2[0], -out2[1]], { hollow: true, alpha: np * lab * 0.85, r: 4.5 });
        }
      }
      // Parallelen
      const pw = fs(4, 3.4);
      const parA = clamp01((k.rays - 0.5) * 2);
      line(a, b, light(col.par()), pw, { glow: true, alpha: parA });
      const badMix = np;
      const a2b2Col = badMix > 0.5 ? col.bad() : col.par();
      line(a2, b2, a2b2Col, pw, { glow: true, alpha: parA });
      const dirAB: Px = [b[0] - a[0], b[1] - a[1]];
      parMarks(a, b, dirAB, light(col.par()), 1, parA * (1 - np));
      if (Math.abs(KA.v - 1) > 0.15) parMarks(a2, b2, dirAB, col.par(), 1, parA * (1 - np));
      // Maßlinien
      const dims: { key: SegKey; P: Px; Q: Px; n: Px; lvl: number }[] = [];
      const show = (key: SegKey) => {
        if (mode() !== 'calc') return true;
        const t = TASKS[ask()];
        return key === t.x || key === t.den1 || key === t.num2 || key === t.den2;
      };
      const offs = [fs(17, 14), fs(38, 32)];
      // Strahl 1: ZA, ZA′, AA′ (Überlappungen kommen auf die zweite Ebene)
      const r1segs: { key: SegKey; t0: number; t1: number }[] = [
        { key: 'za', t0: 0, t1: 1 },
        { key: 'za2', t0: Math.min(0, KA.v), t1: Math.max(0, KA.v) },
        { key: 'aa2', t0: Math.min(1, KA.v), t1: Math.max(1, KA.v) },
      ];
      const r2segs: { key: SegKey; t0: number; t1: number }[] = [
        { key: 'zb', t0: 0, t1: 1 },
        { key: 'zb2', t0: Math.min(0, KB.v), t1: Math.max(0, KB.v) },
        { key: 'bb2', t0: Math.min(1, KB.v), t1: Math.max(1, KB.v) },
      ];
      const place = (segs: { key: SegKey; t0: number; t1: number }[], base: Pt, out: Px) => {
        const used: { lvl: number; t0: number; t1: number; side: number }[] = [];
        for (const s of segs) {
          if (!(mode() === 'calc' ? show(s.key) : s.key !== 'aa2' && s.key !== 'bb2')) continue;
          if (s.t1 - s.t0 < 1e-6) continue;
          // k ≈ 1: ZA′ deckt sich mit ZA → nur eine Maßzahl zeigen
          if (mode() !== 'calc' && (s.key === 'za2' || s.key === 'zb2') && Math.abs(s.t1 - s.t0 - 1) < 0.02 && s.t0 >= 0) continue;
          const side = s.t1 <= 1e-9 ? -1 : 1;
          let lvl = 0;
          while (used.some((u) => u.lvl === lvl && u.side === side && Math.min(u.t1, s.t1) - Math.max(u.t0, s.t0) > 1e-6)) lvl++;
          used.push({ lvl, t0: s.t0, t1: s.t1, side });
          const p0 = P([base[0] * s.t0, base[1] * s.t0]);
          const p1 = P([base[0] * s.t1, base[1] * s.t1]);
          dims.push({ key: s.key, P: p0, Q: p1, n: [out[0] * side, out[1] * side], lvl });
        }
      };
      place(r1segs, f.a, out1);
      place(r2segs, f.b, out2);
      const sol = mode() === 'calc' ? solveTask(ask(), f) : null;
      for (const d of dims) {
        const isX0 = sol && d.key === sol.spec.x;
        const v = Lg[d.key];
        const label = isX0 ? (p.show && stepsDone(now) ? `\\c{x}{x = ${N(v)} cm}` : '\\c{x}{x}') : `${N(v)} cm`;
        const c = isX0 ? col.x() : SEG[d.key].ray === 1 ? col.r1() : col.r2();
        dimLine(d.P, d.Q, d.n, offs[Math.min(1, d.lvl)]!, isX0 ? col.x() : segCol(d.key), label, lab, 1, c, R);
      }
      // Beschriftung der Parallelen
      const parLabel = (p0: Px, p1: Px, key: SegKey, c: string) => {
        if (mode() === 'calc' && !show(key)) return;
        const isX0 = sol && key === sol.spec.x;
        const v = Lg[key];
        const mx = (p0[0] + p1[0]) / 2;
        const my = (p0[1] + p1[1]) / 2;
        const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        if (len < 18) return;
        // Normale zur Seite weg von Z
        let nx = -(p1[1] - p0[1]) / len;
        let ny = (p1[0] - p0[0]) / len;
        if ((mx - z[0]) * nx + (my - z[1]) * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        const src = isX0 ? (p.show && stepsDone(now) ? `\\c{x}{x = ${N(v)} cm}` : '\\c{x}{x}') : `${eq(v)} ${N(v)} cm`;
        const sz = fs(12.5, 11.5);
        const ps = pillSize(src, sz);
        const off = Math.abs(nx) * ps.w / 2 + Math.abs(ny) * ps.h / 2 + 6;
        fpill(mx + nx * off, my + ny * off, src, { color: isX0 ? col.x() : c, size: sz, alpha: lab, bounds: R, border: isX0 ? withAlpha(col.x(), 0.7) : undefined });
      };
      parLabel(a, b, 'ab', col.par());
      parLabel(a2, b2, 'a2b2', a2b2Col);
      // Winkel bei Z
      if (lab > 0.01 && mode() !== 'calc') {
        const rr = fs(26, 22);
        g.save();
        g.globalAlpha *= lab;
        g.strokeStyle = withAlpha(theme.muted, 0.9);
        g.lineWidth = 1.4;
        const a1 = Math.atan2(u1[1], u1[0]);
        let dd = Math.atan2(u2[1], u2[0]) - a1;
        while (dd > Math.PI) dd -= TAU;
        while (dd < -Math.PI) dd += TAU;
        g.beginPath();
        g.arc(z[0], z[1], rr, a1, a1 + dd, dd < 0);
        g.stroke();
        g.restore();
        const mid2 = a1 + dd / 2;
        const lx = z[0] + Math.cos(mid2) * (rr + 16);
        const ly = z[1] + Math.sin(mid2) * (rr + 16);
        g.save();
        g.globalAlpha *= lab;
        g.font = `650 ${fs(12, 11)}px ${theme.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = theme.muted;
        g.fillText(`${fmt.num(Math.round(TH.v), 0)}°`, lx, ly);
        g.restore();
      }
      // Punkte
      point(z, 'Z', theme.text, [-u1[0] - u2[0], -u1[1] - u2[1]], { r: fs(5.5, 5), alpha: k.panel });
      const ptA = clamp01(k.rays * 1.4 - 0.3);
      const near = clamp01((Math.abs(KA.v - 1) * A.v * V.s - 10) / 14);
      point(a, 'A', col.r1(), inner(a, z, b, out1), { hollow: true, id: 'a', alpha: ptA });
      point(b, 'B', col.r2(), inner(b, z, a, out2), { hollow: true, id: 'b', alpha: ptA });
      point(a2, 'A′', col.r1(), inner(a2, z, b2, out1), { id: 'a2', alpha: ptA, nameAlpha: near });
      point(b2, 'B′', badMix > 0.5 ? col.bad() : col.r2(), inner(b2, z, a2, out2), { id: 'b2', alpha: ptA, nameAlpha: near });
      // Griff zum Drehen des ersten Strahls
      if (mode() !== 'calc' && editable() && ptA > 0.5) {
        const reach = Math.max(Math.abs(KA.v), 1) * A.v * V.s + fs(46, 40);
        const rq: Px = [z[0] + u1[0] * reach, z[1] + u1[1] * reach];
        if (rq[0] > R.x + 14 && rq[0] < R.x + R.w - 14 && rq[1] > R.y + 14 && rq[1] < R.y + R.h - 14) {
          const on = hover === 'ray' || drag === 'ray';
          g.save();
          g.strokeStyle = withAlpha(theme.muted, on ? 0.95 : 0.7);
          g.fillStyle = withAlpha(theme.muted, on ? 0.2 : 0.1);
          g.lineWidth = 1.6;
          g.beginPath();
          g.arc(rq[0], rq[1], on ? 11 : 9, 0, TAU);
          g.fill();
          g.stroke();
          // Drehpfeil
          g.beginPath();
          g.arc(rq[0], rq[1], 5, -2.4, 1.2);
          g.stroke();
          g.restore();
          hits.push({ id: 'ray', x: rq[0], y: rq[1], r: fs(16, 20) });
        }
      }
      g.restore();
      // Kopfzeile
      drawFigHeader(R, f, k);
      g.restore();
    }

    /** Kopfzeile der Figur: Art der Figur, k und Parallelität. */
    function drawFigHeader(R: Rect, f: Figure, k: Intro): void {
      const sz = fs(13, 12);
      const m = mode();
      let src: string;
      if (m === 'calc') {
        const t = TASKS[ask()];
        src = `${say(L('Gesucht', 'Unknown'))}: ${seg(t.x)} \\c{x}{= x}`;
      } else {
        const kv = KA.v;
        const name = `\\t{${m === 'x' ? say(L('X-Figur', 'X shape')) : say(L('V-Figur', 'V shape'))}}`;
        src = `${name}   \\c{k}{k = ${N(kv, 2)}}`;
      }
      const left = fpill(R.x + 12, R.y + 22, src, { align: 'left', size: sz, alpha: k.panel, border: withAlpha(m === 'calc' ? col.x() : col.k(), 0.55) });
      if (m === 'calc') return;
      const np = wNoPar.v;
      const ok = `\\c{ok}{\\t{AB ∥ A′B′}}`;
      const no = `\\c{bad}{\\t{${say(L('AB nicht parallel zu A′B′', 'AB not parallel to A′B′'))}} (${N(angleBetween(f), 1)}°)}`;
      const ps = pillSize(np > 0.5 ? no : ok, fs(12.5, 11.5));
      const room = R.x + R.w - 12 - ps.w > left.x + left.w + 8;
      const x = room ? R.x + R.w - 12 : R.x + 12;
      const y = room ? R.y + 22 : R.y + 22 + left.h + 6;
      fpill(x, y, np > 0.5 ? no : ok, { align: room ? 'right' : 'left', size: fs(12.5, 11.5), alpha: k.labels, border: withAlpha(np > 0.5 ? col.bad() : col.par(), 0.55) });
    }

    /* =====================================================================
     * Anwendung: Baumhöhe
     * ===================================================================== */
    /** Fortschritt der Mess-Animation (ohne Animation: alles fertig). */
    function storyT(now: number, kind: 'baum' | 'teich'): number {
      if (!story || story.kind !== kind) return Infinity;
      return now - story.t0;
    }
    const BAUM_END = 6600;
    const TEICH_END = 6800;

    function drawBaum(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const V = viewOf('baum');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const el = EL.v;
      const ht = HT.v;
      const st = ST.v;
      const { dStick, dTree } = shadowLengths(ht, st, el);
      const t = storyT(now, 'baum');
      const raysK = ease.inOutCubic(clamp01(t / 1000)) * k.rays;
      const stickStart = dStick + 0.5 * (dTree - dStick);
      const stickX = lerp(stickStart, dStick, ease.inOutCubic(clamp01((t - 1000) / 1700)));
      const tape1 = ease.inOutCubic(clamp01((t - 2900) / 900));
      const tape2 = ease.inOutCubic(clamp01((t - 3800) / 1200));
      const hK = ease.outCubic(clamp01((t - 5200) / 1100));
      const z = P([0, 0]);
      const gy = z[1];
      g.save();
      g.globalAlpha *= alpha;
      // Bühne
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = dark ? '#0f1a2c' : '#d6ebfb';
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      const sky = g.createLinearGradient(0, R.y, 0, gy);
      sky.addColorStop(0, dark ? '#0d1828' : '#b9dcf7');
      sky.addColorStop(1, dark ? '#1f2f47' : '#f1f8fe');
      g.fillStyle = sky;
      g.fillRect(R.x, R.y, R.w, gy - R.y);
      // ferne Hügel
      g.fillStyle = dark ? '#1b2d29' : '#cfe5c7';
      g.beginPath();
      g.moveTo(R.x, gy);
      for (let i = 0; i <= 24; i++) {
        const x = R.x + (R.w * i) / 24;
        const hh = 18 + 10 * Math.sin(i * 0.9 + 1) + 7 * Math.sin(i * 2.1);
        g.lineTo(x, gy - hh);
      }
      g.lineTo(R.x + R.w, gy);
      g.closePath();
      g.fill();
      // Sonne: auf dem Strahl über der Baumspitze, im Bild gehalten
      const top = P([dTree, ht]);
      const uPx: Px = [Math.cos(rad(el)), -Math.sin(rad(el))];
      let dist0 = fs(90, 70);
      let sun: Px = [top[0] + uPx[0] * dist0, top[1] + uPx[1] * dist0];
      const sunR = fs(19, 15);
      while ((sun[0] > R.x + R.w - sunR - 8 || sun[1] < R.y + sunR + 8) && dist0 > 20) {
        dist0 -= 4;
        sun = [top[0] + uPx[0] * dist0, top[1] + uPx[1] * dist0];
      }
      const glow = g.createRadialGradient(sun[0], sun[1], sunR * 0.4, sun[0], sun[1], sunR * 3);
      glow.addColorStop(0, 'rgba(255,214,90,0.55)');
      glow.addColorStop(1, 'rgba(255,214,90,0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(sun[0], sun[1], sunR * 3, 0, TAU);
      g.fill();
      // parallele Sonnenstrahlen
      const dirDown: Px = [-uPx[0], -uPx[1]];
      const spacing = fs(44, 36) / Math.sin(rad(el));
      g.save();
      g.beginPath();
      g.rect(R.x, R.y, R.w, gy - R.y);
      g.clip();
      for (let j = -8; j <= 30; j++) {
        const gx = z[0] + j * spacing;
        if (gx < R.x - 400 || gx > R.x + R.w + 600) continue;
        // vom Bildrand oben/rechts zum Boden
        const tt = Math.min((gy - R.y + 10) / -dirDown[1], 2000);
        const start: Px = [gx - dirDown[0] * tt, gy - dirDown[1] * tt];
        const end: Px = [lerp(start[0], gx, raysK), lerp(start[1], gy, raysK)];
        line(start, end, dark ? 'rgba(255,214,90,0.28)' : 'rgba(230,160,20,0.32)', 1.4, { dash: [8, 7] });
        if (raysK > 0.05 && j % 3 === 1) arrowHead(end, dirDown, dark ? 'rgba(255,214,90,0.45)' : 'rgba(230,160,20,0.5)', 7);
      }
      g.restore();
      const sg = g.createRadialGradient(sun[0] - sunR * 0.3, sun[1] - sunR * 0.3, 2, sun[0], sun[1], sunR);
      sg.addColorStop(0, '#fff6c9');
      sg.addColorStop(1, '#f6b52e');
      g.fillStyle = sg;
      g.beginPath();
      g.arc(sun[0], sun[1], sunR, 0, TAU);
      g.fill();
      if (editable()) {
        const on = hover === 'sun' || drag === 'sun';
        g.strokeStyle = withAlpha('#f59f00', on ? 0.95 : 0.55);
        g.lineWidth = on ? 3 : 2;
        g.beginPath();
        g.arc(sun[0], sun[1], sunR + 5, 0, TAU);
        g.stroke();
        hits.push({ id: 'sun', x: sun[0], y: sun[1], r: sunR + 10 });
      }
      // Boden
      const ground = g.createLinearGradient(0, gy, 0, R.y + R.h);
      ground.addColorStop(0, dark ? '#2f4a2b' : '#a9d58f');
      ground.addColorStop(1, dark ? '#1c301b' : '#86c26f');
      g.fillStyle = ground;
      g.fillRect(R.x, gy, R.w, R.y + R.h - gy);
      g.strokeStyle = dark ? '#4c6b44' : '#6fae57';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(R.x, gy + 1);
      g.lineTo(R.x + R.w, gy + 1);
      g.stroke();
      // Schatten auf dem Boden
      const treeB = P([dTree, 0]);
      const stickB = P([stickX, 0]);
      const stickTipX = stickX - st / Math.tan(rad(el));
      const shadow = (x0: number, x1: number, hgt: number) => {
        g.save();
        g.fillStyle = dark ? 'rgba(0,0,0,0.42)' : 'rgba(30,60,20,0.32)';
        g.beginPath();
        g.moveTo(x0, gy + 1);
        g.lineTo(x1, gy + 1 - 0);
        g.lineTo(x1, gy + 1 + hgt);
        g.closePath();
        g.fill();
        g.restore();
      };
      shadow(z[0] + (0 - 0) * V.s, treeB[0], fs(9, 7));
      shadow(P([stickTipX, 0])[0], stickB[0], fs(5, 4));
      // Baum
      const trunkW = Math.max(7, ht * V.s * 0.06);
      const trunkTop = P([dTree, ht * 0.5]);
      const tg = g.createLinearGradient(treeB[0] - trunkW / 2, 0, treeB[0] + trunkW / 2, 0);
      tg.addColorStop(0, dark ? '#5a3d24' : '#8a5a33');
      tg.addColorStop(1, dark ? '#3a2716' : '#5e3b1f');
      g.fillStyle = tg;
      g.beginPath();
      g.moveTo(treeB[0] - trunkW * 0.6, treeB[1]);
      g.lineTo(treeB[0] - trunkW * 0.35, trunkTop[1]);
      g.lineTo(treeB[0] + trunkW * 0.35, trunkTop[1]);
      g.lineTo(treeB[0] + trunkW * 0.6, treeB[1]);
      g.closePath();
      g.fill();
      const crown = (dx: number, cy: number, r: number, shade: number) => {
        const c = P([dTree + dx * ht, cy * ht]);
        const rp = r * ht * V.s;
        const cg = g.createRadialGradient(c[0] - rp * 0.35, c[1] - rp * 0.4, rp * 0.1, c[0], c[1], rp);
        cg.addColorStop(0, dark ? mixColor('#4f8f45', '#000000', shade) : mixColor('#7cc35f', '#ffffff', 0.15 - shade));
        cg.addColorStop(1, dark ? mixColor('#24502a', '#000000', shade) : mixColor('#3e8a35', '#000000', shade));
        g.fillStyle = cg;
        g.beginPath();
        g.arc(c[0], c[1], rp, 0, TAU);
        g.fill();
      };
      crown(-0.17, 0.6, 0.2, 0.12);
      crown(0.17, 0.62, 0.19, 0.1);
      crown(0, 0.76, 0.24, 0);
      // Stab (rot-weiß)
      const stickT = P([stickX, st]);
      const sw = fs(6, 5);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = 3;
      g.shadowOffsetX = 1.5;
      for (let i = 0; i < 6; i++) {
        const y0 = lerp(stickB[1], stickT[1], i / 6);
        const y1 = lerp(stickB[1], stickT[1], (i + 1) / 6);
        g.fillStyle = i % 2 ? '#f8f8f8' : '#d9363e';
        g.fillRect(stickB[0] - sw / 2, y1, sw, y0 - y1 + 0.5);
      }
      g.restore();
      // Strahl über beide Spitzen nach Z (Strahl 1 der V-Figur)
      const sa = k.rays;
      line(sun, [lerp(sun[0], z[0], sa), lerp(sun[1], z[1], sa)], col.sun(), 2.6, { glow: true });
      // Strahl über die Stabspitze, solange der Stab noch wandert
      if (Math.abs(stickX - dStick) > 1e-3) {
        const tip = P([stickTipX, 0]);
        line(stickT, tip, col.sun(), 1.6, { dash: [4, 4] });
        dot(tip[0], tip[1], col.sun(), 4.5, 1);
      }
      // Höhen
      const show = p.show;
      const meas = { ds: measureCm(shadowLengths(p.ht, p.st, p.el).dStick), dt: measureCm(shadowLengths(p.ht, p.st, p.el).dTree) };
      const lab = k.labels;
      const hTxt = show ? `\\c{P}{h ${eq(treeHeight(p.st, meas.ds, meas.dt), 1)} ${N(treeHeight(p.st, meas.ds, meas.dt), 1)} ${M}}` : '\\c{P}{h = ?}';
      dimLine([treeB[0], treeB[1]], [top[0], top[1]], [1, 0], ht * V.s * 0.3 + fs(14, 10), col.par(), hTxt, lab * (story ? hK : 1), story ? hK : 1, col.par(), R);
      // Maßband am Boden
      const off1 = fs(22, 18);
      const off2 = fs(48, 40);
      dimLine(z, stickB, [0, 1], off1, light(col.r2()), `\\c{b}{${N(meas.ds, 2)} ${M}}`, lab * (t < 2900 ? 0 : 1), tape1, col.r2(), R);
      dimLine(z, treeB, [0, 1], off2, col.r2(), `\\c{B}{${N(meas.dt, 2)} ${M}}`, lab * (t < 3800 ? 0 : 1), tape2, col.r2(), R);
      // Punkte
      point(z, 'Z', theme.text, [-1, 0.6], { r: fs(5, 4.5), alpha: k.panel });
      point(stickT, '', col.r1(), [-1, -0.7], { id: 'stick', alpha: lab, r: 3.5 });
      point(treeB, 'B′', col.r2(), [0.5, 1], { r: 4, alpha: lab });
      point(top, 'A′', col.r1(), [-1, -0.5], { id: 'tree', alpha: lab });
      const s45 = Math.abs(el - 45) < 0.5;
      if (s45) fpill(R.x + 12, R.y + 56, say(L('45°: Schatten so lang wie die Höhe', '45°: shadow as long as the height')), { align: 'left', size: fs(12, 11), color: col.sun(), border: withAlpha(col.sun(), 0.6), alpha: lab });
      // Lupe: Stab und kleines Dreieck ZBA vergrößert
      const lupeA = lab * (Number.isFinite(t) ? clamp01((t - 2600) / 500) : 1);
      drawLupe(R, z, stickB, el, st, stickX, meas.ds, lupeA, s45 ? fs(84, 74) : fs(54, 50));
      fpill(R.x + 12, R.y + 22, say(L('Baumhöhe über den Schatten', 'Tree height from shadows')), { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.par(), 0.55) });
      g.restore();
      g.restore();
    }

    /** Lupe in der linken oberen Ecke: Z, Stab und Schatten groß, mit Sonnenhöhe und Maßen. */
    function drawLupe(R: Rect, z: Px, stickB: Px, el: number, st: number, stickX: number, ds: number, alpha: number, top0: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const rL = Math.round(clamp(Math.min(R.w * 0.17, R.h * 0.2), 52, 84));
      const cx = R.x + 14 + rL;
      const cy = R.y + top0 + rL;
      const span = Math.max(stickX, 0.5);
      const ls = Math.min((2 * rL * 0.74) / (span * 1.25), (2 * rL * 0.52) / st);
      const gyL = cy + rL * 0.42;
      const zx = cx - (span * ls) / 2 - rL * 0.06;
      const Lp = (x: number, y: number): Px => [zx + x * ls, gyL - y * ls];
      // Markierung in der Szene und Verbindung zur Lupe
      const mr = Math.max(12, Math.hypot(stickB[0] - z[0], fs(30, 26)) / 2 + 6);
      const mc: Px = [(z[0] + stickB[0]) / 2, z[1] - 8];
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = withAlpha(theme.text, dark ? 0.5 : 0.4);
      g.lineWidth = 1.3;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.arc(mc[0], mc[1], mr, 0, TAU);
      g.stroke();
      const dx = mc[0] - cx;
      const dy = mc[1] - cy;
      const dl = Math.hypot(dx, dy) || 1;
      g.beginPath();
      g.moveTo(cx + (dx / dl) * rL, cy + (dy / dl) * rL);
      g.lineTo(mc[0] - (dx / dl) * mr, mc[1] - (dy / dl) * mr);
      g.stroke();
      g.setLineDash([]);
      // Glas
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.fillStyle = dark ? '#16243a' : '#eef7fd';
      g.beginPath();
      g.arc(cx, cy, rL, 0, TAU);
      g.fill();
      g.restore();
      g.save();
      g.beginPath();
      g.arc(cx, cy, rL - 1, 0, TAU);
      g.clip();
      const sky = g.createLinearGradient(0, cy - rL, 0, gyL);
      sky.addColorStop(0, dark ? '#13223a' : '#cfe7fa');
      sky.addColorStop(1, dark ? '#22344f' : '#f4faff');
      g.fillStyle = sky;
      g.fillRect(cx - rL, cy - rL, 2 * rL, gyL - cy + rL);
      const gr = g.createLinearGradient(0, gyL, 0, cy + rL);
      gr.addColorStop(0, dark ? '#2f4a2b' : '#a9d58f');
      gr.addColorStop(1, dark ? '#1c301b' : '#86c26f');
      g.fillStyle = gr;
      g.fillRect(cx - rL, gyL, 2 * rL, cy + rL - gyL);
      const Z0 = Lp(0, 0);
      const B0 = Lp(stickX, 0);
      const A0 = Lp(stickX, st);
      // Schatten des Stabs
      g.fillStyle = dark ? 'rgba(0,0,0,0.42)' : 'rgba(30,60,20,0.32)';
      g.beginPath();
      g.moveTo(Lp(stickX - st / Math.tan(rad(el)), 0)[0], gyL + 1);
      g.lineTo(B0[0], gyL + 1);
      g.lineTo(B0[0], gyL + 7);
      g.closePath();
      g.fill();
      // Sonnenstrahl durch die Stabspitze
      const ux = Math.cos(rad(el));
      const uy = -Math.sin(rad(el));
      line(Z0, [Z0[0] + ux * rL * 3, Z0[1] + uy * rL * 3], col.sun(), 2.4, { glow: true });
      // Stab
      const sw = 6;
      for (let i = 0; i < 6; i++) {
        const y0 = lerp(B0[1], A0[1], i / 6);
        const y1 = lerp(B0[1], A0[1], (i + 1) / 6);
        g.fillStyle = i % 2 ? '#f8f8f8' : '#d9363e';
        g.fillRect(B0[0] - sw / 2, y1, sw, y0 - y1 + 0.5);
      }
      // Winkel bei Z
      g.strokeStyle = col.sun();
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(Z0[0], Z0[1], 20, -rad(el), 0);
      g.stroke();
      g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
      g.fillStyle = col.sun();
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(`${N(el, 1)}°`, Z0[0] + 24, Z0[1] - 8);
      g.restore();
      // Rahmen
      g.strokeStyle = dark ? '#5b6b82' : '#8b98ab';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, rL, 0, TAU);
      g.stroke();
      g.strokeStyle = withAlpha('#ffffff', dark ? 0.15 : 0.6);
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, rL - 5, -2.6, -1.6);
      g.stroke();
      g.restore();
      // Namen und Maße (über dem Glas)
      g.save();
      g.globalAlpha *= alpha;
      point(Z0, 'Z', theme.text, [-1, 0.9], { r: 4 });
      point(B0, 'B', col.r2(), [0.5, 1], { r: 3.5 });
      point(A0, 'A', col.r1(), [-1, -0.4], { r: 4.5 });
      const sz = fs(11.5, 11);
      fpill(B0[0] + 8, (A0[1] + B0[1]) / 2, `\\c{p}{s = ${N(st, 2)} ${M}}`, { align: 'left', size: sz, color: col.par() });
      if (Math.abs(stickX - ds) < 0.02) fpill((Z0[0] + B0[0]) / 2, gyL + 16, `\\c{b}{\\o{ZB} = ${N(ds, 2)} ${M}}`, { size: sz, color: col.r2() });
      g.restore();
    }

    /* =====================================================================
     * Anwendung: Teichbreite
     * ===================================================================== */
    const grassDots = (() => {
      let s = 7;
      const rnd = () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
      };
      return Array.from({ length: 90 }, () => [rnd(), rnd(), rnd()] as [number, number, number]);
    })();

    function stake(q: Px, color: string, alpha: number, pop = 1): void {
      if (alpha <= 0.01 || pop <= 0.01) return;
      const g = surface.g;
      const r = fs(7, 6) * pop;
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.beginPath();
      g.ellipse(q[0] + 3, q[1] + 3, r, r * 0.8, 0, 0, TAU);
      g.fill();
      g.fillStyle = color;
      g.beginPath();
      g.arc(q[0], q[1], r, 0, TAU);
      g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(q[0], q[1], r * 0.62, 0, TAU);
      g.fill();
      g.fillStyle = color;
      g.beginPath();
      g.arc(q[0], q[1], r * 0.3, 0, TAU);
      g.fill();
      g.restore();
    }

    function drawTeich(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const V = viewOf('teich');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const w = W.v;
      const kt = KT.v;
      const T = pondGeometry(w, kt);
      const t = storyT(now, 'teich');
      const popAB = ease.outBack(clamp01(t / 500));
      const popZ = ease.outBack(clamp01((t - 600) / 450));
      const lineA = ease.inOutCubic(clamp01((t - 1100) / 1100));
      const popA2 = ease.outBack(clamp01((t - 2100) / 450));
      const lineB = ease.inOutCubic(clamp01((t - 2500) / 1100));
      const popB2 = ease.outBack(clamp01((t - 3500) / 450));
      const tape = ease.inOutCubic(clamp01((t - 4000) / 1100));
      const across = ease.inOutCubic(clamp01((t - 5300) / 1200));
      const a = P(T.A);
      const b = P(T.B);
      const z = P(T.Z);
      const a2 = P(T.A2);
      const b2 = P(T.B2);
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = dark ? '#1d321b' : '#acd893';
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      const mg = g.createLinearGradient(0, R.y, 0, R.y + R.h);
      mg.addColorStop(0, dark ? '#22391f' : '#b6de9e');
      mg.addColorStop(1, dark ? '#192c17' : '#98cc80');
      g.fillStyle = mg;
      g.fillRect(R.x, R.y, R.w, R.h);
      // Grasbüschel
      g.strokeStyle = dark ? 'rgba(120,170,100,0.35)' : 'rgba(60,120,45,0.35)';
      g.lineWidth = 1.2;
      for (const [u, v, s] of grassDots) {
        const x = R.x + u * R.w;
        const y = R.y + v * R.h;
        g.beginPath();
        g.moveTo(x - 3, y);
        g.lineTo(x - 1 - s * 2, y - 5 - s * 3);
        g.moveTo(x, y);
        g.lineTo(x + 0.5, y - 6 - s * 3);
        g.moveTo(x + 3, y);
        g.lineTo(x + 2 + s * 2, y - 5 - s * 3);
        g.stroke();
      }
      // Büsche (Draufsicht)
      const bush = (q: Pt, r: number) => {
        const c = P(q);
        const rp = r * V.s;
        g.save();
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.beginPath();
        g.arc(c[0] + 4, c[1] + 4, rp, 0, TAU);
        g.fill();
        const bg = g.createRadialGradient(c[0] - rp * 0.3, c[1] - rp * 0.3, rp * 0.1, c[0], c[1], rp);
        bg.addColorStop(0, dark ? '#4c8a42' : '#7fc463');
        bg.addColorStop(1, dark ? '#25502a' : '#3f8a36');
        g.fillStyle = bg;
        g.beginPath();
        g.arc(c[0], c[1], rp, 0, TAU);
        g.fill();
        g.restore();
      };
      bush([-0.04 * w, 0.3 * w], 0.07 * w);
      bush([1.04 * w, 0.28 * w], 0.06 * w);
      bush([1.0 * w, -0.72 * w], 0.07 * w);
      // Teich
      const cx = (T.A[0] + T.B[0]) / 2;
      const rx = w / 2;
      const ry = 0.3 * w;
      const pond: Px[] = [];
      for (let i = 0; i <= 96; i++) {
        const ph = (i / 96) * TAU;
        const m = 1 + 0.07 * Math.sin(2 * ph) + 0.04 * Math.sin(4 * ph);
        pond.push(P([cx + rx * Math.cos(ph) * m, ry * Math.sin(ph) * m]));
      }
      const path = () => {
        g.beginPath();
        pond.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
      };
      g.save();
      path();
      g.strokeStyle = dark ? '#6b6146' : '#d9c891';
      g.lineWidth = fs(9, 7);
      g.stroke();
      const c0 = P([cx, 0]);
      const wg = g.createRadialGradient(c0[0] - rx * V.s * 0.3, c0[1] - ry * V.s * 0.4, 4, c0[0], c0[1], rx * V.s);
      wg.addColorStop(0, dark ? '#2f6a8f' : '#93d3f2');
      wg.addColorStop(1, dark ? '#173c57' : '#4aa3d4');
      g.fillStyle = wg;
      path();
      g.fill();
      g.clip();
      // Wellen
      g.strokeStyle = 'rgba(255,255,255,0.32)';
      g.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        const yy = c0[1] - ry * V.s * 0.5 + i * ry * V.s * 0.24;
        const x0 = c0[0] - rx * V.s * (0.42 - i * 0.07) + (i % 2) * rx * V.s * 0.3;
        g.beginPath();
        g.moveTo(x0, yy);
        g.quadraticCurveTo(x0 + rx * V.s * 0.1, yy - 4, x0 + rx * V.s * 0.2, yy);
        g.stroke();
      }
      // Seerosen
      for (const [u, v] of [
        [0.3, 0.12],
        [0.62, -0.1],
        [0.7, 0.16],
      ] as [number, number][]) {
        const c = P([u * w, v * w]);
        const rp = 0.025 * w * V.s;
        g.fillStyle = dark ? '#3d7a3a' : '#5fae4e';
        g.beginPath();
        g.arc(c[0], c[1], rp, 0.4, TAU - 0.1);
        g.lineTo(c[0], c[1]);
        g.closePath();
        g.fill();
      }
      g.restore();
      // Peillinien über Z hinaus
      const lab = k.labels;
      const segPart = (p0: Px, p1: Px, tt: number): Px => [lerp(p0[0], p1[0], tt), lerp(p0[1], p1[1], tt)];
      const tA = lineA;
      const tB = lineB;
      // Abschnitt A→Z→A′ als ein Weg (zuerst bis Z, dann bis A′)
      const pathAZ = (tt: number, p0: Px, pz: Px, p1: Px, c: string, cl: string) => {
        const l1 = Math.hypot(pz[0] - p0[0], pz[1] - p0[1]);
        const l2 = Math.hypot(p1[0] - pz[0], p1[1] - pz[1]);
        const sp = (tt * (l1 + l2)) / Math.max(1, l1);
        line(p0, segPart(p0, pz, clamp01(sp)), cl, fs(3.4, 3), { dash: [9, 6] });
        if (sp > 1) line(pz, segPart(pz, p1, clamp01(((tt * (l1 + l2)) - l1) / Math.max(1, l2))), c, fs(3.4, 3));
      };
      pathAZ(tA, a, z, a2, col.r1(), light(col.r1()));
      pathAZ(tB, b, z, b2, col.r2(), light(col.r2()));
      // gesuchte Breite quer über den Teich
      if (across > 0.01) {
        line(a, segPart(a, b, across), light(col.par()), fs(3.4, 3), { dash: [4, 5] });
        const show = p.show;
        const mm = measureCm(p.w / p.kt);
        const src = show ? `\\c{p}{\\o{AB} = ${p.kt} · ${N(mm, 2)} ${M} ${eq(p.kt * mm, 1)} ${N(p.kt * mm, 1)} ${M}}` : `\\c{p}{\\o{AB} = ?}`;
        const mid2 = segPart(a, b, across / 2);
        fpill(mid2[0], mid2[1] - fs(22, 18), src, { size: fs(13, 12), alpha: lab * across, border: withAlpha(col.par(), 0.6), bounds: R });
      }
      // Maßband A′B′
      if (tape > 0.01) {
        const end = segPart(a2, b2, tape);
        line(a2, end, dark ? '#e6c35a' : '#e8b62c', fs(7, 6), { cap: 'butt' });
        g.save();
        g.strokeStyle = 'rgba(0,0,0,0.35)';
        g.lineWidth = 1;
        const L2 = Math.hypot(end[0] - a2[0], end[1] - a2[1]);
        const ux = (b2[0] - a2[0]) / Math.max(1, Math.hypot(b2[0] - a2[0], b2[1] - a2[1]));
        const uy = (b2[1] - a2[1]) / Math.max(1, Math.hypot(b2[0] - a2[0], b2[1] - a2[1]));
        for (let d = 4; d < L2; d += 6) {
          g.beginPath();
          g.moveTo(a2[0] + ux * d - uy * 3, a2[1] + uy * d + ux * 3);
          g.lineTo(a2[0] + ux * d + uy * 2, a2[1] + uy * d - ux * 2);
          g.stroke();
        }
        g.restore();
        const mm = measureCm(p.w / p.kt) * tape;
        const mid2 = segPart(a2, b2, 0.5);
        fpill(mid2[0], mid2[1] + fs(22, 19), `\\c{P}{\\o{A′B′} ${eq(mm)} ${N(mm, 2)} ${M}}`, { size: fs(12.5, 11.5), alpha: lab * clamp01(tape * 2), border: withAlpha(col.par(), 0.6), bounds: R });
      }
      // Verhältnis an den Peillinien
      if (lab > 0.01 && tA >= 1) {
        const m1 = segPart(z, a2, 0.5);
        const dx = a2[0] - z[0];
        fpill(m1[0] + (dx < 0 ? -1 : 1) * fs(46, 38), m1[1], `\\c{A}{\\o{ZA′} = \\f{\\o{ZA}}{${p.kt}}}`, { size: fs(12, 11), alpha: lab, bounds: R });
      }
      if (lab > 0.01 && tB >= 1) {
        const m1 = segPart(z, b2, 0.5);
        const dx = b2[0] - z[0];
        fpill(m1[0] + (dx < 0 ? -1 : 1) * fs(46, 38), m1[1], `\\c{B}{\\o{ZB′} = \\f{\\o{ZB}}{${p.kt}}}`, { size: fs(12, 11), alpha: lab, bounds: R });
      }
      // Stäbe
      const red = '#d9363e';
      stake(a, red, 1, popAB);
      stake(b, red, 1, popAB);
      stake(z, '#2f6fd9', 1, popZ);
      stake(a2, red, 1, popA2);
      stake(b2, red, 1, popB2);
      // Namen und Griffe
      const nm = (q: Px, name: string, c: string, away: Px, alpha2: number, id?: DragId) => point(q, name, c, away, { alpha: alpha2, id, r: 0.1 });
      nm(a, 'A', col.r1(), [-1, 0.2], popAB * lab);
      nm(b, 'B', col.r2(), [1, 0.2], popAB * lab, 'pb');
      nm(z, 'Z', theme.text, [1, 0], popZ * lab);
      nm(a2, 'A′', col.r1(), [1, 0.6], popA2 * lab, 'p2');
      nm(b2, 'B′', col.r2(), [-1, 0.6], popB2 * lab);
      g.restore();
      fpill(R.x + 12, R.y + 22, say(L('Breite eines Teichs (Draufsicht)', 'Width of a pond (top view)')), { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.par(), 0.55) });
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    interface Row {
      src: string;
      color?: string;
      size?: number;
      weight?: number;
      gap?: number;
      at?: number;
    }

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: Row[], right?: string, extra?: { h: number; draw: (x: number, y: number, w: number) => void }): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad;
      const boxes = rows.map((r) => fit(r.src, maxW, r.size ?? fs(13.5, 12.5), r.color ?? th().text, r.weight ?? 600));
      const h = 38 + boxes.reduce((s, b, i) => s + rowH(b) + (rows[i]!.gap ?? 8), 0) + (extra ? extra.h + 4 : 0) + 4;
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
      if (extra) {
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        extra.draw(R.x + pad, y, maxW);
        g.restore();
      }
      return h;
    }

    function textCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, paras: { s: string; color?: string; weight?: number }[]): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const size = fs(12.5, 11.5);
      const lh = size * 1.36;
      const blocks = paras.map((pp) => ({ lines: wrapText(pp.s, R.w - 2 * pad, `${pp.weight ?? 500} ${size}px ${th().font}`), pp }));
      const h = 38 + blocks.reduce((s, b) => s + b.lines.length * lh + 6, 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent);
      let y = R.y + 38;
      g.save();
      g.globalAlpha *= ease.outCubic(k.stagger);
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const b of blocks) {
        g.font = `${b.pp.weight ?? 500} ${size}px ${th().font}`;
        g.fillStyle = b.pp.color ?? th().text;
        b.lines.forEach((ln, i) => g.fillText(ln, R.x + pad, y + lh / 2 + i * lh));
        y += b.lines.length * lh + 6;
      }
      g.restore();
      return h;
    }

    /** Streckenvergleich: Maßstäbe für ZA/ZA′, ZB/ZB′, AB/A′B′ in gleichem Maßstab. */
    function barsCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const rowHh = fs(34, 31);
        const f = shownFig();
        const Ls = lengths(f);
        const Lt = lengths(figT());
        const rows: { lab: string; u: number; v: number; ut: number; vt: number; uc: string; vc: string; c: string }[] = [
          { lab: `${seg('za2')} : ${seg('za')}`, u: Ls.za, v: Ls.za2, ut: Lt.za, vt: Lt.za2, uc: light(col.r1()), vc: col.r1(), c: col.r1() },
          { lab: `${seg('zb2')} : ${seg('zb')}`, u: Ls.zb, v: Ls.zb2, ut: Lt.zb, vt: Lt.zb2, uc: light(col.r2()), vc: col.r2(), c: col.r2() },
          { lab: `${seg('a2b2')} : ${seg('ab')}`, u: Ls.ab, v: Ls.a2b2, ut: Lt.ab, vt: Lt.a2b2, uc: light(col.par()), vc: nonPar() ? col.bad() : col.par(), c: col.par() },
        ];
        const h = 40 + rows.length * rowHh + 6;
        if (measure) return h;
        const ref = rows[0]!.v / rows[0]!.u;
        const allEq = rows.every((r) => Math.abs(r.v / r.u - ref) < 0.005);
        card({ ...R, h }, col.k());
        cardTitle(R, say(L('Streckenvergleich', 'Comparing lengths')), col.k(), allEq ? `\\c{k}{|k| = ${N(ref, 2)}}` : `\\c{bad}{${say(L('verschieden', 'different'))}}`);
        const labBoxes = rows.map((r) => formula(g, r.lab, fstyle(fs(12.5, 11.5), theme.text, 650)));
        const labW = Math.max(...labBoxes.map((b) => b.w));
        const valW = fs(54, 48);
        const x0 = R.x + pad + labW + 10;
        const x1 = R.x + R.w - pad - valW;
        const maxLen = Math.max(...rows.flatMap((r) => [r.ut, r.vt, r.u, r.v]), 1e-6);
        const sc = (x1 - x0) / maxLen;
        rows.forEach((r, i) => {
          const y = R.y + 40 + i * rowHh;
          const a = ease.outCubic(clamp01(k.stagger * 5 - i));
          g.save();
          g.globalAlpha *= a;
          const lb = labBoxes[i]!;
          lb.draw(g, R.x + pad, y + 12 + (lb.asc - lb.desc) / 2);
          // ungestrichene Strecke (dünn, hell)
          const wu = r.u * sc * a;
          const wv = r.v * sc * a;
          g.fillStyle = r.uc;
          roundRect(g, x0, y + 2, Math.max(2, wu), 7, 3.5);
          g.fill();
          // gestrichene Strecke mit Teilstrichen im Abstand der ungestrichenen
          const gr = g.createLinearGradient(x0, 0, x0 + Math.max(4, wv), 0);
          gr.addColorStop(0, mixColor(r.vc, '#ffffff', 0.2));
          gr.addColorStop(1, r.vc);
          g.fillStyle = gr;
          roundRect(g, x0, y + 12, Math.max(2, wv), 11, 4);
          g.fill();
          if (wu > 3) {
            g.strokeStyle = mixColor(theme.bg, theme.bg, 0, theme.dark ? 0.85 : 0.95);
            g.lineWidth = 1.6;
            for (let j = 1; j * wu < wv - 1.5; j++) {
              const xx = Math.round(x0 + j * wu) + 0.5;
              g.beginPath();
              g.moveTo(xx, y + 12);
              g.lineTo(xx, y + 23);
              g.stroke();
            }
          }
          // Wert
          const rv = r.v / Math.max(1e-9, r.u);
          const ok = Math.abs(rv - ref) < 0.005;
          const vs = `${i > 0 && !ok ? '\\c{bad}' : '\\c{k}'}{${eq(rv)} ${N(rv, 2)}}${i > 0 ? (ok ? ' \\c{ok}{✓}' : ' \\c{bad}{✗}') : ''}`;
          const vb = formula(g, vs, fstyle(fs(13, 12), theme.text, 750));
          vb.draw(g, R.x + R.w - pad - vb.w, y + 12 + (vb.asc - vb.desc) / 2);
          g.restore();
        });
        return h;
      };
    }

    /** Abschnitte-Balken: ZA | AA′ und ZB | BB′ auf gleiche Länge gebracht – gleiche Teilung ⇔ gleiches Verhältnis. */
    function piecesExtra(): { h: number; draw: (x: number, y: number, w: number) => void } {
      return {
        h: 34,
        draw: (x, y, w) => {
          const g = surface.g;
          const f = shownFig();
          const Ls = lengths(f);
          const rows = [
            { u: Ls.za, v: Ls.aa2, uc: light(col.r1()), vc: mid(col.r1()) },
            { u: Ls.zb, v: Ls.bb2, uc: light(col.r2()), vc: mid(col.r2()) },
          ];
          let split0 = -1;
          rows.forEach((r, i) => {
            const yy = y + i * 15;
            const tot = r.u + r.v;
            const wu = tot > 1e-9 ? (w * r.u) / tot : w;
            g.fillStyle = r.uc;
            roundRect(g, x, yy, Math.max(2, wu - 1), 10, 4);
            g.fill();
            g.fillStyle = r.vc;
            roundRect(g, x + wu + 1, yy, Math.max(0, w - wu - 1), 10, 4);
            if (w - wu > 2) g.fill();
            if (i === 0) split0 = x + wu;
            else {
              const ok = Math.abs(x + wu - split0) < 1.5;
              g.save();
              g.strokeStyle = ok ? col.k() : col.bad();
              g.lineWidth = 1.6;
              g.setLineDash([3, 3]);
              g.beginPath();
              g.moveTo(split0, y - 3);
              g.lineTo(split0, y + 28);
              g.stroke();
              g.restore();
            }
          });
        },
      };
    }

    function s1Card(k: Intro): CardFn {
      return (R, measure) => {
        const f = shownFig();
        const Ls = lengths(f);
        const r1 = Ls.za2 / Ls.za;
        const r2 = Ls.zb2 / Ls.zb;
        const ok = Math.abs(r1 - r2) < 0.005;
        const c = (v: number) => `${N(v)} cm`;
        const pr = pieceRatios(f);
        const rows: Row[] = [
          { src: `\\f{${seg('za2')}}{${seg('za')}} = \\f{${seg('zb2')}}{${seg('zb')}}`, size: fs(15, 14), gap: 10 },
          {
            src: ok
              ? `\\f{\\c{A}{${c(Ls.za2)}}}{\\c{a}{${c(Ls.za)}}} ${eq(r1)} \\c{k}{\\b{${N(r1)}}} = \\f{\\c{B}{${c(Ls.zb2)}}}{\\c{b}{${c(Ls.zb)}}}  \\c{ok}{✓}`
              : `\\f{\\c{A}{${c(Ls.za2)}}}{\\c{a}{${c(Ls.za)}}} ${eq(r1)} \\c{k}{\\b{${N(r1)}}} \\c{bad}{≠ \\b{${N(r2)}}} ${eq(r2)} \\f{\\c{B}{${c(Ls.zb2)}}}{\\c{b}{${c(Ls.zb)}}}`,
            size: fs(13.5, 12.5),
            gap: 10,
          },
        ];
        let extra: ReturnType<typeof piecesExtra> | undefined;
        if (Number.isFinite(pr.pa) && Number.isFinite(pr.pb)) {
          const okp = Math.abs(pr.pa - pr.pb) < 0.005;
          rows.push({ src: `\\c{m}{${say(L('Abschnitte (nur auf den Strahlen):', 'Pieces (on the rays only):'))}}`, size: fs(12, 11), color: th().muted, gap: 4 });
          rows.push({ src: `\\f{${seg('za')}}{${seg('aa2')}} ${okp ? '=' : '≠'} \\f{${seg('zb')}}{${seg('bb2')}}:  ${N(Ls.za)} : ${N(Ls.aa2)} ${okp ? '=' : '≠'} ${N(Ls.zb)} : ${N(Ls.bb2)}`, size: fs(13, 12), gap: 8 });
          extra = piecesExtra();
        } else rows.push({ src: `\\c{m}{${say(L('k = 1: A′ = A und B′ = B – keine Abschnitte', 'k = 1: A′ = A and B′ = B – no pieces'))}}`, size: fs(12, 11), color: th().muted });
        return formulaCard(R, measure, k, say(L('1. Strahlensatz', '1st intercept theorem')), col.r1(), rows, undefined, extra);
      };
    }

    function s2Card(k: Intro): CardFn {
      return (R, measure) => {
        const f = shownFig();
        const Ls = lengths(f);
        const r3 = Ls.a2b2 / Ls.ab;
        const r1 = Ls.za2 / Ls.za;
        const ok = Math.abs(r3 - r1) < 0.005;
        const rows: Row[] = [
          { src: `\\f{${seg('a2b2')}}{${seg('ab')}} = \\f{${seg('za2')}}{${seg('za')}}`, size: fs(15, 14), gap: 10 },
          { src: `\\c{P}{${seg('a2b2')} ${eq(Ls.a2b2)} ${N(Ls.a2b2)} cm},  \\c{p}{${seg('ab')} ${eq(Ls.ab)} ${N(Ls.ab)} cm}`, size: fs(12.5, 11.5), gap: 6 },
          { src: ok ? `\\f{${seg('a2b2')}}{${seg('ab')}} ${eq(r3)} \\c{k}{\\b{${N(r3)}}}  \\c{ok}{✓}` : `\\f{${seg('a2b2')}}{${seg('ab')}} ${eq(r3)} \\c{bad}{\\b{${N(r3)}} ≠ ${N(r1)}}`, size: fs(13.5, 12.5), gap: 8 },
        ];
        if (!isX() && Ls.aa2 > 0.05 && ok) {
          const wrong = Ls.aa2 / Ls.za;
          if (Math.abs(wrong - r1) > 0.005) rows.push({ src: `\\c{m}{${say(L('Achtung', 'Careful'))}: \\f{\\o{AA′}}{\\o{ZA}} ${eq(wrong)} ${N(wrong)} ≠ ${N(r1)} – ${say(L('von Z aus messen!', 'measure from Z!'))}}`, size: fs(12, 11), color: th().muted });
        } else if (isX() && ok) rows.push({ src: `\\c{m}{${say(L('X-Figur: immer von Z aus messen', 'X shape: always measure from Z'))}}`, size: fs(12, 11), color: th().muted });
        return formulaCard(R, measure, k, say(L('2. Strahlensatz', '2nd intercept theorem')), col.par(), rows);
      };
    }

    function simCard(k: Intro): CardFn {
      return (R, measure) => {
        const kv = KA.v;
        const paras: { s: string; color?: string; weight?: number }[] = [];
        paras.push({
          s: say(L(`ZA′B′ entsteht aus ZAB durch zentrische Streckung mit Zentrum Z und k = ${N(kv)}. Die Dreiecke sind ähnlich: gleiche Winkel, alle Seiten mal ${N(Math.abs(kv))}.`, `ZA′B′ is the image of ZAB under an enlargement with centre Z and k = ${N(kv)}. The triangles are similar: same angles, every side times ${N(Math.abs(kv))}.`)),
        });
        if (Math.abs(kv - 1) < 0.001) paras.push({ s: say(L('k = 1: A′ = A, B′ = B – die beiden Parallelen fallen zusammen.', 'k = 1: A′ = A, B′ = B – the two parallels coincide.')), color: col.k(), weight: 650 });
        else if (kv > 0 && kv < 1) paras.push({ s: say(L('0 < k < 1: Verkleinerung – A′ liegt zwischen Z und A.', '0 < k < 1: reduction – A′ lies between Z and A.')), color: col.k(), weight: 650 });
        else if (kv < 0) paras.push({ s: say(L('k < 0: A′ und B′ liegen auf der anderen Seite von Z (X-Figur). Die Strahlensätze gelten mit den Längen, also mit |k|.', 'k < 0: A′ and B′ lie on the other side of Z (X shape). The theorems use lengths, i.e. |k|.')), color: col.k(), weight: 650 });
        return textCard(R, measure, k, say(L('Ähnliche Dreiecke', 'Similar triangles')), col.k(), paras);
      };
    }

    function nonParCard(k: Intro): CardFn {
      return (R, measure) => {
        const f = shownFig();
        const paras: { s: string; color?: string; weight?: number }[] = [
          { s: say(L(`Die Verhältnisse sind verschieden – AB und A′B′ sind nicht parallel (Abweichung ${N(angleBetween(f), 1)}°). Ohne Parallelen gelten die Strahlensätze nicht.`, `The ratios differ – AB and A′B′ are not parallel (off by ${N(angleBetween(f), 1)}°). Without parallels the theorems do not hold.`)), color: col.bad(), weight: 650 },
          { s: say(L('Umkehrung des 1. Strahlensatzes: Sind die Verhältnisse gleich, dann sind die Geraden parallel. Probiere „B′ angleichen“.', 'Converse of the 1st theorem: if the ratios are equal, the lines are parallel. Try “Adjust B′”.')) },
        ];
        const x2 = counterPointX(A.v, B.v, TH.v, KA.v);
        if (x2 * KA.v > 0 && Math.abs(x2 - KA.v * B.v) > 0.3)
          paras.push({ s: say(L(`Die Umkehrung des 2. Strahlensatzes gilt nicht: Auch für B″ ist |A′B″| : |AB| = ${N(Math.abs(KA.v))}, aber A′B″ ist nicht parallel zu AB.`, `The converse of the 2nd theorem is false: B″ also gives A′B″ : AB = ${N(Math.abs(KA.v))}, but A′B″ is not parallel to AB.`)), color: th().muted });
        return textCard(R, measure, k, say(L('Nicht parallel', 'Not parallel')), col.bad(), paras);
      };
    }

    /* ---------- Rechenmodus ---------- */
    function stepsK(now: number): number[] {
      if (!steps) return [1, 1, 1, 1, 1];
      const t = now - steps.t0;
      return [0, 1, 2, 3, 4].map((i) => ease.outCubic(clamp01((t - 200 - i * 1000) / 600)));
    }
    function stepsDone(now: number): boolean {
      return !steps || now - steps.t0 > 3600;
    }

    function taskCard(k: Intro): CardFn {
      return (R, measure) => {
        const f = figT();
        const s = solveTask(ask(), f);
        const Lt = lengths(f);
        const t = s.spec;
        const giv = [t.den2, t.num2, t.den1].map((key) => `${seg(key)} = ${N(Lt[key])} cm`).join(',  ');
        const rows: Row[] = [
          { src: `\\c{m}{${say(L('Gegeben', 'Given'))}:}`, size: fs(12, 11), color: th().muted, gap: 4 },
          { src: giv, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\c{m}{${say(L('Gesucht', 'Unknown'))}:}  ${seg(t.x)} \\c{x}{= x}`, size: fs(13.5, 12.5), gap: 6 },
          { src: `\\c{m}{${isX() ? `\\t{${say(L('X-Figur, AB ∥ A′B′', 'X shape, AB ∥ A′B′'))}}` : `\\t{${say(L('V-Figur, AB ∥ A′B′', 'V shape, AB ∥ A′B′'))}}`}}`, size: fs(12, 11), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Aufgabe', 'Task')), col.x(), rows, `\\c{x}{${say(ASK_INFO[ask()].name)}}`);
      };
    }

    function stepsCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        if (!p.show) {
          return textCard(R, measure, k, say(L('Lösung', 'Solution')), col.x(), [
            { s: say(L('Stelle die Verhältnisgleichung selbst auf: Die Unbekannte x in den Zähler, die passende Strecke darunter.', 'Set up the proportion yourself: put the unknown x in the numerator and the matching length below it.')) },
            { s: say(L('„Schritt für Schritt lösen“ zeigt den Rechenweg.', '“Solve step by step” shows the working.')), color: th().muted },
          ]);
        }
        const f = figT();
        const s = solveTask(ask(), f);
        const t = s.spec;
        const st = stepsK(now);
        const c = (v: number) => `${N(v)} cm`;
        const name = t.theorem === 1 ? (t.pieces ? say(L('1. Strahlensatz (Abschnitte)', '1st theorem (pieces)')) : say(L('1. Strahlensatz', '1st theorem'))) : say(L('2. Strahlensatz', '2nd theorem'));
        const fsz = fs(13.5, 12.5);
        const rows: Row[] = [
          { src: `\\c{m}{① ${say(L('Ansatz', 'Set up'))}: ${name}}`, size: fs(12, 11), color: th().muted, at: st[0], gap: 4 },
          { src: `\\f{\\c{x}{\\o{${SEG[t.x].src}}}}{${seg(t.den1)}} = \\f{${seg(t.num2)}}{${seg(t.den2)}}`, size: fsz, at: st[0], gap: 8 },
          { src: `\\c{m}{② ${say(L('Einsetzen', 'Substitute'))}}`, size: fs(12, 11), color: th().muted, at: st[1], gap: 4 },
          { src: `\\f{\\c{x}{x}}{${c(s.d1)}} = \\f{${c(s.n2)}}{${c(s.d2)}}`, size: fsz, at: st[1], gap: 8 },
          { src: `\\c{m}{③ ${say(L('Mit', 'Multiply by'))} ${c(s.d1)} ${say(L('multiplizieren', ''))}}`, size: fs(12, 11), color: th().muted, at: st[2], gap: 4 },
          { src: `\\c{x}{x} = \\f{${c(s.n2)} · ${c(s.d1)}}{${c(s.d2)}}`, size: fsz, at: st[2], gap: 8 },
          { src: `\\c{x}{x ${eq(s.x)} \\b{${c(s.x)}}}`, size: fs(15, 14), at: st[3], gap: 8 },
          { src: `\\c{m}{${say(L('Probe', 'Check'))}: ${N(s.x)} : ${N(s.d1)} ${eq(s.x / s.d1)} ${N(s.x / s.d1)} ${eq(s.n2 / s.d2)} ${N(s.n2 / s.d2)} : 1  ✓}`, size: fs(12, 11), color: th().muted, at: st[4] },
        ];
        return formulaCard(R, measure, k, say(L('Lösung Schritt für Schritt', 'Solution step by step')), col.x(), rows);
      };
    }

    /* ---------- Anwendungen ---------- */
    function baumCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const t = storyT(now, 'baum');
        const { dStick, dTree } = shadowLengths(p.ht, p.st, p.el);
        const ds = measureCm(dStick);
        const dt = measureCm(dTree);
        const h = treeHeight(p.st, ds, dt);
        const e = (i: number) => (t === Infinity ? 1 : ease.outCubic(clamp01((t - 5000 - i * 500) / 450)));
        const m = (v: number) => `${N(v, 2)} ${M}`;
        const show = p.show;
        const rows: Row[] = [
          { src: `\\c{m}{${say(L('Gemessen', 'Measured'))}:}  \\c{p}{s = ${m(p.st)}},  \\c{b}{\\o{ZB} = ${t > 3700 ? m(ds) : '…'}},  \\c{B}{\\o{ZB′} = ${t > 4900 ? m(dt) : '…'}}`, size: fs(12.5, 11.5), gap: 10 },
          { src: `\\f{\\c{P}{h}}{\\c{p}{s}} = \\f{\\c{B}{\\o{ZB′}}}{\\c{b}{\\o{ZB}}}   \\c{m}{(2. ${say(L('Strahlensatz', 'theorem'))})}`, size: fs(14, 13), gap: 10, at: e(0) },
          { src: `\\f{\\c{P}{h}}{${m(p.st)}} = \\f{${m(dt)}}{${m(ds)}} ${show ? `${eq(dt / ds)} ${N(dt / ds, 2)}` : ''}`, size: fs(13.5, 12.5), gap: 8, at: e(1) },
          { src: show ? `\\c{P}{h ${eq(h, 1)} \\b{${N(h, 1)} ${M}}}  \\c{m}{(${say(L('wirklich', 'true'))}: ${m(p.ht)})}` : `\\c{P}{h = ?}`, size: fs(15, 14), at: e(2) },
        ];
        return formulaCard(R, measure, k, say(L('Rechnung', 'Calculation')), col.par(), rows);
      };
    }

    function baumInfoCard(k: Intro): CardFn {
      return (R, measure) => {
        const paras: { s: string; color?: string; weight?: number }[] = [
          { s: say(L('Sonnenstrahlen kommen praktisch parallel an. Stab und Baum stehen senkrecht – sie sind parallel zueinander.', 'Sunlight arrives practically in parallel. Stick and tree stand vertically – they are parallel to each other.')) },
          { s: say(L('Der Stab steht so, dass seine Schattenspitze mit der des Baums zusammenfällt: Das ist Z. Boden und Sonnenstrahl bilden eine V-Figur.', 'The stick is placed so that its shadow tip meets the tree’s: that is Z. Ground and sun ray form a V shape.')) },
        ];
        if (Math.abs(p.el - 45) < 0.5) paras.push({ s: say(L('Sonnenhöhe 45°: Jeder Schatten ist genau so lang, wie der Gegenstand hoch ist.', 'Sun elevation 45°: every shadow is exactly as long as the object is high.')), color: col.sun(), weight: 650 });
        else paras.push({ s: say(L('Ziehe die Sonne: Die Schatten ändern sich, das Ergebnis für h nicht.', 'Drag the sun: the shadows change, the result for h does not.')), color: th().muted });
        return textCard(R, measure, k, say(L('Warum darf man das?', 'Why does it work?')), col.sun(), paras);
      };
    }

    function teichCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const t = storyT(now, 'teich');
        const e = (i: number) => (t === Infinity ? 1 : ease.outCubic(clamp01((t - 4200 - i * 600) / 450)));
        const mm = measureCm(p.w / p.kt);
        const show = p.show;
        const res = p.kt * mm;
        const rows: Row[] = [
          { src: `\\c{A}{\\o{ZA′} = \\o{ZA} : ${p.kt}},  \\c{B}{\\o{ZB′} = \\o{ZB} : ${p.kt}}`, size: fs(13, 12), gap: 4, at: t === Infinity ? 1 : ease.outCubic(clamp01((t - 2200) / 500)) },
          { src: `⇒ \\c{P}{\\t{A′B′}} ∥ \\c{p}{\\t{AB}}   \\c{m}{(${say(L('Umkehrung 1. Strahlensatz', 'converse, 1st theorem'))})}`, size: fs(13, 12), gap: 10, at: e(0) },
          { src: `\\f{\\c{p}{\\o{AB}}}{\\c{P}{\\o{A′B′}}} = \\f{\\c{a}{\\o{ZA}}}{\\c{A}{\\o{ZA′}}} = ${p.kt}   \\c{m}{(2. ${say(L('Strahlensatz', 'theorem'))})}`, size: fs(13.5, 12.5), gap: 8, at: e(1) },
          { src: `\\c{P}{\\o{A′B′} = ${N(mm, 2)} ${M}}  \\c{m}{(${say(L('gemessen', 'measured'))})}`, size: fs(13, 12), gap: 6, at: e(2) },
          { src: show ? `\\c{p}{\\o{AB} = ${p.kt} · ${N(mm, 2)} ${M} ${eq(res, 1)} \\b{${N(res, 1)} ${M}}}` : `\\c{p}{\\o{AB} = ?}`, size: fs(15, 14), at: e(3) },
        ];
        return formulaCard(R, measure, k, say(L('Rechnung', 'Calculation')), col.par(), rows);
      };
    }

    function teichInfoCard(k: Intro): CardFn {
      return (R, measure) =>
        textCard(R, measure, k, say(L('So wird gemessen', 'How it is measured')), col.r1(), [
          { s: say(L('Fluchtstäbe in A und B an den Ufern, ein dritter in Z an Land.', 'Ranging poles at A and B on the banks, a third one at Z on land.')) },
          { s: say(L(`Von A über Z peilen und A′ so abstecken, dass |ZA′| = |ZA| : ${p.kt}; ebenso B′. Dann |A′B′| mit dem Maßband messen – ohne nasse Füße.`, `Sight from A over Z and place A′ so that ZA′ = ZA : ${p.kt}; B′ likewise. Then measure A′B′ with a tape – without wet feet.`)) },
          { s: say(L('Ziehe A′ (Verhältnis) oder B (wahre Breite).', 'Drag A′ (ratio) or B (true width).')), color: th().muted },
        ]);
    }

    function cardsFor(now: number, k: Intro): CardFn[] {
      const m = mode();
      if (m === 'v' || m === 'x') {
        // ohne Parallelen zuerst die Erklärung (Umkehrung, B″), sonst fällt sie bei wenig Platz weg
        if (nonPar()) return [barsCard(k), nonParCard(k), s1Card(k), s2Card(k)];
        return [barsCard(k), s1Card(k), s2Card(k), simCard(k)];
      }
      if (m === 'calc') return p.show ? [taskCard(k), stepsCard(now, k), barsCard(k)] : [taskCard(k), stepsCard(now, k)];
      if (m === 'baum') return [baumCard(now, k), baumInfoCard(k)];
      return [teichCard(now, k), teichInfoCard(k)];
    }

    function drawColumn(C: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const list = cardsFor(now, k);
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !regions().wide && C.w >= 460;
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
    const ov = (s: string) => `<span style="text-decoration: overline">${s}</span>`;
    function updateReadouts(): void {
      const m = mode();
      for (const key of ['giv', 'r1', 'r2', 'res']) ctx.readout(key, null);
      if (m === 'v' || m === 'x') {
        const f = figT();
        const Lt = lengths(f);
        const r1 = Lt.za2 / Lt.za;
        const r2 = Lt.zb2 / Lt.zb;
        const r3 = Lt.a2b2 / Lt.ab;
        ctx.readout('r1', { html: `${ov('ZA′')} : ${ov('ZA')} = ${N(Lt.za2)} cm : ${N(Lt.za)} cm ${eq(r1)} ${N(r1)} · ${ov('ZB′')} : ${ov('ZB')} = ${N(Lt.zb2)} cm : ${N(Lt.zb)} cm ${eq(r2)} ${N(r2)}` });
        ctx.readout('r2', { html: `${ov('A′B′')} : ${ov('AB')} ${eq(Lt.a2b2)} ${N(Lt.a2b2)} cm : ${N(Lt.ab)} cm ${eq(r3)} ${N(r3)}` });
        if (nonPar()) ctx.readout('res', { html: say(L(`Verhältnisse verschieden (${N(r1)} ≠ ${N(r2)}) ⇒ AB und A′B′ sind nicht parallel (Abweichung ${N(angleBetween(f), 1)}°)`, `Ratios differ (${N(r1)} ≠ ${N(r2)}) ⇒ AB and A′B′ are not parallel (off by ${N(angleBetween(f), 1)}°)`)) });
        else ctx.readout('res', { html: `<var>k</var> = ${N(kaTarget())} · AB ∥ A′B′ · ${say(L('Dreieck ZA′B′ ist ähnlich zu ZAB', 'triangle ZA′B′ is similar to ZAB'))}` });
      } else if (m === 'calc') {
        const f = figT();
        const s = solveTask(ask(), f);
        const t = s.spec;
        const Lt = lengths(f);
        ctx.readout('giv', { html: `${[t.den2, t.num2, t.den1].map((key) => `${ov(SEG[key].src)} = ${N(Lt[key])} cm`).join(', ')} · ${say(L('gesucht', 'unknown'))}: ${ov(SEG[t.x].src)} = <var>x</var>` });
        ctx.readout('res', { html: `<span class="frac"><span><var>x</var></span><span>${N(s.d1)} cm</span></span> = <span class="frac"><span>${N(s.n2)} cm</span><span>${N(s.d2)} cm</span></span> ⇒ <var>x</var> ${eq(s.x)} <strong>${N(s.x)} cm</strong>` });
      } else if (m === 'baum') {
        const { dStick, dTree } = shadowLengths(p.ht, p.st, p.el);
        const ds = measureCm(dStick);
        const dt = measureCm(dTree);
        const h = treeHeight(p.st, ds, dt);
        ctx.readout('giv', { html: `<var>s</var> = ${N(p.st)} m, ${ov('ZB')} = ${N(ds)} m, ${ov('ZB′')} = ${N(dt)} m` });
        ctx.readout('res', { html: `<var>h</var> = <var>s</var> · <span class="frac"><span>${ov('ZB′')}</span><span>${ov('ZB')}</span></span> = ${N(p.st)} m · <span class="frac"><span>${N(dt)} m</span><span>${N(ds)} m</span></span> ${eq(h, 1)} <strong>${N(h, 1)} m</strong>` });
      } else {
        const mm = measureCm(p.w / p.kt);
        ctx.readout('giv', { html: `${ov('ZA')} : ${ov('ZA′')} = ${ov('ZB')} : ${ov('ZB′')} = ${p.kt} : 1, ${ov('A′B′')} = ${N(mm)} m` });
        ctx.readout('res', { html: `${ov('AB')} = ${p.kt} · ${ov('A′B′')} = ${p.kt} · ${N(mm)} m ${eq(p.kt * mm, 1)} <strong>${N(p.kt * mm, 1)} m</strong>` });
      }
    }

    /* ---------- Rendern ---------- */
    function drawScene(s: Scene, now: number, k: Intro, alpha: number): void {
      if (s === 'fig') drawFig(now, k, alpha);
      else if (s === 'baum') drawBaum(now, k, alpha);
      else drawTeich(now, k, alpha);
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      if (surface.width !== lastSize.w || surface.height !== lastSize.h) {
        lastSize = { w: surface.width, h: surface.height };
        retargetViews(now, true);
      }
      for (const c of allChans()) if (c.step(now, dt)) anim = true;
      if (slideAnim && now - slideAnim.t0 > slideAnim.dur) slideAnim = null;
      if (steps && now - steps.t0 > 5000) steps = null;
      if (story && now - story.t0 > (story.kind === 'baum' ? BAUM_END : TEICH_END)) story = null;
      if (slideAnim || steps || story || intro !== null) anim = true;
      const k = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      hits = [];
      let fadeIn = 1;
      if (sceneFade) {
        const t = (now - sceneFade.t0) / 600;
        if (t >= 1 || sceneFade.from === scene()) sceneFade = null;
        else {
          fadeIn = ease.outCubic(clamp01(t));
          anim = true;
        }
      }
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      if (sceneFade && fadeIn < 1) {
        drawScene(sceneFade.from, now, k, 1 - fadeIn);
        hits = [];
      }
      drawScene(scene(), now, k, fadeIn);
      g.restore();
      drawColumn(R.col, now, k);
      if (cardFade !== null) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retarget(now: number, source: string, changed: ReadonlySet<string>): void {
      const instant = source === 'init' || reduced();
      const targets: [Chan, number][] = [
        [A, p.a],
        [B, p.b],
        [TH, thTarget()],
        [KA, kaTarget()],
        [KB, kbTarget()],
        [HT, p.ht],
        [ST, p.st],
        [EL, p.el],
        [W, p.w],
        [KT, p.kt],
      ];
      const sideFlip = changed.has('mode') || changed.has('xf');
      targets.forEach(([c, v], i) => {
        if (instant) c.jump(v);
        else if (dragging()) c.follow(v, 0.05);
        else if (source === 'replace' || sideFlip) c.glide(v, sideFlip && (c === KA || c === KB) ? 1300 : 850, c === KA || c === KB ? 0 : i * 30, now);
        else if (Math.abs(c.goal - v) > 1e-12) c.follow(v, 0.16);
      });
      const flags: [Chan, number][] = [
        [wNoPar, nonPar() ? 1 : 0],
        [wTri, p.tri ? 1 : 0],
      ];
      for (const [c, v] of flags) {
        if (instant) c.jump(v);
        else if (c.goal !== v) c.glide(v, 500, 0, now);
      }
    }

    function startStory(now: number): void {
      if (reduced()) {
        story = null;
        return;
      }
      if (mode() === 'baum') story = { kind: 'baum', t0: now };
      else if (mode() === 'teich') story = { kind: 'teich', t0: now };
    }

    function startSlide(now: number, delay: number): void {
      if (reduced()) return;
      const ka = kaTarget();
      const kb = kbTarget();
      KA.jump(1);
      KB.jump(1);
      const dur = 2400 + Math.min(1600, Math.abs(ka - 1) * 500);
      KA.glide(ka, dur, delay, now);
      KB.glide(kb, dur, delay, now);
      slideAnim = { t0: now, dur: dur + delay + 200 };
      trace = { from: 1 };
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): DragId | null {
      if (ctx.locked) return null;
      let best: DragId | null = null;
      let bd = Infinity;
      for (const h of hits) {
        const d = Math.hypot(px - h.x, py - h.y);
        if (d < h.r && d < bd) {
          bd = d;
          best = h.id;
        }
      }
      return best;
    }

    const along = (w: Pt, u: Pt) => w[0] * u[0] + w[1] * u[1];
    const r1d = (v: number) => Math.round(v * 10) / 10;
    const r05 = (v: number) => Math.round(v * 20) / 20;

    function fixC(): void {
      if (mode() !== 'calc') return;
      const [lo, hi] = sideRange(p.a, p.b);
      if (p.c < lo || p.c > hi) ctx.set({ c: clamp(Math.round(clamp(p.c, lo, hi) * 10) / 10, Math.ceil(lo * 10) / 10, Math.floor(hi * 10) / 10) });
    }

    function dragTo(id: DragId, px: number, py: number): void {
      lastDrag = performance.now();
      const s = sideSign();
      if (id === 'a' || id === 'b' || id === 'a2' || id === 'b2' || id === 'ray') {
        const w = toWorld(viewOf('fig'), px, py);
        const thv = thTarget();
        const u1: Pt = [Math.cos(rad(thv)), Math.sin(rad(thv))];
        const u2: Pt = [1, 0];
        if (id === 'a') {
          ctx.set({ a: r1d(clamp(along(w, u1), 1, 8)) });
          fixC();
        } else if (id === 'b') {
          ctx.set({ b: r1d(clamp(along(w, u2), 1, 8)) });
          fixC();
        } else if (id === 'a2') ctx.set({ k: r05(clamp((s * along(w, u1)) / p.a, 0.2, 3)) });
        else if (id === 'b2') {
          const v = r05(clamp((s * along(w, u2)) / p.b, 0.2, 3));
          if (mode() === 'calc' || p.par) ctx.set({ k: v });
          else ctx.set({ kb: v });
        } else {
          const a = deg(Math.atan2(w[1], w[0]));
          ctx.set({ th: Math.round(clamp(a, 10, 150)) });
        }
        return;
      }
      if (id === 'sun' || id === 'stick' || id === 'tree') {
        const w = toWorld(viewOf('baum'), px, py);
        if (id === 'sun') ctx.set({ el: Math.round(clamp(deg(Math.atan2(w[1], Math.max(0.01, w[0]))), 20, 60) * 10) / 10 });
        else if (id === 'stick') ctx.set({ st: r1d(clamp(w[1], 1, 2.5)) });
        else ctx.set({ ht: Math.round(clamp(w[1], 5, 20) * 2) / 2 });
        return;
      }
      const w = toWorld(viewOf('teich'), px, py);
      if (id === 'p2') {
        const T = pondGeometry(p.w, p.kt);
        const dA = Math.hypot(T.Z[0] - T.A[0], T.Z[1] - T.A[1]);
        const e = Math.hypot(w[0] - T.Z[0], w[1] - T.Z[1]);
        ctx.set({ kt: Math.round(clamp(dA / Math.max(0.1, e), 2, 6)) });
      } else ctx.set({ w: Math.round(clamp(w[0], 8, 40) * 2) / 2 });
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const id = hitAt(pt.px, pt.py);
        if (!id) return false;
        drag = id;
        story = null;
        steps = null;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (!drag || ctx.locked) return;
        dragTo(drag, pt.px, pt.py);
        ctx.requestRender();
      },
      pointerUp: () => {
        drag = null;
        lastDrag = performance.now();
        surface.setCursor(hover ? 'grab' : '');
        retargetViews(performance.now(), false);
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const id = pt ? hitAt(pt.px, pt.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? (drag ? 'grabbing' : 'grab') : '');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        const now = performance.now();
        const m = mode();
        // Beim eigenen Wechsel des Themas die Figur möglichst beibehalten
        if (source === 'input' && changed.has('mode')) {
          if (m === 'calc' && (prevMode === 'v' || prevMode === 'x')) {
            const [lo, hi] = sideRange(p.a, p.b);
            ctx.set({ c: clamp(Math.round(sideAB(p.a, p.b, p.th) * 10) / 10, Math.ceil(lo * 10) / 10, Math.floor(hi * 10) / 10), xf: prevMode === 'x' });
          } else if ((m === 'v' || m === 'x') && prevMode === 'calc') {
            ctx.set({ th: Math.round(clamp(angleFromSides(p.a, p.b, cClamped()), 10, 150)) });
          }
        }
        if (source === 'input' && changed.has('par') && !p.par && Math.abs(p.kb - p.k) < 0.2) ctx.set({ kb: clamp(r05(p.k > 1.2 ? p.k - 0.6 : p.k + 0.6), 0.2, 3) });
        if (source === 'input' && (changed.has('a') || changed.has('b') || changed.has('c'))) fixC();
        if (source === 'input' || source === 'replace') {
          if ([...changed].some((key) => key !== 'show' && key !== 'tri')) {
            trace = null;
            slideAnim = null;
            steps = null;
            story = null;
          }
        }
        retarget(now, source, changed);
        if (changed.has('mode') && source !== 'init' && m !== prevMode) {
          if (sceneOf(prevMode) !== scene() && !reduced()) sceneFade = { from: sceneOf(prevMode), t0: now };
          if (!reduced()) cardFade = now;
          if (m === 'baum' || m === 'teich') startStory(now);
        } else if (source === 'replace' && (m === 'baum' || m === 'teich')) startStory(now);
        if (!dragging()) retargetViews(now, source === 'init');
        if (source === 'init') {
          if (!reduced()) {
            intro = now;
            if (m === 'v' || m === 'x') startSlide(now, 900);
            if (m === 'baum' || m === 'teich') startStory(now);
          }
          lastSize = { w: surface.width, h: surface.height };
        }
        prevMode = m;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'slide') {
          story = null;
          startSlide(now, 250);
        } else if (id === 'conv') {
          ctx.set({ kb: p.k });
          if (!reduced()) KB.glide(kbTarget(), 1500, 0, now);
        } else if (id === 'solve') {
          if (!p.show) ctx.set({ show: true });
          if (!reduced()) steps = { t0: now };
        } else if (id === 'measure') {
          startStory(now);
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
