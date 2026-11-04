import { L } from '../curriculum/helpers';
import type { Localized } from '../i18n/config';

/** Kleine Spiele auf eigenen Seiten (bisher die Zahlenfabrik, als Probe). */
export interface GameMeta {
  id: string;
  slug: Localized;
  title: Localized;
  description: Localized;
}

export const GAMES: GameMeta[] = [
  {
    id: 'zahlenfabrik',
    slug: L('zahlenfabrik', 'number-factory'),
    title: L('Zahlenfabrik', 'Number Factory'),
    description: L('Bau eine Fabrik aus Bändern und Rechenmaschinen: Aus der Zahl der Quelle soll die Zahl im Lager werden.', 'Build a factory from belts and calculating machines: turn the source number into the number the storage wants.'),
  },
];

/** Spiele öffentlich zeigen? Bis zur Freigabe nur über die Adresse, nicht in Suchmaschinen. */
export const GAMES_PUBLIC = false;

export function getGame(id: string): GameMeta {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unbekanntes Spiel: ${id}`);
  return game;
}
