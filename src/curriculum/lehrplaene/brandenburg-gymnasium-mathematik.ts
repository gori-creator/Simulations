import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { berlinGymnasiumMathematik, D_PARTS, niveauUnits } from './berlin-gymnasium-mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, StateCurriculum } from './types';

/**
 * Brandenburg und Berlin haben denselben Rahmenlehrplan 1–10 und denselben Rahmenlehrplan für
 * die gymnasiale Oberstufe. Für das Gymnasium gilt in beiden Ländern 7 = E, 8 = F, 9 = G, 10 = H;
 * die Jahrgangsstufen 7–12 werden deshalb aus dem Berliner Lehrplan übernommen.
 * Abweichend gilt in Brandenburg für Schulen mit den Jahrgangsstufen 5 und 6 in beiden die
 * Niveaustufe D (Rahmenlehrplan 1–10, Teil C Mathematik, S. 17).
 */
const NOTE_5_6 = L(
  'Jahrgangsstufen 5 und 6: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; für weiterführende allgemeinbildende Schulen mit den Jahrgangsstufen 5 und 6 gilt in Brandenburg die Niveaustufe D. In der Regel wechseln die Schülerinnen und Schüler erst nach Jahrgangsstufe 6 von der Grundschule ans Gymnasium. Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.',
  'Grades 5 and 6: the framework curriculum for grades 1–10 is organised by levels A–H, not by grades; in Brandenburg, secondary schools with grades 5 and 6 work at level D. Usually pupils move from primary school to the Gymnasium after grade 6. Units are the subject areas, sub-units their topics; the numbers are our own.',
);

const grade56 = (n: number): CurriculumGrade => ({
  grade: n,
  sourceUrl: berlinGymnasiumMathematik.grades[0]!.sourceUrl,
  note: NOTE_5_6,
  units: unitsForGrade(mathematik, n, niveauUnits(L('Niveaustufe D', 'level D'), D_PARTS)),
});

/**
 * Mathematik am Gymnasium in Brandenburg (G8, Abitur nach Jahrgangsstufe 12) nach
 * - „Rahmenlehrplan für die Jahrgangsstufen 1–10, Teil C Mathematik“, LISUM, Berlin, Potsdam 2023
 *   (in Brandenburg ab 1. August 2023 gültig, ab 2024/25 für alle Jahrgangsstufen 1–10), und
 * - „Rahmenlehrplan für die gymnasiale Oberstufe, Teil C Mathematik“, gültig ab 1. August 2014.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/brandenburg-gymnasium-mathematik.{json,md};
 * Einordnung wie in docs/lehrplaene/berlin-gymnasium-mathematik.md.
 *
 * Überschriften entsprechen den Rahmenlehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const brandenburgGymnasiumMathematik: StateCurriculum = {
  id: 'brandenburg-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('brandenburg-gymnasium', 'brandenburg-gymnasium'),
  state: L('Brandenburg', 'Brandenburg'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Rahmenlehrplan',
  grades: [grade56(5), grade56(6), ...berlinGymnasiumMathematik.grades.filter((g) => g.grade >= 7)],
};
