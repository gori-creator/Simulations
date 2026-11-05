import { describe, expect, it } from 'vitest';
import { allOps, clampNum, KIT, kitItem, opAllowed, specFor, testAllowed } from '../src/spiele/zahlenfabrik/kit';
import { ALL_LEVELS, CHAPTERS, chapterOf, kitFor, newIn, PARTS, type LevelInfo } from '../src/spiele/zahlenfabrik/levels';
import { accepts, apply, emitCount, isFixed, key, opLabel, run, shortestPath, sourceValue, targetsOf, totalNeed, withFixed, type Dir, type Grid, type Op, type Part, type Test } from '../src/spiele/zahlenfabrik/model';
import { ascii, bestSort, lay, own, straight } from './zahlenfabrik-loeser';

const level = (id: string) => ALL_LEVELS.find((l) => l.id === id)!;
const op = (sym: Op['sym'], n = 2): Op => ({ sym, n });
const even: Test = { kind: 'even' };
const prime: Test = { kind: 'prime' };
const div = (n: number): Test => ({ kind: 'div', n });
const gt = (n: number): Test => ({ kind: 'gt', n });

/** Musterlösung je Level. */
type Solution =
  | { kind: 'chain'; ops: Op[] }
  | { kind: 'pick'; answer: number }
  | { kind: 'sort'; test: Test; ops?: Op[]; yes?: Op[]; no?: Op[] }
  | { kind: 'three'; first: Test; second: Test; ops?: Op[] }
  | { kind: 'grid'; grid: Grid };

const chain = (...ops: Op[]): Solution => ({ kind: 'chain', ops });
const pick = (answer: number): Solution => ({ kind: 'pick', answer });
const sort = (test: Test, ops: Op[] = [], yes: Op[] = [], no: Op[] = []): Solution => ({ kind: 'sort', test, ops, yes, no });
const three = (first: Test, second: Test, ops: Op[] = []): Solution => ({ kind: 'three', first, second, ops });
const drawn = (rows: string[], legend: Record<string, Part> = {}): Solution => ({ kind: 'grid', grid: ascii(rows, legend) });
const m = (o: Op, dir: Dir): Part => ({ op: o, dir });
const split = (dir: Dir, side: 1 | 3): Part => ({ op: null, dir, split: true, side });
const sorter = (test: Test, dir: Dir, side: 1 | 3): Part => ({ op: null, dir, sort: test, side });
const merger = (mode: '+' | '×'): Part => ({ op: null, dir: 0, merge: mode });
const sqTest: Test = { kind: 'square' };

/** Verteiler-Karte: Kopie nach oben (Lager oben), weiter nach rechts und unten. */
const SPLIT2 = ['............', '..>>>>>>>>..', '..^.........', '..a.........', '..Sb........', '...v........', '...v........', '...>>>>>>>..'];
const SPLIT3 = ['............', '..>>>>>>>>..', '..^.........', '..a.........', '..STm>>>>>..', '...n........', '...v........', '...>>>>>>>..'];
/** Zusammenführer-Karte: Kopie oben herum, unten geradeaus, Zusammenführer bei (7, 3). */
const MERGE = (up = '>>>>', straight = '>>>', after = '>>>') => ['.............', '.............', `...${up}v.....`, `..>S${straight}M${after}..`];
/** Brücken-Karte: Weiche/Verteiler fest bei (4, 4), Brücke bei (7, 3). */
const CROSS = (top = '>>', side = '>>>') => ['............', '.......>>>>.', '.......^....', `....${side}B>v..`, `..>>.${top}^.v..`, '.........v..', '.........v..', '.........>>.'];
const bridge: Part = { op: null, dir: 0, bridge: true };
const alt = (dir: Dir, side: 1 | 3): Part => ({ op: null, dir, alt: true, side });

