import { describe, expect, it } from 'vitest';
import { degree, endBehaviour, evaluate, expand, mergeRoots, signChart, zeroKind } from '../src/simulations/mathematik/ganzrationale-funktionen/model';

describe('Modell: Ganzrationale Funktionen', () => {
  it('Ausmultiplizieren: 0,5 · (x + 2)(x − 0,5)(x − 3)', () => {
    const c = expand(0.5, [
      { x: -2, m: 1 },
      { x: 0.5, m: 1 },
      { x: 3, m: 1 },
    ]);
    // 0,5x³ − 0,75x² − 2,75x + 1,5
    expect(c[3]).toBeCloseTo(0.5, 12);
    expect(c[2]).toBeCloseTo(-0.75, 12);
    expect(c[1]).toBeCloseTo(-2.75, 12);
    expect(c[0]).toBeCloseTo(1.5, 12);
  });
  it('Normalform und Linearfaktoren liefern dieselben Werte', () => {
    const roots = [
      { x: 1, m: 3 },
      { x: -3, m: 1 },
    ];
    const c = expand(0.3, roots);
    for (const x of [-4, -1.5, 0, 2.2, 5]) {
      const v = c.reduce((s, k, i) => s + k * x ** i, 0);
      expect(v).toBeCloseTo(evaluate(0.3, roots, x), 9);
    }
    expect(degree(roots)).toBe(4);
  });
  it('Art der Nullstelle nach Vielfachheit', () => {
    expect(zeroKind(1)).toBe('cross');
    expect(zeroKind(2)).toBe('touch');
    expect(zeroKind(3)).toBe('terrace');
    expect(zeroKind(4)).toBe('touch');
  });
  it('Randverhalten', () => {
    expect(endBehaviour(0.5, 3)).toEqual({ left: -1, right: 1 });
    expect(endBehaviour(-1, 3)).toEqual({ left: 1, right: -1 });
    expect(endBehaviour(2, 4)).toEqual({ left: 1, right: 1 });
    expect(endBehaviour(-2, 2)).toEqual({ left: -1, right: -1 });
  });
  it('Zusammenfallende Nullstellen addieren ihre Vielfachheit', () => {
    const m = mergeRoots([
      { x: 1, m: 1 },
      { x: -2, m: 1 },
      { x: 1, m: 2 },
    ]);
    expect(m).toEqual([
      { x: -2, m: 1 },
      { x: 1, m: 3 },
    ]);
  });
  it('Vorzeichentabelle: kein Wechsel an doppelten Nullstellen', () => {
    const s = signChart(0.2, [
      { x: -3, m: 1 },
      { x: 0, m: 2 },
      { x: 3, m: 1 },
    ]);
    expect(s).toEqual([1, -1, -1, 1]);
    // Stichproben
    const f = (x: number) => evaluate(0.2, [{ x: -3, m: 1 }, { x: 0, m: 2 }, { x: 3, m: 1 }], x);
    expect(Math.sign(f(-4))).toBe(1);
    expect(Math.sign(f(-1))).toBe(-1);
    expect(Math.sign(f(1))).toBe(-1);
    expect(Math.sign(f(4))).toBe(1);
  });
});
