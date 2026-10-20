import { describe, expect, it } from 'vitest';
import {
  asymptotes,
  commonPoints,
  compareAt,
  compareIntervals,
  compress,
  curveClass,
  curveKind,
  domain,
  EXPONENTS,
  expand,
  intersections,
  isDefinedAt,
  limits,
  monotony,
  morphValue,
  power,
  range,
  symmetry,
  valueTable,
} from '../src/simulations/mathematik/potenzfunktionen/model';

/** Kleiner reproduzierbarer Zufallsgenerator (LCG). */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Modell: Potenzfunktionen – Funktionswerte', () => {
  it('positive Exponenten (Prüfwerte der Leitung)', () => {
    expect(power(1, 2, -2)).toBe(4);
    expect(power(1, 2, 3)).toBe(9);
    expect(power(1, 3, -2)).toBe(-8);
    expect(power(0.5, 4, 2)).toBe(8);
  });

  it('negative Exponenten (Prüfwerte der Leitung)', () => {
    expect(power(1, -1, 2)).toBeCloseTo(0.5, 12);
    expect(power(1, -1, -4)).toBeCloseTo(-0.25, 12);
    expect(power(1, -2, 2)).toBeCloseTo(0.25, 12);
    expect(power(1, -2, -2)).toBeCloseTo(0.25, 12);
    expect(power(-2, -3, 1)).toBeCloseTo(-2, 12);
    expect(power(-2, -3, -1)).toBeCloseTo(2, 12);
  });

  it('n = 0: f(x) = a für x ≠ 0, 0⁰ wird nicht betrachtet', () => {
    for (const x of [-3, -0.5, 0.1, 2.7]) expect(power(1.5, 0, x)).toBe(1.5);
    expect(power(1.5, 0, 0)).toBeNaN();
    expect(isDefinedAt(0, 0)).toBe(false);
    expect(domain(0)).toBe('R\\0');
    expect(range(1.5, 0)).toBe('const');
  });

  it('n < 0 ist bei 0 nicht definiert, n > 0 schon (f(0) = 0)', () => {
    for (const n of [-4, -3, -2, -1]) {
      expect(power(1, n, 0)).toBeNaN();
      expect(isDefinedAt(n, 0)).toBe(false);
      expect(domain(n)).toBe('R\\0');
    }
    for (const n of [1, 2, 3, 4, 5, 6]) {
      expect(power(2, n, 0)).toBe(0);
      expect(domain(n)).toBe('R');
    }
  });

  it('Wertetabelle mit nicht definierten Stellen', () => {
    expect(valueTable(1, -1, [-2, -1, 0, 1, 2])).toEqual([
      { x: -2, y: -0.5 },
      { x: -1, y: -1 },
      { x: 0, y: null },
      { x: 1, y: 1 },
      { x: 2, y: 0.5 },
    ]);
    expect(valueTable(1, 3, [-2, 0, 2]).map((r) => r.y)).toEqual([-8, 0, 8]);
  });
});

