import { describe, expect, it } from 'vitest';
import { boxDeriv, boxOptimum, boxVolume, canDeriv, canHeight, canOptimum, canSurface, rectArea, rectDeriv, rectOptimum } from '../src/simulations/mathematik/extremwertprobleme/model';

describe('Modell: Extremwertprobleme', () => {
  it('Schachtel aus 30 cm × 20 cm: x ≈ 3,92 cm, V ≈ 1056,3 cm³', () => {
    const p = { a: 30, b: 20 };
    const x = boxOptimum(p);
    expect(x).toBeCloseTo(3.9237, 4);
    expect(boxVolume(p, x)).toBeCloseTo(1056.31, 2);
    expect(boxDeriv(p, x)).toBeCloseTo(0, 9);
  });
  it('quadratischer Karton a = b: x = a/6', () => {
    expect(boxOptimum({ a: 24, b: 24 })).toBeCloseTo(4, 12);
  });
  it('1-Liter-Dose: r ≈ 5,42 cm, h = 2r, O ≈ 553,6 cm²', () => {
    const r = canOptimum(1000);
    expect(r).toBeCloseTo(5.419, 3);
    expect(canHeight(1000, r)).toBeCloseTo(2 * r, 9);
    expect(canSurface(1000, r)).toBeCloseTo(553.58, 2);
    expect(canDeriv(1000, r)).toBeCloseTo(0, 9);
  });
  it('Rechteck unter 3e^(−0,5x): u = 2, A = 6/e', () => {
    expect(rectDeriv(rectOptimum)).toBe(0);
    expect(rectArea(2)).toBeCloseTo(6 / Math.E, 12);
  });
  it('Plausibilität: Optimum ist besser als zufällige zulässige Werte', () => {
    for (let i = 0; i < 50; i++) {
      const p = { a: 20 + Math.random() * 20, b: 15 + Math.random() * 10 };
      const x = Math.random() * (Math.min(p.a, p.b) / 2);
      expect(boxVolume(p, boxOptimum(p))).toBeGreaterThanOrEqual(boxVolume(p, x) - 1e-9);
      const V = 250 + Math.random() * 1750;
      const r = 1 + Math.random() * 10;
      expect(canSurface(V, canOptimum(V))).toBeLessThanOrEqual(canSurface(V, r) + 1e-9);
      const u = Math.random() * 8;
      expect(rectArea(rectOptimum)).toBeGreaterThanOrEqual(rectArea(u) - 1e-12);
    }
  });
});
