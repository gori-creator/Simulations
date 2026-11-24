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

/**
 * Ist der Schätzwert 4·k/n mit `decimals` Nachkommastellen exakt darstellbar?
 * Dann steht in der Anzeige „=“, sonst „≈“. Ganzzahlige Rechnung, keine Rundungsfehler.
 */
export function estimateIsExact(hits: number, total: number, decimals: number): boolean {
  if (total <= 0) return false;
  return (4 * hits * 10 ** decimals) % total === 0;
}

// ───────────────────────── Buffonsches Nadelproblem ─────────────────────────

/**
 * Kreuzt eine Nadel der Länge `len` (in Linienabständen, len ≤ 1) mit
 * Mittelpunkthöhe `yc` (in Linienabständen) und Winkel `theta` ∈ [0; π) eine
 * der waagrechten Linien y = 0, 1, 2, …?
 */
export function needleCrosses(yc: number, theta: number, len: number): boolean {
  const h = (len / 2) * Math.sin(theta);
  return Math.floor(yc - h) !== Math.floor(yc + h);
}

/** Wahrscheinlichkeit, dass eine Nadel kreuzt: 2l / (π · d) mit d = 1. */
export function needleProbability(len: number): number {
  return (2 * len) / Math.PI;
}

/** Schätzwert π ≈ 2 · l · n / k (für k = 0 nicht definiert). */
export function buffonEstimate(hits: number, total: number, len: number): number {
  return hits > 0 ? (2 * len * total) / hits : NaN;
}

/** Ungefähr 95 %-Bereich des Schätzwerts 2l·n/k (Näherung über die Standardabweichung von k/n). */
export function buffonFunnel(total: number, len: number): number {
  const p = needleProbability(len);
  return total > 0 ? 1.96 * Math.PI * Math.sqrt((1 - p) / (p * total)) : 4;
}

// ───────────────────────── Fläche unter einer Parabel ─────────────────────────

/** Liegt (x, y) im Einheitsquadrat unter der Normalparabel y = x²? */
export function underParabola(x: number, y: number): boolean {
  return y <= x * x;
}

/** Exakte Fläche unter y = x² auf [0; 1]. */
export const PARABOLA_AREA = 1 / 3;

/** Ungefähr 95 %-Bereich des Anteils k/n bei Trefferwahrscheinlichkeit p. */
export function shareFunnel(total: number, p: number): number {
  return total > 0 ? 1.96 * Math.sqrt((p * (1 - p)) / total) : 1;
}
