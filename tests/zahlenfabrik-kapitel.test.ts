import { describe, expect, it } from 'vitest';
import { allOps, clampNum, KIT, kitItem, opAllowed, specFor, testAllowed } from '../src/spiele/zahlenfabrik/kit';
import { ALL_LEVELS, CHAPTERS, chapterOf, kitFor, newIn, type LevelInfo } from '../src/spiele/zahlenfabrik/levels';
import { accepts, apply, isFixed, key, run, shortestPath, sourceValue, targetsOf, totalNeed, withFixed, type Grid, type Op, type Test } from '../src/spiele/zahlenfabrik/model';
import { bestSort, lay, own, straight } from './zahlenfabrik-loeser';

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
  | { kind: 'three'; first: Test; second: Test; ops?: Op[] };

const chain = (...ops: Op[]): Solution => ({ kind: 'chain', ops });
const pick = (answer: number): Solution => ({ kind: 'pick', answer });
const sort = (test: Test, ops: Op[] = [], yes: Op[] = [], no: Op[] = []): Solution => ({ kind: 'sort', test, ops, yes, no });
const three = (first: Test, second: Test, ops: Op[] = []): Solution => ({ kind: 'three', first, second, ops });

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
  'c13-1': pick(7),
  'c13-2': chain(op('×', 5), op('×', 10), op('×', 10)),
  'c13-3': chain(op('²'), op('×', 2), op('−', 3)),
  'c13-4': pick(7),
  'c13-5': chain(op('÷', 10), op('÷', 9), op('÷', 4)),
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
  return threeGrid(l, s.first, s.second, s.ops ?? []);
}

const opsOf = (s: Solution): Op[] => (s.kind === 'chain' ? s.ops : s.kind === 'sort' ? [...(s.ops ?? []), ...(s.yes ?? []), ...(s.no ?? [])] : s.kind === 'three' ? (s.ops ?? []) : []);
const testsOf = (s: Solution): Test[] => (s.kind === 'sort' ? [s.test] : s.kind === 'three' ? [s.first, s.second] : []);

describe('Zahlenfabrik: Kapitel und Werkzeugkasten', () => {
  it('13 Kapitel; jedes Bauteil wird genau einmal eingeführt; Kennungen eindeutig', () => {
    expect(CHAPTERS).toHaveLength(13);
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
    expect(specFor(kitItem('square'), 7)).toMatchObject({ id: '²2', op: { sym: '²', n: 2 } });
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
      // Nur Teile aus dem Werkzeugkasten dieses Kapitels, mit erlaubten Zahlen
      const kit = kitFor(l);
      for (const o of opsOf(s)) expect(kit.some((k) => opAllowed(k, o)), `${l.id}: ${o.sym}${o.n}`).toBe(true);
      for (const t of testsOf(s)) expect(kit.some((k) => testAllowed(k, t)), `${l.id}: ${t.kind}`).toBe(true);
      if (l.maxMachines !== undefined) expect(opsOf(s).length).toBeLessThanOrEqual(l.maxMachines);
      // Startzahl-Level: nur Bänder
      if (l.source.pick) expect(l.maxMachines).toBe(0);
      // Lösung läuft durch
      const g = build(l, s);
      expect(g).not.toBeNull();
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
    if (vals.every((v, i) => v !== null && accepts(t, v, i))) out.push(used.map((o) => (o.sym === '²' ? 'x²' : `${o.sym}${o.n}`)).join(' '));
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
  it('vorgegebene Teile zählen nicht zum Teile-Ziel', () => {
    expect(isFixed(level('c6-1'), 5, 3)).toBe(true);
  });
  it('jedes Level gehört zu genau einem Kapitel', () => {
    for (const l of ALL_LEVELS) expect(chapterOf(l).levels).toContain(l);
  });
});
