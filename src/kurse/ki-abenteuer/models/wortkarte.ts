import type { Localized } from '../../../i18n/config';

/**
 * Lektion „Die Wörter-Landkarte“: Wörter mit Plätzen auf einer Karte.
 * Ähnliche Wörter (die in Texten in ähnlichen Sätzen vorkommen) liegen nah
 * beieinander. Die Plätze sind von Hand gesetzt, wie eine kleine Version
 * dessen, was ein Sprachmodell lernt.
 */
export interface MapWord {
  id: string;
  name: Localized;
  icon: string;
  x: number;
  y: number;
  group: 'tiere' | 'essen' | 'fahrzeuge' | 'wetter';
}

const W = (id: string, de: string, en: string, icon: string, x: number, y: number, group: MapWord['group']): MapWord => ({ id, name: { de, en }, icon, x, y, group });

export const KNOWN: MapWord[] = [
  W('hund', 'Hund', 'dog', '🐕', 1.6, 8.2, 'tiere'),
  W('katze', 'Katze', 'cat', '🐈', 2.6, 8.8, 'tiere'),
  W('pferd', 'Pferd', 'horse', '🐎', 1.2, 7.0, 'tiere'),
  W('apfel', 'Apfel', 'apple', '🍎', 7.8, 8.4, 'essen'),
  W('pizza', 'Pizza', 'pizza', '🍕', 8.8, 7.4, 'essen'),
  W('banane', 'Banane', 'banana', '🍌', 7.2, 7.2, 'essen'),
  W('auto', 'Auto', 'car', '🚗', 1.8, 2.0, 'fahrzeuge'),
  W('bus', 'Bus', 'bus', '🚌', 2.9, 1.2, 'fahrzeuge'),
  W('fahrrad', 'Fahrrad', 'bike', '🚲', 1.0, 2.8, 'fahrzeuge'),
  W('regen', 'Regen', 'rain', '🌧️', 8.0, 2.2, 'wetter'),
  W('sonne', 'Sonne', 'sun', '☀️', 8.9, 1.4, 'wetter'),
  W('schnee', 'Schnee', 'snow', '❄️', 7.4, 1.0, 'wetter'),
];

/** Neue Wörter, die man einsortieren soll. */
export const NEW_WORDS: MapWord[] = [
  W('kuh', 'Kuh', 'cow', '🐄', 2.4, 7.4, 'tiere'),
  W('brot', 'Brot', 'bread', '🍞', 8.2, 6.6, 'essen'),
  W('zug', 'Zug', 'train', '🚆', 2.6, 2.6, 'fahrzeuge'),
  W('gewitter', 'Gewitter', 'thunderstorm', '⛈️', 8.6, 2.8, 'wetter'),
];

/** Zu welcher Gruppe gehört ein Platz auf der Karte (nächstes bekanntes Wort)? */
export function groupAt(x: number, y: number): MapWord['group'] {
  let best = KNOWN[0]!;
  let bd = Infinity;
  for (const w of KNOWN) {
    const d = (w.x - x) ** 2 + (w.y - y) ** 2;
    if (d < bd) {
      bd = d;
      best = w;
    }
  }
  return best.group;
}
