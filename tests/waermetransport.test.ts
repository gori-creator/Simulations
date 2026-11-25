import { describe, expect, it } from 'vitest';
import { conductionPower, conductionStep, diffusivity, MATERIALS, netRadiation, radiatedPower, uValue, wallTemperatures } from '../src/simulations/physik/waermetransport/model';

describe('Wärmetransport', () => {
  it('Wärmestrom durch eine Schicht', () => {
    // 1 m² Glas, 4 mm, 20 K: 1 · 1 · 20 / 0,004 = 5000 W
    expect(conductionPower(1, 1, 20, 0.004)).toBeCloseTo(5000, 6);
  });

  it('Metalle leiten viel besser als Holz und Styropor', () => {
    expect(MATERIALS.copper.lambda / MATERIALS.wood.lambda).toBeGreaterThan(1000);
    expect(diffusivity('copper')).toBeGreaterThan(diffusivity('iron'));
  });

  it('Stab strebt einem linearen Temperaturverlauf zu', () => {
    const n = 21;
    const T = Array.from({ length: n }, (_, i) => (i === 0 ? 100 : 20));
    const a = diffusivity('copper');
    for (let k = 0; k < 2000; k++) conductionStep(T, a, 0.01, 1);
    // linear zwischen 100 und 20
    expect(T[10]!).toBeCloseTo(60, 1);
    expect(T[5]!).toBeCloseTo(80, 1);
  });

  it('Stefan-Boltzmann: doppelte Temperatur, 16-fache Leistung', () => {
    expect(radiatedPower(1, 1, 600) / radiatedPower(1, 1, 300)).toBeCloseTo(16, 10);
    expect(netRadiation(1, 1, 300, 300)).toBe(0);
    // Schwarzer Körper bei 300 K: etwa 459 W/m²
    expect(radiatedPower(1, 1, 300)).toBeCloseTo(459.3, 0);
  });

  it('U-Wert: Dämmung senkt den Wärmeverlust', () => {
    const brick = { lambda: 0.8, d: 0.24 };
    const u0 = uValue([brick]);
    expect(u0).toBeCloseTo(1 / (0.13 + 0.3 + 0.04), 10);
    const u1 = uValue([brick, { lambda: 0.035, d: 0.12 }]);
    expect(u1).toBeLessThan(0.3);
    const t = wallTemperatures([brick, { lambda: 0.035, d: 0.12 }], 20, -10);
    expect(t.length).toBe(3);
    expect(t[2]!).toBeCloseTo(-10 + u1 * 30 * 0.04, 8);
  });
});
