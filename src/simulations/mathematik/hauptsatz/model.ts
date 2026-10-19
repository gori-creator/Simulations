/**
 * Rechenlogik „Integralfunktion und Hauptsatz“ (Jgst. 12/13 / Studium).
 *
 * Integralfunktion zur unteren Grenze a: I_a(x) = ∫ₐˣ f(t) dt.
 * Hauptsatz der Differential- und Integralrechnung:
 *   1. I_a'(x) = f(x) – der Zuwachs (I_a(x + h) − I_a(x)) / h ist die
 *      mittlere Höhe des Streifens und strebt für h → 0 gegen f(x).
 *   2. Für jede Stammfunktion F gilt ∫ₐᵇ f(x) dx = F(b) − F(a).
 */

export type FnKey = 'lin' | 'par' | 'cos' | 'exp';

export interface Fn {
  f: (x: number) => number;
  /** eine Stammfunktion */
  F: (x: number) => number;
  x: [number, number];
}

export const FNS: Record<FnKey, Fn> = {
  lin: { f: (x) => x, F: (x) => (x * x) / 2, x: [-4, 4] },
  par: { f: (x) => 0.5 * x * x - 1, F: (x) => x ** 3 / 6 - x, x: [-3.5, 3.5] },
  cos: { f: Math.cos, F: Math.sin, x: [-6.5, 6.5] },
  exp: { f: (x) => Math.exp(0.5 * x), F: (x) => 2 * Math.exp(0.5 * x), x: [-4, 3] },
};

/** I_a(x) = F(x) − F(a) */
export function integralFn(fn: Fn, a: number, x: number): number {
  return fn.F(x) - fn.F(a);
}

/** Differenzenquotient der Integralfunktion (mittlere Streifenhöhe). */
export function stripMean(fn: Fn, x: number, h: number): number {
  return (fn.F(x + h) - fn.F(x)) / h;
}

/** Numerisches Integral (Simpson). */
export function integrate(f: (x: number) => number, a: number, b: number, n = 400): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}
