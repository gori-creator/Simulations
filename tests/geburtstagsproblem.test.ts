import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { allDifferentSeries, band95, certainFrom, distinctDays, expectedSharedPairs, factors, pApprox, sharedPairs } from '../src/simulations/mathematik/geburtstagsproblem/model';
import { dayOfYear, duplicates, hasMine, hasShared, monthDay, mulberry32, pairs, pAllDifferent, pMine, pShared, randomClass, smallestN } from '../src/simulations/mathematik/geburtstagsproblem/model';

describe('Modell: Geburtstagsproblem', () => {
  it('bekannte Werte: 23 → 50,7 %, 25 → 56,9 %, 50 → 97,0 %', () => {
    expect(pShared(23)).toBeCloseTo(0.5073, 4);
    expect(pShared(25)).toBeCloseTo(0.5687, 4);
    expect(pShared(10)).toBeCloseTo(0.1169, 4);
    expect(pShared(50)).toBeCloseTo(0.9704, 4);
  });
  it('Grenzfälle: 1 Person, 366 Personen', () => {
    expect(pShared(1)).toBe(0);
    expect(pAllDifferent(2)).toBeCloseTo(364 / 365, 12);
    expect(pShared(366)).toBe(1);
  });
  it('ab 23 Personen über 50 %', () => {
    expect(smallestN(0.5)).toBe(23);
    expect(smallestN(0.99)).toBe(57);
  });
  it('„an meinem Geburtstag“ ist viel unwahrscheinlicher', () => {
    expect(pMine(25)).toBeCloseTo(1 - (364 / 365) ** 25, 12);
    expect(pMine(25)).toBeCloseTo(0.0663, 4);
    expect(smallestN(0.5, pMine)).toBe(253);
  });
  it('Paare: 23 Personen bilden 253 Paare', () => {
    expect(pairs(23)).toBe(253);
  });
  it('Kalender: Tag im Jahr ↔ Monat und Tag', () => {
    expect(monthDay(0)).toEqual({ month: 0, day: 1 });
    expect(monthDay(31)).toEqual({ month: 1, day: 1 });
    expect(monthDay(364)).toEqual({ month: 11, day: 31 });
    for (let d = 0; d < 365; d++) {
      const md = monthDay(d);
      expect(dayOfYear(md.month, md.day)).toBe(d);
    }
  });
  it('gemeinsame Tage erkennen', () => {
    expect(duplicates([3, 5, 3, 7, 7, 7])).toEqual(
      new Map([
        [3, 2],
        [7, 3],
      ]),
    );
    expect(hasShared([1, 2, 3])).toBe(false);
    expect(hasMine([1, 2, 3], 2)).toBe(true);
  });
  it('Simulation liegt nahe am exakten Wert', () => {
    const rnd = mulberry32(42);
    let hits = 0;
    const N = 4000;
    for (let i = 0; i < N; i++) if (hasShared(randomClass(23, rnd))) hits++;
    expect(Math.abs(hits / N - pShared(23))).toBeLessThan(0.035);
  });
});


describe('Modell: Geburtstagsproblem – Ergänzungen', () => {
  it('Prüfwerte: 23 → 50,7 %, 30 → 70,6 %, 50 → 97,0 %', () => {
    expect(pShared(23) * 100).toBeCloseTo(50.73, 2);
    expect(pShared(30) * 100).toBeCloseTo(70.63, 2);
    expect(pShared(50) * 100).toBeCloseTo(97.04, 2);
  });
  it('Pfadregel: Produkt der Faktoren = P(alle verschieden)', () => {
    const f = factors(23);
    expect(f[0]).toBe(1);
    expect(f[22]).toBeCloseTo(343 / 365, 12);
    expect(f.reduce((a, b) => a * b, 1)).toBeCloseTo(pAllDifferent(23), 12);
    const s = allDifferentSeries(30);
    expect(s).toHaveLength(31);
    expect(s[0]).toBe(1);
    expect(s[23]).toBeCloseTo(pAllDifferent(23), 12);
    expect(1 - s[30]!).toBeCloseTo(pShared(30), 12);
  });
  it('Paare: Näherung liegt nahe am exakten Wert', () => {
    expect(pApprox(23)).toBeCloseTo(1 - (364 / 365) ** 253, 12);
    expect(Math.abs(pApprox(23) - pShared(23))).toBeLessThan(0.01);
    expect(expectedSharedPairs(23)).toBeCloseTo(253 / 365, 12);
    expect(sharedPairs([4, 4, 9, 4, 1, 1])).toBe(3 + 1);
  });
  it('andere Tageszahlen: Monate und Wochentage, Schubfachprinzip', () => {
    // 5 Personen, 12 Monate: 1 − 12·11·10·9·8 / 12⁵ ≈ 61,8 %
    expect(pShared(5, 12)).toBeCloseTo(1 - 95040 / 248832, 12);
    expect(pShared(5, 12) * 100).toBeCloseTo(61.81, 2);
    // 4 Personen, 7 Wochentage: 1 − 840/2401 ≈ 65,0 %
    expect(pShared(4, 7)).toBeCloseTo(1 - 840 / 2401, 12);
    expect(pShared(13, 12)).toBe(1);
    expect(pShared(12, 12)).toBeLessThan(1);
    expect(certainFrom(365)).toBe(366);
    expect(smallestN(0.5, (n) => pShared(n, 12))).toBe(5);
  });
  it('verschiedene Tage ziehen und 95-%-Bereich', () => {
    const d = distinctDays(40, seededRandom(7));
    expect(new Set(d).size).toBe(40);
    expect(distinctDays(20, seededRandom(1), 12)).toHaveLength(12);
    const [lo, hi] = band95(0.5, 100);
    expect(hi - lo).toBeCloseTo(2 * 1.96 * 0.05, 12);
    expect(band95(0.5, 0)).toEqual([0, 1]);
  });
  it('Simulation mit seededRandom: 2000 Klassen à 30 nahe 70,6 %', () => {
    const rnd = seededRandom(2026);
    let hits = 0;
    for (let i = 0; i < 2000; i++) if (hasShared(randomClass(30, rnd))) hits++;
    const [lo, hi] = band95(pShared(30), 2000);
    expect(hits / 2000).toBeGreaterThan(lo - 0.01);
    expect(hits / 2000).toBeLessThan(hi + 0.01);
  });
});
