import { describe, expect, it } from 'vitest';
import { apply, classify, equivalent, OPS, PAIRS, rows } from '../src/simulations/mathematik/aussagenlogik/model';

describe('Aussagenlogik', () => {
  it('kennt die Wahrheitstafeln der Verknüpfungen', () => {
    const table = (op: (typeof OPS)[number]) => rows(2).map((r) => apply(op, r.A, r.B));
    expect(table('and')).toEqual([true, false, false, false]);
    expect(table('or')).toEqual([true, true, true, false]);
    expect(table('impl')).toEqual([true, false, true, true]);
    expect(table('equiv')).toEqual([true, false, false, true]);
    expect(table('xor')).toEqual([false, true, true, false]);
    expect(table('nand')).toEqual([false, true, true, true]);
    expect(table('nor')).toEqual([false, false, false, true]);
    expect(table('not')).toEqual([false, false, true, true]);
  });

  it('erkennt Äquivalenzen', () => {
    const eq = Object.fromEntries(PAIRS.map((p) => [p.id, equivalent(p)]));
    expect(eq).toMatchObject({ demorgan1: true, demorgan2: true, impl: true, kontra: true, umkehr: false, distr: true, nand: true, taut: false });
    expect(rows(3)).toHaveLength(8);
  });

  it('unterscheidet Tautologie und Kontradiktion', () => {
    const t = PAIRS.find((p) => p.id === 'taut')!;
    expect(classify(t.f, 2)).toBe('tautologie');
    expect(classify(t.g, 2)).toBe('kontradiktion');
    expect(classify(PAIRS[0]!.f, 2)).toBe('erfuellbar');
  });
});
