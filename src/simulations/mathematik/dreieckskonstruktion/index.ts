import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { isSsW, pieces, solve, type Case, type Given, type Pt, type Solution } from './model';

const L = (de: string, en: string) => ({ de, en });
type Vals = Record<string, unknown>;
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm360 = (d: number) => ((d % 360) + 360) % 360;
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;
const dirW = (d: number): Pt => [Math.cos(rad(d)), Math.sin(rad(d))];
const isCase =
  (...cs: Case[]) =>
  (v: Vals) =>
    cs.includes(v.cs as Case);

/** Sinnvolle Ausgangswerte, wenn man den Fall von Hand wechselt. */
const START: Record<Case, Partial<Given>> = {
  sss: { c: 6, b: 4.5, a: 5 },
  sws: { c: 6, b: 4.5, al: 50 },
  wsw: { c: 6, al: 50, be: 60 },
  ssw: { c: 5, a: 6, al: 50 },
  www: { c: 4, al: 50, be: 60 },
};

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

/** Geodreieck am Scheitel v; side 'A': Grundlinie nach rechts, 'B': nach links. */
interface Geo {
  v: Pt;
  side: 'A' | 'B';
  ang: number;
  alpha: number;
  slide: number;
  sweep: number;
  dot: number;
}

interface Seg {
  a: Pt;
  /** Ende (Strecke) oder Richtung in Grad (Halbgerade bis zum Rand). */
  b: Pt | number;
  t: number;
  kind: 'side' | 'ray' | 'side2';
}

interface CState {
  segs: Seg[];
  arcs: { c: Pt; r: number; a0: number; a1: number }[];
  points: { p: Pt; label: string; pop: number; color: 'base' | 'res' | 'res2' }[];
  marks: { p: Pt; pop: number }[];
  angles: { v: Pt; from: number; to: number; which: 'al' | 'be'; pop: number }[];
  radius: { c: Pt; ang: number; r: number; alpha: number; label: string } | null;
  ruler: { a: Pt; b: Pt; alpha: number; slide: number } | null;
  pencil: { tip: Pt | null; alpha: number };
  compass: Compass | null;
  geo: Geo | null;
  family: { k: number; t: number }[];
  finish: number;
}

interface Op {
  dur: number;
  apply(s: CState, t: number): void;
}

const emptyState = (): CState => ({
  segs: [],
  arcs: [],
  points: [],
  marks: [],
  angles: [],
  radius: null,
  ruler: null,
  pencil: { tip: null, alpha: 0 },
  compass: null,
  geo: null,
  family: [],
  finish: 0,
});

/** Streckfaktoren der weiteren Dreiecke bei WWW. */
const FAMILY = [1.6, 0.55];

/**
 * Dreiecke aus drei gegebenen Stücken konstruieren (SSS, SWS, WSW, SsW/SSW)
 * – Schritt für Schritt mit Lineal, Geodreieck und Zirkel auf Karopapier,
 * mit Planfigur und Kongruenzsatz. Sonderfälle: Dreiecksungleichung verletzt,
 * Winkelsumme zu groß, zwei Lösungen bei SSW, ähnliche Dreiecke bei WWW.
 */
