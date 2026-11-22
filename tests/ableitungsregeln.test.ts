import { describe, expect, it } from 'vitest';
import { derive, derivative, evaluate, numericSlope, parse, sameFunction, simplify, toText, type Expr } from '../src/simulations/mathematik/ableitungsregeln/model';

const P = (s: string): Expr => {
  const r = parse(s);
  if (!r.ok) throw new Error(`nicht lesbar: ${s}`);
  return r.e;
};
const D = (s: string) => toText(derivative(P(s)));

describe('Modell: Ableitungsregeln – Lehrbuchwerte', () => {
  it('Produktregel: (x²·sin x)′ = 2x·sin x + x²·cos x, bei x = π: −π²', () => {
    const d = derivative(P('x^2·sin(x)'));
    expect(toText(d)).toBe('2x · sin(x) + x² · cos(x)');
    expect(evaluate(d, Math.PI)).toBeCloseTo(-Math.PI * Math.PI, 10);
    expect(evaluate(d, Math.PI)).toBeCloseTo(-9.8696, 4);
  });
  it('Kettenregel: (e^(2x+1))′ = 2·e^(2x+1)', () => {
    const d = derivative(P('e^(2x+1)'));
    expect(toText(d)).toBe('2 · e^(2x + 1)');
    expect(evaluate(d, 0)).toBeCloseTo(2 * Math.E, 12);
  });
  it('Potenz-, Faktor- und Summenregel', () => {
    expect(D('x^5')).toBe('5x⁴');
    expect(D('3x^4 - 2x + 7')).toBe('12x³ − 2');
    expect(D('-x^2')).toBe('−2x');
    expect(D('5')).toBe('0');
    expect(D('x')).toBe('1');
  });
  it('Grundableitungen sin, cos, e^x, ln, √', () => {
    expect(D('sin(x)')).toBe('cos(x)');
    expect(D('cos(x)')).toBe('−sin(x)');
    expect(D('e^x')).toBe('e^x');
    expect(D('ln(x)')).toBe('1 / x');
    expect(evaluate(derivative(P('sqrt(x)')), 4)).toBeCloseTo(0.25, 12);
    expect(evaluate(derivative(P('tan(x)')), 0)).toBeCloseTo(1, 12);
  });
  it('a·sin(b·(x − c)) + d: Ableitung a·b·cos(b·(x − c))', () => {
    const d = derivative(P('2·sin(3·(x−1)) + 1'));
    expect(toText(d)).toBe('6 · cos(3 · (x − 1))');
    expect(evaluate(d, 1)).toBeCloseTo(6, 12);
  });
  it('Quotientenregel: (1/x)′ = −1/x², ((x+1)/(x²+1))′ bei 0 gleich 1', () => {
    expect(D('1/x')).toBe('−1 / x²');
    expect(evaluate(derivative(P('(x+1)/(x^2+1)')), 0)).toBeCloseTo(1, 12);
  });
  it('Kettenregel mit Potenz: ((2x+1)³)′ = 6·(2x+1)²', () => {
    expect(D('(2x+1)^3')).toBe('6 · (2x + 1)²');
    expect(D('sin(x^2)')).toBe('2x · cos(x²)');
  });
  it('(a^x)′ = a^x · ln a', () => {
    expect(evaluate(derivative(P('2^x')), 1)).toBeCloseTo(2 * Math.log(2), 12);
  });
});

