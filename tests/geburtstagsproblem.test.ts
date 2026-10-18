import { describe, expect, it } from 'vitest';
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
