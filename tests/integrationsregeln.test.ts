import { describe, expect, it } from 'vitest';
import { evaluate, parse, toText, type Expr } from '../src/sim-core/expr';
import { checkAntiderivative, definite, expAnsatz, integrate, isPolynomial, linearCoeffs, NotIntegrable, polyCoeffs, simpson } from '../src/simulations/mathematik/integrationsregeln/model';

const P = (s: string): Expr => {
  const r = parse(s);
  if (!r.ok) throw new Error('parse ' + s);
  return r.e;
};

describe('Integrationsregeln', () => {
  const cases = [
    'x^2', '3x^4-2x+7', '1/x', 'x^(-2)', 'sqrt(x)', 'e^x', 'sin(x)', 'cos(x)',
    'cos(2x)', 'e^(2x+1)', '(2x+1)^3', '1/(2x+1)', 'sin(3x-1)', '2^x',
    'x*e^x', 'x^2*e^(-x)', 'x*sin(x)', 'x*cos(2x)', 'ln(x)', 'x*ln(x)',
    '2x*e^(x^2)', 'x/(x^2+1)', '2x*(x^2+1)^3', 'cos(x)*sin(x)^2', 'x*sqrt(x^2+1)',
    '(x+1)*(x-2)', '3/x^2', 'e^(-x)*(x+1)',
  ];
  for (const s of cases) {
    it(`Probe F′ = f für ${s}`, () => {
      const f = P(s);
      const { F, steps } = integrate(f);
      expect(steps.length).toBeGreaterThan(0);
      expect(checkAntiderivative(F, f), `${s} → ${toText(F)}`).toBe(true);
    });
  }

  it('Lehrbuchwerte bestimmter Integrale', () => {
    expect(definite(integrate(P('x*e^x')).F, 0, 1)).toBeCloseTo(1, 10);
    expect(definite(integrate(P('sin(x)')).F, 0, Math.PI)).toBeCloseTo(2, 10);
    expect(definite(integrate(P('x^2')).F, 0, 3)).toBeCloseTo(9, 10);
    expect(definite(integrate(P('1/x')).F, 1, Math.E)).toBeCloseTo(1, 10);
    expect(definite(integrate(P('ln(x)')).F, 1, Math.E)).toBeCloseTo(1, 10);
    expect(definite(integrate(P('x*sin(x)')).F, 0, Math.PI)).toBeCloseTo(Math.PI, 10);
  });

  it('∫cos(2x) dx = ½ sin(2x)', () => {
    const { F, steps } = integrate(P('cos(2x)'));
    expect(evaluate(F, 0.7)).toBeCloseTo(0.5 * Math.sin(1.4), 12);
    expect(steps[0]!.rule).toBe('linear');
    expect(steps[0]!.info?.a).toBe(2);
  });

  it('Regel der äußersten Ebene', () => {
    expect(integrate(P('x*e^x')).steps[0]!.rule).toBe('parts');
    expect(integrate(P('2x*e^(x^2)')).steps[0]!.rule).toBe('subst');
    expect(integrate(P('x/(x^2+1)')).steps[0]!.rule).toBe('logsubst');
    expect(integrate(P('x^2+x')).steps[0]!.rule).toBe('sum');
    expect(integrate(P('5*x^2')).steps[0]!.rule).toBe('factor');
    expect(integrate(P('1/x')).steps[0]!.rule).toBe('recip');
  });

  it('partielle Integration: u, v′, v', () => {
    const st = integrate(P('x*e^x')).steps[0]!;
    expect(toText(st.info!.u!)).toBe('x');
    expect(toText(st.info!.v!)).toBe('e^x');
  });

  it('keine elementare Stammfunktion', () => {
    expect(() => integrate(P('e^(x^2)'))).toThrow(NotIntegrable);
    expect(() => integrate(P('sin(x)/x'))).toThrow(NotIntegrable);
  });

  it('Simpson stimmt mit F(b) − F(a) überein', () => {
    const f = P('x^2*e^(-x)');
    expect(simpson(f, 0, 2)).toBeCloseTo(definite(integrate(f).F, 0, 2), 8);
  });

  it('Hilfsfunktionen', () => {
    expect(linearCoeffs(P('3x-2'))).toEqual({ a: 3, b: -2 });
    expect(linearCoeffs(P('x^2'))).toBeNull();
    expect(isPolynomial(P('(x+1)^2'))).toBe(true);
    expect(isPolynomial(P('sin(x)'))).toBe(false);
    expect(polyCoeffs(P('(x+1)^2'))).toEqual([1, 2, 1]);
  });

  it('Formansatz (x² + 1)·eˣ → (x² − 2x + 3)·eˣ', () => {
    const a = expAnsatz(P('(x^2+1)*e^x'))!;
    expect(a.degree).toBe(2);
    expect(a.q).toEqual([3, -2, 1]);
    expect(a.equations.length).toBe(3);
  });

  it('Formansatz x·e^(−2x)', () => {
    const a = expAnsatz(P('x*e^(-2x)'))!;
    expect(a.q[1]).toBeCloseTo(-0.5, 12);
    expect(a.q[0]).toBeCloseTo(-0.25, 12);
    expect(expAnsatz(P('sin(x)'))).toBeNull();
  });
});
