/**
 * Wärmeausdehnung fester, flüssiger und gasförmiger Stoffe sowie die
 * Dichteanomalie des Wassers.
 */

export type SolidId = 'aluminium' | 'copper' | 'steel' | 'glass' | 'invar' | 'concrete';

/** Linearer Ausdehnungskoeffizient α in 1/K (gerundete Tabellenwerte). */
export const ALPHA: Record<SolidId, number> = {
  aluminium: 23e-6,
  copper: 17e-6,
  steel: 12e-6,
  concrete: 12e-6,
  glass: 9e-6,
  invar: 1.2e-6,
};

/** Längenänderung ΔL = α · L₀ · ΔT. */
export function lengthChange(alpha: number, L0: number, dT: number): number {
  return alpha * L0 * dT;
}

/** Volumenausdehnung (näherungsweise γ = 3α bei festen Stoffen). */
export function volumeChange(gamma: number, V0: number, dT: number): number {
  return gamma * V0 * dT;
}

/** Volumenausdehnungskoeffizienten in 1/K (bei etwa 20 °C). */
export const GAMMA_LIQ = { water: 0.21e-3, ethanol: 1.1e-3, mercury: 0.18e-3, oil: 0.7e-3 };

/** Gase bei konstantem Druck: V = V₀ · T / T₀ (Gay-Lussac), etwa 1/273 pro Kelvin. */
export function gasVolume(V0: number, t0C: number, tC: number): number {
  return (V0 * (tC + 273.15)) / (t0C + 273.15);
}

/**
 * Dichte von Wasser in kg/m³ zwischen 0 °C und 100 °C (Näherungsformel nach
 * Tanaka et al. 2001, Atmosphärendruck); für Eis bei 0 °C gilt 916,7 kg/m³.
 */
export function waterDensity(tC: number): number {
  const a1 = -3.983035;
  const a2 = 301.797;
  const a3 = 522528.9;
  const a4 = 69.34881;
  const a5 = 999.97495;
  return a5 * (1 - ((tC + a1) ** 2 * (tC + a2)) / (a3 * (tC + a4)));
}

export const ICE_DENSITY = 916.7;
