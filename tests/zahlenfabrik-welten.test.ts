import { describe, expect, it } from 'vitest';
import { ALL_LEVELS, WORLDS } from '../src/spiele/zahlenfabrik/levels';
import { accepts, apply, isFixed, key, run, shortestPath, sourceValue, targetsOf, totalNeed, withFixed, type Grid, type Level, type Op, type Test } from '../src/spiele/zahlenfabrik/model';
import { bestSort, lay, own, straight } from './zahlenfabrik-loeser';

const level = (id: string) => ALL_LEVELS.find((l) => l.id === id)!;
const op = (sym: Op['sym'], n: number): Op => ({ sym, n });
const win = (l: Level, g: Grid, pick?: number) => run(l, withFixed(l, g), pick);

describe('Zahlenfabrik: alle Welten', () => {
  it('sechs Welten mit je sechs Leveln, Kennungen eindeutig', () => {
    expect(WORLDS).toHaveLength(6);
    for (const w of WORLDS) expect(w.levels.length).toBeGreaterThanOrEqual(6);
    expect(new Set(ALL_LEVELS.map((l) => l.id)).size).toBe(ALL_LEVELS.length);
  });
  for (const l of ALL_LEVELS) {
    it(`${l.id}: Karte stimmig (Quelle, Lager, Felsen, vorgegebene Teile)`, () => {
      const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < l.cols && y < l.rows;
      expect(inside(l.source.x, l.source.y)).toBe(true);
      for (const t of targetsOf(l)) {
        expect(inside(t.x, t.y)).toBe(true);
        expect(l.walls.some(([x, y]) => x === t.x && y === t.y)).toBe(false);
      }
      expect(l.walls.some(([x, y]) => x === l.source.x && y === l.source.y)).toBe(false);
      for (const f of l.fixed ?? []) expect(l.walls.some(([x, y]) => x === f.x && y === f.y)).toBe(false);
      // Die Quelle gibt genug Zahlen für alle Lager aus
      if (l.source.values) expect(l.source.values.length).toBeGreaterThan(0);
      expect(totalNeed(l)).toBeGreaterThan(0);
      expect(l.title.de.length * l.title.en.length * l.hint.de.length * l.hint.en.length).toBeGreaterThan(0);
    });
  }
});

describe('Zahlenfabrik Welt 2: Rückwärts (Startzahl wählen)', () => {
  const cases: [string, number, number][] = [
    ['w2-1', 5, 9],
    ['w2-2', 8, 24],
    ['w2-3', 12, 30],
    ['w2-4', 9, 30],
    ['w2-5', 90, 50],
    ['w2-6', 13, 40],
  ];
  for (const [id, answer, out] of cases) {
    it(`${id}: Startzahl ${answer} ergibt ${out}; eine andere nicht; Teile-Ziel = kürzester Weg`, () => {
      const l = level(id);
      expect(l.source.pick!.min).toBeLessThanOrEqual(answer);
      expect(l.source.pick!.max).toBeGreaterThanOrEqual(answer);
      const g = straight(l);
      expect(own(l, g)).toBe(l.par);
      // die vorgegebenen Maschinen liegen auf dem kürzesten Weg
      const path = shortestPath(l)!;
      for (const f of l.fixed!) expect(path.some(([x, y]) => x === f.x && y === f.y)).toBe(true);
      expect(win(l, g, answer).won).toBe(true);
      const wrong = win(l, g, answer + 1);
      expect(wrong.won).toBe(false);
      expect(['wrong', 'divide']).toContain(wrong.error?.kind);
      // genau eine Startzahl im Bereich passt
      const fits = [];
      for (let v = l.source.pick!.min; v <= l.source.pick!.max; v++) if (win(l, g, v).won) fits.push(v);
      expect(fits).toEqual([answer]);
    });
  }
});

/** Sortier-Level: Musterlösung mit einer Weiche, Teile-Ziel = kleinste gefundene Fabrik. */
function sortCase(id: string, test: Test, ops: Op[] = []) {
  it(`${id}: lösbar mit ${ops.length ? 'Maschinen und ' : ''}einer Weiche; Teile-Ziel = kleinste Fabrik`, () => {
    const l = level(id);
    const g = bestSort(l, test, ops)!;
    expect(g).not.toBeNull();
    expect(g.size).toBe(l.par);
    const r = run(l, g);
    expect(r.error).toBeNull();
    expect(r.won).toBe(true);
    // jedes Lager bekommt genau seine Zahlen
    targetsOf(l).forEach((t, i) => expect(r.got[i]).toBe(t.need));
  });
}

