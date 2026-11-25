import { describe, expect, it } from 'vitest';
import { criticalKind, FUNCTIONS, numericPartial, section, surfaceMesh, type FnId } from '../src/simulations/mathematik/funktionen-zwei-variablen/model';

describe('Funktionen mit zwei Veränderlichen', () => {
  it('hat korrekte partielle Ableitungen', () => {
    for (const id of Object.keys(FUNCTIONS) as FnId[])
      for (const [x, y] of [
        [0.3, -0.7],
        [1.2, 0.4],
        [-1, 1.5],
      ] as const) {
        expect(FUNCTIONS[id].fx(x, y), id).toBeCloseTo(numericPartial(id, 'x', x, y), 6);
        expect(FUNCTIONS[id].fy(x, y), id).toBeCloseTo(numericPartial(id, 'y', x, y), 6);
      }
  });

  it('erkennt Hoch-, Tief- und Sattelpunkt', () => {
    expect(criticalKind('paraboloid', 0, 0)).toBe('min');
    expect(criticalKind('glocke', 0, 0)).toBe('max');
    expect(criticalKind('sattel', 0, 0)).toBe('sattel');
    expect(criticalKind('paraboloid', 1, 0)).toBeNull();
  });

  it('baut Gitter und Schnittkurven', () => {
    const m = surfaceMesh('sattel', 2, 10);
    expect(m.vertices).toHaveLength(121);
    expect(m.faces).toHaveLength(100);
    const s = section('paraboloid', 'x', 1, 2, 40);
    expect(s[0]).toEqual([-2, 1, 2.5]);
    expect(s.every((p) => p[1] === 1)).toBe(true);
  });
});
