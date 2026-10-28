import { L } from '../helpers';
import { berlinGymnasiumPhysik } from './berlin-gymnasium-physik';
import type { StateCurriculum } from './types';

/**
 * Physik am Gymnasium in Brandenburg (G8, Abitur nach Jahrgangsstufe 12). Brandenburg und Berlin
 * haben denselben Rahmenlehrplan 7–10, Teil C Physik, und denselben Rahmenlehrplan für die
 * gymnasiale Oberstufe, Teil C Physik (2021); für das Gymnasium gilt in beiden Ländern
 * 7 = E, 8 = F, 9 = G, 10 = H. Die Jahrgangsstufen werden deshalb aus dem Berliner Lehrplan
 * übernommen.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/brandenburg-gymnasium-physik.{json,md};
 * Einordnung wie in docs/lehrplaene/berlin-gymnasium-physik.md.
 *
 * Überschriften entsprechen den Rahmenlehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const brandenburgGymnasiumPhysik: StateCurriculum = {
  ...berlinGymnasiumPhysik,
  id: 'brandenburg-gymnasium-physik',
  slug: L('brandenburg-gymnasium', 'brandenburg-gymnasium'),
  state: L('Brandenburg', 'Brandenburg'),
};
