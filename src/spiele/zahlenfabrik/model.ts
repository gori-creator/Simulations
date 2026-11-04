/**
 * Zahlenfabrik: Rechenlogik ohne Oberfläche (getestet in tests/zahlenfabrik.test.ts).
 *
 * Eine Quelle gibt Zahlen aus, Bänder und Maschinen bringen sie Feld für Feld
 * weiter. Betritt eine Zahl eine Maschine, wird sie verrechnet. Das Lager
 * nimmt nur die geforderte Zahl an.
 */
export type Dir = 0 | 1 | 2 | 3; // rechts, unten, links, oben
export const DX = [1, 0, -1, 0] as const;
export const DY = [0, 1, 0, -1] as const;

export type Sym = '+' | '−' | '×' | '÷';
export interface Op {
  sym: Sym;
  n: number;
}

export interface Part {
  /** Band (ohne Rechnung) oder Maschine. */
  op: Op | null;
  dir: Dir;
}

export interface Level {
  id: string;
  cols: number;
  rows: number;
  source: { x: number; y: number; dir: Dir; value: number };
  target: { x: number; y: number; value: number };
  walls: [number, number][];
  /** Wählbare Maschinen (Bänder gibt es immer). */
  tools: Op[];
  /** So viele Zahlen müssen ankommen. */
  need: number;
  /** Mit so wenigen Teilen gibt es den zweiten Stern (vorgegebene Teile zählen nicht). */
  par: number;
  /** Teile, die schon auf der Karte stehen und sich nicht entfernen lassen. */
  fixed?: { x: number; y: number; part: Part }[];
}

export type Grid = Map<string, Part>;
export const key = (x: number, y: number) => `${x},${y}`;

export function apply(op: Op, value: number): number | null {
  switch (op.sym) {
    case '+':
      return value + op.n;
    case '−':
      return value - op.n;
    case '×':
      return value * op.n;
    case '÷':
      return value % op.n === 0 ? value / op.n : null;
  }
}

export const opLabel = (op: Op) => `${op.sym}${op.n}`;

export interface Item {
  id: number;
  x: number;
  y: number;
  value: number;
}

export type ErrorKind = 'fell' | 'wrong' | 'divide' | 'timeout';

export interface State {
  tick: number;
  items: Item[];
  emitted: number;
  delivered: number;
  nextId: number;
  error: { kind: ErrorKind; x: number; y: number; value: number } | null;
  won: boolean;
}

export const EMIT_EVERY = 2;
export const MAX_TICKS = 300;

export function start(): State {
  return { tick: 0, items: [], emitted: 0, delivered: 0, nextId: 1, error: null, won: false };
}

const isWall = (level: Level, x: number, y: number) => level.walls.some(([wx, wy]) => wx === x && wy === y);

/** Richtung, in die ein Feld Zahlen weitergibt (null: kein Teil). */
function dirAt(level: Level, grid: Grid, x: number, y: number): Dir | null {
  if (x === level.source.x && y === level.source.y) return level.source.dir;
  return grid.get(key(x, y))?.dir ?? null;
}

/** Ein Takt: alle Zahlen ein Feld weiter, dann ggf. eine neue aus der Quelle. */
export function step(level: Level, grid: Grid, state: State): State {
  if (state.error || state.won) return state;
  const s: State = { ...state, tick: state.tick + 1, items: [] };
  for (const item of state.items) {
    const dir = dirAt(level, grid, item.x, item.y);
    if (dir === null) {
      s.error = { kind: 'fell', x: item.x, y: item.y, value: item.value };
      return s;
    }
    const x = item.x + DX[dir];
    const y = item.y + DY[dir];
    if (x === level.target.x && y === level.target.y) {
      if (item.value !== level.target.value) {
        s.error = { kind: 'wrong', x, y, value: item.value };
        return s;
      }
      s.delivered += 1;
      continue;
    }
    const part = grid.get(key(x, y));
    if (x < 0 || y < 0 || x >= level.cols || y >= level.rows || isWall(level, x, y) || !part || (x === level.source.x && y === level.source.y)) {
      s.error = { kind: 'fell', x: item.x, y: item.y, value: item.value };
      return s;
    }
    let value = item.value;
    if (part.op) {
      const next = apply(part.op, value);
      if (next === null) {
        s.error = { kind: 'divide', x, y, value };
        return s;
      }
      value = next;
    }
    s.items.push({ ...item, x, y, value });
  }
  if (s.delivered >= level.need) {
    s.won = true;
    return s;
  }
  if (s.emitted < level.need && state.tick % EMIT_EVERY === 0) {
    s.items.push({ id: s.nextId, x: level.source.x, y: level.source.y, value: level.source.value });
    s.nextId += 1;
    s.emitted += 1;
  }
  if (s.tick >= MAX_TICKS) s.error = { kind: 'timeout', x: level.source.x, y: level.source.y, value: level.source.value };
  return s;
}

/** Ganz durchlaufen lassen (für Tests und „schnell“). */
export function run(level: Level, grid: Grid): State {
  let s = start();
  while (!s.error && !s.won) s = step(level, grid, s);
  return s;
}

/** Ein Teil darf nur auf ein freies Feld (nicht Quelle, Lager, Fels, vorgegebenes Teil, außerhalb). */
export function canPlace(level: Level, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= level.cols || y >= level.rows) return false;
  if (x === level.source.x && y === level.source.y) return false;
  if (x === level.target.x && y === level.target.y) return false;
  if (isFixed(level, x, y)) return false;
  return !isWall(level, x, y);
}

export function isFixed(level: Level, x: number, y: number): boolean {
  return !!level.fixed?.some((f) => f.x === x && f.y === y);
}

export { isWall };

/** Eigene Teile plus die vorgegebenen. */
export function withFixed(level: Level, grid: Grid): Grid {
  const all = new Map(grid);
  for (const f of level.fixed ?? []) all.set(key(f.x, f.y), f.part);
  return all;
}

/** Kürzester Weg (Zahl der Felder zwischen Quelle und Lager) um Felsen herum; vorgegebene Teile gelten als frei. Für Tests und Level-Planung. */
export function shortestPath(level: Level): [number, number][] | null {
  const start: [number, number] = [level.source.x + DX[level.source.dir], level.source.y + DY[level.source.dir]];
  const free = (x: number, y: number) => x >= 0 && y >= 0 && x < level.cols && y < level.rows && !isWall(level, x, y) && !(x === level.source.x && y === level.source.y);
  if (!free(...start)) return null;
  const prev = new Map<string, string | null>([[key(...start), null]]);
  const queue: [number, number][] = [start];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const d of [0, 1, 2, 3] as Dir[]) {
      const nx = x + DX[d];
      const ny = y + DY[d];
      if (nx === level.target.x && ny === level.target.y) {
        const path: [number, number][] = [];
        let k: string | null = key(x, y);
        while (k) {
          const [px, py] = k.split(',').map(Number) as [number, number];
          path.unshift([px, py]);
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

/** Sterne: geschafft 1, mit höchstens `par` Teilen +1, ohne Fehlversuch +1. */
export function starsFor(level: Level, parts: number, failedRuns: number): 1 | 2 | 3 {
  return (1 + (parts <= level.par ? 1 : 0) + (failedRuns === 0 ? 1 : 0)) as 1 | 2 | 3;
}
