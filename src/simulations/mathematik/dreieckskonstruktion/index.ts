import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, scaledSprite, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { FAMILY, givenParts, isSsW, pieces, solve, sssGap, sswAnalysis, stepPlan, thirdAngle, type Case, type Given, type Pt, type Solution, type StepKind } from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Vals = Record<string, unknown>;
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm360 = (d: number) => ((d % 360) + 360) % 360;
const TAU = Math.PI * 2;
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
  ssw: { c: 6, a: 4, al: 30 },
  www: { c: 4, al: 50, be: 60 },
};

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

/** Geodreieck am Scheitel v; side 'A': Grundlinie nach rechts, 'B': nach links. */
interface Geo {
  v: Pt;
  side: 'A' | 'B';
  ang: number;
  alpha: number;
  slide: number;
  sweep: number;
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
  arcs: { c: Pt; r: number; a0: number; a1: number; id: 'A' | 'B' }[];
  points: { p: Pt; label: string; pop: number; color: 'base' | 'res' | 'res2' }[];
  marks: { p: Pt; pop: number }[];
  angles: { v: Pt; which: 'al' | 'be'; pop: number }[];
  radius: { c: Pt; ang: number; r: number; alpha: number; label: string } | null;
  ruler: { a: Pt; b: Pt; alpha: number; slide: number } | null;
  pencil: { tip: Pt | null; alpha: number };
  compass: Compass | null;
  geo: Geo | null;
  family: { k: number; t: number }[];
  /** Sonderfall sichtbar machen (Lücke, Abstand h, parallele Schenkel …) */
  special: number;
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
  special: 0,
  finish: 0,
});

interface Step {
  kind: StepKind;
  src: string;
  ops: Op[];
  /** Geodreieck liegt an dieser Ecke (Platz in der Ansicht freihalten). */
  geo?: 'A' | 'B';
}

type HandleId = 'B' | 'C1' | 'C2' | 'armA' | 'armB' | 'rA' | 'rB';
type ButtonId = 'next' | 'restart';

/**
 * Dreiecke aus drei gegebenen Stücken konstruieren (SSS, SWS, WSW, SsW/SSW, WWW):
 * Auf Karopapier zeichnet das Lineal die Grundseite, das Geodreieck trägt Winkel an,
 * ein gezeichneter Zirkel schwingt die Kreisbögen, Schnittpunkte leuchten auf. Jede
 * Zeile der Konstruktionsbeschreibung erscheint passend dazu in einer Karte wie im
 * Heft; daneben die Planfigur mit farbig markierten gegebenen Stücken und eine
 * Ergebniskarte (Bedingung des Kongruenzsatzes mit Zahlen, gemessene Stücke).
 * Sonderfälle: Dreiecksungleichung verletzt (Lücke zwischen den Kreisen), α + β ≥ 180°
 * (parallele bzw. auseinanderlaufende Schenkel), SSW mit keiner, einer (Berührung)
 * oder zwei Lösungen, SsW mit Schnittpunkt hinter A, WWW mit ähnlichen Dreiecken.
 * Die gegebenen Stücke lassen sich direkt in der Zeichnung ziehen.
 */
