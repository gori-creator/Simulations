/**
 * Newton’sche Gesetze: Trägheit (Kiste auf bremsendem Wagen), Grundgleichung
 * F = m · a (Wagen mit Zuggewicht über eine Rolle, mit oder ohne Reibung) und
 * Wechselwirkung (zwei Wagen stoßen sich ab).
 */

export const G = 9.81;

/**
 * Beschleunigung eines Wagens (Masse mc), der von einem hängenden Körper (mh)
 * über eine Rolle gezogen wird; Gleitreibungszahl μ zwischen Wagen und Bahn.
 * Die Zugkraft F = mh · g beschleunigt beide Massen zusammen.
 */
export function pulleyAcceleration(mc: number, mh: number, mu: number, g = G): number {
  const drive = mh * g;
  const friction = mu * mc * g;
  if (drive <= friction) return 0;
  return (drive - friction) / (mc + mh);
}

/** Seilkraft beim Zug über die Rolle: F_S = mh · (g − a). */
export function ropeForce(mh: number, a: number, g = G): number {
  return mh * (g - a);
}

/**
 * Bremsen: Der Wagen verzögert mit `brake` (m/s², positiv). Eine lose Kiste
 * kann höchstens mit μ · g mitgebremst werden (Haft-/Gleitreibung).
 * Liefert die Verzögerung der Kiste.
 */
export function boxDeceleration(brake: number, mu: number, g = G): number {
  return Math.min(brake, mu * g);
}

/** Abstoßen: Kraft F wirkt die Zeit dt auf beide Wagen in Gegenrichtung. */
export function pushOff(m1: number, m2: number, F: number, dt: number): { v1: number; v2: number } {
  return { v1: (-F * dt) / m1, v2: (F * dt) / m2 };
}

/** Gleichmäßig beschleunigte Bewegung aus der Ruhe. */
export function motion(a: number, t: number): { s: number; v: number } {
  return { s: 0.5 * a * t * t, v: a * t };
}
