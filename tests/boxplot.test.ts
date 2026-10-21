import { describe, expect, it } from 'vitest';
import {
  autoRange,
  clampData,
  CONTEXTS,
  dataDecimals,
  formatData,
  mean,
  median,
  medianRanks,
  niceStep,
  parseData,
  quartileRanks,
  shareAtMost,
  snap,
  sortRanks,
  swarmLevels,
  summarize,
  ticksBetween,
  whiskers,
} from '../src/simulations/mathematik/boxplot/model';

describe('Modell: Boxplot – Einlesen', () => {
  it('liest Semikolon-Listen mit Dezimalkomma', () => {
    expect(parseData('3,4; 3,8;2,9')).toEqual([3.4, 3.8, 2.9]);
    expect(parseData('1 2  3')).toEqual([1, 2, 3]);
    expect(parseData('1.5; 2,5 | 4/5')).toEqual([1.5, 2.5, 4, 5]);
  });
  it('übergeht Ungültiges und versteht das Minuszeichen', () => {
    expect(parseData('a; 4; ; −2; 3x')).toEqual([4, -2]);
    expect(parseData('')).toEqual([]);
  });
  it('gibt Listen im deutschen und englischen Format aus und liest sie wieder', () => {
    const v = [3.4, 3.8, -2];
    expect(formatData(v, 1, 'de')).toBe('3,4; 3,8; −2');
    expect(formatData(v, 1, 'en')).toBe('3.4; 3.8; −2');
    expect(parseData(formatData(v, 1, 'de'))).toEqual(v);
  });
  it('rundet auf das Raster ohne Gleitkomma-Reste', () => {
    expect(snap(3.4000001, 0.1)).toBe(3.4);
    expect(snap(0.1 + 0.2, 0.1)).toBe(0.3);
    expect(clampData([-5, 12.4, 99], 0, 30, 1)).toEqual([0, 12, 30]);
    expect(dataDecimals([1, 2.5, 3.25])).toBe(2);
  });
});

describe('Modell: Boxplot – Kennwerte', () => {
  it('ungerade Anzahl (n = 15): Median ist der 8. Wert, Quartile aus je 7 Werten', () => {
    const s = summarize(CONTEXTS.test.a);
    expect(s.n).toBe(15);
    expect(s.min).toBe(9);
    expect(s.q1).toBe(16);
    expect(s.med).toBe(20);
    expect(s.q3).toBe(24);
    expect(s.max).toBe(28);
    expect(s.mean).toBeCloseTo(295 / 15, 12);
    expect(s.range).toBe(19);
    expect(s.iqr).toBe(8);
  });
  it('Klasse B: gleicher Median und Mittelwert, aber größere Streuung', () => {
    const a = summarize(CONTEXTS.test.a);
    const b = summarize(CONTEXTS.test.b);
    expect(b.med).toBe(a.med);
    expect(b.mean).toBeCloseTo(a.mean, 12);
    expect(b.iqr).toBeGreaterThan(a.iqr);
    expect(b.q1).toBe(13);
    expect(b.q3).toBe(27);
  });
  it('gerade Anzahl (n = 12): Median und Quartile als Mittel zweier Werte', () => {
    const s = summarize(CONTEXTS.sprung.a);
    expect(s.med).toBeCloseTo(3.65, 12);
    expect(s.q1).toBeCloseTo(3.3, 12);
    expect(s.q3).toBeCloseTo(3.95, 12);
  });
  it('ein Ausreißer zieht den Mittelwert, nicht den Median', () => {
    const v = CONTEXTS.geld.a;
    expect(median(v)).toBe(25);
    expect(mean(v)).toBeCloseTo(355 / 11, 12);
    const s = summarize(v);
    expect(s.q1).toBe(20);
    expect(s.q3).toBe(35);
    const w = whiskers(s, true);
    expect(w.outliers).toEqual([90]);
    expect(w.hi).toBe(40);
    expect(whiskers(s, false).hi).toBe(90);
  });
  it('Schulweg: 45 min ist Ausreißer (Grenze 22,5 + 1,5 · 11,5 = 39,75)', () => {
    const s = summarize(CONTEXTS.weg.a);
    expect(s.q1).toBe(11);
    expect(s.q3).toBe(22.5);
    expect(whiskers(s, true).outliers).toEqual([45]);
  });
  it('Grenzfälle: ein, zwei und kein Wert', () => {
    const one = summarize([7]);
    expect([one.min, one.q1, one.med, one.q3, one.max]).toEqual([7, 7, 7, 7, 7]);
    const two = summarize([2, 6]);
    expect([two.q1, two.med, two.q3]).toEqual([2, 4, 6]);
    expect(Number.isNaN(summarize([]).med)).toBe(true);
  });
  it('mindestens 25 % der Werte liegen höchstens bei Q₁, mindestens 50 % höchstens beim Median', () => {
    for (const c of Object.values(CONTEXTS)) {
      for (const v of [c.a, c.b]) {
        const s = summarize(v);
        expect(shareAtMost(v, s.q1)).toBeGreaterThanOrEqual(0.25);
        expect(shareAtMost(v, s.med)).toBeGreaterThanOrEqual(0.5);
        expect(s.min).toBeLessThanOrEqual(s.q1);
        expect(s.q1).toBeLessThanOrEqual(s.med);
        expect(s.med).toBeLessThanOrEqual(s.q3);
        expect(s.q3).toBeLessThanOrEqual(s.max);
        // Beispieldaten liegen im Bereich des Zahlenstrahls
        if (c.id !== 'own') for (const x of v) expect(x >= c.min && x <= c.max).toBe(true);
      }
    }
  });
});

