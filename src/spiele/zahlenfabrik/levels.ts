import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import { KIT, isKitId, type KitItem, type LessonId } from './kit';
import type { Level, Op, Test } from './model';

/**
 * Level der Zahlenfabrik, geordnet in Kapitel. Jedes Kapitel bringt ein neues
 * Bauteil oder eine neue Spielregel (mit kurzer Erklärung, lessons.ts); alle
 * Bauteile aus früheren Kapiteln bleiben im Werkzeugkasten. Dadurch werden
 * spätere Level von selbst schwerer: Man muss selbst herausfinden, welche
 * Maschinen man braucht, und oft gibt es mehrere Wege.
 */
export interface LevelInfo extends Level {
  title: Localized;
  hint: Localized;
  /** Höchstens so viele eigene Maschinen (Weichen zählen nicht); 0: nur Bänder. */
  maxMachines?: number;
  /** Profi-Level (schwerer, in der Auswahl markiert). */
  pro?: boolean;
}

/** Felsen von (x1, y1) bis (x2, y2) als Rechteck. */
const rocks = (x1: number, y1: number, x2: number, y2: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) out.push([x, y]);
  return out;
};

/** Senkrechte Felswand in Spalte x (Reihen 0 … rows−1) mit Lücken in den genannten Reihen. */
const wall = (x: number, rows: number, gaps: number[]): [number, number][] =>
  Array.from({ length: rows }, (_, y) => y)
    .filter((y) => !gaps.includes(y))
    .map((y): [number, number] => [x, y]);

const fixedOp = (x: number, y: number, sym: Op['sym'], n: number) => ({ x, y, part: { op: { sym, n }, dir: 0 as const } });

/** Ganze Karte Fels, nur die genannten Felder sind frei (Gänge). */
const corridor = (cols: number, rows: number, open: [number, number][]): [number, number][] => {
  const free = new Set(open.map(([x, y]) => `${x},${y}`));
  const out: [number, number][] = [];
  for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) if (!free.has(`${x},${y}`)) out.push([x, y]);
  return out;
};

/** Gänge der Brücken-Level: ein Weg muss den anderen kreuzen (Feld 7, 3). */
const CROSS: [number, number][] = [
  [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
  [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3],
  [7, 2], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1],
  [9, 4], [9, 5], [9, 6], [9, 7], [10, 7], [11, 7],
];
const sq = (x: number, y: number) => ({ x, y, part: { op: { sym: '²' as const, n: 2 }, dir: 0 as const } });
const seq = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const table = (f: (x: number) => number, xs: number[]) => xs.map(f);
/** Zahl für Titel: deutsch mit Punkt, Minus als −. */
const fmt = (n: number) => new Intl.NumberFormat('de-DE').format(n).replace('-', '−');
const fmtEn = (n: number) => new Intl.NumberFormat('en-GB').format(n).replace('-', '−');

const even: Test = { kind: 'even' };
const div = (n: number): Test => ({ kind: 'div', n });
const gt = (n: number): Test => ({ kind: 'gt', n });
const prime: Test = { kind: 'prime' };
const square: Test = { kind: 'square' };
const yes = (test: Test) => ({ kind: 'test' as const, test });
const no = (test: Test) => ({ kind: 'test' as const, test, not: true });

/* ---------- Kapitel 1: Bänder ---------- */
const C1: LevelInfo[] = [
  {
    id: 'c1-1',
    title: L('Der erste Weg', 'The first path'),
    hint: L('Wähle „Band“ und zieh von der Quelle bis zum Lager. Dann drück auf Start.', 'Choose “Belt” and drag from the source to the storage. Then press Start.'),
    cols: 10, rows: 7,
    source: { x: 2, y: 3, dir: 0, value: 3 },
    target: { x: 7, y: 3, value: 3 }, need: 3,
    walls: [[4, 1], [5, 5], [8, 0]],
    par: 4,
  },
  {
    id: 'c1-2',
    title: L('Um die Ecke', 'Round the corner'),
    hint: L('Bänder gehen auch um die Ecke. Zieh einfach weiter, wenn du abbiegen willst.', 'Belts can turn corners too. Just keep dragging when you want to turn.'),
    cols: 11, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 5 },
    target: { x: 9, y: 6, value: 5 }, need: 3,
    walls: [...rocks(4, 0, 4, 4), ...rocks(7, 3, 7, 7)],
    par: 18,
  },
  {
    id: 'c1-3',
    title: L('Der lange Weg', 'The long way'),
    hint: L('Das Lager liegt weit oben. Mit der Hand verschiebst du die Karte, mit zwei Fingern oder dem Mausrad zoomst du.', 'The storage is far up. Move the map with the hand, zoom with two fingers or the mouse wheel.'),
    cols: 16, rows: 11,
    source: { x: 2, y: 9, dir: 0, value: 4 },
    target: { x: 13, y: 1, value: 4 }, need: 3,
    walls: rocks(0, 5, 10, 5),
    par: 18,
  },
];

