import { describe, expect, it } from 'vitest';
import { WORLD_1 } from '../src/spiele/zahlenfabrik/levels';
import { apply, canPlace, key, run, starsFor, type Dir, type Grid, type Op, type Part } from '../src/spiele/zahlenfabrik/model';

/** Weg als Liste von Feldern [x, y, Richtung, Maschine?]. */
const build = (cells: [number, number, Dir, Op?][]): Grid => new Map(cells.map(([x, y, dir, op]) => [key(x, y), { dir, op: op ?? null } satisfies Part]));
const level = (id: string) => WORLD_1.find((l) => l.id === id)!;
const straight = (ops: (Op | undefined)[]): Grid => build(ops.map((op, i) => [i + 1, 1, 0, op]));

describe('Zahlenfabrik: Rechnen', () => {
  it('Maschinen', () => {
    expect(apply({ sym: '+', n: 2 }, 3)).toBe(5);
    expect(apply({ sym: '−', n: 3 }, 20)).toBe(17);
    expect(apply({ sym: '×', n: 3 }, 4)).toBe(12);
    expect(apply({ sym: '÷', n: 2 }, 20)).toBe(10);
    expect(apply({ sym: '÷', n: 2 }, 17)).toBeNull();
  });
});

describe('Zahlenfabrik: Welt 1 ist lösbar', () => {
  it('1: 3 + 2 = 5', () => {
    const r = run(level('w1-1'), straight([undefined, { sym: '+', n: 2 }, undefined, undefined, undefined]));
    expect(r.won).toBe(true);
    expect(r.delivered).toBe(3);
  });
  it('2: 4 · 3 = 12, mit +2 falsch', () => {
    expect(run(level('w1-2'), straight([{ sym: '×', n: 3 }, undefined, undefined, undefined, undefined])).won).toBe(true);
    const wrong = run(level('w1-2'), straight([{ sym: '+', n: 2 }, undefined, undefined, undefined, undefined]));
    expect(wrong.error).toMatchObject({ kind: 'wrong', value: 6 });
  });
  it('3: Reihenfolge zählt – (2 + 3) · 2 = 10, aber 2 · 2 + 3 = 7', () => {
    expect(run(level('w1-3'), straight([{ sym: '+', n: 3 }, { sym: '×', n: 2 }, undefined, undefined, undefined])).won).toBe(true);
    expect(run(level('w1-3'), straight([{ sym: '×', n: 2 }, { sym: '+', n: 3 }, undefined, undefined, undefined])).error?.value).toBe(7);
  });
  it('4: 20 ÷ 2 − 3 = 7; erst −3 geht beim Teilen nicht auf', () => {
    expect(run(level('w1-4'), straight([{ sym: '÷', n: 2 }, { sym: '−', n: 3 }, undefined, undefined, undefined])).won).toBe(true);
    expect(run(level('w1-4'), straight([{ sym: '−', n: 3 }, { sym: '÷', n: 2 }, undefined, undefined, undefined])).error?.kind).toBe('divide');
  });
  it('5: um die Ecke mit 8 Teilen', () => {
    const g = build([[1, 3, 0, { sym: '+', n: 3 }], [2, 3, 0, { sym: '×', n: 2 }], [3, 3, 0], [4, 3, 0], [5, 3, 0], [6, 3, 3], [6, 2, 3], [6, 1, 3]]);
    const r = run(level('w1-5'), g);
    expect(r.won).toBe(true);
    expect(g.size).toBe(level('w1-5').par);
  });
  it('6: (1 + 9) · 10 = 100 mit 10 Teilen', () => {
    const g = build([[0, 1, 1, { sym: '+', n: 9 }], [0, 2, 0], [1, 2, 0, { sym: '×', n: 10 }], [2, 2, 0], [3, 2, 3], [3, 1, 0], [4, 1, 0], [5, 1, 0], [6, 1, 1], [6, 2, 1]]);
    const r = run(level('w1-6'), g);
    expect(r.won).toBe(true);
    expect(g.size).toBe(level('w1-6').par);
  });
});

describe('Zahlenfabrik: Fehler und Regeln', () => {
  it('ohne Band fällt die Zahl herunter', () => {
    expect(run(level('w1-1'), new Map()).error?.kind).toBe('fell');
  });
  it('Kreis ohne Ausgang endet nach der Zeitgrenze', () => {
    const loop = build([[1, 1, 0], [2, 1, 1], [2, 2, 2], [1, 2, 3]]);
    expect(run(level('w1-1'), loop).error?.kind).toBe('timeout');
  });
  it('nicht auf Quelle, Lager oder Mauer bauen', () => {
    const l = level('w1-5');
    expect(canPlace(l, l.source.x, l.source.y)).toBe(false);
    expect(canPlace(l, l.target.x, l.target.y)).toBe(false);
    expect(canPlace(l, 0, 1)).toBe(false);
    expect(canPlace(l, 3, 3)).toBe(true);
    expect(canPlace(l, 7, 0)).toBe(false);
  });
  it('Sterne', () => {
    const l = level('w1-1');
    expect(starsFor(l, 5, 0)).toBe(3);
    expect(starsFor(l, 6, 0)).toBe(2);
    expect(starsFor(l, 6, 2)).toBe(1);
  });
});
