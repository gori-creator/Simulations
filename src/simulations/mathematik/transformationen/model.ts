/**
 * Rechenlogik „Graphen verschieben, strecken und spiegeln“ (Jahrgangsstufe 11).
 *
 *   g(x) = a · f(b · (x − c)) + d
 *
 * Wirkung auf den Graphen von f (in dieser Reihenfolge ausführbar):
 * 1. b: Streckung in x-Richtung mit dem Faktor 1/b (|b| > 1: Stauchung),
 *       b < 0 zusätzlich Spiegelung an der y-Achse,
 * 2. c: Verschiebung um c in x-Richtung (c > 0: nach rechts),
 * 3. a: Streckung in y-Richtung mit dem Faktor a (|a| < 1: Stauchung),
 *       a < 0 zusätzlich Spiegelung an der x-Achse,
 * 4. d: Verschiebung um d in y-Richtung.
 *
 * Ein Punkt (x | y) des Graphen von f geht dabei über in (x/b + c | a·y + d).
 */

export type Base = 'sq' | 'cub' | 'sqrt' | 'abs' | 'inv' | 'sin' | 'exp';

export interface Trafo {
  a: number;
  b: number;
  c: number;
  d: number;
}

export const IDENTITY: Trafo = { a: 1, b: 1, c: 0, d: 0 };

/** Grundfunktion f. */
export function base(kind: Base, x: number): number {
  switch (kind) {
    case 'sq':
      return x * x;
    case 'cub':
      return x * x * x;
    case 'sqrt':
      return x >= 0 ? Math.sqrt(x) : NaN;
    case 'abs':
      return Math.abs(x);
    case 'inv':
      return x === 0 ? NaN : 1 / x;
    case 'sin':
      return Math.sin(x);
    case 'exp':
      return 2 ** x;
  }
}

/** g(x) = a · f(b(x − c)) + d */
export function transformed(kind: Base, t: Trafo, x: number): number {
  return t.a * base(kind, t.b * (x - t.c)) + t.d;
}

/** Bildpunkt eines Punktes (x | y) des Graphen von f. */
export function mapPoint(t: Trafo, x: number, y: number): [number, number] {
  return [x / t.b + t.c, t.a * y + t.d];
}

/** Urbild (zum Ziehen): Welcher Punkt von f geht auf (X | Y)? */
export function unmapPoint(t: Trafo, X: number, Y: number): [number, number] {
  return [t.b * (X - t.c), (Y - t.d) / t.a];
}

/** Markante Punkte von f (werden mit abgebildet). */
export function keyPoints(kind: Base): [number, number][] {
  switch (kind) {
    case 'sq':
      return [
        [-2, 4],
        [-1, 1],
        [0, 0],
        [1, 1],
        [2, 4],
      ];
    case 'cub':
      return [
        [-1, -1],
        [0, 0],
        [1, 1],
      ];
    case 'sqrt':
      return [
        [0, 0],
        [1, 1],
        [4, 2],
      ];
    case 'abs':
      return [
        [-2, 2],
        [0, 0],
        [2, 2],
      ];
    case 'inv':
      return [
        [-1, -1],
        [1, 1],
        [2, 0.5],
      ];
    case 'sin':
      return [
        [0, 0],
        [Math.PI / 2, 1],
        [Math.PI, 0],
        [(3 * Math.PI) / 2, -1],
      ];
    case 'exp':
      return [
        [-1, 0.5],
        [0, 1],
        [1, 2],
      ];
  }
}

/** Ankerpunkt (zum Verschieben) und Formpunkt (zum Strecken) von f. */
export function anchors(kind: Base): { p0: [number, number]; p1: [number, number] } {
  switch (kind) {
    case 'inv':
      return { p0: [0, 0], p1: [1, 1] };
    case 'sin':
      return { p0: [0, 0], p1: [Math.PI / 2, 1] };
    case 'exp':
      return { p0: [0, 1], p1: [1, 2] };
    default:
      return { p0: [0, 0], p1: [1, 1] };
  }
}

/** Waagrechte bzw. senkrechte Asymptoten von g (falls vorhanden). */
export function asymptotes(kind: Base, t: Trafo): { x?: number; y?: number } {
  if (kind === 'inv') return { x: t.c, y: t.d };
  if (kind === 'exp') return { y: t.d };
  return {};
}

/**
 * Zwischenstufen der Schritt-für-Schritt-Darstellung:
 * f → f(bx) → f(b(x − c)) → a·f(b(x − c)) → a·f(b(x − c)) + d.
 */
export function stages(t: Trafo): Trafo[] {
  return [
    { ...IDENTITY },
    { a: 1, b: t.b, c: 0, d: 0 },
    { a: 1, b: t.b, c: t.c, d: 0 },
    { a: t.a, b: t.b, c: t.c, d: 0 },
    { ...t },
  ];
}
