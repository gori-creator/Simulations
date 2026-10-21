import { describe, expect, it } from 'vitest';
import { differenceQuotient, FUNCTIONS, isDifferentiable, isExactAt } from '../src/simulations/mathematik/sekante-tangente/model';

const { x2, cubic, sin, exp, abs } = FUNCTIONS;

describe('Sekante und Tangente: Differenzenquotient', () => {
  it('liefert die Lehrbuchwerte für x² bei x₀ = 1 (m_s = 2 + h)', () => {
    expect(differenceQuotient(x2.f, 1, 1)).toBeCloseTo(3, 12);
    expect(differenceQuotient(x2.f, 1, 0.5)).toBeCloseTo(2.5, 12);
    expect(differenceQuotient(x2.f, 1, 0.1)).toBeCloseTo(2.1, 12);
    expect(differenceQuotient(x2.f, 1, 0.01)).toBeCloseTo(2.01, 10);
    expect(differenceQuotient(x2.f, 1, 0.001)).toBeCloseTo(2.001, 9);
  });

  it('funktioniert mit negativem h (Q links von P): m_s = 2x₀ + h', () => {
    expect(differenceQuotient(x2.f, 1, -1.5)).toBeCloseTo(0.5, 12);
    expect(differenceQuotient(x2.f, 1, -0.1)).toBeCloseTo(1.9, 12);
    expect(differenceQuotient(x2.f, -2, 1)).toBeCloseTo(-3, 12);
    expect(differenceQuotient(x2.f, -2, -0.001)).toBeCloseTo(-4.001, 9);
  });

  it('ist für h = 0 nicht definiert (keine Division durch 0)', () => {
    expect(differenceQuotient(x2.f, 1, 0)).toBeNaN();
  });

  it('nähert sich für h → 0 der Ableitung (von beiden Seiten)', () => {
    for (const def of [x2, cubic, sin, exp]) {
      for (const x0 of [-1, 0, 0.5, 1.15, 2]) {
        for (const h of [1e-4, -1e-4]) {
          expect(differenceQuotient(def.f, x0, h)).toBeCloseTo(def.df(x0), 3);
        }
      }
    }
  });

  it('stimmt mit den Werten im Lernmaterial überein', () => {
    // Kubische Funktion: waagrechte Tangenten bei ±2/√3 ≈ ±1,15
    const xs = 2 / Math.sqrt(3);
    expect(cubic.df(xs)).toBeCloseTo(0, 12);
    expect(cubic.df(-xs)).toBeCloseTo(0, 12);
    expect(xs).toBeCloseTo(1.15, 2);
    // Sinus: Steigung 1 bei x = 0, m_s(h = 1) = sin 1
    expect(differenceQuotient(sin.f, 0, 1)).toBeCloseTo(0.8415, 4);
    expect(sin.df(0)).toBe(1);
    // e-Funktion bei 0: (e^1,2 − 1)/1,2, Grenzwert 1
    expect(differenceQuotient(exp.f, 0, 1.2)).toBeCloseTo(1.9334, 4);
    expect(exp.df(0)).toBe(1);
  });
});

describe('Sekante und Tangente: Knick bei |x|', () => {
  it('hat bei 0 rechts den Differenzenquotienten 1 und links −1', () => {
    for (const h of [1, 0.1, 0.001]) {
      expect(differenceQuotient(abs.f, 0, h)).toBe(1);
      expect(differenceQuotient(abs.f, 0, -h)).toBe(-1);
    }
  });

  it('ist bei 0 nicht differenzierbar, sonst schon', () => {
    expect(isDifferentiable(abs, 0)).toBe(false);
    expect(isDifferentiable(abs, 1)).toBe(true);
    expect(abs.df(-2)).toBe(-1);
    expect(abs.df(0.5)).toBe(1);
    for (const def of [x2, cubic, sin, exp]) expect(isDifferentiable(def, 0)).toBe(true);
  });
});

describe('Sekante und Tangente: „=“ oder „≈“', () => {
  it('erkennt exakte und gerundete Werte', () => {
    expect(isExactAt(2.5, 3)).toBe(true);
    expect(isExactAt(differenceQuotient(x2.f, 1, 0.1), 3)).toBe(true); // 2,1 trotz Rundungsrest
    expect(isExactAt(0.99998, 4)).toBe(false);
    expect(isExactAt(Math.cos(0.5), 3)).toBe(false);
    expect(isExactAt(-4, 3)).toBe(true);
  });
});
