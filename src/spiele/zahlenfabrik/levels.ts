import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import type { Level, Op, Test } from './model';

/**
 * Welt 1 „Grundrechnen“ (Probe). Jedes Level spielt auf einer freien Fläche
 * aus Kästchen, die man verschieben und zoomen kann. Felsen versperren den
 * Weg, manche Maschinen stehen schon da.
 */
export interface LevelInfo extends Level {
  title: Localized;
  hint: Localized;
}

/** Felsen von (x1, y1) bis (x2, y2) als Rechteck. */
const rocks = (x1: number, y1: number, x2: number, y2: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) out.push([x, y]);
  return out;
};

export const WORLD_1: LevelInfo[] = [
  {
    id: 'w1-1',
    title: L('Aus 3 wird 5', '3 becomes 5'),
    hint: L('Zieh mit dem Band von der Quelle zum Lager. Dann setz die +2-Maschine auf das Band.', 'Drag a belt from the source to the storage. Then put the +2 machine on the belt.'),
    cols: 14, rows: 9,
    source: { x: 3, y: 4, dir: 0, value: 3 },
    target: { x: 9, y: 4, value: 5 },
    walls: [[6, 1], [7, 1], [7, 2], [11, 7], [1, 7]],
    tools: [{ sym: '+', n: 2 }],
    need: 3, par: 5,
  },
  {
    id: 'w1-2',
    title: L('Aus 4 wird 12', '4 becomes 12'),
    hint: L('Nur eine der beiden Maschinen passt. Das Lager liegt etwas weiter unten.', 'Only one of the two machines fits. The storage is a bit further down.'),
    cols: 15, rows: 9,
    source: { x: 2, y: 3, dir: 0, value: 4 },
    target: { x: 11, y: 5, value: 12 },
    walls: [[6, 4], [6, 5], [7, 5], [12, 1], [3, 7]],
    tools: [{ sym: '+', n: 2 }, { sym: '×', n: 3 }],
    need: 3, par: 10,
  },
  {
    id: 'w1-3',
    title: L('Aus 2 wird 10', '2 becomes 10'),
    hint: L('Zwei Maschinen – die Reihenfolge ist wichtig! Die Felsen musst du umgehen.', 'Two machines – the order matters! You have to go around the rocks.'),
    cols: 15, rows: 9,
    source: { x: 2, y: 6, dir: 0, value: 2 },
    target: { x: 12, y: 2, value: 10 },
    walls: rocks(7, 0, 7, 5),
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 2 }],
    need: 3, par: 13,
  },
  {
    id: 'w1-4',
    title: L('Aus 20 wird 7', '20 becomes 7'),
    hint: L('Vor dem Lager steht schon eine −3-Maschine. Was muss davor passieren? Teilen geht nur, wenn es glatt aufgeht.', 'A −3 machine already stands in front of the storage. What has to happen before it? Dividing only works if it comes out even.'),
    cols: 15, rows: 10,
    source: { x: 2, y: 2, dir: 0, value: 20 },
    target: { x: 12, y: 7, value: 7 },
    walls: [...rocks(10, 6, 12, 6), ...rocks(10, 8, 12, 8), [13, 7], [5, 5], [5, 6]],
    fixed: [{ x: 10, y: 7, part: { op: { sym: '−', n: 3 }, dir: 0 } }],
    tools: [{ sym: '÷', n: 2 }, { sym: '−', n: 3 }],
    need: 3, par: 13,
  },
  {
    id: 'w1-5',
    title: L('Um die Felsen', 'Around the rocks'),
    hint: L('Das Lager liegt weit oben. Schieb die Karte mit der Hand, wenn du mehr sehen willst.', 'The storage is far up. Move the map with the hand to see more.'),
    cols: 16, rows: 11,
    source: { x: 2, y: 9, dir: 0, value: 5 },
    target: { x: 13, y: 1, value: 16 },
    walls: rocks(0, 5, 10, 5),
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 2 }, { sym: '−', n: 1 }],
    need: 3, par: 18,
  },
  {
    id: 'w1-6',
    title: L('Aus 1 wird 100', '1 becomes 100'),
    hint: L('Groß denken! Und such dir einen Weg durch die Felsen.', 'Think big! And find a way through the rocks.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 1 },
    target: { x: 13, y: 7, value: 100 },
    walls: [...rocks(4, 0, 4, 5), ...rocks(9, 3, 9, 8)],
    tools: [{ sym: '+', n: 9 }, { sym: '×', n: 10 }, { sym: '×', n: 2 }],
    need: 3, par: 25,
  },
  {
    id: 'w1-7',
    title: L('Aus 7 wird 50', '7 becomes 50'),
    hint: L('Profi-Level: Nicht jede Maschine passt. Und der Weg windet sich durch die Felsen.', 'Pro level: not every machine fits. And the path winds through the rocks.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 7 },
    target: { x: 13, y: 7, value: 50 }, need: 3,
    walls: [...rocks(3, 0, 3, 6), ...rocks(7, 2, 7, 8), ...rocks(11, 0, 11, 6)],
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 5 }, { sym: '−', n: 1 }, { sym: '÷', n: 2 }],
    par: 29,
  },
  {
    id: 'w1-8',
    title: L('Aus 4 wird 99', '4 becomes 99'),
    hint: L('Profi-Level: Eine Maschine darfst du mehrmals setzen. Erst groß werden, dann ein kleines Stück zurück.', 'Pro level: you may use a machine more than once. Grow big first, then step back a little.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 7, dir: 0, value: 4 },
    target: { x: 13, y: 1, value: 99 }, need: 3,
    walls: [...rocks(4, 3, 4, 8), ...rocks(8, 0, 8, 5), ...rocks(11, 3, 13, 3)],
    tools: [{ sym: '×', n: 5 }, { sym: '−', n: 1 }, { sym: '+', n: 9 }],
    par: 25,
  },
];

