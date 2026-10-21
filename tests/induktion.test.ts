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

  it('Stabmagnet: Wert von Hand nachgerechnet (z = 5 cm, v = −0,3 m/s, n = 100)', () => {
    // B(z) = Br/2 · [(z + L)/√((z + L)² + R²) − z/√(z² + R²)], dB/dz = Br/2 · R² · [((z + L)² + R²)^(−3/2) − (z² + R²)^(−3/2)]
    expect(axialField(0.05)).toBeCloseTo(0.014028, 5);
    const dBdz = 0.6 * 0.012 ** 2 * (Math.pow(0.13 ** 2 + 0.012 ** 2, -1.5) - Math.pow(0.05 ** 2 + 0.012 ** 2, -1.5));
    expect(dBdz).toBeCloseTo(-0.59665, 4);
    // U = −n · A · dB/dz · v ≈ −0,0225 V: Annähern gibt negative Spannung
    expect(magnetVoltage(0.05, -0.3, 100)).toBeCloseTo(-100 * COIL_AREA * dBdz * -0.3, 6);
    expect(magnetVoltage(0.05, -0.3, 100)).toBeCloseTo(-0.02249, 4);
    expect(COIL_AREA * 1e4).toBeCloseTo(12.566, 3);
  });

  it('Sonderfälle: Ruhe, keine Drehung, kein Widerstand, keine Zeit', () => {
    // Magnet ruht (auch mitten in der Spule): keine Spannung
    expect(magnetVoltage(0, 0, 500)).toBeCloseTo(0, 12);
    expect(magnetVoltage(-0.03, 0, 500)).toBeCloseTo(0, 12);
    expect(motionalVoltage(1, 0.5, 0)).toBe(0);
    expect(generatorPeak(100, 0.1, 0.01, 0)).toBe(0);
    expect(generatorVoltage(100, 0.1, 0.01, 0, 1)).toBeCloseTo(0, 12);
    expect(current(1, 0)).toBe(0);
    expect(inducedFromSamples(0, 1, 0)).toBe(0);
    // Fluss im ganzen Zugbereich des Magneten monoton: kein Vorzeichenwechsel beim Hineinschieben
    for (let z = -0.03; z < 0.3; z += 0.005) expect(axialField(z)).toBeGreaterThan(axialField(z + 0.005));
  });

  it('Reglergrenzen', () => {
    expect(motionalVoltage(0.05, 0.05, 0.5)).toBeCloseTo(0.00125, 12);
    expect(motionalVoltage(1, 0.5, 5)).toBeCloseTo(2.5, 12);
    expect(generatorPeak(10, 0.05, 10e-4, 0.5)).toBeCloseTo(0.0015708, 6);
    // größter Wert 1256,6 V liegt noch im größten Messbereich (3000 V)
    expect(generatorPeak(500, 1, 400e-4, 10)).toBeCloseTo(1256.64, 2);
  });

  it('Aufgaben aus dem Lernmaterial', () => {
    // A2: P_mech = F · v = P_el = U · I
    const U = motionalVoltage(0.5, 0.2, 2);
    const I = current(U, 2);
    expect(brakingForce(0.5, I, 0.2) * 2).toBeCloseTo(U * I, 12);
    expect(U * I).toBeCloseTo(0.02, 12);
    // A4: doppelte Frequenz → doppelter Scheitelwert
    expect(generatorPeak(100, 0.1, 0.01, 10)).toBeCloseTo(6.283, 3);
    // A6: 500 Windungen, 20 cm², 0 → 0,2 T in 0,1 s → |U| = 2 V
    expect(Math.abs(inducedFromSamples(flux(0, 20e-4), flux(0.2, 20e-4), 0.1, 500))).toBeCloseTo(2, 12);
    // A7: U = Û · sin φ bei φ = 30° und 90° (t = φ/ω)
    expect(generatorVoltage(100, 0.1, 0.01, 5, 30 / 360 / 5)).toBeCloseTo(1.5708, 4);
    expect(generatorVoltage(100, 0.1, 0.01, 5, 90 / 360 / 5)).toBeCloseTo(3.1416, 4);
  });
});
