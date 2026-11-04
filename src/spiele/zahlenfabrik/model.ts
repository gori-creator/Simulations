/**
 * Zahlenfabrik: Rechenlogik ohne Oberfläche (getestet in tests/zahlenfabrik.test.ts).
 *
 * Eine Quelle gibt Zahlen aus (immer dieselbe, eine Folge wie 1, 2, 3 … oder
 * eine selbst gewählte Startzahl). Bänder und Maschinen bringen sie Feld für
 * Feld weiter; betritt eine Zahl eine Maschine, wird sie verrechnet, eine
 * Weiche schickt sie je nach Prüfung geradeaus oder zur Seite. Jedes Lager
 * nimmt nur passende Zahlen an: eine bestimmte Zahl, Zahlen mit einer
 * Eigenschaft (z. B. Vielfache von 3) oder eine Wertetabelle der Reihe nach.
 */
export type Dir = 0 | 1 | 2 | 3; // rechts, unten, links, oben
export const DX = [1, 0, -1, 0] as const;
export const DY = [0, 1, 0, -1] as const;

export type Sym = '+' | '−' | '×' | '÷' | '²';
export interface Op {
  sym: Sym;
  n: number;
}

/** Prüfung einer Weiche: Was sie bejaht, läuft geradeaus weiter, alles andere biegt ab. */
export type Test = { kind: 'even' } | { kind: 'div'; n: number } | { kind: 'prime' } | { kind: 'gt'; n: number };

export interface Part {
  /** Band (ohne Rechnung) oder Maschine. */
  op: Op | null;
  /** Ausgang (bei der Weiche: für „ja“). */
  dir: Dir;
  /** Weiche: Prüfung; „nein“ geht zur Seite `side` (1 = rechts, 3 = links, von der Laufrichtung aus). */
  sort?: Test;
  side?: 1 | 3;
  /** Zusammenführen: zwei Zahlen werden zu Summe oder Produkt. */
  merge?: '+' | '×';
  /** Brücke: Zahlen laufen geradeaus darüber, waagerecht und senkrecht getrennt (zum Kreuzen). */
  bridge?: true;
}

/** Primzahl? (Zahlen kleiner als 2 sind keine.) */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

export function passes(test: Test, value: number): boolean {
  switch (test.kind) {
    case 'even':
      return value % 2 === 0;
    case 'div':
      return value % test.n === 0;
    case 'prime':
      return isPrime(value);
    case 'gt':
      return value > test.n;
  }
}

/** Ausgänge eines Teils: Weiche zwei (ja, nein), alle anderen einer. */
export function outputs(part: Part): Dir[] {
  return part.sort ? [part.dir, ((part.dir + (part.side ?? 1)) % 4) as Dir] : [part.dir];
}

/** Was ein Lager annimmt. */
export type Accept =
  | { kind: 'value'; n: number }
  /** Zahlen, die die Prüfung bestehen (mit `not`: die sie nicht bestehen). */
  | { kind: 'test'; test: Test; not?: boolean }
  /** Die Werte der Reihe nach (Wertetabelle). */
  | { kind: 'seq'; values: number[] };

export interface Target {
  x: number;
  y: number;
  /** So viele Zahlen müssen hier ankommen. */
  need: number;
  accept: Accept;
}

export interface Level {
  id: string;
  cols: number;
  rows: number;
  /**
   * Quelle: gibt `value` aus, oder der Reihe nach die Zahlen aus `values`,
   * oder mit `pick` eine Startzahl, die man selbst wählt (Rückwärts rechnen).
   */
  source: { x: number; y: number; dir: Dir; value: number; values?: number[]; pick?: { min: number; max: number } };
  /** Ein Lager für genau eine Zahl (Welt 1); sonst `targets`. */
  target?: { x: number; y: number; value: number };
  /** So viele Zahlen müssen ankommen (zu `target`). */
  need?: number;
  /** Mehrere Lager mit eigenen Regeln. */
  targets?: Target[];
  walls: [number, number][];
  /** Mit so wenigen Teilen gibt es den zweiten Stern (vorgegebene Teile zählen nicht). */
  par: number;
  /** Teile, die schon auf der Karte stehen und sich nicht entfernen lassen. */
  fixed?: { x: number; y: number; part: Part }[];
}

export type Grid = Map<string, Part>;
export const key = (x: number, y: number) => `${x},${y}`;

/** Alle Lager eines Levels (Welt 1: das eine Lager mit seiner Zahl). */
export function targetsOf(level: Level): Target[] {
  if (level.targets) return level.targets;
  const t = level.target!;
  return [{ x: t.x, y: t.y, need: level.need ?? 1, accept: { kind: 'value', n: t.value } }];
}

export const totalNeed = (level: Level) => targetsOf(level).reduce((a, t) => a + t.need, 0);

/** Nimmt das Lager diese Zahl an? `got`: so viele hat es schon (für die Wertetabelle). */
export function accepts(target: Target, value: number, got: number): boolean {
  const a = target.accept;
  switch (a.kind) {
    case 'value':
      return value === a.n;
    case 'test':
      return passes(a.test, value) !== !!a.not;
    case 'seq':
      return value === a.values[got % a.values.length];
  }
}

