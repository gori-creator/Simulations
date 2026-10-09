import { describe, expect, it } from 'vitest';
import {
  canCut,
  clampCut,
  decompositionArea,
  inside,
  lArea,
  lDecomposition,
  lPerimeter,
  lPolygon,
  lSides,
  maxAreaRects,
  minPerimeterRects,
  nearestSide,
  niceStep,
  polygonArea,
  polygonPerimeter,
  rectArea,
  rectPerimeter,
  rectPolygon,
  rectsWithArea,
  rectsWithPerimeter,
  snapToArea,
  snapToPerimeter,
  unitCells,
  walkAt,
  type Method,
} from '../src/simulations/mathematik/umfang-flaeche/model';

describe('Modell: Umfang und Flächeninhalt – Rechteck', () => {
  it('berechnet A = a · b und U = 2 · (a + b)', () => {
    expect(rectArea(5, 3)).toBe(15);
    expect(rectPerimeter(5, 3)).toBe(16);
    expect(rectArea(4, 4)).toBe(16);
    expect(rectPerimeter(4, 4)).toBe(16);
    expect(rectArea(10, 1)).toBe(10);
    expect(rectPerimeter(10, 1)).toBe(22);
  });

  it('Vieleck-Formeln stimmen mit den Rechteckformeln überein', () => {
    for (let a = 1; a <= 10; a++)
      for (let b = 1; b <= 6; b++) {
        const poly = rectPolygon(a, b);
        expect(polygonArea(poly)).toBe(rectArea(a, b));
        expect(polygonPerimeter(poly)).toBe(rectPerimeter(a, b));
      }
  });

  it('zählt genau a · b Einheitsquadrate, Reihe für Reihe von unten', () => {
    const cells = unitCells(rectPolygon(5, 3));
    expect(cells).toHaveLength(15);
    expect(cells.slice(0, 5)).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ]);
    expect(cells[5]).toEqual([0, 1]);
    expect(cells[14]).toEqual([4, 2]);
  });

  it('Punkt im Vieleck', () => {
    const poly = rectPolygon(4, 2);
    expect(inside(poly, 1, 1)).toBe(true);
    expect(inside(poly, 4.5, 1)).toBe(false);
    expect(inside(poly, 2, -0.1)).toBe(false);
  });
});

describe('Modell: Weg der Ameise', () => {
  const poly = rectPolygon(5, 3);

  it('läuft gegen den Uhrzeigersinn: unten, rechts, oben, links', () => {
    expect(walkAt(poly, 0)).toMatchObject({ x: 0, y: 0, dir: 0, side: 0 });
    expect(walkAt(poly, 2.5)).toMatchObject({ x: 2.5, y: 0, side: 0 });
    expect(walkAt(poly, 6)).toMatchObject({ x: 5, y: 1, dir: 90, side: 1 });
    const top = walkAt(poly, 10);
    expect(top.x).toBeCloseTo(3, 12);
    expect(top.y).toBe(3);
    expect(top.side).toBe(2);
    expect(Math.abs(top.dir)).toBe(180);
    expect(walkAt(poly, 15)).toMatchObject({ x: 0, y: 1, dir: -90, side: 3 });
  });

  it('ist nach einem Umfang wieder am Start', () => {
    const end = walkAt(poly, rectPerimeter(5, 3));
    expect(end.x).toBeCloseTo(0, 12);
    expect(end.y).toBeCloseTo(0, 12);
  });

  it('bleibt am Ende stehen, wenn s zu groß ist, und am Start bei s < 0', () => {
    expect(walkAt(poly, 99)).toMatchObject({ x: 0, y: 0 });
    expect(walkAt(poly, -3)).toMatchObject({ x: 0, y: 0, side: 0 });
  });
});

