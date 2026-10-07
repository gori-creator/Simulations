import { solveQuadratic } from '../../../sim-core/numeric';

/**
 * Rechenlogik der Simulation „Quadratische Funktion“.
 *
 * Scheitelpunktform: f(x) = a(x − d)² + e
 * Allgemeine Form:   f(x) = ax² + bx + c
 */
export interface Coefficients {
  a: number;
  b: number;
  c: number;
}

export function vertexToGeneral(a: number, d: number, e: number): Coefficients {
  return { a, b: -2 * a * d, c: a * d * d + e };
}

/** Scheitelpunkt aus der allgemeinen Form; `null`, wenn a = 0 (keine Parabel). */
export function generalToVertex(a: number, b: number, c: number): { d: number; e: number } | null {
  if (Math.abs(a) < 1e-12) return null;
  return { d: -b / (2 * a), e: c - (b * b) / (4 * a) };
}

export function discriminant({ a, b, c }: Coefficients): number {
  return b * b - 4 * a * c;
}

/** Reelle Nullstellen, aufsteigend sortiert. */
export function roots(coefficients: Coefficients): number[] {
  return solveQuadratic(coefficients.a, coefficients.b, coefficients.c);
}

export type Shape = 'none' | 'stretched' | 'compressed' | 'normal';

/** Gestreckt (|a| > 1), gestaucht (|a| < 1) oder wie die Normalparabel (|a| = 1). */
export function shapeOf(a: number): Shape {
  const abs = Math.abs(a);
  if (abs < 1e-12) return 'none';
  if (Math.abs(abs - 1) < 1e-12) return 'normal';
  return abs > 1 ? 'stretched' : 'compressed';
}
