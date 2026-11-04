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
const square = (x: number, y: number) => ({ x, y, part: { op: { sym: '²' as const, n: 2 }, dir: 0 as const } });
const seq = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const table = (f: (x: number) => number, xs: number[]) => xs.map(f);

const even: Test = { kind: 'even' };
const div = (n: number): Test => ({ kind: 'div', n });
const gt = (n: number): Test => ({ kind: 'gt', n });
const prime: Test = { kind: 'prime' };
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
    fixed: [square(4, 6), fixedOp(8, 1, '+', 3)],
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
    fixed: [fixedOp(4, 3, '+', 1), square(8, 3), fixedOp(11, 3, '−', 10)],
    maxMachines: 0,
    par: 8,
  },
  {
    id: 'c13-5',
    title: L('Zerlege 360', 'Break down 360'),
    hint: L('Aus 360 soll 1 werden – mit höchstens drei Maschinen.', '360 should become 1 – with at most three machines.'),
    cols: 15, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 360 },
    target: { x: 13, y: 6, value: 1 }, need: 3,
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
  { id: 'c9', title: L('Weiche „größer als?“', 'Switch “greater than?”'), grades: '5–6', teaches: ['gt'], levels: C9 },
  { id: 'c10', title: L('Weiche „Primzahl?“', 'Switch “prime?”'), grades: '5–6', teaches: ['prime'], levels: C10 },
  { id: 'c11', title: L('Wertetabellen', 'Tables of values'), grades: '7–8', teaches: ['seq'], levels: C11 },
  { id: 'c12', title: L('Quadrat-Maschine', 'Square machine'), grades: '8–9', teaches: ['square'], levels: C12 },
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
