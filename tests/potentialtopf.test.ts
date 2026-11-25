import { describe, expect, it } from 'vitest';
import { E, energy, MN, probability, psi, transitionWavelength } from '../src/simulations/physik/potentialtopf/model';

describe('Potentialtopf', () => {
  it('Elektron in 1 nm: E₁ ≈ 0,376 eV, E_n ∝ n²', () => {
    expect(energy(1, 1e-9) / E).toBeCloseTo(0.376, 3);
    expect(energy(3, 1e-9) / energy(1, 1e-9)).toBeCloseTo(9, 10);
  });

  it('Wellenfunktion ist normiert', () => {
    const L = 1e-9;
    let s = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const x = ((i + 0.5) * L) / N;
      s += psi(2, x, L) ** 2 * (L / N);
    }
    expect(s).toBeCloseTo(1, 6);
    expect(probability(2, 0, L, L)).toBeCloseTo(1, 12);
  });

  it('Grundzustand: in der Mitte am wahrscheinlichsten; n = 2: Mitte leer', () => {
    const L = 1;
    expect(probability(1, 0.4, 0.6, L)).toBeGreaterThan(0.35);
    expect(probability(2, 0.45, 0.55, L)).toBeLessThan(0.01);
  });

  it('Übergang 2 → 1 in 1 nm liegt im Infraroten', () => {
    const l = transitionWavelength(2, 1, 1e-9);
    expect(l * 1e9).toBeCloseTo(1099, -1);
  });

  it('Nukleon im Kern (10 fm): Energien im MeV-Bereich', () => {
    expect(energy(1, 1e-14, MN) / E / 1e6).toBeCloseTo(2.05, 1);
  });
});
