import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, scaledSprite, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  angleFromSides,
  COPY_FACTORS,
  DEG,
  exactValue,
  EYE_HEIGHT,
  ladder,
  LADDER_MAX,
  LADDER_MIN,
  percentFromAngle,
  ramp,
  ratioParts,
  roleOf,
  roles,
  sideOf,
  SPECIAL_ANGLES,
  tower,
  trig,
  type Exact,
  type Fn,
  type Ref,
  type Role,
} from './model';

const L = (de: string, en: string) => ({ de, en });
/** Höhe einer Ziegelreihe (mit Fuge) im Foto ziegelwand.webp, in Pixeln. */
const BRICK_ROW = 72.4;
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Px = [number, number];
type Pt = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpP = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const TAU = Math.PI * 2;
const rad = (d: number) => d * DEG;

type Mode = 'tri' | 'unit' | 'inv' | 'app';
type App = 'ramp' | 'ladder' | 'tower';
type Scene = 'tri' | 'unit' | 'inv' | App;
const sceneOf = (m: Mode, a: App): Scene => (m === 'app' ? a : m);
type Vals = Record<string, unknown>;
const isMode =
  (...m: Mode[]) =>
  (v: Vals) =>
    m.includes(v.mode as Mode);
const isApp =
  (...a: App[]) =>
  (v: Vals) =>
    v.mode === 'app' && a.includes(v.app as App);

/** Ziehbare oder antippbare Stellen. */
type HitId = 'B' | 'P' | 'T' | 'rTop' | 'rFoot' | 'lTop' | 'lFoot' | 'obs' | 'top' | 'angA' | 'angB';
const TAPS: HitId[] = ['angA', 'angB'];

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

/** Namen der Seiten je Rolle. */
const ROLE_NAME: Record<Role, Txt> = {
  opp: L('Gegenkathete', 'opposite'),
  adj: L('Ankathete', 'adjacent'),
  hyp: L('Hypotenuse', 'hypotenuse'),
};
const ROLE_KEY: Record<Role, string> = { opp: 'o', adj: 'a', hyp: 'h' };
const FN_KEY: Record<Fn, string> = { sin: 'o', cos: 'a', tan: 't' };

/** Dauer der Animation „Ähnliche Dreiecke“ (ms) und ihre Abschnitte. */
const GROW_IN = 500;
const GROW_SEG = 900;
const GROW_HOLD = 450;
const GROW_END = GROW_IN + COPY_FACTORS.length * (GROW_SEG + GROW_HOLD) + 300;
/** Ablauf „Winkel durchlaufen“: Haltepunkte (Winkel) mit Fahrzeit und Pause in ms. */
const SWEEP: { to: number; dur: number; hold: number }[] = [
  { to: 0, dur: 700, hold: 350 },
  { to: 30, dur: 1300, hold: 650 },
  { to: 45, dur: 800, hold: 650 },
  { to: 60, dur: 800, hold: 650 },
  { to: 90, dur: 1400, hold: 500 },
];

/**
 * Sinus, Kosinus und Tangens im rechtwinkligen Dreieck. Hauptansicht: Dreieck auf
 * Karopapier mit ziehbarer Ecke B; Gegenkathete, Ankathete und Hypotenuse sind farbig
 * benannt und wandern beim Wechsel des Bezugswinkels (Winkelbogen antippen) weich mit.
 * Hauptanimation „Ähnliche Dreiecke“: Kopien wachsen aus der Ecke des Bezugswinkels,
 * die Seitenlängen zählen mit, das Verhältnis bleibt. Weitere Themen: Einheitskreis
 * (sin, cos, tan als Strecken, Zusammenhänge, exakte Werte, „Winkel durchlaufen“),
 * Winkel aus zwei Seiten Schritt für Schritt (mit Sonderfall „kein Dreieck“) und drei
 * gezeichnete Anwendungen: Rampe mit Steigung in Prozent, Leiter an der Wand, Turmhöhe.
 */
