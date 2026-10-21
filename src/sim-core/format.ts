import { LANG_META, type Lang } from '../i18n/config';

/** Typografisches Minuszeichen (statt Bindestrich). */
export const MINUS = '−';

/** Geschütztes Leerzeichen: verhindert einen Zeilenumbruch zwischen Zahl und Einheit. */
export const NBSP = '\u00A0';

/**
 * Schmales geschütztes Leerzeichen (U+202F) als Tausendertrennzeichen:
 * „125 000“ nach DIN 1333 bzw. Duden (im Englischen nach SI ebenso).
 */
export const NNBSP = '\u202F';

/** Hängt eine Einheit mit geschütztem Leerzeichen an: `withUnit('2,5', 'm/s')` → „2,5 m/s“ ohne Umbruch. */
export function withUnit(value: string, unit: string): string {
  return unit ? `${value}${NBSP}${unit}` : value;
}

/**
 * Ersetzt in einem fertigen Text das Leerzeichen zwischen einer Zahl und einer
 * folgenden Einheit (z. B. „m/s“, „°C“, „kΩ“, „%“) durch ein geschütztes
 * Leerzeichen. Der Host wendet das auf alle Ergebnisse an; Simulationen müssen
 * dafür nichts ändern.
 *
 * Als Einheit gilt ein kurzes Wort (höchstens 6 Zeichen) aus Buchstaben bzw.
 * °, %, ‰, µ, Ω mit optionalen Hochzahlen und „/“, das danach endet. Rechenzeichen
 * wie „+“, „·“, „|“ oder „=“ bleiben unberührt, ebenso Zahlenfolgen („1 2 3“).
 */
export function bindUnits(text: string): string {
  return text.replace(
    /([0-9∞π])[ \t]+(?=[A-Za-zÄÖÜäöüµμΩ°%‰][A-Za-zÄÖÜäöüµμΩ°%‰²³¹⁰⁴⁵⁶⁷⁸⁹⁻·/]{0,5}(?![A-Za-zÄÖÜäöüß0-9]))/g,
    `$1${NBSP}`,
  );
}

/** Wie `bindUnits`, aber für HTML: Tags (samt Attributen) bleiben unverändert. */
export function bindUnitsHtml(html: string): string {
  return html
    .split(/(<[^>]*>)/)
    .map((part) => (part.startsWith('<') ? part : bindUnits(part)))
    .join('');
}

const formatters = new Map<string, Intl.NumberFormat>();

function numberFormat(lang: Lang, min: number, max: number): Intl.NumberFormat {
  const key = `${lang}:${min}:${max}`;
  let nf = formatters.get(key);
  if (!nf) {
    nf = new Intl.NumberFormat(LANG_META[lang].locale, {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
      useGrouping: false,
    });
    formatters.set(key, nf);
  }
  return nf;
}

export interface NumberOptions {
  /** Höchstens so viele Nachkommastellen (Standard 2). */
  decimals?: number;
  /** Nachkommastellen immer auffüllen (z. B. "2,50"). */
  fixed?: boolean;
  /** Pluszeichen bei positiven Zahlen. */
  signed?: boolean;
  /**
   * Tausendertrennung (Standard an): Ab 5 Stellen vor dem Komma werden je drei
   * Ziffern mit schmalem geschütztem Leerzeichen gruppiert („125 000“,
   * „−12 500“); vierstellige Zahlen bleiben ungruppiert („1257“). Für Werte in
   * Eingabefeldern `false`, damit man sie bearbeiten kann (siehe `Formatter.plain`).
   */
  grouping?: boolean;
}

/**
 * Gruppiert den ganzzahligen Teil einer fertig formatierten Zahl (ohne
 * Vorzeichen) ab 5 Stellen in Dreiergruppen mit schmalem geschütztem Leerzeichen.
 */
export function groupThousands(digits: string): string {
  const int = /^\d*/.exec(digits)?.[0] ?? '';
  if (int.length < 5) return digits;
  return int.replace(/\B(?=(\d{3})+$)/g, NNBSP) + digits.slice(int.length);
}

