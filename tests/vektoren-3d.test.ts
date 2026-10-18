import { describe, expect, it } from 'vitest';
import { add, between, collinear, isZero, linComb, midpoint, multipleOf, neg, norm, normSq, randomVec, scale, solveLinComb, sub, unit } from '../src/simulations/mathematik/vektoren-3d/model';

describe('Modell: Vektoren im Raum', () => {
  it('addiert und subtrahiert komponentenweise', () => {
    expect(add([2, 4, 0], [1, -1, 3])).toEqual([3, 3, 3]);
    expect(sub([2, 4, 0], [1, -1, 3])).toEqual([1, 5, -3]);
    // a − b = a + (−b)
    expect(sub([2, 4, 0], [1, -1, 3])).toEqual(add([2, 4, 0], neg([1, -1, 3])));
  });
  it('Rechengesetze: kommutativ, assoziativ, distributiv', () => {
    const a = [2, -1, 3] as const;
    const b = [0.5, 4, -2] as const;
    const c = [1, 1, 1] as const;
    expect(add(a, b)).toEqual(add(b, a));
    expect(add(add(a, b), c)).toEqual(add(a, add(b, c)));
    expect(scale(add(a, b), 2)).toEqual(add(scale(a, 2), scale(b, 2)));
  });
  it('Vielfache: Länge mal |k|, Richtung umgekehrt bei k < 0', () => {
    const a = [2, 4, 0] as const;
    expect(scale(a, -1.5)).toEqual([-3, -6, -0]);
    expect(norm(scale(a, -1.5))).toBeCloseTo(1.5 * norm(a), 12);
    expect(multipleOf(a, scale(a, -1.5))).toBeCloseTo(-1.5, 12);
  });
  it('Betrag: √(2² + 4² + 0²) = √20', () => {
    expect(normSq([2, 4, 0])).toBe(20);
    expect(norm([2, 3, 6])).toBeCloseTo(7, 12);
    expect(norm(unit([2, 3, 6]))).toBeCloseTo(1, 12);
    expect(unit([0, 0, 0])).toEqual([0, 0, 0]);
  });
  it('Linearkombination und ihre Faktoren', () => {
    const a = [2, 4, 0] as const;
    const b = [1, -1, 3] as const;
    expect(linComb(1.5, a, 0.5, b)).toEqual([3.5, 5.5, 1.5]);
    const rs = solveLinComb(a, b, [3.5, 5.5, 1.5])!;
    expect(rs.r).toBeCloseTo(1.5, 9);
    expect(rs.s).toBeCloseTo(0.5, 9);
    // nicht in der Ebene von a und b
    expect(solveLinComb(a, b, [0, 0, 1])).toBeNull();
  });
  it('Verbindungsvektor „Spitze minus Fuß“ und Mittelpunkt', () => {
    expect(between([3, -1, 1], [-1, 3, 3])).toEqual([-4, 4, 2]);
    expect(norm(between([3, -1, 1], [-1, 3, 3]))).toBeCloseTo(6, 12);
    expect(midpoint([3, -1, 1], [-1, 3, 3])).toEqual([1, 1, 2]);
  });
  it('Kollinearität und Nullvektor', () => {
    expect(collinear([1, 2, 3], [-2, -4, -6])).toBe(true);
    expect(collinear([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(collinear([0, 0, 0], [1, 2, 4])).toBe(true);
    expect(multipleOf([1, 2, 3], [1, 2, 4])).toBeNull();
    expect(isZero([0, 0, 0])).toBe(true);
  });
  it('Zufallsvektoren ganzzahlig und nicht der Nullvektor', () => {
    for (let s = 0; s < 40; s++) {
      const v = randomVec(s);
      expect(v.every((x) => Number.isInteger(x) && Math.abs(x) <= 3)).toBe(true);
      expect(isZero(v)).toBe(false);
    }
  });
});
