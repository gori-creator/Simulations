/**
 * Rechenlogik „Endliche und periodische Dezimalbrüche“: schriftliche
 * Division Schritt für Schritt (mit Resten), Erkennen der Periode über einen
 * wiederkehrenden Rest, Vorhersage über die Primfaktoren des gekürzten
 * Nenners und Erweitern auf eine Zehnerpotenz.
 *
 * Alles rechnet exakt mit ganzen Zahlen – nie mit gerundeten Dezimalzahlen.
 */

/** Größter gemeinsamer Teiler (ggT(0; n) = n). */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Primfaktoren mit Vielfachheit, aufsteigend: 12 → [2, 2, 3]. */
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let rest = Math.abs(Math.round(n));
  for (let p = 2; p * p <= rest; p++) {
    while (rest % p === 0) {
      out.push(p);
      rest /= p;
    }
  }
  if (rest > 1) out.push(rest);
  return out;
}

/**
 * Ein Schritt der schriftlichen Division nach dem Komma: An den Rest wird eine
 * Null angehängt, geteilt, und es bleibt ein neuer Rest.
 *
 *   value = 10 · from,  digit = value div n,  product = digit · n,  rest = value − product
 */
export interface DivStep {
  /** Nummer der Nachkommastelle (1 = Zehntel, 2 = Hundertstel, …). */
  index: number;
  /** Rest vor dem Schritt. */
  from: number;
  /** Rest mit angehängter Null. */
  value: number;
  digit: number;
  product: number;
  /** Neuer Rest. */
  rest: number;
}

export type DecimalKind = 'ganz' | 'endlich' | 'rein' | 'gemischt';

export interface Expansion {
  z: number;
  n: number;
  /** Ganzzahliger Anteil z div n. */
  integer: number;
  /** Rest nach dem ganzzahligen Teil (Start für die Nachkommastellen). */
  r0: number;
  /**
   * Alle Schritte bis zum Ende: Rest 0 (endlich) bzw. bis ein Rest zum
   * ersten Mal wiederkehrt (dieser Schritt ist der letzte).
   */
  steps: DivStep[];
  kind: DecimalKind;
  /** Länge der Vorperiode (Ziffern vor der Periode). */
  preLength: number;
  /** Periodenlänge (0 bei endlichen Dezimalbrüchen). */
  periodLength: number;
  /** Alle berechneten Nachkommaziffern (Vorperiode + eine Periode). */
  digits: string;
  pre: string;
  period: string;
  /**
   * Bei periodischen Dezimalbrüchen: Index j des Rests r_j, der im letzten
   * Schritt wiederkehrt (r_0 ist der Rest nach dem ganzzahligen Teil);
   * sonst −1.
   */
  repeatOf: number;
}

/** Reste r_0, r_1, … der Division (r_i ist der Rest nach der i-ten Nachkommastelle). */
export function remainders(e: Expansion): number[] {
  return [e.r0, ...e.steps.map((s) => s.rest)];
}

/**
 * Schriftliche Division z : n mit Nachkommastellen, bis die Division aufgeht
 * oder ein Rest wiederkehrt. Weil jeder Rest kleiner als n ist, gibt es
 * höchstens n − 1 verschiedene Reste ungleich 0 – spätestens nach n Schritten
 * wiederholt sich einer.
 */
export function longDivision(z: number, n: number): Expansion {
  const integer = Math.floor(z / n);
  const r0 = z % n;
  const steps: DivStep[] = [];
  const seenAt = new Map<number, number>([[r0, 0]]);
  let rest = r0;
  let repeatOf = -1;
  while (rest !== 0) {
    const value = rest * 10;
    const digit = Math.floor(value / n);
    const product = digit * n;
    const next = value - product;
    steps.push({ index: steps.length + 1, from: rest, value, digit, product, rest: next });
    rest = next;
    if (rest === 0) break;
    const j = seenAt.get(rest);
    if (j !== undefined) {
      repeatOf = j;
      break;
    }
    seenAt.set(rest, steps.length);
  }
  const digits = steps.map((s) => String(s.digit)).join('');
  if (repeatOf < 0) {
    return {
      z,
      n,
      integer,
      r0,
      steps,
      kind: steps.length === 0 ? 'ganz' : 'endlich',
      preLength: steps.length,
      periodLength: 0,
      digits,
      pre: digits,
      period: '',
      repeatOf: -1,
    };
  }
  return {
    z,
    n,
    integer,
    r0,
    steps,
    kind: repeatOf === 0 ? 'rein' : 'gemischt',
    preLength: repeatOf,
    periodLength: steps.length - repeatOf,
    digits,
    pre: digits.slice(0, repeatOf),
    period: digits.slice(repeatOf),
    repeatOf,
  };
}

/** Kleinste Zahl k ≥ 1 mit 10^k ≡ 1 (mod m); m > 1 und teilerfremd zu 10. */
export function orderOfTen(m: number): number {
  if (m <= 1 || gcd(m, 10) !== 1) return 0;
  let r = 10 % m;
  let k = 1;
  while (r !== 1) {
    r = (r * 10) % m;
    k++;
  }
  return k;
}

