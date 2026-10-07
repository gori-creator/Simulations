import type { Lang, Localized } from './config';
import { ui, type UiKey } from './ui';

export type Vars = Record<string, string | number>;

/** Übersetzt einen UI-Schlüssel und ersetzt Platzhalter wie {n}. */
export function t(lang: Lang, key: UiKey, vars?: Vars): string {
  const text: string = ui[lang][key] ?? ui.de[key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Liefert eine an die Sprache gebundene Übersetzungsfunktion. */
export function useTranslations(lang: Lang) {
  return (key: UiKey, vars?: Vars) => t(lang, key, vars);
}

/** Wählt die passende Sprachvariante eines lokalisierten Werts. */
export function pick<T>(lang: Lang, value: Localized<T>): T {
  return value[lang];
}

/** Zahlen für Texte in der Oberfläche (z. B. "3 von 12"). */
export function formatCount(lang: Lang, n: number): string {
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB').format(n);
}

/**
 * Klassenstufen-Angabe, z. B. "Klasse 7–9", "Klasse 12 · Uni" oder "Uni".
 * Klassenstufen > 13 stehen für die Universität.
 */
export function formatGrades(lang: Lang, grades: readonly [number, number], uni = false): string {
  const [from, to] = grades;
  const uniLabel = t(lang, 'grades.uni');
  if (from > 13) return uniLabel;
  const withUni = uni || to > 13;
  const school = from === to ? t(lang, 'grades.single', { n: from }) : t(lang, 'grades.range', { from, to: Math.min(to, 13) });
  return withUni ? `${school} · ${uniLabel}` : school;
}
