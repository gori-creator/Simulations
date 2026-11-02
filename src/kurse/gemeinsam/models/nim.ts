/**
 * Nim (Variante „Wer den letzten Stein nimmt, gewinnt“, 1 bis 3 Steine je Zug)
 * und eine vollständige Spielbaum-Suche (Negamax). Für „Bit rechnet voraus“:
 * Bit probiert im Kopf alle Zugfolgen aus und zählt, wie viele Stellungen er
 * dabei angeschaut hat. Gewinnstrategie: dem Gegner ein Vielfaches von 4 lassen.
 */
export const MAX_TAKE = 3;

export function moves(stones: number): number[] {
  const out: number[] = [];
  for (let k = 1; k <= Math.min(MAX_TAKE, stones); k++) out.push(k);
  return out;
}

export interface SearchResult {
  /** +1: Wer am Zug ist, gewinnt bei bestem Spiel; −1: verliert. */
  value: 1 | -1;
  /** Bester Zug (bei mehreren gleich guten der kleinste). */
  best: number;
  /** Angeschaute Stellungen (Knoten im Spielbaum). */
  nodes: number;
}

/** Vollständige Suche ohne Gedächtnis – damit man sieht, wie schnell der Baum wächst. */
export function search(stones: number): SearchResult {
  let nodes = 0;
  const value = (n: number): 1 | -1 => {
    nodes += 1;
    if (n === 0) return -1; // der Gegner hat den letzten Stein genommen
    for (const k of moves(n)) if (value(n - k) === -1) return 1;
    return -1;
  };
  let best = 1;
  let bestValue: 1 | -1 = -1;
  for (const k of moves(stones)) {
    const v = value(stones - k) === -1 ? 1 : -1;
    if (v === 1) {
      best = k;
      bestValue = 1;
      break;
    }
  }
  return { value: bestValue, best, nodes: nodes + 1 };
}

/** Zug von Bit: 'kurz' schaut nur, ob er sofort gewinnen kann, sonst zufällig; 'voll' rechnet alles durch. */
export function bitMove(stones: number, mode: 'kurz' | 'voll', random: () => number = Math.random): { take: number; nodes: number } {
  if (stones <= MAX_TAKE) return { take: stones, nodes: 1 + stones };
  if (mode === 'kurz') return { take: 1 + Math.floor(random() * MAX_TAKE), nodes: 1 + MAX_TAKE };
  const r = search(stones);
  // In einer Verluststellung zieht Bit zufällig (und hofft auf einen Fehler)
  return { take: r.value === 1 ? r.best : 1 + Math.floor(random() * Math.min(MAX_TAKE, stones)), nodes: r.nodes };
}

/** Gewinnzug nach der Vierer-Regel (0 = keiner möglich). */
export function winningTake(stones: number): number {
  return stones % (MAX_TAKE + 1);
}
