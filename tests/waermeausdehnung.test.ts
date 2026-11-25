import { describe, expect, it } from 'vitest';
import { ALPHA, gasVolume, ICE_DENSITY, lengthChange, waterDensity } from '../src/simulations/physik/waermeausdehnung/model';

describe('Wärmeausdehnung', () => {
  it('Stahlbrücke: 100 m, 40 K → 4,8 cm', () => {
    expect(lengthChange(ALPHA.steel, 100, 40)).toBeCloseTo(0.048, 10);
  });

  it('Aluminium dehnt sich etwa doppelt so stark wie Stahl', () => {
    expect(ALPHA.aluminium / ALPHA.steel).toBeGreaterThan(1.8);
  });

  it('Gas: von 0 °C auf 273 °C verdoppelt sich das Volumen', () => {
    expect(gasVolume(1, 0, 273.15)).toBeCloseTo(2, 10);
  });

  it('Wasser hat bei etwa 4 °C die größte Dichte', () => {
    let best = 0;
    for (let t = 0; t <= 10; t += 0.01) if (waterDensity(t) > waterDensity(best)) best = t;
    expect(best).toBeCloseTo(3.98, 1);
    expect(waterDensity(4)).toBeCloseTo(999.97, 1);
    expect(waterDensity(20)).toBeCloseTo(998.2, 1);
    expect(waterDensity(100)).toBeCloseTo(958.4, 0);
    expect(ICE_DENSITY).toBeLessThan(waterDensity(0));
  });
});