/** Zahl, die die Quelle als `index`-te ausgibt. */
export function sourceValue(level: Level, index: number, pick?: number): number {
  const sv = level.source;
  if (sv.values?.length) return sv.values[index % sv.values.length]!;
  if (sv.pick && pick !== undefined) return pick;
  return sv.value;
}

export function apply(op: Op, value: number): number | null {
  switch (op.sym) {
    case '²':
      return value * value;
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

export const opLabel = (op: Op) => (op.sym === '²' ? 'x²' : `${op.sym}${op.n}`);

export interface Item {
  id: number;
  x: number;
  y: number;
  value: number;
  /** Wartet im Zusammenführer auf eine zweite Zahl (nur offene Welt). */
  wait?: boolean;
  /** Richtung des letzten Schritts (für die Brücke; nur offene Welt). */
  heading?: Dir;
}

export type ErrorKind = 'fell' | 'wrong' | 'divide' | 'timeout';

export interface State {
  tick: number;
  items: Item[];
  emitted: number;
  delivered: number;
  /** Angekommene Zahlen je Lager. */
  got: number[];
  nextId: number;
  /** Bei „wrong“: welches Lager (Nummer in targetsOf). */
  error: { kind: ErrorKind; x: number; y: number; value: number; target?: number } | null;
  won: boolean;
  /** Selbst gewählte Startzahl (Quelle mit `pick`). */
  pick?: number;
}

export const EMIT_EVERY = 2;
export const MAX_TICKS = 300;

export function start(pick?: number): State {
  return { tick: 0, items: [], emitted: 0, delivered: 0, got: [], nextId: 1, error: null, won: false, pick };
}

const isWall = (level: Level, x: number, y: number) => level.walls.some(([wx, wy]) => wx === x && wy === y);

const targetIndex = (level: Level, x: number, y: number) => targetsOf(level).findIndex((t) => t.x === x && t.y === y);

/** Richtung, in die ein Feld eine Zahl weitergibt (null: kein Teil); Weichen prüfen die Zahl. */
function dirAt(level: Level, grid: Grid, x: number, y: number, value: number): Dir | null {
  if (x === level.source.x && y === level.source.y) return level.source.dir;
  const part = grid.get(key(x, y));
  if (!part) return null;
  return part.sort ? outputs(part)[passes(part.sort, value) ? 0 : 1]! : part.dir;
}

/** Ein Takt: alle Zahlen ein Feld weiter, dann ggf. eine neue aus der Quelle. */
export function step(level: Level, grid: Grid, state: State): State {
  if (state.error || state.won) return state;
  const targets = targetsOf(level);
  const s: State = { ...state, tick: state.tick + 1, items: [], got: [...state.got] };
  for (const item of state.items) {
    const dir = dirAt(level, grid, item.x, item.y, item.value);
    if (dir === null) {
      s.error = { kind: 'fell', x: item.x, y: item.y, value: item.value };
      return s;
    }
    const x = item.x + DX[dir];
    const y = item.y + DY[dir];
    const ti = targetIndex(level, x, y);
    if (ti >= 0) {
      if (!accepts(targets[ti]!, item.value, s.got[ti] ?? 0)) {
        s.error = { kind: 'wrong', x, y, value: item.value, target: ti };
        return s;
      }
      s.got[ti] = (s.got[ti] ?? 0) + 1;
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
  if (targets.every((t, i) => (s.got[i] ?? 0) >= t.need)) {
    s.won = true;
    return s;
  }
  if (s.emitted < totalNeed(level) && state.tick % EMIT_EVERY === 0) {
    s.items.push({ id: s.nextId, x: level.source.x, y: level.source.y, value: sourceValue(level, s.emitted, s.pick) });
    s.nextId += 1;
    s.emitted += 1;
  }
  if (s.tick >= MAX_TICKS) s.error = { kind: 'timeout', x: level.source.x, y: level.source.y, value: level.source.value };
  return s;
}

/** Ganz durchlaufen lassen (für Tests und „schnell“). */
export function run(level: Level, grid: Grid, pick?: number): State {
  let s = start(pick);
  while (!s.error && !s.won) s = step(level, grid, s);
  return s;
}

/** Ein Teil darf nur auf ein freies Feld (nicht Quelle, Lager, Fels, vorgegebenes Teil, außerhalb). */
export function canPlace(level: Level, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= level.cols || y >= level.rows) return false;
  if (x === level.source.x && y === level.source.y) return false;
  if (targetIndex(level, x, y) >= 0) return false;
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

/**
 * Kürzester Weg (Felder zwischen Quelle und Lager) um Felsen herum; vorgegebene
 * Teile gelten als frei. Ohne Angabe zum ersten Lager. Für Tests und Level-Planung.
 */
export function shortestPath(level: Level, to: { x: number; y: number } = targetsOf(level)[0]!, from?: [number, number]): [number, number][] | null {
  const start: [number, number] = from ?? [level.source.x + DX[level.source.dir], level.source.y + DY[level.source.dir]];
  const free = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < level.cols && y < level.rows && !isWall(level, x, y) && !(x === level.source.x && y === level.source.y) && targetIndex(level, x, y) < 0;
  if (!free(...start)) return null;
  const prev = new Map<string, string | null>([[key(...start), null]]);
  const queue: [number, number][] = [start];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const d of [0, 1, 2, 3] as Dir[]) {
      const nx = x + DX[d];
      const ny = y + DY[d];
      if (nx === to.x && ny === to.y) {
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
