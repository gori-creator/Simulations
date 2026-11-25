/**
 * Uneigentliche Integrale: unbeschränktes Intervall (∫₁^∞ x^(−p) dx,
 * ∫₀^∞ e^(−x) dx) und unbeschränkte Funktion (∫₀¹ x^(−p) dx).
 */

export type Kind = 'unendlich' | 'polstelle' | 'exp';

export function f(kind: Kind, p: number, x: number): number {
  return kind === 'exp' ? Math.exp(-x) : Math.pow(x, -p);
}

/** Stammfunktion von x^(−p) bzw. e^(−x). */
export function F(kind: Kind, p: number, x: number): number {
  if (kind === 'exp') return -Math.exp(-x);
  if (Math.abs(p - 1) < 1e-12) return Math.log(x);
  return Math.pow(x, 1 - p) / (1 - p);
}

/** Integral über [a, b]. */
export function integral(kind: Kind, p: number, a: number, b: number): number {
  return F(kind, p, b) - F(kind, p, a);
}

/** Feste Grenze: 1 bzw. 0 (exp) für die obere offene Grenze, 1 als obere Grenze bei der Polstelle. */
export function fixedBound(kind: Kind): number {
  return kind === 'exp' ? 0 : 1;
}

/**
 * Wert des uneigentlichen Integrals oder null, wenn es divergiert:
 * ∫₁^∞ x^(−p) dx = 1/(p − 1) für p > 1; ∫₀¹ x^(−p) dx = 1/(1 − p) für p < 1; ∫₀^∞ e^(−x) dx = 1.
 */
export function improperValue(kind: Kind, p: number): number | null {
  if (kind === 'exp') return 1;
  if (kind === 'unendlich') return p > 1 + 1e-12 ? 1 / (p - 1) : null;
  return p < 1 - 1e-12 ? 1 / (1 - p) : null;
}

/** Integral mit der variablen Grenze z (obere Grenze b bzw. untere Grenze ε). */
export function partial(kind: Kind, p: number, z: number): number {
  return kind === 'polstelle' ? integral(kind, p, z, 1) : integral(kind, p, fixedBound(kind), z);
}
