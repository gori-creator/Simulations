/**
 * Wärmetransport: Wärmeleitung in einem Stab, Wärmeströmung (Konvektion),
 * Wärmestrahlung (Stefan-Boltzmann) und Wärmedämmung einer Hauswand (U-Wert).
 */

export type MaterialId = 'copper' | 'aluminium' | 'iron' | 'glass' | 'brick' | 'wood' | 'polystyrene' | 'air';

/** Wärmeleitfähigkeit λ in W/(m·K), Dichte ρ in kg/m³, spezifische Wärmekapazität c in J/(kg·K) (gerundete Tabellenwerte). */
export const MATERIALS: Record<MaterialId, { lambda: number; rho: number; c: number }> = {
  copper: { lambda: 390, rho: 8900, c: 385 },
  aluminium: { lambda: 220, rho: 2700, c: 900 },
  iron: { lambda: 60, rho: 7900, c: 450 },
  glass: { lambda: 1, rho: 2500, c: 800 },
  brick: { lambda: 0.8, rho: 1800, c: 840 },
  wood: { lambda: 0.13, rho: 600, c: 1600 },
  polystyrene: { lambda: 0.035, rho: 20, c: 1400 },
  air: { lambda: 0.025, rho: 1.2, c: 1005 },
};

/** Temperaturleitfähigkeit a = λ / (ρ c) in m²/s. */
export function diffusivity(m: MaterialId): number {
  const x = MATERIALS[m];
  return x.lambda / (x.rho * x.c);
}

/** Wärmestrom durch eine Schicht im Gleichgewicht: P = λ · A · ΔT / d (W). */
export function conductionPower(lambda: number, area: number, dT: number, d: number): number {
  return (lambda * area * dT) / d;
}

/**
 * Ein Zeitschritt der Wärmeleitungsgleichung ∂T/∂t = a ∂²T/∂x² (explizit, Enden fest).
 * `T` wird überschrieben. Für Stabilität wird intern in Teilschritte zerlegt.
 */
export function conductionStep(T: number[], a: number, dx: number, dt: number): void {
  const n = T.length;
  const maxDt = (0.45 * dx * dx) / a;
  const steps = Math.max(1, Math.ceil(dt / maxDt));
  const h = dt / steps;
  const k = (a * h) / (dx * dx);
  const next = T.slice();
  for (let s = 0; s < steps; s++) {
    for (let i = 1; i < n - 1; i++) next[i] = T[i]! + k * (T[i - 1]! - 2 * T[i]! + T[i + 1]!);
    for (let i = 1; i < n - 1; i++) T[i] = next[i]!;
  }
}

export const SIGMA = 5.670_374e-8;

/** Abgestrahlte Leistung P = ε σ A T⁴ (T in K). */
export function radiatedPower(emissivity: number, area: number, tempK: number): number {
  return emissivity * SIGMA * area * tempK ** 4;
}

/** Netto-Strahlungsleistung zwischen Körper (T) und Umgebung (Tu): ε σ A (T⁴ − Tu⁴). */
export function netRadiation(emissivity: number, area: number, tempK: number, envK: number): number {
  return emissivity * SIGMA * area * (tempK ** 4 - envK ** 4);
}

/** Wärmeübergangswiderstände innen/außen in m²K/W (Bauphysik, Richtwerte). */
export const R_SI = 0.13;
export const R_SE = 0.04;

export interface Layer {
  lambda: number;
  /** Dicke in m */
  d: number;
}

/** U-Wert einer Wand aus Schichten: U = 1 / (R_si + Σ d/λ + R_se) in W/(m²·K). */
export function uValue(layers: readonly Layer[]): number {
  const r = R_SI + R_SE + layers.reduce((s, l) => s + (l.d > 0 ? l.d / l.lambda : 0), 0);
  return 1 / r;
}

/** Temperaturen an den Schichtgrenzen von innen nach außen (Gleichgewicht). */
export function wallTemperatures(layers: readonly Layer[], tIn: number, tOut: number): number[] {
  const u = uValue(layers);
  const q = u * (tIn - tOut);
  const out = [tIn - q * R_SI];
  for (const l of layers) out.push(out[out.length - 1]! - (l.d > 0 ? (q * l.d) / l.lambda : 0));
  return out;
}
