/**
 * Rechenlogik „Stellenwertsystem und Runden“: Ziffern und Stellenwerte,
 * Bündeln und Entbündeln in der Stellenwerttafel, Runden und Zahlwörter.
 *
 * Stellen werden von rechts gezählt: Stelle 0 = Einer, 1 = Zehner, …,
 * 11 = Hundertmilliarden. Alle Zahlen sind natürliche Zahlen (mit 0) unter
 * einer Billion, also exakt als JavaScript-Zahl darstellbar.
 */

/** Anzahl der Spalten der Stellenwerttafel (bis Hundertmilliarden). */
export const PLACE_COUNT = 12;
/** Größte Zahl, die in die Tafel passt. */
export const MAX_NUMBER = 10 ** PLACE_COUNT - 1;

export type Lang = 'de' | 'en';

const PLACE_SHORT: Record<Lang, readonly string[]> = {
  de: ['E', 'Z', 'H', 'T', 'ZT', 'HT', 'Mio', 'ZMio', 'HMio', 'Mrd', 'ZMrd', 'HMrd'],
  en: ['O', 'T', 'H', 'Th', 'TTh', 'HTh', 'M', 'TM', 'HM', 'B', 'TB', 'HB'],
};

const PLACE_NAME: Record<Lang, readonly string[]> = {
  de: [
    'Einer',
    'Zehner',
    'Hunderter',
    'Tausender',
    'Zehntausender',
    'Hunderttausender',
    'Millionen',
    'Zehnmillionen',
    'Hundertmillionen',
    'Milliarden',
    'Zehnmilliarden',
    'Hundertmilliarden',
  ],
  en: [
    'ones',
    'tens',
    'hundreds',
    'thousands',
    'ten thousands',
    'hundred thousands',
    'millions',
    'ten millions',
    'hundred millions',
    'billions',
    'ten billions',
    'hundred billions',
  ],
};

const GROUP_NAME: Record<Lang, readonly string[]> = {
  de: ['Einer', 'Tausender', 'Millionen', 'Milliarden'],
  en: ['Ones', 'Thousands', 'Millions', 'Billions'],
};

/** Kurzzeichen einer Stelle (E, Z, H, T, ZT, …). */
export function placeShort(place: number, lang: Lang): string {
  return PLACE_SHORT[lang][place] ?? '';
}

/** Name einer Stelle (Einer, Zehner, …, Hundertmilliarden). */
export function placeName(place: number, lang: Lang): string {
  return PLACE_NAME[lang][place] ?? '';
}

