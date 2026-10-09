/**
 * Rechenlogik „Kreisbewegung und Zentripetalkraft“.
 *
 * Gleichförmige Kreisbewegung mit Radius r und Umlaufdauer T:
 *   v = 2π·r/T,  ω = 2π/T = v/r,  f = 1/T,
 *   a_Z = v²/r = ω²·r,  F_Z = m·a_Z = m·v²/r.
 *
 * Kurvenfahrt: Die Zentripetalkraft muss von der Haftreibung zwischen Reifen
 * und Straße aufgebracht werden. Höchstens F_H,max = μ_H·m·g, also
 *   v_max = √(μ_H·g·r).
 */

/** Fallbeschleunigung in m/s². */
export const G = 9.81;

export type RoadId = 'dry' | 'wet' | 'snow' | 'ice';

/** Typische Haftreibungszahlen Reifen–Fahrbahn (Richtwerte). */
export const ROADS: Record<RoadId, number> = { dry: 0.8, wet: 0.5, snow: 0.2, ice: 0.1 };

/** Bahngeschwindigkeit v = 2π·r/T in m/s. */
export function speed(r: number, T: number): number {
  return (2 * Math.PI * r) / T;
}

/** Umlaufdauer T = 2π·r/v in s. */
export function period(r: number, v: number): number {
  return (2 * Math.PI * r) / v;
}

/** Winkelgeschwindigkeit ω = v/r in 1/s. */
export function angularVelocity(r: number, v: number): number {
  return v / r;
}

/** Zentripetalbeschleunigung a_Z = v²/r in m/s². */
export function centripetalAcceleration(r: number, v: number): number {
  return (v * v) / r;
}

/** Zentripetalkraft F_Z = m·v²/r in N. */
export function centripetalForce(m: number, r: number, v: number): number {
  return (m * v * v) / r;
}

/** Größte Haftreibungskraft F_H,max = μ·m·g in N. */
export function maxFriction(mu: number, m: number, g = G): number {
  return mu * m * g;
}

/** Höchstgeschwindigkeit in der Kurve v_max = √(μ·g·r) in m/s (unabhängig von der Masse). */
export function maxCornerSpeed(mu: number, r: number, g = G): number {
  return Math.sqrt(mu * g * r);
}

/** Kleinster Kurvenradius bei Geschwindigkeit v: r_min = v²/(μ·g). */
export function minRadius(mu: number, v: number, g = G): number {
  return (v * v) / (mu * g);
}

/** Geschwindigkeit, bei der die Schnur mit der Reißkraft F_max reißt: v = √(F_max·r/m). */
export function breakingSpeed(fMax: number, m: number, r: number): number {
  return Math.sqrt((fMax * r) / m);
}

/** Umlaufdauer, unterhalb der die Schnur reißt: T = 2π·√(m·r/F_max). */
export function breakingPeriod(fMax: number, m: number, r: number): number {
  return 2 * Math.PI * Math.sqrt((m * r) / fMax);
}

export type Vec = [number, number];

/** Ort auf dem Kreis (Mittelpunkt im Ursprung) beim Winkel φ. */
export function onCircle(r: number, phi: number): Vec {
  return [r * Math.cos(phi), r * Math.sin(phi)];
}

/** Geschwindigkeit auf dem Kreis (gegen den Uhrzeigersinn) beim Winkel φ. */
export function tangentVelocity(v: number, phi: number): Vec {
  return [-v * Math.sin(phi), v * Math.cos(phi)];
}

/**
 * Nach dem Loslassen (Schnur reißt) bewegt sich der Körper ohne Kraft
 * geradlinig gleichförmig weiter – entlang der Tangente.
 */
export function freeFlight(start: Vec, velocity: Vec, dt: number): Vec {
  return [start[0] + velocity[0] * dt, start[1] + velocity[1] * dt];
}

/**
 * Rutschendes Auto: Die Haftreibung liefert höchstens μ·m·g. Bei konstanter
 * Geschwindigkeit v reicht das nur für einen Kreis mit dem größeren Radius
 * r' = v²/(μ·g), der die Fahrbahn im Startpunkt berührt. Liefert den Ort
 * nach der Zeit t (Start beim Winkel φ₀ auf dem Kreis mit Radius r, Fahrt
 * gegen den Uhrzeigersinn).
 */
export function slidePosition(r: number, phi0: number, v: number, mu: number, t: number, g = G): Vec {
  const rs = minRadius(mu, v, g);
  const n: Vec = [Math.cos(phi0), Math.sin(phi0)];
  // Mittelpunkt des größeren Kreises liegt auf der Verbindung Startpunkt–Kurvenmittelpunkt
  const c: Vec = [r * n[0] - rs * n[0], r * n[1] - rs * n[1]];
  const phi = phi0 + (v * t) / rs;
  return [c[0] + rs * Math.cos(phi), c[1] + rs * Math.sin(phi)];
}
