import { describe, expect, it } from 'vitest';
import {
  balanceAfter,
  balanceAt,
  centralDiff,
  compound,
  derivative,
  diffQuotient,
  E,
  expBase,
  gapToE,
  isE,
  ln,
  N_STEPS,
  nAt,
  periodOf,
  ratio,
  snapBase,
  stepOf,
  tangent,
  tangentExp,
  tangentZero,
} from '../src/simulations/mathematik/e-funktion/model';
import eFunktion from '../src/simulations/mathematik/e-funktion/index';

describe('Modell: e-Funktion – Grundwerte', () => {
  it('e ≈ 2,718281828', () => {
    expect(E).toBeCloseTo(2.718281828, 9);
  });
  it('e⁰ = 1, e¹ = e, e² ≈ 7,389, e⁻¹ ≈ 0,3679', () => {
    expect(expBase(E, 0)).toBe(1);
    expect(expBase(E, 1)).toBeCloseTo(E, 14);
    expect(expBase(E, 2)).toBeCloseTo(7.389, 3);
    expect(expBase(E, -1)).toBeCloseTo(0.3679, 4);
  });
  it('ln ist die Umkehrfunktion: ln(e²) = 2, ln(1) = 0, e^(ln x) = x', () => {
    expect(ln(E ** 2)).toBeCloseTo(2, 14);
    expect(ln(1)).toBe(0);
    for (const x of [0.1, 0.5, 2, 7.5]) expect(Math.exp(ln(x))).toBeCloseTo(x, 12);
  });
});

describe('Modell: e-Funktion – die besondere Basis', () => {
  it('f′(0) = ln b: b = 2 → 0,6931; b = 3 → 1,0986; b = e → 1', () => {
    expect(derivative(2, 0)).toBeCloseTo(0.6931, 4);
    expect(derivative(3, 0)).toBeCloseTo(1.0986, 4);
    expect(derivative(E, 0)).toBeCloseTo(1, 14);
  });
  it('für b = e gilt f′(x) = f(x)', () => {
    for (const x of [-3, -1, 0, 0.5, 1, 2]) expect(derivative(E, x)).toBeCloseTo(Math.exp(x), 12);
  });
  it('das Verhältnis f′(x)/f(x) = ln b ist für alle x gleich', () => {
    for (const b of [1.5, 2, 3, 4]) {
      for (const x of [-2, 0, 1.3, 2]) expect(derivative(b, x) / expBase(b, x)).toBeCloseTo(ratio(b), 12);
    }
    expect(ratio(E)).toBe(1);
  });
  it('numerischer Differenzenquotient stimmt mit f′(x) = ln b · bˣ überein (Zufallswerte)', () => {
    let seed = 12345;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 200; i++) {
      const b = 1.5 + rnd() * 2.5;
      const x = -3 + rnd() * 5;
      const f = (t: number) => expBase(b, t);
      const exact = derivative(b, x);
      expect(Math.abs(centralDiff(f, x) - exact)).toBeLessThan(1e-6 * (1 + exact));
      // einseitiger Differenzenquotient nähert sich für kleiner werdendes h
      const e1 = Math.abs(diffQuotient(f, x, 1e-2) - exact);
      const e2 = Math.abs(diffQuotient(f, x, 1e-4) - exact);
      expect(e2).toBeLessThan(e1);
    }
  });
  it('rastet nahe e ein (2,71 und 2,72), sonst nicht', () => {
    expect(snapBase(2.72)).toBe(E);
    expect(snapBase(2.71)).toBe(E);
    expect(snapBase(2.7)).toBe(2.7);
    expect(snapBase(2.73)).toBe(2.73);
    expect(isE(2.72)).toBe(true);
    expect(isE(2)).toBe(false);
  });
});

