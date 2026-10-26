import { describe, expect, it } from 'vitest';
import { Formatter, formatNumber, MINUS, NBSP, roundHalfUp } from '../src/sim-core/format';

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
    expect(formatNumber(123456.785, 'de', { decimals: 2 })).toBe('123\u202F456,79');
  });
});

describe('Normalisieren vor dem Runden (Gleitkommafehler)', () => {
  const de = (v: number, decimals = 3) => formatNumber(v, 'de', { decimals });

  it('rundet Werte knapp unter der halben Stelle richtig auf', () => {
    expect(de(0.0625)).toBe('0,063');
    expect(de(-0.0625)).toBe(`${MINUS}0,063`);
    // so kommt −0,0625 aus der Rechnung in „stoesse“ an
    expect(de(-0.06249999999999993)).toBe(`${MINUS}0,063`);
    expect(de(-0.0625 + 1e-15)).toBe(`${MINUS}0,063`);
    expect(de(0.0625 - 1e-15)).toBe('0,063');
    expect(formatNumber(1.005, 'de', { decimals: 2, fixed: true })).toBe('1,01');
    expect(formatNumber(1.0049999999999999, 'de', { decimals: 2 })).toBe('1,01');
    expect(formatNumber(2.675, 'de', { decimals: 2 })).toBe('2,68');
    expect(formatNumber(-2.675, 'en', { decimals: 2 })).toBe(`${MINUS}2.68`);
    expect(formatNumber(0.045, 'de', { decimals: 2 })).toBe('0,05');
    expect(formatNumber(1.255, 'de', { decimals: 2 })).toBe('1,26');
    expect(formatNumber(0.3 - 0.1, 'de', { decimals: 1 })).toBe('0,2');
  });

  it('rundet echte Werte unterhalb der Grenze weiterhin ab', () => {
    expect(de(0.06249)).toBe('0,062');
    expect(de(-0.062499)).toBe(`${MINUS}0,062`);
    expect(formatNumber(2.6749, 'de', { decimals: 2 })).toBe('2,67');
  });

  it('behandelt große und kleine Zahlen', () => {
    expect(formatNumber(123456789.125, 'de', { decimals: 2 })).toBe('123\u202F456\u202F789,13');
    expect(formatNumber(9876543210.5, 'de', { decimals: 0 })).toBe('9\u202F876\u202F543\u202F211');
    expect(formatNumber(1e20, 'de', { decimals: 2, grouping: false })).toBe('100000000000000000000');
    expect(formatNumber(6.02214076e23, 'en', { decimals: 0, grouping: false })).toBe('602214076000000000000000');
    expect(formatNumber(1.5e-7, 'de', { decimals: 9, fixed: true })).toBe('0,000000150');
    expect(formatNumber(2.5e-7, 'de', { decimals: 7 })).toBe('0,0000003');
    expect(formatNumber(1e-20, 'de', { decimals: 2 })).toBe('0');
  });

  it('zeigt −0 und winzige negative Werte als 0', () => {
    expect(formatNumber(-0, 'de')).toBe('0');
    expect(formatNumber(-0.0001, 'de', { decimals: 2 })).toBe('0');
    expect(formatNumber(-0.004999999, 'de', { decimals: 2, signed: true })).toBe('0');
    expect(formatNumber(-1e-17, 'de', { decimals: 2, fixed: true })).toBe('0,00');
  });

  it('gilt für alle Formatierfunktionen', () => {
    const fmt = new Formatter('de');
    expect(fmt.num(-0.0625, 3)).toBe(`${MINUS}0,063`);
    expect(fmt.fixed(1.005, 2)).toBe('1,01');
    expect(fmt.signed(0.0625, 3)).toBe('+0,063');
    expect(fmt.unit(-0.06249999999999999, 'm/s', 3)).toBe(`${MINUS}0,063${NBSP}m/s`);
    expect(fmt.point(2.675, -0.045, 2)).toBe(`(2,68 | ${MINUS}0,05)`);
    expect(fmt.pi(0.0625, 3)).toBe('0,063');
  });

  it('rundet direkt nutzbar über roundHalfUp', () => {
    expect(roundHalfUp(-0.06249999999999999, 3)).toBe(-0.063);
    expect(roundHalfUp(1.005, 2)).toBe(1.01);
    expect(Object.is(roundHalfUp(-0.0001, 2), 0)).toBe(true);
    expect(roundHalfUp(Number.NaN, 2)).toBeNaN();
  });
});
