import { defineSimulation, ease, lightIntensity, mesh3d, meshTopology, mixColor, prefersReducedMotion, roundRect, Surface, Tween, vec3, View3D, type Mesh3D, type Rect, type Vec3 } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  bowlVessel,
  capacityAt,
  clipBelow,
  cone,
  emptyTilt,
  invertedPyramidVessel,
  levelForVolume,
  polygonPoints,
  poseVertices,
  pyramid,
  solidOf,
  sphere,
  unrollCone,
  type ConeData,
  type Pt,
  type PyramidData,
  type SphereData,
  type Vessel,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Zeitplan einer Umschüttung in Sekunden: gleichmäßig ausgießen (der
 * Kippwinkel folgt dem Fassungsvermögen), ganz leeren, halten, zurückkippen,
 * nachfüllen.
 */
const T_POUR = 2.6;
const T_OVER = 0.35;
const T_HOLD = 0.3;
const T_BACK = 0.85;
const T_FILL = 1.2;
const T_BACK_START = T_POUR + T_OVER + T_HOLD;
const T_FILL_START = T_BACK_START + T_BACK;
/** Anteil des Reglers „Abwickeln“ beim Kegel, in dem er zur Seite rückt (danach rollt der Mantel auf). */
const CONE_SHIFT = 0.22;

type Mode = 'masse' | 'volumen' | 'oberflaeche';
type Body = 'pyramide' | 'kegel' | 'kugel';

/** Ein Gefäß im Umschüttversuch. */
interface Slot {
  vessel: Vessel;
  offset: Vec3;
  dir: 1 | -1;
  tiltMax: number;
  /** Exakter Inhalt (⅓ · G · h bzw. ⅔ · πr³), auf den das Wasser des Vielflachs umgerechnet wird. */
  exact: number;
  /** Schüttungen (1, 2, …), bei denen dieses Gefäß ausgeleert wird. */
  steps: number[];
  /** Eckpunkte in Ruhelage. */
  rest: Vec3[];
  kind: 'pyramid' | 'cone' | 'bowl';
  /** Kippwinkel, ab dem das Gefäß leer ist, und Tabelle Kippwinkel → Fassungsvermögen. */
  tiltEmpty: number;
  table: { tilt: number[]; cap: number[] };
}

interface PourScene {
  recvBase: Pt[];
  recvH: number;
  /** Exakte Grundfläche des Auffanggefäßes. */
  recvG: number;
  recvWalls: Mesh3D;
  /** Flächen eines Prismas über recvBase (für den Wasserkörper, Topologie bleibt zwischengespeichert). */
  waterFaces: readonly (readonly number[])[];
  slots: Slot[];
  total: number;
  /** Exaktes Wasservolumen im Auffanggefäß nach k Schüttungen. */
  levels: number[];
  marks: { z: number; label: string }[];
  /** Umgebender Quader aller Lagen (für den Bildausschnitt). */
  bbox: { lo: Vec3; hi: Vec3 };
}

interface PourAnim {
  step: number;
  slot: number;
  t0: number;
  /** Wasser im Vielflach-Gefäß. */
  vW: number;
  /** Bereits ausgegossener Anteil (0 … 1). */
  poured: number;
  /** Gezeigtes Wasservolumen im Auffanggefäß (exakt normiert, läuft etwas nach). */
  recv: number;
  flow: number;
  last: number;
  refill: boolean;
  duration: number;
}

interface CardLine {
  f: string;
  swatch?: string;
  bold?: boolean;
  muted?: boolean;
}

/**
 * Pyramide, Kegel und Kugel: Maße mit rechtwinkligen Hilfsdreiecken
 * (Pythagoras), Umschüttversuch (Pyramide/Kegel füllen ⅓ des Prismas/Zylinders,
 * Archimedes: Kegel + Halbkugel = Zylinder) und Oberfläche über das Netz
 * (Kegelmantel als Kreissektor) bzw. die Kugel aus vielen Pyramiden.
 */
