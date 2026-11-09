import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import { KIT, isKitId, type KitId, type KitItem, type LessonId } from './kit';
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
  /** Eigener Werkzeugkasten (Baukasten-Level); sonst nach Kapitel. */
  kit?: KitId[];
  /** Level aus dem Baukasten (eigene Level). */
  custom?: boolean;
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
  [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3],
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

/* ---------- Kapitel: Terme mit zwei Quellen ---------- */
const mergeMap = { cols: 13, rows: 7, walls: [[2, 0], [6, 0], [10, 0], [2, 5], [6, 6], [10, 5]] as [number, number][] };
/** Karte mit zwei Quellen: A (1, 3) geradeaus, B (1, 1) oben herum; Zusammenführer bei (7, 3). */
const twoMap = { cols: 13, rows: 7, walls: [[10, 0], [4, 2], [2, 5], [6, 6], [10, 5]] as [number, number][] };
/** Zwei Quellen mit eigenen Zahlen bzw. Folgen, ein Lager mit Zahl oder Folge. */
function twoSources(id: string, title: Localized, hint: Localized, a: number[], b: number[], want: number[] | number, maxMachines: number, pro = false): LevelInfo {
  const seqA = a.length > 1 ? { values: a } : {};
  const seqB = b.length > 1 ? { values: b } : {};
  return {
    id, title, hint,
    ...twoMap,
    source: { x: 1, y: 3, dir: 0, value: a[0]!, ...seqA },
    more: [{ x: 1, y: 1, dir: 0, value: b[0]!, ...seqB }],
    ...(typeof want === 'number'
      ? { target: { x: 11, y: 3, value: want }, need: 3 }
      : { targets: [{ x: 11, y: 3, need: want.length, accept: { kind: 'seq' as const, values: want } }], emit: want.length }),
    maxMachines,
    ...(pro ? { pro } : {}),
    par: 16,
  };
}
const mergeLevel = (id: string, title: Localized, hint: Localized, f: (x: number) => number, maxMachines: number, pro = false): LevelInfo =>
  twoSources(id, title, hint, seq(1, 5), seq(1, 5), table(f, seq(1, 5)), maxMachines, pro);
/** Zusammenführer-Karte mit eigener Zahlenfolge (Verteiler oder Wechsel-Weiche davor). */
function mergeLevelFrom(id: string, title: Localized, hint: Localized, values: number[], want: number[], maxMachines: number, pro = false): LevelInfo {
  return {
    id, title, hint,
    ...mergeMap,
    source: { x: 1, y: 3, dir: 0, value: 1, values },
    targets: [{ x: 11, y: 3, need: want.length, accept: { kind: 'seq', values: want } }],
    emit: values.length,
    maxMachines,
    ...(pro ? { pro } : {}),
    par: 14,
  };
}
const C19: LevelInfo[] = [
  mergeLevel('c19-1', L('x + x', 'x + x'), L('Beide Quellen geben 1 bis 5 aus. Ohne Maschine soll 2, 4, 6, 8, 10 ankommen.', 'Both sources give out 1 to 5. Without a machine, 2, 4, 6, 8, 10 should arrive.'), (x) => x + x, 0),
  mergeLevel('c19-2', L('x · x', 'x · x'), L('Wieder ohne Maschine: Das Lager will 1, 4, 9, 16, 25.', 'Again without a machine: the storage wants 1, 4, 9, 16, 25.'), (x) => x * x, 0),
  mergeLevel('c19-3', L('x² + x', 'x² + x'), L('Das Lager will 2, 6, 12, 20, 30 – mit nur einer Maschine. Es gibt zwei Wege!', 'The storage wants 2, 6, 12, 20, 30 – with just one machine. There are two ways!'), (x) => x * x + x, 1),
  mergeLevel('c19-4', L('x³', 'x³'), L('Hoch drei: 1, 8, 27, 64, 125 – mit nur einer Maschine.', 'Cubed: 1, 8, 27, 64, 125 – with just one machine.'), (x) => x ** 3, 1),
  mergeLevel('c19-5', L('(x + 1) · (x − 1)', '(x + 1) · (x − 1)'), L('Das Lager will 0, 3, 8, 15, 24. Zwei Maschinen, ein Zusammenführer.', 'The storage wants 0, 3, 8, 15, 24. Two machines, one merger.'), (x) => (x + 1) * (x - 1), 2),
  mergeLevel('c19-6', L('Nur eine Maschine', 'Just one machine'), L('Das Lager will 3, 8, 15, 24, 35 – mit nur einer Maschine. Schau dir die Abstände an.', 'The storage wants 3, 8, 15, 24, 35 – with just one machine. Look at the steps between them.'), (x) => x * (x + 2), 1, true),
  mergeLevel('c19-7', L('x³ − x', 'x³ − x'), L('0, 6, 24, 60, 120 – mit höchstens zwei Maschinen. Tipp: x³ − x = x · (x² − 1).', '0, 6, 24, 60, 120 – with at most two machines. Tip: x³ − x = x · (x² − 1).'), (x) => x ** 3 - x, 2, true),
  mergeLevel('c19-8', L('Zwei Quadrate', 'Two squares'), L('x² + (x + 1)²: 5, 13, 25, 41, 61 – höchstens drei Maschinen.', 'x² + (x + 1)²: 5, 13, 25, 41, 61 – at most three machines.'), (x) => x * x + (x + 1) ** 2, 3, true),
];

