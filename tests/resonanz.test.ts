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
/** Eingeschwungene Amplitude in Grad. */
const deg = (fE: number, delta: number, amp = 5) => steadyAmplitude(drive(fE, delta, amp)) / DEG;

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

  it('Werte der Anzeige und der Aufgaben (von Hand nachgerechnet)', () => {
    const shiftDeg = (fE: number, delta: number) => phaseShift(2 * Math.PI * fE, OMEGA0, delta) / DEG;
    // Start: f_E = 0,3 Hz, δ = 0,25 1/s → 7,7° (1,55-fach), Δφ ≈ 8°
    expect(amplitudeRatio(2 * Math.PI * 0.3, OMEGA0, 0.25)).toBeCloseTo(1.5454, 3);
    expect(shiftDeg(0.3, 0.25)).toBeCloseTo(8.49, 1);
    // Schnelle Erregung f_E = 1 Hz → 1,7°, Δφ ≈ 174°
    expect(deg(1, 0.25)).toBeCloseTo(1.657, 2);
    expect(shiftDeg(1, 0.25)).toBeCloseTo(173.94, 1);
    // Aufgabe 2: f_E = 1,5 Hz → etwa 0,6°
    expect(deg(1.5, 0.25)).toBeCloseTo(0.624, 2);
    // Aufgabe 4: δ > 10° · π / 240° ≈ 0,131 1/s; bei δ = 0,16 1/s etwa 98°
    expect((10 * Math.PI) / 240).toBeCloseTo(0.1309, 4);
    expect(deg(0.5, 0.16, 10)).toBeCloseTo(98.17, 1);
    expect(deg(0.5, 0.13, 10)).toBeGreaterThan(120);
    // Aufgabe 5 und Anzeige f_R: δ = 0,25 → 0,497 Hz, δ = 1 → 0,446 Hz
    expect(resonanceOmega(OMEGA0, 0.25) / (2 * Math.PI)).toBeCloseTo(0.49683, 4);
    expect(resonanceOmega(OMEGA0, 1) / (2 * Math.PI)).toBeCloseTo(0.44648, 4);
    // Resonanzkatastrophe-Beispiel: Theorie 523,6°
    expect(deg(0.5, 0.03, 10)).toBeCloseTo(523.6, 1);
  });

  it('Halbwertsbreite bei schwacher Dämpfung: Δf ≈ δ/π', () => {
    const delta = 0.05;
    const peak = amplitudeRatio(resonanceOmega(OMEGA0, delta), OMEGA0, delta);
    const target = peak / Math.SQRT2;
    // Grenzen links und rechts per Bisektion
    const edge = (lo: number, hi: number, rising: boolean) => {
      for (let i = 0; i < 80; i++) {
        const mid = (lo + hi) / 2;
        const above = amplitudeRatio(mid, OMEGA0, delta) > target;
        if (above === rising) hi = mid;
        else lo = mid;
      }
      return (lo + hi) / 2;
    };
    const w1 = edge(0.5 * OMEGA0, OMEGA0, true);
    const w2 = edge(OMEGA0, 1.5 * OMEGA0, false);
    expect((w2 - w1) / (2 * Math.PI)).toBeCloseTo(delta / Math.PI, 3);
  });

  it('Sonderfälle und Reglergrenzen', () => {
    // ohne Dämpfung: Resonanz genau bei ω₀, Amplitude dort unendlich (Regler erlaubt δ ≥ 0,03)
    expect(resonanceOmega(OMEGA0, 0)).toBeCloseTo(OMEGA0, 12);
    expect(amplitudeRatio(OMEGA0, OMEGA0, 0)).toBe(Infinity);
    // f_E → 0: Rad folgt dem Erreger (Verhältnis 1, Phase 0)
    expect(amplitudeRatio(0, OMEGA0, 0.25)).toBe(1);
    expect(phaseShift(0, OMEGA0, 0.25)).toBe(0);
    // f_E ≫ f₀: Amplitude ∝ 1/ω_E², Phase → 180°
    expect(amplitudeRatio(100 * OMEGA0, OMEGA0, 0.25)).toBeCloseTo(1 / (100 ** 2 - 1), 6);
    // Reglergrenzen: f_E 0,05 … 1,5 Hz, δ 0,03 … 1,5 1/s, φ̂_E 2 … 15° – alles endlich, Phase in [0; π]
    for (const fE of [0.05, 0.5, 1.5])
      for (const delta of [0.03, 1.5])
        for (const amp of [2, 15]) {
          const a = deg(fE, delta, amp);
          expect(Number.isFinite(a)).toBe(true);
          const ph = phaseShift(2 * Math.PI * fE, OMEGA0, delta);
          expect(ph).toBeGreaterThanOrEqual(0);
          expect(ph).toBeLessThanOrEqual(Math.PI);
        }
    // größte Dämpfung δ = 1,5 1/s < ω₀/√2 ≈ 2,22 1/s: Maximum existiert noch, bei √(π² − 4,5)/(2π) ≈ 0,369 Hz
    expect(resonanceOmega(OMEGA0, 1.5) / (2 * Math.PI)).toBeCloseTo(0.3688, 3);
    // ab δ ≥ ω₀/√2 gibt es kein Maximum mehr
    expect(resonanceOmega(OMEGA0, OMEGA0 / Math.SQRT2 + 1e-9)).toBe(0);
  });
});