export interface Prediction {
  /** Vollständig gekürzter Bruch. */
  z: number;
  n: number;
  /** Gekürzter Nenner = 2^a · 5^b · rest. */
  a: number;
  b: number;
  rest: number;
  kind: DecimalKind;
  /** Nachkommastellen (endlich) bzw. Länge der Vorperiode: max(a; b). */
  preLength: number;
  /** Periodenlänge: Ordnung von 10 modulo rest (0, wenn rest = 1). */
  periodLength: number;
}

/**
 * Vorhersage ohne Division, nur aus den Primfaktoren des gekürzten Nenners:
 * - nur 2 und 5 → endlich mit max(a; b) Nachkommastellen,
 * - keine 2 und keine 5 → rein periodisch,
 * - beides → gemischt periodisch mit Vorperiode der Länge max(a; b).
 */
export function predict(z: number, n: number): Prediction {
  const g = gcd(z, n);
  const zr = z / g;
  const nr = n / g;
  let rest = nr;
  let a = 0;
  let b = 0;
  while (rest % 2 === 0) {
    rest /= 2;
    a++;
  }
  while (rest % 5 === 0) {
    rest /= 5;
    b++;
  }
  const pre = Math.max(a, b);
  const periodLength = orderOfTen(rest);
  const kind: DecimalKind = rest === 1 ? (zr % nr === 0 ? 'ganz' : 'endlich') : pre === 0 ? 'rein' : 'gemischt';
  return { z: zr, n: nr, a, b, rest, kind, preLength: pre, periodLength };
}

/**
 * Endlicher Dezimalbruch als Bruch mit Zehnerpotenz im Nenner:
 * 3/8 = (3 · 125)/(8 · 125) = 375/1000. Erweitert wird der gekürzte Bruch.
 * Für periodische Dezimalbrüche `null` (keine Zehnerpotenz ist durch 3, 7, … teilbar).
 */
export function powerOfTen(z: number, n: number): { z: number; n: number; factor: number; numerator: number; power: number; k: number } | null {
  const p = predict(z, n);
  if (p.rest !== 1) return null;
  const k = p.preLength;
  const power = 10 ** k;
  const factor = power / p.n;
  return { z: p.z, n: p.n, factor, numerator: p.z * factor, power, k };
}

/** Nächster Rest beim Dividieren durch n: r ↦ 10 · r mod n (für den Restekreis). */
export function nextRemainder(r: number, n: number): number {
  return (r * 10) % n;
}

/**
 * Primfaktoren des Nenners mit Markierung der Faktoren, die beim Kürzen mit
 * dem Zähler wegfallen: z = 3, n = 12 → 2, 2, 3 (gekürzt).
 */
export function denominatorFactors(z: number, n: number): { p: number; cancelled: boolean }[] {
  const left = new Map<number, number>();
  for (const p of primeFactors(gcd(z, n))) left.set(p, (left.get(p) ?? 0) + 1);
  return primeFactors(n).map((p) => {
    const c = left.get(p) ?? 0;
    if (c > 0) {
      left.set(p, c - 1);
      return { p, cancelled: true };
    }
    return { p, cancelled: false };
  });
}

/** Ziffern als Text mit Dezimalkomma bzw. -punkt; Periode in eckigen Klammern (für Tests). */
export function plainDecimal(e: Expansion, sep = ','): string {
  if (e.kind === 'ganz') return String(e.integer);
  return `${e.integer}${sep}${e.pre}${e.period ? `[${e.period}]` : ''}`;
}

/**
 * Grenzen der Lupen-Stufe j als Text: links q,d₁…dⱼ, rechts eine Einheit der
 * j-ten Nachkommastelle mehr (mit Übertrag), z. B. 3/7, j = 2 → „0,42“ und „0,43“.
 * Nullen am Ende entfallen („0,5“ statt „0,50“).
 */
export function levelBounds(e: Expansion, j: number, sep = ','): [string, string] {
  const left = String(e.integer) + e.digits.slice(0, j).padEnd(j, '0');
  // Um eins erhöhen (Ziffernfolge als ganze Zahl)
  const d = left.split('').map(Number);
  let i = d.length - 1;
  while (i >= 0 && d[i] === 9) {
    d[i] = 0;
    i--;
  }
  if (i < 0) d.unshift(1);
  else d[i] = d[i]! + 1;
  const right = d.join('');
  const format = (s: string) => {
    if (j === 0) return s;
    const int = s.slice(0, s.length - j);
    const frac = s.slice(s.length - j).replace(/0+$/, '');
    return frac ? `${int}${sep}${frac}` : int;
  };
  return [format(left), format(right)];
}

/** Name der Stelle (1 = Zehntel, 2 = Hundertstel, …); ab der 7. Stelle `null`. */
export function placeName(index: number, lang: 'de' | 'en'): string | null {
  const de = ['Zehntel', 'Hundertstel', 'Tausendstel', 'Zehntausendstel', 'Hunderttausendstel', 'Millionstel'];
  const en = ['tenths', 'hundredths', 'thousandths', 'ten-thousandths', 'hundred-thousandths', 'millionths'];
  return (lang === 'de' ? de : en)[index - 1] ?? null;
}