const SOLUTIONS: Record<string, Solution> = {
  'c1-1': chain(),
  'c1-2': chain(),
  'c1-3': chain(),
  'c2-1': chain(op('+', 2)),
  'c2-2': chain(op('+', 7)),
  'c2-3': chain(op('+', 9), op('+', 9)),
  'c2-4': chain(op('+', 10), op('+', 10), op('+', 10)),
  'c3-1': chain(op('−', 5)),
  'c3-2': chain(op('−', 7)),
  'c3-3': chain(op('−', 10), op('−', 5)),
  'c3-4': chain(op('+', 10), op('+', 7)),
  'c4-1': chain(op('×', 3)),
  'c4-2': chain(op('+', 2), op('×', 10)),
  'c4-3': chain(op('×', 10), op('×', 10)),
  'c4-4': chain(op('×', 7), op('+', 1)),
  'c4-5': chain(op('+', 7), op('×', 9)),
  'c5-1': chain(op('÷', 4)),
  'c5-2': chain(op('÷', 2)),
  'c5-3': chain(op('÷', 9), op('÷', 4)),
  'c5-4': chain(op('÷', 10), op('−', 7)),
  'c5-5': chain(op('÷', 7), op('÷', 5), op('÷', 6)),
  'c6-1': pick(5),
  'c6-2': pick(8),
  'c6-3': pick(12),
  'c6-4': pick(9),
  'c6-5': pick(90),
  'c6-6': pick(13),
  'c6-7': pick(14),
  'c7-1': sort(even),
  'c7-2': sort(even, [], [op('×', 2)]),
  'c7-3': sort(even, [], [op('×', 10)], [op('+', 10)]),
  'c8-1': sort(div(3)),
  'c8-2': sort(div(4), [op('+', 1)]),
  'c8-3': three(div(3), even),
  'c8-4': three(div(5), even),
  'c9-1': sort(gt(10)),
  'c9-2': sort(gt(10), [op('×', 3)]),
  'c9-3': three(gt(5), gt(2)),
  'c10-1': sort(prime),
  'c10-2': sort(prime),
  'c10-3': sort(prime, [op('×', 2), op('+', 1)]),
  'c10-4': sort(even, [], [op('÷', 2)]),
  'c10-5': sort(prime, [op('+', 2)]),
  'c10-6': three(prime, even),
  'c11-1': chain(op('+', 3)),
  'c11-2': chain(op('×', 2)),
  'c11-3': chain(op('×', 3), op('+', 1)),
  'c11-4': chain(op('+', 1), op('×', 2)),
  'c11-5': chain(op('×', 5), op('−', 2)),
  'c11-6': chain(op('+', 1), op('×', 4)),
  'c11-7': chain(op('+', 2), op('×', 3), op('−', 1)),
  'c11-8': chain(op('−', 3), op('×', 4)),
  'c12-1': chain(op('²')),
  'c12-2': chain(op('²'), op('+', 1)),
  'c12-3': chain(op('+', 1), op('²')),
  'c12-4': chain(op('²'), op('×', 2)),
  'c12-5': chain(op('×', 3), op('−', 1)),
  'c12-6': chain(op('²'), op('−', 4)),
  'c12-7': chain(op('×', 2), op('²')),
  'c12-8': chain(op('−', 1), op('²'), op('−', 1)),
  'c14-1': chain(op('%', 5)),
  'c14-2': chain(op('%', 3)),
  'c14-3': sort(even, [op('%', 2)]),
  'c14-4': chain(op('%', 7)),
  'c14-5': chain(op('%', 6), op('×', 9)),
  'c15-1': chain(op('Σ')),
  'c15-2': sort(div(3), [op('Σ')]),
  'c15-3': chain(op('Σ'), op('Σ')),
  'c15-4': chain(op('Σ'), op('×', 6)),
  'c16-1': chain(op('√')),
  'c16-2': chain(op('√')),
  'c16-3': chain(op('√'), op('×', 7)),
  'c16-4': pick(49),
  'c17-1': sort(sqTest),
  'c17-2': sort(sqTest, [op('+', 1)]),
  'c17-3': three(sqTest, prime),
  'c18-1': drawn(SPLIT2.map((r) => r.replace('a', '^').replace('b', 'v')), { S: split(3, 1) }),
  'c18-2': drawn(SPLIT2, { S: split(3, 1), a: m(op('²'), 3), b: m(op('+', 10), 1) }),
  'c18-3': drawn(SPLIT3.map((r) => r.replace('a', '^')), { S: split(3, 1), T: split(0, 1), m: m(op('×', 2), 0), n: m(op('×', 3), 1) }),
  'c18-4': drawn(SPLIT3.map((r) => r.replace('Tm', 'W>').replace('n', 'v')), { S: split(3, 1), W: sorter(even, 0, 1), a: m(op('×', 2), 3) }),
  'c19-1': drawn(MERGE(), { S: split(0, 3), M: merger('+') }),
  'c19-2': drawn(MERGE(), { S: split(0, 3), M: merger('×') }),
  'c19-3': drawn(MERGE('a>>>'), { S: split(0, 3), M: merger('+'), a: m(op('²'), 0) }),
  'c19-4': drawn(MERGE('a>>>'), { S: split(0, 3), M: merger('×'), a: m(op('²'), 0) }),
  'c19-5': drawn(MERGE('a>>>', 'b>>'), { S: split(0, 3), M: merger('×'), a: m(op('+', 1), 0), b: m(op('−', 1), 0) }),
  'c19-6': drawn(MERGE('a>>>'), { S: split(0, 3), M: merger('×'), a: m(op('+', 2), 0) }),
  'c19-7': drawn(MERGE('ab>>'), { S: split(0, 3), M: merger('×'), a: m(op('²'), 0), b: m(op('−', 1), 0) }),
  'c19-8': drawn(MERGE('a>>>', 'bc>'), { S: split(0, 3), M: merger('+'), a: m(op('²'), 0), b: m(op('+', 1), 0), c: m(op('²'), 0) }),
  'c20-1': drawn(CROSS(), { B: bridge }),
  'c20-2': drawn(CROSS('a>', 'b>>'), { B: bridge, a: m(op('²'), 0), b: m(op('+', 5), 0) }),
  'c20-3': drawn(CROSS('ab', 'cd>'), { B: bridge, a: m(op('+', 1), 0), b: m(op('²'), 0), c: m(op('×', 3), 0), d: m(op('−', 1), 0) }),
  'c21-1': chain(op('²'), op('−', 6)),
  'c21-2': chain(op('+', 4), op('²')),
  'c21-3': chain(op('+', 3), op('×', 4)),
  'c21-4': chain(op('×', 10), op('+', 2)),
  'c21-5': chain(op('²'), op('×', 3), op('−', 5)),
  'c21-6': chain(op('+', 4), op('²'), op('+', 2)),
  'c21-7': chain(op('×', 9), op('²'), op('+', 5)),
  'c21-8': chain(op('×', 3), op('−', 5), op('²')),
  'c21-9': chain(op('×', 9), op('×', 9), op('−', 3)),
  'c21-10': chain(op('−', 6), op('²'), op('+', 6)),
  'c22-1': chain(op('×', 4), op('+', 9)),
  'c22-2': chain(op('−', 1), op('²'), op('+', 2)),
  'c22-3': chain(op('+', 4), op('²'), op('+', 3)),
  'c22-4': chain(op('²'), op('×', 10), op('−', 5)),
  'c22-5': chain(op('²'), op('+', 10), op('×', 5)),
  'c22-6': chain(op('×', 4), op('+', 10), op('²')),
  'c22-7': chain(op('%', 5), op('+', 7), op('×', 2)),
  'c22-8': chain(op('×', 6), op('%', 10), op('−', 6)),
  'c22-9': chain(op('×', 4), op('−', 9), op('Σ')),
  'c23-1': chain(op('±')),
  'c23-2': chain(op('|')),
  'c23-3': chain(op('−', 10), op('|')),
  'c23-4': chain(op('²'), op('±')),
  'c24-1': chain(op('⇄')),
  'c24-2': drawn(MERGE('a>>>'), { S: split(0, 3), M: merger('+'), a: m(op('⇄'), 0) }),
  'c24-3': chain(op('⇄'), op('²')),
  'c25-1': chain(op('≈', 1)),
  'c25-2': chain(op('≈', 2)),
  'c25-3': chain(op('≈', 1), op('×', 2)),
  'c25-4': chain(op('+', 8), op('×', 6), op('≈', 1)),
  'c26-1': drawn(SPLIT2.map((r) => r.replace('a', '^').replace('b', 'v')), { S: alt(3, 1) }),
  'c26-2': drawn(SPLIT2, { S: alt(3, 1), a: m(op('×', 10), 3), b: m(op('+', 10), 1) }),
  'c26-3': drawn(MERGE(), { S: alt(0, 3), M: merger('×') }),
  'c27-1': chain(op('⇄'), op('²'), op('+', 2)),
  'c27-2': chain(op('+', 10), op('²'), op('±')),
  'c27-3': chain(op('²'), op('≈', 2), op('+', 6)),
  'c27-4': chain(op('×', 8), op('+', 1), op('⇄')),
  'c27-5': chain(op('−', 6), op('²'), op('≈', 1)),
  'c27-6': chain(op('×', 8), op('+', 10), op('|')),
  'c27-7': drawn(MERGE(), { S: alt(0, 3), M: merger('+') }),
  'c27-8': drawn(MERGE('>>>>', '>>>', 'a>>'), { S: alt(0, 3), M: merger('×'), a: m(op('−', 1), 0) }),
  'c27-9': chain(op('×', 4), op('+', 7), op('⇄')),
  'c27-10': chain(op('²'), op('≈', 3), op('+', 4)),
  'c13-1': pick(7),
  'c13-2': chain(op('×', 5), op('×', 10), op('×', 10)),
  'c13-3': chain(op('²'), op('×', 2), op('−', 3)),
  'c13-4': pick(7),
  'c13-5': chain(op('×', 5), op('²'), op('+', 6)),
  'c13-6': three(gt(50), even, [op('²')]),
};

