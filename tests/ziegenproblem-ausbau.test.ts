import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { playRoundUninformed, winProbabilitiesUninformed } from '../src/simulations/mathematik/ziegenproblem/model';

describe('Ziegenproblem: ahnungslose Moderation', () => {
  it('Simulation passt zur Theorie (gültige Spiele, je 50 %)', () => {
    for (const doors of [3, 5]) {
      const rnd = seededRandom(doors);
      let valid = 0;
      let stay = 0;
      let sw = 0;
      const n = 60_000;
      for (let i = 0; i < n; i++) {
        const r = playRoundUninformed(doors, rnd);
        if (!r.valid) continue;
        valid++;
        if (r.stayWins) stay++;
        if (r.switchWins) sw++;
      }
      const th = winProbabilitiesUninformed(doors);
      expect(valid / n).toBeCloseTo(th.valid, 2);
      expect(stay / valid).toBeCloseTo(th.stay, 1);
      expect(sw / valid).toBeCloseTo(th.switch, 1);
      expect(stay + sw).toBe(valid);
    }
  });
});
