import { describe, expect, it } from 'vitest';
import {
  emits,
  fitLine,
  frequencyOf,
  maxKineticEnergy,
  METAL_IDS,
  METALS,
  metalOf,
  photoCurrent,
  photonEnergy,
  PLANCK_EV,
  saturationCurrent,
  stoppingVoltage,
  thresholdFrequency,
  thresholdWavelength,
  turningPoint,
  wavelengthToRgb,
} from '../src/simulations/physik/photoeffekt/model';

describe('Modell: Photoeffekt', () => {
  it('Cäsium: W_A = 1,94 eV → f_G ≈ 4,69 · 10¹⁴ Hz, λ_G ≈ 639 nm', () => {
    expect(METALS.Cs.W).toBe(1.94);
    expect(thresholdFrequency(1.94) / 1e14).toBeCloseTo(4.69, 2);
    expect(thresholdWavelength(1.94)).toBeCloseTo(639.1, 0);
  });

  it('λ = 400 nm: E_Ph ≈ 3,10 eV, an Cäsium E_kin,max ≈ 1,16 eV und U_G ≈ 1,16 V', () => {
    expect(photonEnergy(400)).toBeCloseTo(3.1, 2);
    expect(frequencyOf(400) / 1e14).toBeCloseTo(7.49, 2);
    expect(maxKineticEnergy(400, 1.94)).toBeCloseTo(1.16, 2);
    expect(stoppingVoltage(400, 1.94)).toBeCloseTo(1.16, 2);
  });

  it('Zink (W_A ≈ 4,3 eV) bei 400 nm: keine Elektronen', () => {
    expect(emits(400, METALS.Zn.W)).toBe(false);
    expect(maxKineticEnergy(400, METALS.Zn.W)).toBe(0);
    expect(photoCurrent(0, 400, METALS.Zn.W, 100)).toBe(0);
    // aber im UV (250 nm) schon
    expect(emits(250, METALS.Zn.W)).toBe(true);
  });

  it('Einstein-Gerade: Steigung h, Achsenabschnitt −W_A', () => {
    const pts = [300, 350, 400, 450, 500].map((l) => [frequencyOf(l), maxKineticEnergy(l, 1.94)] as const);
    const fit = fitLine(pts)!;
    expect(fit.m).toBeCloseTo(PLANCK_EV, 20);
    expect(PLANCK_EV).toBeCloseTo(4.1357e-15, 18);
    expect(fit.b).toBeCloseTo(-1.94, 9);
    expect(-fit.b / fit.m / 1e14).toBeCloseTo(4.69, 2);
  });

  it('Intensität ändert den Strom, aber nicht die Gegenspannung', () => {
    expect(saturationCurrent(100)).toBeCloseTo(2, 12);
    expect(photoCurrent(0, 400, 1.94, 50)).toBeCloseTo(1, 12);
    expect(photoCurrent(0, 400, 1.94, 100)).toBeCloseTo(2, 12);
    for (const P of [10, 50, 100]) {
      expect(photoCurrent(stoppingVoltage(400, 1.94), 400, 1.94, P)).toBeCloseTo(0, 12);
      expect(photoCurrent(0.58, 400, 1.94, P)).toBeCloseTo(saturationCurrent(P) / 2, 2);
    }
    expect(photoCurrent(3, 400, 1.94, 100)).toBe(0);
  });

  it('Elektron im Gegenfeld kehrt bei x = E₀/U um', () => {
    expect(turningPoint(0.5, 1)).toBeCloseTo(0.5, 12);
    expect(turningPoint(1, 0)).toBe(Infinity);
  });

  it('Tabelle und Farben sind plausibel', () => {
    for (const id of METAL_IDS) {
      expect(METALS[id].W).toBeGreaterThan(1.5);
      expect(METALS[id].W).toBeLessThan(5);
    }
    expect(metalOf('xy').id).toBe('Cs');
    expect(wavelengthToRgb(250)).toBeNull();
    expect(wavelengthToRgb(650)![0]).toBeGreaterThan(200);
  });
});
