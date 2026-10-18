import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import { BOX_EDGES, BOX_FACES, boxCorners, boxVolume, CORNER_NAMES, distOrigin, projections, randomPoint, spaceDiagonal, walk, walkAt, where, type P3 } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Mode = 'point' | 'box';

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
 * Punkte und Körper im räumlichen Koordinatensystem: Punkt P ziehen (Fußpunkt
 * in der x₁x₂-Ebene, Höhe entlang x₃), Koordinatenweg vom Ursprung
 * animiert, Koordinatenquader und Projektionen in die Koordinatenebenen;
 * Quader mit benannten Ecken. Ansicht drehbar, Blickrichtungen schräg, von
 * oben, von vorn und von der Seite.
 */
export default defineSimulation({
  id: 'koordinaten-3d',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.7 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Objekt', 'Object'),
      options: [
        { value: 'point', label: L('Punkt', 'Point') },
        { value: 'box', label: L('Quader', 'Cuboid') },
      ],
      default: 'point',
    },
    { key: 'x', type: 'number', label: L('x₁ (nach vorn)', 'x₁ (forward)'), min: -4, max: 4, step: 0.5, default: 3, help: L('Beim Quader: Koordinaten der Ecke A.', 'For the cuboid: coordinates of corner A.') },
    { key: 'y', type: 'number', label: L('x₂ (nach rechts)', 'x₂ (to the right)'), min: -4, max: 4, step: 0.5, default: 4 },
    { key: 'z', type: 'number', label: L('x₃ (nach oben)', 'x₃ (up)'), min: -4, max: 4, step: 0.5, default: 2 },
    { key: 'a', type: 'number', label: L('Länge a (x₁-Richtung)', 'Length a (x₁ direction)'), min: 0.5, max: 5, step: 0.5, default: 3, visibleIf: (v) => v.mode === 'box' },
    { key: 'b', type: 'number', label: L('Breite b (x₂-Richtung)', 'Width b (x₂ direction)'), min: 0.5, max: 5, step: 0.5, default: 4, visibleIf: (v) => v.mode === 'box' },
    { key: 'c', type: 'number', label: L('Höhe c (x₃-Richtung)', 'Height c (x₃ direction)'), min: 0.5, max: 5, step: 0.5, default: 2, visibleIf: (v) => v.mode === 'box' },
    { key: 'lines', type: 'boolean', group: 'view', label: L('Koordinatenweg und Hilfsquader', 'Coordinate path and helper box'), default: true, visibleIf: (v) => v.mode === 'point' },
    { key: 'proj', type: 'boolean', group: 'view', label: L('Projektionen in die Koordinatenebenen', 'Projections onto the coordinate planes'), default: false, visibleIf: (v) => v.mode === 'point' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Koordinaten anschreiben', 'Label coordinates'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'walk', label: L('Weg vom Ursprung', 'Path from the origin'), primary: true, visibleIf: (v) => v.mode === 'point' },
    { id: 'cam', label: L('Blick: von oben', 'View: from above') },
    { id: 'rand', label: L('Neuer Punkt', 'New point') },
  ],
  readouts: [
    { key: 'coord', label: L('Koordinaten', 'Coordinates'), spoiler: true },
    { key: 'lage', label: L('Lage', 'Position'), spoiler: true },
    { key: 'dist', label: L('Abstand vom Ursprung', 'Distance from the origin'), spoiler: true },
    { key: 'corners', label: L('Eckpunkte', 'Corners'), spoiler: true },
    { key: 'size', label: L('Volumen und Raumdiagonale', 'Volume and space diagonal'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Punkt P(3 | 4 | 2)', 'Point P(3, 4, 2)'), values: {} },
    { id: 'neg', label: L('Negative Koordinaten', 'Negative coordinates'), values: { x: -2, y: 3, z: -1.5 } },
    { id: 'plane', label: L('Punkt in der x₂x₃-Ebene', 'Point in the x₂x₃ plane'), values: { x: 0, y: 3, z: 3, proj: true } },
    { id: 'proj', label: L('Drei Projektionen', 'Three projections'), values: { x: 2, y: 3, z: 3, proj: true, lines: false } },
    { id: 'box', label: L('Quader am Ursprung', 'Cuboid at the origin'), values: { mode: 'box', x: 0, y: 0, z: 0, a: 3, b: 4, c: 2 } },
    { id: 'box2', label: L('Quader im Raum', 'Cuboid in space'), values: { mode: 'box', x: 1, y: -2, z: 1, a: 2, b: 3, c: 2.5 } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit den Achsen x₁, x₂, x₃, einem ziehbaren Punkt mit Koordinatenweg bzw. einem Quader mit benannten Ecken; drehbare Ansicht' },
    en: { canvas: 'Three-dimensional coordinate system with axes x₁, x₂, x₃, a draggable point with its coordinate path or a cuboid with named corners; rotatable view' },
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
        const pw = Math.round(clamp(W * 0.27, 210, 290));
        const need = mode() === 'point' ? 350 : 410;
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: Math.min(H - 12, need) } };
      }
      const ph = Math.round(clamp(H * 0.42, 150, mode() === 'point' ? 236 : 210));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 32, elevation: 22, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene, onTap: (px, py) => tap(px, py), tapCursor: (px, py) => mode() === 'box' && cornerAt(px, py) !== null });

    /* ---------------- Zustand ---------------- */
    const gx = G(p.x);
    const gy = G(p.y);
    const gz = G(p.z);
    const ga = G(p.a);
    const gb = G(p.b);
    const gc = G(p.c);
    const lo = G(-3);
    const hi = G(5);
    const projA = G(p.proj ? 1 : 0);
    const linesA = G(p.lines ? 1 : 0);
    const showA = G(p.show ? 1 : 0);
    const boxA = G(mode() === 'box' ? 1 : 0);
    let now = performance.now();
    let introStart = now + (reduced ? -1e6 : 100);
    let walkStart = -1;
    const WALK_MS = 2600;
    let camIndex = 0;
    let sel: number | null = null;
    let lastDrag = -1e9;

    const P = (): P3 => [gx.at(now), gy.at(now), gz.at(now)];
    const target = (): P3 => [p.x, p.y, p.z];
    const corners = (): P3[] => boxCorners(P(), ga.at(now), gb.at(now), gc.at(now));
    const targetCorners = (): P3[] => boxCorners(target(), p.a, p.b, p.c);

    /** Achsenlängen passend zum Inhalt (ganzzahlig, mit Luft). */
    function axisRange(): { lo: number; hi: number } {
      const pts = mode() === 'box' ? targetCorners() : [target()];
      const all = pts.flat();
      const top = Math.max(5, Math.ceil(Math.max(...all) + 1));
      const bot = Math.min(-3, Math.floor(Math.min(...all) - 1));
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
        [projA, p.proj ? 1 : 0],
        [linesA, p.lines ? 1 : 0],
        [showA, p.show ? 1 : 0],
        [boxA, mode() === 'box' ? 1 : 0],
      ];
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
    const axisColor = (k: number) => [C1(), C2(), C3()][k]!;
    const n1 = (v: number) => fmt.num(v, 1);
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
      enabled: () => editable() && mode() === 'point' && Math.abs(p.z) > 0.25,
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
      enabled: () => editable() && mode() === 'point',
      color: () => CP(),
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

      if (boxA.at(now) < 0.999) drawPoint(1 - boxA.at(now));
      if (boxA.at(now) > 0.001) drawBox(boxA.at(now));
      view.end();
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
          view.label(pp as Vec3, showA.at(now) > 0.5 ? `${nm}${coordText(pp)}` : nm, { color: theme.series[4]!, size: 12, weight: '700', offset: [8, -8], baseline: 'bottom' });
        }
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
        row('|OP|', hide ? '?' : `√${fmt.num(sq, 2)} ≈ ${fmt.num(d, 2)}`, CP());
        y += lineH;
        if (wide && y < R.y + R.h - 70) {
          y += 6;
          const tip = walkStart >= 0 && now - walkStart < WALK_MS + 400 ? tt('Erst x₁ nach vorn, dann x₂ nach rechts, dann x₃ nach oben – so kommt man vom Ursprung zum Punkt.', 'First x₁ forward, then x₂ right, then x₃ up – that is how you get from the origin to the point.') : tt('Ziehe den Fußpunkt in der Ebene und den Punkt nach oben. Drehe die Ansicht: Erst im Raum sieht man, wo P wirklich liegt.', 'Drag the foot point in the plane and the point upwards. Rotate the view: only in space can you see where P really is.');
          drawTip({ x: x0 - 4, y, w: w + 8, h: Math.min(110, R.y + R.h - y - 10) }, tip);
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
          row(tt('Raumdiagonale', 'Space diagonal'), hide ? '?' : `≈ ${fmt.num(spaceDiagonal(p.a, p.b, p.c), 2)}`, theme.text, y, x0, w);
          y += lineH2;
        }
        if (wide && y < R.y + R.h - 60) drawTip({ x: x0 - 4, y: y + 4, w: w + 8, h: Math.min(90, R.y + R.h - y - 14) }, tt('Tippe auf eine Ecke, um ihre Koordinaten zu sehen. Ziehe A, C oder G.', 'Tap a corner to see its coordinates. Drag A, C or G.'));
      }
      g.restore();
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
      if (mode() === 'point') {
        const q = target();
        const sq = q[0] ** 2 + q[1] ** 2 + q[2] ** 2;
        ctx.readout('coord', `P${coordText(q)}`);
        ctx.readout('lage', whereText(q));
        ctx.readout('dist', { html: `|OP| = √(${n1(q[0])}² + ${n1(q[1])}² + ${n1(q[2])}²) = √${fmt.num(sq, 2)} ≈ ${fmt.num(distOrigin(q), 2)}`.replace(/\((-[\d,.]+)\)²/g, '($1)²').replace(/ (−[\d,.]+)²/g, ' ($1)²') });
        ctx.readout('corners', null);
        ctx.readout('size', null);
      } else {
        const cs = targetCorners();
        ctx.readout('coord', sel !== null ? `${CORNER_NAMES[sel]}${coordText(cs[sel]!)}` : null);
        ctx.readout('lage', sel !== null ? whereText(cs[sel]!) : null);
        ctx.readout('dist', null);
        ctx.readout('corners', { html: cs.map((q, i) => `${CORNER_NAMES[i]}${coordText(q)}`).join('<br>') });
        ctx.readout('size', `V = ${n1(p.a)} · ${n1(p.b)} · ${n1(p.c)} = ${fmt.num(boxVolume(p.a, p.b, p.c), 3)} · d = √(${n1(p.a)}² + ${n1(p.b)}² + ${n1(p.c)}²) ≈ ${fmt.num(spaceDiagonal(p.a, p.b, p.c), 2)}`);
      }
      ctx.setAction('rand', { label: mode() === 'box' ? tt('Neuer Quader', 'New cuboid') : tt('Neuer Punkt', 'New point') });
      ctx.setAction('cam', { label: `${tt('Blick', 'View')}: ${VIEWS[(camIndex + 1) % VIEWS.length]!.name[lang]}` });
    }

    retarget(true);
    updateReadouts();
    let seed = 1;

    return {
      update(changed, source) {
        now = performance.now();
        if (source === 'input' && changed.has('mode')) {
          sel = null;
          if (p.mode === 'box') ctx.set({ x: 0, y: 0, z: 0 });
          else ctx.set({ x: 3, y: 4, z: 2 });
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
        const busy = [gx, gy, gz, ga, gb, gc, lo, hi, projA, linesA, showA, boxA].some((x) => x.busy(now)) || (walkStart >= 0 && now - walkStart < WALK_MS + 500) || (!reduced && now - introStart < 1400);
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
