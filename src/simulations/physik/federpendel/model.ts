/**
 * Rechenlogik „Federpendel“: senkrecht hängender Körper (Masse m) an einer
 * idealen, masselosen Schraubenfeder (Federhärte D), optional mit
 * geschwindigkeitsproportionaler Dämpfung.
 *
 * Koordinate: Elongation y = Auslenkung aus der Ruhelage, **nach oben
 * positiv**. In der Ruhelage ist die Feder um s₀ = m·g/D gedehnt; dort heben
 * sich Gewichtskraft und Federkraft auf. Die resultierende Kraft ist die
 * Rückstellkraft F = −D·y (lineares Kraftgesetz), also
 *
 *   m·ÿ = −D·y − 2·m·δ·ẏ    bzw.    ÿ = −ω₀²·y − 2δ·ẏ
 *
 * mit ω₀ = √(D/m) und der Abklingkonstante δ (in 1/s).
 * Lösung (schwach gedämpft): y(t) = ŷ·e^(−δt)·sin(ω_d·t + φ₀), ω_d = √(ω₀² − δ²).
 */
import { rk4 } from '../../../sim-core/numeric';

/** Ortsfaktor in N/kg. */
export const G = 9.81;

/** Zustand: Elongation y (m, nach oben positiv) und Geschwindigkeit v (m/s). */
export type State = readonly [number, number];

/** Kreisfrequenz des ungedämpften Pendels ω₀ = √(D/m) in 1/s. */
export function omega0(m: number, D: number): number {
  return Math.sqrt(D / m);
}

/** Periodendauer T = 2π·√(m/D). */
export function period(m: number, D: number): number {
  return 2 * Math.PI * Math.sqrt(m / D);
}

/** Kreisfrequenz mit Dämpfung ω_d = √(ω₀² − δ²); 0 im aperiodischen Fall. */
export function dampedOmega(m: number, D: number, delta: number): number {
  const w2 = D / m - delta * delta;
  return w2 > 0 ? Math.sqrt(w2) : 0;
}

/** Periodendauer mit Dämpfung T_d = 2π/ω_d (Infinity, wenn nicht mehr schwingend). */
export function dampedPeriod(m: number, D: number, delta: number): number {
  const w = dampedOmega(m, D, delta);
  return w > 0 ? (2 * Math.PI) / w : Infinity;
}

/** Dehnung der Feder in der Ruhelage s₀ = m·g/D (m). */
export function equilibriumExtension(m: number, D: number): number {
  return (m * G) / D;
}

/**
 * Anfangszustand zu Amplitude ŷ (m) und Nullphasenwinkel φ₀ (rad), so dass
 * y(t) = ŷ·e^(−δt)·sin(ω_d·t + φ₀) gilt.
 */
export function initialState(amp: number, phi0: number, m: number, D: number, delta: number): [number, number] {
  const w = dampedOmega(m, D, delta);
  return [amp * Math.sin(phi0), amp * (w * Math.cos(phi0) - delta * Math.sin(phi0))];
}

/** Exakte Lösung (schwach gedämpft) – Elongation zur Zeit t. */
export function analyticY(t: number, amp: number, phi0: number, m: number, D: number, delta: number): number {
  return amp * Math.exp(-delta * t) * Math.sin(dampedOmega(m, D, delta) * t + phi0);
}

/** Beschleunigung ÿ = −(D/m)·y − 2δ·v. */
export function acceleration(state: State, m: number, D: number, delta: number): number {
  return -(D / m) * state[0] - 2 * delta * state[1];
}

/** Ein Zeitschritt mit dem klassischen Runge-Kutta-Verfahren. */
export function step(state: State, m: number, D: number, delta: number, h: number): [number, number] {
  const k = D / m;
  const f = (_t: number, y: readonly number[]) => [y[1]!, -k * y[0]! - 2 * delta * y[1]!];
  const next = rk4(f, 0, state, h);
  return [next[0]!, next[1]!];
}

/**
 * Zeiger (Zeigerdiagramm) zum momentanen Zustand: Länge (momentane Amplitude)
 * und Phasenwinkel φ = ω_d·t + φ₀, so dass y = Länge · sin φ.
 */
export function phasor(state: State, m: number, D: number, delta: number): { amp: number; phase: number } {
  const w = dampedOmega(m, D, delta);
  if (w <= 0) return { amp: Math.abs(state[0]), phase: state[0] >= 0 ? Math.PI / 2 : -Math.PI / 2 };
  const c = (state[1] + delta * state[0]) / w;
  return { amp: Math.hypot(state[0], c), phase: Math.atan2(state[0], c) };
}

export interface Energies {
  /** Bewegungsenergie ½·m·v². */
  kin: number;
  /** „Schwingungs-Spannenergie“ ½·D·y² (Spann- und Lageenergie zusammen, bis auf eine Konstante). */
  osc: number;
  /** Spannenergie der Feder ½·D·s² mit der Dehnung s = s₀ − y. */
  spring: number;
  /** Lageenergie m·g·h, Höhe h über dem Bezugsniveau y = yRef. */
  grav: number;
}

/**
 * Energien zum Zustand; `yRef` ist das Bezugsniveau der Lageenergie (z. B. der
 * tiefste Punkt der Bewegung, y = −ŷ).
 */
export function energies(state: State, m: number, D: number, yRef: number): Energies {
  const [y, v] = state;
  const s = equilibriumExtension(m, D) - y;
  return { kin: 0.5 * m * v * v, osc: 0.5 * D * y * y, spring: 0.5 * D * s * s, grav: m * G * (y - yRef) };
}

/** Kräfte am Körper (N, nach oben positiv): Gewichtskraft, Federkraft, resultierende Kraft. */
export function forces(y: number, m: number, D: number): { weight: number; spring: number; net: number } {
  const spring = D * (equilibriumExtension(m, D) - y);
  return { weight: -m * G, spring, net: spring - m * G };
}
