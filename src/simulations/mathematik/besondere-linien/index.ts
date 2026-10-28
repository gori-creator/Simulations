import { defineSimulation, drawArrowHead, ease, mixColor, prefersReducedMotion, roundRect, scaledSprite, Surface, withAlpha, type KeyTarget, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  altitudeFeet,
  altitudes,
  angleBisectorArcs,
  angles,
  area,
  area2,
  bisectorArcs,
  bisectorFoot,
  centroid,
  circumcenter,
  circumradius,
  dist,
  euler,
  incenter,
  inradius,
  isEquilateral,
  isoscelesApex,
  kind,
  largestAngle,
  medianParts,
  midpoints,
  onSegment,
  orthocenter,
  others,
  sides,
  tipping,
  touchPoints,
  whereIs,
  type Idx,
  type Kind,
  type Pt,
  type Tri,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Px = [number, number];
type Mode = 'ms' | 'wh' | 'sh' | 'h' | 'eu';
/** Linienart (Familie aus drei Linien). */
type Fam = 'ms' | 'wh' | 'sh' | 'h';
/** Die vier besonderen Punkte. */
type PKey = 'U' | 'W' | 'S' | 'H';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpP = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const TAU = Math.PI * 2;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
const W_MAX = 16;
const H_MAX = 12;
const SUB = ['a', 'b', 'c'] as const;
const GREEK = ['α', 'β', 'γ'] as const;
const VN = ['A', 'B', 'C'] as const;
const IDX: Idx[] = [0, 1, 2];
const FAM_POINT: Record<Fam, PKey> = { ms: 'U', wh: 'W', sh: 'S', h: 'H' };
const POINT_FAM: Record<PKey, Fam> = { U: 'ms', W: 'wh', S: 'sh', H: 'h' };
/** Reihenfolge beim Konstruieren: zuerst die Linie zur Grundseite c = [AB] bzw. von A aus. */
const ORDER: Record<Fam, Idx[]> = { ms: [2, 0, 1], wh: [0, 1, 2], sh: [0, 1, 2], h: [2, 0, 1] };
const lineName = (f: Fam, i: Idx) => (f === 'ms' ? `m_${SUB[i]}` : f === 'wh' ? `w_${GREEK[i]}` : f === 'sh' ? `s_${SUB[i]}` : `h_${SUB[i]}`);

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    this.tw = null;
    this.goal = goal;
    this.tau = tau;
  }
  glide(goal: number, dur: number, now: number): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now, dur: Math.max(1, dur) };
  }
  get busy(): boolean {
    return this.tw !== null || this.v !== this.goal;
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, ease.inOutCubic(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return true;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-4 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/* ------------------------------------------------------------------ */
/* Konstruktion: Ablauf aus Schritten mit einzelnen Teilbewegungen     */
/* ------------------------------------------------------------------ */

interface Compass {
  pin: Pt;
  ang: number;
  r: number;
  alpha: number;
  bend: number;
}
/** Geodreieck: Nullpunkt im Lotfußpunkt f, lange Seite entlang u (zur Ecke), Mittellinie entlang w (auf der Seite). */
interface GeoT {
  f: Pt;
  u: Pt;
  w: Pt;
  reach: number;
  alpha: number;
  slide: number;
}
interface Ruler {
  a: Pt;
  b: Pt;
  alpha: number;
  slide: number;
}
type Trio = [number, number, number];
interface CState {
  lines: Record<Fam, Trio>;
  ext: Trio;
  aux: Record<Fam, Trio>;
  arcs: { c: Pt; r: number; a0: number; a1: number }[];
  marks: { p: Pt; pop: number; label: string }[];
  pts: Record<PKey, number>;
  circle: number;
  lote: number;
  ratio: number;
  euler: number;
  radius: { c: Pt; ang: number; r: number; alpha: number; label: string } | null;
  note: { p: Pt; src: string; alpha: number } | null;
  ruler: Ruler | null;
  pencil: { tip: Pt | null; alpha: number };
  compass: Compass | null;
  geo: GeoT | null;
}
interface Op {
  dur: number;
  apply(s: CState, t: number): void;
}
interface Step {
  src: string;
  ops: Op[];
  tool?: 'compass' | 'geo' | 'ruler';
}
const trio = (): Trio => [0, 0, 0];
const emptyState = (): CState => ({
  lines: { ms: trio(), wh: trio(), sh: trio(), h: trio() },
  ext: trio(),
  aux: { ms: trio(), wh: trio(), sh: trio(), h: trio() },
  arcs: [],
  marks: [],
  pts: { U: 0, W: 0, S: 0, H: 0 },
  circle: 0,
  lote: 0,
  ratio: 0,
  euler: 0,
  radius: null,
  note: null,
  ruler: null,
  pencil: { tip: null, alpha: 0 },
  compass: null,
  geo: null,
});

/** Geometrie des angezeigten Dreiecks (einmal pro Änderung berechnet). */
interface Geom {
  t: Tri;
  deg: boolean;
  size: number;
  sides: [number, number, number];
  ang: [number, number, number];
  area: number;
  kd: Kind;
  big: Idx;
  eq: boolean;
  iso: Idx | null;
  U: Pt | null;
  R: number;
  W: Pt;
  rho: number;
  S: Pt;
  H: Pt | null;
  mids: [Pt, Pt, Pt];
  feet: [Pt, Pt, Pt];
  onSeg: [boolean, boolean, boolean];
  bfeet: [Pt, Pt, Pt];
  touch: [Pt, Pt, Pt];
}

type HitId = 'v0' | 'v1' | 'v2' | 'next' | 'restart' | 'card';

/**
 * Besondere Linien im Dreieck: Mittelsenkrechten mit Umkreis, Winkelhalbierende
 * mit Inkreis, Seitenhalbierende mit Schwerpunkt, Höhen mit Höhenschnittpunkt und
 * die Euler-Gerade. Auf Karopapier entstehen die drei Linien nacheinander mit
 * gezeichneten Werkzeugen (Zirkelbögen, Lineal, Geodreieck); dann leuchtet der
 * gemeinsame Schnittpunkt auf und der Zirkel zieht Um- bzw. Inkreis. Daneben die
 * Konstruktionsbeschreibung wie im Heft, eine Begründungskarte (Ortslinie gleicher
 * Abstände, Teilung 2 : 1, Euler-Gerade) und „Wo liegt der Punkt?“. Sonderfälle
 * (stumpf-, rechtwinklig, gleichseitig, gleichschenklig) sind gestaltet; im Modus
 * Seitenhalbierende lässt sich das Dreieck als Pappe auf einer Nadel balancieren.
 */
export default defineSimulation({
  id: 'besondere-linien',
  dragHint: true,
  layout: { aspect: 1.42, aspectNarrow: 0.4 },
  groups: [
    { id: 'pts', label: L('Ecken (in cm)', 'Vertices (in cm)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'm',
      type: 'choice',
      label: L('Linien', 'Lines'),
      options: [
        { value: 'ms', label: L('Mittelsenkrechten → Umkreis', 'Perpendicular bisectors → circumcircle') },
        { value: 'wh', label: L('Winkelhalbierende → Inkreis', 'Angle bisectors → incircle') },
        { value: 'sh', label: L('Seitenhalbierende → Schwerpunkt', 'Medians → centroid') },
        { value: 'h', label: L('Höhen → Höhenschnittpunkt', 'Altitudes → orthocentre') },
        { value: 'eu', label: L('Alle Punkte und Euler-Gerade', 'All points and the Euler line') },
      ],
      default: 'ms',
    },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: x', 'A: x'), min: 0.5, max: W_MAX - 0.5, step: 0.1, default: 3, unit: 'cm', help: L('Die Ecken lassen sich auch in der Zeichnung ziehen (sie rasten auf halbe Zentimeter ein).', 'You can also drag the vertices in the drawing (they snap to half centimetres).') },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: y', 'A: y'), min: 0.5, max: H_MAX - 0.5, step: 0.1, default: 2, unit: 'cm' },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: x', 'B: x'), min: 0.5, max: W_MAX - 0.5, step: 0.1, default: 12.5, unit: 'cm' },
    { key: 'by', type: 'number', group: 'pts', label: L('B: y', 'B: y'), min: 0.5, max: H_MAX - 0.5, step: 0.1, default: 2.5, unit: 'cm' },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: x', 'C: x'), min: 0.5, max: W_MAX - 0.5, step: 0.1, default: 7, unit: 'cm' },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: y', 'C: y'), min: 0.5, max: H_MAX - 0.5, step: 0.1, default: 9.5, unit: 'cm' },
    {
      key: 'pt',
      type: 'boolean',
      group: 'view',
      label: L('Schnittpunkt und Kreis zeigen', 'Show the point and the circle'),
      help: L('Aus: Die Linien selbst untersuchen – schneiden sie sich in einem Punkt? Punkt, Kreis und Messwerte bleiben verdeckt.', 'Off: explore the lines yourself – do they meet in one point? Point, circle and measurements stay hidden.'),
      default: true,
    },
    { key: 'aux', type: 'boolean', group: 'view', label: L('Konstruktionsspuren, Maße und rechte Winkel', 'Construction marks, measures and right angles'), default: true },
  ],
  images: { compass: 'zirkel-teile.webp', pencil: 'bleistift.webp' },
  actions: [
    { id: 'play', label: L('Konstruieren', 'Construct'), primary: true },
    { id: 'next', label: L('Nächster Schritt', 'Next step') },
    { id: 'restart', label: L('Von vorn', 'Start again') },
    { id: 'tilt', label: L('Auf der Nadel balancieren', 'Balance on a pin'), visibleIf: (v) => v.m === 'sh' },
  ],
  readouts: [
    { key: 'kind', label: L('Dreieck', 'Triangle') },
    { key: 'pt', label: L('Schnittpunkt', 'Point'), spoiler: true },
    { key: 'prop', label: L('Eigenschaft', 'Property'), spoiler: true },
    { key: 'step', label: L('Konstruktion', 'Construction') },
  ],
  presets: [
    { id: 'start', label: L('Spitzwinklig: Umkreis', 'Acute: circumcircle'), values: {} },
    { id: 'inkreis', label: L('Inkreis berührt die Seiten', 'Incircle touches the sides'), values: { m: 'wh', ax: 2.5, ay: 1.5, bx: 13.5, by: 2, cx: 8.5, cy: 9 } },
    { id: 'schwer', label: L('Schwerpunkt: Pappe balancieren', 'Centroid: balance the card'), values: { m: 'sh', ax: 2, ay: 1.5, bx: 14, by: 3, cx: 6, cy: 9 } },
    { id: 'stumpf', label: L('Stumpfwinklig: Höhen außen', 'Obtuse: altitudes outside'), values: { m: 'h', ax: 2, ay: 2, bx: 12, by: 2, cx: 4.5, cy: 4.5 } },
    { id: 'recht', label: L('Rechtwinklig: Thaleskreis', 'Right angle: Thales circle'), values: { m: 'ms', ax: 3, ay: 2, bx: 11, by: 2, cx: 3, cy: 8 } },
    { id: 'euler', label: L('Euler-Gerade', 'Euler line'), values: { m: 'eu', ax: 2, ay: 2, bx: 13, by: 2, cx: 4, cy: 9 } },
  ],
  strings: {
    de: {
      canvas:
        'Karopapier mit einem Dreieck ABC, dessen Ecken man ziehen kann. Mit Zirkel, Lineal und Geodreieck entstehen nacheinander die drei Mittelsenkrechten, Winkelhalbierenden, Seitenhalbierenden oder Höhen; ihr gemeinsamer Schnittpunkt leuchtet auf, dazu Umkreis bzw. Inkreis oder die Euler-Gerade. Daneben die Konstruktionsbeschreibung, eine Begründung mit Maßen und die Frage, wo der Punkt liegt.',
    },
    en: {
      canvas:
        'Squared paper with a triangle ABC whose vertices can be dragged. Compasses, ruler and set square draw the three perpendicular bisectors, angle bisectors, medians or altitudes one after another; their common point lights up, together with the circumcircle or incircle or the Euler line. Beside it the construction steps, a reasoning card with measurements and the question where the point lies.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = prefersReducedMotion();
    const lang = ctx.lang as 'de' | 'en';
    const say = (s: Txt) => s[lang];
    const de = lang === 'de';
    const mode = () => p.m as Mode;
    const PN: Record<PKey, string> = { U: 'U', W: de ? 'W' : 'I', S: 'S', H: 'H' };

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560 || (isWide() && surface.width < 700);
    const fs = (big: number, small: number) => (sm() ? small : big);
    const INSET_H = 122;
    /** Breit: Papier links, Karten rechts, „Wo liegt …?“ als Zettel oben links auf dem Papier. Schmal: untereinander. */
    function regions(): { paper: Rect; col: Rect; wide: boolean; inset: Rect | null } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.36, 232, 336));
        const paper = { x: 1, y: 1, w: w - cw - 12, h: h - 2 };
        const iw = Math.round(clamp(paper.w * 0.36, 176, 236));
        return { paper, col: { x: w - cw, y: 0, w: cw, h }, wide: true, inset: { x: paper.x + 10, y: paper.y + 10, w: iw, h: INSET_H } };
      }
      const ph = Math.round(clamp(h * 0.46, 250, w * 1.05));
      return { paper: { x: 1, y: 1, w: w - 2, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false, inset: null };
    }

    /* ---------- Farben (gleiche Linienart = gleiche Farbe in Bild, Karten und Text) ---------- */
    const col = {
      ms: () => th().series[4]!,
      wh: () => th().series[5]!,
      sh: () => th().series[3]!,
      h: () => th().series[2]!,
      eu: () => th().series[1]!,
      vert: () => th().series[0]!,
      ok: () => th().series[2]!,
      bad: () => th().series[1]!,
      pencil: () => (th().dark ? '#c5ccd6' : '#3a414d'),
    };
    const famCol = (f: Fam | 'eu') => col[f]();
    const pkCol = (k: PKey) => famCol(POINT_FAM[k]);
    const modeCol = () => famCol(mode());
    const onColor = () => (th().dark ? '#10161f' : '#ffffff');
    const palette = (): Record<string, string> => ({ ms: col.ms(), wh: col.wh(), sh: col.sh(), h: col.h(), eu: col.eu(), ok: col.ok(), bad: col.bad(), v: col.vert(), m: th().muted });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const C = (key: string, s: string) => `\\c{${key}}{${s}}`;
    const PT = (k: PKey) => C(POINT_FAM[k], PN[k]);
    const LN = (f: Fam, i: Idx) => C(f, lineName(f, i));

    /* ---------- Zahlen ---------- */
    const cm = (v: number, d = 1) => `${fmt.num(v, d)} cm`;
    const dg1 = (v: number) => `${fmt.num(v, 1)}°`;
    const ptTxt = (q: Pt) => fmt.point(Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100, 2);

    /* ---------- angezeigter Zustand (gleitet weich zu den Reglerwerten) ---------- */
    const VXs = [new Chan(p.ax), new Chan(p.bx), new Chan(p.cx)];
    const VYs = [new Chan(p.ay), new Chan(p.by), new Chan(p.cy)];
    const vchans = [...VXs, ...VYs];
    const VX = new Chan(8);
    const VY = new Chan(6);
    const VS = new Chan(36);
    const disp = (): Tri => [
      [VXs[0]!.v, VYs[0]!.v],
      [VXs[1]!.v, VYs[1]!.v],
      [VXs[2]!.v, VYs[2]!.v],
    ];
    const target = (): Tri => [
      [p.ax, p.ay],
      [p.bx, p.by],
      [p.cx, p.cy],
    ];

    let gCache: { key: string; g: Geom } | null = null;
    function geomOf(t: Tri): Geom {
      const sd = sides(t);
      const size = Math.max(...sd, 1e-6);
      const isDeg = Math.abs(area2(t)) < 0.004 * size * size || Math.min(...sd) < 0.05;
      const U = isDeg ? null : circumcenter(t);
      const H = isDeg ? null : orthocenter(t);
      return {
        t,
        deg: isDeg || !U || !H,
        size,
        sides: sd,
        ang: angles(t),
        area: area(t),
        kd: kind(t, 0.05),
        big: largestAngle(t),
        eq: isEquilateral(t, 0.004),
        iso: isoscelesApex(t, 0.004),
        U,
        R: isDeg ? 0 : circumradius(t),
        W: incenter(t),
        rho: isDeg ? 0 : inradius(t),
        S: centroid(t),
        H,
        mids: midpoints(t),
        feet: altitudeFeet(t),
        onSeg: IDX.map((i) => onSegment(altitudeFeet(t)[i]!, t[others(i)[0]], t[others(i)[1]], 1e-6)) as [boolean, boolean, boolean],
        bfeet: IDX.map((i) => bisectorFoot(t, i)) as [Pt, Pt, Pt],
        touch: touchPoints(t),
      };
    }
    function geom(): Geom {
      const t = disp();
      const key = t.map((q) => `${q[0]},${q[1]}`).join('|');
      if (gCache?.key !== key) gCache = { key, g: geomOf(t) };
      return gCache.g;
    }

    let stepIdx = 0;
    let stepStart = -Infinity;
    let autoPlay = false;
    let fast = false;
    let atEnd = false;
    let wasRunning = false;
    let intro: number | null = null;
    let cardFade: number | null = null;
    let bal: { t0: number; pins: Pt[] } | null = null;
    let hits: { id: HitId; x: number; y: number; r: number }[] = [];
    let buttons: { id: HitId; r: Rect; label: string }[] = [];
    let hover: HitId | null = null;
    let drag: 0 | 1 | 2 | null = null;
    let lastDrag = -Infinity;
    let lastTime = performance.now();
    let lastSize = { w: 0, h: 0 };
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;

    /* ---------- Ansicht (Weltkoordinaten in cm → Pixel) ---------- */
    const scale = () => VS.v;
    function toPx(q: Pt): Px {
      const P = regions().paper;
      return [P.x + P.w / 2 + (q[0] - VX.v) * VS.v, P.y + P.h / 2 - (q[1] - VY.v) * VS.v];
    }
    function toWorld(px: number, py: number): Pt {
      const P = regions().paper;
      return [VX.v + (px - P.x - P.w / 2) / VS.v, VY.v - (py - P.y - P.h / 2) / VS.v];
    }
    function unit(dx: number, dy: number): Px {
      const l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    }
    const angTo = (from: Pt, to: Pt) => deg(Math.atan2(to[1] - from[1], to[0] - from[0]));
    const dirW = (d: number): Pt => [Math.cos(rad(d)), Math.sin(rad(d))];

    /** Die ganze Gerade durch a und b, auf das Papier zugeschnitten (Weltkoordinaten, obere Seite zuerst). */
    function clipLine(a: Pt, b: Pt, inset = 3): [Pt, Pt] {
      const P = regions().paper;
      const pa = toPx(a);
      const pb = toPx(b);
      const d = unit(pb[0] - pa[0], pb[1] - pa[1]);
      let t0 = -Infinity;
      let t1 = Infinity;
      const lim: [number, number, number, number][] = [
        [d[0], pa[0], P.x + inset, P.x + P.w - inset],
        [d[1], pa[1], P.y + inset, P.y + P.h - inset],
      ];
      for (const [dd, s, lo, hi] of lim) {
        if (Math.abs(dd) < 1e-9) {
          if (s < lo || s > hi) return [a, a];
          continue;
        }
        let u0 = (lo - s) / dd;
        let u1 = (hi - s) / dd;
        if (u0 > u1) [u0, u1] = [u1, u0];
        t0 = Math.max(t0, u0);
        t1 = Math.min(t1, u1);
      }
      if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 < t0) return [a, a];
      const e0 = toWorld(pa[0] + d[0] * t0, pa[1] + d[1] * t0);
      const e1 = toWorld(pa[0] + d[0] * t1, pa[1] + d[1] * t1);
      return e0[1] >= e1[1] ? [e0, e1] : [e1, e0];
    }
    /** Mittelsenkrechte der Seite gegenüber Ecke i (Gerade durch S₁ und S₂). */
    function msLine(G: Geom, i: Idx): [Pt, Pt] {
      const [j, k] = others(i);
      const ar = bisectorArcs(G.t[j], G.t[k]);
      return clipLine(ar.s1, ar.s2);
    }
    /** Seitenverlängerung für die Höhe von Ecke i (nur, wenn der Fußpunkt außerhalb der Seite liegt). */
    function extSeg(G: Geom, i: Idx): [Pt, Pt] | null {
      if (G.onSeg[i]) return null;
      const [j, k] = others(i);
      const f = G.feet[i];
      const near = dist(f, G.t[j]) < dist(f, G.t[k]) ? G.t[j] : G.t[k];
      const d = unit(f[0] - near[0], f[1] - near[1]);
      const over = 14 / scale();
      return [near, [f[0] + d[0] * over, f[1] + d[1] * over]];
    }

    /* ---------- Teilbewegungen ---------- */
    function bendFor(pin: Pt, r: number, refAng: number): number {
      const up = Math.cos(rad(refAng)) >= 0 ? 1 : -1;
      const rpx = Math.max(6, r * scale());
      const Lg = Math.max(rpx * 0.6 + 34, rpx / 2 + 26);
      const hgt = Math.sqrt(Math.max(0, Lg * Lg - (rpx / 2) ** 2)) + 22;
      const pp = toPx(pin);
      const t = rad(refAng);
      const midp: Px = [pp[0] + (Math.cos(t) * rpx) / 2, pp[1] - (Math.sin(t) * rpx) / 2];
      const nUp: Px = [-Math.sin(t), -Math.cos(t)];
      const P = regions().paper;
      const fits = (side: number) => {
        const y = midp[1] + nUp[1] * hgt * side;
        const x = midp[0] + nUp[0] * hgt * side;
        return y > P.y - 10 && y < P.y + P.h + 10 && x > P.x - 10 && x < P.x + P.w + 10;
      };
      if (fits(up)) return up;
      return fits(-up) ? -up : up;
    }
    function compassIn(pin: Pt, ang: number, r: number, label: string, dur = 650): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(pin, r, ang);
          const t1 = clamp01(t / 0.45);
          const t2 = clamp01((t - 0.45) / 0.55);
          const e = ease.outCubic(t1);
          const rr = lerp(r * 0.3, r, ease.inOutCubic(t2));
          s.compass = { pin: [pin[0] + (1 - e) * 1.2, pin[1] + (1 - e) * 0.9], ang: ang - (1 - e) * 25, r: rr, alpha: Math.min(1, t1 * 2), bend: side };
          s.radius = t2 > 0 && label ? { c: pin, ang, r: rr, alpha: Math.min(1, t2 * 2), label } : null;
        },
      };
    }
    function arcOp(c: Pt, r: number, a0: number, a1: number, dur = 420): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(c, r, (a0 + a1) / 2);
          const a = a0 + (a1 - a0) * ease.inOutCubic(t);
          s.radius = null;
          if (t > 0) s.arcs.push({ c, r, a0, a1: a });
          s.compass = { pin: c, ang: a, r, alpha: 1, bend: side };
        },
      };
    }
    /** Zirkel drehen, ohne zu zeichnen (angehoben). */
    function swingOp(c: Pt, r: number, a0: number, a1: number, dur = 260): Op {
      return {
        dur,
        apply(s, t) {
          s.radius = null;
          const a = a0 + (a1 - a0) * ease.inOutCubic(t);
          s.compass = { pin: c, ang: a, r, alpha: 1, bend: bendFor(c, r, a) };
        },
      };
    }
    /** Zirkel mit gleichem Radius zu einem neuen Einstichpunkt tragen. */
    function moveOp(from: Pt, to: Pt, r: number, a0: number, a1: number, dur = 340): Op {
      return {
        dur,
        apply(s, t) {
          const e = ease.inOutCubic(t);
          const a = a0 + norm180(a1 - a0) * e;
          const pin = lerpP(from, to, e);
          s.compass = { pin, ang: a, r, alpha: 1, bend: bendFor(pin, r, a) };
        },
      };
    }
    function compassOut(dur = 300): Op {
      return {
        dur,
        apply(s, t) {
          if (!s.compass) return;
          const c = s.compass;
          s.compass = t >= 1 ? null : { ...c, pin: [c.pin[0] + t * 1.2, c.pin[1] + t * 0.9], alpha: 1 - t };
        },
      };
    }
    function circleOp(c: Pt, r: number, a0: number, dur = 1400): Op {
      return {
        dur,
        apply(s, t) {
          const e = ease.inOutCubic(t);
          s.radius = null;
          s.circle = e;
          const a = a0 + 360 * e;
          s.compass = { pin: c, ang: a, r, alpha: 1, bend: bendFor(c, r, a) };
        },
      };
    }
    function markOp(list: { p: Pt; label: string }[], dur = 400): Op {
      return {
        dur,
        apply(s, t) {
          list.forEach((q, i) => s.marks.push({ ...q, pop: clamp01(t * (list.length + 0.6) - i * 0.6) }));
        },
      };
    }
    const setOp = (fn: (s: CState, t: number) => void, dur: number): Op => ({ dur, apply: fn });
    /** Strecke mit Lineal und Bleistift ziehen; set erhält den Fortschritt 0 … 1. */
    function lineOps(a: () => Pt, b: () => Pt, set: (s: CState, e: number) => void, dur = 700): Op[] {
      return [
        {
          dur: 360,
          apply(s, t) {
            s.ruler = { a: a(), b: b(), alpha: Math.min(1, t * 1.6), slide: 1 - ease.outCubic(t) };
          },
        },
        {
          dur,
          apply(s, t) {
            const e = ease.inOutCubic(t);
            const A = a();
            const B = b();
            s.ruler = { a: A, b: B, alpha: 1, slide: 0 };
            set(s, e);
            s.pencil = { tip: lerpP(A, B, e), alpha: t <= 0 ? 0 : t < 0.85 ? Math.min(1, t * 8) : (1 - t) / 0.15 };
          },
        },
        {
          dur: 280,
          apply(s, t) {
            set(s, 1);
            s.pencil = { tip: null, alpha: 0 };
            s.ruler = t >= 1 ? null : { a: a(), b: b(), alpha: 1 - t, slide: t * 0.7 };
          },
        },
      ];
    }
    const auxOp = (f: Fam, i: Idx, dur = 380): Op => setOp((s, t) => (s.aux[f][i] = t), dur);
    const ptOp = (k: PKey, dur = 800): Op => setOp((s, t) => (s.pts[k] = t), dur);
    /** Eine ganze Linienart ohne Werkzeug, leicht zeitversetzt (Euler-Ansicht, Einstieg). */
    const famOp = (f: Fam, dur = 1000): Op =>
      setOp((s, t) => {
        ORDER[f].forEach((i, k) => {
          const e = ease.inOutCubic(clamp01(t * 1.6 - k * 0.3));
          s.lines[f][i] = e;
          if (f === 'h') s.ext[i] = e;
        });
      }, dur);

    /** Geodreieck für die Höhe von Ecke i: Mittellinie auf der Seite, lange Kante durch die Ecke. */
    function geoOps(G: Geom, i: Idx): Op[] {
      const V = G.t[i];
      const f = G.feet[i];
      const [j, k] = others(i);
      const pj = G.t[j];
      const pk = G.t[k];
      let w: Pt;
      if (G.onSeg[i]) {
        const near = dist(f, pj) < dist(f, pk) ? pj : pk;
        const far = near === pj ? pk : pj;
        w = dist(f, near) > 1e-6 ? (unit(near[0] - f[0], near[1] - f[1]) as Pt) : (unit(near[0] - far[0], near[1] - far[1]) as Pt);
      } else {
        const far = dist(f, pj) > dist(f, pk) ? pj : pk;
        w = unit(f[0] - far[0], f[1] - far[1]) as Pt;
      }
      const u = unit(V[0] - f[0], V[1] - f[1]) as Pt;
      const reach = dist(V, f);
      const base = { f, u, w, reach };
      return [
        setOp((s, t) => (s.geo = { ...base, alpha: Math.min(1, t * 1.8), slide: 1 - ease.outCubic(t) }), 560),
        setOp((s) => (s.geo = { ...base, alpha: 1, slide: 0 }), 220),
        setOp((s, t) => {
          const e = ease.inOutCubic(t);
          s.geo = { ...base, alpha: 1, slide: 0 };
          s.lines.h[i] = e;
          s.pencil = { tip: lerpP(V, f, e), alpha: t <= 0 ? 0 : t < 0.85 ? Math.min(1, t * 8) : (1 - t) / 0.15 };
        }, 760),
        setOp((s, t) => {
          s.lines.h[i] = 1;
          s.pencil = { tip: null, alpha: 0 };
          s.geo = t >= 1 ? null : { ...base, alpha: 1 - t, slide: t * 0.6 };
        }, 300),
      ];
    }

    /* ---------- Schritte (Text wie im Heft + Teilbewegungen) ---------- */
    let stepsCache: { key: string; steps: Step[] } | null = null;
    function steps(): Step[] {
      const G = geom();
      const P = regions().paper;
      const key = `${gCache?.key}|${p.m}|${p.pt}|${P.w}|${P.h}`;
      if (stepsCache?.key === key) return stepsCache.steps;
      stepsCache = { key, steps: buildSteps(G) };
      return stepsCache.steps;
    }

    /** Die drei Mittelsenkrechten mit Zirkelbögen und Lineal. */
    function msSteps(G: Geom): Step[] {
      const out: Step[] = [];
      ORDER.ms.forEach((i, n) => {
        const [j, k] = others(i);
        const P = G.t[j];
        const Q = G.t[k];
        const ar = bisectorArcs(P, Q);
        const h = 13;
        const aP1 = angTo(P, ar.s1);
        const aP2 = angTo(P, ar.s2);
        const aQ1 = angTo(Q, ar.s1);
        const aQ2 = angTo(Q, ar.s2);
        const sideName = `[${VN[j]}${VN[k]}]`;
        const src =
          n === 0
            ? say(L(`Konstruiere die Mittelsenkrechte ${LN('ms', i)} von ${sideName}: gleich große Kreisbögen um ${VN[j]} und ${VN[k]}, Schnittpunkte verbinden.`, `Construct the perpendicular bisector ${LN('ms', i)} of ${sideName}: equal arcs around ${VN[j]} and ${VN[k]}, join the crossing points.`))
            : n === 1
              ? say(L(`Ebenso die Mittelsenkrechte ${LN('ms', i)} von ${sideName}.`, `Likewise the perpendicular bisector ${LN('ms', i)} of ${sideName}.`))
              : say(L(`Und ${LN('ms', i)} von ${sideName} – sie geht durch denselben Punkt!`, `And ${LN('ms', i)} of ${sideName} – it passes through the same point!`));
        out.push({
          src,
          tool: 'compass',
          ops: [
            compassIn(P, aP1 - h, ar.r, 'r', 620),
            arcOp(P, ar.r, aP1 - h, aP1 + h, 400),
            swingOp(P, ar.r, aP1 + h, aP2 - h, 240),
            arcOp(P, ar.r, aP2 - h, aP2 + h, 400),
            moveOp(P, Q, ar.r, aP2 + h, aQ2 - h, 360),
            arcOp(Q, ar.r, aQ2 - h, aQ2 + h, 400),
            swingOp(Q, ar.r, aQ2 + h, aQ1 - h, 240),
            arcOp(Q, ar.r, aQ1 - h, aQ1 + h, 400),
            compassOut(280),
            markOp(
              [
                { p: ar.s1, label: '' },
                { p: ar.s2, label: '' },
              ],
              360,
            ),
            ...lineOps(
              () => msLine(geom(), i)[0],
              () => msLine(geom(), i)[1],
              (s, e) => (s.lines.ms[i] = e),
              720,
            ),
            auxOp('ms', i),
          ],
        });
      });
      return out;
    }

    /** Die drei Winkelhalbierenden: Bogen um die Ecke, gleiche Bögen um P₁ und P₂ (Raute). */
    function whSteps(G: Geom): Step[] {
      const out: Step[] = [];
      ORDER.wh.forEach((i, n) => {
        const V = G.t[i];
        const [j, k] = others(i);
        const r0 = 0.34 * Math.min(G.sides[j], G.sides[k]);
        const c = angleBisectorArcs(G.t, i, r0);
        const aj = angTo(V, G.t[j]);
        const ak = angTo(V, G.t[k]);
        const span = norm180(ak - aj);
        const sg = Math.sign(span) || 1;
        const a1k = angTo(c.p1, c.k);
        const a2k = angTo(c.p2, c.k);
        const src =
          n === 0
            ? say(L(`Halbiere den Winkel ${GREEK[i]} bei ${VN[i]}: Bogen um ${VN[i]}, gleiche Bögen um die Schnittpunkte, verbinden: ${LN('wh', i)}.`, `Bisect the angle ${GREEK[i]} at ${VN[i]}: arc around ${VN[i]}, equal arcs around the crossing points, join: ${LN('wh', i)}.`))
            : n === 1
              ? say(L(`Ebenso die Winkelhalbierende ${LN('wh', i)} bei ${VN[i]}.`, `Likewise the angle bisector ${LN('wh', i)} at ${VN[i]}.`))
              : say(L(`Und ${LN('wh', i)} bei ${VN[i]} – auch sie geht durch denselben Punkt!`, `And ${LN('wh', i)} at ${VN[i]} – it also passes through the same point!`));
        out.push({
          src,
          tool: 'compass',
          ops: [
            compassIn(V, aj - 8 * sg, r0, '', 560),
            arcOp(V, r0, aj - 8 * sg, aj + span + 8 * sg, 520),
            markOp(
              [
                { p: c.p1, label: '' },
                { p: c.p2, label: '' },
              ],
              300,
            ),
            moveOp(V, c.p1, r0, aj + span + 8 * sg, a1k - 16, 360),
            arcOp(c.p1, r0, a1k - 16, a1k + 16, 380),
            moveOp(c.p1, c.p2, r0, a1k + 16, a2k + 16, 340),
            arcOp(c.p2, r0, a2k + 16, a2k - 16, 380),
            compassOut(260),
            markOp([{ p: c.k, label: '' }], 300),
            ...lineOps(
              () => geom().t[i],
              () => geom().bfeet[i],
              (s, e) => (s.lines.wh[i] = e),
              640,
            ),
            auxOp('wh', i),
          ],
        });
      });
      return out;
    }

    /** Die drei Seitenhalbierenden: Seite messen, Mitte markieren, mit der Ecke verbinden. */
    function shSteps(G: Geom): Step[] {
      const out: Step[] = [];
      ORDER.sh.forEach((i, n) => {
        const [j, k] = others(i);
        const P = G.t[j];
        const Q = G.t[k];
        const M = G.mids[i];
        const len = G.sides[i];
        const mName = `M_${SUB[i]}`;
        const src =
          n === 0
            ? say(L(`Miss [${VN[j]}${VN[k]}] und markiere die Mitte ${mName}. Verbinde ${VN[i]} mit ${mName}: ${LN('sh', i)}.`, `Measure ${VN[j]}${VN[k]} and mark its midpoint ${mName}. Join ${VN[i]} to ${mName}: ${LN('sh', i)}.`))
            : n === 1
              ? say(L(`Ebenso ${LN('sh', i)} von ${VN[i]} zur Mitte ${mName} von [${VN[j]}${VN[k]}].`, `Likewise ${LN('sh', i)} from ${VN[i]} to the midpoint ${mName} of ${VN[j]}${VN[k]}.`))
              : say(L(`Und ${LN('sh', i)} von ${VN[i]} nach ${mName} – wieder durch denselben Punkt!`, `And ${LN('sh', i)} from ${VN[i]} to ${mName} – again through the same point!`));
        out.push({
          src,
          tool: 'ruler',
          ops: [
            setOp((s, t) => {
              s.ruler = { a: P, b: Q, alpha: Math.min(1, t * 1.6), slide: 1 - ease.outCubic(t) };
            }, 380),
            setOp((s, t) => {
              s.ruler = { a: P, b: Q, alpha: 1, slide: 0 };
              s.note = { p: M, src: `${SUB[i]} ≈ ${cm(len)}  →  ${SUB[i]} : 2 ≈ ${cm(len / 2, 2)}`, alpha: Math.min(1, t * 3) };
              s.pencil = { tip: M, alpha: clamp01((t - 0.5) * 4) };
              if (t > 0.6) s.marks.push({ p: M, label: mName, pop: clamp01((t - 0.6) / 0.4) });
            }, 820),
            setOp((s, t) => {
              s.marks.push({ p: M, label: mName, pop: 1 });
              s.note = t >= 1 ? null : { p: M, src: `${SUB[i]} ≈ ${cm(len)}  →  ${SUB[i]} : 2 ≈ ${cm(len / 2, 2)}`, alpha: 1 - t };
              s.pencil = { tip: null, alpha: 0 };
              s.ruler = t >= 1 ? null : { a: P, b: Q, alpha: 1 - t, slide: t * 0.7 };
            }, 280),
            ...lineOps(
              () => geom().t[i],
              () => geom().mids[i],
              (s, e) => (s.lines.sh[i] = e),
              620,
            ),
            auxOp('sh', i),
          ],
        });
      });
      return out;
    }

    /** Die drei Höhen mit dem Geodreieck (bei stumpfen Dreiecken zuerst die Seite verlängern). */
    function hSteps(G: Geom): Step[] {
      const out: Step[] = [];
      ORDER.h.forEach((i, n) => {
        const [j, k] = others(i);
        const sideName = `[${VN[j]}${VN[k]}]`;
        const ext = extSeg(G, i);
        const onto = ext ? say(L(`die Verlängerung von ${sideName}`, `the extension of ${sideName}`)) : sideName;
        const src =
          n === 0
            ? say(L(`Fälle mit dem Geodreieck das Lot von ${VN[i]} auf ${onto}: die Höhe ${LN('h', i)}.`, `Use the set square to drop the perpendicular from ${VN[i]} onto ${onto}: the altitude ${LN('h', i)}.`))
            : n === 1
              ? say(L(`Ebenso die Höhe ${LN('h', i)} von ${VN[i]} auf ${onto}.`, `Likewise the altitude ${LN('h', i)} from ${VN[i]} onto ${onto}.`))
              : say(L(`Und ${LN('h', i)} von ${VN[i]} auf ${onto}.`, `And ${LN('h', i)} from ${VN[i]} onto ${onto}.`));
        const ops: Op[] = [];
        if (ext)
          ops.push(
            ...lineOps(
              () => extSeg(geom(), i)?.[0] ?? geom().feet[i],
              () => extSeg(geom(), i)?.[1] ?? geom().feet[i],
              (s, e) => (s.ext[i] = e),
              520,
            ),
          );
        ops.push(...geoOps(G, i), auxOp('h', i));
        out.push({ src, tool: 'geo', ops });
      });
      return out;
    }

    function buildSteps(G: Geom): Step[] {
      if (G.deg) return [{ src: C('bad', say(L('A, B und C liegen (fast) auf einer Geraden – das ist kein Dreieck.', 'A, B and C lie (almost) on one line – that is not a triangle.'))), ops: [setOp(() => undefined, 300)] }];
      const m = mode();
      const show = p.pt;
      const ask = (txt: Txt): Step => ({ src: say(txt), ops: [setOp(() => undefined, 400)] });
      if (m === 'ms') {
        const list = msSteps(G);
        if (!show) return [...list, ask(L('Was fällt dir auf? Schneiden sich die drei Mittelsenkrechten in einem Punkt?', 'What do you notice? Do the three perpendicular bisectors meet in one point?'))];
        const U = G.U!;
        const a0 = angTo(U, G.t[0]);
        list.push({ src: say(L(`Die drei Mittelsenkrechten schneiden sich in ${PT('U')}.`, `The three perpendicular bisectors meet at ${PT('U')}.`)), ops: [ptOp('U', 900)] });
        list.push({
          src: say(L(`Kreis um ${PT('U')} mit r = ${C('ms', `\\o{UA} ≈ ${cm(G.R)}`)}: der Umkreis geht durch A, B und C.`, `Circle around ${PT('U')} with r = ${C('ms', `UA ≈ ${cm(G.R)}`)}: the circumcircle passes through A, B and C.`)),
          tool: 'compass',
          ops: [compassIn(U, a0, G.R, 'r', 600), circleOp(U, G.R, a0, 1400), compassOut(300)],
        });
        return list;
      }
      if (m === 'wh') {
        const list = whSteps(G);
        if (!show) return [...list, ask(L('Was fällt dir auf? Schneiden sich die drei Winkelhalbierenden in einem Punkt?', 'What do you notice? Do the three angle bisectors meet in one point?'))];
        const Wp = G.W;
        const a0 = angTo(Wp, G.touch[2]);
        list.push({ src: say(L(`Die Winkelhalbierenden schneiden sich in ${PT('W')}.`, `The angle bisectors meet at ${PT('W')}.`)), ops: [ptOp('W', 900)] });
        list.push({
          src: say(L(`Lote von ${PT('W')} auf die Seiten: Abstand ${C('wh', `ρ ≈ ${cm(G.rho)}`)} – zu allen drei Seiten gleich.`, `Perpendiculars from ${PT('W')} to the sides: distance ${C('wh', `ρ ≈ ${cm(G.rho)}`)} – the same for all three sides.`)),
          ops: [setOp((s, t) => (s.lote = t), 900)],
        });
        list.push({
          src: say(L(`Kreis um ${PT('W')} mit ${C('wh', 'ρ')}: der Inkreis berührt alle drei Seiten.`, `Circle around ${PT('W')} with ${C('wh', 'ρ')}: the incircle touches all three sides.`)),
          tool: 'compass',
          ops: [compassIn(Wp, a0, G.rho, 'ρ', 560), circleOp(Wp, G.rho, a0, 1300), compassOut(300)],
        });
        return list;
      }
      if (m === 'sh') {
        const list = shSteps(G);
        if (!show) return [...list, ask(L('Was fällt dir auf? Schneiden sich die drei Seitenhalbierenden in einem Punkt?', 'What do you notice? Do the three medians meet in one point?'))];
        list.push({ src: say(L(`Die Seitenhalbierenden schneiden sich im Schwerpunkt ${PT('S')}.`, `The medians meet at the centroid ${PT('S')}.`)), ops: [ptOp('S', 900)] });
        list.push({
          src: say(L(`${PT('S')} teilt jede Seitenhalbierende im Verhältnis ${C('sh', '2 : 1')} (von der Ecke aus).`, `${PT('S')} divides every median in the ratio ${C('sh', '2 : 1')} (from the vertex).`)),
          ops: [setOp((s, t) => (s.ratio = t), 1100)],
        });
        return list;
      }
      if (m === 'h') {
        const list = hSteps(G);
        if (!show) return [...list, ask(L('Was fällt dir auf? Schneiden sich die drei Höhen (oder ihre Verlängerungen) in einem Punkt?', 'What do you notice? Do the three altitudes (or their extensions) meet in one point?'))];
        let src: string;
        if (G.kd === 'stumpf') src = say(L(`Die Verlängerungen der Höhen schneiden sich in ${PT('H')} – außerhalb des Dreiecks.`, `The extended altitudes meet at ${PT('H')} – outside the triangle.`));
        else if (G.kd === 'recht') src = say(L(`Die Höhen schneiden sich in ${PT('H')} = ${VN[G.big]}, der Ecke mit dem rechten Winkel.`, `The altitudes meet at ${PT('H')} = ${VN[G.big]}, the vertex with the right angle.`));
        else src = say(L(`Die drei Höhen schneiden sich in ${PT('H')}.`, `The three altitudes meet at ${PT('H')}.`));
        list.push({ src, ops: [ptOp('H', 900)] });
        return list;
      }
      // Alle Punkte und Euler-Gerade
      const list: Step[] = [
        { src: say(L(`Seitenhalbierende → Schwerpunkt ${PT('S')}`, `Medians → centroid ${PT('S')}`)), ops: [famOp('sh', 1000), ...(show ? [ptOp('S', 500)] : [])] },
        { src: say(L(`Mittelsenkrechten → Umkreismittelpunkt ${PT('U')}`, `Perpendicular bisectors → circumcentre ${PT('U')}`)), ops: [famOp('ms', 1000), ...(show ? [ptOp('U', 500)] : [])] },
        { src: say(L(`Höhen → Höhenschnittpunkt ${PT('H')}`, `Altitudes → orthocentre ${PT('H')}`)), ops: [famOp('h', 1000), ...(show ? [ptOp('H', 500)] : [])] },
      ];
      if (!show) return [...list, ask(L('Was fällt dir an den drei Schnittpunkten auf?', 'What do you notice about the three points?'))];
      if (G.eq) {
        list.push({ src: say(L(`Gleichseitig: ${PT('U')}, ${PT('W')}, ${PT('S')} und ${PT('H')} fallen zusammen – es gibt keine Euler-Gerade.`, `Equilateral: ${PT('U')}, ${PT('W')}, ${PT('S')} and ${PT('H')} coincide – there is no Euler line.`)), ops: [ptOp('W', 700)] });
        return list;
      }
      const eu = euler(G.t)!;
      list.push({
        src: say(L(`Die Gerade durch ${PT('H')} und ${PT('U')} geht auch durch ${PT('S')}: die ${C('eu', 'Euler-Gerade')}.`, `The line through ${PT('H')} and ${PT('U')} also passes through ${PT('S')}: the ${C('eu', 'Euler line')}.`)),
        tool: 'ruler',
        ops: [
          ...lineOps(
            () => clipLine(geom().H!, geom().U!)[0],
            () => clipLine(geom().H!, geom().U!)[1],
            (s, e) => (s.euler = e),
            760,
          ),
          ptOp('W', 500),
        ],
      });
      list.push({
        src: say(L(`${C('eu', `\\o{HS} ≈ ${cm(eu.hs, 2)} = 2 · \\o{SU}`)}: ${PT('S')} teilt [HU] im Verhältnis 2 : 1.`, `${C('eu', `HS ≈ ${cm(eu.hs, 2)} = 2 · SU`)}: ${PT('S')} divides HU in the ratio 2 : 1.`)),
        ops: [setOp((s, t) => (s.ratio = t), 1000)],
      });
      return list;
    }

    const stepDur = (st: Step) => st.ops.reduce((s, o) => s + o.dur, 0);
    const speed = () => (fast ? 6 : 1.15);
    function stepRunning(now = performance.now()): boolean {
      if (reduced || stepIdx === 0) return false;
      const st = steps()[stepIdx - 1];
      return !!st && (now - stepStart) * speed() < stepDur(st);
    }
    const nSteps = () => steps().length;
    const finished = () => stepIdx >= nSteps() && !stepRunning();

    function constrState(now: number): CState {
      const s = emptyState();
      const list = steps();
      for (let i = 0; i < stepIdx && i < list.length; i++) {
        const st = list[i]!;
        let el = i < stepIdx - 1 || reduced ? Infinity : (now - stepStart) * speed();
        for (const op of st.ops) {
          op.apply(s, clamp01(el / op.dur));
          el -= op.dur;
          if (el < 0) break;
        }
      }
      return s;
    }
    function stepProgress(now: number): number {
      if (reduced || stepIdx === 0) return 1;
      const st = steps()[stepIdx - 1];
      if (!st) return 1;
      return clamp01(((now - stepStart) * speed()) / Math.max(1, stepDur(st)));
    }
    function nextStep(): void {
      const now = performance.now();
      if (stepRunning(now)) return;
      bal = null;
      if (stepIdx >= nSteps()) {
        stepIdx = 0;
        atEnd = false;
      }
      stepIdx++;
      stepStart = now;
      atEnd = stepIdx >= nSteps();
      updateReadouts();
      ctx.requestRender();
    }
    function restart(): void {
      stepIdx = 0;
      stepStart = -Infinity;
      autoPlay = false;
      fast = false;
      atEnd = false;
      bal = null;
      updateReadouts();
      ctx.requestRender();
    }
    function finishNow(): void {
      stepIdx = nSteps();
      stepStart = -Infinity;
      atEnd = true;
      autoPlay = false;
      fast = false;
    }
    /** Ganze Konstruktion zügig ohne Werkzeuge abspielen (Einstieg, Wechsel, Beispiel). */
    function replay(): void {
      restart();
      if (reduced) {
        finishNow();
        updateReadouts();
        return;
      }
      fast = true;
      autoPlay = true;
      nextStep();
    }
    /** Mit Werkzeugen in normaler Geschwindigkeit konstruieren. */
    function playAll(): void {
      stepIdx = 0;
      atEnd = false;
      stepStart = -Infinity;
      bal = null;
      fast = false;
      autoPlay = true;
      if (reduced) finishNow();
      else nextStep();
    }

    /* ---------- Ansicht einpassen ---------- */
    function targetView(): { cx: number; cy: number; s: number } {
      const P = regions().paper;
      const G = geom();
      const m = mode();
      const pts: Pt[] = [...G.t];
      const near = (q: Pt | null, k = 1.6): q is Pt => !!q && dist(q, G.S) < k * G.size;
      if (!G.deg) {
        if (m === 'ms' && G.U) {
          if (G.R < 1.3 * G.size) pts.push([G.U[0] - G.R, G.U[1] - G.R], [G.U[0] + G.R, G.U[1] + G.R]);
          else if (near(G.U)) pts.push(G.U);
        }
        if (m === 'h' || m === 'eu') {
          if (near(G.H)) pts.push(G.H);
          for (const f of G.feet) if (near(f)) pts.push(f);
        }
        if (m === 'eu' && near(G.U)) pts.push(G.U);
      }
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const q of pts) {
        x0 = Math.min(x0, q[0]);
        x1 = Math.max(x1, q[0]);
        y0 = Math.min(y0, q[1]);
        y1 = Math.max(y1, q[1]);
      }
      const cur = steps()[stepIdx - 1];
      const working = !!cur && !finished() && !fast;
      const toolPad = working && cur.tool === 'compass' ? fs(64, 46) : working && cur.tool === 'geo' ? fs(70, 50) : 0;
      const base = fs(44, 30);
      const inset = regions().inset;
      const padL = Math.max(base, toolPad);
      const padR = Math.max(base, toolPad);
      const padTop = Math.max(fs(52, 40), toolPad, inset ? inset.h + 24 : 0);
      const padBot = Math.max(fs(66, 52), toolPad);
      const bw = Math.max(1, x1 - x0);
      const bh = Math.max(1, y1 - y0);
      const sc = clamp(Math.min((P.w - padL - padR) / bw, (P.h - padTop - padBot) / bh), 6, fs(74, 56));
      const cx = (x0 + x1) / 2 + (padR - padL) / 2 / sc;
      const cy = (y0 + y1) / 2 - (padBot - padTop) / 2 / sc;
      return { cx, cy, s: sc };
    }
    function retargetView(instant: boolean): void {
      const t = targetView();
      for (const [c, v] of [
        [VX, t.cx],
        [VY, t.cy],
        [VS, t.s],
      ] as [Chan, number][]) {
        if (instant || reduced) c.jump(v);
        else if (Math.abs(c.goal - v) > 1e-6) c.follow(v, 0.24);
      }
    }

    /* ---------- Ergebnisse ---------- */
    const kindName = (k: Kind) => (k === 'spitz' ? say(L('spitzwinklig', 'acute')) : k === 'recht' ? say(L('rechtwinklig', 'right-angled')) : say(L('stumpfwinklig', 'obtuse')));
    const ov = (s: string) => `<span style="text-decoration: overline">${s}</span>`;
    /** Kurzschrift der Zeichenfläche in HTML für die Ergebnisliste. */
    function toHtml(src: string): string {
      let s = src.replace(/\\o\{([^{}]*)\}/g, (_m, x: string) => ov(x));
      for (let k = 0; k < 4; k++) s = s.replace(/\\c\{[^{}]*\}\{([^{}]*)\}/g, '$1');
      s = s.replace(/_(\{[^{}]*\}|.)/g, (_m, x: string) => `<sub>${x.replace(/[{}]/g, '')}</sub>`);
      return s;
    }
    function updateReadouts(): void {
      const t = target();
      const G = geomOf(t);
      const m = mode();
      if (G.deg) {
        ctx.readout('kind', say(L('kein Dreieck (A, B, C auf einer Geraden)', 'not a triangle (A, B, C on one line)')));
        ctx.readout('pt', null);
        ctx.readout('prop', null);
      } else {
        const extra = G.eq ? say(L(', gleichseitig', ', equilateral')) : G.iso !== null ? say(L(', gleichschenklig', ', isosceles')) : '';
        ctx.readout('kind', { html: `${kindName(G.kd)}${extra}; <var>α</var> ≈ ${dg1(G.ang[0])}, <var>β</var> ≈ ${dg1(G.ang[1])}, <var>γ</var> ≈ ${dg1(G.ang[2])}` });
        if (!p.pt) {
          ctx.readout('pt', null);
          ctx.readout('prop', null);
        } else if (m === 'ms') {
          ctx.readout('pt', `${PN.U} ≈ ${ptTxt(G.U!)}`);
          ctx.readout('prop', { html: `<var>r</var> = ${ov('UA')} = ${ov('UB')} = ${ov('UC')} ≈ ${cm(G.R, 2)}` });
        } else if (m === 'wh') {
          ctx.readout('pt', `${PN.W} ≈ ${ptTxt(G.W)}`);
          const s = (G.sides[0] + G.sides[1] + G.sides[2]) / 2;
          ctx.readout('prop', { html: `<var>ρ</var> = <var>A</var> : <var>s</var> ≈ ${fmt.num(G.area, 2)} cm² : ${cm(s, 2)} ≈ ${cm(G.rho, 2)}` });
        } else if (m === 'sh') {
          const n = (v: number) => fmt.num(v, 2);
          const [A, B, Cc] = t;
          ctx.readout('pt', { html: `S = ((${n(A[0])} + ${n(B[0])} + ${n(Cc[0])}) : 3 | (${n(A[1])} + ${n(B[1])} + ${n(Cc[1])}) : 3) ≈ ${ptTxt(G.S)}` });
          const mp = medianParts(t)[0];
          ctx.readout('prop', { html: `${ov('AS')} : ${ov('SM<sub>a</sub>')} ≈ ${fmt.num(mp[0], 2)} : ${fmt.num(mp[1], 2)} = 2 : 1` });
        } else if (m === 'h') {
          ctx.readout('pt', `H ≈ ${ptTxt(G.H!)}`);
          const hh = altitudes(t);
          ctx.readout('prop', { html: `<var>h<sub>a</sub></var> ≈ ${cm(hh[0], 2)}, <var>h<sub>b</sub></var> ≈ ${cm(hh[1], 2)}, <var>h<sub>c</sub></var> ≈ ${cm(hh[2], 2)}` });
        } else {
          const e = euler(t)!;
          ctx.readout('pt', `U ≈ ${ptTxt(e.u)}, S ≈ ${ptTxt(e.s)}, H ≈ ${ptTxt(e.h)}`);
          ctx.readout('prop', G.eq ? say(L('gleichseitig: U = W = S = H', 'equilateral: U = I = S = H')) : { html: `${ov('HS')} ≈ ${cm(e.hs, 2)} = 2 · ${ov('SU')} ≈ 2 · ${cm(e.su, 2)}` });
        }
      }
      const list = steps();
      const cur = list[stepIdx - 1];
      ctx.readout('step', cur ? { html: `${say(L('Schritt', 'Step'))} ${stepIdx} ${say(L('von', 'of'))} ${list.length}: ${toHtml(cur.src)}` } : say(L('Noch nicht begonnen – „Nächster Schritt“ drücken.', 'Not started yet – press “Next step”.')));
      const done = stepIdx >= list.length && !stepRunning();
      ctx.setAction('next', { enabled: !ctx.locked, label: done ? say(L('Neu konstruieren', 'Construct again')) : say(L('Nächster Schritt', 'Next step')) });
      ctx.setAction('play', { enabled: !ctx.locked });
      ctx.setAction('restart', { enabled: !ctx.locked && stepIdx > 0 });
      ctx.setAction('tilt', { enabled: !ctx.locked && !G.deg });
    }

    /* =====================================================================
     * Zeichenhilfen
     * ===================================================================== */
    const paperColor = () => (th().dark ? '#121923' : '#fdfdfb');
    function segment(a: Px, b: Px, color: string, width: number, dash?: number[]): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
      g.restore();
    }
    function dot(q: Px, r: number, color: string): void {
      const g = surface.g;
      g.beginPath();
      g.arc(q[0], q[1], r, 0, TAU);
      g.fillStyle = color;
      g.fill();
    }
    function haloText(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = paperColor();
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    /** Beschriftung, die ganz in der Zeichenfläche bleibt. */
    function labelIn(str: string, x: number, y: number, f: string, color: string): void {
      const P = regions().paper;
      surface.g.font = f;
      const w = surface.g.measureText(str).width / 2 + 6;
      haloText(str, clamp(x, P.x + w, P.x + P.w - w), clamp(y, P.y + 12, P.y + P.h - 12), f, color);
    }
    /** Formel mit Halo (z. B. m_a an einer Linie), in der Zeichenfläche gehalten. */
    function formulaAt(src: string, x: number, y: number, size: number, color: string, weight = 700): void {
      const g = surface.g;
      const P = regions().paper;
      const box = formula(g, src, fstyle(size, color, weight));
      const left = clamp(x - box.w / 2, P.x + 6, P.x + P.w - box.w - 6);
      const base = clamp(y + (box.asc - box.desc) / 2, P.y + box.asc + 4, P.y + P.h - box.desc - 4);
      g.save();
      g.fillStyle = withAlpha(paperColor(), 0.82);
      roundRect(g, left - 3, base - box.asc - 1, box.w + 6, box.asc + box.desc + 2, 4);
      g.fill();
      g.restore();
      box.draw(g, left, base);
    }
    function arrowHead(tip: Px, dir: Px, color: string, size: number): void {
      // gemeinsame Form aus sim-core
      drawArrowHead(surface.g, tip[0], tip[1], Math.atan2(dir[1], dir[0]), size, color);
    }
    /** Pille mit Formel, z. B. Hinweise auf der Zeichnung. */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; size?: number; alpha?: number; align?: 'left' | 'center' | 'right' } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const P = regions().paper;
      let box = formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      let sz = size;
      while (box.w > P.w - 40 && sz > 11) {
        sz -= 0.5;
        box = formula(g, src, fstyle(sz, opts.color ?? th().text, 700));
      }
      let left = opts.align === 'left' ? x : opts.align === 'right' ? x - box.w : x - box.w / 2;
      left = clamp(left, P.x + 12, P.x + P.w - box.w - 12);
      const base = clamp(y + (box.asc - box.desc) / 2, P.y + box.asc + 10, P.y + P.h - box.desc - 10);
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.94)' : 'rgba(255,255,255,0.96)';
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    /** Gleich-lang-Striche quer zur Richtung d. */
    function ticks(mx: number, my: number, d: Px, n: number, color: string, len = 5.5): void {
      const g = surface.g;
      const nx = -d[1];
      const ny = d[0];
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.lineCap = 'round';
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * 4.5;
        g.beginPath();
        g.moveTo(mx + d[0] * off - nx * len, my + d[1] * off - ny * len);
        g.lineTo(mx + d[0] * off + nx * len, my + d[1] * off + ny * len);
        g.stroke();
      }
      g.restore();
    }
    /** Rechter Winkel: Viertelkreis mit Punkt zwischen den Pixelrichtungen d1 und d2. */
    function rightMark(z: Px, d1: Px, d2: Px, color: string, r = 10, k = 1): void {
      if (k <= 0.01) return;
      const g = surface.g;
      const a1 = Math.atan2(d1[1], d1[0]);
      let diff = Math.atan2(d2[1], d2[0]) - a1;
      while (diff > Math.PI) diff -= TAU;
      while (diff < -Math.PI) diff += TAU;
      const rr = r * ease.outBack(clamp01(k));
      g.save();
      g.globalAlpha *= clamp01(k * 1.5);
      g.beginPath();
      g.moveTo(z[0], z[1]);
      g.arc(z[0], z[1], rr, a1, a1 + diff, diff < 0);
      g.closePath();
      g.fillStyle = withAlpha(color, th().dark ? 0.24 : 0.16);
      g.fill();
      g.beginPath();
      g.arc(z[0], z[1], rr, a1, a1 + diff, diff < 0);
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.stroke();
      const m = a1 + diff / 2;
      dot([z[0] + Math.cos(m) * rr * 0.5, z[1] + Math.sin(m) * rr * 0.5], 1.7, color);
      g.restore();
    }

    /* =====================================================================
     * Papier und Werkzeuge
     * ===================================================================== */
    function drawPaper(R: Rect): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = paperColor();
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.clip();
      // Karos: 0,5 cm, jede zweite Linie (1 cm) etwas kräftiger
      const s = scale();
      const tl = toWorld(R.x, R.y);
      const br = toWorld(R.x + R.w, R.y + R.h);
      const cell = s * 0.5 >= 6 ? 0.5 : s >= 6 ? 1 : 2;
      g.lineWidth = 1;
      for (const major of [false, true]) {
        g.strokeStyle = major ? withAlpha(theme.grid, theme.dark ? 0.7 : 0.85) : theme.gridMinor;
        g.beginPath();
        for (let k = Math.ceil(tl[0] / cell); k * cell <= br[0]; k++) {
          if ((Math.abs(k * cell) % 1 < 1e-9) !== major && cell < 1) continue;
          if (cell >= 1 && !major) continue;
          const x = Math.round(toPx([k * cell, 0])[0]) + 0.5;
          g.moveTo(x, R.y);
          g.lineTo(x, R.y + R.h);
        }
        for (let k = Math.ceil(br[1] / cell); k * cell <= tl[1]; k++) {
          if ((Math.abs(k * cell) % 1 < 1e-9) !== major && cell < 1) continue;
          if (cell >= 1 && !major) continue;
          const y = Math.round(toPx([0, k * cell])[1]) + 0.5;
          g.moveTo(R.x, y);
          g.lineTo(R.x + R.w, y);
        }
        g.stroke();
      }
      // Koordinaten am Rand (in cm), damit die Lage der Punkte ablesbar ist
      const every = s >= 34 ? 1 : s >= 17 ? 2 : 5;
      g.font = font(600, 11);
      g.fillStyle = withAlpha(theme.muted, 0.75);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      for (let k = Math.ceil(tl[0] / every) * every; k <= br[0]; k += every) {
        const x = toPx([k, 0])[0];
        if (x < R.x + 26 || x > R.x + R.w - 14) continue;
        g.fillText(fmt.num(k, 0), x, R.y + R.h - 9);
      }
      g.textAlign = 'left';
      for (let k = Math.ceil(br[1] / every) * every; k <= tl[1]; k += every) {
        const y = toPx([0, k])[1];
        if (y < R.y + 14 || y > R.y + R.h - 22) continue;
        g.fillText(fmt.num(k, 0), R.x + 5, y);
      }
      // leichter Lichtschein oben links
      const shine = g.createLinearGradient(R.x, R.y, R.x + R.w * 0.6, R.y + R.h * 0.6);
      shine.addColorStop(0, theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = shine;
      g.fillRect(R.x, R.y, R.w, R.h);
      g.restore();
    }

    function leg(a: Px, b: Px, w0: number, w1: number, light: string, darkC: string): void {
      const g = surface.g;
      const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
      const nx = -uy;
      const ny = ux;
      const grad = g.createLinearGradient(a[0] - nx * w0, a[1] - ny * w0, a[0] + nx * w0, a[1] + ny * w0);
      grad.addColorStop(0, darkC);
      grad.addColorStop(0.45, light);
      grad.addColorStop(1, darkC);
      g.beginPath();
      g.moveTo(a[0] + (nx * w0) / 2, a[1] + (ny * w0) / 2);
      g.lineTo(b[0] + (nx * w1) / 2, b[1] + (ny * w1) / 2);
      g.lineTo(b[0] - (nx * w1) / 2, b[1] - (ny * w1) / 2);
      g.lineTo(a[0] - (nx * w0) / 2, a[1] - (ny * w0) / 2);
      g.closePath();
      g.fillStyle = grad;
      g.fill();
      g.strokeStyle = withAlpha(darkC, 0.8);
      g.lineWidth = 0.8;
      g.stroke();
    }

    /* ---------- Fotos von Zirkel und Bleistift (optional) ---------- */
    /**
     * Zirkel-Foto: zwei getrennte, senkrechte Schenkel nebeneinander. Jeder
     * Schenkel wird um das Gelenk gedreht, bis seine Spitze auf Nadel bzw.
     * Mine zeigt; Seitenverhältnis bleibt, die Länge folgt der Schenkellänge.
     * Vom Bleistiftschenkel wird nur der Teil unterhalb der Gelenkmitte
     * gezeichnet, darüber liegt der Nadelschenkel mit Gelenkscheibe und Griff.
     */
    const COMPASS_IMG = { hingeY: 187, tipY: 1036, needle: { x: 0, w: 138, axis: 69 }, pencil: { x: 298, w: 161, axis: 365 } };
    function compassPhoto(img: HTMLImageElement, hinge: Px, pin: Px, pen: Px, dark: boolean): void {
      const g = surface.g;
      const C = COMPASS_IMG;
      const legPart = (tip: Px, part: { x: number; w: number; axis: number }, y0: number): void => {
        const len = Math.hypot(tip[0] - hinge[0], tip[1] - hinge[1]);
        if (len < 2) return;
        const k = len / (C.tipY - C.hingeY);
        const w = part.w * k;
        const h = (img.height - y0) * k;
        g.save();
        g.translate(hinge[0], hinge[1]);
        g.rotate(Math.atan2(tip[1] - hinge[1], tip[0] - hinge[0]) - Math.PI / 2);
        g.drawImage(scaledSprite(img, w, h, surface.dpr, { crop: { x: part.x, y: y0, w: part.w, h: img.height - y0 } }), -(part.axis - part.x) * k, (y0 - C.hingeY) * k, w, h);
        g.restore();
      };
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 10;
      g.shadowOffsetX = 5;
      g.shadowOffsetY = 7;
      legPart(pen, C.pencil, C.hingeY);
      legPart(pin, C.needle, 0);
      g.restore();
    }

    /** Bleistift-Foto (waagerecht, Spitze links in halber Höhe), gedreht wie der gezeichnete Stift. */
    const PENCIL_IMG = { tipY: 62, len: 110 };
    function pencilPhoto(img: HTMLImageElement, tip: Px, angle: number, dark: boolean): void {
      const g = surface.g;
      const len = PENCIL_IMG.len;
      const k = len / img.width;
      const h = img.height * k;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 5;
      g.shadowOffsetY = 6;
      g.translate(tip[0], tip[1]);
      g.rotate(angle);
      g.drawImage(scaledSprite(img, len, h, surface.dpr), 0, -PENCIL_IMG.tipY * k, len, h);
      g.restore();
    }

    /** Zirkel mit Spitze (Nadel) im Mittelpunkt und Mine auf dem Kreis. */
    function drawCompass(c: Compass): void {
      const g = surface.g;
      const theme = th();
      const pin = toPx(c.pin);
      const t = rad(c.ang);
      const rpx = Math.max(6, c.r * scale());
      const pen: Px = [pin[0] + Math.cos(t) * rpx, pin[1] - Math.sin(t) * rpx];
      const Lg = Math.max(rpx * 0.6 + 34, rpx / 2 + 26);
      const hgt = Math.sqrt(Math.max(0, Lg * Lg - (rpx / 2) ** 2));
      const base: Px = [(pin[0] + pen[0]) / 2, (pin[1] + pen[1]) / 2];
      const nUp: Px = [-Math.sin(t), -Math.cos(t)];
      const hinge: Px = [base[0] + nUp[0] * hgt * c.bend, base[1] + nUp[1] * hgt * c.bend];
      const outward: Px = Math.abs(c.bend) > 0.05 ? [nUp[0] * Math.sign(c.bend), nUp[1] * Math.sign(c.bend)] : [0, -1];
      const metalL = theme.dark ? '#eef2f7' : '#dfe4ea';
      const metalD = theme.dark ? '#7d889a' : '#6b7686';
      const steel = theme.dark ? '#d3d9e2' : '#3d4654';
      const needleTop: Px = [pin[0] + (hinge[0] - pin[0]) * 0.14, pin[1] + (hinge[1] - pin[1]) * 0.14];
      const penTop: Px = [pen[0] + (hinge[0] - pen[0]) * 0.3, pen[1] + (hinge[1] - pen[1]) * 0.3];
      g.save();
      g.globalAlpha *= c.alpha;
      const photo = ctx.images.get('compass');
      if (photo) {
        compassPhoto(photo, hinge, pin, pen, theme.dark);
        // Mine leuchtet beim Zeichnen
        const glow = g.createRadialGradient(pen[0], pen[1], 0, pen[0], pen[1], 9);
        glow.addColorStop(0, withAlpha(modeCol(), 0.35));
        glow.addColorStop(1, withAlpha(modeCol(), 0));
        g.fillStyle = glow;
        g.beginPath();
        g.arc(pen[0], pen[1], 9, 0, TAU);
        g.fill();
        g.restore();
        return;
      }
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 12;
      g.shadowOffsetX = 6;
      g.shadowOffsetY = 8;
      g.strokeStyle = withAlpha(metalD, 0.9);
      g.lineCap = 'round';
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(needleTop[0], needleTop[1]);
      g.lineTo(hinge[0], hinge[1]);
      g.lineTo(penTop[0], penTop[1]);
      g.stroke();
      g.restore();
      segment(needleTop, pin, steel, 1.8);
      leg(hinge, needleTop, 8, 4.5, metalL, metalD);
      leg(hinge, penTop, 8, 5, metalL, metalD);
      const [lx, ly] = unit(pen[0] - penTop[0], pen[1] - penTop[1]);
      const clampEnd: Px = [penTop[0] + lx * 5, penTop[1] + ly * 5];
      segment(penTop, clampEnd, metalD, 8);
      const woodEnd: Px = [penTop[0] + (pen[0] - penTop[0]) * 0.55, penTop[1] + (pen[1] - penTop[1]) * 0.55];
      segment(clampEnd, woodEnd, theme.dark ? '#e0ac52' : '#e29a2d', 6);
      const coneEnd: Px = [pen[0] - lx * 4, pen[1] - ly * 4];
      g.beginPath();
      g.moveTo(woodEnd[0] - ly * 3, woodEnd[1] + lx * 3);
      g.lineTo(woodEnd[0] + ly * 3, woodEnd[1] - lx * 3);
      g.lineTo(coneEnd[0] + ly * 1.2, coneEnd[1] - lx * 1.2);
      g.lineTo(coneEnd[0] - ly * 1.2, coneEnd[1] + lx * 1.2);
      g.closePath();
      g.fillStyle = theme.dark ? '#f1dcb2' : '#f2d7a6';
      g.fill();
      g.beginPath();
      g.moveTo(coneEnd[0] - ly * 1.2, coneEnd[1] + lx * 1.2);
      g.lineTo(coneEnd[0] + ly * 1.2, coneEnd[1] - lx * 1.2);
      g.lineTo(pen[0], pen[1]);
      g.closePath();
      g.fillStyle = col.pencil();
      g.fill();
      const gripEnd: Px = [hinge[0] + outward[0] * 20, hinge[1] + outward[1] * 20];
      segment(hinge, gripEnd, metalD, 8);
      segment(hinge, gripEnd, metalL, 4);
      g.save();
      g.strokeStyle = withAlpha(metalD, 0.9);
      g.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        const q: Px = [hinge[0] + outward[0] * (6 + k * 3), hinge[1] + outward[1] * (6 + k * 3)];
        g.beginPath();
        g.moveTo(q[0] - outward[1] * 4, q[1] + outward[0] * 4);
        g.lineTo(q[0] + outward[1] * 4, q[1] - outward[0] * 4);
        g.stroke();
      }
      g.restore();
      g.beginPath();
      g.arc(hinge[0], hinge[1], 7.5, 0, TAU);
      const hg = g.createRadialGradient(hinge[0] - 2.5, hinge[1] - 2.5, 1, hinge[0], hinge[1], 7.5);
      hg.addColorStop(0, '#ffffff');
      hg.addColorStop(1, metalD);
      g.fillStyle = hg;
      g.fill();
      dot(hinge, 2, steel);
      const glow = g.createRadialGradient(pen[0], pen[1], 0, pen[0], pen[1], 9);
      glow.addColorStop(0, withAlpha(modeCol(), 0.35));
      glow.addColorStop(1, withAlpha(modeCol(), 0));
      g.fillStyle = glow;
      g.beginPath();
      g.arc(pen[0], pen[1], 9, 0, TAU);
      g.fill();
      g.restore();
    }

    function drawRuler(r: Ruler): void {
      const g = surface.g;
      const theme = th();
      const a = toPx(r.a);
      const b = toPx(r.b);
      const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
      let nx = -uy;
      let ny = ux;
      if (ny < 0 || (Math.abs(ny) < 1e-6 && nx < 0)) {
        nx = -nx;
        ny = -ny;
      }
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const cmPx = scale();
      const wR = Math.max(26, 1.05 * cmPx);
      const off = r.slide * 50;
      const start = -Math.max(0.6 * cmPx, 14);
      const total = len - start * 2;
      const P0 = (u: number, v: number): Px => [a[0] + ux * (start + u) + nx * (off + v), a[1] + uy * (start + u) + ny * (off + v)];
      g.save();
      g.globalAlpha *= r.alpha;
      const corners = [P0(0, 0), P0(total, 0), P0(total, wR), P0(0, wR)];
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.beginPath();
      corners.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(52,64,84,0.86)' : 'rgba(255,251,232,0.9)';
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1;
      g.stroke();
      const mmPx = cmPx / 10;
      const step = mmPx >= 3.5 ? 1 : 5;
      g.strokeStyle = withAlpha(theme.text, 0.75);
      g.beginPath();
      for (let k = 0; -start + k * mmPx <= total - 4; k += step) {
        const l = k % 10 === 0 ? 0.36 : k % 5 === 0 ? 0.24 : 0.14;
        const [x0, y0] = P0(-start + k * mmPx, 0);
        const [x1, y1] = P0(-start + k * mmPx, wR * l);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.stroke();
      let ang = Math.atan2(uy, ux);
      if (ang > Math.PI / 2) ang -= Math.PI;
      if (ang < -Math.PI / 2) ang += Math.PI;
      const every = cmPx < 18 ? 2 : 1;
      g.fillStyle = withAlpha(theme.text, 0.8);
      g.font = font(600, 11);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      for (let k = 0; -start + k * cmPx <= total - 8; k += every) {
        const [x, y] = P0(-start + k * cmPx, wR * 0.64);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.fillText(String(k), 0, 0);
        g.restore();
      }
      g.restore();
    }

    function drawPencil(tip: Px, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const d: Px = [Math.cos(-1.0), Math.sin(-1.0)];
      const n: Px = [-d[1], d[0]];
      const at = (k: number): Px => [tip[0] + d[0] * k, tip[1] + d[1] * k];
      const w = 4.5;
      g.save();
      g.globalAlpha *= alpha;
      const photo = ctx.images.get('pencil');
      if (photo) {
        pencilPhoto(photo, tip, -1.0, theme.dark);
        g.restore();
        return;
      }
      const body = (k0: number, k1: number, w0: number, w1: number, color: string) => {
        const a0 = at(k0);
        const a1 = at(k1);
        g.beginPath();
        g.moveTo(a0[0] + n[0] * w0, a0[1] + n[1] * w0);
        g.lineTo(a1[0] + n[0] * w1, a1[1] + n[1] * w1);
        g.lineTo(a1[0] - n[0] * w1, a1[1] - n[1] * w1);
        g.lineTo(a0[0] - n[0] * w0, a0[1] - n[1] * w0);
        g.closePath();
        g.fillStyle = color;
        g.fill();
      };
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 5;
      g.shadowOffsetY = 6;
      body(16, 74, w, w, theme.dark ? '#e0ac52' : '#f0a92e');
      g.restore();
      body(0, 5, 0.2, 1.4, col.pencil());
      body(5, 16, 1.4, w, theme.dark ? '#f1dcb2' : '#f2d7a6');
      body(16, 74, w * 0.35, w * 0.35, 'rgba(255,255,255,0.25)');
      body(74, 80, w, w, theme.dark ? '#b8c1cd' : '#9aa4b1');
      body(80, 88, w, w, theme.dark ? '#f08fae' : '#ee7f9f');
      g.restore();
    }

    /** Geodreieck: Mittellinie auf der Seite, lange Kante entlang der Höhe, Nullpunkt im Fußpunkt. */
    function drawGeo(geo: GeoT): void {
      const g = surface.g;
      const theme = th();
      const f = toPx(geo.f);
      const uq = toPx([geo.f[0] + geo.u[0], geo.f[1] + geo.u[1]]);
      const wq = toPx([geo.f[0] + geo.w[0], geo.f[1] + geo.w[1]]);
      const u = unit(uq[0] - f[0], uq[1] - f[1]);
      const w = unit(wq[0] - f[0], wq[1] - f[1]);
      const P = regions().paper;
      const R = clamp(Math.max(fs(98, 78), geo.reach * scale() + 22), 60, Math.max(P.w, P.h) * 0.9);
      const Lp = (x: number, y: number): Px => {
        const yy = y + geo.slide * 46;
        return [f[0] + u[0] * x + w[0] * yy, f[1] + u[1] * x + w[1] * yy];
      };
      g.save();
      g.globalAlpha *= geo.alpha;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      const c1 = Lp(-R, -1);
      const c2 = Lp(R, -1);
      const c3 = Lp(0, R - 1);
      g.beginPath();
      g.moveTo(c1[0], c1[1]);
      g.lineTo(c2[0], c2[1]);
      g.lineTo(c3[0], c3[1]);
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(120,170,220,0.16)' : 'rgba(205,228,250,0.62)';
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? 'rgba(160,200,240,0.55)' : 'rgba(60,110,170,0.5)';
      g.lineWidth = 1.3;
      g.stroke();
      // Aussparung
      const h1 = Lp(-R * 0.16, R * 0.34);
      const h2 = Lp(R * 0.16, R * 0.34);
      const h3 = Lp(0, R * 0.5);
      g.beginPath();
      g.moveTo(h1[0], h1[1]);
      g.lineTo(h2[0], h2[1]);
      g.lineTo(h3[0], h3[1]);
      g.closePath();
      g.fillStyle = withAlpha(paperColor(), 0.6);
      g.fill();
      g.stroke();
      const ink = theme.dark ? 'rgba(210,225,245,0.85)' : 'rgba(30,60,100,0.8)';
      // Skala auf der langen Kante (0 in der Mitte)
      const cmPx = scale();
      const mm = cmPx / 10;
      const stepMm = mm >= 3.5 ? 1 : 5;
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      for (let k = 0; k * mm <= R - 6; k += stepMm) {
        const l = k % 10 === 0 ? 8 : k % 5 === 0 ? 5.5 : 3;
        for (const sg of k === 0 ? [1] : [-1, 1]) {
          const a = Lp(sg * k * mm, 0);
          const b = Lp(sg * k * mm, l);
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
        }
      }
      g.stroke();
      // Winkelskala (Halbkreis um den Nullpunkt)
      const rs = R * 0.62;
      g.beginPath();
      for (let a = 0; a <= 180; a += 10) {
        const l = a % 30 === 0 ? 7 : 4;
        const t = rad(a);
        const p0 = Lp(Math.cos(t) * rs, Math.sin(t) * rs);
        const p1 = Lp(Math.cos(t) * (rs - l), Math.sin(t) * (rs - l));
        g.moveTo(p0[0], p0[1]);
        g.lineTo(p1[0], p1[1]);
      }
      g.stroke();
      // Mittellinie (liegt auf der Seite): kräftig markiert
      segment(Lp(0, 0), Lp(0, R * 0.32), withAlpha(col.h(), 0.95), 1.8);
      dot(Lp(0, 0), 2.4, col.h());
      g.restore();
    }

    /* =====================================================================
     * Figur
     * ===================================================================== */
    /** Besonderer Punkt mit Aufleuchten; außerhalb des Blattes ein Pfeil am Rand. */
    function specialPoint(q: Pt, name: string, color: string, pop: number, avoid: Px[], faint = false): Px | null {
      if (pop <= 0) return null;
      const g = surface.g;
      const P = regions().paper;
      const pq = toPx(q);
      const insideP = pq[0] > P.x + 6 && pq[0] < P.x + P.w - 6 && pq[1] > P.y + 6 && pq[1] < P.y + P.h - 6;
      if (!insideP) {
        const inset = 18;
        const e: Px = [clamp(pq[0], P.x + inset, P.x + P.w - inset), clamp(pq[1], P.y + inset, P.y + P.h - inset)];
        const d = unit(pq[0] - e[0], pq[1] - e[1]);
        g.save();
        g.globalAlpha *= clamp01(pop * 1.5);
        segment([e[0] - d[0] * 9, e[1] - d[1] * 9], [e[0] + d[0] * 5, e[1] + d[1] * 5], color, 2.6);
        arrowHead([e[0] + d[0] * 12, e[1] + d[1] * 12], d, color, 9);
        haloText(name, e[0] - d[0] * 22 + d[1] * 12, e[1] - d[1] * 22 - d[0] * 12, font(800, fs(15, 13.5)), color);
        g.restore();
        return null;
      }
      const [x, y] = pq;
      if (pop < 1 && !faint) {
        const rr = 6 + 30 * ease.outCubic(pop);
        const glow = g.createRadialGradient(x, y, 0, x, y, rr);
        glow.addColorStop(0, withAlpha(color, 0.55 * (1 - pop)));
        glow.addColorStop(1, withAlpha(color, 0));
        g.fillStyle = glow;
        g.beginPath();
        g.arc(x, y, rr, 0, TAU);
        g.fill();
        g.save();
        g.strokeStyle = withAlpha(color, 0.8 * (1 - pop));
        g.lineWidth = 2;
        g.beginPath();
        g.arc(x, y, rr * 0.8, 0, TAU);
        g.stroke();
        g.restore();
      }
      const sc = ease.outBack(clamp01(pop));
      g.save();
      g.translate(x, y);
      g.scale(sc, sc);
      if (!faint) {
        g.beginPath();
        g.arc(0, 0, 11, 0, TAU);
        g.fillStyle = withAlpha(color, th().dark ? 0.24 : 0.16);
        g.fill();
      }
      const rg = g.createRadialGradient(-1.5, -1.8, 0.5, 0, 0, 5.5);
      rg.addColorStop(0, mixColor(color, '#ffffff', 0.45));
      rg.addColorStop(1, color);
      g.beginPath();
      g.arc(0, 0, faint ? 4.2 : 5.5, 0, TAU);
      g.fillStyle = rg;
      g.fill();
      g.strokeStyle = paperColor();
      g.lineWidth = 1.8;
      g.stroke();
      g.restore();
      if (name) {
        // Name in die freieste Richtung
        let bx = 0;
        let by = 0;
        for (const a of avoid) {
          const dd = Math.hypot(a[0] - x, a[1] - y);
          if (dd < 1) continue;
          const wgt = 1 / Math.max(20, dd);
          bx -= ((a[0] - x) / dd) * wgt;
          by -= ((a[1] - y) / dd) * wgt;
        }
        let [dx, dy] = unit(bx || 0.7, by || -0.7);
        if (Math.hypot(bx, by) < 1e-4) [dx, dy] = [0.7, -0.7];
        g.save();
        g.globalAlpha *= clamp01(pop * 1.5);
        labelIn(name, x + dx * 19, y + dy * 19, font(800, fs(15, 13.5)), color);
        g.restore();
      }
      return pq;
    }

    /** Endpunkte (Welt) der Linie i einer Linienart. */
    function lineEnds(G: Geom, f: Fam, i: Idx): [Pt, Pt] {
      if (f === 'ms') return msLine(G, i);
      if (f === 'wh') return [G.t[i], G.bfeet[i]];
      if (f === 'sh') return [G.t[i], G.mids[i]];
      return [G.t[i], G.feet[i]];
    }

    /** Eine Linienart zeichnen (Linien, Beschriftung, Hilfsmarken). */
    function drawFamily(G: Geom, st: CState, f: Fam, faint: boolean, k = 1): void {
      const g = surface.g;
      const color = famCol(f);
      const px = G.t.map(toPx) as [Px, Px, Px];
      const cen: Px = [(px[0][0] + px[1][0] + px[2][0]) / 3, (px[0][1] + px[1][1] + px[2][1]) / 3];
      g.save();
      g.globalAlpha *= k;
      for (const i of IDX) {
        const prog = st.lines[f][i];
        const [j, kk] = others(i);
        // Seitenverlängerung (Höhe auf stumpfem Dreieck)
        if (f === 'h' && st.ext[i] > 0) {
          const ex = extSeg(G, i);
          if (ex) {
            const a = toPx(ex[0]);
            const b = toPx(ex[1]);
            segment(a, [lerp(a[0], b[0], st.ext[i]), lerp(a[1], b[1], st.ext[i])], withAlpha(th().text, faint ? 0.3 : 0.55), 1.5, [5, 4]);
          }
        }
        if (prog <= 0) continue;
        const [e0, e1] = lineEnds(G, f, i);
        const a = toPx(e0);
        const b = toPx(e1);
        const e: Px = [lerp(a[0], b[0], prog), lerp(a[1], b[1], prog)];
        if (!faint && prog >= 1) {
          // weicher Schein unter der fertigen Linie
          segment(a, e, withAlpha(color, th().dark ? 0.16 : 0.12), 7);
        }
        segment(a, e, faint ? withAlpha(color, 0.5) : color, faint ? 1.5 : 2.4);
        // Hilfsmarken
        const ak = p.aux ? st.aux[f][i] : 0;
        if (!faint && ak > 0) {
          const pj = px[j];
          const pk = px[kk];
          const sideD = unit(pk[0] - pj[0], pk[1] - pj[1]);
          g.save();
          g.globalAlpha *= clamp01(ak * 1.4);
          if (f === 'ms' || f === 'sh') {
            const m = toPx(G.mids[i]);
            const nTicks = i + 1;
            ticks((pj[0] + m[0]) / 2, (pj[1] + m[1]) / 2, sideD, nTicks, color);
            ticks((pk[0] + m[0]) / 2, (pk[1] + m[1]) / 2, sideD, nTicks, color);
            dot(m, 3, color);
            if (f === 'ms') {
              const into = unit(px[i][0] - m[0], px[i][1] - m[1]);
              const d = unit(b[0] - a[0], b[1] - a[1]);
              const inn: Px = d[0] * into[0] + d[1] * into[1] >= 0 ? d : [-d[0], -d[1]];
              rightMark(m, sideD, inn, color, fs(10, 8.5), ak);
            }
          } else if (f === 'wh') {
            const v = px[i];
            const aj = Math.atan2(pj[1] - v[1], pj[0] - v[0]);
            const ab = Math.atan2(pk[1] - v[1], pk[0] - v[0]);
            const am = Math.atan2(b[1] - v[1], b[0] - v[0]);
            const r = (fs(24, 20) - (G.ang[i] > 100 ? 4 : 0)) * ease.outBack(clamp01(ak));
            for (const [x0, x1] of [
              [aj, am],
              [am, ab],
            ] as [number, number][]) {
              let diff = x1 - x0;
              while (diff > Math.PI) diff -= TAU;
              while (diff < -Math.PI) diff += TAU;
              g.beginPath();
              g.moveTo(v[0], v[1]);
              g.arc(v[0], v[1], r, x0, x0 + diff, diff < 0);
              g.closePath();
              g.fillStyle = withAlpha(color, th().dark ? 0.24 : 0.15);
              g.fill();
              g.beginPath();
              g.arc(v[0], v[1], r, x0, x0 + diff, diff < 0);
              g.strokeStyle = color;
              g.lineWidth = 1.5;
              g.stroke();
              const mm = x0 + diff / 2;
              segment([v[0] + Math.cos(mm) * (r - 4), v[1] + Math.sin(mm) * (r - 4)], [v[0] + Math.cos(mm) * (r + 4), v[1] + Math.sin(mm) * (r + 4)], color, 1.5);
            }
          } else {
            const ft = toPx(G.feet[i]);
            const toV = unit(px[i][0] - ft[0], px[i][1] - ft[1]);
            if (Math.hypot(px[i][0] - ft[0], px[i][1] - ft[1]) > 4) {
              const alongSide: Px = G.onSeg[i] ? sideD : unit(cen[0] - ft[0], cen[1] - ft[1]);
              const sd: Px = sideD[0] * alongSide[0] + sideD[1] * alongSide[1] >= 0 ? sideD : [-sideD[0], -sideD[1]];
              rightMark(ft, toV, sd, color, fs(10, 8.5), ak);
              dot(ft, 2.6, color);
            }
          }
          g.restore();
        }
        // Beschriftung der Linie
        if (!faint && prog >= 0.98) {
          const name = lineName(f, i);
          const d = unit(b[0] - a[0], b[1] - a[1]);
          let nrm: Px = [-d[1], d[0]];
          let at: Px;
          if (f === 'ms') {
            at = [lerp(a[0], b[0], 0.1), lerp(a[1], b[1], 0.1)];
          } else {
            at = [lerp(a[0], b[0], 0.36), lerp(a[1], b[1], 0.36)];
          }
          // auf die Seite, die vom Dreiecksinneren wegzeigt bzw. frei ist
          const cx = at[0] - cen[0];
          const cy = at[1] - cen[1];
          if (f === 'ms' ? nrm[0] * cx + nrm[1] * cy < 0 : nrm[0] * (px[(i + 1) % 3]![0] - at[0]) + nrm[1] * (px[(i + 1) % 3]![1] - at[1]) > 0) nrm = [-nrm[0], -nrm[1]];
          formulaAt(name, at[0] + nrm[0] * 13, at[1] + nrm[1] * 13, fs(14, 12.5), color);
        }
      }
      g.restore();
    }

    /** Verlängerungen der Höhen bis H (stumpfwinklig), gestrichelt. */
    function drawAltitudeExt(G: Geom, k: number, faint: boolean): void {
      if (!G.H || k <= 0) return;
      const ph = toPx(G.H);
      for (const i of IDX) {
        const v = toPx(G.t[i]);
        const f = toPx(G.feet[i]);
        // liegt H zwischen Ecke und Fußpunkt, ist nichts zu verlängern
        const tH = ((ph[0] - v[0]) * (f[0] - v[0]) + (ph[1] - v[1]) * (f[1] - v[1])) / Math.max(1e-9, (f[0] - v[0]) ** 2 + (f[1] - v[1]) ** 2);
        if (tH >= -0.001 && tH <= 1.001) continue;
        const from = tH > 1 ? f : v;
        segment(from, [lerp(from[0], ph[0], k), lerp(from[1], ph[1], k)], withAlpha(col.h(), faint ? 0.35 : 0.7), 1.6, [5, 4]);
      }
    }

    function drawFigure(now: number, st: CState): void {
      const g = surface.g;
      const theme = th();
      const G = geom();
      const m = mode();
      const px = G.t.map(toPx) as [Px, Px, Px];
      const P = regions().paper;
      const show = p.pt;
      const balK = balanceState(now);
      labelsDeferred = false;
      // Dreieck (im Modus Seitenhalbierende als Pappe)
      const card = m === 'sh' && !G.deg;
      if (balK) {
        g.save();
        g.transform(balK.m[0], balK.m[1], balK.m[2], balK.m[3], balK.m[4], balK.m[5]);
      }
      g.save();
      g.beginPath();
      px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      if (card) {
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(80,60,20,0.22)';
        g.shadowBlur = 10 + (balK ? balK.lift * 14 : 0);
        g.shadowOffsetX = 3 + (balK ? balK.lift * 10 : 0);
        g.shadowOffsetY = 4 + (balK ? balK.lift * 12 : 0);
        const cg = g.createLinearGradient(px[0][0], Math.min(...px.map((q) => q[1])), px[1][0], Math.max(...px.map((q) => q[1])));
        cg.addColorStop(0, theme.dark ? 'rgba(150,118,72,0.42)' : 'rgba(232,206,160,0.62)');
        cg.addColorStop(1, theme.dark ? 'rgba(120,92,52,0.42)' : 'rgba(214,182,128,0.62)');
        g.fillStyle = cg;
        g.fill();
        g.restore();
        if (balK && balK.shade !== 0) {
          // Schattierung beim Kippen: die Seite zum Schwerpunkt hin wird dunkler
          const s0 = toPx(balK.pin);
          const sg = g.createLinearGradient(s0[0] - balK.dir[0] * 120, s0[1] - balK.dir[1] * 120, s0[0] + balK.dir[0] * 120, s0[1] + balK.dir[1] * 120);
          sg.addColorStop(0, `rgba(255,255,255,${0.25 * balK.shade})`);
          sg.addColorStop(1, `rgba(0,0,0,${0.3 * balK.shade})`);
          g.fillStyle = sg;
          g.fill();
        }
      } else {
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.07 : 0.04);
        g.fill();
      }
      g.strokeStyle = theme.text;
      g.lineWidth = 2.6;
      g.lineJoin = 'round';
      g.stroke();
      g.restore();
      // Seitennamen a, b, c außen an den Seitenmitten
      if (!G.deg) {
        const cen: Px = [(px[0][0] + px[1][0] + px[2][0]) / 3, (px[0][1] + px[1][1] + px[2][1]) / 3];
        for (const i of IDX) {
          const [j, k] = others(i);
          const a = px[j];
          const b = px[k];
          const at = m === 'ms' || m === 'sh' ? 0.3 : 0.5;
          const mx = lerp(a[0], b[0], at);
          const my = lerp(a[1], b[1], at);
          let [nx, ny] = unit(-(b[1] - a[1]), b[0] - a[0]);
          if (nx * (cen[0] - mx) + ny * (cen[1] - my) > 0) {
            nx = -nx;
            ny = -ny;
          }
          g.save();
          g.font = `italic 600 ${fs(14, 13)}px ${theme.mathFont}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(SUB[i], mx + nx * 12, my + ny * 12);
          g.restore();
        }
      }
      if (G.deg) {
        if (balK) g.restore();
        drawVertices(px);
        fpill(P.x + P.w / 2, P.y + P.h - fs(30, 26), C('bad', say(L('✗ A, B und C liegen auf einer Geraden – kein Dreieck', '✗ A, B and C lie on one line – not a triangle'))), { border: withAlpha(col.bad(), 0.6) });
        return;
      }
      // Zirkelbögen und Konstruktionspunkte
      if (p.aux) {
        for (const a of st.arcs) {
          const c = toPx(a.c);
          const rpx = a.r * scale();
          g.save();
          g.strokeStyle = withAlpha(col.pencil(), 0.75);
          g.lineWidth = 1.4;
          g.lineCap = 'round';
          g.beginPath();
          g.arc(c[0], c[1], rpx, -rad(a.a0), -rad(a.a1), a.a1 > a.a0);
          g.stroke();
          g.restore();
        }
        // Liegt gerade Lineal oder Geodreieck auf dem Papier, kommen die Namen (z. B. M_a) erst danach, damit sie nicht verdeckt werden.
        labelsDeferred = !fast && !balK && !!(st.ruler || st.geo);
        for (const mk of st.marks) {
          if (mk.pop <= 0) continue;
          dot(toPx(mk.p), 2.6 * ease.outBack(clamp01(mk.pop)), col.pencil());
        }
        if (!labelsDeferred) drawMarkLabels(st);
      }
      // Radius beim Einstellen des Zirkels
      if (st.radius) {
        const c = toPx(st.radius.c);
        const u = dirW(st.radius.ang);
        const e = toPx([st.radius.c[0] + u[0] * st.radius.r, st.radius.c[1] + u[1] * st.radius.r]);
        g.save();
        g.globalAlpha *= st.radius.alpha;
        segment(c, e, modeCol(), 2, [5, 4]);
        const [nx, ny] = unit(-(e[1] - c[1]), e[0] - c[0]);
        const sgn = ny > 0 ? -1 : 1;
        haloText(st.radius.label, (c[0] + e[0]) / 2 + nx * 13 * sgn, (c[1] + e[1]) / 2 + ny * 13 * sgn, `italic 700 ${fs(15, 13.5)}px ${theme.mathFont}`, modeCol());
        g.restore();
      }
      // Linien
      if (m === 'eu') {
        drawFamily(G, st, 'sh', true);
        drawFamily(G, st, 'ms', true);
        drawFamily(G, st, 'h', true);
        drawAltitudeExt(G, st.pts.H, true);
      } else {
        drawFamily(G, st, m, false);
        if (m === 'h' && show) drawAltitudeExt(G, st.pts.H, false);
      }
      // Kreise
      if (show && st.circle > 0 && (m === 'ms' || m === 'wh')) {
        const c = m === 'ms' ? G.U! : G.W;
        const r = m === 'ms' ? G.R : G.rho;
        const a0 = m === 'ms' ? angTo(c, G.t[0]) : angTo(c, G.touch[2]);
        const pc = toPx(c);
        g.save();
        g.strokeStyle = modeCol();
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(pc[0], pc[1], r * scale(), -rad(a0), -rad(a0 + 360 * st.circle), true);
        g.stroke();
        if (st.circle >= 1) {
          g.fillStyle = withAlpha(modeCol(), theme.dark ? 0.07 : 0.045);
          g.beginPath();
          g.arc(pc[0], pc[1], r * scale(), 0, TAU);
          g.fill();
        }
        g.restore();
      }
      // Umkreis: Radien zu den Ecken (gleich lang)
      if (show && m === 'ms' && p.aux && st.circle >= 1) {
        const pu = toPx(G.U!);
        px.forEach((q) => {
          segment(pu, q, withAlpha(col.ms(), 0.75), 1.6, [6, 5]);
          const d = unit(q[0] - pu[0], q[1] - pu[1]);
          const mx = (pu[0] + q[0]) / 2;
          const my = (pu[1] + q[1]) / 2;
          haloText('r', mx - d[1] * 11, my + d[0] * 11, `italic 700 ${fs(14, 13)}px ${theme.mathFont}`, col.ms());
        });
        // rechtwinklig: Thaleskreis, U ist Mitte der Hypotenuse
        if (G.kd === 'recht') {
          const [j, k] = others(G.big);
          const a = toPx(G.t[j]);
          const b = toPx(G.t[k]);
          segment(a, b, withAlpha(col.ms(), 0.9), 4);
        }
      }
      // Inkreis: Lote auf die Seiten mit rechten Winkeln
      if (show && m === 'wh' && st.lote > 0) {
        const pw = toPx(G.W);
        G.touch.forEach((q, i) => {
          const pq = toPx(q);
          const k = clamp01(st.lote * 1.6 - i * 0.3);
          if (k <= 0) return;
          const e: Px = [lerp(pw[0], pq[0], k), lerp(pw[1], pq[1], k)];
          segment(pw, e, withAlpha(col.wh(), 0.85), 1.7, [6, 5]);
          if (k >= 1) {
            const [j] = others(i as Idx);
            const a = px[j];
            if (p.aux) rightMark(pq, unit(a[0] - pq[0], a[1] - pq[1]), unit(pw[0] - pq[0], pw[1] - pq[1]), col.wh(), fs(9, 8), 1);
            dot(pq, 2.8, col.wh());
            const d = unit(pq[0] - pw[0], pq[1] - pw[1]);
            haloText('ρ', (pw[0] + pq[0]) / 2 - d[1] * 10, (pw[1] + pq[1]) / 2 + d[0] * 10, `italic 700 ${fs(14, 13)}px ${theme.mathFont}`, col.wh());
          }
        });
      }
      // Schwerpunkt: Teilung 2 : 1 als Perlen (drei gleich lange Stücke)
      if (show && m === 'sh' && st.ratio > 0) {
        IDX.forEach((i, n) => {
          const k = clamp01(st.ratio * 1.6 - n * 0.3);
          if (k <= 0) return;
          const v = px[i];
          const mm = toPx(G.mids[i]);
          const d = unit(mm[0] - v[0], mm[1] - v[1]);
          for (const q of [1 / 3, 2 / 3, 1]) {
            const c: Px = [lerp(v[0], mm[0], q - 1 / 6), lerp(v[1], mm[1], q - 1 / 6)];
            g.save();
            g.globalAlpha *= k;
            ticks(c[0], c[1], d, 1, col.sh(), 4.5 * ease.outBack(k));
            g.restore();
          }
          dot([lerp(v[0], mm[0], 1 / 3), lerp(v[1], mm[1], 1 / 3)], 3.2 * ease.outBack(k), col.sh());
        });
      }
      // Euler-Gerade
      if (m === 'eu' && show && st.euler > 0 && G.H && G.U && !G.eq) {
        const [e0, e1] = clipLine(G.H, G.U);
        const a = toPx(e0);
        const b = toPx(e1);
        const e: Px = [lerp(a[0], b[0], st.euler), lerp(a[1], b[1], st.euler)];
        segment(a, e, withAlpha(col.eu(), theme.dark ? 0.22 : 0.16), 10);
        segment(a, e, col.eu(), 2.6);
        if (st.ratio > 0) {
          const ph = toPx(G.H);
          const ps = toPx(G.S);
          const pu = toPx(G.U);
          const d = unit(pu[0] - ph[0], pu[1] - ph[1]);
          g.save();
          g.globalAlpha *= clamp01(st.ratio * 1.5);
          const mid: Px = [(ph[0] + ps[0]) / 2, (ph[1] + ps[1]) / 2];
          dot(mid, 3.2 * ease.outBack(clamp01(st.ratio)), col.eu());
          for (const [x0, x1] of [
            [ph, mid],
            [mid, ps],
            [ps, pu],
          ] as [Px, Px][])
            ticks((x0[0] + x1[0]) / 2, (x0[1] + x1[1]) / 2, d, 1, col.eu(), 5);
          g.restore();
        }
      }
      // Symmetrieachse (gleichschenklig)
      const fin = finished();
      if (show && fin && G.iso !== null && !G.eq) {
        const apex = G.t[G.iso];
        const [e0, e1] = clipLine(apex, G.mids[G.iso]);
        segment(toPx(e0), toPx(e1), withAlpha(th().muted, 0.7), 1.3, [2, 5]);
      }
      // besondere Punkte
      const avoid: Px[] = [...px];
      if (show) {
        if (m === 'eu') {
          const order: PKey[] = ['S', 'U', 'H', 'W'];
          for (const k of order) {
            const q = k === 'U' ? G.U : k === 'H' ? G.H : k === 'S' ? G.S : G.W;
            if (!q) continue;
            // gleichseitig: nur ein Punkt mit gemeinsamem Namen
            if (G.eq && k !== 'S') continue;
            const others2 = order.filter((o) => o !== k).map((o) => (o === 'U' ? G.U : o === 'H' ? G.H : o === 'S' ? G.S : G.W)).filter((z): z is Pt => !!z).map(toPx);
            const r = specialPoint(q, G.eq ? `${PN.U} = ${PN.W} = S = H` : PN[k], k === 'W' ? (G.eq ? pkCol('W') : withAlpha(th().muted, 1)) : pkCol(k), st.pts[k], [...avoid, ...others2], k === 'W' && !G.eq);
            if (r) avoid.push(r);
          }
        } else {
          const k = FAM_POINT[m];
          const q = k === 'U' ? G.U : k === 'H' ? G.H : k === 'S' ? G.S : G.W;
          if (q) specialPoint(q, PN[k], pkCol(k), st.pts[k], avoid);
        }
      }
      drawVertices(px);
      if (balK) g.restore();
      // Balancieren: Nadel und Ergebnis
      if (balK) drawPin(balK);
      // Sonderfälle als Hinweisschild
      if (show && fin && !balK) {
        const pill = specialPill(G);
        if (pill) fpill(P.x + P.w / 2 + (regions().inset ? 0 : 0), P.y + P.h - fs(30, 26), pill.src, { border: withAlpha(pill.color, 0.6), size: fs(13, 12) });
      }

    }

    /** Messhinweis beim Halbieren einer Seite (über dem Lineal). */
    /** Namen der Konstruktionspunkte (Seitenmitten), außen neben dem Punkt. */
    let labelsDeferred = false;
    function drawMarkLabels(st: CState): void {
      const g = surface.g;
      const px = geom().t.map(toPx) as [Px, Px, Px];
      const cen: Px = [(px[0][0] + px[1][0] + px[2][0]) / 3, (px[0][1] + px[1][1] + px[2][1]) / 3];
      for (const mk of st.marks) {
        if (!mk.label || mk.pop <= 0.5) continue;
        const q = toPx(mk.p);
        const d = unit(q[0] - cen[0], q[1] - cen[1]);
        g.save();
        g.globalAlpha *= clamp01((mk.pop - 0.5) * 2);
        formulaAt(mk.label, q[0] + d[0] * 16, q[1] + d[1] * 16, fs(12.5, 11.5), th().muted, 650);
        g.restore();
      }
    }

    function drawNote(st: CState): void {
      const G = geom();
      if (st.note) {
        // auf die Seite gegenüber dem Lineal (das liegt bei ny > 0)
        const [j, kk] = others(IDX.find((i) => dist(G.mids[i], st.note!.p) < 1e-9) ?? 0);
        const a = toPx(G.t[j]);
        const b = toPx(G.t[kk]);
        let [nx, ny] = unit(-(b[1] - a[1]), b[0] - a[0]);
        if (ny < 0 || (Math.abs(ny) < 1e-6 && nx < 0)) {
          nx = -nx;
          ny = -ny;
        }
        const q = toPx(st.note.p);
        fpill(q[0] - nx * 26, q[1] - ny * 30, st.note.src, { align: Math.abs(nx) < 0.3 ? 'center' : nx < 0 ? 'left' : 'right', alpha: st.note.alpha, size: fs(12.5, 11.5), border: withAlpha(col.sh(), 0.5) });
      }
    }

    /** Hinweis für Sonderfälle (eine Zeile unten auf dem Papier). */
    function specialPill(G: Geom): { src: string; color: string } | null {
      const m = mode();
      const c = (k: string, s: string) => ({ src: C(k, s), color: famCol(k as Fam) });
      // Schmales Papier (Handy): kurze Fassung, damit das Schild nicht abgeschnitten wird.
      const P = regions().paper;
      const narrow = P.w < 480;
      const T = (long: Txt, short: Txt) => say(narrow ? short : long);
      if (G.eq) return c(m === 'eu' ? 'eu' : m, T(L(`gleichseitig: ${PN.U} = ${PN.W} = ${PN.S} = ${PN.H} – alle Linien sind Symmetrieachsen`, `equilateral: U = I = S = H – every line is a line of symmetry`), L(`gleichseitig: ${PN.U} = ${PN.W} = ${PN.S} = ${PN.H}`, 'equilateral: U = I = S = H')));
      if (G.kd === 'recht') {
        const v = VN[G.big];
        const [j, k] = others(G.big);
        if (m === 'ms') return c('ms', T(L(`rechtwinklig bei ${v}: U ist die Mitte der Hypotenuse [${VN[j]}${VN[k]}] (Thaleskreis)`, `right angle at ${v}: U is the midpoint of the hypotenuse ${VN[j]}${VN[k]} (Thales circle)`), L(`rechtwinklig: U = Mitte von [${VN[j]}${VN[k]}]`, `right angle: U = midpoint of ${VN[j]}${VN[k]}`)));
        if (m === 'h') return c('h', T(L(`rechtwinklig bei ${v}: H = ${v}, die Katheten sind selbst Höhen`, `right angle at ${v}: H = ${v}, the legs are altitudes themselves`), L(`rechtwinklig bei ${v}: H = ${v}`, `right angle at ${v}: H = ${v}`)));
        if (m === 'eu') return c('eu', say(L(`rechtwinklig: H = ${v}, U = Mitte von [${VN[j]}${VN[k]}]`, `right angle: H = ${v}, U = midpoint of ${VN[j]}${VN[k]}`)));
      }
      if (G.kd === 'stumpf') {
        // Sehr stumpf: Der Punkt liegt so weit weg, dass er nicht mehr auf dem Papier zu sehen ist.
        const off = (q: Pt | null) => {
          if (!q) return false;
          const [x, y] = toPx(q);
          return x < P.x || x > P.x + P.w || y < P.y || y > P.y + P.h;
        };
        if (m === 'ms')
          return c('ms', off(G.U) ? T(L('stumpfwinklig: U liegt weit außerhalb, nicht mehr im Bild', 'obtuse: U lies far outside, beyond the picture'), L('stumpfwinklig: U nicht mehr im Bild', 'obtuse: U beyond the picture')) : T(L('stumpfwinklig: U liegt außerhalb des Dreiecks', 'obtuse: U lies outside the triangle'), L('stumpfwinklig: U liegt außerhalb', 'obtuse: U lies outside')));
        if (m === 'h')
          return c('h', off(G.H) ? T(L('stumpfwinklig: H liegt weit außerhalb, nicht mehr im Bild', 'obtuse: H lies far outside, beyond the picture'), L('stumpfwinklig: H nicht mehr im Bild', 'obtuse: H beyond the picture')) : T(L('stumpfwinklig: H liegt außerhalb – Seiten und Höhen verlängern', 'obtuse: H lies outside – extend sides and altitudes'), L('stumpfwinklig: H liegt außerhalb', 'obtuse: H lies outside')));
        if (m === 'eu') return c('eu', T(L('stumpfwinklig: U und H liegen außerhalb, S immer innen', 'obtuse: U and H lie outside, S always inside'), L('stumpfwinklig: U und H außerhalb', 'obtuse: U and H outside')));
      }
      if (G.iso !== null) return { src: C('m', T(L(`gleichschenklig: alle besonderen Punkte liegen auf der Symmetrieachse durch ${VN[G.iso]}`, `isosceles: all special points lie on the line of symmetry through ${VN[G.iso]}`), L('gleichschenklig: Punkte auf der Symmetrieachse', 'isosceles: points on the line of symmetry'))), color: th().muted };
      return null;
    }

    function drawVertices(px: [Px, Px, Px]): void {
      const g = surface.g;
      const theme = th();
      const cx = (px[0][0] + px[1][0] + px[2][0]) / 3;
      const cy = (px[0][1] + px[1][1] + px[2][1]) / 3;
      const vc = col.vert();
      hits = hits.filter((h) => h.id !== 'v0' && h.id !== 'v1' && h.id !== 'v2');
      px.forEach((q, i) => {
        const id = `v${i}` as HitId;
        const active = hover === id || drag === i;
        if (!ctx.locked) {
          g.beginPath();
          g.arc(q[0], q[1], active ? 16 : 12.5, 0, TAU);
          g.fillStyle = withAlpha(vc, active ? 0.28 : 0.13);
          g.fill();
          hits.push({ id, x: q[0], y: q[1], r: isWide() ? 18 : 22 });
        }
        g.beginPath();
        g.arc(q[0], q[1], 5, 0, TAU);
        g.fillStyle = paperColor();
        g.fill();
        g.strokeStyle = vc;
        g.lineWidth = 2.6;
        g.stroke();
        const [ux, uy] = unit(q[0] - cx, q[1] - cy);
        labelIn(VN[i]!, q[0] + ux * 20, q[1] + uy * 20, font(800, fs(15, 13.5)), theme.text);
      });
    }

    /* ---------- Balancieren (Pappdreieck auf einer Nadel) ---------- */
    const BAL_DUR = 2500;
    interface BalK {
      m: [number, number, number, number, number, number];
      pin: Pt;
      dir: Px;
      pop: number;
      lift: number;
      shade: number;
      ok: boolean;
      msg: number;
    }
    function balanceState(now: number): BalK | null {
      if (!bal || mode() !== 'sh') return null;
      const G = geom();
      const el = now - bal.t0;
      const k = Math.floor(el / BAL_DUR);
      if (k >= bal.pins.length) {
        bal = null;
        return null;
      }
      const tt = el - k * BAL_DUR;
      const pin = bal.pins[k]!;
      const tp = tipping(G.t, pin, 0.2);
      const pp = toPx(pin);
      const sp = toPx(G.S);
      const dir: Px = tp.balanced ? [1, 0] : unit(sp[0] - pp[0], sp[1] - pp[1]);
      const pop = clamp01(tt / 350);
      let theta = 0;
      if (!tp.balanced) {
        if (tt > 350 && tt < 1500) theta = rad(58) * ease.inCubic((tt - 350) / 1150);
        else if (tt >= 1500 && tt < 2050) theta = rad(58);
        else if (tt >= 2050) theta = rad(58) * (1 - ease.outCubic((tt - 2050) / 450));
      } else if (tt > 350) {
        const s = (tt - 350) / 1000;
        theta = rad(6) * Math.exp(-3 * s) * Math.sin(s * 14);
      }
      const c = Math.cos(theta);
      const q = 1 - c;
      const a = 1 - q * dir[0] * dir[0];
      const b = -q * dir[0] * dir[1];
      const d = 1 - q * dir[1] * dir[1];
      const e = pp[0] - (a * pp[0] + b * pp[1]);
      const f = pp[1] - (b * pp[0] + d * pp[1]);
      return { m: [a, b, b, d, e, f], pin, dir, pop, lift: Math.abs(Math.sin(theta)), shade: Math.sin(Math.abs(theta)) * (tp.balanced ? 0.4 : 1), ok: tp.balanced, msg: clamp01((tt - 600) / 300) * (tt > BAL_DUR - 250 ? (BAL_DUR - tt) / 250 : 1) };
    }
    function drawPin(b: BalK): void {
      const g = surface.g;
      const q = toPx(b.pin);
      const sc = ease.outBack(b.pop);
      const color = b.ok ? col.ok() : col.bad();
      g.save();
      g.globalAlpha *= clamp01(b.pop * 2);
      // Nadel von schräg oben gesehen: Kopf, Schaft, Spitze im Auflagepunkt
      const head: Px = [q[0] + 16 * sc, q[1] + 30 * sc];
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.3)';
      g.shadowBlur = 6;
      g.shadowOffsetX = 3;
      g.shadowOffsetY = 3;
      segment(head, q, th().dark ? '#d3d9e2' : '#5b6574', 2.4);
      g.restore();
      const hg = g.createRadialGradient(head[0] - 2, head[1] - 2, 1, head[0], head[1], 7);
      hg.addColorStop(0, '#ffffff');
      hg.addColorStop(1, th().dark ? '#9aa4b1' : '#6b7686');
      g.fillStyle = hg;
      g.beginPath();
      g.arc(head[0], head[1], 6 * sc, 0, TAU);
      g.fill();
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(q[0], q[1], 7 + (1 - b.pop) * 10, 0, TAU);
      g.stroke();
      dot(q, 2.6, color);
      g.restore();
      if (b.msg > 0) {
        const P = regions().paper;
        const msg = b.ok ? C('ok', say(L('✓ balanciert – die Nadel steht im Schwerpunkt S', '✓ balances – the pin is at the centroid S'))) : C('bad', say(L('✗ kippt – die Nadel steht nicht im Schwerpunkt', '✗ tips over – the pin is not at the centroid')));
        fpill(P.x + P.w / 2, P.y + P.h - fs(30, 26), msg, { alpha: b.msg, border: withAlpha(color, 0.6) });
      }
    }
    function startBalance(pins: Pt[]): void {
      if (reduced) {
        bal = null;
        return;
      }
      bal = { t0: performance.now(), pins };
      ctx.requestRender();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    interface Intro {
      panel: number;
      cards: number;
    }
    type CardFn = (R: Rect, measure: boolean) => number;

    function card(r: Rect, accent?: string): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      if (accent) {
        const grad = g.createLinearGradient(r.x, r.y, r.x, r.y + Math.min(80, r.h));
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.14 : 0.08));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
        g.fill();
      }
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }
    function cardTitle(R: Rect, title: string, color: string, right?: string, rightColor?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      const rb = right ? formula(g, right, fstyle(fs(12.5, 11.5), rightColor ?? color, 700)) : null;
      const room0 = R.w - 2 * pad - 15 - (rb ? rb.w + 10 : 0);
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shownT = title;
      while (g.measureText(shownT).width > room0 && shownT.length > 4) shownT = `${shownT.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shownT, R.x + pad + 15, ty);
      if (rb) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      return ty;
    }
    /** Fließtext mit Formelteilen umbrechen (Wörter mit \c{…}{…} bleiben zusammen). */
    function richWrap(src: string, maxW: number, size: number, color: string, weight: number): { boxes: FormulaBox[]; w: number }[] {
      const g = surface.g;
      src = src
        .replace(/ (cm|°)/g, ' $1')
        .replace(/\\c\{(\w+)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_m, k: string, inner: string) =>
          inner
            .replace(/ = /g, ' = ')
            .replace(/ ≈ /g, ' ≈ ')
            .split(' ')
            .filter(Boolean)
            .map((w) => `\\c{${k}}{${w}}`)
            .join(' '),
        );
      const toks: string[] = [];
      let depth = 0;
      let cur = '';
      for (const ch of src) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
        if (ch === ' ' && depth === 0) {
          if (cur) toks.push(cur);
          cur = '';
        } else cur += ch;
      }
      if (cur) toks.push(cur);
      const space = size * 0.3;
      const lines: { boxes: FormulaBox[]; w: number }[] = [];
      let line: { boxes: FormulaBox[]; w: number } = { boxes: [], w: 0 };
      for (const t of toks) {
        const b = formula(g, t, fstyle(size, color, weight));
        const add = (line.boxes.length ? space : 0) + b.w;
        if (line.boxes.length && line.w + add > maxW) {
          lines.push(line);
          line = { boxes: [b], w: b.w };
        } else {
          line.boxes.push(b);
          line.w += add;
        }
      }
      if (line.boxes.length) lines.push(line);
      return lines;
    }
    function drawRich(lines: { boxes: FormulaBox[] }[], x: number, y: number, lh: number, size: number): void {
      const g = surface.g;
      lines.forEach((ln, i) => {
        let cx = x;
        for (const b of ln.boxes) {
          b.draw(g, cx, y + i * lh + size * 0.36);
          cx += b.w + size * 0.3;
        }
      });
    }
    function wrapText(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const words = str.split(' ');
      const rows: string[] = [];
      let cur = '';
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    function button(r: Rect, label: string, id: HitId, color: string, filled: boolean, enabled: boolean, srLabel = label): void {
      const g = surface.g;
      const hov = hover === id && enabled;
      g.save();
      if (!enabled) g.globalAlpha *= 0.45;
      if (filled) {
        g.save();
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.4)' : withAlpha(color, 0.35);
        g.shadowBlur = hov ? 10 : 6;
        g.shadowOffsetY = 2;
        const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
        grad.addColorStop(0, mixColor(color, '#ffffff', hov ? 0.22 : 0.12));
        grad.addColorStop(1, color);
        g.fillStyle = grad;
        roundRect(g, r.x, r.y, r.w, r.h, r.h / 2);
        g.fill();
        g.restore();
      } else {
        g.fillStyle = withAlpha(color, hov ? 0.18 : th().dark ? 0.12 : 0.08);
        roundRect(g, r.x, r.y, r.w, r.h, r.h / 2);
        g.fill();
        g.strokeStyle = withAlpha(color, 0.6);
        g.lineWidth = 1.3;
        g.stroke();
      }
      g.font = font(700, fs(12.5, 12));
      g.fillStyle = filled ? onColor() : color;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 0.5);
      g.restore();
      if (enabled) buttons.push({ id, r, label: srLabel });
    }

    const stepsTitle = (): string => {
      const m = mode();
      if (m === 'ms') return say(L('Umkreis konstruieren', 'Constructing the circumcircle'));
      if (m === 'wh') return say(L('Inkreis konstruieren', 'Constructing the incircle'));
      if (m === 'sh') return say(L('Schwerpunkt konstruieren', 'Constructing the centroid'));
      if (m === 'h') return say(L('Höhenschnittpunkt konstruieren', 'Constructing the orthocentre'));
      return say(L('Vier Punkte, eine Gerade?', 'Four points, one line?'));
    };

    /** Konstruktionsbeschreibung: Zeilen erscheinen passend zum Schritt, mit Knöpfen. */
    function stepsCard(now: number, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const list = steps();
        const n = list.length;
        const done = finished();
        const size = fs(13, 12);
        const lh = size * 1.42;
        const numW = fs(24, 22);
        const textW = R.w - 2 * pad - numW - 16;
        const wrapped = list.map((st) => richWrap(st.src, textW, size, theme.text, 550));
        const heights = wrapped.map((w) => w.length * lh + 8);
        const btnH = ctx.locked ? 0 : 30;
        const head = 38;
        const foot = ctx.locked ? 10 : btnH + fs(22, 18);
        const natural = head + heights.reduce((s, h) => s + h, 0) + foot;
        if (measure) return natural;
        const accent = modeCol();
        const okColor = col.ok();
        card(R, done ? okColor : accent);
        cardTitle(R, stepsTitle(), accent, stepIdx > 0 ? `${Math.min(stepIdx, n)} / ${n}` : `${n} ${say(L('Schritte', 'steps'))}`, theme.muted);
        const top = R.y + head;
        const btnY = R.y + R.h - btnH - fs(12, 10);
        const avail = (ctx.locked ? R.y + R.h - 8 : btnY - 6) - top;
        g.save();
        g.globalAlpha *= ease.outCubic(k.cards);
        if (stepIdx === 0) {
          const msg = say(L('Mit „Nächster Schritt“ entsteht die Konstruktion Zeile für Zeile – wie im Heft.', 'Press “Next step” and the construction appears line by line – like in your exercise book.'));
          const rows = richWrap(msg, R.w - 2 * pad, size, theme.muted, 550);
          drawRich(rows, R.x + pad, top + 8, lh, size);
          const y0 = top + rows.length * lh + 18;
          g.strokeStyle = withAlpha(theme.text, 0.12);
          g.lineWidth = 1;
          for (let i = 0; i < n && y0 + i * lh * 1.1 < top + avail; i++) {
            const yy = y0 + i * lh * 1.1;
            g.fillStyle = withAlpha(theme.text, 0.25);
            g.font = font(700, size);
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            g.fillText(`${i + 1}.`, R.x + pad, yy);
            g.beginPath();
            g.moveTo(R.x + pad + numW, yy + 5);
            g.lineTo(R.x + R.w - pad, yy + 5);
            g.stroke();
          }
        } else {
          const last = Math.min(stepIdx, n) - 1;
          let i0 = 0;
          const sum = (a: number, b: number) => heights.slice(a, b + 1).reduce((x, y) => x + y, 0);
          while (sum(i0, last) + (i0 > 0 ? lh : 0) > avail && i0 < last) i0++;
          let y = top;
          if (i0 > 0) {
            g.fillStyle = theme.muted;
            g.font = font(650, fs(12, 11));
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            const lbl = i0 === 1 ? `1. ✓ ${say(L('erledigt', 'done'))}` : `1.–${i0}. ✓ ${say(L('erledigt', 'done'))}`;
            g.fillText(lbl, R.x + pad, y + size * 0.3);
            y += lh;
          }
          const prog = stepProgress(now);
          for (let i = i0; i <= last; i++) {
            const rows = wrapped[i]!;
            if (y + rows.length * lh > top + avail + 4) break;
            const isCur = i === stepIdx - 1;
            const appear = isCur ? ease.outCubic(clamp01(prog * 4)) : 1;
            const isEnd = i === n - 1 && done;
            g.save();
            g.globalAlpha *= appear;
            if (isCur || isEnd) {
              g.fillStyle = withAlpha(isEnd ? okColor : accent, theme.dark ? 0.16 : 0.08);
              roundRect(g, R.x + pad - 6, y - 4, R.w - 2 * pad + 12, rows.length * lh + 6, 8);
              g.fill();
              if (isCur && !done) {
                g.fillStyle = accent;
                roundRect(g, R.x + pad - 6, y - 4, 3, rows.length * lh + 6, 1.5);
                g.fill();
              }
            }
            g.fillStyle = isCur ? accent : theme.muted;
            g.font = font(800, size);
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            g.fillText(`${i + 1}.`, R.x + pad, y + size * 0.42);
            drawRich(rows, R.x + pad + numW + (1 - appear) * 10, y, lh, size);
            if (!isCur || done) {
              g.fillStyle = withAlpha(okColor, 0.9);
              g.font = font(800, 11);
              g.textAlign = 'right';
              g.fillText('✓', R.x + R.w - pad + 2, y + size * 0.42);
            }
            g.restore();
            y += heights[i]!;
          }
        }
        g.restore();
        if (!ctx.locked) {
          g.font = font(700, fs(12.5, 12));
          const nextLabel = done ? say(L('Neu konstruieren', 'Construct again')) : say(L('Nächster Schritt', 'Next step'));
          const nextW = g.measureText(nextLabel).width + 30;
          const rl = say(L('Von vorn', 'Start again'));
          const roomy = g.measureText(rl).width + 26 + nextW + 10 <= R.w - 2 * pad;
          const restartW = roomy ? g.measureText(rl).width + 26 : btnH;
          button({ x: R.x + R.w - pad - nextW, y: btnY, w: nextW, h: btnH }, nextLabel, 'next', accent, true, !stepRunning(now) && !autoPlay);
          if (stepIdx > 0) button({ x: R.x + pad, y: btnY, w: restartW, h: btnH }, roomy ? rl : '↺', 'restart', theme.muted, false, true, rl);
          const dotsX0 = R.x + pad + (stepIdx > 0 ? restartW + 12 : 0);
          const dotsX1 = R.x + R.w - pad - nextW - 12;
          const gapD = Math.min(14, (dotsX1 - dotsX0) / Math.max(1, n));
          if (gapD >= 8) {
            const x0 = (dotsX0 + dotsX1) / 2 - ((n - 1) * gapD) / 2;
            for (let i = 0; i < n; i++) {
              const filled = i < stepIdx;
              g.fillStyle = filled ? (done ? okColor : accent) : withAlpha(theme.text, 0.18);
              g.beginPath();
              g.arc(x0 + i * gapD, btnY + btnH / 2, i === stepIdx - 1 && !done ? 4 : 3, 0, TAU);
              g.fill();
            }
          }
        }
        return R.h;
      };
    }

    /** Begründung: Formelzeilen und Messbalken. */
    interface Bar {
      name: string;
      parts: number[];
      label: string;
      color: string;
    }
    interface Info {
      title: string;
      accent: string;
      right: string;
      rows: { src: string; size?: number; color?: string; weight?: number }[];
      bars: Bar[];
    }
    function resultInfo(): Info {
      const G = geom();
      const m = mode();
      const mc = modeCol();
      const sz = fs(13, 12);
      const small = fs(12, 11);
      const mu = (s: string) => C('m', s);
      if (G.deg) return { title: say(L('Kein Dreieck', 'Not a triangle')), accent: col.bad(), right: '', rows: [{ src: mu(say(L('Ziehe eine Ecke von der Geraden weg.', 'Drag a vertex off the line.'))), size: small }], bars: [] };
      if (!p.pt) {
        const q: Record<Mode, Txt> = {
          ms: L('Gibt es einen Punkt, der von A, B und C gleich weit entfernt ist?', 'Is there a point that is equally far from A, B and C?'),
          wh: L('Gibt es einen Punkt, der von allen drei Seiten gleich weit entfernt ist?', 'Is there a point that is equally far from all three sides?'),
          sh: L('Wo müsste eine Nadel stehen, damit das Dreieck aus Pappe nicht kippt?', 'Where would a pin have to be so that the cardboard triangle does not tip over?'),
          h: L('Treffen sich die drei Höhen – oder ihre Verlängerungen?', 'Do the three altitudes – or their extensions – meet?'),
          eu: L('Liegen drei der Schnittpunkte auf einer Geraden?', 'Do three of the points lie on one line?'),
        };
        return {
          title: say(L('Was fällt dir auf?', 'What do you notice?')),
          accent: mc,
          right: '',
          rows: [
            { src: say(q[m]), size: sz, weight: 650 },
            { src: mu(say(L('Ziehe die Ecken und beobachte. Schalte dann „Schnittpunkt und Kreis zeigen“ ein.', 'Drag the vertices and watch. Then switch on “Show the point and the circle”.'))), size: small },
          ],
          bars: [],
        };
      }
      const t = G.t;
      const n2 = (v: number) => fmt.num(v, 2);
      if (m === 'ms') {
        const U = G.U!;
        return {
          title: say(L('Gleich weit von den Ecken', 'Equally far from the vertices')),
          accent: mc,
          right: C('ms', `r ≈ ${cm(G.R)}`),
          rows: [
            { src: `${PT('U')} ${say(L('auf', 'on'))} ${LN('ms', 2)}: \\o{UA} = \\o{UB}`, size: sz },
            { src: `${PT('U')} ${say(L('auf', 'on'))} ${LN('ms', 0)}: \\o{UB} = \\o{UC}`, size: sz },
            { src: `⇒ \\o{UA} = \\o{UC}: ${PT('U')} ${say(L('liegt auch auf', 'also lies on'))} ${LN('ms', 1)}.`, size: sz },
          ],
          bars: IDX.map((i) => ({ name: `\\o{U${VN[i]}}`, parts: [dist(U, t[i])], label: cm(dist(U, t[i]), 2), color: col.ms() })),
        };
      }
      if (m === 'wh') {
        return {
          title: say(L('Gleich weit von den Seiten', 'Equally far from the sides')),
          accent: mc,
          right: C('wh', `ρ ≈ ${cm(G.rho)}`),
          rows: [
            { src: `${PT('W')} ${say(L('auf', 'on'))} ${LN('wh', 0)}: ${say(L('gleich weit von', 'equally far from'))} b ${say(L('und', 'and'))} c`, size: sz },
            { src: `${PT('W')} ${say(L('auf', 'on'))} ${LN('wh', 1)}: ${say(L('gleich weit von', 'equally far from'))} a ${say(L('und', 'and'))} c`, size: sz },
            { src: `⇒ ${say(L('gleich weit von a und b', 'equally far from a and b'))}: ${PT('W')} ${say(L('liegt auch auf', 'also lies on'))} ${LN('wh', 2)}.`, size: sz },
          ],
          bars: IDX.map((i) => ({ name: `${say(L('zu', 'to'))} ${SUB[i]}`, parts: [dist(G.W, G.touch[i])], label: cm(dist(G.W, G.touch[i]), 2), color: col.wh() })),
        };
      }
      if (m === 'sh') {
        const parts = medianParts(t);
        return {
          title: say(L('Teilung im Verhältnis 2 : 1', 'Division in the ratio 2 : 1')),
          accent: mc,
          right: C('sh', '2 : 1'),
          rows: [
            { src: `${PT('S')} = ((x_A + x_B + x_C) : 3 | (y_A + y_B + y_C) : 3)`, size: small },
            { src: `= ((${n2(t[0][0])} + ${n2(t[1][0])} + ${n2(t[2][0])}) : 3 | (${n2(t[0][1])} + ${n2(t[1][1])} + ${n2(t[2][1])}) : 3) ≈ ${C('sh', ptTxt(G.S))}`, size: small },
            ...(ctx.locked ? [] : [{ src: mu(say(L('Tippe auf die Pappe: Dort steht die Nadel.', 'Tap the card to put the pin there.'))), size: small }]),
          ],
          bars: IDX.map((i) => ({ name: `s_${SUB[i]}`, parts: parts[i]!, label: `${fmt.num(parts[i]![0], 2)} : ${fmt.num(parts[i]![1], 2)}`, color: col.sh() })),
        };
      }
      if (m === 'h') {
        const hh = altitudes(t);
        const rows: Info['rows'] = [{ src: `\\f{1}{2}·a·h_a = \\f{1}{2}·b·h_b = \\f{1}{2}·c·h_c = A ≈ ${fmt.num(G.area, 1)} cm²`, size: small }];
        if (G.kd === 'stumpf') rows.push({ src: C('h', say(L('stumpfwinklig: Zwei Höhen treffen nur die Verlängerungen der Seiten.', 'obtuse: two altitudes only meet the extended sides.'))), size: small });
        else if (G.kd === 'recht') rows.push({ src: C('h', say(L(`rechtwinklig: Die Katheten sind Höhen, H = ${VN[G.big]}.`, `right-angled: the legs are altitudes, H = ${VN[G.big]}.`))), size: small });
        else rows.push({ src: mu(say(L('Jede Höhe steht senkrecht auf ihrer Seite.', 'Each altitude is perpendicular to its side.'))), size: small });
        return {
          title: say(L('Höhen und Flächeninhalt', 'Altitudes and area')),
          accent: mc,
          right: '',
          rows,
          bars: IDX.map((i) => ({ name: `h_${SUB[i]}`, parts: [hh[i]!], label: cm(hh[i]!, 2), color: col.h() })),
        };
      }
      // Euler
      if (G.eq) {
        return {
          title: say(L('Gleichseitiges Dreieck', 'Equilateral triangle')),
          accent: col.eu(),
          right: '',
          rows: [
            { src: `${PT('U')} = ${PT('W')} = ${PT('S')} = ${PT('H')}`, size: sz, weight: 700 },
            { src: mu(say(L('Alle besonderen Punkte fallen zusammen – es gibt keine Euler-Gerade.', 'All special points coincide – there is no Euler line.'))), size: small },
          ],
          bars: [],
        };
      }
      const e = euler(t)!;
      return {
        title: say(L('Euler-Gerade', 'Euler line')),
        accent: col.eu(),
        right: C('eu', '2 : 1'),
        rows: [
          { src: `${C('eu', `\\o{HS} ≈ ${cm(e.hs, 2)}`)} = 2 · ${C('eu', `\\o{SU} ≈ 2 · ${cm(e.su, 2)}`)}`, size: sz },
          { src: `${PT('H')} ${ptTxt(e.h)}, ${PT('S')} ${ptTxt(e.s)}, ${PT('U')} ${ptTxt(e.u)}`, size: small },
          { src: mu(say(L(`${PN.W} liegt nur im gleichschenkligen Dreieck auf dieser Geraden.`, `${PN.W} only lies on this line in an isosceles triangle.`))), size: small },
        ],
        bars: [{ name: 'H–S–U', parts: [e.hs, e.su], label: `${fmt.num(e.hs, 2)} : ${fmt.num(e.su, 2)}`, color: col.eu() }],
      };
    }

    function resultCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const pad = fs(14, 12);
        const info = resultInfo();
        const maxW = R.w - 2 * pad;
        const boxes = info.rows.map((r) => {
          let size = r.size ?? fs(13, 12);
          let b = formula(g, r.src, fstyle(size, r.color ?? th().text, r.weight ?? 600));
          const size0 = size;
          while (b.w > maxW && size > Math.max(11, size0 * 0.9)) {
            size -= 0.5;
            b = formula(g, r.src, fstyle(size, r.color ?? th().text, r.weight ?? 600));
          }
          if (b.w > maxW) size = size0;
          return { b, wrapped: b.w > maxW ? richWrap(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600) : null, size };
        });
        const rowH = (i: number) => {
          const x = boxes[i]!;
          return x.wrapped ? x.wrapped.length * x.size * 1.35 + 6 : Math.max(x.b.asc + x.b.desc, 15) + 7;
        };
        const barH = fs(23, 21);
        const h = 40 + info.rows.reduce((s, _, i) => s + rowH(i), 0) + (info.bars.length ? info.bars.length * barH + 6 : 0) + 4;
        if (measure) return h;
        card({ ...R, h }, info.accent);
        cardTitle(R, info.title, info.accent, info.right || undefined);
        let y = R.y + 40;
        boxes.forEach((x, i) => {
          g.save();
          g.globalAlpha *= ease.outCubic(clamp01(k.cards * (info.rows.length + 2) - i));
          if (x.wrapped) drawRich(x.wrapped, R.x + pad, y, x.size * 1.35, x.size);
          else x.b.draw(g, R.x + pad, y + x.b.asc);
          g.restore();
          y += rowH(i);
        });
        if (info.bars.length) {
          y += 2;
          g.font = font(650, fs(12.5, 11.5));
          const valW = Math.max(...info.bars.map((b) => g.measureText(b.label).width)) + 10;
          const names = info.bars.map((b) => formula(g, b.name, fstyle(fs(13, 12), b.color, 700)));
          const nameW = Math.max(...names.map((b) => b.w)) + 10;
          const barW = Math.max(20, R.w - 2 * pad - nameW - valW);
          const maxV = Math.max(...info.bars.map((b) => b.parts.reduce((a, c) => a + c, 0)), 0.1);
          info.bars.forEach((b, i) => {
            const yy = y + barH / 2;
            const nb = names[i]!;
            nb.draw(g, R.x + pad, yy + (nb.asc - nb.desc) / 2);
            let x = R.x + pad + nameW;
            const bh = fs(10, 9);
            const grow = ease.outCubic(clamp01(k.cards * 2 - 0.4 - i * 0.15));
            b.parts.forEach((v, kk) => {
              const bw = Math.max(3, (v / maxV) * barW * grow - (kk ? 0 : 2));
              g.fillStyle = kk === 0 ? b.color : withAlpha(b.color, 0.42);
              roundRect(g, x, yy - bh / 2, bw, bh, bh / 2);
              g.fill();
              x += bw + 2;
            });
            g.font = font(650, fs(12.5, 11.5));
            g.fillStyle = th().text;
            g.textAlign = 'right';
            g.textBaseline = 'middle';
            g.fillText(b.label, R.x + R.w - pad, yy);
            y += barH;
          });
        }
        return h;
      };
    }

    /** „Wo liegt der Punkt?“: drei kleine Dreiecke (spitz-, recht-, stumpfwinklig); im Euler-Modus eine Legende. */
    function whereCard(k: Intro): CardFn {
      return (R, measure) => {
        const h = INSET_H;
        if (measure) return h;
        const g = surface.g;
        const theme = th();
        const m = mode();
        const pad = fs(12, 11);
        const G = geom();
        card({ ...R, h }, m === 'eu' ? col.eu() : modeCol());
        if (m === 'eu') {
          cardTitle(R, say(L('Vier besondere Punkte', 'Four special points')), col.eu());
          const rows: [PKey, Txt][] = [
            ['U', L('Mittelsenkrechten', 'perp. bisectors')],
            ['W', L('Winkelhalbierende', 'angle bisectors')],
            ['S', L('Seitenhalbierende', 'medians')],
            ['H', L('Höhen', 'altitudes')],
          ];
          rows.forEach(([key, txt], i) => {
            const y = R.y + 42 + i * 19;
            g.save();
            g.globalAlpha *= ease.outCubic(clamp01(k.cards * 5 - i));
            dot([R.x + pad + 5, y], 4.5, pkCol(key));
            g.font = font(800, 12.5);
            g.fillStyle = pkCol(key);
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            g.fillText(PN[key], R.x + pad + 16, y);
            g.font = font(550, fs(12, 11));
            g.fillStyle = key === 'W' ? theme.muted : theme.text;
            g.fillText(say(txt), R.x + pad + 32, y);
            g.restore();
          });
          return h;
        }
        const key = FAM_POINT[m];
        cardTitle(R, say(L(`Wo liegt ${PN[key]}?`, `Where is ${PN[key]}?`)), modeCol());
        const color = pkCol(key);
        const top = 32;
        const lab = 30;
        const always = m === 'wh' || m === 'sh';
        const shapes: { k: Kind; v: Tri }[] = [
          { k: 'spitz', v: [[0, 0], [10, 0.6], [4.2, 7.5]] },
          { k: 'recht', v: [[0, 0], [9, 0], [0, 6]] },
          { k: 'stumpf', v: [[0, 0], [11, 0], [2.6, 2.6]] },
        ];
        const pointOf = (v: Tri): Pt => (key === 'U' ? circumcenter(v)! : key === 'W' ? incenter(v) : key === 'S' ? centroid(v) : orthocenter(v)!);
        const whereOf = (kk: Kind): string => {
          if (!p.pt) return '?';
          if (always || kk === 'spitz') return say(L('innen', 'inside'));
          if (kk === 'stumpf') return say(L('außen', 'outside'));
          return key === 'U' ? say(L('Seitenmitte', 'on a side')) : say(L('in der Ecke', 'at a vertex'));
        };
        const colW = (R.w - 2 * pad) / 3;
        const small = colW < 66;
        const ih = h - top - lab - 6;
        const cur = G.deg ? null : G.kd;
        shapes.forEach((sh, i) => {
          const cx = R.x + pad + colW * (i + 0.5);
          const isCur = sh.k === cur;
          g.save();
          g.globalAlpha *= ease.outCubic(clamp01(k.cards * 3 - i * 0.4));
          if (isCur) {
            g.fillStyle = withAlpha(color, theme.dark ? 0.16 : 0.09);
            roundRect(g, R.x + pad + colW * i + 2, R.y + top - 3, colW - 4, h - top - 4, 9);
            g.fill();
          }
          const q = pointOf(sh.v);
          const pts = p.pt ? [...sh.v, q] : [...sh.v];
          const x0 = Math.min(...pts.map((z) => z[0]));
          const x1 = Math.max(...pts.map((z) => z[0]));
          const y0 = Math.min(...pts.map((z) => z[1]));
          const y1 = Math.max(...pts.map((z) => z[1]));
          const sc = Math.min((colW - 14) / (x1 - x0), (ih - 6) / (y1 - y0));
          const cy = R.y + top + ih / 2;
          const mp = (z: Pt): Px => [cx + (z[0] - (x0 + x1) / 2) * sc, cy - (z[1] - (y0 + y1) / 2) * sc];
          g.beginPath();
          sh.v.map(mp).forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.fillStyle = isCur ? withAlpha(color, 0.12) : withAlpha(theme.text, 0.05);
          g.fill();
          g.strokeStyle = isCur ? theme.text : withAlpha(theme.text, 0.55);
          g.lineWidth = 1.5;
          g.lineJoin = 'round';
          g.stroke();
          if (p.pt) dot(mp(q), 3.2, isCur ? color : withAlpha(theme.text, 0.45));
          const kName = sh.k === 'spitz' ? say(L('spitz', 'acute')) : sh.k === 'recht' ? say(L('recht', 'right')) : say(L('stumpf', 'obtuse'));
          g.font = font(isCur ? 800 : 600, small ? 11 : 11.5);
          g.fillStyle = isCur ? theme.text : theme.muted;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(kName, cx, R.y + h - lab + 6);
          g.font = font(600, 11);
          g.fillStyle = isCur ? color : theme.muted;
          g.fillText(whereOf(sh.k), cx, R.y + h - lab + 20);
          g.restore();
        });
        return h;
      };
    }

    function merkeCard(k: Intro): CardFn {
      return (R, measure) => {
        const m = mode();
        const txt: Record<Mode, Txt> = {
          ms: L(
            'Jeder Punkt auf der Mittelsenkrechten einer Strecke ist von beiden Endpunkten gleich weit entfernt. Deshalb schneiden sich die drei Mittelsenkrechten in einem Punkt U – dem Mittelpunkt des Umkreises.',
            'Every point on the perpendicular bisector of a segment is equally far from both endpoints. That is why the three perpendicular bisectors meet at one point U – the centre of the circumcircle.',
          ),
          wh: L(
            'Jeder Punkt auf einer Winkelhalbierenden ist von beiden Schenkeln gleich weit entfernt. Deshalb schneiden sich die drei Winkelhalbierenden in einem Punkt W – dem Mittelpunkt des Inkreises (oft auch I genannt).',
            'Every point on an angle bisector is equally far from both arms. That is why the three angle bisectors meet at one point I – the centre of the incircle.',
          ),
          sh: L(
            'Eine Seitenhalbierende verbindet eine Ecke mit der Mitte der Gegenseite. Die drei Seitenhalbierenden schneiden sich im Schwerpunkt S; er teilt jede im Verhältnis 2 : 1. Dort lässt sich ein Pappdreieck balancieren.',
            'A median joins a vertex to the midpoint of the opposite side. The three medians meet at the centroid S, which divides each one in the ratio 2 : 1. A cardboard triangle balances there.',
          ),
          h: L(
            'Eine Höhe ist das Lot von einer Ecke auf die Gegenseite (oder ihre Verlängerung). Die drei Höhen schneiden sich in H. Warum? Die Parallelen zu den Seiten durch die Ecken bilden ein großes Dreieck – die Höhen von ABC sind seine Mittelsenkrechten.',
            'An altitude is the perpendicular from a vertex to the opposite side (or its extension). The three altitudes meet at H. Why? The parallels to the sides through the vertices form a big triangle – the altitudes of ABC are its perpendicular bisectors.',
          ),
          eu: L(
            'In jedem Dreieck liegen Höhenschnittpunkt H, Schwerpunkt S und Umkreismittelpunkt U auf einer Geraden, der Euler-Geraden (Leonhard Euler, 1765), und S teilt [HU] im Verhältnis 2 : 1.',
            'In every triangle the orthocentre H, the centroid S and the circumcentre U lie on one line, the Euler line (Leonhard Euler, 1765), and S divides HU in the ratio 2 : 1.',
          ),
        };
        const pad = fs(14, 12);
        const f = font(500, fs(12.5, 12));
        const lh = fs(17, 16);
        const rows = wrapText(say(txt[m]), R.w - 2 * pad, f);
        const h = 40 + rows.length * lh + 8;
        if (measure) return h;
        const g = surface.g;
        card({ ...R, h });
        cardTitle(R, say(L('Merke', 'Remember')), th().muted);
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.cards * 2 - 0.6));
        g.font = f;
        g.fillStyle = th().text;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        rows.forEach((row, i) => g.fillText(row, R.x + pad, R.y + 40 + lh / 2 + i * lh));
        g.restore();
        return h;
      };
    }

    function drawColumn(Col: Rect, now: number, k: Intro): void {
      const g = surface.g;
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const reg = regions();
      const st = stepsCard(now, k);
      const res = resultCard(k);
      const wh = whereCard(k);
      const mk = merkeCard(k);
      const resH = res(Col, true);
      const stepsNat = st(Col, true);
      const place = (i: number, fn: CardFn, R: Rect) => {
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        fn(R, false);
        g.restore();
      };
      buttons = [];
      let y = Col.y;
      let stepsH: number;
      if (reg.wide) {
        const mkH = mk(Col, true);
        const room = Col.h - resH - gap;
        stepsH = Math.min(stepsNat, room);
        // Merke-Karte nur, wenn die Konstruktionsbeschreibung trotzdem ganz Platz hat
        const withMerke = stepsNat + resH + mkH + 2 * gap <= Col.h;
        if (!withMerke) stepsH = room;
        place(0, st, { x: Col.x, y, w: Col.w, h: stepsH });
        y += stepsH + gap;
        place(1, res, { x: Col.x, y, w: Col.w, h: resH });
        y += resH + gap;
        if (withMerke) place(2, mk, { x: Col.x, y, w: Col.w, h: Col.y + Col.h - y });
        return;
      }
      const whH = INSET_H;
      const room = Col.h - resH - gap;
      const withWhere = stepsNat + resH + whH + 2 * gap <= Col.h || room - whH - gap >= 190;
      stepsH = withWhere ? Math.min(stepsNat, room - whH - gap) : Math.min(stepsNat, room);
      place(0, st, { x: Col.x, y, w: Col.w, h: stepsH });
      y += stepsH + gap;
      place(1, res, { x: Col.x, y, w: Col.w, h: resH });
      y += resH + gap;
      if (withWhere) {
        place(2, wh, { x: Col.x, y, w: Col.w, h: whH });
        y += whH + gap;
      }
      const mkH = mk(Col, true);
      if (y + mkH <= Col.y + Col.h + 1) place(3, mk, { x: Col.x, y, w: Col.w, h: mkH });
    }

    /* ---------- Rendern ---------- */
    function introState(now: number): Intro {
      if (intro === null) return { panel: 1, cards: 1 };
      const t = now - intro;
      if (t > 1600) {
        intro = null;
        return { panel: 1, cards: 1 };
      }
      return { panel: ease.outCubic(clamp01(t / 450)), cards: clamp01((t - 150) / 1100) };
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      if (surface.width !== lastSize.w || surface.height !== lastSize.h) {
        lastSize = { w: surface.width, h: surface.height };
        retargetView(true);
      }
      for (const c of vchans) if (c.step(now, dt)) anim = true;
      const n = nSteps();
      if (atEnd && stepIdx !== n) {
        stepIdx = n;
        stepStart = -Infinity;
      } else if (stepIdx > n) stepIdx = n;
      if (!dragging()) retargetView(false);
      for (const c of [VX, VY, VS]) if (c.step(now, dt)) anim = true;
      const k = introState(now);
      if (intro !== null) anim = true;
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      const st = constrState(now);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawPaper(R.paper);
      g.save();
      roundRect(g, R.paper.x, R.paper.y, R.paper.w, R.paper.h, 12);
      g.clip();
      drawFigure(now, st);
      if (!fast) {
        if (st.ruler) drawRuler(st.ruler);
        if (st.geo) drawGeo(st.geo);
        if (st.pencil.tip && st.pencil.alpha > 0) drawPencil(toPx(st.pencil.tip), st.pencil.alpha);
        if (st.compass) drawCompass(st.compass);
        if (labelsDeferred && p.aux) drawMarkLabels(st);
      }
      drawNote(st);
      if (R.inset) {
        g.save();
        const a = clamp01(k.cards * 1.6);
        g.globalAlpha *= ease.outCubic(a);
        whereCard(k)(R.inset, false);
        g.restore();
      }
      if (stepIdx === 0) {
        const P = R.paper;
        fpill(P.x + P.w / 2, P.y + P.h - fs(30, 26), C('m', say(L('Starte mit „Nächster Schritt“ oder „Konstruieren“', 'Start with “Next step” or “Construct”'))), { size: fs(13, 12), alpha: 0.95 });
      }
      g.restore();
      g.strokeStyle = th().dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, R.paper.x + 0.5, R.paper.y + 0.5, R.paper.w - 1, R.paper.h - 1, 12);
      g.stroke();
      g.restore();
      drawColumn(R.col, now, k);
      updateKeyTargets();
      if (cardFade !== null) anim = true;
      if (bal) anim = true;

      const running = stepRunning(now);
      if (!running && autoPlay) {
        if (stepIdx < n) {
          const since = (now - stepStart) * speed() - stepDur(steps()[stepIdx - 1] ?? { src: '', ops: [] });
          if (since > (fast ? 30 : 420) || reduced) nextStep();
        } else {
          autoPlay = false;
          fast = false;
          // letzten Schritt als erledigt markieren (sonst liefe er mit normaler Geschwindigkeit weiter)
          stepStart = -Infinity;
          updateReadouts();
          anim = true;
        }
      }
      if (running || autoPlay) anim = true;
      if (wasRunning !== running) {
        updateReadouts();
        anim = true;
      }
      wasRunning = running;
      if (anim) ctx.requestRender();
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): HitId | null {
      if (ctx.locked) return null;
      for (const b of buttons) if (px >= b.r.x && px <= b.r.x + b.r.w && py >= b.r.y && py <= b.r.y + b.r.h) return b.id;
      let best: HitId | null = null;
      let bd = Infinity;
      for (const h of hits) {
        const d = Math.hypot(px - h.x, py - h.y);
        if (d < h.r && d < bd) {
          bd = d;
          best = h.id;
        }
      }
      if (best) return best;
      // Pappe antippen (Seitenhalbierende): Nadel dorthin
      if (mode() === 'sh' && finished() && !geom().deg) {
        const P = regions().paper;
        const ins = regions().inset;
        if (px < P.x || px > P.x + P.w || py < P.y || py > P.y + P.h) return null;
        if (ins && px >= ins.x && px <= ins.x + ins.w && py >= ins.y && py <= ins.y + ins.h) return null;
        const w = toWorld(px, py);
        if (whereIs(geom().t, w, 1e-9) !== 'aussen') return 'card';
      }
      return null;
    }

    function pressButton(id: 'next' | 'restart'): void {
      if (id === 'next') {
        autoPlay = false;
        fast = false;
        nextStep();
      } else restart();
      ctx.requestRender();
    }

    /** Tastatur: Knöpfe im Bild und (Seitenhalbierende) die Pappe aufstecken. */
    function updateKeyTargets(): void {
      if (ctx.locked) {
        ctx.setKeyTargets([]);
        return;
      }
      const targets: KeyTarget[] = buttons
        .filter((b): b is { id: 'next' | 'restart'; r: Rect; label: string } => b.id === 'next' || b.id === 'restart')
        .map((b) => ({ id: b.id, label: b.label, rect: b.r, activate: () => pressButton(b.id) }));
      if (mode() === 'sh' && finished() && !geom().deg) {
        const G = geom();
        const A = G.t[0];
        targets.push(
          { id: 'pinS', label: say(L('Pappe im Schwerpunkt S aufstecken', 'Pin the card at the centroid S')), activate: () => startBalance([G.S]) },
          { id: 'pinOff', label: say(L('Pappe neben dem Schwerpunkt aufstecken', 'Pin the card away from the centroid')), activate: () => startBalance([[(G.S[0] + A[0]) / 2, (G.S[1] + A[1]) / 2]]) },
        );
      }
      ctx.setKeyTargets(targets);
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id === 'next' || id === 'restart') pressButton(id);
        else if (id === 'card') {
          const w = toWorld(q.px, q.py);
          const G = geom();
          // nahe am Schwerpunkt: einrasten (sonst trifft man ihn mit dem Finger kaum)
          const pin: Pt = dist(w, G.S) < 14 / scale() ? G.S : w;
          startBalance([pin]);
        } else {
          drag = Number(id.slice(1)) as 0 | 1 | 2;
          bal = null;
          if (!finished() || autoPlay) {
            finishNow();
            updateReadouts();
          }
          surface.setCursor('grabbing');
        }
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (drag === null || ctx.locked) return;
        lastDrag = performance.now();
        const w = toWorld(q.px, q.py);
        // auf halbe Zentimeter einrasten, im erlaubten Bereich halten
        const x = clamp(Math.round(w[0] * 2) / 2, 0.5, W_MAX - 0.5);
        const y = clamp(Math.round(w[1] * 2) / 2, 0.5, H_MAX - 0.5);
        const key = ['a', 'b', 'c'][drag]!;
        const rest = target().filter((_, i) => i !== drag);
        if (rest.some((o) => Math.abs(o[0] - x) < 1e-9 && Math.abs(o[1] - y) < 1e-9)) return;
        ctx.set({ [`${key}x`]: x, [`${key}y`]: y });
        ctx.requestRender();
      },
      pointerUp: () => {
        drag = null;
        lastDrag = performance.now();
        surface.setCursor(hover ? (hover === 'next' || hover === 'restart' || hover === 'card' ? 'pointer' : 'grab') : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const id = q ? hitAt(q.px, q.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(!id ? '' : id === 'next' || id === 'restart' || id === 'card' ? 'pointer' : drag !== null ? 'grabbing' : 'grab');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = source === 'init' || reduced;
        const t = target();
        const goals: [Chan, number][] = [
          [VXs[0]!, t[0][0]],
          [VXs[1]!, t[1][0]],
          [VXs[2]!, t[2][0]],
          [VYs[0]!, t[0][1]],
          [VYs[1]!, t[1][1]],
          [VYs[2]!, t[2][1]],
        ];
        const replace = source === 'replace';
        for (const [c, v] of goals) {
          if (instant) c.jump(v);
          else if (dragging()) c.follow(v, 0.05);
          else if (replace) {
            if (Math.abs(c.goal - v) > 1e-12 || c.busy) c.glide(v, 750, now);
          } else if (Math.abs(c.goal - v) > 1e-12) c.follow(v, 0.16);
        }
        if (source === 'init') {
          lastSize = { w: surface.width, h: surface.height };
          if (!reduced) intro = now;
          retargetView(true);
          replay();
        } else if (replace || changed.has('m')) {
          bal = null;
          if (!reduced) cardFade = now;
          replay();
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'next') {
          autoPlay = false;
          fast = false;
          nextStep();
        } else if (id === 'play') playAll();
        else if (id === 'restart') restart();
        else if (id === 'tilt') {
          if (!finished() || autoPlay) finishNow();
          const G = geom();
          if (!G.deg) {
            // erst neben dem Schwerpunkt (auf halbem Weg zur Ecke A), dann genau im Schwerpunkt
            const off = lerpP(G.S, G.t[0], 0.5);
            startBalance([off, G.S]);
          }
        }
        updateReadouts();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
