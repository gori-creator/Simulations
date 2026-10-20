import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  altitudeFeet,
  altitudes,
  angleBisectorArcs,
  angles,
  area,
  bisectorArcs,
  bisectorFoot,
  centroid,
  circumcenter,
  circumradius,
  degenerate,
  dist,
  distToLine,
  euler,
  incenter,
  inradius,
  inside,
  isEquilateral,
  isoscelesApex,
  kind,
  largestAngle,
  medianParts,
  medians,
  midpoints,
  onSegment,
  orthocenter,
  sides,
  tipping,
  touchPoints,
  whereIs,
  type Pt,
  type Tri,
} from '../src/simulations/mathematik/besondere-linien/model';

/** Prüfdreieck aus dem Auftrag: A(0 | 0), B(6 | 0), C(2 | 4). */
const T: Tri = [
  [0, 0],
  [6, 0],
  [2, 4],
];
/** Dreieck der Grundeinstellung der Simulation. */
const t1: Tri = [
  [3, 2],
  [12.5, 2.5],
  [7, 9.5],
];
/** 3-4-5-Dreieck mit rechtem Winkel bei A. */
const R345: Tri = [
  [0, 0],
  [4, 0],
  [0, 3],
];

const close = (p: Pt | null, x: number, y: number, d = 12) => {
  expect(p).not.toBeNull();
  expect(p![0]).toBeCloseTo(x, d);
  expect(p![1]).toBeCloseTo(y, d);
};
/** Liegt q auf der Geraden durch a und b? (Kreuzprodukt ≈ 0) */
const collinear = (a: Pt, b: Pt, q: Pt) => (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);

describe('Prüfdreieck A(0 | 0), B(6 | 0), C(2 | 4)', () => {
  it('Seiten a = √32, b = √20, c = 6 und Fläche 12', () => {
    const [a, b, c] = sides(T);
    expect(a).toBeCloseTo(Math.sqrt(32), 12);
    expect(a).toBeCloseTo(5.657, 3);
    expect(b).toBeCloseTo(Math.sqrt(20), 12);
    expect(b).toBeCloseTo(4.472, 3);
    expect(c).toBeCloseTo(6, 12);
    expect(area(T)).toBeCloseTo(12, 12);
  });
  it('Schwerpunkt S = (8/3 | 4/3) ≈ (2,667 | 1,333)', () => {
    close(centroid(T), 8 / 3, 4 / 3);
  });
  it('Umkreismittelpunkt U = (3 | 1), r = √10 ≈ 3,162', () => {
    const u = circumcenter(T)!;
    close(u, 3, 1);
    expect(dist(u, T[0])).toBeCloseTo(Math.sqrt(10), 12);
    expect(dist(u, T[1])).toBeCloseTo(Math.sqrt(10), 12);
    expect(dist(u, T[2])).toBeCloseTo(Math.sqrt(10), 12);
    expect(circumradius(T)).toBeCloseTo(3.162, 3);
  });
  it('Höhenschnittpunkt H = (2 | 2); Euler: H = 3S − 2U, |HS| = 2·|SU|', () => {
    const h = orthocenter(T)!;
    close(h, 2, 2);
    const s = centroid(T);
    const u = circumcenter(T)!;
    close(h, 3 * s[0] - 2 * u[0], 3 * s[1] - 2 * u[1]);
    const e = euler(T)!;
    expect(e.hs).toBeCloseTo(2 * e.su, 12);
    expect(e.hu).toBeCloseTo(e.hs + e.su, 12);
    // |SU| = √(1/9 + 1/9) = √2 / 3
    expect(e.su).toBeCloseTo(Math.SQRT2 / 3, 12);
  });
  it('Inkreismittelpunkt ≈ (2,408 | 1,488), ρ = 12 : 8,064 ≈ 1,488', () => {
    const w = incenter(T);
    expect(w[0]).toBeCloseTo(2.408, 3);
    expect(w[1]).toBeCloseTo(1.488, 3);
    const s = (Math.sqrt(32) + Math.sqrt(20) + 6) / 2;
    expect(s).toBeCloseTo(8.064, 3);
    expect(inradius(T)).toBeCloseTo(12 / s, 12);
    expect(inradius(T)).toBeCloseTo(1.488, 3);
    // W liegt so hoch wie ρ, weil c auf der x-Achse liegt
    expect(w[1]).toBeCloseTo(inradius(T), 12);
  });
  it('Höhen: h_c = 4, h_a = 24 : √32, Flächeninhalt dreimal gleich', () => {
    const h = altitudes(T);
    expect(h[2]).toBeCloseTo(4, 12);
    expect(h[0]).toBeCloseTo(24 / Math.sqrt(32), 12);
    const [a, b, c] = sides(T);
    expect((a * h[0]) / 2).toBeCloseTo(12, 12);
    expect((b * h[1]) / 2).toBeCloseTo(12, 12);
    expect((c * h[2]) / 2).toBeCloseTo(12, 12);
    close(altitudeFeet(T)[2], 2, 0);
  });
  it('spitzwinklig: alle vier Punkte innen', () => {
    expect(kind(T)).toBe('spitz');
    for (const q of [circumcenter(T)!, incenter(T), centroid(T), orthocenter(T)!]) expect(whereIs(T, q)).toBe('innen');
  });
});

