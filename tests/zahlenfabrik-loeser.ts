/**
 * Hilfen für die Level-Tests der Zahlenfabrik: Wege suchen und Musterlösungen
 * bauen (Bänder, Maschinen, Weichen). Keine Tests, nur Werkzeuge.
 */
import { DX, DY, isFixed, isWall, key, outputs, shortestPath, targetsOf, type Dir, type Grid, type Level, type Op, type Part, type Target, type Test } from '../src/spiele/zahlenfabrik/model';

export type Cell = [number, number];
const dirTo = (a: Cell, b: Cell): Dir => ([0, 1, 2, 3] as Dir[]).find((d) => a[0] + DX[d] === b[0] && a[1] + DY[d] === b[1])!;

/** Bänder entlang `path`; die letzte Zelle zeigt auf `end`. Maschinen ersetzen die ersten Bänder (vorgegebene Teile bleiben). */
export function lay(level: Level, grid: Grid, path: Cell[], end: Cell, ops: Op[] = []): void {
  let k = 0;
  path.forEach((c, i) => {
    const dir = dirTo(c, path[i + 1] ?? end);
    if (isFixed(level, c[0], c[1])) return;
    grid.set(key(...c), { op: ops[k++] ?? null, dir });
  });
  if (k < ops.length) throw new Error(`Weg zu kurz für ${ops.length} Maschinen`);
}

/** Teile, die man selbst setzt (ohne vorgegebene). */
export const own = (level: Level, grid: Grid) => [...grid.keys()].filter((k) => {
  const [x, y] = k.split(',').map(Number) as Cell;
  return !isFixed(level, x, y);
}).length;

/** Breitensuche von `from` zu einem Nachbarn von `to` (to selbst ist Lager oder Weiche); `blocked`: belegte Felder. */
function bfs(level: Level, from: Cell, to: Cell, blocked: Set<string>): Cell[] | null {
  const free = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < level.cols && y < level.rows && !isWall(level, x, y) && !blocked.has(key(x, y)) && !(x === level.source.x && y === level.source.y) && !targetsOf(level).some((t) => t.x === x && t.y === y);
  if (from[0] === to[0] && from[1] === to[1]) return [];
  if (!free(...from)) return null;
  const prev = new Map<string, string | null>([[key(...from), null]]);
  const queue: Cell[] = [from];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const d of [0, 1, 2, 3] as Dir[]) {
      const nx = x + DX[d];
      const ny = y + DY[d];
      if (nx === to[0] && ny === to[1]) {
        const path: Cell[] = [];
        let k: string | null = key(x, y);
        while (k) {
          path.unshift(k.split(',').map(Number) as Cell);
          k = prev.get(k)!;
        }
        return path;
      }
      if (!free(nx, ny) || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), key(x, y));
      queue.push([nx, ny]);
    }
  }
  return null;
}

/**
 * Kleinste Fabrik mit einer Weiche für zwei Lager (Lager 0: „ja“, Lager 1:
 * „nein“), Maschinen `ops` vor der Weiche. Probiert jede Stelle und Drehung
 * der Weiche; gibt die kleinste gefundene Fabrik zurück, deren Wege sich
 * nicht überschneiden.
 */
export function bestSort(level: Level, test: Test, ops: Op[] = [], opsYes: Op[] = [], opsNo: Op[] = []): Grid | null {
  const [a, b] = targetsOf(level) as [Target, Target];
  const front: Cell = [level.source.x + DX[level.source.dir], level.source.y + DY[level.source.dir]];
  let best: Grid | null = null;
  for (let sx = 0; sx < level.cols; sx++) {
    for (let sy = 0; sy < level.rows; sy++) {
      const s: Cell = [sx, sy];
      const toS = sx === front[0] && sy === front[1] ? [] : bfs(level, front, s, new Set());
      if (!toS || (toS.length === 0 && (sx !== front[0] || sy !== front[1]))) continue;
      if (toS.length < ops.length) continue;
      const used = new Set([...toS.map((c) => key(...c)), key(...s)]);
      if (isWall(level, sx, sy)) continue;
      for (const dir of [0, 1, 2, 3] as Dir[]) {
        for (const side of [1, 3] as const) {
          const part: Part = { op: null, dir, sort: test, side };
          const [yd, nd] = outputs(part) as [Dir, Dir];
          const ya: Cell = [sx + DX[yd], sy + DY[yd]];
          const na: Cell = [sx + DX[nd], sy + DY[nd]];
          // Eingang darf nicht aus einem Ausgang kommen
          const last = toS[toS.length - 1];
          const inDir = last ? dirTo(last, s) : level.source.dir;
          if ((inDir + 2) % 4 === yd || (inDir + 2) % 4 === nd) continue;
          const pa = ya[0] === a.x && ya[1] === a.y ? [] : bfs(level, ya, [a.x, a.y], used);
          if (!pa || pa.length < opsYes.length) continue;
          const used2 = new Set([...used, ...pa.map((c) => key(...c))]);
          const pb = na[0] === b.x && na[1] === b.y ? [] : bfs(level, na, [b.x, b.y], used2);
          if (!pb || pb.length < opsNo.length) continue;
          const g: Grid = new Map();
          if (toS.length) lay(level, g, toS, s, ops);
          g.set(key(...s), part);
          if (pa.length) lay(level, g, pa, [a.x, a.y], opsYes);
          if (pb.length) lay(level, g, pb, [b.x, b.y], opsNo);
          if (!best || g.size < best.size) best = g;
        }
      }
    }
  }
  return best;
}

/** Fabrik auf dem kürzesten Weg zum (einzigen) Lager, Maschinen in Reihenfolge auf die ersten Felder. */
export function straight(level: Level, ops: Op[] = []): Grid {
  const path = shortestPath(level)! as Cell[];
  const t = targetsOf(level)[0]!;
  const g: Grid = new Map();
  lay(level, g, path, [t.x, t.y], ops);
  return g;
}