/* ---------- Kapitel 2: Plus-Maschine ---------- */
const C2: LevelInfo[] = [
  {
    id: 'c2-1',
    title: L('Aus 3 wird 5', '3 becomes 5'),
    hint: L('Leg ein Band zum Lager. Wähl dann die Plus-Maschine, stell die richtige Zahl ein und tipp aufs Band.', 'Lay a belt to the storage. Then choose the plus machine, set the right number and tap the belt.'),
    cols: 14, rows: 9,
    source: { x: 3, y: 4, dir: 0, value: 3 },
    target: { x: 9, y: 4, value: 5 }, need: 3,
    walls: [[6, 1], [7, 1], [7, 2], [11, 7], [1, 7]],
    par: 5,
  },
  {
    id: 'c2-2',
    title: L('Aus 4 wird 11', '4 becomes 11'),
    hint: L('Wie viel fehlt von 4 bis 11?', 'How much is missing from 4 to 11?'),
    cols: 15, rows: 9,
    source: { x: 2, y: 3, dir: 0, value: 4 },
    target: { x: 11, y: 5, value: 11 }, need: 3,
    walls: [[6, 4], [6, 5], [7, 5], [12, 1], [3, 7]],
    par: 10,
  },
  {
    id: 'c2-3',
    title: L('Aus 2 wird 20', '2 becomes 20'),
    hint: L('Eine Plus-Maschine schafft höchstens +10. Du darfst zwei Maschinen setzen.', 'One plus machine adds at most 10. You may place two machines.'),
    cols: 15, rows: 9,
    source: { x: 2, y: 6, dir: 0, value: 2 },
    target: { x: 12, y: 2, value: 20 }, need: 3,
    walls: rocks(7, 0, 7, 5),
    maxMachines: 2,
    par: 13,
  },
  {
    id: 'c2-4',
    title: L('Aus 1 wird 31', '1 becomes 31'),
    hint: L('Höchstens drei Maschinen – und der Weg windet sich durch die Felsen.', 'At most three machines – and the path winds through the rocks.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 1 },
    target: { x: 13, y: 7, value: 31 }, need: 3,
    walls: [...rocks(4, 0, 4, 5), ...rocks(9, 3, 9, 8)],
    maxMachines: 3,
    pro: true,
    par: 25,
  },
];

/* ---------- Kapitel 3: Minus-Maschine ---------- */
const C3: LevelInfo[] = [
  {
    id: 'c3-1',
    title: L('Aus 9 wird 4', '9 becomes 4'),
    hint: L('Neu: die Minus-Maschine. Sie nimmt etwas weg.', 'New: the minus machine. It takes something away.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 9 },
    target: { x: 10, y: 3, value: 4 }, need: 3,
    walls: [[5, 2], [5, 4], [6, 2], [6, 4]],
    par: 8,
  },
  {
    id: 'c3-2',
    title: L('Unter null', 'Below zero'),
    hint: L('Das Lager will eine negative Zahl. Minus geht auch über die Null hinaus.', 'The storage wants a negative number. Minus can go below zero.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 3 },
    target: { x: 10, y: 1, value: -4 }, need: 3,
    walls: wall(5, 8, [2]),
    par: 13,
  },
  {
    id: 'c3-3',
    title: L('Zu viel des Guten', 'Too much of a good thing'),
    hint: L('Auf dem Weg steht schon +10 (das Schloss heißt: bleibt stehen). Ins Lager soll trotzdem die 3.', 'There is already a +10 on the way (the lock means: it stays). The storage still wants 3.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 8 },
    target: { x: 11, y: 3, value: 3 }, need: 3,
    walls: wall(6, 7, [3]),
    fixed: [fixedOp(6, 3, '+', 10)],
    par: 8,
  },
  {
    id: 'c3-4',
    title: L('Vorher genug', 'Enough before'),
    hint: L('Kurz vor dem Lager wird 10 abgezogen. Was muss vorher passieren, damit 13 ankommt?', 'Just before the storage, 10 is taken away. What has to happen before so that 13 arrives?'),
    cols: 14, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 6 },
    target: { x: 12, y: 5, value: 13 }, need: 3,
    walls: wall(10, 7, [5]),
    fixed: [fixedOp(10, 5, '−', 10)],
    pro: true,
    par: 13,
  },
];

/* ---------- Kapitel 4: Mal-Maschine ---------- */
const C4: LevelInfo[] = [
  {
    id: 'c4-1',
    title: L('Aus 4 wird 12', '4 becomes 12'),
    hint: L('Neu: die Mal-Maschine. Es gibt hier sogar zwei Wege – einen mit Plus und einen mit Mal.', 'New: the times machine. There are even two ways here – one with plus and one with times.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 4 },
    target: { x: 10, y: 3, value: 12 }, need: 3,
    walls: [[5, 1], [5, 2], [5, 4], [5, 5]],
    par: 8,
  },
  {
    id: 'c4-2',
    title: L('Aus 3 wird 50', '3 becomes 50'),
    hint: L('Höchstens zwei Maschinen. Welche Zahl kurz vor 50 lässt sich gut malnehmen?', 'At most two machines. Which number on the way to 50 is easy to multiply?'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 3 },
    target: { x: 11, y: 1, value: 50 }, need: 3,
    walls: wall(6, 8, [3]),
    maxMachines: 2,
    par: 14,
  },
  {
    id: 'c4-3',
    title: L('Aus 1 wird 100', '1 becomes 100'),
    hint: L('Groß denken! Höchstens zwei Maschinen.', 'Think big! At most two machines.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 1 },
    target: { x: 13, y: 7, value: 100 }, need: 3,
    walls: [...rocks(4, 0, 4, 5), ...rocks(9, 3, 9, 8)],
    maxMachines: 2,
    par: 25,
  },
  {
    id: 'c4-4',
    title: L('Aus 7 wird 50', '7 becomes 50'),
    hint: L('Höchstens zwei Maschinen. Es gibt mehr als einen Weg!', 'At most two machines. There is more than one way!'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 7 },
    target: { x: 13, y: 7, value: 50 }, need: 3,
    walls: [...rocks(3, 0, 3, 6), ...rocks(7, 2, 7, 8), ...rocks(11, 0, 11, 6)],
    maxMachines: 2,
    pro: true,
    par: 29,
  },
  {
    id: 'c4-5',
    title: L('Aus 4 wird 99', '4 becomes 99'),
    hint: L('Höchstens zwei Maschinen. 99 ist ein Vielfaches von 9 – und von 11.', 'At most two machines. 99 is a multiple of 9 – and of 11.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 7, dir: 0, value: 4 },
    target: { x: 13, y: 1, value: 99 }, need: 3,
    walls: [...rocks(4, 3, 4, 8), ...rocks(8, 0, 8, 5), ...rocks(11, 3, 13, 3)],
    maxMachines: 2,
    pro: true,
    par: 25,
  },
];

/* ---------- Kapitel 5: Geteilt-Maschine ---------- */
const C5: LevelInfo[] = [
  {
    id: 'c5-1',
    title: L('Aus 20 wird 5', '20 becomes 5'),
    hint: L('Neu: die Geteilt-Maschine. Teilen geht nur, wenn es glatt aufgeht.', 'New: the divide machine. Dividing only works if it comes out even.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 20 },
    target: { x: 10, y: 5, value: 5 }, need: 3,
    walls: [[5, 0], [5, 1], [5, 2], [5, 3]],
    par: 12,
  },
  {
    id: 'c5-2',
    title: L('Aus 20 wird 7', '20 becomes 7'),
    hint: L('Vor dem Lager steht schon −3. Was muss davor ankommen?', 'A −3 already stands in front of the storage. What has to arrive before it?'),
    cols: 15, rows: 10,
    source: { x: 2, y: 2, dir: 0, value: 20 },
    target: { x: 12, y: 7, value: 7 }, need: 3,
    walls: [...rocks(10, 6, 12, 6), ...rocks(10, 8, 12, 8), [13, 7], [5, 5], [5, 6]],
    fixed: [fixedOp(10, 7, '−', 3)],
    par: 13,
  },
  {
    id: 'c5-3',
    title: L('Glatt teilen', 'Dividing evenly'),
    hint: L('Aus 72 soll 2 werden – mit höchstens zwei Maschinen. Es gibt mehrere Wege!', '72 should become 2 – with at most two machines. There are several ways!'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 72 },
    target: { x: 10, y: 1, value: 2 }, need: 3,
    walls: wall(5, 8, [1, 6]),
    maxMachines: 2,
    par: 13,
  },
  {
    id: 'c5-4',
    title: L('Aus 100 wird 3', '100 becomes 3'),
    hint: L('Höchstens zwei Maschinen. Mit Minus allein ist es viel zu weit.', 'At most two machines. With minus alone it is much too far.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 100 },
    target: { x: 11, y: 3, value: 3 }, need: 3,
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]],
    maxMachines: 2,
    pro: true,
    par: 9,
  },
  {
    id: 'c5-5',
    title: L('Zerlege 210', 'Break down 210'),
    hint: L('Aus 210 soll 1 werden – mit höchstens drei Maschinen. 210 = 2 · 3 · 5 · 7.', '210 should become 1 – with at most three machines. 210 = 2 · 3 · 5 · 7.'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 210 },
    target: { x: 12, y: 3, value: 1 }, need: 3,
    walls: [...wall(4, 7, [1, 5]), ...wall(9, 7, [1, 5])],
    maxMachines: 3,
    pro: true,
    par: 14,
  },
];

/* ---------- Kapitel 6: Startzahl wählen (rückwärts rechnen) ---------- */
const C6: LevelInfo[] = [
  {
    id: 'c6-1',
    title: L('Was kommt hinein?', 'What goes in?'),
    hint: L('Ins Lager soll die 9, unterwegs steht +4. Stell die Startzahl ein und leg ein Band.', 'The storage wants 9, there is a +4 on the way. Set the starting number and lay a belt.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 20 } },
    target: { x: 10, y: 3, value: 9 }, need: 3,
    walls: wall(5, 7, [3]),
    fixed: [fixedOp(5, 3, '+', 4)],
    maxMachines: 0,
    par: 7,
  },
  {
    id: 'c6-2',
    title: L('Rückwärts mal', 'Backwards times'),
    hint: L('Das Lager will 24, die Maschine rechnet ×3. Rückwärts heißt: teilen!', 'The storage wants 24, the machine does ×3. Backwards means: divide!'),
    cols: 12, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 10, y: 6, value: 24 }, need: 3,
    walls: wall(6, 8, [4]),
    fixed: [fixedOp(6, 4, '×', 3)],
    maxMachines: 0,
    par: 12,
  },
  {
    id: 'c6-3',
    title: L('Zwei Schritte zurück', 'Two steps back'),
    hint: L('Erst ×2, dann +6, heraus kommt 30. Geh von hinten nach vorne.', 'First ×2, then +6, and 30 comes out. Go from back to front.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 11, y: 3, value: 30 }, need: 3,
    walls: [...wall(4, 7, [3]), ...wall(8, 7, [3])],
    fixed: [fixedOp(4, 3, '×', 2), fixedOp(8, 3, '+', 6)],
    maxMachines: 0,
    par: 7,
  },
  {
    id: 'c6-4',
    title: L('Minus wird plus', 'Minus becomes plus'),
    hint: L('×4, dann −6, heraus kommt 30. Rückwärts: Aus −6 wird +6, aus ×4 wird ÷4.', '×4, then −6, and 30 comes out. Backwards: −6 becomes +6, ×4 becomes ÷4.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 11, y: 1, value: 30 }, need: 3,
    walls: [...wall(4, 8, [6]), ...wall(8, 8, [1])],
    fixed: [fixedOp(4, 6, '×', 4), fixedOp(8, 1, '−', 6)],
    maxMachines: 0,
    par: 12,
  },
  {
    id: 'c6-5',
    title: L('Ins Lager kommt 50', '50 goes into the storage'),
    hint: L('Erst ÷2, dann +5. Die Startzahl darf groß sein.', 'First ÷2, then +5. The starting number may be big.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 1, pick: { min: 1, max: 100 } },
    target: { x: 11, y: 5, value: 50 }, need: 3,
    walls: [...wall(4, 7, [1]), ...wall(8, 7, [5])],
    fixed: [fixedOp(4, 1, '÷', 2), fixedOp(8, 5, '+', 5)],
    maxMachines: 0,
    par: 11,
  },
  {
    id: 'c6-6',
    title: L('Drei Maschinen', 'Three machines'),
    hint: L('×5, dann +15, dann ÷2 – und 40 kommt an.', '×5, then +15, then ÷2 – and 40 arrives.'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 50 } },
    target: { x: 12, y: 3, value: 40 }, need: 3,
    walls: [...wall(4, 7, [3]), ...wall(7, 7, [3]), ...wall(10, 7, [3])],
    fixed: [fixedOp(4, 3, '×', 5), fixedOp(7, 3, '+', 15), fixedOp(10, 3, '÷', 2)],
    maxMachines: 0,
    par: 7,
  },
  {
    id: 'c6-7',
    title: L('Vier Maschinen zurück', 'Four machines back'),
    hint: L('×2, −4, ÷3, +7 – und 15 kommt an. Fang hinten an!', '×2, −4, ÷3, +7 – and 15 arrives. Start at the back!'),
    cols: 15, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 50 } },
    target: { x: 13, y: 3, value: 15 }, need: 3,
    walls: [...wall(3, 7, [3]), ...wall(6, 7, [3]), ...wall(9, 7, [3]), ...wall(12, 7, [3])],
    fixed: [fixedOp(3, 3, '×', 2), fixedOp(6, 3, '−', 4), fixedOp(9, 3, '÷', 3), fixedOp(12, 3, '+', 7)],
    maxMachines: 0,
    pro: true,
    par: 7,
  },
];

/* ---------- Kapitel 7: Weiche „gerade?“ ---------- */
const C7: LevelInfo[] = [
  {
    id: 'c7-1',
    title: L('Gerade und ungerade', 'Even and odd'),
    hint: L('1 bis 6 kommen. Oben gerade Zahlen, unten ungerade. Setz die Weiche und dreh sie, bis ✓ und ✗ passen.', '1 to 6 arrive. Even numbers at the top, odd at the bottom. Place the switch and turn it until ✓ and ✗ fit.'),
    cols: 11, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 9, y: 2, need: 3, accept: yes(even) },
      { x: 9, y: 6, need: 3, accept: no(even) },
    ],
    walls: [[5, 0], [5, 8]],
    par: 11,
  },
  {
    id: 'c7-2',
    title: L('Hinter der Weiche', 'After the switch'),
    hint: L('Oben will das Lager Vielfache von 4, unten ungerade Zahlen. Eine Maschine kann auch hinter der Weiche stehen.', 'The top storage wants multiples of 4, the bottom one odd numbers. A machine can also stand after the switch.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 10, y: 1, need: 3, accept: yes(div(4)) },
      { x: 10, y: 7, need: 3, accept: no(even) },
    ],
    walls: [[6, 0], [6, 8], [6, 3], [6, 5]],
    par: 14,
  },
  {
    id: 'c7-3',
    title: L('Zwei Wege, zwei Rechnungen', 'Two paths, two calculations'),
    hint: L('Oben will das Lager Vielfache von 20, unten Zahlen größer als 10. Gerade und ungerade Zahlen brauchen verschiedene Maschinen.', 'The top storage wants multiples of 20, the bottom one numbers greater than 10. Even and odd numbers need different machines.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(div(20)) },
      { x: 11, y: 7, need: 3, accept: yes(gt(10)) },
    ],
    walls: [[6, 3], [6, 4], [6, 5]],
    pro: true,
    par: 17,
  },
];

/* ---------- Kapitel 8: Weiche „teilbar durch …?“ ---------- */
const C8: LevelInfo[] = [
  {
    id: 'c8-1',
    title: L('Vielfache von 3', 'Multiples of 3'),
    hint: L('1 bis 9: Vielfache von 3 nach oben, der Rest nach unten. Stell an der Weiche die richtige Zahl ein.', '1 to 9: multiples of 3 go up, the rest goes down. Set the right number on the switch.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 9) },
    targets: [
      { x: 10, y: 1, need: 3, accept: yes(div(3)) },
      { x: 10, y: 7, need: 6, accept: no(div(3)) },
    ],
    walls: [[6, 2], [6, 3], [6, 5], [6, 6]],
    par: 14,
  },
  {
    id: 'c8-2',
    title: L('Erst rechnen, dann sortieren', 'Calculate first, then sort'),
    hint: L('1, 3, 5, 7 kommen – keine davon ist ein Vielfaches von 4. Oben sollen aber zwei Vielfache von 4 ankommen.', '1, 3, 5, 7 arrive – none of them is a multiple of 4. But two multiples of 4 should arrive at the top.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [1, 3, 5, 7] },
    targets: [
      { x: 10, y: 2, need: 2, accept: yes(div(4)) },
      { x: 10, y: 6, need: 2, accept: no(div(4)) },
    ],
    walls: [[5, 3], [5, 4], [5, 5]],
    par: 14,
  },
  {
    id: 'c8-3',
    title: L('Drei Lager', 'Three storages'),
    hint: L('Vielfache von 3 nach oben, gerade Zahlen in die Mitte, der Rest nach unten. Welche Weiche kommt zuerst?', 'Multiples of 3 at the top, even numbers in the middle, the rest at the bottom. Which switch comes first?'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 9) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(div(3)) },
      { x: 11, y: 4, need: 3, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 3, accept: no(even) },
    ],
    walls: [[6, 0], [6, 8]],
    par: 16,
  },
  {
    id: 'c8-4',
    title: L('Fünfer, gerade, Rest', 'Fives, even, rest'),
    hint: L('Vielfache von 5 nach oben, gerade Zahlen in die Mitte, der Rest nach unten. Achtung, die 10 ist beides!', 'Multiples of 5 at the top, even numbers in the middle, the rest at the bottom. Careful, 10 is both!'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [2, 5, 8, 10, 11, 15, 4, 7] },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(div(5)) },
      { x: 11, y: 4, need: 3, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 2, accept: no(even) },
    ],
    walls: [[6, 0], [6, 8], [3, 1], [3, 7]],
    pro: true,
    par: 16,
  },
];

/* ---------- Kapitel 9: Weiche „größer als …?“ ---------- */
const C9: LevelInfo[] = [
  {
    id: 'c9-1',
    title: L('Größer als 10', 'Greater than 10'),
    hint: L('Große Zahlen (über 10) nach oben, kleine nach unten.', 'Big numbers (over 10) go up, small ones go down.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 7, dir: 0, value: 1, values: [4, 12, 7, 15, 9, 20] },
    targets: [
      { x: 10, y: 1, need: 3, accept: yes(gt(10)) },
      { x: 10, y: 7, need: 3, accept: no(gt(10)) },
    ],
    walls: [[4, 6], [4, 7], [4, 8], [8, 0], [8, 1], [8, 2]],
    par: 16,
  },
  {
    id: 'c9-2',
    title: L('Erst rechnen, dann vergleichen', 'Calculate first, then compare'),
    hint: L('2 bis 7 kommen. Oben sollen vier Zahlen größer als 10 ankommen, unten zwei kleinere.', '2 to 7 arrive. Four numbers greater than 10 should arrive at the top, two smaller ones at the bottom.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(2, 7) },
    targets: [
      { x: 11, y: 1, need: 4, accept: yes(gt(10)) },
      { x: 11, y: 7, need: 2, accept: no(gt(10)) },
    ],
    walls: [[6, 3], [6, 5], [7, 3], [7, 5]],
    par: 15,
  },
  {
    id: 'c9-3',
    title: L('Groß, mittel, klein', 'Big, medium, small'),
    hint: L('1 bis 8: Über 5 nach oben, über 2 in die Mitte, der Rest nach unten. Welche Grenze prüfst du zuerst?', '1 to 8: over 5 to the top, over 2 to the middle, the rest to the bottom. Which limit do you check first?'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 8) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(gt(5)) },
      { x: 11, y: 4, need: 3, accept: yes(gt(2)) },
      { x: 11, y: 7, need: 2, accept: no(gt(2)) },
    ],
    walls: [[6, 0], [6, 8], [3, 2], [3, 6]],
    pro: true,
    par: 16,
  },
];

/* ---------- Kapitel 10: Weiche „Primzahl?“ ---------- */
const C10: LevelInfo[] = [
  {
    id: 'c10-1',
    title: L('Primzahlen finden', 'Finding primes'),
    hint: L('2 bis 10: Primzahlen nach oben, alle anderen nach unten. Eine Primzahl hat genau zwei Teiler: 1 und sich selbst.', '2 to 10: primes go up, all others go down. A prime has exactly two divisors: 1 and itself.'),
    cols: 11, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(2, 10) },
    targets: [
      { x: 9, y: 1, need: 4, accept: yes(prime) },
      { x: 9, y: 7, need: 5, accept: no(prime) },
    ],
    walls: [[5, 0], [5, 8]],
    par: 13,
  },
  {
    id: 'c10-2',
    title: L('Prim oder nicht?', 'Prime or not?'),
    hint: L('11 bis 17 kommen. Welche davon sind Primzahlen?', '11 to 17 arrive. Which of them are primes?'),
    cols: 12, rows: 9,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(11, 17) },
    targets: [
      { x: 10, y: 1, need: 3, accept: yes(prime) },
      { x: 10, y: 7, need: 4, accept: no(prime) },
    ],
    walls: [[5, 0], [5, 1], [5, 2], [5, 3]],
    par: 17,
  },
  {
    id: 'c10-3',
    title: L('Doppelt plus eins', 'Double plus one'),
    hint: L('1 bis 6 kommen. Oben sollen fünf Primzahlen ankommen, unten eine andere Zahl. Rechne erst etwas!', '1 to 6 arrive. Five primes should arrive at the top, one other number at the bottom. Calculate something first!'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 11, y: 2, need: 5, accept: yes(prime) },
      { x: 11, y: 6, need: 1, accept: no(prime) },
    ],
    walls: [[6, 0], [6, 1], [6, 7], [6, 8]],
    par: 13,
  },
  {
    id: 'c10-4',
    title: L('Halbieren und prüfen', 'Halve and check'),
    hint: L('6, 10, 14, 15, 21, 35: Oben sollen Primzahlen ankommen, unten ungerade Zahlen.', '6, 10, 14, 15, 21, 35: primes should arrive at the top, odd numbers at the bottom.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [6, 10, 14, 15, 21, 35] },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(prime) },
      { x: 11, y: 7, need: 3, accept: no(even) },
    ],
    walls: [[4, 2], [4, 6], [8, 3], [8, 5]],
    par: 15,
  },
  {
    id: 'c10-5',
    title: L('Primzahlzwillinge', 'Twin primes'),
    hint: L('3, 5, 7 … 17 kommen. Oben sollen sechs Primzahlen ankommen, unten zwei andere Zahlen.', '3, 5, 7 … 17 arrive. Six primes should arrive at the top, two other numbers at the bottom.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [3, 5, 7, 9, 11, 13, 15, 17] },
    targets: [
      { x: 11, y: 2, need: 6, accept: yes(prime) },
      { x: 11, y: 6, need: 2, accept: no(prime) },
    ],
    walls: [[6, 0], [6, 1], [6, 7], [6, 8], [3, 3], [3, 5]],
    pro: true,
    par: 13,
  },
  {
    id: 'c10-6',
    title: L('Prim, gerade, Rest', 'Prime, even, rest'),
    hint: L('1 bis 12: Primzahlen nach oben, gerade Zahlen in die Mitte, der Rest nach unten. Die 2 ist prim und gerade – wohin damit?', '1 to 12: primes at the top, even numbers in the middle, the rest at the bottom. 2 is prime and even – where does it go?'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 12) },
    targets: [
      { x: 11, y: 1, need: 5, accept: yes(prime) },
      { x: 11, y: 4, need: 5, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 2, accept: no(even) },
    ],
    walls: [[5, 0], [5, 1], [5, 7], [5, 8]],
    pro: true,
    par: 16,
  },
];

