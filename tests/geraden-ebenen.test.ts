import { describe, expect, it } from 'vitest';
import {
  clipLineToBox,
  coordinateFormText,
  cross,
  dot,
  linePoint,
  lineTrace,
  lineTraces,
  planeBoxPolygon,
  planeForms,
  planeIntercepts,
  planePoint,
  probeLine,
  probePlane,
  simplifyNormal,
  solvePlaneParams,
  traceLine,
  traceTriangle,
  type V3,
} from '../src/simulations/mathematik/geraden-ebenen/model';

const num = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');
const close = (a: V3, b: V3, d = 12) => a.forEach((x, i) => expect(x).toBeCloseTo(b[i]!, d));

/** Kleiner reproduzierbarer Zufall. */
function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s / 2147483647) * 10 - 5;
  };
}

describe('Modell: Gerade in Parameterform', () => {
  const a: V3 = [1, 2, 3];
  const u: V3 = [2, -1, 1];

  it('g: x = (1|2|3) + t·(2|−1|1), t = 2 → X(5|0|5)', () => {
    expect(linePoint(a, u, 2)).toEqual([5, 0, 5]);
    expect(linePoint(a, u, 0)).toEqual([1, 2, 3]);
  });

  it('Punktprobe: P(5|0|5) liegt auf g (t = 2), Q(3|1|5) nicht', () => {
    const p = probeLine(a, u, [5, 0, 5]);
    expect(p.on).toBe(true);
    expect(p.t).toBe(2);
    expect(p.comps).toEqual([
      { kind: 't', t: 2 },
      { kind: 't', t: 2 },
      { kind: 't', t: 2 },
    ]);
    const q = probeLine(a, u, [3, 1, 5]);
    expect(q.on).toBe(false);
    expect(q.t).toBeNull();
    expect(q.comps.map((c) => (c.kind === 't' ? c.t : NaN))).toEqual([1, 1, 2]);
  });

  it('Punktprobe mit uᵢ = 0: feste Koordinate muss passen', () => {
    // g: x = (2|3|0) + t·(0|0|1) – parallel zur x₃-Achse
    expect(probeLine([2, 3, 0], [0, 0, 1], [2, 3, 7]).on).toBe(true);
    expect(probeLine([2, 3, 0], [0, 0, 1], [2, 3, 7]).t).toBe(7);
    const r = probeLine([2, 3, 0], [0, 0, 1], [2, 4, 7]);
    expect(r.on).toBe(false);
    expect(r.comps[1]).toEqual({ kind: 'fixed', ok: false });
  });

  it('Spurpunkte von g mit den Koordinatenebenen', () => {
    const [s12, s23, s13] = lineTraces(a, u);
    expect(s12).toEqual({ kind: 'point', t: -3, p: [-5, 5, 0] });
    expect(s23).toEqual({ kind: 'point', t: -0.5, p: [0, 2.5, 2.5] });
    expect(s13).toEqual({ kind: 'point', t: 2, p: [5, 0, 5] });
  });

  it('Gerade parallel zu einer Koordinatenebene → dort kein Spurpunkt', () => {
    // u₃ = 0: g ∥ x₁x₂-Ebene
    expect(lineTrace([1, 2, 3], [1, 1, 0], 2)).toEqual({ kind: 'parallel' });
    // liegt in der x₁x₂-Ebene
    expect(lineTrace([1, 2, 0], [1, 1, 0], 2)).toEqual({ kind: 'inside' });
    // parallel zur x₃-Achse: nur ein Spurpunkt (mit der x₁x₂-Ebene)
    const tr = lineTraces([2, 3, 1], [0, 0, 1]);
    expect(tr.map((x) => x.kind)).toEqual(['point', 'parallel', 'parallel']);
    expect((tr[0] as { p: V3 }).p).toEqual([2, 3, 0]);
  });

  it('Zuschneiden auf den Würfel [−5, 5]³', () => {
    const r = clipLineToBox(a, u, -5, 5)!;
    // x₁ = 1 + 2t ∈ [−5, 5] → t ∈ [−3, 2]; x₂ = 2 − t → t ∈ [−3, 7]; x₃ = 3 + t → t ∈ [−8, 2]
    expect(r[0]).toBeCloseTo(-3, 12);
    expect(r[1]).toBeCloseTo(2, 12);
    expect(clipLineToBox([9, 0, 0], [0, 1, 0], -5, 5)).toBeNull();
    expect(clipLineToBox([0, 0, 0], [0, 0, 0], -5, 5)).toBeNull();
  });
});

