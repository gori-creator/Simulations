import { describe, expect, it } from 'vitest';
import { chargeAt, COULOMB_K, fieldAt, forceOn, lineCount, plateField, pointField, potentialAt, traceLine, type Charge } from '../src/simulations/physik/feldlinien/model';

const nC = 1e-9;

describe('Modell: Feldlinien von Punktladungen', () => {
  it('k = 1/(4π ε₀) ≈ 8,99 · 10⁹ N m²/C²', () => {
    expect(COULOMB_K / 1e9).toBeCloseTo(8.988, 3);
  });

  it('Q = 1 nC, r = 10 cm → E ≈ 899 N/C', () => {
    expect(pointField(nC, 0.1)).toBeCloseTo(898.8, 1);
    const [ex, ey] = fieldAt([{ x: 0, y: 0, q: nC }], 0.1, 0);
    expect(ex).toBeCloseTo(898.8, 1);
    expect(ey).toBeCloseTo(0, 9);
    // doppelter Abstand: ein Viertel
    expect(pointField(nC, 0.2)).toBeCloseTo(898.8 / 4, 1);
  });

  it('Dipol ±1 nC im Abstand 20 cm: in der Mitte E ≈ 1798 N/C zur negativen Ladung hin', () => {
    const dip: Charge[] = [
      { x: -0.1, y: 0, q: nC },
      { x: 0.1, y: 0, q: -nC },
    ];
    const [ex, ey] = fieldAt(dip, 0, 0);
    expect(ex).toBeCloseTo(1797.5, 0);
    expect(ex).toBeGreaterThan(0); // zur negativen Ladung (rechts) hin
    expect(ey).toBeCloseTo(0, 9);
    expect(potentialAt(dip, 0, 0)).toBeCloseTo(0, 9);
  });

  it('zwei gleiche Ladungen: in der Mitte feldfrei, Potential doppelt', () => {
    const eq: Charge[] = [
      { x: -0.1, y: 0, q: nC },
      { x: 0.1, y: 0, q: nC },
    ];
    const [ex, ey] = fieldAt(eq, 0, 0);
    expect(Math.hypot(ex, ey)).toBeCloseTo(0, 9);
    expect(potentialAt(eq, 0, 0)).toBeCloseTo(2 * COULOMB_K * nC / 0.1, 6);
  });

  it('Kraft auf Probeladung und Plattenkondensator', () => {
    const F = forceOn(2 * nC, [1000, -500]);
    expect(F[0]).toBeCloseTo(2e-6, 15);
    expect(F[1]).toBeCloseTo(-1e-6, 15);
    expect(plateField(1000, 0.05)).toBeCloseTo(20000, 9);
  });

  it('Feldlinien laufen von + nach − und enden an der negativen Ladung', () => {
    const dip: Charge[] = [
      { x: -0.1, y: 0, q: nC },
      { x: 0.1, y: 0, q: -nC },
    ];
    const res = traceLine(dip, -0.1 + 0.005, 0.002, 0, { step: 0.002, maxSteps: 2000, stopRadius: 0.006, bounds: { x0: -1, x1: 1, y0: -1, y1: 1 } });
    expect(res.end).toBe(1);
    // entlang der Linie zeigt E in Laufrichtung
    const [a, b] = [res.points[5]!, res.points[6]!];
    const E = fieldAt(dip, a[0], a[1]);
    expect(E[0] * (b[0] - a[0]) + E[1] * (b[1] - a[1])).toBeGreaterThan(0);
    expect(lineCount(nC)).toBe(8);
    expect(lineCount(-2 * nC)).toBe(16);
  });

  it('Sonderfälle: r = 0, Ladung 0, Ladungen übereinander', () => {
    // Probeladung genau auf einer Ladung: nicht definiert (keine Division durch 0 im Feld)
    expect(pointField(nC, 0)).toBe(Infinity);
    expect(pointField(0, 0)).toBe(0);
    const dip: Charge[] = [
      { x: -0.1, y: 0, q: nC },
      { x: 0.1, y: 0, q: -nC },
    ];
    expect(chargeAt(dip, -0.1, 0)).toBe(0);
    expect(chargeAt(dip, 0.1, 0)).toBe(1);
    expect(chargeAt(dip, 0, 0)).toBe(-1);
    const [ex, ey] = fieldAt(dip, -0.1, 0);
    expect(Number.isFinite(ex) && Number.isFinite(ey)).toBe(true);
    expect(ex).toBeCloseTo(COULOMB_K * nC / 0.04, 6); // nur Q₂ trägt bei
    expect(Number.isFinite(potentialAt(dip, 0.1, 0))).toBe(true);
    // Q = 0 liefert keinen Beitrag und keine Feldlinien
    expect(fieldAt([{ x: 0, y: 0, q: 0 }], 0.1, 0)).toEqual([0, 0]);
    expect(lineCount(0)).toBe(0);
    // +1 nC und −1 nC am selben Ort: überall feldfrei
    const same: Charge[] = [
      { x: 0, y: 0, q: nC },
      { x: 0, y: 0, q: -nC },
    ];
    const [sx, sy] = fieldAt(same, 0.05, 0.05);
    expect(Math.hypot(sx, sy)).toBeLessThan(1e-9);
    // Reglergrenze: höchstens 40 Linien je Ladung
    expect(lineCount(5 * nC)).toBe(40);
    expect(plateField(1000, 0)).toBe(0);
  });

  it('Werte aus Beispielen und Aufgaben', () => {
    // Drei Ladungen: Q₁ = +1 nC (−10|0), Q₂ = −1 nC (10|0), Q₃ = −2 nC (0|9), Probe (5|−6) cm
    const three: Charge[] = [
      { x: -0.1, y: 0, q: nC },
      { x: 0.1, y: 0, q: -nC },
      { x: 0, y: 0.09, q: -2 * nC },
    ];
    const [tx, ty] = fieldAt(three, 0.05, -0.06);
    expect(Math.hypot(tx, ty)).toBeCloseTo(1979, -0.5);
    expect((Math.atan2(ty, tx) * 180) / Math.PI).toBeCloseTo(58.4, 0);
    expect(potentialAt(three, 0.05, -0.06)).toBeCloseTo(-173.1, 0);
    // +3 nC und −1 nC, Probe (0|8) cm: 1644 + 548 N/C einzeln, Summe ≈ 1844 N/C unter 22°
    const uneq: Charge[] = [
      { x: -0.1, y: 0, q: 3 * nC },
      { x: 0.1, y: 0, q: -nC },
    ];
    const [ux, uy] = fieldAt(uneq, 0, 0.08);
    expect(pointField(3 * nC, Math.hypot(0.1, 0.08))).toBeCloseTo(1644, 0);
    expect(Math.hypot(ux, uy)).toBeCloseTo(1843.5, 0);
    expect(Math.round((Math.atan2(uy, ux) * 180) / Math.PI)).toBe(22);
    // Aufgabe 4: zwei gleiche Ladungen, Punkt (0|10) cm → ≈ 636 N/C senkrecht nach oben; Mitte feldfrei
    const eq: Charge[] = [
      { x: -0.1, y: 0, q: nC },
      { x: 0.1, y: 0, q: nC },
    ];
    const [ax, ay] = fieldAt(eq, 0, 0.1);
    expect(ax).toBeCloseTo(0, 9);
    expect(ay).toBeCloseTo(635.6, 0);
    // Aufgabe 5: +1 nC bei −10 cm, +4 nC bei +14 cm → feldfrei bei x = −2 cm
    const [fx5, fy5] = fieldAt([{ x: -0.1, y: 0, q: nC }, { x: 0.14, y: 0, q: 4 * nC }], -0.02, 0);
    expect(Math.hypot(fx5, fy5)).toBeLessThan(1e-6);
    // Aufgabe 3/6: Kondensator 1000 V, 10 cm → 10 000 N/C; 5 cm von der − Platte 500 V; Elektron 1,6 · 10⁻¹⁵ N
    const E = plateField(1000, 0.1);
    expect(E).toBeCloseTo(10000, 9);
    expect(E * 0.05).toBeCloseTo(500, 9);
    expect(forceOn(-1.6e-19, [E, 0])[0]).toBeCloseTo(-1.6e-15, 25);
    // Reglergrenze Kondensator: 5000 V, 4 cm → 125 000 N/C, 0,5 cm vor der − Platte 625 V
    expect(plateField(5000, 0.04) * 0.005).toBeCloseTo(625, 9);
  });
});
