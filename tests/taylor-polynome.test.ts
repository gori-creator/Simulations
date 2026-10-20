import { describe, expect, it } from 'vitest';
import {
  coefficients,
  convergenceAt,
  correctDecimals,
  degreeForDecimals,
  errorsOverN,
  fnDerivative,
  FNS,
  lagrangeBound,
  lagrangeSharp,
  matchOrder,
  partialSums,
  polyDerivativeAtCentre,
  remainder,
  sameAsPrevious,
  smallAngleError,
  smallAngleLimit,
  smallAngleRelError,
  smallAngleRelLimit,
  taylor,
  taylorDerivative,
  toDeg,
  toRad,
  validInterval,
} from '../src/simulations/mathematik/taylor-polynome/model';

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

describe('Modell: Taylorpolynome – Prüfwerte der Leitung', () => {
  it('eˣ um 0, x = 1: T₄(1) = 65/24 ≈ 2,708333, Fehler ≈ 0,009948, Lagrange e/5! ≈ 0,022652', () => {
    expect(taylor(FNS.exp, 0, 4, 1)).toBeCloseTo(2.708333, 6);
    expect(Math.E - taylor(FNS.exp, 0, 4, 1)).toBeCloseTo(0.009948, 6);
    expect(lagrangeBound('exp', 0, 4, 1)).toBeCloseTo(0.022652, 6);
  });
  it('eˣ: für 6 richtige Nachkommastellen braucht man n = 9 (T₉(1) ≈ 2,718282)', () => {
    expect(degreeForDecimals(FNS.exp, 0, 1, 6)).toBe(9);
    expect(Math.abs(Math.E - taylor(FNS.exp, 0, 9, 1))).toBeLessThan(5e-7);
    expect(Math.abs(Math.E - taylor(FNS.exp, 0, 8, 1))).toBeGreaterThan(5e-7);
    expect(Math.round(taylor(FNS.exp, 0, 9, 1) * 1e6) / 1e6).toBeCloseTo(2.718282, 9);
    expect(correctDecimals(taylor(FNS.exp, 0, 9, 1), Math.E)).toBe(6);
  });
  it('sin um 0: T₃(0,5) = 0,5 − 0,125/6 ≈ 0,479167; sin 0,5 ≈ 0,479426', () => {
    expect(taylor(FNS.sin, 0, 3, 0.5)).toBeCloseTo(0.5 - 0.125 / 6, 14);
    expect(taylor(FNS.sin, 0, 3, 0.5)).toBeCloseTo(0.479167, 6);
    expect(Math.sin(0.5)).toBeCloseTo(0.479426, 6);
  });
  it('sin: Lagrange n = 3 → 0,5⁴/4! ≈ 0,002604; wegen T₃ = T₄ sogar 0,5⁵/5! ≈ 0,000260', () => {
    expect(lagrangeBound('sin', 0, 3, 0.5)).toBeCloseTo(0.002604, 6);
    const s = lagrangeSharp('sin', 0, 3, 0.5)!;
    expect(s.m).toBe(4);
    expect(s.bound).toBeCloseTo(0.00026, 6);
    expect(Math.abs(remainder(FNS.sin, 0, 3, 0.5))).toBeLessThanOrEqual(s.bound);
  });
  it('Kleinwinkel: |sin x − x| < 0,01 genau für |x| < 0,392493 (≈ 22,5°)', () => {
    const lim = smallAngleLimit(0.01);
    expect(lim).toBeCloseTo(0.392493, 6);
    expect(toDeg(lim)).toBeCloseTo(22.49, 2);
    expect(smallAngleError(lim - 1e-4)).toBeLessThan(0.01);
    expect(smallAngleError(lim + 1e-4)).toBeGreaterThan(0.01);
    // dasselbe wie der ε-Schlauch von T₁
    expect(validInterval(FNS.sin, 0, 1, 0.01, -3, 3)[1]).toBeCloseTo(lim, 5);
  });
  it('Kleinwinkel relativ: Fehler < 1 % bis φ ≈ 0,2441 (≈ 14,0°); bei 20° etwa 2,06 %', () => {
    expect(smallAngleRelLimit(0.01)).toBeCloseTo(0.244097, 5);
    expect(toDeg(smallAngleRelLimit(0.01))).toBeCloseTo(13.99, 1);
    expect(smallAngleRelError(toRad(20))).toBeCloseTo(0.0206, 4);
    expect(smallAngleRelError(0)).toBe(0);
  });
  it('cos um 0: Koeffizienten von T₄ sind 1, 0, −1/2, 0, 1/24', () => {
    const c = coefficients(FNS.cos, 0, 4);
    expect(c[0]).toBeCloseTo(1, 14);
    expect(c[1]).toBe(0);
    expect(c[2]).toBeCloseTo(-0.5, 14);
    expect(c[3]).toBe(0);
    expect(c[4]).toBeCloseTo(1 / 24, 14);
  });
  it('1/(1 − x) um 0: alle Koeffizienten 1, Konvergenzradius 1', () => {
    expect(coefficients(FNS.geo, 0, 10).every((c) => c === 1)).toBe(true);
    expect(FNS.geo.radius(0)).toBe(1);
  });
  it('ln(1 + x) um 0: T₅(1) = 1 − 1/2 + 1/3 − 1/4 + 1/5 ≈ 0,783333; Grenzwert ln 2 ≈ 0,693147', () => {
    expect(taylor(FNS.ln, 0, 5, 1)).toBeCloseTo(0.783333, 6);
    expect(taylor(FNS.ln, 0, 5, 1)).toBeCloseTo(1 - 1 / 2 + 1 / 3 - 1 / 4 + 1 / 5, 14);
    expect(Math.log(2)).toBeCloseTo(0.693147, 6);
    expect(FNS.ln.radius(0)).toBe(1);
    // am Rand x = 1 konvergiert die Reihe noch (langsam, alternierend)
    expect(Math.abs(taylor(FNS.ln, 0, 150, 1) - Math.log(2))).toBeLessThan(1 / 151);
    expect(convergenceAt(FNS.ln, 0, 1)).toBe('edge');
  });
});

