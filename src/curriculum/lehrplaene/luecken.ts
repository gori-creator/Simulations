import { gradeLabel, STATE_CURRICULA } from './index';
import type { CurriculumUnit, StateCurriculum } from './types';

/**
 * Lernbereiche der Länder-Lehrpläne, zu denen es noch keine Simulation gibt –
 * als Vorrat für neue Simulationen. Daraus entsteht `docs/LEHRPLAN-LUECKEN.md`
 * (`npm run lehrplan:luecken`; ein Test meldet, wenn die Datei veraltet ist).
 */
export interface CurriculumGap {
  curriculum: StateCurriculum;
  stage: string;
  unit: CurriculumUnit;
  /** Übergeordneter Lernbereich bei Unterbereichen. */
  parent?: CurriculumUnit;
}

/** Alle Lernbereiche ohne Simulation (bei Bereichen mit Unterbereichen: die Unterbereiche). */
export function curriculumGaps(curricula: StateCurriculum[] = STATE_CURRICULA): CurriculumGap[] {
  const gaps: CurriculumGap[] = [];
  for (const curriculum of curricula) {
    for (const grade of [...curriculum.grades].sort((a, b) => a.grade - b.grade)) {
      const stage = gradeLabel(grade);
      for (const unit of grade.units) {
        if (unit.parts) {
          for (const part of unit.parts) if (!part.simulations?.length) gaps.push({ curriculum, stage, unit: part, parent: unit });
        } else if (!unit.simulations?.length) gaps.push({ curriculum, stage, unit });
      }
    }
  }
  return gaps;
}

const SUBJECT_TITLE: Record<string, string> = { mathematik: 'Mathematik', physik: 'Physik', chemie: 'Chemie' };

/** Markdown-Liste der Lücken, nach Fach, Land und Stufe gegliedert. */
export function curriculumGapsMarkdown(curricula: StateCurriculum[] = STATE_CURRICULA): string {
  const gaps = curriculumGaps(curricula);
  const total = curricula.reduce(
    (n, c) => n + c.grades.reduce((m, g) => m + g.units.reduce((k, u) => k + (u.parts ? u.parts.length : 1), 0), 0),
    0,
  );
  const lines: string[] = [
    '# Lehrplan-Themen ohne Simulation',
    '',
    '<!-- Automatisch erzeugt mit `npm run lehrplan:luecken` aus src/curriculum/lehrplaene/ – nicht von Hand bearbeiten. -->',
    '',
    `Lernbereiche der Länder-Lehrpläne, zu denen es noch **keine** Simulation gibt – Vorrat für neue Simulationen (Anleitung: \`docs/NEUE-SIMULATION.md\`). Insgesamt **${gaps.length} von ${total}** Lernbereichen ohne Simulation.`,
    '',
    'Nicht jeder Lernbereich eignet sich für eine Simulation (z. B. reine Rechenfertigkeiten oder Methoden). Kommt ein Thema in mehreren Ländern vor, lohnt es sich besonders.',
    '',
  ];
  for (const subject of [...new Set(curricula.map((c) => c.subject))]) {
    const ofSubject = gaps.filter((g) => g.curriculum.subject === subject);
    lines.push(`## ${SUBJECT_TITLE[subject] ?? subject} (${ofSubject.length})`, '');
    for (const curriculum of curricula.filter((c) => c.subject === subject)) {
      const own = ofSubject.filter((g) => g.curriculum === curriculum);
      lines.push(`### ${curriculum.state.de} · ${curriculum.schoolType.de} (${own.length})`, '');
      if (own.length === 0) {
        lines.push('Alle Lernbereiche haben eine Simulation.', '');
        continue;
      }
      lines.push('| Stufe | Nr. | Lernbereich | Kurz |', '| --- | --- | --- | --- |');
      for (const g of own) {
        const title = g.parent ? `${g.parent.title.de} › ${g.unit.title.de}` : g.unit.title.de;
        const cell = (text: string) => text.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
        lines.push(`| ${g.stage} | ${cell(g.unit.code)} | ${cell(title)} | ${cell(g.unit.summary?.de ?? '')} |`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}
