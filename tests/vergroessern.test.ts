import { describe, expect, it } from 'vitest';
import { cells, fullCubes, scaleArea, scaleLength, scaleVolume, unitCuts } from '../src/simulations/mathematik/vergroessern/model';

describe('Modell: Ähnliche Figuren – Länge, Fläche, Volumen', () => {
  it('k = 2: 1 cm → 2 cm, 1 cm² → 4 cm², 1 cm³ → 8 cm³', () => {
    expect(scaleLength(1, 2)).toBe(2);
    expect(scaleArea(1, 2)).toBe(4);
    expect(scaleVolume(1, 2)).toBe(8);
  });
  it('k = 3 und k = 0,5 (Schulbuchwerte)', () => {
    expect(scaleArea(1, 3)).toBe(9);
    expect(scaleVolume(1, 3)).toBe(27);
    expect(scaleArea(1, 0.5)).toBe(0.25);
    expect(scaleVolume(1, 0.5)).toBe(0.125);
  });
  it('k = 1,5: Volumen 3,375; Quader 1 × 2 × 1 mit k = 2 hat 16 cm³', () => {
    expect(scaleVolume(1, 1.5)).toBeCloseTo(3.375, 12);
    expect(scaleVolume(2, 2)).toBe(16);
    expect(scaleArea(2, 3)).toBe(18);
  });
  it('Zerlegung in Einheitsabschnitte', () => {
    expect(unitCuts(3)).toEqual([1, 1, 1]);
    expect(unitCuts(1.5)).toEqual([1, 0.5]);
    expect(unitCuts(0.5)).toEqual([0.5]);
  });
  it('Zellen füllen den Quader lückenlos', () => {
    for (const d of [
      [2, 2, 2],
      [1.5, 1.5, 1.5],
      [4, 8, 4],
      [0.5, 1, 0.5],
      [3.5, 7, 3.5],
    ] as const) {
      const cs = cells(d);
      const vol = cs.reduce((s, c) => s + c.size[0] * c.size[1] * c.size[2], 0);
      expect(vol).toBeCloseTo(d[0] * d[1] * d[2], 9);
      expect(cs.filter((c) => c.size.every((s) => s === 1)).length).toBe(fullCubes(d));
    }
    expect(fullCubes([4, 4, 4])).toBe(64);
    expect(fullCubes([1.5, 1.5, 1.5])).toBe(1);
  });
  it('Plausibilität: Verhältnis von Volumen zu Fläche wächst mit k', () => {
    for (let i = 0; i < 50; i++) {
      const k = 0.5 + Math.random() * 3.5;
      const A = 0.5 + Math.random() * 5;
      expect(scaleArea(A, k) / A).toBeCloseTo(scaleLength(1, k) ** 2, 9);
      expect(scaleVolume(A, k) / A).toBeCloseTo(k ** 3, 9);
    }
  });
});
