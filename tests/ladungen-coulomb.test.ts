import { describe, expect, it } from 'vitest';
import { coulomb, E_CHARGE, electroscopeAngle, K, rubCharge } from '../src/simulations/physik/ladungen-coulomb/model';

describe('Ladungen und Coulomb', () => {
  it('Coulombkraft: doppelter Abstand, ein Viertel der Kraft', () => {
    expect(coulomb(1e-6, 1e-6, 0.1)).toBeCloseTo(0.8988, 3);
    expect(coulomb(1e-6, 1e-6, 0.2) / coulomb(1e-6, 1e-6, 0.1)).toBeCloseTo(0.25, 12);
    expect(coulomb(1e-6, -1e-6, 0.1)).toBeLessThan(0);
  });

  it('Wasserstoffatom: Kraft zwischen Kern und Elektron', () => {
    expect(Math.abs(coulomb(E_CHARGE, -E_CHARGE, 5.29e-11))).toBeCloseTo(8.24e-8, 9);
    expect(K).toBeCloseTo(8.99e9, -7);
  });

  it('Reiben: Glas gegen Seide – Glas positiv; Gummi gegen Wolle – Gummi negativ', () => {
    expect(rubCharge('glass', 'silk', 10).a).toBeGreaterThan(0);
    expect(rubCharge('rubber', 'wool', 10).a).toBeLessThan(0);
    const r = rubCharge('pvc', 'hair', 5);
    expect(r.a + r.b).toBe(0);
  });

  it('Elektroskop schlägt bei beiden Vorzeichen gleich aus', () => {
    expect(electroscopeAngle(4, 16)).toBe(electroscopeAngle(-4, 16));
    expect(electroscopeAngle(100, 16)).toBeCloseTo(Math.PI / 3, 12);
  });
});
