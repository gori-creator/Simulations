/**
 * Rechenlogik „Brüche multiplizieren und dividieren“: Produkt im
 * Rechteckmodell (Felder zählen), Kürzen vor dem Ausmultiplizieren
 * (über Kreuz), Division als „Wie oft passt … in …?“ (Messen mit
 * Streifen über den gemeinsamen Nenner) und die Kehrwert-Regel.
 *
 * Alles rechnet exakt mit ganzen Zahlen.
 */

export interface Fraction {
  z: number;
  n: number;
}

/** Größter gemeinsamer Teiler (ggT(0; n) = n, ggT(0; 0) = 1). */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Kleinstes gemeinsames Vielfaches. */
export function lcm(a: number, b: number): number {
  return Math.abs((a / gcd(a, b)) * b);
}

/** Vollständig gekürzt (0/n → 0/1). */
export function reduce(f: Fraction): Fraction {
  if (f.z === 0) return { z: 0, n: 1 };
  const g = gcd(f.z, f.n);
  return { z: f.z / g, n: f.n / g };
}

/** Gemischte Zahl: 9/8 = 1 1/8. */
export function mixed(f: Fraction): { whole: number; rest: Fraction } {
  const whole = Math.floor(f.z / f.n);
  return { whole, rest: { z: f.z - whole * f.n, n: f.n } };
}

export const value = (f: Fraction) => f.z / f.n;

/** Vergleich exakt: −1, 0, 1. */
export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const l = a.z * b.n;
  const r = b.z * a.n;
  return l < r ? -1 : l > r ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* Multiplizieren                                                      */
/* ------------------------------------------------------------------ */

export interface Product {
  /** Zähler mal Zähler, Nenner mal Nenner (ungekürzt). */
  raw: Fraction;
  reduced: Fraction;
  /** Rechteckmodell: Felder je Ganzes (b · d) und gefärbte Felder (a · c). */
  cellsPerWhole: number;
  cells: number;
}

/** a/b · c/d = (a · c)/(b · d). */
export function multiply(x: Fraction, y: Fraction): Product {
  const raw = { z: x.z * y.z, n: x.n * y.n };
  return { raw, reduced: reduce(raw), cellsPerWhole: raw.n, cells: raw.z };
}

export interface CrossCancel {
  /** Gekürzt wird jeweils ein Zähler mit dem Nenner des anderen Bruchs (über Kreuz) … */
  g1: number;
  g2: number;
  /** … und innerhalb desselben Bruchs. */
  gx: number;
  gy: number;
  /** Faktoren nach dem Kürzen. */
  x: Fraction;
  y: Fraction;
  result: Fraction;
}

/**
 * Vor dem Ausmultiplizieren kürzen: erst jeden Bruch für sich, dann über
 * Kreuz (Zähler des einen mit dem Nenner des anderen). Das Ergebnis ist
 * danach immer vollständig gekürzt.
 */
export function crossCancel(x: Fraction, y: Fraction): CrossCancel {
  const gx = gcd(x.z, x.n);
  const gy = gcd(y.z, y.n);
  let a = x.z / gx;
  let b = x.n / gx;
  let c = y.z / gy;
  let d = y.n / gy;
  const g1 = gcd(a, d);
  a /= g1;
  d /= g1;
  const g2 = gcd(c, b);
  c /= g2;
  b /= g2;
  return { g1, g2, gx, gy, x: { z: a, n: b }, y: { z: c, n: d }, result: { z: a * c, n: b * d } };
}

/* ------------------------------------------------------------------ */
/* Dividieren                                                          */
/* ------------------------------------------------------------------ */

/** Kehrwert c/d → d/c (c ≠ 0). */
export function reciprocal(f: Fraction): Fraction {
  return { z: f.n, n: f.z };
}

/** a/b : c/d = a/b · d/c = (a · d)/(b · c). */
export function divide(x: Fraction, y: Fraction): { viaReciprocal: Fraction; raw: Fraction; reduced: Fraction } {
  const r = reciprocal(y);
  const raw = { z: x.z * r.z, n: x.n * r.n };
  return { viaReciprocal: r, raw, reduced: reduce(raw) };
}

export interface Measure {
  /** Gemeinsamer Nenner N = kgV(b; d). */
  N: number;
  /** Beide Brüche in N-teln: A/N : C/N = A : C. */
  A: number;
  C: number;
  /** So oft passt der Streifen ganz hinein … */
  full: number;
  /** … und der Rest (in N-teln) als Anteil des Streifens. */
  restParts: number;
  restOfStrip: Fraction;
  /** Ergebnis A/C, gekürzt. */
  quotient: Fraction;
}

/**
 * Division als Messen: „Wie oft passt c/d in a/b?“ Über den gemeinsamen
 * Nenner werden beide Brüche zu gleich großen Stücken; dann zählt man:
 * a/b : c/d = A/N : C/N = A : C.
 */
export function measure(x: Fraction, y: Fraction): Measure {
  const N = lcm(x.n, y.n);
  const A = (x.z * N) / x.n;
  const C = (y.z * N) / y.n;
  const full = Math.floor(A / C);
  const restParts = A - full * C;
  return { N, A, C, full, restParts, restOfStrip: reduce({ z: restParts, n: C }), quotient: reduce({ z: A, n: C }) };
}