/* ---------- Kapitel 11: Wertetabellen ---------- */
const C11: LevelInfo[] = [
  {
    id: 'c11-1',
    title: L('x + 3', 'x + 3'),
    hint: L('Für x = 1 … 5 will das Lager 4, 5, 6, 7, 8 – genau in dieser Reihenfolge.', 'For x = 1 … 5 the storage wants 4, 5, 6, 7, 8 – exactly in this order.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => x + 3, seq(1, 5)) } }],
    walls: [[5, 2], [5, 3], [5, 4]],
    par: 12,
  },
  {
    id: 'c11-2',
    title: L('2x', '2x'),
    hint: L('2x heißt 2 · x. Das Lager will 2, 4, 6, 8, 10.', '2x means 2 · x. The storage wants 2, 4, 6, 8, 10.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => 2 * x, seq(1, 5)) } }],
    walls: wall(6, 8, [6]),
    par: 13,
  },
  {
    id: 'c11-3',
    title: L('3x + 1', '3x + 1'),
    hint: L('Punkt vor Strich! Das Lager will 4, 7, 10, 13, 16.', 'Multiplication before addition! The storage wants 4, 7, 10, 13, 16.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => 3 * x + 1, seq(1, 5)) } }],
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]],
    par: 9,
  },
  {
    id: 'c11-4',
    title: L('2 · (x + 1)', '2 · (x + 1)'),
    hint: L('Die Klammer zuerst – oder findest du noch einen anderen Weg? Das Lager will 4, 6, 8, 10, 12.', 'Brackets first – or can you find another way? The storage wants 4, 6, 8, 10, 12.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => 2 * (x + 1), seq(1, 5)) } }],
    walls: wall(6, 8, [3]),
    par: 14,
  },
  {
    id: 'c11-5',
    title: L('5x − 2', '5x − 2'),
    hint: L('Das Lager will 3, 8, 13, 18, 23. Immer 5 mehr – woher kommt das?', 'The storage wants 3, 8, 13, 18, 23. Always 5 more – where does that come from?'),
    cols: 13, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 5, need: 5, accept: { kind: 'seq', values: table((x) => 5 * x - 2, seq(1, 5)) } }],
    walls: [[5, 0], [5, 1], [5, 2], [5, 3], [8, 3], [8, 4], [8, 5], [8, 6]],
    par: 17,
  },
  {
    id: 'c11-6',
    title: L('4 · (x + 1)', '4 · (x + 1)'),
    hint: L('Das Lager will 8, 12, 16, 20, 24. Es gibt mindestens zwei Wege.', 'The storage wants 8, 12, 16, 20, 24. There are at least two ways.'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 12, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => 4 * (x + 1), seq(1, 5)) } }],
    walls: [[6, 2], [6, 3], [6, 4]],
    par: 14,
  },
  {
    id: 'c11-7',
    title: L('3 · (x + 2) − 1', '3 · (x + 2) − 1'),
    hint: L('Das Lager will 8, 11, 14, 17, 20.', 'The storage wants 8, 11, 14, 17, 20.'),
    cols: 15, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 13, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => 3 * (x + 2) - 1, seq(1, 5)) } }],
    walls: [...wall(5, 8, [3]), ...wall(10, 8, [5])],
    pro: true,
    par: 20,
  },
  {
    id: 'c11-8',
    title: L('Die Regel finden', 'Find the rule'),
    hint: L('Jetzt steht keine Rechenvorschrift mehr da. Das Lager will −8, −4, 0, 4, 8. Wie groß ist der Abstand?', 'Now there is no rule written down. The storage wants −8, −4, 0, 4, 8. How big is the step?'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 12, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => 4 * (x - 3), seq(1, 5)) } }],
    walls: [[4, 2], [4, 3], [4, 4], [8, 1], [8, 2], [8, 4], [8, 5]],
    pro: true,
    par: 14,
  },
];

