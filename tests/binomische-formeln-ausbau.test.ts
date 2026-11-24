import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { completeSquare, linText, mentalProduct, mentalSquare, polyText, termQuiz } from '../src/simulations/mathematik/binomische-formeln/model';

describe('Modell: Binomische Formeln – Kopfrechnen', () => {
  it('49² = (50 − 1)² = 2500 − 100 + 1 = 2401', () => {
    expect(mentalSquare(49)).toEqual({ r: 50, d: -1, r2: 2500, twoRD: -100, d2: 1, result: 2401 });
  });
  it('72² = (70 + 2)² = 4900 + 280 + 4 = 5184', () => {
    const m = mentalSquare(72);
    expect(m.r2 + m.twoRD + m.d2).toBe(5184);
    expect(m.result).toBe(5184);
  });
  it('52 · 48 = 50² − 2² = 2496', () => {
    expect(mentalProduct(50, 2)).toEqual({ x: 52, y: 48, r2: 2500, d2: 4, result: 2496 });
  });
});

describe('Modell: Binomische Formeln – quadratische Ergänzung', () => {
  it('x² + 6x + 5 = (x + 3)² − 4, Scheitel (−3 | −4)', () => {
    expect(completeSquare(6, 5)).toEqual({ h: 3, h2: 9, sx: -3, sy: -4 });
  });
  it('x² − 4x + 1 = (x − 2)² − 3', () => {
    const c = completeSquare(-4, 1);
    expect([c.sx, c.sy]).toEqual([2, -3]);
  });
});

describe('Modell: Binomische Formeln – Termquiz', () => {
  it('schreibt Terme mit echtem Minus', () => {
    expect(polyText(4, -12, 9)).toBe('4x² − 12x + 9');
    expect(polyText(1, 0, -25)).toBe('x² − 25');
    expect(linText(3, -2)).toBe('(3x − 2)');
  });
  it('hat immer genau eine richtige und vier verschiedene Antworten', () => {
    for (let q = 1; q <= 600; q++) {
      const t = termQuiz(q, seededRandom(q * 3301 + 11));
      expect(t.options.filter((o) => o.ok).length).toBe(1);
      expect(new Set(t.options.map((o) => o.text)).size).toBe(4);
      expect(t.kind).toBe(q % 2 === 1 ? 'expand' : 'factor');
    }
  });
});