describe('Zahlenfabrik Welt 3: Sortieren', () => {
  sortCase('w3-1', { kind: 'even' });
  sortCase('w3-2', { kind: 'div', n: 3 });
  sortCase('w3-3', { kind: 'div', n: 4 }, [op('+', 1)]);
  sortCase('w3-4', { kind: 'gt', n: 10 });
  sortCase('w3-6', { kind: 'gt', n: 10 }, [op('×', 3)]);
  it('w3-3: ohne Rechnen geht es nicht (1, 3, 5, 7 sind keine Vielfachen von 4)', () => {
    const l = level('w3-3');
    expect(run(l, bestSort(l, { kind: 'div', n: 4 })!).won).toBe(false);
  });
  it('w3-5: drei Lager mit zwei Weichen (erst ÷3?, dann gerade?), 16 Teile', () => {
    const l = level('w3-5');
    const g: Grid = new Map();
    lay(l, g, [[2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4]], [9, 4]);
    g.set(key(9, 4), { op: null, dir: 3, sort: { kind: 'div', n: 3 }, side: 1 });
    lay(l, g, [[9, 3], [9, 2], [9, 1], [10, 1]], [11, 1]);
    g.set(key(10, 4), { op: null, dir: 0, sort: { kind: 'even' }, side: 1 });
    lay(l, g, [[10, 5], [10, 6], [10, 7]], [11, 7]);
    expect(g.size).toBe(l.par);
    const r = run(l, g);
    expect(r.won).toBe(true);
    expect(r.got).toEqual([3, 3, 3]);
    // falsche Reihenfolge der Weichen: die 6 landet bei den geraden Zahlen, oben fehlt eine
    const swapped = new Map(g);
    swapped.set(key(9, 4), { op: null, dir: 3, sort: { kind: 'even' }, side: 1 });
    swapped.set(key(10, 4), { op: null, dir: 0, sort: { kind: 'div', n: 3 }, side: 1 });
    expect(run(l, swapped).won).toBe(false);
  });
});

describe('Zahlenfabrik Welt 4: Primzahlen', () => {
  sortCase('w4-1', { kind: 'prime' });
  sortCase('w4-4', { kind: 'prime' });
  sortCase('w4-5', { kind: 'prime' }, [op('×', 2), op('+', 1)]);
  const factor: [string, Op[]][] = [
    ['w4-2', [op('÷', 2), op('÷', 2), op('÷', 3)]],
    ['w4-3', [op('÷', 2), op('÷', 2), op('÷', 3), op('÷', 5)]],
    ['w4-6', [op('÷', 2), op('÷', 3), op('÷', 5), op('÷', 7)]],
  ];
  for (const [id, ops] of factor) {
    it(`${id}: zerlegen bis 1 mit ${ops.map((o) => o.sym + o.n).join(' ')}; Teile-Ziel = kürzester Weg`, () => {
      const l = level(id);
      const g = straight(l, ops);
      expect(own(l, g)).toBe(l.par);
      expect(run(l, g).won).toBe(true);
      // ein Faktor fehlt: es kommt nicht 1 an
      expect(run(l, straight(l, ops.slice(1))).won).toBe(false);
    });
  }
});

describe('Zahlenfabrik Welten 5 und 6: Terme und Funktionen', () => {
  const cases: [string, Op[], Op[] | null][] = [
    ['w5-1', [op('+', 3)], [op('×', 3)]],
    ['w5-2', [op('×', 2)], [op('+', 2)]],
    ['w5-3', [op('×', 3), op('+', 1)], [op('+', 1), op('×', 3)]],
    ['w5-4', [op('+', 1), op('×', 2)], [op('×', 2), op('+', 1)]],
    ['w5-5', [op('×', 5), op('−', 2)], [op('−', 2), op('×', 5)]],
    ['w5-6', [op('+', 1), op('×', 2), op('×', 2)], [op('×', 2), op('×', 2), op('+', 1)]],
    ['w6-1', [op('²', 2)], [op('×', 2)]],
    ['w6-2', [op('²', 2), op('+', 1)], [op('+', 1), op('²', 2)]],
    ['w6-3', [op('+', 1), op('²', 2)], [op('²', 2), op('+', 1)]],
    ['w6-4', [op('²', 2), op('×', 2)], [op('×', 2), op('²', 2)]],
    ['w6-5', [op('×', 3), op('−', 1)], [op('−', 1), op('×', 3)]],
    ['w6-6', [op('²', 2), op('−', 4)], [op('−', 4), op('²', 2)]],
  ];
  for (const [id, good, bad] of cases) {
    it(`${id}: Wertetabelle stimmt; falsche Reihenfolge scheitert; Teile-Ziel = kürzester Weg`, () => {
      const l = level(id);
      const g = straight(l, good);
      expect(own(l, g)).toBe(l.par);
      const r = run(l, g);
      expect(r.error).toBeNull();
      expect(r.won).toBe(true);
      if (bad) expect(run(l, straight(l, bad)).error?.kind).toBe('wrong');
    });
  }
  it('x² und negative Zahlen', () => {
    expect(apply(op('²', 2), -3)).toBe(9);
    expect(apply(op('²', 2), 0)).toBe(0);
    const l = level('w6-6');
    expect([0, 1, 2, 3, 4].map((i) => sourceValue(l, i))).toEqual([-2, -1, 0, 1, 2]);
  });
  it('Wertetabelle: das Lager will die Werte der Reihe nach', () => {
    const t = targetsOf(level('w5-3'))[0]!;
    expect(accepts(t, 4, 0)).toBe(true);
    expect(accepts(t, 7, 0)).toBe(false);
    expect(accepts(t, 7, 1)).toBe(true);
  });
});

describe('Zahlenfabrik: Lager-Regeln', () => {
  it('„nicht“: der Rest', () => {
    const t = { x: 0, y: 0, need: 1, accept: { kind: 'test' as const, test: { kind: 'div' as const, n: 3 }, not: true } };
    expect(accepts(t, 4, 0)).toBe(true);
    expect(accepts(t, 6, 0)).toBe(false);
  });
  it('vorgegebene Teile zählen nicht zum Teile-Ziel', () => {
    const l = level('w2-1');
    expect(isFixed(l, 5, 3)).toBe(true);
  });
});
