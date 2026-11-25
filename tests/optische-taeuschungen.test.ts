import { describe, expect, it } from 'vitest';
import { angleDeg, arrowHeads, deviation, hatches, ring } from '../src/simulations/mathematik/optische-taeuschungen/model';

describe('Optische Täuschungen', () => {
  it('zeichnet Pfeilspitzen nach innen und außen', () => {
    const inw = arrowHeads(0, 10, 0, 2, false);
    const out = arrowHeads(0, 10, 0, 2, true);
    expect(inw[0]![1][0]).toBeGreaterThan(0); // Spitze zeigt nach außen, Schenkel nach innen
    expect(out[0]![1][0]).toBeLessThan(0);
    expect(deviation(112)).toBe(12);
  });

  it('legt Kreise gleichmäßig auf einen Ring', () => {
    const r = ring(0, 0, 5, 6);
    expect(r).toHaveLength(6);
    for (const p of r) expect(Math.hypot(p[0], p[1])).toBeCloseTo(5);
  });

  it('lässt die Hauptlinien bei Zöllner parallel', () => {
    const l1: [[number, number], [number, number]] = [
      [0, 0],
      [10, 10],
    ];
    const l2: [[number, number], [number, number]] = [
      [3, 0],
      [13, 10],
    ];
    expect(angleDeg(...l1)).toBeCloseTo(angleDeg(...l2));
    expect(hatches(l1[0], l1[1], 6, 2, 45, false)).toHaveLength(5);
  });
});
