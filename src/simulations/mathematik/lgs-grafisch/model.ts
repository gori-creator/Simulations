/**
 * Lineare Gleichungssysteme mit zwei Variablen grafisch lösen.
 *
 * Jede Gleichung a·x + b·y = c beschreibt eine Gerade. Die Lösungen des
 * Systems sind die gemeinsamen Punkte beider Geraden: genau ein Schnittpunkt,
 * keiner (parallel) oder unendlich viele (identisch).
 *
 * Alle Koeffizienten werden als ganze Zahlen gespeichert (Eingaben mit
 * höchstens zwei Nachkommastellen werden mit 100 erweitert), damit die
 * Lösung exakt als Bruch angegeben werden kann.
 */

/** Gerade a·x + b·y = c mit ganzzahligen Koeffizienten. */
export interface Line {
  a: number;
  b: number;
  c: number;
}

export interface Frac {
  num: number;
  den: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function frac(num: number, den = 1): Frac {
  if (den === 0) throw new Error('Nenner 0');
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den) || 1;
  return { num: num / g, den: den / g };
}

export const value = (f: Frac) => f.num / f.den;

/** Gerade y = m·x + t (Normalform). */
export function fromNormal(m: number, t: number): Line {
  return reduce({ a: -Math.round(m * 100), b: 100, c: Math.round(t * 100) });
}

/** Gerade a·x + b·y = c (allgemeine Form). */
export function fromGeneral(a: number, b: number, c: number): Line {
  return { a: Math.round(a), b: Math.round(b), c: Math.round(c) };
}

/** Tarif: Kosten y in € = Grundgebühr g in € + Minutenpreis p in ct · x Minuten / 100. */
export function fromTariff(g: number, p: number): Line {
  return reduce({ a: -Math.round(p), b: 100, c: Math.round(g * 100) });
}

/** Gemeinsamen Teiler herauskürzen (ändert die Gerade nicht). */
export function reduce(l: Line): Line {
  const g = gcd(gcd(l.a, l.b), l.c) || 1;
  return { a: l.a / g, b: l.b / g, c: l.c / g };
}

/** Beschreibt die Gleichung überhaupt eine Gerade? (a und b nicht beide 0) */
export function isLine(l: Line): boolean {
  return l.a !== 0 || l.b !== 0;
}

export type Solution =
  | { kind: 'unique'; x: Frac; y: Frac }
  | { kind: 'parallel' }
  | { kind: 'identical' }
  | { kind: 'invalid' };

/** Löst das System (Cramersche Regel mit ganzen Zahlen, also exakt). */
export function solve(l1: Line, l2: Line): Solution {
  if (!isLine(l1) || !isLine(l2)) return { kind: 'invalid' };
  const d = l1.a * l2.b - l2.a * l1.b;
  if (d !== 0) return { kind: 'unique', x: frac(l1.c * l2.b - l2.c * l1.b, d), y: frac(l1.a * l2.c - l2.a * l1.c, d) };
  // Gleiche Richtung: identisch, wenn auch die rechten Seiten im selben Verhältnis stehen
  const same = l1.a * l2.c - l2.a * l1.c === 0 && l1.b * l2.c - l2.b * l1.c === 0;
  return same ? { kind: 'identical' } : { kind: 'parallel' };
}

/** Normalform y = m·x + t, falls die Gerade nicht senkrecht ist; sonst x = k. */
export type Normal = { kind: 'normal'; m: Frac; t: Frac } | { kind: 'vertical'; x: Frac };

export function normalOf(l: Line): Normal {
  if (l.b === 0) return { kind: 'vertical', x: frac(l.c, l.a) };
  return { kind: 'normal', m: frac(-l.a, l.b), t: frac(l.c, l.b) };
}

/** y-Wert der Geraden an der Stelle x (NaN bei senkrechten Geraden). */
export function yAt(l: Line, x: number): number {
  return l.b === 0 ? NaN : (l.c - l.a * x) / l.b;
}

/** Erfüllt der Punkt die Gleichung? (exakt mit Brüchen) */
export function satisfies(l: Line, x: Frac, y: Frac): boolean {
  // a·x + b·y = c  ⇔  a·xn·yd + b·yn·xd = c·xd·yd
  return l.a * x.num * y.den + l.b * y.num * x.den === l.c * x.den * y.den;
}

/* ------------------------------------------------------------------ */
/* Zahlen und Terme als Text                                           */
/* ------------------------------------------------------------------ */

export type Lang = 'de' | 'en';
const MINUS = '−';

/** Endet die Dezimaldarstellung nach höchstens `max` Stellen? */
function decimalDigits(f: Frac, max = 3): number | null {
  for (let k = 0; k <= max; k++) if ((f.num * 10 ** k) % f.den === 0) return k;
  return null;
}

