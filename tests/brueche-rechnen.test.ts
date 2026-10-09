import { describe, expect, it } from 'vitest';
import { compare, crossCancel, divide, gcd, lcm, measure, mixed, multiply, reciprocal, reduce, value } from '../src/simulations/mathematik/brueche-rechnen/model';

const f = (z: number, n: number) => ({ z, n });

describe('Modell: Brüche multiplizieren (Rechteckmodell)', () => {
  it('Zähler mal Zähler, Nenner mal Nenner', () => {
    const p = multiply(f(2, 3), f(3, 4));
    expect(p.raw).toEqual(f(6, 12));
    expect(p.reduced).toEqual(f(1, 2));
    expect(p.cells).toBe(6);
    expect(p.cellsPerWhole).toBe(12);
    expect(multiply(f(3, 2), f(4, 5)).reduced).toEqual(f(6, 5));
    expect(multiply(f(1, 2), f(1, 3)).reduced).toEqual(f(1, 6));
  });

  it('Multiplizieren mit einer Zahl kleiner als 1 verkleinert, größer als 1 vergrößert', () => {
    const x = f(3, 4);
    expect(compare(multiply(f(2, 3), x).reduced, x)).toBe(-1);
    expect(compare(multiply(f(3, 2), x).reduced, x)).toBe(1);
    expect(compare(multiply(f(5, 5), x).reduced, x)).toBe(0);
  });

  it('kürzt vor dem Ausmultiplizieren über Kreuz', () => {
    const c = crossCancel(f(4, 9), f(3, 8));
    expect(c.g1).toBe(4);
    expect(c.g2).toBe(3);
    expect(c.x).toEqual(f(1, 3));
    expect(c.y).toEqual(f(1, 2));
    expect(c.result).toEqual(f(1, 6));
    // Ergebnis stimmt immer mit dem gekürzten Produkt überein
    for (let a = 1; a <= 12; a++)
      for (let b = 1; b <= 12; b++)
        for (const [c2, d] of [
          [1, 2],
          [3, 4],
          [5, 6],
          [7, 12],
          [9, 10],
          [8, 3],
        ] as const) {
          expect(crossCancel(f(a, b), f(c2, d)).result).toEqual(multiply(f(a, b), f(c2, d)).reduced);
        }
  });

  it('kürzt auch innerhalb eines Bruchs', () => {
    const c = crossCancel(f(6, 8), f(2, 3));
    expect(c.gx).toBe(2);
    expect(c.result).toEqual(f(1, 2));
  });
});

describe('Modell: Brüche dividieren (Messen, Kehrwert)', () => {
  it('Kehrwert und Division', () => {
    expect(reciprocal(f(2, 3))).toEqual(f(3, 2));
    const d = divide(f(3, 4), f(2, 3));
    expect(d.raw).toEqual(f(9, 8));
    expect(d.reduced).toEqual(f(9, 8));
    expect(divide(f(2, 1), f(2, 3)).reduced).toEqual(f(3, 1));
    expect(divide(f(3, 4), f(3, 1)).reduced).toEqual(f(1, 4));
  });

  it('misst über den gemeinsamen Nenner: 3/4 : 2/3 = 9 : 8', () => {
    const m = measure(f(3, 4), f(2, 3));
    expect(m.N).toBe(12);
    expect(m.A).toBe(9);
    expect(m.C).toBe(8);
    expect(m.full).toBe(1);
    expect(m.restParts).toBe(1);
    expect(m.restOfStrip).toEqual(f(1, 8));
    expect(m.quotient).toEqual(f(9, 8));
  });

  it('passt genau bzw. gar nicht ganz hinein', () => {
    expect(measure(f(3, 4), f(1, 4))).toMatchObject({ full: 3, restParts: 0, quotient: f(3, 1) });
    expect(measure(f(1, 4), f(3, 4))).toMatchObject({ full: 0, restOfStrip: f(1, 3), quotient: f(1, 3) });
  });

  it('Messen und Kehrwert-Regel liefern immer dasselbe', () => {
    for (let a = 1; a <= 12; a++)
      for (let b = 1; b <= 12; b++)
        for (let c = 1; c <= 12; c++)
          for (const d of [1, 2, 3, 5, 8, 12]) {
            const m = measure(f(a, b), f(c, d));
            expect(m.quotient).toEqual(divide(f(a, b), f(c, d)).reduced);
            // ganze Streifen + Rest ergeben den Quotienten
            expect(m.full + value(m.restOfStrip)).toBeCloseTo(value(f(a, b)) / value(f(c, d)), 10);
          }
  });
});

describe('Modell: Hilfsfunktionen', () => {
  it('ggT, kgV, Kürzen, gemischte Zahl', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(lcm(4, 6)).toBe(12);
    expect(reduce(f(6, 12))).toEqual(f(1, 2));
    expect(reduce(f(0, 5))).toEqual(f(0, 1));
    expect(mixed(f(9, 8))).toEqual({ whole: 1, rest: f(1, 8) });
    expect(mixed(f(3, 1))).toEqual({ whole: 3, rest: f(0, 1) });
  });
});
