/**
 * Rechenlogik „Normalverteilung“ (Jgst. 13 / Studium).
 *
 * Dichte φ(x) = 1/(σ√(2π)) · e^(−(x−μ)²/(2σ²)), Verteilungsfunktion
 * Φ(x) = P(X ≤ x). Wahrscheinlichkeiten sind Flächen unter der Dichte:
 * P(a ≤ X ≤ b) = Φ(b) − Φ(a). Sigma-Regeln: μ ± σ ≈ 68,3 %,
 * μ ± 2σ ≈ 95,4 %, μ ± 3σ ≈ 99,7 %.
 */

const SQRT2 = Math.SQRT2;
const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Fehlerfunktion erf(x), genau auf etwa 1e-14 (Reihe bzw. Kettenbruch). */
export function erf(x: number): number {
  if (x < 0) return -erf(-x);
  if (x > 6) return 1;
  if (x < 2.5) {
    // Taylorreihe erf(x) = 2/√π · Σ (−1)ⁿ x^(2n+1) / (n! (2n+1))
    let sum = 0;
    let term = x;
    for (let n = 0; n < 200; n++) {
      const add = term / (2 * n + 1);
      sum += add;
      if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
      term *= (-x * x) / (n + 1);
    }
    return (2 / Math.sqrt(Math.PI)) * sum;
  }
  return 1 - erfc(x);
}

/** Komplementäre Fehlerfunktion für x ≥ 2,5 (Kettenbruch nach Lentz). */
function erfc(x: number): number {
  // erfc(x) = e^(−x²)/√π · 1/(x + 1/2/(x + 1/(x + 3/2/(x + …))))
  const tiny = 1e-300;
  let f = x;
  let C = x;
  let D = 0;
  for (let n = 1; n < 300; n++) {
    const an = n / 2;
    D = x + an * D;
    D = Math.abs(D) < tiny ? tiny : D;
    C = x + an / C;
    C = Math.abs(C) < tiny ? tiny : C;
    D = 1 / D;
    const delta = C * D;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
}

export function pdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

export function cdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * SQRT2)));
}

/** P(a ≤ X ≤ b) */
export function prob(a: number, b: number, mu: number, sigma: number): number {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return cdf(hi, mu, sigma) - cdf(lo, mu, sigma);
}

/** Standardisierung z = (x − μ) / σ */
export function zScore(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma;
}

/** Wahrscheinlichkeit der k-σ-Umgebung. */
export function sigmaRule(k: number): number {
  return erf(k / SQRT2);
}

/* ------------------------------------------------------------------ */
/* Näherung der Binomialverteilung                                     */
/* ------------------------------------------------------------------ */

/** Alle Wahrscheinlichkeiten P(X = k), k = 0 … n, für X ~ B(n; p) (über Logarithmen, damit nichts unterläuft). */
export function binomPmf(n: number, p: number): number[] {
  const lf = [0];
  for (let i = 1; i <= n; i++) lf.push(lf[i - 1]! + Math.log(i));
  const out: number[] = [];
  for (let k = 0; k <= n; k++) {
    if (p <= 0) out.push(k === 0 ? 1 : 0);
    else if (p >= 1) out.push(k === n ? 1 : 0);
    else out.push(Math.exp(lf[n]! - lf[k]! - lf[n - k]! + k * Math.log(p) + (n - k) * Math.log(1 - p)));
  }
  return out;
}

/** P(X ≤ k) für X ~ B(n; p). */
export function binomCdf(n: number, p: number, k: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  const pmf = binomPmf(n, p);
  let s = 0;
  for (let i = 0; i <= k; i++) s += pmf[i]!;
  return Math.min(1, s);
}

/** Kenngrößen μ = n·p und σ = √(n·p·(1 − p)). */
export function binomMoments(n: number, p: number): { mu: number; sigma: number } {
  return { mu: n * p, sigma: Math.sqrt(n * p * (1 - p)) };
}

/**
 * Näherung P(X ≤ k) ≈ Φ((k + 0,5 − μ)/σ) mit Stetigkeitskorrektur
 * bzw. Φ((k − μ)/σ) ohne.
 */
export function normalApproxCdf(n: number, p: number, k: number, continuity = true): number {
  const { mu, sigma } = binomMoments(n, p);
  return cdf(k + (continuity ? 0.5 : 0), mu, sigma);
}

/** Laplace-Bedingung (Faustregel): σ > 3 – dann ist die Näherung brauchbar. */
export function laplaceOk(n: number, p: number): boolean {
  return binomMoments(n, p).sigma > 3;
}

/* ------------------------------------------------------------------ */
/* Stichproben                                                         */
/* ------------------------------------------------------------------ */

/** Normalverteilte Zufallszahl (Box-Muller) aus gleichverteilten Zahlen von `rnd`. */
export function normalSample(rnd: () => number, mu: number, sigma: number): number {
  let u = 0;
  while (u <= 1e-12) u = rnd();
  const v = rnd();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Mittelwert, (Stichproben-)Standardabweichung und Anteil im Intervall [lo, hi]. */
export function sampleStats(xs: readonly number[], lo: number, hi: number): { mean: number; sd: number; share: number } {
  const n = xs.length;
  if (!n) return { mean: NaN, sd: NaN, share: NaN };
  let s = 0;
  let inside = 0;
  for (const x of xs) {
    s += x;
    if (x >= lo && x <= hi) inside++;
  }
  const mean = s / n;
  let q = 0;
  for (const x of xs) q += (x - mean) ** 2;
  return { mean, sd: n > 1 ? Math.sqrt(q / (n - 1)) : 0, share: inside / n };
}