const ROUND_NAME_EN = ['one', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand', 'million', 'ten million', 'hundred million', 'billion', 'ten billion', 'hundred billion'];

/** Name der Rundungsstelle: „auf Tausender runden“ bzw. „to the nearest thousand“. */
export function roundingPlaceName(place: number, lang: Lang): string {
  return lang === 'de' ? placeName(place, lang) : (ROUND_NAME_EN[place] ?? '');
}

/** Name einer Dreiergruppe (0 = Einer, 1 = Tausender, 2 = Millionen, 3 = Milliarden). */
export function groupName(group: number, lang: Lang): string {
  return GROUP_NAME[lang][group] ?? '';
}

/** Zehnerpotenz 10^k als ganze Zahl. */
export function pow10(k: number): number {
  return 10 ** k;
}

/** Ziffern einer Zahl, Index = Stelle (0 = Einer). */
export function digitsOf(n: number, count = PLACE_COUNT): number[] {
  const digits: number[] = [];
  let rest = Math.max(0, Math.floor(n));
  for (let i = 0; i < count; i++) {
    digits.push(rest % 10);
    rest = Math.floor(rest / 10);
  }
  return digits;
}

/** Zahl aus Ziffern (Index = Stelle). Ziffern über 9 werden mit ihrem Stellenwert gezählt. */
export function fromDigits(digits: readonly number[]): number {
  return digits.reduce((sum, d, k) => sum + d * pow10(k), 0);
}

/** Anzahl der Stellen (0 hat eine Stelle). */
export function digitCount(n: number): number {
  return Math.max(1, String(Math.floor(Math.abs(n))).length);
}

/** Ziffern in Dreiergruppen: DE „4 253 718“ (schmales Leerzeichen), EN „4,253,718“. */
export function groupDigits(n: number, lang: Lang = 'de'): string {
  const sep = lang === 'de' ? ' ' : ',';
  return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/* ------------------------------------------------------------------ */
/* Runden                                                              */
/* ------------------------------------------------------------------ */

/**
 * Rundet auf die Stelle `place` (1 = Zehner, 3 = Tausender …): Ist die Ziffer
 * rechts neben der Rundungsstelle 0, 1, 2, 3 oder 4, wird abgerundet, bei 5,
 * 6, 7, 8 oder 9 aufgerundet.
 */
export function roundTo(n: number, place: number): number {
  if (place <= 0) return n;
  const unit = pow10(place);
  const lower = Math.floor(n / unit) * unit;
  return n - lower >= unit / 2 ? lower + unit : lower;
}

/** Die beiden Nachbarzahlen auf der Rundungsstelle und die Mitte dazwischen. */
export function roundingNeighbors(n: number, place: number): { lower: number; upper: number; mid: number } {
  const unit = pow10(place);
  const lower = Math.floor(n / unit) * unit;
  return { lower, upper: lower + unit, mid: lower + unit / 2 };
}

/** Wird aufgerundet? (Die Ziffer rechts neben der Rundungsstelle ist 5 oder größer.) */
export function roundsUp(n: number, place: number): boolean {
  return roundTo(n, place) > n;
}

/** Die „entscheidende“ Ziffer rechts neben der Rundungsstelle. */
export function decidingDigit(n: number, place: number): number {
  return digitsOf(n)[place - 1] ?? 0;
}

/* ------------------------------------------------------------------ */
/* Bündeln und Entbündeln                                              */
/* ------------------------------------------------------------------ */

/**
 * Ein Schritt in der Stellenwerttafel mit Plättchen:
 * - `add`: ein Plättchen kommt in die Spalte `place`
 * - `remove`: ein Plättchen wird aus der Spalte `place` genommen
 * - `bundle`: 10 Plättchen der Spalte `place` werden zu einem Plättchen der
 *   Spalte links daneben gebündelt
 * - `unbundle`: ein Plättchen der Spalte `place` wird in 10 Plättchen der
 *   Spalte rechts daneben getauscht (entbündelt)
 */
export interface CarryStep {
  kind: 'add' | 'remove' | 'bundle' | 'unbundle';
  place: number;
}

/**
 * Schritte, um einen Stellenwert der Stelle `place` zu addieren (+1 Plättchen),
 * mit Übertrag. `null`, wenn die Zahl nicht mehr in die Tafel passt.
 */
export function incrementSteps(digits: readonly number[], place: number): CarryStep[] | null {
  const d = digits.slice();
  const steps: CarryStep[] = [{ kind: 'add', place }];
  let k = place;
  d[k] = (d[k] ?? 0) + 1;
  while ((d[k] ?? 0) >= 10) {
    if (k + 1 >= d.length) return null;
    steps.push({ kind: 'bundle', place: k });
    d[k] = 0;
    k++;
    d[k] = (d[k] ?? 0) + 1;
  }
  return steps;
}

/**
 * Schritte, um einen Stellenwert der Stelle `place` abzuziehen (−1 Plättchen).
 * Ist die Spalte leer, wird von links entbündelt. `null`, wenn das Ergebnis
 * negativ wäre.
 */
export function decrementSteps(digits: readonly number[], place: number): CarryStep[] | null {
  if ((digits[place] ?? 0) > 0) return [{ kind: 'remove', place }];
  let m = place + 1;
  while (m < digits.length && (digits[m] ?? 0) === 0) m++;
  if (m >= digits.length) return null;
  const steps: CarryStep[] = [];
  for (let j = m; j > place; j--) steps.push({ kind: 'unbundle', place: j });
  steps.push({ kind: 'remove', place });
  return steps;
}

/** Wendet Schritte auf Plättchen-Anzahlen an (Kopie). */
export function applySteps(counts: readonly number[], steps: readonly CarryStep[]): number[] {
  const c = counts.slice();
  for (const s of steps) {
    const k = s.place;
    if (s.kind === 'add') c[k] = (c[k] ?? 0) + 1;
    else if (s.kind === 'remove') c[k] = (c[k] ?? 0) - 1;
    else if (s.kind === 'bundle') {
      c[k] = (c[k] ?? 0) - 10;
      c[k + 1] = (c[k + 1] ?? 0) + 1;
    } else {
      c[k] = (c[k] ?? 0) - 1;
      c[k - 1] = (c[k - 1] ?? 0) + 10;
    }
  }
  return c;
}

/** Zerlegung in Stellenwerte (nur Ziffern ≠ 0), von der höchsten Stelle an. */
export function expandedForm(n: number): { digit: number; place: number; value: number }[] {
  return digitsOf(n)
    .map((digit, place) => ({ digit, place, value: digit * pow10(place) }))
    .filter((p) => p.digit > 0)
    .reverse();
}

/* ------------------------------------------------------------------ */
/* Zahlwörter                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ein Abschnitt des Zahlworts, der zu einer Dreiergruppe gehört
 * (0 = Einer, 1 = Tausender, 2 = Millionen, 3 = Milliarden, 4 = Billion).
 * `text` darf weiche Trennstellen (U+00AD) enthalten; `space`: Vor dem
 * Abschnitt steht ein Leerzeichen.
 */
export interface WordPart {
  text: string;
  group: number;
  space: boolean;
}

const SHY = '­';

const DE_ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const DE_TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const DE_TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

/** 1 bis 99; `final`: am Wortende „eins“, sonst „ein“ (einhundert, eintausend). */
function deBelow100(n: number, final: boolean): string {
  if (n === 0) return '';
  if (n === 1) return final ? 'eins' : 'ein';
  if (n < 10) return DE_ONES[n]!;
  if (n < 20) return DE_TEENS[n - 10]!;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DE_TENS[t]!;
  return `${u === 1 ? 'ein' : DE_ONES[u]}und${DE_TENS[t]}`;
}

/** 1 bis 999 mit weicher Trennstelle nach „hundert“. */
function deBelow1000(n: number, final: boolean): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const head = h > 0 ? `${h === 1 ? 'ein' : DE_ONES[h]}hundert` : '';
  const tail = deBelow100(r, final);
  return head && tail ? `${head}${SHY}${tail}` : head + tail;
}

/** „eine Million“, „zwei Millionen“, „einhunderteine Million“ (Zahlen auf 1 stehen im Singular). */
function deLarge(count: number, singular: string, plural: string): string {
  if (count === 1) return `eine ${singular}`;
  if (count % 100 === 1) return `${deBelow1000(count - 1, false)}${SHY}eine ${singular}`;
  return `${deBelow1000(count, false)} ${plural}`;
}

/**
 * Zahlwort auf Deutsch nach der Rechtschreibung: Zahlen unter einer Million
 * werden zusammengeschrieben, Million, Milliarde und Billion sind Nomen und
 * stehen getrennt („vier Millionen zweihundertdreiundfünfzigtausend…“).
 */
export function wordPartsDe(n: number): WordPart[] {
  n = Math.floor(n);
  if (n === 0) return [{ text: 'null', group: 0, space: false }];
  const parts: WordPart[] = [];
  const trillions = Math.floor(n / 1e12);
  const billions = Math.floor(n / 1e9) % 1000;
  const millions = Math.floor(n / 1e6) % 1000;
  const thousands = Math.floor(n / 1e3) % 1000;
  const ones = n % 1000;
  if (trillions) parts.push({ text: deLarge(trillions, 'Billion', 'Billionen'), group: 4, space: false });
  if (billions) parts.push({ text: deLarge(billions, 'Milliarde', 'Milliarden'), group: 3, space: parts.length > 0 });
  if (millions) parts.push({ text: deLarge(millions, 'Million', 'Millionen'), group: 2, space: parts.length > 0 });
  // Tausender und Einer bilden ein Wort
  const small = parts.length > 0;
  if (thousands) parts.push({ text: `${deBelow1000(thousands, false)}tausend`, group: 1, space: small });
  if (ones) parts.push({ text: (thousands ? SHY : '') + deBelow1000(ones, true), group: 0, space: small && !thousands });
  return parts;
}

const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function enBelow100(n: number): string {
  if (n < 20) return EN_ONES[n]!;
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u ? `${EN_TENS[t]}-${EN_ONES[u]}` : EN_TENS[t]!;
}

function enBelow1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (!h) return enBelow100(r);
  return r ? `${EN_ONES[h]} hundred and ${enBelow100(r)}` : `${EN_ONES[h]} hundred`;
}

