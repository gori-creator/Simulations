/**
 * Rechenlogik der Simulation „Lineare Funktion“ (ohne Zeichnen, gut testbar).
 *
 * Bezeichnungen wie in Bayern: f(x) = m·x + t (t = y-Achsenabschnitt). Der
 * Parameter-Schlüssel in geteilten Links heißt aus Kompatibilitätsgründen weiter `b`.
 */
export type LineRelation =
  | { kind: 'identical' }
  | { kind: 'parallel' }
  | { kind: 'intersect'; x: number; y: number; perpendicular: boolean };

/** Lage zweier Geraden y = m₁x + t₁ und y = m₂x + t₂. */
export function lineRelation(m1: number, t1: number, m2: number, t2: number, eps = 1e-9): LineRelation {
  if (Math.abs(m1 - m2) < eps) return Math.abs(t1 - t2) < eps ? { kind: 'identical' } : { kind: 'parallel' };
  const x = (t2 - t1) / (m1 - m2);
  return { kind: 'intersect', x, y: m1 * x + t1, perpendicular: Math.abs(m1 * m2 + 1) < 1e-6 };
}

/**
 * Nullstelle von f(x) = m·x + t: x₀ = −t : m.
 * Bei m = 0 gibt es keine (`null`) oder – für t = 0 – jede Stelle ist Nullstelle (`'all'`).
 */
export function zeroOf(m: number, t: number): number | null | 'all' {
  if (m === 0) return t === 0 ? 'all' : null;
  const x0 = -t / m;
  return x0 === 0 ? 0 : x0; // −0 vermeiden
}

/** true, wenn `value` beim Runden auf `decimals` Nachkommastellen verändert wird (Anzeige dann mit „≈“). */
export function isRounded(value: number, decimals: number): boolean {
  const f = 10 ** decimals;
  return Math.abs(Math.round(value * f) / f - value) > 1e-9;
}

/** Steigungswinkel α in Grad (−90° < α < 90°) mit tan α = m. */
export function slopeAngleDeg(m: number): number {
  return (Math.atan(m) * 180) / Math.PI;
}

/**
 * Gerade durch zwei Punkte: m = Δy : Δx, t = y₁ − m·x₁.
 * Bei x₁ = x₂ ist die Gerade senkrecht und keine Funktion → `null`.
 */
export function lineThrough(x1: number, y1: number, x2: number, y2: number): { m: number; t: number } | null {
  if (x1 === x2) return null;
  const m = (y2 - y1) / (x2 - x1);
  return { m, t: y1 - m * x1 };
}
