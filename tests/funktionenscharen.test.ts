import { describe, expect, it } from 'vitest';
import { FAMS, slope, type FamKey } from '../src/simulations/mathematik/funktionenscharen/model';

describe('Modell: Funktionenscharen', () => {
  it('x³ − kx mit k = 3: H(−1 | 2), T(1 | −2); Ortskurve y = −2x³', () => {
    const e = FAMS.cub.extrema(3);
    expect(e[0]!.x).toBeCloseTo(-1, 12);
    expect(e[0]!.y).toBeCloseTo(2, 12);
    expect(e[1]!.y).toBeCloseTo(-2, 12);
    expect(FAMS.cub.locus(1)).toBe(-2);
    expect(FAMS.cub.extrema(-1)).toEqual([]);
  });
  it('x² − 2kx + k: Scheitel (k | k − k²), alle Parabeln durch (½ | ¼)', () => {
    expect(FAMS.par.extrema(2)).toEqual([{ x: 2, y: -2, kind: 'min' }]);
    for (const k of [-2, 0, 1, 3]) expect(FAMS.par.f(k, 0.5)).toBeCloseTo(0.25, 12);
  });
  it('x · e^(−kx): Hochpunkt (1/k | 1/(ke)) auf y = x/e', () => {
    const e = FAMS.exp.extrema(2)[0]!;
    expect(e.x).toBe(0.5);
    expect(e.y).toBeCloseTo(0.5 / Math.E, 12);
    expect(FAMS.exp.extrema(-1)[0]!.kind).toBe('min');
  });
  it('kx² − x⁴: Hochpunkte (±√(k/2) | k²/4) auf y = x⁴', () => {
    const e = FAMS.quart.extrema(2);
    expect(e[2]!.x).toBeCloseTo(1, 12);
    expect(e[2]!.y).toBe(1);
    expect(FAMS.quart.locus(1)).toBe(1);
  });
  it('Plausibilität: Extrempunkte liegen auf der Kurve, f′ = 0, Ortskurve und gemeinsame Punkte stimmen', () => {
    for (const key of ['cub', 'par', 'exp', 'quart'] as FamKey[]) {
      const fam = FAMS[key];
      for (let i = 0; i < 40; i++) {
        const k = Math.round((Math.random() * 6 - 3) * 10) / 10;
        for (const e of fam.extrema(k)) {
          expect(fam.f(k, e.x)).toBeCloseTo(e.y, 9);
          expect(Math.abs(slope(fam, k, e.x))).toBeLessThan(1e-5);
          if (e.kind !== 'saddle' && !(key === 'quart' && e.x === 0)) expect(fam.locus(e.x)).toBeCloseTo(e.y, 9);
        }
        for (const [x, y] of fam.common) expect(fam.f(k, x)).toBeCloseTo(y, 12);
      }
    }
  });
});
