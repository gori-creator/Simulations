import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import type { Level } from './model';

/**
 * Welt 1 „Grundrechnen“ (Probe). Jedes Level spielt auf einer freien Fläche
 * aus Kästchen, die man verschieben und zoomen kann. Felsen versperren den
 * Weg, manche Maschinen stehen schon da.
 */
export interface LevelInfo extends Level {
  title: Localized;
  hint: Localized;
}

/** Felsen von (x1, y1) bis (x2, y2) als Rechteck. */
const rocks = (x1: number, y1: number, x2: number, y2: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) out.push([x, y]);
  return out;
};

export const WORLD_1: LevelInfo[] = [
  {
    id: 'w1-1',
    title: L('Aus 3 wird 5', '3 becomes 5'),
    hint: L('Zieh mit dem Band von der Quelle zum Lager. Dann setz die +2-Maschine auf das Band.', 'Drag a belt from the source to the storage. Then put the +2 machine on the belt.'),
    cols: 14, rows: 9,
    source: { x: 3, y: 4, dir: 0, value: 3 },
    target: { x: 9, y: 4, value: 5 },
    walls: [[6, 1], [7, 1], [7, 2], [11, 7], [1, 7]],
    tools: [{ sym: '+', n: 2 }],
    need: 3, par: 5,
  },
  {
    id: 'w1-2',
    title: L('Aus 4 wird 12', '4 becomes 12'),
    hint: L('Nur eine der beiden Maschinen passt. Das Lager liegt etwas weiter unten.', 'Only one of the two machines fits. The storage is a bit further down.'),
    cols: 15, rows: 9,
    source: { x: 2, y: 3, dir: 0, value: 4 },
    target: { x: 11, y: 5, value: 12 },
    walls: [[6, 4], [6, 5], [7, 5], [12, 1], [3, 7]],
    tools: [{ sym: '+', n: 2 }, { sym: '×', n: 3 }],
    need: 3, par: 10,
  },
  {
    id: 'w1-3',
    title: L('Aus 2 wird 10', '2 becomes 10'),
    hint: L('Zwei Maschinen – die Reihenfolge ist wichtig! Die Felsen musst du umgehen.', 'Two machines – the order matters! You have to go around the rocks.'),
    cols: 15, rows: 9,
    source: { x: 2, y: 6, dir: 0, value: 2 },
    target: { x: 12, y: 2, value: 10 },
    walls: rocks(7, 0, 7, 5),
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 2 }],
    need: 3, par: 13,
  },
  {
    id: 'w1-4',
    title: L('Aus 20 wird 7', '20 becomes 7'),
    hint: L('Vor dem Lager steht schon eine −3-Maschine. Was muss davor passieren? Teilen geht nur, wenn es glatt aufgeht.', 'A −3 machine already stands in front of the storage. What has to happen before it? Dividing only works if it comes out even.'),
    cols: 15, rows: 10,
    source: { x: 2, y: 2, dir: 0, value: 20 },
    target: { x: 12, y: 7, value: 7 },
    walls: [...rocks(10, 6, 12, 6), ...rocks(10, 8, 12, 8), [13, 7], [5, 5], [5, 6]],
    fixed: [{ x: 10, y: 7, part: { op: { sym: '−', n: 3 }, dir: 0 } }],
    tools: [{ sym: '÷', n: 2 }, { sym: '−', n: 3 }],
    need: 3, par: 13,
  },
  {
    id: 'w1-5',
    title: L('Um die Felsen', 'Around the rocks'),
    hint: L('Das Lager liegt weit oben. Schieb die Karte mit der Hand, wenn du mehr sehen willst.', 'The storage is far up. Move the map with the hand to see more.'),
    cols: 16, rows: 11,
    source: { x: 2, y: 9, dir: 0, value: 5 },
    target: { x: 13, y: 1, value: 16 },
    walls: rocks(0, 5, 10, 5),
    tools: [{ sym: '+', n: 3 }, { sym: '×', n: 2 }, { sym: '−', n: 1 }],
    need: 3, par: 18,
  },
  {
    id: 'w1-6',
    title: L('Aus 1 wird 100', '1 becomes 100'),
    hint: L('Groß denken! Und such dir einen Weg durch die Felsen.', 'Think big! And find a way through the rocks.'),
    cols: 15, rows: 9,
    source: { x: 1, y: 1, dir: 1, value: 1 },
    target: { x: 13, y: 7, value: 100 },
    walls: [...rocks(4, 0, 4, 5), ...rocks(9, 3, 9, 8)],
    tools: [{ sym: '+', n: 9 }, { sym: '×', n: 10 }, { sym: '×', n: 2 }],
    need: 3, par: 25,
  },
];
