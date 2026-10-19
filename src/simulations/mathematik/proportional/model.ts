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

/* ---------- Übungsmodus „Zuordnung erkennen“ ---------- */

/** Sachzusammenhänge je Art (Index in die Texte der Simulation). */
export const QUIZ_CTX: Record<Kind, { xs: number[]; ks: number[]; b: number }[]> = {
  dir: [
    { xs: [5, 10, 20, 30, 40], ks: [1.6, 1.7, 1.8, 1.9], b: 0 }, // Benzin: Liter → €
    { xs: [1, 2, 3, 5, 8], ks: [0.8, 1.2, 1.5], b: 0 }, // Hefte: Stück → €
    { xs: [1, 2, 3, 4, 5], ks: [4, 5], b: 0 }, // Wandern: h → km
  ],
  ind: [
    { xs: [1, 2, 3, 4, 6], ks: [12, 24], b: 0 }, // Pizza: Personen → Stücke pro Person
    { xs: [20, 30, 40, 60, 80], ks: [240], b: 0 }, // Fahrt: km/h → h
    { xs: [1, 2, 3, 4, 6], ks: [36, 48, 60], b: 0 }, // Futter: Tiere → Tage
  ],
  lin: [
    { xs: [10, 20, 30, 40, 50], ks: [0.1, 0.2], b: 5 }, // Handy: Minuten → € (Grundgebühr)
    { xs: [1, 2, 3, 4, 5], ks: [-2, -1.5], b: 20 }, // Kerze: h → cm (je mehr – desto weniger!)
    { xs: [1, 2, 3, 4, 5], ks: [2], b: 3.5 }, // Taxi: km → €
  ],
};

export interface QuizItem extends Relation {
  ctx: number;
  xs: number[];
}

/** Reproduzierbare Übungsaufgabe zur Nummer `seed` (gleiche Nummer – gleiche Aufgabe). */
export function quizItem(seed: number): QuizItem {
  let s = (Math.floor(seed) * 2654435761) >>> 0 || 1;
  const rnd = () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const kinds: Kind[] = ['dir', 'ind', 'lin'];
  const kind = kinds[Math.floor(rnd() * 3)]!;
  const ctx = Math.floor(rnd() * QUIZ_CTX[kind].length);
  const c = QUIZ_CTX[kind][ctx]!;
  const k = c.ks[Math.floor(rnd() * c.ks.length)]!;
  return { kind, k, b: c.b, ctx, xs: [...c.xs] };
}

/** Richtige Einordnung einer Wertetabelle (aus Quotienten- und Produkttest). */
export function classify(pairs: [number, number][]): Kind {
  const c = check(pairs);
  return c.quotient ? 'dir' : c.product ? 'ind' : 'lin';
}
