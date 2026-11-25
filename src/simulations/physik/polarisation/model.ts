/**
 * Wellenoptik: Polarisationsfilter (Gesetz von Malus) und Brechung im
 * Wellenmodell (Huygens-Prinzip, Brechungsgesetz, Totalreflexion).
 */

const DEG = Math.PI / 180;

/** Gesetz von Malus: Anteil, der ein Filter passiert, wenn das Licht um Δθ (in °) gedreht dazu schwingt. */
export function malus(deltaDeg: number): number {
  const c = Math.cos(deltaDeg * DEG);
  return c * c;
}

/**
 * Intensität hinter einer Kette von Polarisationsfiltern (Winkel in °),
 * bezogen auf unpolarisiertes Licht: Das erste Filter lässt die Hälfte durch,
 * jedes weitere den Anteil cos²(θᵢ − θᵢ₋₁).
 */
export function chain(angles: readonly number[]): number {
  if (angles.length === 0) return 1;
  let I = 0.5;
  for (let i = 1; i < angles.length; i++) I *= malus(angles[i]! - angles[i - 1]!);
  return I;
}

/** Brechungswinkel in ° für Einfallswinkel α (in °) und n = c₁/c₂; `null` bei Totalreflexion. */
export function refractionAngle(alphaDeg: number, n: number): number | null {
  const s = Math.sin(alphaDeg * DEG) / n;
  if (s > 1) return null;
  return Math.asin(s) / DEG;
}

/** Grenzwinkel der Totalreflexion in ° (nur für n = c₁/c₂ < 1, sonst `null`). */
export function criticalAngle(n: number): number | null {
  return n < 1 ? Math.asin(n) / DEG : null;
}

/** Wellenlänge im zweiten Stoff, bezogen auf λ₁: λ₂/λ₁ = c₂/c₁ = 1/n. */
export function wavelengthRatio(n: number): number {
  return 1 / n;
}
