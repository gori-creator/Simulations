import { describe, expect, it } from 'vitest';
import { MAX_STEPS, RATES, ROUNDS, slope, step, stepsToValley } from '../src/kurse/ki-abenteuer/models/bergab';
import { fires, matches, SITUATIONS, THRESHOLD_RANGE, WEIGHT_RANGE, weightedSum } from '../src/kurse/ki-abenteuer/models/neuron';
import { boundary, errors, learnStep, predict, START } from '../src/kurse/ki-abenteuer/models/perzeptron';
import { CITRUS } from '../src/kurse/ki-abenteuer/models/zitrus';

describe('Ein Neuron', () => {
  it('rechnet die gewichtete Summe', () => {
    expect(weightedSum([2, 2, -3], [1, 1, 0])).toBe(4);
    expect(fires([2, 2, -3], 2, [1, 0, 1])).toBe(false); // 2 − 3 = −1
  });
  it('w = (2, 2, −3), Schwelle 2 entscheidet wie Bit', () => {
    expect(matches([2, 2, -3], 2)).toBe(SITUATIONS.length);
  });
  it('Startwerte passen noch nicht, eine Lösung liegt im erlaubten Bereich', () => {
    expect(matches([0, 0, 0], 1)).toBeLessThan(SITUATIONS.length);
    let found = 0;
    for (let a = WEIGHT_RANGE[0]; a <= WEIGHT_RANGE[1]; a++)
      for (let b = WEIGHT_RANGE[0]; b <= WEIGHT_RANGE[1]; b++)
        for (let c = WEIGHT_RANGE[0]; c <= WEIGHT_RANGE[1]; c++)
          for (let t = THRESHOLD_RANGE[0]; t <= THRESHOLD_RANGE[1]; t++) if (matches([a, b, c], t) === SITUATIONS.length) found++;
    expect(found).toBeGreaterThan(3);
  });
});

describe('Das Neuron lernt', () => {
  it('Start ist falsch, Lernen führt zu null Fehlern', () => {
    expect(errors(START, CITRUS)).toBeGreaterThan(3);
    let w = START;
    let from = 0;
    let n = 0;
    while (errors(w, CITRUS) > 0 && n < 2000) {
      const r = learnStep(w, CITRUS, from);
      w = r.weights;
      from = r.next;
      n++;
    }
    expect(errors(w, CITRUS)).toBe(0);
    // Nicht zu viele Schritte für das Spiel
    expect(n).toBeLessThan(400);
    expect(learnStep(w, CITRUS, 0).index).toBe(-1);
  });
  it('Grenzgerade passt zur Vorhersage', () => {
    const w = { w1: 1, w2: 1, b: -1 }; // x + y = 10
    const [a, b] = boundary(w)!;
    expect(a.x + a.y).toBeCloseTo(10);
    expect(b.x + b.y).toBeCloseTo(10);
    expect(predict(w, { x: 9, y: 9 })).toBe(1);
    expect(predict(w, { x: 1, y: 1 })).toBe(-1);
  });
});

describe('Bergab lernen', () => {
  it('Schritt nach der Regel w − r·f′(w)', () => {
    expect(slope(ROUNDS[0]!, -4)).toBe(-7);
    expect(step(ROUNDS[0]!, -4, 0.6)).toBeCloseTo(0.2);
  });
  it('Runde 1: mittel und groß schaffen es, winzig nicht', () => {
    const r = ROUNDS[0]!;
    expect(stepsToValley(r, 0.05, MAX_STEPS)).toBe(Infinity);
    expect(stepsToValley(r, 0.6, MAX_STEPS)).toBeLessThanOrEqual(MAX_STEPS);
    expect(stepsToValley(r, 1.2, MAX_STEPS)).toBeLessThanOrEqual(MAX_STEPS);
  });
  it('Runde 2 (steiler): nur „klein“ klappt, „groß“ fliegt raus', () => {
    const r = ROUNDS[1]!;
    const ok = RATES.filter((rate) => stepsToValley(r, rate, MAX_STEPS) <= MAX_STEPS);
    expect(ok).toEqual([0.3]);
    expect(stepsToValley(r, 1.2, 100)).toBe(Infinity);
  });
});
