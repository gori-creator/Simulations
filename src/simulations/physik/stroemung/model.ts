/**
 * Strömungsphysik: Kontinuitätsgleichung, Bernoulli-Gleichung, Reynolds-Zahl
 * (Rohr mit Engstelle) und Potentialströmung um ein Joukowski-Profil mit
 * Kutta-Bedingung (Tragflügel, dynamischer Auftrieb).
 */

export const RHO_WATER = 1000; // kg/m³
export const NU_WATER = 1.0e-6; // m²/s (kinematische Zähigkeit bei 20 °C)
export const RHO_AIR = 1.2; // kg/m³
export const G = 9.81;

/* ------------------------------------------------------------------ */
/* Rohr                                                                */
/* ------------------------------------------------------------------ */

/** Kontinuitätsgleichung A₁·v₁ = A₂·v₂ → v₂. `ratio` = A₂/A₁. */
export function continuity(v1: number, ratio: number): number {
  return v1 / ratio;
}

/** Bernoulli (waagerechtes Rohr): p₁ − p₂ = ½ρ(v₂² − v₁²). */
export function bernoulliDrop(v1: number, v2: number, rho = RHO_WATER): number {
  return 0.5 * rho * (v2 * v2 - v1 * v1);
}

/** Reynolds-Zahl Re = v·d/ν. */
export function reynolds(v: number, d: number, nu = NU_WATER): number {
  return (v * d) / nu;
}

export type FlowKind = 'laminar' | 'transition' | 'turbulent';

/** Grobe Einteilung für Rohrströmungen (Re < 2300 laminar, > 4000 turbulent). */
export function flowKind(re: number): FlowKind {
  if (re < 2300) return 'laminar';
  if (re <= 4000) return 'transition';
  return 'turbulent';
}

/**
 * Glatter Rohrquerschnitt längs x ∈ [0, 1]: Verhältnis A(x)/A₁.
 * Engstelle in der Mitte (0,4 … 0,6), weiche Übergänge.
 */
export function areaRatioAt(x: number, ratio: number): number {
  const s = (u: number) => 0.5 * (1 + Math.tanh(u));
  const k = 40;
  const narrow = s(k * (x - 0.36)) * (1 - s(k * (x - 0.64)));
  return 1 - (1 - ratio) * narrow;
}

/* ------------------------------------------------------------------ */
/* Tragflügel (Joukowski)                                              */
/* ------------------------------------------------------------------ */

export type C = [number, number];
const add = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const sub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
const mul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const div = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const expi = (t: number): C => [Math.cos(t), Math.sin(t)];
const abs2 = (a: C) => a[0] * a[0] + a[1] * a[1];

export interface Airfoil {
  /** Mittelpunkt des Kreises in der ζ-Ebene (−Dicke, Wölbung). */
  mu: C;
  R: number;
  /** Winkel, der die Hinterkante bei ζ = 1 festlegt. */
  beta: number;
}

/** Joukowski-Profil mit Dicke `eps` und Wölbung `f` (typisch 0,1 und 0,08). */
export function airfoil(eps = 0.1, f = 0.08): Airfoil {
  const mu: C = [-eps, f];
  const R = Math.hypot(1 + eps, f);
  return { mu, R, beta: Math.atan2(f, 1 + eps) };
}

/** Abbildung z = ζ + 1/ζ. */
export function joukowski(z: C): C {
  return add(z, div([1, 0], z));
}

/** Umkehrung der Abbildung: Zweig außerhalb des Kreises. */
export function inverse(z: C, A: Airfoil): C {
  // ζ = (z ± √(z² − 4)) / 2
  const w = sub(mul(z, z), [4, 0]);
  const r = Math.sqrt(Math.hypot(w[0], w[1]));
  const t = Math.atan2(w[1], w[0]) / 2;
  const s: C = [r * Math.cos(t), r * Math.sin(t)];
  const a: C = [(z[0] + s[0]) / 2, (z[1] + s[1]) / 2];
  const b: C = [(z[0] - s[0]) / 2, (z[1] - s[1]) / 2];
  return abs2(sub(a, A.mu)) >= abs2(sub(b, A.mu)) ? a : b;
}

