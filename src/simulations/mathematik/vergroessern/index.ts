import { defineSimulation, ease, mesh3d, mixColor, offscreenCanvas, prefersReducedMotion, roundRect, scaledSprite, seededRandom, Surface, vec3, View3D, withAlpha, type Rect, type Vec3 } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  BODIES,
  boxSurface,
  boxVolume,
  cubeOV,
  exactRoot,
  FIGS,
  kFromFactor,
  modelFactors,
  pizzaArea,
  pizzaFactor,
  reciprocalInt,
  scaleDims,
  splitCube,
  splitEdge,
  tiling2D,
  tiling3D,
  unitCuts,
  type Block,
  type Dims,
  type FigId,
  type ObjId,
  type Piece,
  type Pt,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Mode = 'grow' | 'back' | 'pizza' | 'modell' | 'ov';
type Vals = Record<string, unknown>;
const isMode =
  (...m: Mode[]) =>
  (v: Vals) =>
    m.includes(v.mode as Mode);

/** Ziehbare Elemente auf der Zeichenfläche (3D-Griffe laufen über View3D). */
type DragId = 'band' | 'area' | 'fline' | 'd1' | 'd2' | 'car' | 'ov';

/** Länge des Autos im Modus „Modell“ (Beispielwert). */
const CAR_LEN = 4.5;

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
    if (Math.abs(this.goal - this.v) <= 1e-4 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Zeitplan der Hauptanimation „Kopien auslegen“ (ms ab Start). */
interface FillPlan {
  line: { start: number; dur: number }[];
  area: { start: number; dur: number }[];
  body: { start: number; dur: number }[];
  end: number;
}

/**
 * Ähnliche Figuren: Wie wachsen Länge, Fläche und Volumen beim Vergrößern
 * mit dem Streckfaktor k? Hauptansicht mit drei Ebenen in drei Farben –
 * Strecke (blau), Fläche (grün: Quadrat, Rechteck, Dreieck oder Kreis) und
 * Körper (lila, echte 3D-Ansicht, drehbar). Hauptanimation „Kopien auslegen“:
 * Das Bild wird Kopie für Kopie mit dem Original ausgelegt (Bruchstücke am
 * Rand bei nicht ganzzahligem k, beim Verkleinern umgekehrt), Zähler zählen
 * mit. Rechts Karten mit den Faktoren k, k², k³ (eingesetzte Zahlen), ein
 * Wachstumsdiagramm und Merksätze. Dazu der Rückwärts-Schluss (Faktor → k)
 * und drei gezeichnete Anwendungen: Pizza, Modellauto, Oberfläche zu Volumen.
 */
export default defineSimulation({
  id: 'vergroessern',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.38 },
  images: { car: 'auto.webp', bucket: 'farbeimer.webp' },
  groups: [
    { id: 'fig', label: L('Figur und Körper', 'Figure and solid') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'grow', label: L('Vergrößern: Länge, Fläche, Volumen', 'Scaling: length, area, volume') },
        { value: 'back', label: L('Rückwärts: Faktor gegeben, k gesucht', 'Backwards: factor given, find k') },
        { value: 'pizza', label: L('Anwendung: Pizza', 'Application: pizza') },
        { value: 'modell', label: L('Anwendung: Modellauto', 'Application: model car') },
        { value: 'ov', label: L('Anwendung: Oberfläche und Volumen', 'Application: surface and volume') },
      ],
      default: 'grow',
    },
    {
      key: 'k',
      type: 'number',
      label: L('Streckfaktor k', 'Scale factor k'),
      help: L('Auch die Griffe am Bild ziehen. k < 1 verkleinert.', 'You can also drag the handles on the image. k < 1 reduces.'),
      min: 0.2,
      max: 4,
      step: 0.1,
      default: 2,
      visibleIf: isMode('grow'),
    },
    {
      key: 'fig',
      type: 'choice',
      group: 'fig',
      label: L('Fläche', 'Plane figure'),
      options: [
        { value: 'q', label: L('Quadrat 1 cm', 'Square 1 cm') },
        { value: 'r', label: L('Rechteck 2 cm × 1 cm', 'Rectangle 2 cm × 1 cm') },
        { value: 'd', label: L('Dreieck (gleichseitig, 2 cm)', 'Triangle (equilateral, 2 cm)') },
        { value: 'k', label: L('Kreis r = 1 cm', 'Circle r = 1 cm') },
      ],
      default: 'q',
      visibleIf: isMode('grow'),
    },
    {
      key: 'obj',
      type: 'choice',
      group: 'fig',
      label: L('Körper', 'Solid'),
      options: [
        { value: 'w', label: L('Würfel 1 cm × 1 cm × 1 cm', 'Cube 1 cm × 1 cm × 1 cm') },
        { value: 'q', label: L('Quader 1 cm × 2 cm × 1 cm', 'Cuboid 1 cm × 2 cm × 1 cm') },
      ],
      default: 'w',
      visibleIf: isMode('grow'),
    },
    {
      key: 'dim',
      type: 'choice',
      label: L('Gegeben ist', 'Given'),
      options: [
        { value: 'v', label: L('der Volumenfaktor', 'the volume factor') },
        { value: 'a', label: L('der Flächenfaktor', 'the area factor') },
      ],
      default: 'v',
      visibleIf: isMode('back'),
    },
    {
      key: 'f',
      type: 'number',
      label: L('Faktor', 'Factor'),
      help: L('Um diesen Faktor ist die Fläche bzw. das Volumen gewachsen. Auch die waagrechte Linie im Diagramm ziehen.', 'The area or volume grew by this factor. You can also drag the horizontal line in the chart.'),
      min: 0.1,
      max: 64,
      step: 0.1,
      default: 8,
      visibleIf: isMode('back'),
    },
    { key: 'd1', type: 'number', label: L('Kleine Pizza: Durchmesser', 'Small pizza: diameter'), min: 10, max: 40, step: 1, default: 20, unit: 'cm', visibleIf: isMode('pizza') },
    { key: 'd2', type: 'number', label: L('Große Pizza: Durchmesser', 'Large pizza: diameter'), help: L('Auch am Rand der Pizzen ziehen.', 'You can also drag the edge of the pizzas.'), min: 10, max: 40, step: 1, default: 30, unit: 'cm', visibleIf: isMode('pizza') },
    { key: 'm', type: 'number', label: L('Maßstab 1 : m', 'Scale 1 : m'), min: 2, max: 20, step: 1, default: 10, visibleIf: isMode('modell') },
    {
      key: 'a',
      type: 'number',
      label: L('Kantenlänge a', 'Edge length a'),
      help: L('Auch den Punkt im Diagramm oder den Griff am Würfel ziehen.', 'You can also drag the point in the chart or the handle on the cube.'),
      min: 0.5,
      max: 5,
      step: 0.5,
      default: 2,
      unit: 'cm',
      visibleIf: isMode('ov'),
    },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Ergebnisse zeigen', 'Show the results'),
      help: L('Für Aufgaben ausschalten: Gesuchte Werte erscheinen als „?“, bis die Animation gelaufen ist.', 'Switch off for tasks: unknown values appear as “?” until the animation has run.'),
      default: true,
    },
  ],
  actions: [
    { id: 'fill', label: L('Kopien auslegen', 'Lay out copies'), primary: true, visibleIf: isMode('grow') },
    { id: 'solve', label: L('k suchen', 'Find k'), primary: true, visibleIf: isMode('back') },
    { id: 'cut', label: L('Große Pizza aufteilen', 'Divide the large pizza'), primary: true, visibleIf: isMode('pizza') },
    { id: 'paint', label: L('Lack verteilen', 'Share out the paint'), primary: true, visibleIf: isMode('modell') },
    { id: 'split', label: L('Würfel zerteilen', 'Cut up the cube'), primary: true, visibleIf: isMode('ov') },
  ],
  readouts: [
    { key: 'len', label: L('Länge', 'Length'), spoiler: true },
    { key: 'area', label: L('Flächeninhalt', 'Area'), spoiler: true },
    { key: 'surf', label: L('Oberfläche des Körpers', 'Surface area of the solid'), spoiler: true },
    { key: 'vol', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'giv', label: L('Gegeben', 'Given') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'two', label: L('k = 2: 4-fache Fläche, 8-faches Volumen', 'k = 2: 4 times the area, 8 times the volume'), values: {} },
    { id: 'tri', label: L('k = 3 mit Dreieck: 9 und 27 Kopien', 'k = 3 with a triangle: 9 and 27 copies'), values: { k: 3, fig: 'd' } },
    { id: 'half', label: L('k = 0,5: Verkleinern', 'k = 0.5: reducing'), values: { k: 0.5 } },
    { id: 'frac', label: L('Quader, k = 1,5: Bruchstücke', 'Cuboid, k = 1.5: fractional pieces'), values: { k: 1.5, fig: 'r', obj: 'q' } },
    { id: 'back', label: L('Rückwärts: Volumen · 8 – wie groß ist k?', 'Backwards: volume × 8 – what is k?'), values: { mode: 'back', dim: 'v', f: 8 } },
    { id: 'pizza', label: L('Pizza: 30 cm statt 20 cm', 'Pizza: 30 cm instead of 20 cm'), values: { mode: 'pizza', d1: 20, d2: 30 } },
  ],
  strings: {
    de: {
      canvas:
        'Ähnliche Figuren beim Streckfaktor k in drei Ebenen: eine Strecke (blau), eine Fläche (grün) und ein drehbarer Körper (lila). Das Bild wird Kopie für Kopie mit dem Original (orange) ausgelegt; Zähler zeigen k, k² und k³. Rechts Karten mit den eingesetzten Zahlen und ein Diagramm der Faktoren. Weitere Themen: k aus einem Flächen- oder Volumenfaktor bestimmen, Pizzagrößen vergleichen, ein Modellauto im Maßstab 1 : m und das Verhältnis von Oberfläche zu Volumen beim Würfel.',
    },
    en: {
      canvas:
        'Similar figures with scale factor k on three levels: a segment (blue), a plane figure (green) and a rotatable solid (purple). The image is laid out copy by copy with the original (orange); counters show k, k² and k³. On the right, cards with the numbers and a chart of the factors. Further topics: finding k from an area or volume factor, comparing pizza sizes, a model car at scale 1 : m and the ratio of surface area to volume of a cube.',
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
    const fig = () => p.fig as FigId;
    const obj = () => p.obj as ObjId;
    const dimB = (): 2 | 3 => (p.dim === 'a' ? 2 : 3);

    /* ---------- Farben ---------- */
    const col = {
      len: () => th().series[0]!,
      area: () => th().series[2]!,
      vol: () => th().series[4]!,
      orig: () => th().series[3]!,
      k: () => th().series[5]!,
      bad: () => th().series[1]!,
    };
    const light = (c: string, s = 0.5) => mixColor(c, th().bg, th().dark ? s * 0.8 : s);

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => fmt.num(clean(v, d), d);
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eq = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    /** Faktor als Formel: ganze Zahl, Dezimalzahl oder Stammbruch (1/8). */
    const facF = (v: number, d = 3) => {
      const n = reciprocalInt(v);
      return n ? `\\f{1}{${n}}` : N(v, d);
    };
    const facH = (v: number, d = 3) => {
      const n = reciprocalInt(v);
      return n ? `<span class="frac"><span>1</span><span>${n}</span></span>` : N(v, d);
    };
    /** Größere Zahlen mit schmalem Leerzeichen gruppieren (1 000). */
    const big = (v: number, d = 2) => {
      const s = N(v, d);
      return Math.abs(v) >= 1000 ? s.replace(/^(\d+)/, (w) => w.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')) : s;
    };
    const M = '\\t{m}';

    /* ---------- angezeigter Zustand ---------- */
    /** Gezeichnete Spannweite in Vielfachen des Originals (stetig in k, beim Verkleinern füllt das Original den Platz). */
    const spanOf = (k: number) => (k >= 1 ? Math.max(k, 2) : Math.max(1.15, 2 - 1.7 * (1 - k)));
    const K = new Chan(p.k);
    const KB = new Chan(kFromFactor(p.f, dimB()));
    const D1 = new Chan(p.d1);
    const D2 = new Chan(p.d2);
    const MM = new Chan(p.m);
    const A = new Chan(p.a);
    const YMAX = new Chan(growYMax(p.k));
    const BX = new Chan(1);
    const BY = new Chan(1);
    const SPLIT = new Chan(0);
    /** Maßstab von Strecke und Fläche (Spannweite in Einheiten); bleibt beim Ziehen fest, damit der Griff unter dem Zeiger bleibt. */
    const SPAN = new Chan(spanOf(p.k));
    /** Größerer Pizzadurchmesser für den Maßstab (beim Ziehen fest). */
    const pdmOf = () => Math.max(p.d1, p.d2, 16);
    const PDM = new Chan(pdmOf());
    const allChans = (): Chan[] => [K, KB, D1, D2, MM, A, YMAX, BX, BY, SPLIT, SPAN, PDM];

    let intro: number | null = null;
    let fill: { t0: number; plan: FillPlan } | null = null;
    let solve: { t0: number } | null = null;
    let cut: { t0: number } | null = null;
    let paint: { t0: number } | null = null;
    let splitAnim: { t0: number; to: number } | null = null;
    /** Lösung im Bild sichtbar, weil die Animation gelaufen ist (auch bei show = 0) */
    let revealed = false;
    let sceneFade: { from: Mode; t0: number } | null = null;
    let cardFade: number | null = null;
    let prevMode: Mode = mode();
    let drag: DragId | null = null;
    let hover: DragId | null = null;
    let hits: { id: DragId; x: number; y: number; r: number }[] = [];
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    /** Letztes Ziehen an einem 3D-Griff (Bildausschnitt bleibt dann fest). */
    let lastDrag3d = -Infinity;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;
    const shown = () => p.show || revealed;

    /** Geometrie der letzten Zeichnung für das Ziehen */
    const geo = {
      band: { x0: 0, s: 1, L0: 1, xMax: 1 },
      area: { ax: 0, ay: 0, ux: 1, uy: 0, len1: 1, box: { x: 0, y: 0, w: 1, h: 1 } as Rect },
      fline: { y0: 0, yScale: 1, fMax: 64 },
      pizza: { c1: [0, 0] as Px, c2: [0, 0] as Px, s: 1, d1Max: 40, d2Max: 40 },
      car: { a: 0, lenPx: 1 },
      ov: { x0: 0, y0: 0, sx: 1, sy: 1 },
    };

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (bigSize: number, small: number) => (sm() ? small : bigSize);
    function regions(): { main: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.34, 236, 340));
        return { main: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const mh = Math.round(narrowMain > 0 ? narrowMain : h * 0.45);
      return { main: { x: 0, y: 0, w, h: mh }, col: { x: 0, y: mh + 10, w, h: h - mh - 10 }, wide: false };
    }
    /** Höhe der Hauptansicht im schmalen Layout: Rest nach den Karten (in render() bestimmt). */
    let narrowMain = 0;
    function computeNarrowMain(now: number): void {
      if (isWide()) return;
      const w = surface.width;
      const h = surface.height;
      const gap = fs(10, 8);
      const hs = cardsFor(now, { panel: 1, cards: 1, stagger: 1 }).map((fn) => fn({ x: 0, y: 0, w, h: 10000 }, true));
      const need = hs.reduce((a, b) => a + b + gap, 0);
      const m = mode();
      const min = w * (m === 'grow' ? 0.92 : m === 'back' || m === 'ov' ? 1.1 : m === 'pizza' ? 0.75 : 0.95);
      narrowMain = Math.round(clamp(h - need - 10, min, h * 0.75));
    }
    /** Teilbereiche der Hauptansicht je Thema. */
    function panels(m: Mode): { band?: Rect; p1: Rect; p2: Rect } {
      const R = regions().main;
      const gap = fs(10, 8);
      if (m === 'grow') {
        const bh = Math.round(clamp(R.h * 0.15, 60, 82));
        const y = R.y + bh + gap;
        const hh = R.h - bh - gap;
        const w1 = Math.round((R.w - gap) / 2);
        return { band: { x: R.x, y: R.y, w: R.w, h: bh }, p1: { x: R.x, y, w: w1, h: hh }, p2: { x: R.x + w1 + gap, y, w: R.w - w1 - gap, h: hh } };
      }
      if (m === 'back' || m === 'ov') {
        if (R.w >= R.h * 0.95) {
          const w1 = Math.round((R.w - gap) * 0.5);
          return { p1: { x: R.x, y: R.y, w: w1, h: R.h }, p2: { x: R.x + w1 + gap, y: R.y, w: R.w - w1 - gap, h: R.h } };
        }
        const h1 = Math.round((R.h - gap) * (m === 'ov' ? 0.52 : 0.47));
        return { p1: { x: R.x, y: R.y, w: R.w, h: h1 }, p2: { x: R.x, y: R.y + h1 + gap, w: R.w, h: R.h - h1 - gap } };
      }
      if (m === 'modell') {
        const h1 = Math.round((R.h - gap) * 0.52);
        return { p1: { x: R.x, y: R.y, w: R.w, h: h1 }, p2: { x: R.x, y: R.y + h1 + gap, w: R.w, h: R.h - h1 - gap } };
      }
      return { p1: R, p2: { x: R.x, y: R.y, w: 0, h: 0 } };
    }
    /** Bereich der 3D-Ansicht (leer, wenn das Thema keine braucht). */
    function view3dRect(): Rect {
      const m = mode();
      if (m === 'grow' || m === 'ov' || (m === 'back' && dimB() === 3)) {
        const r = panels(m).p2;
        return { x: r.x + 2, y: r.y + 2, w: r.w - 4, h: r.h - 4 };
      }
      return { x: -10, y: -10, w: 0, h: 0 };
    }

    const view = new View3D(surface, { region: () => view3dRect(), azimuth: 32, elevation: 24, elevationLimits: [-5, 80], controls: false, zoom: false, background: false, hint: false });

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({
      L: col.len(),
      A: col.area(),
      V: col.vol(),
      o: col.orig(),
      k: col.k(),
      bad: col.bad(),
      m: th().muted,
      ok: col.area(),
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

    function line(p0: Px, p1: Px, color: string, width: number, opts: { dash?: number[]; alpha?: number; cap?: CanvasLineCap } = {}): void {
      const g = surface.g;
      if ((opts.alpha ?? 1) <= 0.01) return;
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = opts.cap ?? 'round';
      if (opts.dash) g.setLineDash(opts.dash);
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
    /** Maßlinie mit Pfeilspitzen und Beschriftung. */
    function dimLine(a: Px, b: Px, color: string, label: string, opts: { alpha?: number; bounds?: Rect; side?: number } = {}): void {
      const alpha = opts.alpha ?? 1;
      if (alpha <= 0.01) return;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 4) return;
      const g = surface.g;
      const ux = (b[0] - a[0]) / len;
      const uy = (b[1] - a[1]) / len;
      const hd = Math.min(6, len * 0.3);
      g.save();
      g.globalAlpha *= alpha;
      line([a[0] + ux * hd * 0.6, a[1] + uy * hd * 0.6], [b[0] - ux * hd * 0.6, b[1] - uy * hd * 0.6], color, 1.5);
      arrowHead(a, [-ux, -uy], color, hd);
      arrowHead(b, [ux, uy], color, hd);
      g.restore();
      const sz = fs(12, 11);
      const ps = pillSize(label, sz);
      const side = opts.side ?? 0;
      const off = side === 0 ? 0 : side * (Math.abs(uy) * ps.w * 0.5 + Math.abs(ux) * ps.h * 0.5 + 3);
      fpill((a[0] + b[0]) / 2 + -uy * off, (a[1] + b[1]) / 2 + ux * off, label, { size: sz, color, alpha, bounds: opts.bounds });
    }
    function handleDot(q: Px, color: string, id: DragId, alpha = 1): void {
      if (!editable() || alpha <= 0.05) return;
      const g = surface.g;
      const on = hover === id || drag === id;
      const r = fs(7, 6.5);
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(color, on ? 0.28 : 0.14);
      g.beginPath();
      g.arc(q[0], q[1], on ? r + 9 : r + 6, 0, TAU);
      g.fill();
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const grad = g.createRadialGradient(q[0] - r * 0.35, q[1] - r * 0.4, 0.5, q[0], q[1], r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.45));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(q[0], q[1], r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(q[0], q[1], r, 0, TAU);
      g.stroke();
      g.restore();
      hits.push({ id, x: q[0], y: q[1], r: fs(18, 22) });
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
    /** Fläche für Zeichnungen (Papier). */
    function paper(R: Rect, accent?: string): void {
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
      if (accent) {
        const grad = g.createLinearGradient(R.x, R.y, R.x, R.y + R.h);
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.07 : 0.045));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 14);
        g.fill();
      }
      g.strokeStyle = theme.grid;
      g.lineWidth = 1.2;
      roundRect(g, R.x + 1.5, R.y + 1.5, R.w - 3, R.h - 3, 14);
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
      let txt = title;
      while (g.measureText(txt).width > room0 && txt.length > 4) txt = `${txt.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(txt, R.x + pad + 15, ty);
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
    /** Titel-Chip oben links in einer Zeichenfläche. */
    function panelTitle(R: Rect, src: string, color: string, alpha = 1): Rect {
      return fpill(R.x + 12, R.y + 21, src, { align: 'left', size: fs(13, 12), alpha, border: withAlpha(color, 0.55), maxW: R.w - 40 });
    }
    /** Hinweis „zum Drehen ziehen“ unter dem Titel, bis die Ansicht gedreht wurde. */
    function rotateHint(R: Rect, alpha: number): void {
      if (view.isViewChanged || alpha <= 0.01) return;
      const g = surface.g;
      const theme = th();
      const x = R.x + 16;
      const y = R.y + 50;
      g.save();
      g.globalAlpha *= alpha * 0.9;
      g.strokeStyle = theme.muted;
      g.lineWidth = 1.5;
      g.lineCap = 'round';
      g.beginPath();
      g.ellipse(x + 7, y, 7, 3.5, 0, Math.PI * 0.15, Math.PI * 1.85);
      g.stroke();
      g.beginPath();
      g.moveTo(x + 13.5, y - 4);
      g.lineTo(x + 13.8, y + 0.5);
      g.lineTo(x + 10, y - 1);
      g.stroke();
      g.font = `500 ${fs(11.5, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(say(L('zum Drehen ziehen', 'drag to rotate')), x + 20, y + 0.5);
      g.restore();
    }
    function polyPath(pts: readonly Px[]): void {
      const g = surface.g;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
    }
    const centroid = (pts: readonly (readonly [number, number])[]): Px => {
      let x = 0;
      let y = 0;
      for (const q of pts) {
        x += q[0];
        y += q[1];
      }
      return [x / pts.length, y / pts.length];
    };

    /* =====================================================================
     * Einstieg
     * ===================================================================== */
    interface Intro {
      panel: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 2400) {
        intro = null;
        return DONE;
      }
      return { panel: ease.outCubic(clamp01(t / 500)), cards: clamp01((t - 200) / 900), stagger: clamp01((t - 500) / 1400) };
    }

    /* =====================================================================
     * Hauptanimation „Kopien auslegen“
     * ===================================================================== */
    const mOf = (k: number) => Math.max(k, 1 / k);
    const cache2 = new Map<string, Piece[]>();
    const cache3 = new Map<string, Block[]>();
    function pieces2(f: FigId, k: number): Piece[] {
      const key = `${f}|${k.toFixed(4)}`;
      let v = cache2.get(key);
      if (!v) {
        v = tiling2D(f, mOf(k), k >= 1 ? 1 : k);
        if (cache2.size > 60) cache2.clear();
        cache2.set(key, v);
      }
      return v;
    }
    function blocks3(base: Dims, k: number): Block[] {
      const key = `${base.join(',')}|${k.toFixed(4)}`;
      let v = cache3.get(key);
      if (!v) {
        v = tiling3D(k >= 1 ? base : scaleDims(base, k), mOf(k));
        if (cache3.size > 60) cache3.clear();
        cache3.set(key, v);
      }
      return v;
    }
    function makePlan(k: number): FillPlan {
      const n1 = unitCuts(mOf(k)).length;
      const line = Array.from({ length: n1 }, (_, i) => ({ start: i === 0 ? -1 : 200 + (i - 1) * 300, dur: 450 }));
      const a0 = 200 + Math.max(0, n1 - 1) * 300 + 450;
      const n2 = pieces2(fig(), k).length;
      const sA = clamp(1900 / Math.max(1, n2 - 1), 90, 420);
      const area = Array.from({ length: n2 }, (_, i) => ({ start: i === 0 ? -1 : a0 + (i - 1) * sA, dur: 520 }));
      const b0 = a0 + Math.max(0, n2 - 1) * sA + 500;
      const bl = blocks3(BODIES[obj()], k);
      const per = Math.max(1, Math.round(bl.length / Math.max(1, unitCuts(mOf(k)).length)));
      const sB = clamp(1300 / per, 35, 240);
      const layerGap = (per - 1) * sB + 420;
      const body = bl.map((b, i) => ({ start: i === 0 ? -1 : b0 + b.layer * layerGap + (i - b.layer * per) * sB, dur: 560 }));
      const end = Math.max(...body.map((s) => s.start + s.dur), b0) + 200;
      return { line, area, body, end };
    }
    /** Fortschritt eines Stücks (0 … 1); ohne Animation: alles liegt. */
    function prog(list: 'line' | 'area' | 'body', i: number, now: number): number {
      if (!fill) return 1;
      const s = fill.plan[list][i];
      if (!s || s.start < 0) return 1;
      return clamp01((now - fill.t0 - s.start) / s.dur);
    }
    function startFill(now: number, delay = 0): void {
      if (reduced()) {
        fill = null;
        revealed = true;
        return;
      }
      fill = { t0: now + delay, plan: makePlan(p.k) };
    }

    /* =====================================================================
     * Ebene 1: Strecke
     * ===================================================================== */
    function drawBand(R: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const Kv = K.v;
      const big = Kv >= 1;
      const L0 = FIGS[fig()].len;
      paper(R, col.len());
      const tsrc = `\\c{L}{${say(L('Länge', 'Length'))} · k}`;
      const tr = fpill(R.x + 12, R.y + R.h / 2, tsrc, { align: 'left', size: fs(13, 12), border: withAlpha(col.len(), 0.55), alpha: k.panel });
      const x0 = tr.x + tr.w + fs(18, 12);
      const valW = fs(78, 62);
      const x1 = R.x + R.w - valW;
      const s = (x1 - x0) / (L0 * SPAN.v);
      geo.band = { x0, s, L0, xMax: R.x + R.w - 10 };
      const yc = R.y + R.h * 0.42;
      const bh = fs(14, 12);
      const unit = big ? L0 : L0 * Kv;
      const cont = big ? L0 * Kv : L0;
      const contCol = big ? col.len() : col.orig();
      // Spur (Ziel)
      g.save();
      g.globalAlpha *= k.panel;
      g.strokeStyle = withAlpha(contCol, 0.7);
      g.lineWidth = 1.4;
      g.setLineDash([4, 3]);
      roundRect(g, x0, yc - bh / 2, Math.max(3, cont * s), bh, 4);
      g.stroke();
      g.setLineDash([]);
      // Stücke
      const cuts = unitCuts(mOf(Kv));
      let pos = 0;
      cuts.forEach((c, i) => {
        const q = prog('line', i, now);
        const e = ease.outCubic(q);
        if (q <= 0) {
          pos += c;
          return;
        }
        const xx = lerp(x0, x0 + pos * unit * s, e);
        const w = c * unit * s;
        const first = i === 0;
        const base = first ? (big ? col.orig() : col.len()) : big ? col.len() : light(col.len(), 0.35);
        const cc = !first && i % 2 === 0 ? mixColor(base, '#ffffff', theme.dark ? 0.1 : 0.22) : base;
        const gr = g.createLinearGradient(0, yc - bh / 2, 0, yc + bh / 2);
        gr.addColorStop(0, mixColor(cc, '#ffffff', 0.25));
        gr.addColorStop(1, cc);
        g.save();
        g.globalAlpha *= Math.min(1, q * 3);
        g.fillStyle = gr;
        roundRect(g, xx + 0.75, yc - bh / 2, Math.max(1.5, w - 1.5), bh, 3.5);
        g.fill();
        g.restore();
        pos += c;
      });
      // Teilstriche und Maße
      const tick = (x: number, lab: string, c: string) => {
        line([x, yc + bh / 2 + 2], [x, yc + bh / 2 + 7], withAlpha(c, 0.8), 1.3);
        if (lab) {
          g.font = `600 ${fs(11.5, 11)}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'center';
          g.textBaseline = 'top';
          g.fillText(lab, x, yc + bh / 2 + 9);
        }
      };
      tick(x0, '0', theme.muted);
      const unitPx = unit * s;
      const ok = shown() || !big;
      const okSmall = shown() || big;
      if (unitPx > 26) tick(x0 + unitPx, okSmall ? `${N(unit)} cm` : '? cm', big ? col.orig() : col.len());
      const endX = x0 + cont * s;
      const vLab = big ? (ok ? `\\c{L}{\\b{${N(L0 * Kv)} cm}}` : '\\c{L}{\\b{? cm}}') : `\\c{o}{\\b{${N(L0)} cm}}`;
      fpill(Math.min(endX + (big ? 18 : 8), R.x + R.w - 10), yc, vLab, { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, bounds: R });
      g.restore();
      // Zähler unten rechts
      const cnt = countOf('line', cuts, now);
      const showN = shown() || fill !== null;
      const src = big ? `${showN ? N(cnt.n, 2) : '?'} × \\c{o}{\\t{Original}}` : `${showN ? N(cnt.n, 2) : '?'} × \\c{L}{\\t{${say(L('Bild', 'image'))}}}`;
      fpill(R.x + R.w - 10, R.y + R.h - 13, src, { align: 'right', size: fs(11.5, 11), alpha: k.panel * (fill ? 1 : 0.9) });
      handleDot([x0 + (big ? cont : unit) * s, yc], col.len(), 'band', k.panel);
    }

    /** Laufende Zählung: Summe der Anteile aller gelandeten Stücke. */
    function countOf(list: 'line' | 'area' | 'body', fracs: readonly number[] | readonly { frac: number }[], now: number): { n: number } {
      let n = 0;
      fracs.forEach((f, i) => {
        if (prog(list, i, now) >= 0.999) n += typeof f === 'number' ? f : f.frac;
      });
      return { n };
    }

    /* =====================================================================
     * Ebene 2: Fläche
     * ===================================================================== */
    function drawArea(R: Rect, f: FigId, Kv: number, now: number, k: Intro, opts: { list: 'area' | null; title: string; counter: boolean; handle: boolean }): void {
      const g = surface.g;
      const theme = th();
      const big = Kv >= 1;
      const spec = FIGS[f];
      paper(R, col.area());
      const ps = pieces2(f, Kv);
      // Platz: oben Titel, unten Zähler
      const top = R.y + 44;
      const bottom = R.y + R.h - fs(44, 40);
      const left = R.x + fs(22, 14);
      const right = R.x + R.w - fs(22, 14);
      // Vergrößern: Maßstab aus SPAN (beim Ziehen fest); Rückwärts: direkt aus k
      const S = opts.list === 'area' ? SPAN.v : spanOf(Kv);
      const circ = f === 'k';
      // Kreis: Einheitskreis links daneben
      const extraW = circ ? 2 * spec.len * Math.min(1, Math.max(Kv, 1 / 2.4)) + 0.5 : 0;
      const W = spec.w * S + extraW;
      const H = spec.h * S;
      const s = Math.min((right - left) / W, (bottom - top - fs(22, 18)) / H, 110);
      const contW = big ? spec.w * Kv : spec.w;
      const contH = big ? spec.h * Kv : spec.h;
      const usedW = contW + extraW;
      const ox = left + (right - left - usedW * s) / 2 + extraW * s;
      const oy = bottom - fs(22, 18) - Math.max(0, (bottom - top - fs(22, 18) - H * s) / 2) * 0.6;
      const P = (q: Pt): Px => [ox + q[0] * s, oy - q[1] * s];
      // Behälter (Bild bzw. Original)
      const contCol = big ? col.area() : col.orig();
      const contPoly: Px[] = (() => {
        if (f === 'd')
          return [
            [0, 0],
            [contW, 0],
            [contW / 2, contH],
          ].map((q) => P([q[0]!, q[1]!]));
        if (circ) {
          const r = contW / 2;
          return Array.from({ length: 96 }, (_, i) => P([r + r * Math.sin((i / 96) * TAU), r + r * Math.cos((i / 96) * TAU)]));
        }
        return [
          [0, 0],
          [contW, 0],
          [contW, contH],
          [0, contH],
        ].map((q) => P([q[0]!, q[1]!]));
      })();
      g.save();
      g.globalAlpha *= k.panel;
      g.fillStyle = withAlpha(contCol, theme.dark ? 0.1 : 0.06);
      polyPath(contPoly);
      g.fill();
      g.strokeStyle = withAlpha(contCol, 0.75);
      g.lineWidth = 1.4;
      g.setLineDash([5, 4]);
      polyPath(contPoly);
      g.stroke();
      g.setLineDash([]);
      // Einheitsfigur beim Kreis: separat links
      const unitR = spec.len * (big ? 1 : Kv);
      let unitC: Px = [0, 0];
      if (circ) {
        unitC = [ox - (extraW - 0.25) * s + unitR * s, oy - unitR * s];
        const uc = big ? col.orig() : col.area();
        const gr = g.createRadialGradient(unitC[0] - unitR * s * 0.3, unitC[1] - unitR * s * 0.3, 1, unitC[0], unitC[1], unitR * s);
        gr.addColorStop(0, mixColor(uc, '#ffffff', 0.35));
        gr.addColorStop(1, uc);
        g.fillStyle = gr;
        g.beginPath();
        g.arc(unitC[0], unitC[1], unitR * s, 0, TAU);
        g.fill();
        g.strokeStyle = mixColor(uc, theme.dark ? '#000000' : '#0b1220', 0.3);
        g.lineWidth = 1.2;
        g.stroke();
      }
      // Stücke
      const c0 = centroid(ps[0]!.poly);
      let n = 0;
      // Spalte innerhalb der Reihe (Schachbrettmuster)
      const colIn: number[] = [];
      const rowCount = new Map<number, number>();
      for (const pc of ps) {
        const c = rowCount.get(pc.row) ?? 0;
        colIn.push(c);
        rowCount.set(pc.row, c + 1);
      }
      ps.forEach((pc, i) => {
        const q = opts.list ? prog(opts.list, i, now) : 1;
        if (q <= 0) return;
        if (q >= 0.999) n += pc.frac;
        const e = ease.outCubic(q);
        const pop = i === 0 ? 1 : lerp(0.82, 1, ease.outBack(q));
        const ci = centroid(pc.poly);
        // Start: am Original (beim Kreis: der kleine Kreis links), Drehung zurücknehmen
        const from: Px = circ ? [(unitC[0] - ox) / s, (oy - unitC[1]) / s] : c0;
        const cx = lerp(from[0], ci[0], e);
        const cy = lerp(from[1], ci[1], e);
        const rot = pc.rot * (1 - e);
        const pts = pc.poly.map(([x, y]) => {
          const dx = (x - ci[0]) * pop;
          const dy = (y - ci[1]) * pop;
          return P([cx + dx * Math.cos(rot) - dy * Math.sin(rot), cy + dx * Math.sin(rot) + dy * Math.cos(rot)]);
        });
        const first = i === 0 && !circ;
        let c: string;
        if (first) c = big ? col.orig() : col.area();
        else if (big) c = (colIn[i]! + pc.row) % 2 === 0 ? col.area() : mixColor(col.area(), '#ffffff', theme.dark ? 0.12 : 0.25);
        else c = light(col.area(), (colIn[i]! + pc.row) % 2 === 0 ? 0.42 : 0.55);
        g.save();
        g.globalAlpha *= Math.min(1, q * 3) * (pc.frac < 0.999 && !first ? 0.85 : 1);
        g.fillStyle = c;
        polyPath(pts);
        g.fill();
        g.strokeStyle = mixColor(theme.bg, theme.bg, 0, theme.dark ? 0.75 : 0.95);
        g.lineWidth = 1.4;
        g.lineJoin = 'round';
        polyPath(pts);
        g.stroke();
        g.restore();
      });
      // Rand des Behälters kräftig, wenn alles liegt
      g.strokeStyle = contCol;
      g.lineWidth = 2.2;
      g.lineJoin = 'round';
      polyPath(contPoly);
      g.stroke();
      // Maße
      const ok = shown() || !big;
      const capLen = (v: number) => `${N(v)} cm`;
      const imgLen = spec.len * Kv;
      const imgLab = ok || !big ? capLen(imgLen) : '? cm';
      const bnd = R;
      if (circ) {
        const r = contW / 2;
        const cc = P([r, r]);
        const edge = P([2 * r, r]);
        line(cc, edge, contCol, 1.6);
        fpill((cc[0] + edge[0]) / 2, cc[1] - 14, `\\c{${big ? 'A' : 'o'}}{r = ${big ? imgLab : capLen(spec.len)}}`, { size: fs(11.5, 11), bounds: bnd });
        fpill(unitC[0], unitC[1] + unitR * s + 13, `\\c{${big ? 'o' : 'A'}}{r = ${big ? capLen(spec.len) : shown() ? capLen(imgLen) : '? cm'}}`, { size: fs(11, 11), bounds: bnd });
      } else {
        const b0 = P([0, 0]);
        const b1 = P([contW, 0]);
        dimLine([b0[0], b0[1] + 12], [b1[0], b1[1] + 12], contCol, `\\c{${big ? 'A' : 'o'}}{${big ? imgLab : capLen(spec.len)}}`, { bounds: bnd });
        if (f !== 'd' && spec.h !== spec.w) {
          const h0 = P([contW, 0]);
          const h1 = P([contW, contH]);
          dimLine([h0[0] + 12, h0[1]], [h1[0] + 12, h1[1]], contCol, `\\c{${big ? 'A' : 'o'}}{${big ? (ok ? capLen(spec.h * Kv) : '? cm') : capLen(spec.h)}}`, { bounds: bnd, side: 0 });
        }
      }
      // Namen
      const nameAt = (q: Px, txt: string, c: string) => fpill(q[0], q[1], txt, { size: fs(11, 11), color: c, alpha: 0.95, bounds: bnd });
      if (!circ) {
        const c0p = P(c0);
        const size0 = Math.sqrt(Math.abs(ps[0]!.frac) * spec.area) * (big ? 1 : Kv) * s;
        if (size0 > 44) nameAt(c0p, big ? '\\t{Original}' : `\\t{${say(L('Bild', 'Image'))}}`, big ? col.orig() : col.area());
        else nameAt([c0p[0], P([0, ps[0]!.poly.reduce((mx, q) => Math.max(mx, q[1]), 0)])[1] - 12], big ? '\\t{Original}' : `\\t{${say(L('Bild', 'Image'))}}`, big ? col.orig() : col.area());
      } else nameAt([unitC[0], unitC[1] - unitR * s - 13], big ? '\\t{Original}' : `\\t{${say(L('Bild', 'Image'))}}`, big ? col.orig() : col.area());
      g.restore();
      panelTitle(R, opts.title, col.area(), k.panel);
      if (opts.counter) {
        const total = ps.reduce((sum, pc) => sum + pc.frac, 0);
        const cnt = opts.list && fill ? n : total;
        const showN = shown() || (fill !== null && opts.list !== null);
        const nn = showN ? N(cnt, 2) : '?';
        const src = big ? `\\c{A}{${say(L('Bild', 'Image'))}} = ${nn} × \\c{o}{\\t{Original}}` : `${nn} × \\c{A}{${say(L('Bild', 'image'))}} = \\c{o}{\\t{Original}}`;
        fpill(R.x + R.w / 2, R.y + R.h - 20, src, { size: fs(12.5, 11), border: withAlpha(col.area(), 0.5), maxW: R.w - 36, alpha: k.panel });
      }
      // Griff: Bildecke
      if (opts.handle) {
        const iw = spec.w * Kv;
        const ih = spec.h * Kv;
        const hq: Pt = f === 'd' ? [iw, 0] : circ ? (big ? [iw, iw / 2] : [0, 0]) : [iw, ih];
        let hp: Px;
        let anchor: Px;
        if (circ && !big) {
          hp = [unitC[0] + unitR * s, unitC[1]];
          anchor = [unitC[0], unitC[1]];
        } else if (circ) {
          hp = P(hq);
          anchor = P([iw / 2, iw / 2]);
        } else {
          hp = P(hq);
          anchor = P([0, 0]);
        }
        const len = Math.hypot(hp[0] - anchor[0], hp[1] - anchor[1]);
        geo.area = { ax: anchor[0], ay: anchor[1], ux: (hp[0] - anchor[0]) / (len || 1), uy: (hp[1] - anchor[1]) / (len || 1), len1: len / Math.max(Kv, 1e-6), box: { x: R.x + 8, y: R.y + 8, w: R.w - 16, h: R.h - 16 } };
        handleDot(hp, col.area(), 'area', k.panel);
      }
    }

    /* =====================================================================
     * Ebene 3: Körper (3D)
     * ===================================================================== */
    let frame: { target: Vec3; radius: number } | null = null;
    const FACE_DIRS: { n: Vec3; ax: 0 | 1 | 2; d: -1 | 1 }[] = [
      { n: [1, 0, 0], ax: 0, d: -1 },
      { n: [-1, 0, 0], ax: 0, d: 1 },
      { n: [0, 1, 0], ax: 1, d: 1 },
      { n: [0, -1, 0], ax: 1, d: -1 },
      { n: [0, 0, 1], ax: 2, d: 1 },
      { n: [0, 0, -1], ax: 2, d: -1 },
    ];
    function boxFace(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, n: Vec3): Vec3[] {
      if (n[0] !== 0) {
        const X = n[0] > 0 ? x1 : x0;
        return [
          [X, y0, z0],
          [X, y1, z0],
          [X, y1, z1],
          [X, y0, z1],
        ];
      }
      if (n[1] !== 0) {
        const Y = n[1] > 0 ? y1 : y0;
        return [
          [x0, Y, z0],
          [x1, Y, z0],
          [x1, Y, z1],
          [x0, Y, z1],
        ];
      }
      const Z = n[2] > 0 ? z1 : z0;
      return [
        [x0, y0, Z],
        [x1, y0, Z],
        [x1, y1, Z],
        [x0, y1, Z],
      ];
    }
    /** Kanten eines Quaders: sichtbare kräftig, verdeckte gestrichelt. */
    function boxEdges(d: Dims, color: string, width: number, alpha = 1): void {
      const box = mesh3d.box([0, 0, 0], d as Vec3);
      const cam = view.camera.position;
      const center: Vec3 = [d[0] / 2, d[1] / 2, d[2] / 2];
      const front = box.faces.map((face) => {
        const pts = face.map((i) => box.vertices[i]!);
        const fc = vec3.centroid(pts);
        return vec3.dot(vec3.sub(fc, center), vec3.sub(cam, fc)) > 0;
      });
      const edges = new Map<string, number[]>();
      box.faces.forEach((face, f) => {
        for (let i = 0; i < 4; i++) {
          const x = face[i]!;
          const y = face[(i + 1) % 4]!;
          const key = x < y ? `${x}-${y}` : `${y}-${x}`;
          edges.set(key, [...(edges.get(key) ?? []), f]);
        }
      });
      for (const [key, fl] of edges) {
        const [i, j] = key.split('-').map(Number) as [number, number];
        const visible = fl.some((f) => front[f]);
        view.segment(box.vertices[i]!, box.vertices[j]!, visible ? { color, width, alpha, layer: 'front' } : { color, width: 1, alpha: alpha * 0.55, dash: [4, 4], layer: 'back' });
      }
    }
    /** Bildausschnitt weich nachführen. */
    function frameTo(goal: { target: Vec3; radius: number }, dt: number): boolean {
      if (!frame || reduced()) frame = goal;
      // beim Ziehen an einem 3D-Griff bleibt der Ausschnitt fest
      if (performance.now() - lastDrag3d < 250) return false;
      const kk = 1 - Math.exp(-dt / 0.2);
      const next = { target: vec3.lerp(frame.target, goal.target, kk), radius: frame.radius + (goal.radius - frame.radius) * kk };
      const moving = vec3.distance(next.target, goal.target) > 0.003 || Math.abs(next.radius - goal.radius) > 0.003;
      frame = moving ? next : goal;
      return moving;
    }
    /**
     * Körper aus Kopien: k ≥ 1 – Bild aus Kopien des Originals (Original orange
     * vorne links unten); k < 1 – Original (orange Glaskasten) mit Kopien des Bildes.
     */
    function drawBody(R: Rect, base: Dims, Kv: number, now: number, dt: number, k: Intro, opts: { list: 'body' | null; title: string; counter: string | null; dims: boolean }): boolean {
      const theme = th();
      const big = Kv >= 1;
      const cont: Dims = big ? scaleDims(base, Kv) : base;
      const bl = blocks3(base, Kv);
      const goal = { target: [cont[0] / 2, cont[1] / 2, cont[2] * 0.42] as Vec3, radius: 0.5 * Math.hypot(base[0], base[1], base[2]) * spanOf(Kv) * 0.92 + 0.25 };
      const moving = frameTo(goal, dt);
      view.setScene({ target: frame!.target, radius: frame!.radius, anchor: [0.5, 0.56] });
      paper(R, col.vol());
      surface.g.save();
      surface.g.globalAlpha *= k.panel;
      view.begin();
      const cam = view.camera.position;
      view.grid({ min: [-1, -1], max: [cont[0] + 1, cont[1] + 1], step: big ? base[0] : 1, color: theme.gridMinor, fade: true });
      view.shadow(
        [
          [0, 0, 0],
          [cont[0], 0, 0],
          [cont[0], cont[1], 0],
          [0, cont[1], 0],
        ],
        { alpha: 0.16, blur: 18, spread: 1.03 },
      );
      // Zellraster: Index (ix, iy, iz); ix zählt von vorn (x₁ groß) nach hinten
      const cuts = unitCuts(mOf(Kv));
      const nAx = cuts.length;
      const state = bl.map((_, i) => (opts.list ? prog(opts.list, i, now) : 1));
      const settled = state.map((q) => q >= 0.999);
      const idx = (ix: number, iy: number, iz: number) => (ix < 0 || iy < 0 || iz < 0 || ix >= nAx || iy >= nAx || iz >= nAx ? -1 : iz * nAx * nAx + iy * nAx + ix);
      const lift = Math.max(cont[2], 1.2) * 0.9;
      let count = 0;
      bl.forEach((b, i) => {
        const q = state[i]!;
        if (q <= 0) return;
        if (settled[i]) count += b.frac;
        const ix = i % nAx;
        const iy = Math.floor(i / nAx) % nAx;
        const iz = Math.floor(i / (nAx * nAx));
        const off = settled[i] ? 0 : (1 - ease.outCubic(q)) * lift;
        const pop = settled[i] || i === 0 ? 1 : lerp(0.86, 1, ease.outBack(q));
        const x1 = cont[0] - b.at[0];
        const x0 = x1 - b.size[0];
        const y0 = b.at[1];
        const y1 = y0 + b.size[1];
        const z0 = b.at[2] + off;
        const z1 = z0 + b.size[2];
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;
        const cz = (z0 + z1) / 2;
        const sc = (v: number, c: number) => c + (v - c) * pop;
        const X0 = sc(x0, cx);
        const X1 = sc(x1, cx);
        const Y0 = sc(y0, cy);
        const Y1 = sc(y1, cy);
        const Z0 = sc(z0, cz);
        const Z1 = sc(z1, cz);
        const first = i === 0;
        let color: string;
        if (first) color = big ? col.orig() : col.vol();
        else if (big) color = b.layer % 2 === 0 ? col.vol() : mixColor(col.vol(), '#ffffff', theme.dark ? 0.12 : 0.24);
        else color = light(col.vol(), b.layer % 2 === 0 ? 0.35 : 0.48);
        if (!theme.dark) color = mixColor(color, '#ffffff', 0.12);
        const stroke = mixColor(color, theme.dark ? '#000000' : '#0b1220', theme.dark ? 0.5 : 0.4);
        const alpha = Math.min(1, q * 3) * (big || first ? 1 : 0.88);
        const pos = [ix, iy, iz];
        for (const fd of FACE_DIRS) {
          const nb = [...pos] as [number, number, number];
          nb[fd.ax] += fd.d;
          const j = idx(nb[0], nb[1], nb[2]);
          if (j >= 0 && settled[i] && settled[j] && state[j]! > 0) continue;
          const pts = boxFace(X0, Y0, Z0, X1, Y1, Z1, fd.n);
          if (vec3.dot(fd.n, vec3.sub(cam, vec3.centroid(pts))) <= 0) continue;
          view.face(pts, { color, alpha, stroke, width: 1, gloss: 0.12 });
        }
      });
      // Umriss des Behälters (Bild bzw. Original)
      boxEdges(cont, big ? col.vol() : col.orig(), 2, 0.95);
      // Beschriftungen
      const ok = shown() || !big;
      const labels3: { x: number; y: number; src: string }[] = [];
      if (opts.dims) {
        const v = (x: number) => `${N(x)} cm`;
        const q = (x: number) => (big ? (ok ? v(x) : '? cm') : v(x));
        const ctr = view.toPx([cont[0] / 2, cont[1] / 2, cont[2] / 2]);
        const lab = (a: Vec3, b: Vec3, txt: string) => {
          const m = view.toPx(vec3.lerp(a, b, 0.5));
          let dx = m[0] - ctr[0];
          let dy = m[1] - ctr[1];
          const l = Math.hypot(dx, dy) || 1;
          dx /= l;
          dy /= l;
          labels3.push({ x: m[0] + dx * 24, y: m[1] + dy * 16, src: `\\c{${big ? 'V' : 'o'}}{${txt}}` });
        };
        const [c0, c1, c2] = cont;
        // die beiden vorderen Bodenkanten (im Bild am weitesten unten) und die rechte senkrechte Kante
        const bottom: [Vec3, Vec3, number][] = [
          [[0, 0, 0], [c0, 0, 0], c0],
          [[0, c1, 0], [c0, c1, 0], c0],
          [[0, 0, 0], [0, c1, 0], c1],
          [[c0, 0, 0], [c0, c1, 0], c1],
        ];
        const byLow = bottom.map((e) => ({ e, y: view.toPx(vec3.lerp(e[0], e[1], 0.5))[1] })).sort((a2, b2) => b2.y - a2.y);
        const usedAx = new Set<number>();
        for (const { e } of byLow) {
          const axis = e[0][0] !== e[1][0] ? 0 : 1;
          if (usedAx.has(axis)) continue;
          usedAx.add(axis);
          lab(e[0], e[1], q(e[2]));
        }
        const verts: Vec3[] = [
          [0, 0, 0],
          [c0, 0, 0],
          [0, c1, 0],
          [c0, c1, 0],
        ];
        const vx = verts.map((p0) => ({ p0, x: view.toPx(p0)[0] })).sort((a2, b2) => b2.x - a2.x)[0]!.p0;
        lab(vx, [vx[0], vx[1], c2], q(c2));
        const b0 = bl[0];
        if (b0) {
          const front: Vec3 = [cont[0], b0.size[1] / 2, b0.size[2] / 2];
          view.label(front, big ? 'Original' : say(L('Bild', 'Image')), { color: big ? col.orig() : col.vol(), size: fs(11.5, 11), weight: '700', align: 'center', baseline: 'middle', halo: true, layer: 'front' });
        }
      }
      view.end();
      for (const lb of labels3) fpill(lb.x, lb.y, lb.src, { size: fs(11.5, 11), bounds: R });
      surface.g.restore();
      panelTitle(R, opts.title, col.vol(), k.panel);
      rotateHint(R, k.panel);
      if (opts.counter !== null) {
        const total = bl.reduce((s, b) => s + b.frac, 0);
        const cnt = opts.list && fill ? count : total;
        const showN = shown() || (fill !== null && opts.list !== null);
        const nn = showN ? N(cnt, 3) : '?';
        const src = opts.counter || (big ? `\\c{V}{${say(L('Bild', 'Image'))}} = ${nn} × \\c{o}{\\t{Original}}` : `${nn} × \\c{V}{${say(L('Bild', 'image'))}} = \\c{o}{\\t{Original}}`);
        fpill(R.x + R.w / 2, R.y + R.h - 20, src, { size: fs(12.5, 11), border: withAlpha(col.vol(), 0.5), maxW: R.w - 36, alpha: k.panel });
      }
      return moving;
    }

    /* 3D-Griffe: Bildecke ziehen (Vergrößern) bzw. Würfelkante (O : V) */
    view.addHandle({
      get: () => {
        const b = BODIES[obj()];
        const d = scaleDims(b, Math.max(K.v, 0.2));
        return [d[0], d[1], d[2]] as Vec3;
      },
      set: (q) => {
        if (mode() !== 'grow') return;
        lastDrag = performance.now();
        lastDrag3d = lastDrag;
        const b = BODIES[obj()];
        const t = (q[0] * b[0] + q[1] * b[1] + q[2] * b[2]) / (b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);
        ctx.set({ k: clamp(Math.round(t * 10) / 10, 0.2, 4) });
        fill = null;
      },
      axis: [1, 1, 1],
      enabled: () => editable() && mode() === 'grow' && BODIES[obj()][1] === 1,
      color: () => col.vol(),
    });
    view.addHandle({
      get: () => {
        const b = BODIES.q;
        const d = scaleDims(b, Math.max(K.v, 0.2));
        return [d[0], d[1], d[2]] as Vec3;
      },
      set: (q) => {
        if (mode() !== 'grow') return;
        lastDrag = performance.now();
        lastDrag3d = lastDrag;
        const b = BODIES.q;
        const t = (q[0] * b[0] + q[1] * b[1] + q[2] * b[2]) / (b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);
        ctx.set({ k: clamp(Math.round(t * 10) / 10, 0.2, 4) });
        fill = null;
      },
      axis: [1, 2, 1],
      enabled: () => editable() && mode() === 'grow' && BODIES[obj()][1] === 2,
      color: () => col.vol(),
    });
    view.addHandle({
      get: () => [A.v, A.v, A.v] as Vec3,
      set: (q) => {
        if (mode() !== 'ov') return;
        lastDrag = performance.now();
        lastDrag3d = lastDrag;
        const t = (q[0] + q[1] + q[2]) / 3;
        ctx.set({ a: clamp(Math.round(t * 2) / 2, 0.5, 5) });
      },
      axis: [1, 1, 1],
      enabled: () => editable() && mode() === 'ov' && SPLIT.v < 0.01,
      color: () => col.vol(),
    });

    /* =====================================================================
     * Diagramme
     * ===================================================================== */
    interface Axes {
      X: (v: number) => number;
      Y: (v: number) => number;
      x0: number;
      x1: number;
      y0: number;
      y1: number;
    }
    function niceStep(range: number, px: number, minPx: number): number {
      const raw = range / Math.max(1, px / minPx);
      const p10 = 10 ** Math.floor(Math.log10(raw));
      for (const m of [1, 2, 5, 10]) if (m * p10 >= raw) return m * p10;
      return 10 * p10;
    }
    function axes(Rp: Rect, xr: [number, number], yr: [number, number], opts: { xLabel: string; yLabel: string; alpha?: number }): Axes {
      const g = surface.g;
      const theme = th();
      const X = (v: number) => Rp.x + ((v - xr[0]) / (xr[1] - xr[0])) * Rp.w;
      const Y = (v: number) => Rp.y + Rp.h - ((v - yr[0]) / (yr[1] - yr[0])) * Rp.h;
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
      const xs = niceStep(xr[1] - xr[0], Rp.w, 34);
      const ys = niceStep(yr[1] - yr[0], Rp.h, 26);
      g.lineWidth = 1;
      g.strokeStyle = theme.gridMinor;
      g.font = `600 ${fs(11, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      for (let v = Math.ceil(xr[0] / xs) * xs; v <= xr[1] + 1e-9; v += xs) {
        const x = Math.round(X(v)) + 0.5;
        g.beginPath();
        g.moveTo(x, Rp.y);
        g.lineTo(x, Rp.y + Rp.h);
        g.stroke();
        if (Math.abs(v) > 1e-9) {
          g.textAlign = 'center';
          g.textBaseline = 'top';
          g.fillText(N(v, 2), x, Rp.y + Rp.h + 5);
        }
      }
      for (let v = Math.ceil(yr[0] / ys) * ys; v <= yr[1] + 1e-9; v += ys) {
        const y = Math.round(Y(v)) + 0.5;
        g.beginPath();
        g.moveTo(Rp.x, y);
        g.lineTo(Rp.x + Rp.w, y);
        g.stroke();
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText(N(v, 2), Rp.x - 5, y);
      }
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(Rp.x, Rp.y - 4);
      g.lineTo(Rp.x, Rp.y + Rp.h);
      g.lineTo(Rp.x + Rp.w + 4, Rp.y + Rp.h);
      g.stroke();
      arrowHead([Rp.x, Rp.y - 8], [0, -1], withAlpha(theme.text, 0.55), 6);
      arrowHead([Rp.x + Rp.w + 8, Rp.y + Rp.h], [1, 0], withAlpha(theme.text, 0.55), 6);
      g.restore();
      const xl = formula(g, opts.xLabel, fstyle(fs(12.5, 12), theme.muted, 650));
      xl.draw(g, Rp.x + Rp.w - xl.w, Rp.y + Rp.h - 6);
      const yl = formula(g, opts.yLabel, fstyle(fs(12, 11), theme.muted, 650));
      yl.draw(g, Rp.x + 8, Rp.y + yl.asc - 2);
      return { X, Y, x0: xr[0], x1: xr[1], y0: yr[0], y1: yr[1] };
    }
    function curve(ax: Axes, f: (x: number) => number, color: string, width: number, from = ax.x0, to = ax.x1, alpha = 1): Px | null {
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.beginPath();
      let started = false;
      let last: Px | null = null;
      const n = 120;
      for (let i = 0; i <= n; i++) {
        const x = from + ((to - from) * i) / n;
        const y = f(x);
        if (!Number.isFinite(y)) continue;
        if (y > ax.y1 * 1.02) {
          if (started) {
            // bis zum oberen Rand
            const xr = bisect(f, x - (to - from) / n, x, ax.y1);
            g.lineTo(ax.X(xr), ax.Y(ax.y1));
            last = [ax.X(xr), ax.Y(ax.y1)];
          }
          break;
        }
        const q: Px = [ax.X(x), ax.Y(Math.max(ax.y0, y))];
        if (!started) {
          g.moveTo(q[0], q[1]);
          started = true;
        } else g.lineTo(q[0], q[1]);
        last = q;
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.stroke();
      g.restore();
      return last;
    }
    function bisect(f: (x: number) => number, a: number, b: number, y: number): number {
      let lo = a;
      let hi = b;
      for (let i = 0; i < 30; i++) {
        const m = (lo + hi) / 2;
        if (f(m) < y) lo = m;
        else hi = m;
      }
      return (lo + hi) / 2;
    }
    function chartDot(q: Px, color: string, r = 4.5): void {
      const g = surface.g;
      g.save();
      g.fillStyle = color;
      g.strokeStyle = th().bg;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(q[0], q[1], r, 0, TAU);
      g.fill();
      g.stroke();
      g.restore();
    }
    function growYMax(k: number): number {
      return clamp(k ** 3 * 1.18, 9, 76);
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

    /** Tabelle „Was passiert mit …“: Größe, alter → neuer Wert, Faktor – in den Farben der Ebenen. */
    function factorCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const Kv = K.v;
        const spec = FIGS[fig()];
        const body = BODIES[obj()];
        const ok = shown();
        const v = (x: number, d = 2) => (ok ? `${eq(x, d)} ${N(x, d)}` : '= ?');
        const exactA = fig() === 'q' || fig() === 'r';
        const fA = (x: number) => `${exactA ? '' : '≈ '}${N(x, 2)}`;
        const rows: { key: string; name: string; from: string; to: string; fac: string; c: string }[] = [
          { key: 'L', name: say(L('Länge', 'Length')), from: `${N(spec.len)} cm`, to: ok ? `${N(spec.len * Kv)} cm` : '? cm', fac: `· k ${v(Kv, 1)}`, c: col.len() },
          { key: 'A', name: say(L('Fläche', 'Area')), from: `${fA(spec.area)} cm²`, to: ok ? `${fA(spec.area * Kv * Kv)} cm²` : '? cm²', fac: `· k² ${ok ? (reciprocalInt(Kv * Kv) ? `= ${facF(Kv * Kv)}` : v(Kv * Kv, 2)) : '= ?'}`, c: col.area() },
          { key: 'A', name: say(L('Oberfläche', 'Surface')), from: `${N(boxSurface(body))} cm²`, to: ok ? `${N(boxSurface(body) * Kv * Kv)} cm²` : '? cm²', fac: `· k² ${ok ? (reciprocalInt(Kv * Kv) ? `= ${facF(Kv * Kv)}` : v(Kv * Kv, 2)) : '= ?'}`, c: col.area() },
          { key: 'V', name: say(L('Volumen', 'Volume')), from: `${N(boxVolume(body))} cm³`, to: ok ? `${N(boxVolume(body) * Kv ** 3, 3)} cm³` : '? cm³', fac: `· k³ ${ok ? (reciprocalInt(Kv ** 3) ? `= ${facF(Kv ** 3)}` : v(Kv ** 3, 3)) : '= ?'}`, c: col.vol() },
        ];
        const rh = fs(33, 34);
        const h = 40 + rows.length * rh + 2;
        if (measure) return h;
        card({ ...R, h }, col.k());
        cardTitle(R, say(L('Was passiert mit …', 'What happens to …')), col.k(), `\\c{k}{k = ${N(Kv, 2)}}`);
        const sz = fs(12.5, 12);
        rows.forEach((r, i) => {
          const y = R.y + 37 + i * rh + 8;
          const a = ease.outCubic(clamp01(k.stagger * 6 - i));
          g.save();
          g.globalAlpha *= a;
          g.translate((1 - a) * 10, 0);
          g.fillStyle = r.c;
          roundRect(g, R.x + pad, y - 5, 10, 10, 3);
          g.fill();
          const nb = formula(g, r.name, fstyle(sz, theme.text, 700));
          nb.draw(g, R.x + pad + 16, y + (nb.asc - nb.desc) / 2);
          const fb = fit(`\\c{${r.key}}{\\b{${r.fac}}}`, R.w - 2 * pad - 26 - nb.w, sz, r.c, 700);
          fb.draw(g, R.x + R.w - pad - fb.w, y + (fb.asc - fb.desc) / 2);
          const mb = fit(`\\c{m}{${r.from} →} \\c{${r.key}}{${r.to}}`, R.w - 2 * pad - 16, fs(12, 11.5), theme.muted, 600);
          mb.draw(g, R.x + pad + 16, y + 15 + (mb.asc - mb.desc) / 2);
          g.restore();
        });
        return h;
      };
    }

    /** Wachstumsdiagramm: k, k², k³ über k mit laufendem Punkt. */
    function growthCard(k: Intro): CardFn {
      return (R, measure) => {
        const h = Math.round(Math.min(clamp(R.w * (isWide() ? 0.6 : 0.58), 150, 236), Math.max(126, growthCap)));
        if (measure) return h;
        const g = surface.g;
        card({ ...R, h }, col.vol());
        cardTitle(R, say(L('Wie schnell wächst was?', 'What grows how fast?')), col.vol());
        const pad = fs(14, 12);
        const Rp = { x: R.x + pad + 22, y: R.y + 46, w: R.w - 2 * pad - 34, h: h - 46 - 26 };
        const ymax = YMAX.v;
        const ax = axes(Rp, [0, 4.25], [0, ymax], { xLabel: 'k', yLabel: say(L('Faktor', 'factor')), alpha: k.panel });
        g.save();
        g.beginPath();
        g.rect(Rp.x - 2, Rp.y - 2, Rp.w + 16, Rp.h + 4);
        g.clip();
        const reveal = ease.inOutCubic(clamp01(k.stagger * 1.4));
        const curves: [(x: number) => number, string, string][] = [
          [(x) => x, col.len(), 'k'],
          [(x) => x * x, col.area(), 'k²'],
          [(x) => x ** 3, col.vol(), 'k³'],
        ];
        for (const [f, c] of curves) curve(ax, f, c, 2.4, 0, 4.25 * reveal);
        const Kv = K.v;
        line([ax.X(Kv), Rp.y], [ax.X(Kv), Rp.y + Rp.h], withAlpha(th().muted, 0.7), 1.2, { dash: [3, 3] });
        g.restore();
        // Namen an den Kurven (oben links neben der Kurve, nie abgeschnitten)
        curves.forEach(([f, c, name], i) => {
          const xs = i === 0 ? 3.75 : Math.min(3.75, i === 1 ? Math.sqrt(ymax * 0.72) : Math.cbrt(ymax * 0.84));
          const q: Px = [ax.X(xs), ax.Y(f(xs))];
          const b = formula(g, name, fstyle(fs(12.5, 12), c, 750));
          g.save();
          g.globalAlpha *= reveal;
          b.draw(g, q[0] - b.w - (i === 0 ? -2 : 7), q[1] - (i === 0 ? 8 : 4));
          g.restore();
        });
        // laufende Punkte mit Werten
        const ok = shown();
        const vals = [Kv, Kv * Kv, Kv ** 3];
        let lastY = Infinity;
        [0, 1, 2].forEach((i) => {
          const v = vals[i]!;
          if (v > ymax) return;
          const q: Px = [ax.X(Kv), ax.Y(v)];
          chartDot(q, curves[i]![1]);
          let ly = Math.min(q[1], Rp.y + Rp.h - 6);
          if (lastY - ly < 18) ly = lastY - 18;
          lastY = ly;
          if (ok) fpill(q[0] + 10, ly, `\\c{${['L', 'A', 'V'][i]}}{${N(v, i === 2 ? 3 : 2)}}`, { align: 'left', size: fs(11.5, 11), bounds: { x: Rp.x, y: Rp.y - 12, w: Rp.w + 10, h: Rp.h + 16 } });
        });
        if (Kv ** 3 > ymax) fpill(ax.X(Kv), Rp.y + 6, `\\c{V}{k³ = ${N(Kv ** 3, 3)} ↑}`, { size: fs(11.5, 11) });
        return h;
      };
    }

    function merkeCard(k: Intro): CardFn {
      return (R, measure) => {
        const Kv = p.k;
        const paras: { s: string; color?: string; weight?: number }[] = [
          { s: say(L('Alle Längen werden mit k multipliziert, Flächen (auch die Oberfläche) mit k², Volumina mit k³.', 'All lengths are multiplied by k, areas (including the surface) by k², volumes by k³.')), weight: 600 },
        ];
        if (!shown()) paras.push({ s: say(L('Wie viele Kopien sind es? Schätze erst, dann „Kopien auslegen“.', 'How many copies are there? Estimate first, then “Lay out copies”.')), color: col.k(), weight: 650 });
        else if (Math.abs(Kv - 1) < 1e-9) paras.push({ s: say(L('k = 1: Bild und Original sind deckungsgleich (kongruent).', 'k = 1: image and original are congruent.')), color: col.k(), weight: 650 });
        else if (Kv < 1) {
          const n2 = reciprocalInt(Kv * Kv);
          const n3 = reciprocalInt(Kv ** 3);
          paras.push({
            s: say(
              L(
                `Verkleinern (k < 1): k³ < k² < k – das Volumen schrumpft am stärksten.${n2 && n3 ? ` ${n2} Bilder füllen die Fläche, ${n3} Bilder den Körper des Originals.` : ''}`,
                `Reducing (k < 1): k³ < k² < k – the volume shrinks the most.${n2 && n3 ? ` ${n2} images fill the original figure, ${n3} images fill the original solid.` : ''}`,
              ),
            ),
            color: col.k(),
            weight: 650,
          });
        } else if (Math.abs(Kv - Math.round(Kv)) > 1e-9)
          paras.push({ s: say(L(`k = ${N(Kv)} ist nicht ganzzahlig: Am Rand liegen Bruchstücke. Zusammen sind es genau ${N(Kv * Kv)} bzw. ${N(Kv ** 3, 3)} Kopien.`, `k = ${N(Kv)} is not a whole number: pieces lie along the edge. Together they make exactly ${N(Kv * Kv)} and ${N(Kv ** 3, 3)} copies.`)), color: col.k(), weight: 650 });
        else paras.push({ s: say(L(`Doppelte Kante – vierfache Fläche, achtfaches Volumen. Bei k = ${N(Kv)}: ${N(Kv * Kv)}-fach und ${N(Kv ** 3)}-fach.`, `Double the edge – four times the area, eight times the volume. For k = ${N(Kv)}: ${N(Kv * Kv)} and ${N(Kv ** 3)} times.`)), color: col.k(), weight: 650 });
        if (fig() === 'k') paras.push({ s: say(L('Kreis: Er lässt sich nicht aus kleinen Kreisen legen – aber in Sektoren, von denen jeder so groß ist wie das Original.', 'Circle: it cannot be made of small circles – but of sectors, each as large as the original.')), color: th().muted });
        else if (fig() === 'd' && Kv >= 2) paras.push({ s: say(L('Dreieck: Einige Kopien liegen auf dem Kopf – sie sind trotzdem deckungsgleich.', 'Triangle: some copies are upside down – they are still congruent.')), color: th().muted });
        return textCard(R, measure, k, say(L('Merke', 'Remember')), col.k(), paras);
      };
    }

    /* ---------- Rückwärts ---------- */
    function solveSteps(now: number): number[] {
      if (!solve) return [1, 1, 1, 1];
      const t = now - solve.t0;
      return [0, 1, 2, 3].map((i) => ease.outCubic(clamp01((t - 200 - i * 900) / 500)));
    }
    const SOLVE_END = 3600;
    function backCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const d = dimB();
        const f = p.f;
        const kk = kFromFactor(f, d);
        const ex = exactRoot(f, d);
        const st = solveSteps(now);
        const ok = shown();
        const key = d === 2 ? 'A' : 'V';
        const what = d === 2 ? say(L('Fläche', 'Area')) : say(L('Volumen', 'Volume'));
        const root = d === 2 ? `\\r{${N(f, 1)}}` : `\\w{3}{${N(f, 1)}}`;
        const rows: Row[] = [
          { src: `\\c{m}{① ${say(L('Gegeben', 'Given'))}}`, size: fs(12, 11), color: th().muted, at: st[0], gap: 4 },
          { src: `\\c{${key}}{${what} · ${N(f, 1)}}  ⇒  \\c{${key}}{k${d === 2 ? '²' : '³'} = ${N(f, 1)}}`, size: fs(14, 13), at: st[0], gap: 10 },
          { src: `\\c{m}{② ${d === 2 ? say(L('Quadratwurzel ziehen', 'Take the square root')) : say(L('Kubikwurzel ziehen', 'Take the cube root'))}}`, size: fs(12, 11), color: th().muted, at: st[1], gap: 4 },
          { src: `\\c{k}{k = ${root}} ${ok ? `${ex !== null ? '=' : '≈'} \\c{k}{\\b{${N(kk, ex !== null ? 2 : 3)}}}` : '= ?'}`, size: fs(15, 14), at: st[1], gap: 10 },
          {
            src: ok ? `\\c{m}{③ ${say(L('Probe', 'Check'))}:}  ${N(kk, ex !== null ? 2 : 3)}${d === 2 ? '²' : '³'} ${ex !== null ? '=' : '≈'} ${N(kk ** d, 2)}  \\c{ok}{✓}` : `\\c{m}{③ ${say(L('Probe', 'Check'))}: ?${d === 2 ? '²' : '³'} = ${N(f, 1)}}`,
            size: fs(13, 12),
            at: st[2],
            gap: 6,
          },
        ];
        if (ok && ex === null) rows.push({ src: `\\c{m}{${say(L('Keine ganze Zahl: k liegt zwischen', 'Not a whole number: k lies between'))} ${Math.floor(kk + 1e-9)} ${say(L('und', 'and'))} ${Math.floor(kk + 1e-9) + 1}}`, size: fs(12, 11), color: th().muted, at: st[3] });
        return formulaCard(R, measure, k, say(L('Rückwärts rechnen', 'Working backwards')), d === 2 ? col.area() : col.vol(), rows);
      };
    }
    /** Quadrat- bzw. Kubikzahlen zum Abschätzen. */
    function powersCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const d = dimB();
        const c = d === 2 ? col.area() : col.vol();
        const pad = fs(14, 12);
        const n = 5;
        const h = 40 + 56;
        if (measure) return h;
        card({ ...R, h }, c);
        cardTitle(R, d === 2 ? say(L('Quadratzahlen', 'Square numbers')) : say(L('Kubikzahlen', 'Cube numbers')), c);
        const cw = (R.w - 2 * pad) / n;
        const kk = kFromFactor(p.f, d);
        for (let i = 1; i <= n; i++) {
          const x = R.x + pad + (i - 1) * cw;
          const y = R.y + 42;
          const hit = Math.abs(kk - i) < 1e-9 && shown();
          const near = shown() && kk > i - 1 && kk < i && Math.abs(kk - i) > 1e-9;
          const a = ease.outCubic(clamp01(k.stagger * 7 - i));
          g.save();
          g.globalAlpha *= a;
          g.fillStyle = hit ? withAlpha(c, 0.22) : mixColor(th().text, th().text, 0, th().dark ? 0.04 : 0.035);
          roundRect(g, x + 3, y, cw - 6, 46, 9);
          g.fill();
          if (hit || near) {
            g.strokeStyle = withAlpha(c, near ? 0.5 : 0.9);
            g.setLineDash(near ? [3, 3] : []);
            g.lineWidth = 1.5;
            roundRect(g, x + 3.5, y + 0.5, cw - 7, 45, 9);
            g.stroke();
            g.setLineDash([]);
          }
          const t = formula(g, `${i}${d === 2 ? '²' : '³'}`, fstyle(fs(12, 11), th().muted, 650));
          t.draw(g, x + cw / 2 - t.w / 2, y + 16);
          const b = formula(g, `\\b{${i ** d}}`, fstyle(fs(15, 13.5), c, 800));
          b.draw(g, x + cw / 2 - b.w / 2, y + 37);
          g.restore();
        }
        return h;
      };
    }

    /* ---------- Pizza ---------- */
    function pizzaCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const d1 = p.d1;
        const d2 = p.d2;
        const kk = d2 / d1;
        const fa = pizzaFactor(d1, d2);
        const A1 = pizzaArea(d1);
        const A2 = pizzaArea(d2);
        const ok = shown();
        const tt = cut ? now - cut.t0 : Infinity;
        const e = (i: number) => (tt === Infinity ? 1 : ease.outCubic(clamp01((tt - 300 - i * 450) / 400)));
        const rows: Row[] = [
          { src: `\\c{L}{k = \\f{${d2} cm}{${d1} cm}} ${ok ? `${eq(kk, 3)} \\c{L}{${N(kk, 3)}}` : '= ?'}`, size: fs(14, 13), gap: 10, at: e(0) },
          { src: `\\c{A}{${say(L('Fläche', 'Area'))} · k²} ${ok ? `${eq(fa, 3)} ${N(kk, 3)}² ${eq(fa, 3)} \\c{A}{\\b{${N(fa, 3)}}}` : '= ?'}`, size: fs(14, 13), gap: 10, at: e(1) },
          { src: `\\c{m}{${say(L('Probe mit A = π · r²', 'Check with A = π · r²'))}:}`, size: fs(12, 11), color: th().muted, gap: 4, at: e(2) },
          { src: `A₁ = π · (${N(d1 / 2, 1)} cm)² ≈ ${big(A1, 0)} cm²`, size: fs(13, 12), gap: 4, at: e(2) },
          { src: `A₂ = π · (${N(d2 / 2, 1)} cm)² ≈ ${ok ? `${big(A2, 0)} cm²` : '?'}`, size: fs(13, 12), gap: 6, at: e(3) },
          { src: ok ? `${big(A2, 0)} : ${big(A1, 0)} ≈ ${N(A2 / A1, 2)}  \\c{ok}{✓}` : `A₂ : A₁ = ?`, size: fs(13, 12), at: e(3) },
        ];
        return formulaCard(R, measure, k, say(L('Rechnung', 'Calculation')), col.area(), rows);
      };
    }
    function pizzaInfoCard(k: Intro): CardFn {
      return (R, measure) => {
        const fa = pizzaFactor(p.d1, p.d2);
        const pct = (p.d2 / p.d1 - 1) * 100;
        const paras: { s: string; color?: string; weight?: number }[] = [];
        if (shown() && p.d2 > p.d1)
          paras.push({
            s: say(L(`Der Durchmesser wächst um ${N(pct, 0)} %, die Fläche um ${N((fa - 1) * 100, 0)} %.`, `The diameter grows by ${N(pct, 0)} %, the area by ${N((fa - 1) * 100, 0)} %.`)),
            weight: 650,
            color: col.area(),
          });
        paras.push({ s: say(L(`Preisvergleich: Kostet die große Pizza weniger als das ${shown() ? N(fa, 2) : '…'}-Fache der kleinen, bekommt man pro cm² mehr Pizza.`, `Price check: if the large pizza costs less than ${shown() ? N(fa, 2) : '…'} times the small one, you get more pizza per cm².`)) });
        paras.push({ s: say(L('Ziehe am Rand einer Pizza.', 'Drag the edge of a pizza.')), color: th().muted });
        return textCard(R, measure, k, say(L('Was heißt das?', 'What does it mean?')), col.orig(), paras);
      };
    }

    /* ---------- Modell ---------- */
    function modelCard(k: Intro): CardFn {
      return (R, measure) => {
        const m = p.m;
        const f = modelFactors(m);
        const ok = shown();
        const lenM = CAR_LEN / m;
        const rows: Row[] = [
          { src: `\\c{L}{${say(L('Länge', 'Length'))} · \\f{1}{${m}}}:  ${N(CAR_LEN, 1)} ${M} → ${ok ? `${N(lenM * 100, 1)} cm` : '?'}`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\c{A}{${say(L('Lackfläche', 'Paint area'))} · ${ok ? `\\f{1}{${big(m * m, 0)}}` : '?'}}`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\c{V}{${say(L('Volumen, Masse', 'Volume, mass'))} · ${ok ? `\\f{1}{${big(m ** 3, 0)}}` : '?'}}`, size: fs(13.5, 12.5), gap: 6 },
          { src: `\\c{m}{(${say(L('Masse: bei gleichem Material', 'mass: for the same material'))})}`, size: fs(12, 11), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Maßstab', 'Scale')) + ` 1 : ${m}`, col.orig(), rows, ok ? `\\c{L}{k = ${facF(f.len)}}` : undefined);
      };
    }
    function modelInfoCard(k: Intro): CardFn {
      return (R, measure) => {
        const m = p.m;
        const ok = shown();
        return textCard(R, measure, k, say(L('Warum so viel?', 'Why so many?')), col.area(), [
          { s: say(L(`Mit dem Lack für ein Auto lackiert man ${ok ? big(m * m, 0) : '?'} Modelle – nicht nur ${m}.`, `The paint for one car covers ${ok ? big(m * m, 0) : '?'} models – not just ${m}.`)), weight: 650, color: col.area() },
          { s: say(L(`Aus dem Material eines massiven Körpers würde man sogar ${ok ? big(m ** 3, 0) : '?'} verkleinerte Kopien gießen.`, `From the material of a solid body you could even cast ${ok ? big(m ** 3, 0) : '?'} scaled-down copies.`)) },
        ]);
      };
    }

    /* ---------- Oberfläche und Volumen ---------- */
    function ovCard(k: Intro): CardFn {
      return (R, measure) => {
        const a = p.a;
        const r = cubeOV(a);
        const ok = shown();
        const rows: Row[] = [
          { src: `\\c{A}{O = 6 · a²} = 6 · (${N(a, 1)} cm)² = \\c{A}{${ok ? `${N(r.O, 2)} cm²` : '?'}}`, size: fs(13.5, 12.5), gap: 8 },
          { src: `\\c{V}{V = a³} = (${N(a, 1)} cm)³ = \\c{V}{${ok ? `${N(r.V, 3)} cm³` : '?'}}`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\c{k}{O : V} = \\f{6a²}{a³} = \\c{k}{\\f{6}{a}} = \\f{6}{${N(a, 1)}} ${ok ? `${eq(r.ratio, 2)} \\c{k}{\\b{${N(r.ratio, 2)}}}` : '= ?'}`, size: fs(14, 13), gap: 6 },
          { src: `\\c{m}{(${say(L('Zahlenwerte in cm² und cm³', 'numbers in cm² and cm³'))})}`, size: fs(12, 11), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Würfel mit Kante a', 'Cube with edge a')), col.k(), rows);
      };
    }
    function splitCard(k: Intro): CardFn {
      return (R, measure) => {
        const a = p.a;
        const e = splitEdge(a);
        const s = splitCube(a, e);
        const ok = shown() || revealed;
        const rows: Row[] = [
          { src: `${say(L('Zerteilt in', 'Cut into'))} ${s.n} ${say(L('Würfel mit', 'cubes with'))} ${N(e, 2)} cm`, size: fs(13, 12), gap: 8 },
          { src: `\\c{V}{V} ${say(L('bleibt', 'stays'))} \\c{V}{${ok ? N(s.V, 3) : '?'} cm³}`, size: fs(13.5, 12.5), gap: 8 },
          { src: `\\c{A}{O}: ${ok ? N(s.O0, 2) : '?'} cm² → \\c{A}{\\b{${ok ? `${N(s.O1, 2)} cm²` : '?'}}}  ${ok ? `\\c{m}{(· ${N(s.O1 / s.O0, 2)})}` : ''}`, size: fs(13.5, 12.5), gap: 4 },
        ];
        return formulaCard(R, measure, k, say(L('Zerteilen', 'Cutting up')), col.area(), rows);
      };
    }
    function animalCard(k: Intro): CardFn {
      return (R, measure) =>
        textCard(R, measure, k, say(L('Kleine Körper, große Oberfläche', 'Small bodies, large surface')), col.orig(), [
          { s: say(L('Je kleiner der Körper, desto mehr Oberfläche hat er im Verhältnis zu seinem Volumen.', 'The smaller the body, the more surface it has compared with its volume.')), weight: 650 },
          { s: say(L('Darum kühlt eine Maus viel schneller aus als ein Elefant, Puderzucker löst sich schneller als ein Zuckerwürfel und Späne brennen schneller als ein Holzklotz.', 'That is why a mouse cools down much faster than an elephant, icing sugar dissolves faster than a sugar cube and wood shavings burn faster than a log.')) },
        ]);
    }

    function cardsFor(now: number, k: Intro): CardFn[] {
      const m = mode();
      if (m === 'grow') return [factorCard(k), growthCard(k), merkeCard(k)];
      if (m === 'back') return [backCard(now, k), powersCard(k)];
      if (m === 'pizza') return [pizzaCard(now, k), pizzaInfoCard(k)];
      if (m === 'modell') return [modelCard(k), modelInfoCard(k)];
      return [ovCard(k), splitCard(k), animalCard(k)];
    }
    /** Obergrenze für die Höhe des Wachstumsdiagramms, damit die Karte „Merke“ auch auf Tablet und Laptop Platz hat. */
    let growthCap = Infinity;
    /** Wie viele Karten passen in die Spalte (gleiche Verteilung wie beim Zeichnen)? */
    function cardsThatFit(list: CardFn[], C: Rect, two: boolean, gap: number): number {
      let n = 0;
      if (two) {
        const cw = (C.w - gap) / 2;
        let yL = C.y;
        let yR = C.y;
        for (const fn of list) {
          const leftCol = yL <= yR;
          const y = leftCol ? yL : yR;
          const hh = fn({ x: C.x, y, w: cw, h: C.y + C.h - y }, true);
          if (hh <= 0 || hh > C.y + C.h - y + 1) continue;
          n++;
          if (leftCol) yL += hh + gap;
          else yR += hh + gap;
        }
        return n;
      }
      let y = C.y;
      for (const fn of list) {
        const hh = fn({ x: C.x, y, w: C.w, h: C.y + C.h - y }, true);
        if (hh <= 0 || hh > C.y + C.h - y + 1) continue;
        n++;
        y += hh + gap;
      }
      return n;
    }
    function drawColumn(C: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const list = cardsFor(now, k);
      const gap = fs(10, 8);
      const twoCols = !regions().wide && C.w >= 460;
      // Diagramm notfalls flacher machen, statt die Karte „Merke“ wegzulassen
      growthCap = Infinity;
      if (mode() === 'grow' && cardsThatFit(list, C, twoCols, gap) < list.length) {
        for (let cap = 230; cap >= 126; cap -= 8) {
          growthCap = cap;
          if (cardsThatFit(list, C, twoCols, gap) === list.length) break;
        }
        if (cardsThatFit(list, C, twoCols, gap) < list.length) growthCap = Infinity;
      }
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = twoCols;
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

    /* =====================================================================
     * Szenen
     * ===================================================================== */
    function drawGrow(now: number, dt: number, k: Intro): boolean {
      const P = panels('grow');
      drawBand(P.band!, now, k);
      const fname = { q: L('Quadrat', 'Square'), r: L('Rechteck', 'Rectangle'), d: L('Dreieck', 'Triangle'), k: L('Kreis', 'Circle') }[fig()];
      drawArea(P.p1, fig(), K.v, now, k, { list: 'area', title: `\\c{A}{${say(L('Fläche', 'Area'))} · k²}  \\c{m}{\\t{${say(fname)}}}`, counter: true, handle: true });
      return drawBody(P.p2, BODIES[obj()], K.v, now, dt, k, { list: 'body', title: `\\c{V}{${say(L('Volumen', 'Volume'))} · k³}  \\c{m}{\\t{${obj() === 'w' ? say(L('Würfel', 'Cube')) : say(L('Quader', 'Cuboid'))}}}`, counter: '', dims: true });
    }

    function drawBack(now: number, dt: number, k: Intro): boolean {
      const P = panels('back');
      const R = P.p1;
      const g = surface.g;
      const d = dimB();
      const f = p.f;
      const c = d === 2 ? col.area() : col.vol();
      const key = d === 2 ? 'A' : 'V';
      paper(R, c);
      const pad = fs(16, 12);
      const Rp = { x: R.x + pad + 26, y: R.y + 54, w: R.w - 2 * pad - 40, h: R.h - 54 - 34 };
      const ax = axes(Rp, [0, BX.v], [0, BY.v], { xLabel: 'k', yLabel: d === 2 ? `\\c{A}{k²}` : `\\c{V}{k³}`, alpha: k.panel });
      geo.fline = { y0: ax.Y(0), yScale: Rp.h / BY.v, fMax: BY.v };
      const kk = kFromFactor(f, d);
      const st = solveSteps(now);
      const kb = KB.v;
      g.save();
      g.beginPath();
      g.rect(Rp.x - 2, Rp.y - 2, Rp.w + 14, Rp.h + 4);
      g.clip();
      curve(ax, (x) => x ** d, c, 2.8, 0, BX.v, k.panel);
      // waagrechte Linie y = f bis zur Kurve, dann senkrecht zur k-Achse
      const yF = ax.Y(f);
      const xK = ax.X(kk);
      const hp = solve ? st[0]! : 1;
      line([Rp.x, yF], [lerp(Rp.x, xK, hp), yF], withAlpha(c, 0.9), 2, { dash: [7, 5] });
      const vp = solve ? st[1]! : 1;
      if (shown() && vp > 0.01) line([xK, yF], [xK, lerp(yF, Rp.y + Rp.h, vp)], col.k(), 2, { dash: [7, 5] });
      g.restore();
      // laufender Punkt auf der Kurve
      if (kb ** d <= BY.v) chartDot([ax.X(kb), ax.Y(kb ** d)], c, 5.5);
      if (solve && now - solve.t0 < SOLVE_END) fpill(ax.X(kb) - 10, ax.Y(kb ** d) - 16, `\\c{${key}}{${N(kb, 2)}${d === 2 ? '²' : '³'} ${isExact(kb, 2) && isExact(kb ** d, 1) ? '=' : '≈'} ${N(kb ** d, 1)}}`, { align: 'right', size: fs(11.5, 11), bounds: R });
      // Beschriftungen
      fpill(Rp.x + 8, yF - 14, `\\c{${key}}{${d === 2 ? say(L('Fläche', 'Area')) : say(L('Volumen', 'Volume'))} · ${N(f, 1)}}`, { align: 'left', size: fs(12, 11), bounds: R });
      if (shown() && vp > 0.5) {
        const ex = exactRoot(f, d);
        fpill(xK + 8, Rp.y + Rp.h - 34, `\\c{k}{k ${ex !== null ? '=' : '≈'} ${N(kk, 2)}}`, { align: 'left', size: fs(12.5, 11.5), border: withAlpha(col.k(), 0.6), alpha: clamp01((vp - 0.5) * 2), bounds: R });
        chartDot([xK, yF], col.k(), 4);
      }
      handleDot([Rp.x, yF], c, 'fline', k.panel);
      panelTitle(R, `${say(L('Faktor über k', 'Factor against k'))}`, c, k.panel);
      // rechts: Bild mit dem animierten k
      if (d === 2) {
        drawArea(P.p2, 'q', kb, now, k, { list: null, title: `\\c{A}{${say(L('Quadrat', 'Square'))}: k = ${shown() || solve ? N(kb, 2) : '?'}}`, counter: false, handle: false });
        fpill(P.p2.x + P.p2.w / 2, P.p2.y + P.p2.h - 20, `\\c{A}{${say(L('Fläche', 'Area'))} · ${shown() || solve ? N(kb * kb, 2) : N(f, 1)}}`, { size: fs(12.5, 11.5), border: withAlpha(col.area(), 0.5) });
        return false;
      }
      return drawBody(P.p2, BODIES.w, kb, now, dt, k, { list: null, title: `\\c{V}{${say(L('Würfel', 'Cube'))}: k = ${shown() || solve ? N(kb, 2) : '?'}}`, counter: `\\c{V}{${say(L('Volumen', 'Volume'))} · ${shown() || solve ? N(kb ** 3, 2) : N(f, 1)}}`, dims: false });
    }

    /* ---------- Pizza ---------- */
    const topping = (() => {
      const rnd = seededRandom(17);
      const salami: [number, number, number][] = [];
      while (salami.length < 9) {
        const a = rnd() * TAU;
        const r = Math.sqrt(rnd()) * 0.66;
        const q: [number, number, number] = [Math.cos(a) * r, Math.sin(a) * r, 0.13 + rnd() * 0.03];
        if (salami.every((s) => Math.hypot(s[0] - q[0], s[1] - q[1]) > 0.3)) salami.push(q);
      }
      const herbs = Array.from({ length: 26 }, () => {
        const a = rnd() * TAU;
        const r = Math.sqrt(rnd()) * 0.78;
        return [Math.cos(a) * r, Math.sin(a) * r, rnd() * TAU] as [number, number, number];
      });
      return { salami, herbs };
    })();
    function drawPizzaDisc(c: Px, r: number, alpha = 1): void {
      const g = surface.g;
      const dark = th().dark;
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      const crust = g.createRadialGradient(c[0] - r * 0.2, c[1] - r * 0.25, r * 0.6, c[0], c[1], r);
      crust.addColorStop(0, dark ? '#c98d48' : '#e9b46c');
      crust.addColorStop(1, dark ? '#8e5a26' : '#b8722f');
      g.fillStyle = crust;
      g.beginPath();
      g.arc(c[0], c[1], r, 0, TAU);
      g.fill();
      g.restore();
      const sauce = g.createRadialGradient(c[0], c[1], r * 0.2, c[0], c[1], r * 0.86);
      sauce.addColorStop(0, dark ? '#b8432b' : '#e0573a');
      sauce.addColorStop(1, dark ? '#9a3322' : '#c9442b');
      g.fillStyle = sauce;
      g.beginPath();
      g.arc(c[0], c[1], r * 0.86, 0, TAU);
      g.fill();
      // Käse
      g.fillStyle = dark ? 'rgba(236,201,110,0.85)' : 'rgba(250,216,120,0.92)';
      g.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * TAU;
        const rr = r * (0.74 + 0.06 * Math.sin(a * 5) + 0.03 * Math.sin(a * 11 + 1));
        if (i) g.lineTo(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr);
        else g.moveTo(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      for (const [x, y, s] of topping.salami) {
        const q: Px = [c[0] + x * r, c[1] + y * r];
        const sg = g.createRadialGradient(q[0] - s * r * 0.3, q[1] - s * r * 0.3, 1, q[0], q[1], s * r);
        sg.addColorStop(0, dark ? '#a8473c' : '#d0574a');
        sg.addColorStop(1, dark ? '#7a2a24' : '#9e3027');
        g.fillStyle = sg;
        g.beginPath();
        g.arc(q[0], q[1], s * r, 0, TAU);
        g.fill();
      }
      g.fillStyle = dark ? '#3f7a35' : '#4f9a3f';
      for (const [x, y, a] of topping.herbs) {
        g.save();
        g.translate(c[0] + x * r, c[1] + y * r);
        g.rotate(a);
        g.beginPath();
        g.ellipse(0, 0, Math.max(1.2, r * 0.035), Math.max(0.6, r * 0.015), 0, 0, TAU);
        g.fill();
        g.restore();
      }
      g.restore();
    }
    const CUT_END = 4200;
    function drawPizza(now: number, k: Intro): void {
      const R = panels('pizza').p1;
      const g = surface.g;
      const theme = th();
      // Holzbrett-Fläche
      g.save();
      g.globalAlpha *= k.panel;
      paper(R, col.orig());
      const d1 = D1.v;
      const d2 = D2.v;
      const pad = fs(26, 16);
      const top = R.y + 56;
      const bottom = R.y + R.h - fs(70, 62);
      // Maßstab nach dem größeren Durchmesser; beim Ziehen fest (PDM), damit der Rand unter dem Zeiger bleibt
      const dm = PDM.v;
      const s = Math.min((R.w - 3 * pad) / (2 * dm), (bottom - top) / dm);
      const base = bottom - (bottom - top - dm * s) * 0.5;
      const c1: Px = [R.x + R.w / 2 - pad / 2 - (dm * s) / 2, base - (d1 * s) / 2];
      const c2: Px = [R.x + R.w / 2 + pad / 2 + (dm * s) / 2, base - (d2 * s) / 2];
      geo.pizza = { c1, c2, s, d1Max: (2 * (c1[0] - R.x - 8)) / s, d2Max: (2 * (R.x + R.w - 8 - c2[0])) / s };
      drawPizzaDisc(c1, (d1 * s) / 2);
      drawPizzaDisc(c2, (d2 * s) / 2);
      // Aufteilen: Sektoren der größeren Pizza mit der Fläche der kleineren
      const bigIs2 = d2 >= d1;
      const cb = bigIs2 ? c2 : c1;
      const cs = bigIs2 ? c1 : c2;
      const rb = (Math.max(d1, d2) * s) / 2;
      const rs = (Math.min(d1, d2) * s) / 2;
      const m = Math.max(d1, d2) / Math.min(d1, d2);
      const total = m * m;
      const nS = Math.ceil(total - 1e-9);
      const tt = cut ? now - cut.t0 : Infinity;
      const stag = clamp(2600 / Math.max(1, nS), 300, 800);
      let count = 0;
      for (let i = 0; i < nS; i++) {
        const q = tt === Infinity ? 1 : clamp01((tt - 300 - i * stag) / 600);
        if (q <= 0) continue;
        const frac = Math.min(1, total - i);
        if (q >= 0.999) count += frac;
        const a0 = (TAU * i) / total - Math.PI / 2;
        const a1 = (TAU * (i + frac)) / total - Math.PI / 2;
        const e = ease.outCubic(q);
        // Sektor fliegt von der kleinen Pizza zu seinem Platz
        const mid = (a0 + a1) / 2;
        const cx = lerp(cs[0], cb[0], e);
        const cy = lerp(cs[1], cb[1], e);
        const rr = lerp(rs, rb, e);
        g.save();
        g.globalAlpha *= Math.min(1, q * 3);
        g.fillStyle = withAlpha(col.area(), i % 2 === 0 ? 0.3 : 0.16);
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, rr, a0, a1);
        g.closePath();
        g.fill();
        g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.85)' : '#ffffff';
        g.lineWidth = 2.4;
        g.stroke();
        g.strokeStyle = col.area();
        g.lineWidth = 1.2;
        g.stroke();
        if (q >= 0.999 && rb * Math.min(1, (a1 - a0) / 1.2) > 30) {
          const lx = cb[0] + Math.cos(mid) * rb * 0.55;
          const ly = cb[1] + Math.sin(mid) * rb * 0.55;
          fpill(lx, ly, frac < 0.999 ? `\\c{A}{${N(frac, 2)}}` : `\\c{A}{${i + 1}}`, { size: fs(11.5, 11) });
        }
        g.restore();
      }
      // Maße
      const dl = (c: Px, d: number, lab: string, color: string) => dimLine([c[0] - (d * s) / 2, base + 16], [c[0] + (d * s) / 2, base + 16], color, lab, { bounds: R });
      dl(c1, d1, `\\c{o}{d = ${N(p.d1, 0)} cm}`, col.orig());
      dl(c2, d2, `\\c{A}{d = ${N(p.d2, 0)} cm}`, col.area());
      g.restore();
      panelTitle(R, say(L('Wie viel mehr Pizza?', 'How much more pizza?')), col.area(), k.panel);
      const ok = shown() || cut !== null;
      const cnt = cut && tt < CUT_END ? count : total;
      fpill(R.x + R.w / 2, R.y + R.h - 20, `\\c{A}{${bigIs2 ? '1 × ' : ''}${say(L('große Pizza', 'large pizza'))}} = ${ok ? N(cnt, 2) : '?'} × \\c{o}{${say(L('kleine Pizza', 'small pizza'))}}`, { size: fs(13, 11.5), border: withAlpha(col.area(), 0.55), maxW: R.w - 30 });
      handleDot([c1[0] + (d1 * s) / 2, c1[1]], col.orig(), 'd1', k.panel);
      handleDot([c2[0] + (d2 * s) / 2, c2[1]], col.area(), 'd2', k.panel);
    }

    /* ---------- Modellauto ---------- */
    let redCar: { src: HTMLImageElement; c: HTMLCanvasElement } | null = null;
    /**
     * Autofoto mit rotem statt blauem Lack – passend zur Ersatzgrafik und zum Streifen des Farbeimers.
     * Nur kräftig blaue Pixel bekommen einen anderen Farbton (Drehung wie CSS hue-rotate);
     * Reifen, Felgen, Scheiben und Lichter bleiben, Helligkeit und Glanz ebenso.
     */
    function carPhoto(): HTMLCanvasElement | null {
      const img = ctx.images.get('car');
      if (!img) return null;
      if (redCar?.src === img) return redCar.c;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const { canvas, g: o } = offscreenCanvas(w, h, 1);
      o.drawImage(img, 0, 0, w, h);
      try {
        const d = o.getImageData(0, 0, w, h);
        const px = d.data;
        const t = (138 * Math.PI) / 180;
        const c = Math.cos(t);
        const sn = Math.sin(t);
        const m = [
          0.213 + 0.787 * c - 0.213 * sn, 0.715 - 0.715 * c - 0.715 * sn, 0.072 - 0.072 * c + 0.928 * sn,
          0.213 - 0.213 * c + 0.143 * sn, 0.715 + 0.285 * c + 0.14 * sn, 0.072 - 0.072 * c - 0.283 * sn,
          0.213 - 0.213 * c - 0.787 * sn, 0.715 - 0.715 * c + 0.715 * sn, 0.072 + 0.928 * c + 0.072 * sn,
        ] as const;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i]!;
          const gg = px[i + 1]!;
          const b = px[i + 2]!;
          if (px[i + 3] === 0 || b <= r) continue;
          const mx = Math.max(r, gg, b);
          const sat = mx > 0 ? (mx - Math.min(r, gg, b)) / mx : 0;
          const f = clamp01((sat - 0.25) / 0.2);
          if (f <= 0) continue;
          px[i] = r + (m[0] * r + m[1] * gg + m[2] * b - r) * f;
          px[i + 1] = gg + (m[3] * r + m[4] * gg + m[5] * b - gg) * f;
          px[i + 2] = b + (m[6] * r + m[7] * gg + m[8] * b - b) * f;
        }
        o.putImageData(d, 0, 0);
      } catch {
        // Pixel nicht lesbar: Foto unverändert verwenden
      }
      redCar = { src: img, c: canvas };
      return canvas;
    }

    function drawCar(x: number, yG: number, len: number, alpha = 1, detail = true): void {
      const g = surface.g;
      const dark = th().dark;
      if (len < 2) return;
      const h = len * 0.3;
      const wr = len * 0.085;
      g.save();
      g.globalAlpha *= alpha;
      const photo = carPhoto();
      if (photo) {
        // Foto: Länge Stoßstange bis Stoßstange = len, Reifen auf der Bodenlinie
        const ph = (len * photo.height) / photo.width;
        g.fillStyle = dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
        g.beginPath();
        g.ellipse(x + len / 2, yG + 1, len * 0.47, Math.max(1, len * 0.025), 0, 0, TAU);
        g.fill();
        // Reifen-Unterkante liegt bei 684 von 686 Bildzeilen
        g.drawImage(scaledSprite(photo, len, ph, surface.dpr), x, yG - ph * (684 / 686), len, ph);
        g.restore();
        return;
      }
      // Schatten
      g.fillStyle = dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
      g.beginPath();
      g.ellipse(x + len / 2, yG + 1, len * 0.5, Math.max(1, len * 0.03), 0, 0, TAU);
      g.fill();
      // Karosserie
      const body = g.createLinearGradient(0, yG - h, 0, yG);
      body.addColorStop(0, dark ? '#d9615a' : '#e8534b');
      body.addColorStop(1, dark ? '#8f2a26' : '#b5302a');
      g.fillStyle = body;
      g.beginPath();
      g.moveTo(x + len * 0.02, yG - wr * 0.9);
      g.lineTo(x + len * 0.02, yG - h * 0.5);
      g.quadraticCurveTo(x + len * 0.04, yG - h * 0.6, x + len * 0.2, yG - h * 0.62);
      g.lineTo(x + len * 0.33, yG - h * 0.98);
      g.quadraticCurveTo(x + len * 0.36, yG - h, x + len * 0.42, yG - h);
      g.lineTo(x + len * 0.66, yG - h);
      g.quadraticCurveTo(x + len * 0.7, yG - h, x + len * 0.73, yG - h * 0.95);
      g.lineTo(x + len * 0.83, yG - h * 0.62);
      g.quadraticCurveTo(x + len * 0.97, yG - h * 0.58, x + len * 0.985, yG - h * 0.42);
      g.lineTo(x + len * 0.985, yG - wr * 0.9);
      g.closePath();
      g.fill();
      if (detail && len > 40) {
        // Fenster
        g.fillStyle = dark ? 'rgba(170,205,235,0.75)' : 'rgba(205,230,250,0.95)';
        g.beginPath();
        g.moveTo(x + len * 0.24, yG - h * 0.62);
        g.lineTo(x + len * 0.35, yG - h * 0.92);
        g.lineTo(x + len * 0.52, yG - h * 0.92);
        g.lineTo(x + len * 0.52, yG - h * 0.62);
        g.closePath();
        g.moveTo(x + len * 0.55, yG - h * 0.62);
        g.lineTo(x + len * 0.55, yG - h * 0.92);
        g.lineTo(x + len * 0.68, yG - h * 0.92);
        g.lineTo(x + len * 0.79, yG - h * 0.62);
        g.closePath();
        g.fill();
        // Lichter
        g.fillStyle = '#ffe08a';
        g.fillRect(x + len * 0.955, yG - h * 0.52, len * 0.025, h * 0.08);
        g.fillStyle = '#ffb3a8';
        g.fillRect(x + len * 0.025, yG - h * 0.48, len * 0.02, h * 0.08);
      }
      // Räder
      for (const wx of [0.22, 0.78]) {
        g.fillStyle = dark ? '#0d1117' : '#23272e';
        g.beginPath();
        g.arc(x + len * wx, yG - wr, wr, 0, TAU);
        g.fill();
        if (detail && len > 30) {
          g.fillStyle = dark ? '#8a93a3' : '#c3cad4';
          g.beginPath();
          g.arc(x + len * wx, yG - wr, wr * 0.5, 0, TAU);
          g.fill();
        }
      }
      g.restore();
    }
    const PAINT_END = 3800;
    function drawModell(now: number, k: Intro): void {
      const P = panels('modell');
      const g = surface.g;
      const theme = th();
      const R = P.p1;
      const m = MM.v;
      paper(R, col.orig());
      const pad = fs(24, 14);
      const s = Math.min((R.w - 2 * pad) * 0.66 / CAR_LEN, (R.h - 110) / (CAR_LEN * 0.3));
      const yG = R.y + R.h - fs(52, 46);
      const xCar = R.x + pad;
      const lenPx = CAR_LEN * s;
      g.save();
      g.globalAlpha *= k.panel;
      // Boden
      line([R.x + 10, yG + 1], [R.x + R.w - 10, yG + 1], withAlpha(theme.muted, 0.5), 1.5);
      drawCar(xCar, yG, lenPx);
      const mx = xCar + lenPx + (R.x + R.w - pad - xCar - lenPx) / 2 - (lenPx / m) / 2;
      // Griff bei a + lenPx/(2m): Mitte des freien Platzes rechts vom Auto
      geo.car = { a: xCar + lenPx + (R.x + R.w - pad - xCar - lenPx) / 2, lenPx };
      drawCar(mx, yG, lenPx / m, 1, true);
      // Lupenkreis um das Modell
      const mr = Math.max(16, (lenPx / m) * 0.7);
      g.strokeStyle = withAlpha(theme.muted, 0.6);
      g.setLineDash([3, 3]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(mx + lenPx / m / 2, yG - (lenPx / m) * 0.15, mr, 0, TAU);
      g.stroke();
      g.setLineDash([]);
      dimLine([xCar, yG + 16], [xCar + lenPx, yG + 16], col.len(), `\\c{L}{${N(CAR_LEN, 1)} ${M}}`, { bounds: R });
      fpill(mx + lenPx / m / 2, yG - (lenPx / m) * 0.15 - mr - 14, `\\c{L}{${shown() ? `${N((CAR_LEN / p.m) * 100, 1)} cm` : '? cm'}}`, { size: fs(12, 11), bounds: R });
      fpill(mx + lenPx / m / 2, yG + 18, `\\t{${say(L('Modell', 'Model'))}} 1 : ${p.m}`, { size: fs(11.5, 11), color: col.orig(), bounds: R });
      g.restore();
      panelTitle(R, `\\t{${say(L('Auto und Modell', 'Car and model'))}}`, col.orig(), k.panel);
      handleDot([mx + lenPx / m, yG - (lenPx / m) * 0.2], col.orig(), 'car', k.panel);
      // Lack: m² Modelle
      const Q = P.p2;
      paper(Q, col.area());
      const n = Math.round(m);
      const tt = paint ? now - paint.t0 : Infinity;
      const can = { x: Q.x + fs(24, 16), y: Q.y + 50, w: fs(56, 44), h: fs(70, 56) };
      // Farbeimer
      g.save();
      g.globalAlpha *= k.panel;
      const bucketImg = ctx.images.get('bucket');
      if (bucketImg) {
        // Foto des Farbeimers (roter Streifen = Lackfarbe), etwas breiter als die Ersatzgrafik, unten bündig
        const bw = can.w * 1.12;
        const bh = (bw * bucketImg.naturalHeight) / bucketImg.naturalWidth;
        g.drawImage(scaledSprite(bucketImg, bw, bh, surface.dpr), can.x + can.w / 2 - bw / 2, can.y + can.h - bh, bw, bh);
      }
      const bucketGA = g.globalAlpha;
      if (bucketImg) g.globalAlpha = 0;
      const cg = g.createLinearGradient(can.x, 0, can.x + can.w, 0);
      cg.addColorStop(0, theme.dark ? '#5d6675' : '#c7cdd6');
      cg.addColorStop(0.5, theme.dark ? '#8a93a3' : '#eef1f5');
      cg.addColorStop(1, theme.dark ? '#4a515e' : '#aab2bd');
      g.fillStyle = cg;
      roundRect(g, can.x, can.y + 6, can.w, can.h - 6, 5);
      g.fill();
      g.fillStyle = theme.dark ? '#c94b44' : '#e8534b';
      g.fillRect(can.x, can.y + can.h * 0.38, can.w, can.h * 0.32);
      g.fillStyle = theme.dark ? '#3c434f' : '#9aa3ae';
      g.beginPath();
      g.ellipse(can.x + can.w / 2, can.y + 6, can.w / 2, 5, 0, 0, TAU);
      g.fill();
      g.strokeStyle = theme.dark ? '#8a93a3' : '#6b7480';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(can.x + can.w / 2, can.y + 6, can.w * 0.42, Math.PI, 0);
      g.stroke();
      g.globalAlpha = bucketGA;
      g.restore();
      const cl = wrapText(say(L('Lack für 1 Auto', 'Paint for 1 car')), can.w + 30, `600 ${fs(11.5, 11)}px ${theme.font}`);
      g.font = `600 ${fs(11.5, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      cl.forEach((ln, i) => g.fillText(ln, can.x + can.w / 2, can.y + can.h + 6 + i * 14));
      // Pfeil
      const gx0 = can.x + can.w + fs(34, 22);
      line([can.x + can.w + 6, can.y + can.h / 2], [gx0 - 8, can.y + can.h / 2], theme.muted, 1.6);
      arrowHead([gx0 - 6, can.y + can.h / 2], [1, 0], theme.muted, 7);
      const gw = Q.x + Q.w - fs(18, 12) - gx0;
      const gh = Q.y + Q.h - fs(46, 42) - (Q.y + 44);
      const total = n * n;
      // Raster so wählen, dass die Modelle (Seitenverhältnis 2 : 1) möglichst groß werden
      let cols = 1;
      let cw = 0;
      for (let c = 1; c <= total; c++) {
        const rows = Math.ceil(total / c);
        const w = Math.min(gw / c, (2 * gh) / rows);
        if (w > cw) {
          cw = w;
          cols = c;
        }
      }
      const rowsN = Math.ceil(total / cols);
      const ch = cw / 2;
      const gx = gx0 + (gw - cw * cols) / 2;
      const gy = Q.y + 44 + (gh - ch * rowsN) / 2;
      const stag = Math.min(260, 2800 / total);
      let cnt = 0;
      const red = theme.dark ? '#d9615a' : '#e8534b';
      const tyre = theme.dark ? '#0d1117' : '#23272e';
      for (let i = 0; i < total; i++) {
        const qc = tt === Infinity ? 1 : clamp01((tt - 200 - i * stag) / 380);
        if (qc <= 0) continue;
        if (qc >= 0.999) cnt++;
        const pop = lerp(0.5, 1, ease.outBack(qc));
        const cx = gx + (i % cols) * cw + cw / 2;
        const cy = gy + Math.floor(i / cols) * ch + ch / 2;
        const w = cw * 0.84 * pop;
        g.save();
        g.globalAlpha *= Math.min(1, qc * 3);
        if (cw >= 34) drawCar(cx - w / 2, cy + w * 0.17, w, 1, cw >= 44);
        else {
          // kleines Auto: Karosserie, Dach, Räder
          g.fillStyle = red;
          roundRect(g, cx - w / 2, cy - w * 0.05, w, w * 0.2, Math.min(2.5, w * 0.08));
          g.fill();
          roundRect(g, cx - w * 0.24, cy - w * 0.2, w * 0.46, w * 0.18, Math.min(2.5, w * 0.08));
          g.fill();
          g.fillStyle = tyre;
          for (const wx of [-0.28, 0.28]) {
            g.beginPath();
            g.arc(cx + wx * w, cy + w * 0.15, Math.max(1, w * 0.08), 0, TAU);
            g.fill();
          }
        }
        g.restore();
      }
      const ok = shown() || paint !== null;
      fpill(Q.x + Q.w / 2, Q.y + Q.h - 20, `\\c{o}{\\t{${say(L('Lack für 1 Auto', 'paint for 1 car'))}}} = ${ok ? big(paint && tt < PAINT_END ? cnt : total, 0) : '?'} × \\c{A}{\\t{${say(L('Lack für 1 Modell', 'paint for 1 model'))}}}`, { size: fs(12.5, 11), border: withAlpha(col.area(), 0.55), maxW: Q.w - 30, alpha: k.panel });
      panelTitle(Q, `\\c{A}{${say(L('Lackfläche · k²', 'Paint area · k²'))}}`, col.area(), k.panel);
    }

    /* ---------- Oberfläche und Volumen ---------- */
    const SPLIT_GAP = 0.55;
    function drawOv(dt: number, k: Intro): boolean {
      const P = panels('ov');
      const R = P.p1;
      const g = surface.g;
      paper(R, col.k());
      const pad = fs(16, 12);
      const Rp = { x: R.x + pad + 24, y: R.y + 54, w: R.w - 2 * pad - 38, h: R.h - 54 - 34 };
      const ax = axes(Rp, [0, 5.5], [0, 13], { xLabel: '\\c{m}{a \\t{in cm}}', yLabel: `\\c{k}{O : V}`, alpha: k.panel });
      geo.ov = { x0: Rp.x, y0: Rp.y + Rp.h, sx: Rp.w / 5.5, sy: Rp.h / 13 };
      g.save();
      g.beginPath();
      g.rect(Rp.x - 2, Rp.y - 2, Rp.w + 14, Rp.h + 4);
      g.clip();
      curve(ax, (x) => 6 / x, col.k(), 2.8, 0.45, 5.5, k.panel);
      g.restore();
      for (const a of [1, 2, 3]) {
        const q: Px = [ax.X(a), ax.Y(6 / a)];
        chartDot(q, withAlpha(col.k(), 0.6), 3.5);
        fpill(q[0] + 8, q[1] - 12, `\\c{m}{${6 / a}}`, { align: 'left', size: 11 });
      }
      const av = A.v;
      const q: Px = [ax.X(av), ax.Y(6 / av)];
      line([q[0], q[1]], [q[0], Rp.y + Rp.h], withAlpha(col.k(), 0.5), 1.3, { dash: [3, 3] });
      fpill(q[0] + 12, q[1] - 22, shown() ? `\\c{k}{\\f{6}{a} = ${N(6 / av, 2)}}` : '\\c{k}{\\f{6}{a} = ?}', { align: 'left', size: fs(12.5, 11.5), border: withAlpha(col.k(), 0.6), bounds: R });
      handleDot(q, col.k(), 'ov', k.panel);
      // Hinweise an den Enden
      g.font = `600 ${fs(11.5, 11)}px ${th().font}`;
      g.fillStyle = th().muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      if (Rp.h >= 150) {
        g.fillText(say(L('groß: wenig Oberfläche je cm³', 'large: little surface per cm³')), Rp.x + Rp.w, ax.Y(9));
        g.textAlign = 'left';
        g.fillText(say(L('klein: viel Oberfläche je cm³', 'small: much surface per cm³')), ax.X(1.15), ax.Y(11.2));
      }
      panelTitle(R, `${say(L('Oberfläche zu Volumen', 'Surface to volume'))}`, col.k(), k.panel);
      // 3D: Würfel, auf Wunsch zerteilt
      const Q = P.p2;
      const e = splitEdge(p.a);
      const per = Math.round(p.a / e);
      const sp = SPLIT.v;
      const span = av + (per - 1) * SPLIT_GAP * e * sp * 1.0;
      const goal = { target: [span / 2, span / 2, span * 0.45] as Vec3, radius: 0.5 * Math.hypot(span, span, span) * 1.05 + 0.3 };
      const moving = frameTo(goal, dt);
      view.setScene({ target: frame!.target, radius: frame!.radius, anchor: [0.5, 0.56] });
      paper(Q, col.vol());
      g.save();
      g.globalAlpha *= k.panel;
      view.begin();
      const cam = view.camera.position;
      view.grid({ min: [-1, -1], max: [span + 1, span + 1], step: 1, color: th().gridMinor, fade: true });
      view.shadow(
        [
          [0, 0, 0],
          [span, 0, 0],
          [span, span, 0],
          [0, span, 0],
        ],
        { alpha: 0.16, blur: 18 },
      );
      const ee = av / per;
      for (let iz = 0; iz < per; iz++)
        for (let iy = 0; iy < per; iy++)
          for (let ix = 0; ix < per; ix++) {
            const gap = SPLIT_GAP * e * sp;
            const x0 = ix * (ee + gap);
            const y0 = iy * (ee + gap);
            const z0 = iz * (ee + gap);
            const color0 = (ix + iy + iz) % 2 === 0 ? col.vol() : mixColor(col.vol(), '#ffffff', th().dark ? 0.12 : 0.24);
            const color = th().dark ? color0 : mixColor(color0, '#ffffff', 0.12);
            const stroke = mixColor(color, th().dark ? '#000000' : '#0b1220', th().dark ? 0.5 : 0.4);
            for (const fd of FACE_DIRS) {
              const pos = [ix, iy, iz];
              const nb = pos[fd.ax]! + fd.d * (fd.ax === 0 ? -1 : 1);
              if (sp < 0.02 && nb >= 0 && nb < per) continue;
              // Außenflächen grün tönen (Oberfläche!)
              const pts = boxFace(x0, y0, z0, x0 + ee, y0 + ee, z0 + ee, fd.n);
              if (vec3.dot(fd.n, vec3.sub(cam, vec3.centroid(pts))) <= 0) continue;
              const outer = nb < 0 || nb >= per;
              view.face(pts, { color: outer || sp < 0.02 ? color : mixColor(col.area(), '#ffffff', th().dark ? 0 : 0.2), alpha: 1, stroke, width: 1, gloss: 0.12 });
            }
          }
      if (sp < 0.02) {
        const lab = (a: Vec3, b: Vec3, txt: string, off: [number, number]) => view.label(vec3.lerp(a, b, 0.5), txt, { color: col.vol(), size: fs(12, 11), weight: '700', align: 'center', baseline: 'middle', offset: off, halo: true });
        lab([av, 0, 0], [av, av, 0], `a = ${N(p.a, 1)} cm`, [0, 14]);
      }
      view.end();
      g.restore();
      const s = splitCube(p.a, e);
      const O = lerp(s.O0, s.O1, clamp01(sp));
      const ok = shown() || splitAnim !== null || revealed;
      rotateHint(Q, k.panel);
      panelTitle(Q, `\\c{V}{${say(L('Würfel', 'Cube'))}}${sp > 0.02 ? ` \\c{m}{→ ${s.n} ${say(L('Teile', 'pieces'))}}` : ''}`, col.vol(), k.panel);
      fpill(Q.x + Q.w / 2, Q.y + Q.h - 20, `\\c{A}{O = ${ok ? N(O, 2) : '?'} cm²}   \\c{V}{V = ${ok ? N(s.V, 3) : '?'} cm³}`, { size: fs(12.5, 11), border: withAlpha(col.area(), 0.5), maxW: Q.w - 30, alpha: k.panel });
      return moving;
    }

    /* =====================================================================
     * Ergebnisse
     * ===================================================================== */
    /** Stand von shown() beim letzten Füllen der Ergebnisliste. */
    let readoutShown = shown();

    function updateReadouts(): void {
      for (const key of ['len', 'area', 'surf', 'vol', 'giv', 'res']) ctx.readout(key, null);
      const m = mode();
      // Ergebnisse erst, wenn sie auch im Bild stehen („Ergebnisse zeigen“ oder nach der Animation)
      readoutShown = shown();
      const open = readoutShown;
      const out = (key: string, value: { html: string }) => ctx.readout(key, open ? value : null);
      const sup = (s: string) => `<sup>${s}</sup>`;
      if (m === 'grow') {
        const k = p.k;
        const spec = FIGS[fig()];
        const body = BODIES[obj()];
        const exactA = fig() === 'q' || fig() === 'r';
        const fA = (x: number) => `${exactA ? '' : '≈ '}${N(x, 2)}`;
        out('len', { html: `${N(spec.len)} cm → <strong>${N(spec.len * k)} cm</strong> (· <var>k</var> = ${N(k, 1)})` });
        out('area', { html: `${fA(spec.area)} cm² → <strong>${fA(spec.area * k * k)} cm²</strong> (· <var>k</var>${sup('2')} = ${N(k, 1)}${sup('2')} = ${facH(k * k, 2)})` });
        out('surf', { html: `${N(boxSurface(body))} cm² → <strong>${N(boxSurface(body) * k * k)} cm²</strong> (· ${facH(k * k, 2)})` });
        out('vol', { html: `${N(boxVolume(body))} cm³ → <strong>${N(boxVolume(body) * k ** 3, 3)} cm³</strong> (· <var>k</var>${sup('3')} = ${N(k, 1)}${sup('3')} = ${facH(k ** 3, 3)})` });
      } else if (m === 'back') {
        const d = dimB();
        const kk = kFromFactor(p.f, d);
        const ex = exactRoot(p.f, d);
        ctx.readout('giv', { html: `${d === 2 ? say(L('Flächeninhalt', 'Area')) : say(L('Volumen', 'Volume'))} · ${N(p.f, 1)}` });
        out('res', { html: `<var>k</var>${sup(String(d))} = ${N(p.f, 1)} ⇒ <var>k</var> = ${d === 2 ? '√' : '∛'}${N(p.f, 1)} ${ex !== null ? '=' : '≈'} <strong>${N(kk, 3)}</strong>` });
      } else if (m === 'pizza') {
        ctx.readout('giv', { html: `<var>d</var><sub>1</sub> = ${p.d1} cm, <var>d</var><sub>2</sub> = ${p.d2} cm` });
        out('res', { html: `<var>k</var> = ${p.d2} : ${p.d1} ${eq(p.d2 / p.d1, 3)} ${N(p.d2 / p.d1, 3)} ⇒ ${say(L('Fläche', 'area'))} · <var>k</var>${sup('2')} ${eq(pizzaFactor(p.d1, p.d2), 3)} <strong>${N(pizzaFactor(p.d1, p.d2), 3)}</strong> (${big(pizzaArea(p.d1), 0)} cm² → ${big(pizzaArea(p.d2), 0)} cm²)` });
      } else if (m === 'modell') {
        const mm = p.m;
        ctx.readout('giv', { html: `${say(L('Maßstab', 'Scale'))} 1 : ${mm}, ${say(L('Autolänge', 'car length'))} ${N(CAR_LEN, 1)} m` });
        out('res', {
          html: `${say(L('Länge', 'Length'))} · <span class="frac"><span>1</span><span>${mm}</span></span> (${N((CAR_LEN / mm) * 100, 1)} cm), ${say(L('Lack', 'paint'))} · <span class="frac"><span>1</span><span>${big(mm * mm, 0)}</span></span>, ${say(L('Volumen/Masse', 'volume/mass'))} · <span class="frac"><span>1</span><span>${big(mm ** 3, 0)}</span></span>`,
        });
      } else {
        const r = cubeOV(p.a);
        ctx.readout('giv', { html: `<var>a</var> = ${N(p.a, 1)} cm` });
        out('res', { html: `<var>O</var> = 6<var>a</var>${sup('2')} = ${N(r.O)} cm², <var>V</var> = <var>a</var>${sup('3')} = ${N(r.V, 3)} cm³, <var>O</var> : <var>V</var> = <span class="frac"><span>6</span><span><var>a</var></span></span> ${eq(r.ratio)} <strong>${N(r.ratio)}</strong>` });
      }
    }

    /* =====================================================================
     * Rendern
     * ===================================================================== */
    function drawMode(m: Mode, now: number, dt: number, k: Intro, alpha: number): boolean {
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      let moving = false;
      if (m === 'grow') moving = drawGrow(now, dt, k);
      else if (m === 'back') moving = drawBack(now, dt, k);
      else if (m === 'pizza') drawPizza(now, k);
      else if (m === 'modell') drawModell(now, k);
      else moving = drawOv(dt, k);
      g.restore();
      return moving;
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      YMAX.follow(growYMax(K.goal), 0.25);
      // Maßstäbe erst nach dem Loslassen neu einpassen (sonst läuft der Griff dem Zeiger davon)
      if (!dragging()) {
        const bt = backTargets();
        if (Math.abs(BX.goal - bt.x) > 1e-9) BX.follow(bt.x, 0.25);
        if (Math.abs(BY.goal - bt.y) > 1e-9) BY.follow(bt.y, 0.25);
        const sp = spanOf(K.goal);
        if (Math.abs(SPAN.goal - sp) > 1e-9) SPAN.follow(sp, reduced() ? 0 : 0.25);
        if (Math.abs(PDM.goal - pdmOf()) > 1e-9) PDM.follow(pdmOf(), reduced() ? 0 : 0.25);
      }
      for (const c of allChans()) if (c.step(now, dt)) anim = true;
      if (fill && now - fill.t0 > fill.plan.end) {
        fill = null;
        revealed = true;
      }
      if (solve && now - solve.t0 > SOLVE_END + 400) solve = null;
      if (cut && now - cut.t0 > CUT_END) {
        cut = null;
        revealed = true;
      }
      if (paint && now - paint.t0 > PAINT_END + 300) {
        paint = null;
        revealed = true;
      }
      if (splitAnim && !SPLIT.gliding) splitAnim = null;
      // Ergebnisliste nachziehen, sobald die Ergebnisse im Bild stehen
      if (shown() !== readoutShown) updateReadouts();
      if (fill || solve || cut || paint || splitAnim || intro !== null) anim = true;
      const k = introState(now);
      computeNarrowMain(now);
      const R = regions();
      view.resize();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      hits = [];
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      let fadeIn = 1;
      if (sceneFade) {
        const t = (now - sceneFade.t0) / 450;
        if (t >= 1 || sceneFade.from === mode()) sceneFade = null;
        else {
          fadeIn = ease.outCubic(clamp01(t));
          anim = true;
        }
      }
      // Beim Wechsel: alte Szene kurz ausblenden (ohne 3D, die gehört der neuen Szene)
      if (sceneFade && fadeIn < 1 && sceneFade.from !== 'grow' && sceneFade.from !== 'ov' && sceneFade.from !== 'back') {
        drawMode(sceneFade.from, now, dt, k, 1 - fadeIn);
        hits = [];
      }
      if (drawMode(mode(), now, dt, k, fadeIn)) anim = true;
      g.restore();
      drawColumn(R.col, now, k);
      if (cardFade !== null) anim = true;
      if (anim) ctx.requestRender();
    }

    function backTargets(): { x: number; y: number } {
      const d = dimB();
      const yTop = Math.max(p.f * 1.4, 2);
      return { x: Math.max(kFromFactor(yTop, d) * 1.04, 1.6), y: yTop };
    }

    /* =====================================================================
     * Übergänge
     * ===================================================================== */
    function retarget(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const targets: [Chan, number][] = [
        [K, p.k],
        [D1, p.d1],
        [D2, p.d2],
        [MM, p.m],
        [A, p.a],
      ];
      targets.forEach(([c, v], i) => {
        if (instant) c.jump(v);
        else if (dragging()) c.follow(v, 0.06);
        else if (source === 'replace') c.glide(v, 850, i * 40, now);
        else if (Math.abs(c.goal - v) > 1e-12) c.follow(v, 0.18);
      });
      const kb = kFromFactor(p.f, dimB());
      if (instant) KB.jump(kb);
      else if (!solve) KB.follow(kb, dragging() ? 0.06 : 0.2);
      if (instant) {
        YMAX.jump(growYMax(p.k));
        SPAN.jump(spanOf(p.k));
        PDM.jump(pdmOf());
        const bt = backTargets();
        BX.jump(bt.x);
        BY.jump(bt.y);
      }
    }
    function startSolve(now: number, delay = 0): void {
      if (reduced()) return;
      solve = { t0: now + delay };
      KB.jump(dimB() === 2 ? Math.min(1, kFromFactor(p.f, 2)) : Math.min(1, kFromFactor(p.f, 3)));
      KB.glide(kFromFactor(p.f, dimB()), 1700, delay + 1100, now, ease.inOutCubic);
      revealed = true;
    }
    function startCut(now: number, delay = 0): void {
      if (reduced()) {
        revealed = true;
        return;
      }
      cut = { t0: now + delay };
    }
    function startPaint(now: number, delay = 0): void {
      if (reduced()) {
        revealed = true;
        return;
      }
      paint = { t0: now + delay };
    }
    function startStory(now: number, delay: number): void {
      const m = mode();
      if (m === 'grow') startFill(now, delay);
      else if (m === 'back') startSolve(now, delay);
      else if (m === 'pizza') startCut(now, delay);
      else if (m === 'modell') startPaint(now, delay);
    }
    function stopAll(): void {
      fill = null;
      solve = null;
      cut = null;
      paint = null;
    }

    /* =====================================================================
     * Zeiger
     * ===================================================================== */
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
    const r1 = (v: number) => Math.round(v * 10) / 10;
    function dragTo(id: DragId, px: number, py: number): void {
      lastDrag = performance.now();
      if (id === 'band') {
        const b = geo.band;
        const len = (Math.min(px, b.xMax) - b.x0) / b.s / b.L0;
        ctx.set({ k: clamp(r1(len), 0.2, 4) });
      } else if (id === 'area') {
        const a = geo.area;
        const qx = clamp(px, a.box.x, a.box.x + a.box.w);
        const qy = clamp(py, a.box.y, a.box.y + a.box.h);
        const t = ((qx - a.ax) * a.ux + (qy - a.ay) * a.uy) / a.len1;
        ctx.set({ k: clamp(r1(t), 0.2, 4) });
      } else if (id === 'fline') {
        const f = (geo.fline.y0 - py) / geo.fline.yScale;
        ctx.set({ f: clamp(Math.round(Math.min(f, geo.fline.fMax) * 10) / 10, 0.1, 64) });
      } else if (id === 'd1' || id === 'd2') {
        const pz = geo.pizza;
        const c = id === 'd1' ? pz.c1 : pz.c2;
        const d = Math.min((2 * Math.abs(px - c[0])) / pz.s, id === 'd1' ? pz.d1Max : pz.d2Max);
        ctx.set({ [id]: clamp(Math.round(d), 10, 40) });
      } else if (id === 'car') {
        const cr = geo.car;
        ctx.set({ m: clamp(Math.round(cr.lenPx / (2 * Math.max(1, px - cr.a))), 2, 20) });
      } else if (id === 'ov') {
        const o = geo.ov;
        ctx.set({ a: clamp(Math.round(((px - o.x0) / o.sx) * 2) / 2, 0.5, 5) });
      }
    }
    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const id = hitAt(pt.px, pt.py);
        if (!id) return false;
        drag = id;
        stopAll();
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
        const real = [...changed].filter((key) => key !== 'show');
        if ((source === 'input' || source === 'replace') && real.length) {
          stopAll();
          if (!changed.has('mode') || source === 'replace') revealed = false;
          if (changed.has('a') || changed.has('mode') || source === 'replace') {
            SPLIT.jump(0);
            splitAnim = null;
          }
        }
        if (source === 'input' && changed.has('mode')) revealed = false;
        retarget(now, source);
        if (changed.has('mode') && source !== 'init' && m !== prevMode) {
          if (!reduced()) {
            sceneFade = { from: prevMode, t0: now };
            cardFade = now;
            frame = null;
          }
          startStory(now, 450);
        } else if (source === 'replace') startStory(now, 300);
        if (source === 'init') {
          if (!reduced()) {
            intro = now;
            // Aufgabenlinks (show = 0) verraten die Lösung nicht schon beim Laden
            if (p.show) startStory(now, 900);
          }
        }
        prevMode = m;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'fill') startFill(now, 0);
        else if (id === 'solve') {
          KB.jump(1);
          startSolve(now, 0);
        } else if (id === 'cut') startCut(now, 0);
        else if (id === 'paint') startPaint(now, 0);
        else if (id === 'split') {
          const to = SPLIT.goal > 0.5 ? 0 : 1;
          revealed = true;
          if (reduced()) SPLIT.jump(to);
          else {
            SPLIT.glide(to, 1300, 0, now, to ? ease.outBack : ease.inOutCubic);
            splitAnim = { t0: now, to };
          }
        }
        ctx.requestRender();
      },

      resetView: () => view.resetView(false),
      render,
      destroy: () => surface.destroy(),
    };
  },
});
