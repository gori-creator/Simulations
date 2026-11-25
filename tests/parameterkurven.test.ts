import { describe, expect, it } from 'vitest';
import { apex, cartToPolar, curvePoint, flightTime, polarR, polarToCart, throwPos, trajectory } from '../src/simulations/mathematik/parameterkurven/model';

describe('Parameterkurven', () => {
  it('beschreibt den schrägen Wurf', () => {
    const T = flightTime(10, 45, 0);
    expect(throwPos(10, 45, 0, T)[1]).toBeCloseTo(0, 9);
    expect(throwPos(10, 45, 0, T)[0]).toBeCloseTo(100 / 9.81, 6); // Wurfweite v²/g bei 45°
    expect(apex(10, 90, 0)[1]).toBeCloseTo(100 / (2 * 9.81), 6);
    expect(flightTime(0, 0, 4.905)).toBeCloseTo(1, 6);
    // Bahngleichung stimmt mit der Parameterform überein
    const tr = trajectory(12, 30, 2)!;
    for (const t of [0.2, 0.7, 1.1]) {
      const [x, y] = throwPos(12, 30, 2, t);
      expect(tr.c + tr.b * x + tr.a * x * x).toBeCloseTo(y, 9);
    }
    expect(trajectory(12, 90, 2)).toBeNull();
  });

  it('berechnet Parameterkurven', () => {
    const [x, y] = curvePoint('kreis', 3, 0, 0, Math.PI / 2);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(3);
    const [ex, ey] = curvePoint('ellipse', 4, 2, 0, 0.7);
    expect((ex / 4) ** 2 + (ey / 2) ** 2).toBeCloseTo(1);
    expect(curvePoint('zykloide', 1, 0, 0, 2 * Math.PI)[1]).toBeCloseTo(0);
    expect(curvePoint('zykloide', 1, 0, 0, Math.PI)[1]).toBeCloseTo(2);
  });

  it('rechnet mit Polarkoordinaten', () => {
    expect(polarR('kardioide', 4, 0, 0)).toBeCloseTo(4);
    expect(polarR('kardioide', 4, 0, Math.PI)).toBeCloseTo(0);
    expect(polarR('rose', 3, 2, 0)).toBe(3);
    expect(Number.isNaN(polarR('lemniskate', 3, 0, Math.PI / 2))).toBe(true);
    const [x, y] = polarToCart(2, Math.PI / 3);
    const back = cartToPolar(x, y);
    expect(back.r).toBeCloseTo(2);
    expect(back.phi).toBeCloseTo(Math.PI / 3);
    expect(cartToPolar(0, -1).phi).toBeCloseTo(1.5 * Math.PI);
  });
});
