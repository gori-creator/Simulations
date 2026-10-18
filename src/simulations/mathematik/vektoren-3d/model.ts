/**
 * Rechenlogik für „Vektoren addieren und vervielfachen (3D)“: Summe,
 * Differenz, Vielfaches, Linearkombination, Verbindungsvektor, Betrag,
 * Mittelpunkt und Kollinearität. Keine Zeichenbefehle.
 */

export type V3 = readonly [number, number, number];

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const neg = (a: V3): V3 => scale(a, -1);

/** Betrag (Länge) |a| = √(a₁² + a₂² + a₃²). */
export const norm = (a: V3): number => Math.hypot(a[0], a[1], a[2]);

/** Summe der Quadrate (für die Anzeige √…). */
export const normSq = (a: V3): number => a[0] * a[0] + a[1] * a[1] + a[2] * a[2];

/** Linearkombination r · a + s · b. */
export const linComb = (r: number, a: V3, s: number, b: V3): V3 => add(scale(a, r), scale(b, s));

/** Verbindungsvektor AB = B − A (Spitze minus Fuß). */
export const between = (A: V3, B: V3): V3 => sub(B, A);

/** Mittelpunkt der Strecke AB: M = ½ (A + B). */
export const midpoint = (A: V3, B: V3): V3 => scale(add(A, B), 0.5);

export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Sind a und b kollinear (parallel oder einer der Nullvektor)? */
export function collinear(a: V3, b: V3, eps = 1e-9): boolean {
  return norm(cross(a, b)) < eps * Math.max(1, norm(a) * norm(b));
}

/**
 * Faktor k mit b = k · a, falls b ein Vielfaches von a ist (a ≠ o), sonst null.
 */
export function multipleOf(a: V3, b: V3, eps = 1e-9): number | null {
  if (norm(a) < eps || !collinear(a, b, eps)) return null;
  const i = [0, 1, 2].reduce((m, j) => (Math.abs(a[j]!) > Math.abs(a[m]!) ? j : m), 0);
  return b[i]! / a[i]!;
}

export const isZero = (a: V3, eps = 1e-9): boolean => norm(a) < eps;

/** Einheitsvektor a / |a| (Nullvektor bleibt Nullvektor). */
export function unit(a: V3): V3 {
  const l = norm(a);
  return l < 1e-12 ? [0, 0, 0] : scale(a, 1 / l);
}

/**
 * Löst r · a + s · b = c (falls c in der von a und b aufgespannten Ebene
 * liegt und a, b nicht kollinear sind); sonst null. Methode der kleinsten
 * Quadrate über die Gramsche Matrix, danach Probe.
 */
export function solveLinComb(a: V3, b: V3, c: V3, eps = 1e-7): { r: number; s: number } | null {
  const aa = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
  const bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
  const ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const ac = a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
  const bc = b[0] * c[0] + b[1] * c[1] + b[2] * c[2];
  const det = aa * bb - ab * ab;
  if (Math.abs(det) < eps) return null;
  const r = (ac * bb - bc * ab) / det;
  const s = (aa * bc - ab * ac) / det;
  const back = linComb(r, a, s, b);
  return norm(sub(back, c)) < eps * Math.max(1, norm(c)) ? { r, s } : null;
}

/** Kleiner deterministischer Zufall für „Neue Vektoren“: ganzzahlige Komponenten in [−r, r]. */
export function randomVec(seed: number, r = 3): V3 {
  const f = (k: number) => {
    const u = Math.sin((seed * 3 + k) * 12.9898 + 78.233) * 43758.5453;
    return Math.round((u - Math.floor(u)) * 2 * r - r);
  };
  const v: V3 = [f(0), f(1), f(2)];
  return isZero(v) ? [1, 2, 1] : v;
}
