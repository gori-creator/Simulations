import { describe, expect, it } from 'vitest';
import { improperValue, integral, partial } from '../src/simulations/mathematik/uneigentliche-integrale/model';

describe('Uneigentliche Integrale', () => {
  it('berechnet bestimmte Integrale exakt', () => {
    expect(integral('unendlich', 2, 1, 4)).toBeCloseTo(0.75);
    expect(integral('unendlich', 1, 1, Math.E)).toBeCloseTo(1);
    expect(integral('exp', 0, 0, Math.log(2))).toBeCloseTo(0.5);
    expect(integral('polstelle', 0.5, 0.25, 1)).toBeCloseTo(1);
  });

  it('entscheidet Konvergenz und Grenzwert', () => {
    expect(improperValue('unendlich', 2)).toBeCloseTo(1);
    expect(improperValue('unendlich', 1)).toBeNull();
    expect(improperValue('unendlich', 0.5)).toBeNull();
    expect(improperValue('polstelle', 0.5)).toBeCloseTo(2);
    expect(improperValue('polstelle', 1)).toBeNull();
    expect(improperValue('polstelle', 2)).toBeNull();
    expect(improperValue('exp', 0)).toBe(1);
  });

  it('nähert sich mit wachsender Grenze dem Grenzwert', () => {
    expect(partial('unendlich', 2, 1e6)).toBeCloseTo(1, 5);
    expect(partial('polstelle', 0.5, 1e-10)).toBeCloseTo(2, 4);
    expect(partial('exp', 0, 40)).toBeCloseTo(1, 9);
    expect(partial('unendlich', 1, 1e4)).toBeGreaterThan(9);
  });
});
