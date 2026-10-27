import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allSimulations, getSimulation, readySimulations, SUBJECTS } from '../src/curriculum';
import { getKmkStandard } from '../src/curriculum/kmk';
import { getCurriculum, getCurriculumGrade, gradeLabel, sameUnitElsewhere, simulationsOfGrade, STATE_CURRICULA, unitsOf } from '../src/curriculum/lehrplaene';
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
      // Vorschaubild: eigene thumb.svg oder eine Vorlage aus `thumb`
      const own = existsSync(`src/simulations/${sim.subject}/${sim.id}/thumb.svg`);
      expect(own || sim.thumb !== undefined, sim.id).toBe(true);
    }
  });

  it('setzen bei eigener thumb.svg nicht zusätzlich die Platzhalter-Vorlage', () => {
    for (const sim of ready) {
      if (existsSync(`src/simulations/${sim.subject}/${sim.id}/thumb.svg`)) expect(sim.thumb, sim.id).not.toBe('generic');
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
          // Stufe (z. B. 5/6) und Klassenstufen der Simulation müssen sich überschneiden
          const to = grade.toGrade ?? grade.grade;
          expect(sim.grades[0] <= to && grade.grade <= sim.grades[1], `${simId} in Jgst. ${gradeLabel(grade)} (${sim.grades.join('–')})`).toBe(true);
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
        // Unterbereiche tragen die Nummer des Lernbereichs: „1.2“ zu „1“ (Bayern) oder „3.1.1 (1)–(11)“ zu „3.1.1“ (Baden-Württemberg)
        for (const part of unit.parts ?? []) {
          expect(part.code.startsWith(`${unit.code}.`) || part.code.startsWith(`${unit.code} (`), part.code).toBe(true);
        }
        // Ein Lernbereich hat entweder Unterbereiche oder eigene Simulationen
        if (unit.parts) expect(unit.simulations, unit.code).toBeUndefined();
        for (const u of [unit, ...(unit.parts ?? [])]) {
          for (const lang of LANGS) expect(u.title[lang].trim(), u.code).not.toBe('');
        }
      }
    }
  });

  /**
   * Fertige Simulationen ohne Platz in einem Länder-Lehrplan, mit Grund. Alle
   * anderen müssen bei mindestens einer Jahrgangsstufe stehen – sonst findet man
   * sie nach Wahl des Bundeslands bei keinem Jahrgang.
   */
  const NOT_IN_CURRICULUM: Record<string, Record<string, string>> = {
    'bayern-gymnasium-mathematik': {
      'taylor-polynome': 'nicht im LehrplanPLUS (Hochschule)',
      'fourier-reihen': 'nicht im LehrplanPLUS (Hochschule)',
      'matrix-abbildungen': 'Matrizen nicht im LehrplanPLUS',
    },
    'bayern-gymnasium-physik': {
      'doppler-effekt': 'nur in der Lehrplanalternative Astrophysik (Jgst. 13), die nicht abgebildet ist',
    },
    'hessen-gymnasium-mathematik': {
      'parabel-drei-punkte': 'kein passender Schwerpunkt (siehe docs/lehrplaene/hessen-gymnasium-mathematik.md)',
      ziegenproblem: 'kein passender Schwerpunkt',
      'monte-carlo-pi': 'kein passender Schwerpunkt',
      kugeln: 'kein passender Schwerpunkt',
      'taylor-polynome': 'nicht im Kerncurriculum (Hochschule)',
      'fourier-reihen': 'nicht im Kerncurriculum (Hochschule)',
    },
    'hessen-gymnasium-physik': {
      'doppler-effekt': 'kein passender Schwerpunkt (siehe docs/lehrplaene/hessen-gymnasium-physik.md)',
    },
    'niedersachsen-gymnasium-mathematik': {
      'polstellen-asymptoten': 'gebrochenrationale Funktionen mit Polstellen nicht im Kerncurriculum (siehe docs/lehrplaene/niedersachsen-gymnasium-mathematik.md)',
      'newton-verfahren': 'Newton-Verfahren nicht im Kerncurriculum',
      'monte-carlo-pi': 'kein passender Lernbereich',
      signifikanztest: 'Hypothesentests mit Fehlern 1. und 2. Art nicht im Kerncurriculum (nur Prognoseintervalle und Verträglichkeit)',
      'taylor-polynome': 'nicht im Kerncurriculum (Hochschule)',
      'fourier-reihen': 'nicht im Kerncurriculum (Hochschule)',
    },
    'niedersachsen-gymnasium-physik': {
      hebelgesetz: 'Hebel und einfache Maschinen nicht im Kerncurriculum (siehe docs/lehrplaene/niedersachsen-gymnasium-physik.md)',
      'schiefe-ebene': 'schiefe Ebene, Kräftezerlegung und Reibung nicht im Kerncurriculum',
      stoesse: 'Impuls und Stöße nicht im Kerncurriculum',
      planetenbahnen: 'Gravitationsgesetz und Kepler’sche Gesetze nicht im Kerncurriculum',
      'doppler-effekt': 'Doppler-Effekt nicht im Kerncurriculum',
    },
    'nordrhein-westfalen-gymnasium-mathematik': {
      'polstellen-asymptoten': 'gebrochenrationale Funktionen mit Polstellen nicht im Kernlehrplan (siehe docs/lehrplaene/nordrhein-westfalen-gymnasium-mathematik.md)',
      'newton-verfahren': 'Newton-Verfahren nicht im Kernlehrplan',
      'monte-carlo-pi': 'kein passender Schwerpunkt',
      signifikanztest: 'Hypothesentests nicht im Kernlehrplan (nur Prognose- und Konfidenzintervalle)',
      kugeln: 'Kugeln nicht im Kernlehrplan der Oberstufe',
      'taylor-polynome': 'nicht im Kernlehrplan (Hochschule)',
      'fourier-reihen': 'nicht im Kernlehrplan (Hochschule)',
      'matrix-abbildungen': 'Matrizen nicht im Kernlehrplan',
    },
    'nordrhein-westfalen-gymnasium-physik': {
      'doppler-effekt': 'Doppler-Effekt nicht im Kernlehrplan (siehe docs/lehrplaene/nordrhein-westfalen-gymnasium-physik.md)',
    },
  };

  it.each(STATE_CURRICULA.map((c) => [c.id, c] as const))('%s ordnet jede fertige Simulation einem Jahrgang zu (oder begründet die Ausnahme)', (id, curriculum) => {
    const used = new Set(curriculum.grades.flatMap((g) => simulationsOfGrade(g)));
    const except = NOT_IN_CURRICULUM[id] ?? {};
    const missing = readySimulations()
      .filter((s) => s.subject === curriculum.subject && !used.has(s.id) && !(s.id in except))
      .map((s) => s.id);
    expect(missing, 'fehlen im Länder-Lehrplan (zuordnen oder in NOT_IN_CURRICULUM begründen)').toEqual([]);
    // Ausnahmen, die inzwischen zugeordnet sind, aus der Liste nehmen
    for (const simId of Object.keys(except)) expect(used.has(simId), `${simId} ist zugeordnet – Ausnahme streichen`).toBe(false);
  });

  it('fasst Doppeljahrgangsstufen zu einer Stufe zusammen', () => {
    const hessen = getCurriculum('hessen-gymnasium-mathematik');
    const stage = getCurriculumGrade(hessen.id, 5);
    expect(gradeLabel(stage)).toBe('5/6');
    // auch über den zweiten Jahrgang erreichbar
    expect(getCurriculumGrade(hessen.id, 6)).toBe(stage);
    // Brüche (Simulation für Klasse 6) stehen jetzt direkt in der Stufe 5/6
    expect(unitsOf(stage).find((u) => u.code === '1.1.3')?.simulations?.length).toBeGreaterThan(0);
    expect(sameUnitElsewhere(hessen, 5, unitsOf(stage).find((u) => u.code === '1.1.3')!)).toEqual([]);
    // Bayern hat keine Doppeljahrgangsstufen
    expect(getCurriculum('bayern-gymnasium-mathematik').grades.every((g) => g.toGrade === undefined)).toBe(true);
  });

  it.each(STATE_CURRICULA.map((c) => [c.id, c] as const))('%s hat keine zwei aufeinanderfolgenden Stufen mit gleichen Lernbereichen', (_id, curriculum) => {
    const sig = (g: (typeof curriculum.grades)[number]) => unitsOf(g).map((u) => `${u.code}|${u.title.de}`).join(';');
    const grades = [...curriculum.grades].sort((a, b) => a.grade - b.grade);
    for (let i = 1; i < grades.length; i++) {
      const prev = grades[i - 1]!;
      if (grades[i]!.grade === (prev.toGrade ?? prev.grade) + 1) expect(sig(grades[i]!), `${gradeLabel(prev)} und ${gradeLabel(grades[i]!)}`).not.toBe(sig(prev));
    }
  });

  it('bezeichnet Stufen als „7“, „5/6“ oder „7–10“', () => {
    const g = (grade: number, toGrade?: number) => ({ grade, toGrade, sourceUrl: 'https://x', units: [] });
    expect(gradeLabel(g(7))).toBe('7');
    expect(gradeLabel(g(5, 6))).toBe('5/6');
    expect(gradeLabel(g(7, 10))).toBe('7–10');
  });
});
