/**
 * Bändermodell der Festkörper: Aufspaltung von Atomniveaus zu Bändern,
 * Leitfähigkeit von Metall, Halbleiter und Isolator, Supraleitung.
 */

export const K_B = 8.617e-5; // Boltzmann-Konstante in eV/K
export const E_CHARGE = 1.602e-19; // C

/* ------------------------------------------------------------------ */
/* Bänder entstehen                                                    */
/* ------------------------------------------------------------------ */

export interface AtomLevel {
  /** Energie des Atomniveaus in eV. */
  E0: number;
  /** Kopplung beim Gitterabstand d = 1 (in eV). */
  beta0: number;
  /** Abklinglänge der Kopplung (relativ zum Gitterabstand). */
  range: number;
}

export const LEVELS: readonly AtomLevel[] = [
  { E0: -10, beta0: 0.9, range: 0.3 },
  { E0: -4, beta0: 1.5, range: 0.35 },
];

/** Kopplung zweier Nachbaratome im Abstand d (relativ). */
export function coupling(level: AtomLevel, d: number): number {
  return level.beta0 * Math.exp(-(d - 1) / level.range);
}

/**
 * Energien von N gekoppelten Atomen in einer Kette (Modell eng gebundener
 * Elektronen): E_k = E₀ − 2β·cos(kπ/(N+1)), k = 1 … N.
 */
export function splitLevels(level: AtomLevel, N: number, d: number): number[] {
  const b = coupling(level, d);
  const out: number[] = [];
  for (let k = 1; k <= N; k++) out.push(level.E0 - 2 * b * Math.cos((k * Math.PI) / (N + 1)));
  return out;
}

/** Bandgrenzen für sehr viele Atome: [E₀ − 2β, E₀ + 2β]. */
export function bandEdges(level: AtomLevel, d: number): [number, number] {
  const b = coupling(level, d);
  return [level.E0 - 2 * b, level.E0 + 2 * b];
}

/* ------------------------------------------------------------------ */
/* Leiter, Halbleiter, Isolator                                        */
/* ------------------------------------------------------------------ */

export interface Material {
  id: string;
  /** Bandlücke in eV (0 = Metall). */
  Eg: number;
  /** Summe der Beweglichkeiten von Elektronen und Löchern bei 300 K in m²/(V·s). */
  mu300: number;
}

export const MATERIALS: Record<string, Material> = {
  cu: { id: 'cu', Eg: 0, mu300: 0 },
  ge: { id: 'ge', Eg: 0.66, mu300: 0.57 },
  si: { id: 'si', Eg: 1.12, mu300: 0.19 },
  c: { id: 'c', Eg: 5.5, mu300: 0.36 },
};

/** Fermi-Dirac-Verteilung: Besetzungswahrscheinlichkeit eines Zustands. */
export function fermi(E: number, EF: number, T: number): number {
  if (T <= 0) return E < EF ? 1 : E > EF ? 0 : 0.5;
  return 1 / (Math.exp((E - EF) / (K_B * T)) + 1);
}

/** Eigenleitungsdichte n = N·(T/300 K)^1,5·e^(−E_g/(2kT)) in 1/cm³ (N ≈ 2,5·10¹⁹ cm⁻³). */
export function intrinsicDensity(Eg: number, T: number): number {
  return 2.5e19 * Math.pow(T / 300, 1.5) * Math.exp(-Eg / (2 * K_B * T));
}

/** Leitfähigkeit von Kupfer: σ ∝ 1/T (oberhalb etwa 50 K), σ(300 K) = 6·10⁷ S/m. */
export function metalConductivity(T: number): number {
  return 6e7 * (300 / Math.max(T, 1));
}

/** Leitfähigkeit eines reinen Halbleiters σ = n·e·(μₙ + μₚ), Beweglichkeit ∝ T^−1,5. */
export function semiconductorConductivity(m: Material, T: number): number {
  const n = intrinsicDensity(m.Eg, T) * 1e6; // in 1/m³
  const mu = m.mu300 * Math.pow(T / 300, -1.5);
  return n * E_CHARGE * mu;
}

export function conductivity(m: Material, T: number): number {
  return m.Eg === 0 ? metalConductivity(T) : semiconductorConductivity(m, T);
}

/* ------------------------------------------------------------------ */
/* Supraleitung                                                        */
/* ------------------------------------------------------------------ */

export const SUPER: Record<string, { Tc: number }> = {
  hg: { Tc: 4.15 },
  pb: { Tc: 7.2 },
  nb: { Tc: 9.25 },
};

/** Widerstand relativ zum Wert bei 20 K: unter T_c genau null, darüber Restwiderstand plus leichter Anstieg. */
export function resistance(T: number, Tc: number): number {
  if (T < Tc) return 0;
  return 0.6 + 0.4 * Math.pow(T / 20, 3);
}
