import { describe, expect, it } from 'vitest';
import { inversion, step, thresholdInversion, thresholdPump, type LaserState } from '../src/simulations/physik/laser/model';

function run(W: number, R: number, levels: 3 | 4, T = 60): LaserState {
  let s: LaserState = { N2: 0, n: 0 };
  for (let t = 0; t < T; t += 0.002) s = step(s, W, R, levels, 0.002);
  return s;
}

describe('Laser-Ratenmodell', () => {
  it('Vierniveau-Laser hat eine viel kleinere Schwelle als der Dreiniveau-Laser', () => {
    expect(thresholdPump(0.99, 4)).toBeLessThan(0.1 * thresholdPump(0.99, 3));
  });

  it('unter der Schwelle: kaum Laserlicht, keine Inversion beim Dreiniveau-Laser', () => {
    const s = run(0.8 * thresholdPump(0.99, 3), 0.99, 3);
    expect(s.n).toBeLessThan(0.01);
    expect(inversion(s.N2, 3)).toBeLessThan(0);
  });

  it('über der Schwelle: Inversion klemmt am Schwellenwert, Laserlicht entsteht', () => {
    const s = run(3, 0.99, 3);
    expect(s.n).toBeGreaterThan(0.1);
    expect(inversion(s.N2, 3)).toBeCloseTo(thresholdInversion(0.99), 2);
  });

  it('mehr Pumpen → mehr Licht', () => {
    expect(run(4, 0.99, 3).n).toBeGreaterThan(run(2, 0.99, 3).n);
  });
});
