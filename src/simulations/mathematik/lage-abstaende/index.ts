import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import {
  add,
  clipLineToBox,
  coordForm,
  cross,
  dot,
  footOnLine,
  lineLine,
  linePlane,
  norm,
  normalize,
  normSq,
  planeBasis,
  planePlane,
  pointPlane,
  projectOntoPlane,
  scale,
  sub,
  type V3,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Mode = 'll' | 'lp' | 'pp' | 'pd';

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
  get target(): number {
    return this.to;
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

const inModes = (...modes: Mode[]) => (v: Record<string, unknown>) => modes.includes(v.mode as Mode);

/** Zahlenregler für eine Koordinate. */
const coord = <K extends string>(key: K, label: string, def: number, group: string, modes: Mode[], range = 5, step = 0.5) => ({
  key,
  type: 'number' as const,
  group,
  label: L(label, label),
  min: -range,
  max: range,
  step,
  default: def,
  visibleIf: inModes(...modes),
});

/**
 * Lagebeziehungen und Abstände im Raum: zwei Geraden (identisch, parallel,
 * schneidend, windschief mit gemeinsamem Lot), Gerade und Ebene
 * (Durchstoßpunkt, Schnittwinkel, Abstand bei Parallelität), zwei Ebenen
 * (Schnittgerade, Schnittwinkel, Abstand) und der Abstand Punkt – Ebene mit
 * animiertem Lot, Hesse-Normalform und Spiegelpunkt. Entscheidungsbaum mit
 * leuchtendem Pfad, Kamera drehbar, besondere Blickrichtung „auf die Kante“.
 */
export default defineSimulation({
  id: 'lage-abstaende',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.62 },
  groups: [
    { id: 'g', label: L('Gerade g: x = a + t · u', 'Line g: x = a + t · u') },
    { id: 'h', label: L('Gerade h: x = b + s · v', 'Line h: x = b + s · v') },
    { id: 'E', label: L('Ebene E: n₁x₁ + n₂x₂ + n₃x₃ = c', 'Plane E: n₁x₁ + n₂x₂ + n₃x₃ = c') },
    { id: 'F', label: L('Ebene F: m₁x₁ + m₂x₂ + m₃x₃ = k', 'Plane F: m₁x₁ + m₂x₂ + m₃x₃ = k') },
    { id: 'P', label: L('Punkt P', 'Point P') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Lage von', 'Position of'),
      options: [
        { value: 'll', label: L('Gerade – Gerade', 'Line – line') },
        { value: 'lp', label: L('Gerade – Ebene', 'Line – plane') },
        { value: 'pp', label: L('Ebene – Ebene', 'Plane – plane') },
        { value: 'pd', label: L('Abstand Punkt – Ebene', 'Distance point – plane') },
      ],
      default: 'll',
    },
    { ...coord('a1', 'a₁', 2.5, 'g', ['ll', 'lp']), help: L('Stützpunkt A und Richtungsvektor u. Punkte im Bild lassen sich ziehen.', 'Point A and direction vector u. Points in the picture can be dragged.') },
    coord('a2', 'a₂', 1, 'g', ['ll', 'lp']),
    coord('a3', 'a₃', 4, 'g', ['ll', 'lp']),
    coord('u1', 'u₁', 1, 'g', ['ll', 'lp'], 6),
    coord('u2', 'u₂', 0, 'g', ['ll', 'lp'], 6),
    coord('u3', 'u₃', 2, 'g', ['ll', 'lp'], 6),
    coord('b1', 'b₁', -2, 'h', ['ll']),
    coord('b2', 'b₂', 0, 'h', ['ll']),
    coord('b3', 'b₃', 1, 'h', ['ll']),
    coord('v1', 'v₁', 1, 'h', ['ll'], 6),
    coord('v2', 'v₂', 1, 'h', ['ll'], 6),
    coord('v3', 'v₃', 0, 'h', ['ll'], 6),
    coord('n1', 'n₁', 2, 'E', ['lp', 'pp', 'pd'], 4),
    coord('n2', 'n₂', -1, 'E', ['lp', 'pp', 'pd'], 4),
    coord('n3', 'n₃', 2, 'E', ['lp', 'pp', 'pd'], 4),
    coord('c', 'c', 3, 'E', ['lp', 'pp', 'pd'], 10),
    coord('m1', 'm₁', 1, 'F', ['pp'], 4),
    coord('m2', 'm₂', 1, 'F', ['pp'], 4),
    coord('m3', 'm₃', 0, 'F', ['pp'], 4),
    coord('k', 'k', 1, 'F', ['pp'], 10),
    coord('p1', 'p₁', 1, 'P', ['pd']),
    coord('p2', 'p₂', 2, 'P', ['pd']),
    coord('p3', 'p₃', 3, 'P', ['pd']),
    { key: 'nrm', type: 'boolean', group: 'view', label: L('Normalenvektoren', 'Normal vectors'), default: true, visibleIf: inModes('lp', 'pp', 'pd') },
    { key: 'mir', type: 'boolean', group: 'view', label: L('Spiegelpunkt P′', 'Mirror point P′'), default: false, visibleIf: inModes('pd') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnisse anzeigen', 'Show results'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Animation abspielen', 'Play animation'), primary: true },
    { id: 'cam', label: L('Blick auf die Kante', 'Edge-on view') },
  ],
  readouts: [
    { key: 'lage', label: L('Lage', 'Position'), spoiler: true },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'skew', label: L('Windschiefe Geraden', 'Skew lines'), values: {} },
    { id: 'cut', label: L('Schneidende Geraden', 'Intersecting lines'), values: { a1: 1, a2: 0, a3: 0, u1: 1, u2: 1, u3: 0, b1: 0, b2: 1, b3: 0, v1: 1, v2: -1, v3: 0 } },
    { id: 'par', label: L('Parallele Geraden', 'Parallel lines'), values: { a1: 0, a2: 0, a3: 0, u1: 1, u2: 2, u3: 3, b1: 1, b2: 0, b3: 0, v1: 2, v2: 4, v3: 6 } },
    { id: 'same', label: L('Identische Geraden', 'Identical lines'), values: { a1: 0, a2: 0, a3: 0, u1: 1, u2: 2, u3: 3, b1: 1, b2: 2, b3: 3, v1: -2, v2: -4, v3: -6 } },
    { id: 'pierce', label: L('Durchstoßpunkt', 'Point of intersection'), values: { mode: 'lp', a1: 0, a2: 0, a3: 5, u1: 1, u2: 1, u3: -1, n1: 1, n2: 1, n3: 1, c: 2 } },
    { id: 'lpar', label: L('Gerade parallel zur Ebene', 'Line parallel to the plane'), values: { mode: 'lp', a1: 0, a2: 0, a3: 3, u1: 1, u2: -1, u3: 0, n1: 1, n2: 1, n3: 1, c: 2 } },
    { id: 'ppar', label: L('Parallele Ebenen', 'Parallel planes'), values: { mode: 'pp', n1: 1, n2: 1, n3: 1, c: 1, m1: 1, m2: 1, m3: 1, k: 4 } },
    { id: 'pcut', label: L('Schnittgerade zweier Ebenen', 'Line of intersection'), values: { mode: 'pp' } },
    { id: 'dist', label: L('Abstand Punkt – Ebene', 'Distance point – plane'), values: { mode: 'pd' } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit zwei Geraden, Gerade und Ebene oder zwei Ebenen und ihrer Lage: Schnittpunkt, Schnittgerade, Schnittwinkel, kürzeste Verbindung und Lot von einem Punkt auf eine Ebene; Ansicht drehbar, Punkte ziehbar' },
    en: { canvas: 'Three-dimensional coordinate system with two lines, a line and a plane or two planes and their relative position: point of intersection, line of intersection, angle, shortest connection and the perpendicular from a point to a plane; rotatable view, draggable points' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const pv = p as unknown as Record<string, number>;
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
      if (wide) {
        const pw = Math.round(clamp(W * 0.32, 244, 336));
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: Math.min(H - 12, 380) } };
      }
      const ph = Math.round(clamp(H * 0.4, 196, 236));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 30, elevation: 20, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene });

    /* ---------------- Zustand ---------------- */
    const NUM_KEYS = ['a1', 'a2', 'a3', 'u1', 'u2', 'u3', 'b1', 'b2', 'b3', 'v1', 'v2', 'v3', 'n1', 'n2', 'n3', 'c', 'm1', 'm2', 'm3', 'k', 'p1', 'p2', 'p3'] as const;
    const gl: Record<string, Glide> = {};
    for (const key of NUM_KEYS) gl[key] = G(pv[key]!);
    const nrmA = G(p.nrm ? 1 : 0);
    const mirA = G(p.mir ? 1 : 0);
    const showA = G(p.show ? 1 : 0);
    /** Bildausschnitt: Mittelpunkt und Radius der Szene. */
    const frameG = [G(0), G(0), G(1), G(5)];
    /** Mittelpunkte der Ebenenstücke E und F. */
    const cenE = [G(0), G(0), G(0)];
    const cenF = [G(0), G(0), G(0)];
    /** Deckkraft der Fälle (z. B. „ll:skew“) und der Knoten im Entscheidungsbaum. */
    const caseA = new Map<string, Glide>();
    const nodeA = new Map<string, Glide>();
    const camDist = G(6);
    let now = performance.now();
    const introStart = now + (reduced ? -1e6 : 100);
    let animStart = now + (reduced ? -1e6 : 250);
    const animMs = () => (mode() === 'pd' ? 3200 : 2600);
    let lastDrag = -1e9;
    let edge = false;
    let edgeView = { az: 0, el: 0 };
    let edgeT0 = -1e9;

    const tv = (k: string): V3 => [pv[`${k}1`]!, pv[`${k}2`]!, pv[`${k}3`]!];
    const gv = (k: string): V3 => [gl[`${k}1`]!.at(now), gl[`${k}2`]!.at(now), gl[`${k}3`]!.at(now)];
    const gvec = (g: Glide[]): V3 => [g[0]!.at(now), g[1]!.at(now), g[2]!.at(now)];

    function phase(from: number, to: number): number {
      const t = (now - animStart) / animMs();
      return ease.inOutCubic(clamp((t - from) / (to - from), 0, 1));
    }
    const animating = () => now - animStart < animMs() + 100;

    /* ---------------- Fälle (aus den Zielwerten) ---------------- */
    function currentCase(): string {
      switch (mode()) {
        case 'll':
          return `ll:${lineLine(tv('a'), tv('u'), tv('b'), tv('v')).kind}`;
        case 'lp':
          return `lp:${linePlane(tv('a'), tv('u'), tv('n'), p.c).kind}`;
        case 'pp':
          return `pp:${planePlane(tv('n'), p.c, tv('m'), p.k).kind}`;
        default:
          return pointPlane(tv('p'), tv('n'), p.c) ? 'pd:ok' : 'pd:invalid';
      }
    }
    const caseAlpha = (id: string): number => caseA.get(id)?.at(now) ?? 0;

    /* ---------------- Entscheidungsbaum ---------------- */
    /** Knoten des Entscheidungsbaums: Spalte (Mitte, links, rechts), Zeile, Elternknoten und „ja“/„nein“ an der Kante. */
    interface TreeNode {
      id: string;
      col: 'c' | 'L' | 'R';
      row: number;
      text: string;
      leaf?: boolean;
      parent?: string;
      yes?: boolean;
    }
    function tree(): { nodes: TreeNode[]; paths: Record<string, string[]> } | null {
      if (mode() === 'll') {
        return {
          nodes: [
            { id: 'q1', col: 'c', row: 0, text: tt('Richtungen parallel?', 'Directions parallel?') },
            { id: 'q2', col: 'L', row: 1, text: tt('A auf h?', 'A on h?'), parent: 'q1', yes: true },
            { id: 'q3', col: 'R', row: 1, text: tt('Schnittpunkt?', 'Common point?'), parent: 'q1', yes: false },
            { id: 'identical', col: 'L', row: 2, text: tt('identisch', 'identical'), leaf: true, parent: 'q2', yes: true },
            { id: 'parallel', col: 'L', row: 3, text: tt('parallel', 'parallel'), leaf: true, parent: 'q2', yes: false },
            { id: 'intersect', col: 'R', row: 2, text: tt('schneidend', 'intersecting'), leaf: true, parent: 'q3', yes: true },
            { id: 'skew', col: 'R', row: 3, text: tt('windschief', 'skew'), leaf: true, parent: 'q3', yes: false },
          ],
          paths: { identical: ['q1', 'q2', 'identical'], parallel: ['q1', 'q2', 'parallel'], intersect: ['q1', 'q3', 'intersect'], skew: ['q1', 'q3', 'skew'] },
        };
      }
      if (mode() === 'lp' || mode() === 'pp') {
        const lp = mode() === 'lp';
        const same = lp ? 'inPlane' : 'identical';
        return {
          nodes: [
            { id: 'q1', col: 'c', row: 0, text: lp ? 'n · u = 0 ?' : 'n ∥ m ?' },
            { id: 'q2', col: 'L', row: 1, text: lp ? tt('A in E?', 'A in E?') : tt('Punkt von E in F?', 'Point of E in F?'), parent: 'q1', yes: true },
            { id: same, col: 'L', row: 2, text: lp ? tt('g liegt in E', 'g lies in E') : tt('identisch', 'identical'), leaf: true, parent: 'q2', yes: true },
            { id: 'parallel', col: 'L', row: 3, text: tt('parallel', 'parallel'), leaf: true, parent: 'q2', yes: false },
            { id: 'intersect', col: 'R', row: 1, text: lp ? tt('schneidet E', 'intersects E') : tt('Schnittgerade', 'intersect'), leaf: true, parent: 'q1', yes: false },
          ],
          paths: { [same]: ['q1', 'q2', same], parallel: ['q1', 'q2', 'parallel'], intersect: ['q1', 'intersect'] },
        };
      }
      return null;
    }

    /* ---------------- Bildausschnitt und Ebenenmitten (Zielwerte) ---------------- */
    function interest(): { pts: V3[]; e: V3; f: V3 } {
      const pts: V3[] = mode() === 'll' ? [[0, 0, 0]] : [];
      let e: V3 = [0, 0, 0];
      let f: V3 = [0, 0, 0];
      const n = tv('n');
      if (mode() === 'll') {
        const r = lineLine(tv('a'), tv('u'), tv('b'), tv('v'));
        pts.push(tv('a'), tv('b'), add(tv('a'), tv('u')), add(tv('b'), tv('v')));
        if (r.kind === 'intersect' || r.kind === 'skew') pts.push(r.footG, r.footH);
      } else if (mode() === 'lp') {
        const r = linePlane(tv('a'), tv('u'), n, p.c);
        pts.push(tv('a'));
        const focus = r.point && norm(r.point) < 12 ? r.point : tv('a');
        if (r.point && norm(r.point) < 12) pts.push(r.point);
        e = norm(n) > 0 ? projectOntoPlane(focus, n, p.c) : focus;
        pts.push(e);
      } else if (mode() === 'pp') {
        const r = planePlane(n, p.c, tv('m'), p.k);
        const m = tv('m');
        if (r.point) {
          e = r.point;
          f = r.point;
        } else {
          e = norm(n) > 0 ? projectOntoPlane([0, 0, 0], n, p.c) : [0, 0, 0];
          f = norm(m) > 0 ? projectOntoPlane(e, m, p.k) : e;
        }
        pts.push(e, f);
      } else {
        const r = pointPlane(tv('p'), n, p.c);
        pts.push(tv('p'));
        if (r) {
          e = r.foot;
          pts.push(r.foot);
          if (p.mir) pts.push(r.mirror);
        }
      }
      return { pts: pts.map((q) => q.map((v) => clamp(v, -10, 10)) as unknown as V3), e, f };
    }

    function retarget(snap = false): void {
      const dragging = performance.now() - lastDrag < 200;
      const ms = dragging ? 110 : 560;
      const set = (g: Glide, v: number, d = ms) => (snap ? g.snap(v) : g.go(v, d));
      for (const key of NUM_KEYS) set(gl[key]!, pv[key]!);
      set(nrmA, p.nrm ? 1 : 0);
      set(mirA, p.mir ? 1 : 0);
      set(showA, p.show ? 1 : 0);
      const { pts, e, f } = interest();
      const lo = [0, 1, 2].map((i) => Math.min(...pts.map((q) => q[i]!)));
      const hi = [0, 1, 2].map((i) => Math.max(...pts.map((q) => q[i]!)));
      const mid = lo.map((v, i) => (v + hi[i]!) / 2);
      const half = Math.max(...lo.map((v, i) => (hi[i]! - v) / 2));
      set(frameG[0]!, clamp(mid[0]!, -4, 4), 700);
      set(frameG[1]!, clamp(mid[1]!, -4, 4), 700);
      set(frameG[2]!, clamp(mid[2]!, -4, 5), 700);
      set(frameG[3]!, clamp(Math.ceil(half + 2), mode() === 'pd' ? 4 : 5, 10), 700);
      e.forEach((v, i) => set(cenE[i]!, v));
      f.forEach((v, i) => set(cenF[i]!, v));
      // Fälle und Pfad im Entscheidungsbaum
      const cur = currentCase();
      const ids = ['ll:identical', 'll:parallel', 'll:intersect', 'll:skew', 'll:invalid', 'lp:inPlane', 'lp:parallel', 'lp:intersect', 'lp:invalid', 'pp:identical', 'pp:parallel', 'pp:intersect', 'pp:invalid', 'pd:ok', 'pd:invalid'];
      for (const id of ids) {
        if (!caseA.has(id)) caseA.set(id, G(0));
        set(caseA.get(id)!, id === cur ? 1 : 0, dragging ? 200 : 520);
      }
      const tr = tree();
      const path = tr?.paths[cur.split(':')[1]!] ?? [];
      for (const n of ['q1', 'q2', 'q3', 'identical', 'parallel', 'intersect', 'skew', 'inPlane']) {
        if (!nodeA.has(n)) nodeA.set(n, G(0));
        set(nodeA.get(n)!, path.includes(n) ? 1 : 0, 420);
      }
      if (edge) {
        const d = edgeDir();
        if (d) {
          edgeView = camFor(d.dir);
          view.animateTo({ azimuth: edgeView.az, elevation: edgeView.el }, dragging ? 250 : 700);
          edgeT0 = performance.now();
        }
      }
    }

    /* ---------------- Besondere Blickrichtung ---------------- */
    function perpTo(n: V3): V3 {
      const h = cross(n, [0, 0, 1]);
      return norm(h) > 1e-6 * norm(n) ? h : cross(n, [1, 0, 0]);
    }
    function edgeDir(): { dir: V3; label: string } | null {
      const cur = currentCase().split(':')[1];
      const n = tv('n');
      switch (mode()) {
        case 'll': {
          const u = tv('u');
          const v = tv('v');
          if (cur === 'invalid') return null;
          if (cur === 'skew') return { dir: u, label: tt('Blick entlang g', 'View along g') };
          if (cur === 'intersect') return { dir: cross(u, v), label: tt('Blick senkrecht auf g und h', 'View perpendicular to g and h') };
          const w = cross(u, sub(tv('b'), tv('a')));
          return { dir: norm(w) > 1e-9 ? w : perpTo(u), label: tt('Blick senkrecht auf g und h', 'View perpendicular to g and h') };
        }
        case 'lp': {
          if (cur === 'invalid') return null;
          const w = cross(n, tv('u'));
          return { dir: norm(w) > 1e-6 * norm(n) * norm(tv('u')) ? w : perpTo(n), label: tt('Blick auf die Kante von E', 'View E edge-on') };
        }
        case 'pp': {
          if (cur === 'invalid') return null;
          if (cur === 'intersect') return { dir: cross(n, tv('m')), label: tt('Blick entlang der Schnittgeraden', 'View along the line of intersection') };
          return { dir: perpTo(n), label: tt('Blick auf die Kanten', 'View the planes edge-on') };
        }
        default:
          return cur === 'ok' ? { dir: perpTo(n), label: tt('Blick auf die Kante von E', 'View E edge-on') } : null;
      }
    }
    /** Kamerawinkel, die entlang `d` blicken (Seite möglichst nahe an der jetzigen Ansicht). */
    function camFor(d0: V3): { az: number; el: number } {
      let d = normalize(d0);
      const az0 = view.camera.azimuth;
      const azOf = (q: V3) => (Math.atan2(q[1], q[0]) * 180) / Math.PI;
      const diff = (a: number) => Math.abs(((((a - az0) % 360) + 540) % 360) - 180);
      if (Math.abs(d[2]) > 0.25) {
        if (d[2] < 0) d = scale(d, -1);
      } else if (diff(azOf(scale(d, -1))) < diff(azOf(d))) d = scale(d, -1);
      const el = (Math.asin(clamp(d[2], -1, 1)) * 180) / Math.PI;
      const az = Math.abs(d[2]) > 0.999 ? az0 : azOf(d);
      return { az, el: Math.min(89, el) };
    }
    function setEdge(on: boolean): void {
      const d = on ? edgeDir() : null;
      if (on && d) {
        edge = true;
        edgeView = camFor(d.dir);
        view.animateTo({ azimuth: edgeView.az, elevation: edgeView.el, zoom: 1 }, 1000);
        camDist.go(42, 1000);
      } else {
        const was = edge;
        edge = false;
        camDist.go(6, 900);
        if (was && on === false) view.resetView(true);
      }
      edgeT0 = performance.now();
      updateActions();
    }

    /* ---------------- Farben, Texte ---------------- */
    const CG = () => ctx.theme.series[0]!;
    const CH = () => ctx.theme.series[3]!;
    const CE = () => ctx.theme.series[2]!;
    const CF = () => ctx.theme.series[4]!;
    const CR = () => ctx.theme.series[1]!;
    const CW = () => ctx.theme.series[5]!;
    const n1 = (v: number) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, 2);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mfont = (s: number, w = 700) => `italic ${w} ${s}px ${ctx.theme.mathFont}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const sep = lang === 'de' ? ' | ' : ', ';
    /** Zahl als gekürzter Bruch, wenn der Nenner klein ist (1/3, 7/3 …), sonst Dezimalzahl. */
    function frac(v: number): string {
      if (Math.abs(v) < 1e-9) return '0';
      for (let q = 1; q <= 12; q++) {
        const z = v * q;
        if (Math.abs(z - Math.round(z)) < 1e-7) {
          if (q === 1) return n1(v);
          if (Math.abs(Math.round(z)) > 99) break;
          return `${v < 0 ? '−' : ''}${Math.abs(Math.round(z))}/${q}`;
        }
      }
      return n1(v);
    }
    const pt = (q: V3, f = frac) => `(${f(q[0])}${sep}${f(q[1])}${sep}${f(q[2])})`;
    const deg = (v: number) => `${fmt.num(v, 1)}°`;
    /** „= 1“ bei auf zwei Stellen exakten Werten, sonst „≈ 1,33“. */
    const eqv = (v: number) => `${Math.abs(v * 100 - Math.round(v * 100)) < 1e-7 ? '=' : '≈'} ${n1(v)}`;
    /** Betrag eines Vektors: ganzzahlig oder als Wurzel. */
    const rt = (v: V3) => {
      const q = normSq(v);
      const r = Math.round(Math.sqrt(q));
      return Math.abs(r * r - q) < 1e-9 ? n1(r) : `√${n1(q)}`;
    };

    /* ---------------- Ziehen ---------------- */
    const r05 = (v: number, lim: number) => clamp(Math.round(v * 2) / 2, -lim, lim);
    const dragOk = () => !ctx.locked && !animating() && !edge;
    function handle(get: () => V3, apply: (q: V3) => void, color: () => string, on: () => boolean): void {
      view.addHandle({
        get: () => get() as Vec3,
        set: (q) => {
          lastDrag = performance.now();
          apply(q as V3);
        },
        get plane() {
          return view.camera.back;
        },
        enabled: () => dragOk() && on(),
        color,
      });
    }
    handle(() => gv('a'), (q) => ctx.set({ a1: r05(q[0], 5), a2: r05(q[1], 5), a3: r05(q[2], 5) }), CG, () => mode() === 'll' || mode() === 'lp');
    handle(
      () => add(gv('a'), gv('u')),
      (q) => {
        const a = tv('a');
        const u: V3 = [r05(q[0] - a[0], 6), r05(q[1] - a[1], 6), r05(q[2] - a[2], 6)];
        if (norm(u) > 0) ctx.set({ u1: u[0], u2: u[1], u3: u[2] });
      },
      CG,
      () => mode() === 'll' || mode() === 'lp',
    );
    handle(() => gv('b'), (q) => ctx.set({ b1: r05(q[0], 5), b2: r05(q[1], 5), b3: r05(q[2], 5) }), CH, () => mode() === 'll');
    handle(
      () => add(gv('b'), gv('v')),
      (q) => {
        const b = tv('b');
        const v: V3 = [r05(q[0] - b[0], 6), r05(q[1] - b[1], 6), r05(q[2] - b[2], 6)];
        if (norm(v) > 0) ctx.set({ v1: v[0], v2: v[1], v3: v[2] });
      },
      CH,
      () => mode() === 'll',
    );
    handle(() => gv('p'), (q) => ctx.set({ p1: r05(q[0], 5), p2: r05(q[1], 5), p3: r05(q[2], 5) }), CG, () => mode() === 'pd');

    /* ---------------- Zeichenhilfen ---------------- */
    const ppu = (at: V3) => Math.max(1e-6, view.pixelsPerUnit(at as Vec3));

    /** Beschriftung mit Schild an einem Weltpunkt, an den Rand der Szene geklemmt (frei von den Zoom-Knöpfen). */
    function tag(at: V3, label: string, color: string, o: { offset?: [number, number]; size?: number; math?: boolean; bg?: boolean; a?: number; align?: 'left' | 'right' | 'center'; arrow?: boolean } = {}): void {
      const a = o.a ?? 1;
      if (a < 0.02 || !label) return;
      view.custom(
        at as Vec3,
        (g) => {
          const R = regions().scene;
          const [x0, y0] = view.toPx(at as Vec3);
          const size = o.size ?? 13;
          g.save();
          g.globalAlpha = a;
          g.font = o.math ? mfont(size + 2) : font(750, size);
          const w = g.measureText(label).width;
          const align = o.align ?? 'left';
          let x = x0 + (o.offset?.[0] ?? 10);
          let y = y0 + (o.offset?.[1] ?? -12);
          let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
          const pad = 6;
          const minX = R.x + pad + 4;
          const maxX = R.x + R.w - pad - 4 - (y < R.y + 120 ? 46 : 0);
          if (left < minX) left = minX;
          if (left + w > maxX) left = maxX - w;
          y = clamp(y, R.y + size, R.y + R.h - size - 4);
          x = left;
          if (o.bg !== false) {
            roundRect(g, left - pad, y - size * 0.62 - 4, w + 2 * pad, size * 1.24 + 8, 8);
            g.fillStyle = alpha(cardBg(), 0.86);
            g.fill();
          } else {
            g.lineJoin = 'round';
            g.lineWidth = 4;
            g.strokeStyle = alpha(cardBg(), 0.9);
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            g.strokeText(label, x, y);
          }
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillStyle = color;
          g.fillText(label, x, y + 0.5);
          if (o.arrow) {
            // Vektorpfeil über dem Buchstaben
            const ay = y - size * 0.82;
            g.lineWidth = 3.5;
            g.strokeStyle = alpha(cardBg(), 0.9);
            g.beginPath();
            g.moveTo(x, ay);
            g.lineTo(x + w + 1, ay);
            g.stroke();
            g.lineWidth = 1.4;
            g.strokeStyle = color;
            g.beginPath();
            g.moveTo(x, ay);
            g.lineTo(x + w + 1, ay);
            g.moveTo(x + w - 2.5, ay - 2.5);
            g.lineTo(x + w + 1, ay);
            g.lineTo(x + w - 2.5, ay + 2.5);
            g.stroke();
          }
          g.restore();
        },
        'front',
      );
    }

    function arrowV(from: V3, to: V3, color: string, width = 3, a = 1, dash?: number[]): void {
      if (a < 0.01 || vec3.distance(from as Vec3, to as Vec3) < 1e-3) return;
      view.arrow(from as Vec3, to as Vec3, { color, width, head: 13, alpha: a, dash });
    }

    function ball(at: V3, color: string, a = 1, rPx = 7): void {
      if (a < 0.02) return;
      view.ball(at as Vec3, (rPx * a) / ppu(at), { color });
    }

    /** Rechter-Winkel-Zeichen in `at` zwischen den Richtungen u und v. */
    function rightAngle(at: V3, u: V3, v: V3, color: string, a = 1, px = 13): void {
      if (a < 0.02 || norm(u) < 1e-9 || norm(v) < 1e-9) return;
      const s = px / ppu(at);
      const uu = scale(normalize(u), s);
      const vv = scale(normalize(v), s);
      view.polyline([add(at, uu), add(add(at, uu), vv), add(at, vv)] as Vec3[], { color, width: 1.6, alpha: a });
    }

    /** Winkelbogen in `at` von Richtung u nach v (Radius in Pixeln) mit Fläche. */
    function angleArc(at: V3, u: V3, v: V3, rPx: number, color: string, a: number, label: string): void {
      if (a < 0.02) return;
      const nu = normalize(u);
      const nv = normalize(v);
      let w = sub(nv, scale(nu, dot(nu, nv)));
      if (norm(w) < 1e-6) return;
      w = normalize(w);
      const phi = Math.acos(clamp(dot(nu, nv), -1, 1)) * a;
      const r = rPx / ppu(at);
      const pts: V3[] = [at];
      const n = Math.max(6, Math.round(phi * 20));
      for (let i = 0; i <= n; i++) {
        const t = (phi * i) / n;
        pts.push(add(at, add(scale(nu, r * Math.cos(t)), scale(w, r * Math.sin(t)))));
      }
      view.face(pts as Vec3[], { color, alpha: 0.22 * a, flat: true, depthBias: 0.05 });
      view.polyline(pts.slice(1) as Vec3[], { color, width: 2, alpha: a, depthBias: 0.05 });
      if (label) {
        const mid = add(at, add(scale(nu, r * 1.7 * Math.cos(phi / 2)), scale(w, r * 1.7 * Math.sin(phi / 2))));
        tag(mid, label, color, { offset: [0, 0], align: 'center', size: 12, a });
      }
    }

    /** Gerade a + t · u, im Würfel um den Szenenmittelpunkt abgeschnitten, an den Enden ausgeblendet. */
    function drawLine(a: V3, u: V3, color: string, grow: number, o: { width?: number; dash?: number[]; alpha?: number; name?: string; nameSide?: number } = {}): void {
      if (grow < 0.01 || norm(u) < 1e-9) return;
      const C = gvec(frameG);
      const R = frameG[3]!.at(now);
      const clip = clipLineToBox(sub(a, C), u, R * 0.95);
      if (!clip) return;
      const [t0, t1] = clip;
      const tc = clamp(0, t0, t1);
      const lo = tc + (t0 - tc) * grow;
      const hi = tc + (t1 - tc) * grow;
      const N = 26;
      const fade = (t1 - t0) * 0.14;
      const base = o.alpha ?? 1;
      for (let i = 0; i < N; i++) {
        const s0 = lo + ((hi - lo) * i) / N;
        const s1 = lo + ((hi - lo) * (i + 1)) / N;
        const sm = (s0 + s1) / 2;
        const f = clamp(Math.min((sm - t0) / fade, (t1 - sm) / fade), 0, 1);
        view.segment(add(a, scale(u, s0)) as Vec3, add(a, scale(u, s1)) as Vec3, { color, width: o.width ?? 3.2, alpha: base * (0.15 + 0.85 * f), dash: o.dash, split: 1 });
      }
      if (o.name) {
        const at = add(a, scale(u, lo + (hi - lo) * 0.86));
        const [ax, ay] = view.toPx(a as Vec3);
        const [bx, by] = view.toPx(at as Vec3);
        const l = Math.hypot(bx - ax, by - ay) || 1;
        let nx = -(by - ay) / l;
        let ny = (bx - ax) / l;
        if (ny > 0) {
          nx = -nx;
          ny = -ny;
        }
        const side = o.nameSide ?? 1;
        tag(at, o.name, color, { offset: [nx * 16 * side - 5, ny * 16 * side], math: true, bg: false, size: 15, a: grow * base });
      }
    }

    /** Ebenenstück (Quadrat mit Gitter) um den Punkt `center` der Ebene n · x = c. */
    function drawPlane(n: V3, c: number, center: V3, color: string, grow: number, name: string, a = 1, nameCorner: [number, number] = [0.92, 0.92]): { c0: V3; e1: V3; e2: V3; h: number } | null {
      if (norm(n) < 1e-9 || grow < 0.01) return null;
      const [e1, e2] = planeBasis(n);
      const c0 = projectOntoPlane(center, n, c);
      const h = frameG[3]!.at(now) * 0.62 * grow;
      const dark = ctx.theme.dark;
      const N = 10;
      const P = (x: number, y: number): V3 => add(c0, add(scale(e1, x * h), scale(e2, y * h)));
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const x0 = -1 + (2 * i) / N;
          const y0 = -1 + (2 * j) / N;
          const x1 = x0 + 2 / N;
          const y1 = y0 + 2 / N;
          view.face([P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)] as Vec3[], { color, alpha: (dark ? 0.2 : 0.15) * a, flat: true });
        }
      }
      // Gitterlinien im Abstand 1 und Rand
      const soft = mixColor(color, ctx.theme.bg, 0.25);
      const steps = Math.floor(h);
      for (let q = -steps; q <= steps; q++) {
        if (q === 0) continue;
        const s = q / h;
        view.polyline([P(s, -1), P(s, 1)] as Vec3[], { color: soft, width: 0.8, alpha: 0.3 * a });
        view.polyline([P(-1, s), P(1, s)] as Vec3[], { color: soft, width: 0.8, alpha: 0.3 * a });
      }
      view.polyline([P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)] as Vec3[], { color, width: 1.6, alpha: 0.75 * a, closed: true });
      if (name) tag(P(nameCorner[0], nameCorner[1]), name, shade(color, ctx.theme.dark ? 0.1 : -0.15), { offset: [0, 0], align: 'center', math: true, bg: false, size: 15, a: grow * a });
      return { c0, e1, e2, h };
    }

    /* ---------------- Szene ---------------- */
    function drawScene(): void {
      const theme = ctx.theme;
      const C = gvec(frameG);
      const R = frameG[3]!.at(now);
      const narrow = regions().scene.w < 520;
      view.camera.distance = camDist.at(now);
      view.setScene({ target: C as Vec3, radius: R * (narrow ? 1.02 : 0.9), anchor: [0.5, 0.52] });
      view.begin();
      const grow = reduced ? 1 : ease.outCubic(clamp((now - introStart) / 700, 0, 1));
      const E = Math.ceil(R + 0.5);
      if (p.grid) view.grid({ min: [-E, -E], max: [E, E], step: 1, color: theme.gridMinor, fade: true });
      view.axes({ min: -E * grow, max: (E + 0.5) * grow, color: alpha(theme.axis, 0.75), width: 1.3 });
      const u0 = phase(0, 0.32);
      const res = showA.at(now);
      switch (mode()) {
        case 'll':
          sceneLL(u0, res);
          break;
        case 'lp':
          sceneLP(u0, res);
          break;
        case 'pp':
          scenePP(u0, res);
          break;
        default:
          scenePD(u0, res);
      }
      view.end();
    }

    function invalidTag(id: string, msg: string): void {
      const a = caseAlpha(id);
      if (a > 0.02) tag(gvec(frameG), msg, CR(), { offset: [0, 0], align: 'center', a });
    }

    function sceneLL(u0: number, res: number): void {
      const a = gv('a');
      const u = gv('u');
      const b = gv('b');
      const v = gv('v');
      const cg = CG();
      const ch = CH();
      const cr = CR();
      const u1 = phase(0.4, 0.8);
      const same = caseAlpha('ll:identical');
      drawLine(a, u, cg, u0, { name: 'g', nameSide: 1 });
      drawLine(b, v, ch, u0, { name: 'h', nameSide: -1, dash: same > 0.5 ? [9, 7] : undefined, width: same > 0.5 ? 3.6 : 3.2 });
      arrowV(a, add(a, u), cg, 2.6, u0 * 0.95);
      arrowV(b, add(b, v), ch, 2.6, u0 * 0.95);
      ball(a, cg, u0);
      ball(b, ch, u0);
      tag(a, 'A', cg, { offset: [-12, 14], align: 'right', a: u0 });
      tag(b, 'B', ch, { offset: [-12, 14], align: 'right', a: u0 });
      tag(add(a, scale(u, 0.6)), 'u', cg, { offset: [8, 14], math: true, bg: false, arrow: true, size: 13, a: u0 });
      tag(add(b, scale(v, 0.6)), 'v', ch, { offset: [-10, -10], align: 'right', math: true, bg: false, arrow: true, size: 13, a: u0 });
      const r = lineLine(a, u, b, v);
      // schneidend: Schnittpunkt und Winkel
      const ai = caseAlpha('ll:intersect') * u1;
      if (ai > 0.01 && !r.parallelDirs && r.kind !== 'invalid') {
        const S = vec3.lerp(r.footG as Vec3, r.footH as Vec3, 0.5) as V3;
        if (norm(sub(S, gvec(frameG))) < frameG[3]!.at(now) * 1.6) {
          const su = dot(u, v) < 0 ? scale(v, -1) : v;
          angleArc(S, u, su, 34, CW(), ai, res > 0.5 ? `φ = ${deg(lineLine(tv('a'), tv('u'), tv('b'), tv('v')).angleDeg)}` : 'φ');
          ball(S, cr, ease.outBack(clamp(ai, 0, 1)), 8);
          tag(S, res > 0.5 ? `S${pt(lineLine(tv('a'), tv('u'), tv('b'), tv('v')).point ?? S)}` : 'S', cr, { offset: [12, 16], a: ai });
        }
      }
      // windschief: kürzeste Verbindung mit Lotfußpunkten
      const as = caseAlpha('ll:skew') * u1;
      if (as > 0.01 && !r.parallelDirs && r.kind !== 'invalid') {
        const end = vec3.lerp(r.footG as Vec3, r.footH as Vec3, as) as V3;
        view.segment(r.footG as Vec3, end as Vec3, { color: cr, width: 3.6, alpha: Math.min(1, as * 1.5) });
        ball(r.footG, cr, as, 5.5);
        ball(end, cr, as, 5.5);
        if (as > 0.6) {
          const k = (as - 0.6) / 0.4;
          rightAngle(r.footG, u, sub(r.footH, r.footG), alpha(cr, 0.9), k);
          rightAngle(r.footH, v, sub(r.footG, r.footH), alpha(cr, 0.9), k);
          tag(r.footG, 'F₁', cr, { offset: [-12, 14], align: 'right', a: k, size: 12 });
          tag(r.footH, 'F₂', cr, { offset: [12, -12], a: k, size: 12 });
          const d = lineLine(tv('a'), tv('u'), tv('b'), tv('v')).distance;
          tag(vec3.lerp(r.footG as Vec3, r.footH as Vec3, 0.5) as V3, res > 0.5 ? `d ${eqv(d * k)}` : 'd', cr, { offset: [14, 0], a: k });
        }
      }
      // parallel: Abstand als Lot von B auf g
      const ap = caseAlpha('ll:parallel') * u1;
      if (ap > 0.01) {
        const f = footOnLine(b, a, u).point;
        const end = vec3.lerp(f as Vec3, b as Vec3, ap) as V3;
        view.segment(f as Vec3, end as Vec3, { color: cr, width: 3.4, alpha: Math.min(1, ap * 1.5) });
        ball(f, cr, ap, 5.5);
        if (ap > 0.6) {
          const k = (ap - 0.6) / 0.4;
          rightAngle(f, u, sub(b, f), alpha(cr, 0.9), k);
          const d = lineLine(tv('a'), tv('u'), tv('b'), tv('v')).distance;
          tag(vec3.lerp(f as Vec3, b as Vec3, 0.5) as V3, res > 0.5 ? `d ${eqv(d * k)}` : 'd', cr, { offset: [14, 0], a: k });
        }
      }
      if (same > 0.02) tag(add(a, scale(u, -0.9)), 'g = h', cr, { offset: [12, 18], a: same * u1 });
      invalidTag('ll:invalid', tt('Richtungsvektor 0: keine Gerade', 'Direction vector 0: not a line'));
    }

    function normalArrow(at: V3, n: V3, color: string, a: number, name: string, lenPx = 62, side = 1): void {
      if (a < 0.02 || norm(n) < 1e-9) return;
      const len = lenPx / ppu(at);
      const tip = add(at, scale(normalize(n), len * side * a));
      arrowV(at, tip, shade(color, ctx.theme.dark ? 0.1 : -0.2), 2.6, a);
      tag(tip, name, shade(color, ctx.theme.dark ? 0.1 : -0.2), { offset: [8, -6], math: true, bg: false, arrow: true, size: 13, a });
    }

    function sceneLP(u0: number, res: number): void {
      const a = gv('a');
      const u = gv('u');
      const n = gv('n');
      const c = gl.c!.at(now);
      const cg = CG();
      const ce = CE();
      const cr = CR();
      const u1 = phase(0.4, 0.8);
      const pl = drawPlane(n, c, gvec(cenE), ce, u0, 'E');
      const inP = caseAlpha('lp:inPlane');
      drawLine(a, u, cg, u0, { name: 'g', width: inP > 0.5 ? 4 : 3.2 });
      arrowV(a, add(a, u), cg, 2.6, u0 * 0.95);
      ball(a, cg, u0);
      tag(a, 'A', cg, { offset: [-12, 14], align: 'right', a: u0 });
      tag(add(a, scale(u, 0.6)), 'u', cg, { offset: [8, 14], math: true, bg: false, arrow: true, size: 13, a: u0 });
      const r = linePlane(a, u, n, c);
      const tr = linePlane(tv('a'), tv('u'), tv('n'), p.c);
      const nrm = nrmA.at(now);
      const ai = caseAlpha('lp:intersect') * u1;
      let normalShown = false;
      if (ai > 0.01 && r.point && norm(sub(r.point, gvec(frameG))) < frameG[3]!.at(now) * 1.6) {
        const D = r.point;
        // Projektion der Geraden in die Ebene und Schnittwinkel
        const nh = normalize(n);
        const proj = sub(u, scale(nh, dot(u, nh)));
        const side = dot(u, nh) >= 0 ? 1 : -1;
        if (norm(proj) > 1e-6 && pl) {
          const pd = normalize(proj);
          const ext = pl.h * 0.95;
          view.segment(add(D, scale(pd, -ext)) as Vec3, add(D, scale(pd, ext)) as Vec3, { color: shade(cg, ctx.theme.dark ? -0.1 : 0.25), width: 1.8, dash: [6, 5], alpha: 0.85 * ai });
          angleArc(D, scale(u, side), pd, 36, CW(), ai, res > 0.5 ? `φ = ${deg(tr.angleDeg)}` : 'φ');
        }
        normalArrow(D, n, ce, nrm * ai, 'n', 62, side);
        normalShown = nrm * ai > 0.5;
        ball(D, cr, ease.outBack(clamp(ai, 0, 1)), 8);
        tag(D, res > 0.5 && tr.point ? `D${pt(tr.point)}` : 'D', cr, { offset: [12, 16], a: ai });
      }
      const ap = caseAlpha('lp:parallel') * u1;
      if (ap > 0.01 && norm(n) > 1e-9) {
        const f = projectOntoPlane(a, n, c);
        const end = vec3.lerp(a as Vec3, f as Vec3, ap) as V3;
        view.segment(a as Vec3, end as Vec3, { color: cr, width: 3.4, alpha: Math.min(1, ap * 1.5) });
        if (ap > 0.6) {
          const k = (ap - 0.6) / 0.4;
          ball(f, cr, k, 5.5);
          rightAngle(f, u, sub(a, f), alpha(cr, 0.9), k);
          tag(vec3.lerp(a as Vec3, f as Vec3, 0.5) as V3, res > 0.5 ? `d ${eqv(tr.distance * k)}` : 'd', cr, { offset: [14, 0], a: k });
        }
      }
      if (inP > 0.02) tag(add(a, scale(u, -0.8)), tt('g liegt in E', 'g lies in E'), cr, { offset: [12, 18], a: inP * u1 });
      if (!normalShown && pl) normalArrow(add(pl.c0, add(scale(pl.e1, -pl.h * 0.6), scale(pl.e2, -pl.h * 0.6))), n, ce, nrm * u0, 'n');
      invalidTag('lp:invalid', tt('Nullvektor: keine Gerade bzw. Ebene', 'Zero vector: no line or plane'));
    }

    function scenePP(u0: number, res: number): void {
      const n = gv('n');
      const m = gv('m');
      const c = gl.c!.at(now);
      const k = gl.k!.at(now);
      const ce = CE();
      const cf = CF();
      const cr = CR();
      const u1 = phase(0.4, 0.8);
      const same = caseAlpha('pp:identical');
      const pe = drawPlane(n, c, gvec(cenE), ce, u0, 'E', 1, [0.92, 0.92]);
      const pf = drawPlane(m, k, gvec(cenF), cf, phase(0.08, 0.4), 'F', 1 - same * 0.55, [-0.92, 0.92]);
      const r = planePlane(n, c, m, k);
      const tr = planePlane(tv('n'), p.c, tv('m'), p.k);
      const nrm = nrmA.at(now);
      const ai = caseAlpha('pp:intersect') * u1;
      if (ai > 0.01 && r.point && r.dir && pe && pf) {
        // Schnittgerade s im Bereich beider Ebenenstücke
        const w = normalize(r.dir);
        const q0 = projectOntoPlane(gvec(cenE), n, c);
        const base = add(r.point, scale(w, dot(sub(q0, r.point), w)));
        let lo = -Infinity;
        let hi = Infinity;
        for (const pl of [pe, pf]) {
          for (const e of [pl.e1, pl.e2]) {
            const d = dot(w, e);
            const off = dot(sub(base, pl.c0), e);
            if (Math.abs(d) < 1e-9) continue;
            const t0 = (-pl.h - off) / d;
            const t1 = (pl.h - off) / d;
            lo = Math.max(lo, Math.min(t0, t1));
            hi = Math.min(hi, Math.max(t0, t1));
          }
        }
        if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) {
          const mid = (lo + hi) / 2;
          const s0 = mid + (lo - mid) * ai;
          const s1 = mid + (hi - mid) * ai;
          view.segment(add(base, scale(w, s0)) as Vec3, add(base, scale(w, s1)) as Vec3, { color: cr, width: 4, alpha: Math.min(1, ai * 1.4), depthBias: 0.02 });
          tag(add(base, scale(w, s1 * 0.9 + mid * 0.1)), 's', cr, { offset: [10, -12], math: true, bg: false, size: 15, a: ai });
          const P0 = add(base, scale(w, mid));
          const dE = normalize(cross(w, n));
          let dF = normalize(cross(w, m));
          if (dot(dE, dF) < 0) dF = scale(dF, -1);
          angleArc(P0, dE, dF, 40, CW(), ai, res > 0.5 ? `φ = ${deg(tr.angleDeg)}` : 'φ');
          view.segment(P0 as Vec3, add(P0, scale(dE, 52 / ppu(P0))) as Vec3, { color: shade(ce, -0.2), width: 1.6, alpha: ai });
          view.segment(P0 as Vec3, add(P0, scale(dF, 52 / ppu(P0))) as Vec3, { color: shade(cf, -0.2), width: 1.6, alpha: ai });
          rightAngle(P0, w, dE, alpha(ctx.theme.muted, 0.9), ai * 0.8, 10);
          normalArrow(add(P0, add(scale(dE, -pe.h * 0.55), scale(w, pe.h * 0.4))), n, ce, nrm * ai, 'n');
          normalArrow(add(P0, add(scale(dF, pf.h * 0.55), scale(w, -pf.h * 0.4))), m, cf, nrm * ai, 'm');
        }
      }
      const ap = caseAlpha('pp:parallel') * u1;
      if (ap > 0.01 && pe && norm(m) > 1e-9) {
        const a0 = pe.c0;
        const f = projectOntoPlane(a0, m, k);
        const end = vec3.lerp(a0 as Vec3, f as Vec3, ap) as V3;
        view.segment(a0 as Vec3, end as Vec3, { color: cr, width: 3.4, alpha: Math.min(1, ap * 1.5), depthBias: 0.02 });
        ball(a0, cr, ap, 5.5);
        if (ap > 0.6) {
          const kk = (ap - 0.6) / 0.4;
          ball(f, cr, kk, 5.5);
          tag(vec3.lerp(a0 as Vec3, f as Vec3, 0.5) as V3, res > 0.5 ? `d ${eqv(tr.distance * kk)}` : 'd', cr, { offset: [14, 0], a: kk });
          rightAngle(f, pe.e1, sub(a0, f), alpha(cr, 0.9), kk);
        }
      }
      if ((ap > 0.01 || same > 0.01) && pe) {
        normalArrow(add(pe.c0, scale(pe.e1, -pe.h * 0.6)), n, ce, nrm * u0 * Math.max(ap, same), 'n');
        if (pf) normalArrow(add(pf.c0, scale(pf.e1, pf.h * 0.6)), m, cf, nrm * u0 * Math.max(ap, same), 'm');
      }
      if (same > 0.02 && pe) tag(pe.c0, 'E = F', cr, { offset: [12, 18], a: same * u1 });
      invalidTag('pp:invalid', tt('Normalenvektor 0: keine Ebene', 'Normal vector 0: not a plane'));
    }

    function scenePD(u0: number, res: number): void {
      const n = gv('n');
      const c = gl.c!.at(now);
      const P = gv('p');
      const ce = CE();
      const cr = CR();
      const cp = CG();
      const pl = drawPlane(n, c, gvec(cenE), ce, u0, 'E');
      ball(P, cp, u0, 8);
      const r = pointPlane(P, n, c);
      const tr = pointPlane(tv('p'), tv('n'), p.c);
      tag(P, res > 0.5 ? `P${pt(tv('p'), n1)}` : 'P', cp, { offset: [12, -14], a: u0 });
      if (!r || !tr || !pl) {
        invalidTag('pd:invalid', tt('Normalenvektor 0: keine Ebene', 'Normal vector 0: not a plane'));
        return;
      }
      const l1 = phase(0.06, 0.3);
      const l2 = phase(0.3, 0.68);
      const l3 = phase(0.66, 0.82);
      const l4 = phase(0.8, 1);
      const F = r.foot;
      const nh = normalize(n);
      // Lotgerade x = p + t · n (gestrichelt)
      if (l1 > 0.01) {
        const ext = frameG[3]!.at(now) * 0.9;
        const dir = r.signed >= 0 ? -1 : 1;
        const far = Math.max(ext, r.distance * 2.2 + 1);
        view.segment(add(P, scale(nh, -dir * 1.2 * l1)) as Vec3, add(P, scale(nh, dir * far * l1)) as Vec3, { color: ctx.theme.muted, width: 1.4, dash: [5, 5], alpha: 0.75 * l1 });
        if (l1 > 0.9 && l2 < 0.05) tag(add(P, scale(nh, dir * 1.2)), tt('Lotgerade', 'perpendicular'), ctx.theme.muted, { offset: [12, 0], size: 11, a: 1 });
      }
      // Punkt wandert von P nach F
      if (l2 > 0.001) {
        const cur = vec3.lerp(P as Vec3, F as Vec3, l2) as V3;
        view.segment(P as Vec3, cur as Vec3, { color: cr, width: 3.6, depthBias: 0.02 });
        ball(cur, cr, Math.min(1, l2 * 4), 6);
      }
      if (l3 > 0.01) {
        const pop = ease.outBack(l3);
        ball(F, cr, pop, 7);
        if (r.distance > 0.05) rightAngle(F, pl.e1, sub(P, F), alpha(cr, 0.9), l3);
        if (r.distance > 0.05) tag(F, res > 0.5 ? `F${pt(tr.foot)}` : 'F', cr, { offset: [-12, 18], align: 'right', a: l3 });
        if (r.distance > 0.05) tag(vec3.lerp(P as Vec3, F as Vec3, 0.5) as V3, res > 0.5 ? `d ${eqv(tr.distance * l3)}` : 'd', cr, { offset: [14, 0], a: l3 });
        else tag(F, tt('P liegt in E: d = 0', 'P lies in E: d = 0'), cr, { offset: [12, -16], a: l3 });
      }
      // Spiegelpunkt P′ = P + 2 · PF
      const ma = mirA.at(now) * l4;
      if (ma > 0.01 && r.distance > 0.05) {
        const end = vec3.lerp(F as Vec3, r.mirror as Vec3, ma) as V3;
        view.segment(F as Vec3, end as Vec3, { color: cr, width: 2.6, dash: [7, 5], alpha: 0.85 });
        view.ball(end as Vec3, 7 / ppu(end), { color: mixColor(cp, ctx.theme.bg, 0.35) });
        tag(end, res > 0.5 ? `P′${pt(tr.mirror)}` : 'P′', cp, { offset: [12, 16], a: ma });
      }
      normalArrow(add(pl.c0, add(scale(pl.e1, pl.h * 0.7), scale(pl.e2, -pl.h * 0.7))), n, ce, nrmA.at(now) * u0, 'n', 62, r.signed >= 0 ? 1 : -1);
    }

    /* ---------------- Tafel ---------------- */
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

    type Tok = { kind: 'col'; v: (number | string)[]; color: string } | { kind: 'txt'; s: string; color?: string; math?: boolean; bold?: boolean } | { kind: 'vec'; s: string; color: string } | { kind: 'frac'; num: string; den: string; color?: string };
    const cell = (v: number | string) => (typeof v === 'number' ? n1(v) : v);

    function tokWidth(t: Tok, size: number): number {
      const g = surface.g;
      if (t.kind === 'col') {
        g.font = font(750, size);
        return Math.max(...t.v.map((v) => g.measureText(cell(v)).width)) + 2 * (size * 0.45) + 6;
      }
      if (t.kind === 'frac') {
        g.font = font(700, size);
        return Math.max(g.measureText(t.num).width, g.measureText(t.den).width) + 8;
      }
      g.font = t.kind === 'vec' || t.math ? mfont(size + 1) : font(t.bold ? 800 : 650, size);
      return g.measureText(t.s).width + (t.kind === 'txt' ? 6 : 4);
    }

    /** Zeichnet eine Zeile aus Bausteinen (Spaltenvektoren, Vektornamen, Brüche), verkleinert, bis sie passt. */
    function drawToks(toks: Tok[], x: number, y: number, maxW: number, size0: number): void {
      let size = size0;
      while (size > 9.5 && toks.reduce((s, t) => s + tokWidth(t, size), 0) > maxW) size -= 0.5;
      const g = surface.g;
      const theme = ctx.theme;
      let cx = x;
      for (const t of toks) {
        const w = tokWidth(t, size);
        if (t.kind === 'col') {
          const lh = size * 1.18;
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
          t.v.forEach((v, i) => text(g, cell(v), cx + w - bw - 3, y + (i - 1) * lh, { font: font(750, size), color: t.color, align: 'right' }));
        } else if (t.kind === 'frac') {
          const c = t.color ?? theme.text;
          text(g, t.num, cx + w / 2, y - size * 0.62, { font: font(700, size), color: c });
          text(g, t.den, cx + w / 2, y + size * 0.68, { font: font(700, size), color: c });
          g.strokeStyle = c;
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(cx + 2, y);
          g.lineTo(cx + w - 2, y);
          g.stroke();
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
        } else text(g, t.s, cx + w / 2, y, { font: t.math ? mfont(size + 1) : font(t.bold ? 800 : 650, size), color: t.color ?? theme.text });
        cx += w;
      }
    }

    /** Geradengleichung in Spaltenschreibweise. */
    const lineToks = (name: string, sup: V3, dir: V3, par: string, color: string): Tok[] => [
      { kind: 'txt', s: `${name}:`, math: true, color },
      { kind: 'vec', s: 'x', color: ctx.theme.text },
      { kind: 'txt', s: '=' },
      { kind: 'col', v: [...sup], color },
      { kind: 'txt', s: '+' },
      { kind: 'txt', s: par, math: true },
      { kind: 'txt', s: '·' },
      { kind: 'col', v: [...dir], color },
    ];
    const planeToks = (name: string, nv: V3, c: number, normal: string, color: string): Tok[] => [
      { kind: 'txt', s: `${name}:`, math: true, color },
      { kind: 'txt', s: coordForm(nv, c, n1), color, bold: true },
      { kind: 'txt', s: ' ' },
      { kind: 'vec', s: normal, color },
      { kind: 'txt', s: '=' },
      { kind: 'col', v: [...nv], color },
    ];

    /** Entscheidungsbaum: Fragen oben, Ergebnisse untereinander; der Pfad des aktuellen Falls leuchtet. Gibt die Höhe zurück. */
    function drawTree(x0: number, y0: number, w: number, lightT: number): number {
      const tr = tree();
      if (!tr) return 0;
      const g = surface.g;
      const theme = ctx.theme;
      const colW = w / 2 - 6;
      const rowY = [y0 + 11, y0 + 50, y0 + 80, y0 + 108];
      const colX = (c: TreeNode['col']) => (c === 'L' ? x0 : c === 'R' ? x0 + w / 2 + 6 : x0 + w / 4);
      const show = showA.at(now);
      const cur = currentCase().split(':')[1]!;
      const path = tr.paths[cur] ?? [];
      // Lichtlauf entlang des Pfads während der Animation
      const seq = (id: string) => {
        const i = path.indexOf(id);
        if (i < 0) return 1;
        return clamp((lightT - 0.16 - i * 0.16) / 0.12, 0, 1);
      };
      const lit = (id: string) => (nodeA.get(id)?.at(now) ?? 0) * show * seq(id);
      const hot = CR();
      const dim = alpha(theme.muted, 0.5);
      const byId = new Map(tr.nodes.map((nd) => [nd.id, nd]));
      /** Lage (Mitte bzw. linker Rand) und Breite eines Knotens. */
      const box = (nd: TreeNode): { x: number; y: number; w: number; size: number } => {
        const y = rowY[nd.row]!;
        let size = 11.5;
        g.font = font(nd.leaf ? 800 : 650, size);
        let tw = g.measureText(nd.text).width;
        const stacked = nd.leaf && nd.row >= 2;
        const maxW = stacked ? colW - 38 : nd.col === 'c' ? w : colW;
        while (tw + 16 > maxW && size > 10) {
          size -= 0.5;
          g.font = font(nd.leaf ? 800 : 650, size);
          tw = g.measureText(nd.text).width;
        }
        const bw = stacked ? maxW : Math.min(maxW, tw + 18);
        const left = stacked ? colX(nd.col) + 38 : nd.col === 'c' ? x0 + w / 2 - bw / 2 : colX(nd.col) + colW / 2 - bw / 2;
        return { x: left, y, w: bw, size };
      };
      const edgeLabel = (yes: boolean, x: number, y: number, l: number, align: 'left' | 'right' | 'center' = 'center') =>
        text(g, yes ? tt('ja', 'yes') : tt('nein', 'no'), x, y, { font: font(700, 10.5), color: l > 0.5 ? hot : theme.muted, align });
      // Kanten
      for (const nd of tr.nodes) {
        if (!nd.parent) continue;
        const par = byId.get(nd.parent)!;
        const pb = box(par);
        const nb = box(nd);
        const l = Math.min(lit(nd.id), lit(par.id));
        g.save();
        g.strokeStyle = mixColor(dim, hot, l);
        g.lineWidth = 1.3 + 1.5 * l;
        g.lineCap = 'round';
        g.beginPath();
        if (nd.leaf && nd.row >= 2) {
          // Stamm unter der Frage, Abzweig zum Ergebnis
          const sx = colX(nd.col) + 6;
          g.moveTo(sx, pb.y + 10);
          g.lineTo(sx, nb.y - 6);
          g.quadraticCurveTo(sx, nb.y, sx + 6, nb.y);
          g.lineTo(nb.x, nb.y);
          g.stroke();
          g.restore();
          edgeLabel(nd.yes ?? true, sx + 8, nb.y - 7, l, 'left');
        } else {
          const ax = x0 + w / 2 + (nb.x + nb.w / 2 < x0 + w / 2 ? -14 : 14);
          const bx = nb.x + nb.w / 2;
          g.moveTo(ax, pb.y + 10);
          g.bezierCurveTo(ax, pb.y + 24, bx, nb.y - 24, bx, nb.y - 10);
          g.stroke();
          g.restore();
          edgeLabel(nd.yes ?? true, bx + (bx < ax ? -7 : 7), nb.y - 17, l, bx < ax ? 'right' : 'left');
        }
      }
      // Knoten
      for (const nd of tr.nodes) {
        const b = box(nd);
        const l = lit(nd.id);
        const bh = 20;
        g.save();
        if (l > 0.02 && nd.leaf) {
          g.shadowColor = alpha(hot, 0.5 * l);
          g.shadowBlur = 12 * l;
        }
        roundRect(g, b.x, b.y - bh / 2, b.w, bh, 10);
        const base = nd.leaf ? alpha(mixColor(theme.muted, hot, l), (theme.dark ? 0.2 : 0.12) + 0.85 * l) : alpha(mixColor(theme.muted, hot, l), (theme.dark ? 0.16 : 0.09) + 0.08 * l);
        g.fillStyle = cardBg();
        g.fill();
        g.fillStyle = base;
        g.fill();
        g.shadowColor = 'transparent';
        g.strokeStyle = alpha(mixColor(theme.muted, hot, l), 0.35 + 0.6 * l);
        g.lineWidth = 1 + l;
        g.stroke();
        g.restore();
        const color = nd.leaf ? (l > 0.5 ? '#ffffff' : theme.text) : l > 0.5 ? (theme.dark ? shade(hot, 0.35) : shade(hot, -0.2)) : theme.text;
        text(g, nd.text, b.x + b.w / 2, b.y + 0.5, { font: font(nd.leaf ? 800 : 650, b.size), color });
      }
      return rowY[3]! - y0 + 12;
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
      let y = R.y + 22;
      const res = p.show;
      const q = (s: string) => (res ? s : '?');
      const titles: Record<Mode, string> = { ll: tt('Gerade – Gerade', 'Line – line'), lp: tt('Gerade – Ebene', 'Line – plane'), pp: tt('Ebene – Ebene', 'Plane – plane'), pd: tt('Abstand Punkt – Ebene', 'Distance point – plane') };
      text(g, titles[mode()], x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
      const cur = currentCase();
      const kindName: Record<string, string> = {
        'll:identical': tt('identisch', 'identical'),
        'll:parallel': tt('echt parallel', 'parallel'),
        'll:intersect': tt('schneiden sich', 'intersect'),
        'll:skew': tt('windschief', 'skew'),
        'lp:inPlane': tt('g liegt in E', 'g lies in E'),
        'lp:parallel': tt('g ∥ E', 'g ∥ E'),
        'lp:intersect': tt('g schneidet E', 'g intersects E'),
        'pp:identical': tt('E = F', 'E = F'),
        'pp:parallel': tt('E ∥ F', 'E ∥ F'),
        'pp:intersect': tt('Schnittgerade s', 'line s'),
      };
      if (res && kindName[cur]) text(g, kindName[cur]!, x0 + w, y, { font: font(800, 12), color: CR(), align: 'right' });
      y += 14;
      const row = (label: string, value: string, color = theme.text) => {
        if (y > R.y + R.h - 8) return;
        // bei Platzmangel beide Schriften verkleinern (nicht unter 10 px)
        let fs = 12;
        const fits = () => {
          g.font = font(600, fs);
          const lw = g.measureText(label).width;
          g.font = font(800, fs);
          return lw + g.measureText(value).width + 10 <= w;
        };
        while (fs > 10 && !fits()) fs -= 0.5;
        text(g, label, x0, y, { font: font(600, fs), color: theme.muted, align: 'left' });
        text(g, value, x0 + w, y, { font: font(800, fs), color, align: 'right' });
        y += 20;
      };
      const lightT = animating() ? (now - animStart) / animMs() : 1;
      const sz = wide ? 13.5 : 12;
      const eqRow = (toks: Tok[]) => {
        y += 32;
        drawToks(toks, x0, y, w, sz);
        y += 22;
      };
      const treeRow = () => {
        y += wide ? 12 : 8;
        y += drawTree(x0, y, w, lightT) + 10;
      };
      const a = tv('a');
      const u = tv('u');
      const n = tv('n');
      switch (mode()) {
        case 'll': {
          const b = tv('b');
          const v = tv('v');
          if (wide) {
            eqRow(lineToks('g', a, u, 't', CG()));
            eqRow(lineToks('h', b, v, 's', CH()));
          }
          treeRow();
          const r = lineLine(a, u, b, v);
          if (r.kind === 'intersect') {
            row(tt('Schnittpunkt S', 'Point S'), q(pt(r.point!)), CR());
            if (wide) row(tt('Parameter', 'Parameters'), q(`t = ${frac(r.t)}, s = ${frac(r.s)}`));
            row(tt('Schnittwinkel φ', 'Angle φ'), q(deg(r.angleDeg)), CW());
          } else if (r.kind === 'skew') {
            const nn = cross(u, v);
            row(tt('Abstand d', 'Distance d'), q(`${frac(Math.abs(dot(sub(b, a), nn)))} / ${rt(nn)} ${eqv(r.distance)}`), CR());
            if (wide) row('F₁ / F₂', q(`${pt(r.footG)} / ${pt(r.footH)}`));
            row(tt('Winkel der Richtungen', 'Angle of directions'), q(deg(r.angleDeg)), CW());
          } else if (r.kind === 'parallel' || r.kind === 'identical') {
            const kf = dot(v, u) / dot(u, u);
            row(tt('Richtungen', 'Directions'), `v = ${frac(kf)} · u`);
            row(r.kind === 'parallel' ? tt('Abstand d', 'Distance d') : tt('A liegt auf h', 'A lies on h'), r.kind === 'parallel' ? q(eqv(r.distance)) : q('✓'), CR());
          } else row(tt('Hinweis', 'Note'), tt('Richtungsvektor 0', 'direction vector 0'), CR());
          break;
        }
        case 'lp': {
          if (wide) {
            eqRow(lineToks('g', a, u, 't', CG()));
            eqRow(planeToks('E', n, p.c, 'n', CE()));
          }
          treeRow();
          const r = linePlane(a, u, n, p.c);
          if (r.kind === 'invalid') row(tt('Hinweis', 'Note'), tt('Nullvektor', 'zero vector'), CR());
          else {
            row('n · u', n1(dot(n, u)));
            if (r.kind === 'intersect') {
              if (wide) row(tt('Einsetzen', 'Substituting'), q(`${n1(dot(n, a))} ${dot(n, u) < 0 ? '−' : '+'} ${n1(Math.abs(dot(n, u)))}t = ${n1(p.c)} ⇒ t = ${frac(r.t)}`));
              row(tt('Durchstoßpunkt D', 'Point D'), q(pt(r.point!)), CR());
              row('φ: sin φ = |n·u| / (|n|·|u|)', q(deg(r.angleDeg)), CW());
            } else if (r.kind === 'parallel') row(tt('Abstand d', 'Distance d'), q(eqv(r.distance)), CR());
            else row(tt('A in E', 'A in E'), q(`${n1(dot(n, a))} = ${n1(p.c)} ✓`), CR());
          }
          break;
        }
        case 'pp': {
          const m = tv('m');
          if (wide) {
            eqRow(planeToks('E', n, p.c, 'n', CE()));
            eqRow(planeToks('F', m, p.k, 'm', CF()));
          }
          treeRow();
          const r = planePlane(n, p.c, m, p.k);
          if (r.kind === 'intersect') {
            row(tt('Richtung n × m', 'Direction n × m'), q(pt(r.dir!, n1)));
            if (wide) row(tt('Punkt von s', 'Point on s'), q(pt(r.point!)));
            row('φ: cos φ = |n·m| / (|n|·|m|)', q(deg(r.angleDeg)), CW());
          } else if (r.kind === 'parallel') {
            row(tt('Normalen', 'Normals'), `m = ${frac(dot(m, n) / dot(n, n))} · n`);
            row(tt('Abstand d', 'Distance d'), q(eqv(r.distance)), CR());
          } else if (r.kind === 'identical') {
            row(tt('Gleichungen', 'Equations'), tt('Vielfache voneinander', 'multiples of each other'));
          } else row(tt('Hinweis', 'Note'), tt('Normalenvektor 0', 'normal vector 0'), CR());
          break;
        }
        default: {
          const P = tv('p');
          const r = pointPlane(P, n, p.c);
          if (wide) {
            y += 18;
            text(g, `P${pt(P, n1)}`, x0, y, { font: font(800, 13), color: CG(), align: 'left' });
            eqRow(planeToks('E', n, p.c, 'n', CE()));
            y += 2;
          } else y += 8;
          if (!r) {
            row(tt('Hinweis', 'Note'), tt('Normalenvektor 0', 'normal vector 0'), CR());
            break;
          }
          // Hesse-Normalform als Bruch
          y += 24;
          const terms = n.map((c, i) => `${i === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${n1(Math.abs(c))}·${P[i]! < 0 ? `(${n1(P[i]!)})` : n1(P[i]!)}`).join('');
          const cTxt = p.c < 0 ? ` + ${n1(-p.c)}` : ` − ${n1(p.c)}`;
          const lenTxt = Number.isInteger(norm(n)) || Math.abs(norm(n) - Math.round(norm(n))) < 1e-9 ? n1(norm(n)) : `√${n1(normSq(n))}`;
          drawToks([{ kind: 'txt', s: 'd(P; E) =', bold: true }, { kind: 'frac', num: `|${terms}${cTxt}|`, den: lenTxt }], x0, y, w, wide ? 13 : 12);
          y += 40;
          drawToks(
            [
              { kind: 'txt', s: '=' },
              { kind: 'frac', num: q(`|${n1(r.value)}|`), den: lenTxt },
              { kind: 'txt', s: q(eqv(r.distance)), color: CR(), bold: true },
            ],
            x0 + 52,
            y,
            w - 52,
            wide ? 13 : 12,
          );
          y += 32;
          row(tt('Abstand d(P; E)', 'Distance d(P; E)'), q(r.onPlane ? tt('0 (P liegt in E)', '0 (P lies in E)') : `${eqv(r.distance).replace('= ', '')} ${tt('LE', 'units')}`), CR());
          if (wide) row(tt('Lotgerade', 'Perpendicular'), `x = p + t · n`);
          row(tt('Lotfußpunkt F', 'Foot F'), q(`${pt(r.foot)}${wide && w > 270 ? `, t = ${frac(r.t)}` : ''}`), CR());
          if (p.mir) row(tt('Spiegelpunkt P′', 'Mirror point P′'), q(pt(r.mirror)), CG());
        }
      }
      g.restore();
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const a = tv('a');
      const u = tv('u');
      const n = tv('n');
      switch (mode()) {
        case 'll': {
          const b = tv('b');
          const v = tv('v');
          const r = lineLine(a, u, b, v);
          const nn = cross(u, v);
          const lage: Record<string, string> = {
            identical: tt('g und h sind identisch.', 'g and h are identical.'),
            parallel: tt('g und h sind echt parallel.', 'g and h are parallel (distinct).'),
            intersect: tt('g und h schneiden sich.', 'g and h intersect.'),
            skew: tt('g und h sind windschief.', 'g and h are skew.'),
            invalid: tt('Ein Richtungsvektor ist der Nullvektor.', 'A direction vector is the zero vector.'),
          };
          ctx.readout('lage', lage[r.kind]!);
          if (r.kind === 'intersect') {
            ctx.readout('calc', `a + t · u = b + s · v ⇒ t = ${frac(r.t)}, s = ${frac(r.s)}`);
            ctx.readout('res', `S${pt(r.point!)}, φ = ${deg(r.angleDeg)}`);
          } else if (r.kind === 'skew') {
            ctx.readout('calc', `u × v = ${pt(nn, n1)}, (b − a) · (u × v) = ${n1(dot(sub(b, a), nn))} ≠ 0`);
            ctx.readout('res', `d = |${n1(dot(sub(b, a), nn))}| / ${n1(norm(nn))} ≈ ${n1(r.distance)} · F₁${pt(r.footG)}, F₂${pt(r.footH)}`);
          } else if (r.kind === 'parallel' || r.kind === 'identical') {
            ctx.readout('calc', tt(`v = ${frac(dot(v, u) / dot(u, u))} · u; A ${r.kind === 'identical' ? 'liegt' : 'liegt nicht'} auf h`, `v = ${frac(dot(v, u) / dot(u, u))} · u; A ${r.kind === 'identical' ? 'lies' : 'does not lie'} on h`));
            ctx.readout('res', r.kind === 'parallel' ? `d = |(b − a) × u| / |u| ${eqv(r.distance)}` : tt('d = 0', 'd = 0'));
          } else {
            ctx.readout('calc', null);
            ctx.readout('res', null);
          }
          break;
        }
        case 'lp': {
          const r = linePlane(a, u, n, p.c);
          const lage: Record<string, string> = {
            inPlane: tt('g liegt in E.', 'g lies in E.'),
            parallel: tt('g ist echt parallel zu E.', 'g is parallel to E.'),
            intersect: tt('g schneidet E im Durchstoßpunkt D.', 'g intersects E at D.'),
            invalid: tt('Nullvektor: keine Gerade bzw. Ebene.', 'Zero vector: no line or plane.'),
          };
          ctx.readout('lage', lage[r.kind]!);
          if (r.kind === 'intersect') {
            ctx.readout('calc', `n · u = ${n1(r.nu)} ≠ 0; ${n1(dot(n, a))} + ${n1(r.nu)} · t = ${n1(p.c)} ⇒ t = ${frac(r.t)}`);
            ctx.readout('res', `D${pt(r.point!)}, sin φ = ${n1(Math.abs(r.nu))} / (${rt(n)} · ${rt(u)}), φ ≈ ${deg(r.angleDeg)}`);
          } else if (r.kind === 'invalid') {
            ctx.readout('calc', null);
            ctx.readout('res', null);
          } else {
            ctx.readout('calc', `n · u = 0; n · a = ${n1(dot(n, a))} ${r.kind === 'inPlane' ? '=' : '≠'} ${n1(p.c)}`);
            ctx.readout('res', r.kind === 'parallel' ? `d = |${n1(dot(n, a))} − ${n1(p.c)}| / ${rt(n)} ${eqv(r.distance)}` : 'd = 0');
          }
          break;
        }
        case 'pp': {
          const m = tv('m');
          const r = planePlane(n, p.c, m, p.k);
          const lage: Record<string, string> = {
            identical: tt('E und F sind identisch.', 'E and F are identical.'),
            parallel: tt('E und F sind echt parallel.', 'E and F are parallel (distinct).'),
            intersect: tt('E und F schneiden sich in einer Geraden s.', 'E and F intersect in a line s.'),
            invalid: tt('Normalenvektor 0: keine Ebene.', 'Normal vector 0: not a plane.'),
          };
          ctx.readout('lage', lage[r.kind]!);
          if (r.kind === 'intersect') {
            ctx.readout('calc', `n × m = ${pt(r.dir!, n1)} ≠ 0`);
            ctx.readout('res', `s: x = ${pt(r.point!)} + t · ${pt(r.dir!, n1)}, φ ≈ ${deg(r.angleDeg)}`);
          } else if (r.kind === 'invalid') {
            ctx.readout('calc', null);
            ctx.readout('res', null);
          } else {
            ctx.readout('calc', `m = ${frac(dot(m, n) / dot(n, n))} · n`);
            ctx.readout('res', r.kind === 'parallel' ? `d ${eqv(r.distance)}` : 'd = 0');
          }
          break;
        }
        default: {
          const P = tv('p');
          const r = pointPlane(P, n, p.c);
          if (!r) {
            ctx.readout('lage', tt('Normalenvektor 0: keine Ebene.', 'Normal vector 0: not a plane.'));
            ctx.readout('calc', null);
            ctx.readout('res', null);
            break;
          }
          ctx.readout('lage', r.onPlane ? tt('P liegt in E.', 'P lies in E.') : r.signed > 0 ? tt('P liegt auf der Seite, in die n zeigt.', 'P lies on the side n points to.') : tt('P liegt auf der Seite, die n abgewandt ist.', 'P lies on the side away from n.'));
          ctx.readout('calc', `d(P; E) = |n · p − c| / |n| = |${n1(r.value)}| / ${rt(n)}`);
          ctx.readout('res', `d ${eqv(r.distance)}, F${pt(r.foot)}${p.mir ? `, P′${pt(r.mirror)}` : ''}`);
        }
      }
    }

    function updateActions(): void {
      ctx.setAction('play', { label: mode() === 'pd' ? tt('Lot fällen', 'Drop the perpendicular') : tt('Animation abspielen', 'Play animation') });
      const d = edgeDir();
      ctx.setAction('cam', { label: edge ? tt('Zurück zur Schrägansicht', 'Back to oblique view') : (d?.label ?? tt('Blick auf die Kante', 'Edge-on view')), enabled: edge || d !== null });
    }

    retarget(true);
    updateReadouts();
    updateActions();

    return {
      update(changed, source) {
        now = performance.now();
        if ((changed.has('mode') || source === 'replace') && source !== 'init') {
          animStart = reduced ? now - 1e6 : now + 80;
          if (edge) setEdge(false);
        }
        if (changed.has('mir') && p.mir && source === 'input' && mode() === 'pd' && !animating()) animStart = reduced ? now - 1e6 : now - animMs() * 0.8;
        retarget(source === 'init');
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'play') animStart = reduced ? now - 1e6 : now;
        else if (id === 'cam') setEdge(!edge);
        ctx.requestRender();
      },
      resetView: () => {
        if (edge) {
          edge = false;
          camDist.go(6, 700);
          updateActions();
        }
        view.resetView(true);
      },
      render() {
        now = performance.now();
        // Wer in der Kantenansicht selbst dreht, verlässt sie
        if (edge && now - edgeT0 > 1200 && (Math.abs(view.camera.elevation - edgeView.el) > 4 || Math.abs(((((view.camera.azimuth - edgeView.az) % 360) + 540) % 360) - 180) > 4)) {
          edge = false;
          camDist.go(6, 700);
          updateActions();
        }
        surface.begin();
        view.resize();
        drawScene();
        drawPanel();
        const glides = [...Object.values(gl), nrmA, mirA, showA, ...frameG, ...cenE, ...cenF, camDist, ...caseA.values(), ...nodeA.values()];
        const busy = glides.some((x) => x.busy(now)) || animating() || (!reduced && now - introStart < 900) || now - edgeT0 < 1300;
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
