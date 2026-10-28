import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Das Lernmaterial ist für alle Bundesländer gleich. Landesbezüge (Lehrplan-
 * namen, Lernbereichsnummern, „in Bayern“) gehören in die Länder-Lehrpläne
 * unter src/curriculum/lehrplaene/, die je nach gewähltem Bundesland erscheinen.
 * „Hesse-Normalform“ ist ein Fachbegriff und bleibt erlaubt.
 */
const STATE_WORDS =
  /Bayern|bayerisch|Bavaria|LehrplanPLUS|Kernlehrplan|Kerncurriculum|Bildungsplan|Rahmenlehrplan|Fachanforderungen|Lernbereich|learning area|Jahrgangsstufe|Baden-Württemberg|Nordrhein-Westfalen|North Rhine|Niedersachsen|Lower Saxony|Sachsen|Saxony|Hessen|hessisch|Rheinland-Pfalz|Schleswig-Holstein|Berlin|Brandenburg|Thüringen|Thuringia|Saarland|Mecklenburg|Hamburg|Bremen/;

describe('Lernmaterial ohne Landesbezug', () => {
  const root = 'src/content/simulations';
  for (const lang of readdirSync(root)) {
    for (const file of readdirSync(join(root, lang))) {
      it(`${lang}/${file}`, () => {
        const hits = readFileSync(join(root, lang, file), 'utf8')
          .split('\n')
          .filter((line) => STATE_WORDS.test(line));
        expect(hits).toEqual([]);
      });
    }
  }
});
