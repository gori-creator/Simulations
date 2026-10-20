import { describe, expect, it } from 'vitest';
import { asFraction, baseValue, discounted, gross, isNice, percentRate, percentValue, ruleOfThree } from '../src/simulations/mathematik/prozentstreifen/model';

describe('Modell: Prozentstreifen', () => {
  it('Prozentwert, Prozentsatz und Grundwert (Lehrbuchwerte)', () => {
    expect(percentValue(80, 25)).toBe(20);
    expect(percentRate(40, 14)).toBeCloseTo(35, 12);
    expect(baseValue(30, 12)).toBeCloseTo(250, 12);
    expect(percentValue(28, 25)).toBe(7);
    expect(percentValue(500, 2)).toBe(10);
  });
  it('Rabatt und Mehrwertsteuer', () => {
    expect(discounted(60, 30)).toBeCloseTo(42, 12);
    expect(gross(200, 19)).toBeCloseTo(238, 12);
  });
  it('Dreisatz: 100 % ≙ 80 → 1 % ≙ 0,8 → 25 % ≙ 20', () => {
    const r = ruleOfThree('W', 80, 25);
    expect(r[0]).toEqual([100, 80]);
    expect(r[1]![1]).toBeCloseTo(0.8, 12);
    expect(r[2]).toEqual([25, 20]);
  });
  it('Dreisatz rückwärts: 12 % ≙ 30 → 1 % ≙ 2,5 → 100 % ≙ 250', () => {
    const r = ruleOfThree('G', 250, 12);
    expect(r[0]![0]).toBe(12);
    expect(r[0]![1]).toBeCloseTo(30, 12);
    expect(r[1]![1]).toBeCloseTo(2.5, 12);
    expect(r[2]![1]).toBe(250);
  });
  it('Prozentsatz gesucht: 28 ≙ 100 % → 1 ≙ 100/28 % → 7 ≙ 25 %', () => {
    const r = ruleOfThree('p', 28, 25);
    expect(r[1]![0]).toBeCloseTo(100 / 28, 12);
    expect(r[2]).toEqual([25, 7]);
  });
  it('Brüche gekürzt', () => {
    expect(asFraction(25)).toEqual([1, 4]);
    expect(asFraction(30)).toEqual([3, 10]);
    expect(asFraction(19)).toEqual([19, 100]);
    expect(asFraction(100)).toEqual([1, 1]);
  });
  it('Sonderfälle und Plausibilität', () => {
    expect(Number.isNaN(baseValue(5, 0))).toBe(true);
    expect(isNice(13.2, 0)).toBe(false);
    expect(isNice(7, 0)).toBe(true);
    for (let G = 1; G <= 300; G += 7) {
      for (let p = 0; p <= 150; p += 11) {
        const W = percentValue(G, p);
        expect(percentRate(G, W)).toBeCloseTo(p, 9);
        if (p > 0) expect(baseValue(W, p)).toBeCloseTo(G, 9);
        expect(discounted(G, p) + W).toBeCloseTo(G, 9);
      }
    }
  });
});
