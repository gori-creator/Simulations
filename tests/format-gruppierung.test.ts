import { describe, expect, it } from 'vitest';
import { Formatter, formatNumber, groupThousands, MINUS, NBSP, NNBSP } from '../src/sim-core/format';

const de = new Formatter('de');
const en = new Formatter('en');
const g = (...parts: string[]) => parts.join(NNBSP);

describe('Tausendertrennung (DIN 1333)', () => {
  it('gruppiert ab 5 Stellen vor dem Komma mit schmalem geschütztem Leerzeichen', () => {
    expect(de.num(125000)).toBe(g('125', '000'));
    expect(de.num(12500)).toBe(g('12', '500'));
    expect(de.num(-12500)).toBe(`${MINUS}${g('12', '500')}`);
    expect(de.num(1234567.891, 2)).toBe(`${g('1', '234', '567')},89`);
    expect(en.num(1234567.891, 2)).toBe(`${g('1', '234', '567')}.89`);
    expect(de.signed(25000, 0)).toBe(`+${g('25', '000')}`);
  });

  it('lässt vierstellige und kleinere Zahlen ungruppiert', () => {
    expect(de.num(1257)).toBe('1257');
    expect(de.num(-9999)).toBe(`${MINUS}9999`);
    expect(de.num(1234.5678, 4)).toBe('1234,5678');
    // Nachkommastellen werden nicht gruppiert
    expect(de.num(0.123456, 6)).toBe('0,123456');
  });

  it('gruppiert auch Werte, die erst durch Runden fünfstellig werden', () => {
    expect(de.num(9999.6, 0)).toBe(g('10', '000'));
  });

  it('lässt sich abschalten (Eingabefelder)', () => {
    expect(formatNumber(125000, 'de', { grouping: false })).toBe('125000');
    expect(de.plain(-12500.5, 1)).toBe(`${MINUS}12500,5`);
  });

  it('verträgt sich mit Einheiten und Hilfsfunktionen', () => {
    expect(de.unit(125000, 'N/C')).toBe(`${g('125', '000')}${NBSP}N/C`);
    expect(de.point(12000, -3)).toBe(`(${g('12', '000')} | ${MINUS}3)`);
    expect(groupThousands('1234')).toBe('1234');
    expect(groupThousands('12345,6789')).toBe(`${g('12', '345')},6789`);
  });
});
