import { describe, expect, it } from 'vitest';
import { allOps } from '../src/spiele/zahlenfabrik/kit';
import { ALL_LEVELS, CHAPTERS, kitFor, type LevelInfo } from '../src/spiele/zahlenfabrik/levels';
import { applySeq, key, opLabel, run, shortestPath, type Grid, type Op } from '../src/spiele/zahlenfabrik/model';
import { beltCount, beltsOver, cleanBest, isBeltPart, isNewBest, overPar } from '../src/spiele/zahlenfabrik/rules';
import { straight } from './zahlenfabrik-loeser';

const level = (id: string) => ALL_LEVELS.find((l) => l.id === id)!;
const op = (sym: Op['sym'], n = 2): Op => ({ sym, n });

/** Alle Ketten aus höchstens `max` Maschinen, die aus der Startzahl (dreimal) das Ziel machen. */
function ways(l: LevelInfo, max: number, ops = allOps(kitFor(l))): string[] {
  const out: string[] = [];
  const walk = (vals: number[], used: Op[]) => {
    if (vals.every((v) => v === l.target!.value)) out.push(used.map(opLabel).join(' '));
    if (used.length === max) return;
    for (const o of ops) {
      const next = applySeq(o, vals);
      if (next.some((v) => v === null || Math.abs(v) > 1e6)) continue;
      walk(next as number[], [...used, o]);
    }
  };
  walk([l.source.value, l.source.value, l.source.value], []);
  return out;
}

describe('Zahlenfabrik: Rätsel mit Regeln', () => {
  it('verbotene Bauteile fehlen im Werkzeugkasten, alle anderen sind da', () => {
    const l = level('c36-3');
    const ids = kitFor(l).map((k) => k.id);
    expect(ids).not.toContain('plus');
    expect(ids).not.toContain('times');
    expect(ids).toContain('minus');
    expect(ids).toContain('square');
    expect(kitFor(level('c36-1')).map((k) => k.id)).toContain('plus');
  });
  it('mit Verbot und Maschinen-Grenze genau ein Weg; ohne Verbot gäbe es mehrere', () => {
    const expected: Record<string, string> = {
      'c36-2': '+4 x²',
      'c36-3': 'x² −5',
      'c36-4': 'x² −4',
      'c36-6': '×3 ⇄ ×5',
      'c36-7': '+10 ⇄ +5',
      'c36-8': 'x² x² ≈10',
    };
    const full = allOps(kitFor(level('c36-1')));
    for (const [id, way] of Object.entries(expected)) {
      const l = level(id);
      expect(l.ban!.length, id).toBeGreaterThan(0);
      expect(ways(l, l.maxMachines!), id).toEqual([way]);
      expect(ways(l, l.maxMachines! - 1), id).toEqual([]);
      expect(ways(l, l.maxMachines!, full).length, id).toBeGreaterThanOrEqual(3);
    }
  });
  it('wenige Bänder: der kürzeste Weg ist länger als die erlaubten Bänder – Maschinen müssen die Lücken füllen', () => {
    for (const l of CHAPTERS.find((c) => c.id === 'c36')!.levels.filter((x) => x.maxBelts !== undefined)) {
      const path = shortestPath(l)!;
      expect(path.length, l.id).toBeGreaterThan(l.maxBelts!);
      // nur Bänder: Regel verletzt
      expect(beltsOver(l, straight(l)), l.id).toBe(path.length - l.maxBelts!);
    }
    // die 7 bleibt die 7: vier Maschinen, die sich aufheben
    const l = level('c36-1');
    const g = straight(l, [op('+', 1), op('−', 1), op('±'), op('±')]);
    expect(beltCount(g)).toBe(5);
    expect(beltsOver(l, g)).toBe(0);
    expect(run(l, g).won).toBe(true);
    // drei Maschinen reichen nicht für die Regel
    expect(beltsOver(l, straight(l, [op('|'), op('|'), op('|')]))).toBe(1);
  });
  it('Bänder zählen: Maschinen, Weichen, Brücken und Zusammenführer sind keine Bänder', () => {
    const g: Grid = new Map([
      [key(0, 0), { op: null, dir: 0 }],
      [key(1, 0), { op: op('+', 1), dir: 0 }],
      [key(2, 0), { op: null, dir: 0, sort: { kind: 'even' }, side: 1 }],
      [key(3, 0), { op: null, dir: 0, bridge: true }],
      [key(4, 0), { op: null, dir: 0, merge: '+' }],
      [key(5, 0), { op: null, dir: 0, split: true, side: 1 }],
      [key(6, 0), { op: null, dir: 1 }],
    ]);
    expect(beltCount(g)).toBe(2);
    expect(isBeltPart({ op: null, dir: 0, alt: true, side: 1 })).toBe(false);
    // Level ohne Regel: nie zu viele
    expect(beltsOver(level('c1-1'), g)).toBe(0);
  });
});

describe('Zahlenfabrik: Vergleich mit der Musterlösung und Bestwerte', () => {
  it('Teile über der Musterlösung', () => {
    const l = level('c2-1');
    expect(overPar(l, l.par + 2)).toBe(2);
    expect(overPar(l, l.par)).toBe(0);
    expect(overPar(l, l.par - 1)).toBe(-1);
  });
  it('neuer Bestwert nur bei weniger Teilen (oder beim ersten Sieg)', () => {
    expect(isNewBest(undefined, 9)).toBe(true);
    expect(isNewBest(9, 8)).toBe(true);
    expect(isNewBest(9, 9)).toBe(false);
    expect(isNewBest(9, 12)).toBe(false);
  });
  it('gespeicherte Bestwerte werden aufgeräumt', () => {
    expect(cleanBest({ 'c1-1': 4, x: -1, y: 2.5, z: 'neun', w: 12 })).toEqual({ 'c1-1': 4, w: 12 });
    expect(cleanBest(null)).toEqual({});
    expect(cleanBest('kaputt')).toEqual({});
  });
});
