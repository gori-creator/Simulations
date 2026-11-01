import { describe, expect, it } from 'vitest';
import { accuracy } from '../src/kurse/ki-abenteuer/models/knn';
import { featureScore } from '../src/kurse/ki-abenteuer/models/merkmale';
import { bestSplit, side } from '../src/kurse/ki-abenteuer/models/linie';
import { CITRUS, CITRUS_TEST, MISLABELED, withMistakes } from '../src/kurse/ki-abenteuer/models/zitrus';

describe('Bereich 2: Daten', () => {
  it('24 Früchte, je 12, im Bereich 0…10', () => {
    expect(CITRUS).toHaveLength(24);
    expect(CITRUS.filter((c) => c.label === 'lemon')).toHaveLength(12);
    for (const c of [...CITRUS, ...CITRUS_TEST]) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThanOrEqual(10);
    }
  });

  it('Seite einer Geraden', () => {
    expect(side({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBeGreaterThan(0);
    expect(side({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 })).toBeLessThan(0);
  });

  it('die Gerade x + y = 10 trennt alle', () => {
    const r = bestSplit({ x: 0, y: 10 }, { x: 10, y: 0 }, CITRUS, 'lemon', 'orange');
    expect(r.correct).toBe(24);
    // Richtung umgedreht: Seiten tauschen, Ergebnis gleich
    const back = bestSplit({ x: 10, y: 0 }, { x: 0, y: 10 }, CITRUS, 'lemon', 'orange');
    expect(back.correct).toBe(24);
    expect(back.left).toBe(r.right);
  });

  it('die Startlinie des Spiels trennt noch nicht alle', () => {
    expect(bestSplit({ x: 1.5, y: 8 }, { x: 8.5, y: 8.6 }, CITRUS, 'lemon', 'orange').correct).toBeLessThan(20);
  });

  it('falsche Beschriftungen verschlechtern Bits Probe, aufgeräumt ist sie fehlerfrei', () => {
    expect(MISLABELED).toHaveLength(3);
    expect(accuracy(CITRUS_TEST, CITRUS, 1)).toBe(1);
    expect(accuracy(CITRUS_TEST, withMistakes(), 1)).toBeLessThanOrEqual(0.8);
  });
});

describe('Gute Merkmale', () => {
  it('Federn trennen perfekt, zwei Beine fast, Fotos gar nicht', () => {
    expect(featureScore('feathers')).toEqual({ yes: 'bird', correct: 10, total: 10 });
    expect(featureScore('twoLegs').correct).toBe(9);
    expect(featureScore('flies').correct).toBe(7);
    expect(featureScore('brightPhoto').correct).toBe(6);
    expect(featureScore('weekend').correct).toBe(6);
  });
});
