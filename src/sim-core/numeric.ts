/**
 * Numerische Hilfsfunktionen für Simulationen.
 */

/** Begrenzt `value` auf [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Lineare Interpolation zwischen a und b. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Winkel in Grad → Bogenmaß. */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Bogenmaß → Grad. */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Rest im Bereich [0, m), auch für negative Zahlen. */
export function mod(value: number, m: number): number {
  return ((value % m) + m) % m;
}

export function nearlyEqual(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

/** Ersetzt −0 durch 0 (sonst erscheint „−0“ in Anzeigen). */
const noNegativeZero = (value: number) => (value === 0 ? 0 : value);

/** Reelle Lösungen von a·x² + b·x + c = 0 (aufsteigend sortiert). */
export function solveQuadratic(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) return [];
    return [noNegativeZero(-c / b)];
  }
  const disc = b * b - 4 * a * c;
  if (disc < -1e-12) return [];
  if (Math.abs(disc) <= 1e-12) return [noNegativeZero(-b / (2 * a))];
  const root = Math.sqrt(disc);
  // numerisch stabile Variante (vermeidet Auslöschung)
  const q = -0.5 * (b + Math.sign(b || 1) * root);
  return [q / a, c / q].map(noNegativeZero).sort((p, s) => p - s);
}

export type Derivative = (t: number, y: readonly number[]) => number[];

/**
 * Ein Schritt des klassischen Runge-Kutta-Verfahrens 4. Ordnung für
 * y' = f(t, y). Gut geeignet für Pendel, Federn, Planetenbahnen usw.
 */
export function rk4(f: Derivative, t: number, y: readonly number[], h: number): number[] {
  const k1 = f(t, y);
  const k2 = f(t + h / 2, y.map((yi, i) => yi + (h / 2) * k1[i]!));
  const k3 = f(t + h / 2, y.map((yi, i) => yi + (h / 2) * k2[i]!));
  const k4 = f(t + h, y.map((yi, i) => yi + h * k3[i]!));
  return y.map((yi, i) => yi + (h / 6) * (k1[i]! + 2 * k2[i]! + 2 * k3[i]! + k4[i]!));
}
