/**
 * Geladene Teilchen in Feldern: Beschleunigung im Längsfeld, Ablenkung im
 * Querfeld, Millikan-Versuch, Zyklotron und Hall-Effekt.
 */

export const E = 1.602176634e-19;
export const ME = 9.1093837e-31;
export const MP = 1.67262192e-27;
export const G = 9.81;

/** Geschwindigkeit nach Durchlaufen der Spannung U aus der Ruhe: ½ m v² = q U. */
export function speedAfter(U: number, q = E, m = ME): number {
  return Math.sqrt((2 * q * U) / m);
}

/**
 * Ablenkung im Plattenkondensator (Länge l, Abstand d, Spannung Ud) für ein
 * Teilchen mit v₀: y(x) = q Ud x² / (2 m d v₀²). Liefert y am Ende und den
 * Austrittswinkel.
 */
export function deflection(Ud: number, d: number, l: number, v0: number, q = E, m = ME): { yEnd: number; angle: number; k: number } {
  const k = (q * Ud) / (2 * m * d * v0 * v0);
  return { k, yEnd: k * l * l, angle: Math.atan(2 * k * l) };
}

/** Öltröpfchen (Radius r, Dichte ρ) schwebt bei U: q · U / d = m · g. Liefert die Ladung. */
export function millikanCharge(r: number, rho: number, U: number, d: number, g = G): number {
  const m = (4 / 3) * Math.PI * r ** 3 * rho;
  return (m * g * d) / U;
}

/** Schwebespannung für ein Tröpfchen mit n Elementarladungen. */
export function floatVoltage(r: number, rho: number, n: number, d: number, g = G): number {
  const m = (4 / 3) * Math.PI * r ** 3 * rho;
  return (m * g * d) / (n * E);
}

/** Zyklotron: Bahnradius r = m v / (q B), Umlauffrequenz f = q B / (2π m) – unabhängig von v. */
export function cyclotron(B: number, v: number, q = E, m = MP): { r: number; f: number } {
  return { r: (m * v) / (q * B), f: (q * B) / (2 * Math.PI * m) };
}

/** Hall-Spannung U_H = B · I / (n · e · d) (d: Dicke des Plättchens in Feldrichtung). */
export function hallVoltage(B: number, I: number, n: number, d: number, q = E): number {
  return (B * I) / (n * q * d);
}
