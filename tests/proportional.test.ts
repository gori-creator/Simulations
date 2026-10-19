import { describe, expect, it } from 'vitest';
import { check, product, quotient, ruleFactors, value, type Relation } from '../src/simulations/mathematik/proportional/model';

const apples: Relation = { kind: 'dir', k: 2.5, b: 0 };
const bed: Relation = { kind: 'ind', k: 12, b: 0 };
const taxi: Relation = { kind: 'lin', k: 2, b: 3 };

describe('Modell: Proportionalität', () => {
  it('direkt: 3 kg Äpfel zu 2,50 €/kg kosten 7,50 €', () => {
    expect(value(apples, 3)).toBe(7.5);
    expect(quotient(apples, 4)).toBe(2.5);
    expect(ruleFactors(apples, 1, 3)).toEqual({ fx: 3, fy: 3 });
  });
  it('indirekt: 3 Personen brauchen 4 h, 4 Personen 3 h', () => {
    expect(value(bed, 3)).toBe(4);
    expect(value(bed, 4)).toBe(3);
    expect(product(bed, 6)).toBe(12);
    const f = ruleFactors(bed, 1, 3);
    expect(f.fx).toBe(3);
    expect(f.fy).toBeCloseTo(1 / 3, 12);
  });
  it('Taxi: 3 km kosten 9 €, nicht das Dreifache von 5 €', () => {
    expect(value(taxi, 1)).toBe(5);
    expect(value(taxi, 3)).toBe(9);
    expect(ruleFactors(taxi, 1, 3).fy).toBeCloseTo(1.8, 12);
  });
  it('Tabellentest: quotientengleich bzw. produktgleich', () => {
    const t = (r: Relation) => check([1, 2, 3, 4, 6].map((x) => [x, value(r, x)] as [number, number]));
    expect(t(apples)).toEqual({ quotient: true, product: false });
    expect(t(bed)).toEqual({ quotient: false, product: true });
    expect(t(taxi)).toEqual({ quotient: false, product: false });
  });
  it('Plausibilität: Verdoppeln von x verdoppelt bzw. halbiert y', () => {
    for (let k = 0.5; k <= 48; k += 3.7) {
      for (let x = 0.5; x <= 12; x += 0.5) {
        expect(value({ kind: 'dir', k, b: 0 }, 2 * x)).toBeCloseTo(2 * value({ kind: 'dir', k, b: 0 }, x), 9);
        expect(value({ kind: 'ind', k, b: 0 }, 2 * x)).toBeCloseTo(value({ kind: 'ind', k, b: 0 }, x) / 2, 9);
      }
    }
  });
});
