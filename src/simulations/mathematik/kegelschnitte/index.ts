import { defineSimulation, drawCard, ease, Plot, Surface, Tween, View3D, withAlpha, type Rect, type Vec3 } from '../../../sim-core';
import {
  checkFoci,
  coneEccentricity,
  coneSection,
  coneSectionKind,
  directorCirclePoint,
  dist,
  ellipse,
  ellipsePoint,
  ellipseTangent,
  focalAngles,
  focalCurve,
  focalRadius,
  hyperbola,
  hyperbolaPoint,
  hyperbolaTangent,
  kindOf,
  makeTask,
  parabola,
  parabolaFromDirectrix,
  parabolaPoint,
  parabolaTangent,
  reflect,
  taskCurve,
  taskE,
  taskEquation,
  taskFoci,
  type ConicTask,
  type Kind,
  type Pt,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const DEG = Math.PI / 180;

const KIND_NAMES: Record<Kind, Loc> = {
  circle: L('Kreis', 'circle'),
  ellipse: L('Ellipse', 'ellipse'),
  parabola: L('Parabel', 'parabola'),
  hyperbola: L('Hyperbel', 'hyperbola'),
};

/**
 * Kegelschnitte als Ortslinien: Ellipse mit der Gärtnerkonstruktion
 * (Abstandssumme), Parabel aus Brennpunkt und Leitlinie (mit
 * Mittelsenkrechte als Tangente), Hyperbel (Abstandsdifferenz), die
 * gemeinsame Darstellung über die Exzentrizität ε und der Schnitt einer
 * Ebene mit einem Doppelkegel in 3D.
 */
export default defineSimulation({
  id: 'kegelschnitte',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.55 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'ellipse', label: L('Ellipse: Gärtnerkonstruktion', 'Ellipse: gardener’s method') },
        { value: 'parabola', label: L('Parabel: Brennpunkt und Leitlinie', 'Parabola: focus and directrix') },
        { value: 'hyperbola', label: L('Hyperbel: Abstandsdifferenz', 'Hyperbola: difference of distances') },
        { value: 'focal', label: L('Alle über die Exzentrizität ε', 'All via the eccentricity ε') },
        { value: 'cone', label: L('Schnitt am Doppelkegel (3D)', 'Section of a double cone (3D)') },
        { value: 'quiz', label: L('Üben: Brennpunkte finden', 'Practice: find the foci') },
      ],
      default: 'ellipse',
    },
    {
      key: 'cons',
      type: 'choice',
      label: L('Konstruktion', 'Construction'),
      options: [
        { value: 'dist', label: L('Abstände zu F₁ und F₂', 'Distances to F₁ and F₂') },
        { value: 'circle', label: L('Leitkreis um F₁', 'Director circle around F₁') },
      ],
      default: 'dist',
      visibleIf: (v) => v.mode === 'ellipse' || v.mode === 'hyperbola',
    },
    { key: 'a', type: 'number', label: L('Halbachse a', 'Semi-axis a'), min: 0.5, max: 8, step: 0.1, default: 5, visibleIf: (v) => v.mode === 'ellipse' || v.mode === 'hyperbola' },
    { key: 'b', type: 'number', label: L('Halbachse b', 'Semi-axis b'), min: 0.5, max: 8, step: 0.1, default: 3, visibleIf: (v) => v.mode === 'ellipse' || v.mode === 'hyperbola' },
    { key: 'f', type: 'number', label: L('Brennweite f (Scheitel – Brennpunkt)', 'Focal length f (vertex – focus)'), min: 0.25, max: 4, step: 0.05, default: 1, visibleIf: (v) => v.mode === 'parabola' },
    { key: 'eps', type: 'number', label: L('Exzentrizität ε', 'Eccentricity ε'), min: 0, max: 2.5, step: 0.01, default: 0.8, visibleIf: (v) => v.mode === 'focal' },
    { key: 'd', type: 'number', label: L('Abstand Brennpunkt – Leitlinie', 'Distance focus – directrix'), min: 0.5, max: 5, step: 0.05, default: 2.25, visibleIf: (v) => v.mode === 'focal' },
    { key: 'alpha', type: 'number', label: L('Halber Öffnungswinkel α des Kegels', 'Half opening angle α of the cone'), min: 10, max: 60, step: 1, default: 30, unit: '°', visibleIf: (v) => v.mode === 'cone' },
    { key: 'beta', type: 'number', label: L('Neigung β der Ebene', 'Tilt β of the plane'), min: 0, max: 89, step: 1, default: 40, unit: '°', visibleIf: (v) => v.mode === 'cone' },
    { key: 'h', type: 'number', label: L('Höhe der Ebene über der Spitze', 'Height of the plane above the apex'), min: 0.2, max: 3, step: 0.05, default: 1, visibleIf: (v) => v.mode === 'cone' },
    { key: 't', type: 'number', label: L('Punkt P auf der Kurve', 'Point P on the curve'), min: -180, max: 180, step: 1, default: 50, visibleIf: (v) => v.mode !== 'cone' && v.mode !== 'quiz' },
    { key: 'tan', type: 'boolean', label: L('Tangente und Spiegelung zeigen', 'Show tangent and reflection'), default: false, visibleIf: (v) => v.mode === 'ellipse' || v.mode === 'parabola' || v.mode === 'hyperbola' },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'dir', type: 'boolean', label: L('Leitlinien zeigen', 'Show directrices'), default: false, visibleIf: (v) => v.mode === 'ellipse' || v.mode === 'hyperbola' },
    { key: 'show', type: 'boolean', label: L('Werte zeigen', 'Show values'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'play', label: L('Konstruktion abspielen', 'Play the construction'), primary: true, visibleIf: (v) => v.mode !== 'quiz' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'task', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'eq', label: L('Gleichung', 'Equation') },
    { key: 'foci', label: L('Brennpunkte', 'Foci') },
    { key: 'eps', label: L('Exzentrizität', 'Eccentricity'), spoiler: true },
    { key: 'prop', label: L('Ortslinien-Eigenschaft', 'Locus property'), spoiler: true },
  ],
  presets: [
    { id: 'ell', label: L('Ellipse a = 5, b = 3', 'Ellipse a = 5, b = 3'), values: { mode: 'ellipse', a: 5, b: 3, t: 50 } },
    { id: 'circle', label: L('Ellipse wird Kreis (a = b)', 'Ellipse becomes a circle (a = b)'), values: { mode: 'ellipse', a: 4, b: 4, t: 30 } },
    { id: 'flat', label: L('Sehr flache Ellipse', 'Very flat ellipse'), values: { mode: 'ellipse', a: 6, b: 1.5, t: 70 } },
    { id: 'par', label: L('Parabel y = x²/4', 'Parabola y = x²/4'), values: { mode: 'parabola', f: 1, t: 50 } },
    { id: 'hyp', label: L('Hyperbel a = 3, b = 4', 'Hyperbola a = 3, b = 4'), values: { mode: 'hyperbola', a: 3, b: 4, t: 30 } },
    { id: 'focal', label: L('ε von 0 bis 2: alle Kegelschnitte', 'ε from 0 to 2: all conics'), values: { mode: 'focal', eps: 0.8, d: 2.25, t: 60 } },
    { id: 'focal1', label: L('ε = 1: Parabel', 'ε = 1: parabola'), values: { mode: 'focal', eps: 1, d: 2, t: 60 } },
    { id: 'cone-e', label: L('Kegel: Ellipse', 'Cone: ellipse'), values: { mode: 'cone', alpha: 30, beta: 35, h: 1 } },
    { id: 'cone-p', label: L('Kegel: Parabel (Ebene parallel zur Mantellinie)', 'Cone: parabola (plane parallel to a generator)'), values: { mode: 'cone', alpha: 30, beta: 60, h: 1 } },
    { id: 'cone-h', label: L('Kegel: Hyperbel', 'Cone: hyperbola'), values: { mode: 'cone', alpha: 30, beta: 75, h: 1 } },
    { id: 'whisper', label: L('Flüstergewölbe: Ellipse spiegelt F₁ nach F₂', 'Whispering gallery: the ellipse reflects F₁ to F₂'), values: { mode: 'ellipse', a: 5, b: 3, t: 70, tan: true, cons: 'dist' } },
    { id: 'mirror', label: L('Parabolspiegel: parallele Strahlen in den Brennpunkt', 'Parabolic mirror: parallel rays into the focus'), values: { mode: 'parabola', f: 1.5, t: 60, tan: true } },
    { id: 'hyp-mirror', label: L('Hyperbel als Spiegel', 'Hyperbola as a mirror'), values: { mode: 'hyperbola', a: 3, b: 4, t: 25, tan: true, cons: 'dist' } },
    { id: 'lk-e', label: L('Leitkreis: Ellipse', 'Director circle: ellipse'), values: { mode: 'ellipse', a: 4, b: 3, t: 40, cons: 'circle' } },
    { id: 'lk-h', label: L('Leitkreis: Hyperbel', 'Director circle: hyperbola'), values: { mode: 'hyperbola', a: 2, b: 3, t: 20, cons: 'circle' } },
    { id: 'quiz', label: L('Üben: Brennpunkte finden', 'Practice: find the foci'), values: { mode: 'quiz', q: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Kegelschnitte als Ortslinien in der Ebene mit Brennpunkten, Leitlinien und einem beweglichen Punkt P, oder der Schnitt einer Ebene mit einem Doppelkegel im Raum.',
      ellT: 'Ellipse: Summe der Abstände zu F₁ und F₂ ist immer 2a',
      ellG: 'Gärtnerkonstruktion: Ein Faden der Länge 2a ist an zwei Pflöcken befestigt. Hält man ihn mit einem Stift straff, zeichnet der Stift eine Ellipse.',
      parT: 'Parabel: gleich weit vom Brennpunkt F und von der Leitlinie l',
      parG: 'Konstruktion: Zu Q auf der Leitlinie schneidet die Senkrechte durch Q die Mittelsenkrechte von F und Q im Parabelpunkt P. Die Mittelsenkrechte ist die Tangente in P.',
      hypT: 'Hyperbel: Differenz der Abstände zu F₁ und F₂ ist immer 2a',
      hypG: 'Für große Abstände schmiegen sich die Äste an die Asymptoten y = ± (b/a)·x.',
      focT: 'Abstand zu F = ε · Abstand zur Leitlinie',
      focG: 'Eine Regel für alle: ε = 0 Kreis, 0 < ε < 1 Ellipse, ε = 1 Parabel, ε > 1 Hyperbel.',
      coneT: 'Schnitt einer Ebene mit dem Doppelkegel',
      coneG: 'Je steiler die Ebene, desto „offener“ der Schnitt. Parallel zu einer Mantellinie (β = 90° − α) entsteht genau eine Parabel.',
      cmp: 'Vergleich: β = {b}°, 90° − α = {c}°',
      kind: 'Art',
      sum: 'Summe',
      diffL: 'Differenz',
      ratio: 'Verhältnis',
      lin: 'lineare Exzentrizität e',
      num: 'numerische Exzentrizität ε = e/a',
      asym: 'Asymptoten',
      dirL: 'Leitlinien',
      hidden: 'Werte verdeckt',
      pin: 'Pflock',
      pen: 'Stift',
      tanE: 'Tangente in P: Sie halbiert den Außenwinkel bei P. Ein Lichtstrahl aus F₁ wird an der Ellipse immer nach F₂ gespiegelt (Flüstergewölbe, Nierensteinzertrümmerer).',
      tanP: 'Tangente in P: Parallel zur Achse einfallendes Licht wird immer in den Brennpunkt gespiegelt (Parabolspiegel, Satellitenschüssel, Scheinwerfer).',
      tanH: 'Tangente in P: Sie halbiert den Winkel F₁PF₂. Licht aus F₂ wird am Ast so gespiegelt, als käme es aus F₁.',
      angles: 'Winkel zur Tangente',
      lkE: 'Leitkreis um F₁ mit Radius 2a. P liegt auf der Mittelsenkrechten von Q und F₂, also |PF₂| = |PQ|. Daraus folgt |PF₁| + |PF₂| = |F₁Q| = 2a. Die Mittelsenkrechte ist die Tangente.',
      lkH: 'Leitkreis um F₁ mit Radius 2a. P liegt auf der Mittelsenkrechten von Q und F₂, also |PF₂| = |PQ|. Daraus folgt |PF₁| − |PF₂| = ±|F₁Q| = ±2a. Die Mittelsenkrechte ist die Tangente.',
      lkNone: 'Für diese Lage von Q ist die Mittelsenkrechte parallel zu F₁Q: kein Kurvenpunkt (Richtung einer Asymptote).',
      quizT: 'Üben: Wo liegen die Brennpunkte?',
      quizHow2: 'Ziehe F₁ und F₂ an die richtigen Stellen und tippe auf „Prüfen“.',
      quizHow1: 'Ziehe F an die richtige Stelle und tippe auf „Prüfen“.',
      hintE: 'Tipp: Mittelpunkt ablesen, dann e = √(a² − b²) entlang der langen Achse.',
      hintH: 'Tipp: Mittelpunkt ablesen, dann e = √(a² + b²) entlang der Achse mit dem Pluszeichen.',
      hintP: 'Tipp: Bei y = c·(x − h)² + k ist f = 1/(4c); F liegt f über (bei c < 0 unter) dem Scheitel.',
      right: 'Richtig!',
      wrong: 'Noch nicht – um {d} daneben.',
      solution: 'Lösung',
      score: '{k} von {n} richtig',
    },
    en: {
      canvas: 'Conic sections as loci in the plane with foci, directrices and a movable point P, or the section of a plane with a double cone in space.',
      ellT: 'Ellipse: the sum of the distances to F₁ and F₂ is always 2a',
      ellG: 'Gardener’s method: a string of length 2a is tied to two pegs. Keeping it tight with a pen, the pen draws an ellipse.',
      parT: 'Parabola: equally far from the focus F and the directrix l',
      parG: 'Construction: for Q on the directrix, the perpendicular through Q meets the perpendicular bisector of F and Q at the parabola point P. The bisector is the tangent at P.',
      hypT: 'Hyperbola: the difference of the distances to F₁ and F₂ is always 2a',
      hypG: 'Far out, the branches approach the asymptotes y = ± (b/a)·x.',
      focT: 'distance to F = ε · distance to the directrix',
      focG: 'One rule for all: ε = 0 circle, 0 < ε < 1 ellipse, ε = 1 parabola, ε > 1 hyperbola.',
      coneT: 'Section of a plane with the double cone',
      coneG: 'The steeper the plane, the more “open” the section. Parallel to a generator (β = 90° − α) you get exactly a parabola.',
      cmp: 'Compare: β = {b}°, 90° − α = {c}°',
      kind: 'type',
      sum: 'sum',
      diffL: 'difference',
      ratio: 'ratio',
      lin: 'linear eccentricity e',
      num: 'eccentricity ε = e/a',
      asym: 'asymptotes',
      dirL: 'directrices',
      hidden: 'values hidden',
      pin: 'peg',
      pen: 'pen',
      tanE: 'Tangent at P: it bisects the exterior angle at P. A light ray from F₁ is always reflected by the ellipse to F₂ (whispering gallery, kidney stone lithotripter).',
      tanP: 'Tangent at P: light coming in parallel to the axis is always reflected into the focus (parabolic mirror, satellite dish, headlight).',
      tanH: 'Tangent at P: it bisects the angle F₁PF₂. Light from F₂ is reflected by the branch as if it came from F₁.',
      angles: 'angles to the tangent',
      lkE: 'Director circle around F₁ with radius 2a. P lies on the perpendicular bisector of Q and F₂, so |PF₂| = |PQ|. Hence |PF₁| + |PF₂| = |F₁Q| = 2a. The bisector is the tangent.',
      lkH: 'Director circle around F₁ with radius 2a. P lies on the perpendicular bisector of Q and F₂, so |PF₂| = |PQ|. Hence |PF₁| − |PF₂| = ±|F₁Q| = ±2a. The bisector is the tangent.',
      lkNone: 'For this position of Q the bisector is parallel to F₁Q: no curve point (direction of an asymptote).',
      quizT: 'Practice: where are the foci?',
      quizHow2: 'Drag F₁ and F₂ to the right places and tap “Check”.',
      quizHow1: 'Drag F to the right place and tap “Check”.',
      hintE: 'Hint: read off the centre, then e = √(a² − b²) along the long axis.',
      hintH: 'Hint: read off the centre, then e = √(a² + b²) along the axis with the plus sign.',
      hintP: 'Hint: for y = c·(x − h)² + k, f = 1/(4c); F lies f above (for c < 0 below) the vertex.',
      right: 'Correct!',
      wrong: 'Not yet – off by {d}.',
      solution: 'Solution',
      score: '{k} of {n} correct',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 3) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 5e-12 ? 0 : v, d) : '–');

    /* -------------------------------------------------------------- */
    /* Animation, Layout, Farben                                       */
    /* -------------------------------------------------------------- */

    const trace = new Tween(4200, ease.inOutCubic);
    trace.play();
    const COL = {
      curve: () => th().series[0]!,
      f1: () => th().series[1]!,
      f2: () => th().series[2]!,
      dir: () => th().series[3]!,
      p: () => th().series[4]!,
      aux: () => th().series[5]!,
    };

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { main: Rect; card: Rect } {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide()) {
        const mw = Math.round(W * 0.62);
        return { main: { x: pad, y: pad, w: mw - pad, h: H - 2 * pad }, card: { x: mw + pad, y: pad, w: W - mw - 2 * pad, h: H - 2 * pad } };
      }
      const mh = Math.round(H * 0.58);
      return { main: { x: pad, y: pad, w: W - 2 * pad, h: mh }, card: { x: pad, y: mh + 2 * pad, w: W - 2 * pad, h: H - mh - 3 * pad } };
    }

    let mainRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const plot = new Plot(surface, {
      x: [-7, 7],
      y: [-5, 5],
      equalAspect: true,
      region: () => (p.mode === 'cone' ? { x: -100, y: -100, w: 10, h: 10 } : { x: mainRect.x + 4, y: mainRect.y + 4, w: mainRect.w - 8, h: mainRect.h - 8 }),
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });
    let viewRect: Rect = { x: -100, y: -100, w: 10, h: 10 };
    const view = new View3D(surface, { azimuth: 35, elevation: 14, elevationLimits: [-60, 80], distance: 5, region: () => viewRect });

    /* -------------------------------------------------------------- */
    /* Bereich und Punkt P                                             */
    /* -------------------------------------------------------------- */

    const circleMode = () => (p.mode === 'ellipse' || p.mode === 'hyperbola') && p.cons === 'circle';
    /** Brennpunkte und Radius 2a des Leitkreises (Ellipse/Hyperbel). */
    function dirCircle(): { F1: Pt; F2: Pt; R: number } {
      const C = p.mode === 'ellipse' ? ellipse(p.a, p.b) : hyperbola(p.a, p.b);
      return { F1: C.foci[0], F2: C.foci[1], R: 2 * C.a };
    }
    /** Leitkreis-Konstruktion zum Winkel φ (Grad) von Q um F₁; null ohne (sichtbaren) Kurvenpunkt. */
    function dirAt(phiDeg: number) {
      const { F1, F2, R } = dirCircle();
      const c = directorCirclePoint(F1, F2, R, phiDeg * DEG);
      if (!c || Math.hypot(c.P[0], c.P[1]) > 60) return null;
      return c;
    }

    function fitRange(): void {
      let m = 5;
      if (p.mode === 'ellipse') m = Math.max(p.a, p.b) * 1.25 + 0.5;
      if (p.mode === 'hyperbola') m = hyperbola(p.a, p.b).e * 1.7 + 1;
      if (p.mode === 'parabola') m = Math.max(4, p.f * 5);
      if (p.mode === 'focal') m = Math.max(4, p.d * 2.6, p.eps < 1 ? (p.eps * p.d) / (1 - p.eps) * 1.2 : 0);
      if (circleMode()) {
        const e = p.mode === 'ellipse' ? ellipse(p.a, p.b).e : hyperbola(p.a, p.b).e;
        m = Math.max(m, (e + 2 * Math.max(p.a, p.mode === 'ellipse' ? p.b : 0)) * 1.04);
      }
      m = Math.min(m, 25);
      plot.setRange([-m, m], [-m * 0.75, m * 0.75]);
      if (p.mode === 'quiz') plot.setRange([-10.5, 10.5], [-8, 8]);
      if (p.mode === 'parabola') plot.setRange([-m, m], [-p.f * 2.2, m * 1.2]);
      if (p.mode === 'focal' && p.eps < 1) {
        const rFar = focalRadius(p.eps, p.d, 0) ?? m;
        const rNear = focalRadius(p.eps, p.d, Math.PI) ?? 1;
        const cx = (rFar - rNear) / 2;
        const half = Math.max((rFar + rNear) / 2 * 1.25, p.d * 1.5, 3);
        plot.setRange([Math.min(cx - half, -p.d - 1), cx + half], [-half * 0.8, half * 0.8]);
      }
    }
    fitRange();

    /** Punkt P zum Parameter t (Grad). */
    function pointAt(tDeg: number): { P: Pt; side?: 1 | -1 } | null {
      const t = tDeg * DEG;
      if (circleMode()) {
        const c = dirAt(tDeg);
        return c ? { P: c.P } : null;
      }
      switch (p.mode) {
        case 'ellipse':
          return { P: ellipsePoint(ellipse(p.a, p.b), t) };
        case 'hyperbola': {
          const H = hyperbola(p.a, p.b);
          const side: 1 | -1 = Math.abs(tDeg) <= 90 ? 1 : -1;
          const u = side === 1 ? tDeg / 45 : (Math.sign(tDeg) * (180 - Math.abs(tDeg))) / 45;
          return { P: hyperbolaPoint(H, u, side), side };
        }
        case 'parabola':
          return { P: parabolaPoint(parabola(p.f), (tDeg / 180) * p.f * 6) };
        case 'focal': {
          // Bei ε > 1 gibt es Winkel ohne Kurvenpunkt: dann in kleinen Schritten
          // Richtung θ = π gehen, bis ein gültiger Punkt im sichtbaren Bereich liegt.
          let th = t;
          let r = focalRadius(p.eps, p.d, th);
          const dirTo = th >= 0 ? 1 : -1;
          const rLim = Math.max(3, p.d * 1.9);
          for (let k = 0; (r === null || (p.eps >= 1 && r > rLim)) && k < 400; k++) {
            th += dirTo * 0.01;
            r = focalRadius(p.eps, p.d, th);
          }
          return r === null ? null : { P: [r * Math.cos(th), r * Math.sin(th)] };
        }
        default:
          return null;
      }
    }

    /** Parameter t zu einer Mausposition (nächster Kurvenpunkt). */
    function paramFrom(x: number, y: number): number {
      if (circleMode()) {
        const { F1 } = dirCircle();
        return Math.atan2(y - F1[1], x - F1[0]) / DEG;
      }
      switch (p.mode) {
        case 'ellipse': {
          const E = ellipse(p.a, p.b);
          return Math.atan2(y / E.b, x / E.a) / DEG;
        }
        case 'hyperbola': {
          const H = hyperbola(p.a, p.b);
          const u = Math.asinh(y / H.b);
          const tDeg = clamp(u * 45, -89, 89);
          return x >= 0 ? tDeg : Math.sign(tDeg || 1) * (180 - Math.abs(tDeg));
        }
        case 'parabola':
          return clamp((x / (p.f * 6)) * 180, -180, 180);
        case 'focal':
          return Math.atan2(y, x) / DEG;
        default:
          return p.t;
      }
    }

    plot.addHandle({
      get: () => {
        if (circleMode()) {
          const { F1, R } = dirCircle();
          return [F1[0] + R * Math.cos(p.t * DEG), F1[1] + R * Math.sin(p.t * DEG)];
        }
        const r = pointAt(p.t);
        return r ? [r.P[0], r.P[1]] : [0, 0];
      },
      set: (x, y) => ctx.set({ t: Math.round(clamp(paramFrom(x, y), -180, 180)) }),
      enabled: () => !ctx.locked && p.mode !== 'cone' && p.mode !== 'quiz' && !(circleMode() && trace.running) && (circleMode() || !!pointAt(p.t)),
      color: () => COL.p(),
      axis: 'both',
    });

    /* -------------------------------------------------------------- */
    /* Übung: Zustand und Griffe                                       */
    /* -------------------------------------------------------------- */

    let task: ConicTask = makeTask(1);
    let guess: Pt[] = [];
    let verdict: { err: number; ok: boolean } | null = null;
    let tries = 0;
    let quizCount = 0;
    let quizRight = 0;
    const solved = new Set<number>();
    function newTask(): void {
      task = makeTask(p.q);
      const one = task.kind === 'parabola';
      guess = one ? [[-6, -6]] : [[-6, -6], [6, -6]];
      verdict = null;
      tries = 0;
    }
    for (const i of [0, 1]) {
      plot.addHandle({
        get: () => {
          const q = guess[i] ?? [0, 0];
          return [q[0], q[1]];
        },
        set: (x, y) => {
          if (!guess[i]) return;
          // auf halbe Kästchen einrasten, damit glatte Lösungen treffbar sind
          guess[i] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
          if (verdict && !verdict.ok) verdict = null;
          ctx.requestRender();
        },
        enabled: () => !ctx.locked && p.mode === 'quiz' && i < guess.length && !verdict?.ok,
        color: () => (i === 0 ? COL.f1() : COL.f2()),
        axis: 'both',
      });
    }

    /* -------------------------------------------------------------- */
    /* Zeichenhilfen                                                   */
    /* -------------------------------------------------------------- */

    function pin(F: Pt, label: string, col: string): void {
      plot.point(F[0], F[1], { color: col, radius: 6 });
      plot.text(F[0], F[1], label, { color: col, size: 13, weight: 'bold', offset: [0, 18], halo: true });
    }
    function seg(A: Pt, B: Pt, col: string, width = 2.4, dash?: number[]): void {
      plot.segment([A[0], A[1]], [B[0], B[1]], { color: col, width, dash });
    }
    function midLabel(A: Pt, B: Pt, txt: string, col: string, off: [number, number] = [0, -10]): void {
      plot.text((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, txt, { color: col, size: 12, weight: 'bold', offset: off, halo: true });
    }

    /** Kurve als Polylinie bis zum Animationsfortschritt. */
    function poly(pts: Pt[], upto = 1, col = COL.curve(), width = 3): void {
      const n = Math.max(2, Math.ceil(pts.length * clamp(upto, 0, 1)));
      plot.polyline(pts.slice(0, n).map((q) => [q[0], q[1]] as [number, number]), { color: col, width });
    }

    /** Gefüllter Winkelbogen bei P zwischen zwei Richtungen (kürzester Weg). */
    function angleArc(P: Pt, u: Pt, v: Pt, rPx: number, col: string): void {
      const a1 = Math.atan2(u[1], u[0]);
      let d = Math.atan2(v[1], v[0]) - a1;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      plot.arcPx(P[0], P[1], rPx, Math.min(a1, a1 + d), Math.max(a1, a1 + d), { stroke: col, width: 1.8, fill: withAlpha(col, 0.2), sector: true });
    }

    /**
     * Tangente in P (Richtung T) mit Normale und den Winkeln zwischen
     * Tangente und den Richtungen dirs (Brennstrahlen bzw. einfallendes Licht).
     */
    function tangentAt(P: Pt, T: Pt, dirs: [Pt, string][]): void {
      plot.line([P[0], P[1]], [P[0] + T[0], P[1] + T[1]], { color: COL.aux(), width: 2.2 });
      plot.line([P[0], P[1]], [P[0] - T[1], P[1] + T[0]], { color: withAlpha(th().text, 0.28), width: 1.1, dash: [4, 4] });
      for (const [v, col] of dirs) {
        const sgn = v[0] * T[0] + v[1] * T[1] >= 0 ? 1 : -1;
        angleArc(P, [sgn * T[0], sgn * T[1]], v, 30, col);
      }
    }

    /** Lichtstrahl als Pfeilzug A → B → C. */
    function ray(A: Pt, B: Pt, C: Pt, col: string): void {
      seg(A, B, col, 1.3);
      plot.arrow([B[0], B[1]], [C[0], C[1]], { color: col, width: 1.3, head: 7 });
    }

    /** Spiegelung und Tangente für Ellipse, Parabel und Hyperbel. */
    function drawReflection(): void {
      const rayCol = withAlpha(COL.aux(), 0.5);
      if (p.mode === 'ellipse') {
        const E = ellipse(p.a, p.b);
        for (let k = 0; k < 10; k++) {
          const Pk = ellipsePoint(E, (2 * Math.PI * (k + 0.5)) / 10);
          ray(E.foci[0], Pk, E.foci[1], rayCol);
        }
        const t = p.t * DEG;
        const P = ellipsePoint(E, t);
        tangentAt(P, ellipseTangent(E, t), [
          [[E.foci[0][0] - P[0], E.foci[0][1] - P[1]], COL.f1()],
          [[E.foci[1][0] - P[0], E.foci[1][1] - P[1]], COL.f2()],
        ]);
        return;
      }
      if (p.mode === 'parabola') {
        const Pb = parabola(p.f);
        const b = plot.bounds;
        const xm = Math.min(Math.abs(b.xMin), b.xMax) * 0.85;
        for (let k = 0; k < 7; k++) {
          const x = -xm + (2 * xm * k) / 6;
          const Pk = parabolaPoint(Pb, x);
          if (Pk[1] > b.yMax) continue;
          plot.arrow([x, b.yMax], [Pk[0], Pk[1]], { color: rayCol, width: 1.3, head: 7 });
          plot.arrow([Pk[0], Pk[1]], [Pb.focus[0], Pb.focus[1]], { color: rayCol, width: 1.3, head: 7 });
        }
        const x = (p.t / 180) * p.f * 6;
        const P = parabolaPoint(Pb, x);
        tangentAt(P, parabolaTangent(Pb, x), [
          [[0, 1], COL.dir()],
          [[Pb.focus[0] - P[0], Pb.focus[1] - P[1]], COL.f1()],
        ]);
        return;
      }
      const H = hyperbola(p.a, p.b);
      const b = plot.bounds;
      const far = (b.xMax - b.xMin) * 2;
      for (let k = 0; k < 7; k++) {
        const u = -1.1 + (2.2 * k) / 6;
        const Pk = hyperbolaPoint(H, u, 1);
        const r = reflect([Pk[0] - H.foci[1][0], Pk[1] - H.foci[1][1]], hyperbolaTangent(H, u, 1));
        const l = Math.hypot(r[0], r[1]) || 1;
        ray(H.foci[1], Pk, [Pk[0] + (r[0] / l) * far * 0.04, Pk[1] + (r[1] / l) * far * 0.04], rayCol);
        seg(Pk, [Pk[0] + (r[0] / l) * far, Pk[1] + (r[1] / l) * far], rayCol, 1.3);
        seg(H.foci[0], Pk, withAlpha(COL.aux(), 0.35), 1, [3, 4]);
      }
      const r = pointAt(p.t);
      if (!r) return;
      const side = r.side ?? 1;
      const u = Math.asinh(r.P[1] / H.b);
      tangentAt(r.P, hyperbolaTangent(H, u, side), [
        [[H.foci[0][0] - r.P[0], H.foci[0][1] - r.P[1]], COL.f1()],
        [[H.foci[1][0] - r.P[0], H.foci[1][1] - r.P[1]], COL.f2()],
      ]);
    }

    /** Winkel zwischen Tangente und den beiden Richtungen in P (Grad), für die Karte. */
    function reflectionAngles(): [number, number] | null {
      const r = pointAt(p.t);
      if (!r) return null;
      if (p.mode === 'ellipse') {
        const E = ellipse(p.a, p.b);
        const [w1, w2] = focalAngles(r.P, E.foci[0], E.foci[1], ellipseTangent(E, p.t * DEG));
        return [w1 / DEG, w2 / DEG];
      }
      if (p.mode === 'parabola') {
        const Pb = parabola(p.f);
        const T = parabolaTangent(Pb, r.P[0]);
        const [w1, w2] = focalAngles(r.P, [r.P[0], r.P[1] + 1], Pb.focus, T);
        return [w1 / DEG, w2 / DEG];
      }
      const H = hyperbola(p.a, p.b);
      const [w1, w2] = focalAngles(r.P, H.foci[0], H.foci[1], hyperbolaTangent(H, Math.asinh(r.P[1] / H.b), r.side ?? 1));
      return [w1 / DEG, w2 / DEG];
    }

    /* -------------------------------------------------------------- */
    /* Ansichten                                                       */
    /* -------------------------------------------------------------- */

    /** Leitkreis-Konstruktion für Ellipse und Hyperbel. */
    function drawDirector(): void {
      const isE = p.mode === 'ellipse';
      const { F1, F2, R } = dirCircle();
      const running = trace.running;
      const tt = running ? trace.value : 1;
      const faint = withAlpha(COL.curve(), running ? 0.18 : 1);
      if (isE) {
        const E = ellipse(p.a, p.b);
        poly(Array.from({ length: 241 }, (_, i) => ellipsePoint(E, (i / 240) * 2 * Math.PI)), 1, faint);
      } else {
        const H = hyperbola(p.a, p.b);
        const b = plot.bounds;
        const uMax = Math.asinh(Math.max(b.yMax, b.xMax) / H.b) + 0.2;
        for (const side of [1, -1] as const) poly(Array.from({ length: 161 }, (_, i) => hyperbolaPoint(H, -uMax + (2 * uMax * i) / 160, side)), 1, faint);
      }
      plot.circle(F1[0], F1[1], R, { stroke: withAlpha(COL.f1(), 0.7), width: 1.6, dash: [6, 5] });
      const phiDeg = running ? -180 + 360 * tt : p.t;
      if (running) {
        // Ortslinie wächst mit Q mit
        const parts: Pt[][] = [];
        let cur: Pt[] = [];
        for (let ph = -180; ph <= phiDeg; ph += 0.5) {
          const c = dirAt(ph);
          const last = cur[cur.length - 1];
          if (!c || (last && dist(c.P, last) > 2)) {
            if (cur.length > 1) parts.push(cur);
            cur = c ? [c.P] : [];
            continue;
          }
          cur.push(c.P);
        }
        if (cur.length > 1) parts.push(cur);
        for (const part of parts) poly(part, 1);
      }
      const u: Pt = [Math.cos(phiDeg * DEG), Math.sin(phiDeg * DEG)];
      const Q: Pt = [F1[0] + R * u[0], F1[1] + R * u[1]];
      plot.line([F1[0], F1[1]], [Q[0], Q[1]], { color: withAlpha(th().text, 0.22), width: 1.1 });
      seg(Q, F2, withAlpha(th().text, 0.35), 1.2, [3, 3]);
      const mid: Pt = [(Q[0] + F2[0]) / 2, (Q[1] + F2[1]) / 2];
      plot.line([mid[0], mid[1]], [mid[0] - (Q[1] - F2[1]), mid[1] + (Q[0] - F2[0])], { color: withAlpha(COL.aux(), 0.9), width: 1.6, dash: [7, 4] });
      plot.point(mid[0], mid[1], { color: COL.aux(), radius: 3.5 });
      pin(F1, 'F₁', COL.f1());
      pin(F2, 'F₂', COL.f2());
      const c = dirAt(phiDeg);
      if (c) {
        seg(F1, c.P, COL.f1(), 2.4);
        seg(c.P, F2, COL.f2(), 2.6);
        seg(c.P, Q, COL.dir(), 2.6);
        if (p.show) {
          midLabel(c.P, F2, N(dist(c.P, F2), 2), COL.f2(), [10, 12]);
          midLabel(c.P, Q, N(dist(c.P, Q), 2), COL.dir(), [-10, -10]);
        }
        plot.point(c.P[0], c.P[1], { color: COL.p(), radius: 5 });
        plot.text(c.P[0], c.P[1], 'P', { color: COL.p(), size: 13, weight: 'bold', offset: [12, -12], align: 'left', halo: true });
      }
      plot.point(Q[0], Q[1], { color: COL.dir(), radius: 5.5 });
      plot.text(Q[0], Q[1], 'Q', { color: COL.dir(), size: 13, weight: 'bold', offset: [Q[0] >= F1[0] ? 12 : -12, -12], align: Q[0] >= F1[0] ? 'left' : 'right', halo: true });
    }

    /** Übung: Kurve mit Gleichung, Brennpunkte ziehen. */
    function drawQuiz(): void {
      for (const part of taskCurve(task, 16)) poly(part, 1);
      const F = taskFoci(task);
      const reveal = !!verdict?.ok || tries >= 3;
      if (reveal) {
        for (const [i, q] of F.entries()) {
          plot.circle(q[0], q[1], 0.32, { stroke: COL.p(), width: 2 });
          plot.text(q[0], q[1], F.length === 1 ? 'F' : i === 0 ? 'F₁' : 'F₂', { color: COL.p(), size: 12, weight: 'bold', offset: [16, 14], halo: true });
        }
        // Probe an einem Kurvenpunkt
        if (task.kind !== 'parabola') {
          const part = taskCurve(task, 4)[0]!;
          const P = part[Math.floor(part.length * 0.18)]!;
          seg(F[0]!, P, withAlpha(COL.f1(), 0.7), 1.6, [5, 4]);
          seg(P, F[1]!, withAlpha(COL.f2(), 0.7), 1.6, [5, 4]);
          plot.point(P[0], P[1], { color: COL.p(), radius: 4 });
        } else {
          plot.hline(task.cy - task.f, { color: withAlpha(COL.dir(), 0.8), width: 1.6, dash: [6, 5] });
        }
      }
      for (const [i, g] of guess.entries()) {
        const col = i === 0 ? COL.f1() : COL.f2();
        plot.point(g[0], g[1], { color: col, radius: 7 });
        plot.text(g[0], g[1], guess.length === 1 ? 'F?' : i === 0 ? 'F₁?' : 'F₂?', { color: col, size: 13, weight: 'bold', offset: [0, -18], halo: true });
      }
    }

    function drawEllipse(): void {
      if (circleMode()) return drawDirector();
      const E = ellipse(p.a, p.b);
      const tt = trace.value;
      const pts: Pt[] = Array.from({ length: 241 }, (_, i) => ellipsePoint(E, (i / 240) * 2 * Math.PI));
      // Achsen
      seg([-E.a, 0], [E.a, 0], withAlpha(th().text, 0.25), 1.2);
      seg([0, -E.b], [0, E.b], withAlpha(th().text, 0.25), 1.2);
      plot.text(E.a / 2, 0, 'a', { color: th().muted, size: 12, weight: 'bold', offset: [0, -10], halo: true, math: true });
      plot.text(0, E.b / 2, 'b', { color: th().muted, size: 12, weight: 'bold', offset: [10, 0], halo: true, math: true });
      if (p.dir && E.directrix !== null) {
        plot.vline(E.directrix, { color: withAlpha(COL.dir(), 0.7), width: 1.6, dash: [6, 5] });
        plot.vline(-E.directrix, { color: withAlpha(COL.dir(), 0.7), width: 1.6, dash: [6, 5] });
      }
      if (p.tan && !trace.running) drawReflection();
      // Gärtnerkonstruktion: Stift läuft während der Animation
      const tPen = trace.running ? tt * 2 * Math.PI : p.t * DEG;
      poly(pts, trace.running ? tt : 1);
      const P = ellipsePoint(E, tPen);
      seg(E.foci[0], P, COL.f1(), 2.6);
      seg(P, E.foci[1], COL.f2(), 2.6);
      pin(E.foci[0], 'F₁', COL.f1());
      pin(E.foci[1], 'F₂', COL.f2());
      if (p.show) {
        midLabel(E.foci[0], P, `d₁ = ${N(dist(P, E.foci[0]), 2)}`, COL.f1(), [-6, -10]);
        midLabel(P, E.foci[1], `d₂ = ${N(dist(P, E.foci[1]), 2)}`, COL.f2(), [6, -10]);
      }
      plot.point(P[0], P[1], { color: COL.p(), radius: 5 });
      plot.text(P[0], P[1], trace.running ? tr('pen') : 'P', { color: COL.p(), size: 13, weight: 'bold', offset: [P[0] >= 0 ? 12 : -12, P[1] >= 0 ? -12 : 14], align: P[0] >= 0 ? 'left' : 'right', halo: true });
    }

    function drawParabola(): void {
      const Pb = parabola(p.f);
      const xs = plot.bounds;
      const tt = trace.value;
      const xMax = Math.max(Math.abs(xs.xMin), Math.abs(xs.xMax));
      const pts: Pt[] = Array.from({ length: 241 }, (_, i) => parabolaPoint(Pb, -xMax + (2 * xMax * i) / 240));
      plot.hline(Pb.directrix, { color: COL.dir(), width: 2.4 });
      plot.text(xs.xMax, Pb.directrix, 'l', { color: COL.dir(), size: 14, weight: 'bold', offset: [-12, 14], halo: true, math: true });
      const qx = trace.running ? -xMax * 0.9 + 1.8 * xMax * 0.9 * tt : (p.t / 180) * p.f * 6;
      // gezeichnet bis zum aktuellen Q (während der Animation von links nach rechts)
      if (trace.running) poly(pts.filter((q) => q[0] <= qx));
      else poly(pts);
      if (p.tan && !trace.running) drawReflection();
      const c = parabolaFromDirectrix(Pb, qx);
      // Senkrechte durch Q und Mittelsenkrechte von F und Q (= Tangente)
      plot.vline(qx, { color: withAlpha(th().text, 0.25), width: 1.2, dash: [4, 4] });
      const dx = c.Q[0] - Pb.focus[0];
      const dy = c.Q[1] - Pb.focus[1];
      plot.line([c.mid[0], c.mid[1]], [c.mid[0] - dy, c.mid[1] + dx], { color: withAlpha(COL.aux(), 0.8), width: 1.6, dash: [7, 4] });
      seg(Pb.focus, c.Q, withAlpha(th().text, 0.3), 1.2, [3, 3]);
      plot.point(c.mid[0], c.mid[1], { color: COL.aux(), radius: 3.5 });
      seg(Pb.focus, c.point, COL.f1(), 2.6);
      seg(c.point, c.Q, COL.dir(), 2.6);
      pin(Pb.focus, 'F', COL.f1());
      plot.point(c.Q[0], c.Q[1], { color: COL.dir(), radius: 4.5 });
      plot.text(c.Q[0], c.Q[1], 'Q', { color: COL.dir(), size: 12, weight: 'bold', offset: [10, 12], halo: true });
      if (p.show) {
        midLabel(Pb.focus, c.point, N(dist(c.point, Pb.focus), 2), COL.f1(), [-12, 0]);
        midLabel(c.point, c.Q, N(c.point[1] - Pb.directrix, 2), COL.dir(), [14, 0]);
      }
      plot.point(c.point[0], c.point[1], { color: COL.p(), radius: 5 });
      plot.text(c.point[0], c.point[1], 'P', { color: COL.p(), size: 13, weight: 'bold', offset: [12, -12], align: 'left', halo: true });
    }

    function drawHyperbola(): void {
      if (circleMode()) return drawDirector();
      const H = hyperbola(p.a, p.b);
      const tt = trace.running ? trace.value : 1;
      const xs = plot.bounds;
      const uMax = Math.asinh(Math.max(xs.yMax, xs.xMax) / H.b) + 0.2;
      for (const side of [1, -1] as const) {
        const pts: Pt[] = Array.from({ length: 161 }, (_, i) => hyperbolaPoint(H, -uMax + (2 * uMax * i) / 160, side));
        poly(pts, tt);
      }
      // Asymptoten und Rechteck
      plot.line([0, 0], [1, H.slope], { color: withAlpha(th().text, 0.35), width: 1.2, dash: [6, 5] });
      plot.line([0, 0], [1, -H.slope], { color: withAlpha(th().text, 0.35), width: 1.2, dash: [6, 5] });
      plot.polygon(
        [
          [-H.a, -H.b],
          [H.a, -H.b],
          [H.a, H.b],
          [-H.a, H.b],
        ],
        { stroke: withAlpha(th().text, 0.25), width: 1, dash: [3, 4] },
      );
      if (p.dir) {
        plot.vline(H.directrix, { color: withAlpha(COL.dir(), 0.7), width: 1.6, dash: [6, 5] });
        plot.vline(-H.directrix, { color: withAlpha(COL.dir(), 0.7), width: 1.6, dash: [6, 5] });
      }
      if (p.tan && !trace.running) drawReflection();
      const r = pointAt(p.t);
      pin(H.foci[0], 'F₁', COL.f1());
      pin(H.foci[1], 'F₂', COL.f2());
      if (!r) return;
      const P = r.P;
      seg(H.foci[0], P, COL.f1(), 2.4);
      seg(P, H.foci[1], COL.f2(), 2.4);
      if (p.show) {
        midLabel(H.foci[0], P, `d₁ = ${N(dist(P, H.foci[0]), 2)}`, COL.f1(), [-6, -10]);
        midLabel(P, H.foci[1], `d₂ = ${N(dist(P, H.foci[1]), 2)}`, COL.f2(), [6, 12]);
      }
      plot.point(P[0], P[1], { color: COL.p(), radius: 5 });
      plot.text(P[0], P[1], 'P', { color: COL.p(), size: 13, weight: 'bold', offset: [12, -12], align: 'left', halo: true });
    }

    function drawFocal(): void {
      const tt = trace.running ? trace.value : 1;
      plot.vline(-p.d, { color: COL.dir(), width: 2.4 });
      plot.text(-p.d, plot.bounds.yMax, 'l', { color: COL.dir(), size: 14, weight: 'bold', offset: [-10, 16], halo: true, math: true });
      const parts = focalCurve(p.eps, p.d, 900, Math.max(plot.bounds.xMax - plot.bounds.xMin, 10) * 3);
      for (const part of parts) poly(part, tt);
      pin([0, 0], 'F', COL.f1());
      const r = pointAt(p.t);
      if (!r) return;
      const P = r.P;
      const Q: Pt = [-p.d, P[1]];
      seg([0, 0], P, COL.f1(), 2.6);
      seg(P, Q, COL.dir(), 2.6);
      if (p.show) {
        midLabel([0, 0], P, N(dist(P, [0, 0]), 2), COL.f1(), [8, -10]);
        midLabel(P, Q, N(P[0] + p.d, 2), COL.dir(), [0, -10]);
      }
      plot.point(P[0], P[1], { color: COL.p(), radius: 5 });
      plot.text(P[0], P[1], 'P', { color: COL.p(), size: 13, weight: 'bold', offset: [12, -12], align: 'left', halo: true });
      plot.text(plot.bounds.xMax, plot.bounds.yMax, `${KIND_NAMES[kindOf(p.eps, 0.005)][ctx.lang]}, ε = ${N(p.eps, 2)}`, { color: COL.curve(), size: 14, weight: 'bold', align: 'right', offset: [-60, 18], halo: true });
    }

    function drawCone(R: Rect): void {
      const t = th();
      viewRect = { x: R.x + 4, y: R.y + 4, w: R.w - 8, h: R.h - 8 };
      const H = 2.6;
      view.setScene({ target: [0, 0, 0.2], radius: H * 1.35, anchor: [0.5, 0.52] });
      view.resize();
      view.begin();
      const ta = Math.tan(p.alpha * DEG);
      // Mantellinien und Ringe des Doppelkegels
      for (let i = 0; i < 24; i++) {
        const phi = (2 * Math.PI * i) / 24;
        const top: Vec3 = [H * ta * Math.cos(phi), H * ta * Math.sin(phi), H];
        const bot: Vec3 = [-top[0], -top[1], -H];
        view.segment(bot, top, { color: withAlpha(t.text, 0.16), width: 1 });
      }
      for (const z of [-H, -H / 2, H / 2, H]) {
        const r = Math.abs(z) * ta;
        const ring: Vec3[] = Array.from({ length: 49 }, (_, i) => [r * Math.cos((i / 48) * 2 * Math.PI), r * Math.sin((i / 48) * 2 * Math.PI), z]);
        view.polyline(ring, { color: withAlpha(t.text, Math.abs(z) === H ? 0.4 : 0.18), width: 1.2 });
      }
      // Ebene z = h + tan β · x als Rechteck
      const m = Math.tan(p.beta * DEG);
      const ext = H * ta * 1.25 + 0.5;
      const zOf = (x: number) => p.h + m * x;
      const xr = p.beta > 0.5 ? Math.min(ext, (H - p.h) / Math.max(m, 1e-6), (H + p.h) / Math.max(m, 1e-6)) : ext;
      const corners: Vec3[] = [
        [-xr, -ext, zOf(-xr)],
        [xr, -ext, zOf(xr)],
        [xr, ext, zOf(xr)],
        [-xr, ext, zOf(-xr)],
      ];
      view.face(corners, { color: COL.aux(), alpha: t.dark ? 0.22 : 0.16, flat: true, stroke: withAlpha(COL.aux(), 0.6), width: 1.2 });
      // Schnittkurve
      const parts = coneSection(p.alpha, p.beta, p.h, H);
      const tt = trace.running ? trace.value : 1;
      for (const part of parts) {
        const n = Math.max(2, Math.ceil(part.length * tt));
        view.polyline(part.slice(0, n) as unknown as Vec3[], { color: COL.curve(), width: 3.4, layer: 'front' });
      }
      view.point([0, 0, 0], { color: t.text, radius: 3 });
      view.end();
      const kd = coneSectionKind(p.alpha, p.beta, 0.5);
      const g = surface.g;
      g.save();
      g.font = `800 15px ${t.font}`;
      g.fillStyle = COL.curve();
      g.fillText(KIND_NAMES[kd][ctx.lang], R.x + 16, R.y + 26);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number, alpha = 1): number {
      let s = size;
      const width = (z: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${z}px ${th().font}`;
          return sum + g.measureText(sg.s).width;
        }, 0);
      while (s > 10.5 && width(s) > maxW) s -= 0.5;
      g.save();
      g.globalAlpha *= alpha;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        for (const wd of g.measureText(sg.s).width > maxW * 0.5 ? sg.s.split(/(?<= )/) : [sg.s]) {
          const ww = g.measureText(wd).width;
          if (cx + ww > x + maxW && cx > x + 20) {
            cx = x + 12;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += ww;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.curve());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      const r = pointAt(p.t);
      /** Zusatzzeilen für Leitkreis und Spiegelung (Ellipse/Hyperbel/Parabel). */
      const extras = (base: string): void => {
        if (circleMode()) {
          const { F2 } = dirCircle();
          const c = dirAt(p.t);
          if (c && p.show) line([{ s: '|PF₂| = ', c: t.text }, { s: N(dist(c.P, F2), 3), c: COL.f2(), w: 700 }, { s: ' = |PQ| = ', c: t.text }, { s: N(dist(c.P, c.Q), 3), c: COL.dir(), w: 700 }], -0.5);
          if (!c) line([{ s: tr('lkNone'), c: COL.dir(), w: 600 }], -1.5);
          y += 4;
          line([{ s: tr(p.mode === 'ellipse' ? 'lkE' : 'lkH'), c: t.muted }], -2);
          return;
        }
        if (p.tan) {
          const w = reflectionAngles();
          if (w && p.show) line([{ s: `${tr('angles')}: `, c: t.text }, { s: `${N(w[0], 1)}°`, c: p.mode === 'parabola' ? COL.dir() : COL.f1(), w: 700 }, { s: ' = ' }, { s: `${N(w[1], 1)}°`, c: p.mode === 'parabola' ? COL.f1() : COL.f2(), w: 700 }], -0.5);
          y += 4;
          line([{ s: tr(p.mode === 'ellipse' ? 'tanE' : p.mode === 'parabola' ? 'tanP' : 'tanH'), c: t.muted }], -2);
          return;
        }
        line([{ s: tr(base), c: t.muted }], -2);
      };
      switch (p.mode) {
        case 'quiz': {
          line([{ s: tr('quizT'), c: COL.curve(), w: 800 }], 0.5);
          line([{ s: taskEquation(task, (v) => N(v, 4)), c: t.text, w: 700 }], 1.5);
          line([{ s: tr(guess.length === 1 ? 'quizHow1' : 'quizHow2'), c: t.muted }], -1.5);
          y += 4;
          const F = taskFoci(task);
          const fociTxt = F.map((q, i) => `${F.length === 1 ? 'F' : i === 0 ? 'F₁' : 'F₂'}(${N(q[0], 2)} | ${N(q[1], 2)})`).join(',  ');
          if (verdict) {
            if (verdict.ok) line([{ s: tr('right'), c: COL.p(), w: 800 }, { s: `  ${fociTxt}`, c: t.text, w: 600 }], 1);
            else line([{ s: tr('wrong', { d: N(verdict.err, 2) }), c: COL.f1(), w: 700 }], 0);
          }
          if (tries >= 1 && !verdict?.ok) line([{ s: tr(task.kind === 'ellipse' ? 'hintE' : task.kind === 'hyperbola' ? 'hintH' : 'hintP'), c: t.muted }], -2);
          if (tries >= 3 && !verdict?.ok) line([{ s: `${tr('solution')}: `, c: t.text, w: 700 }, { s: `e = ${N(taskE(task), 3)},  ${fociTxt}`, c: COL.p(), w: 700 }], -1);
          if (quizCount) {
            y += 4;
            line([{ s: tr('score', { k: quizRight, n: quizCount }), c: t.muted, w: 600 }], -1.5);
          }
          return;
        }
        case 'ellipse': {
          const E = ellipse(p.a, p.b);
          line([{ s: tr('ellT'), c: COL.curve(), w: 800 }], 0.5);
          line([{ s: `x²/${N(E.a * E.a, 2)} + y²/${N(E.b * E.b, 2)} = 1`, c: t.text, w: 700 }], 1);
          if (!p.show) return void line([{ s: tr('hidden'), c: t.muted }], -1);
          line([{ s: `${tr('lin')} = √(a² − b²) = ${N(E.e, 3)}`, c: t.text }], -1);
          line([{ s: `F₁(${N(-E.e, 2)} | 0),  F₂(${N(E.e, 2)} | 0)`, c: t.text, w: 600 }], -1);
          line([{ s: `${tr('num')} = ${N(E.eps, 3)}`, c: t.muted }], -1.5);
          if (p.dir && E.directrix !== null) line([{ s: `${tr('dirL')}: x = ±a²/e = ±${N(E.directrix, 3)}`, c: COL.dir() }], -1.5);
          y += 6;
          if (r) {
            const d1 = dist(r.P, E.foci[0]);
            const d2 = dist(r.P, E.foci[1]);
            line([{ s: `d₁ + d₂ = `, c: t.text }, { s: N(d1, 3), c: COL.f1(), w: 700 }, { s: ' + ' }, { s: N(d2, 3), c: COL.f2(), w: 700 }, { s: ` = ${N(d1 + d2, 3)} = 2a`, c: COL.p(), w: 800 }], 1);
          }
          y += 6;
          extras('ellG');
          if (Math.abs(p.a - p.b) < 1e-9) line([{ s: `a = b: ${KIND_NAMES.circle[ctx.lang]}, F₁ = F₂`, c: COL.curve(), w: 700 }], -1);
          return;
        }
        case 'parabola': {
          const Pb = parabola(p.f);
          line([{ s: tr('parT'), c: COL.curve(), w: 800 }], 0.5);
          line([{ s: `y = x² / ${N(4 * p.f, 2)} = ${N(1 / (4 * p.f), 3)} · x²`, c: t.text, w: 700 }], 1);
          if (!p.show) return void line([{ s: tr('hidden'), c: t.muted }], -1);
          line([{ s: `F(0 | ${N(Pb.focus[1], 2)}),  l: y = ${N(Pb.directrix, 2)}`, c: t.text, w: 600 }], -1);
          y += 6;
          if (r) {
            const df = dist(r.P, Pb.focus);
            const dl = r.P[1] - Pb.directrix;
            line([{ s: '|PF| = ', c: t.text }, { s: N(df, 3), c: COL.f1(), w: 700 }, { s: ',  |Pl| = ', c: t.text }, { s: N(dl, 3), c: COL.dir(), w: 700 }], 1);
          }
          y += 6;
          extras('parG');
          return;
        }
        case 'hyperbola': {
          const H = hyperbola(p.a, p.b);
          line([{ s: tr('hypT'), c: COL.curve(), w: 800 }], 0.5);
          line([{ s: `x²/${N(H.a * H.a, 2)} − y²/${N(H.b * H.b, 2)} = 1`, c: t.text, w: 700 }], 1);
          if (!p.show) return void line([{ s: tr('hidden'), c: t.muted }], -1);
          line([{ s: `e = √(a² + b²) = ${N(H.e, 3)},  F₁,₂(±${N(H.e, 2)} | 0)`, c: t.text, w: 600 }], -1);
          line([{ s: `${tr('asym')}: y = ±${N(H.slope, 3)} · x,  ε = ${N(H.eps, 3)}`, c: t.muted }], -1.5);
          if (p.dir) line([{ s: `${tr('dirL')}: x = ±a²/e = ±${N(H.directrix, 3)}`, c: COL.dir() }], -1.5);
          y += 6;
          if (r) {
            const d1 = dist(r.P, H.foci[0]);
            const d2 = dist(r.P, H.foci[1]);
            line([{ s: '|d₁ − d₂| = ', c: t.text }, { s: `|${N(d1, 3)} − ${N(d2, 3)}|`, c: t.text, w: 600 }, { s: ` = ${N(Math.abs(d1 - d2), 3)} = 2a`, c: COL.p(), w: 800 }], 1);
          }
          y += 6;
          extras('hypG');
          return;
        }
        case 'focal': {
          const kd = kindOf(p.eps, 0.005);
          line([{ s: tr('focT'), c: COL.curve(), w: 800 }], 0.5);
          line([{ s: `${tr('kind')}: `, c: t.muted }, { s: KIND_NAMES[kd][ctx.lang], c: COL.curve(), w: 800 }, { s: `  (ε = ${N(p.eps, 2)})`, c: t.text }], 1);
          line([{ s: `r(θ) = ε·d / (1 − ε·cos θ)`, c: t.text }], -1);
          if (p.show && r) {
            const dF = dist(r.P, [0, 0]);
            const dL = r.P[0] + p.d;
            y += 4;
            line([{ s: '|PF| : |Pl| = ', c: t.text }, { s: N(dF, 3), c: COL.f1(), w: 700 }, { s: ' : ' }, { s: N(dL, 3), c: COL.dir(), w: 700 }, { s: ` = ${N(dF / dL, 3)} = ε`, c: COL.p(), w: 800 }], 1);
          }
          y += 6;
          line([{ s: tr('focG'), c: t.muted }], -2);
          return;
        }
        case 'cone': {
          const kd = coneSectionKind(p.alpha, p.beta, 0.5);
          line([{ s: tr('coneT'), c: COL.curve(), w: 800 }], 0.5);
          line([{ s: `${tr('kind')}: `, c: t.muted }, { s: KIND_NAMES[kd][ctx.lang], c: COL.curve(), w: 800 }], 2);
          line([{ s: tr('cmp', { b: N(p.beta, 0), c: N(90 - p.alpha, 0) }), c: t.text, w: 600 }]);
          line([{ s: p.beta < 0.5 ? 'β = 0 → Kreis' : p.beta < 90 - p.alpha - 0.5 ? 'β < 90° − α → Ellipse' : p.beta > 90 - p.alpha + 0.5 ? 'β > 90° − α → Hyperbel' : 'β = 90° − α → Parabel', c: COL.curve(), w: 600 }], -1);
          if (p.show) line([{ s: `ε = sin β / cos α = ${N(coneEccentricity(p.alpha, p.beta), 3)}`, c: t.muted }], -1);
          y += 6;
          line([{ s: tr('coneG'), c: t.muted }], -2);
          return;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      switch (p.mode) {
        case 'ellipse': {
          const E = ellipse(p.a, p.b);
          ctx.readout('eq', `x²/${N(E.a * E.a, 2)} + y²/${N(E.b * E.b, 2)} = 1`);
          ctx.readout('foci', `(±${N(E.e, 3)} | 0)`);
          ctx.readout('eps', N(E.eps, 3));
          ctx.readout('prop', `d₁ + d₂ = ${N(2 * E.a, 3)}`);
          break;
        }
        case 'parabola':
          ctx.readout('eq', `y = x²/${N(4 * p.f, 2)}`);
          ctx.readout('foci', `(0 | ${N(p.f, 2)}), l: y = ${N(-p.f, 2)}`);
          ctx.readout('eps', '1');
          ctx.readout('prop', '|PF| = |Pl|');
          break;
        case 'hyperbola': {
          const H = hyperbola(p.a, p.b);
          ctx.readout('eq', `x²/${N(H.a * H.a, 2)} − y²/${N(H.b * H.b, 2)} = 1`);
          ctx.readout('foci', `(±${N(H.e, 3)} | 0)`);
          ctx.readout('eps', N(H.eps, 3));
          ctx.readout('prop', `|d₁ − d₂| = ${N(2 * H.a, 3)}`);
          break;
        }
        case 'focal':
          ctx.readout('eq', `r = ${N(p.eps * p.d, 3)} / (1 − ${N(p.eps, 2)}·cos θ)`);
          ctx.readout('foci', '(0 | 0)');
          ctx.readout('eps', `${N(p.eps, 2)} (${KIND_NAMES[kindOf(p.eps, 0.005)][ctx.lang]})`);
          ctx.readout('prop', `|PF| = ${N(p.eps, 2)} · |Pl|`);
          break;
        case 'quiz': {
          const show = !!verdict?.ok || tries >= 3;
          const F = taskFoci(task);
          ctx.readout('eq', taskEquation(task, (v) => N(v, 4)));
          ctx.readout('foci', show ? F.map((q) => `(${N(q[0], 2)} | ${N(q[1], 2)})`).join(', ') : '?');
          ctx.readout('eps', task.kind === 'parabola' ? '1' : N(taskE(task) / task.a, 3));
          ctx.readout('prop', KIND_NAMES[task.kind][ctx.lang]);
          break;
        }
        case 'cone':
          ctx.readout('eq', KIND_NAMES[coneSectionKind(p.alpha, p.beta, 0.5)][ctx.lang]);
          ctx.readout('foci', '–');
          ctx.readout('eps', N(coneEccentricity(p.alpha, p.beta), 3));
          ctx.readout('prop', tr('cmp', { b: N(p.beta, 0), c: N(90 - p.alpha, 0) }));
          break;
      }
    }

    return {
      update(changed, source) {
        if (['mode', 'a', 'b', 'f', 'eps', 'd', 'cons'].some((q) => changed.has(q)) || source === 'init' || source === 'replace') fitRange();
        if (changed.has('q') || changed.has('mode') || source === 'init' || source === 'replace') newTask();
        if (changed.has('cons')) trace.play();
        if (changed.has('mode') || source === 'replace') trace.play();
        updateReadouts();
      },
      action(id) {
        if (id === 'play') trace.play();
        if (id === 'check' && p.mode === 'quiz') {
          verdict = checkFoci(task, guess);
          tries++;
          if (!solved.has(p.q)) {
            if (tries === 1) quizCount++;
            if (verdict.ok) {
              quizRight++;
              solved.add(p.q);
            }
          }
          updateReadouts();
          ctx.requestRender();
        }
        if (id === 'task' && p.mode === 'quiz') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1 });
          newTask();
          updateReadouts();
          ctx.requestRender();
        }
      },
      resetView() {
        fitRange();
        plot.resetView();
        view.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        mainRect = R.main;
        drawCard(g, R.main, th());
        if (p.mode === 'cone') drawCone(R.main);
        else {
          viewRect = { x: -100, y: -100, w: 10, h: 10 };
          plot.resize();
          plot.begin();
          plot.grid({ minor: true });
          plot.axes();
          if (p.mode === 'ellipse') drawEllipse();
          else if (p.mode === 'parabola') drawParabola();
          else if (p.mode === 'hyperbola') drawHyperbola();
          else if (p.mode === 'quiz') drawQuiz();
          else drawFocal();
          plot.end();
        }
        drawCardBody(g, R.card);
        if (trace.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
