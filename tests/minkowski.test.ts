import { describe, expect, it } from 'vitest';
import { addVelocities, gamma, interval, lorentz } from '../src/simulations/physik/minkowski/model';

describe('Lorentz-Transformation', () => {
  it('γ bei 0,6c ist 1,25', () => {
    expect(gamma(0.6)).toBeCloseTo(1.25, 12);
  });

  it('Intervall bleibt erhalten', () => {
    const e = lorentz(2, 3, 0.5);
    expect(interval(e.x, e.ct)).toBeCloseTo(interval(2, 3), 10);
  });

  it('Rücktransformation mit −β', () => {
    const e = lorentz(1.3, -0.7, 0.8);
    const b = lorentz(e.x, e.ct, -0.8);
    expect(b.x).toBeCloseTo(1.3, 10);
    expect(b.ct).toBeCloseTo(-0.7, 10);
  });

  it('Licht bleibt Licht: x = ct wird zu x′ = ct′', () => {
    const e = lorentz(2, 2, 0.7);
    expect(e.x).toBeCloseTo(e.ct, 10);
  });
});

describe('Addition von Geschwindigkeiten', () => {
  it('0,6c + 0,6c ≈ 0,88c, nie über c', () => {
    expect(addVelocities(0.6, 0.6)).toBeCloseTo(0.882, 3);
    expect(addVelocities(0.99, 0.99)).toBeLessThan(1);
    expect(addVelocities(1, 0.5)).toBeCloseTo(1, 12);
  });

  it('kleine Geschwindigkeiten addieren sich fast klassisch', () => {
    expect(addVelocities(0.001, 0.002)).toBeCloseTo(0.003, 6);
  });
});
