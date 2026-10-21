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

  it('Sonderfälle: t = 0, t ≫ τ, τ = 0, R = 0, negative Zeit', () => {
    // t = 0: Laden beginnt bei 0 V mit vollem Strom, Entladen bei U₀
    expect(chargingVoltage(10, 0, 1)).toBe(0);
    expect(dischargingVoltage(10, 0, 1)).toBe(10);
    // t ≫ τ: Endwert, kein Strom mehr
    expect(chargingVoltage(10, 1000, 1)).toBeCloseTo(10, 12);
    expect(dischargingVoltage(10, 1000, 1)).toBeCloseTo(0, 12);
    expect(currentAt(0, 10, 1000, R, C)).toBeCloseTo(0, 12);
    // τ = 0 bzw. R = 0: sofort am Endwert, keine Division durch 0
    expect(voltageAt(0, 10, 0.5, 0)).toBe(10);
    expect(currentAt(0, 10, 0, 0, C)).toBe(0);
    // negative Zeit wird wie t = 0 behandelt
    expect(chargingVoltage(10, -1, 1)).toBe(0);
    expect(currentAt(0, 10, -1, R, C)).toBeCloseTo(1e-3, 12);
  });

  it('Reglergrenzen: τ von 10 ms (1 kΩ, 10 µF) bis 100 s (100 kΩ, 1000 µF)', () => {
    expect(timeConstant(1e3, 10e-6)).toBeCloseTo(0.01, 12);
    expect(timeConstant(100e3, 1000e-6)).toBeCloseTo(100, 9);
    // kleinster Anfangsstrom 1 V / 100 kΩ = 10 µA, größter 12 V / 1 kΩ = 12 mA
    expect(currentAt(0, 1, 0, 100e3, 10e-6)).toBeCloseTo(10e-6, 15);
    expect(currentAt(0, 12, 0, 1e3, 10e-6)).toBeCloseTo(12e-3, 12);
    // Energie: 5 µJ (10 µF, 1 V) bis 72 mJ (1000 µF, 12 V)
    expect(energy(10e-6, 1)).toBeCloseTo(5e-6, 15);
    expect(energy(1000e-6, 12)).toBeCloseTo(0.072, 12);
  });

  it('Aufgabenwerte: 2τ → 86 %, 5τ → 99,3 %, halbe Spannung → ¼ der Energie, Umschalten', () => {
    // Aufgabe 2: 5 V nach t½ = 0,693 s, 2,5 V nach 2 t½ = 1,386 s
    expect(dischargingVoltage(10, halfLife(1), 1)).toBeCloseTo(5, 9);
    expect(dischargingVoltage(10, 2 * halfLife(1), 1)).toBeCloseTo(2.5, 9);
    expect(2 * halfLife(1)).toBeCloseTo(1.386, 3);
    // Aufgabe 3: 1,25 mJ bei 5 V
    expect(energy(C, 5)).toBeCloseTo(1.25e-3, 12);
    // Aufgabe 4: 8,65 V nach 2τ, 9,93 V nach 5τ, Q = 1 mC
    expect(chargingVoltage(10, 2, 1)).toBeCloseTo(8.647, 3);
    expect(chargingVoltage(10, 5, 1)).toBeCloseTo(9.933, 3);
    expect(timeToFraction(0.99, 1)).toBeCloseTo(4.605, 3);
    // Umschalten bei 6 V auf Entladen: Strom beginnt mit −6 V / 10 kΩ = −0,6 mA
    expect(currentAt(6, 0, 0, R, C)).toBeCloseTo(-0.6e-3, 12);
    // Umschalten bei 6 V zurück auf Laden: Restspannung 4 V treibt 0,4 mA
    expect(currentAt(6, 10, 0, R, C)).toBeCloseTo(0.4e-3, 12);
  });
});
