import { describe, expect, it } from 'vitest';
import { key, type Grid } from '../src/spiele/zahlenfabrik/model';
import { canBuildWorld, inBase, makeWorld, MAX_VALUE, worldStart, worldStep, type OpenWorld } from '../src/spiele/zahlenfabrik/world';

const tiny: OpenWorld = {
  id: 't',
  cols: 8,
  rows: 3,
  spawners: [{ x: 0, y: 1, dir: 0, value: 2 }],
  base: { x: 5, y: 0, w: 3, h: 3 },
  walls: [],
  tools: [],
};
const belts = (ops: Record<number, { sym: '+' | '×' | '÷' | '−'; n: number }> = {}): Grid => new Map([1, 2, 3, 4].map((x) => [key(x, 1), { dir: 0 as const, op: ops[x] ?? null }]));
const runFor = (w: OpenWorld, g: Grid, ticks: number) => {
  let s = worldStart();
  for (let i = 0; i < ticks; i++) s = worldStep(w, g, s);
  return s;
};

describe('Zahlenfabrik: offene Welt', () => {
  it('sammelt Zahlen in der Basis (Summe)', () => {
    const s = runFor(tiny, belts(), 30);
    expect(s.count).toBeGreaterThan(5);
    expect(s.score).toBe(2 * s.count);
    expect(s.lost).toBe(0);
  });
  it('Maschinen verrechnen: (2 + 1) · 10 = 30 je Zahl', () => {
    const s = runFor(tiny, belts({ 2: { sym: '+', n: 1 }, 3: { sym: '×', n: 10 } }), 30);
    expect(s.score).toBe(30 * s.count);
  });
  it('ohne Band gibt die Quelle nichts aus', () => {
    expect(runFor(tiny, new Map(), 30).items).toHaveLength(0);
  });
  it('Lücke im Band: Zahlen gehen verloren, das Spiel läuft weiter', () => {
    const g = belts();
    g.delete(key(3, 1));
    const s = runFor(tiny, g, 30);
    expect(s.lost).toBeGreaterThan(3);
    expect(s.count).toBe(0);
  });
  it('Teilen, das nicht aufgeht, verliert die Zahl', () => {
    const w = { ...tiny, spawners: [{ x: 0, y: 1, dir: 0 as const, value: 3 }] };
    const s = runFor(w, belts({ 2: { sym: '÷', n: 2 } }), 30);
    expect(s.count).toBe(0);
    expect(s.lost).toBeGreaterThan(3);
  });
  it('Kreis mit ×10 läuft nicht über alle Grenzen', () => {
    const loop: Grid = new Map([
      [key(1, 1), { dir: 0, op: null }],
      [key(2, 1), { dir: 1, op: { sym: '×', n: 10 } }],
      [key(2, 2), { dir: 2, op: null }],
      [key(1, 2), { dir: 3, op: null }],
    ]);
    const s = runFor(tiny, loop, 200);
    expect(s.items.every((i) => Math.abs(i.value) <= MAX_VALUE)).toBe(true);
  });
  it('die Welt: 20 Quellen, Basis frei, alles innerhalb der Karte', () => {
    const w = makeWorld();
    expect(w.spawners).toHaveLength(20);
    expect(makeWorld()).toEqual(w);
    for (const s of w.spawners) {
      expect(inBase(w, s.x, s.y)).toBe(false);
      expect(s.value).toBeGreaterThanOrEqual(1);
      // Vor jeder Quelle kann man bauen
      expect(canBuildWorld(w, s.x + [1, 0, -1, 0][s.dir]!, s.y + [0, 1, 0, -1][s.dir]!)).toBe(true);
    }
    for (const [x, y] of w.walls) expect(inBase(w, x, y)).toBe(false);
    expect(canBuildWorld(w, w.base.x, w.base.y)).toBe(false);
  });
});
