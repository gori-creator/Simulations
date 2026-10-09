import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  armDistances,
  bisectorDir,
  circumcenter,
  clampToField,
  closer,
  collinear,
  constructAngleBisector,
  constructBisector,
  decimalsToTell,
  dir,
  dist,
  footOnLine,
  footOnRay,
  GRID_H,
  GRID_W,
  meetingPoint,
  perpBisector,
  triangleKind,
  type Angle,
  type Pt,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'mittel' | 'winkel' | 'konstr' | 'anw' | 'umk';
type Vals = Record<string, unknown>;
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm360 = (d: number) => ((d % 360) + 360) % 360;
const deg = (rad: number) => (rad * 180) / Math.PI;
const isMode =
  (...modes: Mode[]) =>
  (v: Vals) =>
    modes.includes(v.mode as Mode);
const usesAB = (v: Vals) => v.mode === 'mittel' || v.mode === 'anw' || v.mode === 'umk' || (v.mode === 'konstr' && v.what === 'mittel');
const usesAngle = (v: Vals) => v.mode === 'winkel' || (v.mode === 'konstr' && v.what === 'winkel');

/** Ausgangslagen, wenn man das Thema von Hand wechselt (Häuser und Straße bzw. Dreieck). */
const SCENE_ANW = { ax: 4, ay: 9, bx: 15, by: 12, gx: 0, gy: 3, hx: 20, hy: 5 };
const SCENE_UMK = { ax: 3, ay: 2, bx: 15, by: 4, cx: 8, cy: 12 };

interface Hit {
  id: string;
  r: Rect;
}

type PtId = 'a' | 'b' | 'c' | 's' | 'g' | 'h';
type Drag = { kind: 'pt'; id: PtId } | { kind: 'p' } | { kind: 'arm'; which: 1 | 2 } | null;

/* ------------------------------------------------------------------ */
/* Konstruktion: Ablauf aus Schritten mit einzelnen Teilbewegungen     */
/* ------------------------------------------------------------------ */

/** Zirkel: Spitze (pin), Richtung zur Mine in Grad, Radius in Kästchen; bend ±1 = Gelenk oben, 0 = von der Seite. */
interface Compass {
  pin: Pt;
  ang: number;
  r: number;
  alpha: number;
  bend: number;
}

interface CState {
  arcs: { c: Pt; r: number; a0: number; a1: number }[];
  points: { p: Pt; label: string; pop: number }[];
  radius: { c: Pt; ang: number; r: number; alpha: number } | null;
  line: { a: Pt; b: Pt; t: number } | null;
  ruler: { a: Pt; b: Pt; alpha: number; slide: number } | null;
  pencil: number;
  compass: Compass | null;
  finish: number;
}

interface Op {
  dur: number;
  apply(s: CState, t: number): void;
}

const emptyState = (): CState => ({ arcs: [], points: [], radius: null, line: null, ruler: null, pencil: 0, compass: null, finish: 0 });

/** Seite des Zirkelgelenks: so, dass es beim Bezugswinkel nach oben zeigt. */
const hingeSide = (refDeg: number) => (Math.cos((refDeg * Math.PI) / 180) >= 0 ? 1 : -1);

/**
 * Mittelsenkrechte und Winkelhalbierende: als Ortslinien entdecken (Punkt P
 * ziehen, Abstände vergleichen, Spur der gleich weit entfernten Punkte),
 * Schritt für Schritt mit Zirkel und Lineal konstruieren (animierter Zirkel),
 * eine Anwendung (Treffpunkt an einer Straße) und als Ausblick der
 * Umkreismittelpunkt eines Dreiecks.
 */
