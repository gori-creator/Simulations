import type { SubjectId } from '../types';
import { bayernGymnasiumMathematik } from './bayern-gymnasium-mathematik';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

export type * from './types';

/** Alle hinterlegten Länder-Lehrpläne. */
export const STATE_CURRICULA: StateCurriculum[] = [bayernGymnasiumMathematik];

export function curriculaFor(subject: SubjectId): StateCurriculum[] {
  return STATE_CURRICULA.filter((c) => c.subject === subject);
}

export function getCurriculum(id: string): StateCurriculum {
  const curriculum = STATE_CURRICULA.find((c) => c.id === id);
  if (!curriculum) throw new Error(`Unbekannter Lehrplan: ${id}`);
  return curriculum;
}

export function getCurriculumGrade(id: string, grade: number): CurriculumGrade {
  const entry = getCurriculum(id).grades.find((g) => g.grade === grade);
  if (!entry) throw new Error(`Jahrgangsstufe ${grade} fehlt im Lehrplan ${id}`);
  return entry;
}

/** Anker eines Lernbereichs auf der Seite der Jahrgangsstufe, z. B. "lb-7-2". */
export function unitAnchor(code: string): string {
  return `lb-${code.replace(/\./g, '-')}`;
}

/** Alle Lernbereiche einer Jahrgangsstufe (inklusive Unterbereiche). */
export function unitsOf(grade: CurriculumGrade): CurriculumUnit[] {
  return grade.units.flatMap((unit) => [unit, ...(unit.parts ?? [])]);
}

/** Alle Simulationen, die in einer Jahrgangsstufe vorkommen (ohne Doppelungen). */
export function simulationsOfGrade(grade: CurriculumGrade): string[] {
  return [...new Set(unitsOf(grade).flatMap((u) => u.simulations ?? []))];
}

export interface CurriculumReference {
  curriculum: StateCurriculum;
  grade: number;
  unit: CurriculumUnit;
}

/** Wo kommt eine Simulation in den Länder-Lehrplänen vor? */
export function referencesFor(simId: string): CurriculumReference[] {
  return STATE_CURRICULA.flatMap((curriculum) =>
    curriculum.grades.flatMap((grade) =>
      unitsOf(grade)
        .filter((unit) => unit.simulations?.includes(simId))
        .map((unit) => ({ curriculum, grade: grade.grade, unit })),
    ),
  );
}
