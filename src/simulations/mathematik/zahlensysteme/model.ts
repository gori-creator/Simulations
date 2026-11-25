/**
 * Stellenwertsysteme mit beliebiger Basis (2 bis 16), Umrechnen mit dem
 * Divisionsverfahren, schriftliche Addition sowie Zahlschriften anderer
 * Kulturen (römisch, Maya, babylonisch).
 */

const DIGITS = '0123456789ABCDEF';

export function digitChar(d: number): string {
  return DIGITS[d] ?? '?';
}

/** Ziffern von n zur Basis b, höchste Stelle zuerst. */
export function toDigits(n: number, base: number): number[] {
  if (n <= 0) return [0];
  const out: number[] = [];
  let v = Math.floor(n);
  while (v > 0) {
    out.unshift(v % base);
    v = Math.floor(v / base);
  }
  return out;
}

export function toBase(n: number, base: number): string {
  return toDigits(n, base).map(digitChar).join('');
}

/** Zeichenkette zur Basis b lesen; null bei ungültiger Ziffer. */
export function parseBase(s: string, base: number): number | null {
  let v = 0;
  for (const ch of s.toUpperCase()) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    v = v * base + d;
  }
  return s.length ? v : null;
}

export interface DivStep {
  n: number;
  q: number;
  r: number;
}

/** Divisionsverfahren: fortgesetztes Teilen durch die Basis, Reste von unten nach oben lesen. */
export function divisionSteps(n: number, base: number): DivStep[] {
  const steps: DivStep[] = [];
  let v = Math.floor(n);
  do {
    steps.push({ n: v, q: Math.floor(v / base), r: v % base });
    v = Math.floor(v / base);
  } while (v > 0);
  return steps;
}

export interface Addition {
  /** Ziffern rechtsbündig auf gleiche Länge gebracht (höchste Stelle zuerst) */
  x: number[];
  y: number[];
  sum: number[];
  /** Übertrag in jede Stelle (gleiche Länge wie sum) */
  carry: number[];
}

/** Schriftliche Addition zur Basis b mit Überträgen. */
export function addWritten(x: number, y: number, base: number): Addition {
  const sum = toDigits(x + y, base);
  const len = sum.length;
  const pad = (d: number[]) => [...Array(len - d.length).fill(0), ...d];
  const xd = pad(toDigits(x, base));
  const yd = pad(toDigits(y, base));
  const carry = Array(len).fill(0);
  let c = 0;
  for (let i = len - 1; i >= 0; i--) {
    carry[i] = c;
    const s = xd[i]! + yd[i]! + c;
    c = s >= base ? 1 : 0;
  }
  return { x: xd, y: yd, sum, carry };
}

/** Römische Zahlschrift (1 bis 3999); null außerhalb. */
export function toRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  const table: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let v = n;
  let s = '';
  for (const [val, sym] of table) {
    while (v >= val) {
      s += sym;
      v -= val;
    }
  }
  return s;
}

export function fromRoman(s: string): number {
  const val: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const a = val[s[i]!] ?? 0;
    const b = val[s[i + 1] ?? ''] ?? 0;
    total += a < b ? -a : a;
  }
  return total;
}

/** Maya-Ziffern (Basis 20): je Stelle Anzahl Striche (je 5) und Punkte. */
export function mayaDigits(n: number): { bars: number; dots: number; zero: boolean }[] {
  return toDigits(n, 20).map((d) => ({ bars: Math.floor(d / 5), dots: d % 5, zero: d === 0 }));
}

/** Babylonische Ziffern (Basis 60): je Stelle Anzahl Winkelhaken (Zehner) und Keile (Einer). */
export function babylonDigits(n: number): { tens: number; ones: number }[] {
  return toDigits(n, 60).map((d) => ({ tens: Math.floor(d / 10), ones: d % 10 }));
}
