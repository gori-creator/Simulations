import { describe, expect, it } from 'vitest';
import { dividerOutput, ldrResistance, ntcResistance } from '../src/simulations/physik/sensoren/model';

describe('Sensoren', () => {
  it('NTC: 10 kΩ bei 25 °C, warm kleiner', () => {
    expect(ntcResistance(25)).toBeCloseTo(10, 6);
    expect(ntcResistance(60)).toBeLessThan(ntcResistance(25));
  });

  it('LDR: hell kleiner Widerstand', () => {
    expect(ldrResistance(10)).toBeCloseTo(10, 6);
    expect(ldrResistance(1000)).toBeLessThan(1);
  });

  it('Spannungsteiler: gleiche Widerstände → halbe Spannung', () => {
    expect(dividerOutput(5, 10, 10)).toBeCloseTo(2.5, 12);
    expect(dividerOutput(5, ntcResistance(60), 10)).toBeGreaterThan(2.5);
  });
});
