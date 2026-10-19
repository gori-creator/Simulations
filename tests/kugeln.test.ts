import { describe, expect, it } from 'vitest';
import {
  circlePoints,
  dot,
  footOnPlane,
  norm,
  planeBasis,
  pointPosition,
  projectToSphere,
  reducePlane,
  signedDistance,
  sphereLhs,
  sphereLine,
  spherePlane,
  sub,
  tangentPlane,
  type V3,
} from '../src/simulations/mathematik/kugeln/model';

const M: V3 = [1, 2, 3];
const r = 3;
const close3 = (a: V3, b: V3) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, 10));

describe('Modell: Kugeln, Geraden und Ebenen – Kugelgleichung', () => {
  it('Kugelgleichung (x₁−1)² + (x₂−2)² + (x₃−3)² = 9 und Punktprobe', () => {
    expect(sphereLhs(M, [1, 2, 6])).toBe(9);
    expect(pointPosition(M, r, [1, 2, 6])).toBe('on');
    expect(sphereLhs(M, [2, 2, 3])).toBe(1);
    expect(pointPosition(M, r, [2, 2, 3])).toBe('inside');
    expect(sphereLhs(M, [5, 2, 3])).toBe(16);
    expect(pointPosition(M, r, [5, 2, 3])).toBe('outside');
  });
  it('Mittelpunkt liegt innen, B(3|4|4) liegt auf K', () => {
    expect(pointPosition(M, r, M)).toBe('inside');
    expect(pointPosition(M, r, [3, 4, 4])).toBe('on');
  });
  it('radiale Projektion auf die Kugel', () => {
    close3(projectToSphere(M, r, [1, 2, 10]), [1, 2, 6]);
    close3(projectToSphere(M, r, [3, 4, 4]), [3, 4, 4]);
    close3(projectToSphere(M, r, M), [1, 2, 6]);
  });
});

describe('Modell: Kugel und Ebene', () => {
  it('Ebene x₃ = 5: d = 2 < 3 → Schnittkreis mit M′(1|2|5), ρ = √5', () => {
    const cut = spherePlane(M, r, [0, 0, 1], 5)!;
    expect(cut.kind).toBe('circle');
    expect(cut.d).toBeCloseTo(2, 12);
    close3(cut.foot, [1, 2, 5]);
    if (cut.kind !== 'circle') throw new Error();
    expect(cut.rho).toBeCloseTo(Math.sqrt(5), 12);
    expect(cut.rho).toBeCloseTo(2.236, 3);
  });
  it('Ebene x₃ = 6 → Berührpunkt (1|2|6); x₃ = 7 → kein Schnitt', () => {
    const t = spherePlane(M, r, [0, 0, 1], 6)!;
    expect(t.kind).toBe('tangent');
    if (t.kind !== 'tangent') throw new Error();
    close3(t.point, [1, 2, 6]);
    const n = spherePlane(M, r, [0, 0, 1], 7)!;
    expect(n.kind).toBe('none');
    expect(n.d).toBeCloseTo(4, 12);
  });
  it('schräge Ebene 2x₁ − x₂ + 2x₃ = 12: d = 2, ρ = √5', () => {
    const cut = spherePlane(M, r, [2, -1, 2], 12)!;
    expect(cut.kind).toBe('circle');
    expect(cut.d).toBeCloseTo(2, 12);
    expect(signedDistance(M, [2, -1, 2], 12)).toBeCloseTo(-2, 12);
    close3(cut.foot, [7 / 3, 4 / 3, 13 / 3]);
  });
  it('Ebene durch M schneidet im Großkreis (ρ = r)', () => {
    const cut = spherePlane(M, r, [1, 1, 1], 6)!;
    expect(cut.kind).toBe('circle');
    if (cut.kind !== 'circle') throw new Error();
    expect(cut.rho).toBeCloseTo(3, 12);
    close3(cut.foot, M);
  });
  it('Normalenvektor o ist keine Ebene', () => {
    expect(spherePlane(M, r, [0, 0, 0], 5)).toBeNull();
    expect(Number.isNaN(signedDistance(M, [0, 0, 0], 1))).toBe(true);
  });
  it('Zufallswerte: ρ² + d² = r², Kreispunkte liegen auf K und in E', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let i = 0; i < 300; i++) {
      const m: V3 = [rnd() * 4, rnd() * 4, rnd() * 4];
      const rr = 0.5 + Math.abs(rnd()) * 4.5;
      const n: V3 = [rnd() * 3, rnd() * 3, rnd() * 3];
      const c = dot(n, m) + rnd() * rr * norm(n) * 0.98;
      const cut = spherePlane(m, rr, n, c)!;
      expect(cut.kind).toBe('circle');
      if (cut.kind !== 'circle') continue;
      expect(cut.rho ** 2 + cut.d ** 2).toBeCloseTo(rr * rr, 9);
      for (const q of circlePoints(cut.foot, n, cut.rho, 12)) {
        expect(sphereLhs(m, q)).toBeCloseTo(rr * rr, 8);
        expect(dot(n, q)).toBeCloseTo(c, 8);
      }
      // Lotfußpunkt liegt in E, MM′ ist parallel zu n
      const f = footOnPlane(m, n, c);
      expect(dot(n, f)).toBeCloseTo(c, 9);
    }
  });
  it('Basis der Ebene ist orthonormal und senkrecht zu n', () => {
    for (const n of [[0, 0, 1], [2, -1, 2], [1, 0, 0], [0, 3, 0.5]] as V3[]) {
      const [u, v] = planeBasis(n);
      expect(norm(u)).toBeCloseTo(1, 12);
      expect(norm(v)).toBeCloseTo(1, 12);
      expect(dot(u, v)).toBeCloseTo(0, 12);
      expect(dot(u, n)).toBeCloseTo(0, 12);
      expect(dot(v, n)).toBeCloseTo(0, 12);
    }
  });
});

