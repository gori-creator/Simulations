import { describe, expect, it } from 'vitest';
import { dailyLevel, dayKey, randomLevel } from '../src/spiele/zahlenfabrik/daily';
import { KIT } from '../src/spiele/zahlenfabrik/kit';
import { ALL_LEVELS, kitFor } from '../src/spiele/zahlenfabrik/levels';
import { run, type Op } from '../src/spiele/zahlenfabrik/model';
import { chainLevel, makeRiddle, rng, solveChain } from '../src/spiele/zahlenfabrik/solver';
import { straight } from './zahlenfabrik-loeser';

const level = (id: string) => ALL_LEVELS.find((l) => l.id === id)!;

describe('Zahlenfabrik: Löser für Tipps', () => {
  it('findet die kürzeste Kette (Aus 4 wird 99: +7, ×9)', () => {
    const l = level('c4-5');
    const s = solveChain(l, kitFor(l), 3);
    expect(s[0]!.map((o) => `${o.sym}${o.n}`)).toEqual(['+7', '×9']);
  });
  it('Wertetabelle: 3x + 1 braucht zwei Maschinen', () => {
    const l = level('c11-3');
    expect(solveChain(l, kitFor(l), 3)[0]).toHaveLength(2);
  });
  it('nur einfache Ketten (keine Weichen, keine vorgegebenen Teile, keine Startzahl)', () => {
    expect(chainLevel(level('c4-5'))).toBe(true);
    expect(chainLevel(level('c7-1'))).toBe(false);
    expect(chainLevel(level('c6-1'))).toBe(false);
    expect(chainLevel(level('c19-1'))).toBe(false);
  });
  it('für jedes Ketten-Level findet der Löser eine Lösung innerhalb der Grenze', () => {
    for (const l of ALL_LEVELS.filter(chainLevel)) {
      const s = solveChain(l, kitFor(l), Math.min(3, l.maxMachines ?? 3));
      expect(s.length, l.id).toBeGreaterThan(0);
    }
  });
});

describe('Zahlenfabrik: Tages- und Zufallsrätsel', () => {
  it('gleicher Startwert, gleiches Rätsel; Rätsel hat genau einen Weg aus drei Maschinen', () => {
    for (const seed of [1, 42, 20261105, 777]) {
      const a = makeRiddle(seed, KIT);
      expect(makeRiddle(seed, KIT)).toEqual(a);
      expect(a.chain).toHaveLength(3);
      const l = randomLevel(seed);
      expect(l.source.value).toBe(a.from);
      expect(l.target!.value).toBe(a.to);
      // genau ein Weg mit höchstens drei Maschinen
      expect(solveChain(l, KIT, 3, 5)).toHaveLength(1);
      expect(solveChain(l, KIT, 2, 5)).toHaveLength(0);
      // die gefundene Kette löst das Level auf der Karte
      expect(run(l, straight(l, a.chain as Op[])).won).toBe(true);
    }
  });
  it('Tagesrätsel hängt nur vom Datum ab', () => {
    const d = new Date(2026, 10, 5, 9);
    expect(dayKey(d)).toBe('2026-11-05');
    expect(dailyLevel(d).id).toBe('t-2026-11-05');
    expect(dailyLevel(new Date(2026, 10, 5, 22)).target).toEqual(dailyLevel(d).target);
    expect(dailyLevel(new Date(2026, 10, 6)).id).toBe('t-2026-11-06');
  });
  it('Zufallszahlen sind gleichmäßig zwischen 0 und 1', () => {
    const r = rng(5);
    const xs = Array.from({ length: 1000 }, r);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
  });
});
