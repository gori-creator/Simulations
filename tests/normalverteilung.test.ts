import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { binomCdf, binomMoments, binomPmf, cdf, erf, laplaceOk, normalApproxCdf, normalSample, pdf, prob, sampleStats, sigmaRule, zScore } from '../src/simulations/mathematik/normalverteilung/model';

describe('Modell: Normalverteilung', () => {
  it('Sigma-Regeln: 68,27 %, 95,45 %, 99,73 %', () => {
    expect(sigmaRule(1)).toBeCloseTo(0.682689492, 8);
    expect(sigmaRule(2)).toBeCloseTo(0.954499736, 8);
    expect(sigmaRule(3)).toBeCloseTo(0.997300204, 8);
    expect(prob(-1, 1, 0, 1)).toBeCloseTo(0.682689492, 8);
  });
  it('Tabellenwerte Φ: Φ(0) = 0,5; Φ(1) ≈ 0,8413; Φ(1,96) ≈ 0,9750; Φ(−2,5) ≈ 0,00621', () => {
    expect(cdf(0, 0, 1)).toBe(0.5);
    expect(cdf(1, 0, 1)).toBeCloseTo(0.841344746, 8);
    expect(cdf(1.96, 0, 1)).toBeCloseTo(0.975002105, 8);
    expect(cdf(-2.5, 0, 1)).toBeCloseTo(0.006209665, 8);
    expect(cdf(3, 0, 1)).toBeCloseTo(0.998650102, 8);
  });
  it('IQ-Beispiel: μ = 100, σ = 15 → P(X > 130) ≈ 2,28 %', () => {
    expect(1 - cdf(130, 100, 15)).toBeCloseTo(0.0227501, 6);
    expect(zScore(130, 100, 15)).toBe(2);
  });
  it('Dichte: Maximum 1/(σ√(2π)), Wendestellen bei μ ± σ', () => {
    expect(pdf(0, 0, 1)).toBeCloseTo(0.39894228, 8);
    expect(pdf(2, 2, 0.5)).toBeCloseTo(0.79788456, 8);
    // zweite Ableitung wechselt bei μ ± σ das Vorzeichen
    const h = 1e-3;
    const d2 = (x: number) => (pdf(x + h, 0, 1) - 2 * pdf(x, 0, 1) + pdf(x - h, 0, 1)) / (h * h);
    expect(d2(0.99) * d2(1.01)).toBeLessThan(0);
  });
  it('erf: Reihe und Kettenbruch stimmen am Übergang überein', () => {
    expect(erf(2.4999999)).toBeCloseTo(erf(2.5000001), 8);
    expect(erf(2)).toBeCloseTo(0.995322265018953, 13);
    expect(erf(3)).toBeCloseTo(0.999977909503001, 13);
    expect(erf(2.5)).toBeCloseTo(0.999593047982555, 12);
  });
  it('Plausibilität: Fläche ≈ numerisches Integral, Symmetrie', () => {
    for (let i = 0; i < 30; i++) {
      const mu = Math.random() * 6 - 3;
      const s = 0.4 + Math.random() * 2;
      const a = mu - Math.random() * 3 * s;
      const b = mu + Math.random() * 3 * s;
      const N = 4000;
      let sum = 0;
      for (let k = 0; k < N; k++) sum += pdf(a + ((k + 0.5) * (b - a)) / N, mu, s);
      expect(prob(a, b, mu, s)).toBeCloseTo((sum * (b - a)) / N, 6);
      expect(cdf(mu - (b - mu), mu, s)).toBeCloseTo(1 - cdf(b, mu, s), 12);
    }
  });
});

describe('Modell: Normalverteilung – Näherung der Binomialverteilung und Stichproben', () => {
  it('B(100; 0,5): P(X ≤ 55) = 0,86437; mit Stetigkeitskorrektur Φ(1,1) = 0,86433, ohne Φ(1) = 0,84134', () => {
    expect(binomCdf(100, 0.5, 55)).toBeCloseTo(0.864373, 6);
    expect(normalApproxCdf(100, 0.5, 55, true)).toBeCloseTo(0.864334, 6);
    expect(normalApproxCdf(100, 0.5, 55, false)).toBeCloseTo(0.841345, 6);
  });
  it('B(50; 0,3): μ = 15, σ ≈ 3,2404 (Laplace erfüllt); P(X ≤ 12) = 0,22287 ≈ 0,2202', () => {
    const { mu, sigma } = binomMoments(50, 0.3);
    expect(mu).toBeCloseTo(15, 12);
    expect(sigma).toBeCloseTo(3.2404, 4);
    expect(laplaceOk(50, 0.3)).toBe(true);
    expect(binomCdf(50, 0.3, 12)).toBeCloseTo(0.222866, 6);
    expect(normalApproxCdf(50, 0.3, 12)).toBeCloseTo(0.2202, 4);
  });
  it('B(20; 0,1): σ ≈ 1,34 < 3 – Näherung schlecht (0,3917 vs. 0,3547)', () => {
    expect(laplaceOk(20, 0.1)).toBe(false);
    expect(binomCdf(20, 0.1, 1)).toBeCloseTo(0.391747, 6);
    expect(normalApproxCdf(20, 0.1, 1)).toBeCloseTo(0.354694, 6);
  });
  it('Wahrscheinlichkeiten summieren sich zu 1, auch bei n = 200 und p = 0,95', () => {
    for (const [n, p] of [[10, 0.5], [200, 0.95], [200, 0.05], [1, 0.3]] as const) {
      expect(binomPmf(n, p).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    }
    expect(binomPmf(4, 0.5)).toEqual([1 / 16, 4 / 16, 6 / 16, 4 / 16, 1 / 16].map((v) => expect.closeTo(v, 12)));
  });
  it('Stichproben: Mittelwert, Standardabweichung und σ-Anteil nähern sich μ, σ und 68,3 %', () => {
    const rnd = seededRandom(7);
    const xs = Array.from({ length: 20000 }, () => normalSample(rnd, 500, 4));
    const st = sampleStats(xs, 496, 504);
    expect(st.mean).toBeGreaterThan(499.9);
    expect(st.mean).toBeLessThan(500.1);
    expect(st.sd).toBeGreaterThan(3.9);
    expect(st.sd).toBeLessThan(4.1);
    expect(st.share).toBeGreaterThan(0.67);
    expect(st.share).toBeLessThan(0.695);
  });
  it('sampleStats: Kleinbeispiel von Hand', () => {
    const st = sampleStats([1, 2, 3, 4], 2, 3);
    expect(st.mean).toBe(2.5);
    expect(st.sd).toBeCloseTo(Math.sqrt(5 / 3), 12);
    expect(st.share).toBe(0.5);
  });
});
