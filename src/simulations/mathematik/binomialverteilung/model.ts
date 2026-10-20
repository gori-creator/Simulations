/**
 * Rechenlogik „Binomialverteilung“: B(n; p), Einzel- und kumulierte
 * Wahrscheinlichkeiten, Bereiche, Erwartungswert, Standardabweichung,
 * σ-Umgebungen und die Simulation von Bernoulli-Ketten.
 *
 * Numerisch stabil auch für n = 100: Die Einzelwahrscheinlichkeiten werden
 * über Logarithmen berechnet (kein Überlauf von (n über k) und keine
 * Unterläufe von pᵏ in Zwischenergebnissen).
 */

/** Die vier Ereignis-Arten der Simulation. */
export type EventKind = 'eq' | 'le' | 'ge' | 'ab';

export const N_MAX = 100;

/** Binomialkoeffizient (n über k) – multiplikativ, für kleine n exakt ganzzahlig. */
export function binomialCoefficient(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  const kk = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= kk; i++) result = (result * (n - kk + i)) / i;
  // Rundungsfehler der Division entfernen (bis 2⁵³ sind alle ganzen Zahlen exakt darstellbar)
  return result > 2 ** 53 ? result : Math.round(result);
}

/** ln (n über k) als Summe von Logarithmen (stabil für große n). */
export function logBinomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  const kk = Math.min(k, n - k);
  let s = 0;
  for (let i = 1; i <= kk; i++) s += Math.log(n - kk + i) - Math.log(i);
  return s;
}

/** P(X = k) für X ~ B(n; p). Randfälle p = 0 (alles bei 0) und p = 1 (alles bei n). */
export function binomialPmf(n: number, p: number, k: number): number {
  if (!Number.isInteger(k) || k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(logBinomialCoefficient(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/** Alle Einzelwahrscheinlichkeiten P(X = 0) … P(X = n). */
export function binomialPmfAll(n: number, p: number): number[] {
  return Array.from({ length: n + 1 }, (_, k) => binomialPmf(n, p, k));
}

/** Kumulierte Verteilungsfunktion F(k) = P(X ≤ k); F(k) = 0 für k < 0 und 1 für k ≥ n. */
export function binomialCdf(n: number, p: number, k: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let s = 0;
  for (let i = 0; i <= Math.floor(k); i++) s += binomialPmf(n, p, i);
  return Math.min(1, s);
}

/** Alle Werte F(0) … F(n). */
export function binomialCdfAll(n: number, p: number): number[] {
  const out: number[] = [];
  let s = 0;
  for (let k = 0; k <= n; k++) {
    s += binomialPmf(n, p, k);
    out.push(k === n ? 1 : Math.min(1, s));
  }
  return out;
}

/** P(a ≤ X ≤ b); leerer Bereich (a > b) → 0. Grenzen werden auf 0 … n beschränkt. */
export function probRange(n: number, p: number, a: number, b: number): number {
  const lo = Math.max(0, Math.ceil(a));
  const hi = Math.min(n, Math.floor(b));
  if (lo > hi) return 0;
  let s = 0;
  for (let k = lo; k <= hi; k++) s += binomialPmf(n, p, k);
  return Math.min(1, s);
}

/** P(X ≥ k) – direkt als Summe der oberen Werte (genauer als 1 − F(k − 1)). */
export function probAtLeast(n: number, p: number, k: number): number {
  return probRange(n, p, k, n);
}

/** Erwartungswert μ = n · p. */
export function binomialMean(n: number, p: number): number {
  return n * p;
}

/** Standardabweichung σ = √(n · p · (1 − p)). */
export function binomialSd(n: number, p: number): number {
  return Math.sqrt(Math.max(0, n * p * (1 - p)));
}

/** Kleine Toleranz, damit z. B. μ − σ = 3,0000000001 noch 3 einschließt. */
const EPS = 1e-9;

/** Ganzzahlige Grenzen der m-σ-Umgebung [μ − m·σ; μ + m·σ] (innerhalb 0 … n). */
export function sigmaBounds(n: number, p: number, m: number): { lo: number; hi: number } {
  const mu = binomialMean(n, p);
  const s = binomialSd(n, p);
  return { lo: Math.max(0, Math.ceil(mu - m * s - EPS)), hi: Math.min(n, Math.floor(mu + m * s + EPS)) };
}

/** P(μ − m·σ ≤ X ≤ μ + m·σ). */
export function sigmaShare(n: number, p: number, m: number): number {
  const { lo, hi } = sigmaBounds(n, p, m);
  return probRange(n, p, lo, hi);
}

/** Gehört k zum gewählten Ereignis? */
export function inEvent(kind: EventKind, k: number, sel: { k: number; a: number; b: number }): boolean {
  if (kind === 'eq') return k === sel.k;
  if (kind === 'le') return k <= sel.k;
  if (kind === 'ge') return k >= sel.k;
  return k >= sel.a && k <= sel.b;
}

/** Wahrscheinlichkeit des gewählten Ereignisses. */
export function eventProbability(n: number, p: number, kind: EventKind, sel: { k: number; a: number; b: number }): number {
  if (kind === 'eq') return binomialPmf(n, p, sel.k);
  if (kind === 'le') return binomialCdf(n, p, sel.k);
  if (kind === 'ge') return probAtLeast(n, p, sel.k);
  return probRange(n, p, sel.a, sel.b);
}

/** Eine Bernoulli-Kette der Länge n: true = Treffer (mit Wahrscheinlichkeit p). */
export function bernoulliChain(n: number, p: number, random: () => number): boolean[] {
  return Array.from({ length: n }, () => random() < p);
}

/** count Bernoulli-Ketten; Ergebnis: Trefferzahl jeder Kette (in Reihenfolge). */
export function simulateChains(n: number, p: number, count: number, random: () => number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    let hits = 0;
    for (let j = 0; j < n; j++) if (random() < p) hits++;
    out.push(hits);
  }
  return out;
}

/** Häufigkeiten je Trefferzahl 0 … n. */
export function countsOf(results: readonly number[], n: number): number[] {
  const counts = Array.from({ length: n + 1 }, () => 0);
  for (const k of results) if (k >= 0 && k <= n) counts[k]!++;
  return counts;
}

/** Mittelwert aus Häufigkeiten je k. */
export function meanOfCounts(counts: readonly number[]): number {
  const total = counts.reduce((s, c) => s + c, 0);
  return total ? counts.reduce((s, c, k) => s + c * k, 0) / total : NaN;
}

/** Zerlegung in Mantisse und Zehnerexponent: 1,264 · 10¹⁴ → { m: 1.264, e: 14 }. */
export function scientific(v: number, digits = 4): { m: number; e: number } {
  if (v === 0 || !Number.isFinite(v)) return { m: v, e: 0 };
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / 10 ** e;
  const f = 10 ** (digits - 1);
  m = Math.round(m * f) / f;
  if (Math.abs(m) >= 10) {
    m /= 10;
    e += 1;
  }
  return { m, e };
}
