import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  activity,
  ageFromFraction,
  daughterOf,
  decayBetween,
  decayConstant,
  decayProbability,
  expectedRemaining,
  halfLifeOf,
  mean,
  meanLifetime,
  median,
  NUCLIDE_IDS,
  NUCLIDES,
  raySegment,
  remainingFraction,
  sciParts,
  simulateCounts,
  simulateLifetime,
  specificActivity,
  stepDecay,
  sunflower,
  survivingShare,
} from '../src/simulations/physik/radioaktiver-zerfall/model';

describe('Modell: Radioaktiver Zerfall – Zerfallsgesetz', () => {
  it('nach 1, 2, 3 Halbwertszeiten bleiben 50 %, 25 %, 12,5 %', () => {
    expect(remainingFraction(1, 1)).toBeCloseTo(0.5, 12);
    expect(remainingFraction(2, 1)).toBeCloseTo(0.25, 12);
    expect(remainingFraction(3, 1)).toBeCloseTo(0.125, 12);
    expect(expectedRemaining(1000, 3 * 55.6, 55.6)).toBeCloseTo(125, 9);
  });

  it('λ für C-14: ln 2 / 5730 a ≈ 1,21 · 10⁻⁴ 1/a', () => {
    const l = decayConstant(NUCLIDES.c14.halfLife);
    expect(l).toBeCloseTo(1.2097e-4, 7);
    expect(halfLifeOf(l)).toBeCloseTo(5730, 9);
  });

  it('λ für Rn-220: ln 2 / 55,6 s ≈ 0,0125 1/s', () => {
    expect(decayConstant(55.6)).toBeCloseTo(0.012467, 5);
  });

  it('Restanteil 25 % → Alter 2 · T½ = 11 460 a (C-14)', () => {
    expect(ageFromFraction(0.25, 5730)).toBeCloseTo(11460, 9);
    expect(ageFromFraction(0.5, 5730)).toBeCloseTo(5730, 9);
    expect(ageFromFraction(1, 5730)).toBe(0);
    expect(ageFromFraction(0, 5730)).toBeNaN();
    expect(ageFromFraction(1.2, 5730)).toBeNaN();
  });

  it('Aktivität A = λ · N: 1000 Rn-220-Kerne ≈ 12,5 Bq', () => {
    expect(activity(decayConstant(55.6), 1000)).toBeCloseTo(12.467, 2);
  });

  it('mittlere Lebensdauer τ = T½ / ln 2 ≈ 1,44 · T½', () => {
    expect(meanLifetime(1)).toBeCloseTo(1.4427, 4);
  });

  it('Zerfallswahrscheinlichkeit je Schritt: p = 1 − e^(−λΔt)', () => {
    // nach einem Schritt der Länge T½ genau 50 %
    expect(decayProbability(decayConstant(8.02), 8.02)).toBeCloseTo(0.5, 12);
    // kleine Schritte: p ≈ λ · Δt
    expect(decayProbability(0.01, 0.1)).toBeCloseTo(0.001, 6);
    expect(decayProbability(0, 1)).toBe(0);
    expect(decayProbability(1, 0)).toBe(0);
    // n kleine Schritte ergeben zusammen dieselbe Überlebenswahrscheinlichkeit
    const p = decayProbability(LN2_TEST, 1 / 200);
    expect((1 - p) ** 200).toBeCloseTo(0.5, 12);
  });

  it('Anteil, der zwischen a und b zerfällt', () => {
    expect(decayBetween(0, 1)).toBeCloseTo(0.5, 12);
    expect(decayBetween(1, 2)).toBeCloseTo(0.25, 12);
    expect(decayBetween(0, 50)).toBeCloseTo(1, 12);
  });
});

const LN2_TEST = Math.LN2;

describe('Modell: Radioaktiver Zerfall – Nuklide', () => {
  it('Tochterkerne folgen den Erhaltungssätzen (α: A − 4, Z − 2; β⁻: Z + 1)', () => {
    for (const id of NUCLIDE_IDS) {
      const n = NUCLIDES[id];
      const d = daughterOf(n, n.kind);
      expect(n.daughter.A, id).toBe(d.A);
      expect(n.daughter.Z, id).toBe(d.Z);
    }
    expect(NUCLIDES.rn220.daughter.symbol).toBe('Po');
    expect(NUCLIDES.u238.daughter.symbol).toBe('Th');
    expect(NUCLIDES.c14.daughter.symbol).toBe('N');
  });

  it('spezifische Aktivitäten stimmen mit Tabellenwerten überein', () => {
    // U-238: etwa 12,4 kBq je Gramm; I-131: etwa 4,6 · 10¹⁵ Bq/g; C-14: etwa 1,65 · 10¹¹ Bq/g
    expect(specificActivity(NUCLIDES.u238) / 1e4).toBeCloseTo(1.244, 2);
    expect(specificActivity(NUCLIDES.i131) / 1e15).toBeCloseTo(4.6, 1);
    expect(specificActivity(NUCLIDES.c14) / 1e11).toBeCloseTo(1.65, 1);
    expect(specificActivity(NUCLIDES.cs137) / 1e12).toBeCloseTo(3.2, 1);
  });
});

