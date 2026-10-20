/**
 * Rechenlogik „Extremwertprobleme“ (Jgst. 13).
 *
 * Vorgehen: Zielfunktion aufstellen, mit der Nebenbedingung auf eine
 * Variable reduzieren, Definitionsbereich angeben, Ableitung null setzen,
 * Art des Extremums prüfen und die Randwerte vergleichen.
 *
 * - Schachtel: Aus einem Karton a × b werden an den Ecken Quadrate der
 *   Seitenlänge x ausgeschnitten: V(x) = x(a − 2x)(b − 2x), 0 < x < min(a, b)/2.
 * - Dose: Zylinder mit festem Volumen V; Oberfläche O(r) = 2πr² + 2V/r, r > 0.
 * - Rechteck unter f(x) = 3e^(−0,5x): A(u) = u · f(u), u > 0.
 */

export type ProbKey = 'box' | 'can' | 'rect';

export interface Box {
  a: number;
  b: number;
}

export function boxVolume(p: Box, x: number): number {
  return x * (p.a - 2 * x) * (p.b - 2 * x);
}
export function boxDeriv(p: Box, x: number): number {
  // V(x) = 4x³ − 2(a + b)x² + abx
  return 12 * x * x - 4 * (p.a + p.b) * x + p.a * p.b;
}
/** Maximalstelle im Definitionsbereich (kleinere Nullstelle von V′). */
export function boxOptimum(p: Box): number {
  const s = p.a + p.b;
  return (s - Math.sqrt(s * s - 3 * p.a * p.b)) / 6;
}

export function canSurface(V: number, r: number): number {
  return 2 * Math.PI * r * r + (2 * V) / r;
}
export function canHeight(V: number, r: number): number {
  return V / (Math.PI * r * r);
}
export function canDeriv(V: number, r: number): number {
  return 4 * Math.PI * r - (2 * V) / (r * r);
}
export function canOptimum(V: number): number {
  return Math.cbrt(V / (2 * Math.PI));
}

export const rectF = (x: number) => 3 * Math.exp(-0.5 * x);
export function rectArea(u: number): number {
  return u * rectF(u);
}
export function rectDeriv(u: number): number {
  return rectF(u) * (1 - 0.5 * u);
}
export const rectOptimum = 2;
