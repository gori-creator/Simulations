import { L } from '../../curriculum/helpers';
import { KIT } from './kit';
import { riddle, VALUE_MAPS, type LevelInfo } from './levels';
import { makeRiddle } from './solver';

/**
 * Tagesrätsel und Zufallsrätsel: „Aus a wird b“ mit allen Bauteilen, höchstens
 * drei Maschinen und genau einem Weg. Das Tagesrätsel ist für alle am selben
 * Tag gleich (Startwert aus dem Datum), das Zufallsrätsel jedes Mal neu.
 */
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function puzzle(id: string, seed: number, daily: boolean): LevelInfo {
  const r = makeRiddle(seed, KIT);
  const base = riddle(id, VALUE_MAPS[seed % VALUE_MAPS.length]!, r.from, r.to, 3, true);
  const de = base.title.de;
  const en = base.title.en;
  return {
    ...base,
    title: daily ? L(`Tagesrätsel: ${de}`, `Daily puzzle: ${en}`) : L(`Zufallsrätsel: ${de}`, `Random puzzle: ${en}`),
    hint: L(
      'Alle Bauteile sind erlaubt, höchstens drei Maschinen – und es gibt genau einen Weg. Rechne von hinten: Welche Zahl muss kurz vor dem Lager ankommen?',
      'All parts are allowed, at most three machines – and there is exactly one way. Work from the back: which number has to arrive just before the storage?',
    ),
  };
}

/** Rätsel des Tages (gleicher Tag, gleiches Rätsel). */
export function dailyLevel(date = new Date()): LevelInfo {
  const key = dayKey(date);
  const seed = Number(key.replace(/-/g, ''));
  return puzzle(`t-${key}`, seed, true);
}

/** Neues Zufallsrätsel. */
export function randomLevel(seed = Math.floor(Math.random() * 1e9)): LevelInfo {
  return puzzle(`z-${seed}`, seed, false);
}
