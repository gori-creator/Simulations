/**
 * Rechenlogik „Waagerechter und schiefer Wurf“.
 *
 * Ohne Luftwiderstand gibt es geschlossene Formeln (Superposition einer
 * gleichförmigen Bewegung in x-Richtung und eines senkrechten Wurfs in
 * y-Richtung):
 *   x(t) = v₀·cos α · t,   y(t) = h₀ + v₀·sin α · t − ½·g·t².
 * Mit Luftwiderstand (quadratisch in der Geschwindigkeit,
 * a = −k·|v|·v − g) wird die Bahn numerisch mit dem Runge-Kutta-Verfahren
 * berechnet.
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
 * Wurfkörper für den Luftwiderstand: Masse m (kg), Durchmesser d (m) und
 * Widerstandsbeiwert c_w (Näherungswerte für glatte Kugeln).
 */
export const PROJECTILES = {
  /** Fußball */
  fb: { m: 0.43, d: 0.22, cw: 0.25 },
  /** Tischtennisball */
  tt: { m: 0.0027, d: 0.04, cw: 0.45 },
  /** Stoßkugel (Kugelstoßen, Männer) */
  kugel: { m: 7.26, d: 0.12, cw: 0.45 },
} as const;
export type ProjectileId = keyof typeof PROJECTILES;

/**
 * Luftwiderstandsbeiwert k = ρ · c_w · A / (2m) in 1/m, so dass der
 * Luftwiderstand die Beschleunigung a = k · v² bewirkt.
 */
export function dragConstant(rho: number, obj: ProjectileId): number {
  const q = PROJECTILES[obj];
  const area = Math.PI * (q.d / 2) ** 2;
  return (rho * q.cw * area) / (2 * q.m);
}

/** Luftwiderstandsbeiwert für einen Fußball (m = 0,43 kg, d = 22 cm, c_w ≈ 0,25). */
export function footballDrag(rho: number): number {
  return dragConstant(rho, 'fb');
}

/** Endgeschwindigkeit beim Fallen mit Luftwiderstand: v_E = √(g/k). */
export function terminalSpeed(g: number, k: number): number {
  return k > 0 ? Math.sqrt(g / k) : Infinity;
}

const RAD = Math.PI / 180;

function components(launch: Launch): { vx: number; vy: number } {
  const a = launch.angle * RAD;
  // cos(90°) ist numerisch nicht genau null – senkrechter Wurf exakt
  const vx = Math.abs(launch.angle) === 90 ? 0 : launch.v0 * Math.cos(a);
  return { vx, vy: launch.v0 * Math.sin(a) };
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
  const time = (vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, launch.h0))) / g;
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

/** Wurfweite ohne Luftwiderstand (allgemein, auch mit Abwurfhöhe h₀). */
export function vacuumRange(v0: number, angle: number, h0: number, g: number): number {
  return vacuumFlight({ v0, angle, h0, g }).range;
}

/**
 * Bester Abwurfwinkel ohne Luftwiderstand: tan α = v₀ / √(v₀² + 2·g·h₀).
 * Für h₀ = 0 sind das 45°, für h₀ > 0 weniger.
 */
export function optimalAngle(v0: number, h0: number, g: number): number {
  return Math.atan(v0 / Math.sqrt(v0 * v0 + 2 * g * Math.max(0, h0))) / RAD;
}

/** Größte Wurfweite ohne Luftwiderstand: w_max = (v₀/g) · √(v₀² + 2·g·h₀). */
export function maxRange(v0: number, h0: number, g: number): number {
  return (v0 / g) * Math.sqrt(v0 * v0 + 2 * g * Math.max(0, h0));
}

/** Höhe der Bahn (ohne Luftwiderstand) an der waagerechten Stelle x; null, wenn x nie erreicht wird. */
export function heightAt(launch: Launch, x: number): number | null {
  const { vx } = components(launch);
  if (vx <= 1e-12) return x === 0 ? launch.h0 : null;
  const t = x / vx;
  if (t < 0) return null;
  return vacuumState(launch, t).y;
}

