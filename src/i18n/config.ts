/** Unterstützte Sprachen. Deutsch ist die Hauptsprache. */
export const LANGS = ['de', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'de';

/** Ein Wert, der für jede Sprache vorliegt (z. B. Titel, Beschreibungen). */
export type Localized<T = string> = Record<Lang, T>;

export const LANG_META: Record<Lang, { name: string; locale: string }> = {
  de: { name: 'Deutsch', locale: 'de-DE' },
  en: { name: 'English', locale: 'en-GB' },
};

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export function otherLangs(lang: Lang): Lang[] {
  return LANGS.filter((l) => l !== lang);
}
