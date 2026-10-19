import { describe, expect, it } from 'vitest';
import { analyze, derive, evalPoly, limits, realZeros, symmetry, zeros } from '../src/simulations/mathematik/kurvendiskussion/model';

describe('Modell: Monotonie, Extrem- und Wendestellen', () => {
  it('f(x) = x³ − 3x: H(−1 | 2), T(1 | −2), W(0 | 0)', () => {
    const a = analyze([0, -3, 0, 1]);
    expect(a.extrema.map((e) => [Number(e.x.toFixed(9)), Number(e.y.toFixed(9)), e.kind])).toEqual([
      [-1, 2, 'max'],
      [1, -2, 'min'],
    ]);
    expect(a.inflections.length).toBe(1);
    expect(a.inflections[0]!.x).toBeCloseTo(0, 9);
    expect(a.mono.map((m) => m.sign)).toEqual([1, -1, 1]);
    expect(a.curv.map((m) => m.sign)).toEqual([-1, 1]);
  });
  it('f(x) = −x³ + 3x²: T(0 | 0), H(2 | 4), W(1 | 2)', () => {
    const a = analyze([0, 0, 3, -1]);
    expect(a.extrema[0]!.kind).toBe('min');
    expect(a.extrema[1]!.x).toBeCloseTo(2, 9);
    expect(a.extrema[1]!.y).toBeCloseTo(4, 9);
    expect(a.inflections[0]!.y).toBeCloseTo(2, 9);
  });
  it('x³: Terrassenpunkt bei 0, streng monoton steigend', () => {
    const a = analyze([0, 0, 0, 1]);
    expect(a.extrema).toEqual([{ x: 0, y: 0, kind: 'saddle' }]);
    expect(a.mono.map((m) => m.sign)).toEqual([1]);
    expect(a.inflections[0]!.x).toBeCloseTo(0, 9);
  });
  it('x⁴: Tiefpunkt, obwohl f″(0) = 0 – und keine Wendestelle', () => {
    const a = analyze([0, 0, 0, 0, 1]);
    expect(a.extrema).toEqual([{ x: 0, y: 0, kind: 'min' }]);
    expect(evalPoly(a.d2, 0)).toBe(0);
    expect(a.inflections).toEqual([]);
  });
  it('0,5x⁴ − 2x²: Tiefpunkte bei ±√2, Hochpunkt bei 0', () => {
    const a = analyze([0, 0, -2, 0, 0.5]);
    expect(a.extrema.map((e) => e.kind)).toEqual(['min', 'max', 'min']);
    expect(a.extrema[2]!.x).toBeCloseTo(Math.SQRT2, 9);
    expect(a.extrema[2]!.y).toBeCloseTo(-2, 9);
  });
  it('doppelte Nullstelle wird gefunden: (x − 1)²(x + 2)', () => {
    // x³ − 3x + 2
    expect(realZeros([2, -3, 0, 1], -5, 5).map((x) => Number(x.toFixed(6)))).toEqual([-2, 1]);
  });
  it('Plausibilität: f′ ist an den Extremstellen 0, Monotonie passt zu f′', () => {
    for (let i = 0; i < 40; i++) {
      const f = [0, 1, 2, 3, 4].map(() => Math.round((Math.random() * 4 - 2) * 10) / 10);
      const a = analyze(f, -20, 20);
      for (const e of a.extrema) expect(Math.abs(evalPoly(derive(f), e.x))).toBeLessThan(1e-6);
      for (const m of a.mono) {
        if (!Number.isFinite(m.from) || !Number.isFinite(m.to)) continue;
        const x = (m.from + m.to) / 2;
        expect(Math.sign(evalPoly(a.d1, x))).toBe(m.sign);
      }
    }
  });
  it('Symmetrie: x³ − 3x punktsymmetrisch, 0,5x⁴ − 2x² achsensymmetrisch, −x³ + 3x² keine', () => {
    expect(symmetry([0, -3, 0, 1])).toBe('odd');
    expect(symmetry([0, 0, -2, 0, 0.5])).toBe('even');
    expect(symmetry([0, 0, 3, -1])).toBe('none');
    expect(symmetry([1, -3, 0, 1])).toBe('none');
    expect(symmetry([2])).toBe('even');
  });
  it('Verhalten im Unendlichen nach Grad und Leitkoeffizient', () => {
    expect(limits([0, -3, 0, 1])).toEqual([-1, 1]);
    expect(limits([0, 0, 3, -1])).toEqual([1, -1]);
    expect(limits([0, 0, -2, 0, 0.5])).toEqual([1, 1]);
    expect(limits([0, 0, 0, 0, -1])).toEqual([-1, -1]);
    expect(limits([4])).toEqual([0, 0]);
  });
  it('Nullstellen: x³ − 3x bei 0 und ±√3, −x³ + 3x² bei 0 (doppelt) und 3', () => {
    const z = zeros([0, -3, 0, 1]);
    expect(z).toHaveLength(3);
    expect(z[0]).toBeCloseTo(-Math.sqrt(3), 9);
    expect(z[1]).toBe(0);
    expect(z[2]).toBeCloseTo(Math.sqrt(3), 9);
    const z2 = zeros([0, 0, 3, -1]);
    expect(z2).toHaveLength(2);
    expect(z2[0]).toBeCloseTo(0, 9);
    expect(z2[1]).toBeCloseTo(3, 9);
    expect(zeros([1, 0, 1])).toEqual([]);
  });
  it('f″-Kriterium: x³ − 3x hat f″(−1) = −6 < 0 (Hochpunkt) und f″(1) = 6 > 0 (Tiefpunkt)', () => {
    const a = analyze([0, -3, 0, 1]);
    expect(evalPoly(a.d2, -1)).toBe(-6);
    expect(evalPoly(a.d2, 1)).toBe(6);
  });
});
