import { describe, expect, it } from 'vitest';
import { flip, holds, inSolution, solve, steps, type Rel } from '../src/simulations/mathematik/ungleichungen/model';

describe('Ungleichungen', () => {
  it('kehrt das Zeichen um', () => {
    expect(flip('lt')).toBe('gt');
    expect(flip('ge')).toBe('le');
    expect(flip(flip('le'))).toBe('le');
  });

  it('löst einfache Ungleichungen', () => {
    expect(solve(2, 1, 0, 7, 'lt')).toEqual({ kind: 'bound', rel: 'lt', x: 3 });
    // −2x + 4 ≥ 0 → x ≤ 2 (Zeichen dreht sich)
    expect(solve(-2, 4, 0, 0, 'ge')).toEqual({ kind: 'bound', rel: 'le', x: 2 });
    expect(steps(-2, 4, 0, 0, 'ge').flipped).toBe(true);
    // 3x − 2 > x + 4 → x > 3
    expect(solve(3, -2, 1, 4, 'gt')).toEqual({ kind: 'bound', rel: 'gt', x: 3 });
  });

  it('erkennt immer und nie erfüllte Ungleichungen', () => {
    expect(solve(1, 1, 1, 0, 'gt')).toEqual({ kind: 'all' });
    expect(solve(1, 0, 1, 1, 'gt')).toEqual({ kind: 'none' });
    expect(solve(1, 0, 1, 0, 'le')).toEqual({ kind: 'all' });
    expect(solve(1, 0, 1, 0, 'lt')).toEqual({ kind: 'none' });
  });

  it('stimmt mit dem Einsetzen überein', () => {
    const rels: Rel[] = ['lt', 'le', 'gt', 'ge'];
    for (const rel of rels)
      for (let a = -3; a <= 3; a++)
        for (let c = -2; c <= 2; c++)
          for (const b of [-2, 0, 3])
            for (const d of [-1, 2]) {
              const sol = solve(a, b, c, d, rel);
              for (let x = -6; x <= 6; x += 0.5) expect(inSolution(sol, x)).toBe(holds(a * x + b, c * x + d, rel));
            }
  });
});
