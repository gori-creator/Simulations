import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  binomCdf,
  binomMoments,
  binomPmf,
  cdf,
  erf,
  inflectionTangents,
  invPhi,
  laplaceMinN,
  laplaceOk,
  maxSigmaFor,
  morphStandard,
  normalApproxCdf,
  normalSample,
  pdf,
  pdfMax,
  prob,
  probOfBound,
  quantile,
  sampleStats,
  sigmaRule,
  tolerance,
  zScore,
} from '../src/simulations/mathematik/normalverteilung/model';

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

describe('Modell: Normalverteilung – Prüfwerte der Leitung', () => {
  it('Sigma-Regeln auf 6 Stellen: 0,682689 / 0,954500 / 0,997300 (für jedes μ und σ)', () => {
    for (const [mu, s] of [[0, 1], [100, 15], [500, 4], [-2.3, 0.4]] as const) {
      expect(prob(mu - s, mu + s, mu, s)).toBeCloseTo(0.682689, 6);
      expect(prob(mu - 2 * s, mu + 2 * s, mu, s)).toBeCloseTo(0.9545, 6);
      expect(prob(mu - 3 * s, mu + 3 * s, mu, s)).toBeCloseTo(0.9973, 6);
    }
  });
  it('IQ: P(X ≥ 130) = 1 − Φ(2) = 0,022750; 95-%-Quantil 100 + 15 · 1,644854 = 124,6728', () => {
    expect(probOfBound('ge', 130, 100, 15)).toBeCloseTo(0.02275, 6);
    expect(invPhi(0.95)).toBeCloseTo(1.644854, 6);
    expect(quantile('le', 0.95, 100, 15).hi).toBeCloseTo(124.6728, 4);
    // „nur von 5 % übertroffen“ ist dieselbe Grenze
    const q = quantile('ge', 0.05, 100, 15);
    expect(q.lo).toBeCloseTo(124.6728, 4);
    expect(q.phi).toBeCloseTo(0.95, 12);
    expect(q.z).toBeCloseTo(1.644854, 6);
  });
  it('Abfüllung μ = 500 ml, σ = 4 ml: P(497 ≤ X ≤ 503) = 2Φ(0,75) − 1 = 0,546745', () => {
    expect(prob(497, 503, 500, 4)).toBeCloseTo(0.546745, 6);
    expect(2 * cdf(0.75, 0, 1) - 1).toBeCloseTo(0.546745, 6);
    expect(tolerance(500, 4, 497, 503).inside).toBeCloseTo(0.546745, 6);
  });
  it('B(100; 0,5): exakt 0,864373, mit Korrektur Φ(1,1) = 0,864334, ohne Φ(1) = 0,841345', () => {
    expect(binomCdf(100, 0.5, 55)).toBeCloseTo(0.864373, 6);
    expect(cdf(1.1, 0, 1)).toBeCloseTo(0.864334, 6);
    expect(cdf(1, 0, 1)).toBeCloseTo(0.841345, 6);
  });
  it('Laplace-Bedingung bei p = 0,1: σ > 3 ⟺ n > 100 (n = 100 ist der Grenzfall σ = 3)', () => {
    expect(binomMoments(100, 0.1).sigma).toBeCloseTo(3, 12);
    expect(laplaceOk(100, 0.1)).toBe(false);
    expect(laplaceOk(101, 0.1)).toBe(true);
    expect(laplaceMinN(0.1)).toBe(101);
    expect(laplaceMinN(0.5)).toBe(37); // σ = √(n/4) > 3 ⟺ n > 36
    expect(laplaceMinN(0.3)).toBe(43); // 9/0,21 ≈ 42,86
  });
  it('Standardnormalverteilung: φ(0) = 1/√(2π) = 0,398942, Wendestellen bei ±1', () => {
    expect(pdfMax(1)).toBeCloseTo(0.398942, 6);
    expect(pdf(0, 0, 1)).toBeCloseTo(0.398942, 6);
    const [l, r] = inflectionTangents(0, 1);
    expect(l!.x).toBe(-1);
    expect(r!.x).toBe(1);
    // Steigung der Wendetangente: ∓ φ(±1) = ∓ 0,241971
    expect(r!.slope).toBeCloseTo(-0.241971, 6);
    expect(l!.slope).toBeCloseTo(0.241971, 6);
  });
});

