/**
 * Rechenlogik „Logarithmus als Umkehrung des Potenzierens“ (ohne Zeichnen).
 *
 * Kernfrage: „b hoch wie viel ergibt y?“
 *   log_b(y) = x  ⇔  bˣ = y      (b > 0, b ≠ 1, y > 0)
 *
 * Konventionen:
 * - Die Basis b ist positiv und ungleich 1; sonst ist log_b nicht definiert (NaN).
 * - Der Logarithmus ist nur für positive Zahlen y definiert (bˣ > 0 für alle x).
 * - Rechnerisch: log_b(y) = ln y / ln b (Basiswechsel). Ganzzahlige Ergebnisse
 *   werden von Rundungsfehlern befreit (log₁₀ 1000 = 3 statt 2,9999999999999996).
 */

/** Kleinste und größte Basis des Reglers. */
export const B_MIN = 0.2;
export const B_MAX = 10;

/** Ist b als Basis eines Logarithmus zulässig? (b > 0 und b ≠ 1) */
export function isValidBase(b: number): boolean {
  return Number.isFinite(b) && b > 0 && b !== 1;
}

/** Ganzzahlige Ergebnisse von Rundungsfehlern befreien. */
function snap(v: number): number {
  const r = Math.round(v);
  // „+ 0“ macht aus −0 eine gewöhnliche 0
  return Math.abs(v - r) < 1e-10 * Math.max(1, Math.abs(v)) ? r + 0 : v;
}

/** Potenz bˣ (für b > 0). */
export function pow(b: number, x: number): number {
  if (!(b > 0)) return NaN;
  return b ** x;
}

/**
 * Logarithmus von y zur Basis b: die Hochzahl x mit bˣ = y.
 * NaN, wenn b keine zulässige Basis ist oder y ≤ 0.
 */
export function log(b: number, y: number): number {
  if (!isValidBase(b) || !(y > 0) || !Number.isFinite(y)) return NaN;
  if (b === 2) return snap(Math.log2(y));
  if (b === 10) return snap(Math.log10(y));
  if (b === Math.E) return snap(Math.log(y));
  return snap(Math.log(y) / Math.log(b));
}

/** Zehnerlogarithmus lg y = log₁₀ y. */
export const lg = (y: number): number => log(10, y);

/** Natürlicher Logarithmus ln y = log_e y. */
export const ln = (y: number): number => log(Math.E, y);

/**
 * Basiswechsel: log_b(c) = lg c / lg b – so rechnet man mit dem Taschenrechner.
 * Liefert Zähler, Nenner und Ergebnis (NaN bei ungültigen Werten).
 */
export function changeOfBase(b: number, c: number): { num: number; den: number; x: number } {
  if (!isValidBase(b) || !(c > 0)) return { num: NaN, den: NaN, x: NaN };
  const num = lg(c);
  const den = lg(b);
  return { num, den, x: snap(num / den) };
}

/**
 * Exponentialgleichung bˣ = c lösen: x = log_b(c).
 * null, wenn es keine Lösung gibt (c ≤ 0, denn bˣ > 0) oder b unzulässig ist.
 */
export function solveExponential(b: number, c: number): number | null {
  const x = log(b, c);
  return Number.isFinite(x) ? x : null;
}

/**
 * Lösung zwischen zwei ganzen Zahlen eingrenzen: k ≤ x < k + 1 mit x = log_b(c),
 * dazu die Potenzen b^k und b^(k+1). Für b < 1 ist bˣ fallend, dann gilt
 * b^k ≥ c > b^(k+1). Ist x ganzzahlig, ist `exact` true.
 */
export function bracket(b: number, c: number): { lo: number; hi: number; powLo: number; powHi: number; exact: boolean } | null {
  const x = solveExponential(b, c);
  if (x === null) return null;
  const lo = Math.floor(x);
  return { lo, hi: lo + 1, powLo: snap(pow(b, lo)), powHi: snap(pow(b, lo + 1)), exact: Number.isInteger(x) };
}

/* ---------- Rechengesetze ---------- */

/** Produktregel: log_b(u · v) = log_b u + log_b v. */
export function productLaw(b: number, u: number, v: number): { lu: number; lv: number; sum: number; result: number; value: number } {
  const lu = log(b, u);
  const lv = log(b, v);
  return { lu, lv, sum: snap(lu + lv), result: log(b, u * v), value: u * v };
}

/** Quotientenregel: log_b(u / v) = log_b u − log_b v. */
export function quotientLaw(b: number, u: number, v: number): { lu: number; lv: number; diff: number; result: number; value: number } {
  const lu = log(b, u);
  const lv = log(b, v);
  return { lu, lv, diff: snap(lu - lv), result: log(b, u / v), value: u / v };
}

/** Potenzregel: log_b(uʳ) = r · log_b u. */
export function powerLaw(b: number, u: number, r: number): { lu: number; prod: number; result: number; value: number } {
  const lu = log(b, u);
  return { lu, prod: snap(r * lu), result: log(b, u ** r), value: u ** r };
}

/* ---------- Eigenschaften der Logarithmusfunktion ---------- */

/**
 * Steckbrief von f(x) = log_b x: D = ℝ⁺, W = ℝ, Nullstelle x = 1 (b⁰ = 1),
 * Punkt (b | 1) (b¹ = b), senkrechte Asymptote x = 0, streng monoton steigend
 * für b > 1, fallend für 0 < b < 1. Umkehrfunktion ist x ↦ bˣ.
 */
export function logProperties(b: number): {
  domain: 'R+';
  range: 'R';
  zero: [number, number];
  unitPoint: [number, number];
  asymptote: number;
  monotony: 'inc' | 'dec';
} | null {
  if (!isValidBase(b)) return null;
  return { domain: 'R+', range: 'R', zero: [1, 0], unitPoint: [b, 1], asymptote: 0, monotony: b > 1 ? 'inc' : 'dec' };
}

/** Wertetabelle der Potenzen: x und y = bˣ (in umgekehrter Leserichtung: log_b y = x). */
export function powerTable(b: number, xs: readonly number[]): { x: number; y: number }[] {
  return xs.map((x) => ({ x, y: snap(pow(b, x)) }));
}

/* ---------- Spiegelung an y = x ---------- */

/** Spiegelbild eines Punktes an der Geraden y = x: (x | y) → (y | x). */
export function mirror([x, y]: readonly [number, number]): [number, number] {
  return [y, x];
}

/**
 * Zwischenstellung beim „Umklappen“ an der Geraden y = x (t von 0 bis 1):
 * Der Anteil parallel zu y = x bleibt, der Abstand senkrecht dazu wird mit
 * cos(π·t) multipliziert – wie ein Blatt, das um die Gerade gedreht wird.
 * t = 0: (x | y), t = 1: (y | x). Der Punkt bewegt sich auf dem Lot zu y = x.
 */
export function flipAcrossDiagonal([x, y]: readonly [number, number], t: number): [number, number] {
  const m = (x + y) / 2;
  const d = ((x - y) / 2) * Math.cos(Math.PI * t);
  return [m + d, m - d];
}

/**
 * Basis beim Ziehen über die 1 hinweg: b = 1 ist nicht erlaubt.
 * Liegt b (fast) bei 1, wird auf die Seite gesprungen, in die gezogen wurde.
 */
export function avoidOne(b: number, prev: number, step = 0.05): number {
  if (Math.abs(b - 1) >= step / 2) return b;
  return prev < 1 ? 1 + step : 1 - step;
}
