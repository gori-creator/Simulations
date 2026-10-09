import { defineSimulation, ease, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  angleAt,
  dist,
  FIG_IDS,
  flagCloth,
  foot,
  GRID_H,
  GRID_W,
  lineDistance,
  matchAxis,
  orientation,
  orientedPoints,
  placeFigure,
  reflectAcross,
  reflectPoint,
  shapeValid,
  symmetryOf,
  type FigId,
  type Pt,
  type ShapeKind,
  type Symmetry,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'achse' | 'punkt' | 'symmetrie';
type Lang = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const isMode =
  (...modes: Mode[]) =>
  (v: Record<string, unknown>) =>
    modes.includes(v.mode as Mode);
const PRIME = '′';
const NAMES = ['A', 'B', 'C', 'D'] as const;

const FIG_NAME: Record<FigId, { de: string; en: string }> = {
  H: L('Buchstabe H', 'Letter H'),
  T: L('Buchstabe T', 'Letter T'),
  E: L('Buchstabe E', 'Letter E'),
  N: L('Buchstabe N', 'Letter N'),
  F: L('Buchstabe F', 'Letter F'),
  dreieck: L('Gleichseitiges Dreieck', 'Equilateral triangle'),
  parallelogramm: L('Parallelogramm', 'Parallelogram'),
  stern: L('Stern', 'Star'),
  windrad: L('Windrad', 'Pinwheel'),
};

/** Erklärung zur Lösung je Figur. */
const FIG_NOTE: Record<FigId, { de: string; en: string }> = {
  H: L('Zwei Symmetrieachsen (waagerecht und senkrecht) und punktsymmetrisch.', 'Two lines of symmetry (horizontal and vertical) and point symmetry.'),
  T: L('Eine Symmetrieachse, nicht punktsymmetrisch.', 'One line of symmetry, no point symmetry.'),
  E: L('Eine Symmetrieachse – sie liegt quer zum Buchstaben.', 'One line of symmetry – it runs across the letter.'),
  N: L('Keine Symmetrieachse, aber punktsymmetrisch: Nach einer halben Drehung sieht das N gleich aus.', 'No line of symmetry, but point symmetry: after half a turn the N looks the same.'),
  F: L('Weder achsen- noch punktsymmetrisch.', 'Neither line nor point symmetry.'),
  dreieck: L('Drei Symmetrieachsen (die Mittelsenkrechten), aber nicht punktsymmetrisch.', 'Three lines of symmetry (the perpendicular bisectors), but no point symmetry.'),
  parallelogramm: L('Punktsymmetrisch, aber ohne Symmetrieachse – auch die Diagonalen sind keine Achsen!', 'Point symmetry but no line of symmetry – the diagonals are not lines of symmetry either!'),
  stern: L('Fünf Symmetrieachsen, aber nicht punktsymmetrisch (eine Zacke zeigt nach oben, keine nach unten).', 'Five lines of symmetry but no point symmetry (one tip points up, none points down).'),
  windrad: L('Weder achsen- noch punktsymmetrisch – es sieht erst nach einer Drittel-Drehung wieder gleich aus.', 'Neither line nor point symmetry – it only looks the same again after a third of a turn.'),
};

/** Gute Startlagen der Figuren. */
const SHAPE_DEFAULT: Record<ShapeKind, Record<string, number>> = {
  dreieck: { ax: 3, ay: 3, bx: 8, by: 4, cx: 5, cy: 9 },
  viereck: { ax: 3, ay: 3, bx: 8, by: 4, cx: 7, cy: 10, dx: 2, dy: 8 },
  fahne: { ax: 5, ay: 2, bx: 5, by: 11, cx: 9, cy: 9 },
};

interface Hit {
  id: string;
  r: Rect;
}

type Drag =
  | { kind: 'vertex'; i: number; image: boolean }
  | { kind: 'body'; start: Pt; orig: Pt[] }
  | { kind: 'pq'; which: 'p' | 'q' }
  | { kind: 'axis'; start: Pt; orig: [Pt, Pt] }
  | { kind: 'z' }
  | { kind: 'pen'; start: Pt; cur: Pt; startPx: [number, number]; curPx: [number, number] }
  | null;

/**
 * Achsen- und Punktspiegelung: eine Figur (Dreieck, Viereck oder Fähnchen)
 * an einer ziehbaren Achse bzw. an einem Zentrum spiegeln, mit
 * Konstruktionslinien, Umlaufsinn, Fixpunkten und Fixgeraden, animiertem
 * Umklappen bzw. Drehen um 180° – und ein Modus, in dem man die
 * Symmetrieachsen und das Symmetriezentrum von Figuren selbst einzeichnet.
 */
export default defineSimulation({
  id: 'spiegelung',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.62 },
  groups: [
    { id: 'pts', label: L('Figur (in Kästchen)', 'Figure (in grid squares)') },
    { id: 'mirror', label: L('Achse bzw. Zentrum (in Kästchen)', 'Axis or centre (in grid squares)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Modus', 'Mode'),
      options: [
        { value: 'achse', label: L('Achsenspiegelung', 'Reflection in a line') },
        { value: 'punkt', label: L('Punktspiegelung', 'Reflection in a point') },
        { value: 'symmetrie', label: L('Symmetrie erkennen', 'Find the symmetry') },
      ],
      default: 'achse',
    },
    {
      key: 'shape',
      type: 'choice',
      label: L('Figur', 'Figure'),
      options: [
        { value: 'dreieck', label: L('Dreieck', 'Triangle') },
        { value: 'fahne', label: L('Fähnchen', 'Flag') },
        { value: 'viereck', label: L('Viereck', 'Quadrilateral') },
      ],
      default: 'dreieck',
      visibleIf: isMode('achse', 'punkt'),
    },
    {
      key: 'fig',
      type: 'choice',
      label: L('Figur', 'Figure'),
      options: FIG_IDS.map((id) => ({ value: id, label: FIG_NAME[id] })),
      default: 'H',
      visibleIf: isMode('symmetrie'),
    },
    { key: 'rot', type: 'number', label: L('Drehung der Figur', 'Rotation of the figure'), min: 0, max: 345, step: 15, default: 0, unit: '°', visibleIf: isMode('symmetrie') },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: nach rechts', 'A: right'), min: 0, max: GRID_W, step: 1, default: 3, visibleIf: isMode('achse', 'punkt') },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: nach oben', 'A: up'), min: 0, max: GRID_H, step: 1, default: 3, visibleIf: isMode('achse', 'punkt') },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: nach rechts', 'B: right'), min: 0, max: GRID_W, step: 1, default: 8, visibleIf: isMode('achse', 'punkt') },
    { key: 'by', type: 'number', group: 'pts', label: L('B: nach oben', 'B: up'), min: 0, max: GRID_H, step: 1, default: 4, visibleIf: isMode('achse', 'punkt') },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: nach rechts', 'C: right'), min: 0, max: GRID_W, step: 1, default: 5, visibleIf: isMode('achse', 'punkt') },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: nach oben', 'C: up'), min: 0, max: GRID_H, step: 1, default: 9, visibleIf: isMode('achse', 'punkt') },
    { key: 'dx', type: 'number', group: 'pts', label: L('D: nach rechts', 'D: right'), min: 0, max: GRID_W, step: 1, default: 2, visibleIf: (v) => (v.mode === 'achse' || v.mode === 'punkt') && v.shape === 'viereck' },
    { key: 'dy', type: 'number', group: 'pts', label: L('D: nach oben', 'D: up'), min: 0, max: GRID_H, step: 1, default: 8, visibleIf: (v) => (v.mode === 'achse' || v.mode === 'punkt') && v.shape === 'viereck' },
    { key: 'px', type: 'number', group: 'mirror', label: L('Achse s, Punkt P: nach rechts', 'Axis s, point P: right'), min: 0, max: GRID_W, step: 1, default: 10, visibleIf: isMode('achse') },
    { key: 'py', type: 'number', group: 'mirror', label: L('Achse s, Punkt P: nach oben', 'Axis s, point P: up'), min: 0, max: GRID_H, step: 1, default: 1, visibleIf: isMode('achse') },
    { key: 'qx', type: 'number', group: 'mirror', label: L('Achse s, Punkt Q: nach rechts', 'Axis s, point Q: right'), min: 0, max: GRID_W, step: 1, default: 10, visibleIf: isMode('achse') },
    { key: 'qy', type: 'number', group: 'mirror', label: L('Achse s, Punkt Q: nach oben', 'Axis s, point Q: up'), min: 0, max: GRID_H, step: 1, default: 13, visibleIf: isMode('achse') },
    { key: 'zx', type: 'number', group: 'mirror', label: L('Zentrum Z: nach rechts', 'Centre Z: right'), min: 0, max: GRID_W, step: 1, default: 10, visibleIf: isMode('punkt') },
    { key: 'zy', type: 'number', group: 'mirror', label: L('Zentrum Z: nach oben', 'Centre Z: up'), min: 0, max: GRID_H, step: 1, default: 7, visibleIf: isMode('punkt') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Bildfigur zeigen', 'Show the image'), help: L('Ausgeschaltet kann man das Bild erst selbst konstruieren.', 'Switch off to construct the image yourself first.'), default: true, visibleIf: isMode('achse', 'punkt') },
    { key: 'constr', type: 'boolean', group: 'view', label: L('Konstruktionslinien', 'Construction lines'), default: true, visibleIf: isMode('achse', 'punkt') },
    { key: 'orient', type: 'boolean', group: 'view', label: L('Umlaufsinn', 'Orientation'), default: true, visibleIf: isMode('achse', 'punkt') },
    { key: 'fix', type: 'boolean', group: 'view', label: L('Fixpunkte und Fixgeraden', 'Fixed points and fixed lines'), default: false, visibleIf: isMode('achse', 'punkt') },
  ],
  actions: [
    { id: 'go', label: L('Umklappen', 'Fold over'), primary: true, visibleIf: isMode('achse', 'punkt') },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: isMode('symmetrie') },
    { id: 'solve', label: L('Lösung zeigen', 'Show solution'), visibleIf: isMode('symmetrie') },
    { id: 'next', label: L('Nächste Figur', 'Next figure'), visibleIf: isMode('symmetrie') },
  ],
  readouts: [
    { key: 'dist', label: L('Abstände', 'Distances') },
    { key: 'keep', label: L('Längen und Winkel', 'Lengths and angles') },
    { key: 'orient', label: L('Umlaufsinn', 'Orientation') },
    { key: 'found', label: L('Gefunden', 'Found') },
    { key: 'sym', label: L('Symmetrie der Figur', 'Symmetry of the figure'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Achsenspiegelung', 'Reflection in a line'), values: {} },
    { id: 'schraeg', label: L('Fähnchen an schräger Achse', 'Flag, slanted axis'), values: { shape: 'fahne', ax: 3, ay: 3, bx: 3, by: 12, cx: 7, cy: 10, px: 6, py: 1, qx: 10, qy: 13 } },
    { id: 'punkt', label: L('Punktspiegelung', 'Reflection in a point'), values: { mode: 'punkt' } },
    { id: 'fix', label: L('Fixgeraden', 'Fixed lines'), values: { fix: true, ax: 10, ay: 3, bx: 14, by: 5, cx: 12, cy: 10, px: 9, py: 1, qx: 11, qy: 13 } },
    { id: 'symmetrie', label: L('Symmetrie erkennen', 'Find the symmetry'), values: { mode: 'symmetrie' } },
    { id: 'parallelogramm', label: L('Ist das Parallelogramm achsensymmetrisch?', 'Is the parallelogram symmetric?'), values: { mode: 'symmetrie', fig: 'parallelogramm', rot: 15 } },
  ],
  strings: {
    de: {
      canvas: 'Karopapier mit einer Figur und ihrem Spiegelbild, Spiegelachse bzw. Spiegelzentrum und Konstruktionslinien, daneben Erklärungen',
      ruleAxisT: 'Achsenspiegelung an s',
      ruleAxis: 'Ein Punkt P und sein Bildpunkt P′ liegen auf einer Senkrechten zu s und gleich weit von s entfernt: s halbiert [PP′] und steht senkrecht darauf.',
      rulePointT: 'Punktspiegelung am Zentrum Z',
      rulePoint: 'Z ist der Mittelpunkt jeder Strecke [PP′]. Das ist dasselbe wie eine Drehung um 180° um Z.',
      distAxis: 'Abstand von s',
      distPoint: 'Abstand von Z',
      keepT: 'Was bleibt gleich?',
      lengths: 'Längen',
      angles: 'Winkel',
      orientT: 'Umlaufsinn',
      ccw: 'gegen den Uhrzeigersinn',
      cw: 'im Uhrzeigersinn',
      reversed: 'umgekehrt',
      same: 'bleibt gleich',
      parallel: 'Bildstrecken parallel',
      parallelShort: 'Parallel',
      angleAt: 'Winkel bei {p}',
      fixT: 'Fixpunkte und Fixgeraden',
      fixAxis: 'Fixpunkte: alle Punkte auf s. Fixgeraden: s selbst und jede Senkrechte zu s – sie wird auf sich selbst abgebildet.',
      fixPoint: 'Fixpunkt: nur Z. Fixgeraden: alle Geraden durch Z.',
      fixLine: 'Fixgerade',
      fixPt: 'Fixpunkt',
      stepsT: 'Konstruieren mit dem Geodreieck',
      stepsAxis: 'Geodreieck mit der Mittellinie auf s legen, die Zeichenkante geht durch P.|Senkrechte durch P zeichnen und den Abstand von P zu s messen.|Auf der anderen Seite von s gleich weit abtragen: P′.',
      stepsPoint: 'P mit Z verbinden und die Strecke über Z hinaus verlängern.|Die Länge von [PZ] messen.|Von Z aus gleich weit abtragen: P′.',
      gallery: 'Figuren',
      galleryHint: 'Antippen zum Wechseln',
      goAxis: 'Umklappen',
      goPoint: 'Um 180° drehen',
      hiddenImage: 'Konstruiere das Bild selbst – dann „Umklappen“ zum Vergleichen.',
      hiddenImageP: 'Konstruiere das Bild selbst – dann „Um 180° drehen“ zum Vergleichen.',
      symT: 'Symmetrie erkennen',
      symTask: 'Ziehe mit dem Finger eine Linie quer über die Figur, um eine Symmetrieachse einzuzeichnen. Tippe auf das Symmetriezentrum, wenn die Figur punktsymmetrisch ist.',
      foundAxes0: 'Noch keine Achse eingezeichnet',
      foundAxes1: '1 Symmetrieachse eingezeichnet',
      foundAxesN: '{n} Symmetrieachsen eingezeichnet',
      foundCenter: 'Symmetriezentrum gefunden',
      noCenter: 'Kein Symmetriezentrum markiert',
      okAxis: 'Das ist eine Symmetrieachse!',
      badAxis: 'Das Spiegelbild (rot) passt nicht auf die Figur.',
      dupAxis: 'Diese Achse hast du schon.',
      okCenter: 'Das ist das Symmetriezentrum!',
      badCenter: 'Nach einer halben Drehung um diesen Punkt (rot) passt die Figur nicht auf sich.',
      checkOk: 'Richtig – alles gefunden!',
      checkMissAxes: 'Es fehlen noch Symmetrieachsen.',
      checkMissCenter: 'Die Figur ist auch punktsymmetrisch – wo liegt das Zentrum?',
      solved: 'Vollständig gelöst: {n}',
      merkeT: 'Merke',
      merke: 'Eine Figur ist achsensymmetrisch, wenn sie beim Spiegeln an einer Geraden (Symmetrieachse) auf sich selbst fällt. Sie ist punktsymmetrisch, wenn sie bei einer halben Drehung (180°) um einen Punkt Z auf sich selbst fällt.',
      check: 'Prüfen',
      next: 'Nächste Figur',
      solution: 'Lösung',
      invalid: 'So wäre die Figur keine richtige Figur mehr.',
      distRead: '{p}: {d}',
      keepRead: '|AB| = |A′B′| {l}, Winkel bei {at}: {w}',
      orientRead: '{o}: {d1}; {i}: {d2} ({r})',
      symRead0: 'keine Symmetrieachse',
      symRead1: '1 Symmetrieachse',
      symReadN: '{n} Symmetrieachsen',
      symPoint: 'punktsymmetrisch',
      symNoPoint: 'nicht punktsymmetrisch',
      foundRead: '{a} Achse(n), Zentrum: {z}',
      yes: 'ja',
      no: 'nein',
      tapHint: 'Tipp: Mit „Lösung“ siehst du alle Achsen und das Zentrum.',
    },
    en: {
      canvas: 'Squared paper with a figure and its image, the mirror line or centre and construction lines, with explanations',
      ruleAxisT: 'Reflection in the line s',
      ruleAxis: 'A point P and its image P′ lie on a perpendicular to s, at the same distance from s: s bisects PP′ at right angles.',
      rulePointT: 'Reflection in the centre Z',
      rulePoint: 'Z is the midpoint of every segment PP′. This is the same as a half turn (180°) about Z.',
      distAxis: 'Distance from s',
      distPoint: 'Distance from Z',
      keepT: 'What stays the same?',
      lengths: 'Lengths',
      angles: 'Angles',
      orientT: 'Orientation',
      ccw: 'anticlockwise',
      cw: 'clockwise',
      reversed: 'reversed',
      same: 'unchanged',
      parallel: 'image segments parallel',
      parallelShort: 'Parallel',
      angleAt: 'Angle at {p}',
      fixT: 'Fixed points and fixed lines',
      fixAxis: 'Fixed points: all points on s. Fixed lines: s itself and every line perpendicular to s – it is mapped onto itself.',
      fixPoint: 'Fixed point: only Z. Fixed lines: all lines through Z.',
      fixLine: 'fixed line',
      fixPt: 'fixed point',
      stepsT: 'Constructing with a set square',
      stepsAxis: 'Put the centre line of the set square on s with the edge through P.|Draw the perpendicular through P and measure the distance from P to s.|Mark the same distance on the other side of s: P′.',
      stepsPoint: 'Join P to Z and extend the segment beyond Z.|Measure the length of PZ.|Mark the same length from Z onwards: P′.',
      gallery: 'Figures',
      galleryHint: 'Tap to switch',
      goAxis: 'Fold over',
      goPoint: 'Turn by 180°',
      hiddenImage: 'Construct the image yourself – then press “Fold over” to compare.',
      hiddenImageP: 'Construct the image yourself – then press “Turn by 180°” to compare.',
      symT: 'Find the symmetry',
      symTask: 'Drag a line across the figure to draw a line of symmetry. Tap the centre of symmetry if the figure has point symmetry.',
      foundAxes0: 'No line drawn yet',
      foundAxes1: '1 line of symmetry drawn',
      foundAxesN: '{n} lines of symmetry drawn',
      foundCenter: 'Centre of symmetry found',
      noCenter: 'No centre marked',
      okAxis: 'That is a line of symmetry!',
      badAxis: 'The mirror image (red) does not fit onto the figure.',
      dupAxis: 'You already have this line.',
      okCenter: 'That is the centre of symmetry!',
      badCenter: 'After a half turn about this point (red) the figure does not fit onto itself.',
      checkOk: 'Correct – you found everything!',
      checkMissAxes: 'Some lines of symmetry are still missing.',
      checkMissCenter: 'The figure also has point symmetry – where is the centre?',
      solved: 'Completely solved: {n}',
      merkeT: 'Remember',
      merke: 'A figure has line symmetry if reflecting it in a line (line of symmetry) maps it onto itself. It has point symmetry if a half turn (180°) about a point Z maps it onto itself.',
      check: 'Check',
      next: 'Next figure',
      solution: 'Solution',
      invalid: 'That would no longer be a proper figure.',
      distRead: '{p}: {d}',
      keepRead: '|AB| = |A′B′| {l}, angle at {at}: {w}',
      orientRead: '{o}: {d1}; {i}: {d2} ({r})',
      symRead0: 'no line of symmetry',
      symRead1: '1 line of symmetry',
      symReadN: '{n} lines of symmetry',
      symPoint: 'point symmetry',
      symNoPoint: 'no point symmetry',
      foundRead: '{a} line(s), centre: {z}',
      yes: 'yes',
      no: 'no',
      tapHint: 'Tip: “Solution” shows all lines and the centre.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const lang = ctx.lang as Lang;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const T = (o: { de: string; en: string }) => o[lang];
    const mode = () => p.mode as Mode;
    const shape = () => p.shape as ShapeKind;
    const wide = () => surface.width >= 640;
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    const col = {
      orig: () => ctx.theme.series[0]!,
      img: () => ctx.theme.series[1]!,
      mirror: () => ctx.theme.series[4]!,
      tick: () => ctx.theme.series[3]!,
      right: () => ctx.theme.series[2]!,
      ok: () => ctx.theme.series[2]!,
      bad: () => ctx.theme.series[1]!,
    };

    /* ---------- Zustand ---------- */
    const nPts = () => (shape() === 'viereck' ? 4 : 3);
    const figPts = (): Pt[] => {
      const all: Pt[] = [
        [p.ax, p.ay],
        [p.bx, p.by],
        [p.cx, p.cy],
        [p.dx, p.dy],
      ];
      return all.slice(0, nPts());
    };
    const P = (): Pt => [p.px, p.py];
    const Q = (): Pt => [p.qx, p.qy];
    const Z = (): Pt => [p.zx, p.zy];
    /** Abbildung des aktuellen Modus. */
    const mapPt = (q: Pt): Pt => (mode() === 'punkt' ? reflectPoint(q, Z()) : reflectAcross(q, P(), Q()));

    const anim = new Tween(1700, ease.inOutCubic);
    let animKind: 'fold' | 'turn' = 'fold';
    const imgPop = new Tween(500, ease.outBack);
    let toast: { text: string; until: number } | null = null;

    // Symmetrie erkennen
    const FIG_SCALE = 1.25;
    let sym: Symmetry = symmetryOf(placeFigure(p.fig as FigId, p.rot, figCenter(), FIG_SCALE));
    let found: number[] = [];
    let centerFound = false;
    let revealed = false;
    let feedback: { text: string; ok: boolean } | null = null;
    let ghost: { kind: 'axis'; a: Pt; b: Pt } | { kind: 'point'; z: Pt } | null = null;
    const ghostTw = new Tween(1800, ease.linear);
    const axisPop = new Tween(600, ease.outCubic);
    let lastFound = -1;
    const centerPop = new Tween(500, ease.outBack);
    const burst = new Tween(1000, ease.outCubic);
    let checkResult: 'ok' | 'axes' | 'center' | null = null;
    let solvedCount = 0;
    let solvedThis = false;
    const solvedFigs = new Set<FigId>();

    let hits: Hit[] = [];
    let hover: string | null = null;
    let drag: Drag = null;

    function figCenter(): Pt {
      return [GRID_W / 2, GRID_H / 2];
    }

    /* ---------- Aufteilung ---------- */
    type Layout = { paper: Rect; cell: number; below: Rect; side: Rect | null };
    let layoutCache: { key: string; lay: Layout } | null = null;
    function layout(): Layout {
      const key = `${surface.width}x${surface.height}`;
      if (layoutCache?.key !== key) layoutCache = { key, lay: computeLayout() };
      return layoutCache.lay;
    }
    function computeLayout(): Layout {
      const W = surface.width;
      const H = surface.height;
      if (wide()) {
        const colW = Math.round(clamp(W * 0.34, 250, 310));
        const leftW = W - colW - 12;
        const cell = Math.min((leftW - 2) / (GRID_W + 1), (H * 0.7) / (GRID_H + 1));
        const pw = Math.floor(cell * (GRID_W + 1));
        const ph = Math.floor(cell * (GRID_H + 1));
        return {
          paper: { x: Math.round((leftW - pw) / 2), y: 2, w: pw, h: ph },
          cell,
          below: { x: 2, y: ph + 12, w: leftW - 4, h: H - ph - 14 },
          side: { x: W - colW, y: 2, w: colW - 2, h: H - 4 },
        };
      }
      const cell = (W - 4) / (GRID_W + 1);
      const pw = Math.floor(cell * (GRID_W + 1));
      const ph = Math.floor(cell * (GRID_H + 1));
      return { paper: { x: Math.round((W - pw) / 2), y: 2, w: pw, h: ph }, cell, below: { x: 2, y: ph + 10, w: W - 4, h: H - ph - 12 }, side: null };
    }

    function toPx(q: Pt): [number, number] {
      const { paper, cell } = layout();
      return [paper.x + (q[0] + 0.5) * cell, paper.y + (GRID_H + 0.5 - q[1]) * cell];
    }
    function toWorld(px: number, py: number): Pt {
      const { paper, cell } = layout();
      return [(px - paper.x) / cell - 0.5, GRID_H + 0.5 - (py - paper.y) / cell];
    }
    const snap = (q: Pt): Pt => [clamp(Math.round(q[0]), 0, GRID_W), clamp(Math.round(q[1]), 0, GRID_H)];

    /* ---------- Zahlen ---------- */
    const cm = (k: number) => {
      const v = k / 2;
      const exact = Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
      return `${exact ? '' : '≈ '}${exact ? fmt.num(v, 1) : fmt.fixed(v, 1)} cm`;
    };
    /** „= 2,5 cm“ bzw. „≈ 3,6 cm“. */
    const eqcm = (k: number) => {
      const t = cm(k);
      return t.startsWith('≈') ? t : `= ${t}`;
    };
    const deg = (a: number) => {
      const exact = Math.abs(a - Math.round(a)) < 1e-6;
      return `${exact ? '' : '≈ '}${fmt.num(Math.round(a), 0)}°`;
    };

    /** Benannte Punkte der Figur (beim Fähnchen A, B, C). */
    const ptNames = () => NAMES.slice(0, nPts());

    /** Winkel bei der ersten Ecke des Umlaufs (Dreieck/Viereck: bei A, Fähnchen: bei B). */
    function keyAngle(pts: Pt[]): { at: string; value: number } {
      const op = orientedPoints(shape(), pts);
      const v = angleAt(op[op.length - 1]!, op[0]!, op[1]!);
      return { at: shape() === 'fahne' ? 'B' : 'A', value: v };
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const m = mode();
      if (m === 'symmetrie') {
        ctx.readout('dist', null);
        ctx.readout('keep', null);
        ctx.readout('orient', null);
        ctx.readout('found', tr('foundRead', { a: found.length, z: ctx.t(centerFound ? 'yes' : 'no') }));
        ctx.readout('sym', symText());
        ctx.setAction('check', { enabled: !solvedThis });
        return;
      }
      ctx.readout('found', null);
      ctx.readout('sym', null);
      const pts = figPts();
      const names = ptNames();
      const d = pts.map((q, i) => tr('distRead', { p: names[i]!, d: cm(m === 'punkt' ? dist(q, Z()) : lineDistance(q, P(), Q())) }));
      ctx.readout('dist', `${ctx.t(m === 'punkt' ? 'distPoint' : 'distAxis')}: ${d.join(', ')}`);
      const ka = keyAngle(pts);
      ctx.readout('keep', tr('keepRead', { l: eqcm(dist(pts[0]!, pts[1]!)), at: ka.at, w: deg(ka.value) }));
      const op = orientedPoints(shape(), pts);
      const o1 = orientation(op);
      const o2 = orientation(op.map(mapPt));
      const on = shape() === 'fahne' ? 'BCM' : names.join('');
      const imgName = shape() === 'fahne' ? `B${PRIME}C${PRIME}M${PRIME}` : names.map((n) => n + PRIME).join('');
      ctx.readout('orient', tr('orientRead', { o: on, d1: ctx.t(o1 > 0 ? 'ccw' : 'cw'), i: imgName, d2: ctx.t(o2 > 0 ? 'ccw' : 'cw'), r: ctx.t(o1 === o2 ? 'same' : 'reversed') }));
      ctx.setAction('go', { label: ctx.t(m === 'punkt' ? 'goPoint' : 'goAxis'), enabled: !anim.running });
    }

    function symText(): string {
      const n = sym.axes.length;
      const a = n === 0 ? ctx.t('symRead0') : n === 1 ? ctx.t('symRead1') : tr('symReadN', { n });
      return `${a}, ${ctx.t(sym.center ? 'symPoint' : 'symNoPoint')}`;
    }

    /* ---------- Symmetrie erkennen ---------- */
    function resetSym(): void {
      sym = symmetryOf(placeFigure(p.fig as FigId, p.rot, figCenter(), FIG_SCALE));
      found = [];
      centerFound = false;
      revealed = false;
      feedback = null;
      ghost = null;
      checkResult = null;
      solvedThis = false;
    }

    function tryAxis(a: Pt, b: Pt): void {
      checkResult = null;
      const i = matchAxis(a, b, sym.axes);
      if (i >= 0) {
        if (found.includes(i)) feedback = { text: ctx.t('dupAxis'), ok: true };
        else {
          found = [...found, i];
          lastFound = i;
          axisPop.play();
          feedback = { text: ctx.t('okAxis'), ok: true };
        }
        ghost = null;
      } else {
        // Gerade durch die gezogene Linie: Spiegelbild zeigen
        ghost = { kind: 'axis', a, b };
        ghostTw.play();
        feedback = { text: ctx.t('badAxis'), ok: false };
      }
      updateReadouts();
    }

    function tryCenter(z: Pt): void {
      checkResult = null;
      if (sym.center && dist(z, sym.center) <= 0.75) {
        centerFound = true;
        centerPop.play();
        feedback = { text: ctx.t('okCenter'), ok: true };
        ghost = null;
      } else {
        ghost = { kind: 'point', z };
        ghostTw.play();
        feedback = { text: ctx.t('badCenter'), ok: false };
      }
      updateReadouts();
    }

    function check(): void {
      if (mode() !== 'symmetrie') return;
      if (found.length < sym.axes.length) checkResult = 'axes';
      else if (sym.center && !centerFound) checkResult = 'center';
      else {
        checkResult = 'ok';
        if (!solvedThis && !revealed) {
          solvedThis = true;
          solvedCount++;
          solvedFigs.add(p.fig as FigId);
          burst.play();
        }
      }
      feedback = null;
      updateReadouts();
      ctx.requestRender();
    }

    function nextFigure(): void {
      const others = FIG_IDS.filter((id) => id !== p.fig);
      const fig = others[Math.floor(Math.random() * others.length)]!;
      const rot = Math.floor(Math.random() * 12) * 15;
      ctx.set({ fig, rot });
    }

    /* ---------- Umklappen / Drehen ---------- */
    function startAnim(): void {
      if (ctx.locked || anim.running) return;
      animKind = mode() === 'punkt' ? 'turn' : 'fold';
      if (!p.show) ctx.set({ show: true });
      anim.play();
      updateReadouts();
      ctx.requestRender();
    }

    /** Lage eines Punktes während der Animation (t = 0 … 1). */
    function animPt(q: Pt, t: number): Pt {
      if (animKind === 'turn') {
        const z = Z();
        const a = Math.PI * t;
        const dx = q[0] - z[0];
        const dy = q[1] - z[1];
        return [z[0] + dx * Math.cos(a) - dy * Math.sin(a), z[1] + dx * Math.sin(a) + dy * Math.cos(a)];
      }
      const f = foot(q, P(), Q());
      const k = Math.cos(Math.PI * t);
      return [f[0] + (q[0] - f[0]) * k, f[1] + (q[1] - f[1]) * k];
    }

    function showToast(msg: string): void {
      toast = { text: msg, until: performance.now() + 1800 };
      ctx.requestRender();
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

    function wrap(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      str = str.replace(/ ([=∥]) /g, ' $1 ').replace(/ (cm|°)/g, ' $1');
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

    function textRows(rows: string[], x: number, y: number, lh: number, font: string, color: string): number {
      rows.forEach((row, i) => text(surface.g, row, x, y + i * lh, { font, color, align: 'left', baseline: 'middle' }));
      return rows.length * lh;
    }

    function title(x: number, y: number, label: string, color = ctx.theme.muted): void {
      text(surface.g, label, x, y, { font: `700 ${wide() ? 12 : 11}px ${ctx.theme.font}`, color, align: 'left' });
    }

    function haloText(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = font;
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
      text(g, label, r.x + r.w / 2, r.y + r.h / 2 + 0.5, { font: `700 ${wide() ? 12.5 : 12}px ${theme.font}`, color: filled ? onColor() : color });
      g.restore();
      if (enabled) hits.push({ id, r });
    }

    function unit(dx: number, dy: number): [number, number] {
      const l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    }

    /** Strichmarken quer zur Richtung d. */
    function ticks(mx: number, my: number, d: [number, number], n: number, color: string, len = 6): void {
      const g = surface.g;
      const nx = -d[1];
      const ny = d[0];
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2.2;
      g.lineCap = 'round';
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * 4.5;
        const cx = mx + d[0] * off;
        const cy = my + d[1] * off;
        g.beginPath();
        g.moveTo(cx - nx * len, cy - ny * len);
        g.lineTo(cx + nx * len, cy + ny * len);
        g.stroke();
      }
      g.restore();
    }

    /** Rechter Winkel (Viertelkreis mit Punkt) bei z zwischen den Pixelrichtungen d1 und d2. */
    function rightMark(z: [number, number], d1: [number, number], d2: [number, number], color: string, r = 11): void {
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

    /** Ganze Gerade durch a und b (Pixel), im Papier abgeschnitten. */
    function fullLine(a: [number, number], b: [number, number], color: string, width: number, dash?: number[]): void {
      const g = surface.g;
      const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
      const ext = 3000;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = width;
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(a[0] - ux * ext, a[1] - uy * ext);
      g.lineTo(b[0] + ux * ext, b[1] + uy * ext);
      g.stroke();
      g.restore();
    }

    /** Kreispfeil für den Umlaufsinn (Bildschirm: gegen den Uhrzeigersinn, wenn ccw). */
    function orientArrow(cx: number, cy: number, r: number, ccw: boolean, color: string): void {
      const g = surface.g;
      const start = ccw ? 0.35 : Math.PI - 0.35;
      const sweep = 4.9;
      const end = ccw ? start - sweep : start + sweep;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2.2;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(cx, cy, r, start, end, ccw);
      g.stroke();
      // Pfeilspitze tangential am Ende
      const ex = cx + Math.cos(end) * r;
      const ey = cy + Math.sin(end) * r;
      const tx = ccw ? Math.sin(end) : -Math.sin(end);
      const ty = ccw ? -Math.cos(end) : Math.cos(end);
      const hs = 6;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(ex + tx * hs, ey + ty * hs);
      g.lineTo(ex - tx * 1.5 - ty * hs * 0.75, ey - ty * 1.5 + tx * hs * 0.75);
      g.lineTo(ex - tx * 1.5 + ty * hs * 0.75, ey - ty * 1.5 - tx * hs * 0.75);
      g.closePath();
      g.fill();
      g.restore();
    }

    /* ---------- Zeichnen: Papier ---------- */
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

    /* ---------- Zeichnen: Figur ---------- */
    /**
     * Figur in Weltkoordinaten zeichnen. `names` beschriftet die Punkte
     * (null: keine Beschriftung), `alpha` blendet die Füllung.
     */
    function drawShape(pts: Pt[], color: string, names: string[] | null, fillA = 1, strokeA = 1, dashed = false, avoid?: (i: number) => [number, number] | null): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const px = pts.map(toPx);
      const cx = px.reduce((s, q) => s + q[0], 0) / px.length;
      const cy = px.reduce((s, q) => s + q[1], 0) / px.length;
      g.save();
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (dashed) g.setLineDash([6, 5]);
      const fa = (theme.dark ? 0.26 : 0.18) * fillA;
      if (shape() === 'fahne') {
        const [a, b, c] = pts as [Pt, Pt, Pt];
        const cloth = flagCloth(a, b, c).map(toPx);
        // Stange
        const pa = toPx(a);
        const pb = toPx(b);
        g.strokeStyle = withAlpha(color, strokeA);
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(pa[0], pa[1]);
        g.lineTo(pb[0], pb[1]);
        g.stroke();
        // Tuch
        g.beginPath();
        cloth.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.fillStyle = withAlpha(color, Math.min(1, fa * 2.2));
        g.fill();
        g.lineWidth = 2.4;
        g.stroke();
        // Kugel auf der Stange
        g.beginPath();
        g.arc(pb[0], pb[1], 3.2, 0, Math.PI * 2);
        g.fillStyle = withAlpha(color, strokeA);
        g.fill();
      } else {
        g.beginPath();
        px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.fillStyle = withAlpha(color, fa);
        g.fill();
        g.strokeStyle = withAlpha(color, strokeA);
        g.lineWidth = 2.6;
        g.stroke();
      }
      g.restore();
      if (!names) return;
      px.forEach(([x, y], i) => {
        let [ux, uy] = unit(x - cx, y - cy);
        // nicht auf die Konstruktionslinie durch den Punkt setzen
        const av = avoid?.(i);
        if (av) {
          let best = -Infinity;
          let bu: [number, number] = [ux, uy];
          for (const da of [0, 0.6, -0.6, 1.1, -1.1, 1.57, -1.57]) {
            const c = Math.cos(da);
            const sn = Math.sin(da);
            const cand: [number, number] = [ux * c - uy * sn, ux * sn + uy * c];
            const score = 1.3 * (1 - Math.abs(cand[0] * av[0] + cand[1] * av[1])) + 0.7 * (cand[0] * ux + cand[1] * uy);
            if (score > best) {
              best = score;
              bu = cand;
            }
          }
          [ux, uy] = bu;
        }
        const d = W ? 16 : 14;
        const { paper } = layout();
        const lx = clamp(x + ux * d, paper.x + 12, paper.x + paper.w - 12);
        const ly = clamp(y + uy * d, paper.y + 11, paper.y + paper.h - 11);
        haloText(names[i]!, lx, ly, `800 ${W ? 15 : 13}px ${theme.font}`, withAlpha(color, strokeA));
      });
    }

    /** Punkte (Kreise) einer Figur, mit Hervorhebung beim Ziehen. */
    function drawHandles(pts: Pt[], color: string, image: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      pts.forEach((q, i) => {
        const [x, y] = toPx(q);
        const id = `${image ? 'w' : 'v'}${i}`;
        const active = hover === id || (drag?.kind === 'vertex' && drag.i === i && drag.image === image);
        if (canEdit()) {
          g.beginPath();
          g.arc(x, y, active ? 14 : 11, 0, Math.PI * 2);
          g.fillStyle = withAlpha(color, active ? 0.28 : 0.13);
          g.fill();
        }
        g.beginPath();
        g.arc(x, y, 4.5, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.strokeStyle = color;
        g.lineWidth = 2.4;
        g.stroke();
      });
    }

    /** Umlaufsinn als Kreispfeil im Inneren (beim Fähnchen im Tuch). */
    function drawOrient(pts: Pt[], color: string): void {
      const op = orientedPoints(shape(), pts);
      const o = orientation(op);
      if (!o) return;
      const px = op.map(toPx);
      const cx = px.reduce((s, q) => s + q[0], 0) / px.length;
      const cy = px.reduce((s, q) => s + q[1], 0) / px.length;
      // Radius: passend zur Figurgröße (Abstand des Schwerpunkts von den Seiten)
      let r = 16;
      for (let i = 0; i < px.length; i++) {
        const a = px[i]!;
        const b = px[(i + 1) % px.length]!;
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const dd = Math.abs((b[0] - a[0]) * (a[1] - cy) - (a[0] - cx) * (b[1] - a[1])) / l;
        r = Math.min(r, dd * 0.62);
      }
      if (r < 5) return;
      orientArrow(cx, cy, r, o > 0, color);
    }

    /** Richtung der Konstruktionslinie durch den i-ten Punkt (Pixel), falls sie gezeichnet wird. */
    function avoidDir(pts: Pt[]): (i: number) => [number, number] | null {
      return (i) => {
        if (!p.constr && !p.fix) return null;
        const q = pts[i]!;
        const a = toPx(q);
        const b = toPx(mapPt(q));
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1) return null;
        return unit(b[0] - a[0], b[1] - a[1]);
      };
    }

    function drawAxisMode(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pts = figPts();
      const img = pts.map(mapPt);
      const names = ptNames() as unknown as string[];
      const cm2 = col.mirror();
      const a = toPx(P());
      const b = toPx(Q());
      const isPoint = mode() === 'punkt';
      const z = toPx(Z());
      const running = anim.running;
      const t = anim.value;

      // Fixgeraden (hinter allem)
      if (p.fix) {
        const fc = withAlpha(theme.text, theme.dark ? 0.35 : 0.3);
        pts.forEach((q, i) => {
          const qi = img[i]!;
          if (dist(q, qi) < 1e-9) return;
          fullLine(toPx(q), toPx(qi), fc, 1.2, [2, 4]);
        });
        if (isPoint) {
          // Beschriftung einer Fixgeraden
          const q = toPx(pts[0]!);
          const [ux, uy] = unit(q[0] - z[0], q[1] - z[1]);
          haloText(ctx.t('fixLine'), q[0] + ux * 46, q[1] + uy * 46 - 10, `600 ${W ? 11.5 : 10.5}px ${theme.font}`, theme.muted);
        }
      }

      // Spiegelachse bzw. Zentrum
      if (!isPoint) {
        fullLine(a, b, withAlpha(cm2, theme.dark ? 0.16 : 0.1), 12);
        fullLine(a, b, cm2, p.fix ? 3.4 : 2.6);
        // Name s am oberen Rand
        const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
        const { paper } = layout();
        const top = uy < 0 ? b : a;
        const dir: [number, number] = uy < 0 ? [ux, uy] : [-ux, -uy];
        // bis kurz vor den Rand
        let k = 0;
        while (k < 2000) {
          const x = top[0] + dir[0] * k;
          const y = top[1] + dir[1] * k;
          if (y < paper.y + 26 || x < paper.x + 18 || x > paper.x + paper.w - 18) break;
          k += 4;
        }
        const sx = top[0] + dir[0] * Math.max(0, k - 4);
        const sy = top[1] + dir[1] * Math.max(0, k - 4);
        haloText('s', sx + 12, sy + 4, `italic 700 ${W ? 18 : 16}px ${theme.mathFont}`, cm2);
        if (p.fix) haloText(ctx.t('fixLine'), sx + (W ? 52 : 46), sy + 4, `600 ${W ? 11.5 : 10.5}px ${theme.font}`, cm2);
      }

      // Konstruktionslinien
      if (p.constr && (p.show || running)) {
        const cc = withAlpha(theme.text, theme.dark ? 0.55 : 0.5);
        pts.forEach((q, i) => {
          const qi = img[i]!;
          if (dist(q, qi) < 1e-9) return;
          const a0 = toPx(q);
          const a1 = toPx(qi);
          const reveal = running ? clamp(t * 1.4, 0, 1) : 1;
          const end: [number, number] = [a0[0] + (a1[0] - a0[0]) * reveal, a0[1] + (a1[1] - a0[1]) * reveal];
          g.save();
          g.strokeStyle = cc;
          g.lineWidth = 1.6;
          g.setLineDash([5, 4]);
          g.beginPath();
          g.moveTo(a0[0], a0[1]);
          g.lineTo(end[0], end[1]);
          g.stroke();
          g.restore();
          if (running) return;
          const mid = isPoint ? Z() : foot(q, P(), Q());
          const m = toPx(mid);
          const d: [number, number] = unit(a1[0] - a0[0], a1[1] - a0[1]);
          ticks((a0[0] + m[0]) / 2, (a0[1] + m[1]) / 2, d, i + 1, col.tick());
          ticks((a1[0] + m[0]) / 2, (a1[1] + m[1]) / 2, d, i + 1, col.tick());
          if (!isPoint) {
            const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
            rightMark(m, [ux, uy], [-d[0], -d[1]], col.right(), W ? 10 : 9);
            g.beginPath();
            g.arc(m[0], m[1], 2.6, 0, Math.PI * 2);
            g.fillStyle = cm2;
            g.fill();
          }
        });
      }

      // Bildfigur
      const showImg = p.show && !running;
      if (showImg) {
        const s = imgPop.running ? Math.max(0.6, imgPop.value) : 1;
        g.save();
        if (s !== 1) {
          const c = img.map(toPx).reduce((acc, q) => [acc[0] + q[0] / img.length, acc[1] + q[1] / img.length], [0, 0]);
          g.translate(c[0], c[1]);
          g.scale(s, s);
          g.translate(-c[0], -c[1]);
        }
        drawShape(img, col.img(), names.map((n) => n + PRIME), 1, 1, false, avoidDir(img));
        if (p.orient) drawOrient(img, col.img());
        g.restore();
      } else if (running) {
        // Zielumriss schwach andeuten
        drawShape(img, col.img(), null, 0, 0.35, true);
      }

      // Original
      drawShape(pts, col.orig(), names, 1, 1, false, avoidDir(pts));
      if (p.orient) drawOrient(pts, col.orig());

      // Bewegte Figur
      if (running) {
        const moving = pts.map((q) => animPt(q, t));
        const k = animKind === 'fold' ? Math.cos(Math.PI * t) : 1;
        const c = t < 0.5 ? col.orig() : col.img();
        // Bahnen bei der Drehung
        if (animKind === 'turn') {
          g.save();
          g.strokeStyle = withAlpha(cm2, 0.6);
          g.lineWidth = 1.6;
          g.setLineDash([2, 4]);
          pts.forEach((q) => {
            const rr = dist(q, Z()) * layout().cell;
            const a0 = Math.atan2(-(q[1] - Z()[1]), q[0] - Z()[0]);
            g.beginPath();
            g.arc(z[0], z[1], rr, a0, a0 - Math.PI * t, true);
            g.stroke();
          });
          g.restore();
        }
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
        g.shadowBlur = 14;
        g.shadowOffsetY = 6 * Math.sin(Math.PI * t);
        drawShape(moving, c, null, 0.4 + 0.8 * Math.abs(k), 1);
        g.restore();
      }

      // Zentrum Z
      if (isPoint) {
        const active = hover === 'z' || drag?.kind === 'z';
        if (canEdit()) {
          g.beginPath();
          g.arc(z[0], z[1], active ? 15 : 12, 0, Math.PI * 2);
          g.fillStyle = withAlpha(cm2, active ? 0.28 : 0.14);
          g.fill();
        }
        g.beginPath();
        g.arc(z[0], z[1], 6.5, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.strokeStyle = cm2;
        g.lineWidth = 2.6;
        g.stroke();
        g.beginPath();
        g.arc(z[0], z[1], 2.6, 0, Math.PI * 2);
        g.fillStyle = cm2;
        g.fill();
        haloText(p.fix ? `Z (${ctx.t('fixPt')})` : 'Z', z[0] + 12, z[1] - 14, `800 ${W ? 15 : 13}px ${theme.font}`, cm2, 'left');
      } else {
        // Punkte P und Q der Achse (ziehbar)
        for (const [id, q] of [
          ['p', a],
          ['q', b],
        ] as ['p' | 'q', [number, number]][]) {
          const active = hover === id || (drag?.kind === 'pq' && drag.which === id);
          if (canEdit()) {
            g.beginPath();
            g.arc(q[0], q[1], active ? 14 : 11, 0, Math.PI * 2);
            g.fillStyle = withAlpha(cm2, active ? 0.28 : 0.14);
            g.fill();
          }
          g.save();
          g.translate(q[0], q[1]);
          g.rotate(Math.PI / 4);
          g.fillStyle = theme.bg;
          g.fillRect(-4.5, -4.5, 9, 9);
          g.strokeStyle = cm2;
          g.lineWidth = 2.2;
          g.strokeRect(-4.5, -4.5, 9, 9);
          g.restore();
        }
      }

      drawHandles(pts, col.orig(), false);
      if (showImg) drawHandles(img, col.img(), true);
    }

    /* ---------- Zeichnen: Symmetrie erkennen ---------- */
    function drawSymMode(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const polys = placeFigure(p.fig as FigId, p.rot, figCenter(), FIG_SCALE);
      const cm2 = col.mirror();
      const c = toPx(sym.centroid);

      // Achsen: gefundene kräftig, bei „Lösung“ auch die übrigen
      sym.axes.forEach((ax, i) => {
        const isFound = found.includes(i);
        if (!isFound && !revealed) return;
        const d: [number, number] = [Math.cos((ax.angle * Math.PI) / 180), -Math.sin((ax.angle * Math.PI) / 180)];
        const grow = isFound && i === lastFound && axisPop.running ? axisPop.value : 1;
        const len = 1600 * grow;
        g.save();
        g.strokeStyle = isFound ? cm2 : withAlpha(cm2, 0.55);
        g.lineWidth = isFound ? 2.6 : 2;
        g.setLineDash(isFound ? [14, 5, 2, 5] : [5, 6]);
        g.beginPath();
        g.moveTo(c[0] - d[0] * len, c[1] - d[1] * len);
        g.lineTo(c[0] + d[0] * len, c[1] + d[1] * len);
        g.stroke();
        g.restore();
      });

      // Figur
      const fill = withAlpha(col.orig(), theme.dark ? 0.26 : 0.17);
      g.save();
      g.beginPath();
      for (const poly of polys) {
        poly.map(toPx).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
      }
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.fillStyle = fill;
      g.fill('evenodd');
      g.restore();
      g.save();
      g.beginPath();
      for (const poly of polys) {
        poly.map(toPx).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
      }
      g.strokeStyle = col.orig();
      g.lineWidth = 2.6;
      g.lineJoin = 'round';
      g.stroke();
      g.restore();

      // Fehlversuch: Bild der Figur in Rot
      if (ghost && ghostTw.running) {
        const a = 1 - ghostTw.t ** 3;
        const gh = ghost;
        const map = gh.kind === 'axis' ? (q: Pt) => reflectAcross(q, gh.a, gh.b) : (q: Pt) => reflectPoint(q, gh.z);
        g.save();
        g.globalAlpha = a;
        g.beginPath();
        for (const poly of polys) {
          poly.map(map).map(toPx).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
        }
        g.fillStyle = withAlpha(col.bad(), 0.1);
        g.fill('evenodd');
        g.strokeStyle = col.bad();
        g.lineWidth = 2.2;
        g.setLineDash([6, 4]);
        g.stroke();
        g.setLineDash([]);
        if (gh.kind === 'axis') fullLine(toPx(gh.a), toPx(gh.b), withAlpha(col.bad(), 0.8), 2, [10, 5]);
        else {
          const zz = toPx(gh.z);
          g.beginPath();
          g.arc(zz[0], zz[1], 5, 0, Math.PI * 2);
          g.fillStyle = col.bad();
          g.fill();
        }
        g.restore();
      }

      // Symmetriezentrum
      if (sym.center && (centerFound || revealed)) {
        const s = centerFound && centerPop.running ? Math.max(0.4, centerPop.value) : 1;
        g.save();
        g.translate(c[0], c[1]);
        g.scale(s, s);
        g.beginPath();
        g.arc(0, 0, 7, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.strokeStyle = centerFound ? cm2 : withAlpha(cm2, 0.6);
        g.lineWidth = 2.6;
        if (!centerFound) g.setLineDash([3, 3]);
        g.stroke();
        g.beginPath();
        g.arc(0, 0, 2.8, 0, Math.PI * 2);
        g.fillStyle = cm2;
        g.fill();
        g.restore();
        haloText('Z', c[0] + 12, c[1] - 13, `800 ${W ? 15 : 13}px ${theme.font}`, cm2, 'left');
      }

      // Gerade, die gerade gezeichnet wird
      if (drag?.kind === 'pen') {
        const a = drag.startPx;
        const b = drag.curPx;
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 8) {
          fullLine(a, b, withAlpha(theme.text, 0.25), 1.4, [4, 6]);
          g.save();
          g.strokeStyle = theme.text;
          g.lineWidth = 2.4;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
          g.stroke();
          g.restore();
        }
      }

      // Jubel
      if (burst.running) {
        const t = burst.value;
        g.save();
        for (let i = 0; i < 18; i++) {
          const ang = (i / 18) * Math.PI * 2 + 0.2;
          const rr = 30 + t * (80 + (i % 3) * 20);
          g.globalAlpha = 1 - burst.t;
          g.fillStyle = theme.series[i % theme.series.length]!;
          g.beginPath();
          g.arc(c[0] + Math.cos(ang) * rr, c[1] + Math.sin(ang) * rr, 4 * (1 - t * 0.5), 0, Math.PI * 2);
          g.fill();
        }
        g.restore();
      }
    }

    function drawToast(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { paper } = layout();
      const now = performance.now();
      if (!toast || now >= toast.until) {
        toast = null;
        return;
      }
      const a = clamp((toast.until - now) / 300, 0, 1);
      const font = `700 ${wide() ? 12.5 : 11.5}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(toast.text).width + 24;
      const h = wide() ? 28 : 26;
      const x = paper.x + (paper.w - w) / 2;
      const y = paper.y + 10;
      g.save();
      g.globalAlpha = a;
      g.fillStyle = theme.dark ? '#2a1620' : '#fff1f4';
      roundRect(g, x, y, w, h, 10);
      g.fill();
      g.strokeStyle = withAlpha(col.bad(), 0.7);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, toast.text, x + w / 2, y + h / 2 + 0.5, { font, color: col.bad() });
      g.restore();
    }

    /* ---------- Karten ---------- */
    function ruleCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      const isPoint = mode() === 'punkt';
      card(R, col.mirror(), 0.04);
      title(R.x + pad, R.y + 16, ctx.t(isPoint ? 'rulePointT' : 'ruleAxisT'), col.mirror());
      const f = `600 ${W ? 13 : 12}px ${theme.font}`;
      const lh = W ? 18 : 16;
      let y = R.y + (W ? 30 : 28);
      const rows = wrap(ctx.t(isPoint ? 'rulePoint' : 'ruleAxis'), R.w - 2 * pad, f);
      y += textRows(rows, R.x + pad, y + lh / 2, lh, f, theme.text) + (W ? 8 : 6);
      // Abstände je Punkt
      const pts = figPts();
      const names = ptNames();
      const bottom = R.y + R.h - 8;
      if (!p.show) {
        const hf = `500 ${W ? 12 : 11.5}px ${theme.font}`;
        const hr = wrap(ctx.t(isPoint ? 'hiddenImageP' : 'hiddenImage'), R.w - 2 * pad, hf);
        if (y + hr.length * 15 <= bottom) textRows(hr, R.x + pad, y + 7, 15, hf, theme.muted);
        return;
      }
      if (y + 22 > bottom) return;
      title(R.x + pad, y + 6, ctx.t(isPoint ? 'distPoint' : 'distAxis'));
      y += 22;
      const colW = (R.w - 2 * pad) / Math.min(4, pts.length);
      const df = `700 ${W ? 12.5 : 11.5}px ${theme.font}`;
      pts.forEach((q, i) => {
        const x = R.x + pad + i * colW;
        const d = isPoint ? dist(q, Z()) : lineDistance(q, P(), Q());
        const n = names[i]!;
        if (y + 10 > bottom) return;
        // Strichmarken wie im Bild
        ticks(x + 6, y, [1, 0], i + 1, col.tick(), 5);
        const label = `${n}, ${n}${PRIME}: ${cm(d)}`;
        text(g, label, x + 14 + i * 2.5, y, { font: df, color: theme.text, align: 'left' });
      });
      if (!W && p.fix && y + 34 < bottom) {
        const ff = `500 11.5px ${theme.font}`;
        textRows(wrap(ctx.t(isPoint ? 'fixPoint' : 'fixAxis'), R.w - 2 * pad, ff), R.x + pad, y + 22, 15, ff, theme.muted);
      }
    }

    function keepCard(R: Rect): number {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      const isPoint = mode() === 'punkt';
      const pts = figPts();
      const names = ptNames();
      const rows: { label: string; value: string; ok: boolean; sub?: string }[] = [];
      const l1 = dist(pts[0]!, pts[1]!);
      rows.push({ label: ctx.t('lengths'), value: `|AB| = |A${PRIME}B${PRIME}| ${eqcm(l1)}`, ok: true });
      const ka = keyAngle(pts);
      rows.push({ label: ctx.t('angles'), value: `${tr('angleAt', { p: ka.at })} = ${tr('angleAt', { p: ka.at + PRIME })}: ${deg(ka.value)}`, ok: true });
      const op = orientedPoints(shape(), pts);
      const o1 = orientation(op);
      const o2 = orientation(op.map(mapPt));
      const nm = shape() === 'fahne' ? 'BCM' : names.join('');
      rows.push({ label: ctx.t('orientT'), value: ctx.t(o1 === o2 ? 'same' : 'reversed'), ok: o1 === o2, sub: `${nm}: ${ctx.t(o1 > 0 ? 'ccw' : 'cw')} · ${nm.split('').map((n) => n + PRIME).join('')}: ${ctx.t(o2 > 0 ? 'ccw' : 'cw')}` });
      if (isPoint) rows.push({ label: ctx.t(W ? 'parallel' : 'parallelShort'), value: `AB ∥ A${PRIME}B${PRIME}`, ok: true });
      const f = `600 ${W ? 12 : 11.5}px ${theme.font}`;
      const vf = `700 ${W ? 13 : 12}px ${theme.font}`;
      const sf = `500 ${W ? 11.5 : 11}px ${theme.font}`;
      // Handy: Name und Wert in einer Zeile
      const labelW = W ? 0 : 84;
      const rowH = (r: (typeof rows)[number]) => (W ? 40 : 24) + (r.sub ? wrap(r.sub, R.w - 2 * pad - 26, sf).length * 14 + (W ? 0 : 2) : 0);
      const h = Math.min(R.h, (W ? 34 : 30) + rows.reduce((s, r) => s + rowH(r), 0) + 4);
      card({ x: R.x, y: R.y, w: R.w, h });
      title(R.x + pad, R.y + 16, ctx.t('keepT'));
      let y = R.y + (W ? 30 : 28);
      for (const r of rows) {
        const hh = rowH(r);
        if (y + hh > R.y + h + 2) break;
        // Häkchen bzw. Pfeil
        const cc = r.ok ? col.ok() : col.tick();
        g.beginPath();
        g.arc(R.x + pad + 8, y + 11, 8, 0, Math.PI * 2);
        g.fillStyle = cc;
        g.fill();
        text(g, r.ok ? '✓' : '↺', R.x + pad + 8, y + 11.5, { font: `800 10px ${theme.font}`, color: onColor() });
        text(g, r.label, R.x + pad + 24, y + 11, { font: f, color: theme.muted, align: 'left' });
        text(g, r.value, R.x + pad + 24 + labelW, y + (W ? 28 : 11), { font: vf, color: theme.text, align: 'left' });
        if (r.sub) textRows(wrap(r.sub, R.w - 2 * pad - 26, sf), R.x + pad + 24, y + (W ? 44 : 27), 14, sf, theme.muted);
        y += hh;
      }
      return h;
    }

    function fixHeight(w: number): number {
      const rows = wrap(ctx.t(mode() === 'punkt' ? 'fixPoint' : 'fixAxis'), w - 28, `500 12.5px ${ctx.theme.font}`);
      return 34 + rows.length * 17 + 10;
    }

    function merkeHeight(w: number): number {
      const rows = wrap(ctx.t('merke'), w - 28, `500 12.5px ${ctx.theme.font}`);
      return 32 + rows.length * 17 + 10;
    }

    function fixCard(R: Rect): void {
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      const isPoint = mode() === 'punkt';
      const f = `500 ${W ? 12.5 : 12}px ${theme.font}`;
      const lh = W ? 17 : 16;
      const rows = wrap(ctx.t(isPoint ? 'fixPoint' : 'fixAxis'), R.w - 2 * pad, f);
      const h = Math.min(R.h, 34 + rows.length * lh + 10);
      if (h < 50) return;
      card({ x: R.x, y: R.y, w: R.w, h }, p.fix ? col.mirror() : undefined, p.fix ? 0.05 : 0);
      title(R.x + pad, R.y + 16, ctx.t('fixT'));
      textRows(rows, R.x + pad, R.y + 34 + lh / 2, lh, f, theme.text);
      if (!ctx.locked) hits.push({ id: 'fixcard', r: { x: R.x, y: R.y, w: R.w, h } });
    }

    function stepsCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pad = 14;
      const f = `500 12.5px ${theme.font}`;
      const lh = 16.5;
      const steps = ctx.t(mode() === 'punkt' ? 'stepsPoint' : 'stepsAxis').split('|').map((st) => wrap(st, R.w - 2 * pad - 26, f));
      const h = 34 + steps.reduce((acc, rows) => acc + rows.length * lh + 8, 0) + 4;
      if (h > R.h) return;
      card({ x: R.x, y: R.y, w: R.w, h });
      title(R.x + pad, R.y + 16, ctx.t('stepsT'));
      let y = R.y + 32;
      steps.forEach((rows, i) => {
        g.beginPath();
        g.arc(R.x + pad + 9, y + lh / 2, 9, 0, Math.PI * 2);
        g.fillStyle = withAlpha(col.mirror(), theme.dark ? 0.3 : 0.15);
        g.fill();
        text(g, String(i + 1), R.x + pad + 9, y + lh / 2 + 0.5, { font: `800 11px ${theme.font}`, color: col.mirror() });
        y += textRows(rows, R.x + pad + 26, y + lh / 2, lh, f, theme.text) + 8;
      });
    }

    /** Kleine Bildchen aller Figuren; gelöste mit Häkchen. */
    function galleryCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('gallery'));
      if (!ctx.locked) text(g, ctx.t('galleryHint'), R.x + R.w - pad, R.y + 16, { font: `500 ${W ? 11.5 : 11}px ${theme.font}`, color: theme.muted, align: 'right' });
      const n = FIG_IDS.length;
      const gap = W ? 8 : 4;
      const bw = (R.w - 2 * pad - gap * (n - 1)) / n;
      const bh = Math.min(R.h - 38, bw * 1.05, W ? 64 : 48);
      const y0 = R.y + 30 + Math.max(0, (R.h - 38 - bh) / 2);
      FIG_IDS.forEach((id, i) => {
        const x = R.x + pad + i * (bw + gap);
        const on = id === p.fig;
        const hov = hover === `fig:${id}`;
        g.fillStyle = on ? withAlpha(col.orig(), theme.dark ? 0.22 : 0.12) : hov ? withAlpha(theme.text, 0.06) : 'transparent';
        roundRect(g, x, y0, bw, bh, 9);
        g.fill();
        g.strokeStyle = on ? col.orig() : withAlpha(theme.text, theme.dark ? 0.18 : 0.12);
        g.lineWidth = on ? 1.8 : 1;
        g.stroke();
        // Figur einpassen
        const polys = placeFigure(id, 0, [0, 0]);
        const all = polys.flat();
        const xs = all.map((q) => q[0]);
        const ys = all.map((q) => q[1]);
        const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
        const k = (Math.min(bw, bh) * 0.66) / span;
        const cx = x + bw / 2;
        const cy = y0 + bh / 2;
        const mx = (Math.max(...xs) + Math.min(...xs)) / 2;
        const my = (Math.max(...ys) + Math.min(...ys)) / 2;
        g.beginPath();
        for (const poly of polys) {
          poly.forEach(([px, py], j) => {
            const X = cx + (px - mx) * k;
            const Y = cy - (py - my) * k;
            if (j) g.lineTo(X, Y);
            else g.moveTo(X, Y);
          });
          g.closePath();
        }
        g.fillStyle = withAlpha(col.orig(), on ? 0.35 : 0.18);
        g.fill('evenodd');
        g.strokeStyle = on ? col.orig() : withAlpha(theme.text, 0.55);
        g.lineWidth = 1.4;
        g.lineJoin = 'round';
        g.stroke();
        if (solvedFigs.has(id)) {
          g.beginPath();
          g.arc(x + bw - 7, y0 + 7, 7, 0, Math.PI * 2);
          g.fillStyle = col.ok();
          g.fill();
          text(g, '✓', x + bw - 7, y0 + 7.5, { font: `800 9px ${theme.font}`, color: onColor() });
        }
        if (!ctx.locked) hits.push({ id: `fig:${id}`, r: { x, y: y0, w: bw, h: bh } });
      });
    }

    function symCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      const ok = checkResult === 'ok';
      card(R, ok ? col.ok() : col.mirror(), ok ? 0.07 : 0.03);
      title(R.x + pad, R.y + 16, ctx.t('symT'));
      let y = R.y + (W ? 34 : 32);
      text(g, T(FIG_NAME[p.fig as FigId]), R.x + pad, y, { font: `800 ${W ? 17 : 15}px ${theme.font}`, color: theme.text, align: 'left' });
      y += W ? 16 : 14;
      const lh = W ? 16.5 : 15.5;
      const f = `500 ${W ? 12.5 : 12}px ${theme.font}`;
      const bh = 28;
      const btnY = R.y + R.h - (W ? 12 : 10) - bh;
      // Aufgabe (nur solange nichts gefunden ist bzw. Platz da ist)
      const taskRows = wrap(ctx.t('symTask'), R.w - 2 * pad, f);
      // Fortschritt
      const prog: { txt: string; on: boolean }[] = [
        { txt: found.length === 0 ? ctx.t('foundAxes0') : found.length === 1 ? ctx.t('foundAxes1') : tr('foundAxesN', { n: found.length }), on: found.length > 0 },
        { txt: ctx.t(centerFound ? 'foundCenter' : 'noCenter'), on: centerFound },
      ];
      // Rückmeldung
      let fbTxt: { head: string; body: string; color: string } | null = null;
      if (checkResult === 'ok') fbTxt = { head: `✓ ${ctx.t('checkOk')}`, body: T(FIG_NOTE[p.fig as FigId]), color: col.ok() };
      else if (checkResult === 'axes') fbTxt = { head: `✗ ${ctx.t('checkMissAxes')}`, body: '', color: col.bad() };
      else if (checkResult === 'center') fbTxt = { head: `✗ ${ctx.t('checkMissCenter')}`, body: '', color: col.bad() };
      else if (revealed) fbTxt = { head: ctx.t('solution'), body: T(FIG_NOTE[p.fig as FigId]), color: col.mirror() };
      else if (feedback) fbTxt = { head: `${feedback.ok ? '✓' : '✗'} ${feedback.text}`, body: '', color: feedback.ok ? col.ok() : col.bad() };
      const fbFont = `700 ${W ? 12.5 : 12}px ${theme.font}`;
      const fbRows = fbTxt ? wrap(fbTxt.head, R.w - 2 * pad, fbFont) : [];
      const bodyRows = fbTxt && fbTxt.body ? wrap(fbTxt.body, R.w - 2 * pad, f) : [];
      const needFb = (fbRows.length + bodyRows.length) * lh + (fbTxt ? 6 : 0);
      const needProg = prog.length * 20 + 6;
      const avail = btnY - 8 - y;
      const showTask = avail - needFb - needProg >= taskRows.length * lh;
      if (showTask) y += textRows(taskRows, R.x + pad, y + lh / 2, lh, f, theme.text) + 6;
      for (const pr of prog) {
        g.beginPath();
        g.arc(R.x + pad + 7, y + 9, 7, 0, Math.PI * 2);
        if (pr.on) {
          g.fillStyle = col.mirror();
          g.fill();
          text(g, '✓', R.x + pad + 7, y + 9.5, { font: `800 9.5px ${theme.font}`, color: onColor() });
        } else {
          g.strokeStyle = withAlpha(theme.text, 0.35);
          g.lineWidth = 1.5;
          g.stroke();
        }
        text(g, pr.txt, R.x + pad + 21, y + 9, { font: `600 ${W ? 12.5 : 12}px ${theme.font}`, color: pr.on ? theme.text : theme.muted, align: 'left' });
        y += 20;
      }
      y += 6;
      if (fbTxt) {
        y += textRows(fbRows, R.x + pad, y + lh / 2, lh, fbFont, fbTxt.color);
        const maxRows = Math.max(0, Math.floor((btnY - 6 - y) / lh));
        textRows(bodyRows.slice(0, maxRows), R.x + pad, y + lh / 2, lh, f, theme.text);
      }
      if (!ctx.locked) {
        g.font = `700 ${W ? 12.5 : 12}px ${theme.font}`;
        const nextW = g.measureText(ctx.t('next')).width + 26;
        const checkW = g.measureText(ctx.t('check')).width + 26;
        button({ x: R.x + R.w - pad - nextW, y: btnY, w: nextW, h: bh }, ctx.t('next'), 'next', theme.series[0]!, ok);
        if (!ok) button({ x: R.x + R.w - pad - nextW - 8 - checkW, y: btnY, w: checkW, h: bh }, ctx.t('check'), 'check', col.mirror(), true);
        const sf = `600 ${W ? 11.5 : 11}px ${theme.font}`;
        const leftW = R.w - 2 * pad - nextW - (ok ? 0 : checkW + 8) - 8;
        if (leftW > 60) {
          const sr = wrap(tr('solved', { n: solvedCount }), leftW, sf);
          textRows(sr.slice(0, 2), R.x + pad, btnY + bh / 2 - ((Math.min(2, sr.length) - 1) * 13) / 2, 13, sf, theme.muted);
        }
      }
    }

    function merkeCard(R: Rect): void {
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('merkeT'));
      const f = `500 ${W ? 12.5 : 12}px ${theme.font}`;
      const lh = W ? 17 : 16;
      const rows = wrap(ctx.t('merke'), R.w - 2 * pad, f);
      const n = Math.min(rows.length, Math.floor((R.h - 38) / lh));
      textRows(rows.slice(0, n), R.x + pad, R.y + 32 + lh / 2, lh, f, theme.text);
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      hits = [];
      surface.begin();
      const lay = layout();
      const g = surface.g;
      drawPaper(lay.paper, lay.cell);
      g.save();
      roundRect(g, lay.paper.x, lay.paper.y, lay.paper.w, lay.paper.h, 10);
      g.clip();
      if (mode() === 'symmetrie') drawSymMode();
      else drawAxisMode();
      drawToast();
      g.restore();
      g.strokeStyle = ctx.theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, lay.paper.x + 0.5, lay.paper.y + 0.5, lay.paper.w - 1, lay.paper.h - 1, 10);
      g.stroke();

      if (mode() === 'symmetrie') {
        if (lay.side) {
          const mh = merkeHeight(lay.side.w);
          symCard({ x: lay.side.x, y: lay.side.y, w: lay.side.w, h: lay.side.h - mh - 10 });
          merkeCard({ x: lay.side.x, y: lay.side.y + lay.side.h - mh, w: lay.side.w, h: mh });
          galleryCard(lay.below);
        } else {
          const gh = 84;
          symCard({ x: lay.below.x, y: lay.below.y, w: lay.below.w, h: lay.below.h - gh - 8 });
          galleryCard({ x: lay.below.x, y: lay.below.y + lay.below.h - gh, w: lay.below.w, h: gh });
        }
      } else if (lay.side) {
        ruleCard(lay.below);
        const h = keepCard(lay.side);
        let y = lay.side.y + h + 10;
        const fh = fixHeight(lay.side.w);
        fixCard({ x: lay.side.x, y, w: lay.side.w, h: fh });
        y += fh + 10;
        stepsCard({ x: lay.side.x, y, w: lay.side.w, h: lay.side.y + lay.side.h - y });
      } else {
        const rh = 122;
        ruleCard({ x: lay.below.x, y: lay.below.y, w: lay.below.w, h: rh });
        keepCard({ x: lay.below.x, y: lay.below.y + rh + 8, w: lay.below.w, h: lay.below.h - rh - 8 });
      }

      const wasRunning = anim.running;
      if (wasRunning || imgPop.running || ghostTw.running || axisPop.running || centerPop.running || burst.running || toast) ctx.requestRender();
      if (!wasRunning && animDone === false) {
        animDone = true;
        imgPop.play();
        updateReadouts();
        ctx.requestRender();
      }
      if (wasRunning) animDone = false;
    }
    let animDone = true;

    /* ---------- Zeiger ---------- */
    const canEdit = () => !ctx.locked && mode() !== 'symmetrie' && !anim.running;

    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
      }
      const { paper } = layout();
      const inPaper = px >= paper.x && px <= paper.x + paper.w && py >= paper.y && py <= paper.y + paper.h;
      if (!inPaper) return null;
      if (mode() === 'symmetrie') return ctx.locked ? null : 'pen';
      if (!canEdit()) return null;
      const R = wide() ? 18 : 22;
      const near = (q: Pt) => {
        const [x, y] = toPx(q);
        return Math.hypot(px - x, py - y);
      };
      if (mode() === 'punkt' && near(Z()) < R) return 'z';
      if (mode() === 'achse') {
        if (near(P()) < R) return 'p';
        if (near(Q()) < R) return 'q';
      }
      const pts = figPts();
      let best: string | null = null;
      let bd = R;
      pts.forEach((q, i) => {
        const d = near(q);
        if (d < bd) {
          bd = d;
          best = `v${i}`;
        }
      });
      if (p.show) {
        pts.map(mapPt).forEach((q, i) => {
          const d = near(q);
          if (d < bd) {
            bd = d;
            best = `w${i}`;
          }
        });
      }
      if (best) return best;
      if (insideFigure(px, py)) return 'body';
      if (mode() === 'achse') {
        const a = toPx(P());
        const b = toPx(Q());
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const d = Math.abs((b[0] - a[0]) * (a[1] - py) - (a[0] - px) * (b[1] - a[1])) / l;
        if (d < 9) return 'axis';
      }
      return null;
    }

    function insideFigure(px: number, py: number): boolean {
      const pts = figPts();
      const poly = (shape() === 'fahne' ? flagCloth(pts[0]!, pts[1]!, pts[2]!) : pts).map(toPx);
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i]!;
        const [xj, yj] = poly[j]!;
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) return true;
      if (shape() === 'fahne') {
        // auch die Stange greifen
        const a = toPx(pts[0]!);
        const b = toPx(pts[1]!);
        const l2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 || 1;
        const t = clamp(((px - a[0]) * (b[0] - a[0]) + (py - a[1]) * (b[1] - a[1])) / l2, 0, 1);
        return Math.hypot(px - a[0] - t * (b[0] - a[0]), py - a[1] - t * (b[1] - a[1])) < 8;
      }
      return false;
    }

    function setFigure(pts: Pt[]): void {
      if (!shapeValid(shape(), pts)) {
        if (!toast) showToast(ctx.t('invalid'));
        return;
      }
      const keys = ['a', 'b', 'c', 'd'];
      const vals: Record<string, number> = {};
      pts.forEach((q, i) => {
        vals[`${keys[i]}x`] = q[0];
        vals[`${keys[i]}y`] = q[1];
      });
      ctx.set(vals);
    }

    function tap(id: string): void {
      if (id === 'check') check();
      else if (id === 'next') {
        if (!ctx.locked) nextFigure();
      } else if (id === 'fixcard') ctx.set({ fix: !p.fix });
      else if (id.startsWith('fig:') && !ctx.locked) ctx.set({ fig: id.slice(4) as FigId, rot: 0 });
      ctx.requestRender();
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        const w = toWorld(q.px, q.py);
        if (id === 'pen') drag = { kind: 'pen', start: w, cur: w, startPx: [q.px, q.py], curPx: [q.px, q.py] };
        else if (id.startsWith('v') || id.startsWith('w')) drag = { kind: 'vertex', i: Number(id.slice(1)), image: id.startsWith('w') };
        else if (id === 'body') drag = { kind: 'body', start: w, orig: figPts() };
        else if (id === 'p' || id === 'q') drag = { kind: 'pq', which: id };
        else if (id === 'z') drag = { kind: 'z' };
        else if (id === 'axis') drag = { kind: 'axis', start: w, orig: [P(), Q()] };
        else {
          tap(id);
          return true;
        }
        surface.setCursor(id === 'pen' ? 'crosshair' : 'grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag) return;
        const w = toWorld(q.px, q.py);
        if (drag.kind === 'pen') {
          drag.cur = w;
          drag.curPx = [q.px, q.py];
          ctx.requestRender();
          return;
        }
        if (!canEdit()) return;
        if (drag.kind === 'vertex') {
          // Am Bildpunkt ziehen: Original ist das Bild des Bildes
          const target = drag.image ? snap(mapPt(w)) : snap(w);
          const pts = figPts();
          if (pts[drag.i]![0] === target[0] && pts[drag.i]![1] === target[1]) return;
          pts[drag.i] = target;
          setFigure(pts);
        } else if (drag.kind === 'body') {
          const o = drag.orig;
          let dx = Math.round(w[0] - drag.start[0]);
          let dy = Math.round(w[1] - drag.start[1]);
          dx = clamp(dx, -Math.min(...o.map((v) => v[0])), GRID_W - Math.max(...o.map((v) => v[0])));
          dy = clamp(dy, -Math.min(...o.map((v) => v[1])), GRID_H - Math.max(...o.map((v) => v[1])));
          setFigure(o.map((v) => [v[0] + dx, v[1] + dy] as Pt));
        } else if (drag.kind === 'pq') {
          const s = snap(w);
          const other = drag.which === 'p' ? Q() : P();
          if (s[0] === other[0] && s[1] === other[1]) return;
          if (drag.which === 'p') ctx.set({ px: s[0], py: s[1] });
          else ctx.set({ qx: s[0], qy: s[1] });
        } else if (drag.kind === 'axis') {
          const [a, b] = drag.orig;
          let dx = Math.round(w[0] - drag.start[0]);
          let dy = Math.round(w[1] - drag.start[1]);
          dx = clamp(dx, -Math.min(a[0], b[0]), GRID_W - Math.max(a[0], b[0]));
          dy = clamp(dy, -Math.min(a[1], b[1]), GRID_H - Math.max(a[1], b[1]));
          ctx.set({ px: a[0] + dx, py: a[1] + dy, qx: b[0] + dx, qy: b[1] + dy });
        } else if (drag.kind === 'z') {
          const s = snap(w);
          ctx.set({ zx: s[0], zy: s[1] });
        }
        ctx.requestRender();
      },
      pointerUp: () => {
        if (drag?.kind === 'pen' && mode() === 'symmetrie' && !ctx.locked) {
          const moved = Math.hypot(drag.curPx[0] - drag.startPx[0], drag.curPx[1] - drag.startPx[1]);
          if (moved < 10) tryCenter(drag.start);
          else if (moved >= 30) tryAxis(drag.start, drag.cur);
        }
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
        surface.setCursor(!id ? '' : id === 'pen' ? 'crosshair' : id === 'body' || id === 'axis' ? 'move' : /^[vwpqz]/.test(id) && id.length <= 2 ? 'grab' : 'pointer');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        if (changed.has('shape') && source === 'input') {
          ctx.set(SHAPE_DEFAULT[shape()]);
          return;
        }
        if (changed.has('fig') || changed.has('rot') || changed.has('mode') || source === 'replace' || source === 'init') resetSym();
        if (changed.has('mode')) anim.finish();
        updateReadouts();
      },

      action(id) {
        if (id === 'go') startAnim();
        else if (id === 'check') check();
        else if (id === 'solve') {
          revealed = true;
          checkResult = null;
          feedback = null;
          updateReadouts();
        } else if (id === 'next' && !ctx.locked) nextFigure();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});

