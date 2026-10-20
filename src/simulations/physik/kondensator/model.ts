/**
 * Rechenlogik „Lade- und Entladekurve des Kondensators“ (ohne Zeichnen).
 *
 * RC-Kreis: Ein Kondensator C wird über einen Widerstand R an die Spannung U₀
 * gelegt (Laden) oder über R kurzgeschlossen (Entladen). Mit der Zeitkonstante
 * τ = R · C nähert sich die Kondensatorspannung exponentiell ihrem Endwert:
 *
 *   Laden:     U_C(t) = U₀ · (1 − e^(−t/τ)),   I(t) =  (U₀ / R) · e^(−t/τ)
 *   Entladen:  U_C(t) = U₀ · e^(−t/τ),         I(t) = −(U₀ / R) · e^(−t/τ)
 *
 * Allgemein (Umschalten mitten im Vorgang): Startwert U_a, Endwert U_e
 *
 *   U_C(t) = U_e + (U_a − U_e) · e^(−t/τ),   I(t) = (U_e − U_a) / R · e^(−t/τ).
 *
 * Die Tangente bei t = 0 erreicht den Endwert genau bei t = τ. Halbwertszeit
 * t½ = τ · ln 2. Gespeicherte Energie W = ½ · C · U², Ladung Q = C · U.
 *
 * Einheiten: SI (Ω, F, V, A, s, J, C).
 */

/** Zeitkonstante τ = R · C in s. */
export function timeConstant(R: number, C: number): number {
  return R * C;
}

/** Halbwertszeit t½ = τ · ln 2. */
export function halfLife(tau: number): number {
  return tau * Math.LN2;
}

/** Kondensatorspannung beim Übergang von U_a nach U_e. */
export function voltageAt(Ua: number, Ue: number, t: number, tau: number): number {
  if (tau <= 0) return Ue;
  return Ue + (Ua - Ue) * Math.exp(-Math.max(0, t) / tau);
}

/** Stromstärke im Kreis (positiv: Laden in Richtung der Quelle). */
export function currentAt(Ua: number, Ue: number, t: number, R: number, C: number): number {
  const tau = timeConstant(R, C);
  if (R <= 0 || tau <= 0) return 0;
  return ((Ue - Ua) / R) * Math.exp(-Math.max(0, t) / tau);
}

/** Laden aus dem leeren Zustand. */
export function chargingVoltage(U0: number, t: number, tau: number): number {
  return voltageAt(0, U0, t, tau);
}

/** Entladen aus dem vollen Zustand. */
export function dischargingVoltage(U0: number, t: number, tau: number): number {
  return voltageAt(U0, 0, t, tau);
}

/** Gespeicherte Energie W = ½ · C · U². */
export function energy(C: number, U: number): number {
  return 0.5 * C * U * U;
}

/** Ladung Q = C · U. */
export function charge(C: number, U: number): number {
  return C * U;
}

/** Zeit, nach der beim Laden ein Bruchteil `frac` von U₀ erreicht ist: t = −τ · ln(1 − frac). */
export function timeToFraction(frac: number, tau: number): number {
  return -tau * Math.log(1 - clamp01(frac));
}

function clamp01(v: number): number {
  return Math.min(1 - 1e-12, Math.max(0, v));
}
