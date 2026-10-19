import { describe, expect, it } from 'vitest';
import { extremumKind, FNS, secantSlope, zeros } from '../src/simulations/mathematik/ableitungsfunktion/model';

describe('Modell: Ableitungsfunktion grafisch', () => {
  it('Extremstellen von (x³ − 6x)/4 bei ±√2, Wendestelle bei 0', () => {
    const fn = FNS.cub;
    const z = zeros(fn.d1, -3.5, 3.5);
    expect(z.length).toBe(2);
    expect(z[0]).toBeCloseTo(-Math.SQRT2, 9);
    expect(z[1]).toBeCloseTo(Math.SQRT2, 9);
    expect(extremumKind(fn, z[0]!)).toBe('max');
    expect(extremumKind(fn, z[1]!)).toBe('min');
    expect(zeros(fn.d2, -3.5, 3.5)[0]).toBeCloseTo(0, 9);
  });
  it('0,1x⁴ − x² + 1: Extrema bei 0 und ±√5, Wendestellen bei ±√(5/3)', () => {
    const fn = FNS.quart;
    const z = zeros(fn.d1, -3.6, 3.6);
    expect(z.map((x) => Number(x.toFixed(6)))).toEqual([-2.236068, 0, 2.236068]);
    expect(extremumKind(fn, 0)).toBe('max');
    const w = zeros(fn.d2, -3.6, 3.6);
    expect(w[1]).toBeCloseTo(Math.sqrt(5 / 3), 9);
  });
  it('sin′ = cos: Hochpunkt bei π/2', () => {
    expect(extremumKind(FNS.sin, Math.PI / 2)).toBe('max');
    expect(FNS.sin.d1(0)).toBe(1);
  });
  it('Sekantensteigung nähert die Ableitung', () => {
    for (const fn of Object.values(FNS)) {
      for (let i = 0; i < 20; i++) {
        const x = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0] - 0.1);
        expect(secantSlope(fn, x, 1e-6)).toBeCloseTo(fn.d1(x), 4);
        expect((fn.d1(x + 1e-6) - fn.d1(x)) / 1e-6).toBeCloseTo(fn.d2(x), 3);
      }
    }
  });
});