/** Bruch als Text: „3“, „−1,5“, „4/3“. */
export function fracText(f: Frac, lang: Lang): string {
  const k = decimalDigits(f);
  const sign = f.num < 0 ? MINUS : '';
  if (k !== null) {
    const s = (Math.abs(f.num) / f.den).toFixed(k);
    return sign + (lang === 'de' ? s.replace('.', ',') : s);
  }
  return `${sign}${Math.abs(f.num)}/${f.den}`;
}

/** Näherungswert für die grafische Lösung (eine Nachkommastelle). */
export function approxText(f: Frac, lang: Lang): string {
  const v = Math.round(value(f) * 10) / 10;
  const s = Math.abs(v).toFixed(Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 1);
  return (v < 0 ? MINUS : '') + (lang === 'de' ? s.replace('.', ',') : s);
}

export const isExactDecimal = (f: Frac) => decimalDigits(f) !== null;

/** Koeffizient vor einer Variablen: „2x“, „x“, „−x“, „1/2 x“. */
function coefTerm(f: Frac, variable: string, lang: Lang, first: boolean): string {
  const neg = f.num < 0;
  const abs = { num: Math.abs(f.num), den: f.den };
  const body = abs.num === abs.den ? variable : `${fracText(abs, lang)}${isExactDecimal(abs) ? '' : ' '}${variable}`;
  if (first) return neg ? `${MINUS}${body}` : body;
  return neg ? ` ${MINUS} ${body}` : ` + ${body}`;
}

function constTerm(f: Frac, lang: Lang, first: boolean): string {
  const neg = f.num < 0;
  const body = fracText({ num: Math.abs(f.num), den: f.den }, lang);
  if (first) return neg ? `${MINUS}${body}` : body;
  return neg ? ` ${MINUS} ${body}` : ` + ${body}`;
}

/** Normalform als Text: „y = 2x − 1“, „y = −x“, „y = 3“, „x = 2“. */
export function normalText(l: Line, lang: Lang): string {
  const n = normalOf(l);
  if (n.kind === 'vertical') return `x = ${fracText(n.x, lang)}`;
  let rhs = '';
  if (n.m.num !== 0) rhs += coefTerm(n.m, 'x', lang, true);
  if (n.t.num !== 0 || !rhs) rhs += constTerm(n.t, lang, !rhs);
  return `y = ${rhs}`;
}

/** Allgemeine Form als Text: „2x + y = 5“, „x − y = 1“, „3y = 6“. */
export function generalText(l: Line, lang: Lang): string {
  let lhs = '';
  if (l.a !== 0) lhs += coefTerm(frac(l.a), 'x', lang, true);
  if (l.b !== 0) lhs += coefTerm(frac(l.b), 'y', lang, !lhs);
  if (!lhs) lhs = '0';
  return `${lhs} = ${fracText(frac(l.c), lang)}`;
}

/** Punkt in Schulschreibweise: DE „(2 | 3)“, EN „(2, 3)“. */
export function pointText(x: Frac, y: Frac, lang: Lang): string {
  return lang === 'de' ? `(${fracText(x, lang)} | ${fracText(y, lang)})` : `(${fracText(x, lang)}, ${fracText(y, lang)})`;
}

/* ------------------------------------------------------------------ */
/* Ansicht                                                             */
/* ------------------------------------------------------------------ */

/** „Schöne“ obere Grenze für eine Achse (1, 2, 2,5, 5 · 10^k). */
export function niceMax(v: number): number {
  if (!(v > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

/**
 * Tarifvergleich: Für welche Gesprächszeiten ist welcher Tarif günstiger?
 * `cheaperBelow`: Tarif, der unterhalb des Schnittpunkts günstiger ist.
 */
export function compareTariffs(g1: number, p1: number, g2: number, p2: number): { kind: 'same' } | { kind: 'always'; cheaper: 1 | 2 } | { kind: 'cross'; minutes: number; cost: number; cheaperBelow: 1 | 2 } {
  if (g1 === g2 && p1 === p2) return { kind: 'same' };
  if (p1 === p2) return { kind: 'always', cheaper: g1 < g2 ? 1 : 2 };
  const minutes = ((g2 - g1) * 100) / (p1 - p2);
  if (minutes <= 0) {
    // Kein Schnittpunkt bei positiver Gesprächszeit: Ein Tarif ist immer günstiger (oder gleich)
    return { kind: 'always', cheaper: p1 < p2 ? 1 : 2 };
  }
  return { kind: 'cross', minutes, cost: g1 + (p1 * minutes) / 100, cheaperBelow: g1 < g2 ? 1 : 2 };
}
