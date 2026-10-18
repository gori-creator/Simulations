import { describe, expect, it } from 'vitest';
import { asymptotes, base, keyPoints, mapPoint, stages, transformed, unmapPoint, type Base, type Trafo } from '../src/simulations/mathematik/transformationen/model';

const BASES: Base[] = ['sq', 'cub', 'sqrt', 'abs', 'inv', 'sin', 'exp'];

describe('Modell: Graphen transformieren', () => {
  it('g(x) = 2 · (x − 1)² − 2: Scheitel S(1 | −2), Nullstellen 0 und 2', () => {
    const t: Trafo = { a: 2, b: 1, c: 1, d: -2 };
    expect(transformed('sq', t, 1)).toBe(-2);
    expect(transformed('sq', t, 0)).toBe(0);
    expect(transformed('sq', t, 2)).toBe(0);
    expect(mapPoint(t, 0, 0)).toEqual([1, -2]);
    expect(mapPoint(t, 1, 1)).toEqual([2, 0]);
  });
  it('Sinus: g(x) = 2 sin(2x) + 1 hat Periode π, Maximum 3 bei π/4', () => {
    const t: Trafo = { a: 2, b: 2, c: 0, d: 1 };
    expect(transformed('sin', t, Math.PI / 4)).toBeCloseTo(3, 12);
    expect(transformed('sin', t, 0.3)).toBeCloseTo(transformed('sin', t, 0.3 + Math.PI), 12);
    const [x, y] = mapPoint(t, Math.PI / 2, 1);
    expect(x).toBeCloseTo(Math.PI / 4, 12);
    expect(y).toBe(3);
  });
  it('Spiegelung der Wurzel an der y-Achse: √(−(x − 2)) ist nur für x ≤ 2 definiert', () => {
    const t: Trafo = { a: 1, b: -1, c: 2, d: 0 };
    expect(transformed('sqrt', t, -2)).toBe(2);
    expect(transformed('sqrt', t, 2)).toBe(0);
    expect(Number.isNaN(transformed('sqrt', t, 3))).toBe(true);
  });
  it('Asymptoten verschieben sich mit c und d', () => {
    expect(asymptotes('inv', { a: 2, b: 1, c: -1, d: 1 })).toEqual({ x: -1, y: 1 });
    expect(asymptotes('exp', { a: -1, b: 1, c: 1, d: 3 })).toEqual({ y: 3 });
    expect(asymptotes('sq', { a: 1, b: 1, c: 0, d: 0 })).toEqual({});
  });
  it('Bildpunkte liegen auf dem Bildgraphen (viele Zufallswerte)', () => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 200; i++) {
      const t: Trafo = { a: (rnd() - 0.5) * 6 || 1, b: (rnd() < 0.5 ? -1 : 1) * (0.2 + rnd() * 2.8), c: (rnd() - 0.5) * 10, d: (rnd() - 0.5) * 10 };
      for (const k of BASES) {
        for (const [x, y] of keyPoints(k)) {
          expect(base(k, x)).toBeCloseTo(y, 12);
          const [X, Y] = mapPoint(t, x, y);
          expect(transformed(k, t, X)).toBeCloseTo(Y, 9);
          const back = unmapPoint(t, X, Y);
          expect(back[0]).toBeCloseTo(x, 9);
          expect(back[1]).toBeCloseTo(y, 9);
        }
      }
    }
  });
  it('Schrittfolge: erst b, dann c, dann a, dann d', () => {
    const s = stages({ a: 2, b: 3, c: 1, d: -2 });
    expect(s.map((t) => [t.a, t.b, t.c, t.d])).toEqual([
      [1, 1, 0, 0],
      [1, 3, 0, 0],
      [1, 3, 1, 0],
      [2, 3, 1, 0],
      [2, 3, 1, -2],
    ]);
  });
});
