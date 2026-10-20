import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  angles,
  areaSAS,
  CASES,
  circumcenter,
  circumradius,
  cosineFigure,
  DEG,
  foot,
  isFlat,
  lakeDistance,
  lawFor,
  placeB,
  placeSolved,
  randomTriangle,
  sides,
  sineProof,
  solve,
  survey,
  type Case,
  type Given,
  type Quad,
  type SolveResult,
  type Tri,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Px = [number, number];
type Pt = readonly [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPx = (a: Px, b: Px, t: number): Px => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const TAU = Math.PI * 2;
const sinD = (w: number) => Math.sin(w * DEG);
const cosD = (w: number) => Math.cos(w * DEG);

/** Zeichenblatt für die ziehbaren Ecken (cm). */
const W = 12;
const H = 8;

type Mode = 'sin' | 'cos' | 'solve' | 'app';
type App = 'tree' | 'lake';
type Scene = 'sin' | 'cos' | 'solve' | 'tree' | 'lake';
type Law = 'sin' | 'cos';
const sceneOf = (m: Mode, a: App): Scene => (m === 'app' ? a : m);
type Vals = Record<string, unknown>;
const isMode =
  (...m: Mode[]) =>
  (v: Vals) =>
    m.includes(v.m as Mode);
const isApp =
  (...a: App[]) =>
  (v: Vals) =>
    v.m === 'app' && a.includes(v.app as App);

/** Welche Stücke im Löser gegeben sind. */
type GKey = keyof Given;
const USES: Record<Case, GKey[]> = { sss: ['a', 'b', 'c'], sws: ['a', 'b', 'ga'], wsw: ['c', 'al', 'be'], ssw: ['a', 'c', 'al'] };
/** Beispielwerte beim Wechsel des Falls (die Prüfwerte aus dem Unterricht). */
const EXAMPLE: Record<Case, Partial<Given>> = {
  sss: { a: 4, b: 5, c: 6 },
  sws: { a: 7, b: 5, ga: 60 },
  wsw: { c: 10, al: 40, be: 60 },
  ssw: { a: 4, c: 6, al: 30 },
};
const usesKey = (key: GKey) => (v: Vals) => v.m === 'solve' && USES[v.g as Case].includes(key);
const CASE_NAME: Record<Case, Txt> = { sss: L('SSS', 'SSS'), sws: L('SWS', 'SAS'), wsw: L('WSW', 'ASA'), ssw: L('SSW', 'SSA') };

/** Ziehbare oder antippbare Stellen. */
type HitId = 'A' | 'B' | 'C' | 'T' | 'S' | 'LA' | 'LB' | `case-${Case}`;
interface Hit {
  id: HitId;
  x: number;
  y: number;
  r: number;
  w?: number;
  h?: number;
}

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

/** „γ durch 90° fahren“: Haltepunkte des Winkels γ mit Fahrzeit und Pause (ms). */
const SWEEP_G: { to: number; dur: number; hold: number }[] = [
  { to: 40, dur: 1100, hold: 500 },
  { to: 90, dur: 1500, hold: 1300 },
  { to: 140, dur: 1700, hold: 900 },
];
const SWEEP_BACK = 1200;
const SWEEP_END = SWEEP_G.reduce((s, x) => s + x.dur + x.hold, 0) + SWEEP_BACK;
/** „Beweis abspielen“: Zeitplan (ms). */
const PROOF_ROWS = [1300, 2600, 3900, 4900, 5900];
const PROOF_END = 7000;
/** „Schritt für Schritt lösen“: Abstand der Schritte (ms). */
const STEP_GAP = 1000;

/**
 * Sinussatz und Kosinussatz. Hauptansicht: allgemeines Dreieck auf Karopapier mit ziehbaren
 * Ecken; Seite und Gegenwinkel haben dieselbe Farbe (a/α blau, b/β rot, c/γ grün).
 * Sinussatz: Umkreis mit Durchmesser 2r, drei gleich lange Balken a : sin α = b : sin β = c : sin γ;
 * Hauptanimation „Beweis abspielen“: Die Höhe h_c fällt, die Teildreiecke leuchten nacheinander auf,
 * die Rechnung entsteht Zeile für Zeile. Kosinussatz: Quadrate an den Seiten, die Höhen teilen sie in
 * Rechtecke; die beiden Rechtecke ab · cos γ bei C sind die Korrektur. Animation „γ durch 90° fahren“:
 * Die Korrektur schrumpft auf 0 (Pythagoras) und kommt bei stumpfem γ außen dazu. Dazu ein Löser
 * „Welcher Satz passt?“ (SSS, SWS, WSW, SSW mit zwei Lösungen) und zwei gezeichnete Vermessungen.
 */
export default defineSimulation({
  id: 'sinussatz-kosinussatz',
  dragHint: true,
  layout: { aspect: 1.4, aspectNarrow: 0.37 },
  groups: [
    { id: 'pts', label: L('Ecken (in cm)', 'Vertices (in cm)') },
    { id: 'given', label: L('Gegebene Stücke', 'Given parts') },
    { id: 'meas', label: L('Messwerte', 'Measurements') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'm',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'sin', label: L('Sinussatz', 'Law of sines') },
        { value: 'cos', label: L('Kosinussatz', 'Law of cosines') },
        { value: 'solve', label: L('Welcher Satz passt?', 'Which law fits?') },
        { value: 'app', label: L('Anwendungen', 'Applications') },
      ],
      default: 'sin',
    },
    {
      key: 'app',
      type: 'choice',
      label: L('Anwendung', 'Application'),
      options: [
        { value: 'tree', label: L('Baum am anderen Ufer (WSW)', 'Tree across the river (ASA)') },
        { value: 'lake', label: L('Quer über den See (SWS)', 'Across the lake (SAS)') },
      ],
      default: 'tree',
      visibleIf: isMode('app'),
    },
    {
      key: 'g',
      type: 'choice',
      label: L('Gegeben', 'Given'),
      help: L('Auch die Felder oben im Bild antippen.', 'You can also tap the chips at the top of the picture.'),
      options: [
        { value: 'sss', label: L('SSS: drei Seiten', 'SSS: three sides') },
        { value: 'sws', label: L('SWS: zwei Seiten, Zwischenwinkel', 'SAS: two sides, included angle') },
        { value: 'wsw', label: L('WSW: eine Seite, zwei Winkel', 'ASA: one side, two angles') },
        { value: 'ssw', label: L('SSW: zwei Seiten, Gegenwinkel', 'SSA: two sides, opposite angle') },
      ],
      default: 'sws',
      visibleIf: isMode('solve'),
    },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: x', 'A: x'), help: L('Die Ecken lassen sich auch im Bild ziehen.', 'You can also drag the vertices in the picture.'), min: 0, max: W, step: 0.1, default: 1, unit: 'cm', visibleIf: isMode('sin', 'cos') },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: y', 'A: y'), min: 0, max: H, step: 0.1, default: 1, unit: 'cm', visibleIf: isMode('sin', 'cos') },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: x', 'B: x'), min: 0, max: W, step: 0.1, default: 10, unit: 'cm', visibleIf: isMode('sin', 'cos') },
    { key: 'by', type: 'number', group: 'pts', label: L('B: y', 'B: y'), min: 0, max: H, step: 0.1, default: 1, unit: 'cm', visibleIf: isMode('sin', 'cos') },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: x', 'C: x'), min: 0, max: W, step: 0.1, default: 4, unit: 'cm', visibleIf: isMode('sin', 'cos') },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: y', 'C: y'), min: 0, max: H, step: 0.1, default: 6, unit: 'cm', visibleIf: isMode('sin', 'cos') },
    { key: 'a', type: 'number', group: 'given', label: L('Seite a', 'Side a'), min: 0.5, max: 12, step: 0.1, default: 7, unit: 'cm', visibleIf: usesKey('a') },
    { key: 'b', type: 'number', group: 'given', label: L('Seite b', 'Side b'), min: 0.5, max: 12, step: 0.1, default: 5, unit: 'cm', visibleIf: usesKey('b') },
    { key: 'c', type: 'number', group: 'given', label: L('Seite c', 'Side c'), min: 0.5, max: 12, step: 0.1, default: 6, unit: 'cm', visibleIf: usesKey('c') },
    { key: 'al', type: 'number', group: 'given', label: L('Winkel α', 'Angle α'), min: 1, max: 179, step: 0.5, default: 30, unit: '°', visibleIf: usesKey('al') },
    { key: 'be', type: 'number', group: 'given', label: L('Winkel β', 'Angle β'), min: 1, max: 179, step: 0.5, default: 60, unit: '°', visibleIf: usesKey('be') },
    { key: 'ga', type: 'number', group: 'given', label: L('Winkel γ', 'Angle γ'), min: 1, max: 179, step: 0.5, default: 60, unit: '°', visibleIf: usesKey('ga') },
    { key: 's', type: 'number', group: 'meas', label: L('Standlinie s = |AB|', 'Baseline s = |AB|'), help: L('Auch B im Bild ziehen.', 'You can also drag B in the picture.'), min: 50, max: 400, step: 10, default: 200, unit: 'm', visibleIf: isApp('tree') },
    { key: 'p1', type: 'number', group: 'meas', label: L('Winkel α bei A', 'Angle α at A'), help: L('Auch den Baum im Bild ziehen.', 'You can also drag the tree in the picture.'), min: 20, max: 85, step: 1, default: 70, unit: '°', visibleIf: isApp('tree') },
    { key: 'p2', type: 'number', group: 'meas', label: L('Winkel β bei B', 'Angle β at B'), min: 20, max: 85, step: 1, default: 60, unit: '°', visibleIf: isApp('tree') },
    { key: 'd1', type: 'number', group: 'meas', label: L('Entfernung b = |CA|', 'Distance b = |CA|'), help: L('Auch die Orte A und B im Bild ziehen.', 'You can also drag the places A and B in the picture.'), min: 100, max: 1500, step: 10, default: 600, unit: 'm', visibleIf: isApp('lake') },
    { key: 'd2', type: 'number', group: 'meas', label: L('Entfernung a = |CB|', 'Distance a = |CB|'), min: 100, max: 1500, step: 10, default: 450, unit: 'm', visibleIf: isApp('lake') },
    { key: 'w', type: 'number', group: 'meas', label: L('Winkel γ bei C', 'Angle γ at C'), min: 20, max: 160, step: 1, default: 70, unit: '°', visibleIf: isApp('lake') },
    { key: 'h', type: 'boolean', group: 'view', label: L('Beweisidee (Höhen)', 'Proof idea (altitudes)'), default: true, visibleIf: isMode('sin', 'cos') },
    { key: 'k', type: 'boolean', group: 'view', label: L('Umkreis zeigen', 'Show the circumcircle'), default: true, visibleIf: isMode('sin') },
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
    { id: 'proof', label: L('Beweis abspielen', 'Play the proof'), primary: true, visibleIf: isMode('sin') },
    { id: 'sweep', label: L('γ durch 90° fahren', 'Sweep γ through 90°'), primary: true, visibleIf: isMode('cos') },
    { id: 'solve', label: L('Schritt für Schritt lösen', 'Solve step by step'), primary: true, visibleIf: isMode('solve') },
    { id: 'measure', label: L('Messung abspielen', 'Play the measurement'), primary: true, visibleIf: isMode('app') },
    { id: 'rand', label: L('Neues Dreieck', 'New triangle'), visibleIf: isMode('sin', 'cos') },
  ],
  readouts: [
    { key: 'sides', label: L('Seiten', 'Sides'), spoiler: true },
    { key: 'angles', label: L('Winkel', 'Angles'), spoiler: true },
    { key: 'law', label: L('Satz', 'Law'), spoiler: true },
  ],
  presets: [
    { id: 'std', label: L('Sinussatz: spitzwinkliges Dreieck', 'Law of sines: acute triangle'), values: {} },
    { id: 'cos', label: L('Kosinussatz: spitzer Winkel γ', 'Law of cosines: acute angle γ'), values: { m: 'cos' } },
    { id: 'pyth', label: L('γ = 90°: Pythagoras', 'γ = 90°: Pythagoras'), values: { m: 'cos', ax: 2, ay: 7, bx: 10, by: 1, cx: 2, cy: 1 } },
    { id: 'obt', label: L('Stumpfer Winkel γ: Korrektur kommt dazu', 'Obtuse angle γ: the correction is added'), values: { m: 'cos', ax: 0.5, ay: 1, bx: 11.5, by: 1, cx: 4, cy: 3.5 } },
    { id: 'ssw', label: L('SSW: zwei Lösungen', 'SSA: two solutions'), values: { m: 'solve', g: 'ssw', a: 4, c: 6, al: 30 } },
    { id: 'tree', label: L('Vermessung: Baum am anderen Ufer', 'Surveying: a tree across the river'), values: { m: 'app', app: 'tree' } },
  ],
  strings: {
    de: {
      canvas:
        'Allgemeines Dreieck ABC auf Karopapier mit ziehbaren Ecken; Seite und Gegenwinkel haben dieselbe Farbe. Beim Sinussatz mit Umkreis, Höhe h_c und Balken für die drei Quotienten Seite durch Sinus des Gegenwinkels; beim Kosinussatz mit Quadraten an den Seiten, deren Teilrechtecke den Korrekturterm 2ab · cos γ zeigen. Dazu ein Löser für die Fälle SSS, SWS, WSW und SSW und zwei Vermessungen im Lageplan (Baum am anderen Flussufer, Entfernung über einen See).',
    },
    en: {
      canvas:
        'General triangle ABC on squared paper with draggable vertices; each side has the same colour as its opposite angle. For the law of sines with the circumcircle, the altitude h_c and bars for the three quotients side divided by the sine of the opposite angle; for the law of cosines with squares on the sides whose rectangles show the correction 2ab · cos γ. Plus a solver for the cases SSS, SAS, ASA and SSA and two surveying tasks on a map (a tree across a river, a distance across a lake).',
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
    const mode = () => p.m as Mode;
    const app = () => p.app as App;
    const scene = () => sceneOf(mode(), app());
    const kase = () => p.g as Case;

    /* ---------- Farben: Seite und Gegenwinkel gleich (a/α, b/β, c/γ) ---------- */
    const col = {
      a: () => th().series[0]!,
      b: () => th().series[1]!,
      c: () => th().series[2]!,
      h: () => th().series[3]!,
      r: () => th().series[4]!,
      warn: () => th().series[3]!,
    };
    const sideCol = [col.a, col.b, col.c];
    const lawCol = (l: Law) => (l === 'sin' ? col.r() : col.h());
    const KEY = ['a', 'b', 'c'] as const;
    const ANG = ['α', 'β', 'γ'] as const;
    const VERT = ['A', 'B', 'C'] as const;

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => fmt.num(clean(v, d), d);
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eq = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    const M = '\\t{m}';
    /** Große Zahlen mit schmalem Leerzeichen gruppieren (377 809). */
    const grp = (v: number) => N(v, 0).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    /** Im Modus Sinus-/Kosinussatz bei „Ergebnisse zeigen“ aus: nur die gegebenen Stücke. */
    const knownDrag = (name: string) => p.show || (mode() === 'cos' ? ['a', 'b', 'γ'] : ['a', 'α', 'β']).includes(name);

    /* ---------- Zielwerte und angezeigter Zustand ---------- */
    const TV = [p.ax, p.ay, p.bx, p.by, p.cx, p.cy].map((v) => new Chan(v));
    const GV: Record<GKey, Chan> = { a: new Chan(p.a), b: new Chan(p.b), c: new Chan(p.c), al: new Chan(p.al), be: new Chan(p.be), ga: new Chan(p.ga) };
    const S = new Chan(p.s);
    const P1 = new Chan(p.p1);
    const P2 = new Chan(p.p2);
    const D1 = new Chan(p.d1);
    const D2 = new Chan(p.d2);
    const WL = new Chan(p.w);
    const WH = new Chan(p.h ? 1 : 0);
    const WK = new Chan(p.k ? 1 : 0);
    const WSHOW = new Chan(p.show ? 1 : 0);
    const views: Record<Scene, { cx: Chan; cy: Chan; s: Chan }> = {
      sin: { cx: new Chan(6), cy: new Chan(4), s: new Chan(40) },
      cos: { cx: new Chan(6), cy: new Chan(4), s: new Chan(30) },
      solve: { cx: new Chan(3), cy: new Chan(2), s: new Chan(40) },
      tree: { cx: new Chan(100), cy: new Chan(100), s: new Chan(1) },
      lake: { cx: new Chan(0), cy: new Chan(300), s: new Chan(0.5) },
    };
    const allChans = (): Chan[] => [...TV, ...Object.values(GV), S, P1, P2, D1, D2, WL, WH, WK, WSHOW, ...Object.values(views).flatMap((v) => [v.cx, v.cy, v.s])];

    let intro: number | null = null;
    let sceneFade: { from: Scene; t0: number } | null = null;
    let cardFade: number | null = null;
    let proof: { t0: number } | null = null;
    let sweep: { t0: number; C: Pt; A: Pt; a: number; orient: number; g0: number; box: [number, number, number, number] } | null = null;
    let steps: { t0: number } | null = null;
    let story: { t0: number } | null = null;
    let drag: HitId | null = null;
    let hover: HitId | null = null;
    let hits: Hit[] = [];
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let glideNext = false;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;
    let prevScene: Scene = scene();
    let lastSize = { w: 0, h: 0 };

    const goalTri = (): Tri => [
      [p.ax, p.ay],
      [p.bx, p.by],
      [p.cx, p.cy],
    ];
    const baseTri = (): Tri => [
      [TV[0]!.v, TV[1]!.v],
      [TV[2]!.v, TV[3]!.v],
      [TV[4]!.v, TV[5]!.v],
    ];
    const goalGiven = (): Given => ({ a: p.a, b: p.b, c: p.c, al: p.al, be: p.be, ga: p.ga });
    const shownGiven = (): Given => ({ a: GV.a.v, b: GV.b.v, c: GV.c.v, al: GV.al.v, be: GV.be.v, ga: GV.ga.v });

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { main: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.37, 236, 380));
        return { main: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const m = mode();
      const cap = m === 'app' ? 1.4 : m === 'cos' ? 1.18 : m === 'solve' ? 1.2 : 1.08;
      const mh = Math.round(clamp(h * (m === 'app' ? 0.6 : 0.47), 300, w * cap));
      return { main: { x: 0, y: 0, w, h: mh }, col: { x: 0, y: mh + 10, w, h: h - mh - 10 }, wide: false };
    }

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({ a: col.a(), b: col.b(), c: col.c(), h: col.h(), r: col.r(), m: th().muted, w: col.warn() });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      if (box.w <= maxW || maxW <= 0) return box;
      // notfalls gleichmäßig verkleinern, damit nichts über den Rand ragt
      const inner = box;
      const f = maxW / inner.w;
      return {
        w: maxW,
        asc: inner.asc * f,
        desc: inner.desc * f,
        draw: (g2, x, y) => {
          g2.save();
          g2.translate(x, y);
          g2.scale(f, f);
          inner.draw(g2, 0, 0);
          g2.restore();
        },
      };
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
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)');
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
    /** Pill neben einem Punkt: um die halbe Pillgröße in Richtung n verschoben. */
    function sidePill(mx: number, my: number, n: Px, gap: number, src: string, opts: { color?: string; border?: string; size?: number; alpha?: number; bounds?: Rect } = {}): void {
      const sz = opts.size ?? fs(12.5, 11.5);
      const ps = pillSize(src, sz);
      const off = (Math.abs(n[0]) * ps.w) / 2 + (Math.abs(n[1]) * ps.h) / 2 + gap;
      fpill(mx + n[0] * off, my + n[1] * off, src, { ...opts, size: sz });
    }

    function dot(x: number, y: number, color: string, r: number, alpha = 1): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01) return;
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

    function poly(pts: Px[], fill: string | null, stroke: string | null, width = 1.5, dash?: number[]): void {
      const g = surface.g;
      if (pts.length < 3) return;
      g.save();
      g.beginPath();
      g.moveTo(pts[0]![0], pts[0]![1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]![0], pts[i]![1]);
      g.closePath();
      if (fill) {
        g.fillStyle = fill;
        g.fill();
      }
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = width;
        g.lineJoin = 'round';
        if (dash) g.setLineDash(dash);
        g.stroke();
      }
      g.restore();
    }

    /** Schraffur (für die Korrekturrechtecke). */
    function hatch(pts: Px[], color: string, alpha: number, gap = 7): void {
      const g = surface.g;
      if (alpha <= 0.01 || pts.length < 3) return;
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs);
      const y0 = Math.min(...ys);
      const y1 = Math.max(...ys);
      g.save();
      g.beginPath();
      g.moveTo(pts[0]![0], pts[0]![1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]![0], pts[i]![1]);
      g.closePath();
      g.clip();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 1.3;
      g.beginPath();
      for (let s = x0 - (y1 - y0); s < x1; s += gap) {
        g.moveTo(s, y1);
        g.lineTo(s + (y1 - y0), y0);
      }
      g.stroke();
      g.restore();
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
      g.fillStyle = theme.dark ? '#121923' : '#fdfdfb';
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
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

    /** Winkelbogen (Sektor) um q von a0 bis a1 (mathematisch positiv, Bildschirm-Winkel). */
    function angleArc(q: Px, r: number, a0: number, a1: number, color: string, emph: number, alpha = 1): void {
      const g = surface.g;
      if (alpha <= 0.01 || r < 2 || a1 - a0 < 1e-4) return;
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(color, lerp(0.1, th().dark ? 0.32 : 0.26, emph));
      g.beginPath();
      g.moveTo(q[0], q[1]);
      g.arc(q[0], q[1], r, -a0, -a1, true);
      g.closePath();
      g.fill();
      g.strokeStyle = emph > 0.5 ? color : withAlpha(color, 0.6);
      g.lineWidth = lerp(1.2, 2.2, emph);
      g.beginPath();
      g.arc(q[0], q[1], r, -a0, -a1, true);
      g.stroke();
      g.restore();
    }

    /** Zeichen für den rechten Winkel bei q mit den Schenkelrichtungen u und v (Pixel). */
    function rightMark(q: Px, u: Px, v: Px, size: number, color: string, alpha = 1): void {
      const g = surface.g;
      const nu = Math.hypot(u[0], u[1]) || 1;
      const nv = Math.hypot(v[0], v[1]) || 1;
      const a: Px = [q[0] + (u[0] / nu) * size, q[1] + (u[1] / nu) * size];
      const b: Px = [q[0] + (v[0] / nv) * size, q[1] + (v[1] / nv) * size];
      const c: Px = [a[0] + (v[0] / nv) * size, a[1] + (v[1] / nv) * size];
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(color, 0.12);
      g.strokeStyle = color;
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
      g.fillStyle = color;
      g.beginPath();
      g.arc((q[0] + c[0]) / 2, (q[1] + c[1]) / 2, 1.7, 0, TAU);
      g.fill();
      g.restore();
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
      g.strokeStyle = th().dark ? 'rgba(18,25,35,0.9)' : 'rgba(253,253,251,0.95)';
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

    /** Bildschirmwinkel (mathematisch, y nach oben) von q nach t. */
    const angTo = (q: Px, t: Px) => Math.atan2(-(t[1] - q[1]), t[0] - q[0]);
    /** Innenwinkel bei q zwischen den Richtungen zu p1 und p2: Start, Ende, Mitte. */
    function span(q: Px, p1: Px, p2: Px): { a0: number; a1: number; mid: number } {
      let a0 = angTo(q, p1);
      let d = angTo(q, p2) - a0;
      while (d <= -Math.PI) d += TAU;
      while (d > Math.PI) d -= TAU;
      if (d < 0) {
        a0 += d;
        d = -d;
      }
      return { a0, a1: a0 + d, mid: a0 + d / 2 };
    }
    /** Abstand des Punkts q von der Geraden durch u und v (Pixel). */
    const distToLine = (q: Px, u: Px, v: Px) => Math.abs((v[0] - u[0]) * (u[1] - q[1]) - (u[0] - q[0]) * (v[1] - u[1])) / (Math.hypot(v[0] - u[0], v[1] - u[1]) || 1);

    /**
     * Winkelbogen mit Beschriftung an der Ecke i eines Dreiecks (Pixel): Pill auf der
     * Winkelhalbierenden innen, bei zu wenig Platz außen. Gibt zurück, ob die Pill außen liegt.
     */
    function cornerAngle(pts: [Px, Px, Px], i: number, color: string, emph: number, src: string | null, alpha: number, R: Rect, rMax = fs(38, 30), force = false): boolean {
      const q = pts[i]!;
      const p1 = pts[(i + 1) % 3]!;
      const p2 = pts[(i + 2) % 3]!;
      const sp = span(q, p1, p2);
      const adj = Math.min(Math.hypot(p1[0] - q[0], p1[1] - q[1]), Math.hypot(p2[0] - q[0], p2[1] - q[1]));
      const r = clamp(adj * 0.26, 13, rMax);
      angleArc(q, r, sp.a0, sp.a1, color, emph, alpha);
      if (!src) return false;
      const sz = fs(12.5, 11.5);
      const ps = pillSize(src, sz);
      let dx = Math.cos(sp.mid);
      let dy = -Math.sin(sp.mid);
      let ext = (Math.abs(dx) * ps.w) / 2 + (Math.abs(dy) * ps.h) / 2;
      let d = r + 5 + ext;
      const room = distToLine(q, p1, p2);
      const outside = force || d + ext > room * 0.95;
      if (outside) {
        dx = -dx;
        dy = -dy;
        ext = (Math.abs(dx) * ps.w) / 2 + (Math.abs(dy) * ps.h) / 2;
        d = 12 + ext;
      }
      fpill(q[0] + dx * d, q[1] + dy * d, src, { size: sz, alpha, border: withAlpha(color, lerp(0.25, 0.7, emph)), bounds: R });
      return outside;
    }

    /** Eckennamen: vom Schwerpunkt weg (bei außen liegender Winkel-Pill seitlich). */
    function cornerLabels(pts: [Px, Px, Px], names: readonly string[], outside: boolean[], alpha: number): void {
      const gx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
      const gy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
      pts.forEach((q, i) => {
        let away: Px = [q[0] - gx, q[1] - gy];
        if (outside[i]) {
          const l = Math.hypot(away[0], away[1]) || 1;
          const c = Math.cos(1.25);
          const s = Math.sin(1.25);
          away = [(away[0] * c - away[1] * s) / l, (away[0] * s + away[1] * c) / l];
        }
        label(q, names[i]!, th().text, away, alpha);
      });
    }

    /** Seitenlänge außen an der Seite i (gegenüber Ecke i). */
    function sideLabel(pts: [Px, Px, Px], i: number, src: string, alpha: number, R: Rect, border?: string): void {
      const p1 = pts[(i + 1) % 3]!;
      const p2 = pts[(i + 2) % 3]!;
      const m: Px = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
      const l = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
      let n: Px = [-(p2[1] - p1[1]) / l, (p2[0] - p1[0]) / l];
      const q = pts[i]!;
      if (n[0] * (q[0] - m[0]) + n[1] * (q[1] - m[1]) > 0) n = [-n[0], -n[1]];
      sidePill(m[0], m[1], n, 8, src, { alpha, bounds: R, border });
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
    type Box = [number, number, number, number];
    function bbox(pts: readonly Pt[]): Box {
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    function fitBox(R: Rect, box: Box, pad: { l: number; r: number; t: number; b: number }, sMax: number): { cx: number; cy: number; s: number } {
      const [x0, y0, x1, y1] = box;
      const aw = Math.max(40, R.w - pad.l - pad.r);
      const ah = Math.max(40, R.h - pad.t - pad.b);
      const s = Math.min(sMax, aw / Math.max(1e-6, x1 - x0), ah / Math.max(1e-6, y1 - y0));
      const ax = R.x + pad.l + aw / 2;
      const ay = R.y + pad.t + ah / 2;
      return { cx: (x0 + x1) / 2 - (ax - (R.x + R.w / 2)) / s, cy: (y0 + y1) / 2 + (ay - (R.y + R.h / 2)) / s, s };
    }

    /** Alle Ecken des Flächenbilds zum Kosinussatz. */
    function cosPts(t: Tri): Pt[] {
      const f = cosineFigure(t);
      return [...t, ...f.sq.flat(), ...f.corrA.pts, ...f.corrB.pts];
    }

    function tiltedSolve(): { res: SolveResult; pts: Pt[] } {
      const g = goalGiven();
      const res = solve(kase(), g);
      return { res, pts: solvePts(res, g) };
    }
    /** Punkte, die im Löser sichtbar sein sollen (Dreiecke bzw. Konstruktion ohne Lösung). */
    function solvePts(res: SolveResult, g: Given): Pt[] {
      if (res.kind === 'ok') return res.tris.flatMap((s) => [...placeSolved(s)]);
      const k = kase();
      if (k === 'sss') {
        const big = Math.max(g.a, g.b);
        return [
          [-0.25 * g.b, 0],
          [g.c + 0.25 * g.a, 0],
          [0, big * 0.85],
          [g.c, big * 0.85],
        ];
      }
      if (k === 'wsw') {
        return [
          [-0.6, 0],
          [g.c + 0.6, 0],
          [g.c / 2, g.c * 0.7],
        ];
      }
      return [
        [-0.4, 0],
        [g.c + g.a * 0.9, 0],
        [0, Math.max(g.c * sinD(g.al), g.a) * 0.9 + 0.6],
      ];
    }

    function goalOf(s: Scene): { cx: number; cy: number; s: number } {
      const R = regions().main;
      const small = sm();
      if (s === 'sin') {
        const t = goalTri();
        let box = bbox(t);
        if (p.k && !isFlat(t)) {
          const U = circumcenter(t);
          const r = circumradius(t);
          const lim = 4;
          box = [Math.min(box[0], Math.max(U[0] - r, box[0] - lim)), Math.min(box[1], Math.max(U[1] - r, box[1] - lim)), Math.max(box[2], Math.min(U[0] + r, box[2] + lim)), Math.max(box[3], Math.min(U[1] + r, box[3] + lim))];
        }
        const pad = small ? { l: 30, r: 30, t: 78, b: 34 } : { l: 52, r: 52, t: 92, b: 46 };
        return fitBox(R, box, pad, 90);
      }
      if (s === 'cos') {
        const box: Box = sweep ? sweep.box : bbox(cosPts(goalTri()));
        const pad = small ? { l: 10, r: 10, t: 62, b: 10 } : { l: 18, r: 18, t: 76, b: 18 };
        return fitBox(R, box, pad, 60);
      }
      if (s === 'solve') {
        const { pts } = tiltedSolve();
        const pad = small ? { l: 34, r: 34, t: 108, b: 40 } : { l: 52, r: 52, t: 118, b: 52 };
        return fitBox(R, bbox(pts), pad, 70);
      }
      if (s === 'tree') {
        const v = survey(p.s, p.p1, p.p2);
        const ext = Math.max(p.s, v.width);
        const box: Box = [Math.min(0, v.along) - 0.1 * ext, -0.16 * v.width - 10, Math.max(p.s, v.along) + 0.1 * ext, v.width * 1.12];
        const pad = small ? { l: 14, r: 14, t: 66, b: 40 } : { l: 22, r: 22, t: 76, b: 50 };
        return fitBox(R, box, pad, 4);
      }
      const L1 = lakePts(p.d1, p.d2, p.w);
      const box = bbox([...L1.tri, ...L1.lake]);
      box[1] -= 0.06 * (box[3] - box[1]);
      const pad = small ? { l: 18, r: 18, t: 70, b: 40 } : { l: 26, r: 26, t: 80, b: 50 };
      return fitBox(R, box, pad, 2);
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
     * Animationen: Beweis, γ-Fahrt, Schritte, Messung
     * ===================================================================== */
    function proofState(now: number): { drop: number; t1: number; t2: number; rows: number[] } | null {
      if (!proof) return null;
      const t = now - proof.t0;
      const bump = (a: number, b: number) => Math.min(ease.outCubic(clamp01((t - a) / 350)), 1 - ease.inCubic(clamp01((t - b) / 400)));
      const both = Math.min(ease.outCubic(clamp01((t - 3700) / 400)), 1 - ease.inCubic(clamp01((t - 6200) / 600))) * 0.6;
      return {
        drop: ease.inOutCubic(clamp01(t / 900)),
        t1: Math.max(bump(1000, 2450), both),
        t2: Math.max(bump(2450, 3750), both),
        rows: PROOF_ROWS.map((r) => ease.outCubic(clamp01((t - r) / 500))),
      };
    }

    /** Angezeigter Winkel γ während der γ-Fahrt. */
    function sweepGamma(now: number): number | null {
      if (!sweep) return null;
      let t = now - sweep.t0;
      let from = sweep.g0;
      for (const s of SWEEP_G) {
        if (t < s.dur) return lerp(from, s.to, ease.inOutCubic(t / s.dur));
        t -= s.dur;
        if (t < s.hold) return s.to;
        t -= s.hold;
        from = s.to;
      }
      if (t < SWEEP_BACK) return lerp(from, sweep.g0, ease.inOutCubic(t / SWEEP_BACK));
      return null;
    }
    function shownTri(now: number): Tri {
      const g = sweepGamma(now);
      if (sweep && g !== null) {
        const B = placeB(sweep.C, sweep.A, sweep.a, g, sweep.orient);
        return [sweep.A, B, sweep.C];
      }
      return baseTri();
    }
    function startSweep(now: number): void {
      const t = goalTri();
      if (isFlat(t)) return;
      const [A, , C] = t;
      const a = sides(t)[0];
      const g0 = angles(t)[2];
      const cr = (A[0] - C[0]) * (t[1][1] - C[1]) - (A[1] - C[1]) * (t[1][0] - C[0]);
      const orient = cr > 0 ? -1 : 1;
      const pts: Pt[] = [];
      for (const gg of [g0, 40, 65, 90, 115, 140]) pts.push(...cosPts([A, placeB(C, A, a, gg, orient), C]));
      sweep = { t0: now, C, A, a, orient, g0, box: bbox(pts) };
    }

    function stepsK(now: number, n: number): number[] {
      const out: number[] = [];
      for (let i = 0; i < n; i++) out.push(steps ? ease.outCubic(clamp01((now - steps.t0 - 250 - i * STEP_GAP) / 600)) : 1);
      return out;
    }
    const STEPS_END = 250 + 5 * STEP_GAP + 700;

    function storyK(now: number, i: number, n: number): number {
      if (!story) return 1;
      const t = now - story.t0;
      return ease.inOutCubic(clamp01((t - 300 - i * (4200 / n)) / 800));
    }
    const STORY_END = 300 + 4200 + 1000;

    /* =====================================================================
     * Szene 1: Sinussatz
     * ===================================================================== */
    function drawSin(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const V = viewOf('sin');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const t = shownTri(now);
      const flat = isFlat(t);
      const pts = t.map(P) as [Px, Px, Px];
      const [pa, pb, pc] = pts;
      const s = sides(t);
      const w = angles(t);
      const lab = k.labels;
      const pr = proofState(now);
      g.save();
      g.globalAlpha *= alpha;
      paper(R);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      grid(R, P([0, 0]), V.s * 0.5, k.panel, 2);
      // Umkreis mit Durchmesser durch C
      if (!flat && WK.v > 0.01) {
        const U = circumcenter(t);
        const r = circumradius(t);
        const pu = P(U);
        const rp = r * V.s;
        const a0 = WK.v * k.draw;
        g.save();
        g.globalAlpha *= a0;
        const glowG = g.createRadialGradient(pu[0], pu[1], rp * 0.6, pu[0], pu[1], rp);
        glowG.addColorStop(0, withAlpha(col.r(), 0));
        glowG.addColorStop(1, withAlpha(col.r(), theme.dark ? 0.1 : 0.06));
        g.fillStyle = glowG;
        g.beginPath();
        g.arc(pu[0], pu[1], rp, 0, TAU);
        g.fill();
        g.strokeStyle = withAlpha(col.r(), 0.85);
        g.lineWidth = 1.8;
        g.setLineDash([7, 5]);
        g.beginPath();
        g.arc(pu[0], pu[1], rp, -Math.PI / 2, -Math.PI / 2 + TAU * a0);
        g.stroke();
        g.restore();
        const D: Pt = [2 * U[0] - t[2][0], 2 * U[1] - t[2][1]];
        const pd = P(D);
        line(pc, lerpPx(pc, pd, a0), col.r(), 2.4, { alpha: 0.9 * WK.v, glow: true });
        dot(pu[0], pu[1], col.r(), 3.5, WK.v * lab);
        dot(pd[0], pd[1], col.r(), 3, WK.v * lab);
        const dir: Px = [(pd[0] - pu[0]) / (rp || 1), (pd[1] - pu[1]) / (rp || 1)];
        const known = p.show;
        const src = `\\c{r}{2r ${known ? `${eq(2 * r)} ${N(2 * r)} cm` : '= ?'}}`;
        sidePill(pd[0], pd[1], dir, 6, src, { alpha: WK.v * lab, bounds: R, border: withAlpha(col.r(), 0.6) });
      }
      // Fläche
      g.save();
      g.globalAlpha *= k.panel;
      const fillG = g.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
      fillG.addColorStop(0, withAlpha(col.a(), theme.dark ? 0.09 : 0.06));
      fillG.addColorStop(1, withAlpha(col.b(), theme.dark ? 0.09 : 0.06));
      poly(pts, fillG as unknown as string, null);
      g.restore();
      // Höhe h_c und die beiden Teildreiecke (Beweisidee)
      let pf: Px | null = null;
      if (!flat && WH.v > 0.01) {
        const sp = sineProof(t);
        pf = P(sp.foot);
        const drop = pr ? pr.drop : k.draw;
        if (pr && (pr.t1 > 0.01 || pr.t2 > 0.01)) {
          poly([pa, pf, pc], withAlpha(col.b(), (theme.dark ? 0.3 : 0.22) * pr.t1), pr.t1 > 0.05 ? withAlpha(col.b(), 0.8 * pr.t1) : null, 2.2);
          poly([pb, pf, pc], withAlpha(col.a(), (theme.dark ? 0.3 : 0.22) * pr.t2), pr.t2 > 0.05 ? withAlpha(col.a(), 0.8 * pr.t2) : null, 2.2);
        }
        // Verlängerung von [AB], wenn der Fußpunkt außerhalb liegt
        if (sp.t < 0) line(pa, pf, withAlpha(theme.muted, 0.8), 1.5, { dash: [4, 4], alpha: WH.v * drop });
        if (sp.t > 1) line(pb, pf, withAlpha(theme.muted, 0.8), 1.5, { dash: [4, 4], alpha: WH.v * drop });
        const tip = lerpPx(pc, pf, drop);
        line(pc, tip, col.h(), fs(3, 2.6), { dash: [8, 5], alpha: WH.v, glow: true });
        if (drop > 0.98) {
          const along: Px = sp.t > 0.5 ? [pa[0] - pf[0], pa[1] - pf[1]] : [pb[0] - pf[0], pb[1] - pf[1]];
          rightMark(pf, along, [pc[0] - pf[0], pc[1] - pf[1]], clamp(s[2] * V.s * 0.05, 7, 12), col.h(), WH.v * lab);
          label(pf, 'F', col.h(), [pf[0] - pc[0], pf[1] - pc[1]], WH.v * lab, 3);
        }
        const mid = lerpPx(pc, pf, 0.5);
        const nrm: Px = [pf[1] - pc[1], -(pf[0] - pc[0])];
        const nl = Math.hypot(nrm[0], nrm[1]) || 1;
        let n: Px = [nrm[0] / nl, nrm[1] / nl];
        // auf die Seite mit mehr Platz (zur längeren Teilstrecke hin)
        const toA = (pa[0] - pf[0]) * n[0] + (pa[1] - pf[1]) * n[1];
        const toB = (pb[0] - pf[0]) * n[0] + (pb[1] - pf[1]) * n[1];
        if (Math.abs(toB) > Math.abs(toA) ? toB < 0 : toA < 0) n = [-n[0], -n[1]];
        const hv = sp.hc;
        const hsrc = `\\c{h}{h_c${p.show && drop > 0.98 ? ` ${eq(hv)} ${N(hv)} cm` : ''}}`;
        sidePill(mid[0], mid[1], n, 6, hsrc, { alpha: WH.v * lab * clamp01((drop - 0.6) / 0.4), bounds: R });
      }
      // Seiten
      const dr = k.draw;
      const sw = fs(4.2, 3.6);
      const glowA = pr ? pr.t2 : 0;
      const glowB = pr ? pr.t1 : 0;
      line(pb, lerpPx(pb, pc, dr), col.a(), sw + glowA * 1.8, { glow: true });
      line(pc, lerpPx(pc, pa, dr), col.b(), sw + glowB * 1.8, { glow: true });
      line(pa, lerpPx(pa, pb, dr), col.c(), sw, { glow: true });
      // Winkel
      const outside = [false, false, false];
      if (!flat) {
        for (let i = 0; i < 3; i++) {
          const name = ANG[i]!;
          const v = w[i]!;
          const src = knownDrag(name) ? `\\c{${KEY[i]}}{${name} ${eq(v, 1)} ${N(v, 1)}°}` : `\\c{${KEY[i]}}{${name} = ?}`;
          const em = pr ? (i === 0 ? Math.max(0.5, pr.t1) : i === 1 ? Math.max(0.5, pr.t2) : 0.35) : 0.85;
          outside[i] = cornerAngle(pts, i, sideCol[i]!(), em, src, lab, R);
        }
        for (let i = 0; i < 3; i++) {
          const name = KEY[i]!;
          const src = knownDrag(name) ? `\\c{${name}}{${name} ${eq(s[i]!)} ${N(s[i]!)} cm}` : `\\c{${name}}{${name} = ?}`;
          sideLabel(pts, i, src, lab, R);
        }
      }
      cornerLabels(pts, VERT, outside, k.panel);
      if (!sweep && !proof) pts.forEach((q, i) => handle(q, VERT[i]!, theme.text, k.labels));
      else pts.forEach((q) => dot(q[0], q[1], theme.text, fs(5, 4.5), k.labels));
      if (flat) fpill(R.x + R.w / 2, R.y + R.h - 30, `\\c{w}{\\t{${say(L('Das Dreieck ist zu flach – ziehe eine Ecke weiter weg.', 'The triangle is too flat – drag a vertex further away.'))}}}`, { size: fs(13, 11.5), border: withAlpha(col.warn(), 0.7), maxW: R.w - 50 });
      g.restore();
      fpill(R.x + 12, R.y + 30, `\\c{a}{a} : sin \\c{a}{α} = \\c{b}{b} : sin \\c{b}{β} = \\c{c}{c} : sin \\c{c}{γ} = \\c{r}{2r}`, { align: 'left', size: fs(14, 12.5), alpha: k.panel, border: withAlpha(col.r(), 0.55), maxW: R.w - 40 });
      g.restore();
    }

    /* =====================================================================
     * Szene 2: Kosinussatz mit Quadraten
     * ===================================================================== */
    function drawCos(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const V = viewOf('cos');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const t = shownTri(now);
      const flat = isFlat(t);
      const pts = t.map(P) as [Px, Px, Px];
      const [pa, pb, pc] = pts;
      const s = sides(t);
      const w = angles(t);
      const [a, b] = s;
      const ga = w[2];
      const lab = k.labels;
      const show = p.show;
      g.save();
      g.globalAlpha *= alpha;
      paper(R);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      grid(R, P([0, 0]), V.s * 0.5, k.panel, 2);
      const QP = (q: Quad | readonly Pt[]): Px[] => ('pts' in q ? q.pts : q).map((x) => P(x));
      if (!flat) {
        const fig = cosineFigure(t);
        const sqA = QP(fig.sq[0]);
        const sqB = QP(fig.sq[1]);
        const sqC = QP(fig.sq[2]);
        const grow = k.draw;
        const wh = WH.v * lab;
        const dk = theme.dark;
        g.save();
        g.globalAlpha *= grow;
        // Quadrate
        poly(sqA, withAlpha(col.a(), dk ? 0.12 : 0.08), withAlpha(col.a(), 0.75), 1.6);
        poly(sqB, withAlpha(col.b(), dk ? 0.12 : 0.08), withAlpha(col.b(), 0.75), 1.6);
        const split = fig.splitC;
        if (split && wh > 0.01) {
          poly(QP(split[1]), withAlpha(col.a(), (dk ? 0.2 : 0.15) * wh), null);
          poly(QP(split[0]), withAlpha(col.b(), (dk ? 0.2 : 0.15) * wh), null);
          poly(sqC, withAlpha(col.c(), (dk ? 0.12 : 0.08) * (1 - wh)), withAlpha(col.c(), 0.8), 1.8);
        } else poly(sqC, withAlpha(col.c(), dk ? 0.12 : 0.08), withAlpha(col.c(), 0.8), 1.8);
        // Rechtecke (Höhen teilen die Quadrate)
        if (wh > 0.01) {
          g.save();
          g.globalAlpha *= wh;
          poly(QP(fig.restA), withAlpha(col.a(), dk ? 0.14 : 0.1), null);
          poly(QP(fig.restB), withAlpha(col.b(), dk ? 0.14 : 0.1), null);
          for (const q of [fig.corrA, fig.corrB]) {
            if (Math.abs(q.area) * V.s * V.s < 2) continue;
            const qp = QP(q);
            const out = q.area < 0;
            poly(qp, withAlpha(col.h(), out ? (dk ? 0.16 : 0.12) : dk ? 0.3 : 0.24), withAlpha(col.h(), 0.9), out ? 2 : 1.6, out ? [6, 4] : undefined);
            hatch(qp, col.h(), out ? 0.45 : 0.55);
          }
          // Höhen als Teilungslinien: von der Ecke über den Fußpunkt durch das Quadrat
          const hl = (from: Px, q: Quad) => {
            if (Math.abs(q.area) * V.s * V.s < 2) return;
            const qp = QP(q);
            line(from, qp[1]!, col.h(), 1.8, { dash: [6, 4], alpha: 0.95 });
            line(qp[1]!, qp[2]!, col.h(), 1.8, { dash: [6, 4], alpha: 0.95 });
          };
          hl(pa, fig.corrA);
          hl(pb, fig.corrB);
          if (split) {
            const qp = QP(split[0]);
            line(pc, qp[1]!, withAlpha(theme.muted, 0.9), 1.5, { dash: [5, 4] });
            line(qp[1]!, qp[2]!, withAlpha(theme.muted, 0.9), 1.5, { dash: [5, 4] });
          }
          // Beschriftung der Korrekturrechtecke
          for (const q of [fig.corrA, fig.corrB]) {
            const qp = QP(q);
            const w1 = Math.hypot(qp[1]![0] - qp[0]![0], qp[1]![1] - qp[0]![1]);
            const h1 = Math.hypot(qp[3]![0] - qp[0]![0], qp[3]![1] - qp[0]![1]);
            if (Math.max(w1, h1) < 30 || w1 < 3) continue;
            const ex: Px = [(qp[2]![0] + qp[3]![0]) / 2, (qp[2]![1] + qp[3]![1]) / 2];
            const nl = h1 || 1;
            const n: Px = [(qp[3]![0] - qp[0]![0]) / nl, (qp[3]![1] - qp[0]![1]) / nl];
            const v = Math.abs(a * b * cosD(ga));
            const src = q.area < 0 ? `\\c{h}{+ |ab · cos γ|${show ? ` ${eq(v, 1)} ${N(v, 1)}` : ''}}` : `\\c{h}{− ab · cos γ${show ? ` ${eq(v, 1)} ${N(v, 1)}` : ''}}`;
            sidePill(ex[0], ex[1], n, 5, src, { size: fs(11.5, 11), border: withAlpha(col.h(), 0.6), bounds: R });
          }
          g.restore();
        }
        g.restore();
        // Beschriftung der Quadrate
        const sqLabel = (sq: Px[], i: number) => {
          const cx0 = (sq[0]![0] + sq[2]![0]) / 2;
          const cy0 = (sq[0]![1] + sq[2]![1]) / 2;
          const side = Math.hypot(sq[1]![0] - sq[0]![0], sq[1]![1] - sq[0]![1]);
          if (side < 46) return;
          const name = KEY[i]!;
          const v = s[i]!;
          const known = knownDrag(name);
          // nicht auf das Korrekturrechteck setzen: im Quadrat a bzw. b zur Ecke B bzw. A hin verschieben
          let ox = 0;
          let oy = 0;
          if (i < 2 && wh > 0.3 && (i === 0 ? fig.corrA.area : fig.corrB.area) > 0) {
            const far = i === 0 ? sq[1]! : sq[0]!;
            const near = i === 0 ? sq[0]! : sq[1]!;
            ox = (far[0] - near[0]) * 0.22;
            oy = (far[1] - near[1]) * 0.22;
          }
          const big = side > 110;
          const l1 = `\\c{${name}}{${name}² ${known ? `${eq(v * v, 1)} ${N(v * v, 1)} cm²` : '= ?'}}`;
          const l2 = `\\c{${name}}{${name} ${known ? `${eq(v)} ${N(v)} cm` : '= ?'}}`;
          if (big) {
            fpill(cx0 + ox, cy0 + oy - 13, l1, { size: fs(12.5, 11.5), alpha: lab, maxW: side - 12 });
            fpill(cx0 + ox, cy0 + oy + 13, l2, { size: fs(11.5, 11), alpha: lab, maxW: side - 12 });
          } else fpill(cx0 + ox, cy0 + oy, `\\c{${name}}{${name}²}`, { size: fs(12.5, 11.5), alpha: lab });
        };
        sqLabel(sqA, 0);
        sqLabel(sqB, 1);
        sqLabel(sqC, 2);
      }
      // Dreieck
      g.save();
      g.globalAlpha *= k.panel;
      poly(pts, withAlpha(theme.text, theme.dark ? 0.07 : 0.05), null);
      g.restore();
      const dr = k.draw;
      const sw = fs(4.2, 3.6);
      line(pb, lerpPx(pb, pc, dr), col.a(), sw, { glow: true });
      line(pc, lerpPx(pc, pa, dr), col.b(), sw, { glow: true });
      line(pa, lerpPx(pa, pb, dr), col.c(), sw, { glow: true });
      const outside = [false, false, false];
      if (!flat) {
        for (let i = 0; i < 3; i++) {
          const name = ANG[i]!;
          const v = w[i]!;
          const src = i === 2 ? (knownDrag(name) ? `\\c{c}{γ ${eq(v, 1)} ${N(v, 1)}°}` : '\\c{c}{γ = ?}') : null;
          outside[i] = cornerAngle(pts, i, sideCol[i]!(), i === 2 ? 1 : 0.15, src, lab, R);
        }
      }
      cornerLabels(pts, VERT, outside, k.panel);
      if (!sweep) pts.forEach((q, i) => handle(q, VERT[i]!, theme.text, k.labels));
      else {
        pts.forEach((q) => dot(q[0], q[1], theme.text, fs(5, 4.5), k.labels));
        handle(pb, 'B', col.a(), 0);
      }
      if (flat) fpill(R.x + R.w / 2, R.y + R.h - 30, `\\c{w}{\\t{${say(L('Das Dreieck ist zu flach – ziehe eine Ecke weiter weg.', 'The triangle is too flat – drag a vertex further away.'))}}}`, { size: fs(13, 11.5), border: withAlpha(col.warn(), 0.7), maxW: R.w - 50 });
      g.restore();
      // Kopfzeile, beim rechten Winkel mit Hinweis
      const head = fpill(R.x + 12, R.y + 30, `\\c{c}{c}² = \\c{a}{a}² + \\c{b}{b}² − \\c{h}{2\\c{a}{a}\\c{b}{b} · cos \\c{c}{γ}}`, { align: 'left', size: fs(14, 12.5), alpha: k.panel, border: withAlpha(col.h(), 0.55), maxW: R.w - 40 });
      if (!flat) {
        const right = Math.abs(ga - 90) < 0.25;
        const src = right ? `\\c{c}{γ = 90° ⇒ \\t{${say(L('Pythagoras', 'Pythagoras'))}}: \\c{h}{cos γ = 0}}` : ga < 90 ? `\\c{h}{γ < 90°: cos γ > 0 ⇒ \\t{${say(L('abziehen', 'subtract'))}}}` : `\\c{h}{γ > 90°: cos γ < 0 ⇒ \\t{${say(L('dazuzählen', 'add'))}}}`;
        const ps = pillSize(src, fs(12.5, 11.5));
        const fitsRight = head.x + head.w + 10 + ps.w < R.x + R.w - 10;
        fpill(fitsRight ? head.x + head.w + 10 : R.x + 12, fitsRight ? R.y + 30 : head.y + head.h + 16, src, { align: 'left', size: fs(12.5, 11.5), alpha: k.panel * lab, border: withAlpha(right ? col.c() : col.h(), 0.6) });
      }
      g.restore();
    }

    /* =====================================================================
     * Szene 3: Welcher Satz passt?
     * ===================================================================== */
    /** Welcher Rechenschritt ein unbekanntes Stück liefert (für das Aufdecken beim Lösen). */
    const REVEAL: Record<Case, Partial<Record<GKey, number>>> = {
      sss: { ga: 1, al: 2, be: 3 },
      sws: { c: 1, al: 2, be: 3 },
      wsw: { ga: 0, a: 1, b: 2 },
      ssw: { ga: 1, be: 3, b: 4 },
    };
    const NSTEPS: Record<Case, number> = { sss: 4, sws: 4, wsw: 3, ssw: 5 };
    function revealed(now: number, key: GKey): number {
      if (!p.show) return 0;
      const i = REVEAL[kase()][key];
      if (i === undefined) return 1;
      return stepsK(now, NSTEPS[kase()])[i] ?? 1;
    }

    function drawChips(R: Rect, k: Intro): number {
      const g = surface.g;
      const theme = th();
      const sz = fs(13, 12);
      const hgt = fs(30, 28);
      let x = R.x + 12;
      const y = R.y + 12;
      g.save();
      g.globalAlpha *= k.panel;
      for (const c of CASES) {
        const name = say(CASE_NAME[c]);
        g.font = `750 ${sz}px ${theme.font}`;
        const wdt = g.measureText(name).width + 22;
        const on = c === kase();
        const lc = lawCol(lawFor(c));
        const hov = hover === `case-${c}`;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
        g.shadowBlur = on ? 8 : 4;
        g.shadowOffsetY = 1.5;
        g.fillStyle = on ? lc : theme.dark ? '#1a2230' : '#ffffff';
        roundRect(g, x, y, wdt, hgt, hgt / 2);
        g.fill();
        g.restore();
        g.strokeStyle = on ? lc : withAlpha(lc, hov ? 0.9 : 0.45);
        g.lineWidth = hov ? 2 : 1.3;
        roundRect(g, x + 0.5, y + 0.5, wdt - 1, hgt - 1, hgt / 2);
        g.stroke();
        g.fillStyle = on ? '#ffffff' : theme.text;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(name, x + wdt / 2, y + hgt / 2 + 0.5);
        if (editable()) hits.push({ id: `case-${c}`, x: x + wdt / 2, y: y + hgt / 2, r: 0, w: wdt + 4, h: hgt + 6 });
        x += wdt + 6;
      }
      g.restore();
      const law = lawFor(kase());
      const src = `⇒ \\c{${law === 'sin' ? 'r' : 'h'}}{\\t{${law === 'sin' ? say(L('Sinussatz', 'law of sines')) : say(L('Kosinussatz', 'law of cosines'))}}}`;
      const ps = pillSize(src, fs(13, 12));
      if (x + ps.w + 4 < R.x + R.w - 8) {
        fpill(x + 4, y + hgt / 2, src, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(lawCol(law), 0.6) });
        return y + hgt;
      }
      fpill(R.x + 12, y + hgt + 20, src, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(lawCol(law), 0.6) });
      return y + hgt + 36;
    }

    function drawSolve(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const V = viewOf('solve');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const kc = kase();
      const G = shownGiven();
      const res = solve(kc, G);
      const lab = k.labels;
      const dr = k.draw;
      const uses = USES[kc];
      const given = (key: GKey) => uses.includes(key);
      g.save();
      g.globalAlpha *= alpha;
      paper(R);
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 13);
      g.clip();
      grid(R, P([0, 0]), V.s * 0.5, k.panel, 2);
      const sideW = (key: GKey) => (given(key) ? fs(5, 4.4) : fs(2.8, 2.5));
      const sideKey: GKey[] = ['a', 'b', 'c'];
      const angKey: GKey[] = ['al', 'be', 'ga'];
      const valSrc = (i: number, v: number, isAngle: boolean, suffix = '') => {
        const key = isAngle ? angKey[i]! : sideKey[i]!;
        const name = isAngle ? ANG[i]! : KEY[i]!;
        const ck = KEY[i]!;
        const unit = isAngle ? '°' : ' cm';
        const d = isAngle ? 2 : 2;
        if (given(key)) return `\\c{${ck}}{\\b{${name} = ${N(v, d)}${unit}}}`;
        const rv = revealed(now, key);
        return rv > 0.5 ? `\\c{${ck}}{${name}${suffix} ${eq(v, d)} ${N(v, d)}${unit}}` : `\\c{${ck}}{${name}${suffix} = ?}`;
      };
      if (res.kind === 'ok') {
        const tris = res.tris.map(placeSolved);
        const two = tris.length === 2;
        // Konstruktion bei SSW: freier Schenkel von A und Kreis um B mit Radius a
        if (kc === 'ssw') {
          const pA = P([0, 0]);
          const far = P([Math.max(G.c, G.a) * 2.2 * cosD(G.al), Math.max(G.c, G.a) * 2.2 * sinD(G.al)]);
          line(pA, far, withAlpha(theme.muted, 0.8), 1.4, { dash: [5, 5], alpha: lab });
          const pB = P([G.c, 0]);
          g.save();
          g.globalAlpha *= lab;
          g.strokeStyle = withAlpha(col.a(), 0.7);
          g.lineWidth = 1.6;
          g.setLineDash([6, 5]);
          g.beginPath();
          g.arc(pB[0], pB[1], G.a * V.s, 0, TAU);
          g.stroke();
          g.restore();
        }
        tris.forEach((tri, idx) => {
          const pts = tri.map(P) as [Px, Px, Px];
          const [pa, pb, pc] = pts;
          const sol = res.tris[idx]!;
          const second = idx === 1;
          g.save();
          g.globalAlpha *= second ? 0.92 : 1;
          poly(pts, withAlpha(second ? col.r() : theme.text, theme.dark ? 0.08 : 0.05), null);
          const dash = second ? [7, 5] : undefined;
          line(pb, lerpPx(pb, pc, dr), col.a(), second ? 2.4 : sideW('a'), { glow: !second, dash, alpha: given('a') || !second ? 1 : 0.9 });
          line(pc, lerpPx(pc, pa, dr), col.b(), second ? 2.4 : sideW('b'), { glow: !second, dash });
          if (!second) line(pa, lerpPx(pa, pb, dr), col.c(), sideW('c'), { glow: true });
          g.restore();
          const vals = [sol.a, sol.b, sol.c];
          const angs = [sol.al, sol.be, sol.ga];
          const outside = [false, false, false];
          const idxSuffix = two ? (second ? '_2' : '_1') : '';
          for (let i = 0; i < 3; i++) {
            if (second && i === 0) continue;
            const key = angKey[i]!;
            const em = given(key) ? 1 : 0.25;
            const src = second && i === 0 ? null : valSrc(i, angs[i]!, true, i > 0 ? idxSuffix : '');
            outside[i] = cornerAngle(pts, i, sideCol[i]!(), em, src, lab, R, fs(34, 28), second);
          }
          for (let i = 0; i < 3; i++) {
            if (second && (i === 2 || i === 0)) continue;
            if (two && !second && i === 0) {
              sideLabel(pts, i, valSrc(i, vals[i]!, false), lab, R, withAlpha(col.a(), 0.6));
              continue;
            }
            sideLabel(pts, i, valSrc(i, vals[i]!, false, i === 1 ? idxSuffix : ''), lab, R, given(sideKey[i]!) ? withAlpha(sideCol[i]!(), 0.6) : undefined);
          }
          if (!second) cornerLabels(pts, two ? ['A', 'B', 'C₁'] : VERT, outside, k.panel);
          else label(pc, 'C₂', theme.text, [pb[0] - pc[0], -Math.abs(pb[0] - pc[0]) * 0.8 - 1], k.panel);
          dot(pa[0], pa[1], theme.text, fs(4.5, 4), k.panel);
          dot(pb[0], pb[1], theme.text, fs(4.5, 4), k.panel);
          dot(pc[0], pc[1], second ? col.r() : theme.text, fs(4.5, 4), k.panel);
        });
        if (two) {
          fpill(R.x + R.w - 12, R.y + fs(76, 84), `\\c{r}{\\t{${say(L('Zwei Dreiecke erfüllen die Angaben', 'Two triangles fit the data'))}}}`, { align: 'right', size: fs(12.5, 11.5), border: withAlpha(col.r(), 0.6), alpha: lab, maxW: R.w - 40 });
        }
      } else {
        // kein Dreieck: zeigen, warum
        const pA = P([0, 0]);
        const pB = P([G.c, 0]);
        line(pA, pB, col.c(), fs(5, 4.4), { glow: true, alpha: lab });
        g.save();
        g.globalAlpha *= lab;
        g.setLineDash([6, 5]);
        g.lineWidth = 1.8;
        if (kc === 'sss') {
          g.strokeStyle = withAlpha(col.b(), 0.85);
          g.beginPath();
          g.arc(pA[0], pA[1], G.b * V.s, -Math.PI, 0, false);
          g.stroke();
          g.strokeStyle = withAlpha(col.a(), 0.85);
          g.beginPath();
          g.arc(pB[0], pB[1], G.a * V.s, -Math.PI, 0, false);
          g.stroke();
        } else if (kc === 'wsw') {
          const L0 = G.c * 1.2;
          g.strokeStyle = withAlpha(col.a(), 0.9);
          g.beginPath();
          g.moveTo(pA[0], pA[1]);
          const qa = P([L0 * cosD(G.al), L0 * sinD(G.al)]);
          g.lineTo(qa[0], qa[1]);
          g.stroke();
          g.strokeStyle = withAlpha(col.b(), 0.9);
          g.beginPath();
          g.moveTo(pB[0], pB[1]);
          const qb = P([G.c - L0 * cosD(G.be), L0 * sinD(G.be)]);
          g.lineTo(qb[0], qb[1]);
          g.stroke();
        } else {
          const L0 = (G.c + G.a) * 1.3;
          g.strokeStyle = withAlpha(theme.muted, 0.9);
          g.beginPath();
          g.moveTo(pA[0], pA[1]);
          const qa = P([L0 * cosD(G.al), L0 * sinD(G.al)]);
          g.lineTo(qa[0], qa[1]);
          g.stroke();
          g.strokeStyle = withAlpha(col.a(), 0.85);
          g.beginPath();
          g.arc(pB[0], pB[1], G.a * V.s, 0, TAU);
          g.stroke();
        }
        g.restore();
        const tri0: [Px, Px, Px] = [pA, pB, P([G.c / 2, G.c])];
        if (given('al')) cornerAngle(tri0, 0, col.a(), 1, valSrc(0, G.al, true), lab, R, fs(34, 28));
        if (given('be')) cornerAngle(tri0, 1, col.b(), 1, valSrc(1, G.be, true), lab, R, fs(34, 28));
        fpill((pA[0] + pB[0]) / 2, pA[1] + 20, valSrc(2, G.c, false), { size: fs(12.5, 11.5), alpha: lab, bounds: R, border: withAlpha(col.c(), 0.6) });
        if (given('a')) fpill(pB[0] + 12, pB[1] - G.a * V.s * 0.55, valSrc(0, G.a, false), { align: 'left', size: fs(12.5, 11.5), alpha: lab, bounds: R, border: withAlpha(col.a(), 0.6) });
        if (given('b')) fpill(pA[0] - 12, pA[1] - G.b * V.s * 0.55, valSrc(1, G.b, false), { align: 'right', size: fs(12.5, 11.5), alpha: lab, bounds: R, border: withAlpha(col.b(), 0.6) });
        label(pA, 'A', theme.text, [-1, 0.6], k.panel);
        label(pB, 'B', theme.text, [1, 0.6], k.panel);
        dot(pA[0], pA[1], theme.text, fs(4.5, 4), k.panel);
        dot(pB[0], pB[1], theme.text, fs(4.5, 4), k.panel);
        fpill(R.x + R.w / 2, R.y + R.h - 30, `\\c{w}{\\t{${say(noneText(res.reason))}}}`, { size: fs(13, 11.5), border: withAlpha(col.warn(), 0.7), alpha: lab, maxW: R.w - 40 });
      }
      g.restore();
      drawChips(R, k);
      g.restore();
    }
    const noneText = (r: string): Txt =>
      r === 'triangle'
        ? L('Kein Dreieck: Die beiden kürzeren Seiten sind zusammen nicht länger als die dritte.', 'No triangle: the two shorter sides together are not longer than the third.')
        : r === 'angles'
          ? L('Kein Dreieck: α + β ist nicht kleiner als 180° – die Schenkel treffen sich nicht.', 'No triangle: α + β is not less than 180° – the arms never meet.')
          : r === 'short'
            ? L('Kein Dreieck: Der Kreis um B mit Radius a erreicht den Schenkel nicht (sin γ > 1).', 'No triangle: the circle about B with radius a does not reach the arm (sin γ > 1).')
            : L('Kein Dreieck: Bei stumpfem α muss a die längste Seite sein.', 'No triangle: with an obtuse α, a must be the longest side.');

    /* =====================================================================
     * Anwendungen: Lageplan (Draufsicht)
     * ===================================================================== */
    /** Wiese mit Grashalmen als Hintergrund eines Lageplans. */
    function meadow(R: Rect): void {
      const g = surface.g;
      const dark = th().dark;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = dark ? '#1f3320' : '#cfe8bf';
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      const grad = g.createLinearGradient(R.x, R.y, R.x + R.w, R.y + R.h);
      grad.addColorStop(0, dark ? '#233b24' : '#d8eec9');
      grad.addColorStop(1, dark ? '#1a2c1b' : '#bfdfab');
      g.fillStyle = grad;
      g.fillRect(R.x, R.y, R.w, R.h);
      g.strokeStyle = dark ? 'rgba(140,190,120,0.18)' : 'rgba(70,130,60,0.22)';
      g.lineWidth = 1.2;
      g.beginPath();
      let seed = 7;
      const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (let i = 0; i < 140; i++) {
        const x = R.x + rnd() * R.w;
        const y = R.y + rnd() * R.h;
        g.moveTo(x, y);
        g.lineTo(x + 2, y - 5);
        g.moveTo(x + 3, y);
        g.lineTo(x + 3.5, y - 4);
      }
      g.stroke();
      g.restore();
      g.strokeStyle = dark ? '#2f4a30' : '#a9cf96';
      g.lineWidth = 1.2;
      roundRect(g, R.x + 1.5, R.y + 1.5, R.w - 3, R.h - 3, 14);
      g.stroke();
    }

    /** Maßstabsleiste unten links. */
    function scaleBar(R: Rect, s: number, alpha: number): void {
      const g = surface.g;
      const target = 90;
      const raw = target / s;
      const mag = 10 ** Math.floor(Math.log10(raw));
      const nice = [1, 2, 5, 10].map((f) => f * mag).find((v) => v * s >= target * 0.6) ?? mag * 10;
      const len = nice * s;
      const x = R.x + 16;
      const y = R.y + R.h - 18;
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.88)';
      roundRect(g, x - 8, y - 22, len + 16 + 50, 32, 8);
      g.fill();
      g.fillStyle = th().text;
      g.fillRect(x, y - 4, len / 2, 5);
      g.strokeStyle = th().text;
      g.lineWidth = 1;
      g.strokeRect(x + 0.5, y - 3.5, len - 1, 4);
      g.font = `600 ${fs(11.5, 11)}px ${th().font}`;
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillText(`${N(nice, 0)} m`, x + len + 8, y + 2);
      g.fillText('0', x - 2, y - 8);
      g.restore();
    }

    /** Vermesser mit Dreibein (Draufsicht). */
    function tripod(q: Px, color: string, alpha: number): void {
      const g = surface.g;
      if (alpha <= 0.01) return;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = th().dark ? '#c9cfd8' : '#4a5160';
      g.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * TAU) / 3;
        g.beginPath();
        g.moveTo(q[0], q[1]);
        g.lineTo(q[0] + Math.cos(a) * 12, q[1] + Math.sin(a) * 12);
        g.stroke();
      }
      g.restore();
      dot(q[0], q[1], color, fs(6, 5.5), alpha);
    }

    function drawTree(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const V = viewOf('tree');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const s = S.v;
      const al = P1.v;
      const be = P2.v;
      const v = survey(s, al, be);
      const show = p.show;
      const lab = k.labels;
      const st = (i: number) => storyK(now, i, 5);
      const A: Pt = [0, 0];
      const B: Pt = [s, 0];
      const T: Pt = [v.along, v.width];
      const pA = P(A);
      const pB = P(B);
      const pT = P(T);
      g.save();
      g.globalAlpha *= alpha;
      meadow(R);
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      // Fluss
      const yN = P([0, v.width * 0.1])[1];
      const yF = P([0, v.width * 0.88])[1];
      const wave = (y: number, amp: number, ph: number) => (x: number) => y + Math.sin(x / 38 + ph) * amp + Math.sin(x / 13 + ph * 2) * amp * 0.3;
      const near = wave(yN, 4, 0.4);
      const farW = wave(yF, 5, 1.7);
      g.beginPath();
      g.moveTo(R.x, near(R.x));
      for (let x = R.x; x <= R.x + R.w + 8; x += 8) g.lineTo(x, near(x));
      for (let x = R.x + R.w + 8; x >= R.x - 8; x -= 8) g.lineTo(x, farW(x));
      g.closePath();
      const rg = g.createLinearGradient(0, yF, 0, yN);
      rg.addColorStop(0, dark ? '#1d3f5e' : '#8fc3ea');
      rg.addColorStop(0.5, dark ? '#24507a' : '#a9d3f2');
      rg.addColorStop(1, dark ? '#1d3f5e' : '#8fc3ea');
      g.fillStyle = rg;
      g.fill();
      g.strokeStyle = dark ? '#8a7a5a' : '#d9c79c';
      g.lineWidth = 4;
      g.stroke();
      // Wellen
      g.strokeStyle = dark ? 'rgba(180,215,245,0.25)' : 'rgba(255,255,255,0.7)';
      g.lineWidth = 1.4;
      const ph = (now / 1600) % TAU;
      for (let i = 1; i <= 3; i++) {
        const yy = lerp(yF, yN, i / 4);
        g.beginPath();
        for (let x = R.x; x <= R.x + R.w; x += 6) {
          const y = yy + Math.sin(x / 22 + ph + i) * 2.5;
          if ((x / 6) % 9 < 4) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      // Baum am anderen Ufer (Krone von oben)
      const cr = fs(20, 16);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 3;
      g.shadowOffsetY = 4;
      const cg = g.createRadialGradient(pT[0] - cr * 0.3, pT[1] - cr * 0.35, 2, pT[0], pT[1], cr);
      cg.addColorStop(0, dark ? '#4f8a45' : '#7cc46a');
      cg.addColorStop(1, dark ? '#2a5a28' : '#3f8a35');
      g.fillStyle = cg;
      g.beginPath();
      for (let i = 0; i <= 14; i++) {
        const a = (i / 14) * TAU;
        const rr = cr * (0.86 + 0.14 * Math.sin(i * 2.7));
        const x = pT[0] + Math.cos(a) * rr;
        const y = pT[1] + Math.sin(a) * rr;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
      g.restore();
      // Standlinie wie ein Maßband
      const k0 = st(0);
      const pBs = lerpPx(pA, pB, k0);
      line(pA, pBs, col.c(), fs(5, 4.4), { glow: true });
      g.save();
      g.strokeStyle = dark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)';
      g.lineWidth = 1;
      const len = Math.hypot(pBs[0] - pA[0], pBs[1] - pA[1]);
      const step10 = 10 * V.s;
      if (step10 > 3) {
        g.beginPath();
        for (let d = step10; d < len; d += step10) {
          g.moveTo(pA[0] + d, pA[1] - 2);
          g.lineTo(pA[0] + d, pA[1] + 2);
        }
        g.stroke();
      }
      g.restore();
      // Visierlinien
      const k1 = st(1);
      const k2 = st(2);
      const sightA = lerpPx(pA, pT, k1);
      const sightB = lerpPx(pB, pT, k2);
      line(pA, sightA, col.b(), fs(3.4, 3), { glow: true, alpha: k1 > 0 ? 1 : 0 });
      line(pB, sightB, col.a(), fs(3.4, 3), { glow: true, alpha: k2 > 0 ? 1 : 0 });
      // Abstand zur Standlinie
      const k4 = st(4);
      const pF = P([v.along, 0]);
      if (k4 > 0.01) {
        line(pF, lerpPx(pF, pT, k4), col.h(), 1.8, { dash: [6, 4], alpha: 0.95 });
        if (v.along > s || v.along < 0) line(v.along > s ? pB : pA, pF, withAlpha(theme.text, 0.5), 1.4, { dash: [4, 4] });
        if (k4 > 0.9) rightMark(pF, [pA[0] - pF[0] || 1, 0], [0, -1], 9, col.h(), lab);
      }
      // Winkel
      const tri: [Px, Px, Px] = [pA, pB, pT];
      const angSrc = (name: string, v0: number, key: string, known: boolean) => (known ? `\\c{${key}}{${name} = ${N(v0, 0)}°}` : `\\c{${key}}{${name} = ?}`);
      if (k1 > 0.3) cornerAngle([pA, pB, lerpPx(pA, pT, Math.max(k1, 0.01))], 0, col.a(), 1, angSrc('α', al, 'a', true), lab * clamp01((k1 - 0.3) / 0.4), R);
      if (k2 > 0.3) cornerAngle([pA, pB, lerpPx(pB, pT, Math.max(k2, 0.01))], 1, col.b(), 1, angSrc('β', be, 'b', true), lab * clamp01((k2 - 0.3) / 0.4), R);
      const k3 = st(3);
      if (k3 > 0.01) cornerAngle(tri, 2, col.c(), 0.8, show ? `\\c{c}{γ = ${N(v.tau, 0)}°}` : '\\c{c}{γ = ?}', lab * k3, R, fs(30, 24));
      // Strecken beschriften
      sideLabel(tri, 2, `\\c{c}{\\b{s = ${N(s, 0)} ${M}}}`, lab * k0, R, withAlpha(col.c(), 0.6));
      const dval = (v0: number, key: string, name: string) => (show && k4 > 0.5 ? `\\c{${key}}{${name} ${eq(v0, 1)} ${N(v0, 1)} ${M}}` : `\\c{${key}}{${name} = ?}`);
      if (k1 > 0.9) sideLabel(tri, 1, dval(v.at, 'b', '|AT|'), lab, R);
      if (k2 > 0.9) sideLabel(tri, 0, dval(v.bt, 'a', '|BT|'), lab, R);
      if (k4 > 0.6) {
        const mid = lerpPx(pF, pT, 0.42);
        const dsrc = show ? `\\c{h}{d ${eq(v.width, 1)} ${N(v.width, 1)} ${M}}` : '\\c{h}{d = ?}';
        const right = pF[0] < (pA[0] + pB[0]) / 2;
        fpill(mid[0] + (right ? 10 : -10), mid[1], dsrc, { align: right ? 'left' : 'right', size: fs(12, 11), bounds: R, alpha: lab * clamp01((k4 - 0.6) / 0.4), border: withAlpha(col.h(), 0.6) });
      }
      tripod(pA, theme.text, k.panel);
      tripod(pB, theme.text, k.panel);
      label(pA, 'A', theme.text, [-1, 0.7], k.panel);
      label(pB, 'B', theme.text, [1, 0.7], k.panel);
      label(pT, 'T', theme.text, [0.9, -0.9], k.panel, cr - 4);
      if (!story) {
        handle(pB, 'S', theme.text, 0);
        if (editable()) {
          hits.push({ id: 'T', x: pT[0], y: pT[1], r: fs(22, 26) });
          if (hover === 'T' || drag === 'T') {
            g.save();
            g.strokeStyle = withAlpha('#ffffff', 0.9);
            g.lineWidth = 2;
            g.setLineDash([3, 3]);
            g.beginPath();
            g.arc(pT[0], pT[1], cr + 5, 0, TAU);
            g.stroke();
            g.restore();
          }
        }
      }
      scaleBar(R, V.s, k.panel);
      g.restore();
      fpill(R.x + 12, R.y + 30, `\\t{${say(L('Lageplan', 'Map'))}}: \\c{c}{s}, \\c{a}{α}, \\c{b}{β} \\t{${say(L('gemessen', 'measured'))}} ⇒ \\c{c}{γ} = 180° − α − β ⇒ \\c{r}{\\t{${say(L('Sinussatz', 'law of sines'))}}}`, { align: 'left', size: fs(13.5, 12), alpha: k.panel, border: withAlpha(col.r(), 0.55), maxW: R.w - 40 });
      g.restore();
    }

    /** Lage der Orte beim See: C unten, A links, B rechts; dazu die Uferlinie des Sees. */
    function lakePts(b: number, a: number, wDeg: number): { tri: [Pt, Pt, Pt]; lake: Pt[] } {
      const C: Pt = [0, 0];
      const A: Pt = [b * cosD(90 + wDeg / 2), b * sinD(90 + wDeg / 2)];
      const B: Pt = [a * cosD(90 - wDeg / 2), a * sinD(90 - wDeg / 2)];
      const c = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const u: Pt = [(B[0] - A[0]) / c, (B[1] - A[1]) / c];
      let n: Pt = [-u[1], u[0]];
      if (n[0] * (C[0] - A[0]) + n[1] * (C[1] - A[1]) > 0) n = [-n[0], -n[1]];
      const f = foot(C, A, B);
      const hc = Math.hypot(C[0] - f.at[0], C[1] - f.at[1]);
      const away = 0.36 * c;
      const toward = Math.min(0.22 * c, 0.55 * hc);
      const lake: Pt[] = [];
      for (let i = 0; i < 48; i++) {
        const t = (i / 48) * TAU;
        const x = Math.cos(t);
        const y = Math.sin(t);
        const wob = 1 + 0.06 * Math.sin(3 * t + 0.6) + 0.04 * Math.sin(5 * t + 1.3);
        const ext = y >= 0 ? away : toward;
        const mx = (A[0] + B[0]) / 2;
        const my = (A[1] + B[1]) / 2;
        const along = (x * c) / 2 * (Math.abs(y) < 0.2 ? 1 : wob);
        const perp = y * ext * wob;
        lake.push([mx + u[0] * along + n[0] * perp, my + u[1] * along + n[1] * perp]);
      }
      return { tri: [A, B, C], lake };
    }

    function house(q: Px, alpha: number): void {
      const g = surface.g;
      if (alpha <= 0.01) return;
      const dark = th().dark;
      g.save();
      g.globalAlpha *= alpha;
      const offs: [number, number, number][] = [
        [-11, -9, 9],
        [4, -12, 8],
        [-3, 5, 10],
        [10, 3, 7],
      ];
      for (const [dx, dy, sz] of offs) {
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.3)';
        g.shadowBlur = 4;
        g.shadowOffsetX = 2;
        g.shadowOffsetY = 2;
        g.fillStyle = dark ? '#8a4b3c' : '#c8644c';
        g.fillRect(q[0] + dx - sz / 2, q[1] + dy - sz / 2, sz, sz);
        g.restore();
        g.strokeStyle = dark ? '#5e3127' : '#9a4532';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(q[0] + dx - sz / 2, q[1] + dy);
        g.lineTo(q[0] + dx + sz / 2, q[1] + dy);
        g.stroke();
      }
      g.restore();
    }

    function drawLake(now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const V = viewOf('lake');
      const R = V.R;
      const P = (q: Pt) => toPx(V, q);
      const b = D1.v;
      const a = D2.v;
      const wg = WL.v;
      const c = lakeDistance(a, b, wg);
      const show = p.show;
      const lab = k.labels;
      const st = (i: number) => storyK(now, i, 4);
      const L1 = lakePts(b, a, wg);
      const [A, B, C] = L1.tri;
      const pA = P(A);
      const pB = P(B);
      const pC = P(C);
      g.save();
      g.globalAlpha *= alpha;
      meadow(R);
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
      g.clip();
      // See
      const lp = L1.lake.map(P);
      g.save();
      g.beginPath();
      lp.forEach((q, i) => (i === 0 ? g.moveTo(q[0], q[1]) : g.lineTo(q[0], q[1])));
      g.closePath();
      const mx = (pA[0] + pB[0]) / 2;
      const my = (pA[1] + pB[1]) / 2;
      const lg = g.createRadialGradient(mx, my, 4, mx, my, Math.hypot(pB[0] - pA[0], pB[1] - pA[1]) * 0.6);
      lg.addColorStop(0, dark ? '#24507a' : '#a9d3f2');
      lg.addColorStop(1, dark ? '#1b3d5d' : '#86bde6');
      g.fillStyle = lg;
      g.fill();
      g.strokeStyle = dark ? '#8a7a5a' : '#d9c79c';
      g.lineWidth = 4;
      g.lineJoin = 'round';
      g.stroke();
      g.restore();
      // Wellen
      g.save();
      g.strokeStyle = dark ? 'rgba(180,215,245,0.25)' : 'rgba(255,255,255,0.75)';
      g.lineWidth = 1.4;
      const ph = (now / 1700) % TAU;
      const ux = (pB[0] - pA[0]) / (Math.hypot(pB[0] - pA[0], pB[1] - pA[1]) || 1);
      const uy = (pB[1] - pA[1]) / (Math.hypot(pB[0] - pA[0], pB[1] - pA[1]) || 1);
      const cpx = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);
      for (let i = -2; i <= 2; i++) {
        const ox = mx - uy * i * 14 * (i < 0 ? 0.6 : 1) * -1;
        const oy = my + ux * i * 14 * (i < 0 ? 0.6 : 1) * -1;
        const half = cpx * (0.18 - Math.abs(i) * 0.025);
        g.beginPath();
        for (let d = -half; d <= half; d += 5) {
          const wv = Math.sin(d / 9 + ph + i) * 2;
          const x = ox + ux * d - uy * wv;
          const y = oy + uy * d + ux * wv;
          if (d === -half) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      g.restore();
      const k0 = st(0);
      const k1 = st(1);
      const k2 = st(2);
      const k3 = st(3);
      line(pC, lerpPx(pC, pA, k0), col.b(), fs(4.2, 3.6), { glow: true, alpha: k0 > 0 ? 1 : 0 });
      line(pC, lerpPx(pC, pB, k1), col.a(), fs(4.2, 3.6), { glow: true, alpha: k1 > 0 ? 1 : 0 });
      const tri: [Px, Px, Px] = [pA, pB, pC];
      if (k2 > 0.01) cornerAngle([lerpPx(pC, pA, Math.max(k0, 0.01)), lerpPx(pC, pB, Math.max(k1, 0.01)), pC], 2, col.c(), 1, `\\c{c}{\\b{γ = ${N(wg, 0)}°}}`, lab * k2, R);
      if (k3 > 0.01) line(pA, lerpPx(pA, pB, k3), col.c(), fs(3.4, 3), { dash: [9, 6], glow: true });
      sideLabel(tri, 1, `\\c{b}{\\b{b = ${N(b, 0)} ${M}}}`, lab * k0, R, withAlpha(col.b(), 0.6));
      sideLabel(tri, 0, `\\c{a}{\\b{a = ${N(a, 0)} ${M}}}`, lab * k1, R, withAlpha(col.a(), 0.6));
      if (k3 > 0.3) {
        const cv = c * clamp01((k3 - 0.3) / 0.7);
        const src = show ? `\\c{c}{c = |AB| ${k3 < 0.999 ? '≈' : eq(c, 1)} ${N(k3 < 0.999 ? cv : c, 1)} ${M}}` : '\\c{c}{c = |AB| = ?}';
        const mid = lerpPx(pA, pB, 0.5);
        fpill(mid[0], mid[1], src, { size: fs(12.5, 11.5), bounds: R, alpha: lab * clamp01((k3 - 0.3) / 0.4), border: withAlpha(col.c(), 0.6) });
      }
      house(pA, k.panel);
      house(pB, k.panel);
      tripod(pC, theme.text, k.panel);
      const gx = (pA[0] + pB[0] + pC[0]) / 3;
      const gy = (pA[1] + pB[1] + pC[1]) / 3;
      label(pA, 'A', theme.text, [pA[0] - gx, pA[1] - gy], k.panel, 14);
      label(pB, 'B', theme.text, [pB[0] - gx, pB[1] - gy], k.panel, 14);
      label(pC, 'C', theme.text, [0, 1], k.panel, 8);
      if (!story && editable()) {
        for (const [q, id] of [
          [pA, 'LA'],
          [pB, 'LB'],
        ] as [Px, HitId][]) {
          hits.push({ id, x: q[0], y: q[1], r: fs(24, 28) });
          if (hover === id || drag === id) {
            g.save();
            g.strokeStyle = withAlpha(theme.text, 0.6);
            g.lineWidth = 2;
            g.setLineDash([3, 3]);
            g.beginPath();
            g.arc(q[0], q[1], 20, 0, TAU);
            g.stroke();
            g.restore();
          }
        }
      }
      scaleBar(R, V.s, k.panel);
      g.restore();
      fpill(R.x + 12, R.y + 30, `\\t{${say(L('Lageplan', 'Map'))}}: \\c{b}{b}, \\c{a}{a}, \\c{c}{γ} \\t{${say(L('gemessen', 'measured'))}} ⇒ \\c{h}{\\t{${say(L('Kosinussatz', 'law of cosines'))}}}`, { align: 'left', size: fs(13.5, 12), alpha: k.panel, border: withAlpha(col.h(), 0.55), maxW: R.w - 40 });
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

    /** Sinussatz: drei gleich lange Balken; der dunkle Teil ist die Seite, sein Anteil ist der Sinus. */
    function sinBarsCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const t = shownTri(now);
        const flat = isFlat(t);
        const maxW = R.w - 2 * pad;
        const head = fit(`\\f{\\c{a}{a}}{sin \\c{a}{α}} = \\f{\\c{b}{b}}{sin \\c{b}{β}} = \\f{\\c{c}{c}}{sin \\c{c}{γ}} = \\c{r}{2r}`, maxW, fs(15, 14));
        const rs = fs(12.5, 11.5);
        const barH = fs(10, 9);
        const rowsH = 4 * (rs * 1.25 + 4 + barH + 9);
        const capSize = fs(11.5, 11);
        const cap = wrapText(say(L('Dunkler Teil: die Seite. Ihr Anteil am Balken ist der Sinus des Gegenwinkels, denn a = 2r · sin α.', 'Dark part: the side. Its share of the bar is the sine of the opposite angle, because a = 2r · sin α.')), maxW, `500 ${capSize}px ${theme.font}`);
        const h = 38 + rowH(head) + 12 + (flat ? 24 : rowsH) + cap.length * capSize * 1.32 + 10;
        if (measure) return h;
        card({ ...R, h }, col.r());
        cardTitle(R, say(L('Sinussatz', 'Law of sines')), col.r(), '\\c{r}{= 2r}');
        let y = R.y + 38;
        head.draw(g, R.x + pad, y + head.asc);
        y += rowH(head) + 12;
        if (flat) {
          y += 24;
        } else {
          const s = sides(t);
          const w = angles(t);
          const r2 = 2 * circumradius(t);
          const ref = Math.max(r2, 8) * 1.06;
          const grow = ease.outCubic(clamp01(k.stagger * 1.4));
          const pr = proofState(now);
          const pulse = pr ? pr.rows[3]! * (1 - pr.rows[4]!) : 0;
          const rows: { key: string; side: number | null; q: number; name: string; ang: string }[] = [0, 1, 2].map((i) => ({ key: KEY[i]!, side: s[i]!, q: s[i]! / sinD(w[i]!), name: KEY[i]!, ang: ANG[i]! }));
          rows.push({ key: 'r', side: null, q: r2, name: '2r', ang: '' });
          rows.forEach((rw, i) => {
            const c0 = rw.key === 'r' ? col.r() : sideCol[i]!();
            const known = rw.key === 'r' ? p.show : knownDrag(rw.name) && knownDrag(rw.ang);
            let src: string;
            if (rw.key === 'r') src = `\\c{r}{2r} ${known ? `${eq(rw.q)} \\b{${N(rw.q)} cm}` : '= ?'} \\c{m}{\\t{(${say(L('Umkreisdurchmesser', 'circumcircle diameter'))})}}`;
            else {
              const sv = knownDrag(rw.name) ? N(rw.side!) : '?';
              const wv = knownDrag(rw.ang) ? N(sinD(w[i]!), 3) : '?';
              src = `\\c{${rw.key}}{${rw.name}} : sin \\c{${rw.key}}{${rw.ang}} = ${sv} : ${wv} ${known ? `${eq(rw.q)} \\b{${N(rw.q)}}` : '= ?'}`;
            }
            const box = fit(src, maxW, rs);
            box.draw(g, R.x + pad, y + box.asc);
            y += rs * 1.25 + 4;
            const full = (rw.q / ref) * maxW * grow;
            const x0 = R.x + pad;
            g.save();
            g.fillStyle = withAlpha(c0, theme.dark ? 0.22 : 0.16);
            roundRect(g, x0, y, Math.max(2, full), barH, barH / 2);
            g.fill();
            if (rw.side !== null) {
              const known2 = knownDrag(rw.name);
              if (known2) {
                g.fillStyle = c0;
                roundRect(g, x0, y, Math.max(2, (rw.side / ref) * maxW * grow), barH, barH / 2);
                g.fill();
              }
            } else {
              g.fillStyle = withAlpha(c0, 0.85);
              roundRect(g, x0, y, Math.max(2, full), barH, barH / 2);
              g.fill();
            }
            if (pulse > 0.01) {
              g.strokeStyle = withAlpha(c0, pulse);
              g.lineWidth = 2;
              roundRect(g, x0 - 2, y - 2, full + 4, barH + 4, barH / 2 + 2);
              g.stroke();
            }
            g.restore();
            y += barH + 9;
          });
          // gemeinsames Ende
          const xe = R.x + pad + (r2 / ref) * maxW * grow;
          g.save();
          g.strokeStyle = withAlpha(col.r(), 0.7);
          g.setLineDash([3, 3]);
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(xe, y - rowsH + rs * 1.25);
          g.lineTo(xe, y - 6);
          g.stroke();
          g.restore();
        }
        g.save();
        g.font = `500 ${capSize}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        cap.forEach((ln, i) => g.fillText(ln, R.x + pad, y + capSize * 0.66 + i * capSize * 1.32));
        g.restore();
        return h;
      };
    }

    /** Beweisidee über die Höhe h_c, Zeile für Zeile. */
    function proofCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const t = shownTri(now);
        if (isFlat(t)) return 0;
        const s = sides(t);
        const w = angles(t);
        const pr = proofState(now);
        const at = (i: number) => (pr ? pr.rows[i]! : undefined);
        const show = p.show;
        const sa = sinD(w[0]);
        const sb = sinD(w[1]);
        const hc = s[1] * sa;
        const ms = fs(12, 11);
        const obt = w[0] > 90 ? 'α' : w[1] > 90 ? 'β' : '';
        const rows: Row[] = [
          { src: `\\c{m}{① \\t{${say(L('Dreieck', 'Triangle'))}} AFC:}  sin \\c{a}{α} = \\f{\\c{h}{h_c}}{\\c{b}{b}}  ⇒  \\c{h}{h_c} = \\c{b}{b} · sin \\c{a}{α}`, at: at(0), gap: 4 },
          { src: show ? `\\c{m}{= ${N(s[1])} · ${N(sa, 3)} ≈ ${N(hc)} cm}` : '', size: ms, at: at(0), gap: 8 },
          { src: `\\c{m}{② \\t{${say(L('Dreieck', 'Triangle'))}} BFC:}  sin \\c{b}{β} = \\f{\\c{h}{h_c}}{\\c{a}{a}}  ⇒  \\c{h}{h_c} = \\c{a}{a} · sin \\c{b}{β}`, at: at(1), gap: 4 },
          { src: show ? `\\c{m}{= ${N(s[0])} · ${N(sb, 3)} ≈ ${N(s[0] * sb)} cm}` : '', size: ms, at: at(1), gap: 8 },
          { src: `\\c{m}{③} \\c{b}{b} · sin \\c{a}{α} = \\c{a}{a} · sin \\c{b}{β}`, at: at(2), gap: 8 },
          { src: `\\c{m}{④ | : (sin α · sin β)}   \\f{\\c{a}{a}}{sin \\c{a}{α}} = \\f{\\c{b}{b}}{sin \\c{b}{β}}`, at: at(3), gap: 8 },
          { src: `\\c{m}{⑤ \\t{${say(L('Mit der Höhe', 'With the altitude'))}} h_a: \\f{b}{sin β} = \\f{c}{sin γ}}`, size: ms, color: th().muted, at: at(4), gap: obt ? 6 : 4 },
        ].filter((r) => r.src !== '');
        if (obt) rows.push({ src: `\\c{m}{\\t{${say(L(`${obt} stumpf: F liegt außerhalb, sin(180° − ${obt}) = sin ${obt}`, `${obt} obtuse: F lies outside, sin(180° − ${obt}) = sin ${obt}`))}}}`, size: ms, color: th().muted, at: at(4) });
        return formulaCard(R, measure, k, say(L('Beweisidee: Höhe h_c', 'Proof idea: altitude h_c')), col.h(), rows);
      };
    }

    /** Flächeninhalt A = ½ · a · b · sin γ. */
    function areaCard(now: number, k: Intro, data: { a: number; b: number; ga: number; idx?: string }[] | null): CardFn {
      return (R, measure) => {
        let list = data;
        if (!list) {
          const t = shownTri(now);
          if (isFlat(t)) return 0;
          const s = sides(t);
          list = [{ a: s[0], b: s[1], ga: angles(t)[2] }];
        }
        const show = p.show && (mode() !== 'solve' || revealed(now, kase() === 'sws' ? 'ga' : 'ga') > 0.5);
        const rows: Row[] = [{ src: `A = \\f{1}{2} · \\c{a}{a} · \\c{b}{b} · sin \\c{c}{γ}`, size: fs(14.5, 13.5), gap: 8 }];
        for (const d of list) {
          const A = areaSAS(d.a, d.b, d.ga);
          rows.push({ src: `A${d.idx ?? ''} ${show ? `= \\f{1}{2} · ${N(d.a)} · ${N(d.b)} · sin ${N(d.ga, 1)}° ${eq(A, 1)} \\b{${N(A, 1)} cm²}` : '= ?'}`, size: fs(13, 12), gap: 6 });
        }
        rows.push({ src: `\\c{m}{\\t{${say(L('Zwei Seiten und der eingeschlossene Winkel', 'Two sides and the included angle'))}}}`, size: fs(11.5, 11), color: th().muted, gap: 2 });
        return formulaCard(R, measure, k, say(L('Flächeninhalt', 'Area')), col.c(), rows);
      };
    }

    /** Kosinussatz mit eingesetzten Zahlen. */
    function cosCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const t = shownTri(now);
        const rows: Row[] = [{ src: '\\c{c}{c}² = \\c{a}{a}² + \\c{b}{b}² − \\c{h}{2\\c{a}{a}\\c{b}{b} · cos \\c{c}{γ}}', size: fs(15, 14), gap: 10 }];
        if (!isFlat(t)) {
          const [a, b, c] = sides(t);
          const ga = angles(t)[2];
          const corr = 2 * a * b * cosD(ga);
          const kn = p.show;
          rows.push({ src: `\\c{c}{c}² = ${N(a)}² + ${N(b)}² − 2 · ${N(a)} · ${N(b)} · cos ${N(ga, 1)}°`, size: fs(13, 12), gap: 6 });
          rows.push({
            src: kn ? `\\c{c}{c}² ≈ \\c{a}{${N(a * a, 1)}} + \\c{b}{${N(b * b, 1)}} ${Math.abs(corr) < 0.05 ? '−' : corr > 0 ? '−' : '+'} \\c{h}{${N(Math.abs(corr), 1)}} ≈ \\b{${N(c * c, 1)}}` : `\\c{c}{c}² = ?`,
            size: fs(13, 12),
            gap: 6,
          });
          rows.push({ src: kn ? `\\c{c}{c} ≈ \\r{${N(c * c, 1)}} ≈ \\c{c}{\\b{${N(c)} cm}}` : '\\c{c}{c} = ?', size: fs(13.5, 12.5), gap: 10 });
          rows.push({ src: `\\c{m}{\\t{${say(L('Umgestellt (SSS)', 'Rearranged (SSS)'))}}:}  cos \\c{c}{γ} = \\f{\\c{a}{a}² + \\c{b}{b}² − \\c{c}{c}²}{2\\c{a}{a}\\c{b}{b}}`, size: fs(12.5, 11.5), gap: 4 });
        }
        return formulaCard(R, measure, k, say(L('Kosinussatz', 'Law of cosines')), col.h(), rows);
      };
    }

    /** Flächenbilanz: a² + b² minus Korrektur ergibt c². */
    function balanceCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const t = shownTri(now);
        if (isFlat(t)) return 0;
        const [a, b, c] = sides(t);
        const ga = angles(t)[2];
        const corr = 2 * a * b * cosD(ga);
        const lw = fs(74, 66);
        const barH = fs(14, 12);
        const gapR = fs(10, 8);
        const capSize = fs(12, 11);
        const right0 = Math.abs(ga - 90) < 0.25;
        const msg = right0
          ? say(L('γ = 90°: keine Korrektur – Satz des Pythagoras.', 'γ = 90°: no correction – Pythagoras’ theorem.'))
          : ga < 90
            ? say(L('γ < 90°: c² ist kleiner als a² + b².', 'γ < 90°: c² is less than a² + b².'))
            : say(L('γ > 90°: cos γ < 0, c² ist größer als a² + b².', 'γ > 90°: cos γ < 0, c² is greater than a² + b².'));
        const lines = wrapText(msg, R.w - 2 * pad, `700 ${capSize}px ${theme.font}`);
        const h = 38 + 3 * (barH + gapR) + lines.length * capSize * 1.35 + 12;
        if (measure) return h;
        card({ ...R, h }, col.h());
        cardTitle(R, say(L('Flächenbilanz', 'Balance of areas')), col.h(), '\\c{h}{cm²}');
        const x0 = R.x + pad + lw;
        const x1 = R.x + R.w - pad;
        const total = Math.max(a * a + b * b, c * c, a * a + b * b - corr) * 1.04;
        const grow = ease.outCubic(clamp01(k.stagger * 1.4));
        const X = (v: number) => x0 + ((x1 - x0) * v * grow) / total;
        let y = R.y + 40;
        const bar = (from: number, to: number, c0: string, alpha: number, dash = false, hatched = false) => {
          const l = Math.min(X(from), X(to));
          const wdt = Math.max(2, Math.abs(X(to) - X(from)));
          g.save();
          g.fillStyle = withAlpha(c0, alpha);
          roundRect(g, l, y, wdt, barH, 4);
          g.fill();
          if (hatched) hatch([[l, y], [l + wdt, y], [l + wdt, y + barH], [l, y + barH]], c0, 0.7, 5);
          if (dash) {
            g.strokeStyle = c0;
            g.setLineDash([4, 3]);
            g.lineWidth = 1.4;
            roundRect(g, l, y, wdt, barH, 4);
            g.stroke();
          }
          g.restore();
        };
        const lab = (src: string) => {
          const box = fit(src, lw - 6, fs(12.5, 11.5));
          box.draw(g, R.x + pad, y + barH / 2 + (box.asc - box.desc) / 2);
        };
        const dk = theme.dark;
        lab('\\c{a}{a²} + \\c{b}{b²}');
        bar(0, a * a, col.a(), dk ? 0.75 : 0.7);
        bar(a * a, a * a + b * b, col.b(), dk ? 0.75 : 0.7);
        const yTop = y;
        y += barH + gapR;
        lab(`\\c{h}{${corr >= 0 ? '−' : '+'} 2ab · cos γ}`);
        if (Math.abs(corr) > 1e-6) bar(a * a + b * b, a * a + b * b - corr, col.h(), dk ? 0.35 : 0.28, true, true);
        if (p.show) {
          const v = Math.abs(corr) < 0.05 ? '0' : `${corr > 0 ? '−' : '+'}${N(Math.abs(corr), 1)}`;
          const xe = X(Math.min(a * a + b * b, a * a + b * b - corr));
          const box = fit(`\\c{h}{${v}}`, 80, fs(12, 11), th().text, 700);
          const left = xe - 6 - box.w > x0;
          box.draw(g, left ? xe - 6 - box.w : X(Math.max(a * a + b * b, a * a + b * b - corr)) + 6, y + barH / 2 + (box.asc - box.desc) / 2);
        }
        y += barH + gapR;
        lab('\\c{c}{c²}');
        bar(0, c * c, col.c(), dk ? 0.8 : 0.75);
        if (p.show) {
          const box = fit(`\\c{c}{${N(c * c, 1)}}`, 80, fs(12, 11), th().text, 700);
          const xe = X(c * c);
          const inside = xe + 6 + box.w > x1;
          g.save();
          if (inside) {
            const box2 = fit(`${N(c * c, 1)}`, 80, fs(12, 11), '#ffffff', 700);
            box2.draw(g, xe - 6 - box2.w, y + barH / 2 + (box2.asc - box2.desc) / 2);
          } else box.draw(g, xe + 6, y + barH / 2 + (box.asc - box.desc) / 2);
          g.restore();
        }
        // Hilfslinien
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.35);
        g.setLineDash([3, 3]);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(X(a * a + b * b), yTop - 3);
        g.lineTo(X(a * a + b * b), y + barH + 3);
        g.moveTo(X(c * c), yTop + barH + gapR - 3);
        g.lineTo(X(c * c), y + barH + 3);
        g.stroke();
        g.restore();
        y += barH + gapR + 2;
        g.save();
        g.font = `700 ${capSize}px ${theme.font}`;
        g.fillStyle = right0 ? col.c() : theme.text;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        lines.forEach((ln, i) => g.fillText(ln, R.x + pad, y + capSize * 0.7 + i * capSize * 1.35));
        g.restore();
        return h;
      };
    }

    /** Löser: Entscheidungshilfe. */
    function decideCard(): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const rs = fs(12.5, 11.5);
        const rh = rs * 1.75;
        const kc = kase();
        const G = goalGiven();
        const uses = USES[kc];
        const nm: Record<GKey, string> = { a: 'a', b: 'b', c: 'c', al: 'α', be: 'β', ga: 'γ' };
        const ck: Record<GKey, string> = { a: 'a', b: 'b', c: 'c', al: 'a', be: 'b', ga: 'c' };
        const givenSrc = uses.map((u) => `\\c{${ck[u]}}{${nm[u]} = ${N(G[u], 2)}${u.length === 2 ? '°' : ' cm'}}`).join(',  ');
        const gb = fit(`\\c{m}{\\t{${say(L('Gegeben', 'Given'))}}:}  ${givenSrc}`, R.w - 2 * pad, fs(13, 12));
        const h = 38 + rowH(gb) + 10 + 4 * rh + 8;
        if (measure) return h;
        card({ ...R, h }, lawCol(lawFor(kc)));
        cardTitle(R, say(L('Welcher Satz passt?', 'Which law fits?')), lawCol(lawFor(kc)));
        let y = R.y + 38;
        gb.draw(g, R.x + pad, y + gb.asc);
        y += rowH(gb) + 10;
        const why: Record<Case, Txt> = {
          sss: L('kein Winkel bekannt', 'no angle known'),
          sws: L('Winkel zwischen den Seiten', 'angle between the sides'),
          wsw: L('Winkelsumme, dann Paare', 'angle sum, then pairs'),
          ssw: L('Paar a/α: 0, 1 oder 2 Lösungen', 'pair a/α: 0, 1 or 2 solutions'),
        };
        CASES.forEach((c) => {
          const on = c === kc;
          const law = lawFor(c);
          const lc = lawCol(law);
          if (on) {
            g.save();
            g.fillStyle = withAlpha(lc, theme.dark ? 0.22 : 0.13);
            roundRect(g, R.x + pad - 6, y, R.w - 2 * pad + 12, rh - 3, 8);
            g.fill();
            g.strokeStyle = withAlpha(lc, 0.7);
            g.lineWidth = 1.2;
            roundRect(g, R.x + pad - 5.5, y + 0.5, R.w - 2 * pad + 11, rh - 4, 8);
            g.stroke();
            g.restore();
          }
          const core = `\\b{${say(CASE_NAME[c])}} ⇒ \\c{${law === 'sin' ? 'r' : 'h'}}{\\t{${law === 'sin' ? say(L('Sinussatz', 'law of sines')) : say(L('Kosinussatz', 'law of cosines'))}}}`;
          const full = `${core} \\c{m}{\\t{(${say(why[c])})}}`;
          // Zusatz nur, wenn er in lesbarer Größe passt
          const src = formula(g, full, fstyle(11, theme.text)).w <= R.w - 2 * pad ? full : core;
          const box = fit(src, R.w - 2 * pad, rs, theme.text);
          g.save();
          g.globalAlpha *= on ? 1 : 0.62;
          box.draw(g, R.x + pad, y + (rh - 3) / 2 + (box.asc - box.desc) / 2);
          g.restore();
          y += rh;
        });
        return h;
      };
    }

    /** Löser: Lösung Schritt für Schritt. */
    function stepsCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const kc = kase();
        const G = goalGiven();
        const res = solve(kc, G);
        if (res.kind === 'none') {
          const extra: Record<string, Txt> = {
            triangle: L(`${N(Math.min(G.a, G.b, G.c))} + ${N([G.a, G.b, G.c].sort((x, y) => x - y)[1]!)} ≤ ${N(Math.max(G.a, G.b, G.c))}: Die Dreiecksungleichung ist verletzt.`, `${N(Math.min(G.a, G.b, G.c))} + ${N([G.a, G.b, G.c].sort((x, y) => x - y)[1]!)} ≤ ${N(Math.max(G.a, G.b, G.c))}: the triangle inequality fails.`),
            angles: L(`α + β = ${N(G.al + G.be, 1)}° – für γ bleibt nichts übrig.`, `α + β = ${N(G.al + G.be, 1)}° – nothing is left for γ.`),
            short: L(`sin γ = c · sin α : a = ${N(G.c)} · ${N(sinD(G.al), 3)} : ${N(G.a)} ≈ ${N(res.sinG ?? 0, 3)} > 1 – der Taschenrechner meldet einen Fehler.`, `sin γ = c · sin α : a = ${N(G.c)} · ${N(sinD(G.al), 3)} : ${N(G.a)} ≈ ${N(res.sinG ?? 0, 3)} > 1 – the calculator shows an error.`),
            obtuse: L('Gegenüber dem stumpfen Winkel liegt immer die längste Seite. Hier ist a ≤ c.', 'The longest side is always opposite the obtuse angle. Here a ≤ c.'),
          };
          return textCard(R, measure, k, say(L('Kein Dreieck', 'No triangle')), col.warn(), [
            { s: say(noneText(res.reason)), color: col.warn(), weight: 650 },
            { s: say(extra[res.reason]!) },
          ]);
        }
        if (!p.show) {
          return textCard(R, measure, k, say(L('Lösung', 'Solution')), lawCol(lawFor(kc)), [
            { s: say(L('Welcher Satz passt? Schreibe den Ansatz auf, setze ein und rechne – erst dann nachsehen.', 'Which law fits? Write down the equation, substitute and calculate – then check.')) },
            { s: say(L('„Schritt für Schritt lösen“ zeigt den Rechenweg.', '“Solve step by step” shows the working.')), color: th().muted },
          ]);
        }
        const st = stepsK(now, NSTEPS[kc]);
        const sz = fs(13, 12);
        const ms = fs(12, 11);
        const s1 = res.tris[0]!;
        const rows: Row[] = [];
        const add = (src: string, i: number, opts: Partial<Row> = {}) => rows.push({ src, at: st[i], size: sz, gap: 6, ...opts });
        const n = (v: number) => N(v, 2);
        if (kc === 'sss') {
          const cg = (G.a * G.a + G.b * G.b - G.c * G.c) / (2 * G.a * G.b);
          const ca = (G.b * G.b + G.c * G.c - G.a * G.a) / (2 * G.b * G.c);
          add(`① cos \\c{c}{γ} = \\f{\\c{a}{a}² + \\c{b}{b}² − \\c{c}{c}²}{2\\c{a}{a}\\c{b}{b}}`, 0, { gap: 4 });
          add(`= \\f{${n(G.a * G.a)} + ${n(G.b * G.b)} − ${n(G.c * G.c)}}{2 · ${n(G.a)} · ${n(G.b)}} ${eq(cg, 4)} \\b{${N(cg, 4)}}`, 0, { gap: 8 });
          add(`② \\c{c}{γ} = cos^{−1}(${N(cg, 4)}) ${eq(s1.ga)} \\c{c}{\\b{${N(s1.ga)}°}}`, 1, { gap: 8 });
          add(`③ cos \\c{a}{α} = \\f{\\c{b}{b}² + \\c{c}{c}² − \\c{a}{a}²}{2\\c{b}{b}\\c{c}{c}} ${eq(ca, 4)} ${N(ca, 4)}`, 2, { gap: 4 });
          add(`\\c{a}{α} = cos^{−1}(${N(ca, 4)}) ${eq(s1.al)} \\c{a}{\\b{${N(s1.al)}°}}`, 2, { gap: 8 });
          add(`④ \\c{b}{β} = 180° − α − γ ${eq(s1.be)} \\c{b}{\\b{${N(s1.be)}°}}`, 3);
        } else if (kc === 'sws') {
          add(`① \\c{c}{c}² = \\c{a}{a}² + \\c{b}{b}² − 2\\c{a}{a}\\c{b}{b} · cos \\c{c}{γ}`, 0, { gap: 4 });
          add(`\\c{m}{= ${n(G.a * G.a)} + ${n(G.b * G.b)} − 2 · ${n(G.a)} · ${n(G.b)} · cos ${N(G.ga, 1)}° ${eq(s1.c * s1.c)} ${n(s1.c * s1.c)}}`, 0, { size: ms, gap: 8 });
          add(`② \\c{c}{c} = \\r{${n(s1.c * s1.c)}} ${eq(s1.c, 3)} \\c{c}{\\b{${N(s1.c, 3)} cm}}`, 1, { gap: 8 });
          const ca = (G.b * G.b + s1.c * s1.c - G.a * G.a) / (2 * G.b * s1.c);
          add(`③ cos \\c{a}{α} = \\f{\\c{b}{b}² + \\c{c}{c}² − \\c{a}{a}²}{2\\c{b}{b}\\c{c}{c}} ${eq(ca, 4)} ${N(ca, 4)}`, 2, { gap: 4 });
          add(`\\c{a}{α} = cos^{−1}(${N(ca, 4)}) ${eq(s1.al)} \\c{a}{\\b{${N(s1.al)}°}}`, 2, { gap: 8 });
          add(`④ \\c{b}{β} = 180° − α − γ ${eq(s1.be)} \\c{b}{\\b{${N(s1.be)}°}}`, 3);
        } else if (kc === 'wsw') {
          add(`① \\c{c}{γ} = 180° − ${N(G.al, 1)}° − ${N(G.be, 1)}° = \\c{c}{\\b{${N(s1.ga, 1)}°}}`, 0, { gap: 8 });
          add(`② \\f{\\c{a}{a}}{sin \\c{a}{α}} = \\f{\\c{c}{c}}{sin \\c{c}{γ}}`, 1, { gap: 4 });
          add(`\\c{a}{a} = \\f{${n(G.c)} · sin ${N(G.al, 1)}°}{sin ${N(s1.ga, 1)}°} ${eq(s1.a, 3)} \\c{a}{\\b{${N(s1.a, 3)} cm}}`, 1, { gap: 8 });
          add(`③ \\c{b}{b} = \\f{${n(G.c)} · sin ${N(G.be, 1)}°}{sin ${N(s1.ga, 1)}°} ${eq(s1.b, 3)} \\c{b}{\\b{${N(s1.b, 3)} cm}}`, 2, { gap: 8 });
          add(`\\c{m}{\\t{${say(L('Probe', 'Check'))}}: 2r = \\f{c}{sin γ} ${eq(G.c / sinD(s1.ga), 3)} ${N(G.c / sinD(s1.ga), 3)} cm}`, 2, { size: ms });
        } else {
          const sg = res.sinG ?? 0;
          add(`① \\f{sin \\c{c}{γ}}{\\c{c}{c}} = \\f{sin \\c{a}{α}}{\\c{a}{a}}`, 0, { gap: 4 });
          add(`sin \\c{c}{γ} = \\f{${n(G.c)} · sin ${N(G.al, 1)}°}{${n(G.a)}} ${eq(sg, 4)} \\b{${N(sg, 4)}}`, 0, { gap: 8 });
          const g1 = res.tris[0]!.ga;
          if (res.tris.length === 2) {
            add(`② \\c{c}{γ_1} = sin^{−1}(${N(sg, 4)}) ${eq(g1)} \\b{${N(g1)}°}`, 1, { gap: 4 });
            add(`\\c{r}{γ_2} = 180° − γ_1 ${eq(180 - g1)} \\b{${N(180 - g1)}°}`, 1, { gap: 8 });
            add(`③ α + γ_2 ${eq(G.al + 180 - g1)} ${N(G.al + 180 - g1)}° < 180° ⇒ \\c{r}{\\b{\\t{${say(L('zwei Dreiecke', 'two triangles'))}}}}`, 2, { gap: 8 });
            const t2 = res.tris[1]!;
            add(`④ \\c{b}{β_1} ${eq(s1.be)} ${N(s1.be)}°,  \\c{b}{β_2} ${eq(t2.be)} ${N(t2.be)}°`, 3, { gap: 8 });
            add(`⑤ \\c{b}{b} = \\f{a · sin β}{sin α}`, 4, { gap: 4 });
            add(`\\c{b}{b_1} ${eq(s1.b)} \\b{${N(s1.b)} cm},  \\c{b}{b_2} ${eq(t2.b)} \\b{${N(t2.b)} cm}`, 4);
          } else if (sg >= 1 - 1e-9) {
            add(`② sin \\c{c}{γ} = 1  ⇒  \\c{c}{γ = 90°} \\c{m}{(\\t{${say(L('genau eine Lösung', 'exactly one solution'))}})}`, 1, { gap: 8 });
            add(`③ \\c{m}{\\t{${say(L('Der Kreis um B berührt den Schenkel nur.', 'The circle about B only touches the arm.'))}}}`, 2, { size: ms, gap: 8 });
            add(`④ \\c{b}{β} = 180° − α − γ ${eq(s1.be)} ${N(s1.be)}°`, 3, { gap: 8 });
            add(`⑤ \\c{b}{b} = \\f{a · sin β}{sin α} ${eq(s1.b)} \\b{${N(s1.b)} cm}`, 4);
          } else {
            add(`② \\c{c}{γ} = sin^{−1}(${N(sg, 4)}) ${eq(g1)} \\b{${N(g1)}°}`, 1, { gap: 8 });
            const why = G.al >= 90 ? L('α ist stumpf: γ₂ = 180° − γ scheidet aus', 'α is obtuse: γ₂ = 180° − γ is impossible') : L(`a ≥ c: α + (180° − γ) ≥ 180°, nur eine Lösung`, 'a ≥ c: α + (180° − γ) ≥ 180°, only one solution');
            add(`③ \\c{m}{\\t{${say(why)}}}`, 2, { size: ms, gap: 8 });
            add(`④ \\c{b}{β} = 180° − α − γ ${eq(s1.be)} ${N(s1.be)}°`, 3, { gap: 8 });
            add(`⑤ \\c{b}{b} = \\f{a · sin β}{sin α} ${eq(s1.b)} \\b{${N(s1.b)} cm}`, 4);
          }
        }
        return formulaCard(R, measure, k, say(L('Lösung Schritt für Schritt', 'Solution step by step')), lawCol(lawFor(kc)), rows);
      };
    }

    /** Anwendungen: Rechnung. */
    function appCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const show = p.show;
        const m = (v: number, d = 1) => `${N(v, d)} ${M}`;
        if (app() === 'tree') {
          const v = survey(p.s, p.p1, p.p2);
          const st = (i: number) => storyK(now, i, 5);
          const rows: Row[] = [
            { src: `① \\c{c}{γ} = 180° − ${p.p1}° − ${p.p2}° = \\c{c}{\\b{${N(v.tau, 0)}°}}`, at: st(3), gap: 8 },
            { src: `② \\f{\\c{b}{|AT|}}{sin \\c{b}{β}} = \\f{\\c{c}{s}}{sin \\c{c}{γ}}`, at: st(4), gap: 4 },
            { src: `\\c{b}{|AT|} = \\f{${m(p.s, 0)} · sin ${p.p2}°}{sin ${N(v.tau, 0)}°} ${show ? `${eq(v.at, 1)} \\c{b}{\\b{${m(v.at)}}}` : '= ?'}`, at: st(4), gap: 8 },
            { src: `③ \\c{a}{|BT|} = \\f{${m(p.s, 0)} · sin ${p.p1}°}{sin ${N(v.tau, 0)}°} ${show ? `${eq(v.bt, 1)} \\c{a}{\\b{${m(v.bt)}}}` : '= ?'}`, at: st(4), gap: 8 },
            { src: `④ \\c{h}{d} = |AT| · sin \\c{a}{α} ${show ? `${eq(v.width, 1)} \\c{h}{\\b{${m(v.width)}}}` : '= ?'}`, at: st(4), gap: 4 },
          ];
          return formulaCard(R, measure, k, say(L('Rechnung mit dem Sinussatz', 'Calculation with the law of sines')), col.r(), rows);
        }
        const c = lakeDistance(p.d2, p.d1, p.w);
        const st = (i: number) => storyK(now, i, 4);
        const rows: Row[] = [
          { src: '\\c{c}{c}² = \\c{a}{a}² + \\c{b}{b}² − 2\\c{a}{a}\\c{b}{b} · cos \\c{c}{γ}', at: st(2), gap: 6, size: fs(14, 13) },
          { src: `\\c{c}{c}² = ${N(p.d2, 0)}² + ${N(p.d1, 0)}² − 2 · ${N(p.d2, 0)} · ${N(p.d1, 0)} · cos ${p.w}°`, at: st(3), gap: 6, size: fs(12.5, 11.5) },
          { src: show ? `\\c{c}{c}² ${eq(c * c, 0)} ${grp(c * c)} \\t{m²}` : '\\c{c}{c}² = ?', at: st(3), gap: 6 },
          { src: show ? `\\c{c}{c} ${eq(c, 1)} \\c{c}{\\b{${m(c)}}}` : '\\c{c}{c} = ?', at: st(3) },
        ];
        return formulaCard(R, measure, k, say(L('Rechnung mit dem Kosinussatz', 'Calculation with the law of cosines')), col.h(), rows);
      };
    }

    /** Anwendungen: Hinweise. */
    function appInfoCard(k: Intro): CardFn {
      return (R, measure) => {
        if (app() === 'tree') {
          return textCard(R, measure, k, say(L('Messen, ohne hinüberzukommen', 'Measuring without crossing')), col.c(), [
            { s: say(L('Am eigenen Ufer misst man eine Standlinie AB und peilt von A und B aus den Baum T an (Theodolit).', 'On your own bank you measure a baseline AB and sight the tree T from A and from B (theodolite).')) },
            { s: say(L('Bekannt sind dann eine Seite und die beiden anliegenden Winkel (WSW) – ein Fall für den Sinussatz.', 'Then one side and the two adjacent angles are known (ASA) – a case for the law of sines.')), color: th().muted },
            { s: say(L('Ziehe den Baum oder den Punkt B.', 'Drag the tree or point B.')), color: th().muted },
          ]);
        }
        return textCard(R, measure, k, say(L('Quer über den See', 'Across the lake')), col.c(), [
          { s: say(L('Mit dem Maßband kommt man nicht über den See. Von C aus lassen sich aber beide Orte anpeilen und die Entfernungen über Land messen.', 'You cannot take a tape measure across the lake. From C, however, both places can be sighted and the distances measured over land.')) },
          { s: say(L('Zwei Seiten und der eingeschlossene Winkel (SWS) – ein Fall für den Kosinussatz.', 'Two sides and the included angle (SAS) – a case for the law of cosines.')), color: th().muted },
          { s: say(L('Ziehe die Orte A und B.', 'Drag the places A and B.')), color: th().muted },
        ]);
      };
    }

    function cardsFor(now: number, k: Intro): CardFn[] {
      const m = mode();
      if (m === 'sin') return p.h ? [sinBarsCard(now, k), proofCard(now, k), areaCard(now, k, null)] : [sinBarsCard(now, k), areaCard(now, k, null)];
      if (m === 'cos') return [cosCard(now, k), balanceCard(now, k), areaCard(now, k, null)];
      if (m === 'solve') {
        const res = solve(kase(), goalGiven());
        const list = res.kind === 'ok' ? res.tris.map((s, i) => ({ a: s.a, b: s.b, ga: s.ga, idx: res.tris.length === 2 ? `_${i + 1}` : '' })) : null;
        return list ? [decideCard(), stepsCard(now, k), areaCard(now, k, list)] : [decideCard(), stepsCard(now, k)];
      }
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
    function updateReadouts(): void {
      for (const key of ['sides', 'angles', 'law']) ctx.readout(key, null);
      const m = mode();
      if (m === 'sin' || m === 'cos') {
        const t = goalTri();
        if (isFlat(t)) {
          ctx.readout('law', say(L('Das Dreieck ist zu flach.', 'The triangle is too flat.')));
          return;
        }
        const s = sides(t);
        const w = angles(t);
        ctx.readout('sides', { html: s.map((x, i) => `${v(KEY[i]!)} ${eq(x)} ${N(x)} cm`).join(', ') });
        ctx.readout('angles', { html: w.map((x, i) => `${v(ANG[i]!)} ${eq(x, 1)} ${N(x, 1)}°`).join(', ') });
        if (m === 'sin') {
          const r2 = 2 * circumradius(t);
          ctx.readout('law', { html: `${frac(v('a'), `sin ${v('α')}`)} = ${frac(v('b'), `sin ${v('β')}`)} = ${frac(v('c'), `sin ${v('γ')}`)} ${eq(r2)} <strong>${N(r2)} cm</strong> = 2${v('r')}` });
        } else {
          const [a, b, c] = s;
          const corr = 2 * a * b * cosD(w[2]);
          ctx.readout('law', { html: `${v('c')}<sup>2</sup> = ${N(a)}<sup>2</sup> + ${N(b)}<sup>2</sup> − 2 · ${N(a)} · ${N(b)} · cos ${N(w[2], 1)}° ≈ ${N(a * a, 1)} + ${N(b * b, 1)} ${corr >= 0 ? '−' : '+'} ${N(Math.abs(corr), 1)} ≈ <strong>${N(c * c, 1)} cm²</strong>` });
        }
        return;
      }
      if (m === 'solve') {
        const kc = kase();
        const G = goalGiven();
        const nm: Record<GKey, string> = { a: 'a', b: 'b', c: 'c', al: 'α', be: 'β', ga: 'γ' };
        ctx.readout('sides', { html: `${say(CASE_NAME[kc])}: ${USES[kc].map((u) => `${v(nm[u])} = ${N(G[u])}${u.length === 2 ? '°' : ' cm'}`).join(', ')}` });
        const res = solve(kc, G);
        if (res.kind === 'none') {
          ctx.readout('law', say(noneText(res.reason)));
          return;
        }
        const two = res.tris.length === 2;
        ctx.readout('angles', { html: res.tris.map((s, i) => `${two ? `(${i + 1}) ` : ''}${v('α')} ${eq(s.al)} ${N(s.al)}°, ${v('β')} ${eq(s.be)} ${N(s.be)}°, ${v('γ')} ${eq(s.ga)} ${N(s.ga)}°`).join(' · ') });
        ctx.readout('law', { html: res.tris.map((s, i) => `${two ? `(${i + 1}) ` : ''}${v('a')} ${eq(s.a)} ${N(s.a)} cm, ${v('b')} ${eq(s.b)} ${N(s.b)} cm, ${v('c')} ${eq(s.c)} ${N(s.c)} cm`).join(' · ') });
        return;
      }
      if (app() === 'tree') {
        const sv = survey(p.s, p.p1, p.p2);
        ctx.readout('sides', { html: `${v('s')} = ${N(p.s, 0)} m, ${v('α')} = ${p.p1}°, ${v('β')} = ${p.p2}°` });
        ctx.readout('angles', { html: `${v('γ')} = 180° − ${p.p1}° − ${p.p2}° = ${N(sv.tau, 0)}°` });
        ctx.readout('law', { html: `|AT| = ${frac(`${v('s')} · sin ${v('β')}`, `sin ${v('γ')}`)} ${eq(sv.at, 1)} <strong>${N(sv.at, 1)} m</strong> · |BT| ${eq(sv.bt, 1)} <strong>${N(sv.bt, 1)} m</strong> · ${v('d')} ${eq(sv.width, 1)} ${N(sv.width, 1)} m` });
        return;
      }
      const c = lakeDistance(p.d2, p.d1, p.w);
      ctx.readout('sides', { html: `${v('a')} = ${N(p.d2, 0)} m, ${v('b')} = ${N(p.d1, 0)} m, ${v('γ')} = ${p.w}°` });
      ctx.readout('law', { html: `${v('c')} = √(${v('a')}<sup>2</sup> + ${v('b')}<sup>2</sup> − 2${v('a')}${v('b')} · cos ${v('γ')}) ${eq(c, 1)} <strong>${N(c, 1)} m</strong>` });
    }

    /* ---------- Rendern ---------- */
    function drawScene(s: Scene, now: number, k: Intro, alpha: number): void {
      if (s === 'sin') drawSin(now, k, alpha);
      else if (s === 'cos') drawCos(now, k, alpha);
      else if (s === 'solve') drawSolve(now, k, alpha);
      else if (s === 'tree') drawTree(now, k, alpha);
      else drawLake(now, k, alpha);
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
      if (proof && now - proof.t0 > PROOF_END) proof = null;
      if (sweep && now - sweep.t0 > SWEEP_END) {
        sweep = null;
        retargetViews(now, false);
      }
      if (steps && now - steps.t0 > STEPS_END) steps = null;
      if (story && now - story.t0 > STORY_END) story = null;
      if (proof || sweep || steps || story || intro !== null) anim = true;
      // Wasser bewegt sich leicht
      if (scene() === 'tree' || scene() === 'lake') anim = anim || !reduced();
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
      const glide = source === 'replace' || glideNext;
      glideNext = false;
      const targets: [Chan, number][] = [
        [TV[0]!, p.ax],
        [TV[1]!, p.ay],
        [TV[2]!, p.bx],
        [TV[3]!, p.by],
        [TV[4]!, p.cx],
        [TV[5]!, p.cy],
        [GV.a, p.a],
        [GV.b, p.b],
        [GV.c, p.c],
        [GV.al, p.al],
        [GV.be, p.be],
        [GV.ga, p.ga],
        [S, p.s],
        [P1, p.p1],
        [P2, p.p2],
        [D1, p.d1],
        [D2, p.d2],
        [WL, p.w],
      ];
      targets.forEach(([c, val], i) => {
        if (instant) c.jump(val);
        else if (dragging()) c.follow(val, 0.05);
        else if (glide) {
          if (c.goal !== val) c.glide(val, 850, (i % 6) * 30, now);
        } else if (Math.abs(c.goal - val) > 1e-12) c.follow(val, 0.16);
      });
      const flags: [Chan, number, number][] = [
        [WH, p.h ? 1 : 0, 500],
        [WK, p.k ? 1 : 0, 500],
        [WSHOW, p.show ? 1 : 0, 400],
      ];
      for (const [c, val, dur] of flags) {
        if (instant) c.jump(val);
        else if (c.goal !== val) c.glide(val, dur, 0, now);
      }
    }

    function cancelStories(): void {
      proof = null;
      sweep = null;
      steps = null;
      story = null;
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): HitId | null {
      if (ctx.locked) return null;
      let best: HitId | null = null;
      let bd = Infinity;
      for (const h of hits) {
        if (h.w && h.h) {
          if (Math.abs(px - h.x) <= h.w / 2 && Math.abs(py - h.y) <= h.h / 2) return h.id;
          continue;
        }
        const d = Math.hypot(px - h.x, py - h.y);
        if (d < h.r && d < bd) {
          bd = d;
          best = h.id;
        }
      }
      return best;
    }
    const isTap = (id: HitId) => id.startsWith('case-');

    const round1 = (x: number) => Math.round(x * 10) / 10;
    function dragTo(id: HitId, px: number, py: number): void {
      lastDrag = performance.now();
      if (id === 'A' || id === 'B' || id === 'C') {
        const wpt = toWorld(viewOf(scene()), px, py);
        const x = clamp(round1(wpt[0]), 0, W);
        const y = clamp(round1(wpt[1]), 0, H);
        if (id === 'A') ctx.set({ ax: x, ay: y });
        else if (id === 'B') ctx.set({ bx: x, by: y });
        else ctx.set({ cx: x, cy: y });
      } else if (id === 'T') {
        const wpt = toWorld(viewOf('tree'), px, py);
        const y = Math.max(wpt[1], 5);
        const al = clamp(Math.round(Math.atan2(y, wpt[0]) / DEG), 20, 85);
        const be = clamp(Math.round(Math.atan2(y, p.s - wpt[0]) / DEG), 20, 85);
        ctx.set({ p1: al, p2: be });
      } else if (id === 'S') {
        const wpt = toWorld(viewOf('tree'), px, py);
        ctx.set({ s: clamp(Math.round(wpt[0] / 10) * 10, 50, 400) });
      } else if (id === 'LA' || id === 'LB') {
        const wpt = toWorld(viewOf('lake'), px, py);
        const d = clamp(Math.round(Math.hypot(wpt[0], wpt[1]) / 10) * 10, 100, 1500);
        const ang = Math.atan2(Math.max(wpt[1], 1), wpt[0]) / DEG;
        const w = clamp(Math.round(id === 'LA' ? 2 * (ang - 90) : 2 * (90 - ang)), 20, 160);
        if (id === 'LA') ctx.set({ d1: d, w });
        else ctx.set({ d2: d, w });
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const id = hitAt(pt.px, pt.py);
        if (!id) return false;
        if (isTap(id)) {
          const c = id.slice(5) as Case;
          if (c !== kase()) {
            ctx.set({ g: c, ...EXAMPLE[c] });
            glideNext = true;
          }
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
        surface.setCursor(hover ? (isTap(hover) ? 'pointer' : 'grab') : '');
        setTimeout(() => {
          retargetViews(performance.now(), false);
          ctx.requestRender();
        }, 260);
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const id = pt ? hitAt(pt.px, pt.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? (isTap(id) ? 'pointer' : drag ? 'grabbing' : 'grab') : '');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'input' && changed.has('g')) {
          ctx.set({ ...EXAMPLE[kase()] });
          glideNext = true;
        }
        if (source === 'input' || source === 'replace') {
          if ([...changed].some((key) => key !== 'show' && key !== 'h' && key !== 'k')) cancelStories();
        }
        retarget(now, source);
        const sc = scene();
        if (source !== 'init' && sc !== prevScene) {
          if (!reduced()) {
            sceneFade = { from: prevScene, t0: now };
            cardFade = now;
            if (sc === 'tree' || sc === 'lake') story = { t0: now };
          }
        } else if (source !== 'init' && changed.has('g') && !reduced()) cardFade = now;
        if (source === 'replace' && (sc === 'tree' || sc === 'lake') && !reduced()) story = { t0: now };
        if (!dragging()) retargetViews(now, source === 'init');
        if (source === 'init') {
          if (!reduced()) intro = now;
          lastSize = { w: surface.width, h: surface.height };
        }
        prevScene = sc;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'rand') {
          cancelStories();
          const t = randomTriangle(Math.random);
          glideNext = true;
          ctx.set({ ax: t[0][0], ay: t[0][1], bx: t[1][0], by: t[1][1], cx: t[2][0], cy: t[2][1] });
        } else if (id === 'proof') {
          cancelStories();
          if (!p.h) ctx.set({ h: true });
          if (!reduced()) proof = { t0: now };
        } else if (id === 'sweep') {
          cancelStories();
          if (!p.h) ctx.set({ h: true });
          if (!reduced()) {
            startSweep(now);
            retargetViews(now, false);
          }
        } else if (id === 'solve') {
          cancelStories();
          if (!p.show) ctx.set({ show: true });
          if (!reduced()) steps = { t0: now };
        } else if (id === 'measure') {
          cancelStories();
          if (!p.show) ctx.set({ show: true });
          if (!reduced()) story = { t0: now };
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
