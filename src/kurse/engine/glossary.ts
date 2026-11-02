import type { Lang } from '../../i18n/config';
import type { GlossaryEntry } from '../types';

/**
 * Fachwörter im Text finden (KI-Wörterbuch). Reine Logik, getestet in
 * tests/kurs.test.ts. Ein Wort gilt nur als ganzes Wort (keine Buchstaben
 * davor oder danach); längere Muster gewinnen („Turing-Test“ vor „Test“).
 */
export interface CompiledGlossary {
  regex: RegExp;
  entries: GlossaryEntry[];
}

export type Segment = { text: string; entry?: GlossaryEntry };

export function compileGlossary(all: readonly GlossaryEntry[], lang: Lang): CompiledGlossary | null {
  const entries = [...all].sort((a, b) => b.match[lang].length - a.match[lang].length);
  if (entries.length === 0) return null;
  const source = entries.map((e) => `(${e.match[lang]})`).join('|');
  return { regex: new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, 'giu'), entries };
}

/**
 * Text in Stücke teilen; das erste Vorkommen jedes noch nicht benutzten
 * Eintrags wird markiert (`used` merkt sich die Einträge, z. B. je Lektion).
 */
export function splitTerms(text: string, glossary: CompiledGlossary | null, used: Set<string>): Segment[] {
  if (!glossary) return [{ text }];
  const out: Segment[] = [];
  let last = 0;
  glossary.regex.lastIndex = 0;
  for (const match of text.matchAll(glossary.regex)) {
    const index = match.slice(1).findIndex((group) => group !== undefined);
    const entry = glossary.entries[index];
    if (!entry || used.has(entry.id)) continue;
    used.add(entry.id);
    if (match.index! > last) out.push({ text: text.slice(last, match.index) });
    out.push({ text: match[0], entry });
    last = match.index! + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
