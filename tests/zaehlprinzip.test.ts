import { describe, expect, it } from 'vitest';
import {
  childOptions,
  enumeratePaths,
  factorial,
  groupDigits,
  independentPlan,
  pathsBelow,
  pathsWithPrefix,
  permutations,
  poolPlan,
  productRule,
  stageCounts,
  totalPaths,
  variationsWithoutRep,
  variationsWithRep,
  visibleTree,
} from '../src/simulations/mathematik/zaehlprinzip/model';

describe('Modell: Zählprinzip und Baumdiagramm', () => {
  it('Produktregel: 3 Hosen · 4 T-Shirts · 2 Mützen = 24 Outfits', () => {
    expect(productRule([3, 4, 2])).toBe(24);
    expect(totalPaths(independentPlan([3, 4, 2]))).toBe(24);
    expect(enumeratePaths(independentPlan([3, 4, 2]))).toHaveLength(24);
  });

  it('leeres Produkt und Stufe ohne Möglichkeit', () => {
    expect(productRule([])).toBe(1);
    expect(totalPaths(independentPlan([3, 0, 2]))).toBe(0);
    expect(enumeratePaths(independentPlan([3, 0, 2]))).toEqual([]);
  });

  it('vierstellige PIN aus 10 Ziffern: 10⁴ = 10 000', () => {
    expect(variationsWithRep(10, 4)).toBe(10000);
    expect(totalPaths(poolPlan(10, 4, true))).toBe(10000);
    expect(stageCounts(poolPlan(10, 4, true))).toEqual([10, 10, 10, 10]);
  });

  it('Siegerpodest aus 8 Läufern: 8 · 7 · 6 = 336', () => {
    expect(variationsWithoutRep(8, 3)).toBe(336);
    expect(stageCounts(poolPlan(8, 3, false))).toEqual([8, 7, 6]);
    expect(totalPaths(poolPlan(8, 3, false))).toBe(336);
  });

  it('Fakultät und Permutationen: 5! = 120, 0! = 1', () => {
    expect(factorial(5)).toBe(120);
    expect(factorial(0)).toBe(1);
    expect(permutations(8)).toBe(40320);
    expect(totalPaths(poolPlan(5, 5, false))).toBe(120);
    expect(variationsWithoutRep(5, 5)).toBe(factorial(5));
  });

  it('ohne Wiederholung: mehr Stufen als Dinge ergibt 0', () => {
    expect(variationsWithoutRep(3, 4)).toBe(0);
    expect(stageCounts(poolPlan(3, 4, false))).toEqual([3, 2, 1, 0]);
    expect(totalPaths(poolPlan(3, 4, false))).toBe(0);
  });

  it('Pfade ohne Wiederholung enthalten kein Ding doppelt und sind systematisch geordnet', () => {
    const paths = enumeratePaths(poolPlan(4, 3, false));
    expect(paths).toHaveLength(24);
    for (const p of paths) expect(new Set(p).size).toBe(3);
    expect(paths[0]).toEqual([0, 1, 2]);
    expect(paths[1]).toEqual([0, 1, 3]);
    expect(paths[23]).toEqual([3, 2, 1]);
    expect(childOptions(poolPlan(4, 3, false), [2])).toEqual([0, 1, 3]);
  });

  it('Eistüte mit Wiederholung: 2 Kugeln aus 4 Sorten = 16, auch „Vanille, Vanille“', () => {
    const paths = enumeratePaths(poolPlan(4, 2, true));
    expect(paths).toHaveLength(16);
    expect(paths).toContainEqual([0, 0]);
  });

  it('Pfade unterhalb eines Teilpfads', () => {
    const plan = independentPlan([3, 4, 2]);
    expect(pathsBelow(plan, 1)).toBe(8);
    expect(pathsWithPrefix(plan, [1])).toHaveLength(8);
    expect(pathsWithPrefix(plan, [1, 2])).toEqual([
      [1, 2, 0],
      [1, 2, 1],
    ]);
  });

  it('kleiner Baum wird vollständig gezeichnet', () => {
    const t = visibleTree(independentPlan([3, 4, 2]), 30);
    expect(t.rows).toBe(24);
    expect(t.leaves).toHaveLength(24);
    expect(t.nodes.filter((n) => n.kind === 'stub')).toHaveLength(0);
    expect(t.nodes).toHaveLength(1 + 3 + 12 + 24);
  });

  it('großer Baum wird begrenzt; gezeichnete Blätter sind der Anfang der Liste', () => {
    for (const [plan, budget] of [
      [poolPlan(10, 4, true), 30],
      [poolPlan(8, 3, false), 30],
      [poolPlan(8, 8, false), 24],
      [independentPlan([4, 5, 4]), 20],
    ] as const) {
      const t = visibleTree(plan, budget);
      const all = enumeratePaths(plan, t.leaves.length);
      expect(t.leaves).toEqual(all);
      expect(t.rows).toBeLessThanOrEqual(budget);
      expect(t.leaves.length).toBeGreaterThan(0);
      // Jeder Pfad ist genau einmal erfasst: gezeichnet oder in einem Sammelast
      const hidden = t.nodes.filter((n) => n.kind === "stub" || n.kind === "more").reduce((s, n) => s + n.hidden, 0);
      expect(t.leaves.length + hidden).toBe(t.total);
    }
  });

  it('Sackgassen, wenn eine Stufe keine Möglichkeit mehr hat', () => {
    const t = visibleTree(poolPlan(2, 3, false), 30);
    expect(t.total).toBe(0);
    expect(t.leaves).toHaveLength(0);
    expect(t.nodes.filter((n) => n.kind === 'dead')).toHaveLength(2);
  });

  it('Tausendertrennung', () => {
    expect(groupDigits(336, 'de')).toBe('336');
    expect(groupDigits(5040, 'de')).toBe('5040');
    expect(groupDigits(10000, 'de')).toBe('10 000');
    expect(groupDigits(40320, 'en')).toBe('40,320');
  });
});
