import { describe, expect, it } from 'vitest';
import {
  betaFromGamma,
  betaFromKinetic,
  C,
  contractedLength,
  dilatedTime,
  energies,
  EXAMPLES,
  flightTime,
  gamma,
  gammaAxisTop,
  gammaMinusOne,
  lagPerDay,
  lightClock,
  meanFlight,
  MUON_TAU,
  PARTICLES,
  properTime,
  pulseHeight,
  sci,
  simultaneity,
  survival,
} from '../src/simulations/physik/zeitdilatation/model';

describe('Modell: Zeitdilatation und Längenkontraktion', () => {
  it('Lorentzfaktor: v = 0,6 c → γ = 1,25; v = 0,8 c → γ = 5/3', () => {
    expect(gamma(0.6)).toBeCloseTo(1.25, 12);
    expect(gamma(0.8)).toBeCloseTo(5 / 3, 12);
    // √(1 − 0,99²) = √0,0199 → γ ≈ 7,089
    expect(gamma(0.99)).toBeCloseTo(7.0888, 4);
  });

  it('Zeitdilatation: 10 s Eigenzeit bei 0,6 c → 12,5 s', () => {
    expect(dilatedTime(10, 0.6)).toBeCloseTo(12.5, 12);
    expect(properTime(12.5, 0.6)).toBeCloseTo(10, 12);
    expect(dilatedTime(3, 0.8)).toBeCloseTo(5, 12);
  });

  it('Längenkontraktion: 100 m Ruhelänge bei 0,6 c → 80 m', () => {
    expect(contractedLength(100, 0.6)).toBeCloseTo(80, 12);
    expect(contractedLength(100, 0.8)).toBeCloseTo(60, 12);
  });

  it('Sonderfälle: v = 0 → γ = 1, v → c → γ → ∞', () => {
    expect(gamma(0)).toBe(1);
    expect(gammaMinusOne(0)).toBe(0);
    expect(contractedLength(100, 0)).toBe(100);
    expect(dilatedTime(10, 0)).toBe(10);
    expect(gamma(1)).toBe(Infinity);
    expect(contractedLength(100, 1)).toBe(0);
    expect(gamma(0.999999)).toBeGreaterThan(700);
    expect(betaFromGamma(1)).toBe(0);
    expect(betaFromGamma(0.5)).toBe(0);
  });

  it('γ − 1 ist auch bei Alltagsgeschwindigkeiten genau (≈ β²/2)', () => {
    const b = 1e-6;
    expect(gammaMinusOne(b) / (b * b / 2)).toBeCloseTo(1, 9);
    expect(gammaMinusOne(0.6)).toBeCloseTo(0.25, 12);
  });

  it('Zufallsprüfung: γ ≥ 1, L · γ = L₀, Δt / γ = Δt₀, β aus γ zurück', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 500; i++) {
      const b = rnd() * 0.9999;
      const L0 = 1 + rnd() * 500;
      const t0 = 0.1 + rnd() * 100;
      const g = gamma(b);
      expect(g).toBeGreaterThanOrEqual(1);
      expect(contractedLength(L0, b) * g).toBeCloseTo(L0, 8);
      expect(dilatedTime(t0, b) / g).toBeCloseTo(t0, 9);
      expect(betaFromGamma(g)).toBeCloseTo(b, 7);
      expect(gammaMinusOne(b)).toBeCloseTo(g - 1, 9);
    }
  });

  it('Lichtuhr: Pythagoras (c·Δt/2)² = d² + (v·Δt/2)²', () => {
    const d = 1.5;
    const lc = lightClock(d, 0.6);
    expect(lc.t0).toBeCloseTo((2 * d) / C, 18);
    expect(lc.t / lc.t0).toBeCloseTo(1.25, 12);
    expect(lc.hyp ** 2).toBeCloseTo(d * d + lc.run ** 2, 9);
    // bei 0,6 c: Hypotenuse 1,25 d, Kathete 0,75 d (3-4-5-Dreieck)
    expect(lc.hyp / d).toBeCloseTo(1.25, 12);
    expect(lc.run / d).toBeCloseTo(0.75, 12);
    expect(pulseHeight(0)).toBe(0);
    expect(pulseHeight(0.25)).toBeCloseTo(0.5, 12);
    expect(pulseHeight(0.5)).toBe(1);
    expect(pulseHeight(3.75)).toBeCloseTo(0.5, 12);
  });

  it('Gleichzeitigkeit: L₀ = 100 m, v = 0,6 c', () => {
    const s = simultaneity(100, 0.6);
    expect(s.L).toBeCloseTo(80, 12);
    expect(s.tTrain * C).toBeCloseTo(50, 9);
    // hinten: 40 m / 1,6 c = 25 m/c, vorn: 40 m / 0,4 c = 100 m/c, Unterschied 75 m/c = γ·v·L₀/c²
    expect(s.tBack * C).toBeCloseTo(25, 9);
    expect(s.tFront * C).toBeCloseTo(100, 9);
    expect(s.dt * C).toBeCloseTo(75, 9);
    expect(s.tFront - s.tBack).toBeCloseTo(s.dt, 15);
    // im Stand gleichzeitig
    const r = simultaneity(100, 0);
    expect(r.tFront).toBeCloseTo(r.tBack, 18);
    expect(r.dt).toBe(0);
  });

  it('Myonen: τ = 2,2 µs, v = 0,998 c → γ ≈ 15,8, Strecke ≈ 10,4 km statt 658 m', () => {
    expect(gamma(0.998)).toBeCloseTo(15.819, 3);
    expect(meanFlight(0.998, MUON_TAU, false)).toBeCloseTo(658.2, 1);
    expect(meanFlight(0.998)).toBeCloseTo(10412, -1);
    // 10 km: Flugzeit 33,4 µs; mit Zeitdilatation kommen ≈ 38 % an, klassisch ≈ 2,5 · 10⁻⁷
    expect(flightTime(10000, 0.998) * 1e6).toBeCloseTo(33.42, 2);
    expect(survival(10000, 0.998)).toBeCloseTo(0.3828, 3);
    expect(survival(10000, 0.998, MUON_TAU, false)).toBeCloseTo(2.52e-7, 8);
    // gleichwertig im System des Myons: verkürzte Atmosphäre, Eigenzeit
    const h = 10000;
    const tauOwn = contractedLength(h, 0.998) / (0.998 * C);
    expect(Math.exp(-tauOwn / MUON_TAU)).toBeCloseTo(survival(h, 0.998), 12);
    expect(survival(0, 0)).toBe(1);
    expect(survival(100, 0)).toBe(0);
  });

  it('Energie: E = γ·E₀, E_kin = (γ − 1)·E₀; bei 0,6 c E_kin = 0,25 E₀ statt 0,18 E₀', () => {
    const en = energies(1, 0.6);
    expect(en.e).toBeCloseTo(1.25, 12);
    expect(en.kin).toBeCloseTo(0.25, 12);
    expect(en.kinClassic).toBeCloseTo(0.18, 12);
    expect(en.pc).toBeCloseTo(0.75, 12);
    // Energie-Impuls-Beziehung E² = (pc)² + E₀²
    for (const b of [0.1, 0.5, 0.9, 0.99]) {
      const q = energies(PARTICLES.p.e0, b);
      expect(q.e ** 2).toBeCloseTo(q.pc ** 2 + q.e0 ** 2, 4);
      expect(q.kin).toBeGreaterThan(q.kinClassic);
    }
    // Elektron: 0,511 MeV Ruheenergie ≙ m·c²
    const mc2 = (PARTICLES.e.m * C * C) / 1.602176634e-13;
    expect(mc2).toBeCloseTo(PARTICLES.e.e0, 4);
    // 25 kV → β ≈ 0,302
    expect(betaFromKinetic(PARTICLES.e.e0, 0.025)).toBeCloseTo(0.302, 3);
  });

  it('Alltag: GPS-Satellit (3,87 km/s) geht wegen der Bewegung ≈ 7,2 µs pro Tag nach', () => {
    const gps = EXAMPLES.find((x) => x.id === 'gps')!;
    expect(lagPerDay(gps.v) * 1e6).toBeCloseTo(7.21, 2);
    const lhc = EXAMPLES.find((x) => x.id === 'lhc')!;
    expect(gamma(lhc.v / C)).toBeCloseTo(7248.4, 0);
    // nach Geschwindigkeit sortiert
    for (let i = 1; i < EXAMPLES.length; i++) expect(EXAMPLES[i]!.v).toBeGreaterThan(EXAMPLES[i - 1]!.v);
  });

  it('Hilfen: Zehnerpotenz und Achsenobergrenze', () => {
    expect(sci(8.349e-11)).toEqual({ m: 8.3, e: -11 });
    expect(sci(9.96, 1)).toEqual({ m: 1, e: 1 });
    expect(sci(0)).toEqual({ m: 0, e: 0 });
    expect(gammaAxisTop(1)).toBe(2);
    expect(gammaAxisTop(7.09)).toBeGreaterThan(7.09);
    expect(gammaAxisTop(22.4)).toBeGreaterThan(22.4);
  });
});
