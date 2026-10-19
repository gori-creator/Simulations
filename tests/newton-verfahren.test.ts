import { describe, expect, it } from 'vitest';
import { basinOf, bisection, bracketFor, correctDigits, FNS, isCycle, iterate, newtonStep, sequence } from '../src/simulations/mathematik/newton-verfahren/model';

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

describe('Modell: Newton-Verfahren – Einzugsbereiche und Vergleich mit der Intervallhalbierung', () => {
  it('√2: x₀ = 1 → 1,5 → 1,41667 → 1,4142157 → 1,41421356237469 (Fehler 8,6·10⁻², 2,5·10⁻³, 2,1·10⁻⁶, 1,6·10⁻¹²)', () => {
    const xs = sequence(FNS.sq2, 1, 4);
    const err = xs.map((x) => Math.abs(x - Math.SQRT2));
    expect(err[1]).toBeCloseTo(0.0857864, 6);
    expect(err[2]).toBeCloseTo(0.0024531, 6);
    expect(err[3]).toBeCloseTo(2.1239e-6, 9);
    expect(err[4]).toBeLessThan(2e-12);
  });
  it('Einzugsbereiche bei x³ − 3x + 1: x₀ = 0,9 → 1,532; x₀ = 0,95 → −1,879; x₀ = 0,5 → 0,347; x₀ = 1 bricht ab', () => {
    expect(basinOf(FNS.three, 0.9)).toBe(2);
    expect(basinOf(FNS.three, 0.95)).toBe(0);
    expect(basinOf(FNS.three, 0.5)).toBe(1);
    expect(basinOf(FNS.three, 1)).toBe(-1);
  });
  it('Einzugsbereiche bei x² − 2: positive Startwerte → √2, negative → −√2, 0 → Abbruch; Zyklus bei x³ − 2x + 2 ab 0', () => {
    expect(basinOf(FNS.sq2, 0.3)).toBe(1);
    expect(basinOf(FNS.sq2, -3)).toBe(0);
    expect(basinOf(FNS.sq2, 0)).toBe(-1);
    expect(basinOf(FNS.cycle, 0)).toBe(-1);
    expect(basinOf(FNS.cycle, -2)).toBe(0);
  });
  it('Intervallhalbierung für x² − 2 auf [1; 2]: 1,5; 1,25; 1,375; 1,4375 – Fehler halbiert sich', () => {
    expect(bisection(FNS.sq2, 1, 2, 4)).toEqual([1.5, 1.25, 1.375, 1.4375]);
    const m = bisection(FNS.sq2, 1, 2, 20);
    expect(Math.abs(m[19]! - Math.SQRT2)).toBeLessThan(2 ** -20);
  });
  it('Klammerintervall enthält genau eine Nullstelle mit Vorzeichenwechsel', () => {
    for (const key of ['sq2', 'cubic', 'cos', 'three', 'cycle'] as const) {
      const fn = FNS[key];
      for (const r of fn.roots) {
        const [a, b] = bracketFor(fn, r);
        expect(fn.f(a) * fn.f(b)).toBeLessThan(0);
        expect(fn.roots.filter((q) => q > a && q < b)).toEqual([r]);
      }
    }
  });
});
