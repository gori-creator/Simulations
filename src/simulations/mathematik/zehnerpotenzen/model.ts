/**
 * Rechenlogik „Potenzen, Zehnerpotenzen und Größenordnungen“:
 * Potenzen als wiederholte Multiplikation, Namen der Zehnerpotenzen,
 * Längeneinheiten als Zehnerpotenzen, die wissenschaftliche Schreibweise
 * a · 10ⁿ (exakt über Ziffernfolgen, ohne Rundungsfehler) und die Objekte
 * der Zoom-Reise vom Sandkorn bis zur Erde.
 */

export type Lang = 'de' | 'en';

/** Kleinste und größte Hochzahl der Zoom-Reise (in Metern: 1 mm bis 10 000 km). */
export const E_MIN = -3;
export const E_MAX = 7;

/** Größte Hochzahl im Modus „Potenz als Produkt“. */
export const N_MAX = 9;

/* ------------------------------------------------------------------ */
/* Potenzen                                                            */
/* ------------------------------------------------------------------ */

/**
 * Potenz bⁿ als wiederholte Multiplikation: n-mal den Faktor b.
 * b⁰ = 1 (leeres Produkt). Für natürliche Hochzahlen; die Ergebnisse dieser
 * Simulation (höchstens 10⁹) sind als JavaScript-Zahl exakt.
 */
export function power(base: number, exp: number): number {
  if (!Number.isInteger(exp) || exp < 0) throw new RangeError('Hochzahl muss eine natürliche Zahl sein');
  let v = 1;
  for (let i = 0; i < exp; i++) v *= base;
  return v;
}

/** Zwischenergebnisse des Produkts b · b · … · b: [b¹, b², …, bⁿ]. */
export function partialProducts(base: number, exp: number): number[] {
  const out: number[] = [];
  let v = 1;
  for (let i = 0; i < exp; i++) {
    v *= base;
    out.push(v);
  }
  return out;
}

/** Anzahl der Nullen am Ende einer natürlichen Zahl (0 hat keine „Endnullen“ im Sinne von 10ⁿ). */
export function trailingZeros(n: number): number {
  if (!Number.isInteger(n) || n <= 0) return 0;
  let k = 0;
  while (n % 10 === 0) {
    n /= 10;
    k++;
  }
  return k;
}

/** Anzahl der Ziffern einer natürlichen Zahl (10ⁿ hat n + 1 Ziffern). */
export function digitCount(n: number): number {
  return Math.max(1, String(Math.floor(Math.abs(n))).length);
}

const NAMES_DE = ['eins', 'zehn', 'hundert', 'tausend', 'zehntausend', 'hunderttausend', 'eine Million', 'zehn Millionen', 'hundert Millionen', 'eine Milliarde', 'zehn Milliarden', 'hundert Milliarden', 'eine Billion'];
const NAMES_EN = ['one', 'ten', 'one hundred', 'one thousand', 'ten thousand', 'one hundred thousand', 'one million', 'ten million', 'one hundred million', 'one billion', 'ten billion', 'one hundred billion', 'one trillion'];

/** Zahlwort von 10ⁿ (0 ≤ n ≤ 12): „tausend“, „eine Million“, „eine Milliarde“ … (EN: billion = 10⁹). */
export function powerOfTenName(n: number, lang: Lang): string {
  return (lang === 'de' ? NAMES_DE : NAMES_EN)[n] ?? '';
}

const DE_ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** Sprechweise einer Potenz: „drei hoch vier“ bzw. „three to the power of four“. */
export function powerReading(base: number, exp: number, lang: Lang): string {
  const b = (lang === 'de' ? DE_ONES : EN_ONES)[base] ?? String(base);
  const e = (lang === 'de' ? DE_ONES : EN_ONES)[exp] ?? String(exp);
  return lang === 'de' ? `${b} hoch ${e}` : `${b} to the power of ${e}`;
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '−': '⁻' };

/** Hochgestellte Ziffern für Texte: −3 → „⁻³“. */
export function superscript(n: number | string): string {
  return String(n)
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('');
}

/** Ziffern in Dreiergruppen: DE „1 000 000“ (schmales Leerzeichen), EN „1,000,000“. */
export function groupDigits(n: number | string, lang: Lang): string {
  const s = typeof n === 'number' ? String(Math.floor(Math.abs(n))) : n;
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'de' ? ' ' : ',');
}