/** Zahlwort auf Englisch (britisch, mit „and“; billion = 10⁹). */
export function wordPartsEn(n: number): WordPart[] {
  n = Math.floor(n);
  if (n === 0) return [{ text: 'zero', group: 0, space: false }];
  const parts: WordPart[] = [];
  const scales: [number, string, number][] = [
    [1e12, 'trillion', 4],
    [1e9, 'billion', 3],
    [1e6, 'million', 2],
    [1e3, 'thousand', 1],
  ];
  let rest = n;
  for (const [unit, name, group] of scales) {
    const count = Math.floor(rest / unit);
    if (count) parts.push({ text: `${enBelow1000(count)} ${name}`, group, space: parts.length > 0 });
    rest %= unit;
  }
  if (rest) parts.push({ text: `${parts.length && rest < 100 ? 'and ' : ''}${enBelow1000(rest)}`, group: 0, space: parts.length > 0 });
  return parts;
}

export function wordParts(n: number, lang: Lang): WordPart[] {
  return lang === 'de' ? wordPartsDe(n) : wordPartsEn(n);
}

/** Zahlwort als Text; mit `hyphenate` bleiben weiche Trennstellen für den Zeilenumbruch erhalten. */
export function numberWords(n: number, lang: Lang, hyphenate = false): string {
  const words = wordParts(n, lang)
    .map((p) => (p.space ? ' ' : '') + p.text)
    .join('');
  return hyphenate ? words : words.replaceAll(SHY, '');
}
