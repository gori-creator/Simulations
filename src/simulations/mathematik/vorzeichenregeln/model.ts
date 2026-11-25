/**
 * Rechenlogik zu den Vorzeichenregeln beim Multiplizieren und Dividieren
 * ganzer Zahlen.
 */

export type Sign = 1 | -1 | 0;

export function sign(x: number): Sign {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

/** Vorzeichen eines Produkts oder Quotienten aus den Vorzeichen der Faktoren. */
export function signRule(a: number, b: number): Sign {
  return ((sign(a) * sign(b)) || 0) as Sign;
}

/** Quotient a : b; null bei Division durch 0. */
export function quotient(a: number, b: number): number | null {
  if (b === 0) return null;
  const q = a / b;
  return q === 0 ? 0 : q;
}

export interface PatternRow {
  a: number;
  value: number;
}

/**
 * Permanenzprinzip: Zeilen a · b für a = from, from − 1, …, to.
 * Von Zeile zu Zeile ändert sich das Ergebnis immer um −b.
 */
export function patternRows(b: number, from = 3, to = -3): PatternRow[] {
  const rows: PatternRow[] = [];
  for (let a = from; a >= to; a--) {
    const v = a * b;
    rows.push({ a, value: v === 0 ? 0 : v });
  }
  return rows;
}

/**
 * Schuldenmodell: Der Kontostand ändert sich um k · w, wenn k Karten mit dem
 * Wert w hinzukommen (k > 0) oder weggenommen werden (k < 0).
 */
export function balanceAfter(start: number, k: number, w: number): number {
  const v = start + k * w;
  return v === 0 ? 0 : v;
}

/**
 * Sprünge am Zahlenstrahl für a · b: |a| Sprünge der Länge b ab 0.
 * Bei negativem a wird anschließend an der Null gespiegelt (Gegenzahl).
 */
export function jumps(a: number, b: number): { from: number; to: number }[] {
  const out: { from: number; to: number }[] = [];
  for (let i = 0; i < Math.abs(a); i++) out.push({ from: i * b || 0, to: (i + 1) * b || 0 });
  return out;
}
