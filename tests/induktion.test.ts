import { describe, expect, it } from 'vitest';
import {
  axialField,
  brakingForce,
  coilLinkage,
  COIL_AREA,
  current,
  flux,
  generatorPeak,
  generatorVoltage,
  inducedFromSamples,
  magnetVoltage,
  motionalVoltage,
  rms,
} from '../src/simulations/physik/induktion/model';

describe('Modell: Elektromagnetische Induktion', () => {
  it('bewegter Leiter: l = 0,2 m, B = 0,5 T, v = 2 m/s → U = 0,2 V', () => {
    expect(motionalVoltage(0.5, 0.2, 2)).toBeCloseTo(0.2, 12);
    const I = current(0.2, 2);
    expect(I).toBeCloseTo(0.1, 12);
    expect(brakingForce(0.5, I, 0.2)).toBeCloseTo(0.01, 12);
    // Umkehr der Bewegung: Umkehr der Spannung
    expect(motionalVoltage(0.5, 0.2, -2)).toBeCloseTo(-0.2, 12);
  });

  it('U = B · l · v folgt auch aus U = −dΦ/dt mit A = l · x', () => {
    const B = 0.5;
    const l = 0.2;
    const dt = 0.01;
    const x0 = 0.1;
    const x1 = x0 + 2 * dt;
    expect(-inducedFromSamples(flux(B, l * x0), flux(B, l * x1), dt)).toBeCloseTo(0.2, 9);
  });

  it('Generator: n = 100, B = 0,1 T, A = 100 cm², f = 5 Hz → Û ≈ 3,14 V', () => {
    expect(generatorPeak(100, 0.1, 0.01, 5)).toBeCloseTo(Math.PI, 9);
    expect(rms(Math.PI)).toBeCloseTo(2.221, 3);
    // eine Viertelperiode: Spule parallel zum Feld, Fluss null, Spannung maximal
    expect(generatorVoltage(100, 0.1, 0.01, 5, 0.05)).toBeCloseTo(Math.PI, 9);
    expect(generatorVoltage(100, 0.1, 0.01, 5, 0)).toBeCloseTo(0, 12);
    expect(flux(0.1, 0.01, Math.PI / 2)).toBeCloseTo(0, 12);
    // U = −n dΦ/dt numerisch
    const t = 0.013;
    const h = 1e-6;
    const phi = (tt: number) => flux(0.1, 0.01, 2 * Math.PI * 5 * tt);
    expect(inducedFromSamples(phi(t - h), phi(t + h), 2 * h, 100)).toBeCloseTo(generatorVoltage(100, 0.1, 0.01, 5, t), 5);
  });

  it('Stabmagnet: Feld nimmt mit dem Abstand ab, Spannung wechselt beim Herausziehen das Vorzeichen', () => {
    expect(axialField(0)).toBeGreaterThan(axialField(0.02));
    expect(axialField(0.02)).toBeGreaterThan(axialField(0.1));
    expect(axialField(0.5)).toBeLessThan(0.001);
    expect(coilLinkage(0.02, 100)).toBeCloseTo(100 * axialField(0.02) * COIL_AREA, 12);
    const inV = magnetVoltage(0.05, -0.5, 100);
    const outV = magnetVoltage(0.05, 0.5, 100);
    expect(inV).toBeCloseTo(-outV, 12);
    expect(Math.abs(inV)).toBeGreaterThan(0.01);
    // doppelte Geschwindigkeit, doppelte Spannung; doppelte Windungszahl ebenso
    expect(magnetVoltage(0.05, 1, 100)).toBeCloseTo(2 * outV, 12);
    expect(magnetVoltage(0.05, 0.5, 200)).toBeCloseTo(2 * outV, 12);
    expect(magnetVoltage(0.05, 0, 100)).toBeCloseTo(0, 12);
  });
});