describe('Modell: Radioaktiver Zerfall – Zufall', () => {
  it('ist mit demselben Startwert reproduzierbar', () => {
    const a = simulateCounts(500, 0.05, 40, seededRandom(7));
    const b = simulateCounts(500, 0.05, 40, seededRandom(7));
    const c = simulateCounts(500, 0.05, 40, seededRandom(8));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(a[0]).toBe(500);
    // Anzahl nimmt nie zu
    for (let i = 1; i < a.length; i++) expect(a[i]!).toBeLessThanOrEqual(a[i - 1]!);
  });

  it('stepDecay setzt genau die zurückgegebenen Kerne auf zerfallen', () => {
    const alive = new Uint8Array(100).fill(1);
    const out = stepDecay(alive, 0.3, seededRandom(1));
    expect(alive.reduce((s, v) => s + v, 0)).toBe(100 - out.length);
    for (const i of out) expect(alive[i]).toBe(0);
    // p = 0: nichts, p = 1: alles
    expect(stepDecay(new Uint8Array(10).fill(1), 0, seededRandom(1))).toHaveLength(0);
    expect(stepDecay(new Uint8Array(10).fill(1), 1, seededRandom(1))).toHaveLength(10);
  });

  it('Mittelwert vieler Durchläufe liegt nahe am Zerfallsgesetz', () => {
    // 200 Schritte je Halbwertszeit, 3 Halbwertszeiten, 1000 Kerne, 200 Durchläufe
    const p = decayProbability(LN2_TEST, 1 / 200);
    const rand = seededRandom(2026);
    const runs = 200;
    const sums = [0, 0, 0, 0];
    for (let r = 0; r < runs; r++) {
      const c = simulateCounts(1000, p, 600, rand);
      for (let k = 0; k <= 3; k++) sums[k]! += c[k * 200]!;
    }
    expect(sums[0]! / runs).toBe(1000);
    // Standardfehler des Mittelwerts etwa √(N·q(1−q)/runs) ≈ 1,1 → Toleranz 4
    expect(Math.abs(sums[1]! / runs - 500)).toBeLessThan(4);
    expect(Math.abs(sums[2]! / runs - 250)).toBeLessThan(4);
    expect(Math.abs(sums[3]! / runs - 125)).toBeLessThan(4);
    // Rechenintensiv (≈ 1 s allein, unter Last im Gesamtlauf deutlich länger): eigenes Zeitlimit
  }, 30_000);

  it('einzelne Kerne: Mittelwert ≈ 1,44 T½, Median ≈ T½, Hälfte vor T½', () => {
    const p = decayProbability(LN2_TEST, 1 / 200);
    const rand = seededRandom(42);
    const life: number[] = [];
    for (let i = 0; i < 20000; i++) life.push(simulateLifetime(p, 1 / 200, rand));
    expect(Math.abs(mean(life) - meanLifetime(1))).toBeLessThan(0.04);
    expect(Math.abs(median(life) - 1)).toBeLessThan(0.04);
    expect(Math.abs(survivingShare(life, 1) - 0.5)).toBeLessThan(0.015);
    expect(Math.abs(survivingShare(life, 2) - 0.25)).toBeLessThan(0.015);
  });

  it('Hilfsfunktionen für Statistik', () => {
    expect(mean([1, 2, 3, 6])).toBe(3);
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(mean([])).toBeNaN();
    expect(survivingShare([0.5, 1.5, 2.5, 3.5], 1)).toBe(0.75);
  });
});

describe('Modell: Radioaktiver Zerfall – Geometrie und Anzeige', () => {
  it('Sonnenblumen-Muster liegt in der Einheitsscheibe', () => {
    const pts = sunflower(500);
    for (let i = 0; i < 500; i++) expect(Math.hypot(pts[2 * i]!, pts[2 * i + 1]!)).toBeLessThanOrEqual(1);
  });

  it('Strahl trifft die Fensterstrecke', () => {
    expect(raySegment(0, 0, 1, 0, 5, -1, 5, 1)).toBeCloseTo(5, 12);
    expect(raySegment(0, 0, -1, 0, 5, -1, 5, 1)).toBeNull();
    expect(raySegment(0, 3, 1, 0, 5, -1, 5, 1)).toBeNull();
  });

  it('Zehnerpotenzen', () => {
    expect(sciParts(12440)).toEqual({ m: expect.closeTo(1.244, 9) as number, e: 4 });
    expect(sciParts(9.999e5).e).toBe(6);
    expect(sciParts(1.2097e-4).e).toBe(-4);
  });
});

