import { describe, expect, it } from 'vitest';
import { DEFAULT_VIEW, evaluate, firstPeakOffset, fitView, period, range, type SineParams } from '../src/simulations/mathematik/sinusfunktion/model';

const sp = (over: Partial<SineParams> = {}): SineParams => ({ base: 'sin', a: 1, b: 1, c: 0, d: 0, ...over });

describe('sinusfunktion: Funktionswerte', () => {
  it('f(x) = 2 sin(2(x − π/4)) + 1 (Aufgabe 1)', () => {
    const p = sp({ a: 2, b: 2, c: Math.PI / 4, d: 1 });
    expect(evaluate(p, Math.PI / 4)).toBeCloseTo(1, 12); // Beginn der Periode auf der Mittellinie
    expect(evaluate(p, Math.PI / 2)).toBeCloseTo(3, 12); // Hochpunkt nach einer Viertelperiode
    expect(evaluate(p, Math.PI)).toBeCloseTo(-1, 12); // Tiefpunkt
    expect(evaluate(p, 0)).toBeCloseTo(-1, 12);
  });

  it('a < 0 spiegelt an der Mittellinie', () => {
    const up = sp({ a: 2, d: 1 });
    const down = sp({ a: -2, d: 1 });
    for (const x of [-2, -0.3, 0.7, 1.5, 4]) expect(evaluate(down, x) - 1).toBeCloseTo(-(evaluate(up, x) - 1), 12);
  });

  it('Kosinus ist der um π/2 nach links verschobene Sinus', () => {
    for (const x of [-3, -1, 0, 0.5, 2, 5]) {
      expect(evaluate(sp({ c: -Math.PI / 2 }), x)).toBeCloseTo(evaluate(sp({ base: 'cos' }), x), 12);
    }
  });

  it('Tageslängen-Modell: Maximum ≈ 16 h im Juni, Minimum ≈ 8,4 h im Dezember', () => {
    const p = sp({ a: 3.8, b: 0.52, c: 2.7, d: 0.2 });
    const peak = p.c + firstPeakOffset('sin', p.b);
    expect(peak).toBeCloseTo(5.72, 2); // 2,7 + 12,08/4
    expect(12 + evaluate(p, peak)).toBeCloseTo(16, 12);
    expect(12 + evaluate(p, peak + period(p.b) / 2)).toBeCloseTo(8.4, 12);
  });
});

describe('sinusfunktion: Periode und Wertemenge', () => {
  it('p = 2π/b', () => {
    expect(period(1)).toBeCloseTo(2 * Math.PI, 12);
    expect(period(2)).toBeCloseTo(Math.PI, 12);
    expect(period(3)).toBeCloseTo((2 * Math.PI) / 3, 12);
    expect(period(0.5)).toBeCloseTo(4 * Math.PI, 12);
    expect(period(0.52)).toBeCloseTo(12.083, 3);
  });

  it('die Funktion wiederholt sich nach genau einer Periode', () => {
    const p = sp({ a: -1.7, b: 2.35, c: 0.4, d: -0.6 });
    for (const x of [-2, 0, 1.1, 3]) expect(evaluate(p, x + period(p.b))).toBeCloseTo(evaluate(p, x), 10);
  });

  it('W = [d − |a|; d + |a|], auch für a < 0', () => {
    expect(range({ a: 2, d: 1 })).toEqual([-1, 3]);
    expect(range({ a: -2.5, d: -4 })).toEqual([-6.5, -1.5]);
    expect(range({ a: 0, d: 0.5 })).toEqual([0.5, 0.5]);
  });

  it('erster Hochpunkt: Sinus nach einer Viertelperiode, Kosinus sofort', () => {
    expect(firstPeakOffset('sin', 2)).toBeCloseTo(Math.PI / 4, 12);
    expect(firstPeakOffset('cos', 2)).toBe(0);
  });
});

describe('sinusfunktion: Ausschnitt für Links und Beispiele', () => {
  const contains = (v: { x: [number, number]; y: [number, number] }, p: SineParams) => {
    const [lo, hi] = range(p);
    expect(v.x[0]).toBeLessThanOrEqual(p.c);
    expect(v.x[1]).toBeGreaterThanOrEqual(p.c + period(p.b));
    expect(v.y[0]).toBeLessThanOrEqual(lo);
    expect(v.y[1]).toBeGreaterThanOrEqual(hi);
  };

  it('Standardzustand bleibt beim Standardausschnitt', () => {
    expect(fitView(sp(), true)).toEqual(DEFAULT_VIEW);
    expect(fitView(sp({ a: 2, b: 2, c: Math.PI / 4, d: 1 }), true)).toEqual(DEFAULT_VIEW);
  });

  it('Modell Tageslänge: ganzes Jahr ab t = 0 sichtbar', () => {
    const p = sp({ a: 3.8, b: 0.52, c: 2.7, d: 0.2 });
    const v = fitView(p, true);
    contains(v, p);
    expect(v.x[0]).toBeLessThanOrEqual(0);
    expect(v.x[1] - v.x[0]).toBeLessThan(18);
  });

  it('enthält die erste Periode und die Wertemenge in allen Ecken des Reglerbereichs', () => {
    for (const b of [0.2, 0.5, 1, 4]) {
      for (const c of [-8, 0, 8]) {
        for (const [a, d] of [[4, 4], [-4, -4], [1, 0]] as const) {
          const p = sp({ a, b, c, d });
          if (period(b) < 30) contains(fitView(p, true), p);
        }
      }
    }
  });
});
