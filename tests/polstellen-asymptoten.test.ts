import { describe, expect, it } from 'vitest';
import { analyze, divide, evalPoly, fromRoots, poleSides, reducedValue, value, type Rational } from '../src/simulations/mathematik/polstellen-asymptoten/model';

describe('Modell: Polstellen und Asymptoten', () => {
  it('f(x) = (x − 1)/(x + 2): Nullstelle 1, Polstelle −2 mit VZW, Asymptote y = 1', () => {
    const f: Rational = { a: 1, zeros: [1], poles: [-2] };
    const r = analyze(f);
    expect(r.zeros).toEqual([{ x: 1, k: 1 }]);
    expect(r.poles).toEqual([{ x: -2, k: 1, signChange: true }]);
    expect(r.kind).toBe('const');
    expect(r.asym[0]).toBeCloseTo(1, 12);
    expect(poleSides(f, -2)).toEqual({ left: 1, right: -1 });
    expect(value(f, 0)).toBeCloseTo(-0.5, 12);
  });
  it('doppelte Polstelle 1/(x − 1)²: ohne Vorzeichenwechsel, y = 0', () => {
    const f: Rational = { a: 1, zeros: [], poles: [1, 1] };
    const r = analyze(f);
    expect(r.poles).toEqual([{ x: 1, k: 2, signChange: false }]);
    expect(r.kind).toBe('zero');
    expect(poleSides(f, 1)).toEqual({ left: 1, right: 1 });
  });
  it('behebbare Lücke: (x² − 1)/(x − 1) = x + 1 mit Loch bei (1 | 2)', () => {
    const f: Rational = { a: 1, zeros: [1, -1], poles: [1] };
    const r = analyze(f);
    expect(r.holes).toEqual([{ x: 1, y: 2 }]);
    expect(r.poles).toEqual([]);
    expect(r.zeros).toEqual([{ x: -1, k: 1 }]);
    expect(Number.isNaN(value(f, 1))).toBe(true);
    expect(reducedValue(f, 1)).toBe(2);
  });
  it('schräge Asymptote: (x − 1)(x + 1)/(x − 2) = x + 2 + 3/(x − 2)', () => {
    const f: Rational = { a: 1, zeros: [1, -1], poles: [2] };
    const r = analyze(f);
    expect(r.kind).toBe('oblique');
    expect(r.asym).toEqual([2, 1]);
    expect(r.rest).toEqual([3]);
  });
  it('Zählergrad 3, Nennergrad 1: Näherungskurve (Parabel)', () => {
    const r = analyze({ a: 1, zeros: [0, 1, 2], poles: [-1] });
    expect(r.kind).toBe('curve');
    expect(r.asym.length).toBe(3);
  });
  it('Polynomdivision und Auswerten', () => {
    const p = fromRoots(2, [1, 2, 3]);
    expect(p).toEqual([-12, 22, -12, 2]);
    const { q, r } = divide(p, [1, 1]);
    for (const x of [-2, 0.5, 3, 7]) expect(evalPoly(q, x) * (x + 1) + evalPoly(r, x)).toBeCloseTo(evalPoly(p, x), 9);
  });
  it('Plausibilität: f(x) − Asymptote → 0 für große |x| (zufällige Funktionen)', () => {
    for (let i = 0; i < 60; i++) {
      const rnd = () => Math.round((Math.random() * 10 - 5) * 2) / 2;
      const n = 1 + Math.floor(Math.random() * 2);
      const m = Math.floor(Math.random() * (n + 2));
      const f: Rational = { a: 0.5 + Math.floor(Math.random() * 6) / 2, zeros: Array.from({ length: m }, rnd), poles: Array.from({ length: n }, rnd) };
      const r = analyze(f);
      for (const x of [1e6, -1e6]) {
        const d = value(f, x) - evalPoly(r.asym, x);
        expect(Math.abs(d)).toBeLessThan(0.01);
      }
    }
  });
});

describe('Sonderfall a = 0', () => {
  it('Nullfunktion mit Lücke: keine Polstelle, Loch auf der x-Achse', () => {
    const r = analyze({ a: 0, zeros: [1], poles: [-2] });
    expect(r.poles).toEqual([]);
    expect(r.holes).toEqual([{ x: -2, y: 0 }]);
    expect(r.gaps).toEqual([-2]);
  });
});
