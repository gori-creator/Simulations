import { describe, expect, it } from 'vitest';
import { energy, step, type State } from '../src/simulations/physik/doppelpendel/model';

const P = { m1: 1, m2: 1, l1: 1, l2: 1 };

describe('Doppelpendel', () => {
  it('Energie bleibt bei RK4 fast erhalten', () => {
    let s: State = [2, 2.5, 0, 0];
    const E0 = energy(s, P);
    for (let i = 0; i < 20000; i++) s = step(s, P, 0.001);
    expect(Math.abs(energy(s, P) - E0)).toBeLessThan(1e-4 * Math.abs(E0) + 1e-6);
  });

  it('kleine Auslenkung: verhält sich regelmäßig (keine Divergenz)', () => {
    let a: State = [0.05, 0.05, 0, 0];
    let b: State = [0.0501, 0.05, 0, 0];
    for (let i = 0; i < 10000; i++) {
      a = step(a, P, 0.001);
      b = step(b, P, 0.001);
    }
    expect(Math.abs(a[1] - b[1])).toBeLessThan(0.01);
  });

  it('große Auslenkung: winzige Unterschiede wachsen stark (Chaos)', () => {
    let a: State = [2.5, 2.5, 0, 0];
    let b: State = [2.5 + 1e-6, 2.5, 0, 0];
    for (let i = 0; i < 20000; i++) {
      a = step(a, P, 0.001);
      b = step(b, P, 0.001);
    }
    expect(Math.abs(a[1] - b[1])).toBeGreaterThan(0.01);
  });
});
