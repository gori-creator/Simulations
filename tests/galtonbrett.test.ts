import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  binomialCoefficient,
  binomialMean,
  binomialPmf,
  binomialSd,
  dropBalls,
  randomPath,
  roundedRelation,
  statsFromCounts,
} from '../src/simulations/mathematik/galtonbrett/model';

describe('Galtonbrett: Binomialkoeffizienten', () => {
  it('liefert das Pascal’sche Dreieck (Lehrbuchwerte)', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((k) => binomialCoefficient(6, k))).toEqual([1, 6, 15, 20, 15, 6, 1]);
    expect(binomialCoefficient(4, 2)).toBe(6);
    expect(binomialCoefficient(16, 8)).toBe(12870);
    expect(binomialCoefficient(15, 7)).toBe(6435);
    expect(binomialCoefficient(0, 0)).toBe(1);
  });

  it('ist außerhalb von 0 ≤ k ≤ n null', () => {
    expect(binomialCoefficient(5, -1)).toBe(0);
    expect(binomialCoefficient(5, 6)).toBe(0);
  });

  it('erfüllt bis n = 16 die Pascal-Regel und die Symmetrie exakt (ganzzahlig)', () => {
    for (let n = 1; n <= 16; n++) {
      let sum = 0;
      for (let k = 0; k <= n; k++) {
        const c = binomialCoefficient(n, k);
        expect(Number.isInteger(c)).toBe(true);
        expect(c).toBe(binomialCoefficient(n - 1, k - 1) + binomialCoefficient(n - 1, k));
        expect(c).toBe(binomialCoefficient(n, n - k));
        sum += c;
      }
      expect(sum).toBe(2 ** n);
    }
  });
});

describe('Galtonbrett: Wahrscheinlichkeiten der Fächer', () => {
  it('Aufgabe 1: n = 4, p = 0,5 ⇒ P(X = 2) = 6/16 = 37,5 %', () => {
    expect(binomialPmf(4, 2, 0.5)).toBeCloseTo(0.375, 12);
  });

  it('schiefes Brett: n = 8, p = 0,7', () => {
    // P(X = 6) = 28 · 0,7⁶ · 0,3² = 0,29648…
    expect(binomialPmf(8, 6, 0.7)).toBeCloseTo(28 * 0.7 ** 6 * 0.09, 12);
    expect(binomialPmf(8, 6, 0.7)).toBeCloseTo(0.296475, 5);
    expect(binomialPmf(8, 0, 0.7)).toBeCloseTo(0.3 ** 8, 15);
  });

  it('summiert sich über alle Reglerwerte zu 1, Erwartungswert n · p', () => {
    for (let n = 1; n <= 16; n++) {
      for (let i = 1; i <= 19; i++) {
        const p = i * 0.05;
        const pmf = Array.from({ length: n + 1 }, (_, k) => binomialPmf(n, k, p));
        expect(pmf.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12);
        expect(pmf.reduce((s, x, k) => s + k * x, 0)).toBeCloseTo(binomialMean(n, p), 10);
        expect(pmf.every((x) => x > 0)).toBe(true);
      }
    }
  });

  it('Aufgabe 4: Spiegelbild P₀,₃(X = k) = P₀,₇(X = n − k)', () => {
    for (let k = 0; k <= 10; k++) expect(binomialPmf(10, k, 0.3)).toBeCloseTo(binomialPmf(10, 10 - k, 0.7), 14);
  });

  it('Aufgabe 3: μ = 7, σ = √2,1 ≈ 1,45', () => {
    expect(binomialMean(10, 0.7)).toBeCloseTo(7, 12);
    expect(binomialSd(10, 0.7)).toBeCloseTo(Math.sqrt(2.1), 12);
    expect(binomialSd(16, 0.5)).toBe(2);
  });
});

describe('Galtonbrett: Kugeln fallen lassen', () => {
  it('Fach = Anzahl der Rechts-Sprünge, Weg hat n Schritte', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const path = randomPath(8, 0.5, random);
      expect(path).toHaveLength(8);
      expect(path.every((v) => v === 0 || v === 1)).toBe(true);
    }
    expect(randomPath(5, 0.5, () => 0.1)).toEqual([1, 1, 1, 1, 1]);
    expect(randomPath(5, 0.5, () => 0.9)).toEqual([0, 0, 0, 0, 0]);
  });

  it('ist mit gleichem Startwert reproduzierbar', () => {
    const a = dropBalls(8, 0.5, 300, seededRandom(42));
    const b = dropBalls(8, 0.5, 300, seededRandom(42));
    expect(a).toEqual(b);
    expect(a.counts.reduce((s, c) => s + c, 0)).toBe(300);
    expect(a.lastBin).toBe(a.lastPath!.reduce((s, v) => s + v, 0));
  });

  it('nähert die Binomialverteilung an (viele Kugeln)', () => {
    const N = 40000;
    const { counts } = dropBalls(10, 0.7, N, seededRandom(2026));
    const stats = statsFromCounts(counts);
    expect(stats.mean).toBeGreaterThan(7 - 0.05);
    expect(stats.mean).toBeLessThan(7 + 0.05);
    expect(stats.sd).toBeCloseTo(Math.sqrt(2.1), 1);
    for (let k = 0; k <= 10; k++) {
      const expected = N * binomialPmf(10, k, 0.7);
      // Abweichung höchstens 5 Standardabweichungen der Fachhäufigkeit
      expect(Math.abs(counts[k]! - expected)).toBeLessThanOrEqual(5 * Math.sqrt(expected) + 2);
    }
  });

  it('Leere Fächer: keine Division durch 0', () => {
    const s = statsFromCounts([0, 0, 0]);
    expect(s.total).toBe(0);
    expect(Number.isNaN(s.mean)).toBe(true);
    expect(dropBalls(4, 0.5, 0, Math.random)).toEqual({ counts: [0, 0, 0, 0, 0], lastPath: null, lastBin: -1 });
  });

  it('eine Kugel: Mittelwert = Fach, Standardabweichung 0', () => {
    const s = statsFromCounts([0, 0, 0, 1, 0]);
    expect(s.mean).toBe(3);
    expect(s.sd).toBe(0);
  });
});

describe('Galtonbrett: „=“ oder „≈“ in der Anzeige', () => {
  it('exakte Werte mit „=“, gerundete mit „≈“', () => {
    expect(roundedRelation(2, 2).exact).toBe(true); // σ für n = 16, p = 0,5
    expect(roundedRelation(1, 2).exact).toBe(true); // σ für n = 4, p = 0,5
    expect(roundedRelation(3.3, 2).exact).toBe(true);
    expect(roundedRelation(binomialSd(8, 0.7), 2).exact).toBe(false); // √1,68 ≈ 1,30
    expect(roundedRelation(binomialSd(10, 0.7), 2).exact).toBe(false);
    expect(roundedRelation(30.23 / 10, 2).exact).toBe(false);
  });

  it('n · p hat bei allen Reglerwerten höchstens zwei Nachkommastellen', () => {
    for (let n = 1; n <= 16; n++) for (let i = 1; i <= 19; i++) expect(roundedRelation(n * i * 0.05, 2).exact).toBe(true);
  });
});
