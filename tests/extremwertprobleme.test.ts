import { describe, expect, it } from 'vitest';
import {
  boxDeriv,
  boxOptimum,
  boxVolume,
  canDeriv,
  canHeight,
  canOptimum,
  canSurface,
  coneCylHeight,
  coneDeriv,
  coneOptimum,
  coneVolume,
  lifeDeriv,
  lifeOptimum,
  lifeSines,
  lifeTime,
  rectArea,
  rectDeriv,
  rectOptimum,
  secondDeriv,
} from '../src/simulations/mathematik/extremwertprobleme/model';

describe('Modell: Extremwertprobleme', () => {
  it('Schachtel aus 30 cm × 20 cm: x ≈ 3,92 cm, V ≈ 1056,3 cm³', () => {
    const p = { a: 30, b: 20 };
    const x = boxOptimum(p);
    expect(x).toBeCloseTo(3.9237, 4);
    expect(boxVolume(p, x)).toBeCloseTo(1056.31, 2);
    expect(boxDeriv(p, x)).toBeCloseTo(0, 9);
  });
  it('quadratischer Karton a = b: x = a/6', () => {
    expect(boxOptimum({ a: 24, b: 24 })).toBeCloseTo(4, 12);
  });
  it('1-Liter-Dose: r ≈ 5,42 cm, h = 2r, O ≈ 553,6 cm²', () => {
    const r = canOptimum(1000);
    expect(r).toBeCloseTo(5.419, 3);
    expect(canHeight(1000, r)).toBeCloseTo(2 * r, 9);
    expect(canSurface(1000, r)).toBeCloseTo(553.58, 2);
    expect(canDeriv(1000, r)).toBeCloseTo(0, 9);
  });
  it('Rechteck unter 3e^(−0,5x): u = 2, A = 6/e', () => {
    expect(rectDeriv(rectOptimum)).toBe(0);
    expect(rectArea(2)).toBeCloseTo(6 / Math.E, 12);
  });
  it('Plausibilität: Optimum ist besser als zufällige zulässige Werte', () => {
    for (let i = 0; i < 50; i++) {
      const p = { a: 20 + Math.random() * 20, b: 15 + Math.random() * 10 };
      const x = Math.random() * (Math.min(p.a, p.b) / 2);
      expect(boxVolume(p, boxOptimum(p))).toBeGreaterThanOrEqual(boxVolume(p, x) - 1e-9);
      const V = 250 + Math.random() * 1750;
      const r = 1 + Math.random() * 10;
      expect(canSurface(V, canOptimum(V))).toBeLessThanOrEqual(canSurface(V, r) + 1e-9);
      const u = Math.random() * 8;
      expect(rectArea(rectOptimum)).toBeGreaterThanOrEqual(rectArea(u) - 1e-12);
    }
  });
});

describe('Modell: Zylinder im Kegel und Rettungsschwimmer', () => {
  const cone = { R: 6, H: 12 };
  it('Kegel R = 6 cm, H = 12 cm: r = 4 cm, h = 4 cm, V = 64π ≈ 201,06 cm³ (4/9 des Kegels)', () => {
    const r = coneOptimum(cone);
    expect(r).toBe(4);
    expect(coneCylHeight(cone, r)).toBe(4);
    expect(coneVolume(cone, r)).toBeCloseTo(64 * Math.PI, 10);
    expect(coneVolume(cone, r)).toBeCloseTo(201.06, 2);
    expect(coneVolume(cone, r) / ((Math.PI * 36 * 12) / 3)).toBeCloseTo(4 / 9, 12);
    expect(coneDeriv(cone, r)).toBeCloseTo(0, 10);
    expect(secondDeriv((x) => coneDeriv(cone, x), r)).toBeLessThan(0);
  });
  const life = { a: 20, b: 30, d: 60, v1: 7, v2: 2 };
  it('Rettungsschwimmer: Optimum erfüllt das Brechungsgesetz sin α₁/v₁ = sin α₂/v₂', () => {
    const x = lifeOptimum(life);
    expect(lifeDeriv(life, x)).toBeCloseTo(0, 10);
    const [s1, s2] = lifeSines(life, x);
    expect(s1 / life.v1).toBeCloseTo(s2 / life.v2, 10);
    expect(secondDeriv((u) => lifeDeriv(life, u), x)).toBeGreaterThan(0);
    // besser als gerade Linie und als „erst bis gegenüber laufen“
    const straight = (life.a * life.d) / (life.a + life.b);
    expect(straight).toBe(24);
    expect(lifeTime(life, x)).toBeLessThan(lifeTime(life, straight));
    expect(lifeTime(life, x)).toBeLessThan(lifeTime(life, 60));
  });
  it('Rettungsschwimmer: Werte nachgerechnet', () => {
    // gerade Linie: √(20² + 24²)/7 + √(30² + 36²)/2 = 31,24/7 + 46,86/2
    expect(lifeTime(life, 24)).toBeCloseTo(Math.sqrt(976) / 7 + Math.sqrt(2196) / 2, 12);
    expect(lifeTime(life, 24)).toBeCloseTo(27.894, 3);
    // bis gegenüber laufen, dann 30 m schwimmen: √(400 + 3600)/7 + 15
    expect(lifeTime(life, 60)).toBeCloseTo(Math.sqrt(4000) / 7 + 15, 12);
    const x = lifeOptimum(life);
    expect(x).toBeCloseTo(51.706, 3);
    expect(lifeTime(life, x)).toBeCloseTo(23.483, 3);
    expect(lifeTime(life, 60)).toBeCloseTo(24.035, 3);
  });
  it('gleich schnell: Optimum ist die gerade Linie', () => {
    expect(lifeOptimum({ ...life, v2: 7 })).toBeCloseTo(24, 9);
  });
});
