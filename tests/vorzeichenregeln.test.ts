import { describe, expect, it } from 'vitest';
import { balanceAfter, jumps, patternRows, quotient, sign, signRule } from '../src/simulations/mathematik/vorzeichenregeln/model';

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
