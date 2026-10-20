/**
 * Rechenlogik „Umkehrfunktionen: Spiegeln an y = x“ (Jgst. 12).
 *
 * Eine Funktion f ist umkehrbar, wenn jeder Funktionswert nur einmal
 * angenommen wird – z. B. wenn f streng monoton ist. Der Graph der
 * Umkehrfunktion f⁻¹ entsteht durch Spiegelung an der Geraden y = x:
 * Aus P(a | f(a)) wird P'(f(a) | a). Definitions- und Wertemenge tauschen.
 */

export type FnKey = 'lin' | 'sq' | 'cube' | 'exp' | 'hyp';
export type SqDom = 'pos' | 'neg' | 'all';

export interface Fn {
  f: (x: number) => number;
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
      return { f: (x) => 2 * x - 1, inv: (x) => (x + 1) / 2, lo: -Infinity, hi: Infinity };
    case 'sq':
      if (dom === 'pos') return { f: (x) => x * x, inv: (x) => (x < 0 ? NaN : Math.sqrt(x)), lo: 0, hi: Infinity };
      if (dom === 'neg') return { f: (x) => x * x, inv: (x) => (x < 0 ? NaN : -Math.sqrt(x)), lo: -Infinity, hi: 0 };
      return { f: (x) => x * x, inv: null, lo: -Infinity, hi: Infinity };
    case 'cube':
      return { f: (x) => 0.5 * x ** 3, inv: (x) => Math.cbrt(2 * x), lo: -Infinity, hi: Infinity };
    case 'exp':
      return { f: (x) => Math.exp(x), inv: (x) => (x <= 0 ? NaN : Math.log(x)), lo: -Infinity, hi: Infinity };
    case 'hyp':
      return { f: (x) => 1 / x, inv: (x) => 1 / x, lo: -Infinity, hi: Infinity, gap0: true };
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
