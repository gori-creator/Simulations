import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  asFraction,
  baseValue,
  chainFactor,
  changeSign,
  discounted,
  factorOf,
  fractionToPercent,
  gridFill,
  gross,
  interest,
  isNice,
  percentRate,
  percentValue,
  problem,
  randomTask,
  ruleOfThree,
  shareRate,
  wrongBase,
  type Sit,
} from '../src/simulations/mathematik/prozentstreifen/model';

describe('Modell: Prozentstreifen', () => {
  it('Prüfwerte: 25 % von 80 € = 20 €; 15 % ≙ 36 → G = 240; 12 von 48 = 25 %', () => {
    expect(percentValue(80, 25)).toBe(20);
    expect(baseValue(36, 15)).toBeCloseTo(240, 12);
    expect(percentRate(48, 12)).toBeCloseTo(25, 12);
    expect(problem('none', 'W', 80, 25).result).toBe(20);
    expect(problem('none', 'G', 240, 15).W).toBeCloseTo(36, 12);
    expect(problem('none', 'G', 240, 15).result).toBeCloseTo(240, 12);
    expect(problem('klasse', 'p', 48, 25).W).toBe(12);
    expect(problem('klasse', 'p', 48, 25).result).toBeCloseTo(25, 12);
  });

  it('Prüfwerte Alltag: Rabatt 20 % auf 60 € → 48 €; 50 € + 19 % MwSt → 59,50 €; 119 € brutto → 100 € netto', () => {
    expect(discounted(60, 20)).toBeCloseTo(48, 12);
    const r = problem('rabatt', 'W', 60, 20);
    expect(r.q).toBe(80);
    expect(r.W).toBeCloseTo(48, 12);
    expect(r.D).toBeCloseTo(12, 12);
    expect(gross(50, 19)).toBeCloseTo(59.5, 12);
    const m = problem('mwst', 'W', 50, 19);
    expect(m.W).toBeCloseTo(59.5, 12);
    expect(m.D).toBeCloseTo(9.5, 12);
    const back = problem('mwst', 'G', 100, 19);
    expect(back.W).toBeCloseTo(119, 12);
    expect(baseValue(119, 119)).toBeCloseTo(100, 12);
    expect(back.result).toBeCloseTo(100, 12);
  });

  it('Prüfwert Zinsen: 1200 € zu 2,5 % für ein Jahr → 30 €', () => {
    expect(interest(1200, 2.5)).toBeCloseTo(30, 12);
    const z = problem('zins', 'W', 1200, 2.5);
    expect(z.W).toBeCloseTo(30, 12);
    expect(z.G + z.W).toBeCloseTo(1230, 12);
  });

  it('Stolperstein: 84 € nach +20 % → vorher 70 €, nicht 84 € − 20 % = 67,20 €', () => {
    const e = problem('erh', 'G', 70, 20);
    expect(e.q).toBe(120);
    expect(e.W).toBeCloseTo(84, 12);
    expect(e.result).toBeCloseTo(70, 12);
    expect(wrongBase('erh', 84, 20)).toBeCloseTo(67.2, 12);
    const rows = ruleOfThree('G', 70, 120);
    expect(rows[0]![0]).toBe(120);
    expect(rows[0]![1]).toBeCloseTo(84, 12);
    expect(rows[1]![1]).toBeCloseTo(0.7, 12);
    expect(rows[2]![1]).toBe(70);
    // Rabatt rückwärts: 48 € nach −20 % → 60 €, falsch wäre 48 € + 20 % = 57,60 €
    expect(problem('rabatt', 'G', 60, 20).result).toBeCloseTo(60, 12);
    expect(wrongBase('rabatt', 48, 20)).toBeCloseTo(57.6, 12);
  });

  it('Brüche und Prozente: ¾ = 75 %, 1 % von 250 = 2,5; gekürzte Brüche', () => {
    expect(fractionToPercent(3, 4)).toBe(75);
    expect(asFraction(75)).toEqual([3, 4]);
    expect(ruleOfThree('W', 250, 10)[1]![1]).toBeCloseTo(2.5, 12);
    expect(asFraction(25)).toEqual([1, 4]);
    expect(asFraction(30)).toEqual([3, 10]);
    expect(asFraction(19)).toEqual([19, 100]);
    expect(asFraction(100)).toEqual([1, 1]);
    expect(asFraction(2.5)).toEqual([1, 40]);
    expect(asFraction(12.5)).toEqual([1, 8]);
    expect(asFraction(120)).toEqual([6, 5]);
    expect(asFraction(0)).toEqual([0, 1]);
    expect(fractionToPercent(1, 8)).toBe(12.5);
    expect(Number.isNaN(fractionToPercent(1, 0))).toBe(true);
  });

  it('Erst +20 %, dann −20 %: Faktor 0,96, also 4 % weniger als am Anfang', () => {
    expect(chainFactor([20, -20])).toBeCloseTo(0.96, 12);
    expect(chainFactor([-20, 20])).toBeCloseTo(0.96, 12);
    expect(100 * (1 - chainFactor([20, -20]))).toBeCloseTo(4, 12);
    expect(chainFactor([])).toBe(1);
    expect(chainFactor([10, 10])).toBeCloseTo(1.21, 12);
  });

  it('Faktoren und Prozentsatz des Prozentwerts je Situation', () => {
    expect(shareRate('none', 25)).toBe(25);
    expect(shareRate('klasse', 25)).toBe(25);
    expect(shareRate('zins', 2)).toBe(2);
    expect(shareRate('rabatt', 30)).toBe(70);
    expect(shareRate('mwst', 19)).toBe(119);
    expect(shareRate('erh', 20)).toBe(120);
    expect(factorOf('rabatt', 20)).toBeCloseTo(0.8, 12);
    expect(factorOf('mwst', 19)).toBeCloseTo(1.19, 12);
    expect(changeSign('none')).toBe(0);
    expect(changeSign('rabatt')).toBe(-1);
    expect(changeSign('erh')).toBe(1);
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

  it('Prozentsatz gesucht über 1 %: 100 % ≙ 48 → 1 % ≙ 0,48 → 12 : 0,48 = 25, also 25 %', () => {
    const r = ruleOfThree('p', 48, 25);
    expect(r[1]![1]).toBeCloseTo(0.48, 12);
    expect(r[2]![1] / r[1]![1]).toBeCloseTo(25, 12);
  });

  it('Rabatt und Mehrwertsteuer (alte Lehrbuchwerte)', () => {
    expect(discounted(60, 30)).toBeCloseTo(42, 12);
    expect(gross(200, 19)).toBeCloseTo(238, 12);
    expect(percentValue(28, 25)).toBe(7);
    expect(percentValue(500, 2)).toBe(10);
  });

  it('Hunderterfeld: volle und angefangene Kästchen', () => {
    expect(gridFill(25)).toEqual({ full: 25, part: 0 });
    const g = gridFill(2.5);
    expect(g.full).toBe(2);
    expect(g.part).toBeCloseTo(0.5, 12);
    expect(gridFill(120).full).toBe(120);
    expect(gridFill(-3)).toEqual({ full: 0, part: 0 });
  });

  it('Prozentsatz gesucht bei Änderungen: W : G ist der Satz des neuen Preises, der Änderungssatz ist der Abstand zu 100 %', () => {
    // 60 € → 48 €: 48 : 60 = 0,8 = 80 %, also 20 % Rabatt
    const r = problem('rabatt', 'p', 60, 20);
    expect(r.W).toBeCloseTo(48, 12);
    expect(r.result).toBeCloseTo(80, 12);
    expect(100 - r.result).toBeCloseTo(r.p, 12);
    // 50 € netto → 59,50 € brutto: 119 %, also 19 % Mehrwertsteuer
    const m = problem('mwst', 'p', 50, 19);
    expect(m.result).toBeCloseTo(119, 12);
    expect(m.result - 100).toBeCloseTo(19, 12);
    // 84 € nach +20 %: zurück 84 : 1,2 = 70 €
    expect(problem('erh', 'G', 70, 20).W / factorOf('erh', 20)).toBeCloseTo(70, 12);
  });

  it('Sonderfälle: 0 %, Grundwert 0, Rabatt 100 %', () => {
    expect(Number.isNaN(baseValue(5, 0))).toBe(true);
    expect(Number.isNaN(percentRate(0, 5))).toBe(true);
    expect(Number.isNaN(problem('none', 'G', 80, 0).result)).toBe(true);
    expect(Number.isNaN(problem('rabatt', 'G', 80, 100).result)).toBe(true);
    expect(problem('rabatt', 'W', 80, 100).W).toBe(0);
    expect(Number.isNaN(ruleOfThree('G', 80, 0)[1]![1])).toBe(true);
    expect(isNice(13.2, 0)).toBe(false);
    expect(isNice(7, 0)).toBe(true);
    expect(isNice(NaN)).toBe(false);
  });

  it('Plausibilität über viele Zufallswerte: Hin- und Rückrechnung stimmen überein', () => {
    const rnd = seededRandom(2026);
    const sits: Sit[] = ['none', 'rabatt', 'mwst', 'zins', 'klasse', 'erh'];
    for (let i = 0; i < 3000; i++) {
      const sit = sits[i % sits.length]!;
      const G = 1 + Math.round(rnd() * 1999);
      const p = Math.round(rnd() * (sit === 'rabatt' ? 199 : 300)) / 2;
      const pr = problem(sit, 'W', G, p);
      // Prozentwert und Prozentsatz passen zusammen
      expect(percentRate(G, pr.W)).toBeCloseTo(pr.q, 8);
      // Rückwärts kommt der Grundwert heraus
      if (pr.q > 0) expect(problem(sit, 'G', G, p).result).toBeCloseTo(G, 8);
      // Neuer Wert = Grundwert ± Änderung
      expect(pr.W).toBeCloseTo(changeSign(sit) === 0 ? pr.D : G + changeSign(sit) * pr.D, 8);
      // Dreisatz: Wert von 1 % mal Prozentsatz ergibt den Prozentwert
      const r = ruleOfThree('W', G, pr.q);
      expect(r[1]![1] * pr.q).toBeCloseTo(pr.W, 8);
      // Faktor
      expect(G * factorOf(sit, p)).toBeCloseTo(pr.W, 8);
      // Der typische Fehler trifft nur bei 0 % zufällig das Richtige
      if (pr.q > 0 && p > 0 && changeSign(sit) !== 0) expect(Math.abs(wrongBase(sit, pr.W, p) - G)).toBeGreaterThan(1e-9);
      // Bruch ist gekürzt und stimmt
      const [n, d] = asFraction(p);
      expect((n / d) * 100).toBeCloseTo(p, 9);
    }
  });

  it('Zufallsaufgaben haben glatte Zahlen und gültige Werte', () => {
    const rnd = seededRandom(7);
    const sits: Sit[] = ['none', 'rabatt', 'mwst', 'zins', 'klasse', 'erh'];
    for (let i = 0; i < 600; i++) {
      const sit = sits[i % sits.length]!;
      const t = randomTask(sit, rnd);
      const pr = problem(sit, t.find, t.G, t.p);
      expect(['W', 'p', 'G']).toContain(t.find);
      expect(t.G).toBeGreaterThanOrEqual(1);
      expect(t.G).toBeLessThanOrEqual(2000);
      expect(t.p).toBeGreaterThan(0);
      expect(t.p).toBeLessThanOrEqual(100);
      expect(Math.round(t.p * 2)).toBeCloseTo(t.p * 2, 12);
      expect(pr.q).toBeGreaterThan(0);
      if (sit === 'klasse') {
        expect(isNice(pr.W, 0)).toBe(true);
        expect(t.G).toBeLessThanOrEqual(100);
      } else if (sit === 'none') expect(isNice(pr.W, 1)).toBe(true);
      else expect(isNice(pr.W, 2)).toBe(true);
    }
  });
});
