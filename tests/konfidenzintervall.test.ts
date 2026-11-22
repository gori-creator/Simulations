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
