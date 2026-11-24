import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { checkCircleAnswer, circleTask, fromRadius, OBJECTS, parseNumber, slopeThroughOrigin, toRadius } from '../src/simulations/mathematik/kreiszahl-pi/model';

describe('Kreiszahl π: Messen', () => {
  it('jede Messung liegt nahe bei π, aber nicht exakt', () => {
    for (const o of OBJECTS) {
      expect(Math.abs(o.u / o.d - Math.PI)).toBeLessThan(0.15);
      expect(Math.abs(o.u - Math.PI * o.d)).toBeGreaterThan(0.01);
    }
  });
  it('die Ausgleichsgerade hat fast genau Steigung π', () => {
    expect(slopeThroughOrigin(OBJECTS)).toBeCloseTo(Math.PI, 1);
    expect(slopeThroughOrigin([{ d: 2, u: 2 * Math.PI }])).toBeCloseTo(Math.PI, 12);
    expect(slopeThroughOrigin([])).toBeNaN();
  });
});

describe('Kreiszahl π: Üben', () => {
  it('Radius hin und zurück', () => {
    for (const q of ['d', 'r', 'U', 'A'] as const) expect(toRadius(q, fromRadius(q, 3.7))).toBeCloseTo(3.7, 12);
    expect(fromRadius('U', 1)).toBeCloseTo(2 * Math.PI);
    expect(fromRadius('A', 2)).toBeCloseTo(4 * Math.PI);
  });
  it('die ersten Aufgaben gehen vorwärts, später auch rückwärts', () => {
    const first = [1, 2, 3, 4].map((q) => circleTask(q, seededRandom(q)));
    expect(first.map((t) => `${t.given}${t.find}`)).toEqual(['dU', 'rA', 'rU', 'dA']);
    const backward = Array.from({ length: 40 }, (_, i) => circleTask(6 + 2 * i, seededRandom(i))).filter((t) => t.given === 'U' || t.given === 'A');
    expect(backward.length).toBe(40);
  });
  it('Lösungen stimmen und Werte bleiben handlich', () => {
    for (let q = 1; q <= 300; q++) {
      const t = circleTask(q, seededRandom(q * 31 + 7));
      expect(t.answer).toBeCloseTo(fromRadius(t.find, toRadius(t.given, t.value)), 12);
      expect(t.value).toBeGreaterThan(0);
      expect(t.value).toBeLessThan(1000);
      expect(Math.round(t.value * 10) / 10).toBeCloseTo(t.value, 9);
    }
  });
  it('Antwort mit π ≈ 3,14 und gerundet zählt, grob daneben nicht', () => {
    const t = { given: 'd' as const, value: 10, find: 'U' as const, answer: 10 * Math.PI };
    expect(checkCircleAnswer(t, '31,4').ok).toBe(true);
    expect(checkCircleAnswer(t, '31.42 cm').ok).toBe(true);
    expect(checkCircleAnswer(t, '30').ok).toBe(false);
    expect(checkCircleAnswer(t, '').got).toBeNull();
    expect(parseNumber('12.732')).toBeCloseTo(12.732);
    expect(parseNumber('U = 12,5')).toBeCloseTo(12.5);
  });
});
