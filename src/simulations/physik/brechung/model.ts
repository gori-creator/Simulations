/** Rechenlogik „Brechung und Totalreflexion“ (Brechungsgesetz von Snellius, Fresnel-Formeln). */

export const MEDIA = {
  luft: 1.0,
  wasser: 1.33,
  plexiglas: 1.49,
  glas: 1.52,
  diamant: 2.42,
} as const;
export type MediumId = keyof typeof MEDIA;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Brechungswinkel in Grad oder `null` bei Totalreflexion. */
export function refractionAngle(n1: number, n2: number, alphaDeg: number): number | null {
  const s = (n1 / n2) * Math.sin(toRad(alphaDeg));
  if (Math.abs(s) > 1) return null;
  return toDeg(Math.asin(s));
}

/** Grenzwinkel der Totalreflexion in Grad (nur beim Übergang ins optisch dünnere Medium). */
export function criticalAngle(n1: number, n2: number): number | null {
  return n1 > n2 ? toDeg(Math.asin(n2 / n1)) : null;
}

/** Reflektierter Anteil für unpolarisiertes Licht (Mittel aus s- und p-Polarisation). */
export function reflectance(n1: number, n2: number, alphaDeg: number): number {
  const beta = refractionAngle(n1, n2, alphaDeg);
  if (beta === null) return 1;
  const a = toRad(alphaDeg);
  const b = toRad(beta);
  const ca = Math.cos(a);
  const cb = Math.cos(b);
  const rs = ((n1 * ca - n2 * cb) / (n1 * ca + n2 * cb)) ** 2;
  const rp = ((n1 * cb - n2 * ca) / (n1 * cb + n2 * ca)) ** 2;
  return Math.min(1, (rs + rp) / 2);
}

/** Lichtgeschwindigkeit im Medium in km/s. */
export function lightSpeed(n: number): number {
  return 299_792 / n;
}
