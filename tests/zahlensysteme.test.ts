import { describe, expect, it } from 'vitest';
import { addWritten, babylonDigits, divisionSteps, fromRoman, mayaDigits, parseBase, toBase, toDigits, toRoman } from '../src/simulations/mathematik/zahlensysteme/model';

describe('Zahlensysteme', () => {
  it('stellt Zahlen in anderen Basen dar', () => {
    expect(toBase(11, 2)).toBe('1011');
    expect(toBase(255, 16)).toBe('FF');
    expect(toBase(0, 2)).toBe('0');
    expect(toDigits(100, 10)).toEqual([1, 0, 0]);
    for (let b = 2; b <= 16; b++) for (const n of [0, 1, 7, 99, 1000, 4095]) expect(parseBase(toBase(n, b), b)).toBe(n);
    expect(parseBase('12', 2)).toBeNull();
  });

  it('rechnet mit dem Divisionsverfahren um', () => {
    const s = divisionSteps(13, 2);
    expect(s.map((x) => x.r)).toEqual([1, 0, 1, 1]);
    expect(s.map((x) => x.r).reverse().join('')).toBe(toBase(13, 2));
    expect(divisionSteps(0, 2)).toEqual([{ n: 0, q: 0, r: 0 }]);
  });

  it('addiert schriftlich mit Übertrag', () => {
    const a = addWritten(11, 6, 2); // 1011 + 0110 = 10001
    expect(a.sum).toEqual([1, 0, 0, 0, 1]);
    expect(a.x).toEqual([0, 1, 0, 1, 1]);
    expect(a.y).toEqual([0, 0, 1, 1, 0]);
    expect(a.carry).toEqual([1, 1, 1, 0, 0]);
    for (let b = 2; b <= 16; b++)
      for (const [x, y] of [
        [5, 9],
        [200, 55],
        [0, 3],
      ] as const) {
        const r = addWritten(x, y, b);
        expect(parseBase(r.sum.map((d) => '0123456789ABCDEF'[d]).join(''), b)).toBe(x + y);
      }
  });

  it('schreibt römisch', () => {
    expect(toRoman(1994)).toBe('MCMXCIV');
    expect(toRoman(2026)).toBe('MMXXVI');
    expect(toRoman(0)).toBeNull();
    for (let n = 1; n < 4000; n += 7) expect(fromRoman(toRoman(n)!)).toBe(n);
  });

  it('zerlegt in Maya- und babylonische Ziffern', () => {
    expect(mayaDigits(20)).toEqual([
      { bars: 0, dots: 1, zero: false },
      { bars: 0, dots: 0, zero: true },
    ]);
    expect(mayaDigits(19)).toEqual([{ bars: 3, dots: 4, zero: false }]);
    expect(babylonDigits(75)).toEqual([
      { tens: 0, ones: 1 },
      { tens: 1, ones: 5 },
    ]);
  });
});
