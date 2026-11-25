import { describe, expect, it } from 'vitest';
import { circleCircle, fromGeneral, generalForm, lineCircle, pointPosition, tangentAt, tangentPoints } from '../src/simulations/mathematik/kreisgleichung/model';

const onCircle = (a: number, b: number, r: number, p: [number, number]) => Math.hypot(p[0] - a, p[1] - b) - r;

describe('Kreisgleichung', () => {
  it('rechnet zwischen Mittelpunktsform und allgemeiner Form um', () => {
    const g = generalForm(2, -3, 4);
    expect(g).toEqual({ D: -4, E: 6, F: -3 });
    const back = fromGeneral(g.D, g.E, g.F)!;
    expect(back.a).toBeCloseTo(2);
    expect(back.b).toBeCloseTo(-3);
    expect(back.r).toBeCloseTo(4);
    expect(fromGeneral(0, 0, 1)).toBeNull();
  });

  it('bestimmt die Lage eines Punktes', () => {
    expect(pointPosition(0, 0, 5, 3, 4).pos).toBe('on');
    expect(pointPosition(0, 0, 5, 1, 1).pos).toBe('in');
    expect(pointPosition(1, 1, 2, 4, 4).pos).toBe('out');
  });

  it('schneidet Kreis und Gerade', () => {
    const s = lineCircle(0, 0, 5, 0, 3);
    expect(s.kind).toBe('secant');
    expect(s.points.map((p) => p[0]).sort((u, v) => u - v)).toEqual([-4, 4]);
    expect(lineCircle(0, 0, 5, 0, 5).kind).toBe('tangent');
    expect(lineCircle(0, 0, 5, 0, 6).kind).toBe('passant');
    const t = lineCircle(1, 2, 3, 1, 0);
    expect(t.d).toBeCloseTo(Math.abs(1 - 2) / Math.SQRT2);
    for (const p of t.points) expect(onCircle(1, 2, 3, p)).toBeCloseTo(0);
  });

  it('bestimmt die Lage zweier Kreise', () => {
    expect(circleCircle(0, 0, 2, 5, 0, 2).kind).toBe('apart');
    expect(circleCircle(0, 0, 2, 4, 0, 2).kind).toBe('touchOut');
    expect(circleCircle(0, 0, 5, 2, 0, 3).kind).toBe('touchIn');
    expect(circleCircle(0, 0, 5, 1, 0, 2).kind).toBe('inside');
    expect(circleCircle(0, 0, 2, 0, 0, 1).kind).toBe('concentric');
    const c = circleCircle(0, 0, 5, 6, 0, 5);
    expect(c.kind).toBe('cut');
    expect(c.points).toHaveLength(2);
    for (const p of c.points) {
      expect(onCircle(0, 0, 5, p)).toBeCloseTo(0);
      expect(onCircle(6, 0, 5, p)).toBeCloseTo(0);
    }
  });

  it('findet Tangenten von einem Punkt aus', () => {
    expect(tangentPoints(0, 0, 2, 0.5, 0)).toHaveLength(0);
    expect(tangentPoints(0, 0, 5, 3, 4)).toHaveLength(1);
    const ts = tangentPoints(1, -1, 2, 6, 3);
    expect(ts).toHaveLength(2);
    for (const t of ts) {
      expect(onCircle(1, -1, 2, t)).toBeCloseTo(0);
      // Radius ⟂ Tangente: (T − M) · (P − T) = 0
      expect((t[0] - 1) * (6 - t[0]) + (t[1] + 1) * (3 - t[1])).toBeCloseTo(0);
    }
    const tl = tangentAt(0, 0, [3, 4]);
    expect(tl.vertical).toBe(false);
    if (!tl.vertical) {
      expect(tl.k).toBeCloseTo(-0.75);
      expect(tl.c).toBeCloseTo(6.25);
    }
    expect(tangentAt(0, 0, [5, 0])).toEqual({ vertical: true, c: 5 });
  });
});