/** Drei Lager mit zwei Weichen: feste Musterlösung (16 Teile), Maschinen auf die ersten Bänder. */
function threeGrid(l: LevelInfo, first: Test, second: Test, ops: Op[]): Grid {
  const g: Grid = new Map();
  lay(l, g, [[2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4]], [9, 4], ops);
  g.set(key(9, 4), { op: null, dir: 3, sort: first, side: 1 });
  lay(l, g, [[9, 3], [9, 2], [9, 1], [10, 1]], [11, 1]);
  g.set(key(10, 4), { op: null, dir: 0, sort: second, side: 1 });
  lay(l, g, [[10, 5], [10, 6], [10, 7]], [11, 7]);
  return g;
}

/** Fabrik zur Musterlösung bauen. */
function build(l: LevelInfo, s: Solution): Grid {
  if (s.kind === 'chain') return straight(l, s.ops);
  if (s.kind === 'pick') return straight(l);
  if (s.kind === 'sort') return bestSort(l, s.test, s.ops, s.yes, s.no)!;
  if (s.kind === 'grid') return s.grid;
  return threeGrid(l, s.first, s.second, s.ops ?? []);
}

/** Eigene Teile einer gebauten Fabrik (ohne vorgegebene). */
const ownParts = (l: LevelInfo, g: Grid): Part[] => [...g].filter(([k]) => !isFixed(l, ...(k.split(',').map(Number) as [number, number]))).map(([, p]) => p);

