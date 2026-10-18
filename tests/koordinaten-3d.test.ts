import { describe, expect, it } from 'vitest';
import { boxCenter, boxCorners, boxSurface, boxVolume, cornersOnPlanes, dist, distOrigin, mirrors, octant, projections, randomPoint, spaceDiagonal, walk, walkAt, where } from '../src/simulations/mathematik/koordinaten-3d/model';

describe('Modell: Räumliches Koordinatensystem – Punkte', () => {
  it('Abstand vom Ursprung: P(3 | 4 | 2) → √29', () => {
    expect(distOrigin([3, 4, 2])).toBeCloseTo(Math.sqrt(29), 12);
    expect(distOrigin([2, 3, 6])).toBeCloseTo(7, 12);
    expect(dist([1, 2, 3], [3, 5, 9])).toBeCloseTo(7, 12);
  });
  it('Lage: Ursprung, Achse, Koordinatenebene, Oktant', () => {
    expect(where([0, 0, 0])).toEqual({ kind: 'origin' });
    expect(where([0, 0, 4])).toEqual({ kind: 'axis', axis: 3 });
    expect(where([2, 0, 0])).toEqual({ kind: 'axis', axis: 1 });
    expect(where([0, 3, 3])).toEqual({ kind: 'plane', plane: 23 });
    expect(where([2, 3, 0])).toEqual({ kind: 'plane', plane: 12 });
    expect(where([2, 0, -1])).toEqual({ kind: 'plane', plane: 13 });
    expect(where([1, 1, 1])).toEqual({ kind: 'octant', octant: 1 });
  });
  it('Oktanten I–VIII', () => {
    expect(octant([1, 1, 1])).toBe(1);
    expect(octant([-1, 1, 1])).toBe(2);
    expect(octant([-1, -1, 1])).toBe(3);
    expect(octant([1, -1, 1])).toBe(4);
    expect(octant([1, 1, -1])).toBe(5);
    expect(octant([-2, 3, -1.5])).toBe(6);
    expect(octant([0, 1, 1])).toBe(0);
  });
  it('Projektionen und Spiegelpunkte', () => {
    expect(projections([2, 3, 4])).toEqual({ p12: [2, 3, 0], p13: [2, 0, 4], p23: [0, 3, 4] });
    const m = mirrors([2, 3, 4]);
    expect(m.o).toEqual([-2, -3, -4]);
    expect(m.e12).toEqual([2, 3, -4]);
    expect(m.a3).toEqual([-2, -3, 4]);
  });
  it('Koordinatenweg x₁ → x₂ → x₃', () => {
    expect(walk([3, 4, 2])).toEqual([
      [0, 0, 0],
      [3, 0, 0],
      [3, 4, 0],
      [3, 4, 2],
    ]);
    expect(walkAt([3, 4, 2], 0.5)).toEqual([1.5, 0, 0]);
    expect(walkAt([3, 4, 2], 1.5)).toEqual([3, 2, 0]);
    expect(walkAt([3, 4, 2], 3)).toEqual([3, 4, 2]);
  });
  it('Zufallspunkte ganzzahlig im Bereich, nicht im Ursprung', () => {
    for (let s = 0; s < 50; s++) {
      const q = randomPoint(s);
      for (const v of q) {
        expect(Number.isInteger(v)).toBe(true);
        expect(Math.abs(v)).toBeLessThanOrEqual(4);
      }
      expect(q.some((v) => v !== 0)).toBe(true);
    }
  });
});

describe('Modell: Räumliches Koordinatensystem – Quader', () => {
  it('Eckpunkte: Grundfläche ABCD, darüber EFGH', () => {
    const c = boxCorners([1, -2, 1], 2, 3, 2.5);
    expect(c[0]).toEqual([1, -2, 1]);
    expect(c[1]).toEqual([3, -2, 1]);
    expect(c[2]).toEqual([3, 1, 1]);
    expect(c[3]).toEqual([1, 1, 1]);
    expect(c[4]).toEqual([1, -2, 3.5]);
    expect(c[6]).toEqual([3, 1, 3.5]);
  });
  it('Volumen, Oberfläche, Raumdiagonale, Mittelpunkt', () => {
    expect(boxVolume(3, 4, 2)).toBe(24);
    expect(boxSurface(3, 4, 2)).toBe(52);
    expect(spaceDiagonal(3, 4, 12)).toBeCloseTo(13, 12);
    expect(boxCenter([0, 0, 0], 3, 4, 2)).toEqual([1.5, 2, 1]);
    // Raumdiagonale = Abstand von A zu G
    const c = boxCorners([1, -2, 1], 2, 3, 2.5);
    expect(dist(c[0]!, c[6]!)).toBeCloseTo(spaceDiagonal(2, 3, 2.5), 12);
  });
  it('Quader am Ursprung: A im Ursprung, B, D, E auf den Achsen', () => {
    const c = boxCorners([0, 0, 0], 3, 4, 2);
    const on = cornersOnPlanes(c);
    expect(on.axis).toEqual([0, 1, 3, 4]);
    expect(on.plane).toEqual([0, 1, 2, 3, 4, 5, 7]);
  });
});