describe('Modell: Boxplot – Prüfwerte (Prüfrunde)', () => {
  it('Median bei ungerader und gerader Anzahl', () => {
    expect(median([2, 3, 5, 8, 9])).toBe(5);
    expect(median([2, 3, 5, 8])).toBe(4);
    expect(median([9, 2, 8, 3, 5])).toBe(5); // ungeordnete Urliste
  });
  it('Quartile 1 … 9: Median der Hälften ohne den Median (Q₁ = 2,5; Q₃ = 7,5)', () => {
    const s = summarize([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect([s.min, s.q1, s.med, s.q3, s.max]).toEqual([1, 2.5, 5, 7.5, 9]);
    expect(s.range).toBe(8);
    expect(s.iqr).toBe(5);
    expect(s.mean).toBe(5);
    expect(quartileRanks(9)).toEqual({ q1: [2, 3], med: [5], q3: [7, 8] });
  });
  it('Ausreißer 1, 2, 3, 4, 100: Mittelwert 22, Median 3', () => {
    const s = summarize([1, 2, 3, 4, 100]);
    expect(s.mean).toBe(22);
    expect(s.med).toBe(3);
    expect(s.q1).toBe(1.5);
    expect(s.q3).toBe(52);
    // bei nur 5 Werten ist die Box so breit, dass die 1,5-IQR-Regel die 100 nicht kennzeichnet
    expect(whiskers(s, true).outliers).toEqual([]);
    // ohne die 100: Mittelwert 2,5, Median 2,5
    expect(mean([1, 2, 3, 4])).toBe(2.5);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it('Sonderfälle: drei Werte, alle gleich, negative Werte', () => {
    const three = summarize([4, 1, 7]);
    expect([three.q1, three.med, three.q3]).toEqual([1, 4, 7]);
    const same = summarize([5, 5, 5, 5]);
    expect([same.min, same.q1, same.med, same.q3, same.max, same.mean, same.range, same.iqr]).toEqual([5, 5, 5, 5, 5, 5, 0, 0]);
    expect(whiskers(same, true).outliers).toEqual([]);
    const neg = summarize([-3, -1.5, 0, 2]);
    expect(neg.q1).toBeCloseTo(-2.25, 12);
    expect(neg.med).toBeCloseTo(-0.75, 12);
    expect(neg.q3).toBeCloseTo(1, 12);
    expect(neg.mean).toBeCloseTo(-0.625, 12);
    expect(neg.range).toBe(5);
  });
  it('Aufgabe 6: 5; 8; 10; 12; 65 hat Median 10 und Mittelwert 20', () => {
    const s = summarize(parseData('5; 8; 10; 12; 65'));
    expect(s.med).toBe(10);
    expect(s.mean).toBe(20);
  });
  it('Taschengeld ohne die 90 €: Mittelwert 26,5, Median 25', () => {
    const v = CONTEXTS.geld.a.filter((x) => x !== 90);
    expect(mean(v)).toBe(26.5);
    expect(median(v)).toBe(25);
  });
});

describe('Modell: Boxplot – Rangplätze und Zahlenstrahl', () => {
  it('Rangplätze für Median und Quartile', () => {
    expect(medianRanks(15)).toEqual([8]);
    expect(medianRanks(12)).toEqual([6, 7]);
    expect(quartileRanks(15)).toEqual({ q1: [4], med: [8], q3: [12] });
    expect(quartileRanks(12)).toEqual({ q1: [3, 4], med: [6, 7], q3: [9, 10] });
    expect(quartileRanks(11)).toEqual({ q1: [3], med: [6], q3: [9] });
  });
  it('stapelt gleiche Werte und ordnet stabil', () => {
    expect(swarmLevels([3, 5, 3, 3], 1)).toEqual([0, 0, 1, 2]);
    expect(swarmLevels([0, 4, 8, 30], 10)).toEqual([0, 1, 2, 0]);
    expect(sortRanks([30, 10, 20, 10])).toEqual([3, 0, 2, 1]);
  });
  it('runde Schritte und Striche', () => {
    expect(niceStep(0.37)).toBe(0.5);
    expect(niceStep(7)).toBe(10);
    expect(niceStep(2.2)).toBe(2.5);
    expect(ticksBetween(2, 3, 0.5)).toEqual([2, 2.5, 3]);
    const r = autoRange([4, 7, 2, 9]);
    expect(r.min).toBeLessThan(2);
    expect(r.max).toBeGreaterThan(9);
    expect(r.step).toBe(1);
  });
});
