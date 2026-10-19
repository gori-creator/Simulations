/**
 * Rechenlogik „Funktionenscharen“ (Jgst. 12/13).
 *
 * Eine Schar f_k fasst viele Funktionen mit einem Parameter k zusammen.
 * Typische Fragen: Für welche k gibt es Extrempunkte? Wo liegen sie in
 * Abhängigkeit von k? Auf welcher Kurve (Ortskurve) wandern sie? Welche
 * Punkte haben alle Scharkurven gemeinsam? Wo liegen die Wendepunkte?
 */

export type FamKey = 'cub' | 'par' | 'exp' | 'quart' | 'expk';

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
  /** Wendepunkte in Abhängigkeit von k */
  inflections: (k: number) => { x: number; y: number }[];
  /** Ortskurve der Wendepunkte (null: keine oder nur ein fester Punkt) */
  wlocus: ((x: number) => number) | null;
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
    // f″(x) = 6x: Wendepunkt immer im Ursprung
    inflections: () => [{ x: 0, y: 0 }],
    wlocus: null,
  },
  par: {
    f: (k, x) => x * x - 2 * k * x + k,
    extrema: (k) => [{ x: k, y: k - k * k, kind: 'min' }],
    locus: (x) => x - x * x,
    common: [[0.5, 0.25]],
    inflections: () => [],
    wlocus: null,
  },
  exp: {
    f: (k, x) => x * Math.exp(-k * x),
    extrema: (k) => (k === 0 ? [] : [{ x: 1 / k, y: 1 / (k * Math.E), kind: k > 0 ? 'max' : 'min' }]),
    locus: (x) => x / Math.E,
    common: [[0, 0]],
    // f″(x) = k · e^(−kx) · (kx − 2): Wendepunkt (2/k | 2/(k e²))
    inflections: (k) => (k === 0 ? [] : [{ x: 2 / k, y: 2 / (k * Math.E ** 2) }]),
    wlocus: (x) => x / Math.E ** 2,
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
    // f″(x) = 2k − 12x²: Wendepunkte (±√(k/6) | 5k²/36) für k > 0
    inflections: (k) => {
      if (k <= 0) return [];
      const x = Math.sqrt(k / 6);
      const y = (5 * k * k) / 36;
      return [
        { x: -x, y },
        { x, y },
      ];
    },
    wlocus: (x) => 5 * x ** 4,
  },
  // (x − k) · eˣ: Tiefpunkt (k − 1 | −e^(k−1)), Wendepunkt (k − 2 | −2e^(k−2)),
  // keine gemeinsamen Punkte – alle Kurven sind gegeneinander verschoben
  expk: {
    f: (k, x) => (x - k) * Math.exp(x),
    extrema: (k) => [{ x: k - 1, y: -Math.exp(k - 1), kind: 'min' }],
    locus: (x) => -Math.exp(x),
    common: [],
    inflections: (k) => [{ x: k - 2, y: -2 * Math.exp(k - 2) }],
    wlocus: (x) => -2 * Math.exp(x),
  },
};

/** Numerische zweite Ableitung (zum Prüfen). */
export function curvature(fam: Family, k: number, x: number, h = 1e-4): number {
  return (fam.f(k, x + h) - 2 * fam.f(k, x) + fam.f(k, x - h)) / (h * h);
}

/** Schnittstellen zweier Scharkurven f_k1 und f_k2 im Intervall (numerisch, Vorzeichenwechsel). */
export function intersections(fam: Family, k1: number, k2: number, from: number, to: number, steps = 2000): number[] {
  const d = (x: number) => fam.f(k1, x) - fam.f(k2, x);
  const out: number[] = [];
  const h = (to - from) / steps;
  let x0 = from;
  let d0 = d(x0);
  for (let i = 1; i <= steps; i++) {
    const x1 = from + i * h;
    const d1 = d(x1);
    if (d0 === 0) out.push(x0);
    else if (d0 * d1 < 0) {
      let a = x0;
      let b = x1;
      for (let j = 0; j < 60; j++) {
        const m = (a + b) / 2;
        if (d(a) * d(m) <= 0) b = m;
        else a = m;
      }
      out.push((a + b) / 2);
    }
    x0 = x1;
    d0 = d1;
  }
  return out;
}

/** Numerische Ableitung (zum Prüfen). */
export function slope(fam: Family, k: number, x: number, h = 1e-6): number {
  return (fam.f(k, x + h) - fam.f(k, x - h)) / (2 * h);
}
