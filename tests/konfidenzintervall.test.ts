import { describe, expect, it } from 'vitest';
import {
  binomialPmf,
  coverage,
  ellipseAt,
  halfWidth,
  laplaceOk,
  levelOf,
  phi,
  phiInv,
  predictionInterval,
  predictionIntervalCount,
  probInside,
  requiredN,
  sampleBinomial,
  waldInterval,
  wilsonInterval,
  zFor,
} from '../src/simulations/mathematik/konfidenzintervall/model';

describe('Konfidenzintervall: Lehrbuchwerte', () => {
  it('Wald: n = 100, h = 0,4, 95 % → [0,304; 0,496]', () => {
    const [a, b] = waldInterval(0.4, 100, zFor(95));
    expect(a).toBeCloseTo(0.304, 3);
    expect(b).toBeCloseTo(0.496, 3);
  });
  it('Prognoseintervall p = 0,5, n = 100 → [0,402; 0,598]', () => {
    const [a, b] = predictionInterval(0.5, 100, 1.96);
    expect(a).toBeCloseTo(0.402, 3);
    expect(b).toBeCloseTo(0.598, 3);
    const [ka, kb] = predictionIntervalCount(0.5, 100, 1.96);
    expect(ka).toBeCloseTo(40.2, 6);
    expect(kb).toBeCloseTo(59.8, 6);
  });
  it('Konfidenzellipse (Wilson) n = 100, h = 0,4, z = 1,96', () => {
    const [a, b] = wilsonInterval(0.4, 100, 1.96);
    expect(a).toBeCloseTo(0.3094, 4);
    expect(b).toBeCloseTo(0.4980, 4);
    // Randpunkte liegen genau auf der Ellipse
    for (const p of [a, b]) {
      const e = ellipseAt(p, 100, 1.96);
      expect(Math.min(Math.abs(e[0] - 0.4), Math.abs(e[1] - 0.4))).toBeLessThan(1e-12);
    }
  });
  it('nötiger Stichprobenumfang: ±3 % bei 95 % ohne Vorwissen → 1068', () => {
    expect(requiredN(0.03, 1.96)).toBe(1068);
    expect(requiredN(0.05, 1.96)).toBe(385);
    expect(requiredN(0.05, 1.96, 0.2)).toBe(246);
  });
  it('z-Werte und Sigma-Regeln', () => {
    expect(zFor(95)).toBe(1.96);
    expect(zFor(95, false)).toBeCloseTo(1.959964, 5);
    expect(zFor(99, false)).toBeCloseTo(2.575829, 5);
    expect(levelOf(1)).toBeCloseTo(0.6827, 4);
    expect(levelOf(2)).toBeCloseTo(0.9545, 4);
    expect(phi(0)).toBeCloseTo(0.5, 7);
    expect(phiInv(phi(1.3))).toBeCloseTo(1.3, 5);
  });
});

describe('Konfidenzintervall: Wahrscheinlichkeiten', () => {
  it('Binomialverteilung summiert zu 1 und hat Erwartungswert n·p', () => {
    const pmf = binomialPmf(200, 0.3);
    expect(pmf.reduce((s, v) => s + v, 0)).toBeCloseTo(1, 10);
    expect(pmf.reduce((s, v, k) => s + k * v, 0)).toBeCloseTo(60, 8);
  });
  it('Prognoseintervall enthält rund 95 % der Stichproben', () => {
    const P = probInside(400, 0.5, predictionInterval(0.5, 400, 1.96));
    expect(P).toBeGreaterThan(0.94);
    expect(P).toBeLessThan(0.97);
  });
  it('Überdeckung: Wilson nahe 95 %, Wald bei kleinem p zu niedrig', () => {
    expect(coverage('wilson', 100, 0.4, 1.96)).toBeGreaterThan(0.93);
    expect(coverage('wilson', 100, 0.4, 1.96)).toBeLessThan(0.97);
    expect(coverage('wald', 30, 0.05, 1.96)).toBeLessThan(0.85);
  });
  it('Wald schrumpft bei h = 0 auf einen Punkt, Wilson nicht', () => {
    expect(waldInterval(0, 50, 1.96)).toEqual([0, 0]);
    expect(wilsonInterval(0, 50, 1.96)[1]).toBeGreaterThan(0.05);
  });
  it('Breite halbiert sich bei vierfachem n', () => {
    expect(halfWidth(0.4, 400, 1.96) * 2).toBeCloseTo(halfWidth(0.4, 100, 1.96), 12);
  });
  it('Zufallsstichproben: Mittelwert nahe n·p', () => {
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    let s = 0;
    for (let i = 0; i < 400; i++) s += sampleBinomial(100, 0.3, rnd);
    expect(s / 400).toBeGreaterThan(28.5);
    expect(s / 400).toBeLessThan(31.5);
  });
  it('Laplace-Bedingung', () => {
    expect(laplaceOk(100, 0.5)).toBe(true);
    expect(laplaceOk(30, 0.05)).toBe(false);
  });
});

