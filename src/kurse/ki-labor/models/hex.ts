/**
 * Lektion „Zufall als Ratgeber“: Hex auf einem 5×5-Brett (Piet Hein 1942,
 * John Nash 1948). Du (blau) verbindest links und rechts, Ada (orange) oben
 * und unten. Auf einem vollen Brett gewinnt immer genau eine Seite.
 * Ada spielt mit flacher Monte-Carlo-Suche: Für jedes freie Feld spielt sie
 * N zufällige Partien zu Ende und wählt das Feld mit der höchsten Siegquote.
 */
export const SIZE = 5;
export type Stone = 'blue' | 'orange' | null;

export function neighbours(i: number): number[] {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const out: number[] = [];
  for (const [dr, dc] of [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]] as const) {
    const rr = r + dr;
    const cc = c + dc;
    if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) out.push(rr * SIZE + cc);
  }
  return out;
}

/** Hat `who` seine beiden Seiten verbunden? Blau: links–rechts, Orange: oben–unten. */
export function connected(board: readonly Stone[], who: 'blue' | 'orange'): boolean {
  const startCells = [...Array(SIZE).keys()].map((k) => (who === 'blue' ? k * SIZE : k)).filter((i) => board[i] === who);
  const seen = new Set(startCells);
  const stack = [...startCells];
  while (stack.length) {
    const i = stack.pop()!;
    if (who === 'blue' ? i % SIZE === SIZE - 1 : Math.floor(i / SIZE) === SIZE - 1) return true;
    for (const n of neighbours(i)) if (board[n] === who && !seen.has(n)) {
      seen.add(n);
      stack.push(n);
    }
  }
  return false;
}

export function winnerOf(board: readonly Stone[]): Stone {
  if (connected(board, 'blue')) return 'blue';
  if (connected(board, 'orange')) return 'orange';
  return null;
}

/** Zufällige Partie bis zum vollen Brett; wer gewinnt? */
export function playout(board: readonly Stone[], toMove: 'blue' | 'orange', random: () => number): 'blue' | 'orange' {
  const b = [...board];
  const free = b.flatMap((s, i) => (s === null ? [i] : []));
  for (let k = free.length - 1; k > 0; k--) {
    const j = Math.floor(random() * (k + 1));
    [free[k], free[j]] = [free[j]!, free[k]!];
  }
  let who = toMove;
  for (const i of free) {
    b[i] = who;
    who = who === 'blue' ? 'orange' : 'blue';
  }
  return connected(b, 'orange') ? 'orange' : 'blue';
}

export interface McResult {
  best: number;
  /** Siegquote von Orange je freiem Feld (0…1). */
  rates: Map<number, number>;
  games: number;
}

/** Flache Monte-Carlo-Suche für Orange mit `n` Probespielen je Feld. */
export function monteCarlo(board: readonly Stone[], n: number, random: () => number = Math.random): McResult {
  const rates = new Map<number, number>();
  let best = -1;
  let bestRate = -1;
  let games = 0;
  board.forEach((s, i) => {
    if (s !== null) return;
    const b = [...board];
    b[i] = 'orange';
    let wins = 0;
    if (connected(b, 'orange')) wins = n;
    else for (let k = 0; k < n; k++) if (playout(b, 'blue', random) === 'orange') wins += 1;
    games += n;
    const rate = wins / n;
    rates.set(i, rate);
    if (rate > bestRate) {
      bestRate = rate;
      best = i;
    }
  });
  return { best, rates, games };
}
