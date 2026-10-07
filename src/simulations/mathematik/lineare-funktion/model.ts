/**
 * Rechenlogik der Simulation „Lineare Funktion“ (ohne Zeichnen, gut testbar).
 */
export type LineRelation =
  | { kind: 'identical' }
  | { kind: 'parallel' }
  | { kind: 'intersect'; x: number; y: number; perpendicular: boolean };

/** Lage zweier Geraden y = m₁x + b₁ und y = m₂x + b₂. */
export function lineRelation(m1: number, b1: number, m2: number, b2: number, eps = 1e-9): LineRelation {
  if (Math.abs(m1 - m2) < eps) return Math.abs(b1 - b2) < eps ? { kind: 'identical' } : { kind: 'parallel' };
  const x = (b2 - b1) / (m1 - m2);
  return { kind: 'intersect', x, y: m1 * x + b1, perpendicular: Math.abs(m1 * m2 + 1) < 1e-6 };
}
