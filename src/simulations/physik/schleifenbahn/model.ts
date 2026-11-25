/**
 * Schleifenbahnen der Planeten: Kreisbahnen um die Sonne (mit kleiner
 * Bahnneigung), Blick von der Erde aus auf den Sternhimmel.
 * Längen in AE, Zeiten in Jahren, Winkel in Grad.
 */

export interface Planet {
  id: string;
  /** Bahnradius in AE. */
  a: number;
  /** Umlaufzeit in Jahren. */
  T: number;
  /** Bahnneigung gegen die Ekliptik in °. */
  inc: number;
}

export const PLANETS: Record<string, Planet> = {
  venus: { id: 'venus', a: 0.723, T: 0.615, inc: 3.39 },
  mars: { id: 'mars', a: 1.524, T: 1.881, inc: 1.85 },
  jupiter: { id: 'jupiter', a: 5.203, T: 11.86, inc: 1.3 },
  saturn: { id: 'saturn', a: 9.537, T: 29.46, inc: 2.49 },
};

const RAD = Math.PI / 180;
/** Zeitpunkt (in Jahren), an dem Planet, Erde und Sonne auf einer Linie stehen. */
export const T_ALIGN = 0.5;

export type Vec3 = [number, number, number];

export function earthPos(t: number): Vec3 {
  const a = 2 * Math.PI * t;
  return [Math.cos(a), Math.sin(a), 0];
}

/** Bahnwinkel so gewählt, dass zur Zeit T_ALIGN Sonne, Erde, Planet auf einer Linie liegen. */
export function planetPos(p: Planet, t: number): Vec3 {
  const th = Math.PI + (2 * Math.PI * (t - T_ALIGN)) / p.T;
  const i = p.inc * RAD;
  // Knotenlinie senkrecht zur Linie Sonne–Erde zur Zeit T_ALIGN: Dort ist der Planet
  // am weitesten über der Ekliptik, und die Rückwärtsbewegung wird zur Schleife.
  const x = p.a * Math.cos(th);
  const y = p.a * Math.sin(th);
  return [x * Math.cos(i), y, -x * Math.sin(i)];
}

/** Ekliptikale Länge und Breite des Planeten von der Erde aus (°). */
export function geocentric(p: Planet, t: number): { lon: number; lat: number } {
  const e = earthPos(t);
  const q = planetPos(p, t);
  const d: Vec3 = [q[0] - e[0], q[1] - e[1], q[2] - e[2]];
  const lon = (Math.atan2(d[1], d[0]) / RAD + 360) % 360;
  const lat = Math.atan2(d[2], Math.hypot(d[0], d[1])) / RAD;
  return { lon, lat };
}

/** Winkelabstand des Planeten von der Sonne am Himmel (Elongation, °). */
export function elongation(p: Planet, t: number): number {
  const e = earthPos(t);
  const q = planetPos(p, t);
  const toSun: Vec3 = [-e[0], -e[1], -e[2]];
  const toP: Vec3 = [q[0] - e[0], q[1] - e[1], q[2] - e[2]];
  const dot = toSun[0] * toP[0] + toSun[1] * toP[1] + toSun[2] * toP[2];
  const c = dot / (Math.hypot(...toSun) * Math.hypot(...toP));
  return Math.acos(Math.max(-1, Math.min(1, c))) / RAD;
}

/** Änderung der Länge pro Jahr (°/a, Vorzeichen: + rechtläufig, − rückläufig). */
export function lonRate(p: Planet, t: number, h = 1e-3): number {
  let d = geocentric(p, t + h).lon - geocentric(p, t - h).lon;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d / (2 * h);
}

/** Synodische Periode in Jahren: 1/S = |1/1 − 1/T|. */
export function synodic(p: Planet): number {
  return 1 / Math.abs(1 - 1 / p.T);
}
