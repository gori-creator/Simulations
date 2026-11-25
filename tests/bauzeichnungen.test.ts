import { describe, expect, it } from 'vitest';
import { body, front, oblique, roofArea, roofSlope, side, top } from '../src/simulations/mathematik/bauzeichnungen/model';

describe('Bauzeichnungen', () => {
  it('baut die Kantenmodelle', () => {
    expect(body('haus', 8, 6, 3, 2).edges).toHaveLength(17);
    expect(body('walm', 8, 6, 3, 2).vertices[8]).toEqual([3, 3, 5]);
    expect(body('winkel', 8, 6, 3, 2).edges).toHaveLength(18);
  });

  it('projiziert senkrecht und schräg', () => {
    const p: [number, number, number] = [2, 4, 3];
    expect(top(p)).toEqual([2, 4]);
    expect(front(p)).toEqual([2, 3]);
    expect(side(p)).toEqual([4, 3]);
    const o = oblique(p, 45, 0.5);
    expect(o[0]).toBeCloseTo(2 + Math.SQRT2);
    expect(o[1]).toBeCloseTo(3 + Math.SQRT2);
    expect(oblique(p, 90, 1)).toEqual([2 + 4 * Math.cos(Math.PI / 2), 7]);
  });

  it('bestimmt wahre Größen der Dachfläche', () => {
    const s = roofSlope('haus', 8, 6, 3, 4)!;
    expect(s.real).toBeCloseTo(5); // 3-4-5-Dreieck
    expect(s.inTop).toBe(3);
    const A = roofArea('haus', 8, 6, 3, 4)!;
    expect(A.real).toBeCloseTo(40);
    expect(A.inTop).toBeCloseTo(24);
    expect(roofSlope('winkel', 8, 6, 3, 4)).toBeNull();
  });
});