describe('rechtwinklig A(0 | 0), B(4 | 0), C(0 | 3)', () => {
  it('U = (2 | 1,5) ist die Mitte der Hypotenuse, r = 2,5 (Thaleskreis)', () => {
    const u = circumcenter(R345)!;
    close(u, 2, 1.5);
    close(u, ...midpoints(R345)[0]);
    expect(circumradius(R345)).toBeCloseTo(2.5, 12);
    expect(whereIs(R345, u)).toBe('rand');
  });
  it('H = A (Ecke mit dem rechten Winkel), ρ = (3 + 4 − 5) : 2 = 1', () => {
    const h = orthocenter(R345)!;
    close(h, 0, 0);
    expect(whereIs(R345, h)).toBe('ecke');
    expect(inradius(R345)).toBeCloseTo(1, 12);
    close(incenter(R345), 1, 1);
    expect(kind(R345)).toBe('recht');
    expect(largestAngle(R345)).toBe(0);
  });
  it('Inkreis: Berührpunkte (1 | 0), (0 | 1) und auf der Hypotenuse', () => {
    const [ta, tb, tc] = touchPoints(R345);
    close(tc, 1, 0);
    close(tb, 0, 1);
    // Tangentenabschnitte: von B aus 4 − 1 = 3, also |B T_a| = 3
    expect(dist(R345[1], ta)).toBeCloseTo(3, 12);
  });
});

describe('gleichseitig und gleichschenklig', () => {
  const h = 3 * Math.sqrt(3);
  const E: Tri = [
    [0, 0],
    [6, 0],
    [3, h],
  ];
  it('gleichseitig: S = U = H = W', () => {
    expect(isEquilateral(E)).toBe(true);
    const s = centroid(E);
    close(circumcenter(E), ...s);
    close(orthocenter(E), ...s);
    close(incenter(E), ...s);
    expect(euler(E)!.hu).toBeCloseTo(0, 12);
    // r = 2ρ, beide auf der Höhe: r = 2/3·h, ρ = 1/3·h
    expect(circumradius(E)).toBeCloseTo((2 / 3) * h, 12);
    expect(inradius(E)).toBeCloseTo(h / 3, 12);
    expect(isoscelesApex(E)).toBeNull();
  });
  it('gleichschenklig mit Spitze C: alle Punkte auf der Symmetrieachse x = 4', () => {
    const G: Tri = [
      [1, 1],
      [7, 1],
      [4, 8],
    ];
    expect(isoscelesApex(G)).toBe(2);
    for (const q of [circumcenter(G)!, incenter(G), centroid(G), orthocenter(G)!]) expect(q[0]).toBeCloseTo(4, 12);
    expect(isEquilateral(G)).toBe(false);
  });
});

