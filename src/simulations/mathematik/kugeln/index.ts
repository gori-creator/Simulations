import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import { circlePoints, dot, norm, planeBasis, pointPosition, projectToSphere, reducePlane, signedDistance, sphereLhs, sphereLine, spherePlane, sub, tangentPlane, type V3 } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Mode = 'sphere' | 'plane' | 'line' | 'tangent';
const MODES: Mode[] = ['sphere', 'plane', 'line', 'tangent'];

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
  go(to: number, ms = 520): void {
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

const num = <K extends string>(key: K, label: { de: string; en: string }, min: number, max: number, step: number, def: number, show?: (v: Record<string, unknown>) => boolean, group?: string) => ({
  key,
  type: 'number' as const,
  label,
  min,
  max,
  step,
  default: def,
  visibleIf: show,
  group,
});
const isMode = (m: Mode) => (v: Record<string, unknown>) => v.mode === m;
const same = (s: string) => L(s, s);

/**
 * Kugeln in der analytischen Geometrie: Kugelgleichung mit Punktprobe,
 * Lage Kugel – Ebene (Abstand des Mittelpunkts, Schnittkreis mit M′ und ρ),
 * Lage Kugel – Gerade (Einsetzen, quadratische Gleichung, Diskriminante) und
 * Tangentialebene in einem ziehbaren Kugelpunkt B. Glas-Kugel mit Breiten-
 * und Längenkreisen, Kamera drehbar, „Ebene durch die Kugel schieben“ und
 * „Rundflug“ als Aktionen.
 */
export default defineSimulation({
  id: 'kugeln',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.68 },
  groups: [
    { id: 'kugel', label: L('Kugel K', 'Sphere K') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'sphere', label: L('Kugelgleichung', 'Equation of a sphere') },
        { value: 'plane', label: L('Kugel und Ebene', 'Sphere and plane') },
        { value: 'line', label: L('Kugel und Gerade', 'Sphere and line') },
        { value: 'tangent', label: L('Tangentialebene', 'Tangent plane') },
      ],
      default: 'sphere',
    },
    num('m1', L('Mittelpunkt m₁', 'Centre m₁'), -4, 4, 0.5, 1, undefined, 'kugel'),
    num('m2', L('Mittelpunkt m₂', 'Centre m₂'), -4, 4, 0.5, 2, undefined, 'kugel'),
    num('m3', L('Mittelpunkt m₃', 'Centre m₃'), -4, 4, 0.5, 3, undefined, 'kugel'),
    num('r', L('Radius r', 'Radius r'), 0.5, 5, 0.25, 3, undefined, 'kugel'),
    num('p1', L('Punkt P: p₁', 'Point P: p₁'), -8, 8, 0.5, 1, isMode('sphere')),
    num('p2', same('p₂'), -8, 8, 0.5, 7, isMode('sphere')),
    num('p3', same('p₃'), -8, 8, 0.5, 3, isMode('sphere')),
    { ...num('n1', L('Ebene E: n₁', 'Plane E: n₁'), -3, 3, 1, 2, isMode('plane')), help: L('E: n₁x₁ + n₂x₂ + n₃x₃ = c (Koordinatenform)', 'E: n₁x₁ + n₂x₂ + n₃x₃ = c (coordinate form)') },
    num('n2', same('n₂'), -3, 3, 1, -1, isMode('plane')),
    num('n3', same('n₃'), -3, 3, 1, 2, isMode('plane')),
    num('c', L('rechte Seite c', 'right-hand side c'), -40, 40, 0.5, 12, isMode('plane')),
    { ...num('a1', L('Gerade g: Aufpunkt a₁', 'Line g: point a₁'), -8, 8, 0.5, 4, isMode('line')), help: L('g: X = A + t · u (Aufpunkt A, Richtungsvektor u)', 'g: X = A + t · u (point A, direction vector u)') },
    num('a2', same('a₂'), -8, 8, 0.5, 5, isMode('line')),
    num('a3', same('a₃'), -8, 8, 0.5, 6, isMode('line')),
    num('u1', L('Richtung u₁', 'Direction u₁'), -3, 3, 0.5, -1, isMode('line')),
    num('u2', same('u₂'), -3, 3, 0.5, -1, isMode('line')),
    num('u3', same('u₃'), -3, 3, 0.5, -2, isMode('line')),
    { ...num('b1', L('Berührpunkt B: b₁', 'Point of contact B: b₁'), -9, 9, 0.1, 0, isMode('tangent')), help: L('Liegt B nicht genau auf K, wird der Punkt vom Mittelpunkt aus auf die Kugel geschoben.', 'If B is not exactly on K, it is pushed onto the sphere along the ray from the centre.') },
    num('b2', same('b₂'), -9, 9, 0.1, 4, isMode('tangent')),
    num('b3', same('b₃'), -9, 9, 0.1, 5, isMode('tangent')),
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnis anzeigen', 'Show result'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Animation abspielen', 'Play animation'), primary: true },
    { id: 'sweep', label: L('Ebene durch die Kugel schieben', 'Slide the plane through the sphere'), visibleIf: (v) => v.mode === 'plane' },
    { id: 'fly', label: L('Rundflug', 'Fly around') },
  ],
  readouts: [
    { key: 'eq', label: L('Kugelgleichung', 'Equation of the sphere') },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Punktprobe: P außerhalb', 'Point test: P outside'), values: {} },
    { id: 'on', label: L('Punkt P(1 | 2 | 6) auf K', 'Point P(1, 2, 6) on K'), values: { p1: 1, p2: 2, p3: 6 } },
    { id: 'in', label: L('Punkt Q(2 | 2 | 3) innen', 'Point Q(2, 2, 3) inside'), values: { p1: 2, p2: 2, p3: 3 } },
    { id: 'circle', label: L('Ebene x₃ = 5: Schnittkreis', 'Plane x₃ = 5: circle of intersection'), values: { mode: 'plane', n1: 0, n2: 0, n3: 1, c: 5 } },
    { id: 'great', label: L('Ebene durch M: Großkreis', 'Plane through M: great circle'), values: { mode: 'plane', n1: 1, n2: 1, n3: 1, c: 6 } },
    { id: 'secant', label: L('Sekante mit zwei Schnittpunkten', 'Secant with two intersection points'), values: { mode: 'line' } },
    { id: 'tangentLine', label: L('Tangente (4 | 2 | 0) + t · (0 | 0 | 1)', 'Tangent line (4, 2, 0) + t · (0, 0, 1)'), values: { mode: 'line', a1: 4, a2: 2, a3: 0, u1: 0, u2: 0, u3: 1 } },
    { id: 'tplane', label: L('Tangentialebene in B(0 | 4 | 5)', 'Tangent plane at B(0, 4, 5)'), values: { mode: 'tangent' } },
    { id: 'tflat', label: L('Waagerechte Tangentialebene in B(1 | 2 | 6)', 'Horizontal tangent plane at B(1, 2, 6)'), values: { mode: 'tangent', b1: 1, b2: 2, b3: 6 } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit einer durchsichtigen Kugel (Breiten- und Längenkreise), ihrem Mittelpunkt und wahlweise einem Punkt, einer schneidenden Ebene mit Schnittkreis, einer Geraden mit Schnittpunkten oder einer Tangentialebene; Punkte ziehbar, Ansicht drehbar' },
    en: { canvas: 'Three-dimensional coordinate system with a transparent sphere (circles of latitude and longitude), its centre and either a point, a plane with its circle of intersection, a line with its intersection points or a tangent plane; draggable points, rotatable view' },
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

    function regions(): { scene: Rect; panel: Rect; wide: boolean } {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.32, 250, 340));
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: Math.min(H - 12, 400) } };
      }
      const ph = Math.round(clamp(H * 0.4, 188, 236));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 30, elevation: 18, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene });

    /* ---------------- Zustand ---------------- */
    const gm = [G(p.m1), G(p.m2), G(p.m3)];
    const gr = G(p.r);
    const gp = [G(p.p1), G(p.p2), G(p.p3)];
    const gn = [G(p.n1), G(p.n2), G(p.n3)];
    const gc = G(p.c);
    const ga = [G(p.a1), G(p.a2), G(p.a3)];
    const gu = [G(p.u1), G(p.u2), G(p.u3)];
    const gb = [G(p.b1), G(p.b2), G(p.b3)];
    const gt = [G(0), G(0), G(0)];
    const grad = G(6);
    const glo = G(-2);
    const ghi = G(6);
    const modeA = Object.fromEntries(MODES.map((m) => [m, G(m === p.mode ? 1 : 0)])) as Record<Mode, Glide>;
    const glides = (): Glide[] => [...gm, gr, ...gp, ...gn, gc, ...ga, ...gu, ...gb, ...gt, grad, glo, ghi, ...MODES.map((m) => modeA[m])];

    let now = performance.now();
    const introStart = now + (reduced ? -1e6 : 80);
    let animStart = now + (reduced ? -1e6 : 500);
    const ANIM_MS = 2400;
    let lastDrag = -1e9;
    /** „Ebene durch die Kugel schieben“: Startzeit (−1 = aus). */
    let sweepStart = -1;
    const SWEEP_MS = 7000;
    /** Rundflug: Startzeit und Ausgangswinkel. */
    let fly: { t0: number; az: number; el: number; last: number } | null = null;
    const FLY_MS = 9000;

    const V = (gs: Glide[]): V3 => [gs[0]!.at(now), gs[1]!.at(now), gs[2]!.at(now)];
    const tM = (): V3 => [p.m1, p.m2, p.m3];
    const tP = (): V3 => [p.p1, p.p2, p.p3];
    const tN = (): V3 => [p.n1, p.n2, p.n3];
    const tA = (): V3 => [p.a1, p.a2, p.a3];
    const tU = (): V3 => [p.u1, p.u2, p.u3];
    const tB = (): V3 => [p.b1, p.b2, p.b3];

    /** Punkte, die im Bild zu sehen sein sollen (Zielwerte). */
    function focusPoints(): V3[] {
      const m = tM();
      const r = p.r;
      const pts: V3[] = [
        [0, 0, 0],
        [m[0] - r, m[1] - r, m[2] - r],
        [m[0] + r, m[1] + r, m[2] + r],
      ];
      if (mode() === 'sphere') pts.push(tP());
      if (mode() === 'line') {
        pts.push(tA());
        const cut = sphereLine(m, r, tA(), tU());
        if (cut) pts.push(cut.closest);
      }
      if (mode() === 'plane') {
        const n = tN();
        if (norm(n) > 0) {
          const s = signedDistance(m, n, p.c);
          if (Math.abs(s) < r + 5) pts.push(sub(m, vec3.scale(vec3.normalize(n), s) as V3));
        }
      }
      return pts;
    }

    function retarget(snap = false): void {
      const ms = performance.now() - lastDrag < 200 ? 110 : 520;
      const set = (g: Glide, v: number, t = ms) => (snap ? g.snap(v) : g.go(v, t));
      tM().forEach((v, i) => set(gm[i]!, v));
      set(gr, p.r);
      tP().forEach((v, i) => set(gp[i]!, v));
      tN().forEach((v, i) => set(gn[i]!, v));
      set(gc, p.c);
      tA().forEach((v, i) => set(ga[i]!, v));
      tU().forEach((v, i) => set(gu[i]!, v));
      tB().forEach((v, i) => set(gb[i]!, v));
      for (const m of MODES) set(modeA[m], m === mode() ? 1 : 0, 650);
      const pts = focusPoints();
      const lo = [0, 1, 2].map((k) => Math.min(...pts.map((q) => q[k]!)));
      const hi = [0, 1, 2].map((k) => Math.max(...pts.map((q) => q[k]!)));
      const c = lo.map((v, k) => (v + hi[k]!) / 2);
      const half = Math.hypot(...lo.map((v, k) => hi[k]! - v)) / 2;
      c.forEach((v, i) => set(gt[i]!, v, 700));
      set(grad, Math.max(3.4, p.r * 1.5, half * 0.9), 700);
      const all = pts.flat();
      set(glo, clamp(Math.min(-1.5, Math.floor(Math.min(...all) - 0.5)), -10, -1.5), 700);
      set(ghi, clamp(Math.max(4, Math.ceil(Math.max(...all) + 1)), 4, 11), 700);
    }

    function phase(from: number, to: number): number {
      const t = (now - animStart) / ANIM_MS;
      return ease.inOutCubic(clamp((t - from) / (to - from), 0, 1));
    }
    const animating = () => now - animStart < ANIM_MS + 100;
    const sweeping = () => sweepStart >= 0 && now - sweepStart < SWEEP_MS;

    /* ---------------- Farben, Texte ---------------- */
    const CK = () => ctx.theme.series[0]!;
    const CS = () => ctx.theme.series[1]!;
    const CE = () => ctx.theme.series[2]!;
    const CP = () => ctx.theme.series[3]!;
    const CG = () => ctx.theme.series[4]!;
    const CT = () => ctx.theme.series[5]!;
    const n1 = (v: number) => fmt.num(v, 2);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mfont = (s: number) => `italic 700 ${s}px ${ctx.theme.mathFont}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const sep = lang === 'de' ? ' | ' : ', ';
    const pt = (q: V3) => `(${n1(q[0])}${sep}${n1(q[1])}${sep}${n1(q[2])})`;
    /** Koordinaten, bei gerundeten Werten mit „≈“. */
    const ptA = (q: V3) => (q.every((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6) ? pt(q) : ` ≈ ${pt(q)}`);
    const SUB = ['₁', '₂', '₃'];
    const nice = (v: number) => Math.abs(v * 4 - Math.round(v * 4)) < 1e-9;
    /** Wurzel exakt, wenn möglich, sonst „√a ≈ b“. */
    const sqrtText = (v: number) => {
      const s = Math.sqrt(Math.max(0, v));
      return nice(s) ? n1(s) : `√${n1(v)} ≈ ${n1(s)}`;
    };
    const paren = (v: number) => (v < 0 ? `(${n1(v)})` : n1(v));
    /** (x₁ − 1)² bzw. (x₁ + 2)² bzw. x₁². */
    const sqTerm = (k: number, m: number) => (Math.abs(m) < 1e-12 ? `x${SUB[k]}²` : `(x${SUB[k]} ${m < 0 ? '+' : '−'} ${n1(Math.abs(m))})²`);
    const sphereText = (m: V3, r: number) => `${[0, 1, 2].map((k) => sqTerm(k, m[k]!)).join(' + ')} = ${n1(r * r)}`;
    /** Linke Seite einer Koordinatenform: 2x₁ − x₂ + 2x₃. */
    function linText(n: V3, v = 'x'): string {
      let s = '';
      n.forEach((c, k) => {
        if (Math.abs(c) < 1e-12) return;
        const a = Math.abs(c);
        const coef = Math.abs(a - 1) < 1e-12 ? '' : n1(a);
        s += s ? ` ${c < 0 ? '−' : '+'} ` : c < 0 ? '−' : '';
        s += `${coef}${v}${SUB[k]}`;
      });
      return s || '0';
    }
    const planeText = (n: V3, c: number) => `${linText(n)} = ${n1(c)}`;
    /** A t² + B t + C = 0 */
    function quadText(A: number, B: number, C: number): string {
      const parts: string[] = [];
      const term = (c: number, v: string, first: boolean) => {
        if (Math.abs(c) < 1e-12) return;
        const a = Math.abs(c);
        const coef = v && Math.abs(a - 1) < 1e-12 ? '' : n1(a);
        parts.push(`${first ? (c < 0 ? '−' : '') : c < 0 ? '− ' : '+ '}${coef}${v}`);
      };
      term(A, 't²', true);
      term(B, 't', parts.length === 0);
      term(C, '', parts.length === 0);
      return `${parts.join(' ') || '0'} = 0`;
    }
    const posText = (q: ReturnType<typeof pointPosition>) => (q === 'on' ? tt('auf K', 'on K') : q === 'inside' ? tt('innerhalb von K', 'inside K') : tt('außerhalb von K', 'outside K'));

    /* ---------------- Ziehen ---------------- */
    const r05 = (v: number, lo: number, hi: number) => clamp(Math.round(v * 2) / 2, lo, hi);
    const dragged = () => (lastDrag = performance.now());
    const editable = () => !ctx.locked && !animating() && !sweeping();
    /** Richtung des Radius im Bild (rechts unten). */
    const radDir = (): Vec3 => vec3.normalize(vec3.add(vec3.scale(view.camera.right, 0.92), vec3.scale(view.camera.up, -0.4)));
    view.addHandle({
      get: () => V(gm) as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ m1: r05(q[0], -4, 4), m2: r05(q[1], -4, 4), m3: r05(q[2], -4, 4) });
      },
      get plane() {
        return view.camera.back;
      },
      enabled: editable,
      color: () => ctx.theme.text,
    });
    view.addHandle({
      get: () => vec3.add(V(gm) as Vec3, vec3.scale(radDir(), gr.at(now))),
      set: (q) => {
        dragged();
        ctx.set({ r: clamp(Math.round(vec3.dot(vec3.sub(q, tM() as Vec3), radDir()) * 4) / 4, 0.5, 5) });
      },
      get axis() {
        return radDir();
      },
      enabled: () => editable() && mode() === 'sphere',
      color: CK,
    });
    view.addHandle({
      get: () => V(gp) as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ p1: r05(q[0], -8, 8), p2: r05(q[1], -8, 8), p3: r05(q[2], -8, 8) });
      },
      get plane() {
        return view.camera.back;
      },
      enabled: () => editable() && mode() === 'sphere',
      color: CP,
    });
    // Ebene entlang ihrer Normalen verschieben (Griff im Lotfußpunkt M′)
    const planeFoot = (): Vec3 => {
      const n = tN();
      return (norm(n) > 0 ? sub(tM(), vec3.scale(vec3.normalize(n), signedDistance(tM(), n, p.c)) as V3) : tM()) as Vec3;
    };
    view.addHandle({
      get: () => {
        const n = V(gn);
        const m = V(gm);
        return (norm(n) > 1e-6 ? sub(m, vec3.scale(vec3.normalize(n), signedDistance(m, n, gc.at(now))) as V3) : m) as Vec3;
      },
      set: (q) => {
        dragged();
        ctx.set({ c: clamp(Math.round(dot(tN(), q) * 2) / 2, -40, 40) });
      },
      get axis() {
        return vec3.normalize(tN());
      },
      enabled: () => editable() && mode() === 'plane' && norm(tN()) > 0 && vec3.distance(planeFoot(), tM() as Vec3) > 0.35,
      color: CE,
    });
    view.addHandle({
      get: () => V(ga) as Vec3,
      set: (q) => {
        dragged();
        ctx.set({ a1: r05(q[0], -8, 8), a2: r05(q[1], -8, 8), a3: r05(q[2], -8, 8) });
      },
      get plane() {
        return view.camera.back;
      },
      enabled: () => editable() && mode() === 'line',
      color: CG,
    });
    view.addHandle({
      get: () => vec3.add(V(ga) as Vec3, V(gu) as Vec3),
      set: (q) => {
        dragged();
        const u = [0, 1, 2].map((k) => r05(q[k]! - tA()[k]!, -3, 3));
        if (u.every((v) => v === 0)) return;
        ctx.set({ u1: u[0]!, u2: u[1]!, u3: u[2]! });
      },
      get plane() {
        return view.camera.back;
      },
      enabled: () => editable() && mode() === 'line',
      color: CG,
    });
    view.addHandle({
      get: () => projectToSphere(V(gm), gr.at(now), V(gb)) as Vec3,
      set: (q) => {
        dragged();
        const b = projectToSphere(tM(), p.r, q as V3);
        const r1 = (v: number) => clamp(Math.round(v * 10) / 10, -9, 9);
        ctx.set({ b1: r1(b[0]), b2: r1(b[1]), b3: r1(b[2]) });
      },
      get plane() {
        return view.camera.back;
      },
      enabled: () => editable() && mode() === 'tangent',
      color: CT,
    });

    /* ---------------- Zeichenhilfen ---------------- */
    const O: Vec3 = [0, 0, 0];

    function introOf(delay: number, ms = 700): number {
      if (reduced) return 1;
      return clamp((now - introStart - delay) / ms, 0, 1);
    }

    /** Vektorname mit Pfeil darüber an einem Weltpunkt. */
    function vecLabel(at: Vec3, name: string, color: string, offset: [number, number], size = 15, a = 1): void {
      view.custom(
        at,
        (g) => {
          const [x0, y0] = view.toPx(at);
          const x = x0 + offset[0];
          const y = y0 + offset[1];
          g.save();
          g.globalAlpha = a;
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

    /** Beschriftung eines Punktes mit Schild; weicht Bildrand und Zoom-Knöpfen aus. */
    function ptLabel(q: Vec3, txt: string, color: string, a = 1, dy = -10, size = 13, side: 1 | -1 = 1): void {
      if (a < 0.05) return;
      const R = regions().scene;
      // schmale Bühne: nur der Name, die Koordinaten stehen in der Tafel
      if (R.w < 520) txt = txt.replace(/\s*≈?\s*\(.*$/, '');
      const [x, y] = view.toPx(q);
      const g = surface.g;
      g.font = font(800, size);
      const w = g.measureText(txt).width + 14;
      const top = y + dy - size < R.y + 8;
      const yy = top ? y + Math.abs(dy) + size : y + dy;
      const bad = (s0: number) => {
        const l = s0 > 0 ? x + 12 - 7 : x - 12 - w + 7;
        const r = l + w;
        const zoom = r > R.x + R.w - 56 && yy - size < R.y + 128;
        return l < R.x + 4 || r > R.x + R.w - 4 || zoom;
      };
      let sd: number = side;
      if (bad(sd) && !bad(-sd)) sd = -sd;
      view.label(q, txt, {
        color: a < 1 ? alpha(color, a) : color,
        size,
        weight: '800',
        offset: [sd > 0 ? 12 : -12, top ? Math.abs(dy) + 4 : dy],
        align: sd > 0 ? 'left' : 'right',
        baseline: top ? 'top' : 'bottom',
        background: alpha(cardBg(), 0.82 * a),
      });
    }

    function rightAngle(at: Vec3, u: Vec3, v: Vec3, size: number, color: string, a = 1): void {
      const uu = vec3.scale(vec3.normalize(u), size);
      const vv = vec3.scale(vec3.normalize(v), size);
      view.polyline([vec3.add(at, uu), vec3.add(vec3.add(at, uu), vv), vec3.add(at, vv)], { color, width: 1.6, alpha: a });
    }

    /** Streckenbeschriftung neben der Mitte, auf der Seite in Bildrichtung `pref`. */
    function segLabel(a: Vec3, b: Vec3, txt: string, color: string, pref: [number, number] = [0, -1], alphaV = 1): void {
      if (alphaV < 0.05) return;
      const [ax, ay] = view.toPx(a);
      const [bx, by] = view.toPx(b);
      const l = Math.hypot(bx - ax, by - ay) || 1;
      let nx = -(by - ay) / l;
      let ny = (bx - ax) / l;
      if (nx * pref[0] + ny * pref[1] < 0) {
        nx = -nx;
        ny = -ny;
      }
      const g = surface.g;
      g.font = font(800, 12);
      const w = g.measureText(txt).width;
      const off = 12 + Math.abs(nx) * (w / 2 + 4);
      view.label(vec3.lerp(a, b, 0.5), txt, { color, size: 12, weight: '800', align: 'center', baseline: 'middle', offset: [nx * off, ny * (off * 0.6 + 6)], background: alpha(cardBg(), 0.85 * alphaV) });
    }

    /* ---------------- Kugel ---------------- */
    const LIGHT: Vec3 = vec3.normalize([-0.42, 0.74, 0.52]);

    /** Durchsichtige Glaskugel mit Umriss, Glanz, Breiten- und Längenkreisen. */
    function drawSphere(m: Vec3, r: number, focus: number): void {
      if (r < 0.02) return;
      const theme = ctx.theme;
      const cam = view.camera;
      const C = cam.position;
      const dv = vec3.sub(C, m);
      const Ld = vec3.length(dv);
      if (Ld <= r * 1.01) return;
      const base = CK();
      // Schatten auf dem Boden, wenn die Kugel darüber schwebt
      if (m[2] - r > -0.01) {
        const sh = circlePoints([m[0], m[1], 0], [0, 0, 1], r * 0.92, 24) as Vec3[];
        view.shadow(sh, { alpha: 0.1 * clamp(1 - (m[2] - r) / 8, 0.3, 1), blur: 18, spread: 1 });
      }
      // Umriss: Berührkreis der Sehkegel-Tangenten
      const k = (r * r) / (Ld * Ld);
      const sc = vec3.add(m, vec3.scale(dv, k));
      const rs = r * Math.sqrt(1 - k);
      const rim = circlePoints(sc as V3, dv as V3, rs, 96) as Vec3[];
      const lw = vec3.add(vec3.add(vec3.scale(cam.right, LIGHT[0]), vec3.scale(cam.up, LIGHT[1])), vec3.scale(cam.back, LIGHT[2]));
      const hl = vec3.add(m, vec3.scale(lw, r * 0.55));
      view.custom(sc, (g) => {
        const pts = rim.map((q) => view.toPx(q));
        let cx = 0;
        let cy = 0;
        for (const [x, y] of pts) {
          cx += x / pts.length;
          cy += y / pts.length;
        }
        const R = Math.max(...pts.map(([x, y]) => Math.hypot(x - cx, y - cy)));
        const [hx, hy] = view.toPx(hl);
        const dk = theme.dark;
        const fa = 0.75 + 0.25 * focus;
        const gr0 = g.createRadialGradient(hx, hy, R * 0.04, cx, cy, R);
        gr0.addColorStop(0, mixColor(base, '#ffffff', dk ? 0.45 : 0.75, (dk ? 0.42 : 0.6) * fa));
        gr0.addColorStop(0.28, mixColor(base, '#ffffff', dk ? 0.12 : 0.35, (dk ? 0.2 : 0.2) * fa));
        gr0.addColorStop(0.78, alpha(base, (dk ? 0.2 : 0.17) * fa));
        gr0.addColorStop(1, mixColor(base, '#000000', dk ? 0.1 : 0.25, (dk ? 0.42 : 0.42) * fa));
        g.save();
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.fillStyle = gr0;
        g.fill();
        g.lineWidth = 1.8;
        g.strokeStyle = mixColor(base, theme.dark ? '#ffffff' : '#0b1220', 0.15, 0.85);
        g.stroke();
        // kleiner Lichtreflex
        g.beginPath();
        g.ellipse(hx - R * 0.05, hy - R * 0.05, R * 0.16, R * 0.09, -0.6, 0, Math.PI * 2);
        g.fillStyle = `rgba(255,255,255,${(dk ? 0.18 : 0.42) * fa})`;
        g.fill();
        g.restore();
      });
      // Breiten- und Längenkreise: vorn kräftiger, hinten zart gestrichelt
      const wire = mixColor(base, theme.text, theme.dark ? 0.15 : 0.25);
      const circles: { pts: Vec3[]; strong: boolean }[] = [];
      for (const lat of [-60, -30, 0, 30, 60]) {
        const phi = (lat * Math.PI) / 180;
        circles.push({ pts: circlePoints([m[0], m[1], m[2] + r * Math.sin(phi)], [0, 0, 1], r * Math.cos(phi), 64) as Vec3[], strong: lat === 0 });
      }
      for (let lon = 0; lon < 180; lon += 30) {
        const th = (lon * Math.PI) / 180;
        circles.push({ pts: circlePoints(m as V3, [-Math.sin(th), Math.cos(th), 0], r, 64) as Vec3[], strong: false });
      }
      for (const c of circles) {
        let run: Vec3[] = [];
        let front: boolean | null = null;
        const flush = () => {
          if (run.length > 1) view.polyline(run, front ? { color: wire, width: c.strong ? 1.5 : 1.1, alpha: (c.strong ? 0.6 : 0.42) * focus } : { color: wire, width: 0.9, alpha: 0.2 * focus, dash: [3, 4] });
        };
        for (const q of c.pts) {
          const f = vec3.dot(vec3.sub(q, m), vec3.sub(C, q)) > 0;
          if (front === null) front = f;
          if (f !== front) {
            run.push(q);
            flush();
            run = [q];
            front = f;
          } else run.push(q);
        }
        flush();
      }
    }

    /** Ebenenstück (aus kleinen Vierecken für die Tiefensortierung) um `center`. */
    function drawPlanePatch(center: Vec3, n: Vec3, half: number, color: string, a: number, label?: string): void {
      if (a < 0.01) return;
      const [u, v] = planeBasis(n as V3) as [Vec3, Vec3];
      const P = (s: number, t: number): Vec3 => vec3.add(center, vec3.add(vec3.scale(u, s * half), vec3.scale(v, t * half)));
      const N = 6;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const s0 = -1 + (2 * i) / N;
          const s1 = -1 + (2 * (i + 1)) / N;
          const t0 = -1 + (2 * j) / N;
          const t1 = -1 + (2 * (j + 1)) / N;
          view.face([P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1)], { color, alpha: (ctx.theme.dark ? 0.16 : 0.13) * a, flat: true });
        }
      }
      for (let i = 1; i < N; i += 1) {
        const s = -1 + (2 * i) / N;
        view.segment(P(s, -1), P(s, 1), { color, width: 0.8, alpha: 0.22 * a });
        view.segment(P(-1, s), P(1, s), { color, width: 0.8, alpha: 0.22 * a });
      }
      view.polyline([P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)], { color, width: 1.8, alpha: 0.75 * a, closed: true });
      if (label) {
        // Beschriftung an der Ecke, die im Bild am weitesten oben liegt
        const corners = [P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)];
        const R = regions().scene;
        const inside = corners.filter((q) => {
          const [x, y] = view.toPx(q);
          return x > R.x + 30 && x < R.x + R.w - 60 && y > R.y + 50 && y < R.y + R.h - 30;
        });
        const list = inside.length ? inside : corners;
        const best = list.reduce((b, q) => (view.toPx(q)[1] < view.toPx(b)[1] ? q : b));
        const at = vec3.lerp(best, center, 0.12);
        view.label(at, label, { color, size: 16, weight: '800', math: true, align: 'center', baseline: 'middle', background: alpha(cardBg(), 0.75 * a) });
      }
    }

    /** Seite der Beschriftung von M: weg von der Hauptkonstruktion. */
    function mLabelSide(m: Vec3): 1 | -1 {
      let away: V3 | null = null;
      const M0 = tM();
      if (mode() === 'sphere') away = tP();
      else if (mode() === 'tangent') away = projectToSphere(M0, p.r, tB());
      else if (mode() === 'line') {
        const cut = sphereLine(M0, p.r, tA(), tU());
        if (cut) away = cut.kind === 'secant' ? cut.points[0]! : cut.closest;
      } else {
        const cut = spherePlane(M0, p.r, tN(), p.c);
        if (cut && cut.d > 0.3) away = cut.foot;
      }
      if (!away) return -1;
      return view.toPx(away as Vec3)[0] < view.toPx(m)[0] ? 1 : -1;
    }

    /* ---------------- Szene ---------------- */
    function drawScene(): void {
      const theme = ctx.theme;
      const lo = glo.at(now);
      const hi = ghi.at(now);
      view.setScene({ target: V(gt) as Vec3, radius: grad.at(now) * (regions().scene.w < 520 ? 0.88 : 1), anchor: [0.5, 0.52] });
      view.begin();
      const grow = reduced ? 1 : ease.outCubic(introOf(0, 800));
      if (p.grid) view.grid({ min: [lo, lo], max: [hi, hi], step: 1, color: theme.gridMinor, fade: true });
      view.axes({ min: lo * grow, max: (hi + 0.5) * grow, color: alpha(theme.axis, 0.8), width: 1.4 });
      view.point(O, { color: theme.text, radius: 3 });

      const m = V(gm) as Vec3;
      const pop = reduced ? 1 : ease.outBack(introOf(250, 900));
      const r = gr.at(now) * pop;
      const focus = clamp(1 - 0.25 * (modeA.plane.at(now) + modeA.tangent.at(now)), 0.6, 1);
      drawSphere(m, Math.max(0, r), focus);

      // Mittelpunkt M
      view.ball(m, 0.11 + 0.02 * Math.min(r, 3), { color: theme.text });
      ptLabel(m, p.show ? `M${pt(tM())}` : 'M', theme.text, introOf(500, 400), 24, 12.5, mLabelSide(m));
      view.label(vec3.add(m, vec3.scale(vec3.normalize(vec3.add(vec3.scale(view.camera.up, 0.75), vec3.scale(view.camera.right, -0.66))), r * 1.04)), 'K', { color: CK(), size: 17, weight: '800', math: true, align: 'right', baseline: 'bottom', background: alpha(cardBg(), 0.7) });

      for (const md of MODES) {
        const a = modeA[md].at(now);
        if (a < 0.01) continue;
        if (md === 'sphere') drawProbe(m, r, a);
        else if (md === 'plane') drawPlaneMode(m, r, a);
        else if (md === 'line') drawLineMode(m, r, a);
        else drawTangentMode(m, r, a);
      }
      view.end();
    }

    /** Kugelgleichung: Radius und Punktprobe mit P. */
    function drawProbe(m: Vec3, r: number, A: number): void {
      const theme = ctx.theme;
      const u1 = phase(0, 0.4) * A;
      const u2 = phase(0.45, 0.9);
      const rd = radDir();
      const edge = vec3.add(m, vec3.scale(rd, r * u1));
      view.segment(m, edge, { color: CK(), width: 2.6, alpha: A });
      if (u1 > 0.5) segLabel(m, edge, `r = ${n1(p.r)}`, CK(), [0, 1], A * clamp((u1 - 0.5) * 2, 0, 1));
      const P = V(gp) as Vec3;
      const pos = pointPosition(tM(), p.r, tP());
      const col = pos === 'on' ? CE() : pos === 'inside' ? CP() : CS();
      if (u2 > 0) {
        const tip = vec3.lerp(m, P, u2);
        view.segment(m, tip, { color: theme.muted, width: 1.6, dash: [5, 4], alpha: A });
        if (u2 > 0.95 && p.show) segLabel(m, P, `|MP| = ${sqrtText(sphereLhs(tM(), tP()))} ${pos === 'on' ? '=' : pos === 'inside' ? '<' : '>'} r`, col, [0, -1], A);
      }
      view.ball(P, 0.15, { color: CP(), alpha: A });
      ptLabel(P, `P${pt(tP())}`, theme.text, A);
    }

    function drawPlaneMode(m: Vec3, r: number, A: number): void {
      const theme = ctx.theme;
      const nv = V(gn) as Vec3;
      if (vec3.length(nv) < 1e-6) return;
      const nh = vec3.normalize(nv);
      // Abstand σ des Mittelpunkts (vorzeichenbehaftet); beim Schieben animiert
      let sigma = signedDistance(m as V3, nv as V3, gc.at(now));
      const sw = sweepSigma();
      if (sw !== null) sigma = sw;
      const foot = vec3.sub(m, vec3.scale(nh, sigma));
      const d = Math.abs(sigma);
      const u1 = phase(0, 0.3);
      const u2 = phase(0.3, 0.6);
      const u3 = phase(0.6, 0.95);
      const half = Math.max(2.2, r * 1.25);
      drawPlanePatch(vec3.add(foot, vec3.scale(nh, (1 - u1) * 1.5)), nv, half, CE(), A * u1, 'E');
      const rho2 = r * r - d * d;
      const eps = 1e-6 * Math.max(1, r * r);
      const kind = Math.abs(rho2) <= eps ? 'tangent' : rho2 < 0 ? 'none' : 'circle';
      // Lot von M auf E
      if (d > 0.02 && u2 > 0) {
        view.segment(m, vec3.lerp(m, foot, u2), { color: theme.text, width: 1.8, dash: [5, 4], alpha: A });
        if (u2 > 0.9) segLabel(m, foot, p.show ? `d = ${n1(d)}` : 'd', theme.text, [-1, 0], A);
      }
      if (kind === 'circle') {
        const rho = Math.sqrt(rho2);
        const pts = circlePoints(foot as V3, nv as V3, rho, 96) as Vec3[];
        const k = Math.max(2, Math.round(96 * u3) + 1);
        if (u3 > 0) {
          view.face(pts.slice(0, -1), { color: CS(), alpha: 0.2 * A * u3, flat: true });
          view.polyline(pts.slice(0, k), { color: CS(), width: 3.2, alpha: A });
        }
        if (u3 > 0.9) {
          // Radius ρ im Bild nach rechts zeichnen (Anteil von „rechts“ in der Ebene)
          const rr = vec3.sub(view.camera.right, vec3.scale(nh, vec3.dot(view.camera.right, nh)));
          const uu = vec3.length(rr) > 0.2 ? vec3.normalize(rr) : (planeBasis(nv as V3)[0] as Vec3);
          const q = vec3.add(foot, vec3.scale(uu, rho));
          view.segment(foot, q, { color: CS(), width: 2, alpha: A });
          view.segment(m, q, { color: CK(), width: 1.4, alpha: 0.8 * A });
          if (d > 0.25 && rho > 0.3) rightAngle(foot, vec3.sub(m, foot), vec3.sub(q, foot), Math.min(0.3, rho * 0.3, d * 0.4), theme.muted, A);
          segLabel(foot, q, p.show ? `ρ = ${n1(rho)}` : 'ρ', CS(), [0, 1], A);
          if (d > 0.25) segLabel(m, q, 'r', CK(), [0.3, -1], A);
        }
        view.point(foot, { color: CS(), radius: 4.5 * A });
        if (u2 > 0.6 && d > 0.3) ptLabel(foot, p.show && !sweeping() ? `M′${ptA(spherePlane(tM(), p.r, tN(), p.c)?.foot ?? (foot as V3))}` : 'M′', CS(), A, 12, 13, -1);
      } else if (kind === 'tangent') {
        view.ball(foot, 0.15, { color: CS(), alpha: A });
        if (u2 > 0.6 && d > 0.3) ptLabel(foot, p.show && !sweeping() ? `B${pt(spherePlane(tM(), p.r, tN(), p.c)?.foot ?? (foot as V3))}` : 'B', CS(), A);
      } else {
        view.point(foot, { color: theme.muted, radius: 4 * A });
        if (u2 > 0.6) ptLabel(foot, 'F', theme.muted, A);
      }
    }

    /** Signierter Abstand beim „Durchschieben“ (oder null). */
    function sweepSigma(): number | null {
      if (!sweeping()) return null;
      const s0 = signedDistance(tM(), tN(), p.c);
      if (!Number.isFinite(s0)) return null;
      const far = p.r + 1.2;
      const t = (now - sweepStart) / SWEEP_MS;
      const seg = (a: number, b: number) => ease.inOutCubic(clamp((t - a) / (b - a), 0, 1));
      if (t < 0.14) return s0 + (far - s0) * seg(0, 0.14);
      if (t < 0.86) return far - 2 * far * seg(0.14, 0.86);
      return -far + (s0 + far) * seg(0.86, 1);
    }

    function drawLineMode(m: Vec3, r: number, A: number): void {
      const theme = ctx.theme;
      const a = V(ga) as Vec3;
      const u = V(gu) as Vec3;
      const cut = sphereLine(m as V3, r, a as V3, u as V3);
      if (!cut) return;
      const ul = vec3.length(u);
      const span = (r + 2.5) / ul;
      const t0 = Math.min(cut.tClosest - span, -0.8 / ul);
      const t1 = Math.max(cut.tClosest + span, 1 + 0.8 / ul);
      const X = (t: number): Vec3 => vec3.add(a, vec3.scale(u, t));
      const u1 = phase(0, 0.35);
      const run = phase(0.35, 0.95);
      const te = t0 + (t1 - t0) * u1;
      const ts = cut.ts;
      // Gerade: außen in Geradenfarbe, innerhalb der Kugel als Sehne hervorgehoben
      if (cut.kind === 'secant') {
        const [s1, s2] = ts as [number, number];
        if (te > t0) view.segment(X(t0), X(Math.min(te, s1)), { color: CG(), width: 2.6, alpha: A });
        if (te > s1) view.segment(X(s1), X(Math.min(te, s2)), { color: CS(), width: 4.2, alpha: A });
        if (te > s2) view.segment(X(s2), X(te), { color: CG(), width: 2.6, alpha: A });
      } else view.segment(X(t0), X(te), { color: CG(), width: 2.6, alpha: A });
      if (u1 > 0.9) view.label(X(t0 + (t1 - t0) * 0.04), 'g', { color: CG(), size: 17, weight: '800', math: true, offset: [12, -6], align: 'left', baseline: 'middle' });
      // Aufpunkt und Richtungsvektor
      view.ball(a, 0.12, { color: CG(), alpha: A });
      ptLabel(a, `A${pt(tA())}`, CG(), A * clamp(u1 * 2, 0, 1));
      if (ul > 1e-6) {
        view.arrow(a, vec3.add(a, u), { color: CG(), width: 3.6, head: 13, alpha: A });
        const [ax, ay] = view.toPx(a);
        const [bx, by] = view.toPx(vec3.add(a, u));
        const l = Math.hypot(bx - ax, by - ay) || 1;
        const sg = -(by - ay) / l > 0 ? -1 : 1;
        vecLabel(vec3.lerp(a, vec3.add(a, u), 0.55), 'u', CG(), [sg * (-(by - ay) / l) * 15, sg * ((bx - ax) / l) * 15], 15, A);
      }
      // Läufer X(t) beim Abspielen
      if (run > 0 && run < 1) {
        const tr = t0 + (t1 - t0) * run;
        const q = X(tr);
        const inside = sphereLhs(m as V3, q as V3) < r * r;
        view.ball(q, 0.13, { color: inside ? CS() : theme.text, alpha: A });
      }
      const tRun = run > 0 && run < 1 ? t0 + (t1 - t0) * run : Infinity;
      // Schnitt- bzw. Berührpunkte
      cut.points.forEach((q, i) => {
        const tq = ts[i]!;
        const s = tRun === Infinity ? (u1 > 0.95 ? 1 : 0) : clamp((tRun - tq) * ul * 1.6, 0, 1);
        if (s <= 0) return;
        view.ball(q as Vec3, 0.17 * (0.5 + 0.5 * ease.outBack(s)), { color: CS(), alpha: A });
        const name = cut.kind === 'tangent' ? 'B' : `S${SUB[i]}`;
        const exact = sphereLine(tM(), p.r, tA(), tU());
        const tq2 = exact?.points[i];
        ptLabel(q as Vec3, p.show && tq2 ? `${name}${pt(tq2)}` : name, CS(), A * s, i === 0 ? 14 : -10);
      });
      // Abstand des Mittelpunkts zur Geraden bei Tangente/Passante
      if (cut.kind !== 'secant' && u1 > 0.95) {
        view.segment(m, cut.closest as Vec3, { color: theme.text, width: 1.6, dash: [5, 4], alpha: A });
        if (cut.dist > 0.3) rightAngle(cut.closest as Vec3, vec3.sub(m, cut.closest as Vec3), u, 0.28, theme.muted, A);
        segLabel(m, cut.closest as Vec3, p.show ? `d = ${n1(cut.dist)}` : 'd', theme.text, [0, -1], A);
        if (cut.kind === 'passante') view.point(cut.closest as Vec3, { color: theme.muted, radius: 4 * A });
      }
    }

    function drawTangentMode(m: Vec3, r: number, A: number): void {
      const theme = ctx.theme;
      const B = projectToSphere(m as V3, r, V(gb)) as Vec3;
      const nv = vec3.sub(B, m);
      if (vec3.length(nv) < 1e-6) return;
      const u1 = phase(0, 0.4);
      const u2 = phase(0.45, 0.9);
      view.arrow(m, vec3.lerp(m, B, Math.max(0.02, u1)), { color: CG(), width: 3.4, head: 13, alpha: A });
      if (u1 > 0.9) {
        const [ax, ay] = view.toPx(m);
        const [bx, by] = view.toPx(B);
        const l = Math.hypot(bx - ax, by - ay) || 1;
        let ox = -(by - ay) / l;
        let oy = (bx - ax) / l;
        if (oy > 0) {
          ox = -ox;
          oy = -oy;
        }
        vecLabel(vec3.lerp(m, B, 0.5), 'MB', CG(), [ox * 17, oy * 17], 14, A);
      }
      // Normale über B hinaus angedeutet
      if (u2 > 0) view.segment(B, vec3.add(B, vec3.scale(vec3.normalize(nv), 1.2 * u2)), { color: CG(), width: 1.4, dash: [4, 4], alpha: A * 0.8 });
      const half = Math.max(1.8, r * 1.05);
      drawPlanePatch(vec3.add(B, vec3.scale(vec3.normalize(nv), (1 - u2) * 1.2)), nv, half, CT(), A * u2, 'T');
      if (u2 > 0.9) {
        const [uu] = planeBasis(nv as V3) as [Vec3, Vec3];
        rightAngle(B, vec3.scale(nv, -1), uu, Math.min(0.4, r * 0.25), theme.muted, A);
      }
      view.ball(B, 0.16, { color: CT(), alpha: A });
      const exact = pointPosition(tM(), p.r, tB()) === 'on';
      const bt = projectToSphere(tM(), p.r, tB());
      ptLabel(B, `B${exact ? '' : ' ≈ '}${pt(bt)}`, CT(), A);
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
      const gr0 = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      gr0.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      gr0.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = gr0;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.stroke();
      g.restore();
    }

    type Tok = { kind: 'col'; v: (number | string)[]; color: string } | { kind: 'txt'; s: string; color?: string; math?: boolean } | { kind: 'vec'; s: string; color: string };
    const cell = (v: number | string) => (typeof v === 'number' ? n1(v) : v);

    function tokWidth(t: Tok, size: number): number {
      const g = surface.g;
      if (t.kind === 'col') {
        g.font = font(750, size);
        return Math.max(...t.v.map((v) => g.measureText(cell(v)).width)) + 2 * (size * 0.45) + 6;
      }
      g.font = t.kind === 'vec' || t.math ? mfont(size + 1) : font(650, size);
      return g.measureText(t.s).width + (t.kind === 'txt' ? 5 : 4);
    }

    function drawToks(toks: Tok[], x: number, y: number, maxW: number, size0: number): void {
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

    /** Text einzeilig, bei Bedarf kleiner gesetzt. */
    function fitText(s: string, x: number, y: number, maxW: number, size0: number, color: string, weight = 700, align: CanvasTextAlign = 'left'): void {
      const g = surface.g;
      let size = size0;
      g.font = font(weight, size);
      while (size > 9.5 && g.measureText(s).width > maxW) {
        size -= 0.5;
        g.font = font(weight, size);
      }
      text(g, s, x, y, { font: font(weight, size), color, align });
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
      let y = R.y + 20;
      const res = p.show;
      const q = (s: string) => (res ? s : '?');
      const m = tM();
      const r = p.r;
      const compact = !wide && R.h < 230;
      const lh = compact ? 18 : 20;
      const row = (label: string, value: string, color = theme.text) => {
        g.font = font(800, 12);
        const vw = Math.min(g.measureText(value).width, w * 0.7);
        fitText(label, x0, y, w - vw - 8, 12, theme.muted, 600);
        fitText(value, x0 + w, y, w * 0.7, 12, color, 800, 'right');
        y += lh;
      };
      const big = wide ? 14 : 12.5;
      const titles: Record<Mode, string> = {
        sphere: tt('Kugelgleichung und Punktprobe', 'Equation of a sphere, point test'),
        plane: tt('Kugel und Ebene', 'Sphere and plane'),
        line: tt('Kugel und Gerade', 'Sphere and line'),
        tangent: tt('Tangentialebene', 'Tangent plane'),
      };
      fitText(titles[mode()], x0, y, w, 14, theme.text, 800);
      y += compact ? 36 : 42;
      if (mode() === 'sphere') {
        drawToks([{ kind: 'txt', s: 'K:', math: true }, { kind: 'txt', s: '[' }, { kind: 'vec', s: 'x', color: theme.text }, { kind: 'txt', s: '−' }, { kind: 'col', v: [...m], color: theme.text }, { kind: 'txt', s: ']²' }, { kind: 'txt', s: '=' }, { kind: 'txt', s: `${n1(r)}²`, color: CK() }], x0, y, w, big);
        y += compact ? 34 : 40;
        fitText(sphereText(m, r), x0, y, w, 12.5, CK(), 750);
        y += lh + 2;
        const P = tP();
        const lhs = sphereLhs(m, P);
        const pos = pointPosition(m, r, P);
        fitText(`${tt('Punktprobe', 'Point test')} P${pt(P)}:`, x0, y, w, 12, theme.muted, 650);
        y += lh - 2;
        fitText(`${[0, 1, 2].map((k) => `(${n1(P[k]!)} ${m[k]! < 0 ? '+' : '−'} ${n1(Math.abs(m[k]!))})²`).join(' + ')} = ${q(n1(lhs))}`, x0, y, w, 12, theme.text, 700);
        y += lh;
        const cmp = pos === 'on' ? '=' : pos === 'inside' ? '<' : '>';
        row(`${q(n1(lhs))} ${res ? cmp : '?'} ${n1(r * r)}`, q(tt(`P liegt ${posText(pos)}`, `P lies ${posText(pos)}`)), pos === 'on' ? CE() : pos === 'inside' ? CP() : CS());
        row('|MP|', q(sqrtText(lhs)));
      } else if (mode() === 'plane') {
        const n = tN();
        const ln = norm(n);
        const sw = sweepSigma();
        const cNow = sw !== null ? dot(n, m) - sw * ln : p.c;
        fitText(`E: ${planeText(n, cNow)}`, x0, y - 6, w, 15, CE(), 800);
        y += lh + 2;
        if (ln < 1e-9) {
          fitText(tt('Normalenvektor = Nullvektor: keine Ebene', 'Normal vector = zero vector: not a plane'), x0, y, w, 12, CS(), 700);
        } else {
          const nm = dot(n, m);
          const lnTxt = nice(ln) ? n1(ln) : `√${n1(ln * ln)}`;
          const dNow = Math.abs(nm - cNow) / ln;
          row(tt('Abstand d(M, E)', 'Distance d(M, E)'), q(`|${n1(nm)} − ${paren(cNow)}| / ${lnTxt} = ${n1(dNow)}`));
          const cut = spherePlane(m, r, n, cNow)!;
          const vs = cut.kind === 'circle' ? '<' : cut.kind === 'tangent' ? '=' : '>';
          const verdict = cut.kind === 'circle' ? tt('Schnittkreis', 'circle of intersection') : cut.kind === 'tangent' ? tt('Berührpunkt', 'point of contact') : tt('kein gemeinsamer Punkt', 'no common point');
          row(res ? `d ${vs} r = ${n1(r)}` : 'd ? r', q(verdict), cut.kind === 'none' ? theme.muted : CS());
          if (cut.kind === 'circle') {
            row(tt('Mittelpunkt M′', 'Centre M′'), q(ptA(cut.foot).trim()), CS());
            row('ρ = √(r² − d²)', q(`√(${n1(r * r)} − ${n1(cut.d * cut.d)}) ${nice(cut.rho) ? '=' : '≈'} ${n1(cut.rho)}`), CS());
          } else if (cut.kind === 'tangent') row(tt('Berührpunkt B', 'Point of contact B'), q(pt(cut.foot)), CS());
          else row(tt('Lotfußpunkt F', 'Foot of perpendicular F'), q(pt(cut.foot)));
        }
      } else if (mode() === 'line') {
        const a = tA();
        const u = tU();
        drawToks([{ kind: 'txt', s: 'g:', math: true }, { kind: 'vec', s: 'x', color: theme.text }, { kind: 'txt', s: '=' }, { kind: 'col', v: [...a], color: CG() }, { kind: 'txt', s: '+ t ·' }, { kind: 'col', v: [...u], color: CG() }], x0, y, w, big);
        y += compact ? 34 : 40;
        const cut = sphereLine(m, r, a, u);
        if (!cut) fitText(tt('Richtungsvektor = Nullvektor: keine Gerade', 'Direction vector = zero vector: not a line'), x0, y, w, 12, CS(), 700);
        else {
          fitText(`${tt('Einsetzen in K', 'Substitute into K')}: ${q(quadText(cut.A, cut.B, cut.C))}`, x0, y, w, 12, theme.text, 700);
          y += lh;
          const sg = cut.D > 0 ? '> 0' : cut.D < 0 ? '< 0' : '= 0';
          row('D = B² − 4AC', q(`${n1(cut.D)} ${sg}`));
          const verdict = cut.kind === 'secant' ? tt('Sekante: 2 Schnittpunkte', 'secant: 2 intersection points') : cut.kind === 'tangent' ? tt('Tangente: 1 Berührpunkt', 'tangent: 1 point of contact') : tt('Passante: kein Schnittpunkt', 'passing line: no intersection');
          row(tt('Lage', 'Position'), q(verdict), cut.kind === 'passante' ? theme.muted : CS());
          if (cut.kind === 'secant') {
            row(`t₁ = ${q(n1(cut.ts[0]!))}`, q(`S₁${pt(cut.points[0]!)}`), CS());
            row(`t₂ = ${q(n1(cut.ts[1]!))}`, q(`S₂${pt(cut.points[1]!)}`), CS());
          } else if (cut.kind === 'tangent') row(`t = ${q(n1(cut.ts[0]!))}`, q(`B${pt(cut.points[0]!)}`), CS());
          else row(tt('Abstand d(M, g)', 'Distance d(M, g)'), q(`${n1(cut.dist)} > ${n1(r)}`));
        }
      } else {
        const b = projectToSphere(m, r, tB());
        const exact = pointPosition(m, r, tB()) === 'on';
        const t = tangentPlane(m, b);
        const red = reducePlane(t.n, t.c);
        drawToks([{ kind: 'txt', s: 'T:', math: true }, { kind: 'txt', s: '[' }, { kind: 'vec', s: 'x', color: theme.text }, { kind: 'txt', s: '−' }, { kind: 'col', v: [...b], color: CT() }, { kind: 'txt', s: ']·' }, { kind: 'col', v: res ? [...t.n] : ['?', '?', '?'], color: CG() }, { kind: 'txt', s: '= 0' }], x0, y, w, big);
        y += compact ? 34 : 40;
        row(`B${exact ? '' : ' ≈'}`, pt(b), CT());
        row(`${tt('Normalenvektor', 'Normal vector')} B − M`, q(pt(t.n)), CG());
        row(tt('Koordinatenform', 'Coordinate form'), q(`${planeText(red.n, red.c)}`), CT());
        row(`|MB| = r`, q(`${sqrtText(sphereLhs(m, b))} = ${n1(r)} ✓`));
      }
      if (wide && y < R.y + R.h - 56) drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(96, R.y + R.h - y - 10) }, tipText());
      g.restore();
    }

    function tipText(): string {
      switch (mode()) {
        case 'sphere':
          return tt('Alle Punkte X mit |MX| = r bilden die Kugel. Punktprobe: Liegt die linke Seite der Kugelgleichung unter, auf oder über r²?', 'All points X with |MX| = r form the sphere. Point test: is the left-hand side of the equation below, equal to or above r²?');
        case 'plane':
          if ((spherePlane(tM(), p.r, tN(), p.c)?.kind ?? 'none') !== 'circle') return tt('Ist d ≥ r, gibt es keinen Schnittkreis: Bei d = r berührt E die Kugel im Lotfußpunkt, bei d > r gibt es keinen gemeinsamen Punkt.', 'If d ≥ r there is no circle: for d = r the plane touches the sphere at the foot of the perpendicular, for d > r there is no common point.');
          return tt('Vergleiche den Abstand d des Mittelpunkts von E mit r. Der Schnittkreis hat den Lotfußpunkt M′ als Mittelpunkt (Pythagoras: ρ² + d² = r²).', 'Compare the distance d of the centre from E with r. The circle of intersection is centred at the foot M′ (Pythagoras: ρ² + d² = r²).');
        case 'line':
          return tt('g in K einsetzen ergibt eine quadratische Gleichung in t. Ihre Diskriminante entscheidet: zwei, ein oder kein gemeinsamer Punkt.', 'Substituting g into K gives a quadratic equation in t. Its discriminant decides: two, one or no common point.');
        default:
          return tt('Die Tangentialebene steht in B senkrecht auf dem Radius MB. Ziehe B über die Kugel.', 'The tangent plane at B is perpendicular to the radius MB. Drag B across the sphere.');
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
    function updateReadouts(): void {
      const m = tM();
      const r = p.r;
      ctx.readout('eq', sphereText(m, r));
      if (mode() === 'sphere') {
        const P = tP();
        const lhs = sphereLhs(m, P);
        const pos = pointPosition(m, r, P);
        ctx.readout('calc', `${[0, 1, 2].map((k) => `(${n1(P[k]!)} ${m[k]! < 0 ? '+' : '−'} ${n1(Math.abs(m[k]!))})²`).join(' + ')} = ${n1(lhs)}`);
        ctx.readout('res', `${n1(lhs)} ${pos === 'on' ? '=' : pos === 'inside' ? '<' : '>'} ${n1(r * r)}: P ${tt('liegt', 'lies')} ${posText(pos)}`);
      } else if (mode() === 'plane') {
        const n = tN();
        const cut = spherePlane(m, r, n, p.c);
        if (!cut) {
          ctx.readout('calc', tt('Normalenvektor = Nullvektor: keine Ebene', 'Normal vector = zero vector: not a plane'));
          ctx.readout('res', null);
          return;
        }
        ctx.readout('calc', `d(M, E) = |${n1(dot(n, m))} − ${paren(p.c)}| / ${n1(norm(n))} = ${n1(cut.d)}`);
        ctx.readout(
          'res',
          cut.kind === 'circle'
            ? tt(`d < r: Schnittkreis mit M′${ptA(cut.foot)} und ρ = √(${n1(r * r)} − ${n1(cut.d * cut.d)}) ≈ ${n1(cut.rho)}`, `d < r: circle with centre M′${ptA(cut.foot)} and ρ = √(${n1(r * r)} − ${n1(cut.d * cut.d)}) ≈ ${n1(cut.rho)}`)
            : cut.kind === 'tangent'
              ? tt(`d = r: E berührt K in ${pt(cut.foot)}`, `d = r: E touches K at ${pt(cut.foot)}`)
              : tt('d > r: E und K haben keinen gemeinsamen Punkt', 'd > r: E and K have no common point'),
        );
      } else if (mode() === 'line') {
        const cut = sphereLine(m, r, tA(), tU());
        if (!cut) {
          ctx.readout('calc', tt('Richtungsvektor = Nullvektor: keine Gerade', 'Direction vector = zero vector: not a line'));
          ctx.readout('res', null);
          return;
        }
        ctx.readout('calc', `${quadText(cut.A, cut.B, cut.C)} · D = ${n1(cut.D)}`);
        ctx.readout(
          'res',
          cut.kind === 'secant'
            ? tt(`Sekante: S₁${pt(cut.points[0]!)}, S₂${pt(cut.points[1]!)}`, `Secant: S₁${pt(cut.points[0]!)}, S₂${pt(cut.points[1]!)}`)
            : cut.kind === 'tangent'
              ? tt(`Tangente: Berührpunkt ${pt(cut.points[0]!)}`, `Tangent: point of contact ${pt(cut.points[0]!)}`)
              : tt(`Passante: Abstand ${n1(cut.dist)} > r`, `Passing line: distance ${n1(cut.dist)} > r`),
        );
      } else {
        const b = projectToSphere(m, r, tB());
        const t = tangentPlane(m, b);
        const red = reducePlane(t.n, t.c);
        ctx.readout('calc', `n = B − M = ${pt(t.n)} · n · B = ${n1(t.c)}`);
        ctx.readout('res', `T: ${planeText(red.n, red.c)}`);
      }
    }

    retarget(true);
    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('mode') && source !== 'init') animStart = reduced ? now - 1e6 : now + 150;
        if (source === 'input' || source === 'replace') sweepStart = -1;
        retarget(source === 'init');
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'play') animStart = reduced ? now - 1e6 : now;
        else if (id === 'sweep' && mode() === 'plane' && norm(tN()) > 0) {
          if (!reduced) sweepStart = now;
          animStart = now - 1e6;
        } else if (id === 'fly') {
          if (!reduced) fly = { t0: now, az: view.azimuth, el: view.elevation, last: view.azimuth };
        }
        ctx.requestRender();
      },
      resetView: () => {
        fly = null;
        view.resetView(true);
      },
      render() {
        now = performance.now();
        surface.begin();
        view.resize();
        if (fly) {
          // abbrechen, wenn die Person selbst dreht
          if (Math.abs(((((view.azimuth - fly.last) % 360) + 540) % 360) - 180) > 0.5) fly = null;
          else {
            const u = clamp((now - fly.t0) / FLY_MS, 0, 1);
            const az = fly.az + 360 * ease.inOutCubic(u);
            view.setCamera({ azimuth: az, elevation: fly.el + 14 * Math.sin(Math.PI * u) });
            fly.last = view.azimuth;
            if (u >= 1) fly = null;
          }
        }
        drawScene();
        drawPanel();
        const busy = glides().some((x) => x.busy(now)) || animating() || sweeping() || fly !== null || (!reduced && now - introStart < 1300);
        if (busy) ctx.requestRender();
        else if (sweepStart >= 0) {
          sweepStart = -1;
          ctx.requestRender();
        }
      },
      destroy: () => surface.destroy(),
    };
  },
});
