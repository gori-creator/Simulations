import { describe, expect, it } from 'vitest';
import {
  clipLineToBox,
  coordForm,
  cross,
  dot,
  lineLine,
  linePlane,
  norm,
  parallel,
  planeBasis,
  planePlane,
  pointLineDistance,
  pointPlane,
  projectOntoPlane,
  sub,
  type V3,
} from '../src/simulations/mathematik/lage-abstaende/model';

/** Reproduzierbare Zufallsgeraden mit halbzahligen Koordinaten (ein Teil schneidet sich oder ist parallel). */
function seededLines(seed: number, n: number): [V3, V3, V3, V3][] {
  let x = seed;
  const rnd = () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return Math.round(((x / 2147483648) * 16 - 8)) / 2;
  };
  const vec = (): V3 => [rnd(), rnd(), rnd()];
  return Array.from({ length: n }, (_, i) => {
    const a = vec();
    const u = vec();
    let b = vec();
    let v = vec();
    if (i % 3 === 1) b = [a[0] + u[0] * 2, a[1] + u[1] * 2, a[2] + u[2] * 2];
    if (i % 5 === 2) v = [u[0] * -1.5, u[1] * -1.5, u[2] * -1.5];
    return [a, u, b, v];
  });
}

const close = (a: V3, b: V3, digits = 12) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, digits));

describe('Modell: Gerade – Gerade', () => {
  it('schneidend: g: (1|0|0) + t(1|1|0), h: (0|1|0) + s(1|−1|0) → S(1|0|0), t = 0, s = 1, 90°', () => {
    const r = lineLine([1, 0, 0], [1, 1, 0], [0, 1, 0], [1, -1, 0]);
    expect(r.kind).toBe('intersect');
    expect(r.t).toBeCloseTo(0, 12);
    expect(r.s).toBeCloseTo(1, 12);
    close(r.point!, [1, 0, 0]);
    expect(r.angleDeg).toBeCloseTo(90, 12);
    expect(r.distance).toBe(0);
  });

  it('windschief: g: t(1|0|0), h: (0|1|1) + s(0|1|0) → Abstand 1, Lotfußpunkte (0|0|0) und (0|0|1)', () => {
    const r = lineLine([0, 0, 0], [1, 0, 0], [0, 1, 1], [0, 1, 0]);
    expect(r.kind).toBe('skew');
    expect(r.distance).toBeCloseTo(1, 12);
    close(r.footG, [0, 0, 0]);
    close(r.footH, [0, 0, 1]);
    expect(r.angleDeg).toBeCloseTo(90, 12);
  });

  it('parallel und identisch: g: t(1|2|3), h: (1|0|0) + s(2|4|6), h′: (1|2|3) + s(−2|−4|−6)', () => {
    const r = lineLine([0, 0, 0], [1, 2, 3], [1, 0, 0], [2, 4, 6]);
    expect(r.kind).toBe('parallel');
    expect(r.parallelDirs).toBe(true);
    // d = |(1|0|0) × (1|2|3)| / |(1|2|3)| = |(0|−3|2)| / √14 = √13 / √14
    expect(r.distance).toBeCloseTo(Math.sqrt(13 / 14), 12);
    expect(dot(sub(r.footH, r.footG), [1, 2, 3])).toBeCloseTo(0, 12);
    const i = lineLine([0, 0, 0], [1, 2, 3], [1, 2, 3], [-2, -4, -6]);
    expect(i.kind).toBe('identical');
    expect(i.distance).toBe(0);
  });

  it('Abstand windschiefer Geraden = |(b − a) · (u × v)| / |u × v|, Verbindung senkrecht zu beiden', () => {
    const a: V3 = [2.5, 1, 4];
    const u: V3 = [1, 0, 2];
    const b: V3 = [-2, 0, 1];
    const v: V3 = [1, 1, 0];
    const r = lineLine(a, u, b, v);
    expect(r.kind).toBe('skew');
    const n = cross(u, v);
    expect(r.distance).toBeCloseTo(Math.abs(dot(sub(b, a), n)) / norm(n), 12);
    const pq = sub(r.footH, r.footG);
    expect(dot(pq, u)).toBeCloseTo(0, 10);
    expect(dot(pq, v)).toBeCloseTo(0, 10);
    expect(norm(pq)).toBeCloseTo(r.distance, 10);
  });

  it('Toleranz: fast parallele, aber verschiedene Richtungen bleiben schneidend/windschief', () => {
    const r = lineLine([0, 0, 0], [4, 0, 0], [0, 1, 0], [4, 0.5, 0]);
    expect(r.parallelDirs).toBe(false);
    expect(r.kind).toBe('intersect');
    expect(r.angleDeg).toBeCloseTo((Math.atan(0.125) * 180) / Math.PI, 10);
    // Rundungsfehler aus Gleitkommazahlen machen parallele Richtungen nicht windschief
    const p = lineLine([0.1, 0.2, 0.3], [0.1 * 3, 0.2 * 3, 0.3 * 3], [0.3, 0.6, 0.9], [0.1, 0.2, 0.3]);
    expect(p.kind).toBe('identical');
  });

  it('Nullvektor als Richtung ist keine Gerade', () => {
    expect(lineLine([0, 0, 0], [0, 0, 0], [1, 0, 0], [1, 0, 0]).kind).toBe('invalid');
  });

  it('Zufallsprobe: Lage stimmt mit Spatprodukt und Parallelität überein', () => {
    for (const [a, u, b, v] of seededLines(7, 300)) {
      const r = lineLine(a, u, b, v);
      if (norm(u) === 0 || norm(v) === 0) continue;
      const triple = dot(sub(b, a), cross(u, v));
      if (parallel(u, v)) expect(['parallel', 'identical']).toContain(r.kind);
      else if (Math.abs(triple) < 1e-9) expect(r.kind).toBe('intersect');
      else expect(r.kind).toBe('skew');
      expect(norm(sub(r.footH, r.footG))).toBeCloseTo(r.distance, 9);
    }
  });
});

