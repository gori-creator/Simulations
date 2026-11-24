import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { checkLaw, insideFunnel, lawTask, simulateRun } from '../src/simulations/mathematik/gesetz-grosse-zahlen/model';

describe('Gesetz der großen Zahlen: viele Reihen', () => {
  it('etwa 95 % der Reihen liegen im Trichter', () => {
    const rnd = seededRandom(5);
    const values = Array.from({ length: 400 }, () => simulateRun(0.5, 1000, rnd).k / 1000);
    const share = insideFunnel(values, 0.5, 1000) / values.length;
    expect(share).toBeGreaterThan(0.9);
    expect(share).toBeLessThan(0.99);
  });
  it('Verlauf endet bei k/n', () => {
    const r = simulateRun(0.3, 50, seededRandom(1));
    expect(r.history).toHaveLength(50);
    expect(r.history[49]).toBeCloseTo(r.k / 50, 12);
  });
});

describe('Gesetz der großen Zahlen: üben', () => {
  it('Aufgaben', () => {
    for (let q = 1; q <= 100; q++) {
      const t = lawTask(q, seededRandom(q));
      if (q % 2 === 1) {
        expect(t.kind).toBe('expected');
        expect(Number.isInteger(t.answer)).toBe(true);
      } else {
        expect(t.kind).toBe('estimate');
        expect(t.answer).toBeCloseTo(t.k / t.n, 12);
      }
    }
  });
  it('Prüfung: Dezimal oder Prozent', () => {
    const e = { kind: 'estimate' as const, exp: 'tack' as const, face: 1, n: 500, p: 0.65, k: 318, answer: 0.636 };
    expect(checkLaw(e, '0,636').ok).toBe(true);
    expect(checkLaw(e, '63,6 %').ok).toBe(true);
    expect(checkLaw(e, '64').ok).toBe(true);
    expect(checkLaw(e, '0,65').ok).toBe(false);
    const x = { kind: 'expected' as const, exp: 'die' as const, face: 6, n: 600, p: 1 / 6, k: 0, answer: 100 };
    expect(checkLaw(x, '100').ok).toBe(true);
    expect(checkLaw(x, '120').ok).toBe(false);
  });
});
