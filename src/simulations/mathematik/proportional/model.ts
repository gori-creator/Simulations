/**
 * Rechenlogik „Direkte und indirekte Proportionalität“ (Jahrgangsstufe 6–8).
 *
 * - direkt proportional: y = k · x  (quotientengleich: y/x = k);
 *   Graph: Halbgerade durch den Ursprung. Verdoppelt man x, verdoppelt sich y.
 * - indirekt proportional: y = k / x  (produktgleich: x · y = k);
 *   Graph: Hyperbelast. Verdoppelt man x, halbiert sich y.
 * - weder noch (Gegenbeispiel): y = m · x + b mit b ≠ 0, z. B. Taxi mit
 *   Grundgebühr: „je mehr – desto mehr“, aber nicht proportional.
 */

export type Kind = 'dir' | 'ind' | 'lin';

export interface Relation {
  kind: Kind;
  /** Proportionalitätsfaktor (dir), Produkt (ind) bzw. Preis pro Einheit (lin) */
  k: number;
  /** Grundgebühr (nur lin) */
  b: number;
}

export function value(r: Relation, x: number): number {
  if (r.kind === 'dir') return r.k * x;
  if (r.kind === 'ind') return x === 0 ? NaN : r.k / x;
  return r.k * x + r.b;
}

/** Quotient y/x (bei direkter Proportionalität überall gleich k). */
export function quotient(r: Relation, x: number): number {
  return value(r, x) / x;
}

/** Produkt x · y (bei indirekter Proportionalität überall gleich k). */
export function product(r: Relation, x: number): number {
  return x * value(r, x);
}

/** Ist eine Wertetabelle quotientengleich bzw. produktgleich? */
export function check(pairs: [number, number][], tol = 1e-9): { quotient: boolean; product: boolean } {
  const qs = pairs.filter(([x]) => x !== 0).map(([x, y]) => y / x);
  const ps = pairs.map(([x, y]) => x * y);
  const same = (v: number[]) => v.every((q) => Math.abs(q - v[0]!) <= tol * Math.max(1, Math.abs(v[0]!)));
  return { quotient: same(qs), product: same(ps) };
}

/**
 * Dreisatz von x₁ auf x₂: Faktor, mit dem x multipliziert wird, und der
 * zugehörige Faktor für y (direkt: gleich, indirekt: Kehrwert).
 */
export function ruleFactors(r: Relation, x1: number, x2: number): { fx: number; fy: number } {
  const fx = x2 / x1;
  const fy = value(r, x2) / value(r, x1);
  return { fx, fy };
}
