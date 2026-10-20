import { describe, expect, it } from 'vitest';
import {
  acceptProb,
  binomialPmf,
  cdfGE,
  cdfLE,
  criticalRegion,
  h1True,
  powerCurve,
  rejectProb,
  rejects,
  sampleBinomial,
  typeTwo,
  viewWindow,
} from '../src/simulations/mathematik/signifikanztest/model';
import { seededRandom } from '../src/sim-core';

/** Exakte Vergleichsrechnung mit BigInt-Binomialkoeffizienten. */
function exactGE(n: number, k: number, p: number): number {
  let c = 1n;
  const coef: bigint[] = [];
  for (let i = 0; i <= n; i++) {
    coef.push(c);
    c = (c * BigInt(n - i)) / BigInt(i + 1);
  }
  let s = 0;
  for (let i = Math.max(0, k); i <= n; i++) s += Number(coef[i]!) * p ** i * (1 - p) ** (n - i);
  return s;
}

describe('Modell: Signifikanztest – Binomialverteilung', () => {
  it('Einzelwahrscheinlichkeiten summieren sich zu 1, auch bei n = 200', () => {
    for (const [n, p] of [
      [10, 0.5],
      [50, 0.6],
      [200, 0.05],
      [200, 0.95],
    ] as const) {
      const s = binomialPmf(n, p).reduce((a, b) => a + b, 0);
      expect(s).toBeCloseTo(1, 12);
    }
  });
  it('stimmt mit exakter Rechnung überein', () => {
    expect(cdfGE(50, 0.6, 37)).toBeCloseTo(exactGE(50, 37, 0.6), 12);
    expect(cdfGE(120, 0.3, 45)).toBeCloseTo(exactGE(120, 45, 0.3), 12);
    expect(cdfLE(20, 0.5, 5)).toBeCloseTo(1 - exactGE(20, 6, 0.5), 12);
  });
  it('Randfälle p = 0 und p = 1', () => {
    expect(binomialPmf(5, 0)).toEqual([1, 0, 0, 0, 0, 0]);
    expect(binomialPmf(5, 1)).toEqual([0, 0, 0, 0, 0, 1]);
    expect(cdfGE(10, 0.3, 0)).toBe(1);
    expect(cdfGE(10, 0.3, 11)).toBe(0);
    expect(cdfLE(10, 0.3, -1)).toBe(0);
    expect(cdfLE(10, 0.3, 10)).toBe(1);
  });
});

describe('Modell: Signifikanztest – Ablehnungsbereich (Prüfwerte)', () => {
  it('n = 50, p₀ = 0,6, rechtsseitig, α = 5 %: k = 37', () => {
    const cr = criticalRegion(50, 0.6, 0.05, 'right');
    expect(cr.k).toBe(37);
    expect([cr.lo, cr.hi]).toEqual([37, 50]);
    expect(cr.alphaActual).toBeCloseTo(0.027988, 5);
    expect(cr.alphaNext).toBeCloseTo(0.053955, 5);
    expect(cr.alphaNext).toBeGreaterThan(0.05);
  });
  it('n = 20, p₀ = 0,5, rechtsseitig, α = 5 %: k = 15', () => {
    const cr = criticalRegion(20, 0.5, 0.05, 'right');
    expect(cr.k).toBe(15);
    expect(cr.alphaActual).toBeCloseTo(0.020695, 5);
    expect(cr.alphaNext).toBeCloseTo(0.057659, 5);
  });
  it('n = 20, p₀ = 0,5, linksseitig, α = 5 %: Ablehnung für X ≤ 5', () => {
    const cr = criticalRegion(20, 0.5, 0.05, 'left');
    expect(cr.k).toBe(5);
    expect([cr.lo, cr.hi]).toEqual([0, 5]);
    expect(cr.alphaActual).toBeCloseTo(0.020695, 5);
    expect(rejects(cr, 5)).toBe(true);
    expect(rejects(cr, 6)).toBe(false);
  });
  it('Fehler 2. Art: n = 20, p₀ = 0,5, rechtsseitig, α = 5 %, p₁ = 0,7', () => {
    const cr = criticalRegion(20, 0.5, 0.05, 'right');
    const t = typeTwo(cr, 0.7)!;
    expect(t.beta).toBeCloseTo(0.583629, 5);
    expect(t.power).toBeCloseTo(0.416371, 5);
  });
  it('Würfel: n = 60, p₀ = 1/6, α = 5 %: Ablehnung ab 16 Sechsen', () => {
    const cr = criticalRegion(60, 1 / 6, 0.05, 'right');
    expect(cr.k).toBe(16);
    expect(cr.alphaActual).toBeCloseTo(0.033846, 5);
  });
  it('Saatgut: n = 100, p₀ = 0,9, linksseitig, α = 5 %: Ablehnung bis 84', () => {
    const cr = criticalRegion(100, 0.9, 0.05, 'left');
    expect(cr.k).toBe(84);
    expect(cr.alphaActual).toBeCloseTo(0.039891, 5);
    expect(cr.alphaNext).toBeCloseTo(0.072573, 5);
  });
  it('α = 1 % und 10 % verschieben die Grenze', () => {
    expect(criticalRegion(50, 0.6, 0.01, 'right').k).toBeGreaterThan(37);
    expect(criticalRegion(50, 0.6, 0.1, 'right').k).toBeLessThan(37);
  });
});

