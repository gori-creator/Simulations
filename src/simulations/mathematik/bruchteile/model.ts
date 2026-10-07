/** Rechenlogik „Bruchteile darstellen“. */

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Vollständig gekürzter Bruch. */
export function reduce(z: number, n: number): { z: number; n: number } {
  const d = gcd(z, n);
  return { z: z / d, n: n / d };
}

/** Gemischte Zahl: z/n = whole + rest/n. */
export function mixed(z: number, n: number): { whole: number; rest: number } {
  return { whole: Math.floor(z / n), rest: z % n };
}

/**
 * Dezimaldarstellung durch schriftliches Dividieren: ganzzahliger Teil,
 * Vorperiode und Periode (leer, wenn der Dezimalbruch endlich ist).
 */
export function decimalExpansion(z: number, n: number, maxDigits = 60): { integer: number; pre: string; period: string } {
  const integer = Math.floor(z / n);
  let remainder = z % n;
  const seen = new Map<number, number>();
  let digits = '';
  while (remainder !== 0 && !seen.has(remainder) && digits.length < maxDigits) {
    seen.set(remainder, digits.length);
    remainder *= 10;
    digits += String(Math.floor(remainder / n));
    remainder %= n;
  }
  if (remainder === 0 || !seen.has(remainder)) return { integer, pre: digits, period: '' };
  const start = seen.get(remainder)!;
  return { integer, pre: digits.slice(0, start), period: digits.slice(start) };
}