/**
 * Rundet kaufmännisch auf `decimals` Nachkommastellen (5 aufwärts, vom Betrag
 * her – also −0,875 → −0,88 wie im Unterricht).
 *
 * Vorher wird der Betrag auf 12 signifikante Stellen normalisiert: Rechenwerte
 * wie −0,0625 kommen aus der Gleitkommarechnung oft als −0,0624999999999…
 * oder 1,005 als 1,00499999999… an und würden sonst „falsch“ abgerundet. Das
 * Verschieben des Kommas geschieht über die Dezimalschreibweise („…e+2“), damit
 * dabei kein neuer Darstellungsfehler entsteht. Zahlen mit mehr als 12
 * angezeigten Stellen werden entsprechend genauer (höchstens 15 Stellen) behandelt,
 * noch größere bleiben unverändert.
 * −0 wird zu 0.
 */
export function roundHalfUp(value: number, decimals = 2): number {
  if (!Number.isFinite(value) || value === 0) return value === 0 ? 0 : value;
  const abs = Math.abs(value);
  const intDigits = Math.floor(Math.log10(abs)) + 1;
  // So große Zahlen haben ohnehin keine darstellbaren Nachkommastellen mehr.
  if (intDigits + decimals > 15) return value;
  const precision = Math.min(15, Math.max(12, intDigits + decimals));
  const [mantissa, exponent] = abs.toExponential(precision - 1).split('e');
  const shifted = Number(`${mantissa}e${Number(exponent) + decimals}`);
  const rounded = Number(`${Math.round(shifted)}e${-decimals}`);
  if (rounded === 0) return 0;
  return value < 0 ? -rounded : rounded;
}

/** Zahl in der Schreibweise der Sprache: Deutsch "−1,5", Englisch "−1.5". */
export function formatNumber(value: number, lang: Lang, options: NumberOptions = {}): string {
  if (Number.isNaN(value)) return '–';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : `${MINUS}∞`;
  const decimals = options.decimals ?? 2;
  const rounded = roundHalfUp(value, decimals);
  const raw = numberFormat(lang, options.fixed ? decimals : 0, decimals).format(Math.abs(rounded));
  const text = options.grouping === false ? raw : groupThousands(raw);
  if (rounded < 0) return MINUS + text;
  return options.signed && rounded > 0 ? `+${text}` : text;
}

/**
 * Nachkommastellen, mit denen `value` auf `digits` gültige Ziffern gerundet
 * wird (negativ: Rundung vor dem Komma, z. B. −2 → auf Hunderter). Berücksichtigt,
 * dass das Runden eine Stelle dazubringen kann (9,996 → 10,0 bei 3 Ziffern).
 */
export function sigDecimals(value: number, digits: number): number {
  const n = Math.max(1, Math.round(digits));
  if (!Number.isFinite(value) || value === 0) return Math.max(0, n - 1);
  const decimalsFor = (x: number) => n - 1 - Math.floor(Math.log10(Math.abs(x)));
  let decimals = decimalsFor(value);
  const rounded = roundToDecimals(value, decimals);
  if (rounded !== 0 && decimalsFor(rounded) < decimals) decimals = decimalsFor(rounded);
  return decimals;
}

/** Wie `roundHalfUp`, aber auch für negative Stellenzahl (Rundung auf Zehner, Hunderter …). */
function roundToDecimals(value: number, decimals: number): number {
  if (decimals >= 0) return roundHalfUp(value, decimals);
  const factor = 10 ** -decimals;
  return roundHalfUp(value / factor, 0) * factor;
}

/**
 * Zahl mit `digits` gültigen Ziffern (signifikanten Stellen), gerundet wie im
 * Unterricht über `roundHalfUp`: DE `formatSig(0.012345, 'de', 3)` → „0,0123“,
 * `formatSig(2.5, 'de', 3)` → „2,50“ (Nullen am Ende zählen mit),
 * `formatSig(123456, 'de', 3)` → „123 000“. 0 erscheint als „0“. Große und
 * kleine Zahlen bleiben in Dezimalschreibweise (ohne Zehnerpotenz).
 */
