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
