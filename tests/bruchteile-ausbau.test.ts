import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { checkRead, commonDenominator, compareFractions, fractionTask, lcm, parseFraction, selectedCount } from '../src/simulations/mathematik/bruchteile/model';

describe('Bruchteile: vergleichen', () => {
  it('Hauptnenner und Vergleich', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(commonDenominator(3, 4, 2, 3)).toEqual({ n: 12, z1: 9, z2: 8 });
    expect(compareFractions(3, 4, 2, 3)).toBe(1);
    expect(compareFractions(1, 2, 3, 6)).toBe(0);
    expect(compareFractions(2, 5, 1, 2)).toBe(-1);
  });
});

describe('Bruchteile: üben', () => {
  it('Aufgaben sind gültig', () => {
    for (let q = 1; q <= 300; q++) {
      const t = fractionTask(q, seededRandom(q));
      expect(t.kind).toBe(q % 2 === 1 ? 'read' : 'color');
      expect(t.pieces).toBeGreaterThanOrEqual(2);
      expect(t.pieces).toBeLessThanOrEqual(12);
      expect(t.count).toBeGreaterThan(0);
      expect(t.count).toBeLessThan(t.pieces);
      expect(t.count * t.target.n).toBe(t.target.z * t.pieces);
    }
  });
  it('gleichwertige Brüche zählen beim Ablesen', () => {
    const t = { kind: 'read' as const, pieces: 8, count: 6, target: { z: 3, n: 4 }, shape: 'strip' as const };
    expect(checkRead(t, '6/8').ok).toBe(true);
    expect(checkRead(t, '3 / 4').ok).toBe(true);
    expect(checkRead(t, '2/8').ok).toBe(false);
    expect(checkRead(t, '0,75').got).toBeNull();
    expect(parseFraction('5/0')).toBeNull();
  });
  it('Auswahl zählen', () => {
    expect(selectedCount(0b1011, 4)).toBe(3);
    expect(selectedCount(0b1011, 2)).toBe(2);
  });
});
