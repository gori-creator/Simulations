/**
 * Lineare Ungleichungen a·x + b ⋚ c·x + d: Lösen durch Äquivalenzumformungen,
 * mit Umkehren des Relationszeichens beim Teilen durch eine negative Zahl.
 */

export type Rel = 'lt' | 'le' | 'gt' | 'ge';

export const REL_SYMBOL: Record<Rel, string> = { lt: '<', le: '≤', gt: '>', ge: '≥' };

/** Relationszeichen umkehren (beim Multiplizieren/Teilen mit einer negativen Zahl). */
export function flip(rel: Rel): Rel {
  return rel === 'lt' ? 'gt' : rel === 'gt' ? 'lt' : rel === 'le' ? 'ge' : 'le';
}

/** Gilt l ⋚ r? (mit kleiner Toleranz für Rundungsfehler bei Gleichheit) */
export function holds(l: number, r: number, rel: Rel): boolean {
  const eps = 1e-9;
  switch (rel) {
    case 'lt':
      return l < r - eps;
    case 'le':
      return l <= r + eps;
    case 'gt':
      return l > r + eps;
    case 'ge':
      return l >= r - eps;
  }
}

export type Solution = { kind: 'bound'; rel: Rel; x: number } | { kind: 'all' } | { kind: 'none' };

export interface Steps {
  /** Koeffizient von x nach dem Sammeln: a − c */
  k: number;
  /** rechte Seite nach dem Sammeln: d − b */
  m: number;
  /** Relationszeichen nach dem Teilen durch k */
  rel: Rel;
  /** wurde das Zeichen umgedreht? */
  flipped: boolean;
}

export function steps(a: number, b: number, c: number, d: number, rel: Rel): Steps {
  const k = a - c;
  const m = d - b;
  return { k, m, rel: k < 0 ? flip(rel) : rel, flipped: k < 0 };
}

export function solve(a: number, b: number, c: number, d: number, rel: Rel): Solution {
  const s = steps(a, b, c, d, rel);
  if (Math.abs(s.k) < 1e-12) return holds(0, s.m, rel) ? { kind: 'all' } : { kind: 'none' };
  const x = s.m / s.k;
  return { kind: 'bound', rel: s.rel, x: x === 0 ? 0 : x };
}

/** Liegt x in der Lösungsmenge? */
export function inSolution(sol: Solution, x: number): boolean {
  if (sol.kind === 'all') return true;
  if (sol.kind === 'none') return false;
  return holds(x, sol.x, sol.rel);
}
