import { describe, expect, it } from 'vitest';
import {
  armDistances,
  bisectorDir,
  circleIntersections,
  circumcenter,
  clampToField,
  closer,
  collinear,
  constructAngleBisector,
  constructBisector,
  decimalsToTell,
  dist,
  distToRay,
  footOnRay,
  inField,
  latticeOnBisector,
  lineIntersection,
  meetingPoint,
  perpBisector,
  triangleKind,
  type Angle,
  type Pt,
} from '../src/simulations/mathematik/mittelsenkrechte/model';

describe('Modell: Mittelsenkrechte', () => {
  const A: Pt = [4, 5];
  const B: Pt = [12, 9];

  it('geht durch den Mittelpunkt und steht senkrecht auf [AB]', () => {
    const { m, d } = perpBisector(A, B);
    expect(m).toEqual([8, 7]);
    expect(d[0] * (B[0] - A[0]) + d[1] * (B[1] - A[1])).toBeCloseTo(0, 12);
    expect(Math.hypot(d[0], d[1])).toBeCloseTo(1, 12);
  });

  it('jeder Punkt auf m ist von A und B gleich weit entfernt', () => {
    const { m, d } = perpBisector(A, B);
    for (const t of [-5, -1.3, 0, 2, 7.7]) {
      const p: Pt = [m[0] + t * d[0], m[1] + t * d[1]];
      expect(dist(p, A)).toBeCloseTo(dist(p, B), 10);
    }
  });

  it('entscheidet „näher an A / B / gleich weit“ exakt auf dem Gitter', () => {
    expect(closer([8, 7], A, B)).toBe('equal');
    expect(closer([9, 5], A, B)).toBe('equal'); // 2x + y = 23
    expect(closer([5, 5], A, B)).toBe('A');
    expect(closer([12, 3], A, B)).toBe('B');
  });

  it('findet die Gitterpunkte auf der Mittelsenkrechten (2x + y = 23)', () => {
    const pts = latticeOnBisector(A, B);
    expect(pts.length).toBeGreaterThan(4);
    for (const [x, y] of pts) expect(2 * x + y).toBe(23);
  });

  it('Zirkelkonstruktion: Schnittpunkte der Bögen liegen auf m', () => {
    const c = constructBisector(A, B);
    expect(c.r).toBeGreaterThan(dist(A, B) / 2);
    for (const s of [c.s1, c.s2]) {
      expect(dist(s, A)).toBeCloseTo(c.r, 10);
      expect(dist(s, B)).toBeCloseTo(c.r, 10);
    }
    // M liegt zwischen S₁ und S₂ auf deren Verbindung
    expect(dist(c.s1, c.m) + dist(c.m, c.s2)).toBeCloseTo(dist(c.s1, c.s2), 10);
  });

  it('Kreisschnitt: berühren, schneiden, keine Schnittpunkte', () => {
    expect(circleIntersections([0, 0], 1, [2, 0], 1)).toEqual([[1, 0]]);
    expect(circleIntersections([0, 0], 1, [5, 0], 1)).toEqual([]);
    expect(circleIntersections([0, 0], 2, [2, 0], 2)).toHaveLength(2);
  });
});

describe('Modell: Winkelhalbierende', () => {
  const an: Angle = { s: [3, 2], th1: 10, al: 70 };

  it('teilt den Winkel in zwei gleiche Hälften', () => {
    expect(bisectorDir(an)).toBe(45);
  });

  it('Punkte auf w sind von beiden Schenkeln gleich weit entfernt', () => {
    const u = [Math.cos((45 * Math.PI) / 180), Math.sin((45 * Math.PI) / 180)];
    for (const t of [0.5, 3, 9]) {
      const [d1, d2] = armDistances([3 + t * u[0]!, 2 + t * u[1]!], an);
      expect(d1).toBeCloseTo(d2, 10);
    }
    const [e1, e2] = armDistances([9, 3], an);
    expect(e1).toBeLessThan(e2);
  });

  it('Winkelfeld: innen, außen, auf den Rand holen', () => {
    expect(inField([8, 6], an)).toBe(true);
    expect(inField([1, 6], an)).toBe(false);
    const q = clampToField([1, 9], an);
    expect(inField(q, an)).toBe(true);
  });

  it('Zirkelkonstruktion: W liegt auf der Winkelhalbierenden, |P₁W| = |P₂W|', () => {
    for (const al of [40, 90, 150, 180]) {
      const a: Angle = { s: [3, 2], th1: 20, al };
      const c = constructAngleBisector(a, 4);
      expect(dist(c.p1, c.w)).toBeCloseTo(c.r2, 9);
      expect(dist(c.p2, c.w)).toBeCloseTo(c.r2, 9);
      const [d1, d2] = armDistances(c.w, a);
      expect(d1).toBeCloseTo(d2, 9);
      expect(dist(a.s, c.w)).toBeGreaterThan(0.5);
    }
  });
});