describe('Modell: Potenzfunktionen – Symmetrie und Klassen', () => {
  it('gerades n: f(−x) = f(x), ungerades n: f(−x) = −f(x) (Zufallswerte)', () => {
    const r = rng(42);
    for (let i = 0; i < 400; i++) {
      const n = EXPONENTS[Math.floor(r() * EXPONENTS.length)]!;
      const a = Math.round((r() * 6 - 3) * 10) / 10;
      const x = (r() * 6 - 3) || 0.7;
      const f = power(a, n, x);
      const fm = power(a, n, -x);
      if (symmetry(n) === 'axis') expect(fm).toBeCloseTo(f, 9);
      else expect(fm).toBeCloseTo(-f, 9);
    }
  });

  it('ordnet die Klassen und Kurvennamen zu', () => {
    expect(curveClass(2)).toBe('evenPos');
    expect(curveClass(6)).toBe('evenPos');
    expect(curveClass(1)).toBe('oddPos');
    expect(curveClass(5)).toBe('oddPos');
    expect(curveClass(-2)).toBe('evenNeg');
    expect(curveClass(-4)).toBe('evenNeg');
    expect(curveClass(-1)).toBe('oddNeg');
    expect(curveClass(-3)).toBe('oddNeg');
    expect(curveClass(0)).toBe('const');
    expect(curveKind(4)).toEqual({ kind: 'parabola', order: 4 });
    expect(curveKind(1)).toEqual({ kind: 'line', order: 1 });
    expect(curveKind(0)).toEqual({ kind: 'constant', order: 0 });
    expect(curveKind(-3)).toEqual({ kind: 'hyperbola', order: 3 });
    expect(symmetry(0)).toBe('axis');
    expect(symmetry(-3)).toBe('point');
  });

  it('Wertemengen', () => {
    expect(range(1, 2)).toBe('R0+');
    expect(range(-0.5, 4)).toBe('R0-');
    expect(range(2, 3)).toBe('R');
    expect(range(1, -2)).toBe('R+');
    expect(range(-1, -2)).toBe('R-');
    expect(range(1, -1)).toBe('R\\0');
    expect(range(-2, -3)).toBe('R\\0');
    expect(range(0, 3)).toBe('const');
  });

  it('Monotonie (a > 0 und gespiegelt für a < 0)', () => {
    expect(monotony(1, 2)).toEqual({ left: 'dec', right: 'inc', whole: false });
    expect(monotony(-1, 2)).toEqual({ left: 'inc', right: 'dec', whole: false });
    expect(monotony(1, 3)).toEqual({ left: 'inc', right: 'inc', whole: true });
    expect(monotony(1, -2)).toEqual({ left: 'inc', right: 'dec', whole: false });
    expect(monotony(1, -1)).toEqual({ left: 'dec', right: 'dec', whole: false });
    expect(monotony(-2, -3)).toEqual({ left: 'inc', right: 'inc', whole: false });
    expect(monotony(1, 0).left).toBe('const');
  });

  it('Monotonie stimmt mit Funktionswerten überein (Zufallswerte)', () => {
    const r = rng(7);
    for (let i = 0; i < 300; i++) {
      const n = EXPONENTS[Math.floor(r() * EXPONENTS.length)]!;
      if (n === 0) continue;
      const a = r() < 0.5 ? -(0.2 + r() * 2.8) : 0.2 + r() * 2.8;
      const side = r() < 0.5 ? -1 : 1;
      const x1 = side * (0.05 + r() * 3);
      const x2 = side * (0.05 + r() * 3);
      if (Math.abs(x1 - x2) < 1e-3) continue;
      const [lo, hi] = x1 < x2 ? [x1, x2] : [x2, x1];
      const trend = side < 0 ? monotony(a, n).left : monotony(a, n).right;
      const d = power(a, n, hi) - power(a, n, lo);
      expect(Math.sign(d)).toBe(trend === 'inc' ? 1 : -1);
    }
  });

  it('Grenzverhalten und Asymptoten', () => {
    expect(limits(1, 2)).toEqual({ negInf: '+inf', posInf: '+inf', zeroLeft: 0, zeroRight: 0 });
    expect(limits(1, 3)).toEqual({ negInf: '-inf', posInf: '+inf', zeroLeft: 0, zeroRight: 0 });
    expect(limits(-1, 3)).toEqual({ negInf: '+inf', posInf: '-inf', zeroLeft: 0, zeroRight: 0 });
    expect(limits(1, -1)).toEqual({ negInf: 0, posInf: 0, zeroLeft: '-inf', zeroRight: '+inf' });
    expect(limits(1, -2)).toEqual({ negInf: 0, posInf: 0, zeroLeft: '+inf', zeroRight: '+inf' });
    expect(limits(-2, -3)).toEqual({ negInf: 0, posInf: 0, zeroLeft: '+inf', zeroRight: '-inf' });
    expect(limits(2, 0).posInf).toBe(2);
    expect(asymptotes(-2)).toEqual({ vertical: 0, horizontal: 0 });
    expect(asymptotes(3)).toEqual({ vertical: null, horizontal: null });
    expect(asymptotes(0)).toEqual({ vertical: null, horizontal: null });
    // Plausibilität: weit draußen bzw. nah an 0
    expect(power(1, -2, 1000)).toBeLessThan(1e-5);
    expect(power(1, -1, -1e-4)).toBeLessThan(-1e3);
  });
});

