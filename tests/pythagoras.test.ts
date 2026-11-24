import { describe, expect, it } from 'vitest';
import {
  checkAnswer,
  classify,
  gcd,
  integerHypotenuse,
  parseAnswer,
  quizTask,
  squareOutward,
  thirdSide,
  triplesUpTo,
} from '../src/simulations/mathematik/pythagoras/model';
import { seededRandom } from '../src/sim-core';

describe('Modell: Satz des Pythagoras – Umkehrung', () => {
  it('liefert bei 90° die Hypotenuse (3-4-5)', () => {
    expect(thirdSide(3, 4, 90)).toBeCloseTo(5, 12);
    expect(classify(3, 4, thirdSide(3, 4, 90), 1e-9)).toBe('right');
  });
  it('Kosinussatz bei 60° und 120°', () => {
    // a = b = 1, γ = 60° → gleichseitig, c = 1
    expect(thirdSide(1, 1, 60)).toBeCloseTo(1, 12);
    // a = 3, b = 5, γ = 120° → c² = 9 + 25 + 15 = 49
    expect(thirdSide(3, 5, 120)).toBeCloseTo(7, 12);
    expect(classify(3, 5, 7)).toBe('obtuse');
    expect(classify(3, 4, thirdSide(3, 4, 60))).toBe('acute');
  });
  it('erkennt rechtwinklige Dreiecke aus Seitenlängen', () => {
    expect(classify(7, 24, 25)).toBe('right');
    expect(classify(5, 6, 8)).toBe('obtuse'); // 61 < 64
    expect(classify(5, 6, 7)).toBe('acute'); // 61 > 49
  });
  it('legt Quadrate nach außen', () => {
    const [, , , d] = squareOutward([0, 0], [4, 0], [0, 3]);
    expect(d[1]).toBeLessThan(0); // Dreieck liegt oberhalb, Quadrat unterhalb
    const [, , , e] = squareOutward([0, 0], [0, 3], [4, 0]);
    expect(e[0]).toBeLessThan(0);
  });
});

describe('Modell: Pythagoreische Tripel', () => {
  it('findet ganzzahlige Hypotenusen', () => {
    expect(integerHypotenuse(3, 4)).toBe(5);
    expect(integerHypotenuse(5, 12)).toBe(13);
    expect(integerHypotenuse(20, 21)).toBe(29);
    expect(integerHypotenuse(2, 3)).toBeNull();
  });
  it('zählt die Tripel bis 24 (beide Reihenfolgen)', () => {
    const t = triplesUpTo(24);
    // a < b ≤ 24: 3-4, 6-8, 5-12, 9-12, 8-15, 12-16, 15-20, 7-24, 10-24, 18-24, 20-21 → 11 Paare
    expect(t.length).toBe(22);
    expect(t.filter((x) => x.primitive).length).toBe(10); // 3-4, 5-12, 8-15, 7-24, 20-21 je doppelt
    expect(gcd(12, 18)).toBe(6);
  });
});

describe('Modell: Üben', () => {
  it('erzeugt reproduzierbare, lösbare Aufgaben', () => {
    for (let q = 1; q <= 200; q++) {
      const t = quizTask(q, seededRandom(q * 7919 + 13));
      expect(t.a * t.a + t.b * t.b).toBeCloseTo(t.c * t.c, 9);
      expect(t.answer).toBeGreaterThan(0);
      expect(t.c).toBeGreaterThan(Math.max(t.a, t.b) - 1e-9);
      if (q % 2 === 1) expect(t.rounded).toBe(false);
      const again = quizTask(q, seededRandom(q * 7919 + 13));
      expect(again).toEqual(t);
    }
  });
  it('prüft Antworten mit Komma oder Punkt und erlaubt Rundung auf zwei Stellen', () => {
    const task = { find: 'c' as const, a: 2, b: 3, c: Math.hypot(2, 3), answer: Math.hypot(2, 3), rounded: true };
    expect(checkAnswer(task, '3,61').ok).toBe(true); // √13 ≈ 3,6056
    expect(checkAnswer(task, '3.61 cm').ok).toBe(true);
    expect(checkAnswer(task, '3,6').ok).toBe(false);
    expect(checkAnswer(task, '').got).toBeNull();
    expect(parseAnswer(' 12,5 ')).toBe(12.5);
  });
});
