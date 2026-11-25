import { describe, expect, it } from 'vitest';
import { cyclotron, deflection, E, floatVoltage, hallVoltage, millikanCharge, MP, speedAfter } from '../src/simulations/physik/teilchen-felder/model';

describe('Teilchen in Feldern', () => {
  it('Elektron nach 1 kV: etwa 1,9 · 10⁷ m/s', () => {
    expect(speedAfter(1000)).toBeCloseTo(1.875e7, -5);
  });

  it('Ablenkung: doppelte Spannung, doppelte Ablenkung', () => {
    const v = speedAfter(1000);
    const a = deflection(100, 0.02, 0.05, v);
    const b = deflection(200, 0.02, 0.05, v);
    expect(b.yEnd / a.yEnd).toBeCloseTo(2, 10);
    // y = Ud l² / (4 d Ua) unabhängig von q/m
    expect(a.yEnd).toBeCloseTo((100 * 0.05 ** 2) / (4 * 0.02 * 1000), 10);
  });

  it('Millikan: Ladung als Vielfaches von e', () => {
    const U = floatVoltage(1e-6, 875, 3, 0.005);
    expect(millikanCharge(1e-6, 875, U, 0.005) / E).toBeCloseTo(3, 10);
  });

  it('Zyklotron: Frequenz unabhängig von der Geschwindigkeit', () => {
    const a = cyclotron(1, 1e6);
    const b = cyclotron(1, 2e6);
    expect(a.f).toBeCloseTo(b.f, 6);
    expect(b.r / a.r).toBeCloseTo(2, 10);
    expect(a.f).toBeCloseTo((E * 1) / (2 * Math.PI * MP), 3);
  });

  it('Hall-Spannung in Kupfer ist winzig', () => {
    // n ≈ 8,5 · 10²⁸ /m³, d = 0,1 mm, B = 1 T, I = 5 A
    expect(hallVoltage(1, 5, 8.5e28, 1e-4)).toBeCloseTo(3.67e-6, 7);
  });
});
