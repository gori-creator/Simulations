import { defineSimulation, drawCard, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  AFFINE_ID,
  anchors,
  base,
  domainOf,
  effectOf,
  formFromPoint,
  keyPoints,
  mapAffine,
  mapPoint,
  randomTask,
  rangeOf,
  sineData,
  stageAffines,
  stages,
  stepKeys,
  storyAt,
  neutralSteps,
  storyDuration,
  storyPlan,
  storyPos,
  storyTimeOf,
  swappedResult,
  symmetryOf,
  toAffine,
  withoutB,
  yIntercept,
  zerosIn,
  type Affine,
  type Base,
  type NumSet,
  type Order,
  type StepKey,
  type Trafo,
} from './model';

const L = (de: string, en: string) => ({ de, en });
/** Werte sichtbar? Im Aufgabenmodus (`info=0`) sind die Regler a, b, c, d ausgeblendet, sonst wäre die Lösung ablesbar. */
const shown = (v: Record<string, unknown>) => v.info !== false;
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Key = StepKey;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const near = (v: number, x: number) => Math.abs(v - x) < 1e-9;

type Target = Parameters<Surface['addTarget']>[0];
type Ptr = Parameters<Target['pointerDown']>[0];

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

/** Grundfunktionen: Term in Kurzschrift (u = Inneres, atom = ohne Klammern verwendbar) und Name. */
const BASES: Record<Base, { f: (u: string, atom: boolean) => string; name: Txt; label: number[] }> = {
  sq: { f: (u, at) => (at ? `${u}^2` : `(${u})^2`), name: L('Normalparabel', 'Square function'), label: [1.7, -1.7, 1.2] },
  cub: { f: (u, at) => (at ? `${u}^3` : `(${u})^3`), name: L('Kubische Parabel', 'Cubic function'), label: [1.25, -1.25, 0.9] },
  sqrt: { f: (u) => `\\r{${u}}`, name: L('Wurzelfunktion', 'Square root function'), label: [5, 3, 2] },
  abs: { f: (u) => `|${u}|`, name: L('Betragsfunktion', 'Absolute value function'), label: [2.6, -2.6, 1.5] },
  inv: { f: (u) => `\\f{1}{${u}}`, name: L('Kehrwertfunktion', 'Reciprocal function'), label: [0.45, 2.5, -0.45] },
  sin: { f: (u) => `\\t{sin}(${u})`, name: L('Sinusfunktion', 'Sine function'), label: [Math.PI / 2, 2.2, -1.5] },
  exp: { f: (u) => `2^{${u}}`, name: L('Exponentialfunktion 2ˣ', 'Exponential function 2ˣ'), label: [1.9, 1.5, -2.5] },
};

/** Vielfache von π als Formel (π/2 → Bruch), sonst null. */
function piSrc(v: number): string | null {
  const k = v / Math.PI;
  if (Math.abs(k) < 1e-12) return null;
  for (const d of [1, 2, 3, 4, 6, 8, 12]) {
    const n = Math.round(k * d);
    if (n !== 0 && Math.abs(k * d - n) < 1e-7) {
      let g = Math.abs(n);
      let h = d;
      while (h) [g, h] = [h, g % h];
      const num = Math.abs(n) / g;
      const den = d / g;
      const top = num === 1 ? 'π' : `${num}π`;
      const body = den === 1 ? top : `\\f{${top}}{${den}}`;
      return n < 0 ? `−${body}` : body;
    }
  }
  return null;
}

/**
 * Graphen verschieben, strecken und spiegeln: g(x) = a · f(b(x − c)) + d für
 * sieben Grundfunktionen. Herzstück ist die Schrittfolge auf einer Zeitleiste
 * (Uhr): f → f(bx) → f(b(x − c)) → a·f(b(x − c)) → … + d. Der Graph morpht
 * dabei stetig, markante Punkte gleiten auf ihren Bahnen, die wirkende Stufe ist
 * in den Karten hervorgehoben und im Bild erklärt (Streckpfeile parallel zur
 * Achse, aufleuchtende Spiegelachse, Verschiebungsvektor). Zum Vergleich läuft
 * auf Wunsch die falsche Reihenfolge „erst verschieben, dann strecken“, die zu
 * f(bx − c) führt. Ankerpunkt (c | d) und Formpunkt sind ziehbar (auch über die
 * Achsen hinweg: Spiegelung). Karten: Term mit Farbcodierung, Wirkung der
 * Parameter als Sätze, Punkttabelle f → g, Eigenschaften von g. Mit „Term und
 * Wirkung zeigen“ aus wird daraus die Aufgabe „Term erraten“.
 */
