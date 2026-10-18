import { describe, expect, it } from 'vitest';
import { angleFromSides, angles, circumcenter, circumradius, dist, foot, lawOfCosines, minAngle, sides, sineQuotients, type Tri } from '../src/simulations/mathematik/sinussatz-kosinussatz/model';

const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

describe('Modell: Sinussatz und Kosinussatz', () => {
  it('3-4-5-Dreieck: γ = 90°, Kosinussatz wird zum Pythagoras', () => {
    const t: Tri = [
      [0, 4],
      [3, 0],
      [0, 0],
    ];
    expect(sides(t)).toEqual([3, 4, 5]);
    expect(angles(t)[2]).toBeCloseTo(90, 10);
    expect(lawOfCosines(3, 4, 90)).toBeCloseTo(5, 12);
    expect(circumradius(t)).toBeCloseTo(2.5, 12);
  });
  it('Schulbuchwerte: a = 5, b = 7, γ = 60° → c = √39 ≈ 6,24', () => {
    expect(lawOfCosines(5, 7, 60)).toBeCloseTo(Math.sqrt(39), 12);
    expect(lawOfCosines(5, 7, 60)).toBeCloseTo(6.245, 3);
  });
  it('SSS: a = 5, b = 6, c = 7 → γ ≈ 78,46°; stumpf: 4, 5, 8 → γ ≈ 125,1°', () => {
    expect(angleFromSides(5, 6, 7)).toBeCloseTo(78.463, 3);
    expect(angleFromSides(4, 5, 8)).toBeCloseTo(125.10, 2);
  });
  it('Beispiel der Simulation: A(1|1), B(10|1), C(4|6)', () => {
    const t: Tri = [
      [1, 1],
      [10, 1],
      [4, 6],
    ];
    const [a, b, c] = sides(t);
    expect(a).toBeCloseTo(Math.sqrt(61), 12);
    expect(b).toBeCloseTo(Math.sqrt(34), 12);
    expect(c).toBe(9);
    expect(angles(t)[2]).toBeCloseTo(81.16, 2);
    expect(2 * circumradius(t)).toBeCloseTo(9.11, 2);
  });
  it('Gleichseitig: alle Winkel 60°, 2r = a / sin 60°', () => {
    const t: Tri = [
      [0, 0],
      [2, 0],
      [1, Math.sqrt(3)],
    ];
    angles(t).forEach((w) => expect(w).toBeCloseTo(60, 10));
    expect(2 * circumradius(t)).toBeCloseTo(2 / Math.sin(Math.PI / 3), 12);
  });
  it('Lotfußpunkt und Abschnitt b · cos γ', () => {
    const t: Tri = [
      [1, 1],
      [10, 1],
      [4, 6],
    ];
    const f = foot(t[0], t[2], t[1]);
    const [, b] = sides(t);
    expect(dist(t[2], f.at)).toBeCloseTo(b * Math.cos((angles(t)[2] * Math.PI) / 180), 10);
  });
  it('Plausibilität: Sinussatz, Kosinussatz und Winkelsumme für zufällige Dreiecke', () => {
    let n = 0;
    while (n < 100) {
      const t: Tri = [
        [rnd(0, 12), rnd(0, 8)],
        [rnd(0, 12), rnd(0, 8)],
        [rnd(0, 12), rnd(0, 8)],
      ];
      if (minAngle(t) < 5) continue;
      n++;
      const [a, b, c] = sides(t);
      const w = angles(t);
      expect(w[0] + w[1] + w[2]).toBeCloseTo(180, 9);
      const q = sineQuotients(t);
      expect(q[1]).toBeCloseTo(q[0], 8);
      expect(q[2]).toBeCloseTo(q[0], 8);
      expect(q[0]).toBeCloseTo(2 * circumradius(t), 8);
      expect(lawOfCosines(a, b, w[2])).toBeCloseTo(c, 9);
      const U = circumcenter(t);
      t.forEach((P) => expect(dist(U, P)).toBeCloseTo(circumradius(t), 8));
    }
  });
});
