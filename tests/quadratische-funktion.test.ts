import { describe, expect, it } from 'vitest';
import {
  clampVertexForGeneral,
  discriminant,
  fitsGeneral,
  generalToVertex,
  isRounded,
  roots,
  shapeOf,
  vertexToGeneral,
} from '../src/simulations/mathematik/quadratische-funktion/model';

describe('Quadratische Funktion: Umrechnen der Formen', () => {
  it('rechnet die Scheitelpunktform in die allgemeine Form um (Aufgabe 2)', () => {
    // 2(x − 1)² − 8 = 2x² − 4x − 6
    expect(vertexToGeneral(2, 1, -8)).toEqual({ a: 2, b: -4, c: -6 });
  });

  it('bestimmt den Scheitel mit quadratischer Ergänzung', () => {
    // x² − 2x − 3 = (x − 1)² − 4 (Beispiel „Allgemeine Form“)
    expect(generalToVertex(1, -2, -3)).toEqual({ d: 1, e: -4 });
    // x² + 4x + 1 = (x + 2)² − 3 (Beispiel „Verschobene Normalparabel“)
    expect(generalToVertex(1, 4, 1)).toEqual({ d: -2, e: -3 });
    // 3x² + x − 1: d = −1/6, e = −1 − 1/12 = −13/12
    const v = generalToVertex(3, 1, -1)!;
    expect(v.d).toBeCloseTo(-1 / 6, 12);
    expect(v.e).toBeCloseTo(-13 / 12, 12);
  });

  it('Hin- und Rückweg ergeben dieselbe Parabel', () => {
    for (const [a, d, e] of [
      [-0.5, 1, 3],
      [0.5, -2, -4.5],
      [-0.2, 5, 6],
      [3, -8, 8],
    ] as const) {
      const g = vertexToGeneral(a, d, e);
      const v = generalToVertex(g.a, g.b, g.c)!;
      expect(v.d).toBeCloseTo(d, 10);
      expect(v.e).toBeCloseTo(e, 10);
    }
  });
});

describe('Quadratische Funktion: Nullstellen und Diskriminante', () => {
  it('Aufgabe 1: 0,5(x + 2)² − 4,5 hat die Nullstellen −5 und 1', () => {
    const z = roots(vertexToGeneral(0.5, -2, -4.5));
    expect(z[0]).toBeCloseTo(-5, 10);
    expect(z[1]).toBeCloseTo(1, 10);
  });

  it('Aufgabe 3: Anzahl der Nullstellen über die Diskriminante', () => {
    expect(discriminant({ a: 1, b: 2, c: 3 })).toBe(-8);
    expect(roots({ a: 1, b: 2, c: 3 })).toEqual([]);
    expect(discriminant({ a: -1, b: 4, c: -4 })).toBe(0);
    expect(roots({ a: -1, b: 4, c: -4 })).toEqual([2]);
    expect(discriminant({ a: 0.5, b: 0, c: -2 })).toBe(4);
    expect(roots({ a: 0.5, b: 0, c: -2 })).toEqual([-2, 2]);
  });

  it('Aufgabe 4 (Ballwurf): Landung bei 5 + √30 ≈ 10,48 m', () => {
    const g = vertexToGeneral(-0.2, 5, 6);
    expect(g.b).toBeCloseTo(2, 12);
    expect(g.c).toBeCloseTo(1, 12);
    const z = roots(g);
    expect(z[1]).toBeCloseTo(5 + Math.sqrt(30), 10);
    expect(z[0]).toBeCloseTo(5 - Math.sqrt(30), 10);
  });

  it('Beispiele „Keine Nullstellen“ und „Doppelte Nullstelle“', () => {
    const none = vertexToGeneral(0.5, 1, 2);
    expect(discriminant(none)).toBeCloseTo(-4, 12);
    expect(roots(none)).toEqual([]);
    const double = vertexToGeneral(2, 1.5, 0);
    expect(discriminant(double)).toBeCloseTo(0, 12);
    expect(roots(double)).toEqual([1.5]);
  });

  it('Diskriminante der Scheitelpunktform ist −4ae', () => {
    for (const [a, d, e] of [
      [-0.5, 1, 3],
      [1.5, -1, -2],
      [0.5, 1, 2],
    ] as const) {
      expect(discriminant(vertexToGeneral(a, d, e))).toBeCloseTo(-4 * a * e, 10);
    }
  });

  it('a = 0: lineare Funktion mit höchstens einer Nullstelle', () => {
    expect(generalToVertex(0, 2, -4)).toBeNull();
    expect(roots({ a: 0, b: 2, c: -4 })).toEqual([2]);
    expect(roots({ a: 0, b: 0, c: 3 })).toEqual([]);
  });
});

describe('Quadratische Funktion: Form und Rundung', () => {
  it('gestreckt, gestaucht, normal', () => {
    expect(shapeOf(3)).toBe('stretched');
    expect(shapeOf(-0.2)).toBe('compressed');
    expect(shapeOf(1)).toBe('normal');
  });

  it('erkennt gerundete Werte (≈ statt =)', () => {
    expect(isRounded(1.5)).toBe(false);
    expect(isRounded(-4.5)).toBe(false);
    expect(isRounded(0.25)).toBe(false);
    expect(isRounded(5 + Math.sqrt(30))).toBe(true);
    expect(isRounded(-1 / 6)).toBe(true);
    // Fließkomma-Rest wie 0,1 + 0,2 gilt nicht als gerundet
    expect(isRounded(0.1 + 0.2)).toBe(false);
  });
});

describe('Quadratische Funktion: Ziehen in der allgemeinen Form', () => {
  it('lässt darstellbare Scheitel unverändert', () => {
    expect(clampVertexForGeneral(1, 2, -3)).toEqual({ d: 2, e: -3 });
  });

  it('begrenzt d so, dass b und c im Reglerbereich ±20 bleiben', () => {
    // a = 3, e = 0: c = 3d² ≤ 20 ⇒ |d| ≤ √(20/3) ≈ 2,58
    const v = clampVertexForGeneral(3, 6, 0);
    expect(v.e).toBe(0);
    expect(v.d).toBeCloseTo(Math.sqrt(20 / 3), 10);
    expect(fitsGeneral(3, v.d, v.e)).toBe(true);
    // a = −0,5, e = 0: |b| = |d| ≤ 20 und |c| = 0,5d² ≤ 20 ⇒ |d| ≤ √40 ≈ 6,32
    const w = clampVertexForGeneral(-0.5, -9, 0);
    expect(w.d).toBeCloseTo(-Math.sqrt(40), 10);
    // a = 0,5: |b| = |d| ≤ 20 begrenzt nicht, c = 0,5d² − 18 ≤ 20 ⇒ d² ≤ 76
    const u = clampVertexForGeneral(0.5, 12, -18);
    expect(u.d).toBeCloseTo(Math.sqrt(76), 10);
    expect(fitsGeneral(0.5, u.d, u.e)).toBe(true);
  });

  it('erkennt, wenn ein Streckfaktor nicht darstellbar ist', () => {
    expect(fitsGeneral(1, 3, 2)).toBe(true);
    expect(fitsGeneral(3, 4, 0)).toBe(false); // b = −24
  });
});
