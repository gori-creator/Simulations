import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import { angleDeg, cross, crossTerms, dot, handedness, norm, orthogonal, parallelogramArea, projection, projLength, pyramidVolume, spatVolume, triple, type V3 } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Mode = 'dot' | 'cross' | 'spat';

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

const comp = <K extends string>(key: K, label: string, def: number, show?: (v: Record<string, unknown>) => boolean) => ({
  key,
  type: 'number' as const,
  group: 'vec',
  label: L(label, label),
  min: -4,
  max: 4,
  step: 0.5,
  default: def,
  visibleIf: show,
});

/**
 * Skalarprodukt und Vektorprodukt: Winkel zwischen zwei Vektoren mit
 * Projektion und Orthogonalität, Vektorprodukt als Normalenvektor mit
 * Parallelogrammfläche, Spatprodukt als Volumen des Spats. Spitzen ziehbar,
 * Rechnung „über Kreuz“ in Spaltenschreibweise.
 */
export default defineSimulation({
  id: 'skalar-vektorprodukt',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.72 },
  groups: [
    { id: 'vec', label: L('Vektoren', 'Vectors') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Produkt', 'Product'),
      options: [
        { value: 'dot', label: L('Skalarprodukt', 'Dot product') },
        { value: 'cross', label: L('Vektorprodukt', 'Cross product') },
        { value: 'spat', label: L('Spatprodukt', 'Triple product') },
      ],
      default: 'dot',
    },
    comp('a1', 'a₁', 1),
    comp('a2', 'a₂', 2),
    comp('a3', 'a₃', 0),
    comp('b1', 'b₁', 0),
    comp('b2', 'b₂', 1),
    comp('b3', 'b₃', 2),
    comp('c1', 'c₁', 1, (v) => v.mode === 'spat'),
    comp('c2', 'c₂', -1, (v) => v.mode === 'spat'),
    comp('c3', 'c₃', 2, (v) => v.mode === 'spat'),
    { key: 'proj', type: 'boolean', group: 'view', label: L('Projektion von b auf a', 'Projection of b onto a'), default: true, visibleIf: (v) => v.mode === 'dot' },
    { key: 'tri', type: 'boolean', group: 'view', label: L('Dreieck (halbe Fläche)', 'Triangle (half the area)'), default: false, visibleIf: (v) => v.mode === 'cross' },
    { key: 'pyr', type: 'boolean', group: 'view', label: L('Pyramide (ein Sechstel)', 'Pyramid (one sixth)'), default: false, visibleIf: (v) => v.mode === 'spat' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnis anzeigen', 'Show result'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Animation abspielen', 'Play animation'), primary: true },
    { id: 'swap', label: L('a und b tauschen', 'Swap a and b'), visibleIf: (v) => v.mode !== 'dot' },
  ],
  readouts: [
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'geo', label: L('Geometrisch', 'Geometrically'), spoiler: true },
    { key: 'info', label: L('Hinweis', 'Note'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Winkel zwischen a und b', 'Angle between a and b'), values: {} },
    { id: 'orth', label: L('Senkrecht: a · b = 0', 'Perpendicular: a · b = 0'), values: { b1: -2, b2: 1, b3: 2 } },
    { id: 'obtuse', label: L('Stumpfer Winkel: a · b < 0', 'Obtuse angle: a · b < 0'), values: { b1: -2, b2: -1, b3: 2 } },
    { id: 'cross', label: L('Vektorprodukt und Fläche', 'Cross product and area'), values: { mode: 'cross' } },
    { id: 'tri', label: L('Dreiecksfläche', 'Triangle area'), values: { mode: 'cross', a1: 0, a2: 3, a3: 0, b1: 0, b2: 0, b3: 2, tri: true } },
    { id: 'spat', label: L('Volumen eines Spats', 'Volume of a parallelepiped'), values: { mode: 'spat' } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit zwei bzw. drei Vektorpfeilen, Winkel und Projektion, Normalenvektor mit Parallelogramm oder Spat; Spitzen ziehbar, Ansicht drehbar' },
    en: { canvas: 'Three-dimensional coordinate system with two or three vector arrows, angle and projection, normal vector with parallelogram or parallelepiped; draggable tips, rotatable view' },
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
        const pw = Math.round(clamp(W * 0.31, 240, 330));
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: Math.min(H - 12, 350) } };
      }
      const ph = Math.round(clamp(H * 0.38, 160, 210));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 28, elevation: 20, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene });

    /* ---------------- Zustand ---------------- */
    const ga = [G(p.a1), G(p.a2), G(p.a3)];
    const gb = [G(p.b1), G(p.b2), G(p.b3)];
    const gc = [G(p.c1), G(p.c2), G(p.c3)];
    const projA = G(p.proj ? 1 : 0);
    const triA = G(p.tri ? 1 : 0);
    const pyrA = G(p.pyr ? 1 : 0);
    const extent = G(4);
    let now = performance.now();
    const introStart = now + (reduced ? -1e6 : 100);
    let animStart = now + (reduced ? -1e6 : 250);
    const ANIM_MS = 2200;
    let lastDrag = -1e9;

    const A = (): V3 => [ga[0]!.at(now), ga[1]!.at(now), ga[2]!.at(now)];
    const B = (): V3 => [gb[0]!.at(now), gb[1]!.at(now), gb[2]!.at(now)];
    const C = (): V3 => [gc[0]!.at(now), gc[1]!.at(now), gc[2]!.at(now)];
    const tA = (): V3 => [p.a1, p.a2, p.a3];
    const tB = (): V3 => [p.b1, p.b2, p.b3];
    const tC = (): V3 => [p.c1, p.c2, p.c3];

    function retarget(snap = false): void {
      const ms = performance.now() - lastDrag < 200 ? 110 : 520;
      const set = (g: Glide, v: number) => (snap ? g.snap(v) : g.go(v, ms));
      [p.a1, p.a2, p.a3].forEach((v, i) => set(ga[i]!, v));
      [p.b1, p.b2, p.b3].forEach((v, i) => set(gb[i]!, v));
      [p.c1, p.c2, p.c3].forEach((v, i) => set(gc[i]!, v));
      set(projA, p.proj ? 1 : 0);
      set(triA, p.tri ? 1 : 0);
      set(pyrA, p.pyr ? 1 : 0);
      const pts: V3[] = [tA(), tB()];
      if (mode() !== 'dot') pts.push(cross(tA(), tB()));
      if (mode() === 'spat') pts.push(tC(), vec3.add(vec3.add(tA(), tB()), tC()) as V3);
      const m = Math.max(2.5, ...pts.flatMap((q) => q.map((v) => Math.abs(v))));
      set(extent, Math.ceil(m + 0.6));
    }

    function phase(from: number, to: number): number {
      const t = (now - animStart) / ANIM_MS;
      return ease.inOutCubic(clamp((t - from) / (to - from), 0, 1));
    }
    const animating = () => now - animStart < ANIM_MS + 100;

    /* ---------------- Farben, Texte ---------------- */
    const CA = () => ctx.theme.series[0]!;
    const CB = () => ctx.theme.series[3]!;
    const CC = () => ctx.theme.series[2]!;
    const CN = () => ctx.theme.series[4]!;
    const CP = () => ctx.theme.series[5]!;
    const n1 = (v: number) => fmt.num(v, 2);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mfont = (s: number) => `italic 700 ${s}px ${ctx.theme.mathFont}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');

    /* ---------------- Ziehen ---------------- */
    const r05 = (v: number) => clamp(Math.round(v * 2) / 2, -4, 4);
    const tipHandle = (get: () => V3, keys: [string, string, string], color: () => string, enabled: () => boolean) =>
      view.addHandle({
        get: () => get() as Vec3,
        set: (q) => {
          lastDrag = performance.now();
          ctx.set({ [keys[0]]: r05(q[0]), [keys[1]]: r05(q[1]), [keys[2]]: r05(q[2]) } as never);
        },
        get plane() {
          return view.camera.back;
        },
        enabled: () => !ctx.locked && !animating() && enabled(),
        color,
      });
    tipHandle(A, ['a1', 'a2', 'a3'], CA, () => true);
    tipHandle(B, ['b1', 'b2', 'b3'], CB, () => true);
    tipHandle(C, ['c1', 'c2', 'c3'], CC, () => mode() === 'spat');

    /* ---------------- Zeichnen: Szene ---------------- */
    const O: Vec3 = [0, 0, 0];

    function vecLabel(at: Vec3, name: string, color: string, offset: [number, number], size = 16): void {
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

    function sideLabel(from: Vec3, to: Vec3, name: string, color: string, side = 1, at = 0.5, size = 16): void {
      const [ax, ay] = view.toPx(from);
      const [bx, by] = view.toPx(to);
      const l = Math.hypot(bx - ax, by - ay) || 1;
      let nx = -(by - ay) / l;
      let ny = (bx - ax) / l;
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

    /** Rechter-Winkel-Zeichen im Punkt `at` zwischen den Richtungen u und v. */
    function rightAngle(at: Vec3, u: Vec3, v: Vec3, size: number, color: string, a = 1): void {
      const uu = vec3.scale(vec3.normalize(u), size);
      const vv = vec3.scale(vec3.normalize(v), size);
      view.polyline([vec3.add(at, uu), vec3.add(vec3.add(at, uu), vv), vec3.add(at, vv)], { color, width: 1.6, alpha: a });
    }

    /** Winkelbogen zwischen u und v im Ursprung mit Fläche und Beschriftung. */
    function angleArc(u: Vec3, v: Vec3, r: number, color: string, label: string, a: number): void {
      const nu = vec3.normalize(u);
      let w = vec3.sub(vec3.normalize(v), vec3.scale(nu, vec3.dot(nu, vec3.normalize(v))));
      if (vec3.length(w) < 1e-6) return;
      w = vec3.normalize(w);
      const phi = Math.acos(clamp(vec3.dot(nu, vec3.normalize(v)), -1, 1));
      const pts: Vec3[] = [O];
      const n = Math.max(6, Math.round(phi * 18));
      for (let i = 0; i <= n; i++) {
        const t = (phi * i) / n;
        pts.push(vec3.add(vec3.scale(nu, r * Math.cos(t)), vec3.scale(w, r * Math.sin(t))));
      }
      view.face(pts, { color, alpha: 0.2 * a, flat: true, layer: 'back' });
      view.polyline(pts.slice(1), { color, width: 2, alpha: a });
      const mid = vec3.add(vec3.scale(nu, r * 1.45 * Math.cos(phi / 2)), vec3.scale(w, r * 1.45 * Math.sin(phi / 2)));
      if (label) view.label(mid, label, { color, size: 13, weight: '800', align: 'center', baseline: 'middle', background: alpha(cardBg(), 0.85) });
    }

    function drawScene(): void {
      const theme = ctx.theme;
      const R = regions().scene;
      const narrow = R.w < 520;
      const E = extent.at(now);
      view.setScene({ target: [0.2, 0.4, 0.8], radius: E * (narrow ? 1.05 : 0.92), anchor: [0.5, 0.53] });
      view.begin();
      const grow = reduced ? 1 : ease.outCubic(clamp((now - introStart) / 700, 0, 1));
      if (p.grid) view.grid({ min: [-E, -E], max: [E, E], step: 1, color: theme.gridMinor, fade: true });
      view.axes({ min: -E * grow, max: (E + 0.5) * grow, color: alpha(theme.axis, 0.8), width: 1.4 });
      view.point(O, { color: theme.text, radius: 3 });
      const a = A() as Vec3;
      const b = B() as Vec3;
      const ca = CA();
      const cb = CB();
      const cn = CN();
      const res = p.show;
      const soft = (c: string) => mixColor(c, theme.bg, 0.45);

      if (mode() === 'dot') {
        const u1 = phase(0.05, 0.45);
        const u2 = phase(0.5, 0.95);
        arrowV(O, a, ca);
        arrowV(O, b, cb);
        sideLabel(O, a, 'a', ca, -1);
        sideLabel(O, b, 'b', cb, 1);
        const phi = angleDeg(tA(), tB());
        if (Number.isFinite(phi)) {
          const r = Math.min(vec3.length(a), vec3.length(b)) * 0.45;
          if (orthogonal(tA(), tB())) rightAngle(O, a, b, Math.min(0.55, r), cn, u1);
          else angleArc(a, vec3.lerp(a, b, 1), r * Math.max(0.05, u1), cn, res && u1 > 0.9 ? `φ ≈ ${fmt.num(phi, 1)}°` : u1 > 0.9 ? 'φ' : '', u1);
        }
        // Projektion von b auf a
        const pa = projA.at(now) * u2;
        if (pa > 0.01 && vec3.length(a) > 1e-6) {
          const f = projection(B(), A()) as Vec3;
          const along = vec3.dot(f, a) < 0;
          if (along) view.segment(O, vec3.scale(vec3.normalize(a), -Math.max(1, vec3.length(f) + 0.6)), { color: soft(ca), width: 1.2, dash: [4, 4], alpha: pa });
          view.segment(b, vec3.lerp(b, f, pa), { color: theme.muted, width: 1.4, dash: [4, 4], alpha: pa });
          view.segment(O, f, { color: CP(), width: 5, alpha: 0.85 * pa });
          if (vec3.distance(b, f) > 0.3 && vec3.length(f) > 0.3) rightAngle(f, vec3.sub(along ? O : O, f), vec3.sub(b, f), 0.28, theme.muted, pa);
          view.point(f, { color: CP(), radius: 4 * pa });
        }
      } else {
        const u1 = phase(0.05, 0.45);
        const u2 = phase(0.5, 0.95);
        const n = cross(A(), B()) as Vec3;
        const sum = vec3.add(a, b);
        const pts: Vec3[] = [O, vec3.scale(a, u1 || 0.001), vec3.add(vec3.scale(a, u1), vec3.scale(b, u1)), vec3.scale(b, u1 || 0.001)];
        if (mode() === 'cross') {
          view.face(pts, { color: cn, alpha: 0.16, flat: true, layer: 'back' });
          view.polyline([a, sum, b], { color: soft(cn), width: 1.4, dash: [5, 4], alpha: u1 });
          const ta = triA.at(now);
          if (ta > 0.01) {
            view.face([O, a, b], { color: CP(), alpha: 0.3 * ta, flat: true, layer: 'back' });
            view.segment(a, b, { color: CP(), width: 2, alpha: ta });
          }
          if (res && u1 > 0.9) view.label(vec3.scale(sum, 0.5), `A = ${fmt.num(parallelogramArea(tA(), tB()), 2)}`, { color: cn, size: 12, weight: '800', align: 'center', baseline: 'middle', background: alpha(cardBg(), 0.85) });
        } else {
          // Spat: sechs Flächen aus a, b, c
          const c = C() as Vec3;
          const P = (i: number, j: number, k: number): Vec3 => vec3.add(vec3.add(vec3.scale(a, i * u1), vec3.scale(b, j * u1)), vec3.scale(c, k * u1));
          const faces: Vec3[][] = [
            [P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)],
            [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)],
            [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)],
            [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)],
            [P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)],
            [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)],
          ];
          faces.forEach((f, i) => view.face(f, { color: i < 2 ? cn : CC(), alpha: i === 0 ? 0.2 : 0.08, flat: true }));
          const edges: [Vec3, Vec3][] = [];
          for (const f of faces) for (let i = 0; i < 4; i++) edges.push([f[i]!, f[(i + 1) % 4]!]);
          for (const [e0, e1] of edges) view.segment(e0, e1, { color: soft(cn), width: 1.1, alpha: 0.7 * u1 });
          const pa = pyrA.at(now);
          if (pa > 0.01) {
            const tet: Vec3[][] = [
              [O, a, b],
              [O, a, c],
              [O, b, c],
              [a, b, c],
            ];
            for (const f of tet) view.face(f, { color: CP(), alpha: 0.32 * pa, flat: true, stroke: CP(), width: 1.4 });
          }
          arrowV(O, c, CC());
          sideLabel(O, c, 'c', CC(), 1);
          // Höhe des Spats: Projektion von c auf die Normale
          if (u2 > 0.01 && vec3.length(n) > 1e-6) {
            const h = projection(C(), n as V3) as Vec3;
            view.segment(O, vec3.lerp(O, h, u2), { color: CP(), width: 3, dash: [6, 4], alpha: 0.9 });
          }
        }
        arrowV(O, a, ca);
        arrowV(O, b, cb);
        sideLabel(O, a, 'a', ca, -1);
        sideLabel(O, b, 'b', cb, 1);
        // Normalenvektor a × b wächst senkrecht heraus
        if (res && vec3.length(n) > 1e-6) {
          const tip = vec3.scale(n, u2);
          arrowV(O, tip, cn, 4);
          if (u2 > 0.9) {
            rightAngle(O, a, n, 0.32, theme.muted, u2);
            rightAngle(O, b, n, 0.32, theme.muted, u2);
            sideLabel(O, n, 'a × b', cn, 1, 0.7, 15);
          }
        }
      }
      view.end();
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

    type Tok = { kind: 'col'; v: (number | string)[]; color: string } | { kind: 'txt'; s: string; color?: string } | { kind: 'vec'; s: string; color: string };
    const cell = (v: number | string) => (typeof v === 'number' ? n1(v) : v);

    function tokWidth(t: Tok, size: number): number {
      const g = surface.g;
      if (t.kind === 'col') {
        g.font = font(750, size);
        return Math.max(...t.v.map((v) => g.measureText(cell(v)).width)) + 2 * (size * 0.45) + 6;
      }
      g.font = t.kind === 'vec' ? mfont(size + 1) : font(650, size);
      return g.measureText(t.s).width + (t.kind === 'txt' ? 6 : 4);
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
        } else text(g, t.s, cx + w / 2, y, { font: font(650, size), color: t.color ?? theme.text });
        cx += w;
      }
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
      const a = tA();
      const b = tB();
      const res = p.show;
      const q = (s: string) => (res ? s : '?');
      const ca = CA();
      const cb = CB();
      const cn = CN();
      const title = { dot: tt('Skalarprodukt', 'Dot product'), cross: tt('Vektorprodukt', 'Cross product'), spat: tt('Spatprodukt', 'Triple product') }[mode()];
      text(g, title, x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
      y += 44;
      const row = (label: string, value: string, color = theme.text) => {
        text(g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
        text(g, value, x0 + w, y, { font: font(800, 12), color, align: 'right' });
        y += 20;
      };
      if (mode() === 'dot') {
        const d = dot(a, b);
        const prod = a.map((v, i) => v * b[i]!);
        drawToks([{ kind: 'col', v: [...a], color: ca }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...b], color: cb }, { kind: 'txt', s: '=' }, { kind: 'txt', s: res ? prod.map((v) => (v < 0 ? `(${n1(v)})` : n1(v))).join(' + ') : '?' }, { kind: 'txt', s: '=' }, { kind: 'txt', s: q(n1(d)), color: cn }], x0, y, w, wide ? 14 : 12.5);
        y += 46;
        const phi = angleDeg(a, b);
        row('|a| · |b|', `${n1(norm(a))} · ${n1(norm(b))}`);
        row('cos φ = a·b / (|a|·|b|)', q(Number.isFinite(phi) ? fmt.num(Math.cos((phi * Math.PI) / 180), 3) : '–'));
        row(tt('Winkel φ', 'Angle φ'), q(Number.isFinite(phi) ? `${fmt.num(phi, 1)}°` : '–'), cn);
        if (p.proj) row(tt('Projektion von b auf a', 'Projection of b onto a'), q(n1(projLength(b, a))), CP());
      } else if (mode() === 'cross') {
        const n = cross(a, b);
        const terms = crossTerms(a, b);
        const tcol = terms.map(([m, s]) => `${n1(m)} − ${s < 0 ? `(${n1(s)})` : n1(s)}`);
        drawToks([{ kind: 'col', v: [...a], color: ca }, { kind: 'txt', s: '×' }, { kind: 'col', v: [...b], color: cb }, { kind: 'txt', s: '=' }, { kind: 'col', v: res ? tcol : ['?', '?', '?'], color: theme.muted }, { kind: 'txt', s: '=' }, { kind: 'col', v: res ? [...n] : ['?', '?', '?'], color: cn }], x0, y, w, wide ? 13.5 : 12);
        y += 46;
        row(tt('Parallelogramm |a × b|', 'Parallelogram |a × b|'), q(`√${fmt.num(n[0] ** 2 + n[1] ** 2 + n[2] ** 2, 2)} ≈ ${n1(norm(n))}`), cn);
        row(tt('Dreieck ½ |a × b|', 'Triangle ½ |a × b|'), q(n1(norm(n) / 2)), CP());
        row(tt('Probe: (a × b) · a', 'Check: (a × b) · a'), q(n1(dot(n, a))));
      } else {
        const c = tC();
        const n = cross(a, b);
        drawToks([{ kind: 'txt', s: '(' }, { kind: 'vec', s: 'a', color: ca }, { kind: 'txt', s: '×' }, { kind: 'vec', s: 'b', color: cb }, { kind: 'txt', s: ')·' }, { kind: 'vec', s: 'c', color: CC() }, { kind: 'txt', s: '=' }, { kind: 'col', v: res ? [...n] : ['?', '?', '?'], color: cn }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...c], color: CC() }, { kind: 'txt', s: '=' }, { kind: 'txt', s: q(n1(triple(a, b, c))), color: cn }], x0, y, w, wide ? 13.5 : 12);
        y += 46;
        row(tt('Volumen Spat', 'Volume parallelepiped'), q(n1(spatVolume(a, b, c))), cn);
        row(tt('Volumen Pyramide (⅙)', 'Volume pyramid (⅙)'), q(n1(pyramidVolume(a, b, c))), CP());
        const hd = handedness(a, b, c);
        row(tt('a, b, c bilden', 'a, b, c form'), q(hd === 'right' ? tt('Rechtssystem', 'right-handed system') : hd === 'left' ? tt('Linkssystem', 'left-handed system') : tt('keinen Spat (eben)', 'no solid (flat)')));
      }
      if (wide && y < R.y + R.h - 56) drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(96, R.y + R.h - y - 12) }, tipText());
      g.restore();
    }

    function tipText(): string {
      const a = tA();
      const b = tB();
      if (mode() === 'dot') {
        const d = dot(a, b);
        if (Math.abs(d) < 1e-9) return tt('a · b = 0: Die Vektoren stehen senkrecht aufeinander.', 'a · b = 0: the vectors are perpendicular.');
        return d > 0 ? tt('a · b > 0: spitzer Winkel. Die Projektion von b zeigt in Richtung von a.', 'a · b > 0: acute angle. The projection of b points along a.') : tt('a · b < 0: stumpfer Winkel. Die Projektion von b zeigt gegen a.', 'a · b < 0: obtuse angle. The projection of b points against a.');
      }
      if (mode() === 'cross') return tt('a × b steht senkrecht auf a und b (Rechte-Hand-Regel). Seine Länge ist die Fläche des Parallelogramms. Tausche a und b: Der Pfeil kippt um.', 'a × b is perpendicular to a and b (right-hand rule). Its length is the area of the parallelogram. Swap a and b: the arrow flips.');
      return tt('Grundfläche |a × b| mal Höhe (Projektion von c auf a × b) ergibt das Volumen des Spats.', 'Base |a × b| times height (projection of c onto a × b) gives the volume.');
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
    const vt = (v: V3) => `(${v.map(n1).join(lang === 'de' ? ' | ' : ', ')})`;
    function updateReadouts(): void {
      const a = tA();
      const b = tB();
      if (mode() === 'dot') {
        const phi = angleDeg(a, b);
        ctx.readout('calc', `a · b = ${a.map((v, i) => `${n1(v)} · ${b[i]! < 0 ? `(${n1(b[i]!)})` : n1(b[i]!)}`).join(' + ')} = ${n1(dot(a, b))}`);
        ctx.readout('geo', Number.isFinite(phi) ? `cos φ = ${n1(dot(a, b))} / (${n1(norm(a))} · ${n1(norm(b))}) ≈ ${fmt.num(Math.cos((phi * Math.PI) / 180), 3)}, φ ≈ ${fmt.num(phi, 1)}°` : tt('Winkel nicht definiert (Nullvektor)', 'Angle undefined (zero vector)'));
        ctx.readout('info', orthogonal(a, b) ? tt('a ⊥ b', 'a ⊥ b') : null);
      } else if (mode() === 'cross') {
        const n = cross(a, b);
        ctx.readout('calc', `a × b = ${vt(n)}`);
        ctx.readout('geo', `${tt('Parallelogramm', 'Parallelogram')} ≈ ${n1(norm(n))} · ${tt('Dreieck', 'triangle')} ≈ ${n1(norm(n) / 2)}`);
        ctx.readout('info', norm(n) < 1e-9 ? tt('a und b sind parallel: a × b = o, Fläche 0.', 'a and b are parallel: a × b = o, area 0.') : null);
      } else {
        const c = tC();
        ctx.readout('calc', `(a × b) · c = ${vt(cross(a, b))} · ${vt(c)} = ${n1(triple(a, b, c))}`);
        ctx.readout('geo', `V ${tt('Spat', 'parallelepiped')} = ${n1(spatVolume(a, b, c))} · V ${tt('Pyramide', 'pyramid')} = ${n1(pyramidVolume(a, b, c))}`);
        ctx.readout('info', handedness(a, b, c) === 'flat' ? tt('a, b, c liegen in einer Ebene: Volumen 0.', 'a, b, c lie in one plane: volume 0.') : null);
      }
    }

    retarget(true);
    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('mode') && source !== 'init') animStart = reduced ? now - 1e6 : now + 80;
        retarget(source === 'init');
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'play') animStart = reduced ? now - 1e6 : now;
        else if (id === 'swap' && !ctx.locked) {
          ctx.set({ a1: p.b1, a2: p.b2, a3: p.b3, b1: p.a1, b2: p.a2, b3: p.a3 });
          animStart = reduced ? now - 1e6 : now - ANIM_MS * 0.5;
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
        const busy = [...ga, ...gb, ...gc, projA, triA, pyrA, extent].some((x) => x.busy(now)) || animating() || (!reduced && now - introStart < 900);
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
