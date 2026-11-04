import { describe, expect, it } from 'vitest';
import { key, type Grid, type Part } from '../src/spiele/zahlenfabrik/model';
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

describe('Zahlenfabrik: Stau, Weichen, Zusammenführen', () => {
  const g = (entries: [number, number, Part][]): Grid => new Map(entries.map(([x, y, p]) => [key(x, y), p]));
  const belt = (dir: 0 | 1 | 2 | 3): Part => ({ op: null, dir });
  /** Keine zwei Zahlen auf einem Feld – in jedem Takt. */
  const noOverlap = (w: OpenWorld, grid: Grid, ticks: number) => {
    let s = worldStart();
    for (let i = 0; i < ticks; i++) {
      s = worldStep(w, grid, s);
      const cells = s.items.map((it) => key(it.x, it.y));
      expect(new Set(cells).size).toBe(cells.length);
    }
    return s;
  };

  it('Stau: nie zwei Zahlen auf einem Feld, auch wenn ein Zusammenführer die Zahlen aufhält', () => {
    // Quelle → Bänder → Zusammenführer; sein Ausgang führt ins Leere, die Ergebnisse fallen herunter
    const w: OpenWorld = { ...tiny, spawners: [{ x: 0, y: 1, dir: 0, value: 2 }] };
    const grid = g([[1, 1, belt(0)], [2, 1, belt(0)], [3, 1, { op: null, dir: 1, merge: '+' }]]);
    const s = noOverlap(w, grid, 60);
    expect(s.items.length).toBeLessThanOrEqual(4);
  });

  it('zwei Zusammenführer hintereinander: 1 + 1 = 2, dann 2 + 2 = 4; nichts geht verloren', () => {
    const w: OpenWorld = { ...tiny, spawners: [{ x: 0, y: 1, dir: 0, value: 1 }] };
    const grid = g([[1, 1, belt(0)], [2, 1, { op: null, dir: 0, merge: '+' }], [3, 1, { op: null, dir: 0, merge: '+' }], [4, 1, belt(0)]]);
    const s = noOverlap(w, grid, 200);
    // 1+1 = 2 wartet im zweiten, 1+1 = 2 kommt dazu → 4; alles kommt als 4 an
    expect(s.count).toBeGreaterThan(5);
    expect(s.score).toBe(4 * s.count);
    expect(s.lost).toBe(0);
  });

  it('Zusammenführen (Summe): zwei Quellen 2 und 3 → nur 5 kommt an', () => {
    const w: OpenWorld = {
      ...tiny,
      rows: 5,
      base: { x: 5, y: 1, w: 3, h: 3 },
      spawners: [
        { x: 0, y: 0, dir: 0, value: 2 },
        { x: 0, y: 4, dir: 0, value: 3 },
      ],
    };
    const grid = g([
      [1, 0, belt(0)], [2, 0, belt(0)], [3, 0, belt(1)], [3, 1, belt(1)],
      [1, 4, belt(0)], [2, 4, belt(0)], [3, 4, belt(3)], [3, 3, belt(3)],
      [3, 2, { op: null, dir: 0, merge: '+' }], [4, 2, belt(0)],
    ]);
    const s = noOverlap(w, grid, 120);
    expect(s.count).toBeGreaterThan(5);
    expect(s.score).toBe(5 * s.count);
    expect(s.lost).toBe(0);
  });

  it('Zusammenführen (Produkt): 3 und 3 → 9', () => {
    const w = { ...tiny, spawners: [{ x: 0, y: 1, dir: 0 as const, value: 3 }] };
    const grid = g([[1, 1, belt(0)], [2, 1, { op: null, dir: 0, merge: '×' }], [3, 1, belt(0)], [4, 1, belt(0)]]);
    const s = noOverlap(w, grid, 120);
    expect(s.count).toBeGreaterThan(5);
    expect(s.score).toBe(9 * s.count);
  });

  it('Weiche „gerade?“: gerade Zahlen geradeaus in die Basis, ungerade zur Seite (dort fallen sie herunter)', () => {
    const w: OpenWorld = { ...tiny, rows: 4, spawners: [{ x: 0, y: 1, dir: 0, value: 4 }] };
    const grid = g([[1, 1, belt(0)], [2, 1, belt(0)], [3, 1, { op: null, dir: 0, sort: { kind: 'even' }, side: 1 }], [4, 1, belt(0)]]);
    const even = noOverlap(w, grid, 60);
    expect(even.count).toBeGreaterThan(5);
    expect(even.lost).toBe(0);
    const odd = noOverlap({ ...w, spawners: [{ x: 0, y: 1, dir: 0, value: 5 }] }, grid, 60);
    expect(odd.count).toBe(0);
    expect(odd.lost).toBeGreaterThan(5);
    // „nein“ zeigt nach rechts von der Laufrichtung (hier: nach unten)
    expect(odd.lostAt.every(([x, y]) => x === 3 && y === 1)).toBe(true);
  });

  it('Weiche sortiert gemischte Zahlen: Primzahlen geradeaus, der Rest zur Seite in eine zweite Spur', () => {
    // Zwei Quellen (2 und 4) speisen dasselbe Band; nur die 2 ist prim
    const w: OpenWorld = {
      id: 't2', cols: 9, rows: 6, tools: [], walls: [],
      base: { x: 6, y: 0, w: 3, h: 3 },
      spawners: [
        { x: 0, y: 1, dir: 0, value: 2 },
        { x: 0, y: 3, dir: 0, value: 4 },
      ],
    };
    const grid = g([
      [1, 3, belt(0)], [2, 3, belt(3)], [2, 2, belt(3)],
      [1, 1, belt(0)], [2, 1, belt(0)],
      [3, 1, { op: null, dir: 0, sort: { kind: 'prime' }, side: 1 }], [4, 1, belt(0)], [5, 1, belt(0)],
      // „nein“ nach unten, dann nach rechts in die Basis (unten)
      [3, 2, belt(0)], [4, 2, belt(0)], [5, 2, belt(0)],
    ]);
    let s = worldStart();
    const delivered: [number, number][] = [];
    for (let i = 0; i < 150; i++) {
      s = worldStep(w, grid, s);
      for (const v of s.delivered) delivered.push([v, i]);
    }
    expect(delivered.filter(([v]) => v === 2).length).toBeGreaterThan(5);
    expect(delivered.filter(([v]) => v === 4).length).toBeGreaterThan(5);
    expect(s.lost).toBe(0);
  });

  it('voller Kreis aus vier Feldern dreht sich weiter; zwei Gegenüber blockieren sich', () => {
    const w: OpenWorld = { ...tiny, spawners: [] };
    const loop = g([[1, 0, belt(0)], [2, 0, belt(1)], [2, 1, belt(2)], [1, 1, belt(3)]]);
    let s: ReturnType<typeof worldStart> = { ...worldStart(), nextId: 5, items: [
      { id: 1, x: 1, y: 0, value: 1 }, { id: 2, x: 2, y: 0, value: 2 }, { id: 3, x: 2, y: 1, value: 3 }, { id: 4, x: 1, y: 1, value: 4 },
    ] };
    s = worldStep(w, loop, s);
    expect(s.items.find((i) => i.id === 1)).toMatchObject({ x: 2, y: 0 });
    expect(s.items.find((i) => i.id === 4)).toMatchObject({ x: 1, y: 0 });
    const face = g([[1, 1, belt(0)], [2, 1, belt(2)]]);
    let t: ReturnType<typeof worldStart> = { ...worldStart(), nextId: 3, items: [{ id: 1, x: 1, y: 1, value: 1 }, { id: 2, x: 2, y: 1, value: 2 }] };
    t = worldStep(w, face, t);
    expect(t.items.map((i) => [i.x, i.y])).toEqual([[1, 1], [2, 1]]);
  });

  it('wartende Zahl in einem abgebauten Zusammenführer fällt herunter statt ewig zu warten', () => {
    const w: OpenWorld = { ...tiny, spawners: [] };
    let s: ReturnType<typeof worldStart> = { ...worldStart(), nextId: 2, items: [{ id: 1, x: 2, y: 1, value: 5, wait: true }] };
    s = worldStep(w, new Map(), s);
    expect(s.items).toHaveLength(0);
    expect(s.lost).toBe(1);
  });
});
