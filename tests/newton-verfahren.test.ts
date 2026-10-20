import { describe, expect, it } from 'vitest';
import { correctDigits, FNS, isCycle, iterate, newtonStep, sequence } from '../src/simulations/mathematik/newton-verfahren/model';

describe('Modell: Newton-Verfahren', () => {
  it('√2 mit x₀ = 1: 1,5 → 1,41667 → 1,414216', () => {
    const xs = sequence(FNS.sq2, 1, 3);
    expect(xs[1]).toBe(1.5);
    expect(xs[2]).toBeCloseTo(17 / 12, 14);
    expect(xs[3]).toBeCloseTo(577 / 408, 14);
  });
  it('Newtons Beispiel x³ − 2x − 5 mit x₀ = 2: x₁ = 2,1; x₂ ≈ 2,094568', () => {
    const xs = sequence(FNS.cubic, 2, 2);
    expect(xs[1]).toBeCloseTo(2.1, 14);
    expect(xs[2]).toBeCloseTo(2.094568, 6);
  });
  it('cos x = x mit x₀ = 1: 0,750364 → 0,739113', () => {
    const xs = sequence(FNS.cos, 1, 2);
    expect(xs[1]).toBeCloseTo(0.7503638678, 9);
    expect(xs[2]).toBeCloseTo(0.7391128909, 9);
  });
  it('Zyklus: x³ − 2x + 2 mit x₀ = 0 springt zwischen 0 und 1', () => {
    const xs = sequence(FNS.cycle, 0, 4);
    expect(xs).toEqual([0, 1, 0, 1, 0]);
    expect(isCycle(xs)).toBe(true);
  });
  it('waagrechte Tangente: x² − 2 mit x₀ = 0 bricht ab', () => {
    const s = newtonStep(FNS.sq2, 0);
    expect(s.next).toBeNull();
    expect(s.status).toBe('flat');
    expect(iterate(FNS.sq2, 0, 5).length).toBe(1);
  });
  it('quadratische Konvergenz: richtige Stellen verdoppeln sich ungefähr', () => {
    const xs = sequence(FNS.sq2, 1, 4);
    const d = xs.map((x) => correctDigits(FNS.sq2, x));
    expect(d[2]).toBeGreaterThanOrEqual(2);
    expect(d[3]).toBeGreaterThanOrEqual(5);
    expect(d[4]).toBeGreaterThanOrEqual(11);
  });
  it('Plausibilität: Nullstellen stimmen, Verfahren konvergiert von nahen Startwerten', () => {
    for (const fn of Object.values(FNS)) {
      for (const r of fn.roots) {
        expect(Math.abs(fn.f(r))).toBeLessThan(1e-12);
        for (let i = 0; i < 20; i++) {
          const x0 = r + (Math.random() - 0.5) * 0.2;
          const xs = sequence(fn, x0, 8);
          expect(xs[xs.length - 1]).toBeCloseTo(r, 9);
        }
      }
    }
  });
});