/**
 * Zielwurf ohne Luftwiderstand: Abwurfwinkel, unter denen ein Ziel in der
 * waagerechten Entfernung dx (> 0) und dem Höhenunterschied dy (Ziel minus
 * Abwurfhöhe) getroffen wird:
 *   tan α = (v₀² ± √(v₀⁴ − g·(g·dx² + 2·dy·v₀²))) / (g·dx).
 * Ergebnis aufsteigend sortiert (flache, steile Bahn), leer, wenn das Ziel
 * mit v₀ unerreichbar ist.
 */
export function aimAngles(v0: number, dx: number, dy: number, g: number): number[] {
  if (!(dx > 0) || !(v0 > 0)) return [];
  const v2 = v0 * v0;
  let disc = v2 * v2 - g * (g * dx * dx + 2 * dy * v2);
  // Rundungsfehler genau an der Reichweitengrenze abfangen
  if (disc < 0 && disc > -1e-9 * v2 * v2) disc = 0;
  if (disc < 0) return [];
  const root = Math.sqrt(disc);
  const a1 = Math.atan((v2 - root) / (g * dx)) / RAD;
  const a2 = Math.atan((v2 + root) / (g * dx)) / RAD;
  return root < 1e-9 ? [a1] : [a1, a2];
}

/** Kleinste Abwurfgeschwindigkeit, mit der ein Ziel (dx, dy) erreichbar ist: v² = g·(dy + √(dx² + dy²)). */
export function minSpeed(dx: number, dy: number, g: number): number {
  return Math.sqrt(g * (dy + Math.hypot(dx, dy)));
}

/**
 * Bahn mit Luftwiderstand: a = −k·|v|·v − g. Liefert Stützstellen im Abstand
 * `dt` bis zum Aufprall und die Flugdaten.
 */
