import { describe, expect, it } from 'vitest';
import {
  coefficients,
  decimals,
  degenerate,
  derive,
  fitParabola,
  pairDifference,
  rat,
  ratGcd,
  rootsWay,
  toNumber,
  vertexIndex,
  vertexOf,
  vertexWay,
  type Points,
  type Rational,
} from '../src/simulations/mathematik/parabel-drei-punkte/model';

const P = (...xy: number[]): Points => [
  { x: xy[0]!, y: xy[1]! },
  { x: xy[2]!, y: xy[3]! },
  { x: xy[4]!, y: xy[5]! },
];
const R = (n: number, d = 1) => rat(n, d);
const same = (q: Rational, n: number, d = 1) => expect(q).toEqual(R(n, d));

describe('Modell: Parabel durch drei Punkte', () => {
  it('Brüche werden gekürzt, Nenner positiv, kein −0', () => {
    expect(rat(6, -4)).toEqual({ n: -3, d: 2 });
    expect(rat(0, -5)).toEqual({ n: 0, d: 1 });
    expect(Object.is(rat(0, -5).n, -0)).toBe(false);
    expect(ratGcd(R(3, 2), R(9, 4))).toEqual(R(3, 4));
    expect(decimals(R(1, 4))).toBe(2);
    expect(decimals(R(1, 3))).toBeNull();
    expect(decimals(R(7))).toBe(0);
  });

  it('(0|0), (1|1), (2|4) → Normalparabel a = 1, b = 0, c = 0', () => {
    const f = fitParabola(P(0, 0, 1, 1, 2, 4));
    expect(f.kind).toBe('parabola');
    same(f.a, 1);
    same(f.b, 0);
    same(f.c, 0);
  });

  it('(−1|0), (1|0), (0|2) → a = −2, b = 0, c = 2', () => {
    const f = fitParabola(P(-1, 0, 1, 0, 0, 2));
    same(f.a, -2);
    same(f.b, 0);
    same(f.c, 2);
  });

  it('kollineare Punkte → a = 0 (Gerade y = 2x + 1)', () => {
    const f = fitParabola(P(-2, -3, 0, 1, 2, 5));
    expect(f.kind).toBe('line');
    same(f.a, 0);
    same(f.b, 2);
    same(f.c, 1);
  });

  it('gekürzter Bruch als Ergebnis: (0|0), (1|0), (3|1) → a = 1/6, b = −1/6, c = 0', () => {
    const f = fitParabola(P(0, 0, 1, 0, 3, 1));
    same(f.a, 1, 6);
    same(f.b, -1, 6);
    same(f.c, 0);
  });

  it('Gleitkomma-Version stimmt mit der exakten überein und läuft durch alle Punkte', () => {
    const pts = P(-2, -1, 1, 3.5, 3, 1.5);
    const f = fitParabola(pts);
    const k = coefficients(pts)!;
    expect(k.a).toBeCloseTo(toNumber(f.a), 12);
    expect(k.b).toBeCloseTo(toNumber(f.b), 12);
    expect(k.c).toBeCloseTo(toNumber(f.c), 12);
    for (const p of pts) expect(k.a * p.x * p.x + k.b * p.x + k.c).toBeCloseTo(p.y, 12);
    expect(coefficients(P(1, 0, 1, 2, 3, 0))).toBeNull();
  });

  it('Sonderfälle: gleiches x → keine Funktion, gleicher Punkt → unendlich viele Parabeln', () => {
    expect(degenerate(P(1, 2, 1, -1, 3, 0))).toEqual({ kind: 'sameX', pair: [0, 1] });
    expect(fitParabola(P(1, 2, 3, 0, 1, -1)).kind).toBe('sameX');
    expect(degenerate(P(1, 2, 3, 0, 1, 2))).toEqual({ kind: 'samePoint', pair: [0, 2] });
    // gleiches x hat Vorrang vor zusammenfallenden Punkten
    expect(degenerate(P(1, 2, 1, 2, 1, 0))?.kind).toBe('sameX');
    expect(derive(P(1, 2, 1, -1, 3, 0))).toBeNull();
    // II − I: 0 = −3 (Widerspruch)
    same(pairDifference(P(1, 2, 1, -1, 3, 0), [0, 1]), -3);
  });

  it('Rechenweg (Additionsverfahren) für P₁(−1|1,5), P₂(2|3), P₃(4|−1)', () => {
    const d = derive(P(-1, 1.5, 2, 3, 4, -1))!;
    // I: a − b + c = 1,5
    same(d.base[0].coef[0], 1);
    same(d.base[0].coef[1], -1);
    same(d.base[0].rhs, 3, 2);
    expect(d.cDirect).toBeNull();
    // IV = II − I: 3a + 3b = 1,5 ; V = III − I: 15a + 5b = −2,5
    same(d.e4.p, 3);
    same(d.e4.q, 3);
    same(d.e4.r, 3, 2);
    same(d.e5.p, 15);
    same(d.e5.q, 5);
    same(d.e5.r, -5, 2);
    // 5 · IV − 3 · V: −30a = 15
    same(d.k4, 5);
    same(d.k5, 3);
    same(d.aCoef, -30);
    same(d.aRhs, 15);
    same(d.a, -1, 2);
    same(d.b, 1);
    same(d.c, 3);
  });

  it('Rechenweg mit Punkt auf der y-Achse: c direkt ablesen', () => {
    const d = derive(P(-5, 0, 0, 5, 5, 0))!;
    expect(d.cDirect).toBe(1);
    same(d.c, 5);
    same(d.a, -1, 5);
    same(d.b, 0);
    // IV: 25a − 5b = −5 (c = 5 in I eingesetzt)
    same(d.e4.p, 25);
    same(d.e4.q, -5);
    same(d.e4.r, -5);
  });

  it('Rechenweg und direkte Lösung stimmen für viele Punkte überein', () => {
    const vals = [-3, -1.5, 0, 0.5, 2, 4];
    let n = 0;
    for (const x1 of vals)
      for (const x2 of vals)
        for (const x3 of [-2.5, 1, 3.5]) {
          const pts = P(x1, 1.5, x2, -2, x3, 0.5);
          const d = derive(pts);
          const f = fitParabola(pts);
          if (!d) {
            expect(['sameX', 'samePoint']).toContain(f.kind);
            continue;
          }
          n++;
          expect(d.a).toEqual(f.a);
          expect(d.b).toEqual(f.b);
          expect(d.c).toEqual(f.c);
          // b-Koeffizient verschwindet nach der Elimination
          expect(toNumber(d.k4) * toNumber(d.e4.q) - toNumber(d.k5) * toNumber(d.e5.q)).toBeCloseTo(0, 12);
        }
    expect(n).toBeGreaterThan(50);
  });

  it('Scheitelpunkt und Scheitelform', () => {
    const s = vertexOf(R(1), R(-2), R(-1))!;
    same(s.x, 1);
    same(s.y, -2);
    expect(vertexOf(R(0), R(1), R(1))).toBeNull();
    const pts = P(-1, 2, 1, -2, 2, -1);
    expect(vertexIndex(pts)).toBe(1);
    const w = vertexWay(pts)!;
    expect([w.s, w.j, w.k]).toEqual([1, 0, 2]);
    same(w.sq, 4);
    same(w.dy, 4);
    same(w.a, 1);
    same(w.b, -2);
    same(w.c, -1);
    expect(vertexIndex(P(-1, 1.5, 2, 3, 4, -1))).toBeNull();
    expect(vertexIndex(P(-2, -1, 1, 3.5, 3, 1.5))).toBe(1);
    expect(vertexIndex(P(-2, -3, 0, 1, 2, 5))).toBeNull();
  });

  it('Nullstellenform', () => {
    const w = rootsWay(P(-1, 0, 3, 0, 1, 4))!;
    expect([w.i, w.j, w.k]).toEqual([0, 1, 2]);
    same(w.prod, -4);
    same(w.a, -1);
    same(w.b, 2);
    same(w.c, 3);
    const f = fitParabola(P(-1, 0, 3, 0, 1, 4));
    expect([f.a, f.b, f.c]).toEqual([w.a, w.b, w.c]);
    expect(rootsWay(P(-1, 0, 3, 0, 1, 0))).toBeNull();
    expect(rootsWay(P(-1, 0, 3, 1, 1, 4))).toBeNull();
  });
});
