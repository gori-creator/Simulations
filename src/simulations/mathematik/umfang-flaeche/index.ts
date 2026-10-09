import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  canCut,
  clampCut,
  lArea,
  lDecomposition,
  lPerimeter,
  lPolygon,
  lSides,
  maxAreaRects,
  minPerimeterRects,
  nearestSide,
  niceStep,
  rectArea,
  rectPerimeter,
  rectPolygon,
  rectsWithArea,
  rectsWithPerimeter,
  sideLengths,
  snapToArea,
  snapToPerimeter,
  unitCells,
  walkAt,
  type Box,
  type Method,
  type Pt,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'rechteck' | 'gleichU' | 'gleichA' | 'lform';
const isMode =
  (...m: Mode[]) =>
  (v: Record<string, unknown>) =>
    m.includes(v.mode as Mode);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Größte Seitenlängen bei Rechteck und L-Form (cm). */
const A_MAX = 10;
const B_MAX = 6;
/** Lage der beiden abgewickelten Fadenstücke unter dem Rechteck (in cm, auf Gitterlinien). */
const STRAND_Y = [-3, -4] as const;
/** Innenabstand des Blatts in Pixeln. */
const PAD = 6;

/** Abbildung Blatt (cm, y nach oben) → Zeichenfläche (px). */
interface View {
  cell: number;
  ox: number;
  oy: number;
}

/** Sichtbarer Bereich in cm und Ränder für Beschriftungen in px. */
interface Box4 {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  mL: number;
  mR: number;
  mT: number;
  mB: number;
}

interface Hit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Zuschlag beim Abstandsvergleich (Kanten nachrangig gegenüber Griffen). */
  prio: number;
  cursor: string;
}

/** Ablauf „Auslegen und zählen“. */
interface FillAnim {
  t0: number;
  cells: Pt[];
  /** Rechteck: erste Reihe Stück für Stück, dann ganze Reihen. Sonst einzeln. */
  rows: boolean;
  a: number;
  b: number;
  d1: number;
  t1: number;
  d3: number;
  dg: number;
  total: number;
}

/** Ablauf „Ameise läuft einmal herum“. */
interface WalkAnim {
  t0: number;
  poly: Pt[];
  per: number;
  dur: number;
  total: number;
}

/** Textstück einer Formelzeile: Farbe, kursiv (Variable) oder Schriftstärke. */
interface Seg {
  t: string;
  c?: string;
  v?: boolean;
  w?: number;
}

type Item =
  | { kind: 'title'; text: string }
  | { kind: 'rich'; segs: Seg[]; size: number }
  | { kind: 'big'; segs: Seg[]; size: number }
  | { kind: 'note'; text: string; color?: string }
  | { kind: 'tip'; icon: 'tile' | 'frame' | 'square'; text: string };

interface CardSpec {
  accent?: string;
  tint?: number;
  items: Item[];
  /** Darf gestreckt werden, um die Spalte zu füllen. */
  stretch?: boolean;
}

/**
 * Umfang und Flächeninhalt von Rechtecken (Jahrgangsstufe 5): Rechteck auf
 * Rechenpapier aufziehen, mit Einheitsquadraten auslegen (Reihe für Reihe →
 * A = a · b), eine Ameise einmal herumlaufen lassen und den Rand als Faden
 * abwickeln (U = 2 · (a + b)). Dazu Rechtecke mit gleichem Umfang bzw. gleichem
 * Flächeninhalt im Vergleich und eine L-Form zum Zerlegen und Ergänzen.
 */
