import { describe, expect, it } from 'vitest';
import { key, type Grid, type Part } from '../src/spiele/zahlenfabrik/model';
import { canBuildWorld, inBase, inRect, makeWorld, MAX_ITEMS, MAX_VALUE, spawnerAt, START_OFFSET, worldStart, worldStep, type OpenWorld } from '../src/spiele/zahlenfabrik/world';

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
  it('die Welt: Startgebiet wie früher (20 Quellen), dazu zwei Ringe; Basis frei, alles innerhalb der Karte', () => {
    const w = makeWorld();
    expect(makeWorld()).toEqual(w);
    const [start, middle, all] = w.zones!;
    expect(all).toEqual({ x: 0, y: 0, w: w.cols, h: w.rows });
    // Startgebiet unverändert (alte Spielstände): bekannte Quellen an den alten Stellen, verschoben
    const [ox, oy] = START_OFFSET;
    expect(w.spawners.filter((s) => inRect(start!, s.x, s.y))).toHaveLength(20);
    expect(spawnerAt(w, 27 + ox, 9 + oy)).toMatchObject({ dir: 1, value: 2 });
    expect(spawnerAt(w, 26 + ox, 26 + oy)).toMatchObject({ dir: 3, value: 5 });
    expect(w.base).toEqual({ x: 24 + ox, y: 15 + oy, w: 3, h: 3 });
    for (const s of w.spawners) {
      expect(inBase(w, s.x, s.y)).toBe(false);
      expect(s.value).toBeGreaterThanOrEqual(1);
      // Vor jeder Quelle kann man bauen, sobald ihr Gebiet offen ist
      const zone = w.zones!.findIndex((z) => inRect(z, s.x, s.y));
      expect(canBuildWorld(w, s.x + [1, 0, -1, 0][s.dir]!, s.y + [0, 1, 0, -1][s.dir]!, zone)).toBe(true);
    }
    for (const [x, y] of w.walls) expect(inBase(w, x, y)).toBe(false);
    expect(canBuildWorld(w, w.base.x, w.base.y)).toBe(false);
    // weiter draußen größere Zahlen
    const avg = (r: (s: { x: number; y: number }) => boolean) => {
      const v = w.spawners.filter(r).map((s) => s.value);
      return v.reduce((a, b) => a + b, 0) / v.length;
    };
    const inStart = avg((s) => inRect(start!, s.x, s.y));
    const inMiddle = avg((s) => inRect(middle!, s.x, s.y) && !inRect(start!, s.x, s.y));
    const outside = avg((s) => !inRect(middle!, s.x, s.y));
    expect(inMiddle).toBeGreaterThan(inStart);
    expect(outside).toBeGreaterThan(inMiddle);
    expect(w.spawners.length).toBeGreaterThanOrEqual(45);
  });
  it('gesperrtes Gebiet: dort kann man nicht bauen, und die Quellen geben nichts aus', () => {
    const w = makeWorld();
    const far = w.spawners.find((s) => !inRect(w.zones![1]!, s.x, s.y))!;
    const fx = far.x + [1, 0, -1, 0][far.dir]!;
    const fy = far.y + [0, 1, 0, -1][far.dir]!;
    expect(canBuildWorld(w, fx, fy, 0)).toBe(false);
    expect(canBuildWorld(w, fx, fy, 1)).toBe(false);
    expect(canBuildWorld(w, fx, fy, 2)).toBe(true);
    const grid: Grid = new Map([[key(fx, fy), { op: null, dir: far.dir }]]);
    let locked = worldStart();
    let open = worldStart();
    for (let i = 0; i < 6; i++) {
      locked = worldStep(w, grid, locked, 1);
      open = worldStep(w, grid, open, 2);
    }
    expect(locked.items.some((it) => it.x === far.x && it.y === far.y)).toBe(false);
    expect(open.lost + open.items.length).toBeGreaterThan(0);
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

describe('Zahlenfabrik: Brücke', () => {
  const belt = (dir: 0 | 1 | 2 | 3): Part => ({ op: null, dir });
  it('zwei Bänder kreuzen sich auf der Brücke, ohne sich zu stören', () => {
    // waagerecht: Quelle 2 → Brücke (3,2) → rechts nach unten in die Basis; senkrecht: Quelle 5 → über die Brücke → Basis
    const w: OpenWorld = {
      id: 'x', cols: 7, rows: 7, walls: [], tools: [],
      base: { x: 2, y: 5, w: 3, h: 2 },
      spawners: [
        { x: 0, y: 2, dir: 0, value: 2 },
        { x: 3, y: 0, dir: 1, value: 5 },
      ],
    };
    const grid: Grid = new Map([
      [key(1, 2), belt(0)], [key(2, 2), belt(0)], [key(3, 2), { op: null, dir: 0, bridge: true }], [key(4, 2), belt(1)], [key(4, 3), belt(1)], [key(4, 4), belt(1)],
      [key(3, 1), belt(1)], [key(3, 3), belt(1)], [key(3, 4), belt(1)],
    ]);
    let s = worldStart();
    const got: number[] = [];
    for (let i = 0; i < 90; i++) {
      s = worldStep(w, grid, s);
      got.push(...s.delivered);
      // auf der Brücke höchstens eine waagerechte und eine senkrechte Zahl
      const onBridge = s.items.filter((it) => it.x === 3 && it.y === 2);
      expect(onBridge.length).toBeLessThanOrEqual(2);
      if (onBridge.length === 2) expect(new Set(onBridge.map((it) => it.heading! % 2)).size).toBe(2);
    }
    expect(got.filter((v) => v === 2).length).toBeGreaterThan(10);
    expect(got.filter((v) => v === 5).length).toBeGreaterThan(10);
    expect(s.lost).toBe(0);
  });
});

describe('Zahlenfabrik: viele Zahlen', () => {
  it('voll ausgebaute Welt: höchstens MAX_ITEMS Zahlen, kein Feld doppelt, und schnell genug', () => {
    const w = makeWorld();
    // Die ganze Karte voller Bänder (Schlangenlinie), alle Quellen geben aus
    const z = w.zones![2]!;
    const grid: Grid = new Map();
    for (let x = z.x; x < z.x + z.w; x++) {
      for (let y = z.y; y < z.y + z.h; y++) {
        if (!canBuildWorld(w, x, y, 2)) continue;
        const dir = (y - z.y) % 2 === 0 ? (x === z.x + z.w - 1 ? 1 : 0) : x === z.x ? 1 : 2;
        grid.set(key(x, y), { op: null, dir });
      }
    }
    let s = worldStart();
    const t0 = performance.now();
    for (let i = 0; i < 300; i++) {
      s = worldStep(w, grid, s, 2);
      const cells = s.items.map((it) => key(it.x, it.y));
      expect(new Set(cells).size).toBe(cells.length);
      expect(s.items.length).toBeLessThanOrEqual(MAX_ITEMS);
    }
    const ms = (performance.now() - t0) / 300;
    expect(s.items.length).toBeGreaterThan(100);
    // grobe Grenze: ein Takt deutlich unter 20 ms (Spiel: alle 120–420 ms ein Takt)
    expect(ms).toBeLessThan(20);
  });
});

describe('Zahlenfabrik: Zusammenführer der offenen Welt', () => {
  it('Summe, Differenz (größere − kleinere), Produkt, Quotient (nur wenn glatt)', async () => {
    const { combine } = await import('../src/spiele/zahlenfabrik/model');
    expect(combine('+', 3, 4)).toBe(7);
    expect(combine('−', 3, 9)).toBe(6);
    expect(combine('−', 9, 3)).toBe(6);
    expect(combine('×', 6, 7)).toBe(42);
    expect(combine('÷', 4, 12)).toBe(3);
    expect(combine('÷', 12, 5)).toBeNull();
    expect(combine('÷', 0, 5)).toBeNull();
  });
});