/* ---------- Bausteine für die Welten 2–6 ---------- */

/** Senkrechte Felswand in Spalte x (Reihen 0 … rows−1) mit Lücken in den genannten Reihen. */
const wall = (x: number, rows: number, gaps: number[]): [number, number][] =>
  Array.from({ length: rows }, (_, y) => y)
    .filter((y) => !gaps.includes(y))
    .map((y): [number, number] => [x, y]);

const fixedOp = (x: number, y: number, sym: Op['sym'], n: number) => ({ x, y, part: { op: { sym, n }, dir: 0 as const } });
const seq = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Welt 2 „Rückwärts“: Die Maschinen stehen schon da (🔒). Welche Zahl muss in
 * die Quelle, damit im Lager die gewünschte Zahl ankommt? Die Startzahl wählt
 * man selbst – rückwärts rechnen mit den Umkehraufgaben.
 */
export const WORLD_2: LevelInfo[] = [
  {
    id: 'w2-1',
    title: L('Was kommt hinein?', 'What goes in?'),
    hint: L('Ins Lager soll die 9. Unterwegs steht schon +4. Welche Startzahl brauchst du? Stell sie bei „Startzahl“ ein und leg ein Band zum Lager.', 'The storage wants 9. There is already a +4 on the way. Which starting number do you need? Set it at “Starting number” and lay a belt to the storage.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 20 } },
    target: { x: 10, y: 3, value: 9 }, need: 3,
    walls: wall(5, 7, [3]),
    fixed: [fixedOp(5, 3, '+', 4)],
    tools: [], par: 7,
  },
  {
    id: 'w2-2',
    title: L('Rückwärts mal', 'Backwards times'),
    hint: L('Das Lager will 24, die Maschine rechnet ×3. Rückwärts heißt: teilen!', 'The storage wants 24, the machine does ×3. Backwards means: divide!'),
    cols: 12, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 10, y: 6, value: 24 }, need: 3,
    walls: wall(6, 8, [4]),
    fixed: [fixedOp(6, 4, '×', 3)],
    tools: [], par: 12,
  },
  {
    id: 'w2-3',
    title: L('Zwei Schritte zurück', 'Two steps back'),
    hint: L('Erst ×2, dann +6, heraus kommt 30. Geh von hinten nach vorne: 30 − 6, dann durch 2.', 'First ×2, then +6, and 30 comes out. Go from back to front: 30 − 6, then divide by 2.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 11, y: 3, value: 30 }, need: 3,
    walls: [...wall(4, 7, [3]), ...wall(8, 7, [3])],
    fixed: [fixedOp(4, 3, '×', 2), fixedOp(8, 3, '+', 6)],
    tools: [], par: 7,
  },
  {
    id: 'w2-4',
    title: L('Minus wird plus', 'Minus becomes plus'),
    hint: L('×4, dann −6, heraus kommt 30. Rückwärts: Aus −6 wird +6, aus ×4 wird ÷4.', '×4, then −6, and 30 comes out. Backwards: −6 becomes +6, ×4 becomes ÷4.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 11, y: 1, value: 30 }, need: 3,
    walls: [...wall(4, 8, [6]), ...wall(8, 8, [1])],
    fixed: [fixedOp(4, 6, '×', 4), fixedOp(8, 1, '−', 6)],
    tools: [], par: 12,
  },
  {
    id: 'w2-5',
    title: L('Ins Lager kommt 50', '50 goes into the storage'),
    hint: L('Erst ÷2, dann +5. Was muss in die Quelle, damit 50 ankommt? Die Startzahl darf groß sein.', 'First ÷2, then +5. What has to go into the source so that 50 arrives? The starting number may be big.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 1, pick: { min: 1, max: 100 } },
    target: { x: 11, y: 5, value: 50 }, need: 3,
    walls: [...wall(4, 7, [1]), ...wall(8, 7, [5])],
    fixed: [fixedOp(4, 1, '÷', 2), fixedOp(8, 5, '+', 5)],
    tools: [], par: 11,
  },
  {
    id: 'w2-6',
    title: L('Drei Maschinen', 'Three machines'),
    hint: L('×5, dann +15, dann ÷2 – und 40 kommt an. Rechne Schritt für Schritt rückwärts.', '×5, then +15, then ÷2 – and 40 arrives. Work backwards step by step.'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 50 } },
    target: { x: 12, y: 3, value: 40 }, need: 3,
    walls: [...wall(4, 7, [3]), ...wall(7, 7, [3]), ...wall(10, 7, [3])],
    fixed: [fixedOp(4, 3, '×', 5), fixedOp(7, 3, '+', 15), fixedOp(10, 3, '÷', 2)],
    tools: [], par: 7,
  },
  {
    id: 'w2-7',
    title: L('Vier Maschinen zurück', 'Four machines back'),
    hint: L('Profi-Level: ×2, −4, ÷3, +7 – und 15 kommt an. Fang hinten an!', 'Pro level: ×2, −4, ÷3, +7 – and 15 arrives. Start at the back!'),
    cols: 15, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 50 } },
    target: { x: 13, y: 3, value: 15 }, need: 3,
    walls: [...wall(3, 7, [3]), ...wall(6, 7, [3]), ...wall(9, 7, [3]), ...wall(12, 7, [3])],
    fixed: [fixedOp(3, 3, '×', 2), fixedOp(6, 3, '−', 4), fixedOp(9, 3, '÷', 3), fixedOp(12, 3, '+', 7)],
    tools: [], par: 7,
  },
  {
    id: 'w2-8',
    title: L('Rückwärts quadrieren', 'Squaring backwards'),
    hint: L('Profi-Level: x², dann +3 – und 52 kommt an. Rückwärts von x² ist die Wurzel.', 'Pro level: x², then +3 – and 52 arrives. Backwards from x² is the square root.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 11, y: 1, value: 52 }, need: 3,
    walls: [...wall(4, 8, [6]), ...wall(8, 8, [1])],
    fixed: [{ x: 4, y: 6, part: { op: { sym: '²', n: 2 }, dir: 0 } }, fixedOp(8, 1, '+', 3)],
    tools: [], par: 12,
  },
];

const even: Test = { kind: 'even' };
const div = (n: number): Test => ({ kind: 'div', n });
const gt = (n: number): Test => ({ kind: 'gt', n });
const prime: Test = { kind: 'prime' };
const yes = (test: Test) => ({ kind: 'test' as const, test });
const no = (test: Test) => ({ kind: 'test' as const, test, not: true });

/**
 * Welt 3 „Sortieren“: Die Quelle gibt verschiedene Zahlen aus, zwei (oder
 * drei) Lager wollen nur bestimmte. Weichen trennen sie: Was die Frage
 * erfüllt, läuft geradeaus, der Rest biegt ab.
 */
export const WORLD_3: LevelInfo[] = [
  {
    id: 'w3-1',
    title: L('Gerade und ungerade', 'Even and odd'),
    hint: L('Die Quelle gibt 1, 2, 3, 4, 5, 6 aus. Oben gerade Zahlen, unten ungerade. Setz eine Weiche „gerade?“ und dreh sie, bis ✓ und ✗ passen.', 'The source gives 1, 2, 3, 4, 5, 6. Even numbers at the top, odd at the bottom. Place an “even?” switch and turn it until ✓ and ✗ fit.'),
    cols: 11, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 9, y: 2, need: 3, accept: yes(even) },
      { x: 9, y: 6, need: 3, accept: no(even) },
    ],
    walls: [[5, 0], [5, 8]],
    tools: [], sorts: [even], par: 11,
  },
  {
    id: 'w3-2',
    title: L('Vielfache von 3', 'Multiples of 3'),
    hint: L('1 bis 9: Nur Vielfache von 3 (3, 6, 9) ins Lager oben, der Rest nach unten.', '1 to 9: only multiples of 3 (3, 6, 9) into the top storage, the rest goes down.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 9) },
    targets: [
      { x: 10, y: 1, need: 3, accept: yes(div(3)) },
      { x: 10, y: 7, need: 6, accept: no(div(3)) },
    ],
    walls: [[6, 2], [6, 3], [6, 5], [6, 6]],
    tools: [], sorts: [div(3), even], par: 14,
  },
  {
    id: 'w3-3',
    title: L('Erst rechnen, dann sortieren', 'Calculate first, then sort'),
    hint: L('Die Quelle gibt 1, 3, 5, 7 – alles ungerade. Das Lager oben will Vielfache von 4. Was musst du vorher rechnen?', 'The source gives 1, 3, 5, 7 – all odd. The top storage wants multiples of 4. What do you have to calculate first?'),
    cols: 12, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [1, 3, 5, 7] },
    targets: [
      { x: 10, y: 2, need: 2, accept: yes(div(4)) },
      { x: 10, y: 6, need: 2, accept: no(div(4)) },
    ],
    walls: [[5, 3], [5, 4], [5, 5]],
    tools: [{ sym: '+', n: 1 }, { sym: '×', n: 3 }], sorts: [div(4), even], par: 14,
  },
  {
    id: 'w3-4',
    title: L('Größer als 10', 'Greater than 10'),
    hint: L('Große Zahlen (über 10) nach oben, kleine nach unten.', 'Big numbers (over 10) go up, small ones go down.'),
    cols: 12, rows: 9,
    source: { x: 1, y: 7, dir: 0, value: 1, values: [4, 12, 7, 15, 9, 20] },
    targets: [
      { x: 10, y: 1, need: 3, accept: yes(gt(10)) },
      { x: 10, y: 7, need: 3, accept: no(gt(10)) },
    ],
    walls: [[4, 6], [4, 7], [4, 8], [8, 0], [8, 1], [8, 2]],
    tools: [], sorts: [gt(10), even], par: 16,
  },
  {
    id: 'w3-5',
    title: L('Drei Lager', 'Three storages'),
    hint: L('1 bis 9 auf drei Lager: Vielfache von 3 nach oben, gerade Zahlen in die Mitte, der Rest nach unten. Du brauchst zwei Weichen – welche kommt zuerst?', '1 to 9 into three storages: multiples of 3 at the top, even numbers in the middle, the rest at the bottom. You need two switches – which one comes first?'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 9) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(div(3)) },
      { x: 11, y: 4, need: 3, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 3, accept: no(even) },
    ],
    walls: [[6, 0], [6, 8]],
    tools: [], sorts: [div(3), even], par: 16,
  },
  {
    id: 'w3-6',
    title: L('Mal 3 und sortieren', 'Times 3 and sort'),
    hint: L('2 bis 7 kommen heraus. Mal 3 gerechnet: Was größer als 10 ist, kommt nach oben.', '2 to 7 come out. Multiplied by 3: whatever is greater than 10 goes up.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(2, 7) },
    targets: [
      { x: 11, y: 1, need: 4, accept: yes(gt(10)) },
      { x: 11, y: 7, need: 2, accept: no(gt(10)) },
    ],
    walls: [[6, 3], [6, 5], [7, 3], [7, 5]],
    tools: [{ sym: '×', n: 3 }, { sym: '+', n: 3 }], sorts: [gt(10)], par: 15,
  },
  {
    id: 'w3-7',
    title: L('Fünfer, gerade, Rest', 'Fives, even, rest'),
    hint: L('Profi-Level: Vielfache von 5 nach oben, gerade Zahlen in die Mitte, der Rest nach unten. Achtung, die 10 ist beides!', 'Pro level: multiples of 5 at the top, even numbers in the middle, the rest at the bottom. Careful, 10 is both!'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [2, 5, 8, 10, 11, 15, 4, 7] },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(div(5)) },
      { x: 11, y: 4, need: 3, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 2, accept: no(even) },
    ],
    walls: [[6, 0], [6, 8], [3, 1], [3, 7]],
    tools: [], sorts: [div(5), even], par: 16,
  },
  {
    id: 'w3-8',
    title: L('Erst 3x + 1, dann sortieren', 'First 3x + 1, then sort'),
    hint: L('Profi-Level: 1 bis 8 kommen. Rechne 3x + 1 und sortiere dann gerade und ungerade.', 'Pro level: 1 to 8 arrive. Calculate 3x + 1 and then sort even and odd.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 8) },
    targets: [
      { x: 11, y: 1, need: 4, accept: yes(even) },
      { x: 11, y: 7, need: 4, accept: no(even) },
    ],
    walls: [[5, 3], [5, 5], [8, 2], [8, 6]],
    tools: [{ sym: '×', n: 3 }, { sym: '+', n: 1 }, { sym: '+', n: 2 }], sorts: [even, div(3)], par: 15,
  },
];