export default defineSimulation({
  id: 'dreieckskonstruktion',
  dragHint: true,
  layout: { aspect: 1.42, aspectNarrow: 0.36 },
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
    {
      key: 'c',
      type: 'number',
      group: 'given',
      label: L('Seite c = [AB]', 'Side c = AB'),
      help: L('Auch B in der Zeichnung ziehen.', 'You can also drag B in the drawing.'),
      min: 2,
      max: 10,
      step: 0.1,
      default: 6,
      unit: 'cm',
    },
    { key: 'b', type: 'number', group: 'given', label: L('Seite b = [AC]', 'Side b = AC'), min: 1, max: 12, step: 0.1, default: 4.5, unit: 'cm', visibleIf: isCase('sss', 'sws') },
    { key: 'a', type: 'number', group: 'given', label: L('Seite a = [BC]', 'Side a = BC'), min: 1, max: 12, step: 0.1, default: 5, unit: 'cm', visibleIf: isCase('sss', 'ssw') },
    {
      key: 'al',
      type: 'number',
      group: 'given',
      label: L('Winkel α bei A', 'Angle α at A'),
      help: L('Auch am Griff auf dem Schenkel drehen.', 'You can also turn the grip on the arm.'),
      min: 10,
      max: 170,
      step: 1,
      default: 50,
      unit: '°',
      visibleIf: isCase('sws', 'wsw', 'ssw', 'www'),
    },
    { key: 'be', type: 'number', group: 'given', label: L('Winkel β bei B', 'Angle β at B'), min: 10, max: 170, step: 1, default: 60, unit: '°', visibleIf: isCase('wsw', 'www') },
    {
      key: 'meas',
      type: 'boolean',
      group: 'view',
      label: L('Fehlende Stücke messen', 'Measure the missing parts'),
      help: L(
        'Zeigt am fertigen Dreieck die nicht gegebenen Seiten und Winkel. Für Aufgaben ausschalten: Dann bleiben Messwerte und Urteil verdeckt, und die Konstruktion beginnt auf leerem Blatt.',
        'Shows the sides and angles that were not given on the finished triangle. Switch off for tasks: measurements and verdict stay hidden and the construction starts on a blank sheet.',
      ),
      default: true,
    },
  ],
  images: { compass: 'zirkel-teile.webp', pencil: 'bleistift.webp' },
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
    { id: 'sssno', label: L('SSS: Seiten zu kurz', 'SSS: sides too short'), values: { c: 6, b: 3, a: 2 } },
    { id: 'sws', label: L('SWS: Winkel dazwischen', 'SAS: angle in between'), values: { cs: 'sws', c: 6, b: 4.5, al: 50 } },
    { id: 'wsw', label: L('WSW: Seite und zwei Winkel', 'ASA: side and two angles'), values: { cs: 'wsw', c: 6, al: 50, be: 60 } },
    { id: 'ssw2', label: L('SSW: zwei Lösungen', 'SSA: two solutions'), values: { cs: 'ssw', c: 6, a: 4, al: 30 } },
    { id: 'www', label: L('WWW: nur ähnlich', 'AAA: only similar'), values: { cs: 'www', c: 4, al: 50, be: 60 } },
  ],
  strings: {
    de: {
      canvas:
        'Karopapier, auf dem ein Dreieck aus drei gegebenen Stücken Schritt für Schritt mit Lineal, Geodreieck und Zirkel konstruiert wird. Daneben die Planfigur mit den farbig markierten gegebenen Stücken, die Konstruktionsbeschreibung wie im Heft und eine Ergebniskarte mit der Bedingung des Kongruenzsatzes und den gemessenen Stücken.',
    },
    en: {
      canvas:
        'Squared paper on which a triangle is constructed from three given parts step by step with ruler, set square and compasses. Next to it the sketch with the given parts highlighted, the construction steps as in an exercise book and a result card with the condition of the congruence criterion and the measured parts.',
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
    const cs = () => p.cs as Case;

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560 || (isWide() && surface.width < 700);
    const fs = (big: number, small: number) => (sm() ? small : big);
    /** Auf breiten Bühnen liegt die Planfigur als Notizzettel oben links auf dem Papier. */
    function regions(): { paper: Rect; col: Rect; wide: boolean; inset: Rect | null } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.37, 228, 340));
        const paper = { x: 1, y: 1, w: w - cw - 12, h: h - 2 };
        const iw = Math.round(clamp(paper.w * 0.4, 176, 250));
        const ih = Math.round(clamp(iw * 0.62, 122, 150));
        return { paper, col: { x: w - cw, y: 0, w: cw, h }, wide: true, inset: { x: paper.x + 10, y: paper.y + 10, w: iw, h: ih } };
      }
      const ph = Math.round(clamp(h * 0.43, 250, w * 1.02));
      return { paper: { x: 1, y: 1, w: w - 2, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false, inset: null };
    }

    /* ---------- Farben ---------- */
    const col = {
      giv: () => th().series[0]!,
      res: () => th().series[4]!,
      res2: () => th().series[3]!,
      ok: () => th().series[2]!,
      bad: () => th().series[1]!,
      warn: () => th().series[3]!,
      fam: () => [th().series[4]!, th().series[5]!, th().series[3]!],
      pencil: () => (th().dark ? '#c5ccd6' : '#3a414d'),
    };
    const onColor = () => (th().dark ? '#10161f' : '#ffffff');
    const palette = (): Record<string, string> => ({ g: col.giv(), r: col.res(), r2: col.res2(), bad: col.bad(), ok: col.ok(), w: col.warn(), m: th().muted });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;

    /* ---------- Zahlen ---------- */
    const cm = (v: number) => `${fmt.num(v, 1)} cm`;
    const dg = (v: number) => `${fmt.num(v, 0)}°`;
    const dg1 = (v: number) => `${fmt.num(v, 1)}°`;
    const r1 = (v: number) => Math.round(v * 10) / 10;

    /* ---------- angezeigter Zustand (gleitet weich zu den Reglerwerten) ---------- */
    const VA = new Chan(p.a);
    const VB = new Chan(p.b);
    const VC = new Chan(p.c);
    const VAL = new Chan(p.al);
    const VBE = new Chan(p.be);
    const vals = [VA, VB, VC, VAL, VBE];
    const VX = new Chan(0);
    const VY = new Chan(0);
    const VS = new Chan(30);
    const disp = (): Given => ({ a: VA.v, b: VB.v, c: VC.v, al: VAL.v, be: VBE.v });
    /** Werte, die angezeigt werden (auf die Reglerschritte gerundet, damit Zahlen „zählen“). */
    const shown = (): Given => {
      const g = disp();
      return { a: r1(g.a), b: r1(g.b), c: r1(g.c), al: Math.round(g.al), be: Math.round(g.be) };
    };
    const target = (): Given => ({ a: p.a, b: p.b, c: p.c, al: p.al, be: p.be });
    const A: Pt = [0, 0];
    const B = (): Pt => [VC.v, 0];

    let stepIdx = 0;
    let stepStart = -Infinity;
    let autoPlay = false;
    let fast = false;
    let atEnd = false;
    let wasRunning = false;
    let intro: number | null = null;
    let cardFade: number | null = null;
    let hits: { id: HandleId; x: number; y: number; r: number }[] = [];
    let buttons: { id: ButtonId; r: Rect }[] = [];
    let hover: HandleId | ButtonId | null = null;
    let drag: HandleId | null = null;
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

    /* ---------- Lösung ---------- */
    let solCache: { key: string; sol: Solution } | null = null;
    function solOf(g: Given): Solution {
      const key = `${p.cs}|${g.a}|${g.b}|${g.c}|${g.al}|${g.be}`;
      if (solCache?.key !== key) solCache = { key, sol: solve(cs(), g) };
      return solCache.sol;
    }
    const sol = () => solOf(disp());

    /** Punkt auf dem Rand der Zeichenfläche in Richtung d (Grad) ab v (Weltkoordinaten). */
    function rayEnd(v: Pt, d: number): Pt {
      const P = regions().paper;
      const pv = toPx(v);
      const u: Px = [Math.cos(rad(d)), -Math.sin(rad(d))];
      let t = Infinity;
      if (u[0] > 1e-9) t = Math.min(t, (P.x + P.w - pv[0]) / u[0]);
      if (u[0] < -1e-9) t = Math.min(t, (P.x - pv[0]) / u[0]);
      if (u[1] > 1e-9) t = Math.min(t, (P.y + P.h - pv[1]) / u[1]);
      if (u[1] < -1e-9) t = Math.min(t, (P.y - pv[1]) / u[1]);
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
      const P = regions().paper;
      const fits = (side: number) => {
        const y = mid[1] + nUp[1] * hgt * side;
        const x = mid[0] + nUp[0] * hgt * side;
        return y > P.y - 10 && y < P.y + P.h + 10 && x > P.x - 10 && x < P.x + P.w + 10;
      };
      if (fits(up)) return up;
      return fits(-up) ? -up : up;
    }

    function compassIn(pin: Pt, ang: number, r: number, label: string, dur = 1100): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(pin, r, ang);
          const t1 = clamp01(t / 0.45);
          const t2 = clamp01((t - 0.45) / 0.55);
          const e = ease.outCubic(t1);
          const rr = lerp(r * 0.3, r, ease.inOutCubic(t2));
          s.compass = { pin: [pin[0] + (1 - e) * 1.6, pin[1] + (1 - e) * 1.1], ang: ang - (1 - e) * 25, r: rr, alpha: Math.min(1, t1 * 2), bend: side };
          s.radius = t2 > 0 ? { c: pin, ang, r: rr, alpha: Math.min(1, t2 * 2), label } : null;
        },
      };
    }
    function arcOp(c: Pt, r: number, a0: number, a1: number, id: 'A' | 'B', dur = 1100): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(c, r, (a0 + a1) / 2);
          const a = a0 + (a1 - a0) * ease.inOutCubic(t);
          s.radius = null;
          if (t > 0) s.arcs.push({ c, r, a0, a1: a, id });
          s.compass = { pin: c, ang: a, r, alpha: 1, bend: side };
        },
      };
    }
    function compassOut(dur = 420): Op {
      return {
        dur,
        apply(s, t) {
          if (!s.compass) return;
          const c = s.compass;
          s.compass = t >= 1 ? null : { ...c, pin: [c.pin[0] + t * 1.6, c.pin[1] + t * 1.1], alpha: 1 - t };
        },
      };
    }
    function markOp(points: { p: Pt; label: string; color: 'base' | 'res' | 'res2' }[], dur = 650): Op {
      return {
        dur,
        apply(s, t) {
          points.forEach((q, i) => s.points.push({ ...q, pop: clamp01(t * (points.length + 0.6) - i * 0.6) }));
        },
      };
    }
    /** Strecke bzw. Halbgerade mit Lineal und Bleistift ziehen. */
    function lineOps(a: Pt, b: Pt | number, kind: Seg['kind'], dur = 900): Op[] {
      const end = () => (typeof b === 'number' ? rayEnd(a, b) : b);
      return [
        {
          dur: 480,
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
          dur: 340,
          apply(s, t) {
            s.pencil = { tip: null, alpha: 0 };
            s.ruler = t >= 1 ? null : { a, b: end(), alpha: 1 - t, slide: t * 0.7 };
          },
        },
      ];
    }
    /** Mehrere Strecken gleichzeitig (ohne Lineal), z. B. zum Verbinden. */
    function joinOp(list: { a: Pt; b: Pt; kind: Seg['kind'] }[], dur = 750): Op {
      return {
        dur,
        apply(s, t) {
          for (const q of list) s.segs.push({ ...q, t: ease.inOutCubic(t) });
        },
      };
    }
    const geoRadius = () => fs(100, 78);
    /** Punkt, den man am Geodreieck markiert (für die Halbgerade). */
    function geoMark(v: Pt, side: 'A' | 'B', ang: number): Pt {
      const Rw = geoRadius() / scale();
      const u = dirW(side === 'A' ? ang : 180 - ang);
      return [v[0] + u[0] * Rw * 0.82, v[1] + u[1] * Rw * 0.82];
    }
    function geoOp(v: Pt, side: 'A' | 'B', ang: number): Op {
      return {
        dur: 1600,
        apply(s, t) {
          const t1 = clamp01(t / 0.3);
          const t2 = clamp01((t - 0.32) / 0.45);
          const t3 = clamp01((t - 0.8) / 0.2);
          s.geo = { v, side, ang, alpha: t1, slide: 1 - ease.outCubic(t1), sweep: ease.inOutCubic(t2) };
          if (t3 > 0) s.marks.push({ p: geoMark(v, side, ang), pop: t3 });
        },
      };
    }
    /** Ein Strahl, nachdem das Geodreieck weggelegt wurde; danach erscheint der Winkelbogen. */
    function rayAfterGeo(v: Pt, side: 'A' | 'B', ang: number, which: 'al' | 'be'): Op[] {
      return [
        {
          dur: 360,
          apply(s, t) {
            if (s.geo) s.geo = t >= 1 ? null : { ...s.geo, alpha: 1 - t, slide: t * 0.6 };
          },
        },
        ...lineOps(v, side === 'A' ? ang : 180 - ang, 'ray', 800),
        {
          dur: 420,
          apply(s, t) {
            s.angles.push({ v, which, pop: t });
          },
        },
      ];
    }
    const valueOp = (key: 'finish' | 'special', dur: number): Op => ({
      dur,
      apply(s, t) {
        s[key] = t;
      },
    });
    const familyOp = (k: number, dur = 1100): Op => ({
      dur,
      apply(s, t) {
        s.family.push({ k, t: ease.inOutCubic(t) });
      },
    });

    /* ---------- Schritte (Text wie im Heft + Teilbewegungen) ---------- */
    const G = (s: string) => `\\c{g}{${s}}`;
    const Rr = (s: string) => `\\c{r}{${s}}`;
    const R2 = (s: string) => `\\c{r2}{${s}}`;
    const angTo = (from: Pt, to: Pt) => deg(Math.atan2(to[1] - from[1], to[0] - from[0]));

    let stepsCache: { key: string; steps: Step[] } | null = null;
    function steps(): Step[] {
      const g = disp();
      const P = regions().paper;
      const key = `${p.cs}|${g.a}|${g.b}|${g.c}|${g.al}|${g.be}|${P.w}|${P.h}`;
      if (stepsCache?.key === key) return stepsCache.steps;
      stepsCache = { key, steps: buildSteps() };
      return stepsCache.steps;
    }

    function missingList(two: boolean): string {
      const gp = givenParts(cs());
      const names: string[] = [];
      for (const [k, n] of [
        ['a', 'a'],
        ['b', 'b'],
        ['c', 'c'],
        ['al', 'α'],
        ['be', 'β'],
      ] as const)
        if (!gp[k]) names.push(n);
      names.push('γ');
      const shownNames = names.map((n) => Rr(two && n !== 'c' && n !== 'α' && n !== 'a' ? `${n}₁, ${n}₂` : n));
      const last = shownNames.pop()!;
      return shownNames.length ? `${shownNames.join(', ')} ${say(L('und', 'and'))} ${last}` : last;
    }

    function buildSteps(): Step[] {
      const g = disp();
      const v = shown();
      const s = sol();
      const b = B();
      const plan = stepPlan(cs(), s);
      const C = s.kind === 'none' ? null : s.c;
      const cRes = (q: Pt, label = 'C', color: 'res' | 'res2' = 'res') => ({ p: q, label, color });
      const list: Step[] = [];
      const ssw = cs() === 'ssw' ? sswAnalysis(g.c, g.a, g.al) : null;
      for (const kind of plan) {
        switch (kind) {
          case 'base':
            list.push({
              kind,
              src:
                cs() === 'www'
                  ? say(L(`Zeichne eine Strecke [AB] beliebiger Länge, hier c = ${cm(v.c)}.`, `Draw a segment [AB] of any length, here c = ${cm(v.c)}.`))
                  : say(L(`Zeichne [AB] mit ${G(`c = ${cm(v.c)}`)}.`, `Draw [AB] with ${G(`c = ${cm(v.c)}`)}.`)),
              ops: [
                ...lineOps(A, b, 'side'),
                markOp([
                  { p: A, label: 'A', color: 'base' },
                  { p: b, label: 'B', color: 'base' },
                ]),
              ],
            });
            break;
          case 'circA':
          case 'circB': {
            const isA = kind === 'circA';
            const r = isA ? g.b : g.a;
            const pin = isA ? A : b;
            let a0: number;
            let a1: number;
            if (C) {
              const m = angTo(pin, C);
              a0 = m + (isA ? -22 : 22);
              a1 = m + (isA ? 22 : -22);
            } else {
              a0 = isA ? 4 : 176;
              a1 = isA ? 176 : 4;
            }
            list.push({
              kind,
              src: isA
                ? say(L(`Zeichne einen Kreis um A mit r = ${G(`b = ${cm(v.b)}`)}.`, `Draw the circle around A with r = ${G(`b = ${cm(v.b)}`)}.`))
                : say(L(`Zeichne einen Kreis um B mit r = ${G(`a = ${cm(v.a)}`)}.`, `Draw the circle around B with r = ${G(`a = ${cm(v.a)}`)}.`)),
              ops: [compassIn(pin, a0, r, isA ? 'b' : 'a'), arcOp(pin, r, a0, a1, isA ? 'A' : 'B', C ? 1100 : 1700), ...(isA ? [] : [compassOut()])],
            });
            break;
          }
          case 'cut':
            list.push({ kind, src: say(L(`Die Kreise schneiden sich oberhalb von [AB] in ${Rr('C')}.`, `Above [AB] the circles meet at ${Rr('C')}.`)), ops: [markOp([cRes(C!)], 800)] });
            break;
          case 'cutNo': {
            const flat = s.kind === 'none' && s.reason === 'flat';
            list.push({
              kind,
              src: flat
                ? say(L('Die Kreise berühren sich nur auf [AB] – C läge auf der Strecke.', 'The circles only touch on [AB] – C would lie on the segment.'))
                : say(L('Die Kreise schneiden sich nicht.', 'The circles do not meet.')),
              ops: [valueOp('special', 900)],
            });
            break;
          }
          case 'join':
            list.push({
              kind,
              src: say(L(`Verbinde ${Rr('C')} mit A und B.`, `Join ${Rr('C')} to A and B.`)),
              ops: [
                joinOp([
                  { a: A, b: C!, kind: 'side' },
                  { a: b, b: C!, kind: 'side' },
                ]),
              ],
            });
            break;
          case 'angA':
            list.push({ kind, src: say(L(`Trage in A an [AB] den Winkel ${G(`α = ${dg(v.al)}`)} an.`, `At A, mark the angle ${G(`α = ${dg(v.al)}`)} on [AB].`)), ops: [geoOp(A, 'A', g.al)], geo: 'A' });
            break;
          case 'armA':
            list.push({ kind, src: say(L('Zeichne den freien Schenkel von α.', 'Draw the free arm of α.')), ops: rayAfterGeo(A, 'A', g.al, 'al'), geo: 'A' });
            break;
          case 'angB':
            list.push({ kind, src: say(L(`Trage in B an [BA] den Winkel ${G(`β = ${dg(v.be)}`)} an.`, `At B, mark the angle ${G(`β = ${dg(v.be)}`)} on [BA].`)), ops: [geoOp(b, 'B', g.be)], geo: 'B' });
            break;
          case 'armB': {
            let src: string;
            if (C) src = say(L(`Zeichne den freien Schenkel von β. Er schneidet den Schenkel von α in ${Rr('C')}.`, `Draw the free arm of β. It meets the arm of α at ${Rr('C')}.`));
            else if (s.kind === 'none' && s.reason === 'parallel') src = say(L('Zeichne den freien Schenkel von β. Die Schenkel sind parallel – kein Schnittpunkt.', 'Draw the free arm of β. The arms are parallel – no intersection.'));
            else src = say(L('Zeichne den freien Schenkel von β. Die Schenkel laufen auseinander.', 'Draw the free arm of β. The arms move apart.'));
            list.push({ kind, src, ops: [...rayAfterGeo(b, 'B', g.be, 'be'), ...(C ? [markOp([cRes(C)], 800)] : [valueOp('special', 800)])], geo: 'B' });
            break;
          }
          case 'circArm':
            list.push({
              kind,
              src: say(L(`Der Kreis um A mit r = ${G(`b = ${cm(v.b)}`)} schneidet den Schenkel in ${Rr('C')}.`, `The circle around A with r = ${G(`b = ${cm(v.b)}`)} cuts the arm at ${Rr('C')}.`)),
              ops: [compassIn(A, g.al - 16, g.b, 'b'), arcOp(A, g.b, g.al - 16, g.al + 16, 'A', 800), compassOut(), markOp([cRes(C!)], 800)],
            });
            break;
          case 'joinB':
            list.push({ kind, src: say(L(`Verbinde ${Rr('C')} mit B.`, `Join ${Rr('C')} to B.`)), ops: lineOps(b, C!, 'side', 750) });
            break;
          case 'circBArm': {
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
              const f = ssw!.foot;
              const tf = g.al < 90 ? angTo(b, f) : 180;
              a0 = Math.min(178, tf + 40);
              a1 = tf - 40;
            }
            list.push({ kind, src: say(L(`Zeichne einen Kreis um B mit r = ${G(`a = ${cm(v.a)}`)}.`, `Draw the circle around B with r = ${G(`a = ${cm(v.a)}`)}.`)), ops: [compassIn(b, a0, g.a, 'a'), arcOp(b, g.a, a0, a1, 'B', 1300), compassOut()] });
            break;
          }
          case 'cut2':
            list.push({ kind, src: say(L(`Der Kreis schneidet den Schenkel zweimal: in ${Rr('C₁')} und ${R2('C₂')}.`, `The circle cuts the arm twice: at ${Rr('C₁')} and ${R2('C₂')}.`)), ops: [markOp([cRes((s as { c: Pt }).c, 'C₁'), cRes((s as { c2: Pt }).c2, 'C₂', 'res2')], 900), valueOp('special', 500)] });
            break;
          case 'cut1':
            list.push({
              kind,
              src:
                ssw?.kind === 'touch'
                  ? say(L(`Der Kreis berührt den Schenkel in genau einem Punkt ${Rr('C')}.`, `The circle touches the arm at exactly one point ${Rr('C')}.`))
                  : say(L(`Der Kreis schneidet den Schenkel in ${Rr('C')}.`, `The circle cuts the arm at ${Rr('C')}.`)),
              ops: [markOp([cRes(C!)], 800), valueOp('special', 600)],
            });
            break;
          case 'cut0':
            list.push({
              kind,
              src:
                s.kind === 'none' && s.reason === 'touchA'
                  ? say(L('Der Kreis trifft den Schenkel nur in A.', 'The circle meets the arm only at A.'))
                  : say(L('Der Kreis erreicht den Schenkel nicht.', 'The circle does not reach the arm.')),
              ops: [valueOp('special', 900)],
            });
            break;
          case 'join2':
            list.push({
              kind,
              src: say(L(`Verbinde ${Rr('C₁')} und ${R2('C₂')} mit B.`, `Join ${Rr('C₁')} and ${R2('C₂')} to B.`)),
              ops: [
                joinOp([
                  { a: b, b: (s as { c: Pt }).c, kind: 'side' },
                  { a: b, b: (s as { c2: Pt }).c2, kind: 'side2' },
                ]),
              ],
            });
            break;
          case 'fam1':
            list.push({ kind, src: say(L('Gleiche Winkel an einer längeren Grundseite: ein größeres Dreieck.', 'Same angles on a longer base: a bigger triangle.')), ops: [valueOp('finish', 500), familyOp(FAMILY[0])] });
            break;
          case 'fam2':
            list.push({ kind, src: say(L('Gleiche Winkel an einer kürzeren Grundseite: ein kleineres Dreieck.', 'Same angles on a shorter base: a smaller triangle.')), ops: [familyOp(FAMILY[1])] });
            break;
          case 'measure':
            list.push({ kind, src: say(L(`Miss die fehlenden Stücke ${missingList(s.kind === 'two')}.`, `Measure the missing parts ${missingList(s.kind === 'two')}.`)), ops: [valueOp('finish', 1400)] });
            break;
          case 'end':
            list.push({
              kind,
              src:
                s.kind === 'none'
                  ? `\\c{bad}{${say(L('Ergebnis: Es gibt kein solches Dreieck.', 'Result: there is no such triangle.'))}}`
                  : `\\c{w}{${say(L('Gleiche Winkel, verschiedene Größe: ähnlich, aber nicht kongruent.', 'Same angles, different sizes: similar but not congruent.'))}}`,
              ops: [valueOp('finish', 900)],
            });
            break;
        }
      }
      return list;
    }

    const stepDur = (st: Step) => st.ops.reduce((s, o) => s + o.dur, 0);
    const speed = () => (fast ? 3.4 : 1);
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
    /** Fortschritt des aktuellen Schritts (0 … 1) – für das Einblenden der Textzeile. */
    function stepProgress(now: number): number {
      if (reduced || stepIdx === 0) return 1;
      const st = steps()[stepIdx - 1];
      if (!st) return 1;
      return clamp01(((now - stepStart) * speed()) / Math.max(1, stepDur(st)));
    }

    function nextStep(): void {
      const now = performance.now();
      if (stepRunning(now)) return;
      if (stepIdx >= nSteps()) {
        // fertig: neu konstruieren
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
      updateReadouts();
      ctx.requestRender();
    }
    /** Ganze Konstruktion zügig abspielen (Einstieg, Fallwechsel, Beispiel). */
    function replay(): void {
      restart();
      if (!p.meas) return;
      if (reduced) {
        stepIdx = nSteps();
        atEnd = true;
        updateReadouts();
        return;
      }
      fast = true;
      autoPlay = true;
      nextStep();
    }

    /* ---------- Ansicht einpassen ---------- */
    function targetView(): { cx: number; cy: number; s: number } {
      const P = regions().paper;
      const g = disp();
      const s = sol();
      const pts: Pt[] = [A, B()];
      if (s.kind !== 'none') pts.push(s.c);
      if (s.kind === 'two') pts.push(s.c2);
      if (s.kind === 'many') for (const k of FAMILY) pts.push([s.c[0] * k, s.c[1] * k], [g.c * k, 0]);
      if (cs() === 'ssw') {
        const an = sswAnalysis(g.c, g.a, g.al);
        if (an.behind && Math.hypot(an.behind[0], an.behind[1]) < 1.6 * g.c) pts.push(an.behind);
        if (s.kind === 'none') pts.push(an.foot, [g.c, Math.min(g.a, g.c)], [g.c - Math.min(g.a, g.c) * 0.7, 0]);
      }
      if (s.kind === 'none') {
        if (cs() === 'sss') pts.push([-g.b, 0], [g.c + g.a, 0], [0, g.b], [g.c, g.a]);
        else if (cs() !== 'ssw') pts.push([g.c * 0.5, g.c * 0.55]);
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
      const geoAt = cur && !finished() ? cur.geo : undefined;
      const geoPad = geoRadius() * 1.1;
      // Zirkel braucht seitlich Platz, solange er arbeitet
      const compassNow = cur && !finished() && ['circA', 'circB', 'circArm', 'circBArm'].includes(cur.kind) ? fs(72, 52) : 0;
      const padL = Math.max(fs(44, 30), geoAt === 'A' ? geoPad : 0, compassNow);
      const padR = Math.max(fs(44, 30), geoAt === 'B' ? geoPad : 0, compassNow);
      const inset = regions().inset;
      const padTop = Math.max(fs(66, 48), inset ? inset.h + 22 : 0);
      const padBot = fs(58, 46);
      const bw = Math.max(1, x1 - x0);
      const bh = Math.max(1, y1 - y0);
      const sc = clamp(Math.min((P.w - padL - padR) / bw, (P.h - padTop - padBot) / bh), 6, fs(88, 64));
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
        else if (Math.abs(c.goal - v) > 1e-6) c.follow(v, 0.22);
      }
    }

    /* ---------- Ergebnisse ---------- */
    const congName = (g: Given = target()): string => {
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
    const plain = (src: string) =>
      src
        .replace(/\\[ctb]\{[^}]*\}\{([^}]*)\}/g, '$1')
        .replace(/\\[tb]\{([^}]*)\}/g, '$1')
        .replace(/\\c\{[^}]*\}\{([^}]*)\}/g, '$1');

    function updateReadouts(): void {
      const g = target();
      const s = solve(cs(), g);
      const gp = givenParts(cs());
      const parts: string[] = [];
      if (gp.a) parts.push(`<var>a</var> = ${cm(g.a)}`);
      if (gp.b) parts.push(`<var>b</var> = ${cm(g.b)}`);
      if (gp.c) parts.push(`<var>c</var> = ${cm(g.c)}`);
      if (gp.al) parts.push(`<var>α</var> = ${dg(g.al)}`);
      if (gp.be) parts.push(`<var>β</var> = ${dg(g.be)}`);
      ctx.readout('given', { html: `${parts.join(', ')} (${congName(g)})` });
      const list = steps();
      const cur = list[stepIdx - 1];
      ctx.readout('step', cur ? `${say(L('Schritt', 'Step'))} ${stepIdx} ${say(L('von', 'of'))} ${list.length}: ${plain(cur.src)}` : say(L('Noch nicht begonnen – „Nächster Schritt“ drücken.', 'Not started yet – press “Next step”.')));
      if (s.kind === 'none') {
        const why: Record<string, Txt> = {
          triangle: L('Dreiecksungleichung verletzt', 'triangle inequality violated'),
          flat: L('a + b = c, die Kreise berühren sich nur auf [AB]', 'a + b = c, the circles only touch on [AB]'),
          angles: L('α + β > 180°', 'α + β > 180°'),
          parallel: L('α + β = 180°, Schenkel parallel', 'α + β = 180°, arms parallel'),
          short: L('a ist kürzer als der Abstand von B zum Schenkel', 'a is shorter than the distance from B to the arm'),
          touchA: L('der Kreis trifft den Schenkel nur in A', 'the circle meets the arm only at A'),
        };
        ctx.readout('res', `${say(L('nicht konstruierbar', 'not constructible'))}: ${say(why[s.reason]!)}`);
      } else if (s.kind === 'two') ctx.readout('res', say(L('zwei verschiedene Dreiecke (SSW, a < c) – nicht eindeutig', 'two different triangles (SSA, a < c) – not unique')));
      else if (s.kind === 'many') ctx.readout('res', say(L(`unendlich viele ähnliche Dreiecke, γ = ${dg(thirdAngle(g.al, g.be))} (WWW ist kein Kongruenzsatz)`, `infinitely many similar triangles, γ = ${dg(thirdAngle(g.al, g.be))} (AAA is not a congruence criterion)`)));
      else if (cs() === 'ssw' && !isSsW(g.a, g.c)) ctx.readout('res', say(L('genau ein Dreieck – der Kreis berührt den Schenkel (rechter Winkel bei C)', 'exactly one triangle – the circle touches the arm (right angle at C)')));
      else ctx.readout('res', say(L(`eindeutig konstruierbar (Kongruenzsatz ${congName(g)})`, `uniquely constructible (${congName(g)})`)));
      if (s.kind === 'none' || s.kind === 'many') ctx.readout('meas', null);
      else {
        const fmtQ = (q: ReturnType<typeof pieces>, tag = '') => {
          const out: string[] = [];
          if (!gp.a) out.push(`<var>a</var>${tag} ≈ ${cm(q.a)}`);
          if (!gp.b) out.push(`<var>b</var>${tag} ≈ ${cm(q.b)}`);
          if (!gp.al) out.push(`<var>α</var> ≈ ${dg1(q.al)}`);
          if (!gp.be) out.push(`<var>β</var>${tag} ≈ ${dg1(q.be)}`);
          out.push(`<var>γ</var>${tag} ≈ ${dg1(q.ga)}`);
          return out.join(', ');
        };
        if (s.kind === 'two') ctx.readout('meas', { html: `${fmtQ(pieces(g.c, s.c), '<sub>1</sub>')}; ${fmtQ(pieces(g.c, s.c2), '<sub>2</sub>')}` });
        else ctx.readout('meas', { html: fmtQ(pieces(g.c, s.c)) });
      }
      const done = stepIdx >= list.length && !stepRunning();
      ctx.setAction('next', { enabled: !ctx.locked, label: done ? say(L('Neu konstruieren', 'Construct again')) : say(L('Nächster Schritt', 'Next step')) });
      ctx.setAction('play', { enabled: !ctx.locked });
      ctx.setAction('restart', { enabled: !ctx.locked && stepIdx > 0 });
    }

    /* =====================================================================
     * Zeichenhilfen
     * ===================================================================== */
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
    function arrowHead(tip: Px, dir: Px, color: string, size: number): void {
      const g = surface.g;
      const [ux, uy] = unit(dir[0], dir[1]);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(tip[0], tip[1]);
      g.lineTo(tip[0] - ux * size - uy * size * 0.45, tip[1] - uy * size + ux * size * 0.45);
      g.lineTo(tip[0] - ux * size + uy * size * 0.45, tip[1] - uy * size - ux * size * 0.45);
      g.closePath();
      g.fill();
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
      const base = y + (box.asc - box.desc) / 2;
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
        .replace(/ (cm|°)/g, '\u00a0$1')
        .replace(/\\c\{(\w+)\}\{([^{}]*)\}/g, (_m, k: string, inner: string) =>
          inner
            .replace(/ = /g, '\u00a0=\u00a0')
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

    /* =====================================================================
     * Papier und Werkzeuge
     * ===================================================================== */
    const paperColor = () => (th().dark ? '#121923' : '#fdfdfb');
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
        glow.addColorStop(0, withAlpha(col.giv(), 0.35));
        glow.addColorStop(1, withAlpha(col.giv(), 0));
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
      // Mine leuchtet beim Zeichnen
      const glow = g.createRadialGradient(pen[0], pen[1], 0, pen[0], pen[1], 9);
      glow.addColorStop(0, withAlpha(col.giv(), 0.35));
      glow.addColorStop(1, withAlpha(col.giv(), 0));
      g.fillStyle = glow;
      g.beginPath();
      g.arc(pen[0], pen[1], 9, 0, TAU);
      g.fill();
      g.restore();
    }

    function drawRuler(r: NonNullable<CState['ruler']>): void {
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
      const f = font(600, 11);
      const every = cmPx < 18 ? 2 : 1;
      g.fillStyle = withAlpha(theme.text, 0.8);
      g.font = f;
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

    /** Geodreieck mit der langen Seite auf der Grundseite, Nullpunkt am Scheitel. */
    function drawGeo(geo: Geo): void {
      const g = surface.g;
      const theme = th();
      const R = geoRadius();
      const v = toPx(geo.v);
      const sx = geo.side === 'A' ? 1 : -1;
      const Lp = (x: number, y: number, slideOff = geo.slide * 40): Px => [v[0] + sx * x, v[1] - (y + slideOff)];
      g.save();
      g.globalAlpha *= geo.alpha;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      g.beginPath();
      const c1 = Lp(-R * 1.05, -2);
      const c2 = Lp(R * 1.05, -2);
      const c3 = Lp(0, R * 1.05 - 2);
      g.moveTo(c1[0], c1[1]);
      g.lineTo(c2[0], c2[1]);
      g.lineTo(c3[0], c3[1]);
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(120,170,220,0.16)' : 'rgba(205,228,250,0.6)';
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? 'rgba(160,200,240,0.55)' : 'rgba(60,110,170,0.5)';
      g.lineWidth = 1.3;
      g.stroke();
      // Aussparung
      g.beginPath();
      const h1 = Lp(-R * 0.18, R * 0.34);
      const h2 = Lp(R * 0.18, R * 0.34);
      const h3 = Lp(0, R * 0.52);
      g.moveTo(h1[0], h1[1]);
      g.lineTo(h2[0], h2[1]);
      g.lineTo(h3[0], h3[1]);
      g.closePath();
      g.fillStyle = withAlpha(paperColor(), 0.6);
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
        const p0 = Lp(Math.cos(t) * rs, Math.sin(t) * rs);
        const p1 = Lp(Math.cos(t) * (rs - l), Math.sin(t) * (rs - l));
        g.moveTo(p0[0], p0[1]);
        g.lineTo(p1[0], p1[1]);
      }
      g.stroke();
      if (R >= 90) {
        g.font = font(600, 11);
        g.fillStyle = ink;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        for (let a = 30; a <= 150; a += 30) {
          const q = Lp(Math.cos(rad(a)) * (rs - 19), Math.sin(rad(a)) * (rs - 19));
          g.fillText(String(a), q[0], q[1]);
        }
      }
      const z0 = Lp(0, 0);
      segment(z0, Lp(0, 8), ink, 1.4);
      if (geo.sweep > 0) {
        const a1 = geo.ang * geo.sweep;
        g.beginPath();
        g.moveTo(z0[0], z0[1]);
        for (let a = 0; a <= a1 + 1e-9; a += 2) {
          const q = Lp(Math.cos(rad(a)) * rs, Math.sin(rad(a)) * rs);
          g.lineTo(q[0], q[1]);
        }
        const qe = Lp(Math.cos(rad(a1)) * rs, Math.sin(rad(a1)) * rs);
        g.lineTo(qe[0], qe[1]);
        g.closePath();
        g.fillStyle = withAlpha(col.giv(), 0.24);
        g.fill();
        segment(z0, Lp(Math.cos(rad(a1)) * R * 0.9, Math.sin(rad(a1)) * R * 0.9), withAlpha(col.giv(), 0.9), 1.6, [4, 3]);
        const lq = Lp(Math.cos(rad(a1 / 2)) * rs * 0.55, Math.sin(rad(a1 / 2)) * rs * 0.55);
        if (geo.ang >= 22) haloText(`${fmt.num(Math.round(a1), 0)}°`, lq[0], lq[1], font(800, fs(12.5, 11.5)), col.giv());
      }
      g.restore();
    }

    /* =====================================================================
     * Figur
     * ===================================================================== */
    /** Winkelbogen bei v von Richtung from bis to (Grad, gegen den Uhrzeigersinn). */
    function angleArc(v: Pt, from: number, to: number, color: string, label: string | null, scaleT = 1, fill = true, rBase = fs(26, 22)): void {
      const g = surface.g;
      const pv = toPx(v);
      const r = rBase * scaleT;
      if (r < 1) return;
      const right = Math.abs(norm360(to - from) - 90) < 0.05;
      g.save();
      if (right) {
        // rechter Winkel: Viertelkreis mit Punkt
        g.beginPath();
        g.moveTo(pv[0], pv[1]);
        g.arc(pv[0], pv[1], r * 0.8, -rad(from), -rad(to), true);
        g.closePath();
        g.fillStyle = withAlpha(color, th().dark ? 0.24 : 0.16);
        g.fill();
        g.strokeStyle = color;
        g.lineWidth = 1.8;
        g.stroke();
        const m = rad((from + to) / 2);
        dot([pv[0] + Math.cos(m) * r * 0.42, pv[1] - Math.sin(m) * r * 0.42], 2.2, color);
      } else {
        g.beginPath();
        g.moveTo(pv[0], pv[1]);
        g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
        g.closePath();
        if (fill) {
          g.fillStyle = withAlpha(color, th().dark ? 0.24 : 0.16);
          g.fill();
        }
        g.beginPath();
        g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
        g.strokeStyle = color;
        g.lineWidth = 1.8;
        g.stroke();
      }
      g.restore();
      if (label && scaleT > 0.6) {
        const m = rad((from + to) / 2);
        const span = Math.abs(to - from);
        g.font = font(700, fs(12.5, 11.5));
        const lw = g.measureText(label).width;
        if (span < 16) {
          // sehr spitzer Winkel: Beschriftung hinter den Scheitel, sonst liegt sie auf den Schenkeln
          const lb = 14 + Math.abs(Math.cos(m)) * lw * 0.5 + Math.abs(Math.sin(m)) * 8;
          labelIn(label, pv[0] - Math.cos(m) * lb, pv[1] + Math.sin(m) * lb, font(700, fs(12.5, 11.5)), color);
        } else {
          const lr = r + (span < 40 ? 14 : 8) + Math.abs(Math.cos(m)) * lw * 0.5 + 6;
          labelIn(label, pv[0] + Math.cos(m) * lr, pv[1] - Math.sin(m) * lr, font(700, fs(12.5, 11.5)), color);
        }
      }
    }

    function sideLabel(a: Px, b: Px, inside: Px, label: string, color: string, alpha = 1, at = 0.5): void {
      if (alpha <= 0.01) return;
      const mx = lerp(a[0], b[0], at);
      const my = lerp(a[1], b[1], at);
      let [nx, ny] = unit(-(b[1] - a[1]), b[0] - a[0]);
      if (nx * (inside[0] - mx) + ny * (inside[1] - my) > 0) {
        nx = -nx;
        ny = -ny;
      }
      const g = surface.g;
      const f = font(750, fs(13, 12));
      g.font = f;
      const w = g.measureText(label).width;
      const off = 9 + Math.abs(nx) * w * 0.5 + Math.abs(ny) * 8;
      g.save();
      g.globalAlpha *= alpha;
      labelIn(label, mx + nx * off, my + ny * off, f, color);
      g.restore();
    }

    function drawFigure(now: number, st: CState, panel: number): void {
      const g = surface.g;
      const theme = th();
      const s = sol();
      const gv = disp();
      const v = shown();
      const P = regions().paper;
      const pa = toPx(A);
      const pb = toPx(B());
      const fin = st.finish;
      const giv = col.giv();
      const gp = givenParts(cs());
      const meas = p.meas;
      const mk = ease.outCubic(fin);

      const triPath = (C: Pt, k = 1) => {
        const q = [toPx([0, 0]), toPx([gv.c * k, 0]), toPx([C[0] * k, C[1] * k])];
        g.beginPath();
        q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
      };
      // Ergebnis-Dreiecke (unter allem)
      if (fin > 0 && s.kind !== 'none') {
        g.save();
        g.globalAlpha *= mk;
        triPath(s.c);
        const pc = toPx(s.c);
        const grad = g.createLinearGradient(pc[0], pc[1], pc[0], pa[1]);
        grad.addColorStop(0, withAlpha(col.res(), theme.dark ? 0.28 : 0.18));
        grad.addColorStop(1, withAlpha(col.res(), theme.dark ? 0.12 : 0.06));
        g.fillStyle = grad;
        g.fill();
        if (s.kind === 'two') {
          triPath(s.c2);
          g.fillStyle = withAlpha(col.res2(), theme.dark ? 0.16 : 0.1);
          g.fill();
        }
        g.restore();
      }
      // WWW: weitere ähnliche Dreiecke
      if (s.kind === 'many') {
        st.family.forEach((f, i) => {
          const k = lerp(1, f.k, f.t);
          const color = col.fam()[i + 1]!;
          g.save();
          g.globalAlpha *= Math.min(1, f.t * 2);
          triPath(s.c, k);
          g.fillStyle = withAlpha(color, theme.dark ? 0.14 : 0.08);
          g.fill();
          g.strokeStyle = color;
          g.lineWidth = 2.4;
          g.lineJoin = 'round';
          g.stroke();
          g.restore();
          if (f.t >= 0.98) {
            const qb = toPx([gv.c * k, 0]);
            const qc = toPx([s.c[0] * k, s.c[1] * k]);
            angleArc([gv.c * k, 0], 180 - gv.be, 180, withAlpha(color, 0.9), null, 0.8, false);
            angleArc([s.c[0] * k, s.c[1] * k], 180 + deg(Math.atan2(s.c[1], s.c[0])), 180 + deg(Math.atan2(s.c[1], s.c[0] - gv.c)), withAlpha(color, 0.9), null, 0.7, false);
            labelIn(i === 0 ? 'B′' : 'B″', qb[0] + 12, qb[1] + (i === 0 ? 14 : -14), font(800, fs(13, 12)), color);
            labelIn(i === 0 ? 'C′' : 'C″', qc[0] + (i === 0 ? 14 : -14), qc[1] - 11, font(800, fs(13, 12)), color);
          }
        });
      }
      // Kreisbögen
      for (const a of st.arcs) {
        const c = toPx(a.c);
        const rpx = a.r * scale();
        g.save();
        g.strokeStyle = col.pencil();
        g.lineWidth = 1.7;
        g.globalAlpha *= 0.9;
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
        g.globalAlpha *= st.radius.alpha;
        segment(c, e, giv, 2, [5, 4]);
        const [nx, ny] = unit(-(e[1] - c[1]), e[0] - c[0]);
        const sgn = ny > 0 ? -1 : 1;
        const val = st.radius.label === 'b' ? v.b : v.a;
        haloText(`${st.radius.label} = ${cm(Math.min(val, st.radius.r + 0.05))}`, (c[0] + e[0]) / 2 + nx * 14 * sgn, (c[1] + e[1]) / 2 + ny * 14 * sgn, font(750, fs(12.5, 11.5)), giv);
        g.restore();
      }
      // Linien
      for (const sg of st.segs) {
        const a = toPx(sg.a);
        const b = toPx(typeof sg.b === 'number' ? rayEnd(sg.a, sg.b) : sg.b);
        const e: Px = [lerp(a[0], b[0], sg.t), lerp(a[1], b[1], sg.t)];
        if (sg.kind === 'ray') segment(a, e, withAlpha(col.pencil(), 0.75), 1.6);
        else segment(a, e, sg.kind === 'side2' ? withAlpha(col.res2(), 0.85) : col.pencil(), 2.4);
      }
      // Sonderfälle
      drawSpecial(st, now);
      // Markierungen am Geodreieck
      for (const m of st.marks) dot(toPx(m.p), 2.6 * ease.outBack(m.pop), col.pencil());
      // fertiges Dreieck: Seiten farbig (gegeben blau, gemessen lila)
      if (fin > 0 && s.kind !== 'none') {
        const tris: { C: Pt; color: string; tag: string; alpha: number }[] = [{ C: s.c, color: col.res(), tag: s.kind === 'two' ? '₁' : '', alpha: 1 }];
        if (s.kind === 'two') tris.push({ C: s.c2, color: col.res2(), tag: '₂', alpha: 0.85 });
        for (const t of tris) {
          const pc = toPx(t.C);
          const q = pieces(gv.c, t.C);
          const cen: Px = [(pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3];
          g.save();
          g.globalAlpha *= mk * t.alpha;
          const side = (u: Px, w: Px, given: boolean) => segment(u, w, given ? giv : t.color, given ? 3.2 : 2.8);
          if (t.tag !== '₂') side(pa, pb, gp.c);
          side(pb, pc, gp.a);
          side(pa, pc, gp.b);
          g.restore();
          if (cs() === 'www') continue;
          const lab = (k: 'a' | 'b', val: number, shownV: number) => (gp[k] ? { s: `${k} = ${cm(shownV)}`, c: giv } : { s: meas ? `${k}${t.tag} ≈ ${cm(val * mk)}` : `${k}${t.tag}`, c: t.color });
          const la = lab('a', q.a, v.a);
          const lb = lab('b', q.b, v.b);
          if (!(t.tag === '₂' && gp.a)) sideLabel(pb, pc, cen, la.s, la.c, mk);
          sideLabel(pa, pc, cen, lb.s, lb.c, mk, t.tag === '₁' ? 0.78 : t.tag === '₂' ? 0.4 : 0.5);
          // Winkel: γ immer, α/β wenn nicht gegeben
          const angA = deg(Math.atan2(t.C[1], t.C[0]));
          const angB = deg(Math.atan2(t.C[1], t.C[0] - gv.c));
          const toA = norm360(angA + 180);
          const toB = norm360(angB + 180);
          const aL = (nm: string, val: number) => (t.tag === '₂' ? null : meas ? `${nm}${t.tag} ≈ ${dg1(val * mk)}` : `${nm}${t.tag}`);
          angleArc(t.C, toA, toA + norm360(toB - toA), t.color, aL('γ', q.ga), ease.outBack(fin));
          if (!gp.al) angleArc(A, 0, angA, t.color, aL('α', q.al), ease.outBack(fin));
          if (!gp.be) angleArc(B(), angB, 180, t.color, aL('β', q.be), ease.outBack(fin), true, fs(26, 22) * (t.tag === '₂' ? 1.45 : 1));
        }
      }
      // gegebene Winkel
      for (const an of st.angles) {
        const isA = an.which === 'al';
        const label = `${isA ? 'α' : 'β'} = ${dg(isA ? v.al : v.be)}`;
        if (isA) angleArc(A, 0, gv.al, giv, label, ease.outBack(an.pop));
        else angleArc(B(), 180 - gv.be, 180, giv, label, ease.outBack(an.pop));
      }
      // WWW: γ am ersten Dreieck
      if (cs() === 'www' && s.kind === 'many' && fin > 0) {
        const angA = deg(Math.atan2(s.c[1], s.c[0]));
        const angB = deg(Math.atan2(s.c[1], s.c[0] - gv.c));
        angleArc(s.c, angA + 180, angB + 180, giv, `γ = ${dg(Math.round(thirdAngle(v.al, v.be)))}`, ease.outBack(fin));
      }
      // Grundseite beschriften, sobald sie steht
      if (st.segs.length && st.segs[0]!.t >= 1) {
        const lab = `c = ${cm(v.c)}`;
        haloText(lab, (pa[0] + pb[0]) / 2, pa[1] + fs(19, 17), font(750, fs(13, 12)), cs() === 'www' ? theme.muted : giv);
      }
      // Punkte mit Aufleuchten
      for (const q of st.points) {
        if (q.pop <= 0) continue;
        const [x, y] = toPx(q.p);
        const sc = ease.outBack(q.pop);
        const color = q.color === 'base' ? theme.text : q.color === 'res' ? col.res() : col.res2();
        if (q.color !== 'base' && q.pop < 1) {
          const rr = 6 + 26 * ease.outCubic(q.pop);
          const glow = g.createRadialGradient(x, y, 0, x, y, rr);
          glow.addColorStop(0, withAlpha(color, 0.55 * (1 - q.pop)));
          glow.addColorStop(1, withAlpha(color, 0));
          g.fillStyle = glow;
          g.beginPath();
          g.arc(x, y, rr, 0, TAU);
          g.fill();
          g.save();
          g.strokeStyle = withAlpha(color, 0.8 * (1 - q.pop));
          g.lineWidth = 2;
          g.beginPath();
          g.arc(x, y, rr * 0.8, 0, TAU);
          g.stroke();
          g.restore();
        }
        g.save();
        g.translate(x, y);
        g.scale(sc, sc);
        const rg = g.createRadialGradient(-1.5, -1.8, 0.5, 0, 0, 5);
        rg.addColorStop(0, mixColor(color, '#ffffff', 0.45));
        rg.addColorStop(1, color);
        g.beginPath();
        g.arc(0, 0, 4.8, 0, TAU);
        g.fillStyle = rg;
        g.fill();
        g.strokeStyle = paperColor();
        g.lineWidth = 1.6;
        g.stroke();
        g.restore();
        const isB = q.label === 'B';
        const lx = q.color === 'base' ? x + (isB ? 14 : -14) : x + (q.label === 'C₂' && s.kind === 'two' && s.c2[0] < s.c[0] ? -16 : 0);
        const ly = q.color === 'base' ? y + 13 : y - 18;
        g.save();
        g.globalAlpha *= Math.min(1, q.pop * 1.5);
        labelIn(q.label, lx, ly, font(800, fs(15, 13.5)), color);
        g.restore();
      }
      // Griffe
      drawHandles(st);
      // Kein Dreieck: Hinweisschild
      if (s.kind === 'none' && (fin > 0 || st.special > 0)) {
        const k = Math.max(fin, st.special * 0.999);
        const msg =
          s.reason === 'flat'
            ? say(L('nur ein Berührpunkt auf [AB] – kein Dreieck', 'only a touching point on [AB] – no triangle'))
            : s.reason === 'touchA'
              ? say(L('Kreis trifft den Schenkel nur in A – kein Dreieck', 'circle meets the arm only at A – no triangle'))
              : say(L('kein Schnittpunkt – kein Dreieck', 'no intersection – no triangle'));
        const ins = regions().inset;
        fpill(ins ? (ins.x + ins.w + P.x + P.w) / 2 : P.x + P.w / 2, P.y + fs(24, 20), `\\c{bad}{✗ ${msg}}`, { alpha: ease.outCubic(k) * panel, border: withAlpha(col.bad(), 0.6) });
      }
    }

    /** Sonderfälle in der Zeichnung: Lücke (SSS), Abstand h (SSW), Schnittpunkt hinter A (SsW), parallele Schenkel (WSW). */
    function drawSpecial(st: CState, now: number): void {
      const k = ease.outCubic(st.special);
      if (k <= 0.01) return;
      const g = surface.g;
      const gv = disp();
      const v = shown();
      const s = sol();
      const bad = col.bad();
      g.save();
      g.globalAlpha *= k;
      if (cs() === 'sss' && s.kind === 'none') {
        const gap = sssGap(gv.a, gv.b, gv.c);
        if (gap) {
          const p0 = toPx([gap[0], 0]);
          const p1 = toPx([gap[1], 0]);
          const len = Math.abs(p1[0] - p0[0]);
          const y = p0[1] - fs(16, 14);
          if (len > 4) {
            const dir = p1[0] > p0[0] ? 1 : -1;
            segment([p0[0], p0[1] - 6], [p0[0], y - 6], withAlpha(bad, 0.7), 1.2, [2, 3]);
            segment([p1[0], p1[1] - 6], [p1[0], y - 6], withAlpha(bad, 0.7), 1.2, [2, 3]);
            const hd = Math.min(7, len * 0.35);
            segment([p0[0] + dir * hd * 0.6, y], [p1[0] - dir * hd * 0.6, y], bad, 2);
            arrowHead([p0[0], y], [-dir, 0], bad, hd);
            arrowHead([p1[0], y], [dir, 0], bad, hd);
          } else {
            // Grenzfall: Berührpunkt auf [AB]
            const pulse = 0.5 + 0.5 * Math.sin(now / 260);
            g.strokeStyle = bad;
            g.lineWidth = 2;
            g.beginPath();
            g.arc(p0[0], p0[1], 8 + pulse * 4, 0, TAU);
            g.stroke();
          }
          const ex = Math.max(0, Math.max(v.c - v.a - v.b, v.b - v.a - v.c, v.a - v.b - v.c));
          const txt = len > 4 ? say(L(`Lücke ${cm(ex)}`, `gap ${cm(ex)}`)) : say(L('berühren sich auf [AB]', 'touch on [AB]'));
          fpill((p0[0] + p1[0]) / 2, y - fs(22, 20), `\\c{bad}{${txt}}`, { size: fs(12.5, 11.5), border: withAlpha(bad, 0.5) });
        }
      }
      if ((cs() === 'wsw' || cs() === 'www') && s.kind === 'none') {
        // Schenkel parallel bzw. auseinander: Pfeile an den Enden
        const ea = toPx(rayEnd(A, gv.al));
        const eb = toPx(rayEnd(B(), 180 - gv.be));
        const pa = toPx(A);
        const pb = toPx(B());
        const parallel = Math.abs(thirdAngle(gv.al, gv.be)) < 0.5;
        for (const [p0, p1] of [
          [pa, ea],
          [pb, eb],
        ] as [Px, Px][]) {
          const m: Px = [lerp(p0[0], p1[0], 0.55), lerp(p0[1], p1[1], 0.55)];
          const d = unit(p1[0] - p0[0], p1[1] - p0[1]);
          if (parallel) {
            for (const o of [-4, 4]) {
              const c: Px = [m[0] + d[0] * o, m[1] + d[1] * o];
              g.strokeStyle = bad;
              g.lineWidth = 2;
              g.beginPath();
              g.moveTo(c[0] - d[0] * 5 - d[1] * 5, c[1] - d[1] * 5 + d[0] * 5);
              g.lineTo(c[0], c[1]);
              g.lineTo(c[0] - d[0] * 5 + d[1] * 5, c[1] - d[1] * 5 - d[0] * 5);
              g.stroke();
            }
          } else arrowHead([m[0] + d[0] * 8, m[1] + d[1] * 8], d, bad, 9);
        }
        const ga = thirdAngle(v.al, v.be);
        const txt = parallel ? say(L('α + β = 180°: Schenkel parallel', 'α + β = 180°: arms parallel')) : say(L(`α + β = ${dg(v.al + v.be)} > 180°`, `α + β = ${dg(v.al + v.be)} > 180°`));
        const mid = toPx([gv.c / 2, 0]);
        fpill(mid[0], mid[1] + fs(44, 40), `\\c{bad}{${txt}${parallel ? '' : ` (γ = ${ga < 0 ? '−' : ''}${dg(Math.abs(ga))}?)`}}`, { size: fs(12.5, 11.5), border: withAlpha(bad, 0.5) });
      }
      if (cs() === 'ssw') {
        const an = sswAnalysis(gv.c, gv.a, gv.al);
        const pb = toPx(B());
        // Abstand h von B zum Schenkel (gestrichelt, rechter Winkel am Fußpunkt)
        if (gv.al < 90 && an.kind !== 'SsW') {
          const pf = toPx(an.foot);
          const color = an.kind === 'none' ? bad : th().muted;
          segment(pb, pf, color, 1.6, [5, 4]);
          const d = unit(pf[0] - pb[0], pf[1] - pb[1]);
          const u = unit(Math.cos(rad(gv.al)), -Math.sin(rad(gv.al)));
          const q = 9;
          g.strokeStyle = color;
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(pf[0] - d[0] * q, pf[1] - d[1] * q);
          g.lineTo(pf[0] - d[0] * q - u[0] * q, pf[1] - d[1] * q - u[1] * q);
          g.lineTo(pf[0] - u[0] * q, pf[1] - u[1] * q);
          g.stroke();
          const at = an.kind === 'touch' ? 0.28 : 0.5;
          const mx = lerp(pb[0], pf[0], at);
          const my = lerp(pb[1], pf[1], at);
          if (an.kind === 'two') {
            // bei zwei Lösungen nur ein kleines „h“ (der Wert steht in der Ergebniskarte)
            const nrm = unit(-(pf[1] - pb[1]), pf[0] - pb[0]);
            g.font = `italic 600 ${fs(14, 13)}px ${th().mathFont}`;
            g.fillStyle = th().muted;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText('h', mx - nrm[0] * 10, my - nrm[1] * 10);
          } else {
            const txt = `h ≈ ${cm(an.h)}${an.kind === 'none' ? ' > a' : ' = a'}`;
            if (an.kind === 'none') fpill(mx + 30, my + 6, `\\c{bad}{${txt}}`, { size: fs(12, 11), border: withAlpha(color, 0.5), align: 'left' });
            else fpill(mx - 16, my + 4, `\\c{m}{${txt}}`, { size: fs(12, 11), border: withAlpha(color, 0.5), align: 'right' });
          }
        }
        // SsW: zweiter Schnittpunkt liegt hinter A
        if (an.behind && an.kind === 'SsW') {
          const pbh = toPx(an.behind);
          const pa = toPx(A);
          segment(pa, pbh, withAlpha(th().muted, 0.7), 1.4, [3, 4]);
          g.save();
          g.strokeStyle = th().muted;
          g.fillStyle = paperColor();
          g.lineWidth = 2;
          g.beginPath();
          g.arc(pbh[0], pbh[1], 4.5, 0, TAU);
          g.fill();
          g.stroke();
          g.restore();
          labelIn(say(L('hinter A – kein Dreieck', 'behind A – no triangle')), pbh[0] + 8, pbh[1] + 16, font(650, fs(12, 11)), th().muted);
        }
      }
      g.restore();
    }

    /* ---------- Griffe ---------- */
    function handleList(st: CState): { id: HandleId; q: Pt; color: string; kind: 'pt' | 'rot' | 'rad' }[] {
      const out: { id: HandleId; q: Pt; color: string; kind: 'pt' | 'rot' | 'rad' }[] = [];
      if (ctx.locked || stepIdx < 1 || autoPlay || stepRunning()) return out;
      const s = sol();
      const gv = disp();
      const P = regions().paper;
      out.push({ id: 'B', q: B(), color: th().text, kind: 'pt' });
      const fin = st.finish > 0.5;
      if (fin && (s.kind === 'one' || s.kind === 'two')) {
        out.push({ id: 'C1', q: s.c, color: col.res(), kind: 'pt' });
        if (s.kind === 'two') out.push({ id: 'C2', q: s.c2, color: col.res2(), kind: 'pt' });
      }
      const rays = st.segs.filter((sg) => sg.kind === 'ray' && sg.t >= 1);
      const grip = (v: Pt, d: number, near: Pt | null): Pt | null => {
        const pv = toPx(v);
        const u: Px = [Math.cos(rad(d)), -Math.sin(rad(d))];
        const e = toPx(rayEnd(v, d));
        const maxL = Math.hypot(e[0] - pv[0], e[1] - pv[1]) - 18;
        let l = near ? Math.hypot(toPx(near)[0] - pv[0], toPx(near)[1] - pv[1]) + 34 : maxL * 0.7;
        if (l > maxL) l = near ? Math.max(40, Math.min(maxL, Math.hypot(toPx(near)[0] - pv[0], toPx(near)[1] - pv[1]) - 34)) : maxL;
        if (l < 30) return null;
        const q: Px = [pv[0] + u[0] * l, pv[1] + u[1] * l];
        if (q[0] < P.x + 10 || q[0] > P.x + P.w - 10 || q[1] < P.y + 10 || q[1] > P.y + P.h - 10) return null;
        return toWorld(q[0], q[1]);
      };
      const cTop = s.kind === 'none' ? null : s.c;
      if (cs() !== 'sss' && rays.some((r) => r.a[0] === 0 && r.a[1] === 0)) {
        const q = grip(A, gv.al, cTop);
        if (q) out.push({ id: 'armA', q, color: col.giv(), kind: 'rot' });
      }
      if ((cs() === 'wsw' || cs() === 'www') && rays.some((r) => r.a[0] !== 0)) {
        const q = grip(B(), 180 - gv.be, cTop);
        if (q) out.push({ id: 'armB', q, color: col.giv(), kind: 'rot' });
      }
      // Radius-Griffe auf den Kreisbögen (nur, wo nicht schon C gezogen werden kann)
      const pts = out.map((h) => toPx(h.q));
      for (const a of st.arcs) {
        if (cs() === 'sws') continue;
        if (cs() === 'sss' && s.kind !== 'none') continue;
        const id: HandleId = a.id === 'A' ? 'rA' : 'rB';
        if (out.some((h) => h.id === id)) continue;
        let ang = (a.a0 + a.a1) / 2;
        let q: Pt = [a.c[0] + Math.cos(rad(ang)) * a.r, a.c[1] + Math.sin(rad(ang)) * a.r];
        if (pts.some((pp) => Math.hypot(toPx(q)[0] - pp[0], toPx(q)[1] - pp[1]) < 30) || cs() === 'ssw') {
          ang = cs() === 'ssw' ? a.a1 : a.a0;
          q = [a.c[0] + Math.cos(rad(ang)) * a.r, a.c[1] + Math.sin(rad(ang)) * a.r];
        }
        const pq = toPx(q);
        if (pq[0] < P.x + 8 || pq[0] > P.x + P.w - 8 || pq[1] < P.y + 8 || pq[1] > P.y + P.h - 8) continue;
        out.push({ id, q, color: col.giv(), kind: 'rad' });
      }
      return out;
    }

    function drawHandles(st: CState): void {
      const g = surface.g;
      hits = [];
      for (const h of handleList(st)) {
        const [x, y] = toPx(h.q);
        const on = hover === h.id || drag === h.id;
        g.save();
        if (h.kind === 'pt') {
          g.fillStyle = withAlpha(h.color, on ? 0.28 : 0.13);
          g.beginPath();
          g.arc(x, y, on ? 16 : 12.5, 0, TAU);
          g.fill();
        } else {
          g.fillStyle = paperColor();
          g.strokeStyle = withAlpha(h.color, on ? 1 : 0.8);
          g.lineWidth = on ? 2.4 : 1.8;
          g.beginPath();
          g.arc(x, y, on ? 10 : 8.5, 0, TAU);
          g.fill();
          g.stroke();
          if (h.kind === 'rot') {
            g.beginPath();
            g.arc(x, y, 4.2, -2.3, 1.1);
            g.stroke();
          } else {
            g.fillStyle = h.color;
            g.beginPath();
            g.arc(x, y, 3, 0, TAU);
            g.fill();
          }
        }
        g.restore();
        hits.push({ id: h.id, x, y, r: isWide() ? 18 : 22 });
      }
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    interface Intro {
      panel: number;
      cards: number;
    }

    /** Planfigur: Skizze mit den farbig markierten gegebenen Stücken. */
    function planCard(R: Rect, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const pad = fs(14, 12);
      const giv = col.giv();
      const gv = disp();
      const v = shown();
      const gp = givenParts(cs());
      const tg = target();
      const okCase = !(cs() === 'ssw' && !isSsW(tg.a, tg.c)) && cs() !== 'www';
      const cc = okCase ? col.ok() : col.warn();
      card(R, giv);
      cardTitle(R, say(L('Planfigur', 'Sketch')), giv, congName(), cc);
      // Form: echte Form (wenn es eine gibt), leicht „skizzenhaft“ begrenzt
      const s = sol();
      let sh: Pt = [0.4, 0.62];
      if (s.kind !== 'none') sh = [clamp(s.c[0] / gv.c, -0.25, 1.25), clamp(s.c[1] / gv.c, 0.34, 0.95)];
      const top = R.y + 46;
      const bot = R.y + R.h - 22;
      const xMin = Math.min(0, sh[0]);
      const xMax = Math.max(1, sh[0]);
      const sc = Math.max(10, Math.min((R.w - 2 * pad - 96) / (xMax - xMin), (bot - top - 6) / sh[1]));
      const angRoom = gp.al || gp.be ? 34 : 0;
      const ox = R.x + R.w / 2 - angRoom - ((xMin + xMax) / 2) * sc;
      const oy = bot - 6 - ((bot - top - 16 - sh[1] * sc) / 2) * 0;
      const Pp = (q: Pt): Px => [ox + q[0] * sc, oy - q[1] * sc];
      const a = Pp([0, 0]);
      const b = Pp([1, 0]);
      const c = Pp(sh);
      g.save();
      g.globalAlpha *= ease.outCubic(k.cards);
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.lineTo(c[0], c[1]);
      g.closePath();
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.06 : 0.035);
      g.fill();
      const draw = clamp01(k.cards * 1.3);
      const sideDraw = (u: Px, w: Px, on: boolean, i: number) => {
        const t = clamp01(draw * 3 - i);
        if (t <= 0) return;
        const e: Px = [lerp(u[0], w[0], t), lerp(u[1], w[1], t)];
        segment(u, e, on ? giv : withAlpha(theme.text, 0.5), on ? 3.2 : 1.5, on ? undefined : [5, 4]);
      };
      sideDraw(a, b, gp.c, 0);
      sideDraw(b, c, gp.a, 1);
      sideDraw(c, a, gp.b, 2);
      const angW = (pv: Px, from: number, to: number, on: boolean, label: string) => {
        const r = 14;
        g.beginPath();
        g.moveTo(pv[0], pv[1]);
        g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
        g.closePath();
        g.fillStyle = on ? withAlpha(giv, 0.28) : withAlpha(theme.text, 0.06);
        g.fill();
        g.beginPath();
        g.arc(pv[0], pv[1], r, -rad(from), -rad(to), true);
        g.strokeStyle = on ? giv : withAlpha(theme.text, 0.35);
        g.lineWidth = on ? 2 : 1.2;
        g.stroke();
        const m = rad((from + to) / 2);
        const lr = r + 8;
        g.font = `italic ${on ? 700 : 500} ${fs(13, 12)}px ${theme.mathFont}`;
        g.fillStyle = on ? giv : theme.muted;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(label, pv[0] + Math.cos(m) * lr, pv[1] - Math.sin(m) * lr);
      };
      const aA = deg(Math.atan2(sh[1], sh[0]));
      const aB = deg(Math.atan2(sh[1], sh[0] - 1));
      angW(a, 0, aA, gp.al, 'α');
      angW(b, aB, 180, gp.be, 'β');
      angW(c, aA + 180, aB + 180, gp.ga, 'γ');
      // Eckennamen
      g.font = font(800, fs(12.5, 12));
      g.fillStyle = theme.text;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('A', a[0] - 10, a[1] + 8);
      g.fillText('B', b[0] + 10, b[1] + 8);
      g.fillText('C', c[0], c[1] - 11);
      // Seiten und Winkel mit Werten
      const vf = (on: boolean) => fstyle(fs(12, 11), on ? giv : theme.muted, on ? 700 : 600);
      const put = (src: string, on: boolean, x: number, y: number, align: 'left' | 'right' | 'center') => {
        const box = formula(g, src, vf(on));
        const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
        box.draw(g, clamp(left, R.x + 6, R.x + R.w - box.w - 6), y + 4);
      };
      const lbl = (on: boolean, nm: string, val: string) => (on ? `${nm} = ${val}` : nm);
      put(lbl(gp.c, 'c', cm(v.c)), gp.c, (a[0] + b[0]) / 2, a[1] + 11, 'center');
      put(lbl(gp.a, 'a', cm(v.a)), gp.a, (b[0] + c[0]) / 2 + 7, (b[1] + c[1]) / 2 - 4, 'left');
      put(lbl(gp.b, 'b', cm(v.b)), gp.b, (a[0] + c[0]) / 2 - 7, (a[1] + c[1]) / 2 - 4, 'right');
      const angVals: string[] = [];
      if (gp.al) angVals.push(`α = ${dg(v.al)}`);
      if (gp.be) angVals.push(`β = ${dg(v.be)}`);
      angVals.forEach((src, i) => put(src, true, R.x + R.w - pad, top + 6 + i * 16, 'right'));
      g.restore();
    }

    /** Konstruktionsbeschreibung: Zeilen erscheinen passend zum Schritt. */
    function stepsCard(R: Rect, now: number, k: Intro, measure: boolean): number {
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
      const s = sol();
      const endColor = s.kind === 'none' ? col.bad() : s.kind === 'two' || s.kind === 'many' || (cs() === 'ssw' && !isSsW(target().a, target().c)) ? col.warn() : col.ok();
      const acc = done ? endColor : col.res();
      card(R, acc);
      cardTitle(R, say(L('Konstruktionsbeschreibung', 'Construction steps')), acc, stepIdx > 0 ? `${Math.min(stepIdx, n)} / ${n}` : `${n} ${say(L('Schritte', 'steps'))}`, theme.muted);
      const top = R.y + head;
      const btnY = R.y + R.h - btnH - fs(12, 10);
      const avail = (ctx.locked ? R.y + R.h - 8 : btnY - 6) - top;
      g.save();
      g.globalAlpha *= ease.outCubic(k.cards);
      if (stepIdx === 0) {
        const f = font(550, size);
        const msg = p.meas
          ? say(L('Mit „Nächster Schritt“ entsteht die Konstruktion Zeile für Zeile – wie im Heft.', 'Press “Next step” and the construction appears line by line – like in your exercise book.'))
          : say(L('Konstruiere zuerst selbst im Heft. Mit „Nächster Schritt“ kannst du vergleichen.', 'Construct it yourself first. Use “Next step” to compare.'));
        const rows = richWrap(msg, R.w - 2 * pad, size, theme.muted, 550);
        g.font = f;
        drawRich(rows, R.x + pad, top + 8, lh, size);
        // Vorschau: leere Zeilen wie Linien im Heft
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
        // Fenster, damit der aktuelle Schritt sichtbar bleibt
        const last = Math.min(stepIdx, n) - 1;
        let i0 = 0;
        const sum = (a: number, b: number) => heights.slice(a, b + 1).reduce((x, y) => x + y, 0);
        while (sum(i0, last) + (i0 > 0 ? lh : 0) > avail && i0 < last) i0++;
        let y = top;
        if (i0 > 0) {
          // frühere Schritte zusammengefasst
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
          const isCur = i === stepIdx - 1;
          const appear = isCur ? ease.outCubic(clamp01(prog * 4)) : 1;
          const isEnd = i === n - 1 && done;
          g.save();
          g.globalAlpha *= appear;
          if (isCur || isEnd) {
            g.fillStyle = withAlpha(isEnd ? endColor : col.res(), theme.dark ? 0.16 : 0.08);
            roundRect(g, R.x + pad - 6, y - 4, R.w - 2 * pad + 12, rows.length * lh + 6, 8);
            g.fill();
            if (isCur && !done) {
              g.fillStyle = col.res();
              roundRect(g, R.x + pad - 6, y - 4, 3, rows.length * lh + 6, 1.5);
              g.fill();
            }
          }
          g.fillStyle = isCur ? col.res() : theme.muted;
          g.font = font(800, size);
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(`${i + 1}.`, R.x + pad, y + size * 0.42);
          drawRich(rows, R.x + pad + numW + (1 - appear) * 10, y, lh, size);
          // Haken für erledigte Schritte
          if (!isCur || done) {
            g.fillStyle = withAlpha(isEnd ? endColor : col.ok(), 0.9);
            g.font = font(800, 11);
            g.textAlign = 'right';
            g.fillText('✓', R.x + R.w - pad + 2, y + size * 0.42);
          }
          g.restore();
          y += heights[i]!;
        }
      }
      g.restore();
      // Knöpfe
      if (!ctx.locked) {
        g.font = font(700, fs(12.5, 12));
        const nextLabel = done ? say(L('Neu konstruieren', 'Construct again')) : say(L('Nächster Schritt', 'Next step'));
        const nextW = g.measureText(nextLabel).width + 30;
        const rl = say(L('Von vorn', 'Start again'));
        const roomy = g.measureText(rl).width + 26 + nextW + 10 <= R.w - 2 * pad;
        const restartW = roomy ? g.measureText(rl).width + 26 : btnH;
        button({ x: R.x + R.w - pad - nextW, y: btnY, w: nextW, h: btnH }, nextLabel, 'next', col.res(), true, !stepRunning(now) && !autoPlay);
        if (stepIdx > 0) button({ x: R.x + pad, y: btnY, w: restartW, h: btnH }, roomy ? rl : '↺', 'restart', theme.muted, false, true);
        // Fortschrittspunkte
        const dotsX0 = R.x + pad + (stepIdx > 0 ? restartW + 12 : 0);
        const dotsX1 = R.x + R.w - pad - nextW - 12;
        const gapD = Math.min(14, (dotsX1 - dotsX0) / Math.max(1, n));
        if (gapD >= 8) {
          const x0 = (dotsX0 + dotsX1) / 2 - ((n - 1) * gapD) / 2;
          for (let i = 0; i < n; i++) {
            const filled = i < stepIdx;
            g.fillStyle = filled ? (done ? endColor : col.res()) : withAlpha(theme.text, 0.18);
            g.beginPath();
            g.arc(x0 + i * gapD, btnY + btnH / 2, i === stepIdx - 1 && !done ? 4 : 3, 0, TAU);
            g.fill();
          }
        }
      }
      return natural;
    }

    function button(r: Rect, label: string, id: ButtonId, color: string, filled: boolean, enabled: boolean): void {
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
      if (enabled) buttons.push({ id, r });
    }

    /** Ergebnis: Bedingung des Kongruenzsatzes mit Zahlen, Urteil, gemessene Stücke. */
    function resultRows(now: number, st: CState | null): { title: string; accent: string; right: string; rows: { src: string; size?: number; color?: string; at?: number; weight?: number }[] } {
      const v = shown();
      const gv = disp();
      const s = sol();
      const done = finished();
      const reveal = p.meas || done;
      const m = (x: string) => `\\c{m}{${x}}`;
      const rows: { src: string; size?: number; color?: string; at?: number; weight?: number }[] = [];
      let verdict = '';
      let accent = col.ok();
      const sz = fs(13, 12);
      switch (cs()) {
        case 'sss': {
          const sides = [
            { n: 'a', v: v.a },
            { n: 'b', v: v.b },
            { n: 'c', v: v.c },
          ].sort((x, y) => y.v - x.v);
          const [lg, s1, s2] = sides as [{ n: string; v: number }, { n: string; v: number }, { n: string; v: number }];
          const sum = r1(s1.v + s2.v);
          rows.push({ src: m(say(L('Dreiecksungleichung: längste Seite < Summe der anderen', 'Triangle inequality: longest side < sum of the others'))), size: fs(12, 11) });
          const rel = sum > lg.v + 1e-9 ? '>' : sum < lg.v - 1e-9 ? '<' : '=';
          const ok = rel === '>';
          rows.push({
            src: reveal
              ? `\\c{g}{${s1.n}} + \\c{g}{${s2.n}} = ${fmt.num(s1.v, 1)} + ${fmt.num(s2.v, 1)} = ${cm(sum)} ${rel} \\c{g}{${lg.n} = ${cm(lg.v)}} ${ok ? '\\c{ok}{✓}' : '\\c{bad}{✗}'}`
              : `\\c{g}{${s1.n}} + \\c{g}{${s2.n}} = ${cm(sum)}  ?  \\c{g}{${lg.n} = ${cm(lg.v)}}`,
            size: sz,
          });
          if (s.kind === 'none') {
            accent = col.bad();
            verdict = s.reason === 'flat' ? say(L('✗ kein Dreieck (C läge auf [AB])', '✗ no triangle (C would lie on [AB])')) : say(L('✗ kein Dreieck: die Kreise erreichen sich nicht', '✗ no triangle: the circles do not reach each other'));
          } else verdict = say(L('✓ eindeutig konstruierbar (SSS)', '✓ uniquely constructible (SSS)'));
          break;
        }
        case 'sws':
          rows.push({ src: `\\c{g}{α = ${dg(v.al)}} ${say(L('liegt zwischen', 'lies between'))} \\c{g}{b} ${say(L('und', 'and'))} \\c{g}{c}  \\c{ok}{✓}`, size: sz });
          rows.push({ src: m(say(L('Eingeschlossener Winkel – der Schenkel legt die Richtung fest.', 'Included angle – the arm fixes the direction.'))), size: fs(12, 11) });
          verdict = say(L('✓ eindeutig konstruierbar (SWS)', '✓ uniquely constructible (SAS)'));
          break;
        case 'wsw':
        case 'www': {
          const sum = Math.round(v.al + v.be);
          const ga = 180 - sum;
          const ok = ga > 0;
          rows.push({
            src: reveal
              ? ok
                ? `\\c{g}{α} + \\c{g}{β} = ${dg(sum)} < 180° \\c{ok}{✓}`
                : `\\c{g}{α} + \\c{g}{β} = ${dg(sum)}, ${say(L('nicht kleiner als 180°', 'not less than 180°'))} \\c{bad}{✗}`
              : `\\c{g}{α} + \\c{g}{β} = ${dg(sum)}  ?  180°`,
            size: sz,
          });
          if (reveal) rows.push({ src: ok ? `γ = 180° − ${dg(Math.round(v.al))} − ${dg(Math.round(v.be))} = ${cs() === 'www' ? `\\c{g}{${dg(ga)}}` : dg(ga)}` : `\\c{bad}{γ = 180° − α − β ≤ 0° ${say(L('– unmöglich', '– impossible'))}}`, size: sz });
          if (!ok) {
            accent = col.bad();
            verdict = say(L('✗ kein Dreieck: die Schenkel schneiden sich nicht', '✗ no triangle: the arms do not meet'));
          } else if (cs() === 'www') {
            accent = col.warn();
            rows.push({ src: m(say(L('Die Länge der Grundseite ist frei wählbar.', 'The length of the base can be chosen freely.'))), size: fs(12, 11) });
            verdict = say(L('⚠ unendlich viele ähnliche Dreiecke', '⚠ infinitely many similar triangles'));
          } else verdict = say(L('✓ eindeutig konstruierbar (WSW)', '✓ uniquely constructible (ASA)'));
          break;
        }
        case 'ssw': {
          const an = sswAnalysis(gv.c, gv.a, gv.al);
          const big = isSsW(v.a, v.c);
          rows.push({
            src: big
              ? `\\c{g}{a = ${cm(v.a)}} ≥ \\c{g}{c = ${cm(v.c)}}: ${say(L('Gegenwinkel der größeren Seite', 'angle opposite the longer side'))} \\c{ok}{✓}`
              : `\\c{g}{a = ${cm(v.a)}} < \\c{g}{c = ${cm(v.c)}}: \\c{w}{${say(L('Gegenwinkel der kleineren Seite', 'angle opposite the shorter side'))}}`,
            size: sz,
          });
          if (big) {
            rows.push({ src: m(say(L('Der zweite Schnittpunkt liegt hinter A.', 'The second intersection lies behind A.'))), size: fs(12, 11) });
            verdict = say(L('✓ eindeutig konstruierbar (SsW)', '✓ uniquely constructible (SsA)'));
            if (s.kind === 'none') {
              accent = col.bad();
              verdict = say(L('✗ kein Dreieck', '✗ no triangle'));
            }
          } else {
            accent = col.warn();
            const rel = an.kind === 'none' ? '>' : an.kind === 'touch' ? '=' : '<';
            rows.push({
              src: reveal ? `${say(L('Abstand B–Schenkel', 'distance B–arm'))} h ≈ ${cm(an.h)} ${rel} \\c{g}{a}` : `${say(L('Abstand B–Schenkel', 'distance B–arm'))} h  ?  \\c{g}{a}`,
              size: sz,
            });
            if (s.kind === 'two') verdict = say(L('⚠ zwei Lösungen: C₁ und C₂', '⚠ two solutions: C₁ and C₂'));
            else if (s.kind === 'one') verdict = say(L('⚠ genau eine Lösung (Berührung, rechter Winkel bei C)', '⚠ exactly one solution (touching, right angle at C)'));
            else {
              accent = col.bad();
              verdict = say(L('✗ kein Dreieck: a ist zu kurz', '✗ no triangle: a is too short'));
            }
          }
          break;
        }
      }
      const vColor = accent === col.ok() ? 'ok' : accent === col.bad() ? 'bad' : 'w';
      rows.push({ src: reveal ? `\\c{${vColor}}{${verdict}}` : say(L('Konstruierbar? Prüfe selbst.', 'Constructible? Check yourself.')), size: fs(13.5, 12.5), weight: 750 });
      // gemessene Stücke (Platz immer reserviert, damit nichts springt)
      const gp = givenParts(cs());
      const fin = st ? st.finish : done ? 1 : 0;
      const mk = ease.outCubic(fin);
      if (cs() !== 'www') {
        rows.push({ src: m(say(L('Gemessen', 'Measured'))), size: fs(12, 11) });
        if (!reveal) rows.push({ src: m(say(L('erst nach der Konstruktion', 'only after the construction'))), size: fs(12, 11) });
        else if (s.kind === 'none') rows.push({ src: m('—'), size: sz });
        else {
          const tris = s.kind === 'two' ? [s.c, s.c2] : [s.c];
          tris.forEach((C, i) => {
            const q = pieces(gv.c, C);
            const tag = s.kind === 'two' ? (i === 0 ? '₁' : '₂') : '';
            const key = i === 0 ? 'r' : 'r2';
            const parts: string[] = [];
            const val = (x: number, d: (x: number) => string) => (p.meas && fin > 0 ? d(x * mk) : '?');
            if (!gp.a) parts.push(`a${tag} ≈ ${val(q.a, cm)}`);
            if (!gp.b) parts.push(`b${tag} ≈ ${val(q.b, cm)}`);
            if (!gp.al) parts.push(`α ≈ ${val(q.al, dg1)}`);
            if (!gp.be) parts.push(`β${tag} ≈ ${val(q.be, dg1)}`);
            parts.push(`γ${tag} ≈ ${val(q.ga, dg1)}`);
            rows.push({ src: `\\c{${key}}{${parts.join(',  ')}}`, size: sz, at: fin > 0 ? 1 : 0.45 });
          });
          if (s.kind !== 'two') {
            const q = pieces(gv.c, s.c);
            rows.push({ src: p.meas && fin >= 1 ? `${m(say(L('Probe', 'Check')))}: α + β + γ = ${dg(Math.round(q.al + q.be + q.ga))} \\c{ok}{✓}` : m(say(L('Probe: α + β + γ = 180°?', 'Check: α + β + γ = 180°?'))), size: fs(12, 11), at: fin > 0 ? 1 : 0.45 });
          }
        }
      }
      void now;
      return {
        // SSW (Winkel gegenüber der kleineren Seite) und WWW sind keine Kongruenzsätze
        title:
          cs() === 'www' || (cs() === 'ssw' && !isSsW(p.a, p.c))
            ? `${congName()}: ${say(L('kein Kongruenzsatz', 'no congruence criterion'))}`
            : `${say(L('Kongruenzsatz', 'Congruence criterion'))} ${congName()}`,
        accent: reveal ? accent : th().muted,
        right: '',
        rows,
      };
    }

    function resultCard(R: Rect, now: number, k: Intro, st: CState | null, measure: boolean): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const info = resultRows(now, st);
      const maxW = R.w - 2 * pad;
      const boxes = info.rows.map((r) => {
        let size = r.size ?? fs(13, 12);
        let b = formula(g, r.src, fstyle(size, r.color ?? th().text, r.weight ?? 600));
        const size0 = size;
        while (b.w > maxW && size > Math.max(11, size0 * 0.9)) {
          size -= 0.5;
          b = formula(g, r.src, fstyle(size, r.color ?? th().text, r.weight ?? 600));
        }
        // passt es auch etwas kleiner nicht, in Originalgröße umbrechen
        if (b.w > maxW) size = size0;
        return { b, wrapped: b.w > maxW ? richWrap(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600) : null, size };
      });
      const rowH = (i: number) => {
        const x = boxes[i]!;
        return x.wrapped ? x.wrapped.length * x.size * 1.35 + 6 : Math.max(x.b.asc + x.b.desc, 15) + 7;
      };
      const h = 40 + info.rows.reduce((s, _, i) => s + rowH(i), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, info.accent);
      cardTitle(R, info.title, info.accent);
      let y = R.y + 40;
      info.rows.forEach((r, i) => {
        const x = boxes[i]!;
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.cards * (info.rows.length + 2) - i)) * (r.at ?? 1);
        if (x.wrapped) drawRich(x.wrapped, R.x + pad, y, x.size * 1.35, x.size);
        else x.b.draw(g, R.x + pad, y + x.b.asc);
        g.restore();
        y += rowH(i);
      });
      return h;
    }

    function drawColumn(C: Rect, now: number, k: Intro, st: CState): void {
      const g = surface.g;
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const resH = resultCard(C, now, k, st, true);
      const stepsNat = stepsCard(C, now, k, true);
      const wide = regions().wide;
      let planH: number;
      let stepsH: number;
      if (wide) {
        planH = 0;
        stepsH = C.h - resH - gap;
      } else {
        planH = Math.round(clamp(C.w * 0.36, 118, 150));
        stepsH = Math.min(stepsNat, C.h - planH - resH - 2 * gap);
      }
      const place = (i: number, draw: () => void) => {
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        draw();
        g.restore();
      };
      buttons = [];
      if (wide) {
        place(0, () => stepsCard({ x: C.x, y: C.y, w: C.w, h: stepsH }, now, k, false));
        place(1, () => resultCard({ x: C.x, y: C.y + stepsH + gap, w: C.w, h: resH }, now, k, st, false));
      } else {
        place(0, () => stepsCard({ x: C.x, y: C.y, w: C.w, h: stepsH }, now, k, false));
        place(1, () => planCard({ x: C.x, y: C.y + stepsH + gap, w: C.w, h: planH }, k));
        place(2, () => resultCard({ x: C.x, y: C.y + stepsH + gap + planH + gap, w: C.w, h: resH }, now, k, st, false));
      }
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
      for (const c of vals) if (c.step(now, dt)) anim = true;
      // Planlänge kann sich beim Gleiten ändern (z. B. zwei → eine Lösung)
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
      drawFigure(now, st, k.panel);
      if (R.inset) planCard(R.inset, k);
      if (!fast) {
        if (st.ruler) drawRuler(st.ruler);
        if (st.geo) drawGeo(st.geo);
        if (st.pencil.tip && st.pencil.alpha > 0) drawPencil(toPx(st.pencil.tip), st.pencil.alpha);
        if (st.compass) drawCompass(st.compass);
      }
      if (stepIdx === 0) {
        // leeres Blatt: Hinweis
        const P = R.paper;
        fpill(P.x + P.w / 2, P.y + P.h / 2, `\\c{m}{${say(L('Leeres Blatt: Starte mit „Nächster Schritt“', 'Blank sheet – start with “Next step”'))}}`, { size: fs(13, 12), alpha: 0.95 });
      }
      g.restore();
      g.strokeStyle = th().dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, R.paper.x + 0.5, R.paper.y + 0.5, R.paper.w - 1, R.paper.h - 1, 12);
      g.stroke();
      g.restore();
      drawColumn(R.col, now, k, st);
      if (cardFade !== null) anim = true;

      const running = stepRunning(now);
      if (!running && autoPlay) {
        if (stepIdx < n) {
          const since = (now - stepStart) * speed() - stepDur(steps()[stepIdx - 1] ?? { kind: 'base', src: '', ops: [] });
          if (since > (fast ? 40 : 380) || reduced) nextStep();
        } else {
          autoPlay = false;
          fast = false;
          updateReadouts();
          anim = true;
        }
      }
      if (running || autoPlay) anim = true;
      // Grenzfall-Puls (Kreise berühren sich)
      if (cs() === 'sss' && st.special > 0) {
        const gp0 = sssGap(VA.v, VB.v, VC.v);
        if (gp0 && Math.abs(gp0[1] - gp0[0]) < 0.05) anim = true;
      }
      if (wasRunning && !running) {
        updateReadouts();
        anim = true;
      }
      wasRunning = running;
      if (anim) ctx.requestRender();
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): HandleId | ButtonId | null {
      if (ctx.locked) return null;
      for (const b of buttons) if (px >= b.r.x && px <= b.r.x + b.r.w && py >= b.r.y && py <= b.r.y + b.r.h) return b.id;
      let best: HandleId | null = null;
      let bd = Infinity;
      for (const h of hits) {
        const d = Math.hypot(px - h.x, py - h.y);
        if (d < h.r && d < bd) {
          bd = d;
          best = h.id;
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

    function dragTo(id: HandleId, px: number, py: number): void {
      lastDrag = performance.now();
      const w = toWorld(px, py);
      const c = p.c;
      switch (id) {
        case 'B':
          ctx.set({ c: r1(clamp(w[0], 2, 10)) });
          break;
        case 'C1':
        case 'C2':
          dragC(w);
          break;
        case 'armA':
          ctx.set({ al: Math.round(clamp(deg(Math.atan2(Math.max(0.05, w[1]), w[0])), 10, 170)) });
          break;
        case 'armB':
          ctx.set({ be: Math.round(clamp(deg(Math.atan2(Math.max(0.05, w[1]), c - w[0])), 10, 170)) });
          break;
        case 'rA':
          ctx.set({ b: r1(clamp(Math.hypot(w[0], w[1]), 1, 12)) });
          break;
        case 'rB':
          ctx.set({ a: r1(clamp(Math.hypot(w[0] - c, w[1]), 1, 12)) });
          break;
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id === 'next') {
          autoPlay = false;
          fast = false;
          nextStep();
        } else if (id === 'restart') restart();
        else {
          drag = id;
          surface.setCursor('grabbing');
        }
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag || ctx.locked) return;
        dragTo(drag, q.px, q.py);
        ctx.requestRender();
      },
      pointerUp: () => {
        drag = null;
        lastDrag = performance.now();
        surface.setCursor(hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const id = q ? hitAt(q.px, q.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(!id ? '' : id === 'next' || id === 'restart' ? 'pointer' : drag ? 'grabbing' : 'grab');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        const now = performance.now();
        if (changed.has('cs') && source === 'input') ctx.set(START[cs()]);
        const instant = source === 'init' || reduced;
        const t = target();
        const goals: [Chan, number][] = [
          [VA, t.a],
          [VB, t.b],
          [VC, t.c],
          [VAL, t.al],
          [VBE, t.be],
        ];
        for (const [c, v] of goals) {
          if (instant) c.jump(v);
          else if (dragging()) c.follow(v, 0.05);
          else if (source === 'replace' || changed.has('cs')) c.jump(v);
          else if (Math.abs(c.goal - v) > 1e-12) c.follow(v, 0.16);
        }
        if (source === 'init') {
          lastSize = { w: surface.width, h: surface.height };
          if (!reduced) intro = now;
          replay();
          retargetView(true);
        } else if (source === 'replace' || changed.has('cs')) {
          if (!reduced) cardFade = now;
          replay();
          retargetView(true);
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
        } else if (id === 'play') {
          if (stepIdx >= nSteps() || fast) {
            stepIdx = 0;
            atEnd = false;
            stepStart = -Infinity;
          }
          fast = false;
          autoPlay = true;
          if (reduced) {
            stepIdx = nSteps();
            atEnd = true;
            autoPlay = false;
          } else if (!stepRunning()) nextStep();
        } else if (id === 'restart') restart();
        updateReadouts();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
