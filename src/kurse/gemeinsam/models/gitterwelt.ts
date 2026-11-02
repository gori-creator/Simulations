/**
 * Q-Lernen (Watkins 1989) in einer Gitterwelt. Zustände = Felder, Aktionen =
 * oben/rechts/unten/links. Belohnung: −1 je Schritt, Endfelder mit eigener
 * Belohnung (Ziel positiv, Falle negativ). Mauern blockieren.
 * Q(s,a) ← Q(s,a) + α · (r + γ · max Q(s′,·) − Q(s,a))
 */
export interface World {
  w: number;
  h: number;
  start: number;
  walls: Set<number>;
  /** Endfelder mit Belohnung. */
  terminals: Map<number, number>;
  stepCost: number;
}

/** Karte: S Start, # Mauer, Z Ziel (+10), K Keks (+3), F Falle (−10). */
export function parseWorld(rows: readonly string[], rewards: Record<string, number> = { Z: 10, K: 3, F: -10 }, stepCost = -1): World {
  const h = rows.length;
  const w = rows[0]!.length;
  const walls = new Set<number>();
  const terminals = new Map<number, number>();
  let start = 0;
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      const i = y * w + x;
      if (c === '#') walls.add(i);
      else if (c === 'S') start = i;
      else if (c in rewards) terminals.set(i, rewards[c]!);
    }),
  );
  return { w, h, start, walls, terminals, stepCost };
}

export const ACTIONS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

export function move(world: World, s: number, a: number): number {
  const x = (s % world.w) + ACTIONS[a]![0];
  const y = Math.floor(s / world.w) + ACTIONS[a]![1];
  if (x < 0 || y < 0 || x >= world.w || y >= world.h) return s;
  const n = y * world.w + x;
  return world.walls.has(n) ? s : n;
}

export type QTable = number[][];

export function newQ(world: World): QTable {
  return Array.from({ length: world.w * world.h }, () => [0, 0, 0, 0]);
}

export function bestAction(q: QTable, s: number, random?: () => number): number {
  const row = q[s]!;
  const max = Math.max(...row);
  const ties = row.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0);
  return random ? ties[Math.floor(random() * ties.length)]! : ties[0]!;
}

export interface StepResult {
  s: number;
  a: number;
  r: number;
  next: number;
  done: boolean;
}

/** Ein Lernschritt (ε-gierige Aktion, Q-Update). */
export function qStep(world: World, q: QTable, s: number, alpha: number, gamma: number, eps: number, random: () => number): StepResult {
  const a = random() < eps ? Math.floor(random() * 4) : bestAction(q, s, random);
  const next = move(world, s, a);
  const terminal = world.terminals.get(next);
  const done = terminal !== undefined;
  const r = world.stepCost + (terminal ?? 0);
  const target = r + (done ? 0 : gamma * Math.max(...q[next]!));
  q[s]![a]! += alpha * (target - q[s]![a]!);
  return { s, a, r, next, done };
}

/** Eine ganze Episode vom Start; liefert Schritte und Summe der Belohnungen. */
export function episode(world: World, q: QTable, alpha: number, gamma: number, eps: number, random: () => number, maxSteps = 100): { steps: number; ret: number; end: number } {
  let s = world.start;
  let ret = 0;
  for (let k = 1; k <= maxSteps; k++) {
    const r = qStep(world, q, s, alpha, gamma, eps, random);
    ret += r.r;
    s = r.next;
    if (r.done) return { steps: k, ret, end: s };
  }
  return { steps: maxSteps, ret, end: s };
}

/** Weg, den die gelernte Strategie (ohne Zufall) vom Start nimmt. */
export function greedyPath(world: World, q: QTable, maxSteps = 60): number[] {
  const path = [world.start];
  let s = world.start;
  const seen = new Set([s]);
  for (let k = 0; k < maxSteps; k++) {
    s = move(world, s, bestAction(q, s));
    path.push(s);
    if (world.terminals.has(s) || seen.has(s)) break;
    seen.add(s);
  }
  return path;
}
