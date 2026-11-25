/**
 * Strategiespiel „Nimm“: Von einem Haufen nehmen zwei Spieler abwechselnd
 * 1 bis k Hölzer; wer das letzte nimmt, gewinnt. Verlustpositionen sind die
 * Vielfachen von k + 1. Dazu Nim mit mehreren Haufen (Nim-Summe, XOR).
 */

/** Ist die Position (Anzahl Hölzer) für den Spieler am Zug verloren? */
export function isLosing(n: number, k: number): boolean {
  return n % (k + 1) === 0;
}

/** Bester Zug: so viele nehmen, dass ein Vielfaches von k + 1 übrig bleibt; sonst 1 (Hoffnung auf einen Fehler). */
export function bestMove(n: number, k: number): number {
  const r = n % (k + 1);
  return r === 0 ? Math.min(1, n) : r;
}

/** Alle Verlustpositionen bis n. */
export function losingPositions(n: number, k: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) if (isLosing(i, k)) out.push(i);
  return out;
}

/** Nim-Summe mehrerer Haufen (bitweises XOR). */
export function nimSum(heaps: number[]): number {
  return heaps.reduce((s, h) => s ^ h, 0);
}

/** Gewinnzug bei mehreren Haufen: [Haufen, neue Größe] oder null, wenn die Nim-Summe 0 ist. */
export function nimMove(heaps: number[]): [number, number] | null {
  const s = nimSum(heaps);
  if (s === 0) return null;
  for (let i = 0; i < heaps.length; i++) {
    const target = heaps[i]! ^ s;
    if (target < heaps[i]!) return [i, target];
  }
  return null;
}