describe('Zahlenfabrik: Kapitel und Werkzeugkasten', () => {
  it('27 Kapitel, über 140 Level; jedes Bauteil wird genau einmal eingeführt; Kennungen eindeutig; Abschnitte vollständig', () => {
    expect(CHAPTERS).toHaveLength(27);
    expect(ALL_LEVELS.length).toBeGreaterThanOrEqual(140);
    expect(PARTS.flatMap((p) => p.chapters)).toEqual(CHAPTERS.map((c) => c.id));
    const taught = CHAPTERS.flatMap((c) => c.teaches);
    expect(new Set(taught).size).toBe(taught.length);
    for (const k of KIT) expect(taught).toContain(k.id);
    expect(new Set(ALL_LEVELS.map((l) => l.id)).size).toBe(ALL_LEVELS.length);
    for (const c of CHAPTERS) expect(c.levels.length).toBeGreaterThanOrEqual(3);
  });
  it('der Werkzeugkasten wächst: was einmal da ist, bleibt', () => {
    let before: string[] = [];
    for (const c of CHAPTERS) {
      const now = kitFor(c.levels[0]!).map((k) => k.id);
      for (const id of before) expect(now).toContain(id);
      for (const k of newIn(c)) expect(now).toContain(k.id);
      before = now;
    }
    expect(kitFor(ALL_LEVELS[0]!)).toEqual([]);
    expect(kitFor(ALL_LEVELS[ALL_LEVELS.length - 1]!)).toHaveLength(KIT.length);
  });
  it('einstellbare Zahlen: Bereich und Bauteile', () => {
    expect(clampNum(kitItem('plus'), 15)).toBe(10);
    expect(clampNum(kitItem('times'), 1)).toBe(2);
    expect(clampNum(kitItem('gt'), 2.4)).toBe(2);
    expect(specFor(kitItem('plus'), 3)).toMatchObject({ id: '+3', kind: 'op', op: { sym: '+', n: 3 } });
    expect(specFor(kitItem('square'), 7)).toMatchObject({ id: 'x²', op: { sym: '²', n: 2 } });
    expect(specFor(kitItem('div'), 4)).toMatchObject({ id: 'div4', kind: 'sort', test: { kind: 'div', n: 4 } });
    expect(specFor(kitItem('gt'), 50)).toMatchObject({ id: 'gt50', test: { kind: 'gt', n: 50 } });
    expect(opAllowed(kitItem('plus'), op('+', 11))).toBe(false);
    expect(testAllowed(kitItem('div'), div(11))).toBe(false);
    expect(allOps([kitItem('plus'), kitItem('square')])).toHaveLength(11);
  });
  it('jedes Level hat eine Musterlösung', () => {
    for (const l of ALL_LEVELS) expect(SOLUTIONS[l.id], l.id).toBeDefined();
  });
});

