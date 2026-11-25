/**
 * Spezielle Relativitätstheorie: Lorentz-Transformation, Minkowski-Diagramm
 * und relativistische Addition von Geschwindigkeiten (Einheiten mit c = 1).
 */

export function gamma(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** Lorentz-Transformation eines Ereignisses (x, ct) ins System, das sich mit β bewegt. */
export function lorentz(x: number, ct: number, beta: number): { x: number; ct: number } {
  const g = gamma(beta);
  return { x: g * (x - beta * ct), ct: g * (ct - beta * x) };
}

/** Raumzeit-Intervall s² = (ct)² − x² (in allen Systemen gleich). */
export function interval(x: number, ct: number): number {
  return ct * ct - x * x;
}

/** Relativistische Geschwindigkeitsaddition (in Einheiten von c). */
export function addVelocities(u: number, v: number): number {
  return (u + v) / (1 + u * v);
}
