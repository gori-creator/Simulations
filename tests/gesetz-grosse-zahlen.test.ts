import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core/anim';
import { drawOutcome, funnelHalfWidth, probabilities } from '../src/simulations/mathematik/gesetz-grosse-zahlen/model';

/** Zählt die Ergebnisse von n Würfen mit festem Startwert. */
function countOutcomes(probs: readonly number[], n: number, seed: number): number[] {
  const rand = seededRandom(seed);
  const counts = probs.map(() => 0);
  for (let i = 0; i < n; i++) counts[drawOutcome(probs, rand)]!++;
  return counts;
}

describe('Gesetz der großen Zahlen: Modell', () => {
  it('kennt die Wahrscheinlichkeiten von Münze, Würfel und Reißnagel', () => {
    expect(probabilities('coin', 0.3)).toEqual([0.5, 0.5]);
    const die = probabilities('die', 0.3);
    expect(die).toHaveLength(6);
    for (const p of die) expect(p).toBeCloseTo(1 / 6, 12);
    expect(probabilities('tack', 0.65)[0]).toBeCloseTo(0.65, 12);
    expect(probabilities('tack', 0.65)[1]).toBeCloseTo(0.35, 12);
  });

  it('zieht Ergebnisse an den richtigen Grenzen', () => {
    const die = probabilities('die', 0);
    expect(drawOutcome(die, () => 0)).toBe(0);
    expect(drawOutcome(die, () => 0.17)).toBe(1); // 0,17 > 1/6 → Augenzahl 2
    expect(drawOutcome(die, () => 0.999999)).toBe(5);
    expect(drawOutcome([0.5, 0.5], () => 0.5)).toBe(1);
  });

  it('wirft fair: jede Augenzahl ungefähr gleich oft (seeded)', () => {
    const n = 60000;
    const counts = countOutcomes(probabilities('die', 0), n, 7);
    expect(counts.reduce((s, c) => s + c, 0)).toBe(n);
    for (const c of counts) expect(Math.abs(c / n - 1 / 6)).toBeLessThan(funnelHalfWidth(1 / 6, n));
  });

  it('relative Häufigkeit nähert sich p, absolute Abweichung darf wachsen', () => {
    // Münze: |h − p| wird mit n kleiner, |k − n·p| typischerweise nicht
    const rand = seededRandom(3);
    const probs = probabilities('coin', 0);
    let k = 0;
    const relDev: number[] = [];
    const absDev: number[] = [];
    for (let n = 1; n <= 100000; n++) {
      if (drawOutcome(probs, rand) === 1) k++;
      if (n === 100 || n === 100000) {
        relDev.push(Math.abs(k / n - 0.5));
        absDev.push(Math.abs(k - n * 0.5));
      }
    }
    expect(relDev[1]!).toBeLessThan(funnelHalfWidth(0.5, 100000));
    expect(relDev[1]!).toBeLessThan(0.01);
    // keine Garantie, aber bei diesem Startwert ist die absolute Abweichung größer als bei n = 100
    expect(absDev[1]!).toBeGreaterThan(absDev[0]!);
  });

  it('Trichter: 1,96·√(p(1−p)/n), Sonderfall n = 0 ohne Division durch 0', () => {
    // n = 600, p = 1/6: 1,96·√(5/36 / 600) ≈ 0,0298 → Bereich 0,137 … 0,196
    const w = funnelHalfWidth(1 / 6, 600);
    expect(w).toBeCloseTo(0.0298, 4);
    expect(1 / 6 - w).toBeCloseTo(0.137, 3);
    expect(1 / 6 + w).toBeCloseTo(0.196, 3);
    // n = 1000, p = 0,6: ≈ 0,0304 → 0,57 … 0,63
    expect(funnelHalfWidth(0.6, 1000)).toBeCloseTo(0.0304, 4);
    // viermal so viele Würfe → halb so breit
    expect(funnelHalfWidth(0.5, 400) / funnelHalfWidth(0.5, 100)).toBeCloseTo(0.5, 12);
    expect(funnelHalfWidth(0.5, 0)).toBe(1);
    expect(Number.isFinite(funnelHalfWidth(0.5, 0))).toBe(true);
  });
});
