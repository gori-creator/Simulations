import { describe, expect, it } from 'vitest';
import { cdf, erf, pdf, prob, sigmaRule, zScore } from '../src/simulations/mathematik/normalverteilung/model';

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
