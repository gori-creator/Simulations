import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import { add, axisStep, bestRS, histogram, meanSq, walkEnd, between, centroid, collinear, coplanar, degenerate, det3, divide, hasVec, isZero, latticeOnSphere, lengthSteps, linComb, midpoint, multipleOf, neg, norm, normSq, randomVec, scale, spatCorner, spatCorners, sortSteps, stepCounts, sub, sumOf, triangleMids, unit, walkPositions, type V3 } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

type Op = 'add' | 'sub' | 'scale' | 'lin' | 'ab' | 'goal' | 'spat' | 'len' | 'tri' | 'walk';

/** Alle ganzzahligen Vektoren der Länge 3 (Lösungsmenge der Entdeckungsaufgabe). */
const LATTICE3 = latticeOnSphere(9, 4);
const GOAL_N = 5;

/** Weich gleitender Wert. */
class Glide {
  private from: number;
  private to: number;
  private t0 = 0;
  private ms = 0;
  constructor(
    v: number,
    private readonly reduced: boolean,
  ) {
    this.from = v;
    this.to = v;
  }
  at(now: number): number {
    if (this.ms <= 0) return this.to;
    const u = clamp((now - this.t0) / this.ms, 0, 1);
    return this.from + (this.to - this.from) * ease.inOutCubic(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  go(to: number, ms = 500): void {
    if (to === this.to) return;
    const now = performance.now();
    this.from = this.at(now);
    this.to = to;
    this.t0 = now;
    this.ms = this.reduced ? 0 : ms;
  }
  snap(v: number): void {
    this.from = this.to = v;
    this.ms = 0;
  }
}

const comp = <K extends string>(key: K, label: string, def: number, show: (v: Record<string, unknown>) => boolean) => ({
  key,
  type: 'number' as const,
  label: L(label, label),
  min: -4,
  max: 4,
  step: 0.5,
  default: def,
  visibleIf: show,
});

/**
 * Vektoren im Raum addieren, subtrahieren und vervielfachen: Pfeile mit
 * ziehbaren Spitzen, „Spitze an Fuß“ und Parallelogramm animiert,
 * Gegenvektor, Linearkombination mit aufgespannter Ebene und
 * Verbindungsvektor AB = B − A mit Mittelpunkt. Dazu zwei Entdeckungsansichten:
 * eine Linearkombination finden (Ziel c, Spitze in der Ebene ziehen; unmöglich,
 * wenn c nicht in der Ebene liegt) und Vektorzüge im Spat (Ecke antippen).
 * Außerdem: Länge mit zweimal Pythagoras und Einheitsvektor (Aufgabe: ganzzahlige
 * Vektoren der Länge 3 finden, danach erscheint die Kugel mit allen 30 Lösungen)
 * sowie Dreieck mit Seitenmitten und Schwerpunkt S = ⅓ (A + B + C) und ein
 * Zufallsweg aus vielen Einheitsschritten (sortierbar: gleicher Endpunkt).
 * Sonderfälle (Nullvektor, parallele Vektoren, flacher Spat, entartetes Dreieck) werden angesagt.
 */
export default defineSimulation({
  id: 'vektoren-3d',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.72 },
  groups: [
    { id: 'vec', label: L('Vektoren', 'Vectors') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'op',
      type: 'choice',
      label: L('Rechnung', 'Operation'),
      options: [
        { value: 'add', label: L('a + b', 'a + b') },
        { value: 'sub', label: L('a − b', 'a − b') },
        { value: 'scale', label: L('k · a', 'k · a') },
        { value: 'lin', label: L('r · a + s · b', 'r · a + s · b') },
        { value: 'ab', label: L('Verbindungsvektor AB', 'Vector AB') },
        { value: 'goal', label: L('Linearkombination finden', 'Find a linear combination') },
        { value: 'spat', label: L('Vektorzug im Spat', 'Vector paths in a parallelepiped') },
        { value: 'len', label: L('Länge und Einheitsvektor', 'Length and unit vector') },
        { value: 'tri', label: L('Dreieck und Schwerpunkt', 'Triangle and centroid') },
        { value: 'walk', label: L('Zufallsweg', 'Random walk') },
      ],
      default: 'add',
    },
    { key: 'k', type: 'number', label: L('Faktor k', 'Factor k'), min: -3, max: 3, step: 0.25, default: 2, visibleIf: (v) => v.op === 'scale' },
    { key: 'r', type: 'number', label: L('Faktor r', 'Factor r'), min: -2, max: 2, step: 0.25, default: 1.5, visibleIf: (v) => v.op === 'lin' || v.op === 'goal' },
    { key: 's', type: 'number', label: L('Faktor s', 'Factor s'), help: L('Bei „finden“: oder die Spitze im Bild ziehen.', 'For “find”: or drag the tip in the picture.'), min: -2, max: 2, step: 0.25, default: 0.5, visibleIf: (v) => v.op === 'lin' || v.op === 'goal' },
    { ...comp('a1', 'a₁', 2, (v) => v.op !== 'walk'), group: 'vec', help: L('Bei „Verbindungsvektor“: Koordinaten des Punktes A bzw. B.', 'For “vector AB”: coordinates of point A and B.') },
    { ...comp('a2', 'a₂', 4, (v) => v.op !== 'walk'), group: 'vec' },
    { ...comp('a3', 'a₃', 0, (v) => v.op !== 'walk'), group: 'vec' },
    { ...comp('b1', 'b₁', 1, (v) => v.op !== 'scale' && v.op !== 'len' && v.op !== 'walk'), group: 'vec' },
    { ...comp('b2', 'b₂', -1, (v) => v.op !== 'scale' && v.op !== 'len' && v.op !== 'walk'), group: 'vec' },
    { ...comp('b3', 'b₃', 3, (v) => v.op !== 'scale' && v.op !== 'len' && v.op !== 'walk'), group: 'vec' },
    { ...comp('c1', 'c₁', 0, (v) => v.op === 'goal' || v.op === 'spat' || v.op === 'tri'), group: 'vec', help: L('Ziel c, dritte Kante des Spats bzw. Punkt C.', 'Target c, third edge of the parallelepiped or point C.') },
    { ...comp('c2', 'c₂', 0, (v) => v.op === 'goal' || v.op === 'spat' || v.op === 'tri'), group: 'vec' },
    { ...comp('c3', 'c₃', 3, (v) => v.op === 'goal' || v.op === 'spat' || v.op === 'tri'), group: 'vec' },
    { key: 'par', type: 'boolean', group: 'view', label: L('Parallelogramm', 'Parallelogram'), default: true, visibleIf: (v) => v.op === 'add' || v.op === 'sub' || v.op === 'lin' },
    { key: 'sph', type: 'boolean', group: 'view', label: L('Einheitskugel (Radius 1)', 'Unit sphere (radius 1)'), default: true, visibleIf: (v) => v.op === 'len' },
    { key: 'med', type: 'boolean', group: 'view', label: L('Seitenhalbierende', 'Medians'), default: true, visibleIf: (v) => v.op === 'tri' },
    { key: 'tp', type: 'boolean', group: 'view', label: L('Teilpunkt T auf der Geraden AB', 'Dividing point T on the line AB'), default: false, visibleIf: (v) => v.op === 'tri' },
    { key: 't', type: 'number', label: L('Teilfaktor t (T = A + t · AB)', 'Factor t (T = A + t · AB)'), min: -0.5, max: 1.5, step: 0.05, default: 0.25, visibleIf: (v) => v.op === 'tri' && v.tp === true },
    { key: 'many', type: 'boolean', label: L('Viele Wege vergleichen', 'Compare many walks'), default: false, visibleIf: (v) => v.op === 'walk' },
    { key: 'wn', type: 'number', label: L('Schritte je Weg', 'Steps per walk'), min: 5, max: 50, step: 5, default: 20, visibleIf: (v) => v.op === 'walk' && v.many === true },
    { key: 'sort', type: 'boolean', group: 'view', label: L('Schritte nach Achsen sortieren', 'Sort steps by axis'), default: false, visibleIf: (v) => v.op === 'walk' && v.many !== true },
    { key: 'comps', type: 'boolean', group: 'view', label: L('Komponenten als Weg', 'Components as a path'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnis anzeigen', 'Show result'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Animation abspielen', 'Play animation'), primary: true, visibleIf: (v) => v.op !== 'walk' },
    { id: 'w10', label: L('10 Schritte', '10 steps'), primary: true, visibleIf: (v) => v.op === 'walk' && v.many !== true },
    { id: 'w1', label: L('1 Schritt', '1 step'), visibleIf: (v) => v.op === 'walk' && v.many !== true },
    { id: 'w100', label: L('100 Schritte', '100 steps'), visibleIf: (v) => v.op === 'walk' && v.many !== true },
    { id: 'w500', label: L('500 Wege', '500 walks'), primary: true, visibleIf: (v) => v.op === 'walk' && v.many === true },
    { id: 'wclear', label: L('Neu starten', 'Restart'), visibleIf: (v) => v.op === 'walk' },
    { id: 'solve', label: L('Lösung zeigen', 'Show solution'), visibleIf: (v) => v.op === 'goal' },
    { id: 'rand', label: L('Neue Vektoren', 'New vectors'), visibleIf: (v) => v.op !== 'walk' },
    { id: 'hint', label: L('Alle Lösungen zeigen', 'Show all solutions'), visibleIf: (v) => v.op === 'len' },
    { id: 'clear', label: L('Neu anfangen', 'Start over'), visibleIf: (v) => v.op === 'len' },
  ],
  readouts: [
    { key: 'res', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'len', label: L('Länge', 'Length'), spoiler: true },
    { key: 'info', label: L('Hinweis', 'Note'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('Addition: Spitze an Fuß', 'Addition: tip to tail'), values: {} },
    { id: 'sub', label: L('Subtraktion', 'Subtraction'), values: { op: 'sub' } },
    { id: 'neg', label: L('Gegenvektor (k = −1)', 'Opposite vector (k = −1)'), values: { op: 'scale', k: -1 } },
    { id: 'half', label: L('Halber Vektor', 'Half a vector'), values: { op: 'scale', k: 0.5, a1: 2, a2: 4, a3: 3 } },
    { id: 'lin', label: L('Linearkombination: Ebene', 'Linear combination: plane'), values: { op: 'lin', r: 1.5, s: 0.5 } },
    { id: 'ab', label: L('Verbindungsvektor und Mittelpunkt', 'Connecting vector and midpoint'), values: { op: 'ab', a1: 3, a2: -1, a3: 1, b1: -1, b2: 3, b3: 3 } },
    { id: 'chk', label: L('(1 | 2 | 3) + (2 | −1 | 0)', '(1, 2, 3) + (2, −1, 0)'), values: { a1: 1, a2: 2, a3: 3, b1: 2, b2: -1, b3: 0 } },
    { id: 'zero', label: L('Gegenvektoren: Summe ist o', 'Opposite vectors: sum is o'), values: { a1: 1, a2: 2, a3: 3, b1: -1, b2: -2, b3: -3 } },
    { id: 'goal', label: L('Linearkombination finden', 'Find a linear combination'), values: { op: 'goal', c1: 3, c2: 3, c3: 3, r: 0.5, s: 0.5 } },
    { id: 'nogoal', label: L('Ziel außerhalb der Ebene', 'Target outside the plane'), values: { op: 'goal', c1: 0, c2: 0, c3: 3, r: 0.5, s: 0.5 } },
    { id: 'len', label: L('Länge von (1 | 2 | 2)', 'Length of (1, 2, 2)'), values: { op: 'len', a1: 1, a2: 2, a3: 2 } },
    { id: 'unit', label: L('Einheitsvektor zu (0 | 3 | 4)', 'Unit vector of (0, 3, 4)'), values: { op: 'len', a1: 0, a2: 3, a3: 4 } },
    { id: 'tri', label: L('Schwerpunkt eines Dreiecks', 'Centroid of a triangle'), values: { op: 'tri', a1: 3, a2: 0, a3: 0, b1: 0, b2: 3, b3: 0, c1: 0, c2: 0, c3: 3 } },
    { id: 'teil', label: L('Teilpunkt: AT : TB = 1 : 3', 'Dividing point: AT : TB = 1 : 3'), values: { op: 'tri', a1: 3, a2: 0, a3: 0, b1: -1, b2: 4, b3: 0, c1: 0, c2: 0, c3: 3, tp: true, t: 0.25, med: false } },
    { id: 'trideg', label: L('Drei Punkte auf einer Geraden', 'Three points on a line'), values: { op: 'tri', a1: 1, a2: 1, a3: 0, b1: 2, b2: 2, b3: 1, c1: 3, c2: 3, c3: 2 } },
    { id: 'walk', label: L('Zufallsweg', 'Random walk'), values: { op: 'walk' } },
    { id: 'many', label: L('Viele Zufallswege: √n', 'Many random walks: √n'), values: { op: 'walk', many: true, wn: 20 } },
    { id: 'spat', label: L('Vektorzug im Spat', 'Vector paths in a parallelepiped'), values: { op: 'spat', a1: 3, a2: 0, a3: 0, b1: 1, b2: 3, b3: 0, c1: 0.5, c2: 0.5, c3: 2.5 } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit Vektorpfeilen a und b, deren Summe, Differenz, Vielfachem oder Linearkombination, einem Zielvektor c zum Nachbauen oder einem Spat aus a, b und c mit antippbaren Ecken; Spitzen ziehbar, Ansicht drehbar' },
    en: { canvas: 'Three-dimensional coordinate system with vector arrows a and b and their sum, difference, multiple or linear combination, a target vector c to rebuild, or a parallelepiped spanned by a, b and c with tappable corners; draggable tips, rotatable view' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const op = () => p.op as Op;
    const G = (v: number) => new Glide(v, reduced);

    function regions(): { scene: Rect; panel: Rect; wide: boolean } {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.3, 230, 320));
        const tall = op() === 'len' || op() === 'tri' || op() === 'walk';
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: tall ? H - 12 : Math.min(H - 12, 320) } };
      }
      const ph = Math.round(clamp(H * 0.38, 150, op() === 'len' || op() === 'tri' || op() === 'walk' ? 230 : 200));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 28, elevation: 20, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene, onTap: (px, py) => tapSpat(px, py), tapCursor: (px, py) => op() === 'spat' && spatAt(px, py) !== null });

