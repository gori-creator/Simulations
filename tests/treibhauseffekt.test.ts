import { describe, expect, it } from 'vitest';
import { budget, epsForTemperature } from '../src/simulations/physik/treibhauseffekt/model';

describe('Treibhauseffekt (Ein-Schicht-Modell)', () => {
  it('ohne Atmosphäre etwa −18 °C', () => {
    const b = budget(0.3, 0);
    expect(b.surfaceK - 273.15).toBeCloseTo(-18.6, 0);
    expect(b.incoming).toBeCloseTo(340.25, 2);
  });

  it('Energiebilanz oben stimmt: Aufnahme = Abgabe ins All', () => {
    for (const eps of [0.2, 0.5, 0.78, 0.95]) {
      const b = budget(0.3, eps);
      expect(b.window + b.atmosphereEach).toBeCloseTo(b.absorbed, 8);
      // Boden: Sonne + Gegenstrahlung = eigene Abstrahlung
      expect(b.absorbed + b.atmosphereEach).toBeCloseTo(b.surfaceEmission, 8);
    }
  });

  it('heutige 15 °C bei ε ≈ 0,78', () => {
    const eps = epsForTemperature(0.3, 288);
    expect(eps).toBeGreaterThan(0.7);
    expect(eps).toBeLessThan(0.85);
    expect(budget(0.3, eps).surfaceK).toBeCloseTo(288, 6);
  });

  it('mehr Treibhausgase oder weniger Albedo: wärmer', () => {
    expect(budget(0.3, 0.8).surfaceK).toBeGreaterThan(budget(0.3, 0.78).surfaceK);
    expect(budget(0.25, 0.78).surfaceK).toBeGreaterThan(budget(0.3, 0.78).surfaceK);
  });
});
