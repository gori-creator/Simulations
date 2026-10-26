import { describe, expect, it } from 'vitest';
import { Formatter, formatSig, MINUS, NBSP, sigDecimals } from '../src/sim-core/format';

const de = new Formatter('de');
const en = new Formatter('en');

describe('gültige Ziffern (fmt.sig)', () => {
  it('rundet auf n gültige Ziffern mit Dezimalkomma', () => {
    expect(de.sig(0.012345, 3)).toBe('0,0123');
    expect(de.sig(3.14159, 3)).toBe('3,14');
    expect(de.sig(6.022e-4, 2)).toBe('0,00060');
    expect(en.sig(3.14159, 4)).toBe('3.142');
    expect(de.sig(589.3, 3)).toBe('589');
  });

  it('zeigt Nullen am Ende als gültige Ziffern', () => {
    expect(de.sig(2.5, 3)).toBe('2,50');
    expect(de.sig(1, 2)).toBe('1,0');
  });

  it('rundet kaufmännisch und vom Betrag her, mit echtem Minus', () => {
    expect(de.sig(0.0625, 2)).toBe('0,063');
    expect(de.sig(-0.0625, 2)).toBe(`${MINUS}0,063`);
    // Gleitkommafehler (−0,0624999…) runden nicht falsch ab
    expect(de.sig(0.1875 - 0.25, 2)).toBe(`${MINUS}0,063`);
    expect(de.sig(1.005, 3)).toBe('1,01');
  });

  it('beachtet, dass das Runden eine Stelle dazubringt', () => {
    expect(de.sig(9.996, 3)).toBe('10,0');
    expect(de.sig(0.0099996, 3)).toBe('0,0100');
    expect(de.sig(99.95, 3)).toBe('100');
    expect(sigDecimals(9.996, 3)).toBe(1);
  });

  it('rundet große Zahlen vor dem Komma', () => {
    expect(formatSig(1257.3, 'de', 3, { grouping: false })).toBe('1260');
    expect(formatSig(123456, 'de', 3, { grouping: false })).toBe('123000');
    expect(sigDecimals(123456, 3)).toBe(-3);
  });

  it('behandelt 0 und Sonderwerte', () => {
    expect(de.sig(0, 3)).toBe('0');
    expect(de.sig(-0, 3)).toBe('0');
    expect(de.sig(Number.NaN, 3)).toBe('–');
    expect(de.sig(Infinity, 3)).toBe('∞');
  });

  it('hängt eine Einheit mit geschütztem Leerzeichen an', () => {
    expect(de.sigUnit(0.0123456, 'm', 3)).toBe(`0,0123${NBSP}m`);
    expect(en.sigUnit(2.998e-3, 'm/s', 2)).toBe(`0.0030${NBSP}m/s`);
  });
});
