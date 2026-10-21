/** Rechenlogik „Galtonbrett“: Binomialverteilung B(n; p). */

export function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  const kk = Math.min(k, n - k);
  for (let i = 1; i <= kk; i++) result = (result * (n - kk + i)) / i;
  return result;
}

export function binomialPmf(n: number, k: number, p: number): number {
  return binomialCoefficient(n, k) * p ** k * (1 - p) ** (n - k);
}

export function binomialMean(n: number, p: number): number {
  return n * p;
}

export function binomialSd(n: number, p: number): number {
  return Math.sqrt(n * p * (1 - p));
}

/** Weg einer Kugel: pro Reihe 1 = rechts, 0 = links. */
export function randomPath(rows: number, p: number, random: () => number): number[] {
  return Array.from({ length: rows }, () => (random() < p ? 1 : 0));
}

/** Mittelwert und Standardabweichung aus Häufigkeiten je Fach. */
export function statsFromCounts(counts: readonly number[]): { total: number; mean: number; sd: number } {
  const total = counts.reduce((s, c) => s + c, 0);
  if (!total) return { total: 0, mean: NaN, sd: NaN };
  const mean = counts.reduce((s, c, k) => s + c * k, 0) / total;
  const variance = counts.reduce((s, c, k) => s + c * (k - mean) ** 2, 0) / total;
  return { total, mean, sd: Math.sqrt(variance) };
}

/** Lässt `count` Kugeln fallen und zählt sie je Fach (für „1000 sofort“). */
export function dropBalls(
  rows: number,
  p: number,
  count: number,
  random: () => number,
): { counts: number[]; lastPath: number[] | null; lastBin: number } {
  const counts = Array.from({ length: rows + 1 }, () => 0);
  let lastPath: number[] | null = null;
  let lastBin = -1;
  for (let i = 0; i < count; i++) {
    lastPath = randomPath(rows, p, random);
    lastBin = lastPath.reduce((s, v) => s + v, 0);
    counts[lastBin]!++;
  }
  return { counts, lastPath, lastBin };
}

/**
 * Ist `value` bei `decimals` Nachkommastellen exakt darstellbar? Dann steht in
 * der Anzeige „=“, sonst „≈“ (z. B. σ = 2, aber σ ≈ 1,30).
 */
export function roundedRelation(value: number, decimals: number): { exact: boolean } {
  const factor = 10 ** decimals;
  return { exact: Math.abs(value * factor - Math.round(value * factor)) < 1e-9 * Math.max(1, Math.abs(value * factor)) };
}