/**
 * Welt 4 „Primzahlen“: Primzahlen aussortieren und Zahlen in Primfaktoren
 * zerlegen – so lange durch Primzahlen teilen, bis 1 übrig bleibt.
 */
export const WORLD_4: LevelInfo[] = [
  {
    id: 'w4-1',
    title: L('Primzahlen finden', 'Finding primes'),
    hint: L('2 bis 10: Primzahlen nach oben, alle anderen nach unten. Eine Primzahl hat genau zwei Teiler: 1 und sich selbst.', '2 to 10: primes go up, all others go down. A prime has exactly two divisors: 1 and itself.'),
    cols: 11, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(2, 10) },
    targets: [
      { x: 9, y: 1, need: 4, accept: yes(prime) },
      { x: 9, y: 7, need: 5, accept: no(prime) },
    ],
    walls: [[5, 0], [5, 8]],
    tools: [], sorts: [prime, even], par: 13,
  },
  {
    id: 'w4-2',
    title: L('Zerlege 12', 'Break down 12'),
    hint: L('12 = 2 · 2 · 3. Teile so lange, bis 1 im Lager ankommt. Eine Maschine darfst du mehrmals setzen.', '12 = 2 · 2 · 3. Keep dividing until 1 reaches the storage. You may place a machine more than once.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 12 },
    target: { x: 10, y: 3, value: 1 }, need: 3,
    walls: [[5, 2], [5, 4], [6, 2], [6, 4]],
    tools: [{ sym: '÷', n: 2 }, { sym: '÷', n: 3 }, { sym: '÷', n: 5 }], par: 8,
  },
  {
    id: 'w4-3',
    title: L('Zerlege 60', 'Break down 60'),
    hint: L('60 in Primfaktoren: Welche Primzahlen stecken drin, und wie oft?', '60 into prime factors: which primes are in it, and how often?'),
    cols: 13, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 60 },
    target: { x: 11, y: 6, value: 1 }, need: 3,
    walls: wall(6, 8, [1, 6]),
    tools: [{ sym: '÷', n: 2 }, { sym: '÷', n: 3 }, { sym: '÷', n: 5 }, { sym: '÷', n: 7 }], par: 14,
  },
  {
    id: 'w4-4',
    title: L('Prim oder nicht?', 'Prime or not?'),
    hint: L('11 bis 17 kommen. Welche davon sind Primzahlen? Die Weiche weiß es – du auch?', '11 to 17 arrive. Which of them are primes? The switch knows – do you?'),
    cols: 12, rows: 9,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(11, 17) },
    targets: [
      { x: 10, y: 1, need: 3, accept: yes(prime) },
      { x: 10, y: 7, need: 4, accept: no(prime) },
    ],
    walls: [[5, 0], [5, 1], [5, 2], [5, 3]],
    tools: [], sorts: [prime], par: 17,
  },
  {
    id: 'w4-5',
    title: L('Doppelt plus eins', 'Double plus one'),
    hint: L('1 bis 6, jeweils ×2 und +1: 3, 5, 7, 9, 11, 13. Fast alles Primzahlen – aber eine nicht!', '1 to 6, each ×2 and +1: 3, 5, 7, 9, 11, 13. Almost all primes – but one isn’t!'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 11, y: 2, need: 5, accept: yes(prime) },
      { x: 11, y: 6, need: 1, accept: no(prime) },
    ],
    walls: [[6, 0], [6, 1], [6, 7], [6, 8]],
    tools: [{ sym: '×', n: 2 }, { sym: '+', n: 1 }], sorts: [prime], par: 13,
  },
  {
    id: 'w4-6',
    title: L('Zerlege 210', 'Break down 210'),
    hint: L('210 ist das Produkt der ersten vier Primzahlen. Welche sind das?', '210 is the product of the first four primes. Which are they?'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 210 },
    target: { x: 12, y: 3, value: 1 }, need: 3,
    walls: [...wall(4, 7, [1, 5]), ...wall(9, 7, [1, 5])],
    tools: [{ sym: '÷', n: 2 }, { sym: '÷', n: 3 }, { sym: '÷', n: 5 }, { sym: '÷', n: 7 }, { sym: '÷', n: 11 }], par: 14,
  },
  {
    id: 'w4-7',
    title: L('Zerlege 360', 'Break down 360'),
    hint: L('Profi-Level: 360 hat sechs Primfaktoren. Wie viele Zweien stecken drin?', 'Pro level: 360 has six prime factors. How many twos are in it?'),
    cols: 15, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 360 },
    target: { x: 13, y: 6, value: 1 }, need: 3,
    walls: [...wall(5, 8, [1]), ...wall(10, 8, [6])],
    tools: [{ sym: '÷', n: 2 }, { sym: '÷', n: 3 }, { sym: '÷', n: 5 }, { sym: '÷', n: 7 }], par: 16,
  },
  {
    id: 'w4-8',
    title: L('Primzahlzwillinge', 'Twin primes'),
    hint: L('Profi-Level: 3, 5, 7 … 17 kommen. Plus 2 gerechnet: Welche Ergebnisse sind wieder Primzahlen?', 'Pro level: 3, 5, 7 … 17 arrive. After adding 2: which results are primes again?'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [3, 5, 7, 9, 11, 13, 15, 17] },
    targets: [
      { x: 11, y: 2, need: 6, accept: yes(prime) },
      { x: 11, y: 6, need: 2, accept: no(prime) },
    ],
    walls: [[6, 0], [6, 1], [6, 7], [6, 8], [3, 3], [3, 5]],
    tools: [{ sym: '+', n: 2 }, { sym: '+', n: 4 }], sorts: [prime, even], par: 13,
  },
];

