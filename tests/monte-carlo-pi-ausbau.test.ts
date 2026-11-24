import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { buffonEstimate, buffonFunnel, needleCrosses, needleProbability, PARABOLA_AREA, shareFunnel, underParabola } from '../src/simulations/mathematik/monte-carlo-pi/model';

describe('Monte-Carlo: Buffonsche Nadel', () => {
  it('waagrechte Nadeln kreuzen nie, senkrechte über einer Linie schon', () => {
    expect(needleCrosses(0.5, 0, 1)).toBe(false);
    expect(needleCrosses(0.9, Math.PI / 2, 0.5)).toBe(true);
    expect(needleCrosses(0.5, Math.PI / 2, 0.5)).toBe(false);
    expect(needleCrosses(2.1, Math.PI / 2, 0.5)).toBe(true);
  });
  it('relative Häufigkeit nähert sich 2l/π', () => {
    const rnd = seededRandom(3);
    for (const len of [1, 0.5]) {
      let k = 0;
      const n = 200_000;
      for (let i = 0; i < n; i++) if (needleCrosses(rnd() * 4, rnd() * Math.PI, len)) k++;
      expect(k / n).toBeCloseTo(needleProbability(len), 2);
      expect(Math.abs(buffonEstimate(k, n, len) - Math.PI)).toBeLessThan(0.05);
    }
  });
  it('ohne Treffer kein Schätzwert; Trichter wird enger', () => {
    expect(buffonEstimate(0, 10, 1)).toBeNaN();
    expect(buffonEstimate(2, 3, 1)).toBeCloseTo(3);
    expect(buffonFunnel(10_000, 1)).toBeLessThan(buffonFunnel(100, 1));
    expect(buffonFunnel(10_000, 1)).toBeCloseTo(0.0465, 3);
  });
});

describe('Monte-Carlo: Fläche unter der Parabel', () => {
  it('Treffer unter y = x², Anteil nähert sich 1/3', () => {
    expect(underParabola(1, 0.5)).toBe(true);
    expect(underParabola(0.5, 0.5)).toBe(false);
    const rnd = seededRandom(9);
    let k = 0;
    const n = 100_000;
    for (let i = 0; i < n; i++) if (underParabola(rnd(), rnd())) k++;
    expect(Math.abs(k / n - PARABOLA_AREA)).toBeLessThan(2 * shareFunnel(n, PARABOLA_AREA));
  });
});
