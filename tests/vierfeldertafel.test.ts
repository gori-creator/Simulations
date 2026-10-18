import { describe, expect, it } from 'vitest';
import { additionRule, condBgivenA, distanceForOverlap, eventCells, eventCount, independent, lensArea, prob, reduce, table, treeBranches, vennGeometry, type Cells } from '../src/simulations/mathematik/vierfeldertafel/model';

const C: Cells = [10, 4, 9, 7];

describe('Modell: Vierfeldertafel', () => {
  it('Randsummen', () => {
    expect(table(C)).toMatchObject({ A: 14, nA: 16, B: 19, nB: 11, N: 30 });
  });
  it('Additionssatz: P(A ∪ B) = 14/30 + 19/30 − 10/30 = 23/30', () => {
    const r = additionRule(C);
    expect(r.pAuB).toBeCloseTo(23 / 30, 12);
    expect(r.pA + r.pB - r.pAB).toBeCloseTo(r.pAuB, 12);
    expect(eventCount(C, 'AuB')).toBe(23);
  });
  it('Gegenereignis und weitere Ereignisse', () => {
    expect(prob(C, 'nA')).toBeCloseTo(1 - prob(C, 'A'), 12);
    expect(eventCount(C, 'xor')).toBe(13);
    expect(eventCount(C, 'none2')).toBe(7);
    // jede Zelle gehört zu genau einem von E und Ē
    expect(eventCells('AuB').map((v, i) => v !== eventCells('none2')[i])).toEqual([true, true, true, true]);
  });
  it('Baum A zuerst und umgekehrt: Blätter = Zellen', () => {
    const ab = treeBranches(C, 'AB');
    expect(ab.first[0]).toEqual({ k: 14, n: 30 });
    expect(ab.second[0][0]).toEqual({ k: 10, n: 14 });
    const ba = treeBranches(C, 'BA');
    expect(ba.first[0]).toEqual({ k: 19, n: 30 });
    expect(ba.second[0][0]).toEqual({ k: 10, n: 19 });
    expect(ba.second[1][0]).toEqual({ k: 4, n: 11 });
    // 19/30 · 10/19 = 1/3 = 10/30
    expect((19 / 30) * (10 / 19)).toBeCloseTo(10 / 30, 12);
    expect(ba.leafCells).toEqual([0, 2, 1, 3]);
  });
  it('bedingte Wahrscheinlichkeit und Unabhängigkeit', () => {
    expect(condBgivenA(C)).toBeCloseTo(10 / 14, 12);
    expect(independent([12, 18, 8, 12])).toBe(true);
    expect(independent(C)).toBe(false);
  });
  it('Brüche kürzen', () => {
    expect(reduce(10, 30)).toEqual({ n: 1, d: 3 });
    expect(reduce(0, 30)).toEqual({ n: 0, d: 1 });
  });
});

describe('Modell: flächentreues Mengendiagramm', () => {
  it('Linsenfläche in Grenzfällen', () => {
    expect(lensArea(1, 1, 2)).toBe(0);
    expect(lensArea(1, 2, 0.5)).toBeCloseTo(Math.PI, 12);
    // zwei Einheitskreise im Abstand 1: 2π/3 − √3/2
    expect(lensArea(1, 1, 1)).toBeCloseTo((2 * Math.PI) / 3 - Math.sqrt(3) / 2, 10);
  });
  it('Abstand passend zur gewünschten Überlappung', () => {
    const d = distanceForOverlap(3, 2, 5);
    expect(lensArea(3, 2, d)).toBeCloseTo(5, 6);
  });
  it('Kreisflächen und Überlappung proportional zu den Anzahlen', () => {
    const area = 3000;
    const v = vennGeometry(C, area);
    expect(Math.PI * v.rA ** 2).toBeCloseTo((14 / 30) * area, 6);
    expect(Math.PI * v.rB ** 2).toBeCloseTo((19 / 30) * area, 6);
    expect(lensArea(v.rA, v.rB, v.d)).toBeCloseTo((10 / 30) * area, 4);
  });
});
