/**
 * Lektion „Minimax und Alpha-Beta“: Tic-Tac-Toe als Spielbaum.
 * Ada spielt O (MAX), du spielst X (MIN). Minimax mit begrenzter Suchtiefe;
 * an der Tiefengrenze schätzt eine Bewertung die Stellung: offene
 * Gewinnlinien von O minus offene Gewinnlinien von X. Alpha-Beta schneidet
 * Äste ab, die das Ergebnis nicht mehr ändern können – gleiches Ergebnis,
 * weniger Knoten.
 */
export type Cell = 'X' | 'O' | null;
export type Board = Cell[];

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
] as const;

export const WIN = 100;

export function winner(b: Board): Cell {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return null;
}

export function full(b: Board): boolean {
  return b.every((c) => c !== null);
}

export function freeCells(b: Board): number[] {
  return b.flatMap((c, i) => (c === null ? [i] : []));
}

/** Offene Linien (ohne gegnerischen Stein) für O minus für X. */
export function heuristic(b: Board): number {
  let score = 0;
  for (const line of LINES) {
    const cells = line.map((i) => b[i]);
    if (!cells.includes('X')) score += 1;
    if (!cells.includes('O')) score -= 1;
  }
  return score;
}

export interface MoveEval {
  move: number;
  value: number;
}

export interface Decision {
  best: number;
  value: number;
  /** Bewertung jedes möglichen Zuges (aus Sicht von O). */
  evals: MoveEval[];
  /** Untersuchte Knoten im Spielbaum. */
  nodes: number;
}

/** Bester Zug für O mit Suchtiefe `depth` (1 = nur den eigenen Zug anschauen). */
export function decide(board: Board, depth: number, alphaBeta: boolean): Decision {
  let nodes = 0;
  const b = [...board];

  const value = (d: number, maxTurn: boolean, alpha: number, beta: number): number => {
    nodes += 1;
    const w = winner(b);
    if (w === 'O') return WIN - (depth - d);
    if (w === 'X') return -WIN + (depth - d);
    if (full(b)) return 0;
    if (d === 0) return heuristic(b);
    let best = maxTurn ? -Infinity : Infinity;
    for (const i of freeCells(b)) {
      b[i] = maxTurn ? 'O' : 'X';
      const v = value(d - 1, !maxTurn, alpha, beta);
      b[i] = null;
      if (maxTurn) {
        best = Math.max(best, v);
        alpha = Math.max(alpha, v);
      } else {
        best = Math.min(best, v);
        beta = Math.min(beta, v);
      }
      if (alphaBeta && alpha >= beta) break;
    }
    return best;
  };

  const evals: MoveEval[] = [];
  for (const i of freeCells(b)) {
    b[i] = 'O';
    // Für die Anzeige jeden Zug mit vollem Fenster bewerten; abgeschnitten wird nur im Inneren
    const v = value(depth - 1, false, -Infinity, Infinity);
    b[i] = null;
    evals.push({ move: i, value: v });
  }
  nodes += 1;
  const top = Math.max(...evals.map((e) => e.value));
  // Bei Gleichstand: Mitte, dann Ecken, dann Kanten
  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  const best = order.find((i) => evals.some((e) => e.move === i && e.value === top))!;
  return { best, value: top, evals, nodes };
}
