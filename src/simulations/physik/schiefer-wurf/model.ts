/**
 * Rechenlogik „Waagerechter und schiefer Wurf“.
 *
 * Ohne Luftwiderstand gibt es geschlossene Formeln. Mit Luftwiderstand
 * (quadratisch in der Geschwindigkeit) wird die Bahn numerisch mit dem
 * Runge-Kutta-Verfahren berechnet.
 */
import { rk4 } from '../../../sim-core/numeric';

export interface Launch {
  /** Abwurfgeschwindigkeit in m/s. */
  v0: number;
  /** Abwurfwinkel in Grad (gegen die Waagerechte). */
  angle: number;
  /** Abwurfhöhe in m. */
  h0: number;
  /** Fallbeschleunigung in m/s². */
  g: number;
}

export interface FlightState {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Flight {
  /** Flugzeit bis zum Aufprall (y = 0) in s. */
  time: number;
  /** Wurfweite in m. */
  range: number;
  /** Größte Höhe über dem Boden in m. */
  maxHeight: number;
  /** Zeitpunkt der größten Höhe in s. */
  apexTime: number;
  /** Zustand beim Aufprall. */
  impact: FlightState;
}

/** Fallbeschleunigungen (m/s²) und Luftdichten (kg/m³) zum Auswählen. */
export const PLANETS = {
  erde: { g: 9.81, rho: 1.2 },
  mond: { g: 1.62, rho: 0 },
  mars: { g: 3.71, rho: 0.02 },
} as const;
export type PlanetId = keyof typeof PLANETS;

/**
 * Luftwiderstandsbeiwert k = ρ · c_w · A / (2m) für einen Fußball
 * (m = 0,43 kg, d = 22 cm, c_w ≈ 0,25) bei Luftdichte ρ. Einheit 1/m.
 */
export function footballDrag(rho: number): number {
  const area = Math.PI * 0.11 ** 2;
  return (rho * 0.25 * area) / (2 * 0.43);
}

function components(launch: Launch): { vx: number; vy: number } {
  const a = (launch.angle * Math.PI) / 180;
  return { vx: launch.v0 * Math.cos(a), vy: launch.v0 * Math.sin(a) };
}

/** Zustand zum Zeitpunkt t ohne Luftwiderstand. */
export function vacuumState(launch: Launch, t: number): FlightState {
  const { vx, vy } = components(launch);
  return { t, x: vx * t, y: launch.h0 + vy * t - 0.5 * launch.g * t * t, vx, vy: vy - launch.g * t };
}

/** Flugdaten ohne Luftwiderstand (Aufprall bei y = 0). */
export function vacuumFlight(launch: Launch): Flight {
  const { vy } = components(launch);
  const g = launch.g;
  const time = (vy + Math.sqrt(vy * vy + 2 * g * launch.h0)) / g;
  const apexTime = Math.max(0, vy / g);
  const impact = vacuumState(launch, time);
  return {
    time,
    range: impact.x,
    maxHeight: launch.h0 + (vy > 0 ? (vy * vy) / (2 * g) : 0),
    apexTime,
    impact: { ...impact, y: 0 },
  };
}

/**
 * Bahn mit Luftwiderstand: a = −k·|v|·v − g. Liefert Stützstellen im Abstand
 * `dt` bis zum Aufprall und die Flugdaten.
 */
export function dragFlight(launch: Launch, k: number, dt = 0.002): { samples: FlightState[]; flight: Flight } {
  const { vx, vy } = components(launch);
  const g = launch.g;
  const f = (_t: number, s: readonly number[]) => {
    const speed = Math.hypot(s[2]!, s[3]!);
    return [s[2]!, s[3]!, -k * speed * s[2]!, -g - k * speed * s[3]!];
  };
  let state = [0, launch.h0, vx, vy];
  let t = 0;
  const samples: FlightState[] = [{ t, x: 0, y: launch.h0, vx, vy }];
  let apex = samples[0]!;
  for (let i = 0; i < 200_000; i++) {
    const next = rk4(f, t, state, dt);
    const tn = t + dt;
    if (next[1]! <= 0 && i > 0) {
      // Aufprall zwischen t und tn linear interpolieren
      const u = state[1]! / (state[1]! - next[1]!);
      const hit: FlightState = {
        t: t + u * dt,
        x: state[0]! + u * (next[0]! - state[0]!),
        y: 0,
        vx: state[2]! + u * (next[2]! - state[2]!),
        vy: state[3]! + u * (next[3]! - state[3]!),
      };
      samples.push(hit);
      return { samples, flight: { time: hit.t, range: hit.x, maxHeight: apex.y, apexTime: apex.t, impact: hit } };
    }
    state = next;
    t = tn;
    const s: FlightState = { t, x: state[0]!, y: state[1]!, vx: state[2]!, vy: state[3]! };
    samples.push(s);
    if (s.y > apex.y) apex = s;
  }
  const last = samples[samples.length - 1]!;
  return { samples, flight: { time: last.t, range: last.x, maxHeight: apex.y, apexTime: apex.t, impact: last } };
}

/** Zustand zur Zeit t aus Stützstellen (gleichmäßiger Abstand) interpolieren. */
export function sampleAt(samples: readonly FlightState[], t: number): FlightState {
  if (samples.length === 0) return { t, x: 0, y: 0, vx: 0, vy: 0 };
  const first = samples[0]!;
  const last = samples[samples.length - 1]!;
  if (t <= first.t) return first;
  if (t >= last.t) return last;
  const dt = samples.length > 2 ? samples[1]!.t - first.t : last.t - first.t;
  let i = Math.min(samples.length - 2, Math.floor((t - first.t) / dt));
  while (i > 0 && samples[i]!.t > t) i--;
  while (i < samples.length - 2 && samples[i + 1]!.t < t) i++;
  const a = samples[i]!;
  const b = samples[i + 1]!;
  const u = (t - a.t) / (b.t - a.t || 1);
  return { t, x: a.x + u * (b.x - a.x), y: a.y + u * (b.y - a.y), vx: a.vx + u * (b.vx - a.vx), vy: a.vy + u * (b.vy - a.vy) };
}
