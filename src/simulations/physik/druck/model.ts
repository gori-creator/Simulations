/**
 * Druck: Auflagedruck p = F / A, hydraulische Presse, Schweredruck in
 * Flüssigkeiten und Luftdruck (barometrische Höhenformel, Land-See-Wind).
 */

export const G = 9.81;
/** Luftdruck auf Meereshöhe in hPa */
export const P0 = 1013.25;

/** Druck in Pa aus Kraft (N) und Fläche (m²). */
export function pressure(F: number, A: number): number {
  return F / A;
}

/** Hydraulische Presse: gleicher Druck überall, F₂ = F₁ · A₂ / A₁; der große Kolben bewegt sich um s₂ = s₁ · A₁ / A₂. */
export function hydraulic(F1: number, A1: number, A2: number, s1: number): { p: number; F2: number; s2: number } {
  const p = F1 / A1;
  return { p, F2: p * A2, s2: (s1 * A1) / A2 };
}

/** Schweredruck p = ρ · g · h in Pa (h in m). */
export function hydrostatic(rho: number, h: number, g = G): number {
  return rho * g * h;
}

/** Barometrische Höhenformel (isotherm, Skalenhöhe ≈ 8,4 km): Druck in hPa in der Höhe h (m). */
export function airPressure(h: number, p0 = P0, scale = 8400): number {
  return p0 * Math.exp(-h / scale);
}

/**
 * Land-See-Wind (stark vereinfacht): Die wärmere Fläche erwärmt die Luft
 * darüber, dort entsteht am Boden tiefer Druck. Liefert, wo der Bodenwind
 * hinweht: 'land' (Seewind, tagsüber) oder 'sea' (Landwind, nachts).
 */
export function breeze(tLand: number, tSea: number): 'land' | 'sea' | 'none' {
  if (Math.abs(tLand - tSea) < 0.5) return 'none';
  return tLand > tSea ? 'land' : 'sea';
}
