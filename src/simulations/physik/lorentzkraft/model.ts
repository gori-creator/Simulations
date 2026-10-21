/**
 * Rechenlogik „Lorentzkraft und Fadenstrahlrohr“ (ohne Zeichnen).
 *
 * Helmholtzspulen (Windungszahl n, Radius R, Abstand R) erzeugen in der Mitte
 * ein nahezu homogenes Feld
 *
 *   B = (4/5)^(3/2) · μ₀ · n · I / R.
 *
 * Elektronen, die mit der Spannung U beschleunigt wurden, haben die
 * Geschwindigkeit v = √(2 e U / m). Senkrecht zum Feld wirkt die Lorentzkraft
 * F = e · v · B als Zentripetalkraft: e v B = m v² / r, also
 *
 *   r = m v / (e B) = √(2 U m / e) / B   und   e/m = 2 U / (B² r²).
 *
 * Einheiten: SI (V, A, T, m, m/s, N).
 */

/** Magnetische Feldkonstante μ₀ in T m/A. */
export const MU0 = 1.25663706212e-6;
/** Elementarladung in C. */
export const E_CHARGE = 1.602176634e-19;
/** Elektronenmasse in kg. */
export const M_E = 9.1093837015e-31;
/** Spezifische Ladung des Elektrons e/m in C/kg. */
export const SPECIFIC_CHARGE = E_CHARGE / M_E;

/** Helmholtzspulen des Schulgeräts: Windungszahl und Radius in m. */
export const COILS = { n: 130, R: 0.15 } as const;

/** Feld in der Mitte eines Helmholtzspulenpaars in T. */
export function helmholtzField(n: number, I: number, R: number): number {
  return Math.pow(4 / 5, 1.5) * MU0 * n * I / R;
}

/** Geschwindigkeit nach Beschleunigung mit U (nicht relativistisch) in m/s. */
export function electronSpeed(U: number, em = SPECIFIC_CHARGE): number {
  return Math.sqrt(2 * em * Math.max(0, U));
}

/** Bahnradius r = √(2 U m / e) / B in m (unendlich ohne Feld). */
export function orbitRadius(U: number, B: number, em = SPECIFIC_CHARGE): number {
  if (B <= 0) return Infinity;
  return Math.sqrt((2 * Math.max(0, U)) / em) / B;
}

/**
 * Betrag der Lorentzkraft F = |q| · v · B · sin α in N; α ist der Winkel
 * zwischen v und B (Standard 90°, wie im Fadenstrahlrohr). Für v parallel zu B
 * (α = 0) ist F = 0.
 */
export function lorentzForce(q: number, v: number, B: number, alpha = Math.PI / 2): number {
  return Math.abs(q * v * B * Math.sin(alpha));
}

/** Umlaufzeit T = 2π · m / (e · B) in s – unabhängig von v und U (unendlich ohne Feld). */
export function orbitPeriod(B: number, em = SPECIFIC_CHARGE): number {
  if (B <= 0) return Infinity;
  return (2 * Math.PI) / (em * B);
}

/** Spezifische Ladung aus einer Messung: e/m = 2 U / (B² r²). */
export function specificChargeFrom(U: number, B: number, r: number): number {
  return (2 * U) / (B * B * r * r);
}

/** Spulenstrom, bei dem der Bahnradius r erreicht wird. */
export function currentForRadius(U: number, r: number, n = COILS.n, R = COILS.R): number {
  const B = Math.sqrt((2 * U) / SPECIFIC_CHARGE) / r;
  return B / helmholtzField(n, 1, R);
}

/**
 * Ausgleichsgerade durch den Ursprung für y = 2U über x = B² r²:
 * Steigung = e/m (kleinste Quadrate).
 */
export function fitSpecificCharge(points: readonly { U: number; B: number; r: number }[]): number | null {
  let sxx = 0;
  let sxy = 0;
  for (const q of points) {
    const x = q.B * q.B * q.r * q.r;
    sxx += x * x;
    sxy += x * 2 * q.U;
  }
  return sxx > 0 ? sxy / sxx : null;
}
