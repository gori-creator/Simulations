/**
 * Linearer Potentialtopf mit unendlich hohen Wänden: Energiestufen,
 * Wellenfunktionen, Aufenthaltswahrscheinlichkeit und Übergänge.
 */

export const H = 6.62607015e-34;
export const C = 299792458;
export const E = 1.602176634e-19;
export const ME = 9.1093837e-31;
export const MN = 1.67492750e-27;

/** Energie der Stufe n in J: E_n = n² h² / (8 m L²). */
export function energy(n: number, L: number, m = ME): number {
  return (n * n * H * H) / (8 * m * L * L);
}

/** Normierte Wellenfunktion ψ_n(x) = √(2/L) · sin(n π x / L) für 0 ≤ x ≤ L. */
export function psi(n: number, x: number, L: number): number {
  if (x < 0 || x > L) return 0;
  return Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L);
}

/** Wahrscheinlichkeit, das Teilchen zwischen a und b zu finden (analytisch). */
export function probability(n: number, a: number, b: number, L: number): number {
  const F = (x: number) => x / L - Math.sin((2 * n * Math.PI * x) / L) / (2 * n * Math.PI);
  const lo = Math.max(0, Math.min(L, a));
  const hi = Math.max(0, Math.min(L, b));
  return F(hi) - F(lo);
}

/** Wellenlänge des Photons beim Übergang von n₁ nach n₂ (in m). */
export function transitionWavelength(n1: number, n2: number, L: number, m = ME): number {
  const dE = Math.abs(energy(n1, L, m) - energy(n2, L, m));
  return (H * C) / dE;
}

/** de-Broglie-Wellenlänge der Stufe n: λ = 2L / n (stehende Welle). */
export function deBroglie(n: number, L: number): number {
  return (2 * L) / n;
}
