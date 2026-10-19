import { describe, expect, it } from 'vitest';
import { check, classify, product, quizItem, QUIZ_CTX, quotient, ruleFactors, value, type Kind, type Relation } from '../src/simulations/mathematik/proportional/model';

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
  it('Kerze: 20 cm, 2 cm pro Stunde – je mehr Zeit, desto kürzer, aber nicht indirekt proportional', () => {
    const candle: Relation = { kind: 'lin', k: -2, b: 20 };
    expect(value(candle, 1)).toBe(18);
    expect(value(candle, 2)).toBe(16);
    // doppelte Zeit, aber nicht halbe Länge
    expect(value(candle, 2)).not.toBe(value(candle, 1) / 2);
    expect(classify([1, 2, 3, 4, 5].map((x) => [x, value(candle, x)] as [number, number]))).toBe('lin');
  });
  it('Fahrt über 240 km: 60 km/h → 4 h, 80 km/h → 3 h (produktgleich)', () => {
    const trip: Relation = { kind: 'ind', k: 240, b: 0 };
    expect(value(trip, 60)).toBe(4);
    expect(value(trip, 80)).toBe(3);
    expect(classify([20, 30, 40, 60, 80].map((x) => [x, value(trip, x)] as [number, number]))).toBe('ind');
  });
  it('Übungsaufgaben: reproduzierbar, alle Arten kommen vor, Einordnung stimmt mit der Art überein', () => {
    expect(quizItem(7)).toEqual(quizItem(7));
    const seen = new Set<Kind>();
    for (let seed = 1; seed <= 200; seed++) {
      const q = quizItem(seed);
      seen.add(q.kind);
      expect(QUIZ_CTX[q.kind][q.ctx]).toBeDefined();
      const pairs = q.xs.map((x) => [x, value(q, x)] as [number, number]);
      expect(classify(pairs)).toBe(q.kind);
      // Tabellenwerte sind „schön“: höchstens zwei Nachkommastellen
      for (const [, y] of pairs) expect(Math.abs(y * 100 - Math.round(y * 100))).toBeLessThan(1e-6);
    }
    expect(seen.size).toBe(3);
  });
});
