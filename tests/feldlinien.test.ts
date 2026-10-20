import { describe, expect, it } from 'vitest';
import { COULOMB_K, fieldAt, forceOn, lineCount, plateField, pointField, potentialAt, traceLine, type Charge } from '../src/simulations/physik/feldlinien/model';

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
});
