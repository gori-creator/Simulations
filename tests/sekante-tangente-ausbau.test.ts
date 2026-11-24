import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { differenceQuotient, FUNCTIONS, fitTask, slopeAngleError, tangentGap } from '../src/simulations/mathematik/sekante-tangente/model';

describe('Modell: Sekante und Tangente – Ausbau', () => {
  it('Auto: s(t) = 0,1t² + 0,2t, Durchschnitt von 2 s bis 4 s ist 0,8 m/s, Tacho bei 3 s zeigt 0,8 m/s', () => {
    const car = FUNCTIONS.car;
    expect(car.f(4) - car.f(2)).toBeCloseTo(1.6, 12); // 2,4 − 0,8
    expect(differenceQuotient(car.f, 2, 2)).toBeCloseTo(0.8, 12);
    expect(car.df(3)).toBeCloseTo(0.8, 12);
  });
  it('Lupe: Abstand zur Tangente schrumpft quadratisch mit dem Fenster (x² bei x₀ = 1)', () => {
    // f(x) − t(x) = (x − 1)² → größte Abweichung w²
    expect(tangentGap(FUNCTIONS.x2, 1, 1)).toBeCloseTo(1, 9);
    expect(tangentGap(FUNCTIONS.x2, 1, 0.1)).toBeCloseTo(0.01, 9);
    expect(tangentGap(FUNCTIONS.x2, 1, 0.01)).toBeCloseTo(0.0001, 9);
  });
  it('Spiel: Aufgaben liegen an differenzierbaren Stellen, Fehler als Winkel', () => {
    for (let q = 1; q <= 100; q++) {
      const t = fitTask(seededRandom(q * 977 + 5));
      expect(Number.isFinite(FUNCTIONS[t.fn].df(t.x0))).toBe(true);
    }
    expect(slopeAngleError(1, 1)).toBe(0);
    expect(slopeAngleError(0, 1)).toBeCloseTo(45, 9);
  });
});
