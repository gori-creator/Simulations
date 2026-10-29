import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import { BOX_EDGES, BOX_FACES, boxCorners, boxVolume, CORNER_NAMES, deltas, distOrigin, distSteps, faceDiagonal, FIGURES, gridRandom, intoOctant, matches, mirrorOf, octant, octantCounts, octantSigns, pInsideOctant, projections, randomPoint, risse, rissMatch, ROMAN, spaceDiagonal, walk, walkAt, where, type P3 } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Mode = 'point' | 'box' | 'dist' | 'find' | 'views' | 'oct';
type Fig = 'none' | 'house' | 'pyr';
type Mirror = 'none' | 'o' | 'e12' | 'e13' | 'e23';

/** Blickrichtungen: schräg, von oben, von vorn, von der Seite. */
const VIEWS = [
  { az: 32, el: 22, name: L('schräg', 'oblique') },
  { az: 0, el: 89, name: L('von oben', 'from above') },
  { az: 0, el: 0, name: L('von vorn', 'from the front') },
  { az: 90, el: 0, name: L('von der Seite', 'from the side') },
];

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
  go(to: number, ms = 550): void {
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

/**
 * Punkte und Körper im räumlichen Koordinatensystem, vier Ansichten:
 * – Punkt: P ziehen (Fußpunkt in der x₁x₂-Ebene, Höhe entlang x₃), Koordinatenweg
 *   vom Ursprung, Projektionen, Spiegelpunkt; liegt P in einer Koordinatenebene
 *   oder auf einer Achse, leuchtet sie auf.
 * – Quader: benannte Ecken, Raumdiagonale mit zweimal Pythagoras.
 * – Abstand: P und Q ziehen, der Abstand entsteht Schritt für Schritt.
 * – Punkt finden: gegebene Koordinaten durch Ziehen treffen.
 * – Risse: Grundriss, Aufriss und Seitenriss von Punkt und Körper mit
 *   Ordnungslinien; Rätsel „Punkt aus den Rissen bestimmen“.
 * – Oktanten: Vorzeichenmuster der acht Oktanten, Punkt per Antippen
 *   hineinspiegeln, Zufallspunkte zählen (auch die auf den Ebenen).
 * Ansicht drehbar, Blickrichtungen schräg, von oben, von vorn und von der Seite.
 */
export default defineSimulation({
  id: 'koordinaten-3d',
  dragHint: true,
  hint: { de: 'Tipp: Zieh den Punkt im Raum oder dreh die Ansicht mit einem Finger.', en: 'Tip: Drag the point in space or rotate the view with one finger.' },
  layout: { aspect: 1.6, aspectNarrow: 0.7 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'point', label: L('Punkt', 'Point') },
        { value: 'box', label: L('Quader', 'Cuboid') },
        { value: 'dist', label: L('Abstand', 'Distance') },
        { value: 'find', label: L('Punkt finden', 'Find the point') },
        { value: 'views', label: L('Risse', 'Views') },
        { value: 'oct', label: L('Oktanten', 'Octants') },
      ],
      default: 'point',
    },
    { key: 'x', type: 'number', label: L('x₁ (nach vorn)', 'x₁ (forward)'), min: -4, max: 4, step: 0.5, default: 3, help: L('Beim Quader: Koordinaten der Ecke A.', 'For the cuboid: coordinates of corner A.') },
    { key: 'y', type: 'number', label: L('x₂ (nach rechts)', 'x₂ (to the right)'), min: -4, max: 4, step: 0.5, default: 4 },
    { key: 'z', type: 'number', label: L('x₃ (nach oben)', 'x₃ (up)'), min: -4, max: 4, step: 0.5, default: 2 },
    { key: 'qx', type: 'number', label: L('Q: x₁', 'Q: x₁'), help: L('Q lässt sich auch im Bild ziehen.', 'Q can also be dragged in the picture.'), min: -4, max: 4, step: 0.5, default: 0, visibleIf: (v) => v.mode === 'dist' },
    { key: 'qy', type: 'number', label: L('Q: x₂', 'Q: x₂'), min: -4, max: 4, step: 0.5, default: 0, visibleIf: (v) => v.mode === 'dist' },
    { key: 'qz', type: 'number', label: L('Q: x₃', 'Q: x₃'), min: -4, max: 4, step: 0.5, default: 0, visibleIf: (v) => v.mode === 'dist' },
    { key: 'a', type: 'number', label: L('Länge a (x₁-Richtung)', 'Length a (x₁ direction)'), min: 0.5, max: 5, step: 0.5, default: 3, visibleIf: (v) => v.mode === 'box' },
    { key: 'b', type: 'number', label: L('Breite b (x₂-Richtung)', 'Width b (x₂ direction)'), min: 0.5, max: 5, step: 0.5, default: 4, visibleIf: (v) => v.mode === 'box' },
    { key: 'c', type: 'number', label: L('Höhe c (x₃-Richtung)', 'Height c (x₃ direction)'), min: 0.5, max: 5, step: 0.5, default: 2, visibleIf: (v) => v.mode === 'box' },
    { key: 'lines', type: 'boolean', group: 'view', label: L('Koordinatenweg und Hilfsquader', 'Coordinate path and helper box'), default: true, visibleIf: (v) => v.mode === 'point' },
    { key: 'proj', type: 'boolean', group: 'view', label: L('Projektionen in die Koordinatenebenen', 'Projections onto the coordinate planes'), default: false, visibleIf: (v) => v.mode === 'point' },
    {
      key: 'mir',
      type: 'choice',
      group: 'view',
      label: L('Spiegelpunkt', 'Mirror point'),
      options: [
        { value: 'none', label: L('keiner', 'none') },
        { value: 'o', label: L('am Ursprung', 'at the origin') },
        { value: 'e12', label: L('an der x₁x₂-Ebene', 'at the x₁x₂ plane') },
        { value: 'e13', label: L('an der x₁x₃-Ebene', 'at the x₁x₃ plane') },
        { value: 'e23', label: L('an der x₂x₃-Ebene', 'at the x₂x₃ plane') },
      ],
      default: 'none',
      visibleIf: (v) => v.mode === 'point',
    },
    {
      key: 'fig',
      type: 'choice',
      group: 'view',
      label: L('Körper', 'Solid'),
      options: [
        { value: 'none', label: L('keiner', 'none') },
        { value: 'house', label: L('Haus', 'House') },
        { value: 'pyr', label: L('Pyramide', 'Pyramid') },
      ],
      default: 'house',
      visibleIf: (v) => v.mode === 'views',
    },
    { key: 'quiz', type: 'boolean', group: 'view', label: L('Rätsel: Punkt aus den Rissen', 'Riddle: point from its views'), default: false, visibleIf: (v) => v.mode === 'views' },
    { key: 'diag', type: 'boolean', group: 'view', label: L('Raumdiagonale AG', 'Space diagonal AG'), default: true, visibleIf: (v) => v.mode === 'box' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Koordinaten anschreiben', 'Label coordinates'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'walk', label: L('Weg vom Ursprung', 'Path from the origin'), primary: true, visibleIf: (v) => v.mode === 'point' },
    { id: 'pyth', label: L('Pythagoras Schritt für Schritt', 'Pythagoras step by step'), primary: true, visibleIf: (v) => v.mode === 'dist' || v.mode === 'box' },
    { id: 'task', label: L('Neue Aufgabe', 'New task'), primary: true, visibleIf: (v) => v.mode === 'find' },
    { id: 'riddle', label: L('Neues Rätsel', 'New riddle'), primary: true, visibleIf: (v) => v.mode === 'views' && v.quiz === true },
    { id: 'rain', label: L('50 Zufallspunkte', '50 random points'), primary: true, visibleIf: (v) => v.mode === 'oct' },
    { id: 'oclear', label: L('Punkte löschen', 'Clear points'), visibleIf: (v) => v.mode === 'oct' },
    { id: 'cam', label: L('Blick: von oben', 'View: from above') },
    { id: 'rand', label: L('Neuer Punkt', 'New point'), visibleIf: (v) => v.mode !== 'find' },
  ],
  readouts: [
    { key: 'coord', label: L('Koordinaten', 'Coordinates'), spoiler: true },
    { key: 'lage', label: L('Lage', 'Position'), spoiler: true },
    { key: 'dist', label: L('Abstand vom Ursprung', 'Distance from the origin'), spoiler: true },
    { key: 'corners', label: L('Eckpunkte', 'Corners'), spoiler: true },
    { key: 'size', label: L('Volumen und Raumdiagonale', 'Volume and space diagonal'), spoiler: true },
    { key: 'count', label: L('Zufallspunkte', 'Random points'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('Punkt P(3 | 4 | 2)', 'Point P(3, 4, 2)'), values: {} },
    { id: 'neg', label: L('Negative Koordinaten', 'Negative coordinates'), values: { x: -2, y: 3, z: -1.5 } },
    { id: 'plane', label: L('Punkt in der x₂x₃-Ebene', 'Point in the x₂x₃ plane'), values: { x: 0, y: 3, z: 3, proj: true } },
    { id: 'proj', label: L('Drei Projektionen', 'Three projections'), values: { x: 2, y: 3, z: 3, proj: true, lines: false } },
    { id: 'mir', label: L('Spiegelpunkt am Ursprung', 'Mirror point at the origin'), values: { x: 2, y: 3, z: 2, mir: 'o' } },
    { id: 'box', label: L('Quader am Ursprung: Raumdiagonale', 'Cuboid at the origin: space diagonal'), values: { mode: 'box', x: 0, y: 0, z: 0, a: 4, b: 3, c: 2 } },
    { id: 'box2', label: L('Quader im Raum', 'Cuboid in space'), values: { mode: 'box', x: 1, y: -2, z: 1, a: 2, b: 3, c: 2.5 } },
    { id: 'dist', label: L('Abstand von (1 | 2 | 2) zum Ursprung', 'Distance from (1, 2, 2) to the origin'), values: { mode: 'dist', x: 1, y: 2, z: 2, qx: 0, qy: 0, qz: 0 } },
    { id: 'dist2', label: L('Abstand zweier Punkte', 'Distance between two points'), values: { mode: 'dist', x: 3, y: 4, z: 2, qx: -1, qy: 1, qz: -2 } },
    { id: 'find', label: L('Punkt finden', 'Find the point'), values: { mode: 'find', x: 1, y: 1, z: 1 } },
    { id: 'views', label: L('Risse eines Hauses', 'Views of a house'), values: { mode: 'views', fig: 'house', x: 3, y: 4, z: 2 } },
    { id: 'views2', label: L('Risse einer Pyramide', 'Views of a pyramid'), values: { mode: 'views', fig: 'pyr', x: -2, y: 2, z: 3 } },
    { id: 'quiz', label: L('Rätsel: Punkt aus den Rissen', 'Riddle: point from its views'), values: { mode: 'views', fig: 'none', quiz: true, x: 0, y: 0, z: 0 } },
    { id: 'oct', label: L('Oktanten und Vorzeichen', 'Octants and signs'), values: { mode: 'oct', x: 2, y: -3, z: 2 } },
    { id: 'octb', label: L('Punkt auf einer Ebene: kein Oktant', 'Point on a plane: no octant'), values: { mode: 'oct', x: 2, y: 0, z: 3 } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit den Achsen x₁, x₂, x₃: ein ziehbarer Punkt mit Koordinatenweg, ein Quader mit benannten Ecken und Raumdiagonale, der Abstand zweier Punkte mit zweimal Pythagoras oder eine Aufgabe, einen Punkt zu finden; drehbare Ansicht' },
    en: { canvas: 'Three-dimensional coordinate system with axes x₁, x₂, x₃: a draggable point with its coordinate path, a cuboid with named corners and space diagonal, the distance between two points with Pythagoras twice, or a task to find a point; rotatable view' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const mode = () => p.mode as Mode;
    const G = (v: number) => new Glide(v, reduced);

    /* ---------------- Aufteilung ---------------- */
    function regions(): { scene: Rect; panel: Rect; wide: boolean } {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide && mode() === 'views') {
        const pw = Math.round(clamp(W * 0.38, 250, 360));
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: H - 12 } };
      }
      if (wide) {
        const pw = Math.round(mode() === 'oct' ? clamp(W * 0.32, 240, 320) : clamp(W * 0.27, 210, 290));
        const need = mode() === 'point' ? 350 : mode() === 'find' ? 330 : mode() === 'oct' ? 360 : 410;
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: Math.min(H - 12, need) } };
      }
      const ph = Math.round(clamp(H * 0.42, 150, mode() === 'point' || mode() === 'dist' ? 236 : mode() === 'views' || mode() === 'oct' ? 250 : 210));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 32, elevation: 22, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene, onTap: (px, py) => tap(px, py), tapCursor: (px, py) => mode() === 'box' && cornerAt(px, py) !== null });

    /* ---------------- Zustand ---------------- */
    const gx = G(p.x);
    const gy = G(p.y);
    const gz = G(p.z);
    const gqx = G(p.qx);
    const gqy = G(p.qy);
    const gqz = G(p.qz);
    const diagA = G(p.diag ? 1 : 0);
    const mirA = G(p.mir !== 'none' ? 1 : 0);
    /** Lage-Hervorhebung (Ebene oder Achse), weich ein- und ausgeblendet. */
    const planeA = { e12: G(0), e13: G(0), e23: G(0), a1: G(0), a2: G(0), a3: G(0) };
    let pythStart = -1e9;
    const PYTH_MS = 4200;
    let findT: P3 = [2, -3, 1];
    let findHits = 0;
    let findOk = -1e9;
    let findSeed = Math.floor(Math.random() * 1000);
    const ga = G(p.a);
    const gb = G(p.b);
    const gc = G(p.c);
    const lo = G(-3);
    const hi = G(5);
    const projA = G(p.proj ? 1 : 0);
    const linesA = G(p.lines ? 1 : 0);
    const showA = G(p.show ? 1 : 0);
    const boxA = G(mode() === 'box' ? 1 : 0);
    const distA = G(mode() === 'dist' ? 1 : 0);
    let now = performance.now();
    let introStart = now + (reduced ? -1e6 : 100);
    let walkStart = -1;
    const WALK_MS = 2600;
    let camIndex = 0;
    let sel: number | null = null;
    let lastDrag = -1e9;
    const figA = G(mode() === 'views' && p.fig !== 'none' ? 1 : 0);
    const viewsA = G(mode() === 'views' ? 1 : 0);
    const octA = G(mode() === 'oct' ? 1 : 0);
    const quizA = G(mode() === 'views' && p.quiz ? 1 : 0);
    /** Zuletzt gezeigter Körper (bleibt beim Ausblenden sichtbar, bis er verschwunden ist). */
    let shownFig: Exclude<Fig, 'none'> = p.fig === 'pyr' ? 'pyr' : 'house';
    let riddleT: P3 = [2, -1, 3];
    let riddleSeed = Math.floor(Math.random() * 1000) + 500;
    let riddleHits = 0;
    let riddleOk = -1e9;
    /** Zufallspunkte der Ansicht „Oktanten“ mit dem Zeitpunkt, zu dem sie landen. */
    let rain: { p: P3; t: number }[] = [];
    let rainState = Math.floor(Math.random() * 1e6) + 1;
    const rainU = () => {
      rainState = (rainState * 16807) % 2147483647;
      return (rainState - 1) / 2147483646;
    };
    const RAIN_FALL = 420;
    let octFlash = -1e9;
    /** Klickflächen der Tafel (Risse bzw. Oktanten). */
    let miniRects: { r: Rect; kind: 'grund' | 'auf' | 'seit' }[] = [];
    let octCells: { r: Rect; n: number }[] = [];

    const P = (): P3 => [gx.at(now), gy.at(now), gz.at(now)];
    const Q = (): P3 => [gqx.at(now), gqy.at(now), gqz.at(now)];
    const targetQ = (): P3 => [p.qx, p.qy, p.qz];
    const target = (): P3 => [p.x, p.y, p.z];
    const corners = (): P3[] => boxCorners(P(), ga.at(now), gb.at(now), gc.at(now));
    const targetCorners = (): P3[] => boxCorners(target(), p.a, p.b, p.c);

    /** Achsenlängen passend zum Inhalt (ganzzahlig, mit Luft). */
    function axisRange(): { lo: number; hi: number } {
      const pts =
        mode() === 'box'
          ? targetCorners()
          : mode() === 'dist'
            ? [target(), targetQ()]
            : mode() === 'find'
              ? [target(), findT]
              : mode() === 'views'
                ? [target(), ...(p.fig !== 'none' ? FIGURES[p.fig as Exclude<Fig, 'none'>].points : []), ...(p.quiz ? [riddleT] : [])]
                : mode() === 'oct'
                  ? [target(), [4, 4, 4] as P3, [-4, -4, -4] as P3]
                  : [target()];
      const all = pts.flat();
      // Bei Quader und Abstand enger um den Inhalt, damit Beschriftungen Platz haben
      const tight = mode() === 'box' || mode() === 'dist';
      const top = Math.max(tight ? 3 : 5, Math.ceil(Math.max(...all) + 1));
      const bot = Math.min(tight ? -1 : -3, Math.floor(Math.min(...all) - 1));
      return { lo: bot, hi: top };
    }

    function retarget(snap = false): void {
      const r = axisRange();
      const pairs: [Glide, number][] = [
        [gx, p.x],
        [gy, p.y],
        [gz, p.z],
        [ga, p.a],
        [gb, p.b],
        [gc, p.c],
        [lo, r.lo],
        [hi, r.hi],
        [projA, p.proj || mode() === 'views' ? 1 : 0],
        [linesA, p.lines ? 1 : 0],
        [showA, p.show ? 1 : 0],
        [boxA, mode() === 'box' ? 1 : 0],
        [gqx, p.qx],
        [gqy, p.qy],
        [gqz, p.qz],
        [diagA, p.diag ? 1 : 0],
        [distA, mode() === 'dist' ? 1 : 0],
        [mirA, p.mir !== 'none' ? 1 : 0],
        [figA, mode() === 'views' && p.fig !== 'none' ? 1 : 0],
        [viewsA, mode() === 'views' ? 1 : 0],
        [octA, mode() === 'oct' ? 1 : 0],
        [quizA, mode() === 'views' && p.quiz ? 1 : 0],
      ];
      if (p.fig !== 'none') shownFig = p.fig as Exclude<Fig, 'none'>;
      // Sonderfälle: Ebene bzw. Achse aufleuchten lassen (Punkt und Punkt finden)
      const w = where(target());
      const on = mode() === 'point' || mode() === 'find' || mode() === 'views' || mode() === 'oct';
      const lit = {
        e12: on && w.kind === 'plane' && w.plane === 12,
        e13: on && w.kind === 'plane' && w.plane === 13,
        e23: on && w.kind === 'plane' && w.plane === 23,
        a1: on && w.kind === 'axis' && w.axis === 1,
        a2: on && w.kind === 'axis' && w.axis === 2,
        a3: on && w.kind === 'axis' && w.axis === 3,
      };
      for (const k of Object.keys(planeA) as (keyof typeof planeA)[]) {
        if (snap) planeA[k].snap(lit[k] ? 1 : 0);
        else planeA[k].go(lit[k] ? 1 : 0, 450);
      }
      const dragging = performance.now() - lastDrag < 200;
      for (const [g, v] of pairs) {
        if (snap) g.snap(v);
        else g.go(v, dragging ? 120 : 550);
      }
    }

    /* ---------------- Farben, Texte ---------------- */
    const C1 = () => ctx.theme.series[1]!;
    const C2 = () => ctx.theme.series[2]!;
    const C3 = () => ctx.theme.series[0]!;
    const CP = () => ctx.theme.series[3]!;
    const CB = () => ctx.theme.series[5]!;
    const CQ = () => ctx.theme.series[4]!;
    const CD = () => ctx.theme.series[4]!;
    const axisColor = (k: number) => [C1(), C2(), C3()][k]!;
    const n1 = (v: number) => fmt.num(v, 1);
    // „=“, wenn der auf 2 Stellen gezeigte Wert exakt ist (√25 = 5), sonst „≈“
    const rel2 = (v: number) => (Math.abs(v * 100 - Math.round(v * 100)) < 1e-9 ? '=' : '≈');
    // gerundete Werte mit Endnull („≈ 6,40“), exakte ohne („= 5“)
    const val2 = (v: number) => (rel2(v) === '=' ? fmt.num(v, 2) : fmt.fixed(v, 2));
    const sep = lang === 'de' ? ' | ' : ', ';
    const coordText = (q: P3) => `(${n1(q[0])}${sep}${n1(q[1])}${sep}${n1(q[2])})`;
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');

    function whereText(q: P3): string {
      const w = where(q);
      if (w.kind === 'origin') return tt('Ursprung O', 'origin O');
      if (w.kind === 'axis') return tt(`auf der x${'₁₂₃'[w.axis - 1]}-Achse`, `on the x${'₁₂₃'[w.axis - 1]} axis`);
      if (w.kind === 'plane') {
        const nm = w.plane === 12 ? 'x₁x₂' : w.plane === 13 ? 'x₁x₃' : 'x₂x₃';
        return tt(`in der ${nm}-Ebene`, `in the ${nm} plane`);
      }
      return q[2] > 0 ? tt('oberhalb der x₁x₂-Ebene', 'above the x₁x₂ plane') : tt('unterhalb der x₁x₂-Ebene', 'below the x₁x₂ plane');
    }

    /* ---------------- Zeiger ---------------- */
    const editable = () => !ctx.locked;
    const inR = (r: Rect, px: number, py: number) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    const pointLike = () => mode() === 'point' || mode() === 'dist' || mode() === 'find' || mode() === 'views' || mode() === 'oct';
    const dragged = () => (lastDrag = performance.now());
    const r05 = (v: number) => Math.round(v * 2) / 2;
    // Punkt: Höhe entlang x₃ (zuerst, damit er bei gleicher Lage Vorrang hat)
    view.addHandle({
      get: () => P() as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ z: clamp(r05(q[2]), -4, 4) });
      },
      axis: [0, 0, 1],
      enabled: () => editable() && pointLike() && Math.abs(p.z) > 0.25,
      color: () => C3(),
    });
    // Punkt: Fußpunkt in der x₁x₂-Ebene
    view.addHandle({
      get: () => [gx.at(now), gy.at(now), 0],
      set: (q) => {
        dragged();
        ctx.set({ x: clamp(r05(q[0]), -4, 4), y: clamp(r05(q[1]), -4, 4) });
      },
      plane: [0, 0, 1],
      enabled: () => editable() && pointLike(),
      color: () => CP(),
    });
    // Q (Ansicht „Abstand“): Höhe und Fußpunkt
    view.addHandle({
      get: () => Q() as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ qz: clamp(r05(q[2]), -4, 4) });
      },
      axis: [0, 0, 1],
      enabled: () => editable() && mode() === 'dist' && Math.abs(p.qz) > 0.25,
      color: () => C3(),
    });
    view.addHandle({
      get: () => [gqx.at(now), gqy.at(now), 0],
      set: (q) => {
        dragged();
        ctx.set({ qx: clamp(r05(q[0]), -4, 4), qy: clamp(r05(q[1]), -4, 4) });
      },
      plane: [0, 0, 1],
      enabled: () => editable() && mode() === 'dist',
      color: () => CQ(),
    });
    // Quader: Ecke A verschieben (waagerecht), Ecke C ändert a und b, Ecke G die Höhe c
    view.addHandle({
      get: () => corners()[0]! as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ x: clamp(r05(q[0]), -4, 4), y: clamp(r05(q[1]), -4, 4) });
      },
      plane: [0, 0, 1],
      enabled: () => editable() && mode() === 'box',
      color: () => CP(),
    });
    view.addHandle({
      get: () => corners()[2]! as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ a: clamp(r05(q[0] - p.x), 0.5, 5), b: clamp(r05(q[1] - p.y), 0.5, 5) });
      },
      plane: [0, 0, 1],
      enabled: () => editable() && mode() === 'box',
      color: () => CB(),
    });
    view.addHandle({
      get: () => corners()[6]! as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ c: clamp(r05(q[2] - p.z), 0.5, 5) });
      },
      axis: [0, 0, 1],
      enabled: () => editable() && mode() === 'box',
      color: () => C3(),
    });

    function cornerAt(px: number, py: number): number | null {
      if (mode() !== 'box') return null;
      let best: number | null = null;
      let bd = 20;
      corners().forEach((q, i) => {
        const [x, y] = view.toPx(q as Vec3);
        const d = Math.hypot(x - px, y - py);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    }

    function tap(px: number, py: number): void {
      const c = cornerAt(px, py);
      sel = c === null || c === sel ? null : c;
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------------- Zeichnen: Szene ---------------- */
    function introOf(delay: number, ms = 600): number {
      if (reduced) return 1;
      return ease.outCubic(clamp((now - introStart - delay) / ms, 0, 1));
    }

    function drawScene(): void {
      const theme = ctx.theme;
      const R = regions().scene;
      const narrow = R.w < 520;
      const L0 = lo.at(now);
      const H0 = hi.at(now);
      const ext = Math.max(H0, -L0);
      view.setScene({ target: [0.4, 0.6, 0.9], radius: ext * (narrow ? 0.98 : 0.86), anchor: [0.5, narrow ? 0.54 : 0.53] });
      view.begin();
      const grow = introOf(0, 700);
      // Gitter in der x₁x₂-Ebene
      if (p.grid) view.grid({ min: [L0, L0], max: [H0, H0], step: 1, color: theme.gridMinor, fade: true });
      // Koordinatenebenen ganz zart andeuten
      const pl = (pts: Vec3[], c: string) => view.face(pts, { color: c, alpha: theme.dark ? 0.05 : 0.035, flat: true, layer: 'back' });
      pl(
        [
          [0, 0, 0],
          [0, H0, 0],
          [0, H0, H0],
          [0, 0, H0],
        ],
        C1(),
      );
      pl(
        [
          [0, 0, 0],
          [H0, 0, 0],
          [H0, 0, H0],
          [0, 0, H0],
        ],
        C2(),
      );
      // Achsen (farbig) mit Teilstrichen
      for (let k = 0; k < 3; k++) {
        const a: [number, number, number] = [0, 0, 0];
        const b: [number, number, number] = [0, 0, 0];
        a[k] = L0 * grow;
        b[k] = (H0 + 0.6) * grow;
        view.arrow(a, b, { color: axisColor(k), width: 2.4, head: 13, depthBias: 0.05 });
        if (grow > 0.6) {
          const lab = ['x₁', 'x₂', 'x₃'][k]!;
          view.label(b, lab, { color: axisColor(k), size: 16, math: true, weight: '700', offset: k === 2 ? [12, -4] : k === 0 ? [-14, 10] : [6, -12], align: 'center', baseline: 'middle' });
        }
      }
      if (grow > 0.98) view.axes({ min: L0, max: H0 + 0.6, labels: false, color: theme.axis, width: 1 });
      view.point([0, 0, 0], { color: theme.text, radius: 3.5 });
      view.label([0, 0, 0], 'O', { color: theme.muted, size: 12, weight: '700', offset: [-10, 12] });

      drawLage(L0, H0);
      const ptA = (1 - boxA.at(now)) * (1 - distA.at(now));
      if (ptA > 0.001) drawPoint(ptA);
      if (boxA.at(now) > 0.001) drawBox(boxA.at(now));
      if (distA.at(now) > 0.001) drawDist(distA.at(now));
      if (mode() === 'find') drawFindTarget();
      if (viewsA.at(now) > 0.001) drawViews3D(viewsA.at(now));
      if (octA.at(now) > 0.001) drawOct(octA.at(now));
      view.end();
    }

    /** Sonderfall sichtbar machen: Punkt in einer Koordinatenebene bzw. auf einer Achse. */
    function drawLage(L0: number, H0: number): void {
      const theme = ctx.theme;
      const col = theme.series[5]!;
      const planes: [keyof typeof planeA, Vec3[], string][] = [
        ['e12', [[L0, L0, 0], [H0, L0, 0], [H0, H0, 0], [L0, H0, 0]], tt('x₁x₂-Ebene', 'x₁x₂ plane')],
        ['e13', [[L0, 0, L0], [H0, 0, L0], [H0, 0, H0], [L0, 0, H0]], tt('x₁x₃-Ebene', 'x₁x₃ plane')],
        ['e23', [[0, L0, L0], [0, H0, L0], [0, H0, H0], [0, L0, H0]], tt('x₂x₃-Ebene', 'x₂x₃ plane')],
      ];
      for (const [k, pts, name] of planes) {
        const a = planeA[k].at(now);
        if (a < 0.01) continue;
        view.face(pts, { color: col, alpha: (theme.dark ? 0.22 : 0.16) * a, flat: true, layer: 'back', stroke: mixColor(col, theme.bg, 0, 0.6 * a), width: 1.5 });
        if (a > 0.5) view.label(pts[2]!, name, { color: col, size: 12, weight: '800', offset: [-6, -6], align: 'right', baseline: 'bottom', background: alpha(cardBg(), 0.85) });
      }
      for (let k = 0; k < 3; k++) {
        const a = [planeA.a1, planeA.a2, planeA.a3][k]!.at(now);
        if (a < 0.01) continue;
        const from: [number, number, number] = [0, 0, 0];
        const to: [number, number, number] = [0, 0, 0];
        from[k] = L0;
        to[k] = H0 + 0.4;
        view.segment(from, to, { color: axisColor(k), width: 9, alpha: 0.3 * a, depthBias: 0.04 });
      }
    }

    function drawPoint(A: number): void {
      const theme = ctx.theme;
      const q = P();
      const v = q as Vec3;
      const foot: Vec3 = [q[0], q[1], 0];
      const pop = introOf(350, 650);
      const lin = linesA.at(now) * A * introOf(500);
      // Hilfsquader (Koordinatenquader) gestrichelt
      if (lin > 0.01) {
        const cs = boxCorners([0, 0, 0], q[0], q[1], q[2]);
        for (const [i, j] of BOX_EDGES) view.segment(cs[i]! as Vec3, cs[j]! as Vec3, { color: theme.muted, width: 1.1, dash: [4, 5], alpha: lin * 0.55 });
      }
      // Koordinatenweg: farbige Abschnitte x₁ → x₂ → x₃
      const w = walk(q);
      const walking = walkStart >= 0 && now - walkStart < WALK_MS + 400;
      const s = walking ? clamp(((now - walkStart) / WALK_MS) * 3, 0, 3) : 3;
      const pathA = walking ? A : lin;
      if (pathA > 0.01) {
        for (let k = 0; k < 3; k++) {
          const t = clamp(s - k, 0, 1);
          if (t <= 0) continue;
          const a = w[k]! as Vec3;
          const b = vec3.lerp(a, w[k + 1]! as Vec3, t);
          view.segment(a, b, { color: axisColor(k), width: walking ? 4 : 3, alpha: pathA });
          // Länge des Abschnitts anschreiben
          const len = (w[k + 1]![k]! - w[k]![k]!) as number;
          if (t > 0.6 && Math.abs(len) > 0.01 && showA.at(now) > 0.5) {
            view.label(vec3.lerp(a, w[k + 1]! as Vec3, 0.5), n1(len), { color: axisColor(k), size: 12, weight: '800', align: 'center', baseline: 'middle', offset: k === 2 ? [14, 0] : [0, 12], background: alpha(cardBg(), 0.85) });
          }
        }
        if (walking && s < 3) view.ball(walkAt(q, s) as Vec3, 0.16, { color: theme.text });
      }
      // senkrechtes Lot vom Punkt zum Fußpunkt (immer, sehr dezent)
      if (Math.abs(q[2]) > 0.01) view.segment(v, foot, { color: CP(), width: 1.5, dash: [3, 4], alpha: A * 0.7 * pop });
      view.point(foot, { color: CP(), radius: 3.5, hollow: true });
      // Projektionen in die Koordinatenebenen
      const pa = projA.at(now) * A;
      if (pa > 0.01) {
        const pr = projections(q);
        const items: [P3, string][] = [
          [pr.p12, 'P₁₂'],
          [pr.p13, 'P₁₃'],
          [pr.p23, 'P₂₃'],
        ];
        for (const [pp, nm] of items) {
          view.segment(v, pp as Vec3, { color: theme.series[4]!, width: 1.4, dash: [2, 4], alpha: pa * 0.8 });
          view.point(pp as Vec3, { color: theme.series[4]!, radius: 4.5 * pa });
          const sc = regions().scene;
          const full = showA.at(now) > 0.5 && sc.w >= 520;
          const right = view.toPx(pp as Vec3)[0] > sc.x + sc.w - (full ? 150 : 70);
          view.label(pp as Vec3, full ? `${nm}${coordText(pp)}` : nm, { color: theme.series[4]!, size: 12, weight: '700', offset: [right ? -8 : 8, -8], align: right ? 'right' : 'left', baseline: 'bottom' });
        }
      }
      // Spiegelpunkt
      const ma = mirA.at(now) * A * (mode() === 'point' ? 1 : 0);
      if (ma > 0.01 && p.mir !== 'none') {
        const m = mirrorOf(q, p.mir as Exclude<Mirror, 'none'>) as Vec3;
        const via: Vec3 = p.mir === 'o' ? [0, 0, 0] : p.mir === 'e12' ? [q[0], q[1], 0] : p.mir === 'e13' ? [q[0], 0, q[2]] : [0, q[1], q[2]];
        view.segment(v, m, { color: theme.series[4]!, width: 1.6, dash: [5, 4], alpha: ma * 0.8 });
        view.point(via, { color: theme.series[4]!, radius: 3.5, hollow: true });
        view.ball(m, 0.17, { color: theme.series[4]!, alpha: ma });
        const tm = mirrorOf(target(), p.mir as Exclude<Mirror, 'none'>);
        const lab = showA.at(now) > 0.5 ? `P'${coordText(tm)}` : "P'";
        const right = view.toPx(m)[0] > regions().scene.x + regions().scene.w - 130;
        view.label(m, lab, { color: theme.series[4]!, size: 13, weight: '800', offset: [right ? -12 : 12, 12], align: right ? 'right' : 'left', baseline: 'top' });
      }
      // der Punkt selbst
      if (pop > 0.01) {
        view.ball(v, 0.2 * (0.4 + 0.6 * ease.outBack(pop)), { color: CP() });
        const lab = showA.at(now) > 0.5 ? `P${coordText(target())}` : 'P';
        const right = view.toPx(v)[0] > regions().scene.x + regions().scene.w - 120;
        view.label(v, lab, { color: theme.text, size: 14, weight: '800', offset: [right ? -12 : 12, -12], align: right ? 'right' : 'left', baseline: 'bottom' });
      }
    }

    function drawBox(A: number): void {
      const theme = ctx.theme;
      const cs = corners();
      const pop = introOf(300, 700);
      const col = CB();
      const cam = view.camera.position;
      // Schatten auf der x₁x₂-Ebene (nur, wenn der Quader darüber liegt)
      if (cs[0]![2] >= -0.01) view.shadow([cs[0]!, cs[1]!, cs[2]!, cs[3]!].map((q) => [q[0], q[1], 0] as Vec3), { alpha: 0.12 * A, blur: 16, spread: 1.04 });
      const center = vec3.centroid(cs as Vec3[]);
      BOX_FACES.forEach((f, k) => {
        const pts = f.map((i) => cs[i]! as Vec3);
        const fc = vec3.centroid(pts);
        const out = vec3.sub(fc, center);
        const front = vec3.dot(out, vec3.sub(cam, fc)) > 0;
        view.face(pts, { color: theme.dark ? col : mixColor(col, '#ffffff', 0.25), alpha: (front ? 0.2 : 0.32) * A * pop, flat: k > 1, gloss: 0.1, layer: front ? 'front' : 'back' });
      });
      // Kanten: sichtbare kräftig, verdeckte gestrichelt
      const faceFront = BOX_FACES.map((f) => {
        const pts = f.map((i) => cs[i]! as Vec3);
        const fc = vec3.centroid(pts);
        return vec3.dot(vec3.sub(fc, center), vec3.sub(cam, fc)) > 0;
      });
      const edgeCol = mixColor(col, theme.dark ? '#ffffff' : '#0b1220', theme.dark ? 0.2 : 0.35);
      for (const [i, j] of BOX_EDGES) {
        const visible = BOX_FACES.some((f, k) => faceFront[k] && f.includes(i) && f.includes(j));
        view.segment(cs[i]! as Vec3, cs[j]! as Vec3, visible ? { color: edgeCol, width: 2.2, alpha: A, layer: 'front' } : { color: edgeCol, width: 1.2, dash: [5, 4], alpha: A * 0.7, layer: 'back' });
      }
      // Ecken mit Namen
      const show = showA.at(now) > 0.5;
      cs.forEach((q, i) => {
        const isSel = sel === i;
        const r = introOf(400 + i * 60, 450);
        if (r <= 0) return;
        view.point(q as Vec3, { color: isSel ? CP() : edgeCol, radius: (isSel ? 6 : 4) * r, layer: 'front' });
        // Beschriftung vom Quadermittelpunkt weg nach außen
        const [x, y] = view.toPx(q as Vec3);
        const [mx, my] = view.toPx(center);
        let dx = x - mx;
        let dy = y - my;
        const l = Math.hypot(dx, dy) || 1;
        dx /= l;
        dy /= l;
        const nm = CORNER_NAMES[i]!;
        const lab = isSel && show ? `${nm}${coordText(targetCorners()[i]!)}` : nm;
        view.label(q as Vec3, lab, {
          color: isSel ? theme.text : theme.text,
          size: isSel ? 14 : 13,
          weight: '800',
          offset: [dx * 14, dy * 14],
          align: dx > 0.3 ? 'left' : dx < -0.3 ? 'right' : 'center',
          baseline: 'middle',
          background: isSel ? alpha(cardBg(), 0.92) : undefined,
          layer: 'front',
        });
      });
      // Raumdiagonale AG mit Flächendiagonale AC (zweimal Pythagoras)
      const da = diagA.at(now) * A;
      if (da > 0.01) {
        const s3 = pythProgress();
        const AC = clamp(s3, 0, 1);
        const CG = clamp(s3 - 1, 0, 1);
        const AG = clamp(s3 - 2, 0, 1);
        const a0 = cs[0]! as Vec3;
        const c2 = cs[2]! as Vec3;
        const g6 = cs[6]! as Vec3;
        if (AC > 0) view.segment(a0, vec3.lerp(a0, c2, AC), { color: CD(), width: 2, dash: [6, 4], alpha: da, layer: 'front' });
        if (CG > 0) view.segment(c2, vec3.lerp(c2, g6, CG), { color: C3(), width: 2.6, alpha: da, layer: 'front' });
        if (AG > 0) view.segment(a0, vec3.lerp(a0, g6, AG), { color: CD(), width: 3.4, alpha: da, layer: 'front' });
        if (show && AC > 0.9) view.label(vec3.lerp(a0, c2, 0.55), `√(a² + b²) = ${fmt.num(faceDiagonal(p.a, p.b), 2)}`, { color: CD(), size: 11.5, weight: '700', align: 'center', baseline: 'middle', offset: [0, 12], background: alpha(cardBg(), 0.88), layer: 'front' });
        if (show && AG > 0.9) view.label(vec3.lerp(a0, g6, 0.5), `d ${rel2(spaceDiagonal(p.a, p.b, p.c))} ${val2(spaceDiagonal(p.a, p.b, p.c))}`, { color: CD(), size: 13, weight: '800', align: 'center', baseline: 'middle', offset: [0, -14], background: alpha(cardBg(), 0.9), layer: 'front' });
        if (AG > 0.9) rightAngle(c2, a0, g6, CD(), da);
      }
      // Kantenlängen
      if (show) {
        const dim = (i: number, j: number, txt: string, c: string) => {
          const m = vec3.lerp(cs[i]! as Vec3, cs[j]! as Vec3, 0.5);
          const [x, y] = view.toPx(m);
          const [mx, my] = view.toPx(center);
          const l = Math.hypot(x - mx, y - my) || 1;
          view.label(m, txt, { color: c, size: 12, weight: '700', align: 'center', baseline: 'middle', offset: [((x - mx) / l) * 22, ((y - my) / l) * 16], background: alpha(cardBg(), 0.85), layer: 'front' });
        };
        dim(0, 1, `a = ${n1(p.a)}`, C1());
        dim(1, 2, `b = ${n1(p.b)}`, C2());
        dim(2, 6, `c = ${n1(p.c)}`, C3());
      }
    }

    /** Fortschritt der Pythagoras-Animation (0 … 5; ohne Animation fertig). */
    function pythProgress(): number {
      if (reduced || pythStart < 0) return 5;
      return clamp(((now - pythStart) / PYTH_MS) * 5, 0, 5);
    }

    /** Rechter Winkel an der Ecke `at` zwischen den Richtungen zu `a` und `b`. */
    function rightAngle(at: Vec3, a: Vec3, b: Vec3, col: string, A: number): void {
      const da = vec3.sub(a, at);
      const db = vec3.sub(b, at);
      const la = Math.hypot(...da);
      const lb = Math.hypot(...db);
      if (la < 0.05 || lb < 0.05) return;
      const k = Math.min(0.32, la * 0.3, lb * 0.3);
      const u = vec3.scale(da, k / la);
      const w = vec3.scale(db, k / lb);
      view.polyline([vec3.add(at, u), vec3.add(vec3.add(at, u), w), vec3.add(at, w)], { color: col, width: 1.4, alpha: A, layer: 'front' });
    }

    function drawDist(A: number): void {
      const theme = ctx.theme;
      const P0 = P();
      const Q0 = Q();
      const vP = P0 as Vec3;
      const vQ = Q0 as Vec3;
      const steps = distSteps(P0, Q0);
      const H = steps.corner as Vec3;
      const A1: Vec3 = [Q0[0], P0[1], P0[2]];
      const s5 = pythProgress();
      const show = showA.at(now) > 0.5;
      // Fußpunkte
      for (const [v, c] of [
        [vP, CP()],
        [vQ, CQ()],
      ] as const) {
        if (Math.abs(v[2]) > 0.01) view.segment(v, [v[0], v[1], 0], { color: c, width: 1.3, dash: [3, 4], alpha: A * 0.6 });
        view.point([v[0], v[1], 0], { color: c, radius: 3.2, hollow: true });
      }
      // Hilfsquader zwischen P und Q (gestrichelt)
      const cs = boxCorners([Math.min(P0[0], Q0[0]), Math.min(P0[1], Q0[1]), Math.min(P0[2], Q0[2])], Math.abs(Q0[0] - P0[0]), Math.abs(Q0[1] - P0[1]), Math.abs(Q0[2] - P0[2]));
      for (const [i, j] of BOX_EDGES) view.segment(cs[i]! as Vec3, cs[j]! as Vec3, { color: theme.muted, width: 1, dash: [3, 5], alpha: A * 0.35 });
      const leg = (a: Vec3, b: Vec3, t: number, col: string, txt: string, off: [number, number]) => {
        if (t <= 0) return;
        view.segment(a, vec3.lerp(a, b, t), { color: col, width: 3.2, alpha: A, layer: 'front' });
        if (show && t > 0.85 && Math.hypot(...vec3.sub(b, a)) > 0.05) view.label(vec3.lerp(a, b, 0.5), txt, { color: col, size: 12, weight: '800', align: 'center', baseline: 'middle', offset: off, background: alpha(cardBg(), 0.88), layer: 'front' });
      };
      const d = deltas(target(), targetQ());
      leg(vP, A1, clamp(s5, 0, 1), C1(), `Δx₁ = ${n1(d[0])}`, [0, 14]);
      leg(A1, H, clamp(s5 - 1, 0, 1), C2(), `Δx₂ = ${n1(d[1])}`, [0, 14]);
      const t3 = clamp(s5 - 2, 0, 1);
      if (t3 > 0) {
        view.segment(vP, vec3.lerp(vP, H, t3), { color: CD(), width: 2, dash: [6, 4], alpha: A, layer: 'front' });
        if (s5 >= 2.9) rightAngle(A1, vP, H, theme.text, A * 0.8);
        if (show && t3 > 0.85 && steps.d12 > 0.05) view.label(vec3.lerp(vP, H, 0.5), `d₁₂ = ${fmt.num(distSteps(target(), targetQ()).d12, 2)}`, { color: CD(), size: 11.5, weight: '700', align: 'center', baseline: 'middle', offset: [0, -14], background: alpha(cardBg(), 0.88), layer: 'front' });
      }
      leg(H, vQ, clamp(s5 - 3, 0, 1), C3(), `Δx₃ = ${n1(d[2])}`, [24, 0]);
      const t5 = clamp(s5 - 4, 0, 1);
      if (t5 > 0) {
        view.segment(vP, vec3.lerp(vP, vQ, t5), { color: CD(), width: 4, alpha: A, layer: 'front' });
        if (s5 >= 4.9 && Math.abs(Q0[2] - P0[2]) > 0.05) rightAngle(H, vP, vQ, theme.text, A * 0.8);
        if (show && t5 > 0.85) view.label(vec3.lerp(vP, vQ, 0.5), `|PQ| ${rel2(distSteps(target(), targetQ()).d)} ${val2(distSteps(target(), targetQ()).d)}`, { color: CD(), size: 13.5, weight: '800', align: 'center', baseline: 'middle', offset: [-30, -16], background: alpha(cardBg(), 0.92), layer: 'front' });
      }
      view.ball(vP, 0.19, { color: CP(), alpha: A });
      view.ball(vQ, 0.19, { color: CQ(), alpha: A });
      const sc = regions().scene;
      for (const [v, nm, tq, c] of [
        [vP, 'P', target(), CP()],
        [vQ, 'Q', targetQ(), CQ()],
      ] as const) {
        const right = view.toPx(v)[0] > sc.x + sc.w - 130;
        view.label(v, show ? `${nm}${coordText(tq)}` : nm, { color: c, size: 13.5, weight: '800', offset: [right ? -12 : 12, -12], align: right ? 'right' : 'left', baseline: 'bottom' });
      }
    }

    /** Punkt finden: nach einem Treffer leuchtet das Ziel auf. */
    function drawFindTarget(): void {
      const ok = now - findOk;
      if (ok > 1600) return;
      const u = reduced ? 1 : clamp(ok / 1600, 0, 1);
      const theme = ctx.theme;
      view.ball(findT as Vec3, 0.2 + 0.6 * ease.outCubic(u), { color: theme.series[2]!, alpha: 0.5 * (1 - u) });
    }


    /* ---------------- Zeichnen: Risse im Raum ---------------- */
    /** Risse des Körpers und des Rätselpunkts in den drei Koordinatenebenen. */
    function drawViews3D(A: number): void {
      const theme = ctx.theme;
      const fa = figA.at(now) * A;
      if (fa > 0.01) {
        const f = FIGURES[shownFig];
        const col = CB();
        const edgeCol = mixColor(col, theme.dark ? '#ffffff' : '#0b1220', theme.dark ? 0.15 : 0.3);
        const grow = introOf(200, 700);
        const P3v = (q: P3): Vec3 => [q[0], q[1], q[2] * grow];
        for (const [i, j] of f.edges) view.segment(P3v(f.points[i]!), P3v(f.points[j]!), { color: edgeCol, width: 2.4, alpha: fa });
        f.points.forEach((q, i) => {
          view.point(P3v(q), { color: alpha(edgeCol, fa), radius: 3.5 });
          if (p.show && regions().scene.w >= 420) view.label(P3v(q), f.names[i]!, { color: alpha(theme.muted, fa), size: 11, weight: '700', offset: [7, -7], align: 'left', baseline: 'bottom' });
        });
        // Schattenbilder in den Koordinatenebenen: Grundriss, Aufriss, Seitenriss
        const rc = theme.series[4]!;
        const flat: [(q: P3) => Vec3, number][] = [
          [(q) => [q[0], q[1], 0], 0.75],
          [(q) => [0, q[1], q[2] * grow], 0.6],
          [(q) => [q[0], 0, q[2] * grow], 0.6],
        ];
        for (const [proj, a] of flat) for (const [i, j] of f.edges) view.segment(proj(f.points[i]!), proj(f.points[j]!), { color: rc, width: 1.3, alpha: fa * a, layer: 'back' });
      }
      // Rätsel: von T sind nur die drei Risse bekannt
      const qa = quizA.at(now) * A;
      if (qa > 0.01) {
        const pr = projections(riddleT);
        const tc = theme.series[1]!;
        const solved = rissMatch(target(), riddleT);
        const marks: [P3, string, boolean][] = [
          [pr.p12, 'T′', solved.grund],
          [pr.p23, 'T″', solved.auf],
          [pr.p13, 'T‴', solved.seit],
        ];
        for (const [q, nm, ok] of marks) {
          view.custom(
            q as Vec3,
            (g) => {
              const [x, y] = view.toPx(q as Vec3);
              g.save();
              g.globalAlpha *= qa;
              g.strokeStyle = ok ? theme.series[2]! : tc;
              g.lineWidth = 2.6;
              g.beginPath();
              g.moveTo(x - 6, y - 6);
              g.lineTo(x + 6, y + 6);
              g.moveTo(x + 6, y - 6);
              g.lineTo(x - 6, y + 6);
              g.stroke();
              text(g, nm, x + 9, y + 10, { font: font(800, 12), color: ok ? theme.series[2]! : tc, align: 'left' });
              g.restore();
            },
            'front',
          );
        }
        const ok = now - riddleOk;
        if (ok < 1600) {
          const u = reduced ? 1 : clamp(ok / 1600, 0, 1);
          view.ball(riddleT as Vec3, 0.2 + 0.6 * ease.outCubic(u), { color: theme.series[2]!, alpha: 0.5 * (1 - u) });
        }
      }
    }

    /* ---------------- Zeichnen: Oktanten ---------------- */
    function octColor(n: number): string {
      const s = ctx.theme.series;
      const pal = [s[0]!, s[1]!, s[2]!, s[3]!, s[4]!, s[5]!, mixColor(s[0]!, ctx.theme.text, 0.45), mixColor(s[3]!, ctx.theme.text, 0.45)];
      return n >= 1 ? pal[n - 1]! : ctx.theme.muted;
    }

    function drawOct(A: number): void {
      const theme = ctx.theme;
      const E = Math.min(4, hi.at(now) - 0.5);
      // Bei verdeckten Koordinaten (Aufgabenmodus) wird kein Oktant hervorgehoben
      const n = p.show ? octant(target()) : 0;
      // Oktant von P als zarter Kasten
      if (n > 0) {
        const sg = octantSigns(n);
        const flash = reduced ? 0 : clamp(1 - (now - octFlash) / 700, 0, 1);
        const cs = boxCorners([Math.min(0, sg[0] * E), Math.min(0, sg[1] * E), Math.min(0, sg[2] * E)], E, E, E);
        const col = octColor(n);
        BOX_FACES.forEach((f) => view.face(f.map((i) => cs[i]! as Vec3), { color: col, alpha: (0.07 + 0.12 * flash) * A, flat: true, layer: 'back' }));
        for (const [i, j] of BOX_EDGES) view.segment(cs[i]! as Vec3, cs[j]! as Vec3, { color: col, width: 1, dash: [4, 5], alpha: 0.5 * A, layer: 'back' });
      }
      // Namen der Oktanten
      for (let k = 1; k <= 8; k++) {
        const sg = octantSigns(k);
        const c: Vec3 = [sg[0] * E * 0.62, sg[1] * E * 0.62, sg[2] * E * 0.62];
        view.label(c, ROMAN[k]!, { color: k === n ? octColor(k) : alpha(theme.muted, 0.75 * A), size: k === n ? 15 : 12, weight: '800', align: 'center', baseline: 'middle', layer: 'back' });
      }
      // Zufallspunkte: fallen kurz herein, danach farbig nach Oktant
      for (const r of rain) {
        if (r.t > now + RAIN_FALL) continue;
        const u = reduced ? 1 : clamp((now - (r.t - RAIN_FALL)) / RAIN_FALL, 0, 1);
        const k = octant(r.p);
        const q: Vec3 = [r.p[0], r.p[1], r.p[2] + (1 - ease.outCubic(u)) * 2.5];
        view.point(q, k === 0 ? { color: alpha(theme.text, A * u), radius: 3.2, hollow: true } : { color: alpha(octColor(k), A * u), radius: 3 });
      }
    }

    /* ---------------- Zeichnen: Tafel ---------------- */
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

    /** Koordinaten in Farbe: P(3 | 4 | 2). */
    function drawCoords(name: string, q: P3, x: number, y: number, size: number, hide: boolean): number {
      const g = surface.g;
      const theme = ctx.theme;
      const parts: [string, string][] = [
        [`${name}(`, theme.text],
        [hide ? '?' : n1(q[0]), C1()],
        [sep, theme.muted],
        [hide ? '?' : n1(q[1]), C2()],
        [sep, theme.muted],
        [hide ? '?' : n1(q[2]), C3()],
        [')', theme.text],
      ];
      let cx = x;
      for (const [s, c] of parts) {
        g.font = font(800, size);
        text(g, s, cx, y, { font: font(800, size), color: c, align: 'left' });
        cx += g.measureText(s).width;
      }
      return cx - x;
    }

    function drawPanel(): void {
      const { panel: R, wide } = regions();
      const g = surface.g;
      const theme = ctx.theme;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 14);
      g.clip();
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      const hide = !p.show;
      let y = R.y + 22;
      const small = R.w < 250;
      if (mode() === 'views' || mode() === 'oct') {
        if (mode() === 'views') drawViewsPanel(R, wide);
        else drawOctPanel(R, wide);
        g.restore();
        return;
      }
      const row = (label: string, value: string, color = theme.text, yy = y, x = x0, ww = w) => {
        text(g, label, x, yy, { font: font(600, small ? 11.5 : 12.5), color: theme.muted, align: 'left' });
        text(g, value, x + ww, yy, { font: font(800, small ? 11.5 : 12.5), color, align: 'right' });
      };
      if (mode() === 'point') {
        const q = target();
        text(g, tt('Punkt P', 'Point P'), x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
        y += 30;
        drawCoords('P', q, x0, y, small ? 17 : 20, hide);
        y += 30;
        const dirs = [
          [tt('vorn', 'forward'), tt('hinten', 'back')],
          [tt('rechts', 'right'), tt('links', 'left')],
          [tt('oben', 'up'), tt('unten', 'down')],
        ];
        const lineH = wide ? 22 : 19;
        for (let k = 0; k < 3; k++) {
          const v = q[k]!;
          const d = Math.abs(v) < 1e-9 ? tt('–', '–') : `${n1(Math.abs(v))} ${tt('nach', '')} ${v > 0 ? dirs[k]![0] : dirs[k]![1]}`.replace('  ', ' ');
          g.fillStyle = axisColor(k);
          roundRect(g, x0, y - 6, 4, 12, 2);
          g.fill();
          text(g, `x${'₁₂₃'[k]}`, x0 + 10, y, { font: font(750, small ? 12 : 13), color: axisColor(k), align: 'left' });
          text(g, hide ? '?' : d, x0 + w, y, { font: font(650, small ? 11.5 : 12.5), color: theme.text, align: 'right' });
          y += lineH;
        }
        y += 4;
        g.strokeStyle = alpha(theme.text, 0.08);
        g.beginPath();
        g.moveTo(x0, y - 8);
        g.lineTo(x0 + w, y - 8);
        g.stroke();
        row(tt('Lage', 'Position'), hide ? '?' : whereText(q));
        y += lineH;
        const d = distOrigin(q);
        const sq = q[0] ** 2 + q[1] ** 2 + q[2] ** 2;
        row('|OP|', hide ? '?' : `√${fmt.num(sq, 2)} ${rel2(d)} ${val2(d)}`, CP());
        y += lineH;
        if (wide && y < R.y + R.h - 70) {
          y += 6;
          const tip = walkStart >= 0 && now - walkStart < WALK_MS + 400 ? tt('Erst x₁ nach vorn, dann x₂ nach rechts, dann x₃ nach oben – so kommt man vom Ursprung zum Punkt.', 'First x₁ forward, then x₂ right, then x₃ up – that is how you get from the origin to the point.') : tt('Ziehe den Fußpunkt in der Ebene und den Punkt nach oben. Drehe die Ansicht: Erst im Raum sieht man, wo P wirklich liegt.', 'Drag the foot point in the plane and the point upwards. Rotate the view: only in space can you see where P really is.');
          drawTip({ x: x0 - 4, y, w: w + 8, h: Math.min(110, R.y + R.h - y - 10) }, tip);
        }
      } else if (mode() === 'dist') {
        const P0 = target();
        const Q0 = targetQ();
        const d = deltas(P0, Q0);
        const st = distSteps(P0, Q0);
        const s5 = pythProgress();
        text(g, tt('Abstand zweier Punkte', 'Distance between two points'), x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
        y += 26;
        drawCoords('P', P0, x0, y, small ? 13 : 15, false);
        y += 22;
        drawCoords('Q', Q0, x0, y, small ? 13 : 15, false);
        y += 26;
        const lineH = wide ? 22 : 19;
        const sq = (v: number) => (v < 0 ? `(${n1(v)})²` : `${n1(v)}²`);
        const rows: [string, string, string, number][] = [
          ['Δx₁ = q₁ − p₁', n1(d[0]), C1(), 0],
          ['Δx₂ = q₂ − p₂', n1(d[1]), C2(), 1],
          ['d₁₂ = √(Δx₁² + Δx₂²)', hide ? '?' : `${rel2(st.d12)} ${val2(st.d12)}`, CD(), 2],
          ['Δx₃ = q₃ − p₃', n1(d[2]), C3(), 3],
        ];
        for (const [lab, val, col, k] of rows) {
          g.save();
          g.globalAlpha = 0.25 + 0.75 * clamp(s5 - k, 0, 1);
          row(lab, val, col, y);
          g.restore();
          y += lineH;
        }
        g.save();
        g.globalAlpha = 0.25 + 0.75 * clamp(s5 - 4, 0, 1);
        const sumTxt = `√(${sq(d[0])} + ${sq(d[1])} + ${sq(d[2])})`;
        g.font = font(700, small ? 11 : 12);
        const fitTxt = g.measureText(`|PQ| = ${sumTxt}`).width < w ? `|PQ| = ${sumTxt}` : '|PQ| = √(Δx₁² + Δx₂² + Δx₃²)';
        text(g, fitTxt, x0, y, { font: font(700, small ? 11 : 12), color: theme.text, align: 'left' });
        y += lineH;
        text(g, hide ? '= ?' : `= √${fmt.num(st.sq, 2)} ${rel2(st.d)} ${val2(st.d)}`, x0, y, { font: font(800, small ? 15 : 17), color: CD(), align: 'left' });
        g.restore();
        y += lineH + 4;
        if (wide && y < R.y + R.h - 60) drawTip({ x: x0 - 4, y, w: w + 8, h: Math.min(84, R.y + R.h - y - 10) }, tt('Zweimal Pythagoras: erst in der waagerechten Ebene durch P, dann mit dem Höhenunterschied. Ziehe P und Q.', 'Pythagoras twice: first in the horizontal plane through P, then with the difference in height. Drag P and Q.'));
      } else if (mode() === 'find') {
        const q = target();
        const ok = matches(q, findT);
        const all = ok.every(Boolean);
        text(g, tt('Punkt finden', 'Find the point'), x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
        text(g, tt(`Treffer: ${findHits}`, `hits: ${findHits}`), x0 + w, y, { font: font(700, 12), color: theme.muted, align: 'right' });
        y += 28;
        text(g, tt('Ziehe P nach', 'Drag P to'), x0, y, { font: font(600, 12.5), color: theme.muted, align: 'left' });
        y += 26;
        drawCoords('T', findT, x0, y, small ? 18 : 21, false);
        y += 34;
        const lineH = wide ? 24 : 20;
        for (let k = 0; k < 3; k++) {
          g.fillStyle = axisColor(k);
          roundRect(g, x0, y - 6, 4, 12, 2);
          g.fill();
          text(g, `x${'₁₂₃'[k]}: ${n1(q[k]!)}`, x0 + 10, y, { font: font(750, 13), color: axisColor(k), align: 'left' });
          text(g, ok[k] ? '✓' : q[k]! < findT[k]! ? tt('zu klein', 'too small') : tt('zu groß', 'too big'), x0 + w, y, { font: font(800, 12.5), color: ok[k] ? theme.series[2]! : theme.muted, align: 'right' });
          y += lineH;
        }
        if (all) {
          const pop = reduced ? 1 : ease.outBack(clamp((now - findOk) / 400, 0, 1));
          g.save();
          g.translate(x0 + w / 2, y + 12);
          g.scale(pop, pop);
          g.fillStyle = theme.series[2]!;
          roundRect(g, -w / 2, -14, w, 28, 14);
          g.fill();
          text(g, tt('Getroffen! „Neue Aufgabe“', 'Hit! “New task”'), 0, 0.5, { font: font(800, 12.5), color: '#ffffff' });
          g.restore();
          y += 36;
        } else if (wide && y < R.y + R.h - 60) {
          drawTip({ x: x0 - 4, y: y + 4, w: w + 8, h: Math.min(84, R.y + R.h - y - 14) }, tt('Tipp: Erst den Fußpunkt in der x₁x₂-Ebene setzen, dann die Höhe. „Blick: von oben“ hilft beim Ablesen.', 'Tip: first set the foot point in the x₁x₂ plane, then the height. “View: from above” helps reading.'));
        }
      } else {
        const cs = targetCorners();
        text(g, tt('Quader ABCDEFGH', 'Cuboid ABCDEFGH'), x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
        y += 26;
        const cols = wide && R.w < 230 ? 1 : 2;
        const colW = w / cols;
        const rows = Math.ceil(8 / cols);
        const lineH = clamp((R.y + R.h - y - (wide ? 80 : 30)) / rows, 17, 24);
        cs.forEach((q, i) => {
          const c = cols === 2 ? (i < 4 ? 0 : 1) : 0;
          const r = cols === 2 ? i % 4 : i;
          const cx = x0 + c * colW;
          const cy = y + r * lineH;
          if (sel === i) {
            g.fillStyle = alpha(CP(), theme.dark ? 0.22 : 0.12);
            roundRect(g, cx - 4, cy - lineH / 2 + 1, colW - 4, lineH - 2, 6);
            g.fill();
          }
          drawCoords(CORNER_NAMES[i]!, q, cx, cy, small || cols === 2 ? 11.5 : 12.5, hide);
        });
        y += rows * lineH + 8;
        const lineH2 = 20;
        if (y + lineH2 * 2 < R.y + R.h) {
          row(tt('Volumen', 'Volume'), hide ? '?' : `${n1(p.a)} · ${n1(p.b)} · ${n1(p.c)} = ${fmt.num(boxVolume(p.a, p.b, p.c), 3)}`, theme.text, y, x0, w);
          y += lineH2;
          row('AC', hide ? '?' : `√(${n1(p.a)}² + ${n1(p.b)}²) ${rel2(faceDiagonal(p.a, p.b))} ${val2(faceDiagonal(p.a, p.b))}`, CD(), y, x0, w);
          y += lineH2;
          const sq = p.a * p.a + p.b * p.b + p.c * p.c;
          row(tt('AG (Raumdiag.)', 'AG (space diag.)'), hide ? '?' : `√${fmt.num(sq, 2)} ${rel2(spaceDiagonal(p.a, p.b, p.c))} ${val2(spaceDiagonal(p.a, p.b, p.c))}`, CD(), y, x0, w);
          y += lineH2;
        }
        if (wide && y < R.y + R.h - 60) drawTip({ x: x0 - 4, y: y + 4, w: w + 8, h: Math.min(90, R.y + R.h - y - 14) }, tt('Tippe auf eine Ecke, um ihre Koordinaten zu sehen. Ziehe A, C oder G.', 'Tap a corner to see its coordinates. Drag A, C or G.'));
      }
      g.restore();
    }

    /* ---------------- Tafel: Risse ---------------- */
    type RissKind = 'grund' | 'auf' | 'seit';
    const RISS_NAME: Record<RissKind, { de: string; en: string; mark: string; cam: number }> = {
      grund: { de: 'Grundriss (von oben)', en: 'Top view', mark: '′', cam: 1 },
      auf: { de: 'Aufriss (von vorn)', en: 'Front view', mark: '″', cam: 2 },
      seit: { de: 'Seitenriss (von der Seite)', en: 'Side view', mark: '‴', cam: 3 },
    };

    /** Ebene Lage eines Raumpunkts im jeweiligen Riss (waagerecht, senkrecht nach oben). */
    function rissXY(kind: RissKind, q: P3): [number, number] {
      if (kind === 'grund') return [q[1], -q[0]];
      if (kind === 'auf') return [q[1], q[2]];
      return [-q[0], q[2]];
    }

    /** Ein Riss als kleines Koordinatensystem; liefert die Abbildung auf Pixel. */
    function miniView(r: Rect, kind: RissKind, E: number, compact: boolean): (q: P3) => [number, number] {
      const g = surface.g;
      const theme = ctx.theme;
      const k = (Math.min(r.w, r.h - 16) - 12) / (2 * E);
      const cx = r.x + r.w / 2;
      const cy = r.y + 16 + (r.h - 16) / 2;
      const map = (q: P3): [number, number] => {
        const [h, v] = rissXY(kind, q);
        return [cx + h * k, cy - v * k];
      };
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 9);
      g.fillStyle = alpha(theme.text, theme.dark ? 0.05 : 0.03);
      g.fill();
      const camOn = camIndex === RISS_NAME[kind].cam;
      if (camOn) {
        g.strokeStyle = alpha(CP(), 0.7);
        g.lineWidth = 1.5;
        g.stroke();
      }
      const nm = lang === 'de' ? RISS_NAME[kind].de : RISS_NAME[kind].en;
      text(g, compact ? nm.split(' (')[0]! : nm, r.x + 7, r.y + 10, { font: font(750, compact ? 10 : 11), color: theme.muted, align: 'left' });
      g.beginPath();
      g.rect(r.x, r.y + 16, r.w, r.h - 16);
      g.clip();
      // Raster
      g.strokeStyle = alpha(theme.text, 0.06);
      g.lineWidth = 1;
      for (let i = -Math.floor(E); i <= Math.floor(E); i++) {
        g.beginPath();
        g.moveTo(cx + i * k, r.y + 16);
        g.lineTo(cx + i * k, r.y + r.h);
        g.moveTo(r.x, cy + i * k);
        g.lineTo(r.x + r.w, cy + i * k);
        g.stroke();
      }
      // Achsen in ihren Farben, Punkt am positiven Ende
      const ax = (dirH: number, dirV: number, col: string, name: string) => {
        g.strokeStyle = col;
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(cx - dirH * E * k, cy + dirV * E * k);
        g.lineTo(cx + dirH * E * k, cy - dirV * E * k);
        g.stroke();
        const ex = cx + dirH * (E - 0.2) * k;
        const ey = cy - dirV * (E - 0.2) * k;
        g.fillStyle = col;
        g.beginPath();
        g.arc(ex, ey, 2.5, 0, Math.PI * 2);
        g.fill();
        text(g, name, ex + (dirH !== 0 ? -dirH * 4 : 9), ey + (dirV !== 0 ? dirV * 9 : -8), { font: `italic 700 11px ${theme.mathFont}`, color: col, align: dirH > 0 ? 'right' : dirH < 0 ? 'left' : 'left' });
      };
      if (kind === 'grund') {
        ax(1, 0, C2(), 'x₂');
        ax(0, -1, C1(), 'x₁');
      } else if (kind === 'auf') {
        ax(1, 0, C2(), 'x₂');
        ax(0, 1, C3(), 'x₃');
      } else {
        ax(-1, 0, C1(), 'x₁');
        ax(0, 1, C3(), 'x₃');
      }
      // Körper
      const fa = figA.at(now) * viewsA.at(now);
      if (fa > 0.01) {
        const f = FIGURES[shownFig];
        g.strokeStyle = alpha(CB(), fa);
        g.lineWidth = 1.8;
        for (const [i, j] of f.edges) {
          const [x1, y1] = map(f.points[i]!);
          const [x2, y2] = map(f.points[j]!);
          g.beginPath();
          g.moveTo(x1, y1);
          g.lineTo(x2, y2);
          g.stroke();
        }
      }
      g.restore();
      return map;
    }

    function drawViewsPanel(R: Rect, wide: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = 12;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      // Ausschnitt der Risse: eng um P, Körper und Rätselpunkt
      const content: P3[] = [target(), [2, 2, 2]];
      if (p.fig !== 'none') content.push(...FIGURES[shownFig].points);
      if (p.quiz) content.push(riddleT);
      const E = clamp(Math.ceil(Math.max(...content.flat().map(Math.abs))) + 0.8, 3, 5);
      const q = target();
      const quiz = quizA.at(now) > 0.5;
      text(g, tt('Drei Risse', 'Three views'), x0, R.y + 20, { font: font(800, 14), color: theme.text, align: 'left' });
      if (quiz) text(g, tt(`Gelöst: ${riddleHits}`, `solved: ${riddleHits}`), x0 + w, R.y + 20, { font: font(700, 12), color: theme.muted, align: 'right' });
      miniRects = [];
      const kinds: RissKind[] = ['auf', 'seit', 'grund'];
      let rects: Rect[];
      if (wide) {
        const s = Math.max(80, Math.min((w - 8) / 2, (R.h - 40 - 8) / 2));
        const y0 = R.y + 36;
        rects = [
          { x: x0, y: y0, w: s, h: s },
          { x: x0 + s + 8, y: y0, w: s, h: s },
          { x: x0, y: y0 + s + 8, w: s, h: s },
        ];
      } else {
        const s = Math.max(70, Math.min((w - 16) / 3, R.h - 70));
        const y0 = R.y + 34;
        rects = [0, 1, 2].map((i) => ({ x: x0 + i * (s + 8), y: y0, w: s, h: s }));
      }
      const maps = kinds.map((kd, i) => {
        miniRects.push({ r: rects[i]!, kind: kd });
        return miniView(rects[i]!, kd, E, !wide || rects[i]!.w < 150);
      });
      // Ordnungslinien zwischen Aufriss und Grundriss (gleiches x₂) bzw. Aufriss und Seitenriss (gleiches x₃)
      const [mAuf, mSeit, mGrund] = maps as [(q: P3) => [number, number], (q: P3) => [number, number], (q: P3) => [number, number]];
      const pA = mAuf(q);
      const pS = mSeit(q);
      const pG = mGrund(q);
      if (wide) {
        g.save();
        g.strokeStyle = alpha(CP(), 0.55);
        g.lineWidth = 1.2;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(pA[0], pA[1]);
        g.lineTo(pG[0], pG[1]);
        g.moveTo(pA[0], pA[1]);
        g.lineTo(pS[0], pS[1]);
        g.stroke();
        g.restore();
      }
      const inside = (r: Rect, pt: [number, number]) => pt[0] > r.x && pt[0] < r.x + r.w && pt[1] > r.y + 16 && pt[1] < r.y + r.h;
      const mark = (pt: [number, number], r: Rect, nm: string, col: string, cross: boolean, a = 1) => {
        if (!inside(r, pt)) return;
        g.save();
        g.globalAlpha *= a;
        if (cross) {
          g.strokeStyle = col;
          g.lineWidth = 2.4;
          g.beginPath();
          g.moveTo(pt[0] - 5, pt[1] - 5);
          g.lineTo(pt[0] + 5, pt[1] + 5);
          g.moveTo(pt[0] + 5, pt[1] - 5);
          g.lineTo(pt[0] - 5, pt[1] + 5);
          g.stroke();
        } else {
          g.fillStyle = col;
          g.beginPath();
          g.arc(pt[0], pt[1], 4.5, 0, Math.PI * 2);
          g.fill();
        }
        const right = pt[0] > r.x + r.w - 34;
        text(g, nm, pt[0] + (right ? -7 : 7), pt[1] - 8, { font: font(800, 11), color: col, align: right ? 'right' : 'left' });
        g.restore();
      };
      const qa = quizA.at(now);
      const solved = rissMatch(q, riddleT);
      kinds.forEach((kd, i) => {
        const r = rects[i]!;
        if (qa > 0.01) mark(maps[i]!(riddleT), r, `T${RISS_NAME[kd].mark}`, solved[kd] ? theme.series[2]! : theme.series[1]!, true, qa);
        mark(maps[i]!(q), r, `P${RISS_NAME[kd].mark}`, CP(), false);
      });
      // Viertes Feld (breit) bzw. Zeile darunter: Koordinaten in den Rissen
      const rs = risse(q);
      const pair = (a: readonly [number, number], na: string, nb: string) => `(${na} ${n1(a[0])}${sep}${nb} ${n1(a[1])})`;
      if (wide) {
        const r3 = rects[2]!;
        const bx = r3.x + r3.w + 8;
        const bw = x0 + w - bx;
        let y = r3.y + 12;
        const line = (s1: string, col: string, size = 11.5, weight = 700) => {
          g.font = font(weight, size);
          let sz = size;
          while (sz > 9 && g.measureText(s1).width > bw) {
            sz -= 0.5;
            g.font = font(weight, sz);
          }
          text(g, s1, bx, y, { font: font(weight, sz), color: col, align: 'left' });
          y += sz + 7;
        };
        if (quiz) {
          line(tt('Gesucht: T', 'Wanted: T'), theme.text, 12.5, 800);
          line(tt('Ziehe P, bis alle drei Risse passen.', 'Drag P until all three views match.'), theme.muted, 10.5, 600);
          for (const kd of ['grund', 'auf', 'seit'] as RissKind[]) line(`${solved[kd] ? '✓' : '·'} ${lang === 'de' ? RISS_NAME[kd].de.split(' (')[0] : RISS_NAME[kd].en}`, solved[kd] ? theme.series[2]! : theme.muted, 11.5, 750);
          if (solved.grund && solved.auf && solved.seit) line(tt('Getroffen!', 'Hit!'), theme.series[2]!, 13, 800);
        } else {
          drawCoords('P', q, bx, y + 2, 13, false);
          y += 24;
          line(`P′ ${pair(rs.grund, 'x₁', 'x₂')}`, theme.text, 11, 650);
          line(`P″ ${pair(rs.auf, 'x₂', 'x₃')}`, theme.text, 11, 650);
          line(`P‴ ${pair(rs.seit, 'x₁', 'x₃')}`, theme.text, 11, 650);
        }
        const ty = r3.y + r3.h + 10;
        if (ty < R.y + R.h - 50) {
          const msg = quiz
            ? tt('Von T kennst du nur die drei Risse (Kreuze). Lies x₁ und x₂ im Grundriss ab, x₃ im Aufriss – oder ziehe P, bis alle Kreuze grün werden. Passt das x₂ in Grund- und Aufriss nicht zusammen, gibt es keinen solchen Punkt.', 'You only know the three views of T (crosses). Read x₁ and x₂ in the top view and x₃ in the front view – or drag P until all crosses turn green. If x₂ differs between top and front view, no such point exists.')
            : tt('Je zwei Risse teilen eine Koordinate: Aufriss und Grundriss das x₂, Aufriss und Seitenriss das x₃ (gestrichelte Ordnungslinien). Zwei Risse genügen, um den Punkt zu bestimmen. Tippe auf einen Riss: Die Kamera schaut aus dieser Richtung.', 'Any two views share one coordinate: front and top view share x₂, front and side view share x₃ (dashed reference lines). Two views are enough to determine the point. Tap a view: the camera looks from that direction.');
          drawTip({ x: x0 - 4, y: ty, w: w + 8, h: Math.min(110, R.y + R.h - ty - 10) }, msg);
        }
      } else {
        const y = rects[0]!.y + rects[0]!.h + 16;
        const two = (a: readonly [number, number]) => `(${n1(a[0])}${sep}${n1(a[1])})`;
        const s1 = quiz
          ? `${tt('Rätsel', 'Riddle')}: ${(['grund', 'auf', 'seit'] as RissKind[]).map((kd) => `T${RISS_NAME[kd].mark} ${solved[kd] ? '✓' : '✗'}`).join('   ')}`
          : `P′${two(rs.grund)}   P″${two(rs.auf)}   P‴${two(rs.seit)}`;
        text(g, s1, x0, y, { font: font(700, 11.5), color: theme.text, align: 'left' });
      }
    }

    /* ---------------- Tafel: Oktanten ---------------- */
    function landed(): P3[] {
      return rain.filter((r) => r.t <= now).map((r) => r.p);
    }

    function drawOctPanel(R: Rect, wide: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = 12;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      const q = target();
      // Aufgabenmodus (show = 0): Oktant und Vorzeichen verdeckt, keine Zelle hervorgehoben
      const hide = !p.show;
      const n = hide ? 0 : octant(q);
      const where = hide ? tt('P liegt im Oktanten ?', 'P is in octant ?') : n > 0 ? tt(`P liegt im Oktanten ${ROMAN[n]}`, `P is in octant ${ROMAN[n]}`) : tt('P liegt in keinem Oktanten', 'P is in no octant');
      text(g, tt('Oktanten', 'Octants'), x0, R.y + 20, { font: font(800, 14), color: theme.text, align: 'left' });
      text(g, where, x0 + w, R.y + 20, { font: font(800, 12), color: hide ? theme.muted : n > 0 ? octColor(n) : theme.series[1]!, align: 'right' });
      const pts = landed();
      const counts = octantCounts(pts);
      const N = pts.length;
      const cellW = (w - 3 * 6) / 4;
      const cellH = wide ? 64 : 46;
      const y0 = R.y + 34;
      octCells = [];
      const maxC = Math.max(1, ...counts.slice(1));
      for (let k = 1; k <= 8; k++) {
        const col = (k - 1) % 4;
        const row = k <= 4 ? 0 : 1;
        const r: Rect = { x: x0 + col * (cellW + 6), y: y0 + row * (cellH + 6), w: cellW, h: cellH };
        octCells.push({ r, n: k });
        const c = octColor(k);
        g.save();
        roundRect(g, r.x, r.y, r.w, r.h, 8);
        g.fillStyle = alpha(c, k === n ? (theme.dark ? 0.3 : 0.2) : theme.dark ? 0.1 : 0.07);
        g.fill();
        if (k === n) {
          g.strokeStyle = c;
          g.lineWidth = 2;
          g.stroke();
        }
        const sg = octantSigns(k).map((v) => (v > 0 ? '+' : '−')).join(' ');
        const twoLine = wide && r.w < 84;
        text(g, ROMAN[k]!, r.x + 7, r.y + 12, { font: font(800, 12.5), color: c, align: 'left' });
        if (twoLine) text(g, sg, r.x + 7, r.y + 26, { font: font(800, 10.5), color: theme.muted, align: 'left' });
        else text(g, sg, r.x + r.w - 6, r.y + 12, { font: font(800, 10.5), color: theme.muted, align: 'right' });
        if (N > 0) {
          const cnt = counts[k]!;
          const yy = r.y + (twoLine ? 43 : wide ? 32 : 27);
          text(g, `${cnt}`, r.x + 7, yy, { font: font(800, wide ? 14 : 12), color: theme.text, align: 'left' });
          if (r.w >= 62) text(g, `${fmt.num((100 * cnt) / N, 0)}%`, r.x + r.w - 6, yy, { font: font(650, 10), color: theme.muted, align: 'right' });
          const bw = (r.w - 14) * (cnt / maxC);
          roundRect(g, r.x + 7, r.y + r.h - 11, Math.max(2, bw), 5, 2.5);
          g.fillStyle = c;
          g.fill();
        } else if (wide) text(g, tt('antippen', 'tap'), r.x + 7, r.y + (twoLine ? 44 : 34), { font: font(550, 10), color: alpha(theme.muted, 0.8), align: 'left' });
        g.restore();
      }
      let y = y0 + 2 * (cellH + 6) + 12;
      const row = (label: string, value: string, color = theme.text) => {
        if (y > R.y + R.h - 8) return;
        text(g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
        text(g, value, x0 + w, y, { font: font(800, 12), color, align: 'right' });
        y += 19;
      };
      row(tt('Vorzeichen von P', 'Signs of P'), q.map((v) => (hide ? '?' : Math.abs(v) < 1e-9 ? '0' : v > 0 ? '+' : '−')).join(lang === 'de' ? ' | ' : ', '), hide ? theme.muted : n > 0 ? octColor(n) : theme.series[1]!);
      if (N > 0) {
        row(tt('Zufallspunkte', 'Random points'), `${N}`);
        row(tt('davon auf einer Ebene', 'of which on a plane'), `${counts[0]} (${fmt.num((100 * counts[0]!) / N, 1)} %)`);
        row(tt('erwartet je Oktant', 'expected per octant'), `≈ ${fmt.num((N * pInsideOctant()) / 8, 1)}`);
      }
      if (wide && y < R.y + R.h - 50) {
        const tip = N > 0 ? tt('Die Punkte liegen auf dem Halbschritt-Gitter von −4 bis 4. Jede Koordinate ist mit Wahrscheinlichkeit 1/17 gleich 0 – solche Punkte liegen auf einer Ebene.', 'The points lie on the half-step grid from −4 to 4. Each coordinate is 0 with probability 1/17 – such points lie on a plane.') : tt('Tippe einen Oktanten an: P springt hinein. Mit „50 Zufallspunkte“ siehst du, wie sich Punkte auf die Oktanten verteilen.', 'Tap an octant: P jumps into it. With “50 random points” you see how points spread over the octants.');
        drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(96, R.y + R.h - y - 10) }, tip);
      }
    }

    surface.addTarget({
      contains: (px, py) => (mode() === 'views' && miniRects.some((m) => inR(m.r, px, py))) || (mode() === 'oct' && octCells.some((c) => inR(c.r, px, py))),
      pointerDown: (pt) => {
        if (mode() === 'views') {
          const m = miniRects.find((mm) => inR(mm.r, pt.px, pt.py));
          if (!m) return false;
          camIndex = RISS_NAME[m.kind].cam;
          const v = VIEWS[camIndex]!;
          view.animateTo({ azimuth: v.az, elevation: v.el, zoom: 1 }, reduced ? 1 : 900);
          updateReadouts();
          ctx.requestRender();
          return true;
        }
        if (mode() === 'oct') {
          const c = octCells.find((cc) => inR(cc.r, pt.px, pt.py));
          if (!c) return false;
          if (!ctx.locked) {
            const t = intoOctant(target(), c.n);
            octFlash = performance.now();
            ctx.set({ x: clamp(t[0], -4, 4), y: clamp(t[1], -4, 4), z: clamp(t[2], -4, 4) });
          }
          return true;
        }
        return false;
      },
      pointerMove: () => undefined,
      pointerUp: () => undefined,
      hover: (pt) => surface.setCursor(pt ? 'pointer' : ''),
      wheel: () => false,
    });

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
      const words = msg.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const wd of words) {
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
    function updateReadouts(): void {
      ctx.readout('count', null);
      if (mode() === 'views' || mode() === 'oct') {
        const q = target();
        ctx.readout('coord', `P${coordText(q)}`);
        ctx.readout('dist', null);
        ctx.readout('corners', null);
        if (mode() === 'views') {
          const rs = risse(q);
          const two = (a: readonly [number, number]) => `(${n1(a[0])}${sep}${n1(a[1])})`;
          ctx.readout('lage', `P′${two(rs.grund)} · P″${two(rs.auf)} · P‴${two(rs.seit)}`);
          ctx.readout('size', null);
        } else {
          const n = octant(q);
          ctx.readout('lage', n > 0 ? tt(`Oktant ${ROMAN[n]}`, `octant ${ROMAN[n]}`) : `${whereText(q)} – ${tt('kein Oktant', 'no octant')}`);
          // Endstand (in der Tafel zählen die Punkte beim Landen mit)
          const pts = rain.map((r) => r.p);
          const c = octantCounts(pts);
          ctx.readout('size', null);
          ctx.readout('count', pts.length ? `${pts.length}: ${c.slice(1).map((v, i) => `${ROMAN[i + 1]} ${v}`).join(', ')}; ${tt('auf Ebenen', 'on planes')} ${c[0]}` : null);
        }
      } else if (mode() === 'dist') {
        const st = distSteps(target(), targetQ());
        ctx.readout('coord', `P${coordText(target())} · Q${coordText(targetQ())}`);
        ctx.readout('lage', null);
        ctx.readout('dist', `|PQ| = √${fmt.num(st.sq, 2)} ${rel2(st.d)} ${val2(st.d)}`);
        ctx.readout('corners', null);
        ctx.readout('size', null);
      } else if (mode() === 'point' || mode() === 'find') {
        const q = target();
        const sq = q[0] ** 2 + q[1] ** 2 + q[2] ** 2;
        ctx.readout('coord', `P${coordText(q)}`);
        ctx.readout('lage', whereText(q));
        ctx.readout('dist', { html: `|OP| = √(${n1(q[0])}² + ${n1(q[1])}² + ${n1(q[2])}²) = √${fmt.num(sq, 2)} ${rel2(distOrigin(q))} ${val2(distOrigin(q))}`.replace(/\((-[\d,.]+)\)²/g, '($1)²').replace(/ (−[\d,.]+)²/g, ' ($1)²') });
        ctx.readout('corners', null);
        ctx.readout('size', null);
      } else {
        const cs = targetCorners();
        ctx.readout('coord', sel !== null ? `${CORNER_NAMES[sel]}${coordText(cs[sel]!)}` : null);
        ctx.readout('lage', sel !== null ? whereText(cs[sel]!) : null);
        ctx.readout('dist', null);
        ctx.readout('corners', { html: cs.map((q, i) => `${CORNER_NAMES[i]}${coordText(q)}`).join('<br>') });
        ctx.readout('size', `V = ${n1(p.a)} · ${n1(p.b)} · ${n1(p.c)} = ${fmt.num(boxVolume(p.a, p.b, p.c), 3)} · d = √(${n1(p.a)}² + ${n1(p.b)}² + ${n1(p.c)}²) = √${fmt.num(p.a * p.a + p.b * p.b + p.c * p.c, 2)} ${rel2(spaceDiagonal(p.a, p.b, p.c))} ${val2(spaceDiagonal(p.a, p.b, p.c))}`);
      }
      ctx.setAction('rand', { label: mode() === 'box' ? tt('Neuer Quader', 'New cuboid') : tt('Neuer Punkt', 'New point') });
      ctx.setAction('cam', { label: `${tt('Blick', 'View')}: ${VIEWS[(camIndex + 1) % VIEWS.length]!.name[lang]}` });
    }

    /** Neue Aufgabe „Punkt finden“: ganzzahlige Zielkoordinaten, nicht gleich P. */
    function newTask(): void {
      for (let k = 0; k < 20; k++) {
        findSeed++;
        const q = randomPoint(findSeed, 3);
        if (!matches(q, target()).every(Boolean)) {
          findT = q;
          break;
        }
      }
    }
    if (mode() === 'find') newTask();

    /** Neues Rätsel: ganzzahliger Punkt, von dem nur die Risse gezeigt werden. */
    function newRiddle(): void {
      for (let k = 0; k < 20; k++) {
        riddleSeed++;
        const q = randomPoint(riddleSeed, 3);
        const m = rissMatch(q, target());
        if (!(m.grund || m.auf || m.seit)) {
          riddleT = q;
          break;
        }
      }
    }
    if (mode() === 'views' && p.quiz) newRiddle();

    retarget(true);
    updateReadouts();
    let seed = 1;

    return {
      update(changed, source) {
        now = performance.now();
        if (source === 'input' && changed.has('mode')) {
          sel = null;
          if (p.mode === 'box') ctx.set({ x: 0, y: 0, z: 0 });
          else if (p.mode === 'dist') ctx.set({ x: 1, y: 2, z: 2, qx: 0, qy: 0, qz: 0 });
          else if (p.mode === 'find') ctx.set({ x: 1, y: 1, z: 1 });
          else ctx.set({ x: 3, y: 4, z: 2 });
        }
        if (changed.has('mode') && mode() === 'find' && source !== 'init') newTask();
        if (mode() === 'views' && p.quiz && source !== 'init' && (changed.has('quiz') || changed.has('mode'))) {
          newRiddle();
          if (source === 'input') ctx.set({ x: 0, y: 0, z: 0 });
        }
        if (changed.has('mode') && source !== 'init' && mode() !== 'views' && camIndex !== 0) {
          camIndex = 0;
          view.animateTo({ azimuth: VIEWS[0]!.az, elevation: VIEWS[0]!.el }, reduced ? 1 : 900);
        }
        // Rätsel gelöst?
        if (mode() === 'views' && p.quiz && source !== 'init') {
          const m = rissMatch(target(), riddleT);
          if (m.grund && m.auf && m.seit && riddleOk < now - 2000) {
            riddleHits++;
            riddleOk = now;
          }
        }
        if ((changed.has('mode') || source === 'replace') && (mode() === 'dist' || mode() === 'box') && source !== 'init') pythStart = reduced ? -1 : now + 300;
        // Punkt finden: Treffer erkennen
        if (mode() === 'find' && matches(target(), findT).every(Boolean) && findOk < now - 2000 && source !== 'init') {
          findHits++;
          findOk = now;
        }
        if (changed.has('mode')) sel = null;
        retarget(source === 'init');
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'cam') {
          camIndex = (camIndex + 1) % VIEWS.length;
          const v = VIEWS[camIndex]!;
          view.animateTo({ azimuth: v.az, elevation: v.el, zoom: 1 }, 900);
          updateReadouts();
        } else if (ctx.locked) return;
        else if (id === 'walk') {
          walkStart = reduced ? now - WALK_MS - 1000 : now;
        } else if (id === 'pyth') {
          pythStart = reduced ? -1 : now;
        } else if (id === 'riddle') {
          newRiddle();
          riddleOk = -1e9;
          retarget();
          updateReadouts();
        } else if (id === 'rain') {
          const t0 = Math.max(now, rain.length ? rain[rain.length - 1]!.t : now);
          const step = reduced ? 0 : 22;
          for (let i = 0; i < 50; i++) rain.push({ p: gridRandom(rainU), t: t0 + i * step });
          if (rain.length > 2000) rain = rain.slice(rain.length - 2000);
          updateReadouts();
        } else if (id === 'oclear') {
          rain = [];
          updateReadouts();
        } else if (id === 'task') {
          newTask();
          findOk = -1e9;
          retarget();
          updateReadouts();
        } else if (id === 'rand') {
          seed++;
          const q = randomPoint(seed + Math.floor(Math.random() * 1000));
          if (mode() === 'box') {
            const d = randomPoint(seed + 7, 2).map((v) => clamp(Math.abs(v) + 1, 1, 4));
            ctx.set({ x: clamp(q[0], -3, 2), y: clamp(q[1], -3, 2), z: clamp(q[2], -1, 2), a: d[0]!, b: d[1]!, c: d[2]! });
          } else ctx.set({ x: q[0], y: q[1], z: q[2] });
          sel = null;
        }
        ctx.requestRender();
      },
      resetView: () => {
        camIndex = 0;
        view.resetView(true);
        updateReadouts();
      },
      render() {
        now = performance.now();
        surface.begin();
        view.resize();
        drawScene();
        drawPanel();
        const busy =
          [gx, gy, gz, ga, gb, gc, lo, hi, projA, linesA, showA, boxA, gqx, gqy, gqz, diagA, mirA, distA, ...Object.values(planeA)].some((x) => x.busy(now)) ||
          (walkStart >= 0 && now - walkStart < WALK_MS + 500) ||
          (pythStart >= 0 && now - pythStart < PYTH_MS + 300) ||
          now - findOk < 1700 ||
          now - riddleOk < 1700 ||
          now - octFlash < 800 ||
          (rain.length > 0 && now < rain[rain.length - 1]!.t + RAIN_FALL + 50) ||
          [figA, viewsA, octA, quizA].some((x) => x.busy(now)) ||
          (!reduced && now - introStart < 1400);
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
