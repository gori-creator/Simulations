import { describe, expect, it } from 'vitest';
import {
  characteristicTime,
  displayDecimals,
  exponential,
  growthFactor,
  isExactTo,
  linearComparison,
  timeToReach,
} from '../src/simulations/mathematik/exponentielles-wachstum/model';

describe('exponentielles-wachstum: Wachstumsfaktor und Funktionswerte', () => {
  it('b = 1 + p/100, auch bei Abnahme (negatives p)', () => {
    expect(growthFactor(100)).toBe(2);
    expect(growthFactor(5)).toBeCloseTo(1.05, 12);
    expect(growthFactor(-8)).toBeCloseTo(0.92, 12);
    expect(growthFactor(-60)).toBeCloseTo(0.4, 12);
    expect(growthFactor(0)).toBe(1);
  });

  it('f(t) = a · bᵗ', () => {
    expect(exponential(1, 100, 10)).toBe(1024);
    expect(exponential(1000, -8, 0)).toBe(1000);
    expect(exponential(2, 50, 3)).toBeCloseTo(6.75, 12);
    // zwischen den ganzzahligen Zeitpunkten stetig: f(0,5) = a · √b
    expect(exponential(1, 100, 0.5)).toBeCloseTo(Math.SQRT2, 12);
  });

  it('lineares Wachstum mit derselben Änderung im ersten Schritt', () => {
    expect(linearComparison(1000, 5, 10)).toBeCloseTo(1500, 9);
    expect(linearComparison(1000, 5, 1)).toBeCloseTo(exponential(1000, 5, 1), 9);
    // bei Abnahme fällt die Gerade und wird später negativ (reine Vergleichsfunktion)
    expect(linearComparison(1000, -8, 12.5)).toBeCloseTo(0, 9);
  });
});

describe('exponentielles-wachstum: Verdopplungs- und Halbwertszeit', () => {
  it('Verdopplungszeit T_d = log_b 2', () => {
    expect(characteristicTime(100)).toBeCloseTo(1, 12);
    expect(characteristicTime(5)).toBeCloseTo(14.2067, 4);
    expect(characteristicTime(50)).toBeCloseTo(1.7095, 4);
  });

  it('Halbwertszeit T_½ = log_b 0,5 (positiv auch bei negativem p)', () => {
    expect(characteristicTime(-50)).toBeCloseTo(1, 12);
    expect(characteristicTime(-8)).toBeCloseTo(8.3130, 4);
    expect(characteristicTime(-8)).toBeGreaterThan(0);
    // Halbwertszeit: nach T_½ ist genau die Hälfte übrig
    const t = characteristicTime(-8);
    expect(exponential(1000, -8, t)).toBeCloseTo(500, 9);
    expect(exponential(1000, -8, 3 * t)).toBeCloseTo(125, 9);
  });

  it('keine Änderung bei p = 0 und kein Wert bei b ≤ 0', () => {
    expect(characteristicTime(0)).toBeNaN();
    expect(characteristicTime(-100)).toBeNaN();
    expect(characteristicTime(-120)).toBeNaN();
  });

  it('timeToReach: Logarithmus als Umkehrung', () => {
    expect(timeToReach(1, 100, 512)).toBeCloseTo(9, 12);
    expect(timeToReach(1000, 5, 2000)).toBeCloseTo(characteristicTime(5), 12);
    expect(timeToReach(1000, -8, 500)).toBeCloseTo(characteristicTime(-8), 12);
    expect(timeToReach(0, 5, 10)).toBeNaN();
    expect(timeToReach(10, 0, 20)).toBeNaN();
  });
});

describe('exponentielles-wachstum: Aufgaben aus dem Lernmaterial', () => {
  it('Aufgabe 1: Teich (1024 m²) nach 10 Tagen voll, halb voll nach 9 Tagen', () => {
    expect(exponential(1, 100, 10)).toBe(1024);
    expect(exponential(1, 100, 9)).toBe(512);
  });

  it('Aufgabe 2: 1000 € zu 5 %', () => {
    expect(exponential(1000, 5, 10)).toBeCloseTo(1628.89, 2);
    expect(Math.round(characteristicTime(5) * 10) / 10).toBe(14.2);
    expect(linearComparison(1000, 5, 10)).toBeCloseTo(1500, 9);
  });

  it('Aufgabe 3: Iod-131 mit T_½ = 8 Tage', () => {
    expect(0.5 ** 3).toBe(0.125);
    const b = 0.5 ** (1 / 8);
    expect(b).toBeCloseTo(0.917, 3);
    expect(Math.round((1 - b) * 1000) / 10).toBe(8.3);
    // mit p = −8 % (Regler in ganzen Prozent) ist T_½ etwas länger
    expect(Math.round(characteristicTime(-8) * 100) / 100).toBe(8.31);
  });

  it('Aufgabe 4: Faustregel 70/p', () => {
    expect(Math.round(characteristicTime(2) * 10) / 10).toBe(35);
    expect(Math.round(characteristicTime(5) * 10) / 10).toBe(14.2);
    expect(Math.round(characteristicTime(10) * 10) / 10).toBe(7.3);
  });
});

describe('exponentielles-wachstum: Anzeige „=“ oder „≈“', () => {
  it('isExactTo erkennt exakte Werte trotz Rundungsfehlern', () => {
    expect(isExactTo(characteristicTime(100), 2)).toBe(true);
    expect(isExactTo(characteristicTime(-50), 2)).toBe(true);
    expect(isExactTo(characteristicTime(5), 2)).toBe(false);
    expect(isExactTo(exponential(1000, 5, 2), 1)).toBe(true); // 1102,5
    expect(isExactTo(exponential(1000, 5, 3), 1)).toBe(false); // 1157,625
    expect(isExactTo(exponential(1000, 5, 3), 3)).toBe(true);
    expect(isExactTo(1.1 * 1.1, 2)).toBe(true);
  });

  it('Verdopplungs-/Halbwertszeit ist nur bei p = 100 und p = −50 exakt (ganzzahlige p im Reglerbereich)', () => {
    const exact: number[] = [];
    for (let p = -60; p <= 100; p++) {
      const tc = characteristicTime(p);
      if (!Number.isNaN(tc) && isExactTo(tc, 2)) exact.push(p);
    }
    expect(exact).toEqual([-50, 100]);
  });

  it('displayDecimals: 2 Stellen unter 10, 1 Stelle unter 1000, sonst ganzzahlig', () => {
    expect(displayDecimals(9.99)).toBe(2);
    expect(displayDecimals(10)).toBe(1);
    expect(displayDecimals(999.9)).toBe(1);
    expect(displayDecimals(1000)).toBe(0);
    expect(displayDecimals(-5)).toBe(2);
  });
});