    /* ---------------- Zustand ---------------- */
    const ga = [G(p.a1), G(p.a2), G(p.a3)];
    const gb = [G(p.b1), G(p.b2), G(p.b3)];
    const gc3 = [G(p.c1), G(p.c2), G(p.c3)];
    /** Gewählte Ecke im Spat (Faktoren von a, b, c) und Start der Weg-Animation. */
    let spatSel: [number, number, number] = [1, 1, 1];
    let spatT0 = -1e9;
    const SPAT_MS = 1800;
    let goalHit = -1e9;
    const gk = G(p.k);
    const gr = G(p.r);
    const gs = G(p.s);
    const parA = G(p.par ? 1 : 0);
    const compA = G(p.comps ? 1 : 0);
    const extent = G(5);
    let now = performance.now();
    let introStart = now + (reduced ? -1e6 : 100);
    /** Ablauf der Animation (ms seit Start; ohne Animation: fertig). */
    let animStart = now + (reduced ? -1e6 : 250);
    const ANIM_MS = 2400;
    let lastDrag = -1e9;
    let seed = 3;
    const sphA = G(p.sph ? 1 : 0);
    const tpA = G(p.tp ? 1 : 0);
    const gt = G(p.t);
    const medA = G(p.med ? 1 : 0);
    const shapeA = G(0);
    /** Gefundene ganzzahlige Vektoren der Länge 3. */
    let found: V3[] = [];
    let hintShown = false;
    let hitAt = -1e9;
    let dupAt = -1e9;
    /** Zufallsweg: Schritte und die Zeitpunkte, zu denen sie erscheinen. */
    let steps: V3[] = [];
    let stepTimes: number[] = [];
    const STEP_MS = 90;
    /** Viele Wege: Endpunkte und ihre Erscheinungszeiten. */
    let ends: V3[] = [];
    let endTimes: number[] = [];
    /** Angetippte Klasse im Histogramm (|s| zwischen i und i + 1) und die Klickflächen der Balken. */
    let selBin: number | null = null;
    let binRects: { r: Rect; i: number }[] = [];
    /** Weiche Überblendung der Tafel beim Wechsel der Rechnung. */
    let opT0 = -1e9;
    const sortA = G(p.sort ? 1 : 0);
    let walkState = Math.floor(Math.random() * 1e6) + 7;
    const walkU = () => {
      walkState = (walkState * 16807) % 2147483647;
      return (walkState - 1) / 2147483646;
    };

    const A = (): V3 => [ga[0]!.at(now), ga[1]!.at(now), ga[2]!.at(now)];
    const B = (): V3 => [gb[0]!.at(now), gb[1]!.at(now), gb[2]!.at(now)];
    const tA = (): V3 => [p.a1, p.a2, p.a3];
    const tB = (): V3 => [p.b1, p.b2, p.b3];
    const Cv = (): V3 => [gc3[0]!.at(now), gc3[1]!.at(now), gc3[2]!.at(now)];
    const tC = (): V3 => [p.c1, p.c2, p.c3];

    /** Ergebnis (Zielwerte) der gewählten Rechnung. */
    function result(a: V3, b: V3, k = p.k, r = p.r, s = p.s): V3 {
      switch (op()) {
        case 'add':
          return add(a, b);
        case 'sub':
          return sub(a, b);
        case 'scale':
          return scale(a, k);
        case 'lin':
        case 'goal':
          return linComb(r, a, s, b);
        case 'spat':
          return spatCorner(a, b, tC(), spatSel[0], spatSel[1], spatSel[2]);
        case 'len':
          return unit(a);
        case 'tri':
          return centroid(a, b, tC());
        case 'walk':
          return sumOf(steps);
        default:
          return between(a, b);
      }
    }

    function retarget(snap = false): void {
      const dragging = performance.now() - lastDrag < 200;
      const ms = dragging ? 110 : 520;
      const set = (g: Glide, v: number) => (snap ? g.snap(v) : g.go(v, ms));
      [p.a1, p.a2, p.a3].forEach((v, i) => set(ga[i]!, v));
      [p.b1, p.b2, p.b3].forEach((v, i) => set(gb[i]!, v));
      [p.c1, p.c2, p.c3].forEach((v, i) => set(gc3[i]!, v));
      set(gk, p.k);
      set(gr, p.r);
      set(gs, p.s);
      set(parA, p.par ? 1 : 0);
      set(compA, p.comps ? 1 : 0);
      set(sphA, p.sph ? 1 : 0);
      set(medA, p.med ? 1 : 0);
      set(tpA, p.tp ? 1 : 0);
      set(gt, p.t);
      if (snap) sortA.snap(p.sort ? 1 : 0);
      else sortA.go(p.sort ? 1 : 0, 1400);
      if (snap) shapeA.snap(op() === 'len' && (hintShown || found.length >= GOAL_N) ? 1 : 0);
      else shapeA.go(op() === 'len' && (hintShown || found.length >= GOAL_N) ? 1 : 0, 900);
      // Achsenlänge passend zu allen sichtbaren Spitzen
      const pts = [tA(), tB(), result(tA(), tB())];
      if (op() === 'lin') pts.push(scale(tA(), p.r), add(scale(tA(), p.r), scale(tB(), p.s)));
      if (op() === 'sub') pts.push(neg(tB()));
      if (op() === 'goal') pts.push(tC(), scale(tA(), p.r), linComb(1.5, tA(), 1.5, tB()));
      if (op() === 'spat') pts.push(...spatCorners(tA(), tB(), tC()).map((q) => q.p));
      if (op() === 'tri') pts.push(tC());
      if (op() === 'walk') {
        pts.length = 0;
        if (p.many) pts.push(...ends, [Math.sqrt(p.wn) + 1, 0, 0], [3, 3, 3]);
        else pts.push(...walkPositions(steps), ...(p.sort ? walkPositions(sortSteps(steps)) : []), [3, 3, 3]);
      }
      const m = Math.max(4, ...pts.flatMap((q) => q.map((v) => Math.abs(v))));
      set(extent, Math.ceil(m + 1));
    }

    /** Fortschritt 0…1 eines Abschnitts der Animation. */
    function phase(from: number, to: number): number {
      const t = (now - animStart) / ANIM_MS;
      return ease.inOutCubic(clamp((t - from) / (to - from), 0, 1));
    }
    const animating = () => now - animStart < ANIM_MS + 100;

