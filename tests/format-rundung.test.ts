import { describe, expect, it } from 'vitest';
import { formatNumber, MINUS } from '../src/sim-core/format';

describe('Runden wie im Unterricht', () => {
  it('rundet halbe Werte vom Betrag her auf (auch negative)', () => {
    expect(formatNumber(0.875, 'de', { decimals: 2 })).toBe('0,88');
    expect(formatNumber(-0.875, 'de', { decimals: 2 })).toBe(`${MINUS}0,88`);
    expect(formatNumber(-2.5, 'de', { decimals: 0 })).toBe(`${MINUS}3`);
    expect(formatNumber(2.5, 'de', { decimals: 0 })).toBe('3');
  });

  it('gleicht Darstellungsfehler der Gleitkommazahlen aus', () => {
    expect(formatNumber(1.005, 'de', { decimals: 2 })).toBe('1,01');
    expect(formatNumber(-1.005, 'de', { decimals: 2 })).toBe(`${MINUS}1,01`);
    expect(formatNumber(0.1 + 0.2, 'de', { decimals: 2 })).toBe('0,3');
  });

  it('rundet nicht über die Grenze hinaus', () => {
    expect(formatNumber(1.0049, 'de', { decimals: 2 })).toBe('1');
    expect(formatNumber(-1.0049, 'de', { decimals: 2 })).toBe(`${MINUS}1`);
    expect(formatNumber(123456.785, 'de', { decimals: 2 })).toBe('123456,79');
  });
});
