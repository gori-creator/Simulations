import { describe, expect, it } from 'vitest';
import { countPhotons, detectorProbabilities, rng, whichWayKnown } from '../src/simulations/physik/mach-zehnder/model';

describe('Mach-Zehnder-Interferometer', () => {
  it('gleiche Wege: alle Photonen in Detektor 1', () => {
    const [p1, p2] = detectorProbabilities({ phase: 0, bs2: true, marked: false });
    expect(p1).toBeCloseTo(1, 12);
    expect(p2).toBeCloseTo(0, 12);
  });

  it('halbe Wellenlänge Unterschied: alle in Detektor 2', () => {
    expect(detectorProbabilities({ phase: Math.PI, bs2: true, marked: false })[1]).toBeCloseTo(1, 12);
  });

  it('Welcher-Weg-Information zerstört die Interferenz', () => {
    expect(detectorProbabilities({ phase: 0, bs2: true, marked: true })).toEqual([0.5, 0.5]);
    expect(whichWayKnown({ phase: 0, bs2: true, marked: true })).toBe(true);
    expect(detectorProbabilities({ phase: 0, bs2: false, marked: false })).toEqual([0.5, 0.5]);
  });

  it('Zählung einzelner Photonen nähert die Wahrscheinlichkeit an', () => {
    const [c1, c2] = countPhotons({ phase: Math.PI / 2, bs2: true, marked: false }, 10000, rng(7));
    expect(c1 + c2).toBe(10000);
    expect(c1 / 10000).toBeCloseTo(0.5, 1);
  });
});