const table = (f: (x: number) => number, xs: number[]) => xs.map(f);

/**
 * Welt 5 „Terme“: Die Quelle gibt x = 1, 2, 3, 4, 5 aus, das Lager will die
 * Werte eines Terms der Reihe nach. Die Maschinen sind die Rechenvorschrift.
 */
export const WORLD_5: LevelInfo[] = [
  {
    id: 'w5-1',
    title: L('x + 3', 'x + 3'),
    hint: L('Für x = 1 … 5 will das Lager 4, 5, 6, 7, 8 – genau in dieser Reihenfolge.', 'For x = 1 … 5 the storage wants 4, 5, 6, 7, 8 – exactly in this order.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => x + 3, seq(1, 5)) } }],
    walls: [[5, 2], [5, 3], [5, 4]],
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 3 }], par: 12,
  },
  {
    id: 'w5-2',
    title: L('2x', '2x'),
    hint: L('2x heißt 2 · x. Das Lager will 2, 4, 6, 8, 10.', '2x means 2 · x. The storage wants 2, 4, 6, 8, 10.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => 2 * x, seq(1, 5)) } }],
    walls: wall(6, 8, [6]),
    tools: [{ sym: '×', n: 2 }, { sym: '+', n: 2 }], par: 13,
  },
  {
    id: 'w5-3',
    title: L('3x + 1', '3x + 1'),
    hint: L('Erst mal 3, dann plus 1 – Punkt vor Strich! Das Lager will 4, 7, 10, 13, 16.', 'First times 3, then plus 1 – multiplication before addition! The storage wants 4, 7, 10, 13, 16.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => 3 * x + 1, seq(1, 5)) } }],
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [8, 1], [8, 2], [8, 4], [8, 5]],
    tools: [{ sym: '+', n: 1 }, { sym: '×', n: 3 }], par: 9,
  },
  {
    id: 'w5-4',
    title: L('2 · (x + 1)', '2 · (x + 1)'),
    hint: L('Die Klammer zuerst! Das Lager will 4, 6, 8, 10, 12.', 'Brackets first! The storage wants 4, 6, 8, 10, 12.'),
    cols: 13, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => 2 * (x + 1), seq(1, 5)) } }],
    walls: wall(6, 8, [3]),
    tools: [{ sym: '×', n: 2 }, { sym: '+', n: 1 }, { sym: '+', n: 2 }], par: 14,
  },
  {
    id: 'w5-5',
    title: L('5x − 2', '5x − 2'),
    hint: L('Das Lager will 3, 8, 13, 18, 23. Immer 5 mehr – woher kommt das?', 'The storage wants 3, 8, 13, 18, 23. Always 5 more – where does that come from?'),
    cols: 13, rows: 7,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 5, need: 5, accept: { kind: 'seq', values: table((x) => 5 * x - 2, seq(1, 5)) } }],
    walls: [[5, 0], [5, 1], [5, 2], [5, 3], [8, 3], [8, 4], [8, 5], [8, 6]],
    tools: [{ sym: '×', n: 5 }, { sym: '−', n: 2 }, { sym: '+', n: 2 }], par: 17,
  },
  {
    id: 'w5-6',
    title: L('4 · (x + 1)', '4 · (x + 1)'),
    hint: L('Es gibt nur ×2, +1 und +2. Mal 4 geht auch mit zweimal ×2! Das Lager will 8, 12, 16, 20, 24.', 'There is only ×2, +1 and +2. Times 4 also works as ×2 twice! The storage wants 8, 12, 16, 20, 24.'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 12, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => 4 * (x + 1), seq(1, 5)) } }],
    walls: [[6, 2], [6, 3], [6, 4]],
    tools: [{ sym: '×', n: 2 }, { sym: '+', n: 1 }, { sym: '+', n: 2 }], par: 14,
  },
  {
    id: 'w5-7',
    title: L('3 · (x + 2) − 1', '3 · (x + 2) − 1'),
    hint: L('Profi-Level: Klammer, dann mal, dann minus. Das Lager will 8, 11, 14, 17, 20.', 'Pro level: brackets, then times, then minus. The storage wants 8, 11, 14, 17, 20.'),
    cols: 15, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 13, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => 3 * (x + 2) - 1, seq(1, 5)) } }],
    walls: [...wall(5, 8, [3]), ...wall(10, 8, [5])],
    tools: [{ sym: '+', n: 2 }, { sym: '×', n: 3 }, { sym: '−', n: 1 }, { sym: '+', n: 1 }], par: 20,
  },
  {
    id: 'w5-8',
    title: L('4 · (x − 3)', '4 · (x − 3)'),
    hint: L('Profi-Level: Jetzt wird es negativ! Das Lager will −8, −4, 0, 4, 8.', 'Pro level: now it gets negative! The storage wants −8, −4, 0, 4, 8.'),
    cols: 14, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 12, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => 4 * (x - 3), seq(1, 5)) } }],
    walls: [[4, 2], [4, 3], [4, 4], [8, 1], [8, 2], [8, 4], [8, 5]],
    tools: [{ sym: '−', n: 3 }, { sym: '×', n: 4 }, { sym: '+', n: 3 }], par: 14,
  },
];

