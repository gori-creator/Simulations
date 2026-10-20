import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  applyOp,
  check,
  clampX,
  classify,
  naiveGuess,
  product,
  quotient,
  ruleFactors,
  ruleOfThree,
  scaleY,
  storyBase,
  TABLES,
  tableXs,
  value,
  X_MAX,
  type Relation,
} from '../src/simulations/mathematik/proportional/model';

const apples: Relation = { kind: 'dir', k: 2.5, b: 0 };
const pumps: Relation = { kind: 'ind', k: 12, b: 0 };
const pool: Relation = { kind: 'ind', k: 60, b: 0 };
const taxi: Relation = { kind: 'lin', k: 2, b: 3 };

describe('Modell: Proportionalität – Prüfwerte', () => {
  it('direkt: 2,50 €/kg, 3 kg → 7,50 €; 4 kg → 10 €; 7 kg → 17,50 €; y : x = 2,5 konstant', () => {
    expect(value(apples, 3)).toBeCloseTo(7.5, 12);
    expect(value(apples, 4)).toBeCloseTo(10, 12);
    expect(value(apples, 7)).toBeCloseTo(17.5, 12);
    for (const x of [0.5, 1, 3, 4, 7, 10]) expect(quotient(apples, x)).toBeCloseTo(2.5, 12);
    expect(ruleFactors(apples, 1, 3)).toEqual({ fx: 3, fy: 3 });
  });

  it('indirekt: 1 Pumpe 12 h → 3 Pumpen 4 h, 4 Pumpen 3 h; x · y = 12', () => {
    expect(value(pumps, 1)).toBe(12);
    expect(value(pumps, 3)).toBe(4);
    expect(value(pumps, 4)).toBe(3);
    for (const x of [1, 2, 3, 4, 6, 12]) expect(product(pumps, x)).toBeCloseTo(12, 12);
    const f = ruleFactors(pumps, 1, 3);
    expect(f.fx).toBe(3);
    expect(f.fy).toBeCloseTo(1 / 3, 12);
  });

  it('Taxi: 3 € + 2 €/km: 5 km → 13 €, 10 km → 23 € (nicht 26 €); Quotienten 2,6 und 2,3', () => {
    expect(value(taxi, 5)).toBe(13);
    expect(value(taxi, 10)).toBe(23);
    expect(naiveGuess(taxi, 5, 10)).toBe(26);
    expect(quotient(taxi, 5)).toBeCloseTo(2.6, 12);
    expect(quotient(taxi, 10)).toBeCloseTo(2.3, 12);
    expect(ruleFactors(taxi, 5, 10).fy).toBeCloseTo(23 / 13, 12);
    expect(check([5, 10].map((x) => [x, value(taxi, x)] as [number, number]))).toEqual({ quotient: false, product: false });
  });

  it('Tabellentest: (1|3), (2|6), (5|15) direkt (k = 3); (2|12), (3|8), (6|4) indirekt (k = 24); (1|5), (2|7), (3|9) keines', () => {
    const a = classify(TABLES.a);
    expect(a.verdict).toBe('dir');
    expect(a.k).toBe(3);
    const b = classify(TABLES.b);
    expect(b.verdict).toBe('ind');
    expect(b.k).toBe(24);
    const c = classify(TABLES.c);
    expect(c.verdict).toBe('none');
    expect(c.k).toBeNull();
    expect(c.quotients).toEqual([5, 3.5, 3]);
    expect(c.products).toEqual([5, 14, 27]);
  });
});

