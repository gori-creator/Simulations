/**
 * Lektion „Das Streichholz-Spiel“: Bit lernt wie MENACE (Donald Michie,
 * 1961) mit Schachteln voller Perlen. Spiel: 9 Hölzer, je Zug 1 oder 2
 * nehmen, wer das letzte nimmt, gewinnt. Für jede Holzzahl hat Bit eine
 * Schachtel mit Perlen für „1 nehmen“ und „2 nehmen“ und zieht zufällig eine
 * Perle. Gewinnt Bit, kommt für jeden seiner Züge eine Perle dazu; verliert
 * er, wird eine weggenommen (mindestens eine bleibt).
 */
export const START = 9;

export type Boxes = Record<number, [number, number]>;

export function newBoxes(): Boxes {
  const boxes: Boxes = {};
  for (let n = 1; n <= START; n++) boxes[n] = n === 1 ? [3, 0] : [3, 3];
  return boxes;
}

/** Zug von Bit: 1 oder 2, gezogen nach Perlenzahl. */
export function bitTake(boxes: Boxes, sticks: number, random: () => number): 1 | 2 {
  const [a, b] = boxes[sticks]!;
  if (sticks === 1 || b === 0) return 1;
  return random() * (a + b) < a ? 1 : 2;
}

export interface Move {
  sticks: number;
  take: 1 | 2;
}

/** Nach einem Spiel: Bits Züge belohnen oder bestrafen. */
export function learn(boxes: Boxes, bitMoves: readonly Move[], bitWon: boolean): Boxes {
  const next: Boxes = Object.fromEntries(Object.entries(boxes).map(([k, v]) => [k, [...v] as [number, number]]));
  for (const m of bitMoves) {
    const box = next[m.sticks]!;
    const i = m.take - 1;
    box[i] = bitWon ? box[i]! + 1 : Math.max(1, box[i]! - 1);
  }
  return next;
}

/** Ein ganzes Übungsspiel gegen einen Zufallsspieler (der beginnt). Liefert, ob Bit gewann. */
export function practiceGame(boxes: Boxes, random: () => number): { boxes: Boxes; bitWon: boolean } {
  let sticks = START;
  const moves: Move[] = [];
  let bitTurn = false;
  let last: 'bit' | 'other' = 'other';
  while (sticks > 0) {
    if (bitTurn) {
      const take = Math.min(sticks, bitTake(boxes, sticks, random)) as 1 | 2;
      moves.push({ sticks, take });
      sticks -= take;
      last = 'bit';
    } else {
      const take = sticks === 1 ? 1 : random() < 0.5 ? 1 : 2;
      sticks -= take;
      last = 'other';
    }
    bitTurn = !bitTurn;
  }
  const bitWon = last === 'bit';
  return { boxes: learn(boxes, moves, bitWon), bitWon };
}

/** Anteil der Perlen für den Gewinnzug (Hölzer auf ein Vielfaches von 3 bringen). */
export function smartShare(boxes: Boxes): number {
  let good = 0;
  let all = 0;
  for (let n = 2; n <= START; n++) {
    if (n % 3 === 0) continue;
    const best = n % 3;
    const [a, b] = boxes[n]!;
    good += best === 1 ? a : b;
    all += a + b;
  }
  return all ? good / all : 0;
}
