import { describe, expect, it } from 'vitest';
import { FNS, integralFn, integrate, stripMean } from '../src/simulations/mathematik/hauptsatz/model';

describe('Modell: Integralfunktion und Hauptsatz', () => {
  it('∫₁³ x dx = 9/2 − 1/2 = 4; I_a(a) = 0', () => {
    expect(integralFn(FNS.lin, 1, 3)).toBe(4);
    expect(integralFn(FNS.lin, 1, 1)).toBe(0);
  });
  it('∫₀^π cos x dx = 0 und ∫₀^(π/2) cos x dx = 1', () => {
    expect(integralFn(FNS.cos, 0, Math.PI)).toBeCloseTo(0, 14);
    expect(integralFn(FNS.cos, 0, Math.PI / 2)).toBeCloseTo(1, 14);
  });
  it('Streifen: (I(x + h) − I(x))/h → f(x) für h → 0', () => {
    const fn = FNS.par;
    const x = 1.5;
    const errs = [1, 0.1, 0.01].map((h) => Math.abs(stripMean(fn, x, h) - fn.f(x)));
    expect(errs[1]).toBeLessThan(errs[0]!);
    expect(errs[2]).toBeLessThan(errs[1]!);
    expect(errs[2]).toBeLessThan(0.01);
  });
  it('Plausibilität: F(b) − F(a) stimmt mit dem numerischen Integral überein', () => {
    for (const fn of Object.values(FNS)) {
      for (let i = 0; i < 20; i++) {
        const a = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        const b = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        expect(integralFn(fn, a, b)).toBeCloseTo(integrate(fn.f, a, b), 7);
      }
    }
  });
});