describe('Modell: Radioaktiver Zerfall – Prüfrunde (Aufgaben und Sonderfälle)', () => {
  it('Werte der Aufgaben im Lernmaterial', () => {
    // A1: I-131, 1000 Kerne, 24 d ≈ 3 T½ → ≈ 125 (genau 1000 · 2^(−24/8,02) ≈ 125,6)
    expect(expectedRemaining(1000, 3 * 8.02, 8.02)).toBeCloseTo(125, 9);
    expect(expectedRemaining(1000, 24, 8.02)).toBeCloseTo(125.65, 1);
    // A2: λ(C-14) ≈ 1,21 · 10⁻⁴ 1/a, A(1000 Kerne) ≈ 0,121 1/a ≈ 3,8 · 10⁻⁹ Bq, etwa alle 8 Jahre ein Zerfall
    const l = decayConstant(5730);
    expect(activity(l, 1000)).toBeCloseTo(0.121, 3);
    expect(1 / activity(l, 1000)).toBeCloseTo(8.27, 2);
    expect(activity(l, 1000) / (365.25 * 86400) / 1e-9).toBeCloseTo(3.83, 2);
    // A3: 25 % → 11 460 a; A4: ein Viertel nach 2 · 55,6 s = 111,2 s
    expect(ageFromFraction(0.25, 5730)).toBeCloseTo(11460, 9);
    expect(ageFromFraction(0.25, 55.6)).toBeCloseTo(111.2, 9);
    // A5: Zerfall zwischen 3 und 4 T½ unter der Bedingung „lebt bei 3 T½“: 50 %
    expect(decayBetween(3, 4) / remainingFraction(3, 1)).toBeCloseTo(0.5, 12);
    // mittlere Lebensdauer τ = T½ / ln 2 ≈ 1,44 T½
    expect(meanLifetime(5730)).toBeCloseTo(8267, 0);
  });

  it('Sonderfälle: t = 0, sehr lange Zeiten, ein einzelner Kern, alle zerfallen', () => {
    expect(expectedRemaining(500, 0, 55.6)).toBe(500);
    expect(remainingFraction(0, 1)).toBe(1);
    expect(remainingFraction(2000, 1)).toBe(0);
    expect(Number.isFinite(ageFromFraction(1e-300, 1))).toBe(true);
    // ein Kern: nach dem Zerfall bleibt 0; p = 1 → alle sofort, p = 0 → keiner
    expect(simulateCounts(1, 1, 3, seededRandom(1))).toEqual([1, 0, 0, 0]);
    expect(simulateCounts(2, 0, 3, seededRandom(1))).toEqual([2, 2, 2, 2]);
    // nach 10 T½ (Ende des Versuchs) sind von 2500 Kernen im Mittel nur ≈ 2,4 übrig
    expect(expectedRemaining(2500, 10, 1)).toBeCloseTo(2.44, 2);
  });

  it('Schwankung nach einer Halbwertszeit: Standardabweichung ≈ ½ √N₀ (100 → 5, 2500 → 25)', () => {
    const p = decayProbability(LN2_TEST, 1 / 200);
    const spread = (N0: number, runs: number, seed: number) => {
      const rand = seededRandom(seed);
      const v: number[] = [];
      for (let r = 0; r < runs; r++) v.push(simulateCounts(N0, p, 200, rand)[200]!);
      const m = mean(v);
      return { m, s: Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / (v.length - 1)) };
    };
    const a = spread(100, 2000, 11);
    expect(Math.abs(a.m - 50)).toBeLessThan(0.6);
    expect(Math.abs(a.s - 5)).toBeLessThan(0.4);
    const b = spread(2500, 300, 12);
    expect(Math.abs(b.m - 1250)).toBeLessThan(5);
    expect(Math.abs(b.s - 25)).toBeLessThan(3.5);
    // Rechenintensiv (≈ 2,5 s allein; lief unter Last einmal in das Standardlimit von 5 s)
  }, 30_000);

  it('Nuklid-Daten: Halbwertszeiten wie in Tabellen', () => {
    expect(NUCLIDES.rn220.halfLife).toBe(55.6);
    expect(NUCLIDES.i131.halfLife).toBe(8.02);
    expect(NUCLIDES.cs137.halfLife).toBe(30.1);
    expect(NUCLIDES.c14.halfLife).toBe(5730);
    expect(NUCLIDES.u238.halfLife).toBe(4.47);
    expect(NUCLIDES.u238.unit).toBe('Ga');
  });
});
