/**
 * Laser als Ratenmodell: Pumpen, Lebensdauer des oberen Laserniveaus,
 * stimulierte Emission und Verluste im Resonator (Drei- und Vierniveau-Laser).
 * Zeiten in Einheiten der Lebensdauer τ des oberen Laserniveaus.
 */

export type Levels = 3 | 4;

export interface LaserState {
  /** Anteil der Atome im oberen Laserniveau. */
  N2: number;
  /** Photonenzahl im Resonator (relativ). */
  n: number;
}

/** Kopplung für stimulierte Emission (relativ). */
export const B = 50;
/** Anteil spontaner Emission, der in die Laserrichtung geht (Startsignal). */
export const BETA = 1e-3;

/** Lebensdauer eines Photons im Resonator: τ_c = 0,02 / (1 − R). */
export function cavityLifetime(R: number): number {
  return 0.02 / Math.max(1e-4, 1 - R);
}

/** Unteres Laserniveau: beim Dreiniveau-Laser der Grundzustand, beim Vierniveau-Laser praktisch leer. */
export function lowerLevel(N2: number, levels: Levels): number {
  return levels === 3 ? 1 - N2 : 0;
}

/** Besetzungsinversion N₂ − N₁. */
export function inversion(N2: number, levels: Levels): number {
  return N2 - lowerLevel(N2, levels);
}

/** Inversion an der Laserschwelle: Verstärkung gleich Verlust. */
export function thresholdInversion(R: number): number {
  return 1 / (B * cavityLifetime(R));
}

/** Pumprate an der Laserschwelle. */
export function thresholdPump(R: number, levels: Levels): number {
  const dN = thresholdInversion(R);
  const N2 = levels === 3 ? (1 + dN) / 2 : dN;
  return N2 / (1 - N2);
}

function deriv(s: LaserState, W: number, R: number, levels: Levels): LaserState {
  const tc = cavityLifetime(R);
  const ground = 1 - s.N2; // aus diesem Niveau wird gepumpt
  const dN = inversion(s.N2, levels);
  const stim = B * s.n * dN;
  return {
    N2: W * ground - s.N2 - stim,
    n: stim - s.n / tc + BETA * s.N2,
  };
}

/** Ein Runge-Kutta-Schritt. */
export function step(s: LaserState, W: number, R: number, levels: Levels, h: number): LaserState {
  const add = (a: LaserState, b: LaserState, k: number): LaserState => ({ N2: a.N2 + k * b.N2, n: Math.max(0, a.n + k * b.n) });
  const k1 = deriv(s, W, R, levels);
  const k2 = deriv(add(s, k1, h / 2), W, R, levels);
  const k3 = deriv(add(s, k2, h / 2), W, R, levels);
  const k4 = deriv(add(s, k3, h), W, R, levels);
  return {
    N2: Math.min(1, Math.max(0, s.N2 + (h / 6) * (k1.N2 + 2 * k2.N2 + 2 * k3.N2 + k4.N2))),
    n: Math.max(0, s.n + (h / 6) * (k1.n + 2 * k2.n + 2 * k3.n + k4.n)),
  };
}

/** Ausgangsleistung (relativ): Photonen, die den teildurchlässigen Spiegel verlassen. */
export function outputPower(n: number, R: number): number {
  return (n * (1 - R)) / 0.02;
}