    /* ---------------- Farben, Texte ---------------- */
    const CA = () => ctx.theme.series[0]!;
    const CB = () => ctx.theme.series[3]!;
    const CR = () => ctx.theme.series[4]!;
    const CC = () => ctx.theme.series[2]!;
    const n1 = (v: number) => fmt.num(v, 2);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mfont = (s: number) => `italic 700 ${s}px ${ctx.theme.mathFont}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const sep = lang === 'de' ? ' | ' : ', ';
    const pointText = (q: V3) => `(${n1(q[0])}${sep}${n1(q[1])}${sep}${n1(q[2])})`;

    /* ---------------- Ziehen der Spitzen ---------------- */
    const r05 = (v: number) => clamp(Math.round(v * 2) / 2, -4, 4);
    const screenPlane = (): Vec3 => view.camera.back;
    view.addHandle({
      get: () => A() as Vec3,
      set: (q) => {
        lastDrag = performance.now();
        ctx.set({ a1: r05(q[0]), a2: r05(q[1]), a3: r05(q[2]) });
      },
      get plane() {
        return screenPlane();
      },
      enabled: () => !ctx.locked && !animating() && op() !== 'walk',
      color: () => CA(),
    });
    view.addHandle({
      get: () => B() as Vec3,
      set: (q) => {
        lastDrag = performance.now();
        ctx.set({ b1: r05(q[0]), b2: r05(q[1]), b3: r05(q[2]) });
      },
      get plane() {
        return screenPlane();
      },
      enabled: () => !ctx.locked && !animating() && op() !== 'scale' && op() !== 'goal' && op() !== 'len' && op() !== 'walk',
      color: () => CB(),
    });
    view.addHandle({
      get: () => linComb(gr.at(now), A(), gs.at(now), B()) as Vec3,
      set: (q) => {
        lastDrag = performance.now();
        const rs = bestRS(tA(), tB(), q as V3);
        if (!rs) return;
        const q4 = (v: number) => clamp(Math.round(v * 4) / 4, -2, 2);
        ctx.set({ r: q4(rs.r), s: q4(rs.s) });
      },
      get plane() {
        const n = vec3.cross(A() as Vec3, B() as Vec3);
        return vec3.length(n) > 1e-6 ? vec3.normalize(n) : screenPlane();
      },
      enabled: () => !ctx.locked && op() === 'goal' && !collinear(tA(), tB()),
      color: () => CR(),
    });
    // Teilpunkt T: nur entlang der Geraden AB ziehen, ändert t
    view.addHandle({
      get: () => divide(A(), B(), gt.at(now)) as Vec3,
      set: (q) => {
        lastDrag = performance.now();
        const ab = sub(tB(), tA());
        const l2 = normSq(ab);
        if (l2 < 1e-12) return;
        const t = dot3(sub(q as V3, tA()), ab) / l2;
        const t20 = clamp(Math.round(t * 20) / 20, -0.5, 1.5);
        if (t20 !== p.t) ctx.set({ t: t20 });
      },
      get axis() {
        const ab = vec3.sub(B() as Vec3, A() as Vec3);
        return vec3.length(ab) > 1e-6 ? vec3.normalize(ab) : ([1, 0, 0] as Vec3);
      },
      enabled: () => !ctx.locked && op() === 'tri' && p.tp && !isZero(sub(tB(), tA())),
      color: () => ctx.theme.series[5]!,
    });
    // Spat: dritte Kante c ziehen
    view.addHandle({
      get: () => Cv() as Vec3,
      set: (q) => {
        lastDrag = performance.now();
        ctx.set({ c1: r05(q[0]), c2: r05(q[1]), c3: r05(q[2]) });
      },
      get plane() {
        return screenPlane();
      },
      enabled: () => !ctx.locked && (op() === 'spat' || (op() === 'tri' && !animating())),
      color: () => CC(),
    });

    /* ---------------- Histogramm antippen ---------------- */
    const inRect = (r: Rect, px: number, py: number) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    surface.addTarget({
      contains: (px, py) => op() === 'walk' && p.many && binRects.some((b) => inRect(b.r, px, py)),
      pointerDown: (pt) => {
        const b = binRects.find((bb) => inRect(bb.r, pt.px, pt.py));
        if (!b) return false;
        selBin = selBin === b.i ? null : b.i;
        ctx.requestRender();
        return true;
      },
      pointerMove: () => undefined,
      pointerUp: () => undefined,
      hover: (pt) => surface.setCursor(pt ? 'pointer' : ''),
      wheel: () => false,
    });

    /* ---------------- Zeichnen: Szene ---------------- */
    const O: Vec3 = [0, 0, 0];

    /** Vektorname mit Pfeil darüber an einem Weltpunkt. */
    function vecLabel(at: Vec3, name: string, color: string, offset: [number, number] = [10, -10], size = 16): void {
      view.custom(
        at,
        (g) => {
          const [x0, y0] = view.toPx(at);
          const x = x0 + offset[0];
          const y = y0 + offset[1];
          g.save();
          g.font = mfont(size);
          const w = g.measureText(name).width;
          g.lineJoin = 'round';
          g.lineWidth = 4;
          g.strokeStyle = alpha(cardBg(), 0.9);
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.strokeText(name, x, y);
          g.fillStyle = color;
          g.fillText(name, x, y);
          // Pfeil über dem Buchstaben
          const ay = y - size * 0.72;
          const half = Math.max(5, w / 2 + 1);
          g.lineWidth = 3.5;
          g.strokeStyle = alpha(cardBg(), 0.9);
          g.beginPath();
          g.moveTo(x - half, ay);
          g.lineTo(x + half, ay);
          g.stroke();
          g.lineWidth = 1.4;
          g.strokeStyle = color;
          g.beginPath();
          g.moveTo(x - half, ay);
          g.lineTo(x + half, ay);
          g.moveTo(x + half - 3.5, ay - 2.5);
          g.lineTo(x + half, ay);
          g.lineTo(x + half - 3.5, ay + 2.5);
          g.stroke();
          g.restore();
        },
        'front',
      );
    }

    /** Vektorname neben der Mitte eines Pfeils (senkrecht zur Bildrichtung versetzt). */
    function sideLabel(from: Vec3, to: Vec3, name: string, color: string, side = 1, at = 0.5, size = 16): void {
      const [ax, ay] = view.toPx(from);
      const [bx, by] = view.toPx(to);
      const l = Math.hypot(bx - ax, by - ay) || 1;
      let nx = -(by - ay) / l;
      let ny = (bx - ax) / l;
      // bevorzugt nach oben bzw. links (side = 1), sonst gegenüber
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      vecLabel(vec3.lerp(from, to, at), name, color, [nx * 17 * side, ny * 17 * side], size);
    }

    function arrowV(from: Vec3, to: Vec3, color: string, width = 3.4, a = 1, dash?: number[]): void {
      if (vec3.distance(from, to) < 1e-3) return;
      view.arrow(from, to, { color, width, head: 14, alpha: a, dash });
    }

    /** Komponentenweg eines Vektors (parallel zu den Achsen). */
    function compPath(from: Vec3, v: V3, color: string, a: number): void {
      if (a < 0.01) return;
      const p1: Vec3 = [from[0] + v[0], from[1], from[2]];
      const p2: Vec3 = [from[0] + v[0], from[1] + v[1], from[2]];
      const p3: Vec3 = [from[0] + v[0], from[1] + v[1], from[2] + v[2]];
      view.polyline([from, p1, p2, p3], { color, width: 1.6, dash: [4, 4], alpha: a * 0.8 });
    }

    /* ---------------- Zeichnen: Länge und Einheitsvektor ---------------- */
    /** Großkreise einer Kugel um O (Drahtmodell). */
    function sphereWire(r: number, color: string, a: number, dash?: number[]): void {
      if (a < 0.01) return;
      const N = 48;
      const ring = (f: (t: number) => Vec3) => {
        const pts: Vec3[] = [];
        for (let i = 0; i <= N; i++) pts.push(f((2 * Math.PI * i) / N));
        view.polyline(pts, { color, width: 1.1, alpha: a, dash });
      };
      ring((t) => [r * Math.cos(t), r * Math.sin(t), 0]);
      ring((t) => [r * Math.cos(t), 0, r * Math.sin(t)]);
      ring((t) => [0, r * Math.cos(t), r * Math.sin(t)]);
      // zwei Breitenkreise für den räumlichen Eindruck
      for (const h of [-0.6, 0.6]) {
        const rr = r * Math.sqrt(1 - h * h);
        ring((t) => [rr * Math.cos(t), rr * Math.sin(t), r * h]);
      }
    }

    function sceneLen(): void {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const ca = CA();
      const cr = CR();
      const res = p.show;
      const u1 = phase(0.05, 0.45);
      const u2 = phase(0.5, 0.9);
      const sh = shapeA.at(now);
      // Lösungsmenge: Kugel mit Radius 3 und alle 30 Gitterpunkte darauf
      if (sh > 0.01) {
        sphereWire(3, theme.series[2]!, 0.45 * sh, [5, 4]);
        for (const q of LATTICE3) view.point(q as Vec3, { color: alpha(theme.series[2]!, sh), radius: 3, hollow: !hasVec(found, q) });
      }
      // Einheitskugel
      const sp = sphA.at(now);
      if (sp > 0.01) sphereWire(1, mixColor(cr, theme.bg, 0.3), 0.55 * sp);
      if (vec3.length(a) < 1e-6) {
        view.point(O, { color: ca, radius: 7, hollow: true });
        return;
      }
      // zweimal Pythagoras: erst d₁₂ in der x₁x₂-Ebene, dann die Höhe
      const foot: Vec3 = [a[0], a[1], 0];
      if (vec3.length(foot) > 1e-3) {
        view.segment(O, vec3.lerp(O, foot, u1), { color: cr, width: 2.2, dash: [6, 4], alpha: 0.9 });
        if (res && u1 > 0.9) view.label(vec3.scale(foot, 0.5), `d₁₂ = ${fmt.num(lengthSteps(tA()).d12, 2)}`, { color: cr, size: 11.5, weight: '700', align: 'center', baseline: 'middle', offset: [0, 13], background: alpha(cardBg(), 0.88) });
      }
      if (Math.abs(a[2]) > 1e-3 && u1 > 0.9) {
        view.segment(foot, vec3.lerp(foot, a, u2), { color: theme.series[0]!, width: 2.2, alpha: 0.9 });
        if (u2 > 0.9 && vec3.length(foot) > 0.3) {
          const k = 0.28;
          const e1 = vec3.scale(vec3.normalize(vec3.scale(foot, -1)), k);
          const e2: Vec3 = [0, 0, Math.sign(a[2]) * k];
          view.polyline([vec3.add(foot, e1), vec3.add(vec3.add(foot, e1), e2), vec3.add(foot, e2)], { color: theme.muted, width: 1.4 });
        }
      }
      compPath(O, tA(), ca, compA.at(now));
      arrowV(O, a, ca);
      sideLabel(O, a, 'a', ca, 1, 0.55);
      // Einheitsvektor a⁰ = a / |a|
      const e = vec3.normalize(a);
      if (u2 > 0.01) {
        view.segment(O, vec3.scale(e, u2), { color: cr, width: 6, alpha: 0.9 });
        view.point(vec3.scale(e, u2), { color: cr, radius: 4 });
        if (u2 > 0.9) vecLabel(e, 'a⁰', cr, [-14, 12], 15);
      }
      if (res && u2 > 0.9) view.label(vec3.scale(a, 0.62), `|a| = ${fmt.num(norm(tA()), 2)}`, { color: ca, size: 12, weight: '800', align: 'left', baseline: 'middle', offset: [14, 0], background: alpha(cardBg(), 0.88) });
      // gefundene Lösungen
      for (const [i, q] of found.entries()) {
        const fresh = i === found.length - 1 ? clamp(1 - (now - hitAt) / 700, 0, 1) : 0;
        view.ball(q as Vec3, 0.12 + 0.1 * fresh, { color: theme.series[2]! });
      }
    }

    /* ---------------- Zeichnen: Dreieck und Schwerpunkt ---------------- */
    function sceneTri(): void {
      const theme = ctx.theme;
      const R = regions().scene;
      const a = A() as Vec3;
      const b = B() as Vec3;
      const c = Cv() as Vec3;
      const res = p.show;
      const cr = CR();
      const cols = [CA(), CB(), CC()];
      const pts = [a, b, c];
      const names = ['A', 'B', 'C'];
      const flat = degenerate(tA(), tB(), tC());
      // Ortsvektoren dünn
      pts.forEach((q, i) => arrowV(O, q, cols[i]!, 1.8, 0.45, [6, 5]));
      if (!flat) view.face([a, b, c], { color: cr, alpha: 0.1, flat: true, layer: 'back' });
      view.polyline([a, b, c], { color: mixColor(theme.text, theme.bg, 0.35), width: 2, closed: true });
      const m = [vec3.lerp(b, c, 0.5), vec3.lerp(c, a, 0.5), vec3.lerp(a, b, 0.5)];
      const s = vec3.scale(vec3.add(vec3.add(a, b), c), 1 / 3);
      const ma = medA.at(now);
      // Seitenhalbierende nacheinander, dann der Schwerpunkt
      for (let i = 0; i < 3; i++) {
        const u = phase(0.08 + i * 0.22, 0.28 + i * 0.22) * ma;
        if (u <= 0) continue;
        view.point(m[i]!, { color: theme.text, radius: 3.5 * Math.min(1, u * 3) });
        view.segment(pts[i]!, vec3.lerp(pts[i]!, m[i]!, u), { color: cols[i]!, width: 2, dash: [6, 4], alpha: 0.9 });
        if (u > 0.95 && res) {
          // Teilung 2 : 1 durch kleine Striche markieren
          for (const t of [1 / 3, 2 / 3]) {
            const q = vec3.lerp(pts[i]!, m[i]!, t);
            view.point(q, { color: cols[i]!, radius: 2.2 });
          }
        }
      }
      const us = phase(0.78, 0.98);
      if (us > 0.01 && !flat) {
        view.ball(s, 0.17 * (0.5 + 0.5 * us), { color: cr });
        if (res) {
          arrowV(O, vec3.scale(s, us), cr, 3.6);
          if (us > 0.95) {
            const right = view.toPx(s)[0] > R.x + R.w - 130;
            view.label(s, `S${pointText(centroid(tA(), tB(), tC()))}`, { color: theme.text, size: 13, weight: '800', offset: [right ? -12 : 12, 12], align: right ? 'right' : 'left', baseline: 'top', background: alpha(cardBg(), 0.85) });
          }
        }
      }
      pts.forEach((q, i) => {
        view.ball(q, 0.15, { color: cols[i]! });
        const right = view.toPx(q)[0] > R.x + R.w - 120;
        view.label(q, res ? `${names[i]}${pointText([tA(), tB(), tC()][i]!)}` : names[i]!, { color: theme.text, size: 12.5, weight: '800', offset: [right ? -12 : 12, -10], align: right ? 'right' : 'left', baseline: 'bottom' });
      });
      // Teilpunkt T = A + t · AB auf der (verlängerten) Geraden AB
      const ta = tpA.at(now);
      if (ta > 0.01) {
        const t = gt.at(now);
        const T = vec3.lerp(a, b, t);
        const ct = theme.series[5]!;
        view.segment(vec3.lerp(a, b, -0.6), vec3.lerp(a, b, 1.6), { color: ct, width: 1.2, dash: [3, 5], alpha: 0.6 * ta });
        view.segment(a, T, { color: ct, width: 4, alpha: 0.85 * ta });
        view.ball(T, 0.15, { color: ct, alpha: ta });
        if (res) {
          const right = view.toPx(T)[0] > R.x + R.w - 130;
          view.label(T, `T${pointText(divide(tA(), tB(), p.t))}`, { color: ct, size: 12.5, weight: '800', offset: [right ? -12 : 12, 12], align: right ? 'right' : 'left', baseline: 'top', background: alpha(cardBg(), 0.85) });
        }
      }
      // Seitenmitten benennen (gegenüber A, B, C)
      if (ma > 0.5 && R.w >= 420 && phase(0.7, 0.75) > 0.5) m.forEach((q, i) => view.label(q, ['Ma', 'Mb', 'Mc'][i]!, { color: theme.muted, size: 11, weight: '700', offset: [8, 10], align: 'left', baseline: 'top' }));
    }

    /* ---------------- Zufallsweg ---------------- */
    /** Wie viele Schritte sind schon zu sehen (mit Anteil des gerade wachsenden)? */
    function walkShown(): { k: number; frac: number } {
      let k = 0;
      while (k < steps.length && stepTimes[k]! <= now) k++;
      const frac = k < steps.length ? clamp(1 - (stepTimes[k]! - now) / STEP_MS, 0, 1) : 0;
      return { k, frac };
    }

    /** Positionen des Weges (unsortiert und sortiert überblendet), nur sichtbare Schritte. */
    function walkPath(): { pts: Vec3[]; axes: number[] } {
      const { k, frac } = walkShown();
      const shown = steps.slice(0, k);
      const t = sortA.at(now);
      const P = walkPositions(shown);
      const order = t > 0.001 ? sortSteps(shown) : shown;
      const Q = walkPositions(order);
      const pts = P.map((q, i) => vec3.lerp(q as Vec3, Q[i]! as Vec3, t));
      // Achse jedes Schritts: bei Überblendung die des sortierten Wegs ab der Hälfte
      const axes = (t > 0.5 ? order : shown).map((s) => (s[0] !== 0 ? 0 : s[1] !== 0 ? 1 : 2));
      if (frac > 0 && k < steps.length) {
        const last = pts[pts.length - 1]!;
        const s = steps[k]!;
        pts.push(vec3.add(last, vec3.scale(s as Vec3, frac)));
        axes.push(s[0] !== 0 ? 0 : s[1] !== 0 ? 1 : 2);
      }
      return { pts, axes };
    }

    const axisCol = (k: number) => [ctx.theme.series[1]!, ctx.theme.series[2]!, ctx.theme.series[0]!][k]!;

    function sceneWalk(): void {
      const theme = ctx.theme;
      const { pts, axes } = walkPath();
      const n = walkShown().k;
      // typischer Abstand: Kugel mit Radius √n
      if (n >= 4) sphereWire(Math.sqrt(n), mixColor(CR(), theme.bg, 0.4), 0.35, [4, 5]);
      const many = pts.length > 120;
      // beim Sortieren bleibt der ursprüngliche Weg als Schatten stehen
      const st = sortA.at(now);
      if (st > 0.01) {
        const orig = walkPositions(steps.slice(0, walkShown().k)) as Vec3[];
        if (orig.length > 1) view.polyline(orig, { color: theme.muted, width: 1, alpha: 0.35 * st, dash: [3, 4] });
      }
      for (let i = 1; i < pts.length; i++) {
        const age = n - i;
        const fresh = age < 3 ? 1 : 0;
        view.segment(pts[i - 1]!, pts[i]!, { color: axisCol(axes[i - 1]!), width: many ? 1.6 : 2.6 + fresh, alpha: many ? 0.75 : 0.95 });
      }
      const end = pts[pts.length - 1] ?? O;
      if (pts.length > 1) {
        view.ball(end, 0.14, { color: theme.text });
        if (p.show && vec3.length(end) > 0.3) {
          arrowV(O, end, CR(), 4.2, 0.9);
          sideLabel(O, end, 's', CR(), 1, 0.55, 16);
        }
      }
      view.point(O, { color: theme.text, radius: 4 });
    }

    function panelWalk(R: Rect, wide: boolean, x0: number, w: number, y0: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { k: n } = walkShown();
      const shown = steps.slice(0, n);
      const cnt = stepCounts(shown);
      const sum = sumOf(shown);
      text(g, `n = ${n}`, x0 + w, y0 - 26, { font: font(800, 13), color: theme.muted, align: 'right' });
      let y = y0;
      // Zähltabelle je Achse
      const cw = (w - 40) / 3;
      text(g, tt('Schritte', 'steps'), x0, y, { font: font(650, 11), color: theme.muted, align: 'left' });
      ['+', '−', tt('Summe', 'sum')].forEach((h, i) => text(g, h, x0 + 40 + cw * (i + 0.5), y, { font: font(700, 11), color: theme.muted }));
      y += 18;
      for (let k = 0; k < 3; k++) {
        const col = axisCol(k);
        g.fillStyle = col;
        roundRect(g, x0, y - 6, 4, 12, 2);
        g.fill();
        text(g, `x${'₁₂₃'[k]}`, x0 + 10, y, { font: font(750, 12.5), color: col, align: 'left' });
        text(g, `${cnt.plus[k]}`, x0 + 40 + cw * 0.5, y, { font: font(750, 12.5), color: theme.text });
        text(g, `${cnt.minus[k]}`, x0 + 40 + cw * 1.5, y, { font: font(750, 12.5), color: theme.text });
        text(g, n1(sum[k]!), x0 + 40 + cw * 2.5, y, { font: font(800, 12.5), color: CR() });
        y += 18;
      }
      y += 6;
      const row = (label: string, value: string, color = theme.text) => {
        if (y > R.y + R.h - 8) return;
        text(g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
        text(g, value, x0 + w, y, { font: font(800, 12), color, align: 'right' });
        y += 19;
      };
      row(tt('Summe s', 'Sum s'), p.show ? pointText(sum) : '?', CR());
      row(tt('Abstand |s|', 'Distance |s|'), p.show ? `√${fmt.num(normSq(sum), 0)} ≈ ${fmt.num(norm(sum), 2)}` : '?', CR());
      row(tt('typisch: √n', 'typical: √n'), `≈ ${fmt.num(Math.sqrt(n), 2)}`);
      // Verlauf von |s| über die Schritte mit √n zum Vergleich
      const ch = Math.min(wide ? 110 : 0, R.y + R.h - y - 14);
      if (ch >= 60 && n >= 2) {
        const C0: Rect = { x: x0 + 4, y: y + 4, w: w - 8, h: ch - 10 };
        const pos = walkPositions(shown);
        const dist = pos.map((q) => norm(q));
        const M = Math.max(2, ...dist, Math.sqrt(n)) * 1.1;
        const X = (i: number) => C0.x + (i / n) * C0.w;
        const Y = (v: number) => C0.y + C0.h - (v / M) * C0.h;
        g.save();
        g.strokeStyle = alpha(theme.text, 0.3);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(C0.x, C0.y);
        g.lineTo(C0.x, C0.y + C0.h);
        g.lineTo(C0.x + C0.w, C0.y + C0.h);
        g.stroke();
        g.strokeStyle = theme.muted;
        g.setLineDash([4, 3]);
        g.beginPath();
        for (let i = 0; i <= n; i++) (i ? g.lineTo : g.moveTo).call(g, X(i), Y(Math.sqrt(i)));
        g.stroke();
        g.setLineDash([]);
        g.strokeStyle = CR();
        g.lineWidth = 1.8;
        g.beginPath();
        dist.forEach((d, i) => (i ? g.lineTo(X(i), Y(d)) : g.moveTo(X(i), Y(d))));
        g.stroke();
        text(g, '|s|', C0.x + C0.w - 2, Y(dist[n]!) - 9, { font: font(800, 10.5), color: CR(), align: 'right' });
        text(g, '√n', C0.x + C0.w - 2, Y(Math.sqrt(n)) + 10, { font: font(700, 10.5), color: theme.muted, align: 'right' });
        text(g, `${n}`, C0.x + C0.w, C0.y + C0.h + 8, { font: font(600, 9.5), color: theme.muted, align: 'right' });
        g.restore();
        y += ch;
      }
      if (wide && y < R.y + R.h - 50) drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(130, R.y + R.h - y - 10) }, tipText());
    }

    /* ---------------- Viele Zufallswege ---------------- */
    /** Anzahl der Histogramm-Klassen (wie in der Tafel). */
    let binCount = 14;
    function endsShown(): V3[] {
      let k = 0;
      while (k < ends.length && endTimes[k]! <= now) k++;
      return ends.slice(0, k);
    }

    function sceneMany(): void {
      const theme = ctx.theme;
      const n = p.wn;
      sphereWire(Math.sqrt(n), mixColor(CR(), theme.bg, 0.3), 0.5, [4, 5]);
      const shown = endsShown();
      // gleiche Endpunkte stapeln sich: je häufiger, desto kräftiger
      const tally = new Map<string, { q: V3; c: number }>();
      for (const q of shown) {
        const key = q.join(',');
        const t = tally.get(key);
        if (t) t.c++;
        else tally.set(key, { q, c: 1 });
      }
      const maxC = Math.max(1, ...[...tally.values()].map((t) => t.c));
      for (const { q, c } of tally.values()) {
        const inBin = selBin === null || Math.min(binCount - 1, Math.floor(norm(q))) === selBin;
        const a = (0.35 + 0.65 * (c / maxC)) * (inBin ? 1 : 0.12);
        view.point(q as Vec3, { color: alpha(selBin !== null && inBin ? theme.text : normSq(q) <= n ? CR() : CB(), a), radius: (2.2 + 2.6 * (c / maxC)) * (selBin !== null && inBin ? 1.3 : 1) });
      }
      const last = shown[shown.length - 1];
      if (last) {
        arrowV(O, last as Vec3, CR(), 3, 0.9);
        view.ball(last as Vec3, 0.12, { color: theme.text });
      }
      view.point(O, { color: theme.text, radius: 4 });
    }

    function panelMany(R: Rect, wide: boolean, x0: number, w: number, y0: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const n = p.wn;
      const shown = endsShown();
      const N = shown.length;
      text(g, tt(`je ${n} Schritte`, `${n} steps each`), x0 + w, y0 - 26, { font: font(800, 12.5), color: theme.muted, align: 'right' });
      let y = y0;
      const row = (label: string, value: string, color = theme.text) => {
        if (y > R.y + R.h - 8) return;
        text(g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
        text(g, value, x0 + w, y, { font: font(800, 12), color, align: 'right' });
        y += 19;
      };
      row(tt('Wege', 'Walks'), `${N}`);
      if (N) {
        const ms = meanSq(shown);
        row(tt('Mittelwert von |s|²', 'Mean of |s|²'), fmt.num(ms, 2), CR());
        row(tt('Vergleich: n', 'Compare: n'), `${n}`);
        row(tt('innerhalb der Kugel (|s| ≤ √n)', 'inside the sphere (|s| ≤ √n)'), `${fmt.num((100 * shown.filter((q) => normSq(q) <= n).length) / N, 0)} %`);
      }
      // Häufigkeiten von |s| in Klassen der Breite 1
      const ch = Math.min(wide ? 130 : 70, R.y + R.h - y - 16);
      if (ch >= 50 && N) {
        const vals = shown.map((q) => norm(q));
        const bins = Math.max(4, Math.min(14, Math.ceil(Math.max(...vals)) + 1));
        binCount = bins;
        const h = histogram(vals, 1, bins);
        const M = Math.max(1, ...h);
        const C0: Rect = { x: x0 + 4, y: y + 6, w: w - 8, h: ch - 22 };
        const bw = C0.w / bins;
        g.save();
        binRects = [];
        h.forEach((c, i) => {
          const hh = (c / M) * C0.h;
          binRects.push({ r: { x: C0.x + i * bw, y: C0.y, w: bw, h: C0.h + 12 }, i });
          const on = selBin === null || selBin === i;
          roundRect(g, C0.x + i * bw + 1, C0.y + C0.h - hh, bw - 2, Math.max(0.5, hh), 2);
          g.fillStyle = i + 1 <= Math.sqrt(n) ? alpha(CR(), on ? 0.75 : 0.25) : alpha(CB(), on ? 0.6 : 0.2);
          g.fill();
          if (selBin === i) {
            g.strokeStyle = theme.text;
            g.lineWidth = 1.5;
            g.stroke();
            text(g, `${c}`, C0.x + (i + 0.5) * bw, C0.y + C0.h - hh - 8, { font: font(800, 10.5), color: theme.text });
          }
        });
        g.strokeStyle = alpha(theme.text, 0.3);
        g.beginPath();
        g.moveTo(C0.x, C0.y + C0.h);
        g.lineTo(C0.x + C0.w, C0.y + C0.h);
        g.stroke();
        const xs = C0.x + Math.sqrt(n) * bw;
        g.strokeStyle = theme.text;
        g.setLineDash([4, 3]);
        g.beginPath();
        g.moveTo(xs, C0.y - 2);
        g.lineTo(xs, C0.y + C0.h);
        g.stroke();
        g.setLineDash([]);
        text(g, '√n', xs + 3, C0.y + 4, { font: font(800, 10.5), color: theme.text, align: 'left' });
        for (let i = 0; i <= bins; i += bins > 8 ? 2 : 1) text(g, `${i}`, C0.x + i * bw, C0.y + C0.h + 9, { font: font(600, 9.5), color: theme.muted });
        text(g, '|s|', C0.x + C0.w, C0.y + C0.h + 9, { font: font(700, 9.5), color: theme.muted, align: 'right' });
        g.restore();
        y += ch;
      }
      if (selBin !== null && N && y < R.y + R.h - 20) {
        const k = shown.filter((q) => Math.min(binCount - 1, Math.floor(norm(q))) === selBin).length;
        text(g, tt(`${selBin} ≤ |s| < ${selBin + 1}: ${k} Wege (${fmt.num((100 * k) / N, 1)} %)`, `${selBin} ≤ |s| < ${selBin + 1}: ${k} walks (${fmt.num((100 * k) / N, 1)} %)`), x0, y + 8, { font: font(750, 11.5), color: theme.text, align: 'left' });
        y += 22;
      }
      if (wide && y < R.y + R.h - 50) drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(96, R.y + R.h - y - 10) }, tt('Jeder Punkt ist das Ziel eines Weges aus n Einheitsschritten. Im Mittel ist |s|² genau n – der typische Abstand wächst also nur wie √n, nicht wie n.', 'Each dot is the end of a walk of n unit steps. On average |s|² is exactly n – so the typical distance grows only like √n, not like n.'));
    }

    function drawScene(): void {
      const theme = ctx.theme;
      const R = regions().scene;
      const narrow = R.w < 520;
      const E = extent.at(now);
      view.setScene({ target: [0.3, 0.5, 0.8], radius: E * (narrow ? 1.05 : 0.92), anchor: [0.5, 0.53] });
      view.begin();
      const grow = reduced ? 1 : ease.outCubic(clamp((now - introStart) / 700, 0, 1));
      if (p.grid) view.grid({ min: [-E, -E], max: [E, E], step: 1, color: theme.gridMinor, fade: true });
      view.axes({ min: -E * grow, max: (E + 0.5) * grow, color: alpha(theme.axis, 0.8), width: 1.4 });
      view.point(O, { color: theme.text, radius: 3 });
      view.label(O, 'O', { color: theme.muted, size: 12, weight: '700', offset: [-10, 12] });

      const a = A() as Vec3;
      const b = B() as Vec3;
      const ca = CA();
      const cb = CB();
      const cr = CR();
      const res = p.show;
      const pa = parA.at(now);
      const cp = compA.at(now);
      const k = gk.at(now);
      const r = gr.at(now);
      const s = gs.at(now);
      const soft = (c: string) => mixColor(c, theme.bg, 0.45);

      switch (op()) {
        case 'add': {
          const u1 = phase(0.05, 0.5);
          const u2 = phase(0.55, 0.95);
          const sum = vec3.add(a, b);
          if (pa > 0.01 && u2 > 0) view.face([O, a, sum, b], { color: cr, alpha: 0.1 * pa * u2, flat: true, layer: 'back' });
          arrowV(O, a, ca);
          arrowV(O, b, cb);
          // b wird an die Spitze von a verschoben
          const foot = vec3.lerp(O, a, u1);
          arrowV(foot, vec3.add(foot, b), soft(cb), 2.6, 1, [7, 5]);
          if (pa > 0.01 && u2 > 0) arrowV(b, sum, soft(ca), 2.2, pa * u2, [7, 5]);
          if (res && u2 > 0) {
            arrowV(O, vec3.lerp(O, sum, u2), cr, 4.2);
            if (u2 > 0.95) sideLabel(O, sum, 'a + b', cr, 1, 0.6, 15);
          }
          compPath(O, a, ca, cp);
          compPath(a, b, cb, cp);
          sideLabel(O, a, 'a', ca, -1);
          sideLabel(O, b, 'b', cb, 1);
          break;
        }
        case 'sub': {
          const u1 = phase(0.05, 0.4);
          const u2 = phase(0.45, 0.75);
          const u3 = phase(0.78, 1);
          const nb = vec3.scale(b, -1);
          const diff = vec3.sub(a, b);
          arrowV(O, a, ca);
          arrowV(O, b, cb);
          // Gegenvektor −b klappt um, dann an die Spitze von a
          const mb = vec3.lerp(b, nb, u1);
          const foot = vec3.lerp(O, a, u2);
          if (u1 > 0) arrowV(foot, vec3.add(foot, mb), soft(cb), 2.6, 1, [7, 5]);
          if (u2 > 0.5) sideLabel(foot, vec3.add(foot, mb), '−b', soft(cb), -1, 0.5, 14);
          if (res && u3 > 0) {
            arrowV(O, vec3.lerp(O, diff, u3), cr, 4.2);
            // a − b ist auch der Pfeil von der Spitze von b zur Spitze von a
            if (pa > 0.01) {
              view.face([O, b, a, diff], { color: cr, alpha: 0.08 * pa * u3, flat: true, layer: 'back' });
              arrowV(b, vec3.lerp(b, a, u3), cr, 2.4, pa * 0.85, [6, 4]);
            }
            if (u3 > 0.95) sideLabel(O, diff, 'a − b', cr, -1, 0.6, 15);
          }
          compPath(O, a, ca, cp);
          compPath(O, b, cb, cp);
          sideLabel(O, a, 'a', ca, -1);
          sideLabel(O, b, 'b', cb, 1);
          break;
        }
        case 'scale': {
          const u = phase(0.05, 0.9);
          const kk = 1 + (k - 1) * u;
          // Gerade durch a mit Vielfachen-Marken
          const ext = Math.max(Math.abs(k), 1) + 0.6;
          view.segment(vec3.scale(a, -ext), vec3.scale(a, ext), { color: theme.muted, width: 1, dash: [3, 5], alpha: 0.6 });
          for (let m = -3; m <= 3; m++) {
            if (m === 0 || Math.abs(m) > ext) continue;
            view.point(vec3.scale(a, m) as Vec3, { color: soft(ca), radius: 2.5 });
          }
          arrowV(O, a, ca, 3.4, res ? 0.55 : 1);
          sideLabel(O, a, 'a', ca, 1);
          if (res) {
            arrowV(O, vec3.scale(a, kk), cr, 4.2);
            vecLabel(vec3.scale(a, kk), `${fmt.num(kk, 2)} · a`, cr, [16, -14], 14);
          }
          compPath(O, vec3.scale(a, res ? k : 1) as V3, cr, cp);
          break;
        }
        case 'lin': {
          const u1 = phase(0.05, 0.45);
          const u2 = phase(0.5, 0.9);
          const ra = vec3.scale(a, r * u1 + (1 - u1));
          const sb = vec3.scale(b, s * u2);
          // aufgespannte Ebene mit Gitter in Richtung a und b
          if (pa > 0.01 && !collinear(tA(), tB())) {
            const c0 = vec3.add(vec3.scale(a, -1.5), vec3.scale(b, -1.5));
            const c1 = vec3.add(vec3.scale(a, 1.5), vec3.scale(b, -1.5));
            const c2 = vec3.add(vec3.scale(a, 1.5), vec3.scale(b, 1.5));
            const c3 = vec3.add(vec3.scale(a, -1.5), vec3.scale(b, 1.5));
            view.face([c0, c1, c2, c3], { color: cr, alpha: 0.07 * pa, flat: true, layer: 'back' });
            for (let m = -1.5; m <= 1.5; m += 0.5) {
              view.segment(vec3.add(vec3.scale(a, m), vec3.scale(b, -1.5)), vec3.add(vec3.scale(a, m), vec3.scale(b, 1.5)), { color: soft(cr), width: 0.8, alpha: 0.4 * pa, layer: 'back' });
              view.segment(vec3.add(vec3.scale(a, -1.5), vec3.scale(b, m)), vec3.add(vec3.scale(a, 1.5), vec3.scale(b, m)), { color: soft(cr), width: 0.8, alpha: 0.4 * pa, layer: 'back' });
            }
          }
          arrowV(O, a, ca, 2.4, 0.5);
          arrowV(O, b, cb, 2.4, 0.5);
          sideLabel(O, a, 'a', ca, -1, 0.5, 14);
          sideLabel(O, b, 'b', cb, 1, 0.5, 14);
          arrowV(O, ra, ca, 3.6);
          if (u2 > 0) arrowV(ra, vec3.add(ra, sb), cb, 3.6);
          if (res && u2 > 0.98) {
            const c = vec3.add(ra, sb);
            arrowV(O, c, cr, 4.2);
            sideLabel(O, c, 'r·a + s·b', cr, -1, 0.6, 14);
          }
          compPath(O, vec3.add(ra, sb) as V3, cr, cp);
          break;
        }
        case 'goal': {
          const cv = Cv() as Vec3;
          const col = collinear(tA(), tB());
          // aufgespannte Ebene (bzw. Gerade) mit Gitter
          if (!col) {
            const c0 = vec3.add(vec3.scale(a, -2), vec3.scale(b, -2));
            const c1 = vec3.add(vec3.scale(a, 2), vec3.scale(b, -2));
            const c2 = vec3.add(vec3.scale(a, 2), vec3.scale(b, 2));
            const c3 = vec3.add(vec3.scale(a, -2), vec3.scale(b, 2));
            view.face([c0, c1, c2, c3], { color: cr, alpha: 0.06, flat: true, layer: 'back' });
            for (let m = -2; m <= 2; m += 0.5) {
              view.segment(vec3.add(vec3.scale(a, m), vec3.scale(b, -2)), vec3.add(vec3.scale(a, m), vec3.scale(b, 2)), { color: soft(cr), width: 0.7, alpha: 0.35, layer: 'back' });
              view.segment(vec3.add(vec3.scale(a, -2), vec3.scale(b, m)), vec3.add(vec3.scale(a, 2), vec3.scale(b, m)), { color: soft(cr), width: 0.7, alpha: 0.35, layer: 'back' });
            }
          } else view.segment(vec3.scale(a, -2.5), vec3.scale(a, 2.5), { color: soft(cr), width: 2, alpha: 0.6 });
          // Ziel c gestrichelt, ggf. Lot auf die Ebene
          arrowV(O, cv, theme.text, 2.6, 0.75, [7, 5]);
          sideLabel(O, cv, 'c', theme.text, 1, 0.7, 15);
          const best = bestRS(tA(), tB(), tC());
          if (best && best.rest > 0.01) {
            const foot = linComb(best.r, a as V3, best.s, b as V3) as Vec3;
            view.segment(cv, foot, { color: theme.muted, width: 1.4, dash: [3, 4] });
            view.point(foot, { color: theme.muted, radius: 3.5, hollow: true });
          }
          arrowV(O, a, ca, 2.2, 0.55);
          arrowV(O, b, cb, 2.2, 0.55);
          sideLabel(O, a, 'a', ca, -1, 0.5, 14);
          sideLabel(O, b, 'b', cb, 1, 0.5, 14);
          const ra = vec3.scale(a, r);
          const sum = vec3.add(ra, vec3.scale(b, s));
          arrowV(O, ra, ca, 3.4);
          arrowV(ra, sum, cb, 3.4);
          const hit = vec3.distance(sum, cv) < 0.02;
          arrowV(O, sum, hit ? theme.series[2]! : cr, 4.2);
          if (hit) view.ball(cv, 0.22 + (reduced ? 0 : 0.15 * Math.max(0, 1 - (now - goalHit) / 800)), { color: theme.series[2]!, alpha: 0.6 });
          compPath(O, sum as V3, cr, cp);
          break;
        }
        case 'len':
          sceneLen();
          break;
        case 'tri':
          sceneTri();
          break;
        case 'walk':
          if (p.many) sceneMany();
          else sceneWalk();
          break;
        case 'spat': {
          const cv = Cv() as Vec3;
          const cs = spatCorners(a as V3, b as V3, cv as V3);
          const P = (f: [number, number, number]) => cs.find((q) => q.f[0] === f[0] && q.f[1] === f[1] && q.f[2] === f[2])!.p as Vec3;
          // Kanten des Spats
          const edges: [[number, number, number], [number, number, number], string][] = [];
          for (const q of cs)
            for (let d = 0; d < 3; d++)
              if (q.f[d] === 0) {
                const t = [...q.f] as [number, number, number];
                t[d] = 1;
                edges.push([q.f, t, [ca, cb, CC()][d]!]);
              }
          const flat = coplanar(tA(), tB(), tC());
          // Flächen leicht getönt
          const faces: [number, number, number][][] = [
            [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]],
            [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
          ];
          for (const f of faces) view.face(f.map(P), { color: flat ? theme.series[1]! : cr, alpha: flat ? 0.14 : 0.06, flat: true, layer: 'back' });
          for (const [f0, f1, col] of edges) view.segment(P(f0), P(f1), { color: soft(col), width: 1.6, alpha: 0.85 });
          arrowV(O, a, ca, 3.2);
          arrowV(O, b, cb, 3.2);
          arrowV(O, cv, CC(), 3.2);
          sideLabel(O, a, 'a', ca, -1, 0.55, 15);
          sideLabel(O, b, 'b', cb, 1, 0.55, 15);
          sideLabel(O, cv, 'c', CC(), 1, 0.6, 15);
          // Ecken antippbar
          const names = spatNames();
          cs.forEach((q, i) => {
            const isSel = q.f[0] === spatSel[0] && q.f[1] === spatSel[1] && q.f[2] === spatSel[2];
            view.point(q.p as Vec3, { color: isSel ? cr : theme.text, radius: isSel ? 6 : 4, layer: 'front' });
            view.label(q.p as Vec3, names[i]!, { color: isSel ? cr : theme.muted, size: isSel ? 13 : 12, weight: '800', offset: [10, -10], layer: 'front' });
          });
          // Weg von O entlang der Kanten zur gewählten Ecke
          const u = reduced ? 1 : clamp((now - spatT0) / SPAT_MS, 0, 1);
          const legs: [V3, string][] = [];
          if (spatSel[0]) legs.push([a as V3, ca]);
          if (spatSel[1]) legs.push([b as V3, cb]);
          if (spatSel[2]) legs.push([cv as V3, CC()]);
          let at: Vec3 = O;
          legs.forEach(([v, col], i) => {
            const t = clamp(u * legs.length - i, 0, 1);
            if (t <= 0) return;
            const to = vec3.add(at, vec3.scale(v as Vec3, t));
            arrowV(at, to, col, 4.4);
            at = vec3.add(at, v as Vec3);
          });
          if (p.show && u >= 1 && legs.length > 1) arrowV(O, result(tA(), tB()) as Vec3, cr, 3, 0.8, [7, 4]);
          break;
        }
        default: {
          // Verbindungsvektor: Punkte A, B, Ortsvektoren dünn, AB kräftig
          const u = phase(0.05, 0.8);
          arrowV(O, a, ca, 2, 0.55, [6, 5]);
          arrowV(O, b, cb, 2, 0.55, [6, 5]);
          view.ball(a, 0.17, { color: ca });
          view.ball(b, 0.17, { color: cb });
          const ptLabel = (q: Vec3, txt: string) => {
            const right = view.toPx(q)[0] > R.x + R.w - 130;
            view.label(q, txt, { color: theme.text, size: 13, weight: '800', offset: [right ? -12 : 12, -10], align: right ? 'right' : 'left', baseline: 'bottom', background: alpha(cardBg(), 0.8) });
          };
          ptLabel(a, res ? `A${pointText(tA())}` : 'A');
          ptLabel(b, res ? `B${pointText(tB())}` : 'B');
          arrowV(a, vec3.lerp(a, b, u), cr, 4.2);
          if (u > 0.95) sideLabel(a, b, 'AB', cr, 1, 0.5, 15);
          if (res && u > 0.95) {
            const m = midpoint(tA(), tB()) as Vec3;
            const mm = vec3.lerp(a, b, 0.5);
            view.point(mm, { color: theme.text, radius: 4.5 });
            view.label(mm, `M${pointText(m as V3)}`, { color: theme.muted, size: 12, weight: '700', offset: [10, 14], baseline: 'top' });
          }
          compPath(a, vec3.sub(b, a) as V3, cr, cp);
        }
      }
      view.end();
      const note = specialNote();
      if (note) {
        const g = surface.g;
        g.save();
        g.font = font(750, narrow ? 11 : 12);
        const w = g.measureText(note.text).width + 20;
        const x = R.x + 12;
        const y = R.y + 12;
        g.fillStyle = note.ok ? theme.series[2]! : mixColor(theme.series[1]!, theme.bg, 0.05);
        roundRect(g, x, y, Math.min(w, R.w - 70), 24, 12);
        g.fill();
        text(g, note.text, x + 10, y + 12.5, { font: font(750, narrow ? 11 : 12), color: '#ffffff', align: 'left' });
        g.restore();
      }
    }

    /** Sonderfall, der im Bild angesagt wird. */
    function specialNote(): { text: string; ok?: boolean } | null {
      const a = tA();
      const b = tB();
      switch (op()) {
        case 'add':
          if (isZero(add(a, b))) return { text: tt('b = −a: die Summe ist der Nullvektor o', 'b = −a: the sum is the zero vector o') };
          if (collinear(a, b)) return { text: tt('a ∥ b: das Parallelogramm ist flach', 'a ∥ b: the parallelogram is flat') };
          return null;
        case 'sub':
          return isZero(sub(a, b)) ? { text: tt('a = b: a − b = o', 'a = b: a − b = o') } : null;
        case 'scale':
          if (p.k === 0) return { text: tt('k = 0: der Nullvektor o', 'k = 0: the zero vector o') };
          if (p.k < 0) return { text: tt('k < 0: Gegenrichtung', 'k < 0: opposite direction') };
          return null;
        case 'lin':
          return collinear(a, b) ? { text: tt('a ∥ b: alle Kombinationen liegen auf einer Geraden', 'a ∥ b: all combinations lie on one line') } : null;
        case 'goal': {
          if (collinear(a, b)) return { text: tt('a ∥ b: nur Vielfache auf einer Geraden', 'a ∥ b: only multiples on one line') };
          const best = bestRS(a, b, tC());
          if (best && best.rest > 0.01) return { text: tt(`c liegt nicht in der Ebene – unmöglich (Abstand ${fmt.num(best.rest, 2)})`, `c is not in the plane – impossible (distance ${fmt.num(best.rest, 2)})`) };
          if (norm(sub(linComb(p.r, a, p.s, b), tC())) < 1e-6) return { text: tt('Getroffen!', 'Hit!'), ok: true };
          return null;
        }
        case 'spat':
          return coplanar(a, b, tC()) ? { text: tt('a, b, c komplanar: der Spat ist flach (Volumen 0)', 'a, b, c coplanar: the parallelepiped is flat (volume 0)') } : null;
        case 'len': {
          if (isZero(a)) return { text: tt('a = o: Länge 0, kein Einheitsvektor', 'a = o: length 0, no unit vector') };
          if (found.length >= GOAL_N) return { text: tt('Geschafft: fünf Vektoren der Länge 3!', 'Done: five vectors of length 3!'), ok: true };
          if (now - dupAt < 1500) return { text: tt('Diesen Vektor hast du schon – suche einen anderen.', 'You already have this one – find another.') };
          if (Math.abs(normSq(a) - 9) < 1e-9) return { text: tt(`|a| = 3 – Lösung ${found.length} von ${GOAL_N}`, `|a| = 3 – solution ${found.length} of ${GOAL_N}`), ok: true };
          if (Math.abs(normSq(a) - 1) < 1e-9) return { text: tt('|a| = 1: a ist schon ein Einheitsvektor', '|a| = 1: a is already a unit vector'), ok: true };
          return null;
        }
        case 'walk': {
          const s = sumOf(steps);
          if (p.many) return ends.length ? null : { text: tt('Starte mit „500 Wege“', 'Start with “500 walks”') };
          if (!steps.length) return { text: tt('Starte mit „10 Schritte“', 'Start with “10 steps”') };
          if (isZero(s)) return { text: tt('Zurück im Ursprung: Summe o', 'Back at the origin: sum o'), ok: true };
          if (p.sort) return { text: tt('Sortiert: derselbe Endpunkt', 'Sorted: the same end point'), ok: true };
          return null;
        }
        case 'tri': {
          const c = tC();
          if (isZero(sub(a, b)) || isZero(sub(b, c)) || isZero(sub(c, a))) return { text: tt('Zwei Punkte fallen zusammen: kein Dreieck', 'Two points coincide: no triangle') };
          if (degenerate(a, b, c)) return { text: tt('A, B, C auf einer Geraden: kein Dreieck – S liegt trotzdem bei ⅓ (A + B + C)', 'A, B, C on one line: no triangle – S is still ⅓ (A + B + C)') };
          if (p.tp && Math.abs(p.t - 0.5) < 1e-9) return { text: tt('t = 0,5: T ist der Mittelpunkt von AB', 't = 0.5: T is the midpoint of AB'), ok: true };
          if (p.tp && (p.t < 0 || p.t > 1)) return { text: tt('T liegt außerhalb der Strecke AB (äußere Teilung)', 'T lies outside the segment AB (external division)') };
          return null;
        }
        default:
          return isZero(sub(b, a)) ? { text: tt('A = B: AB ist der Nullvektor', 'A = B: AB is the zero vector') } : null;
      }
    }

    /** Namen der Spat-Ecken (wie `spatCorners`). */
    function spatNames(): string[] {
      return ['O', 'a', 'b', 'c', 'a+b', 'a+c', 'b+c', 'a+b+c'];
    }
    function spatAt(px: number, py: number): number | null {
      if (op() !== 'spat') return null;
      const cs = spatCorners(A(), B(), Cv());
      let best: number | null = null;
      let bd = 22;
      cs.forEach((q, i) => {
        const [x, y] = view.toPx(q.p as Vec3);
        const d = Math.hypot(x - px, y - py);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    }
    function tapSpat(px: number, py: number): void {
      const i = spatAt(px, py);
      if (i === null || i === 0) return;
      spatSel = spatCorners(tA(), tB(), tC())[i]!.f;
      spatT0 = performance.now();
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------------- Tafel: Spaltenvektoren ---------------- */
    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.stroke();
      g.restore();
    }

    type Tok = { kind: 'col'; v: V3; color: string } | { kind: 'txt'; s: string; color?: string; math?: boolean } | { kind: 'vec'; s: string; color: string };

    /** Breite eines Bausteins bei Schriftgröße `size`. */
    function tokWidth(t: Tok, size: number): number {
      const g = surface.g;
      if (t.kind === 'col') {
        g.font = font(750, size);
        const w = Math.max(...t.v.map((v) => g.measureText(n1(v)).width));
        return w + 2 * (size * 0.45) + 6;
      }
      g.font = t.kind === 'vec' || t.math ? mfont(size + 1) : font(650, size);
      return g.measureText(t.kind === 'vec' ? t.s : t.s).width + (t.kind === 'txt' ? 6 : 4);
    }

    function drawToks(toks: Tok[], x: number, y: number, maxW: number, size0: number): number {
      let size = size0;
      while (size > 9 && toks.reduce((s, t) => s + tokWidth(t, size), 0) > maxW) size -= 0.5;
      const g = surface.g;
      const theme = ctx.theme;
      let cx = x;
      for (const t of toks) {
        const w = tokWidth(t, size);
        if (t.kind === 'col') {
          const lh = size * 1.22;
          const bw = size * 0.45;
          g.strokeStyle = t.color;
          g.lineWidth = 1.5;
          const top = y - lh * 1.5 - 1;
          const bot = y + lh * 1.5 + 1;
          g.beginPath();
          g.moveTo(cx + bw, top);
          g.quadraticCurveTo(cx, y, cx + bw, bot);
          g.moveTo(cx + w - bw, top);
          g.quadraticCurveTo(cx + w, y, cx + w - bw, bot);
          g.stroke();
          t.v.forEach((v, i) => text(g, p.show || t.color !== CR() ? n1(v) : '?', cx + w - bw - 3, y + (i - 1) * lh, { font: font(750, size), color: t.color, align: 'right' }));
        } else if (t.kind === 'vec') {
          g.font = mfont(size + 1);
          text(g, t.s, cx + w / 2, y, { font: mfont(size + 1), color: t.color });
          const tw = g.measureText(t.s).width;
          const ay = y - size * 0.8;
          g.strokeStyle = t.color;
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(cx + w / 2 - tw / 2, ay);
          g.lineTo(cx + w / 2 + tw / 2 + 1, ay);
          g.moveTo(cx + w / 2 + tw / 2 - 2.5, ay - 2.2);
          g.lineTo(cx + w / 2 + tw / 2 + 1, ay);
          g.lineTo(cx + w / 2 + tw / 2 - 2.5, ay + 2.2);
          g.stroke();
        } else {
          text(g, t.s, cx + w / 2, y, { font: t.math ? mfont(size + 1) : font(650, size), color: t.color ?? theme.text });
        }
        cx += w;
      }
      return size;
    }

    function drawPanel(): void {
      const { panel: R, wide } = regions();
      const g = surface.g;
      const theme = ctx.theme;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 14);
      g.clip();
      // neue Rechnung: Inhalt blendet weich ein und rutscht leicht nach oben
      const fu = reduced ? 1 : ease.outCubic(clamp((now - opT0) / 380, 0, 1));
      g.globalAlpha = fu;
      g.translate(0, 8 * (1 - fu));
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      let y = R.y + 22;
      const a = tA();
      const b = tB();
      const c = result(a, b);
      const ca = CA();
      const cb = CB();
      const cr = CR();
      const titles: Record<Op, string> = {
        add: tt('Addition', 'Addition'),
        sub: tt('Subtraktion', 'Subtraction'),
        scale: tt('Vervielfachen', 'Scaling'),
        lin: tt('Linearkombination', 'Linear combination'),
        ab: tt('Verbindungsvektor', 'Connecting vector'),
        goal: tt('Linearkombination finden', 'Find a linear combination'),
        spat: tt('Vektorzug im Spat', 'Vector path in a parallelepiped'),
        len: tt('Länge und Einheitsvektor', 'Length and unit vector'),
        tri: tt('Schwerpunkt eines Dreiecks', 'Centroid of a triangle'),
        walk: tt('Zufallsweg', 'Random walk'),
      };
      text(g, titles[op()], x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
      if (op() === 'len' || op() === 'tri' || op() === 'walk') {
        if (op() === 'len') panelLen(R, wide, x0, w, y + 26);
        else if (op() === 'walk') (p.many ? panelMany : panelWalk)(R, wide, x0, w, y + 26);
        else panelTri(R, wide, x0, w, y);
        g.restore();
        return;
      }
      y += 24;
      const fsz = wide ? 15 : 13;
      const k = p.k;
      const r = p.r;
      const s = p.s;
      const kTxt = (v: number) => (v < 0 ? `(${fmt.num(v, 2)})` : fmt.num(v, 2));
      // Zeile 1: symbolisch
      /** Vektorzug zur gewählten Ecke, z. B. „a + c“. */
      const spatSym = (): Tok[] => {
        const parts: Tok[] = [];
        if (spatSel[0]) parts.push({ kind: 'vec', s: 'a', color: ca });
        if (spatSel[1]) parts.push({ kind: 'vec', s: 'b', color: cb });
        if (spatSel[2]) parts.push({ kind: 'vec', s: 'c', color: CC() });
        return parts.flatMap((t, i) => (i ? [{ kind: 'txt', s: '+' } as Tok, t] : [t]));
      };
      const sym: Tok[] =
        op() === 'goal'
          ? [{ kind: 'txt', s: fmt.num(r, 2) }, { kind: 'txt', s: '·' }, { kind: 'vec', s: 'a', color: ca }, { kind: 'txt', s: '+' }, { kind: 'txt', s: fmt.num(s, 2) }, { kind: 'txt', s: '·' }, { kind: 'vec', s: 'b', color: cb }, { kind: 'txt', s: '=' }, { kind: 'vec', s: 'c', color: theme.text }, { kind: 'txt', s: '?' }]
          : op() === 'spat'
            ? spatSym()
            : op() === 'add'
          ? [{ kind: 'vec', s: 'a', color: ca }, { kind: 'txt', s: '+' }, { kind: 'vec', s: 'b', color: cb }]
          : op() === 'sub'
            ? [{ kind: 'vec', s: 'a', color: ca }, { kind: 'txt', s: '−' }, { kind: 'vec', s: 'b', color: cb }, { kind: 'txt', s: '=' }, { kind: 'vec', s: 'a', color: ca }, { kind: 'txt', s: '+' }, { kind: 'txt', s: '(−' }, { kind: 'vec', s: 'b', color: cb }, { kind: 'txt', s: ')' }]
            : op() === 'scale'
              ? [{ kind: 'txt', s: fmt.num(k, 2), color: cr }, { kind: 'txt', s: '·' }, { kind: 'vec', s: 'a', color: ca }]
              : op() === 'lin'
                ? [{ kind: 'txt', s: fmt.num(r, 2) }, { kind: 'txt', s: '·' }, { kind: 'vec', s: 'a', color: ca }, { kind: 'txt', s: s < 0 ? '−' : '+' }, { kind: 'txt', s: fmt.num(Math.abs(s), 2) }, { kind: 'txt', s: '·' }, { kind: 'vec', s: 'b', color: cb }]
                : [{ kind: 'vec', s: 'AB', color: cr }, { kind: 'txt', s: '=' }, { kind: 'vec', s: 'OB', color: cb }, { kind: 'txt', s: '−' }, { kind: 'vec', s: 'OA', color: ca }];
      drawToks(sym, x0, y, w, fsz);
      y += 46;
      // Zeile 2: in Spalten
      const spatCols = (): Tok[] => {
        const vs: [V3, string][] = [];
        if (spatSel[0]) vs.push([a, ca]);
        if (spatSel[1]) vs.push([b, cb]);
        if (spatSel[2]) vs.push([tC(), CC()]);
        const out: Tok[] = [];
        vs.forEach(([v, col], i) => {
          if (i) out.push({ kind: 'txt', s: '+' });
          out.push({ kind: 'col', v, color: col });
        });
        out.push({ kind: 'txt', s: '=' }, { kind: 'col', v: c, color: cr });
        return out;
      };
      const cols: Tok[] =
        op() === 'goal'
          ? [{ kind: 'txt', s: kTxt(r) }, { kind: 'txt', s: '·' }, { kind: 'col', v: a, color: ca }, { kind: 'txt', s: '+' }, { kind: 'txt', s: kTxt(s) }, { kind: 'txt', s: '·' }, { kind: 'col', v: b, color: cb }, { kind: 'txt', s: '=' }, { kind: 'col', v: c, color: cr }]
          : op() === 'spat'
            ? spatCols()
            : op() === 'add'
          ? [{ kind: 'col', v: a, color: ca }, { kind: 'txt', s: '+' }, { kind: 'col', v: b, color: cb }, { kind: 'txt', s: '=' }, { kind: 'col', v: c, color: cr }]
          : op() === 'sub'
            ? [{ kind: 'col', v: a, color: ca }, { kind: 'txt', s: '−' }, { kind: 'col', v: b, color: cb }, { kind: 'txt', s: '=' }, { kind: 'col', v: c, color: cr }]
            : op() === 'scale'
              ? [{ kind: 'txt', s: kTxt(k) }, { kind: 'txt', s: '·' }, { kind: 'col', v: a, color: ca }, { kind: 'txt', s: '=' }, { kind: 'col', v: c, color: cr }]
              : op() === 'lin'
                ? [{ kind: 'txt', s: kTxt(r) }, { kind: 'txt', s: '·' }, { kind: 'col', v: a, color: ca }, { kind: 'txt', s: '+' }, { kind: 'txt', s: kTxt(s) }, { kind: 'txt', s: '·' }, { kind: 'col', v: b, color: cb }, { kind: 'txt', s: '=' }, { kind: 'col', v: c, color: cr }]
                : [{ kind: 'col', v: b, color: cb }, { kind: 'txt', s: '−' }, { kind: 'col', v: a, color: ca }, { kind: 'txt', s: '=' }, { kind: 'col', v: c, color: cr }];
      drawToks(cols, x0, y, w, wide ? 14 : 12.5);
      y += 46;
      // Länge
      const row = (label: string, value: string, color = theme.text) => {
        text(g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
        text(g, value, x0 + w, y, { font: font(800, 12), color, align: 'right' });
        y += 20;
      };
      const name = { add: '|a + b|', sub: '|a − b|', scale: '|k · a|', lin: '|r · a + s · b|', ab: '|AB|', goal: tt('Ziel c', 'target c'), spat: tt('Länge', 'length'), len: '|a|', tri: '|s|', walk: '|s|' }[op()];
      if (op() === 'goal') {
        const best = bestRS(a, b, tC());
        row(name, pointText(tC()), theme.text);
        row(tt('noch entfernt', 'still away'), fmt.num(norm(sub(c, tC())), 2), cr);
        if (p.show && best && best.rest < 0.01) row(tt('Lösung', 'solution'), `r = ${fmt.num(best.r, 2)}, s = ${fmt.num(best.s, 2)}`, theme.series[2]!);
      } else if (op() === 'spat') {
        row(name, p.show ? `√${fmt.num(normSq(c), 2)} ≈ ${fmt.num(norm(c), 2)}` : '?', cr);
        row(tt('Volumen (Spatprodukt)', 'volume (triple product)'), fmt.num(Math.abs(det3(a, b, tC())), 2), theme.text);
      } else row(name, p.show ? `√${fmt.num(normSq(c), 2)} ≈ ${fmt.num(norm(c), 2)}` : '?', cr);
      if (op() === 'goal' || op() === 'spat') {
        /* bereits oben */
      } else if (op() === 'ab') row(tt('Mittelpunkt M', 'Midpoint M'), p.show ? pointText(midpoint(a, b)) : '?');
      else if (op() === 'scale') row(tt('Länge', 'Length'), p.show ? `|${fmt.num(k, 2)}| · ${fmt.num(norm(a), 2)} = ${fmt.num(Math.abs(k) * norm(a), 2)}` : '?');
      else row(tt('|a| und |b|', '|a| and |b|'), `${fmt.num(norm(a), 2)} ${tt('und', 'and')} ${fmt.num(norm(b), 2)}`);
      if (wide && y < R.y + R.h - 60) {
        const tip = tipText();
        drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(100, R.y + R.h - y - 12) }, tip);
      }
      g.restore();
    }

    /* ---------------- Tafel: Länge und Einheitsvektor ---------------- */
    function panelLen(R: Rect, wide: boolean, x0: number, w: number, y0: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const a = tA();
      const st = lengthSteps(a);
      const res = p.show;
      const q = (s: string) => (res ? s : '?');
      const sq = (v: number) => (v < 0 ? `(${n1(v)})²` : `${n1(v)}²`);
      let y = y0;
      const f = font(700, wide ? 12.5 : 11.5);
      const line = (s: string, color = theme.text, ff = f) => {
        g.font = ff;
        let size = wide ? 12.5 : 11.5;
        while (size > 9 && g.measureText(s).width > w) {
          size -= 0.5;
          g.font = font(700, size);
        }
        text(g, s, x0, y, { font: font(700, size), color, align: 'left' });
        y += 19;
      };
      const eq = (v: number) => (Math.abs(v - Math.round(v * 100) / 100) < 1e-9 ? '=' : '≈');
      line(`d₁₂ = √(${sq(a[0])} + ${sq(a[1])}) = ${q(`√${fmt.num(st.sq12, 2)} ${eq(st.d12)} ${fmt.num(st.d12, 2)}`)}`, CR());
      line(`|a| = √(d₁₂² + ${sq(a[2])}) = ${q(`√${fmt.num(st.sq, 2)} ${eq(st.d)} ${fmt.num(st.d, 2)}`)}`, CA());
      y += 22;
      if (st.d > 1e-9) {
        const e = unit(a);
        drawToks([{ kind: 'vec', s: 'a⁰', color: CR() }, { kind: 'txt', s: '=' }, { kind: 'txt', s: `1/${fmt.num(st.d, 2)}` }, { kind: 'txt', s: '·' }, { kind: 'col', v: a, color: CA() }, { kind: 'txt', s: '=' }, { kind: 'col', v: e, color: CR() }], x0, y, w, wide ? 13.5 : 12);
      } else text(g, tt('Der Nullvektor hat keinen Einheitsvektor.', 'The zero vector has no unit vector.'), x0, y, { font: font(650, 12), color: theme.series[1]!, align: 'left' });
      y += 44;
      // Entdeckungsaufgabe: ganzzahlige Vektoren der Länge 3
      text(g, tt('Finde 5 ganzzahlige Vektoren mit |a| = 3:', 'Find 5 integer vectors with |a| = 3:'), x0, y, { font: font(650, 11.5), color: theme.muted, align: 'left' });
      y += 18;
      for (let i = 0; i < GOAL_N; i++) {
        const cx = x0 + 8 + i * 20;
        g.beginPath();
        const pop = i === found.length - 1 && !reduced ? 1 + 0.5 * clamp(1 - (now - hitAt) / 400, 0, 1) : 1;
        g.arc(cx, y, (i < found.length ? 6.5 * pop : 6.5), 0, Math.PI * 2);
        if (i < found.length) {
          g.fillStyle = theme.series[2]!;
          g.fill();
        } else {
          g.strokeStyle = alpha(theme.text, 0.3);
          g.lineWidth = 1.5;
          g.stroke();
        }
      }
      y += 18;
      if (found.length) {
        // gefundene Vektoren in einer Zeile, bei Platzmangel nur die letzten
        let list = '';
        for (let k = found.length; k >= 1; k--) {
          const cand = found.slice(-k).map((v) => pointText(v)).join('  ');
          g.font = font(650, 10.5);
          if (g.measureText(cand).width <= w) {
            list = cand;
            break;
          }
        }
        text(g, list, x0, y, { font: font(650, 10.5), color: theme.series[2]!, align: 'left' });
        y += 16;
      }
      if (wide && y < R.y + R.h - 46) {
        const msg = shapeA.at(now) > 0.5 ? tt('Alle Lösungen liegen auf der Kugel mit Radius 3 um O. Es gibt genau 30 ganzzahlige: die Achsenpunkte (±3 | 0 | 0) usw. und alle Vertauschungen von (±1 | ±2 | ±2).', 'All solutions lie on the sphere of radius 3 around O. There are exactly 30 integer ones: the axis points (±3, 0, 0) etc. and all permutations of (±1, ±2, ±2).') : tipText();
        drawTip({ x: x0 - 4, y, w: w + 8, h: Math.min(100, R.y + R.h - y - 10) }, msg);
      }
    }

    /* ---------------- Tafel: Dreieck und Schwerpunkt ---------------- */
    function panelTri(R: Rect, wide: boolean, x0: number, w: number, y0: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const a = tA();
      const b = tB();
      const c = tC();
      const s = centroid(a, b, c);
      const m = triangleMids(a, b, c);
      let y = y0 + 44;
      drawToks([{ kind: 'vec', s: 's', color: CR() }, { kind: 'txt', s: '= ⅓ ·' }, { kind: 'txt', s: '(' }, { kind: 'col', v: a, color: CA() }, { kind: 'txt', s: '+' }, { kind: 'col', v: b, color: CB() }, { kind: 'txt', s: '+' }, { kind: 'col', v: c, color: CC() }, { kind: 'txt', s: ')' }, { kind: 'txt', s: '=' }, { kind: 'col', v: s, color: CR() }], x0, y, w, wide ? 13.5 : 12);
      y += 46;
      const row = (label: string, value: string, color = theme.text) => {
        if (y > R.y + R.h - 8) return;
        text(g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
        text(g, value, x0 + w, y, { font: font(800, 12), color, align: 'right' });
        y += 19;
      };
      const show = p.show;
      if (degenerate(a, b, c)) row(tt('A, B, C', 'A, B, C'), tt('auf einer Geraden', 'on one line'), theme.series[1]!);
      if (wide) {
        row(tt('Ma (Mitte von BC)', 'Ma (midpoint of BC)'), show ? pointText(m.bc) : '?');
        row(tt('Mb (Mitte von CA)', 'Mb (midpoint of CA)'), show ? pointText(m.ca) : '?');
        row(tt('Mc (Mitte von AB)', 'Mc (midpoint of AB)'), show ? pointText(m.ab) : '?');
      }
      // Probe: S liegt bei zwei Dritteln jeder Seitenhalbierenden
      const p23 = divide(a, m.bc, 2 / 3);
      row(tt('A + ⅔ · AMa', 'A + ⅔ · AMa'), show ? pointText(p23) : '?', CR());
      if (p.tp) {
        const T = divide(a, b, p.t);
        const ratio = (t: number) => {
          // AT : TB = t : (1 − t); negativ bedeutet: T liegt außerhalb (äußere Teilung)
          const q = 1 - t;
          if (Math.abs(q) < 1e-9) return tt('T = B', 'T = B');
          if (Math.abs(t) < 1e-9) return tt('T = A', 'T = A');
          const r = t / q;
          const nice = (v: number) => fmt.num(Math.round(v * 100) / 100, 2);
          return Math.abs(r) >= 1 ? `${nice(r)} : 1` : `${r < 0 ? '−' : ''}1 : ${nice(1 / Math.abs(r))}`;
        };
        row(tt('T = A + t · AB', 'T = A + t · AB'), show ? pointText(T) : '?', ctx.theme.series[5]!);
        row(tt('AT : TB', 'AT : TB'), show ? ratio(p.t) : '?', ctx.theme.series[5]!);
        if (p.t < 0 || p.t > 1) row(tt('Lage', 'Position'), tt('außerhalb der Strecke AB', 'outside the segment AB'), theme.series[1]!);
      }
      row(tt('Seitenlängen', 'Side lengths'), [norm(sub(b, a)), norm(sub(c, b)), norm(sub(a, c))].map((v) => fmt.num(v, 2)).join(' · '));
      if (wide && y < R.y + R.h - 50) drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(130, R.y + R.h - y - 10) }, tipText());
    }

    function tipText(): string {
      const a = tA();
      const b = tB();
      switch (op()) {
        case 'add':
          return tt('Spitze an Fuß: Hänge b an die Spitze von a. Der Summenpfeil ist die Diagonale des Parallelogramms.', 'Tip to tail: attach b to the tip of a. The sum is the diagonal of the parallelogram.');
        case 'sub':
          return tt('a − b = a + (−b). Der Pfeil führt außerdem von der Spitze von b zur Spitze von a.', 'a − b = a + (−b). It also points from the tip of b to the tip of a.');
        case 'scale':
          return p.k < 0 ? tt('Bei negativem k dreht sich die Richtung um; die Länge wird mit |k| multipliziert.', 'A negative k reverses the direction; the length is multiplied by |k|.') : tt('k · a ist parallel zu a und |k|-mal so lang.', 'k · a is parallel to a and |k| times as long.');
        case 'lin':
          return collinear(a, b) ? tt('a und b sind parallel – ihre Linearkombinationen liegen alle auf einer Geraden.', 'a and b are parallel – all their linear combinations lie on one line.') : tt('Alle Linearkombinationen von a und b liegen in einer Ebene (Gitter).', 'All linear combinations of a and b lie in one plane (grid).');
        case 'goal':
          return tt('Ziehe die rote Spitze in der Ebene oder stelle r und s ein, bis r·a + s·b genau auf c zeigt. Liegt c nicht in der Ebene, geht es nicht.', 'Drag the red tip in the plane or set r and s until r·a + s·b points exactly at c. If c is not in the plane, it is impossible.');
        case 'spat':
          return tt('Tippe eine Ecke an: Der Weg von O dorthin entlang der Kanten ergibt den Vektor. Ziehe die Spitze von c.', 'Tap a corner: the path from O along the edges gives the vector. Drag the tip of c.');
        case 'len':
          return tt('Erst die Diagonale d₁₂ in der x₁x₂-Ebene, dann mit der Höhe: zweimal Pythagoras. Teilt man a durch seine Länge, erhält man den Einheitsvektor a⁰ – er endet auf der Einheitskugel. Ziehe die Spitze von a.', 'First the diagonal d₁₂ in the x₁x₂ plane, then with the height: Pythagoras twice. Dividing a by its length gives the unit vector a⁰ – it ends on the unit sphere. Drag the tip of a.');
        case 'walk':
          return tt('Jeder Schritt ist ein Einheitsvektor in Achsenrichtung. Die Summe s zeigt vom Start zum Ziel. Sortiere die Schritte: Der Weg sieht anders aus, endet aber am selben Punkt – die Reihenfolge beim Addieren ist egal.', 'Each step is a unit vector along an axis. The sum s points from start to finish. Sort the steps: the path looks different but ends at the same point – the order of addition does not matter.');
        case 'tri':
          return tt('Die drei Seitenhalbierenden schneiden sich im Schwerpunkt S. Er teilt jede im Verhältnis 2 : 1 – vom Eckpunkt aus gemessen. Ziehe A, B oder C.', 'The three medians meet at the centroid S. It divides each in the ratio 2 : 1, measured from the vertex. Drag A, B or C.');
        default:
          return tt('„Spitze minus Fuß“: AB = B − A. Der Mittelpunkt ist M = ½ (A + B).', '“Tip minus tail”: AB = B − A. The midpoint is M = ½ (A + B).');
      }
    }

    function drawTip(R: Rect, msg: string): void {
      if (R.h < 36) return;
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.fillStyle = alpha(theme.series[0]!, theme.dark ? 0.14 : 0.07);
      g.fill();
      const f = font(550, 11.5);
      g.font = f;
      const lines: string[] = [];
      let cur = '';
      for (const wd of msg.split(' ')) {
        const nx = cur ? `${cur} ${wd}` : wd;
        if (g.measureText(nx).width > R.w - 18 && cur) {
          lines.push(cur);
          cur = wd;
        } else cur = nx;
      }
      if (cur) lines.push(cur);
      const max = Math.floor((R.h - 12) / 14.5);
      lines.slice(0, max).forEach((l, i) => text(g, l, R.x + 9, R.y + 14 + i * 14.5, { font: f, color: theme.muted, align: 'left' }));
      g.restore();
    }

    /* ---------------- Ergebnisse ---------------- */
    function colHtml(v: V3): string {
      return `(${v.map((x) => n1(x)).join(lang === 'de' ? ' | ' : ', ')})`;
    }
    function updateReadouts(): void {
      const a = tA();
      const b = tB();
      const c = result(a, b);
      const v = (x: string) => `<var>${x}</var>`;
      const lines: Record<Op, string> = {
        add: `${v('a')} + ${v('b')} = ${colHtml(a)} + ${colHtml(b)} = ${colHtml(c)}`,
        sub: `${v('a')} − ${v('b')} = ${colHtml(a)} − ${colHtml(b)} = ${colHtml(c)}`,
        scale: `${fmt.num(p.k, 2)} · ${colHtml(a)} = ${colHtml(c)}`,
        lin: `${fmt.num(p.r, 2)} · ${colHtml(a)} + ${fmt.num(p.s, 2)} · ${colHtml(b)} = ${colHtml(c)}`,
        ab: `AB = B − A = ${colHtml(b)} − ${colHtml(a)} = ${colHtml(c)}`,
        goal: `${fmt.num(p.r, 2)} · ${colHtml(a)} + ${fmt.num(p.s, 2)} · ${colHtml(b)} = ${colHtml(c)}; ${v('c')} = ${colHtml(tC())}`,
        spat: `${['a', 'b', 'c'].filter((_, i) => spatSel[i]).map((x) => v(x)).join(' + ')} = ${colHtml(c)}`,
        len: `${v('a')}⁰ = ${colHtml(a)} : ${fmt.num(norm(a), 2)} = ${colHtml(c)}`,
        tri: `${v('s')} = ⅓ · (${colHtml(a)} + ${colHtml(b)} + ${colHtml(tC())}) = ${colHtml(c)}`,
        walk: p.many ? `${ends.length} ${tt('Wege', 'walks')}; ${tt('Mittelwert von', 'mean of')} |${v('s')}|² = ${ends.length ? fmt.num(meanSq(ends), 2) : '–'}; n = ${p.wn}` : `${v('s')} = ${tt('Summe von', 'sum of')} ${steps.length} ${tt('Schritten', 'steps')} = ${colHtml(c)}`,
      };
      ctx.readout('res', { html: lines[op()] });
      const lv = op() === 'len' ? a : c;
      const exact = Math.abs(norm(lv) - Math.round(norm(lv) * 100) / 100) < 1e-9;
      if (op() === 'walk' && p.many) ctx.readout('len', ends.length ? `${tt('mittlerer Abstand', 'mean distance')} ≈ ${fmt.num(ends.reduce((t, q) => t + norm(q), 0) / ends.length, 2)}; √n ≈ ${fmt.num(Math.sqrt(p.wn), 2)}` : null);
      else ctx.readout('len', `${op() === 'len' ? '|a| = ' : ''}√(${lv.map((x) => (x < 0 ? `(${n1(x)})²` : `${n1(x)}²`)).join(' + ')}) = √${fmt.num(normSq(lv), 2)} ${exact ? '=' : '≈'} ${fmt.num(norm(lv), 2)}`);
      let info: string | null = null;
      if (op() === 'ab') info = `M${pointText(midpoint(a, b))}`;
      else if (op() === 'tri' && p.tp) info = `T = A + ${fmt.num(p.t, 2)} · AB = ${colHtml(divide(a, b, p.t))}`;
      else if (op() === 'goal' || op() === 'spat' || op() === 'tri') info = specialNote()?.text ?? null;
      else if (op() === 'walk') {
        const ct = stepCounts(steps);
        info = steps.length ? [0, 1, 2].map((k) => `x${'₁₂₃'[k]}: +${ct.plus[k]} −${ct.minus[k]}`).join('; ') : null;
      } else if (op() === 'len') info = hintShown || found.length >= GOAL_N ? tt('Alle ganzzahligen Vektoren der Länge 3 liegen auf der Kugel mit Radius 3; es sind 30.', 'All integer vectors of length 3 lie on the sphere of radius 3; there are 30.') : `${tt('Gefunden', 'Found')}: ${found.length} / ${GOAL_N}`;
      else if (op() !== 'scale') {
        const m = multipleOf(a, b);
        if (isZero(b)) info = tt('b ist der Nullvektor.', 'b is the zero vector.');
        else if (m !== null) info = tt(`b = ${fmt.num(m, 2)} · a – die Vektoren sind parallel.`, `b = ${fmt.num(m, 2)} · a – the vectors are parallel.`);
      }
      ctx.readout('info', info);
    }

    retarget(true);
    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('op') && source !== 'init') animStart = reduced ? now - 1e6 : now + 80;
        if (changed.has('op') && source === 'input') {
          // sinnvolle Startwerte für die Entdeckungsansichten
          if (p.op === 'goal') {
            const c = add(tA(), tB());
            if (c.every((x) => Math.abs(x) <= 4)) ctx.set({ c1: c[0], c2: c[1], c3: c[2], r: 0.5, s: 0.5 });
          } else if (p.op === 'spat' && coplanar(tA(), tB(), tC())) ctx.set({ c1: 0, c2: 0, c3: 3 });
          spatSel = [1, 1, 1];
          spatT0 = now;
        }
        if (op() === 'goal' && source !== 'init' && norm(sub(linComb(p.r, tA(), p.s, tB()), tC())) < 1e-6 && now - goalHit > 900) goalHit = now;
        if (changed.has('wn') && source !== 'init') {
          ends = [];
          endTimes = [];
          selBin = null;
        }
        if (changed.has('op') && source !== 'init') opT0 = now;
        // Länge 3 gesucht: neue Lösungen sammeln
        if (op() === 'len' && changed.has('op') && source !== 'init') {
          found = [];
          hintShown = false;
        }
        if (op() === 'len' && (source !== 'init' || found.length === 0) && ['a1', 'a2', 'a3'].some((k) => changed.has(k) || source === 'init')) {
          const a = tA();
          if (Math.abs(normSq(a) - 9) < 1e-9 && a.every((x) => Number.isInteger(x))) {
            if (hasVec(found, a)) {
              if (source !== 'init') dupAt = now;
            } else if (found.length < GOAL_N) {
              found = [...found, a];
              hitAt = source === 'init' ? -1e9 : now;
            }
          }
        }
        if ((changed.has('k') || changed.has('r') || changed.has('s')) && source === 'input' && !animating()) animStart = now - 1e6;
        retarget(source === 'init');
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'play') {
          animStart = reduced ? now - 1e6 : now;
          spatT0 = now;
        } else if ((id === 'w1' || id === 'w10' || id === 'w100') && !ctx.locked) {
          const n = id === 'w1' ? 1 : id === 'w10' ? 10 : 100;
          const t0 = Math.max(now, stepTimes.length ? stepTimes[stepTimes.length - 1]! : now);
          const dt = reduced ? 0 : n === 100 ? 18 : STEP_MS;
          for (let i = 0; i < n && steps.length < 1000; i++) {
            steps.push(axisStep(walkU()));
            stepTimes.push(t0 + (i + 1) * dt);
          }
          retarget();
          updateReadouts();
        } else if (id === 'w500' && !ctx.locked) {
          const t0 = Math.max(now, endTimes.length ? endTimes[endTimes.length - 1]! : now);
          for (let i = 0; i < 500; i++) {
            ends.push(walkEnd(p.wn, walkU));
            endTimes.push(t0 + (reduced ? 0 : (i + 1) * 3));
          }
          if (ends.length > 5000) {
            ends = ends.slice(-5000);
            endTimes = endTimes.slice(-5000);
          }
          retarget();
          updateReadouts();
        } else if (id === 'wclear' && !ctx.locked) {
          steps = [];
          stepTimes = [];
          ends = [];
          endTimes = [];
          selBin = null;
          retarget();
          updateReadouts();
        } else if (id === 'hint') {
          hintShown = true;
          retarget();
          updateReadouts();
        } else if (id === 'clear' && !ctx.locked) {
          found = [];
          hintShown = false;
          dupAt = hitAt = -1e9;
          retarget();
          updateReadouts();
        } else if (id === 'solve' && !ctx.locked) {
          const best = bestRS(tA(), tB(), tC());
          if (best && best.rest < 0.01) ctx.set({ r: clamp(Math.round(best.r * 4) / 4, -2, 2), s: clamp(Math.round(best.s * 4) / 4, -2, 2) });
        }
        else if (id === 'rand' && !ctx.locked) {
          seed += 2;
          const s0 = seed + Math.floor(Math.random() * 1000);
          let a = randomVec(s0);
          let b = randomVec(s0 + 1);
          if (collinear(a, b)) b = [b[0] + 1, b[1], b[2] - 1];
          if (isZero(a)) a = [2, 1, 1];
          ctx.set({ a1: a[0], a2: a[1], a3: a[2], b1: b[0], b2: b[1], b3: b[2] });
          animStart = reduced ? now - 1e6 : now + 300;
        }
        ctx.requestRender();
      },
      resetView: () => view.resetView(true),
      render() {
        now = performance.now();
        surface.begin();
        view.resize();
        drawScene();
        drawPanel();
        const busy =
          [...ga, ...gb, ...gc3, gk, gr, gs, parA, compA, extent, sphA, medA, shapeA, sortA, tpA, gt].some((x) => x.busy(now)) ||
          (stepTimes.length > 0 && now < stepTimes[stepTimes.length - 1]! + 50) ||
          (endTimes.length > 0 && now < endTimes[endTimes.length - 1]! + 50) ||
          (!reduced && now - opT0 < 420) ||
          animating() ||
          now - spatT0 < SPAT_MS + 100 ||
          now - goalHit < 900 ||
          (!reduced && (now - introStart < 900 || now - hitAt < 800 || now - dupAt < 1600));
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
