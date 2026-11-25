/**
 * Röntgenstrahlung: Bremsspektrum (Kramers), charakteristische Linien,
 * Duane-Hunt-Grenze, Bragg-Reflexion am Kristall, Moseley-Gesetz und
 * Compton-Streuung.
 */

/** h·c in keV·pm. */
export const HC = 1239.84;
/** Compton-Wellenlänge des Elektrons in pm. */
export const LAMBDA_C = 2.4263;
/** Ruheenergie des Elektrons in keV. */
export const ME_C2 = 511;

export interface Anode {
  id: string;
  Z: number;
  /** Energien der Kα- und Kβ-Linie in keV (Messwerte). */
  Ka: number;
  Kb: number;
  /** Bindungsenergie der K-Schale in keV (Anregungsschwelle). */
  K: number;
}

export const ANODES: Record<string, Anode> = {
  cu: { id: 'cu', Z: 29, Ka: 8.04, Kb: 8.9, K: 8.98 },
  mo: { id: 'mo', Z: 42, Ka: 17.48, Kb: 19.61, K: 20.0 },
};

/** Gitterabstand von LiF (200-Ebenen) in pm. */
export const D_LIF = 201.4;

/** Kleinste Wellenlänge (Duane-Hunt): λ_min = h·c/(e·U), U in kV, Ergebnis in pm. */
export function lambdaMin(U: number): number {
  return HC / U;
}

/** Energie in keV ↔ Wellenlänge in pm. */
export function lambdaOf(E: number): number {
  return HC / E;
}

/** Bremsspektrum nach Kramers (relativ): I(λ) ∝ Z·(1/λ_min − 1/λ)/λ². */
export function bremsstrahlung(lambda: number, U: number, Z: number): number {
  const lm = lambdaMin(U);
  if (lambda <= lm) return 0;
  return (Z * (1 / lm - 1 / lambda)) / (lambda * lambda);
}

/** Stärke der charakteristischen Linien (relativ); null, solange U unter der K-Schwelle liegt. */
export function lineStrength(U: number, a: Anode): number {
  if (U <= a.K) return 0;
  return Math.min(U / a.K - 1, 1.5);
}

/** Moseley-Gesetz für Kα: E ≈ 10,2 eV·(Z − 1)², Ergebnis in keV. */
export function moseleyKa(Z: number): number {
  return 0.0102 * (Z - 1) * (Z - 1);
}

/** Gesamtspektrum (relativ) mit Linien als schmale Glockenkurven. */
export function spectrum(lambda: number, U: number, a: Anode): number {
  const scale = 4e4;
  let I = scale * bremsstrahlung(lambda, U, a.Z);
  const s = lineStrength(U, a);
  if (s > 0) {
    const peak = (l0: number, h: number) => h * Math.exp(-((lambda - l0) ** 2) / (2 * 1.2 * 1.2));
    I += peak(lambdaOf(a.Ka), 8 * s) + peak(lambdaOf(a.Kb), 1.8 * s);
  }
  return I;
}

/** Bragg-Bedingung: λ = 2d·sin θ / n (θ in °, Ergebnis in pm). */
export function braggLambda(thetaDeg: number, d = D_LIF, n = 1): number {
  return (2 * d * Math.sin((thetaDeg * Math.PI) / 180)) / n;
}

/** Glanzwinkel zu λ (in °), `null` wenn nicht erreichbar. */
export function braggAngle(lambda: number, d = D_LIF, n = 1): number | null {
  const s = (n * lambda) / (2 * d);
  return s > 1 ? null : (Math.asin(s) * 180) / Math.PI;
}

/** Compton: λ' = λ + λ_C·(1 − cos φ). */
export function comptonLambda(lambda: number, phiDeg: number): number {
  return lambda + LAMBDA_C * (1 - Math.cos((phiDeg * Math.PI) / 180));
}

/** Rückstoßrichtung des Elektrons (in °, gegen die Einfallsrichtung) aus dem Impulssatz. */
export function recoilAngle(lambda: number, phiDeg: number): number {
  const l2 = comptonLambda(lambda, phiDeg);
  const phi = (phiDeg * Math.PI) / 180;
  const px = 1 / lambda - Math.cos(phi) / l2;
  const py = -Math.sin(phi) / l2;
  return (Math.atan2(py, px) * 180) / Math.PI;
}
