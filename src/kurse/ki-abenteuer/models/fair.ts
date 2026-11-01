import type { Sample } from './knn';

/**
 * Lektion „Ist das fair?“: Bit soll erkennen, ob etwas ein Schuh ist.
 * Am Anfang hat er nur Turnschuhe als Schuh-Beispiele gesehen. Sandalen
 * liegen in seinen Merkmalen weit weg davon – er hält sie für „kein Schuh“.
 * (x und y sind ausgedachte Merkmale, nur die Abstände zählen.)
 */
export type Kind = 'shoe' | 'other';
export type Group = 'sneaker' | 'boot' | 'sandal' | 'other';

export interface Thing extends Sample<Kind> {
  id: string;
  group: Group;
}

const t = (id: string, group: Group, x: number, y: number): Thing => ({ id, group, x, y, label: group === 'other' ? 'other' : 'shoe' });

/** Bits erste Trainingsdaten: nur Turnschuhe als Schuhe. */
export const START: Thing[] = [
  t('sneaker-1', 'sneaker', 7, 7),
  t('sneaker-2', 'sneaker', 7.6, 7.8),
  t('sneaker-3', 'sneaker', 6.4, 7.6),
  t('sneaker-4', 'sneaker', 7.2, 6.2),
  t('socke', 'other', 2, 7),
  t('muetze', 'other', 4.2, 1.6),
  t('rucksack', 'other', 3, 4.5),
  t('handschuh', 'other', 2.2, 5.6),
];

/** Was man Bit zusätzlich zeigen kann. */
export const POOL: Thing[] = [t('sneaker-5', 'sneaker', 6.8, 8.4), t('sandale-1', 'sandal', 7, 1.4), t('stiefel-1', 'boot', 9, 5.4), t('sandale-2', 'sandal', 6.4, 2.1), t('schal', 'other', 1.6, 6.2), t('flipflop', 'sandal', 8, 0.9)];

/** Bits Prüfung: je zwei Dinge pro Gruppe. */
export const TEST: Thing[] = [
  t('t-sneaker-1', 'sneaker', 7.4, 7.1),
  t('t-sneaker-2', 'sneaker', 6.6, 6.8),
  t('t-stiefel-1', 'boot', 9.2, 5.2),
  t('t-stiefel-2', 'boot', 8.6, 4.8),
  t('t-sandale-1', 'sandal', 7.2, 1.3),
  t('t-sandale-2', 'sandal', 6.8, 2.4),
  t('t-kappe', 'other', 1.4, 3.6),
  t('t-socke', 'other', 2.4, 6.6),
];

export const GROUPS: Group[] = ['sneaker', 'boot', 'sandal', 'other'];
