import { describe, expect, it } from 'vitest';
import { angleAt, angleKind, circleIntersections, lineIntersection, quizPoint, rightTriangle, setSquareChord, tangentPoints, type Point } from '../src/simulations/mathematik/thales/model';

const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('Kreisschnitt und Tangenten', () => {
  it('zwei Kreise schneiden sich in 0, 1 oder 2 Punkten', () => {
    const two = circleIntersections([0, 0], 5, [6, 0], 5);
    expect(two).toHaveLength(2);
    for (const q of two) {
      expect(dist(q, [0, 0])).toBeCloseTo(5, 10);
      expect(dist(q, [6, 0])).toBeCloseTo(5, 10);
    }
    expect(circleIntersections([0, 0], 1, [5, 0], 1)).toHaveLength(0);
    expect(circleIntersections([0, 0], 2, [4, 0], 2)).toHaveLength(1);
  });
  it('Tangente steht senkrecht auf dem Berührradius (Thales)', () => {
    const O: Point = [0, 0];
    const P: Point = [5, 2];
    const ts = tangentPoints(O, 2, P);
    expect(ts).toHaveLength(2);
    for (const T of ts) {
      expect(dist(T, O)).toBeCloseTo(2, 10);
      expect(angleAt(T, O, P)).toBeCloseTo(90, 8);
      // Tangentenabschnitt nach Pythagoras
      expect(dist(T, P) ** 2).toBeCloseTo(29 - 4, 8);
    }
    expect(tangentPoints(O, 2, [1, 0])).toHaveLength(0);
  });
});

describe('Rechtwinkliges Dreieck aus c und a', () => {
  it('3-4-5-Dreieck', () => {
    const t = rightTriangle(5, 3)!;
    expect(t.b).toBeCloseTo(4, 12);
    expect(dist(t.C, t.B)).toBeCloseTo(3, 10);
    expect(dist(t.C, t.A)).toBeCloseTo(4, 10);
    expect(angleAt(t.C, t.A, t.B)).toBeCloseTo(90, 8);
    expect(t.alpha + t.beta).toBeCloseTo(90, 12);
    expect(angleAt(t.A, t.B, t.C)).toBeCloseTo(t.alpha, 8);
  });
  it('a ≥ c ist nicht möglich', () => {
    expect(rightTriangle(5, 5)).toBeNull();
    expect(rightTriangle(5, 6)).toBeNull();
  });
});

describe('Kreismitte mit dem Geodreieck', () => {
  it('die Schenkel treffen den Kreis in den Enden eines Durchmessers', () => {
    for (const [th, rot] of [[0.3, 2.4], [2, 4.5], [4, 1]] as const) {
      const { V, P, Q } = setSquareChord(3, th, rot);
      expect(dist(V, [0, 0])).toBeCloseTo(3, 10);
      expect(P[0] + Q[0]).toBeCloseTo(0, 9);
      expect(P[1] + Q[1]).toBeCloseTo(0, 9);
    }
    const a = setSquareChord(3, 0.3, 2.4);
    const b = setSquareChord(3, 2, 4.5);
    const m = lineIntersection(a.P, a.Q, b.P, b.Q)!;
    expect(m[0]).toBeCloseTo(0, 9);
    expect(m[1]).toBeCloseTo(0, 9);
  });
});

describe('Übung', () => {
  it('Lage passt zur Antwort, alle drei Arten kommen vor', () => {
    const seen = new Set<string>();
    for (let n = 1; n <= 60; n++) {
      const q = quizPoint(n, 3);
      expect(angleKind(q.C, [-3, 0], [3, 0], 1e-6)).toBe(q.kind);
      expect(quizPoint(n, 3)).toEqual(q);
      seen.add(q.kind);
    }
    expect(seen.size).toBe(3);
  });
});