/* ---------- Kapitel 12: Quadrat-Maschine ---------- */
const C12: LevelInfo[] = [
  {
    id: 'c12-1',
    title: L('f(x) = x²', 'f(x) = x²'),
    hint: L('Neu: die Quadrat-Maschine rechnet x · x. Das Lager will 1, 4, 9, 16, 25.', 'New: the square machine calculates x · x. The storage wants 1, 4, 9, 16, 25.'),
    cols: 11, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 9, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => x * x, seq(1, 5)) } }],
    walls: [[5, 2], [5, 3], [5, 4]],
    par: 11,
  },
  {
    id: 'c12-2',
    title: L('f(x) = x² + 1', 'f(x) = x² + 1'),
    hint: L('Das Lager will 2, 5, 10, 17, 26.', 'The storage wants 2, 5, 10, 17, 26.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => x * x + 1, seq(1, 5)) } }],
    walls: wall(5, 8, [2]),
    par: 13,
  },
  {
    id: 'c12-3',
    title: L('f(x) = (x + 1)²', 'f(x) = (x + 1)²'),
    hint: L('Wie vorhin, nur andersherum: 4, 9, 16, 25, 36. Die Reihenfolge macht den Unterschied.', 'Like before, just the other way round: 4, 9, 16, 25, 36. The order makes the difference.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => (x + 1) ** 2, seq(1, 5)) } }],
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [7, 1], [7, 2], [7, 4], [7, 5]],
    par: 8,
  },
  {
    id: 'c12-4',
    title: L('f(x) = 2x²', 'f(x) = 2x²'),
    hint: L('2x² heißt 2 · x². Was wird zuerst gerechnet? Das Lager will 2, 8, 18, 32, 50.', '2x² means 2 · x². What is calculated first? The storage wants 2, 8, 18, 32, 50.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => 2 * x * x, seq(1, 5)) } }],
    walls: [[4, 0], [4, 1], [4, 2], [4, 3], [8, 4], [8, 5], [8, 6], [8, 7]],
    par: 15,
  },
  {
    id: 'c12-5',
    title: L('Gerade: f(x) = 3x − 1', 'Line: f(x) = 3x − 1'),
    hint: L('Diesmal x = 0 … 4. Das Lager will −1, 2, 5, 8, 11.', 'This time x = 0 … 4. The storage wants −1, 2, 5, 8, 11.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 5, dir: 0, value: 1, values: seq(0, 4) },
    targets: [{ x: 10, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => 3 * x - 1, seq(0, 4)) } }],
    walls: [[5, 3], [5, 4], [5, 5], [5, 6]],
    par: 12,
  },
  {
    id: 'c12-6',
    title: L('Parabel: f(x) = x² − 4', 'Parabola: f(x) = x² − 4'),
    hint: L('x = −2 … 2. Das Lager will 0, −3, −4, −3, 0 – die Werte fallen und steigen wieder.', 'x = −2 … 2. The storage wants 0, −3, −4, −3, 0 – the values fall and rise again.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(-2, 2) },
    targets: [{ x: 11, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => x * x - 4, seq(-2, 2)) } }],
    walls: [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5]],
    par: 15,
  },
  {
    id: 'c12-7',
    title: L('f(x) = (2x)²', 'f(x) = (2x)²'),
    hint: L('Das Lager will 4, 16, 36, 64, 100. Es gibt zwei Wege – findest du beide?', 'The storage wants 4, 16, 36, 64, 100. There are two ways – can you find both?'),
    cols: 13, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => (2 * x) ** 2, seq(1, 5)) } }],
    walls: [...rocks(4, 0, 4, 4), ...rocks(8, 3, 8, 7)],
    pro: true,
    par: 20,
  },
  {
    id: 'c12-8',
    title: L('Scheitelpunkt', 'Vertex'),
    hint: L('x = −1 … 3. Das Lager will 3, 0, −1, 0, 3 – der tiefste Punkt liegt bei x = 1.', 'x = −1 … 3. The storage wants 3, 0, −1, 0, 3 – the lowest point is at x = 1.'),
    cols: 14, rows: 8,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(-1, 3) },
    targets: [{ x: 12, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => (x - 1) ** 2 - 1, seq(-1, 3)) } }],
    walls: [[5, 2], [5, 3], [5, 4], [9, 2], [9, 3], [9, 4]],
    pro: true,
    par: 14,
  },
];


