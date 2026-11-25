import { describe, expect, it } from 'vitest';
import { binomial, cumulative, expCdf, expDensity, hypergeometric, poisson } from '../src/simulations/mathematik/verteilungen/model';

describe('Poisson-Verteilung', () => {
  it('Summe 1, Erwartungswert λ', () => {
    let s = 0;
    let e = 0;
    for (let k = 0; k < 100; k++) {
      s += poisson(4, k);
      e += k * poisson(4, k);
    }
    expect(s).toBeCloseTo(1, 10);
    expect(e).toBeCloseTo(4, 8);
  });

  it('P(X = 0) = e^−λ', () => {
    expect(poisson(2, 0)).toBeCloseTo(Math.exp(-2), 12);
  });

  it('Näherung der Binomialverteilung für großes n, kleines p', () => {
    const n = 1000;
    const p = 0.003;
    for (const k of [0, 2, 5]) expect(binomial(n, p, k)).toBeCloseTo(poisson(n * p, k), 3);
  });
});

describe('Hypergeometrische Verteilung', () => {
  it('Lotto 6 aus 49: drei Richtige', () => {
    expect(hypergeometric(49, 6, 6, 3)).toBeCloseTo(0.017650, 6);
  });

  it('Summe 1 und Erwartungswert n·M/N', () => {
    let s = 0;
    let e = 0;
    for (let k = 0; k <= 10; k++) {
      s += hypergeometric(30, 12, 10, k);
      e += k * hypergeometric(30, 12, 10, k);
    }
    expect(s).toBeCloseTo(1, 10);
    expect(e).toBeCloseTo(4, 10);
  });

  it('große Urne: fast wie mit Zurücklegen', () => {
    expect(hypergeometric(10000, 3000, 10, 3)).toBeCloseTo(binomial(10, 0.3, 3), 3);
  });
});

describe('Exponentialverteilung', () => {
  it('Dichte und Verteilungsfunktion', () => {
    expect(expDensity(0.5, 0)).toBeCloseTo(0.5, 12);
    expect(expCdf(0.5, 2)).toBeCloseTo(1 - Math.exp(-1), 12);
  });

  it('kumulierte Summe', () => {
    expect(cumulative((k) => poisson(3, k), 2)).toBeCloseTo(Math.exp(-3) * (1 + 3 + 4.5), 12);
  });
});
