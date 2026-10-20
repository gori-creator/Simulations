import { describe, expect, it } from 'vitest';
import { charge, chargingVoltage, currentAt, dischargingVoltage, energy, halfLife, timeConstant, timeToFraction, voltageAt } from '../src/simulations/physik/kondensator/model';

const R = 10e3;
const C = 100e-6;

describe('Modell: Kondensator laden und entladen', () => {
  it('R = 10 kΩ, C = 100 µF → τ = 1 s, t½ ≈ 0,693 s', () => {
    expect(timeConstant(R, C)).toBeCloseTo(1, 12);
    expect(halfLife(1)).toBeCloseTo(0.6931, 4);
  });

  it('Laden mit U₀ = 10 V: nach τ 6,32 V, nach 5τ über 99 %', () => {
    expect(chargingVoltage(10, 1, 1)).toBeCloseTo(6.321, 3);
    expect(chargingVoltage(10, 5, 1) / 10).toBeGreaterThan(0.99);
    expect(chargingVoltage(10, 0, 1)).toBe(0);
    // nach der Halbwertszeit genau die Hälfte
    expect(chargingVoltage(10, halfLife(1), 1)).toBeCloseTo(5, 9);
    expect(timeToFraction(0.5, 1)).toBeCloseTo(Math.LN2, 9);
  });

  it('Entladen: nach τ noch 36,8 %, Strom negativ', () => {
    expect(dischargingVoltage(10, 1, 1)).toBeCloseTo(3.679, 3);
    expect(currentAt(10, 0, 0, R, C)).toBeCloseTo(-1e-3, 12);
  });

  it('Anfangsstrom I₀ = U₀ / R = 1 mA, nach τ 0,368 mA', () => {
    expect(currentAt(0, 10, 0, R, C)).toBeCloseTo(1e-3, 12);
    expect(currentAt(0, 10, 1, R, C)).toBeCloseTo(0.3679e-3, 7);
  });

  it('Tangente bei t = 0 erreicht den Endwert bei t = τ', () => {
    const tau = timeConstant(R, C);
    const h = 1e-6;
    const slope = (chargingVoltage(10, h, tau) - chargingVoltage(10, 0, tau)) / h;
    expect(slope * tau).toBeCloseTo(10, 3);
    // Umschalten mitten im Vorgang: Start bei 4 V, Ziel 0 V
    expect(voltageAt(4, 0, tau, tau)).toBeCloseTo(4 / Math.E, 9);
  });

  it('Energie und Ladung bei 10 V: W = 5 mJ, Q = 1 mC', () => {
    expect(energy(C, 10)).toBeCloseTo(5e-3, 12);
    expect(charge(C, 10)).toBeCloseTo(1e-3, 12);
  });
});
