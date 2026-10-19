import { describe, expect, it } from 'vitest';
import { COILS, currentForRadius, electronSpeed, fitSpecificCharge, helmholtzField, lorentzForce, orbitRadius, SPECIFIC_CHARGE, specificChargeFrom, E_CHARGE } from '../src/simulations/physik/lorentzkraft/model';

describe('Modell: Lorentzkraft und Fadenstrahlrohr', () => {
  it('e/m ≈ 1,76 · 10¹¹ C/kg', () => {
    expect(SPECIFIC_CHARGE / 1e11).toBeCloseTo(1.7588, 4);
  });

  it('Helmholtzspulen n = 130, R = 15 cm, I = 1 A → B ≈ 0,779 mT', () => {
    expect(helmholtzField(COILS.n, 1, COILS.R) * 1e3).toBeCloseTo(0.7793, 3);
    // proportional zum Strom
    expect(helmholtzField(130, 2, 0.15)).toBeCloseTo(2 * helmholtzField(130, 1, 0.15), 15);
  });

  it('U = 200 V, B = 1 mT → r ≈ 4,77 cm', () => {
    expect(orbitRadius(200, 1e-3) * 100).toBeCloseTo(4.769, 3);
    expect(orbitRadius(200, 0)).toBe(Infinity);
    // r = m v / (e B)
    const v = electronSpeed(200);
    expect(v / 1e6).toBeCloseTo(8.387, 2);
    expect(v / (SPECIFIC_CHARGE * 1e-3)).toBeCloseTo(orbitRadius(200, 1e-3), 12);
  });

  it('Lorentzkraft als Zentripetalkraft: e v B = m v² / r', () => {
    const v = electronSpeed(200);
    const F = lorentzForce(-E_CHARGE, v, 1e-3);
    expect(F).toBeCloseTo(1.344e-15, 17);
    const r = orbitRadius(200, 1e-3);
    expect(F).toBeCloseTo(((E_CHARGE / SPECIFIC_CHARGE) * v * v) / r, 25);
  });

  it('e/m aus Messwerten zurückrechnen und Messreihe ausgleichen', () => {
    const r = orbitRadius(250, 1.2e-3);
    expect(specificChargeFrom(250, 1.2e-3, r) / 1e11).toBeCloseTo(1.7588, 4);
    const pts = [150, 200, 250, 300].map((U) => {
      const I = currentForRadius(U, 0.04);
      return { U, B: helmholtzField(COILS.n, I, COILS.R), r: 0.04 };
    });
    expect(fitSpecificCharge(pts)! / 1e11).toBeCloseTo(1.7588, 4);
    expect(fitSpecificCharge([])).toBeNull();
  });
});