describe('Modell: Ebene, Normalenvektor, Koordinatenform', () => {
  it('Kreuzprodukt (1|0|0) × (0|1|0) = (0|0|1)', () => {
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });

  it('u × v steht senkrecht auf u und v (Zufallswerte)', () => {
    const r = rand(7);
    for (let k = 0; k < 200; k++) {
      const u: V3 = [r(), r(), r()];
      const v: V3 = [r(), r(), r()];
      const n = cross(u, v);
      expect(dot(n, u)).toBeCloseTo(0, 9);
      expect(dot(n, v)).toBeCloseTo(0, 9);
      // Punkte der Ebene erfüllen die Koordinatenform
      const a: V3 = [r(), r(), r()];
      const f = planeForms(a, u, v);
      if (!f.ok) continue;
      const x = planePoint(a, u, v, r(), r());
      expect(probePlane(f.n, f.d, x).on).toBe(true);
    }
  });

  it('E: x = (1|0|0) + r·(−1|1|0) + s·(−1|0|1) → n = (1|1|1), x₁ + x₂ + x₃ = 1', () => {
    const f = planeForms([1, 0, 0], [-1, 1, 0], [-1, 0, 1]);
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    expect(f.raw).toEqual([1, 1, 1]);
    expect(f.n).toEqual([1, 1, 1]);
    expect(f.d).toBe(1);
    expect(coordinateFormText(f.n, f.d, num)).toBe('x₁ + x₂ + x₃ = 1');
    const s = planeIntercepts(f.n, f.d);
    expect(s).toEqual([
      { kind: 'point', p: [1, 0, 0] },
      { kind: 'point', p: [0, 1, 0] },
      { kind: 'point', p: [0, 0, 1] },
    ]);
    expect(traceTriangle(f.n, f.d)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  it('E: 2x₁ + 3x₂ + 6x₃ = 12 → Spurpunkte (6|0|0), (0|4|0), (0|0|2)', () => {
    expect(traceTriangle([2, 3, 6], 12)).toEqual([
      [6, 0, 0],
      [0, 4, 0],
      [0, 0, 2],
    ]);
    // dieselbe Ebene aus der Parameterform
    const f = planeForms([6, 0, 0], [-3, 2, 0], [-3, 0, 1]);
    expect(f.ok && f.n).toEqual([2, 3, 6]);
    expect(f.ok && f.d).toBe(12);
    expect(f.ok && coordinateFormText(f.n, f.d, num)).toBe('2x₁ + 3x₂ + 6x₃ = 12');
  });

  it('Punktprobe Ebene: n · x = d', () => {
    expect(probePlane([2, 3, 6], 12, [3, 0, 1])).toEqual({ value: 12, on: true });
    expect(probePlane([2, 3, 6], 12, [5, 0, 5])).toEqual({ value: 40, on: false });
    expect(probePlane([1, 1, 1], 1, [0.5, 0.25, 0.25]).on).toBe(true);
  });

  it('Normalenvektor kürzen: (9|9|9) → (1|1|1), d = 3', () => {
    expect(simplifyNormal([9, 9, 9])).toEqual({ n: [1, 1, 1], factor: 9 });
    expect(simplifyNormal([0, 0, 4])).toEqual({ n: [0, 0, 1], factor: 4 });
    expect(simplifyNormal([2, 3, 6])).toEqual({ n: [2, 3, 6], factor: 1 });
    expect(simplifyNormal([0.5, 1, 1]).factor).toBe(1);
    // Erste Komponente negativ: Vorzeichen umdrehen, damit die Koordinatenform positiv beginnt
    expect(simplifyNormal([-1, -5, -3])).toEqual({ n: [1, 5, 3], factor: -1 });
    expect(simplifyNormal([0, -4, 2])).toEqual({ n: [0, 2, -1], factor: -2 });
    expect(simplifyNormal([-0.5, 1, 1])).toEqual({ n: [0.5, -1, -1], factor: -1 });
    const f = planeForms([3, 0, 0], [-3, 3, 0], [-3, 0, 3]);
    expect(f.ok && f.raw).toEqual([9, 9, 9]);
    expect(f.ok && f.n).toEqual([1, 1, 1]);
    expect(f.ok && f.d).toBe(3);
  });

  it('parallele Richtungsvektoren → keine Ebene', () => {
    expect(planeForms([0, 0, 0], [1, 2, 0], [2, 4, 0])).toEqual({ ok: false, reason: 'parallel' });
    expect(planeForms([0, 0, 0], [1, 2, 0], [-0.5, -1, 0])).toEqual({ ok: false, reason: 'parallel' });
    expect(planeForms([0, 0, 0], [0, 0, 0], [1, 0, 0])).toEqual({ ok: false, reason: 'zero' });
  });

  it('Ebene parallel zur x₁x₂-Ebene: x₃ = 3 → nur ein Spurpunkt', () => {
    const f = planeForms([0, 0, 3], [2, 0, 0], [0, 2, 0]);
    expect(f.ok && f.n).toEqual([0, 0, 1]);
    expect(f.ok && f.d).toBe(3);
    expect(f.ok && coordinateFormText(f.n, f.d, num)).toBe('x₃ = 3');
    expect(planeIntercepts([0, 0, 1], 3).map((s) => s.kind)).toEqual(['none', 'none', 'point']);
    expect(traceTriangle([0, 0, 1], 3)).toBeNull();
    // Spurgerade mit der x₁x₂-Ebene gibt es nicht, mit x₂x₃: x₃ = 3, x₁ = 0
    expect(traceLine([0, 0, 1], 3, 2)).toBeNull();
    const t = traceLine([0, 0, 1], 3, 0)!;
    expect(t.p).toEqual([0, 0, 3]);
    expect(dot(t.dir, [0, 0, 1])).toBe(0);
  });

  it('Ebene durch den Ursprung: kein Spurdreieck', () => {
    expect(traceTriangle([1, 1, 1], 0)).toBeNull();
    expect(planeIntercepts([1, -1, 0], 0).map((s) => s.kind)).toEqual(['point', 'point', 'contains']);
  });

  it('Spurgeraden liegen in Ebene und Koordinatenebene', () => {
    for (const zero of [0, 1, 2]) {
      const t = traceLine([2, 3, 6], 12, zero)!;
      for (const k of [-2, 0, 1.5]) {
        const x: V3 = [t.p[0] + k * t.dir[0], t.p[1] + k * t.dir[1], t.p[2] + k * t.dir[2]];
        expect(dot([2, 3, 6], x)).toBeCloseTo(12, 10);
        expect(x[zero]).toBeCloseTo(0, 12);
      }
    }
  });

  it('Koordinatenform-Text mit negativen und fehlenden Koeffizienten', () => {
    expect(coordinateFormText([1, 0, -1], 0, num)).toBe('x₁ − x₃ = 0');
    expect(coordinateFormText([-2, 1.5, 0], -4, num)).toBe('−2x₁ + 1,5x₂ = −4');
  });

  it('Schnittvieleck mit dem Würfel', () => {
    // x₃ = 3 im Würfel [−5, 5]³: Quadrat
    const sq = planeBoxPolygon([0, 0, 1], 3, -5, 5);
    expect(sq).toHaveLength(4);
    sq.forEach((q) => expect(q[2]).toBeCloseTo(3, 12));
    // x₁ + x₂ + x₃ = 0: Sechseck
    const hex = planeBoxPolygon([1, 1, 1], 0, -5, 5);
    expect(hex).toHaveLength(6);
    hex.forEach((q) => expect(q[0] + q[1] + q[2]).toBeCloseTo(0, 10));
    // verfehlt den Würfel
    expect(planeBoxPolygon([1, 1, 1], 40, -5, 5)).toEqual([]);
  });

  it('r und s aus einem Punkt der Ebene zurückrechnen', () => {
    const a: V3 = [6, 0, 0];
    const u: V3 = [-3, 2, 0];
    const v: V3 = [-3, 0, 1];
    const x = planePoint(a, u, v, 0.5, 1.25);
    const rs = solvePlaneParams(a, u, v, x)!;
    expect(rs.r).toBeCloseTo(0.5, 12);
    expect(rs.s).toBeCloseTo(1.25, 12);
    close(planePoint(a, u, v, rs.r, rs.s), x);
    expect(solvePlaneParams(a, [1, 2, 0], [2, 4, 0], x)).toBeNull();
  });
});
