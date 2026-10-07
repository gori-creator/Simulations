/** Rechenlogik „Monte-Carlo-Methode für π“. */

/** Liegt (x, y) im Viertelkreis mit Radius 1 um den Ursprung? */
export function insideQuarterCircle(x: number, y: number): boolean {
  return x * x + y * y <= 1;
}

/** Schätzwert für π aus k Treffern bei n Punkten (Flächenverhältnis π/4). */
export function estimatePi(hits: number, total: number): number {
  return total > 0 ? (4 * hits) / total : NaN;
}

/** Ungefähr 95 %-Bereich für den Schätzwert nach n Punkten. */
export function piFunnel(total: number): number {
  const p = Math.PI / 4;
  return total > 0 ? 4 * 1.96 * Math.sqrt((p * (1 - p)) / total) : 4;
}