export function formatSig(value: number, lang: Lang, digits: number, options: Omit<NumberOptions, 'decimals' | 'fixed'> = {}): string {
  if (!Number.isFinite(value) || value === 0) return formatNumber(value, lang, options);
  const decimals = sigDecimals(value, digits);
  if (decimals >= 0) return formatNumber(value, lang, { ...options, decimals, fixed: true });
  return formatNumber(roundToDecimals(value, decimals), lang, { ...options, decimals: 0 });
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/**
 * Schreibt x als Bruchteil von π, falls x ein Vielfaches von π/12 (bzw. π/8,
 * π/5 …) ist: "π/2", "−3π/4", "2π". Sonst `null`.
 */
export function formatPiFraction(x: number, denominators: readonly number[] = [1, 2, 3, 4, 6, 8, 12]): string | null {
  const k = x / Math.PI;
  if (Math.abs(k) < 1e-9) return '0';
  for (const d of denominators) {
    const n = Math.round(k * d);
    if (n !== 0 && Math.abs(k * d - n) < 1e-6) {
      const g = gcd(Math.abs(n), d);
      const num = Math.abs(n) / g;
      const den = d / g;
      const top = num === 1 ? 'π' : `${num}π`;
      const body = den === 1 ? top : `${top}/${den}`;
      return n < 0 ? MINUS + body : body;
    }
  }
  return null;
}

/** An eine Sprache gebundene Formatierungsfunktionen für Simulationen. */
export class Formatter {
  constructor(readonly lang: Lang) {}

  num(value: number, decimals = 2): string {
    return formatNumber(value, this.lang, { decimals });
  }

  fixed(value: number, decimals = 2): string {
    return formatNumber(value, this.lang, { decimals, fixed: true });
  }

  signed(value: number, decimals = 2): string {
    return formatNumber(value, this.lang, { decimals, signed: true });
  }

  /**
   * Zahl ohne Tausendertrennung, z. B. für Eingabefelder („125000“ statt
   * „125 000“), damit sich der Wert bearbeiten lässt.
   */
  plain(value: number, decimals = 2): string {
    return formatNumber(value, this.lang, { decimals, grouping: false });
  }

  /** Zahl mit Einheit, durch ein geschütztes Leerzeichen verbunden: DE „2,5 m/s“. */
  unit(value: number, unit: string, decimals = 2): string {
    return withUnit(this.num(value, decimals), unit);
  }

  /** Zahl mit `digits` gültigen Ziffern: `sig(0.012345, 3)` → „0,0123“, `sig(2.5, 3)` → „2,50“. */
  sig(value: number, digits = 3): string {
    return formatSig(value, this.lang, digits);
  }

  /** Wie `sig`, mit Einheit (geschütztes Leerzeichen): `sigUnit(6.626e-4, 'J', 2)` → „0,00066 J“. */
  sigUnit(value: number, unit: string, digits = 3): string {
    return withUnit(this.sig(value, digits), unit);
  }

  /** Bogenmaß bevorzugt als Bruchteil von π, sonst Dezimalzahl. */
  pi(value: number, decimals = 2): string {
    return formatPiFraction(value) ?? formatNumber(value, this.lang, { decimals });
  }

  /** Punkt in der jeweiligen Schreibweise: DE "(1,5 | 2)", EN "(1.5, 2)". */
  point(x: number, y: number, decimals = 2): string {
    const sep = this.lang === 'de' ? ' | ' : ', ';
    return `(${this.num(x, decimals)}${sep}${this.num(y, decimals)})`;
  }

  /** Dezimaltrennzeichen der Sprache. */
  get decimalSeparator(): string {
    return this.lang === 'de' ? ',' : '.';
  }
}
