import { describe, expect, it } from 'vitest';
import { FUNCS, hasLimit, limitOf, table, threshold } from '../src/simulations/mathematik/grenzverhalten/model';

describe('Modell: Grenzverhalten', () => {
  it('Grenzwerte und bestimmte Divergenz', () => {
    expect(limitOf('rat', 1)).toBe(2);
    expect(limitOf('rat2', -1)).toBe(3);
    expect(limitOf('exp', -1)).toBe(0);
    expect(limitOf('exp', 1)).toBe(Infinity);
    expect(limitOf('poly', -1)).toBe(-Infinity);
    expect(hasLimit('poly', 1)).toBe(false);
  });
  it('x_ε für (2x + 1)/(x − 1) = 2 + 3/(x − 1): x_ε = 1 + 3/ε', () => {
    expect(threshold('rat', 1, 0.5)).toBeCloseTo(7, 4);
    expect(threshold('rat', 1, 0.05)).toBeCloseTo(61, 3);
  });
  it('x_ε für 1/x + 1 (x → −∞): −1/ε', () => {
    expect(threshold('inv', -1, 0.25)).toBeCloseTo(-4, 4);
  });
  it('x_ε für (3x² + 1)/(x² + 1): √(2/ε − 1)', () => {
    expect(threshold('rat2', 1, 0.2)).toBeCloseTo(3, 4);
    expect(threshold('rat2', 1, 0.5)).toBeCloseTo(Math.sqrt(3), 4);
  });
  it('x_ε für 2ˣ (x → −∞): log₂ ε', () => {
    expect(threshold('exp', -1, 0.25)).toBeCloseTo(-2, 4);
  });
  it('sin(x)/x: Hinter x_ε bleibt der Graph im Streifen', () => {
    const xe = threshold('osc', 1, 0.1);
    expect(xe).toBeGreaterThan(8);
    expect(xe).toBeLessThan(10);
    for (let x = xe + 1e-6; x < 400; x += 0.01) expect(Math.abs(FUNCS.osc.f(x))).toBeLessThan(0.1);
    // kurz davor ist der Abstand mindestens ε
    expect(Math.abs(FUNCS.osc.f(xe - 1e-6))).toBeGreaterThanOrEqual(0.0999999);
  });
  it('Wertetabelle: Abstand zur Asymptote wird kleiner', () => {
    const t = table('rat', 1);
    expect(Number.isNaN(t[0]!.y)).toBe(true); // Definitionslücke bei x = 1
    expect(t[1]!.y).toBeCloseTo(21 / 9, 12);
    expect(t[2]!.d).toBeCloseTo(3 / 99, 12);
    expect(t[4]!.d).toBeLessThan(t[3]!.d);
  });
  it('Plausibilität: x_ε passt für viele ε (Bedingung danach erfüllt, davor verletzt)', () => {
    for (const key of ['inv', 'rat', 'rat2', 'osc'] as const) {
      for (const dir of [1, -1] as const) {
        for (let eps = 0.05; eps <= 1; eps += 0.15) {
          const xe = threshold(key, dir, eps);
          const L = limitOf(key, dir);
          for (const off of [1e-4, 0.5, 3, 40]) {
            const x = xe + dir * off;
            const v = FUNCS[key].f(x);
            expect(Math.abs(v - L)).toBeLessThan(eps);
          }
        }
      }
    }
  });
});