export default defineSimulation({
  id: 'mittelsenkrechte',
  dragHint: true,
  layout: { aspect: 1.7, aspectNarrow: 0.47 },
  groups: [
    { id: 'pts', label: L('Punkte (in Kästchen)', 'Points (in grid squares)') },
    { id: 'road', label: L('Straße durch G und H (in Kästchen)', 'Road through G and H (in grid squares)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'mittel', label: L('Mittelsenkrechte', 'Perpendicular bisector') },
        { value: 'winkel', label: L('Winkelhalbierende', 'Angle bisector') },
        { value: 'konstr', label: L('Konstruktion', 'Construction') },
        { value: 'anw', label: L('Anwendung: Treffpunkt', 'Application: meeting point') },
        { value: 'umk', label: L('Ausblick: Umkreis', 'Outlook: circumcircle') },
      ],
      default: 'mittel',
    },
    {
      key: 'what',
      type: 'choice',
      label: L('Konstruieren', 'Construct'),
      options: [
        { value: 'mittel', label: L('Mittelsenkrechte', 'Perpendicular bisector') },
        { value: 'winkel', label: L('Winkelhalbierende', 'Angle bisector') },
      ],
      default: 'mittel',
      visibleIf: isMode('konstr'),
    },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: nach rechts', 'A: right'), min: 0, max: GRID_W, step: 1, default: 4, visibleIf: usesAB },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: nach oben', 'A: up'), min: 0, max: GRID_H, step: 1, default: 5, visibleIf: usesAB },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: nach rechts', 'B: right'), min: 0, max: GRID_W, step: 1, default: 12, visibleIf: usesAB },
    { key: 'by', type: 'number', group: 'pts', label: L('B: nach oben', 'B: up'), min: 0, max: GRID_H, step: 1, default: 9, visibleIf: usesAB },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: nach rechts', 'C: right'), min: 0, max: GRID_W, step: 1, default: 8, visibleIf: isMode('umk') },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: nach oben', 'C: up'), min: 0, max: GRID_H, step: 1, default: 13, visibleIf: isMode('umk') },
    { key: 'sx', type: 'number', group: 'pts', label: L('Scheitel S: nach rechts', 'Vertex S: right'), min: 0, max: GRID_W, step: 1, default: 3, visibleIf: usesAngle },
    { key: 'sy', type: 'number', group: 'pts', label: L('Scheitel S: nach oben', 'Vertex S: up'), min: 0, max: GRID_H, step: 1, default: 2, visibleIf: usesAngle },
    { key: 'th', type: 'number', label: L('Richtung des Schenkels [SA', 'Direction of the arm SA'), min: 0, max: 359, step: 1, default: 10, unit: '°', visibleIf: usesAngle, help: L('gemessen gegen den Uhrzeigersinn von „nach rechts“ aus', 'measured anticlockwise from “to the right”') },
    { key: 'al', type: 'number', label: L('Winkel α', 'Angle α'), min: 20, max: 180, step: 1, default: 70, unit: '°', visibleIf: usesAngle },
    { key: 'gx', type: 'number', group: 'road', label: L('G: nach rechts', 'G: right'), min: 0, max: GRID_W, step: 1, default: 0, visibleIf: isMode('anw') },
    { key: 'gy', type: 'number', group: 'road', label: L('G: nach oben', 'G: up'), min: 0, max: GRID_H, step: 1, default: 3, visibleIf: isMode('anw') },
    { key: 'hx', type: 'number', group: 'road', label: L('H: nach rechts', 'H: right'), min: 0, max: GRID_W, step: 1, default: 20, visibleIf: isMode('anw') },
    { key: 'hy', type: 'number', group: 'road', label: L('H: nach oben', 'H: up'), min: 0, max: GRID_H, step: 1, default: 5, visibleIf: isMode('anw') },
    {
      key: 'line',
      type: 'boolean',
      group: 'view',
      label: L('Ortslinie zeigen', 'Show the locus'),
      help: L('Mittelsenkrechte m bzw. Winkelhalbierende w. Ausgeschaltet kann man sie mit der Spur selbst entdecken.', 'Perpendicular bisector m or angle bisector w. Switch off to discover it yourself with the trace.'),
      default: true,
      visibleIf: isMode('mittel', 'winkel', 'anw', 'umk'),
    },
    { key: 'zones', type: 'boolean', group: 'view', label: L('Färbung „näher an …“', 'Colour by “closer to …”'), default: true, visibleIf: isMode('mittel', 'winkel', 'anw') },
    { key: 'trace', type: 'boolean', group: 'view', label: L('Spur der gleich weit entfernten Punkte', 'Trace of equidistant points'), default: true, visibleIf: isMode('mittel', 'winkel') },
    { key: 'circ', type: 'boolean', group: 'view', label: L('Umkreis zeigen', 'Show the circumcircle'), default: true, visibleIf: isMode('umk') },
  ],
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true, visibleIf: isMode('konstr') },
    { id: 'play', label: L('Alles abspielen', 'Play all'), visibleIf: isMode('konstr') },
    { id: 'restart', label: L('Von vorn', 'Start again'), visibleIf: isMode('konstr') },
    { id: 'clear', label: L('Spur löschen', 'Clear the trace'), visibleIf: isMode('mittel', 'winkel') },
  ],
  readouts: [
    { key: 'dist', label: L('Abstände', 'Distances') },
    { key: 'angle', label: L('Winkel', 'Angle') },
    { key: 'trace', label: L('Spur', 'Trace') },
    { key: 'step', label: L('Konstruktion', 'Construction') },
    { key: 'meet', label: L('Treffpunkt T', 'Meeting point T'), spoiler: true },
    { key: 'u', label: L('Umkreis', 'Circumcircle'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Mittelsenkrechte als Ortslinie', 'Perpendicular bisector as a locus'), values: {} },
    { id: 'winkel', label: L('Winkelhalbierende als Ortslinie', 'Angle bisector as a locus'), values: { mode: 'winkel' } },
    { id: 'konstr', label: L('Mittelsenkrechte konstruieren', 'Construct a perpendicular bisector'), values: { mode: 'konstr', ax: 4, ay: 6, bx: 15, by: 8 } },
    { id: 'konstrw', label: L('Winkelhalbierende konstruieren', 'Construct an angle bisector'), values: { mode: 'konstr', what: 'winkel', sx: 3, sy: 3, th: 5, al: 64 } },
    { id: 'anw', label: L('Spielplatz an der Straße', 'Playground by the road'), values: { mode: 'anw', ...SCENE_ANW } },
    { id: 'umk', label: L('Ausblick: Umkreismittelpunkt', 'Outlook: circumcentre'), values: { mode: 'umk', ...SCENE_UMK } },
  ],
  strings: {
    de: {
      canvas: 'Karopapier mit einer Strecke bzw. einem Winkel, einem ziehbaren Punkt P mit seinen Abständen und der Mittelsenkrechten bzw. Winkelhalbierenden als Ortslinie; dazu eine animierte Konstruktion mit Zirkel und Lineal, eine Straße mit zwei Häusern und ein Dreieck mit Umkreis',
      distT: 'Abstände von P',
      armT: 'Abstände von P zu den Schenkeln',
      closerA: 'P ist näher an A.',
      closerB: 'P ist näher an B.',
      equalAB: 'Gleich weit: P liegt auf m.',
      foundT: 'Gleich weit – der Treffpunkt!',
      closer1: 'P ist näher an [SA.',
      closer2: 'P ist näher an [SB.',
      equal12: 'Gleich weit: P liegt auf w.',
      traceT: 'Spur',
      traceN: '{n} Punkte',
      trace1: '1 Punkt',
      trace0: 'noch keiner',
      traceHintM: 'Ziehe P auf Stellen mit |PA| = |PB|. Jeder Fund hinterlässt einen grünen Punkt.',
      traceHintW: 'Ziehe P auf Stellen, die von beiden Schenkeln gleich weit entfernt sind. Jeder Fund hinterlässt einen grünen Punkt.',
      traceLineM: 'Alle gefundenen Punkte liegen auf einer Geraden: der Mittelsenkrechten m.',
      traceLineW: 'Alle gefundenen Punkte liegen auf einer Halbgeraden: der Winkelhalbierenden w.',
      traceGuess: 'Was fällt dir an den grünen Punkten auf? Schalte danach „Ortslinie zeigen“ ein.',
      useT: 'Anwendung',
      useM: 'Ein Spielplatz soll von den Häusern A und B gleich weit entfernt sein. Alle passenden Orte liegen auf der Mittelsenkrechten von [AB].',
      useMShort: 'Spielplatz gleich weit von A und B',
      useW: 'Ein Brunnen soll von zwei geraden Straßen gleich weit entfernt sein. Alle passenden Orte liegen auf der Winkelhalbierenden.',
      useWShort: 'Brunnen gleich weit von zwei Straßen',
      merkeT: 'Merke',
      merkeM: 'Die Mittelsenkrechte m der Strecke [AB] geht durch den Mittelpunkt M von [AB] und steht senkrecht auf [AB]. Jeder Punkt auf m ist von A und B gleich weit entfernt – und nur diese Punkte. m ist eine Ortslinie.',
      merkeW: 'Die Winkelhalbierende w teilt den Winkel in zwei gleich große Winkel. Jeder Punkt auf w ist von beiden Schenkeln gleich weit entfernt (Abstand = Länge des Lots) – im Inneren des Winkels nur diese Punkte.',
      merkeU: 'Die drei Mittelsenkrechten eines Dreiecks schneiden sich in einem Punkt U. U ist von allen drei Ecken gleich weit entfernt und ist der Mittelpunkt des Umkreises.',
      stepsTM: 'Mittelsenkrechte von [AB] konstruieren',
      stepsTW: 'Winkelhalbierende von α konstruieren',
      m0: 'Gegeben ist die Strecke [AB].',
      m1: 'Zirkel in A einstechen und weiter öffnen als die halbe Strecke [AB].',
      m2: 'Um A einen Kreisbogen zeichnen – oberhalb und unterhalb von [AB].',
      m3: 'Ohne den Zirkel zu verstellen in B einstechen und einen zweiten Bogen zeichnen.',
      m4: 'Die beiden Bögen schneiden sich in S₁ und S₂.',
      m5: 'Lineal anlegen und S₁ mit S₂ verbinden: Das ist die Mittelsenkrechte m.',
      m6: 'm halbiert [AB] im Mittelpunkt M und steht senkrecht auf [AB].',
      w0: 'Gegeben ist der Winkel α mit dem Scheitel S.',
      w1: 'Zirkel in S einstechen und einen beliebigen Radius einstellen.',
      w2: 'Einen Bogen um S zeichnen: Er schneidet die Schenkel in P₁ und P₂.',
      w3: 'Zirkel in P₁ einstechen und einen Bogen ins Innere des Winkels zeichnen.',
      w4: 'Mit demselben Radius in P₂ einstechen: Die Bögen schneiden sich in W.',
      w5: 'Lineal anlegen und S mit W verbinden: Das ist die Winkelhalbierende w.',
      w6: 'w teilt α in zwei gleich große Winkel: je {h}°.',
      why: 'Warum funktioniert das?',
      whyM: 'Beide Bögen haben denselben Radius r. Also sind S₁ und S₂ von A und B gleich weit entfernt und liegen auf der Mittelsenkrechten. AS₁BS₂ ist sogar eine Raute: Ihre Diagonalen halbieren sich und stehen senkrecht aufeinander.',
      whyW: 'Es gilt |SP₁| = |SP₂| und |P₁W| = |P₂W|. Also ist SP₁WP₂ ein Drachenviereck. Seine Symmetrieachse SW halbiert den Winkel bei S.',
      stepOf: 'Schritt {i} von {n}',
      done: 'Fertig!',
      next: 'Nächster Schritt',
      restart: 'Von vorn',
      taskT: 'Aufgabe: Spielplatz an der Straße',
      taskTs: 'Aufgabe',
      taskText: 'Die Familien in den Häusern A und B wünschen sich einen gemeinsamen Spielplatz an der Straße. Er soll von beiden Häusern gleich weit entfernt sein. Ziehe P an die richtige Stelle!',
      taskFound: 'Gefunden: |TA| = |TB| {r}',
      taskNone: 'Die Straße verläuft parallel zur Mittelsenkrechten. Kein Ort an der Straße ist von A und B gleich weit entfernt.',
      taskAll: 'Die Straße ist selbst die Mittelsenkrechte: Jeder Ort an der Straße ist von A und B gleich weit entfernt.',
      taskOut: 'Der Treffpunkt liegt außerhalb des Blattes.',
      ideaT: 'Lösungsidee',
      idea: 'Alle Orte, die von A und B gleich weit entfernt sind, liegen auf der Mittelsenkrechten m von [AB]. Der Spielplatz gehört in den Schnittpunkt T von m mit der Straße.',
      puzzleT: 'Knobelfrage',
      puzzle: 'Lege die Straße mit G und H so, dass es keinen passenden Ort gibt. Und so, dass jeder Ort an der Straße passt?',
      uT: 'Umkreis des Dreiecks ABC',
      uText: 'Die drei Mittelsenkrechten schneiden sich in einem Punkt U. Er ist von A, B und C gleich weit entfernt.',
      uHidden: 'Zeichne die Mittelsenkrechten der Seiten. Wo schneiden sie sich?',
      uSpitz: 'Spitzwinkliges Dreieck: U liegt innerhalb.',
      uRecht: 'Rechtwinkliges Dreieck: U ist der Mittelpunkt der längsten Seite (Thaleskreis).',
      uStumpf: 'Stumpfwinkliges Dreieck: U liegt außerhalb.',
      uUseT: 'Anwendung',
      uUse: 'Ein Funkmast soll von drei Dörfern gleich weit entfernt sein: Er gehört in den Umkreismittelpunkt U.',
      uNone: 'A, B und C liegen auf einer Geraden – die Mittelsenkrechten sind parallel, es gibt keinen Umkreis.',
      kindsT: 'Wo liegt U?',
      kSpitz: 'spitzwinklig',
      kRecht: 'rechtwinklig',
      kStumpf: 'stumpfwinklig',
      kIn: 'innen',
      kOn: 'auf der Seite',
      kOut: 'außen',
      distRead: '|PA| {a}, |PB| {b} – {v}',
      armRead: 'Abstand zu [SA {a}, zu [SB {b} – {v}',
      angleRead: 'α = {a}°, α/2 = {h}°',
      traceRead: '{n} Punkte gefunden',
      traceRead1: '1 Punkt gefunden',
      halfEach: 'je {h}°',
      stepsTMs: 'Mittelsenkrechte konstruieren',
      stepsTWs: 'Winkelhalbierende konstruieren',
      whyMShort: 'Gleicher Radius: S₁ und S₂ sind von A und B gleich weit entfernt, liegen also auf m.',
      whyWShort: '|SP₁| = |SP₂| und |P₁W| = |P₂W|: Drachenviereck, SW ist Symmetrieachse.',
      stepRead: 'Schritt {i} von {n}: {t}',
      meetRead: 'T {pt}, |TA| = |TB| {r}',
      meetNone: 'kein Treffpunkt (Straße parallel zur Mittelsenkrechten)',
      meetAll: 'jeder Punkt der Straße (Straße = Mittelsenkrechte)',
      uRead: 'U {pt}, r = |UA| = |UB| = |UC| {r}; {k}',
      vA: 'näher an A',
      vB: 'näher an B',
      vEq: 'gleich weit',
      v1: 'näher an [SA',
      v2: 'näher an [SB',
    },
    en: {
      canvas: 'Squared paper with a segment or an angle, a draggable point P with its distances and the perpendicular bisector or angle bisector as a locus; plus an animated construction with compasses and ruler, a road with two houses and a triangle with its circumcircle',
      distT: 'Distances of P',
      armT: 'Distances of P from the arms',
      closerA: 'P is closer to A.',
      closerB: 'P is closer to B.',
      equalAB: 'Equal: P lies on m.',
      foundT: 'Equal – the meeting point!',
      closer1: 'P is closer to SA.',
      closer2: 'P is closer to SB.',
      equal12: 'Equal: P lies on w.',
      traceT: 'Trace',
      traceN: '{n} points',
      trace1: '1 point',
      trace0: 'none yet',
      traceHintM: 'Drag P onto places with PA = PB. Every hit leaves a green dot.',
      traceHintW: 'Drag P onto places equally far from both arms. Every hit leaves a green dot.',
      traceLineM: 'All the dots lie on one straight line: the perpendicular bisector m.',
      traceLineW: 'All the dots lie on one ray: the angle bisector w.',
      traceGuess: 'What do you notice about the green dots? Then switch on “Show the locus”.',
      useT: 'Application',
      useM: 'A playground should be equally far from the houses A and B. All suitable places lie on the perpendicular bisector of AB.',
      useMShort: 'Playground equally far from A and B',
      useW: 'A fountain should be equally far from two straight roads. All suitable places lie on the angle bisector.',
      useWShort: 'Fountain equally far from two roads',
      merkeT: 'Remember',
      merkeM: 'The perpendicular bisector m of the segment AB passes through the midpoint M of AB at right angles. Every point on m is equally far from A and B – and only these points. m is a locus.',
      merkeW: 'The angle bisector w splits the angle into two equal angles. Every point on w is equally far from both arms (distance = length of the perpendicular) – and inside the angle only these points.',
      merkeU: 'The three perpendicular bisectors of a triangle meet at one point U. U is equally far from all three vertices and is the centre of the circumcircle.',
      stepsTM: 'Constructing the perpendicular bisector of AB',
      stepsTW: 'Constructing the bisector of α',
      m0: 'The segment AB is given.',
      m1: 'Put the compass point on A and open it wider than half of AB.',
      m2: 'Draw an arc around A – above and below AB.',
      m3: 'Without changing the width, put the point on B and draw a second arc.',
      m4: 'The two arcs meet at S₁ and S₂.',
      m5: 'Use the ruler to join S₁ and S₂: this is the perpendicular bisector m.',
      m6: 'm bisects AB at its midpoint M at right angles.',
      w0: 'The angle α with vertex S is given.',
      w1: 'Put the compass point on S and choose any radius.',
      w2: 'Draw an arc around S: it cuts the arms at P₁ and P₂.',
      w3: 'Put the compass point on P₁ and draw an arc inside the angle.',
      w4: 'With the same radius, put the point on P₂: the arcs meet at W.',
      w5: 'Use the ruler to join S and W: this is the angle bisector w.',
      w6: 'w splits α into two equal angles of {h}° each.',
      why: 'Why does it work?',
      whyM: 'Both arcs have the same radius r. So S₁ and S₂ are equally far from A and B and lie on the perpendicular bisector. AS₁BS₂ is even a rhombus: its diagonals bisect each other at right angles.',
      whyW: 'SP₁ = SP₂ and P₁W = P₂W, so SP₁WP₂ is a kite. Its line of symmetry SW bisects the angle at S.',
      stepOf: 'Step {i} of {n}',
      done: 'Done!',
      next: 'Next step',
      restart: 'Start again',
      taskT: 'Task: a playground by the road',
      taskTs: 'Task',
      taskText: 'The families in the houses A and B would like a shared playground by the road, equally far from both houses. Drag P to the right place!',
      taskFound: 'Found: TA = TB {r}',
      taskNone: 'The road is parallel to the perpendicular bisector. No place on the road is equally far from A and B.',
      taskAll: 'The road is the perpendicular bisector itself: every place on it is equally far from A and B.',
      taskOut: 'The meeting point lies off the sheet.',
      ideaT: 'Idea',
      idea: 'All places equally far from A and B lie on the perpendicular bisector m of AB. The playground belongs where m crosses the road: the point T.',
      puzzleT: 'Puzzle',
      puzzle: 'Move G and H so that no place on the road fits. Can you also place the road so that every place on it fits?',
      uT: 'Circumcircle of triangle ABC',
      uText: 'The three perpendicular bisectors meet at one point U. It is equally far from A, B and C.',
      uHidden: 'Draw the perpendicular bisectors of the sides. Where do they meet?',
      uSpitz: 'Acute triangle: U lies inside.',
      uRecht: 'Right triangle: U is the midpoint of the longest side (Thales circle).',
      uStumpf: 'Obtuse triangle: U lies outside.',
      uUseT: 'Application',
      uUse: 'A radio mast should be equally far from three villages: it belongs at the circumcentre U.',
      uNone: 'A, B and C lie on one line – the perpendicular bisectors are parallel, so there is no circumcircle.',
      kindsT: 'Where is U?',
      kSpitz: 'acute',
      kRecht: 'right',
      kStumpf: 'obtuse',
      kIn: 'inside',
      kOn: 'on a side',
      kOut: 'outside',
      distRead: 'PA {a}, PB {b} – {v}',
      armRead: 'distance to SA {a}, to SB {b} – {v}',
      angleRead: 'α = {a}°, α/2 = {h}°',
      traceRead: '{n} points found',
      traceRead1: '1 point found',
      halfEach: '{h}° each',
      stepsTMs: 'Perpendicular bisector',
      stepsTWs: 'Angle bisector',
      whyMShort: 'Same radius: S₁ and S₂ are equally far from A and B, so they lie on m.',
      whyWShort: 'SP₁ = SP₂ and P₁W = P₂W: a kite whose line of symmetry is SW.',
      stepRead: 'Step {i} of {n}: {t}',
      meetRead: 'T {pt}, TA = TB {r}',
      meetNone: 'no meeting point (road parallel to the perpendicular bisector)',
      meetAll: 'every point of the road (road = perpendicular bisector)',
      uRead: 'U {pt}, r = UA = UB = UC {r}; {k}',
      vA: 'closer to A',
      vB: 'closer to B',
      vEq: 'equal',
      v1: 'closer to SA',
      v2: 'closer to SB',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const mode = () => p.mode as Mode;
    const what = () => p.what as 'mittel' | 'winkel';
    const wide = () => surface.width >= 640;
    /** Größe je nach Bildschirm: breit bzw. schmal. */
    const F = (w: number, n: number) => (wide() ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${ctx.theme.font}`;
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    const col = {
      a: () => ctx.theme.series[0]!,
      b: () => ctx.theme.series[1]!,
      c: () => ctx.theme.series[5]!,
      line: () => ctx.theme.series[4]!,
      ok: () => ctx.theme.series[2]!,
      right: () => ctx.theme.series[2]!,
      tick: () => ctx.theme.series[3]!,
      p: () => ctx.theme.series[3]!,
      pencil: () => (ctx.theme.dark ? '#c5ccd6' : '#3a414d'),
    };

    const A = (): Pt => [p.ax, p.ay];
    const B = (): Pt => [p.bx, p.by];
    const C = (): Pt => [p.cx, p.cy];
    const G = (): Pt => [p.gx, p.gy];
    const H = (): Pt => [p.hx, p.hy];
    const angle = (): Angle => ({ s: [p.sx, p.sy], th1: p.th, al: p.al });

    /* ---------- Zustand ---------- */
    let P: Pt = [6, 3];
    let PW: Pt = [10, 4];
    let roadS = 4;
    let traceM: Pt[] = [];
    let traceW: Pt[] = [];
    const tracePop = new Tween(500, ease.outBack);
    const eqPop = new Tween(460, ease.outBack);
    let lastEq = false;

    // Konstruktion
    let stepIdx = 0;
    let stepStart = -Infinity;
    let autoPlay = false;
    let wasRunning = false;

    let hits: Hit[] = [];
    let hover: string | null = null;
    let drag: Drag = null;

    /* ---------- Aufteilung ---------- */
    type Layout = { paper: Rect; cell: number; side: Rect | null; below: Rect };
    let layoutCache: { key: string; lay: Layout } | null = null;
    function layout(): Layout {
      const key = `${surface.width}x${surface.height}`;
      if (layoutCache?.key !== key) layoutCache = { key, lay: computeLayout() };
      return layoutCache.lay;
    }
    /**
     * Quer (auch auf Tablets mit schmaler Zeichenfläche): Papier links, Karten
     * rechts und unter dem Papier. Hochkant (Handy): Papier oben, Karten darunter.
     */
    function computeLayout(): Layout {
      const W = surface.width;
      const H = surface.height;
      const gap = wide() ? 12 : 8;
      if (W > H * 1.05) {
        const colW = Math.round(wide() ? clamp(W * 0.36, 260, 330) : clamp(W * 0.4, 180, 260));
        const leftW = W - colW - gap;
        const belowMin = wide() ? 96 : 72;
        const cell = Math.min((leftW - 4) / (GRID_W + 1), (H - 4 - belowMin - gap) / (GRID_H + 1));
        const pw = Math.floor(cell * (GRID_W + 1));
        const ph = Math.floor(cell * (GRID_H + 1));
        const px = Math.round(2 + (leftW - 4 - pw) / 2);
        return {
          paper: { x: px, y: 2, w: pw, h: ph },
          cell,
          side: { x: W - colW, y: 2, w: colW - 2, h: H - 4 },
          below: { x: px, y: ph + 2 + gap, w: pw, h: H - ph - 4 - gap },
        };
      }
      const cell = (W - 4) / (GRID_W + 1);
      const pw = Math.floor(cell * (GRID_W + 1));
      const ph = Math.floor(cell * (GRID_H + 1));
      const px = Math.round((W - pw) / 2);
      return { paper: { x: px, y: 2, w: pw, h: ph }, cell, side: null, below: { x: px, y: ph + 2 + gap, w: pw, h: H - ph - 4 - gap } };
    }

    function toPx(q: Pt): Px {
      const { paper, cell } = layout();
      return [paper.x + (q[0] + 0.5) * cell, paper.y + (GRID_H + 0.5 - q[1]) * cell];
    }
    function toWorld(px: number, py: number): Pt {
      const { paper, cell } = layout();
      return [(px - paper.x) / cell - 0.5, GRID_H + 0.5 - (py - paper.y) / cell];
    }
    const snap = (q: Pt): Pt => [clamp(Math.round(q[0]), 0, GRID_W), clamp(Math.round(q[1]), 0, GRID_H)];
    const inGrid = (q: Pt): Pt => [clamp(q[0], 0, GRID_W), clamp(q[1], 0, GRID_H)];
    const onGrid = (q: Pt, margin = 0) => q[0] >= margin && q[0] <= GRID_W - margin && q[1] >= margin && q[1] <= GRID_H - margin;

    /* ---------- Zahlen ---------- */
    /** Länge in cm (1 Kästchen = 0,5 cm): „=“, wenn exakt, sonst „≈“. */
    function cmText(k: number, sign = true, dec = 1): string {
      const v = k / 2;
      const f = 10 ** dec;
      const exact = Math.abs(v * f - Math.round(v * f)) < 1e-6;
      const s = exact ? fmt.num(v, dec) : fmt.fixed(v, dec);
      return `${sign ? (exact ? '= ' : '≈ ') : exact ? '' : '≈ '}${s} cm`;
    }
    const ptText = (q: Pt) => {
      const r = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? fmt.num(v, 0) : `≈ ${fmt.fixed(v, 1)}`);
      return `(${r(q[0])} | ${r(q[1])})`;
    };

    /* ---------- Ortslinien: P einrasten ---------- */
    /** Mittelsenkrechte: P auf Gitterpunkte, nahe an m auf m. */
    function placeP(w: Pt): void {
      const q = inGrid(w);
      const lat = snap(q);
      const { m, d } = perpBisector(A(), B());
      const f = footOnLine(q, m, d);
      if (dist(q, f) < 0.3 && onGrid(f)) {
        P = closer(lat, A(), B()) === 'equal' && dist(lat, q) < 0.5 ? lat : f;
      } else P = lat;
      if (dist(P, A()) < 1e-9 || dist(P, B()) < 1e-9) P = lat[0] < GRID_W ? [lat[0] + 1, lat[1]] : [lat[0] - 1, lat[1]];
    }
    /** Winkelhalbierende: P im Winkelfeld, nahe an w auf w. */
    function placePW(q: Pt): void {
      const an = angle();
      let r = clampToField(inGrid(q), an);
      const u = dir(bisectorDir(an));
      const f = footOnLine(r, an.s, u);
      const along = (f[0] - an.s[0]) * u[0] + (f[1] - an.s[1]) * u[1];
      if (dist(r, f) < 0.35 && along > 0 && onGrid(f)) r = f;
      PW = r;
    }

    /* ---------- Anwendung: Straße ---------- */
    function road(): { o: Pt; u: Pt; s0: number; s1: number } {
      const g = G();
      const h = H();
      const l = dist(g, h) || 1;
      const u: Pt = [(h[0] - g[0]) / l, (h[1] - g[1]) / l];
      const [e0, e1] = extendToPaper(g, h, 0.5);
      const s0 = (e0[0] - g[0]) * u[0] + (e0[1] - g[1]) * u[1];
      const s1 = (e1[0] - g[0]) * u[0] + (e1[1] - g[1]) * u[1];
      return { o: g, u, s0: Math.min(s0, s1), s1: Math.max(s0, s1) };
    }
    const roadAt = (s: number): Pt => {
      const r = road();
      return [r.o[0] + r.u[0] * s, r.o[1] + r.u[1] * s];
    };
    const roadP = (): Pt => roadAt(roadS);
    function meetS(): number | null {
      const mt = meetingPoint(A(), B(), G(), H());
      if (mt.kind !== 'point') return null;
      const r = road();
      const s = (mt.t[0] - r.o[0]) * r.u[0] + (mt.t[1] - r.o[1]) * r.u[1];
      return s >= r.s0 - 1e-9 && s <= r.s1 + 1e-9 ? s : null;
    }
    function placePR(w: Pt): void {
      const r = road();
      let s = clamp((w[0] - r.o[0]) * r.u[0] + (w[1] - r.o[1]) * r.u[1], r.s0, r.s1);
      const t = meetS();
      if (t !== null && Math.abs(s - t) < 0.3) s = t;
      roadS = s;
    }

    /* ---------- Gleich weit? Spur ---------- */
    const eqM = () => closer(P, A(), B()) === 'equal';
    const eqW = () => {
      const [d1, d2] = armDistances(PW, angle());
      return Math.abs(d1 - d2) < 1e-6;
    };
    const eqR = () => meetingPoint(A(), B(), G(), H()).kind !== 'none' && closer(roadP(), A(), B()) === 'equal';

    function addTrace(list: Pt[], q: Pt): Pt[] {
      if (list.some((t) => dist(t, q) < 0.7)) return list;
      tracePop.play();
      return [...list, q];
    }

    function checkEqual(): void {
      const m = mode();
      const eq = m === 'mittel' ? eqM() : m === 'winkel' ? eqW() : m === 'anw' ? eqR() : false;
      if (eq && !lastEq) eqPop.play();
      lastEq = eq;
      if (eq && p.trace) {
        if (m === 'mittel') traceM = addTrace(traceM, P);
        else if (m === 'winkel') traceW = addTrace(traceW, PW);
      }
    }

    /* ---------- Hilfsgeometrie ---------- */
    /** Gerade durch a und b bis kurz vor den Rand des Papiers (Weltkoordinaten). */
    function extendToPaper(a: Pt, b: Pt, margin = 0.3): [Pt, Pt] {
      const d = [b[0] - a[0], b[1] - a[1]] as const;
      let t0 = -Infinity;
      let t1 = Infinity;
      const lims: [number, number, number, number][] = [
        [d[0], a[0], -0.5 + margin, GRID_W + 0.5 - margin],
        [d[1], a[1], -0.5 + margin, GRID_H + 0.5 - margin],
      ];
      for (const [dd, s0, lo, hi] of lims) {
        if (Math.abs(dd) < 1e-12) continue;
        let u0 = (lo - s0) / dd;
        let u1 = (hi - s0) / dd;
        if (u0 > u1) [u0, u1] = [u1, u0];
        t0 = Math.max(t0, u0);
        t1 = Math.min(t1, u1);
      }
      return [
        [a[0] + t0 * d[0], a[1] + t0 * d[1]],
        [a[0] + t1 * d[0], a[1] + t1 * d[1]],
      ];
    }

    /** Länge des Schenkels bis zum Griff: möglichst weit draußen, aber im Papier. */
    function armHandleDist(th: number): number {
      const an = angle();
      const u = dir(th);
      let t = 9;
      while (t > 2) {
        const q: Pt = [an.s[0] + u[0] * t, an.s[1] + u[1] * t];
        if (onGrid(q, 0.3)) break;
        t -= 0.25;
      }
      return t;
    }
    const armPoint = (th: number): Pt => {
      const an = angle();
      const u = dir(th);
      const t = armHandleDist(th);
      return [an.s[0] + u[0] * t, an.s[1] + u[1] * t];
    };

    /* ---------- Konstruktion: Ablauf ---------- */
    interface Step {
      text: string;
      ops: Op[];
    }

    /**
     * Seite des Gelenks für einen Bogen um pin mit Radius r (Bezugsrichtung refAng):
     * möglichst oben, aber so, dass der Zirkel auf dem Papier bleibt.
     */
    function bendFor(pin: Pt, r: number, refAng: number): number {
      const up = hingeSide(refAng);
      const { cell } = layout();
      const rpx = Math.max(6, r * cell);
      const Lg = Math.max(rpx * 0.6 + 34, rpx / 2 + 26);
      const hgt = (Math.sqrt(Math.max(0, Lg * Lg - (rpx / 2) ** 2)) + 22) / cell;
      const u = dir(refAng);
      const mid: Pt = [pin[0] + (u[0] * r) / 2, pin[1] + (u[1] * r) / 2];
      const fits = (side: number) => onGrid([mid[0] - u[1] * hgt * side, mid[1] + u[0] * hgt * side], -0.4);
      if (fits(up)) return up;
      return fits(-up) ? -up : up;
    }

    function compassIn(pin: Pt, ang: number, r: number, refAng: number, dur = 1500): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(pin, r, refAng);
          // erst hinführen (fast geschlossen), dann aufziehen
          const t1 = clamp(t / 0.45, 0, 1);
          const t2 = clamp((t - 0.45) / 0.55, 0, 1);
          const e = ease.outCubic(t1);
          const rr = lerp(r * 0.3, r, ease.inOutCubic(t2));
          s.compass = { pin: [pin[0] + (1 - e) * 3, pin[1] + (1 - e) * 2.2], ang: ang - (1 - e) * 25, r: rr, alpha: Math.min(1, t1 * 2), bend: side };
          s.radius = t2 > 0 ? { c: pin, ang, r: rr, alpha: Math.min(1, t2 * 2) } : null;
        },
      };
    }
    function compassMove(pin: Pt, ang: number, r: number, refAng: number, dur = 1100): Op {
      return {
        dur,
        apply(s, t) {
          const side = bendFor(pin, r, refAng);
          const c = s.compass ?? { pin, ang, r, alpha: 1, bend: side };
          const e = ease.inOutCubic(t);
          let da = norm360(ang - c.ang);
          if (da > 180) da -= 360;
          // angehoben: etwas durchsichtiger in der Mitte der Bewegung
          s.compass = { pin: [lerp(c.pin[0], pin[0], e), lerp(c.pin[1], pin[1], e)], ang: c.ang + da * e, r: lerp(c.r, r, e), alpha: 1 - 0.15 * Math.sin(Math.PI * t), bend: lerp(c.bend, side, e) };
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
    function compassOut(dur = 650): Op {
      return {
        dur,
        apply(s, t) {
          if (!s.compass) return;
          const c = s.compass;
          s.compass = t >= 1 ? null : { ...c, pin: [c.pin[0] + t * 3, c.pin[1] + t * 2], alpha: 1 - t };
        },
      };
    }
    function markOp(points: { p: Pt; label: string }[], dur = 700): Op {
      return {
        dur,
        apply(s, t) {
          points.forEach((q, i) => s.points.push({ ...q, pop: clamp(t * (points.length + 0.6) - i * 0.6, 0, 1) }));
        },
      };
    }
    function rulerLine(a: Pt, b: Pt, ext: [Pt, Pt]): Op[] {
      return [
        {
          dur: 750,
          apply(s, t) {
            s.ruler = { a, b, alpha: Math.min(1, t * 1.6), slide: 1 - ease.outCubic(t) };
          },
        },
        {
          dur: 1300,
          apply(s, t) {
            s.ruler = { a, b, alpha: 1, slide: 0 };
            s.line = { a: ext[0], b: ext[1], t: ease.inOutCubic(t) };
            s.pencil = t <= 0 ? 0 : t < 0.85 ? Math.min(1, t * 8) : (1 - t) / 0.15;
          },
        },
        {
          dur: 550,
          apply(s, t) {
            s.pencil = 0;
            s.ruler = t >= 1 ? null : { a, b, alpha: 1 - t, slide: t * 0.7 };
          },
        },
      ];
    }
    const finishOp = (dur = 800): Op => ({
      dur,
      apply(s, t) {
        s.finish = t;
      },
    });

    /** Radius der Bögen: größer als die halbe Strecke, Schnittpunkte möglichst auf dem Papier. */
    function bisectorConstruction() {
      const a = A();
      const b = B();
      for (const f of [0.72, 0.65, 0.6, 0.56]) {
        const c = constructBisector(a, b, f);
        if (onGrid(c.s1, -0.3) && onGrid(c.s2, -0.3)) return c;
      }
      return constructBisector(a, b, 0.56);
    }
    function angleConstruction() {
      const an = angle();
      const tMax = Math.min(armHandleDist(an.th1), armHandleDist(an.th1 + an.al));
      let r1 = clamp(tMax * 0.55, 2, 4.5);
      let c = constructAngleBisector(an, r1);
      while (!onGrid(c.w, -0.2) && r1 > 1.6) {
        r1 -= 0.25;
        c = constructAngleBisector(an, r1);
      }
      return { r1, ...c };
    }

    let stepsCache: { key: string; steps: Step[] } | null = null;
    function steps(): Step[] {
      const key = what() === 'mittel' ? `m${p.ax},${p.ay},${p.bx},${p.by}` : `w${p.sx},${p.sy},${p.th},${p.al}`;
      if (stepsCache?.key === key) return stepsCache.steps;
      const list = what() === 'mittel' ? stepsMittel() : stepsWinkel();
      stepsCache = { key, steps: list };
      return list;
    }

    function stepsMittel(): Step[] {
      const a = A();
      const b = B();
      const c = bisectorConstruction();
      const dAB = deg(Math.atan2(b[1] - a[1], b[0] - a[0]));
      // halber Öffnungswinkel des Bogens: bis zu den Schnittpunkten und etwas darüber hinaus
      const sw = deg(Math.acos(clamp(dist(a, b) / 2 / c.r, -1, 1))) + 20;
      return [
        { text: ctx.t('m0'), ops: [] },
        { text: ctx.t('m1'), ops: [compassIn(a, dAB - sw, c.r, dAB)] },
        { text: ctx.t('m2'), ops: [arcOp(a, c.r, dAB - sw, dAB + sw)] },
        { text: ctx.t('m3'), ops: [compassMove(b, dAB + 180 + sw, c.r, dAB + 180), arcOp(b, c.r, dAB + 180 + sw, dAB + 180 - sw)] },
        {
          text: ctx.t('m4'),
          ops: [
            markOp([
              { p: c.s1, label: 'S₁' },
              { p: c.s2, label: 'S₂' },
            ]),
          ],
        },
        { text: ctx.t('m5'), ops: [compassOut(), ...rulerLine(c.s1, c.s2, extendToPaper(c.s1, c.s2))] },
        { text: ctx.t('m6'), ops: [markOp([{ p: c.m, label: 'M' }]), finishOp()] },
      ];
    }

    function stepsWinkel(): Step[] {
      const an = angle();
      const c = angleConstruction();
      const dW1 = deg(Math.atan2(c.w[1] - c.p1[1], c.w[0] - c.p1[0]));
      const dW2 = deg(Math.atan2(c.w[1] - c.p2[1], c.w[0] - c.p2[0]));
      const far = extendToPaper(an.s, c.w)[1];
      const mid = an.th1 + an.al / 2;
      return [
        { text: ctx.t('w0'), ops: [] },
        { text: ctx.t('w1'), ops: [compassIn(an.s, an.th1 - 14, c.r1, mid)] },
        {
          text: ctx.t('w2'),
          ops: [
            arcOp(an.s, c.r1, an.th1 - 14, an.th1 + an.al + 14, 1700),
            markOp([
              { p: c.p1, label: 'P₁' },
              { p: c.p2, label: 'P₂' },
            ]),
          ],
        },
        { text: ctx.t('w3'), ops: [compassMove(c.p1, dW1 - 24, c.r2, dW1), arcOp(c.p1, c.r2, dW1 - 24, dW1 + 24)] },
        { text: ctx.t('w4'), ops: [compassMove(c.p2, dW2 + 24, c.r2, dW2), arcOp(c.p2, c.r2, dW2 + 24, dW2 - 24), markOp([{ p: c.w, label: 'W' }])] },
        { text: ctx.t('w5'), ops: [compassOut(), ...rulerLine(an.s, c.w, [an.s, far])] },
        { text: tr('w6', { h: fmt.num(an.al / 2, 1) }), ops: [finishOp()] },
      ];
    }

    const stepDur = (st: Step) => st.ops.reduce((s, o) => s + o.dur, 0);
    const stepRunning = () => {
      if (reduced) return false;
      const st = steps()[stepIdx];
      return !!st && performance.now() - stepStart < stepDur(st);
    };
    const constrDone = () => stepIdx >= steps().length - 1 && !stepRunning();

    /** Zeichenzustand der Konstruktion zum aktuellen Zeitpunkt. */
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
      if (stepRunning()) return;
      if (stepIdx >= steps().length - 1) return;
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

    /* ---------- Ergebnisse ---------- */
    function distPair(v1: number, v2: number, eq: boolean): [string, string] {
      const dec = decimalsToTell(v1 / 2, v2 / 2, eq);
      return [cmText(v1, true, dec), cmText(v2, true, dec)];
    }

    function updateReadouts(): void {
      const m = mode();
      for (const k of ['dist', 'angle', 'trace', 'step', 'meet', 'u']) ctx.readout(k, null);
      if (m === 'mittel' || m === 'anw') {
        const q = m === 'mittel' ? P : roadP();
        const v1 = dist(q, A());
        const v2 = dist(q, B());
        const eq = m === 'mittel' ? eqM() : eqR();
        const [a, b] = distPair(v1, v2, eq);
        ctx.readout('dist', tr('distRead', { a, b, v: ctx.t(eq ? 'vEq' : v1 < v2 ? 'vA' : 'vB') }));
        if (m === 'mittel') ctx.readout('trace', tr(traceM.length === 1 ? 'traceRead1' : 'traceRead', { n: traceM.length }));
        else {
          const mt = meetingPoint(A(), B(), G(), H());
          if (mt.kind === 'point') ctx.readout('meet', tr('meetRead', { pt: ptText(mt.t), r: cmText(dist(mt.t, A())) }));
          else ctx.readout('meet', ctx.t(mt.kind === 'none' ? 'meetNone' : 'meetAll'));
        }
      } else if (m === 'winkel') {
        const [d1, d2] = armDistances(PW, angle());
        const eq = eqW();
        const [a, b] = distPair(d1, d2, eq);
        ctx.readout('dist', tr('armRead', { a, b, v: ctx.t(eq ? 'vEq' : d1 < d2 ? 'v1' : 'v2') }));
        ctx.readout('angle', tr('angleRead', { a: p.al, h: fmt.num(p.al / 2, 1) }));
        ctx.readout('trace', tr(traceW.length === 1 ? 'traceRead1' : 'traceRead', { n: traceW.length }));
      } else if (m === 'konstr') {
        const list = steps();
        ctx.readout('step', tr('stepRead', { i: stepIdx, n: list.length - 1, t: list[stepIdx]!.text }));
        if (what() === 'winkel') ctx.readout('angle', tr('angleRead', { a: p.al, h: fmt.num(p.al / 2, 1) }));
      } else {
        const pts = [A(), B(), C()] as const;
        const u = collinear(...pts) ? null : circumcenter(...pts);
        if (!u) ctx.readout('u', ctx.t('uNone'));
        else {
          const k = triangleKind(...pts);
          ctx.readout('u', tr('uRead', { pt: ptText(u), r: cmText(dist(u, pts[0])), k: ctx.t(k === 'spitz' ? 'uSpitz' : k === 'recht' ? 'uRecht' : 'uStumpf') }));
        }
      }
      const list = steps();
      ctx.setAction('next', { enabled: !ctx.locked && stepIdx < list.length - 1 });
      ctx.setAction('play', { enabled: !ctx.locked });
      ctx.setAction('restart', { enabled: !ctx.locked });
      ctx.setAction('clear', { enabled: !ctx.locked });
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
      str = str.replace(/ ([=<>]) /g, ' $1 ').replace(/ (cm|°)/g, ' $1');
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

    /** Kartentitel; zu lange Titel werden etwas kleiner geschrieben, notfalls gekürzt. */
    function title(x: number, y: number, label: string, color = ctx.theme.muted, maxW = Infinity): void {
      const g = surface.g;
      let size = F(12, 11);
      g.font = font(700, size);
      while (g.measureText(label).width > maxW && size > 10) {
        size -= 0.5;
        g.font = font(700, size);
      }
      let t = label;
      while (g.measureText(t).width > maxW && t.length > 4) t = `${t.slice(0, -2)}…`;
      text(g, t, x, y, { font: font(700, size), color, align: 'left' });
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

    /** Strichmarken (gleich lang): n Querstriche bei (mx, my) quer zur Pixelrichtung d. */
    function ticks(mx: number, my: number, d: Px, n: number, color: string, len = 6): void {
      const g = surface.g;
      const nx = -d[1];
      const ny = d[0];
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2.2;
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

    /** Rechter Winkel (Viertelkreis mit Punkt) bei z zwischen den Pixelrichtungen d1 und d2. */
    function rightMark(z: Px, d1: Px, d2: Px, color: string, r = 11): void {
      const g = surface.g;
      const a1 = Math.atan2(d1[1], d1[0]);
      let diff = Math.atan2(d2[1], d2[0]) - a1;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      g.save();
      g.beginPath();
      g.moveTo(z[0], z[1]);
      g.arc(z[0], z[1], r, a1, a1 + diff, diff < 0);
      g.closePath();
      g.fillStyle = withAlpha(color, 0.16);
      g.fill();
      g.beginPath();
      g.arc(z[0], z[1], r, a1, a1 + diff, diff < 0);
      g.strokeStyle = color;
      g.lineWidth = 1.6;
      g.stroke();
      const m = a1 + diff / 2;
      g.beginPath();
      g.arc(z[0] + Math.cos(m) * r * 0.5, z[1] + Math.sin(m) * r * 0.5, 1.9, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.restore();
    }

    function fullLine(a: Px, b: Px, color: string, width: number, dash?: number[]): void {
      const g = surface.g;
      const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
      const ext = 4000;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(a[0] - ux * ext, a[1] - uy * ext);
      g.lineTo(b[0] + ux * ext, b[1] + uy * ext);
      g.stroke();
      g.restore();
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

    /** Beschriftung neben einem Punkt in Pixelrichtung `away`, im Papier gehalten. */
    function labelAt(q: Px, label: string, away: Px, color: string, distPx = 17, size?: number): void {
      const [ux, uy] = unit(away[0], away[1]);
      const { paper } = layout();
      const lx = clamp(q[0] + ux * distPx, paper.x + 10, paper.x + paper.w - 10);
      const ly = clamp(q[1] + uy * distPx, paper.y + 11, paper.y + paper.h - 11);
      haloText(label, lx, ly, font(800, size ?? F(15, 13)), color);
    }

    /** Ziehbarer Punkt (Kreis mit Hof beim Überfahren). */
    function handle(q: Px, id: string, color: string, label: string | null, away: Px = [-1, -1], big = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      const active = hover === id || (drag !== null && dragId(drag) === id);
      if (!ctx.locked) {
        g.beginPath();
        g.arc(q[0], q[1], active ? 15 : 12, 0, Math.PI * 2);
        g.fillStyle = withAlpha(color, active ? 0.28 : 0.14);
        g.fill();
      }
      g.beginPath();
      g.arc(q[0], q[1], big ? 6 : 5, 0, Math.PI * 2);
      g.fillStyle = big ? color : theme.bg;
      g.fill();
      g.strokeStyle = big ? theme.bg : color;
      g.lineWidth = big ? 2 : 2.6;
      g.stroke();
      if (label) labelAt(q, label, away, color);
    }

    function dragId(d: NonNullable<Drag>): string {
      if (d.kind === 'pt') return d.id;
      if (d.kind === 'p') return 'p';
      return `arm${d.which}`;
    }

    /** Bereits gezeichnete Wert-Schilder (gegen Überlappung). */
    let placedTags: Rect[] = [];

    function tagRect(x: number, y: number, label: string): Rect {
      const g = surface.g;
      g.font = font(700, F(12, 11));
      const w = g.measureText(label).width + 12;
      const h = F(20, 18);
      const { paper } = layout();
      return { x: clamp(x - w / 2, paper.x + 3, paper.x + paper.w - w - 3), y: clamp(y - h / 2, paper.y + 3, paper.y + paper.h - h - 3), w, h };
    }
    const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w + 2 && b.x < a.x + a.w + 2 && a.y < b.y + b.h + 2 && b.y < a.y + a.h + 2;

    /** Wert-Schild (abgerundet) an einer Stelle, im Papier gehalten. */
    function tag(x: number, y: number, label: string, color: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const f = font(700, F(12, 11));
      const { x: bx, y: by, w, h } = tagRect(x, y, label);
      placedTags.push({ x: bx, y: by, w, h });
      g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
      roundRect(g, bx, by, w, h, h / 2);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.75);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, label, bx + w / 2, by + h / 2 + 0.5, { font: f, color });
    }

    /** Schild in der Mitte zwischen p und q, seitlich versetzt (weg von `avoid`). */
    function tagBetween(pp: Px, q: Px, label: string, color: string, avoid: Px): void {
      const mx = (pp[0] + q[0]) / 2;
      const my = (pp[1] + q[1]) / 2;
      const [nx, ny] = unit(-(q[1] - pp[1]), q[0] - pp[0]);
      const s = nx * (avoid[0] - mx) + ny * (avoid[1] - my) > 0 ? -1 : 1;
      // erst die bevorzugte Seite, weiter weg, dann die andere Seite – bis nichts überlappt
      const tries: [number, number][] = [
        [15, s],
        [36, s],
        [15, -s],
        [36, -s],
        [57, s],
      ];
      for (const [k, sg] of tries) {
        const x = mx + nx * k * sg;
        const y = my + ny * k * sg;
        if (!placedTags.some((r) => overlaps(r, tagRect(x, y, label)))) {
          tag(x, y, label, color);
          return;
        }
      }
      tag(mx + nx * 15 * s, my + ny * 15 * s, label, color);
    }

    /* ---------- Papier ---------- */
    function drawPaper(R: Rect, cell: number): void {
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
      g.lineWidth = 1;
      for (const major of [false, true]) {
        g.strokeStyle = major ? withAlpha(theme.grid, 0.9) : theme.gridMinor;
        g.beginPath();
        for (let k = 0; k <= GRID_W; k++) {
          if ((k % 2 === 0) !== major) continue;
          const x = Math.round(R.x + (k + 0.5) * cell) + 0.5;
          g.moveTo(x, R.y);
          g.lineTo(x, R.y + R.h);
        }
        for (let k = 0; k <= GRID_H; k++) {
          if ((k % 2 === 0) !== major) continue;
          const y = Math.round(R.y + (GRID_H - k + 0.5) * cell) + 0.5;
          g.moveTo(R.x, y);
          g.lineTo(R.x + R.w, y);
        }
        g.stroke();
      }
    }

    /** Halbebene (Pixel) auf der Seite von `toward` der Geraden durch o mit Richtung d füllen. */
    function halfPlane(o: Px, d: Px, toward: Px, color: string): void {
      const g = surface.g;
      const L2 = 4000;
      let n: Px = [-d[1], d[0]];
      if (n[0] * (toward[0] - o[0]) + n[1] * (toward[1] - o[1]) < 0) n = [-n[0], -n[1]];
      g.beginPath();
      g.moveTo(o[0] - d[0] * L2, o[1] - d[1] * L2);
      g.lineTo(o[0] + d[0] * L2, o[1] + d[1] * L2);
      g.lineTo(o[0] + d[0] * L2 + n[0] * L2, o[1] + d[1] * L2 + n[1] * L2);
      g.lineTo(o[0] - d[0] * L2 + n[0] * L2, o[1] - d[1] * L2 + n[1] * L2);
      g.closePath();
      g.fillStyle = color;
      g.fill();
    }

    function drawTrace(list: Pt[]): void {
      const g = surface.g;
      list.forEach((q, i) => {
        const [x, y] = toPx(q);
        const s = i === list.length - 1 && tracePop.running ? Math.max(0.3, tracePop.value) : 1;
        g.beginPath();
        g.arc(x, y, 4.4 * s, 0, Math.PI * 2);
        g.fillStyle = col.ok();
        g.fill();
        g.strokeStyle = ctx.theme.bg;
        g.lineWidth = 1.5;
        g.stroke();
      });
    }

    /** Name einer Geraden am Papierrand (dort, wo sie oben bzw. seitlich das Blatt verlässt). */
    function lineName(o: Px, d: Px, name: string, color: string): void {
      const { paper } = layout();
      const up: Px = d[1] < 0 ? d : [-d[0], -d[1]];
      let k = 0;
      while (k < 4000) {
        const x = o[0] + up[0] * k;
        const y = o[1] + up[1] * k;
        if (y < paper.y + 20 || x < paper.x + 18 || x > paper.x + paper.w - 18) break;
        k += 4;
      }
      const x = o[0] + up[0] * (k - 6);
      const y = o[1] + up[1] * (k - 6);
      // Beschriftung auf die Seite, auf der mehr Platz ist
      const side = x > paper.x + paper.w - 40 ? -1 : 1;
      haloText(name, x + side * 13, y + 3, `italic 700 ${F(18, 16)}px ${ctx.theme.mathFont}`, color);
    }

    /** P (groß, ziehbar) mit Leuchten, wenn gleich weit. */
    function drawP(pp: Px, eq: boolean, away: Px, label = 'P'): void {
      const g = surface.g;
      if (eq) {
        const s = eqPop.running ? Math.max(0.5, eqPop.value) : 1;
        g.beginPath();
        g.arc(pp[0], pp[1], 17 * s, 0, Math.PI * 2);
        g.fillStyle = withAlpha(col.ok(), 0.22);
        g.fill();
        g.beginPath();
        g.arc(pp[0], pp[1], 17 * s, 0, Math.PI * 2);
        g.strokeStyle = withAlpha(col.ok(), 0.6);
        g.lineWidth = 1.5;
        g.stroke();
      }
      handle(pp, 'p', eq ? col.ok() : col.p(), label, away, true);
    }

    /** Richtung für die Beschriftung von P: weg von den Strecken zu A und B. */
    function awayFrom(pp: Px, ...qs: Px[]): Px {
      let x = 0;
      let y = 0;
      for (const q of qs) {
        const [ux, uy] = unit(q[0] - pp[0], q[1] - pp[1]);
        x -= ux;
        y -= uy;
      }
      if (Math.hypot(x, y) < 0.3 && qs.length >= 1) {
        const [ux, uy] = unit(qs[0]![0] - pp[0], qs[0]![1] - pp[1]);
        return [uy, -ux];
      }
      return [x, y];
    }

    /* ---------- Modus: Mittelsenkrechte ---------- */
    /** Mittelsenkrechte von [ab] mit Mittelpunkt, rechtem Winkel und Strichmarken. */
    function drawPerpBisector(a: Pt, b: Pt, color: string, name: string | null, withM: boolean): void {
      const pa = toPx(a);
      const pb = toPx(b);
      const { m, d } = perpBisector(a, b);
      const pm = toPx(m);
      const dpx: Px = unit(d[0], -d[1]);
      const W = wide();
      fullLine(pm, [pm[0] + dpx[0], pm[1] + dpx[1]], color, 2.6);
      const toB = unit(pb[0] - pm[0], pb[1] - pm[1]);
      const up: Px = dpx[1] < 0 ? dpx : [-dpx[0], -dpx[1]];
      rightMark(pm, toB, up, col.right(), F(11, 10));
      ticks((pa[0] + pm[0]) / 2, (pa[1] + pm[1]) / 2, toB, 2, col.tick());
      ticks((pb[0] + pm[0]) / 2, (pb[1] + pm[1]) / 2, toB, 2, col.tick());
      if (name) lineName(pm, dpx, name, color);
      if (withM) {
        dot(pm, 3.2, color);
        // „M“ in den Quadranten gegenüber dem rechten Winkel
        const away: Px = [-(toB[0] + up[0]), -(toB[1] + up[1])];
        labelAt(pm, 'M', away, color, W ? 17 : 15, F(13, 12));
      }
    }

    function drawMittel(): void {
      const theme = ctx.theme;
      const a = A();
      const b = B();
      const pa = toPx(a);
      const pb = toPx(b);
      const { m, d } = perpBisector(a, b);
      const pm = toPx(m);
      const dpx: Px = unit(d[0], -d[1]);
      const eq = eqM();
      if (p.zones) {
        halfPlane(pm, dpx, pa, withAlpha(col.a(), theme.dark ? 0.11 : 0.065));
        halfPlane(pm, dpx, pb, withAlpha(col.b(), theme.dark ? 0.11 : 0.065));
      }
      if (p.line) drawPerpBisector(a, b, col.line(), 'm', true);
      segment(pa, pb, theme.text, 2.8);
      if (p.trace) drawTrace(traceM);
      // Abstände von P
      const pp = toPx(P);
      const ca = eq ? col.ok() : col.a();
      const cb = eq ? col.ok() : col.b();
      segment(pp, pa, ca, 2.4, [7, 5]);
      segment(pp, pb, cb, 2.4, [7, 5]);
      const v1 = dist(P, a);
      const v2 = dist(P, b);
      const [t1, t2] = distPair(v1, v2, eq);
      if (eq) {
        ticks((pp[0] + pa[0]) / 2, (pp[1] + pa[1]) / 2, unit(pa[0] - pp[0], pa[1] - pp[1]), 1, col.ok(), 7);
        ticks((pp[0] + pb[0]) / 2, (pp[1] + pb[1]) / 2, unit(pb[0] - pp[0], pb[1] - pp[1]), 1, col.ok(), 7);
      }
      if (v1 > 1.6) tagBetween(pp, pa, t1.replace(/^= /, ''), ca, pm);
      if (v2 > 1.6) tagBetween(pp, pb, t2.replace(/^= /, ''), cb, pm);
      handle(pa, 'a', col.a(), 'A', [pa[0] - pb[0], pa[1] - pb[1]]);
      handle(pb, 'b', col.b(), 'B', [pb[0] - pa[0], pb[1] - pa[1]]);
      drawP(pp, eq, awayFrom(pp, pa, pb));
    }

    /* ---------- Modus: Winkelhalbierende ---------- */
    function drawAngleBase(an: Angle, halves: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const s = toPx(an.s);
      const ray = (th: number) => {
        const u = dir(th);
        segment(s, toPx([an.s[0] + u[0] * 60, an.s[1] + u[1] * 60]), theme.text, 2.8);
      };
      ray(an.th1);
      ray(an.th1 + an.al);
      const r = F(36, 28);
      const a0 = -((an.th1 * Math.PI) / 180);
      const a1 = -(((an.th1 + an.al) * Math.PI) / 180);
      if (halves > 0) {
        const mid = -(((an.th1 + an.al / 2) * Math.PI) / 180);
        for (const [x0, x1] of [
          [a0, mid],
          [mid, a1],
        ] as [number, number][]) {
          g.save();
          g.globalAlpha = halves;
          g.beginPath();
          g.moveTo(s[0], s[1]);
          g.arc(s[0], s[1], r, x0, x1, true);
          g.closePath();
          g.fillStyle = withAlpha(col.tick(), theme.dark ? 0.22 : 0.15);
          g.fill();
          g.beginPath();
          g.arc(s[0], s[1], r, x0, x1, true);
          g.strokeStyle = col.tick();
          g.lineWidth = 2;
          g.stroke();
          // ein Strich als „gleich groß“-Marke
          const mm = (x0 + x1) / 2;
          g.beginPath();
          g.moveTo(s[0] + Math.cos(mm) * (r - 5), s[1] + Math.sin(mm) * (r - 5));
          g.lineTo(s[0] + Math.cos(mm) * (r + 5), s[1] + Math.sin(mm) * (r + 5));
          g.stroke();
          const lr = r + F(22, 18);
          if (an.al >= 50) {
            const lx = s[0] + Math.cos(mm) * lr;
            const ly = s[1] + Math.sin(mm) * lr;
            haloText(`${fmt.num(an.al / 2, 1)}°`, lx, ly, font(700, F(12.5, 11.5)), col.tick());
            placedTags.push({ x: lx - 18, y: ly - 9, w: 36, h: 18 });
          }
          g.restore();
        }
        if (an.al < 50) {
          // zu eng für zwei Zahlen: eine Beschriftung außerhalb, neben dem ersten Schenkel
          const a = a0 + 0.3;
          g.save();
          g.globalAlpha = halves;
          haloText(tr('halfEach', { h: fmt.num(an.al / 2, 1) }), s[0] + Math.cos(a) * (r + F(30, 26)), s[1] + Math.sin(a) * (r + F(30, 26)), font(700, F(12.5, 11.5)), col.tick());
          g.restore();
        }
      } else {
        g.beginPath();
        g.moveTo(s[0], s[1]);
        g.arc(s[0], s[1], r, a0, a1, true);
        g.closePath();
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.12 : 0.07);
        g.fill();
        g.beginPath();
        g.arc(s[0], s[1], r, a0, a1, true);
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 1.8;
        g.stroke();
        const mm = (a0 + a1) / 2;
        const lr = r + F(28, 24);
        haloText(`α = ${p.al}°`, s[0] + Math.cos(mm) * lr, s[1] + Math.sin(mm) * lr, `italic 700 ${F(13, 12)}px ${theme.mathFont}`, theme.text);
      }
      // Namen A und B an den Schenkeln, S am Scheitel
      const nameAt = (th: number, nm: string, sgn: number) => {
        const q = toPx(armPoint(th));
        const t = (th * Math.PI) / 180;
        const n: Px = [-Math.sin(t) * sgn, -Math.cos(t) * sgn];
        haloText(nm, q[0] + n[0] * 17, q[1] + n[1] * 17, font(800, F(15, 13)), theme.text);
      };
      nameAt(an.th1, 'A', -1);
      nameAt(an.th1 + an.al, 'B', 1);
      const back = dir(bisectorDir(an) + 180);
      haloText('S', s[0] + back[0] * 18, s[1] - back[1] * 18, font(800, F(15, 13)), theme.text);
    }

    function drawWinkel(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const an = angle();
      const s = toPx(an.s);
      if (p.zones) {
        const R2 = 4000;
        const half = (thA: number, thB: number, color: string) => {
          g.beginPath();
          g.moveTo(s[0], s[1]);
          g.arc(s[0], s[1], R2, -((thA * Math.PI) / 180), -((thB * Math.PI) / 180), true);
          g.closePath();
          g.fillStyle = color;
          g.fill();
        };
        half(an.th1, an.th1 + an.al / 2, withAlpha(col.a(), theme.dark ? 0.12 : 0.07));
        half(an.th1 + an.al / 2, an.th1 + an.al, withAlpha(col.b(), theme.dark ? 0.12 : 0.07));
      }
      if (p.line) {
        const u = dir(bisectorDir(an));
        const far = toPx([an.s[0] + u[0] * 60, an.s[1] + u[1] * 60]);
        segment(s, far, col.line(), 2.6);
      }
      drawAngleBase(an, p.line ? 1 : 0);
      if (p.line) {
        const u = dir(bisectorDir(an));
        lineName(toPx([an.s[0] + u[0] * 3, an.s[1] + u[1] * 3]), unit(u[0], -u[1]), 'w', col.line());
      }
      if (p.trace) drawTrace(traceW);
      // Lote von P auf die Schenkel
      const [d1, d2] = armDistances(PW, an);
      const eq = eqW();
      const pp = toPx(PW);
      const dec = decimalsToTell(d1 / 2, d2 / 2, eq);
      const feet: [number, number, string][] = [
        [an.th1, d1, eq ? col.ok() : col.a()],
        [an.th1 + an.al, d2, eq ? col.ok() : col.b()],
      ];
      for (const [th, dd, c] of feet) {
        if (dd < 0.05) continue;
        // nächster Punkt des Schenkels: Lotfußpunkt oder (dahinter) der Scheitel S
        const f = footOnRay(PW, an.s, dir(th));
        const pf = toPx(f);
        const atS = dist(f, an.s) < 1e-9;
        segment(pp, pf, c, 2.4, [7, 5]);
        if (!atS) {
          rightMark(pf, unit(s[0] - pf[0], s[1] - pf[1]), unit(pp[0] - pf[0], pp[1] - pf[1]), c, F(10, 9));
          dot(pf, 3, c);
        }
        if (eq) ticks((pp[0] + pf[0]) / 2, (pp[1] + pf[1]) / 2, unit(pf[0] - pp[0], pf[1] - pp[1]), 1, col.ok(), 7);
        if (dd > 1.6) tagBetween(pp, pf, cmText(dd, false, dec), c, s);
      }
      // Griffe
      handle(s, 's', theme.text, null);
      for (const which of [1, 2] as const) handle(toPx(armPoint(which === 1 ? an.th1 : an.th1 + an.al)), `arm${which}`, theme.text, null);
      drawP(pp, eq, [pp[0] - s[0], pp[1] - s[1]]);
    }

    /* ---------- Modus: Konstruktion ---------- */
    /** Spitz zulaufender Metallschenkel von a nach b. */
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
      const { cell } = layout();
      const pin = toPx(c.pin);
      const t = (c.ang * Math.PI) / 180;
      const rpx = Math.max(6, c.r * cell);
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
      // Schatten auf dem Papier
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
      // Nadel
      segment(needleTop, pin, steel, 1.8);
      // Schenkel
      leg(hinge, needleTop, 8, 4.5, metalL, metalD);
      leg(hinge, penTop, 8, 5, metalL, metalD);
      // Klemme und Bleistiftmine
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
      // Griff mit Riffelung
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
      // Gelenk
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
      const { cell } = layout();
      const a = toPx(r.a);
      const b = toPx(r.b);
      const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
      // Körper auf der Seite rechts bzw. unterhalb der Linie
      let nx = -uy;
      let ny = ux;
      if (ny < 0 || (Math.abs(ny) < 1e-6 && nx < 0)) {
        nx = -nx;
        ny = -ny;
      }
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const cm = 2 * cell;
      const wR = Math.max(26, 2.1 * cell);
      const off = r.slide * 50;
      const start = -1.2 * cm;
      const total = len + 2.4 * cm;
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
      // Skala: Millimeter (wenn genug Platz), halbe und ganze Zentimeter
      const mmPx = cm / 10;
      const step = mmPx >= 3.5 ? 1 : 5;
      g.strokeStyle = withAlpha(theme.text, 0.75);
      g.beginPath();
      for (let k = 0; (k * mmPx) <= total - 0.6 * cm; k += step) {
        const l = k % 10 === 0 ? 0.36 : k % 5 === 0 ? 0.24 : 0.14;
        const [x0, y0] = P0(0.2 * cm + k * mmPx, 0);
        const [x1, y1] = P0(0.2 * cm + k * mmPx, wR * l);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.lineWidth = 1;
      g.stroke();
      let ang = Math.atan2(uy, ux);
      if (ang > Math.PI / 2) ang -= Math.PI;
      if (ang < -Math.PI / 2) ang += Math.PI;
      const f = font(600, F(10.5, 9.5));
      for (let k = 0; k * cm <= total - 0.6 * cm; k++) {
        const [x, y] = P0(0.2 * cm + k * cm, wR * 0.62);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        text(g, String(k), 0, 0, { font: f, color: withAlpha(theme.text, 0.8) });
        g.restore();
      }
      g.restore();
    }

    /** Bleistift (von Hand gehalten) mit der Spitze bei tip. */
    function drawPencil(tip: Px, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const d: Px = [Math.cos(-1.0), Math.sin(-1.0)];
      const n: Px = [-d[1], d[0]];
      const at = (k: number): Px => [tip[0] + d[0] * k, tip[1] + d[1] * k];
      const w = 4.5;
      g.save();
      g.globalAlpha = alpha;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 5;
      g.shadowOffsetY = 6;
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
      body(16, 74, w, w, theme.dark ? '#e0ac52' : '#f0a92e');
      g.restore();
      body(0, 5, 0.2, 1.4, col.pencil());
      body(5, 16, 1.4, w, theme.dark ? '#f1dcb2' : '#f2d7a6');
      body(16, 74, w * 0.35, w * 0.35, withAlpha('#ffffff', 0.25));
      body(74, 80, w, w, theme.dark ? '#b8c1cd' : '#9aa4b1');
      body(80, 88, w, w, theme.dark ? '#f08fae' : '#ee7f9f');
      g.restore();
    }

    function drawKonstr(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const st = constrState();
      const isM = what() === 'mittel';
      const pencil = col.pencil();
      // Grundfigur
      if (isM) segment(toPx(A()), toPx(B()), theme.text, 2.8);
      else drawAngleBase(angle(), st.finish);
      // Abschluss (unter den Bögen): Raute bzw. Drachenviereck gestrichelt
      if (st.finish > 0) {
        g.save();
        g.globalAlpha = st.finish;
        if (isM) {
          const c = bisectorConstruction();
          const q = [A(), c.s1, B(), c.s2].map(toPx);
          for (let i = 0; i < 4; i++) {
            const a = q[i]!;
            const b = q[(i + 1) % 4]!;
            segment(a, b, withAlpha(col.tick(), 0.85), 1.6, [5, 4]);
            ticks((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, unit(b[0] - a[0], b[1] - a[1]), 1, col.tick(), 5);
          }
        } else {
          const an = angle();
          const c = angleConstruction();
          const q = [an.s, c.p1, c.w, c.p2].map(toPx);
          for (let i = 0; i < 4; i++) {
            const a = q[i]!;
            const b = q[(i + 1) % 4]!;
            segment(a, b, withAlpha(col.tick(), 0.85), 1.6, [5, 4]);
            ticks((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, unit(b[0] - a[0], b[1] - a[1]), i === 0 || i === 3 ? 1 : 2, col.tick(), 5);
          }
        }
        g.restore();
      }
      // Bögen (Bleistift)
      for (const a of st.arcs) {
        const c = toPx(a.c);
        const rpx = a.r * layout().cell;
        g.save();
        g.strokeStyle = pencil;
        g.lineWidth = 1.7;
        g.globalAlpha = 0.9;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(c[0], c[1], rpx, -((a.a0 * Math.PI) / 180), -((a.a1 * Math.PI) / 180), a.a1 > a.a0);
        g.stroke();
        g.restore();
      }
      // Radius beim Aufziehen des Zirkels
      if (st.radius) {
        const c = toPx(st.radius.c);
        const u = dir(st.radius.ang);
        const e = toPx([st.radius.c[0] + u[0] * st.radius.r, st.radius.c[1] + u[1] * st.radius.r]);
        g.save();
        g.globalAlpha = st.radius.alpha;
        segment(c, e, col.tick(), 2, [5, 4]);
        const [nx, ny] = unit(-(e[1] - c[1]), e[0] - c[0]);
        haloText('r', (c[0] + e[0]) / 2 + nx * 12, (c[1] + e[1]) / 2 + ny * 12, `italic 700 ${F(15, 13)}px ${theme.mathFont}`, col.tick());
        g.restore();
      }
      // Linie m bzw. w
      let tip: Px | null = null;
      if (st.line) {
        const a = toPx(st.line.a);
        const b = toPx(st.line.b);
        const e: Px = [a[0] + (b[0] - a[0]) * st.line.t, a[1] + (b[1] - a[1]) * st.line.t];
        segment(a, e, col.line(), 2.8);
        tip = e;
        if (st.line.t >= 1) lineName(a, unit(b[0] - a[0], b[1] - a[1]), isM ? 'm' : 'w', col.line());
      }
      // Abschluss: rechter Winkel und gleich lange Hälften
      if (isM && st.finish > 0) {
        const pa = toPx(A());
        const pb = toPx(B());
        const c = bisectorConstruction();
        const pm = toPx(c.m);
        const ps = toPx(c.s1);
        g.save();
        g.globalAlpha = st.finish;
        const toB = unit(pb[0] - pm[0], pb[1] - pm[1]);
        rightMark(pm, toB, unit(ps[0] - pm[0], ps[1] - pm[1]), col.right(), F(12, 10));
        ticks((pa[0] + pm[0]) / 2, (pa[1] + pm[1]) / 2, toB, 2, col.tick());
        ticks((pb[0] + pm[0]) / 2, (pb[1] + pm[1]) / 2, toB, 2, col.tick());
        g.restore();
      }
      // markierte Punkte (Kreuze)
      for (const q of st.points) {
        if (q.pop <= 0) continue;
        const [x, y] = toPx(q.p);
        const s = ease.outBack(q.pop);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.strokeStyle = col.line();
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(-5, -5);
        g.lineTo(5, 5);
        g.moveTo(5, -5);
        g.lineTo(-5, 5);
        g.stroke();
        g.restore();
        g.save();
        g.globalAlpha = Math.min(1, q.pop * 1.5);
        haloText(q.label, x + 9, y - 13, font(800, F(14, 12.5)), col.line(), 'left');
        g.restore();
      }
      // Punkte A, B bzw. Griffe des Winkels
      if (isM) {
        const pa = toPx(A());
        const pb = toPx(B());
        handle(pa, 'a', theme.text, 'A', [pa[0] - pb[0], pa[1] - pb[1]]);
        handle(pb, 'b', theme.text, 'B', [pb[0] - pa[0], pb[1] - pa[1]]);
      } else {
        const an = angle();
        handle(toPx(an.s), 's', theme.text, null);
        for (const which of [1, 2] as const) handle(toPx(armPoint(which === 1 ? an.th1 : an.th1 + an.al)), `arm${which}`, theme.text, null);
      }
      if (st.ruler) drawRuler(st.ruler);
      // Werkzeuge erst nach dem Papier (dürfen über den Rand ragen)
      const compass = st.compass;
      const pencilA = st.pencil;
      toolsLater = () => {
        if (tip && pencilA > 0) drawPencil(tip, pencilA);
        if (compass) drawCompass(compass);
      };
    }
    let toolsLater: (() => void) | null = null;

    /* ---------- Modus: Anwendung (Straße und Häuser) ---------- */
    function drawHouse(q: Px, size: number, color: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const w = size;
      const h = size * 0.72;
      const x = q[0] - w / 2;
      const y = q[1] - h / 2 + size * 0.12;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? '#1b2431' : '#ffffff';
      g.fillRect(x, y, w, h);
      g.restore();
      g.fillStyle = withAlpha(color, theme.dark ? 0.28 : 0.16);
      g.fillRect(x, y, w, h);
      g.strokeStyle = color;
      g.lineWidth = 1.6;
      g.lineJoin = 'round';
      g.strokeRect(x, y, w, h);
      // Dach
      g.beginPath();
      g.moveTo(x - w * 0.14, y + 0.5);
      g.lineTo(q[0], y - size * 0.5);
      g.lineTo(x + w * 1.14, y + 0.5);
      g.closePath();
      g.fillStyle = color;
      g.fill();
      // Tür
      g.fillStyle = withAlpha(color, 0.75);
      g.fillRect(q[0] - w * 0.12, y + h * 0.42, w * 0.24, h * 0.58);
    }

    function drawSwing(q: Px, size: number, color: string): void {
      const g = surface.g;
      const s = size;
      g.save();
      g.strokeStyle = color;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.lineWidth = Math.max(1.6, s * 0.09);
      g.beginPath();
      g.moveTo(q[0] - s * 0.55, q[1] + s * 0.5);
      g.lineTo(q[0] - s * 0.38, q[1] - s * 0.45);
      g.lineTo(q[0] - s * 0.21, q[1] + s * 0.5);
      g.moveTo(q[0] + s * 0.55, q[1] + s * 0.5);
      g.lineTo(q[0] + s * 0.38, q[1] - s * 0.45);
      g.lineTo(q[0] + s * 0.21, q[1] + s * 0.5);
      g.moveTo(q[0] - s * 0.38, q[1] - s * 0.45);
      g.lineTo(q[0] + s * 0.38, q[1] - s * 0.45);
      g.stroke();
      g.lineWidth = Math.max(1, s * 0.05);
      g.beginPath();
      g.moveTo(q[0] - s * 0.12, q[1] - s * 0.45);
      g.lineTo(q[0] - s * 0.12, q[1] + s * 0.18);
      g.moveTo(q[0] + s * 0.12, q[1] - s * 0.45);
      g.lineTo(q[0] + s * 0.12, q[1] + s * 0.18);
      g.stroke();
      g.lineWidth = Math.max(2, s * 0.1);
      g.beginPath();
      g.moveTo(q[0] - s * 0.18, q[1] + s * 0.2);
      g.lineTo(q[0] + s * 0.18, q[1] + s * 0.2);
      g.stroke();
      g.restore();
    }

    function drawRoad(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { cell } = layout();
      const [e0, e1] = extendToPaper(G(), H(), -1);
      const a = toPx(e0);
      const b = toPx(e1);
      const w = Math.max(14, cell * 1.15);
      g.save();
      g.lineCap = 'butt';
      segment(a, b, theme.dark ? '#3a4556' : '#bcc3cd', w + 4);
      segment(a, b, theme.dark ? '#2a3341' : '#d9dde3', w);
      segment(a, b, theme.dark ? '#8794a6' : '#ffffff', 1.8, [12, 9]);
      g.restore();
    }

    function drawAnw(): void {
      const theme = ctx.theme;
      const { cell } = layout();
      const a = A();
      const b = B();
      const pa = toPx(a);
      const pb = toPx(b);
      const { m, d } = perpBisector(a, b);
      const pm = toPx(m);
      const dpx: Px = unit(d[0], -d[1]);
      if (p.zones) {
        halfPlane(pm, dpx, pa, withAlpha(col.a(), theme.dark ? 0.1 : 0.06));
        halfPlane(pm, dpx, pb, withAlpha(col.b(), theme.dark ? 0.1 : 0.06));
      }
      drawRoad();
      const mt = meetingPoint(a, b, G(), H());
      if (p.line) {
        fullLine(pm, [pm[0] + dpx[0], pm[1] + dpx[1]], col.line(), 2.4);
        lineName(pm, dpx, 'm', col.line());
        segment(pa, pb, withAlpha(theme.text, 0.35), 1.4, [4, 4]);
        const toB = unit(pb[0] - pm[0], pb[1] - pm[1]);
        rightMark(pm, toB, dpx[1] < 0 ? dpx : [-dpx[0], -dpx[1]], col.right(), F(10, 9));
        dot(pm, 2.6, col.line());
        if (mt.kind === 'point') {
          const pt = toPx(mt.t);
          surface.g.beginPath();
          surface.g.arc(pt[0], pt[1], 8, 0, Math.PI * 2);
          surface.g.strokeStyle = col.line();
          surface.g.lineWidth = 2.2;
          surface.g.stroke();
          labelAt(pt, 'T', [dpx[0] + 0.8, dpx[1] - 0.8], col.line(), 19, F(14, 12.5));
        }
      }
      // Wege von P zu den Häusern
      const q = roadP();
      const pp = toPx(q);
      const eq = eqR();
      const ca = eq ? col.ok() : col.a();
      const cb = eq ? col.ok() : col.b();
      segment(pp, pa, ca, 2.4, [7, 5]);
      segment(pp, pb, cb, 2.4, [7, 5]);
      const v1 = dist(q, a);
      const v2 = dist(q, b);
      const [t1, t2] = distPair(v1, v2, eq);
      if (eq) {
        ticks((pp[0] + pa[0]) / 2, (pp[1] + pa[1]) / 2, unit(pa[0] - pp[0], pa[1] - pp[1]), 1, col.ok(), 7);
        ticks((pp[0] + pb[0]) / 2, (pp[1] + pb[1]) / 2, unit(pb[0] - pp[0], pb[1] - pp[1]), 1, col.ok(), 7);
      }
      if (v1 > 2) tagBetween(pp, pa, t1.replace(/^= /, ''), ca, pm);
      if (v2 > 2) tagBetween(pp, pb, t2.replace(/^= /, ''), cb, pm);
      // Griffe der Straße
      for (const [id, pt] of [
        ['g', G()],
        ['h', H()],
      ] as const) {
        const z = toPx(pt);
        const active = hover === id || (drag?.kind === 'pt' && drag.id === id);
        const g = surface.g;
        if (!ctx.locked) {
          g.beginPath();
          g.arc(z[0], z[1], active ? 14 : 11, 0, Math.PI * 2);
          g.fillStyle = withAlpha(theme.text, active ? 0.22 : 0.1);
          g.fill();
        }
        g.save();
        g.translate(z[0], z[1]);
        g.rotate(Math.PI / 4);
        g.fillStyle = theme.bg;
        g.fillRect(-4.5, -4.5, 9, 9);
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        g.strokeRect(-4.5, -4.5, 9, 9);
        g.restore();
        const r = road();
        const n: Px = [-r.u[1], -r.u[0]];
        labelAt(z, id.toUpperCase(), n, theme.muted, 18, F(13, 12));
      }
      // Häuser
      const hs = clamp(cell * 1.5, 18, 34);
      const houseHandle = (id: 'a' | 'b', z: Px, color: string, away: Px) => {
        const g = surface.g;
        const active = hover === id || (drag?.kind === 'pt' && drag.id === id);
        if (!ctx.locked) {
          g.beginPath();
          g.arc(z[0], z[1], hs * 0.95 + (active ? 3 : 0), 0, Math.PI * 2);
          g.fillStyle = withAlpha(color, active ? 0.24 : 0.12);
          g.fill();
        }
        drawHouse(z, hs, color);
        labelAt(z, id.toUpperCase(), away, color, hs * 0.75 + 12);
      };
      houseHandle('a', pa, col.a(), [pa[0] - pb[0], pa[1] - pb[1] - 0.001]);
      houseHandle('b', pb, col.b(), [pb[0] - pa[0], pb[1] - pa[1] - 0.001]);
      // P bzw. Spielplatz
      if (eq) {
        const s = eqPop.running ? Math.max(0.4, eqPop.value) : 1;
        const g = surface.g;
        g.save();
        g.translate(pp[0], pp[1]);
        g.scale(s, s);
        g.beginPath();
        g.arc(0, 0, hs * 0.9, 0, Math.PI * 2);
        g.fillStyle = withAlpha(col.ok(), 0.22);
        g.fill();
        g.strokeStyle = col.ok();
        g.lineWidth = 1.6;
        g.stroke();
        drawSwing([0, 0], hs * 0.95, col.ok());
        g.restore();
        if (!ctx.locked) hits.push({ id: 'p', r: { x: pp[0] - 14, y: pp[1] - 14, w: 28, h: 28 } });
        labelAt(pp, 'T', awayFrom(pp, pa, pb), col.ok(), hs * 0.9 + 10);
      } else drawP(pp, false, awayFrom(pp, pa, pb));
    }

    /* ---------- Modus: Umkreis ---------- */
    function drawUmk(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pts = [A(), B(), C()];
      const px = pts.map(toPx);
      const u = collinear(pts[0]!, pts[1]!, pts[2]!) ? null : circumcenter(pts[0]!, pts[1]!, pts[2]!);
      const colors = [col.a(), col.b(), col.c()];
      g.save();
      g.beginPath();
      px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.08 : 0.05);
      g.fill();
      g.restore();
      // Mittelsenkrechten der Seiten (Farbe wie die Seite gegenüber der jeweiligen Ecke)
      if (p.line) {
        const sides: [number, number][] = [
          [0, 1],
          [1, 2],
          [2, 0],
        ];
        sides.forEach(([i, j], k) => {
          const { m, d } = perpBisector(pts[i]!, pts[j]!);
          const pm = toPx(m);
          const dpx: Px = unit(d[0], -d[1]);
          fullLine(pm, [pm[0] + dpx[0], pm[1] + dpx[1]], withAlpha(colors[k]!, 0.85), 2);
          const toJ = unit(px[j]![0] - pm[0], px[j]![1] - pm[1]);
          // rechter Winkel auf der Innenseite des Dreiecks
          const third = px[3 - i - j]!;
          const inn: Px = dpx[0] * (third[0] - pm[0]) + dpx[1] * (third[1] - pm[1]) >= 0 ? dpx : [-dpx[0], -dpx[1]];
          rightMark(pm, toJ, inn, colors[k]!, F(10, 9));
          dot(pm, 2.8, colors[k]!);
        });
      }
      if (u && (p.line || p.circ)) {
        const pu = toPx(u);
        const r = dist(u, pts[0]!) * layout().cell;
        if (p.circ) {
          g.beginPath();
          g.arc(pu[0], pu[1], r, 0, Math.PI * 2);
          g.strokeStyle = col.line();
          g.lineWidth = 2.6;
          g.stroke();
        }
        px.forEach((q) => {
          segment(pu, q, withAlpha(col.line(), 0.8), 1.8, [6, 5]);
          const [ux, uy] = unit(q[0] - pu[0], q[1] - pu[1]);
          ticks((pu[0] + q[0]) / 2, (pu[1] + q[1]) / 2, [ux, uy], 1, col.tick());
        });
      }
      // Seiten
      g.save();
      g.beginPath();
      px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.strokeStyle = theme.text;
      g.lineWidth = 2.6;
      g.lineJoin = 'round';
      g.stroke();
      g.restore();
      if (u && (p.line || p.circ)) {
        const pu = toPx(u);
        g.beginPath();
        g.arc(pu[0], pu[1], 6.5, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.strokeStyle = col.line();
        g.lineWidth = 2.6;
        g.stroke();
        dot(pu, 2.6, col.line());
        const { paper } = layout();
        const inset = 16;
        const inside = pu[0] > paper.x + 4 && pu[0] < paper.x + paper.w - 4 && pu[1] > paper.y + 4 && pu[1] < paper.y + paper.h - 4;
        if (inside) labelAt(pu, 'U', awayFrom(pu, ...px), col.line(), 17, F(15, 13));
        else {
          // U liegt außerhalb des Blattes: Pfeil am Rand in Richtung U
          const q: Px = [clamp(pu[0], paper.x + inset, paper.x + paper.w - inset), clamp(pu[1], paper.y + inset, paper.y + paper.h - inset)];
          const d = unit(pu[0] - q[0], pu[1] - q[1]);
          const tipP: Px = [q[0] + d[0] * 9, q[1] + d[1] * 9];
          segment([q[0] - d[0] * 7, q[1] - d[1] * 7], tipP, col.line(), 2.6);
          g.beginPath();
          g.moveTo(tipP[0] + d[0] * 3, tipP[1] + d[1] * 3);
          g.lineTo(tipP[0] - d[0] * 6 - d[1] * 6, tipP[1] - d[1] * 6 + d[0] * 6);
          g.lineTo(tipP[0] - d[0] * 6 + d[1] * 6, tipP[1] - d[1] * 6 - d[0] * 6);
          g.closePath();
          g.fillStyle = col.line();
          g.fill();
          haloText('U', q[0] - d[0] * 20 + d[1] * 14, q[1] - d[1] * 20 - d[0] * 14, font(800, F(15, 13)), col.line());
        }
      }
      const cx = px.reduce((s, q) => s + q[0], 0) / 3;
      const cy = px.reduce((s, q) => s + q[1], 0) / 3;
      (['a', 'b', 'c'] as const).forEach((id, i) => handle(px[i]!, id, theme.text, id.toUpperCase(), [px[i]![0] - cx, px[i]![1] - cy]));
    }

    /* ---------- Karten ---------- */
    interface CardSpec {
      h: number;
      draw: (r: Rect) => void;
      grow?: boolean;
    }
    type CardOpt = CardSpec | CardSpec[] | null;

    /** Karten untereinander, solange sie passen; die letzte wachsende Karte füllt den Rest. */
    function stack(R: Rect, makers: ((w: number) => CardOpt)[], gap: number): void {
      const placed: { c: CardSpec; h: number }[] = [];
      let used = 0;
      for (const make of makers) {
        const opt = make(R.w);
        if (!opt) continue;
        for (const c of Array.isArray(opt) ? opt : [opt]) {
          if (c.h <= 0) continue;
          const need = used + (placed.length ? gap : 0) + c.h;
          if (need <= R.h + 0.5) {
            placed.push({ c, h: c.h });
            used = need;
            break;
          }
        }
      }
      const gi = placed.map((x) => !!x.c.grow).lastIndexOf(true);
      if (gi >= 0) placed[gi]!.h += Math.max(0, R.h - used);
      let y = R.y;
      for (const { c, h } of placed) {
        c.draw({ x: R.x, y, w: R.w, h });
        y += h + gap;
      }
    }

    function popScale(eq: boolean): number {
      return eq && eqPop.running ? Math.max(0.6, eqPop.value) : 1;
    }

    function distSpec(w: number, grow = false, tight = false): CardSpec {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const m = mode();
      let v1: number;
      let v2: number;
      let eq: boolean;
      let verdict: string;
      let n1 = ctx.lang === 'de' ? '|PA|' : 'PA';
      let n2 = ctx.lang === 'de' ? '|PB|' : 'PB';
      let head = ctx.t('distT');
      if (m === 'winkel') {
        [v1, v2] = armDistances(PW, angle());
        eq = eqW();
        verdict = ctx.t(eq ? 'equal12' : v1 < v2 ? 'closer1' : 'closer2');
        n1 = ctx.lang === 'de' ? '[SA' : 'SA';
        n2 = ctx.lang === 'de' ? '[SB' : 'SB';
        head = ctx.t('armT');
      } else {
        const q = m === 'anw' ? roadP() : P;
        v1 = dist(q, A());
        v2 = dist(q, B());
        eq = m === 'anw' ? eqR() : eqM();
        verdict = eq ? ctx.t(m === 'anw' ? 'foundT' : 'equalAB') : ctx.t(v1 < v2 ? 'closerA' : 'closerB');
      }
      const hf = font(700, F(12, 11));
      const vf = font(700, F(13, 12));
      g.font = hf;
      const hw = g.measureText(head).width;
      g.font = vf;
      const vw = g.measureText(verdict).width;
      const inHead = hw + vw + 24 <= w - 2 * pad;
      const vRows = inHead ? [] : wrap(verdict, w - 2 * pad, vf);
      const rowH = tight ? 19 : F(25, 22);
      const top = tight ? 25 : F(30, 27);
      const h = top + 2 * rowH + (vRows.length ? 2 + vRows.length * 16 : 0) + (tight ? 4 : F(8, 6));
      const [s1, s2] = distPair(v1, v2, eq);
      return {
        h,
        grow,
        draw(R) {
          card(R, eq ? col.ok() : undefined, eq ? 0.07 : 0);
          title(R.x + pad, R.y + 16, head, theme.muted, inHead ? R.w - 2 * pad - vw - 16 : R.w - 2 * pad);
          const sc = popScale(eq);
          const vColor = eq ? col.ok() : theme.text;
          if (inHead) {
            g.save();
            g.translate(R.x + R.w - pad, R.y + 16);
            g.scale(sc, sc);
            text(g, verdict, 0, 0, { font: vf, color: vColor, align: 'right' });
            g.restore();
          }
          const extra = Math.max(0, R.h - h);
          let y = R.y + top + extra / 2;
          g.font = font(700, F(13, 12));
          const nameW = Math.max(g.measureText(n1).width, g.measureText(n2).width) + 12;
          g.font = font(600, F(12.5, 12));
          const valW = Math.max(g.measureText(s1).width, g.measureText(s2).width, F(64, 58)) + 10;
          const barW = R.w - 2 * pad - nameW - valW;
          const maxV = Math.max(v1, v2, 1) * 1.04;
          (
            [
              [n1, v1, s1, eq ? col.ok() : col.a()],
              [n2, v2, s2, eq ? col.ok() : col.b()],
            ] as [string, number, string, string][]
          ).forEach(([nm, v, s, c]) => {
            const bh = tight ? 8 : F(12, 10);
            const yy = y + rowH / 2;
            text(g, nm, R.x + pad, yy, { font: font(700, F(13, 12)), color: c, align: 'left' });
            const x0 = R.x + pad + nameW;
            g.fillStyle = withAlpha(theme.text, theme.dark ? 0.1 : 0.07);
            roundRect(g, x0, yy - bh / 2, barW, bh, bh / 2);
            g.fill();
            g.fillStyle = c;
            roundRect(g, x0, yy - bh / 2, Math.max(bh, (v / maxV) * barW), bh, bh / 2);
            g.fill();
            text(g, s, R.x + R.w - pad, yy, { font: font(600, F(12.5, 12)), color: theme.text, align: 'right' });
            y += rowH;
          });
          if (vRows.length) {
            g.save();
            g.translate(R.x + pad, y + 2);
            g.scale(sc, sc);
            textRows(vRows, 0, 8, 16, vf, vColor);
            g.restore();
          }
        },
      };
    }

    function traceSpec(w: number, withHint: boolean): CardSpec {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const isM = mode() === 'mittel';
      const list = isM ? traceM : traceW;
      const key = list.length >= 3 ? (p.line ? (isM ? 'traceLineM' : 'traceLineW') : 'traceGuess') : isM ? 'traceHintM' : 'traceHintW';
      const f = font(500, F(12, 11.5));
      const lh = F(16, 15);
      const rows = withHint ? wrap(ctx.t(key), w - 2 * pad, f) : [];
      const h = F(30, 27) + rows.length * lh + (rows.length ? 4 : 0) + 6;
      return {
        h,
        draw(R) {
          card(R);
          // Zähler als Plakette rechts oben
          const label = list.length === 0 ? ctx.t('trace0') : list.length === 1 ? ctx.t('trace1') : tr('traceN', { n: list.length });
          const pf = font(700, F(12, 11));
          g.font = pf;
          const pw = g.measureText(label).width + 26;
          const ph = 20;
          const px = R.x + R.w - pad - pw;
          const py = R.y + 6;
          const on = list.length > 0;
          g.fillStyle = on ? withAlpha(col.ok(), theme.dark ? 0.2 : 0.12) : withAlpha(theme.text, 0.06);
          roundRect(g, px, py, pw, ph, ph / 2);
          g.fill();
          const sc = tracePop.running && on ? Math.max(0.5, tracePop.value) : 1;
          g.save();
          g.translate(px + 11, py + ph / 2);
          g.scale(sc, sc);
          dot([0, 0], 4.2, on ? col.ok() : withAlpha(theme.text, 0.3));
          g.restore();
          text(g, label, px + 19, py + ph / 2 + 0.5, { font: pf, color: on ? theme.text : theme.muted, align: 'left' });
          title(R.x + pad, R.y + 16, ctx.t('traceT'), theme.muted, px - R.x - pad - 8);
          textRows(rows, R.x + pad, R.y + F(30, 27) + lh / 2, lh, f, list.length >= 3 ? theme.text : theme.muted);
        },
      };
    }

    function textSpec(w: number, head: string, body: string, accent?: string, grow = false): CardSpec {
      const pad = F(14, 12);
      const f = font(500, F(12.5, 12));
      const lh = F(17, 16);
      const rows = wrap(body, w - 2 * pad, f);
      const h = F(31, 28) + rows.length * lh + F(9, 7);
      return {
        h,
        grow,
        draw(R) {
          card(R, accent, accent ? 0.04 : 0);
          title(R.x + pad, R.y + 16, head, accent ?? ctx.theme.muted, R.w - 2 * pad);
          textRows(rows, R.x + pad, R.y + F(31, 28) + lh / 2, lh, f, ctx.theme.text);
        },
      };
    }

    /** Anwendungskarte mit kleiner Zeichnung (wächst mit). */
    function illusSpec(w: number, kind: 'm' | 'w'): CardSpec[] {
      const pad = F(14, 12);
      const make = (body: string, minIll: number): CardSpec => {
        const f = font(500, F(12.5, 12));
        const lh = F(17, 16);
        const rows = wrap(body, w - 2 * pad, f);
        const top = F(31, 28);
        const h = top + rows.length * lh + 6 + minIll + 10;
        return {
          h,
          grow: true,
          draw(R) {
            card(R);
            title(R.x + pad, R.y + 16, ctx.t('useT'), ctx.theme.muted, R.w - 2 * pad);
            textRows(rows, R.x + pad, R.y + top + lh / 2, lh, f, ctx.theme.text);
            const iy = R.y + top + rows.length * lh + 6;
            const ih = R.y + R.h - 10 - iy;
            const iw = Math.min(R.w - 2 * pad, ih * 2.6);
            const box = { x: R.x + (R.w - iw) / 2, y: iy, w: iw, h: ih };
            if (kind === 'm') illusM(box);
            else illusW(box);
          },
        };
      };
      return [make(ctx.t(kind === 'm' ? 'useM' : 'useW'), 70), make(ctx.t(kind === 'm' ? 'useMShort' : 'useWShort'), 56)];
    }

    /** Spielplatz zwischen zwei Häusern auf der Mittelsenkrechten. */
    function illusM(R: Rect): void {
      const theme = ctx.theme;
      const s = clamp(Math.min(R.h * 0.34, R.w * 0.13), 14, 30);
      const ground = R.y + R.h - 4;
      const ha: Px = [R.x + R.w * 0.14, ground - s * 0.55];
      const hb: Px = [R.x + R.w * 0.86, ground - s * 0.55];
      const mx = (ha[0] + hb[0]) / 2;
      const sp: Px = [mx, R.y + Math.max(s * 0.6, R.h * 0.28)];
      segment([R.x + 4, ground], [R.x + R.w - 4, ground], withAlpha(theme.text, 0.25), 1.4);
      segment([mx, R.y + 2], [mx, ground], col.line(), 2, [6, 4]);
      segment(sp, ha, col.a(), 1.8, [5, 4]);
      segment(sp, hb, col.b(), 1.8, [5, 4]);
      ticks((sp[0] + ha[0]) / 2, (sp[1] + ha[1]) / 2, unit(ha[0] - sp[0], ha[1] - sp[1]), 1, col.ok(), 5);
      ticks((sp[0] + hb[0]) / 2, (sp[1] + hb[1]) / 2, unit(hb[0] - sp[0], hb[1] - sp[1]), 1, col.ok(), 5);
      drawHouse(ha, s, col.a());
      drawHouse(hb, s, col.b());
      surface.g.beginPath();
      surface.g.arc(sp[0], sp[1], s * 0.62, 0, Math.PI * 2);
      surface.g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      surface.g.fill();
      surface.g.strokeStyle = withAlpha(col.ok(), 0.6);
      surface.g.lineWidth = 1.4;
      surface.g.stroke();
      drawSwing(sp, s * 0.75, col.ok());
      haloText('m', mx + 9, R.y + 9, `italic 700 ${F(14, 13)}px ${theme.mathFont}`, col.line(), 'left');
    }

    /** Brunnen zwischen zwei Straßen auf der Winkelhalbierenden. */
    function illusW(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const s0: Px = [R.x + 6, R.y + R.h - 6];
      const a1 = -0.12;
      const a2 = -0.62;
      const L1 = R.w - 12;
      const e1: Px = [s0[0] + Math.cos(a1) * L1, s0[1] + Math.sin(a1) * L1];
      const L2 = Math.min(L1, (R.h - 6) / Math.abs(Math.sin(a2)));
      const e2: Px = [s0[0] + Math.cos(a2) * L2, s0[1] + Math.sin(a2) * L2];
      const am = (a1 + a2) / 2;
      const roadW = clamp(R.h * 0.12, 6, 11);
      for (const e of [e1, e2]) {
        segment(s0, e, theme.dark ? '#3a4556' : '#bcc3cd', roadW + 2);
        segment(s0, e, theme.dark ? '#2a3341' : '#d9dde3', roadW);
        segment(s0, e, theme.dark ? '#8794a6' : '#ffffff', 1.2, [6, 5]);
      }
      const Lb = Math.min(L1, L2) * 1.05;
      segment(s0, [s0[0] + Math.cos(am) * Lb, s0[1] + Math.sin(am) * Lb], col.line(), 2, [6, 4]);
      const kf = Math.min(L1, L2) * 0.62;
      const fpt: Px = [s0[0] + Math.cos(am) * kf, s0[1] + Math.sin(am) * kf];
      // Lote zu beiden Straßen
      for (const [a, c] of [
        [a1, col.a()],
        [a2, col.b()],
      ] as [number, string][]) {
        const u: Px = [Math.cos(a), Math.sin(a)];
        const k = (fpt[0] - s0[0]) * u[0] + (fpt[1] - s0[1]) * u[1];
        const foot: Px = [s0[0] + u[0] * k, s0[1] + u[1] * k];
        segment(fpt, foot, c, 1.8, [4, 3]);
        ticks((fpt[0] + foot[0]) / 2, (fpt[1] + foot[1]) / 2, unit(foot[0] - fpt[0], foot[1] - fpt[1]), 1, col.ok(), 5);
      }
      // Brunnen
      const r = clamp(R.h * 0.16, 8, 15);
      g.save();
      g.beginPath();
      g.ellipse(fpt[0], fpt[1] + r * 0.2, r, r * 0.6, 0, 0, Math.PI * 2);
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      g.fill();
      g.strokeStyle = col.c();
      g.lineWidth = 1.8;
      g.stroke();
      g.beginPath();
      g.ellipse(fpt[0], fpt[1] + r * 0.2, r * 0.68, r * 0.36, 0, 0, Math.PI * 2);
      g.fillStyle = withAlpha(col.c(), 0.35);
      g.fill();
      g.strokeStyle = col.c();
      g.lineWidth = 1.4;
      for (const sx of [-1, 1]) {
        g.beginPath();
        g.moveTo(fpt[0], fpt[1] - r * 0.1);
        g.quadraticCurveTo(fpt[0] + sx * r * 0.35, fpt[1] - r * 1.1, fpt[0] + sx * r * 0.62, fpt[1] - r * 0.05);
        g.stroke();
      }
      g.restore();
    }

    function merkeSpec(w: number): CardSpec {
      const m = mode();
      return textSpec(w, ctx.t('merkeT'), ctx.t(m === 'winkel' ? 'merkeW' : m === 'umk' ? 'merkeU' : 'merkeM'), col.line(), m === 'umk' && !!layout().side);
    }

    function whyText(): string {
      return ctx.t(what() === 'mittel' ? 'whyM' : 'whyW');
    }

    function stepsCard(R: Rect, portrait: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const list = steps();
      const n = list.length - 1;
      const done = constrDone();
      card(R, done ? col.ok() : col.line(), done ? 0.06 : 0.03);
      g.font = font(700, F(12, 11));
      const longT = ctx.t(what() === 'mittel' ? 'stepsTM' : 'stepsTW');
      const headT = g.measureText(longT).width <= R.w - 2 * pad ? longT : ctx.t(what() === 'mittel' ? 'stepsTMs' : 'stepsTWs');
      title(R.x + pad, R.y + 16, headT, done ? col.ok() : col.line(), R.w - 2 * pad);
      const f = font(500, F(12.5, 12));
      const fb = font(700, F(12.5, 12));
      const lh = F(16.5, 15.5);
      const bh = 30;
      const btnY = R.y + R.h - F(12, 10) - bh;
      const top = R.y + F(31, 28);
      const textW = R.w - 2 * pad - 28;
      const rowsList = list.map((st, i) => wrap(st.text, textW, i === stepIdx ? fb : f));
      const listH = rowsList.reduce((s, r) => s + r.length * lh + 8, 0);
      const whyRows = wrap(whyText(), R.w - 2 * pad, f);
      const whyH = 22 + whyRows.length * lh;
      const fitsList = top + listH <= btnY - 6;
      const fitsWhy = top + listH + 6 + whyH <= btnY - 6;
      const compact = !fitsList || (portrait && done && !fitsWhy);
      const showWhy = portrait && fitsWhy;
      if (!compact) {
        let y = top;
        rowsList.forEach((rows, i) => {
          const state = i < stepIdx || (i === stepIdx && done) ? 'done' : i === stepIdx ? 'now' : 'todo';
          const cy = y + lh / 2;
          if (state === 'now') {
            g.fillStyle = withAlpha(col.line(), theme.dark ? 0.16 : 0.09);
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
            g.fillStyle = state === 'done' ? col.ok() : col.line();
            g.fill();
          }
          text(g, state === 'done' ? '✓' : String(i), R.x + pad + 10, cy + 0.5, { font: font(800, 10.5), color: state === 'todo' ? theme.muted : onColor() });
          textRows(rows, R.x + pad + 30, cy, lh, i === stepIdx ? fb : f, state === 'todo' ? theme.muted : theme.text);
          y += rows.length * lh + 8;
        });
        if (showWhy) {
          y += 4;
          g.strokeStyle = theme.dark ? '#273142' : '#e9edf2';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(R.x + pad, y);
          g.lineTo(R.x + R.w - pad, y);
          g.stroke();
          title(R.x + pad, y + 13, ctx.t('why'), done ? col.ok() : theme.muted);
          textRows(whyRows, R.x + pad, y + 22 + lh / 2, lh, f, theme.text);
        }
      } else {
        // kompakt: Fortschrittspunkte, aktueller Schritt, nach dem letzten Schritt die Begründung
        let y = top;
        for (let i = 1; i <= n; i++) {
          g.beginPath();
          g.arc(R.x + pad + 5 + (i - 1) * 15, y + 6, 4.5, 0, Math.PI * 2);
          g.fillStyle = i < stepIdx || (i === stepIdx && done) ? col.ok() : i === stepIdx ? col.line() : withAlpha(theme.text, 0.15);
          g.fill();
        }
        if (stepIdx > 0) {
          const so = tr('stepOf', { i: stepIdx, n });
          g.font = font(600, 11);
          if (pad + n * 15 + 10 + g.measureText(so).width <= R.w - pad) text(g, so, R.x + R.w - pad, y + 6, { font: font(600, 11), color: theme.muted, align: 'right' });
        }
        y += 20;
        const rows = wrap(list[stepIdx]!.text, R.w - 2 * pad, fb);
        y += textRows(rows, R.x + pad, y + lh / 2, lh, fb, theme.text) + 6;
        if (done && portrait) {
          title(R.x + pad, y + 8, ctx.t('why'), col.ok());
          y += 16;
          const k = Math.max(0, Math.floor((btnY - 6 - y) / lh));
          textRows(whyRows.slice(0, k), R.x + pad, y + lh / 2, lh, f, theme.text);
        }
      }
      if (!ctx.locked) {
        g.font = font(700, F(12.5, 12));
        const nextW = g.measureText(ctx.t('next')).width + 30;
        // „Von vorn“ als runder Knopf, wenn beide Beschriftungen nicht nebeneinander passen
        const roomy = g.measureText(ctx.t('restart')).width + 26 + nextW + 10 <= R.w - 2 * pad;
        const restartW = roomy ? g.measureText(ctx.t('restart')).width + 26 : bh;
        if (!done) button({ x: R.x + R.w - pad - nextW, y: btnY, w: nextW, h: bh }, ctx.t('next'), 'next', col.line(), true, !stepRunning() && !autoPlay);
        else text(g, `✓ ${ctx.t('done')}`, R.x + R.w - pad, btnY + bh / 2, { font: font(800, F(14, 13)), color: col.ok(), align: 'right' });
        if (stepIdx > 0) button({ x: R.x + pad, y: btnY, w: restartW, h: bh }, roomy ? ctx.t('restart') : '↺', 'restart', theme.muted);
      }
    }

    /* Anwendung */
    function taskSpec(w: number, grow: boolean): CardSpec {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const f = font(500, F(12.5, 12));
      const lh = F(17, 16);
      const rows = wrap(ctx.t('taskText'), w - 2 * pad, f);
      const mt = meetingPoint(A(), B(), G(), H());
      const found = eqR() && mt.kind === 'point';
      let status: string | null = null;
      let sColor = theme.text;
      if (mt.kind === 'none') {
        status = ctx.t('taskNone');
        sColor = col.tick();
      } else if (mt.kind === 'all') {
        status = ctx.t('taskAll');
        sColor = col.ok();
      } else if (meetS() === null) {
        status = ctx.t('taskOut');
        sColor = col.tick();
      } else if (found) {
        status = `✓ ${tr('taskFound', { r: cmText(dist(mt.t, A())) })}`;
        sColor = col.ok();
      }
      const sf = font(700, F(12.5, 12));
      const sRows = status ? wrap(status, w - 2 * pad, sf) : [];
      const top = F(31, 28);
      const h = top + rows.length * lh + (sRows.length ? 6 + sRows.length * lh : 0) + F(10, 8);
      return {
        h,
        grow,
        draw(R) {
          card(R, found ? col.ok() : undefined, found ? 0.07 : 0);
          g.font = font(700, F(12, 11));
          const head = g.measureText(ctx.t('taskT')).width <= R.w - 2 * pad ? ctx.t('taskT') : ctx.t('taskTs');
          title(R.x + pad, R.y + 16, head, found ? col.ok() : theme.muted, R.w - 2 * pad);
          let y = R.y + top;
          y += textRows(rows, R.x + pad, y + lh / 2, lh, f, theme.text);
          if (sRows.length) {
            y += 6;
            const sc = popScale(found);
            g.save();
            g.translate(R.x + pad, y + lh / 2);
            g.scale(sc, sc);
            textRows(sRows, 0, 0, lh, sf, sColor);
            g.restore();
            y += sRows.length * lh;
          }
          // Restfläche: Spielplatz-Symbol (leuchtet, wenn gefunden)
          const room = R.y + R.h - 8 - y;
          if (room > 46) {
            const s = Math.min(room * 0.5, 46);
            const c: Px = [R.x + R.w / 2, y + room / 2 + 2];
            g.beginPath();
            g.arc(c[0], c[1], s * 0.85, 0, Math.PI * 2);
            g.fillStyle = found ? withAlpha(col.ok(), 0.16) : withAlpha(theme.text, 0.05);
            g.fill();
            g.strokeStyle = found ? col.ok() : withAlpha(theme.text, 0.18);
            g.lineWidth = 1.5;
            g.setLineDash(found ? [] : [4, 4]);
            g.stroke();
            g.setLineDash([]);
            drawSwing(c, s, found ? col.ok() : withAlpha(theme.text, 0.35));
            if (!found) text(g, '?', c[0] + s * 0.62, c[1] - s * 0.62, { font: font(800, F(16, 14)), color: theme.muted });
          }
        },
      };
    }

    /* Umkreis */
    function umkSpec(w: number): CardSpec {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const pts = [A(), B(), C()] as const;
      const u = collinear(...pts) ? null : circumcenter(...pts);
      const show = !!u && (p.line || p.circ);
      const f = font(500, F(12.5, 12));
      const lh = F(17, 16);
      const rows = wrap(ctx.t(!u ? 'uNone' : show ? 'uText' : 'uHidden'), w - 2 * pad, f);
      const k = triangleKind(...pts);
      const kf = font(700, F(12.5, 12));
      const kRows = show ? wrap(ctx.t(k === 'spitz' ? 'uSpitz' : k === 'recht' ? 'uRecht' : 'uStumpf'), w - 2 * pad, kf) : [];
      const bigF = font(800, F(14, 13));
      const big = u && show ? `|UA| = |UB| = |UC| ${cmText(dist(u, pts[0]))}` : '';
      const top = F(31, 28);
      const h = top + rows.length * lh + (big ? 26 : 0) + (kRows.length ? 4 + kRows.length * lh : 0) + F(10, 8);
      return {
        h,
        draw(R) {
          card(R, col.line(), 0.04);
          title(R.x + pad, R.y + 16, ctx.t('uT'), col.line(), R.w - 2 * pad);
          let y = R.y + top;
          y += textRows(rows, R.x + pad, y + lh / 2, lh, f, theme.text);
          if (big) {
            text(g, big, R.x + pad, y + 13, { font: bigF, color: col.line(), align: 'left' });
            y += 26;
          }
          if (kRows.length) textRows(kRows, R.x + pad, y + 4 + lh / 2, lh, kf, theme.text);
        },
      };
    }

    /** Drei kleine Dreiecke: wo liegt U? Die aktuelle Art ist hervorgehoben. */
    function kindsSpec(): CardSpec | null {
      const pts = [A(), B(), C()] as const;
      if (collinear(...pts)) return null;
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const cur = triangleKind(...pts);
      const show = p.line || p.circ;
      const top = F(29, 26);
      const lab = 34;
      const minIll = 46;
      const h = top + minIll + lab + 6;
      const shapes: { k: 'spitz' | 'recht' | 'stumpf'; v: Pt[]; name: string; where: string }[] = [
        { k: 'spitz', v: [[0, 0], [10, 0.6], [4.2, 7.5]], name: ctx.t('kSpitz'), where: ctx.t('kIn') },
        { k: 'recht', v: [[0, 0], [9, 0], [0, 6]], name: ctx.t('kRecht'), where: ctx.t('kOn') },
        { k: 'stumpf', v: [[0, 0], [11, 0], [2.6, 2.6]], name: ctx.t('kStumpf'), where: ctx.t('kOut') },
      ];
      return {
        h,
        grow: true,
        draw(R) {
          card(R);
          title(R.x + pad, R.y + 16, ctx.t('kindsT'));
          const colW = (R.w - 2 * pad) / 3;
          const ih = R.y + R.h - lab - 6 - (R.y + top);
          shapes.forEach((sh, i) => {
            const cx = R.x + pad + colW * (i + 0.5);
            const isCur = show && sh.k === cur;
            const box: Rect = { x: R.x + pad + colW * i + 3, y: R.y + top - 4, w: colW - 6, h: R.h - top - 2 };
            if (isCur) {
              g.fillStyle = withAlpha(col.line(), theme.dark ? 0.16 : 0.09);
              roundRect(g, box.x, box.y, box.w, box.h, 9);
              g.fill();
              g.strokeStyle = withAlpha(col.line(), 0.5);
              g.lineWidth = 1.2;
              g.stroke();
            }
            const [a, b, c] = sh.v as [Pt, Pt, Pt];
            const u = circumcenter(a, b, c)!;
            const r = dist(u, a);
            const R0 = Math.max(10, Math.min(colW * 0.4, ih * 0.46));
            const cy = R.y + top + ih / 2;
            const sc = R0 / r;
            const mp = (q: Pt): Px => [cx + (q[0] - u[0]) * sc, cy - (q[1] - u[1]) * sc];
            const ink = isCur ? col.line() : withAlpha(theme.text, 0.45);
            g.beginPath();
            g.arc(cx, cy, R0, 0, Math.PI * 2);
            g.strokeStyle = isCur ? col.line() : withAlpha(theme.text, 0.25);
            g.lineWidth = 1.5;
            g.stroke();
            g.beginPath();
            [a, b, c].map(mp).forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.closePath();
            g.fillStyle = isCur ? withAlpha(col.line(), 0.12) : withAlpha(theme.text, 0.05);
            g.fill();
            g.strokeStyle = isCur ? theme.text : withAlpha(theme.text, 0.55);
            g.lineWidth = 1.8;
            g.lineJoin = 'round';
            g.stroke();
            dot([cx, cy], 3.2, ink);
            text(g, sh.name, cx, R.y + R.h - lab + 6, { font: font(isCur ? 800 : 600, F(11.5, 11)), color: isCur ? theme.text : theme.muted });
            text(g, `U ${sh.where}`, cx, R.y + R.h - lab + 22, { font: font(500, F(11.5, 11)), color: isCur ? col.line() : theme.muted });
          });
        },
      };
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      hits = [];
      placedTags = [];
      surface.begin();
      const lay = layout();
      const g = surface.g;
      drawPaper(lay.paper, lay.cell);
      g.save();
      roundRect(g, lay.paper.x, lay.paper.y, lay.paper.w, lay.paper.h, 10);
      g.clip();
      const m = mode();
      if (m === 'mittel') drawMittel();
      else if (m === 'winkel') drawWinkel();
      else if (m === 'konstr') drawKonstr();
      else if (m === 'anw') drawAnw();
      else drawUmk();
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
      const side = lay.side;
      if (m === 'mittel' || m === 'winkel') {
        const kind = m === 'mittel' ? 'm' : 'w';
        if (side) {
          stack(lay.below, [(w) => [distSpec(w, true), distSpec(w, true, true)]], gap);
          stack(side, [(w) => [traceSpec(w, true), traceSpec(w, false)], merkeSpec, (w) => illusSpec(w, kind)], gap);
        } else stack(lay.below, [distSpec, (w) => [traceSpec(w, true), traceSpec(w, false)], merkeSpec, (w) => illusSpec(w, kind)], gap);
      } else if (m === 'konstr') {
        if (side) {
          stepsCard(side, false);
          const acc = constrDone() ? col.ok() : undefined;
          stack(lay.below, [(w) => [textSpec(w, ctx.t('why'), whyText(), acc, true), textSpec(w, ctx.t('why'), ctx.t(what() === 'mittel' ? 'whyMShort' : 'whyWShort'), acc, true)]], gap);
        } else stepsCard(lay.below, true);
      } else if (m === 'anw') {
        const idea = (w: number) => textSpec(w, ctx.t('ideaT'), ctx.t('idea'), col.line());
        const puzzle = (w: number) => textSpec(w, ctx.t('puzzleT'), ctx.t('puzzle'));
        if (side) {
          stack(lay.below, [(w) => [distSpec(w, true), distSpec(w, true, true)]], gap);
          // Lösungsidee nur, wenn die Ortslinie gezeigt wird (sonst verrät sie die Aufgabe)
          stack(side, [(w) => taskSpec(w, true), (w) => (p.line ? idea(w) : null), puzzle], gap);
        } else stack(lay.below, [distSpec, (w) => taskSpec(w, true), (w) => (p.line ? idea(w) : null), puzzle], gap);
      } else {
        const use = (w: number) => textSpec(w, ctx.t('uUseT'), ctx.t('uUse'));
        if (side) {
          stack(lay.below, [merkeSpec], gap);
          stack(side, [umkSpec, kindsSpec, use], gap);
        } else stack(lay.below, [umkSpec, kindsSpec, merkeSpec], gap);
      }

      // Animationen
      const running = m === 'konstr' && stepRunning();
      if (m === 'konstr' && !running && autoPlay) {
        if (stepIdx < steps().length - 1) {
          const since = performance.now() - stepStart - stepDur(steps()[stepIdx]!);
          if (since > 450 || reduced) nextStep();
        } else {
          autoPlay = false;
          updateReadouts();
        }
      }
      if (running || autoPlay || tracePop.running || eqPop.running) ctx.requestRender();
      if (m === 'konstr' && wasRunning && !running) updateReadouts();
      wasRunning = running;
    }

    /* ---------- Zeiger ---------- */
    const canDrag = () => !ctx.locked && !(mode() === 'konstr' && (stepRunning() || autoPlay));

    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
      }
      if (!canDrag()) return null;
      const { paper, cell } = layout();
      if (px < paper.x || px > paper.x + paper.w || py < paper.y || py > paper.y + paper.h) return null;
      const R = wide() ? 18 : 22;
      const cands: [string, Pt, number][] = [];
      const m = mode();
      const arms = () => {
        const an = angle();
        cands.push(['s', an.s, R]);
        for (const which of [1, 2] as const) cands.push([`arm${which}`, armPoint(which === 1 ? an.th1 : an.th1 + an.al), R]);
      };
      if (m === 'mittel') cands.push(['p', P, R], ['a', A(), R], ['b', B(), R]);
      else if (m === 'winkel') {
        cands.push(['p', PW, R]);
        arms();
      } else if (m === 'konstr') {
        if (what() === 'mittel') cands.push(['a', A(), R], ['b', B(), R]);
        else arms();
      } else if (m === 'anw') {
        const hr = Math.max(R, clamp(cell * 1.5, 18, 34) * 0.9);
        cands.push(['p', roadP(), R], ['a', A(), hr], ['b', B(), hr], ['g', G(), R], ['h', H(), R]);
      } else cands.push(['a', A(), R], ['b', B(), R], ['c', C(), R]);
      let best: string | null = null;
      let bd = Infinity;
      for (const [id, q, rr] of cands) {
        const [x, y] = toPx(q);
        const d = Math.hypot(px - x, py - y);
        if (d < rr && d < bd) {
          bd = d;
          best = id;
        }
      }
      return best;
    }

    function tap(id: string): void {
      if (ctx.locked) return;
      if (id === 'next') {
        autoPlay = false;
        nextStep();
      } else if (id === 'restart') restart();
      ctx.requestRender();
    }

    function setPoint(id: PtId, q: Pt): void {
      const s = snap(q);
      if (id === 's') {
        ctx.set({ sx: s[0], sy: s[1] });
        return;
      }
      if (id === 'g' || id === 'h') {
        const other = id === 'g' ? H() : G();
        if (other[0] === s[0] && other[1] === s[1]) return;
        ctx.set({ [`${id}x`]: s[0], [`${id}y`]: s[1] });
        return;
      }
      const others = (['a', 'b', 'c'] as const).filter((k) => k !== id && (k !== 'c' || mode() === 'umk'));
      const pos: Record<string, Pt> = { a: A(), b: B(), c: C() };
      if (others.some((k) => pos[k]![0] === s[0] && pos[k]![1] === s[1])) return;
      ctx.set({ [`${id}x`]: s[0], [`${id}y`]: s[1] });
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id === 'p') drag = { kind: 'p' };
        else if (id === 'a' || id === 'b' || id === 'c' || id === 's' || id === 'g' || id === 'h') drag = { kind: 'pt', id };
        else if (id === 'arm1' || id === 'arm2') drag = { kind: 'arm', which: id === 'arm1' ? 1 : 2 };
        else {
          tap(id);
          return true;
        }
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag || !canDrag()) return;
        const w = toWorld(q.px, q.py);
        if (drag.kind === 'p') {
          const m = mode();
          if (m === 'mittel') placeP(w);
          else if (m === 'winkel') placePW(w);
          else placePR(w);
          checkEqual();
          updateReadouts();
        } else if (drag.kind === 'pt') setPoint(drag.id, w);
        else {
          const an = angle();
          const dg = norm360(Math.round(deg(Math.atan2(w[1] - an.s[1], w[0] - an.s[0]))));
          if (drag.which === 1) {
            // erster Schenkel dreht, zweiter bleibt liegen
            const th2 = an.th1 + an.al;
            const al = clamp(norm360(th2 - dg), 20, 180);
            ctx.set({ th: Math.round(norm360(th2 - al)) % 360, al: Math.round(al) });
          } else ctx.set({ al: Math.round(clamp(norm360(dg - an.th1), 20, 180)) });
        }
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

    /** P jeweils neben die Ortslinie legen (nicht darauf). */
    function resetP(): void {
      const a = A();
      const b = B();
      const { m, d } = perpBisector(a, b);
      const off: Pt = [(a[0] - m[0]) * 0.35 + d[0] * 3.5, (a[1] - m[1]) * 0.35 + d[1] * 3.5];
      P = snap([m[0] + off[0], m[1] + off[1]]);
      if (closer(P, a, b) === 'equal' || dist(P, a) < 1e-9) P = snap([P[0] + (a[0] < b[0] ? -1 : 1), P[1] + 1]);
      const an = angle();
      const u = dir(an.th1 + an.al * 0.28);
      placePW([an.s[0] + u[0] * 6, an.s[1] + u[1] * 6]);
      if (eqW()) placePW([an.s[0] + u[0] * 6 + 0.5, an.s[1] + u[1] * 6]);
      const r = road();
      const t = meetS();
      const mid = (r.s0 + r.s1) / 2;
      roadS = t === null ? mid : clamp(t + (t > mid ? -5 : 5), r.s0 + 1, r.s1 - 1);
      lastEq = false;
    }
    resetP();

    return {
      update(changed, source) {
        // Thema von Hand gewechselt: passende Ausgangslage
        if (changed.has('mode') && source === 'input') {
          if (mode() === 'anw') ctx.set(SCENE_ANW);
          else if (mode() === 'umk') ctx.set(SCENE_UMK);
        }
        const abChanged = ['ax', 'ay', 'bx', 'by'].some((k) => changed.has(k));
        const angChanged = ['sx', 'sy', 'th', 'al'].some((k) => changed.has(k));
        const roadChanged = ['gx', 'gy', 'hx', 'hy'].some((k) => changed.has(k));
        if (abChanged) {
          traceM = [];
          if (dist(P, A()) < 1e-9 || dist(P, B()) < 1e-9) resetP();
        }
        if (angChanged) {
          traceW = [];
          placePW(PW);
        }
        if (roadChanged) {
          const r = road();
          roadS = clamp(roadS, r.s0, r.s1);
        }
        if (source === 'replace' || source === 'init' || changed.has('mode')) {
          resetP();
          traceM = [];
          traceW = [];
        }
        if (abChanged || angChanged || changed.has('what') || changed.has('mode') || source === 'replace') restart();
        if (changed.has('trace') && !p.trace) {
          traceM = [];
          traceW = [];
        }
        checkEqual();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'next') {
          autoPlay = false;
          nextStep();
        } else if (id === 'play') {
          if (stepIdx >= steps().length - 1) restart();
          autoPlay = true;
          if (!stepRunning()) nextStep();
        } else if (id === 'restart') restart();
        else if (id === 'clear') {
          traceM = [];
          traceW = [];
          lastEq = false;
          checkEqual();
        }
        updateReadouts();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
