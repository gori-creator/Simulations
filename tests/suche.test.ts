import { describe, expect, it } from 'vitest';
import { matchesWords, normalizeSearch, searchWords } from '../src/lib/search';

describe('Suche (Startseite und Katalog, gleiche Regel)', () => {
  const find = (text: string, query: string) => matchesWords(normalizeSearch(text), searchWords(query));

  it('ignoriert Groß/klein, ß und Umlaut-Punkte', () => {
    expect(find('Gesetz der großen Zahlen', 'grosse zahlen')).toBe(true);
    expect(find('Gesetz der großen Zahlen', 'GROSSEN')).toBe(true);
    expect(find('Brüche rechnen', 'bruche')).toBe(true);
    expect(find('Brüche rechnen', 'brüche')).toBe(true);
  });

  it('verlangt alle Wörter, egal in welcher Reihenfolge', () => {
    expect(find('Gesetz der großen Zahlen', 'zahlen gesetz')).toBe(true);
    expect(find('Gesetz der großen Zahlen', 'zahlen pendel')).toBe(false);
  });

  it('leere Suche passt immer', () => {
    expect(searchWords('   ')).toEqual([]);
    expect(find('Fadenpendel', '')).toBe(true);
  });
});