export default defineSimulation({
  id: 'sin-cos-tan-dreieck',
  dragHint: true,
  layout: { aspect: 1.4, aspectNarrow: 0.37 },
  images: { wheelchair: 'rollstuhl.webp', bricks: 'ziegelwand.webp' },
  groups: [
    { id: 'fig', label: L('Dreieck', 'Triangle') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'tri', label: L('Seitenverhältnisse', 'Ratios of sides') },
        { value: 'unit', label: L('Einheitskreis', 'Unit circle') },
        { value: 'inv', label: L('Winkel berechnen', 'Finding the angle') },
        { value: 'app', label: L('Anwendungen', 'Applications') },
      ],
      default: 'tri',
    },
    {
      key: 'app',
      type: 'choice',
      label: L('Anwendung', 'Application'),
      options: [
        { value: 'ramp', label: L('Rampe: Steigung in %', 'Ramp: gradient in %') },
        { value: 'ladder', label: L('Leiter an der Wand', 'Ladder against a wall') },
        { value: 'tower', label: L('Höhe eines Turms', 'Height of a tower') },
      ],
      default: 'ramp',
      visibleIf: isMode('app'),
    },
    {
      key: 'f',
      type: 'choice',
      label: L('Verhältnis', 'Ratio'),
      options: [
        { value: 'sin', label: L('Sinus', 'Sine') },
        { value: 'cos', label: L('Kosinus', 'Cosine') },
        { value: 'tan', label: L('Tangens', 'Tangent') },
      ],
      default: 'sin',
      visibleIf: isMode('tri', 'inv'),
    },
    {
      key: 'ref',
      type: 'choice',
      label: L('Bezugswinkel', 'Reference angle'),
      help: L('Auch den Winkelbogen im Bild antippen.', 'You can also tap the angle arc in the picture.'),
      options: [
        { value: 'a', label: L('α (bei A)', 'α (at A)') },
        { value: 'b', label: L('β (bei B)', 'β (at B)') },
      ],
      default: 'a',
      visibleIf: isMode('tri', 'inv'),
    },
    {
      key: 'al',
      type: 'number',
      group: 'fig',
      label: L('Winkel α', 'Angle α'),
      help: L('Auch im Bild ziehen.', 'You can also drag in the picture.'),
      min: 5,
      max: 85,
      step: 1,
      default: 35,
      unit: '°',
      visibleIf: (v) => isMode('tri', 'unit')(v) || isApp('ladder', 'tower')(v),
    },
    { key: 'c', type: 'number', group: 'fig', label: L('Hypotenuse c', 'Hypotenuse c'), min: 2, max: 10, step: 0.5, default: 6, unit: 'cm', visibleIf: isMode('tri') },
    { key: 'go', type: 'number', group: 'fig', label: L('Gegenkathete', 'Opposite side'), min: 0.5, max: 12, step: 0.1, default: 3, unit: 'cm', visibleIf: (v) => v.mode === 'inv' && v.f !== 'cos' },
    { key: 'an', type: 'number', group: 'fig', label: L('Ankathete', 'Adjacent side'), min: 0.5, max: 12, step: 0.1, default: 4, unit: 'cm', visibleIf: (v) => v.mode === 'inv' && v.f !== 'sin' },
    { key: 'hy', type: 'number', group: 'fig', label: L('Hypotenuse', 'Hypotenuse'), min: 0.5, max: 12, step: 0.1, default: 5, unit: 'cm', visibleIf: (v) => v.mode === 'inv' && v.f !== 'tan' },
    { key: 'pc', type: 'number', group: 'fig', label: L('Steigung p', 'Gradient p'), help: L('Höhenunterschied : waagrechte Länge · 100 %', 'rise : horizontal run · 100 %'), min: 2, max: 30, step: 0.5, default: 6, unit: '%', visibleIf: isApp('ramp') },
    { key: 'rh', type: 'number', group: 'fig', label: L('Höhenunterschied h', 'Rise h'), min: 0.1, max: 1.5, step: 0.05, default: 0.5, unit: 'm', visibleIf: isApp('ramp') },
    { key: 'll', type: 'number', group: 'fig', label: L('Leiterlänge', 'Ladder length'), min: 2, max: 8, step: 0.1, default: 4, unit: 'm', visibleIf: isApp('ladder') },
    { key: 'd', type: 'number', group: 'fig', label: L('Entfernung d', 'Distance d'), min: 10, max: 200, step: 1, default: 50, unit: 'm', visibleIf: isApp('tower') },
    { key: 'sim', type: 'boolean', group: 'view', label: L('Ähnliche Dreiecke einzeichnen', 'Draw similar triangles'), default: false, visibleIf: isMode('tri') },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Ergebnisse zeigen', 'Show results'),
      help: L('Für Aufgaben ausschalten: Gesuchtes erscheint als „?“.', 'Switch off for tasks: unknowns appear as “?”.'),
      default: true,
    },
  ],
  actions: [
    { id: 'grow', label: L('Ähnliche Dreiecke wachsen lassen', 'Grow similar triangles'), primary: true, visibleIf: isMode('tri') },
    { id: 'sweep', label: L('Winkel durchlaufen', 'Sweep the angle'), primary: true, visibleIf: isMode('unit') },
    { id: 'solve', label: L('Schritt für Schritt lösen', 'Solve step by step'), primary: true, visibleIf: isMode('inv') },
    { id: 'calc', label: L('Rechnung durchspielen', 'Play the calculation'), primary: true, visibleIf: isMode('app') },
    { id: 'swap', label: L('Bezugswinkel wechseln', 'Switch reference angle'), visibleIf: isMode('tri', 'inv') },
  ],
  readouts: [
    { key: 'sides', label: L('Seiten', 'Sides'), spoiler: true },
    { key: 'vals', label: L('Werte', 'Values'), spoiler: true },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'std', label: L('α = 35°: Seitenverhältnis', 'α = 35°: ratio of sides'), values: {} },
    { id: 'beta', label: L('Bezugswinkel β: Rollen tauschen', 'Reference angle β: roles swap'), values: { ref: 'b', al: 35, c: 8 } },
    { id: 'unit', label: L('Einheitskreis: c = 1', 'Unit circle: c = 1'), values: { mode: 'unit', al: 30 } },
    { id: 'inv', label: L('3-4-5-Dreieck: Winkel gesucht', '3-4-5 triangle: find the angle'), values: { mode: 'inv', f: 'sin', go: 3, hy: 5 } },
    { id: 'ramp', label: L('Rollstuhlrampe mit 6 %', 'Wheelchair ramp at 6 %'), values: { mode: 'app', app: 'ramp', pc: 6, rh: 0.5 } },
    { id: 'ladder', label: L('Leiter: sicher anlehnen', 'Ladder: safe angle'), values: { mode: 'app', app: 'ladder', ll: 4, al: 70 } },
  ],
  strings: {
    de: {
      canvas:
        'Rechtwinkliges Dreieck ABC mit rechtem Winkel bei C auf Karopapier; die Ecke B lässt sich ziehen. Gegenkathete, Ankathete und Hypotenuse zum gewählten Winkel sind farbig benannt. Daneben bzw. darunter Karten mit dem Seitenverhältnis, einer Tabelle ähnlicher Dreiecke und, wenn Platz ist, den beschrifteten Graphen von sin, cos und tan. Weitere Themen: Einheitskreis mit sin, cos und tan als Strecken und einer Tabelle der besonderen Werte, Winkel aus zwei Seiten Schritt für Schritt berechnen (mit dem Sonderfall „kein Dreieck“) und drei gezeichnete Anwendungen (Rampe mit Steigung in Prozent, Leiter an der Wand, Turmhöhe mit Höhenwinkel).',
    },
    en: {
      canvas:
        'Right triangle ABC with the right angle at C on squared paper; vertex B can be dragged. The opposite side, adjacent side and hypotenuse for the chosen angle are coloured and named. Beside or below it, cards with the ratio of sides, a table of similar triangles and, if there is room, the labelled graphs of sin, cos and tan. Further topics: unit circle with sin, cos and tan as lengths and a table of special values, finding an angle from two sides step by step (with the special case “no triangle”) and three drawn applications (ramp with a gradient in percent, ladder against a wall, tower height from the angle of elevation).',
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
    const app = () => p.app as App;
    const scene = () => sceneOf(mode(), app());
    const fn = () => p.f as Fn;
    const ref = () => p.ref as Ref;

    /* ---------- Farben (gleiche Größe = gleiche Farbe in Bild, Karten, Ergebnissen) ---------- */
    const col = {
      opp: () => th().series[1]!,
      adj: () => th().series[0]!,
      hyp: () => th().series[4]!,
      ang: () => th().series[3]!,
      sim: () => th().series[2]!,
      tan: () => th().series[5]!,
      ok: () => th().series[2]!,
      warn: () => th().series[3]!,
    };
    const roleCol = (r: Role) => (r === 'opp' ? col.opp() : r === 'adj' ? col.adj() : col.hyp());
    const fnCol = (f: Fn) => (f === 'sin' ? col.opp() : f === 'cos' ? col.adj() : col.tan());

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    /** Exakte Werte ohne Nullen am Ende (0,5), gerundete mit allen Stellen (tan 35° ≈ 0,700 statt 0,7). */
    const N = (v: number, d = 2) => (isExact(v, d) ? fmt.num(clean(v, d), d) : fmt.fixed(clean(v, d), d));
    const eq = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    const M = '\\t{m}';
    const angName = (r: Ref) => (r === 'a' ? 'α' : 'β');

    /* ---------- Zielwerte und angezeigter Zustand ---------- */
    const AL = new Chan(p.al);
    const C = new Chan(p.c);
    const WREF = new Chan(ref() === 'b' ? 1 : 0);
    const WSIM = new Chan(p.sim ? 1 : 0);
    const WSHOW = new Chan(p.show ? 1 : 0);
    const ON: Record<Role, Chan> = { opp: new Chan(0), adj: new Chan(0), hyp: new Chan(0) };
    const GO = new Chan(p.go);
    const AN = new Chan(p.an);
    const HY = new Chan(p.hy);
    const PC = new Chan(p.pc);
    const RH = new Chan(p.rh);
    const LL = new Chan(p.ll);
    const D = new Chan(p.d);
    const views: Record<Scene, { cx: Chan; cy: Chan; s: Chan }> = {
      tri: { cx: new Chan(0), cy: new Chan(0), s: new Chan(40) },
      unit: { cx: new Chan(0), cy: new Chan(0), s: new Chan(200) },
      inv: { cx: new Chan(0), cy: new Chan(0), s: new Chan(40) },
      ramp: { cx: new Chan(0), cy: new Chan(0), s: new Chan(40) },
      ladder: { cx: new Chan(0), cy: new Chan(0), s: new Chan(40) },
      tower: { cx: new Chan(0), cy: new Chan(0), s: new Chan(4) },
    };
    const onGoal = (r: Role) => {
      const { num, den } = ratioParts(fn());
      return r === num || r === den ? 1 : 0;
    };
    for (const r of ['opp', 'adj', 'hyp'] as Role[]) ON[r].jump(onGoal(r));
    const allChans = (): Chan[] => [AL, C, WREF, WSIM, WSHOW, ON.opp, ON.adj, ON.hyp, GO, AN, HY, PC, RH, LL, D, ...Object.values(views).flatMap((v) => [v.cx, v.cy, v.s])];

    let intro: number | null = null;
    let sceneFade: { from: Scene; t0: number } | null = null;
    let cardFade: number | null = null;
    let grow: { t0: number } | null = null;
    let sweep: { t0: number; back: number } | null = null;
    let steps: { t0: number } | null = null;
    let story: { t0: number } | null = null;
    let drag: HitId | null = null;
    let hover: HitId | null = null;
    let hits: { id: HitId; x: number; y: number; r: number }[] = [];
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;
    let prevMode: Mode = mode();
    let prevScene: Scene = scene();
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
      const mh = Math.round(clamp(h * 0.45, 300, w * 1.05));
      return { main: { x: 0, y: 0, w, h: mh }, col: { x: 0, y: mh + 10, w, h: h - mh - 10 }, wide: false };
    }

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({
      o: col.opp(),
      a: col.adj(),
      h: col.hyp(),
      k: col.ang(),
      s: col.sim(),
      t: col.tan(),
      m: th().muted,
      ok: col.ok(),
      w: col.warn(),
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
    /** Rollenname in Farbe, z. B. für Brüche. */
    const roleSrc = (r: Role) => `\\c{${ROLE_KEY[r]}}{\\t{${say(ROLE_NAME[r])}}}`;
    /** exakter Wert in Formel-Kurzschrift */
    function exactSrc(e: Exact | null | undefined): string {
      if (e === undefined) return '';
      if (e === null) return `\\c{m}{\\t{${say(L('n. def.', 'undef.'))}}}`;
      if (e.n === 0) return '0';
      if (e.r === 1) return e.d === 1 ? `${e.n}` : `\\f{${e.n}}{${e.d}}`;
      return e.d === 1 ? `\\r{${e.r}}` : `\\f{\\r{${e.r}}}{${e.d}}`;
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
    /** Pill neben einer Strecke: um die halbe Pillgröße in Richtung n verschoben. */
    function sidePill(mx: number, my: number, n: Px, gap: number, src: string, opts: { color?: string; border?: string; size?: number; alpha?: number; bounds?: Rect } = {}): void {
      const sz = opts.size ?? fs(12.5, 11.5);
      const ps = pillSize(src, sz);
      const off = Math.abs(n[0]) * ps.w / 2 + Math.abs(n[1]) * ps.h / 2 + gap;
      fpill(mx + n[0] * off, my + n[1] * off, src, { ...opts, size: sz });
    }

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
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.18)';
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

    /** Maßlinie neben der Strecke P→Q im Abstand off (Pixel) zur Seite n (Einheitsnormale). */
    function dimLine(P: Px, Q: Px, n: Px, off: number, color: string, label: string, alpha: number, R?: Rect, progress = 1): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const q: Px = [lerp(P[0], Q[0], progress), lerp(P[1], Q[1], progress)];
      const len = Math.hypot(q[0] - P[0], q[1] - P[1]);
      if (len < 2) return;
      const a: Px = [P[0] + n[0] * off, P[1] + n[1] * off];
      const b: Px = [q[0] + n[0] * off, q[1] + n[1] * off];
      g.save();
      g.globalAlpha *= alpha;
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
        const along = len > ps.w + 14 ? 0 : Math.abs(n[0]) * ps.w / 2 + Math.abs(n[1]) * ps.h / 2 + 4;
        fpill((a[0] + b[0]) / 2 + n[0] * along, (a[1] + b[1]) / 2 + n[1] * along, label, { color, size: sz, alpha: alpha * clamp01((progress - 0.3) / 0.5), bounds: R });
      }
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

    /** Weißes bzw. dunkles Blatt als Bühne. */
    function paper(R: Rect): void {
      const g = surface.g;
      const theme = th();
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
    }

    /** Karopapier: Gitter mit Abstand step (Pixel), ausgerichtet am Punkt o. */
    function grid(R: Rect, o: Px, step: number, alpha: number, major = 0): void {
      const g = surface.g;
      if (step < 4) return;
      g.save();
      g.globalAlpha *= alpha;
      g.lineWidth = 1;
      const lineAt = (horiz: boolean, i: number, v: number) => {
        g.strokeStyle = major && i % major === 0 ? th().grid : th().gridMinor;
        g.beginPath();
        if (horiz) {
          g.moveTo(R.x, v);
          g.lineTo(R.x + R.w, v);
        } else {
          g.moveTo(v, R.y);
          g.lineTo(v, R.y + R.h);
        }
        g.stroke();
      };
      for (let i = Math.ceil((R.x - o[0]) / step); o[0] + i * step <= R.x + R.w; i++) lineAt(false, i, Math.round(o[0] + i * step) + 0.5);
      for (let j = Math.ceil((R.y - o[1]) / step); o[1] + j * step <= R.y + R.h; j++) lineAt(true, j, Math.round(o[1] + j * step) + 0.5);
      g.restore();
    }

    /** Winkelbogen (Sektor) um q von Winkel a0 bis a1 (Pixel-Winkel, mathematisch positiv = gegen den Uhrzeiger auf dem Bildschirm). */
    function angleArc(q: Px, r: number, a0: number, a1: number, color: string, emph: number, alpha = 1): void {
      const g = surface.g;
      if (alpha <= 0.01 || r < 2) return;
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(color, lerp(0.1, th().dark ? 0.32 : 0.26, emph));
      g.beginPath();
      g.moveTo(q[0], q[1]);
      g.arc(q[0], q[1], r, -a0, -a1, true);
      g.closePath();
      g.fill();
      g.strokeStyle = emph > 0.5 ? color : withAlpha(color, 0.55);
      g.lineWidth = lerp(1.2, 2.2, emph);
      g.beginPath();
      g.arc(q[0], q[1], r, -a0, -a1, true);
      g.stroke();
      g.restore();
    }

    /** Zeichen für den rechten Winkel bei q mit den Schenkelrichtungen u und v (Pixel). */
    function rightMark(q: Px, u: Px, v: Px, size: number, alpha = 1): void {
      const g = surface.g;
      const nu = Math.hypot(u[0], u[1]) || 1;
      const nv = Math.hypot(v[0], v[1]) || 1;
      const a: Px = [q[0] + (u[0] / nu) * size, q[1] + (u[1] / nu) * size];
      const b: Px = [q[0] + (v[0] / nv) * size, q[1] + (v[1] / nv) * size];
      const c: Px = [a[0] + (v[0] / nv) * size, a[1] + (v[1] / nv) * size];
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(th().muted, 0.12);
      g.strokeStyle = th().text;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(q[0], q[1]);
      g.lineTo(a[0], a[1]);
      g.lineTo(c[0], c[1]);
      g.lineTo(b[0], b[1]);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(c[0], c[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
      g.fillStyle = th().text;
      g.beginPath();
      g.arc((q[0] + c[0]) / 2, (q[1] + c[1]) / 2, 1.7, 0, TAU);
      g.fill();
      g.restore();
    }

    /** Pill auf der Winkelhalbierenden (Richtung mid, Bildschirm-Winkel) knapp außerhalb des Bogens. */
    function bisectorPill(q: Px, mid: number, r: number, src: string, alpha: number, border: string): void {
      const sz = fs(13, 12);
      const ps = pillSize(src, sz);
      const dx = Math.cos(mid);
      const dy = -Math.sin(mid);
      const ext = Math.abs(dx) * ps.w / 2 + Math.abs(dy) * ps.h / 2;
      fpill(q[0] + dx * (r + 5 + ext), q[1] + dy * (r + 5 + ext), src, { size: sz, alpha, border });
    }

    /** Punktname mit Halo. */
    function label(q: Px, name: string, color: string, away: Px, alpha = 1, r = 6): void {
      const g = surface.g;
      if (alpha <= 0.01) return;
      const l = Math.hypot(away[0], away[1]) || 1;
      const sz = fs(16, 14);
      g.save();
      g.globalAlpha *= alpha;
      g.font = `italic 700 ${sz}px ${th().mathFont}`;
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

    /** Ziehgriff (Ring) mit Trefferfläche. */
    function handle(q: Px, id: HitId, color: string, alpha = 1, r = fs(7, 6.5)): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      if (editable()) {
        const on = hover === id || drag === id;
        g.save();
        g.globalAlpha *= alpha;
        g.fillStyle = withAlpha(color, on ? 0.28 : 0.13);
        g.beginPath();
        g.arc(q[0], q[1], on ? r + 10 : r + 6, 0, TAU);
        g.fill();
        g.restore();
        hits.push({ id, x: q[0], y: q[1], r: fs(20, 24) });
      }
      dot(q[0], q[1], color, r, alpha);
    }

    /* =====================================================================
     * Einstieg
     * ===================================================================== */
    interface Intro {
      panel: number;
      draw: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, draw: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3000) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        draw: ease.inOutCubic(clamp01((t - 150) / 1100)),
        labels: ease.outCubic(clamp01((t - 1100) / 650)),
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
      R: Rect;
    }
    const toPx = (v: View, q: Pt): Px => [v.R.x + v.R.w / 2 + (q[0] - v.cx) * v.s, v.R.y + v.R.h / 2 - (q[1] - v.cy) * v.s];
    const toWorld = (v: View, x: number, y: number): Pt => [v.cx + (x - v.R.x - v.R.w / 2) / v.s, v.cy - (y - v.R.y - v.R.h / 2) / v.s];
    function fitBox(R: Rect, box: [number, number, number, number], pad: { l: number; r: number; t: number; b: number }, sMax: number, bottom = false): { cx: number; cy: number; s: number } {
      const [x0, y0, x1, y1] = box;
      const aw = Math.max(40, R.w - pad.l - pad.r);
      const ah = Math.max(40, R.h - pad.t - pad.b);
      const s = Math.min(sMax, aw / Math.max(1e-6, x1 - x0), ah / Math.max(1e-6, y1 - y0));
      const ax = R.x + pad.l + aw / 2;
      // bottom: Unterkante der Box sitzt pad.b über dem unteren Rand (Boden unten, Himmel oben)
      const ay = bottom ? R.y + R.h - pad.b - ((y1 - y0) * s) / 2 : R.y + pad.t + ah / 2;
      return { cx: (x0 + x1) / 2 - (ax - (R.x + R.w / 2)) / s, cy: (y0 + y1) / 2 + (ay - (R.y + R.h / 2)) / s, s };
    }

    /** Seiten des Dreiecks im Modus „Winkel berechnen“ (Zielwerte oder angezeigte Werte). */
    function invTri(go: number, an: number, hy: number) {
      return angleFromSides(fn(), go, an, hy);
    }
    /** Katheten a, b (gegenüber A bzw. B) aus Gegen-/Ankathete je nach Bezugswinkel. */
    const legsOf = (opp: number, adj: number, r: Ref) => (r === 'a' ? { a: opp, b: adj } : { a: adj, b: opp });

    function goalOf(s: Scene): { cx: number; cy: number; s: number } {
      const R = regions().main;
      const small = sm();
      if (s === 'tri') {
        // Rahmen für eine Hypotenuse von mindestens 7 cm: kleinere Dreiecke sehen echt kleiner aus
        const cf = Math.max(p.c, 7);
        const pad = small ? { l: 30, r: 92, t: 62, b: 64 } : { l: 40, r: 128, t: 74, b: 76 };
        return fitBox(R, [0, 0, Math.max(cf * Math.cos(rad(p.al)), 1.5), Math.max(cf * Math.sin(rad(p.al)), 1.5)], pad, 90);
      }
      if (s === 'unit') {
        const pad = small ? { l: 26, r: 96, t: 56, b: 30 } : { l: 34, r: 130, t: 66, b: 36 };
        return fitBox(R, [-0.08, -0.1, 1.08, 1.78], pad, 520);
      }
      if (s === 'inv') {
        const r = invTri(p.go, p.an, p.hy);
        let box: [number, number, number, number];
        if (r.ok) {
          const lg = legsOf(r.opp, r.adj, ref());
          box = [0, 0, lg.b, lg.a];
        } else {
          const big = Math.max(p.hy, fn() === 'sin' ? p.go : p.an) * 1.08;
          box = [0, 0, big, big];
        }
        const pad = small ? { l: 30, r: 92, t: 66, b: 66 } : { l: 44, r: 130, t: 78, b: 80 };
        return fitBox(R, box, pad, 70);
      }
      if (s === 'ramp') {
        const rp = ramp(p.pc, p.rh);
        // oben Platz für den Einschub „Was heißt p %?“
        const pad = small ? { l: 22, r: 22, t: R.h * 0.32 + 84, b: 70 } : { l: 32, r: 32, t: R.h * 0.32 + 92, b: 82 };
        return fitBox(R, [-0.6, 0, rp.run + 3.2, p.rh + 2.9], pad, 120, true);
      }
      if (s === 'ladder') {
        const pad = small ? { l: 24, r: 72, t: 56, b: 70 } : { l: 34, r: 96, t: 66, b: 80 };
        return fitBox(R, [-p.ll - 0.4, 0, 1.0, p.ll + 0.4], pad, 120, true);
      }
      const tw = tower(p.d, p.al);
      const pad = small ? { l: 22, r: 70, t: 60, b: 70 } : { l: 30, r: 100, t: 70, b: 82 };
      return fitBox(R, [-4, 0, p.d + Math.max(5, tw.height * 0.14) + 2, tw.height + 2], pad, 60, true);
    }
    function retargetViews(now: number, instant: boolean): void {
      for (const s of Object.keys(views) as Scene[]) {
        const v = views[s];
        const gl = goalOf(s);
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
    const viewOf = (s: Scene): View => ({ cx: views[s].cx.v, cy: views[s].cy.v, s: views[s].s.v, R: regions().main });

    /* =====================================================================
     * Animation „Ähnliche Dreiecke“
     * ===================================================================== */
    /** Streckfaktor der wachsenden Kopie und Anzahl der schon gestempelten Kopien. */
    function growState(now: number): { k: number; stamped: number; t: number } | null {
      if (!grow) return null;
      const t = now - grow.t0;
      if (t < GROW_IN) return { k: 0, stamped: 0, t };
      let tt = t - GROW_IN;
      let prev = 0;
      for (let i = 0; i < COPY_FACTORS.length; i++) {
        const kf = COPY_FACTORS[i]!;
        if (tt < GROW_SEG) return { k: lerp(prev, kf, ease.inOutCubic(tt / GROW_SEG)), stamped: i, t };
        tt -= GROW_SEG;
        if (tt < GROW_HOLD) return { k: kf, stamped: i + 1, t };
        tt -= GROW_HOLD;
        prev = kf;
      }
      return { k: 1, stamped: COPY_FACTORS.length, t };
    }

    /* =====================================================================
     * Szene 1: Dreieck mit Seitenverhältnissen
     * ===================================================================== */
    function drawTri(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const V = viewOf('tri');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const al = AL.v;
      const c = C.v;
      const a = c * Math.sin(rad(al));
      const b = c * Math.cos(rad(al));
      const w = ease.inOutCubic(clamp01(WREF.v));
      const A0: Pt = [0, 0];
      const C0: Pt = [b, 0];
      const B0: Pt = [b, a];
      const centre = lerpP(A0, B0, w);
      const gs = growState(now);
      const introK = k.draw;
      const kScale = gs ? Math.max(gs.k, 0.0001) : Math.max(introK, 0.0001);
      const sc = (q: Pt, kk: number): Pt => [centre[0] + (q[0] - centre[0]) * kk, centre[1] + (q[1] - centre[1]) * kk];
      const A1 = sc(A0, kScale);
      const B1 = sc(B0, kScale);
      const C1 = sc(C0, kScale);
      const pa = P(A1);
      const pb = P(B1);
      const pc = P(C1);
      const lab = k.labels * (gs ? clamp01((gs.k - 0.3) / 0.25) : 1);
      const roleA = k.labels * (gs ? 0 : 1);
      const sideColA = mixColor(col.opp(), col.adj(), w);
      const sideColB = mixColor(col.adj(), col.opp(), w);
      const onA = lerp(ON.opp.v, ON.adj.v, w);
      const onB = lerp(ON.adj.v, ON.opp.v, w);
      const onC = ON.hyp.v;
      g.save();
      g.globalAlpha *= alpha;
      paper(R);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      const o = P([0, 0]);
      grid(R, o, V.s * 0.5, k.panel, 2);
      // Bahn von B bei fester Hypotenuse (Kreisbogen um A)
      if (!gs) {
        g.save();
        g.globalAlpha *= 0.55 * k.labels;
        g.strokeStyle = withAlpha(col.hyp(), 0.5);
        g.setLineDash([3, 5]);
        g.lineWidth = 1.3;
        g.beginPath();
        g.arc(o[0], o[1], c * V.s, -rad(88), -rad(2));
        g.stroke();
        g.restore();
      }
      // Umriss des Ziel-Dreiecks während des Wachsens
      if (gs) {
        g.save();
        g.strokeStyle = withAlpha(theme.muted, 0.6);
        g.setLineDash([5, 5]);
        g.lineWidth = 1.4;
        const q0 = P(A0);
        const q1 = P(C0);
        const q2 = P(B0);
        g.beginPath();
        g.moveTo(q0[0], q0[1]);
        g.lineTo(q1[0], q1[1]);
        g.lineTo(q2[0], q2[1]);
        g.closePath();
        g.stroke();
        g.restore();
      }
      // ähnliche Dreiecke: statisch (sim) oder gestempelt (Animation)
      const copies: { kk: number; a: number }[] = [];
      if (gs) {
        for (let i = 0; i < gs.stamped; i++) if (COPY_FACTORS[i]! < 1) copies.push({ kk: COPY_FACTORS[i]!, a: 1 });
      } else if (WSIM.v > 0.01) for (const kk of COPY_FACTORS) if (kk < 1) copies.push({ kk, a: WSIM.v * k.labels });
      for (const cp of copies) {
        const q0 = P(sc(A0, cp.kk));
        const q1 = P(sc(C0, cp.kk));
        const q2 = P(sc(B0, cp.kk));
        g.save();
        g.globalAlpha *= cp.a;
        g.fillStyle = withAlpha(col.sim(), theme.dark ? 0.08 : 0.05);
        g.strokeStyle = withAlpha(col.sim(), 0.85);
        g.lineWidth = 1.8;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(q0[0], q0[1]);
        g.lineTo(q1[0], q1[1]);
        g.lineTo(q2[0], q2[1]);
        g.closePath();
        g.fill();
        g.stroke();
        g.restore();
        dot(q1[0], q1[1], col.sim(), 3.2, cp.a);
        // kleiner Faktor an der freien Ecke
        const free = w < 0.5 ? q2 : q0;
        const away: Px = w < 0.5 ? [1, -0.3] : [-0.3, 1];
        fpill(free[0] + away[0] * 22, free[1] + away[1] * 16, `\\c{s}{${N(cp.kk, 2)}}`, { size: fs(11, 11), alpha: cp.a * 0.9, color: col.sim() });
      }
      // Fläche
      g.save();
      g.globalAlpha *= k.panel;
      const fillG = g.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
      fillG.addColorStop(0, withAlpha(col.ang(), theme.dark ? 0.1 : 0.07));
      fillG.addColorStop(1, withAlpha(col.hyp(), theme.dark ? 0.1 : 0.06));
      g.fillStyle = fillG;
      g.beginPath();
      g.moveTo(pa[0], pa[1]);
      g.lineTo(pc[0], pc[1]);
      g.lineTo(pb[0], pb[1]);
      g.closePath();
      g.fill();
      g.restore();
      // Seiten (dick = im Verhältnis)
      const wid = (on: number) => lerp(fs(2.6, 2.4), fs(5.5, 4.8), on);
      const alp = (on: number) => lerp(0.55, 1, on);
      line(pc, pb, sideColA, wid(onA), { glow: true, alpha: alp(onA) });
      line(pa, pc, sideColB, wid(onB), { glow: true, alpha: alp(onB) });
      line(pa, pb, col.hyp(), wid(onC), { glow: true, alpha: alp(onC) });
      // rechter Winkel
      rightMark(pc, [pa[0] - pc[0], pa[1] - pc[1]], [pb[0] - pc[0], pb[1] - pc[1]], clamp(Math.min(a, b) * V.s * kScale * 0.3, 6, fs(15, 13)), k.panel);
      // Winkel α bei A und β bei B (antippbar)
      const sideMinPx = Math.min(a, b, c) * V.s * kScale;
      const rA = clamp(Math.min(b, c) * V.s * kScale * 0.3, 14, fs(48, 38));
      const rB = clamp(Math.min(a, c) * V.s * kScale * 0.3, 14, fs(44, 34));
      const arcA = gs ? 1 : lab;
      angleArc(pa, rA, 0, rad(al), col.ang(), 1 - w, arcA);
      angleArc(pb, rB, Math.PI + rad(al), 1.5 * Math.PI, col.ang(), w, arcA);
      if (editable() && lab > 0.5 && sideMinPx > 10) {
        const mA = rad(al) / 2;
        hits.push({ id: 'angA', x: pa[0] + Math.cos(mA) * rA * 0.6, y: pa[1] - Math.sin(mA) * rA * 0.6, r: Math.max(16, rA * 0.7) });
        const mB = Math.PI + rad(al) + (Math.PI / 2 - rad(al)) / 2;
        hits.push({ id: 'angB', x: pb[0] + Math.cos(mB) * rB * 0.6, y: pb[1] - Math.sin(mB) * rB * 0.6, r: Math.max(16, rB * 0.7) });
        for (const id of ['angA', 'angB'] as HitId[]) {
          if (hover !== id) continue;
          const q = id === 'angA' ? pa : pb;
          const rr = id === 'angA' ? rA : rB;
          g.save();
          g.strokeStyle = withAlpha(col.ang(), 0.6);
          g.lineWidth = 2;
          g.setLineDash([3, 3]);
          g.beginPath();
          g.arc(q[0], q[1], rr + 5, 0, TAU);
          g.stroke();
          g.restore();
        }
      }
      // Winkelbeschriftungen
      const alR = rad(al);
      const angTxt = (r: Ref, emph: number) => {
        const v = r === 'a' ? al : 90 - al;
        return emph > 0.5 ? `\\c{k}{${angName(r)} = ${N(Math.round(v), 0)}°}` : `\\c{m}{${angName(r)} = ${N(Math.round(v), 0)}°}`;
      };
      {
        const flat = al < 16;
        const src = angTxt('a', 1 - w);
        const ps = pillSize(src, fs(13, 12));
        const bord = withAlpha(col.ang(), lerp(0.15, 0.6, 1 - w));
        if (flat) fpill(pa[0] + rA + 8 + ps.w / 2, pa[1] + 16, src, { size: fs(13, 12), alpha: lab, border: bord });
        else bisectorPill(pa, alR / 2, rA, src, lab, bord);
      }
      {
        const mid = Math.PI + alR + (Math.PI / 2 - alR) / 2;
        const flat = al > 74;
        const src = angTxt('b', w);
        const ps = pillSize(src, fs(13, 12));
        const bord = withAlpha(col.ang(), lerp(0.15, 0.6, w));
        if (flat) fpill(pb[0] - 14 - ps.w / 2, pb[1] - 4, src, { size: fs(13, 12), alpha: lab, border: bord });
        else bisectorPill(pb, mid, rB, src, lab, bord);
      }
      // Seitenlängen
      const showLegs = WSHOW.v;
      const kk = kScale;
      const lenSrc = (letter: string, v: number, key: string, known: boolean) => (known ? `\\c{${key}}{${letter} ${eq(v)} ${N(v)} cm}` : `\\c{${key}}{${letter} = ?}`);
      const keyA = w < 0.5 ? 'o' : 'a';
      const keyB = w < 0.5 ? 'a' : 'o';
      const legKnown = showLegs > 0.5;
      // a: rechts neben BC
      const midA: Px = [(pc[0] + pb[0]) / 2, (pc[1] + pb[1]) / 2];
      const midB: Px = [(pa[0] + pc[0]) / 2, (pa[1] + pc[1]) / 2];
      const midC: Px = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      const szL = fs(12.5, 11.5);
      const aLen = lenSrc('a', a * kk, keyA, legKnown);
      const bLen = lenSrc('b', b * kk, keyB, legKnown);
      const cLen = `\\c{h}{c ${eq(c * kk)} ${N(c * kk)} cm}`;
      const psA = pillSize(aLen, szL);
      fpill(midA[0] + 10 + psA.w / 2, midA[1] - 13, aLen, { size: szL, alpha: lab, bounds: R });
      // sehr kurze Kathete b (α nahe 90°): Längenangabe tiefer, damit die Eckennamen A und C sie nicht verdecken
      const narrowB = pc[0] - pa[0] < pillSize(bLen, szL).w + 30;
      const dyB = narrowB ? 34 : 18;
      fpill(midB[0], midB[1] + dyB, bLen, { size: szL, alpha: lab, bounds: R });
      // c: außen an der Hypotenuse
      const hl = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1;
      let nC: Px = [(pb[1] - pa[1]) / hl, -(pb[0] - pa[0]) / hl];
      if (nC[0] * (pc[0] - midC[0]) + nC[1] * (pc[1] - midC[1]) > 0) nC = [-nC[0], -nC[1]];
      sidePill(midC[0], midC[1], nC, 8, cLen, { alpha: lab, bounds: R });
      // Rollen: wandern beim Wechsel des Bezugswinkels um die Ecke C
      const roleSz = fs(12.5, 11.5);
      const anchorA: Px = [midA[0] + 10, midA[1] + 13];
      const anchorB: Px = [midB[0], midB[1] + dyB + 26];
      const ctrl = (out: number): Px => [pc[0] + out, pc[1] + out * 0.9];
      const bez = (p0: Px, c1: Px, p1: Px, t: number): Px => [
        (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c1[0] + t * t * p1[0],
        (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c1[1] + t * t * p1[1],
      ];
      const oppSrc = `\\c{o}{\\t{${say(ROLE_NAME.opp)}}}`;
      const adjSrc = `\\c{a}{\\t{${say(ROLE_NAME.adj)}}}`;
      const psO = pillSize(oppSrc, roleSz);
      const psJ = pillSize(adjSrc, roleSz);
      // Ankerpunkte für linke Kante (a-Seite) bzw. Mitte (b-Seite) in Mittelpunkte umrechnen
      const centreAt = (anchor: Px, wHalf: number, leftEdge: boolean): Px => (leftEdge ? [anchor[0] + wHalf, anchor[1]] : anchor);
      const oppPos = bez(centreAt(anchorA, psO.w / 2, true), ctrl(fs(70, 50)), centreAt(anchorB, psO.w / 2, false), w);
      const adjPos = bez(centreAt(anchorB, psJ.w / 2, false), ctrl(fs(30, 22)), centreAt(anchorA, psJ.w / 2, true), w);
      fpill(adjPos[0], adjPos[1], adjSrc, { size: roleSz, alpha: roleA * lerp(0.75, 1, ON.adj.v), border: withAlpha(col.adj(), 0.55), bounds: R });
      fpill(oppPos[0], oppPos[1], oppSrc, { size: roleSz, alpha: roleA * lerp(0.75, 1, ON.opp.v), border: withAlpha(col.opp(), 0.55), bounds: R });
      {
        // Rollenname direkt über der Längenangabe der Hypotenuse
        const psC = pillSize(cLen, szL);
        const offC = Math.abs(nC[0]) * psC.w / 2 + Math.abs(nC[1]) * psC.h / 2 + 8;
        const roleH = `\\c{h}{\\t{${say(ROLE_NAME.hyp)}}}`;
        fpill(midC[0] + nC[0] * offC, midC[1] + nC[1] * offC - psC.h - 3, roleH, { size: roleSz, alpha: roleA * lerp(0.75, 1, ON.hyp.v), border: withAlpha(col.hyp(), 0.55), bounds: R });
      }
      // Ecken
      label(pa, 'A', theme.text, [-1, 0.5], k.panel);
      label(pc, 'C', theme.text, [1, 1], k.panel, 4);
      label(pb, 'B', theme.text, [-0.8, -1], k.panel);
      // Griff B
      if (!gs) handle(pb, 'B', theme.text, k.labels);
      g.restore();
      drawTriHeader(R, k, gs);
      g.restore();
    }

    /** Kopfzeile: aktuelles Verhältnis mit Rollen; während des Wachsens der Faktor k. */
    function drawTriHeader(R: Rect, k: Intro, gs: { k: number; stamped: number } | null): void {
      const f = fn();
      const r = ref();
      const { num, den } = ratioParts(f);
      const val = trig(f, r === 'a' ? p.al : 90 - p.al);
      const show = p.show;
      const src = `${f} \\c{k}{${angName(r)}} = \\f{${roleSrc(num)}}{${roleSrc(den)}}${show ? ` ${eq(val, 3)} \\b{${N(val, 3)}}` : ''}`;
      const left = fpill(R.x + 12, R.y + 30, src, { align: 'left', size: fs(14, 12.5), alpha: k.panel, border: withAlpha(fnCol(f), 0.6), maxW: R.w - 40 });
      if (gs) {
        const ksrc = `\\c{s}{\\t{${say(L('Streckfaktor', 'scale factor'))}} k = ${N(gs.k, 2)}}`;
        const ps = pillSize(ksrc, fs(12.5, 11.5));
        const room = R.x + R.w - 12 - ps.w > left.x + left.w + 8;
        fpill(room ? R.x + R.w - 12 : R.x + 12, room ? R.y + 30 : left.y + left.h + 18, ksrc, { align: room ? 'right' : 'left', size: fs(12.5, 11.5), border: withAlpha(col.sim(), 0.6) });
      }
    }

    /* =====================================================================
     * Szene 2: Einheitskreis
     * ===================================================================== */
    /** Angezeigter Winkel (beim „Winkel durchlaufen“ der Fahrweg). */
    function sweepAngle(now: number): number | null {
      if (!sweep) return null;
      let t = now - sweep.t0;
      let from = AL.v;
      for (const s of SWEEP) {
        if (t < s.dur) return lerp(from, s.to, ease.inOutCubic(t / s.dur));
        t -= s.dur;
        if (t < s.hold) return s.to;
        t -= s.hold;
        from = s.to;
      }
      if (t < 1000) return lerp(90, sweep.back, ease.inOutCubic(t / 1000));
      return null;
    }
    const sweepEnd = () => SWEEP.reduce((s, x) => s + x.dur + x.hold, 0) + 1000;
    const shownAngle = (now: number) => sweepAngle(now) ?? AL.v;

    function drawUnit(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const V = viewOf('unit');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const al = clamp(shownAngle(now), 0, 90);
      const s = Math.sin(rad(al));
      const c = Math.cos(rad(al));
      const tanV = al >= 89.999 ? Infinity : Math.tan(rad(al));
      const o = P([0, 0]);
      const e = P([1, 0]);
      const pP = P([c, s]);
      const pF = P([c, 0]);
      const yTop = V.cy + (R.h / 2 - 12) / V.s;
      const tanShown = Math.min(tanV, yTop);
      const pT = P([1, tanShown]);
      const lab = k.labels;
      const dr = k.draw;
      g.save();
      g.globalAlpha *= alpha;
      paper(R);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      grid(R, o, V.s * 0.1, k.panel, 5);
      // Achsen
      line([R.x + 6, o[1]], [R.x + R.w - 6, o[1]], withAlpha(theme.text, 0.55), 1.4);
      line([o[0], R.y + R.h - 6], [o[0], R.y + 6], withAlpha(theme.text, 0.55), 1.4);
      // Kreis (Viertel kräftig, Rest zart)
      g.save();
      g.strokeStyle = withAlpha(theme.muted, 0.35);
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(o[0], o[1], V.s, 0, TAU);
      g.stroke();
      g.strokeStyle = withAlpha(col.hyp(), 0.75);
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(o[0], o[1], V.s, 0, -Math.PI / 2 * dr, true);
      g.stroke();
      g.restore();
      // Achsenmarken 1
      const tick = (q: Px, horiz: boolean, txt: string) => {
        line([q[0] - (horiz ? 0 : 5), q[1] - (horiz ? 5 : 0)], [q[0] + (horiz ? 0 : 5), q[1] + (horiz ? 5 : 0)], theme.muted, 1.4);
        const g2 = surface.g;
        g2.save();
        g2.font = `600 ${fs(12, 11)}px ${theme.font}`;
        g2.fillStyle = theme.muted;
        g2.textAlign = horiz ? 'center' : 'right';
        g2.textBaseline = horiz ? 'top' : 'middle';
        g2.fillText(txt, q[0] + (horiz ? -8 : -9), q[1] + (horiz ? 7 : 0));
        g2.restore();
      };
      tick(e, true, '1');
      tick(P([0, 1]), false, '1');
      // Tangente x = 1
      line([e[0], R.y + R.h - 6], [e[0], R.y + 6], withAlpha(col.tan(), 0.55), 1.4, { dash: [6, 5], alpha: dr });
      // Verlängerung OP bis T
      line(o, pT, withAlpha(theme.muted, 0.8), 1.4, { dash: [4, 4], alpha: lab });
      // Tangentenabschnitt
      line(e, pT, col.tan(), fs(5, 4.4), { glow: true, alpha: lab });
      if (tanV > yTop) arrowHead([pT[0], pT[1] - 2], [0, -1], col.tan(), 11);
      // rechtwinkliges Dreieck O F P
      const sw = fs(5.2, 4.6);
      line(o, pF, col.adj(), sw, { glow: true, alpha: dr });
      line(pF, pP, col.opp(), sw, { glow: true, alpha: dr });
      line(o, pP, col.hyp(), fs(3.4, 3), { glow: true, alpha: dr });
      if (al > 1 && al < 89) rightMark(pF, [o[0] - pF[0], o[1] - pF[1]], [pP[0] - pF[0], pP[1] - pF[1]], clamp(Math.min(s, c) * V.s * 0.25, 5, 13), lab);
      // Winkel α bei O, 90° − α bei P
      const rA = clamp(V.s * 0.2, 22, 60);
      angleArc(o, rA, 0, rad(al), col.ang(), 1, lab);
      if (al > 3 && al < 87) {
        const rP = clamp(V.s * 0.13, 16, 38);
        angleArc(pP, rP, Math.PI + rad(al), 1.5 * Math.PI, theme.muted, 0, lab * 0.9);
        const mid = Math.PI + rad(al) + (Math.PI / 2 - rad(al)) / 2;
        const src = `\\c{m}{90° − α}`;
        fpill(pP[0] + Math.cos(mid) * (rP + 30), pP[1] - Math.sin(mid) * (rP + 14), src, { size: fs(11.5, 11), alpha: lab * 0.95 });
      }
      {
        const mid = rad(al) / 2;
        const src = `\\c{k}{α = ${N(Math.round(al), 0)}°}`;
        const ps = pillSize(src, fs(13, 12));
        fpill(o[0] + Math.cos(mid) * (rA + 10) + ps.w / 2, o[1] - Math.sin(mid) * (rA + 10) - (al < 12 ? -10 : 0), src, { size: fs(13, 12), alpha: lab, border: withAlpha(col.ang(), 0.6) });
      }
      // Beschriftungen mit Werten
      const show = p.show;
      const v3 = (v: number) => (show ? ` ${eq(v, 3)} ${N(v, 3)}` : '');
      const szL = fs(12.5, 11.5);
      // sin unten am roten Lot, tan darüber (nie überlappend)
      let sinTop = Infinity;
      if (al > 4) {
        const yS = Math.max((pF[1] + pP[1]) / 2, pP[1] + 14);
        const rr = fpill(pF[0] + 8, Math.min(yS, pF[1] - 16), `\\c{o}{sin α${v3(s)}}`, { align: 'left', size: szL, alpha: lab, bounds: R });
        sinTop = rr.y;
      }
      if (al < 86) {
        const ps = pillSize(`\\c{a}{cos α${v3(c)}}`, szL);
        const below = o[1] + 18;
        fpill(Math.max(o[0] + ps.w / 2 + 4, (o[0] + pF[0]) / 2), below, `\\c{a}{cos α${v3(c)}}`, { size: szL, alpha: lab, bounds: R });
      }
      {
        let n: Px = [-(pP[1] - o[1]), pP[0] - o[0]];
        const nl = Math.hypot(n[0], n[1]) || 1;
        const mx = (o[0] + pP[0]) / 2;
        const my = (o[1] + pP[1]) / 2;
        // nach außen (weg vom Lotfußpunkt F), damit „1“ nicht im Dreieck liegt
        if (n[0] * (pF[0] - mx) + n[1] * (pF[1] - my) > 0) n = [-n[0], -n[1]];
        sidePill(mx, my, [n[0] / nl, n[1] / nl], 6, `\\c{h}{1}`, { alpha: lab, size: szL });
      }
      {
        const tv = Number.isFinite(tanV) ? tanV : NaN;
        const src = Number.isFinite(tv) ? `\\c{t}{tan α${show ? ` ${eq(tv, 3)} ${N(tv, 3)}` : ''}}` : `\\c{t}{tan 90° \\t{${say(L('n. def.', 'undef.'))}}}`;
        const ph = pillSize(src, szL).h;
        let yy = tanV > yTop ? R.y + 74 : (e[1] + pT[1]) / 2;
        if (yy + ph / 2 + 4 > sinTop) yy = sinTop - ph / 2 - 6;
        fpill(e[0] + 10, yy, src, { align: 'left', size: szL, alpha: lab, bounds: R });
      }
      label(o, 'O', theme.text, [-1, 1], k.panel, 3);
      label(pP, 'P', theme.text, [0.5, -1], lab);
      if (tanV <= yTop) label(pT, 'T', col.tan(), [1, -0.6], lab);
      // Griffe
      if (!sweep) {
        handle(pP, 'P', col.hyp(), lab);
        if (tanV <= yTop) handle(pT, 'T', col.tan(), lab, fs(6, 5.5));
      } else dot(pP[0], pP[1], col.hyp(), fs(6, 5.5), lab);
      g.restore();
      fpill(R.x + 12, R.y + 30, `\\t{${say(L('Einheitskreis', 'Unit circle'))}}: \\c{h}{c = 1} ⇒ \\c{o}{\\t{${say(L('GK', 'opp'))}} = sin α},  \\c{a}{\\t{${say(L('AK', 'adj'))}} = cos α}`, { align: 'left', size: fs(13.5, 12), alpha: k.panel, border: withAlpha(col.hyp(), 0.55), maxW: R.w - 40 });
      g.restore();
    }

    /* =====================================================================
     * Szene 3: Winkel aus zwei Seiten
     * ===================================================================== */
    function stepsK(now: number): number[] {
      if (!steps) return [1, 1, 1, 1, 1];
      const t = now - steps.t0;
      return [0, 1, 2, 3, 4].map((i) => ease.outCubic(clamp01((t - 200 - i * 950) / 600)));
    }
    const STEPS_END = 200 + 4 * 950 + 700;

    function drawInv(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const V = viewOf('inv');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const f = fn();
      const r = ref();
      const res = invTri(GO.v, AN.v, HY.v);
      const lab = k.labels;
      const show = p.show;
      const st = stepsK(now);
      g.save();
      g.globalAlpha *= alpha;
      paper(R);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      const o = P([0, 0]);
      grid(R, o, V.s * 0.5, k.panel, 2);
      const given = (role: Role) => {
        const { num, den } = ratioParts(f);
        return role === num || role === den;
      };
      const val = (role: Role) => (role === 'opp' ? res.opp : role === 'adj' ? res.adj : res.hyp);
      const szL = fs(12.5, 11.5);
      if (res.ok) {
        const lg = legsOf(res.opp, res.adj, r);
        const pa = P([0, 0]);
        const pc = P([lg.b, 0]);
        const pb = P([lg.b, lg.a]);
        const dr = k.draw;
        const sideRole = (s: 'a' | 'b' | 'c') => roleOf(s, r);
        const sideW = (role: Role) => (given(role) ? fs(5.5, 4.8) : fs(2.6, 2.4));
        const sideA = (role: Role) => (given(role) ? 1 : 0.6);
        const fillG = g.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
        fillG.addColorStop(0, withAlpha(col.ang(), theme.dark ? 0.1 : 0.07));
        fillG.addColorStop(1, withAlpha(col.hyp(), theme.dark ? 0.1 : 0.06));
        g.fillStyle = fillG;
        g.beginPath();
        g.moveTo(pa[0], pa[1]);
        g.lineTo(pc[0], pc[1]);
        g.lineTo(pb[0], pb[1]);
        g.closePath();
        g.fill();
        line(pc, lerpP(pc, pb, dr), roleCol(sideRole('a')), sideW(sideRole('a')), { glow: true, alpha: sideA(sideRole('a')) });
        line(pa, lerpP(pa, pc, dr), roleCol(sideRole('b')), sideW(sideRole('b')), { glow: true, alpha: sideA(sideRole('b')) });
        line(pa, lerpP(pa, pb, dr), col.hyp(), sideW('hyp'), { glow: true, alpha: sideA('hyp') });
        rightMark(pc, [pa[0] - pc[0], pa[1] - pc[1]], [pb[0] - pc[0], pb[1] - pc[1]], clamp(Math.min(lg.a, lg.b) * V.s * 0.3, 6, fs(15, 13)), k.panel);
        // gesuchter Winkel: Bogen wächst beim Lösen
        const angDone = show ? st[3]! : 0;
        const q = r === 'a' ? pa : pb;
        const ang = res.angle;
        const rr = clamp(Math.min(r === 'a' ? lg.b : lg.a, res.hyp) * V.s * 0.3, 16, fs(52, 40));
        const a0 = r === 'a' ? 0 : 1.5 * Math.PI - rad(ang) * Math.max(angDone, 0.0001);
        const a1 = r === 'a' ? rad(ang) * Math.max(angDone, 0.0001) : 1.5 * Math.PI;
        if (angDone < 0.999) angleArc(q, rr, r === 'a' ? 0 : 1.5 * Math.PI - rad(ang), r === 'a' ? rad(ang) : 1.5 * Math.PI, col.ang(), 0, lab * 0.6);
        if (angDone > 0.01) angleArc(q, rr, a0, a1, col.ang(), 1, lab);
        const mid = r === 'a' ? rad(ang) / 2 : 1.5 * Math.PI - rad(ang) / 2;
        const shownAng = ang * angDone;
        const angSrc = angDone > 0.01 ? `\\c{k}{${angName(r)} ${eq(shownAng, 2)} ${N(shownAng, 2)}°}` : `\\c{k}{${angName(r)} = ?}`;
        const ps = pillSize(angSrc, fs(13.5, 12.5));
        const lx = q[0] + Math.cos(mid) * (rr + 12) + (r === 'a' ? ps.w / 2 - 4 : -ps.w / 2 + 4);
        const ly = q[1] - Math.sin(mid) * (rr + 12) + (r === 'a' ? 0 : 6);
        fpill(lx, ly, angSrc, { size: fs(13.5, 12.5), alpha: lab, border: withAlpha(col.ang(), 0.7), bounds: R });
        // Seiten beschriften
        const midA: Px = [(pc[0] + pb[0]) / 2, (pc[1] + pb[1]) / 2];
        const midB: Px = [(pa[0] + pc[0]) / 2, (pa[1] + pc[1]) / 2];
        const midC: Px = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
        const sideSrc = (role: Role) => {
          const v = val(role);
          const key = ROLE_KEY[role];
          if (given(role)) return `\\c{${key}}{\\t{${say(ROLE_NAME[role])}} = ${N(v, 1)} cm}`;
          return show && st[4]! > 0.5 ? `\\c{m}{\\t{${say(ROLE_NAME[role])}} ${eq(v)} ${N(v)} cm}` : `\\c{m}{\\t{${say(ROLE_NAME[role])}}}`;
        };
        const sa = sideSrc(sideRole('a'));
        const psA = pillSize(sa, szL);
        fpill(midA[0] + 10 + psA.w / 2, midA[1], sa, { size: szL, alpha: lab, bounds: R, border: given(sideRole('a')) ? withAlpha(roleCol(sideRole('a')), 0.55) : undefined });
        fpill(midB[0], midB[1] + 20, sideSrc(sideRole('b')), { size: szL, alpha: lab, bounds: R, border: given(sideRole('b')) ? withAlpha(roleCol(sideRole('b')), 0.55) : undefined });
        const hl = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1;
        let nC: Px = [(pb[1] - pa[1]) / hl, -(pb[0] - pa[0]) / hl];
        if (nC[0] * (pc[0] - midC[0]) + nC[1] * (pc[1] - midC[1]) > 0) nC = [-nC[0], -nC[1]];
        sidePill(midC[0], midC[1], nC, 8, sideSrc('hyp'), { size: szL, alpha: lab, bounds: R, border: given('hyp') ? withAlpha(col.hyp(), 0.55) : undefined });
        label(pa, 'A', theme.text, [-1, 0.5], k.panel);
        label(pc, 'C', theme.text, [1, 1], k.panel, 4);
        label(pb, 'B', theme.text, [-0.8, -1], k.panel);
        if (editable() && lab > 0.5) {
          hits.push({ id: 'angA', x: pa[0] + 14, y: pa[1] - 8, r: 22 });
          hits.push({ id: 'angB', x: pb[0] - 8, y: pb[1] + 16, r: 22 });
        }
      } else {
        // Sonderfall: Kathete ≥ Hypotenuse – Kreis um A mit Radius Hypotenuse erreicht die Kathete nicht
        const hy = HY.v;
        const leg = f === 'sin' ? GO.v : AN.v;
        const pa = P([0, 0]);
        g.save();
        g.globalAlpha *= lab;
        g.strokeStyle = col.hyp();
        g.lineWidth = 2.4;
        g.setLineDash([7, 5]);
        g.beginPath();
        g.arc(pa[0], pa[1], hy * V.s, 0, -Math.PI / 2, true);
        g.stroke();
        g.restore();
        line(pa, P([hy * 1.02, 0]), withAlpha(theme.muted, 0.8), 1.6, { alpha: lab });
        if (f === 'sin') {
          // Gegenkathete senkrecht, Höhe > Radius
          const x0 = hy * 0.55;
          line(P([x0, 0]), P([x0, leg]), col.opp(), fs(5.5, 4.8), { glow: true, alpha: lab });
          line(P([0, leg]), P([hy * 1.05, leg]), withAlpha(col.opp(), 0.7), 1.4, { dash: [4, 4], alpha: lab });
          fpill(P([x0, leg / 2])[0] + 12, P([x0, leg / 2])[1], `\\c{o}{\\t{${say(ROLE_NAME.opp)}} = ${N(leg, 1)} cm}`, { align: 'left', size: szL, alpha: lab, border: withAlpha(col.opp(), 0.55), bounds: R });
        } else {
          const y0 = hy * 0.15;
          line(P([0, y0]), P([leg, y0]), col.adj(), fs(5.5, 4.8), { glow: true, alpha: lab });
          line(P([leg, 0]), P([leg, hy * 1.05]), withAlpha(col.adj(), 0.7), 1.4, { dash: [4, 4], alpha: lab });
          fpill(P([leg / 2, y0])[0], P([leg / 2, y0])[1] + 22, `\\c{a}{\\t{${say(ROLE_NAME.adj)}} = ${N(leg, 1)} cm}`, { size: szL, alpha: lab, border: withAlpha(col.adj(), 0.55), bounds: R });
        }
        const hp = P([Math.cos(rad(60)) * hy, Math.sin(rad(60)) * hy]);
        fpill(hp[0] - 10, hp[1] - 6, `\\c{h}{\\t{${say(ROLE_NAME.hyp)}} = ${N(hy, 1)} cm}`, { align: 'right', size: szL, alpha: lab, border: withAlpha(col.hyp(), 0.55), bounds: R });
        label(pa, 'A', theme.text, [-1, 0.5], k.panel);
        fpill(R.x + R.w / 2, R.y + R.h - 34, `\\c{w}{\\t{${say(L('Kein Dreieck: Die Kathete ist nicht kürzer als die Hypotenuse.', 'No triangle: the leg is not shorter than the hypotenuse.'))}}}`, { size: fs(13, 11.5), border: withAlpha(col.warn(), 0.7), alpha: lab, maxW: R.w - 50 });
      }
      g.restore();
      const { num, den } = ratioParts(f);
      fpill(R.x + 12, R.y + 30, `\\t{${say(L('Gesucht', 'Unknown'))}}: \\c{k}{${angName(r)}}   \\t{${say(L('gegeben', 'given'))}}: ${roleSrc(num)}, ${roleSrc(den)}`, { align: 'left', size: fs(13.5, 12), alpha: k.panel, border: withAlpha(col.ang(), 0.55), maxW: R.w - 40 });
      g.restore();
    }

    /* =====================================================================
     * Anwendungen
     * ===================================================================== */
    function storyK(now: number, i: number, n: number): number {
      if (!story) return 1;
      const t = now - story.t0;
      return ease.outCubic(clamp01((t - 300 - i * (3600 / n)) / 600));
    }
    const STORY_END = 300 + 3600 + 900;

    /** Himmel und Boden einer Außenszene; liefert die Bodenhöhe in Pixeln. */
    function outdoor(R: Rect, gy: number, paving: boolean): void {
      const g = surface.g;
      const dark = th().dark;
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
      sky.addColorStop(0, dark ? '#0d1828' : '#bcdcf5');
      sky.addColorStop(1, dark ? '#1f2f47' : '#f2f8fd');
      g.fillStyle = sky;
      g.fillRect(R.x, R.y, R.w, gy - R.y);
      const ground = g.createLinearGradient(0, gy, 0, R.y + R.h);
      if (paving) {
        ground.addColorStop(0, dark ? '#3a3f47' : '#c9ccd1');
        ground.addColorStop(1, dark ? '#2a2e35' : '#b3b7bd');
      } else {
        ground.addColorStop(0, dark ? '#2f4a2b' : '#a9d58f');
        ground.addColorStop(1, dark ? '#1c301b' : '#86c26f');
      }
      g.fillStyle = ground;
      g.fillRect(R.x, gy, R.w, R.y + R.h - gy);
      g.strokeStyle = paving ? (dark ? '#565c66' : '#9da2a9') : dark ? '#4c6b44' : '#6fae57';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(R.x, gy + 1);
      g.lineTo(R.x + R.w, gy + 1);
      g.stroke();
      g.restore();
    }

    function drawRamp(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const V = viewOf('ramp');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const pc = PC.v;
      const h = RH.v;
      const rp = ramp(pc, h);
      const run = rp.run;
      const show = p.show;
      const lab = k.labels;
      const foot = P([0, 0]);
      const base = P([run, 0]);
      const top = P([run, h]);
      g.save();
      g.globalAlpha *= alpha;
      outdoor(R, foot[1], true);
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      // Gebäude mit Tür auf Höhe h
      const bx0 = P([run, 0])[0];
      const bx1 = P([run + 3.2, 0])[0] + 40;
      const roofY = P([0, h + 2.8])[1];
      const wallG = g.createLinearGradient(bx0, 0, bx1, 0);
      wallG.addColorStop(0, dark ? '#4a4038' : '#e9ddc8');
      wallG.addColorStop(1, dark ? '#3a322b' : '#d8c9ae');
      g.fillStyle = wallG;
      g.fillRect(bx0, roofY, bx1 - bx0, foot[1] - roofY);
      g.fillStyle = dark ? '#2a241f' : '#b7a588';
      g.fillRect(bx0, roofY - 6, bx1 - bx0, 6);
      // Podest (Fußboden auf Höhe h)
      g.fillStyle = dark ? '#5a5f68' : '#a7abb2';
      g.fillRect(bx0, top[1], bx1 - bx0, foot[1] - top[1]);
      const door0 = P([run + 0.5, h]);
      const door1 = P([run + 1.5, h + 2.1]);
      const dg = g.createLinearGradient(door0[0], 0, door1[0], 0);
      dg.addColorStop(0, dark ? '#2f5a7a' : '#5b8db5');
      dg.addColorStop(1, dark ? '#24465f' : '#3f7099');
      g.fillStyle = dg;
      g.fillRect(door0[0], door1[1], door1[0] - door0[0], door0[1] - door1[1]);
      g.fillStyle = dark ? '#cfd6de' : '#f4f6f8';
      g.fillRect(door1[0] - 7, (door0[1] + door1[1]) / 2, 4, 2);
      // Rampe (Keil)
      const rg = g.createLinearGradient(0, top[1], 0, foot[1]);
      rg.addColorStop(0, dark ? '#6b7079' : '#d5d8dc');
      rg.addColorStop(1, dark ? '#50545c' : '#babec4');
      g.fillStyle = rg;
      g.beginPath();
      g.moveTo(foot[0], foot[1]);
      g.lineTo(base[0], base[1]);
      g.lineTo(top[0], top[1]);
      g.closePath();
      g.fill();
      // Handlauf in 0,9 m Höhe über der Rampe
      const hr = 0.9;
      const hrp = (x: number): Pt => [x, (x / run) * h + hr];
      g.save();
      g.globalAlpha *= lab;
      g.strokeStyle = dark ? '#aab3bf' : '#6b7480';
      g.lineWidth = 2;
      for (let i = 0; i <= 4; i++) {
        const x = (run * i) / 4;
        const q0 = P([x, (x / run) * h]);
        const q1 = P(hrp(x));
        g.beginPath();
        g.moveTo(q0[0], q0[1]);
        g.lineTo(q1[0], q1[1]);
        g.stroke();
      }
      g.lineWidth = 3;
      g.beginPath();
      const h0 = P(hrp(0));
      const h1 = P(hrp(run));
      g.moveTo(h0[0], h0[1]);
      g.lineTo(h1[0], h1[1]);
      g.stroke();
      g.restore();
      // Rollstuhl-Symbol auf der Rampe
      drawWheelchair(P, run * 0.42, (run * 0.42 / run) * h, rp.angle, lab);
      // Kanten des Steigungsdreiecks
      line(foot, base, col.adj(), fs(4.5, 4), { glow: true, alpha: lab });
      line(base, top, col.opp(), fs(4.5, 4), { glow: true, alpha: lab });
      line(foot, top, col.hyp(), fs(3.2, 3), { glow: true, alpha: lab });
      // Winkel
      const rA = clamp(Math.min(run * V.s * 0.45, R.w * 0.35), 40, 240);
      angleArc(foot, rA, 0, rad(rp.angle), col.ang(), 1, lab);
      const k1 = storyK(now, 1, 4);
      const k2 = storyK(now, 2, 4);
      const k3 = storyK(now, 3, 4);
      const angSrc = show ? `\\c{k}{α ${eq(rp.angle)} ${N(rp.angle, 2)}°}` : `\\c{k}{α = ?}`;
      fpill(foot[0] + rA + 10, foot[1] - Math.max(14, Math.sin(rad(rp.angle)) * rA * 0.5) - 6, angSrc, { align: 'left', size: fs(13, 12), alpha: lab * k1, border: withAlpha(col.ang(), 0.6), bounds: R });
      // Maße
      dimLine(foot, base, [0, 1], fs(26, 22), col.adj(), show ? `\\c{a}{l ${eq(run)} ${N(run)} ${M}}` : `\\c{a}{l = ?}`, lab * k2, R);
      dimLine(base, top, [-1, 0], -fs(10, 8) - 0, col.opp(), `\\c{o}{h = ${N(h)} ${M}}`, lab, R);
      const slopeN: Px = [-(top[1] - foot[1]), top[0] - foot[0]];
      const sl = Math.hypot(slopeN[0], slopeN[1]) || 1;
      const nS: Px = [slopeN[0] / sl, slopeN[1] / sl];
      if (nS[1] > 0) {
        nS[0] = -nS[0];
        nS[1] = -nS[1];
      }
      const ms: Px = [lerp(foot[0], top[0], 0.72), lerp(foot[1], top[1], 0.72)];
      sidePill(ms[0], ms[1], nS, fs(46, 40), show ? `\\c{h}{s ${eq(rp.slope)} ${N(rp.slope)} ${M}}` : `\\c{h}{s = ?}`, { alpha: lab * k3, bounds: R });
      handle(top, 'rTop', col.opp(), lab);
      handle(foot, 'rFoot', col.adj(), lab);
      drawGradeInset(R, pc, lab);
      g.restore();
      fpill(R.x + 12, R.y + 30, `\\t{${say(L('Steigung', 'Gradient'))}} \\c{o}{p = ${N(pc, 1)} %}  ⇒  \\c{k}{tan α} = \\f{\\c{o}{h}}{\\c{a}{l}} = ${N(pc / 100, 3)}`, { align: 'left', size: fs(13.5, 12), alpha: k.panel, border: withAlpha(col.ang(), 0.55), maxW: R.w - 40 });
      g.restore();
    }

    /**
     * Einschub „Was heißt p %?“: Steigungsdreieck 100 m waagrecht, p m hoch (maßstabsgetreu),
     * dazu gestrichelt der Winkel p° zum Vergleich (Prozent ≠ Grad).
     */
    function drawGradeInset(R: Rect, pc: number, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const x = R.x + 14;
      const w = R.w - 28;
      const y = R.y + 62;
      const bw = w - fs(120, 96);
      const hPx = (bw * pc) / 100;
      const hDeg = bw * Math.tan(rad(pc));
      const h = Math.min(Math.max(hDeg, hPx) + 58, R.h * 0.32);
      g.save();
      g.globalAlpha *= alpha * 0.97;
      g.fillStyle = mixColor(theme.bg, theme.bg, 0, theme.dark ? 0.82 : 0.86);
      roundRect(g, x, y, w, h, 12);
      g.fill();
      g.strokeStyle = theme.grid;
      roundRect(g, x + 0.5, y + 0.5, w - 1, h - 1, 12);
      g.stroke();
      const o: Px = [x + 16, y + h - 26];
      const e: Px = [o[0] + bw, o[1]];
      const t: Px = [e[0], o[1] - hPx];
      // Vergleich: p Grad
      const hd = Math.min(hDeg, h - 40);
      const td: Px = [o[0] + hd / Math.tan(rad(pc)), o[1] - hd];
      line(o, td, withAlpha(theme.muted, 0.9), 1.5, { dash: [5, 4] });
      g.fillStyle = withAlpha(col.ang(), 0.16);
      g.beginPath();
      g.moveTo(o[0], o[1]);
      g.lineTo(e[0], e[1]);
      g.lineTo(t[0], t[1]);
      g.closePath();
      g.fill();
      line(o, e, col.adj(), 3);
      line(e, t, col.opp(), 3);
      line(o, t, col.hyp(), 2);
      g.restore();
      const sz = fs(12, 11);
      fpill(o[0] + bw / 2, o[1] + 13, `\\c{a}{100 ${M}}`, { size: sz, alpha });
      fpill(e[0] + 8, (e[1] + t[1]) / 2, `\\c{o}{${N(pc, 1)} ${M}}`, { align: 'left', size: sz, alpha });
      fpill(td[0] + 8, td[1] - 2, `\\c{m}{${N(pc, 1)}° ≙ ${N(percentFromAngle(pc), 1)} %}`, { align: 'left', size: sz, alpha, bounds: { x, y, w, h } });
      fpill(x + 10, y + 16, `\\t{${say(L('Was heißt', 'What does'))}} \\c{o}{${N(pc, 1)} %}${lang === 'en' ? ' mean' : ''}?`, { align: 'left', size: sz, alpha });
    }

    /** Rollstuhl-Piktogramm, um den Steigungswinkel gedreht (Weltpunkt x, y auf der Rampe). */
    function drawWheelchair(P: (q: Pt) => Px, x: number, y: number, angDeg: number, alpha: number): void {
      const g = surface.g;
      const q = P([x, y]);
      const q2 = P([x + 1, y]);
      const s = Math.max(4, q2[0] - q[0]);
      const u = s * 0.62;
      if (u < 14) return;
      const dark = th().dark;
      const chairImg = ctx.images.get('wheelchair');
      if (chairImg) {
        // Foto eines leeren Rollstuhls (etwa 0,95 m hoch), Räder auf der Rampe, mitgedreht
        const h = s * 0.95;
        const w = (h * chairImg.naturalWidth) / chairImg.naturalHeight;
        g.save();
        g.globalAlpha *= alpha;
        g.translate(q[0], q[1]);
        g.rotate(-rad(angDeg));
        g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
        g.shadowBlur = 6;
        g.shadowOffsetY = 2;
        g.drawImage(scaledSprite(chairImg, w, h, surface.dpr), -w * 0.4, -h, w, h);
        g.restore();
        return;
      }
      g.save();
      g.globalAlpha *= alpha * 0.9;
      g.translate(q[0], q[1]);
      g.rotate(-rad(angDeg));
      g.strokeStyle = dark ? '#8fc1ff' : '#1f5fae';
      g.fillStyle = g.strokeStyle;
      g.lineWidth = Math.max(2, u * 0.07);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const wr = u * 0.42;
      g.beginPath();
      g.arc(0, -wr, wr, 0, TAU);
      g.stroke();
      g.beginPath();
      g.arc(u * 0.62, -u * 0.08, u * 0.08, 0, TAU);
      g.fill();
      // Sitz, Lehne, Beine
      g.beginPath();
      g.moveTo(-u * 0.22, -u * 1.25);
      g.lineTo(-u * 0.12, -wr);
      g.lineTo(u * 0.42, -wr);
      g.lineTo(u * 0.62, -u * 0.08);
      g.stroke();
      // Person
      g.beginPath();
      g.arc(-u * 0.05, -u * 1.55, u * 0.14, 0, TAU);
      g.fill();
      g.beginPath();
      g.moveTo(-u * 0.08, -u * 1.36);
      g.lineTo(-u * 0.02, -wr - u * 0.08);
      g.lineTo(u * 0.4, -wr - u * 0.1);
      g.lineTo(u * 0.48, -u * 0.18);
      g.stroke();
      g.restore();
    }

    function drawLadder(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const V = viewOf('ladder');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const Lv = LL.v;
      const al = AL.v;
      const ld = ladder(Lv, al);
      const show = p.show;
      const lab = k.labels;
      const foot = P([-ld.foot, 0]);
      const top = P([0, ld.height]);
      const wallX = P([0, 0])[0];
      const gy = foot[1];
      g.save();
      g.globalAlpha *= alpha;
      outdoor(R, gy, false);
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      // Hauswand mit Ziegeln
      const wx1 = R.x + R.w;
      g.fillStyle = dark ? '#5a3a30' : '#c9826a';
      g.fillRect(wallX, R.y, wx1 - wallX, gy - R.y);
      const bh = clamp(V.s * 0.075, 5, 14);
      const bw = bh * 2.6;
      const brickImg = ctx.images.get('bricks');
      if (brickImg) {
        // Ziegelfoto als Muster: eine Ziegelreihe (BRICK_ROW px im Bild) so hoch wie bei der Ersatzgrafik, unten an der Bodenlinie ausgerichtet
        const tile = (brickImg.naturalWidth * bh) / BRICK_ROW;
        const dpr = surface.dpr;
        const pat = g.createPattern(scaledSprite(brickImg, tile, tile, dpr), 'repeat');
        if (pat) {
          pat.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, wallX, gy]));
          g.fillStyle = pat;
          g.fillRect(wallX, R.y, wx1 - wallX, gy - R.y);
          // im Dunkelmodus abgedunkelt wie die gezeichnete Wand
          if (dark) {
            g.fillStyle = withAlpha(theme.bg, 0.45);
            g.fillRect(wallX, R.y, wx1 - wallX, gy - R.y);
          }
        }
      }
      const brickGA = g.globalAlpha;
      if (brickImg) g.globalAlpha = 0;
      g.strokeStyle = dark ? 'rgba(20,12,10,0.55)' : 'rgba(255,240,230,0.7)';
      g.lineWidth = 1;
      for (let row = 0, y = gy; y > R.y; row++, y -= bh) {
        g.beginPath();
        g.moveTo(wallX, y);
        g.lineTo(wx1, y);
        g.stroke();
        for (let x = wallX + (row % 2 ? bw / 2 : 0); x < wx1; x += bw) {
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x, y - bh);
          g.stroke();
        }
      }
      g.globalAlpha = brickGA;
      const shade = g.createLinearGradient(wallX, 0, wallX + 18, 0);
      shade.addColorStop(0, 'rgba(0,0,0,0.28)');
      shade.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = shade;
      g.fillRect(wallX, R.y, 18, gy - R.y);
      // Sicherheitsbereich 65°–75°
      const rS = clamp(Lv * V.s * 0.45, 60, 210);
      g.save();
      g.globalAlpha *= lab;
      g.fillStyle = withAlpha(col.ok(), dark ? 0.38 : 0.28);
      g.beginPath();
      g.moveTo(foot[0], foot[1]);
      g.arc(foot[0], foot[1], rS, -rad(LADDER_MAX), -rad(LADDER_MIN));
      g.closePath();
      g.fill();
      g.strokeStyle = withAlpha(col.ok(), 0.8);
      g.lineWidth = 1.4;
      g.setLineDash([4, 3]);
      for (const a of [LADDER_MIN, LADDER_MAX]) line(foot, [foot[0] + Math.cos(rad(a)) * rS, foot[1] - Math.sin(rad(a)) * rS], withAlpha(col.ok(), 0.9), 1.6, { dash: [4, 3] });
      g.restore();
      {
        const tip: Px = [foot[0] + Math.cos(rad(LADDER_MAX)) * rS, foot[1] - Math.sin(rad(LADDER_MAX)) * rS];
        fpill(tip[0] - 10, tip[1] - 4, `\\c{ok}{${LADDER_MIN}° \\t{${say(L('bis', 'to'))}} ${LADDER_MAX}°}`, { align: 'right', size: fs(11.5, 11), alpha: lab, border: withAlpha(col.ok(), 0.6), bounds: R });
      }
      // Leiter: zwei Holme mit Sprossen
      const dir: Px = [top[0] - foot[0], top[1] - foot[1]];
      const dl = Math.hypot(dir[0], dir[1]) || 1;
      const nrm: Px = [-dir[1] / dl, dir[0] / dl];
      const off = clamp(V.s * 0.05, 3, 7);
      const railCol = dark ? '#c7ccd3' : '#8d96a1';
      const rail = (sgn: number) => line([foot[0] + nrm[0] * off * sgn, foot[1] + nrm[1] * off * sgn], [top[0] + nrm[0] * off * sgn, top[1] + nrm[1] * off * sgn], railCol, fs(3.6, 3), { glow: true, alpha: k.draw });
      rail(-1);
      const nR = Math.floor(Lv / 0.28);
      g.save();
      g.globalAlpha *= k.draw;
      g.strokeStyle = dark ? '#aeb4bc' : '#a3abb5';
      g.lineWidth = 2;
      for (let i = 1; i < nR; i++) {
        const t = i / nR;
        const cx = lerp(foot[0], top[0], t);
        const cy = lerp(foot[1], top[1], t);
        g.beginPath();
        g.moveTo(cx - nrm[0] * off, cy - nrm[1] * off);
        g.lineTo(cx + nrm[0] * off, cy + nrm[1] * off);
        g.stroke();
      }
      g.restore();
      rail(1);
      // Dreieck: Höhe (GK), Fußabstand (AK), Leiter (HY)
      line(foot, [wallX, gy], col.adj(), fs(4.5, 4), { glow: true, alpha: lab });
      line([wallX, gy], top, col.opp(), fs(4.5, 4), { glow: true, alpha: lab });
      rightMark([wallX, gy], [-1, 0], [0, -1], 12, lab);
      // Winkel
      const safe = ld.safety === 'ok';
      const rA = clamp(Lv * V.s * 0.2, 30, 90);
      angleArc(foot, rA, 0, rad(al), col.ang(), 1, lab);
      fpill(foot[0] + Math.cos(rad(al / 2)) * (rA + 12) + 30, foot[1] - Math.sin(rad(al / 2)) * (rA + 12), `\\c{k}{α = ${N(Math.round(al), 0)}°}`, { size: fs(13, 12), alpha: lab, border: withAlpha(col.ang(), 0.6), bounds: R });
      const k1 = storyK(now, 1, 3);
      const k2 = storyK(now, 2, 3);
      dimLine([wallX, gy], top, [1, 0], fs(18, 14), col.opp(), show ? `\\c{o}{h ${eq(ld.height)} ${N(ld.height)} ${M}}` : `\\c{o}{h = ?}`, lab * k1, R);
      dimLine(foot, [wallX, gy], [0, 1], fs(24, 20), col.adj(), show ? `\\c{a}{e ${eq(ld.foot)} ${N(ld.foot)} ${M}}` : `\\c{a}{e = ?}`, lab * k2, R);
      const mid: Px = [lerp(foot[0], top[0], 0.55), lerp(foot[1], top[1], 0.55)];
      sidePill(mid[0], mid[1], [-Math.abs(nrm[0]), -Math.abs(nrm[1])], 10, `\\c{h}{L = ${N(Lv, 1)} ${M}}`, { alpha: lab, bounds: R, border: withAlpha(col.hyp(), 0.55) });
      handle(top, 'lTop', col.opp(), lab);
      handle(foot, 'lFoot', col.adj(), lab);
      g.restore();
      const head = `\\t{${say(L('Anstellwinkel', 'Angle'))}} \\c{k}{α = ${N(Math.round(al), 0)}°}`;
      const left = fpill(R.x + 12, R.y + 30, head, { align: 'left', size: fs(13.5, 12), alpha: k.panel, border: withAlpha(col.ang(), 0.55) });
      const st = safe
        ? `\\c{ok}{✓ \\t{${say(L('sicher (65° bis 75°)', 'safe (65° to 75°)'))}}}`
        : ld.safety === 'flat'
          ? `\\c{w}{\\t{${say(L('zu flach – rutscht weg', 'too flat – may slip'))}}}`
          : `\\c{w}{\\t{${say(L('zu steil – kippt nach hinten', 'too steep – may tip back'))}}}`;
      const ps = pillSize(st, fs(12.5, 11.5));
      const room = left.x + left.w + 8 + ps.w < R.x + R.w - 12;
      fpill(room ? left.x + left.w + 8 : R.x + 12, room ? R.y + 30 : left.y + left.h + 18, st, { align: 'left', size: fs(12.5, 11.5), alpha: lab, border: withAlpha(safe ? col.ok() : col.warn(), 0.7) });
      g.restore();
    }

    function drawTower(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const V = viewOf('tower');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const d = D.v;
      const al = AL.v;
      const tw = tower(d, al);
      const show = p.show;
      const lab = k.labels;
      const ground = P([0, 0]);
      const gy = ground[1];
      g.save();
      g.globalAlpha *= alpha;
      outdoor(R, gy, false);
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      // Turm: Schaft und spitzes Dach, Spitze bei x = d
      const H = tw.height;
      const wT = Math.max(4, H * 0.14);
      const roofH = Math.min(H * 0.28, wT * 2.2);
      const body0 = P([d - wT / 2, 0]);
      const body1 = P([d + wT / 2, H - roofH]);
      const tg = g.createLinearGradient(body0[0], 0, body1[0], 0);
      tg.addColorStop(0, dark ? '#6d6458' : '#e6dccb');
      tg.addColorStop(1, dark ? '#4c463e' : '#c4b79f');
      g.fillStyle = tg;
      g.fillRect(body0[0], body1[1], body1[0] - body0[0], body0[1] - body1[1]);
      const apex = P([d, H]);
      g.fillStyle = dark ? '#3c5a52' : '#5f8f80';
      g.beginPath();
      g.moveTo(body0[0] - 3, body1[1]);
      g.lineTo(apex[0], apex[1]);
      g.lineTo(body1[0] + 3, body1[1]);
      g.closePath();
      g.fill();
      // Fenster
      g.fillStyle = dark ? 'rgba(20,24,30,0.7)' : 'rgba(60,50,40,0.45)';
      const wW = (body1[0] - body0[0]) * 0.28;
      for (let i = 1; i <= 3; i++) {
        const yy = lerp(body0[1], body1[1], i / 4);
        const hh = Math.min(28, (body0[1] - body1[1]) * 0.1);
        if (hh < 4) continue;
        roundRect(g, (body0[0] + body1[0]) / 2 - wW / 2, yy - hh / 2, wW, hh, wW / 2);
        g.fill();
      }
      // Messgerät (Stativ) in Augenhöhe
      const inst = P([0, EYE_HEIGHT]);
      g.strokeStyle = dark ? '#c9ced6' : '#545c66';
      g.lineWidth = 2;
      for (const dx of [-0.6, 0, 0.6]) {
        const fp = P([dx, 0]);
        g.beginPath();
        g.moveTo(inst[0], inst[1] + 4);
        g.lineTo(fp[0], fp[1]);
        g.stroke();
      }
      g.fillStyle = dark ? '#e3b341' : '#d08700';
      roundRect(g, inst[0] - 9, inst[1] - 6, 18, 10, 3);
      g.fill();
      // Hilfslinien: Waagrechte (AK = d), Visierlinie (HY), Senkrechte (GK = x)
      const foot = P([d, EYE_HEIGHT]);
      const k1 = storyK(now, 1, 3);
      const k2 = storyK(now, 2, 3);
      line(inst, foot, col.adj(), fs(3.6, 3.2), { glow: true, alpha: lab });
      line(foot, apex, col.opp(), fs(3.6, 3.2), { glow: true, alpha: lab });
      line(inst, apex, col.hyp(), 2.2, { dash: [8, 5], alpha: lab });
      arrowHead(apex, [apex[0] - inst[0], apex[1] - inst[1]], col.hyp(), 9);
      line(P([d, 0]), foot, withAlpha(theme.muted, 0.9), 1.6, { dash: [3, 3], alpha: lab });
      rightMark(foot, [inst[0] - foot[0], 0], [0, -1], 10, lab);
      const rA = clamp(d * V.s * 0.25, 30, 110);
      angleArc(inst, rA, 0, rad(al), col.ang(), 1, lab);
      fpill(inst[0] + Math.cos(rad(al / 2)) * (rA + 12) + 34, inst[1] - Math.sin(rad(al / 2)) * (rA + 12), `\\c{k}{α = ${N(Math.round(al), 0)}°}`, { size: fs(13, 12), alpha: lab, border: withAlpha(col.ang(), 0.6), bounds: R });
      // Maße
      dimLine(P([0, 0]), P([d, 0]), [0, 1], fs(22, 18), col.adj(), `\\c{a}{d = ${N(d, 0)} ${M}}`, lab, R);
      sidePill(foot[0], (foot[1] + apex[1]) / 2, [-1, 0], 8, show ? `\\c{o}{x ${eq(tw.above)} ${N(tw.above)} ${M}}` : `\\c{o}{x = ?}`, { alpha: lab * k1, bounds: R, border: withAlpha(col.opp(), 0.55) });
      dimLine(P([d, 0]), apex, [1, 0], (body1[0] - foot[0]) + fs(16, 12), col.sim(), show ? `\\c{s}{h ${eq(tw.height)} ${N(tw.height)} ${M}}` : `\\c{s}{h = ?}`, lab * k2, R);
      fpill(inst[0] - 14, (inst[1] + gy) / 2, `\\c{m}{${N(EYE_HEIGHT, 1)} ${M}}`, { align: 'right', size: fs(11.5, 11), alpha: lab, bounds: R });
      handle(inst, 'obs', col.adj(), lab, fs(6, 5.5));
      handle(apex, 'top', col.opp(), lab, fs(6, 5.5));
      g.restore();
      fpill(R.x + 12, R.y + 30, `\\t{${say(L('Höhenwinkel', 'Angle of elevation'))}} \\c{k}{α = ${N(Math.round(al), 0)}°}, \\c{a}{d = ${N(d, 0)} ${M}}`, { align: 'left', size: fs(13.5, 12), alpha: k.panel, border: withAlpha(col.ang(), 0.55), maxW: R.w - 40 });
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

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: Row[], right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad;
      const boxes = rows.map((r) => fit(r.src, maxW, r.size ?? fs(13.5, 12.5), r.color ?? th().text, r.weight ?? 600));
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

    /** Seitenverhältnis mit Rollennamen, Buchstaben und Zahlen. */
    function ratioCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const f = fn();
        const r = ref();
        const { num, den } = ratioParts(f);
        const gs = growState(now);
        const kk = gs ? Math.max(gs.k, 0) : 1;
        const t = { alpha: AL.v, c: C.v };
        const ro = roles(t, r);
        const ang = r === 'a' ? AL.v : 90 - AL.v;
        const angR = Math.round(ang);
        const vNum = ro[num] * kk;
        const vDen = ro[den] * kk;
        const value = trig(f, r === 'a' ? p.al : 90 - p.al);
        const show = p.show;
        const sn = sideOf(num, r);
        const sd = sideOf(den, r);
        const known = (side: 'a' | 'b' | 'c') => show || side === 'c';
        const len = (v: number, side: 'a' | 'b' | 'c') => (known(side) ? `${N(v)} cm` : '?');
        const head = `${f} \\c{k}{${angName(r)}}`;
        const rows: Row[] = [
          { src: `${head} = \\f{${roleSrc(num)}}{${roleSrc(den)}}`, size: fs(15, 14), gap: 10 },
          {
            src: `${head} = \\f{\\c{${ROLE_KEY[num]}}{${sn}}}{\\c{${ROLE_KEY[den]}}{${sd}}} = \\f{\\c{${ROLE_KEY[num]}}{${len(vNum, sn)}}}{\\c{${ROLE_KEY[den]}}{${len(vDen, sd)}}}${show ? ` ${eq(value, 3)} \\b{${N(value, 3)}}` : ' = ?'}`,
            size: fs(14, 13),
            gap: 10,
          },
        ];
        if (show) rows.push({ src: `\\c{m}{\\t{${say(L('Umgekehrt', 'Conversely'))}}:} ${angName(r)} = ${f}^{−1}(${N(value, 3)}) ≈ ${N(angR, 0)}°`, size: fs(12.5, 11.5), color: th().muted, gap: 6 });
        if (r === 'b') rows.push({ src: `\\c{m}{\\t{${say(L('Für β tauschen die Katheten ihre Rollen', 'For β the legs swap roles'))}}: sin β = cos α}`, size: fs(12, 11), color: th().muted });
        else rows.push({ src: `\\c{m}{\\t{${say(L('Winkelbogen bei B antippen: Rollen tauschen', 'Tap the arc at B: roles swap'))}}}`, size: fs(12, 11), color: th().muted });
        return formulaCard(R, measure, k, say(L('Seitenverhältnis', 'Ratio of sides')), fnCol(f), rows, `\\c{${FN_KEY[f]}}{${f === 'sin' ? say(L('Sinus', 'sine')) : f === 'cos' ? say(L('Kosinus', 'cosine')) : say(L('Tangens', 'tangent'))}}`);
      };
    }

    /** Tabelle der ähnlichen Dreiecke: Seiten wachsen, Verhältnis bleibt. */
    function simCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const f = fn();
        const r = ref();
        const { num, den } = ratioParts(f);
        const rowHh = fs(25, 23);
        const n = COPY_FACTORS.length;
        const h = 38 + 22 + n * rowHh + 30;
        if (measure) return h;
        const gs = growState(now);
        const t = { alpha: AL.v, c: C.v };
        const ro = roles(t, r);
        const value = trig(f, r === 'a' ? p.al : 90 - p.al);
        const show = p.show;
        card({ ...R, h }, col.sim());
        cardTitle(R, say(L('Ähnliche Dreiecke', 'Similar triangles')), col.sim(), R.w >= 300 ? `\\c{s}{\\t{${say(L('gleicher Winkel', 'same angle'))}}}` : undefined);
        const x0 = R.x + pad;
        const wAll = R.w - 2 * pad;
        const cols = [0, 0.2, 0.47, 0.74].map((q) => x0 + q * wAll);
        const yH = R.y + 46;
        const hs = fs(12, 11);
        const hdr = [`\\c{s}{k}`, `\\c{${ROLE_KEY[num]}}{${sideOf(num, r)}}`, `\\c{${ROLE_KEY[den]}}{${sideOf(den, r)}}`, `${f} \\c{k}{${angName(r)}}`];
        hdr.forEach((src, i) => {
          const b = formula(g, src, fstyle(hs, theme.muted, 700));
          b.draw(g, cols[i]!, yH + (b.asc - b.desc) / 2);
        });
        g.strokeStyle = theme.grid;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x0, yH + 11);
        g.lineTo(x0 + wAll, yH + 11);
        g.stroke();
        const ok = (i: number) => (gs ? i < gs.stamped || (i === gs.stamped && gs.k > (i > 0 ? COPY_FACTORS[i - 1]! : 0) + 1e-6) : true);
        for (let i = 0; i < n; i++) {
          const kf = COPY_FACTORS[i]!;
          const y = yH + 22 + i * rowHh;
          const live = gs && i === gs.stamped && gs.stamped < n;
          const reached = gs ? i < gs.stamped : true;
          const kk = live ? gs!.k : kf;
          const a = gs ? (reached || live ? 1 : 0.25) : ease.outCubic(clamp01(k.stagger * (n + 2) - i));
          g.save();
          g.globalAlpha *= a;
          if (live || (gs && i === gs.stamped - 1 && gs.k === kf)) {
            g.fillStyle = withAlpha(col.sim(), theme.dark ? 0.16 : 0.1);
            roundRect(g, x0 - 6, y - rowHh / 2 + 2, wAll + 12, rowHh - 4, 6);
            g.fill();
          }
          const vs = (v: number, side: 'a' | 'b' | 'c') => (show || side === 'c' ? `${N(v)} cm` : '?');
          const cells = [
            `\\c{s}{${N(kk, 2)}}`,
            reached || live ? `\\c{${ROLE_KEY[num]}}{${vs(ro[num] * kk, sideOf(num, r))}}` : '…',
            reached || live ? `\\c{${ROLE_KEY[den]}}{${vs(ro[den] * kk, sideOf(den, r))}}` : '…',
            ok(i) ? (show ? `\\b{${N(value, 3)}}` : '?') : '…',
          ];
          cells.forEach((src, j) => {
            const b = formula(g, src, fstyle(fs(13, 12), theme.text, j === 3 ? 750 : 600));
            b.draw(g, cols[j]!, y + (b.asc - b.desc) / 2);
          });
          g.restore();
        }
        const msg = say(L('Seiten ändern sich, das Verhältnis bleibt.', 'Sides change, the ratio stays.'));
        const b = fit(`\\c{s}{\\t{${msg}}}`, wAll, fs(12.5, 11.5), col.sim(), 700);
        b.draw(g, x0, R.y + h - 14);
        return h;
      };
    }

    /** Graphen von sin, cos, tan von 0° bis 90° mit laufendem Punkt. */
    function graphCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const hh = clamp(R.h, 150, fs(220, 200));
        if (measure) return R.h < 150 ? 9999 : hh;
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const m = mode();
        card({ ...R, h: hh });
        cardTitle(R, say(L('Werte von 0° bis 90°', 'Values from 0° to 90°')), theme.muted);
        const x0 = R.x + pad + 26;
        const x1 = R.x + R.w - pad - 26;
        const y0 = R.y + 40;
        const y1 = R.y + hh - 24;
        const yMax = 2;
        const X = (d: number) => lerp(x0, x1, d / 90);
        const Y = (v: number) => lerp(y1, y0, v / yMax);
        const sf = `600 ${fs(11, 11)}px ${theme.font}`;
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        g.lineWidth = 1;
        g.font = sf;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        for (const v of [0.5, 1, 1.5, 2]) {
          g.strokeStyle = v === 1 ? theme.grid : theme.gridMinor;
          g.beginPath();
          g.moveTo(x0, Y(v));
          g.lineTo(x1, Y(v));
          g.stroke();
          g.textAlign = 'right';
          g.fillText(fmt.num(v, 1), x0 - 5, Y(v));
        }
        g.textAlign = 'center';
        g.textBaseline = 'top';
        for (const d of [0, 30, 45, 60, 90]) {
          g.strokeStyle = theme.gridMinor;
          g.beginPath();
          g.moveTo(X(d), y0);
          g.lineTo(X(d), y1);
          g.stroke();
          g.fillText(`${d}°`, X(d), y1 + 5);
        }
        g.strokeStyle = withAlpha(theme.text, 0.5);
        g.beginPath();
        g.moveTo(x0, y0 - 4);
        g.lineTo(x0, y1);
        g.lineTo(x1 + 4, y1);
        g.stroke();
        // Kurven
        const cur = m === 'unit' ? null : fn();
        const order: Fn[] = (['sin', 'cos', 'tan'] as Fn[]).sort((a, b) => (a === cur ? 1 : 0) - (b === cur ? 1 : 0));
        for (const f of order) {
          const on = cur === null || f === cur;
          const c = fnCol(f);
          g.strokeStyle = on ? c : withAlpha(c, 0.4);
          g.lineWidth = on ? 2.6 : 1.5;
          g.beginPath();
          let last: Px = [X(0), Y(trig(f, 0))];
          for (let i = 0; i <= 180; i++) {
            const d = (90 * i) / 180;
            const v = trig(f, d);
            if (!Number.isFinite(v) || v > yMax) break;
            const pt: Px = [X(d), Y(v)];
            if (i === 0) g.moveTo(pt[0], pt[1]);
            else g.lineTo(pt[0], pt[1]);
            last = pt;
          }
          g.stroke();
          const lx = f === 'cos' ? X(84) : f === 'tan' ? last[0] - 4 : X(86);
          const ly = f === 'cos' ? Y(trig('cos', 84)) - 10 : f === 'tan' ? last[1] + 2 : Y(trig('sin', 86)) - 10;
          g.font = `700 ${on ? 12 : 11}px ${theme.font}`;
          g.fillStyle = on ? c : withAlpha(c, 0.75);
          g.textAlign = f === 'tan' ? 'right' : 'center';
          g.textBaseline = f === 'tan' ? 'top' : 'middle';
          g.fillText(f, lx, ly);
        }
        // laufender Winkel
        let ang: number;
        let fns: Fn[];
        if (m === 'unit') {
          ang = shownAngle(now);
          fns = ['sin', 'cos', 'tan'];
        } else if (m === 'inv') {
          const res = invTri(GO.v, AN.v, HY.v);
          ang = res.angle;
          fns = [fn()];
          // rückwärts: waagrechte Linie beim Verhältnis, dann hinunter zum Winkel
          const v = res.value;
          const yv = Y(Math.min(v, yMax));
          const st = stepsK(now);
          const showA = p.show ? st[2]! : 0;
          g.save();
          g.strokeStyle = res.ok ? fnCol(fn()) : col.warn();
          g.lineWidth = 1.8;
          g.setLineDash([5, 4]);
          g.beginPath();
          g.moveTo(x0, yv);
          const xEnd = res.ok ? X(ang) : x1;
          g.lineTo(lerp(x0, xEnd, res.ok ? Math.max(0.35, showA) : 1), yv);
          g.stroke();
          if (res.ok && showA > 0.99) {
            g.beginPath();
            g.moveTo(X(ang), yv);
            g.lineTo(X(ang), y1);
            g.stroke();
            g.setLineDash([]);
            arrowHead([X(ang), y1], [0, 1], col.ang(), 7);
          }
          g.restore();
          const vs = v > yMax ? `${N(v, 3)} ↑` : N(v, 3);
          g.font = `700 11px ${theme.font}`;
          g.fillStyle = res.ok ? fnCol(fn()) : col.warn();
          g.textAlign = 'left';
          g.textBaseline = 'bottom';
          g.fillText(res.ok ? vs : `${vs} – ${say(L('kein Schnittpunkt', 'no intersection'))}`, x0 + 4, yv - 3);
          if (!res.ok) {
            g.restore();
            return hh;
          }
          if (!(p.show && showA > 0.99)) {
            g.restore();
            return hh;
          }
        } else {
          ang = ref() === 'a' ? AL.v : 90 - AL.v;
          fns = [fn()];
        }
        g.save();
        g.strokeStyle = withAlpha(col.ang(), 0.85);
        g.setLineDash([4, 3]);
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(X(ang), y0 - 2);
        g.lineTo(X(ang), y1);
        g.stroke();
        g.restore();
        for (const f of fns) {
          const v = trig(f, ang);
          if (Number.isFinite(v) && v <= yMax) dot(X(ang), Y(v), fnCol(f), 5);
          else {
            const xa = X(ang);
            g.fillStyle = fnCol(f);
            g.beginPath();
            g.moveTo(xa, y0 - 3);
            g.lineTo(xa - 6, y0 + 7);
            g.lineTo(xa + 6, y0 + 7);
            g.closePath();
            g.fill();
          }
        }
        const nm = m === 'unit' ? 'α' : angName(ref());
        const lsrc = `\\c{k}{${nm} = ${N(m === 'inv' ? ang : Math.round(ang), m === 'inv' ? 1 : 0)}°}`;
        const lb = formula(g, lsrc, fstyle(11.5, col.ang(), 700));
        const lx = clamp(X(ang) - lb.w / 2, x0 + 2, x1 - lb.w);
        lb.draw(g, lx, y0 - 6);
        g.restore();
        return hh;
      };
    }

    /** Einheitskreis: Strecken = Werte. */
    function unitCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const al = shownAngle(now);
        const s = Math.sin(rad(al));
        const c = Math.cos(rad(al));
        const t = trig('tan', al);
        const show = p.show;
        const v = (x: number) => (show ? (Number.isFinite(x) ? `${eq(x, 3)} ${N(x, 3)}` : `\\t{${say(L('n. def.', 'undef.'))}}`) : '= ?');
        const rows: Row[] = [
          { src: `\\c{o}{\\t{${say(ROLE_NAME.opp)}}} = \\f{\\c{o}{\\t{${say(L('GK', 'opp'))}}}}{\\c{h}{1}} = \\c{o}{sin α} ${v(s)}`, size: fs(13.5, 12.5), gap: 8 },
          { src: `\\c{a}{\\t{${say(ROLE_NAME.adj)}}} = \\f{\\c{a}{\\t{${say(L('AK', 'adj'))}}}}{\\c{h}{1}} = \\c{a}{cos α} ${v(c)}`, size: fs(13.5, 12.5), gap: 8 },
          { src: `\\c{t}{\\t{${say(L('Tangentenabschnitt', 'Tangent segment'))}}} = \\c{t}{tan α} ${v(t)}`, size: fs(13.5, 12.5), gap: 6 },
          { src: `\\c{m}{\\t{${say(L('T auf der Tangente x = 1: dort ist AK = 1.', 'T on the tangent x = 1: there adj = 1.'))}}}`, size: fs(12, 11), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Am Einheitskreis', 'On the unit circle')), col.hyp(), rows, `\\c{h}{c = 1}`);
      };
    }

    /** Zusammenhänge sin² + cos² = 1, tan = sin : cos, sin α = cos(90° − α). */
    function relCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const al = shownAngle(now);
        const s = Math.sin(rad(al));
        const c = Math.cos(rad(al));
        const show = p.show;
        const s2 = Math.round(s * s * 1000) / 1000;
        const c2 = Math.round((1 - s2) * 1000) / 1000;
        const ar = Math.round(al);
        const rows: Row[] = [
          { src: `(\\c{o}{sin α})² + (\\c{a}{cos α})² = \\c{h}{1}  \\c{m}{(\\t{Pythagoras})}`, size: fs(14, 13), gap: 4 },
          { src: show ? `\\c{m}{${N(s, 3)}² + ${N(c, 3)}² ≈ ${N(s2, 3)} + ${N(c2, 3)} = 1}` : `\\c{m}{\\t{Pythagoras: GK² + AK² = 1²}}`, size: fs(12, 11), color: th().muted, gap: 10 },
          { src: `\\c{t}{tan α} = \\f{\\c{o}{sin α}}{\\c{a}{cos α}}${show && c > 1e-6 ? ` = \\f{${N(s, 3)}}{${N(c, 3)}} ${eq(s / c, 3)} ${N(s / c, 3)}` : ''}`, size: fs(14, 13), gap: 10 },
          { src: `\\c{o}{sin α} = \\c{a}{cos(90° − α)}${show ? `:  sin ${ar}° = cos ${90 - ar}°` : ''}`, size: fs(14, 13) },
        ];
        return formulaCard(R, measure, k, say(L('Zusammenhänge', 'Relationships')), col.ang(), rows);
      };
    }

    /** Besondere Werte mit exakten Wurzeln. */
    function exactCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const rowHh = fs(30, 28);
        const h = 38 + 20 + SPECIAL_ANGLES.length * rowHh + 4;
        if (measure) return h;
        card({ ...R, h }, col.ang());
        cardTitle(R, say(L('Besondere Werte (exakt)', 'Special values (exact)')), col.ang());
        const x0 = R.x + pad;
        const wAll = R.w - 2 * pad;
        const cols = [0, 0.24, 0.5, 0.76].map((q) => x0 + q * wAll);
        const yH = R.y + 44;
        const al = shownAngle(now);
        ['α', 'sin α', 'cos α', 'tan α'].forEach((s, i) => {
          const b = formula(g, i === 0 ? `\\c{k}{${s}}` : `\\c{${['', 'o', 'a', 't'][i]}}{${s}}`, fstyle(fs(12, 11), theme.muted, 700));
          b.draw(g, cols[i]!, yH + (b.asc - b.desc) / 2);
        });
        SPECIAL_ANGLES.forEach((d, i) => {
          const y = yH + 20 + i * rowHh + rowHh / 2 - 4;
          const on = Math.abs(al - d) < 0.5;
          const a = ease.outCubic(clamp01(k.stagger * (SPECIAL_ANGLES.length + 2) - i));
          g.save();
          g.globalAlpha *= a;
          if (on) {
            g.fillStyle = withAlpha(col.ang(), theme.dark ? 0.2 : 0.13);
            roundRect(g, x0 - 6, y - rowHh / 2 + 1, wAll + 12, rowHh - 2, 6);
            g.fill();
          }
          const cells = [`${d}°`, exactSrc(exactValue('sin', d)), exactSrc(exactValue('cos', d)), exactSrc(exactValue('tan', d))];
          cells.forEach((src, j) => {
            const b = formula(g, src, fstyle(fs(13, 12), theme.text, j === 0 ? 700 : 600));
            b.draw(g, cols[j]!, y + (b.asc - b.desc) / 2);
          });
          g.restore();
        });
        return h;
      };
    }

    /** Rückwärts: Aufgabe. */
    function taskCard(k: Intro): CardFn {
      return (R, measure) => {
        const f = fn();
        const r = ref();
        const { num, den } = ratioParts(f);
        const vOf = (role: Role) => (role === 'opp' ? p.go : role === 'adj' ? p.an : p.hy);
        const sz = fs(13, 12);
        const givenLbl = `\\c{m}{\\t{${say(L('Gegeben', 'Given'))}}:}`;
        const sideNum = `${roleSrc(num)} = ${N(vOf(num), 1)} cm`;
        const sideDen = `${roleSrc(den)} = ${N(vOf(den), 1)} cm`;
        const oneRow = `${givenLbl}  ${sideNum},  ${sideDen}`;
        // passt die Zeile nicht in die Karte (Tablet, schmale Spalte), stehen die beiden Seiten untereinander
        const tooWide = formula(surface.g, oneRow, fstyle(sz, th().text, 600)).w > R.w - 2 * fs(14, 12);
        const rows: Row[] = [
          ...(tooWide ? [{ src: `${givenLbl}  ${sideNum}`, size: sz, gap: 4 }, { src: `\\c{m}{\\t{${say(L('und', 'and'))}}}  ${sideDen}`, size: sz, gap: 8 }] : [{ src: oneRow, size: sz, gap: 8 }]),
          { src: `\\c{m}{\\t{${say(L('Gesucht', 'Unknown'))}}:}  \\c{k}{${r === 'a' ? say(L('Winkel α bei A', 'angle α at A')) : say(L('Winkel β bei B', 'angle β at B'))}}`, size: sz },
        ];
        return formulaCard(R, measure, k, say(L('Aufgabe', 'Task')), col.ang(), rows);
      };
    }

    /** Rückwärts: Lösung Schritt für Schritt. */
    function stepsCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const f = fn();
        const r = ref();
        const { num, den } = ratioParts(f);
        const res = angleFromSides(f, p.go, p.an, p.hy);
        const vOf = (role: Role) => (role === 'opp' ? p.go : role === 'adj' ? p.an : p.hy);
        const A = angName(r);
        if (!res.ok) {
          return textCard(R, measure, k, say(L('Sonderfall', 'Special case')), col.warn(), [
            {
              s: say(
                L(
                  `${f} ${A} = ${N(vOf(num), 1)} : ${N(vOf(den), 1)} = ${N(res.value, 3)} – das geht nicht: Die Hypotenuse ist die längste Seite, also sind sin und cos immer kleiner als 1.`,
                  `${f} ${A} = ${N(vOf(num), 1)} : ${N(vOf(den), 1)} = ${N(res.value, 3)} – impossible: the hypotenuse is the longest side, so sin and cos are always less than 1.`,
                ),
              ),
              color: col.warn(),
              weight: 650,
            },
            { s: say(L('Der Taschenrechner meldet bei sin⁻¹ bzw. cos⁻¹ einen Fehler (Math ERROR).', 'The calculator shows an error for sin⁻¹ or cos⁻¹ (Math ERROR).')) },
          ]);
        }
        if (!p.show) {
          return textCard(R, measure, k, say(L('Lösung', 'Solution')), col.ang(), [
            { s: say(L('Welche Seiten sind gegeben? Wähle sin, cos oder tan, bilde das Verhältnis und nimm die Umkehrtaste.', 'Which sides are given? Choose sin, cos or tan, form the ratio and use the inverse key.')) },
            { s: say(L('„Schritt für Schritt lösen“ zeigt den Rechenweg.', '“Solve step by step” shows the working.')), color: th().muted },
          ]);
        }
        const st = stepsK(now);
        const third: Role = (['opp', 'adj', 'hyp'] as Role[]).find((x) => x !== num && x !== den)!;
        const thirdV = third === 'opp' ? res.opp : third === 'adj' ? res.adj : res.hyp;
        const other = 90 - res.angle;
        const rows: Row[] = [
          { src: `\\c{m}{① ${roleSrc(num)} \\t{${say(L('und', 'and'))}} ${roleSrc(den)} ⇒ \\t{${f === 'sin' ? say(L('Sinus', 'sine')) : f === 'cos' ? say(L('Kosinus', 'cosine')) : say(L('Tangens', 'tangent'))}}}`, size: fs(12, 11), color: th().muted, at: st[0], gap: 6 },
          { src: `② ${f} \\c{k}{${A}} = \\f{\\c{${ROLE_KEY[num]}}{${N(vOf(num), 1)} cm}}{\\c{${ROLE_KEY[den]}}{${N(vOf(den), 1)} cm}} ${eq(res.value, 4)} ${N(res.value, 4)}`, size: fs(14, 13), at: st[1], gap: 8 },
          { src: `③ \\c{k}{${A}} = ${f}^{−1}(${N(res.value, 4)})`, size: fs(14, 13), at: st[2], gap: 8 },
          { src: `④ \\c{k}{${A} ${eq(res.angle, 2)} \\b{${N(res.angle, 2)}°}}`, size: fs(15, 14), at: st[3], gap: 8 },
        ];
        // Rest: dritte Seite und zweiter Winkel; zu breit für die Karte → zwei Zeilen
        const restSide = `\\c{m}{\\t{${say(L('Rest', 'Remaining'))}}: ${roleSrc(third)} ${eq(thirdV)} ${N(thirdV)} cm (\\t{Pythagoras})`;
        const restAng = `${r === 'a' ? 'β' : 'α'} = 90° − ${N(res.angle, 2)}° ${eq(other, 2)} ${N(other, 2)}°}`;
        const restSz = fs(12, 11);
        const restOne = `${restSide}, ${restAng}`;
        if (formula(surface.g, restOne, fstyle(restSz, th().muted, 600)).w <= R.w - 2 * fs(14, 12)) rows.push({ src: restOne, size: restSz, color: th().muted, at: st[4] });
        else rows.push({ src: `${restSide}}`, size: restSz, color: th().muted, at: st[4], gap: 4 }, { src: `\\c{m}{${restAng}`, size: restSz, color: th().muted, at: st[4] });
        return formulaCard(R, measure, k, say(L('Lösung Schritt für Schritt', 'Solution step by step')), col.ang(), rows);
      };
    }

    /** Anwendungen: Rechnung. */
    function appCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const a = app();
        const show = p.show;
        const st = (i: number, n: number) => storyK(now, i, n);
        const m = (v: number, d = 2) => `${N(v, d)} ${M}`;
        let rows: Row[];
        if (a === 'ramp') {
          const rp = ramp(p.pc, p.rh);
          rows = [
            { src: `\\c{o}{p} = \\f{\\c{o}{h}}{\\c{a}{l}} · 100 %  ⇒  \\c{k}{tan α} = \\f{${N(p.pc, 1)}}{100} = ${N(p.pc / 100, 3)}`, size: fs(13.5, 12.5), gap: 10, at: st(0, 4) },
            { src: show ? `\\c{k}{α} = tan^{−1}(${N(p.pc / 100, 3)}) ${eq(rp.angle)} \\c{k}{\\b{${N(rp.angle, 2)}°}}` : `\\c{k}{α} = tan^{−1}(${N(p.pc / 100, 3)}) = ?`, size: fs(13.5, 12.5), gap: 10, at: st(1, 4) },
            { src: show ? `\\c{a}{l} = \\f{\\c{o}{h}}{tan α} = \\f{${m(p.rh)}}{${N(p.pc / 100, 3)}} ${eq(rp.run)} \\c{a}{\\b{${m(rp.run)}}}` : `\\c{a}{l} = \\f{\\c{o}{h}}{tan α} = ?`, size: fs(13.5, 12.5), gap: 10, at: st(2, 4) },
            { src: show ? `\\c{h}{s} = \\r{\\c{a}{l}² + \\c{o}{h}²} ${eq(rp.slope)} \\c{h}{${m(rp.slope)}}` : `\\c{h}{s} = \\r{\\c{a}{l}² + \\c{o}{h}²} = ?`, size: fs(13.5, 12.5), at: st(3, 4) },
          ];
          return formulaCard(R, measure, k, say(L('Rechnung', 'Calculation')), col.ang(), rows, `\\c{k}{${N(p.pc, 1)} % ≠ ${N(p.pc, 1)}°}`);
        }
        if (a === 'ladder') {
          const ld = ladder(p.ll, p.al);
          rows = [
            { src: `\\c{k}{sin α} = \\f{\\c{o}{h}}{\\c{h}{L}}  ⇒  \\c{o}{h} = \\c{h}{L} · sin α`, size: fs(13.5, 12.5), gap: 6, at: st(0, 3) },
            { src: show ? `\\c{o}{h} = ${m(p.ll, 1)} · sin ${p.al}° ${eq(ld.height)} \\c{o}{\\b{${m(ld.height)}}}` : `\\c{o}{h} = ${m(p.ll, 1)} · sin ${p.al}° = ?`, size: fs(13.5, 12.5), gap: 12, at: st(1, 3) },
            { src: `\\c{k}{cos α} = \\f{\\c{a}{e}}{\\c{h}{L}}  ⇒  \\c{a}{e} = \\c{h}{L} · cos α`, size: fs(13.5, 12.5), gap: 6, at: st(1, 3) },
            { src: show ? `\\c{a}{e} = ${m(p.ll, 1)} · cos ${p.al}° ${eq(ld.foot)} \\c{a}{\\b{${m(ld.foot)}}}` : `\\c{a}{e} = ${m(p.ll, 1)} · cos ${p.al}° = ?`, size: fs(13.5, 12.5), at: st(2, 3) },
          ];
          return formulaCard(R, measure, k, say(L('Rechnung', 'Calculation')), col.ang(), rows);
        }
        const tw = tower(p.d, p.al);
        rows = [
          { src: `\\c{k}{tan α} = \\f{\\c{o}{x}}{\\c{a}{d}}  ⇒  \\c{o}{x} = \\c{a}{d} · tan α`, size: fs(13.5, 12.5), gap: 8, at: st(0, 3) },
          { src: show ? `\\c{o}{x} = ${m(p.d, 0)} · tan ${p.al}° ${eq(tw.above)} \\c{o}{${m(tw.above)}}` : `\\c{o}{x} = ${m(p.d, 0)} · tan ${p.al}° = ?`, size: fs(13.5, 12.5), gap: 10, at: st(1, 3) },
          { src: show ? `\\c{s}{h} = \\c{o}{x} + ${m(EYE_HEIGHT, 1)} ${eq(tw.height)} \\c{s}{\\b{${m(tw.height)}}}` : `\\c{s}{h} = \\c{o}{x} + ${m(EYE_HEIGHT, 1)} = ?`, size: fs(14, 13), at: st(2, 3) },
        ];
        return formulaCard(R, measure, k, say(L('Rechnung', 'Calculation')), col.ang(), rows);
      };
    }

    /** Anwendungen: Hinweise. */
    function appInfoCard(k: Intro): CardFn {
      return (R, measure) => {
        const a = app();
        if (a === 'ramp') {
          const deg6 = percentFromAngle(p.pc);
          return textCard(R, measure, k, say(L('Prozent oder Grad?', 'Percent or degrees?')), col.opp(), [
            { s: say(L(`Steigung ${N(p.pc, 1)} % heißt: ${N(p.pc, 1)} m Höhe auf 100 m waagrechte Strecke. Der Winkel ist viel kleiner als ${N(p.pc, 1)}°.`, `A gradient of ${N(p.pc, 1)} % means ${N(p.pc, 1)} m rise per 100 m horizontal run. The angle is much smaller than ${N(p.pc, 1)}°.`)) },
            { s: say(L(`Zum Vergleich: ${N(p.pc, 1)}° wären tan ${N(p.pc, 1)}° ≈ ${N(deg6, 1)} %. 100 % sind 45°.`, `For comparison: ${N(p.pc, 1)}° would be tan ${N(p.pc, 1)}° ≈ ${N(deg6, 1)} %. 100 % is 45°.`)), color: th().muted },
            { s: say(L('Rollstuhlgerechte Rampen dürfen höchstens 6 % steigen (DIN 18040).', 'In Germany, wheelchair ramps may rise by at most 6 % (DIN 18040).')), color: p.pc <= 6 ? col.ok() : col.warn(), weight: 650 },
          ]);
        }
        if (a === 'ladder') {
          return textCard(R, measure, k, say(L('Sicher anlehnen', 'Safe angle')), col.ok(), [
            { s: say(L('Faustregel für Anlegeleitern: Anstellwinkel etwa zwischen 65° und 75° (grüner Bereich).', 'Rule of thumb for leaning ladders: an angle between about 65° and 75° (green area).')) },
            { s: say(L('Zu flach rutscht der Fuß weg, zu steil kann die Leiter nach hinten kippen.', 'Too flat and the foot slips, too steep and the ladder can tip backwards.')), color: th().muted },
            { s: say(L('Ziehe den Fuß oder das obere Ende der Leiter.', 'Drag the foot or the top of the ladder.')), color: th().muted },
          ]);
        }
        return textCard(R, measure, k, say(L('Höhenwinkel messen', 'Measuring the elevation')), col.sim(), [
          { s: say(L('Der Höhenwinkel wird in Augenhöhe gemessen – zwischen der Waagrechten und der Visierlinie zur Turmspitze.', 'The angle of elevation is measured at eye level – between the horizontal and the line of sight to the top.')) },
          { s: say(L(`Deshalb kommt am Ende die Höhe des Messgeräts (${N(EYE_HEIGHT, 1)} m) dazu.`, `That is why the height of the instrument (${N(EYE_HEIGHT, 1)} m) is added at the end.`)), color: col.sim(), weight: 650 },
          { s: say(L('Ziehe den Beobachter oder die Turmspitze.', 'Drag the observer or the top of the tower.')), color: th().muted },
        ]);
      };
    }

    function cardsFor(now: number, k: Intro): CardFn[] {
      const m = mode();
      if (m === 'tri') return [ratioCard(now, k), simCard(now, k), graphCard(now, k)];
      // Reihenfolge = Vorrang bei wenig Platz: Die Tabelle der besonderen Werte (im Lernmaterial genannt) vor den Zusammenhängen
      if (m === 'unit') return [unitCard(now, k), exactCard(now, k), relCard(now, k), graphCard(now, k)];
      if (m === 'inv') return [taskCard(k), stepsCard(now, k), graphCard(now, k)];
      return [appCard(now, k), appInfoCard(k)];
    }

    function drawColumn(Cr: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const list = cardsFor(now, k);
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !regions().wide && Cr.w >= 460;
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
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    const roleHtml = (r: Role) => say(ROLE_NAME[r]);
    function updateReadouts(): void {
      for (const key of ['sides', 'vals', 'res']) ctx.readout(key, null);
      const m = mode();
      const r = ref();
      const f = fn();
      const A = angName(r);
      if (m === 'tri') {
        const t = { alpha: p.al, c: p.c };
        const ro = roles(t, r);
        const s = { a: r === 'a' ? ro.opp : ro.adj, b: r === 'a' ? ro.adj : ro.opp };
        ctx.readout('sides', {
          html: `${v('a')} ${eq(s.a)} ${N(s.a)} cm (${roleHtml(roleOf('a', r))}), ${v('b')} ${eq(s.b)} ${N(s.b)} cm (${roleHtml(roleOf('b', r))}), ${v('c')} = ${N(p.c)} cm (${roleHtml('hyp')})`,
        });
        const ang = r === 'a' ? p.al : 90 - p.al;
        ctx.readout('vals', { html: (['sin', 'cos', 'tan'] as Fn[]).map((x) => `${x} ${ang}° ${eq(trig(x, ang), 3)} ${N(trig(x, ang), 3)}`).join(' · ') });
        const { num, den } = ratioParts(f);
        const value = trig(f, ang);
        ctx.readout('res', { html: `${f} ${v(A)} = ${frac(roleHtml(num), roleHtml(den))} = ${frac(`${N(ro[num])} cm`, `${N(ro[den])} cm`)} ${eq(value, 3)} <strong>${N(value, 3)}</strong>` });
      } else if (m === 'unit') {
        const s = trig('sin', p.al);
        const c = trig('cos', p.al);
        ctx.readout('vals', { html: `sin ${p.al}° ${eq(s, 3)} ${N(s, 3)} · cos ${p.al}° ${eq(c, 3)} ${N(c, 3)} · tan ${p.al}° ${eq(s / c, 3)} ${N(s / c, 3)}` });
        ctx.readout('res', { html: `(sin ${v('α')})<sup>2</sup> + (cos ${v('α')})<sup>2</sup> = 1 · tan ${v('α')} = ${frac(`sin ${v('α')}`, `cos ${v('α')}`)} · sin ${p.al}° = cos ${90 - p.al}°` });
      } else if (m === 'inv') {
        const res = angleFromSides(f, p.go, p.an, p.hy);
        const { num, den } = ratioParts(f);
        const vOf = (role: Role) => (role === 'opp' ? p.go : role === 'adj' ? p.an : p.hy);
        ctx.readout('sides', { html: `${roleHtml(num)} = ${N(vOf(num), 1)} cm, ${roleHtml(den)} = ${N(vOf(den), 1)} cm` });
        if (res.ok) ctx.readout('res', { html: `${f} ${v(A)} = ${frac(`${N(vOf(num), 1)} cm`, `${N(vOf(den), 1)} cm`)} ${eq(res.value, 4)} ${N(res.value, 4)} ⇒ ${v(A)} = ${f}<sup>−1</sup>(${N(res.value, 4)}) ${eq(res.angle)} <strong>${N(res.angle, 2)}°</strong>` });
        else ctx.readout('res', { html: say(L(`${f} ${A} = ${N(res.value, 3)} > 1 – kein Dreieck möglich`, `${f} ${A} = ${N(res.value, 3)} > 1 – no triangle possible`)) });
      } else {
        const a = app();
        if (a === 'ramp') {
          const rp = ramp(p.pc, p.rh);
          ctx.readout('sides', { html: `${v('p')} = ${N(p.pc, 1)} %, ${v('h')} = ${N(p.rh)} m` });
          ctx.readout('res', { html: `tan ${v('α')} = ${N(p.pc / 100, 3)} ⇒ ${v('α')} ${eq(rp.angle)} <strong>${N(rp.angle, 2)}°</strong> · ${v('l')} = ${frac(v('h'), `tan ${v('α')}`)} ${eq(rp.run)} <strong>${N(rp.run)} m</strong> · ${v('s')} ${eq(rp.slope)} ${N(rp.slope)} m` });
        } else if (a === 'ladder') {
          const ld = ladder(p.ll, p.al);
          ctx.readout('sides', { html: `${v('L')} = ${N(p.ll, 1)} m, ${v('α')} = ${p.al}°` });
          ctx.readout('res', { html: `${v('h')} = ${v('L')} · sin ${v('α')} ${eq(ld.height)} <strong>${N(ld.height)} m</strong> · ${v('e')} = ${v('L')} · cos ${v('α')} ${eq(ld.foot)} <strong>${N(ld.foot)} m</strong>` });
        } else {
          const tw = tower(p.d, p.al);
          ctx.readout('sides', { html: `${v('d')} = ${N(p.d, 0)} m, ${v('α')} = ${p.al}°, ${say(L('Augenhöhe', 'eye level'))} ${N(EYE_HEIGHT, 1)} m` });
          ctx.readout('res', { html: `${v('h')} = ${v('d')} · tan ${v('α')} + ${N(EYE_HEIGHT, 1)} m ${eq(tw.height)} <strong>${N(tw.height)} m</strong>` });
        }
      }
    }

    /* ---------- Rendern ---------- */
    function drawScene(s: Scene, now: number, k: Intro, alpha: number): void {
      if (s === 'tri') drawTri(now, k, alpha);
      else if (s === 'unit') drawUnit(now, k, alpha);
      else if (s === 'inv') drawInv(now, k, alpha);
      else if (s === 'ramp') drawRamp(now, k, alpha);
      else if (s === 'ladder') drawLadder(now, k, alpha);
      else drawTower(now, k, alpha);
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
      if (grow && now - grow.t0 > GROW_END) grow = null;
      if (sweep && now - sweep.t0 > sweepEnd()) sweep = null;
      if (steps && now - steps.t0 > STEPS_END + 400) steps = null;
      if (story && now - story.t0 > STORY_END) story = null;
      if (grow || sweep || steps || story || intro !== null) anim = true;
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
    function retarget(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const targets: [Chan, number][] = [
        [AL, p.al],
        [C, p.c],
        [GO, p.go],
        [AN, p.an],
        [HY, p.hy],
        [PC, p.pc],
        [RH, p.rh],
        [LL, p.ll],
        [D, p.d],
      ];
      targets.forEach(([c, val], i) => {
        if (instant) c.jump(val);
        else if (dragging()) c.follow(val, 0.05);
        else if (source === 'replace') c.glide(val, 850, i * 25, now);
        else if (Math.abs(c.goal - val) > 1e-12) c.follow(val, 0.16);
      });
      const flags: [Chan, number, number][] = [
        [WREF, ref() === 'b' ? 1 : 0, 900],
        [WSIM, p.sim ? 1 : 0, 500],
        [WSHOW, p.show ? 1 : 0, 400],
        [ON.opp, onGoal('opp'), 500],
        [ON.adj, onGoal('adj'), 500],
        [ON.hyp, onGoal('hyp'), 500],
      ];
      for (const [c, val, dur] of flags) {
        if (instant) c.jump(val);
        else if (c.goal !== val) c.glide(val, dur, 0, now);
      }
    }

    function cancelStories(): void {
      grow = null;
      sweep = null;
      steps = null;
      story = null;
    }

    function startStoryFor(now: number): void {
      if (reduced()) return;
      const m = mode();
      if (m === 'tri') grow = { t0: now };
      else if (m === 'unit') sweep = { t0: now, back: p.al };
      else if (m === 'inv') {
        if (angleFromSides(fn(), p.go, p.an, p.hy).ok && p.show) steps = { t0: now };
      } else story = { t0: now };
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): HitId | null {
      if (ctx.locked) return null;
      let best: HitId | null = null;
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

    const roundTo = (x: number, step: number) => Math.round(x / step) * step;
    function dragTo(id: HitId, px: number, py: number): void {
      lastDrag = performance.now();
      if (id === 'B') {
        const w = toWorld(viewOf('tri'), px, py);
        const al = clamp(Math.round(Math.atan2(Math.max(w[1], 0.01), Math.max(w[0], 0.01)) / DEG), 5, 85);
        const c = clamp(roundTo(Math.hypot(w[0], w[1]), 0.5), 2, 10);
        ctx.set({ al, c });
      } else if (id === 'P' || id === 'T') {
        const w = toWorld(viewOf('unit'), px, py);
        const a = id === 'P' ? Math.atan2(w[1], w[0]) / DEG : Math.atan(Math.max(0, w[1])) / DEG;
        ctx.set({ al: clamp(Math.round(a), 5, 85) });
      } else if (id === 'rTop') {
        const w = toWorld(viewOf('ramp'), px, py);
        // Höhe ändern, waagrechte Länge bleibt → Steigung passt sich an
        const run = ramp(p.pc, p.rh).run;
        const h = clamp(roundTo(w[1], 0.05), 0.1, 1.5);
        ctx.set({ rh: h, pc: clamp(roundTo((h / run) * 100, 0.5), 2, 30) });
      } else if (id === 'rFoot') {
        const w = toWorld(viewOf('ramp'), px, py);
        const run = ramp(p.pc, p.rh).run;
        const newRun = Math.max(0.2, run - w[0]);
        ctx.set({ pc: clamp(roundTo((p.rh / newRun) * 100, 0.5), 2, 30) });
      } else if (id === 'lTop') {
        const w = toWorld(viewOf('ladder'), px, py);
        ctx.set({ al: clamp(Math.round(Math.asin(clamp(w[1] / p.ll, 0, 1)) / DEG), 5, 85) });
      } else if (id === 'lFoot') {
        const w = toWorld(viewOf('ladder'), px, py);
        ctx.set({ al: clamp(Math.round(Math.acos(clamp(-w[0] / p.ll, 0, 1)) / DEG), 5, 85) });
      } else if (id === 'obs') {
        const w = toWorld(viewOf('tower'), px, py);
        const tw = tower(p.d, p.al);
        // Beobachter verschieben: Turm bleibt gleich hoch, Höhenwinkel passt sich an
        const d = clamp(Math.round(p.d - w[0]), 10, 200);
        ctx.set({ d, al: clamp(Math.round(Math.atan(tw.above / d) / DEG), 5, 85) });
      } else if (id === 'top') {
        const w = toWorld(viewOf('tower'), px, py);
        ctx.set({ al: clamp(Math.round(Math.atan(Math.max(0.1, w[1] - EYE_HEIGHT) / p.d) / DEG), 5, 85) });
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const id = hitAt(pt.px, pt.py);
        if (!id) return false;
        if (TAPS.includes(id)) {
          const r: Ref = id === 'angA' ? 'a' : 'b';
          if (r !== ref()) ctx.set({ ref: r });
          return true;
        }
        drag = id;
        cancelStories();
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
        surface.setCursor(hover ? (TAPS.includes(hover) ? 'pointer' : 'grab') : '');
        retargetViews(performance.now(), false);
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const id = pt ? hitAt(pt.px, pt.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? (TAPS.includes(id) ? 'pointer' : drag ? 'grabbing' : 'grab') : '');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        const now = performance.now();
        const m = mode();
        // beim eigenen Themenwechsel das Dreieck möglichst übernehmen
        if (source === 'input' && changed.has('mode')) {
          if (m === 'inv' && prevMode === 'tri') {
            const ro = roles({ alpha: p.al, c: p.c }, ref());
            const r1 = (x: number) => clamp(Math.round(x * 10) / 10, 0.5, 12);
            ctx.set({ go: r1(ro.opp), an: r1(ro.adj), hy: r1(ro.hyp) });
          } else if (m === 'tri' && prevMode === 'inv') {
            const res = angleFromSides(fn(), p.go, p.an, p.hy);
            if (res.ok) {
              const alpha = ref() === 'a' ? res.angle : 90 - res.angle;
              ctx.set({ al: clamp(Math.round(alpha), 5, 85), c: clamp(roundTo(res.hyp, 0.5), 2, 10) });
            }
          }
        }
        if (source === 'input' && (changed.has('app') || changed.has('mode')) && m === 'app') {
          if (app() === 'ladder' && (p.al < 50 || p.al > 85)) ctx.set({ al: 70 });
          if (app() === 'tower' && p.al > 60) ctx.set({ al: 32 });
        }
        if (source === 'input' || source === 'replace') {
          if ([...changed].some((key) => key !== 'show' && key !== 'sim' && key !== 'ref')) cancelStories();
          if (changed.has('ref') && mode() !== 'inv') steps = null;
        }
        retarget(now, source);
        const sc = scene();
        if (source !== 'init' && sc !== prevScene) {
          if (!reduced()) {
            sceneFade = { from: prevScene, t0: now };
            cardFade = now;
          }
          if (m === 'app') startStoryFor(now);
        } else if (source !== 'init' && changed.has('f') && !reduced()) cardFade = now;
        if (source === 'replace' && m === 'app') startStoryFor(now);
        if (!dragging()) retargetViews(now, source === 'init');
        if (source === 'init') {
          if (!reduced()) intro = now;
          lastSize = { w: surface.width, h: surface.height };
        }
        prevMode = m;
        prevScene = sc;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'swap') {
          ctx.set({ ref: ref() === 'a' ? 'b' : 'a' });
        } else if (id === 'grow') {
          cancelStories();
          if (!reduced()) grow = { t0: now };
        } else if (id === 'sweep') {
          cancelStories();
          if (!reduced()) sweep = { t0: now, back: p.al };
        } else if (id === 'solve') {
          if (!p.show) ctx.set({ show: true });
          cancelStories();
          startStoryFor(now);
        } else if (id === 'calc') {
          if (!p.show) ctx.set({ show: true });
          cancelStories();
          startStoryFor(now);
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
