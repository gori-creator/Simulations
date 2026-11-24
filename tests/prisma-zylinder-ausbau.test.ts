import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { checkSolid, circleBase, solid, solidTask, triangleBase } from '../src/simulations/mathematik/prisma-zylinder/model';

describe('Prisma/Zylinder: Üben', () => {
  it('Lösungen passen zu den Körpern', () => {
    for (let q = 1; q <= 120; q++) {
      const t = solidTask(q, seededRandom(q));
      expect(t.kind).toBe(['prismV', 'cylV', 'cylO', 'can'][(q - 1) % 4]);
      if (t.kind === 'prismV') expect(t.answer).toBeCloseTo(solid(triangleBase(t.g, t.hg), t.h).volume, 9);
      if (t.kind === 'cylV') expect(t.answer).toBeCloseTo(Math.PI * t.r ** 2 * t.h, 9);
      if (t.kind === 'cylO') expect(t.answer).toBeCloseTo(2 * Math.PI * t.r ** 2 + 2 * Math.PI * t.r * t.h, 9);
      if (t.kind === 'can') {
        expect(Math.PI * t.r ** 2 * t.answer).toBeCloseTo(t.volume, 9);
        expect(t.answer).toBeGreaterThan(5);
        expect(t.answer).toBeLessThan(30);
      }
    }
    // Kreisbasis des Modells stimmt mit πr² überein
    expect(circleBase(2).area).toBeCloseTo(4 * Math.PI, 9);
  });
  it('π ≈ 3,14 und Runden sind erlaubt', () => {
    const t = { kind: 'cylV' as const, base: 'kreis' as const, g: 4, hg: 3, r: 2, h: 5, volume: 0, answer: 20 * Math.PI };
    expect(checkSolid(t, '62,8').ok).toBe(true);
    expect(checkSolid(t, '62,83 cm³').ok).toBe(true);
    expect(checkSolid(t, '60').ok).toBe(false);
  });
});
