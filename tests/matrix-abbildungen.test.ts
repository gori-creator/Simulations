import { describe, expect, it } from 'vitest';
import { apply, classify, det, eigen, mul, type Mat } from '../src/simulations/mathematik/matrix-abbildungen/model';

const rot = (deg: number): Mat => {
  const r = (deg * Math.PI) / 180;
  return { a: Math.cos(r), b: -Math.sin(r), c: Math.sin(r), d: Math.cos(r) };
};

describe('Modell: Matrizen als lineare Abbildungen', () => {
  it('Spalten sind die Bilder von e₁ und e₂', () => {
    const m: Mat = { a: 2, b: 1, c: 0, d: 3 };
    expect(apply(m, [1, 0])).toEqual([2, 0]);
    expect(apply(m, [0, 1])).toEqual([1, 3]);
    expect(det(m)).toBe(6);
  });
  it('Drehung um 90°: det = 1, keine reellen Eigenwerte', () => {
    const m = rot(90);
    expect(det(m)).toBeCloseTo(1, 12);
    expect(eigen(m)).toEqual([]);
    expect(classify(m)).toBe('rotation');
  });
  it('Spiegelung an der x-Achse: det = −1, Eigenwerte 1 und −1', () => {
    const m: Mat = { a: 1, b: 0, c: 0, d: -1 };
    expect(classify(m)).toBe('reflection');
    expect(eigen(m).map((e) => e.value).sort()).toEqual([-1, 1]);
  });
  it('Scherung (1 1; 0 1): det = 1, ein Eigenwert 1 mit Eigenrichtung e₁', () => {
    const m: Mat = { a: 1, b: 1, c: 0, d: 1 };
    expect(classify(m)).toBe('shear');
    const e = eigen(m);
    expect(e.length).toBe(1);
    expect(e[0]!.value).toBe(1);
    expect(Math.abs(e[0]!.vector[1])).toBeLessThan(1e-12);
  });
  it('Projektion auf die x-Achse: det = 0', () => {
    expect(classify({ a: 1, b: 0, c: 0, d: 0 })).toBe('projection');
  });
  it('Eigenvektoren von (2 1; 1 2): λ = 3 und λ = 1', () => {
    const e = eigen({ a: 2, b: 1, c: 1, d: 2 });
    expect(e[0]!.value).toBeCloseTo(3, 12);
    expect(e[1]!.value).toBeCloseTo(1, 12);
  });
  it('Plausibilität: A·v = λv, det(AB) = det A · det B', () => {
    for (let i = 0; i < 100; i++) {
      const r = () => Math.round((Math.random() * 6 - 3) * 10) / 10;
      const m: Mat = { a: r(), b: r(), c: r(), d: r() };
      const n: Mat = { a: r(), b: r(), c: r(), d: r() };
      expect(det(mul(m, n))).toBeCloseTo(det(m) * det(n), 9);
      for (const e of eigen(m)) {
        const av = apply(m, e.vector);
        expect(av[0]).toBeCloseTo(e.value * e.vector[0], 6);
        expect(av[1]).toBeCloseTo(e.value * e.vector[1], 6);
      }
    }
  });
});