describe('Zahlenfabrik: alle Level lösbar mit dem eigenen Werkzeugkasten', () => {
  for (const l of ALL_LEVELS) {
    const s = SOLUTIONS[l.id];
    if (!s) continue;
    it(`${l.id}: Karte stimmig, Lösung nur mit erlaubten Teilen, Teile-Ziel = kleinste Fabrik`, () => {
      // Karte
      const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < l.cols && y < l.rows;
      expect(inside(l.source.x, l.source.y)).toBe(true);
      for (const t of targetsOf(l)) {
        expect(inside(t.x, t.y)).toBe(true);
        expect(l.walls.some(([x, y]) => x === t.x && y === t.y)).toBe(false);
      }
      for (const f of l.fixed ?? []) expect(l.walls.some(([x, y]) => x === f.x && y === f.y)).toBe(false);
      expect(totalNeed(l)).toBeGreaterThan(0);
      expect(l.title.de.length * l.title.en.length * l.hint.de.length * l.hint.en.length).toBeGreaterThan(0);
      // Lösung bauen
      const g = build(l, s);
      expect(g).not.toBeNull();
      // Nur Teile aus dem Werkzeugkasten dieses Kapitels, mit erlaubten Zahlen
      const kit = kitFor(l);
      const has = (id: string) => kit.some((k) => k.id === id);
      const parts = ownParts(l, g);
      for (const p of parts) {
        if (p.op) expect(kit.some((k) => opAllowed(k, p.op!)), `${l.id}: ${p.op.sym}${p.op.n}`).toBe(true);
        if (p.sort) expect(kit.some((k) => testAllowed(k, p.sort!)), `${l.id}: ${p.sort.kind}`).toBe(true);
        if (p.split) expect(has('split'), `${l.id}: Verteiler`).toBe(true);
      if (p.alt) expect(has('alt'), `${l.id}: Wechsel-Weiche`).toBe(true);
        if (p.merge) expect(has(p.merge === '+' ? 'sum' : 'product'), `${l.id}: Zusammenführer`).toBe(true);
        if (p.bridge) expect(has('bridge'), `${l.id}: Brücke`).toBe(true);
      }
      if (l.maxMachines !== undefined) expect(parts.filter((p) => p.op).length).toBeLessThanOrEqual(l.maxMachines);
      // Startzahl-Level: nur Bänder
      if (l.source.pick) expect(l.maxMachines).toBe(0);
      const r = run(l, withFixed(l, g), s.kind === 'pick' ? s.answer : undefined);
      expect(r.error).toBeNull();
      expect(r.won).toBe(true);
      targetsOf(l).forEach((t, i) => expect(r.got[i]).toBe(t.need));
      expect(own(l, g)).toBe(l.par);
    });
  }
});

