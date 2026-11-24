import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { lineIntersections, matchParabola, maxDifference, throwInfo, vertexToGeneral } from '../src/simulations/mathematik/quadratische-funktion/model';

describe('Modell: Quadratische Funktion – Ausbau', () => {
  it('Parabel y = x² und Gerade y = x + 2 schneiden sich bei −1 und 2', () => {
    const r = lineIntersections({ a: 1, b: 0, c: 0 }, 1, 2);
    expect(r.xs).toEqual([-1, 2]);
    expect(r.disc).toBe(9);
  });
  it('Tangente y = 2x − 1 berührt y = x² in x = 1, Passante y = −1 schneidet nicht', () => {
    expect(lineIntersections({ a: 1, b: 0, c: 0 }, 2, -1).xs).toEqual([1]);
    expect(lineIntersections({ a: 1, b: 0, c: 0 }, 0, -1).xs).toEqual([]);
  });
  it('Wurf h(x) = −0,1(x − 6)² + 5: Abwurf 1,4 m, höchster Punkt (6 | 5), Landung bei 6 + √50', () => {
    const t = throwInfo(-0.1, 6, 5);
    expect(t.start).toBeCloseTo(1.4, 12);
    expect(t.top).toEqual({ x: 6, y: 5 });
    expect(t.land).toBeCloseTo(6 + Math.sqrt(50), 9);
  });
  it('Spiel: Zielparabeln sind gültig, gleiche Parabeln haben Abstand 0', () => {
    for (let q = 1; q <= 200; q++) {
      const t = matchParabola(q, seededRandom(q * 4421 + 9));
      expect(t.a).not.toBe(0);
      expect(Math.abs(t.d)).toBeLessThanOrEqual(4);
      expect(Math.abs(t.e)).toBeLessThanOrEqual(5);
    }
    const g = vertexToGeneral(2, 1, -3);
    expect(maxDifference(g, { a: 2, b: -4, c: -1 })).toBeCloseTo(0, 9);
  });
});
