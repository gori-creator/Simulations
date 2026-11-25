/**
 * Wirkungen des elektrischen Stroms (Wärme, Licht, Magnetismus, Chemie),
 * Schmelzsicherung und Gefahren für den Menschen.
 */

export type Device = 'lampe' | 'heiz' | 'spule' | 'wasser';

/** Widerstände der Geräte in Ohm (vereinfachte Schulwerte). */
export const R_DEVICE: Record<Device, number> = {
  lampe: 12,
  heiz: 4,
  spule: 6,
  wasser: 20,
};

/** Widerstand der Zuleitungen bei Kurzschluss (Ω). */
export const R_SHORT = 0.1;
/** Innenwiderstand der Quelle (Ω). */
export const R_INNER = 0.3;

/** Stromstärke im Kreis in A. */
export function current(U: number, device: Device, short: boolean): number {
  const R = short ? R_SHORT : R_DEVICE[device];
  return U / (R + R_INNER);
}

/** Leistung im Gerät in W (bei Kurzschluss 0: der Strom fließt am Gerät vorbei). */
export function power(U: number, device: Device, short: boolean): number {
  if (short) return 0;
  const I = current(U, device, false);
  return I * I * R_DEVICE[device];
}

/** Brennt die Schmelzsicherung durch? */
export function fuseBlows(I: number, rating: number): boolean {
  return I > rating;
}

/* ------------------------------------------------------------------ */
/* Gefahr für den Menschen                                             */
/* ------------------------------------------------------------------ */

/** Körperwiderstand Hand–Fuß in Ω: trockene Haut etwa 3000 Ω, nasse etwa 1000 Ω. */
export function bodyResistance(wet: boolean): number {
  return wet ? 1000 : 3000;
}

/** Körperstrom in mA. */
export function bodyCurrent(U: number, wet: boolean): number {
  return (U / bodyResistance(wet)) * 1000;
}

export type Danger = 'none' | 'tingle' | 'cramp' | 'deadly';

/** Grobe Einteilung der Wirkung von Wechselstrom auf den Körper (Richtwerte). */
export function danger(mA: number): Danger {
  if (mA < 1) return 'none';
  if (mA < 10) return 'tingle';
  if (mA < 50) return 'cramp';
  return 'deadly';
}

/** FI-Schutzschalter: löst bei Fehlerstrom ab 30 mA aus. */
export const RCD_LIMIT = 30;
