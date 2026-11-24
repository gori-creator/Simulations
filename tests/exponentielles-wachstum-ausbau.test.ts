import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { characteristicTime, checkGrowth, DATASETS, exponential, fitError, fromTwoPoints, growthTask } from '../src/simulations/mathematik/exponentielles-wachstum/model';

describe('Exponentielles Wachstum: Messwerte', () => {
  it('aus zwei Punkten', () => {
    const r = fromTwoPoints(0, 100, 2, 144);
    expect(r.a).toBeCloseTo(100);
    expect(r.b).toBeCloseTo(1.2);
    expect(r.p).toBeCloseTo(20);
    const s = fromTwoPoints(2, 50, 4, 12.5);
    expect(s.b).toBeCloseTo(0.5);
    expect(s.a).toBeCloseTo(200);
  });
  it('Beispieldaten passen gut, aber nicht exakt', () => {
    const expected = { bakterien: 40, tee: -4, medikament: -15 } as const;
    for (const [id, ds] of Object.entries(DATASETS)) {
      const first = ds.points[0]!;
      const err = fitError(ds.points, first[1], expected[id as keyof typeof expected]);
      expect(err).toBeLessThan(0.03);
      expect(err).toBeGreaterThan(0);
      for (const [t] of ds.points) expect(t).toBeLessThanOrEqual(ds.span);
    }
    expect(fitError([[0, 10]], 10, 5)).toBe(0);
  });
});

describe('Exponentielles Wachstum: Üben', () => {
  it('Aufgabenarten wechseln, Lösungen stimmen', () => {
    for (let q = 1; q <= 120; q++) {
      const t = growthTask(q, seededRandom(q));
      if (q % 2 === 1) {
        expect(t.kind).toBe('value');
        expect(t.answer).toBeCloseTo(exponential(t.a, t.p, t.t));
      } else if (q % 4 === 2) {
        expect(t.kind).toBe('percent');
        expect(t.answer).toBe(t.p);
      } else {
        expect(t.kind).toBe('doubling');
        expect(t.answer).toBeCloseTo(characteristicTime(t.p));
        expect(t.answer).toBeGreaterThan(0);
      }
    }
  });
  it('Prüfung: Runden erlaubt, Minus als − oder -', () => {
    const t = { kind: 'value' as const, a: 1000, p: 5, t: 3, answer: 1157.625 };
    expect(checkGrowth(t, '1157,63').ok).toBe(true);
    expect(checkGrowth(t, '1150').ok).toBe(false);
    const d = { kind: 'percent' as const, a: 200, p: -20, t: 1, answer: -20 };
    expect(checkGrowth(d, '−20 %').ok).toBe(true);
    expect(checkGrowth(d, '20').ok).toBe(false);
  });
});
