import { describe, expect, it } from 'vitest';
import { altitudeFeet, angles, bisectorFoot, centroid, circumcenter, dist, distToLine, incenter, inradius, inside, kind, midpoints, onSegment, orthocenter, touchPoints, type Tri } from '../src/simulations/mathematik/besondere-linien/model';

const t1: Tri = [
  [3, 2],
  [12.5, 2.5],
  [7, 9.5],
];

describe('Modell: Besondere Linien im Dreieck', () => {
  it('U ist von allen Ecken gleich weit entfernt', () => {
    const u = circumcenter(t1)!;
    expect(dist(u, t1[0])).toBeCloseTo(dist(u, t1[1]), 10);
    expect(dist(u, t1[0])).toBeCloseTo(dist(u, t1[2]), 10);
  });
  it('I ist von allen Seiten gleich weit entfernt (= ρ)', () => {
    const i = incenter(t1);
    const r = inradius(t1);
    expect(distToLine(i, t1[1], t1[2])).toBeCloseTo(r, 10);
    expect(distToLine(i, t1[2], t1[0])).toBeCloseTo(r, 10);
    expect(distToLine(i, t1[0], t1[1])).toBeCloseTo(r, 10);
    touchPoints(t1).forEach((q) => expect(dist(i, q)).toBeCloseTo(r, 10));
  });
  it('3-4-5-Dreieck: ρ = 1, r = 2,5, H in der Ecke mit dem rechten Winkel', () => {
    const t: Tri = [
      [0, 0],
      [4, 0],
      [0, 3],
    ];
    expect(inradius(t)).toBeCloseTo(1, 12);
    const u = circumcenter(t)!;
    expect(u[0]).toBeCloseTo(2, 12);
    expect(u[1]).toBeCloseTo(1.5, 12);
    const h = orthocenter(t)!;
    expect(h[0]).toBeCloseTo(0, 12);
    expect(h[1]).toBeCloseTo(0, 12);
    expect(kind(t)).toBe('recht');
  });
  it('S teilt die Seitenhalbierenden im Verhältnis 2 : 1', () => {
    const s = centroid(t1);
    const m = midpoints(t1);
    for (let i = 0; i < 3; i++) expect(dist(t1[i]!, s) / dist(s, m[i]!)).toBeCloseTo(2, 10);
  });
  it('H liegt auf allen drei Höhen', () => {
    const h = orthocenter(t1)!;
    const feet = altitudeFeet(t1);
    for (let i = 0; i < 3; i++) {
      const v = t1[i]!;
      const f = feet[i]!;
      // H, Ecke und Fußpunkt liegen auf einer Geraden
      const cr = (f[0] - v[0]) * (h[1] - v[1]) - (f[1] - v[1]) * (h[0] - v[0]);
      expect(cr).toBeCloseTo(0, 9);
    }
  });
  it('Euler-Gerade: |HS| = 2·|SU|, S liegt zwischen H und U', () => {
    const u = circumcenter(t1)!;
    const s = centroid(t1);
    const h = orthocenter(t1)!;
    expect(dist(h, s)).toBeCloseTo(2 * dist(s, u), 10);
    expect(dist(h, u)).toBeCloseTo(dist(h, s) + dist(s, u), 10);
  });
  it('stumpfwinklig: U und H liegen außen, Höhenfußpunkt auf der Verlängerung', () => {
    const t: Tri = [
      [2, 2.5],
      [14, 2.5],
      [5, 5.5],
    ];
    expect(kind(t)).toBe('stumpf');
    expect(inside(t, circumcenter(t)!)).toBe(false);
    expect(inside(t, orthocenter(t)!)).toBe(false);
    expect(inside(t, incenter(t))).toBe(true);
    const f = altitudeFeet(t);
    expect(onSegment(f[0], t[1], t[2])).toBe(false);
    expect(angles(t).reduce((a, b) => a + b, 0)).toBeCloseTo(180, 10);
  });
  it('Winkelhalbierende teilt die Gegenseite im Verhältnis der anliegenden Seiten', () => {
    const f = bisectorFoot(t1, 0);
    expect(dist(t1[1], f) / dist(f, t1[2])).toBeCloseTo(dist(t1[0], t1[1]) / dist(t1[0], t1[2]), 10);
  });
});
