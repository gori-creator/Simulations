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
});
