import { describe, expect, it } from 'vitest';
import { omegaAfter, rollAcceleration, rotEnergy, SHAPE, skaterInertia } from '../src/simulations/physik/drehimpuls/model';

describe('Drehimpuls', () => {
  it('Arme anziehen: J kleiner, ω größer, L gleich', () => {
    const J1 = skaterInertia(50, 0.15, 4, 0.8);
    const J2 = skaterInertia(50, 0.15, 4, 0.2);
    const w2 = omegaAfter(J1, 2, J2);
    expect(J1 * 2).toBeCloseTo(J2 * w2, 10);
    expect(w2).toBeGreaterThan(2 * 3);
    // Energie steigt: die Arme werden gegen die Fliehkraft herangezogen
    expect(rotEnergy(J2, w2)).toBeGreaterThan(rotEnergy(J1, 2));
  });

  it('Wettrollen: Kugel vor Scheibe vor Ring', () => {
    const a = (k: number) => rollAcceleration(k, Math.PI / 6);
    expect(a(SHAPE.ball)).toBeGreaterThan(a(SHAPE.disk));
    expect(a(SHAPE.disk)).toBeGreaterThan(a(SHAPE.ring));
    expect(a(SHAPE.ring)).toBeCloseTo(9.81 * 0.5 * 0.5, 10);
    expect(a(SHAPE.box)).toBeCloseTo(9.81 * 0.5, 10);
  });
});
