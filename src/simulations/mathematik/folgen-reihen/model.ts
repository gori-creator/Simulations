/**
 * Folgen und Reihen: Folgenglieder, Grenzwert mit ε-Umgebung,
 * Teilsummen arithmetischer, geometrischer und harmonischer Reihen.
 */

export type SeqType = 'arith' | 'geom' | 'inv' | 'ratio' | 'euler' | 'alt';

/** n-tes Glied (n ≥ 1). a: Startwert, d: Differenz, q: Quotient. */
export function term(type: SeqType, n: number, a: number, d: number, q: number): number {
  switch (type) {
    case 'arith':
      return a + (n - 1) * d;
    case 'geom':
      return a * Math.pow(q, n - 1);
    case 'inv':
      return 1 / n;
    case 'ratio':
      return n / (n + 1);
    case 'euler':
      return Math.pow(1 + 1 / n, n);
    case 'alt':
      return Math.pow(-1, n);
  }
}

/** Grenzwert, falls vorhanden (sonst null). */
export function limit(type: SeqType, a: number, d: number, q: number): number | null {
  switch (type) {
    case 'arith':
      return d === 0 ? a : null;
    case 'geom':
      if (Math.abs(q) < 1) return 0;
      if (q === 1) return a;
      return a === 0 ? 0 : null;
    case 'inv':
      return 0;
    case 'ratio':
      return 1;
    case 'euler':
      return Math.E;
    case 'alt':
      return null;
  }
}

/** Kleinstes N, ab dem alle Glieder (bis nMax geprüft) in der ε-Umgebung liegen. */
export function indexFor(eps: number, g: number, f: (n: number) => number, nMax = 100000): number | null {
  let last = 0;
  for (let n = 1; n <= nMax; n++) if (Math.abs(f(n) - g) >= eps) last = n;
  return last >= nMax ? null : last + 1;
}

export type SeriesType = 'arith' | 'geom' | 'harm';

/** Teilsumme s_n = a₁ + … + a_n. */
export function partialSum(type: SeriesType, n: number, a: number, d: number, q: number): number {
  if (type === 'arith') return (n * (2 * a + (n - 1) * d)) / 2;
  if (type === 'geom') return q === 1 ? n * a : (a * (1 - Math.pow(q, n))) / (1 - q);
  let s = 0;
  for (let k = 1; k <= n; k++) s += 1 / k;
  return s;
}

/** Summe der unendlichen Reihe (null bei Divergenz). */
export function seriesSum(type: SeriesType, a: number, d: number, q: number): number | null {
  if (type === 'geom' && Math.abs(q) < 1) return a / (1 - q);
  if (type === 'arith' && a === 0 && d === 0) return 0;
  return null;
}
