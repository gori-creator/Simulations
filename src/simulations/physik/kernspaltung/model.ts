/**
 * Kernspaltung und Kernfusion: Bindungsenergie pro Nukleon (Tröpfchenmodell
 * nach Weizsäcker), Massendefekt, Energie bei Spaltung und Fusion,
 * Kettenreaktion mit Vermehrungsfaktor k.
 */

/** Koeffizienten des Tröpfchenmodells in MeV (übliche Lehrbuchwerte). */
const AV = 15.75;
const AS = 17.8;
const AC = 0.711;
const AA = 23.7;
const AP = 11.18;

/** Bindungsenergie in MeV nach der Weizsäcker-Formel. */
export function bindingEnergy(A: number, Z: number): number {
  const N = A - Z;
  let pair = 0;
  if (Z % 2 === 0 && N % 2 === 0) pair = AP / Math.sqrt(A);
  else if (Z % 2 === 1 && N % 2 === 1) pair = -AP / Math.sqrt(A);
  return AV * A - AS * A ** (2 / 3) - (AC * Z * (Z - 1)) / A ** (1 / 3) - (AA * (A - 2 * Z) ** 2) / A + pair;
}

/** Stabilste Protonenzahl zu A (aus der Formel, gerundet). */
export function stableZ(A: number): number {
  return Math.round(A / (2 + (AC / (2 * AA)) * A ** (2 / 3)));
}

/** Bindungsenergie pro Nukleon (MeV) für den stabilsten Kern mit A Nukleonen. */
export function bindingPerNucleon(A: number): number {
  if (A < 2) return 0;
  return bindingEnergy(A, stableZ(A)) / A;
}

/**
 * Gemessene Bindungsenergien pro Nukleon (MeV) für leichte Kerne, bei denen
 * das Tröpfchenmodell versagt.
 */
export const LIGHT: Record<number, number> = { 1: 0, 2: 1.112, 3: 2.827, 4: 7.074, 6: 5.332, 7: 5.606, 9: 6.463, 12: 7.68, 16: 7.976 };

/** Glatte Modellkurve (ohne Paarungsterm, Z kontinuierlich) für A ≥ 12. */
function smooth(A: number): number {
  const Z = A / (2 + (AC / (2 * AA)) * A ** (2 / 3));
  const B = AV * A - AS * A ** (2 / 3) - (AC * Z * (Z - 1)) / A ** (1 / 3) - (AA * (A - 2 * Z) ** 2) / A;
  return B / A;
}

/**
 * Bindungsenergie pro Nukleon zum Zeichnen: bei leichten Kernen (A < 12)
 * zwischen Messwerten interpoliert, sonst glatte Modellkurve.
 */
export function curve(A: number): number {
  if (A >= 12) return smooth(A);
  const keys = Object.keys(LIGHT)
    .map(Number)
    .sort((x, y) => x - y);
  if (A <= keys[0]!) return LIGHT[keys[0]!]!;
  for (let i = 1; i < keys.length; i++) {
    const k0 = keys[i - 1]!;
    const k1 = keys[i]!;
    if (A <= k1) {
      const f = (A - k0) / (k1 - k0);
      const end = k1 === 12 ? smooth(12) : LIGHT[k1]!;
      return LIGHT[k0]! + f * (end - LIGHT[k0]!);
    }
  }
  return smooth(A);
}

/** Energie bei der Spaltung U-235 + n → Ba-141 + Kr-92 + 3 n (aus den Bindungsenergien, MeV). */
export function fissionEnergy(): number {
  return bindingEnergy(141, 56) + bindingEnergy(92, 36) - bindingEnergy(235, 92);
}

/** Energie bei der Fusion D + T → He-4 + n aus gemessenen Bindungsenergien (MeV). */
export function fusionEnergy(): number {
  return 4 * LIGHT[4]! - 2 * LIGHT[2]! - 3 * LIGHT[3]!;
}

/** Erwartete Zahl der Neutronen nach g Generationen: N_g = N₀ · k^g. */
export function chain(N0: number, k: number, g: number): number {
  return N0 * k ** g;
}

/**
 * Vermehrungsfaktor k: Jede Spaltung setzt im Mittel ν Neutronen frei; jedes
 * davon spaltet mit Wahrscheinlichkeit p einen weiteren Kern (abhängig von
 * Anreicherung, Moderator, Steuerstäben und Entweichen).
 */
export function multiplication(nu: number, p: number): number {
  return nu * p;
}
