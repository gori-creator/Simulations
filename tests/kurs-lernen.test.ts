import { describe, expect, it } from 'vitest';
import { ask, BEASTS, countQuestions, fewestQuestions, isDone, isPure, splits, type TreeNode } from '../src/kurse/ki-abenteuer/models/baum';
import { accuracy, classify } from '../src/kurse/ki-abenteuer/models/knn';
import { MYSTERY, PETS } from '../src/kurse/ki-abenteuer/models/nachbarn';
import { K_VALUES, TEST, TRAIN } from '../src/kurse/ki-abenteuer/models/probe';

describe('Frag die Nachbarn', () => {
  it('mit einem Nachbarn 3 von 4, mit drei oder fünf alle richtig', () => {
    expect(accuracy(MYSTERY, PETS, 1)).toBe(0.75);
    expect(classify(MYSTERY[0]!, PETS, 1)).toBe('rabbit');
    expect(accuracy(MYSTERY, PETS, 3)).toBe(1);
    expect(accuracy(MYSTERY, PETS, 5)).toBe(1);
  });
});

describe('Fragen-Baum', () => {
  it('Federn, dann Kiemen: zwei Fragen genügen', () => {
    const root: TreeNode = { items: BEASTS };
    expect(isPure(BEASTS)).toBe(false);
    ask(root, 'feathers');
    expect(isDone(root)).toBe(false);
    ask(root.no!, 'gills');
    expect(isDone(root)).toBe(true);
    expect(countQuestions(root)).toBe(2);
    expect(fewestQuestions()).toBe(2);
  });
  it('erkennt Fragen, die nichts teilen', () => {
    const birds = BEASTS.filter((b) => b.klass === 'bird');
    expect(splits(birds, 'feathers')).toBe(false);
    expect(splits(BEASTS, 'water')).toBe(true);
  });
});

describe('Üben und Prüfen', () => {
  const train = (k: number) => accuracy(TRAIN, TRAIN, k);
  const test = (k: number) => accuracy(TEST, TRAIN, k);
  it('auswendig (1 Nachbar): Übung perfekt, Probe schlechter', () => {
    expect(train(1)).toBe(1);
    expect(test(1)).toBeLessThan(0.9);
  });
  it('ein mittlerer Wert ist in der Probe besser als 1 und als sehr viele', () => {
    const tests = K_VALUES.map((k) => test(k));
    const best = Math.max(...tests);
    const bestK = K_VALUES[tests.indexOf(best)]!;
    expect(bestK).toBeGreaterThan(1);
    expect(bestK).toBeLessThan(31);
    expect(best).toBeGreaterThan(test(1));
    expect(best).toBeGreaterThan(test(31));
  });
});
