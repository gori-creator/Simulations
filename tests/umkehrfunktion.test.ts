import { describe, expect, it } from 'vitest';
import { makeFn, mirror, mirrorPath, partner, type FnKey } from '../src/simulations/mathematik/umkehrfunktion/model';

describe('Modell: Umkehrfunktionen', () => {
  it('Schulbuchwerte: √4 = 2, ln e = 1, (3 + 1)/2 = 2, ∛(2 · 4) = 2', () => {
    expect(makeFn('sq', 'pos').inv!(4)).toBe(2);
    expect(makeFn('sq', 'neg').inv!(4)).toBe(-2);
    expect(makeFn('exp').inv!(Math.E)).toBeCloseTo(1, 12);
    expect(makeFn('lin').inv!(3)).toBe(2);
    expect(makeFn('cube').inv!(4)).toBeCloseTo(2, 12);
    expect(makeFn('hyp').inv!(4)).toBe(0.25);
  });
  it('x² auf ganz ℝ ist nicht umkehrbar: f(−2) = f(2)', () => {
    const f = makeFn('sq', 'all');
    expect(f.inv).toBeNull();
    expect(partner('sq', 'all', 2)).toBe(-2);
    expect(f.f(-2)).toBe(f.f(2));
  });
  it('Spiegelung an y = x tauscht die Koordinaten; Mittelpunkt liegt auf y = x', () => {
    expect(mirror([1, 3])).toEqual([3, 1]);
    const m = mirrorPath([1, 3], 0.5);
    expect(m[0]).toBe(m[1]);
  });
  it('Plausibilität: f⁻¹(f(x)) = x und f(f⁻¹(y)) = y im Definitionsbereich', () => {
    const cases: [FnKey, 'pos' | 'neg'][] = [
      ['lin', 'pos'],
      ['sq', 'pos'],
      ['sq', 'neg'],
      ['cube', 'pos'],
      ['exp', 'pos'],
      ['hyp', 'pos'],
    ];
    for (const [k, d] of cases) {
      const fn = makeFn(k, d);
      for (let i = 0; i < 50; i++) {
        let x = Math.random() * 6 - 3;
        x = Math.max(fn.lo, Math.min(fn.hi, x));
        if (fn.gap0 && Math.abs(x) < 0.05) continue;
        expect(fn.inv!(fn.f(x))).toBeCloseTo(x, 8);
      }
    }
  });
});
