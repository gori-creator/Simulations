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

// ───────────────────────── Üben ─────────────────────────

export interface GaltonTask {
  /** Anzahl der Wege zu Fach k oder Wahrscheinlichkeit für Fach k (in Prozent) */
  kind: 'paths' | 'prob';
  n: number;
  p: number;
  k: number;
  answer: number;
}

const P_VALUES = [0.5, 0.5, 0.3, 0.4, 0.6, 0.7] as const;

/**
 * Reproduzierbare Aufgabe Nr. q: ungerade Nummern fragen die Anzahl der Wege
 * zu einem Fach (Pascal’sches Dreieck), gerade die Wahrscheinlichkeit in
 * Prozent (Bernoulli-Formel). Aufgabe 2 nutzt p = 0,5.
 */
export function galtonTask(q: number, rand: () => number): GaltonTask {
  if (q % 2 === 1) {
    const n = 3 + Math.floor(rand() * 5);
    const k = Math.floor(rand() * (n + 1));
    return { kind: 'paths', n, p: 0.5, k, answer: binomialCoefficient(n, k) };
  }
  const n = 3 + Math.floor(rand() * 6);
  const p = q === 2 ? 0.5 : P_VALUES[Math.floor(rand() * P_VALUES.length)]!;
  const k = Math.floor(rand() * (n + 1));
  return { kind: 'prob', n, p, k, answer: binomialPmf(n, k, p) * 100 };
}

/** Erste Zahl in der Eingabe (Komma oder Punkt), sonst null. */
export function parseNumber(text: string): number | null {
  const m = text.replace(/\s/g, '').match(/\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(',', '.')) : null;
}

/** Wege: genau; Wahrscheinlichkeit: höchstens 0,06 Prozentpunkte bzw. 1 % daneben (Runden auf eine Stelle). */
export function checkGalton(task: GaltonTask, text: string): { ok: boolean; got: number | null } {
  const got = parseNumber(text);
  if (got === null) return { ok: false, got };
  if (task.kind === 'paths') return { ok: got === task.answer, got };
  return { ok: Math.abs(got - task.answer) <= Math.max(0.06, 0.01 * task.answer), got };
}
