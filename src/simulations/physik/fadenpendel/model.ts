/**
 * Rechenlogik „Fadenpendel“: mathematisches Pendel mit optionaler Dämpfung
 * θ'' = −(g/l)·sin θ − γ·θ'.
 */
import { rk4 } from '../../../sim-core/numeric';

/** Periodendauer in der Kleinwinkelnäherung: T₀ = 2π·√(l/g). */
export function smallAnglePeriod(length: number, g: number): number {
  return 2 * Math.PI * Math.sqrt(length / g);
}

/** Arithmetisch-geometrisches Mittel. */
function agm(a: number, b: number): number {
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-15 * a; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return a;
}

/**
 * Exakte Periodendauer des ungedämpften Pendels bei Amplitude θ₀ (Bogenmaß):
 * T = T₀ / AGM(1, cos(θ₀/2)).
 */
export function exactPeriod(length: number, g: number, amplitude: number): number {
  return smallAnglePeriod(length, g) / agm(1, Math.cos(Math.abs(amplitude) / 2));
}

/** Ein Zeitschritt; Zustand [θ, ω] in rad bzw. rad/s. */
export function step(state: readonly [number, number], length: number, g: number, damping: number, h: number): [number, number] {
  const f = (_t: number, y: readonly number[]) => [y[1]!, -(g / length) * Math.sin(y[0]!) - damping * y[1]!];
  const next = rk4(f, 0, state, h);
  return [next[0]!, next[1]!];
}

/** Energien (J) bei Masse m: Lageenergie relativ zum tiefsten Punkt und Bewegungsenergie. */
export function energies(state: readonly [number, number], length: number, g: number, mass: number): { pot: number; kin: number } {
  const height = length * (1 - Math.cos(state[0]));
  const speed = length * state[1];
  return { pot: mass * g * height, kin: 0.5 * mass * speed * speed };
}