describe('Modell: Ableitungsregeln – Schritte', () => {
  it('Produktregel mit Teilen u und v', () => {
    const { steps } = derive(P('x^2·sin(x)'));
    expect(steps[0]!.rule).toBe('product');
    expect(steps[0]!.depth).toBe(0);
    const [u, v] = steps[0]!.parts;
    expect(toText(u!.expr)).toBe('x²');
    expect(toText(simplify(u!.d!))).toBe('2x');
    expect(toText(v!.expr)).toBe('sin(x)');
    expect(toText(simplify(v!.d!))).toBe('cos(x)');
    expect(steps.map((s) => s.rule)).toEqual(['product', 'power', 'sin']);
  });
  it('Kettenregel mit äußerer und innerer Funktion', () => {
    const { steps } = derive(P('sin(x^2)'));
    expect(steps[0]!.rule).toBe('chain');
    const outer = steps[0]!.parts.find((p) => p.role === 'outer')!;
    const inner = steps[0]!.parts.find((p) => p.role === 'inner')!;
    expect(toText(outer.expr)).toBe('sin(x)');
    expect(toText(inner.expr)).toBe('x²');
    expect(toText(simplify(inner.d!))).toBe('2x');
  });
  it('Faktorregel erkennt konstante Faktoren', () => {
    const { steps } = derive(P('7·cos(x)'));
    expect(steps[0]!.rule).toBe('factor');
    expect(steps[0]!.parts[0]!.role).toBe('c');
  });
});

describe('Modell: Ableitungsregeln – Lesen', () => {
  it('liest Malpunkte, implizite Multiplikation, Hochzahlen, Dezimalkomma', () => {
    expect(toText(simplify(P('2x')))).toBe('2x');
    expect(toText(simplify(P('3sin(x)')))).toBe('3 · sin(x)');
    expect(toText(simplify(P('x²')))).toBe('x²');
    expect(evaluate(P('0,5x'), 4)).toBe(2);
    expect(evaluate(P('x(x+1)'), 2)).toBe(6);
    expect(evaluate(P('sin x'), Math.PI / 2)).toBeCloseTo(1, 12);
    expect(evaluate(P('√x'), 9)).toBe(3);
    expect(evaluate(P('2π'), 0)).toBeCloseTo(2 * Math.PI, 12);
    expect(evaluate(P('[x+1]·2'), 1)).toBe(4);
  });
  it('meldet Fehler', () => {
    expect(parse('').ok).toBe(false);
    expect(parse('2x +').ok).toBe(false);
    expect(parse('(x+1').ok).toBe(false);
    expect(parse('y + 1').ok).toBe(false);
    const r = parse('sin');
    expect(r.ok).toBe(false);
  });
});

describe('Modell: Ableitungsregeln – Kontrolle', () => {
  it('eigene Ableitung wird als gleich erkannt, auch in anderer Form', () => {
    expect(sameFunction(derivative(P('x·e^x')), P('(x+1)·e^x')).equal).toBe(true);
    expect(sameFunction(derivative(P('x^2·sin(x)')), P('2x·sin x + x^2 cos x')).equal).toBe(true);
    expect(sameFunction(derivative(P('sin(2x)')), P('cos(2x)')).equal).toBe(false);
  });
  it('Zufallsprüfung: Ableitung stimmt mit dem Differenzenquotienten überein', () => {
    const terms = ['x^3 - 4x', 'x^2·e^(-x)', 'sin(x)·cos(x)', 'ln(x^2+1)', '(x-2)/(x^2+3)', 'sqrt(x^2+4)', 'e^(sin(x))', '3·cos(2x-1) + x', '(x^2+1)^4', 'x·ln(x^2+1)'];
    for (const s of terms) {
      const f = P(s);
      const d = derivative(f);
      for (let k = -8; k <= 8; k++) {
        const x = k * 0.37 + 0.11;
        const a = evaluate(d, x);
        const b = numericSlope(f, x);
        if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
        expect(a, `${s} bei ${x}`).toBeCloseTo(b, 4);
      }
    }
  });

  it('Betrag: (ln|x|)′ = 1/x und |u| lesen', () => {
    const r = parse('ln(abs(x))');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const d = derivative(r.e);
    for (const x of [-2, -0.5, 0.7, 3]) expect(evaluate(d, x)).toBeCloseTo(1 / x, 10);
    expect(toText(r.e)).toBe('ln(|x|)');
    const b = parse('betrag(2x-1)');
    expect(b.ok && evaluate(b.e, -1)).toBe(3);
  });
});
