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
    description: L('Das Lernspiel zum Rechnen: Bau eine Fabrik aus Förderbändern, Rechenmaschinen und Weichen. Über 30 Kapitel von Klasse 5 bis 9 – Grundrechnen, Teilbarkeit, Primzahlen, Brüche, Gleichungen, Folgen und Funktionen – dazu Tagesrätsel, eigene Level und eine offene Welt.', 'The maths learning game: build a factory from conveyor belts, calculating machines and switches. More than 30 chapters for grades 5 to 9 – arithmetic, divisibility, primes, fractions, equations, sequences and functions – plus daily puzzles, your own levels and an open world.'),
  },
];

/** Spiele öffentlich zeigen (Link in Kopf- und Fußleiste, in Suchmaschinen). Freigegeben am 20.11.2026. */
export const GAMES_PUBLIC = true;

export function getGame(id: string): GameMeta {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unbekanntes Spiel: ${id}`);
  return game;
}