describe('Modell: Abstand von einem Schenkel (Halbgerade)', () => {
  it('Lot, wenn der Fußpunkt auf dem Schenkel liegt, sonst Abstand zum Scheitel', () => {
    expect(distToRay([4, 3], [0, 0], [1, 0])).toBeCloseTo(3, 12);
    expect(footOnRay([-4, 3], [0, 0], [1, 0])).toEqual([0, 0]);
    expect(distToRay([-4, 3], [0, 0], [1, 0])).toBeCloseTo(5, 12);
  });

  it('gestreckter Winkel (180°): nur die Senkrechte in S ist gleich weit von beiden Schenkeln', () => {
    const an: Angle = { s: [10, 3], th1: 0, al: 180 };
    expect(bisectorDir(an)).toBe(90);
    const [a1, a2] = armDistances([10, 7], an);
    expect(a1).toBeCloseTo(4, 12);
    expect(a2).toBeCloseTo(4, 12);
    const [b1, b2] = armDistances([13, 7], an);
    expect(b1).toBeCloseTo(4, 12); // Lot auf [SA
    expect(b2).toBeCloseTo(5, 12); // Fußpunkt läge hinter S: Abstand zu S
  });

  it('stumpfer Winkel: Punkte im Winkelfeld mit gleichen Abständen liegen auf w', () => {
    const an: Angle = { s: [8, 2], th1: 330, al: 150 };
    const u = [Math.cos((45 * Math.PI) / 180), Math.sin((45 * Math.PI) / 180)];
    expect(bisectorDir(an)).toBe(405);
    for (const t of [1, 4, 7]) {
      const [d1, d2] = armDistances([8 + t * u[0]!, 2 + t * u[1]!], an);
      expect(d1).toBeCloseTo(d2, 10);
    }
  });
});

describe('Modell: Treffpunkt an der Straße', () => {
  const A: Pt = [4, 9];
  const B: Pt = [15, 12];

  it('Schnittpunkt zweier Geraden; parallele Geraden haben keinen', () => {
    expect(lineIntersection([0, 0], [1, 1], [4, 0], [0, 1])).toEqual([4, 4]);
    expect(lineIntersection([0, 0], [1, 2], [3, 0], [2, 4])).toBeNull();
  });

  it('T liegt auf der Straße und ist von A und B gleich weit entfernt', () => {
    const mt = meetingPoint(A, B, [0, 3], [20, 5]);
    expect(mt.kind).toBe('point');
    if (mt.kind !== 'point') return;
    const [x, y] = mt.t;
    expect(y).toBeCloseTo(3 + 0.1 * x, 10); // auf der Straße y = 3 + 0,1·x
    expect(dist(mt.t, A)).toBeCloseTo(dist(mt.t, B), 10);
    expect(x).toBeCloseTo(11.2389, 3);
    expect(y).toBeCloseTo(4.1239, 3);
  });

  it('Straße senkrecht zu [AB]: parallel zur Mittelsenkrechten, kein Treffpunkt', () => {
    // AB hat die Richtung (11 | 3), die Straße die Richtung (−3 | 11)
    expect(meetingPoint(A, B, [12, 0], [9, 11]).kind).toBe('none');
  });

  it('Straße ist die Mittelsenkrechte: jeder Punkt passt', () => {
    expect(meetingPoint([6, 8], [14, 8], [10, 0], [10, 14]).kind).toBe('all');
  });
});

describe('Modell: Anzeige der Längen', () => {
  it('eine Nachkommastelle, außer zwei verschiedene Längen sähen sonst gleich aus', () => {
    expect(decimalsToTell(1.6, 3.5, false)).toBe(1);
    expect(decimalsToTell(2.5, 2.5, true)).toBe(1);
    expect(decimalsToTell(3.162, 3.17, false)).toBe(2);
    expect(decimalsToTell(3.1621, 3.1624, false)).toBe(3);
  });
});

