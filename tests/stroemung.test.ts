import { describe, expect, it } from 'vitest';
import {
  airfoil,
  areaRatioAt,
  bernoulliDrop,
  continuity,
  flowKind,
  inverse,
  joukowski,
  liftCoefficient,
  liftCoefficientIdeal,
  liftForce,
  reynolds,
  velocityAt,
  type C,
} from '../src/simulations/physik/stroemung/model';

describe('Strömung im Rohr', () => {
  it('Kontinuität: halber Querschnitt → doppelte Geschwindigkeit', () => {
    expect(continuity(0.5, 0.5)).toBeCloseTo(1, 12);
    expect(continuity(0.2, 0.25)).toBeCloseTo(0.8, 12);
  });

  it('Bernoulli: Druckabfall in der Engstelle', () => {
    // v₁ = 1 m/s, v₂ = 2 m/s, Wasser: Δp = ½·1000·(4 − 1) = 1500 Pa
    expect(bernoulliDrop(1, 2)).toBeCloseTo(1500, 9);
    expect(bernoulliDrop(1, 1)).toBe(0);
  });

  it('Reynolds-Zahl und Strömungsart', () => {
    expect(reynolds(0.1, 0.01)).toBeCloseTo(1000, 6);
    expect(flowKind(1000)).toBe('laminar');
    expect(flowKind(3000)).toBe('transition');
    expect(flowKind(10000)).toBe('turbulent');
  });

  it('Querschnitt: außen voll, in der Mitte verengt', () => {
    expect(areaRatioAt(0.05, 0.25)).toBeCloseTo(1, 3);
    expect(areaRatioAt(0.5, 0.25)).toBeCloseTo(0.25, 3);
    expect(areaRatioAt(0.95, 0.25)).toBeCloseTo(1, 3);
  });
});

describe('Tragflügel (Joukowski-Profil)', () => {
  const A = airfoil();

  it('Umkehrabbildung trifft den Punkt außerhalb des Profils', () => {
    for (const z of [[3, 1], [-2.5, -0.7], [0.3, 1.2]] as C[]) {
      const back = joukowski(inverse(z, A));
      expect(back[0]).toBeCloseTo(z[0], 9);
      expect(back[1]).toBeCloseTo(z[1], 9);
    }
  });

  it('weit weg strömt die Luft mit der Anströmgeschwindigkeit', () => {
    const alpha = (5 * Math.PI) / 180;
    const v = velocityAt(inverse([60, 30], A), A, alpha);
    expect(Math.hypot(v[0], v[1])).toBeCloseTo(1, 1);
  });

  it('über dem Flügel schneller als darunter', () => {
    const alpha = (5 * Math.PI) / 180;
    const top = velocityAt(inverse([0, 0.6], A), A, alpha);
    const bottom = velocityAt(inverse([0, -0.4], A), A, alpha);
    expect(Math.hypot(...top)).toBeGreaterThan(Math.hypot(...bottom));
  });

  it('Auftriebsbeiwert wächst etwa mit 2π je Bogenmaß', () => {
    const rad = Math.PI / 180;
    const slope = (liftCoefficientIdeal(A, 6 * rad) - liftCoefficientIdeal(A, 2 * rad)) / (4 * rad);
    expect(slope).toBeGreaterThan(5.5);
    expect(slope).toBeLessThan(8);
    // gewölbtes Profil trägt schon bei 0°
    expect(liftCoefficient(A, 0)).toBeGreaterThan(0.3);
  });

  it('Strömungsabriss: über 15° sinkt der Auftrieb', () => {
    expect(liftCoefficient(A, 20)).toBeLessThan(liftCoefficient(A, 15));
  });

  it('Auftriebskraft F = ½ρv²Ac_A', () => {
    expect(liftForce(1, 10, 2)).toBeCloseTo(0.5 * 1.2 * 100 * 2, 9);
  });
});
