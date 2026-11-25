import { describe, expect, it } from 'vitest';
import { carnot, carnotEfficiency, entropyDirect, GAMMA, heatPumpCop, stateAt } from '../src/simulations/physik/waermekraftmaschine/model';

describe('Wärmekraftmaschine', () => {
  it('Carnot: W = Q_h − Q_c und η = 1 − T_c/T_h', () => {
    const c = carnot(0.1, 600, 300, 1, 2);
    expect(c.eta).toBeCloseTo(0.5, 12);
    expect(c.W / c.Qh).toBeCloseTo(0.5, 10);
    // reversibel: Entropie Q_h/T_h = Q_c/T_c
    expect(c.Qh / 600).toBeCloseTo(c.Qc / 300, 10);
  });

  it('Adiabaten verbinden die Isothermen', () => {
    const c = carnot(0.1, 600, 300, 1, 2);
    const [, V2, V3] = c.V;
    expect(600 * V2 ** (GAMMA - 1)).toBeCloseTo(300 * V3 ** (GAMMA - 1), 8);
    const end = stateAt(c, 0.1, 600, 300, 1.999999);
    expect(end.T).toBeCloseTo(300, 3);
  });

  it('Zustände: Druck aus pV = nRT', () => {
    const c = carnot(0.1, 600, 300, 1, 2);
    const s = stateAt(c, 0.1, 600, 300, 0);
    expect(s.p).toBeCloseTo(0.1 * 8.314 * 600, 8); // kPa bei 1 L
    expect(stateAt(c, 0.1, 600, 300, 2.5).T).toBe(300);
  });

  it('Wärmepumpe und Entropie', () => {
    expect(heatPumpCop(308, 278)).toBeCloseTo(10.27, 2);
    expect(carnotEfficiency(800, 300)).toBeCloseTo(0.625, 12);
    const e = entropyDirect(1000, 500, 250);
    expect(e.total).toBeCloseTo(2, 12);
    expect(e.hot + e.cold).toBeGreaterThan(0);
  });
});
