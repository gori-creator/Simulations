import { describe, expect, it } from 'vitest';
import { power, PS, REFERENCES, work } from '../src/simulations/physik/leistung/model';

describe('Arbeit und Leistung', () => {
  it('Hubarbeit 50 kg auf 6 m', () => {
    expect(work(50, 6)).toBeCloseTo(2943, 0);
  });

  it('schneller = mehr Leistung', () => {
    expect(power(50, 6, 6)).toBeCloseTo(2 * power(50, 6, 12), 9);
    expect(power(50, 6, 6)).toBeCloseTo(490.5, 1);
  });

  it('1 PS ≈ 736 W, Vergleichswerte aufsteigend', () => {
    expect(PS).toBeCloseTo(735.5, 1);
    for (let i = 1; i < REFERENCES.length; i++) expect(REFERENCES[i]!.P).toBeGreaterThan(REFERENCES[i - 1]!.P);
  });
});
