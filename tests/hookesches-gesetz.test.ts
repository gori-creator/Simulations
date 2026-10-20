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

  it('liefert die Werte der Aufgaben im Lernmaterial (g = 9,81 N/kg)', () => {
    expect(G).toBe(9.81);
    // Aufgabe 1: 6 · 50 g → 2,94 N
    expect(0.3 * G).toBeCloseTo(2.943, 9);
    // Aufgabe 2: 200 g an D = 20 N/m → 9,81 cm
    expect(equilibrium('one', [newSpring(20)], 0.2 * G, true).s).toBeCloseTo(0.0981, 9);
    // Aufgabe 3: 300 g an D = 25 N/m → 11,8 cm
    expect(equilibrium('one', [newSpring(25)], 0.3 * G, true).s).toBeCloseTo(0.11772, 9);
    // Aufgabe 4: 1 N an D = 50 N/m → 2 cm, 500 g bleiben elastisch (12,5 N Grenze)
    expect(extension(newSpring(50), 1, true)).toBeCloseTo(0.02, 12);
    expect(isDeformed(settle('one', [newSpring(50)], 0.5 * G, true)[0]!)).toBe(false);
    // Aufgabe 5: zwei Federn mit 20 N/m und 200 g
    const two = [newSpring(20), newSpring(20)];
    const series = equilibrium('series', two, 0.2 * G, true);
    expect(series.s).toBeCloseTo(0.1962, 9);
    expect(series.parts[0]).toBeCloseTo(0.0981, 9);
    expect(equilibrium('parallel', two, 0.2 * G, true).s).toBeCloseTo(0.04905, 9);
  });

  it('überdehnt die Feder im Beispiel „Feder überdehnen“ (10 · 100 g an 20 N/m)', () => {
    const F = 1 * G;
    // elastisch bis 5 N (25 cm), darüber mit 10 N/m: 0,25 m + 4,81 N / 10 N/m = 0,731 m
    expect(elasticLimitForce(20)).toBeCloseTo(5, 12);
    const springs = settle('one', [newSpring(20)], F, true);
    expect(equilibrium('one', springs, F, true).s).toBeCloseTo(0.731, 9);
    // bleibende Verlängerung: 4,81 N · (1/10 − 1/20) m/N = 0,2405 m
    expect(equilibrium('one', springs, 0, true).s).toBeCloseTo(0.2405, 9);
    // ohne Elastizitätsgrenze: 9,81 N / 20 N/m = 0,4905 m, nichts bleibt
    expect(equilibrium('one', [newSpring(20)], F, false).s).toBeCloseTo(0.4905, 9);
    // Grenzfall genau an der Elastizitätsgrenze: noch nicht überdehnt
    expect(isDeformed(settle('one', [newSpring(20)], 5, true)[0]!)).toBe(false);
  });

  it('verteilt die Last nebeneinander im Verhältnis der Federhärten (20 und 60 N/m)', () => {
    const eq = equilibrium('parallel', [newSpring(20), newSpring(60)], 0.2 * G, true);
    // D = 80 N/m: 1,962 N / 80 N/m = 2,45 cm; Kräfte 0,49 N und 1,47 N
    expect(eq.s).toBeCloseTo(0.024525, 9);
    expect(eq.forces[0]).toBeCloseTo(0.4905, 6);
    expect(eq.forces[1]).toBeCloseTo(1.4715, 6);
    // ohne Last keine Verlängerung
    expect(equilibrium('parallel', [newSpring(20), newSpring(60)], 0, true).s).toBe(0);
  });
});
