import { describe, expect, it } from 'vitest';
import {
  balanceAfter,
  checkDrill,
  jumps,
  makeDrill,
  parseInt2,
  partialProducts,
  patternRows,
  product,
  productSign,
  quotient,
  sign,
  signRule,
  tempAfter,
} from '../src/simulations/mathematik/vorzeichenregeln/model';

describe('Vorzeichenregeln', () => {
  it('bestimmt das Vorzeichen von Produkt und Quotient', () => {
    expect(signRule(3, 4)).toBe(1);
    expect(signRule(-3, 4)).toBe(-1);
    expect(signRule(3, -4)).toBe(-1);
    expect(signRule(-3, -4)).toBe(1);
    expect(signRule(0, -4)).toBe(0);
    for (let a = -6; a <= 6; a++) for (let b = -6; b <= 6; b++) expect(sign(a * b)).toBe(signRule(a, b));
  });

  it('teilt mit Vorzeichen und lehnt die Division durch 0 ab', () => {
    expect(quotient(-12, 3)).toBe(-4);
    expect(quotient(-12, -3)).toBe(4);
    expect(quotient(12, -3)).toBe(-4);
    expect(quotient(0, -3)).toBe(0);
    expect(Object.is(quotient(0, -3), -0)).toBe(false);
    expect(quotient(5, 0)).toBeNull();
    for (let c = -6; c <= 6; c++) for (let b = -6; b <= 6; b++) if (b !== 0) expect(quotient(c * b, b)).toBe(c);
  });

  it('setzt das Muster gleichmäßig fort (Permanenzprinzip)', () => {
    const rows = patternRows(-2);
    expect(rows.map((r) => r.a)).toEqual([3, 2, 1, 0, -1, -2, -3]);
    expect(rows.map((r) => r.value)).toEqual([-6, -4, -2, 0, 2, 4, 6]);
    for (let i = 1; i < rows.length; i++) expect(rows[i]!.value - rows[i - 1]!.value).toBe(2);
  });

  it('rechnet im Schuldenmodell', () => {
    expect(balanceAfter(0, 3, -5)).toBe(-15);
    expect(balanceAfter(0, -3, -5)).toBe(15);
    expect(balanceAfter(10, -2, 5)).toBe(0);
    expect(Object.is(balanceAfter(0, 0, -5), -0)).toBe(false);
  });

  it('zerlegt das Produkt in Sprünge', () => {
    expect(jumps(3, -2)).toEqual([
      { from: 0, to: -2 },
      { from: -2, to: -4 },
      { from: -4, to: -6 },
    ]);
    expect(jumps(-2, 4)).toHaveLength(2);
    expect(jumps(0, 4)).toHaveLength(0);
  });
});

describe('Viele Faktoren', () => {
  it('gerade Anzahl negativer Faktoren → positiv, ungerade → negativ', () => {
    expect(productSign([-2, -2, -2, -2])).toBe(1);
    expect(productSign([-2, -2, -2, -2, -2])).toBe(-1);
    expect(productSign([3, -1, 0])).toBe(0);
    expect(product([-2, -2, -2, -2, -2])).toBe(-32);
    expect(partialProducts([-2, 3, -1])).toEqual([-2, -6, 6]);
  });
});

describe('Temperatur im Tagesverlauf', () => {
  it('(−3 °C pro Stunde) · (−4 h) = +12 °C: vor 4 Stunden war es wärmer', () => {
    expect(tempAfter(2, -3, -4)).toBe(14);
    expect(tempAfter(-6, 2, 5)).toBe(4);
    expect(tempAfter(0, 0, 3)).toBe(0);
  });
});

describe('Kopfrechnen', () => {
  it('liest ganze Zahlen mit Minus und Plus', () => {
    expect(parseInt2('−12')).toBe(-12);
    expect(parseInt2('+7')).toBe(7);
    expect(parseInt2('1,5')).toBeNull();
  });

  it('jede Aufgabe ist mit ihrer Lösung richtig, mit einer falschen nicht', () => {
    for (let n = 1; n <= 300; n++) {
      const d = makeDrill(n);
      expect(Number.isInteger(d.answer)).toBe(true);
      expect(checkDrill(d, String(d.answer).replace('-', '−'))).toBe(true);
      expect(checkDrill(d, String(d.answer + 1))).toBe(false);
      if (d.kind === 'sign') expect(checkDrill(d, d.answer > 0 ? '+' : '−')).toBe(true);
      expect(d.task).not.toMatch(/-/);
    }
  });

  it('Divisionen gehen immer auf', () => {
    for (let n = 1; n <= 200; n++) {
      const d = makeDrill(n);
      if (d.kind === 'div') expect(Number.isInteger(d.answer)).toBe(true);
    }
  });
});
