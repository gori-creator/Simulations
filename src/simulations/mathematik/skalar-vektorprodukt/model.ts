/**
 * Rechenlogik für „Skalarprodukt und Vektorprodukt“: Skalarprodukt,
 * Winkel zwischen Vektoren, Orthogonalität, Projektion, Vektorprodukt mit
 * Parallelogramm- und Dreiecksfläche, Spatprodukt mit Volumen von Spat und
 * Pyramide. Keine Zeichenbefehle.
 */

export type V3 = readonly [number, number, number];

export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** Vektorprodukt a × b = (a₂b₃ − a₃b₂, a₃b₁ − a₁b₃, a₁b₂ − a₂b₁). */
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Einzelne Produkte für die Rechnung „über Kreuz“ (je Komponente: Minuend, Subtrahend). */
export function crossTerms(a: V3, b: V3): [number, number][] {
  return [
    [a[1] * b[2], a[2] * b[1]],
    [a[2] * b[0], a[0] * b[2]],
    [a[0] * b[1], a[1] * b[0]],
  ];
}

/**
 * Winkel zwischen a und b in Grad (0° … 180°) aus cos φ = a·b / (|a|·|b|).
 * Null bei einem Nullvektor (Winkel nicht definiert → NaN).
 */
export function angleDeg(a: V3, b: V3): number {
  const l = norm(a) * norm(b);
  if (l < 1e-12) return NaN;
  const c = Math.max(-1, Math.min(1, dot(a, b) / l));
  return (Math.acos(c) * 180) / Math.PI;
}

export const orthogonal = (a: V3, b: V3, eps = 1e-9): boolean => Math.abs(dot(a, b)) < eps;

/** Senkrechte Projektion von b auf die Richtung von a: (a·b / |a|²) · a. */
export function projection(b: V3, a: V3): V3 {
  const aa = dot(a, a);
  return aa < 1e-12 ? [0, 0, 0] : scale(a, dot(a, b) / aa);
}

/** Vorzeichenbehaftete Länge der Projektion von b auf a: a·b / |a|. */
export function projLength(b: V3, a: V3): number {
  const l = norm(a);
  return l < 1e-12 ? 0 : dot(a, b) / l;
}

/** Fläche des von a und b aufgespannten Parallelogramms |a × b| (= |a|·|b|·sin φ). */
export const parallelogramArea = (a: V3, b: V3): number => norm(cross(a, b));

/** Fläche des Dreiecks mit den Seiten a und b: ½ |a × b|. */
export const triangleArea = (a: V3, b: V3): number => parallelogramArea(a, b) / 2;

/** Spatprodukt (a × b) · c. */
export const triple = (a: V3, b: V3, c: V3): number => dot(cross(a, b), c);

/** Volumen des Spats |(a × b) · c|. */
export const spatVolume = (a: V3, b: V3, c: V3): number => Math.abs(triple(a, b, c));

/** Volumen der dreiseitigen Pyramide (Tetraeder) mit den Kanten a, b, c: ⅙ |(a × b) · c|. */
export const pyramidVolume = (a: V3, b: V3, c: V3): number => spatVolume(a, b, c) / 6;

/**
 * Bildet a, b, c ein Rechtssystem (Spatprodukt > 0), Linkssystem (< 0) oder
 * liegen sie in einer Ebene (= 0)?
 */
export function handedness(a: V3, b: V3, c: V3, eps = 1e-9): 'right' | 'left' | 'flat' {
  const t = triple(a, b, c);
  return t > eps ? 'right' : t < -eps ? 'left' : 'flat';
}
