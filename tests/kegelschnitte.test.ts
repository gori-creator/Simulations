import { describe, expect, it } from 'vitest';
import { coneEccentricity, coneSection, coneSectionKind, dist, ellipse, ellipsePoint, focalCurve, focalFromCoef, focalRadius, hyperbola, hyperbolaPoint, kindOf, parabola, parabolaFromDirectrix, parabolaPoint } from '../src/simulations/mathematik/kegelschnitte/model';

describe('Kegelschnitte: Lehrbuchwerte', () => {
  it('Ellipse a = 5, b = 3 → e = 4, Brennpunkte (±4 | 0), Abstandssumme 10', () => {
    const E = ellipse(5, 3);
    expect(E.e).toBe(4);
    expect(E.foci).toEqual([
      [-4, 0],
      [4, 0],
    ]);
    for (const t of [0, 0.7, 2, 3.5, 5.9]) {
      const P = ellipsePoint(E, t);
      expect(dist(P, E.foci[0]) + dist(P, E.foci[1])).toBeCloseTo(10, 12);
    }
    expect(E.eps).toBeCloseTo(0.8, 12);
  });
  it('Parabel y = x²/4 → Brennpunkt (0 | 1), Leitlinie y = −1', () => {
    const P = parabola(focalFromCoef(1 / 4));
    expect(P.focus).toEqual([0, 1]);
    expect(P.directrix).toBe(-1);
    for (const x of [-3, -1, 0, 2, 5]) {
      const Q = parabolaPoint(P, x);
      expect(Q[1]).toBeCloseTo((x * x) / 4, 12);
      expect(dist(Q, P.focus)).toBeCloseTo(Q[1] - P.directrix, 12);
    }
  });
  it('Hyperbel a = 3, b = 4 → e = 5, Abstandsdifferenz 6, Asymptoten ±4/3', () => {
    const H = hyperbola(3, 4);
    expect(H.e).toBe(5);
    expect(H.slope).toBeCloseTo(4 / 3, 12);
    for (const u of [-1.5, 0, 0.8, 2]) {
      for (const side of [1, -1] as const) {
        const P = hyperbolaPoint(H, u, side);
        expect(Math.abs(dist(P, H.foci[0]) - dist(P, H.foci[1]))).toBeCloseTo(6, 10);
        expect((P[0] * P[0]) / 9 - (P[1] * P[1]) / 16).toBeCloseTo(1, 10);
      }
    }
  });
});

describe('Kegelschnitte: Ortslinien und Exzentrizität', () => {
  it('Parabel-Konstruktion: P liegt auf der Mittelsenkrechten von F und Q', () => {
    const P = parabola(1.5);
    for (const qx of [-4, -1, 0.5, 3]) {
      const r = parabolaFromDirectrix(P, qx);
      expect(dist(r.point, P.focus)).toBeCloseTo(dist(r.point, r.Q), 12);
      expect(r.point[0]).toBe(qx);
    }
  });
  it('Brennpunkt-Leitlinien-Definition: Abstand zu F = ε · Abstand zur Leitlinie', () => {
    for (const eps of [0.5, 1, 1.8]) {
      for (const th of [0.3, 1.2, 2.5]) {
        const r = focalRadius(eps, 2, th);
        if (r === null) continue;
        const x = r * Math.cos(th);
        expect(r).toBeCloseTo(eps * (x + 2), 10);
      }
    }
    expect(focalRadius(1, 2, 0)).toBeNull();
    expect(focalCurve(1.5, 1).length).toBeGreaterThan(0);
  });
  it('Art aus ε', () => {
    expect(kindOf(0)).toBe('circle');
    expect(kindOf(0.6)).toBe('ellipse');
    expect(kindOf(1)).toBe('parabola');
    expect(kindOf(2)).toBe('hyperbola');
  });
  it('Ellipse aus Brennpunkt-Leitlinie stimmt mit a, b überein', () => {
    // a = 5, b = 3: ε = 0,8, Abstand F–Leitlinie = a/ε − e = 6,25 − 4 = 2,25
    const E = ellipse(5, 3);
    const d = E.directrix! - E.e;
    const rPeri = focalRadius(E.eps, d, Math.PI)!; // Richtung zum näheren Scheitel
    expect(rPeri).toBeCloseTo(E.a - E.e, 10);
  });
});

describe('Kegelschnitte: Doppelkegel', () => {
  it('Schnittart nach dem Neigungswinkel', () => {
    expect(coneSectionKind(30, 0)).toBe('circle');
    expect(coneSectionKind(30, 40)).toBe('ellipse');
    expect(coneSectionKind(30, 60)).toBe('parabola');
    expect(coneSectionKind(30, 75)).toBe('hyperbola');
    expect(coneEccentricity(30, 60)).toBeCloseTo(1, 12);
    expect(coneEccentricity(30, 0)).toBe(0);
  });
  it('Schnittpunkte liegen auf Kegel und Ebene', () => {
    const alpha = 30;
    const beta = 40;
    const h = 1;
    const ta = Math.tan((alpha * Math.PI) / 180);
    const m = Math.tan((beta * Math.PI) / 180);
    const parts = coneSection(alpha, beta, h, 10);
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts)
      for (const [x, y, z] of part) {
        expect(x * x + y * y).toBeCloseTo((z * ta) ** 2, 8);
        expect(z).toBeCloseTo(h + m * x, 8);
      }
    // Ellipse: nur ein geschlossenes Stück auf der oberen Hälfte
    expect(parts.every((p) => p.every((q) => q[2] > 0))).toBe(true);
    // Hyperbel: Stücke auf beiden Hälften
    const hyp = coneSection(30, 75, 1, 10);
    expect(hyp.some((p) => p[0]![2] > 0) && hyp.some((p) => p[0]![2] < 0)).toBe(true);
  });
});
