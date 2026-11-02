import { GUIDES as abenteuer } from './ki-abenteuer/lehrkraefte';
import { GUIDES as labor } from './ki-labor/lehrkraefte';
import type { WorldGuide } from './types';

/**
 * Handreichungen für Lehrkräfte je Kurs und Welt. Nur für die Seiten beim
 * Bauen gedacht (nicht im Spiel-Code), damit die Lektionsseiten schlank bleiben.
 */
export const COURSE_GUIDES: Record<string, Record<string, WorldGuide>> = {
  'ki-abenteuer': abenteuer,
  'ki-labor': labor,
};
