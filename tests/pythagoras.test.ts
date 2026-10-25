import { describe, expect, it } from 'vitest';
import { arrangementAB, arrangementC, interpolate, type Triangle } from '../src/simulations/mathematik/pythagoras/model';

/** Flächeninhalt eines Dreiecks (Kreuzprodukt). */
const area = (t: Triangle) =>
  Math.abs((t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[2][0] - t[0][0]) * (t[1][1] - t[0][1])) / 2;
const dist = (p: readonly [number, number], q: readonly [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);

const CASES: [number, number][] = [
  [3, 4],
  [1.5, 2],
  [6, 8],
  [1.5, 5],
  [3, 3],
  [1, 8],
];

describe('Pythagoras: Ergänzungsbeweis', () => {
  it('besteht in beiden Anordnungen aus vier kongruenten Dreiecken mit den Seiten a, b, c', () => {
    for (const [a, b] of CASES) {
      const c = Math.hypot(a, b);
      for (const t of [...arrangementC(a, b), ...arrangementAB(a, b)]) {
        expect(dist(t[0], t[1])).toBeCloseTo(a, 9);
        expect(dist(t[0], t[2])).toBeCloseTo(b, 9);
        expect(dist(t[1], t[2])).toBeCloseTo(c, 9);
        expect(area(t)).toBeCloseTo((a * b) / 2, 9);
      }
    }
  });

  it('lässt im Quadrat (a + b)² jeweils die Fläche c² = a² + b² frei', () => {
    for (const [a, b] of CASES) {
      const free = (a + b) ** 2 - arrangementC(a, b).reduce((s, t) => s + area(t), 0);
      const freeAB = (a + b) ** 2 - arrangementAB(a, b).reduce((s, t) => s + area(t), 0);
      expect(free).toBeCloseTo(a * a + b * b, 9);
      expect(freeAB).toBeCloseTo(a * a + b * b, 9);
    }
  });

  it('bewegt jedes Dreieck starr in seine Zielposition', () => {
    for (const [a, b] of CASES) {
      const from = arrangementC(a, b);
      const to = arrangementAB(a, b);
      from.forEach((t, i) => {
        for (const q of [0, 0.25, 0.5, 0.9]) {
          const m = interpolate(t, to[i]!, q);
          expect(dist(m[0], m[1])).toBeCloseTo(a, 9);
          expect(dist(m[0], m[2])).toBeCloseTo(b, 9);
        }
        const start = interpolate(t, to[i]!, 0);
        const end = interpolate(t, to[i]!, 1);
        start.forEach((p, j) => expect(dist(p, t[j]!)).toBeCloseTo(0, 9));
        end.forEach((p, j) => expect(dist(p, to[i]![j]!)).toBeCloseTo(0, 9));
      });
    }
  });
});

describe('Pythagoras: Werte aus dem Lernmaterial', () => {
  it('rechnet die Aufgaben richtig', () => {
    expect(Math.hypot(1.5, 2)).toBeCloseTo(2.5, 12);
    expect(Math.sqrt(10 ** 2 - 6 ** 2)).toBeCloseTo(8, 12);
    expect(Math.sqrt(5 ** 2 - 1.4 ** 2)).toBeCloseTo(4.8, 12);
    expect(7 ** 2 + 24 ** 2).toBe(25 ** 2);
    expect(5 ** 2 + 6 ** 2).toBeLessThan(8 ** 2);
  });
});