describe('Modell: Dreisatz', () => {
  it('direkt: 4 kg → 10 €, 1 kg → 2,50 €, 7 kg → 17,50 € (gleiche Richtung)', () => {
    const r3 = ruleOfThree(apples, 4, 7)!;
    expect(r3.same).toBe(true);
    expect(r3.rows[0]).toEqual([4, 10]);
    expect(r3.rows[1]).toEqual([1, 2.5]);
    expect(r3.rows[2][1]).toBeCloseTo(17.5, 12);
    // Rechenschritte links und rechts passen zu den Zeilen
    expect(applyOp(r3.rows[0][1], r3.right[0])).toBeCloseTo(r3.rows[1][1], 12);
    expect(applyOp(r3.rows[1][1], r3.right[1])).toBeCloseTo(r3.rows[2][1], 12);
    expect(applyOp(r3.rows[0][0], r3.left[0])).toBe(1);
    expect(applyOp(1, r3.left[1])).toBe(7);
    expect(r3.left[0].op).toBe(r3.right[0].op);
  });

  it('indirekt: 6 Pumpen → 10 h, 1 Pumpe → 60 h, 4 Pumpen → 15 h (Gegenrichtung)', () => {
    const r3 = ruleOfThree(pool, 6, 4)!;
    expect(r3.same).toBe(false);
    expect(r3.rows[0]).toEqual([6, 10]);
    expect(r3.rows[1]).toEqual([1, 60]);
    expect(r3.rows[2]).toEqual([4, 15]);
    expect(r3.right[0]).toEqual({ op: '·', f: 6 });
    expect(r3.right[1]).toEqual({ op: ':', f: 4 });
    expect(applyOp(applyOp(10, r3.right[0]), r3.right[1])).toBe(15);
    expect(r3.left[0].op).not.toBe(r3.right[0].op);
  });

  it('indirekt: 3 Pumpen 4 h → 1 Pumpe 12 h → 4 Pumpen 3 h', () => {
    const r3 = ruleOfThree(pumps, 3, 4)!;
    expect(r3.rows.map(([, y]) => y)).toEqual([4, 12, 3]);
  });

  it('kein Dreisatz beim Taxi', () => {
    expect(ruleOfThree(taxi, 5, 10)).toBeNull();
  });
});

describe('Modell: Verdoppeln und Wertetabelle', () => {
  it('direkt verdoppelt, indirekt halbiert, Taxi weder noch', () => {
    expect(scaleY(apples, 4, 2)).toEqual({ y0: 10, y1: 20, fy: 2 });
    expect(scaleY(pumps, 3, 2).fy).toBeCloseTo(0.5, 12);
    expect(scaleY(pumps, 3, 3).y1).toBeCloseTo(12 / 9, 12);
    const t = scaleY(taxi, 5, 2);
    expect(t.y1).toBe(23);
    expect(t.fy).not.toBeCloseTo(2, 3);
    expect(t.fy).toBeCloseTo(23 / 13, 12);
  });

  it('Ausgangswert der Animation bleibt im Bereich', () => {
    expect(storyBase('dir', 4)).toEqual({ u: 4, factors: [1, 2] });
    expect(storyBase('dir', 3)).toEqual({ u: 3, factors: [1, 2, 3] });
    expect(storyBase('ind', 3)).toEqual({ u: 3, factors: [1, 2, 3] });
    expect(storyBase('ind', 6)).toEqual({ u: 6, factors: [1, 2] });
    expect(storyBase('ind', 9).u).toBe(4);
    expect(storyBase('lin', 5)).toEqual({ u: 5, factors: [1, 2] });
    expect(storyBase('dir', 8).u).toBe(4);
    for (const kind of ['dir', 'ind', 'lin'] as const) {
      for (let x0 = 0.5; x0 <= 12; x0 += 0.5) {
        const { u, factors } = storyBase(kind, x0);
        for (const f of factors) expect(f * u).toBeLessThanOrEqual(X_MAX[kind] + 1e-9);
        expect(u).toBeGreaterThan(0);
        if (kind === 'ind') expect(Number.isInteger(u)).toBe(true);
      }
    }
  });

  it('Wertetabelle: Spalten enthalten 1, u und 2u, aufsteigend, 4–5 Spalten', () => {
    expect(tableXs('dir', 4)).toEqual([1, 2, 4, 8]);
    expect(tableXs('ind', 3)).toEqual([1, 3, 6, 9]);
    expect(tableXs('lin', 5)).toEqual([1, 2, 5, 10]);
    expect(tableXs('ind', 6)).toEqual([1, 2, 6, 12]);
    for (const kind of ['dir', 'ind', 'lin'] as const) {
      for (let x0 = 0.5; x0 <= 12; x0 += 0.5) {
        const xs = tableXs(kind, x0);
        const { u } = storyBase(kind, x0);
        expect(xs).toContain(1);
        expect(xs).toContain(u);
        expect(xs).toContain(2 * u);
        expect(xs.length).toBeGreaterThanOrEqual(4);
        expect(xs.length).toBeLessThanOrEqual(5);
        for (let i = 1; i < xs.length; i++) expect(xs[i]!).toBeGreaterThan(xs[i - 1]!);
      }
    }
  });

  it('x wird passend gerundet: Pumpen ganzzahlig, sonst in halben Schritten', () => {
    expect(clampX('ind', 3.4)).toBe(3);
    expect(clampX('ind', 0)).toBe(1);
    expect(clampX('ind', 15)).toBe(12);
    expect(clampX('dir', 7.3)).toBe(7.5);
    expect(clampX('dir', 12)).toBe(10);
    expect(clampX('lin', 0)).toBe(0.5);
  });
});