/* ---------- Kapitel: Zwei Quellen und Zusammenführer (früh) ---------- */
const C28: LevelInfo[] = [
  twoSources('c28-1', L('Zwei Quellen', 'Two sources'), L('Neu: zwei Quellen und der Zusammenführer. Die eine gibt 3 aus, die andere 4 – das Lager will 7. Führ beide Bänder in einem Zusammenführer „a+b“ zusammen.', 'New: two sources and the merger. One gives out 3, the other 4 – the storage wants 7. Bring both belts together in an “a+b” merger.'), [3], [4], 7, 0),
  twoSources('c28-2', L('Malnehmen', 'Multiplying'), L('6 und 7 kommen, das Lager will 42 – ohne Maschine.', '6 and 7 arrive, the storage wants 42 – without a machine.'), [6], [7], 42, 0),
  twoSources('c28-3', L('Zwei Reihen', 'Two rows'), L('Die eine Quelle gibt 1 bis 5 aus, die andere 10, 20 … 50. Das Lager will 11, 22, 33, 44, 55.', 'One source gives out 1 to 5, the other 10, 20 … 50. The storage wants 11, 22, 33, 44, 55.'), seq(1, 5), [10, 20, 30, 40, 50], [11, 22, 33, 44, 55], 0),
  twoSources('c28-4', L('Der Unterschied', 'The difference'), L('9, 4, 15, 8 und 2, 10, 6, 8 kommen. Das Lager will 7, 6, 9, 0 – wie weit liegen die Zahlen auseinander?', '9, 4, 15, 8 and 2, 10, 6, 8 arrive. The storage wants 7, 6, 9, 0 – how far apart are the numbers?'), [9, 4, 15, 8], [2, 10, 6, 8], [7, 6, 9, 0], 0),
  twoSources('c28-5', L('Wie oft passt es hinein?', 'How many times does it fit?'), L('12, 5, 36, 7 und 3, 20, 4, 49 kommen. Das Lager will 4, 4, 9, 7.', '12, 5, 36, 7 and 3, 20, 4, 49 arrive. The storage wants 4, 4, 9, 7.'), [12, 5, 36, 7], [3, 20, 4, 49], [4, 4, 9, 7], 0),
  twoSources('c28-6', L('Erst rechnen, dann zusammen', 'Calculate first, then merge'), L('Beide Quellen geben 1 bis 5 aus. Das Lager will 2, 6, 12, 20, 30 – mit nur einer Maschine.', 'Both sources give out 1 to 5. The storage wants 2, 6, 12, 20, 30 – with just one machine.'), seq(1, 5), seq(1, 5), [2, 6, 12, 20, 30], 1, true),
  twoSources('c28-7', L('Doppelt und dazu', 'Double and more'), L('2, 3, 4 und 5, 6, 7 kommen. Das Lager will 9, 12, 15 – mit nur einer Maschine.', '2, 3, 4 and 5, 6, 7 arrive. The storage wants 9, 12, 15 – with just one machine.'), [2, 3, 4], [5, 6, 7], [9, 12, 15], 1, true),
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
  crossLevel('c20-2', L('Zwei Quellen über Kreuz', 'Two sources criss-cross'), L('Zwei Quellen geben 1 bis 4 aus. Oben will das Lager x², unten x + 5 – die Wege kreuzen sich.', 'Two sources give out 1 to 4. The top storage wants x², the bottom one x + 5 – the paths cross.'), {
    targets: [
      { x: 11, y: 1, need: 4, accept: { kind: 'seq', values: table((x) => x * x, seq(1, 4)) } },
      { x: 11, y: 7, need: 4, accept: { kind: 'seq', values: table((x) => x + 5, seq(1, 4)) } },
    ],
    more: [{ x: 3, y: 3, dir: 0, value: 1, values: seq(1, 4) }],
    emit: 4,
    par: 22,
  }),
  crossLevel('c20-3', L('Kreuzung mit Rechnung', 'Crossing with calculation'), L('Oben will das Lager (x + 1)², unten 3x − 1. Vier Maschinen und eine Brücke.', 'The top storage wants (x + 1)², the bottom one 3x − 1. Four machines and a bridge.'), {
    targets: [
      { x: 11, y: 1, need: 4, accept: { kind: 'seq', values: table((x) => (x + 1) ** 2, seq(1, 4)) } },
      { x: 11, y: 7, need: 4, accept: { kind: 'seq', values: table((x) => 3 * x - 1, seq(1, 4)) } },
    ],
    more: [{ x: 3, y: 3, dir: 0, value: 1, values: seq(1, 4) }],
    emit: 4,
    pro: true,
    par: 22,
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


/* ---------- Kapitel: Vorzeichen und Betrag ---------- */
const C23: LevelInfo[] = [
  {
    id: 'c23-1',
    title: L('Spiegeln an der Null', 'Mirroring at zero'),
    hint: L('Neu: Vorzeichen- und Betrags-Maschine. Aus 12 soll −12 werden – mit einer Maschine.', 'New: sign and absolute-value machines. 12 should become −12 – with one machine.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 12 },
    target: { x: 10, y: 3, value: -12 }, need: 3,
    walls: [[5, 1], [5, 2], [5, 4], [5, 5]],
    maxMachines: 1,
    par: 8,
  },
  {
    id: 'c23-2',
    title: L('Nur der Abstand', 'Only the distance'),
    hint: L('−3, −1, 2, −4 kommen. Das Lager will 3, 1, 2, 4 – mit einer Maschine.', '−3, −1, 2, −4 arrive. The storage wants 3, 1, 2, 4 – with one machine.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: [-3, -1, 2, -4] },
    targets: [{ x: 10, y: 1, need: 4, accept: { kind: 'seq', values: [3, 1, 2, 4] } }],
    walls: wall(5, 8, [2]),
    maxMachines: 1,
    par: 13,
  },
  {
    id: 'c23-3',
    title: L('Abstand zur 10', 'Distance from 10'),
    hint: L('4, 13, 8, 15, 10 kommen. Das Lager will, wie weit jede Zahl von der 10 entfernt ist: 6, 3, 2, 5, 0.', '4, 13, 8, 15, 10 arrive. The storage wants how far each number is from 10: 6, 3, 2, 5, 0.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: [4, 13, 8, 15, 10] },
    targets: [{ x: 11, y: 3, need: 5, accept: { kind: 'seq', values: [6, 3, 2, 5, 0] } }],
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]],
    maxMachines: 2,
    par: 9,
  },
  {
    id: 'c23-4',
    title: L('Umgedrehte Parabel', 'Upside-down parabola'),
    hint: L('Für x = 1 … 5 will das Lager −1, −4, −9, −16, −25 – mit höchstens zwei Maschinen.', 'For x = 1 … 5 the storage wants −1, −4, −9, −16, −25 – with at most two machines.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 5, need: 5, accept: { kind: 'seq', values: table((x) => -(x * x), seq(1, 5)) } }],
    walls: [[5, 0], [5, 1], [5, 2], [5, 3], [8, 3], [8, 4], [8, 5], [8, 6]],
    maxMachines: 2,
    pro: true,
    par: 17,
  },
];

/* ---------- Kapitel: Spiegel-Maschine ---------- */
const C24: LevelInfo[] = [
  {
    id: 'c24-1',
    title: L('Rückwärts gelesen', 'Read backwards'),
    hint: L('Neu: die Spiegel-Maschine. Aus 123 soll 321 werden.', 'New: the mirror machine. 123 should become 321.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 123 },
    target: { x: 10, y: 5, value: 321 }, need: 3,
    walls: [[5, 0], [5, 1], [5, 2], [5, 3]],
    maxMachines: 1,
    par: 12,
  },
  twoSources('c24-2', L('Zahl plus Spiegelzahl', 'Number plus mirror number'), L('Beide Quellen geben 12, 23, 34, 45, 56 aus. Das Lager will jede Zahl plus ihre Spiegelzahl: 33, 55, 77, 99, 121 – mit einer Maschine.', 'Both sources give out 12, 23, 34, 45, 56. The storage wants each number plus its mirror number: 33, 55, 77, 99, 121 – with one machine.'), [12, 23, 34, 45, 56], [12, 23, 34, 45, 56], [33, 55, 77, 99, 121], 1),
  {
    id: 'c24-3',
    title: L('Aus 13 wird 961', '13 becomes 961'),
    hint: L('Höchstens zwei Maschinen. 961 ist eine Quadratzahl.', 'At most two machines. 961 is a square number.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 13 },
    target: { x: 11, y: 1, value: 961 }, need: 3,
    walls: wall(6, 8, [3]),
    maxMachines: 2,
    pro: true,
    par: 14,
  },
];

/* ---------- Kapitel: Runden-Maschine ---------- */
const C25: LevelInfo[] = [
  {
    id: 'c25-1',
    title: L('Auf Zehner runden', 'Rounding to tens'),
    hint: L('Neu: die Runden-Maschine. Aus 47 soll 50 werden – es gibt zwei Wege mit einer Maschine.', 'New: the rounding machine. 47 should become 50 – there are two ways with one machine.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 47 },
    target: { x: 10, y: 3, value: 50 }, need: 3,
    walls: [[5, 1], [5, 2], [5, 4], [5, 5]],
    maxMachines: 1,
    par: 8,
  },
  {
    id: 'c25-2',
    title: L('Auf Hunderter runden', 'Rounding to hundreds'),
    hint: L('123, 456, 789, 150 kommen. Das Lager will 100, 500, 800, 200.', '123, 456, 789, 150 arrive. The storage wants 100, 500, 800, 200.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: [123, 456, 789, 150] },
    targets: [{ x: 10, y: 1, need: 4, accept: { kind: 'seq', values: [100, 500, 800, 200] } }],
    walls: wall(5, 8, [2]),
    maxMachines: 1,
    par: 13,
  },
  {
    id: 'c25-3',
    title: L('Überschlagen', 'Estimating'),
    hint: L('19, 31, 48, 52 kommen. Das Lager will ungefähr das Doppelte: 40, 60, 100, 100.', '19, 31, 48, 52 arrive. The storage wants roughly double: 40, 60, 100, 100.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: [19, 31, 48, 52] },
    targets: [{ x: 11, y: 3, need: 4, accept: { kind: 'seq', values: [40, 60, 100, 100] } }],
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]],
    maxMachines: 2,
    par: 9,
  },
  {
    id: 'c25-4',
    title: L('50, 60, 70, 70, 80', '50, 60, 70, 70, 80'),
    hint: L('Für x = 1 … 5 will das Lager 50, 60, 70, 70, 80 – mit höchstens drei Maschinen gibt es genau einen Weg.', 'For x = 1 … 5 the storage wants 50, 60, 70, 70, 80 – with at most three machines there is exactly one way.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 5, need: 5, accept: { kind: 'seq', values: [50, 60, 70, 70, 80] } }],
    walls: [[5, 0], [5, 1], [5, 2], [5, 3], [8, 3], [8, 4], [8, 5], [8, 6]],
    maxMachines: 3,
    pro: true,
    par: 17,
  },
];

/* ---------- Kapitel: Wechsel-Weiche ---------- */
const C26: LevelInfo[] = [
  {
    id: 'c26-1',
    title: L('Abwechselnd', 'Taking turns'),
    hint: L('Neu: die Wechsel-Weiche. 5, 5, 8, 8, 3, 3 kommen – beide Lager wollen 5, 8, 3. Keine andere Weiche kann das!', 'New: the alternator. 5, 5, 8, 8, 3, 3 arrive – both storages want 5, 8, 3. No other switch can do that!'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [5, 5, 8, 8, 3, 3] },
    targets: [
      { x: 10, y: 1, need: 3, accept: { kind: 'seq', values: [5, 8, 3] } },
      { x: 10, y: 7, need: 3, accept: { kind: 'seq', values: [5, 8, 3] } },
    ],
    walls: [[6, 0], [6, 8], [4, 3], [4, 5]],
    par: 21,
  },
  {
    id: 'c26-2',
    title: L('Erste und zweite', 'First and second'),
    hint: L('3, 3, 4, 4, 7, 7, 8, 8 kommen. Oben will das Lager 30, 40, 70, 80, unten 13, 14, 17, 18.', '3, 3, 4, 4, 7, 7, 8, 8 arrive. The top storage wants 30, 40, 70, 80, the bottom one 13, 14, 17, 18.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [3, 3, 4, 4, 7, 7, 8, 8] },
    targets: [
      { x: 10, y: 1, need: 4, accept: { kind: 'seq', values: [30, 40, 70, 80] } },
      { x: 10, y: 7, need: 4, accept: { kind: 'seq', values: [13, 14, 17, 18] } },
    ],
    walls: [[6, 0], [6, 8], [4, 3], [4, 5]],
    par: 21,
  },
  mergeLevelFrom('c26-3', L('Paare malnehmen', 'Multiplying pairs'), L('1 bis 6 kommen. Das Lager will 1 · 2, 3 · 4, 5 · 6 = 2, 12, 30 – ganz ohne Maschine.', '1 to 6 arrive. The storage wants 1 · 2, 3 · 4, 5 · 6 = 2, 12, 30 – without any machine.'), seq(1, 6), [2, 12, 30], 0, true),
];

/* ---------- Kapitel: Großmeister (alle Bauteile) ---------- */
const C27: LevelInfo[] = [
  riddle('c27-1', MAP_A, 15, 2603, 3),
  riddle('c27-2', MAP_C, 22, -1024, 3),
  riddle('c27-3', MAP_B, 44, 1906, 3, true),
  detective('c27-4', 0, [9, 71, 52, 33, 14], 3),
  detective('c27-5', 1, [30, 20, 10, 0, 0], 3, true),
  { ...detective('c27-6', 2, [6, 2, 10, 18, 26], 3, true), source: { x: 1, y: 1, dir: 0, value: 1, values: seq(-2, 2) }, hint: L('Für x = −2 … 2 will das Lager 6, 2, 10, 18, 26. Finde die Regel – mit höchstens 3 Maschinen gibt es genau einen Weg.', 'For x = −2 … 2 the storage wants 6, 2, 10, 18, 26. Find the rule – with at most 3 machines there is exactly one way.') },
  mergeLevelFrom('c27-7', L('Nachbarn addieren', 'Adding neighbours'), L('1 bis 8 kommen. Das Lager will 1 + 2, 3 + 4, 5 + 6, 7 + 8 – ganz ohne Maschine.', '1 to 8 arrive. The storage wants 1 + 2, 3 + 4, 5 + 6, 7 + 8 – without any machine.'), seq(1, 8), [3, 7, 11, 15], 0, true),
  mergeLevelFrom('c27-8', L('Paare und eins weniger', 'Pairs and one less'), L('1 bis 6 kommen. Das Lager will 1, 11, 29 – mit nur einer Maschine.', '1 to 6 arrive. The storage wants 1, 11, 29 – with just one machine.'), seq(1, 6), [1, 11, 29], 1, true),
  riddle('c27-9', MAP_E, 28, 911, 3, true),
  riddle('c27-10', MAP_A, 61, 4004, 3, true),
];


/* ---------- Kapitel: Brüche ---------- */
const C29: LevelInfo[] = [
  {
    id: 'c29-1',
    title: L('Die Hälfte', 'One half'),
    hint: L('Neu: Bruch- und Kehrwert-Maschine. Aus 3 soll 3/2 werden.', 'New: fraction and reciprocal machines. 3 should become 3/2.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 3 },
    target: { x: 10, y: 3, value: 3 / 2 }, need: 3,
    walls: [[5, 1], [5, 2], [5, 4], [5, 5]],
    maxMachines: 1,
    par: 8,
  },
  {
    id: 'c29-2',
    title: L('Drei Viertel', 'Three quarters'),
    hint: L('Aus 3 soll 3/4 werden – mit einer Maschine.', '3 should become 3/4 – with one machine.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 3 },
    target: { x: 10, y: 1, value: 3 / 4 }, need: 3,
    walls: wall(5, 8, [2]),
    maxMachines: 1,
    par: 13,
  },
  {
    id: 'c29-3',
    title: L('Kürzen', 'Reducing'),
    hint: L('Aus 6 soll 2/3 werden – mit einer Maschine. 2/3 ist dasselbe wie 4/6 oder 6/9.', '6 should become 2/3 – with one machine. 2/3 is the same as 4/6 or 6/9.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 6 },
    target: { x: 10, y: 5, value: 2 / 3 }, need: 3,
    walls: [[5, 0], [5, 1], [5, 2], [5, 3]],
    maxMachines: 1,
    par: 12,
  },
  {
    id: 'c29-4',
    title: L('Stammbrüche', 'Unit fractions'),
    hint: L('1 bis 5 kommen. Das Lager will 1, 1/2, 1/3, 1/4, 1/5.', '1 to 5 arrive. The storage wants 1, 1/2, 1/3, 1/4, 1/5.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => 1 / x, seq(1, 5)) } }],
    walls: [[5, 2], [5, 3], [5, 4]],
    maxMachines: 1,
    par: 12,
  },
  twoSources('c29-5', L('Halbe plus Drittel', 'Half plus third'), L('Die eine Quelle gibt 2 aus, die andere 3. Das Lager will 1/2 + 1/3 = 5/6.', 'One source gives out 2, the other 3. The storage wants 1/2 + 1/3 = 5/6.'), [2], [3], 5 / 6, 2),
  twoSources('c29-6', L('x durch (x + 1)', 'x over (x + 1)'), L('Beide Quellen geben 1 bis 5 aus. Das Lager will 1/2, 2/3, 3/4, 4/5, 5/6 – mit zwei Maschinen.', 'Both sources give out 1 to 5. The storage wants 1/2, 2/3, 3/4, 4/5, 5/6 – with two machines.'), seq(1, 5), seq(1, 5), table((x) => x / (x + 1), seq(1, 5)), 2, true),
  twoSources('c29-7', L('Halbe und Drittel addieren', 'Adding halves and thirds'), L('Beide Quellen geben 1 bis 4 aus. Das Lager will x/2 + x/3: 5/6, 5/3, 5/2, 10/3.', 'Both sources give out 1 to 4. The storage wants x/2 + x/3: 5/6, 5/3, 5/2, 10/3.'), seq(1, 4), seq(1, 4), table((x) => x / 2 + x / 3, seq(1, 4)), 2, true),
];

/* ---------- Kapitel: Gleichungen ---------- */
/** Waage: zwei Quellen mit derselben Zahl x, Seiten in Reihe 1 und 3, Vergleich (Differenz) bei (7, 3), Lager will 0. */
const EQ_OPEN: [number, number][] = [
  ...Array.from({ length: 7 }, (_, i): [number, number] => [1 + i, 1]),
  [7, 2],
  ...Array.from({ length: 11 }, (_, i): [number, number] => [1 + i, 3]),
];
type FixedOp = { x: number; y: number; part: { op: Op; dir: 0 } };
function balance(id: string, title: Localized, hint: Localized, left: FixedOp[], right: FixedOp[], pro = false): LevelInfo {
  // 15 freie Felder für Bänder (siehe EQ_OPEN), ohne die vorgegebenen Maschinen
  return {
    id, title, hint,
    cols: 13, rows: 5,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 20 } },
    more: [{ x: 1, y: 1, dir: 0, value: 1, pick: true }],
    target: { x: 11, y: 3, value: 0 }, need: 3,
    walls: corridor(13, 5, EQ_OPEN),
    fixed: [...left, ...right.map((f) => ({ ...f, y: 1 })), { x: 7, y: 3, part: { op: null, dir: 0, merge: '−' } }],
    maxMachines: 0,
    ...(pro ? { pro } : {}),
    par: 15 - left.length - right.length,
  };
}
const C30: LevelInfo[] = [
  {
    id: 'c30-1',
    title: L('x + 7 = 12', 'x + 7 = 12'),
    hint: L('Neu: Gleichungen. Welche Zahl x gibt plus 7 die 12? Stell x ein und leg Bänder.', 'New: equations. Which number x plus 7 gives 12? Set x and lay belts.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 20 } },
    target: { x: 10, y: 3, value: 12 }, need: 3,
    walls: wall(5, 7, [3]),
    fixed: [fixedOp(5, 3, '+', 7)],
    maxMachines: 0,
    par: 7,
  },
  {
    id: 'c30-2',
    title: L('3 · x = 21', '3 · x = 21'),
    hint: L('Welche Zahl mal 3 ergibt 21?', 'Which number times 3 gives 21?'),
    cols: 12, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, pick: { min: 1, max: 20 } },
    target: { x: 10, y: 6, value: 21 }, need: 3,
    walls: wall(6, 8, [4]),
    fixed: [fixedOp(6, 4, '×', 3)],
    maxMachines: 0,
    par: 12,
  },
  {
    id: 'c30-3',
    title: L('3x + 5 = 20', '3x + 5 = 20'),
    hint: L('Erst mal 3, dann plus 5 – und 20 kommt heraus. Rückwärts: 20 − 5, dann durch 3.', 'First times 3, then plus 5 – and 20 comes out. Backwards: 20 − 5, then divided by 3.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 20 } },
    target: { x: 11, y: 3, value: 20 }, need: 3,
    walls: [...wall(4, 7, [3]), ...wall(8, 7, [3])],
    fixed: [fixedOp(4, 3, '×', 3), fixedOp(8, 3, '+', 5)],
    maxMachines: 0,
    par: 7,
  },
  {
    id: 'c30-4',
    title: L('2 · (x − 3) = 10', '2 · (x − 3) = 10'),
    hint: L('Die Klammer zuerst: x − 3, dann mal 2.', 'Brackets first: x − 3, then times 2.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, pick: { min: 1, max: 20 } },
    target: { x: 11, y: 1, value: 10 }, need: 3,
    walls: [...wall(4, 8, [6]), ...wall(8, 8, [1])],
    fixed: [fixedOp(4, 6, '−', 3), fixedOp(8, 1, '×', 2)],
    maxMachines: 0,
    par: 12,
  },
  balance('c30-5', L('2x + 3 = x + 7', '2x + 3 = x + 7'), L('Zwei Quellen geben dasselbe x aus: unten wird 2x + 3 gerechnet, oben x + 7. Der Zusammenführer vergleicht – kommt 0 an, stimmt x.', 'Two sources give out the same x: below, 2x + 3 is calculated, above x + 7. The merger compares – if 0 arrives, x is right.'),
    [fixedOp(3, 3, '×', 2), fixedOp(5, 3, '+', 3)], [fixedOp(3, 1, '+', 7)]),
  balance('c30-6', L('5x − 4 = 3x + 6', '5x − 4 = 3x + 6'), L('Unten 5x − 4, oben 3x + 6. Für welches x sind beide Seiten gleich?', 'Below 5x − 4, above 3x + 6. For which x are both sides equal?'),
    [fixedOp(3, 3, '×', 5), fixedOp(5, 3, '−', 4)], [fixedOp(3, 1, '×', 3), fixedOp(5, 1, '+', 6)]),
  balance('c30-7', L('x² = 4x + 5', 'x² = 4x + 5'), L('Unten x², oben 4x + 5. Probier geschickt – oder rechne nach: x² − 4x − 5 = 0.', 'Below x², above 4x + 5. Try cleverly – or check: x² − 4x − 5 = 0.'),
    [sq(3, 3)], [fixedOp(3, 1, '×', 4), fixedOp(5, 1, '+', 5)], true),
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

/* ---------- Kapitel: Zähler-Maschine (Maschine mit Gedächtnis) ---------- */
/** Weitere Karten für Folgen-Level (Quelle → Lager mit Platz für drei Maschinen). */
const MEM_MAPS = [
  { cols: 13, rows: 7, source: { x: 1, y: 3, dir: 0 as const }, to: { x: 11, y: 3 }, walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]] as [number, number][], par: 9 },
  { cols: 12, rows: 8, source: { x: 1, y: 6, dir: 0 as const }, to: { x: 10, y: 1 }, walls: wall(5, 8, [2]), par: 13 },
  { cols: 13, rows: 7, source: { x: 1, y: 1, dir: 0 as const }, to: { x: 11, y: 5 }, walls: [[5, 0], [5, 1], [5, 2], [5, 3], [8, 3], [8, 4], [8, 5], [8, 6]] as [number, number][], par: 17 },
  { cols: 14, rows: 8, source: { x: 1, y: 4, dir: 0 as const }, to: { x: 12, y: 4 }, walls: [...rocks(5, 2, 5, 6), ...rocks(9, 0, 9, 4)], par: 16 },
];
/** Level mit eigener Zahlenfolge aus der Quelle und Wertetabelle im Lager (Zähler, Sammler). */
const seqLevel = (id: string, title: Localized, hint: Localized, mapIndex: number, values: number[], want: number[], maxMachines: number, pro = false): LevelInfo => {
  const map = MEM_MAPS[mapIndex]!;
  return {
    id, title, hint,
    cols: map.cols, rows: map.rows,
    source: { ...map.source, value: values[0]!, values },
    targets: [{ ...map.to, need: want.length, accept: { kind: 'seq', values: want } }],
    walls: map.walls,
    maxMachines,
    ...(pro ? { pro } : {}),
    par: map.par,
  };
};
const C31: LevelInfo[] = [
  seqLevel('c31-1', L('Zählen', 'Counting'), L('Neu: die Zähler-Maschine. Viermal die 7 kommt – das Lager will 1, 2, 3, 4. Der Zähler gibt jeder Zahl ihre Nummer.', 'New: the counter machine. The 7 arrives four times – the storage wants 1, 2, 3, 4. The counter gives every number its position.'), 0, [7, 7, 7, 7], [1, 2, 3, 4], 1),
  seqLevel('c31-2', L('Die Zweierreihe', 'The twos'), L('4, 9, 2, 7, 5 kommen durcheinander. Das Lager will 2, 4, 6, 8, 10 – mit zwei Maschinen.', '4, 9, 2, 7, 5 arrive in a jumble. The storage wants 2, 4, 6, 8, 10 – with two machines.'), 1, [4, 9, 2, 7, 5], [2, 4, 6, 8, 10], 2),
  seqLevel('c31-3', L('Quadratzahlen aus allem', 'Square numbers from anything'), L('3, 1, 4, 1, 5 kommen. Das Lager will 1, 4, 9, 16, 25 – egal, was hineinkommt.', '3, 1, 4, 1, 5 arrive. The storage wants 1, 4, 9, 16, 25 – whatever comes in.'), 2, [3, 1, 4, 1, 5], [1, 4, 9, 16, 25], 2),
  seqLevel('c31-4', L('Ungerade Zahlen', 'Odd numbers'), L('Fünfmal die 6 kommt. Das Lager will 1, 3, 5, 7, 9 – höchstens drei Maschinen.', 'The 6 arrives five times. The storage wants 1, 3, 5, 7, 9 – at most three machines.'), 3, [6, 6, 6, 6, 6], [1, 3, 5, 7, 9], 3),
  {
    id: 'c31-5',
    title: L('Erste, zweite, dritte', 'First, second, third'),
    hint: L('Sechsmal die 5 kommt. Oben will das Lager 2, 4, 6, unten 1, 3, 5. Welche Nummer hat jede Zahl?', 'The 5 arrives six times. The top storage wants 2, 4, 6, the bottom one 1, 3, 5. Which position does every number have?'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 5, values: [5, 5, 5, 5, 5, 5] },
    targets: [
      { x: 10, y: 1, need: 3, accept: { kind: 'seq', values: [2, 4, 6] } },
      { x: 10, y: 7, need: 3, accept: { kind: 'seq', values: [1, 3, 5] } },
    ],
    walls: [[6, 0], [6, 8], [4, 3], [4, 5]],
    pro: true,
    par: 14,
  },
  twoSources('c31-6', L('Zahl mal Nummer', 'Number times position'), L('Beide Quellen geben 3, 8, 1, 5 aus. Das Lager will jede Zahl mal ihre Nummer: 3, 16, 3, 20 – mit einer Maschine.', 'Both sources give out 3, 8, 1, 5. The storage wants every number times its position: 3, 16, 3, 20 – with one machine.'), [3, 8, 1, 5], [3, 8, 1, 5], [3, 16, 3, 20], 1, true),
];

/* ---------- Kapitel: Sammel-Maschine (Summe aller Zahlen bisher) ---------- */
const C32: LevelInfo[] = [
  seqLevel('c32-1', L('Dreieckszahlen', 'Triangular numbers'), L('Neu: die Sammel-Maschine. 1 bis 5 kommen – das Lager will 1, 3, 6, 10, 15. Jede Zahl wird zu allem dazugezählt, was vorher kam.', 'New: the collector machine. 1 to 5 arrive – the storage wants 1, 3, 6, 10, 15. Every number is added to everything that came before.'), 0, seq(1, 5), [1, 3, 6, 10, 15], 1),
  seqLevel('c32-2', L('Die Zehnerreihe', 'The tens'), L('Viermal die 10 kommt. Das Lager will 10, 20, 30, 40 – mit nur einer Maschine.', 'The 10 arrives four times. The storage wants 10, 20, 30, 40 – with just one machine.'), 1, [10, 10, 10, 10], [10, 20, 30, 40], 1),
  seqLevel('c32-3', L('Quadratzahlen aus ungeraden', 'Square numbers from odd numbers'), L('1, 3, 5, 7, 9 kommen. Das Lager will 1, 4, 9, 16, 25 – mit nur einer Maschine. Sammel sie!', '1, 3, 5, 7, 9 arrive. The storage wants 1, 4, 9, 16, 25 – with just one machine. Collect them!'), 2, [1, 3, 5, 7, 9], [1, 4, 9, 16, 25], 1),
  {
    id: 'c32-4',
    title: L('Der Spartopf', 'The money box'),
    hint: L('5, 12, 8, 20 kommen. Oben will das Lager die Gesamtsumme 45, unten die drei Zwischenstände. Sammel erst, dann prüft eine Weiche „größer als …?“.', '5, 12, 8, 20 arrive. The top storage wants the total 45, the bottom one the three subtotals. Collect first, then a “greater than …?” switch checks.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 5, values: [5, 12, 8, 20] },
    targets: [
      { x: 10, y: 1, need: 1, accept: { kind: 'value', n: 45 } },
      { x: 10, y: 7, need: 3, accept: no(gt(40)) },
    ],
    walls: [[6, 0], [6, 8], [4, 3], [4, 5]],
    par: 14,
  },
  seqLevel('c32-5', L('Doppelt gesammelt', 'Collected twice'), L('Fünfmal die 2 kommt. Das Lager will 2, 6, 12, 20, 30 – mit zwei Maschinen. Schau, was einmal Sammeln ergibt.', 'The 2 arrives five times. The storage wants 2, 6, 12, 20, 30 – with two machines. Look at what collecting once gives.'), 3, [2, 2, 2, 2, 2], [2, 6, 12, 20, 30], 2),
  seqLevel('c32-6', L('Aus Dreien Dreieckszahlen', 'Triangular numbers from threes'), L('Fünfmal die 3 kommt. Das Lager will 1, 3, 6, 10, 15 – mit zwei Maschinen.', 'The 3 arrives five times. The storage wants 1, 3, 6, 10, 15 – with two machines.'), 1, [3, 3, 3, 3, 3], [1, 3, 6, 10, 15], 2, true),
  twoSources('c32-7', L('Dreieckszahlen rückwärts', 'Triangular numbers backwards'), L('Beide Quellen geben 1 bis 5 aus. Das Lager will 0, 1, 3, 6, 10 – mit einer Maschine. Was bleibt von einer Dreieckszahl, wenn man x abzieht?', 'Both sources give out 1 to 5. The storage wants 0, 1, 3, 6, 10 – with one machine. What is left of a triangular number if you take away x?'), seq(1, 5), seq(1, 5), [0, 1, 3, 6, 10], 1, true),
];

/* ---------- Kapitel: Puffer-Maschine (hält eine Zahl fest, gibt die vorige weiter) ---------- */
const C33: LevelInfo[] = [
  seqLevel('c33-1', L('Eins zurück', 'One step behind'), L('Neu: die Puffer-Maschine. 4, 9, 2, 7 kommen – das Lager will 0, 4, 9, 2. Der Puffer behält jede Zahl und gibt die vorige weiter (am Anfang die 0).', 'New: the buffer machine. 4, 9, 2, 7 arrive – the storage wants 0, 4, 9, 2. The buffer keeps every number and passes on the one before (a 0 at the start).'), 0, [4, 9, 2, 7], [0, 4, 9, 2], 1),
  seqLevel('c33-2', L('Verspätet verdoppelt', 'Doubled, but late'), L('3, 8, 5 kommen. Das Lager will 0, 6, 16 – zwei Maschinen.', '3, 8, 5 arrive. The storage wants 0, 6, 16 – two machines.'), 1, [3, 8, 5], [0, 6, 16], 2),
  twoSources('c33-3', L('Abstände der Quadratzahlen', 'Gaps between square numbers'), L('Beide Quellen geben 1, 4, 9, 16, 25 aus. Das Lager will die Abstände 1, 3, 5, 7, 9 – mit einer Maschine. Vergleich jede Zahl mit der davor.', 'Both sources give out 1, 4, 9, 16, 25. The storage wants the gaps 1, 3, 5, 7, 9 – with one machine. Compare every number with the one before.'), [1, 4, 9, 16, 25], [1, 4, 9, 16, 25], [1, 3, 5, 7, 9], 1),
  twoSources('c33-4', L('Nachbarn addieren', 'Adding neighbours'), L('Beide Quellen geben 1, 1, 2, 3, 5, 8 aus. Das Lager will 1, 2, 3, 5, 8, 13 – jede Zahl plus die davor. Kennst du diese Folge?', 'Both sources give out 1, 1, 2, 3, 5, 8. The storage wants 1, 2, 3, 5, 8, 13 – every number plus the one before. Do you know this sequence?'), [1, 1, 2, 3, 5, 8], [1, 1, 2, 3, 5, 8], [1, 2, 3, 5, 8, 13], 1),
  twoSources('c33-5', L('Wie viel ist dazugekommen?', 'How much was added?'), L('Beide Quellen geben die Kontostände 10, 15, 22, 30 aus. Das Lager will, was jeweils dazukam: 10, 5, 7, 8.', 'Both sources give out the account balances 10, 15, 22, 30. The storage wants what was added each time: 10, 5, 7, 8.'), [10, 15, 22, 30], [10, 15, 22, 30], [10, 5, 7, 8], 1),
  seqLevel('c33-6', L('Zwei zurück', 'Two steps behind'), L('5, 1, 8, 3, 6 kommen. Das Lager will 0, 0, 5, 1, 8 – mit zwei Maschinen.', '5, 1, 8, 3, 6 arrive. The storage wants 0, 0, 5, 1, 8 – with two machines.'), 2, [5, 1, 8, 3, 6], [0, 0, 5, 1, 8], 2, true),
  twoSources('c33-7', L('Zahl mal Vorgängerin', 'Number times the one before'), L('Beide Quellen geben 2, 3, 4, 5 aus. Das Lager will 0, 6, 12, 20 – jede Zahl mal die Zahl davor. Eine Maschine.', 'Both sources give out 2, 3, 4, 5. The storage wants 0, 6, 12, 20 – every number times the one before. One machine.'), [2, 3, 4, 5], [2, 3, 4, 5], [0, 6, 12, 20], 1, true),
];

/* ---------- Kapitel: Weiche „ganze Zahl?“ (nach den Brüchen) ---------- */
const whole: Test = { kind: 'int' };
const C34: LevelInfo[] = [
  {
    id: 'c34-1',
    title: L('Ganz oder Bruch?', 'Whole or fraction?'),
    hint: L('Neu: die Weiche „ganze Zahl?“. 3, 1/2, 8, 3/4, 5, 1/5 kommen. Oben sollen die ganzen Zahlen ankommen, unten die Brüche.', 'New: the switch “whole number?”. 3, 1/2, 8, 3/4, 5, 1/5 arrive. The whole numbers should arrive at the top, the fractions at the bottom.'),
    cols: 11, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 3, values: [3, 1 / 2, 8, 3 / 4, 5, 1 / 5] },
    targets: [
      { x: 9, y: 2, need: 3, accept: yes(whole) },
      { x: 9, y: 6, need: 3, accept: no(whole) },
    ],
    walls: [[5, 0], [5, 8]],
    par: 11,
  },
  {
    id: 'c34-2',
    title: L('Durch drei teilbar?', 'Divisible by three?'),
    hint: L('1 bis 6 kommen. Teile jede Zahl durch 3 (Bruch-Maschine). Oben will das Lager die ganzen Ergebnisse 1 und 2, unten die vier Brüche.', '1 to 6 arrive. Divide every number by 3 (fraction machine). The top storage wants the whole results 1 and 2, the bottom one the four fractions.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 10, y: 1, need: 2, accept: { kind: 'seq', values: [1, 2] } },
      { x: 10, y: 7, need: 4, accept: no(whole) },
    ],
    walls: [[6, 0], [6, 8], [6, 3], [6, 5]],
    par: 14,
  },
  {
    id: 'c34-3',
    title: L('Halbe zurückholen', 'Bringing halves back'),
    hint: L('1 bis 6 kommen, jede wird halbiert. Oben will das Lager 1, 2, 3. Unten sollen die ungeraden Zahlen 1, 3, 5 wieder ganz ankommen – eine Maschine hinter der Weiche.', '1 to 6 arrive and each is halved. The top storage wants 1, 2, 3. At the bottom, the odd numbers 1, 3, 5 should arrive whole again – one machine after the switch.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 11, y: 1, need: 3, accept: { kind: 'seq', values: [1, 2, 3] } },
      { x: 11, y: 7, need: 3, accept: { kind: 'seq', values: [1, 3, 5] } },
    ],
    walls: [[6, 3], [6, 4], [6, 5]],
    par: 17,
  },
  {
    id: 'c34-4',
    title: L('Kehrwert ganz', 'Whole reciprocal'),
    hint: L('1 bis 6 kommen. Bilde den Kehrwert. Nur einer bleibt ganz – der kommt oben an, die fünf Stammbrüche unten.', '1 to 6 arrive. Take the reciprocal. Only one stays whole – it arrives at the top, the five unit fractions at the bottom.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 10, y: 1, need: 1, accept: { kind: 'value', n: 1 } },
      { x: 10, y: 7, need: 5, accept: no(whole) },
    ],
    walls: [[6, 0], [6, 8], [4, 3], [4, 5]],
    pro: true,
    par: 14,
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

/** Abschnitte der Level-Auswahl (je einige Kapitel). */
export const PARTS: { id: string; title: Localized; chapters: string[] }[] = [
  { id: 'basics', title: L('Grundlagen', 'Basics'), chapters: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c28'] },
  { id: 'switches', title: L('Weichen und Teilbarkeit', 'Switches and divisibility'), chapters: ['c7', 'c8', 'c14', 'c15', 'c9', 'c10'] },
  { id: 'terms', title: L('Terme und Funktionen', 'Terms and functions'), chapters: ['c11', 'c12', 'c16', 'c17', 'c19'] },
  { id: 'riddles', title: L('Rätsel', 'Puzzles'), chapters: ['c21', 'c22', 'c13'] },
  { id: 'workshop', title: L('Neue Werkstatt', 'New workshop'), chapters: ['c20', 'c23', 'c24', 'c25', 'c26'] },
  { id: 'more', title: L('Brüche und Gleichungen', 'Fractions and equations'), chapters: ['c29', 'c34', 'c30'] },
  { id: 'master', title: L('Großmeister', 'Grandmaster'), chapters: ['c27'] },
  { id: 'memory', title: L('Maschinen mit Gedächtnis', 'Machines with memory'), chapters: ['c31', 'c32', 'c33'] },
];

export const CHAPTERS: Chapter[] = [
  { id: 'c1', title: L('Bänder', 'Belts'), grades: '5', teaches: ['belt'], levels: C1 },
  { id: 'c2', title: L('Plus-Maschine', 'Plus machine'), grades: '5', teaches: ['plus'], levels: C2 },
  { id: 'c3', title: L('Minus-Maschine', 'Minus machine'), grades: '5', teaches: ['minus'], levels: C3 },
  { id: 'c4', title: L('Mal-Maschine', 'Times machine'), grades: '5', teaches: ['times'], levels: C4 },
  { id: 'c5', title: L('Geteilt-Maschine', 'Divide machine'), grades: '5', teaches: ['divide'], levels: C5 },
  { id: 'c6', title: L('Rückwärts rechnen', 'Working backwards'), grades: '5', teaches: ['pick'], levels: C6 },
  { id: 'c28', title: L('Zusammenführer', 'Mergers'), grades: '5', teaches: ['sum', 'diff', 'product', 'quot'], levels: C28 },
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
  { id: 'c19', title: L('Terme mit zwei Quellen', 'Terms with two sources'), grades: '8–9', teaches: [], levels: C19 },
  { id: 'c21', title: L('Rätsel-Werkstatt', 'Puzzle workshop'), grades: '7–9', teaches: [], levels: C21 },
  { id: 'c22', title: L('Funktionen-Detektiv', 'Function detective'), grades: '8–9', teaches: [], levels: C22 },
  { id: 'c13', title: L('Meisterprüfung', 'Master exam'), grades: '7–9', teaches: [], levels: C13 },
  { id: 'c20', title: L('Brücke', 'Bridge'), grades: '7–9', teaches: ['bridge'], levels: C20 },
  { id: 'c23', title: L('Vorzeichen und Betrag', 'Sign and absolute value'), grades: '7', teaches: ['neg', 'abs'], levels: C23 },
  { id: 'c24', title: L('Spiegel-Maschine', 'Mirror machine'), grades: '5–7', teaches: ['rev'], levels: C24 },
  { id: 'c25', title: L('Runden-Maschine', 'Rounding machine'), grades: '5–6', teaches: ['round'], levels: C25 },
  { id: 'c26', title: L('Wechsel-Weiche', 'Alternator'), grades: '6–9', teaches: ['alt'], levels: C26 },
  { id: 'c29', title: L('Brüche', 'Fractions'), grades: '6', teaches: ['frac', 'inv'], levels: C29 },
  { id: 'c34', title: L('Weiche „ganze Zahl?“', 'Switch “whole number?”'), grades: '6', teaches: ['int'], levels: C34 },
  { id: 'c30', title: L('Gleichungen', 'Equations'), grades: '7–8', teaches: ['eq'], levels: C30 },
  { id: 'c27', title: L('Großmeister', 'Grandmaster'), grades: '8–9', teaches: [], levels: C27 },
  { id: 'c31', title: L('Zähler-Maschine', 'Counter machine'), grades: '5–6', teaches: ['count'], levels: C31 },
  { id: 'c32', title: L('Sammel-Maschine', 'Collector machine'), grades: '6–8', teaches: ['total'], levels: C32 },
  { id: 'c33', title: L('Puffer-Maschine', 'Buffer machine'), grades: '6–8', teaches: ['buffer'], levels: C33 },
];

export const ALL_LEVELS: LevelInfo[] = CHAPTERS.flatMap((c) => c.levels);

/** Kapitel für Rätsel außerhalb der Kapitel (Tagesrätsel, Zufallsrätsel): alle Bauteile. */
export const SPECIAL: Chapter = { id: 'special', title: L('Tagesrätsel', 'Daily puzzle'), grades: '7–9', teaches: [], levels: [] };

export const chapterOf = (level: LevelInfo): Chapter => CHAPTERS.find((c) => c.levels.includes(level)) ?? SPECIAL;

/** Werkzeugkasten eines Levels: alle Bauteile aus seinem Kapitel und allen davor (Rätsel außerhalb: alle). */
export function kitFor(level: LevelInfo): KitItem[] {
  if (level.kit) return KIT.filter((k) => level.kit!.includes(k.id));
  const chapter = chapterOf(level);
  if (chapter === SPECIAL) return [...KIT];
  const upto = CHAPTERS.indexOf(chapter);
  const ids = new Set(CHAPTERS.slice(0, upto + 1).flatMap((c) => c.teaches));
  return KIT.filter((k) => ids.has(k.id));
}

/** Karten für Rätsel mit einer Zahl (Quelle → Lager, genug Platz für drei Maschinen). */
export const VALUE_MAPS = [MAP_A, MAP_B, MAP_C, MAP_D, MAP_E, MAP_F];
export { riddle };

/** Bauteile, die dieses Kapitel neu bringt. */
export const newIn = (chapter: Chapter): KitItem[] => KIT.filter((k) => chapter.teaches.some((t) => isKitId(t) && t === k.id));
