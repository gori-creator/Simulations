import type { Localized } from '../i18n/config';
import type { SubjectId } from './types';

/**
 * Bezüge zu den Bildungsstandards der Kultusministerkonferenz (KMK).
 *
 * Mathematik: Leitideen und prozessbezogene Kompetenzen der Bildungsstandards
 * für den Ersten Schulabschluss / Mittleren Schulabschluss (2022). In der
 * Allgemeinen Hochschulreife heißen einzelne Leitideen etwas anders; für die
 * grobe Einordnung werden hier die Sek-I-Bezeichnungen verwendet.
 *
 * Physik: Kompetenzbereiche sowie Basiskonzepte für Sek I und Sek II.
 *
 * Hinweis: Die Zuordnung ist ein erster Entwurf und sollte fachdidaktisch
 * geprüft werden. Länderspezifische Lehrpläne können später ergänzt werden.
 */
export interface KmkStandard {
  id: string;
  subject: SubjectId;
  kind: 'leitidee' | 'prozess' | 'kompetenzbereich' | 'basiskonzept';
  stage?: 'sek1' | 'sek2';
  title: Localized;
}

export const KMK_STANDARDS: KmkStandard[] = [
  // Mathematik – Leitideen
  { id: 'M-L1', subject: 'mathematik', kind: 'leitidee', title: { de: 'Zahl und Operation', en: 'Number and operations' } },
  { id: 'M-L2', subject: 'mathematik', kind: 'leitidee', title: { de: 'Größen und Messen', en: 'Quantities and measurement' } },
  { id: 'M-L3', subject: 'mathematik', kind: 'leitidee', title: { de: 'Strukturen und funktionaler Zusammenhang', en: 'Structures and functional relationships' } },
  { id: 'M-L4', subject: 'mathematik', kind: 'leitidee', title: { de: 'Raum und Form', en: 'Space and shape' } },
  { id: 'M-L5', subject: 'mathematik', kind: 'leitidee', title: { de: 'Daten und Zufall', en: 'Data and chance' } },
  // Mathematik – prozessbezogene Kompetenzen
  { id: 'M-K1', subject: 'mathematik', kind: 'prozess', title: { de: 'Mathematisch argumentieren', en: 'Reasoning mathematically' } },
  { id: 'M-K2', subject: 'mathematik', kind: 'prozess', title: { de: 'Mathematisch Probleme lösen', en: 'Solving problems mathematically' } },
  { id: 'M-K3', subject: 'mathematik', kind: 'prozess', title: { de: 'Mathematisch modellieren', en: 'Modelling mathematically' } },
  { id: 'M-K4', subject: 'mathematik', kind: 'prozess', title: { de: 'Mathematische Darstellungen verwenden', en: 'Using mathematical representations' } },
  { id: 'M-K5', subject: 'mathematik', kind: 'prozess', title: { de: 'Mit mathematischen Objekten umgehen', en: 'Working with mathematical objects' } },
  { id: 'M-K6', subject: 'mathematik', kind: 'prozess', title: { de: 'Kommunizieren', en: 'Communicating' } },

  // Physik – Kompetenzbereiche
  { id: 'P-S', subject: 'physik', kind: 'kompetenzbereich', title: { de: 'Sachkompetenz', en: 'Subject knowledge' } },
  { id: 'P-E', subject: 'physik', kind: 'kompetenzbereich', title: { de: 'Erkenntnisgewinnung', en: 'Scientific inquiry' } },
  { id: 'P-K', subject: 'physik', kind: 'kompetenzbereich', title: { de: 'Kommunikation', en: 'Communication' } },
  { id: 'P-B', subject: 'physik', kind: 'kompetenzbereich', title: { de: 'Bewertung', en: 'Evaluation' } },
  // Physik – Basiskonzepte Sek I
  { id: 'P-BK-Energie', subject: 'physik', kind: 'basiskonzept', stage: 'sek1', title: { de: 'Energie', en: 'Energy' } },
  { id: 'P-BK-Materie', subject: 'physik', kind: 'basiskonzept', stage: 'sek1', title: { de: 'Struktur der Materie', en: 'Structure of matter' } },
  { id: 'P-BK-System', subject: 'physik', kind: 'basiskonzept', stage: 'sek1', title: { de: 'System', en: 'System' } },
  { id: 'P-BK-Wechselwirkung', subject: 'physik', kind: 'basiskonzept', stage: 'sek1', title: { de: 'Wechselwirkung', en: 'Interaction' } },
  // Physik – Basiskonzepte Sek II
  { id: 'P-BK-Erhaltung', subject: 'physik', kind: 'basiskonzept', stage: 'sek2', title: { de: 'Erhaltung und Gleichgewicht', en: 'Conservation and equilibrium' } },
  { id: 'P-BK-Superposition', subject: 'physik', kind: 'basiskonzept', stage: 'sek2', title: { de: 'Superposition und Komponenten', en: 'Superposition and components' } },
  { id: 'P-BK-Mathematisieren', subject: 'physik', kind: 'basiskonzept', stage: 'sek2', title: { de: 'Mathematisieren und Vorhersagen', en: 'Mathematising and predicting' } },
  { id: 'P-BK-Zufall', subject: 'physik', kind: 'basiskonzept', stage: 'sek2', title: { de: 'Zufall und Determiniertheit', en: 'Chance and determinism' } },
];

const BY_ID = new Map(KMK_STANDARDS.map((s) => [s.id, s]));

export function getKmkStandard(id: string): KmkStandard | undefined {
  return BY_ID.get(id);
}
