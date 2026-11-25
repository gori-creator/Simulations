/**
 * Weitere Wahrscheinlichkeitsverteilungen: Poisson (auch als Näherung der
 * Binomialverteilung), hypergeometrische Verteilung (Ziehen ohne Zurücklegen)
 * und Exponentialverteilung.
 */

/** Binomialkoeffizient (als Gleitkommazahl, stabil über Logarithmen). */
export function lnChoose(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return lnFact(n) - lnFact(k) - lnFact(n - k);
}

const LN_FACT: number[] = [0];
export function lnFact(n: number): number {
  for (let i = LN_FACT.length; i <= n; i++) LN_FACT[i] = LN_FACT[i - 1]! + Math.log(i);
  return LN_FACT[n]!;
}

export function binomial(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(lnChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function poisson(lambda: number, k: number): number {
  if (k < 0) return 0;
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return Math.exp(-lambda + k * Math.log(lambda) - lnFact(k));
}

/** Hypergeometrisch: N Kugeln, davon M Treffer, n gezogen ohne Zurücklegen, genau k Treffer. */
export function hypergeometric(N: number, M: number, n: number, k: number): number {
  const lo = Math.max(0, n - (N - M));
  const hi = Math.min(n, M);
  if (k < lo || k > hi) return 0;
  return Math.exp(lnChoose(M, k) + lnChoose(N - M, n - k) - lnChoose(N, n));
}

/** Exponentialverteilung: Dichte und Verteilungsfunktion. */
export function expDensity(lambda: number, t: number): number {
  return t < 0 ? 0 : lambda * Math.exp(-lambda * t);
}

export function expCdf(lambda: number, t: number): number {
  return t < 0 ? 0 : 1 - Math.exp(-lambda * t);
}

/** Summe P(X ≤ k) einer diskreten Verteilung. */
export function cumulative(pmf: (k: number) => number, k: number): number {
  let s = 0;
  for (let i = 0; i <= k; i++) s += pmf(i);
  return s;
}
