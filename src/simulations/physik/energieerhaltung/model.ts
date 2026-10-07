/**
 * Rechenlogik „Energieerhaltung an der Achterbahn“.
 *
 * Die Bahn ist eine Kurve in der Ebene, parametrisiert über die Bogenlänge s.
 * Der Wagen bewegt sich entlang der Bahn:
 *   s'' = −g·sin θ − μ·|N|·sign(s')   mit   N = g·cos θ + v²·κ
 * (θ: Steigungswinkel, κ: Krümmung, N: Normalbeschleunigung durch die Schiene).
 */
import { rk4 } from '../../../sim-core/numeric';

export type TrackId = 'tal' | 'huegel' | 'looping';

export interface TrackPoint {
  x: number;
  y: number;
  /** Bogenlänge ab dem Anfang in m. */
  s: number;
  /** Steigungswinkel der Tangente (Bogenmaß). */
  theta: number;
  /** Krümmung dθ/ds in 1/m (positiv = Linkskurve). */
  kappa: number;
}

export class Track {
  readonly points: TrackPoint[];
  readonly length: number;

  constructor(raw: readonly (readonly [number, number])[]) {
    const pts: TrackPoint[] = [];
    let s = 0;
    raw.forEach(([x, y], i) => {
      if (i > 0) {
        const [px, py] = raw[i - 1]!;
        s += Math.hypot(x - px, y - py);
      }
      pts.push({ x, y, s, theta: 0, kappa: 0 });
    });
    // Tangentenwinkel (stetig fortgesetzt, damit der Looping keine Sprünge hat)
    let previous = 0;
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)]!;
      const b = pts[Math.min(pts.length - 1, i + 1)]!;
      let theta = Math.atan2(b.y - a.y, b.x - a.x);
      if (i > 0) while (theta - previous > Math.PI) theta -= 2 * Math.PI;
      if (i > 0) while (theta - previous < -Math.PI) theta += 2 * Math.PI;
      p.theta = theta;
      previous = theta;
    });
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)]!;
      const b = pts[Math.min(pts.length - 1, i + 1)]!;
      p.kappa = b.s > a.s ? (b.theta - a.theta) / (b.s - a.s) : 0;
    });
    this.points = pts;
    this.length = s;
  }

  /** Index des Abschnitts, in dem s liegt (binäre Suche). */
  private index(s: number): number {
    const pts = this.points;
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid]!.s <= s) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  /** Lage, Steigungswinkel und Krümmung an der Stelle s. */
  at(s: number): Omit<TrackPoint, 's'> {
    const pts = this.points;
    const clamped = Math.min(this.length, Math.max(0, s));
    const i = this.index(clamped);
    const a = pts[i]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    const u = b.s > a.s ? (clamped - a.s) / (b.s - a.s) : 0;
    return {
      x: a.x + u * (b.x - a.x),
      y: a.y + u * (b.y - a.y),
      theta: a.theta + u * (b.theta - a.theta),
      kappa: a.kappa + u * (b.kappa - a.kappa),
    };
  }

  /** Erste Stelle (von links), an der die Bahn die Höhe h erreicht bzw. unterschreitet. */
  startAt(h: number): number {
    const pts = this.points;
    if (pts[0]!.y <= h) return 0;
    for (let i = 1; i < pts.length; i++) {
      const b = pts[i]!;
      if (b.y <= h) {
        const a = pts[i - 1]!;
        const u = (a.y - h) / (a.y - b.y || 1);
        return a.s + u * (b.s - a.s);
      }
    }
    return 0;
  }

  get maxHeight(): number {
    return Math.max(...this.points.map((p) => p.y));
  }

  get minHeight(): number {
    return Math.min(...this.points.map((p) => p.y));
  }
}

/** Hermite-Kurve zwischen zwei Punkten mit waagerechten Enden. */
function smoothStep(x0: number, y0: number, x1: number, y1: number, n: number): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * (3 * u * u - 2 * u * u * u)];
  });
}