describe('Modell: Ausblick Umkreis', () => {
  it('der Umkreismittelpunkt ist von allen Ecken gleich weit entfernt', () => {
    const a: Pt = [3, 2];
    const b: Pt = [15, 4];
    const c: Pt = [8, 12];
    const u = circumcenter(a, b, c)!;
    expect(dist(u, a)).toBeCloseTo(dist(u, b), 10);
    expect(dist(u, a)).toBeCloseTo(dist(u, c), 10);
  });

  it('rechtwinkliges Dreieck: U ist der Mittelpunkt der Hypotenuse (Thales)', () => {
    const u = circumcenter([2, 2], [10, 2], [2, 8])!;
    expect(u[0]).toBeCloseTo(6, 12);
    expect(u[1]).toBeCloseTo(5, 12);
    expect(triangleKind([2, 2], [10, 2], [2, 8])).toBe('recht');
  });

  it('Dreiecksarten und Sonderfälle', () => {
    expect(triangleKind([0, 0], [10, 0], [5, 6])).toBe('spitz');
    expect(triangleKind([0, 0], [10, 0], [2, 2])).toBe('stumpf');
    expect(circumcenter([0, 0], [2, 2], [4, 4])).toBeNull();
    expect(collinear([0, 0], [2, 2], [4, 4])).toBe(true);
  });
});

describe('Prüfrunde Paket 2: nachgerechnete Werte und Sonderfälle', () => {
  it('A(1|1), B(7|1): Mittelsenkrechte x = 4 durch M(4|1)', () => {
    const { m, d } = perpBisector([1, 1], [7, 1]);
    expect(m).toEqual([4, 1]);
    expect(Math.abs(d[0])).toBeCloseTo(0, 12);
    expect(Math.abs(d[1])).toBeCloseTo(1, 12);
    for (const y of [-3, 0, 5, 14]) expect(closer([4, y], [1, 1], [7, 1])).toBe('equal');
    expect(closer([3, 5], [1, 1], [7, 1])).toBe('A');
  });

  it('A(0|0), B(4|4): Mittelsenkrechte y = −x + 4', () => {
    const { m, d } = perpBisector([0, 0], [4, 4]);
    expect(m).toEqual([2, 2]);
    expect(d[1] / d[0]).toBeCloseTo(-1, 12); // Steigung −1
    expect(latticeOnBisector([0, 0], [4, 4])).toEqual([
      [0, 4],
      [1, 3],
      [2, 2],
      [3, 1],
      [4, 0],
    ]);
  });

  it('Winkel 60°: Halbierende bei 30°, Punkte darauf mit gleich langen Loten', () => {
    const an: Angle = { s: [0, 0], th1: 0, al: 60 };
    expect(bisectorDir(an)).toBe(30);
    // P = (√3 | 1) liegt bei 30° und hat zu beiden Schenkeln den Abstand 1
    const [d1, d2] = armDistances([Math.sqrt(3), 1], an);
    expect(d1).toBeCloseTo(1, 12);
    expect(d2).toBeCloseTo(1, 12);
  });

  it('Zirkelradius: nur bei r > |AB|/2 zwei Schnittpunkte, bei r = |AB|/2 nur M', () => {
    const A: Pt = [0, 0];
    const B: Pt = [12, 0]; // 6 cm
    expect(circleIntersections(A, 5, B, 5)).toEqual([]); // 2,5 cm: zu klein (Aufgabe 2)
    expect(circleIntersections(A, 6, B, 6)).toEqual([[6, 0]]); // 3 cm: Bögen berühren sich in M
    const s = circleIntersections(A, 8, B, 8); // 4 cm
    expect(s).toHaveLength(2);
    for (const q of s) expect(q[0]).toBeCloseTo(6, 12);
    // kleinster Faktor der Simulation: Radius immer größer als die halbe Strecke
    const c = constructBisector(A, B, 0.56);
    expect(c.r).toBeCloseTo(6.72, 12);
    expect(dist(c.s1, A)).toBeCloseTo(dist(c.s2, B), 12);
  });

  it('Aufgaben 1, 4 und 6 des Lernmaterials', () => {
    // Aufgabe 1: |PA| = |PB| = 5 Kästchen = 2,5 cm; Q ist näher an B
    expect(dist([7, 9], [4, 5])).toBe(5);
    expect(dist([7, 9], [12, 9])).toBe(5);
    expect(closer([9, 6], [4, 5], [12, 9])).toBe('B');
    // Aufgabe 4: |TA| = |TB| ≈ 8,728 Kästchen ≈ 4,4 cm
    const mt = meetingPoint([4, 9], [15, 12], [0, 3], [20, 5]);
    if (mt.kind !== 'point') throw new Error('kein Treffpunkt');
    expect(dist(mt.t, [4, 9]) / 2).toBeCloseTo(4.364, 3);
    // Aufgabe 6: U = (94,5/11 | 60/11) ≈ (8,6 | 5,5), r ≈ 3,3 cm
    const u = circumcenter([3, 2], [15, 4], [8, 12])!;
    expect(u[0]).toBeCloseTo(94.5 / 11, 10);
    expect(u[1]).toBeCloseTo(60 / 11, 10);
    expect(dist(u, [3, 2]) / 2).toBeCloseTo(3.286, 3);
  });
});
