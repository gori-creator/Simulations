import { describe, expect, it } from 'vitest';
import {
  cutLines,
  doubled,
  figure,
  footOfPerpendicular,
  footOutside,
  formulaArea,
  halfTurnCopy,
  parallelogram,
  parallelogramArea,
  pointLineDistance,
  polyArea,
  rectCells,
  rectPieces,
  rotatedCopy,
  signedArea,
  strips,
  targetRect,
  trapezoidArea,
  trapezoidTriangles,
  triangleArea,
  bounds,
  type Dims,
  type Kind,
} from '../src/simulations/mathematik/flaechen-zerlegen/model';

const D = (g: number, h: number, s: number, c = 0): Dims => ({ g, h, s, c });

/** Kleiner, reproduzierbarer Zufallsgenerator. */
function rng(seed: number): () => number {
  let x = seed >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 2 ** 32;
  };
}
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

describe('Modell: Flächen durch Zerlegen und Ergänzen', () => {
  it('Parallelogramm g = 6 cm, h = 4 cm → 24 cm², Rechteck nach dem Verschieben gleich groß', () => {
    const d = D(6, 4, 2);
    expect(parallelogramArea(6, 4)).toBe(24);
    expect(formulaArea('para', d)).toBe(24);
    expect(polyArea(figure('para', d))).toBeCloseTo(24, 12);
    const pieces = rectPieces(6, 2, [figure('para', d)]);
    const sum = pieces.reduce((s, p) => s + polyArea(p.poly), 0);
    expect(sum).toBeCloseTo(24, 12);
    const r = targetRect(6, 4, 2);
    expect(r.w * r.h).toBe(24);
    // genau ein Dreieck wird verschoben (um g nach rechts)
    const moved = pieces.filter((p) => p.shift !== 0);
    expect(moved).toHaveLength(1);
    expect(moved[0]!.shift).toBe(6);
    expect(polyArea(moved[0]!.poly)).toBeCloseTo((2 * 4) / 2, 12);
  });

  it('Dreieck g = 6 cm, h = 4 cm → 12 cm²; A(0|0), B(6|0), C(2|4) auch per Schuhbandformel', () => {
    expect(triangleArea(6, 4)).toBe(12);
    const tri = figure('tri', D(6, 4, 2));
    expect(tri).toEqual([
      [0, 0],
      [6, 0],
      [2, 4],
    ]);
    expect(polyArea(tri)).toBe(12);
    expect(signedArea(tri)).toBe(12); // gegen den Uhrzeigersinn
  });

  it('C auf y = 4 verschoben → weiterhin 12 cm² (Scherung)', () => {
    for (let s = -8; s <= 14; s += 0.5) expect(polyArea(figure('tri', D(6, 4, s)))).toBeCloseTo(12, 12);
    for (let s = -8; s <= 14; s++) expect(polyArea(figure('para', D(6, 4, s)))).toBeCloseTo(24, 12);
  });

  it('Trapez a = 7 cm, c = 3 cm, h = 4 cm → 20 cm²', () => {
    expect(trapezoidArea(7, 3, 4)).toBe(20);
    const d = D(7, 4, 1, 3);
    expect(formulaArea('trap', d)).toBe(20);
    expect(polyArea(figure('trap', d))).toBe(20);
    const [t1, t2] = trapezoidTriangles(d);
    expect(polyArea(t1)).toBe(14);
    expect(polyArea(t2)).toBe(6);
  });

  it('Höhe = Abstand der Spitze von der Grundseite', () => {
    expect(pointLineDistance([2, 4], [0, 0], [6, 0])).toBe(4);
    expect(footOfPerpendicular([2, 4], [0, 0], [6, 0])).toEqual([2, 0]);
    // schräge Gerade: Abstand von (0|5) zur Geraden y = x ist 5/√2
    expect(pointLineDistance([0, 5], [0, 0], [1, 1])).toBeCloseTo(5 / Math.SQRT2, 12);
    expect(footOutside(D(4, 3, 7))).toBe(true);
    expect(footOutside(D(4, 3, -1))).toBe(true);
    expect(footOutside(D(4, 3, 2))).toBe(false);
  });

  it('Kopie um 180° um die Mitte von BC ergänzt zum Parallelogramm', () => {
    const d = D(6, 4, 2);
    const copy = halfTurnCopy('tri', d);
    expect(copy).toEqual([
      [8, 4],
      [2, 4],
      [6, 0],
    ]);
    const P = doubled('tri', d);
    expect(P).toEqual({ G: 6, h: 4, s: 2 });
    expect(polyArea(parallelogram(P.G, P.h, P.s))).toBe(2 * 12);
    // Drehung um π stimmt mit der Halbdrehung überein
    rotatedCopy('tri', d, Math.PI).forEach((p, i) => {
      expect(p[0]).toBeCloseTo(copy[i]![0], 12);
      expect(p[1]).toBeCloseTo(copy[i]![1], 12);
    });
    // Trapez: Grundseite a + c
    const t = D(7, 4, 1, 3);
    expect(doubled('trap', t).G).toBe(10);
    const tc = halfTurnCopy('trap', t);
    expect(polyArea(tc)).toBe(20);
    expect(bounds([figure('trap', t), tc])).toEqual({ x0: 0, y0: 0, x1: 11, y1: 4 });
  });

  it('stark geneigtes Parallelogramm wird in mehrere Streifen zerlegt', () => {
    // g = 3, s = 7: Höhenfußpunkt weit außerhalb
    const st = strips(3, 7);
    expect(st.length).toBe(4);
    const pieces = rectPieces(3, 7, [parallelogram(3, 4, 7)]);
    const sum = pieces.reduce((s, p) => s + polyArea(p.poly), 0);
    expect(sum).toBeCloseTo(12, 12);
    const r = targetRect(3, 4, 7);
    expect(r.x0).toBe(1);
    for (const p of pieces) for (const q of p.poly) {
      expect(q[0] + p.shift).toBeGreaterThanOrEqual(r.x0 - 1e-9);
      expect(q[0] + p.shift).toBeLessThanOrEqual(r.x0 + r.w + 1e-9);
    }
    expect(cutLines(3, 4, 7).length).toBe(3);
  });

  it('Grenzfälle: Rechteck (s = 0), s = g, Trapez mit c = 0 und c = a', () => {
    expect(cutLines(5, 3, 0)).toHaveLength(0);
    expect(rectPieces(5, 0, [parallelogram(5, 3, 0)]).every((p) => p.shift === 0)).toBe(true);
    const pg = rectPieces(5, 5, [parallelogram(5, 3, 5)]);
    expect(pg.reduce((s, p) => s + polyArea(p.poly), 0)).toBeCloseTo(15, 12);
    // c = 0: Trapez wird zum Dreieck
    expect(polyArea(figure('trap', D(7, 4, 2, 0)))).toBe(triangleArea(7, 4));
    // c = a: Trapez ist ein Parallelogramm
    expect(polyArea(figure('trap', D(5, 4, 2, 5)))).toBe(parallelogramArea(5, 4));
    expect(rectCells(1, 3, 2)).toHaveLength(6);
    expect(rectCells(1, 3, 2)[3]).toEqual([1, 1]);
  });

  it('Neigung nach links (s < 0): nur das kleine Dreieck wird verschoben', () => {
    // A(0|0), B(6|0), C(4|4), D(−2|4): Schnitt entlang der Höhe von C bei x = 4
    const pieces = rectPieces(6, -2, [parallelogram(6, 4, -2)]);
    const moved = pieces.filter((p) => p.shift !== 0);
    expect(moved).toHaveLength(1);
    expect(moved[0]!.shift).toBe(-6);
    expect(polyArea(moved[0]!.poly)).toBeCloseTo((2 * 4) / 2, 12);
    expect(targetRect(6, 4, -2).x0).toBe(-2);
    expect(cutLines(6, 4, -2).map((c) => c.x)).toEqual([4]);
    // Grenzfall s = −g: zwei gleich große Dreiecke, eines wird verschoben
    const half = rectPieces(5, -5, [parallelogram(5, 3, -5)]);
    expect(half.filter((p) => p.shift !== 0)).toHaveLength(1);
    expect(half.reduce((s, p) => s + polyArea(p.poly), 0)).toBeCloseTo(15, 12);
  });

  it('Dreieck g = 6, h = 4, C(−3|4): Lot außerhalb, Verdoppeln und Umlegen ergibt 24 cm²', () => {
    const d = D(6, 4, -3);
    expect(footOutside(d)).toBe(true);
    const pieces = rectPieces(6, -3, [figure('tri', d), halfTurnCopy('tri', d)]);
    expect(pieces.reduce((s, p) => s + polyArea(p.poly), 0)).toBeCloseTo(24, 12);
    expect(pieces.filter((p) => p.src === 0).reduce((s, p) => s + polyArea(p.poly), 0)).toBeCloseTo(12, 12);
  });

  it('viele Zufallsfiguren: Schuhbandformel = Formel, Teile ergeben das Rechteck', () => {
    const r = rng(42);
    const kinds: Kind[] = ['para', 'tri', 'trap'];
    for (let n = 0; n < 400; n++) {
      const kind = kinds[n % 3]!;
      const d = D(int(r, 1, 10), int(r, 1, 8), int(r, -5, 10), int(r, 0, 10));
      const f = figure(kind, d);
      expect(polyArea(f)).toBeCloseTo(formulaArea(kind, d), 9);
      expect(pointLineDistance([d.s, d.h], [0, 0], [d.g, 0])).toBeCloseTo(d.h, 12);
      const P = doubled(kind, d);
      const sources = kind === 'para' ? [f] : [f, halfTurnCopy(kind, d)];
      const pieces = rectPieces(P.G, P.s, sources);
      const total = pieces.reduce((s, p) => s + polyArea(p.poly), 0);
      expect(total).toBeCloseTo(P.G * P.h, 9);
      // Figur ist (bei Dreieck und Trapez) genau die Hälfte
      const own = pieces.filter((p) => p.src === 0).reduce((s, p) => s + polyArea(p.poly), 0);
      expect(own).toBeCloseTo(formulaArea(kind, d), 9);
      const t = targetRect(P.G, P.h, P.s);
      // das Rechteck überdeckt einen Teil der Grundseite [0, G]
      if (P.s >= 0) {
        expect(t.x0).toBeGreaterThanOrEqual(0);
        expect(t.x0).toBeLessThan(P.G);
      } else {
        expect(t.x0).toBeGreaterThan(-P.G);
        expect(t.x0).toBeLessThanOrEqual(0);
      }
      // genau ein Streifen bleibt liegen
      expect(new Set(pieces.filter((p) => p.shift === 0).map((p) => p.j)).size).toBe(1);
      for (const p of pieces) for (const q of p.poly) {
        expect(q[0] + p.shift).toBeGreaterThanOrEqual(t.x0 - 1e-9);
        expect(q[0] + p.shift).toBeLessThanOrEqual(t.x0 + t.w + 1e-9);
      }
    }
  });
});
