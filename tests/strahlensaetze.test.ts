import { describe, expect, it } from 'vitest';
import { angleBetween, dist, figure, parallel, pondWidth, ratios, shadowLengths, treeHeight } from '../src/simulations/mathematik/strahlensaetze/model';

describe('Modell: Strahlensätze', () => {
  it('V-Figur: alle drei Verhältnisse sind gleich k', () => {
    const f = figure(3, 4, 40, 2.5, 2.5);
    const r = ratios(f);
    expect(r.r1).toBeCloseTo(2.5, 12);
    expect(r.r2).toBeCloseTo(2.5, 12);
    expect(r.r3).toBeCloseTo(2.5, 12);
    expect(parallel(f)).toBe(true);
    // Abschnitte: |ZA| : |AA′| = |ZB| : |BB′|
    expect(dist(f.z, f.a) / dist(f.a, f.a2)).toBeCloseTo(dist(f.z, f.b) / dist(f.b, f.b2), 12);
    expect(dist(f.z, f.b2)).toBeCloseTo(10, 12);
  });
  it('X-Figur: Verhältnisse gleich |k|, Punkte auf der anderen Seite', () => {
    const f = figure(4, 5, 40, -0.75, -0.75);
    const r = ratios(f);
    expect(r.r1).toBeCloseTo(0.75, 12);
    expect(r.r3).toBeCloseTo(0.75, 12);
    expect(f.b2[0]).toBeLessThan(0);
    expect(parallel(f)).toBe(true);
  });
  it('nicht parallel: Verhältnisse verschieden', () => {
    const f = figure(3, 4, 40, 2, 1.4);
    expect(parallel(f, 1e-6)).toBe(false);
    const r = ratios(f);
    expect(Math.abs(r.r1 - r.r2)).toBeGreaterThan(0.5);
    expect(angleBetween(f)).toBeGreaterThan(1);
    expect(angleBetween(figure(3, 4, 40, 2, 2))).toBeCloseTo(0, 9);
  });
  it('Baumhöhe über den Schatten: h = s · |ZB′| : |ZB|', () => {
    expect(treeHeight(1.5, 2, 16)).toBeCloseTo(12, 12);
    const { dStick, dTree } = shadowLengths(12, 1.5, 35);
    expect(dTree / dStick).toBeCloseTo(8, 12);
    expect(treeHeight(1.5, dStick, dTree)).toBeCloseTo(12, 10);
    // bei 45° Sonnenhöhe ist der Schatten so lang wie der Gegenstand hoch
    expect(shadowLengths(10, 2, 45).dTree).toBeCloseTo(10, 10);
  });
  it('Teichbreite: |AB| = k · |A′B′|', () => {
    expect(pondWidth(4, 6)).toBe(24);
  });
});
