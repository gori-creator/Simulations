import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { evaluate, maxDifference, PI_TWELFTH, stageParams, targetCurve, type SineParams } from '../src/simulations/mathematik/sinusfunktion/model';

const sp: SineParams = { base: 'sin', a: 2, b: 2, c: Math.PI / 4, d: 1 };

describe('Modell: Sinusfunktion – Schritt für Schritt', () => {
  it('beginnt mit der Grundfunktion und endet mit der Zielfunktion', () => {
    expect(stageParams(sp, 0)).toEqual({ base: 'sin', a: 1, b: 1, c: 0, d: 0 });
    expect(stageParams(sp, 4)).toEqual(sp);
  });
  it('nimmt nacheinander a, b, c und d dazu', () => {
    expect(stageParams(sp, 1)).toEqual({ base: 'sin', a: 2, b: 1, c: 0, d: 0 });
    expect(stageParams(sp, 2)).toEqual({ base: 'sin', a: 2, b: 2, c: 0, d: 0 });
    expect(stageParams(sp, 3)).toEqual({ base: 'sin', a: 2, b: 2, c: Math.PI / 4, d: 0 });
    // halb übergeblendet
    expect(stageParams(sp, 4, 0.5).d).toBeCloseTo(0.5, 12);
  });
  it('Hochpunkt von 2 · sin(2(x − π/4)) + 1 liegt bei x = π/2 mit y = 3', () => {
    expect(evaluate(sp, Math.PI / 2)).toBeCloseTo(3, 12);
  });
});

describe('Modell: Sinusfunktion – Kurve treffen', () => {
  it('erkennt gleiche Kurven, auch in anderer Schreibweise', () => {
    // −sin(x) = sin(x − π)
    const p1: SineParams = { base: 'sin', a: -1, b: 1, c: 0, d: 0 };
    const p2: SineParams = { base: 'sin', a: 1, b: 1, c: Math.PI, d: 0 };
    expect(maxDifference(p1, p2)).toBeLessThan(1e-9);
    // cos(x) = sin(x + π/2)
    expect(maxDifference({ base: 'cos', a: 1, b: 1, c: 0, d: 0 }, { base: 'sin', a: 1, b: 1, c: -Math.PI / 2, d: 0 })).toBeLessThan(1e-9);
    expect(maxDifference(p1, { ...p1, d: 0.5 })).toBeCloseTo(0.5, 9);
  });
  it('erzeugt Zielkurven im sichtbaren Bereich', () => {
    for (let q = 1; q <= 200; q++) {
      const t = targetCurve(q, seededRandom(q * 6151 + 3));
      expect(Math.abs(t.a) + Math.abs(t.d)).toBeLessThanOrEqual(3.5);
      expect(t.b).toBeGreaterThan(0);
      expect(Number.isInteger(t.cPi)).toBe(true);
      expect(Math.abs(t.cPi * PI_TWELFTH)).toBeLessThanOrEqual(Math.PI / 2 + 1e-9);
      if (q <= 2) expect([t.b, t.cPi]).toEqual([1, 0]);
    }
  });
});
