import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import {
  clipLineToBox,
  COORD_PLANES,
  coordinateFormText,
  cross,
  dot,
  isZero,
  linePoint,
  lineTraces,
  norm,
  planeBoxPolygon,
  planeForms,
  planeIntercepts,
  planePoint,
  probeLine,
  probePlane,
  solvePlaneParams,
  traceLine,
  traceTriangle,
  type V3,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Mode = 'line' | 'param' | 'normal';

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

const coord = <K extends string>(key: K, label: string, def: number, range: number, group: string, show?: (v: Record<string, unknown>) => boolean) => ({
  key,
  type: 'number' as const,
  group,
  label: L(label, label),
  min: -range,
  max: range,
  step: 0.5,
  default: def,
  visibleIf: show,
});

const notLine = (v: Record<string, unknown>) => v.mode !== 'line';
const probeOn = (v: Record<string, unknown>) => v.mode !== 'param' && v.probe === true;

/** Startwerte je Ansicht (beim Umschalten von Hand). */
const LINE_START = { a1: 1, a2: 2, a3: 3, u1: 2, u2: -1, u3: 1, t: 1.5, q1: -1, q2: 3, q3: 2 };
const PLANE_START = { a1: 3, a2: 1, a3: 0.5, u1: -3, u2: 2, u3: 0, v1: -3, v2: 0, v3: 1, r: 1.5, s: 0.5, q1: 3, q2: 0, q3: 1 };

/**
 * Geraden und Ebenen im Raum: Gerade in Parameterform mit laufendem Punkt X,
 * Pfeilkette a + t·u, Spurpunkten und Punktprobe; Ebene in Parameterform als
 * Parallelogramm mit Parametergitter; Umrechnung in Normalen- und
 * Koordinatenform Schritt für Schritt mit Normalenvektor, Spurpunkten,
 * Spurgeraden und Spurdreieck. Kamera drehbar, Rundflug.
 */
export default defineSimulation({
  id: 'geraden-ebenen',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  groups: [
    { id: 'vec', label: L('Stützpunkt und Richtungen', 'Point and directions') },
    { id: 'probe', label: L('Punktprobe', 'Point test') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'line', label: L('Gerade', 'Line') },
        { value: 'param', label: L('Ebene (Parameterform)', 'Plane (parametric form)') },
        { value: 'normal', label: L('Normalen-/Koordinatenform', 'Normal/coordinate form') },
      ],
      default: 'line',
    },
    { key: 't', type: 'number', label: L('Parameter t', 'Parameter t'), min: -4, max: 4, step: 0.25, default: 1.5, visibleIf: (v) => v.mode === 'line' },
    { key: 'r', type: 'number', label: L('Parameter r', 'Parameter r'), min: -3, max: 3, step: 0.25, default: 1.5, visibleIf: (v) => v.mode === 'param' },
    { key: 's', type: 'number', label: L('Parameter s', 'Parameter s'), min: -3, max: 3, step: 0.25, default: 0.5, visibleIf: (v) => v.mode === 'param' },
    { ...coord('a1', 'a₁', 1, 8, 'vec'), help: L('Ortsvektor a des Stützpunkts A', 'Position vector a of the point A') },
    coord('a2', 'a₂', 2, 8, 'vec'),
    coord('a3', 'a₃', 3, 8, 'vec'),
    { ...coord('u1', 'u₁', 2, 5, 'vec'), help: L('Richtungsvektor u (bei der Ebene: erster Spannvektor)', 'Direction vector u (for the plane: first spanning vector)') },
    coord('u2', 'u₂', -1, 5, 'vec'),
    coord('u3', 'u₃', 1, 5, 'vec'),
    { ...coord('v1', 'v₁', -3, 5, 'vec', notLine), help: L('Zweiter Spannvektor v der Ebene', 'Second spanning vector v of the plane') },
    coord('v2', 'v₂', 0, 5, 'vec', notLine),
    coord('v3', 'v₃', 1, 5, 'vec', notLine),
    { key: 'probe', type: 'boolean', group: 'probe', label: L('Punktprobe mit P', 'Point test with P'), default: false, visibleIf: (v) => v.mode !== 'param' },
    coord('q1', 'p₁', -1, 8, 'probe', probeOn),
    coord('q2', 'p₂', 3, 8, 'probe', probeOn),
    coord('q3', 'p₃', 2, 8, 'probe', probeOn),
    { key: 'trace', type: 'boolean', group: 'view', label: L('Spurpunkte und Spurgeraden', 'Trace points and trace lines'), default: true },
    { key: 'chain', type: 'boolean', group: 'view', label: L('Pfeilkette zum Punkt X', 'Arrow chain to the point X'), default: true, visibleIf: (v) => v.mode !== 'normal' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnisse anzeigen', 'Show results'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Animation abspielen', 'Play animation'), primary: true, visibleIf: (v) => v.mode !== 'normal' },
    { id: 'convert', label: L('Umrechnen', 'Convert'), primary: true, visibleIf: (v) => v.mode === 'normal' },
    { id: 'tour', label: L('Rundflug', 'Fly around') },
  ],
  readouts: [
    { key: 'eq', label: L('Gleichung', 'Equation') },
    { key: 'pt', label: L('Punkt X', 'Point X'), spoiler: true },
    { key: 'n', label: L('Normalenvektor', 'Normal vector'), spoiler: true },
    { key: 'cf', label: L('Koordinatenform', 'Coordinate form'), spoiler: true },
    { key: 'trace', label: L('Spurpunkte', 'Trace points'), spoiler: true },
    { key: 'probe', label: L('Punktprobe', 'Point test'), spoiler: true },
    { key: 'info', label: L('Hinweis', 'Note') },
  ],
  presets: [
    { id: 'start', label: L('Gerade g: Punkt X läuft', 'Line g: point X moves'), values: {} },
    { id: 'probe', label: L('Punktprobe: Q(3 | 1 | 5)', 'Point test: Q(3, 1, 5)'), values: { probe: true, q1: 3, q2: 1, q3: 5 } },
    { id: 'axis', label: L('Gerade parallel zur x₃-Achse', 'Line parallel to the x₃ axis'), values: { a1: 2, a2: 3, a3: 1, u1: 0, u2: 0, u3: 1, t: 1.5 } },
    { id: 'param', label: L('Ebene in Parameterform', 'Plane in parametric form'), values: { mode: 'param', ...PLANE_START } },
    { id: 'normal', label: L('Umrechnen: 2x₁ + 3x₂ + 6x₃ = 12', 'Convert: 2x₁ + 3x₂ + 6x₃ = 12'), values: { mode: 'normal', ...PLANE_START } },
    { id: 'flat', label: L('Ebene parallel zur x₁x₂-Ebene', 'Plane parallel to the x₁x₂ plane'), values: { mode: 'normal', a1: 0, a2: 0, a3: 3, u1: 2, u2: 0, u3: 0, v1: 0, v2: 2, v3: 0, q1: 3, q2: 0, q3: 1 } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit einer Geraden in Parameterform (Punkt X, Pfeilkette, Spurpunkte) oder einer Ebene als Parallelogramm, Spurdreieck und Normalenvektor; Punkte ziehbar, Ansicht drehbar' },
    en: { canvas: 'Three-dimensional coordinate system with a line in parametric form (point X, arrow chain, trace points) or a plane shown as a parallelogram, trace triangle and normal vector; draggable points, rotatable view' },
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
      if (wide) {
        const pw = W < 600 ? Math.round(clamp(W * 0.43, 190, 260)) : Math.round(clamp(W * 0.33, 250, 345));
        const need = mode() === 'normal' ? 440 : mode() === 'line' ? (p.probe ? 400 : 360) : 330;
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: Math.min(H - 12, need) } };
      }
      const need = mode() === 'normal' ? (p.probe ? 258 : 236) : mode() === 'line' ? (p.probe ? 246 : 200) : 206;
      const ph = Math.round(Math.min(clamp(H * 0.45, 180, 262), need));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 28, elevation: 20, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene });

    /* ---------------- Zustand ---------------- */
    const ga = [G(p.a1), G(p.a2), G(p.a3)];
    const gu = [G(p.u1), G(p.u2), G(p.u3)];
    const gv = [G(p.v1), G(p.v2), G(p.v3)];
    const gq = [G(p.q1), G(p.q2), G(p.q3)];
    const gt = G(p.t);
    const gr = G(p.r);
    const gs = G(p.s);
    const traceA = G(p.trace ? 1 : 0);
    const chainA = G(p.chain ? 1 : 0);
    const probeA = G(p.probe ? 1 : 0);
    const extent = G(5);
    const zNeg = G(3);
    let now = performance.now();
    const introStart = now + (reduced ? -1e6 : 100);
    let animStart = now + (reduced ? -1e6 : 250);
    let lastMode: Mode = mode();
    let lastDrag = -1e9;
    let tourStart = -1;
    let tourFrom = { az: 28, el: 20 };
    const TOUR_MS = 6000;

    const A = (): V3 => [ga[0]!.at(now), ga[1]!.at(now), ga[2]!.at(now)];
    const U = (): V3 => [gu[0]!.at(now), gu[1]!.at(now), gu[2]!.at(now)];
    const Vv = (): V3 => [gv[0]!.at(now), gv[1]!.at(now), gv[2]!.at(now)];
    const Q = (): V3 => [gq[0]!.at(now), gq[1]!.at(now), gq[2]!.at(now)];
    const tA = (): V3 => [p.a1, p.a2, p.a3];
    const tU = (): V3 => [p.u1, p.u2, p.u3];
    const tV = (): V3 => [p.v1, p.v2, p.v3];
    const tQ = (): V3 => [p.q1, p.q2, p.q3];

    const animMs = () => (mode() === 'normal' ? 4600 : mode() === 'param' ? 3000 : 2700);
    function phase(from: number, to: number): number {
      const t = (now - animStart) / animMs();
      return ease.inOutCubic(clamp((t - from) / (to - from), 0, 1));
    }
    const animating = () => now - animStart < animMs() + 100;

    /** Normalenvektor für die Anzeige: höchstens 3,5 lang (sonst verkürzt). */
    function shownNormal(n: V3): { v: V3; short: boolean } {
      const l = norm(n);
      if (l < 1e-9) return { v: n, short: false };
      if (l <= 3.5) return { v: n, short: false };
      return { v: vec3.scale(n as Vec3, 3 / l) as V3, short: true };
    }

    /** Wichtige Punkte (aktuelle Lage), die keine Beschriftung verdecken soll. */
    function keyPoints(): Vec3[] {
      const a = A();
      const out: Vec3[] = [a as Vec3, [0, 0, 0]];
      if (mode() === 'line') {
        out.push(linePoint(a, U(), gt.at(now)) as Vec3);
        if (p.trace) for (const s of lineTraces(tA(), tU())) if (s.kind === 'point') out.push(s.p as Vec3);
      } else if (mode() === 'param') out.push(planePoint(a, U(), Vv(), gr.at(now), gs.at(now)) as Vec3);
      else {
        const f = planeForms(tA(), tU(), tV());
        if (f.ok && p.trace) for (const s of planeIntercepts(f.n, f.d)) if (s.kind === 'point') out.push(s.p as Vec3);
      }
      if (p.probe && mode() !== 'param') out.push(Q() as Vec3);
      return out;
    }

    function retarget(snap = false): void {
      const ms = performance.now() - lastDrag < 200 ? 110 : 520;
      const set = (g: Glide, v: number) => (snap ? g.snap(v) : g.go(v, ms));
      tA().forEach((v, i) => set(ga[i]!, v));
      tU().forEach((v, i) => set(gu[i]!, v));
      tV().forEach((v, i) => set(gv[i]!, v));
      tQ().forEach((v, i) => set(gq[i]!, v));
      set(gt, p.t);
      set(gr, p.r);
      set(gs, p.s);
      set(traceA, p.trace ? 1 : 0);
      set(chainA, p.chain ? 1 : 0);
      set(probeA, p.probe ? 1 : 0);
      // Achsenlänge passend zu allen wichtigen Punkten
      const a = tA();
      const pts: V3[] = [a];
      if (mode() === 'line') {
        pts.push(linePoint(a, tU(), p.t));
        if (p.trace) for (const s of lineTraces(a, tU())) if (s.kind === 'point') pts.push(s.p);
      } else {
        pts.push(vec3.add(a as Vec3, tU() as Vec3) as V3, vec3.add(a as Vec3, tV() as Vec3) as V3);
        if (mode() === 'param') pts.push(planePoint(a, tU(), tV(), p.r, p.s));
        const f = planeForms(a, tU(), tV());
        if (mode() === 'normal' && f.ok) {
          pts.push(vec3.add(a as Vec3, shownNormal(f.n).v as Vec3) as V3);
          if (p.trace) for (const s of planeIntercepts(f.n, f.d)) if (s.kind === 'point') pts.push(s.p);
        }
      }
      if (p.probe && mode() !== 'param') pts.push(tQ());
      // A und X immer im Bild (X bis 13), Spurpunkte nur bis 9,5
      const must: V3[] = [a];
      if (mode() === 'line') must.push(linePoint(a, tU(), p.t));
      if (mode() === 'param') must.push(planePoint(a, tU(), tV(), p.r, p.s));
      const lim = (q: V3, m: number) => q.every((v) => Math.abs(v) <= m);
      const use = [...must.filter((q) => lim(q, 13)), ...pts.filter((q) => lim(q, 9.5))];
      const m = Math.max(3.5, ...use.flatMap((q) => q.map((v) => Math.abs(v))));
      const E = clamp(Math.ceil(m + 0.8), 4, 13);
      set(extent, E);
      const lowZ = Math.min(0, ...use.map((q) => q[2]));
      set(zNeg, clamp(Math.ceil(-lowZ + 1.5), 2.5, E));
    }

    /* ---------------- Farben, Texte ---------------- */
    const CA = () => ctx.theme.series[0]!;
    const CX = () => ctx.theme.series[1]!;
    const CV = () => ctx.theme.series[2]!;
    const CU = () => ctx.theme.series[3]!;
    const CN = () => ctx.theme.series[4]!;
    const CG = () => ctx.theme.series[5]!;
    const OK = () => ctx.theme.series[2]!;
    const BAD = () => ctx.theme.series[1]!;
    const n2 = (v: number) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, 2);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mfont = (s: number) => `italic 700 ${s}px ${ctx.theme.mathFont}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const sep = lang === 'de' ? ' | ' : ', ';
    const pt = (q: V3) => `(${n2(q[0])}${sep}${n2(q[1])}${sep}${n2(q[2])})`;
    const planeName = (i: number) => COORD_PLANES[i]!.name;
    const traceName = (i: number) => ['S₁₂', 'S₂₃', 'S₁₃'][i]!;

    /* ---------------- Ziehen ---------------- */
    const r05 = (v: number, m: number) => clamp(Math.round(v * 2) / 2, -m, m);
    const r025 = (v: number, m: number) => clamp(Math.round(v * 4) / 4, -m, m);
    const dragged = () => (lastDrag = performance.now());
    const free = () => !ctx.locked && !animating() && tourStart < 0;
    const screen = () => view.camera.back;
    // Stützpunkt A
    view.addHandle({
      get: () => A() as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ a1: r05(q[0], 8), a2: r05(q[1], 8), a3: r05(q[2], 8) });
      },
      get plane() {
        return screen();
      },
      enabled: free,
      color: () => CA(),
    });
    // Spitze von u (an A angehängt)
    view.addHandle({
      get: () => vec3.add(A() as Vec3, U() as Vec3),
      set: (q) => {
        dragged();
        const a = tA();
        ctx.set({ u1: r05(q[0] - a[0], 5), u2: r05(q[1] - a[1], 5), u3: r05(q[2] - a[2], 5) });
      },
      get plane() {
        return screen();
      },
      enabled: () => free() && (mode() !== 'line' || Math.abs(p.t - 1) > 0.2),
      color: () => CU(),
    });
    // Spitze von v
    view.addHandle({
      get: () => vec3.add(A() as Vec3, Vv() as Vec3),
      set: (q) => {
        dragged();
        const a = tA();
        ctx.set({ v1: r05(q[0] - a[0], 5), v2: r05(q[1] - a[1], 5), v3: r05(q[2] - a[2], 5) });
      },
      get plane() {
        return screen();
      },
      enabled: () => free() && mode() !== 'line',
      color: () => CV(),
    });
    // Punkt X auf der Geraden (entlang u)
    view.addHandle({
      get: () => linePoint(A(), U(), gt.at(now)) as Vec3,
      set: (q) => {
        dragged();
        const u = tU();
        const uu = dot(u, u);
        if (uu < 1e-9) return;
        ctx.set({ t: r025(dot(vec3.sub(q, tA() as Vec3) as V3, u) / uu, 4) });
      },
      get axis() {
        return isZero(U()) ? ([1, 0, 0] as Vec3) : (U() as Vec3);
      },
      enabled: () => free() && mode() === 'line' && !isZero(tU()),
      color: () => CX(),
    });
    // Punkt X in der Ebene
    view.addHandle({
      get: () => planePoint(A(), U(), Vv(), gr.at(now), gs.at(now)) as Vec3,
      set: (q) => {
        dragged();
        const rs = solvePlaneParams(tA(), tU(), tV(), q as V3);
        if (rs) ctx.set({ r: r025(rs.r, 3), s: r025(rs.s, 3) });
      },
      get plane() {
        const n = cross(U(), Vv());
        return isZero(n) ? screen() : (vec3.normalize(n as Vec3) as Vec3);
      },
      enabled: () => free() && mode() === 'param' && planeForms(tA(), tU(), tV()).ok,
      color: () => CX(),
    });
    // Probepunkt P
    view.addHandle({
      get: () => Q() as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ q1: r05(q[0], 8), q2: r05(q[1], 8), q3: r05(q[2], 8) });
      },
      get plane() {
        return screen();
      },
      enabled: () => free() && p.probe && mode() !== 'param',
      color: () => ctx.theme.text,
    });

    /* ---------------- Zeichenhilfen ---------------- */
    const O: Vec3 = [0, 0, 0];

    /* ---- Beschriftungen ohne Überlappung: erst sammeln, dann nach Rang platzieren ---- */
    type Box = { x: number; y: number; w: number; h: number };
    let placed: Box[] = [];
    let queue: { prio: number; run: () => void }[] = [];
    const hits = (b: Box) => placed.some((q) => b.x < q.x + q.w && b.x + b.w > q.x && b.y < q.y + q.h && b.y + b.h > q.y);
    function inside(b: Box): boolean {
      const R = regions().scene;
      return b.x >= R.x + 4 && b.x + b.w <= R.x + R.w - 4 && b.y >= R.y + 4 && b.y + b.h <= R.y + R.h - 24;
    }
    /** Bereiche, die frei bleiben: Zoom-Knöpfe, Dreh-Hinweis und wichtige Punkte. */
    function resetLabels(keep: Vec3[]): void {
      const R = regions().scene;
      placed = [
        { x: R.x + R.w - 50, y: R.y, w: 50, h: 126 },
        { x: R.x, y: R.y + R.h - 26, w: 150, h: 26 },
      ];
      for (const q of keep) {
        const [x, y] = view.toPx(q);
        placed.push({ x: x - 7, y: y - 7, w: 14, h: 14 });
      }
      queue = [];
    }
    function flushLabels(): void {
      queue.sort((a, b) => a.prio - b.prio).forEach((l) => l.run());
      queue = [];
    }
    /** Wählt die erste freie Lage aus den Kandidaten (sonst die erste im Bild) und reserviert sie. */
    function choose(cands: Box[]): Box {
      const ok = cands.find((b) => inside(b) && !hits(b)) ?? cands.find((b) => inside(b)) ?? cands[0]!;
      const R = regions().scene;
      const b = { ...ok, x: clamp(ok.x, R.x + 4, R.x + R.w - ok.w - 4), y: clamp(ok.y, R.y + 4, R.y + R.h - ok.h - 24) };
      placed.push(b);
      return b;
    }

    /** Vektorname mit Pfeil darüber, optional mit Vorsatz (z. B. „1,5 · u“); `offsets` = Kandidaten in Pixeln. */
    function vecLabel(at: Vec3, name: string, color: string, offsets: [number, number][], size = 16, prefix = '', prio = 3): void {
      queue.push({
        prio,
        run: () => {
          const g = surface.g;
          const pf = font(750, size - 2);
          g.font = pf;
          const pw = prefix ? g.measureText(prefix).width + 3 : 0;
          g.font = mfont(size);
          const w = g.measureText(name).width;
          const total = pw + w;
          const [x0, y0] = view.toPx(at);
          const b = choose(offsets.map(([dx, dy]) => ({ x: x0 + dx - total / 2 - 2, y: y0 + dy - size * 0.95, w: total + 4, h: size * 1.6 })));
          const xs = b.x + 2;
          const y = b.y + size * 0.95;
          view.custom(
            at,
            (gg) => {
              gg.save();
              gg.lineJoin = 'round';
              gg.textBaseline = 'middle';
              gg.textAlign = 'left';
              gg.strokeStyle = alpha(cardBg(), 0.9);
              gg.lineWidth = 4;
              if (prefix) {
                gg.font = pf;
                gg.strokeText(prefix, xs, y);
                gg.fillStyle = color;
                gg.fillText(prefix, xs, y);
              }
              gg.font = mfont(size);
              gg.strokeText(name, xs + pw, y);
              gg.fillStyle = color;
              gg.fillText(name, xs + pw, y);
              const ay = y - size * 0.72;
              const l = xs + pw - 1;
              const r = xs + pw + w + 1;
              gg.lineWidth = 3.5;
              gg.beginPath();
              gg.moveTo(l, ay);
              gg.lineTo(r, ay);
              gg.stroke();
              gg.lineWidth = 1.4;
              gg.strokeStyle = color;
              gg.beginPath();
              gg.moveTo(l, ay);
              gg.lineTo(r, ay);
              gg.moveTo(r - 3.5, ay - 2.5);
              gg.lineTo(r, ay);
              gg.lineTo(r - 3.5, ay + 2.5);
              gg.stroke();
              gg.restore();
            },
            'front',
          );
        },
      });
    }

    /** Vektorname neben einem Pfeil (bevorzugte Seite zuerst, dann die andere, dann weiter weg). */
    function sideLabel(from: Vec3, to: Vec3, name: string, color: string, side = 1, at = 0.5, size = 16, prefix = '', prio = 3): void {
      const [ax, ay] = view.toPx(from);
      const [bx, by] = view.toPx(to);
      const l = Math.hypot(bx - ax, by - ay);
      if (l < 8) return;
      let nx = -(by - ay) / l;
      let ny = (bx - ax) / l;
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      const d = 18 * side;
      const m = vec3.lerp(from, to, at);
      const m2 = vec3.lerp(from, to, at > 0.5 ? at - 0.2 : at + 0.2);
      const [mx, my] = view.toPx(m);
      const [m2x, m2y] = view.toPx(m2);
      const off = (px: number, py: number, k: number): [number, number] => [px - mx + nx * d * k, py - my + ny * d * k];
      vecLabel(m, name, color, [off(mx, my, 1), off(mx, my, -1), off(m2x, m2y, 1), off(m2x, m2y, -1), off(mx, my, 1.8), off(mx, my, -1.8)], size, prefix, prio);
    }

    function arrowV(from: Vec3, to: Vec3, color: string, width = 3.4, a = 1, dash?: number[]): void {
      if (vec3.distance(from, to) < 1e-3 || a < 0.01) return;
      view.arrow(from, to, { color, width, head: 14, alpha: a, dash });
    }

    /** Punktname (mit Koordinaten) neben einem Punkt: freie Lage, im Bild, nicht unter den Zoom-Knöpfen. */
    function ptLabel(q: Vec3, txt: string, color: string, size = 13, prio = 2, math = false): void {
      queue.push({
        prio,
        run: () => {
          const g = surface.g;
          g.font = math ? mfont(size) : font(800, size);
          const tw = g.measureText(txt).width + 8;
          const h = size + 7;
          const [x, y] = view.toPx(q);
          const c: Box[] = [
            { x: x + 9, y: y - 9 - h, w: tw, h },
            { x: x + 9, y: y + 9, w: tw, h },
            { x: x - 9 - tw, y: y - 9 - h, w: tw, h },
            { x: x - 9 - tw, y: y + 9, w: tw, h },
            { x: x - tw / 2, y: y - 14 - h, w: tw, h },
            { x: x - tw / 2, y: y + 14, w: tw, h },
            { x: x + 14, y: y - h / 2, w: tw, h },
            { x: x - 14 - tw, y: y - h / 2, w: tw, h },
          ];
          const b = choose(c);
          const [px, py] = view.toPx(q);
          view.label(q, txt, { color, size, weight: math ? '700' : '800', math, offset: [b.x + 4 - px, b.y + h / 2 - py], align: 'left', baseline: 'middle', background: math ? undefined : alpha(cardBg(), 0.82) });
        },
      });
    }

    /** Name einer Geraden oder Ebene an der freiesten von mehreren Stellen. */
    function nameAt(cands: Vec3[], name: string, color: string): void {
      queue.push({
        prio: 6,
        run: () => {
          const g = surface.g;
          g.font = mfont(18);
          const tw = g.measureText(name).width + 6;
          const boxes = cands.flatMap((q) => {
            const [x, y] = view.toPx(q);
            return [
              { x: x + 6, y: y - 30, w: tw, h: 24 },
              { x: x + 6, y: y + 6, w: tw, h: 24 },
              { x: x - 6 - tw, y: y - 30, w: tw, h: 24 },
            ];
          });
          const b = choose(boxes);
          const i = Math.max(0, boxes.findIndex((x) => x.x === b.x && x.y === b.y));
          const q = cands[Math.floor(i / 3)] ?? cands[0]!;
          const [px, py] = view.toPx(q);
          view.label(q, name, { color, size: 18, math: true, weight: '700', offset: [b.x + 3 - px, b.y + 12 - py], align: 'left', baseline: 'middle' });
        },
      });
    }

    function rightAngle(at: Vec3, u: Vec3, v: Vec3, size: number, color: string, a = 1): void {
      if (a < 0.01 || vec3.length(u) < 1e-9 || vec3.length(v) < 1e-9) return;
      const uu = vec3.scale(vec3.normalize(u), size);
      const vv = vec3.scale(vec3.normalize(v), size);
      view.polyline([vec3.add(at, uu), vec3.add(vec3.add(at, uu), vv), vec3.add(at, vv)], { color, width: 1.6, alpha: a, layer: 'front' });
    }

    /** Kleiner Ausschnitt einer Koordinatenebene um einen Spurpunkt („Durchstoßstelle“). */
    function planePatch(at: V3, zero: number, size: number, color: string, a: number): void {
      if (a < 0.01) return;
      const i = (zero + 1) % 3;
      const j = (zero + 2) % 3;
      const c = (di: number, dj: number): Vec3 => {
        const v: [number, number, number] = [at[0], at[1], at[2]];
        v[i] = v[i]! + di * size;
        v[j] = v[j]! + dj * size;
        return v;
      };
      view.face([c(-1, -1), c(1, -1), c(1, 1), c(-1, 1)], { color, alpha: 0.16 * a, flat: true, stroke: alpha(color, 0.45 * a), width: 1 });
    }

    function message(txt: string): void {
      const R = regions().scene;
      const g = surface.g;
      g.save();
      g.font = font(700, 13);
      const maxW = R.w - 120;
      const words = txt.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const wd of words) {
        const nx = cur ? `${cur} ${wd}` : wd;
        if (g.measureText(nx).width > maxW - 24 && cur) {
          lines.push(cur);
          cur = wd;
        } else cur = nx;
      }
      if (cur) lines.push(cur);
      const w = Math.min(maxW, Math.max(...lines.map((l) => g.measureText(l).width)) + 28);
      const h = lines.length * 18 + 16;
      const cxm = R.x + (R.w - 50) / 2;
      const x = cxm - w / 2;
      const y = R.y + 14;
      roundRect(g, x, y, w, h, 10);
      g.fillStyle = mixColor(BAD(), cardBg(), ctx.theme.dark ? 0.78 : 0.88);
      g.fill();
      g.strokeStyle = alpha(BAD(), 0.5);
      g.lineWidth = 1.2;
      g.stroke();
      lines.forEach((l, k) => text(g, l, cxm, y + 17 + k * 18, { font: font(700, 13), color: ctx.theme.text }));
      g.restore();
    }

    /* ---------------- Szene ---------------- */
    function drawScene(): void {
      const theme = ctx.theme;
      const R = regions().scene;
      const narrow = R.w < 520;
      const E = extent.at(now);
      const zn = zNeg.at(now);
      view.setScene({ target: [0.2, 0.3, (E - zn) * 0.24], radius: (E + zn) * 0.5 * (narrow ? 1.18 : 1.12) + E * 0.2, anchor: [0.46, 0.52] });
      view.begin();
      resetLabels(keyPoints());
      const grow = reduced ? 1 : ease.outCubic(clamp((now - introStart) / 700, 0, 1));
      if (p.grid) view.grid({ min: [-E, -E], max: [E, E], step: 1, color: theme.gridMinor, fade: true });
      view.axes({ min: [-E * grow, -E * grow, -zn * grow], max: (E + 0.5) * grow, color: alpha(theme.axis, 0.8), width: 1.4 });
      view.point(O, { color: theme.text, radius: 3 });
      view.label(O, 'O', { color: theme.muted, size: 12, weight: '700', offset: [-10, 12] });
      let msg: string | null = null;
      if (mode() === 'line') msg = drawLine(E, narrow);
      else if (mode() === 'param') msg = drawParam(E, narrow);
      else msg = drawNormal(E, narrow);
      drawProbe(narrow);
      flushLabels();
      view.end();
      if (msg) message(msg);
    }

    function drawLine(E: number, narrow: boolean): string | null {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const u = U() as Vec3;
      const t = gt.at(now);
      const ca = CA();
      const cu = CU();
      const cx = CX();
      const cg = CG();
      const p1 = phase(0.03, 0.3);
      const p2 = phase(0.32, 0.62);
      const p3 = phase(0.6, 0.95);
      const ch = chainA.at(now);
      const valid = !isZero(tU());
      const X = linePoint(a, u, t) as Vec3;
      view.ball(a, 0.13, { color: ca });
      ptLabel(a, 'A', ca, 13, 1);
      if (!valid) {
        arrowV(O, a, ca, 3.2, ch);
        return tt('Der Richtungsvektor u ist der Nullvektor: Ohne Richtung gibt es keine Gerade.', 'The direction vector u is the zero vector: without a direction there is no line.');
      }
      // die Gerade wächst vom Punkt X aus in beide Richtungen
      const clip = clipLineToBox(a, u, -E, E);
      if (clip) {
        const lo = t + (clip[0] - t) * p3;
        const hi = t + (clip[1] - t) * p3;
        if (hi - lo > 1e-4) {
          view.segment(linePoint(a, u, lo) as Vec3, linePoint(a, u, hi) as Vec3, { color: cg, width: 3, alpha: 0.9 });
          // Marken bei ganzzahligem t
          for (let k = Math.ceil(lo); k <= Math.floor(hi); k++) view.point(linePoint(a, u, k) as Vec3, { color: mixColor(cg, theme.bg, 0.15), radius: 2.6 });
          if (p3 > 0.9) nameAt([0.9, 0.1, 0.75, 0.25, 0.6, 0.4].map((f) => linePoint(a, u, lo + (hi - lo) * f) as Vec3), 'g', cg);
        }
      }
      // Spurpunkte
      const tr = traceA.at(now) * p3;
      let xIsTrace = -1;
      if (tr > 0.01) {
        const all = lineTraces(tA(), tU());
        all.forEach((s, i) => {
          if (s.kind !== 'point' || s.p.some((v) => Math.abs(v) > E + 1e-6)) return;
          // fallen zwei Spurpunkte zusammen (g schneidet eine Achse), nur einmal beschriften
          const same = all.map((o, j) => (o.kind === 'point' && Math.abs(o.t - s.t) < 1e-9 ? j : -1)).filter((j) => j >= 0);
          if (same[0] !== i) return;
          const nm = same.map(traceName).join(' = ');
          const zero = COORD_PLANES[i]!.zero;
          planePatch(s.p, zero, 0.45, cg, tr);
          view.ball(s.p as Vec3, 0.12 * (0.4 + 0.6 * ease.outBack(tr)), { color: theme.text });
          if (Math.abs(s.t - p.t) < 1e-9) {
            xIsTrace = i;
            return;
          }
          if (tr > 0.6) ptLabel(s.p as Vec3, p.show && !narrow ? `${nm}${pt(s.p)}` : nm, theme.text, 12, 2);
        });
      }
      // Pfeilkette: a, dann t · u an der Spitze von a
      if (ch > 0.01) {
        const tip = vec3.lerp(O, a, p1);
        arrowV(O, tip, ca, 3.4, ch);
        if (p1 > 0.9) sideLabel(O, a, 'a', ca, -1, 0.5, 16);
        if (p2 > 0) {
          const tu = vec3.scale(u, t * p2);
          arrowV(a, vec3.add(a, tu), cu, 3.6, ch);
          if (p2 > 0.95) sideLabel(a, vec3.add(a, tu), 'u', cu, -1, 0.5, 15, `${fmt.num(p.t, 2)} ·`);
          if (p2 > 0.98) arrowV(O, X, cx, 2.2, 0.7 * ch, [7, 5]);
        }
      }
      // u selbst (dünn), damit man seine Spitze ziehen kann
      if (Math.abs(p.t - 1) > 0.2) {
        arrowV(a, vec3.add(a, u), cu, 2, 0.55);
        if (Math.abs(p.t) < 0.6 || ch < 0.5) sideLabel(a, vec3.add(a, u), 'u', cu, -1, 0.55, 14);
      }
      // Punkt X
      if (p2 > 0.95) {
        view.ball(X, 0.17, { color: cx });
        const nm = xIsTrace >= 0 ? `X = ${traceName(xIsTrace)}` : 'X';
        ptLabel(X, p.show && !narrow ? `${nm}${pt(linePoint(tA(), tU(), p.t))}` : nm, cx, 13, 0);
      }
      return null;
    }

    /** Parameterbereich des gezeichneten Ebenenstücks (je Richtung). */
    function patchRange(len: number, cur: number, E: number): [number, number] {
      const span = clamp((E * 0.7) / Math.max(len, 1e-6), 0.5, 2.5);
      return [Math.min(-span * 0.35, cur - 0.35), Math.max(span, cur + 0.35)];
    }

    function drawParam(E: number, narrow: boolean): string | null {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const u = U() as Vec3;
      const v = Vv() as Vec3;
      const r = gr.at(now);
      const s = gs.at(now);
      const ca = CA();
      const cu = CU();
      const cv = CV();
      const cx = CX();
      const cg = CG();
      const p1 = phase(0.03, 0.25);
      const p2 = phase(0.27, 0.48);
      const p3 = phase(0.5, 0.7);
      const p4 = phase(0.55, 0.95);
      const ch = chainA.at(now);
      const ok = planeForms(tA(), tU(), tV()).ok;
      view.ball(a, 0.13, { color: ca });
      ptLabel(a, 'A', ca, 13, 1);
      if (!ok) {
        arrowV(a, vec3.add(a, u), cu, 3.2);
        arrowV(a, vec3.add(a, v), cv, 3.2);
        sideLabel(a, vec3.add(a, u), 'u', cu, 1);
        sideLabel(a, vec3.add(a, v), 'v', cv, -1);
        if (!isZero(tU()) || !isZero(tV())) {
          const d = isZero(tU()) ? v : u;
          const c = clipLineToBox(a, d, -E, E);
          if (c) view.segment(linePoint(a, d, c[0]) as Vec3, linePoint(a, d, c[1]) as Vec3, { color: theme.muted, width: 1.4, dash: [6, 5], alpha: 0.8 });
        }
        return tt('u und v sind parallel (oder einer ist der Nullvektor): Sie spannen keine Ebene auf.', 'u and v are parallel (or one is the zero vector): they do not span a plane.');
      }
      // Ebenenstück mit Parametergitter
      const [r0, r1] = patchRange(vec3.length(u), p.r, E);
      const [s0, s1] = patchRange(vec3.length(v), p.s, E);
      const P = (rr: number, ss: number) => planePoint(a, u, v, rr, ss) as Vec3;
      if (p4 > 0.01) {
        const k = p4;
        const rr0 = r0 * k;
        const rr1 = r1 * k;
        const ss0 = s0 * k;
        const ss1 = s1 * k;
        view.face([P(rr0, ss0), P(rr1, ss0), P(rr1, ss1), P(rr0, ss1)], { color: cg, alpha: (theme.dark ? 0.2 : 0.14) * k, flat: true, layer: 'back' });
        const soft = mixColor(cg, theme.bg, 0.25);
        const step = (r1 - r0) / 0.5 > 14 ? 1 : 0.5;
        for (let m = Math.ceil(rr0 / step) * step; m <= rr1 + 1e-9; m += step) view.segment(P(m, ss0), P(m, ss1), { color: soft, width: Math.abs(m) < 1e-9 ? 1.6 : 0.8, alpha: 0.55 * k, layer: 'back' });
        for (let m = Math.ceil(ss0 / step) * step; m <= ss1 + 1e-9; m += step) view.segment(P(rr0, m), P(rr1, m), { color: soft, width: Math.abs(m) < 1e-9 ? 1.6 : 0.8, alpha: 0.55 * k, layer: 'back' });
        view.polyline([P(rr0, ss0), P(rr1, ss0), P(rr1, ss1), P(rr0, ss1)], { color: cg, width: 1.8, alpha: 0.85 * k, closed: true });
        if (k > 0.9) nameAt([P(r1, s1), P(r0, s1), P(r1, s0), P(r0, s0)], 'E', cg);
      }
      // Spannvektoren u und v am Stützpunkt
      arrowV(a, vec3.add(a, u), cu, 2.2, 0.55);
      arrowV(a, vec3.add(a, v), cv, 2.2, 0.55);
      if (Math.abs(p.r - 1) > 0.3 || ch < 0.5) sideLabel(a, vec3.add(a, u), 'u', cu, -1, 0.6, 14);
      if (Math.abs(p.s - 1) > 0.3 || ch < 0.5) sideLabel(a, vec3.add(a, v), 'v', cv, 1, 0.6, 14);
      // Pfeilkette a + r·u + s·v
      const X = P(r, s);
      if (ch > 0.01) {
        arrowV(O, vec3.lerp(O, a, p1), ca, 3.4, ch);
        if (p1 > 0.9) sideLabel(O, a, 'a', ca, -1);
        const ru = vec3.add(a, vec3.scale(u, r * p2));
        if (p2 > 0) arrowV(a, ru, cu, 3.6, ch);
        if (p2 > 0.95 && Math.abs(p.r) > 0.2) sideLabel(a, ru, 'u', cu, 1, 0.5, 14, `${fmt.num(p.r, 2)} ·`);
        if (p3 > 0) {
          const sv = vec3.add(ru, vec3.scale(v, s * p3));
          arrowV(ru, sv, cv, 3.6, ch);
          if (p3 > 0.95 && Math.abs(p.s) > 0.2) sideLabel(ru, sv, 'v', cv, -1, 0.5, 14, `${fmt.num(p.s, 2)} ·`);
        }
        if (p3 > 0.98) arrowV(O, X, cx, 2.2, 0.7 * ch, [7, 5]);
      }
      if (p3 > 0.95 || ch < 0.5) {
        view.ball(X, 0.17, { color: cx });
        ptLabel(X, p.show && !narrow ? `X${pt(planePoint(tA(), tU(), tV(), p.r, p.s))}` : 'X', cx, 13, 0);
      }
      return null;
    }

    function drawNormal(E: number, narrow: boolean): string | null {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const u = U() as Vec3;
      const v = Vv() as Vec3;
      const ca = CA();
      const cu = CU();
      const cv = CV();
      const cn = CN();
      const cg = CG();
      const c1 = phase(0.02, 0.2);
      const c4 = phase(0.68, 0.94);
      const f = planeForms(tA(), tU(), tV());
      const fg = planeForms(A(), U(), Vv());
      view.ball(a, 0.13, { color: ca });
      ptLabel(a, 'A', ca, 13, 1);
      arrowV(a, vec3.add(a, u), cu, 2.6, 0.85);
      arrowV(a, vec3.add(a, v), cv, 2.6, 0.85);
      sideLabel(a, vec3.add(a, u), 'u', cu, -1, 0.6, 14);
      sideLabel(a, vec3.add(a, v), 'v', cv, 1, 0.6, 14);
      if (!f.ok || !fg.ok) {
        return tt('u und v sind parallel (oder einer ist der Nullvektor): Es gibt keine Ebene und keinen Normalenvektor.', 'u and v are parallel (or one is the zero vector): there is no plane and no normal vector.');
      }
      const tri = traceTriangle(fg.n, fg.d);
      const tr = traceA.at(now) * c4;
      // Ebene im sichtbaren Würfel
      const poly = planeBoxPolygon(fg.n, fg.d, -E * 0.8, E * 0.8) as Vec3[];
      if (poly.length >= 3) {
        view.face(poly, { color: cg, alpha: (theme.dark ? 0.14 : 0.1) * (tri && tr > 0.01 ? 1 - 0.45 * tr : 1), flat: true, layer: 'back' });
        view.polyline(poly, { color: mixColor(cg, theme.bg, 0.3), width: 1.2, alpha: 0.7, closed: true, layer: 'back' });
      }
      // Spurgeraden (in den Koordinatenebenen)
      if (tr > 0.01) {
        for (let k = 0; k < 3; k++) {
          const l = traceLine(fg.n, fg.d, k);
          if (!l) continue;
          const c = clipLineToBox(l.p, l.dir, -E, E);
          if (!c) continue;
          view.segment(linePoint(l.p, l.dir, c[0]) as Vec3, linePoint(l.p, l.dir, c[1]) as Vec3, { color: cg, width: tri ? 1.4 : 2.8, dash: tri ? [5, 5] : undefined, alpha: (tri ? 0.6 : 0.95) * tr });
        }
        // Spurdreieck
        if (tri && tri.every((q) => q.every((x) => Math.abs(x) <= E + 1e-6))) {
          const pts = tri.map((q) => q as Vec3);
          view.face(pts, { color: cg, alpha: (theme.dark ? 0.34 : 0.26) * tr, flat: true, stroke: cg, width: 2.6 });
        }
        // Spurpunkte S₁, S₂, S₃ auf den Achsen
        planeIntercepts(f.n, f.d).forEach((s, i) => {
          if (s.kind !== 'point' || Math.abs(s.p[i]!) > E + 1e-6) return;
          const q = planeIntercepts(fg.n, fg.d)[i]!;
          const at = (q.kind === 'point' ? q.p : s.p) as Vec3;
          view.ball(at, 0.13 * (0.4 + 0.6 * ease.outBack(tr)), { color: theme.text });
          if (tr > 0.6) ptLabel(at, p.show && !narrow ? `S${'₁₂₃'[i]}${pt(s.p)}` : `S${'₁₂₃'[i]}`, theme.text, 12, 2);
        });
      }
      // Normalenvektor wächst senkrecht aus der Ebene
      if (c1 > 0.01) {
        const sn = shownNormal(fg.n);
        const tip = vec3.add(a, vec3.scale(sn.v as Vec3, c1));
        arrowV(a, tip, cn, 4, 1);
        if (c1 > 0.9) {
          rightAngle(a, u, sn.v as Vec3, 0.35, theme.muted, c1);
          rightAngle(a, v, sn.v as Vec3, 0.35, theme.muted, c1);
          sideLabel(a, vec3.add(a, sn.v as Vec3), 'n', cn, 1, 0.75, 16, '', 1);
          if (sn.short && !narrow) ptLabel(vec3.add(a, sn.v as Vec3), tt('(verkürzt)', '(shortened)'), theme.muted, 11, 5);
        }
      }
      return null;
    }

    function drawProbe(narrow: boolean): void {
      const pa = probeA.at(now);
      if (pa < 0.01 || mode() === 'param') return;
      const theme = ctx.theme;
      const q = Q() as Vec3;
      let on: boolean | null = null;
      if (mode() === 'line') on = isZero(tU()) ? null : probeLine(tA(), tU(), tQ()).on;
      else {
        const f = planeForms(tA(), tU(), tV());
        on = f.ok ? probePlane(f.n, f.d, tQ()).on : null;
      }
      const col = on === null || !p.show ? theme.text : on ? OK() : BAD();
      view.point(q, { color: col, radius: 8 * pa, hollow: true });
      view.point(q, { color: theme.text, radius: 3 * pa });
      const set = mode() === 'line' ? 'g' : 'E';
      const rel = on === null || !p.show ? '' : on ? ` ∈ ${set}` : ` ∉ ${set}`;
      if (pa > 0.6) ptLabel(q, p.show && !narrow ? `P${pt(tQ())}${rel}` : `P${rel}`, col, 13, 1);
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

    type Tok = { kind: 'col'; v: (number | string)[]; color: string } | { kind: 'txt'; s: string; color?: string; math?: boolean } | { kind: 'vec'; s: string; color: string };
    const cell = (v: number | string) => (typeof v === 'number' ? n2(v) : v);

    function tokWidth(t: Tok, size: number): number {
      const g = surface.g;
      if (t.kind === 'col') {
        g.font = font(750, size);
        return Math.max(...t.v.map((v) => g.measureText(cell(v)).width)) + 2 * (size * 0.45) + 6;
      }
      g.font = t.kind === 'vec' || t.math ? mfont(size + 1) : font(650, size);
      return g.measureText(t.s).width + (t.kind === 'txt' ? 6 : 4);
    }

    function drawToks(toks: Tok[], x: number, y: number, maxW: number, size0: number): void {
      let size = size0;
      while (size > 10.5 && toks.reduce((s, t) => s + tokWidth(t, size), 0) > maxW) size -= 0.5;
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
          t.v.forEach((v, i) => text(g, cell(v), cx + w - bw - 3, y + (i - 1) * lh, { font: font(750, size), color: t.color, align: 'right' }));
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
        } else text(g, t.s, cx + w / 2, y, { font: t.math ? mfont(size + 1) : font(650, size), color: t.color ?? theme.text });
        cx += w;
      }
    }

    /** Text auf eine Breite kürzen (Schrift verkleinern bis 10 px). */
    function fitText(s: string, x: number, y: number, maxW: number, weight: number, size0: number, color: string, align: CanvasTextAlign = 'left'): void {
      const g = surface.g;
      let size = size0;
      g.font = font(weight, size);
      while (size > 10.5 && g.measureText(s).width > maxW) {
        size -= 0.5;
        g.font = font(weight, size);
      }
      text(g, s, x, y, { font: font(weight, size), color, align });
    }

    /** Mehrzeiliger Hinweistext (z. B. Fehlermeldung). */
    function wrapText(msg: string, x: number, y: number, maxW: number, color: string): void {
      const g = surface.g;
      const f = font(700, 12.5);
      g.font = f;
      let cur = '';
      let k = 0;
      for (const wd of msg.split(' ')) {
        const nx = cur ? `${cur} ${wd}` : wd;
        if (g.measureText(nx).width > maxW && cur) {
          text(g, cur, x, y + k * 17, { font: f, color, align: 'left' });
          k++;
          cur = wd;
        } else cur = nx;
      }
      if (cur) text(g, cur, x, y + k * 17, { font: f, color, align: 'left' });
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

    function drawPanel(): void {
      const { panel: R, wide } = regions();
      const g = surface.g;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 14);
      g.clip();
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      if (mode() === 'line') panelLine(R, x0, w, wide);
      else if (mode() === 'param') panelParam(R, x0, w, wide);
      else panelNormal(R, x0, w, wide);
      g.restore();
    }

    function hline(x0: number, w: number, y: number): void {
      const g = surface.g;
      g.strokeStyle = alpha(ctx.theme.text, 0.08);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0, y);
      g.lineTo(x0 + w, y);
      g.stroke();
    }

    function dotMark(x: number, y: number, color: string): void {
      const g = surface.g;
      g.beginPath();
      g.arc(x + 4, y, 4, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
    }

    function panelLine(R: Rect, x0: number, w: number, wide: boolean): void {
      const theme = ctx.theme;
      const show = p.show;
      const a = tA();
      const u = tU();
      const compact = R.h < 300 || R.w < 250;
      const slim = R.w < 250;
      let y = R.y + 22;
      fitText(tt('Gerade g in Parameterform', 'Line g in parametric form'), x0, y, w, 800, 14, theme.text);
      y += compact ? 40 : 44;
      if (!compact) {
        drawToks([{ kind: 'txt', s: 'g:', math: true, color: CG() }, { kind: 'vec', s: 'x', color: theme.text }, { kind: 'txt', s: '=' }, { kind: 'col', v: [...a], color: CA() }, { kind: 'txt', s: '+' }, { kind: 'txt', s: 't', math: true }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...u], color: CU() }], x0, y, w, wide ? 15 : 13);
        y += 54;
      }
      // eingesetzt: gleitende Werte, damit die Zahlen weich zählen
      const tg = gt.at(now);
      const X = linePoint(A(), U(), tg);
      drawToks([{ kind: 'vec', s: 'x', color: CX() }, { kind: 'txt', s: '=' }, { kind: 'col', v: [...a], color: CA() }, { kind: 'txt', s: '+' }, { kind: 'txt', s: tg < 0 ? `(${fmt.num(tg, 2)})` : fmt.num(tg, 2), color: CU() }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...u], color: CU() }, { kind: 'txt', s: '=' }, { kind: 'col', v: show ? [...X] : ['?', '?', '?'], color: CX() }], x0, y, w, wide ? 14 : 12.5);
      y += compact ? 36 : 42;
      if (isZero(u)) {
        wrapText(tt('Der Nullvektor ist kein Richtungsvektor.', 'The zero vector is not a direction vector.'), x0, y, w, BAD());
        return;
      }
      hline(x0, w, y - 10);
      const lh = compact ? 17 : 20;
      if (p.trace) {
        text(surface.g, tt('Spurpunkte (Durchstoßpunkte)', 'Trace points'), x0, y + 2, { font: font(750, 12), color: theme.muted, align: 'left' });
        y += lh;
        lineTraces(a, u).forEach((s, i) => {
          dotMark(x0, y, CG());
          text(surface.g, `${traceName(i)}`, x0 + 13, y, { font: font(800, 12.5), color: theme.text, align: 'left' });
          let val: string;
          if (!show) val = '?';
          else if (s.kind === 'point') val = slim ? pt(s.p) : `t = ${fmt.num(s.t, 2)} → ${pt(s.p)}`;
          else if (s.kind === 'inside') val = tt(`g liegt in der ${planeName(i)}-Ebene`, `g lies in the ${planeName(i)} plane`);
          else val = slim ? tt('keiner', 'none') : tt(`keiner: g ∥ ${planeName(i)}-Ebene`, `none: g ∥ ${planeName(i)} plane`);
          fitText(val, x0 + w, y, w - 46, 650, 12, theme.text, 'right');
          y += lh;
        });
      }
      if (p.probe) {
        y += 4;
        hline(x0, w, y - 10);
        const q = tQ();
        const res = probeLine(a, u, q);
        text(surface.g, `${tt('Punktprobe', 'Point test')} P${pt(q)}`, x0, y + 2, { font: font(750, 12), color: theme.muted, align: 'left' });
        y += lh;
        const comps = res.comps.map((c, i) => (c.kind === 't' ? `t = ${fmt.num(c.t, 2)}` : c.ok ? `p${'₁₂₃'[i]} = a${'₁₂₃'[i]} ✓` : `p${'₁₂₃'[i]} ≠ a${'₁₂₃'[i]}`)).join('   ');
        fitText(show ? comps : '?', x0, y, w * 0.68, 650, 12, theme.text);
        fitText(show ? (res.on ? 'P ∈ g ✓' : 'P ∉ g') : '?', x0 + w, y, w * 0.3, 800, 13, show ? (res.on ? OK() : BAD()) : theme.text, 'right');
        y += lh;
      }
      if (wide && y < R.y + R.h - 56) {
        const tip = p.probe
          ? tt('Gleiches t in allen drei Zeilen heißt: P liegt auf g. Verschiedene t-Werte: P liegt nicht auf g.', 'The same t in all three rows means P lies on g. Different values of t: P does not lie on g.')
          : tt('Ziehe X entlang der Geraden oder A und die Spitze von u. Jeder Wert von t liefert genau einen Punkt der Geraden.', 'Drag X along the line, or A and the tip of u. Every value of t gives exactly one point of the line.');
        drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(84, R.y + R.h - y - 12) }, tip);
      }
    }

    function panelParam(R: Rect, x0: number, w: number, wide: boolean): void {
      const theme = ctx.theme;
      const a = tA();
      const u = tU();
      const v = tV();
      const compact = R.h < 280 || R.w < 250;
      let y = R.y + 22;
      fitText(tt('Ebene E in Parameterform', 'Plane E in parametric form'), x0, y, w, 800, 14, theme.text);
      y += compact ? 40 : 44;
      if (!compact) {
        drawToks([{ kind: 'txt', s: 'E:', math: true, color: CG() }, { kind: 'vec', s: 'x', color: theme.text }, { kind: 'txt', s: '=' }, { kind: 'col', v: [...a], color: CA() }, { kind: 'txt', s: '+' }, { kind: 'txt', s: 'r', math: true }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...u], color: CU() }, { kind: 'txt', s: '+' }, { kind: 'txt', s: 's', math: true }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...v], color: CV() }], x0, y, w, wide ? 15 : 13);
        y += 54;
      }
      const r = gr.at(now);
      const s = gs.at(now);
      const X = planePoint(A(), U(), Vv(), r, s);
      const ok = planeForms(a, u, v).ok;
      const par = (k: number) => (k < 0 ? `(${fmt.num(k, 2)})` : fmt.num(k, 2));
      const sum: Tok[] = [{ kind: 'vec', s: 'x', color: CX() }, { kind: 'txt', s: '=' }, { kind: 'col', v: [...a], color: CA() }, { kind: 'txt', s: '+' }, { kind: 'txt', s: par(r), color: CU() }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...u], color: CU() }, { kind: 'txt', s: '+' }, { kind: 'txt', s: par(s), color: CV() }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...v], color: CV() }];
      const res: Tok[] = [{ kind: 'txt', s: '=' }, { kind: 'col', v: p.show && ok ? [...X] : ['?', '?', '?'], color: CX() }];
      const fits = [...sum, ...res].reduce((acc, t) => acc + tokWidth(t, 11.5), 0) <= w;
      drawToks(fits ? [...sum, ...res] : sum, x0, y, w, wide ? 13.5 : 12);
      y += compact ? 36 : 42;
      if (!fits) {
        fitText(`X${p.show && ok ? pt(X) : '(?)'}`, x0, y - 6, w, 800, 13, CX());
        y += 18;
      }
      hline(x0, w, y - 10);
      const row = (label: string, value: string, color = theme.text) => {
        text(surface.g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
        fitText(value, x0 + w, y, w * 0.6, 800, 12, color, 'right');
        y += 20;
      };
      if (!ok) {
        wrapText(tt('u und v sind parallel: keine Ebene! Wähle Spannvektoren, die nicht parallel sind.', 'u and v are parallel: no plane! Choose spanning vectors that are not parallel.'), x0, y, w, BAD());
        return;
      }
      row(tt('Spannvektoren', 'Spanning vectors'), tt('u, v nicht parallel ✓', 'u, v not parallel ✓'), OK());
      row(tt('Parameter', 'Parameters'), `r = ${fmt.num(p.r, 2)}${sep}s = ${fmt.num(p.s, 2)}`);
      if (wide && y < R.y + R.h - 56) {
        drawTip(
          { x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(84, R.y + R.h - y - 12) },
          tt('Jedes Paar (r | s) liefert genau einen Punkt der Ebene. Ziehe X in der Ebene.', 'Every pair (r, s) gives exactly one point of the plane. Drag X within the plane.'),
        );
      }
    }

    function panelNormal(R: Rect, x0: number, w: number, wide: boolean): void {
      const theme = ctx.theme;
      const g = surface.g;
      const a = tA();
      const u = tU();
      const v = tV();
      const show = p.show;
      const f = planeForms(a, u, v);
      const compact = R.h < 330 || R.w < 250;
      let y = R.y + 22;
      fitText(tt('Normalen- und Koordinatenform', 'Normal and coordinate form'), x0, y, w, 800, 14, theme.text);
      y += 24;
      if (!f.ok) {
        wrapText(tt('u und v sind parallel: keine Ebene, also auch kein Normalenvektor.', 'u and v are parallel: no plane, so no normal vector.'), x0, y + 6, w, BAD());
        return;
      }
      const steps = [phase(0.02, 0.2), phase(0.24, 0.42), phase(0.46, 0.64), phase(0.68, 0.94)];
      const running = animating();
      const cur = steps.findIndex((s) => s < 1);
      /** Kopfzeile eines Schritts mit Nummer; liefert die Deckkraft des Inhalts. */
      const head = (k: number, label: string | Tok[], h: number): number => {
        const s = steps[k]!;
        const op = running ? 0.18 + 0.82 * s : 1;
        if (running && cur === k) {
          roundRect(g, x0 - 6, y - 10, w + 12, h, 8);
          g.fillStyle = alpha(CN(), theme.dark ? 0.16 : 0.08);
          g.fill();
        }
        g.globalAlpha = op;
        g.beginPath();
        g.arc(x0 + 7, y, 7.5, 0, Math.PI * 2);
        g.fillStyle = CN();
        g.fill();
        text(g, String(k + 1), x0 + 7, y + 0.5, { font: font(800, 10.5), color: theme.dark ? theme.bg : '#ffffff' });
        if (typeof label === 'string') fitText(label, x0 + 20, y, w - 20, 700, 12, theme.text);
        else drawToks(label, x0 + 18, y, w - 18, 12);
        return op;
      };
      const q = (s: string) => (show ? s : '?');
      const T = (s: string): Tok => ({ kind: 'txt', s });
      const Vk = (s: string): Tok => ({ kind: 'vec', s, color: theme.text });
      // 1: Normalenvektor über das Vektorprodukt
      const h1 = compact ? 66 : 74;
      head(0, [T(tt('Normalenvektor', 'Normal vector')), Vk('n'), T('='), Vk('u'), T('×'), Vk('v')], h1);
      y += compact ? 34 : 38;
      const toks: Tok[] = [{ kind: 'col', v: [...u], color: CU() }, { kind: 'txt', s: '×' }, { kind: 'col', v: [...v], color: CV() }, { kind: 'txt', s: '=' }, { kind: 'col', v: show ? [...f.raw] : ['?', '?', '?'], color: CN() }];
      if (f.factor > 1) toks.push({ kind: 'txt', s: '=' }, { kind: 'txt', s: q(`${f.factor} ·`) }, { kind: 'col', v: show ? [...f.n] : ['?', '?', '?'], color: CN() });
      drawToks(toks, x0 + 4, y, w - 4, wide ? 13 : 12);
      y += compact ? 32 : 36;
      g.globalAlpha = 1;
      // 2: Normalenform
      const h2 = compact ? 26 : 66;
      head(1, [T(tt('Normalenform', 'Normal form')), Vk('n'), T('· ('), Vk('x'), T('−'), Vk('a'), T(') = 0')], h2);
      if (!compact) {
        y += 34;
        drawToks([{ kind: 'col', v: show ? [...f.n] : ['?', '?', '?'], color: CN() }, { kind: 'txt', s: '·' }, { kind: 'txt', s: '[' }, { kind: 'vec', s: 'x', color: theme.text }, { kind: 'txt', s: '−' }, { kind: 'col', v: [...a], color: CA() }, { kind: 'txt', s: ']' }, { kind: 'txt', s: '= 0' }], x0 + 4, y, w - 4, wide ? 13 : 12);
        y += 34;
      } else y += 22;
      g.globalAlpha = 1;
      // 3: Koordinatenform
      const dTerms = f.n.map((c, i) => `${n2(c)} · ${a[i]! < 0 ? `(${n2(a[i]!)})` : n2(a[i]!)}`).join(' + ');
      const h3 = compact ? 44 : 50;
      head(2, [T(`${tt('Koordinatenform', 'Coordinate form')}: d =`), Vk('n'), T('·'), Vk('a'), T(`= ${q(n2(f.d))}`)], h3);
      y += 21;
      const op3 = running ? 0.18 + 0.82 * steps[2]! : 1;
      g.globalAlpha = op3;
      if (!compact) {
        fitText(q(`d = ${dTerms} = ${n2(f.d)}`), x0 + 20, y - 1, w - 20, 600, 11.5, theme.muted);
        y += 18;
      }
      fitText(q(coordinateFormText(f.n, f.d, (x) => fmt.num(x, 2))), x0 + 20, y, w - 20, 800, compact ? 15 : 17, CN());
      y += compact ? 24 : 28;
      g.globalAlpha = 1;
      // 4: Spurpunkte
      head(3, tt('Spurpunkte (Achsenabschnitte)', 'Trace points (intercepts)'), compact ? 42 : 48);
      y += 20;
      g.globalAlpha = running ? 0.18 + 0.82 * steps[3]! : 1;
      const sp = planeIntercepts(f.n, f.d);
      const items = sp.map((s, i) => {
        const nm = `S${'₁₂₃'[i]}`;
        if (s.kind === 'point') return `${nm}${q(pt(s.p))}`;
        if (s.kind === 'contains') return `${nm}: ${tt(`x${'₁₂₃'[i]}-Achse liegt in E`, `x${'₁₂₃'[i]} axis lies in E`)}`;
        return `${nm}: ${tt('keiner', 'none')}`;
      });
      fitText(items.join('   '), x0 + 20, y, w - 20, 700, 12, theme.text);
      y += 20;
      g.globalAlpha = 1;
      const triT = traceTriangle(f.n, f.d);
      const all = sp.filter((s) => s.kind === 'point').length;
      let note: string;
      if (Math.abs(f.d) < 1e-9) note = tt('d = 0: E geht durch den Ursprung – kein Spurdreieck.', 'd = 0: E passes through the origin – no trace triangle.');
      else if (triT) note = tt('Die Spurpunkte bilden das Spurdreieck; seine Seiten liegen auf den Spurgeraden.', 'The trace points form the trace triangle; its sides lie on the trace lines.');
      else if (all === 1) note = tt('Nur ein Spurpunkt: E ist parallel zu einer Koordinatenebene.', 'Only one trace point: E is parallel to a coordinate plane.');
      else note = tt('Zwei Spurpunkte: E ist parallel zu einer Koordinatenachse.', 'Two trace points: E is parallel to a coordinate axis.');
      if (p.probe) {
        const qq = tQ();
        const pr = probePlane(f.n, f.d, qq);
        hline(x0, w, y - 8);
        y += 4;
        const terms = f.n.map((c, i) => `${n2(c)} · ${qq[i]! < 0 ? `(${n2(qq[i]!)})` : n2(qq[i]!)}`).join(' + ');
        const two = R.w < 300;
        fitText(`P${pt(qq)}: ${q(`${terms} = ${n2(pr.value)}`)}`, x0, y, two ? w : w * 0.72, 650, 11.5, theme.text);
        if (two) y += 17;
        fitText(show ? (pr.on ? `= d ✓ P ∈ E` : `≠ d, P ∉ E`) : '?', x0 + w, y, w * 0.27, 800, 12.5, show ? (pr.on ? OK() : BAD()) : theme.text, 'right');
        y += 20;
      }
      if (wide && y < R.y + R.h - 50) drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(70, R.y + R.h - y - 12) }, note);
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const a = tA();
      const u = tU();
      const v = tV();
      const x = '<var>x</var>';
      if (mode() === 'line') {
        ctx.readout('eq', { html: `g: ${x} = ${pt(a)} + <var>t</var> · ${pt(u)}` });
        ctx.readout('pt', isZero(u) ? null : `X${pt(linePoint(a, u, p.t))} ${tt('für', 'for')} t = ${fmt.num(p.t, 2)}`);
        ctx.readout('n', null);
        ctx.readout('cf', null);
        ctx.readout('trace', isZero(u) ? null : lineTraces(a, u).map((s, i) => (s.kind === 'point' ? `${traceName(i)}${pt(s.p)}` : `${traceName(i)}: ${s.kind === 'inside' ? tt('g in der Ebene', 'g in the plane') : tt('keiner', 'none')}`)).join(' · '));
        const r = probeLine(a, u, tQ());
        ctx.readout('probe', p.probe && !isZero(u) ? `${r.comps.map((c) => (c.kind === 't' ? `t = ${fmt.num(c.t, 2)}` : c.ok ? '✓' : '✗')).join(sep)} → P${pt(tQ())} ${r.on ? '∈' : '∉'} g` : null);
        ctx.readout('info', isZero(u) ? tt('Der Richtungsvektor darf nicht der Nullvektor sein.', 'The direction vector must not be the zero vector.') : null);
        return;
      }
      const f = planeForms(a, u, v);
      ctx.readout('eq', { html: `E: ${x} = ${pt(a)} + <var>r</var> · ${pt(u)} + <var>s</var> · ${pt(v)}` });
      ctx.readout('pt', mode() === 'param' && f.ok ? `X${pt(planePoint(a, u, v, p.r, p.s))} ${tt('für', 'for')} r = ${fmt.num(p.r, 2)}, s = ${fmt.num(p.s, 2)}` : null);
      ctx.readout('n', f.ok ? `n = u × v = ${pt(f.raw)}${f.factor > 1 ? ` = ${f.factor} · ${pt(f.n)}` : ''}` : null);
      ctx.readout('cf', f.ok ? coordinateFormText(f.n, f.d, (z) => fmt.num(z, 2)) : null);
      ctx.readout('trace', f.ok && mode() === 'normal' ? planeIntercepts(f.n, f.d).map((s, i) => (s.kind === 'point' ? `S${'₁₂₃'[i]}${pt(s.p)}` : `S${'₁₂₃'[i]}: ${s.kind === 'contains' ? tt('Achse in E', 'axis in E') : tt('keiner', 'none')}`)).join(' · ') : null);
      const pr = f.ok ? probePlane(f.n, f.d, tQ()) : null;
      ctx.readout('probe', p.probe && mode() === 'normal' && pr && f.ok ? `n · p = ${n2(pr.value)} ${pr.on ? '=' : '≠'} ${n2(f.d)} → P ${pr.on ? '∈' : '∉'} E` : null);
      ctx.readout('info', f.ok ? null : tt('u und v sind parallel – sie spannen keine Ebene auf.', 'u and v are parallel – they do not span a plane.'));
    }

    retarget(true);
    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('mode') && source === 'input') {
          const wasLine = lastMode === 'line';
          const isLine = mode() === 'line';
          if (wasLine && !isLine) ctx.set(PLANE_START);
          else if (!wasLine && isLine) ctx.set(LINE_START);
        }
        if (changed.has('mode')) {
          lastMode = mode();
          if (source !== 'init') animStart = reduced ? now - 1e6 : now + 80;
        } else if (source === 'input' && animating() && !changed.has('show') && !changed.has('grid')) animStart = now - 1e6;
        retarget(source === 'init');
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'play' || id === 'convert') animStart = reduced ? now - 1e6 : now;
        else if (id === 'tour' && !reduced) {
          tourStart = now;
          tourFrom = { az: view.azimuth, el: view.elevation };
        }
        ctx.requestRender();
      },
      resetView: () => {
        tourStart = -1;
        view.resetView(true);
      },
      render() {
        now = performance.now();
        surface.begin();
        view.resize();
        if (tourStart >= 0) {
          const e = clamp((now - tourStart) / TOUR_MS, 0, 1);
          const k = ease.inOutCubic(e);
          view.setCamera({ azimuth: tourFrom.az + 360 * k, elevation: clamp(tourFrom.el + 14 * Math.sin(Math.PI * k), -80, 89) });
          if (e >= 1) {
            view.setCamera({ azimuth: tourFrom.az, elevation: tourFrom.el });
            tourStart = -1;
          }
        }
        drawScene();
        drawPanel();
        const busy = [...ga, ...gu, ...gv, ...gq, gt, gr, gs, traceA, chainA, probeA, extent, zNeg].some((x) => x.busy(now)) || animating() || tourStart >= 0 || (!reduced && now - introStart < 900);
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
