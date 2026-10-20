/**
 * Rechenlogik zur natürlichen Exponentialfunktion f(x) = eˣ (ohne Zeichnen).
 *
 * Drei Zugänge:
 * 1. Die besondere Basis: Für f(x) = bˣ ist f′(x) = ln b · bˣ, das Verhältnis
 *    f′(x) / f(x) = ln b ist für alle x gleich. Nur für b = e ist es 1, also f′ = f.
 * 2. Tangente: Die Tangente an y = eˣ im Punkt P(x₀ | e^x₀) hat die Steigung
 *    e^x₀ und schneidet die x-Achse immer bei x₀ − 1 (Steigungsdreieck mit
 *    Grundseite 1 und Höhe f(x₀)).
 * 3. e entsteht: Die Folge (1 + 1/n)ⁿ wächst streng und nähert sich e
 *    (Zinseszins: 1 € zu 100 % Jahreszins, n-mal im Jahr verzinst).
 */

/** Eulersche Zahl e ≈ 2,718281828 */
export const E = Math.E;

/** Bereich der Basis im Regler */
export const B_MIN = 1.5;
export const B_MAX = 4;

/**
 * Fangbereich um e: Liegt die eingestellte Basis näher als SNAP an e
 * (Regler in Hundertstelschritten: 2,71 und 2,72), rechnet die Simulation mit e.
 */
export const SNAP = 0.011;

/** Basis, mit der gerechnet wird: Werte nahe e rasten bei e ein. */
export function snapBase(b: number, tol = SNAP): number {
  return Math.abs(b - E) < tol ? E : b;
}

/** Ist die Basis (nach dem Einrasten) genau e? */
export function isE(b: number): boolean {
  return snapBase(b) === E;
}

/** Funktionswert bˣ (b > 0). */
export function expBase(b: number, x: number): number {
  return b ** x;
}

/** Natürlicher Logarithmus ln x (x > 0), Umkehrfunktion von eˣ. */
export function ln(x: number): number {
  return Math.log(x);
}

/**
 * Ableitung von f(x) = bˣ: f′(x) = ln b · bˣ.
 * (Herleitung: bˣ = e^(x·ln b), Kettenregel.)
 */
export function derivative(b: number, x: number): number {
  return Math.log(b) * b ** x;
}

/**
 * Verhältnis f′(x) / f(x) = ln b – hängt nicht von x ab.
 * Für b = e ist es genau 1.
 */
export function ratio(b: number): number {
  return Math.log(b);
}

/** Differenzenquotient (f(x + h) − f(x)) / h (Sekantensteigung). */
export function diffQuotient(f: (x: number) => number, x: number, h: number): number {
  return (f(x + h) - f(x)) / h;
}

/** Symmetrischer Differenzenquotient (f(x + h) − f(x − h)) / (2h), genauer für kleine h. */
export function centralDiff(f: (x: number) => number, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Tangente an y = bˣ in x₀: y = m · x + c mit m = ln b · b^x₀. */
export function tangent(b: number, x0: number): { m: number; c: number } {
  const y0 = b ** x0;
  const m = Math.log(b) * y0;
  return { m, c: y0 - m * x0 };
}

/** Tangente an y = eˣ in x₀: y = e^x₀ · (x − x₀ + 1). */
export function tangentExp(x0: number, x: number): number {
  return Math.exp(x0) * (x - x0 + 1);
}

/** Nullstelle der Tangente an y = eˣ in x₀: immer x₀ − 1. */
export function tangentZero(x0: number): number {
  return x0 - 1;
}

/* ---------- e entsteht: (1 + 1/n)ⁿ ---------- */

/**
 * (1 + 1/n)ⁿ, numerisch stabil über exp(n · log1p(1/n))
 * (für große n wäre 1 + 1/n gerundet und die Potenz ungenau).
 */
export function compound(n: number): number {
  return Math.exp(n * Math.log1p(1 / n));
}

/** Kontostand nach k von n Zinsperioden (Start 1 €, 100 % Jahreszins): (1 + 1/n)ᵏ. */
export function balanceAfter(n: number, k: number): number {
  return Math.exp(k * Math.log1p(1 / n));
}

/** Kontostand zur Zeit t (in Jahren, 0 ≤ t ≤ 1): Zinsen erst am Ende jeder Periode (Treppe). */
export function balanceAt(n: number, t: number): number {
  const k = Math.min(n, Math.floor(t * n + 1e-9));
  return balanceAfter(n, Math.max(0, k));
}

/** Abstand zu e: e − (1 + 1/n)ⁿ (immer positiv, ungefähr e / (2n)). */
export function gapToE(n: number): number {
  return E - compound(n);
}

/**
 * Stufen des logarithmischen Reglers für n (1 … 10⁶), mit den
 * Zinsperioden jährlich, halbjährlich, vierteljährlich, monatlich,
 * wöchentlich, täglich, stündlich und minütlich (52, 365, 8760, 525 600).
 * Die Reihenfolge ist fest (die Stufe steht in geteilten Links).
 */
export const N_STEPS: readonly number[] = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 52, 75, 100, 150, 200, 365, 500, 1000, 2000, 5000, 8760, 10000, 20000, 50000,
  100000, 200000, 525600, 1000000,
];

/** n zur Reglerstufe i (gerundet und begrenzt). */
export function nAt(i: number): number {
  const k = Math.max(0, Math.min(N_STEPS.length - 1, Math.round(i)));
  return N_STEPS[k]!;
}

/** Reglerstufe zu n (nächstgelegene Stufe). */
export function stepOf(n: number): number {
  let best = 0;
  N_STEPS.forEach((v, i) => {
    if (Math.abs(Math.log(v) - Math.log(n)) < Math.abs(Math.log(N_STEPS[best]!) - Math.log(n))) best = i;
  });
  return best;
}

export type Period = 'year' | 'half' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute';

/** Zinsperiode mit Namen (nur für die üblichen n). */
export function periodOf(n: number): Period | null {
  const map: Record<number, Period> = { 1: 'year', 2: 'half', 4: 'quarter', 12: 'month', 52: 'week', 365: 'day', 8760: 'hour', 525600: 'minute' };
  return map[n] ?? null;
}
