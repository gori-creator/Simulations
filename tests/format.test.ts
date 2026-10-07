import { describe, expect, it } from 'vitest';
import { Formatter, formatNumber, formatPiFraction, MINUS } from '../src/sim-core/format';
import { fnDef, polynomial, shifted, sum, x } from '../src/sim-core/formula';

const de = new Formatter('de');
const en = new Formatter('en');
const strip = (html: string) => html.replace(/<[^>]+>/g, '');

describe('Zahlen', () => {
  it('verwendet Dezimalkomma und echtes Minuszeichen', () => {
    expect(formatNumber(-1.5, 'de')).toBe(`${MINUS}1,5`);
    expect(formatNumber(-1.5, 'en')).toBe(`${MINUS}1.5`);
    expect(formatNumber(2.345, 'de', { decimals: 2 })).toBe('2,35');
    expect(formatNumber(2, 'de', { decimals: 2, fixed: true })).toBe('2,00');
    expect(formatNumber(1234.5, 'de', { decimals: 1 })).toBe('1234,5');
  });

  it('vermeidet „−0“', () => {
    expect(formatNumber(-0.0001, 'de')).toBe('0');
    expect(formatNumber(-0, 'en')).toBe('0');
  });

  it('kennt Sonderfälle', () => {
    expect(formatNumber(Infinity, 'de')).toBe('∞');
    expect(formatNumber(NaN, 'de')).toBe('–');
    expect(formatNumber(3, 'de', { signed: true })).toBe('+3');
  });

  it('schreibt Punkte sprachabhängig', () => {
    expect(de.point(1.5, -2)).toBe(`(1,5 | ${MINUS}2)`);
    expect(en.point(1.5, -2)).toBe(`(1.5, ${MINUS}2)`);
  });
});

describe('Vielfache von π', () => {
  it('erkennt typische Werte', () => {
    expect(formatPiFraction(Math.PI)).toBe('π');
    expect(formatPiFraction(Math.PI / 2)).toBe('π/2');
    expect(formatPiFraction((-3 * Math.PI) / 4)).toBe(`${MINUS}3π/4`);
    expect(formatPiFraction(2 * Math.PI)).toBe('2π');
    expect(formatPiFraction((5 * Math.PI) / 12)).toBe('5π/12');
    expect(formatPiFraction(0)).toBe('0');
  });

  it('gibt null zurück, wenn es kein einfacher Bruchteil ist', () => {
    expect(formatPiFraction(1)).toBeNull();
  });
});

describe('Terme', () => {
  it('lässt Einsen und Nullen weg und setzt Vorzeichen', () => {
    expect(strip(sum([{ coef: 1, body: x }, { coef: -2, body: '' }], de))).toBe(`x ${MINUS} 2`);
    expect(strip(sum([{ coef: -1, body: x }, { coef: 0, body: '' }], de))).toBe(`${MINUS}x`);
    expect(strip(sum([{ coef: 0, body: x }, { coef: 0, body: '' }], de))).toBe('0');
    expect(strip(sum([{ coef: 0.5, body: x }, { coef: 1, body: '' }], de))).toBe('0,5x + 1');
  });

  it('schreibt Polynome', () => {
    expect(strip(polynomial([1, -2, 3], de))).toBe(`x2 ${MINUS} 2x + 3`);
    expect(polynomial([2, 0, -1], de)).toContain('<sup>2</sup>');
  });

  it('schreibt Verschiebungen', () => {
    expect(strip(shifted(2, de))).toBe(`x ${MINUS} 2`);
    expect(strip(shifted(-1.5, de))).toBe('x + 1,5');
    expect(strip(shifted(Math.PI / 4, de, x, 'π/4'))).toBe(`x ${MINUS} π/4`);
    expect(strip(fnDef('f', '1'))).toBe('f(x) = 1');
  });

  it('setzt Malpunkte, wenn gewünscht', () => {
    expect(strip(sum([{ coef: 2, body: 'sin(x)', dot: true }], de))).toBe('2 · sin(x)');
  });
});
