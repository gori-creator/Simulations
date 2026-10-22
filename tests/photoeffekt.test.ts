import { describe, expect, it } from 'vitest';
import {
  emits,
  fitLine,
  frequencyOf,
  HC_EV_NM,
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
  zeroVoltage,
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

describe('Photoeffekt: Sonderfälle, Reglergrenzen und Aufgabenwerte', () => {
  it('h · c ≈ 1240 eV · nm und h ≈ 4,136 · 10⁻¹⁵ eV · s', () => {
    expect(HC_EV_NM).toBeCloseTo(1239.84, 1);
    expect(PLANCK_EV / 1e-15).toBeCloseTo(4.136, 3);
  });

  it('knapp über/unter der Grenzwellenlänge von Cäsium (λ_G ≈ 639,1 nm)', () => {
    expect(emits(639, 1.94)).toBe(true);
    expect(maxKineticEnergy(639, 1.94)).toBeLessThan(0.001);
    expect(emits(640, 1.94)).toBe(false);
    expect(photoCurrent(0, 640, 1.94, 100)).toBe(0);
    // an der Grenze: E_Ph = W_A → keine Elektronen
    expect(emits(thresholdWavelength(1.94) + 1e-9, 1.94)).toBe(false);
  });

  it('Intensität 0: kein Strom, U_G unverändert', () => {
    expect(photoCurrent(0, 400, 1.94, 0)).toBe(0);
    expect(saturationCurrent(-10)).toBe(0);
    expect(saturationCurrent(150)).toBe(2);
    expect(stoppingVoltage(400, 1.94)).toBeCloseTo(1.16, 2);
  });

  it('Reglergrenzen: bei 250 nm bleibt U_G für alle Metalle unter 4 V, bei 700 nm keine Elektronen', () => {
    for (const id of METAL_IDS) {
      expect(stoppingVoltage(250, METALS[id].W)).toBeLessThan(4);
      expect(emits(250, METALS[id].W)).toBe(true);
      expect(emits(700, METALS[id].W)).toBe(false);
    }
    expect(stoppingVoltage(250, METALS.Cs.W)).toBeCloseTo(3.02, 2);
    // Kupfer: λ_G ≈ 276,8 nm
    expect(thresholdWavelength(METALS.Cu.W)).toBeCloseTo(276.8, 1);
  });

  it('Abgleich: U_G auf 0,01 V aufgerundet, danach fließt kein Strom', () => {
    expect(zeroVoltage(400, 1.94)).toBe(1.16);
    expect(zeroVoltage(600, 1.94)).toBe(0.13);
    expect(zeroVoltage(700, 1.94)).toBe(0);
    for (const id of METAL_IDS)
      for (let lam = 250; lam <= 700; lam += 7) {
        const U = zeroVoltage(lam, METALS[id].W);
        expect(photoCurrent(U, lam, METALS[id].W, 100)).toBe(0);
        expect(U - stoppingVoltage(lam, METALS[id].W)).toBeLessThan(0.0100001);
      }
  });

  it('Aufgabenwerte des Lernmaterials', () => {
    // A1: f = 3,00 · 10⁸ / 400 · 10⁻⁹ = 7,50 · 10¹⁴ Hz, E_Ph ≈ 3,10 eV
    expect(3e8 / 400e-9 / 1e14).toBeCloseTo(7.5, 9);
    expect(photonEnergy(400)).toBeCloseTo(3.1, 2);
    // A2: 650 nm → 1,91 eV < 1,94 eV
    expect(photonEnergy(650)).toBeCloseTo(1.91, 2);
    // A3: Zink λ_G ≈ 286 nm; 250 nm → E_kin ≈ 0,62 eV
    expect(thresholdWavelength(METALS.Zn.W)).toBeCloseTo(285.7, 1);
    expect(maxKineticEnergy(250, METALS.Zn.W)).toBeCloseTo(0.62, 2);
    // A4: 300 nm → U_G ≈ 2,19 V; h = 1,03 eV / 2,50 · 10¹⁴ Hz ≈ 4,12 · 10⁻¹⁵ eV · s
    expect(stoppingVoltage(300, 1.94)).toBeCloseTo(2.19, 2);
    const h = (2.19 - 1.16) / (3e8 / 300e-9 - 3e8 / 400e-9);
    expect(h / 1e-15).toBeCloseTo(4.12, 2);
    expect((h * 1.602e-19) / 1e-34).toBeCloseTo(6.6, 1);
  });
});
