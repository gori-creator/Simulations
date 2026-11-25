import { describe, expect, it } from 'vitest';
import { boxDeceleration, motion, pulleyAcceleration, pushOff, ropeForce } from '../src/simulations/physik/newtonsche-gesetze/model';

describe('Newton’sche Gesetze', () => {
  it('F = m · a: Zuggewicht beschleunigt beide Massen', () => {
    // 0,1 kg ziehen 0,4 kg Wagen ohne Reibung: a = 0,981 / 0,5
    expect(pulleyAcceleration(0.4, 0.1, 0, 9.81)).toBeCloseTo(1.962, 6);
    // doppelte Zugmasse: nicht doppelte Beschleunigung, weil die Gesamtmasse wächst
    expect(pulleyAcceleration(0.4, 0.2, 0, 9.81)).toBeCloseTo(3.27, 2);
  });

  it('Reibung bremst; zu wenig Zugkraft: keine Bewegung', () => {
    expect(pulleyAcceleration(0.4, 0.1, 0.1, 9.81)).toBeCloseTo((0.981 - 0.3924) / 0.5, 6);
    expect(pulleyAcceleration(1, 0.1, 0.2)).toBe(0);
  });

  it('Seilkraft ist kleiner als die Gewichtskraft des Zuggewichts', () => {
    const a = pulleyAcceleration(0.4, 0.1, 0);
    expect(ropeForce(0.1, a)).toBeCloseTo(0.4 * a, 10);
  });

  it('Trägheit: lose Kiste wird höchstens mit μ g gebremst', () => {
    expect(boxDeceleration(8, 0.3, 9.81)).toBeCloseTo(2.943, 6);
    expect(boxDeceleration(2, 0.3, 9.81)).toBe(2);
  });

  it('Wechselwirkung: gleiche Kraft, Impulse entgegengesetzt gleich', () => {
    const r = pushOff(1, 3, 6, 0.5);
    expect(r.v1).toBe(-3);
    expect(r.v2).toBe(1);
    expect(1 * r.v1 + 3 * r.v2).toBe(0);
  });

  it('Bewegungsgesetze', () => {
    expect(motion(2, 3)).toEqual({ s: 9, v: 6 });
  });
});
