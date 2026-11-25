import { describe, expect, it } from 'vitest';
import { bestLattice, feasible, latticePoints, optimum, type Constraint } from '../src/simulations/mathematik/lineare-optimierung/model';

const shop: Constraint[] = [
  { a: 2, b: 1, c: 16 },
  { a: 1, b: 2, c: 14 },
  { a: 0, b: 1, c: 6 },
];

describe('Lineare Optimierung', () => {
  it('bestimmt das Planungsvieleck', () => {
    const poly = feasible(shop, 20);
    const has = (x: number, y: number) => poly.some((p) => Math.abs(p[0] - x) < 1e-9 && Math.abs(p[1] - y) < 1e-9);
    expect(poly).toHaveLength(5);
    expect(has(0, 0)).toBe(true);
    expect(has(8, 0)).toBe(true);
    expect(has(6, 4)).toBe(true);
    expect(has(2, 6)).toBe(true);
    expect(has(0, 6)).toBe(true);
  });

  it('findet das Optimum in einer Ecke', () => {
    const o = optimum(feasible(shop, 20), 30, 20, 'max', 20)!;
    expect(o.point[0]).toBeCloseTo(6);
    expect(o.point[1]).toBeCloseTo(4);
    expect(o.z).toBeCloseTo(260);
    expect(o.unbounded).toBe(false);
    // Kante parallel zur Zielgeraden: 2x + y
    expect(optimum(feasible(shop, 20), 2, 1, 'max', 20)!.tie).toBe(true);
  });

  it('minimiert über einem nach oben offenen Bereich', () => {
    const feed: Constraint[] = [
      { a: -1, b: -1, c: -6 },
      { a: -2, b: -1, c: -8 },
      { a: -1, b: -3, c: -9 },
    ];
    const o = optimum(feasible(feed, 12), 3, 2, 'min', 12)!;
    expect(o.point[0]).toBeCloseTo(2);
    expect(o.point[1]).toBeCloseTo(4);
    expect(o.z).toBeCloseTo(14);
    expect(optimum(feasible(feed, 12), 3, 2, 'max', 12)!.unbounded).toBe(true);
  });

  it('erkennt leere Bereiche und ganzzahlige Lösungen', () => {
    expect(feasible([{ a: 1, b: 1, c: -1 }], 10)).toHaveLength(0);
    const best = bestLattice(latticePoints(shop, 20), 30, 20, 'max')!;
    expect(best.z).toBe(260);
  });
});
