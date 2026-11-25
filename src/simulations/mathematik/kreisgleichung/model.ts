/**
 * Kreise in der Ebene: Kreisgleichung (x − a)² + (y − b)² = r², Lage von
 * Punkt, Gerade und zweitem Kreis zum Kreis sowie Tangenten.
 */

export type Pt = [number, number];
const EPS = 1e-9;

/** Koeffizienten der allgemeinen Form x² + y² + D·x + E·y + F = 0. */
export function generalForm(a: number, b: number, r: number): { D: number; E: number; F: number } {
  return { D: -2 * a, E: -2 * b, F: a * a + b * b - r * r };
}

/** Mittelpunkt und Radius aus der allgemeinen Form; null, wenn es kein Kreis ist. */
export function fromGeneral(D: number, E: number, F: number): { a: number; b: number; r: number } | null {
  const a = -D / 2;
  const b = -E / 2;
  const r2 = a * a + b * b - F;
  return r2 > EPS ? { a, b, r: Math.sqrt(r2) } : null;
}

export type PointPos = 'in' | 'on' | 'out';

export function pointPosition(a: number, b: number, r: number, px: number, py: number): { d: number; value: number; pos: PointPos } {
  const value = (px - a) ** 2 + (py - b) ** 2;
  const d = Math.sqrt(value);
  const pos: PointPos = Math.abs(value - r * r) < 1e-7 ? 'on' : value < r * r ? 'in' : 'out';
  return { d, value, pos };
}

export type LineKind = 'secant' | 'tangent' | 'passant';

/** Gerade y = m·x + n und Kreis: Abstand, Diskriminante, Schnittpunkte. */
export function lineCircle(a: number, b: number, r: number, m: number, n: number): { d: number; disc: number; kind: LineKind; points: Pt[] } {
  const A = 1 + m * m;
  const B = 2 * (m * (n - b) - a);
  const C = a * a + (n - b) ** 2 - r * r;
  const disc = B * B - 4 * A * C;
  const d = Math.abs(m * a - b + n) / Math.sqrt(A);
  if (Math.abs(disc) < 1e-7) {
    const x = -B / (2 * A);
    return { d, disc: 0, kind: 'tangent', points: [[x, m * x + n]] };
  }
  if (disc < 0) return { d, disc, kind: 'passant', points: [] };
  const s = Math.sqrt(disc);
  const x1 = (-B - s) / (2 * A);
  const x2 = (-B + s) / (2 * A);
  return { d, disc, kind: 'secant', points: [[x1, m * x1 + n], [x2, m * x2 + n]] };
}

export type CirclesKind = 'apart' | 'touchOut' | 'cut' | 'touchIn' | 'inside' | 'same' | 'concentric';

/** Lage zweier Kreise (M₁, r₁) und (M₂, r₂) mit Schnittpunkten. */
export function circleCircle(a: number, b: number, r: number, c: number, e: number, s: number): { D: number; kind: CirclesKind; points: Pt[] } {
  const dx = c - a;
  const dy = e - b;
  const D = Math.hypot(dx, dy);
  const tol = 1e-7;
  if (D < tol) return { D, kind: Math.abs(r - s) < tol ? 'same' : 'concentric', points: [] };
  const sum = r + s;
  const diff = Math.abs(r - s);
  let kind: CirclesKind;
  if (D > sum + tol) kind = 'apart';
  else if (Math.abs(D - sum) <= tol) kind = 'touchOut';
  else if (D < diff - tol) kind = 'inside';
  else if (Math.abs(D - diff) <= tol) kind = 'touchIn';
  else kind = 'cut';
  if (kind === 'apart' || kind === 'inside') return { D, kind, points: [] };
  // Abstand vom Mittelpunkt M₁ zum Fußpunkt auf der Verbindungsstrecke
  const l = (r * r - s * s + D * D) / (2 * D);
  const h2 = r * r - l * l;
  const h = h2 > 0 ? Math.sqrt(h2) : 0;
  const fx = a + (l * dx) / D;
  const fy = b + (l * dy) / D;
  if (h < 1e-6) return { D, kind, points: [[fx, fy]] };
  return {
    D,
    kind,
    points: [
      [fx + (h * -dy) / D, fy + (h * dx) / D],
      [fx - (h * -dy) / D, fy - (h * dx) / D],
    ],
  };
}

/** Berührpunkte der Tangenten von P an den Kreis (0, 1 oder 2 Punkte). */
export function tangentPoints(a: number, b: number, r: number, px: number, py: number): Pt[] {
  const { d, pos } = pointPosition(a, b, r, px, py);
  if (pos === 'in') return [];
  if (pos === 'on') return [[px, py]];
  const phi = Math.atan2(py - b, px - a);
  const alpha = Math.acos(r / d);
  return [
    [a + r * Math.cos(phi + alpha), b + r * Math.sin(phi + alpha)],
    [a + r * Math.cos(phi - alpha), b + r * Math.sin(phi - alpha)],
  ];
}

/**
 * Tangente im Berührpunkt T: (x − a)(t₁ − a) + (y − b)(t₂ − b) = r².
 * Rückgabe als Gerade y = k·x + c oder senkrecht x = c.
 */
export function tangentAt(a: number, b: number, t: Pt): { vertical: true; c: number } | { vertical: false; k: number; c: number } {
  const ux = t[0] - a;
  const uy = t[1] - b;
  if (Math.abs(uy) < 1e-9) return { vertical: true, c: t[0] };
  const k = -ux / uy;
  return { vertical: false, k, c: t[1] - k * t[0] };
}