describe('Modell: Test „Ist das proportional?“', () => {
  it('Fallen: Taxi (Grundgebühr) und Alter ↔ Größe sind nicht proportional', () => {
    expect(classify(TABLES.d).verdict).toBe('none');
    expect(classify(TABLES.d).quotients.map((q) => Math.round(q * 100) / 100)).toEqual([3.5, 2.6, 2.3]);
    expect(classify(TABLES.e).verdict).toBe('none');
  });
  it('Fahrzeit für 120 km ist indirekt proportional zur Geschwindigkeit (x · y = 120)', () => {
    const f = classify(TABLES.f);
    expect(f.verdict).toBe('ind');
    expect(f.k).toBe(120);
  });
  it('Tabellen aus Lehrbuch-Aufgaben', () => {
    expect(classify([[1, 6], [2, 3], [4, 1.5]]).verdict).toBe('ind');
    expect(classify([[2, 5], [4, 10], [10, 25]]).verdict).toBe('dir');
    expect(classify([[1, 2], [2, 4], [3, 7]]).verdict).toBe('none');
    // Rundungsfehler bei Dezimalzahlen werden toleriert
    expect(classify([[0.1, 0.3], [0.2, 0.6], [0.3, 0.9]]).verdict).toBe('dir');
  });
});

describe('Modell: Plausibilität über viele Zufallswerte', () => {
  it('Verdoppeln/Verdreifachen von x: direkt gleich, indirekt Kehrwert, Taxi weder noch', () => {
    const rnd = seededRandom(20261020);
    for (let i = 0; i < 400; i++) {
      const k = 0.5 + rnd() * 59.5;
      const b = 0.5 + rnd() * 6;
      const x = 0.5 + rnd() * 11.5;
      const f = 1 + Math.floor(rnd() * 4);
      const d: Relation = { kind: 'dir', k, b: 0 };
      const n: Relation = { kind: 'ind', k, b: 0 };
      const l: Relation = { kind: 'lin', k, b };
      expect(value(d, f * x)).toBeCloseTo(f * value(d, x), 9);
      expect(value(n, f * x)).toBeCloseTo(value(n, x) / f, 9);
      expect(quotient(d, x)).toBeCloseTo(k, 9);
      expect(product(n, x)).toBeCloseTo(k, 9);
      if (f > 1) {
        expect(value(l, f * x)).toBeLessThan(f * value(l, x));
        expect(quotient(l, f * x)).toBeLessThan(quotient(l, x));
      }
      // Dreisatz über die Einheit liefert immer den richtigen Wert
      const x0 = 1 + Math.floor(rnd() * 10);
      for (const r of [d, n]) {
        const r3 = ruleOfThree(r, x0, x)!;
        const y = applyOp(applyOp(r3.rows[0][1], r3.right[0]), r3.right[1]);
        expect(y).toBeCloseTo(value(r, x), 9);
      }
      // Zufällige Tabellen werden richtig erkannt
      const xs = [1 + Math.floor(rnd() * 3), 4 + Math.floor(rnd() * 3), 8 + Math.floor(rnd() * 4)];
      expect(classify(xs.map((t) => [t, value(d, t)] as [number, number])).verdict).toBe('dir');
      expect(classify(xs.map((t) => [t, value(n, t)] as [number, number])).verdict).toBe('ind');
      expect(classify(xs.map((t) => [t, value(l, t)] as [number, number])).verdict).toBe('none');
    }
  });
});
