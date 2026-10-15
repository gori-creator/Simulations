import { describe, expect, it } from 'vitest';
import {
  argMax,
  clampToDomain,
  completeSquare,
  equals,
  inDomain,
  probeSequence,
  problem,
  rat,
  tableXs,
  toNumber,
  value,
  vertex,
  type Inputs,
} from '../src/simulations/mathematik/extremwert-parabel/model';

const base: Inputs = { L: 40, a: 80, b: 60, p: 8, n: 300, k: 20, s: 30 };

describe('Modell: Extremwertaufgaben mit Parabeln', () => {
  it('Gehege an der Mauer, L = 40 m: A(x) = −2x² + 40x, Maximum bei x = 10 m mit 200 m²', () => {
    const pr = problem('wall', base);
    expect(equals(pr.q.a, rat(-2))).toBe(true);
    expect(equals(pr.q.b, rat(40))).toBe(true);
    expect(equals(pr.q.c, rat(0))).toBe(true);
    const s = vertex(pr.q);
    expect(toNumber(s.x)).toBe(10);
    expect(toNumber(s.y)).toBe(200);
    // Länge parallel zur Mauer: 40 − 2 · 10 = 20 m (doppelt so lang wie breit)
    expect(40 - 2 * toNumber(s.x)).toBe(20);
    expect(toNumber(pr.lo)).toBe(0);
    expect(toNumber(pr.hi)).toBe(20);
    expect(pr.open).toBe(true);
  });

  it('Gehege ohne Mauer, Umfang 40 m: Quadrat mit 10 m Seitenlänge, A = 100 m²', () => {
    const pr = problem('free', base);
    const s = vertex(pr.q);
    expect(toNumber(s.x)).toBe(10);
    expect(toNumber(s.y)).toBe(100);
    expect(toNumber(pr.hi)).toBe(20);
  });

  it('quadratische Ergänzung liefert die Zwischenschritte exakt', () => {
    const st = completeSquare(problem('wall', base).q);
    expect(toNumber(st.p)).toBe(-20);
    expect(toNumber(st.h)).toBe(-10);
    expect(toNumber(st.h2)).toBe(100);
    expect(toNumber(st.yS)).toBe(200);
    // a·(x + h)² + yS stimmt an beliebigen Stellen mit der Zielfunktion überein
    const q = problem('price', base).q;
    const c = completeSquare(q);
    for (const x of [-3, 0, 2.5, 7]) {
      const vf = toNumber(c.a) * (x + toNumber(c.h)) ** 2 + toNumber(c.yS);
      expect(vf).toBeCloseTo(value(q, x), 9);
    }
  });

  it('Rechteck im Dreieck (a = 80 cm, b = 60 cm): halbe Katheten, halbe Dreiecksfläche', () => {
    const pr = problem('tri', base);
    expect(equals(pr.q.a, rat(-3, 4))).toBe(true);
    const s = vertex(pr.q);
    expect(toNumber(s.x)).toBe(40);
    expect(toNumber(s.y)).toBe(1200);
    expect(toNumber(s.y)).toBe((80 * 60) / 2 / 2);
  });

  it('Erlös: E(x) = (8 + x)(300 − 20x), Maximum bei x = 3,5 € mit 2645 €', () => {
    const pr = problem('price', base);
    expect(equals(pr.q.a, rat(-20))).toBe(true);
    expect(equals(pr.q.b, rat(140))).toBe(true);
    expect(equals(pr.q.c, rat(2400))).toBe(true);
    const s = vertex(pr.q);
    expect(toNumber(s.x)).toBe(3.5);
    expect(toNumber(s.y)).toBe(2645);
    expect(toNumber(pr.lo)).toBe(-8);
    expect(toNumber(pr.hi)).toBe(15);
    expect(pr.open).toBe(false);
  });

  it('Erlös: manchmal lohnt eine Preissenkung (Scheitel bei negativem x)', () => {
    const pr = problem('price', { ...base, p: 12, n: 200, k: 25 });
    const s = vertex(pr.q);
    expect(toNumber(s.x)).toBe(-2);
    expect(toNumber(s.y)).toBe(2500);
  });

  it('Regenrinne, Streifen 30 cm: Ränder 7,5 cm hoch, Querschnitt 112,5 cm²', () => {
    const s = vertex(problem('gutter', base).q);
    expect(toNumber(s.x)).toBe(7.5);
    expect(toNumber(s.y)).toBe(112.5);
  });

  it('Scheitel liegt immer in der Mitte des Definitionsbereichs', () => {
    for (const sit of ['wall', 'free', 'tri', 'price', 'gutter'] as const) {
      for (const inp of [base, { L: 18, a: 34, b: 100, p: 2.5, n: 410, k: 7, s: 22 }]) {
        const pr = problem(sit, inp);
        const xs = toNumber(vertex(pr.q).x);
        expect(xs).toBeCloseTo((toNumber(pr.lo) + toNumber(pr.hi)) / 2, 9);
        expect(inDomain(pr, xs)).toBe(true);
        expect(value(pr.q, toNumber(pr.lo))).toBeCloseTo(0, 6);
        expect(value(pr.q, toNumber(pr.hi))).toBeCloseTo(0, 6);
        expect(toNumber(pr.q.a)).toBeLessThan(0);
      }
    }
  });

  it('Definitionsbereich: offene Ränder bei Rechtecken, geschlossene beim Preis', () => {
    const wall = problem('wall', base);
    expect(inDomain(wall, 0)).toBe(false);
    expect(inDomain(wall, 20)).toBe(false);
    expect(inDomain(wall, 19.5)).toBe(true);
    expect(clampToDomain(wall, 25)).toBe(20);
    const price = problem('price', base);
    expect(inDomain(price, -8)).toBe(true);
    expect(inDomain(price, 15.5)).toBe(false);
  });

  it('Wertetabelle: schöne Schritte im Definitionsbereich, Maximum in der Mitte', () => {
    const pr = problem('wall', base);
    const xs = tableXs(pr);
    expect(xs.length).toBeLessThanOrEqual(8);
    expect(xs.every((x) => inDomain(pr, x))).toBe(true);
    expect(xs).toContain(10);
    expect(xs[argMax(pr.q, xs)]).toBe(10);
    const price = tableXs(problem('price', base));
    expect(price[0]).toBe(-5);
    expect(price[price.length - 1]).toBe(15);
  });

  it('Probier-Folge pendelt um den Scheitel und endet genau dort', () => {
    for (const sit of ['wall', 'free', 'tri', 'price', 'gutter'] as const) {
      const pr = problem(sit, base);
      const xv = toNumber(vertex(pr.q).x);
      for (const x0 of [toNumber(pr.lo) + 0.5, xv, toNumber(pr.hi) - 0.5]) {
        const seq = probeSequence(pr, x0);
        expect(seq.length).toBeGreaterThanOrEqual(3);
        expect(seq[seq.length - 1]).toBe(xv);
        expect(seq.every((x) => inDomain(pr, x))).toBe(true);
        // die Versuche kommen dem Scheitel immer näher
        const dist = seq.map((x) => Math.abs(x - xv));
        for (let i = 1; i < dist.length; i++) expect(dist[i]!).toBeLessThanOrEqual(dist[i - 1]! + 1e-9);
      }
    }
  });
});
