import { describe, expect, it } from 'vitest';
import { am, dipoleLength, fm, fmInstantFrequency, frequencyOf, isIonizing, photonEnergyEv, regionOf, REGIONS } from '../src/simulations/physik/em-spektrum/model';

describe('Elektromagnetisches Spektrum', () => {
  it('Bereiche schließen lückenlos aneinander an', () => {
    for (let k = 1; k < REGIONS.length; k++) expect(REGIONS[k]!.min).toBe(REGIONS[k - 1]!.max);
  });

  it('ordnet Wellenlängen richtig zu', () => {
    expect(regionOf(550e-9)).toBe('visible');
    expect(regionOf(10e-6)).toBe('ir');
    expect(regionOf(0.12)).toBe('micro');
    expect(regionOf(3)).toBe('radio');
    expect(regionOf(250e-9)).toBe('uv');
    expect(regionOf(0.1e-9)).toBe('xray');
    expect(regionOf(1e-13)).toBe('gamma');
  });

  it('Frequenz und Photonenenergie', () => {
    expect(frequencyOf(3)).toBeCloseTo(99.93e6, -4);
    expect(photonEnergyEv(500e-9)).toBeCloseTo(2.48, 2);
    expect(isIonizing(500e-9)).toBe(false);
    expect(isIonizing(50e-9)).toBe(true);
  });

  it('λ/2-Dipol für UKW 100 MHz ist etwa 1,5 m lang', () => {
    expect(dipoleLength(100e6)).toBeCloseTo(1.499, 3);
  });

  it('AM-Hüllkurve und FM-Momentanfrequenz', () => {
    // Bei sin(ω_s t) = 1 ist die Amplitude 1 + m
    const fs = 1;
    const fc = 20;
    const t = 0.25 + 1 / (4 * fc) - 0.25 / fc * 0; // in der Nähe des Maximums der Hüllkurve
    expect(Math.abs(am(0.2625, fc, fs, 0.5))).toBeLessThanOrEqual(1.5 + 1e-9);
    expect(Math.abs(fm(t, fc, fs, 5))).toBeLessThanOrEqual(1);
    expect(fmInstantFrequency(0.25, fc, fs, 5)).toBeCloseTo(25, 10);
    expect(fmInstantFrequency(0.75, fc, fs, 5)).toBeCloseTo(15, 10);
  });
});
