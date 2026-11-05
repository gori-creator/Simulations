import { describe, expect, it } from 'vitest';
import { blankSpec, cleanSpec, decodeSpec, encodeSpec, kitUpTo, specToLevel } from '../src/spiele/zahlenfabrik/custom';
import { kitFor } from '../src/spiele/zahlenfabrik/levels';
import { run } from '../src/spiele/zahlenfabrik/model';
import { straight } from './zahlenfabrik-loeser';

describe('Zahlenfabrik: Baukasten (eigene Level)', () => {
  it('Link hin und zurück ergibt dasselbe Level', () => {
    const spec = { ...blankSpec(), t: 'Mein Level äöü', w: [[5, 2], [5, 4]] as [number, number][], m: 2 };
    const text = encodeSpec(spec);
    expect(text).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeSpec(text)).toEqual(spec);
  });
  it('kaputte oder unsinnige Links werden abgelehnt bzw. aufgeräumt', () => {
    expect(decodeSpec('%%%')).toBeNull();
    expect(cleanSpec({ v: 2 })).toBeNull();
    expect(cleanSpec({ ...blankSpec(), a: [] })).toBeNull();
    expect(cleanSpec({ ...blankSpec(), g: [1, 3] })).toBeNull(); // Lager auf der Quelle
    const big = cleanSpec({ ...blankSpec(), c: 99, r: 1, s: [1, 2, 0], g: [3, 2], w: [[1, 2], [50, 50], [2, 2]] })!;
    expect(big.c).toBe(20);
    expect(big.r).toBe(5);
    expect(big.w).toEqual([[2, 2]]);
  });
  it('Werkzeugkasten nach Kapitel; das Level ist spielbar', () => {
    expect(kitUpTo(0)).toEqual([]);
    expect(kitUpTo(1)).toEqual(['plus']);
    const l = specToLevel(blankSpec());
    expect(kitFor(l).map((k) => k.id)).toEqual(['plus']);
    expect(run(l, straight(l, [{ sym: '+', n: 2 }])).won).toBe(true);
    // Folge: 1, 2, 3 → 2, 4, 6
    const seqLevel = specToLevel({ ...blankSpec(), a: [1, 2, 3], b: [2, 4, 6], k: 3 });
    expect(run(seqLevel, straight(seqLevel, [{ sym: '×', n: 2 }])).won).toBe(true);
  });
});
