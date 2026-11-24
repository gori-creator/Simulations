import { describe, expect, it } from 'vitest';
import { capacitiveReactance, inductiveReactance, instant, resonanceFrequency, seriesAc } from '../src/simulations/physik/wechselstrom/model';

describe('Wechselstrom', () => {
  it('Blindwiderstände', () => {
    expect(inductiveReactance(1, 50)).toBeCloseTo(314.16, 2);
    expect(capacitiveReactance(10e-6, 50)).toBeCloseTo(318.31, 2);
  });

  it('Ohmscher Widerstand: keine Phasenverschiebung, P = U·I', () => {
    const r = seriesAc('R', 230, 50, 100, 1, 1e-5);
    expect(r.phi).toBe(0);
    expect(r.Ieff).toBeCloseTo(2.3, 10);
    expect(r.P).toBeCloseTo(529, 6);
    expect(r.Q).toBeCloseTo(0, 10);
  });

  it('Spule: +90°, Kondensator: −90°, keine Wirkleistung', () => {
    const l = seriesAc('L', 10, 50, 100, 1, 1e-5);
    expect(l.phi).toBeCloseTo(Math.PI / 2, 10);
    expect(l.P).toBeCloseTo(0, 10);
    const c = seriesAc('C', 10, 50, 100, 1, 1e-5);
    expect(c.phi).toBeCloseTo(-Math.PI / 2, 10);
  });

  it('RLC: Z² = R² + (X_L − X_C)², Spannungen als Zeiger addiert', () => {
    const r = seriesAc('RLC', 10, 100, 100, 0.5, 10e-6);
    expect(r.Z ** 2).toBeCloseTo(100 ** 2 + (r.XL - r.XC) ** 2, 6);
    expect(Math.hypot(r.UR, r.UL - r.UC)).toBeCloseTo(10, 10);
    expect(r.S ** 2).toBeCloseTo(r.P ** 2 + r.Q ** 2, 8);
  });

  it('Resonanz: Z = R, φ = 0', () => {
    const f0 = resonanceFrequency(0.5, 10e-6);
    expect(f0).toBeCloseTo(71.18, 2);
    const r = seriesAc('RLC', 10, f0, 100, 0.5, 10e-6);
    expect(r.Z).toBeCloseTo(100, 6);
    expect(r.phi).toBeCloseTo(0, 6);
  });

  it('Mittlere Leistung über eine Periode = P', () => {
    const r = seriesAc('RL', 10, 50, 100, 0.5, 1e-5);
    let sum = 0;
    const n = 10000;
    for (let k = 0; k < n; k++) sum += instant(10, r, (2 * Math.PI * k) / n).p;
    expect(sum / n).toBeCloseTo(r.P, 6);
  });
});