describe('Modell: L-Form', () => {
  it('Flächeninhalt: großes Rechteck minus Ausschnitt', () => {
    expect(lArea(5, 3, 2, 2)).toBe(11);
    expect(polygonArea(lPolygon(5, 3, 2, 2))).toBe(11);
    expect(unitCells(lPolygon(6, 5, 3, 2))).toHaveLength(24);
  });

  it('der Umfang ist so groß wie der des umgebenden Rechtecks', () => {
    for (let a = 2; a <= 10; a++)
      for (let b = 2; b <= 6; b++)
        for (let c = 1; c < a; c++)
          for (let d = 1; d < b; d++) {
            expect(lPerimeter(a, b, c, d)).toBe(rectPerimeter(a, b));
          }
  });

  it('Seiten in Laufrichtung: a, b − d, c, d, a − c, b', () => {
    expect(lSides(6, 5, 3, 2)).toEqual([6, 3, 3, 2, 3, 5]);
  });

  it('alle Zerlegungen liefern denselben Flächeninhalt', () => {
    const methods: Method[] = ['waag', 'senk', 'erg'];
    for (const m of methods) {
      expect(decompositionArea(lDecomposition(6, 5, 3, 2, m))).toBe(24);
      expect(decompositionArea(lDecomposition(5, 3, 2, 2, m))).toBe(11);
    }
    expect(lDecomposition(6, 5, 3, 2, 'waag').parts).toEqual([
      { x: 0, y: 0, w: 6, h: 3 },
      { x: 0, y: 3, w: 3, h: 2 },
    ]);
    expect(lDecomposition(6, 5, 3, 2, 'senk').parts).toEqual([
      { x: 0, y: 0, w: 3, h: 5 },
      { x: 3, y: 0, w: 3, h: 3 },
    ]);
    expect(lDecomposition(6, 5, 3, 2, 'erg').minus).toEqual({ x: 3, y: 3, w: 3, h: 2 });
    expect(lDecomposition(6, 5, 3, 2, 'keine').parts).toEqual([]);
  });

  it('Ausschnitt wird auf gültige Werte begrenzt', () => {
    expect(clampCut(5, 3, 9, 9)).toEqual([4, 2]);
    expect(clampCut(5, 3, 0, 0)).toEqual([1, 1]);
    expect(canCut(1, 4)).toBe(false);
    expect(canCut(2, 2)).toBe(true);
  });
});

describe('Modell: gleicher Umfang, gleicher Flächeninhalt', () => {
  it('alle Rechtecke mit U = 16 cm', () => {
    const list = rectsWithPerimeter(16);
    expect(list).toHaveLength(7);
    expect(list[0]).toEqual([1, 7]);
    expect(list.every(([a, b]) => rectPerimeter(a, b) === 16)).toBe(true);
    expect(list.map(([a, b]) => a * b)).toEqual([7, 12, 15, 16, 15, 12, 7]);
  });

  it('bei festem Umfang hat das Quadrat den größten Flächeninhalt', () => {
    expect(maxAreaRects(16)).toEqual([[4, 4]]);
    expect(maxAreaRects(20)).toEqual([[5, 5]]);
    // Ungerade halbe Umfänge: kein Quadrat mit ganzzahligen Seiten
    expect(maxAreaRects(18)).toEqual([
      [4, 5],
      [5, 4],
    ]);
    expect(maxAreaRects(4)).toEqual([[1, 1]]);
  });

  it('Umfang ohne ganzzahlige Rechtecke', () => {
    expect(rectsWithPerimeter(15)).toEqual([]);
    expect(rectsWithPerimeter(2)).toEqual([]);
  });

  it('alle Rechtecke mit A = 12 cm² und ihr Umfang', () => {
    const list = rectsWithArea(12);
    expect(list).toEqual([
      [1, 12],
      [2, 6],
      [3, 4],
      [4, 3],
      [6, 2],
      [12, 1],
    ]);
    expect(list.map(([a, b]) => rectPerimeter(a, b))).toEqual([26, 16, 14, 14, 16, 26]);
    expect(minPerimeterRects(12)).toEqual([
      [3, 4],
      [4, 3],
    ]);
    expect(minPerimeterRects(16)).toEqual([[4, 4]]);
    // Primzahl: nur der lange Streifen
    expect(rectsWithArea(13)).toEqual([
      [1, 13],
      [13, 1],
    ]);
  });

  it('Einrasten auf das nächste passende Rechteck', () => {
    expect(snapToPerimeter(16, 3.2, 5.1)).toBe(3);
    expect(snapToPerimeter(16, 20, 0)).toBe(7);
    expect(snapToPerimeter(16, -5, 9)).toBe(1);
    expect(snapToArea(12, 3.6, 3.3)).toBe(4);
    expect(snapToArea(12, 11, 1)).toBe(12);
    expect(snapToArea(12, 1.5, 7)).toBe(2);
    expect(nearestSide(rectsWithArea(12), 5)).toBe(4);
    expect(nearestSide(rectsWithArea(12), 9)).toBe(6);
    expect(nearestSide([], 5)).toBe(1);
  });

  it('schöne Achsenschritte', () => {
    expect(niceStep(16)).toBe(5);
    expect(niceStep(26, 5)).toBe(10);
    expect(niceStep(4)).toBe(1);
    expect(niceStep(144, 6)).toBe(50);
  });
});
