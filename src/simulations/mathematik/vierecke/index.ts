import { defineSimulation, ease, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  analyze,
  CLASSES,
  GRID_H,
  GRID_W,
  LEVEL,
  PARENTS,
  randomOf,
  requirements,
  sameQuad,
  validity,
  type Analysis,
  type Pt,
  type Quad,
  type QuadClass,
  type Req,
  type Validity,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'frei' | 'aufgabe' | 'einordnen';
type Lang = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const isMode =
  (...modes: Mode[]) =>
  (v: Record<string, unknown>) =>
    modes.includes(v.mode as Mode);

/* ------------------------------------------------------------------ */
/* Texte zu den Vierecksarten                                          */
/* ------------------------------------------------------------------ */

/** Überschrift (groß geschrieben). */
const TITLE: Record<QuadClass, { de: string; en: string }> = {
  quadrat: L('Quadrat', 'Square'),
  rechteck: L('Rechteck', 'Rectangle'),
  raute: L('Raute', 'Rhombus'),
  parallelogramm: L('Parallelogramm', 'Parallelogram'),
  gltrapez: L('Gleichschenkliges Trapez', 'Isosceles trapezium'),
  drachen: L('Drachenviereck', 'Kite'),
  trapez: L('Trapez', 'Trapezium'),
  viereck: L('Allgemeines Viereck', 'General quadrilateral'),
};

/** Mit unbestimmtem Artikel (Nominativ = Akkusativ, alle sächlich bzw. weiblich). */
const NOM: Record<QuadClass, { de: string; en: string }> = {
  quadrat: L('ein Quadrat', 'a square'),
  rechteck: L('ein Rechteck', 'a rectangle'),
  raute: L('eine Raute', 'a rhombus'),
  parallelogramm: L('ein Parallelogramm', 'a parallelogram'),
  gltrapez: L('ein gleichschenkliges Trapez', 'an isosceles trapezium'),
  drachen: L('ein Drachenviereck', 'a kite'),
  trapez: L('ein Trapez', 'a trapezium'),
  viereck: L('ein allgemeines Viereck', 'a general quadrilateral'),
};

/** Kurzname in Aufzählungen („auch: …“). */
const SHORT: Record<QuadClass, { de: string; en: string }> = {
  quadrat: L('Quadrat', 'square'),
  rechteck: L('Rechteck', 'rectangle'),
  raute: L('Raute', 'rhombus'),
  parallelogramm: L('Parallelogramm', 'parallelogram'),
  gltrapez: L('gleichschenkliges Trapez', 'isosceles trapezium'),
  drachen: L('Drachenviereck', 'kite'),
  trapez: L('Trapez', 'trapezium'),
  viereck: L('Viereck', 'quadrilateral'),
};

/** Beschriftung der Kästchen im Haus: erste Variante, die passt. */
const NODE: Record<QuadClass, { de: string[][]; en: string[][] }> = {
  quadrat: { de: [['Quadrat']], en: [['Square']] },
  rechteck: { de: [['Rechteck']], en: [['Rectangle']] },
  raute: { de: [['Raute']], en: [['Rhombus']] },
  parallelogramm: { de: [['Parallelogramm'], ['Parallelo-', 'gramm']], en: [['Parallelogram'], ['Parallelo-', 'gram']] },
  gltrapez: { de: [['gleichschenkliges', 'Trapez'], ['gleichschenkl.', 'Trapez'], ['gleich-', 'schenkl.', 'Trapez']], en: [['Isosceles', 'trapezium']] },
  drachen: { de: [['Drachenviereck'], ['Drachen-', 'viereck']], en: [['Kite']] },
  trapez: { de: [['Trapez']], en: [['Trapezium']] },
  viereck: { de: [['Viereck']], en: [['Quadrilateral'], ['Quadri-', 'lateral']] },
};

/** Definition und weitere Eigenschaften. */
const INFO: Record<QuadClass, { def: { de: string; en: string }; more: { de: string; en: string } }> = {
  viereck: {
    def: L('Vier Ecken und vier Seiten – mehr wird nicht verlangt.', 'Four corners and four sides – nothing more is required.'),
    more: L('Die Innenwinkel ergeben zusammen immer 360°. Jede Figur im Haus ist auch ein Viereck.', 'The interior angles always add up to 360°. Every shape in the house is a quadrilateral.'),
  },
  trapez: {
    def: L('Mindestens zwei Gegenseiten sind parallel.', 'At least one pair of opposite sides is parallel.'),
    more: L('Die parallelen Seiten heißen Grundseiten, die beiden anderen Schenkel.', 'The parallel sides are called bases, the other two sides legs.'),
  },
  gltrapez: {
    def: L('Ein Trapez, das achsensymmetrisch ist: Die Achse geht durch die Mitten der parallelen Seiten.', 'A trapezium with a line of symmetry through the midpoints of the parallel sides.'),
    more: L('Schenkel gleich lang · Diagonalen gleich lang · Winkel an einer Grundseite gleich groß.', 'Legs equal · diagonals equal · base angles equal.'),
  },
  drachen: {
    def: L('Ein Viereck, das zu einer Diagonalen achsensymmetrisch ist.', 'A quadrilateral that is symmetric about one of its diagonals.'),
    more: L('Zwei Paare gleich langer Nachbarseiten · Diagonalen senkrecht zueinander · die Achse halbiert die andere Diagonale.', 'Two pairs of equal adjacent sides · perpendicular diagonals · the axis bisects the other diagonal.'),
  },
  parallelogramm: {
    def: L('Beide Paare von Gegenseiten sind parallel.', 'Both pairs of opposite sides are parallel.'),
    more: L('Gegenseiten gleich lang · Gegenwinkel gleich groß · Diagonalen halbieren sich · punktsymmetrisch.', 'Opposite sides equal · opposite angles equal · diagonals bisect each other · point symmetry.'),
  },
  raute: {
    def: L('Alle vier Seiten sind gleich lang.', 'All four sides are equal.'),
    more: L('Gegenseiten parallel · Diagonalen halbieren sich und stehen senkrecht · die Diagonalen sind Symmetrieachsen · punktsymmetrisch.', 'Opposite sides parallel · diagonals bisect each other at right angles · the diagonals are lines of symmetry · point symmetry.'),
  },
  rechteck: {
    def: L('Alle vier Winkel sind rechte Winkel.', 'All four angles are right angles.'),
    more: L('Gegenseiten parallel und gleich lang · Diagonalen gleich lang, sie halbieren sich · zwei Symmetrieachsen · punktsymmetrisch.', 'Opposite sides parallel and equal · equal diagonals that bisect each other · two lines of symmetry · point symmetry.'),
  },
  quadrat: {
    def: L('Vier gleich lange Seiten und vier rechte Winkel.', 'Four equal sides and four right angles.'),
    more: L('Diagonalen gleich lang, sie halbieren sich und stehen senkrecht · vier Symmetrieachsen · punktsymmetrisch.', 'Equal diagonals that bisect each other at right angles · four lines of symmetry · point symmetry.'),
  },
};

/** Bedingungen der Definition (Checkliste). */
const REQ: Record<Req['id'], { de: string; en: string }> = {
  onePar: L('zwei Gegenseiten parallel', 'two opposite sides parallel'),
  parAC: L('a ∥ c', 'a ∥ c'),
  parBD: L('b ∥ d', 'b ∥ d'),
  midAxis: L('Symmetrieachse durch zwei Seitenmitten', 'line of symmetry through two midpoints of sides'),
  diagAxis: L('eine Diagonale ist Symmetrieachse', 'a diagonal is a line of symmetry'),
  sides4: L('vier gleich lange Seiten', 'four equal sides'),
  right4: L('vier rechte Winkel', 'four right angles'),
};

/** Lage der Kästchen im Haus: waagerecht (Anteil der Breite), Stockwerk aus LEVEL. */
const POS: Record<QuadClass, number> = {
  quadrat: 0.5,
  rechteck: 0.27,
  raute: 0.73,
  gltrapez: 0.16,
  parallelogramm: 0.5,
  drachen: 0.84,
  trapez: 0.33,
  viereck: 0.5,
};

/** Kleine Symbole der Vierecksarten (in einem 30 × 20-Feld). */
const ICON: Record<QuadClass, readonly Pt[]> = {
  quadrat: [
    [6, 1],
    [24, 1],
    [24, 19],
    [6, 19],
  ],
  rechteck: [
    [1, 4],
    [29, 4],
    [29, 17],
    [1, 17],
  ],
  raute: [
    [15, 0],
    [27, 10],
    [15, 20],
    [3, 10],
  ],
  parallelogramm: [
    [8, 3],
    [29, 3],
    [22, 17],
    [1, 17],
  ],
  gltrapez: [
    [8, 3],
    [22, 3],
    [29, 17],
    [1, 17],
  ],
  drachen: [
    [15, 0],
    [24, 7],
    [15, 20],
    [6, 7],
  ],
  trapez: [
    [4, 3],
    [18, 3],
    [29, 17],
    [1, 17],
  ],
  viereck: [
    [3, 5],
    [21, 1],
    [29, 15],
    [8, 19],
  ],
};

/** Tipps beim Bauen. */
const TIP: Record<QuadClass, { de: string; en: string }> = {
  viereck: L('', ''),
  trapez: L('Tipp: Lege zwei Gegenseiten parallel – dann erscheinen Pfeilmarken auf beiden.', 'Tip: make two opposite sides parallel – arrow marks then appear on both.'),
  gltrapez: L('Tipp: Erst zwei Seiten parallel legen, dann die beiden anderen gleich schräg stellen, bis eine Symmetrieachse erscheint.', 'Tip: first make two sides parallel, then tilt the other two equally until a line of symmetry appears.'),
  drachen: L('Tipp: An einer Ecke beide Seiten gleich lang machen, an der gegenüberliegenden Ecke auch.', 'Tip: make both sides at one corner equal, and both sides at the opposite corner as well.'),
  parallelogramm: L('Tipp: Gegenseiten sind parallel, wenn man auf beiden gleich viele Kästchen nach rechts und nach oben geht.', 'Tip: opposite sides are parallel if both go the same number of squares across and up.'),
  raute: L('Tipp: Gleich lange Seiten bekommen gleich viele Striche. 3 Kästchen nach rechts und 4 nach oben ist genauso lang wie 4 nach rechts und 3 nach oben.', 'Tip: equal sides get the same tick marks. 3 squares across and 4 up is as long as 4 across and 3 up.'),
  rechteck: L('Tipp: Geht eine Seite 2 Kästchen nach rechts und 1 nach oben, dann steht eine Seite mit 1 nach links und 2 nach oben senkrecht darauf.', 'Tip: a side going 2 squares right and 1 up is perpendicular to a side going 1 left and 2 up.'),
  quadrat: L('Tipp: Vier gleich lange Seiten und rechte Winkel – zum Beispiel 3 nach rechts und 1 nach oben, dann 1 nach links und 3 nach oben.', 'Tip: four equal sides and right angles – for example 3 right and 1 up, then 1 left and 3 up.'),
};

const GOALS: QuadClass[] = ['trapez', 'gltrapez', 'drachen', 'parallelogramm', 'raute', 'rechteck', 'quadrat'];
const SIDE = ['a', 'b', 'c', 'd'] as const;
const ANGLE = ['α', 'β', 'γ', 'δ'] as const;
const VERTEX = ['A', 'B', 'C', 'D'] as const;

interface Hit {
  id: string;
  r: Rect;
}

type Drag = { kind: 'vertex'; i: number } | { kind: 'move'; start: Pt; orig: Quad } | null;

/**
 * Das Haus der Vierecke: ein Viereck mit vier ziehbaren Ecken auf
 * Karopapier, live markierte Eigenschaften (parallele und gleich lange
 * Seiten, rechte Winkel, Diagonalen, Symmetrieachsen) und das Haus der
 * Vierecke, in dem alle zutreffenden Arten aufleuchten. Dazu zwei
 * Aufgabenformen: ein Viereck bauen und ein Viereck einordnen.
 */
export default defineSimulation({
  id: 'vierecke',
  dragHint: true,
  layout: { aspect: 1.32, aspectNarrow: 0.42 },
  groups: [
    { id: 'pts', label: L('Ecken (in Kästchen)', 'Corners (in grid squares)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Modus', 'Mode'),
      options: [
        { value: 'frei', label: L('Erkunden', 'Explore') },
        { value: 'aufgabe', label: L('Viereck bauen', 'Build a shape') },
        { value: 'einordnen', label: L('Viereck einordnen', 'Classify') },
      ],
      default: 'frei',
    },
    {
      key: 'goal',
      type: 'choice',
      label: L('Ziel', 'Goal'),
      options: GOALS.map((k) => ({ value: k, label: TITLE[k] })),
      default: 'raute',
      visibleIf: isMode('aufgabe'),
    },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: nach rechts', 'A: right'), min: 0, max: GRID_W, step: 1, default: 3 },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: nach oben', 'A: up'), min: 0, max: GRID_H, step: 1, default: 3 },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: nach rechts', 'B: right'), min: 0, max: GRID_W, step: 1, default: 13 },
    { key: 'by', type: 'number', group: 'pts', label: L('B: nach oben', 'B: up'), min: 0, max: GRID_H, step: 1, default: 2 },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: nach rechts', 'C: right'), min: 0, max: GRID_W, step: 1, default: 15 },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: nach oben', 'C: up'), min: 0, max: GRID_H, step: 1, default: 10 },
    { key: 'dx', type: 'number', group: 'pts', label: L('D: nach rechts', 'D: right'), min: 0, max: GRID_W, step: 1, default: 6 },
    { key: 'dy', type: 'number', group: 'pts', label: L('D: nach oben', 'D: up'), min: 0, max: GRID_H, step: 1, default: 12 },
    { key: 'marks', type: 'boolean', group: 'view', label: L('Eigenschaften markieren', 'Mark the properties'), help: L('Parallele Seiten (Pfeile), gleich lange Seiten (Striche), rechte Winkel', 'Parallel sides (arrows), equal sides (ticks), right angles'), default: true },
    { key: 'sym', type: 'boolean', group: 'view', label: L('Symmetrieachsen und -zentrum', 'Lines and centre of symmetry'), default: true },
    { key: 'diag', type: 'boolean', group: 'view', label: L('Diagonalen e und f', 'Diagonals e and f'), default: false },
    { key: 'angles', type: 'boolean', group: 'view', label: L('Winkelgrößen', 'Sizes of the angles'), default: false },
    { key: 'len', type: 'boolean', group: 'view', label: L('Seitenlängen', 'Side lengths'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Einordnung im Haus zeigen', 'Show the classification in the house'), default: true, visibleIf: isMode('frei', 'aufgabe') },
  ],
  actions: [
    { id: 'random', label: L('Zufälliges Viereck', 'Random quadrilateral'), visibleIf: isMode('frei') },
    { id: 'new', label: L('Neue Aufgabe', 'New task'), primary: true, visibleIf: isMode('aufgabe', 'einordnen') },
  ],
  readouts: [
    { key: 'type', label: L('Art des Vierecks', 'Type of quadrilateral'), spoiler: true },
    { key: 'props', label: L('Eigenschaften', 'Properties'), spoiler: true },
    { key: 'sizes', label: L('Seiten und Winkel', 'Sides and angles') },
    { key: 'score', label: L('Punktestand', 'Score') },
  ],
  presets: [
    { id: 'start', label: L('Allgemeines Viereck', 'General quadrilateral'), values: {} },
    { id: 'drachen', label: L('Drachenviereck', 'Kite'), values: { ax: 9, ay: 1, bx: 14, by: 8, cx: 9, cy: 13, dx: 4, dy: 8, diag: true } },
    { id: 'parallelogramm', label: L('Parallelogramm mit Diagonalen', 'Parallelogram with diagonals'), values: { ax: 2, ay: 3, bx: 12, by: 3, cx: 16, cy: 10, dx: 6, dy: 10, diag: true } },
    { id: 'quadrat', label: L('Schräges Quadrat', 'Tilted square'), values: { ax: 6, ay: 1, bx: 13, by: 4, cx: 10, cy: 11, dx: 3, dy: 8 } },
    { id: 'bauen', label: L('Aufgabe: Raute bauen', 'Task: build a rhombus'), values: { mode: 'aufgabe', goal: 'raute', ax: 4, ay: 3, bx: 12, by: 2, cx: 14, cy: 9, dx: 5, dy: 11 } },
    { id: 'einordnen', label: L('Aufgabe: einordnen', 'Task: classify'), values: { mode: 'einordnen', ax: 4, ay: 3, bx: 14, by: 3, cx: 12, cy: 10, dx: 6, dy: 10 } },
  ],
  strings: {
    de: {
      canvas: 'Karopapier mit einem Viereck ABCD, dessen Ecken man ziehen kann, daneben das Haus der Vierecke, in dem alle zutreffenden Vierecksarten hervorgehoben sind',
      house: 'Haus der Vierecke',
      legend: 'ist ein Spezialfall von',
      legendShort: 'Spezialfall von',
      props: 'Eigenschaften deines Vierecks',
      pPar: 'Parallele Seiten',
      pEq: 'Gleich lange Seiten',
      pRight: 'Rechte Winkel',
      pDiag: 'Diagonalen e, f',
      pSym: 'Symmetrie',
      none: 'keine',
      nothing: 'nichts Besonderes',
      and: 'und',
      all4: 'alle vier',
      dBisect: 'halbieren sich',
      dPerp: 'senkrecht',
      dEqual: 'gleich lang',
      dHalvesE: 'f halbiert e',
      dHalvesF: 'e halbiert f',
      axis1: '1 Achse',
      axisN: '{n} Achsen',
      axE: '(Diagonale e)',
      axF: '(Diagonale f)',
      axAC: 'durch die Mitten von a und c',
      axBD: 'durch die Mitten von b und d',
      axEF: '(e und f)',
      axMid: 'durch Seitenmitten',
      marksLegend: 'Achte auf die Markierungen: Pfeile = parallel, Striche = gleich lang, Viertelkreis mit Punkt = rechter Winkel, Strichpunktlinie = Symmetrieachse.',
      pointSym: 'punktsymmetrisch',
      concave: 'nicht konvex – eine Ecke zeigt nach innen',
      concaveShort: 'nicht konvex',
      sum: 'Summe',
      hidden: 'Erst einordnen, dann aufdecken.',
      yourQuad: 'Dein Viereck',
      isIt: 'Dein Viereck ist {nom}.',
      notIt: 'Trifft nicht zu. Es fehlt:',
      example: 'Beispiel zeigen',
      another: 'Anderes Beispiel',
      tapHint: 'Tippe im Haus auf eine Vierecksart.',
      also: 'auch',
      taskTitle: 'Aufgabe: Viereck bauen',
      taskText: 'Ziehe die Ecken so, dass {nom} entsteht.',
      done: 'Geschafft!',
      doneText: 'Das ist {nom}.',
      evenMore: 'Sogar {best} – und damit auch {goal}.',
      solved: 'Gelöst: {n}',
      newTask: 'Neue Aufgabe',
      pickGoal: 'Tippe im Haus auf ein anderes Ziel.',
      quizTitle: 'Welches Viereck ist das?',
      quizText: 'Tippe im Haus auf die genaueste Bezeichnung, die passt.',
      right: 'Richtig!',
      rightText: 'Das ist {nom}.',
      alsoList: 'Damit ist es auch: {list}.',
      partial: 'Stimmt – aber es geht genauer!',
      partialText: 'Es ist {nom}. Welche Art darüber passt auch noch?',
      wrong: 'Leider nein.',
      wrongText: 'Für {nom} fehlt:',
      nextQuad: 'Nächstes Viereck',
      quizScore: '{a} von {n} beim ersten Versuch',
      quizScore0: 'Noch keine Aufgabe gelöst',
      noSame: 'Zwei Ecken dürfen nicht aufeinanderliegen.',
      noCollinear: 'Drei Ecken auf einer Geraden – das wäre ein Dreieck.',
      noCrossed: 'Die Seiten dürfen sich nicht überkreuzen.',
      goal: 'Ziel',
      typeRead: '{t} (auch: {list})',
      sideRead: '{s} {v}',
      scoreTask: 'Gelöste Aufgaben: {n}',
    },
    en: {
      canvas: 'Squared paper with a quadrilateral ABCD whose corners can be dragged, next to the family tree (“house”) of quadrilaterals in which every matching type is highlighted',
      house: 'House of quadrilaterals',
      legend: 'is a special case of',
      legendShort: 'special case of',
      props: 'Properties of your quadrilateral',
      pPar: 'Parallel sides',
      pEq: 'Equal sides',
      pRight: 'Right angles',
      pDiag: 'Diagonals e, f',
      pSym: 'Symmetry',
      none: 'none',
      nothing: 'nothing special',
      and: 'and',
      all4: 'all four',
      dBisect: 'bisect each other',
      dPerp: 'perpendicular',
      dEqual: 'equal',
      dHalvesE: 'f bisects e',
      dHalvesF: 'e bisects f',
      axis1: '1 line',
      axisN: '{n} lines',
      axE: '(diagonal e)',
      axF: '(diagonal f)',
      axAC: 'through the midpoints of a and c',
      axBD: 'through the midpoints of b and d',
      axEF: '(e and f)',
      axMid: 'through midpoints of sides',
      marksLegend: 'Look at the marks: arrows = parallel, ticks = equal length, quarter circle with dot = right angle, dash-dot line = line of symmetry.',
      pointSym: 'point symmetry',
      concave: 'not convex – one corner points inwards',
      concaveShort: 'not convex',
      sum: 'sum',
      hidden: 'Classify first, then reveal.',
      yourQuad: 'Your quadrilateral',
      isIt: 'Your quadrilateral is {nom}.',
      notIt: 'Does not apply. Missing:',
      example: 'Show an example',
      another: 'Another example',
      tapHint: 'Tap a type in the house.',
      also: 'also',
      taskTitle: 'Task: build a shape',
      taskText: 'Drag the corners until you get {nom}.',
      done: 'Well done!',
      doneText: 'This is {nom}.',
      evenMore: 'It is even {best} – and so also {goal}.',
      solved: 'Solved: {n}',
      newTask: 'New task',
      pickGoal: 'Tap another goal in the house.',
      quizTitle: 'Which quadrilateral is this?',
      quizText: 'Tap the most precise name that fits in the house.',
      right: 'Correct!',
      rightText: 'This is {nom}.',
      alsoList: 'So it is also: {list}.',
      partial: 'True – but you can be more precise!',
      partialText: 'It is {nom}. Which type above it fits as well?',
      wrong: 'Not quite.',
      wrongText: 'For {nom} it lacks:',
      nextQuad: 'Next quadrilateral',
      quizScore: '{a} of {n} at the first try',
      quizScore0: 'No task solved yet',
      noSame: 'Two corners must not lie on top of each other.',
      noCollinear: 'Three corners on one line – that would be a triangle.',
      noCrossed: 'The sides must not cross.',
      goal: 'Goal',
      typeRead: '{t} (also: {list})',
      sideRead: '{s} {v}',
      scoreTask: 'Tasks solved: {n}',
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
    const goal = () => p.goal as QuadClass;
    const wide = () => surface.width >= 640;
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    const col = {
      par: () => ctx.theme.series[0]!,
      eq: () => ctx.theme.series[1]!,
      right: () => ctx.theme.series[2]!,
      house: () => ctx.theme.series[3]!,
      sym: () => ctx.theme.series[4]!,
      diag: () => ctx.theme.series[5]!,
      ok: () => ctx.theme.series[2]!,
      bad: () => ctx.theme.series[1]!,
    };

    /* ---------- Zustand ---------- */
    const quadFromParams = (): Quad => [
      [p.ax, p.ay],
      [p.bx, p.by],
      [p.cx, p.cy],
      [p.dx, p.dy],
    ];
    let quad: Quad = quadFromParams();
    let an: Analysis = analyze(quad);
    let lastClassesKey = an.classes.join();
    let lastBest = an.best;

    // Übergänge
    const morphTw = new Tween(750, ease.inOutCubic);
    let morphFrom: Quad = quad;
    let lastShown: Quad = quad;
    const houseTw = new Tween(1100, ease.linear);
    const bestPop = new Tween(520, ease.outBack);
    const burst = new Tween(1100, ease.outCubic);
    const shake = new Tween(450, ease.linear);
    const cardPop = new Tween(480, ease.outBack);
    let toast: { text: string; until: number } | null = null;

    // Erkunden: angetippte Vierecksart
    let sel: QuadClass | null = null;
    // Viereck bauen
    let solved = false;
    let solvedCount = 0;
    // Einordnen
    let quizDone = false;
    let quizTries = 0;
    let quizFeedback: { k: QuadClass; verdict: 'right' | 'partial' | 'wrong' } | null = null;
    let quizFirst = 0;
    let quizTotal = 0;

    let hits: Hit[] = [];
    let hover: string | null = null;
    let drag: Drag = null;

    /* ---------- Aufteilung ---------- */
    type Layout = { paper: Rect; cell: number; props: Rect | null; house: Rect; info: Rect };
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
        const colW = Math.round(clamp(W * 0.42, 300, 380));
        const leftW = W - colW - 12;
        const cell = Math.min((leftW - 2) / (GRID_W + 1), (H * 0.6) / (GRID_H + 1));
        const pw = Math.floor(cell * (GRID_W + 1));
        const ph = Math.floor(cell * (GRID_H + 1));
        const houseH = Math.round(H * 0.64);
        return {
          paper: { x: Math.round((leftW - pw) / 2), y: 2, w: pw, h: ph },
          cell,
          props: { x: 2, y: ph + 12, w: leftW - 4, h: H - ph - 14 },
          house: { x: W - colW, y: 2, w: colW - 2, h: houseH },
          info: { x: W - colW, y: houseH + 12, w: colW - 2, h: H - houseH - 14 },
        };
      }
      if (W > H * 1.05) {
        // Tablet quer bzw. schmales Fenster (Zeichenfläche unter 640 px, aber im Querformat):
        // Papier und Erklärkarte links, das Haus über die ganze Höhe rechts
        const colW = Math.round(clamp(W * 0.48, 225, 300));
        const leftW = W - colW - 10;
        const cell = Math.min((leftW - 2) / (GRID_W + 1), (H * 0.56) / (GRID_H + 1));
        const pw = Math.floor(cell * (GRID_W + 1));
        const ph = Math.floor(cell * (GRID_H + 1));
        return {
          paper: { x: Math.round((leftW - pw) / 2), y: 2, w: pw, h: ph },
          cell,
          props: null,
          house: { x: W - colW, y: 2, w: colW - 2, h: H - 4 },
          info: { x: 2, y: ph + 10, w: leftW - 4, h: H - ph - 12 },
        };
      }
      const cell = (W - 4) / (GRID_W + 1);
      const pw = Math.floor(cell * (GRID_W + 1));
      const ph = Math.floor(cell * (GRID_H + 1));
      const houseH = Math.round(clamp(W * 0.92, 280, 340));
      return {
        paper: { x: Math.round((W - pw) / 2), y: 2, w: pw, h: ph },
        cell,
        props: null,
        house: { x: 2, y: ph + 10, w: W - 4, h: houseH },
        info: { x: 2, y: ph + houseH + 18, w: W - 4, h: H - ph - houseH - 20 },
      };
    }

    /** Gitterpunkt → Pixel (y nach oben). */
    function toPx(q: Pt): [number, number] {
      const { paper, cell } = layout();
      return [paper.x + (q[0] + 0.5) * cell, paper.y + (GRID_H + 0.5 - q[1]) * cell];
    }
    function toWorld(px: number, py: number): [number, number] {
      const { paper, cell } = layout();
      return [(px - paper.x) / cell - 0.5, GRID_H + 0.5 - (py - paper.y) / cell];
    }

    /** Angezeigtes Viereck (während eines Übergangs dazwischen). */
    function shown(): Quad {
      if (!morphTw.running) return quad;
      const t = morphTw.value;
      return quad.map((q, i) => [morphFrom[i]![0] + (q[0] - morphFrom[i]![0]) * t, morphFrom[i]![1] + (q[1] - morphFrom[i]![1]) * t] as Pt) as unknown as Quad;
    }

    const showClass = () => (mode() === 'einordnen' ? quizDone : p.show);

    /* ---------- Zahlen ---------- */
    /** Länge in cm (1 Kästchen = 0,5 cm), „=“ wenn exakt auf mm, sonst „≈“. */
    function lenText(i: number, withSign = true): string {
      const l2 = an.sides2[i]!;
      const r = Math.round(Math.sqrt(l2));
      const exact = r * r === l2;
      const cm = an.sides[i]! / 2;
      const v = exact ? fmt.num(cm, 1) : fmt.fixed(cm, 1);
      return `${withSign ? (exact ? '= ' : '≈ ') : exact ? '' : '≈ '}${v} cm`;
    }
    function angleText(i: number, withSign = true): string {
      const a = an.angles[i]!;
      const exact = Math.abs(a - Math.round(a)) < 1e-9;
      return `${withSign ? (exact ? '= ' : '≈ ') : exact ? '' : '≈ '}${fmt.num(Math.round(a), 0)}°`;
    }

    /* ---------- Eigenschaften als Text ---------- */
    function parText(): string {
      if (an.parAC && an.parBD) return `a ∥ c ${ctx.t('and')} b ∥ d`;
      if (an.parAC) return 'a ∥ c';
      if (an.parBD) return 'b ∥ d';
      return ctx.t('none');
    }
    function eqText(): string {
      if (an.maxEqual === 4) return `a = b = c = d (${ctx.t('all4')})`;
      if (!an.sideGroups.length) return ctx.t('none');
      return an.sideGroups.map((g) => g.map((i) => SIDE[i]).join(' = ')).join(', ');
    }
    function rightText(): string {
      const list = an.right.map((r, i) => (r ? ANGLE[i] : '')).filter(Boolean);
      if (!list.length) return ctx.t('none');
      return list.length === 4 ? `α, β, γ, δ (${ctx.t('all4')})` : list.join(', ');
    }
    function diagFacts(): string[] {
      const f: string[] = [];
      if (an.diagBisect) f.push(ctx.t('dBisect'));
      else {
        if (halvesF()) f.push(ctx.t('dHalvesF'));
        if (halvesE()) f.push(ctx.t('dHalvesE'));
      }
      if (an.diagPerp) f.push(ctx.t('dPerp'));
      if (an.diagEqual) f.push(ctx.t('dEqual'));
      return f;
    }
    function diagText(): string {
      const f = diagFacts();
      return f.length ? f.join(' · ') : ctx.t('nothing');
    }
    function symText(): string {
      const n = an.axes.length;
      const parts: string[] = [];
      const kinds = an.axes.map((x) => x.kind).join();
      if (n === 1) parts.push(`${ctx.t('axis1')} ${ctx.t({ e: 'axE', f: 'axF', ac: 'axAC', bd: 'axBD' }[an.axes[0]!.kind])}`);
      else if (n === 2) parts.push(`${tr('axisN', { n })} ${ctx.t(kinds === 'e,f' ? 'axEF' : 'axMid')}`);
      else if (n) parts.push(tr('axisN', { n }));
      if (an.center) parts.push(ctx.t('pointSym'));
      return parts.length ? parts.join(' · ') : ctx.t('none');
    }
    /** Wird e bzw. f von der anderen Diagonalen halbiert? (exakt mit ganzen Zahlen) */
    function halvesE(): boolean {
      const [A, B, C, D] = quad;
      const fx = D[0] - B[0];
      const fy = D[1] - B[1];
      return an.diagCross !== null && fx * (A[1] + C[1] - 2 * B[1]) - fy * (A[0] + C[0] - 2 * B[0]) === 0;
    }
    function halvesF(): boolean {
      const [A, B, C, D] = quad;
      const ex = C[0] - A[0];
      const ey = C[1] - A[1];
      return an.diagCross !== null && ex * (B[1] + D[1] - 2 * A[1]) - ey * (B[0] + D[0] - 2 * A[0]) === 0;
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const m = mode();
      const reveal = m !== 'einordnen' || quizDone;
      if (reveal) {
        const others = an.classes.filter((k) => k !== an.best).map((k) => T(SHORT[k]));
        ctx.readout('type', others.length ? tr('typeRead', { t: T(TITLE[an.best]), list: others.join(', ') }) : T(TITLE[an.best]));
        const props = [parText(), eqText(), `${ctx.t('pRight')}: ${rightText()}`, `${ctx.t('pDiag')}: ${diagText()}`, `${ctx.t('pSym')}: ${symText()}`];
        ctx.readout('props', `${ctx.t('pPar')}: ${props[0]}; ${ctx.t('pEq')}: ${props[1]}; ${props.slice(2).join('; ')}`);
      } else {
        ctx.readout('type', null);
        ctx.readout('props', null);
      }
      const sides = SIDE.map((s, i) => `${s} ${lenText(i)}`).join(', ');
      const angles = ANGLE.map((s, i) => `${s} ${angleText(i)}`).join(', ');
      ctx.readout('sizes', `${sides}; ${angles}`);
      if (m === 'aufgabe') ctx.readout('score', tr('scoreTask', { n: solvedCount }));
      else if (m === 'einordnen') ctx.readout('score', quizTotal ? tr('quizScore', { a: quizFirst, n: quizTotal }) : ctx.t('quizScore0'));
      else ctx.readout('score', null);
      ctx.setAction('new', { enabled: !ctx.locked });
      ctx.setAction('random', { enabled: !ctx.locked });
    }

    /* ---------- Übergänge und Aufgaben ---------- */
    function setQuad(q: Quad, animate: boolean): void {
      if (animate) {
        morphFrom = lastShown;
        morphTw.play();
      }
      ctx.set({ ax: q[0][0], ay: q[0][1], bx: q[1][0], by: q[1][1], cx: q[2][0], cy: q[2][1], dx: q[3][0], dy: q[3][1] });
      ctx.requestRender();
    }

    function newBuildTask(changeGoal: boolean): void {
      if (changeGoal) {
        const choices = GOALS.filter((k) => k !== goal());
        ctx.set({ goal: choices[Math.floor(Math.random() * choices.length)]! });
      }
      solved = false;
      setQuad(randomOf('viereck', Math.random), true);
      cardPop.play();
    }

    function newQuiz(): void {
      const choices = CLASSES.filter((k) => k !== an.best);
      const k = choices[Math.floor(Math.random() * choices.length)]!;
      resetQuiz();
      setQuad(randomOf(k, Math.random), true);
      cardPop.play();
    }

    function resetQuiz(): void {
      quizDone = false;
      quizTries = 0;
      quizFeedback = null;
    }

    function answer(k: QuadClass): void {
      if (quizDone) return;
      quizTries++;
      const verdict = k === an.best ? 'right' : an.classes.includes(k) ? 'partial' : 'wrong';
      quizFeedback = { k, verdict };
      if (verdict === 'right') {
        quizDone = true;
        quizTotal++;
        if (quizTries === 1) quizFirst++;
        houseTw.play();
        bestPop.play();
        burst.play();
      } else shake.play();
      cardPop.play();
      updateReadouts();
      ctx.requestRender();
    }

    function showToast(v: Validity): void {
      const key = v === 'same' ? 'noSame' : v === 'collinear' ? 'noCollinear' : 'noCrossed';
      toast = { text: ctx.t(key), until: performance.now() + 1800 };
      ctx.requestRender();
    }

    const canDrag = () => !ctx.locked && mode() !== 'einordnen';

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
      str = str.replace(/ ([=∥]) /g, '\u00a0$1\u00a0').replace(/ · /g, '\u00a0· ').replace(/ (cm|°)/g, '\u00a0$1');
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

    function button(r: Rect, label: string, id: string, color: string, filled = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      const hov = hover === id;
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
      hits.push({ id, r });
    }

    /** Häkchen (ok) bzw. leerer Kreis (offen) bzw. Kreuz (falsch). */
    function checkMark(x: number, y: number, state: 'ok' | 'open' | 'bad', r = 8): void {
      const g = surface.g;
      const c = state === 'ok' ? col.ok() : state === 'bad' ? col.bad() : withAlpha(ctx.theme.text, 0.35);
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      if (state === 'open') {
        g.strokeStyle = c;
        g.lineWidth = 1.6;
        g.stroke();
        return;
      }
      g.fillStyle = c;
      g.fill();
      text(g, state === 'ok' ? '✓' : '✗', x, y + 0.5, { font: `800 ${Math.round(r * 1.25)}px ${ctx.theme.font}`, color: onColor() });
    }

    function drawIcon(k: QuadClass, cx: number, cy: number, scale: number, stroke: string, fill: string): void {
      const g = surface.g;
      const pts = ICON[k];
      g.beginPath();
      pts.forEach(([x, y], i) => {
        const px = cx + (x - 15) * scale;
        const py = cy + (y - 10) * scale;
        if (i) g.lineTo(px, py);
        else g.moveTo(px, py);
      });
      g.closePath();
      g.fillStyle = fill;
      g.fill();
      g.strokeStyle = stroke;
      g.lineWidth = 1.8;
      g.lineJoin = 'round';
      g.stroke();
    }

    /* ---------- Zeichnen: Karopapier und Viereck ---------- */
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

    /** Einheitsvektor in Pixeln. */
    function unit(dx: number, dy: number): [number, number] {
      const l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    }

    /** Pfeilmarken (parallel): `n` Winkelhaken bei `m` in Richtung `d`. */
    function chevrons(mx: number, my: number, d: [number, number], n: number, color: string): void {
      const g = surface.g;
      const s = wide() ? 6 : 5;
      const nx = -d[1];
      const ny = d[0];
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * (s + 1);
        const tx = mx + d[0] * (off + s * 0.5);
        const ty = my + d[1] * (off + s * 0.5);
        g.beginPath();
        g.moveTo(tx - d[0] * s + nx * s, ty - d[1] * s + ny * s);
        g.lineTo(tx, ty);
        g.lineTo(tx - d[0] * s - nx * s, ty - d[1] * s - ny * s);
        g.stroke();
      }
      g.restore();
    }

    /** Strichmarken (gleich lang): `n` Querstriche bei `m` quer zur Richtung `d`. */
    function ticks(mx: number, my: number, d: [number, number], n: number, color: string, len = 7): void {
      const g = surface.g;
      const nx = -d[1];
      const ny = d[0];
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * 5;
        const cx = mx + d[0] * off;
        const cy = my + d[1] * off;
        g.beginPath();
        g.moveTo(cx - nx * len, cy - ny * len);
        g.lineTo(cx + nx * len, cy + ny * len);
        g.stroke();
      }
      g.restore();
    }

    /** Winkelbogen bei z von Richtung a0 (Weltwinkel, Bogenmaß) über `sweep` gegen den Uhrzeigersinn. */
    function angleArc(z: [number, number], a0: number, sweep: number, r: number, color: string, fillAlpha: number, rightMark: boolean): void {
      const g = surface.g;
      g.save();
      g.beginPath();
      g.moveTo(z[0], z[1]);
      g.arc(z[0], z[1], r, -a0, -(a0 + sweep), true);
      g.closePath();
      g.fillStyle = withAlpha(color, fillAlpha);
      g.fill();
      g.beginPath();
      g.arc(z[0], z[1], r, -a0, -(a0 + sweep), true);
      g.strokeStyle = color;
      g.lineWidth = 1.9;
      g.stroke();
      if (rightMark) {
        const m = a0 + sweep / 2;
        g.beginPath();
        g.arc(z[0] + Math.cos(m) * r * 0.5, z[1] - Math.sin(m) * r * 0.5, 2.2, 0, Math.PI * 2);
        g.fillStyle = color;
        g.fill();
      }
      g.restore();
    }

    /** Anfangsrichtung und Größe des Innenwinkels bei Ecke i (in Pixel-Weltwinkeln, y nach oben). */
    function cornerArc(P: [number, number][], i: number): { a0: number; sweep: number } {
      const orient = Math.sign(area2px(P)) || 1;
      const c = P[i]!;
      const nx = P[(i + 1) % 4]!;
      const pv = P[(i + 3) % 4]!;
      // Pixel → Weltrichtung (y nach oben)
      const aNext = Math.atan2(-(nx[1] - c[1]), nx[0] - c[0]);
      const aPrev = Math.atan2(-(pv[1] - c[1]), pv[0] - c[0]);
      const sweep = (an.angles[i]! * Math.PI) / 180;
      return { a0: orient > 0 ? aNext : aPrev, sweep };
    }

    /** Doppelte Fläche in Weltorientierung (positiv = gegen den Uhrzeigersinn). */
    function area2px(P: [number, number][]): number {
      let s = 0;
      for (let i = 0; i < 4; i++) {
        const a = P[i]!;
        const b = P[(i + 1) % 4]!;
        s += a[0] * -b[1] - -a[1] * b[0];
      }
      return s;
    }

    function drawQuad(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { paper } = layout();
      const sq = shown();
      const P = sq.map((q) => toPx(q));
      const W = wide();
      const markA = morphTw.running ? clamp((morphTw.t - 0.82) / 0.18, 0, 1) : 1;
      const special = showClass() && an.best !== 'viereck';
      const ink = theme.text;

      // Symmetrieachsen (hinter der Figur)
      if (p.sym && markA > 0) {
        g.save();
        g.globalAlpha = markA;
        for (const ax of an.axes) {
          const [x1, y1] = toPx(ax.p);
          const [x2, y2] = toPx(ax.q);
          const [ux, uy] = unit(x2 - x1, y2 - y1);
          const ext = 2 * Math.max(paper.w, paper.h);
          g.strokeStyle = withAlpha(col.sym(), 0.9);
          g.lineWidth = 2;
          g.setLineDash([12, 5, 2, 5]);
          g.beginPath();
          g.moveTo(x1 - ux * ext, y1 - uy * ext);
          g.lineTo(x2 + ux * ext, y2 + uy * ext);
          g.stroke();
        }
        g.restore();
      }

      // Fläche
      const xs = P.map((q) => q[0]);
      const ys = P.map((q) => q[1]);
      const grad = g.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
      const base = special ? col.house() : theme.series[0]!;
      const fa = theme.dark ? (special ? 0.17 : 0.22) : 0.16;
      grad.addColorStop(0, withAlpha(base, fa));
      grad.addColorStop(1, withAlpha(base, fa * 0.4));
      g.save();
      g.beginPath();
      P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      g.fillStyle = grad;
      g.fill();
      g.restore();

      // Diagonalen
      if (p.diag) {
        g.save();
        g.globalAlpha = Math.max(0.35, markA);
        g.strokeStyle = col.diag();
        g.lineWidth = 2;
        g.setLineDash([7, 5]);
        g.beginPath();
        g.moveTo(P[0]![0], P[0]![1]);
        g.lineTo(P[2]![0], P[2]![1]);
        g.moveTo(P[1]![0], P[1]![1]);
        g.lineTo(P[3]![0], P[3]![1]);
        g.stroke();
        g.setLineDash([]);
        if (markA > 0.99) {
          // Namen e und f
          const nameAt = (i: number, j: number, nm: string) => {
            const [x1, y1] = P[i]!;
            const [x2, y2] = P[j]!;
            const [ux, uy] = unit(x2 - x1, y2 - y1);
            const t = 0.27;
            haloText(nm, x1 + (x2 - x1) * t - uy * 11, y1 + (y2 - y1) * t + ux * 11, `italic 700 ${W ? 15 : 13}px ${theme.mathFont}`, col.diag());
          };
          nameAt(0, 2, 'e');
          nameAt(1, 3, 'f');
          if (an.diagCross) {
            const s = toPx(an.diagCross);
            // Halbierung: Striche auf den Hälften
            const both = an.diagBisect && an.diagEqual;
            const hE = an.diagBisect || halvesE();
            const hF = an.diagBisect || halvesF();
            const half = (i: number, n: number) => {
              const q = P[i]!;
              const [ux, uy] = unit(q[0] - s[0], q[1] - s[1]);
              ticks((q[0] + s[0]) / 2, (q[1] + s[1]) / 2, [ux, uy], n, col.diag(), 6);
            };
            if (hE) {
              half(0, 1);
              half(2, 1);
            }
            if (hF) {
              half(1, both ? 1 : 2);
              half(3, both ? 1 : 2);
            }
            if (an.diagPerp && p.marks) {
              const a0 = Math.atan2(-(P[0]![1] - s[1]), P[0]![0] - s[0]);
              const toB = Math.atan2(-(P[1]![1] - s[1]), P[1]![0] - s[0]);
              let sweep = toB - a0;
              while (sweep < 0) sweep += 2 * Math.PI;
              const startA = sweep > Math.PI ? toB : a0;
              angleArc(s, startA, Math.PI / 2, W ? 13 : 11, col.right(), 0.16, true);
            }
            g.beginPath();
            g.arc(s[0], s[1], 3.2, 0, Math.PI * 2);
            g.fillStyle = col.diag();
            g.fill();
          }
        }
        g.restore();
      }

      // Umriss
      g.save();
      g.beginPath();
      P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.strokeStyle = ink;
      g.lineWidth = 2.8;
      g.lineJoin = 'round';
      g.stroke();
      g.restore();

      const orient = Math.sign(area2px(P)) || 1;
      // Winkel
      if (markA > 0) {
        g.save();
        g.globalAlpha = markA;
        for (let i = 0; i < 4; i++) {
          const z = P[i]!;
          const { a0, sweep } = cornerArc(P, i);
          const isRight = an.right[i]!;
          if (isRight && (p.marks || p.angles)) angleArc(z, a0, sweep, W ? 16 : 13, col.right(), 0.18, true);
          else if (p.angles) angleArc(z, a0, sweep, W ? 20 : 15, withAlpha(ink, 0.55), 0.07, false);
          if (p.angles) {
            const m = a0 + sweep / 2;
            const rr = (W ? 40 : 31) + (sweep > Math.PI ? -10 : 0);
            haloText(`${ANGLE[i]} ${angleText(i)}`, z[0] + Math.cos(m) * rr, z[1] - Math.sin(m) * rr, `700 ${W ? 12.5 : 11}px ${theme.font}`, isRight ? col.right() : withAlpha(ink, 0.85));
          }
        }
        g.restore();
      }

      // Seiten: Pfeil- und Strichmarken, Namen bzw. Längen
      if (markA > 0) {
        g.save();
        g.globalAlpha = markA;
        const groupOf = (i: number) => an.sideGroups.findIndex((gr) => gr.includes(i));
        for (let i = 0; i < 4; i++) {
          const a = P[i]!;
          const b = P[(i + 1) % 4]!;
          const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
          const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const mx = (a[0] + b[0]) / 2;
          const my = (a[1] + b[1]) / 2;
          // nach außen zeigende Normale (Pixel)
          const nx = -uy * orient;
          const ny = ux * orient;
          const off = Math.min(16, L * 0.16);
          if (p.marks) {
            const parIdx = i % 2 === 0 ? (an.parAC ? 1 : 0) : an.parBD ? (an.parAC ? 2 : 1) : 0;
            const grp = groupOf(i);
            const hasTick = grp >= 0 && an.maxEqual > 1;
            if (parIdx) {
              // gemeinsame Richtung beider paralleler Seiten
              const ref = i < 2 ? [ux, uy] : [-ux, -uy];
              chevrons(mx + ux * (hasTick ? off : 0), my + uy * (hasTick ? off : 0), ref as [number, number], parIdx, col.par());
            }
            if (hasTick) {
              const n = an.maxEqual === 4 ? 1 : grp + 1;
              ticks(mx - ux * (parIdx ? off : 0), my - uy * (parIdx ? off : 0), [ux, uy], n, col.eq());
            }
          }
          const label = p.len ? `${SIDE[i]} ${lenText(i)}` : SIDE[i]!;
          const font = p.len ? `700 ${W ? 12.5 : 11}px ${theme.font}` : `italic 700 ${W ? 16 : 14}px ${theme.mathFont}`;
          g.font = font;
          const tw = g.measureText(label).width;
          const dist = (W ? 14 : 12) + Math.abs(nx) * tw * 0.5 + Math.abs(ny) * 2;
          const along = p.len ? 0 : Math.min(L * 0.17, W ? 26 : 20);
          haloText(label, mx + nx * dist + ux * along, my + ny * dist + uy * along, font, p.len ? ink : withAlpha(ink, 0.75));
        }
        g.restore();
      }

      // Symmetriezentrum
      if (p.sym && an.center && markA > 0.99) {
        const [zx, zy] = toPx(an.center);
        g.beginPath();
        g.arc(zx, zy, 6.5, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.strokeStyle = col.sym();
        g.lineWidth = 2.4;
        g.stroke();
        g.beginPath();
        g.arc(zx, zy, 2.6, 0, Math.PI * 2);
        g.fillStyle = col.sym();
        g.fill();
        haloText('Z', zx + 11, zy - 11, `700 ${W ? 13 : 12}px ${theme.font}`, col.sym());
      }

      // Ecken
      for (let i = 0; i < 4; i++) {
        const [x, y] = P[i]!;
        const active = hover === `v${i}` || (drag?.kind === 'vertex' && drag.i === i);
        if (canDrag()) {
          g.beginPath();
          g.arc(x, y, active ? 15 : 12, 0, Math.PI * 2);
          g.fillStyle = withAlpha(theme.series[0]!, active ? 0.28 : 0.14);
          g.fill();
        }
        g.beginPath();
        g.arc(x, y, 5.2, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.strokeStyle = ink;
        g.lineWidth = 2.6;
        g.stroke();
        // Name außen, gegenüber dem Winkelfeld
        const { a0, sweep } = cornerArc(P, i);
        const m = a0 + sweep / 2 + Math.PI;
        const d = W ? 19 : 16;
        const lx = clamp(x + Math.cos(m) * d, paper.x + 10, paper.x + paper.w - 10);
        const ly = clamp(y - Math.sin(m) * d, paper.y + 11, paper.y + paper.h - 11);
        haloText(VERTEX[i]!, lx, ly, `800 ${W ? 16 : 14}px ${theme.font}`, ink);
      }

      // Jubel beim Lösen
      if (burst.running) {
        const cx = P.reduce((s, q) => s + q[0], 0) / 4;
        const cy = P.reduce((s, q) => s + q[1], 0) / 4;
        const t = burst.value;
        const colors = theme.series;
        g.save();
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2 + 0.2;
          const rr = 20 + t * (70 + (i % 3) * 18);
          g.globalAlpha = 1 - burst.t;
          g.fillStyle = colors[i % colors.length]!;
          g.beginPath();
          g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 4 * (1 - t * 0.5), 0, Math.PI * 2);
          g.fill();
        }
        g.restore();
      }

      // Hinweis bei ungültiger Lage
      const now = performance.now();
      if (toast && now < toast.until) {
        const a = clamp((toast.until - now) / 300, 0, 1);
        const font = `700 ${W ? 12.5 : 11.5}px ${theme.font}`;
        const rows = wrap(toast.text, paper.w - 40, font);
        const lh = W ? 17 : 15;
        g.font = font;
        const w = Math.max(...rows.map((r) => g.measureText(r).width)) + 24;
        const h = rows.length * lh + 14;
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
        rows.forEach((row, i) => text(g, row, x + w / 2, y + 7 + lh / 2 + i * lh, { font, color: col.bad() }));
        g.restore();
      } else toast = null;
    }

    /* ---------- Zeichnen: Haus der Vierecke ---------- */
    interface NodeBox {
      k: QuadClass;
      cx: number;
      cy: number;
      w: number;
      h: number;
    }

    function houseNodes(R: Rect): NodeBox[] {
      const W = wide();
      const top = R.y + (W ? 36 : 30);
      const bottom = R.y + R.h - (W ? 12 : 10);
      const nodeH = W ? 52 : 38;
      const pitch = (bottom - top - nodeH) / 4;
      const innerX = R.x + 10;
      const innerW = R.w - 20;
      const nodeW = Math.min(W ? 112 : 112, (innerW - 14) / 3);
      return CLASSES.map((k) => ({ k, cx: innerX + POS[k] * innerW, cy: top + nodeH / 2 + LEVEL[k] * pitch, w: nodeW, h: nodeH }));
    }

    /** Fortschritt der Hervorhebung (0…1): von der speziellsten Art abwärts. */
    function litProgress(k: QuadClass): number {
      if (!showClass() || !an.classes.includes(k)) return 0;
      if (!houseTw.running) return 1;
      const delay = (LEVEL[k] - LEVEL[an.best]) * 0.16;
      return clamp((houseTw.t - delay) / 0.22, 0, 1);
    }

    function nodeLines(k: QuadClass, maxW: number, size: number, maxLines = 3): { lines: string[]; size: number } {
      const g = surface.g;
      const all = NODE[k][lang];
      const variants = all.filter((v) => v.length <= maxLines).length ? all.filter((v) => v.length <= maxLines) : all;
      for (const s of [size, size - 0.5, size - 1]) {
        g.font = `700 ${s}px ${ctx.theme.font}`;
        for (const v of variants) if (v.every((l) => g.measureText(l).width <= maxW)) return { lines: v, size: s };
      }
      return { lines: variants[variants.length - 1]!, size: size - 1 };
    }

    function drawHouse(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const ch = col.house();
      card(R);
      const nodes = houseNodes(R);
      const byK = new Map(nodes.map((n) => [n.k, n]));
      const nq = byK.get('quadrat')!;
      const nr = byK.get('rechteck')!;
      const nv = byK.get('viereck')!;

      // Silhouette des Hauses: Dach und Wände
      const roofTop = nq.cy - nq.h / 2 - (W ? 16 : 10);
      const eave = nr.cy + nr.h / 2 + (W ? 6 : 3);
      const left = R.x + 6;
      const right = R.x + R.w - 6;
      const wallL = R.x + (W ? 16 : 12);
      const wallR = R.x + R.w - (W ? 16 : 12);
      const ground = nv.cy + nv.h / 2 + (W ? 6 : 4);
      const midX = R.x + R.w / 2;
      g.save();
      g.beginPath();
      g.moveTo(midX, roofTop);
      g.lineTo(right, eave);
      g.lineTo(wallR, eave);
      g.lineTo(wallR, ground);
      g.lineTo(wallL, ground);
      g.lineTo(wallL, eave);
      g.lineTo(left, eave);
      g.closePath();
      g.fillStyle = withAlpha(ch, theme.dark ? 0.06 : 0.045);
      g.fill();
      g.strokeStyle = withAlpha(ch, theme.dark ? 0.3 : 0.25);
      g.lineWidth = 1.4;
      g.lineJoin = 'round';
      g.stroke();
      // Schornstein auf der rechten Dachseite
      const slope = (eave - roofTop) / (right - midX);
      const cx0 = midX + (right - midX) * 0.62;
      const cx1 = cx0 + (W ? 16 : 12);
      const cy0 = roofTop + (cx0 - midX) * slope;
      const cy1 = roofTop + (cx1 - midX) * slope;
      const chTop = cy0 - (W ? 22 : 14);
      g.beginPath();
      g.moveTo(cx0, cy0);
      g.lineTo(cx0, chTop);
      g.lineTo(cx1, chTop);
      g.lineTo(cx1, cy1);
      g.stroke();
      g.restore();

      title(R.x + 12, R.y + 16, ctx.t('house'));

      // Pfeile „ist ein Spezialfall von“
      for (const n of nodes) {
        for (const pk of PARENTS[n.k]) {
          const t = byK.get(pk)!;
          const sx = n.cx + clamp((t.cx - n.cx) * 0.3, -n.w * 0.3, n.w * 0.3);
          const sy = n.cy + n.h / 2;
          const ex = t.cx + clamp((n.cx - t.cx) * 0.3, -t.w * 0.3, t.w * 0.3);
          const ey = t.cy - t.h / 2 - 2;
          const lit = Math.min(litProgress(n.k), litProgress(pk));
          arrowCurve(sx, sy, ex, ey, withAlpha(theme.text, theme.dark ? 0.32 : 0.26), 1.4, 1);
          if (lit > 0) arrowCurve(sx, sy, ex, ey, ch, 2.8, lit);
        }
      }

      // Legende unten rechts
      const lf = `600 ${W ? 11 : 10.5}px ${theme.font}`;
      const lx = R.x + R.w - (W ? 14 : 10);
      const ly = R.y + 16;
      g.font = `700 ${W ? 12 : 11}px ${theme.font}`;
      const titleW = g.measureText(ctx.t('house')).width;
      g.font = lf;
      const arrowW = (W ? 22 : 18) + 8;
      const room = lx - (R.x + 12 + titleW + 12);
      const legend = g.measureText(ctx.t('legend')).width + arrowW <= room ? ctx.t('legend') : g.measureText(ctx.t('legendShort')).width + arrowW <= room ? ctx.t('legendShort') : '';
      const lw = g.measureText(legend).width;
      if (legend) {
        text(g, legend, lx, ly, { font: lf, color: theme.muted, align: 'right' });
        const ax1 = lx - lw - 8;
        const ax0 = ax1 - (W ? 22 : 18);
        g.strokeStyle = theme.muted;
        g.fillStyle = theme.muted;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(ax0, ly);
        g.lineTo(ax1 - 5, ly);
        g.stroke();
        g.beginPath();
        g.moveTo(ax1, ly);
        g.lineTo(ax1 - 7, ly - 3.5);
        g.lineTo(ax1 - 7, ly + 3.5);
        g.closePath();
        g.fill();
      }

      for (const n of nodes) drawNode(n);
    }

    /** Pfeil als weiche Kurve von (sx, sy) nach (ex, ey); `part` < 1 zeichnet nur den Anfang. */
    function arrowCurve(sx: number, sy: number, ex: number, ey: number, color: string, width: number, part: number): void {
      const g = surface.g;
      const dy = ey - sy;
      const c1: Pt = [sx, sy + dy * 0.55];
      const c2: Pt = [ex, ey - dy * 0.55];
      const pt = (t: number): Pt => {
        const u = 1 - t;
        return [u * u * u * sx + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * ex, u * u * u * sy + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * ey];
      };
      const N = 24;
      const end = Math.max(1, Math.round(N * part));
      g.save();
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(sx, sy);
      // Linie endet vor der Spitze
      for (let i = 1; i <= end; i++) {
        const t = (i / N) * (part >= 1 && i === N ? 0.93 : 1);
        const [x, y] = pt(Math.min(t, part >= 1 ? 0.93 : t));
        g.lineTo(x, y);
      }
      g.stroke();
      if (part >= 1) {
        const [qx, qy] = pt(0.9);
        const [ux, uy] = unit(ex - qx, ey - qy);
        const hs = width > 2 ? 8 : 6.5;
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(ex, ey);
        g.lineTo(ex - ux * hs - uy * hs * 0.55, ey - uy * hs + ux * hs * 0.55);
        g.lineTo(ex - ux * hs + uy * hs * 0.55, ey - uy * hs - ux * hs * 0.55);
        g.closePath();
        g.fill();
      }
      g.restore();
    }

    function drawNode(n: NodeBox): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const ch = col.house();
      const lit = litProgress(n.k);
      const isBest = showClass() && an.best === n.k && lit > 0;
      const id = `node:${n.k}`;
      const hov = hover === id;
      const isGoal = mode() === 'aufgabe' && goal() === n.k;
      const isSel = mode() !== 'aufgabe' && sel === n.k && (mode() === 'frei' || quizDone);
      const fb = mode() === 'einordnen' && quizFeedback && quizFeedback.k === n.k && !quizDone ? quizFeedback.verdict : null;
      const sc = isBest && bestPop.running ? Math.max(0.6, bestPop.value) : 1;
      const dx = fb === 'wrong' && shake.running ? Math.sin(shake.t * Math.PI * 6) * 4 * (1 - shake.t) : 0;
      g.save();
      g.translate(n.cx + dx, n.cy);
      g.scale(sc, sc);
      const x = -n.w / 2;
      const y = -n.h / 2;
      // Körper
      g.save();
      if (isBest) {
        g.shadowColor = withAlpha(ch, 0.55);
        g.shadowBlur = 14;
        g.shadowOffsetY = 2;
      } else {
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.10)';
        g.shadowBlur = hov ? 10 : 6;
        g.shadowOffsetY = hov ? 3 : 2;
      }
      g.fillStyle = theme.dark ? '#18202c' : '#ffffff';
      roundRect(g, x, y, n.w, n.h, 10);
      g.fill();
      g.restore();
      if (lit > 0) {
        g.fillStyle = isBest ? ch : withAlpha(ch, (theme.dark ? 0.22 : 0.14) * lit);
        roundRect(g, x, y, n.w, n.h, 10);
        g.fill();
      }
      if (fb === 'partial') {
        g.fillStyle = withAlpha(ch, theme.dark ? 0.16 : 0.1);
        roundRect(g, x, y, n.w, n.h, 10);
        g.fill();
      }
      const border = fb === 'wrong' ? col.bad() : fb === 'partial' ? ch : lit > 0 ? withAlpha(ch, 0.4 + 0.5 * lit) : hov ? withAlpha(theme.text, 0.4) : theme.dark ? '#2b3647' : '#dde3eb';
      g.strokeStyle = border;
      g.lineWidth = lit > 0 || fb ? 1.6 : 1.2;
      roundRect(g, x + 0.5, y + 0.5, n.w - 1, n.h - 1, 10);
      g.stroke();
      // Ziel bzw. Auswahl: Ring außen
      if (isGoal || isSel) {
        g.save();
        g.strokeStyle = isGoal ? col.ok() : theme.series[0]!;
        g.lineWidth = 2;
        if (isGoal && !(solved && an.classes.includes(n.k))) g.setLineDash([5, 3]);
        roundRect(g, x - 4, y - 4, n.w + 8, n.h + 8, 13);
        g.stroke();
        g.restore();
      }
      // Inhalt
      const fg = isBest ? onColor() : lit > 0 || fb ? theme.text : theme.muted;
      const iconCol = isBest ? onColor() : lit > 0 ? ch : withAlpha(theme.text, 0.45);
      const iconFill = isBest ? withAlpha(onColor(), 0.25) : lit > 0 ? withAlpha(ch, 0.2) : withAlpha(theme.text, 0.05);
      // breit: Symbol und höchstens zwei Zeilen; schmal: bis zu drei Zeilen ohne Symbol
      const { lines, size } = nodeLines(n.k, n.w - 10, W ? 12 : 11.5, W ? 2 : 3);
      const lh = size + 1.5;
      if (W) {
        const iconH = 18;
        const total = iconH + 4 + lines.length * lh;
        const top = -total / 2;
        drawIcon(n.k, 0, top + iconH / 2, 0.9, iconCol, iconFill);
        lines.forEach((l, i) => text(g, l, 0, top + iconH + 4 + lh / 2 + i * lh, { font: `700 ${size}px ${theme.font}`, color: fg }));
      } else {
        // Handy: Symbol nur, wenn der Name in eine Zeile passt
        const one = lines.length === 1;
        if (one) {
          drawIcon(n.k, 0, -8, 0.62, iconCol, iconFill);
          text(g, lines[0]!, 0, 9.5, { font: `700 ${size}px ${theme.font}`, color: fg });
        } else lines.forEach((l, i) => text(g, l, 0, (i - (lines.length - 1) / 2) * lh, { font: `700 ${size}px ${theme.font}`, color: fg }));
      }
      // Abzeichen
      if (isGoal) badge(x + n.w - 2, y + 1, ctx.t('goal'), col.ok());
      if (fb === 'wrong') badge(x + n.w - 2, y + 1, '✗', col.bad());
      if (isGoal && solved && an.classes.includes(n.k)) badge(x + 6, y + 1, '✓', col.ok());
      g.restore();
      hits.push({ id, r: { x: n.cx - n.w / 2 - 3, y: n.cy - n.h / 2 - 3, w: n.w + 6, h: n.h + 6 } });
    }

    function badge(x: number, y: number, label: string, color: string): void {
      const g = surface.g;
      const font = `800 ${wide() ? 10.5 : 10}px ${ctx.theme.font}`;
      g.font = font;
      const w = Math.max(16, g.measureText(label).width + 10);
      const h = 16;
      g.fillStyle = color;
      roundRect(g, x - w + 6, y - h / 2 - 2, w, h, h / 2);
      g.fill();
      text(g, label, x - w / 2 + 6, y - 2 + 0.5, { font, color: onColor() });
    }

    /* ---------- Karte: Eigenschaften (nur breit) ---------- */
    function propIcon(kind: 'par' | 'eq' | 'right' | 'diag' | 'sym', x: number, y: number): void {
      const g = surface.g;
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      if (kind === 'par') {
        g.strokeStyle = col.par();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x - 9, y - 4);
        g.lineTo(x + 9, y - 4);
        g.moveTo(x - 9, y + 4);
        g.lineTo(x + 9, y + 4);
        g.stroke();
        chevrons(x, y - 4, [1, 0], 1, col.par());
        chevrons(x, y + 4, [1, 0], 1, col.par());
      } else if (kind === 'eq') {
        g.strokeStyle = withAlpha(ctx.theme.text, 0.6);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x - 10, y);
        g.lineTo(x + 10, y);
        g.stroke();
        ticks(x, y, [1, 0], 2, col.eq(), 6);
      } else if (kind === 'right') {
        g.strokeStyle = withAlpha(ctx.theme.text, 0.6);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x + 9, y + 7);
        g.lineTo(x - 8, y + 7);
        g.lineTo(x - 8, y - 9);
        g.stroke();
        angleArc([x - 8, y + 7], 0, Math.PI / 2, 10, col.right(), 0.2, true);
      } else if (kind === 'diag') {
        g.strokeStyle = col.diag();
        g.lineWidth = 2;
        g.setLineDash([3.5, 3]);
        g.beginPath();
        g.moveTo(x - 9, y - 8);
        g.lineTo(x + 9, y + 8);
        g.moveTo(x + 9, y - 8);
        g.lineTo(x - 9, y + 8);
        g.stroke();
      } else {
        g.strokeStyle = col.sym();
        g.lineWidth = 2;
        g.setLineDash([5, 2.5, 1.5, 2.5]);
        g.beginPath();
        g.moveTo(x, y - 10);
        g.lineTo(x, y + 10);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = withAlpha(col.sym(), 0.3);
        g.beginPath();
        g.moveTo(x - 3, y - 5);
        g.lineTo(x - 10, y + 5);
        g.lineTo(x - 3, y + 5);
        g.closePath();
        g.moveTo(x + 3, y - 5);
        g.lineTo(x + 10, y + 5);
        g.lineTo(x + 3, y + 5);
        g.closePath();
        g.fill();
      }
      g.restore();
    }

    function drawProps(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      card(R);
      const pad = 14;
      title(R.x + pad, R.y + 17, ctx.t('props'));
      const reveal = mode() !== 'einordnen' || quizDone || p.marks;
      const rows: ['par' | 'eq' | 'right' | 'diag' | 'sym', string, string, boolean][] = [
        ['par', ctx.t('pPar'), parText(), an.parAC || an.parBD],
        ['eq', ctx.t('pEq'), eqText(), an.sideGroups.length > 0],
        ['right', ctx.t('pRight'), rightText(), an.right.some(Boolean)],
        ['diag', ctx.t('pDiag'), diagText(), diagFacts().length > 0],
        ['sym', ctx.t('pSym'), symText(), an.axes.length > 0 || an.center !== null],
      ];
      const sizesH = 44;
      const top = R.y + 32;
      const avail = R.h - 32 - sizesH - 8;
      // Spalte der Bezeichnungen so breit wie nötig
      const lf = `600 12px ${theme.font}`;
      g.font = lf;
      const labelW = clamp(Math.max(...rows.map((r) => g.measureText(r[1]).width)) + 14, 90, 140);
      const maxW = R.w - pad * 2 - 30 - labelW;
      // Werte umbrechen statt abschneiden (an den Trennpunkten „·“); wenn es eng wird, etwas kleiner
      const layoutRows = (size: number, lh: number) =>
        rows.map(([, , value, on]) => {
          const vf = `${on ? 700 : 500} ${size}px ${theme.font}`;
          const lines = wrap(reveal ? value : '?', maxW, vf).map((ln) => ln.replace(/\u00a0·$/, ''));
          return { vf, lines, need: Math.max(22, lines.length * lh + 7) };
        });
      let lh = 15;
      let laid = layoutRows(12.5, lh);
      if (laid.reduce((s, r) => s + r.need, 0) > avail) {
        lh = 14;
        laid = layoutRows(11.5, lh);
      }
      const extra = Math.max(0, avail - laid.reduce((s, r) => s + r.need, 0)) / rows.length;
      let y = top;
      rows.forEach(([kind, label, , on], i) => {
        const { vf, lines, need } = laid[i]!;
        const rh = need + Math.min(extra, 8);
        const cy = y + rh / 2;
        propIcon(kind, R.x + pad + 11, cy);
        text(g, label, R.x + pad + 30, cy, { font: lf, color: theme.muted, align: 'left' });
        // höchstens so viele Zeilen, wie in den Rest der Karte passen
        const room = Math.max(1, Math.floor((top + avail - y) / lh));
        const shown = lines.slice(0, room);
        if (shown.length < lines.length) shown[shown.length - 1] = `${shown[shown.length - 1]!.replace(/\s*·?\s*$/, '')} …`;
        shown.forEach((ln, k) => text(g, ln, R.x + pad + 30 + labelW, cy + (k - (shown.length - 1) / 2) * lh, { font: vf, color: on && reveal ? theme.text : theme.muted, align: 'left' }));
        y += rh;
      });
      // Seiten und Winkel
      const y0 = R.y + R.h - sizesH - 2;
      g.strokeStyle = theme.dark ? '#273142' : '#e9edf2';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R.x + pad, y0 - 4);
      g.lineTo(R.x + R.w - pad, y0 - 4);
      g.stroke();
      const sum = Math.round(an.angles.reduce((s, a) => s + a, 0));
      // Abstände zwischen den Angaben verkleinern, falls die Zeile sonst zu breit wäre
      const fitRow = (parts: string[], tail = ''): { str: string; f: string } => {
        for (const [gap, size] of [
          ['   ', 12],
          ['  ', 12],
          ['  ', 11.5],
          [' ', 11],
        ] as [string, number][]) {
          const f = `600 ${size}px ${theme.font}`;
          const str = parts.join(gap) + (tail ? gap + tail : '');
          g.font = f;
          if (g.measureText(str).width <= R.w - 2 * pad) return { str, f };
        }
        return { str: parts.join(' ') + (tail ? ` ${tail}` : ''), f: `600 11px ${theme.font}` };
      };
      const sidesRow = fitRow(SIDE.map((s, i) => `${s} ${lenText(i)}`));
      const angRow = fitRow(
        ANGLE.map((s, i) => `${s} ${angleText(i)}`),
        `(${ctx.t('sum')} ${fmt.num(sum, 0)}°)`,
      );
      text(g, sidesRow.str, R.x + pad, y0 + 9, { font: sidesRow.f, color: theme.text, align: 'left' });
      text(g, angRow.str, R.x + pad, y0 + 29, { font: angRow.f, color: theme.text, align: 'left' });
      if (!an.convex) {
        // Hinweis bei nicht konvexem Viereck rechts oben (kurz, wenn neben dem Titel kein Platz ist)
        const cf = `600 11px ${theme.font}`;
        g.font = `700 ${wide() ? 12 : 11}px ${theme.font}`;
        const tw = g.measureText(ctx.t('props')).width;
        g.font = cf;
        const note = g.measureText(ctx.t('concave')).width + tw + 24 <= R.w - 2 * pad ? ctx.t('concave') : ctx.t('concaveShort');
        text(g, note, R.x + R.w - pad, R.y + 17, { font: cf, color: col.house(), align: 'right' });
      }
    }

    /* ---------- Karte: Erklärung bzw. Aufgabe ---------- */
    function drawInfo(R: Rect): void {
      const m = mode();
      if (m === 'aufgabe') infoTask(R);
      else if (m === 'einordnen' && !quizDone) infoQuiz(R);
      else infoClass(R);
    }

    function header(R: Rect, k: QuadClass | null, label: string, color: string, pad: number): number {
      const g = surface.g;
      const W = wide();
      const y = R.y + (W ? 22 : 20);
      let x = R.x + pad;
      if (k) {
        drawIcon(k, x + 14, y, 0.85, color, withAlpha(color, 0.18));
        x += 34;
      }
      const s = cardPop.running ? Math.max(0.5, cardPop.value) : 1;
      g.save();
      g.translate(x, y);
      g.scale(s, s);
      text(g, label, 0, 0, { font: `800 ${W ? 17 : 15}px ${ctx.theme.font}`, color, align: 'left' });
      g.restore();
      return y + (W ? 20 : 18);
    }

    function infoClass(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      const k: QuadClass = sel ?? an.best;
      const applies = an.classes.includes(k);
      const ch = col.house();
      const reveal = showClass();
      card(R, reveal && applies ? ch : undefined, reveal && applies ? 0.05 : 0);
      let y = header(R, k, T(TITLE[k]), reveal && applies ? ch : theme.text, pad);
      const inner = R.w - 2 * pad;
      const bh = 28;
      const bottom = R.y + R.h - (W ? 12 : 10);
      const lh = W ? 16.5 : 15.5;
      // Definition
      const df = `600 ${W ? 12.5 : 12}px ${theme.font}`;
      const dRows = wrap(T(INFO[k].def), inner, df);
      y += 2;
      y += textRows(dRows, R.x + pad, y + lh / 2, lh, df, theme.text);
      // Status
      const statusRows: { txt: string; color: string; font: string }[] = [];
      if (reveal) {
        if (applies) statusRows.push({ txt: `✓ ${tr('isIt', { nom: T(NOM[k]) })}`, color: col.ok(), font: `700 ${W ? 12.5 : 12}px ${theme.font}` });
        else {
          const miss = requirements(k, an).filter((r) => !r.ok);
          const txt = `${ctx.t('notIt')} ${miss.map((r) => reqLabel(r)).join(', ')}`;
          statusRows.push({ txt, color: col.bad(), font: `600 ${W ? 12 : 11.5}px ${theme.font}` });
        }
      } else statusRows.push({ txt: ctx.t('hidden'), color: theme.muted, font: `600 ${W ? 12 : 11.5}px ${theme.font}` });
      // weitere Eigenschaften, soweit Platz ist
      const mf = `500 ${W ? 12 : 11.5}px ${theme.font}`;
      let mRows = wrap(T(INFO[k].more), inner, mf);
      const sRows = statusRows.flatMap((s) => wrap(s.txt, inner, s.font).map((r) => ({ ...s, txt: r })));
      const btnY = bottom - bh;
      const spaceForMore = btnY - 8 - (y + 6) - sRows.length * lh - 4;
      const nMore = Math.max(0, Math.min(mRows.length, Math.floor(spaceForMore / lh)));
      if (nMore < mRows.length) {
        // nicht mitten in einer Angabe abschneiden: so viele ganze Angaben (getrennt durch „·“), wie passen
        const facts = T(INFO[k].more).replace(/\.$/, '').split(' · ');
        let best: string[] = [];
        for (let j = 1; j <= facts.length; j++) {
          const rows = wrap(`${facts.slice(0, j).join(' · ')} …`, inner, mf);
          if (rows.length > nMore) break;
          best = rows;
        }
        mRows = best;
      }
      y += 4;
      if (mRows.length > 0) y += textRows(mRows.slice(0, nMore), R.x + pad, y + lh / 2, lh, mf, theme.muted) + 4;
      sRows.forEach((s, i) => text(g, s.txt, R.x + pad, y + lh / 2 + i * lh, { font: s.font, color: s.color, align: 'left' }));
      // Knopf und Hinweis
      if (!ctx.locked && (mode() === 'frei' || quizDone)) {
        const label = mode() === 'einordnen' ? ctx.t('nextQuad') : ctx.t(applies && sameQuadClass(k) ? 'another' : 'example');
        g.font = `700 ${W ? 12.5 : 12}px ${theme.font}`;
        const bw = g.measureText(label).width + 28;
        const id = mode() === 'einordnen' ? 'next' : 'example';
        button({ x: R.x + R.w - pad - bw, y: btnY, w: bw, h: bh }, label, id, mode() === 'einordnen' ? theme.series[0]! : ch, mode() === 'einordnen');
        if (mode() === 'frei' && !sel) {
          const hf = `500 ${W ? 11.5 : 11}px ${theme.font}`;
          const hr = wrap(ctx.t('tapHint'), R.w - 2 * pad - bw - 10, hf);
          // nur ganz zeigen, nie mitten im Satz abbrechen
          if (hr.length <= 2) textRows(hr, R.x + pad, btnY + bh / 2 - ((hr.length - 1) * 14) / 2, 14, hf, theme.muted);
        }
        if (mode() === 'einordnen') {
          const sf = `600 ${W ? 11.5 : 11}px ${theme.font}`;
          text(g, tr('quizScore', { a: quizFirst, n: quizTotal }), R.x + pad, btnY + bh / 2, { font: sf, color: theme.muted, align: 'left' });
        }
      }
    }

    /** Liegt das gezeigte Viereck schon in dieser Art (dann „Anderes Beispiel“)? */
    function sameQuadClass(k: QuadClass): boolean {
      return an.best === k;
    }

    function reqLabel(r: Req): string {
      const base = T(REQ[r.id]);
      return r.need !== undefined && !r.ok ? `${base} (${r.have}/${r.need})` : base;
    }

    function infoTask(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      const k = goal();
      const ok = an.classes.includes(k);
      const okC = col.ok();
      card(R, ok ? okC : undefined, ok ? 0.07 : 0);
      title(R.x + pad, R.y + 16, ctx.t('taskTitle'));
      const lh = W ? 17 : 15.5;
      let y = R.y + (W ? 30 : 28);
      const tf = `700 ${W ? 14 : 13}px ${theme.font}`;
      const rows = wrap(tr('taskText', { nom: T(NOM[k]) }), R.w - 2 * pad, tf);
      const s = cardPop.running ? Math.max(0.6, cardPop.value) : 1;
      g.save();
      g.translate(R.x + pad, y);
      g.scale(s, s);
      rows.forEach((r, i) => text(g, r, 0, lh / 2 + i * lh, { font: tf, color: theme.text, align: 'left' }));
      g.restore();
      y += rows.length * lh + 6;
      // Checkliste
      const cf = `600 ${W ? 12.5 : 12}px ${theme.font}`;
      for (const r of requirements(k, an)) {
        checkMark(R.x + pad + 8, y + 9, r.ok ? 'ok' : 'open');
        const label = r.need !== undefined ? `${T(REQ[r.id])} (${r.have}/${r.need})` : T(REQ[r.id]);
        text(g, label, R.x + pad + 24, y + 9, { font: cf, color: r.ok ? theme.text : theme.muted, align: 'left' });
        y += 22;
      }
      const bh = 28;
      const btnY = R.y + R.h - (W ? 12 : 10) - bh;
      if (!ok) {
        // Tipp nur ganz oder gar nicht (notfalls etwas kleiner)
        const space = btnY - 8 - (y + 4);
        for (const [fs, tl] of (W ? [[12, 16], [11.5, 15]] : [[11.5, 15], [11, 14]]) as [number, number][]) {
          const tf2 = `500 ${fs}px ${theme.font}`;
          const tRows = wrap(T(TIP[k]), R.w - 2 * pad, tf2);
          if (tRows.length * tl <= space) {
            textRows(tRows, R.x + pad, y + 4 + tl / 2, tl, tf2, theme.muted);
            break;
          }
        }
      }
      // Erfolg
      if (ok) {
        const hf = `800 ${W ? 15 : 14}px ${theme.font}`;
        text(g, `✓ ${ctx.t('done')}`, R.x + pad, y + 10, { font: hf, color: okC, align: 'left' });
        g.font = hf;
        const dw = g.measureText(`✓ ${ctx.t('done')} `).width;
        const rest = an.best !== k ? tr('evenMore', { best: T(NOM[an.best]), goal: T(NOM[k]) }) : tr('doneText', { nom: T(NOM[k]) });
        const rf = `600 ${W ? 12 : 11.5}px ${theme.font}`;
        const rr = wrap(rest, R.w - 2 * pad - dw, rf);
        if (rr.length === 1) text(g, rr[0]!, R.x + pad + dw, y + 10.5, { font: rf, color: theme.text, align: 'left' });
        else {
          const r2 = wrap(rest, R.w - 2 * pad, rf);
          textRows(r2.slice(0, Math.max(1, Math.floor((btnY - y - 26) / 15))), R.x + pad, y + 28, 15, rf, theme.text);
        }
      }
      if (!ctx.locked) {
        g.font = `700 ${W ? 12.5 : 12}px ${theme.font}`;
        const label = ctx.t('newTask');
        const bw = g.measureText(label).width + 28;
        button({ x: R.x + R.w - pad - bw, y: btnY, w: bw, h: bh }, label, 'new', theme.series[0]!, ok);
        const sf = `600 ${W ? 11.5 : 11}px ${theme.font}`;
        text(g, tr('solved', { n: solvedCount }), R.x + pad, btnY + bh / 2, { font: sf, color: theme.muted, align: 'left' });
      }
    }

    function infoQuiz(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 12;
      const fb = quizFeedback;
      const accent = fb ? (fb.verdict === 'wrong' ? col.bad() : col.house()) : theme.series[0]!;
      card(R, accent, fb ? 0.05 : 0.03);
      title(R.x + pad, R.y + 16, ctx.t('quizTitle'));
      const lh = W ? 16.5 : 15.5;
      let y = R.y + (W ? 30 : 28);
      const tf = `600 ${W ? 12.5 : 12}px ${theme.font}`;
      y += textRows(wrap(ctx.t('quizText'), R.w - 2 * pad, tf), R.x + pad, y + lh / 2, lh, tf, theme.text) + 6;
      if (!fb && p.marks) {
        const hf = `500 ${W ? 12 : 11.5}px ${theme.font}`;
        const rows = wrap(ctx.t('marksLegend'), R.w - 2 * pad, hf);
        const n = Math.min(rows.length, Math.floor((R.y + R.h - 34 - y) / lh));
        if (n > 0) textRows(rows.slice(0, n), R.x + pad, y + lh / 2, lh, hf, theme.muted);
      }
      if (fb) {
        const head = fb.verdict === 'partial' ? ctx.t('partial') : ctx.t('wrong');
        const s = cardPop.running ? Math.max(0.5, cardPop.value) : 1;
        g.save();
        g.translate(R.x + pad, y + 9);
        g.scale(s, s);
        text(g, `${fb.verdict === 'partial' ? '≈' : '✗'} ${head}`, 0, 0, { font: `800 ${W ? 14.5 : 13.5}px ${theme.font}`, color: accent, align: 'left' });
        g.restore();
        y += 22;
        const bf = `500 ${W ? 12 : 11.5}px ${theme.font}`;
        let body: string;
        if (fb.verdict === 'partial') body = tr('partialText', { nom: T(NOM[fb.k]) });
        else {
          const miss = requirements(fb.k, an).filter((r) => !r.ok);
          body = `${tr('wrongText', { nom: T(NOM[fb.k]) })} ${miss.map((r) => reqLabel(r)).join(', ')}.`;
        }
        const rows = wrap(body, R.w - 2 * pad, bf);
        const maxRows = Math.max(1, Math.floor((R.y + R.h - 40 - y) / lh));
        textRows(rows.slice(0, maxRows), R.x + pad, y + lh / 2, lh, bf, theme.text);
      }
      const sf = `600 ${W ? 11.5 : 11}px ${theme.font}`;
      text(g, quizTotal ? tr('quizScore', { a: quizFirst, n: quizTotal }) : ctx.t('quizScore0'), R.x + pad, R.y + R.h - (W ? 18 : 16), { font: sf, color: theme.muted, align: 'left' });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      hits = [];
      surface.begin();
      const lay = layout();
      drawPaper(lay.paper, lay.cell);
      const g = surface.g;
      g.save();
      roundRect(g, lay.paper.x, lay.paper.y, lay.paper.w, lay.paper.h, 10);
      g.clip();
      drawQuad();
      g.restore();
      g.strokeStyle = ctx.theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, lay.paper.x + 0.5, lay.paper.y + 0.5, lay.paper.w - 1, lay.paper.h - 1, 10);
      g.stroke();
      drawHouse(lay.house);
      drawInfo(lay.info);
      if (lay.props) drawProps(lay.props);
      lastShown = shown();
      const anim = morphTw.running || houseTw.running || bestPop.running || burst.running || shake.running || cardPop.running || toast !== null;
      if (anim) ctx.requestRender();
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
      }
      if (!canDrag()) return null;
      const P = shown().map((q) => toPx(q));
      let best = -1;
      let bd = wide() ? 20 : 22;
      P.forEach(([x, y], i) => {
        const d = Math.hypot(px - x, py - y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best >= 0) return `v${best}`;
      if (insidePoly(P, px, py)) return 'body';
      return null;
    }

    function insidePoly(P: [number, number][], x: number, y: number): boolean {
      let inside = false;
      for (let i = 0, j = 3; i < 4; j = i++) {
        const [xi, yi] = P[i]!;
        const [xj, yj] = P[j]!;
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }

    function tryQuad(q: Quad): void {
      if (sameQuad(q, quad)) return;
      const v = validity(q);
      if (v !== 'ok') {
        if (!toast || toast.until - performance.now() < 1200) showToast(v);
        return;
      }
      morphTw.finish();
      ctx.set({ ax: q[0][0], ay: q[0][1], bx: q[1][0], by: q[1][1], cx: q[2][0], cy: q[2][1], dx: q[3][0], dy: q[3][1] });
    }

    function tap(id: string): void {
      if (id.startsWith('node:')) {
        const k = id.slice(5) as QuadClass;
        const m = mode();
        if (m === 'einordnen' && !quizDone) answer(k);
        else if (m === 'aufgabe') {
          if (ctx.locked || k === 'viereck' || k === goal()) return;
          ctx.set({ goal: k });
          if (an.classes.includes(k)) newBuildTask(false);
          cardPop.play();
        } else {
          sel = sel === k ? null : k;
          cardPop.play();
        }
      } else if (ctx.locked) return;
      else if (id === 'example') {
        const k = sel ?? an.best;
        setQuad(randomOf(k, Math.random), true);
      } else if (id === 'new') newBuildTask(true);
      else if (id === 'next') newQuiz();
      ctx.requestRender();
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id.startsWith('v')) {
          drag = { kind: 'vertex', i: Number(id.slice(1)) };
          surface.setCursor('grabbing');
        } else if (id === 'body') {
          const [wx, wy] = toWorld(q.px, q.py);
          drag = { kind: 'move', start: [wx, wy], orig: quad };
          surface.setCursor('grabbing');
        } else tap(id);
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag || !canDrag()) return;
        const [wx, wy] = toWorld(q.px, q.py);
        if (drag.kind === 'vertex') {
          const pt: Pt = [clamp(Math.round(wx), 0, GRID_W), clamp(Math.round(wy), 0, GRID_H)];
          const vi = drag.i;
          const next = quad.map((v, i) => (i === vi ? pt : v)) as unknown as Quad;
          tryQuad(next);
        } else {
          const o = drag.orig;
          let dx = Math.round(wx - drag.start[0]);
          let dy = Math.round(wy - drag.start[1]);
          const xs = o.map((v) => v[0]);
          const ys = o.map((v) => v[1]);
          dx = clamp(dx, -Math.min(...xs), GRID_W - Math.max(...xs));
          dy = clamp(dy, -Math.min(...ys), GRID_H - Math.max(...ys));
          tryQuad(o.map((v) => [v[0] + dx, v[1] + dy] as Pt) as unknown as Quad);
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
        surface.setCursor(!id ? '' : id === 'body' ? 'move' : id.startsWith('v') ? 'grab' : 'pointer');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        const vertsChanged = ['ax', 'ay', 'bx', 'by', 'cx', 'cy', 'dx', 'dy'].some((k) => changed.has(k));
        const next = quadFromParams();
        if (vertsChanged && source === 'replace' && !sameQuad(next, lastShown)) {
          morphFrom = lastShown;
          morphTw.play();
        }
        quad = next;
        an = analyze(quad);
        const key = an.classes.join();
        if (key !== lastClassesKey && source !== 'init') houseTw.play();
        if (an.best !== lastBest && source !== 'init') bestPop.play();
        lastClassesKey = key;
        lastBest = an.best;

        // Moduswechsel von Hand: passende Aufgabe stellen
        if (changed.has('mode') && source === 'input') {
          sel = null;
          if (mode() === 'aufgabe') {
            newBuildTask(false);
            return;
          }
          if (mode() === 'einordnen') {
            newQuiz();
            return;
          }
        }
        if (changed.has('goal') && source === 'input' && mode() === 'aufgabe' && an.classes.includes(goal())) {
          newBuildTask(false);
          return;
        }
        // Einordnen: neues Viereck → neue Frage
        if (mode() === 'einordnen' && (vertsChanged || changed.has('mode')) && source !== 'sim') resetQuiz();
        if (source === 'replace' || source === 'init') {
          sel = null;
          if (mode() === 'einordnen') resetQuiz();
        }
        // Viereck bauen: geschafft?
        if (mode() === 'aufgabe') {
          const ok = an.classes.includes(goal());
          if (ok && !solved) {
            solved = true;
            if (source === 'sim' || source === 'input') {
              solvedCount++;
              burst.play();
              cardPop.play();
            }
          } else if (!ok) solved = false;
        }
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'random') {
          sel = null;
          const k = CLASSES[Math.floor(Math.random() * CLASSES.length)]!;
          setQuad(randomOf(k, Math.random), true);
        } else if (id === 'new') {
          if (mode() === 'aufgabe') newBuildTask(true);
          else if (mode() === 'einordnen') newQuiz();
        }
        updateReadouts();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
