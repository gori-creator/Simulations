/**
 * Rechenlogik „Vom Graphen zur Stammfunktion“ (Jgst. 12/13).
 *
 * F ist Stammfunktion von f, wenn F' = f. Mit F(x) = C + ∫₀ˣ f(t) dt wächst
 * F um die (orientierte) Fläche unter f:
 * - f > 0 ⇒ F steigt, f < 0 ⇒ F fällt
 * - Nullstelle von f mit Vorzeichenwechsel ⇒ Extremstelle von F
 * - Extremstelle von f ⇒ Wendestelle von F
 * Alle Stammfunktionen unterscheiden sich nur um eine Konstante C.
 */

export type FnKey = 'lin' | 'par' | 'cub' | 'cos' | 'gauss';

export interface Fn {
  f: (x: number) => number;
  /** Stammfunktion mit F(0) = 0 */
  F0: (x: number) => number;
  x: [number, number];
}

export const FNS: Record<FnKey, Fn> = {
  lin: { f: (x) => 0.5 * x, F0: (x) => 0.25 * x * x, x: [-4, 4] },
  par: { f: (x) => x * x - 1, F0: (x) => x ** 3 / 3 - x, x: [-3, 3] },
  cub: { f: (x) => 0.25 * x ** 3 - x, F0: (x) => x ** 4 / 16 - (x * x) / 2, x: [-3.2, 3.2] },
  cos: { f: Math.cos, F0: Math.sin, x: [-6.5, 6.5] },
  gauss: { f: (x) => x * Math.exp(-(x * x) / 2), F0: (x) => 1 - Math.exp(-(x * x) / 2), x: [-4, 4] },
};

/** Stammfunktion mit Integrationskonstante C: F(x) = C + ∫₀ˣ f(t) dt. */
export function F(fn: Fn, C: number, x: number): number {
  return C + fn.F0(x);
}

/** Numerisches Integral ∫ₐᵇ f(t) dt (Simpson), zum Prüfen. */
export function integrate(f: (x: number) => number, a: number, b: number, n = 400): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}
