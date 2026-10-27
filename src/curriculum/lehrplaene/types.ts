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
  /** Name des Bundeslands; aus `state.de` entsteht die Länder-ID der Einstellung „Bundesland“ (src/lib/region.ts). */
  state: Localized;
  /**
   * Optional: Länder-ID ausdrücklich festlegen (nur Kleinbuchstaben, Ziffern, Bindestrich).
   * Normalerweise nicht nötig – sie wird aus `state.de` abgeleitet („Baden-Württemberg“ → "baden-wuerttemberg").
   */
  region?: string;
  schoolType: Localized;
  /** Name der Quelle, z. B. "LehrplanPLUS". */
  sourceName: string;
  grades: CurriculumGrade[];
}

export interface CurriculumGrade {
  /** Jahrgangsstufe bzw. erste Jahrgangsstufe einer Stufe (z. B. 5 bei „5/6“). */
  grade: number;
  /**
   * Letzte Jahrgangsstufe, wenn die Stufe mehrere Jahrgänge umfasst
   * (Doppeljahrgangsstufe 5/6, Physik 7–10). Aufeinanderfolgende Jahrgänge mit
   * gleichen Lernbereichen fasst `STATE_CURRICULA` automatisch so zusammen.
   */
  toGrade?: number;
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