export default defineSimulation({
  id: 'umfang-flaeche',
  dragHint: true,
  layout: { aspect: 1.7, aspectNarrow: 0.6 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'rechteck', label: L('Rechteck', 'Rectangle') },
        { value: 'gleichU', label: L('Gleicher Umfang', 'Same perimeter') },
        { value: 'gleichA', label: L('Gleicher Flächeninhalt', 'Same area') },
        { value: 'lform', label: L('L-Form', 'L-shape') },
      ],
      default: 'rechteck',
    },
    { key: 'a', type: 'number', label: L('Länge a', 'Length a'), min: 1, max: A_MAX, step: 1, default: 5, unit: 'cm', visibleIf: isMode('rechteck', 'lform') },
    { key: 'b', type: 'number', label: L('Breite b', 'Width b'), min: 1, max: B_MAX, step: 1, default: 3, unit: 'cm', visibleIf: isMode('rechteck', 'lform') },
    { key: 'c', type: 'number', label: L('Ausschnitt: Breite c', 'Cut-out: width c'), min: 1, max: A_MAX - 1, step: 1, default: 2, unit: 'cm', visibleIf: isMode('lform') },
    { key: 'd', type: 'number', label: L('Ausschnitt: Höhe d', 'Cut-out: height d'), min: 1, max: B_MAX - 1, step: 1, default: 2, unit: 'cm', visibleIf: isMode('lform') },
    {
      key: 'zerl',
      type: 'choice',
      label: L('Flächeninhalt bestimmen', 'Finding the area'),
      options: [
        { value: 'keine', label: L('Ganze Figur', 'Whole shape') },
        { value: 'waag', label: L('Waagerecht zerlegen', 'Split across') },
        { value: 'senk', label: L('Senkrecht zerlegen', 'Split down') },
        { value: 'erg', label: L('Zum Rechteck ergänzen', 'Complete to a rectangle') },
      ],
      default: 'keine',
      visibleIf: isMode('lform'),
    },
    {
      key: 'kanten',
      type: 'boolean',
      label: L('Innere Kanten nach außen schieben', 'Push the inner edges outwards'),
      help: L('Zeigt, warum die L-Form denselben Umfang hat wie das große Rechteck.', 'Shows why the L-shape has the same perimeter as the big rectangle.'),
      default: false,
      visibleIf: isMode('lform'),
    },
    { key: 'u', type: 'number', label: L('Umfang U (fest)', 'Perimeter P (fixed)'), min: 4, max: 24, step: 2, default: 16, unit: 'cm', visibleIf: isMode('gleichU') },
    { key: 'fa', type: 'number', label: L('Flächeninhalt A (fest)', 'Area A (fixed)'), min: 1, max: 24, step: 1, default: 12, unit: 'cm²', visibleIf: isMode('gleichA') },
    {
      key: 'w',
      type: 'number',
      label: L('Länge a des Rechtecks', 'Length a of the rectangle'),
      help: L('Rastet auf die passenden Rechtecke ein – oder die Ecke ziehen.', 'Snaps to the matching rectangles – or drag the corner.'),
      min: 1,
      max: 24,
      step: 1,
      default: 2,
      unit: 'cm',
      visibleIf: isMode('gleichU', 'gleichA'),
    },
    { key: 'tiles', type: 'boolean', group: 'view', label: L('Einheitsquadrate (1 cm²) einzeichnen', 'Draw unit squares (1 cm²)'), default: true },
    { key: 'labels', type: 'boolean', group: 'view', label: L('Seitenlängen beschriften', 'Label the side lengths'), default: true },
    { key: 'faden', type: 'boolean', group: 'view', label: L('Umfang als Faden abwickeln', 'Unroll the perimeter as a string'), default: false, visibleIf: isMode('rechteck') },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Ergebnisse im Bild zeigen', 'Show the results in the picture'),
      help: L('Ausgeschaltet erscheinen Flächeninhalt und Umfang erst nach „Auslegen und zählen“ bzw. „Ameise laufen lassen“.', 'When off, area and perimeter only appear after “Tile and count” or “Let the ant walk”.'),
      default: true,
      visibleIf: isMode('rechteck', 'lform'),
    },
  ],
  actions: [
    { id: 'fill', label: L('Auslegen und zählen', 'Tile and count'), primary: true, visibleIf: isMode('rechteck', 'lform') },
    { id: 'walk', label: L('Ameise laufen lassen', 'Let the ant walk'), visibleIf: isMode('rechteck', 'lform') },
    { id: 'scan', label: L('Alle Rechtecke durchgehen', 'Go through all rectangles'), primary: true, visibleIf: isMode('gleichU', 'gleichA') },
  ],
  readouts: [
    { key: 'fig', label: L('Figur', 'Shape') },
    { key: 'area', label: L('Flächeninhalt', 'Area'), spoiler: true },
    { key: 'per', label: L('Umfang', 'Perimeter'), spoiler: true },
    { key: 'best', label: L('Vergleich', 'Comparison'), spoiler: true },
    { key: 'list', label: L('Alle Rechtecke', 'All rectangles'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Rechteck 5 cm × 3 cm', 'Rectangle 5 cm × 3 cm'), values: {} },
    { id: 'quadrat', label: L('Quadrat', 'Square'), values: { a: 4, b: 4 } },
    { id: 'streifen', label: L('Langer Streifen', 'Long strip'), values: { a: 10, b: 1, faden: true } },
    { id: 'gleichU', label: L('Gleicher Umfang, andere Fläche', 'Same perimeter, different area'), values: { mode: 'gleichU' } },
    { id: 'gleichA', label: L('Gleiche Fläche, anderer Umfang', 'Same area, different perimeter'), values: { mode: 'gleichA' } },
    { id: 'lform', label: L('L-Form zerlegen', 'Splitting an L-shape'), values: { mode: 'lform', a: 6, b: 5, c: 3, d: 2, zerl: 'waag' } },
  ],
  strings: {
    de: {
      canvas: 'Rechenpapier mit einem Rechteck aus Einheitsquadraten, seinen Seitenlängen, seinem Umfang und Flächeninhalt',
      areaTitle: 'Flächeninhalt A',
      perTitle: 'Umfang U',
      tip: 'Merke',
      tipArea: 'Flächeninhalt: Wie viele Einheitsquadrate passen hinein? Einheit cm².',
      tipPer: 'Umfang: Wie lang ist der Rand einmal ganz herum? Einheit cm.',
      tipSquare: 'Quadrat: Alle vier Seiten sind gleich lang. A = a · a und U = 4 · a.',
      tipL: 'Vergleiche mit dem großen Rechteck {a} cm × {b} cm: Schiebe die inneren Kanten nach außen.',
      tipLDone: 'Gleicher Umfang wie das Rechteck {a} cm × {b} cm – aber {cut} cm² weniger Fläche.',
      noL: 'Für eine L-Form müssen a und b mindestens 2 cm sein.',
      unit: '= 1 cm²',
      chartA: 'Flächeninhalt A in cm²',
      chartU: 'Umfang U in cm',
      axisRect: 'Rechteck a × b (in cm)',
      axisA: 'Länge a in cm',
      sameU: 'Alle Rechtecke mit U = {u} cm',
      sameA: 'Alle Rechtecke mit A = {A} cm²',
      lineU: 'a + b = {s} cm',
      lineA: 'a · b = {A} cm²',
    },
    en: {
      canvas: 'Squared paper with a rectangle made of unit squares, its side lengths, perimeter and area',
      areaTitle: 'Area A',
      perTitle: 'Perimeter P',
      tip: 'Remember',
      tipArea: 'Area: how many unit squares fit inside? Unit cm².',
      tipPer: 'Perimeter: how long is the edge all the way round? Unit cm.',
      tipSquare: 'Square: all four sides are equally long. A = a · a and P = 4 · a.',
      tipL: 'Compare with the big rectangle {a} cm × {b} cm: push the inner edges outwards.',
      tipLDone: 'Same perimeter as the rectangle {a} cm × {b} cm – but {cut} cm² less area.',
      noL: 'For an L-shape, a and b must be at least 2 cm.',
      unit: '= 1 cm²',
      chartA: 'Area A in cm²',
      chartU: 'Perimeter P in cm',
      axisRect: 'Rectangle a × b (in cm)',
      axisA: 'Length a in cm',
      sameU: 'All rectangles with P = {u} cm',
      sameA: 'All rectangles with A = {A} cm²',
      lineU: 'a + b = {s} cm',
      lineA: 'a · b = {A} cm²',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    /** Zweisprachiger Text mit Zahlen (für Sätze mit Einzahl/Mehrzahl). */
    const T = (deText: string, enText: string) => (de ? deText : enText);
    const mode = () => p.mode as Mode;
    const narrow = () => surface.width < 600;
    /** Formelzeichen für den Umfang (englisch P wie „perimeter“). */
    const SU = de ? 'U' : 'P';
    const n0 = (v: number) => fmt.num(v, 0);
    const cm = (v: number) => `${n0(v)} cm`;
    const cm2 = (v: number) => `${n0(v)} cm²`;

    const colArea = () => ctx.theme.series[0]!;
    const colA = () => ctx.theme.series[3]!;
    const colB = () => ctx.theme.series[4]!;
    const colOk = () => ctx.theme.series[2]!;
    const colPart2 = () => ctx.theme.series[5]!;
    const colCut = () => ctx.theme.series[1]!;
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');
    const paperColor = () => (ctx.theme.dark ? '#131a26' : '#fffefb');

    /* ---------- Figur ---------- */
    interface Fig {
      a: number;
      b: number;
      c: number;
      d: number;
      isL: boolean;
    }

    function candidates(): [number, number][] {
      if (mode() === 'gleichU') return rectsWithPerimeter(p.u);
      if (mode() === 'gleichA') return rectsWithArea(p.fa);
      return [];
    }

    function fig(): Fig {
      const m = mode();
      if (m === 'gleichU' || m === 'gleichA') {
        const list = candidates();
        const a = list.length ? nearestSide(list, p.w) : 1;
        const pair = list.find((q) => q[0] === a) ?? [1, 1];
        return { a: pair[0], b: pair[1], c: 0, d: 0, isL: false };
      }
      if (m === 'lform' && canCut(p.a, p.b)) {
        const [c, d] = clampCut(p.a, p.b, p.c, p.d);
        return { a: p.a, b: p.b, c, d, isL: true };
      }
      return { a: p.a, b: p.b, c: 0, d: 0, isL: false };
    }

    const figPoly = (f: Fig): Pt[] => (f.isL ? lPolygon(f.a, f.b, f.c, f.d) : rectPolygon(f.a, f.b));

    /** Angezeigte (weich nachgeführte) Maße. */
    const shown = { a: 0, b: 0, c: 0, d: 0 };
    function snapShown(): void {
      const f = fig();
      shown.a = f.a;
      shown.b = f.b;
      shown.c = f.c;
      shown.d = f.d;
    }
    snapShown();

    function stepShown(dt: number): boolean {
      const f = fig();
      const k = reduced ? 1 : Math.min(1, dt * 14);
      let moving = false;
      for (const key of ['a', 'b', 'c', 'd'] as const) {
        const diff = f[key] - shown[key];
        if (Math.abs(diff) > 0.002) {
          shown[key] += diff * k;
          moving = true;
        } else shown[key] = f[key];
      }
      return moving;
    }

    const shownIsL = () => shown.c > 0.01 && shown.d > 0.01;
    const shownPoly = (): Pt[] => (shownIsL() ? lPolygon(shown.a, shown.b, shown.c, shown.d) : rectPolygon(shown.a, shown.b));

    /** Einheitsquadrate für die angezeigte Figur (beim Wachsen schon die nächsten, abgeschnitten). */
    let cellCache = { key: '', cells: [] as Pt[] };
    function shownCells(): Pt[] {
      const a = Math.ceil(shown.a - 0.001);
      const b = Math.ceil(shown.b - 0.001);
      const c = Math.floor(shown.c + 0.001);
      const d = Math.floor(shown.d + 0.001);
      const isL = c >= 1 && d >= 1 && c < a && d < b;
      const key = `${a}|${b}|${isL ? `${c}|${d}` : ''}`;
      if (key !== cellCache.key) cellCache = { key, cells: unitCells(isL ? lPolygon(a, b, c, d) : rectPolygon(a, b)) };
      return cellCache.cells;
    }

    /* ---------- Zustand der Abläufe ---------- */
    let fillAnim: FillAnim | null = null;
    let filled = false;
    let walkAnim: WalkAnim | null = null;
    let walked = false;
    const fadenTween = new Tween(1800, ease.linear);
    let fadenInstant = false;
    const zerlTween = new Tween(700, ease.inOutCubic);
    let zerlFrom = p.zerl as Method;
    let zerlLast = p.zerl as Method;
    const kantenTween = new Tween(1000, ease.inOutCubic);
    const viewTween = new Tween(650, ease.inOutCubic);
    let viewFrom: View | null = null;
    let view: View = { cell: 30, ox: 0, oy: 0 };
    let sizeKey = '';
    const pop = new Tween(550, ease.outBack);
    const visited = new Set<number>();
    let scanTimer: ReturnType<typeof setTimeout> | null = null;
    let fadenTimer: ReturnType<typeof setTimeout> | null = null;
    let scanning = false;
    let hover: string | null = null;
    let drag: string | null = null;
    let hits: Hit[] = [];
    let lastFrame = performance.now();

    const show = () => p.show || mode() === 'gleichU' || mode() === 'gleichA';
    const areaKnown = () => show() || filled;
    const perKnown = () => show() || walked;

    function fadenP(): number {
      if (mode() !== 'rechteck') return 0;
      const on = p.faden;
      if (!fadenTween.running) return on ? 1 : 0;
      return on ? fadenTween.t : 1 - fadenTween.t;
    }

    function kantenP(): number {
      if (mode() !== 'lform' || !fig().isL) return 0;
      if (!kantenTween.running) return p.kanten ? 1 : 0;
      return p.kanten ? kantenTween.value : 1 - kantenTween.value;
    }

    /* ---------- Aufteilung und Maßstab ---------- */
    /**
     * Ausschnitt des Blatts: Bereich in cm, der immer sichtbar sein muss (bis
     * zu den größten möglichen Seitenlängen, damit sich der Maßstab beim
     * Ziehen nicht ändert), dazu Ränder in Pixeln für die Beschriftungen.
     */
    function frame(fp: number): Box4 {
      const m = mode();
      const sm = narrow();
      // links steht bei der L-Form „b = …“, sonst nur die Länge
      const side = { mL: m === 'lform' ? (sm ? 62 : 70) : sm ? 42 : 48, mR: sm ? 64 : 78, mT: 30, mB: sm ? 30 : 34 };
      if (m === 'gleichU' || m === 'gleichA') {
        const mx = m === 'gleichU' ? p.u / 2 - 1 : p.fa;
        return { x0: 0, x1: mx, y0: 0, y1: mx, ...side };
      }
      const off: Box4 = { x0: 0, x1: A_MAX, y0: 0, y1: B_MAX, ...side };
      if (m !== 'rechteck' || fp <= 0) return off;
      // abgewickelter Faden: zwei Stücke der Länge a + b unter dem Rechteck
      const on: Box4 = { x0: 0, x1: A_MAX + B_MAX, y0: STRAND_Y[1], y1: B_MAX, mL: sm ? 40 : 46, mR: sm ? 58 : 66, mT: 30, mB: sm ? 54 : 62 };
      const k = ease.inOutCubic(clamp(fp / 0.32, 0, 1));
      const mix = (key: keyof Box4) => lerp(off[key], on[key], k);
      return { x0: 0, x1: mix('x1'), y0: mix('y0'), y1: B_MAX, mL: mix('mL'), mR: mix('mR'), mT: 30, mB: mix('mB') };
    }

    /** Höhe des Inhalts auf dem Blatt bei voller Breite W (Handy). */
    function frameHeight(fr: Box4, W: number): number {
      const cell = (W - 2 * PAD - fr.mL - fr.mR) / (fr.x1 - fr.x0);
      return (fr.y1 - fr.y0) * cell + fr.mT + fr.mB + 2 * PAD;
    }

    let phCache = { key: '', h: 0 };
    let reg: { paper: Rect; panel: Rect } = { paper: { x: 0, y: 0, w: 1, h: 1 }, panel: { x: 0, y: 0, w: 1, h: 1 } };

    /** Blatt links und Karten rechts; auf dem Handy Blatt oben, Karten darunter. */
    function computeRegions(now: number): { paper: Rect; panel: Rect } {
      const W = surface.width;
      const H = surface.height;
      const m = mode();
      if (!narrow()) {
        const pw = Math.round(W * (m === 'rechteck' || m === 'lform' ? 0.67 : 0.56));
        return { paper: { x: 0, y: 0, w: pw, h: H }, panel: { x: pw + 12, y: 0, w: W - pw - 12, h: H } };
      }
      // Höhe des Blatts nur bei neuer Größe bzw. neuem Thema bestimmen (springt sonst mit den Texten)
      const key = `${W}x${H}|${m}|${m === 'gleichU' ? p.u : m === 'gleichA' ? p.fa : ''}`;
      if (key !== phCache.key) {
        let ph: number;
        if (m === 'gleichU' || m === 'gleichA') ph = Math.min(frameHeight(frame(0), W), H * 0.47);
        else {
          const content = Math.max(frameHeight(frame(0), W), m === 'rechteck' ? frameHeight(frame(1), W) : 0);
          const cards = m === 'lform' ? lCards(now, W - 20) : rectCards(now, W - 20);
          const need = cards.reduce((s, c) => s + cardHeight(c, W - 20) + 8, 0);
          ph = Math.max(content, H - 10 - need);
        }
        phCache = { key, h: Math.round(clamp(ph, 180, H * 0.62)) };
      }
      const ph = phCache.h;
      return { paper: { x: 0, y: 0, w: W, h: ph }, panel: { x: 0, y: ph + 10, w: W, h: H - ph - 10 } };
    }

    function viewFor(fr: Box4, R: Rect, snap: boolean): View {
      let cell = Math.min((R.w - 2 * PAD - fr.mL - fr.mR) / (fr.x1 - fr.x0), (R.h - 2 * PAD - fr.mT - fr.mB) / (fr.y1 - fr.y0));
      if (snap) cell = Math.floor(cell);
      const w = (fr.x1 - fr.x0) * cell + fr.mL + fr.mR;
      const h = (fr.y1 - fr.y0) * cell + fr.mT + fr.mB;
      let ox = R.x + (R.w - w) / 2 + fr.mL - fr.x0 * cell;
      let oy = R.y + (R.h - h) / 2 + fr.mT + fr.y1 * cell;
      if (snap) {
        ox = Math.round(ox);
        oy = Math.round(oy);
      }
      return { cell, ox, oy };
    }

    function currentView(): View {
      const R = reg.paper;
      const fp = fadenP();
      const animating = fadenTween.running || viewTween.running;
      const target = viewFor(frame(fp), R, !animating);
      if (viewTween.running && viewFrom) {
        const k = viewTween.value;
        return { cell: lerp(viewFrom.cell, target.cell, k), ox: lerp(viewFrom.ox, target.ox, k), oy: lerp(viewFrom.oy, target.oy, k) };
      }
      return target;
    }

    const X = (x: number) => view.ox + x * view.cell;
    const Y = (y: number) => view.oy - y * view.cell;

    /* ---------- Zeichnen: Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.5) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      // Zahl und Einheit nicht trennen
      str = str.replace(/ (cm²|cm)(?=[\s.,:;)–]|$)/g, '\u00a0$1').replace(/ ([=·]) /g, '\u00a0$1\u00a0');
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    const segFont = (s: Seg, size: number, weight: number) => (s.v ? `italic ${s.w ?? 700} ${Math.round(size * 1.12)}px ${ctx.theme.mathFont}` : `${s.w ?? weight} ${size}px ${ctx.theme.font}`);

    function richWidth(segs: Seg[], size: number, weight: number): number {
      const g = surface.g;
      return segs.reduce((sum, s) => {
        g.font = segFont(s, size, weight);
        return sum + g.measureText(s.t).width;
      }, 0);
    }

    function drawRich(segs: Seg[], x: number, y: number, size: number, weight: number, align: 'left' | 'center' | 'right' = 'left', base = ctx.theme.text): number {
      const g = surface.g;
      const total = richWidth(segs, size, weight);
      let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      for (const s of segs) {
        const font = segFont(s, size, weight);
        g.font = font;
        const w = g.measureText(s.t).width;
        text(g, s.t, cx, y, { font, color: s.c ?? base, align: 'left', baseline: 'middle' });
        cx += w;
      }
      return total;
    }

    const S = (t: string, c?: string, w?: number): Seg => ({ t, c, w });
    const V = (t: string, c?: string): Seg => ({ t, c, v: true });

    /** Text mit Hof in Papierfarbe (bleibt über Gitterlinien lesbar). */
    function haloText(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle'): void {
      const g = surface.g;
      g.save();
      g.font = font;
      g.textAlign = align;
      g.textBaseline = baseline;
      g.lineJoin = 'round';
      g.strokeStyle = paperColor();
      g.lineWidth = 4;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }

    function pill(label: string, x: number, y: number, fill: string, color: string, size: number): Rect {
      const g = surface.g;
      const font = `800 ${size}px ${ctx.theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + size * 1.1;
      const h = size * 1.75;
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = fill;
      roundRect(g, x - w / 2, y - h / 2, w, h, h / 2);
      g.fill();
      g.restore();
      text(g, label, x, y + 0.5, { font, color });
      return { x: x - w / 2, y: y - h / 2, w, h };
    }

    /* ---------- Zeichnen: Blatt ---------- */
    function drawPaper(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = paperColor();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 12);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 12);
      g.clip();
      const c = view.cell;
      const blue = theme.series[0]!;
      // Kästchen (0,5 cm) fein, ganze Zentimeter kräftiger – wie auf Rechenpapier
      const layers: [number, string][] = [
        [0.5, withAlpha(blue, theme.dark ? 0.1 : 0.11)],
        [1, withAlpha(blue, theme.dark ? 0.24 : 0.27)],
      ];
      for (const [step, color] of layers) {
        if (step * c < 6) continue;
        g.strokeStyle = color;
        g.lineWidth = 1;
        g.beginPath();
        const s = step * c;
        for (let i = Math.ceil((R.x - view.ox) / s); i <= Math.floor((R.x + R.w - view.ox) / s); i++) {
          if (step === 0.5 && i % 2 === 0) continue;
          const x = Math.round(view.ox + i * s) + 0.5;
          g.moveTo(x, R.y);
          g.lineTo(x, R.y + R.h);
        }
        for (let j = Math.ceil((view.oy - R.y - R.h) / s); j <= Math.floor((view.oy - R.y) / s); j++) {
          if (step === 0.5 && j % 2 === 0) continue;
          const y = Math.round(view.oy - j * s) + 0.5;
          g.moveTo(R.x, y);
          g.lineTo(R.x + R.w, y);
        }
        g.stroke();
      }
      g.restore();
      g.strokeStyle = theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, R.x + 2.5, R.y + 2.5, R.w - 5, R.h - 5, 12);
      g.stroke();
    }

    /** Ein Einheitsquadrat (linke untere Ecke x | y in cm) als Fliese. */
    function drawTile(x: number, y: number, base: string, alpha: number, scale: number, label: string | null, dx = 0, dy = 0, plain = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      const c = view.cell;
      const px = X(x) + dx;
      const py = Y(y + 1) + dy;
      g.save();
      g.globalAlpha = alpha;
      if (scale !== 1) {
        g.translate(px + c / 2, py + c / 2);
        g.scale(scale, scale);
        g.translate(-px - c / 2, -py - c / 2);
      }
      if (plain) {
        g.fillStyle = withAlpha(base, theme.dark ? 0.24 : 0.15);
        g.fillRect(px, py, c, c);
        g.restore();
        return;
      }
      const inset = Math.max(1, c * 0.055);
      const s = c - 2 * inset;
      const r = Math.min(6, c * 0.14);
      g.fillStyle = theme.dark ? mixColor(base, '#0e1420', 0.42) : mixColor(base, '#ffffff', 0.52);
      roundRect(g, px + inset, py + inset, s, s, r);
      g.fill();
      // Lichtkante oben für etwas Tiefe
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.45)';
      roundRect(g, px + inset + 1, py + inset + 1, s - 2, s * 0.32, Math.max(1, r - 1));
      g.fill();
      g.strokeStyle = theme.dark ? mixColor(base, '#0e1420', 0.1) : mixColor(base, '#ffffff', 0.12);
      g.lineWidth = 1;
      roundRect(g, px + inset + 0.5, py + inset + 0.5, s - 1, s - 1, r);
      g.stroke();
      if (label && c >= 19) {
        const fs = Math.min(15, Math.round(c * 0.38));
        text(g, label, px + c / 2, py + c / 2 + 0.5, { font: `700 ${fs}px ${theme.font}`, color: theme.dark ? 'rgba(230,238,252,0.9)' : mixColor(base, '#000000', 0.45) });
      }
      g.restore();
    }

    /** Seite eines Vielecks als dicke Linie (waagerecht: Farbe von a, senkrecht: Farbe von b). */
    function sideColor(p1: Pt, p2: Pt): string {
      return Math.abs(p1[1] - p2[1]) < 1e-9 ? colA() : colB();
    }

    function strokeSeg(x1: number, y1: number, x2: number, y2: number, color: string, width: number, alpha = 1, dash?: number[]): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.restore();
    }

    const lineW = () => clamp(view.cell * 0.13, 3, 5.5);

    function drawOutline(poly: readonly Pt[], alpha = 1, dx = 0, dy = 0, skip: (i: number) => boolean = () => false): void {
      poly.forEach((q, i) => {
        if (skip(i)) return;
        const r = poly[(i + 1) % poly.length]!;
        strokeSeg(X(q[0]) + dx, Y(q[1]) + dy, X(r[0]) + dx, Y(r[1]) + dy, sideColor(q, r), lineW(), alpha);
      });
    }

    /** Beschriftung einer Seite außen neben der Mitte (Vieleck gegen den Uhrzeigersinn). */
    function sideLabel(p1: Pt, p2: Pt, label: string, color: string, strong: boolean, dx = 0, dy = 0, scale = 1): void {
      const g = surface.g;
      const mx = X((p1[0] + p2[0]) / 2) + dx;
      const my = Y((p1[1] + p2[1]) / 2) + dy;
      // äußere Normale (Bildschirm): Richtung im Uhrzeigersinn gedreht
      const ex = p2[0] - p1[0];
      const ey = p2[1] - p1[1];
      const len = Math.hypot(ex, ey) || 1;
      const nx = ey / len;
      const ny = ex / len; // Bildschirm-y zeigt nach unten
      const fs = narrow() ? 12 : view.cell < 26 ? 12.5 : 14;
      const font = `${strong ? 800 : 650} ${fs}px ${ctx.theme.font}`;
      const off = lineW() / 2 + 6;
      g.save();
      if (scale !== 1) {
        g.translate(mx, my);
        g.scale(scale, scale);
        g.translate(-mx, -my);
      }
      if (Math.abs(nx) > 0.5) haloText(label, mx + nx * off, my, font, color, nx > 0 ? 'left' : 'right');
      else haloText(label, mx, my + ny * off, font, color, 'center', ny > 0 ? 'top' : 'bottom');
      g.restore();
    }

    function handleDot(x: number, y: number, color: string, id: string, cursor: string, hollow = false): void {
      const g = surface.g;
      const r = narrow() ? 9 : 10;
      const active = hover === id || drag === id;
      if (!ctx.locked && active) {
        g.fillStyle = withAlpha(color, 0.2);
        g.beginPath();
        g.arc(x, y, r + 8, 0, Math.PI * 2);
        g.fill();
      }
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      g.fillStyle = hollow ? paperColor() : color;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = hollow ? color : paperColor();
      g.lineWidth = hollow ? 2.5 : 2.5;
      if (hollow) g.setLineDash([3, 2.5]);
      g.beginPath();
      g.arc(x, y, hollow ? r - 1 : r - 0.5, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      // vier kleine Pfeile andeuten (ziehbar)
      g.fillStyle = hollow ? color : onColor();
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        const cx = x + Math.cos(a) * r * 0.45;
        const cy = y + Math.sin(a) * r * 0.45;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6);
        g.lineTo(cx + Math.cos(a + 2.2) * 2.2, cy + Math.sin(a + 2.2) * 2.2);
        g.lineTo(cx + Math.cos(a - 2.2) * 2.2, cy + Math.sin(a - 2.2) * 2.2);
        g.closePath();
        g.fill();
      }
      if (!ctx.locked) {
        const R = narrow() ? 22 : 18;
        hits.push({ id, x: x - R, y: y - R, w: 2 * R, h: 2 * R, prio: 0, cursor });
      }
    }

    /* ---------- Ameise ---------- */
    function drawAnt(x: number, y: number, size: number, angle: number, phase: number, alpha: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const body = dark ? '#d49a68' : '#3b2416';
      const shine = dark ? '#f3cfa8' : '#7d5236';
      const s = size;
      g.save();
      g.globalAlpha = alpha;
      g.translate(x, y);
      g.rotate(angle);
      // Schatten
      g.fillStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(16,24,40,0.14)';
      g.beginPath();
      g.ellipse(-s * 0.05, s * 0.06, s * 0.55, s * 0.2, 0, 0, Math.PI * 2);
      g.fill();
      // Beine: Dreifußgang
      g.strokeStyle = body;
      g.lineWidth = Math.max(1.2, s * 0.055);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const swing = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI) + (side > 0 ? Math.PI : 0)) * s * 0.1;
          const bx = s * (0.06 - i * 0.08);
          g.beginPath();
          g.moveTo(bx, 0);
          g.lineTo(bx + (1 - i) * s * 0.1 + swing * 0.5, side * s * 0.2);
          g.lineTo(bx + (1 - i) * s * 0.26 + swing, side * s * 0.34);
          g.stroke();
        }
      }
      // Fühler
      g.lineWidth = Math.max(1, s * 0.04);
      for (const side of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * 0.33, side * s * 0.04);
        g.lineTo(s * 0.45, side * s * 0.12);
        g.lineTo(s * 0.58, side * s * 0.1 + Math.sin(phase * 0.5 + side) * s * 0.02);
        g.stroke();
      }
      const blob = (cx: number, rx: number, ry: number) => {
        const grad = g.createRadialGradient(cx - rx * 0.3, -ry * 0.35, rx * 0.1, cx, 0, rx * 1.1);
        grad.addColorStop(0, shine);
        grad.addColorStop(1, body);
        g.fillStyle = grad;
        g.beginPath();
        g.ellipse(cx, 0, rx, ry, 0, 0, Math.PI * 2);
        g.fill();
      };
      blob(-s * 0.3, s * 0.25, s * 0.18); // Hinterleib
      blob(-s * 0.06, s * 0.05, s * 0.04); // Stielchen
      blob(s * 0.06, s * 0.14, s * 0.085); // Brust
      blob(s * 0.27, s * 0.11, s * 0.1); // Kopf
      g.restore();
    }

    /* ---------- Zeichnen: Rechteck und L-Form ---------- */
    /** Verschiebung (px) der Teilrechtecke beim Zerlegen. */
    function partOffset(m: Method, part: number): [number, number] {
      const gap = clamp(view.cell * 0.45, 8, 16);
      if (part === 0) return [0, 0];
      if (m === 'waag') return [0, -gap];
      if (m === 'senk') return [gap, 0];
      return [0, 0];
    }

    function cellPart(m: Method, f: Fig, x: number, y: number): number {
      if (m === 'waag') return y >= f.b - f.d ? 1 : 0;
      if (m === 'senk') return x >= f.a - f.c ? 1 : 0;
      return 0;
    }

    const partColor = (m: Method, part: number) => (part === 1 && (m === 'waag' || m === 'senk') ? colPart2() : colArea());

    /** Zeitlicher Zustand eines Einheitsquadrats beim Auslegen. */
    function fillCellState(an: FillAnim, i: number, t: number): { e: number; dy: number } {
      const [x, y] = an.cells[i]!;
      if (an.rows) {
        if (y === 0) {
          const e = clamp((t - (0.25 + x * an.d1)) / 0.32, 0, 1);
          return { e, dy: 0 };
        }
        const e = clamp((t - (an.t1 + (y - 1) * an.d3)) / 0.5, 0, 1);
        return { e, dy: 1 - ease.outCubic(e) };
      }
      return { e: clamp((t - (0.2 + i * an.dg)) / 0.3, 0, 1), dy: 0 };
    }

    function drawFigure(now: number): void {
      const g = surface.g;
      const f = fig();
      const m = mode();
      const zTo = (m === 'lform' && f.isL ? p.zerl : 'keine') as Method;
      const zFrom = (m === 'lform' && f.isL ? zerlFrom : 'keine') as Method;
      const zv = zerlTween.running ? zerlTween.value : 1;
      const kp = kantenP();
      const sep = 1 - kp; // beim Kantenschieben die Teile wieder zusammen
      const poly = shownPoly();

      // Füllung
      if (fillAnim) {
        const t = (now - fillAnim.t0) / 1000;
        fillAnim.cells.forEach(([x, y], i) => {
          const st = fillCellState(fillAnim!, i, t);
          if (st.e <= 0) return;
          const part0 = cellPart(zFrom, f, x, y);
          const part1 = cellPart(zTo, f, x, y);
          const o0 = partOffset(zFrom, part0);
          const o1 = partOffset(zTo, part1);
          const color = mixColor(partColor(zFrom, part0), partColor(zTo, part1), zv);
          const scale = fillAnim!.rows && y > 0 ? 1 : ease.outBack(st.e);
          drawTile(x, y - st.dy, color, Math.min(1, st.e * 2.5), Math.max(0.01, scale), st.e > 0.45 ? String(i + 1) : null, lerp(o0[0], o1[0], zv) * sep, lerp(o0[1], o1[1], zv) * sep);
        });
        // Umriss nur dünn, solange gelegt wird
        poly.forEach((q, i) => {
          const r = poly[(i + 1) % poly.length]!;
          strokeSeg(X(q[0]), Y(q[1]), X(r[0]), Y(r[1]), withAlpha(ctx.theme.muted, 0.7), 1.6, 1, [5, 4]);
        });
        return;
      }

      const cells = shownCells();
      const plain = !p.tiles && !filled;
      g.save();
      // auf die angezeigte Figur zuschneiden (beim Wachsen erscheinen die Quadrate nach und nach)
      const clipZerl = zTo === 'keine' && zFrom === 'keine';
      if (clipZerl) {
        g.beginPath();
        poly.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
        g.closePath();
        g.clip();
      }
      cells.forEach(([x, y], i) => {
        const part0 = cellPart(zFrom, f, x, y);
        const part1 = cellPart(zTo, f, x, y);
        const o0 = partOffset(zFrom, part0);
        const o1 = partOffset(zTo, part1);
        const color = mixColor(partColor(zFrom, part0), partColor(zTo, part1), zv);
        drawTile(x, y, color, 1, 1, filled ? String(i + 1) : null, lerp(o0[0], o1[0], zv) * sep, lerp(o0[1], o1[1], zv) * sep, plain);
      });
      g.restore();

      // L-Form: umgebendes Rechteck ganz zart (zum Vergleichen), beim Ergänzen kräftig
      if (m === 'lform' && f.isL) {
        g.save();
        g.strokeStyle = withAlpha(ctx.theme.muted, 0.45);
        g.lineWidth = 1.3;
        g.setLineDash([4, 5]);
        g.beginPath();
        g.moveTo(X(shown.a - shown.c), Y(shown.b));
        g.lineTo(X(shown.a), Y(shown.b));
        g.lineTo(X(shown.a), Y(shown.b - shown.d));
        g.stroke();
        g.restore();
      }
      // Ergänzen: fehlendes Rechteck schraffiert, großes Rechteck gestrichelt
      if (m === 'lform' && f.isL) {
        const kErg = (zTo === 'erg' ? zv : 0) + (zFrom === 'erg' ? 1 - zv : 0);
        if (kErg > 0.01) drawComplement(f, kErg);
      }

      // Umriss: ganze Figur oder die beiden Teile
      const outlineFor = (zm: Method, alpha: number) => {
        if (alpha <= 0.01) return;
        if ((zm === 'waag' || zm === 'senk') && f.isL) {
          const dec = lDecomposition(f.a, f.b, f.c, f.d, zm);
          dec.parts.forEach((q, part) => {
            const [dx, dy] = partOffset(zm, part);
            drawOutline(rectPolygon(q.w, q.h).map(([x, y]) => [x + q.x, y + q.y] as Pt), alpha, dx * sep, dy * sep);
          });
        } else if (m === 'lform' && f.isL && kp > 0) drawOutline(poly, alpha, 0, 0, (i) => i === 2 || i === 3);
        else drawOutline(poly, alpha);
      };
      if (m !== 'rechteck') {
        if (zTo === zFrom) outlineFor(zTo, 1);
        else {
          outlineFor(zFrom, 1 - zv);
          outlineFor(zTo, zv);
        }
      }
      if (m === 'lform' && f.isL && kp > 0) drawPushedEdges(f, kp);
      if (m === 'lform' && f.isL && (zTo === 'waag' || zTo === 'senk')) drawPartLabels(f, zTo, zv * sep);
    }

    function drawComplement(f: Fig, k: number): void {
      const g = surface.g;
      const red = colCut();
      const x0 = X(f.a - f.c);
      const y0 = Y(f.b);
      const w = f.c * view.cell;
      const h = f.d * view.cell;
      g.save();
      g.globalAlpha = k;
      g.beginPath();
      g.rect(x0, y0, w, h);
      g.clip();
      g.fillStyle = withAlpha(red, ctx.theme.dark ? 0.16 : 0.1);
      g.fillRect(x0, y0, w, h);
      g.strokeStyle = withAlpha(red, 0.45);
      g.lineWidth = 1.5;
      g.beginPath();
      for (let s = -h; s < w + h; s += 9) {
        g.moveTo(x0 + s, y0 + h);
        g.lineTo(x0 + s + h, y0);
      }
      g.stroke();
      g.restore();
      g.save();
      g.globalAlpha = k;
      g.strokeStyle = red;
      g.lineWidth = 2;
      g.setLineDash([6, 5]);
      g.strokeRect(X(0), Y(f.b), f.a * view.cell, f.b * view.cell);
      g.restore();
      if (w >= 34 && h >= 22) {
        const fs = narrow() ? 12 : 13;
        haloText(areaKnown() ? `− ${cm2(f.c * f.d)}` : '−', x0 + w / 2, y0 + h / 2, `800 ${fs}px ${ctx.theme.font}`, red);
      }
      void g;
    }

    /** L-Form: Die inneren Kanten wandern nach außen an den Rand des großen Rechtecks. */
    function drawPushedEdges(f: Fig, kp: number): void {
      const g = surface.g;
      const yH = f.b - f.d + f.d * kp; // waagerechte Innenkante (Länge c)
      const xV = f.a - f.c + f.c * kp; // senkrechte Innenkante (Länge d)
      const lw = lineW();
      // ursprüngliche Lage gestrichelt
      strokeSeg(X(f.a - f.c), Y(f.b - f.d), X(f.a), Y(f.b - f.d), colA(), 2, 0.6, [5, 5]);
      strokeSeg(X(f.a - f.c), Y(f.b - f.d), X(f.a - f.c), Y(f.b), colB(), 2, 0.6, [5, 5]);
      // Lücke am Rand andeuten
      strokeSeg(X(f.a - f.c), Y(f.b), X(f.a), Y(f.b), withAlpha(ctx.theme.muted, 0.7), 1.5, 1 - kp * 0.9, [3, 4]);
      strokeSeg(X(f.a), Y(f.b - f.d), X(f.a), Y(f.b), withAlpha(ctx.theme.muted, 0.7), 1.5, 1 - kp * 0.9, [3, 4]);
      // wandernde Kanten
      strokeSeg(X(f.a - f.c), Y(yH), X(f.a), Y(yH), colA(), lw + 1);
      strokeSeg(X(xV), Y(f.b - f.d), X(xV), Y(f.b), colB(), lw + 1);
      // Pfeile in Bewegungsrichtung
      const arrow = (x: number, y: number, dx: number, dy: number, color: string) => {
        g.save();
        g.translate(x, y);
        g.rotate(Math.atan2(dy, dx));
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(7, 0);
        g.lineTo(-4, -5.5);
        g.lineTo(-4, 5.5);
        g.closePath();
        g.fill();
        g.restore();
      };
      if (kp < 0.98) {
        arrow(X(f.a - f.c / 2), Y(yH) - 11, 0, -1, colA());
        arrow(X(xV) + 11, Y(f.b - f.d / 2), 1, 0, colB());
      }
      if (p.labels && kp > 0.6) {
        const k = clamp((kp - 0.6) / 0.4, 0, 1);
        g.save();
        g.globalAlpha = k;
        sideLabel([f.a, f.b], [f.a - f.c, f.b], cm(f.c), colA(), true);
        sideLabel([f.a, f.b - f.d], [f.a, f.b], cm(f.d), colB(), true);
        g.restore();
      }
    }

    function drawPartLabels(f: Fig, zm: Method, k: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dec = lDecomposition(f.a, f.b, f.c, f.d, zm);
      const fs = narrow() ? 12 : 13.5;
      dec.parts.forEach((q, i) => {
        const [dx, dy] = partOffset(zm, i);
        const cx = X(q.x + q.w / 2) + dx * k;
        const cy = Y(q.y + q.h / 2) + dy * k;
        const color = i === 0 ? colArea() : colPart2();
        const w = q.w * view.cell;
        const h = q.h * view.cell;
        const name = `A${i === 0 ? '₁' : '₂'}`;
        const val = areaKnown() ? ` = ${q.w} · ${q.h} = ${cm2(q.w * q.h)}` : ` = ${q.w} · ${q.h}`;
        const font = `800 ${fs}px ${theme.font}`;
        g.font = font;
        // so ausführlich, wie es in das Teilrechteck passt
        const options = [name + val, areaKnown() ? `${name} = ${cm2(q.w * q.h)}` : name, name];
        const label = options.find((o) => g.measureText(o).width + 16 <= w - 6) ?? name;
        const tw = g.measureText(label).width + 14;
        if (tw > w - 4 || h < fs * 1.9) return;
        g.save();
        g.globalAlpha = clamp(k * 1.4, 0, 1);
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
        g.shadowBlur = 6;
        g.shadowOffsetY = 1.5;
        g.fillStyle = paperColor();
        roundRect(g, cx - tw / 2, cy - fs * 0.85, tw, fs * 1.7, fs * 0.85);
        g.fill();
        g.restore();
        g.save();
        g.globalAlpha = clamp(k * 1.4, 0, 1);
        g.strokeStyle = color;
        g.lineWidth = 1.5;
        roundRect(g, cx - tw / 2, cy - fs * 0.85, tw, fs * 1.7, fs * 0.85);
        g.stroke();
        text(g, label, cx, cy + 0.5, { font, color: mixColor(color, theme.text, 0.3) });
        g.restore();
      });
    }

    /** Beschriftung der Seiten (statisch). */
    function drawSideLabels(): void {
      if (!p.labels || walkAnim) return;
      const f = fig();
      const m = mode();
      const poly = shownPoly();
      const filling = m === 'rechteck' && (fillAnim !== null || filled);
      if (m === 'lform' && f.isL) {
        const sides = lSides(f.a, f.b, f.c, f.d);
        const z = p.zerl as Method;
        if (z === 'waag' || z === 'senk') return; // die Teile tragen eigene Bezeichnungen
        const kp = kantenP();
        poly.forEach((q, i) => {
          const r = poly[(i + 1) % poly.length]!;
          const inner = i === 2 || i === 3;
          if (inner && kp > 0) return;
          // Innenkanten nur beschriften, wenn im Ausschnitt genug Platz ist
          if (inner && (f.c * view.cell < 70 || f.d * view.cell < 50)) return;
          const strong = i === 0 || i === 5;
          const label = i === 0 ? `a = ${cm(sides[i]!)}` : i === 5 ? `b = ${cm(sides[i]!)}` : cm(sides[i]!);
          sideLabel(q, r, label, sideColor(q, r), strong);
        });
        return;
      }
      const [p0, p1, p2, p3] = poly as [Pt, Pt, Pt, Pt];
      if (!filling) sideLabel(p0, p1, `a = ${cm(f.a)}`, colA(), true);
      sideLabel(p1, p2, `b = ${cm(f.b)}`, colB(), true);
      sideLabel(p2, p3, cm(f.a), colA(), false);
      if (!filling) sideLabel(p3, p0, cm(f.b), colB(), false);
    }

    /** Beim Auslegen: Reihen nummerieren und die erste Reihe zählen. */
    function drawFillGuides(now: number): void {
      if (mode() !== 'rechteck' || (!fillAnim && !filled)) return;
      const f = fig();
      const g = surface.g;
      const t = fillAnim ? (now - fillAnim.t0) / 1000 : Infinity;
      const fs = narrow() ? 12 : 13.5;
      // Klammer unter der ersten Reihe
      const k1 = fillAnim ? clamp((t - (fillAnim.t1 - 0.35)) / 0.3, 0, 1) : 1;
      if (k1 > 0) {
        g.save();
        g.globalAlpha = k1;
        const y = Y(0) + lineW() / 2 + 6;
        g.strokeStyle = colA();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(X(0) + 2, y);
        g.lineTo(X(0) + 2, y + 5);
        g.lineTo(X(f.a) - 2, y + 5);
        g.lineTo(X(f.a) - 2, y);
        g.stroke();
        const label = T(`${n0(f.a)} ${f.a === 1 ? 'Quadrat' : 'Quadrate'} pro Reihe`, `${n0(f.a)} ${f.a === 1 ? 'square' : 'squares'} per row`);
        haloText(label, X(f.a / 2), y + 8, `800 ${fs}px ${ctx.theme.font}`, colA(), 'center', 'top');
        g.restore();
      }
      // Reihennummern links
      for (let j = 0; j < f.b; j++) {
        const kj = fillAnim ? clamp((t - (j === 0 ? fillAnim.t1 - 0.35 : fillAnim.t1 + (j - 1) * fillAnim.d3 + 0.3)) / 0.3, 0, 1) : 1;
        if (kj <= 0) continue;
        const cx = X(0) - lineW() / 2 - 14;
        const cy = Y(j + 0.5);
        const r = clamp(view.cell * 0.32, 8, 12);
        g.save();
        g.globalAlpha = kj;
        g.fillStyle = colB();
        g.beginPath();
        g.arc(cx, cy, r * ease.outBack(kj), 0, Math.PI * 2);
        g.fill();
        text(g, String(j + 1), cx, cy + 0.5, { font: `800 ${Math.round(r * 1.15)}px ${ctx.theme.font}`, color: onColor() });
        g.restore();
      }
      // rechts unter „b = …“: so viele Reihen
      const kb = fillAnim ? clamp((t - (fillAnim.total - 0.8)) / 0.3, 0, 1) : 1;
      if (kb > 0 && view.cell * f.b >= 44 && p.labels) {
        g.save();
        g.globalAlpha = kb;
        const sfs = narrow() ? 11 : 12;
        haloText(T(`(${n0(f.b)} ${f.b === 1 ? 'Reihe' : 'Reihen'})`, `(${n0(f.b)} ${f.b === 1 ? 'row' : 'rows'})`), X(f.a) + lineW() / 2 + 6, Y(f.b / 2) + (narrow() ? 15 : 17), `700 ${sfs}px ${ctx.theme.font}`, colB(), 'left');
        g.restore();
      }
    }

    /* ---------- Umfang: Faden und Ameise ---------- */
    interface Piece {
      from: [Pt, Pt];
      to: [Pt, Pt];
      color: string;
    }

    function pieces(a: number, b: number): Piece[] {
      const [s1, s2] = STRAND_Y;
      return [
        { from: [[0, 0], [a, 0]], to: [[0, s1], [a, s1]], color: colA() },
        { from: [[a, 0], [a, b]], to: [[a, s1], [a + b, s1]], color: colB() },
        { from: [[a, b], [0, b]], to: [[0, s2], [a, s2]], color: colA() },
        { from: [[0, b], [0, 0]], to: [[a, s2], [a + b, s2]], color: colB() },
      ];
    }

    const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

    /** Fadenstück zwischen zwei Punkten (px) mit Perlen an jedem Zentimeter. */
    function drawString(x1: number, y1: number, x2: number, y2: number, color: string, lengthCm: number): void {
      const g = surface.g;
      const w = lineW();
      strokeSeg(x1, y1, x2, y2, color, w);
      // feiner Glanz in der Mitte
      strokeSeg(x1, y1, x2, y2, 'rgba(255,255,255,0.28)', Math.max(1, w * 0.28));
      if (lengthCm >= 1 && view.cell >= 14) {
        g.fillStyle = paperColor();
        const n = Math.round(lengthCm);
        for (let k = 1; k < n; k++) {
          const t = k / lengthCm;
          g.beginPath();
          g.arc(lerp(x1, x2, t), lerp(y1, y2, t), Math.max(1.1, w * 0.26), 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    function drawStrands(fp: number): void {
      const g = surface.g;
      const a = shown.a;
      const b = shown.b;
      const tp = clamp((fp - 0.3) / 0.7, 0, 1);
      pieces(a, b).forEach((pc, i) => {
        const ti = clamp((tp - i * 0.12) / 0.64, 0, 1);
        const e = ease.inOutCubic(ti);
        const [f0, f1] = pc.from;
        const len = Math.hypot(f1[0] - f0[0], f1[1] - f0[1]);
        const cs: Pt = [(f0[0] + f1[0]) / 2, (f0[1] + f1[1]) / 2];
        const ct: Pt = [(pc.to[0][0] + pc.to[1][0]) / 2, pc.to[0][1]];
        const th0 = Math.atan2(f1[1] - f0[1], f1[0] - f0[0]);
        const d0 = wrapAngle(0 - th0);
        const d1 = wrapAngle(Math.PI - th0);
        const dth = Math.abs(d0) <= Math.abs(d1) ? d0 : d1;
        const th = th0 + dth * e;
        // kleiner Bogen nach außen, damit die Stücke nicht durch die Figur fliegen
        const lift = Math.sin(Math.PI * e) * 0.6;
        const cx = lerp(cs[0], ct[0], e) - (i === 3 ? lift : 0);
        const cy = lerp(cs[1], ct[1], e) - (i === 1 ? 0 : 0);
        const hx = (Math.cos(th) * len) / 2;
        const hy = (Math.sin(th) * len) / 2;
        drawString(X(cx - hx), Y(cy - hy), X(cx + hx), Y(cy + hy), pc.color, len);
      });
      // Beschriftung, sobald der Faden liegt
      const k = clamp((fp - 0.88) / 0.12, 0, 1);
      if (k <= 0) return;
      const f = fig();
      const theme = ctx.theme;
      const fs = narrow() ? 11.5 : view.cell < 24 ? 12 : 13;
      g.save();
      g.globalAlpha = k;
      const off = lineW() / 2 + 3;
      // oberes Stück oben beschriftet, unteres unten (dazwischen bleibt es frei)
      STRAND_Y.forEach((sy, i) => {
        const ly = i === 0 ? Y(sy) - off : Y(sy) + off;
        const base: CanvasTextBaseline = i === 0 ? 'bottom' : 'top';
        if (f.a * view.cell >= 30) haloText(cm(f.a), X(f.a / 2), ly, `700 ${fs}px ${theme.font}`, colA(), 'center', base);
        if (f.b * view.cell >= 30) haloText(cm(f.b), X(f.a + f.b / 2), ly, `700 ${fs}px ${theme.font}`, colB(), 'center', base);
        haloText(perKnown() ? `= ${cm(f.a + f.b)}` : '= ?', X(f.a + f.b) + lineW() + 6, Y(sy), `800 ${fs}px ${theme.font}`, theme.text, 'left');
      });
      // Klammer links: zwei gleich lange Stücke
      const bx = X(0) - lineW() - 8;
      g.strokeStyle = theme.muted;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(bx + 5, Y(STRAND_Y[0]));
      g.lineTo(bx, Y(STRAND_Y[0]));
      g.lineTo(bx, Y(STRAND_Y[1]));
      g.lineTo(bx + 5, Y(STRAND_Y[1]));
      g.stroke();
      haloText('2 ×', bx - 4, Y((STRAND_Y[0] + STRAND_Y[1]) / 2), `800 ${fs}px ${theme.font}`, theme.muted, 'right');
      // Formel darunter
      const segs: Seg[] = [V(SU), S(' = 2 · ('), S(cm(f.a), colA()), S(' + '), S(cm(f.b), colB()), S(') = '), S(perKnown() ? cm(rectPerimeter(f.a, f.b)) : '?', theme.text, 800)];
      const size = narrow() ? 12.5 : view.cell < 24 ? 13 : 14.5;
      const y = Y(STRAND_Y[1]) + off + fs + 8 + size * 0.85;
      const w = richWidth(segs, size, 650);
      g.fillStyle = withAlpha(paperColor(), 0.85);
      roundRect(g, X(0) - 6, y - size * 0.85, w + 12, size * 1.7, 6);
      g.fill();
      drawRich(segs, X(0), y, size, 650);
      g.restore();
    }

    function walkState(now: number): { s: number; done: boolean; alpha: number } {
      if (!walkAnim) return { s: 0, done: true, alpha: 0 };
      const t = (now - walkAnim.t0) / 1000;
      const s = walkAnim.per * clamp((t - 0.35) / walkAnim.dur, 0, 1);
      const alpha = Math.min(clamp(t / 0.3, 0, 1), clamp((walkAnim.total - t) / 0.35, 0, 1));
      return { s, done: t >= walkAnim.total, alpha };
    }

    function drawWalk(now: number): void {
      if (!walkAnim) return;
      const g = surface.g;
      const an = walkAnim;
      const { s, alpha } = walkState(now);
      const poly = an.poly;
      const lens = sideLengths(poly);
      // Umriss dünn, darüber die Spur
      poly.forEach((q, i) => {
        const r = poly[(i + 1) % poly.length]!;
        strokeSeg(X(q[0]), Y(q[1]), X(r[0]), Y(r[1]), withAlpha(ctx.theme.muted, 0.55), 1.6, 1, [5, 4]);
      });
      let cum = 0;
      poly.forEach((q, i) => {
        const r = poly[(i + 1) % poly.length]!;
        const l = lens[i]!;
        const done = clamp(s - cum, 0, l);
        if (done > 0) {
          const t = done / l;
          drawString(X(q[0]), Y(q[1]), X(lerp(q[0], r[0], t)), Y(lerp(q[1], r[1], t)), sideColor(q, r), done);
        }
        // fertige Seite: Länge beschriften
        if (s >= cum + l - 1e-6 && p.labels) {
          const k = clamp((s - cum - l) / 0.9 + 0.001, 0, 1);
          sideLabel(q, r, cm(l), sideColor(q, r), true, 0, 0, ease.outBack(Math.min(1, k * 1.6)));
        }
        cum += l;
      });
      // Ameise mit Wegzähler
      const ahead = walkAt(poly, Math.min(an.per, s + 0.22));
      const behind = walkAt(poly, Math.max(0, s - 0.22));
      const here = walkAt(poly, s);
      const ang = -Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
      const size = clamp(view.cell * 0.9, 18, 32);
      drawAnt(X(here.x), Y(here.y), size, ang, s * 9, alpha);
      // Zähler außen neben der Ameise
      const q = poly[here.side]!;
      const r = poly[(here.side + 1) % poly.length]!;
      const nx = r[1] - q[1];
      const ny = r[0] - q[0];
      const nl = Math.hypot(nx, ny) || 1;
      // an den Innenkanten der L-Form nach innen, damit der Zähler nicht auf den Beschriftungen im Ausschnitt liegt
      const dist = (size * 0.55 + 16) * (poly.length === 6 && (here.side === 2 || here.side === 3) ? -1 : 1);
      g.save();
      g.globalAlpha = alpha;
      pill(`${n0(Math.floor(s + 1e-6))} cm`, X(here.x) + (nx / nl) * dist, Y(here.y) + (ny / nl) * dist, ctx.theme.text, onColor(), narrow() ? 11.5 : 12.5);
      g.restore();
    }

    /* ---------- Vergleichsmodi ---------- */
    function drawConstraint(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const isU = mode() === 'gleichU';
      const list = candidates();
      const color = isU ? colA() : colArea();
      const fs = narrow() ? 11.5 : 13;
      g.save();
      g.strokeStyle = withAlpha(color, 0.75);
      g.lineWidth = 2;
      g.setLineDash([7, 6]);
      g.beginPath();
      const cur = fig();
      // Beschriftung an dem Ende der Linie bzw. Kurve, das weiter vom gewählten Rechteck entfernt ist
      let labelAt: { x: number; y: number; nx: number; ny: number; rot: number };
      if (isU) {
        const s = p.u / 2;
        g.moveTo(X(0.35), Y(s - 0.35));
        g.lineTo(X(s - 0.35), Y(0.35));
        // halbe Textlänge in cm entlang der Achse, damit der Text nicht in die Beschriftung des Rechtecks läuft
        g.font = `800 ${fs}px ${theme.font}`;
        const hl = (g.measureText(tr('lineU', { s: '00' })).width / 2 / view.cell) * Math.SQRT1_2;
        const la = cur.a <= s / 2 ? clamp(Math.max(s - 1.6, cur.a + 80 / view.cell + hl), s / 2, s - 0.6) : clamp(Math.min(1.6, cur.a - 40 / view.cell - hl), 0.6, s / 2);
        labelAt = { x: la, y: s - la, nx: Math.SQRT1_2, ny: Math.SQRT1_2, rot: Math.PI / 4 };
      } else {
        const A = p.fa;
        const m = A;
        const a0 = A / (m + 0.6);
        const a1 = m + 0.6;
        const n = 80;
        for (let i = 0; i <= n; i++) {
          // logarithmisch verteilt: an beiden Enden gleich fein
          const a = a0 * (a1 / a0) ** (i / n);
          const bb = A / a;
          if (i) g.lineTo(X(a), Y(bb));
          else g.moveTo(X(a), Y(bb));
        }
        const r = Math.sqrt(A);
        g.font = `800 ${fs}px ${theme.font}`;
        const hl = g.measureText(tr('lineA', { A: '00' })).width / 2 / view.cell;
        const far = clamp(Math.max(r * 2.2, cur.b <= r ? 0 : cur.a + 80 / view.cell + hl * 0.8), Math.min(r + 0.8, A), Math.max(1, A - 0.4));
        const la = cur.a <= r ? far : A / clamp(Math.max(r * 2.2, cur.b + 30 / view.cell + hl * 0.8), Math.min(r + 0.8, A), Math.max(1, A - 0.4));
        const slope = A / (la * la);
        const nl = Math.hypot(slope, 1);
        labelAt = { x: la, y: A / la, nx: slope / nl, ny: 1 / nl, rot: Math.atan(slope) };
      }
      g.stroke();
      g.restore();
      // Beschriftung entlang der Linie, nach außen versetzt
      const label = isU ? tr('lineU', { s: n0(p.u / 2) }) : tr('lineA', { A: n0(p.fa) });
      const cx = X(labelAt.x) + labelAt.nx * 19;
      const cy = Y(labelAt.y) - labelAt.ny * 19;
      if (list.length > 1) {
        g.save();
        g.translate(cx, cy);
        g.rotate(labelAt.rot);
        haloText(label, 0, 0, `800 ${fs}px ${theme.font}`, mixColor(color, theme.text, 0.25));
        g.restore();
      }
    }

    function drawCandidates(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const list = candidates();
      const f = fig();
      const allSeen = list.every(([a]) => visited.has(a));
      const best = new Set((mode() === 'gleichU' ? maxAreaRects(p.u) : minPerimeterRects(p.fa)).map((q) => q[0]));
      // schon untersuchte Rechtecke dünn
      for (const [a, b] of list) {
        if (a === f.a || !visited.has(a)) continue;
        const isBest = allSeen && best.has(a);
        g.save();
        g.strokeStyle = isBest ? withAlpha(colOk(), 0.9) : withAlpha(theme.muted, 0.42);
        g.lineWidth = isBest ? 2 : 1.4;
        if (isBest) g.setLineDash([6, 4]);
        g.strokeRect(X(0), Y(b), a * view.cell, b * view.cell);
        g.restore();
      }
      // Ecken aller Rechtecke auf der Linie bzw. Kurve
      for (const [a, b] of list) {
        if (a === f.a) continue;
        const seen = visited.has(a);
        g.beginPath();
        g.arc(X(a), Y(b), 4, 0, Math.PI * 2);
        g.fillStyle = seen ? theme.muted : paperColor();
        g.fill();
        g.strokeStyle = theme.muted;
        g.lineWidth = 1.5;
        g.stroke();
        if (!ctx.locked) hits.push({ id: `pick:${a}`, x: X(a) - 12, y: Y(b) - 12, w: 24, h: 24, prio: 4, cursor: 'pointer' });
      }
    }

    /* ---------- Legende ---------- */
    function drawLegend(R: Rect, fp: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const c = view.cell;
      const fs = narrow() ? 11.5 : 12.5;
      g.font = `700 ${fs}px ${theme.font}`;
      const tw = g.measureText(ctx.t('unit')).width;
      const w = c + 8 + tw + 18;
      const h = Math.max(c, fs * 1.4) + 14;
      // freie Ecke suchen (nicht über der Figur und ihren Beschriftungen)
      const f = fig();
      const m = mode();
      const maxB = m === 'gleichU' || m === 'gleichA' ? Math.max(f.a, f.b, ...candidates().map((q) => q[1])) : Math.max(shown.b, f.b);
      const maxA = m === 'gleichU' || m === 'gleichA' ? Math.max(...candidates().map((q) => q[0]), f.a) : Math.max(shown.a, f.a);
      const fx0 = X(-1.6);
      const fx1 = X(maxA + (fp > 0 ? Math.max(2.6, f.b + 2) : 2.6));
      const fy0 = Y(maxB + 1);
      const fy1 = Y(fp > 0 ? -4.5 : -1.3);
      const spots: [number, number][] = [
        [R.x + R.w - w - 12, R.y + 12],
        [R.x + 12, R.y + 12],
        [R.x + R.w - w - 12, R.y + R.h - h - 12],
      ];
      const spot = spots.find(([x, y]) => x + w < fx0 || x > fx1 || y + h < fy0 || y > fy1);
      if (!spot) return;
      const [x, y] = spot;
      g.save();
      g.fillStyle = withAlpha(paperColor(), 0.92);
      roundRect(g, x, y, w, h, 8);
      g.fill();
      g.strokeStyle = theme.dark ? '#2a3445' : '#dbe2ea';
      g.lineWidth = 1;
      roundRect(g, x + 0.5, y + 0.5, w - 1, h - 1, 8);
      g.stroke();
      g.restore();
      const tx = x + 8;
      const ty = y + (h - c) / 2;
      // eine Fliese in Originalgröße (genau ein Zentimeterquadrat des Blatts)
      const saveView = view;
      view = { cell: c, ox: tx, oy: ty + c };
      drawTile(0, 0, colArea(), 1, 1, null);
      view = saveView;
      text(g, ctx.t('unit'), tx + c + 8, y + h / 2 + 0.5, { font: `700 ${fs}px ${theme.font}`, color: theme.text, align: 'left' });
    }

    /* ---------- Rechte Spalte (bzw. unten): Karten ---------- */
    function itemHeight(it: Item, w: number): number {
      const fsNote = narrow() ? 11.5 : 12.5;
      switch (it.kind) {
        case 'title':
          return 20;
        case 'rich':
          return it.size * 1.55;
        case 'big':
          return it.size * 1.4;
        case 'note':
          return wrap(it.text, w, `600 ${fsNote}px ${ctx.theme.font}`).length * fsNote * 1.35 + 4;
        case 'tip': {
          const rows = wrap(it.text, w - 30, `600 ${fsNote}px ${ctx.theme.font}`).length;
          return Math.max(22, rows * fsNote * 1.35) + 6;
        }
      }
    }

    function drawItem(it: Item, x: number, y: number, w: number): number {
      const theme = ctx.theme;
      const g = surface.g;
      const h = itemHeight(it, w);
      const fsNote = narrow() ? 11.5 : 12.5;
      switch (it.kind) {
        case 'title':
          text(g, it.text, x, y + 9, { font: `700 ${narrow() ? 11 : 12}px ${theme.font}`, color: theme.muted, align: 'left' });
          break;
        case 'rich':
          drawRich(it.segs, x, y + h / 2, it.size, 650);
          break;
        case 'big': {
          const k = pop.running ? pop.value : 1;
          g.save();
          g.translate(x, y + h / 2);
          g.scale(k, k);
          drawRich(it.segs, 0, 0, it.size, 800);
          g.restore();
          break;
        }
        case 'note': {
          const font = `600 ${fsNote}px ${theme.font}`;
          wrap(it.text, w, font).forEach((row, i) => text(g, row, x, y + fsNote * 0.7 + i * fsNote * 1.35, { font, color: it.color ?? theme.muted, align: 'left' }));
          break;
        }
        case 'tip': {
          const font = `600 ${fsNote}px ${theme.font}`;
          const icon = 18;
          const ix = x;
          const iy = y + 3;
          if (it.icon === 'tile') {
            const save = view;
            view = { cell: icon, ox: ix, oy: iy + icon };
            drawTile(0, 0, colArea(), 1, 1, null);
            view = save;
          } else {
            g.lineWidth = 3;
            g.lineCap = 'round';
            const seg = (x1: number, y1: number, x2: number, y2: number, c: string) => {
              g.strokeStyle = c;
              g.beginPath();
              g.moveTo(x1, y1);
              g.lineTo(x2, y2);
              g.stroke();
            };
            const s = it.icon === 'square' ? icon - 4 : icon;
            const hh = it.icon === 'square' ? s : icon * 0.66;
            const oy2 = iy + (icon - hh) / 2;
            seg(ix + 2, oy2 + hh, ix + s, oy2 + hh, colA());
            seg(ix + s, oy2 + hh, ix + s, oy2, colB());
            seg(ix + s, oy2, ix + 2, oy2, colA());
            seg(ix + 2, oy2, ix + 2, oy2 + hh, colB());
          }
          wrap(it.text, w - 30, font).forEach((row, i) => text(g, row, x + 30, y + fsNote * 0.75 + i * fsNote * 1.35, { font, color: theme.text, align: 'left' }));
          break;
        }
      }
      return h;
    }

    const cardPad = () => (narrow() ? 10 : 14);

    function cardHeight(c: CardSpec, inner: number): number {
      return c.items.reduce((s, it) => s + itemHeight(it, inner), 0) + cardPad() + 8;
    }

    function drawCards(R: Rect, cards: CardSpec[]): void {
      const pad = cardPad();
      const gap = narrow() ? 8 : 10;
      const inner = R.w - 2 * pad;
      const heights = cards.map((c) => cardHeight(c, inner));
      // Was nicht passt, fällt weg (von hinten)
      let n = cards.length;
      while (n > 1 && heights.slice(0, n).reduce((s, h) => s + h, 0) + gap * (n - 1) > R.h) n--;
      const used = heights.slice(0, n).reduce((s, h) => s + h, 0) + gap * (n - 1);
      const extra = Math.max(0, R.h - used);
      let y = R.y;
      for (let i = 0; i < n; i++) {
        const c = cards[i]!;
        let h = heights[i]!;
        if (c.stretch && i === n - 1) h += extra;
        card({ x: R.x, y, w: R.w, h }, c.accent, c.tint ?? 0);
        let yy = y + pad - 2;
        for (const it of c.items) yy += drawItem(it, R.x + pad, yy, inner);
        y += h + gap;
      }
    }

    /**
     * Formelzeilen und Ergebnis als Kartenzeilen; auf schmalen Bildschirmen
     * werden Zeilen zusammengefasst, soweit sie nebeneinander passen.
     */
    function formulaItems(rows: Seg[][], bigSegs: Seg[], sz: number, big: number, inner: number): Item[] {
      const joined = joinRows(rows, sz, inner);
      const last = joined[joined.length - 1];
      if (narrow() && last) {
        const merged = [...last, S(' '), ...bigSegs.map((q) => ({ ...q, w: 800 }))];
        if (richWidth(merged, sz, 650) <= inner) {
          joined[joined.length - 1] = merged;
          return joined.map((segs) => ({ kind: 'rich', segs, size: sz }) as Item);
        }
      }
      return [...joined.map((segs) => ({ kind: 'rich', segs, size: sz }) as Item), { kind: 'big', segs: bigSegs, size: big }];
    }

    /** Formelzeilen auf schmalen Bildschirmen zusammenfassen, soweit sie nebeneinander passen. */
    function joinRows(rows: Seg[][], size: number, maxW: number): Seg[][] {
      if (!narrow()) return rows;
      const out: Seg[][] = [];
      for (const r of rows) {
        const last = out[out.length - 1];
        if (last && richWidth([...last, S(' '), ...r], size, 650) <= maxW) out[out.length - 1] = [...last, S(' '), ...r];
        else out.push(r);
      }
      return out;
    }

    function rectCards(now: number, inner: number): CardSpec[] {
      const f = fig();
      const theme = ctx.theme;
      const sz = narrow() ? 14 : 15.5;
      const big = narrow() ? 18 : 22;
      const A = rectArea(f.a, f.b);
      const U = rectPerimeter(f.a, f.b);
      // Flächeninhalt
      const aRows: Seg[][] = [
        [V('A', colArea()), S(' = '), V('a', colA()), S(' · '), V('b', colB())],
        [S('= '), S(cm(f.a), colA()), S(' · '), S(cm(f.b), colB())],
      ];
      let aNote: string;
      const t = fillAnim ? (now - fillAnim.t0) / 1000 : 0;
      if (fillAnim) {
        const laid = fillAnim.cells.filter((_, i) => fillCellState(fillAnim!, i, t).e > 0.45).length;
        const rowsDone = Math.floor(laid / Math.max(1, f.a));
        aNote =
          laid < f.a
            ? T(`1. Reihe: ${laid} ${laid === 1 ? 'Quadrat' : 'Quadrate'} …`, `Row 1: ${laid} ${laid === 1 ? 'square' : 'squares'} …`)
            : T(`${rowsDone} ${rowsDone === 1 ? 'Reihe' : 'Reihen'} mit je ${f.a} ${f.a === 1 ? 'Quadrat' : 'Quadraten'} – ${laid} Quadrate`, `${rowsDone} ${rowsDone === 1 ? 'row' : 'rows'} of ${f.a} – ${laid} squares`);
      } else if (filled) aNote = T(`${f.b} ${f.b === 1 ? 'Reihe' : 'Reihen'} mit je ${f.a} ${f.a === 1 ? 'Quadrat' : 'Quadraten'}: ${f.a} · ${f.b} = ${A} Einheitsquadrate.`, `${f.b} ${f.b === 1 ? 'row' : 'rows'} of ${f.a} ${f.a === 1 ? 'square' : 'squares'}: ${f.a} · ${f.b} = ${A} unit squares.`);
      else if (areaKnown()) aNote = T(`${f.b} ${f.b === 1 ? 'Reihe' : 'Reihen'} mit je ${f.a} ${f.a === 1 ? 'Einheitsquadrat' : 'Einheitsquadraten'}`, `${f.b} ${f.b === 1 ? 'row' : 'rows'} of ${f.a} unit ${f.a === 1 ? 'square' : 'squares'}`);
      else aNote = T('Lege das Rechteck mit Einheitsquadraten aus.', 'Tile the rectangle with unit squares.');
      const aCard: CardSpec = {
        accent: colArea(),
        tint: 0.05,
        items: [{ kind: 'title', text: ctx.t('areaTitle') }, ...formulaItems(aRows, [S('= '), S(areaKnown() ? cm2(A) : '?', areaKnown() ? colArea() : theme.muted)], sz, big, inner), { kind: 'note', text: aNote }],
      };
      // Umfang
      const uRows: Seg[][] = [
        [V(SU), S(' = 2 · '), V('a', colA()), S(' + 2 · '), V('b', colB())],
        [S('= 2 · '), S(cm(f.a), colA()), S(' + 2 · '), S(cm(f.b), colB())],
      ];
      let uNote: string;
      if (walkAnim) {
        const { s } = walkState(now);
        uNote = T(`Die Ameise ist ${n0(Math.floor(s + 1e-6))} cm gelaufen …`, `The ant has walked ${n0(Math.floor(s + 1e-6))} cm …`);
      } else if (perKnown()) uNote = T(`Einmal herum: ${f.a} + ${f.b} + ${f.a} + ${f.b} = ${U}`, `All the way round: ${f.a} + ${f.b} + ${f.a} + ${f.b} = ${U}`);
      else uNote = T('Lass die Ameise einmal herumlaufen.', 'Let the ant walk once around.');
      const uCard: CardSpec = {
        accent: colA(),
        tint: 0.05,
        items: [{ kind: 'title', text: ctx.t('perTitle') }, ...formulaItems(uRows, [S('= '), S(perKnown() ? cm(U) : '?', perKnown() ? theme.text : theme.muted)], sz, big, inner), { kind: 'note', text: uNote }],
      };
      const tip: CardSpec =
        f.a === f.b
          ? { stretch: true, items: [{ kind: 'title', text: ctx.t('tip') }, { kind: 'tip', icon: 'square', text: ctx.t('tipSquare') }] }
          : {
              stretch: true,
              items: [
                { kind: 'title', text: ctx.t('tip') },
                { kind: 'tip', icon: 'tile', text: ctx.t('tipArea') },
                { kind: 'tip', icon: 'frame', text: ctx.t('tipPer') },
              ],
            };
      return [aCard, uCard, tip];
    }

    function lCards(now: number, inner: number): CardSpec[] {
      const f = fig();
      const theme = ctx.theme;
      const sz = narrow() ? 14 : 15;
      const big = narrow() ? 18 : 21;
      if (!f.isL) {
        return [{ accent: colCut(), tint: 0.05, items: [{ kind: 'title', text: T('L-Form', 'L-shape') }, { kind: 'note', text: ctx.t('noL'), color: theme.text }] }, ...rectCards(now, inner).slice(0, 2)];
      }
      const z = p.zerl as Method;
      const A = lArea(f.a, f.b, f.c, f.d);
      const dec = lDecomposition(f.a, f.b, f.c, f.d, z);
      const c1 = colArea();
      const c2 = colPart2();
      let rows: Seg[][];
      let note: string;
      if (z === 'waag' || z === 'senk') {
        const [q1, q2] = dec.parts as [Box, Box];
        rows = [
          [V('A', c1), S(' = '), V('A', c1), S('₁', c1), S(' + '), V('A', c2), S('₂', c2)],
          [S('= '), S(`${q1.w} · ${q1.h}`, c1), S(' + '), S(`${q2.w} · ${q2.h}`, c2)],
          [S('= '), S(n0(q1.w * q1.h), c1), S(' + '), S(n0(q2.w * q2.h), c2)],
        ];
        note = T('Zwei Rechtecke: Flächeninhalte addieren.', 'Two rectangles: add their areas.');
      } else if (z === 'erg') {
        rows = [
          [V('A', c1), S(' = '), V('a', colA()), S(' · '), V('b', colB()), S(' − '), V('c', colCut()), S(' · '), V('d', colCut())],
          [S('= '), S(`${f.a} · ${f.b}`, theme.text), S(' − '), S(`${f.c} · ${f.d}`, colCut())],
          [S('= '), S(n0(f.a * f.b)), S(' − '), S(n0(f.c * f.d), colCut())],
        ];
        note = T('Großes Rechteck minus Ausschnitt.', 'Big rectangle minus the cut-out.');
      } else {
        rows = [];
        note = filled
          ? T(`Gezählt: ${A} Einheitsquadrate.`, `Counted: ${A} unit squares.`)
          : T('Zerlege die Figur in zwei Rechtecke oder ergänze sie zu einem großen Rechteck.', 'Split the shape into two rectangles or complete it to one big rectangle.');
      }
      if (!areaKnown()) rows = rows.slice(0, 2);
      if (fillAnim) {
        const t = (now - fillAnim.t0) / 1000;
        const laid = fillAnim.cells.filter((_, i) => fillCellState(fillAnim!, i, t).e > 0.45).length;
        note = T(`Gezählt: ${laid} …`, `Counted: ${laid} …`);
      }
      const showA = areaKnown() && (z !== 'keine' || filled || p.show);
      const aCard: CardSpec = {
        accent: colArea(),
        tint: 0.05,
        items: [
          { kind: 'title', text: ctx.t('areaTitle') },
          ...formulaItems(rows, [S(rows.length ? '= ' : `A = `), S(showA ? cm2(A) : '?', showA ? colArea() : theme.muted)], sz, big, inner),
          { kind: 'note', text: note },
        ],
      };
      // Umfang: alle sechs Seiten
      const sides = lSides(f.a, f.b, f.c, f.d);
      const poly = lPolygon(f.a, f.b, f.c, f.d);
      const sumSegs: Seg[] = [V(SU), S(' = ')];
      sides.forEach((l, i) => {
        if (i) sumSegs.push(S(' + '));
        sumSegs.push(S(n0(l), sideColor(poly[i]!, poly[(i + 1) % poly.length]!)));
      });
      const U = lPerimeter(f.a, f.b, f.c, f.d);
      const kp = kantenP();
      const uRowsL: Seg[][] = [sumSegs];
      if (kp > 0.5) uRowsL.push([S('= 2 · ('), S(n0(f.a), colA()), S(' + '), S(n0(f.b), colB()), S(')')]);
      const uItems: Item[] = [{ kind: 'title', text: ctx.t('perTitle') }, ...formulaItems(uRowsL, [S('= '), S(perKnown() ? cm(U) : '?', perKnown() ? theme.text : theme.muted)], sz, big, inner)];
      if (walkAnim) {
        const { s } = walkState(now);
        uItems.push({ kind: 'note', text: T(`Die Ameise ist ${n0(Math.floor(s + 1e-6))} cm gelaufen …`, `The ant has walked ${n0(Math.floor(s + 1e-6))} cm …`) });
      }
      const tipText = kp > 0.5 && perKnown() && areaKnown() ? tr('tipLDone', { a: n0(f.a), b: n0(f.b), cut: n0(f.c * f.d) }) : tr('tipL', { a: n0(f.a), b: n0(f.b) });
      return [aCard, { accent: colA(), tint: 0.05, items: uItems }, { stretch: true, items: [{ kind: 'title', text: ctx.t('tip') }, { kind: 'tip', icon: 'frame', text: tipText }] }];
    }

    /* ---------- Vergleich: Karte und Säulendiagramm ---------- */
    function drawComparePanel(R: Rect): void {
      const f = fig();
      const theme = ctx.theme;
      const g = surface.g;
      const isU = mode() === 'gleichU';
      const pad = narrow() ? 10 : 14;
      const sz = narrow() ? 13.5 : 15;
      const big = narrow() ? 16 : 19;
      // Karte: gewähltes Rechteck
      // auf dem Handy nur Überschrift und Rechnung (die Seiten stehen farbig in der Rechnung)
      const h1 = narrow() ? 60 : 104;
      const r1 = { x: R.x, y: R.y, w: R.w, h: h1 };
      card(r1, isU ? colA() : colArea(), 0.05);
      text(g, isU ? tr('sameU', { u: n0(p.u) }) : tr('sameA', { A: n0(p.fa) }), R.x + pad, R.y + (narrow() ? 15 : 19), { font: `700 ${narrow() ? 11 : 12}px ${theme.font}`, color: theme.muted, align: 'left' });
      if (!narrow()) drawRich([V('a', colA()), S(` = ${cm(f.a)},  `), V('b', colB()), S(` = ${cm(f.b)}`)], R.x + pad, R.y + 47, sz, 650);
      const bigY = R.y + (narrow() ? 39 : 79);
      const segs: Seg[] = isU
        ? [V('A', colArea()), S(' = '), S(cm(f.a), colA()), S(' · '), S(cm(f.b), colB()), S(' = '), S(cm2(rectArea(f.a, f.b)), colArea(), 800)]
        : [V(SU), S(' = 2 · ('), S(cm(f.a), colA()), S(' + '), S(cm(f.b), colB()), S(') = '), S(cm(rectPerimeter(f.a, f.b)), theme.text, 800)];
      let bsz = big;
      while (bsz > 12 && richWidth(segs, bsz, 700) > R.w - 2 * pad) bsz -= 0.5;
      g.save();
      const k = pop.running ? pop.value : 1;
      g.translate(R.x + pad, bigY);
      g.scale(k, k);
      drawRich(segs, 0, 0, bsz, 700);
      g.restore();

      // Säulendiagramm
      const r2 = { x: R.x, y: R.y + h1 + 10, w: R.w, h: R.h - h1 - 10 };
      card(r2);
      const list = candidates();
      const vals = list.map(([a, b]) => (isU ? rectArea(a, b) : rectPerimeter(a, b)));
      const allSeen = list.every(([a]) => visited.has(a));
      const best = new Set((isU ? maxAreaRects(p.u) : minPerimeterRects(p.fa)).map((q) => q[0]));
      text(g, ctx.t(isU ? 'chartA' : 'chartU'), r2.x + pad, r2.y + 17, { font: `700 ${narrow() ? 11 : 12}px ${theme.font}`, color: theme.muted, align: 'left' });
      // Fußzeile (zuerst, damit ihre Höhe feststeht)
      const missing = list.filter(([a]) => !visited.has(a)).length;
      let foot: string;
      let footColor = theme.muted;
      if (missing > 0) foot = T(`Noch ${missing} ${missing === 1 ? 'Rechteck' : 'Rechtecke'} unbekannt – zieh die Ecke oder tippe auf eine Säule.`, `${missing} ${missing === 1 ? 'rectangle' : 'rectangles'} still unknown – drag the corner or tap a bar.`);
      else {
        footColor = colOk();
        const bl = [...best].sort((x, y) => x - y);
        const b0 = list.find((q) => q[0] === bl[0])!;
        if (isU) foot = b0[0] === b0[1] ? T(`★ Größter Flächeninhalt beim Quadrat ${b0[0]} cm × ${b0[1]} cm.`, `★ Largest area for the square ${b0[0]} cm × ${b0[1]} cm.`) : T(`★ Größter Flächeninhalt bei ${b0[0]} cm × ${b0[1]} cm – fast ein Quadrat.`, `★ Largest area for ${b0[0]} cm × ${b0[1]} cm – almost a square.`);
        else foot = b0[0] === b0[1] ? T(`★ Kleinster Umfang beim Quadrat ${b0[0]} cm × ${b0[1]} cm.`, `★ Smallest perimeter for the square ${b0[0]} cm × ${b0[1]} cm.`) : list.length === 2 ? T('Nur ein Rechteck (einmal gedreht) – eine Primzahl!', 'Only one rectangle (and its turned copy) – a prime number!') : T(`★ Kleinster Umfang bei ${b0[0]} cm × ${b0[1]} cm.`, `★ Smallest perimeter for ${b0[0]} cm × ${b0[1]} cm.`);
      }
      const font = `650 ${narrow() ? 11 : 12}px ${theme.font}`;
      const rows = wrap(foot, r2.w - 2 * pad, font);
      const footH = rows.length * 15 + 8;
      const xLabH = 34;
      const axisW = 30;
      const plotR = { x: r2.x + pad + axisW, y: r2.y + 36, w: r2.w - 2 * pad - axisW - 4, h: r2.h - 36 - xLabH - footH - 6 };
      const vmax = Math.max(1, ...vals);
      const step = niceStep(vmax, plotR.h > 140 ? 5 : 3);
      const top = Math.ceil((vmax * 1.08) / step) * step;
      const yv = (v: number) => plotR.y + plotR.h - (v / top) * plotR.h;
      const small = narrow() ? 10.5 : 11;
      g.lineWidth = 1;
      for (let v = 0; v <= top + 1e-9; v += step) {
        const y = Math.round(yv(v)) + 0.5;
        g.strokeStyle = v === 0 ? theme.axis : withAlpha(theme.muted, 0.18);
        g.beginPath();
        g.moveTo(plotR.x, y);
        g.lineTo(plotR.x + plotR.w, y);
        g.stroke();
        text(g, n0(v), plotR.x - 6, y, { font: `600 ${small}px ${theme.font}`, color: theme.muted, align: 'right' });
      }
      const n = list.length;
      const slot = plotR.w / Math.max(1, n);
      const bw = Math.min(slot * 0.68, 38);
      const longLabels = slot >= 34;
      list.forEach(([a, b], i) => {
        const cx = plotR.x + slot * (i + 0.5);
        const cur = a === f.a;
        const seen = visited.has(a);
        const v = vals[i]!;
        const base = isU ? colArea() : colA();
        const isBest = allSeen && best.has(a);
        if (seen) {
          const y = yv(v);
          const color = isBest ? colOk() : base;
          g.save();
          if (cur) {
            g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.18)';
            g.shadowBlur = 8;
            g.shadowOffsetY = 2;
          }
          g.fillStyle = cur ? color : withAlpha(color, theme.dark ? 0.5 : 0.42);
          roundRect(g, cx - bw / 2, y, bw, plotR.y + plotR.h - y, Math.min(5, bw / 3));
          g.fill();
          g.restore();
          if (slot >= 15) text(g, n0(v), cx, y - 9, { font: `${cur ? 800 : 650} ${small}px ${theme.font}`, color: cur ? (isBest ? colOk() : theme.text) : theme.muted });
          if (isBest && slot >= 15) text(g, '★', cx, y - 23, { font: `700 ${small + 2}px ${theme.font}`, color: colOk() });
        } else {
          g.save();
          g.strokeStyle = withAlpha(theme.muted, 0.5);
          g.setLineDash([3, 3]);
          g.lineWidth = 1.2;
          roundRect(g, cx - bw / 2 + 0.5, plotR.y + plotR.h - 16.5, bw - 1, 16, 3);
          g.stroke();
          g.restore();
          text(g, '?', cx, plotR.y + plotR.h - 8, { font: `700 ${small}px ${theme.font}`, color: theme.muted });
        }
        const lab = longLabels ? `${a}×${b}` : String(a);
        text(g, lab, cx, plotR.y + plotR.h + 11, { font: `${cur ? 800 : 600} ${small}px ${theme.font}`, color: cur ? theme.text : theme.muted });
        if (!ctx.locked) hits.push({ id: `pick:${a}`, x: cx - slot / 2, y: plotR.y, w: slot, h: plotR.h + 20, prio: 6, cursor: 'pointer' });
      });
      text(g, ctx.t(longLabels ? 'axisRect' : 'axisA'), plotR.x + plotR.w / 2, plotR.y + plotR.h + 27, { font: `600 ${small}px ${theme.font}`, color: theme.muted });
      rows.forEach((row, i) => text(g, row, r2.x + pad, r2.y + r2.h - footH + 6 + i * 15, { font, color: footColor, align: 'left' }));
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const f = fig();
      const m = mode();
      const vA = '<var>a</var>';
      const vB = '<var>b</var>';
      if (m === 'lform' && f.isL) {
        ctx.readout('fig', T(`L-Form aus dem Rechteck ${f.a} cm × ${f.b} cm, Ausschnitt ${f.c} cm × ${f.d} cm`, `L-shape from the rectangle ${f.a} cm × ${f.b} cm, cut-out ${f.c} cm × ${f.d} cm`));
        const z = p.zerl as Method;
        const A = lArea(f.a, f.b, f.c, f.d);
        if (z === 'waag' || z === 'senk') {
          const [q1, q2] = lDecomposition(f.a, f.b, f.c, f.d, z).parts as [Box, Box];
          ctx.readout('area', { html: `<var>A</var> = ${cm(q1.w)} · ${cm(q1.h)} + ${cm(q2.w)} · ${cm(q2.h)} = ${cm2(q1.w * q1.h)} + ${cm2(q2.w * q2.h)} = <strong>${cm2(A)}</strong>` });
        } else ctx.readout('area', { html: `<var>A</var> = ${cm(f.a)} · ${cm(f.b)} − ${cm(f.c)} · ${cm(f.d)} = ${cm2(f.a * f.b)} − ${cm2(f.c * f.d)} = <strong>${cm2(A)}</strong>` });
        const sides = lSides(f.a, f.b, f.c, f.d);
        ctx.readout('per', { html: `<var>${SU}</var> = ${sides.map((l) => n0(l)).join(' cm + ')} cm = <strong>${cm(lPerimeter(f.a, f.b, f.c, f.d))}</strong> = 2 · (${cm(f.a)} + ${cm(f.b)})` });
        ctx.readout('best', null);
        ctx.readout('list', null);
        return;
      }
      if (m === 'lform') ctx.readout('fig', ctx.t('noL'));
      else if (m === 'gleichU') ctx.readout('fig', T(`Rechteck mit a = ${cm(f.a)} und b = ${cm(f.b)} (U = ${cm(p.u)} fest)`, `Rectangle with a = ${cm(f.a)} and b = ${cm(f.b)} (P = ${cm(p.u)} fixed)`));
      else if (m === 'gleichA') ctx.readout('fig', T(`Rechteck mit a = ${cm(f.a)} und b = ${cm(f.b)} (A = ${cm2(p.fa)} fest)`, `Rectangle with a = ${cm(f.a)} and b = ${cm(f.b)} (A = ${cm2(p.fa)} fixed)`));
      else ctx.readout('fig', f.a === f.b ? T(`Quadrat mit a = b = ${cm(f.a)}`, `Square with a = b = ${cm(f.a)}`) : T(`Rechteck mit a = ${cm(f.a)} und b = ${cm(f.b)}`, `Rectangle with a = ${cm(f.a)} and b = ${cm(f.b)}`));
      ctx.readout('area', { html: `<var>A</var> = ${vA} · ${vB} = ${cm(f.a)} · ${cm(f.b)} = <strong>${cm2(rectArea(f.a, f.b))}</strong>` });
      ctx.readout('per', { html: `<var>${SU}</var> = 2 · ${vA} + 2 · ${vB} = 2 · ${cm(f.a)} + 2 · ${cm(f.b)} = <strong>${cm(rectPerimeter(f.a, f.b))}</strong>` });
      if (m === 'gleichU' || m === 'gleichA') {
        const list = candidates();
        const isU = m === 'gleichU';
        const best = isU ? maxAreaRects(p.u) : minPerimeterRects(p.fa);
        const b0 = best[0]!;
        const bestTxt = best.map(([a, b]) => `${a} cm × ${b} cm`).join(T(' bzw. ', ' or '));
        if (isU)
          ctx.readout(
            'best',
            b0[0] === b0[1]
              ? T(`Bei U = ${cm(p.u)} hat das Quadrat ${bestTxt} den größten Flächeninhalt: ${cm2(b0[0] * b0[1])}.`, `For P = ${cm(p.u)} the square ${bestTxt} has the largest area: ${cm2(b0[0] * b0[1])}.`)
              : T(`Bei U = ${cm(p.u)} haben ${bestTxt} den größten Flächeninhalt (${cm2(b0[0] * b0[1])}) – ein Quadrat mit ganzzahligen Seiten gibt es hier nicht.`, `For P = ${cm(p.u)}, ${bestTxt} have the largest area (${cm2(b0[0] * b0[1])}) – there is no square with whole-number sides.`),
          );
        else {
          const first = list[0]!;
          ctx.readout(
            'best',
            T(`Bei A = ${cm2(p.fa)} hat ${bestTxt} den kleinsten Umfang (${cm(rectPerimeter(b0[0], b0[1]))}), der Streifen ${first[0]} cm × ${first[1]} cm den größten (${cm(rectPerimeter(first[0], first[1]))}).`, `For A = ${cm2(p.fa)}, ${bestTxt} has the smallest perimeter (${cm(rectPerimeter(b0[0], b0[1]))}), the strip ${first[0]} cm × ${first[1]} cm the largest (${cm(rectPerimeter(first[0], first[1]))}).`),
          );
        }
        const head = `<tr><th><var>a</var> in cm</th><th><var>b</var> in cm</th><th><var>A</var> in cm²</th><th><var>${SU}</var> in cm</th></tr>`;
        const body = list.map(([a, b]) => `<tr${a === f.a ? ' class="is-current"' : ''}><td>${a}</td><td>${b}</td><td>${a * b}</td><td>${2 * (a + b)}</td></tr>`).join('');
        ctx.readout('list', { html: `<table class="mini-table">${head}${body}</table>` });
      } else {
        ctx.readout('best', null);
        ctx.readout('list', null);
      }
    }

    /* ---------- Abläufe ---------- */
    function stopScan(): void {
      if (scanTimer) clearTimeout(scanTimer);
      scanTimer = null;
      if (scanning) {
        scanning = false;
        ctx.setAction('scan', { enabled: true });
      }
    }

    function cancelAnims(): void {
      fillAnim = null;
      walkAnim = null;
      stopScan();
    }

    function startFill(): void {
      const f = fig();
      const cells = unitCells(figPoly(f));
      const rows = !f.isL;
      const d1 = Math.min(0.3, 2.2 / Math.max(1, f.a));
      const t1 = 0.25 + f.a * d1 + 0.45;
      const d3 = Math.min(0.6, 2.4 / Math.max(1, f.b - 1));
      const dg = clamp(4 / cells.length, 0.05, 0.22);
      const total = rows ? t1 + Math.max(0, f.b - 1) * d3 + 0.5 + 0.5 : 0.2 + cells.length * dg + 0.6;
      walkAnim = null;
      filled = false;
      if (reduced) {
        filled = true;
        pop.play();
        return;
      }
      fillAnim = { t0: performance.now(), cells, rows, a: f.a, b: f.b, d1, t1, d3, dg, total };
    }

    function startWalk(): void {
      const f = fig();
      fillAnim = null;
      walked = false;
      if (mode() === 'rechteck' && p.faden) {
        fadenInstant = true;
        ctx.set({ faden: false });
      }
      if (mode() === 'lform' && p.kanten) ctx.set({ kanten: false });
      kantenTween.finish();
      const poly = figPoly(f);
      const per = f.isL ? lPerimeter(f.a, f.b, f.c, f.d) : rectPerimeter(f.a, f.b);
      if (reduced) {
        finishWalk();
        return;
      }
      const dur = clamp(per * 0.24, 2.4, 7);
      walkAnim = { t0: performance.now(), poly, per, dur, total: 0.35 + dur + 0.5 };
    }

    function finishWalk(): void {
      walkAnim = null;
      walked = true;
      pop.play();
      if (mode() === 'rechteck' && !p.faden && !ctx.locked) {
        if (fadenTimer) clearTimeout(fadenTimer);
        fadenTimer = setTimeout(() => {
          fadenTimer = null;
          if (mode() === 'rechteck' && !p.faden) ctx.set({ faden: true });
        }, 250);
      }
    }

    function scanStep(i: number): void {
      const list = candidates();
      if (i >= list.length) {
        stopScan();
        ctx.requestRender();
        return;
      }
      ctx.set({ w: list[i]![0] });
      scanTimer = setTimeout(() => scanStep(i + 1), 520);
    }

    function startScan(): void {
      cancelAnims();
      const list = candidates();
      if (reduced) {
        for (const [a] of list) visited.add(a);
        pop.play();
        return;
      }
      scanning = true;
      ctx.setAction('scan', { enabled: false });
      scanStep(0);
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): Hit | null {
      if (ctx.locked || fillAnim || walkAnim) return null;
      let best: Hit | null = null;
      let bestD = Infinity;
      for (const h of hits) {
        if (px < h.x || px > h.x + h.w || py < h.y || py > h.y + h.h) continue;
        const d = Math.hypot(px - (h.x + h.w / 2), py - (h.y + h.h / 2)) + h.prio;
        if (d < bestD) {
          best = h;
          bestD = d;
        }
      }
      return best;
    }

    function dragTo(px: number, py: number): void {
      const x = (px - view.ox) / view.cell;
      const y = (view.oy - py) / view.cell;
      const m = mode();
      if (drag === 'corner' && m === 'rechteck') ctx.set({ a: clamp(Math.round(x), 1, A_MAX), b: clamp(Math.round(y), 1, B_MAX) });
      else if (drag === 'right') ctx.set({ a: clamp(Math.round(x), 1, A_MAX) });
      else if (drag === 'top') ctx.set({ b: clamp(Math.round(y), 1, B_MAX) });
      else if (drag === 'outer') {
        const a = clamp(Math.round(x), 2, A_MAX);
        const b = clamp(Math.round(y), 2, B_MAX);
        ctx.set({ a, b, c: clamp(p.c, 1, a - 1), d: clamp(p.d, 1, b - 1) });
      } else if (drag === 'notch') {
        const f = fig();
        ctx.set({ c: clamp(f.a - Math.round(x), 1, f.a - 1), d: clamp(f.b - Math.round(y), 1, f.b - 1) });
      } else if (drag === 'corner' && m === 'gleichU') ctx.set({ w: snapToPerimeter(p.u, x, y) });
      else if (drag === 'corner' && m === 'gleichA') ctx.set({ w: snapToArea(p.fa, x, y) });
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        cancelAnims();
        if (h.id.startsWith('pick:')) {
          ctx.set({ w: Number(h.id.slice(5)) });
          return true;
        }
        drag = h.id;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (drag) dragTo(pt.px, pt.py);
      },
      pointerUp: () => {
        if (!drag) return;
        drag = null;
        surface.setCursor(hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt ? hitAt(pt.px, pt.py) : null;
        const id = h?.id ?? null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        if (!drag) surface.setCursor(h ? h.cursor : '');
      },
      wheel: () => false,
    });

    /* ---------- Zeichnen ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastFrame) / 1000);
      lastFrame = now;
      const morphing = stepShown(dt);
      const key = `${surface.width}x${surface.height}`;
      if (key !== sizeKey) {
        sizeKey = key;
        viewTween.finish();
      }
      // Abläufe beenden
      if (fillAnim && (now - fillAnim.t0) / 1000 >= fillAnim.total) {
        fillAnim = null;
        filled = true;
        pop.play();
      }
      if (walkAnim && walkState(now).done) finishWalk();

      hits = [];
      surface.begin();
      reg = computeRegions(now);
      view = currentView();
      const { paper, panel } = reg;
      const g = surface.g;
      const m = mode();
      const f = fig();
      const fp = fadenP();
      drawPaper(paper);
      g.save();
      roundRect(g, paper.x + 2, paper.y + 2, paper.w - 4, paper.h - 4, 12);
      g.clip();
      if (m === 'gleichU' || m === 'gleichA') {
        drawConstraint();
        drawCandidates();
      }
      drawFigure(now);
      if (m === 'rechteck' && !walkAnim) {
        // dünner Rand, darüber der Faden (liegt am Rechteck oder wird abgewickelt)
        if (fp > 0) shownPoly().forEach((q, i, poly) => {
          const r = poly[(i + 1) % poly.length]!;
          strokeSeg(X(q[0]), Y(q[1]), X(r[0]), Y(r[1]), withAlpha(ctx.theme.muted, 0.6), 1.5, 1, [5, 4]);
        });
        drawStrands(fp);
      }
      drawSideLabels();
      drawFillGuides(now);
      drawWalk(now);
      // Griffe
      if (!fillAnim && !walkAnim) {
        if (m === 'rechteck') {
          if (!ctx.locked) {
            const top = Y(shown.b);
            const bottom = Y(0);
            const left = X(0);
            const right = X(shown.a);
            if (bottom - top > 44) hits.push({ id: 'right', x: right - 8, y: top + 18, w: 16, h: bottom - top - 36, prio: 30, cursor: 'ew-resize' });
            if (right - left > 44) hits.push({ id: 'top', x: left + 18, y: top - 8, w: right - left - 36, h: 16, prio: 30, cursor: 'ns-resize' });
          }
          handleDot(X(shown.a), Y(shown.b), ctx.theme.text, 'corner', 'grab');
        } else if (m === 'lform') {
          if (f.isL) {
            handleDot(X(shown.a - shown.c), Y(shown.b - shown.d), colCut(), 'notch', 'grab');
            if (kantenP() < 0.5) handleDot(X(shown.a), Y(shown.b), ctx.theme.text, 'outer', 'grab', true);
            else handleDot(X(shown.a), Y(shown.b), ctx.theme.text, 'outer', 'grab');
          } else handleDot(X(shown.a), Y(shown.b), ctx.theme.text, 'outer', 'grab');
        } else handleDot(X(shown.a), Y(shown.b), ctx.theme.text, 'corner', 'grab');
      }
      // gemeinsame Ecke
      g.fillStyle = ctx.theme.text;
      g.beginPath();
      g.arc(X(0), Y(0), 3.5, 0, Math.PI * 2);
      g.fill();
      drawLegend(paper, fp);
      g.restore();

      if (m === 'gleichU' || m === 'gleichA') drawComparePanel(panel);
      else {
        const inner = panel.w - 2 * cardPad();
        drawCards(panel, m === 'lform' ? lCards(now, inner) : rectCards(now, inner));
      }

      const busy = morphing || fillAnim !== null || walkAnim !== null || fadenTween.running || zerlTween.running || kantenTween.running || viewTween.running || pop.running;
      if (busy) ctx.requestRender();
    }

    let lastMode = mode();

    return {
      update(changed, source) {
        const m = mode();
        if (source === 'input') {
          // abhängige Werte nachführen (nur bei Bedienung von Hand)
          if (m === 'lform' && (changed.has('a') || changed.has('b')) && canCut(p.a, p.b)) {
            const [c, d] = clampCut(p.a, p.b, p.c, p.d);
            if (c !== p.c || d !== p.d) ctx.set({ c, d });
          }
          if ((m === 'gleichU' || m === 'gleichA') && (changed.has('u') || changed.has('fa') || changed.has('w') || changed.has('mode'))) {
            const a = fig().a;
            if (a !== p.w) ctx.set({ w: a });
          }
        }
        if (source !== 'sim') stopScan();
        const geom = ['mode', 'a', 'b', 'c', 'd', 'u', 'fa', 'w'].some((k) => changed.has(k));
        if (geom) {
          fillAnim = null;
          filled = false;
          walkAnim = null;
          walked = false;
        }
        if (changed.has('mode') || changed.has('u') || changed.has('fa') || source === 'init' || source === 'replace') visited.clear();
        if (m === 'gleichU' || m === 'gleichA') visited.add(fig().a);
        if (changed.has('faden')) {
          if (fadenInstant || source === 'init' || reduced) fadenTween.finish();
          else fadenTween.play();
          fadenInstant = false;
        }
        if (changed.has('zerl')) {
          zerlFrom = zerlLast;
          zerlLast = p.zerl as Method;
          if (source === 'init') zerlTween.finish();
          else zerlTween.play();
        }
        if (changed.has('kanten')) {
          if (source === 'init') kantenTween.finish();
          else kantenTween.play();
        }
        if (source === 'init') snapShown();
        if (m !== lastMode || changed.has('u') || changed.has('fa')) {
          if (source !== 'init') {
            viewFrom = view;
            viewTween.play();
          }
          if (m !== lastMode && (m === 'gleichU' || m === 'gleichA' || lastMode === 'gleichU' || lastMode === 'gleichA')) snapShown();
        }
        lastMode = m;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'fill') startFill();
        else if (id === 'walk') startWalk();
        else if (id === 'scan') startScan();
        ctx.requestRender();
      },

      render,
      destroy: () => {
        stopScan();
        if (fadenTimer) clearTimeout(fadenTimer);
        surface.destroy();
      },
    };
  },
});