describe('Modell: Gerade – Ebene', () => {
  it('Durchstoßpunkt: (0|0|5) + t(1|1|−1) und x₁ + x₂ + x₃ = 2 → 5 + t = 2, t = −3, D(−3|−3|8)', () => {
    const r = linePlane([0, 0, 5], [1, 1, -1], [1, 1, 1], 2);
    expect(r.kind).toBe('intersect');
    expect(r.nu).toBe(1);
    expect(r.t).toBeCloseTo(-3, 12);
    close(r.point!, [-3, -3, 8]);
    // sin φ = |n · u| / (|n| · |u|) = 1 / 3
    expect(r.angleDeg).toBeCloseTo((Math.asin(1 / 3) * 180) / Math.PI, 12);
  });

  it('parallel mit Abstand und in der Ebene liegend', () => {
    const p = linePlane([0, 0, 3], [1, -1, 0], [1, 1, 1], 2);
    expect(p.kind).toBe('parallel');
    expect(p.distance).toBeCloseTo(1 / Math.sqrt(3), 12);
    const i = linePlane([2, 0, 0], [1, -1, 0], [1, 1, 1], 2);
    expect(i.kind).toBe('inPlane');
    expect(i.distance).toBe(0);
  });

  it('senkrechte Gerade schneidet unter 90°, fast parallele unter kleinem Winkel', () => {
    expect(linePlane([1, 1, 1], [2, -1, 2], [2, -1, 2], 3).angleDeg).toBeCloseTo(90, 10);
    const r = linePlane([0, 0, 1], [4, 0, 0.5], [0, 0, 1], 0);
    expect(r.kind).toBe('intersect');
    expect(r.t).toBeCloseTo(-2, 12);
    expect(r.angleDeg).toBeCloseTo((Math.asin(0.5 / Math.hypot(4, 0.5)) * 180) / Math.PI, 12);
  });

  it('Normalenvektor 0 ist keine Ebene', () => {
    expect(linePlane([0, 0, 0], [1, 0, 0], [0, 0, 0], 1).kind).toBe('invalid');
  });
});

describe('Modell: Ebene – Ebene', () => {
  it('x₁ + x₂ + x₃ = 1 und x₁ + x₂ + x₃ = 4 parallel, Abstand 3/√3 = √3', () => {
    const r = planePlane([1, 1, 1], 1, [1, 1, 1], 4);
    expect(r.kind).toBe('parallel');
    expect(r.distance).toBeCloseTo(Math.sqrt(3), 12);
    expect(r.distance).toBeCloseTo(1.732, 3);
  });

  it('Vielfache der Gleichung sind identisch, Vielfache des Normalenvektors mit anderer Konstante parallel', () => {
    expect(planePlane([1, 1, 1], 2, [-2, -2, -2], -4).kind).toBe('identical');
    const r = planePlane([1, 1, 1], 2, [2, 2, 2], 10);
    expect(r.kind).toBe('parallel');
    expect(r.distance).toBeCloseTo(3 / Math.sqrt(3), 12);
  });

  it('x₁ = 0 und x₂ = 0 schneiden sich in der x₃-Achse unter 90°', () => {
    const r = planePlane([1, 0, 0], 0, [0, 1, 0], 0);
    expect(r.kind).toBe('intersect');
    close(r.point!, [0, 0, 0]);
    close(r.dir!, [0, 0, 1]);
    expect(r.angleDeg).toBeCloseTo(90, 12);
  });

  it('Punkt der Schnittgeraden liegt in beiden Ebenen', () => {
    const n: V3 = [2, -1, 2];
    const m: V3 = [1, 1, 0];
    const r = planePlane(n, 3, m, 1);
    expect(dot(n, r.point!)).toBeCloseTo(3, 12);
    expect(dot(m, r.point!)).toBeCloseTo(1, 12);
    expect(dot(n, r.dir!)).toBeCloseTo(0, 12);
    expect(dot(m, r.dir!)).toBeCloseTo(0, 12);
    // cos φ = |n · m| / (|n| · |m|) = 1 / (3 · √2)
    expect(r.angleDeg).toBeCloseTo((Math.acos(1 / (3 * Math.SQRT2)) * 180) / Math.PI, 12);
  });
});

