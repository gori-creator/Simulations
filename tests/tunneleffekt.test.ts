import { describe, expect, it } from 'vitest';
import { kappa, solveBarrier, stmCurrent, surfaceAtoms, surfaceHeight, transmission } from '../src/simulations/physik/tunneleffekt/model';

describe('Tunneleffekt an der Rechteckbarriere', () => {
  it('Lösung der Schrödinger-Gleichung stimmt mit der Lehrbuchformel überein', () => {
    for (const [E, V, d] of [
      [3, 5, 0.5],
      [1, 8, 0.3],
      [7, 5, 0.6],
      [4.5, 5, 1.2],
    ] as const) {
      const T = solveBarrier(E, V, d).T;
      expect(T / transmission(E, V, d)).toBeCloseTo(1, 6);
    }
  });

  it('breitere Barriere: Durchlass nimmt etwa exponentiell ab', () => {
    const k = kappa(3, 5);
    const r = transmission(3, 5, 1.2) / transmission(3, 5, 1);
    expect(r).toBeCloseTo(Math.exp(-2 * k * 0.2), 1);
  });

  it('Wellenfunktion stetig an den Rändern, rechts Amplitude √T', () => {
    const s = solveBarrier(3, 5, 0.5);
    const a = s.psi(-1e-9);
    const b = s.psi(1e-9);
    expect(a[0]).toBeCloseTo(b[0], 6);
    expect(a[1]).toBeCloseTo(b[1], 6);
    const r = s.psi(2);
    expect(Math.hypot(r[0], r[1]) ** 2).toBeCloseTo(s.T, 9);
  });

  it('über der Barriere: Resonanz mit vollem Durchlass', () => {
    // sin(k'd) = 0 → T = 1; k' = π/d
    const d = 0.5;
    const E = 5 + 0.0381 * (Math.PI / d) ** 2;
    expect(transmission(E, 5, d)).toBeCloseTo(1, 9);
  });
});

describe('Rastertunnelmikroskop', () => {
  it('0,1 nm näher: Strom etwa neunmal so groß', () => {
    const f = stmCurrent(0.4) / stmCurrent(0.5);
    expect(f).toBeGreaterThan(7);
    expect(f).toBeLessThan(11);
  });

  it('Oberfläche: über einem Atom höher als in der Lücke', () => {
    const atoms = surfaceAtoms();
    expect(surfaceHeight(0.3, atoms)).toBeGreaterThan(surfaceHeight(0.9, atoms));
    expect(surfaceHeight(2.25, atoms)).toBeGreaterThan(surfaceHeight(0.3, atoms));
  });
});
