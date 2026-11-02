/**
 * Lektion „Den Weg finden“: Suche in einem Gitter (Zustandsraum = Felder,
 * Übergänge = Schritte nach oben/rechts/unten/links, Kosten je Schritt 1).
 * Breitensuche (Warteschlange), Tiefensuche (Stapel), gierige Bestensuche
 * (nur Schätzung h) und A* (bisherige Kosten g + Schätzung h).
 */
export type Algo = 'bfs' | 'dfs' | 'greedy' | 'astar';

export interface Grid {
  w: number;
  h: number;
  walls: Set<number>;
  start: number;
  goal: number;
}

/** Karte: # Mauer, S Start, Z Ziel, . frei. */
export const MAP = [
  '...#..........',
  '...#.....#....',
  '...#.....#....',
  '...#.....#....',
  '.S.#.....###Z.',
  '...#.....#....',
  '.........#....',
  '..............',
  '.....#........',
];

export function parseMap(rows: readonly string[]): Grid {
  const h = rows.length;
  const w = rows[0]!.length;
  const walls = new Set<number>();
  let start = 0;
  let goal = 0;
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      const i = y * w + x;
      if (c === '#') walls.add(i);
      if (c === 'S') start = i;
      if (c === 'Z') goal = i;
    }),
  );
  return { w, h, walls, start, goal };
}

/** Nachbarn in fester Reihenfolge: oben, rechts, unten, links. */
export function neighbours(g: Grid, i: number): number[] {
  const x = i % g.w;
  const y = Math.floor(i / g.w);
  const out: number[] = [];
  if (y > 0) out.push(i - g.w);
  if (x < g.w - 1) out.push(i + 1);
  if (y < g.h - 1) out.push(i + g.w);
  if (x > 0) out.push(i - 1);
  return out.filter((n) => !g.walls.has(n));
}

/** Manhattan-Abstand zum Ziel (unterschätzt nie → A* findet den kürzesten Weg). */
export function manhattan(g: Grid, i: number): number {
  return Math.abs((i % g.w) - (g.goal % g.w)) + Math.abs(Math.floor(i / g.w) - Math.floor(g.goal / g.w));
}

export interface SearchRun {
  /** Felder in der Reihenfolge, in der sie expandiert (untersucht) wurden. */
  expanded: number[];
  /** Gefundener Weg vom Start zum Ziel (leer: keiner). */
  path: number[];
}

export function runSearch(g: Grid, algo: Algo): SearchRun {
  const parent = new Map<number, number>();
  const done = new Set<number>();
  const expanded: number[] = [];
  // Agenda: Einträge mit Herkunft, Kosten g, Priorität p und Einfüge-Zähler t
  const agenda: { i: number; from: number; g: number; p: number; h: number; t: number }[] = [{ i: g.start, from: -1, g: 0, p: 0, h: 0, t: 0 }];
  let tick = 0;
  const priority = (i: number, gCost: number): number => (algo === 'greedy' ? manhattan(g, i) : algo === 'astar' ? gCost + manhattan(g, i) : 0);
  while (agenda.length) {
    // Breitensuche: vorne entnehmen (Warteschlange); Tiefensuche: hinten (Stapel);
    // sonst: kleinste Priorität, bei Gleichstand die kleinere Schätzung, dann der früheste Eintrag
    let k = 0;
    const better = (a: (typeof agenda)[number], b: (typeof agenda)[number]) => a.p < b.p || (a.p === b.p && (a.h < b.h || (a.h === b.h && a.t < b.t)));
    if (algo === 'dfs') k = agenda.length - 1;
    else if (algo !== 'bfs') for (let j = 1; j < agenda.length; j++) if (better(agenda[j]!, agenda[k]!)) k = j;
    const entry = agenda.splice(k, 1)[0]!;
    if (done.has(entry.i)) continue;
    done.add(entry.i);
    if (entry.from >= 0) parent.set(entry.i, entry.from);
    expanded.push(entry.i);
    if (entry.i === g.goal) break;
    const nbs = neighbours(g, entry.i);
    // Tiefensuche: umgekehrt auf den Stapel, damit „oben“ zuerst drankommt
    for (const n of algo === 'dfs' ? [...nbs].reverse() : nbs) {
      if (done.has(n)) continue;
      agenda.push({ i: n, from: entry.i, g: entry.g + 1, p: priority(n, entry.g + 1), h: manhattan(g, n), t: ++tick });
    }
  }
  const path: number[] = [];
  if (done.has(g.goal)) {
    for (let at = g.goal; ; at = parent.get(at)!) {
      path.unshift(at);
      if (at === g.start) break;
    }
  }
  return { expanded, path };
}
