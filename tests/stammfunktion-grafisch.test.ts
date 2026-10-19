import { describe, expect, it } from 'vitest';
import { F, FNS, integrate } from '../src/simulations/mathematik/stammfunktion-grafisch/model';

describe('Modell: Vom Graphen zur Stammfunktion', () => {
  it('f(x) = x² − 1: F(x) = x³/3 − x + C, F(3) − F(0) = 6', () => {
    expect(F(FNS.par, 0, 3)).toBe(6);
    expect(F(FNS.par, 2, 3)).toBe(8);
    expect(integrate(FNS.par.f, 0, 3)).toBeCloseTo(6, 10);
  });
  it('cos → sin; Nullstelle von f bei π/2 ist Hochpunkt von F', () => {
    expect(FNS.cos.F0(Math.PI / 2)).toBe(1);
    const h = 1e-3;
    expect(FNS.cos.F0(Math.PI / 2 - h)).toBeLessThan(1);
    expect(FNS.cos.F0(Math.PI / 2 + h)).toBeLessThan(1);
  });
  it('Plausibilität: F′ = f und F(b) − F(a) = ∫ f', () => {
    for (const fn of Object.values(FNS)) {
      for (let i = 0; i < 20; i++) {
        const a = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        const b = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        expect(F(fn, 1.5, b) - F(fn, 1.5, a)).toBeCloseTo(integrate(fn.f, a, b), 7);
        expect((fn.F0(a + 1e-6) - fn.F0(a - 1e-6)) / 2e-6).toBeCloseTo(fn.f(a), 5);
      }
    }
  });
});
