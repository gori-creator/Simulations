import { describe, expect, it } from 'vitest';
import { airPressure, breeze, hydraulic, hydrostatic, pressure } from '../src/simulations/physik/druck/model';

describe('Druck', () => {
  it('p = F / A', () => {
    // 700 N auf 2 · 150 cm² Schuhsohle
    expect(pressure(700, 0.03)).toBeCloseTo(23333.3, 0);
  });

  it('Hydraulik: Kraftverstärkung, Wegverkleinerung, Arbeit bleibt gleich', () => {
    const h = hydraulic(100, 0.001, 0.1, 0.5);
    expect(h.F2).toBeCloseTo(10000, 6);
    expect(h.s2).toBeCloseTo(0.005, 10);
    expect(100 * 0.5).toBeCloseTo(h.F2 * h.s2, 8);
  });

  it('Schweredruck: 10 m Wasser ≈ 1 bar', () => {
    expect(hydrostatic(1000, 10)).toBeCloseTo(98100, 6);
  });

  it('Luftdruck: auf etwa 5,8 km halbiert', () => {
    expect(airPressure(0)).toBeCloseTo(1013.25, 6);
    expect(airPressure(8400 * Math.LN2)).toBeCloseTo(1013.25 / 2, 6);
  });

  it('Land-See-Wind', () => {
    expect(breeze(30, 20)).toBe('land');
    expect(breeze(10, 16)).toBe('sea');
    expect(breeze(15, 15)).toBe('none');
  });
});