describe('Modell: Kugel und Gerade', () => {
  it('Sekante (1|2|−5) + t(0|0|1): t = 5 und t = 11, Punkte (1|2|0) und (1|2|6)', () => {
    const s = sphereLine(M, r, [1, 2, -5], [0, 0, 1])!;
    expect(s.kind).toBe('secant');
    expect([s.A, s.B, s.C]).toEqual([1, -16, 55]);
    expect(s.D).toBe(36);
    expect(s.ts[0]).toBeCloseTo(5, 12);
    expect(s.ts[1]).toBeCloseTo(11, 12);
    close3(s.points[0]!, [1, 2, 0]);
    close3(s.points[1]!, [1, 2, 6]);
  });
  it('Tangente (4|2|0) + t(0|0|1): Berührpunkt (4|2|3)', () => {
    const t = sphereLine(M, r, [4, 2, 0], [0, 0, 1])!;
    expect(t.kind).toBe('tangent');
    expect(t.D).toBe(0);
    close3(t.points[0]!, [4, 2, 3]);
    expect(t.dist).toBeCloseTo(3, 12);
  });
  it('Passante (5|2|0) + t(0|0|1): D < 0, Abstand 4', () => {
    const p = sphereLine(M, r, [5, 2, 0], [0, 0, 1])!;
    expect(p.kind).toBe('passante');
    expect(p.D).toBeLessThan(0);
    expect(p.points).toHaveLength(0);
    expect(p.dist).toBeCloseTo(4, 12);
  });
  it('Richtungsvektor o ist keine Gerade', () => {
    expect(sphereLine(M, r, [1, 2, 3], [0, 0, 0])).toBeNull();
  });
  it('fast tangential: knapp innen Sekante, knapp außen Passante', () => {
    expect(sphereLine(M, r, [3.999, 2, 0], [0, 0, 1])!.kind).toBe('secant');
    expect(sphereLine(M, r, [4.001, 2, 0], [0, 0, 1])!.kind).toBe('passante');
  });
  it('Zufallswerte: Schnittpunkte der Sekante liegen auf K und auf g', () => {
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    let secants = 0;
    for (let i = 0; i < 400; i++) {
      const m: V3 = [rnd() * 4, rnd() * 4, rnd() * 4];
      const rr = 0.5 + Math.abs(rnd()) * 4.5;
      const a: V3 = [rnd() * 8, rnd() * 8, rnd() * 8];
      const u: V3 = [rnd() * 3, rnd() * 3, rnd() * 3];
      const s = sphereLine(m, rr, a, u)!;
      expect(s.kind === 'secant').toBe(s.dist < rr);
      if (s.kind !== 'secant') continue;
      secants++;
      for (let k = 0; k < 2; k++) {
        const q = s.points[k]!;
        expect(sphereLhs(m, q)).toBeCloseTo(rr * rr, 7);
        const w = sub(q, a);
        expect(norm([w[1] * u[2] - w[2] * u[1], w[2] * u[0] - w[0] * u[2], w[0] * u[1] - w[1] * u[0]])).toBeCloseTo(0, 7);
      }
    }
    expect(secants).toBeGreaterThan(20);
  });
});

describe('Modell: Tangentialebene', () => {
  it('in B(1|2|6): Normalenvektor (0|0|3), Ebene x₃ = 6', () => {
    const t = tangentPlane(M, [1, 2, 6]);
    expect(t.n).toEqual([0, 0, 3]);
    expect(t.c).toBe(18);
    const red = reducePlane(t.n, t.c);
    expect(red.n).toEqual([0, 0, 1]);
    expect(red.c).toBe(6);
  });
  it('in B(3|4|4): MB = (2|2|1), Ebene 2x₁ + 2x₂ + x₃ = 18', () => {
    const t = tangentPlane(M, [3, 4, 4]);
    expect(t.n).toEqual([2, 2, 1]);
    expect(t.c).toBe(18);
    expect(reducePlane(t.n, t.c)).toEqual({ n: [2, 2, 1], c: 18 });
  });
  it('die Tangentialebene berührt K genau in B (d = r)', () => {
    for (const b of [[1, 2, 6], [3, 4, 4], [1, 2, 0], [-1, 0, 4]] as V3[]) {
      const t = tangentPlane(M, b);
      const cut = spherePlane(M, r, t.n, t.c)!;
      expect(cut.kind).toBe('tangent');
      close3(cut.foot, b);
    }
  });
  it('nicht ganzzahlige Ebenen bleiben unverändert', () => {
    expect(reducePlane([0.5, 1, 0], 2)).toEqual({ n: [0.5, 1, 0], c: 2 });
    expect(reducePlane([2, 4, 6], 3)).toEqual({ n: [2, 4, 6], c: 3 });
  });
});
