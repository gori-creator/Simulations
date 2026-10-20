import { describe, expect, it } from 'vitest';
import { boxCenter, boxCorners, boxSurface, boxVolume, cornersOnPlanes, deltas, dist, distOrigin, distSteps, faceDiagonal, FIGURES, fromRisse, gridRandom, intoOctant, matches, mirrorOf, mirrors, octant, octantCounts, octantSigns, pInsideOctant, projections, randomPoint, risse, rissMatch, spaceDiagonal, walk, walkAt, where } from '../src/simulations/mathematik/koordinaten-3d/model';

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

describe('Modell: Räumliches Koordinatensystem – Ergänzungen', () => {
  it('Prüfwert: Abstand von (1 | 2 | 2) zum Ursprung = 3', () => {
    expect(distOrigin([1, 2, 2])).toBeCloseTo(3, 12);
    const s = distSteps([0, 0, 0], [1, 2, 2]);
    expect(s.d12).toBeCloseTo(Math.sqrt(5), 12);
    expect(s.d).toBeCloseTo(3, 12);
    expect(s.sq).toBe(9);
    expect(s.corner).toEqual([1, 2, 0]);
  });
  it('Prüfwert: Quader (0 | 0 | 0) bis (4 | 3 | 2): Raumdiagonale √29 ≈ 5,39', () => {
    expect(spaceDiagonal(4, 3, 2)).toBeCloseTo(Math.sqrt(29), 12);
    expect(spaceDiagonal(4, 3, 2)).toBeCloseTo(5.385, 3);
    // zweimal Pythagoras: Flächendiagonale 5, dann mit der Höhe 2
    expect(faceDiagonal(4, 3)).toBeCloseTo(5, 12);
    expect(Math.hypot(faceDiagonal(4, 3), 2)).toBeCloseTo(Math.sqrt(29), 12);
    const c = boxCorners([0, 0, 0], 4, 3, 2);
    expect(c[6]).toEqual([4, 3, 2]);
    expect(dist(c[0]!, c[6]!)).toBeCloseTo(Math.sqrt(29), 12);
  });
  it('Abstand zweier Punkte mit Differenzen', () => {
    expect(deltas([1, -2, 3], [4, 2, 3])).toEqual([3, 4, 0]);
    expect(distSteps([1, -2, 3], [4, 2, 3]).d).toBeCloseTo(5, 12);
    expect(distSteps([3, 4, 2], [-1, 1, -2]).sq).toBe(16 + 9 + 16);
  });
  it('Spiegelpunkte und Vergleich', () => {
    expect(mirrorOf([2, -3, 1], 'o')).toEqual([-2, 3, -1]);
    expect(mirrorOf([2, -3, 1], 'e12')).toEqual([2, -3, -1]);
    expect(mirrorOf([2, -3, 1], 'e23')).toEqual([-2, -3, 1]);
    expect(matches([1, 2, 3], [1, 2, 4])).toEqual([true, true, false]);
  });
});

describe('Modell: Oktanten und Risse', () => {
  it('Vorzeichen der Oktanten passen zu octant()', () => {
    for (let n = 1; n <= 8; n++) expect(octant(octantSigns(n))).toBe(n);
    expect(octantSigns(1)).toEqual([1, 1, 1]);
    expect(octantSigns(7)).toEqual([-1, -1, -1]);
  });
  it('Punkt in einen Oktanten bringen', () => {
    expect(intoOctant([3, 4, 2], 7)).toEqual([-3, -4, -2]);
    expect(intoOctant([0, -2, 1], 1)).toEqual([1, 2, 1]);
    expect(octant(intoOctant([0, 0, 0], 6))).toBe(6);
  });
  it('Zufallspunkte zählen', () => {
    const c = octantCounts([
      [1, 1, 1],
      [-1, 1, 1],
      [1, 1, 0],
      [2, 3, 4],
    ]);
    expect(c[0]).toBe(1);
    expect(c[1]).toBe(2);
    expect(c[2]).toBe(1);
    expect(c.reduce((a, b) => a + b, 0)).toBe(4);
    let s = 1;
    const u = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const pts = Array.from({ length: 4000 }, () => gridRandom(u));
    expect(pts.every((q) => q.every((v) => v >= -4 && v <= 4 && Number.isInteger(v * 2)))).toBe(true);
    const share = 1 - octantCounts(pts)[0]! / pts.length;
    expect(share).toBeCloseTo(pInsideOctant(), 1);
    expect(pInsideOctant()).toBeCloseTo((16 / 17) ** 3, 12);
  });
  it('Risse und Rückgewinnung', () => {
    expect(risse([3, 4, 2])).toEqual({ grund: [3, 4], auf: [4, 2], seit: [3, 2] });
    expect(fromRisse([3, 4], [4, 2])).toEqual([3, 4, 2]);
    expect(fromRisse([3, 4], [5, 2])).toBeNull();
    expect(rissMatch([3, 4, 2], [3, 4, -1])).toEqual({ grund: true, auf: false, seit: false });
    expect(rissMatch([1, 4, 2], [3, 4, 2]).auf).toBe(true);
  });
  it('Körper: Kanten verweisen auf vorhandene Ecken', () => {
    for (const f of Object.values(FIGURES)) {
      expect(f.names.length).toBe(f.points.length);
      for (const [i, j] of f.edges) {
        expect(f.points[i]).toBeDefined();
        expect(f.points[j]).toBeDefined();
      }
    }
    expect(FIGURES.house.points[9]).toEqual([2, 4, 3]);
    expect(FIGURES.pyr.points[4]).toEqual([2.5, 2.5, 3]);
  });
});
