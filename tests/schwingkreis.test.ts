import { describe, expect, it } from 'vitest';
import { dampedPeriod, dampingCase, energies, lcState, springForSamePeriod, switchOff, switchOn, thomsonPeriod, timeConstant } from '../src/simulations/physik/schwingkreis/model';

describe('Schwingkreis', () => {
  it('Thomson-Gleichung mit Lehrbuchwerten', () => {
    // L = 500 H, C = 40 µF: T = 2π·√(0,02) ≈ 0,889 s
    expect(thomsonPeriod(500, 40e-6)).toBeCloseTo(0.8886, 3);
    // Vierfache Kapazität → doppelte Periode
    expect(thomsonPeriod(500, 160e-6) / thomsonPeriod(500, 40e-6)).toBeCloseTo(2, 9);
  });

  it('ungedämpft: Energie bleibt erhalten und wechselt die Form', () => {
    const L = 500;
    const C = 40e-6;
    const q0 = C * 10;
    const E0 = energies(L, C, q0, 0).el;
    const T = thomsonPeriod(L, C);
    for (const f of [0, 0.1, 0.25, 0.4, 0.5, 0.9]) {
      const s = lcState(L, C, 0, q0, f * T);
      const e = energies(L, C, s.q, s.i);
      expect(e.el + e.mag).toBeCloseTo(E0, 9);
    }
    const quarter = lcState(L, C, 0, q0, T / 4);
    expect(quarter.q).toBeCloseTo(0, 9);
    expect(energies(L, C, quarter.q, quarter.i).mag).toBeCloseTo(E0, 9);
    expect(lcState(L, C, 0, q0, T / 2).q).toBeCloseTo(-q0, 9);
  });

  it('Lösung erfüllt die Schwingungsgleichung (auch Grenz- und Kriechfall)', () => {
    const L = 500;
    const C = 40e-6;
    const q0 = 4e-4;
    const Rc = 2 * Math.sqrt(L / C);
    for (const R of [0, 300, Rc, 3 * Rc]) {
      expect(lcState(L, C, R, q0, 0).q).toBeCloseTo(q0, 12);
      expect(lcState(L, C, R, q0, 0).i).toBeCloseTo(0, 12);
      for (const t of [0.05, 0.3, 0.7]) {
        const h = 1e-5;
        const a = lcState(L, C, R, q0, t - h);
        const b = lcState(L, C, R, q0, t);
        const c = lcState(L, C, R, q0, t + h);
        expect((c.q - a.q) / (2 * h)).toBeCloseTo(b.i, 6);
        const qpp = (c.q - 2 * b.q + a.q) / (h * h);
        expect(L * qpp + R * b.i + b.q / C).toBeCloseTo(0, 3);
      }
    }
    expect(dampingCase(L, C, 0)).toBe('none');
    expect(dampingCase(L, C, 300)).toBe('weak');
    expect(dampingCase(L, C, Rc)).toBe('critical');
    expect(dampingCase(L, C, 3 * Rc)).toBe('strong');
    expect(dampedPeriod(L, C, 300)).toBeGreaterThan(thomsonPeriod(L, C));
    expect(dampedPeriod(L, C, 3 * Rc)).toBe(Infinity);
  });

  it('Federpendel mit gleicher Periode', () => {
    const D = springForSamePeriod(500, 40e-6, 0.5);
    expect(2 * Math.PI * Math.sqrt(0.5 / D)).toBeCloseTo(thomsonPeriod(500, 40e-6), 9);
  });
});

describe('Selbstinduktion', () => {
  it('Einschalten: nach τ etwa 63 %, Spulenspannung anfangs U₀', () => {
    const s = switchOn(10, 100, 500, timeConstant(500, 100));
    expect(s.iCoil / 0.1).toBeCloseTo(1 - Math.exp(-1), 9);
    expect(switchOn(10, 100, 500, 0).uL).toBeCloseTo(10, 9);
    expect(switchOn(10, 100, 500, 0).iRes).toBeCloseTo(0.1, 9);
  });
  it('Ausschalten: Strom läuft weiter, Spannungsstoß 2·R·I₀', () => {
    const s = switchOff(10, 100, 500, 0);
    expect(s.iCoil).toBeCloseTo(0.1, 9);
    expect(s.iRes).toBeCloseTo(-0.1, 9);
    expect(Math.abs(s.uL)).toBeCloseTo(20, 9);
    expect(switchOff(10, 100, 500, 2.5).iCoil).toBeCloseTo(0.1 * Math.exp(-1), 9);
  });
});