export default defineSimulation({
  id: 'pyramide-kegel-kugel',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.8 },
  groups: [
    { id: 'size', label: L('Maße in cm', 'Dimensions in cm') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'body',
      type: 'choice',
      label: L('Körper', 'Solid'),
      options: [
        { value: 'pyramide', label: L('Pyramide', 'Pyramid') },
        { value: 'kegel', label: L('Kegel', 'Cone') },
        { value: 'kugel', label: L('Kugel', 'Sphere') },
      ],
      default: 'pyramide',
    },
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'masse', label: L('Maße (Pythagoras)', 'Lengths (Pythagoras)') },
        { value: 'volumen', label: L('Volumen: umschütten', 'Volume: pouring') },
        { value: 'oberflaeche', label: L('Oberfläche: Netz', 'Surface: net') },
      ],
      default: 'masse',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Ecken der Grundfläche n', 'Vertices of the base n'),
      help: L('Regelmäßiges n-Eck; n = 4 ergibt die quadratische Pyramide.', 'Regular n-gon; n = 4 gives the square pyramid.'),
      min: 3,
      max: 8,
      step: 1,
      default: 4,
      visibleIf: (v) => v.body === 'pyramide',
    },
    { key: 'a', type: 'number', group: 'size', label: L('Grundkante a', 'Base edge a'), min: 1, max: 8, step: 0.5, default: 6, unit: 'cm', visibleIf: (v) => v.body === 'pyramide' },
    { key: 'r', type: 'number', group: 'size', label: L('Radius r', 'Radius r'), min: 1, max: 5, step: 0.5, default: 3, unit: 'cm', visibleIf: (v) => v.body !== 'pyramide' },
    { key: 'h', type: 'number', group: 'size', label: L('Höhe h', 'Height h'), min: 1, max: 10, step: 0.5, default: 4, unit: 'cm', visibleIf: (v) => v.body !== 'kugel' },
    {
      key: 'tri',
      type: 'choice',
      label: L('Hilfsdreieck', 'Helper triangle'),
      options: [
        { value: 'ha', label: L('Seitenhöhe', 'Slant height') },
        { value: 's', label: L('Seitenkante', 'Lateral edge') },
        { value: 'face', label: L('Seitenfläche', 'Lateral face') },
      ],
      default: 'ha',
      visibleIf: (v) => v.body === 'pyramide' && v.mode === 'masse',
    },
    {
      key: 'pour',
      type: 'number',
      label: L('Umgeschüttet', 'Poured'),
      help: L('Wie oft die Pyramide bzw. der Kegel schon ausgeleert wurde.', 'How many times the pyramid or cone has been emptied.'),
      min: 0,
      max: 3,
      step: 1,
      default: 0,
      display: (v, lang) => (lang === 'de' ? `${v}-mal` : v === 1 ? 'once' : `${v} times`),
      visibleIf: (v) => v.mode === 'volumen' && v.body !== 'kugel',
    },
    {
      key: 'arch',
      type: 'number',
      label: L('Umgeschüttet', 'Poured'),
      help: L('1: der Kegel, 2: dazu die Halbkugel', '1: the cone, 2: then the hemisphere'),
      min: 0,
      max: 2,
      step: 1,
      default: 0,
      display: (v, lang) => (lang === 'de' ? ['nichts', 'Kegel', 'Kegel + Halbkugel'][v] ?? '' : ['nothing', 'cone', 'cone + hemisphere'][v] ?? ''),
      visibleIf: (v) => v.mode === 'volumen' && v.body === 'kugel',
    },
    { key: 'open', type: 'number', label: L('Abwickeln', 'Unfold'), min: 0, max: 100, step: 1, default: 0, unit: '%', visibleIf: (v) => v.mode === 'oberflaeche' && v.body !== 'kugel' },
    { key: 'split', type: 'number', label: L('In Pyramiden zerlegen', 'Split into pyramids'), min: 0, max: 100, step: 1, default: 0, unit: '%', visibleIf: (v) => v.mode === 'oberflaeche' && v.body === 'kugel' },
    { key: 'cyl', type: 'boolean', group: 'view', label: L('Zylinder drumherum', 'Cylinder around it'), default: false, visibleIf: (v) => v.mode === 'masse' && v.body === 'kugel' },
    { key: 'calc', type: 'boolean', group: 'view', label: L('Rechnung im Bild', 'Calculation in the picture'), default: true },
  ],
  actions: [
    { id: 'pour', label: L('Umschütten', 'Pour'), primary: true, visibleIf: (v) => v.mode === 'volumen' },
    { id: 'unfold', label: L('Abwickeln', 'Unfold'), primary: true, visibleIf: (v) => v.mode === 'oberflaeche' },
  ],
  readouts: [
    { key: 'G', label: L('Grundfläche', 'Base area'), spoiler: true },
    { key: 'side', label: L('Strecken', 'Lengths'), spoiler: true },
    { key: 'V', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'M', label: L('Mantelfläche', 'Lateral surface'), spoiler: true },
    { key: 'O', label: L('Oberfläche', 'Surface area'), spoiler: true },
    { key: 'cmp', label: L('Vergleich', 'Comparison'), spoiler: true },
  ],
  resultsParam: 'calc',
  presets: [
    { id: 'start', label: L('Quadratische Pyramide', 'Square pyramid'), values: {} },
    { id: 'cone', label: L('Kegel r = 3, h = 4', 'Cone r = 3, h = 4'), values: { body: 'kegel' } },
    { id: 'pour', label: L('Pyramide umschütten', 'Pour a pyramid'), values: { mode: 'volumen', a: 4, h: 5 } },
    { id: 'archimedes', label: L('Kugel nach Archimedes', 'Sphere after Archimedes'), values: { body: 'kugel', mode: 'volumen', r: 2.5 } },
    { id: 'sector', label: L('Kegelmantel abwickeln', 'Unroll a cone'), values: { body: 'kegel', mode: 'oberflaeche', open: 100 } },
    { id: 'split', label: L('Kugel aus Pyramiden', 'Sphere made of pyramids'), values: { body: 'kugel', mode: 'oberflaeche', r: 2, split: 70 } },
  ],
  strings: {
    de: {
      canvas: 'Drehbare 3D-Ansicht von Pyramide, Kegel oder Kugel: Hilfsdreiecke mit dem Satz des Pythagoras, Umschüttversuch mit Wasser, Netz bzw. Kugel aus Pyramiden',
      pyr3: 'Dreieckspyramide',
      pyr4: 'Quadratische Pyramide',
      pyr5: 'Fünfeckspyramide',
      pyr6: 'Sechseckspyramide',
      pyr7: 'Siebeneckspyramide',
      pyr8: 'Achteckspyramide',
      kegel: 'Kegel',
      kugel: 'Kugel',
      triHa: 'Seitenhöhe h_a',
      triS: 'Seitenkante s',
      triFace: 'Seitenkante s über h_a',
      triCone: 'Mantellinie s',
      sphereTitle: 'Kugel mit Radius r',
      truth: 'Hilfsdreieck in wahrer Größe',
      inradius: 'ρ: Inkreisradius des n-Ecks',
      circumradius: 'R: Umkreisradius des n-Ecks',
      pourTitle: 'Umschütten: {k} von {n}',
      archTitle: 'Archimedes: {k} von 2',
      prism: 'Prisma',
      cylinder: 'Zylinder',
      pyramid: 'Pyramide',
      coneWord: 'Kegel',
      hemi: 'Halbkugel',
      sphereWord: 'Kugel',
      fills1: '1 Pyramide füllt \\f{1}{3} des Prismas',
      fills2: '2 Pyramiden füllen \\f{2}{3}',
      fills3: '3 Pyramiden füllen das Prisma',
      cfills1: '1 Kegel füllt \\f{1}{3} des Zylinders',
      cfills2: '2 Kegel füllen \\f{2}{3}',
      cfills3: '3 Kegel füllen den Zylinder',
      archCone: 'Kegel füllt \\f{1}{3}: \\f{1}{3}πr³',
      archHemi: 'Halbkugel füllt den Rest: \\f{2}{3}πr³',
      netPyr: 'Netz der Pyramide',
      netPyrOpen: 'Pyramide abwickeln',
      netCone: 'Mantel: Kreissektor',
      netConeOpen: 'Kegel abwickeln',
      splitTitle: 'Kugel aus Pyramiden',
      splitEach: 'jede Pyramide: \\f{1}{3} · G_i · r',
      splitAll: 'alle: V = \\f{1}{3} · O · r',
      triangles: 'Dreiecke',
      pour: 'Umschütten',
      again: 'Von vorn',
      unfold: 'Abwickeln',
      fold: 'Zusammenfalten',
      splitBtn: 'Zerlegen',
      joinBtn: 'Zusammensetzen',
      cut: 'Schnitt',
      percentOf: '{p} des Zylinders',
      askPyr: 'Wie oft passt die Pyramide hinein?',
      askCone: 'Wie oft passt der Kegel hinein?',
      askArch: 'Passen Kegel und Halbkugel zusammen hinein?',
    },
    en: {
      canvas: 'Rotatable 3D view of a pyramid, cone or sphere: helper triangles with Pythagoras’ theorem, pouring water, the net or a sphere made of pyramids',
      pyr3: 'Triangular pyramid',
      pyr4: 'Square pyramid',
      pyr5: 'Pentagonal pyramid',
      pyr6: 'Hexagonal pyramid',
      pyr7: 'Heptagonal pyramid',
      pyr8: 'Octagonal pyramid',
      kegel: 'Cone',
      kugel: 'Sphere',
      triHa: 'Slant height h_a',
      triS: 'Lateral edge s',
      triFace: 'Lateral edge s from h_a',
      triCone: 'Slant height s',
      sphereTitle: 'Sphere with radius r',
      truth: 'Helper triangle, true shape',
      inradius: 'ρ: inradius of the n-gon',
      circumradius: 'R: circumradius of the n-gon',
      pourTitle: 'Pouring: {k} of {n}',
      archTitle: 'Archimedes: {k} of 2',
      prism: 'Prism',
      cylinder: 'Cylinder',
      pyramid: 'Pyramid',
      coneWord: 'Cone',
      hemi: 'Hemisphere',
      sphereWord: 'Sphere',
      fills1: '1 pyramid fills \\f{1}{3} of the prism',
      fills2: '2 pyramids fill \\f{2}{3}',
      fills3: '3 pyramids fill the prism',
      cfills1: '1 cone fills \\f{1}{3} of the cylinder',
      cfills2: '2 cones fill \\f{2}{3}',
      cfills3: '3 cones fill the cylinder',
      archCone: 'cone fills \\f{1}{3}: \\f{1}{3}πr³',
      archHemi: 'hemisphere fills the rest: \\f{2}{3}πr³',
      netPyr: 'Net of the pyramid',
      netPyrOpen: 'Unfolding the pyramid',
      netCone: 'Lateral surface: sector',
      netConeOpen: 'Unrolling the cone',
      splitTitle: 'Sphere made of pyramids',
      splitEach: 'each pyramid: \\f{1}{3} · G_i · r',
      splitAll: 'all of them: V = \\f{1}{3} · O · r',
      triangles: 'triangles',
      pour: 'Pour',
      again: 'Start again',
      unfold: 'Unfold',
      fold: 'Fold up',
      splitBtn: 'Split',
      joinBtn: 'Put together',
      cut: 'cut',
      percentOf: '{p} of the cylinder',
      askPyr: 'How many pyramids fit in?',
      askCone: 'How many cones fit in?',
      askArch: 'Do the cone and the hemisphere fit in together?',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    /** Zahl mit Dezimalkomma; `eq` liefert „=“ oder „≈“ je nach Rundung. */
    const num = (v: number, d = 2) => fmt.num(v, d);
    const eq = (v: number, d = 2) => (Math.abs(v - Number(v.toFixed(d))) < 1e-9 ? '=' : '≈');
    const cm = (v: number, d = 2) => `${num(v, d)} cm`;

    const view = new View3D(surface, { azimuth: 28, elevation: 18, elevationLimits: [-15, 88] });

    let body = p.body as Body;
    let mode = p.mode as Mode;
    let pyr: PyramidData = pyramid(4, 6, 4);
    let cn: ConeData = cone(3, 4);
    let sp: SphereData = sphere(3);
    let basePts: Pt[] = [];
    let pyrMesh: Mesh3D = mesh3d.pyramid([], [0, 0, 1]);
    let coneMesh: Mesh3D = mesh3d.cone(1, 1);
    let pourScene: PourScene | null = null;
    let splitParts: { faces: Vec3[][]; dir: Vec3; centroid: Vec3 }[] = [];
    let pourAnim: PourAnim | null = null;
    let pourTimer = 0;
    let openShown = 0;
    let openAnim: { tween: Tween; from: number; to: number } | null = null;
    let openTimer = 0;
    const triPop = new Tween(650, ease.outCubic);
    let frame: { target: Vec3; radius: number } | null = null;
    let lastTime = performance.now();
    let lastHandle = -Infinity;

    /* ---------- Farben ---------- */

    const th = () => ctx.theme;
    const tint = (c: string) => (th().dark ? c : mixColor(c, '#ffffff', 0.15));
    const edgeOf = (c: string) => mixColor(c, th().dark ? '#000000' : '#0b1220', th().dark ? 0.45 : 0.42);
    const C = () => {
      const s = th().series;
      return { h: s[1]!, a: s[3]!, ha: s[2]!, s: s[4]!, R: s[5]!, G: s[0]!, M: s[2]!, body: s[0]!, vessel: s[3]!, water: s[0]! };
    };
    const palette = () => {
      const c = C();
      return { h: c.h, a: c.a, ha: c.ha, s: c.s, R: c.R, G: c.G, M: c.M, r: c.a };
    };
    const waterBase = () => mixColor(th().series[0]!, th().series[5]!, 0.38);
    const waterColor = () => (th().dark ? mixColor(waterBase(), th().bg, 0.12) : mixColor(waterBase(), '#ffffff', 0.3));
    const waterTop = () => (th().dark ? mixColor(waterBase(), '#ffffff', 0.12) : mixColor(waterBase(), '#ffffff', 0.55));
    const streamColor = () => (th().dark ? waterBase() : mixColor(waterBase(), '#ffffff', 0.12));
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.82)' : 'rgba(255,255,255,0.88)');

    /* ---------- Geometrie ---------- */

    function rebuild(): void {
      body = p.body as Body;
      mode = p.mode as Mode;
      pyr = pyramid(p.n, p.a, p.h);
      cn = cone(p.r, p.h);
      sp = sphere(p.r);
      basePts = polygonPoints(p.n, pyr.base.R, 1);
      pyrMesh = mesh3d.pyramid(basePts, [0, 0, p.h]);
      coneMesh = mesh3d.cone(p.r, p.h, 72);
      pourScene = buildPour();
      splitParts = buildSplit();
    }

    /** Kreis als feines Vieleck (Umkreisradius r), erste Seite bei x₂ = side · r. */
    const circlePts = (r: number, side: 1 | -1) => polygonPoints(64, r / Math.cos(Math.PI / 64), side);

    function buildPour(): PourScene {
      const slots: Slot[] = [];
      let recvBase: Pt[];
      let recvH: number;
      let recvG: number;
      let levels: number[];
      let marks: { z: number; label: string }[];
      const clearance = (H: number) => Math.max(0.3, 0.12 * H);
      const slot = (vessel: Vessel, offset: Vec3, dir: 1 | -1, exact: number, steps: number[], kind: Slot['kind']): Slot => {
        const tiltEmpty = emptyTilt(vessel, dir);
        const tiltMax = Math.min(150 * DEG, tiltEmpty + 14 * DEG);
        // Fassungsvermögen in Abhängigkeit vom Kippwinkel (für gleichmäßiges Ausgießen)
        const N = 40;
        const tilt = Array.from({ length: N + 1 }, (_, i) => (tiltEmpty * i) / N);
        const cap = tilt.map((t) => capacityAt(vessel, poseVertices(vessel, { offset: [0, 0, 0], tilt: t, dir })));
        const s: Slot = { vessel, offset, dir, tiltMax, exact, steps, rest: [], kind, tiltEmpty, table: { tilt, cap } };
        s.rest = poseVertices(vessel, { offset, tilt: 0, dir });
        return s;
      };
      if (body === 'kugel') {
        const r = p.r;
        recvBase = circlePts(r, -1);
        recvH = r;
        recvG = Math.PI * r * r;
        const c = clearance(r);
        const coneV = invertedPyramidVessel(circlePts(r, 1), r, 1);
        slots.push(slot(coneV, [0, -r - coneV.lip[1], c], 1, sp.archimedes.cone, [1], 'cone'));
        const bowl = bowlVessel(r, -1);
        slots.push(slot(bowl, [0, r - bowl.lip[1], c], -1, sp.archimedes.hemisphere, [2], 'bowl'));
        levels = [0, sp.archimedes.cone, sp.archimedes.cylinder];
        marks = [{ z: r / 3, label: '⅓' }];
      } else {
        const H = p.h;
        const c = clearance(H);
        if (body === 'pyramide') {
          recvBase = polygonPoints(p.n, pyr.base.R, -1);
          recvG = pyr.G;
          const v = invertedPyramidVessel(polygonPoints(p.n, pyr.base.R, 1), H, 1);
          slots.push(slot(v, [0, -pyr.base.rho - v.lip[1], c], 1, pyr.V, [1, 2, 3], 'pyramid'));
        } else {
          recvBase = circlePts(p.r, -1);
          recvG = cn.G;
          const v = invertedPyramidVessel(circlePts(p.r, 1), H, 1);
          slots.push(slot(v, [0, -p.r - v.lip[1], c], 1, cn.V, [1, 2, 3], 'cone'));
        }
        recvH = H;
        levels = [0, 1, 2, 3].map((k) => (k / 3) * recvG * H);
        marks = [
          { z: H / 3, label: '⅓' },
          { z: (2 * H) / 3, label: '⅔' },
        ];
      }
      const prism = mesh3d.prism(recvBase, 0, recvH);
      const recvWalls: Mesh3D = { vertices: prism.vertices, faces: prism.faces.filter((_, i) => i !== 1) };
      // Bildausschnitt: Auffanggefäß und alle Gefäße in Ruhe und gekippt
      const pts: Vec3[] = [...recvBase.map(([x, y]) => [x, y, 0] as Vec3), ...recvBase.map(([x, y]) => [x, y, recvH] as Vec3)];
      for (const s of slots) {
        for (const tilt of [0, s.tiltMax * 0.5, s.tiltMax]) pts.push(...poseVertices(s.vessel, { offset: s.offset, tilt, dir: s.dir }));
      }
      const lo = [0, 1, 2].map((k) => Math.min(...pts.map((q) => q[k]!))) as unknown as Vec3;
      const hi = [0, 1, 2].map((k) => Math.max(...pts.map((q) => q[k]!))) as unknown as Vec3;
      return {
        recvBase,
        recvH,
        recvG,
        recvWalls,
        waterFaces: prism.faces,
        slots,
        total: body === 'kugel' ? 2 : 3,
        levels,
        marks,
        bbox: { lo, hi },
      };
    }

    /** Kugel aus Pyramiden: Grundflächen auf der Kugel, Spitzen im Mittelpunkt. */
    function buildSplit(): { faces: Vec3[][]; dir: Vec3; centroid: Vec3 }[] {
      const r = p.r;
      const center: Vec3 = [0, 0, r];
      const s = mesh3d.sphere(r, 18, 10, center);
      return s.faces.map((f) => {
        const base = f.map((i) => s.vertices[i]!);
        const bc = vec3.centroid(base);
        const all = [...base, center];
        const pc = vec3.centroid(all);
        const faces: Vec3[][] = [base];
        for (let i = 0; i < base.length; i++) faces.push([base[(i + 1) % base.length]!, base[i]!, center]);
        // nach außen orientieren
        const oriented = faces.map((pts) => (vec3.dot(vec3.normal(pts), vec3.sub(vec3.centroid(pts), pc)) < 0 ? [...pts].reverse() : pts));
        return { faces: oriented, dir: vec3.normalize(vec3.sub(bc, center)), centroid: bc };
      });
    }

    /* ---------- Zustände ---------- */

    const pours = () => (body === 'kugel' ? p.arch : p.pour);
    const maxPours = () => (body === 'kugel' ? 2 : 3);
    const openValue = () => (body === 'kugel' ? p.split : p.open) / 100;
    const reduced = () => prefersReducedMotion();

    function syncActions(): void {
      const k = pours();
      ctx.setAction('pour', { label: ctx.t(k >= maxPours() && !pourAnim ? 'again' : 'pour') });
      const target = openAnim ? openAnim.to : openShown;
      const done = target >= 0.999;
      ctx.setAction('unfold', { label: ctx.t(body === 'kugel' ? (done ? 'joinBtn' : 'splitBtn') : done ? 'fold' : 'unfold') });
    }

    /* ---------- Ergebnisse ---------- */

    function updateReadouts(): void {
      const v = (x: string, sub = '') => `<var>${x}</var>${sub ? `<sub>${sub}</sub>` : ''}`;
      const third = '<span class="frac"><span>1</span><span>3</span></span>';
      const half = '<span class="frac"><span>1</span><span>2</span></span>';
      const sq = (x: string) => `${x}²`;
      if (body === 'pyramide') {
        const q = pyr.base;
        const G =
          p.n === 4
            ? `${v('G')} = ${sq(v('a'))} = (${cm(p.a)})² = <strong>${num(pyr.G)} cm²</strong>`
            : `${v('G')} = ${p.n} · ${half} · ${v('a')} · ${v('ρ')} ${eq(q.rho)} ${p.n} · ${half} · ${cm(p.a)} · ${cm(q.rho)} ≈ <strong>${num(pyr.G)} cm²</strong>`;
        ctx.readout('G', { html: G });
        const rhoTxt = p.n === 4 ? `${v('a')}/2` : v('ρ');
        const RTxt = p.n === 4 ? `${v('d')}/2` : v('R');
        ctx.readout('side', {
          html:
            `${v('h', 'a')} = √(${sq(v('h'))} + ${sq(`(${rhoTxt})`)}) = √(${num(p.h)}² + ${num(q.rho)}²) cm ${eq(pyr.ha)} <strong>${cm(pyr.ha)}</strong><br>` +
            `${v('s')} = √(${sq(v('h'))} + ${sq(`(${RTxt})`)}) = √(${num(p.h)}² + ${num(q.R)}²) cm ${eq(pyr.s)} <strong>${cm(pyr.s)}</strong>`,
        });
        ctx.readout('V', { html: `${v('V')} = ${third} · ${v('G')} · ${v('h')} = ${third} · ${num(pyr.G)} cm² · ${cm(p.h)} ${eq(pyr.V)} <strong>${num(pyr.V)} cm³</strong>` });
        ctx.readout('M', { html: `${v('M')} = ${p.n} · ${half} · ${v('a')} · ${v('h', 'a')} ${eq(pyr.M)} ${p.n} · ${half} · ${cm(p.a)} · ${cm(pyr.ha)} ${eq(pyr.M)} <strong>${num(pyr.M)} cm²</strong>` });
        ctx.readout('O', { html: `${v('O')} = ${v('G')} + ${v('M')} ${eq(pyr.O)} ${num(pyr.G)} cm² + ${num(pyr.M)} cm² ${eq(pyr.O)} <strong>${num(pyr.O)} cm²</strong>` });
        ctx.readout('cmp', { html: `${ctx.t('prism')}: ${v('V')} = ${v('G')} · ${v('h')} ${eq(pyr.G * p.h)} ${num(pyr.G * p.h)} cm³ – ${ctx.t('pyramid')} = ${third} ${ctx.lang === 'de' ? 'davon' : 'of it'}` });
      } else if (body === 'kegel') {
        ctx.readout('G', { html: `${v('G')} = π · ${sq(v('r'))} = π · (${cm(p.r)})² ≈ <strong>${num(cn.G)} cm²</strong>` });
        ctx.readout('side', { html: `${v('s')} = √(${sq(v('h'))} + ${sq(v('r'))}) = √(${num(p.h)}² + ${num(p.r)}²) cm ${eq(cn.s)} <strong>${cm(cn.s)}</strong>` });
        ctx.readout('V', { html: `${v('V')} = ${third} · π · ${sq(v('r'))} · ${v('h')} = ${third} · π · (${cm(p.r)})² · ${cm(p.h)} ≈ <strong>${num(cn.V)} cm³</strong>` });
        ctx.readout('M', {
          html: `${v('M')} = π · ${v('r')} · ${v('s')} ≈ π · ${cm(p.r)} · ${cm(cn.s)} ≈ <strong>${num(cn.M)} cm²</strong><br>${ctx.lang === 'de' ? 'Sektorwinkel' : 'Sector angle'} ${v('α')} = 360° · ${v('r')} : ${v('s')} ${eq(cn.sectorDeg, 1)} <strong>${num(cn.sectorDeg, 1)}°</strong>`,
        });
        ctx.readout('O', { html: `${v('O')} = π${sq(v('r'))} + π${v('r')}${v('s')} ≈ ${num(cn.G)} cm² + ${num(cn.M)} cm² ≈ <strong>${num(cn.O)} cm²</strong>` });
        ctx.readout('cmp', { html: `${ctx.t('cylinder')}: ${v('V')} = π${sq(v('r'))}${v('h')} ≈ ${num(cn.G * p.h)} cm³ – ${ctx.t('coneWord')} = ${third} ${ctx.lang === 'de' ? 'davon' : 'of it'}` });
      } else {
        const four3 = '<span class="frac"><span>4</span><span>3</span></span>';
        const two3 = '<span class="frac"><span>2</span><span>3</span></span>';
        ctx.readout('G', null);
        ctx.readout('side', { html: `${v('d')} = 2${v('r')} = <strong>${cm(sp.d)}</strong>` });
        ctx.readout('V', { html: `${v('V')} = ${four3} · π · ${v('r')}³ = ${four3} · π · (${cm(p.r)})³ ≈ <strong>${num(sp.V)} cm³</strong>` });
        ctx.readout('M', null);
        ctx.readout('O', { html: `${v('O')} = 4 · π · ${sq(v('r'))} = 4 · π · (${cm(p.r)})² ≈ <strong>${num(sp.O)} cm²</strong>` });
        ctx.readout('cmp', {
          html: `${ctx.lang === 'de' ? 'Zylinder drumherum (Höhe 2<var>r</var>)' : 'Cylinder around it (height 2<var>r</var>)'}: ${v('V')} = 2π${v('r')}³ ≈ ${num(sp.cylV)} cm³, ${v('O')} = 6π${sq(v('r'))} ≈ ${num(sp.cylO)} cm² – ${ctx.lang === 'de' ? 'die Kugel hat jeweils' : 'the sphere has'} ${two3} ${ctx.lang === 'de' ? 'davon' : 'of each'}`,
        });
      }
    }

    /* ---------- Griffe (Maße direkt ziehen) ---------- */

    const editable = () => !ctx.locked && mode === 'masse' && !openAnim;
    const grab = () => (lastHandle = performance.now());
    view.addHandle({
      get: () => [0, 0, body === 'kugel' ? 2 * p.r : p.h],
      set: (q) => {
        grab();
        if (body === 'kugel') ctx.set({ r: Math.max(1, Math.min(5, q[2] / 2)) });
        else ctx.set({ h: Math.max(1, Math.min(10, q[2])) });
      },
      axis: [0, 0, 1],
      enabled: editable,
      color: () => C().h,
    });
    view.addHandle({
      get: () => (body === 'pyramide' ? [0, pyr.base.rho, 0] : [0, p.r, 0]),
      set: (q) => {
        grab();
        if (body === 'pyramide') ctx.set({ a: Math.max(1, Math.min(8, 2 * Math.max(0.05, q[1]) * Math.tan(Math.PI / p.n))) });
        else ctx.set({ r: Math.max(1, Math.min(5, q[1])) });
      },
      axis: [0, 1, 0],
      enabled: () => editable() && body !== 'kugel',
      color: () => C().a,
    });

    /* ---------- Hilfen: Beschriftung, Karten ---------- */

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });

    /** Formel-Beschriftung an einem 3D-Punkt (über allem, mit Schild). */
    function flabel(at: Vec3, src: string, color: string, off: [number, number] = [0, 0], align: 'left' | 'center' | 'right' = 'center', size = 13): void {
      view.custom(
        at,
        (g) => {
          const [x, y] = view.toPx(at);
          const box = formula(g, src, fstyle(size, color, 700));
          const left = align === 'left' ? x + off[0] : align === 'right' ? x + off[0] - box.w : x + off[0] - box.w / 2;
          const base = y + off[1] + (box.asc - box.desc) / 2;
          g.save();
          g.fillStyle = pillBg();
          roundRect(g, left - 6, base - box.asc - 3, box.w + 12, box.asc + box.desc + 6, 8);
          g.fill();
          g.restore();
          box.draw(g, left, base);
        },
        'front',
      );
    }

    /** Rahmen einer Karte (wie in anderen Simulationen). */
    function cardFrame(r: Rect): void {
      const g = surface.g;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.94)' : 'rgba(255,255,255,0.94)';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    /** Formel so setzen, dass sie in die Breite passt (Schrift notfalls kleiner). */
    function fitFormula(src: string, maxW: number, size: number, color: string, weight: number): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /**
     * Karte mit Titel und Formelzeilen. `extra` reserviert Platz unter dem
     * Titel (z. B. für das Hilfsdreieck). Gibt das Rechteck zurück.
     */
    function drawCard(x: number, y: number, maxW: number, title: string, lines: CardLine[], opts: { size: number; extra?: number; drawExtra?: (r: Rect) => void; dots?: { done: number; total: number } }): Rect {
      const g = surface.g;
      const pad = 13;
      const sw = 16;
      const inner = maxW - 2 * pad;
      const titleBox = fitFormula(title, inner - (opts.dots ? opts.dots.total * 14 + 6 : 0), opts.size + 4, th().text, 800);
      const boxes = lines.map((l) => fitFormula(l.f, inner - (l.swatch ? sw : 0), opts.size, l.muted ? th().muted : th().text, l.bold ? 800 : 600));
      let w = titleBox.w + (opts.dots ? opts.dots.total * 14 + 8 : 0);
      boxes.forEach((b, i) => (w = Math.max(w, b.w + (lines[i]!.swatch ? sw : 0))));
      const cardW = Math.min(maxW, Math.max(w + 2 * pad, opts.extra ? Math.min(maxW, 220) : 0));
      const lineHs = boxes.map((b) => Math.max(opts.size * 1.55, b.asc + b.desc + 7));
      const titleH = titleBox.asc + titleBox.desc + 8;
      const h = pad + titleH + (opts.extra ?? 0) + lineHs.reduce((a, b) => a + b, 0) + pad - 4;
      const r = { x, y, w: cardW, h };
      cardFrame(r);
      let cy = y + pad + titleBox.asc;
      titleBox.draw(g, x + pad, cy);
      if (opts.dots) {
        const { done, total } = opts.dots;
        for (let i = 0; i < total; i++) {
          const dx = x + cardW - pad - (total - 1 - i) * 14 - 5;
          g.beginPath();
          g.arc(dx, cy - titleBox.asc * 0.38, 5, 0, Math.PI * 2);
          g.fillStyle = i < done ? waterColor() : 'transparent';
          g.fill();
          g.strokeStyle = i < done ? edgeOf(waterColor()) : th().muted;
          g.lineWidth = 1.4;
          g.stroke();
        }
      }
      cy += titleBox.desc + 8;
      if (opts.extra && opts.drawExtra) {
        opts.drawExtra({ x: x + pad, y: cy, w: cardW - 2 * pad, h: opts.extra });
        cy += opts.extra;
      }
      boxes.forEach((b, i) => {
        const lh = lineHs[i]!;
        const base = cy + lh / 2 + (b.asc - b.desc) / 2;
        const line = lines[i]!;
        if (line.swatch) {
          g.fillStyle = line.swatch;
          roundRect(g, x + pad, cy + lh / 2 - 4.5, 9, 9, 2.5);
          g.fill();
        }
        b.draw(g, x + pad + (line.swatch ? sw : 0), base);
        cy += lh;
      });
      return r;
    }

    /* ---------- Rahmen eines Frames ---------- */

    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    const textSize = () => (narrow() ? 12 : surface.width < 560 ? 12 : surface.width < 760 ? 13 : 14);

    function goalFrame(): { target: Vec3; radius: number } {
      if (mode === 'volumen' && pourScene) {
        // Breite Szene: so groß wie möglich, ohne seitlich oder oben/unten anzustoßen
        const { lo, hi } = pourScene.bbox;
        const w = surface.width;
        const h = surface.height;
        const m = Math.min(w, h) * 0.92;
        const halfX = (hi[1] - lo[1]) / 2 + (hi[0] - lo[0]) * 0.12;
        const halfZ = (hi[2] - lo[2]) / 2 + (hi[0] - lo[0]) * 0.1;
        const nar = narrow();
        const availW = w * (nar ? 0.92 : 0.9);
        const availH = h * (p.calc ? (nar ? 0.56 : 0.58) : 0.78);
        const radius = Math.max((halfX * m) / availW, (halfZ * m) / availH) * 1.04;
        return { target: [0, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2], radius };
      }
      if (body === 'kugel') {
        if (mode === 'oberflaeche') return { target: [0, 0, p.r], radius: p.r * (1.22 + 0.5 * openValue()) };
        return { target: [0, 0, p.r], radius: p.r * (p.cyl ? 1.62 : 1.25) };
      }
      if (mode === 'oberflaeche') {
        if (body === 'pyramide') {
          const ext = pyr.base.rho + pyr.ha;
          return { target: [0, 0, p.h * 0.15], radius: Math.max(ext * 1.02, Math.hypot(pyr.base.R, p.h) * 0.8) };
        }
        // Kegel: vom Kegel bis zum flachen Sektor neben dem Grundkreis
        const s = cn.s;
        const r = p.r;
        const lo = -(r + s) - s;
        const hi = r;
        return { target: [0, (lo + hi) / 2, p.h * 0.12], radius: 0.5 * Math.hypot(hi - lo, 1.4 * s) * 0.92 };
      }
      const R = body === 'pyramide' ? pyr.base.R : p.r;
      return { target: [0, 0, p.h * 0.45], radius: 0.5 * Math.hypot(2.2 * R, p.h * 1.12) + 0.3 };
    }

    function viewFor(m: Mode, b: Body): { azimuth: number; elevation: number } {
      if (m === 'volumen') return { azimuth: 12, elevation: 15 };
      if (m === 'oberflaeche') return b === 'kugel' ? { azimuth: 30, elevation: 20 } : { azimuth: 26, elevation: 44 };
      return b === 'kugel' ? { azimuth: 30, elevation: 16 } : { azimuth: 30, elevation: 17 };
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      let animating = false;

      if (openAnim) {
        openShown = openAnim.from + (openAnim.to - openAnim.from) * openAnim.tween.value;
        if (openAnim.tween.running) animating = true;
      }
      if (pourAnim) animating = true;
      if (triPop.running) animating = true;

      const goal = goalFrame();
      if (!frame) frame = goal;
      let settling = false;
      if (now - lastHandle > 350) {
        const k = 1 - Math.exp(-dt / 0.2);
        frame = { target: vec3.lerp(frame.target, goal.target, k), radius: frame.radius + (goal.radius - frame.radius) * k };
        settling = vec3.distance(frame.target, goal.target) > 0.004 || Math.abs(frame.radius - goal.radius) > 0.004;
      } else settling = true;
      const nar = narrow();
      const showCard = p.calc;
      const vol = mode === 'volumen';
      const ax = nar || vol || !showCard ? 0.5 : 0.63;
      const ay = vol ? (showCard ? (nar ? 0.69 : 0.6) : 0.52) : nar ? (showCard ? 0.66 : 0.55) : mode === 'oberflaeche' && body !== 'kugel' ? 0.55 : 0.53;
      view.setScene({ target: frame.target, radius: frame.radius * (nar && showCard && !vol ? 1.18 : 1), anchor: [ax, ay] });

      view.begin();
      if (mode === 'masse') drawMeasures();
      else if (mode === 'volumen') drawPour(now, dt);
      else drawNet();
      view.end();
      if (showCard) drawInfo(nar, now);
      if (animating || settling) ctx.requestRender();
    }

    /* ---------- Glasgefäße ---------- */

    /** Mehrere Vielecke als eine Fläche füllen (keine Nahtlinien bei Transparenz). */
    function fillUnion(polys: Vec3[][], color: string, alpha: number, layer: 'back' | 'front'): void {
      if (!polys.length) return;
      view.custom(
        polys[0]![0]!,
        (g) => {
          g.save();
          g.beginPath();
          for (const poly of polys) {
            poly.forEach((q, i) => {
              const [x, y] = view.toPx(q);
              if (i === 0) g.moveTo(x, y);
              else g.lineTo(x, y);
            });
            g.closePath();
          }
          g.globalAlpha = alpha;
          g.fillStyle = color;
          g.fill('nonzero');
          g.restore();
        },
        layer,
      );
    }

    /** Glaswände eines offenen Gefäßes: hintere Wände sofort, vordere nach der Szene. */
    function glass(mesh: Mesh3D, color: string): { back: () => void; front: () => void } {
      const cam = view.camera;
      const { edges } = meshTopology(mesh);
      const info = mesh.faces.map((f) => {
        const pts = f.map((i) => mesh.vertices[i]!);
        const n = vec3.normal(pts);
        return { pts, n, front: cam.facing(n, vec3.centroid(pts)) };
      });
      const edgeColor = mixColor(color, th().dark ? '#ffffff' : '#0b1220', th().dark ? 0.2 : 0.35);
      const fill = th().dark ? mixColor(color, th().bg, 0.45) : mixColor(color, '#ffffff', 0.5);
      const minCos = Math.cos(25 * DEG);
      return {
        back: () => {
          fillUnion(
            info.filter((f) => !f.front).map((f) => f.pts),
            fill,
            th().dark ? 0.32 : 0.34,
            'back',
          );
          for (const e of edges) {
            const [f1, f2] = e.faces as [number, number | undefined];
            if (f2 === undefined) continue;
            const a = info[f1]!;
            const b = info[f2]!;
            if (a.front || b.front) continue;
            if (vec3.dot(a.n, b.n) >= minCos) continue;
            view.segment(mesh.vertices[e.a]!, mesh.vertices[e.b]!, { color: edgeColor, width: 1.2, alpha: 0.5, layer: 'back' });
          }
        },
        front: () => {
          fillUnion(
            info.filter((f) => f.front).map((f) => f.pts),
            fill,
            th().dark ? 0.12 : 0.16,
            'front',
          );
          for (const e of edges) {
            const [f1, f2] = e.faces as [number, number | undefined];
            const a = info[f1]!;
            if (f2 === undefined) {
              view.segment(mesh.vertices[e.a]!, mesh.vertices[e.b]!, { color: edgeColor, width: 2, layer: 'front' });
              continue;
            }
            const b = info[f2]!;
            const feature = vec3.dot(a.n, b.n) < minCos;
            const sil = a.front !== b.front;
            if (!(a.front || b.front) || !(feature || sil)) continue;
            view.segment(mesh.vertices[e.a]!, mesh.vertices[e.b]!, { color: edgeColor, width: 2, layer: 'front' });
          }
        },
      };
    }

    /** Sanfte Schattierung für Wasser (schräg nach unten zeigende Flächen werden nicht so dunkel wie Körper). */
    function waterShade(n: Vec3, base: string): string {
      const i = lightIntensity(view.camera.dirToView(vec3.normalize(n)));
      return i >= 0.75 ? mixColor(base, '#ffffff', (i - 0.75) * 0.45) : mixColor(base, '#000000', (0.75 - i) * 0.32);
    }

    /** Wasserkörper (Flächenliste; die letzte Fläche ist der Wasserspiegel). */
    function drawWater(solid: Vec3[][]): void {
      const water = waterColor();
      const top = waterTop();
      solid.forEach((pts, i) => {
        const n = vec3.normal(pts);
        const surfaceFace = i === solid.length - 1 && Math.abs(n[2]) > 0.99;
        view.face(pts, { color: surfaceFace ? top : waterShade(n, water), flat: true, cull: true });
      });
    }

    /** Wasserstrahl als gebogene Linie (Wurfparabel) vom Ausguss bis zur Höhe zEnd. */
    function drawStream(from: Vec3, dir: number, strength: number, zEnd: number, reach: number): void {
      if (strength <= 0.01) return;
      const fall = Math.max(0.05, from[2] - zEnd);
      const pts: Vec3[] = [];
      const N = 18;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        // Wurfparabel: waagerecht gleichmäßig, senkrecht quadratisch
        pts.push([from[0], from[1] + dir * reach * u, from[2] - fall * u * u]);
      }
      const water = streamColor();
      const w = 2.5 + 6.5 * Math.sqrt(Math.min(1, strength));
      view.polyline(pts, { color: water, width: w, layer: 'front' });
      view.polyline(pts.slice(0, -2), { color: mixColor(water, '#ffffff', 0.55), width: Math.max(1, w * 0.25), alpha: 0.75, layer: 'front' });
    }

    /** Wellenringe am Auftreffpunkt des Strahls. */
    function drawRipples(at: Vec3, t: number, maxR: number): void {
      const color = mixColor(waterTop(), '#ffffff', 0.5);
      for (let k = 0; k < 3; k++) {
        const ph = (t * 1.4 + k / 3) % 1;
        const rr = maxR * (0.2 + 0.8 * ph);
        const pts: Vec3[] = Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          return [at[0] + rr * Math.cos(a), at[1] + rr * Math.sin(a), at[2] + 0.01] as Vec3;
        });
        view.polyline(pts, { color, width: 1.5, alpha: 0.85 * (1 - ph), closed: true, layer: 'front' });
      }
    }

    /* ---------- Thema 1: Maße ---------- */

    function drawFloor(R: number, shadowPts: Vec3[]): void {
      const G = Math.ceil(R + 1.5);
      view.grid({ min: [-G, -G], max: [G, G], step: 1, color: th().gridMinor });
      if (shadowPts.length) view.shadow(shadowPts, { alpha: 0.18, blur: 22, spread: 1.05 });
    }

    /** Rechter Winkel als kleines Quadrat an der Ecke A (Schenkel in Richtung u und w). */
    function rightAngle(A: Vec3, u: Vec3, w: Vec3, color: string): void {
      const k = 11 / Math.max(1e-6, view.pixelsPerUnit(A));
      const a = vec3.add(A, vec3.scale(vec3.normalize(u), k));
      const c = vec3.add(A, vec3.scale(vec3.normalize(w), k));
      const b = vec3.add(a, vec3.scale(vec3.normalize(w), k));
      view.polyline([a, b, c], { color, width: 1.6, layer: 'front' });
      view.custom(
        A,
        (g) => {
          const [x, y] = view.toPx(vec3.lerp(A, b, 0.5));
          g.beginPath();
          g.arc(x, y, 1.7, 0, Math.PI * 2);
          g.fillStyle = color;
          g.fill();
        },
        'front',
      );
    }

    /**
     * Rechtwinkliges Hilfsdreieck A (rechter Winkel), B, C mit farbigen Seiten
     * und Beschriftungen; `t` lässt die Seiten nacheinander erscheinen.
     */
    function helperTriangle(A: Vec3, B: Vec3, Cc: Vec3, sides: { ab: [string, string]; ac: [string, string]; bc: [string, string] }, t: number): void {
      const fillColor = sides.bc[1];
      const tt = clamp01(t);
      view.face([A, B, Cc], { color: fillColor, alpha: 0.2 * tt, flat: true, layer: 'front' });
      const grow = (P: Vec3, Q: Vec3, s0: number) => vec3.lerp(P, Q, smooth(clamp01((tt - s0) / 0.45)));
      view.segment(A, grow(A, B, 0), { color: sides.ab[1], width: 3, layer: 'front' });
      view.segment(A, grow(A, Cc, 0.2), { color: sides.ac[1], width: 3, layer: 'front' });
      view.segment(B, grow(B, Cc, 0.45), { color: sides.bc[1], width: 3, layer: 'front' });
      if (tt > 0.5) rightAngle(A, vec3.sub(B, A), vec3.sub(Cc, A), th().text);
      // Beschriftungen nach außen (im Bild vom Dreiecksschwerpunkt weg)
      const pa = view.toPx(A);
      const pb = view.toPx(B);
      const pc = view.toPx(Cc);
      const gx = (pa[0] + pb[0] + pc[0]) / 3;
      const gy = (pa[1] + pb[1] + pc[1]) / 3;
      const place = (P: Vec3, Q: Vec3, label: string, color: string) => {
        const m = vec3.lerp(P, Q, 0.5);
        const [mx, my] = view.toPx(m);
        let dx = mx - gx;
        let dy = my - gy;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const dist = 18;
        const align = dx > 0.35 ? 'left' : dx < -0.35 ? 'right' : 'center';
        flabel(m, label, color, [dx * dist - (align === 'left' ? 4 : align === 'right' ? -4 : 0), dy * dist], align, textSize());
      };
      if (tt > 0.95) {
        place(A, B, sides.ab[0], sides.ab[1]);
        place(A, Cc, sides.ac[0], sides.ac[1]);
        place(B, Cc, sides.bc[0], sides.bc[1]);
      }
    }

    /** Punkt mit Buchstaben (z. B. Spitze S, Fußpunkt F). */
    function namedPoint(P: Vec3, name: string, off: [number, number]): void {
      view.point(P, { color: th().text, radius: 3.6, layer: 'front' });
      view.label(P, name, { color: th().text, size: 14, math: true, weight: '700', offset: off, align: 'center', baseline: 'middle' });
    }

    function handleDots(): void {
      if (!editable()) return;
      const c = C();
      view.point([0, 0, body === 'kugel' ? 2 * p.r : p.h], { color: c.h, radius: 6, layer: 'front' });
      if (body !== 'kugel') view.point(body === 'pyramide' ? [0, pyr.base.rho, 0] : [0, p.r, 0], { color: c.a, radius: 6, layer: 'front' });
    }

    const val = (sym: string, v: number, unit = 'cm', d = 2) => (p.calc ? `${sym} ${eq(v, d)} ${num(v, d)} ${unit}` : sym);

    function drawMeasures(): void {
      const c = C();
      const t = triPop.running ? triPop.value : 1;
      if (body === 'kugel') return drawSphereMeasures();
      if (body === 'kegel') {
        drawFloor(p.r, coneMesh.vertices.filter((q) => q[2] === 0) as Vec3[]);
        const col = tint(c.body);
        view.mesh(coneMesh, { color: col, alpha: 0.34, edgeColor: edgeOf(col), edgeWidth: 1.6, edgeAngle: 20, hiddenEdges: true, gloss: 0.3, cull: false });
        const right = vec3.normalize([view.camera.right[0], view.camera.right[1], 0]);
        const F: Vec3 = [0, 0, 0];
        const S: Vec3 = [0, 0, p.h];
        const P: Vec3 = vec3.scale(right, p.r);
        helperTriangle(F, S, P, { ab: [`h = ${cm(p.h)}`, c.h], ac: [`r = ${cm(p.r)}`, c.a], bc: [val('s', cn.s), c.s] }, t);
        namedPoint(S, 'S', [0, -14]);
        handleDots();
        return;
      }
      // Pyramide
      drawFloor(pyr.base.R, basePts.map(([x, y]) => [x, y, 0] as Vec3));
      const col = tint(c.body);
      view.mesh(pyrMesh, { color: col, alpha: 0.32, edgeColor: edgeOf(col), edgeWidth: 1.6, edgeAngle: 3, hiddenEdges: true, gloss: 0.18, cull: false });
      const right = vec3.normalize([view.camera.right[0], view.camera.right[1], 0]);
      const back = vec3.normalize([view.camera.back[0], view.camera.back[1], 0]);
      const n = basePts.length;
      const P3 = basePts.map(([x, y]) => [x, y, 0] as Vec3);
      const mids = P3.map((q, i) => vec3.lerp(q, P3[(i + 1) % n]!, 0.5));
      const S: Vec3 = [0, 0, p.h];
      const F: Vec3 = [0, 0, 0];
      const best = (list: Vec3[], dirv: Vec3) => {
        let bi = 0;
        let bv = -Infinity;
        list.forEach((q, i) => {
          const d = vec3.dot(vec3.normalize([q[0], q[1], 0]), dirv);
          if (d > bv) {
            bv = d;
            bi = i;
          }
        });
        return bi;
      };
      const halfA = p.n === 4 ? 'a/2' : 'ρ';
      const halfAval = p.calc || p.n !== 4 ? `${halfA} ${eq(pyr.base.rho)} ${cm(pyr.base.rho)}` : `${halfA} = ${cm(pyr.base.rho)}`;
      const tri = p.tri as 'ha' | 's' | 'face';
      // Grundkante vorn beschriften
      const front = best(mids, back);
      const ea = P3[front]!;
      const eb = P3[(front + 1) % n]!;
      const out = vec3.normalize([mids[front]![0], mids[front]![1], 0]);
      flabel(mids[front]!, `a = ${cm(p.a)}`, th().text, [out[1] * 0, 22], 'center', textSize());
      view.segment(ea, eb, { color: th().text, width: 2.4, layer: 'front' });
      if (tri === 'ha') {
        const i = best(mids, right);
        helperTriangle(F, S, mids[i]!, { ab: [`h = ${cm(p.h)}`, c.h], ac: [halfAval, c.a], bc: [val('h_a', pyr.ha), c.ha] }, t);
        namedPoint(mids[i]!, 'M', [12, 10]);
      } else if (tri === 's') {
        const i = best(P3, right);
        const rLabel = p.n === 4 ? (p.calc ? `d/2 ≈ ${cm(pyr.base.R)}` : 'd/2') : p.calc ? `R ≈ ${cm(pyr.base.R)}` : 'R';
        // Diagonale (bei n = 4) bzw. Umkreisradius gestrichelt
        if (p.n === 4) view.segment(P3[(i + 2) % 4]!, F, { color: c.R, width: 1.6, dash: [5, 4], layer: 'front' });
        helperTriangle(F, S, P3[i]!, { ab: [`h = ${cm(p.h)}`, c.h], ac: [rLabel, c.R], bc: [val('s', pyr.s), c.s] }, t);
      } else {
        // Dreieck in der Seitenfläche, die am meisten zur Kamera zeigt
        let fi = 0;
        let fv = -Infinity;
        mids.forEach((m, k) => {
          const d = vec3.dot(vec3.normalize([m[0], m[1], 0]), vec3.normalize(vec3.add(back, vec3.scale(right, 0.6))));
          if (d > fv) {
            fv = d;
            fi = k;
          }
        });
        const M = mids[fi]!;
        const Pa = P3[fi]!;
        const Pb = P3[(fi + 1) % n]!;
        const P = vec3.dot(Pa, right) > vec3.dot(Pb, right) ? Pa : Pb;
        view.segment(S, F, { color: c.h, width: 1.6, dash: [5, 4], layer: 'front' });
        helperTriangle(M, S, P, { ab: [p.calc ? `h_a ${eq(pyr.ha)} ${cm(pyr.ha)}` : 'h_a', c.ha], ac: [`a/2 = ${cm(p.a / 2)}`, c.a], bc: [val('s', pyr.s), c.s] }, t);
        namedPoint(M, 'M', [-4, 14]);
      }
      namedPoint(S, 'S', [0, -14]);
      namedPoint(F, 'F', [-12, 8]);
      handleDots();
    }

    function drawSphereMeasures(): void {
      const c = C();
      const r = p.r;
      const center: Vec3 = [0, 0, r];
      drawFloor(r, mesh3d.circle([0, 0, 0], [0, 0, 1], r, 32));
      const col = tint(c.body);
      if (p.cyl) {
        const cyl = mesh3d.cylinder(r, 2 * r, 72);
        view.mesh(cyl, { color: th().series[4], alpha: 0.12, flat: true, edgeColor: th().series[4], edgeWidth: 1.6, edgeAngle: 20, cull: false });
      }
      view.ball(center, r, { color: col, alpha: 0.82 });
      // Großkreis (Äquator): vorn durchgezogen, hinten gestrichelt
      const cam = view.camera.position;
      const ring = mesh3d.circle(center, [0, 0, 1], r, 96);
      view.face(ring, { color: c.a, alpha: 0.16, flat: true, layer: 'front', cull: false });
      const frontSeg: Vec3[][] = [];
      const backSeg: Vec3[][] = [];
      let cur: Vec3[] = [];
      let curFront: boolean | null = null;
      ring.concat([ring[0]!]).forEach((q) => {
        const f = vec3.dot(vec3.sub(q, center), vec3.sub(cam, q)) > 0;
        if (curFront === null || f === curFront) cur.push(q);
        else {
          cur.push(q);
          (curFront ? frontSeg : backSeg).push(cur);
          cur = [q];
        }
        curFront = f;
      });
      if (cur.length > 1) (curFront ? frontSeg : backSeg).push(cur);
      for (const s of backSeg) view.polyline(s, { color: c.a, width: 1.6, dash: [5, 4], alpha: 0.85, layer: 'front' });
      for (const s of frontSeg) view.polyline(s, { color: c.a, width: 2.2, layer: 'front' });
      const right = vec3.normalize([view.camera.right[0], view.camera.right[1], 0]);
      const P = vec3.add(center, vec3.scale(right, r));
      view.segment(center, P, { color: c.a, width: 3, layer: 'front' });
      flabel(vec3.lerp(center, P, 0.5), `r = ${cm(r)}`, c.a, [0, -16], 'center', textSize());
      view.point(center, { color: th().text, radius: 3.6, layer: 'front' });
      view.label(center, 'M', { color: th().text, size: 14, math: true, weight: '700', offset: [-12, -10] });
      if (p.cyl) {
        // Höhe des Zylinders als Maßlinie rechts neben dem Zylinder
        const out = vec3.scale(right, r * 1.18);
        const a: Vec3 = [out[0], out[1], 0];
        const b: Vec3 = [out[0], out[1], 2 * r];
        const cs = th().series[4]!;
        view.segment(a, b, { color: cs, width: 1.8, layer: 'front' });
        for (const q of [a, b]) view.segment(vec3.add(q, vec3.scale(right, -0.12 * r)), vec3.add(q, vec3.scale(right, 0.12 * r)), { color: cs, width: 1.8, layer: 'front' });
        flabel(vec3.lerp(a, b, 0.72), `h = 2r = ${cm(2 * r)}`, cs, [10, 0], 'left', textSize());
      }
      handleDots();
    }

    /* ---------- Thema 2: Umschütten ---------- */

    /** Kippwinkel, bei dem das Gefäß genau noch `c` Wasser hält (aus der Tabelle). */
    function tiltFor(s: Slot, c: number): number {
      const { tilt, cap } = s.table;
      if (c >= cap[0]!) return 0;
      for (let i = 0; i < tilt.length - 1; i++) {
        const c0 = cap[i]!;
        const c1 = cap[i + 1]!;
        if (c <= c0 && c >= c1) return tilt[i]! + (tilt[i + 1]! - tilt[i]!) * ((c0 - c) / Math.max(1e-12, c0 - c1));
      }
      return s.tiltEmpty;
    }

    function vesselState(si: number, now: number): { tilt: number; vW: number; t: number; active: boolean } {
      const s = pourScene!.slots[si]!;
      const a = pourAnim && pourAnim.slot === si ? pourAnim : null;
      if (!a) {
        const k = pourAnim ? pourAnim.step - 1 : pours();
        return { tilt: 0, vW: k < Math.max(...s.steps) ? s.vessel.volume : 0, t: 0, active: false };
      }
      const t = (now - a.t0) / 1000;
      let tilt = 0;
      if (t < T_POUR) tilt = tiltFor(s, s.vessel.volume * (1 - smooth(clamp01(t / T_POUR))));
      else if (t < T_POUR + T_OVER) tilt = s.tiltEmpty + (s.tiltMax - s.tiltEmpty) * ease.outCubic(clamp01((t - T_POUR) / T_OVER));
      else if (t < T_BACK_START) tilt = s.tiltMax;
      else if (t < T_FILL_START) tilt = s.tiltMax * (1 - ease.inOutCubic(clamp01((t - T_BACK_START) / T_BACK)));
      return { tilt, vW: a.vW, t, active: true };
    }

    /** Ist die laufende Schüttung schon (fast) vollständig im Auffanggefäß? */
    const pourCounted = (now: number) => !!pourAnim && (now - pourAnim.t0) / 1000 >= T_POUR + 0.25;

    function drawPour(now: number, dt: number): void {
      const sc = pourScene;
      if (!sc) return;
      const c = C();
      let recvVolume = sc.levels[Math.min(pours(), sc.total)]!;
      const states = sc.slots.map((_, i) => vesselState(i, now));
      const posed = sc.slots.map((s, i) => (states[i]!.tilt > 0 ? poseVertices(s.vessel, { offset: s.offset, tilt: states[i]!.tilt, dir: s.dir }) : s.rest));
      // Animation fortschreiben: Wasser verlässt das Gefäß, kommt etwas später unten an
      if (pourAnim) {
        const a = pourAnim;
        const s = sc.slots[a.slot]!;
        const st = states[a.slot]!;
        const before = a.vW;
        if (st.t < T_BACK_START) a.vW = Math.min(a.vW, capacityAt(s.vessel, posed[a.slot]!));
        a.poured = Math.max(a.poured, 1 - a.vW / s.vessel.volume);
        if (a.refill && st.t > T_FILL_START) a.vW = s.vessel.volume * clamp01((st.t - T_FILL_START) / T_FILL);
        const rate = dt > 0 ? Math.max(0, before - a.vW) / s.vessel.volume / dt : 0;
        a.flow += (rate - a.flow) * (1 - Math.exp(-dt / 0.1));
        const target = sc.levels[a.step - 1]! + a.poured * s.exact;
        a.recv += (target - a.recv) * (1 - Math.exp(-dt / 0.16));
        if (st.t >= a.duration - 0.1) a.recv = sc.levels[a.step]!;
        st.vW = a.vW;
        recvVolume = a.recv;
      }

      // Boden und Schatten
      const { lo, hi } = sc.bbox;
      view.grid({ min: [Math.floor(lo[0] - 1.5), Math.floor(lo[1] - 1)], max: [Math.ceil(hi[0] + 1.5), Math.ceil(hi[1] + 1)], step: 1, color: th().gridMinor });
      const recvFloor = sc.recvBase.map(([x, y]) => [x, y, 0] as Vec3);
      view.shadow(recvFloor, { alpha: 0.2, blur: 20, spread: 1.04 });
      sc.slots.forEach((_, i) => view.shadow(posed[i]!.map((q) => [q[0], q[1], 0] as Vec3), { alpha: 0.08, blur: 30, spread: 0.9 }));

      // Glas hinten
      const recvGlass = glass(sc.recvWalls, th().series[0]!);
      const vesselGlass = sc.slots.map((s, i) => glass({ vertices: posed[i]!, faces: s.vessel.walls }, c.vessel));
      recvGlass.back();
      vesselGlass.forEach((g) => g.back());

      // Wasser im Auffanggefäß
      const level = recvVolume / sc.recvG;
      if (level > 1e-4) {
        const vertices: Vec3[] = [...sc.recvBase.map(([x, y]) => [x, y, 0] as Vec3), ...sc.recvBase.map(([x, y]) => [x, y, level] as Vec3)];
        view.mesh({ vertices, faces: sc.waterFaces }, { color: waterColor(), edges: false, cull: true, gloss: 0.18, face: (f) => (f === 1 ? { color: waterTop(), gloss: 0.45 } : undefined) });
      }

      // Wasser in den Gefäßen
      sc.slots.forEach((s, i) => {
        const st = states[i]!;
        if (st.vW <= s.vessel.volume * 1e-4) return;
        const solid = solidOf(posed[i]!, s.vessel.faces);
        if (st.tilt === 0 && st.vW >= s.vessel.volume * (1 - 1e-6)) drawWater(solid);
        else drawWater(clipBelow(solid, levelForVolume(solid, st.vW, 26)));
      });

      // Strahl und Nachfüllen
      if (pourAnim) {
        const a = pourAnim;
        const s = sc.slots[a.slot]!;
        const st = states[a.slot]!;
        const lip: Vec3 = [s.vessel.lip[0] + s.offset[0], s.vessel.lip[1] + s.offset[1], s.vessel.lip[2] + s.offset[2]];
        const width = body === 'pyramide' ? 2 * pyr.base.rho : 2 * p.r;
        const strength = Math.min(1, a.flow * 2.2);
        if (strength > 0.02 && st.t < T_BACK_START + 0.3) {
          const reach = width * 0.3 * (0.35 + 0.65 * Math.sqrt(strength));
          drawStream(lip, s.dir, strength, level, reach);
          drawRipples([lip[0], lip[1] + s.dir * reach, level], st.t, Math.min(width * 0.22, 0.9));
        }
        if (a.refill && st.t > T_FILL_START - 0.05 && st.t < T_FILL_START + T_FILL) {
          const solid = solidOf(posed[a.slot]!, s.vessel.faces);
          const z = levelForVolume(solid, Math.max(a.vW, 1e-6), 22);
          const cx = s.offset[1];
          // Strahl von oben, nach oben hin ausgeblendet
          const rimZ = s.offset[2] + s.vessel.lip[2];
          const top = rimZ + 0.75 * (rimZ - s.offset[2]) + 0.6;
          const steps = [0.12, 0.35, 0.7, 1];
          steps.forEach((alpha, k) => {
            const z0 = top - ((top - z) * k) / steps.length;
            const z1 = top - ((top - z) * (k + 1)) / steps.length;
            view.segment([0, cx, z0], [0, cx, z1], { color: streamColor(), width: 5, alpha, layer: 'front' });
          });
          drawRipples([0, cx, z], st.t, 0.35);
        }
      }

      // Glas vorn
      recvGlass.front();
      vesselGlass.forEach((g) => g.front());

      // Füllmarken am Auffanggefäß
      const muted = th().muted;
      for (const m of sc.marks) {
        const ring = sc.recvBase.map(([x, y]) => [x * 1.01, y * 1.01, m.z] as Vec3);
        view.polyline(ring, { color: muted, width: 1.3, dash: [4, 4], closed: true, layer: 'front' });
        let best = ring[0]!;
        let bv = -Infinity;
        for (const q of ring) {
          const v = body === 'kugel' ? vec3.dot(q, view.camera.back) : view.toPx(q)[0];
          if (v > bv) {
            bv = v;
            best = q;
          }
        }
        view.label(best, m.label, body === 'kugel' ? { color: th().text, size: 15, weight: '700', offset: [0, -11], align: 'center', baseline: 'middle' } : { color: th().text, size: 15, weight: '700', offset: [10, 0], align: 'left', baseline: 'middle' });
      }
      // Namen unter den Körpern
      const nameSize = textSize();
      const lowest = (pts: readonly Vec3[]) => pts.reduce((m, q) => (view.toPx(q)[1] > view.toPx(m)[1] ? q : m), pts[0]!);
      view.label(lowest(recvFloor), body === 'pyramide' ? ctx.t('prism') : ctx.t('cylinder'), { color: th().text, size: nameSize, weight: '700', offset: [0, 16], align: 'center', baseline: 'middle' });
      sc.slots.forEach((s, i) => {
        if (states[i]!.tilt > 0.02) return;
        const name = s.kind === 'pyramid' ? ctx.t('pyramid') : s.kind === 'cone' ? ctx.t('coneWord') : ctx.t('hemi');
        view.label(lowest(posed[i]!), name, { color: th().text, size: nameSize, weight: '700', offset: [0, 16], align: 'center', baseline: 'middle' });
      });
    }

    /* ---------- Thema 3: Netz ---------- */

    /** Helle Flächenfarbe für große Flächen (Netz). */
    const netTint = (c: string) => (th().dark ? mixColor(c, th().bg, 0.08) : mixColor(c, '#ffffff', 0.42));

    /**
     * Beschriftung neben einer Strecke PQ, im Bild senkrecht zur Strecke und
     * vom Punkt `away` weg verschoben.
     */
    function sideLabel(P: Vec3, Q: Vec3, label: string, color: string, away: Vec3, at = 0.5, dist = 16): void {
      const m = vec3.lerp(P, Q, at);
      const [px, py] = view.toPx(P);
      const [qx, qy] = view.toPx(Q);
      const [ax, ay] = view.toPx(away);
      const [mx, my] = view.toPx(m);
      let nx = -(qy - py);
      let ny = qx - px;
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
      if (nx * (mx - ax) + ny * (my - ay) < 0) {
        nx = -nx;
        ny = -ny;
      }
      const align = nx > 0.45 ? 'left' : nx < -0.45 ? 'right' : 'center';
      flabel(m, label, color, [nx * dist, ny * dist], align, textSize());
    }

    function drawNet(): void {
      if (body === 'kugel') return drawSplit();
      if (body === 'kegel') return drawConeNet();
      const c = C();
      const u = openShown;
      const n = basePts.length;
      const P3 = basePts.map(([x, y]) => [x, y, 0] as Vec3);
      const R = pyr.base.rho + pyr.ha;
      const G = Math.ceil(R + 1);
      view.grid({ min: [-G, -G], max: [G, G], step: 1, color: th().gridMinor });
      const baseCol = netTint(c.G);
      const sideCol = netTint(c.M);
      view.shadow(P3, { alpha: 0.16, blur: 20, spread: 1.05 });
      view.face([...P3].reverse(), { color: baseCol, stroke: edgeOf(baseCol), width: 1.6, cull: false, backShade: 0.1, gloss: 0.1, label: u > 0.9 && p.calc ? { text: narrow() ? `G = ${num(pyr.G)}` : `G ${eq(pyr.G)} ${num(pyr.G)} cm²`, size: textSize() } : undefined });
      // Seitenflächen klappen nacheinander herunter
      const delta = pyr.faceAngle;
      const stagger = n > 1 ? 0.35 / (n - 1) : 0;
      const front = bestFrontFace(P3);
      let dim: { m: Vec3; apex: Vec3 } | null = null;
      for (let i = 0; i < n; i++) {
        const a = P3[i]!;
        const b = P3[(i + 1) % n]!;
        const m = vec3.lerp(a, b, 0.5);
        const out = vec3.normalize([m[0], m[1], 0]);
        const q = smooth(clamp01((u - i * stagger) / (1 - 0.35)));
        const phi = (Math.PI - delta) * (1 - q);
        const apex = vec3.add(m, vec3.add(vec3.scale(out, pyr.ha * Math.cos(phi)), [0, 0, pyr.ha * Math.sin(phi)]));
        const flat = q > 0.98;
        // Flächeninhalt: neben der Maßlinie h_a (beim vorderen Dreieck), sonst in der Mitte
        const centroid = vec3.centroid([a, b, apex]);
        const at = i === front ? vec3.lerp(centroid, vec3.lerp(m, b, 0.75), 0.55) : centroid;
        view.face([a, b, apex], {
          color: sideCol,
          stroke: edgeOf(sideCol),
          width: 1.6,
          cull: false,
          backShade: 0.18,
          gloss: 0.14,
          label: flat && p.calc && !narrow() ? { text: `${num(pyr.face)} cm²`, size: textSize() - 1, at } : undefined,
        });
        if (i === front && flat) dim = { m, apex };
      }
      // Maßlinie h_a und Grundkante a am vorderen Dreieck
      const ea = P3[front]!;
      const eb = P3[(front + 1) % n]!;
      if (dim) {
        view.segment(dim.m, dim.apex, { color: c.ha, width: 2.4, layer: 'front' });
        rightAngle(dim.m, vec3.sub(dim.apex, dim.m), vec3.sub(eb, dim.m), c.ha);
        sideLabel(dim.m, dim.apex, p.calc ? `h_a ${eq(pyr.ha)} ${cm(pyr.ha)}` : 'h_a', c.ha, ea, 0.6);
      }
      const mFront = vec3.lerp(ea, eb, 0.5);
      if (u > 0.5) {
        // nach innen in die Grundfläche
        sideLabel(ea, eb, `a = ${cm(p.a)}`, th().text, vec3.scale(mFront, 2), 0.5, 14);
      } else sideLabel(ea, eb, `a = ${cm(p.a)}`, th().text, [0, 0, 0], 0.5, 16);
    }

    /** Index der Seitenfläche, die (abgewickelt) am besten zu sehen ist. */
    function bestFrontFace(P3: Vec3[]): number {
      const back = vec3.normalize([view.camera.back[0], view.camera.back[1], 0]);
      const right = vec3.normalize([view.camera.right[0], view.camera.right[1], 0]);
      const want = vec3.normalize(vec3.add(back, vec3.scale(right, 0.35)));
      let bi = 0;
      let bv = -Infinity;
      const n = P3.length;
      for (let i = 0; i < n; i++) {
        const m = vec3.lerp(P3[i]!, P3[(i + 1) % n]!, 0.5);
        const d = vec3.dot(vec3.normalize([m[0], m[1], 0]), want);
        if (d > bv) {
          bv = d;
          bi = i;
        }
      }
      return bi;
    }

    const CONE_K = 72;
    const coneFaceList: number[][] = Array.from({ length: CONE_K }, (_, i) => [0, i + 1, i + 2]);

    function drawConeNet(): void {
      const c = C();
      const r = p.r;
      const s = cn.s;
      const u = openShown;
      const e: Vec3 = [0, 1, 0];
      const lo = -(r + s) - s;
      view.grid({ min: [-Math.ceil(s + 1), Math.floor(lo - 1)], max: [Math.ceil(s + 1), Math.ceil(r + 1)], step: 1, color: th().gridMinor });
      const baseCol = netTint(c.G);
      const sideCol = netTint(c.M);
      // Grundkreis bleibt liegen
      const disc = mesh3d.circle([0, 0, 0.002], [0, 0, 1], r, 64);
      view.shadow(disc, { alpha: 0.14, blur: 16, spread: 1.03 });
      view.face(disc, { color: baseCol, stroke: edgeOf(baseCol), width: 1.6, cull: false, gloss: 0.1, label: u > 0.9 && p.calc ? { text: `G ≈ ${num(cn.G)} cm²`, size: textSize() } : undefined });
      // Mantel: erst zur Seite rücken, dann aufrollen
      let center: Vec3;
      let rho: number;
      let wrap: number;
      let height: number;
      let lift = 0;
      if (u <= CONE_SHIFT) {
        const q = smooth(u / CONE_SHIFT);
        center = vec3.scale(e, -2 * r * q);
        lift = Math.sin(Math.PI * q) * 0.25 * p.h;
        rho = r;
        wrap = 2 * Math.PI;
        height = p.h;
      } else {
        const q = smooth((u - CONE_SHIFT) / (1 - CONE_SHIFT));
        const st = unrollCone(r, s, q);
        rho = st.rho;
        wrap = st.wrap;
        height = st.height;
        center = vec3.scale(e, -(r + rho));
      }
      const psiM = Math.atan2(e[1], e[0]);
      const vertices: Vec3[] = [[center[0], center[1], lift + height]];
      for (let i = 0; i <= CONE_K; i++) {
        const psi = psiM - wrap / 2 + (wrap * i) / CONE_K;
        vertices.push([center[0] + rho * Math.cos(psi), center[1] + rho * Math.sin(psi), lift + 0.004]);
      }
      view.shadow(
        vertices.slice(1).map((q) => [q[0], q[1], 0] as Vec3),
        { alpha: 0.12, blur: 22, spread: 1.0 },
      );
      view.mesh({ vertices, faces: coneFaceList }, { color: sideCol, edgeColor: edgeOf(sideCol), edgeWidth: 1.6, edgeAngle: 25, cull: false, backShade: 0.22, gloss: 0.22 });
      const apex = vertices[0]!;
      // Schnittlinie (hier wird der Mantel aufgeschnitten)
      if (u < CONE_SHIFT + 0.08) {
        const cutAt = vertices[1]!;
        const alpha = 1 - clamp01((u - CONE_SHIFT) / 0.08);
        view.segment(apex, cutAt, { color: c.h, width: 2.4, dash: [6, 4], alpha, layer: 'front' });
        if (u < 0.05) sideLabel(apex, cutAt, ctx.t('cut'), c.h, center, 0.55);
      }
      if (u > 0.97) {
        // flacher Sektor: Radius s, Bogen 2πr, Winkel α
        const first = vertices[1]!;
        const rim = vertices.slice(1);
        view.polyline(rim, { color: c.a, width: 3, layer: 'front' });
        view.segment(apex, first, { color: c.s, width: 2.6, layer: 'front' });
        const arcR = Math.min(0.24 * s, 1.2);
        const arc: Vec3[] = Array.from({ length: 48 }, (_, i) => {
          const psi = psiM - wrap / 2 + (wrap * i) / 47;
          return [apex[0] + arcR * Math.cos(psi), apex[1] + arcR * Math.sin(psi), 0.01] as Vec3;
        });
        view.polyline(arc, { color: th().text, width: 1.8, layer: 'front' });
        sideLabel(apex, first, p.calc ? `s = ${cm(s)}` : 's', c.s, vec3.add(apex, vec3.scale(e, s * 0.5)), 0.55);
        flabel(vec3.add(apex, vec3.scale(e, arcR * 1.75)), p.calc ? `α ${eq(cn.sectorDeg, 1)} ${num(cn.sectorDeg, 1)}°` : 'α', th().text, [0, 0], 'center', textSize());
        const k = Math.round(CONE_K * 0.18);
        sideLabel(rim[k]!, rim[k + 1]!, p.calc ? `2πr ≈ ${cm(cn.u)}` : '2πr', c.a, apex, 0.5, 14);
        if (p.calc) {
          const dirM: Vec3 = [Math.cos(psiM + 0.9), Math.sin(psiM + 0.9), 0];
          flabel(vec3.add(apex, vec3.scale(dirM, 0.62 * s)), `M ≈ ${num(cn.M)} cm²`, th().text, [0, 0], 'center', textSize());
        }
      } else if (u < 0.03) {
        const right = vec3.normalize([view.camera.right[0], view.camera.right[1], 0]);
        const P = vec3.scale(right, r);
        view.segment(apex, P, { color: c.s, width: 2.4, layer: 'front' });
        sideLabel(apex, P, p.calc ? `s = ${cm(s)}` : 's', c.s, [0, 0, 0], 0.5);
      }
    }

    function drawSplit(): void {
      const c = C();
      const r = p.r;
      const e = openShown;
      const center: Vec3 = [0, 0, r];
      const G = Math.ceil(r * 1.8 + 1);
      view.grid({ min: [-G, -G], max: [G, G], step: 1, color: th().gridMinor });
      view.shadow(mesh3d.circle([0, 0, 0], [0, 0, 1], r * (1 + 0.4 * e), 32), { alpha: 0.16, blur: 24, spread: 1.0 });
      const baseCol = netTint(c.M);
      const baseCol2 = mixColor(baseCol, th().dark ? '#000000' : '#ffffff', 0.14);
      const sideCol = th().dark ? mixColor(mixColor(th().series[0]!, th().muted, 0.5), th().bg, 0.45) : mixColor(mixColor(th().series[0]!, th().muted, 0.5), '#ffffff', 0.6);
      const hiCol = netTint(c.a);
      const cam = view.camera;
      const want = vec3.normalize(vec3.add(cam.back, vec3.add(vec3.scale(cam.right, 0.9), vec3.scale(cam.up, 0.25))));
      let hi = 0;
      let hv = -Infinity;
      splitParts.forEach((part, i) => {
        const d = vec3.dot(part.dir, want);
        if (d > hv) {
          hv = d;
          hi = i;
        }
      });
      const dist = 0.45 * r * e;
      const extra = 0.95 * r * smooth(clamp01(e * 1.6));
      splitParts.forEach((part, i) => {
        const highlight = i === hi && e > 0.02;
        const off = vec3.scale(part.dir, dist + (highlight ? extra : 0));
        part.faces.forEach((f, k) => {
          const pts = f.map((q) => vec3.add(q, off));
          if (k === 0) {
            const col = highlight ? hiCol : i % 2 ? baseCol : baseCol2;
            view.face(pts, { color: col, cull: true, gloss: 0.2, stroke: e > 0.02 ? edgeOf(col) : undefined, width: 0.8 });
          } else view.face(pts, { color: highlight ? mixColor(hiCol, th().dark ? '#000000' : '#ffffff', 0.25) : sideCol, cull: true, gloss: 0.05, stroke: edgeOf(highlight ? hiCol : sideCol), width: 0.7 });
        });
      });
      if (e > 0.05) {
        const part = splitParts[hi]!;
        const off = vec3.scale(part.dir, dist + extra);
        const apex = vec3.add(center, off);
        const bc = vec3.add(part.centroid, off);
        view.segment(apex, bc, { color: c.h, width: 2.4, dash: [5, 4], layer: 'front' });
        view.point(apex, { color: c.h, radius: 3.4, layer: 'front' });
        sideLabel(apex, bc, p.calc ? `h ≈ r = ${cm(r)}` : 'h ≈ r', c.h, center, 0.5, 16);
        if (p.calc) flabel(bc, `G_i`, hiCol, [0, -16], 'center', textSize());
      }
    }

    /* ---------- Karte: Rechnung im Bild ---------- */

    function drawInfo(nar: boolean, now: number): void {
      const size = textSize();
      const x = 10;
      const y = 10;
      const maxW = nar ? surface.width - 62 : Math.min(surface.width * (mode === 'volumen' ? 0.4 : 0.42), 360);
      const P = palette();
      void P;
      if (mode === 'masse') {
        if (body === 'kugel') {
          const lines: CardLine[] = [
            { f: `d = 2r = ${cm(sp.d)}` },
            { f: `V = \\f{4}{3}πr³ ≈ ${num(sp.V)} cm³`, bold: true },
            { f: `O = 4πr² ≈ ${num(sp.O)} cm²`, bold: true },
          ];
          if (p.cyl) {
            const cs = th().series[4]!;
            if (!nar) lines.push({ f: `${ctx.t('cylinder')}: V = πr² · 2r = 2πr³`, swatch: cs, muted: true });
            lines.push({ f: `V_{${ctx.t('sphereWord')}} = \\f{2}{3} · V_{${ctx.t('cylinder')}}`, swatch: cs });
            if (!nar) lines.push({ f: `${ctx.t('cylinder')}: O = 2πr² + 2πr · 2r = 6πr²`, swatch: cs, muted: true });
            lines.push({ f: `O_{${ctx.t('sphereWord')}} = \\f{2}{3} · O_{${ctx.t('cylinder')}}`, swatch: cs });
          }
          drawCard(x, y, maxW, ctx.t('sphereTitle'), lines, { size });
          return;
        }
        const truthH = nar ? 0 : Math.min(118, surface.height * 0.24);
        const lines: CardLine[] = [];
        let title: string;
        let tri: { legA: number; legB: number; ca: string; cb: string; cc: string; la: string; lb: string; lc: string };
        if (body === 'kegel') {
          title = ctx.t('triCone');
          lines.push({ f: `\\c{s}{s}² = \\c{h}{h}² + \\c{r}{r}²` }, { f: `s = \\r{${num(p.h)}² + ${num(p.r)}²} cm ${eq(cn.s)} ${cm(cn.s)}`, bold: true });
          tri = { legA: p.h, legB: p.r, ca: P_('h'), cb: P_('a'), cc: P_('s'), la: 'h', lb: 'r', lc: 's' };
        } else {
          const t = p.tri as 'ha' | 's' | 'face';
          const rho = pyr.base.rho;
          const R = pyr.base.R;
          const half = p.n === 4 ? '(a/2)' : 'ρ';
          if (t === 'ha') {
            title = ctx.t('triHa');
            lines.push({ f: `\\c{ha}{h_a}² = \\c{h}{h}² + \\c{a}{${half}}²` }, { f: `h_a = \\r{${num(p.h)}² + ${num(rho)}²} cm ${eq(pyr.ha)} ${cm(pyr.ha)}`, bold: true });
            if (p.n !== 4) lines.unshift({ f: `${ctx.t('inradius')} ${eq(rho)} ${cm(rho)}`, muted: true });
            tri = { legA: p.h, legB: rho, ca: P_('h'), cb: P_('a'), cc: P_('ha'), la: 'h', lb: p.n === 4 ? 'a/2' : 'ρ', lc: 'h_a' };
          } else if (t === 's') {
            title = ctx.t('triS');
            if (p.n === 4) lines.push({ f: `d = a · \\r{2} ≈ ${cm(Math.SQRT2 * p.a)}`, muted: true });
            else lines.push({ f: `${ctx.t('circumradius')} ${eq(R)} ${cm(R)}`, muted: true });
            const Rt = p.n === 4 ? '(d/2)' : 'R';
            lines.push({ f: `\\c{s}{s}² = \\c{h}{h}² + \\c{R}{${Rt}}²` }, { f: `s = \\r{${num(p.h)}² + ${num(R)}²} cm ${eq(pyr.s)} ${cm(pyr.s)}`, bold: true });
            tri = { legA: p.h, legB: R, ca: P_('h'), cb: P_('R'), cc: P_('s'), la: 'h', lb: p.n === 4 ? 'd/2' : 'R', lc: 's' };
          } else {
            title = ctx.t('triFace');
            lines.push(
              { f: `h_a = \\r{h² + ${half}²} ${eq(pyr.ha)} ${cm(pyr.ha)}`, muted: true },
              { f: `\\c{s}{s}² = \\c{ha}{h_a}² + \\c{a}{(a/2)}²` },
              { f: `s = \\r{${num(pyr.ha)}² + ${num(p.a / 2)}²} cm ${eq(pyr.s)} ${cm(pyr.s)}`, bold: true },
            );
            tri = { legA: pyr.ha, legB: p.a / 2, ca: P_('ha'), cb: P_('a'), cc: P_('s'), la: 'h_a', lb: 'a/2', lc: 's' };
          }
        }
        drawCard(x, y, maxW, title, lines, {
          size,
          extra: truthH,
          drawExtra: truthH > 0 ? (r) => drawTruth(r, tri) : undefined,
        });
        return;
      }
      if (mode === 'volumen') {
        const k = pourAnim ? pourAnim.step - (pourCounted(now) ? 0 : 1) : pours();
        const total = maxPours();
        const lines: CardLine[] = [];
        const wc = waterColor();
        if (body === 'kugel') {
          const a = sp.archimedes;
          lines.push({ f: `${ctx.t('cylinder')} (h = r): V = πr² · r ≈ ${num(a.cylinder)} cm³`, swatch: th().series[0]! });
          if (k === 0) lines.push({ f: ctx.t('askArch'), muted: true });
          if (k >= 1) lines.push({ f: ctx.t('archCone'), swatch: wc });
          if (k >= 2) {
            lines.push({ f: ctx.t('archHemi'), swatch: wc });
            lines.push({ f: `${ctx.t('sphereWord')}: V = 2 · \\f{2}{3}πr³ = \\f{4}{3}πr³ ≈ ${num(sp.V)} cm³`, bold: true });
          }
          drawCard(x, y, maxW, tr('archTitle', { k }), lines, { size, dots: { done: k, total } });
          return;
        }
        const isPyr = body === 'pyramide';
        const G = isPyr ? pyr.G : cn.G;
        const Vr = G * p.h;
        lines.push({
          f: isPyr ? `${ctx.t('prism')}: V = G · h ${eq(Vr)} ${num(G)} cm² · ${cm(p.h)} ${eq(Vr)} ${num(Vr)} cm³` : `${ctx.t('cylinder')}: V = πr² · h ≈ ${num(Vr)} cm³`,
          swatch: th().series[0]!,
        });
        if (k === 0) lines.push({ f: ctx.t(isPyr ? 'askPyr' : 'askCone'), muted: true });
        if (k >= 1) lines.push({ f: ctx.t(isPyr ? `fills${Math.min(k, 3)}` : `cfills${Math.min(k, 3)}`), swatch: wc });
        if (k >= 3) {
          const V = isPyr ? pyr.V : cn.V;
          lines.push({ f: isPyr ? `V = \\f{1}{3} · G · h ${eq(V)} ${num(V)} cm³` : `V = \\f{1}{3} · πr² · h ≈ ${num(V)} cm³`, bold: true });
        }
        drawCard(x, y, maxW, tr('pourTitle', { k, n: total }), lines, { size, dots: { done: k, total } });
        return;
      }
      // Oberfläche
      const done = openShown > 0.97;
      if (body === 'pyramide') {
        const lines: CardLine[] = [
          { f: p.n === 4 ? `G = a² = ${num(pyr.G)} cm²` : `G = ${p.n} · \\f{1}{2} · a · ρ ≈ ${num(pyr.G)} cm²`, swatch: tint(th().series[0]!) },
          { f: `M = ${p.n} · \\f{1}{2} · a · h_a ${eq(pyr.M)} ${p.n} · \\f{1}{2} · ${num(p.a)} cm · ${num(pyr.ha)} cm ${eq(pyr.M)} ${num(pyr.M)} cm²`, swatch: tint(th().series[2]!) },
        ];
        if (done) lines.push({ f: `O = G + M ${eq(pyr.O)} ${num(pyr.O)} cm²`, bold: true });
        drawCard(x, y, maxW, ctx.t(done ? 'netPyr' : 'netPyrOpen'), lines, { size });
        return;
      }
      if (body === 'kegel') {
        const lines: CardLine[] = [
          { f: `α = 360° · \\f{r}{s} = 360° · \\f{${num(p.r)}}{${num(cn.s)}} ${eq(cn.sectorDeg, 1)} ${num(cn.sectorDeg, 1)}°` },
          { f: `M = \\f{α}{360°} · πs² = πrs ≈ ${num(cn.M)} cm²`, swatch: tint(th().series[2]!) },
          { f: `G = πr² ≈ ${num(cn.G)} cm²`, swatch: tint(th().series[0]!) },
        ];
        if (done) lines.push({ f: `O = πr² + πrs ≈ ${num(cn.O)} cm²`, bold: true });
        drawCard(x, y, maxW, ctx.t(done ? 'netCone' : 'netConeOpen'), lines, { size });
        return;
      }
      const lines: CardLine[] = [
        { f: ctx.t('splitEach'), swatch: tint(th().series[3]!) },
        { f: ctx.t('splitAll') },
        { f: `O = 3 · V : r = 3 · \\f{4}{3}πr³ : r = 4πr²` },
        { f: `O = 4π · (${cm(p.r)})² ≈ ${num(sp.O)} cm²`, bold: true },
      ];
      drawCard(x, y, maxW, ctx.t('splitTitle'), lines, { size });
    }

    function P_(key: 'h' | 'a' | 'ha' | 's' | 'R'): string {
      return palette()[key];
    }

    /** Hilfsdreieck in wahrer Größe (rechter Winkel unten links). */
    function drawTruth(r: Rect, tri: { legA: number; legB: number; ca: string; cb: string; cc: string; la: string; lb: string; lc: string }): void {
      const g = surface.g;
      const size = textSize();
      const padL = 26;
      const padB = 20;
      const padT = 6;
      const padR = 40;
      const availW = r.w - padL - padR;
      const availH = r.h - padB - padT;
      const k = Math.min(availW / tri.legB, availH / tri.legA);
      const w = tri.legB * k;
      const h = tri.legA * k;
      const x0 = r.x + padL + (availW - w) / 2;
      const y0 = r.y + padT + availH - (availH - h) / 2;
      const A = [x0, y0];
      const B = [x0, y0 - h];
      const Cc = [x0 + w, y0];
      g.save();
      g.beginPath();
      g.moveTo(A[0]!, A[1]!);
      g.lineTo(B[0]!, B[1]!);
      g.lineTo(Cc[0]!, Cc[1]!);
      g.closePath();
      g.fillStyle = mixColor(tri.cc, th().dark ? th().bg : '#ffffff', 0.8);
      g.fill();
      g.lineCap = 'round';
      const seg = (P: number[], Q: number[], color: string) => {
        g.strokeStyle = color;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(P[0]!, P[1]!);
        g.lineTo(Q[0]!, Q[1]!);
        g.stroke();
      };
      seg(A, B, tri.ca);
      seg(A, Cc, tri.cb);
      seg(B, Cc, tri.cc);
      // rechter Winkel
      const q = Math.min(10, w * 0.3, h * 0.3);
      g.strokeStyle = th().text;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(A[0]! + q, A[1]!);
      g.lineTo(A[0]! + q, A[1]! - q);
      g.lineTo(A[0]!, A[1]! - q);
      g.stroke();
      g.restore();
      const st = (color: string) => fstyle(size, color, 700);
      const fa = formula(g, tri.la, st(tri.ca));
      fa.draw(g, A[0]! - fa.w - 7, A[1]! - h / 2 + (fa.asc - fa.desc) / 2);
      const fb = formula(g, tri.lb, st(tri.cb));
      fb.draw(g, A[0]! + w / 2 - fb.w / 2, A[1]! + fb.asc + 5);
      const fc = formula(g, tri.lc, st(tri.cc));
      // Hypotenuse: rechts oberhalb der Mitte
      const mx = (B[0]! + Cc[0]!) / 2;
      const my = (B[1]! + Cc[1]!) / 2;
      const nx = h;
      const ny = w;
      const nl = Math.hypot(nx, ny) || 1;
      fc.draw(g, mx + (nx / nl) * 8, my - (ny / nl) * 8 + (fc.asc - fc.desc) / 2 - 2);
    }

    /* ---------- Aktionen ---------- */

    function finishPour(): void {
      window.clearTimeout(pourTimer);
      if (!pourAnim) return;
      const step = pourAnim.step;
      pourAnim = null;
      ctx.set(body === 'kugel' ? { arch: step } : { pour: step });
      syncActions();
      ctx.requestRender();
    }

    function startPour(): void {
      const sc = pourScene;
      if (!sc) return;
      if (pourAnim) finishPour();
      const k = pours();
      if (k >= sc.total) {
        ctx.set(body === 'kugel' ? { arch: 0 } : { pour: 0 });
        syncActions();
        return;
      }
      const step = k + 1;
      if (reduced()) {
        ctx.set(body === 'kugel' ? { arch: step } : { pour: step });
        return;
      }
      const si = sc.slots.findIndex((s) => s.steps.includes(step));
      const s = sc.slots[si]!;
      const refill = s.steps.includes(step + 1);
      const duration = T_FILL_START + (refill ? T_FILL : 0) + 0.15;
      pourAnim = { step, slot: si, t0: performance.now(), vW: s.vessel.volume, poured: 0, recv: sc.levels[k]!, flow: 0, last: performance.now(), refill, duration };
      pourTimer = window.setTimeout(finishPour, duration * 1000);
      syncActions();
      ctx.requestRender();
    }

    function finishOpen(): void {
      window.clearTimeout(openTimer);
      if (!openAnim) return;
      const to = openAnim.to;
      openAnim = null;
      openShown = to;
      ctx.set(body === 'kugel' ? { split: Math.round(to * 100) } : { open: Math.round(to * 100) });
      syncActions();
      ctx.requestRender();
    }

    function startOpen(): void {
      if (openAnim) finishOpen();
      const from = openShown;
      const to = from >= 0.999 ? 0 : 1;
      if (reduced()) {
        openShown = to;
        ctx.set(body === 'kugel' ? { split: to * 100 } : { open: to * 100 });
        return;
      }
      const ms = (body === 'kugel' ? 2200 : body === 'kegel' ? 4200 : 3200) * Math.max(0.25, Math.abs(to - from));
      openAnim = { tween: new Tween(ms, body === 'kugel' ? ease.inOutCubic : ease.linear).play(), from, to };
      openTimer = window.setTimeout(finishOpen, ms + 30);
      syncActions();
      ctx.requestRender();
    }

    function cancelAnims(): void {
      window.clearTimeout(pourTimer);
      window.clearTimeout(openTimer);
      pourAnim = null;
      openAnim = null;
    }

    rebuild();
    openShown = openValue();

    return {
      update(changed, source) {
        const geometry = ['body', 'mode', 'n', 'a', 'r', 'h'].some((k) => changed.has(k));
        if (geometry) {
          if (source !== 'sim' || changed.has('body') || changed.has('mode')) cancelAnims();
          rebuild();
        }
        if ((changed.has('pour') || changed.has('arch')) && source !== 'sim') {
          window.clearTimeout(pourTimer);
          pourAnim = null;
        }
        if ((changed.has('open') || changed.has('split') || geometry) && source !== 'sim') {
          window.clearTimeout(openTimer);
          openAnim = null;
          openShown = openValue();
        }
        if (changed.has('tri') && source === 'input') triPop.play();
        if (changed.has('mode') || changed.has('body') || source === 'init' || source === 'replace') {
          const v = viewFor(p.mode as Mode, p.body as Body);
          view.setInitialView(v);
          if (source === 'input' || source === 'replace') view.animateTo(v, 700);
          else if (source === 'init') view.setCamera(v);
        }
        syncActions();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'pour') startPour();
        else if (id === 'unfold') startOpen();
      },

      resetView: () => view.resetView(false),

      render,

      destroy: () => {
        cancelAnims();
        surface.destroy();
      },
    };
  },
});
