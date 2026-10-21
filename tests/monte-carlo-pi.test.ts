import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { estimateIsExact, estimatePi, insideQuarterCircle, piFunnel } from '../src/simulations/mathematik/monte-carlo-pi/model';

describe('Monte-Carlo π: Treffer', () => {
  it('zählt den Rand x² + y² = 1 zum Kreis', () => {
    expect(insideQuarterCircle(1, 0)).toBe(true);
    expect(insideQuarterCircle(0.6, 0.8)).toBe(true);
    expect(insideQuarterCircle(0, 0)).toBe(true);
    expect(insideQuarterCircle(0.8, 0.61)).toBe(false);
    expect(insideQuarterCircle(1, 1)).toBe(false);
  });

  it('ganzer Kreis: Umrechnung 2x − 1 auf [−1, 1]² prüft dieselbe Bedingung', () => {
    // Mittelpunkt des Quadrats und Ecken
    expect(insideQuarterCircle(2 * 0.5 - 1, 2 * 0.5 - 1)).toBe(true);
    expect(insideQuarterCircle(2 * 0 - 1, 2 * 0 - 1)).toBe(false);
    expect(insideQuarterCircle(2 * 1 - 1, 2 * 0.5 - 1)).toBe(true);
  });
});

describe('Monte-Carlo π: Schätzwert 4 · k/n', () => {
  it('rechnet Beispiele aus dem Prüfprotokoll nach', () => {
    expect(estimatePi(782, 1000)).toBeCloseTo(3.128, 12);
    expect(estimatePi(88, 100)).toBeCloseTo(3.52, 12);
    expect(estimatePi(2371, 3000)).toBeCloseTo(3.16133, 5);
    expect(estimatePi(1, 1)).toBe(4);
    expect(estimatePi(0, 1)).toBe(0);
  });

  it('liefert NaN ohne Punkte (keine Division durch 0)', () => {
    expect(estimatePi(0, 0)).toBeNaN();
  });

  it('„=“ nur, wenn 4 · k/n mit 4 Nachkommastellen exakt ist', () => {
    expect(estimateIsExact(782, 1000, 4)).toBe(true);
    expect(estimateIsExact(88, 100, 4)).toBe(true);
    expect(estimateIsExact(1, 3, 4)).toBe(false);
    expect(estimateIsExact(2371, 3000, 4)).toBe(false);
    expect(estimateIsExact(4861, 6183, 4)).toBe(false);
    expect(estimateIsExact(0, 0, 4)).toBe(false);
  });

  it('nähert π mit vielen Zufallspunkten an (Startwert fest)', () => {
    const rnd = seededRandom(12345);
    const n = 200_000;
    let k = 0;
    for (let i = 0; i < n; i++) if (insideQuarterCircle(rnd(), rnd())) k++;
    // 95 %-Bereich bei 200 000 Punkten: ±0,0072; großzügig mit dreifacher Breite
    expect(Math.abs(estimatePi(k, n) - Math.PI)).toBeLessThan(3 * piFunnel(n));
  });
});

describe('Monte-Carlo π: Trichter (95 %-Bereich)', () => {
  it('Halbbreite 1,96 · 4 · √(p(1 − p)/n) ≈ 3,22/√n', () => {
    expect(piFunnel(1)).toBeCloseTo(3.2187, 3);
    expect(piFunnel(100_000)).toBeCloseTo(0.01018, 4);
    expect(piFunnel(1000)).toBeCloseTo(0.1018, 3);
  });

  it('schrumpft mit 1/√n: 100-mal mehr Punkte, 10-mal schmaler (Aufgabe 3)', () => {
    expect(piFunnel(100_000) / piFunnel(10_000_000)).toBeCloseTo(10, 10);
    expect(piFunnel(1000) / piFunnel(25_000)).toBeCloseTo(5, 10);
  });

  it('etwa 10 Millionen Punkte für ±0,001', () => {
    const n = Math.ceil((piFunnel(1) / 0.001) ** 2);
    expect(n).toBeGreaterThan(10_000_000);
    expect(n).toBeLessThan(10_500_000);
  });

  it('ohne Punkte die volle Breite 4', () => {
    expect(piFunnel(0)).toBe(4);
  });

  it('enthält in Versuchsreihen mit Startwert etwa 95 % der Schätzwerte', () => {
    const rnd = seededRandom(7);
    const n = 1000;
    let inside = 0;
    const runs = 2000;
    for (let r = 0; r < runs; r++) {
      let k = 0;
      for (let i = 0; i < n; i++) if (insideQuarterCircle(rnd(), rnd())) k++;
      if (Math.abs(estimatePi(k, n) - Math.PI) <= piFunnel(n)) inside++;
    }
    expect(inside / runs).toBeGreaterThan(0.93);
    expect(inside / runs).toBeLessThan(0.97);
  });
});
