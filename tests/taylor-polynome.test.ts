import { describe, expect, it } from 'vitest';
import { coefficients, FNS, lagrangeBound, polyDerivativeAtCentre, remainder, taylor, validInterval } from '../src/simulations/mathematik/taylor-polynome/model';

describe('Modell: Taylorpolynome', () => {
  it('sin um 0: x − x³/6 + x⁵/120', () => {
    const c = coefficients(FNS.sin, 0, 5);
    expect(c[0]).toBe(0);
    expect(c[1]).toBeCloseTo(1, 14);
    expect(c[2]).toBe(0);
    expect(c[3]).toBeCloseTo(-1 / 6, 14);
    expect(c[5]).toBeCloseTo(1 / 120, 14);
  });
  it('eˣ um 0: T₄(1) = 1 + 1 + 1/2 + 1/6 + 1/24 = 2,7083', () => {
    expect(taylor(FNS.exp, 0, 4, 1)).toBeCloseTo(65 / 24, 13);
    expect(taylor(FNS.exp, 0, 15, 1)).toBeCloseTo(Math.E, 11);
  });
  it('ln(1 + x) um 0: x − x²/2 + x³/3; Konvergenzradius 1', () => {
    const c = coefficients(FNS.ln, 0, 3);
    expect(c).toEqual([0, 1, -0.5, 1 / 3]);
    expect(FNS.ln.radius(0)).toBe(1);
    expect(FNS.ln.radius(1)).toBe(2);
  });
  it('1/(1 − x) um 0: alle Koeffizienten 1 (geometrische Reihe)', () => {
    expect(coefficients(FNS.geo, 0, 6)).toEqual([1, 1, 1, 1, 1, 1, 1]);
    expect(taylor(FNS.geo, 0, 30, 0.5)).toBeCloseTo(2, 8);
  });
  it('cos um π: Tₙ stimmt in den Ableitungen überein (T₂(x) = −1 + (x − π)²/2)', () => {
    const c = coefficients(FNS.cos, Math.PI, 2);
    expect(c[0]).toBeCloseTo(-1, 14);
    expect(c[1]).toBeCloseTo(0, 14);
    expect(c[2]).toBeCloseTo(0.5, 14);
  });
  it('außerhalb des Konvergenzintervalls wächst der Fehler mit n', () => {
    const e = [10, 20, 30].map((n) => Math.abs(remainder(FNS.geo, 0, n, 1.5)));
    expect(e[1]).toBeGreaterThan(e[0]!);
    expect(e[2]).toBeGreaterThan(e[1]!);
  });
  it('Plausibilität: Fehler fällt mit n innerhalb des Konvergenzbereichs', () => {
    for (const key of ['sin', 'cos', 'exp', 'ln', 'geo'] as const) {
      const fn = FNS[key];
      for (let i = 0; i < 20; i++) {
        const a = fn.aMin + Math.random() * (fn.aMax - fn.aMin);
        const r = Math.min(fn.radius(a), 3);
        const x = a + (Math.random() - 0.5) * r;
        expect(Math.abs(remainder(fn, a, 40, x))).toBeLessThan(1e-3);
      }
    }
  });
});

describe('Modell: Taylorpolynome – Schmiegen, Gültigkeitsbereich, Restglied', () => {
  it('Tₙ hat bei a dieselben Ableitungen wie f (k ≤ n), danach 0', () => {
    for (let k = 0; k <= 5; k++) expect(polyDerivativeAtCentre(FNS.exp, 0.5, 5, k)).toBeCloseTo(Math.exp(0.5), 12);
    expect(polyDerivativeAtCentre(FNS.sin, 0, 3, 3)).toBeCloseTo(-1, 14);
    expect(polyDerivativeAtCentre(FNS.sin, 0, 3, 4)).toBe(0);
  });
  it('Gültigkeitsbereich: |sin x − x| < 0,01 für |x| < 0,3925', () => {
    const [l, r] = validInterval(FNS.sin, 0, 1, 0.01, -7, 7);
    expect(r).toBeCloseTo(0.392493, 4);
    expect(l).toBeCloseTo(-0.392493, 4);
  });
  it('Gültigkeitsbereich wächst mit n: sin, ε = 0,01, n = 3 → |x| < 1,0425', () => {
    expect(validInterval(FNS.sin, 0, 3, 0.01, -7, 7)[1]).toBeCloseTo(1.042507, 4);
  });
  it('eˣ, n = 4, ε = 0,01: Bereich [−1,0726; 1,0010] (unsymmetrisch)', () => {
    const [l, r] = validInterval(FNS.exp, 0, 4, 0.01, -4, 4);
    expect(l).toBeCloseTo(-1.072578, 4);
    expect(r).toBeCloseTo(1.000996, 4);
  });
  it('geometrische Reihe: Bereich bleibt im Konvergenzintervall (−1; 1)', () => {
    const [l, r] = validInterval(FNS.geo, 0, 15, 0.01, -3, 3);
    expect(l).toBeGreaterThan(-1);
    expect(r).toBeLessThan(1);
  });
  it('Lagrange: eˣ, a = 0, n = 4, x = 1: Schranke e/120 ≈ 0,02265 ≥ wahrer Fehler 0,00995', () => {
    const b = lagrangeBound('exp', 0, 4, 1)!;
    expect(b).toBeCloseTo(Math.E / 120, 12);
    expect(Math.abs(remainder(FNS.exp, 0, 4, 1))).toBeLessThanOrEqual(b);
    expect(lagrangeBound('ln', 0, 4, 0.5)).toBeNull();
  });
  it('Lagrange-Schranke gilt für sin/cos/exp an vielen Zufallsstellen', () => {
    for (const key of ['sin', 'cos', 'exp'] as const) {
      for (let i = 0; i < 50; i++) {
        const a = FNS[key].aMin + Math.random() * (FNS[key].aMax - FNS[key].aMin);
        const x = a + (Math.random() - 0.5) * 6;
        const n = Math.floor(Math.random() * 10);
        expect(Math.abs(remainder(FNS[key], a, n, x))).toBeLessThanOrEqual(lagrangeBound(key, a, n, x)! * (1 + 1e-9) + 1e-12);
      }
    }
  });
});
