/**
 * Rechenlogik „Erzwungene Schwingung und Resonanz“ am Pohlschen Rad.
 *
 * Ein Drehpendel (Rad mit Spiralfeder) wird über einen Motor mit Exzenter
 * angetrieben: Das äußere Ende der Spiralfeder (Erregerhebel) schwingt mit
 * φ_E(t) = φ̂_E · sin(ω_E · t). Mit der Eigenkreisfrequenz ω₀ und der
 * Abklingkonstante δ (Wirbelstrombremse) gilt für die Auslenkung φ des Rades
 *
 *   φ'' = −ω₀² · (φ − φ_E(t)) − 2δ · φ'
 *
 * Nach dem Einschwingen schwingt das Rad mit der Erregerfrequenz:
 *   φ(t) = φ̂ · sin(ω_E · t − Δφ)
 * mit der Amplitude φ̂ = φ̂_E · ω₀² / √((ω₀² − ω_E²)² + (2δω_E)²)
 * und der Phasenverschiebung Δφ = arctan(2δω_E / (ω₀² − ω_E²)) ∈ [0; π].
 *
 * Winkel im Bogenmaß, Zeiten in s.
 */

/** Eigenfrequenz des Rades: f₀ = 0,5 Hz (T₀ = 2 s), ω₀ = π 1/s. */
export const F0 = 0.5;
export const OMEGA0 = 2 * Math.PI * F0;

export interface Drive {
  /** Erregeramplitude φ̂_E (rad). */
  ampE: number;
  /** Erregerkreisfrequenz ω_E (1/s). */
  omegaE: number;
  /** Abklingkonstante δ (1/s). */
  delta: number;
  /** Eigenkreisfrequenz ω₀ (1/s). */
  omega0: number;
  /**
   * Phasenversatz des Motors (rad): φ_E = φ̂_E · sin(ω_E · t + ψ₀). Ändert man
   * die Drehzahl, bleibt die Drehung des Motors dadurch stetig.
   */
  phase0?: number;
}

/** Zustand: Auslenkung φ (rad) und Winkelgeschwindigkeit φ' (rad/s). */
export type State = readonly [number, number];

/** Auslenkung des Erregers zur Zeit t. */
export function driveAngle(d: Drive, t: number): number {
  return d.ampE * Math.sin(d.omegaE * t + (d.phase0 ?? 0));
}

/** Phasenwinkel des Erregers ω_E · t + ψ₀. */
export function drivePhase(d: Drive, t: number): number {
  return d.omegaE * t + (d.phase0 ?? 0);
}

/** Winkelbeschleunigung φ'' zum Zustand. */
export function acceleration(d: Drive, t: number, s: State): number {
  return -d.omega0 * d.omega0 * (s[0] - driveAngle(d, t)) - 2 * d.delta * s[1];
}

/** Ein Runge-Kutta-Schritt (4. Ordnung) der Länge h ab der Zeit t. */
export function step(d: Drive, t: number, s: State, h: number): [number, number] {
  const w2 = d.omega0 * d.omega0;
  const k = 2 * d.delta;
  const p0 = d.phase0 ?? 0;
  const acc = (tt: number, x: number, v: number) => -w2 * (x - d.ampE * Math.sin(d.omegaE * tt + p0)) - k * v;
  const [x, v] = s;
  const a1 = acc(t, x, v);
  const x2 = x + 0.5 * h * v;
  const v2 = v + 0.5 * h * a1;
  const a2 = acc(t + 0.5 * h, x2, v2);
  const x3 = x + 0.5 * h * v2;
  const v3 = v + 0.5 * h * a2;
  const a3 = acc(t + 0.5 * h, x3, v3);
  const x4 = x + h * v3;
  const v4 = v + h * a3;
  const a4 = acc(t + h, x4, v4);
  return [x + (h / 6) * (v + 2 * v2 + 2 * v3 + v4), v + (h / 6) * (a1 + 2 * a2 + 2 * a3 + a4)];
}

/** Verhältnis φ̂ / φ̂_E im eingeschwungenen Zustand. */
export function amplitudeRatio(omegaE: number, omega0: number, delta: number): number {
  const a = omega0 * omega0 - omegaE * omegaE;
  const b = 2 * delta * omegaE;
  return (omega0 * omega0) / Math.sqrt(a * a + b * b);
}

/** Amplitude φ̂ im eingeschwungenen Zustand (rad). */
export function steadyAmplitude(d: Drive): number {
  return d.ampE * amplitudeRatio(d.omegaE, d.omega0, d.delta);
}

/** Phasenverschiebung Δφ zwischen Erreger und Rad (rad, 0 … π). */
export function phaseShift(omegaE: number, omega0: number, delta: number): number {
  return Math.atan2(2 * delta * omegaE, omega0 * omega0 - omegaE * omegaE);
}

/** Resonanzkreisfrequenz (größte Amplitude) ω_R = √(ω₀² − 2δ²); 0, wenn es kein Maximum gibt. */
export function resonanceOmega(omega0: number, delta: number): number {
  const w2 = omega0 * omega0 - 2 * delta * delta;
  return w2 > 0 ? Math.sqrt(w2) : 0;
}

/** Eingeschwungener Zustand zur Zeit t (ohne Einschwingvorgang). */
export function steadyState(d: Drive, t: number): [number, number] {
  const A = steadyAmplitude(d);
  const ph = drivePhase(d, t) - phaseShift(d.omegaE, d.omega0, d.delta);
  return [A * Math.sin(ph), A * d.omegaE * Math.cos(ph)];
}

/**
 * Amplitude und Phasenverschiebung, die man aus einem Zustand abliest, wenn
 * man ihn als harmonische Schwingung mit der Erregerfrequenz deutet
 * (im eingeschwungenen Zustand exakt).
 */
export function readPhasor(d: Drive, t: number, s: State): { amp: number; shift: number } {
  const amp = Math.hypot(s[0], s[1] / d.omegaE);
  const own = Math.atan2(s[0], s[1] / d.omegaE);
  let shift = (drivePhase(d, t) - own) % (2 * Math.PI);
  if (shift < -Math.PI) shift += 2 * Math.PI;
  if (shift > Math.PI) shift -= 2 * Math.PI;
  return { amp, shift };
}

/**
 * Integriert ab (t, s) über die Dauer `duration` mit der Schrittweite h.
 * Bricht ab, sobald |φ| die Grenze `limit` überschreitet.
 */
export function integrate(d: Drive, t: number, s: State, duration: number, h: number, limit = Infinity): { t: number; s: [number, number]; exceeded: boolean } {
  let state: [number, number] = [s[0], s[1]];
  const n = Math.max(1, Math.round(duration / h));
  for (let i = 0; i < n; i++) {
    state = step(d, t, state, h);
    t += h;
    if (Math.abs(state[0]) > limit) return { t, s: state, exceeded: true };
  }
  return { t, s: state, exceeded: false };
}
