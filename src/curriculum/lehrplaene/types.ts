import type { Localized } from '../../i18n/config';
import type { SubjectId } from '../types';

/**
 * Lehrplan eines Bundeslands für ein Fach und eine Schulart – gegliedert nach
 * Jahrgangsstufen und Lernbereichen. Die Lernbereiche verweisen auf
 * Simulationen aus dem allgemeinen Lehrplan (curriculum/<fach>.ts).
 */
export interface StateCurriculum {
  /** Stabile ID, z. B. "bayern-gymnasium-mathematik". */
  id: string;
  subject: SubjectId;
  /** URL-Segment unterhalb des Fachs, z. B. /de/mathematik/bayern-gymnasium/. */
  slug: Localized;
  state: Localized;
  schoolType: Localized;
  /** Name der Quelle, z. B. "LehrplanPLUS". */
  sourceName: string;
  grades: CurriculumGrade[];
}

export interface CurriculumGrade {
  grade: number;
  /** Link zum offiziellen Fachlehrplan dieser Jahrgangsstufe. */
  sourceUrl: string;
  /** Hinweis, z. B. zum Anforderungsniveau. */
  note?: Localized;
  units: CurriculumUnit[];
}

export interface CurriculumUnit {
  /** Nummer des Lernbereichs, z. B. "1" oder "1.2". */
  code: string;
  /** Überschrift des Lernbereichs (wie im Lehrplan). */
  title: Localized;
  /** Kurzbeschreibung in eigenen Worten. */
  summary?: Localized;
  /** IDs der passenden Simulationen. */
  simulations?: string[];
  /** Unterbereiche (z. B. 1.1, 1.2). */
  parts?: CurriculumUnit[];
}
