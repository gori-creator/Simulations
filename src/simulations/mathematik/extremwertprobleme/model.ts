/**
 * Rechenlogik „Extremwertprobleme“ (Jgst. 13).
 *
 * Vorgehen: Zielfunktion aufstellen, mit der Nebenbedingung auf eine
 * Variable reduzieren, Definitionsbereich angeben, Ableitung null setzen,
 * Art des Extremums prüfen und die Randwerte vergleichen.
 *
 * - Schachtel: Aus einem Karton a × b werden an den Ecken Quadrate der
 *   Seitenlänge x ausgeschnitten: V(x) = x(a − 2x)(b − 2x), 0 < x < min(a, b)/2.
 * - Dose: Zylinder mit festem Volumen V; Oberfläche O(r) = 2πr² + 2V/r, r > 0.
 * - Rechteck unter f(x) = 3e^(−0,5x): A(u) = u · f(u), u > 0.
 * - Zylinder im Kegel (Radius R, Höhe H): V(r) = πr² · H(1 − r/R), 0 < r < R.
 * - Rettungsschwimmer: a m Sand bis zum Ufer, b m Wasser, seitlicher Abstand
 *   d; Laufen mit v₁, Schwimmen mit v₂. Zeit
 *   T(x) = √(a² + x²)/v₁ + √(b² + (d − x)²)/v₂, 0 ≤ x ≤ d.
 *   Im Optimum gilt das Brechungsgesetz sin α₁ / v₁ = sin α₂ / v₂.
 */

export type ProbKey = 'box' | 'can' | 'rect' | 'cone' | 'life';

export interface Box {
  a: number;
  b: number;
}

export function boxVolume(p: Box, x: number): number {
  return x * (p.a - 2 * x) * (p.b - 2 * x);
}
export function boxDeriv(p: Box, x: number): number {
  // V(x) = 4x³ − 2(a + b)x² + abx
  return 12 * x * x - 4 * (p.a + p.b) * x + p.a * p.b;
}
/** Maximalstelle im Definitionsbereich (kleinere Nullstelle von V′). */
export function boxOptimum(p: Box): number {
  const s = p.a + p.b;
  return (s - Math.sqrt(s * s - 3 * p.a * p.b)) / 6;
}

export function canSurface(V: number, r: number): number {
  return 2 * Math.PI * r * r + (2 * V) / r;
}
export function canHeight(V: number, r: number): number {
  return V / (Math.PI * r * r);
}
export function canDeriv(V: number, r: number): number {
  return 4 * Math.PI * r - (2 * V) / (r * r);
}
export function canOptimum(V: number): number {
  return Math.cbrt(V / (2 * Math.PI));
}

export const rectF = (x: number) => 3 * Math.exp(-0.5 * x);
export function rectArea(u: number): number {
  return u * rectF(u);
}
export function rectDeriv(u: number): number {
  return rectF(u) * (1 - 0.5 * u);
}
export const rectOptimum = 2;

/* ---------- Zylinder im Kegel ---------- */

export interface Cone {
  R: number;
  H: number;
}
/** Höhe des einbeschriebenen Zylinders (Strahlensatz). */
export function coneCylHeight(c: Cone, r: number): number {
  return c.H * (1 - r / c.R);
}
export function coneVolume(c: Cone, r: number): number {
  return Math.PI * r * r * coneCylHeight(c, r);
}
export function coneDeriv(c: Cone, r: number): number {
  // V(r) = πH(r² − r³/R)  ⇒  V′(r) = πH(2r − 3r²/R)
  return Math.PI * c.H * (2 * r - (3 * r * r) / c.R);
}
export function coneOptimum(c: Cone): number {
  return (2 * c.R) / 3;
}

/* ---------- Rettungsschwimmer ---------- */

export interface Life {
  /** Abstand zum Ufer auf dem Sand (m) */
  a: number;
  /** Abstand der Person im Wasser vom Ufer (m) */
  b: number;
  /** seitlicher Abstand (m) */
  d: number;
  /** Laufgeschwindigkeit (m/s) */
  v1: number;
  /** Schwimmgeschwindigkeit (m/s) */
  v2: number;
}
export function lifeTime(l: Life, x: number): number {
  return Math.hypot(l.a, x) / l.v1 + Math.hypot(l.b, l.d - x) / l.v2;
}
export function lifeDeriv(l: Life, x: number): number {
  return x / (l.v1 * Math.hypot(l.a, x)) - (l.d - x) / (l.v2 * Math.hypot(l.b, l.d - x));
}
/** Optimum per Bisektion: T′ wächst streng, T′(0) < 0 < T′(d). */
export function lifeOptimum(l: Life): number {
  let lo = 0;
  let hi = l.d;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    if (lifeDeriv(l, m) < 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
/** sin α₁ und sin α₂ (Winkel zum Lot auf die Uferlinie). */
export function lifeSines(l: Life, x: number): [number, number] {
  return [x / Math.hypot(l.a, x), (l.d - x) / Math.hypot(l.b, l.d - x)];
}

/* ---------- allgemein ---------- */

/** Zweite Ableitung numerisch aus der ersten (zur Art des Extremums). */
export function secondDeriv(d: (x: number) => number, x: number, h = 1e-4): number {
  return (d(x + h) - d(x - h)) / (2 * h);
}
