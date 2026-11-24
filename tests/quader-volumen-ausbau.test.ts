import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { checkCuboid, cuboidTask, parseAmount, surfaceArea, volume } from '../src/simulations/mathematik/quader-volumen/model';

describe('Quader: Oberfläche und Üben', () => {
  it('Oberfläche', () => {
    expect(surfaceArea(5, 3, 4)).toBe(94);
    expect(surfaceArea(1, 1, 1)).toBe(6);
  });
  it('Aufgaben wechseln reihum und bleiben im Regelbereich', () => {
    for (let q = 1; q <= 200; q++) {
      const t = cuboidTask(q, seededRandom(q));
      expect(t.kind).toBe(['V', 'O', 'edge', 'litre'][(q - 1) % 4]);
      for (const d of [t.a, t.b, t.c]) {
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(10);
      }
      if (t.kind === 'V') expect(t.answer).toBe(volume(t.a, t.b, t.c));
      if (t.kind === 'edge') expect(t.answer).toBe(t.c);
      if (t.kind === 'litre') expect(t.answer).toBe(volume(t.a, t.b, t.c) * (t.unit === 'm' ? 1000 : 1));
    }
  });
  it('Eingaben mit Tausenderpunkt', () => {
    expect(parseAmount('12.000 l')).toBe(12000);
    expect(parseAmount('2,5')).toBe(2.5);
    const t = { kind: 'litre' as const, a: 2, b: 3, c: 2, unit: 'm' as const, answer: 12000 };
    expect(checkCuboid(t, '12 000').ok).toBe(true);
    expect(checkCuboid(t, '12').ok).toBe(false);
  });
});
