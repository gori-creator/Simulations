/**
 * Suche in den Simulationskarten (Startseite und Katalog): Groß/klein, Akzente
 * und ß sind egal – „grosse zahlen“ findet „Gesetz der großen Zahlen“,
 * „bruche“ findet „Brüche“. Beide Seiten nutzen dieselbe Regel.
 */

/** Text für den Vergleich vereinheitlichen. */
export function normalizeSearch(text: string, lang = 'de'): string {
  return text
    .toLocaleLowerCase(lang)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss');
}

/** Suchbegriff in einzelne, vereinheitlichte Wörter zerlegen. */
export function searchWords(query: string, lang = 'de'): string[] {
  return normalizeSearch(query.trim(), lang).split(/\s+/).filter(Boolean);
}

/** Kommen alle Wörter im (bereits vereinheitlichten) Text vor? */
export function matchesWords(normalizedText: string, words: readonly string[]): boolean {
  return words.every((w) => normalizedText.includes(w));
}
