import { describe, expect, it } from 'vitest';
import { CHAPTERS, ALL_LEVELS } from '../src/spiele/zahlenfabrik/levels';
import { apply, canPlace, DX, DY, isFixed, key, run, shortestPath, starsFor, goodPar, withFixed, type Dir, type Grid, type Level, type Op } from '../src/spiele/zahlenfabrik/model';

const level = (id: string) => ALL_LEVELS.find((l) => l.id === id)!;
const FIRST = [...CHAPTERS[0]!.levels, ...CHAPTERS[1]!.levels, ...CHAPTERS[3]!.levels];

/** Lösung auf dem kürzesten Weg bauen: Bänder in Wegrichtung, Maschinen an den genannten Stellen. */
function solve(l: Level, ops: Record<number, Op>): Grid {
  const path = shortestPath(l)!;
  const grid: Grid = new Map();
  path.forEach(([x, y], i) => {
    const [nx, ny] = path[i + 1] ?? [l.target!.x, l.target!.y];
    const dir = ([0, 1, 2, 3] as Dir[]).find((d) => x + DX[d] === nx && y + DY[d] === ny)!;
    if (!isFixed(l, x, y)) grid.set(key(x, y), { op: ops[i] ?? null, dir });
  });
  return grid;
}

describe('Zahlenfabrik: Rechnen', () => {
  it('Maschinen', () => {
    expect(apply({ sym: '+', n: 2 }, 3)).toBe(5);
    expect(apply({ sym: '−', n: 3 }, 20)).toBe(17);
    expect(apply({ sym: '×', n: 3 }, 4)).toBe(12);
    expect(apply({ sym: '÷', n: 2 }, 20)).toBe(10);
    expect(apply({ sym: '÷', n: 2 }, 17)).toBeNull();
  });
});

describe('Zahlenfabrik: erste Kapitel lösbar, Teile-Ziel = kürzester Weg', () => {
  for (const l of FIRST) {
    it(`${l.id}: Teile-Ziel passt zum kürzesten Weg`, () => {
      const path = shortestPath(l);
      expect(path).not.toBeNull();
      expect(path!.filter(([x, y]) => !isFixed(l, x, y)).length).toBe(l.par);
    });
  }
  it('3 + 2 = 5', () => {
    const l = level('c2-1');
    expect(run(l, solve(l, { 0: { sym: '+', n: 2 } })).won).toBe(true);
  });
  it('4 + 7 = 11, mit +2 falsch', () => {
    const l = level('c2-2');
    expect(run(l, solve(l, { 0: { sym: '+', n: 7 } })).won).toBe(true);
    expect(run(l, solve(l, { 0: { sym: '+', n: 2 } })).error).toMatchObject({ kind: 'wrong', value: 6 });
  });
  it('Reihenfolge zählt – (3 + 2) · 10 = 50, aber 3 · 10 + 2 = 32', () => {
    const l = level('c4-2');
    expect(run(l, solve(l, { 0: { sym: '+', n: 2 }, 1: { sym: '×', n: 10 } })).won).toBe(true);
    expect(run(l, solve(l, { 0: { sym: '×', n: 10 }, 1: { sym: '+', n: 2 } })).error?.value).toBe(32);
  });
  it('vorgegebene −3: 20 ÷ 2 − 3 = 7; ohne Teilen kommt 17 an', () => {
    const l = level('c5-2');
    expect(run(l, withFixed(l, solve(l, { 0: { sym: '÷', n: 2 } }))).won).toBe(true);
    expect(run(l, withFixed(l, solve(l, {}))).error).toMatchObject({ kind: 'wrong', value: 17 });
    expect(run(l, withFixed(l, solve(l, { 0: { sym: '−', n: 3 }, 1: { sym: '÷', n: 2 } }))).error?.kind).toBe('divide');
  });
  it('(1 + 9) · 10 = 100', () => {
    const l = level('c4-3');
    expect(run(l, solve(l, { 0: { sym: '+', n: 9 }, 1: { sym: '×', n: 10 } })).won).toBe(true);
  });
});

describe('Zahlenfabrik: Fehler und Regeln', () => {
  it('ohne Band fällt die Zahl herunter', () => {
    expect(run(level('c2-1'), new Map()).error?.kind).toBe('fell');
  });
  it('Kreis ohne Ausgang endet nach der Zeitgrenze', () => {
    const loop: Grid = new Map([[key(4, 4), { op: null, dir: 0 }], [key(5, 4), { op: null, dir: 1 }], [key(5, 5), { op: null, dir: 2 }], [key(4, 5), { op: null, dir: 3 }]]);
    expect(run(level('c2-1'), loop).error?.kind).toBe('timeout');
  });
  it('nicht auf Quelle, Lager, Felsen oder vorgegebene Teile bauen', () => {
    const l = level('c5-2');
    expect(canPlace(l, l.source.x, l.source.y)).toBe(false);
    expect(canPlace(l, l.target!.x, l.target!.y)).toBe(false);
    expect(canPlace(l, 10, 6)).toBe(false);
    expect(canPlace(l, 10, 7)).toBe(false);
    expect(canPlace(l, 4, 4)).toBe(true);
    expect(canPlace(l, 15, 0)).toBe(false);
  });
  it('Sterne', () => {
    // Nur die Größe der Fabrik zählt, nicht die Zahl der Versuche
    const l = { par: 5 };
    expect(starsFor(l, 4)).toBe(3);
    expect(starsFor(l, 5)).toBe(3);
    expect(starsFor(l, 6)).toBe(2);
    expect(starsFor(l, 7)).toBe(2);
    expect(starsFor(l, 8)).toBe(1);
    // Große Fabriken: ein Viertel mehr Teile für den zweiten Stern
    expect(goodPar({ par: 20 })).toBe(25);
    expect(starsFor({ par: 20 }, 25)).toBe(2);
    expect(starsFor({ par: 20 }, 26)).toBe(1);
  });
});
