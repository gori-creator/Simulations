import { describe, expect, it } from 'vitest';
import { circleBase, polygonBase, regularPolygon, rollCircle, rollPolygon, slices, solid, triangleBase, type Pt } from '../src/simulations/mathematik/prisma-zylinder/model';

const signedArea = (pts: readonly Pt[]) => pts.reduce((s, p, i) => s + (p[0] * pts[(i + 1) % pts.length]![1] - pts[(i + 1) % pts.length]![0] * p[1]) / 2, 0);

describe('Grundflächen', () => {
  it('berechnet Dreieck, Sechseck und Kreis', () => {
    const t = triangleBase(4, 3);
    expect(t.area).toBe(6);
    expect(t.perimeter).toBeCloseTo(4 + 2 * Math.hypot(2, 3), 12);
    expect(signedArea(t.points)).toBeCloseTo(6, 12);
    const hex = polygonBase(6, 2);
    expect(hex.area).toBeCloseTo(6 * Math.sqrt(3), 12);
    expect(hex.perimeter).toBeCloseTo(12, 12);
    expect(signedArea(hex.points)).toBeCloseTo(hex.area, 12);
    expect(circleBase(2).area).toBeCloseTo(4 * Math.PI, 12);
    expect(circleBase(2).perimeter).toBeCloseTo(4 * Math.PI, 12);
  });

  it('nähert den Kreis mit wachsender Eckenzahl an', () => {
    const r = 2;
    let previous = 0;
    for (const n of [3, 6, 12, 24, 48]) {
      const q = regularPolygon(n, r);
      expect(q.area).toBeGreaterThan(previous);
      expect(q.area).toBeLessThan(Math.PI * r * r);
      previous = q.area;
    }
    expect(regularPolygon(48, r).area / (Math.PI * r * r)).toBeGreaterThan(0.997);
    expect(regularPolygon(4, Math.SQRT2).area).toBeCloseTo(4, 12);
  });
});

describe('Prisma und Zylinder', () => {
  it('berechnet Volumen, Mantel und Oberfläche', () => {
    const s = solid(triangleBase(4, 3), 5);
    expect(s.volume).toBe(30);
    expect(s.mantle).toBeCloseTo(5 * (4 + 2 * Math.hypot(2, 3)), 12);
    expect(s.surface).toBeCloseTo(12 + s.mantle, 12);
    const c = solid(circleBase(1), 2);
    expect(c.volume).toBeCloseTo(2 * Math.PI, 12);
    expect(c.surface).toBeCloseTo(6 * Math.PI, 12);
  });

  it('zerlegt die Höhe in Schichten von 1 cm', () => {
    expect(slices(4)).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
    expect(slices(2.5)).toEqual([
      [0, 1],
      [1, 2],
      [2, 2.5],
    ]);
  });
});

describe('Grenzfall Zylinder', () => {
  it('überschreitet ab 26 Ecken 99 % des Zylindervolumens', () => {
    const ratio = (n: number) => regularPolygon(n, 1).area / Math.PI;
    expect(ratio(6)).toBeCloseTo(0.827, 3);
    expect(ratio(12)).toBeCloseTo(0.955, 3);
    expect(ratio(25)).toBeLessThan(0.99);
    expect(ratio(26)).toBeGreaterThan(0.99);
  });
});

describe('Abrollen', () => {
  it('druckt nach einer vollen Drehung genau den Umfang ab', () => {
    for (const base of [triangleBase(4, 3), polygonBase(6, 2), polygonBase(5, 1.5)]) {
      const start = rollPolygon(base.points, 0);
      expect(start.printed).toBeCloseTo(base.sides[0]!, 12);
      expect(Math.min(...start.points.map((p) => p[1]))).toBeCloseTo(0, 12);
      const end = rollPolygon(base.points, 2 * Math.PI);
      expect(end.printed).toBeCloseTo(base.perimeter, 9);
      expect(end.faces).toBe(base.points.length);
      // gleiche Lage wie am Anfang, nur um den Umfang verschoben
      end.points.forEach((p, i) => {
        expect(p[0]).toBeCloseTo(start.points[i]![0] + base.perimeter, 9);
        expect(p[1]).toBeCloseTo(start.points[i]![1], 9);
      });
    }
  });

  it('kippt über die Ecken und bleibt dabei über dem Boden', () => {
    const base = polygonBase(6, 2);
    for (let k = 0; k <= 60; k++) {
      const pose = rollPolygon(base.points, (k / 60) * 2 * Math.PI);
      expect(Math.min(...pose.points.map((p) => p[1]))).toBeGreaterThan(-1e-9);
      // Form bleibt erhalten
      expect(signedArea(pose.points)).toBeCloseTo(base.area, 9);
    }
    // nach einer Sechsteldrehung liegt die nächste Seite auf
    const sixth = rollPolygon(base.points, Math.PI / 3);
    expect(sixth.printed).toBeCloseTo(4, 9);
    expect(sixth.faces).toBe(2);
  });

  it('rollt den Kreis ohne Rutschen', () => {
    const c = rollCircle(2, Math.PI);
    expect(c.printed).toBeCloseTo(2 * Math.PI, 12);
    expect(c.center).toEqual([2 * Math.PI, 2]);
  });
});

describe('Werte aus dem Lernmaterial', () => {
  it('Aufgabe 1: Dreiecksprisma g = 4, h_g = 3, h = 5', () => {
    const s = solid(triangleBase(4, 3), 5);
    expect(s.volume).toBe(30);
    expect(s.base.sides[1]).toBeCloseTo(3.606, 3);
    expect(s.base.perimeter).toBeCloseTo(11.21, 2);
    expect(s.mantle).toBeCloseTo(56.06, 2);
    expect(s.surface).toBeCloseTo(68.06, 2);
  });

  it('Aufgabe 2 und 3: Zylinder und Sechseckprisma mit r = 2, h = 4', () => {
    const c = solid(circleBase(2), 4);
    expect(c.volume).toBeCloseTo(16 * Math.PI, 12);
    expect(c.surface).toBeCloseTo(24 * Math.PI, 12);
    const hex = solid(polygonBase(6, 2), 4);
    // Sechseck: Seite = Umkreisradius, also u = 12 cm und M = 48 cm²
    expect(hex.base.sides[0]).toBeCloseTo(2, 12);
    expect(hex.mantle).toBeCloseTo(48, 12);
    expect(hex.volume).toBeCloseTo(41.57, 2);
    expect(hex.surface).toBeCloseTo(68.78, 2);
  });

  it('Aufgabe 4: Getränkedose d = 7 cm, h = 11 cm', () => {
    const can = solid(circleBase(3.5), 11);
    expect(can.mantle).toBeCloseTo(241.9, 1);
    expect(can.volume).toBeCloseTo(423.3, 1);
    expect(can.volume).toBeLessThan(500);
  });

  it('Aufgabe 5: Anteil am Zylindervolumen auf zwei Nachkommastellen', () => {
    const percent = (n: number) => (100 * regularPolygon(n, 1).area) / Math.PI;
    expect(percent(25)).toBeCloseTo(98.95, 2);
    expect(percent(26)).toBeCloseTo(99.03, 2);
  });
});