export default defineSimulation({
  id: 'dreieckskonstruktion',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [
    { id: 'given', label: L('Gegebene Stücke', 'Given parts') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'cs',
      type: 'choice',
      label: L('Gegeben sind', 'Given'),
      options: [
        { value: 'sss', label: L('SSS: drei Seiten', 'SSS: three sides') },
        { value: 'sws', label: L('SWS: zwei Seiten, Winkel dazwischen', 'SAS: two sides and the angle between') },
        { value: 'wsw', label: L('WSW: Seite, zwei anliegende Winkel', 'ASA: a side and both adjacent angles') },
        { value: 'ssw', label: L('SsW/SSW: zwei Seiten, Gegenwinkel', 'SSA: two sides and an opposite angle') },
        { value: 'www', label: L('WWW: drei Winkel', 'AAA: three angles') },
      ],
      default: 'sss',
    },
    { key: 'c', type: 'number', group: 'given', label: L('Seite c = [AB]', 'Side c = AB'), min: 2, max: 10, step: 0.1, default: 6, unit: 'cm' },
    { key: 'b', type: 'number', group: 'given', label: L('Seite b = [AC]', 'Side b = AC'), min: 1, max: 12, step: 0.1, default: 4.5, unit: 'cm', visibleIf: isCase('sss', 'sws') },
    { key: 'a', type: 'number', group: 'given', label: L('Seite a = [BC]', 'Side a = BC'), min: 1, max: 12, step: 0.1, default: 5, unit: 'cm', visibleIf: isCase('sss', 'ssw') },
    { key: 'al', type: 'number', group: 'given', label: L('Winkel α bei A', 'Angle α at A'), min: 10, max: 170, step: 1, default: 50, unit: '°', visibleIf: isCase('sws', 'wsw', 'ssw', 'www') },
    { key: 'be', type: 'number', group: 'given', label: L('Winkel β bei B', 'Angle β at B'), min: 10, max: 170, step: 1, default: 60, unit: '°', visibleIf: isCase('wsw', 'www') },
    {
      key: 'meas',
      type: 'boolean',
      group: 'view',
      label: L('Fehlende Stücke messen', 'Measure the missing parts'),
      help: L('Zeigt am fertigen Dreieck auch die nicht gegebenen Seiten und Winkel.', 'Also shows the sides and angles that were not given on the finished triangle.'),
      default: true,
    },
  ],
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'play', label: L('Alles abspielen', 'Play all') },
    { id: 'restart', label: L('Von vorn', 'Start again') },
  ],
  readouts: [
    { key: 'given', label: L('Gegeben', 'Given') },
    { key: 'step', label: L('Konstruktion', 'Construction') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
    { key: 'meas', label: L('Gemessen', 'Measured'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('SSS: drei Seiten', 'SSS: three sides'), values: {} },
    { id: 'sssno', label: L('SSS: zu kurze Seiten', 'SSS: sides too short'), values: { c: 7, b: 3, a: 2.5 } },
    { id: 'sws', label: L('SWS: Winkel dazwischen', 'SAS: angle in between'), values: { cs: 'sws', c: 7, b: 4, al: 40 } },
    { id: 'wsw', label: L('WSW: Seite und zwei Winkel', 'ASA: side and two angles'), values: { cs: 'wsw', c: 6, al: 45, be: 70 } },
    { id: 'ssw2', label: L('SSW: zwei Lösungen', 'SSA: two solutions'), values: { cs: 'ssw', c: 7, a: 4.5, al: 35 } },
    { id: 'www', label: L('WWW: kein Kongruenzsatz', 'AAA: not a congruence criterion'), values: { cs: 'www', c: 4, al: 50, be: 60 } },
  ],
  strings: {
    de: {
      canvas: 'Karopapier, auf dem ein Dreieck aus drei gegebenen Stücken Schritt für Schritt mit Lineal, Geodreieck und Zirkel konstruiert wird; daneben eine Planfigur mit den gegebenen Stücken und die Liste der Konstruktionsschritte',
      planT: 'Planfigur (Skizze)',
      stepsT: 'Konstruktionsschritte',
      emptyHint: 'Mit „Nächster Schritt“ beginnt die Konstruktion.',
      s0: 'Planfigur skizzieren und die gegebenen Stücke markieren.',
      base: 'Grundseite [AB] mit c = {c} zeichnen.',
      baseWWW: 'Eine beliebig lange Grundseite zeichnen, z. B. c = {c}.',
      arcA: 'Zirkel auf b = {b} einstellen, Kreisbogen um A zeichnen.',
      arcB: 'Zirkel auf a = {a} einstellen, Kreisbogen um B zeichnen.',
      cut: 'Die Bögen schneiden sich in C.',
      cutNo: 'Die Bögen schneiden sich nicht – es gibt keinen Punkt C.',
      join: 'C mit A und B verbinden.',
      joinB: 'C mit B verbinden.',
      angA: 'Winkel α = {al} bei A mit dem Geodreieck antragen.',
      angB: 'Winkel β = {be} bei B mit dem Geodreieck antragen.',
      rayA: 'Den freien Schenkel von α zeichnen.',
      rayB: 'Den freien Schenkel von β zeichnen. Schnittpunkt: C.',
      rayBNo: 'Den freien Schenkel von β zeichnen: Er schneidet den Schenkel von α nicht.',
      onRay: 'b = {b} mit dem Zirkel von A aus auf dem Schenkel abtragen: C.',
      arcBRay: 'Kreisbogen um B mit Radius a = {a} zeichnen.',
      cut1: 'Der Bogen schneidet den Schenkel in genau einem Punkt C.',
      cut2: 'Der Bogen schneidet den Schenkel zweimal: C₁ und C₂.',
      cut0: 'Der Bogen erreicht den Schenkel nicht – es gibt keinen Punkt C.',
      join2: 'C₁ und C₂ mit B verbinden.',
      fam1: 'Gleiche Winkel, längere Grundseite: wieder ein Dreieck.',
      fam2: 'Gleiche Winkel, kürzere Grundseite: noch ein Dreieck.',
      endSSS: 'Fertig: Das Dreieck ist eindeutig bestimmt (Kongruenzsatz SSS).',
      endSWS: 'Fertig: Das Dreieck ist eindeutig bestimmt (Kongruenzsatz SWS).',
      endWSW: 'Fertig: Das Dreieck ist eindeutig bestimmt (Kongruenzsatz WSW).',
      endSsW: 'Fertig: eindeutig, denn α liegt der größeren Seite a gegenüber (Kongruenzsatz SsW).',
      endSSW1: 'Fertig: Hier gibt es genau ein Dreieck – aber nur, weil der Bogen den Schenkel gerade berührt.',
      endSSW2: 'Zwei verschiedene Dreiecke ABC₁ und ABC₂: SSW mit a < c legt das Dreieck nicht fest.',
      endWWW: 'Alle Dreiecke haben dieselben Winkel, sind aber verschieden groß: WWW ist kein Kongruenzsatz.',
      endNoSSS: 'Kein Dreieck: a + b = {s} ist nicht größer als c = {c} (Dreiecksungleichung).',
      endNoSSSb: 'Kein Dreieck: Eine Seite ist mindestens so lang wie die beiden anderen zusammen (Dreiecksungleichung).',
      endNoAng: 'Kein Dreieck: α + β = {s} – die Schenkel laufen auseinander oder parallel (Winkelsumme 180°).',
      endNoSSW: 'Kein Dreieck: a ist kürzer als der Abstand von B zum Schenkel.',
      congT: 'Kongruenzsatz',
      congSSS: 'SSS: Stimmen zwei Dreiecke in allen drei Seiten überein, sind sie kongruent.',
      congSWS: 'SWS: Zwei Seiten und der eingeschlossene Winkel legen ein Dreieck fest.',
      congWSW: 'WSW: Eine Seite und die beiden anliegenden Winkel legen ein Dreieck fest.',
      congSsW: 'SsW: Zwei Seiten und der Gegenwinkel der größeren Seite legen ein Dreieck fest.',
      congSSW: 'SSW mit Gegenwinkel der kleineren Seite: kein Kongruenzsatz – es kann zwei Lösungen geben.',
      congWWW: 'WWW: Drei Winkel legen nur die Form fest. Die Dreiecke sind ähnlich, aber nicht kongruent.',
      chkSsW: 'a ≥ c: Gegenwinkel der größeren Seite ✓',
      chkSSW: 'a < c: Gegenwinkel der kleineren Seite!',
      chkSSS: 'a + b > c, a + c > b, b + c > a?',
      chkWSW: 'α + β < 180°?',
      chkWWW: 'γ = 180° − α − β = {g}',
      stepOf: 'Schritt {i} von {n}',
      next: 'Nächster Schritt',
      restart: 'Von vorn',
      done: 'Fertig!',
      givenSSS: 'a = {a}, b = {b}, c = {c}',
      givenSWS: 'b = {b}, c = {c}, α = {al}',
      givenWSW: 'c = {c}, α = {al}, β = {be}',
      givenSSW: 'a = {a}, c = {c}, α = {al}',
      givenWWW: 'α = {al}, β = {be} (γ = {g})',
      stepRead: 'Schritt {i} von {n}: {t}',
      resOne: 'eindeutig konstruierbar (Kongruenzsatz {k})',
      resTouch: 'genau ein Dreieck (der Bogen berührt den Schenkel)',
      resTwo: 'zwei verschiedene Dreiecke (SSW, a < c)',
      resNone: 'nicht konstruierbar',
      resMany: 'unendlich viele ähnliche Dreiecke (WWW)',
      measRead: 'a ≈ {a}, b ≈ {b}, c = {c}; α ≈ {al}, β ≈ {be}, γ ≈ {ga}',
      measTwo: 'C₁: b ≈ {b1}, γ ≈ {g1}; C₂: b ≈ {b2}, γ ≈ {g2}',
      noC: 'kein Schnittpunkt',
    },
    en: {
      canvas: 'Squared paper on which a triangle is constructed from three given parts step by step with ruler, set square and compasses; next to it a sketch with the given parts and the list of construction steps',
      planT: 'Sketch',
      stepsT: 'Construction steps',
      emptyHint: 'Press “Next step” to start the construction.',
      s0: 'Sketch the triangle and mark the given parts.',
      base: 'Draw the base AB with c = {c}.',
      baseWWW: 'Draw a base of any length, e.g. c = {c}.',
      arcA: 'Set the compasses to b = {b} and draw an arc around A.',
      arcB: 'Set the compasses to a = {a} and draw an arc around B.',
      cut: 'The arcs meet at C.',
      cutNo: 'The arcs do not meet – there is no point C.',
      join: 'Join C to A and B.',
      joinB: 'Join C to B.',
      angA: 'Measure the angle α = {al} at A with the set square.',
      angB: 'Measure the angle β = {be} at B with the set square.',
      rayA: 'Draw the free arm of α.',
      rayB: 'Draw the free arm of β. The arms meet at C.',
      rayBNo: 'Draw the free arm of β: it does not meet the arm of α.',
      onRay: 'Mark b = {b} from A along the arm with the compasses: C.',
      arcBRay: 'Draw an arc around B with radius a = {a}.',
      cut1: 'The arc cuts the arm at exactly one point C.',
      cut2: 'The arc cuts the arm twice: C₁ and C₂.',
      cut0: 'The arc does not reach the arm – there is no point C.',
      join2: 'Join C₁ and C₂ to B.',
      fam1: 'Same angles, longer base: another triangle.',
      fam2: 'Same angles, shorter base: yet another one.',
      endSSS: 'Done: the triangle is uniquely determined (SSS).',
      endSWS: 'Done: the triangle is uniquely determined (SAS).',
      endWSW: 'Done: the triangle is uniquely determined (ASA).',
      endSsW: 'Done: unique, because α is opposite the longer side a (SsA).',
      endSSW1: 'Done: exactly one triangle here – but only because the arc just touches the arm.',
      endSSW2: 'Two different triangles ABC₁ and ABC₂: SSA with a < c does not fix the triangle.',
      endWWW: 'All triangles have the same angles but different sizes: AAA is not a congruence criterion.',
      endNoSSS: 'No triangle: a + b = {s} is not longer than c = {c} (triangle inequality).',
      endNoSSSb: 'No triangle: one side is at least as long as the other two together (triangle inequality).',
      endNoAng: 'No triangle: α + β = {s} – the arms diverge or are parallel (angle sum 180°).',
      endNoSSW: 'No triangle: a is shorter than the distance from B to the arm.',
      congT: 'Congruence criterion',
      congSSS: 'SSS: triangles that agree in all three sides are congruent.',
      congSWS: 'SAS: two sides and the angle between them fix a triangle.',
      congWSW: 'ASA: a side and both adjacent angles fix a triangle.',
      congSsW: 'SsA: two sides and the angle opposite the longer one fix a triangle.',
      congSSW: 'SSA with the angle opposite the shorter side: not a criterion – there may be two solutions.',
      congWWW: 'AAA: three angles only fix the shape. The triangles are similar, not congruent.',
      chkSsW: 'a ≥ c: angle opposite the longer side ✓',
      chkSSW: 'a < c: angle opposite the shorter side!',
      chkSSS: 'a + b > c, a + c > b, b + c > a?',
      chkWSW: 'α + β < 180°?',
      chkWWW: 'γ = 180° − α − β = {g}',
      stepOf: 'Step {i} of {n}',
      next: 'Next step',
      restart: 'Start again',
      done: 'Done!',
      givenSSS: 'a = {a}, b = {b}, c = {c}',
      givenSWS: 'b = {b}, c = {c}, α = {al}',
      givenWSW: 'c = {c}, α = {al}, β = {be}',
      givenSSW: 'a = {a}, c = {c}, α = {al}',
      givenWWW: 'α = {al}, β = {be} (γ = {g})',
      stepRead: 'Step {i} of {n}: {t}',
      resOne: 'uniquely constructible ({k})',
      resTouch: 'exactly one triangle (the arc touches the arm)',
      resTwo: 'two different triangles (SSA, a < c)',
      resNone: 'not constructible',
      resMany: 'infinitely many similar triangles (AAA)',
      measRead: 'a ≈ {a}, b ≈ {b}, c = {c}; α ≈ {al}, β ≈ {be}, γ ≈ {ga}',
      measTwo: 'C₁: b ≈ {b1}, γ ≈ {g1}; C₂: b ≈ {b2}, γ ≈ {g2}',
      noC: 'no intersection',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const cs = () => p.cs as Case;
    const wide = () => surface.width >= 640;
    const F = (w: number, n: number) => (wide() ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${ctx.theme.font}`;
    const mathFont = (size: number) => `italic 700 ${size}px ${ctx.theme.mathFont}`;
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');
    const cm = (v: number) => `${fmt.num(v, 1)} cm`;
    const dg = (v: number) => `${fmt.num(v, 0)}°`;
    const dg1 = (v: number) => `${fmt.num(v, 1)}°`;

    const col = {
      giv: () => ctx.theme.series[0]!,
      res: () => ctx.theme.series[4]!,
      res2: () => ctx.theme.series[3]!,
      ok: () => ctx.theme.series[2]!,
      bad: () => ctx.theme.series[1]!,
      fam: () => [ctx.theme.series[4]!, ctx.theme.series[5]!, ctx.theme.series[3]!],
      pencil: () => (ctx.theme.dark ? '#c5ccd6' : '#3a414d'),
    };

    const given = (): Given => ({ a: p.a, b: p.b, c: p.c, al: p.al, be: p.be });
    const A: Pt = [0, 0];
    const B = (): Pt => [p.c, 0];

    /* ---------- Zustand ---------- */
    let stepIdx = 0;
    let stepStart = -Infinity;
    let autoPlay = false;
    let wasRunning = false;
    let hits: { id: string; r: Rect }[] = [];
    let hover: string | null = null;
    let drag: 'b' | 'c1' | 'c2' | null = null;
    let view: { cx: number; cy: number; s: number } | null = null;
    let lastFrame = performance.now();
    let intro = 0;

    /* ---------- Aufteilung ---------- */
    type Layout = { paper: Rect; side: Rect | null; below: Rect | null };
    function layout(): Layout {
      const W = surface.width;
      const H = surface.height;
      const gap = wide() ? 12 : 8;
      if (W > H * 1.05) {
        const colW = Math.round(wide() ? clamp(W * 0.35, 270, 340) : clamp(W * 0.4, 200, 270));
        return { paper: { x: 2, y: 2, w: W - colW - gap - 2, h: H - 4 }, side: { x: W - colW, y: 2, w: colW - 2, h: H - 4 }, below: null };
      }
      const ph = Math.round(clamp(W * 0.68, 220, H * 0.5));
      return { paper: { x: 2, y: 2, w: W - 4, h: ph }, side: null, below: { x: 2, y: ph + 2 + gap, w: W - 4, h: H - ph - 4 - gap } };
    }

    function toPx(q: Pt): Px {
      const { paper } = layout();
      const v = view ?? { cx: 0, cy: 0, s: 30 };
      return [paper.x + paper.w / 2 + (q[0] - v.cx) * v.s, paper.y + paper.h / 2 - (q[1] - v.cy) * v.s];
    }
    function toWorld(px: number, py: number): Pt {
      const { paper } = layout();
      const v = view ?? { cx: 0, cy: 0, s: 30 };
      return [v.cx + (px - paper.x - paper.w / 2) / v.s, v.cy - (py - paper.y - paper.h / 2) / v.s];
    }
    const scale = () => (view ? view.s : 30);

    /* ---------- Geometrie ---------- */
    let solCache: { key: string; sol: Solution } | null = null;
    function sol(): Solution {
      const key = `${p.cs}|${p.a}|${p.b}|${p.c}|${p.al}|${p.be}`;
      if (solCache?.key !== key) solCache = { key, sol: solve(cs(), given()) };
      return solCache.sol;
    }

    /** Punkt auf dem Rand der Zeichenfläche in Richtung d (Grad) ab v (Weltkoordinaten). */
    function rayEnd(v: Pt, d: number): Pt {
      const { paper } = layout();
      const pv = toPx(v);
      const u: Px = [Math.cos(rad(d)), -Math.sin(rad(d))];
      let t = Infinity;
      if (u[0] > 1e-9) t = Math.min(t, (paper.x + paper.w - pv[0]) / u[0]);
      if (u[0] < -1e-9) t = Math.min(t, (paper.x - pv[0]) / u[0]);
      if (u[1] > 1e-9) t = Math.min(t, (paper.y + paper.h - pv[1]) / u[1]);
      if (u[1] < -1e-9) t = Math.min(t, (paper.y - pv[1]) / u[1]);
      if (!Number.isFinite(t) || t < 0) t = 0;
      return toWorld(pv[0] + u[0] * t, pv[1] + u[1] * t);
    }

    /* ---------- Teilbewegungen ---------- */
    function bendFor(pin: Pt, r: number, refAng: number): number {
      const up = Math.cos(rad(refAng)) >= 0 ? 1 : -1;
      const rpx = Math.max(6, r * scale());
      const Lg = Math.max(rpx * 0.6 + 34, rpx / 2 + 26);
      const hgt = Math.sqrt(Math.max(0, Lg * Lg - (rpx / 2) ** 2)) + 22;
      const pp = toPx(pin);
      const t = rad(refAng);
      const mid: Px = [pp[0] + (Math.cos(t) * rpx) / 2, pp[1] - (Math.sin(t) * rpx) / 2];
      const nUp: Px = [-Math.sin(t), -Math.cos(t)];
      const { paper } = layout();
      const fits = (side: number) => {
        const y = mid[1] + nUp[1] * hgt * side;
        const x = mid[0] + nUp[0] * hgt * side;
        return y > paper.y - 10 && y < paper.y + paper.h + 10 && x > paper.x - 10 && x < paper.x + paper.w + 10;
      };
      if (fits(up)) return up;
      return fits(-up) ? -up : up;
    }

    function compassIn(pin: Pt, ang: number, r: number, label: string, dur = 1500): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(pin, r, ang);
          const t1 = clamp(t / 0.45, 0, 1);
          const t2 = clamp((t - 0.45) / 0.55, 0, 1);
          const e = ease.outCubic(t1);
          const rr = lerp(r * 0.3, r, ease.inOutCubic(t2));
          const off = 1.6;
          s.compass = { pin: [pin[0] + (1 - e) * off, pin[1] + (1 - e) * off * 0.7], ang: ang - (1 - e) * 25, r: rr, alpha: Math.min(1, t1 * 2), bend: side };
          s.radius = t2 > 0 ? { c: pin, ang, r: rr, alpha: Math.min(1, t2 * 2), label } : null;
        },
      };
    }
    function compassMove(pin: Pt, ang: number, r: number, label: string, dur = 1300): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(pin, r, ang);
          const c = s.compass ?? { pin, ang, r, alpha: 1, bend: side };
          const e = ease.inOutCubic(t);
          let da = norm360(ang - c.ang);
          if (da > 180) da -= 360;
          const rr = lerp(c.r, r, e);
          s.compass = { pin: [lerp(c.pin[0], pin[0], e), lerp(c.pin[1], pin[1], e)], ang: c.ang + da * e, r: rr, alpha: 1 - 0.15 * Math.sin(Math.PI * t), bend: lerp(c.bend, side, e) };
          s.radius = t > 0.55 ? { c: pin, ang, r, alpha: clamp((t - 0.55) * 3, 0, 1), label } : null;
        },
      };
    }
    function arcOp(c: Pt, r: number, a0: number, a1: number, dur = 1400): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(c, r, (a0 + a1) / 2);
          const e = ease.inOutCubic(t);
          const a = a0 + (a1 - a0) * e;
          s.radius = null;
          if (t > 0) s.arcs.push({ c, r, a0, a1: a });
          s.compass = { pin: c, ang: a, r, alpha: 1, bend: side };
        },
      };
    }
    function compassOut(dur = 600): Op {
      return {
        dur,
        apply(s, t) {
          if (!s.compass) return;
          const c = s.compass;
          s.compass = t >= 1 ? null : { ...c, pin: [c.pin[0] + t * 1.6, c.pin[1] + t * 1.1], alpha: 1 - t };
        },
      };
    }
    function markOp(points: { p: Pt; label: string; color: 'base' | 'res' | 'res2' }[], dur = 700): Op {
      return {
        dur,
        apply(s, t) {
          points.forEach((q, i) => s.points.push({ ...q, pop: clamp(t * (points.length + 0.6) - i * 0.6, 0, 1) }));
        },
      };
    }
    /** Strecke bzw. Halbgerade mit Lineal und Bleistift ziehen. */
    function lineOps(a: Pt, b: Pt | number, kind: Seg['kind'], dur = 1200): Op[] {
      const end = () => (typeof b === 'number' ? rayEnd(a, b) : b);
      return [
        {
          dur: 650,
          apply(s, t) {
            s.ruler = { a, b: end(), alpha: Math.min(1, t * 1.6), slide: 1 - ease.outCubic(t) };
          },
        },
        {
          dur,
          apply(s, t) {
            const e = ease.inOutCubic(t);
            s.ruler = { a, b: end(), alpha: 1, slide: 0 };
            s.segs.push({ a, b, t: e, kind });
            const q = end();
            s.pencil = { tip: [lerp(a[0], q[0], e), lerp(a[1], q[1], e)], alpha: t <= 0 ? 0 : t < 0.85 ? Math.min(1, t * 8) : (1 - t) / 0.15 };
          },
        },
        {
          dur: 450,
          apply(s, t) {
            s.pencil = { tip: null, alpha: 0 };
            s.ruler = t >= 1 ? null : { a, b: end(), alpha: 1 - t, slide: t * 0.7 };
          },
        },
      ];
    }
    /** Mehrere Strecken gleichzeitig (ohne Lineal), z. B. zum Verbinden. */
    function joinOp(list: { a: Pt; b: Pt; kind: Seg['kind'] }[], dur = 900): Op {
      return {
        dur,
        apply(s, t) {
          for (const q of list) s.segs.push({ ...q, t: ease.inOutCubic(t) });
        },
      };
    }
    function geoOps(v: Pt, side: 'A' | 'B', ang: number): Op[] {
      return [
        {
          dur: 2000,
          apply(s, t) {
            const t1 = clamp(t / 0.3, 0, 1);
            const t2 = clamp((t - 0.32) / 0.45, 0, 1);
            const t3 = clamp((t - 0.8) / 0.2, 0, 1);
            s.geo = { v, side, ang, alpha: t1, slide: 1 - ease.outCubic(t1), sweep: ease.inOutCubic(t2), dot: t3 };
            if (t3 > 0) s.marks.push({ p: geoMark(v, side, ang), pop: t3 });
          },
        },
      ];
    }
    /** Ein Strahl, nachdem das Geodreieck weggelegt wurde; danach erscheint der Winkelbogen. */
    function rayAfterGeo(v: Pt, side: 'A' | 'B', ang: number, which: 'al' | 'be'): Op[] {
      const d = side === 'A' ? ang : 180 - ang;
      return [
        {
          dur: 450,
          apply(s, t) {
            if (s.geo) s.geo = t >= 1 ? null : { ...s.geo, alpha: 1 - t, slide: t * 0.6 };
          },
        },
        ...lineOps(v, d, 'ray', 1000),
        {
          dur: 500,
          apply(s, t) {
            s.angles.push({ v, from: side === 'A' ? 0 : 180 - ang, to: side === 'A' ? ang : 180, which, pop: t });
          },
        },
      ];
    }
    /** Punkt, den man am Geodreieck markiert (für die Halbgerade). */
    function geoMark(v: Pt, side: 'A' | 'B', ang: number): Pt {
      const Rw = geoRadius() / scale();
      const d = side === 'A' ? ang : 180 - ang;
      const u = dirW(d);
      return [v[0] + u[0] * Rw * 0.82, v[1] + u[1] * Rw * 0.82];
    }
    const geoRadius = () => F(104, 80);
    const finishOp = (dur = 800): Op => ({
      dur,
      apply(s, t) {
        s.finish = t;
      },
    });
    const familyOp = (k: number, dur = 1300): Op => ({
      dur,
      apply(s, t) {
        s.family.push({ k, t: ease.inOutCubic(t) });
      },
    });

    /* ---------- Schritte ---------- */
    interface Step {
      text: string;
      ops: Op[];
      /** Geodreieck liegt an dieser Ecke (Platz in der Ansicht freihalten). */
      geo?: 'A' | 'B';
    }
    let stepsCache: { key: string; steps: Step[] } | null = null;
    function steps(): Step[] {
      const key = `${p.cs}|${p.a}|${p.b}|${p.c}|${p.al}|${p.be}|${ctx.lang}`;
      if (stepsCache?.key === key) return stepsCache.steps;
      stepsCache = { key, steps: buildSteps() };
      return stepsCache.steps;
    }

    function buildSteps(): Step[] {
      const g = given();
      const s = sol();
      const b = B();
      const list: Step[] = [{ text: ctx.t('s0'), ops: [] }];
      const vals = { a: cm(g.a), b: cm(g.b), c: cm(g.c), al: dg(g.al), be: dg(g.be) };
      const baseStep: Step = {
        text: tr(cs() === 'www' ? 'baseWWW' : 'base', vals),
        ops: [
          ...lineOps(A, b, 'side'),
          markOp([
            { p: A, label: 'A', color: 'base' },
            { p: b, label: 'B', color: 'base' },
          ]),
        ],
      };
      list.push(baseStep);
      const C = s.kind === 'none' ? null : s.c;
      const angTo = (from: Pt, to: Pt) => deg(Math.atan2(to[1] - from[1], to[0] - from[0]));
      const cRes = (q: Pt, label = 'C', color: 'res' | 'res2' = 'res') => ({ p: q, label, color });
      switch (cs()) {
        case 'sss': {
          let aA = 60;
          let aB = 120;
          if (C) {
            aA = angTo(A, C);
            aB = angTo(b, C);
          } else if (g.a + g.b <= g.c) {
            aA = 25;
            aB = 155;
          }
          const sp = C ? 20 : 38;
          list.push({ text: tr('arcA', vals), ops: [compassIn(A, aA - sp, g.b, 'b'), arcOp(A, g.b, aA - sp, aA + sp)] });
          list.push({ text: tr('arcB', vals), ops: [compassMove(b, aB + sp, g.a, 'a'), arcOp(b, g.a, aB + sp, aB - sp)] });
          if (C) {
            list.push({ text: ctx.t('cut'), ops: [compassOut(), markOp([cRes(C)])] });
            list.push({
              text: ctx.t('join'),
              ops: [
                joinOp([
                  { a: A, b: C, kind: 'side' },
                  { a: b, b: C, kind: 'side' },
                ]),
              ],
            });
            list.push({ text: ctx.t('endSSS'), ops: [finishOp()] });
          } else {
            const max = Math.max(g.a, g.b, g.c);
            const text = g.c === max ? tr('endNoSSS', { s: cm(g.a + g.b), c: cm(g.c) }) : ctx.t('endNoSSSb');
            list.push({ text: ctx.t('cutNo'), ops: [compassOut()] });
            list.push({ text, ops: [finishOp()] });
          }
          break;
        }
        case 'sws': {
          list.push({ text: tr('angA', vals), ops: geoOps(A, 'A', g.al), geo: 'A' });
          list.push({ text: ctx.t('rayA'), ops: rayAfterGeo(A, 'A', g.al, 'al'), geo: 'A' });
          list.push({ text: tr('onRay', vals), ops: [compassIn(A, g.al - 14, g.b, 'b'), arcOp(A, g.b, g.al - 14, g.al + 14, 900), compassOut(), markOp([cRes(C!)])] });
          list.push({ text: ctx.t('joinB'), ops: [...lineOps(b, C!, 'side', 900)] });
          list.push({ text: ctx.t('endSWS'), ops: [finishOp()] });
          break;
        }
        case 'wsw':
        case 'www': {
          list.push({ text: tr('angA', vals), ops: geoOps(A, 'A', g.al), geo: 'A' });
          list.push({ text: ctx.t('rayA'), ops: rayAfterGeo(A, 'A', g.al, 'al'), geo: 'A' });
          list.push({ text: tr('angB', vals), ops: geoOps(b, 'B', g.be), geo: 'B' });
          list.push({ text: ctx.t(C ? 'rayB' : 'rayBNo'), ops: [...rayAfterGeo(b, 'B', g.be, 'be'), ...(C ? [markOp([cRes(C)])] : [])], geo: 'B' });
          if (!C) list.push({ text: tr('endNoAng', { s: dg(g.al + g.be) }), ops: [finishOp()] });
          else if (cs() === 'wsw') list.push({ text: ctx.t('endWSW'), ops: [finishOp()] });
          else {
            list.push({ text: ctx.t('fam1'), ops: [finishOp(500), familyOp(FAMILY[0]!)] });
            list.push({ text: ctx.t('fam2'), ops: [familyOp(FAMILY[1]!)] });
            list.push({ text: ctx.t('endWWW'), ops: [] });
          }
          break;
        }
        case 'ssw': {
          list.push({ text: tr('angA', vals), ops: geoOps(A, 'A', g.al), geo: 'A' });
          list.push({ text: ctx.t('rayA'), ops: rayAfterGeo(A, 'A', g.al, 'al'), geo: 'A' });
          // Bogen um B: über die Schnittpunkte hinaus bzw. zum nächsten Punkt des Schenkels
          let a0: number;
          let a1: number;
          if (s.kind === 'two') {
            const t1 = angTo(b, s.c);
            const t2 = angTo(b, s.c2);
            a0 = Math.max(t1, t2) + 14;
            a1 = Math.min(t1, t2) - 14;
          } else if (C) {
            const t1 = angTo(b, C);
            a0 = t1 + 22;
            a1 = t1 - 22;
          } else {
            const u = dirW(g.al);
            const k = Math.max(0, b[0] * u[0]);
            const f: Pt = [u[0] * k, u[1] * k];
            const tf = k > 1e-9 ? angTo(b, f) : 180;
            a0 = tf + 34;
            a1 = tf - 34;
          }
          list.push({ text: tr('arcBRay', vals), ops: [compassIn(b, a0, g.a, 'a'), arcOp(b, g.a, a0, a1, 1500)] });
          if (s.kind === 'two') {
            list.push({ text: ctx.t('cut2'), ops: [compassOut(), markOp([cRes(s.c, 'C₁'), cRes(s.c2, 'C₂', 'res2')])] });
            list.push({
              text: ctx.t('join2'),
              ops: [
                joinOp([
                  { a: b, b: s.c, kind: 'side' },
                  { a: b, b: s.c2, kind: 'side2' },
                ]),
              ],
            });
            list.push({ text: ctx.t('endSSW2'), ops: [finishOp()] });
          } else if (C) {
            list.push({ text: ctx.t('cut1'), ops: [compassOut(), markOp([cRes(C)])] });
            list.push({ text: ctx.t('joinB'), ops: [joinOp([{ a: b, b: C, kind: 'side' }])] });
            list.push({ text: ctx.t(isSsW(g.a, g.c) ? 'endSsW' : 'endSSW1'), ops: [finishOp()] });
          } else {
            list.push({ text: ctx.t('cut0'), ops: [compassOut()] });
            list.push({ text: ctx.t('endNoSSW'), ops: [finishOp()] });
          }
          break;
        }
      }
      return list;
    }

    const stepDur = (st: Step) => st.ops.reduce((s, o) => s + o.dur, 0);
    const stepRunning = () => {
      if (reduced) return false;
      const st = steps()[stepIdx];
      return !!st && performance.now() - stepStart < stepDur(st);
    };
    const lastIdx = () => steps().length - 1;
    const constrDone = () => stepIdx >= lastIdx() && !stepRunning();

    function constrState(): CState {
      const s = emptyState();
      const list = steps();
      const now = performance.now();
      for (let i = 1; i <= stepIdx && i < list.length; i++) {
        const st = list[i]!;
        let el = i < stepIdx || reduced ? Infinity : now - stepStart;
        for (const op of st.ops) {
          op.apply(s, clamp(el / op.dur, 0, 1));
          el -= op.dur;
          if (el < 0) break;
        }
      }
      return s;
    }

    function nextStep(): void {
      if (stepRunning() || stepIdx >= lastIdx()) return;
      stepIdx++;
      stepStart = performance.now();
      updateReadouts();
      ctx.requestRender();
    }
    function restart(): void {
      stepIdx = 0;
      stepStart = -Infinity;
      autoPlay = false;
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------- Ansicht einpassen ---------- */
    function targetView(): { cx: number; cy: number; s: number } {
      const { paper } = layout();
      const g = given();
      const s = sol();
      const pts: Pt[] = [A, B()];
      if (s.kind !== 'none') pts.push(s.c);
      if (s.kind === 'two') pts.push(s.c2);
      if (s.kind === 'many') for (const k of FAMILY) pts.push([s.c[0] * k, s.c[1] * k], [g.c * k, 0]);
      if (s.kind === 'none') {
        if (cs() === 'sss') pts.push([0, Math.min(g.b, 9)], [g.c, Math.min(g.a, 9)], [g.c + Math.min(g.a, 4), 0], [-Math.min(g.b, 4), 0]);
        else pts.push([g.c * 0.5, g.c * 0.5]);
        if (cs() === 'ssw') pts.push([g.c, g.a], [g.c - g.a, 0]);
      }
      // Platz für Zirkel und Geodreieck über der Figur
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
      const geoAt = steps()[stepIdx]?.geo;
      const geoPad = geoRadius() * 1.08;
      const padL = Math.max(F(46, 30), geoAt === 'A' ? geoPad : 0);
      const padR = Math.max(F(46, 30), geoAt === 'B' ? geoPad : 0);
      const padTop = F(56, 40);
      const padBot = F(64, 50);
      const bw = Math.max(1, x1 - x0);
      const bh = Math.max(1, y1 - y0);
      const sc = clamp(Math.min((paper.w - padL - padR) / bw, (paper.h - padTop - padBot) / bh), 8, F(62, 46));
      const cx = (x0 + x1) / 2 + (padR - padL) / 2 / sc;
      const cy = (y0 + y1) / 2 - (padBot - padTop) / 2 / sc;
      return { cx, cy, s: sc };
    }

    function stepView(dt: number): boolean {
      const t = targetView();
      if (!view || reduced) {
        view = t;
        return false;
      }
      if (drag) return false;
      const k = 1 - Math.exp(-dt * 6);
      const d = Math.abs(t.cx - view.cx) * view.s + Math.abs(t.cy - view.cy) * view.s + Math.abs(t.s - view.s) * 8;
      if (d < 0.3) {
        view = t;
        return false;
      }
      view = { cx: lerp(view.cx, t.cx, k), cy: lerp(view.cy, t.cy, k), s: lerp(view.s, t.s, k) };
      return true;
    }

    /* ---------- Ergebnisse ---------- */
    function givenText(): string {
      const g = given();
      const vals = { a: cm(g.a), b: cm(g.b), c: cm(g.c), al: dg(g.al), be: dg(g.be), g: dg(180 - g.al - g.be) };
      return tr({ sss: 'givenSSS', sws: 'givenSWS', wsw: 'givenWSW', ssw: 'givenSSW', www: 'givenWWW' }[cs()], vals);
    }
    const congName = (): string => {
      const de = ctx.lang === 'de';
      const g = given();
      switch (cs()) {
        case 'sss':
          return 'SSS';
        case 'sws':
          return de ? 'SWS' : 'SAS';
        case 'wsw':
          return de ? 'WSW' : 'ASA';
        case 'ssw':
          return isSsW(g.a, g.c) ? (de ? 'SsW' : 'SsA') : de ? 'SSW' : 'SSA';
        case 'www':
          return de ? 'WWW' : 'AAA';
      }
    };

    function updateReadouts(): void {
      const s = sol();
      const g = given();
      ctx.readout('given', givenText());
      const list = steps();
      ctx.readout('step', tr('stepRead', { i: stepIdx, n: list.length - 1, t: list[stepIdx]!.text }));
      if (s.kind === 'none') ctx.readout('res', ctx.t('resNone'));
      else if (s.kind === 'two') ctx.readout('res', ctx.t('resTwo'));
      else if (s.kind === 'many') ctx.readout('res', ctx.t('resMany'));
      else if (cs() === 'ssw' && !isSsW(g.a, g.c)) ctx.readout('res', ctx.t('resTouch'));
      else ctx.readout('res', tr('resOne', { k: congName() }));
      if (s.kind === 'none') ctx.readout('meas', null);
      else if (s.kind === 'two') {
        const p1 = pieces(g.c, s.c);
        const p2 = pieces(g.c, s.c2);
        ctx.readout('meas', tr('measTwo', { b1: cm(p1.b), g1: dg1(p1.ga), b2: cm(p2.b), g2: dg1(p2.ga) }));
      } else {
        const q = pieces(g.c, s.c);
        ctx.readout('meas', tr('measRead', { a: cm(q.a), b: cm(q.b), c: cm(q.c), al: dg1(q.al), be: dg1(q.be), ga: dg1(q.ga) }));
      }
      ctx.setAction('next', { enabled: !ctx.locked && stepIdx < list.length - 1 });
      ctx.setAction('play', { enabled: !ctx.locked });
      ctx.setAction('restart', { enabled: !ctx.locked && stepIdx > 0 });
    }

    /* ---------- Zeichnen: Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      str = str.replace(/ ([=<>≥+−]) /g, ' $1 ').replace(/ (cm|°)/g, ' $1');
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    function textRows(rows: string[], x: number, y: number, lh: number, f: string, color: string): number {
      rows.forEach((row, i) => text(surface.g, row, x, y + i * lh, { font: f, color, align: 'left', baseline: 'middle' }));
      return rows.length * lh;
    }
    function title(x: number, y: number, label: string, color = ctx.theme.muted, maxW = Infinity): void {
      const g = surface.g;
      let size = F(12, 11);
      g.font = font(700, size);
      while (g.measureText(label).width > maxW && size > 10) {
        size -= 0.5;
        g.font = font(700, size);
      }
      text(g, label, x, y, { font: font(700, size), color, align: 'left' });
    }
    function haloText(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = ctx.theme.bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    function button(r: Rect, label: string, id: string, color: string, filled = false, enabled = true): void {
      const g = surface.g;
      const theme = ctx.theme;
      const hov = hover === id && enabled;
      g.save();
      if (!enabled) g.globalAlpha = 0.45;
      g.fillStyle = filled ? color : withAlpha(color, hov ? 0.16 : theme.dark ? 0.12 : 0.08);
      roundRect(g, r.x, r.y, r.w, r.h, r.h / 2);
      g.fill();
      if (filled && hov) {
        g.fillStyle = 'rgba(255,255,255,0.14)';
        g.fill();
      }
      g.strokeStyle = withAlpha(color, filled ? 1 : 0.6);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, label, r.x + r.w / 2, r.y + r.h / 2 + 0.5, { font: font(700, F(12.5, 12)), color: filled ? onColor() : color });
      g.restore();
      if (enabled) hits.push({ id, r });
    }
    function unit(dx: number, dy: number): Px {
      const l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    }
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
      g.arc(q[0], q[1], r, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
    }

    /* ---------- Papier ---------- */
    function drawPaper(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.clip();
      const s = scale();
      const tl = toWorld(R.x, R.y);
      const br = toWorld(R.x + R.w, R.y + R.h);
      const cell = 0.5;
      g.lineWidth = 1;
      for (const major of [false, true]) {
        g.strokeStyle = major ? withAlpha(theme.grid, 0.9) : theme.gridMinor;
        g.beginPath();
        if (major || s * cell >= 6) {
          for (let k = Math.ceil(tl[0] / cell); k * cell <= br[0]; k++) {
            if ((k % 2 === 0) !== major) continue;
            const x = Math.round(toPx([k * cell, 0])[0]) + 0.5;
            g.moveTo(x, R.y);
            g.lineTo(x, R.y + R.h);
          }
          for (let k = Math.ceil(br[1] / cell); k * cell <= tl[1]; k++) {
            if ((k % 2 === 0) !== major) continue;
            const y = Math.round(toPx([0, k * cell])[1]) + 0.5;
            g.moveTo(R.x, y);
            g.lineTo(R.x + R.w, y);
          }
        }
        g.stroke();
      }
      g.restore();
    }

    /* ---------- Werkzeuge ---------- */
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

    function drawCompass(c: Compass): void {
      const g = surface.g;
      const theme = ctx.theme;
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
      g.globalAlpha = c.alpha;
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
      g.arc(hinge[0], hinge[1], 7.5, 0, Math.PI * 2);
      const hg = g.createRadialGradient(hinge[0] - 2.5, hinge[1] - 2.5, 1, hinge[0], hinge[1], 7.5);
      hg.addColorStop(0, '#ffffff');
      hg.addColorStop(1, metalD);
      g.fillStyle = hg;
      g.fill();
      dot(hinge, 2, steel);
      g.restore();
    }

    function drawRuler(r: NonNullable<CState['ruler']>): void {
      const g = surface.g;
      const theme = ctx.theme;
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
      g.globalAlpha = r.alpha;
      const corners = [P0(0, 0), P0(total, 0), P0(total, wR), P0(0, wR)];
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.beginPath();
      corners.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(52,64,84,0.82)' : 'rgba(255,251,232,0.86)';
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1;
      g.stroke();
      // Skala ab dem Anfangspunkt a (0 cm genau bei a)
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
      const f = font(600, F(10.5, 9.5));
      const every = cmPx < 16 ? 2 : 1;
      for (let k = 0; -start + k * cmPx <= total - 8; k += every) {
        const [x, y] = P0(-start + k * cmPx, wR * 0.64);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        text(g, String(k), 0, 0, { font: f, color: withAlpha(theme.text, 0.8) });
        g.restore();
      }
      g.restore();
    }

    function drawPencil(tip: Px, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const d: Px = [Math.cos(-1.0), Math.sin(-1.0)];
      const n: Px = [-d[1], d[0]];
      const at = (k: number): Px => [tip[0] + d[0] * k, tip[1] + d[1] * k];
      const w = 4.5;
      g.save();
      g.globalAlpha = alpha;
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
      body(16, 74, w * 0.35, w * 0.35, withAlpha('#ffffff', 0.25));
      body(74, 80, w, w, theme.dark ? '#b8c1cd' : '#9aa4b1');
      body(80, 88, w, w, theme.dark ? '#f08fae' : '#ee7f9f');
      g.restore();
    }

    /** Geodreieck mit der Hypotenuse auf der Grundseite, Nullpunkt am Scheitel. */
    function drawGeo(geo: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const R = geoRadius();
      const v = toPx(geo.v);
      const sx = geo.side === 'A' ? 1 : -1;
      // lokale Achsen in Pixeln: u entlang der Grundseite (zur anderen Ecke), n nach oben
      const u: Px = [sx, 0];
      const n: Px = [0, -1];
      const L = (x: number, y: number, slideOff = geo.slide * 40): Px => [v[0] + u[0] * x + n[0] * (y + slideOff), v[1] + u[1] * x + n[1] * (y + slideOff)];
      g.save();
      g.globalAlpha = geo.alpha;
      // Körper
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      g.beginPath();
      const c1 = L(-R * 1.05, -2);
      const c2 = L(R * 1.05, -2);
      const c3 = L(0, R * 1.05 - 2);
      g.moveTo(c1[0], c1[1]);
      g.lineTo(c2[0], c2[1]);
      g.lineTo(c3[0], c3[1]);
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(120,170,220,0.16)' : 'rgba(205,228,250,0.55)';
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? 'rgba(160,200,240,0.55)' : 'rgba(60,110,170,0.5)';
      g.lineWidth = 1.3;
      g.stroke();
      // Aussparung in der Mitte
      g.beginPath();
      const h1 = L(-R * 0.18, R * 0.34);
      const h2 = L(R * 0.18, R * 0.34);
      const h3 = L(0, R * 0.52);
      g.moveTo(h1[0], h1[1]);
      g.lineTo(h2[0], h2[1]);
      g.lineTo(h3[0], h3[1]);
      g.closePath();
      g.fillStyle = withAlpha(theme.bg.startsWith('#') ? theme.bg : '#ffffff', 0.5);
      g.fill();
      g.stroke();
      // Winkelskala
      const rs = R * 0.62;
      const ink = theme.dark ? 'rgba(210,225,245,0.85)' : 'rgba(30,60,100,0.8)';
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      for (let a = 0; a <= 180; a += 5) {
        const l = a % 10 === 0 ? (a % 30 === 0 ? 9 : 6) : 3.5;
        const t = rad(a);
        const p0 = L(Math.cos(t) * rs, Math.sin(t) * rs);
        const p1 = L(Math.cos(t) * (rs - l), Math.sin(t) * (rs - l));
        g.moveTo(p0[0], p0[1]);
        g.lineTo(p1[0], p1[1]);
      }
      g.stroke();
      if (R >= 90) {
        for (let a = 30; a <= 150; a += 30) {
          const t = rad(a);
          const q = L(Math.cos(t) * (rs - 18), Math.sin(t) * (rs - 18));
          text(g, String(a), q[0], q[1], { font: font(600, 9.5), color: ink });
        }
      }
      // Nullpunkt-Marke
      const z0 = L(0, 0);
      const z1 = L(0, 8);
      segment(z0, z1, ink, 1.4);
      // gemessener Winkel als Fächer
      if (geo.sweep > 0) {
        const a1 = geo.ang * geo.sweep;
        g.beginPath();
        g.moveTo(z0[0], z0[1]);
        for (let a = 0; a <= a1 + 1e-9; a += 2) {
          const q = L(Math.cos(rad(a)) * rs, Math.sin(rad(a)) * rs);
          g.lineTo(q[0], q[1]);
        }
        const qe = L(Math.cos(rad(a1)) * rs, Math.sin(rad(a1)) * rs);
        g.lineTo(qe[0], qe[1]);
        g.closePath();
        g.fillStyle = withAlpha(col.giv(), 0.22);
        g.fill();
        segment(z0, L(Math.cos(rad(a1)) * R * 0.9, Math.sin(rad(a1)) * R * 0.9), withAlpha(col.giv(), 0.9), 1.6, [4, 3]);
        const lq = L(Math.cos(rad(a1 / 2)) * rs * 0.55, Math.sin(rad(a1 / 2)) * rs * 0.55);
        if (geo.ang >= 22) haloText(`${fmt.num(Math.round(a1), 0)}°`, lq[0], lq[1], font(800, F(12, 11)), col.giv());
      }
      g.restore();
    }

    /* ---------- Figur ---------- */
    /** Winkelbogen bei v von Richtung from bis to (Grad, gegen den Uhrzeigersinn). */
    function angleArc(v: Pt, from: number, to: number, color: string, label: string | null, scaleT = 1, fill = true): void {
      const g = surface.g;
      const pv = toPx(v);
      const r = F(26, 22) * scaleT;
      if (r < 1) return;
      g.save();
      g.beginPath();
      g.moveTo(pv[0], pv[1]);
      g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
      g.closePath();
      if (fill) {
        g.fillStyle = withAlpha(color, ctx.theme.dark ? 0.24 : 0.16);
        g.fill();
      }
      g.beginPath();
      g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
      g.strokeStyle = color;
      g.lineWidth = 1.8;
      g.stroke();
      g.restore();
      if (label && scaleT > 0.6) {
        const m = rad((from + to) / 2);
        const span = Math.abs(to - from);
        const lr = r + (span < 35 ? F(26, 22) : F(18, 15)) + label.length * 1.6;
        labelIn(label, pv[0] + Math.cos(m) * lr, pv[1] - Math.sin(m) * lr, font(700, F(12.5, 11.5)), color);
      }
    }

    /** Beschriftung, die ganz in der Zeichenfläche bleibt. */
    function labelIn(str: string, x: number, y: number, f: string, color: string): void {
      const { paper } = layout();
      surface.g.font = f;
      const w = surface.g.measureText(str).width / 2 + 6;
      haloText(str, clamp(x, paper.x + w, paper.x + paper.w - w), clamp(y, paper.y + 10, paper.y + paper.h - 10), f, color);
    }

    function sideLabel(a: Px, b: Px, inside: Px, label: string, color: string, bold: boolean, at = 0.5): void {
      const mx = lerp(a[0], b[0], at);
      const my = lerp(a[1], b[1], at);
      let [nx, ny] = unit(-(b[1] - a[1]), b[0] - a[0]);
      if (nx * (inside[0] - mx) + ny * (inside[1] - my) > 0) {
        nx = -nx;
        ny = -ny;
      }
      const g = surface.g;
      g.font = bold ? font(700, F(13, 12)) : font(600, F(12.5, 11.5));
      const w = g.measureText(label).width;
      const off = 10 + Math.abs(nx) * w * 0.5 + Math.abs(ny) * 7;
      labelIn(label, mx + nx * off, my + ny * off, g.font, color);
    }

    function drawFigure(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const st = constrState();
      const s = sol();
      const gv = given();
      const pa = toPx(A);
      const pb = toPx(B());
      const done = st.finish > 0;
      const giv = col.giv();

      // Ergebnis-Dreiecke (unter allem)
      const fillTri = (C: Pt, color: string, alpha: number, k = 1) => {
        const q = [toPx([0, 0]), toPx([gv.c * k, 0]), toPx([C[0] * k, C[1] * k])];
        g.save();
        g.globalAlpha = alpha;
        g.beginPath();
        q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.fillStyle = withAlpha(color, theme.dark ? 0.2 : 0.12);
        g.fill();
        g.restore();
      };
      if (done && s.kind !== 'none') {
        fillTri(s.c, col.res(), st.finish);
        if (s.kind === 'two') fillTri(s.c2, col.res2(), st.finish);
      }
      // WWW: weitere ähnliche Dreiecke
      if (s.kind === 'many') {
        st.family.forEach((f, i) => {
          const k = lerp(1, f.k, f.t);
          const color = col.fam()[i + 1]!;
          fillTri(s.c, color, f.t * 0.9, k);
          const q = [toPx([0, 0]), toPx([gv.c * k, 0]), toPx([s.c[0] * k, s.c[1] * k])];
          g.save();
          g.globalAlpha = Math.min(1, f.t * 2);
          g.beginPath();
          q.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.strokeStyle = color;
          g.lineWidth = 2.4;
          g.lineJoin = 'round';
          g.stroke();
          g.restore();
          if (f.t >= 1) {
            angleArc([gv.c * k, 0], 180 - gv.be, 180, withAlpha(color, 0.9), null, 0.8, false);
            labelIn(i === 0 ? 'B′' : 'B″', q[1]![0] + 10, q[1]![1] + (i === 0 ? 14 : -14), font(800, F(13, 12)), color);
            labelIn(i === 0 ? 'C′' : 'C″', q[2]![0] + (i === 0 ? 12 : -14), q[2]![1] - 10, font(800, F(13, 12)), color);
          }
        });
      }
      // Bögen
      for (const a of st.arcs) {
        const c = toPx(a.c);
        const rpx = a.r * scale();
        g.save();
        g.strokeStyle = col.pencil();
        g.lineWidth = 1.7;
        g.globalAlpha = 0.9;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(c[0], c[1], rpx, -rad(a.a0), -rad(a.a1), a.a1 > a.a0);
        g.stroke();
        g.restore();
      }
      // Radius beim Einstellen des Zirkels
      if (st.radius) {
        const c = toPx(st.radius.c);
        const u = dirW(st.radius.ang);
        const e = toPx([st.radius.c[0] + u[0] * st.radius.r, st.radius.c[1] + u[1] * st.radius.r]);
        g.save();
        g.globalAlpha = st.radius.alpha;
        segment(c, e, giv, 2, [5, 4]);
        const [nx, ny] = unit(-(e[1] - c[1]), e[0] - c[0]);
        const sgn = ny > 0 ? -1 : 1;
        haloText(`${st.radius.label} = ${cm(st.radius.r)}`, (c[0] + e[0]) / 2 + nx * 14 * sgn, (c[1] + e[1]) / 2 + ny * 14 * sgn, font(700, F(12.5, 11.5)), giv);
        g.restore();
      }
      // Linien
      for (const sg of st.segs) {
        const a = toPx(sg.a);
        const b = toPx(typeof sg.b === 'number' ? rayEnd(sg.a, sg.b) : sg.b);
        const e: Px = [lerp(a[0], b[0], sg.t), lerp(a[1], b[1], sg.t)];
        if (sg.kind === 'ray') segment(a, e, withAlpha(col.pencil(), 0.75), 1.6);
        else segment(a, e, sg.kind === 'side2' ? col.res2() : theme.text, 2.6);
      }
      // Markierungen am Geodreieck
      for (const m of st.marks) dot(toPx(m.p), 2.6 * ease.outBack(m.pop), col.pencil());
      // Winkelbögen der gegebenen Winkel
      for (const an of st.angles) {
        const label = `${an.which === 'al' ? 'α' : 'β'} = ${dg(an.which === 'al' ? gv.al : gv.be)}`;
        angleArc(an.v, an.from, an.to, giv, label, ease.outBack(an.pop));
      }
      // Seiten und fehlende Stücke am fertigen Dreieck
      if (done && s.kind !== 'none') {
        g.save();
        g.globalAlpha = st.finish;
        const tris: { C: Pt; color: string; tag: string }[] = [{ C: s.c, color: col.res(), tag: s.kind === 'two' ? '₁' : '' }];
        if (s.kind === 'two') tris.push({ C: s.c2, color: col.res2(), tag: '₂' });
        const giveSide = (k: 'a' | 'b' | 'c') => (k === 'a' ? cs() === 'sss' || cs() === 'ssw' : k === 'b' ? cs() === 'sss' || cs() === 'sws' : cs() !== 'www');
        for (const t of tris) {
          const pc = toPx(t.C);
          const q = pieces(gv.c, t.C);
          const cen: Px = [(pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3];
          const labelFor = (k: 'a' | 'b', v: number) => {
            const giv0 = giveSide(k);
            if (giv0) return { s: `${k} = ${cm(v)}`, c: giv, b: true };
            if (p.meas) return { s: `${k}${t.tag} ≈ ${cm(v)}`, c: t.color, b: false };
            return { s: `${k}${t.tag}`, c: t.color, b: false };
          };
          const la = labelFor('a', q.a);
          const lb = labelFor('b', q.b);
          if (cs() !== 'www') {
            if (!(s.kind === 'two' && t.tag === '₂' && giveSide('a'))) sideLabel(pb, pc, cen, la.s, la.c, la.b);
            sideLabel(pa, pc, cen, lb.s, lb.c, lb.b, t.tag === '₁' ? 0.8 : 0.5);
          }
          // γ immer, α/β nur, wenn nicht gegeben
          const angA = deg(Math.atan2(t.C[1], t.C[0]));
          const angB = deg(Math.atan2(t.C[1], t.C[0] - gv.c));
          const toA = norm360(angA + 180);
          const toB = norm360(angB + 180);
          const gaLab = cs() === 'www' ? `γ = ${dg(180 - gv.al - gv.be)}` : p.meas ? `γ${t.tag} ≈ ${dg1(q.ga)}` : `γ${t.tag}`;
          angleArc(t.C, toA, toA + norm360(toB - toA), t.color, gaLab, 1);
          if (cs() === 'sss') {
            angleArc(A, 0, angA, t.color, p.meas ? `α ≈ ${dg1(q.al)}` : 'α', 1);
            angleArc(B(), angB, 180, t.color, p.meas ? `β ≈ ${dg1(q.be)}` : 'β', 1);
          } else if (cs() === 'sws' || cs() === 'ssw') {
            angleArc(B(), angB, 180, t.color, p.meas ? `β${t.tag} ≈ ${dg1(q.be)}` : `β${t.tag}`, 0.78 + (t.tag === '₂' ? 0.35 : 0));
          }
        }
        g.restore();
      }
      // Grundseite beschriften, sobald sie steht
      if (stepIdx >= 1 && st.segs.length && st.segs[0]!.t >= 1) {
        const k = cs() === 'www' ? 'c' : 'c';
        const lab = `${k} = ${cm(gv.c)}`;
        haloText(lab, (pa[0] + pb[0]) / 2, pa[1] + F(18, 16), font(700, F(13, 12)), cs() === 'www' ? theme.muted : giv);
      }
      // Punkte
      for (const q of st.points) {
        if (q.pop <= 0) continue;
        const [x, y] = toPx(q.p);
        const sc = ease.outBack(q.pop);
        const color = q.color === 'base' ? theme.text : q.color === 'res' ? col.res() : col.res2();
        g.save();
        g.translate(x, y);
        g.scale(sc, sc);
        g.beginPath();
        g.arc(0, 0, 4.6, 0, Math.PI * 2);
        g.fillStyle = color;
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.6;
        g.stroke();
        g.restore();
        const isB = q.label === 'B';
        const lx = q.color === 'base' ? x + (isB ? 14 : -14) : x + (q.label === 'C₂' && s.kind === 'two' && s.c2[0] < s.c[0] ? -16 : 0);
        const ly = q.color === 'base' ? y + 12 : y - 17;
        g.save();
        g.globalAlpha = Math.min(1, q.pop * 1.5);
        haloText(q.label, lx, ly, font(800, F(15, 13)), color);
        g.restore();
      }
      // Griffe (B immer, C nach dem Ende)
      if (!ctx.locked && stepIdx >= 1) {
        const ring = (q: Px, id: string, color: string) => {
          const active = hover === id || drag === id;
          g.beginPath();
          g.arc(q[0], q[1], active ? 15 : 12, 0, Math.PI * 2);
          g.fillStyle = withAlpha(color, active ? 0.26 : 0.12);
          g.fill();
        };
        ring(pb, 'b', theme.text);
        if (constrDone() && s.kind !== 'none' && s.kind !== 'many') {
          ring(toPx(s.c), 'c1', col.res());
          if (s.kind === 'two') ring(toPx(s.c2), 'c2', col.res2());
        }
      }
      // Kein Dreieck: Hinweisschild
      if (done && s.kind === 'none') {
        const { paper } = layout();
        const label = `✗ ${ctx.t('noC')}`;
        g.font = font(700, F(13, 12));
        const w = g.measureText(label).width + 26;
        const h = 28;
        const x = paper.x + paper.w / 2 - w / 2;
        const y = paper.y + 12;
        g.save();
        g.globalAlpha = st.finish;
        g.fillStyle = withAlpha(col.bad(), theme.dark ? 0.22 : 0.12);
        roundRect(g, x, y, w, h, h / 2);
        g.fill();
        g.strokeStyle = withAlpha(col.bad(), 0.7);
        g.lineWidth = 1.3;
        g.stroke();
        text(g, label, x + w / 2, y + h / 2 + 0.5, { font: font(700, F(13, 12)), color: col.bad() });
        g.restore();
      }
      if (st.ruler) drawRuler(st.ruler);
      const compass = st.compass;
      const pencil = st.pencil;
      const geo = st.geo;
      toolsLater = () => {
        if (geo) drawGeo(geo);
        if (pencil.tip && pencil.alpha > 0) drawPencil(toPx(pencil.tip), pencil.alpha);
        if (compass) drawCompass(compass);
      };
    }
    let toolsLater: (() => void) | null = null;

    function drawEmpty(): void {
      const { paper } = layout();
      const g = surface.g;
      const theme = ctx.theme;
      const f = font(600, F(13.5, 12.5));
      const rows = wrap(ctx.t('emptyHint'), Math.min(paper.w - 60, 320), f);
      const lh = 19;
      const w = Math.min(paper.w - 40, 360);
      const h = rows.length * lh + 30;
      const x = paper.x + (paper.w - w) / 2;
      const y = paper.y + (paper.h - h) / 2;
      g.save();
      g.globalAlpha = 0.4 + 0.6 * intro;
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.08 : 0.04);
      roundRect(g, x, y, w, h, 14);
      g.fill();
      g.setLineDash([5, 5]);
      g.strokeStyle = withAlpha(theme.text, 0.25);
      g.lineWidth = 1.2;
      g.stroke();
      g.setLineDash([]);
      rows.forEach((r, i) => text(g, r, paper.x + paper.w / 2, y + 15 + lh / 2 + i * lh, { font: f, color: theme.muted }));
      g.restore();
    }

    /* ---------- Karten ---------- */
    /** Planfigur: Skizze mit markierten gegebenen Stücken. */
    function planCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const giv = col.giv();
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('planT'), theme.muted, R.w - 2 * pad - 60);
      // Fall als Plakette
      const chip = congName();
      g.font = font(800, F(12, 11));
      const cw = g.measureText(chip).width + 18;
      const okCase = !(cs() === 'ssw' && !isSsW(p.a, p.c)) && cs() !== 'www';
      const cc = okCase ? col.ok() : col.bad();
      g.fillStyle = withAlpha(cc, theme.dark ? 0.22 : 0.12);
      roundRect(g, R.x + R.w - pad - cw, R.y + 6, cw, 20, 10);
      g.fill();
      text(g, chip, R.x + R.w - pad - cw / 2, R.y + 16.5, { font: font(800, F(12, 11)), color: cc });
      // Prüfzeile unten
      const chk = ((): string => {
        switch (cs()) {
          case 'sss':
            return ctx.t('chkSSS');
          case 'wsw':
            return ctx.t('chkWSW');
          case 'ssw':
            return ctx.t(isSsW(p.a, p.c) ? 'chkSsW' : 'chkSSW');
          case 'www':
            return tr('chkWWW', { g: dg(180 - p.al - p.be) });
          default:
            return '';
        }
      })();
      const cf = font(600, F(12, 11.5));
      const cRows = chk ? wrap(chk, R.w - 2 * pad, cf) : [];
      const chkH = cRows.length * 16;
      // Skizze (feste Form, keine echten Maße)
      const top = R.y + 34;
      const bot = R.y + R.h - 10 - chkH - (chkH ? 6 : 0);
      const boxH = bot - top;
      const boxW = R.w - 2 * pad - 70;
      const sh: Pt[] = [
        [0, 0],
        [1, 0],
        [0.36, 0.62],
      ];
      const sc = Math.max(10, Math.min(boxW, (boxH - 32) / 0.62));
      const ox = R.x + (R.w - sc) / 2;
      const oy = top + 16 + sc * 0.62 + (boxH - 32 - sc * 0.62) / 2;
      const P = (q: Pt): Px => [ox + q[0] * sc, oy - q[1] * sc];
      const [a, b, c] = sh.map(P) as [Px, Px, Px];
      const giveSide = { a: cs() === 'sss' || cs() === 'ssw', b: cs() === 'sss' || cs() === 'sws', c: cs() !== 'www' };
      const giveAng = { al: cs() !== 'sss', be: cs() === 'wsw' || cs() === 'www', ga: cs() === 'www' };
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.lineTo(c[0], c[1]);
      g.closePath();
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.07 : 0.04);
      g.fill();
      const sideDraw = (u: Px, v: Px, on: boolean) => {
        segment(u, v, on ? giv : withAlpha(theme.text, 0.55), on ? 3.2 : 1.6, on ? undefined : [5, 4]);
      };
      sideDraw(a, b, giveSide.c);
      sideDraw(b, c, giveSide.a);
      sideDraw(a, c, giveSide.b);
      const angW = (v: Pt, from: number, to: number, on: boolean, label: string) => {
        const pv = P(v);
        const r = 15;
        g.beginPath();
        g.moveTo(pv[0], pv[1]);
        g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
        g.closePath();
        g.fillStyle = on ? withAlpha(giv, 0.25) : withAlpha(theme.text, 0.06);
        g.fill();
        g.beginPath();
        g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
        g.strokeStyle = on ? giv : withAlpha(theme.text, 0.35);
        g.lineWidth = on ? 2 : 1.2;
        g.stroke();
        const m = rad((from + to) / 2);
        text(g, label, pv[0] + Math.cos(m) * (r + 9), pv[1] - Math.sin(m) * (r + 9), { font: mathFont(F(12, 11)), color: on ? giv : theme.muted });
      };
      const aA = deg(Math.atan2(0.62, 0.36));
      const aB = deg(Math.atan2(0.62, 0.36 - 1));
      angW(sh[0]!, 0, aA, giveAng.al, 'α');
      angW(sh[1]!, aB, 180, giveAng.be, 'β');
      angW(sh[2]!, aA + 180, aB + 180, giveAng.ga, 'γ');
      // Eckennamen
      text(g, 'A', a[0] - 10, a[1] + 8, { font: font(800, F(12.5, 12)), color: theme.text });
      text(g, 'B', b[0] + 10, b[1] + 8, { font: font(800, F(12.5, 12)), color: theme.text });
      text(g, 'C', c[0], c[1] - 11, { font: font(800, F(12.5, 12)), color: theme.text });
      // Seitennamen mit Werten
      const vf = font(700, F(12, 11));
      const lbl = (on: boolean, nm: string, v: number) => (on ? `${nm} = ${cm(v)}` : nm);
      text(g, lbl(giveSide.c, 'c', p.c), (a[0] + b[0]) / 2, a[1] + 13, { font: vf, color: giveSide.c ? giv : theme.muted });
      text(g, lbl(giveSide.a, 'a', p.a), (b[0] + c[0]) / 2 + 8, (b[1] + c[1]) / 2 - 6, { font: vf, color: giveSide.a ? giv : theme.muted, align: 'left' });
      text(g, lbl(giveSide.b, 'b', p.b), (a[0] + c[0]) / 2 - 8, (a[1] + c[1]) / 2 - 6, { font: vf, color: giveSide.b ? giv : theme.muted, align: 'right' });
      // Winkelwerte unter der Prüfzeile? Nein: neben die Skizze (rechts oben)
      const angVals: string[] = [];
      if (giveAng.al) angVals.push(`α = ${dg(p.al)}`);
      if (giveAng.be) angVals.push(`β = ${dg(p.be)}`);
      angVals.forEach((s, i) => text(g, s, R.x + R.w - pad, top + 8 + i * 17, { font: vf, color: giv, align: 'right' }));
      if (cRows.length) textRows(cRows, R.x + pad, R.y + R.h - 10 - chkH + 8, 16, cf, okCase ? theme.muted : col.bad());
    }

    function stepsCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const list = steps();
      const n = list.length - 1;
      const done = constrDone();
      const s = sol();
      const good = s.kind === 'one' && !(cs() === 'ssw' && !isSsW(p.a, p.c));
      const endColor = good ? col.ok() : s.kind === 'none' ? col.bad() : col.res2();
      const acc = done ? endColor : col.res();
      card(R, acc, done ? 0.06 : 0.03);
      title(R.x + pad, R.y + 16, ctx.t('stepsT'), acc, R.w - 2 * pad - 90);
      if (stepIdx > 0) text(g, tr('stepOf', { i: stepIdx, n }), R.x + R.w - pad, R.y + 16, { font: font(600, 11), color: theme.muted, align: 'right' });
      const f = font(500, F(12.5, 12));
      const fb = font(700, F(12.5, 12));
      const lh = F(16.5, 15.5);
      const bh = 30;
      const btnY = R.y + R.h - F(12, 10) - bh;
      const top = R.y + F(32, 29);
      const textW = R.w - 2 * pad - 30;
      const rowsList = list.map((st, i) => wrap(st.text, textW, i === stepIdx ? fb : f));
      const heights = rowsList.map((r) => r.length * lh + 7);
      const avail = btnY - 8 - top;
      // Fenster um den aktuellen Schritt, wenn nicht alle passen
      let i0 = 0;
      let i1 = list.length - 1;
      const total = (a: number, b: number) => heights.slice(a, b + 1).reduce((x, y) => x + y, 0);
      while (total(i0, i1) > avail && i1 > i0) {
        if (i1 > stepIdx + 1) i1--;
        else if (i0 < stepIdx) i0++;
        else i1--;
      }
      let y = top;
      for (let i = i0; i <= i1; i++) {
        const rows = rowsList[i]!;
        const state = i < stepIdx || (i === stepIdx && done) ? 'done' : i === stepIdx ? 'now' : 'todo';
        const isEnd = i === n;
        const cy = y + lh / 2;
        if (state === 'now' || (isEnd && state === 'done')) {
          g.fillStyle = withAlpha(isEnd ? endColor : col.res(), theme.dark ? 0.16 : 0.09);
          roundRect(g, R.x + pad + 24, y - 3, R.w - 2 * pad - 24, rows.length * lh + 6, 7);
          g.fill();
        }
        g.beginPath();
        g.arc(R.x + pad + 10, cy, 10, 0, Math.PI * 2);
        if (state === 'todo') {
          g.strokeStyle = withAlpha(theme.text, 0.3);
          g.lineWidth = 1.5;
          g.stroke();
        } else {
          g.fillStyle = state === 'done' ? (isEnd ? endColor : col.ok()) : col.res();
          g.fill();
        }
        const sym = state === 'done' ? (isEnd && s.kind === 'none' ? '✗' : '✓') : String(i);
        text(g, sym, R.x + pad + 10, cy + 0.5, { font: font(800, 10.5), color: state === 'todo' ? theme.muted : onColor() });
        textRows(rows, R.x + pad + 30, cy, lh, i === stepIdx ? fb : f, state === 'todo' ? theme.muted : isEnd && state === 'done' ? endColor : theme.text);
        y += heights[i]!;
      }
      if (!ctx.locked) {
        g.font = font(700, F(12.5, 12));
        const nextW = g.measureText(ctx.t('next')).width + 30;
        const roomy = g.measureText(ctx.t('restart')).width + 26 + nextW + 10 <= R.w - 2 * pad;
        const restartW = roomy ? g.measureText(ctx.t('restart')).width + 26 : bh;
        if (!done) button({ x: R.x + R.w - pad - nextW, y: btnY, w: nextW, h: bh }, ctx.t('next'), 'next', col.res(), true, !stepRunning() && !autoPlay);
        else text(g, `✓ ${ctx.t('done')}`, R.x + R.w - pad, btnY + bh / 2, { font: font(800, F(14, 13)), color: endColor, align: 'right' });
        if (stepIdx > 0) button({ x: R.x + pad, y: btnY, w: restartW, h: bh }, roomy ? ctx.t('restart') : '↺', 'restart', theme.muted);
      }
    }

    function congText(): string {
      switch (cs()) {
        case 'sss':
          return ctx.t('congSSS');
        case 'sws':
          return ctx.t('congSWS');
        case 'wsw':
          return ctx.t('congWSW');
        case 'ssw':
          return ctx.t(isSsW(p.a, p.c) ? 'congSsW' : 'congSSW');
        case 'www':
          return ctx.t('congWWW');
      }
    }

    function congCard(R: Rect): void {
      const pad = F(14, 12);
      const f = font(500, F(12.5, 12));
      const rows = wrap(congText(), R.w - 2 * pad, f);
      card(R, col.giv(), 0.04);
      title(R.x + pad, R.y + 16, ctx.t('congT'), col.giv(), R.w - 2 * pad);
      textRows(rows, R.x + pad, R.y + 31 + 8, F(17, 16), f, ctx.theme.text);
    }
    const congH = (w: number) => 31 + wrap(congText(), w - 2 * F(14, 12), font(500, F(12.5, 12))).length * F(17, 16) + 8;

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      hits = [];
      const moving = stepView(dt);
      if (intro < 1) intro = reduced ? 1 : Math.min(1, intro + dt * 2.5);
      surface.begin();
      const lay = layout();
      const g = surface.g;
      drawPaper(lay.paper);
      g.save();
      roundRect(g, lay.paper.x, lay.paper.y, lay.paper.w, lay.paper.h, 10);
      g.clip();
      if (stepIdx === 0) drawEmpty();
      else drawFigure();
      g.restore();
      g.strokeStyle = ctx.theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, lay.paper.x + 0.5, lay.paper.y + 0.5, lay.paper.w - 1, lay.paper.h - 1, 10);
      g.stroke();
      if (toolsLater) {
        toolsLater();
        toolsLater = null;
      }
      const gap = F(10, 8);
      const col0 = lay.side ?? lay.below!;
      const planH = clamp(col0.w * 0.62, 150, 200);
      if (lay.side) {
        const cH = congH(col0.w);
        const stepsH = col0.h - planH - gap - (col0.h - planH - gap - cH - gap >= 230 ? cH + gap : 0);
        planCard({ x: col0.x, y: col0.y, w: col0.w, h: planH });
        stepsCard({ x: col0.x, y: col0.y + planH + gap, w: col0.w, h: stepsH });
        if (stepsH < col0.h - planH - gap) congCard({ x: col0.x, y: col0.y + planH + gap + stepsH + gap, w: col0.w, h: cH });
      } else {
        const ph = Math.min(planH, 170);
        stepsCard({ x: col0.x, y: col0.y, w: col0.w, h: col0.h - ph - gap });
        planCard({ x: col0.x, y: col0.y + col0.h - ph, w: col0.w, h: ph });
      }

      const running = stepRunning();
      if (!running && autoPlay) {
        if (stepIdx < lastIdx()) {
          const since = now - stepStart - stepDur(steps()[stepIdx]!);
          if (since > 450 || reduced) nextStep();
        } else {
          autoPlay = false;
          updateReadouts();
        }
      }
      if (running || autoPlay || moving || intro < 1) ctx.requestRender();
      if (wasRunning && !running) updateReadouts();
      wasRunning = running;
    }

    /* ---------- Zeiger ---------- */
    const canDrag = () => !ctx.locked && !stepRunning() && !autoPlay;

    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
      }
      if (!canDrag() || stepIdx < 1) return null;
      const { paper } = layout();
      if (px < paper.x || px > paper.x + paper.w || py < paper.y || py > paper.y + paper.h) return null;
      const R = wide() ? 18 : 22;
      const cands: [string, Pt][] = [['b', B()]];
      const s = sol();
      if (constrDone() && s.kind !== 'none' && s.kind !== 'many') {
        cands.push(['c1', s.c]);
        if (s.kind === 'two') cands.push(['c2', s.c2]);
      }
      let best: string | null = null;
      let bd = Infinity;
      for (const [id, q] of cands) {
        const [x, y] = toPx(q);
        const d = Math.hypot(px - x, py - y);
        if (d < R && d < bd) {
          bd = d;
          best = id;
        }
      }
      return best;
    }

    /** C ziehen: die gegebenen Stücke passend ändern. */
    function dragC(w: Pt): void {
      const x = w[0];
      const y = Math.max(0.3, w[1]);
      const c = p.c;
      const lenA = Math.hypot(x, y);
      const lenB = Math.hypot(x - c, y);
      const angA = deg(Math.atan2(y, x));
      const angB = deg(Math.atan2(y, c - x));
      const r1 = (v: number) => Math.round(v * 10) / 10;
      switch (cs()) {
        case 'sss':
          ctx.set({ b: r1(lenA), a: r1(lenB) });
          break;
        case 'sws':
          ctx.set({ b: r1(lenA), al: Math.round(clamp(angA, 10, 170)) });
          break;
        case 'wsw': {
          const al = Math.round(clamp(angA, 10, 170));
          const be = Math.round(clamp(angB, 10, 170));
          if (al + be < 180) ctx.set({ al, be });
          break;
        }
        case 'ssw':
          ctx.set({ a: r1(lenB), al: Math.round(clamp(angA, 10, 170)) });
          break;
        default:
          break;
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id === 'b' || id === 'c1' || id === 'c2') drag = id;
        else {
          if (!ctx.locked) {
            if (id === 'next') {
              autoPlay = false;
              nextStep();
            } else if (id === 'restart') restart();
          }
          ctx.requestRender();
          return true;
        }
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag || !canDrag()) return;
        const w = toWorld(q.px, q.py);
        if (drag === 'b') ctx.set({ c: Math.round(clamp(w[0], 2, 10) * 10) / 10 });
        else dragC(w);
        ctx.requestRender();
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const id = q ? hitAt(q.px, q.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(!id ? '' : id === 'next' || id === 'restart' ? 'pointer' : 'grab');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        if (changed.has('cs') && source === 'input') ctx.set(START[cs()]);
        if (changed.has('cs') || source === 'replace' || source === 'init') restart();
        if (stepIdx > lastIdx()) stepIdx = lastIdx();
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'next') {
          autoPlay = false;
          nextStep();
        } else if (id === 'play') {
          if (stepIdx >= lastIdx()) restart();
          autoPlay = true;
          if (!stepRunning()) nextStep();
        } else if (id === 'restart') restart();
        updateReadouts();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