describe('Konfidenzintervall: Rechenweg', () => {
  it('quadratische Gleichung der Ellipse hat die Wilson-Grenzen als Lösungen', async () => {
    const { ellipseQuadratic, wilsonInterval: w } = await import('../src/simulations/mathematik/konfidenzintervall/model');
    const q = ellipseQuadratic(0.4, 100, 1.96);
    expect(q.a).toBeCloseTo(1.038416, 6);
    expect(q.b).toBeCloseTo(-0.838416, 6);
    expect(q.c).toBeCloseTo(0.16, 12);
    const [a, b] = q.roots!;
    const [wa, wb] = w(0.4, 100, 1.96);
    expect(a).toBeCloseTo(wa, 12);
    expect(b).toBeCloseTo(wb, 12);
  });
  it('Sigma-Regeln: n = 100, p = 0,5 exakt nahe 68 / 95 / 99,7 %', async () => {
    const { sigmaTable } = await import('../src/simulations/mathematik/konfidenzintervall/model');
    const t = sigmaTable(100, 0.5);
    // μ ± σ = [45; 55]
    expect(t[0]!.lo).toBeCloseTo(45, 12);
    expect(t[0]!.exact).toBeCloseTo(0.7287, 3);
    expect(t[1]!.exact).toBeCloseTo(0.9648, 3);
    expect(t[2]!.exact).toBeGreaterThan(0.997);
    expect(t[1]!.approx).toBeCloseTo(0.9545, 4);
  });
  it('laufende Trefferquote', async () => {
    const { runningRate } = await import('../src/simulations/mathematik/konfidenzintervall/model');
    expect(runningRate([true, false, true, true])).toEqual([1, 0.5, 2 / 3, 0.75]);
  });
});

import { betaError, binomCdf, binomialPmf as pmfB, coverageCurve, pValue, rejectionRegion, rejects } from '../src/simulations/mathematik/konfidenzintervall/model';

describe('Konfidenzintervall: Hypothesentest', () => {
  it('rechtsseitig n = 100, p₀ = 0,5, α = 5 %: Ablehnung ab 59 (P(X ≥ 59) ≈ 4,4 %)', () => {
    const r = rejectionRegion(100, 0.5, 0.05, 'right');
    expect(r.hi).toBe(59);
    expect(r.lo).toBe(-1);
    expect(r.alpha).toBeCloseTo(0.0443, 3);
  });
  it('linksseitig: bis 41; zweiseitig: bis 39 und ab 61 (α ≈ 3,5 %)', () => {
    expect(rejectionRegion(100, 0.5, 0.05, 'left').lo).toBe(41);
    const two = rejectionRegion(100, 0.5, 0.05, 'two');
    expect(two.lo).toBe(39);
    expect(two.hi).toBe(61);
    expect(two.alpha).toBeCloseTo(0.0352, 3);
  });
  it('Fehler 2. Art: bei p₁ = 0,6 behält der rechtsseitige Test H₀ mit ≈ 37,7 % bei', () => {
    const r = rejectionRegion(100, 0.5, 0.05, 'right');
    expect(betaError(100, 0.6, r)).toBeCloseTo(0.3775, 3);
    expect(betaError(100, 0.5, r)).toBeCloseTo(1 - r.alpha, 12);
    expect(rejects(60, r)).toBe(true);
    expect(rejects(58, r)).toBe(false);
  });
  it('p-Wert: 60 von 100 bei p₀ = 0,5 rechtsseitig ≈ 2,8 %; Verteilungsfunktion', () => {
    expect(pValue(100, 0.5, 60, 'right')).toBeCloseTo(0.0284, 3);
    expect(pValue(100, 0.5, 60, 'two')).toBeCloseTo(0.0569, 3);
    expect(binomCdf(pmfB(10, 0.5), 10)).toBeCloseTo(1, 12);
  });
});

describe('Konfidenzintervall: Trefferquote über p', () => {
  it('Wilson trifft im Mittel näher an 95 % als die Näherung, die bei kleinem p deutlich darunter liegt', () => {
    const c = coverageCurve(30, 1.96, 0.01);
    const mean = (k: 'wald' | 'wilson') => c.reduce((s, q) => s + q[k], 0) / c.length;
    expect(Math.abs(mean('wilson') - 0.95)).toBeLessThan(Math.abs(mean('wald') - 0.95));
    const small = c.find((q) => Math.abs(q.p - 0.05) < 1e-9)!;
    expect(small.wald).toBeLessThan(0.85);
  });
});

import { checkExercise, makeExercise, parseNumbers } from '../src/simulations/mathematik/konfidenzintervall/model';

describe('Konfidenzintervall: Übungsaufgaben', () => {
  it('Zahlen lesen mit Komma, Punkt und Strich', () => {
    expect(parseNumbers('0,35; 0,42')).toEqual([0.35, 0.42]);
    expect(parseNumbers('40 – 60')).toEqual([40, 60]);
    expect(parseNumbers('n = 1068')).toEqual([1068]);
  });
  it('Musterlösung wird akzeptiert, alle Aufgabenarten kommen vor', () => {
    const kinds = new Set<string>();
    for (let i = 1; i <= 40; i++) {
      const ex = makeExercise(i);
      kinds.add(ex.kind);
      const txt = ex.answer.map((a) => (ex.kind === 'conf' ? a.toFixed(3) : String(Math.round(a)))).join('; ');
      expect(checkExercise(ex, txt).ok).toBe(true);
      expect(checkExercise(ex, '1').ok).toBe(ex.answer.length === 1 && Math.abs(ex.answer[0]! - 1) <= ex.tol);
    }
    expect(kinds.size).toBe(4);
    expect(makeExercise(7)).toEqual(makeExercise(7));
  });
});