/** Zirkulation nach der Kutta-Bedingung (Anströmung U, Anstellwinkel α in rad). */
export function circulation(A: Airfoil, alpha: number, U = 1): number {
  return 4 * Math.PI * U * A.R * Math.sin(alpha + A.beta);
}

/** dW/dζ der Strömung um den Kreis (mit Zirkulation). */
function dWdZeta(zeta: C, A: Airfoil, alpha: number, U: number, gamma: number): C {
  const q = sub(zeta, A.mu);
  const t1: C = [U * Math.cos(alpha), -U * Math.sin(alpha)];
  const t2 = div(mul([U * A.R * A.R, 0], expi(alpha)), mul(q, q));
  const t3 = div([0, gamma / (2 * Math.PI)], q);
  return add(sub(t1, t2), t3);
}

/** Geschwindigkeit in der Flügelebene (vx, vy) an der Stelle ζ. */
export function velocityAt(zeta: C, A: Airfoil, alpha: number, U = 1): C {
  const gamma = circulation(A, alpha, U);
  const dW = dWdZeta(zeta, A, alpha, U, gamma);
  const dz = sub([1, 0], div([1, 0], mul(zeta, zeta)));
  const w = div(dW, dz); // komplexe Geschwindigkeit u − i v
  return [w[0], -w[1]];
}

/** Bewegung in der ζ-Ebene: dζ/dt = conj(dW/dζ) / |dz/dζ|². */
export function zetaRate(zeta: C, A: Airfoil, alpha: number, U = 1): C {
  const gamma = circulation(A, alpha, U);
  const dW = dWdZeta(zeta, A, alpha, U, gamma);
  const dz = sub([1, 0], div([1, 0], mul(zeta, zeta)));
  const m = Math.max(abs2(dz), 1e-3);
  return [dW[0] / m, -dW[1] / m];
}

/** Profilumriss in der Flügelebene (n Punkte). */
export function outline(A: Airfoil, n = 120): C[] {
  const pts: C[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI;
    pts.push(joukowski(add(A.mu, [A.R * Math.cos(t), A.R * Math.sin(t)])));
  }
  return pts;
}

/** Profiltiefe (Sehnenlänge) in Modelleinheiten. */
export function chord(A: Airfoil): number {
  const xs = outline(A, 360).map((p) => p[0]);
  return Math.max(...xs) - Math.min(...xs);
}

/** Auftriebsbeiwert der reibungsfreien Theorie: c_A = 2Γ/(U·c). */
export function liftCoefficientIdeal(A: Airfoil, alpha: number): number {
  return (2 * circulation(A, alpha, 1)) / chord(A);
}

export const STALL_DEG = 15;
/** Reale Profile erreichen wegen der Reibung nur etwa drei Viertel des idealen Werts. */
export const REAL = 0.75;

/**
 * Vereinfachter Auftriebsbeiwert mit Strömungsabriss: bis 15° die ideale
 * Theorie (mit Faktor REAL), danach bricht der Auftrieb ein (Modellannahme, kein Messwert).
 */
export function liftCoefficient(A: Airfoil, alphaDeg: number): number {
  const rad = Math.PI / 180;
  if (alphaDeg <= STALL_DEG) return REAL * liftCoefficientIdeal(A, alphaDeg * rad);
  const peak = REAL * liftCoefficientIdeal(A, STALL_DEG * rad);
  const k = Math.min(1, (alphaDeg - STALL_DEG) / 8);
  return peak * (1 - 0.45 * k);
}

/** Auftriebskraft F = ½·ρ·v²·A·c_A. */
export function liftForce(cA: number, v: number, area: number, rho = RHO_AIR): number {
  return 0.5 * rho * v * v * area * cA;
}
