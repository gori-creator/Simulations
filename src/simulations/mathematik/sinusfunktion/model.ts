/**
 * Rechenlogik der Simulation „Allgemeine Sinusfunktion“:
 * f(x) = a · sin(b(x − c)) + d   bzw.   a · cos(b(x − c)) + d
 */
export type Base = 'sin' | 'cos';

export interface SineParams {
  base: Base;
  a: number;
  b: number;
  c: number;
  d: number;
}

export function evaluate({ base, a, b, c, d }: SineParams, x: number): number {
  const arg = b * (x - c);
  return a * (base === 'sin' ? Math.sin(arg) : Math.cos(arg)) + d;
}

/** Periode p = 2π / b. */
export function period(b: number): number {
  return (2 * Math.PI) / b;
}

/** Wertebereich [d − |a|, d + |a|]. */
export function range({ a, d }: Pick<SineParams, 'a' | 'd'>): [number, number] {
  return [d - Math.abs(a), d + Math.abs(a)];
}

/** x-Wert des ersten Hochpunkts ab der Verschiebung c (für a > 0). */
export function firstPeakOffset(base: Base, b: number): number {
  return base === 'sin' ? period(b) / 4 : 0;
}

/** Eine Verschiebung in Vielfachen von π/12 (für die π-Achse). */
export const PI_TWELFTH = Math.PI / 12;