export function dragFlight(launch: Launch, k: number, dt = 0.002): { samples: FlightState[]; flight: Flight } {
  const { vx, vy } = components(launch);
  const g = launch.g;
  const start: FlightState = { t: 0, x: 0, y: launch.h0, vx, vy };
  // Vom Boden aus waagerecht oder nach unten: kein Flug
  if (launch.h0 <= 0 && vy <= 0) {
    return { samples: [start], flight: { time: 0, range: 0, maxHeight: Math.max(0, launch.h0), apexTime: 0, impact: start } };
  }
  const f = (_t: number, s: readonly number[]) => {
    const speed = Math.hypot(s[2]!, s[3]!);
    return [s[2]!, s[3]!, -k * speed * s[2]!, -g - k * speed * s[3]!];
  };
  let state = [0, launch.h0, vx, vy];
  let t = 0;
  const samples: FlightState[] = [start];
  let apex = start;
  for (let i = 0; i < 400_000; i++) {
    const next = rk4(f, t, state, dt);
    const tn = t + dt;
    if (next[1]! <= 0) {
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

/** Wurfweite mit oder ohne Luftwiderstand (k = 0: geschlossene Formel). */
export function rangeWith(launch: Launch, k: number, dt = 0.005): number {
  if (k <= 0) return vacuumFlight(launch).range;
  return dragFlight(launch, k, dt).flight.range;
}

/**
 * Bester Abwurfwinkel (größte Wurfweite) – auch mit Luftwiderstand, durch
 * Suche mit dem goldenen Schnitt im Bereich 0° … 89°.
 */
export function optimalAngleWith(v0: number, h0: number, g: number, k: number): { angle: number; range: number } {
  if (k <= 0) {
    const angle = optimalAngle(v0, h0, g);
    return { angle, range: maxRange(v0, h0, g) };
  }
  const R = (a: number) => rangeWith({ v0, angle: a, h0, g }, k);
  const phi = (Math.sqrt(5) - 1) / 2;
  let lo = 0;
  let hi = 89;
  let c = hi - phi * (hi - lo);
  let d = lo + phi * (hi - lo);
  let fc = R(c);
  let fd = R(d);
  for (let i = 0; i < 40 && hi - lo > 0.02; i++) {
    if (fc > fd) {
      hi = d;
      d = c;
      fd = fc;
      c = hi - phi * (hi - lo);
      fc = R(c);
    } else {
      lo = c;
      c = d;
      fc = fd;
      d = lo + phi * (hi - lo);
      fd = R(d);
    }
  }
  const angle = (lo + hi) / 2;
  return { angle, range: R(angle) };
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

/** Bahngeschwindigkeit |v| = √(vₓ² + v_y²). */
export function speedOf(s: FlightState): number {
  return Math.hypot(s.vx, s.vy);
}

/** Mechanische Energie pro Kilogramm: E/m = ½·v² + g·y (in J/kg). */
export function specificEnergy(s: FlightState, g: number): number {
  return 0.5 * (s.vx * s.vx + s.vy * s.vy) + g * s.y;
}

/** Richtung der Bewegung gegen die Waagerechte in Grad (positiv: steigend). */
export function directionOf(s: FlightState): number {
  return Math.atan2(s.vy, s.vx) / RAD;
}

/* ---------- Zielwurf ---------- */

export type ShotResult = 'hit' | 'short' | 'long';

/** Radius der Zielscheibe in m (wächst leicht mit der Entfernung). */
export function targetRadius(tx: number): number {
  return 0.4 + 0.02 * Math.abs(tx);
}

/**
 * Wurf auf eine senkrechte Zielscheibe (Mitte bei x = tx, y = ty, Radius r)
 * auswerten. `state(t)` liefert den Zustand des Balls, `T` ist die Flugzeit.
 * „short“: Ball landet vorher oder fliegt unter der Scheibe durch,
 * „long“: Ball fliegt über die Scheibe hinweg.
 */
export function judgeShot(state: (t: number) => FlightState, T: number, tx: number, ty: number, r = targetRadius(tx)): { result: ShotResult; t: number; y: number } {
  const end = state(T);
  if (end.x < tx) return { result: 'short', t: T, y: end.y };
  // x(t) wächst monoton (vₓ > 0, auch mit Luftwiderstand) → Bisektion
  let lo = 0;
  let hi = T;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (state(mid).x < tx) lo = mid;
    else hi = mid;
  }
  const s = state(hi);
  const d = s.y - ty;
  return { result: Math.abs(d) <= r ? 'hit' : d > 0 ? 'long' : 'short', t: hi, y: s.y };
}

/**
 * Zufälliges Ziel, das sich mit Reglerwerten (v₀ in 0,5-m/s-Schritten, α in
 * ganzen Grad) treffen lässt. `rand` liefert Zufallszahlen in [0, 1).
 * Ergebnis: Lage des Ziels (auf 0,5 m gerundet) und eine mögliche Lösung.
 */
export function randomTarget(rand: () => number, g: number, h0: number): { tx: number; ty: number; v0: number; angle: number } {
  // Größte sinnvolle Geschwindigkeit, damit das Ziel höchstens ca. 120 m entfernt ist
  const vMax = Math.min(30, Math.sqrt(120 * g) * 0.95);
  const vMin = Math.min(8, vMax * 0.5);
  for (let i = 0; i < 400; i++) {
    const v0 = Math.round((vMin + rand() * (vMax - vMin)) * 2) / 2;
    const angle = Math.round(12 + rand() * 58);
    const launch: Launch = { v0, angle, h0, g };
    const f = vacuumFlight(launch);
    const s = vacuumState(launch, f.time * (0.5 + 0.42 * rand()));
    const tx = Math.round(s.x * 2) / 2;
    const ty = Math.round(s.y * 2) / 2;
    if (tx < 4 || tx > 150 || ty < 0.5 || ty > 30) continue;
    if (judgeShot((t) => vacuumState(launch, t), f.time, tx, ty).result === 'hit') return { tx, ty, v0, angle };
  }
  return { tx: 20, ty: 2, v0: 15, angle: 35 };
}

/** Blitzabstand des Stroboskops: höchstens etwa 30 Bilder pro Flug. */
export function strobeInterval(T: number): number {
  for (const dt of [0.1, 0.2, 0.25, 0.5, 1, 2]) if (T / dt <= 30) return dt;
  return 5;
}