/* ---------- Kapitel: Rest-Maschine ---------- */
const C14: LevelInfo[] = [
  {
    id: 'c14-1',
    title: L('Was bleibt übrig?', 'What is left over?'),
    hint: L('Neu: die Rest-Maschine. Aus 17 soll 2 werden – mit nur einer Maschine. Bei welcher Zahl bleibt beim Teilen 2 übrig?', 'New: the remainder machine. 17 should become 2 – with just one machine. Dividing by which number leaves 2?'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 17 },
    target: { x: 10, y: 3, value: 2 }, need: 3,
    walls: [[5, 1], [5, 2], [5, 4], [5, 5]],
    maxMachines: 1,
    par: 8,
  },
  {
    id: 'c14-2',
    title: L('Immer Rest 1', 'Always remainder 1'),
    hint: L('13, 25, 37, 49 kommen – und das Lager will jedes Mal die 1. Eine Maschine reicht.', '13, 25, 37, 49 arrive – and the storage wants 1 every time. One machine is enough.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: [13, 25, 37, 49] },
    target: { x: 10, y: 1, value: 1 }, need: 4,
    walls: wall(5, 8, [2]),
    maxMachines: 1,
    par: 13,
  },
  {
    id: 'c14-3',
    title: L('Nullen und Einsen', 'Zeros and ones'),
    hint: L('1 bis 8 kommen. Oben will das Lager nur Nullen, unten nur Einsen.', '1 to 8 arrive. The top storage only wants zeros, the bottom one only ones.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 8) },
    targets: [
      { x: 11, y: 1, need: 4, accept: { kind: 'value', n: 0 } },
      { x: 11, y: 7, need: 4, accept: { kind: 'value', n: 1 } },
    ],
    walls: [[6, 3], [6, 5], [7, 3], [7, 5]],
    par: 15,
  },
  {
    id: 'c14-4',
    title: L('Wochentage', 'Days of the week'),
    hint: L('Der 3., 10., 17., 24. und 31. eines Monats sind derselbe Wochentag. Das Lager will jedes Mal die 3 – mit einer Maschine.', 'The 3rd, 10th, 17th, 24th and 31st of a month are the same weekday. The storage wants 3 every time – with one machine.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: [3, 10, 17, 24, 31] },
    target: { x: 11, y: 3, value: 3 }, need: 5,
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]],
    maxMachines: 1,
    pro: true,
    par: 9,
  },
  {
    id: 'c14-5',
    title: L('Aus 71 wird 45', '71 becomes 45'),
    hint: L('Höchstens zwei Maschinen – und nur ein Weg führt zum Ziel.', 'At most two machines – and only one way leads to the goal.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 7, dir: 0, value: 71 },
    target: { x: 13, y: 1, value: 45 }, need: 3,
    walls: [...rocks(4, 3, 4, 8), ...rocks(8, 0, 8, 5), ...rocks(11, 3, 13, 3)],
    maxMachines: 2,
    pro: true,
    par: 25,
  },
];

/* ---------- Kapitel: Quersummen-Maschine ---------- */
const C15: LevelInfo[] = [
  {
    id: 'c15-1',
    title: L('Ziffern addieren', 'Adding digits'),
    hint: L('Neu: die Quersummen-Maschine. Aus 1234 soll 10 werden.', 'New: the digit-sum machine. 1234 should become 10.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 1234 },
    target: { x: 10, y: 5, value: 10 }, need: 3,
    walls: [[5, 0], [5, 1], [5, 2], [5, 3]],
    maxMachines: 1,
    par: 12,
  },
  {
    id: 'c15-2',
    title: L('Die Neunerprobe', 'Casting out nines'),
    hint: L('18, 81, 36, 44, 52, 70 kommen. Oben will das Lager dreimal die 9, unten Zahlen, die nicht durch 3 teilbar sind.', '18, 81, 36, 44, 52, 70 arrive. The top storage wants 9 three times, the bottom one numbers not divisible by 3.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [18, 81, 36, 44, 52, 70] },
    targets: [
      { x: 10, y: 1, need: 3, accept: { kind: 'value', n: 9 } },
      { x: 10, y: 7, need: 3, accept: no(div(3)) },
    ],
    walls: [[6, 2], [6, 3], [6, 5], [6, 6]],
    par: 14,
  },
  {
    id: 'c15-3',
    title: L('Aus 7992 wird 9', '7992 becomes 9'),
    hint: L('Höchstens zwei Maschinen. Es gibt mehr als einen Weg.', 'At most two machines. There is more than one way.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 7992 },
    target: { x: 11, y: 1, value: 9 }, need: 3,
    walls: wall(6, 8, [3]),
    maxMachines: 2,
    par: 14,
  },
  {
    id: 'c15-4',
    title: L('Aus 59 wird 84', '59 becomes 84'),
    hint: L('Höchstens zwei Maschinen – und nur ein einziger Weg. Was haben 59 und 84 miteinander zu tun?', 'At most two machines – and only one single way. What do 59 and 84 have to do with each other?'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 59 },
    target: { x: 13, y: 7, value: 84 }, need: 3,
    walls: [...rocks(4, 0, 4, 5), ...rocks(9, 3, 9, 8)],
    maxMachines: 2,
    pro: true,
    par: 25,
  },
];

/* ---------- Kapitel: Wurzel-Maschine ---------- */
const C16: LevelInfo[] = [
  {
    id: 'c16-1',
    title: L('Die Wurzel', 'The square root'),
    hint: L('Neu: die Wurzel-Maschine. Welche Zahl mal sich selbst ergibt 144?', 'New: the square-root machine. Which number times itself gives 144?'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 144 },
    target: { x: 10, y: 3, value: 12 }, need: 3,
    walls: [[5, 1], [5, 2], [5, 4], [5, 5]],
    par: 8,
  },
  {
    id: 'c16-2',
    title: L('Quadratzahlen zurück', 'Square numbers back'),
    hint: L('1, 4, 9, 16, 25 kommen. Das Lager will 1, 2, 3, 4, 5.', '1, 4, 9, 16, 25 arrive. The storage wants 1, 2, 3, 4, 5.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: [1, 4, 9, 16, 25] },
    targets: [{ x: 10, y: 3, need: 5, accept: { kind: 'seq', values: seq(1, 5) } }],
    walls: [[5, 2], [5, 3], [5, 4]],
    par: 12,
  },
  {
    id: 'c16-3',
    title: L('Aus 169 wird 91', '169 becomes 91'),
    hint: L('Höchstens zwei Maschinen – und es gibt nur einen Weg.', 'At most two machines – and there is only one way.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 169 },
    target: { x: 11, y: 5, value: 91 }, need: 3,
    walls: [[5, 0], [5, 1], [5, 2], [5, 3], [8, 3], [8, 4], [8, 5], [8, 6]],
    maxMachines: 2,
    par: 17,
  },
  {
    id: 'c16-4',
    title: L('Rückwärts mit Wurzel', 'Backwards with a root'),
    hint: L('Erst √x, dann +3 – und 10 kommt an. Welche Startzahl? Achtung: Die Wurzel geht nur bei Quadratzahlen.', 'First √x, then +3 – and 10 arrives. Which starting number? Careful: the root only works for square numbers.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, pick: { min: 1, max: 100 } },
    target: { x: 11, y: 1, value: 10 }, need: 3,
    walls: [...wall(4, 8, [6]), ...wall(8, 8, [1])],
    fixed: [{ x: 4, y: 6, part: { op: { sym: '√', n: 2 }, dir: 0 } }, fixedOp(8, 1, '+', 3)],
    maxMachines: 0,
    pro: true,
    par: 12,
  },
];

/* ---------- Kapitel: Weiche „Quadratzahl?“ ---------- */
const C17: LevelInfo[] = [
  {
    id: 'c17-1',
    title: L('Quadratzahlen finden', 'Finding square numbers'),
    hint: L('1 bis 10: Quadratzahlen nach oben, alle anderen nach unten.', '1 to 10: square numbers go up, all others go down.'),
    cols: 11, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 10) },
    targets: [
      { x: 9, y: 1, need: 3, accept: yes(square) },
      { x: 9, y: 7, need: 7, accept: no(square) },
    ],
    walls: [[5, 0], [5, 8]],
    par: 13,
  },
  {
    id: 'c17-2',
    title: L('Eins mehr', 'One more'),
    hint: L('3, 5, 8, 10, 15, 20 kommen – keine Quadratzahl dabei. Oben sollen aber drei Quadratzahlen ankommen.', '3, 5, 8, 10, 15, 20 arrive – no square number among them. But three square numbers should arrive at the top.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [3, 5, 8, 10, 15, 20] },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(square) },
      { x: 11, y: 7, need: 3, accept: no(square) },
    ],
    walls: [[6, 3], [6, 5], [7, 3], [7, 5]],
    par: 15,
  },
  {
    id: 'c17-3',
    title: L('Quadrat, prim, Rest', 'Square, prime, rest'),
    hint: L('1 bis 12: Quadratzahlen nach oben, Primzahlen in die Mitte, der Rest nach unten.', '1 to 12: square numbers at the top, primes in the middle, the rest at the bottom.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 12) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(square) },
      { x: 11, y: 4, need: 5, accept: yes(prime) },
      { x: 11, y: 7, need: 4, accept: no(prime) },
    ],
    walls: [[6, 0], [6, 8]],
    pro: true,
    par: 16,
  },
];

/* ---------- Kapitel: Verteiler ---------- */
const C18: LevelInfo[] = [
  {
    id: 'c18-1',
    title: L('Doppelt geliefert', 'Delivered twice'),
    hint: L('Neu: der Verteiler. Beide Lager wollen 1, 2, 3, 4 – aber die Quelle gibt jede Zahl nur einmal aus.', 'New: the splitter. Both storages want 1, 2, 3, 4 – but the source gives out each number only once.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 4) },
    targets: [
      { x: 10, y: 1, need: 4, accept: { kind: 'seq', values: seq(1, 4) } },
      { x: 10, y: 7, need: 4, accept: { kind: 'seq', values: seq(1, 4) } },
    ],
    walls: [[6, 0], [6, 8], [4, 3], [4, 5]],
    emit: 4,
    par: 21,
  },
  {
    id: 'c18-2',
    title: L('Zwei Rechnungen', 'Two calculations'),
    hint: L('Oben will das Lager x², unten x + 10 – für dieselben Zahlen 1 bis 4.', 'The top storage wants x², the bottom one x + 10 – for the same numbers 1 to 4.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 4) },
    targets: [
      { x: 10, y: 1, need: 4, accept: { kind: 'seq', values: table((x) => x * x, seq(1, 4)) } },
      { x: 10, y: 7, need: 4, accept: { kind: 'seq', values: table((x) => x + 10, seq(1, 4)) } },
    ],
    walls: [[6, 0], [6, 8], [4, 3], [4, 5]],
    emit: 4,
    par: 21,
  },
  {
    id: 'c18-3',
    title: L('Einmal, zweimal, dreimal', 'Once, twice, three times'),
    hint: L('Drei Lager: x, 2x und 3x. Du brauchst zwei Verteiler.', 'Three storages: x, 2x and 3x. You need two splitters.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 4) },
    targets: [
      { x: 10, y: 1, need: 4, accept: { kind: 'seq', values: seq(1, 4) } },
      { x: 10, y: 4, need: 4, accept: { kind: 'seq', values: table((x) => 2 * x, seq(1, 4)) } },
      { x: 10, y: 7, need: 4, accept: { kind: 'seq', values: table((x) => 3 * x, seq(1, 4)) } },
    ],
    walls: [[6, 0], [6, 8], [5, 2], [5, 6]],
    emit: 4,
    par: 27,
  },
  {
    id: 'c18-4',
    title: L('Kopieren und sortieren', 'Copy and sort'),
    hint: L('1 bis 6: Oben will das Lager alle Zahlen verdoppelt (2, 4 … 12), in der Mitte die geraden, unten die ungeraden.', '1 to 6: the top storage wants all numbers doubled (2, 4 … 12), the middle one the even ones, the bottom one the odd ones.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 10, y: 1, need: 6, accept: { kind: 'seq', values: table((x) => 2 * x, seq(1, 6)) } },
      { x: 10, y: 4, need: 3, accept: yes(even) },
      { x: 10, y: 7, need: 3, accept: no(even) },
    ],
    walls: [[6, 0], [6, 8], [5, 2], [5, 6]],
    emit: 6,
    pro: true,
    par: 27,
  },
];

/* ---------- Kapitel: Zusammenführer ---------- */
const mergeMap = { cols: 13, rows: 7, walls: [[2, 0], [6, 0], [10, 0], [2, 5], [6, 6], [10, 5]] as [number, number][] };
const mergeLevel = (id: string, title: Localized, hint: Localized, f: (x: number) => number, maxMachines: number, pro = false, par = 14): LevelInfo => ({
  id, title, hint,
  ...mergeMap,
  source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
  targets: [{ x: 11, y: 3, need: 5, accept: { kind: 'seq', values: table(f, seq(1, 5)) } }],
  emit: 5,
  maxMachines,
  ...(pro ? { pro } : {}),
  par,
});
const C19: LevelInfo[] = [
  mergeLevel('c19-1', L('x + x', 'x + x'), L('Neu: Verteiler und Zusammenführer. Ohne Maschine soll 2, 4, 6, 8, 10 ankommen: Teile jede Zahl in zwei Kopien und führ sie wieder zusammen.', 'New: splitter and merger. Without a machine, 2, 4, 6, 8, 10 should arrive: split every number into two copies and merge them again.'), (x) => x + x, 0),
  mergeLevel('c19-2', L('x · x', 'x · x'), L('Wieder ohne Maschine: Das Lager will 1, 4, 9, 16, 25. Der Zusammenführer kann auch malnehmen.', 'Again without a machine: the storage wants 1, 4, 9, 16, 25. The merger can also multiply.'), (x) => x * x, 0),
  mergeLevel('c19-3', L('x² + x', 'x² + x'), L('Das Lager will 2, 6, 12, 20, 30 – mit nur einer Maschine. Es gibt zwei Wege!', 'The storage wants 2, 6, 12, 20, 30 – with just one machine. There are two ways!'), (x) => x * x + x, 1),
  mergeLevel('c19-4', L('x³', 'x³'), L('Hoch drei: 1, 8, 27, 64, 125 – mit nur einer Maschine.', 'Cubed: 1, 8, 27, 64, 125 – with just one machine.'), (x) => x ** 3, 1),
  mergeLevel('c19-5', L('(x + 1) · (x − 1)', '(x + 1) · (x − 1)'), L('Das Lager will 0, 3, 8, 15, 24. Zwei Maschinen, ein Zusammenführer.', 'The storage wants 0, 3, 8, 15, 24. Two machines, one merger.'), (x) => (x + 1) * (x - 1), 2),
  mergeLevel('c19-6', L('Nur eine Maschine', 'Just one machine'), L('Das Lager will 3, 8, 15, 24, 35 – mit nur einer Maschine. Schau dir die Abstände an.', 'The storage wants 3, 8, 15, 24, 35 – with just one machine. Look at the steps between them.'), (x) => x * (x + 2), 1, true),
  mergeLevel('c19-7', L('x³ − x', 'x³ − x'), L('0, 6, 24, 60, 120 – mit höchstens zwei Maschinen. Tipp: x³ − x = x · (x² − 1).', '0, 6, 24, 60, 120 – with at most two machines. Tip: x³ − x = x · (x² − 1).'), (x) => x ** 3 - x, 2, true),
  mergeLevel('c19-8', L('Zwei Quadrate', 'Two squares'), L('x² + (x + 1)²: 5, 13, 25, 41, 61 – höchstens drei Maschinen.', 'x² + (x + 1)²: 5, 13, 25, 41, 61 – at most three machines.'), (x) => x * x + (x + 1) ** 2, 3, true),
];

/* ---------- Kapitel: Brücke ---------- */
const crossLevel = (id: string, title: Localized, hint: Localized, extra: Partial<LevelInfo>): LevelInfo => ({
  id, title, hint,
  cols: 12, rows: 9,
  source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 4) },
  targets: [],
  walls: corridor(12, 9, CROSS),
  par: 21,
  ...extra,
});
const C20: LevelInfo[] = [
  crossLevel('c20-1', L('Über Kreuz', 'Criss-cross'), L('Neu: die Brücke. Die Weiche steht schon fest: Gerade Zahlen gehen geradeaus, müssen aber nach oben; ungerade gehen nach oben, müssen aber nach unten. Die Wege kreuzen sich!', 'New: the bridge. The switch is already fixed: even numbers go straight but have to go up; odd numbers go up but have to go down. The paths cross!'), {
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(even) },
      { x: 11, y: 7, need: 3, accept: no(even) },
    ],
    fixed: [{ x: 4, y: 4, part: { op: null, dir: 0, sort: even, side: 3 } }],
  }),
  crossLevel('c20-2', L('Kopien über Kreuz', 'Copies criss-cross'), L('Der Verteiler steht schon fest. Oben will das Lager x², unten x + 5.', 'The splitter is already fixed. The top storage wants x², the bottom one x + 5.'), {
    targets: [
      { x: 11, y: 1, need: 4, accept: { kind: 'seq', values: table((x) => x * x, seq(1, 4)) } },
      { x: 11, y: 7, need: 4, accept: { kind: 'seq', values: table((x) => x + 5, seq(1, 4)) } },
    ],
    fixed: [{ x: 4, y: 4, part: { op: null, dir: 0, split: true, side: 3 } }],
    emit: 4,
  }),
  crossLevel('c20-3', L('Kreuzung mit Rechnung', 'Crossing with calculation'), L('Oben will das Lager (x + 1)², unten 3x − 1. Vier Maschinen und eine Brücke.', 'The top storage wants (x + 1)², the bottom one 3x − 1. Four machines and a bridge.'), {
    targets: [
      { x: 11, y: 1, need: 4, accept: { kind: 'seq', values: table((x) => (x + 1) ** 2, seq(1, 4)) } },
      { x: 11, y: 7, need: 4, accept: { kind: 'seq', values: table((x) => 3 * x - 1, seq(1, 4)) } },
    ],
    fixed: [{ x: 4, y: 4, part: { op: null, dir: 0, split: true, side: 3 } }],
    emit: 4,
    pro: true,
  }),
];

/* ---------- Kapitel: Rätsel-Werkstatt (alle Bauteile, je genau ein Weg) ---------- */
const MAP_A = { cols: 15, rows: 9, source: { x: 1, y: 1, dir: 1 as const, value: 0 }, walls: [...rocks(4, 0, 4, 5), ...rocks(9, 3, 9, 8)], to: { x: 13, y: 7 }, par: 25 };
const MAP_B = { cols: 15, rows: 9, source: { x: 1, y: 1, dir: 1 as const, value: 0 }, walls: [...rocks(3, 0, 3, 6), ...rocks(7, 2, 7, 8), ...rocks(11, 0, 11, 6)], to: { x: 13, y: 7 }, par: 29 };
const MAP_C = { cols: 15, rows: 9, source: { x: 1, y: 7, dir: 0 as const, value: 0 }, walls: [...rocks(4, 3, 4, 8), ...rocks(8, 0, 8, 5), ...rocks(11, 3, 13, 3)], to: { x: 13, y: 1 }, par: 25 };
const MAP_D = { cols: 13, rows: 7, source: { x: 1, y: 3, dir: 0 as const, value: 0 }, walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]] as [number, number][], to: { x: 11, y: 3 }, par: 9 };
const MAP_E = { cols: 15, rows: 8, source: { x: 1, y: 1, dir: 0 as const, value: 0 }, walls: [...wall(5, 8, [1]), ...wall(10, 8, [6])], to: { x: 13, y: 6 }, par: 16 };
const MAP_F = { cols: 15, rows: 9, source: { x: 2, y: 6, dir: 0 as const, value: 0 }, walls: rocks(7, 0, 7, 5), to: { x: 12, y: 2 }, par: 13 };
type ValueMap = typeof MAP_A | typeof MAP_D;
const riddle = (id: string, map: ValueMap, from: number, to: number, maxMachines: number, pro = false): LevelInfo => ({
  id,
  title: L(`Aus ${fmt(from)} wird ${fmt(to)}`, `${fmtEn(from)} becomes ${fmtEn(to)}`),
  hint: maxMachines === 2
    ? L('Höchstens zwei Maschinen – alle Bauteile sind erlaubt, aber nur ein Weg führt zum Ziel.', 'At most two machines – all parts are allowed, but only one way leads to the goal.')
    : L('Höchstens drei Maschinen – alle Bauteile sind erlaubt, aber nur ein einziger Weg führt zum Ziel. Rechne rückwärts!', 'At most three machines – all parts are allowed, but only one single way leads to the goal. Work backwards!'),
  cols: map.cols, rows: map.rows,
  source: { ...map.source, value: from },
  target: { ...map.to, value: to }, need: 3,
  walls: map.walls,
  maxMachines,
  ...(pro ? { pro } : {}),
  par: map.par,
});
const C21: LevelInfo[] = [
  riddle('c21-1', MAP_D, 12, 138, 2),
  riddle('c21-2', MAP_F, 11, 225, 2),
  riddle('c21-3', MAP_E, 26, 116, 2),
  riddle('c21-4', MAP_D, 9, 92, 2),
  riddle('c21-5', MAP_A, 13, 502, 3),
  riddle('c21-6', MAP_C, 17, 443, 3),
  riddle('c21-7', MAP_B, 2, 329, 3, true),
  riddle('c21-8', MAP_A, 16, 1849, 3, true),
  riddle('c21-9', MAP_C, 20, 1617, 3, true),
  riddle('c21-10', MAP_B, 27, 447, 3, true),
];

/* ---------- Kapitel: Funktionen-Detektiv (Wertetabelle, Regel selbst finden) ---------- */
const SEQ_MAPS = [
  { cols: 13, rows: 7, source: { x: 1, y: 3, dir: 0 as const }, to: { x: 11, y: 3 }, walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]] as [number, number][], par: 9 },
  { cols: 12, rows: 8, source: { x: 1, y: 6, dir: 0 as const }, to: { x: 10, y: 1 }, walls: wall(5, 8, [2]), par: 13 },
  { cols: 13, rows: 7, source: { x: 1, y: 1, dir: 0 as const }, to: { x: 11, y: 5 }, walls: [[5, 0], [5, 1], [5, 2], [5, 3], [8, 3], [8, 4], [8, 5], [8, 6]] as [number, number][], par: 17 },
];
const detective = (id: string, mapIndex: number, values: number[], maxMachines: number, pro = false): LevelInfo => {
  const map = SEQ_MAPS[mapIndex]!;
  return {
    id,
    title: L(`${values.map(fmt).join(', ')}`, `${values.map(fmtEn).join(', ')}`),
    hint: L(
      `Für x = 1 … 5 will das Lager ${values.map(fmt).join(', ')}. Finde die Regel – mit höchstens ${maxMachines} Maschinen gibt es genau einen Weg.`,
      `For x = 1 … 5 the storage wants ${values.map(fmtEn).join(', ')}. Find the rule – with at most ${maxMachines} machines there is exactly one way.`,
    ),
    cols: map.cols, rows: map.rows,
    source: { ...map.source, value: 1, values: seq(1, 5) },
    targets: [{ ...map.to, need: 5, accept: { kind: 'seq', values } }],
    walls: map.walls,
    maxMachines,
    ...(pro ? { pro } : {}),
    par: map.par,
  };
};
const C22: LevelInfo[] = [
  detective('c22-1', 0, [13, 17, 21, 25, 29], 2),
  detective('c22-2', 1, [2, 3, 6, 11, 18], 3),
  detective('c22-3', 2, [28, 39, 52, 67, 84], 3),
  detective('c22-4', 0, [5, 35, 85, 155, 245], 3),
  detective('c22-5', 1, [55, 70, 95, 130, 175], 3),
  detective('c22-6', 2, [196, 324, 484, 676, 900], 3),
  detective('c22-7', 0, [16, 18, 20, 22, 14], 3, true),
  detective('c22-8', 1, [0, -4, 2, -2, -6], 3, true),
  detective('c22-9', 2, [5, 1, 3, 7, 2], 3, true),
];

/* ---------- Kapitel 13: Meisterprüfung (alles gemischt) ---------- */
const C13: LevelInfo[] = [
  {
    id: 'c13-1',
    title: L('Rückwärts quadrieren', 'Squaring backwards'),
    hint: L('x², dann +3 – und 52 kommt an. Rückwärts von x² ist die Wurzel.', 'x², then +3 – and 52 arrives. Backwards from x² is the square root.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 11, y: 1, value: 52 }, need: 3,
    walls: [...wall(4, 8, [6]), ...wall(8, 8, [1])],
    fixed: [sq(4, 6), fixedOp(8, 1, '+', 3)],
    maxMachines: 0,
    par: 12,
  },
  {
    id: 'c13-2',
    title: L('Aus 2 wird 1000', '2 becomes 1000'),
    hint: L('Höchstens drei Maschinen – alle Maschinen sind erlaubt. Es gibt viele Wege!', 'At most three machines – all machines are allowed. There are many ways!'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 2 },
    target: { x: 13, y: 7, value: 1000 }, need: 3,
    walls: [...rocks(3, 0, 3, 6), ...rocks(7, 2, 7, 8), ...rocks(11, 0, 11, 6)],
    maxMachines: 3,
    par: 29,
  },
  {
    id: 'c13-3',
    title: L('f(x) = 2x² − 3', 'f(x) = 2x² − 3'),
    hint: L('Drei Schritte in der richtigen Reihenfolge: −1, 5, 15, 29, 47.', 'Three steps in the right order: −1, 5, 15, 29, 47.'),
    cols: 15, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 13, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => 2 * x * x - 3, seq(1, 5)) } }],
    walls: [...rocks(5, 0, 5, 4), ...rocks(10, 3, 10, 7)],
    par: 22,
  },
  {
    id: 'c13-4',
    title: L('Rückwärts mit Quadrat', 'Backwards with a square'),
    hint: L('+1, dann x², dann −10 – und 54 kommt an. Welche Startzahl?', '+1, then x², then −10 – and 54 arrives. Which starting number?'),
    cols: 15, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 13, y: 3, value: 54 }, need: 3,
    walls: [...wall(4, 7, [3]), ...wall(8, 7, [3]), ...wall(11, 7, [3])],
    fixed: [fixedOp(4, 3, '+', 1), sq(8, 3), fixedOp(11, 3, '−', 10)],
    maxMachines: 0,
    par: 8,
  },
  {
    id: 'c13-5',
    title: L('Aus 8 wird 1606', '8 becomes 1606'),
    hint: L('Höchstens drei Maschinen – alle Bauteile sind erlaubt, aber nur ein einziger Weg führt zum Ziel. 1606 liegt ganz nah an einer Quadratzahl …', 'At most three machines – all parts are allowed, but only one single way leads to the goal. 1606 is very close to a square number …'),
    cols: 15, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 8 },
    target: { x: 13, y: 6, value: 1606 }, need: 3,
    walls: [...wall(5, 8, [1]), ...wall(10, 8, [6])],
    maxMachines: 3,
    pro: true,
    par: 16,
  },
  {
    id: 'c13-6',
    title: L('Großes Finale', 'Grand finale'),
    hint: L('1 bis 10 kommen. Oben sollen Zahlen über 50 ankommen, in der Mitte gerade Quadratzahlen, unten ungerade Quadratzahlen.', '1 to 10 arrive. Numbers over 50 should arrive at the top, even square numbers in the middle, odd square numbers at the bottom.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 10) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(gt(50)) },
      { x: 11, y: 4, need: 3, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 4, accept: no(even) },
    ],
    walls: [[4, 2], [4, 6], [7, 0], [7, 8]],
    pro: true,
    par: 16,
  },
];

