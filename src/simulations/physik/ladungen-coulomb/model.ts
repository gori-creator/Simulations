/**
 * Elektrische Ladungen: Reibungselektrizität, Elektroskop und das
 * Coulomb’sche Gesetz F = k · Q₁ · Q₂ / r².
 */

/** Coulomb-Konstante k = 1/(4π ε₀) in N m²/C² */
export const K = 8.9875517923e9;
export const E_CHARGE = 1.602176634e-19;

/** Coulombkraft in N (positiv: Abstoßung, negativ: Anziehung). */
export function coulomb(q1: number, q2: number, r: number): number {
  return (K * q1 * q2) / (r * r);
}

/**
 * Reibungselektrizität (vereinfacht): Beim Reiben gehen Elektronen vom Stoff
 * mit der kleineren „Elektronenaffinität“ auf den anderen über. Reihenfolge
 * nach der triboelektrischen Reihe (von „gibt leicht Elektronen ab“ zu
 * „nimmt leicht Elektronen auf“).
 */
export const TRIBO = ['hair', 'glass', 'wool', 'silk', 'paper', 'wood', 'amber', 'rubber', 'pvc'] as const;
export type Material = (typeof TRIBO)[number];

/** Ladung nach dem Reiben (in Elementarladungen, Vorzeichen) für Stoff a gegen Stoff b. */
export function rubCharge(a: Material, b: Material, electrons: number): { a: number; b: number } {
  const ia = TRIBO.indexOf(a);
  const ib = TRIBO.indexOf(b);
  if (ia === ib) return { a: 0, b: 0 };
  // Wer weiter links steht, gibt Elektronen ab und wird positiv
  const n = electrons;
  return ia < ib ? { a: n, b: -n } : { a: -n, b: n };
}

/** Ausschlag eines Elektroskops (Winkel in rad) – vereinfacht ∝ √|Q|, begrenzt auf 60°. */
export function electroscopeAngle(q: number, qMax: number): number {
  return Math.min(Math.PI / 3, (Math.PI / 3) * Math.sqrt(Math.abs(q) / qMax));
}
