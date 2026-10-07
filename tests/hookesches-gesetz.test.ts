import { describe, expect, it } from 'vitest';
import {
  elasticLimitForce,
  ELASTIC_LIMIT,
  equilibrium,
  extension,
  fitThroughOrigin,
  G,
  isDeformed,
  loaded,
  newSpring,
  parallelStiffness,
  permanentSet,
  PLASTIC_FACTOR,
  seriesStiffness,
  settle,
  stiffness,
} from '../src/simulations/physik/hookesches-gesetz/model';

describe('Modell: Hookesches Gesetz', () => {
  it('dehnt eine Feder proportional zur Kraft (F = D · s)', () => {
    const sp = newSpring(20);
    const F = 0.25 * G; // 250 g
    expect(extension(sp, F, true)).toBeCloseTo(F / 20, 12);
    expect(extension(sp, 2 * F, true)).toBeCloseTo(2 * extension(sp, F, true), 12);
    expect(extension(sp, 0, true)).toBe(0);
    expect(extension(sp, -1, true)).toBe(0);
    expect(elasticLimitForce(20)).toBeCloseTo(20 * ELASTIC_LIMIT, 12);
  });

  it('kombiniert zwei Federn hintereinander und nebeneinander', () => {
    expect(seriesStiffness(20, 20)).toBe(10);
    expect(seriesStiffness(30, 60)).toBe(20);
    expect(parallelStiffness(20, 40)).toBe(60);
    expect(stiffness('one', 25, 99)).toBe(25);
    const springs = [newSpring(30), newSpring(60)];
    const series = equilibrium('series', springs, 3, false);
    expect(series.s).toBeCloseTo(3 / 20, 12);
    expect(series.parts[0]! / series.parts[1]!).toBeCloseTo(2, 12);
    const parallel = equilibrium('parallel', springs, 9, false);
    expect(parallel.s).toBeCloseTo(9 / 90, 9);
    // Die härtere Feder trägt mehr: Kräfte im Verhältnis der Federhärten
    expect(parallel.forces[1]! / parallel.forces[0]!).toBeCloseTo(2, 6);
    expect(parallel.forces[0]! + parallel.forces[1]!).toBeCloseTo(9, 9);
  });

  it('wird jenseits der Elastizitätsgrenze bleibend verformt', () => {
    const D = 20;
    const FE = elasticLimitForce(D);
    let sp = newSpring(D);
    expect(isDeformed(sp)).toBe(false);
    const F = FE + 2;
    // beim ersten Belasten: elastisch bis F_E, darüber weicher
    expect(extension(sp, F, true)).toBeCloseTo(FE / D + 2 / (D * PLASTIC_FACTOR), 12);
    sp = loaded(sp, F, true);
    expect(isDeformed(sp)).toBe(true);
    const p = permanentSet(sp);
    expect(p).toBeCloseTo(2 * (1 / (D * PLASTIC_FACTOR) - 1 / D), 12);
    // Entlasten: elastisch zurück, aber nicht bis 0
    expect(extension(sp, 0, true)).toBeCloseTo(p, 12);
    // stetig an der neuen Fließgrenze
    expect(extension(sp, F, true)).toBeCloseTo(FE / D + 2 / (D * PLASTIC_FACTOR), 12);
    // ohne Elastizitätsgrenze bleibt alles linear
    expect(extension(sp, F, false)).toBeCloseTo(F / D, 12);
    expect(loaded(newSpring(D), F, false)).toEqual(newSpring(D));
  });

  it('aktualisiert beim Einschwingen nur überlastete Federn', () => {
    const springs = [newSpring(20), newSpring(80)];
    const F = elasticLimitForce(20) + 1;
    const after = settle('series', springs, F, true);
    expect(isDeformed(after[0]!)).toBe(true);
    expect(isDeformed(after[1]!)).toBe(false);
  });

  it('bestimmt die Federhärte als Steigung der Ursprungsgeraden', () => {
    const points = [0.05, 0.1, 0.15].map((s) => ({ s, F: 20 * s }));
    expect(fitThroughOrigin(points)).toBeCloseTo(20, 12);
    expect(fitThroughOrigin([{ s: 0.1, F: 2.1 }, { s: 0.2, F: 3.9 }])).toBeCloseTo((0.21 + 0.78) / 0.05, 12);
    expect(fitThroughOrigin([])).toBeNull();
  });
});
