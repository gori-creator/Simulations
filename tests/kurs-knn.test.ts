import { describe, expect, it } from 'vitest';
import { accuracy, classify, nearest } from '../src/kurse/ki-abenteuer/models/knn';
import { EXAMPLES, TESTS } from '../src/kurse/ki-abenteuer/models/obst';

const ex = (id: string) => EXAMPLES.find((e) => e.id === id)!;

describe('Nächste Nachbarn', () => {
  const pts = [
    { x: 0, y: 0, label: 'a' },
    { x: 1, y: 0, label: 'a' },
    { x: 5, y: 5, label: 'b' },
    { x: 6, y: 5, label: 'b' },
    { x: 5, y: 6, label: 'b' },
  ];
  it('findet die nächsten Beispiele', () => {
    expect(nearest({ x: 0.2, y: 0 }, pts, 2).map((p) => p.x)).toEqual([0, 1]);
  });
  it('stimmt per Mehrheit ab', () => {
    expect(classify({ x: 0.5, y: 0 }, pts, 1)).toBe('a');
    expect(classify({ x: 3, y: 3 }, pts, 5)).toBe('b');
    expect(classify({ x: 3, y: 3 }, [], 1)).toBeNull();
  });
  it('Gleichstand: nächstes Beispiel entscheidet', () => {
    // k = 2: ein a (Abstand 1) und ein b (Abstand 2) → a
    expect(classify({ x: 0, y: 0 }, [{ x: 1, y: 0, label: 'a' }, { x: 2, y: 0, label: 'b' }], 2)).toBe('a');
  });
  it('Trefferquote, auch ohne das eigene Beispiel', () => {
    expect(accuracy(pts, pts, 1)).toBe(1);
    expect(accuracy(pts, pts, 1, true)).toBe(1);
  });
});

describe('Äpfel und Birnen', () => {
  it('mit allen Beispielen ist die Probe fehlerfrei', () => {
    expect(accuracy(TESTS, EXAMPLES, 1)).toBe(1);
  });
  it('nur roter Apfel und grüne Birne: grüner Apfel wird zur Birne', () => {
    const few = [ex('apfel-rot'), ex('birne-gruen')];
    expect(classify(TESTS.find((t) => t.id === 't-apfel-gruen')!, few)).toBe('pear');
    expect(accuracy(TESTS, few)).toBeLessThan(1);
  });
  it('ein einziges Beispiel: Bit sagt immer dasselbe (die Hälfte richtig)', () => {
    expect(accuracy(TESTS, [ex('apfel-rot')])).toBe(0.5);
  });
});