describe('Modell: Taylorpolynome – Ableitungen, Partialsummen, Sonderfälle', () => {
  it('Partialsummen: ln(1 + x) bei x = 1 springt 0; 1; 0,5; 0,8333; 0,5833; 0,7833', () => {
    const s = partialSums(FNS.ln, 0, 5, 1);
    [0, 1, 0.5, 0.833333, 0.583333, 0.783333].forEach((v, i) => expect(s[i]).toBeCloseTo(v, 6));
    expect(partialSums(FNS.sin, 0, 9, 0.5)[7]).toBeCloseTo(taylor(FNS.sin, 0, 7, 0.5), 14);
    expect(degreeForDecimals(FNS.sin, 0, 0.5, 6)).toBe(7);
  });
  it('richtige Nachkommastellen: 65/24 gegen e → 1, π ≈ 3,1416 → 4, 3 gegen e → 0, 2 gegen e → −1', () => {
    expect(correctDecimals(65 / 24, Math.E)).toBe(1);
    expect(correctDecimals(3.1416, Math.PI)).toBe(4);
    expect(correctDecimals(3, Math.E)).toBe(0);
    expect(correctDecimals(2, Math.E)).toBe(-1);
    expect(correctDecimals(Math.E, Math.E, 8)).toBe(8);
  });
  it('sin um 0: Tₙ = Tₙ₋₁ für gerade n (der neue Koeffizient ist 0)', () => {
    for (const n of [2, 4, 6, 8]) {
      expect(sameAsPrevious(FNS.sin, 0, n)).toBe(true);
      expect(taylor(FNS.sin, 0, n, 1.3)).toBeCloseTo(taylor(FNS.sin, 0, n - 1, 1.3), 14);
    }
    for (const n of [1, 3, 5]) expect(sameAsPrevious(FNS.sin, 0, n)).toBe(false);
    expect(matchOrder(FNS.sin, 0, 3)).toBe(4);
    expect(matchOrder(FNS.exp, 0, 3)).toBe(3);
  });
  it('n = 0: T₀ ist die waagerechte Gerade y = f(a)', () => {
    for (const x of [-2, 0, 1.5]) expect(taylor(FNS.exp, 0.5, 0, x)).toBeCloseTo(Math.exp(0.5), 14);
    expect(taylorDerivative(FNS.exp, 0.5, 0, 1, 2)).toBe(0);
  });
  it('Ableitungen von Tₙ: T₃′(x) = 1 − x²/2 für sin um 0; T₂ von cos um π hat Krümmung 1', () => {
    expect(taylorDerivative(FNS.sin, 0, 3, 1, 0.8)).toBeCloseTo(1 - 0.32, 14);
    expect(taylorDerivative(FNS.sin, 0, 3, 3, 0.8)).toBeCloseTo(-1, 14);
    expect(taylorDerivative(FNS.cos, Math.PI, 2, 2, 7)).toBeCloseTo(1, 12);
    expect(fnDerivative(FNS.ln, 1, 0.5)).toBeCloseTo(1 / 1.5, 14);
    expect(fnDerivative(FNS.ln, 1, -1.2)).toBeNaN();
    expect(fnDerivative(FNS.geo, 0, 1)).toBeNaN();
  });
  it('Plausibilität (Zufallswerte): Tₙ⁽ᵏ⁾(a) = f⁽ᵏ⁾(a) für alle k ≤ n', () => {
    for (const key of ['sin', 'cos', 'exp', 'ln', 'geo'] as const) {
      const fn = FNS[key];
      for (let i = 0; i < 25; i++) {
        const a = fn.aMin + Math.random() * (fn.aMax - fn.aMin);
        const n = Math.floor(Math.random() * 9);
        for (let k = 0; k <= n; k++) {
          const want = fnDerivative(fn, k, a);
          expect(Math.abs(taylorDerivative(fn, a, n, k, a) - want)).toBeLessThanOrEqual(1e-9 * (1 + Math.abs(want)));
        }
        expect(taylorDerivative(fn, a, n, n + 1, a)).toBe(0);
      }
    }
  });
  it('Plausibilität: Tₙ′ ist Tₙ₋₁ von f′ (sin′ = cos, exp′ = exp)', () => {
    for (let i = 0; i < 30; i++) {
      const a = -2 + Math.random() * 4;
      const x = a + (Math.random() - 0.5) * 3;
      const n = 1 + Math.floor(Math.random() * 10);
      expect(taylorDerivative(FNS.sin, a, n, 1, x)).toBeCloseTo(taylor(FNS.cos, a, n - 1, x), 9);
      expect(taylorDerivative(FNS.exp, a, n, 1, x)).toBeCloseTo(taylor(FNS.exp, a, n - 1, x), 9);
    }
  });
  it('Konvergenzradius: außerhalb wächst |Rₙ| mit n, innerhalb fällt er', () => {
    const out = errorsOverN(FNS.ln, 0, 1.5, 15);
    expect(out[15]!).toBeGreaterThan(out[5]!);
    expect(convergenceAt(FNS.ln, 0, 1.5)).toBe('outside');
    const ins = errorsOverN(FNS.ln, 0, 0.5, 15);
    expect(ins[15]!).toBeLessThan(ins[5]! / 100);
    expect(convergenceAt(FNS.geo, 0, -0.5)).toBe('inside');
    expect(convergenceAt(FNS.exp, 0, 50)).toBe('inside');
  });
  it('geometrische Reihe an x = 1: f nicht definiert, Partialsummen 1, 2, 3, … wachsen ohne Grenze', () => {
    expect(FNS.geo.f(1)).toBeNaN();
    expect(partialSums(FNS.geo, 0, 6, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(partialSums(FNS.geo, 0, 3, -1)).toEqual([1, 0, 1, 0]);
  });
  it('ln(1 + x) mit a nahe −1: winziger Konvergenzradius 1 + a', () => {
    expect(FNS.ln.radius(-0.9)).toBeCloseTo(0.1, 14);
    expect(convergenceAt(FNS.ln, -0.9, -0.75)).toBe('outside');
    expect(Math.abs(remainder(FNS.ln, -0.9, 12, -0.85))).toBeLessThan(1e-3);
  });
});
