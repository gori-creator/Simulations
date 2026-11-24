import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Das englische Lernmaterial soll so vollständig sein wie das deutsche (gleiche
 * Abschnitte, Aufträge und Aufgaben). Maß: Anzahl der Wörter, EN mindestens 60 %
 * von DE (englischer Text ist normalerweise eher etwas länger).
 *
 * Die Liste unten sind die bekannten Lücken (Stand 24.11.2026). Sie darf nur
 * kürzer werden: Ist eine Simulation vollständig übersetzt, fliegt sie heraus.
 */
const NOCH_KURZ = new Set([
  'ableitungsregeln',
  'aenderungsrate',
  'binomialverteilung',
  'e-funktion',
  'energieversorgung',
  'fourier-reihen',
  'funktionenscharen',
  'funktionsplotter',
  'gauss-verfahren',
  'geraden-ebenen',
  'integrationsregeln',
  'interferenz',
  'konfidenzintervall',
  'koordinaten-lage',
  'kugeln',
  'lage-abstaende',
  'linienspektren',
  'magnete',
  'matrix-abbildungen',
  'messunsicherheit',
  'normalverteilung',
  'prisma-zylinder',
  'pythagoras',
  'richtungsfeld',
  'signifikanztest',
  'skalar-vektorprodukt',
  'stammfunktion-grafisch',
  'stehende-wellen',
  'uebergangsmatrizen',
  'umkehrfunktion',
  'vektoren-3d',
  'wellen-ausbreitung',
  'zeitdilatation',
]);

const words = (path: string) => (readFileSync(path, 'utf8').match(/[\p{L}\p{N}_]+/gu) ?? []).length;

describe('Englisches Lernmaterial ist vollständig', () => {
  const ids = readdirSync('src/content/simulations/de').map((f) => f.replace(/\.md$/, ''));
  for (const id of ids) {
    it(id, () => {
      const ratio = words(`src/content/simulations/en/${id}.md`) / words(`src/content/simulations/de/${id}.md`);
      if (NOCH_KURZ.has(id)) expect(ratio, `${id} ist jetzt vollständig – bitte aus NOCH_KURZ streichen`).toBeLessThan(0.6);
      else expect(ratio, `${id}: englisches Lernmaterial deutlich kürzer als das deutsche`).toBeGreaterThanOrEqual(0.6);
    });
  }
});