/** Ein Kapitel: was es neu einführt, und seine Level. */
export interface Chapter {
  id: string;
  title: Localized;
  grades: string;
  /** Neue Bauteile bzw. Spielregeln (Erklärung beim ersten Öffnen). */
  teaches: LessonId[];
  levels: LevelInfo[];
}

export const CHAPTERS: Chapter[] = [
  { id: 'c1', title: L('Bänder', 'Belts'), grades: '5', teaches: ['belt'], levels: C1 },
  { id: 'c2', title: L('Plus-Maschine', 'Plus machine'), grades: '5', teaches: ['plus'], levels: C2 },
  { id: 'c3', title: L('Minus-Maschine', 'Minus machine'), grades: '5', teaches: ['minus'], levels: C3 },
  { id: 'c4', title: L('Mal-Maschine', 'Times machine'), grades: '5', teaches: ['times'], levels: C4 },
  { id: 'c5', title: L('Geteilt-Maschine', 'Divide machine'), grades: '5', teaches: ['divide'], levels: C5 },
  { id: 'c6', title: L('Rückwärts rechnen', 'Working backwards'), grades: '5', teaches: ['pick'], levels: C6 },
  { id: 'c7', title: L('Weiche „gerade?“', 'Switch “even?”'), grades: '5–6', teaches: ['even'], levels: C7 },
  { id: 'c8', title: L('Weiche „teilbar?“', 'Switch “divisible?”'), grades: '5–6', teaches: ['div'], levels: C8 },
  { id: 'c14', title: L('Rest-Maschine', 'Remainder machine'), grades: '5–6', teaches: ['mod'], levels: C14 },
  { id: 'c15', title: L('Quersummen-Maschine', 'Digit-sum machine'), grades: '5–6', teaches: ['digits'], levels: C15 },
  { id: 'c9', title: L('Weiche „größer als?“', 'Switch “greater than?”'), grades: '5–6', teaches: ['gt'], levels: C9 },
  { id: 'c10', title: L('Weiche „Primzahl?“', 'Switch “prime?”'), grades: '5–6', teaches: ['prime'], levels: C10 },
  { id: 'c11', title: L('Wertetabellen', 'Tables of values'), grades: '7–8', teaches: ['seq'], levels: C11 },
  { id: 'c12', title: L('Quadrat-Maschine', 'Square machine'), grades: '8–9', teaches: ['square'], levels: C12 },
  { id: 'c16', title: L('Wurzel-Maschine', 'Square-root machine'), grades: '8–9', teaches: ['root'], levels: C16 },
  { id: 'c17', title: L('Weiche „Quadratzahl?“', 'Switch “square number?”'), grades: '6–8', teaches: ['issquare'], levels: C17 },
  { id: 'c18', title: L('Verteiler', 'Splitter'), grades: '7–9', teaches: ['split'], levels: C18 },
  { id: 'c19', title: L('Zusammenführer', 'Merger'), grades: '8–9', teaches: ['sum', 'product'], levels: C19 },
  { id: 'c20', title: L('Brücke', 'Bridge'), grades: '7–9', teaches: ['bridge'], levels: C20 },
  { id: 'c21', title: L('Rätsel-Werkstatt', 'Puzzle workshop'), grades: '7–9', teaches: [], levels: C21 },
  { id: 'c22', title: L('Funktionen-Detektiv', 'Function detective'), grades: '8–9', teaches: [], levels: C22 },
  { id: 'c13', title: L('Meisterprüfung', 'Master exam'), grades: '7–9', teaches: [], levels: C13 },
];

export const ALL_LEVELS: LevelInfo[] = CHAPTERS.flatMap((c) => c.levels);

export const chapterOf = (level: LevelInfo): Chapter => CHAPTERS.find((c) => c.levels.includes(level))!;

/** Werkzeugkasten eines Levels: alle Bauteile aus seinem Kapitel und allen davor. */
export function kitFor(level: LevelInfo): KitItem[] {
  const upto = CHAPTERS.indexOf(chapterOf(level));
  const ids = new Set(CHAPTERS.slice(0, upto + 1).flatMap((c) => c.teaches));
  return KIT.filter((k) => ids.has(k.id));
}

/** Bauteile, die dieses Kapitel neu bringt. */
export const newIn = (chapter: Chapter): KitItem[] => KIT.filter((k) => chapter.teaches.some((t) => isKitId(t) && t === k.id));
