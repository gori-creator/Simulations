import { describe, expect, it } from 'vitest';
import { construction, division, fibonacci, goldenSquares, PHI } from '../src/simulations/mathematik/goldener-schnitt/model';

describe('Goldener Schnitt', () => {
  it('teilt im goldenen Verhältnis', () => {
    expect(PHI).toBeCloseTo(1.6180339887, 9);
    expect(PHI * PHI).toBeCloseTo(PHI + 1, 12);
    const d = division(10, 1 / PHI);
    expect(d.ab).toBeCloseTo(PHI, 9);
    expect(d.whole).toBeCloseTo(PHI, 9);
    expect(division(10, 0.5).ab).toBe(1);
  });

  it('konstruiert den Teilpunkt', () => {
    const { T, D, C } = construction(8);
    expect(8 / T[0]).toBeCloseTo(PHI, 9);
    expect(Math.hypot(D[0] - C[0], D[1] - C[1])).toBeCloseTo(4, 9);
  });

  it('nähert φ mit Fibonacci-Quotienten', () => {
    const f = fibonacci(10);
    expect(f).toEqual([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
    const f30 = fibonacci(30);
    expect(f30[29]! / f30[28]!).toBeCloseTo(PHI, 10);
  });

  it('zerlegt das goldene Rechteck in Quadrate mit stetiger Spirale', () => {
    const sq = goldenSquares(8);
    for (let i = 1; i < sq.length; i++) expect(sq[i]!.s / sq[i - 1]!.s).toBeCloseTo(1 / PHI, 9);
    // Ende eines Viertelkreises = Anfang des nächsten
    const end = (q: (typeof sq)[number], a: number) => [q.cx + q.s * Math.cos(a), q.cy + q.s * Math.sin(a)];
    for (let i = 0; i + 1 < sq.length; i++) {
      const a = sq[i]!;
      const b = sq[i + 1]!;
      const e = end(a, a.from); // Spirale läuft von „to“ nach „from“
      const s = end(b, b.to);
      expect(e[0]).toBeCloseTo(s[0]!, 9);
      expect(e[1]).toBeCloseTo(s[1]!, 9);
    }
  });
});
