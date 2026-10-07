import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allSimulations, readySimulations, SUBJECTS } from '../src/curriculum';
import { getKmkStandard } from '../src/curriculum/kmk';
import { LANGS } from '../src/i18n/config';
import { allRoutes, routePath } from '../src/lib/routes';
import { registry } from '../src/simulations/registry';

/**
 * Konsistenz-Prüfungen für den Lehrplan. Sie schlagen an, wenn beim Anlegen
 * neuer Simulationen etwas vergessen wurde.
 */
describe('Lehrplan', () => {
  it('hat eindeutige IDs für Simulationen', () => {
    const ids = allSimulations().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hat eindeutige IDs für Bereiche und Themen', () => {
    for (const subject of SUBJECTS) {
      const areas = subject.areas.map((a) => a.id);
      expect(new Set(areas).size, subject.id).toBe(areas.length);
      for (const area of subject.areas) {
        const topics = area.topics.map((t) => t.id);
        expect(new Set(topics).size, area.id).toBe(topics.length);
      }
    }
  });

  it('hat Texte in allen Sprachen', () => {
    for (const sim of allSimulations()) {
      for (const lang of LANGS) {
        expect(sim.title[lang].trim(), `${sim.id} (${lang})`).not.toBe('');
        if (sim.summary) expect(sim.summary[lang].trim(), `${sim.id} (${lang})`).not.toBe('');
      }
    }
  });

  it('hat gültige Klassenstufen', () => {
    for (const sim of allSimulations()) {
      const [from, to] = sim.grades;
      expect(from, sim.id).toBeGreaterThanOrEqual(5);
      expect(to, sim.id).toBeGreaterThanOrEqual(from);
      expect(to, sim.id).toBeLessThanOrEqual(14);
    }
  });

  it('verweist nur auf bekannte KMK-Standards', () => {
    const ids = [
      ...SUBJECTS.flatMap((s) => s.areas.flatMap((a) => a.kmk)),
      ...allSimulations().flatMap((s) => s.kmk ?? []),
    ];
    for (const id of ids) expect(getKmkStandard(id), id).toBeDefined();
  });
});

describe('Fertige Simulationen', () => {
  const ready = readySimulations();

  it('haben einen Slug, eine Kurzbeschreibung und ein Vorschaubild', () => {
    for (const sim of ready) {
      expect(sim.slug, sim.id).toBeDefined();
      expect(sim.summary, sim.id).toBeDefined();
      expect(sim.thumb, sim.id).toBeDefined();
    }
  });

  it('sind im Simulations-Verzeichnis registriert (und umgekehrt)', () => {
    expect(Object.keys(registry).sort()).toEqual(ready.map((s) => s.id).sort());
  });

  it('haben deutsches Lernmaterial', () => {
    for (const sim of ready) {
      expect(existsSync(`src/content/simulations/de/${sim.id}.md`), sim.id).toBe(true);
    }
  });
});

describe('Routen', () => {
  it('erzeugen eindeutige Adressen in jeder Sprache', () => {
    for (const lang of LANGS) {
      const paths = allRoutes().map((r) => routePath(lang, r));
      expect(new Set(paths).size, lang).toBe(paths.length);
      for (const path of paths) expect(path).toMatch(/^\/[a-z]{2}\/[a-z0-9\-/]+\/$/);
    }
  });

  it('haben Inhalte für alle Infoseiten', () => {
    for (const page of ['teachers', 'about', 'imprint', 'privacy']) {
      expect(existsSync(`src/content/pages/de/${page}.md`), page).toBe(true);
    }
  });
});
