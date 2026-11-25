import { describe, expect, it } from 'vitest';
import { fallAccel, fallExact, integrate, springAccel, springExact, terminalVelocity } from '../src/simulations/physik/kleine-schritte/model';

describe('Methode der kleinen Schritte', () => {
  it('Fallschirmspringer: Endgeschwindigkeit', () => {
    // 80 kg, k = 0,25 kg/m: v_E = √(80 · 9,81 / 0,25) ≈ 56 m/s
    expect(terminalVelocity(80, 0.25)).toBeCloseTo(56.03, 2);
    const steps = integrate(fallAccel(80, 0.25), 0, 0, 0.01, 30, 'euler');
    const last = steps[steps.length - 1]!;
    expect(last.v).toBeCloseTo(fallExact(80, 0.25, 30).v, 1);
  });

  it('kleinere Schritte, kleinerer Fehler', () => {
    const err = (dt: number) => {
      const st = integrate(fallAccel(80, 0.25), 0, 0, dt, 6, 'euler');
      return Math.abs(st[st.length - 1]!.s - fallExact(80, 0.25, 6).s);
    };
    expect(err(0.1)).toBeLessThan(err(1));
    expect(err(0.01)).toBeLessThan(err(0.1));
  });

  it('Euler schaukelt die Federschwingung auf, Cromer bleibt stabil', () => {
    const e = integrate(springAccel(1, 4), 1, 0, 0.1, 20, 'euler');
    const c = integrate(springAccel(1, 4), 1, 0, 0.1, 20, 'cromer');
    const maxAbs = (a: { s: number }[]) => Math.max(...a.slice(-40).map((x) => Math.abs(x.s)));
    expect(maxAbs(e)).toBeGreaterThan(2);
    expect(maxAbs(c)).toBeLessThan(1.15);
    expect(springExact(1, 4, 1, Math.PI).s).toBeCloseTo(1, 10);
  });

  it('erster Schritt wie in der Tabelle', () => {
    const st = integrate(fallAccel(80, 0.25), 0, 0, 1, 2, 'euler');
    expect(st[0]).toEqual({ t: 0, s: 0, v: 0, a: 9.81 });
    expect(st[1]!.v).toBeCloseTo(9.81, 10);
    expect(st[1]!.s).toBe(0);
  });
});
