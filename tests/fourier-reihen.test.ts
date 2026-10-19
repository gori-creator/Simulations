import { describe, expect, it } from 'vitest';
import { a0, amplitude, coef, maxPartial, partial, target, type SigKey } from '../src/simulations/mathematik/fourier-reihen/model';

const PI = Math.PI;

describe('Modell: Fourier-Reihen', () => {
  it('Rechteck: bₖ = 4/(πk) für ungerade k, sonst 0', () => {
    expect(coef('sq', 1).b).toBeCloseTo(4 / PI, 14);
    expect(coef('sq', 3).b).toBeCloseTo(4 / (3 * PI), 14);
    expect(coef('sq', 2).b).toBe(0);
  });
  it('Leibniz: Rechteck bei π/2 → 1, Sägezahn bei π/2 → 1/2, Dreieck bei 0 → 1', () => {
    expect(partial('sq', 4001, PI / 2)).toBeCloseTo(1, 3);
    expect(partial('saw', 4001, PI / 2)).toBeCloseTo(0.5, 3);
    expect(partial('tri', 2001, 0)).toBeCloseTo(1, 3);
    expect(partial('half', 2000, PI / 2)).toBeCloseTo(1, 3);
  });
  it('Einweggleichrichtung: Mittelwert 1/π, b₁ = 1/2, a₂ = −2/(3π)', () => {
    expect(a0('half') / 2).toBeCloseTo(1 / PI, 14);
    expect(coef('half', 1).b).toBe(0.5);
    expect(coef('half', 2).a).toBeCloseTo(-2 / (3 * PI), 14);
  });
  it('Gibbs-Phänomen: Überschwingen ≈ 1,179 beim Rechteck, auch für großes N', () => {
    expect(maxPartial('sq', 49)).toBeCloseTo(1.179, 2);
    expect(maxPartial('sq', 99)).toBeCloseTo(1.179, 2);
  });
  it('Amplituden fallen: Rechteck wie 1/k, Dreieck wie 1/k²', () => {
    expect(amplitude('sq', 9) / amplitude('sq', 3)).toBeCloseTo(1 / 3, 12);
    expect(amplitude('tri', 9) / amplitude('tri', 3)).toBeCloseTo(1 / 9, 12);
  });
  it('Plausibilität: Partialsumme nähert die Zielfunktion abseits der Sprünge an', () => {
    for (const s of ['sq', 'saw', 'tri', 'half'] as SigKey[]) {
      for (let i = 0; i < 20; i++) {
        const x = -2.6 + Math.random() * 5.2;
        if (Math.abs(x) < 0.3) continue;
        expect(Math.abs(partial(s, 400, x) - target(s, x))).toBeLessThan(0.02);
      }
    }
  });
});