describe('Zahlenfabrik: Rückwärts – genau eine Startzahl passt', () => {
  for (const l of ALL_LEVELS.filter((x) => x.source.pick)) {
    it(`${l.id}`, () => {
      const s = SOLUTIONS[l.id] as { kind: 'pick'; answer: number };
      const g = straight(l);
      const path = shortestPath(l)!;
      for (const f of l.fixed!) expect(path.some(([x, y]) => x === f.x && y === f.y)).toBe(true);
      const fits = [];
      for (let v = l.source.pick!.min; v <= l.source.pick!.max; v++) if (run(l, withFixed(l, g), v).won) fits.push(v);
      expect(fits).toEqual([s.answer]);
    });
  }
});

/** Alle Ketten aus höchstens `max` Maschinen des Werkzeugkastens, die das Level lösen (nur Rechnen, ohne Karte). */
function chains(l: LevelInfo, max: number): string[] {
  const ops = allOps(kitFor(l));
  const xs = Array.from({ length: totalNeed(l) }, (_, i) => sourceValue(l, i));
  const t = targetsOf(l)[0]!;
  const out: string[] = [];
  const walk = (vals: (number | null)[], used: Op[]) => {
    if (vals.every((v, i) => v !== null && accepts(t, v, i))) out.push(used.map(opLabel).join(' '));
    if (used.length === max) return;
    for (const o of ops) {
      const next = vals.map((v) => (v === null ? null : apply(o, v)));
      if (next.some((v) => v === null || Math.abs(v) > 1e6)) continue;
      walk(next, [...used, o]);
    }
  };
  walk(xs, []);
  return out;
}

