import { defineSimulation, drawCard, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, textOn, vec3, View3D, type Rect, type Vec3 } from '../../../sim-core';
import {
  angleDeg,
  angleInPlane,
  contributions,
  cross,
  crossScheme,
  dot,
  exactTo,
  dotAndArea,
  handedness,
  hasSolution,
  norm,
  normForm,
  parallelogramArea,
  perpUnit,
  projection,
  projLength,
  pyramidVolume,
  relation,
  rotateFrom,
  shearC,
  spatHeight,
  spatVolume,
  TASKS,
  taskCloseness,
  taskSolved,
  taskValue,
  triple,
  unit,
  type TaskId,
  type V3,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const LIM = 6;

type Mode = 'dot' | 'angle' | 'cross' | 'spat' | 'find';

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

/** Welche Regler gehören zu welcher Ansicht? */
const freeOf = (v: Record<string, unknown>) => TASKS[(v.task as TaskId) ?? 'perp']?.free;
const showA = (v: Record<string, unknown>) => v.mode !== 'find';
const showB = (v: Record<string, unknown>) => (v.mode === 'find' ? freeOf(v) === 'b' : v.mode !== 'angle');
const showC = (v: Record<string, unknown>) => (v.mode === 'find' ? freeOf(v) === 'c' : v.mode === 'spat');

const comp = <K extends string>(key: K, label: string, def: number, show: (v: Record<string, unknown>) => boolean) => ({
  key,
  type: 'number' as const,
  group: 'vec',
  label: L(label, label),
  min: -LIM,
  max: LIM,
  step: 0.5,
  default: def,
  visibleIf: show,
});

const TASK_TEXT: Record<TaskId, { de: string; en: string; short: { de: string; en: string } }> = {
  perp: {
    de: 'Finde drei verschiedene Vektoren b ≠ o, die senkrecht auf a stehen.',
    en: 'Find three different vectors b ≠ o perpendicular to a.',
    short: L('b ⊥ a', 'b ⊥ a'),
  },
  angle: {
    de: 'Finde drei verschiedene Vektoren b, die mit a einen Winkel von 120° bilden.',
    en: 'Find three different vectors b that make an angle of 120° with a.',
    short: L('φ = 120°', 'φ = 120°'),
  },
  area: {
    de: 'Finde drei verschiedene Vektoren b, sodass das Parallelogramm aus a und b die Fläche 6 hat.',
    en: 'Find three different vectors b such that the parallelogram of a and b has area 6.',
    short: L('|a × b| = 6', '|a × b| = 6'),
  },
  vol: {
    de: 'Finde drei verschiedene Vektoren c, sodass der Spat aus a, b und c das Volumen 12 hat.',
    en: 'Find three different vectors c such that the parallelepiped of a, b and c has volume 12.',
    short: L('V = 12', 'V = 12'),
  },
  flat: {
    de: 'Finde drei verschiedene Vektoren c (kein Vielfaches von a oder b), die den Spat flach machen.',
    en: 'Find three different vectors c (not a multiple of a or b) that make the parallelepiped flat.',
    short: L('V = 0', 'V = 0'),
  },
};

/** Was die gefundenen Lösungen gemeinsam haben – wird nach drei Funden aufgedeckt. */
const TASK_SHAPE: Record<TaskId, { de: string; en: string }> = {
  perp: L('Alle Lösungen liegen in einer Ebene durch O, die senkrecht auf a steht.', 'All solutions lie in one plane through O perpendicular to a.'),
  // 120° zu a heißt 60° zu −a: Kegel mit Achse −a und halbem Öffnungswinkel 60° (siehe coneShape)
  angle: L('Alle Lösungen liegen auf einem Kegel mit Spitze O um die Richtung −a; jede Mantellinie bildet mit −a 60°.', 'All solutions lie on a cone with apex O around the direction −a; each line on it makes 60° with −a.'),
  area: L('Alle Lösungen liegen auf einem Zylinder um die x₁-Achse mit Radius 3: Nur der Abstand von b zur Geraden durch a zählt.', 'All solutions lie on a cylinder around the x₁ axis with radius 3: only the distance of b from the line of a counts.'),
  vol: L('Alle Lösungen liegen in den Ebenen x₃ = 2 und x₃ = −2: Grundfläche 6 mal Höhe 2.', 'All solutions lie in the planes x₃ = 2 and x₃ = −2: base 6 times height 2.'),
  flat: L('Alle Lösungen liegen in der Ebene, die a und b aufspannen: c = r · a + s · b.', 'All solutions lie in the plane spanned by a and b: c = r · a + s · b.'),
};

/**
 * Skalarprodukt und Vektorprodukt: Winkel zwischen zwei Vektoren mit
 * Projektion und Orthogonalität, Drehen von b mit Verlauf von cos und sin,
 * Vektorprodukt Schritt für Schritt „über Kreuz“ als Normalenvektor mit
 * Parallelogrammfläche, Spatprodukt als Volumen (mit Scherung nach
 * Cavalieri) und Entdeckungsaufgaben mit Lösungsmengen.
 */
export default defineSimulation({
  id: 'skalar-vektorprodukt',
  dragHint: true,
  hint: { de: 'Tipp: Zieh die Spitzen der Vektoren oder dreh die Ansicht mit einem Finger.', en: 'Tip: Drag the tips of the vectors or rotate the view with one finger.' },
  layout: { aspect: 1.6, aspectNarrow: 0.66 },
  groups: [
    { id: 'vec', label: L('Vektoren', 'Vectors') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'dot', label: L('Skalarprodukt', 'Dot product') },
        { value: 'angle', label: L('Winkel drehen', 'Rotate the angle') },
        { value: 'cross', label: L('Vektorprodukt', 'Cross product') },
        { value: 'spat', label: L('Spatprodukt', 'Triple product') },
        { value: 'find', label: L('Entdecken', 'Discover') },
      ],
      default: 'dot',
    },
    {
      key: 'task',
      type: 'choice',
      label: L('Aufgabe', 'Task'),
      options: [
        { value: 'perp', label: L('b senkrecht zu a', 'b perpendicular to a') },
        { value: 'angle', label: L('Winkel 120°', 'Angle 120°') },
        { value: 'area', label: L('Fläche 6', 'Area 6') },
        { value: 'vol', label: L('Volumen 12', 'Volume 12') },
        { value: 'flat', label: L('Flacher Spat', 'Flat parallelepiped') },
      ],
      default: 'perp',
      visibleIf: (v) => v.mode === 'find',
    },
    comp('a1', 'a₁', 1, showA),
    comp('a2', 'a₂', 2, showA),
    comp('a3', 'a₃', 0, showA),
    comp('b1', 'b₁', 0, showB),
    comp('b2', 'b₂', 1, showB),
    comp('b3', 'b₃', 2, showB),
    comp('c1', 'c₁', 1, showC),
    comp('c2', 'c₂', -1, showC),
    comp('c3', 'c₃', 2, showC),
    {
      key: 'phi',
      type: 'number',
      group: 'vec',
      label: L('Winkel φ', 'Angle φ'),
      min: 0,
      max: 180,
      step: 1,
      default: 60,
      unit: '°',
      visibleIf: (v) => v.mode === 'angle',
    },
    { key: 'proj', type: 'boolean', group: 'view', label: L('Projektion von b auf a', 'Projection of b onto a'), default: true, visibleIf: (v) => v.mode === 'dot' || v.mode === 'angle' },
    { key: 'parts', type: 'boolean', group: 'view', label: L('Summanden als Balken', 'Terms as bars'), default: true, visibleIf: (v) => v.mode === 'dot' },
    { key: 'scheme', type: 'boolean', group: 'view', label: L('Rechnung Schritt für Schritt', 'Calculation step by step'), default: true, visibleIf: (v) => v.mode === 'cross' },
    { key: 'tri', type: 'boolean', group: 'view', label: L('Dreieck (halbe Fläche)', 'Triangle (half the area)'), default: false, visibleIf: (v) => v.mode === 'cross' },
    { key: 'pyr', type: 'boolean', group: 'view', label: L('Dreiseitige Pyramide (ein Sechstel)', 'Triangular pyramid (one sixth)'), default: false, visibleIf: (v) => v.mode === 'spat' },
    { key: 'cav', type: 'boolean', group: 'view', label: L('Spat gerade scheren (Cavalieri)', 'Shear the solid upright (Cavalieri)'), default: false, visibleIf: (v) => v.mode === 'spat' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnis anzeigen', 'Show result'), default: true, visibleIf: (v) => v.mode !== 'find' },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter in der x₁x₂-Ebene', 'Grid in the x₁x₂ plane'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Animation abspielen', 'Play animation'), primary: true, visibleIf: (v) => v.mode !== 'find' && v.mode !== 'angle' },
    { id: 'sweep', label: L('φ von 0° bis 180° drehen', 'Turn φ from 0° to 180°'), primary: true, visibleIf: (v) => v.mode === 'angle' },
    { id: 'next', label: L('Nächster Rechenschritt', 'Next step'), visibleIf: (v) => v.mode === 'cross' && v.scheme === true },
    { id: 'swap', label: L('a und b tauschen', 'Swap a and b'), visibleIf: (v) => v.mode === 'cross' || v.mode === 'spat' },
    { id: 'rand', label: L('Zufällige Vektoren', 'Random vectors'), visibleIf: (v) => v.mode === 'dot' || v.mode === 'cross' || v.mode === 'spat' },
    { id: 'hint', label: L('Alle Lösungen zeigen', 'Show all solutions'), visibleIf: (v) => v.mode === 'find' },
    { id: 'clear', label: L('Neu anfangen', 'Start over'), visibleIf: (v) => v.mode === 'find' },
  ],
  readouts: [
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'geo', label: L('Geometrisch', 'Geometrically'), spoiler: true },
    { key: 'info', label: L('Hinweis', 'Note'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('Winkel zwischen a und b', 'Angle between a and b'), values: {} },
    { id: 'chk45', label: L('(1|0|0) · (1|1|0): Winkel 45°', '(1, 0, 0) · (1, 1, 0): angle 45°'), values: { a1: 1, a2: 0, a3: 0, b1: 1, b2: 1, b3: 0 } },
    { id: 'orth', label: L('Senkrecht: a · b = 0', 'Perpendicular: a · b = 0'), values: { b1: -2, b2: 1, b3: 2 } },
    { id: 'obtuse', label: L('Stumpfer Winkel: a · b < 0', 'Obtuse angle: a · b < 0'), values: { b1: -2, b2: -1, b3: 2 } },
    { id: 'turn', label: L('Winkel drehen: cos und sin', 'Rotate: cos and sin'), values: { mode: 'angle', a1: 1, a2: 0, a3: 0, b1: 1, b2: 1, b3: 0, phi: 45 } },
    { id: 'unit', label: L('(1|0|0) × (0|1|0) = (0|0|1)', '(1, 0, 0) × (0, 1, 0) = (0, 0, 1)'), values: { mode: 'cross', a1: 1, a2: 0, a3: 0, b1: 0, b2: 1, b3: 0 } },
    { id: 'chk123', label: L('(1|2|3) × (4|5|6)', '(1, 2, 3) × (4, 5, 6)'), values: { mode: 'cross', a1: 1, a2: 2, a3: 3, b1: 4, b2: 5, b3: 6 } },
    { id: 'par', label: L('Parallel: a × b = o', 'Parallel: a × b = o'), values: { mode: 'cross', a1: 1, a2: 2, a3: 3, b1: 2, b2: 4, b3: 6 } },
    { id: 'tri', label: L('Dreiecksfläche', 'Triangle area'), values: { mode: 'cross', a1: 0, a2: 3, a3: 0, b1: 0, b2: 0, b3: 2, tri: true } },
    { id: 'spat', label: L('Volumen eines Spats', 'Volume of a parallelepiped'), values: { mode: 'spat' } },
    { id: 'cav', label: L('Grundfläche mal Höhe', 'Base times height'), values: { mode: 'spat', a1: 2, a2: 0, a3: 0, b1: 0, b2: 3, b3: 0, c1: 2, c2: 1, c3: 2, cav: true } },
    { id: 'left', label: L('Linkssystem: Spatprodukt < 0', 'Left-handed: triple product < 0'), values: { mode: 'spat', c1: -1, c2: 1, c3: -2 } },
    { id: 'flat', label: L('Flacher Spat: Volumen 0', 'Flat parallelepiped: volume 0'), values: { mode: 'spat', c1: 1, c2: 3, c3: 2 } },
    { id: 'find', label: L('Entdecken: senkrechte Vektoren', 'Discover: perpendicular vectors'), values: { mode: 'find', task: 'perp' } },
  ],
  strings: {
    de: { canvas: 'Räumliches Koordinatensystem mit zwei bzw. drei Vektorpfeilen, Winkel und Projektion, Normalenvektor mit Parallelogramm oder Spat; Spitzen ziehbar, Ansicht drehbar; daneben eine Tafel mit der Rechnung' },
    en: { canvas: 'Three-dimensional coordinate system with two or three vector arrows, angle and projection, normal vector with parallelogram or parallelepiped; draggable tips, rotatable view; next to it a panel with the calculation' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const loc = (s: { de: string; en: string }) => (lang === 'de' ? s.de : s.en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const mode = () => p.mode as Mode;
    const task = () => p.task as TaskId;
    const G = (v: number) => new Glide(v, reduced);

    function regions(): { scene: Rect; panel: Rect; wide: boolean } {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.33, 250, 340));
        return { wide, scene: { x: 0, y: 0, w: W - pw - 14, h: H }, panel: { x: W - pw - 6, y: 6, w: pw, h: H - 12 } };
      }
      const ph = Math.round(clamp(H * 0.42, 190, 250));
      return { wide, scene: { x: 0, y: 0, w: W, h: H - ph - 10 }, panel: { x: 4, y: H - ph - 4, w: W - 8, h: ph } };
    }

    const view = new View3D(surface, { azimuth: 28, elevation: 20, elevationLimits: [-80, 89], distance: 6, region: () => regions().scene });

    /* ---------------- Wirksame Vektoren je Ansicht ---------------- */
    const pa = (): V3 => [p.a1, p.a2, p.a3];
    const pb = (): V3 => [p.b1, p.b2, p.b3];
    const pc = (): V3 => [p.c1, p.c2, p.c3];
    /** Länge von b in der Ansicht „Winkel drehen“ (aus den Reglern, sonst 2). */
    const angleLen = () => (norm(pb()) > 1e-9 ? norm(pb()) : 2);

    function effA(m: Mode = mode()): V3 {
      return m === 'find' ? TASKS[task()].a : pa();
    }
    function effB(m: Mode = mode(), phi = p.phi): V3 {
      if (m === 'find') {
        const t = TASKS[task()];
        return t.free === 'b' ? pb() : t.b!;
      }
      if (m === 'angle') return rotateFrom(effA(m), pb(), phi, angleLen());
      return pb();
    }
    function effC(m: Mode = mode()): V3 {
      if (m === 'find') {
        const t = TASKS[task()];
        return t.free === 'c' ? pc() : [0, 0, 0];
      }
      return pc();
    }
    /** Wird in dieser Ansicht ein dritter Vektor c gezeigt? */
    const hasC = (m: Mode = mode()) => m === 'spat' || (m === 'find' && (TASKS[task()].free === 'c' || TASKS[task()].b !== undefined));
    const tA = () => effA();
    const tB = () => effB();
    const tC = () => effC();

    /* ---------------- Zustand ---------------- */
    const ga = tA().map((v) => G(v));
    const gb = tB().map((v) => G(v));
    const gc = tC().map((v) => G(v));
    const phiG = G(p.phi);
    const projA = G(p.proj ? 1 : 0);
    const partsA = G(p.parts ? 1 : 0);
    const triA = G(p.tri ? 1 : 0);
    const pyrA = G(p.pyr ? 1 : 0);
    const cavG = G(p.cav ? 1 : 0);
    const shapeA = G(0);
    const extent = G(4);
    /** Rechenschritt beim Vektorprodukt: 0 … 3 (3 = alle Komponenten). */
    const stepG = G(p.scheme && !reduced ? 0 : 3);
    let autoStep = !reduced && p.scheme;
    let lastStepAt = 0;
    let now = performance.now();
    const introStart = now + (reduced ? -1e6 : 100);
    let animStart = now + (reduced ? -1e6 : 250);
    const ANIM_MS = 2200;
    let lastDrag = -1e9;
    let curMode: Mode = mode();
    let prevMode: Mode = curMode;
    let modeT0 = -1e9;
    const MODE_MS = 380;
    let sweeping = false;

    /** Gefundene Lösungen der Entdeckungsaufgabe. */
    let found: V3[] = [];
    let hintShown = false;
    let hitAt = -1e9;
    let dupAt = -1e9;

    const A = (): V3 => [ga[0]!.at(now), ga[1]!.at(now), ga[2]!.at(now)];
    const B = (): V3 => {
      if (mode() === 'angle') return rotateFrom(A(), pb(), phiG.at(now), angleLen());
      return [gb[0]!.at(now), gb[1]!.at(now), gb[2]!.at(now)];
    };
    const Cbase = (): V3 => [gc[0]!.at(now), gc[1]!.at(now), gc[2]!.at(now)];
    /** c wie gezeichnet – beim Scheren nach Cavalieri wandert c zur Höhe. */
    const C = (): V3 => (mode() === 'spat' ? shearC(A(), B(), Cbase(), cavG.at(now)) : Cbase());

    function retarget(snap = false): void {
      const ms = performance.now() - lastDrag < 200 ? 110 : 520;
      const set = (g: Glide, v: number, t = ms) => (snap ? g.snap(v) : g.go(v, t));
      tA().forEach((v, i) => set(ga[i]!, v));
      tB().forEach((v, i) => set(gb[i]!, v));
      tC().forEach((v, i) => set(gc[i]!, v));
      if (!sweeping) set(phiG, p.phi, performance.now() - lastDrag < 200 ? 90 : 650);
      set(projA, p.proj ? 1 : 0);
      set(partsA, p.parts ? 1 : 0);
      set(triA, p.tri ? 1 : 0);
      set(pyrA, p.pyr ? 1 : 0);
      set(cavG, p.cav ? 1 : 0, 1400);
      set(shapeA, mode() === 'find' && (hintShown || found.length >= 3) ? 1 : 0, 900);
      const pts: V3[] = [tA(), tB()];
      if (mode() === 'angle') pts.push([angleLen(), angleLen(), angleLen()]);
      if (mode() === 'cross' || mode() === 'spat') pts.push(cross(tA(), tB()));
      if (hasC()) pts.push(tC(), vec3.add(vec3.add(tA(), tB()), tC()) as V3);
      if (mode() === 'find') pts.push([4, 4, 4]);
      const m = Math.max(2.5, ...pts.flatMap((q) => q.map((v) => Math.abs(v))));
      set(extent, Math.min(13, Math.ceil(m + 0.6)));
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
    const CM = () => ctx.theme.series[1]!;
    const n1 = (v: number) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, 2);
    const par = (v: number) => (v < 0 ? `(${n1(v)})` : n1(v));
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mfont = (s: number) => `italic 700 ${s}px ${ctx.theme.mathFont}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const vt = (v: V3) => `(${v.map(n1).join(lang === 'de' ? ' | ' : ', ')})`;
    const deg = (v: number) => `${fmt.num(v, 1)}°`;
    // Betrag exakt (3), als Wurzel (√5) oder gerundet (2,24) – „approx“ verlangt danach „≈“
    const lenTxt = (v: V3) => {
      const f = normForm(v);
      return { s: f.kind === 'root' ? `√${fmt.num(f.sq, 2)}` : n1(f.value), exact: f.kind !== 'approx' };
    };

    /* ---------------- Ziehen ---------------- */
    const r05 = (v: number) => clamp(Math.round(v * 2) / 2, -LIM, LIM);
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
    tipHandle(A, ['a1', 'a2', 'a3'], CA, () => mode() !== 'find' && !sweeping);
    tipHandle(B, ['b1', 'b2', 'b3'], CB, () => mode() !== 'angle' && (mode() !== 'find' || TASKS[task()].free === 'b'));
    tipHandle(Cbase, ['c1', 'c2', 'c3'], CC, () => (mode() === 'spat' && cavG.at(now) < 0.02) || (mode() === 'find' && TASKS[task()].free === 'c'));
    // In „Winkel drehen“ läuft die Spitze von b auf einem Halbkreis: Ziehen ändert nur φ.
    view.addHandle({
      get: () => B() as Vec3,
      set: (q) => {
        lastDrag = performance.now();
        const phi = Math.round(angleInPlane(tA(), pb(), q as V3));
        if (phi !== p.phi) ctx.set({ phi });
      },
      get plane() {
        return cross(unit(tA()), perpUnit(tA(), pb())) as Vec3;
      },
      enabled: () => !ctx.locked && mode() === 'angle' && !sweeping && norm(tA()) > 1e-9,
      color: CB,
    });

    /* ---------------- Zeichnen: Bausteine ---------------- */
    const O: Vec3 = [0, 0, 0];

    function vecLabel(at: Vec3, name: string, color: string, offset: [number, number], size = 16, a = 1): void {
      if (a < 0.02) return;
      view.custom(
        at,
        (g) => {
          const [x0, y0] = view.toPx(at);
          const x = x0 + offset[0];
          const y = y0 + offset[1];
          g.save();
          g.globalAlpha *= a;
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

    function sideLabel(from: Vec3, to: Vec3, name: string, color: string, side = 1, at = 0.5, size = 16, a = 1): void {
      const [ax, ay] = view.toPx(from);
      const [bx, by] = view.toPx(to);
      const l = Math.hypot(bx - ax, by - ay) || 1;
      let nx = -(by - ay) / l;
      let ny = (bx - ax) / l;
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      vecLabel(vec3.lerp(from, to, at), name, color, [nx * 17 * side, ny * 17 * side], size, a);
    }

    function arrowV(from: Vec3, to: Vec3, color: string, width = 3.4, a = 1, dash?: number[]): void {
      if (vec3.distance(from, to) < 1e-3 || a < 0.01) return;
      view.arrow(from, to, { color, width, head: 14, alpha: a, dash });
    }

    /** Nullvektor: ein kleiner Ring im Ursprung mit Namen. */
    function zeroMark(name: string, color: string, offset: [number, number]): void {
      view.custom(
        O,
        (g) => {
          const [x, y] = view.toPx(O);
          g.save();
          g.strokeStyle = color;
          g.lineWidth = 2.2;
          g.beginPath();
          g.arc(x, y, 7, 0, Math.PI * 2);
          g.stroke();
          g.restore();
          text(g, name, x + offset[0], y + offset[1], { font: mfont(14), color, align: 'left' });
        },
        'front',
      );
    }

    /** Rechter-Winkel-Zeichen im Punkt `at` zwischen den Richtungen u und v. */
    function rightAngle(at: Vec3, u: Vec3, v: Vec3, size: number, color: string, a = 1): void {
      if (vec3.length(u) < 1e-9 || vec3.length(v) < 1e-9) return;
      const uu = vec3.scale(vec3.normalize(u), size);
      const vv = vec3.scale(vec3.normalize(v), size);
      view.polyline([vec3.add(at, uu), vec3.add(vec3.add(at, uu), vv), vec3.add(at, vv)], { color, width: 1.6, alpha: a });
    }

    /** Punkte eines Bogens um O von Richtung u nach Richtung v (Radius r). */
    function arcPoints(u: Vec3, v: Vec3, r: number, upto = 1): { pts: Vec3[]; phi: number; nu: Vec3; w: Vec3 } | null {
      if (vec3.length(u) < 1e-9 || vec3.length(v) < 1e-9) return null;
      const nu = vec3.normalize(u);
      const nv = vec3.normalize(v);
      let w = vec3.sub(nv, vec3.scale(nu, vec3.dot(nu, nv)));
      if (vec3.length(w) < 1e-6) return null;
      w = vec3.normalize(w);
      const phi = Math.acos(clamp(vec3.dot(nu, nv), -1, 1)) * upto;
      const n = Math.max(6, Math.round(phi * 18));
      const pts: Vec3[] = [];
      for (let i = 0; i <= n; i++) {
        const t = (phi * i) / n;
        pts.push(vec3.add(vec3.scale(nu, r * Math.cos(t)), vec3.scale(w, r * Math.sin(t))));
      }
      return { pts, phi, nu, w };
    }

    /** Winkelbogen zwischen u und v im Ursprung mit Fläche und Beschriftung. */
    function angleArc(u: Vec3, v: Vec3, r: number, color: string, label: string, a: number): void {
      const arc = arcPoints(u, v, r);
      if (!arc) return;
      view.face([O, ...arc.pts], { color, alpha: 0.2 * a, flat: true, layer: 'back' });
      view.polyline(arc.pts, { color, width: 2, alpha: a });
      const h = arc.phi / 2;
      const mid = vec3.add(vec3.scale(arc.nu, r * 1.45 * Math.cos(h)), vec3.scale(arc.w, r * 1.45 * Math.sin(h)));
      if (label) view.label(mid, label, { color, size: 13, weight: '800', align: 'center', baseline: 'middle', background: alpha(cardBg(), 0.85) });
    }

    /** Drehpfeil von u nach v (Rechte-Hand-Regel): Bogen mit Spitze. */
    function turnArrow(u: Vec3, v: Vec3, r: number, color: string, a: number): void {
      const arc = arcPoints(u, v, r, 0.82);
      if (!arc || arc.pts.length < 3 || a < 0.02) return;
      view.polyline(arc.pts, { color, width: 2.2, alpha: a });
      const p1 = arc.pts[arc.pts.length - 2]!;
      const p2 = arc.pts[arc.pts.length - 1]!;
      const [x1, y1] = view.toPx(p1);
      const [x2, y2] = view.toPx(p2);
      view.custom(
        p2,
        (g) => {
          const ang = Math.atan2(y2 - y1, x2 - x1);
          g.save();
          g.globalAlpha *= a;
          g.fillStyle = color;
          g.beginPath();
          g.moveTo(x2 + Math.cos(ang) * 6, y2 + Math.sin(ang) * 6);
          g.lineTo(x2 + Math.cos(ang + 2.4) * 7, y2 + Math.sin(ang + 2.4) * 7);
          g.lineTo(x2 + Math.cos(ang - 2.4) * 7, y2 + Math.sin(ang - 2.4) * 7);
          g.closePath();
          g.fill();
          g.restore();
        },
        'front',
      );
    }

    /** Quadratisches Ebenenstück um `center` aus den Richtungen e1, e2. */
    function planePatch(center: Vec3, e1: Vec3, e2: Vec3, half: number, color: string, a: number): void {
      if (a < 0.01) return;
      const u = vec3.scale(vec3.normalize(e1), half);
      const v = vec3.scale(vec3.normalize(e2), half);
      const pts: Vec3[] = [vec3.sub(vec3.sub(center, u), v), vec3.sub(vec3.add(center, u), v), vec3.add(vec3.add(center, u), v), vec3.add(vec3.sub(center, u), v)];
      view.face(pts, { color, alpha: 0.13 * a, flat: true, stroke: color, width: 1.2, dash: [5, 4], layer: 'back' });
      // Gitterlinien als Hilfe für die Lage
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const s = (i / 3) * half;
        view.segment(vec3.add(vec3.sub(center, v), vec3.scale(vec3.normalize(e1), s)), vec3.add(vec3.add(center, v), vec3.scale(vec3.normalize(e1), s)), { color, width: 0.8, alpha: 0.28 * a, layer: 'back' });
        view.segment(vec3.add(vec3.sub(center, u), vec3.scale(vec3.normalize(e2), s)), vec3.add(vec3.add(center, u), vec3.scale(vec3.normalize(e2), s)), { color, width: 0.8, alpha: 0.28 * a, layer: 'back' });
      }
    }

    /** Kegelmantel mit Spitze O um die Achse `axis`, halber Öffnungswinkel `half` (Grad), Länge `len`. */
    function coneShape(axis: Vec3, half: number, len: number, color: string, a: number): void {
      if (a < 0.01) return;
      const e = vec3.normalize(axis);
      const u = perpUnit(e as V3, [0, 0, 1]) as Vec3;
      const w = vec3.cross(e, u);
      const t = (half * Math.PI) / 180;
      const N = 36;
      const ring: Vec3[] = [];
      for (let i = 0; i <= N; i++) {
        const s = (2 * Math.PI * i) / N;
        const dir = vec3.add(vec3.scale(e, Math.cos(t)), vec3.add(vec3.scale(u, Math.sin(t) * Math.cos(s)), vec3.scale(w, Math.sin(t) * Math.sin(s))));
        ring.push(vec3.scale(dir, len));
      }
      for (let i = 0; i < N; i++) view.face([O, ring[i]!, ring[i + 1]!], { color, alpha: 0.1 * a, flat: true, layer: 'back' });
      view.polyline(ring, { color, width: 1.3, alpha: 0.7 * a, dash: [5, 4] });
      for (let i = 0; i < N; i += 6) view.segment(O, ring[i]!, { color, width: 0.9, alpha: 0.35 * a });
    }

    /** Zylindermantel um die Achse durch O in Richtung `axis` mit Radius r und halber Länge h. */
    function cylinderShape(axis: Vec3, r: number, h: number, color: string, a: number): void {
      if (a < 0.01) return;
      const e = vec3.normalize(axis);
      const u = perpUnit(e as V3, [0, 0, 1]) as Vec3;
      const w = vec3.cross(e, u);
      const N = 36;
      const ringAt = (z: number) => {
        const pts: Vec3[] = [];
        for (let i = 0; i <= N; i++) {
          const s = (2 * Math.PI * i) / N;
          pts.push(vec3.add(vec3.scale(e, z), vec3.add(vec3.scale(u, r * Math.cos(s)), vec3.scale(w, r * Math.sin(s)))));
        }
        return pts;
      };
      const r0 = ringAt(-h);
      const r1 = ringAt(h);
      for (let i = 0; i < N; i++) view.face([r0[i]!, r0[i + 1]!, r1[i + 1]!, r1[i]!], { color, alpha: 0.09 * a, flat: true, layer: 'back' });
      for (const z of [-h, -h / 2, 0, h / 2, h]) view.polyline(ringAt(z), { color, width: z === 0 ? 1.4 : 1, alpha: (z === 0 ? 0.75 : 0.4) * a, dash: z === 0 ? undefined : [5, 4] });
    }

    /** Spat aus a, b, c mit Flächen und Kanten. */
    function drawSpat(a: Vec3, b: Vec3, c: Vec3, u: number, color: string, side: string, edge: string): void {
      const P = (i: number, j: number, k: number): Vec3 => vec3.add(vec3.add(vec3.scale(a, i * u), vec3.scale(b, j * u)), vec3.scale(c, k * u));
      const faces: Vec3[][] = [
        [P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)],
        [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)],
        [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)],
        [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)],
        [P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)],
        [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)],
      ];
      faces.forEach((f, i) => view.face(f, { color: i < 2 ? color : side, alpha: i === 0 ? 0.22 : 0.08, flat: true }));
      for (const f of faces) for (let i = 0; i < 4; i++) view.segment(f[i]!, f[(i + 1) % 4]!, { color: edge, width: 1.1, alpha: 0.7 * u });
    }

    /** Kurzes Schild mit Text an einem Punkt der Szene. */
    function tag(at: Vec3, s: string, color: string, offset: [number, number] = [0, 0], size = 12): void {
      view.label(at, s, { color, size, weight: '800', align: 'center', baseline: 'middle', offset, background: alpha(cardBg(), 0.88) });
    }

    /* ---------------- Zeichnen: Szene je Ansicht ---------------- */
    function sceneDot(): void {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const b = B() as Vec3;
      const ca = CA();
      const cb = CB();
      const cn = CN();
      const res = p.show;
      const u1 = phase(0.05, 0.45);
      const u2 = phase(0.5, 0.95);
      const rel = relation(tA(), tB());
      arrowV(O, a, ca);
      arrowV(O, b, cb);
      if (vec3.length(a) > 1e-3) sideLabel(O, a, 'a', ca, -1);
      else zeroMark('a = o', ca, [10, -12]);
      if (vec3.length(b) > 1e-3) sideLabel(O, b, 'b', cb, 1);
      else zeroMark('b = o', cb, [10, 12]);
      const phi = angleDeg(tA(), tB());
      if (Number.isFinite(phi)) {
        const r = Math.min(vec3.length(a), vec3.length(b)) * 0.45;
        if (rel === 'perpendicular') rightAngle(O, a, b, Math.min(0.55, r), cn, u1);
        else if (rel === 'parallel') tag(vec3.scale(a, 0.5), 'φ = 0°', cn, [0, 18]);
        else if (rel === 'antiparallel') tag(O, 'φ = 180°', cn, [0, 20]);
        else angleArc(a, b, r * Math.max(0.05, u1), cn, res && u1 > 0.9 ? `φ ≈ ${deg(phi)}` : u1 > 0.9 ? 'φ' : '', u1);
      }
      // Projektion von b auf a: Schatten von b auf der Geraden durch a
      const pj = projA.at(now) * u2;
      if (pj > 0.01 && vec3.length(a) > 1e-6) {
        const f = projection(B(), A()) as Vec3;
        const against = vec3.dot(f, a) < -1e-9;
        const ext = vec3.scale(vec3.normalize(a), against ? -Math.max(1, vec3.length(f) + 0.6) : Math.max(vec3.length(a), vec3.length(f)) + 0.6);
        view.segment(O, ext, { color: mixColor(ca, theme.bg, 0.45), width: 1.2, dash: [4, 4], alpha: pj });
        view.segment(b, vec3.lerp(b, f, pj), { color: theme.muted, width: 1.4, dash: [4, 4], alpha: pj });
        view.segment(O, f, { color: CP(), width: 5, alpha: 0.85 * pj });
        if (vec3.distance(b, f) > 0.3 && vec3.length(f) > 0.3) rightAngle(f, vec3.scale(f, -1), vec3.sub(b, f), 0.28, theme.muted, pj);
        view.point(f, { color: CP(), radius: 4 * pj });
        if (res && pj > 0.9 && vec3.length(f) > 0.6) tag(vec3.scale(f, 0.5), `${n1(projLength(tB(), tA()))}`, CP(), [0, 16], 11.5);
      }
    }

    function sceneAngle(): void {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const b = B() as Vec3;
      const ca = CA();
      const cb = CB();
      const cn = CN();
      const la = vec3.length(a);
      if (la < 1e-6) {
        zeroMark('a = o', ca, [10, -12]);
        return;
      }
      const lb = angleLen();
      const e = vec3.normalize(a);
      const u = perpUnit(tA(), pb()) as Vec3;
      const phi = phiG.at(now);
      const grow = reduced ? 1 : ease.outCubic(clamp((now - modeT0) / 700, 0, 1));
      // Halbkreis, auf dem die Spitze von b läuft
      const track: Vec3[] = [];
      for (let i = 0; i <= 48; i++) {
        const t = (Math.PI * i) / 48;
        track.push(vec3.add(vec3.scale(e, lb * Math.cos(t)), vec3.scale(u, lb * Math.sin(t))));
      }
      view.face([O, ...track], { color: cb, alpha: 0.05 * grow, flat: true, layer: 'back' });
      view.polyline(track, { color: mixColor(cb, theme.bg, 0.4), width: 1.2, dash: [4, 5], alpha: grow });
      // Gerade durch a
      view.segment(vec3.scale(e, -lb - 0.6), vec3.scale(e, Math.max(la, lb) + 0.6), { color: mixColor(ca, theme.bg, 0.5), width: 1.1, dash: [4, 4], alpha: grow });
      // Parallelogramm: Fläche = |a| · |b| · sin φ
      view.face([O, a, vec3.add(a, b), b], { color: cn, alpha: 0.13, flat: true, layer: 'back' });
      view.polyline([a, vec3.add(a, b), b], { color: mixColor(cn, theme.bg, 0.4), width: 1.2, dash: [5, 4] });
      // Projektion (|b| cos φ) und Höhe (|b| sin φ)
      const f = vec3.scale(e, lb * Math.cos((phi * Math.PI) / 180));
      const pj = projA.at(now);
      if (pj > 0.01) {
        view.segment(O, f, { color: CP(), width: 5, alpha: 0.85 * pj });
        view.segment(b, f, { color: cn, width: 2.4, dash: [6, 4], alpha: pj });
        if (vec3.distance(b, f) > 0.3 && vec3.length(f) > 0.3) rightAngle(f, vec3.scale(f, -1), vec3.sub(b, f), 0.26, theme.muted, pj);
        if (vec3.length(f) > 1.2) tag(vec3.scale(f, 0.62), '|b| cos φ', CP(), [0, 18], 11);
        if (vec3.distance(b, f) > 0.7) tag(vec3.lerp(f, b, 0.5), '|b| sin φ', cn, [34, 0], 11);
      }
      arrowV(O, a, ca);
      arrowV(O, b, cb);
      sideLabel(O, a, 'a', ca, -1);
      sideLabel(O, b, 'b', cb, 1, 0.62);
      const r = Math.min(la, lb) * 0.42;
      if (Math.abs(phi - 90) < 0.5) rightAngle(O, a, b, Math.min(0.55, r), cn);
      else if (phi > 0.5 && phi < 179.5) angleArc(a, b, r, cn, `φ = ${fmt.num(phi, 0)}°`, 1);
      view.ball(b, 0.13, { color: cb });
    }

    function sceneCross(): void {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const b = B() as Vec3;
      const ca = CA();
      const cb = CB();
      const cn = CN();
      const res = p.show;
      const u1 = phase(0.05, 0.4);
      const n = cross(A(), B()) as Vec3;
      const sum = vec3.add(a, b);
      const k = u1 || 0.001;
      view.face([O, vec3.scale(a, k), vec3.add(vec3.scale(a, k), vec3.scale(b, k)), vec3.scale(b, k)], { color: cn, alpha: 0.16, flat: true, layer: 'back' });
      view.polyline([a, sum, b], { color: mixColor(cn, theme.bg, 0.45), width: 1.4, dash: [5, 4], alpha: u1 });
      const ta = triA.at(now);
      if (ta > 0.01) {
        view.face([O, a, b], { color: CP(), alpha: 0.3 * ta, flat: true, layer: 'back' });
        view.segment(a, b, { color: CP(), width: 2, alpha: ta });
      }
      arrowV(O, a, ca);
      arrowV(O, b, cb);
      sideLabel(O, a, 'a', ca, -1);
      sideLabel(O, b, 'b', cb, 1);
      if (vec3.length(n) < 1e-6) {
        if (vec3.length(a) > 1e-6 && vec3.length(b) > 1e-6) zeroMark('a × b = o', cn, [10, 14]);
        return;
      }
      // Drehsinn a → b (Rechte-Hand-Regel)
      const r = Math.min(vec3.length(a), vec3.length(b)) * 0.38;
      turnArrow(a, b, r, cn, u1);
      if (!res) return;
      // a × b entsteht Komponente für Komponente
      const step = p.scheme ? stepG.at(now) : 3 * phase(0.45, 0.95);
      // Sehr lange Normalenvektoren werden maßstäblich verkürzt gezeichnet.
      const lim = extent.at(now) * 1.05;
      const short = vec3.length(n) > lim ? lim / vec3.length(n) : 1;
      const nn = [0, 1, 2].map((i) => n[i]! * short * clamp(step - i, 0, 1));
      const tip: Vec3 = [nn[0]!, nn[1]!, nn[2]!];
      if (step < 2.999) {
        view.polyline([O, [nn[0]!, 0, 0], [nn[0]!, nn[1]!, 0], tip], { color: theme.muted, width: 1.3, dash: [4, 4] });
      }
      arrowV(O, tip, cn, 4);
      if (step > 2.95) {
        rightAngle(O, a, n, 0.32, theme.muted);
        rightAngle(O, b, n, 0.32, theme.muted);
        sideLabel(O, tip, 'a × b', cn, 1, 0.72, 15);
        if (short < 1) tag(tip, tt(`verkürzt (× ${fmt.num(short, 2)})`, `shortened (× ${fmt.num(short, 2)})`), cn, [0, -18], 11);
        tag(vec3.scale(sum, 0.5), `A = ${n1(parallelogramArea(tA(), tB()))}`, cn);
        if (ta > 0.5) tag(vec3.scale(sum, 0.28), `${n1(parallelogramArea(tA(), tB()) / 2)}`, CP(), [0, 0], 11);
      }
    }

    function sceneSpat(): void {
      const theme = ctx.theme;
      const a = A() as Vec3;
      const b = B() as Vec3;
      const c = C() as Vec3;
      const ca = CA();
      const cb = CB();
      const cn = CN();
      const res = p.show;
      const u1 = phase(0.05, 0.45);
      const u2 = phase(0.5, 0.95);
      const n = cross(A(), B()) as Vec3;
      const cav = cavG.at(now);
      // Beim Scheren bleibt der ursprüngliche Spat als Umriss stehen
      if (cav > 0.01) {
        const c0 = Cbase() as Vec3;
        const ghost: Vec3[] = [c0, vec3.add(c0, a), vec3.add(vec3.add(c0, a), b), vec3.add(c0, b)];
        view.polyline(ghost, { color: theme.muted, width: 1, dash: [3, 4], alpha: 0.7 * cav, closed: true });
        for (const q of [O, a, vec3.add(a, b), b]) view.segment(q, vec3.add(q, c0), { color: theme.muted, width: 0.9, dash: [3, 4], alpha: 0.5 * cav });
      }
      drawSpat(a, b, c, u1, cn, CC(), mixColor(cn, theme.bg, 0.4));
      const py = pyrA.at(now);
      if (py > 0.01) {
        const tet: Vec3[][] = [
          [O, a, b],
          [O, a, c],
          [O, b, c],
          [a, b, c],
        ];
        for (const f of tet) view.face(f, { color: CP(), alpha: 0.32 * py, flat: true, stroke: CP(), width: 1.4 });
      }
      arrowV(O, a, ca);
      arrowV(O, b, cb);
      sideLabel(O, a, 'a', ca, -1);
      sideLabel(O, b, 'b', cb, 1);
      if (vec3.length(c) > 1e-6) {
        arrowV(O, c, CC());
        sideLabel(O, c, 'c', CC(), 1);
      } else zeroMark('c = o', CC(), [10, 12]);
      if (vec3.length(n) < 1e-6) return;
      // Höhe: Projektion von c auf a × b
      const h = spatHeight(A(), B(), C()) as Vec3;
      if (u2 > 0.01 && vec3.length(h) > 1e-3) {
        view.segment(O, vec3.lerp(O, h, u2), { color: CP(), width: 3, dash: [6, 4], alpha: 0.9 });
        if (u2 > 0.9) {
          tag(vec3.scale(h, 0.55), `h = ${n1(vec3.length(h))}`, CP(), [26, 0], 11.5);
          if (vec3.distance(c, h) > 0.3) view.segment(c, h, { color: theme.muted, width: 1, dash: [2, 3] });
        }
      }
      if (res) {
        const tip = vec3.scale(vec3.normalize(n), Math.min(vec3.length(n), Math.max(1.5, extent.at(now) * 0.75)) * u2);
        arrowV(O, tip, cn, 3.6, 0.9);
        if (u2 > 0.9) {
          sideLabel(O, tip, 'a × b', cn, -1, 0.85, 14);
          tag(vec3.scale(vec3.add(a, b), 0.5), `G = ${n1(norm(n))}`, cn, [0, 0], 11.5);
        }
      }
    }

    function sceneFind(): void {
      const theme = ctx.theme;
      const t = TASKS[task()];
      const a = A() as Vec3;
      const ca = CA();
      const cb = CB();
      const cc = CC();
      const cn = CN();
      const E = extent.at(now);
      const sh = shapeA.at(now);
      const free = t.free === 'b' ? (B() as Vec3) : (C() as Vec3);
      const fc = t.free === 'b' ? cb : cc;
      const solved = taskSolved(task(), t.free === 'b' ? tB() : tC());
      // Lösungsmenge (nach drei Funden oder auf Wunsch)
      if (sh > 0.01) {
        const e = vec3.normalize(a);
        switch (task()) {
          case 'perp': {
            const u = perpUnit(t.a, [0, 0, 1]) as Vec3;
            planePatch(O, u, vec3.cross(e, u), E * 0.85, cn, sh);
            break;
          }
          case 'angle':
            coneShape(vec3.scale(e, -1), 60, E * 0.9, cn, sh);
            break;
          case 'area':
            cylinderShape(e, 3, E * 0.85, cn, sh);
            break;
          case 'vol':
            planePatch([0, 0, 2], [1, 0, 0], [0, 1, 0], E * 0.7, cn, sh);
            planePatch([0, 0, -2], [1, 0, 0], [0, 1, 0], E * 0.7, cn, sh);
            break;
          case 'flat':
            planePatch(O, t.a as Vec3, vec3.sub(t.b! as Vec3, vec3.scale(vec3.normalize(t.a as Vec3), vec3.dot(t.b! as Vec3, vec3.normalize(t.a as Vec3)))), E * 0.85, cn, sh);
            break;
        }
      }
      // Gefundene Lösungen als blasse Pfeile
      found.forEach((q, i) => {
        const age = clamp((now - hitAt) / 600, 0, 1);
        const fresh = i === found.length - 1 ? 1 - age : 0;
        arrowV(O, q as Vec3, fc, 2.2, 0.32 + 0.4 * fresh);
        view.ball(q as Vec3, 0.1 + 0.08 * fresh, { color: theme.series[2]! });
      });
      // vorgegebene Vektoren
      arrowV(O, a, ca);
      sideLabel(O, a, 'a', ca, -1);
      if (t.b) {
        arrowV(O, t.b as Vec3, cb);
        sideLabel(O, t.b as Vec3, 'b', cb, 1);
      }
      if (task() === 'vol' || task() === 'flat') {
        const bb = t.b! as Vec3;
        view.face([O, a, vec3.add(a, bb), bb], { color: cn, alpha: 0.16, flat: true, layer: 'back' });
        drawSpat(a, bb, free, 1, cn, cc, mixColor(cn, theme.bg, 0.45));
      }
      if (task() === 'area') {
        view.face([O, a, vec3.add(a, free), free], { color: cn, alpha: 0.16, flat: true, layer: 'back' });
        view.polyline([a, vec3.add(a, free), free], { color: mixColor(cn, theme.bg, 0.45), width: 1.2, dash: [5, 4] });
      }
      if (task() === 'perp' || task() === 'angle') {
        const phi = angleDeg(t.a, t.free === 'b' ? tB() : tC());
        if (Number.isFinite(phi)) {
          const r = Math.min(vec3.length(a), vec3.length(free)) * 0.42;
          if (Math.abs(phi - 90) < 1e-6) rightAngle(O, a, free, Math.min(0.5, r), cn);
          else angleArc(a, free, r, cn, `${fmt.num(phi, 1)}°`, 1);
        }
      }
      if (vec3.length(free) > 1e-6) {
        const glow = clamp(1 - (now - hitAt) / 900, 0, 1);
        if (solved) view.ball(free, 0.2 + 0.12 * glow, { color: theme.series[2]!, alpha: 0.55 });
        arrowV(O, free, fc, 3.8);
        sideLabel(O, free, t.free, fc, 1, 0.6);
      } else zeroMark(`${t.free} = o`, fc, [10, 12]);
    }

    /** Sonderfall oder Rückmeldung, die oben links im Bild angesagt wird. */
    function specialNote(): { text: string; ok?: boolean } | null {
      const a = tA();
      const b = tB();
      switch (mode()) {
        case 'dot': {
          const r = relation(a, b);
          if (r === 'zero') return { text: tt('Nullvektor: kein Winkel, a · b = 0', 'Zero vector: no angle, a · b = 0') };
          if (r === 'perpendicular') return { text: tt('a ⊥ b: a · b = 0', 'a ⊥ b: a · b = 0'), ok: true };
          if (r === 'parallel') return { text: tt('a ∥ b, gleiche Richtung: a · b = |a| · |b|', 'a ∥ b, same direction: a · b = |a| · |b|') };
          if (r === 'antiparallel') return { text: tt('a ∥ b, Gegenrichtung: a · b = −|a| · |b|', 'a ∥ b, opposite: a · b = −|a| · |b|') };
          return null;
        }
        case 'angle': {
          const f = p.phi;
          if (norm(a) < 1e-9) return { text: tt('a = o: keine Richtung, kein Winkel', 'a = o: no direction, no angle') };
          if (f === 90) return { text: tt('φ = 90°: a · b = 0, Fläche am größten', 'φ = 90°: a · b = 0, largest area'), ok: true };
          if (f === 0 || f === 180) return { text: tt('φ = 0° bzw. 180°: Fläche 0, |a · b| am größten', 'φ = 0° or 180°: area 0, |a · b| largest') };
          if (f === 45 || f === 135) return { text: tt('φ = 45° bzw. 135°: |a · b| = |a × b|', 'φ = 45° or 135°: |a · b| = |a × b|') };
          return null;
        }
        case 'cross': {
          if (norm(a) < 1e-9 || norm(b) < 1e-9) return { text: tt('Nullvektor: a × b = o', 'Zero vector: a × b = o') };
          if (norm(cross(a, b)) < 1e-9) return { text: tt('a ∥ b: a × b = o, Fläche 0', 'a ∥ b: a × b = o, area 0') };
          if (Math.abs(dot(a, b)) < 1e-9) return { text: tt('a ⊥ b: Fläche = |a| · |b| (Rechteck)', 'a ⊥ b: area = |a| · |b| (rectangle)'), ok: true };
          return null;
        }
        case 'spat': {
          const hd = handedness(a, b, tC());
          if (hd === 'flat') return { text: tt('a, b, c in einer Ebene: Volumen 0', 'a, b, c in one plane: volume 0') };
          if (hd === 'left') return { text: tt('Linkssystem: Spatprodukt negativ, Volumen = Betrag', 'Left-handed: triple product negative, volume = absolute value') };
          if (p.cav) return { text: tt('Scheren ändert das Volumen nicht (Cavalieri)', 'Shearing keeps the volume (Cavalieri)'), ok: true };
          return null;
        }
        case 'find': {
          const t = TASKS[task()];
          const v = t.free === 'b' ? tB() : tC();
          if (found.length >= 3) return { text: tt('Geschafft: drei Lösungen!', 'Done: three solutions!'), ok: true };
          if (now - dupAt < 1500) return { text: tt('Diese Lösung hast du schon – suche eine andere.', 'You already have this one – find another.') };
          if (taskSolved(task(), v)) return { text: tt(`Lösung ${found.length} von 3 gefunden`, `Solution ${found.length} of 3 found`), ok: true };
          if (norm(v) < 1e-9) return { text: tt('Der Nullvektor zählt nicht.', 'The zero vector does not count.') };
          if (task() === 'flat' && (norm(cross(t.a, v)) < 1e-9 || norm(cross(t.b!, v)) < 1e-9)) return { text: tt('Vielfache von a oder b zählen nicht.', 'Multiples of a or b do not count.') };
          return null;
        }
      }
    }

    function drawNote(R: Rect, narrow: boolean): void {
      const note = specialNote();
      if (!note) return;
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      const f = font(750, narrow ? 11 : 12);
      g.font = f;
      const w = Math.min(g.measureText(note.text).width + 20, R.w - 70);
      const x = R.x + 12;
      const y = R.y + 12;
      const fade = reduced ? 1 : clamp((now - modeT0) / 400, 0, 1);
      g.globalAlpha = fade;
      g.fillStyle = note.ok ? theme.series[2]! : mixColor(theme.series[1]!, theme.bg, 0.05);
      roundRect(g, x, y, w, 24, 12);
      g.fill();
      g.beginPath();
      g.rect(x, y, w - 8, 24);
      g.clip();
      text(g, note.text, x + 10, y + 12.5, { font: f, color: textOn(note.ok ? theme.series[2]! : mixColor(theme.series[1]!, theme.bg, 0.05), theme), align: 'left' });
      g.restore();
    }

    function drawScene(): void {
      const theme = ctx.theme;
      const R = regions().scene;
      const narrow = R.w < 520;
      const E = extent.at(now);
      view.setScene({ target: [0.2, 0.4, 0.8], radius: E * (narrow ? 1.05 : 0.92), anchor: [0.5, 0.53] });
      view.begin();
      const grow = reduced ? 1 : ease.outCubic(clamp((now - introStart) / 700, 0, 1));
      if (p.grid) view.grid({ min: [-E, -E], max: [E, E], step: E > 8 ? 2 : 1, color: theme.gridMinor, fade: true });
      view.axes({ min: -E * grow, max: (E + 0.5) * grow, color: alpha(theme.axis, 0.8), width: 1.4 });
      view.point(O, { color: theme.text, radius: 3 });
      switch (mode()) {
        case 'dot':
          sceneDot();
          break;
        case 'angle':
          sceneAngle();
          break;
        case 'cross':
          sceneCross();
          break;
        case 'spat':
          sceneSpat();
          break;
        case 'find':
          sceneFind();
          break;
      }
      view.end();
      drawNote(R, narrow);
    }

    /* ---------------- Tafel: Bausteine ---------------- */
    /** Infokarte im einheitlichen Stil (sim-core). */
    function card(r: Rect): void {
      drawCard(surface.g, r, ctx.theme);
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

    /** Zeile aus Spaltenvektoren und Text, schrumpft bei Platzmangel. */
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

    function wrap(msg: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const lines: string[] = [];
      let cur = '';
      for (const wd of msg.split(' ')) {
        const nx = cur ? `${cur} ${wd}` : wd;
        if (g.measureText(nx).width > maxW && cur) {
          lines.push(cur);
          cur = wd;
        } else cur = nx;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function drawTip(R: Rect, msg: string): void {
      if (R.h < 36) return;
      const g = surface.g;
      const theme = ctx.theme;
      const f = font(550, 11.5);
      const lines = wrap(msg, R.w - 18, f);
      const max = Math.floor((R.h - 12) / 14.5);
      const h = Math.min(R.h, 12 + Math.min(max, lines.length) * 14.5);
      g.save();
      roundRect(g, R.x, R.y, R.w, h, 10);
      g.fillStyle = alpha(theme.series[0]!, theme.dark ? 0.14 : 0.07);
      g.fill();
      lines.slice(0, max).forEach((l, i) => text(g, l, R.x + 9, R.y + 13 + i * 14.5, { font: f, color: theme.muted, align: 'left' }));
      g.restore();
    }

    /** Zeilenschreiber für die Tafel: Beschriftung links, Wert rechts. */
    function rows(x0: number, w: number, y0: number, bottom: number) {
      const g = surface.g;
      const theme = ctx.theme;
      let y = y0;
      return {
        get y() {
          return y;
        },
        skip(dy: number) {
          y += dy;
        },
        row(label: string, value: string, color = theme.text) {
          if (y > bottom - 6) return;
          text(g, label, x0, y, { font: font(600, 12), color: theme.muted, align: 'left' });
          g.font = font(600, 12);
          const lw = g.measureText(label).width;
          let size = 12;
          g.font = font(800, size);
          while (size > 9 && g.measureText(value).width > w - lw - 10) {
            size -= 0.5;
            g.font = font(800, size);
          }
          text(g, value, x0 + w, y, { font: font(800, size), color, align: 'right' });
          y += 20;
        },
        /** Zweizeilig: Formel oben, Rechnung darunter rechtsbündig. */
        row2(label: string, value: string, color = theme.text) {
          if (y > bottom - 22) return;
          text(g, label, x0, y, { font: font(650, 12), color: theme.muted, align: 'left' });
          text(g, value, x0 + w, y + 16, { font: font(800, 12.5), color, align: 'right' });
          y += 38;
        },
      };
    }

    function title(x0: number, y: number, w: number, s: string, right?: string, rightColor?: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      text(g, s, x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
      if (right) text(g, right, x0 + w, y, { font: font(800, 13), color: rightColor ?? theme.muted, align: 'right' });
    }

    /* ---------------- Tafel je Ansicht ---------------- */
    let chartRect: Rect | null = null;
    let schemeRows: { y: number; k: number }[] = [];
    let schemeBox: Rect | null = null;

    function panelDot(R: Rect, wide: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      const bottom = R.y + R.h;
      const a = effA('dot');
      const b = effB('dot');
      const res = p.show;
      const q = (s: string) => (res ? s : '?');
      const cn = CN();
      const d = dot(a, b);
      title(x0, R.y + 22, w, tt('Skalarprodukt', 'Dot product'), res ? `a · b = ${n1(d)}` : undefined, cn);
      let y = R.y + 66;
      const prod = contributions(a, b);
      drawToks([{ kind: 'col', v: [...a], color: CA() }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...b], color: CB() }, { kind: 'txt', s: '=' }, { kind: 'txt', s: res ? prod.map(par).join(' + ') : '?' }, { kind: 'txt', s: '=' }, { kind: 'txt', s: q(n1(d)), color: cn }], x0, y, w, wide ? 14 : 12.5);
      y += 44;
      // Summanden als Balken: Wer trägt wie viel bei?
      const pa = partsA.at(now);
      if (pa > 0.01 && res && (wide || R.h > 230)) {
        const rowH = 17;
        const h = (4 * rowH + 8) * pa;
        g.save();
        g.globalAlpha = pa;
        g.beginPath();
        g.rect(R.x, y - 8, R.w, h + 4);
        g.clip();
        const labW = 88;
        const bx = x0 + labW;
        const bw = w - labW - 34;
        const mid = bx + bw / 2;
        const mx = Math.max(1, ...prod.map(Math.abs), Math.abs(d));
        const sc = bw / 2 / mx;
        g.strokeStyle = alpha(theme.text, 0.25);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(mid, y - 6);
        g.lineTo(mid, y + 4 * rowH - 6);
        g.stroke();
        const bar = (i: number, v: number, label: string, color: string, bold = false) => {
          const yy = y + i * rowH;
          text(g, label, x0, yy, { font: font(bold ? 800 : 600, 11.5), color: bold ? theme.text : theme.muted, align: 'left' });
          const len = v * sc;
          roundRect(g, Math.min(mid, mid + len), yy - 5.5, Math.max(1.5, Math.abs(len)), 11, 3);
          g.fillStyle = color;
          g.fill();
          text(g, n1(v), bx + bw + 32, yy, { font: font(800, 11.5), color: bold ? cn : theme.text, align: 'right' });
        };
        const sub = ['₁', '₂', '₃'];
        prod.forEach((v, i) => bar(i, v, `a${sub[i]}b${sub[i]} = ${n1(a[i]!)} · ${par(b[i]!)}`, v >= 0 ? alpha(CP(), 0.8) : alpha(CM(), 0.8)));
        g.strokeStyle = alpha(theme.text, 0.2);
        g.beginPath();
        g.moveTo(x0, y + 3 * rowH - 9);
        g.lineTo(x0 + w, y + 3 * rowH - 9);
        g.stroke();
        bar(3, d, tt('Summe a · b', 'Sum a · b'), cn, true);
        g.restore();
        y += h;
      }
      const phi = angleDeg(a, b);
      const r = rows(x0, w, y + 4, bottom);
      const la = lenTxt(a);
      const lb = lenTxt(b);
      r.row('|a| · |b|', `${la.s} · ${lb.s} ${exactTo(norm(a) * norm(b)) ? '=' : '≈'} ${n1(norm(a) * norm(b))}`);
      r.row('cos φ = a·b / (|a|·|b|)', q(Number.isFinite(phi) ? fmt.num(Math.cos((phi * Math.PI) / 180), 3) : '–'));
      r.row(tt('Winkel φ', 'Angle φ'), q(Number.isFinite(phi) ? deg(phi) : tt('nicht definiert', 'undefined')), cn);
      if (p.proj) r.row(tt('Projektion a·b / |a|', 'Projection a·b / |a|'), q(n1(projLength(b, a))), CP());
      if (wide && r.y < bottom - 56) drawTip({ x: x0 - 4, y: r.y, w: w + 8, h: Math.min(110, bottom - r.y - 12) }, tipText('dot'));
    }

    function panelAngle(R: Rect, wide: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      const bottom = R.y + R.h;
      const a = effA('angle');
      const la = norm(a);
      const lb = angleLen();
      const phi = mode() === 'angle' ? phiG.at(now) : p.phi;
      const cn = CN();
      const cp = CP();
      title(x0, R.y + 22, w, tt('Winkel drehen', 'Rotate the angle'), `φ = ${fmt.num(Math.round(phi), 0)}°`, CB());
      // Verlauf von a · b und |a × b| über φ
      const chH = wide ? clamp(R.h * 0.36, 110, 170) : clamp(R.h - 150, 60, 90);
      const C0: Rect = { x: x0 + 26, y: R.y + 42, w: w - 34, h: chH };
      chartRect = { x: C0.x - 6, y: C0.y - 6, w: C0.w + 12, h: C0.h + 26 };
      const M = Math.max(1e-6, la * lb);
      const X = (f: number) => C0.x + (f / 180) * C0.w;
      const Y = (v: number) => C0.y + C0.h / 2 - (v / M) * (C0.h / 2 - 6);
      g.save();
      // Raster und Achsen
      g.strokeStyle = alpha(theme.text, 0.09);
      g.lineWidth = 1;
      for (const f of [45, 90, 135]) {
        g.beginPath();
        g.moveTo(X(f), C0.y);
        g.lineTo(X(f), C0.y + C0.h);
        g.stroke();
      }
      g.strokeStyle = alpha(theme.text, 0.35);
      g.beginPath();
      g.moveTo(C0.x, Y(0));
      g.lineTo(C0.x + C0.w, Y(0));
      g.moveTo(C0.x, C0.y);
      g.lineTo(C0.x, C0.y + C0.h);
      g.stroke();
      for (const f of [0, 45, 90, 135, 180]) text(g, `${f}°`, X(f), C0.y + C0.h + 10, { font: font(600, 10), color: theme.muted });
      text(g, n1(M), C0.x - 4, Y(M), { font: font(600, 10), color: theme.muted, align: 'right' });
      text(g, '0', C0.x - 4, Y(0), { font: font(600, 10), color: theme.muted, align: 'right' });
      text(g, n1(-M), C0.x - 4, Y(-M), { font: font(600, 10), color: theme.muted, align: 'right' });
      // Kurven
      const curve = (fn: (f: number) => number, color: string) => {
        g.strokeStyle = color;
        g.lineWidth = 2.4;
        g.beginPath();
        for (let f = 0; f <= 180; f += 2) {
          const xx = X(f);
          const yy = Y(fn(f));
          if (f === 0) g.moveTo(xx, yy);
          else g.lineTo(xx, yy);
        }
        g.stroke();
      };
      curve((f) => dotAndArea(la, lb, f).dot, cp);
      curve((f) => dotAndArea(la, lb, f).area, cn);
      // aktueller Winkel
      const cur = dotAndArea(la, lb, phi);
      g.strokeStyle = alpha(CB(), 0.7);
      g.lineWidth = 1.5;
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(X(phi), C0.y);
      g.lineTo(X(phi), C0.y + C0.h);
      g.stroke();
      g.setLineDash([]);
      for (const [v, c] of [
        [cur.dot, cp],
        [cur.area, cn],
      ] as const) {
        g.beginPath();
        g.arc(X(phi), Y(v), 5, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
        g.strokeStyle = cardBg();
        g.lineWidth = 1.5;
        g.stroke();
      }
      // Legende an den Kurven
      text(g, 'a · b', X(8), Y(dotAndArea(la, lb, 8).dot) + 12, { font: font(800, 11), color: cp, align: 'left' });
      text(g, '|a × b|', X(90), Y(M) - 9 < C0.y ? C0.y + 22 : Y(M) - 9, { font: font(800, 11), color: cn });
      // Griff zum Ziehen
      roundRect(g, X(phi) - 9, C0.y + C0.h + 2, 18, 6, 3);
      g.fillStyle = alpha(CB(), 0.6);
      g.fill();
      g.restore();
      const r = rows(x0, w, C0.y + C0.h + 34, bottom);
      const c = Math.cos((phi * Math.PI) / 180);
      const s = Math.sin((phi * Math.PI) / 180);
      r.row2('a · b = |a| · |b| · cos φ', `${n1(la)} · ${n1(lb)} · ${fmt.fixed(c, 3)} ≈ ${n1(cur.dot)}`, cp);
      r.row2('|a × b| = |a| · |b| · sin φ', `${n1(la)} · ${n1(lb)} · ${fmt.fixed(s, 3)} ≈ ${n1(cur.area)}`, cn);
      if (wide) r.row('b', vt(effB('angle', Math.round(phi))));
      if (wide && r.y < bottom - 56) drawTip({ x: x0 - 4, y: r.y, w: w + 8, h: Math.min(110, bottom - r.y - 12) }, tipText('angle'));
    }

    /** Schema „über Kreuz“ als Bild: a und b untereinander, die ersten Zeilen wiederholt. */
    function drawScheme(x: number, y: number, a: V3, b: V3, step: number, rowH: number): number {
      const g = surface.g;
      const theme = ctx.theme;
      const colW = 34;
      const xa = x + colW / 2 + 6;
      const xb = xa + colW + 8;
      const k = Math.min(2, Math.floor(step));
      const within = step - Math.floor(step);
      const active = step < 2.999;
      const hl = active ? k : -1;
      schemeRows = [];
      // Rahmen und Kopf
      text(g, 'a', xa, y, { font: mfont(13), color: CA() });
      text(g, 'b', xb, y, { font: mfont(13), color: CB() });
      const ry = (i: number) => y + 16 + i * rowH;
      for (let i = 0; i < 5; i++) {
        const idx = i % 3;
        const dim = i >= 3;
        const used = hl >= 0 && (i === hl + 1 || i === hl + 2);
        if (used) {
          roundRect(g, x + 2, ry(i) - rowH / 2 + 1, xb - x + colW / 2 + 4, rowH - 2, 5);
          g.fillStyle = alpha(CN(), theme.dark ? 0.2 : 0.1);
          g.fill();
        }
        text(g, n1(a[idx]!), xa, ry(i), { font: font(750, 12), color: dim ? alpha(CA(), 0.55) : CA() });
        text(g, n1(b[idx]!), xb, ry(i), { font: font(750, 12), color: dim ? alpha(CB(), 0.55) : CB() });
      }
      // Trennlinie unter Zeile 1 (wird „abgedeckt“) und zwischen 3 und 4
      g.strokeStyle = alpha(theme.text, 0.25);
      g.lineWidth = 1;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(x + 2, ry(2.5));
      g.lineTo(xb + colW / 2 + 6, ry(2.5));
      g.stroke();
      g.setLineDash([]);
      // Kreuz für die aktive Komponente
      if (hl >= 0) {
        const grow = reduced ? 1 : clamp(within * 2.2, 0, 1);
        const i1 = hl + 1;
        const i2 = hl + 2;
        const line = (fx: number, fy: number, tx: number, ty: number, color: string, dash: number[]) => {
          g.strokeStyle = color;
          g.lineWidth = 2;
          g.setLineDash(dash);
          g.beginPath();
          g.moveTo(fx, fy);
          g.lineTo(fx + (tx - fx) * grow, fy + (ty - fy) * grow);
          g.stroke();
          g.setLineDash([]);
        };
        line(xa + 10, ry(i1) + 2, xb - 10, ry(i2) - 2, CP(), []);
        line(xa + 10, ry(i2) - 2, xb - 10, ry(i1) + 2, CM(), [4, 3]);
      }
      return xb + colW / 2 + 12;
    }

    function panelCross(R: Rect, wide: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      const bottom = R.y + R.h;
      const a = effA('cross');
      const b = effB('cross');
      const res = p.show;
      const q = (s: string) => (res ? s : '?');
      const cn = CN();
      const n = cross(a, b);
      title(x0, R.y + 22, w, tt('Vektorprodukt', 'Cross product'), res ? `a × b = ${vt(n)}` : undefined, cn);
      let y = R.y + 48;
      if (p.scheme && res) {
        const step = mode() === 'cross' ? stepG.at(now) : 3;
        const rowH = wide ? 19 : 16;
        const xr = drawScheme(x0 - 4, y, a, b, step, rowH);
        // Komponenten rechts daneben
        const sch = crossScheme(a, b);
        schemeRows = [];
        schemeBox = { x: x0 - 6, y: y - 8, w: w + 12, h: 5 * rowH + 30 };
        const sub = ['₁', '₂', '₃'];
        const rw = x0 + w - xr;
        sch.forEach((s, k) => {
          const compH = (5 * rowH + 16) / 3;
          const yy = y + 4 + (k + 0.5) * compH;
          schemeRows.push({ y: yy, k });
          const vis = clamp(step - k, 0, 1);
          const isActive = step < 2.999 && Math.floor(step) === k;
          const f = font(isActive ? 800 : 650, 11.5);
          const label = `n${sub[k]} = ${n1(a[s.rows[0]]!)}·${par(b[s.rows[1]]!)} − ${n1(a[s.rows[1]]!)}·${par(b[s.rows[0]]!)}`;
          g.save();
          g.globalAlpha = 0.25 + 0.75 * vis;
          let size = 11.5;
          g.font = f;
          while (size > 8.5 && g.measureText(label).width > rw) {
            size -= 0.5;
            g.font = font(isActive ? 800 : 650, size);
          }
          text(g, label, xr, yy - 7, { font: font(isActive ? 800 : 650, size), color: isActive ? theme.text : theme.muted, align: 'left' });
          text(g, vis > 0.5 ? `= ${n1(s.plus)} − ${par(s.minus)} = ${n1(s.value)}` : '= ?', xr, yy + 8, { font: font(800, size), color: vis > 0.5 ? cn : theme.muted, align: 'left' });
          g.restore();
        });
        y += 16 + 5 * rowH + 6;
      } else {
        y += 22;
        const tcol = crossScheme(a, b).map((s) => `${n1(s.plus)} − ${par(s.minus)}`);
        drawToks([{ kind: 'col', v: [...a], color: CA() }, { kind: 'txt', s: '×' }, { kind: 'col', v: [...b], color: CB() }, { kind: 'txt', s: '=' }, { kind: 'col', v: res ? tcol : ['?', '?', '?'], color: theme.muted }, { kind: 'txt', s: '=' }, { kind: 'col', v: res ? [...n] : ['?', '?', '?'], color: cn }], x0, y, w, wide ? 13.5 : 12);
        y += 44;
        schemeBox = null;
      }
      const r = rows(x0, w, y, bottom);
      const sq = n[0] ** 2 + n[1] ** 2 + n[2] ** 2;
      r.row(tt('Fläche |a × b|', 'Area |a × b|'), q(norm(n) < 1e-9 ? '0' : Number.isInteger(Math.sqrt(sq)) ? n1(Math.sqrt(sq)) : `√${fmt.num(sq, 2)} ≈ ${n1(norm(n))}`), cn);
      r.row(tt('Dreieck ½ |a × b|', 'Triangle ½ |a × b|'), q(n1(norm(n) / 2)), CP());
      r.row(tt('Probe: (a × b) · a  und  · b', 'Check: (a × b) · a  and  · b'), q(`${n1(dot(n, a))} ${tt('und', 'and')} ${n1(dot(n, b))}`));
      if (wide && r.y < bottom - 56) drawTip({ x: x0 - 4, y: r.y, w: w + 8, h: Math.min(110, bottom - r.y - 12) }, tipText('cross'));
    }

    function panelSpat(R: Rect, wide: boolean): void {
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      const bottom = R.y + R.h;
      const a = effA('spat');
      const b = effB('spat');
      const c = effC('spat');
      const res = p.show;
      const q = (s: string) => (res ? s : '?');
      const cn = CN();
      const n = cross(a, b);
      const t3 = triple(a, b, c);
      title(x0, R.y + 22, w, tt('Spatprodukt', 'Triple product'), res ? `V = ${n1(Math.abs(t3))}` : undefined, cn);
      const y = R.y + 70;
      drawToks([{ kind: 'txt', s: '(' }, { kind: 'vec', s: 'a', color: CA() }, { kind: 'txt', s: '×' }, { kind: 'vec', s: 'b', color: CB() }, { kind: 'txt', s: ')·' }, { kind: 'vec', s: 'c', color: CC() }, { kind: 'txt', s: '=' }, { kind: 'col', v: res ? [...n] : ['?', '?', '?'], color: cn }, { kind: 'txt', s: '·' }, { kind: 'col', v: [...c], color: CC() }, { kind: 'txt', s: '=' }, { kind: 'txt', s: q(n1(t3)), color: cn }], x0, y, w, wide ? 13.5 : 12);
      const r = rows(x0, w, y + 46, bottom);
      const G0 = norm(n);
      const h = G0 > 1e-9 ? Math.abs(t3) / G0 : 0;
      r.row(tt('Grundfläche G = |a × b|', 'Base G = |a × b|'), q(n1(G0)), cn);
      r.row(tt('Höhe h = |(a × b)·c| / G', 'Height h = |(a × b)·c| / G'), q(G0 > 1e-9 ? n1(h) : '–'), CP());
      r.row(tt('Volumen V = G · h', 'Volume V = G · h'), q(`${n1(G0)} · ${n1(h)} = ${n1(spatVolume(a, b, c))}`), cn);
      r.row(tt('dreis. Pyramide V / 6', 'tetrahedron V / 6'), q(n1(pyramidVolume(a, b, c))), CP());
      const hd = handedness(a, b, c);
      r.row(tt('a, b, c bilden', 'a, b, c form'), q(hd === 'right' ? tt('Rechtssystem', 'right-handed system') : hd === 'left' ? tt('Linkssystem', 'left-handed system') : tt('keinen Spat (eben)', 'no solid (flat)')));
      if (wide && r.y < bottom - 56) drawTip({ x: x0 - 4, y: r.y, w: w + 8, h: Math.min(110, bottom - r.y - 12) }, tipText('spat'));
    }

    function panelFind(R: Rect, wide: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      const bottom = R.y + R.h;
      const id = task();
      const t = TASKS[id];
      const v = t.free === 'b' ? pb() : pc();
      const solved = taskSolved(id, v);
      title(x0, R.y + 22, w, tt('Entdecken', 'Discover'), loc(TASK_TEXT[id].short), CN());
      let y = R.y + 46;
      const f = font(600, 12);
      const lines = wrap(loc(TASK_TEXT[id]), w, f);
      lines.forEach((l, i) => text(g, l, x0, y + i * 16, { font: f, color: theme.text, align: 'left' }));
      y += lines.length * 16 + 6;
      // gegebene Vektoren
      const given = t.b ? `a = ${vt(t.a)},  b = ${vt(t.b)}` : `a = ${vt(t.a)}`;
      text(g, given, x0, y, { font: font(700, 11.5), color: theme.muted, align: 'left' });
      y += 24;
      // Anzeige „warm / kalt“
      const val = taskValue(id, v);
      const close = taskCloseness(id, v);
      const label = { perp: 'a · b', angle: 'φ', area: '|a × b|', vol: 'V', flat: '(a × b) · c' }[id];
      const shown = Number.isFinite(val) ? (id === 'angle' ? deg(val) : n1(val)) : '–';
      const goal = id === 'angle' ? `${t.target}°` : n1(t.target);
      text(g, `${label} = ${shown}`, x0, y, { font: font(800, 13), color: solved ? theme.series[2]! : theme.text, align: 'left' });
      text(g, `${tt('Ziel', 'goal')}: ${goal}`, x0 + w, y, { font: font(700, 12), color: theme.muted, align: 'right' });
      y += 14;
      const mw = w;
      const mh = 10;
      const grad = g.createLinearGradient(x0, 0, x0 + mw, 0);
      grad.addColorStop(0, theme.series[2]!);
      grad.addColorStop(0.5, mixColor(theme.series[2]!, theme.series[1]!, 0.5));
      grad.addColorStop(1, theme.series[1]!);
      g.save();
      roundRect(g, x0, y, mw, mh, 5);
      g.fillStyle = grad;
      g.globalAlpha = 0.35;
      g.fill();
      g.globalAlpha = 1;
      const mx = x0 + close * mw;
      g.beginPath();
      g.arc(clamp(mx, x0 + 6, x0 + mw - 6), y + mh / 2, 7, 0, Math.PI * 2);
      g.fillStyle = solved ? theme.series[2]! : theme.text;
      g.fill();
      g.strokeStyle = cardBg();
      g.lineWidth = 2;
      g.stroke();
      g.restore();
      text(g, tt('getroffen', 'hit'), x0, y + mh + 10, { font: font(600, 10), color: theme.muted, align: 'left' });
      text(g, tt('weit weg', 'far away'), x0 + mw, y + mh + 10, { font: font(600, 10), color: theme.muted, align: 'right' });
      y += mh + 30;
      // Fortschritt
      text(g, tt('Gefunden:', 'Found:'), x0, y, { font: font(700, 12), color: theme.muted, align: 'left' });
      for (let i = 0; i < 3; i++) {
        const cx = x0 + 78 + i * 22;
        g.beginPath();
        g.arc(cx, y, 7, 0, Math.PI * 2);
        if (i < found.length) {
          const pop = i === found.length - 1 && !reduced ? 1 + 0.5 * clamp(1 - (now - hitAt) / 400, 0, 1) : 1;
          g.beginPath();
          g.arc(cx, y, 7 * pop, 0, Math.PI * 2);
          g.fillStyle = theme.series[2]!;
          g.fill();
        } else {
          g.strokeStyle = alpha(theme.text, 0.3);
          g.lineWidth = 1.5;
          g.stroke();
        }
      }
      y += 22;
      const r = rows(x0, w, y, bottom);
      found.forEach((q, i) => r.row(`${i + 1}. ${t.free} =`, vt(q), theme.series[2]!));
      const sh = shapeA.at(now);
      if (sh > 0.01 && r.y < bottom - 40) {
        g.save();
        g.globalAlpha = sh;
        drawTip({ x: x0 - 4, y: r.y, w: w + 8, h: Math.min(wide ? 96 : 60, bottom - r.y - 8) }, loc(TASK_SHAPE[id]));
        g.restore();
      } else if (wide && found.length < 3 && r.y < bottom - 56) {
        drawTip({ x: x0 - 4, y: r.y, w: w + 8, h: Math.min(96, bottom - r.y - 12) }, tipText('find'));
      }
    }

    function tipText(m: Mode): string {
      const a = effA(m);
      const b = effB(m);
      switch (m) {
        case 'dot': {
          const d = dot(a, b);
          if (norm(a) < 1e-9 || norm(b) < 1e-9) return tt('Ein Nullvektor hat keine Richtung – der Winkel ist nicht definiert.', 'A zero vector has no direction – the angle is undefined.');
          if (Math.abs(d) < 1e-9) return tt('a · b = 0: Die Vektoren stehen senkrecht aufeinander, die Projektion ist nur ein Punkt.', 'a · b = 0: the vectors are perpendicular; the projection is just a point.');
          return d > 0 ? tt('a · b > 0: spitzer Winkel. Die Projektion von b zeigt in Richtung von a.', 'a · b > 0: acute angle. The projection of b points along a.') : tt('a · b < 0: stumpfer Winkel. Die Projektion von b zeigt gegen a.', 'a · b < 0: obtuse angle. The projection of b points against a.');
        }
        case 'angle':
          return tt('Ziehe die Spitze von b oder im Diagramm. Wo ist a · b null, wo ist die Fläche am größten? Bei welchen Winkeln sind beide gleich groß?', 'Drag the tip of b or in the chart. Where is a · b zero, where is the area largest? At which angles are both equal?');
        case 'cross':
          return tt('a × b steht senkrecht auf a und b (Rechte-Hand-Regel: Daumen a, Zeigefinger b, Mittelfinger a × b). Seine Länge ist die Fläche des Parallelogramms. Tausche a und b: Der Pfeil kippt um.', 'a × b is perpendicular to a and b (right-hand rule: thumb a, index finger b, middle finger a × b). Its length is the area of the parallelogram. Swap a and b: the arrow flips.');
        case 'spat':
          return tt('Grundfläche |a × b| mal Höhe (Projektion von c auf a × b) ergibt das Volumen. Schalte „gerade scheren“ ein: Der Spat wird zum geraden Prisma – gleiches Volumen.', 'Base |a × b| times height (projection of c onto a × b) gives the volume. Turn on “shear upright”: the solid becomes a right prism – same volume.');
        case 'find':
          return tt('Ziehe die Spitze des gesuchten Vektors oder nutze die Regler. Nach drei Lösungen zeigt sich, wo alle Lösungen liegen.', 'Drag the tip of the vector you are looking for or use the sliders. After three solutions you see where all solutions lie.');
      }
    }

    function drawPanelFor(m: Mode, R: Rect, wide: boolean): void {
      switch (m) {
        case 'dot':
          return panelDot(R, wide);
        case 'angle':
          return panelAngle(R, wide);
        case 'cross':
          return panelCross(R, wide);
        case 'spat':
          return panelSpat(R, wide);
        case 'find':
          return panelFind(R, wide);
      }
    }

    function drawPanel(): void {
      const { panel: R, wide } = regions();
      const g = surface.g;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 14);
      g.clip();
      const u = reduced ? 1 : clamp((now - modeT0) / MODE_MS, 0, 1);
      chartRect = null;
      if (u < 1 && prevMode !== curMode) {
        g.save();
        g.globalAlpha = 1 - ease.inOutCubic(u);
        g.translate(0, -8 * u);
        drawPanelFor(prevMode, R, wide);
        g.restore();
        chartRect = null;
      }
      g.save();
      g.globalAlpha = ease.inOutCubic(u);
      g.translate(0, 8 * (1 - ease.outCubic(u)));
      drawPanelFor(curMode, R, wide);
      g.restore();
      g.restore();
    }

    /* ---------------- Zeiger in der Tafel: Diagramm und Schema ---------------- */
    let chartDrag = false;
    function phiFromChart(px: number): void {
      const C0 = chartRect;
      if (!C0 || ctx.locked) return;
      const x = clamp((px - (C0.x + 6)) / (C0.w - 12), 0, 1);
      const phi = Math.round(x * 180);
      lastDrag = performance.now();
      if (phi !== p.phi) ctx.set({ phi });
    }
    const inRect = (r: Rect | null, px: number, py: number) => !!r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    surface.addTarget({
      contains: (px, py) => (mode() === 'angle' && inRect(chartRect, px, py)) || (mode() === 'cross' && p.scheme && inRect(schemeBox, px, py)),
      pointerDown: (pt) => {
        if (mode() === 'angle' && inRect(chartRect, pt.px, pt.py)) {
          if (sweeping) return true;
          chartDrag = true;
          phiFromChart(pt.px);
          return true;
        }
        if (mode() === 'cross' && inRect(schemeBox, pt.px, pt.py)) {
          let best = schemeRows[0];
          for (const r of schemeRows) if (best && Math.abs(r.y - pt.py) < Math.abs(best.y - pt.py)) best = r;
          if (best) {
            autoStep = false;
            stepG.go(best.k + 0.6, 450);
            updateReadouts();
            ctx.requestRender();
          }
          return true;
        }
        return false;
      },
      pointerMove: (pt) => {
        if (chartDrag) phiFromChart(pt.px);
      },
      pointerUp: () => {
        chartDrag = false;
      },
      hover: (pt) => {
        surface.setCursor(pt ? (mode() === 'angle' ? 'ew-resize' : 'pointer') : '');
      },
      wheel: () => false,
    });

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const a = tA();
      const b = tB();
      switch (mode()) {
        case 'dot': {
          const phi = angleDeg(a, b);
          const la = lenTxt(a);
          const lb = lenTxt(b);
          const cosPhi = dot(a, b) / (norm(a) * norm(b));
          ctx.readout('calc', `a · b = ${a.map((v, i) => `${n1(v)} · ${par(b[i]!)}`).join(' + ')} = ${n1(dot(a, b))}`);
          ctx.readout('geo', Number.isFinite(phi) ? `cos φ ${la.exact && lb.exact && exactTo(dot(a, b)) ? '=' : '≈'} ${n1(dot(a, b))} / (${la.s} · ${lb.s}) ${exactTo(cosPhi, 3) ? '=' : '≈'} ${fmt.num(cosPhi, 3)}, φ ${exactTo(phi, 1) ? '=' : '≈'} ${deg(phi)}` : tt('Winkel nicht definiert (Nullvektor)', 'Angle undefined (zero vector)'));
          ctx.readout('info', specialNote()?.text ?? null);
          break;
        }
        case 'angle': {
          const r = dotAndArea(norm(a), angleLen(), p.phi);
          ctx.readout('calc', `b ≈ ${vt(b)};  a · b ≈ ${n1(r.dot)};  |a × b| ≈ ${n1(r.area)}`);
          ctx.readout('geo', `φ = ${p.phi}°;  cos φ ≈ ${fmt.num(Math.cos((p.phi * Math.PI) / 180), 3)};  sin φ ≈ ${fmt.num(Math.sin((p.phi * Math.PI) / 180), 3)}`);
          ctx.readout('info', specialNote()?.text ?? null);
          break;
        }
        case 'cross': {
          const n = cross(a, b);
          ctx.readout('calc', `a × b = ${vt(n)}`);
          ctx.readout('geo', `${tt('Parallelogramm', 'Parallelogram')} ≈ ${n1(norm(n))};  ${tt('Dreieck', 'triangle')} ≈ ${n1(norm(n) / 2)}`);
          ctx.readout('info', specialNote()?.text ?? null);
          break;
        }
        case 'spat': {
          const c = tC();
          ctx.readout('calc', `(a × b) · c = ${vt(cross(a, b))} · ${vt(c)} = ${n1(triple(a, b, c))}`);
          ctx.readout('geo', `V ${tt('Spat', 'parallelepiped')} = ${n1(spatVolume(a, b, c))};  V ${tt('dreiseitige Pyramide', 'tetrahedron')} = ${n1(pyramidVolume(a, b, c))}`);
          ctx.readout('info', specialNote()?.text ?? null);
          break;
        }
        case 'find': {
          const t = TASKS[task()];
          const v = t.free === 'b' ? pb() : pc();
          const val = taskValue(task(), v);
          ctx.readout('calc', `${t.free} = ${vt(v)};  ${tt('Wert', 'value')} ${Number.isFinite(val) ? n1(val) : '–'};  ${tt('Ziel', 'goal')} ${n1(t.target)}`);
          ctx.readout('geo', `${tt('Gefunden', 'Found')}: ${found.length} / 3${found.length ? ` – ${found.map(vt).join(', ')}` : ''}`);
          ctx.readout('info', found.length >= 3 || hintShown ? loc(TASK_SHAPE[task()]) : (specialNote()?.text ?? null));
          break;
        }
      }
    }

    function updateActions(): void {
      ctx.setAction('next', { enabled: !ctx.locked && p.show });
      ctx.setAction('swap', { enabled: !ctx.locked });
      ctx.setAction('rand', { enabled: !ctx.locked });
      ctx.setAction('sweep', { enabled: !ctx.locked && !sweeping && norm(tA()) > 1e-9 });
      ctx.setAction('hint', { enabled: !hintShown && found.length < 3 });
      ctx.setAction('clear', { enabled: !ctx.locked && (found.length > 0 || hintShown) });
    }

    /** Kamera sanft so drehen, dass die Ebene aus a und b gut sichtbar ist. */
    function lookAtPlane(instant = false): void {
      const a = tA();
      if (norm(a) < 1e-9) return;
      let nrm = cross(unit(a), perpUnit(a, pb())) as Vec3;
      if (nrm[2] < 0) nrm = vec3.scale(nrm, -1);
      const az0 = (28 * Math.PI) / 180;
      const el0 = (20 * Math.PI) / 180;
      const def: Vec3 = [Math.cos(el0) * Math.cos(az0), Math.cos(el0) * Math.sin(az0), Math.sin(el0)];
      // nicht ganz frontal, damit die Achsen räumlich bleiben
      const dir = vec3.normalize(vec3.add(vec3.scale(nrm, 0.72), vec3.scale(def, 0.28)));
      const az = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
      const el = clamp((Math.asin(clamp(dir[2], -1, 1)) * 180) / Math.PI, -10, 70);
      if (instant) view.setCamera({ azimuth: az, elevation: el });
      else view.animateTo({ azimuth: az, elevation: el }, reduced ? 1 : 1100);
    }

    function resetTask(setStart: boolean): void {
      found = [];
      hintShown = false;
      hitAt = dupAt = -1e9;
      if (setStart) {
        const t = TASKS[task()];
        const s = t.start;
        if (t.free === 'b') ctx.set({ b1: s[0], b2: s[1], b3: s[2] });
        else ctx.set({ c1: s[0], c2: s[1], c3: s[2] });
      }
    }

    function checkFound(changed: ReadonlySet<string>): void {
      const t = TASKS[task()];
      const keys = t.free === 'b' ? ['b1', 'b2', 'b3'] : ['c1', 'c2', 'c3'];
      if (!keys.some((k) => changed.has(k))) return;
      const v = t.free === 'b' ? pb() : pc();
      if (!taskSolved(task(), v)) return;
      if (hasSolution(found, v)) {
        dupAt = now;
        return;
      }
      if (found.length >= 3) return;
      found = [...found, [...v] as V3];
      hitAt = now;
    }

    retarget(true);
    updateReadouts();
    updateActions();
    if (mode() === 'angle') lookAtPlane(true);
    // Liegt der Startvektor eines geteilten Links schon auf einer Lösung, zählt er als erster Fund.
    if (mode() === 'find') {
      checkFound(new Set(['b1', 'b2', 'b3', 'c1', 'c2', 'c3']));
      retarget(true);
      updateReadouts();
      updateActions();
    }

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('mode') && source !== 'init') {
          animStart = reduced ? now - 1e6 : now + 80;
          prevMode = curMode;
          curMode = mode();
          modeT0 = now;
          if (source === 'input' && mode() === 'angle') {
            const phi = angleDeg(pa(), pb());
            if (Number.isFinite(phi)) ctx.set({ phi: Math.round(phi) });
          }
          if (mode() === 'angle') lookAtPlane();
          else if (prevMode === 'angle') view.resetView(true);
          if (mode() === 'cross') {
            stepG.snap(p.scheme && !reduced ? 0 : 3);
            autoStep = p.scheme && !reduced;
            lastStepAt = now + 500;
          }
          if (mode() === 'find') resetTask(source === 'input');
        }
        if (changed.has('task') && source !== 'init' && !changed.has('mode')) {
          resetTask(source === 'input');
          animStart = reduced ? now - 1e6 : now;
        }
        if (changed.has('scheme')) {
          stepG.snap(p.scheme && !reduced ? 0 : 3);
          autoStep = p.scheme && !reduced;
          lastStepAt = now;
        }
        // Ziehen im Vektorprodukt: Rechnung sofort vollständig zeigen
        if (mode() === 'cross' && source === 'input' && ['a1', 'a2', 'a3', 'b1', 'b2', 'b3'].some((k) => changed.has(k))) {
          autoStep = false;
          stepG.snap(3);
        }
        if (mode() === 'find' && source !== 'init') checkFound(changed);
        retarget(source === 'init');
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'play') {
          animStart = reduced ? now - 1e6 : now;
          if (mode() === 'cross' && p.scheme) {
            stepG.snap(reduced ? 3 : 0);
            autoStep = !reduced;
            lastStepAt = now + 600;
          }
        } else if (id === 'next') {
          autoStep = false;
          const tg = stepG.target;
          if (tg >= 3) stepG.snap(0);
          stepG.go(tg >= 3 ? 0.6 : Math.min(3, Math.floor(tg) + 1 + (Math.floor(tg) + 1 < 3 ? 0.6 : 0)), 600);
        } else if (id === 'swap' && !ctx.locked) {
          ctx.set({ a1: p.b1, a2: p.b2, a3: p.b3, b1: p.a1, b2: p.a2, b3: p.a3 });
          animStart = reduced ? now - 1e6 : now - ANIM_MS * 0.5;
        } else if (id === 'sweep' && !ctx.locked) {
          sweeping = !reduced;
          phiG.snap(0);
          phiG.go(180, 4200);
          ctx.set({ phi: 180 });
        } else if (id === 'rand' && !ctx.locked) {
          const r = () => Math.round(Math.random() * 8 - 4);
          let a: V3 = [r(), r(), r()];
          let b: V3 = [r(), r(), r()];
          for (let k = 0; k < 20 && (norm(a) < 1 || norm(b) < 1 || norm(cross(a, b)) < 1e-9); k++) {
            a = [r(), r(), r()];
            b = [r(), r(), r()];
          }
          const vals: Record<string, number> = { a1: a[0], a2: a[1], a3: a[2], b1: b[0], b2: b[1], b3: b[2] };
          if (mode() === 'spat') {
            let c: V3 = [r(), r(), r()];
            for (let k = 0; k < 20 && Math.abs(triple(a, b, c)) < 1e-9; k++) c = [r(), r(), r()];
            Object.assign(vals, { c1: c[0], c2: c[1], c3: c[2] });
          }
          ctx.set(vals as never);
          animStart = reduced ? now - 1e6 : now;
          if (mode() === 'cross' && p.scheme) {
            stepG.snap(reduced ? 3 : 0);
            autoStep = !reduced;
            lastStepAt = now + 600;
          }
        } else if (id === 'hint') {
          hintShown = true;
          retarget();
        } else if (id === 'clear' && !ctx.locked) {
          resetTask(true);
          retarget();
        }
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },
      resetView: () => (mode() === 'angle' ? lookAtPlane() : view.resetView(true)),
      render() {
        now = performance.now();
        if (sweeping && !phiG.busy(now)) {
          sweeping = false;
          updateActions();
        }
        if (autoStep && mode() === 'cross' && !stepG.busy(now) && now > lastStepAt) {
          const tg = stepG.target;
          if (tg >= 3) autoStep = false;
          else {
            stepG.go(Math.floor(tg) + 1, 700);
            lastStepAt = now + 700 + 520;
          }
        }
        surface.begin();
        view.resize();
        drawScene();
        drawPanel();
        const glides = [...ga, ...gb, ...gc, phiG, projA, partsA, triA, pyrA, cavG, shapeA, extent, stepG];
        const busy = glides.some((x) => x.busy(now)) || animating() || autoStep || sweeping || (!reduced && (now - introStart < 900 || now - modeT0 < MODE_MS + 700 || now - hitAt < 1000 || now - dupAt < 1600));
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
