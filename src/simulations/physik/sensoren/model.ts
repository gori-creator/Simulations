/**
 * Sensoren im Spannungsteiler: Heißleiter (NTC) und Fotowiderstand (LDR)
 * wandeln Temperatur oder Helligkeit in eine Spannung um.
 */

/** NTC: R(T) = R₂₅·e^(B·(1/T − 1/T₂₅)), R₂₅ = 10 kΩ, B = 3950 K. Ergebnis in kΩ. */
export function ntcResistance(tempC: number): number {
  const T = tempC + 273.15;
  return 10 * Math.exp(3950 * (1 / T - 1 / 298.15));
}

/** LDR: R ≈ 10 kΩ·(E / 10 lx)^(−0,7). Ergebnis in kΩ. */
export function ldrResistance(lux: number): number {
  return 10 * Math.pow(Math.max(lux, 0.01) / 10, -0.7);
}

/** Spannungsteiler: Sensor oben, Festwiderstand unten; gemessen wird am Festwiderstand. */
export function dividerOutput(U: number, rSensor: number, rFixed: number): number {
  return (U * rFixed) / (rSensor + rFixed);
}
