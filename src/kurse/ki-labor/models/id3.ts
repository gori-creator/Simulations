import type { Localized } from '../../../i18n/config';

/**
 * Lektion „Bäume aus Information“: ID3 (Quinlan 1986) am klassischen
 * Lehrbuch-Datensatz „Tennis spielen?“ (14 Tage, 4 Merkmale).
 * Entropie H = −Σ p·log₂ p; Informationsgewinn = H(vorher) − gewichtete H(nachher).
 */
export type Attr = 'wetter' | 'temperatur' | 'feuchte' | 'wind';

export interface Day {
  wetter: 'sonnig' | 'bewoelkt' | 'regen';
  temperatur: 'heiss' | 'mild' | 'kuehl';
  feuchte: 'hoch' | 'normal';
  wind: 'schwach' | 'stark';
  spielen: boolean;
}

const D = (wetter: Day['wetter'], temperatur: Day['temperatur'], feuchte: Day['feuchte'], wind: Day['wind'], spielen: boolean): Day => ({ wetter, temperatur, feuchte, wind, spielen });

export const DAYS: Day[] = [
  D('sonnig', 'heiss', 'hoch', 'schwach', false),
  D('sonnig', 'heiss', 'hoch', 'stark', false),
  D('bewoelkt', 'heiss', 'hoch', 'schwach', true),
  D('regen', 'mild', 'hoch', 'schwach', true),
  D('regen', 'kuehl', 'normal', 'schwach', true),
  D('regen', 'kuehl', 'normal', 'stark', false),
  D('bewoelkt', 'kuehl', 'normal', 'stark', true),
  D('sonnig', 'mild', 'hoch', 'schwach', false),
  D('sonnig', 'kuehl', 'normal', 'schwach', true),
  D('regen', 'mild', 'normal', 'schwach', true),
  D('sonnig', 'mild', 'normal', 'stark', true),
  D('bewoelkt', 'mild', 'hoch', 'stark', true),
  D('bewoelkt', 'heiss', 'normal', 'schwach', true),
  D('regen', 'mild', 'hoch', 'stark', false),
];

export const ATTRS: Attr[] = ['wetter', 'temperatur', 'feuchte', 'wind'];

export const NAMES: Record<string, Localized> = {
  wetter: { de: 'Wetter', en: 'Outlook' },
  temperatur: { de: 'Temperatur', en: 'Temperature' },
  feuchte: { de: 'Luftfeuchte', en: 'Humidity' },
  wind: { de: 'Wind', en: 'Wind' },
  sonnig: { de: 'sonnig', en: 'sunny' },
  bewoelkt: { de: 'bewölkt', en: 'overcast' },
  regen: { de: 'Regen', en: 'rain' },
  heiss: { de: 'heiß', en: 'hot' },
  mild: { de: 'mild', en: 'mild' },
  kuehl: { de: 'kühl', en: 'cool' },
  hoch: { de: 'hoch', en: 'high' },
  normal: { de: 'normal', en: 'normal' },
  schwach: { de: 'schwach', en: 'weak' },
  stark: { de: 'stark', en: 'strong' },
};

/** Entropie einer Menge von Tagen (in Bit). */
export function entropy(days: readonly Day[]): number {
  if (days.length === 0) return 0;
  const p = days.filter((d) => d.spielen).length / days.length;
  return [p, 1 - p].reduce((h, q) => (q > 0 ? h - q * Math.log2(q) : h), 0);
}

export function valuesOf(attr: Attr, days: readonly Day[] = DAYS): string[] {
  return [...new Set(DAYS.map((d) => d[attr] as string))].filter((v) => days.some((d) => d[attr] === v));
}

export function split(days: readonly Day[], attr: Attr): Map<string, Day[]> {
  const out = new Map<string, Day[]>();
  for (const v of valuesOf(attr, days)) out.set(v, days.filter((d) => d[attr] === v));
  return out;
}

/** Informationsgewinn eines Merkmals für diese Teilmenge. */
export function gain(days: readonly Day[], attr: Attr): number {
  let after = 0;
  for (const part of split(days, attr).values()) after += (part.length / days.length) * entropy(part);
  return entropy(days) - after;
}

/** Merkmal mit dem größten Gewinn (ID3). */
export function bestAttr(days: readonly Day[], attrs: readonly Attr[]): Attr {
  return attrs.reduce((a, b) => (gain(days, b) > gain(days, a) + 1e-12 ? b : a));
}
