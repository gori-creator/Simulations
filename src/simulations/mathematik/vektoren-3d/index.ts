import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import { add, between, collinear, isZero, linComb, midpoint, multipleOf, neg, norm, normSq, randomVec, scale, sub, type V3 } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Op = 'add' | 'sub' | 'scale' | 'lin' | 'ab';

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
 * Verbindungsvektor AB = B − A mit Mittelpunkt. Rechnung in Spaltenschreibweise.
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
      ],
      default: 'add',
    },
    { key: 'k', type: 'number', label: L('Faktor k', 'Factor k'), min: -3, max: 3, step: 0.25, default: 2, visibleIf: (v) => v.op === 'scale' },
    { key: 'r', type: 'number', label: L('Faktor r', 'Factor r'), min: -2, max: 2, step: 0.25, default: 1.5, visibleIf: (v) => v.op === 'lin' },
    { key: 's', type: 'number', label: L('Faktor s', 'Factor s'), min: -2, max: 2, step: 0.25, default: 0.5, visibleIf: (v) => v.op === 'lin' },
    { ...comp('a1', 'a₁', 2, () => true), group: 'vec', help: L('Bei „Verbindungsvektor“: Koordinaten des Punktes A bzw. B.', 'For “vector AB”: coordinates of point A and B.') },
    { ...comp('a2', 'a₂', 4, () => true), group: 'vec' },
    { ...comp('a3', 'a₃', 0, () => true), group: 'vec' },
    { ...comp('b1', 'b₁', 1, (v) => v.op !== 'scale'), group: 'vec' },
    { ...comp('b2', 'b₂', -1, (v) => v.op !== 'scale'), group: 'vec' },
    { ...comp('b3', 'b₃', 3, (v) => v.op !== 'scale'), group: 'vec' },
    { key: 'par', type: 'boolean', group: 'view', label: L('Parallelogramm', 'Parallelogram'), default: true, visibleIf: (v) => v.op === 'add' || v.op === 'sub' || v.op === 'lin' },
    { key: 'comps', type: 'boolean', group: 'view', label: L('Komponenten als Weg', 'Components as a path'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnis anzeigen', 'Show result'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Animation abspielen', 'Play animation'), primary: true },
    { id: 'rand', label: L('Neue Vektoren', 'New vectors') },
  ],
  readouts: [
    { key: 'res', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'len', label: L('Länge', 'Length'), spoiler: true },
    { key: 'info', label: L('Hinweis', 'Note'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Addition: Spitze an Fuß', 'Addition: tip to tail'), values: {} },
    { id: 'sub', label: L('Subtraktion', 'Subtraction'), values: { op: 'sub' } },
    { id: 'neg', label: L('Gegenvektor (k = −1)', 'Opposite vector (k = −1)'), values: { op: 'scale', k: -1 } },
    { id: 'half', label: L('Halber Vektor', 'Half a vector'), values: { op: 'scale', k: 0.5, a1: 2, a2: 4, a3: 3 } },
    { id: 'lin', label: L('Linearkombination: Ebene', 'Linear combination: plane'), values: { op: 'lin', r: 1.5, s: 0.5 } },
    { id: 'ab', label: L('Verbindungsvektor und Mittelpunkt', 'Connecting vector and midpoint'), values: { op: 'ab', a1: 3, a2: -1, a3: 1, b1: -1, b2: 3, b3: 3 } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit Vektorpfeilen a und b, deren Summe, Differenz, Vielfachem oder Linearkombination; Spitzen ziehbar, Ansicht drehbar' },
    en: { canvas: 'Three-dimensional coordinate system with vector arrows a and b and their sum, difference, multiple or linear combination; draggable tips, rotatable view' },
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
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: Math.min(H - 12, 320) } };
      }
      const ph = Math.round(clamp(H * 0.36, 150, 200));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 28, elevation: 20, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene });

    /* ---------------- Zustand ---------------- */
    const ga = [G(p.a1), G(p.a2), G(p.a3)];
    const gb = [G(p.b1), G(p.b2), G(p.b3)];
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

    const A = (): V3 => [ga[0]!.at(now), ga[1]!.at(now), ga[2]!.at(now)];
    const B = (): V3 => [gb[0]!.at(now), gb[1]!.at(now), gb[2]!.at(now)];
    const tA = (): V3 => [p.a1, p.a2, p.a3];
    const tB = (): V3 => [p.b1, p.b2, p.b3];

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
          return linComb(r, a, s, b);
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
      set(gk, p.k);
      set(gr, p.r);
      set(gs, p.s);
      set(parA, p.par ? 1 : 0);
      set(compA, p.comps ? 1 : 0);
      // Achsenlänge passend zu allen sichtbaren Spitzen
      const pts = [tA(), tB(), result(tA(), tB())];
      if (op() === 'lin') pts.push(scale(tA(), p.r), add(scale(tA(), p.r), scale(tB(), p.s)));
      if (op() === 'sub') pts.push(neg(tB()));
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
      enabled: () => !ctx.locked && !animating(),
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
      enabled: () => !ctx.locked && !animating() && op() !== 'scale',
      color: () => CB(),
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
      };
      text(g, titles[op()], x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
      y += 24;
      const fsz = wide ? 15 : 13;
      const k = p.k;
      const r = p.r;
      const s = p.s;
      const kTxt = (v: number) => (v < 0 ? `(${fmt.num(v, 2)})` : fmt.num(v, 2));
      // Zeile 1: symbolisch
      const sym: Tok[] =
        op() === 'add'
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
      const cols: Tok[] =
        op() === 'add'
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
      const name = { add: '|a + b|', sub: '|a − b|', scale: '|k · a|', lin: '|r · a + s · b|', ab: '|AB|' }[op()];
      row(name, p.show ? `√${fmt.num(normSq(c), 2)} ≈ ${fmt.num(norm(c), 2)}` : '?', cr);
      if (op() === 'ab') row(tt('Mittelpunkt M', 'Midpoint M'), p.show ? pointText(midpoint(a, b)) : '?');
      else if (op() === 'scale') row(tt('Länge', 'Length'), p.show ? `|${fmt.num(k, 2)}| · ${fmt.num(norm(a), 2)} = ${fmt.num(Math.abs(k) * norm(a), 2)}` : '?');
      else row(tt('|a| und |b|', '|a| and |b|'), `${fmt.num(norm(a), 2)} ${tt('und', 'and')} ${fmt.num(norm(b), 2)}`);
      if (wide && y < R.y + R.h - 60) {
        const tip = tipText();
        drawTip({ x: x0 - 4, y: y + 2, w: w + 8, h: Math.min(100, R.y + R.h - y - 12) }, tip);
      }
      g.restore();
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
      };
      ctx.readout('res', { html: lines[op()] });
      ctx.readout('len', `√(${c.map((x) => (x < 0 ? `(${n1(x)})²` : `${n1(x)}²`)).join(' + ')}) = √${fmt.num(normSq(c), 2)} ≈ ${fmt.num(norm(c), 2)}`);
      let info: string | null = null;
      if (op() === 'ab') info = `M${pointText(midpoint(a, b))}`;
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
        if ((changed.has('k') || changed.has('r') || changed.has('s')) && source === 'input' && !animating()) animStart = now - 1e6;
        retarget(source === 'init');
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'play') animStart = reduced ? now - 1e6 : now;
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
        const busy = [...ga, ...gb, gk, gr, gs, parA, compA, extent].some((x) => x.busy(now)) || animating() || (!reduced && now - introStart < 900);
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
