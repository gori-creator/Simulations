import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  bernoulliChain,
  binomialCdf,
  binomialCdfAll,
  binomialCoefficient,
  binomialMean,
  binomialPmf,
  binomialPmfAll,
  binomialSd,
  countsOf,
  eventProbability,
  inEvent,
  meanOfCounts,
  probAtLeast,
  probRange,
  scientific,
  sigmaBounds,
  sigmaShare,
  simulateChains,
} from '../src/simulations/mathematik/binomialverteilung/model';

describe('Modell: Binomialverteilung', () => {
  it('B(10; 0,5): P(X = 5), P(X ≤ 3), μ und σ', () => {
    expect(binomialPmf(10, 0.5, 5)).toBeCloseTo(0.2461, 4);
    expect(binomialPmf(10, 0.5, 5)).toBeCloseTo(252 / 1024, 12);
    expect(binomialCdf(10, 0.5, 3)).toBeCloseTo(0.1719, 4);
    expect(binomialCdf(10, 0.5, 3)).toBeCloseTo(176 / 1024, 12);
    expect(binomialMean(10, 0.5)).toBe(5);
    expect(binomialSd(10, 0.5)).toBeCloseTo(1.581, 3);
  });

  it('B(20; 0,3): P(X = 6), P(X ≤ 4), P(X ≥ 9), μ und σ', () => {
    expect(binomialPmf(20, 0.3, 6)).toBeCloseTo(0.1916, 4);
    expect(binomialCdf(20, 0.3, 4)).toBeCloseTo(0.2375, 4);
    expect(probAtLeast(20, 0.3, 9)).toBeCloseTo(0.1133, 4);
    expect(1 - binomialCdf(20, 0.3, 8)).toBeCloseTo(0.1133, 4);
    expect(binomialMean(20, 0.3)).toBeCloseTo(6, 12);
    expect(binomialSd(20, 0.3)).toBeCloseTo(2.049, 3);
  });

  it('B(100; 0,5): P(40 ≤ X ≤ 60)', () => {
    expect(probRange(100, 0.5, 40, 60)).toBeCloseTo(0.9648, 4);
    expect(binomialCdf(100, 0.5, 60) - binomialCdf(100, 0.5, 39)).toBeCloseTo(0.9648, 4);
  });

  it('Summe aller P(X = k) ist 1 (viele n und p)', () => {
    for (const n of [1, 2, 5, 10, 17, 50, 99, 100]) {
      for (const p of [0, 0.01, 0.1, 0.25, 0.5, 0.73, 0.99, 1]) {
        const sum = binomialPmfAll(n, p).reduce((s, v) => s + v, 0);
        expect(sum, `n = ${n}, p = ${p}`).toBeCloseTo(1, 10);
        expect(binomialCdfAll(n, p)[n]).toBe(1);
      }
    }
  });

  it('Binomialkoeffizienten', () => {
    expect(binomialCoefficient(10, 3)).toBe(120);
    expect(binomialCoefficient(10, 0)).toBe(1);
    expect(binomialCoefficient(10, 10)).toBe(1);
    expect(binomialCoefficient(5, 7)).toBe(0);
    expect(binomialCoefficient(50, 25)).toBe(126410606437752);
    expect(binomialCoefficient(50, 25) / 1e14).toBeCloseTo(1.264, 3);
    // Pascal: (n über k) = (n−1 über k−1) + (n−1 über k)
    for (let n = 1; n <= 30; n++) for (let k = 1; k < n; k++) expect(binomialCoefficient(n, k)).toBe(binomialCoefficient(n - 1, k - 1) + binomialCoefficient(n - 1, k));
  });

  it('numerisch stabil für n = 100 (keine NaN, kein Überlauf)', () => {
    const all = binomialPmfAll(100, 0.37);
    expect(all.every((v) => Number.isFinite(v) && v >= 0)).toBe(true);
    expect(binomialPmf(100, 0.5, 50)).toBeCloseTo(0.0795892, 6);
    expect(binomialPmf(100, 0.01, 100)).toBeGreaterThanOrEqual(0);
    expect(binomialPmf(100, 0.5, 0)).toBeCloseTo(2 ** -100, 40);
  });

  it('Randfälle p = 0 und p = 1', () => {
    expect(binomialPmf(10, 0, 0)).toBe(1);
    expect(binomialPmf(10, 0, 1)).toBe(0);
    expect(binomialPmf(10, 1, 10)).toBe(1);
    expect(binomialPmf(10, 1, 9)).toBe(0);
    expect(binomialCdf(10, 0, 0)).toBe(1);
    expect(binomialCdf(10, 1, 9)).toBe(0);
    expect(binomialSd(10, 0)).toBe(0);
    expect(binomialSd(10, 1)).toBe(0);
    expect(sigmaShare(10, 0, 1)).toBe(1);
    expect(sigmaShare(10, 1, 2)).toBe(1);
  });

  it('Bereiche und Grenzen', () => {
    expect(probRange(10, 0.5, 6, 4)).toBe(0); // leer
    expect(probRange(10, 0.5, -3, 20)).toBeCloseTo(1, 12);
    expect(probAtLeast(10, 0.5, 0)).toBeCloseTo(1, 12);
    expect(binomialCdf(10, 0.5, -1)).toBe(0);
    expect(eventProbability(20, 0.3, 'eq', { k: 6, a: 0, b: 0 })).toBeCloseTo(0.1916, 4);
    expect(eventProbability(20, 0.3, 'le', { k: 4, a: 0, b: 0 })).toBeCloseTo(0.2375, 4);
    expect(eventProbability(20, 0.3, 'ge', { k: 9, a: 0, b: 0 })).toBeCloseTo(0.1133, 4);
    expect(eventProbability(100, 0.5, 'ab', { k: 0, a: 40, b: 60 })).toBeCloseTo(0.9648, 4);
    expect(inEvent('ab', 5, { k: 0, a: 6, b: 4 })).toBe(false);
    expect(inEvent('ge', 9, { k: 9, a: 0, b: 0 })).toBe(true);
    // Zerlegung: P(X ≤ k) + P(X ≥ k + 1) = 1
    for (let k = 0; k < 20; k++) expect(binomialCdf(20, 0.3, k) + probAtLeast(20, 0.3, k + 1)).toBeCloseTo(1, 12);
  });

  it('σ-Umgebungen', () => {
    // B(10; 0,5): μ ± σ = [3,42; 6,58] → 4 … 6
    expect(sigmaBounds(10, 0.5, 1)).toEqual({ lo: 4, hi: 6 });
    expect(sigmaShare(10, 0.5, 1)).toBeCloseTo(672 / 1024, 12);
    // B(100; 0,5): μ ± 2σ = [40; 60] genau
    expect(sigmaBounds(100, 0.5, 2)).toEqual({ lo: 40, hi: 60 });
    expect(sigmaShare(100, 0.5, 2)).toBeCloseTo(0.9648, 4);
  });

  it('Bernoulli-Ketten mit festem Startwert', () => {
    const a = simulateChains(20, 0.3, 1000, seededRandom(7));
    const b = simulateChains(20, 0.3, 1000, seededRandom(7));
    expect(a).toEqual(b);
    expect(a).toHaveLength(1000);
    const counts = countsOf(a, 20);
    expect(counts.reduce((s, c) => s + c, 0)).toBe(1000);
    expect(meanOfCounts(counts)).toBeGreaterThan(5.6);
    expect(meanOfCounts(counts)).toBeLessThan(6.4);
    const chain = bernoulliChain(10, 1, seededRandom(1));
    expect(chain.every((x) => x)).toBe(true);
    expect(simulateChains(10, 0, 5, seededRandom(3))).toEqual([0, 0, 0, 0, 0]);
  });

  it('wissenschaftliche Schreibweise', () => {
    expect(scientific(126410606437752)).toEqual({ m: 1.264, e: 14 });
    expect(scientific(0.000123456)).toEqual({ m: 1.235, e: -4 });
    expect(scientific(9.99999e5)).toEqual({ m: 1, e: 6 });
  });
});