describe('stumpfwinklig', () => {
  const t: Tri = [
    [2, 2.5],
    [14, 2.5],
    [5, 5.5],
  ];
  it('U und H liegen außen, W und S innen', () => {
    expect(kind(t)).toBe('stumpf');
    expect(largestAngle(t)).toBe(2);
    expect(inside(t, circumcenter(t)!)).toBe(false);
    expect(inside(t, orthocenter(t)!)).toBe(false);
    expect(whereIs(t, incenter(t))).toBe('innen');
    expect(whereIs(t, centroid(t))).toBe('innen');
    expect(angles(t).reduce((a, b) => a + b, 0)).toBeCloseTo(180, 10);
  });
  it('zwei Höhenfußpunkte liegen auf den Verlängerungen der Seiten', () => {
    const f = altitudeFeet(t);
    expect(onSegment(f[0], t[1], t[2])).toBe(false);
    expect(onSegment(f[1], t[2], t[0])).toBe(false);
    expect(onSegment(f[2], t[0], t[1])).toBe(true);
  });
  it('U liegt auf der anderen Seite der längsten Seite als C', () => {
    const u = circumcenter(t)!;
    expect(u[1]).toBeLessThan(2.5);
  });
});

describe('Grundeinstellung', () => {
  it('U ist von allen Ecken gleich weit entfernt', () => {
    const u = circumcenter(t1)!;
    expect(dist(u, t1[0])).toBeCloseTo(dist(u, t1[1]), 10);
    expect(dist(u, t1[0])).toBeCloseTo(dist(u, t1[2]), 10);
  });
  it('W ist von allen Seiten gleich weit entfernt (= ρ)', () => {
    const i = incenter(t1);
    const r = inradius(t1);
    expect(distToLine(i, t1[1], t1[2])).toBeCloseTo(r, 10);
    expect(distToLine(i, t1[2], t1[0])).toBeCloseTo(r, 10);
    expect(distToLine(i, t1[0], t1[1])).toBeCloseTo(r, 10);
    touchPoints(t1).forEach((q) => expect(dist(i, q)).toBeCloseTo(r, 10));
  });
  it('S teilt die Seitenhalbierenden im Verhältnis 2 : 1', () => {
    const s = centroid(t1);
    const m = midpoints(t1);
    for (let i = 0; i < 3; i++) expect(dist(t1[i]!, s) / dist(s, m[i]!)).toBeCloseTo(2, 10);
    medianParts(t1).forEach(([p, q], i) => {
      expect(p).toBeCloseTo(2 * q, 10);
      expect(p + q).toBeCloseTo(medians(t1)[i]!, 10);
    });
  });
  it('H liegt auf allen drei Höhen', () => {
    const h = orthocenter(t1)!;
    const feet = altitudeFeet(t1);
    for (let i = 0; i < 3; i++) expect(collinear(t1[i]!, feet[i]!, h)).toBeCloseTo(0, 9);
  });
  it('Winkelhalbierende teilt die Gegenseite im Verhältnis der anliegenden Seiten', () => {
    const f = bisectorFoot(t1, 0);
    expect(dist(t1[1], f) / dist(f, t1[2])).toBeCloseTo(dist(t1[0], t1[1]) / dist(t1[0], t1[2]), 10);
  });
});

