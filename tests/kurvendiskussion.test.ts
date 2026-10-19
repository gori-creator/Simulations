import { describe, expect, it } from 'vitest';
import { analyze, derive, evalPoly, realZeros } from '../src/simulations/mathematik/kurvendiskussion/model';

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
});
