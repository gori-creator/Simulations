import { describe, expect, it } from 'vitest';
import { leftSum, ownSituation, partialSums, riemannSum, signChanges, signedAreas, SITS } from '../src/simulations/mathematik/aenderungsrate/model';

const OWN = ownSituation([2, 4, 0, -3, 1]);

describe('Modell: Integral als Gesamtänderung', () => {
  it('Auto: 100 m Beschleunigung, 600 m konstant, 100 m Bremsen – insgesamt 800 m', () => {
    expect(SITS.car.change(10)).toBe(100);
    expect(SITS.car.change(25)).toBe(400);
    expect(SITS.car.change(40)).toBe(700);
    expect(SITS.car.change(50)).toBe(800);
    expect(SITS.car.change(60)).toBe(800);
  });
  it('Tank: größte Füllmenge nach 20 min (+40 L), nach 40 min wieder Ausgangsmenge', () => {
    expect(SITS.tank.change(20)).toBe(40);
    expect(SITS.tank.change(30)).toBeCloseTo(30, 12);
    expect(SITS.tank.change(40)).toBeCloseTo(0, 12);
    expect(SITS.tank.rate(20)).toBe(0);
  });
  it('Rechtecksummen: links, rechts, Mitte (Tank bis 20 min, 2 Streifen: 60 L, 20 L, 40 L)', () => {
    expect(leftSum(SITS.tank, 20, 2)).toBe(60);
    expect(riemannSum(SITS.tank, 20, 2, 'r')).toBe(20);
    // lineare Rate: Mittelpunktsregel ist exakt
    expect(riemannSum(SITS.tank, 20, 2, 'm')).toBeCloseTo(40, 12);
    expect(Math.abs(leftSum(SITS.tank, 20, 200) - 40)).toBeLessThan(0.3);
    // Auto, 6 Streifen à 10 s: 0 + 20 + 20 + 20 + 20 + 0 = 80 m/s → 800 m
    expect(riemannSum(SITS.car, 60, 6, 'l')).toBe(800);
    expect(riemannSum(SITS.car, 60, 6, 'r')).toBe(800);
    // Auto bis 25 s, 5 Streifen (Δt = 5 s): links 0 + 10 + 20 + 20 + 20 → 350 m
    expect(riemannSum(SITS.car, 25, 5, 'l')).toBe(350);
    expect(riemannSum(SITS.car, 25, 5, 'r')).toBe(450);
  });
  it('Fehler der linken Summe halbiert sich etwa bei doppelter Streifenzahl', () => {
    const e = (n: number) => Math.abs(leftSum(SITS.tank, 20, n) - 40);
    expect(e(4)).toBeCloseTo(10, 12);
    expect(e(8)).toBeCloseTo(5, 12);
    expect(e(16)).toBeCloseTo(2.5, 12);
  });
  it('Teilsummen enden bei der Rechtecksumme', () => {
    const ps = partialSums(SITS.tank, 20, 2);
    expect(ps).toEqual([0, 40, 60]);
    expect(partialSums(SITS.bike, 90, 7, 'm').at(-1)).toBeCloseTo(riemannSum(SITS.bike, 90, 7, 'm'), 12);
  });
  it('Zu- und Abfluss: Tank bis 40 min +40 L und −40 L', () => {
    const a = signedAreas(SITS.tank, 40);
    expect(a.pos).toBeCloseTo(40, 3);
    expect(a.neg).toBeCloseTo(-40, 3);
    expect(signedAreas(SITS.car, 60).neg).toBe(0);
  });
  it('Vorzeichenwechsel der Rate: Extremstellen des Bestands', () => {
    const tank = signChanges(SITS.tank);
    expect(tank).toHaveLength(1);
    expect(tank[0]!.kind).toBe('max');
    expect(tank[0]!.t).toBeCloseTo(20, 6);
    // Auto steht am Ende: Rate 0, aber kein Vorzeichenwechsel
    expect(signChanges(SITS.car)).toHaveLength(0);
    expect(signChanges(SITS.bike)).toHaveLength(0);
    const own = signChanges(OWN);
    expect(own.map((x) => x.kind)).toEqual(['max', 'min']);
    expect(own[0]!.t).toBeCloseTo(20, 6);
    expect(own[1]!.t).toBeCloseTo(37.5, 6);
  });
  it('Eigene Rate (Streckenzug): Trapezflächen', () => {
    expect(OWN.T).toBe(40);
    expect(OWN.rate(5)).toBe(3);
    expect(OWN.rate(35)).toBe(-1);
    expect(OWN.change(10)).toBe(30);
    expect(OWN.change(20)).toBe(50);
    expect(OWN.change(30)).toBe(35);
    expect(OWN.change(37.5)).toBeCloseTo(23.75, 12);
    expect(OWN.change(40)).toBe(25);
  });
  it('Plausibilität: Änderung = numerisches Integral der Rate; Ableitung der Änderung = Rate', () => {
    for (const s of [SITS.car, SITS.tank, SITS.bike, OWN]) {
      for (let i = 0; i < 20; i++) {
        const t = Math.random() * s.T;
        expect(riemannSum(s, t, 20000, 'm')).toBeCloseTo(s.change(t), 2);
        const h = 1e-5;
        if ([10, 20, 30, 40, 50].every((b) => Math.abs(t - b) > 1e-3)) expect((s.change(t + h) - s.change(t - h)) / (2 * h)).toBeCloseTo(s.rate(t), 4);
      }
    }
  });
});