describe('Zahlenfabrik: Rätsel mit wenigen Maschinen', () => {
  it('c4-5: aus 4 wird 99 mit zwei Maschinen – nur ein Weg', () => {
    expect(chains(level('c4-5'), 2)).toEqual(['+7 ×9']);
  });
  it('c5-4: aus 100 wird 3 mit zwei Maschinen – nur ein Weg', () => {
    expect(chains(level('c5-4'), 2)).toEqual(['÷10 −7']);
  });
  it('c4-4 und c5-3: mehrere Wege', () => {
    expect(chains(level('c4-4'), 2).length).toBeGreaterThanOrEqual(2);
    expect(chains(level('c5-3'), 2).length).toBeGreaterThanOrEqual(3);
  });
  it('c2-3: mit einer Maschine geht es nicht (höchstens +10)', () => {
    expect(chains(level('c2-3'), 1)).toEqual([]);
  });
  it('Level mit Maschinen-Grenze sind mit dieser Grenze lösbar, mit einer weniger nicht', () => {
    for (const l of ALL_LEVELS.filter((x) => x.maxMachines && !x.targets && !x.fixed)) {
      expect(chains(l, l.maxMachines!).length, l.id).toBeGreaterThan(0);
      expect(chains(l, l.maxMachines! - 1), l.id).toEqual([]);
    }
  });
  it('Wertetabellen mit mehreren Wegen (z. B. 2 · (x + 1) = 2x + 2)', () => {
    expect(chains(level('c11-4'), 2)).toEqual(expect.arrayContaining(['+1 ×2', '×2 +2']));
    expect(chains(level('c12-7'), 2)).toEqual(expect.arrayContaining(['×2 x²', 'x² ×4']));
  });
  it('Rätsel-Werkstatt und Funktionen-Detektiv: mit der Grenze genau ein Weg, mit einer Maschine weniger keiner', () => {
    const graded = CHAPTERS.find((c) => c.id === 'c27')!.levels.filter((l) => SOLUTIONS[l.id]!.kind === 'chain');
    for (const l of [...CHAPTERS.find((c) => c.id === 'c21')!.levels, ...CHAPTERS.find((c) => c.id === 'c22')!.levels, ...graded, level('c25-4')]) {
      const s = SOLUTIONS[l.id] as { kind: 'chain'; ops: Op[] };
      const name = s.ops.map(opLabel).join(' ');
      expect(chains(l, l.maxMachines!), l.id).toEqual([name]);
      expect(chains(l, l.maxMachines! - 1), l.id).toEqual([]);
    }
  });
  it('neue Bausteine: eindeutige Rätsel (mod, Quersumme, Wurzel)', () => {
    expect(chains(level('c14-4'), 1)).toEqual(['mod 7']);
    expect(chains(level('c14-5'), 2)).toEqual(['mod 6 ×9']);
    expect(chains(level('c15-4'), 2)).toEqual(['QS ×6']);
    expect(chains(level('c16-3'), 2)).toEqual(['√x ×7']);
    expect(chains(level('c13-5'), 3)).toEqual(['×5 x² +6']);
  });
  it('Zusammenführer: x · (x + 2) geht mit einer Maschine, ohne Zusammenführer nicht', () => {
    const l = level('c19-6');
    expect(chains(l, 1)).toEqual([]);
    expect(run(l, (SOLUTIONS['c19-6'] as { grid: Grid }).grid).won).toBe(true);
  });
  it('Verteiler und Zusammenführer: Quelle gibt so viele Zahlen aus, wie gebraucht werden', () => {
    expect(emitCount(level('c18-1'))).toBe(4);
    expect(emitCount(level('c19-1'))).toBe(5);
    expect(emitCount(level('c2-1'))).toBe(3);
  });
  it('neue Maschinen rechnen richtig', () => {
    expect(apply(op('±'), 5)).toBe(-5);
    expect(apply(op('±'), 0)).toBe(0);
    expect(apply(op('|'), -7)).toBe(7);
    expect(apply(op('⇄'), 120)).toBe(21);
    expect(apply(op('⇄'), -123)).toBe(-321);
    expect(apply(op('≈', 1), 45)).toBe(50);
    expect(apply(op('≈', 1), 44)).toBe(40);
    expect(apply(op('≈', 2), 150)).toBe(200);
    expect(apply(op('≈', 1), -45)).toBe(-50);
    expect(apply(op('≈', 3), 400)).toBe(0);
  });
  it('Wechsel-Weiche: ohne sie geht 5, 5, 8, 8, 3, 3 nicht auf zwei Lager (Verteiler liefert doppelt)', () => {
    const l = level('c26-1');
    const g = new Map((SOLUTIONS['c26-1'] as { grid: Grid }).grid);
    g.set(key(2, 4), { op: null, dir: 3, split: true, side: 1 });
    expect(run(l, g).won).toBe(false);
  });
  it('Brücke: ohne Brücke kreuzen sich die Wege nicht (Band statt Brücke scheitert)', () => {
    const l = level('c20-1');
    const g = new Map((SOLUTIONS['c20-1'] as { grid: Grid }).grid);
    g.set(key(7, 3), { op: null, dir: 3 });
    expect(run(l, withFixed(l, g)).won).toBe(false);
  });
  it('vorgegebene Teile zählen nicht zum Teile-Ziel', () => {
    expect(isFixed(level('c6-1'), 5, 3)).toBe(true);
  });
  it('jedes Level gehört zu genau einem Kapitel', () => {
    for (const l of ALL_LEVELS) expect(chapterOf(l).levels).toContain(l);
  });
});
