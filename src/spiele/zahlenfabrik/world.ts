import { apply, DX, DY, key, type Dir, type Grid, type Item, type Op } from './model';

/**
 * Offene Welt: Auf einer großen Karte stehen viele Zahlenquellen, die ohne
 * Ende Zahlen ausgeben, sobald ein Band vor ihnen liegt. Irgendwo steht die
 * eigene Basis. Alles, was dort ankommt, wird gesammelt (Summe der Zahlen).
 * Zahlen, die vom Band fallen oder sich nicht teilen lassen, gehen verloren –
 * das Spiel läuft trotzdem weiter.
 */
export interface Spawner {
  x: number;
  y: number;
  dir: Dir;
  value: number;
}

export interface OpenWorld {
  id: string;
  cols: number;
  rows: number;
  spawners: Spawner[];
  base: { x: number; y: number; w: number; h: number };
  walls: [number, number][];
  tools: Op[];
}

export interface WorldState {
  tick: number;
  items: Item[];
  nextId: number;
  /** Summe aller gesammelten Zahlen. */
  score: number;
  /** Zahl der gesammelten Zahlen. */
  count: number;
  lost: number;
  /** Wo in diesem Takt Zahlen verloren gingen (für einen kleinen Effekt). */
  lostAt: [number, number][];
}

export const WORLD_EMIT = 3;
/** Zu große Zahlen (z. B. aus Kreisen mit ×10) gehen verloren. */
export const MAX_VALUE = 1_000_000;
/** Höchstens so viele Zahlen gleichzeitig unterwegs. */
export const MAX_ITEMS = 400;

export function worldStart(): WorldState {
  return { tick: 0, items: [], nextId: 1, score: 0, count: 0, lost: 0, lostAt: [] };
}

export const inBase = (w: OpenWorld, x: number, y: number) => x >= w.base.x && y >= w.base.y && x < w.base.x + w.base.w && y < w.base.y + w.base.h;
export const spawnerAt = (w: OpenWorld, x: number, y: number) => w.spawners.find((s) => s.x === x && s.y === y);
const wallAt = (w: OpenWorld, x: number, y: number) => w.walls.some(([a, b]) => a === x && b === y);

/** Bauen erlaubt: in der Karte, nicht auf Basis, Quelle oder Fels. */
export function canBuildWorld(w: OpenWorld, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= w.cols || y >= w.rows) return false;
  return !inBase(w, x, y) && !spawnerAt(w, x, y) && !wallAt(w, x, y);
}

export function worldStep(w: OpenWorld, grid: Grid, state: WorldState): WorldState {
  const s: WorldState = { ...state, tick: state.tick + 1, items: [], lostAt: [] };
  const lose = (x: number, y: number) => {
    s.lost += 1;
    s.lostAt.push([x, y]);
  };
  for (const item of state.items) {
    const dir = spawnerAt(w, item.x, item.y)?.dir ?? grid.get(key(item.x, item.y))?.dir;
    if (dir === undefined) {
      lose(item.x, item.y);
      continue;
    }
    const x = item.x + DX[dir];
    const y = item.y + DY[dir];
    if (inBase(w, x, y)) {
      s.score += item.value;
      s.count += 1;
      continue;
    }
    const part = grid.get(key(x, y));
    if (!part || !canBuildWorld(w, x, y)) {
      lose(item.x, item.y);
      continue;
    }
    let value = item.value;
    if (part.op) {
      const next = apply(part.op, value);
      if (next === null || Math.abs(next) > MAX_VALUE) {
        lose(x, y);
        continue;
      }
      value = next;
    }
    s.items.push({ ...item, x, y, value });
  }
  // Quellen geben nur aus, wenn vor ihnen ein Band, eine Maschine oder die Basis liegt
  w.spawners.forEach((sp, i) => {
    if ((state.tick + i) % WORLD_EMIT !== 0) return;
    const fx = sp.x + DX[sp.dir];
    const fy = sp.y + DY[sp.dir];
    if (!grid.has(key(fx, fy)) && !inBase(w, fx, fy)) return;
    s.items.push({ id: s.nextId, x: sp.x, y: sp.y, value: sp.value });
    s.nextId += 1;
  });
  if (s.items.length > MAX_ITEMS) {
    const drop = s.items.length - MAX_ITEMS;
    for (const it of s.items.slice(0, drop)) lose(it.x, it.y);
    s.items = s.items.slice(drop);
  }
  return s;
}

/** Wiederholbare Zufallszahlen (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Die offene Welt (immer gleich, damit man sich auskennt): Quellen in der
 * Nähe der Basis geben kleine Zahlen, weiter weg größere. Felsen in Gruppen.
 */
export function makeWorld(seed = 7): OpenWorld {
  const random = seeded(seed);
  const cols = 40;
  const rows = 28;
  const base = { x: 24, y: 15, w: 3, h: 3 };
  const w: OpenWorld = {
    id: 'welt',
    cols,
    rows,
    spawners: [],
    base,
    walls: [],
    tools: [
      { sym: '+', n: 1 },
      { sym: '+', n: 5 },
      { sym: '−', n: 1 },
      { sym: '×', n: 2 },
      { sym: '×', n: 3 },
      { sym: '×', n: 10 },
      { sym: '÷', n: 2 },
    ],
  };
  const cx = base.x + 1;
  const cy = base.y + 1;
  const nearBase = (x: number, y: number, r: number) => x >= base.x - r && x < base.x + base.w + r && y >= base.y - r && y < base.y + base.h + r;
  const taken = new Set<string>();
  const free = (x: number, y: number, r: number) => {
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (taken.has(key(x + dx, y + dy))) return false;
    return true;
  };
  // Quellen
  for (let tries = 0; w.spawners.length < 20 && tries < 5000; tries++) {
    const x = 1 + Math.floor(random() * (cols - 2));
    const y = 1 + Math.floor(random() * (rows - 2));
    if (nearBase(x, y, 3) || !free(x, y, 2)) continue;
    const d = Math.hypot(x - cx, y - cy);
    const value = d < 9 ? 1 + Math.floor(random() * 3) : d < 16 ? 2 + Math.floor(random() * 5) : 4 + Math.floor(random() * 6);
    // Richtung grob zur Basis, damit der Weg nicht hinter die Quelle führt
    const dir: Dir = Math.abs(cx - x) > Math.abs(cy - y) ? (cx > x ? 0 : 2) : cy > y ? 1 : 3;
    w.spawners.push({ x, y, dir, value });
    taken.add(key(x, y));
    taken.add(key(x + DX[dir], y + DY[dir]));
  }
  // Felsgruppen
  for (let g = 0; g < 14; g++) {
    const gx = Math.floor(random() * cols);
    const gy = Math.floor(random() * rows);
    const size = 2 + Math.floor(random() * 5);
    let x = gx;
    let y = gy;
    for (let i = 0; i < size; i++) {
      if (x >= 0 && y >= 0 && x < cols && y < rows && !nearBase(x, y, 1) && free(x, y, 1)) w.walls.push([x, y]);
      if (random() < 0.5) x += random() < 0.5 ? 1 : -1;
      else y += random() < 0.5 ? 1 : -1;
    }
  }
  return w;
}
