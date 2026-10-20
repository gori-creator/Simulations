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

/** `true`, wenn `value` bei `decimals` Nachkommastellen nur gerundet gezeigt werden kann (dann „≈“ statt „=“). */
export function isRounded(value: number, decimals = 2): boolean {
  const scaled = value * 10 ** decimals;
  return Math.abs(scaled - Math.round(scaled)) > 1e-6;
}

/**
 * Bereich der Regler b und c der allgemeinen Form. Liegt ein gewünschter
 * Scheitel S(d | e) bei Streckfaktor a außerhalb dessen, was b und c darstellen
 * können, bleibt die Höhe e erhalten und d wird begrenzt – so bleibt der
 * Scheitel beim Ziehen am Rand stehen, statt an eine andere Stelle zu springen.
 */
export const GENERAL_LIMIT = 20;

export function clampVertexForGeneral(a: number, d: number, e: number, limit = GENERAL_LIMIT): { d: number; e: number } {
  if (Math.abs(a) < 1e-12) return { d, e };
  // Höhe des Scheitels bleibt (wenn möglich) wie gewünscht: c = ad² + e liegt für d = 0 bei e.
  const ec = Math.max(-limit, Math.min(limit, e));
  // |b| = |2ad| ≤ limit und |c| = |ad² + e| ≤ limit  ⇒  d² ≤ (limit − sign(a)·e) / |a|
  const dMax = Math.min(limit / (2 * Math.abs(a)), Math.sqrt(Math.max(0, (limit - Math.sign(a) * ec) / Math.abs(a))));
  return { d: Math.max(-dMax, Math.min(dMax, d)), e: ec };
}

/** Lässt sich die Parabel mit Streckfaktor a und Scheitel S(d | e) mit den Reglern b, c darstellen? */
export function fitsGeneral(a: number, d: number, e: number, limit = GENERAL_LIMIT): boolean {
  const { b, c } = vertexToGeneral(a, d, e);
  return Math.abs(b) <= limit + 1e-9 && Math.abs(c) <= limit + 1e-9;
}
