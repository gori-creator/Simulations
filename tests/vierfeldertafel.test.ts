import { describe, expect, it } from 'vitest';
import { additionRule, cellsFromTree, condBgivenA, distanceForOverlap, eventCells, eventCount, GIVEN_SETS, independent, independentTree, lensArea, prob, reduce, reverseTree, solveAll, solveStep, SUMS, table, tableValues, treeBranches, vennGeometry, type Cells } from '../src/simulations/mathematik/vierfeldertafel/model';

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

describe('Modell: Baum, umgekehrter Baum und Tafel ergänzen', () => {
  it('Prüfwert: P(A) = 0,4, P_A(B) = 0,7, P_Ā(B) = 0,2 → P(B) = 0,40, P_B(A) = 0,70', () => {
    const r = reverseTree(0.4, 0.7, 0.2);
    expect(r.pB).toBeCloseTo(0.4 * 0.7 + 0.6 * 0.2, 12);
    expect(r.pB).toBeCloseTo(0.4, 12);
    expect(r.pAgB).toBeCloseTo(0.28 / 0.4, 12);
    expect(r.pAgB).toBeCloseTo(0.7, 12);
    // P_B̄(A) = 0,12 / 0,60 = 0,2
    expect(r.pAgNB).toBeCloseTo(0.2, 12);
    const c = cellsFromTree(0.4, 0.7, 0.2);
    expect(c[0]).toBeCloseTo(0.28, 12);
    expect(c[1]).toBeCloseTo(0.12, 12);
    expect(c[2]).toBeCloseTo(0.12, 12);
    expect(c[3]).toBeCloseTo(0.48, 12);
    expect(c.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  });
  it('Unabhängigkeit: P_A(B) = P_Ā(B) ⇔ P(A ∩ B) = P(A) · P(B)', () => {
    expect(independentTree(0.3, 0.3)).toBe(true);
    expect(independentTree(0.7, 0.2)).toBe(false);
    const c = cellsFromTree(0.25, 0.6, 0.6);
    expect(c[0]).toBeCloseTo(0.25 * reverseTree(0.25, 0.6, 0.6).pB, 12);
    // Zähldaten: 12, 18, 8, 12 sind unabhängig, der Baum hat gleiche zweite Äste
    expect(12 / 30).toBeCloseTo(8 / 20, 12);
  });
  it('Randfälle: P(B) = 0 bzw. 1', () => {
    expect(reverseTree(0.5, 0, 0).pAgB).toBe(0);
    expect(reverseTree(0.5, 1, 1).pAgNB).toBe(0);
  });
  it('Tafel ergänzen: Werte und Summen', () => {
    expect(tableValues(C)).toEqual([10, 4, 14, 9, 7, 16, 19, 11, 30]);
    const v = tableValues(C);
    for (const [a, b, s] of SUMS) expect(v[a]! + v[b]!).toBe(v[s]!);
  });
  it('Tafel ergänzen: Schritte und Lösbarkeit der Vorgaben', () => {
    const known = [true, false, true, false, false, false, true, false, true];
    expect(solveStep(known, 1)).toEqual({ target: 1, from: [2, 0], op: '−' });
    expect(solveStep(known, 4)).toBeNull();
    for (const set of Object.values(GIVEN_SETS)) {
      const k = Array.from({ length: 9 }, (_, i) => set.includes(i));
      expect(solveAll(k)).toHaveLength(9 - set.length);
    }
    // nur zwei Werte bekannt: nicht vollständig lösbar
    const two = Array.from({ length: 9 }, (_, i) => i === 0 || i === 8);
    expect(solveAll(two).length).toBeLessThan(7);
  });
});