describe('Konstruktionen mit dem Zirkel', () => {
  it('Mittelsenkrechte: S₁ und S₂ sind von beiden Endpunkten gleich weit entfernt', () => {
    const { r, s1, s2 } = bisectorArcs(T[0], T[1]);
    expect(r).toBeCloseTo(0.72 * 6, 12);
    for (const s of [s1, s2]) {
      expect(dist(s, T[0])).toBeCloseTo(r, 12);
      expect(dist(s, T[1])).toBeCloseTo(r, 12);
      expect(s[0]).toBeCloseTo(3, 12);
    }
    // U liegt auf der Geraden S₁S₂
    expect(collinear(s1, s2, circumcenter(T)!)).toBeCloseTo(0, 12);
    // S₁ liegt links von A→B (oben)
    expect(s1[1]).toBeGreaterThan(0);
  });
  it('Radius höchstens halbe Strecke wird auf knapp darüber angehoben', () => {
    const { s1, s2 } = bisectorArcs([0, 0], [4, 0], 0.3);
    expect(dist(s1, s2)).toBeLessThan(1e-2);
  });
  it('Winkelhalbierende: Raute Ecke–P₁–K–P₂, K liegt auf w und W liegt auf der Geraden', () => {
    for (const i of [0, 1, 2] as const) {
      const { p1, p2, k } = angleBisectorArcs(T, i, 1.5);
      expect(dist(T[i], p1)).toBeCloseTo(1.5, 12);
      expect(dist(T[i], p2)).toBeCloseTo(1.5, 12);
      expect(dist(p1, k)).toBeCloseTo(1.5, 12);
      expect(dist(p2, k)).toBeCloseTo(1.5, 12);
      expect(collinear(T[i], k, incenter(T))).toBeCloseTo(0, 12);
      expect(collinear(T[i], k, bisectorFoot(T, i))).toBeCloseTo(0, 12);
    }
  });
});

describe('Pappdreieck balancieren', () => {
  it('im Schwerpunkt bleibt es liegen, sonst kippt es in Richtung S', () => {
    expect(tipping(T, centroid(T)).balanced).toBe(true);
    const tp = tipping(T, [2, 1]);
    expect(tp.balanced).toBe(false);
    expect(tp.arm).toBeCloseTo(Math.hypot(2 / 3, 1 / 3), 12);
    expect(tp.dir[0]).toBeGreaterThan(0);
  });
});

describe('Plausibilität über viele Zufallsdreiecke', () => {
  const rnd = seededRandom(20261019);
  const tris: Tri[] = [];
  while (tris.length < 400) {
    const t: Tri = [
      [Math.round(rnd() * 30) / 2, Math.round(rnd() * 22) / 2],
      [Math.round(rnd() * 30) / 2, Math.round(rnd() * 22) / 2],
      [Math.round(rnd() * 30) / 2, Math.round(rnd() * 22) / 2],
    ];
    if (!degenerate(t, 0.5)) tris.push(t);
  }
  it('vier Punkte erfüllen ihre Abstandseigenschaften; Euler gilt immer', () => {
    for (const t of tris) {
      const u = circumcenter(t)!;
      const r = circumradius(t);
      for (const v of t) expect(dist(u, v) / r).toBeCloseTo(1, 9);
      const w = incenter(t);
      const rho = inradius(t);
      for (let i = 0; i < 3; i++) expect(distToLine(w, t[(i + 1) % 3]!, t[(i + 2) % 3]!) / rho).toBeCloseTo(1, 9);
      expect(whereIs(t, w, 1e-9)).toBe('innen');
      expect(inside(t, centroid(t))).toBe(true);
      const e = euler(t)!;
      expect(Math.abs(e.hs - 2 * e.su)).toBeLessThan(1e-7 * (1 + e.hu));
      // Euler'sche Formel |UW|² = r·(r − 2ρ) ⇒ r ≥ 2ρ
      expect(dist(u, w) ** 2).toBeCloseTo(r * (r - 2 * rho), 6);
      expect(r).toBeGreaterThanOrEqual(2 * rho - 1e-9);
    }
  });
  it('U liegt genau dann innen, wenn das Dreieck spitzwinklig ist (ebenso H)', () => {
    for (const t of tris) {
      const k = kind(t, 1e-9);
      const wu = whereIs(t, circumcenter(t)!, 1e-9);
      const wh = whereIs(t, orthocenter(t)!, 1e-9);
      if (k === 'spitz') {
        expect(wu).toBe('innen');
        expect(wh).toBe('innen');
      } else if (k === 'stumpf') {
        expect(wu).toBe('aussen');
        expect(wh).toBe('aussen');
      } else {
        expect(wu).toBe('rand');
        expect(wh).toBe('ecke');
      }
    }
  });
});
