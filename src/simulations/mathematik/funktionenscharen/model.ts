/**
 * Rechenlogik „Funktionenscharen“ (Jgst. 12/13).
 *
 * Eine Schar f_k fasst viele Funktionen mit einem Parameter k zusammen.
 * Typische Fragen: Für welche k gibt es Extrempunkte? Wo liegen sie in
 * Abhängigkeit von k? Auf welcher Kurve (Ortskurve) wandern sie? Welche
 * Punkte haben alle Scharkurven gemeinsam?
 */

export type FamKey = 'cub' | 'par' | 'exp' | 'quart';

export interface Ext {
  x: number;
  y: number;
  kind: 'max' | 'min' | 'saddle';
}

export interface Family {
  f: (k: number, x: number) => number;
  /** Extrempunkte in Abhängigkeit von k */
  extrema: (k: number) => Ext[];
  /** Ortskurve der Extrempunkte (y in Abhängigkeit von x) */
  locus: (x: number) => number;
  /** gemeinsame Punkte aller Scharkurven */
  common: [number, number][];
}

export const FAMS: Record<FamKey, Family> = {
  cub: {
    f: (k, x) => x ** 3 - k * x,
    extrema: (k) => {
      if (k < 0) return [];
      if (k === 0) return [{ x: 0, y: 0, kind: 'saddle' }];
      const x = Math.sqrt(k / 3);
      return [
        { x: -x, y: (2 * k * x) / 3, kind: 'max' },
        { x, y: (-2 * k * x) / 3, kind: 'min' },
      ];
    },
    locus: (x) => -2 * x ** 3,
    common: [[0, 0]],
  },
  par: {
    f: (k, x) => x * x - 2 * k * x + k,
    extrema: (k) => [{ x: k, y: k - k * k, kind: 'min' }],
    locus: (x) => x - x * x,
    common: [[0.5, 0.25]],
  },
  exp: {
    f: (k, x) => x * Math.exp(-k * x),
    extrema: (k) => (k === 0 ? [] : [{ x: 1 / k, y: 1 / (k * Math.E), kind: k > 0 ? 'max' : 'min' }]),
    locus: (x) => x / Math.E,
    common: [[0, 0]],
  },
  quart: {
    f: (k, x) => k * x * x - x ** 4,
    extrema: (k) => {
      if (k <= 0) return [{ x: 0, y: 0, kind: 'max' }];
      const x = Math.sqrt(k / 2);
      const y = (k * k) / 4;
      return [
        { x: -x, y, kind: 'max' },
        { x: 0, y: 0, kind: 'min' },
        { x, y, kind: 'max' },
      ];
    },
    locus: (x) => x ** 4,
    common: [[0, 0]],
  },
};

/** Numerische Ableitung (zum Prüfen). */
export function slope(fam: Family, k: number, x: number, h = 1e-6): number {
  return (fam.f(k, x + h) - fam.f(k, x - h)) / (2 * h);
}
