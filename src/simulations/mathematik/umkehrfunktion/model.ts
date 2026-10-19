/**
 * Rechenlogik „Umkehrfunktionen: Spiegeln an y = x“ (Jgst. 12).
 *
 * Eine Funktion f ist umkehrbar, wenn jeder Funktionswert nur einmal
 * angenommen wird – z. B. wenn f streng monoton ist. Der Graph der
 * Umkehrfunktion f⁻¹ entsteht durch Spiegelung an der Geraden y = x:
 * Aus P(a | f(a)) wird P'(f(a) | a). Definitions- und Wertemenge tauschen.
 */

export type FnKey = 'lin' | 'sq' | 'cube' | 'exp' | 'hyp' | 'shift';
export type SqDom = 'pos' | 'neg' | 'all';

export interface Fn {
  f: (x: number) => number;
  /** Ableitung f′ */
  df: (x: number) => number;
  /** Umkehrfunktion (null: nicht umkehrbar) */
  inv: ((x: number) => number) | null;
  /** Definitionsbereich (für Zeichnung und Griff) */
  lo: number;
  hi: number;
  /** Lücke bei x = 0 (Hyperbel) */
  gap0?: boolean;
}

export function makeFn(key: FnKey, dom: SqDom = 'pos'): Fn {
  switch (key) {
    case 'lin':
      return { f: (x) => 2 * x - 1, df: () => 2, inv: (x) => (x + 1) / 2, lo: -Infinity, hi: Infinity };
    case 'sq':
      if (dom === 'pos') return { f: (x) => x * x, df: (x) => 2 * x, inv: (x) => (x < 0 ? NaN : Math.sqrt(x)), lo: 0, hi: Infinity };
      if (dom === 'neg') return { f: (x) => x * x, df: (x) => 2 * x, inv: (x) => (x < 0 ? NaN : -Math.sqrt(x)), lo: -Infinity, hi: 0 };
      return { f: (x) => x * x, df: (x) => 2 * x, inv: null, lo: -Infinity, hi: Infinity };
    case 'cube':
      return { f: (x) => 0.5 * x ** 3, df: (x) => 1.5 * x * x, inv: (x) => Math.cbrt(2 * x), lo: -Infinity, hi: Infinity };
    case 'exp':
      return { f: (x) => Math.exp(x), df: (x) => Math.exp(x), inv: (x) => (x <= 0 ? NaN : Math.log(x)), lo: -Infinity, hi: Infinity };
    case 'hyp':
      return { f: (x) => 1 / x, df: (x) => -1 / (x * x), inv: (x) => 1 / x, lo: -Infinity, hi: Infinity, gap0: true };
    case 'shift':
      // verschobene Parabel f(x) = (x − 2)² + 1 für x ≥ 2, f⁻¹(x) = 2 + √(x − 1)
      return { f: (x) => (x - 2) ** 2 + 1, df: (x) => 2 * (x - 2), inv: (x) => (x < 1 ? NaN : 2 + Math.sqrt(x - 1)), lo: 2, hi: Infinity };
  }
}

/** Spiegelpunkt an y = x. */
export function mirror(p: readonly [number, number]): [number, number] {
  return [p[1], p[0]];
}

/** Punkt auf dem Weg der Spiegelung (t = 0: P, t = 1: P'), senkrecht zu y = x. */
export function mirrorPath(p: readonly [number, number], t: number): [number, number] {
  return [p[0] + (p[1] - p[0]) * t, p[1] + (p[0] - p[1]) * t];
}

/** Zweiter x-Wert mit gleichem Funktionswert (Gegenbeispiel zur Umkehrbarkeit bei x²). */
export function partner(key: FnKey, dom: SqDom, x: number): number | null {
  if (key === 'sq' && dom === 'all' && Math.abs(x) > 1e-9) return -x;
  return null;
}

/**
 * Waagrechtentest: Wie oft schneidet die Gerade y = c den Graphen von f auf [lo; hi]?
 * Gezählt werden Vorzeichenwechsel von f(x) − c auf einem feinen Raster (plus genaue Treffer);
 * Lücken (z. B. bei 1/x in x = 0) werden übersprungen.
 */
export function hCount(fn: Fn, c: number, lo: number, hi: number, steps = 4000): number {
  const a = Math.max(fn.lo, lo);
  const b = Math.min(fn.hi, hi);
  let count = 0;
  let prev: number | null = null;
  for (let i = 0; i <= steps; i++) {
    const x = a + ((b - a) * i) / steps;
    if (fn.gap0 && Math.abs(x) < 1e-9) {
      prev = null;
      continue;
    }
    const d = fn.f(x) - c;
    if (!Number.isFinite(d)) {
      prev = null;
      continue;
    }
    if (d === 0) {
      count++;
      prev = null;
      continue;
    }
    if (prev !== null && prev * d < 0 && !(fn.gap0 && x > 0 && x - (b - a) / steps < 0)) count++;
    prev = d;
  }
  return count;
}

/** Steigung der Umkehrfunktion im Spiegelpunkt: (f⁻¹)′(f(a)) = 1 / f′(a) (null bei waagrechter Tangente). */
export function inverseSlope(fn: Fn, a: number): number | null {
  const m = fn.df(a);
  return Math.abs(m) < 1e-12 ? null : 1 / m;
}