/* ------------------------------------------------------------------ */
/* Dezimalzahlen als Ziffernfolgen                                     */
/* ------------------------------------------------------------------ */

/** Positive Dezimalzahl als Ziffernfolgen vor und nach dem Komma (ohne führende/abschließende Nullen, `int` mindestens „0“). */
export interface Decimal {
  int: string;
  frac: string;
}

/** Höchstens so viele Ziffern vor bzw. nach dem Komma. */
export const MAX_INT_DIGITS = 13;
export const MAX_FRAC_DIGITS = 10;

/** Entfernt führende Nullen vor und abschließende Nullen nach dem Komma. */
export function normalizeDecimal(d: Decimal): Decimal {
  const int = d.int.replace(/^0+(?=\d)/, '') || '0';
  const frac = d.frac.replace(/0+$/, '');
  return { int, frac };
}

/**
 * Liest eine Eingabe wie „35 000“, „1.270.000“, „0,0042“ oder „2.5“.
 * Leerzeichen gliedern nur. Ein Komma ist das Dezimalkomma (Punkte davor
 * gliedern dann Tausender); ohne Komma ist ein einzelner Punkt ein
 * Dezimalpunkt, mehrere Punkte gliedern. `null` bei ungültiger Eingabe.
 */
export function parseDecimal(input: string): Decimal | null {
  let s = input.trim().replace(/[\s   '’_]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  if (!s) return null;
  let intPart: string;
  let fracPart = '';
  if (s.includes(',')) {
    const parts = s.split(',');
    if (parts.length !== 2) return null;
    intPart = parts[0]!.replace(/\./g, '');
    fracPart = parts[1]!;
  } else {
    const dots = s.split('.');
    if (dots.length === 2) {
      intPart = dots[0]!;
      fracPart = dots[1]!;
    } else intPart = dots.join('');
  }
  if (intPart === '') intPart = '0';
  if (!/^\d+$/.test(intPart) || !/^\d*$/.test(fracPart)) return null;
  const d = normalizeDecimal({ int: intPart, frac: fracPart });
  if (d.int.length > MAX_INT_DIGITS || d.frac.length > MAX_FRAC_DIGITS) return null;
  return d;
}

/** Ist die Zahl 0? */
export function isZero(d: Decimal): boolean {
  return /^0*$/.test(d.int) && /^0*$/.test(d.frac);
}

/** Zahlenwert (für Plausibilitätsprüfungen; exakt bleiben die Ziffernfolgen). */
export function decimalValue(d: Decimal): number {
  return Number(`${d.int}.${d.frac || '0'}`);
}

/** Dezimalzahl als Text mit Dreiergruppen: DE „35 000“, „0,0042“; EN „35,000“, „0.0042“. */
export function formatDecimal(d: Decimal, lang: Lang): string {
  const n = normalizeDecimal(d);
  const int = groupDigits(n.int, lang);
  if (!n.frac) return int;
  // lange Nachkommateile von links in Dreiergruppen (0,000 001)
  const frac = n.frac.length > 4 ? n.frac.replace(/(\d{3})(?=\d)/g, `$1${lang === 'de' ? ' ' : ' '}`) : n.frac;
  return `${int}${lang === 'de' ? ',' : '.'}${frac}`;
}

/* ------------------------------------------------------------------ */
/* Wissenschaftliche Schreibweise                                      */
/* ------------------------------------------------------------------ */

/**
 * Zahl in wissenschaftlicher Schreibweise a · 10ⁿ mit 1 ≤ a < 10.
 * `digits`: die gültigen Ziffern von a ohne Komma (erste ≠ 0, keine Endnullen),
 * also a = digits[0], digits[1…] (z. B. „35“ → a = 3,5).
 */
export interface Scientific {
  digits: string;
  exponent: number;
}

/**
 * Lage des Kommas in der Ziffernreihe `int + frac` (normalisiert):
 * `from` = Index hinter der letzten Vorkommastelle, `to` = Index hinter der
 * ersten Ziffer ≠ 0. Die Hochzahl ist from − to: Wandert das Komma nach
 * links, ist sie positiv, nach rechts negativ. `null` für die Zahl 0.
 */
export function commaShift(d: Decimal): { row: string; from: number; to: number; first: number; last: number } | null {
  const n = normalizeDecimal(d);
  const row = n.int + n.frac;
  const first = row.search(/[1-9]/);
  if (first < 0) return null;
  let last = row.length - 1;
  while (last > first && row[last] === '0') last--;
  return { row, from: n.int.length, to: first + 1, first, last };
}

/** Wandelt eine positive Dezimalzahl in a · 10ⁿ um (exakt). `null` für 0. */
export function toScientific(d: Decimal): Scientific | null {
  const c = commaShift(d);
  if (!c) return null;
  return { digits: c.row.slice(c.first, c.last + 1), exponent: c.from - c.to };
}

/** Rückweg: a · 10ⁿ als gewöhnliche Dezimalzahl (normalisiert). */
export function fromScientific(s: Scientific): Decimal {
  const point = 1 + s.exponent; // Lage des Kommas relativ zum Anfang von digits
  let int: string;
  let frac: string;
  if (point <= 0) {
    int = '0';
    frac = '0'.repeat(-point) + s.digits;
  } else if (point >= s.digits.length) {
    int = s.digits + '0'.repeat(point - s.digits.length);
    frac = '';
  } else {
    int = s.digits.slice(0, point);
    frac = s.digits.slice(point);
  }
  return normalizeDecimal({ int, frac });
}

/** Faktor a als Text: „3,5“, „1,27“, „4“ (EN mit Punkt). */
export function mantissaText(s: Scientific, lang: Lang): string {
  const rest = s.digits.slice(1);
  return rest ? `${s.digits[0]}${lang === 'de' ? ',' : '.'}${rest}` : s.digits;
}

/** Zahlenwert von a (1 ≤ a < 10). */
export function mantissaValue(s: Scientific): number {
  return Number(`${s.digits[0]}.${s.digits.slice(1) || '0'}`);
}

/** 10ⁿ als Dezimalzahl, auch für negative n: 10⁻³ = 0,001. */
export function powerOfTenDecimal(n: number): Decimal {
  return n >= 0 ? { int: `1${'0'.repeat(n)}`, frac: '' } : { int: '0', frac: `${'0'.repeat(-n - 1)}1` };
}

/** Näherung einer positiven Zahl als a · 10ⁿ (für Größenangaben, a auf `digits` gültige Ziffern gerundet). */
export function approxScientific(x: number, digits = 3): { mantissa: number; exponent: number } {
  if (!(x > 0) || !Number.isFinite(x)) return { mantissa: 0, exponent: 0 };
  let exponent = Math.floor(Math.log10(x));
  const factor = 10 ** (digits - 1);
  let mantissa = Math.round((x / 10 ** exponent) * factor * (1 + 4 * Number.EPSILON)) / factor;
  if (mantissa >= 10) {
    mantissa /= 10;
    exponent += 1;
  } else if (mantissa < 1) {
    mantissa *= 10;
    exponent -= 1;
  }
  return { mantissa, exponent };
}

/* ------------------------------------------------------------------ */
/* Längeneinheiten                                                     */
/* ------------------------------------------------------------------ */

export type LengthUnit = 'mm' | 'cm' | 'dm' | 'm' | 'km';

/** Hochzahl der Einheit in Metern: 1 km = 10³ m, 1 mm = 10⁻³ m. */
export const UNIT_EXP: Record<LengthUnit, number> = { mm: -3, cm: -2, dm: -1, m: 0, km: 3 };

/** 1 `from` = 10^k `to`: unitPower('km', 'm') = 3, unitPower('m', 'mm') = 3, unitPower('mm', 'm') = −3. */
export function unitPower(from: LengthUnit, to: LengthUnit): number {
  return UNIT_EXP[from] - UNIT_EXP[to];
}

/** Passende Einheit für eine Länge in Metern (mm, cm, m oder km) und der Zahlenwert darin. */
export function lengthParts(meters: number): { value: number; unit: LengthUnit } {
  const a = Math.abs(meters);
  // kleine Zuschläge gegen Darstellungsfehler (10⁻² · 100 = 0,99999…)
  const fix = (v: number) => Math.round(v * 1e9) / 1e9;
  if (a < 0.01 * (1 - 1e-9)) return { value: fix(meters * 1000), unit: 'mm' };
  if (a < 1 * (1 - 1e-9)) return { value: fix(meters * 100), unit: 'cm' };
  if (a < 1000 * (1 - 1e-9)) return { value: fix(meters), unit: 'm' };
  return { value: fix(meters / 1000), unit: 'km' };
}

/** 10ᵉ m in einer passenden Einheit, für ganze Hochzahlen exakt: 10³ m → 1 km, 10⁻² m → 1 cm, 10⁻¹ m → 10 cm. */
export function powerLength(e: number): { value: number; unit: LengthUnit } {
  const unit: LengthUnit = e <= -3 ? 'mm' : e < 0 ? 'cm' : e < 3 ? 'm' : 'km';
  const k = e - UNIT_EXP[unit];
  return { value: Number.isInteger(k) && k >= 0 ? power(10, k) : 10 ** k, unit };
}

/** Größte ganze Hochzahl k mit 10ᵏ ≤ 10ᵉ, robust gegen Rundung (2,9999999 → 3). */
export function floorExp(e: number): number {
  return Math.floor(e + 1e-9);
}

/* ------------------------------------------------------------------ */
/* Objekte der Zoom-Reise                                              */
/* ------------------------------------------------------------------ */

export type ObjId = 'sand' | 'bug' | 'apple' | 'child' | 'house' | 'field' | 'peak' | 'plane' | 'space' | 'iss' | 'earth';

/**
 * Ein Objekt mit typischer Größe in Metern. `kind`: steht auf dem Boden,
 * schwebt in der angegebenen Höhe (Flugzeug, Raumstation, Grenze zum
 * Weltraum) oder ist die Erde selbst. `x`: Lage in der Szene (Mitte, in m);
 * die Objekte stehen der Größe nach nebeneinander, so dass beim Zoomen das
 * kleinere Objekt links neben dem größeren sichtbar bleibt. Die Erde liegt
 * als Kugel unter allem; ihr höchster Punkt ist bei x = 3 200 m.
 */
export interface SizeObject {
  id: ObjId;
  size: number;
  kind: 'ground' | 'sky' | 'earth';
  x: number;
}

/** Erdradius (mittlerer, gerundet) und Erddurchmesser in Metern. */
export const EARTH_RADIUS = 6_371_000;
export const EARTH_DIAMETER = 12_742_000;

export const OBJECTS: readonly SizeObject[] = [
  { id: 'sand', size: 0.001, kind: 'ground', x: 0.0016 },
  { id: 'bug', size: 0.007, kind: 'ground', x: 0.0095 },
  { id: 'apple', size: 0.08, kind: 'ground', x: 0.085 },
  { id: 'child', size: 1.4, kind: 'ground', x: 0.8 },
  { id: 'house', size: 10, kind: 'ground', x: 8 },
  { id: 'field', size: 105, kind: 'ground', x: 92 },
  { id: 'peak', size: 2962, kind: 'ground', x: 3200 },
  { id: 'plane', size: 10_000, kind: 'sky', x: 15_000 },
  { id: 'space', size: 100_000, kind: 'sky', x: 40_000 },
  { id: 'iss', size: 400_000, kind: 'sky', x: 70_000 },
  { id: 'earth', size: EARTH_DIAMETER, kind: 'earth', x: 3200 },
];

/** Hochzahl der Größe: log₁₀(Größe in m). */
export function objectExp(o: SizeObject): number {
  return Math.log10(o.size);
}

/** Index des Objekts, dessen Größenordnung am nächsten bei 10ᵉ m liegt. */
export function nearestObject(e: number): number {
  let best = 0;
  let bd = Infinity;
  OBJECTS.forEach((o, i) => {
    const d = Math.abs(objectExp(o) - e);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

/**
 * Mitte der Kamera (x in m) bei der Hochzahl e: zwischen zwei Objekten
 * geometrisch gemittelt, damit die Fahrt bei jedem Zoom gleich schnell wirkt.
 */
export function cameraX(e: number): number {
  const list = OBJECTS;
  const first = list[0]!;
  const last = list[list.length - 1]!;
  if (e <= objectExp(first)) return first.x;
  const lastE = Math.min(E_MAX, objectExp(last));
  if (e >= lastE) return last.x;
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i]!;
    const b = list[i + 1]!;
    const ea = objectExp(a);
    const eb = Math.min(E_MAX, objectExp(b));
    if (e >= ea && e <= eb) {
      const t = eb > ea ? (e - ea) / (eb - ea) : 1;
      const s = t * t * (3 - 2 * t);
      return Math.exp(Math.log(a.x) + (Math.log(b.x) - Math.log(a.x)) * s);
    }
  }
  return last.x;
}
