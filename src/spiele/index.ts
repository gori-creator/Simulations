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
    description: L('Bau eine Fabrik aus Bändern, Rechenmaschinen und Weichen: sechs Welten vom Grundrechnen über Primzahlen bis zu Funktionen, dazu eine offene Welt mit Münzen und Aufträgen.', 'Build a factory from belts, calculating machines and switches: six worlds from basic arithmetic via primes to functions, plus an open world with coins and orders.'),
  },
];

/** Spiele öffentlich zeigen? Bis zur Freigabe nur über die Adresse, nicht in Suchmaschinen. */
export const GAMES_PUBLIC = false;

export function getGame(id: string): GameMeta {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unbekanntes Spiel: ${id}`);
  return game;
}
