import { describe, expect, it } from 'vitest';
import { distanceFactor, halfValueThickness, transmission, weighting } from '../src/simulations/physik/strahlenschutz/model';

describe('Strahlenschutz', () => {
  it('Alpha wird von einem Blatt Papier gestoppt', () => {
    expect(transmission('alpha', 'paper', 0.1)).toBe(0);
    expect(transmission('alpha', 'none', 0)).toBe(1);
  });

  it('Beta: wenige Millimeter Aluminium reichen', () => {
    expect(transmission('beta', 'aluminium', 5)).toBeLessThan(0.01);
    expect(transmission('beta', 'paper', 0.1)).toBeGreaterThan(0.8);
  });

  it('Gamma: Halbwertsdicke Blei etwa 6,5 mm', () => {
    expect(transmission('gamma', 'lead', 6.5)).toBeCloseTo(0.5, 10);
    expect(transmission('gamma', 'lead', 13)).toBeCloseTo(0.25, 10);
    expect(halfValueThickness(13, 1000, 250)).toBeCloseTo(6.5, 10);
  });

  it('Abstandsgesetz: doppelter Abstand, ein Viertel', () => {
    expect(distanceFactor(0.2)).toBeCloseTo(0.25, 12);
    expect(weighting('alpha')).toBe(20);
  });
});