/** Catmull-Rom-Spline durch Kontrollpunkte. */
function catmullRom(points: readonly (readonly [number, number])[], perSegment: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    for (let j = 0; j < perSegment; j++) {
      const t = j / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, c2: number, d: number) =>
        0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push([...points[points.length - 1]!] as [number, number]);
  return out;
}

/** Radius des Loopings in m. */
export const LOOP_RADIUS = 6;

export function buildTrack(id: TrackId): Track {
  switch (id) {
    case 'tal':
      return new Track(Array.from({ length: 801 }, (_, i) => {
        const x = -20 + (40 * i) / 800;
        return [x, 20 * (x / 20) ** 2] as [number, number];
      }));
    case 'huegel':
      return new Track(
        catmullRom(
          [
            [-36, 24],
            [-31, 21],
            [-24, 9],
            [-16, 0.5],
            [-8, 6],
            [-2, 11],
            [4, 7],
            [11, 1],
            [17, 4],
            [23, 9],
            [28, 16],
            [31, 24],
          ],
          80,
        ),
      );
    case 'looping': {
      const r = LOOP_RADIUS;
      const drift = 3;
      const approach = smoothStep(-40, 26, 0, 0, 500);
      const loop: [number, number][] = Array.from({ length: 600 }, (_, i) => {
        const phi = (2 * Math.PI * (i + 1)) / 600;
        return [r * Math.sin(phi) + (drift * phi) / (2 * Math.PI), r * (1 - Math.cos(phi))];
      });
      const flat: [number, number][] = Array.from({ length: 60 }, (_, i) => [drift + (12 * (i + 1)) / 60, 0]);
      const ramp = smoothStep(drift + 12, 0, drift + 40, 22, 400).slice(1);
      return new Track([...approach, ...loop, ...flat, ...ramp]);
    }
  }
}

export interface CartState {
  /** Bogenlänge in m. */
  s: number;
  /** Geschwindigkeit entlang der Bahn in m/s. */
  v: number;
  /** Bisher durch Reibung umgewandelte Energie pro kg (J/kg). */
  w: number;
}

/** Normalbeschleunigung durch die Schiene (m/s²). Negativ: Wagen würde ohne Sicherung abheben. */
export function normalAcceleration(track: Track, s: number, v: number, g: number): number {
  const p = track.at(s);
  return g * Math.cos(p.theta) + v * v * p.kappa;
}

/** Ein Zeitschritt der Bewegung. */
export function stepCart(track: Track, state: CartState, g: number, mu: number, h: number): CartState {
  const f = (_t: number, y: readonly number[]) => {
    const p = track.at(y[0]!);
    const n = Math.abs(g * Math.cos(p.theta) + y[1]! * y[1]! * p.kappa);
    const friction = mu * n;
    return [y[1]!, -g * Math.sin(p.theta) - friction * Math.sign(y[1]!), friction * Math.abs(y[1]!)];
  };
  const next = rk4(f, 0, [state.s, state.v, state.w], h);
  let [s, v, w] = next as [number, number, number];
  // Haftreibung: bei fast ruhendem Wagen auf flachem Stück stehen bleiben
  if (mu > 0 && Math.sign(v) !== Math.sign(state.v) && state.v !== 0) {
    const p = track.at(s);
    if (Math.abs(g * Math.sin(p.theta)) <= mu * Math.abs(g * Math.cos(p.theta))) v = 0;
  }
  if (mu > 0 && state.v === 0) {
    const p = track.at(s);
    if (Math.abs(g * Math.sin(p.theta)) <= mu * Math.abs(g * Math.cos(p.theta))) return { s: state.s, v: 0, w: state.w };
  }
  // Prellböcke an den Enden: Restenergie wird beim Aufprall umgewandelt
  if (s < 0 || s > track.length) {
    s = Math.min(track.length, Math.max(0, s));
    w += 0.5 * v * v;
    v = 0;
  }
  return { s, v, w };
}
