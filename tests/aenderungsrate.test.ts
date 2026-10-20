import { describe, expect, it } from 'vitest';
import { leftSum, SITS, type SitKey } from '../src/simulations/mathematik/aenderungsrate/model';

describe('Modell: Integral als Gesamtänderung', () => {
  it('Auto: 100 m Beschleunigung, 600 m konstant, 100 m Bremsen – insgesamt 800 m', () => {
    expect(SITS.car.change(10)).toBe(100);
    expect(SITS.car.change(40)).toBe(700);
    expect(SITS.car.change(50)).toBe(800);
    expect(SITS.car.change(60)).toBe(800);
  });
  it('Tank: größte Füllmenge nach 20 min (+40 L), nach 40 min wieder Ausgangsmenge', () => {
    expect(SITS.tank.change(20)).toBe(40);
    expect(SITS.tank.change(40)).toBeCloseTo(0, 12);
    expect(SITS.tank.rate(20)).toBe(0);
  });
  it('Rechtecksumme nähert das Integral (Tank: 2 Streifen bis 20 min = 60 L)', () => {
    expect(leftSum(SITS.tank, 20, 2)).toBe(60);
    expect(Math.abs(leftSum(SITS.tank, 20, 200) - 40)).toBeLessThan(0.3);
  });
  it('Plausibilität: Änderung = numerisches Integral der Rate; Ableitung der Änderung = Rate', () => {
    for (const k of ['car', 'tank', 'bike'] as SitKey[]) {
      const s = SITS[k];
      for (let i = 0; i < 20; i++) {
        const t = Math.random() * s.T;
        expect(leftSum(s, t, 20000)).toBeCloseTo(s.change(t), 1);
        const h = 1e-5;
        if (k !== 'car' || [10, 40, 50].every((b) => Math.abs(t - b) > 1e-3)) expect((s.change(t + h) - s.change(t - h)) / (2 * h)).toBeCloseTo(s.rate(t), 4);
      }
    }
  });
});
