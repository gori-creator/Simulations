import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import type { Level } from './model';

/** Welt 1 „Grundrechnen“ (Probe). Jeder Auftrag: aus der Zahl der Quelle die Zahl des Lagers machen. */
export interface LevelInfo extends Level {
  title: Localized;
  hint: Localized;
}

const row = (y: number, from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => [from + i, y] as [number, number]);

export const WORLD_1: LevelInfo[] = [
  {
    id: 'w1-1',
    title: L('Aus 3 wird 5', '3 becomes 5'),
    hint: L('Leg Bänder von der Quelle zum Lager und setz eine +2-Maschine dazwischen.', 'Lay belts from the source to the storage and put a +2 machine in between.'),
    cols: 7, rows: 3,
    source: { x: 0, y: 1, dir: 0, value: 3 },
    target: { x: 6, y: 1, value: 5 },
    walls: [],
    tools: [{ sym: '+', n: 2 }],
    need: 3, par: 5,
  },
  {
    id: 'w1-2',
    title: L('Aus 4 wird 12', '4 becomes 12'),
    hint: L('Nur eine der Maschinen passt.', 'Only one of the machines fits.'),
    cols: 7, rows: 3,
    source: { x: 0, y: 1, dir: 0, value: 4 },
    target: { x: 6, y: 1, value: 12 },
    walls: [],
    tools: [{ sym: '+', n: 2 }, { sym: '×', n: 3 }],
    need: 3, par: 5,
  },
  {
    id: 'w1-3',
    title: L('Aus 2 wird 10', '2 becomes 10'),
    hint: L('Du brauchst zwei Maschinen. Die Reihenfolge ist wichtig!', 'You need two machines. The order matters!'),
    cols: 7, rows: 3,
    source: { x: 0, y: 1, dir: 0, value: 2 },
    target: { x: 6, y: 1, value: 10 },
    walls: [],
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 2 }],
    need: 3, par: 5,
  },
  {
    id: 'w1-4',
    title: L('Aus 20 wird 7', '20 becomes 7'),
    hint: L('Teilen geht nur, wenn es glatt aufgeht.', 'Dividing only works if it comes out even.'),
    cols: 7, rows: 3,
    source: { x: 0, y: 1, dir: 0, value: 20 },
    target: { x: 6, y: 1, value: 7 },
    walls: [],
    tools: [{ sym: '−', n: 3 }, { sym: '÷', n: 2 }],
    need: 3, par: 5,
  },
  {
    id: 'w1-5',
    title: L('Um die Ecke', 'Around the corner'),
    hint: L('Das Lager liegt oben. Tipp ein Teil nochmal an, um es zu drehen.', 'The storage is at the top. Tap a part again to turn it.'),
    cols: 7, rows: 4,
    source: { x: 0, y: 3, dir: 0, value: 5 },
    target: { x: 6, y: 0, value: 16 },
    walls: row(1, 0, 4),
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 2 }, { sym: '−', n: 1 }],
    need: 3, par: 8,
  },
  {
    id: 'w1-6',
    title: L('Aus 1 wird 100', '1 becomes 100'),
    hint: L('Groß denken! Drei Maschinen stehen zur Wahl.', 'Think big! There are three machines to choose from.'),
    cols: 7, rows: 4,
    source: { x: 0, y: 0, dir: 1, value: 1 },
    target: { x: 6, y: 3, value: 100 },
    walls: [[2, 0], [2, 1], [4, 2], [4, 3]],
    tools: [{ sym: '+', n: 9 }, { sym: '×', n: 10 }, { sym: '×', n: 2 }],
    need: 3, par: 10,
  },
];