/**
 * Welt 6 „Funktionen“: Das Lager will die Wertetabelle einer Funktion. Neu ist
 * die Maschine x² (Quadrieren); manchmal sind die x-Werte auch negativ.
 */
export const WORLD_6: LevelInfo[] = [
  {
    id: 'w6-1',
    title: L('f(x) = x²', 'f(x) = x²'),
    hint: L('Die Quadratzahlen: 1, 4, 9, 16, 25. Die neue Maschine x² rechnet x · x.', 'The square numbers: 1, 4, 9, 16, 25. The new machine x² calculates x · x.'),
    cols: 11, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 9, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => x * x, seq(1, 5)) } }],
    walls: [[5, 2], [5, 3], [5, 4]],
    tools: [{ sym: '²', n: 2 }, { sym: '×', n: 2 }], par: 11,
  },
  {
    id: 'w6-2',
    title: L('f(x) = x² + 1', 'f(x) = x² + 1'),
    hint: L('Das Lager will 2, 5, 10, 17, 26.', 'The storage wants 2, 5, 10, 17, 26.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 6, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => x * x + 1, seq(1, 5)) } }],
    walls: wall(5, 8, [2]),
    tools: [{ sym: '²', n: 2 }, { sym: '+', n: 1 }], par: 13,
  },
  {
    id: 'w6-3',
    title: L('f(x) = (x + 1)²', 'f(x) = (x + 1)²'),
    hint: L('Wie vorhin, nur andersherum: 4, 9, 16, 25, 36. Die Reihenfolge der Maschinen macht den Unterschied.', 'Like before, just the other way round: 4, 9, 16, 25, 36. The order of the machines makes the difference.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => (x + 1) ** 2, seq(1, 5)) } }],
    walls: [[4, 1], [4, 2], [4, 4], [4, 5], [7, 1], [7, 2], [7, 4], [7, 5]],
    tools: [{ sym: '²', n: 2 }, { sym: '+', n: 1 }], par: 8,
  },
  {
    id: 'w6-4',
    title: L('f(x) = 2x²', 'f(x) = 2x²'),
    hint: L('2x² heißt 2 · x². Was wird zuerst gerechnet? Das Lager will 2, 8, 18, 32, 50.', '2x² means 2 · x². What is calculated first? The storage wants 2, 8, 18, 32, 50.'),
    cols: 12, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 10, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => 2 * x * x, seq(1, 5)) } }],
    walls: [[4, 0], [4, 1], [4, 2], [4, 3], [8, 4], [8, 5], [8, 6], [8, 7]],
    tools: [{ sym: '²', n: 2 }, { sym: '×', n: 2 }], par: 15,
  },
  {
    id: 'w6-5',
    title: L('Gerade: f(x) = 3x − 1', 'Line: f(x) = 3x − 1'),
    hint: L('Diesmal x = 0 … 4. Bei x = 0 kommt eine negative Zahl heraus: −1. Das Lager will −1, 2, 5, 8, 11.', 'This time x = 0 … 4. For x = 0 a negative number comes out: −1. The storage wants −1, 2, 5, 8, 11.'),
    cols: 12, rows: 7,
    source: { x: 1, y: 5, dir: 0, value: 1, values: seq(0, 4) },
    targets: [{ x: 10, y: 1, need: 5, accept: { kind: 'seq', values: table((x) => 3 * x - 1, seq(0, 4)) } }],
    walls: [[5, 3], [5, 4], [5, 5], [5, 6]],
    tools: [{ sym: '×', n: 3 }, { sym: '−', n: 1 }], par: 12,
  },
  {
    id: 'w6-6',
    title: L('Parabel: f(x) = x² − 4', 'Parabola: f(x) = x² − 4'),
    hint: L('x = −2 … 2. Das Lager will 0, −3, −4, −3, 0 – die Werte fallen und steigen wieder, wie bei einer Parabel.', 'x = −2 … 2. The storage wants 0, −3, −4, −3, 0 – the values fall and rise again, like a parabola.'),
    cols: 13, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(-2, 2) },
    targets: [{ x: 11, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => x * x - 4, seq(-2, 2)) } }],
    walls: [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5]],
    tools: [{ sym: '²', n: 2 }, { sym: '−', n: 4 }, { sym: '+', n: 4 }], par: 15,
  },
  {
    id: 'w6-7',
    title: L('f(x) = (2x)²', 'f(x) = (2x)²'),
    hint: L('Profi-Level: 4, 16, 36, 64, 100. Es gibt sogar zwei Wege – findest du beide?', 'Pro level: 4, 16, 36, 64, 100. There are even two ways – can you find both?'),
    cols: 13, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 11, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => (2 * x) ** 2, seq(1, 5)) } }],
    walls: [...rocks(4, 0, 4, 4), ...rocks(8, 3, 8, 7)],
    tools: [{ sym: '×', n: 2 }, { sym: '²', n: 2 }, { sym: '×', n: 4 }], par: 20,
  },
  {
    id: 'w6-8',
    title: L('Scheitelpunkt: f(x) = (x − 1)² − 1', 'Vertex: f(x) = (x − 1)² − 1'),
    hint: L('Profi-Level: x = −1 … 3. Das Lager will 3, 0, −1, 0, 3 – die Parabel hat ihren tiefsten Punkt bei x = 1.', 'Pro level: x = −1 … 3. The storage wants 3, 0, −1, 0, 3 – the parabola has its lowest point at x = 1.'),
    cols: 14, rows: 8,
    source: { x: 1, y: 3, dir: 0, value: 1, values: seq(-1, 3) },
    targets: [{ x: 12, y: 3, need: 5, accept: { kind: 'seq', values: table((x) => (x - 1) ** 2 - 1, seq(-1, 3)) } }],
    walls: [[5, 2], [5, 3], [5, 4], [9, 2], [9, 3], [9, 4]],
    tools: [{ sym: '−', n: 1 }, { sym: '²', n: 2 }, { sym: '+', n: 1 }], par: 14,
  },
];

