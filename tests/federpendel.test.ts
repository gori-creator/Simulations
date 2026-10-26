import { describe, expect, it } from 'vitest';
import {
  acceleration,
  analyticY,
  dampedOmega,
  dampedPeriod,
  energies,
  equilibriumExtension,
  forces,
  G,
  initialState,
  omega0,
  period,
  phasor,
  step,
  type State,
} from '../src/simulations/physik/federpendel/model';

/** Integriert mit fester Schrittweite bis zur Zeit T. */
function run(state: State, m: number, D: number, delta: number, T: number, h = 0.001): State {
  let s: State = state;
  const n = Math.round(T / h);
  for (let i = 0; i < n; i++) s = step(s, m, D, delta, h);
  return s;
}

describe('Modell: Federpendel', () => {
  it('berechnet die Periodendauer T = 2π·√(m/D)', () => {
    expect(period(0.5, 20)).toBeCloseTo(0.99346, 4);
    expect(period(1, 10)).toBeCloseTo(1.98692, 4);
    // vierfache Masse → doppelte Periodendauer, vierfache Federhärte → halbe
    expect(period(1, 20) / period(0.25, 20)).toBeCloseTo(2, 12);
    expect(period(0.3, 40) / period(0.3, 10)).toBeCloseTo(0.5, 12);
    expect(omega0(0.5, 20)).toBeCloseTo(Math.sqrt(40), 12);
  });

  it('Dehnung in der Ruhelage s₀ = m·g/D (Federkraft = Gewichtskraft)', () => {
    expect(equilibriumExtension(0.5, 20)).toBeCloseTo(0.24525, 10);
    const f = forces(0, 0.5, 20);
    expect(f.spring).toBeCloseTo(0.5 * G, 10);
    expect(f.net).toBeCloseTo(0, 12);
    // lineares Kraftgesetz: resultierende Kraft = −D·y
    expect(forces(0.03, 0.5, 20).net).toBeCloseTo(-0.6, 10);
    expect(forces(-0.05, 0.5, 20).net).toBeCloseTo(1, 10);
  });

  it('Anfangszustand passt zu y = ŷ·sin(ωt + φ₀)', () => {
    const down = initialState(0.05, -Math.PI / 2, 0.5, 20, 0);
    expect(down[0]).toBeCloseTo(-0.05, 12);
    expect(down[1]).toBeCloseTo(0, 12);
    const push = initialState(0.05, 0, 0.5, 20, 0);
    expect(push[0]).toBeCloseTo(0, 12);
    expect(push[1]).toBeCloseTo(0.05 * Math.sqrt(40), 12);
  });

  it('Runge-Kutta stimmt mit der exakten Lösung überein (ungedämpft und gedämpft)', () => {
    for (const delta of [0, 0.3, 1.5]) {
      const s = run(initialState(0.05, 0.4, 0.5, 20, delta), 0.5, 20, delta, 7.5);
      expect(s[0]).toBeCloseTo(analyticY(7.5, 0.05, 0.4, 0.5, 20, delta), 8);
    }
  });

  it('nach einer Periodendauer ist der Zustand wieder derselbe', () => {
    const s0 = initialState(0.08, -Math.PI / 2, 0.4, 25, 0);
    const T = period(0.4, 25);
    const s = run(s0, 0.4, 25, 0, T, T / 2000);
    expect(s[0]).toBeCloseTo(s0[0], 9);
    expect(s[1]).toBeCloseTo(s0[1], 8);
  });

  it('Energie bleibt ohne Dämpfung erhalten: ½Dy² + ½mv² = ½Dŷ²', () => {
    const m = 0.5;
    const D = 20;
    const amp = 0.05;
    let s: State = initialState(amp, 1, m, D, 0);
    for (let k = 0; k < 5; k++) {
      s = run(s, m, D, 0, 0.37);
      const e = energies(s, m, D, -amp);
      expect(e.osc + e.kin).toBeCloseTo(0.5 * D * amp * amp, 9);
      // Spann-, Lage- und Bewegungsenergie zusammen sind ebenfalls konstant
      expect(e.spring + e.grav + e.kin).toBeCloseTo(0.5 * D * equilibriumExtension(m, D) ** 2 + m * G * amp + 0.5 * D * amp * amp, 9);
    }
  });

  it('Dämpfung: Amplitude nimmt in einer Periode um e^(−δ·T_d) ab', () => {
    const m = 0.5;
    const D = 20;
    const delta = 0.4;
    const Td = dampedPeriod(m, D, delta);
    expect(Td).toBeCloseTo((2 * Math.PI) / Math.sqrt(40 - 0.16), 12);
    expect(Td).toBeGreaterThan(period(m, D));
    const s0 = initialState(0.05, 0.7, m, D, delta);
    const s1 = run(s0, m, D, delta, Td, Td / 4000);
    expect(phasor(s1, m, D, delta).amp / phasor(s0, m, D, delta).amp).toBeCloseTo(Math.exp(-delta * Td), 8);
  });

  it('Zeiger: Länge = Amplitude, Projektion = Elongation', () => {
    const z = phasor(initialState(0.05, 2.1, 0.5, 20, 0), 0.5, 20, 0);
    expect(z.amp).toBeCloseTo(0.05, 12);
    expect(z.phase).toBeCloseTo(2.1, 12);
    const zd = phasor(initialState(0.03, -1.2, 0.5, 20, 0.5), 0.5, 20, 0.5);
    expect(zd.amp).toBeCloseTo(0.03, 12);
    expect(zd.phase).toBeCloseTo(-1.2, 12);
  });

  it('Beschleunigung a = −ω²·y (ohne Dämpfung) und Grenzfälle', () => {
    expect(acceleration([0.02, 0.3], 0.5, 20, 0)).toBeCloseTo(-0.8, 12);
    expect(acceleration([0, 0.3], 0.5, 20, 0.5)).toBeCloseTo(-0.3, 12);
    expect(dampedOmega(0.5, 20, 7)).toBe(0);
    expect(dampedPeriod(0.5, 20, 7)).toBe(Infinity);
  });

  it('Periodendauer ist unabhängig von der Amplitude (auch numerisch)', () => {
    const m = 0.5;
    const D = 20;
    const T = period(m, D);
    for (const amp of [0.01, 0.05, 0.1]) {
      const s0 = initialState(amp, -Math.PI / 2, m, D, 0);
      const s = run(s0, m, D, 0, T, T / 2000);
      expect(s[0]).toBeCloseTo(-amp, 9);
      expect(s[1]).toBeCloseTo(0, 8);
    }
  });

  it('Reglergrenzen: sehr weiche und sehr harte Feder', () => {
    // m = 1 kg, D = 10 N/m: T = 2π·√0,1 ≈ 1,987 s; s₀ = 0,981 m; ω = √10 ≈ 3,16 1/s
    expect(period(1, 10)).toBeCloseTo(1.9869, 4);
    expect(equilibriumExtension(1, 10)).toBeCloseTo(0.981, 10);
    expect(omega0(1, 10)).toBeCloseTo(3.1623, 4);
    // m = 0,1 kg, D = 60 N/m: T = 2π·√(1/600) ≈ 0,257 s; s₀ ≈ 1,6 cm; f ≈ 3,90 Hz
    expect(period(0.1, 60)).toBeCloseTo(0.25651, 5);
    expect(equilibriumExtension(0.1, 60)).toBeCloseTo(0.01635, 5);
    expect(1 / period(0.1, 60)).toBeCloseTo(3.8985, 3);
    // größte Dämpfung (δ = 2 1/s) bleibt bei allen Reglerwerten schwingend: ω₀ ≥ √10 > 2
    expect(dampedOmega(1, 10, 2)).toBeCloseTo(Math.sqrt(6), 12);
    expect(dampedPeriod(1, 10, 2)).toBeCloseTo(2.5651, 4);
  });

  it('Sonderfall Amplitude 0: Körper bleibt in der Ruhelage', () => {
    const s0 = initialState(0, -Math.PI / 2, 0.5, 20, 0.3);
    expect(s0[0]).toBe(-0);
    expect(s0[1]).toBeCloseTo(0, 15);
    const s = run(s0, 0.5, 20, 0.3, 2);
    expect(Math.abs(s[0])).toBeLessThan(1e-15);
    expect(phasor(s, 0.5, 20, 0.3).amp).toBeLessThan(1e-15);
    const e = energies(s, 0.5, 20, 0);
    expect(e.kin + e.osc).toBeCloseTo(0, 15);
  });

  it('Phasenbeziehung: v eilt y um 90° voraus, a ist gegenphasig zu y', () => {
    const m = 0.5;
    const D = 20;
    const amp = 0.08;
    const w = omega0(m, D);
    const T = period(m, D);
    // aus der Ruhelage angestoßen (φ₀ = 0): bei t = 0 ist v maximal, bei T/4 ist y maximal und a = −â
    const s0 = initialState(amp, 0, m, D, 0);
    expect(s0[1]).toBeCloseTo(amp * w, 12);
    const q = run(s0, m, D, 0, T / 4, T / 4000);
    expect(q[0]).toBeCloseTo(amp, 9);
    expect(q[1]).toBeCloseTo(0, 8);
    expect(acceleration(q, m, D, 0)).toBeCloseTo(-amp * w * w, 8);
  });

  it('Aufgabenwerte aus dem Lernmaterial', () => {
    // A1: T ≈ 0,99 s, f ≈ 1,01 Hz
    expect(period(0.5, 20)).toBeCloseTo(0.9935, 4);
    expect(1 / period(0.5, 20)).toBeCloseTo(1.0066, 4);
    // A2: 10 Schwingungen in 12,6 s, m = 0,4 kg → D = 4π²m/T² ≈ 9,9 N/m
    expect((4 * Math.PI ** 2 * 0.4) / 1.26 ** 2).toBeCloseTo(9.947, 3);
    expect(period(0.4, 10)).toBeCloseTo(1.2566, 4);
    // A4: v̂ = ŷ·ω ≈ 0,51 m/s, â = ŷ·ω² = 3,2 m/s²
    expect(0.08 * omega0(0.5, 20)).toBeCloseTo(0.506, 3);
    expect(Math.abs(acceleration([-0.08, 0], 0.5, 20, 0))).toBeCloseTo(3.2, 12);
    // A5: T = 2π·√(s₀/g) mit s₀ = 24,5 cm; m und D verdoppelt → gleiche Dehnung und Periode
    expect(2 * Math.PI * Math.sqrt(equilibriumExtension(0.5, 20) / G)).toBeCloseTo(period(0.5, 20), 12);
    expect(equilibriumExtension(1, 40)).toBeCloseTo(0.24525, 10);
    // A7: E = ½·D·ŷ² = 0,064 J; bei y = 4 cm: v = √(2·0,048/0,5) ≈ 0,44 m/s
    const e = energies([0.04, Math.sqrt(0.192)], 0.5, 20, -0.08);
    expect(e.osc).toBeCloseTo(0.016, 12);
    expect(e.osc + e.kin).toBeCloseTo(0.064, 12);
    expect(Math.sqrt(0.192)).toBeCloseTo(0.438, 3);
  });

  it('mit Dämpfung startet der Körper (φ₀ = −90°) mit v₀ = δ·ŷ', () => {
    const s0 = initialState(0.08, -Math.PI / 2, 0.5, 20, 0.3);
    expect(s0[0]).toBeCloseTo(-0.08, 12);
    expect(s0[1]).toBeCloseTo(0.3 * 0.08, 12);
  });
});
