import { describe, expect, it } from 'vitest';
import { branchRaw, buildTree, drawPath, eventProb, fadd, frac, fval, inEvent, leaves, maxStages, parseSel, pathProb, rawProduct, urnAfter, type Urn } from '../src/simulations/mathematik/baumdiagramm/model';

const U: Urn = { r: 3, b: 4, g: 0 };

describe('Modell: Baumdiagramm – Brüche', () => {
  it('kürzt und rechnet exakt', () => {
    expect(frac(6, 42)).toEqual({ n: 1, d: 7 });
    expect(fadd(frac(1, 7), frac(2, 7))).toEqual({ n: 3, d: 7 });
    expect(frac(0, 5)).toEqual({ n: 0, d: 1 });
    expect(rawProduct([frac(3, 7), frac(2, 6)])).toEqual({ n: 3, d: 21 });
  });
});

describe('Modell: Baumdiagramm – Urne', () => {
  it('ohne Zurücklegen: Nenner werden kleiner', () => {
    expect(branchRaw(U, '', 'r', false)).toEqual({ n: 3, d: 7 });
    expect(branchRaw(U, 'r', 'r', false)).toEqual({ n: 2, d: 6 });
    expect(branchRaw(U, 'r', 'b', false)).toEqual({ n: 4, d: 6 });
    expect(urnAfter(U, 'rb', false)).toEqual({ r: 2, b: 3, g: 0 });
  });
  it('1. Pfadregel: P(rr) = 3/7 · 2/6 = 1/7', () => {
    expect(pathProb(U, 'rr', false)).toEqual({ n: 1, d: 7 });
    expect(pathProb(U, 'rb', false)).toEqual({ n: 2, d: 7 });
    expect(pathProb(U, 'rr', true)).toEqual({ n: 9, d: 49 });
  });
  it('alle Pfade zusammen ergeben 1', () => {
    for (const rep of [false, true]) {
      for (const n of [1, 2, 3]) {
        const t = buildTree({ r: 2, b: 3, g: 1 }, n, rep);
        const s = leaves(t).reduce((a, l) => fadd(a, l.prob), frac(0, 1));
        expect(s).toEqual({ n: 1, d: 1 });
      }
    }
  });
  it('2. Pfadregel: P(gleiche Farbe) = 1/7 + 2/7 = 3/7', () => {
    expect(eventProb(buildTree(U, 2, false), 'same')).toEqual({ n: 3, d: 7 });
    expect(eventProb(buildTree(U, 2, true), 'same')).toEqual({ n: 25, d: 49 });
  });
  it('Gegenereignis: P(mindestens eine rote) = 1 − P(keine rote)', () => {
    expect(eventProb(buildTree(U, 3, true), 'minR')).toEqual({ n: 279, d: 343 });
    expect(eventProb(buildTree(U, 3, false), 'minR')).toEqual({ n: 31, d: 35 });
    expect(fval(eventProb(buildTree(U, 3, false), 'noR'))).toBeCloseTo(4 / 35, 12);
  });
  it('aufgebrauchte Farben verschwinden aus dem Baum', () => {
    const t = buildTree({ r: 2, b: 1, g: 0 }, 3, false);
    expect(leaves(t).map((l) => l.path)).toEqual(['rrb', 'rbr', 'brr']);
    for (const l of leaves(t)) expect(l.prob).toEqual({ n: 1, d: 3 });
    expect(maxStages({ r: 1, b: 1, g: 0 }, false)).toBe(2);
  });
  it('Drei Farben: P(verschieden) = 11/15', () => {
    expect(eventProb(buildTree({ r: 2, b: 3, g: 1 }, 2, false), 'diff')).toEqual({ n: 11, d: 15 });
  });
  it('Ereignisse und Auswahl', () => {
    expect(inEvent('oneR', 'rb')).toBe(true);
    expect(inEvent('oneR', 'rr')).toBe(false);
    expect(inEvent('firstR', 'rb')).toBe(true);
    expect(inEvent('custom', 'br', ['br'])).toBe(true);
    expect(parseSel('rb, xx; BR', ['rr', 'rb', 'br', 'bb'])).toEqual(['rb', 'br']);
  });
  it('Simulation trifft die Wahrscheinlichkeit ungefähr', () => {
    let s = 1;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    let hits = 0;
    const N = 20000;
    for (let i = 0; i < N; i++) if (drawPath(U, 2, false, rnd) === 'rr') hits++;
    expect(hits / N).toBeGreaterThan(1 / 7 - 0.02);
    expect(hits / N).toBeLessThan(1 / 7 + 0.02);
  });
});
