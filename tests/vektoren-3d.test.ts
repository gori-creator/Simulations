import { describe, expect, it } from 'vitest';
import { add, histogram, meanSq, walkEnd, axisStep, sortSteps, stepCounts, sumOf, walkPositions, bestRS, between, centroid, collinear, coplanar, degenerate, det3, divide, dot, hasVec, isZero, latticeOnSphere, lengthSteps, linComb, midpoint, multipleOf, neg, norm, normSq, randomVec, scale, solveLinComb, spatCorner, spatCorners, sub, triangleMids, unit } from '../src/simulations/mathematik/vektoren-3d/model';

describe('Modell: Vektoren im Raum', () => {
  it('addiert und subtrahiert komponentenweise', () => {
    expect(add([2, 4, 0], [1, -1, 3])).toEqual([3, 3, 3]);
    expect(sub([2, 4, 0], [1, -1, 3])).toEqual([1, 5, -3]);
    // a − b = a + (−b)
    expect(sub([2, 4, 0], [1, -1, 3])).toEqual(add([2, 4, 0], neg([1, -1, 3])));
  });
  it('Rechengesetze: kommutativ, assoziativ, distributiv', () => {
    const a = [2, -1, 3] as const;
    const b = [0.5, 4, -2] as const;
    const c = [1, 1, 1] as const;
    expect(add(a, b)).toEqual(add(b, a));
    expect(add(add(a, b), c)).toEqual(add(a, add(b, c)));
    expect(scale(add(a, b), 2)).toEqual(add(scale(a, 2), scale(b, 2)));
  });
  it('Vielfache: Länge mal |k|, Richtung umgekehrt bei k < 0', () => {
    const a = [2, 4, 0] as const;
    expect(scale(a, -1.5)).toEqual([-3, -6, -0]);
    expect(norm(scale(a, -1.5))).toBeCloseTo(1.5 * norm(a), 12);
    expect(multipleOf(a, scale(a, -1.5))).toBeCloseTo(-1.5, 12);
  });
  it('Betrag: √(2² + 4² + 0²) = √20', () => {
    expect(normSq([2, 4, 0])).toBe(20);
    expect(norm([2, 3, 6])).toBeCloseTo(7, 12);
    expect(norm(unit([2, 3, 6]))).toBeCloseTo(1, 12);
    expect(unit([0, 0, 0])).toEqual([0, 0, 0]);
  });
  it('Linearkombination und ihre Faktoren', () => {
    const a = [2, 4, 0] as const;
    const b = [1, -1, 3] as const;
    expect(linComb(1.5, a, 0.5, b)).toEqual([3.5, 5.5, 1.5]);
    const rs = solveLinComb(a, b, [3.5, 5.5, 1.5])!;
    expect(rs.r).toBeCloseTo(1.5, 9);
    expect(rs.s).toBeCloseTo(0.5, 9);
    // nicht in der Ebene von a und b
    expect(solveLinComb(a, b, [0, 0, 1])).toBeNull();
  });
  it('Verbindungsvektor „Spitze minus Fuß“ und Mittelpunkt', () => {
    expect(between([3, -1, 1], [-1, 3, 3])).toEqual([-4, 4, 2]);
    expect(norm(between([3, -1, 1], [-1, 3, 3]))).toBeCloseTo(6, 12);
    expect(midpoint([3, -1, 1], [-1, 3, 3])).toEqual([1, 1, 2]);
  });
  it('Kollinearität und Nullvektor', () => {
    expect(collinear([1, 2, 3], [-2, -4, -6])).toBe(true);
    expect(collinear([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(collinear([0, 0, 0], [1, 2, 4])).toBe(true);
    expect(multipleOf([1, 2, 3], [1, 2, 4])).toBeNull();
    expect(isZero([0, 0, 0])).toBe(true);
  });
  it('Zufallsvektoren ganzzahlig und nicht der Nullvektor', () => {
    for (let s = 0; s < 40; s++) {
      const v = randomVec(s);
      expect(v.every((x) => Number.isInteger(x) && Math.abs(x) <= 3)).toBe(true);
      expect(isZero(v)).toBe(false);
    }
  });
});

describe('Modell: Vektoren im Raum – Prüfwerte und Ergänzungen', () => {
  it('Prüfwerte: (1 | 2 | 3) + (2 | −1 | 0) = (3 | 1 | 3); 2 · (1 | 2 | 3) = (2 | 4 | 6); |(2 | 3 | 6)| = 7', () => {
    expect(add([1, 2, 3], [2, -1, 0])).toEqual([3, 1, 3]);
    expect(scale([1, 2, 3], 2)).toEqual([2, 4, 6]);
    expect(norm([2, 3, 6])).toBe(7);
    expect(normSq([2, 3, 6])).toBe(49);
  });
  it('Sonderfälle: Gegenvektor, Nullvektor, k = 0', () => {
    expect(isZero(add([1, 2, 3], neg([1, 2, 3])))).toBe(true);
    expect(isZero(scale([1, 2, 3], 0))).toBe(true);
    expect(collinear([1, 2, 3], [2, 4, 6])).toBe(true);
  });
  it('Linearkombination finden: Faktoren und Restabstand', () => {
    const a = [2, 4, 0] as const;
    const b = [1, -1, 3] as const;
    const c = add(a, b);
    const rs = bestRS(a, b, c)!;
    expect(rs.r).toBeCloseTo(1, 9);
    expect(rs.s).toBeCloseTo(1, 9);
    expect(rs.rest).toBeCloseTo(0, 9);
    // c außerhalb der Ebene: Restabstand > 0
    const off = bestRS([1, 0, 0], [0, 1, 0], [1, 2, 3])!;
    expect(off.r).toBeCloseTo(1, 12);
    expect(off.s).toBeCloseTo(2, 12);
    expect(off.rest).toBeCloseTo(3, 12);
    // kollinear: keine Ebene
    expect(bestRS([1, 2, 3], [2, 4, 6], [1, 0, 0])).toBeNull();
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
  });
  it('Spat: Ecken, Volumen, komplanar', () => {
    const cs = spatCorners([2, 0, 0], [0, 3, 0], [0, 0, 4]);
    expect(cs).toHaveLength(8);
    expect(cs[7]!.p).toEqual([2, 3, 4]);
    expect(det3([2, 0, 0], [0, 3, 0], [0, 0, 4])).toBe(24);
    expect(det3([2, 4, 0], [1, -1, 3], [0, 0, 3])).toBe(-18);
    expect(coplanar([2, 4, 0], [1, -1, 3], add([2, 4, 0], [1, -1, 3]))).toBe(true);
    expect(coplanar([2, 4, 0], [1, -1, 3], [0, 0, 3])).toBe(false);
    expect(spatCorner([1, 0, 0], [0, 1, 0], [0, 0, 1], 1, 0, 1)).toEqual([1, 0, 1]);
  });
});

describe('Modell: Länge, Einheitsvektor, Gitterpunkte', () => {
  it('Länge in zwei Pythagoras-Schritten', () => {
    expect(lengthSteps([1, 2, 2])).toEqual({ sq12: 5, d12: Math.sqrt(5), sq: 9, d: 3 });
    expect(lengthSteps([0, 3, 4]).d).toBe(5);
    expect(unit([0, 3, 4])[1]).toBeCloseTo(0.6, 12);
    expect(norm(unit([1, 2, 2]))).toBeCloseTo(1, 12);
  });
  it('30 ganzzahlige Vektoren der Länge 3', () => {
    const l = latticeOnSphere(9, 4);
    expect(l.length).toBe(30);
    expect(hasVec(l, [1, 2, 2])).toBe(true);
    expect(hasVec(l, [0, 0, -3])).toBe(true);
    expect(hasVec(l, [1, 1, 2])).toBe(false);
    expect(latticeOnSphere(1, 4).length).toBe(6);
  });
});

describe('Modell: Dreieck und Schwerpunkt', () => {
  it('Schwerpunkt teilt die Seitenhalbierenden im Verhältnis 2 : 1', () => {
    const A = [3, 0, 0] as const;
    const B = [0, 3, 0] as const;
    const C = [0, 0, 3] as const;
    expect(centroid(A, B, C)).toEqual([1, 1, 1]);
    const m = triangleMids(A, B, C);
    expect(m.bc).toEqual([0, 1.5, 1.5]);
    const s = divide(A, m.bc, 2 / 3);
    s.forEach((v) => expect(v).toBeCloseTo(1, 12));
    const s2 = centroid([2, 4, 0], [1, -1, 3], [0, 0, 3]);
    expect(s2).toEqual([1, 1, 2]);
    expect(divide([0, 0, 0], [4, 2, 0], 0.5)).toEqual([2, 1, 0]);
  });
  it('entartete Dreiecke', () => {
    expect(degenerate([1, 1, 0], [2, 2, 1], [3, 3, 2])).toBe(true);
    expect(degenerate([1, 1, 0], [1, 1, 0], [3, 0, 2])).toBe(true);
    expect(degenerate([3, 0, 0], [0, 3, 0], [0, 0, 3])).toBe(false);
  });
});

describe('Modell: Zufallsweg', () => {
  it('sechs gleich wahrscheinliche Einheitsschritte', () => {
    expect(axisStep(0)).toEqual([1, 0, 0]);
    expect(axisStep(0.2)).toEqual([0, 1, 0]);
    expect(axisStep(0.4)).toEqual([0, 0, 1]);
    expect(axisStep(0.5)).toEqual([-1, 0, 0]);
    expect(axisStep(0.99)).toEqual([0, 0, -1]);
    expect(axisStep(1)).toEqual([0, 0, -1]);
  });
  it('Sortieren ändert den Endpunkt nicht (Kommutativgesetz)', () => {
    let s = 7;
    const u = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const steps = Array.from({ length: 200 }, () => axisStep(u()));
    const sorted = sortSteps(steps);
    expect(sumOf(sorted)).toEqual(sumOf(steps));
    expect(walkPositions(steps).length).toBe(201);
    expect(walkPositions(steps)[200]).toEqual(sumOf(steps));
    const c = stepCounts(steps);
    expect(c.plus.reduce((a, b) => a + b) + c.minus.reduce((a, b) => a + b)).toBe(200);
    expect(sumOf(steps)).toEqual([0, 1, 2].map((k) => c.plus[k]! - c.minus[k]!));
    // sortiert: erst alle +e₁-Schritte
    expect(sorted[0]).toEqual([1, 0, 0]);
    expect(sortSteps([[0, 0, 1], [-1, 0, 0], [1, 0, 0]])).toEqual([[1, 0, 0], [-1, 0, 0], [0, 0, 1]]);
  });
});

describe('Modell: viele Zufallswege', () => {
  it('mittleres Abstandsquadrat ist etwa n', () => {
    let s = 11;
    const u = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const ends = Array.from({ length: 4000 }, () => walkEnd(20, u));
    expect(meanSq(ends)).toBeGreaterThan(19);
    expect(meanSq(ends)).toBeLessThan(21);
    // Parität: nach 20 Schritten ist die Koordinatensumme gerade
    expect(ends.every((q) => Math.abs(q[0] + q[1] + q[2]) % 2 === 0)).toBe(true);
    expect(meanSq([])).toBe(0);
  });
  it('Klassen der Abstände', () => {
    expect(histogram([0, 0.5, 1, 1.9, 7, 100], 1, 4)).toEqual([2, 2, 0, 2]);
  });
});

describe('Befunde Paket 5 (Lernmaterial)', () => {
  it('Aufgabe 1: |a + b| = √27 ≈ 5,20 < |a| + |b| ≈ 7,79', () => {
    const a = [2, 4, 0] as const;
    const b = [1, -1, 3] as const;
    expect(normSq(add(a, b))).toBe(27);
    expect(norm(add(a, b))).toBeCloseTo(5.196, 3);
    expect(norm(a) + norm(b)).toBeCloseTo(7.789, 3);
    expect(norm(add(a, b))).toBeLessThan(norm(a) + norm(b));
  });
  it('Aufgabe 3: c = (0 | 0 | 3) liegt nicht in der Ebene von a und b', () => {
    const best = bestRS([2, 4, 0], [1, -1, 3], [0, 0, 3]);
    expect(best).not.toBeNull();
    expect(best!.rest).toBeGreaterThan(0.01);
    expect(solveLinComb([2, 4, 0], [1, -1, 3], [0, 0, 3])).toBeNull();
  });
  it('Aufgabe 4: Einheitsvektor zu (0 | 3 | 4) ist (0 | 0,6 | 0,8)', () => {
    const e = unit([0, 3, 4]);
    expect(e[0]).toBeCloseTo(0, 12);
    expect(e[1]).toBeCloseTo(0.6, 12);
    expect(e[2]).toBeCloseTo(0.8, 12);
  });
});
