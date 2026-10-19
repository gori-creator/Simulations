/**
 * Rechenlogik „Grenzverhalten und Asymptoten“ (Jahrgangsstufe 11).
 *
 * Verhalten von f(x) für x → +∞ bzw. x → −∞:
 * - f(x) → L (Grenzwert L): Die Gerade y = L ist waagrechte Asymptote.
 *   Anschaulich (ε-Streifen): Zu jedem noch so schmalen Streifen
 *   L − ε < y < L + ε gibt es eine Stelle x_ε, ab der der Graph den
 *   Streifen nicht mehr verlässt.
 * - f(x) → +∞ bzw. −∞: kein Grenzwert, der Graph verlässt jeden Streifen.
 */

export type FnKey = 'inv' | 'rat' | 'rat2' | 'osc' | 'exp' | 'poly';
export type Dir = 1 | -1;

/** Grenzverhalten: Zahl (Grenzwert) oder ±Infinity (bestimmt divergent). */
export interface FnDef {
  f: (x: number) => number;
  /** Verhalten für x → +∞ */
  plus: number;
  /** Verhalten für x → −∞ */
  minus: number;
}

export const FUNCS: Record<FnKey, FnDef> = {
  // 1/x + 1 → 1
  inv: { f: (x) => (x === 0 ? NaN : 1 / x + 1), plus: 1, minus: 1 },
  // (2x + 1)/(x − 1) = 2 + 3/(x − 1) → 2
  rat: { f: (x) => (x === 1 ? NaN : (2 * x + 1) / (x - 1)), plus: 2, minus: 2 },
  // (3x² + 1)/(x² + 1) = 3 − 2/(x² + 1) → 3
  rat2: { f: (x) => (3 * x * x + 1) / (x * x + 1), plus: 3, minus: 3 },
  // sin(x)/x → 0 (der Graph schneidet die Asymptote immer wieder)
  osc: { f: (x) => (x === 0 ? 1 : Math.sin(x) / x), plus: 0, minus: 0 },
  // 2^x → +∞ bzw. → 0
  exp: { f: (x) => 2 ** x, plus: Infinity, minus: 0 },
  // 0,1x³ − x → ±∞
  poly: { f: (x) => 0.1 * x ** 3 - x, plus: Infinity, minus: -Infinity },
};

export function limitOf(key: FnKey, dir: Dir): number {
  return dir > 0 ? FUNCS[key].plus : FUNCS[key].minus;
}

export function hasLimit(key: FnKey, dir: Dir): boolean {
  return Number.isFinite(limitOf(key, dir));
}

/**
 * Stelle x_ε (in Richtung dir): Für alle x jenseits von x_ε gilt
 * |f(x) − L| < ε. Numerisch: Von weit draußen (dort gilt die Bedingung) nach
 * innen wandern bis zur ersten Verletzung und dort fein eingrenzen.
 * Rückgabe in Richtung dir gemessen (x_ε selbst, mit Vorzeichen).
 */
export function threshold(key: FnKey, dir: Dir, eps: number, far = 0): number {
  const L = limitOf(key, dir);
  if (!Number.isFinite(L)) return NaN;
  const f = FUNCS[key].f;
  const bad = (t: number) => {
    const v = f(dir * t);
    return !Number.isFinite(v) || Math.abs(v - L) >= eps;
  };
  // weit genug draußen: alle hier untersuchten Funktionen nähern sich höchstens wie 3/|x|
  const hi = Math.max(far, 20 / eps + 10);
  const n = 400000;
  const h = hi / n;
  for (let i = n; i >= 0; i--) {
    const t = i * h;
    if (bad(t)) {
      // feiner zwischen t und t + h
      let lo = t;
      let up = t + h;
      for (let k = 0; k < 50; k++) {
        const m = (lo + up) / 2;
        if (bad(m)) lo = m;
        else up = m;
      }
      return dir * up;
    }
  }
  return 0;
}

/** Stellen für die Wertetabelle: x = ±1, ±10, ±100, … (bei 2ˣ kleinere Schritte). */
export function tableXs(key: FnKey): number[] {
  return key === 'exp' ? [1, 2, 5, 10, 20] : [1, 10, 100, 1000, 10000];
}

/** Werte für die Tabelle (Definitionslücken ergeben NaN). */
export function table(key: FnKey, dir: Dir, xs = tableXs(key)): { x: number; y: number; d: number }[] {
  const L = limitOf(key, dir);
  return xs.map((ax) => {
    const x = dir * ax;
    const y = FUNCS[key].f(x);
    return { x, y, d: Number.isFinite(L) ? Math.abs(y - L) : NaN };
  });
}
