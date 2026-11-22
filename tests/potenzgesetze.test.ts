import { describe, expect, it } from 'vitest';
import { expText, factorize, intRoot, monoText, monoValue, parseTerm, powQ, q, qval, rootText, sameTerm, simplify, type Mono } from '../src/simulations/mathematik/potenzgesetze/model';

const S = (src: string): { mono: Mono; text: string; laws: string[] } => {
  const r = parseTerm(src);
  if (!r.ok) throw new Error(`parse ${src}: ${r.msg}@${r.pos}`);
  const { mono, steps } = simplify(r.node);
  return { mono, text: monoText(mono), laws: steps.map((s) => s.law) };
};

describe('Potenzgesetze: Lehrbuchwerte', () => {
  it('2³·2⁴ = 2⁷ = 128', () => {
    const r = S('2^3 · 2^4');
    expect(monoValue(r.mono)).toBe(128);
    expect(r.text).toBe('128');
    expect(r.laws).toContain('mulSame');
  });
  it('8^(2/3) = 4', () => {
    expect(powQ(q(8), q(2, 3)).exact).toEqual(q(4));
    expect(S('8^(2/3)').text).toBe('4');
  });
  it('4^(−1/2) = 0,5', () => {
    expect(powQ(q(4), q(-1, 2)).exact).toEqual(q(1, 2));
    expect(S('4^(-1/2)').text).toBe('1 / 2');
  });
  it('√2 · √8 = 4', () => {
    const r = S('√2 · √8');
    expect(r.text).toBe('4');
    expect(r.laws.filter((l) => l === 'root')).toHaveLength(2);
  });
});

describe('Potenzgesetze: Termumformung', () => {
  it('aᵐ·aⁿ, aᵐ:aⁿ, (aᵐ)ⁿ', () => {
    expect(S('a^3 · a^4').text).toBe('a⁷');
    expect(S('a^7 : a^3').text).toBe('a⁴');
    expect(S('(x^2)^3').text).toBe('x⁶');
    expect(S('(x^2)^3').laws).toEqual(['powPow']);
  });
  it('(a·b)ⁿ und (a/b)ⁿ', () => {
    expect(S('(2a)^3').text).toBe('8 · a³');
    expect(S('(2a)^3').laws).toContain('prodPow');
    expect(S('(a/b)^2').text).toBe('a² / b²');
  });
  it('negative und Null-Exponenten', () => {
    expect(S('a^2 / a^5').text).toBe('1 / a³');
    expect(S('a^0').text).toBe('1');
    expect(S('a^0').laws).toEqual(['zero']);
    expect(S('2^(-3)').text).toBe('1 / 8');
  });
  it('Wurzeln und gebrochene Exponenten', () => {
    expect(S('root(3, a^6)').text).toBe('a²');
    expect(S('√(x^3) · √x').text).toBe('x²');
    expect(S('a^(1/2) · a^(1/3)').text).toBe('a^(5/6)');
    expect(monoText(S('√12').mono)).toBe('2 · 3^(1/2)');
    expect(monoText(S('√12').mono, true)).toBe('2 · √3');
  });
  it('gemischt: (a^2 b)^3 / (a^4 b^2)', () => {
    expect(S('(a^2 b)^3 / (a^4 b^2)').text).toBe('a² · b');
  });
  it('Zahlenwert mit Variablen', () => {
    const r = S('(x^2)^3 / x^4');
    expect(monoValue(r.mono, { x: 3 })).toBe(9);
  });
  it('gleichwertige Terme erkennen', () => {
    const P = (s: string) => {
      const r = parseTerm(s);
      if (!r.ok) throw new Error(s);
      return r.node;
    };
    expect(sameTerm(P('a^3 · a^4'), P('a^7'))).toBe(true);
    expect(sameTerm(P('a^3 · a^4'), P('a^12'))).toBe(false);
    expect(sameTerm(P('8^(2/3)'), P('4'))).toBe(true);
    expect(sameTerm(P('x^(-2)'), P('1/x^2'))).toBe(true);
  });
  it('Fehler', () => {
    expect(parseTerm('').ok).toBe(false);
    expect(parseTerm('a^').ok).toBe(false);
    expect(parseTerm('(a^2').ok).toBe(false);
    expect(parseTerm('2^(1/0)').ok).toBe(false);
    expect(parseTerm('a + b').ok).toBe(false);
  });
});

describe('Potenzgesetze: Hilfen', () => {
  it('Wurzeln, Primfaktoren, Text', () => {
    expect(intRoot(27, 3)).toBe(3);
    expect(intRoot(28, 3)).toBeNull();
    expect([...factorize(360)]).toEqual([
      [2, 3],
      [3, 2],
      [5, 1],
    ]);
    expect(expText(q(-3))).toBe('⁻³');
    expect(expText(q(2, 3))).toBe('^(2/3)');
    expect(rootText('a', q(2, 3))).toBe('³√(a²)');
    expect(powQ(q(2), q(1, 2)).exact).toBeNull();
    expect(qval(q(6, 4))).toBe(1.5);
    expect(powQ(q(27, 8), q(-2, 3)).exact).toEqual(q(4, 9));
  });
});
