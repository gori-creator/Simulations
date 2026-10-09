import { describe, expect, it } from 'vitest';
import {
  angleAt,
  dist,
  FIG_IDS,
  flagCloth,
  foot,
  lineAngleDiff,
  lineDistance,
  mapsOntoItself,
  matchAxis,
  orientation,
  placeFigure,
  reflectAcross,
  reflectPoint,
  shapeValid,
  symmetryOf,
  type FigId,
  type Pt,
} from '../src/simulations/mathematik/spiegelung/model';

const tri: Pt[] = [
  [3, 3],
  [8, 4],
  [5, 9],
];

describe('Modell: Achsenspiegelung', () => {
  it('spiegelt an einer senkrechten Achse', () => {
    expect(reflectAcross([3, 3], [10, 1], [10, 13])).toEqual([17, 3]);
    expect(reflectAcross([10, 5], [10, 1], [10, 13])).toEqual([10, 5]); // Fixpunkt auf der Achse
  });

  it('spiegelt an einer schrägen Achse (Winkelhalbierende y = x)', () => {
    const p = reflectAcross([5, 1], [0, 0], [2, 2]);
    expect(p[0]).toBeCloseTo(1, 12);
    expect(p[1]).toBeCloseTo(5, 12);
  });

  it('die Achse halbiert [PP′] und steht senkrecht darauf', () => {
    const a: Pt = [10, 1];
    const b: Pt = [12, 13];
    for (const p of tri) {
      const q = reflectAcross(p, a, b);
      const f = foot(p, a, b);
      expect(dist(p, f)).toBeCloseTo(dist(f, q), 12);
      expect(lineDistance(p, a, b)).toBeCloseTo(lineDistance(q, a, b), 12);
      // [PP′] senkrecht zur Achse
      expect((q[0] - p[0]) * (b[0] - a[0]) + (q[1] - p[1]) * (b[1] - a[1])).toBeCloseTo(0, 9);
    }
  });

  it('erhält Längen und Winkel, kehrt den Umlaufsinn um', () => {
    const a: Pt = [10, 1];
    const b: Pt = [11, 13];
    const img = tri.map((p) => reflectAcross(p, a, b));
    expect(dist(img[0]!, img[1]!)).toBeCloseTo(dist(tri[0]!, tri[1]!), 12);
    expect(angleAt(img[0]!, img[1]!, img[2]!)).toBeCloseTo(angleAt(tri[0]!, tri[1]!, tri[2]!), 9);
    expect(orientation(tri)).toBe(1);
    expect(orientation(img)).toBe(-1);
  });

  it('zweimal spiegeln ergibt wieder das Original', () => {
    const a: Pt = [2, 1];
    const b: Pt = [7, 11];
    const p: Pt = [13, 4];
    const q = reflectAcross(reflectAcross(p, a, b), a, b);
    expect(q[0]).toBeCloseTo(13, 12);
    expect(q[1]).toBeCloseTo(4, 12);
  });
});

describe('Modell: Punktspiegelung', () => {
  it('Z ist Mittelpunkt von [PP′]', () => {
    expect(reflectPoint([3, 3], [10, 7])).toEqual([17, 11]);
    expect(reflectPoint([10, 7], [10, 7])).toEqual([10, 7]); // einziger Fixpunkt
  });

  it('erhält den Umlaufsinn und macht Bildstrecken parallel', () => {
    const z: Pt = [10, 7];
    const img = tri.map((p) => reflectPoint(p, z));
    expect(orientation(img)).toBe(orientation(tri));
    const u = [tri[1]![0] - tri[0]![0], tri[1]![1] - tri[0]![1]];
    const v = [img[1]![0] - img[0]![0], img[1]![1] - img[0]![1]];
    expect(u[0]! * v[1]! - u[1]! * v[0]!).toBe(0);
  });
});

describe('Modell: Figuren', () => {
  it('Fähnchen: Tuch hängt an der Stange', () => {
    const [b, c, m] = flagCloth([4, 2], [4, 10], [8, 8]);
    expect(b).toEqual([4, 10]);
    expect(c).toEqual([8, 8]);
    expect(m[0]).toBe(4);
    expect(m[1]).toBeCloseTo(6.4, 12);
  });

  it('prüft die Gültigkeit', () => {
    expect(shapeValid('dreieck', tri)).toBe(true);
    expect(shapeValid('dreieck', [[0, 0], [2, 2], [4, 4]])).toBe(false);
    expect(shapeValid('viereck', [[0, 0], [4, 0], [4, 4], [0, 4]])).toBe(true);
    expect(shapeValid('viereck', [[0, 0], [4, 4], [4, 0], [0, 4]])).toBe(false);
  });
});

describe('Modell: Symmetrie erkennen', () => {
  const expected: Record<FigId, [number, boolean]> = {
    H: [2, true],
    T: [1, false],
    E: [1, false],
    N: [0, true],
    F: [0, false],
    dreieck: [3, false],
    parallelogramm: [0, true],
    stern: [5, false],
    windrad: [0, false],
  };

  it('findet Achsen und Zentrum – auch bei gedrehter Lage', () => {
    for (const id of FIG_IDS) {
      for (const rot of [0, 15, 90, 135]) {
        const s = symmetryOf(placeFigure(id, rot, [10, 7]));
        expect(s.axes.length, `${id} ${rot}°`).toBe(expected[id][0]);
        expect(s.center !== null, `${id} ${rot}°`).toBe(expected[id][1]);
      }
    }
  });

  it('die Achsen des H liegen waagerecht und senkrecht', () => {
    const s = symmetryOf(placeFigure('H', 0, [10, 7]));
    expect(s.axes.map((a) => a.angle)).toEqual([0, 90]);
    expect(s.center).toEqual([10, 7]);
  });

  it('erkennt gezeichnete Achsen mit Toleranz', () => {
    const s = symmetryOf(placeFigure('T', 0, [10, 7]));
    expect(matchAxis([10.2, 1], [9.9, 13], s.axes)).toBe(0);
    expect(matchAxis([2, 7], [18, 7], s.axes)).toBe(-1);
    expect(matchAxis([12, 1], [12, 13], s.axes)).toBe(-1);
    expect(lineAngleDiff(179, 1)).toBeCloseTo(2, 12);
  });

  it('ein Parallelogramm ist nicht achsensymmetrisch zu seinen Diagonalen', () => {
    const polys = placeFigure('parallelogramm', 0, [0, 0]);
    const [a, , c] = polys[0]!;
    expect(mapsOntoItself(polys, (p) => reflectAcross(p, a!, c!))).toBe(false);
  });
});
