import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { binomialPmf, checkGalton, galtonTask } from '../src/simulations/mathematik/galtonbrett/model';

describe('Galtonbrett: Üben', () => {
  it('Aufgabenarten und Lösungen', () => {
    for (let q = 1; q <= 200; q++) {
      const t = galtonTask(q, seededRandom(q));
      expect(t.kind).toBe(q % 2 === 1 ? 'paths' : 'prob');
      expect(t.k).toBeGreaterThanOrEqual(0);
      expect(t.k).toBeLessThanOrEqual(t.n);
      if (t.kind === 'prob') expect(t.answer).toBeCloseTo(binomialPmf(t.n, t.k, t.p) * 100, 10);
      else expect(Number.isInteger(t.answer)).toBe(true);
    }
    expect(galtonTask(2, seededRandom(2)).p).toBe(0.5);
  });
  it('Prüfung', () => {
    const paths = { kind: 'paths' as const, n: 4, p: 0.5, k: 2, answer: 6 };
    expect(checkGalton(paths, '6').ok).toBe(true);
    expect(checkGalton(paths, '5').ok).toBe(false);
    const prob = { kind: 'prob' as const, n: 4, p: 0.5, k: 2, answer: 37.5 };
    expect(checkGalton(prob, '37,5 %').ok).toBe(true);
    expect(checkGalton(prob, '37,6').ok).toBe(true);
    expect(checkGalton(prob, '0,375').ok).toBe(false);
    expect(checkGalton(prob, '').got).toBeNull();
  });
});
