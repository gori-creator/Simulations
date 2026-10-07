import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allSimulations, getSimulation, readySimulations, SUBJECTS } from '../src/curriculum';
import { getKmkStandard } from '../src/curriculum/kmk';
import { STATE_CURRICULA, unitsOf } from '../src/curriculum/lehrplaene';
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

  it('haben gültige eigene Vorschaubilder (thumb.svg)', () => {
    for (const sim of ready) {
      const file = `src/simulations/${sim.subject}/${sim.id}/thumb.svg`;
      if (!existsSync(file)) continue;
      const svg = readFileSync(file, 'utf8');
      expect(svg, file).toMatch(/^<svg[^>]*viewBox="0 0 320 180"/);
      expect(svg, `${file}: Farben nur über currentColor`).not.toMatch(/(fill|stroke|color)\s*[=:]\s*["']?\s*(#|rgb|hsl)/i);
      expect(svg, `${file}: keine Skripte, Texte oder externen Verweise`).not.toMatch(/<script|<text|href=|url\(/i);
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

describe('Sortierung', () => {
  it('ordnet Themen und Simulationen innerhalb eines Bereichs nach Klassenstufe', () => {
    for (const subject of SUBJECTS) {
      for (const area of subject.areas) {
        const topicStarts = area.topics.map((t) => t.grades[0]);
        expect(topicStarts, `${subject.id}/${area.id}`).toEqual([...topicStarts].sort((a, b) => a - b));
        for (const topic of area.topics) {
          const simStarts = topic.simulations.map((s) => s.grades[0]);
          expect(simStarts, `${area.id}/${topic.id}`).toEqual([...simStarts].sort((a, b) => a - b));
        }
      }
    }
  });
});

describe('Länder-Lehrpläne', () => {
  it.each(STATE_CURRICULA.map((c) => [c.id, c] as const))('%s verweist nur auf bekannte Simulationen', (_id, curriculum) => {
    for (const grade of curriculum.grades) {
      for (const unit of unitsOf(grade)) {
        for (const simId of unit.simulations ?? []) {
          expect(() => getSimulation(simId), `${grade.grade}/${unit.code}: ${simId}`).not.toThrow();
        }
      }
    }
  });

  it.each(STATE_CURRICULA.map((c) => [c.id, c] as const))('%s passt zu den Klassenstufen der Simulationen', (_id, curriculum) => {
    for (const grade of curriculum.grades) {
      for (const unit of unitsOf(grade)) {
        for (const simId of unit.simulations ?? []) {
          const sim = getSimulation(simId);
          expect(sim.grades[0] <= grade.grade && grade.grade <= sim.grades[1], `${simId} in Jgst. ${grade.grade} (${sim.grades.join('–')})`).toBe(true);
          expect(sim.subject, simId).toBe(curriculum.subject);
        }
      }
    }
  });

  it.each(STATE_CURRICULA.map((c) => [c.id, c] as const))('%s hat eindeutige, vollständige Lernbereiche', (_id, curriculum) => {
    const grades = curriculum.grades.map((g) => g.grade);
    expect(new Set(grades).size).toBe(grades.length);
    for (const grade of curriculum.grades) {
      expect(grade.sourceUrl).toMatch(/^https:\/\//);
      const codes = unitsOf(grade).map((u) => u.code);
      expect(new Set(codes).size, `Jgst. ${grade.grade}`).toBe(codes.length);
      for (const unit of grade.units) {
        for (const part of unit.parts ?? []) expect(part.code.startsWith(`${unit.code}.`), part.code).toBe(true);
        // Ein Lernbereich hat entweder Unterbereiche oder eigene Simulationen
        if (unit.parts) expect(unit.simulations, unit.code).toBeUndefined();
        for (const u of [unit, ...(unit.parts ?? [])]) {
          for (const lang of LANGS) expect(u.title[lang].trim(), u.code).not.toBe('');
        }
      }
    }
  });
});