describe('Modell: Potenzfunktionen – gemeinsame Punkte und Vergleich', () => {
  it('für a = 1: (1 | 1), gerade (−1 | 1), ungerade (−1 | −1), n > 0 durch (0 | 0)', () => {
    for (const n of EXPONENTS) {
      expect(power(1, n, 1)).toBe(1);
      expect(power(1, n, -1)).toBe(n % 2 === 0 ? 1 : -1);
      if (n > 0) expect(power(1, n, 0)).toBe(0);
      else expect(power(1, n, 0)).toBeNaN();
      // commonPoints liefert genau diese Punkte, und sie liegen auf dem Graphen
      for (const [x, y] of commonPoints(1, n)) expect(power(1, n, x)).toBe(y);
    }
    expect(commonPoints(1, 2)).toEqual([
      [-1, 1],
      [0, 0],
      [1, 1],
    ]);
    expect(commonPoints(1, -3)).toEqual([
      [-1, -1],
      [1, 1],
    ]);
    expect(commonPoints(2, 3)).toEqual([
      [-1, -2],
      [0, 0],
      [1, 2],
    ]);
  });

  it('x² und x⁴ schneiden sich bei −1, 0 und 1; für 0 < |x| < 1 ist x⁴ < x²', () => {
    expect(intersections(1, 2, 4)).toEqual([-1, 0, 1]);
    for (const x of [-0.99, -0.5, -0.1, 0.1, 0.5, 0.99]) expect(power(1, 4, x)).toBeLessThan(power(1, 2, x));
    for (const x of [-3, -1.01, 1.01, 2]) expect(power(1, 4, x)).toBeGreaterThan(power(1, 2, x));
    expect(compareIntervals(1, 2, 4)).toEqual([
      { from: -Infinity, to: -1, sign: -1 },
      { from: -1, to: 1, sign: 1 },
      { from: 1, to: Infinity, sign: -1 },
    ]);
    expect(compareAt(1, 2, 4, 1)).toBe(0);
  });

  it('weitere Schnittstellen', () => {
    expect(intersections(1, 2, 3)).toEqual([0, 1]);
    expect(intersections(1, 1, 3)).toEqual([-1, 0, 1]);
    expect(intersections(1, -1, -3)).toEqual([-1, 1]);
    expect(intersections(1, 2, -2)).toEqual([-1, 1]);
    expect(intersections(1, 1, -2)).toEqual([1]);
    expect(intersections(1, 2, 0)).toEqual([-1, 1]);
    expect(intersections(0, 2, 4)).toBeNull();
    expect(intersections(1, 3, 3)).toBeNull();
    // jede Schnittstelle liegt auf beiden Graphen
    for (const n of EXPONENTS)
      for (const m of EXPONENTS) {
        const xs = intersections(-1.5, n, m);
        if (!xs) continue;
        for (const x of xs) expect(power(-1.5, n, x)).toBeCloseTo(power(-1.5, m, x), 12);
      }
  });

  it('Vergleich auf Intervallen stimmt mit Stichproben überein', () => {
    const r = rng(3);
    for (const n of EXPONENTS)
      for (const m of EXPONENTS) {
        if (n === m) continue;
        const iv = compareIntervals(1, n, m);
        for (let k = 0; k < 20; k++) {
          const x = r() * 8 - 4;
          if (Math.abs(x) < 1e-3 || Math.abs(Math.abs(x) - 1) < 1e-3) continue;
          const part = iv.find((q) => q.from < x && x < q.to)!;
          expect(compareAt(1, n, m, x)).toBe(part.sign);
        }
      }
  });
});

