/** Rechenlogik „Exponentielles Wachstum und Zerfall“: f(t) = a · bᵗ mit b = 1 + p/100. */

export function growthFactor(percent: number): number {
  return 1 + percent / 100;
}

export function exponential(a: number, percent: number, t: number): number {
  return a * growthFactor(percent) ** t;
}

/** Lineares Wachstum mit derselben Änderung im ersten Schritt: g(t) = a + a·p/100·t. */
export function linearComparison(a: number, percent: number, t: number): number {
  return a + ((a * percent) / 100) * t;
}

/** Verdopplungszeit (p > 0) bzw. Halbwertszeit (p < 0) in Zeitschritten. */
export function characteristicTime(percent: number): number {
  const b = growthFactor(percent);
  if (b <= 0 || b === 1) return NaN;
  return Math.log(b > 1 ? 2 : 0.5) / Math.log(b);
}

/** Zeitpunkt, zu dem f(t) = target erreicht wird. */
export function timeToReach(a: number, percent: number, target: number): number {
  const b = growthFactor(percent);
  if (a <= 0 || target <= 0 || b <= 0 || b === 1) return NaN;
  return Math.log(target / a) / Math.log(b);
}

/** Ist `value` auf `decimals` Nachkommastellen exakt darstellbar? Dann „=“, sonst „≈“. */
export function isExactTo(value: number, decimals: number): boolean {
  const f = value * 10 ** decimals;
  return Math.abs(f - Math.round(f)) < 1e-9 * Math.max(1, Math.abs(f));
}

/** Nachkommastellen für Anzeigen: kleine Werte genauer, große ganzzahlig. */
export function displayDecimals(value: number): number {
  const v = Math.abs(value);
  if (v >= 1000) return 0;
  return v < 10 ? 2 : 1;
}
