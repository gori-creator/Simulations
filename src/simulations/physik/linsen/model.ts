/**
 * Rechenlogik „Linsen und Bildentstehung“ (dünne Linse, achsennahe Strahlen).
 *
 * Konvention wie im Schulunterricht: Die Linse steht bei x = 0, der
 * Gegenstand links davon im Abstand g > 0 (Gegenstandsweite). Die Brennweite f
 * ist bei Sammellinsen positiv, bei Zerstreuungslinsen negativ. Die Bildweite b
 * ist positiv für reelle Bilder rechts der Linse und negativ für virtuelle
 * Bilder (auf der Seite des Gegenstands). Längen in cm.
 */

export interface LensImage {
  /** Bildweite b (∞, wenn g = f). */
  b: number;
  /** Bildgröße B mit Vorzeichen (negativ = umgekehrt). */
  B: number;
  /** Abbildungsmaßstab A = |B| / G = |b| / g. */
  scale: number;
  real: boolean;
  inverted: boolean;
  /** Kein Bild: Die Strahlen verlaufen nach der Linse parallel (g = f). */
  none: boolean;
}

/** Linsengleichung 1/f = 1/g + 1/b, nach b aufgelöst. */
export function imageDistance(f: number, g: number): number {
  if (Math.abs(g - f) < 1e-9) return Infinity;
  return (f * g) / (g - f);
}

/** Bild eines Gegenstands der Höhe G im Abstand g vor einer Linse mit Brennweite f. */
export function lensImage(f: number, g: number, G: number): LensImage {
  const b = imageDistance(f, g);
  if (!Number.isFinite(b)) return { b, B: Infinity, scale: Infinity, real: false, inverted: false, none: true };
  const B = (-G * b) / g;
  return { b, B, scale: Math.abs(b / g), real: b > 0, inverted: B < 0, none: false };
}

/** Brennweite, die zu Gegenstandsweite g und Bildweite b gehört (z. B. Akkommodation des Auges). */
export function focalFor(g: number, b: number): number {
  return (g * b) / (g + b);
}

export type CaseId = 'far' | 'twoF' | 'between' | 'focus' | 'inside' | 'diverging';

/** Welcher der typischen Fälle liegt vor? (Sammellinse: Lage von g zu f und 2f) */
export function imageCase(f: number, g: number, tol = 1e-6): CaseId {
  if (f < 0) return 'diverging';
  if (Math.abs(g - 2 * f) <= tol) return 'twoF';
  if (Math.abs(g - f) <= tol) return 'focus';
  if (g > 2 * f) return 'far';
  if (g > f) return 'between';
  return 'inside';
}

/**
 * Strahl durch eine dünne Linse (achsennah): Ein Strahl, der die Linse in der
 * Höhe y mit der Steigung m trifft, verlässt sie mit der Steigung m − y / f.
 * Daher treffen sich alle Strahlen eines Punktes im Bildpunkt.
 */
export function refractSlope(m: number, y: number, f: number): number {
  return m - y / f;
}

/**
 * Lichtbündel von einem Punkt (x0 | y0) durch die Linse auf einen Schirm bei
 * x = s: Höhe, in der der Strahl durch die Linsenhöhe yl den Schirm trifft.
 */
export function rayAtScreen(x0: number, y0: number, yl: number, f: number, s: number): number {
  const m = (yl - y0) / (0 - x0);
  return yl + refractSlope(m, yl, f) * s;
}

/**
 * Radius des Unschärfekreises auf dem Schirm bei x = s für ein Bündel, das die
 * Linse mit dem Radius `aperture` ausfüllt und sich im Bildpunkt (Weite b)
 * trifft. Bei virtuellem Bild oder ohne Bild wird der Fleck mit wachsendem s
 * immer größer.
 */
export function blurRadius(aperture: number, b: number, s: number): number {
  if (!Number.isFinite(b)) return aperture;
  return (aperture * Math.abs(s - b)) / Math.abs(b);
}

/**
 * Schnittpunkt der Konstruktionsstrahlen (zur Kontrolle): Parallelstrahl
 * durch F′ und Mittelpunktstrahl treffen sich im Bildpunkt (b | B).
 */
export function constructionIntersection(f: number, g: number, G: number): [number, number] | null {
  // Parallelstrahl nach der Linse: y = G − G/f · x ; Mittelpunktstrahl: y = −G/g · x
  const k1 = -G / f;
  const k2 = -G / g;
  if (Math.abs(k1 - k2) < 1e-12) return null;
  const x = G / (k2 - k1);
  return [x, k2 * x];
}