describe('Modell: Potenzfunktionen – Übergang zwischen Graphen', () => {
  it('reine Gewichte liefern genau den Funktionswert', () => {
    for (const n of EXPONENTS)
      for (const x of [-2.5, -1, -0.3, 0.4, 1, 2]) expect(morphValue([{ n, w: 1 }], 0.5, x, 4)).toBeCloseTo(power(0.5, n, x), 9);
    expect(expand(compress(3.7, 2), 2)).toBeCloseTo(3.7, 12);
  });

  it('Mischung bleibt endlich und stetig im Gewicht (auch an der Polstelle)', () => {
    let prev = morphValue([{ n: 2, w: 1 }], 1, 0.05, 4);
    for (let i = 1; i <= 100; i++) {
      const t = i / 100;
      const v = morphValue(
        [
          { n: 2, w: 1 - t },
          { n: -2, w: t },
        ],
        1,
        0.05,
        4,
      );
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9); // wächst monoton zur Polstelle hin
      prev = v;
    }
    // an x = 0: Grenzwert der gewählten Seite
    expect(morphValue([{ n: -1, w: 1 }], 1, 0, 4, -1)).toBeLessThan(-1e6);
    expect(morphValue([{ n: -1, w: 1 }], 1, 0, 4, 1)).toBeGreaterThan(1e6);
    expect(morphValue([{ n: 3, w: 1 }], 1, 0, 4)).toBe(0);
  });
});

describe('Modell: Potenzfunktionen – Aufgaben und Beispiele aus dem Lernmaterial', () => {
  it('Aufgabe 1: A(−2 | −4) liegt auf y = 0,5 · x³, B(3 | 13) nicht', () => {
    expect(power(0.5, 3, -2)).toBe(-4);
    expect(power(0.5, 3, 3)).toBe(13.5);
  });

  it('Aufgabe 2: a · 2⁴ = 8 ⇒ a = 0,5, W = ℝ₀⁺', () => {
    const a = 8 / 2 ** 4;
    expect(a).toBe(0.5);
    expect(power(a, 4, 2)).toBe(8);
    expect(range(a, 4)).toBe('R0+');
  });

  it('Aufgabe 3: Steckbrief von f(x) = −2 · x⁻³', () => {
    expect(power(-2, -3, 1)).toBeCloseTo(-2, 12);
    expect(power(-2, -3, -1)).toBeCloseTo(2, 12);
    expect(domain(-3)).toBe('R\\0');
    expect(range(-2, -3)).toBe('R\\0');
    expect(symmetry(-3)).toBe('point');
    expect(monotony(-2, -3)).toEqual({ left: 'inc', right: 'inc', whole: false });
    expect(limits(-2, -3)).toEqual({ negInf: 0, posInf: 0, zeroLeft: '+inf', zeroRight: '-inf' });
    // Äste im II. und IV. Quadranten
    expect(power(-2, -3, -0.5)).toBeGreaterThan(0);
    expect(power(-2, -3, 0.5)).toBeLessThan(0);
  });

  it('Ausprobieren 6: x³ liegt über x für −1 < x < 0 und x > 1', () => {
    expect(compareIntervals(1, 1, 3)).toEqual([
      { from: -Infinity, to: -1, sign: 1 },
      { from: -1, to: 0, sign: -1 },
      { from: 0, to: 1, sign: 1 },
      { from: 1, to: Infinity, sign: -1 },
    ]);
  });

  it('Aufgabe 5 und 6: gemeinsame Punkte, gerades negatives n', () => {
    for (const n of [1, 3, 5])
      expect(commonPoints(1, n)).toEqual([
        [-1, -1],
        [0, 0],
        [1, 1],
      ]);
    expect(commonPoints(1, -3)).toEqual([
      [-1, -1],
      [1, 1],
    ]);
    expect(range(1, -2)).toBe('R+');
    expect(symmetry(-2)).toBe('axis');
    expect(asymptotes(-2).vertical).toBe(0);
  });

  it('Werte aus den Beispielen (Prüfrunde)', () => {
    expect(power(1, 3, 1.2)).toBeCloseTo(1.728, 12); // gerundet 1,73 – also „≈“, nicht „=“
    expect(power(1, -2, 0.5)).toBeCloseTo(4, 12);
    expect(power(1, 3, 0.5)).toBe(0.125);
    expect(power(1, 4, 1.5)).toBeCloseTo(5.0625, 12);
    expect(power(-0.5, 2, 1.5)).toBe(-1.125);
    expect(power(1.5, 0, 1.5)).toBe(1.5);
  });
});
