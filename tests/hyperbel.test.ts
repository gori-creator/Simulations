import { describe, expect, it } from 'vitest';
import {
  approachTable,
  asymptotes,
  distanceTo,
  isHyperbola,
  monotony,
  quadrants,
  rectangle,
  valueAt,
  vertices,
  yIntercept,
  zero,
} from '../src/simulations/mathematik/hyperbel/model';

describe('Modell: Hyperbeln und ihre Asymptoten', () => {
  it('berechnet Funktionswerte von f(x) = a/(x − b) + c', () => {
    expect(valueAt({ a: 1, b: 0, c: 0 }, 2)).toBeCloseTo(0.5, 12);
    expect(valueAt({ a: 4, b: 0, c: 0 }, -2)).toBeCloseTo(-2, 12);
    // f(x) = 2/(x − 1) + 3 an der Stelle 3: 2/2 + 3 = 4
    expect(valueAt({ a: 2, b: 1, c: 3 }, 3)).toBeCloseTo(4, 12);
    // f(x) = −6/(x + 2) − 1 an der Stelle 1: −6/3 − 1 = −3
    expect(valueAt({ a: -6, b: -2, c: -1 }, 1)).toBeCloseTo(-3, 12);
  });

  it('ist an der Polstelle x = b nicht definiert', () => {
    expect(valueAt({ a: 2, b: 1, c: 3 }, 1)).toBeNaN();
  });

  it('liefert die Asymptoten x = b und y = c', () => {
    expect(asymptotes({ a: 3, b: -2, c: 1.5 })).toEqual({ vertical: -2, horizontal: 1.5 });
  });

  it('berechnet die Nullstelle x = b − a/c', () => {
    // 2/(x − 1) + 3 = 0 ⇔ x − 1 = −2/3 ⇔ x = 1/3
    expect(zero({ a: 2, b: 1, c: 3 })).toBeCloseTo(1 / 3, 12);
    // −4/x + 2 = 0 ⇔ x = 2
    expect(zero({ a: -4, b: 0, c: 2 })).toBeCloseTo(2, 12);
    const h = { a: 1.5, b: -2.5, c: -0.5 };
    expect(valueAt(h, zero(h)!)).toBeCloseTo(0, 12);
  });

  it('hat keine Nullstelle, wenn c = 0 oder a = 0', () => {
    expect(zero({ a: 4, b: 2, c: 0 })).toBeNull();
    expect(zero({ a: 0, b: 2, c: 3 })).toBeNull();
  });

  it('berechnet den y-Achsenabschnitt f(0) = c − a/b', () => {
    expect(yIntercept({ a: 2, b: 1, c: 3 })).toBeCloseTo(1, 12);
    expect(yIntercept({ a: 4, b: -2, c: 0 })).toBeCloseTo(2, 12);
    expect(yIntercept({ a: 4, b: 0, c: 1 })).toBeNull();
  });

  it('ordnet das Vorzeichen von a den Quadranten zu', () => {
    expect(quadrants(2)).toEqual([1, 3]);
    expect(quadrants(-0.5)).toEqual([2, 4]);
    expect(quadrants(0)).toBeNull();
    expect(isHyperbola({ a: 0, b: 0, c: 0 })).toBe(false);
    expect(monotony(3)).toBe('decreasing');
    expect(monotony(-3)).toBe('increasing');
  });

  it('Rechteck unter dem Kurvenpunkt hat immer das Produkt a (indirekte Proportionalität)', () => {
    const h = { a: 4, b: 0, c: 0 };
    for (const u of [0.25, 1, 2, 4, 16, -3]) {
      const r = rectangle(h, u);
      expect(r.product).toBeCloseTo(4, 12);
      expect(r.area).toBeCloseTo(4, 12);
      expect(r.height).toBeCloseTo(valueAt(h, u), 12);
    }
    const neg = rectangle({ a: -6, b: 1, c: 2 }, 3);
    expect(neg.height).toBeCloseTo(-2, 12);
    expect(neg.product).toBeCloseTo(-6, 12);
    expect(neg.area).toBeCloseTo(6, 12);
  });

  it('Scheitelpunkte liegen bei x = b ± √|a| und symmetrisch zu Z', () => {
    const [p, q] = vertices({ a: 4, b: 1, c: -1 });
    expect(p![0]).toBeCloseTo(3, 12);
    expect(p![1]).toBeCloseTo(1, 12);
    expect(q![0]).toBeCloseTo(-1, 12);
    expect(q![1]).toBeCloseTo(-3, 12);
    expect(vertices({ a: 0, b: 0, c: 0 })).toEqual([]);
  });

  it('Wertetabelle x → ∞: Abstand zur waagrechten Asymptote wird zehnmal kleiner', () => {
    const rows = approachTable({ a: 4, b: 1, c: 2 }, 'inf', 1);
    expect(rows.map((r) => r.x)).toEqual([2, 11, 101, 1001]);
    expect(rows[3]!.y).toBeCloseTo(2.004, 12);
    expect(rows.map((r) => r.dist)).toEqual([4, 0.4, 0.04, 0.004].map((d) => expect.closeTo(d, 12)));
  });

  it('Wertetabelle x → b (von links): Abstand zur Polstelle → 0, Funktionswerte wachsen', () => {
    const rows = approachTable({ a: 2, b: 0, c: 0 }, 'pole', -1);
    expect(rows.map((r) => r.u)).toEqual([-1, -0.1, -0.01, -0.001]);
    expect(rows[3]!.y).toBeCloseTo(-2000, 9);
    expect(rows[2]!.dist).toBeCloseTo(0.01, 12);
    expect(distanceTo({ a: 2, b: 0, c: 0 }, 'inf', -4)).toBeCloseTo(0.5, 12);
    expect(distanceTo({ a: 2, b: 0, c: 0 }, 'pole', -0.2)).toBeCloseTo(0.2, 12);
  });

  it('Prüfwerte a = 2, b = 1, c = 3: f(3) = 4, f(0) = 1, Nullstelle 1/3, Asymptoten x = 1, y = 3', () => {
    const h = { a: 2, b: 1, c: 3 };
    expect(valueAt(h, 3)).toBeCloseTo(4, 12);
    expect(valueAt(h, 0)).toBeCloseTo(1, 12);
    expect(zero(h)).toBeCloseTo(1 / 3, 12);
    expect(asymptotes(h)).toEqual({ vertical: 1, horizontal: 3 });
    // y = c wird nie angenommen (W = ℝ \ {c}): f(x) − c = a/(x − b) ≠ 0
    for (const x of [-100, -1, 0.5, 1.5, 2, 1000]) expect(valueAt(h, x)).not.toBe(3);
  });

  it('ist punktsymmetrisch zum Asymptotenschnittpunkt Z(b | c)', () => {
    for (const h of [
      { a: 2, b: 1, c: 3 },
      { a: -3, b: -2, c: -1.5 },
      { a: 0.4, b: 6, c: -5 },
    ]) {
      for (const u of [0.1, 0.7, 2, 9]) {
        expect(valueAt(h, h.b + u) + valueAt(h, h.b - u)).toBeCloseTo(2 * h.c, 10);
      }
    }
  });

  it('a < 0: Äste im II. und IV. Quadranten bezüglich Z', () => {
    const h = { a: -2, b: 1, c: -1 };
    // rechts von b unterhalb von c (IV), links oberhalb (II)
    expect(valueAt(h, 2)).toBeLessThan(h.c);
    expect(valueAt(h, 0)).toBeGreaterThan(h.c);
    expect(quadrants(h.a)).toEqual([2, 4]);
  });

  it('a = 0: keine Hyperbel, sondern y = c mit Lücke bei x = b', () => {
    const h = { a: 0, b: 2, c: 1 };
    expect(isHyperbola(h)).toBe(false);
    expect(valueAt(h, 5)).toBe(1);
    expect(valueAt(h, 2)).toBeNaN();
    expect(monotony(0)).toBe('constant');
  });
});
