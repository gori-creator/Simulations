import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { allDifferentSeries, band95, certainFrom, distinctDays, expectedSharedPairs, factors, pApprox, sharedPairs } from '../src/simulations/mathematik/geburtstagsproblem/model';
import { dayOfYear, duplicates, hasMine, hasShared, monthDay, mulberry32, pairs, pAllDifferent, pMine, pShared, randomClass, relation, smallestN } from '../src/simulations/mathematik/geburtstagsproblem/model';

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

describe('Prüfrunde Paket 3: Lehrbuchwerte, Aufgaben, Sonderfälle', () => {
  it('Formel 1 − 365!/((365 − n)! · 365ⁿ) als Produkt: n = 22 → 47,6 %, n = 23 → 50,7 %', () => {
    // 23: 1 − 365 · 364 · … · 343 / 365²³ ≈ 0,507297
    expect(pShared(22)).toBeCloseTo(0.475695, 6);
    expect(pShared(23)).toBeCloseTo(0.507297, 6);
    expect(pShared(22)).toBeLessThan(0.5);
    expect(pShared(70)).toBeCloseTo(0.99916, 5);
  });
  it('Aufgaben im Lernmaterial', () => {
    // A1: drei Personen ≈ 0,82 %
    expect(pAllDifferent(3)).toBeCloseTo((364 * 363) / 365 ** 2, 12);
    expect(pShared(3) * 100).toBeCloseTo(0.82, 2);
    // A2: n = 28 ≈ 65,4 %, 95-%-Bereich nach 1000 Klassen etwa 0,62 … 0,68
    expect(pShared(28) * 100).toBeCloseTo(65.45, 1);
    const [lo, hi] = band95(pShared(28), 1000);
    expect(lo).toBeGreaterThan(0.62);
    expect(hi).toBeLessThan(0.69);
    // A3: 30 Personen, 435 Paare, Näherung ≈ 69,7 %, exakt ≈ 70,6 %
    expect(pairs(30)).toBe(435);
    expect(pApprox(30) * 100).toBeCloseTo(69.68, 2);
    // A4: 25 andere Personen ≈ 6,6 %, 300 Paare in der Klasse
    expect(pMine(25) * 100).toBeCloseTo(6.63, 2);
    expect(pairs(25)).toBe(300);
    // A5: 4 Personen, 7 Wochentage ≈ 65,0 %, sicher ab 8
    expect(pShared(4, 7) * 100).toBeCloseTo(65.01, 2);
    expect(pShared(7, 7)).toBeLessThan(1);
    expect(pShared(8, 7)).toBe(1);
    expect(certainFrom(7)).toBe(8);
  });
  it('Näherung über Paare: n = 23 → ≈ 50,0 % (= „an meinem Geburtstag“ bei 253 anderen)', () => {
    expect(pApprox(23) * 100).toBeCloseTo(50.05, 2);
    expect(pMine(253)).toBeCloseTo(pApprox(23), 12);
    expect(pMine(252)).toBeLessThan(0.5);
  });
  it('Sonderfälle: 0 und 1 Person, mehr Personen als Tage, Faktor 0', () => {
    expect(pShared(0)).toBe(0);
    expect(pMine(0)).toBe(0);
    expect(pShared(1, 7)).toBe(0);
    expect(allDifferentSeries(13, 12)[13]).toBe(0);
    expect(factors(13, 12)[12]).toBe(0);
    expect(pairs(0)).toBe(0);
    expect(pairs(1)).toBe(0);
    expect(sharedPairs([])).toBe(0);
    expect(hasShared([])).toBe(false);
    expect(smallestN(1.01)).toBe(Infinity);
  });
  it('Gleichheitszeichen nur bei exakten Werten', () => {
    expect(relation(47 / 100, 3)).toBe('=');
    expect(relation(0.529, 3)).toBe('=');
    expect(relation(50, 1)).toBe('=');
    expect(relation(1 / 3, 3)).toBe('≈');
    expect(relation(pShared(23), 3)).toBe('≈');
    expect(relation(pAllDifferent(23), 4)).toBe('≈');
    expect(relation(1, 4)).toBe('=');
    expect(relation(0, 4)).toBe('=');
  });
});
