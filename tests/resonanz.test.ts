import { describe, expect, it } from 'vitest';
import {
  amplitudeRatio,
  F0,
  integrate,
  OMEGA0,
  phaseShift,
  readPhasor,
  resonanceOmega,
  steadyAmplitude,
  steadyState,
  type Drive,
} from '../src/simulations/physik/resonanz/model';

const DEG = Math.PI / 180;
const drive = (fE: number, delta: number, ampDeg = 5): Drive => ({ ampE: ampDeg * DEG, omegaE: 2 * Math.PI * fE, delta, omega0: OMEGA0 });

describe('Modell: Erzwungene Schwingung (Pohlsches Rad)', () => {
  it('Eigenfrequenz f₀ = 0,5 Hz', () => {
    expect(F0).toBe(0.5);
    expect(OMEGA0).toBeCloseTo(Math.PI, 12);
  });

  it('Amplitudenverhältnis: 1 bei kleiner, Q bei Eigen-, → 0 bei großer Erregerfrequenz', () => {
    expect(amplitudeRatio(1e-6, OMEGA0, 0.25)).toBeCloseTo(1, 9);
    // bei ω_E = ω₀: φ̂/φ̂_E = ω₀ / (2δ)
    expect(amplitudeRatio(OMEGA0, OMEGA0, 0.25)).toBeCloseTo(OMEGA0 / 0.5, 12);
    expect(amplitudeRatio(20 * OMEGA0, OMEGA0, 0.25)).toBeLessThan(0.003);
    // konkreter Wert: φ̂_E = 5°, δ = 0,25 1/s, f_E = f₀ → φ̂ ≈ 31,4°
    expect(steadyAmplitude(drive(0.5, 0.25)) / DEG).toBeCloseTo(31.416, 2);
  });

  it('Phasenverschiebung 0 → π/2 → π', () => {
    expect(phaseShift(0.01, OMEGA0, 0.25)).toBeCloseTo(0, 2);
    expect(phaseShift(OMEGA0, OMEGA0, 0.25)).toBeCloseTo(Math.PI / 2, 12);
    expect(phaseShift(30, OMEGA0, 0.25)).toBeGreaterThan(Math.PI * 0.99);
    // stärkere Dämpfung → flacherer Übergang
    expect(phaseShift(0.8 * OMEGA0, OMEGA0, 1)).toBeGreaterThan(phaseShift(0.8 * OMEGA0, OMEGA0, 0.1));
  });

  it('Resonanzfrequenz ω_R = √(ω₀² − 2δ²) liegt etwas unter ω₀ und ist das Maximum', () => {
    const delta = 0.8;
    const wr = resonanceOmega(OMEGA0, delta);
    expect(wr).toBeCloseTo(Math.sqrt(Math.PI ** 2 - 1.28), 12);
    const peak = amplitudeRatio(wr, OMEGA0, delta);
    expect(peak).toBeGreaterThan(amplitudeRatio(wr * 1.01, OMEGA0, delta));
    expect(peak).toBeGreaterThan(amplitudeRatio(wr * 0.99, OMEGA0, delta));
    expect(resonanceOmega(OMEGA0, 3)).toBe(0);
  });

  it('numerische Lösung erreicht den eingeschwungenen Zustand (aus der Ruhe gestartet)', () => {
    for (const [fE, delta] of [
      [0.3, 0.25],
      [0.5, 0.4],
      [0.9, 0.6],
    ] as const) {
      const d = drive(fE, delta);
      const res = integrate(d, 0, [0, 0], 30 / delta, 0.002);
      const exact = steadyState(d, res.t);
      expect(res.s[0]).toBeCloseTo(exact[0], 6);
      expect(res.s[1]).toBeCloseTo(exact[1], 5);
      const ph = readPhasor(d, res.t, res.s);
      expect(ph.amp).toBeCloseTo(steadyAmplitude(d), 6);
      expect(ph.shift).toBeCloseTo(phaseShift(d.omegaE, OMEGA0, delta), 5);
    }
  });

  it('eingeschwungener Zustand bleibt eingeschwungen', () => {
    const d = drive(0.45, 0.2);
    const s0 = steadyState(d, 1.3);
    const res = integrate(d, 1.3, s0, 7.7, 0.001);
    const exact = steadyState(d, res.t);
    expect(res.s[0]).toBeCloseTo(exact[0], 8);
  });

  it('Resonanzkatastrophe: Grenze wird bei kleiner Dämpfung überschritten', () => {
    const d = drive(0.5, 0.03, 10);
    const res = integrate(d, 0, [0, 0], 60, 0.002, 120 * DEG);
    expect(res.exceeded).toBe(true);
    expect(res.t).toBeGreaterThan(5);
    expect(res.t).toBeLessThan(20);
    const calm = integrate(drive(0.5, 0.5, 10), 0, [0, 0], 60, 0.002, 120 * DEG);
    expect(calm.exceeded).toBe(false);
  });
});
