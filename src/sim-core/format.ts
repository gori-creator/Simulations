import { LANG_META, type Lang } from '../i18n/config';

/** Typografisches Minuszeichen (statt Bindestrich). */
export const MINUS = '−';

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
}

/** Zahl in der Schreibweise der Sprache: Deutsch "−1,5", Englisch "−1.5". */
export function formatNumber(value: number, lang: Lang, options: NumberOptions = {}): string {
  if (Number.isNaN(value)) return '–';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : `${MINUS}∞`;
  const decimals = options.decimals ?? 2;
  const factor = 10 ** decimals;
  // Kaufmännisch runden (5 aufwärts, vom Betrag her – also −0,875 → −0,88 wie im
  // Unterricht); der winzige Zuschlag gleicht Darstellungsfehler wie 1,005 · 100 = 100,4999… aus.
  let rounded = (Math.sign(value) * Math.round(Math.abs(value) * factor * (1 + 4 * Number.EPSILON))) / factor;
  if (Object.is(rounded, -0) || rounded === 0) rounded = 0;
  const text = numberFormat(lang, options.fixed ? decimals : 0, decimals).format(Math.abs(rounded));
  if (rounded < 0) return MINUS + text;
  return options.signed && rounded > 0 ? `+${text}` : text;
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