describe('Modell: Signifikanztest – Grenzfälle und Plausibilität', () => {
  it('kein Ablehnungsbereich möglich, wenn schon das Extrem zu wahrscheinlich ist', () => {
    const r = criticalRegion(10, 0.95, 0.05, 'right');
    expect(r.possible).toBe(false);
    expect(r.k).toBe(11);
    expect(r.alphaActual).toBe(0);
    expect(rejects(r, 10)).toBe(false);
    expect(acceptProb(r, 0.99)).toBe(1);
    const l = criticalRegion(10, 0.05, 0.05, 'left');
    expect(l.possible).toBe(false);
    expect(l.k).toBe(-1);
  });
  it('Fehler 1. Art ≤ α und k minimal (viele Zufallsfälle)', () => {
    const rnd = seededRandom(20261019);
    const alphas = [0.01, 0.05, 0.1];
    for (let i = 0; i < 400; i++) {
      const n = 10 + Math.floor(rnd() * 191);
      const p0 = Math.round((0.05 + rnd() * 0.9) * 100) / 100;
      const a = alphas[i % 3]!;
      const side = rnd() < 0.5 ? 'right' : 'left';
      const cr = criticalRegion(n, p0, a, side);
      expect(cr.alphaActual).toBeLessThanOrEqual(a + 1e-12);
      expect(cr.alphaNext).toBeGreaterThan(a);
      if (side === 'right' && cr.possible) {
        expect(cdfGE(n, p0, cr.k)).toBeCloseTo(cr.alphaActual, 12);
        expect(cdfGE(n, p0, cr.k - 1)).toBeGreaterThan(a);
      }
      if (side === 'left' && cr.possible) {
        expect(cdfLE(n, p0, cr.k)).toBeCloseTo(cr.alphaActual, 12);
        expect(cdfLE(n, p0, cr.k + 1)).toBeGreaterThan(a);
      }
      // Annahme + Ablehnung = 1, an p₀ ist die Ablehnung genau α*
      const p = rnd();
      expect(acceptProb(cr, p) + rejectProb(cr, p)).toBeCloseTo(1, 10);
      expect(rejectProb(cr, p0)).toBeCloseTo(cr.alphaActual, 10);
    }
  });
  it('p₁ = p₀: kein Fehler 2. Art, Annahme mit 1 − α*', () => {
    const cr = criticalRegion(50, 0.6, 0.05, 'right');
    expect(typeTwo(cr, 0.6)).toBeNull();
    expect(h1True('right', 0.6, 0.6)).toBe(false);
    expect(acceptProb(cr, 0.6)).toBeCloseTo(1 - cr.alphaActual, 12);
  });
  it('p₁ weit weg: Macht ≈ 1; nahe p₀: Macht ≈ α*', () => {
    const cr = criticalRegion(50, 0.6, 0.05, 'right');
    expect(typeTwo(cr, 0.95)!.power).toBeGreaterThan(0.9999);
    expect(typeTwo(cr, 0.61)!.power).toBeLessThan(0.05);
  });
  it('Gütefunktion steigt rechtsseitig monoton', () => {
    const cr = criticalRegion(30, 0.4, 0.05, 'right');
    const c = powerCurve(cr, 60);
    for (let i = 1; i < c.length; i++) expect(c[i]![1]).toBeGreaterThanOrEqual(c[i - 1]![1] - 1e-12);
    expect(c[0]![1]).toBe(0);
    expect(c[c.length - 1]![1]).toBeCloseTo(1, 12);
  });
  it('Ausschnitt enthält Grenze und Beobachtung, bleibt in [0; n]', () => {
    const cr = criticalRegion(200, 0.5, 0.05, 'right');
    const [lo, hi] = viewWindow(200, 0.5, 0.55, cr, 150);
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(200);
    expect(lo).toBeLessThan(cr.k);
    expect(hi).toBeGreaterThanOrEqual(150);
    const [a, b] = viewWindow(10, 0.5, 0.5, criticalRegion(10, 0.5, 0.05, 'right'), null);
    expect([a, b]).toEqual([0, 10]);
  });
  it('Stichprobe liegt in [0; n]', () => {
    const rnd = seededRandom(7);
    for (let i = 0; i < 50; i++) {
      const x = sampleBinomial(30, 0.4, rnd);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(30);
    }
  });
});
