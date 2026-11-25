import { describe, expect, it } from 'vitest';
import { bindingPerNucleon, chain, curve, fissionEnergy, fusionEnergy, multiplication, stableZ } from '../src/simulations/physik/kernspaltung/model';

describe('Kernspaltung', () => {
  it('Bindungsenergie pro Nukleon: Maximum bei Eisen (≈ 8,8 MeV)', () => {
    let best = 20;
    for (let A = 20; A <= 240; A++) if (bindingPerNucleon(A) > bindingPerNucleon(best)) best = A;
    expect(best).toBeGreaterThan(50);
    expect(best).toBeLessThan(70);
    expect(bindingPerNucleon(56)).toBeCloseTo(8.8, 0);
    expect(bindingPerNucleon(235)).toBeCloseTo(7.6, 0);
  });

  it('stabile Kerne: mehr Neutronen bei großen Kernen', () => {
    expect(Math.abs(stableZ(56) - 26)).toBeLessThanOrEqual(1);
    expect(stableZ(238)).toBeLessThan(238 / 2);
  });

  it('Spaltung liefert etwa 170–200 MeV, Fusion D+T etwa 17,6 MeV', () => {
    expect(fissionEnergy()).toBeGreaterThan(150);
    expect(fissionEnergy()).toBeLessThan(210);
    expect(fusionEnergy()).toBeCloseTo(17.6, 0);
    expect(curve(4)).toBeCloseTo(7.07, 2);
  });

  it('Kettenreaktion: k = 1 bleibt konstant, k > 1 wächst exponentiell', () => {
    expect(chain(100, 1, 10)).toBe(100);
    expect(chain(1, 2, 10)).toBe(1024);
    expect(multiplication(2.5, 0.4)).toBeCloseTo(1, 12);
  });
});