describe('Modell: Normalverteilung – Umkehrung, Standardisieren, Eigenschaften, Vergleich', () => {
  it('Tabelle rückwärts: Φ⁻¹(0,975) = 1,959964; Φ⁻¹(0,5) = 0; Φ⁻¹(0,01) = −2,326348', () => {
    expect(invPhi(0.975)).toBeCloseTo(1.959964, 6);
    expect(invPhi(0.5)).toBeCloseTo(0, 12);
    expect(invPhi(0.01)).toBeCloseTo(-2.326348, 6);
    expect(invPhi(0.999)).toBeCloseTo(3.090232, 6);
    expect(invPhi(0)).toBe(-Infinity);
    expect(invPhi(1)).toBe(Infinity);
  });
  it('Plausibilität: Φ(Φ⁻¹(p)) = p und Symmetrie für viele Zufallswerte', () => {
    const rnd = seededRandom(11);
    for (let i = 0; i < 400; i++) {
      const p = 1e-6 + rnd() * (1 - 2e-6);
      const z = invPhi(p);
      expect(cdf(z, 0, 1)).toBeCloseTo(p, 11);
      expect(invPhi(1 - p)).toBeCloseTo(-z, 8);
    }
  });
  it('symmetrisches Intervall: P(μ − c ≤ X ≤ μ + c) = 95 % ⇒ c = 1,96 σ; Umkehrprobe', () => {
    const q = quantile('mid', 0.95, 500, 4);
    expect(q.hi - 500).toBeCloseTo(1.959964 * 4, 5);
    expect(q.lo).toBeCloseTo(500 - 1.959964 * 4, 5);
    expect(probOfBound('mid', q.hi, 500, 4)).toBeCloseTo(0.95, 10);
    expect(probOfBound('mid', q.lo, 500, 4)).toBeCloseTo(0.95, 10);
    expect(probOfBound('le', quantile('le', 0.3, 2, 0.7).hi, 2, 0.7)).toBeCloseTo(0.3, 10);
  });
  it('Standardisieren als Überblendung: Fläche bleibt für jedes t gleich, Endpunkt ist N(0; 1)', () => {
    const rnd = seededRandom(3);
    for (let i = 0; i < 60; i++) {
      const mu = rnd() * 200 - 100;
      const s = 0.2 + rnd() * 20;
      const a = mu - rnd() * 3 * s;
      const b = mu + rnd() * 3 * s;
      const t = rnd();
      const m = morphStandard(t, mu, s);
      expect(prob(m.map(a), m.map(b), m.mu, m.sigma)).toBeCloseTo(prob(a, b, mu, s), 10);
      expect(m.unmap(m.map(a))).toBeCloseTo(a, 8);
      expect(m.map(mu)).toBeCloseTo(m.mu, 8);
    }
    const end = morphStandard(1, 100, 15);
    expect(end.mu).toBe(0);
    expect(end.sigma).toBe(1);
    expect(end.map(130)).toBeCloseTo(2, 12);
    const start = morphStandard(0, 100, 15);
    expect(start.map(130)).toBe(130);
  });
  it('Glocke: Maximum halbiert sich bei doppeltem σ, Wendetangenten treffen die x-Achse bei μ ± 2σ, Gesamtfläche 1', () => {
    expect(pdfMax(2)).toBeCloseTo(pdfMax(1) / 2, 14);
    expect(pdfMax(0.2)).toBeCloseTo(1.994711, 6); // sehr kleines σ: schmal und hoch
    for (const t of inflectionTangents(500, 4)) expect(t.root).toBeCloseTo(500 + 2 * Math.sign(t.x - 500) * 4, 9);
    expect(prob(-40, 40, 0, 1)).toBeCloseTo(1, 14);
    expect(prob(400, 600, 500, 4)).toBeCloseTo(1, 14);
  });
  it('Sonderfälle: P(X = a) = 0, vertauschte Grenzen a > b, Intervalle um a werden beliebig klein', () => {
    expect(prob(1.3, 1.3, 0, 1)).toBe(0);
    expect(prob(1, -1, 0, 1)).toBeCloseTo(prob(-1, 1, 0, 1), 15);
    const h = [0.1, 0.01, 0.001].map((w) => prob(1 - w, 1 + w, 0, 1));
    expect(h[0]!).toBeGreaterThan(h[1]!);
    expect(h[1]!).toBeGreaterThan(h[2]!);
    expect(h[2]!).toBeCloseTo(0.002 * pdf(1, 0, 1), 7);
  });
  it('Zwei Abfüllanlagen, Toleranz 495 … 505 ml: A (500; 4) 0,788700, B (502; 2,5) 0,882375 – schmaler, aber verschoben (504; 2) nur 0,691459', () => {
    const A = tolerance(500, 4, 495, 505);
    const B = tolerance(502, 2.5, 495, 505);
    const C = tolerance(504, 2, 495, 505);
    expect(A.inside).toBeCloseTo(2 * cdf(1.25, 0, 1) - 1, 12);
    expect(A.inside).toBeCloseTo(0.7887, 4);
    expect(A.inside).toBeCloseTo(0.788700, 6);
    expect(B.inside).toBeCloseTo(cdf(1.2, 0, 1) - cdf(-2.8, 0, 1), 12);
    expect(B.inside).toBeCloseTo(0.882375, 6);
    expect(C.inside).toBeCloseTo(0.691459, 5);
    expect(A.inside + A.reject).toBeCloseTo(1, 14);
    expect(B.below).toBeCloseTo(cdf(-2.8, 0, 1), 12);
    // mittig eingestellt: σ ≤ 5/2,575829 ≈ 1,9411 ml für 99 % im Toleranzbereich
    expect(maxSigmaFor(495, 505, 0.99)).toBeCloseTo(5 / 2.575829, 5);
    expect(tolerance(500, maxSigmaFor(495, 505, 0.99), 495, 505).inside).toBeCloseTo(0.99, 10);
  });
});
