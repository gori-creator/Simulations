import { describe, expect, it } from 'vitest';
import { bestMove, isLosing, losingPositions, nimMove, nimSum } from '../src/simulations/mathematik/strategiespiele/model';

describe('Strategiespiele', () => {
  it('findet Verlustpositionen und Gewinnzüge', () => {
    expect(losingPositions(12, 3)).toEqual([0, 4, 8, 12]);
    expect(bestMove(10, 3)).toBe(2);
    expect(isLosing(10 - bestMove(10, 3), 3)).toBe(true);
    expect(bestMove(8, 3)).toBe(1);
  });

  it('stimmt mit einer vollständigen Spielbaum-Suche überein', () => {
    for (const k of [2, 3, 4]) {
      const win: boolean[] = [false];
      for (let n = 1; n <= 30; n++) {
        let w = false;
        for (let t = 1; t <= Math.min(k, n); t++) if (!win[n - t]) w = true;
        win.push(w);
        expect(isLosing(n, k), `${n}/${k}`).toBe(!w);
      }
    }
  });

  it('spielt Nim mit mehreren Haufen', () => {
    expect(nimSum([3, 4, 5])).toBe(2);
    const m = nimMove([3, 4, 5])!;
    const after = [3, 4, 5];
    after[m[0]] = m[1];
    expect(nimSum(after)).toBe(0);
    expect(nimMove([1, 2, 3])).toBeNull();
  });
});
