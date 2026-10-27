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
import { sachsenAnhaltGymnasiumMathematik } from "./sachsen-anhalt-gymnasium-mathematik";
import { sachsenAnhaltGymnasiumPhysik } from "./sachsen-anhalt-gymnasium-physik";
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
 * - Sachsen-Anhalt, Gymnasium: Mathematik und Physik (Fachlehrpläne, G8, Stand 01.08.2022)
 */
const RAW_CURRICULA: StateCurriculum[] = [
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
  sachsenAnhaltGymnasiumMathematik,
  sachsenAnhaltGymnasiumPhysik,
];

/** Lernbereiche (Nummer und Überschrift) einer Jahrgangsstufe als Vergleichsschlüssel. */
function unitSignature(grade: CurriculumGrade): string {
  return unitsOf(grade)
    .map((u) => `${u.code}|${u.title.de}`)
    .join(';');
}

/** Lernbereiche mehrerer Jahrgänge mit gleicher Gliederung vereinen (Simulationen ohne Doppelungen). */
function mergeUnits(lists: CurriculumUnit[][]): CurriculumUnit[] {
  return lists[0]!.map((unit, i) => {
    const same = lists.map((list) => list[i]!);
    const merged: CurriculumUnit = { ...unit };
    const sims = [...new Set(same.flatMap((u) => u.simulations ?? []))];
    if (sims.length > 0) merged.simulations = sims;
    else delete merged.simulations;
    if (unit.parts) merged.parts = mergeUnits(same.map((u) => u.parts ?? []));
    return merged;
  });
}

/**
 * Doppeljahrgangsstufen zusammenfassen: Aufeinanderfolgende Jahrgänge mit genau
 * denselben Lernbereichen (z. B. Hessen 5 und 6) werden eine Stufe „5/6“ mit
 * allen Simulationen beider Jahrgänge – statt zwei Seiten mit Querverweisen.
 */
export function mergeStages(curriculum: StateCurriculum): StateCurriculum {
  const sorted = [...curriculum.grades].sort((a, b) => a.grade - b.grade);
  const grades: CurriculumGrade[] = [];
  for (let i = 0; i < sorted.length; ) {
    const first = sorted[i]!;
    let j = i;
    while (
      first.toGrade === undefined &&
      j + 1 < sorted.length &&
      sorted[j + 1]!.toGrade === undefined &&
      sorted[j + 1]!.grade === sorted[j]!.grade + 1 &&
      unitSignature(sorted[j + 1]!) === unitSignature(first)
    )
      j++;
    if (j === i) grades.push(first);
    else {
      const run = sorted.slice(i, j + 1);
      grades.push({ ...first, toGrade: sorted[j]!.grade, units: mergeUnits(run.map((g) => g.units)) });
    }
    i = j + 1;
  }
  return { ...curriculum, grades };
}

/** Alle Länder-Lehrpläne mit zusammengefassten Doppeljahrgangsstufen. */
export const STATE_CURRICULA: StateCurriculum[] = RAW_CURRICULA.map(mergeStages);

/** Bezeichnung einer Stufe: „7“, „5/6“ (zwei Jahrgänge) oder „7–10“. */
export function gradeLabel(grade: CurriculumGrade): string {
  const to = grade.toGrade ?? grade.grade;
  if (to === grade.grade) return String(grade.grade);
  return to === grade.grade + 1 ? `${grade.grade}/${to}` : `${grade.grade}–${to}`;
}

/** Umfasst die Stufe die Jahrgangsstufe n? */
export function coversGrade(grade: CurriculumGrade, n: number): boolean {
  return grade.grade <= n && n <= (grade.toGrade ?? grade.grade);
}

export function curriculaFor(subject: SubjectId): StateCurriculum[] {
  return STATE_CURRICULA.filter((c) => c.subject === subject);
}

export function getCurriculum(id: string): StateCurriculum {
  const curriculum = STATE_CURRICULA.find((c) => c.id === id);
  if (!curriculum) throw new Error(`Unbekannter Lehrplan: ${id}`);
  return curriculum;
}

export function getCurriculumGrade(id: string, grade: number): CurriculumGrade {
  // auch über eine Jahrgangsstufe innerhalb einer zusammengefassten Stufe (6 → „5/6“)
  const grades = getCurriculum(id).grades;
  const entry = grades.find((g) => g.grade === grade) ?? grades.find((g) => coversGrade(g, grade));
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
 * Andere Stufen, in denen derselbe Lernbereich (gleiche Nummer und Überschrift)
 * Simulationen hat. Doppeljahrgangsstufen sind zusammengefasst; das betrifft nur
 * noch Lehrpläne, deren Stufen sich teilweise gleichen.
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
  /** Bezeichnung der Stufe, z. B. „7“ oder „5/6“. */
  label: string;
  unit: CurriculumUnit;
}

/** Wo kommt eine Simulation in den Länder-Lehrplänen vor? */
export function referencesFor(simId: string): CurriculumReference[] {
  return STATE_CURRICULA.flatMap((curriculum) =>
    curriculum.grades.flatMap((grade) =>
      unitsOf(grade)
        .filter((unit) => unit.simulations?.includes(simId))
        .map((unit) => ({ curriculum, grade: grade.grade, label: gradeLabel(grade), unit })),
    ),
  );
}