describe('Modell: Abstand Punkt – Ebene (Hesse-Normalform)', () => {
  it('P(1|2|3), E: 2x₁ − x₂ + 2x₃ = 3 → d = |2 − 2 + 6 − 3| / 3 = 1, F(1/3 | 7/3 | 7/3)', () => {
    const r = pointPlane([1, 2, 3], [2, -1, 2], 3)!;
    expect(r.value).toBe(3);
    expect(r.distance).toBeCloseTo(1, 12);
    expect(r.t).toBeCloseTo(-1 / 3, 12);
    close(r.foot, [1 / 3, 7 / 3, 7 / 3]);
    // F liegt in E, PF ist parallel zu n
    expect(dot([2, -1, 2], r.foot)).toBeCloseTo(3, 12);
    expect(parallel(sub(r.foot, [1, 2, 3]), [2, -1, 2])).toBe(true);
    // Spiegelpunkt P′ = P + 2 · (F − P)
    close(r.mirror, [-1 / 3, 8 / 3, 5 / 3]);
  });

  it('Punkt in der Ebene: Abstand 0, F = P = P′', () => {
    const r = pointPlane([1, 1, 1], [2, -1, 2], 3)!;
    expect(r.onPlane).toBe(true);
    expect(r.distance).toBe(0);
    close(r.foot, [1, 1, 1]);
    close(r.mirror, [1, 1, 1]);
  });

  it('Vorzeichen zeigt die Seite der Ebene', () => {
    expect(pointPlane([0, 0, 0], [0, 0, 1], 2)!.signed).toBeCloseTo(-2, 12);
    expect(pointPlane([0, 0, 5], [0, 0, 1], 2)!.signed).toBeCloseTo(3, 12);
    expect(pointPlane([0, 0, 0], [0, 0, 0], 2)).toBeNull();
  });
});

describe('Modell: Hilfen', () => {
  it('Lotfußpunkt und Abstand Punkt – Gerade', () => {
    expect(pointLineDistance([0, 1, 1], [0, 0, 0], [1, 0, 0])).toBeCloseTo(Math.SQRT2, 12);
    close(projectOntoPlane([1, 2, 3], [2, -1, 2], 3), [1 / 3, 7 / 3, 7 / 3]);
  });

  it('Ebenen-Basis ist orthonormal und liegt in der Ebene', () => {
    for (const n of [[2, -1, 2], [0, 0, 1], [0, 0, -3], [1, 0, 0], [1, 1, 1], [0.5, 0, 4]] as V3[]) {
      const [e1, e2] = planeBasis(n);
      expect(norm(e1)).toBeCloseTo(1, 12);
      expect(norm(e2)).toBeCloseTo(1, 12);
      expect(dot(e1, e2)).toBeCloseTo(0, 12);
      expect(dot(e1, n)).toBeCloseTo(0, 12);
      expect(dot(e2, n)).toBeCloseTo(0, 12);
    }
  });

  it('Gerade im Würfel abschneiden', () => {
    expect(clipLineToBox([0, 0, 0], [1, 0, 0], 5)).toEqual([-5, 5]);
    const r = clipLineToBox([1, 1, 0], [1, 1, 0], 4)!;
    expect(r[0]).toBeCloseTo(-5, 12);
    expect(r[1]).toBeCloseTo(3, 12);
    expect(clipLineToBox([0, 6, 0], [1, 0, 0], 5)).toBeNull();
  });

  it('Koordinatenform als Text', () => {
    expect(coordForm([2, -1, 2], 3)).toBe('2x₁ − x₂ + 2x₃ = 3');
    expect(coordForm([1, 1, 1], -2)).toBe('x₁ + x₂ + x₃ = −2');
    expect(coordForm([0, -1, 0], 0)).toBe('−x₂ = 0');
    expect(coordForm([0.5, 0, -3], 1.5, (v) => String(v).replace('.', ','))).toBe('0,5x₁ − 3x₃ = 1,5');
  });
});