export default defineSimulation({
  id: 'transformationen',
  dragHint: true,
  hint: { de: 'Tipp: Zieh den runden Ankerpunkt zum Verschieben, den rautenförmigen zum Strecken.', en: 'Tip: Drag the round anchor point to shift and the diamond-shaped one to stretch.' },
  animated: true,
  layout: { aspect: 1.3, aspectNarrow: 0.36 },
  groups: [
    { id: 'par', label: L('Parameter', 'Parameters') },
    { id: 'steps', label: L('Schritt für Schritt', 'Step by step') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'f',
      type: 'choice',
      label: L('Grundfunktion f', 'Basic function f'),
      options: [
        { value: 'sq', label: L('x²', 'x²') },
        { value: 'cub', label: L('x³', 'x³') },
        { value: 'sqrt', label: L('√x', '√x') },
        { value: 'abs', label: L('|x|', '|x|') },
        { value: 'inv', label: L('1/x', '1/x') },
        { value: 'sin', label: L('sin x', 'sin x') },
        { value: 'exp', label: L('2ˣ', '2ˣ') },
      ],
      default: 'sq',
    },
    {
      key: 'a',
      type: 'number',
      group: 'par',
      label: L('a (Streckung in y-Richtung)', 'a (vertical stretch)'),
      help: L('a < 0: Spiegelung an der x-Achse. Auch am rautenförmigen Formpunkt im Bild ziehen.', 'a < 0: reflection in the x-axis. You can also drag the diamond-shaped shape point.'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 2,
      visibleIf: shown,
    },
    {
      key: 'b',
      type: 'number',
      group: 'par',
      label: L('b (Streckung in x-Richtung mit Faktor 1/b)', 'b (horizontal stretch by factor 1/b)'),
      help: L('b < 0: Spiegelung an der y-Achse; b = 0 ist nicht erlaubt.', 'b < 0: reflection in the y-axis; b = 0 is not allowed.'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 1,
      visibleIf: shown,
    },
    {
      key: 'c',
      type: 'number',
      group: 'par',
      label: L('c (Verschiebung in x-Richtung)', 'c (horizontal shift)'),
      help: L('Auch den runden Ankerpunkt (c | d) im Bild ziehen.', 'You can also drag the round anchor point (c, d).'),
      min: -5,
      max: 5,
      step: 0.1,
      default: 1,
      visibleIf: shown,
    },
    { key: 'd', type: 'number', group: 'par', label: L('d (Verschiebung in y-Richtung)', 'd (vertical shift)'), min: -5, max: 5, step: 0.1, default: -2, visibleIf: shown },
    {
      key: 'ord',
      type: 'choice',
      group: 'steps',
      label: L('Reihenfolge der Schritte', 'Order of the steps'),
      options: [
        { value: 'std', label: L('erst strecken (b), dann verschieben (c)', 'first stretch (b), then shift (c)') },
        { value: 'swap', label: L('Vergleich: erst verschieben, dann strecken', 'Comparison: first shift, then stretch') },
      ],
      default: 'std',
      visibleIf: (v) => v.info === true,
    },
    { key: 'base', type: 'boolean', group: 'view', label: L('Grundfunktion f zeigen', 'Show the basic function f'), default: true },
    { key: 'pts', type: 'boolean', group: 'view', label: L('Markante Punkte mit Pfeilen', 'Key points with arrows'), default: true },
    {
      key: 'info',
      type: 'boolean',
      group: 'view',
      label: L('Term und Wirkung zeigen', 'Show the term and the effects'),
      help: L('Aus: Aufgabe „Welcher Term gehört zum Graphen?“', 'Off: task “Which term belongs to the graph?”'),
      default: true,
    },
    // Zusatzkarten (aus, damit im Bild höchstens Term und Schrittfolge stehen)
    { key: 'tbl', type: 'boolean', group: 'view', label: L('Tabelle: Punkte von f und ihre Bildpunkte', 'Table: points of f and their images'), default: false, visibleIf: (v) => v.info === true },
    { key: 'props', type: 'boolean', group: 'view', label: L('Eigenschaften von g', 'Properties of g'), default: false, visibleIf: (v) => v.info === true },
  ],
  actions: [
    { id: 'steps', label: L('Schritt für Schritt abspielen', 'Play step by step'), primary: true, visibleIf: (v) => v.info === true },
    { id: 'prev', label: L('◀ Schritt zurück', '◀ Step back'), visibleIf: (v) => v.info === true },
    { id: 'next', label: L('Schritt vor ▶', 'Step forward ▶'), visibleIf: (v) => v.info === true },
    { id: 'reveal', label: L('Term aufdecken', 'Reveal the term'), primary: true, visibleIf: (v) => v.info !== true },
    { id: 'task', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.info !== true },
  ],
  readouts: [
    { key: 'g', label: L('Funktionsterm', 'Function'), spoiler: true },
    { key: 'map', label: L('Punkte', 'Points'), spoiler: true },
    { key: 'prop', label: L('Eigenschaften', 'Properties'), spoiler: true },
  ],
  resultsParam: 'info',
  presets: [
    { id: 'start', label: L('Verschobene, gestreckte Parabel', 'Shifted, stretched parabola'), values: {} },
    { id: 'sqrt', label: L('Wurzel: Spiegeln an der y-Achse', 'Square root: reflecting in the y-axis'), values: { f: 'sqrt', a: 1, b: -1, c: 2, d: 0 } },
    { id: 'sin', label: L('Sinus: Periode und Amplitude', 'Sine: period and amplitude'), values: { f: 'sin', a: 2, b: 2, c: 0, d: 1 } },
    { id: 'inv', label: L('Hyperbel mit Asymptoten', 'Hyperbola with asymptotes'), values: { f: 'inv', a: 2, b: 1, c: -1, d: 1 } },
    { id: 'exp', label: L('Exponentialfunktion gespiegelt', 'Reflected exponential function'), values: { f: 'exp', a: -1, b: 1, c: 1, d: 3 } },
    { id: 'order', label: L('Stolperstein: f(2x − 1) ≠ f(2(x − 1))', 'Pitfall: f(2x − 1) ≠ f(2(x − 1))'), values: { a: 1, b: 2, c: 1, d: 0, ord: 'swap' } },
    { id: 'guess', label: L('Aufgabe: Welcher Term gehört zum Graphen?', 'Task: which term belongs to the graph?'), values: { f: 'abs', a: -0.5, b: 1, c: -2, d: 3, info: false } },
  ],
  strings: {
    de: {
      canvas:
        'Großes Koordinatensystem mit dem Graphen einer Grundfunktion f (blass, gestrichelt) und ihrem Bild g(x) = a · f(b(x − c)) + d (kräftig). Markante Punkte von f sind mit Pfeilen mit ihren Bildpunkten verbunden. Der runde Ankerpunkt (c | d) verschiebt den Graphen, der rautenförmige Formpunkt streckt ihn; bei 1/x und 2ˣ sind die Asymptoten gestrichelt eingezeichnet. Nullstellen sind als Ringe auf der x-Achse markiert. Unter dem Bild eine Zeitleiste für die Schrittfolge f → f(bx) → f(b(x − c)) → a·f(b(x − c)) → … + d mit Streckpfeilen, Spiegelachsen und Verschiebungsvektoren. Daneben Karten mit Term, Wirkung der Parameter, Punkttabelle und Eigenschaften von g. Im Aufgabenmodus sind Term, Werte und Hilfen verdeckt.',
    },
    en: {
      canvas:
        'Large coordinate system with the graph of a basic function f (faint, dashed) and its image g(x) = a · f(b(x − c)) + d (bold). Key points of f are joined to their images by arrows. The round anchor point (c, d) shifts the graph, the diamond-shaped shape point stretches it; for 1/x and 2ˣ the asymptotes are dashed. Zeros are marked as rings on the x-axis. Below the picture a timeline for the steps f → f(bx) → f(b(x − c)) → a·f(b(x − c)) → … + d with stretch arrows, mirror lines and shift vectors. Next to it cards with the term, the effect of the parameters, a table of points and properties of g. In task mode the term, the values and the hints are hidden.',
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
    const T2 = (de: string, en: string) => (lang === 'de' ? de : en);
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);
    const editable = () => !ctx.locked;
    /** Schatten: im Dunkeln aus dem Hintergrund, im Hellen aus der Schriftfarbe. */
    const shade = (dark: number, light: number) => (th().dark ? mixColor(th().bg, th().bg, 0, dark) : mixColor(th().text, th().text, 0, light));
    /** Kartenfläche (im Dunkeln etwas heller als der Hintergrund). */
    const surf = (lift = 0.045) => (th().dark ? mixColor(th().bg, th().text, lift) : th().bg);
    /** Kartenrand. */
    const edgeLine = () => mixColor(th().bg, th().text, th().dark ? 0.15 : 0.11);
    /** Pillenhintergrund (leicht durchscheinend). */
    const pillBg = () => mixColor(th().bg, th().text, th().dark ? 0.03 : 0, th().dark ? 0.9 : 0.94);
    /** Glanzlicht: helle Farbe des Themes. */
    const shine = () => (th().dark ? th().text : th().bg);
    const kind = () => p.f as Base;
    const order = () => p.ord as Order;

    /* ---------- Farben (gleiche Farbe = gleicher Parameter in Term, Bild und Karten) ---------- */
    const col = {
      f: () => th().muted,
      g: () => th().series[0]!,
      a: () => th().series[1]!,
      b: () => th().series[3]!,
      c: () => th().series[2]!,
      d: () => th().series[4]!,
      swap: () => th().series[5]!,
    };
    const colOf = (k: Key) => col[k]();

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-7 * Math.max(1, Math.abs(v * 10 ** d));
    const eq = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    /** x-Koordinate: bei der Sinusfunktion als Vielfaches von π, wenn möglich. */
    const X = (v: number, d = 2) => (kind() === 'sin' ? (piSrc(v) ?? N(v, d)) : N(v, d));
    const sep = lang === 'de' ? ' | ' : ', ';
    const pt = (x: string, y: string) => `(${x}${sep}${y})`;

    /* ---------- Ziel und Anzeige ---------- */
    const bOf = (v: number) => (Math.abs(v) < 0.05 ? (v < 0 ? -0.1 : 0.1) : v);
    const target = (): Trafo => ({ a: p.a, b: bOf(p.b), c: p.c, d: p.d });
    /** Zeitplan: Stufen ohne Wirkung laufen kürzer */
    const plan = () => storyPlan(neutralSteps(target(), order()));
    const result = (): Trafo => (order() === 'swap' ? swappedResult(target()) : target());

    // angezeigte Lage von g: a, s = 1/b, h = c, d (gleiten einzeln)
    const t0 = toAffine(target());
    const CA = new Chan(t0.a);
    const CS = new Chan(t0.s);
    const CH = new Chan(t0.h);
    const CD = new Chan(t0.d);
    /** Zeitleiste der Schrittfolge: 0 = f, 4 = fertig */
    const TL = new Chan(4);
    const VX0 = new Chan(-7);
    const VX1 = new Chan(7);
    const VY0 = new Chan(-5);
    const VY1 = new Chan(6);
    const kInfo = new Chan(p.info ? 1 : 0);
    const kBase = new Chan(p.base ? 1 : 0);
    const kPts = new Chan(p.pts ? 1 : 0);
    const kSwap = new Chan(p.ord === 'swap' ? 1 : 0);
    const kHint = new Chan(0);
    const cardH = new Map<string, Chan>();
    const chans = () => [CA, CS, CH, CD, TL, VX0, VX1, VY0, VY1, kInfo, kBase, kPts, kSwap, kHint, ...cardH.values()];
    const shownG = (): Affine => ({ a: CA.v, s: CS.v, h: CH.v, d: CD.v });

    let intro: number | null = null;
    /** Neuer Einstieg der Grundfunktion (f zeichnet sich neu) */
    let fIn: number | null = null;
    let prevKind: { kind: Base; t0: number; A: Affine } | null = null;
    /** Schrittfolge aktiv (Hinweise im Bild, Zeitleiste bedient) */
    let engaged = false;
    let storyTime = storyDuration(plan());
    let pops: { t0: number; src: string; color: string; axis: 'x' | 'y' }[] = [];
    let prevSign = { a: Math.sign(p.a), b: Math.sign(bOf(p.b)) };
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    let taskLoad = false;
    /** zuletzt gezeigte Grundfunktion (für das Ausblenden beim Wechsel) */
    let prevKindKey: Base = kind();
    let drag: { kind: 'anchor' | 'form'; off: [number, number] } | { kind: 'scrub'; sx: number; moved: boolean } | null = null;
    let hover: { id: string; px: number; py: number } | null = null;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    function cnt(key: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(key);
      if (!e) {
        e = { c: new Chan(v), at: -1 };
        nums.set(key, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (Math.abs(e.c.v - v) > 40 * Math.max(1, Math.abs(v))) e.c.jump(v);
        e.c.follow(v, dragging() ? 0.05 : 0.2);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    /** gezählter Wert mit gleichem Vorzeichen wie das Ziel (sonst gleich das Ziel) */
    const cv = (key: string, v: number) => {
      const s = cnt(key, v);
      return Math.sign(s) === Math.sign(v) || v === 0 ? s : v;
    };
    /** gezählte, formatierte Zahl; am Ziel exakt */
    const cN = (key: string, v: number, d = 2) => {
      const s = cnt(key, v);
      return Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? N(v, d) : N(s, d);
    };

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.1;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    const tlH = () => Math.round(fs(52, 48) * clamp01(kInfo.v * 1.4 - 0.2));
    function regions(): { plot: Rect; tl: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      const sh = tlH();
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.34, 250, 370));
        const pw = w - cw - 12;
        return { plot: { x: 0, y: 0, w: pw, h: h - sh }, tl: { x: 0, y: h - sh + 6, w: pw, h: Math.max(0, sh - 6) }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(w * 0.92, 250, h * 0.47));
      return { plot: { x: 0, y: 0, w, h: ph }, tl: { x: 0, y: ph + 6, w, h: Math.max(0, sh - 6) }, col: { x: 0, y: ph + sh + 8, w, h: h - ph - sh - 8 }, wide: false };
    }
    const plot = new Plot(surface, { x: [-7, 7], y: [-5, 6], pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Bildausschnitt ---------- */
    /** Ausschnitt, der f, alle Stufen der Schrittfolge und g gut zeigt. */
    function viewTarget(): { x: [number, number]; y: [number, number] } {
      const k = kind();
      const g = toAffine(target());
      const pts: [number, number][] = [];
      const kp = keyPoints(k);
      const sts = [...stageAffines(g, 'std'), ...(order() === 'swap' ? stageAffines(g, 'swap') : [])];
      for (const A of sts) for (const [u, v] of kp) pts.push(mapAffine(A, u, v));
      pts.push([g.h, g.d]);
      let x0 = -5.5;
      let x1 = 5.5;
      let y0 = -3;
      let y1 = 4;
      for (const [x, y] of pts) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        x0 = Math.min(x0, x - 1.2);
        x1 = Math.max(x1, x + 1.2);
        y0 = Math.min(y0, y - 1);
        y1 = Math.max(y1, y + 1.3);
      }
      return { x: [Math.max(-14, x0), Math.min(14, x1)], y: [Math.max(-12, y0), Math.min(12, y1)] };
    }
    function retargetView(now: number, instant: boolean): void {
      const v = viewTarget();
      const pairs: [Chan, number][] = [
        [VX0, v.x[0]],
        [VX1, v.x[1]],
        [VY0, v.y[0]],
        [VY1, v.y[1]],
      ];
      for (const [c, goal] of pairs) {
        if (instant || reduced()) c.jump(goal);
        else if (Math.abs(c.goal - goal) > 1e-9) c.glide(goal, 800, 0, now);
      }
    }

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { a: col.a(), b: col.b(), c: col.c(), d: col.d(), g: col.g(), f: col.f(), s: col.swap(), m: th().muted, t: th().text },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600, minSize = 11): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > minSize) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /** Färbung einer Zahl in einer Formel. */
    type Col = (k: Key, s: string) => string;
    const colored: Col = (k, s) => `\\c{${k}}{${s}}`;
    const plain: Col = (_k, s) => s;

    /**
     * Inneres b(x − c) als Kurzschrift. `swap`: bx − c (vertauschte Reihenfolge),
     * `simple`: bei b = −1 als c − x.
     */
    function innerSrc(t: Trafo, C: Col, num: Trafo, opts: { swap?: boolean; simple?: boolean } = {}): { s: string; atom: boolean } {
      const cAbs = C('c', N(Math.abs(num.c)));
      const xc = near(t.c, 0) ? 'x' : `x ${t.c > 0 ? '−' : '+'} ${cAbs}`;
      if (near(t.b, 1)) return { s: xc, atom: near(t.c, 0) };
      if (opts.swap) {
        const bx = near(t.b, -1) ? `${C('b', '−')}x` : `${C('b', N(num.b))}x`;
        return { s: near(t.c, 0) ? bx : `${bx} ${t.c > 0 ? '−' : '+'} ${cAbs}`, atom: false };
      }
      if (near(t.b, -1)) {
        if (near(t.c, 0)) return { s: `${C('b', '−')}x`, atom: false };
        if (opts.simple) return { s: `${C('c', N(num.c))} − x`, atom: false };
        return { s: `${C('b', '−')}(${xc})`, atom: false };
      }
      const bS = C('b', N(num.b));
      return { s: near(t.c, 0) ? `${bS}x` : `${bS}(${xc})`, atom: false };
    }
    /** Konkreter Term, z. B. g(x) = 2 · (x − 1)² − 2. `num`: angezeigte (gezählte) Zahlen. */
    function termSrc(k: Base, t: Trafo, C: Col, opts: { name?: string; num?: Trafo; swap?: boolean; simple?: boolean } = {}): string {
      const num = opts.num ?? t;
      const head = opts.name === '' ? '' : `${opts.name ?? 'g'}(x) = `;
      if (near(t.a, 0)) return `${head}${C('d', N(num.d))}`;
      const inner = innerSrc(t, C, num, opts);
      let core: string;
      if (k === 'inv') {
        const top = near(Math.abs(t.a), 1) ? '1' : C('a', N(Math.abs(num.a)));
        core = `${t.a < 0 ? C('a', '−') : ''}\\f{${top}}{${inner.s}}`;
      } else {
        const fx = BASES[k].f(inner.s, inner.atom);
        core = near(t.a, 1) ? fx : near(t.a, -1) ? `${C('a', '−')}${fx}` : `${C('a', N(num.a))} · ${fx}`;
      }
      const dPart = near(t.d, 0) ? '' : ` ${t.d > 0 ? '+' : '−'} ${C('d', N(Math.abs(num.d)))}`;
      return `${head}${core}${dPart}`;
    }
    /** Allgemeine Form mit Farben. */
    const generalSrc = (swap = false) =>
      swap ? `\\c{a}{a} · f(\\c{b}{b}x − \\c{c}{c}) + \\c{d}{d}` : `g(x) = \\c{a}{a} · f(\\c{b}{b}(x − \\c{c}{c})) + \\c{d}{d}`;
    /** Gleichwertige, einfachere Schreibweise (falls vorhanden). */
    function simplerSrc(k: Base, t: Trafo, C: Col): string | null {
      if (near(t.a, 0)) return null;
      const w = withoutB(k, t);
      if (w && !near(t.b, 1)) return `${eq(w.a)} ${termSrc(k, w, C, { name: '' })}`;
      if (near(t.b, -1) && !near(t.c, 0)) return `= ${termSrc(k, t, C, { name: '', simple: true })}`;
      return null;
    }

    /* ---------- Sätze ---------- */
    function factorWords(f: number): string {
      const n = (x: number) => Math.abs(f - x) < 1e-9;
      if (lang === 'de') {
        if (n(0.5)) return 'auf die Hälfte';
        if (n(2)) return 'auf das Doppelte';
        if (n(3)) return 'auf das Dreifache';
        if (n(4)) return 'auf das Vierfache';
        if (n(1 / 3)) return 'auf ein Drittel';
        if (n(0.25)) return 'auf ein Viertel';
        return `mit dem Faktor ${isExact(f) ? '' : '≈ '}${N(f, 2)}`;
      }
      if (n(0.5)) return 'to half';
      if (n(2)) return 'to double';
      if (n(3)) return 'to triple';
      if (n(4)) return 'to four times';
      if (n(1 / 3)) return 'to a third';
      if (n(0.25)) return 'to a quarter';
      return `by the factor ${isExact(f) ? '' : '≈ '}${N(f, 2)}`;
    }
    /** Wirkung eines Parameters als Satz (z. B. „in x-Richtung auf die Hälfte gestaucht“). */
    function effectText(key: Key, t: Trafo): string {
      const e = effectOf(key, t);
      const fw = factorWords(e.amount);
      if (key === 'b') {
        if (e.kind === 'none') return T2('keine Streckung in x-Richtung', 'no horizontal stretch');
        if (e.kind === 'mirror') return T2('an der y-Achse gespiegelt', 'reflected in the y-axis');
        const s = e.kind === 'stretch' ? T2(`in x-Richtung ${fw} gestreckt`, `stretched horizontally ${fw}`) : T2(`in x-Richtung ${fw} gestaucht`, `compressed horizontally ${fw}`);
        return e.mirror ? s + T2(' und an der y-Achse gespiegelt', ' and reflected in the y-axis') : s;
      }
      if (key === 'a') {
        if (e.kind === 'zero') return T2('auf die x-Achse zusammengedrückt: konstant', 'squashed onto the x-axis: constant');
        if (e.kind === 'none') return T2('keine Streckung in y-Richtung', 'no vertical stretch');
        if (e.kind === 'mirror') return T2('an der x-Achse gespiegelt', 'reflected in the x-axis');
        const s = e.kind === 'stretch' ? T2(`in y-Richtung ${fw} gestreckt`, `stretched vertically ${fw}`) : T2(`in y-Richtung ${fw} gestaucht`, `compressed vertically ${fw}`);
        return e.mirror ? s + T2(' und an der x-Achse gespiegelt', ' and reflected in the x-axis') : s;
      }
      if (key === 'c') {
        if (e.kind === 'none') return T2('keine Verschiebung in x-Richtung', 'no horizontal shift');
        return e.kind === 'right' ? T2(`um ${N(e.amount)} nach rechts verschoben`, `shifted ${N(e.amount)} to the right`) : T2(`um ${N(e.amount)} nach links verschoben`, `shifted ${N(e.amount)} to the left`);
      }
      if (e.kind === 'none') return T2('keine Verschiebung in y-Richtung', 'no vertical shift');
      return e.kind === 'up' ? T2(`um ${N(e.amount)} nach oben verschoben`, `shifted ${N(e.amount)} up`) : T2(`um ${N(e.amount)} nach unten verschoben`, `shifted ${N(e.amount)} down`);
    }
    /** Satz zur Stufe k der Schrittfolge (bei vertauschter Reihenfolge wirkt b auf die verschobene Kurve). */
    function stageText(k: number): string {
      const key = stepKeys(order())[k]!;
      const t = target();
      if (order() === 'swap' && key === 'b' && !near(t.b, 1) && !near(t.c, 0)) {
        const e = effectOf('b', t);
        const what = e.kind === 'mirror' ? T2('an der y-Achse gespiegelt', 'reflected in the y-axis') : effectText('b', t);
        return T2(`${what} – die Verschiebung schrumpft mit auf c/b ${eq(t.c / t.b)} ${N(t.c / t.b)}`, `${what} – the shift shrinks with it to c/b ${eq(t.c / t.b)} ${N(t.c / t.b)}`);
      }
      return effectText(key, t);
    }
    /** Mengen: ℝ, Intervalle (DE ]a; b[, EN (a, b)), ℝ ohne einen Wert. */
    function setSrc(s: NumSet, xLike: boolean): string {
      const v = (x: number) => (Number.isFinite(x) ? (xLike ? X(x) : N(x)) : x > 0 ? '∞' : '−∞');
      switch (s.kind) {
        case 'all':
          return '\\t{ℝ}';
        case 'point':
          return `{${v(s.x)}}`;
        case 'except':
          return `\\t{ℝ} \\ {${v(s.x)}}`;
        case 'interval': {
          const de = lang === 'de';
          const lb = s.loIn ? '[' : de ? ']' : '(';
          const rb = s.hiIn ? ']' : de ? '[' : ')';
          return `${lb}${v(s.lo)}${de ? '; ' : ', '}${v(s.hi)}${rb}`;
        }
      }
    }

    /* ---------- Zeichenhilfen ---------- */
    type PillOpts = { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean };
    let placed: Rect[] = [];
    const overlapArea = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    function fpillFree(cands: { x: number; y: number; align: 'left' | 'center' | 'right' }[], src: string, opts: PillOpts = {}): Rect {
      let best: { c: (typeof cands)[number]; cost: number } | null = null;
      for (const c of cands) {
        const rr = fpill(c.x, c.y, src, { ...opts, align: c.align, dry: true });
        const cost = placed.reduce((s, q) => s + overlapArea(q, rr), 0);
        if (!best || cost < best.cost - 1e-6) best = { c, cost };
        if (cost === 0) break;
      }
      const c = best!.c;
      const rr = fpill(c.x, c.y, src, { ...opts, align: c.align });
      placed.push(rr);
      return rr;
    }
    function fpill(x: number, y: number, src: string, opts: PillOpts = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const box = formula(g, src, fstyle(size, color, opts.weight ?? 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      let bl = y + (box.asc - box.desc) / 2;
      if (opts.bounds) bl = clamp(bl, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 8, y: bl - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (opts.dry || a <= 0.01) return rr;
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
      box.draw(g, left, bl);
      g.restore();
      return rr;
    }
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.42 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
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
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, opts: { head?: number; alpha?: number; dash?: number[]; glow?: boolean } = {}): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      const a = opts.alpha ?? 1;
      if (len < 1.5 || a <= 0.01 || !Number.isFinite(len)) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(opts.head ?? 10, len * 0.5);
      g.save();
      g.globalAlpha *= a;
      if (opts.glow) {
        g.shadowColor = th().dark ? shade(0.6, 0) : mixColor(color, shine(), 0.35, 0.55);
        g.shadowBlur = th().dark ? 8 : 6;
        g.shadowOffsetY = 2;
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5);
      g.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5);
      g.closePath();
      g.fill();
      g.restore();
    }

    /** Bildgraph in affiner Lage als Pixel-Teilstücke (getrennt an Definitionslücken). */
    function curvePieces(k: Base, A: Affine): [number, number][][] {
      const b = plot.bounds;
      const r = plot.rect;
      let u0: number;
      let u1: number;
      if (Math.abs(A.s) < 1e-6) {
        u0 = -80;
        u1 = 80;
      } else {
        const ua = (b.xMin - A.h) / A.s;
        const ub = (b.xMax - A.h) / A.s;
        u0 = Math.min(ua, ub);
        u1 = Math.max(ua, ub);
        const m = (u1 - u0) * 0.02;
        u0 -= m;
        u1 += m;
      }
      u0 = Math.max(u0, -400);
      u1 = Math.min(u1, 400);
      const parts: [number, number][] = [];
      if (k === 'sqrt') {
        if (u1 > 0) parts.push([Math.max(0, u0), u1]);
      } else if (k === 'inv') {
        const eps = 1e-4 * Math.max(1, u1 - u0);
        if (u0 < -eps) parts.push([u0, Math.min(u1, -eps)]);
        if (u1 > eps) parts.push([Math.max(u0, eps), u1]);
      } else parts.push([u0, u1]);
      const lim = r.h * 2.5;
      const out: [number, number][][] = [];
      for (const [p0, p1] of parts) {
        if (!(p1 > p0)) continue;
        const pxLen = Math.abs(A.s) * (p1 - p0) * plot.scale.x;
        const n = Math.round(clamp(pxLen * 0.9 + 160, 160, 2400));
        const pts: [number, number][] = [];
        for (let i = 0; i <= n; i++) {
          // bei der Wurzel und der Hyperbel dichter am Rand der Definitionsmenge
          let q = i / n;
          if (k === 'sqrt' && p0 === 0) q = q * q;
          if (k === 'inv') q = p1 <= 0 ? 1 - (1 - q) * (1 - q) : q * q;
          const u = p0 + (p1 - p0) * q;
          const v = base(k, u);
          if (!Number.isFinite(v)) continue;
          const [x, y] = mapAffine(A, u, v);
          pts.push([plot.px(x), clamp(plot.py(y), r.y - lim, r.y + r.h + lim)]);
        }
        if (pts.length > 1) out.push(pts);
      }
      return out;
    }
    function strokePieces(pieces: [number, number][][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
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
        for (const pts of pieces) pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
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
      if (opts.glow && width >= 2.5 && !opts.dash) {
        g.translate(0, -width * 0.22);
        g.strokeStyle = mixColor(shine(), shine(), 0, th().dark ? 0.18 : 0.36);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }

    /** Infokarte im einheitlichen Stil (sim-core). */
    function card(r: Rect, accent?: string): void {
      drawCard(surface.g, r, ctx.theme, accent);
    }
    function cardTitle(R: Rect, title: string, color: string, right?: { src: string; color: string }): void {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let rb: FormulaBox | null = right ? formula(g, right.src, fstyle(fs(12, 11), right.color, 700)) : null;
      let tsz = fs(13.5, 12.5);
      g.font = `750 ${tsz}px ${th().font}`;
      if (rb && g.measureText(title).width > R.w - 2 * pad - 15 - rb.w - 12) rb = null;
      const room = R.w - 2 * pad - 15 - (rb ? rb.w + 12 : 0);
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
    /** Kleine farbige Plakette mit einem Parameter (z. B. „b“). */
    function badge(x: number, cy: number, label: string, color: string, alpha = 1, w = 24): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      const grad = g.createLinearGradient(0, cy - 10, 0, cy + 10);
      grad.addColorStop(0, mixColor(color, shine(), 0.18));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      roundRect(g, x, cy - 10, w, 20, 10);
      g.fill();
      g.font = `italic 700 14px ${th().mathFont}`;
      g.fillStyle = th().bg;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, x + w / 2, cy + 0.5);
      g.restore();
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      fDraw: number;
      t: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, fDraw: 1, t: 1e9, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3400) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        fDraw: ease.inOutCubic(clamp01((t - 150) / 950)),
        t,
        labels: ease.outCubic(clamp01((t - 2300) / 600)),
        cards: clamp01((t - 300) / 900),
        stagger: clamp01((t - 700) / 1600),
      };
    }
    /** g morpht nach dem Einstieg aus f heraus (Stufen leicht versetzt in der Reihenfolge b, c, a, d). */
    function morphFromF(now: number, delay: number): void {
      const g = toAffine(target());
      if (reduced()) {
        CA.jump(g.a);
        CS.jump(g.s);
        CH.jump(g.h);
        CD.jump(g.d);
        return;
      }
      CA.jump(1);
      CS.jump(1);
      CH.jump(0);
      CD.jump(0);
      CS.glide(g.s, 900, delay, now);
      CH.glide(g.h, 900, delay + 140, now);
      CA.glide(g.a, 900, delay + 280, now);
      CD.glide(g.d, 900, delay + 420, now);
    }

    /* =====================================================================
     * Hauptbild
     * ===================================================================== */
    /** Was die Schrittfolge gerade zeigt (null: keine Hinweise). */
    function hintState(): { k: number; local: number } | null {
      if (kHint.v <= 0.01) return null;
      const tl = TL.v;
      if (tl >= 4 - 1e-6) return { k: 3, local: 1 };
      const r = Math.round(tl);
      if (Math.abs(tl - r) < 1e-6) return r === 0 ? { k: -1, local: 0 } : { k: r - 1, local: 1 };
      return { k: Math.floor(tl), local: tl - Math.floor(tl) };
    }
    /** Angezeigte Lage (Schrittfolge auf der Zeitleiste). */
    function display(): { A: Affine; st: Affine[] } {
      const g = shownG();
      return { A: storyAt(g, order(), TL.v).A, st: stageAffines(g, order()) };
    }
    const handlesOn = () => editable() && kInfo.v > 0.5 && order() === 'std' && !ctx.clock.playing && TL.v > 4 - 1e-6;
    function handlePos(A: Affine): { anchor: [number, number]; form: [number, number] } {
      const [u1, v1] = anchors(kind()).p1;
      return { anchor: mapAffine(A, 0, 0), form: mapAffine(A, u1, v1) };
    }

    /** Achse als leuchtende Spiegelachse (blinkt kurz auf). */
    function glowAxis(which: 'x' | 'y', color: string, alpha: number, now: number, label: boolean): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const r = plot.rect;
      const pulse = reduced() ? 0.8 : 0.65 + 0.35 * Math.sin(now / 130);
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = withAlpha(color, 0.22 * pulse);
      g.lineWidth = 12;
      g.lineCap = 'round';
      g.beginPath();
      if (which === 'x') {
        const y = plot.py(0);
        g.moveTo(r.x, y);
        g.lineTo(r.x + r.w, y);
      } else {
        const x = plot.px(0);
        g.moveTo(x, r.y);
        g.lineTo(x, r.y + r.h);
      }
      g.stroke();
      g.strokeStyle = color;
      g.lineWidth = 2.2;
      g.setLineDash([10, 6]);
      g.stroke();
      g.restore();
      if (label) {
        const src = `\\t{${T2('Spiegelachse', 'mirror line')}}`;
        if (which === 'x') fpillFree([{ x: r.x + r.w - 16, y: plot.py(0) - 18, align: 'right' }, { x: r.x + r.w - 16, y: plot.py(0) + 18, align: 'right' }], src, { size: fs(12, 11), color, alpha, bounds: r, border: withAlpha(color, 0.5) });
        else fpillFree([{ x: plot.px(0) + 12, y: r.y + r.h - 22, align: 'left' }, { x: plot.px(0) - 12, y: r.y + r.h - 22, align: 'right' }], src, { size: fs(12, 11), color, alpha, bounds: r, border: withAlpha(color, 0.5) });
      }
    }

    /** Erklärende Hilfen zur gerade wirkenden Stufe. */
    function drawStageHints(st: Affine[], A: Affine, hs: { k: number; local: number }, alpha: number, now: number): void {
      if (hs.k < 0 || alpha <= 0.01) return;
      const key = stepKeys(order())[hs.k]!;
      const from = st[hs.k]!;
      const to = st[hs.k + 1]!;
      const color = colOf(key);
      const r = plot.rect;
      const kp = keyPoints(kind());
      const t = target();
      const moving = hs.local > 0 && hs.local < 1;
      const lab = (src: string, x: number, y: number, dy: number) =>
        fpillFree(
          [
            { x, y: y + dy, align: 'center' },
            { x, y: y - dy, align: 'center' },
            { x: x + 30, y: y + dy * 2, align: 'left' },
            { x: x - 30, y: y - dy * 2, align: 'right' },
          ],
          src,
          { size: fs(12.5, 11.5), alpha, bounds: r, border: withAlpha(color, 0.55), color },
        );
      if (key === 'b' || key === 'a') {
        const horizontal = key === 'b';
        const mirror = (horizontal ? t.b : t.a) < 0;
        if (mirror) glowAxis(horizontal ? 'y' : 'x', color, alpha * (moving ? 1 : 0.75), now, true);
        // Streckpfeile parallel zur Achse: von der alten zur neuen Lage jedes markanten Punkts
        let best: { len: number; x: number; y: number } | null = null;
        for (const [u, v] of kp) {
          const [x0, y0] = mapAffine(from, u, v);
          const [x1, y1] = mapAffine(A, u, v);
          const p0 = plot.toPx(x0, y0);
          const p1 = plot.toPx(x1, y1);
          if (!Number.isFinite(p0[1]) || !Number.isFinite(p1[1])) continue;
          const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
          // Hilfslinie zur Achse, an der gestreckt wird
          const g = surface.g;
          g.save();
          g.globalAlpha *= alpha * 0.55;
          g.strokeStyle = color;
          g.lineWidth = 1;
          g.setLineDash([2, 4]);
          g.beginPath();
          if (horizontal) {
            g.moveTo(plot.px(0), p1[1]);
            g.lineTo(p1[0], p1[1]);
          } else {
            g.moveTo(p1[0], plot.py(0));
            g.lineTo(p1[0], p1[1]);
          }
          g.stroke();
          g.restore();
          dot(p0[0], p0[1], color, 3.2, alpha * 0.8, true);
          if (len > 8) arrowPx(p0[0], p0[1], p1[0], p1[1], color, 2.2, { alpha: alpha * 0.9, head: 9 });
          if (len > 20 && (!best || len > best.len) && p1[1] > r.y + 20 && p1[1] < r.y + r.h - 20) best = { len, x: (p0[0] + p1[0]) / 2, y: (p0[1] + p1[1]) / 2 };
        }
        const e = effectOf(key, t);
        const fac = horizontal ? `· \\f{1}{b} ${eq(1 / t.b)} ${N(1 / t.b, 2)}` : `· a = ${N(t.a, 2)}`;
        const src = `\\c{${key}}{${fac}}`;
        if (e.kind === 'none') return;
        if (best) lab(src, best.x, best.y, horizontal ? -20 : 0);
        else {
          const [ax, ay] = plot.toPx(...mapAffine(A, 0, 0));
          lab(src, ax, ay, -30);
        }
        return;
      }
      // Verschiebung: Vektor am Ankerpunkt und dünne Pfeile an den markanten Punkten
      const [x0, y0] = mapAffine(from, 0, 0);
      const [x1, y1] = mapAffine(A, 0, 0);
      const [xe, ye] = mapAffine(to, 0, 0);
      const p0 = plot.toPx(x0, y0);
      const p1 = plot.toPx(x1, y1);
      const pe = plot.toPx(xe, ye);
      const g = surface.g;
      // Bahn des Ankers (gestrichelt bis zum Ziel)
      g.save();
      g.globalAlpha *= alpha * 0.45;
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.setLineDash([4, 5]);
      g.beginPath();
      g.moveTo(p0[0], p0[1]);
      g.lineTo(pe[0], pe[1]);
      g.stroke();
      g.restore();
      for (const [u, v] of kp) {
        const q0 = plot.toPx(...mapAffine(from, u, v));
        const q1 = plot.toPx(...mapAffine(A, u, v));
        if (Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) > 12) arrowPx(q0[0], q0[1], q1[0], q1[1], color, 1.4, { alpha: alpha * 0.45, head: 7 });
      }
      dot(p0[0], p0[1], color, 4, alpha * 0.9, true);
      arrowPx(p0[0], p0[1], p1[0], p1[1], color, 3.2, { alpha, head: 12, glow: true });
      const v = key === 'c' ? t.c : t.d;
      if (near(v, 0)) return;
      const src = `\\c{${key}}{${key} = ${N(v, 2)}}`;
      const mx = (p0[0] + pe[0]) / 2;
      const my = (p0[1] + pe[1]) / 2;
      lab(src, mx, my, key === 'c' ? -20 : 0);
    }

    /** Beschriftung einer Kurve an einer gut sichtbaren Stelle. */
    function curveLabel(k: Base, A: Affine, src: string, color: string, alpha: number): void {
      if (alpha <= 0.01) return;
      const r = plot.rect;
      for (const u of BASES[k].label) {
        const v = base(k, u);
        if (!Number.isFinite(v)) continue;
        const [x, y] = plot.toPx(...mapAffine(A, u, v));
        if (x < r.x + 30 || x > r.x + r.w - 30 || y < r.y + 26 || y > r.y + r.h - 26) continue;
        fpillFree(
          [
            { x: x + 14, y: y - 14, align: 'left' },
            { x: x - 14, y: y - 14, align: 'right' },
            { x: x + 14, y: y + 16, align: 'left' },
            { x: x - 14, y: y + 16, align: 'right' },
          ],
          src,
          { size: fs(13, 12), alpha, bounds: r, border: withAlpha(color, 0.5), color },
        );
        return;
      }
    }

    /** Asymptoten der Lage A (gestrichelt, mit Beschriftung). */
    function drawAsymptotes(k: Base, A: Affine, color: string, alpha: number, labels: boolean): void {
      if (alpha <= 0.01 || (k !== 'inv' && k !== 'exp')) return;
      const g = surface.g;
      const r = plot.rect;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.setLineDash([7, 6]);
      g.beginPath();
      const yA = plot.py(A.d);
      g.moveTo(r.x, yA);
      g.lineTo(r.x + r.w, yA);
      if (k === 'inv') {
        const xA = plot.px(A.h);
        g.moveTo(xA, r.y);
        g.lineTo(xA, r.y + r.h);
      }
      g.stroke();
      g.restore();
      if (!labels) return;
      const sz = fs(12, 11);
      const border = withAlpha(color, 0.45);
      fpillFree(
        [
          { x: r.x + 14, y: yA - 15, align: 'left' },
          { x: r.x + 14, y: yA + 15, align: 'left' },
          { x: r.x + r.w - 14, y: yA - 15, align: 'right' },
        ],
        `y = ${N(A.d)}`,
        { size: sz, alpha, bounds: r, border, color },
      );
      if (k === 'inv') {
        const xA = plot.px(A.h);
        fpillFree(
          [
            { x: xA + 10, y: r.y + 18, align: 'left' },
            { x: xA - 10, y: r.y + 18, align: 'right' },
            { x: xA + 10, y: r.y + r.h - 18, align: 'left' },
          ],
          `x = ${N(A.h)}`,
          { size: sz, alpha, bounds: r, border, color },
        );
      }
    }

    function drawHandle(which: 'anchor' | 'form', x: number, y: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const g = surface.g;
      const color = which === 'anchor' ? col.c() : col.a();
      const hl = hover?.id === which || drag?.kind === which;
      const s = fs(8.5, 8) * (hl ? 1.18 : 1);
      g.save();
      g.globalAlpha *= alpha;
      if (hl) halo(x, y, color, 28, 1);
      g.save();
      g.shadowColor = shade(0.55, 0.3);
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createLinearGradient(x, y - s, x, y + s);
      grad.addColorStop(0, mixColor(color, shine(), 0.4));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      if (which === 'anchor') g.arc(x, y, s, 0, TAU);
      else {
        g.moveTo(x, y - s * 1.25);
        g.lineTo(x + s * 1.1, y);
        g.lineTo(x, y + s * 1.25);
        g.lineTo(x - s * 1.1, y);
        g.closePath();
      }
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 1.8;
      g.stroke();
      // kleine Pfeile: Anker in alle vier Richtungen, Formpunkt schräg (strecken)
      if (editable()) {
        g.fillStyle = withAlpha(color, hl ? 0.95 : 0.7);
        const dirs: [number, number][] = which === 'anchor' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[0.7071, -0.7071], [-0.7071, 0.7071]];
        for (const [dx, dy] of dirs) {
          const d0 = s * 1.3 + 4;
          const d1 = d0 + 6;
          const tx = x + dx * d1;
          const ty = y + dy * d1;
          g.beginPath();
          g.moveTo(tx, ty);
          g.lineTo(x + dx * d0 - dy * 4, y + dy * d0 + dx * 4);
          g.lineTo(x + dx * d0 + dy * 4, y + dy * d0 - dx * 4);
          g.closePath();
          g.fill();
        }
      }
      g.restore();
    }

    function drawPlot(now: number, k: Intro): void {
      const g = surface.g;
      const kd = kind();
      plot.setRange([VX0.v, VX1.v], [VY0.v, VY1.v]);
      plot.resize();
      plot.setAxes({ x: { label: 'x', pi: kd === 'sin' }, y: { label: 'y' } });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      placed = [];
      const info = kInfo.v;
      const { A, st } = display();
      // Griffe vormerken, damit Beschriftungen ihnen ausweichen
      const hp = handlePos(A);
      const kH = info * k.labels * (handlesOn() ? 1 : 0);
      if (kH > 0.01) {
        placed.push({ x: plot.px(hp.anchor[0]) - 18, y: plot.py(hp.anchor[1]) - 18, w: 36, h: 36 });
        placed.push({ x: plot.px(hp.form[0]) - 18, y: plot.py(hp.form[1]) - 18, w: 36, h: 36 });
      }
      const hs = hintState();
      const hA = kHint.v * info * k.labels;
      const t = target();
      const swap = order() === 'swap';
      const kSw = kSwap.v * info;
      // Wiedereinstieg einer neuen Grundfunktion
      const fNew = fIn === null ? 1 : ease.inOutCubic(clamp01((now - fIn) / 650));
      const fReveal = Math.min(k.fDraw, fNew);
      const clipTo = (q: number, fn: () => void) => {
        if (q >= 1) return fn();
        g.save();
        g.beginPath();
        g.rect(r.x, r.y, r.w * q, r.h);
        g.clip();
        fn();
        g.restore();
      };
      const fA = kBase.v * k.panel;
      // alte Grundfunktion blendet aus
      if (prevKind) {
        const q = 1 - clamp01((now - prevKind.t0) / 500);
        if (q > 0.01) {
          strokePieces(curvePieces(prevKind.kind, AFFINE_ID), col.f(), 2, { dash: [6, 5], alpha: q * fA * 0.9 });
          strokePieces(curvePieces(prevKind.kind, prevKind.A), col.g(), 3.2, { alpha: q * 0.8 });
        }
      }
      // Asymptoten von f (blass) und vom Bild
      if (kd === 'inv' || kd === 'exp') {
        drawAsymptotes(kd, AFFINE_ID, withAlpha(col.f(), 0.6), fA * 0.5 * fReveal, false);
        drawAsymptotes(kd, A, col.d(), 0.85 * fReveal, info > 0.5 && k.labels > 0.5);
      }
      // Grundfunktion f
      clipTo(fReveal, () => strokePieces(curvePieces(kd, AFFINE_ID), col.f(), 2.2, { dash: [7, 5], alpha: fA }));
      // Spiegelachse und Hilfen der Schrittfolge
      if (hs && hA > 0.01) {
        // vorige Stufe als Geist
        if (hs.k >= 0) strokePieces(curvePieces(kd, st[hs.k]!), col.g(), 2, { dash: [3, 5], alpha: hA * 0.45 });
      }
      // vertauschte Reihenfolge: richtiges g zum Vergleich
      if (kSw > 0.01) {
        const right = toAffine(t);
        const show = clamp01((TL.v - 1.6) * 2.5) * kSw;
        strokePieces(curvePieces(kd, right), col.g(), 2.4, { dash: [9, 6], alpha: show * 0.75 });
      }
      // Bildgraph g (bzw. Ergebnis der vertauschten Reihenfolge)
      const gColor = swap ? col.swap() : col.g();
      const gShow = intro === null && fIn === null ? 1 : clamp01((k.t - 1050) / 250) * (fIn === null ? 1 : clamp01((now - fIn - 380) / 250));
      clipTo(intro === null ? 1 : k.fDraw, () => strokePieces(curvePieces(kd, A), gColor, fs(3.6, 3.2), { glow: true, alpha: gShow }));
      if (hs && hA > 0.01) drawStageHints(st, A, hs, hA, now);
      // markante Punkte mit Abbildungspfeilen
      const kp = keyPoints(kd);
      const pA = kPts.v * gShow;
      const hovIdx = hover?.id?.startsWith('p') ? Number(hover.id.slice(1)) : -1;
      if (pA > 0.01) {
        kp.forEach(([u, v], i) => {
          const q0 = plot.toPx(u, v);
          const q1 = plot.toPx(...mapAffine(A, u, v));
          const hl = i === hovIdx;
          if (fA > 0.01 && !(hs && hA > 0.5 && hs.k >= 0)) {
            if (Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) > 16) arrowPx(q0[0], q0[1], q1[0], q1[1], hl ? col.g() : withAlpha(col.g(), 0.55), hl ? 2.2 : 1.5, { dash: hl ? undefined : [4, 4], alpha: pA * fA, head: 8 });
          }
          if (fA > 0.01) dot(q0[0], q0[1], col.f(), 3.4, pA * fA);
          if (hl) halo(q1[0], q1[1], gColor, 22, 1);
          dot(q1[0], q1[1], gColor, hl ? 5.6 : 4.6, pA);
        });
      }
      // Nullstellen (kleine Ringe auf der x-Achse)
      const idle = !ctx.clock.playing && TL.v > 4 - 1e-6;
      if (info > 0.5 && idle && pA > 0.01 && !near(t.a, 0)) {
        const b = plot.bounds;
        const z = zerosIn(kd, result(), b.xMin, b.xMax);
        if (z !== 'all') for (const x of z.slice(0, 12)) dot(plot.px(x), plot.py(0), gColor, 4, pA * info * k.labels * 0.9, true);
      }
      // vertauschte Reihenfolge: falsche Lage des Ankers
      if (kSw > 0.01 && TL.v > 1.6 && !near(t.c, 0) && !near(t.b, 1)) {
        const aw = plot.toPx(...mapAffine(A, 0, 0));
        const ar = plot.toPx(t.c, A.d);
        const q = clamp01((TL.v - 1.6) * 2.5) * kSw * k.labels;
        if (Math.abs(ar[0] - aw[0]) > 14) arrowPx(aw[0], aw[1], ar[0], ar[1], col.g(), 2, { alpha: q * 0.9, head: 9, dash: [5, 4] });
        fpillFree(
          [
            { x: (aw[0] + ar[0]) / 2, y: aw[1] + 26, align: 'center' },
            { x: (aw[0] + ar[0]) / 2, y: aw[1] - 26, align: 'center' },
            { x: (aw[0] + ar[0]) / 2, y: aw[1] + 52, align: 'center' },
          ],
          `\\c{s}{\\f{c}{b} ${eq(t.c / t.b)} ${N(t.c / t.b)}} \\t{${T2('statt', 'instead of')}} \\c{c}{c = ${N(t.c)}}`,
          { size: fs(12.5, 11.5), alpha: q, bounds: r, border: withAlpha(col.swap(), 0.55) },
        );
      }
      // Ziehgriffe
      if (kH > 0.01) {
        drawHandle('anchor', ...plot.toPx(...hp.anchor), kH);
        drawHandle('form', ...plot.toPx(...hp.form), kH);
      }
      // Beschriftungen der Kurven
      if (fA > 0.01) curveLabel(kd, AFFINE_ID, '\\c{f}{f}', col.f(), fA * k.labels);
      curveLabel(kd, A, swap ? '\\c{s}{h}' : '\\c{g}{g}', gColor, gShow * k.labels);
      if (kSw > 0.01) curveLabel(kd, toAffine(t), '\\c{g}{g}', col.g(), clamp01((TL.v - 1.6) * 2.5) * kSw * k.labels);
      // Griff-Beschriftungen
      if (kH > 0.01 && (hover?.id === 'anchor' || hover?.id === 'form' || drag?.kind === 'anchor' || drag?.kind === 'form')) {
        const which = drag && drag.kind !== 'scrub' ? drag.kind : (hover!.id as 'anchor' | 'form');
        const [hx, hy] = plot.toPx(...hp[which]);
        const src =
          which === 'anchor'
            ? `(\\c{c}{${cN('hc', t.c, 1)}}${sep}\\c{d}{${cN('hd', t.d, 1)}})`
            : `\\c{a}{a = ${cN('ha', t.a, 1)}}   \\c{b}{b = ${cN('hb', t.b, 1)}}`;
        const right = hx < r.x + r.w - 150;
        fpillFree(
          [
            { x: hx + (right ? 18 : -18), y: hy - 22, align: right ? 'left' : 'right' },
            { x: hx + (right ? 18 : -18), y: hy + 24, align: right ? 'left' : 'right' },
            { x: hx + (right ? -18 : 18), y: hy - 22, align: right ? 'right' : 'left' },
          ],
          src,
          { size: fs(12.5, 11.5), bounds: r, border: withAlpha(which === 'anchor' ? col.c() : col.a(), 0.55) },
        );
      }
      // Hover über einem Bildpunkt: Rechnung
      if (hovIdx >= 0 && info > 0.5 && pA > 0.01) {
        const [u, v] = kp[hovIdx]!;
        const [x1, y1] = mapAffine(A, u, v);
        const q1 = plot.toPx(x1, y1);
        const tt = result();
        const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);
        const pm = (key: Key, v: number) => `${v < 0 ? '−' : '+'} \\c{${key}}{${N(Math.abs(v))}}`;
        const src = `${pt(X(u), N(v))} \\t{↦} ${pt(`${par(X(u))} ${T2(":", "/")} \\c{b}{${par(N(tt.b))}} ${pm('c', tt.c)}`, `\\c{a}{${par(N(tt.a))}} · ${par(N(v))} ${pm('d', tt.d)}`)} ${(kind() === 'sin' && piSrc(x1)) || isExact(x1) ? eq(y1) : '≈'} \\c{g}{${pt(X(x1), N(y1))}}`;
        const right = q1[0] < r.x + r.w * 0.55;
        fpill(q1[0] + (right ? 14 : -14), clamp(q1[1] - 24, r.y + 20, r.y + r.h - 20), src, { align: right ? 'left' : 'right', size: fs(12, 11), bounds: r, border: withAlpha(col.g(), 0.5) });
      }
      // kurze Meldungen (Spiegelung beim Ziehen über die Achse)
      pops = pops.filter((pp) => now - pp.t0 < 2400);
      pops.forEach((pp, i) => {
        const tt = (now - pp.t0) / 2400;
        const a = clamp01(tt * 6) * clamp01((1 - tt) * 3) * info;
        fpill(r.x + r.w / 2, r.y + r.h - 30 - i * 32 - 8 * ease.outCubic(clamp01(tt * 3)), pp.src, { size: fs(12.5, 11.5), alpha: a, bounds: r, border: withAlpha(pp.color, 0.6) });
      });
      // Stufe der Schrittfolge
      if (hs && hA > 0.01) {
        const label = hs.k < 0 ? `\\c{f}{\\t{${T2('Grundfunktion', 'basic function')}} ${termSrc(kd, { a: 1, b: 1, c: 0, d: 0 }, plain, { name: 'f' })}}` : null;
        const key = hs.k >= 0 ? stepKeys(order())[hs.k]! : null;
        const r0 = { x: r.x + 10, y: r.y + 10 };
        if (label) fpill(r0.x, r0.y + 13, label, { align: 'left', size: fs(13, 12), alpha: hA, bounds: r, border: withAlpha(col.f(), 0.5) });
        else if (key) {
          const txt = `${'①②③④'[hs.k]} ${key} = ${N(target()[key])}: ${stageText(hs.k)}`;
          const maxW = r.w - 40;
          const sz = fs(13, 12);
          const lines = wrapText(txt, maxW, `700 ${sz}px ${th().font}`).slice(0, 2);
          lines.forEach((ln, i) => fpill(r0.x, r0.y + 13 + i * (sz + 14), `\\c{${key}}{\\t{${ln}}}`, { align: 'left', size: sz, alpha: hA, bounds: r, border: i === 0 ? withAlpha(colOf(key), 0.55) : undefined }));
        }
      }
      plot.end();
    }

    /* ---------- Zeitleiste ---------- */
    function tlGeom(T: Rect): { box: Rect; play: { x: number; y: number; r: number }; x0: number; x1: number; cy: number } {
      const box = { x: T.x + 2, y: T.y, w: T.w - 4, h: T.h };
      const cy = box.y + box.h / 2;
      const play = { x: box.x + 24, y: cy, r: 15 };
      const x0 = box.x + 64;
      const x1 = box.x + box.w - 26;
      return { box, play, x0, x1, cy };
    }
    const nodeX = (G: ReturnType<typeof tlGeom>, i: number) => G.x0 + ((G.x1 - G.x0) * i) / 4;
    function drawTimeline(T: Rect, k: Intro): void {
      if (T.h < 20) return;
      const g = surface.g;
      const theme = th();
      const G = tlGeom(T);
      const a = clamp01(kInfo.v * 1.6 - 0.4) * k.panel;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      // Hintergrund
      g.save();
      g.shadowColor = shade(0.45, 0.1);
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      g.fillStyle = surf();
      roundRect(g, G.box.x, G.box.y, G.box.w, G.box.h, G.box.h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = edgeLine();
      g.lineWidth = 1.2;
      roundRect(g, G.box.x + 0.5, G.box.y + 0.5, G.box.w - 1, G.box.h - 1, G.box.h / 2);
      g.stroke();
      // Abspielknopf
      const playing = ctx.clock.playing;
      const hp = hover?.id === 'play';
      const pc = col.g();
      g.save();
      g.shadowColor = theme.dark ? shade(0.5, 0) : withAlpha(pc, 0.35);
      g.shadowBlur = hp ? 10 : 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createLinearGradient(0, G.play.y - G.play.r, 0, G.play.y + G.play.r);
      grad.addColorStop(0, mixColor(pc, shine(), hp ? 0.3 : 0.18));
      grad.addColorStop(1, pc);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(G.play.x, G.play.y, G.play.r * (hp ? 1.06 : 1), 0, TAU);
      g.fill();
      g.restore();
      g.fillStyle = theme.bg;
      if (playing) {
        g.fillRect(G.play.x - 5, G.play.y - 6, 3.5, 12);
        g.fillRect(G.play.x + 1.5, G.play.y - 6, 3.5, 12);
      } else {
        g.beginPath();
        g.moveTo(G.play.x - 4, G.play.y - 7);
        g.lineTo(G.play.x + 7, G.play.y);
        g.lineTo(G.play.x - 4, G.play.y + 7);
        g.closePath();
        g.fill();
      }
      // Spur
      const keys = stepKeys(order());
      const tl = TL.v;
      const xt = G.x0 + ((G.x1 - G.x0) * tl) / 4;
      g.lineCap = 'round';
      g.strokeStyle = withAlpha(theme.text, theme.dark ? 0.22 : 0.14);
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(G.x0, G.cy);
      g.lineTo(G.x1, G.cy);
      g.stroke();
      // Fortschritt: je Abschnitt in der Farbe des Parameters
      for (let i = 0; i < 4; i++) {
        const xa = nodeX(G, i);
        const xb = nodeX(G, i + 1);
        const xe = clamp(xt, xa, xb);
        if (xe <= xa + 0.5) continue;
        g.strokeStyle = colOf(keys[i]!);
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(xa, G.cy);
        g.lineTo(xe, G.cy);
        g.stroke();
      }
      // Knoten
      const nr = fs(11, 10);
      for (let i = 0; i <= 4; i++) {
        const x = nodeX(G, i);
        const reached = tl >= i - 1e-6;
        const color = i === 0 ? col.f() : colOf(keys[i - 1]!);
        const hl = hover?.id === `n${i}`;
        const cur = Math.abs(tl - i) < 0.5;
        g.save();
        if (reached) {
          g.shadowColor = theme.dark ? shade(0.5, 0) : withAlpha(color, 0.35);
          g.shadowBlur = 5;
          g.shadowOffsetY = 1;
        }
        g.fillStyle = reached ? color : surf(0.07);
        g.beginPath();
        g.arc(x, G.cy, nr * (hl ? 1.12 : 1), 0, TAU);
        g.fill();
        g.restore();
        g.strokeStyle = reached ? theme.bg : withAlpha(color, 0.8);
        g.lineWidth = reached ? 1.5 : 2;
        g.beginPath();
        g.arc(x, G.cy, nr * (hl ? 1.12 : 1), 0, TAU);
        g.stroke();
        g.font = `italic ${cur ? 800 : 700} ${fs(14, 13)}px ${theme.mathFont}`;
        g.fillStyle = reached ? theme.bg : color;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(i === 0 ? 'f' : keys[i - 1]!, x, G.cy + 0.5);
      }
      // Regler-Knopf an der aktuellen Stelle
      const kk = Math.min(3, Math.floor(tl));
      const kc = tl < 1e-6 ? col.f() : colOf(keys[Math.max(0, tl >= 4 - 1e-6 ? 3 : kk)]!);
      const onNode = Math.abs(tl - Math.round(tl)) < 0.02;
      g.strokeStyle = kc;
      g.lineWidth = 2.6;
      g.beginPath();
      g.arc(xt, G.cy, nr + 4.5, 0, TAU);
      g.stroke();
      if (!onNode) {
        g.fillStyle = theme.dark ? theme.text : theme.bg;
        g.beginPath();
        g.arc(xt, G.cy, 6, 0, TAU);
        g.fill();
        g.strokeStyle = kc;
        g.lineWidth = 2;
        g.stroke();
      }
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;
    type RowSpec = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string; text?: boolean; badge?: { label: string; color: string }; dim?: number; indent?: number };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    const infoShown = () => kInfo.v >= 0.5;
    const infoAlpha = () => Math.abs(2 * kInfo.v - 1);

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: { src: string; color: string }, alpha = 1): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        const ind = (r.badge ? 34 : 0) + (r.indent ?? 0);
        const maxW = R.w - 2 * pad - 4 - ind;
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null, lines, font, h: Math.max(lines.length * size * 1.32, r.badge ? 20 : 0), ind };
        }
        const box = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600, 11);
        return { box, lines: [] as string[], font: '', h: Math.max(rowH(box), r.badge ? 20 : 0), ind };
      });
      const h = 38 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card(R, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 38;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = (row.at ?? clamp01(k.stagger * (rows.length + 2) - i)) * alpha;
        if (y + it.h > R.y + R.h - 2) return;
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(a)) * (row.dim ?? 1);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.11);
          roundRect(g, R.x + pad - 6, y - 4, R.w - 2 * pad + 12, it.h + 8, 8);
          g.fill();
          g.fillStyle = row.hl;
          roundRect(g, R.x + pad - 6, y - 4, 3, it.h + 8, 1.5);
          g.fill();
        }
        const dx = (1 - ease.outCubic(clamp01(a))) * 10;
        if (row.badge) badge(R.x + pad + dx, y + 10, row.badge.label, row.badge.color, 1, 26);
        const x0 = R.x + pad + dx + it.ind;
        if (it.box) it.box.draw(g, x0, y + Math.max(it.box.asc, row.badge ? 10 + (it.box.asc - it.box.desc) / 2 : 0));
        else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, x0, y + (row.badge && it.lines.length === 1 ? 10 : size * 0.66) + j * size * 1.32));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      return h;
    }
    const noteRow = (txt: string, size = fs(12, 11)): RowSpec => ({ src: txt, text: true, size, color: th().muted, gap: 6 });

    /** Karte: Funktionsterm (allgemein und mit Zahlen, Farben je Parameter). */
    function termCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const kd = kind();
        const t = target();
        const rows: RowSpec[] = [];
        const num: Trafo = { a: cv('ta', t.a), b: cv('tb', t.b), c: cv('tc', t.c), d: cv('td', t.d) };
        if (infoShown()) {
          if (!compact) rows.push({ src: generalSrc(), size: fs(13, 12), color: th().muted, gap: 8 });
          rows.push({ src: termSrc(kd, t, colored, { num }), size: fs(17, 15), weight: 700, gap: 6 });
          const simp = simplerSrc(kd, t, colored);
          if (simp && !compact) rows.push({ src: `\\t{    }${simp}`, size: fs(14, 13), gap: 6 });
          if (order() === 'swap') {
            rows.push({ src: `\\c{s}{h(x) = ${generalSrc(true)}}`, size: fs(12.5, 11.5), gap: 3 });
            rows.push({ src: `\\c{s}{${termSrc(kd, t, plain, { name: 'h', swap: true })}}`, size: fs(14, 13), weight: 700, gap: 6 });
          }
          if (Math.abs(p.b) < 0.05) rows.push(noteRow(T2('b = 0 ist nicht erlaubt: f(0 · (x − c)) wäre konstant. Gerechnet wird mit b = 0,1.', 'b = 0 is not allowed: f(0 · (x − c)) would be constant. b = 0.1 is used.')));
          else if (near(t.a, 0)) rows.push(noteRow(T2(`a = 0: Der Graph wird auf die Gerade y = ${N(t.d)} zusammengedrückt (konstante Funktion).`, `a = 0: the graph is squashed onto the line y = ${N(t.d)} (constant function).`)));
          else if (!compact && withoutB(kd, t) && !near(t.b, 1) && (kd === 'sq' || kd === 'abs' || kd === 'cub' || kd === 'inv' || kd === 'sqrt')) {
            const note =
              kd === 'sq'
                ? T2(`Bei der Parabel wirkt b wie der Faktor b² = ${N(t.b * t.b)} vor f.`, `For the parabola, b acts like the factor b² = ${N(t.b * t.b)} in front of f.`)
                : kd === 'abs'
                  ? T2(`Beim Betrag wirkt b wie der Faktor |b| = ${N(Math.abs(t.b))} vor f.`, `For |x|, b acts like the factor |b| = ${N(Math.abs(t.b))} in front of f.`)
                  : kd === 'cub'
                    ? T2(`Bei x³ wirkt b wie der Faktor b³ ${eq(t.b ** 3)} ${N(t.b ** 3)} vor f.`, `For x³, b acts like the factor b³ ${eq(t.b ** 3)} ${N(t.b ** 3)} in front of f.`)
                    : kd === 'inv'
                      ? T2(`Bei 1/x wirkt b wie der Faktor 1/b ${eq(1 / t.b)} ${N(1 / t.b)} vor f.`, `For 1/x, b acts like the factor 1/b ${eq(1 / t.b)} ${N(1 / t.b)} in front of f.`)
                      : T2(`Bei √x wirkt b wie der Faktor √b ${eq(Math.sqrt(t.b))} ${N(Math.sqrt(t.b))} vor f.`, `For √x, b acts like the factor √b ${eq(Math.sqrt(t.b))} ${N(Math.sqrt(t.b))} in front of f.`);
            rows.push(noteRow(note));
          }
        } else {
          rows.push({ src: `g(x) = \\c{a}{?} · f(\\c{b}{?}(x − \\c{c}{?})) + \\c{d}{?}`, size: fs(16, 14.5), weight: 700, color: th().text });
          rows.push(noteRow(T2('Welche Werte haben a, b, c und d? Vergleiche den Graphen g mit der Grundfunktion f: Lage des besonderen Punkts, Öffnung, Streckung. „Term aufdecken“ löst auf.', 'What are a, b, c and d? Compare the graph g with the basic function f: position of the special point, opening, stretch. “Reveal the term” shows the answer.'), fs(12.5, 11.5)));
        }
        return formulaCard(R, measure, k, T2('Funktionsterm', 'Function term'), col.g(), rows, { src: `\\t{${say(BASES[kd].name)}}`, color: th().muted }, infoAlpha());
      };
    }

    /** Karte: Schritt für Schritt (Stufenterm und Wirkung als Satz, aktive Stufe hervorgehoben). */
    function stepsCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const kd = kind();
        const t = target();
        const keys = stepKeys(order());
        const swap = order() === 'swap';
        const rows: RowSpec[] = [];
        const show = infoShown();
        const hs = hintState();
        const tl = TL.v;
        const eng = kHint.v > 0.5;
        // Stufenterme
        const stageT: Trafo[] = swap
          ? [
              { a: 1, b: 1, c: 0, d: 0 },
              { a: 1, b: 1, c: t.c, d: 0 },
              { a: 1, b: t.b, c: t.c, d: 0 },
              { a: t.a, b: t.b, c: t.c, d: 0 },
              { ...t },
            ]
          : stages(t);
        const fRow = termSrc(kd, stageT[0]!, plain, { name: 'f' });
        if (!compact) rows.push({ src: fRow, size: fs(13, 12), badge: { label: 'f', color: col.f() }, gap: compact ? 6 : 8, hl: eng && hs?.k === -1 ? col.f() : undefined });
        keys.forEach((key, i) => {
          const reached = !eng || tl > i + 1e-6;
          const active = eng && hs !== null && hs.k === i && tl < 4 - 1e-6;
          const dim = reached || active ? 1 : 0.42;
          const stT = stageT[i + 1]!;
          // gewählte Zahl in der Farbe des Parameters
          const C: Col = (kk, s) => (kk === key ? `\\c{${kk}}{${s}}` : s);
          const term = show ? `y = ${termSrc(kd, stT, C, { name: '', swap: swap && i >= 1 })}` : `y = ${['f(\\c{b}{b}x)', 'f(\\c{b}{b}(x − \\c{c}{c}))', '\\c{a}{a} · f(\\c{b}{b}(x − \\c{c}{c}))', '… + \\c{d}{d}'][stepKeys('std').indexOf(key)] ?? ''}`;
          const lbl = show ? `${key} = ${N(t[key])}` : key;
          if (compact) {
            rows.push({ src: show ? stageText(i) : '?', text: true, size: fs(12.5, 11.5), badge: { label: key, color: colOf(key) }, gap: 6, dim, hl: active ? colOf(key) : undefined });
          } else {
            rows.push({ src: term, size: fs(13, 12), badge: { label: key, color: colOf(key) }, gap: 2, dim, hl: active ? colOf(key) : undefined });
            rows.push({ src: show ? `${lbl}: ${stageText(i)}` : T2('Wie wirkt dieser Parameter?', 'What does this parameter do?'), text: true, size: fs(12, 11), color: th().muted, gap: 8, dim, indent: 34 });
          }
        });
        if (show && swap && !near(t.c, 0) && !near(t.b, 1))
          rows.push({
            ...noteRow(T2(`Ergebnis h(x) = a · f(bx − c) + d: nur um c/b ${eq(t.c / t.b)} ${N(t.c / t.b)} statt um c = ${N(t.c)} verschoben. Für g gilt: erst strecken, dann verschieben.`, `Result h(x) = a · f(bx − c) + d: shifted by only c/b ${eq(t.c / t.b)} ${N(t.c / t.b)} instead of c = ${N(t.c)}. For g: first stretch, then shift.`)),
            color: col.swap(),
          });
        else if (show && swap) rows.push(noteRow(T2('Hier ändert die Reihenfolge nichts, weil b = 1 oder c = 0 ist.', 'Here the order does not matter because b = 1 or c = 0.')));
        else if (!compact) rows.push(noteRow(T2('Reihenfolge: erst b, dann c, dann a, dann d. Zeitleiste unter dem Bild: abspielen, Schritt für Schritt oder ziehen.', 'Order: first b, then c, then a, then d. Timeline below the picture: play, step or drag.')));
        const stepNo = hs ? hs.k + 1 : 0;
        const right = eng && tl < 4 - 1e-6 && stepNo > 0 ? { src: `\\t{${T2('Schritt', 'step')} ${stepNo}/4}`, color: th().muted } : undefined;
        return formulaCard(R, measure, k, swap ? T2('Erst verschieben, dann strecken', 'First shift, then stretch') : T2('Schritt für Schritt', 'Step by step'), swap ? col.swap() : col.b(), rows, right, infoAlpha());
      };
    }

    /** Karte: Punkttabelle f → g. */
    function pointsCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const kp = keyPoints(kind()).slice(0, compact ? 3 : 5);
        const rh = kind() === 'sin' ? fs(28, 26) : fs(22, 20);
        const show = infoShown();
        const ruleBox = fit(`(x${sep}y) \\t{↦} (\\f{x}{\\c{b}{b}} + \\c{c}{c}${sep}\\c{a}{a} · y + \\c{d}{d})`, R.w - 2 * pad - 4, fs(13.5, 12.5), theme.text, 650);
        const h = 38 + rowH(ruleBox) + 10 + (kp.length + 1) * rh + 8;
        if (measure) return h;
        card(R, col.g());
        cardTitle(R, T2('Punkte von f und ihre Bildpunkte', 'Points of f and their images'), col.g());
        const ia = infoAlpha() * ease.outCubic(k.cards);
        g.save();
        g.globalAlpha *= ia;
        let y = R.y + 38;
        ruleBox.draw(g, R.x + pad, y + ruleBox.asc);
        y += rowH(ruleBox) + 10;
        const cx1 = R.x + pad;
        const cx2 = R.x + R.w * 0.47;
        const hf = `700 ${fs(12, 11)}px ${theme.font}`;
        g.font = hf;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText(T2('auf f', 'on f'), cx1, y + rh / 2);
        g.fillText(order() === 'swap' ? T2('auf h', 'on h') : T2('auf g', 'on g'), cx2, y + rh / 2);
        g.strokeStyle = withAlpha(theme.text, 0.18);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y + rh - 1.5);
        g.lineTo(R.x + R.w - pad, y + rh - 1.5);
        g.stroke();
        y += rh;
        const tt = result();
        const hov = hover?.id?.startsWith('p') ? Number(hover.id.slice(1)) : -1;
        kp.forEach(([u, v], i) => {
          const at = clamp01(k.stagger * (kp.length + 3) - i - 1);
          g.save();
          g.globalAlpha *= ease.outCubic(at);
          if (i === hov) {
            g.fillStyle = withAlpha(col.g(), theme.dark ? 0.2 : 0.1);
            roundRect(g, R.x + pad - 6, y + 1, R.w - 2 * pad + 12, rh - 2, 6);
            g.fill();
          }
          const [x1, y1] = mapPoint(tt, u, v);
          const sz = fs(13, 12);
          const bf = formula(g, pt(X(u), N(v)), fstyle(sz, theme.muted, 600));
          bf.draw(g, cx1, y + rh / 2 + (bf.asc - bf.desc) / 2);
          g.font = `600 ${sz}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'center';
          g.fillText('↦', (cx1 + bf.w + cx2) / 2 + 2, y + rh / 2);
          const gs = show ? pt(X(cnt(`px${i}`, x1)), N(cnt(`py${i}`, y1))) : pt('?', '?');
          const bg = fit(`\\c{${order() === 'swap' ? 's' : 'g'}}{${gs}}`, R.x + R.w - pad - cx2, sz, theme.text, 700);
          bg.draw(g, cx2, y + rh / 2 + (bg.asc - bg.desc) / 2);
          g.restore();
          y += rh;
        });
        g.restore();
        return h;
      };
    }

    /** Karte: Eigenschaften von g (je nach Grundfunktion). */
    function propsCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const kd = kind();
        const t = target();
        const rows: RowSpec[] = [];
        const sz = fs(13, 12);
        if (infoShown()) {
          const P = pt(X(t.c), N(t.d));
          if (near(t.a, 0)) rows.push({ src: `\\t{${T2('konstante Funktion', 'constant function')}} y = ${N(t.d)}`, size: sz });
          else if (kd === 'sq') rows.push({ src: `\\t{${T2('Scheitel', 'vertex')}} S${P}, \\t{${T2('nach', 'opens')} ${t.a > 0 ? T2('oben', 'up') : T2('unten', 'down')} ${T2('geöffnet', '')}}`, size: sz });
          else if (kd === 'abs') rows.push({ src: `\\t{${T2('Knickpunkt', 'corner point')}} ${P}, \\t{${T2('nach', 'opens')} ${t.a > 0 ? T2('oben', 'up') : T2('unten', 'down')} ${T2('geöffnet', '')}}`, size: sz });
          else if (kd === 'sqrt') rows.push({ src: `\\t{${T2('Randpunkt', 'end point')}} ${P}`, size: sz });
          else if (kd === 'cub' || kd === 'inv') rows.push({ src: `\\t{${T2('Symmetriezentrum', 'centre of symmetry')}} Z${P}`, size: sz });
          else if (kd === 'sin') {
            const sd = sineData(t);
            rows.push({ src: `\\t{${T2('Amplitude', 'amplitude')}} |a| = ${N(sd.amplitude)}   \\t{${T2('Periode', 'period')}} \\f{2π}{|b|} ${piSrc(sd.period) ? '=' : eq(sd.period)} ${piSrc(sd.period) ?? N(sd.period)}`, size: sz });
            rows.push({ src: `\\t{${T2('Mittellinie', 'midline')}} y = ${N(sd.midline)}`, size: sz });
          } else if (kd === 'exp') rows.push({ src: `\\t{${T2('Bild von', 'image of')}} ${pt('0', '1')}: ${pt(X(t.c), N(t.a + t.d))}`, size: sz });
          rows.push({ src: `D_g = ${setSrc(domainOf(kd, t), true)}   W_g = ${setSrc(rangeOf(kd, t), false)}`, size: sz });
          if (kd === 'inv') rows.push({ src: `\\t{${T2('Asymptoten', 'asymptotes')}} \\c{d}{x = ${N(t.c)}}${T2(' und ', ' and ')}\\c{d}{y = ${N(t.d)}}`, size: sz });
          if (kd === 'exp') rows.push({ src: `\\t{${T2('Asymptote', 'asymptote')}} \\c{d}{y = ${N(t.d)}}`, size: sz });
          const sym = symmetryOf(kd, t);
          if (sym.axis !== undefined && !compact) rows.push({ src: `\\t{${T2('Symmetrieachse', 'axis of symmetry')}} x = ${N(sym.axis)}`, size: sz });
          // Nullstellen
          const per = kd === 'sin' ? sineData(t).period : 0;
          const z = kd === 'sin' ? zerosIn(kd, t, t.c, t.c + per - 1e-9) : zerosIn(kd, t);
          let zs: string;
          if (z === 'all') zs = T2('alle x', 'every x');
          else if (!z.length) zs = T2('keine', 'none');
          else zs = z.map((x) => `x ${eq(x)} ${N(x)}`).join('; ') + (kd === 'sin' ? T2(' (in einer Periode ab c)', ' (in one period from c)') : '');
          rows.push({ src: `\\t{${T2('Nullstellen', 'zeros')}}: ${zs}`, size: sz });
          const y0 = yIntercept(kd, t);
          if (!compact) rows.push({ src: Number.isFinite(y0) ? `g(0) ${eq(y0)} ${N(y0)}` : `g(0) \\t{${T2('nicht definiert', 'not defined')}}`, size: sz });
        } else {
          rows.push(noteRow(T2('Erst schätzen: Wo liegt der besondere Punkt? Wohin ist der Graph geöffnet? Welche Werte nimmt g an?', 'Estimate first: where is the special point? Which way does the graph open? Which values does g take?'), fs(12.5, 11.5)));
        }
        return formulaCard(R, measure, k, T2('Eigenschaften von g', 'Properties of g'), col.d(), rows, undefined, infoAlpha());
      };
    }

    function drawColumn(C0: Rect, k: Intro): void {
      const g = surface.g;
      const gap = fs(10, 8);
      const list: { id: string; fn: CardFn }[] = [
        { id: 'term', fn: termCard(k) },
        { id: 'steps', fn: stepsCard(k) },
        ...(p.tbl ? [{ id: 'pts', fn: pointsCard(k) }] : []),
        ...(p.props ? [{ id: 'props', fn: propsCard(k) }] : []),
      ];
      // Höhen messen; reicht der Platz nicht, Karten nacheinander verkürzen (erst Schrittfolge, dann Punkte, Eigenschaften, Term)
      const measure = (C: Rect) => {
        const room = { x: C.x, y: C.y, w: C.w, h: C.h };
        const full = list.map((c) => c.fn(room, true, false));
        const short = list.map((c) => c.fn(room, true, true));
        const compactSet = new Set<number>();
        const total = () => list.reduce((s, _, i) => s + (compactSet.has(i) ? short[i]! : full[i]!) + gap, -gap);
        for (const i of [1, 2, 3, 0].filter((j) => j < list.length)) {
          if (total() <= C.h + 1) break;
          if (short[i]! < full[i]!) compactSet.add(i);
        }
        return { full, short, compactSet, total: total() };
      };
      // Passen auch die kurzen Karten nicht (z. B. iPad), die Spalte leicht verkleinern (höchstens auf 80 %), damit keine Karte wegfällt
      let sc = 1;
      let C: Rect = C0;
      let m = measure(C);
      for (let it = 0; it < 3 && m.total > C.h + 1 && sc > 0.8 + 1e-6; it++) {
        sc = Math.max(0.8, sc * ((C.h - 2) / m.total));
        C = { x: 0, y: 0, w: C0.w / sc, h: C0.h / sc };
        m = measure(C);
      }
      if (sc < 1) C = { x: 0, y: 0, w: C0.w / sc, h: C0.h / sc };
      const { full, short, compactSet } = m;
      g.save();
      if (sc < 1) {
        g.translate(C0.x, C0.y);
        g.scale(sc, sc);
      }
      let y = C.y;
      list.forEach((c, i) => {
        const compact = compactSet.has(i);
        const goal = compact ? short[i]! : full[i]!;
        if (y + goal > C.y + C.h + 1) return;
        let ch = cardH.get(c.id);
        if (!ch) {
          ch = new Chan(goal);
          cardH.set(c.id, ch);
        }
        if (ch.goal !== goal) {
          if (reduced()) ch.jump(goal);
          else ch.follow(goal, 0.12);
        }
        const hh = Math.min(ch.v, goal + 40);
        if (y + Math.min(hh, goal) > C.y + C.h + 1) return;
        const a = clamp01(k.cards * 1.6 - i * 0.22);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        const R = { x: C.x, y, w: C.w, h: hh };
        g.save();
        g.beginPath();
        g.rect(R.x - 20, R.y - 20, R.w + 40, R.h + 26);
        g.clip();
        c.fn(R, false, compact);
        g.restore();
        g.restore();
        y += hh + gap;
      });
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    /** Kurzschrift → HTML (Ergebnisse unter der Bühne). */
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
          out += buf.replace(/(^|[^\p{L}])(\p{L})(?![\p{L}])/gu, (_, pre: string, ch: string) => (ch === 'ℝ' ? `${pre}${ch}` : `${pre}<var>${ch}</var>`));
          buf = '';
        };
        while (i < src.length && src[i] !== end) {
          const ch = src[i]!;
          if (ch === '\\' && 'fcbtr'.includes(src[i + 1] ?? '')) {
            const cmd = src[i + 1]!;
            i += 2;
            flush();
            if (cmd === 'f') {
              const a = group();
              out += `<span class="frac"><span>${a}</span><span>${group()}</span></span>`;
            } else if (cmd === 'c') {
              group();
              out += group();
            } else if (cmd === 'r') out += `√(${group()})`;
            else if (cmd === 'b') out += `<strong>${group()}</strong>`;
            else out += group();
          } else if (ch === '^' || ch === '_') {
            flush();
            i++;
            out += ch === '^' ? `<sup>${group()}</sup>` : `<sub>${group()}</sub>`;
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
    function updateReadouts(): void {
      const kd = kind();
      const t = target();
      const simp = simplerSrc(kd, t, plain);
      let gs = termSrc(kd, t, plain);
      if (simp) gs += ` ${simp}`;
      if (order() === 'swap') gs += `; ${T2('vertauscht', 'swapped')}: ${termSrc(kd, t, plain, { name: 'h', swap: true })}`;
      ctx.readout('g', { html: toHtml(gs) });
      // Nur Punkte, die wirklich auf dem Graphen von f liegen (der Anker ist bei 1/x und 2ˣ kein Graphpunkt)
      const maps = keyPoints(kd)
        .slice(0, 3)
        .map(([u, v]) => {
          const [x, y] = mapPoint(t, u, v);
          return `${pt(X(u), N(v))} \\t{↦} ${pt(X(x), N(y))}`;
        });
      ctx.readout('map', { html: toHtml(maps.join(';  ')) });
      const parts = [`D_g = ${setSrc(domainOf(kd, t), true)}`, `W_g = ${setSrc(rangeOf(kd, t), false)}`];
      if (kd === 'sin') parts.push(`${T2('Periode', 'period')} ${piSrc(sineData(t).period) ?? N(sineData(t).period)}`);
      ctx.readout('prop', { html: toHtml(parts.join(';  ')) });
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
      for (const c of chans()) if (c.step(now, dt)) anim = true;
      if (intro !== null || pops.length || dragging()) anim = true;
      if (fIn !== null && now - fIn > 1500) fIn = null;
      if (fIn !== null) anim = true;
      if (prevKind && now - prevKind.t0 > 520) prevKind = null;
      if (prevKind) anim = true;
      // Spiegelachse pulsiert, solange die Stufe läuft
      const hs = hintState();
      if (hs && hs.local > 0 && hs.local < 1) anim = true;
      const k = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawPlot(now, k);
      drawTimeline(R.tl, k);
      g.restore();
      drawColumn(R.col, k);
      if (numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retargetShape(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const g = toAffine(target());
      const goals: [Chan, number][] = [
        [CS, g.s],
        [CH, g.h],
        [CA, g.a],
        [CD, g.d],
      ];
      const soft = source === 'replace' || taskLoad;
      goals.forEach(([c, v], i) => {
        if (instant) c.jump(v);
        else if (drag && drag.kind !== 'scrub') c.follow(v, 0.04);
        else if (soft) c.glide(v, 850, i * 90, now);
        else if (c.goal !== v) c.follow(v, 0.13);
      });
    }
    function retargetFlags(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const flags: [Chan, number][] = [
        [kInfo, p.info ? 1 : 0],
        [kBase, p.base ? 1 : 0],
        [kPts, p.pts ? 1 : 0],
        [kSwap, p.ord === 'swap' ? 1 : 0],
      ];
      for (const [c, v] of flags) {
        if (instant) c.jump(v);
        else if (c.goal !== v) c.glide(v, c === kInfo ? 900 : 480, 0, now);
      }
    }
    function setEngaged(on: boolean, now: number): void {
      engaged = on;
      if (reduced()) kHint.jump(on ? 1 : 0);
      else if (kHint.goal !== (on ? 1 : 0)) kHint.glide(on ? 1 : 0, on ? 300 : 500, 0, now);
    }
    /**
     * Reduzierte Bewegung: statt abzuspielen auf eine Stufe springen und stehen
     * bleiben (`restart`: auf Stufe 1, sonst eine Stufe weiter). Weiter geht es
     * mit „Schritt vor“ oder der Zeitleiste.
     */
    function stepReduced(now: number, restart: boolean): void {
      const goal = restart || !engaged || TL.goal >= 4 - 1e-6 ? 1 : Math.min(4, Math.floor(TL.goal + 1e-6) + 1);
      setEngaged(true, now);
      TL.jump(goal);
      storyTime = storyTimeOf(goal, plan());
      // erst nach den übrigen Rückmeldungen der Uhr anhalten
      if (ctx.clock.playing) queueMicrotask(() => ctx.clock.pause());
    }
    /** Schrittfolge von vorn abspielen (erst zurückspulen). `auto`: nicht vom Nutzer ausgelöst. */
    function startStory(now: number, auto = false): void {
      if (reduced()) {
        if (!auto) stepReduced(now, true);
        return;
      }
      setEngaged(true, now);
      storyTime = 0;
      if (reduced()) TL.jump(0);
      else if (TL.v > 1e-6) TL.glide(0, 500 + 180 * TL.v, 0, now);
      if (!ctx.clock.playing) ctx.clock.play();
    }
    /** Auf der Zeitleiste zu einer Stufe gleiten (angehalten). */
    function goTo(tl: number, now: number): void {
      ctx.clock.pause();
      setEngaged(true, now);
      const goal = clamp(tl, 0, 4);
      storyTime = storyTimeOf(goal, plan());
      if (reduced()) TL.jump(goal);
      else TL.glide(goal, 700 + 320 * Math.min(2, Math.abs(goal - TL.v)), 0, now);
    }
    function setLabels(): void {
      const t = TL.goal;
      ctx.setAction('prev', { enabled: editable() && t > 1e-6 });
      ctx.setAction('next', { enabled: editable() && t < 4 - 1e-6 });
      ctx.setAction('steps', { enabled: editable() });
      ctx.setAction('reveal', { enabled: editable() });
      ctx.setAction('task', { enabled: editable() });
    }

    ctx.clock.onChange((playing) => {
      const now = performance.now();
      if (playing) {
        // gesperrt oder Aufgabenmodus: nichts abspielen (die Zwischenstufen verrieten die Lösung)
        if (ctx.locked || !p.info) {
          queueMicrotask(() => ctx.clock.pause());
          return;
        }
        if (reduced()) {
          stepReduced(now, false);
          setLabels();
          ctx.requestRender();
          return;
        }
        // am Ende (oder ohne laufende Schrittfolge): von vorn
        if (!engaged || TL.goal >= 4 - 1e-6) startStory(now);
        else setEngaged(true, now);
      }
      setLabels();
      ctx.requestRender();
    });

    /* ---------- Zeiger: Anker und Formpunkt ziehen, Zeitleiste bedienen ---------- */
    function hit(px: number, py: number, touch: boolean): string | null {
      const R = regions();
      const T = R.tl;
      if (T.h >= 20 && px >= T.x && px <= T.x + T.w && py >= T.y && py <= T.y + T.h && kInfo.v > 0.5) {
        const G = tlGeom(T);
        if (Math.hypot(px - G.play.x, py - G.play.y) < G.play.r + 6) return 'play';
        for (let i = 0; i <= 4; i++) if (Math.abs(px - nodeX(G, i)) < (touch ? 16 : 12)) return `n${i}`;
        if (px >= G.x0 - 10 && px <= G.x1 + 10) return 'track';
        return null;
      }
      const r = plot.rect;
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      const rad = touch ? 24 : 15;
      const { A } = display();
      if (handlesOn()) {
        const hp = handlePos(A);
        const da = Math.hypot(px - plot.px(hp.anchor[0]), py - plot.py(hp.anchor[1]));
        const df = Math.hypot(px - plot.px(hp.form[0]), py - plot.py(hp.form[1]));
        if (df < rad && df <= da) return 'form';
        if (da < rad) return 'anchor';
      }
      if (kPts.v > 0.5 && kInfo.v > 0.5) {
        const kp = keyPoints(kind());
        for (let i = 0; i < kp.length; i++) {
          const [u, v] = kp[i]!;
          const q = plot.toPx(...mapAffine(A, u, v));
          if (Math.hypot(px - q[0], py - q[1]) < (touch ? 18 : 10)) return `p${i}`;
        }
      }
      return null;
    }
    const cursorFor = (id: string | null) => (id === 'anchor' || id === 'form' ? 'grab' : id === 'play' || id?.startsWith('n') ? 'pointer' : id === 'track' ? 'ew-resize' : id?.startsWith('p') ? 'help' : '');
    function scrubTo(px: number): void {
      const G = tlGeom(regions().tl);
      const tl = clamp(((px - G.x0) / (G.x1 - G.x0)) * 4, 0, 4);
      ctx.clock.pause();
      setEngaged(true, performance.now());
      TL.jump(tl);
      storyTime = storyTimeOf(tl, plan());
      setLabels();
    }
    const target2: Target = {
      contains: (px: number, py: number) => hit(px, py, false) !== null,
      pointerDown: (q: Ptr) => {
        const id = hit(q.px, q.py, q.type === 'touch');
        if (!id) return false;
        if (!editable() && !id.startsWith('p')) return false;
        if (id === 'play') {
          if (ctx.clock.playing) ctx.clock.pause();
          else ctx.clock.play();
          ctx.requestRender();
          return true;
        }
        if (id.startsWith('n') || id === 'track') {
          drag = { kind: 'scrub', sx: q.px, moved: false };
          hover = { id, px: q.px, py: q.py };
          if (id === 'track') {
            drag.moved = true;
            scrubTo(q.px);
          }
          ctx.requestRender();
          return true;
        }
        if (id === 'anchor' || id === 'form') {
          const { A } = display();
          const hp = handlePos(A)[id];
          const [wx, wy] = plot.toWorld(q.px, q.py);
          drag = { kind: id, off: [hp[0] - wx, hp[1] - wy] };
          hover = { id, px: q.px, py: q.py };
          surface.setCursor('grabbing');
          ctx.requestRender();
          return true;
        }
        if (id.startsWith('p')) {
          hover = { id, px: q.px, py: q.py };
          ctx.requestRender();
          return q.type === 'touch';
        }
        return false;
      },
      pointerMove: (q: Ptr) => {
        if (!drag) return;
        lastDrag = performance.now();
        if (drag.kind === 'scrub') {
          if (!drag.moved && Math.abs(q.px - drag.sx) > 4) drag.moved = true;
          if (drag.moved) scrubTo(q.px);
          ctx.requestRender();
          return;
        }
        const [wx, wy] = plot.toWorld(q.px, q.py);
        const x = wx + drag.off[0];
        const y = wy + drag.off[1];
        const r1 = (v: number) => Math.round(v * 10) / 10;
        if (drag.kind === 'anchor') {
          setP({ c: r1(clamp(x, -5, 5)), d: r1(clamp(y, -5, 5)) });
        } else {
          const t = target();
          const f = formFromPoint(kind(), t.c, t.d, x, y);
          const vals: Record<string, number> = { a: r1(clamp(f.a, -3, 3)) };
          if (f.b !== null) {
            let b = r1(clamp(f.b, -3, 3));
            if (Math.abs(b) < 0.1) b = f.b < 0 ? -0.1 : 0.1;
            vals.b = b;
          }
          setP(vals);
        }
        ctx.requestRender();
      },
      pointerUp: (q: Ptr) => {
        const d = drag;
        drag = null;
        const now = performance.now();
        if (d?.kind === 'scrub' && !d.moved && hover?.id?.startsWith('n')) goTo(Number(hover.id.slice(1)), now);
        if (d && d.kind !== 'scrub') retargetView(now, false);
        const id = hit(q.px, q.py, false);
        hover = id ? { id, px: q.px, py: q.py } : null;
        if (q.type === 'touch' && id?.startsWith('p')) hover = null;
        surface.setCursor(cursorFor(id));
        setLabels();
        ctx.requestRender();
      },
      hover: (q: Ptr | null) => {
        const id = q ? hit(q.px, q.py, false) : null;
        const prev = hover?.id ?? null;
        hover = q && id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(cursorFor(id));
        if (prev !== id) ctx.requestRender();
      },
      wheel: () => false,
    };
    surface.addTarget(target2);

    return {
      update(changed, source) {
        const now = performance.now();
        // b = 0 ist nicht erlaubt: beim Bedienen auf die andere Seite springen
        if (source === 'input' && changed.has('b') && Math.abs(p.b) < 0.05) {
          setP({ b: prevSign.b > 0 ? -0.1 : 0.1 });
          return;
        }
        const t = target();
        // Spiegelung beim Vorzeichenwechsel melden (nicht bei reduzierter Bewegung: Die Meldung blendet
        // ein und aus; die Spiegelung steht ohnehin in der Karte „Schritt für Schritt“)
        if (source !== 'init' && !taskLoad && !reduced()) {
          const sa = Math.sign(t.a);
          const sb = Math.sign(t.b);
          if (sa !== prevSign.a && sa !== 0 && prevSign.a !== 0)
            pops.push({ t0: now, axis: 'x', color: col.a(), src: `\\c{a}{${sa < 0 ? `a < 0: \\t{${T2('Spiegelung an der Geraden', 'reflection in the line')}} y = ${N(t.d)}` : `a > 0: \\t{${T2('nicht mehr gespiegelt', 'no longer reflected')}}`}}` });
          if (sb !== prevSign.b)
            pops.push({ t0: now, axis: 'y', color: col.b(), src: `\\c{b}{${sb < 0 ? `b < 0: \\t{${T2('Spiegelung an der Geraden', 'reflection in the line')}} x = ${N(t.c)}` : `b > 0: \\t{${T2('nicht mehr gespiegelt', 'no longer reflected')}}`}}` });
          if (pops.length > 2) pops = pops.slice(-2);
        }
        prevSign = { a: Math.sign(t.a), b: Math.sign(t.b) };
        const fChanged = changed.has('f') && source !== 'init' && prevKindKey !== kind();
        if (fChanged) {
          if (!reduced()) {
            prevKind = { kind: prevKindKey, t0: now, A: shownG() };
            fIn = now;
          }
          ctx.clock.pause();
          TL.jump(4);
          storyTime = storyDuration(plan());
          setEngaged(false, now);
          morphFromF(now, 420);
        } else if (taskLoad) morphFromF(now, 0);
        else retargetShape(now, source);
        taskLoad = false;
        prevKindKey = kind();
        retargetFlags(now, source);
        // Parameter geändert: Schrittfolge zum Ende (außer sie läuft gerade)
        const paramKeys = ['a', 'b', 'c', 'd', 'f'];
        if (source !== 'init' && [...changed].some((key) => paramKeys.includes(key)) && !ctx.clock.playing && !fChanged) {
          if (engaged || TL.goal < 4) {
            setEngaged(false, now);
            if (reduced()) TL.jump(4);
            else TL.glide(4, 600, 0, now);
            storyTime = storyDuration(plan());
          }
        }
        // Reihenfolge gewechselt oder Term aufgedeckt: Schrittfolge abspielen
        const revealed = changed.has('info') && p.info && source !== 'init';
        if (source !== 'init' && editable() && ((changed.has('ord') && (p.ord === 'swap' || source === 'input')) || revealed)) startStory(now, true);
        if (changed.has('info') && !p.info) {
          ctx.clock.pause();
          setEngaged(false, now);
          TL.jump(4);
        }
        if (!drag || drag.kind === 'scrub') retargetView(now, source === 'init');
        if (source === 'init') {
          if (!reduced()) {
            intro = now;
            morphFromF(now, 1150);
          }
        }
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'steps') startStory(now);
        else if (id === 'next') goTo(Math.floor(TL.goal + 1e-6) + 1, now);
        else if (id === 'prev') goTo(Math.ceil(TL.goal - 1e-6) - 1, now);
        else if (id === 'reveal') setP({ info: true });
        else if (id === 'task') {
          const t = randomTask(kind(), Math.random);
          taskLoad = true;
          setP({ a: t.a, b: t.b, c: t.c, d: t.d });
        }
        setLabels();
        ctx.requestRender();
      },
      tick(dt) {
        if (!engaged) setEngaged(true, performance.now());
        if (TL.busy) return;
        storyTime += dt;
        const pos = storyPos(storyTime, plan());
        if (reduced()) TL.jump(Math.floor(pos + 1e-9));
        else TL.jump(pos);
        if (storyTime >= storyDuration(plan())) {
          TL.jump(4);
          ctx.clock.pause();
        }
        setLabels();
      },
      resetTime() {
        const now = performance.now();
        setEngaged(true, now);
        storyTime = 0;
        if (reduced()) TL.jump(0);
        else TL.glide(0, 650, 0, now);
        setLabels();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