/**
 * Welt 7 „Meisterprüfung“: alles gemischt – Startzahl wählen mit x², drei
 * Lager, Rechnen nach der Weiche, Wertetabellen mit mehreren Schritten.
 */
export const WORLD_7: LevelInfo[] = [
  {
    id: 'w7-1',
    title: L('Rückwärts mit Quadrat', 'Backwards with a square'),
    hint: L('+1, dann x², dann −10 – und 54 kommt an. Welche Startzahl?', '+1, then x², then −10 – and 54 arrives. Which starting number?'),
    cols: 15, rows: 7,
    source: { x: 1, y: 3, dir: 0, value: 1, pick: { min: 1, max: 30 } },
    target: { x: 13, y: 3, value: 54 }, need: 3,
    walls: [...wall(4, 7, [3]), ...wall(8, 7, [3]), ...wall(11, 7, [3])],
    fixed: [fixedOp(4, 3, '+', 1), { x: 8, y: 3, part: { op: { sym: '²', n: 2 }, dir: 0 } }, fixedOp(11, 3, '−', 10)],
    tools: [], par: 8,
  },
  {
    id: 'w7-2',
    title: L('Prim, gerade, Rest', 'Prime, even, rest'),
    hint: L('1 bis 12 auf drei Lager: Primzahlen nach oben, gerade Zahlen in die Mitte, der Rest nach unten. Die 2 ist prim und gerade – wohin damit?', '1 to 12 into three storages: primes at the top, even numbers in the middle, the rest at the bottom. 2 is prime and even – where does it go?'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 12) },
    targets: [
      { x: 11, y: 1, need: 5, accept: yes(prime) },
      { x: 11, y: 4, need: 5, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 2, accept: no(even) },
    ],
    walls: [[5, 0], [5, 1], [5, 7], [5, 8]],
    tools: [], sorts: [prime, even], par: 16,
  },
  {
    id: 'w7-3',
    title: L('Rechnen nach der Weiche', 'Calculating after the switch'),
    hint: L('1 bis 6: Gerade Zahlen werden mal 10 (oben: Vielfache von 20), ungerade bekommen +100 (unten: über 100). Die Maschinen stehen hinter der Weiche!', '1 to 6: even numbers are multiplied by 10 (top: multiples of 20), odd ones get +100 (bottom: over 100). The machines go after the switch!'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 6) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(div(20)) },
      { x: 11, y: 7, need: 3, accept: yes(gt(100)) },
    ],
    walls: [[6, 3], [6, 4], [6, 5]],
    tools: [{ sym: '×', n: 10 }, { sym: '+', n: 100 }], sorts: [even], par: 17,
  },
  {
    id: 'w7-4',
    title: L('Halbieren und prüfen', 'Halve and check'),
    hint: L('6, 10, 14, 15, 21, 35: Gerade Zahlen werden halbiert und müssen oben als Primzahl ankommen. Die ungeraden kommen nach unten.', '6, 10, 14, 15, 21, 35: even numbers are halved and must arrive at the top as primes. The odd ones go to the bottom.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: [6, 10, 14, 15, 21, 35] },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(prime) },
      { x: 11, y: 7, need: 3, accept: no(even) },
    ],
    walls: [[4, 2], [4, 6], [8, 3], [8, 5]],
    tools: [{ sym: '÷', n: 2 }, { sym: '÷', n: 3 }], sorts: [even, prime], par: 15,
  },
  {
    id: 'w7-5',
    title: L('f(x) = 2x² − 3', 'f(x) = 2x² − 3'),
    hint: L('Drei Schritte in der richtigen Reihenfolge: −1, 5, 15, 29, 47.', 'Three steps in the right order: −1, 5, 15, 29, 47.'),
    cols: 15, rows: 8,
    source: { x: 1, y: 1, dir: 0, value: 1, values: seq(1, 5) },
    targets: [{ x: 13, y: 6, need: 5, accept: { kind: 'seq', values: table((x) => 2 * x * x - 3, seq(1, 5)) } }],
    walls: [...rocks(5, 0, 5, 4), ...rocks(10, 3, 10, 7)],
    tools: [{ sym: '²', n: 2 }, { sym: '×', n: 2 }, { sym: '−', n: 3 }, { sym: '+', n: 3 }], par: 22,
  },
  {
    id: 'w7-6',
    title: L('Großes Finale', 'Grand finale'),
    hint: L('1 bis 10, alles quadriert: Über 50 nach oben, gerade Quadratzahlen in die Mitte, der Rest nach unten.', '1 to 10, all squared: over 50 to the top, even square numbers to the middle, the rest to the bottom.'),
    cols: 13, rows: 9,
    source: { x: 1, y: 4, dir: 0, value: 1, values: seq(1, 10) },
    targets: [
      { x: 11, y: 1, need: 3, accept: yes(gt(50)) },
      { x: 11, y: 4, need: 3, accept: { kind: 'test', test: even } },
      { x: 11, y: 7, need: 4, accept: no(even) },
    ],
    walls: [[4, 2], [4, 6], [7, 0], [7, 8]],
    tools: [{ sym: '²', n: 2 }, { sym: '×', n: 2 }], sorts: [gt(50), even], par: 16,
  },
];

/** Alle Welten mit Name und Klassenstufe (Reihenfolge wie im Konzept). */
export interface WorldInfo {
  id: string;
  title: Localized;
  grades: string;
  levels: LevelInfo[];
}

export const WORLDS: WorldInfo[] = [
  { id: 'w1', title: L('Grundrechnen', 'Basic arithmetic'), grades: '5', levels: WORLD_1 },
  { id: 'w2', title: L('Rückwärts', 'Backwards'), grades: '5', levels: WORLD_2 },
  { id: 'w3', title: L('Sortieren', 'Sorting'), grades: '5–6', levels: WORLD_3 },
  { id: 'w4', title: L('Primzahlen', 'Primes'), grades: '5–6', levels: WORLD_4 },
  { id: 'w5', title: L('Terme', 'Terms'), grades: '7–8', levels: WORLD_5 },
  { id: 'w6', title: L('Funktionen', 'Functions'), grades: '8–9', levels: WORLD_6 },
  { id: 'w7', title: L('Meisterprüfung', 'Master exam'), grades: '7–9', levels: WORLD_7 },
];

export const ALL_LEVELS: LevelInfo[] = WORLDS.flatMap((w) => w.levels);
