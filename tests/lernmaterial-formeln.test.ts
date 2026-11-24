import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Formeln im Lernmaterial: Paare müssen zusammenpassen. Ein typischer Fehler beim
 * Erzeugen von Texten mit Skripten: „\r“ in „\rvert“ wird als Zeilenumbruch gelesen,
 * die Formel zerfällt (so am 23.11.2026 in Kegelschnitte passiert).
 */
// Befehl ohne weitere Buchstaben dahinter (\right zählt, \rightarrow nicht)
const PAIRS: [string, string][] = [
  ['lvert', 'rvert'],
  ['left', 'right'],
  ['lbrace', 'rbrace'],
];
const count = (s: string, cmd: string) => (s.match(new RegExp(`\\\\${cmd}(?![a-zA-Z])`, 'g')) ?? []).length;

describe('Formeln im Lernmaterial', () => {
  for (const lang of ['de', 'en']) {
    const dir = `src/content/simulations/${lang}`;
    for (const file of readdirSync(dir)) {
      it(`${lang}/${file}`, () => {
        const text = readFileSync(`${dir}/${file}`, 'utf8');
        for (const [open, close] of PAIRS) expect(count(text, open), `\\${open} / \\${close}`).toBe(count(text, close));
        // keine Steuerzeichen (außer Zeilenumbruch)
        expect(/[\u0000-\u0009\u000b-\u001f]/.test(text), 'Steuerzeichen im Text').toBe(false);
      });
    }
  }
});
