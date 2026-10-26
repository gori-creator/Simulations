import { describe, expect, it } from 'vitest';
import { COILS, currentForRadius, electronSpeed, fitSpecificCharge, helmholtzField, lorentzForce, M_E, orbitPeriod, orbitRadius, SPECIFIC_CHARGE, specificChargeFrom, E_CHARGE } from '../src/simulations/physik/lorentzkraft/model';

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

  it('Startzustand und Aufgabenwerte (U = 200 V, I = 1,4 A; Aufgaben 1–5)', () => {
    const B = helmholtzField(COILS.n, 1.4, COILS.R);
    expect(B * 1e3).toBeCloseTo(1.091, 3);
    expect(orbitRadius(200, B) * 100).toBeCloseTo(4.371, 2);
    expect(lorentzForce(E_CHARGE, electronSpeed(200), B) / 1e-15).toBeCloseTo(1.466, 2);
    // Aufgabe 2: I = 1,28 A → B ≈ 0,998 mT, r ≈ 4,78 cm
    const B2 = helmholtzField(COILS.n, 1.28, COILS.R);
    expect(B2 * 1e3).toBeCloseTo(0.9975, 3);
    expect(orbitRadius(200, B2) * 100).toBeCloseTo(4.781, 2);
    // Aufgabe 3: U = 250 V, I = 1,71 A trifft die Marke 8 cm, e/m ≈ 1,76 · 10¹¹ C/kg
    const B3 = helmholtzField(COILS.n, 1.71, COILS.R);
    expect(Math.abs(2 * orbitRadius(250, B3) * 100 - 8)).toBeLessThan(0.15);
    expect(specificChargeFrom(250, B3, 0.04) / 1e11).toBeCloseTo(1.76, 2);
    // Aufgabe 4: Umlaufzeit bei B = 1 mT ≈ 35,7 ns
    expect(orbitPeriod(1e-3) * 1e9).toBeCloseTo(35.72, 2);
    // Aufgabe 5: F/G ≈ 1,6 · 10¹⁴
    expect(lorentzForce(E_CHARGE, electronSpeed(200), B) / (M_E * 9.81) / 1e14).toBeCloseTo(1.64, 1);
  });

  it('Umlaufzeit unabhängig von U, Radius proportional zu v', () => {
    const B = 1.2e-3;
    for (const U of [100, 200, 300]) {
      const v = electronSpeed(U);
      const r = orbitRadius(U, B);
      expect((2 * Math.PI * r) / v).toBeCloseTo(orbitPeriod(B), 15);
    }
    expect(orbitRadius(300, B) / orbitRadius(100, B)).toBeCloseTo(Math.sqrt(3), 12);
    expect(orbitPeriod(0)).toBe(Infinity);
  });

  it('Sonderfälle: B = 0, v parallel zu B, Vorzeichen der Ladung, U = 0', () => {
    const v = electronSpeed(200);
    expect(lorentzForce(E_CHARGE, v, 0)).toBe(0);
    expect(lorentzForce(E_CHARGE, v, 1e-3, 0)).toBeCloseTo(0, 30);
    expect(lorentzForce(E_CHARGE, v, 1e-3, Math.PI / 6)).toBeCloseTo(lorentzForce(E_CHARGE, v, 1e-3) / 2, 25);
    // Betrag gleich für Elektron und Proton-Ladung
    expect(lorentzForce(-E_CHARGE, v, 1e-3)).toBe(lorentzForce(E_CHARGE, v, 1e-3));
    expect(electronSpeed(0)).toBe(0);
    expect(electronSpeed(-50)).toBe(0);
    expect(orbitRadius(0, 1e-3)).toBe(0);
  });

  it('Reglergrenzen: Marken 4 bis 10 cm erreichbar (2 cm nicht), automatische Messreihe trifft 8 cm', () => {
    // Spulenstrom 0 … 3 A, Schritt 0,01 A; U 100 … 300 V
    for (const m of [2, 4, 6, 8, 10]) {
      const reachable = [100, 150, 200, 250, 300].some((U) => {
        const I = Math.round(currentForRadius(U, m / 200) * 100) / 100;
        return I > 0 && I <= 3 && Math.abs(2 * orbitRadius(U, helmholtzField(COILS.n, I, COILS.R)) * 100 - m) <= 0.15;
      });
      expect(reachable, `Marke ${m} cm`).toBe(m !== 2);
    }
    for (const U of [150, 175, 200, 225, 250, 275, 300]) {
      const I = Math.round(currentForRadius(U, 0.04) * 100) / 100;
      expect(I).toBeLessThanOrEqual(3);
      expect(Math.abs(2 * orbitRadius(U, helmholtzField(COILS.n, I, COILS.R)) * 100 - 8)).toBeLessThanOrEqual(0.15);
    }
    // Kleinster Kreis (U = 100 V, I = 3 A): r ≈ 1,44 cm, Durchmesser ≈ 2,9 cm > 2 cm;
    // für die Marke 2 cm wären bei 100 V etwa 4,3 A nötig
    expect(orbitRadius(100, helmholtzField(COILS.n, 3, COILS.R)) * 100).toBeCloseTo(1.44, 2);
    expect(currentForRadius(100, 0.01)).toBeCloseTo(4.33, 2);
  });
});