describe('Modell: e-Funktion – Tangente', () => {
  it('Tangente an eˣ in x₀: y = e^x₀ (x − x₀ + 1)', () => {
    for (const x0 of [-2, -0.5, 0, 1, 2]) {
      const t = tangent(E, x0);
      for (const x of [-1, 0, 3]) expect(t.m * x + t.c).toBeCloseTo(tangentExp(x0, x), 10);
      // berührt im Punkt P
      expect(tangentExp(x0, x0)).toBeCloseTo(Math.exp(x0), 12);
    }
  });
  it('in x₀ = 0: y = x + 1', () => {
    const t = tangent(E, 0);
    expect(t.m).toBeCloseTo(1, 14);
    expect(t.c).toBeCloseTo(1, 14);
  });
  it('Nullstelle der Tangente bei x₀ − 1 (Steigungsdreieck: Grundseite 1, Höhe f(x₀))', () => {
    for (const x0 of [-3, -1, 0, 0.7, 2]) {
      expect(tangentZero(x0)).toBe(x0 - 1);
      expect(tangentExp(x0, tangentZero(x0))).toBeCloseTo(0, 12);
      // Höhe des Dreiecks = Steigung · 1 = f(x₀)
      expect(tangent(E, x0).m).toBeCloseTo(Math.exp(x0), 12);
    }
  });
  it('Tangente an 2ˣ in 0 hat die Steigung ln 2', () => {
    expect(tangent(2, 0).m).toBeCloseTo(0.6931, 4);
    expect(tangent(2, 0).c).toBe(1);
  });
});

describe('Modell: e-Funktion – (1 + 1/n)ⁿ', () => {
  it('n = 1 → 2; n = 2 → 2,25; n = 12 → 2,6130; n = 365 → 2,7146', () => {
    expect(compound(1)).toBeCloseTo(2, 12);
    expect(compound(2)).toBeCloseTo(2.25, 12);
    expect(compound(12)).toBeCloseTo(2.613, 4);
    expect(compound(365)).toBeCloseTo(2.7146, 4);
  });
  it('streng wachsend und stets kleiner als e (auch für große n)', () => {
    let prev = 0;
    for (const n of N_STEPS) {
      const a = compound(n);
      expect(a).toBeGreaterThan(prev);
      expect(a).toBeLessThan(E);
      prev = a;
    }
    expect(compound(1e6)).toBeCloseTo(E, 5);
    expect(gapToE(1e6)).toBeGreaterThan(0);
    // Abstand etwa e / (2n)
    expect(gapToE(1e6) / (E / 2e6)).toBeCloseTo(1, 3);
  });
  it('numerisch stabil: n = 10⁹ und 10¹² weichen kaum von e ab', () => {
    expect(compound(1e9)).toBeCloseTo(E, 8);
    expect(compound(1e12)).toBeLessThanOrEqual(E);
    expect(compound(1e12)).toBeCloseTo(E, 10);
  });
  it('Treppe: Kontostand nach k Perioden und zur Zeit t', () => {
    expect(balanceAfter(12, 0)).toBe(1);
    expect(balanceAfter(12, 12)).toBeCloseTo(compound(12), 12);
    expect(balanceAt(4, 0.3)).toBeCloseTo(1.25, 12);
    expect(balanceAt(4, 0.5)).toBeCloseTo(1.5625, 12);
    expect(balanceAt(4, 1)).toBeCloseTo(compound(4), 12);
    expect(balanceAt(1, 0.99)).toBe(1);
  });
  it('Reglerstufen: 1 … 10⁶, streng wachsend, mit Zinsperioden', () => {
    expect(N_STEPS[0]).toBe(1);
    expect(N_STEPS[N_STEPS.length - 1]).toBe(1e6);
    for (let i = 1; i < N_STEPS.length; i++) expect(N_STEPS[i]!).toBeGreaterThan(N_STEPS[i - 1]!);
    expect(nAt(-3)).toBe(1);
    expect(nAt(999)).toBe(1e6);
    expect(nAt(stepOf(365))).toBe(365);
    expect(nAt(stepOf(12))).toBe(12);
    expect(periodOf(12)).toBe('month');
    expect(periodOf(525600)).toBe('minute');
    expect(periodOf(7)).toBeNull();
  });
  it('Regler n der Simulation passt zu den Stufen', () => {
    const def = eFunktion.params.find((q) => q.key === 'ns');
    expect(def && def.type === 'number' ? def.max : -1).toBe(N_STEPS.length - 1);
  });
});
