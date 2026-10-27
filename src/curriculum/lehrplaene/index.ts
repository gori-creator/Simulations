import type { SubjectId } from "../types";
import { badenWuerttembergGymnasiumMathematik } from "./baden-wuerttemberg-gymnasium-mathematik";
import { badenWuerttembergGymnasiumPhysik } from "./baden-wuerttemberg-gymnasium-physik";
import { bayernGymnasiumMathematik } from "./bayern-gymnasium-mathematik";
import { bayernGymnasiumPhysik } from "./bayern-gymnasium-physik";
import { hessenGymnasiumMathematik } from "./hessen-gymnasium-mathematik";
import { hessenGymnasiumPhysik } from "./hessen-gymnasium-physik";
import { niedersachsenGymnasiumMathematik } from "./niedersachsen-gymnasium-mathematik";
import { niedersachsenGymnasiumPhysik } from "./niedersachsen-gymnasium-physik";
import { nordrheinWestfalenGymnasiumMathematik } from "./nordrhein-westfalen-gymnasium-mathematik";
import { nordrheinWestfalenGymnasiumPhysik } from "./nordrhein-westfalen-gymnasium-physik";
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from "./types";

export type * from "./types";

/**
 * Alle hinterlegten Länder-Lehrpläne (je Bundesland, Schulart und Fach eine Datei).
 * Reihenfolge = Reihenfolge auf der Fachseite. Aufbereitete Quelldaten und
 * Protokolle (Lücken, Unklarheiten) liegen in docs/lehrplaene/.
 *
 * - Baden-Württemberg, Gymnasium: Mathematik und Physik (Bildungsplan, G9)
 * - Bayern, Gymnasium: Mathematik und Physik (LehrplanPLUS)
 * - Hessen, Gymnasium: Mathematik und Physik (Kerncurricula Sek. I und gymnasiale Oberstufe)
 * - Niedersachsen, Gymnasium: Mathematik und Physik (Kerncurricula Sek. I und gymnasiale Oberstufe)
 * - Nordrhein-Westfalen, Gymnasium: Mathematik und Physik (Kernlehrpläne Sek. I, G9, und Sek. II von 2026)
 */
export const STATE_CURRICULA: StateCurriculum[] = [
  badenWuerttembergGymnasiumMathematik,
  badenWuerttembergGymnasiumPhysik,
  bayernGymnasiumMathematik,
  bayernGymnasiumPhysik,
  hessenGymnasiumMathematik,
  hessenGymnasiumPhysik,
  niedersachsenGymnasiumMathematik,
  niedersachsenGymnasiumPhysik,
  nordrheinWestfalenGymnasiumMathematik,
  nordrheinWestfalenGymnasiumPhysik,
];

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
  if (!entry)
    throw new Error(`Jahrgangsstufe ${grade} fehlt im Lehrplan ${id}`);
  return entry;
}

/** Anker eines Lernbereichs auf der Seite der Jahrgangsstufe, z. B. "lb-7-2". */
export function unitAnchor(code: string): string {
  return `lb-${code.replace(/\./g, "-")}`;
}

/** Alle Lernbereiche einer Jahrgangsstufe (inklusive Unterbereiche). */
export function unitsOf(grade: CurriculumGrade): CurriculumUnit[] {
  return grade.units.flatMap((unit) => [unit, ...(unit.parts ?? [])]);
}

/** Alle Simulationen, die in einer Jahrgangsstufe vorkommen (ohne Doppelungen). */
export function simulationsOfGrade(grade: CurriculumGrade): string[] {
  return [...new Set(unitsOf(grade).flatMap((u) => u.simulations ?? []))];
}

/**
 * Jahrgangsstufen, in denen derselbe Lernbereich (gleiche Nummer und Überschrift)
 * Simulationen hat – z. B. bei Doppeljahrgangsstufen (Hessen 5/6), wenn eine
 * Simulation nur zu einer der beiden Stufen passt.
 */
export function sameUnitElsewhere(
  curriculum: StateCurriculum,
  grade: number,
  unit: CurriculumUnit,
): number[] {
  return curriculum.grades
    .filter((g) => g.grade !== grade)
    .filter((g) =>
      unitsOf(g).some(
        (u) =>
          u.code === unit.code &&
          u.title.de === unit.title.de &&
          (u.simulations?.length ?? 0) > 0,
      ),
    )
    .map((g) => g.grade);
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
