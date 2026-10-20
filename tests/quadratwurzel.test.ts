import { describe, expect, it } from 'vitest';
import { exactAt, heronNext, heronSteps, isPerfectSquare, nestInterval } from '../src/simulations/mathematik/quadratwurzel/model';

describe('Modell: Quadratwurzel', () => {
  it('Heron für √2 mit x₀ = 2: 1,5; 1,41666…; 1,4142157 …', () => {
    const s = heronSteps(2, 2, 4);
    expect(s[1]!.x).toBe(1.5);
    expect(s[2]!.x).toBeCloseTo(17 / 12, 14);
    expect(s[3]!.x).toBeCloseTo(577 / 408, 14);
    expect(s[4]!.x).toBeCloseTo(665857 / 470832, 14);
    expect(Math.abs(s[4]!.x - Math.SQRT2)).toBeLessThan(2e-12);
  });
  it('Fläche bleibt immer a, Breite = a : Länge', () => {
    for (const q of heronSteps(10, 10, 6)) expect(q.x * q.y).toBeCloseTo(10, 10);
    expect(heronNext(10, 10)).toBe(5.5);
  });
  it('Heron konvergiert für viele Startwerte gegen √a', () => {
    for (let a = 1; a <= 200; a += 13) {
      for (const x0 of [1, 2.5, 7, 20]) {
        const s = heronSteps(a, x0, 12);
        expect(s[12]!.x).toBeCloseTo(Math.sqrt(a), 9);
        // ab dem ersten Schritt liegt x über √a (Mittel ≥ geometrisches Mittel)
        for (let i = 1; i <= 12; i++) expect(s[i]!.x).toBeGreaterThanOrEqual(Math.sqrt(a) - 1e-12);
      }
    }
  });
  it('Intervallschachtelung für √2: [1; 2], [1,4; 1,5], [1,41; 1,42], [1,414; 1,415]', () => {
    expect(nestInterval(2, 0)).toEqual([1, 2]);
    expect(nestInterval(2, 1)).toEqual([1.4, 1.5]);
    expect(nestInterval(2, 2)).toEqual([1.41, 1.42]);
    expect(nestInterval(2, 3)).toEqual([1.414, 1.415]);
    const [lo, hi] = nestInterval(3, 7);
    expect(lo).toBeCloseTo(1.7320508, 12);
    expect(lo * lo).toBeLessThan(3);
    expect(hi * hi).toBeGreaterThan(3);
  });
  it('Quadratzahlen werden genau getroffen', () => {
    expect(isPerfectSquare(49)).toBe(true);
    expect(isPerfectSquare(50)).toBe(false);
    expect(exactAt(25, 0)).toBe(true);
    expect(exactAt(2, 5)).toBe(false);
    expect(nestInterval(49, 2)).toEqual([7, 7.01]);
  });
});
