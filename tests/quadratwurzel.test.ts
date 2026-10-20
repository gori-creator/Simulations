import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  exactAt,
  floorSqrt,
  heronCut,
  heronFractions,
  heronNext,
  heronSteps,
  isPerfectSquare,
  isqrt,
  matchingDecimals,
  nearMisses,
  nestInterval,
  nestProbes,
  SQRT2_50,
  sqrtDigits,
  squareCells,
  squareFactor,
} from '../src/simulations/mathematik/quadratwurzel/model';

describe('Modell: Quadratwurzel – Heron-Verfahren', () => {
  it('√2 ab x₀ = 2: x₁ = 1,5; x₂ = 17/12 ≈ 1,416667; x₃ = 577/408 ≈ 1,4142157', () => {
    const s = heronSteps(2, 2, 4);
    expect(s[1]!.x).toBe(1.5);
    expect(s[2]!.x).toBeCloseTo(17 / 12, 14);
    expect(s[2]!.x).toBeCloseTo(1.416667, 6);
    expect(s[3]!.x).toBeCloseTo(577 / 408, 14);
    expect(s[3]!.x).toBeCloseTo(1.4142157, 7);
    expect(s[4]!.x).toBeCloseTo(665857 / 470832, 14);
    expect(Math.abs(s[4]!.x - Math.SQRT2)).toBeLessThan(2e-12);
  });

  it('√10 ab x₀ = 3: x₁ = 19/6 ≈ 3,16667; x₂ ≈ 3,162281; √10 ≈ 3,162278', () => {
    const s = heronSteps(10, 3, 3);
    expect(s[1]!.x).toBeCloseTo(19 / 6, 14);
    expect(s[1]!.x).toBeCloseTo(3.16667, 5);
    expect(s[2]!.x).toBeCloseTo(3.162281, 6);
    expect(Math.sqrt(10)).toBeCloseTo(3.162278, 6);
    expect(s[2]!.x - Math.sqrt(10)).toBeGreaterThan(0);
    expect(s[2]!.x - Math.sqrt(10)).toBeLessThan(5e-6);
  });

  it('exakte Brüche: 2, 3/2, 17/12, 577/408, 665857/470832 (gekürzt)', () => {
    const f = heronFractions(2, 2, 1, 4).map(([p, q]) => `${p}/${q}`);
    expect(f).toEqual(['2/1', '3/2', '17/12', '577/408', '665857/470832']);
    // √10 ab 3: 19/6, dann 721/228
    const g = heronFractions(10, 3, 1, 2).map(([p, q]) => `${p}/${q}`);
    expect(g).toEqual(['3/1', '19/6', '721/228']);
    // Start 1,5 als 3/2 wird erkannt und gekürzt
    expect(heronFractions(2, 6, 4, 0)[0]).toEqual([3n, 2n]);
  });

  it('Rechteck: x · (a/x) = a in jedem Schritt; Mittelwert liegt zwischen den Seiten', () => {
    for (const a of [2, 10, 49, 200]) {
      for (const q of heronSteps(a, 20, 8)) {
        expect(q.x * q.y).toBeCloseTo(a, 9);
        const m = heronNext(a, q.x);
        expect(m).toBeGreaterThanOrEqual(Math.min(q.x, q.y) - 1e-12);
        expect(m).toBeLessThanOrEqual(Math.max(q.x, q.y) + 1e-12);
      }
    }
    expect(heronNext(10, 10)).toBe(5.5);
  });

  it('ab dem ersten Schritt fällt die Folge monoton gegen √a (x₀ > 0)', () => {
    const rnd = seededRandom(20261020);
    for (let i = 0; i < 400; i++) {
      const a = 1 + Math.floor(rnd() * 200);
      const x0 = 0.05 + rnd() * 30;
      const s = heronSteps(a, x0, 14);
      const r = Math.sqrt(a);
      for (let k = 1; k <= 14; k++) {
        // AM-GM: der Mittelwert ist nie kleiner als √a
        expect(s[k]!.x).toBeGreaterThanOrEqual(r - 1e-12);
        // die Breite liegt darunter: a/x ≤ √a ≤ x
        expect(s[k]!.y).toBeLessThanOrEqual(r + 1e-12);
        if (k >= 2) expect(s[k]!.x).toBeLessThanOrEqual(s[k - 1]!.x + 1e-12);
      }
      expect(s[14]!.x).toBeCloseTo(r, 9);
    }
  });

  it('die Zahl der richtigen Nachkommastellen verdoppelt sich ungefähr (√2 ab 2: 0, 2, 5, 11)', () => {
    const s = heronSteps(2, 2, 4);
    const d = s.slice(1).map((q) => matchingDecimals(q.x, Math.SQRT2));
    expect(d).toEqual([0, 2, 5, 11]);
    expect(matchingDecimals(1.4142114, Math.SQRT2)).toBe(5);
    expect(matchingDecimals(2.5, Math.SQRT2)).toBe(-1);
  });

  it('Umlegen: Streifen (L − S)/2, fast-Quadrat mit der Seite (L + S)/2, fehlende Ecke d²', () => {
    // a = 2, x = 2: Rechteck 2 × 1, Streifen 0,5 → 1,5² = 2,25 = 2 + 0,5²
    const c = heronCut(2, 2);
    expect(c.longIsX).toBe(true);
    expect(c.d).toBe(0.5);
    expect(c.next).toBe(1.5);
    expect(c.next * c.next).toBeCloseTo(2 + c.corner, 14);
    // hohes Rechteck 1 × 10: lange Seite senkrecht
    const h = heronCut(10, 1);
    expect(h.longIsX).toBe(false);
    expect(h.next).toBe(5.5);
    expect(h.next * h.next).toBeCloseTo(10 + h.corner, 12);
    // Quadrat: nichts umzulegen
    expect(heronCut(49, 7).d).toBe(0);
  });
});

describe('Modell: Quadratwurzel – Intervallschachtelung', () => {
  it('√2: 1 < √2 < 2; 1,4 < √2 < 1,5; 1,41 < √2 < 1,42; 1,414 < √2 < 1,415', () => {
    expect(nestInterval(2, 0)).toEqual([1, 2]);
    expect(nestInterval(2, 1)).toEqual([1.4, 1.5]);
    expect(nestInterval(2, 2)).toEqual([1.41, 1.42]);
    expect(nestInterval(2, 3)).toEqual([1.414, 1.415]);
    expect(nestInterval(2, 6)).toEqual([1.414213, 1.414214]);
  });

  it('Proben durch Quadrieren: 1,96 < 2 < 2,25 und 1,9881 < 2 < 2,0164', () => {
    const p1 = nestProbes(2, 1);
    expect(p1.map((p) => p.t)).toEqual([1.1, 1.2, 1.3, 1.4, 1.5]);
    expect(p1[3]!.sq).toBeCloseTo(1.96, 12);
    expect(p1[3]!.cmp).toBe(-1);
    expect(p1[4]!.sq).toBeCloseTo(2.25, 12);
    expect(p1[4]!.cmp).toBe(1);
    const p2 = nestProbes(2, 2);
    expect(p2.map((p) => p.t)).toEqual([1.41, 1.42]);
    expect(p2[0]!.sq).toBeCloseTo(1.9881, 12);
    expect(p2[1]!.sq).toBeCloseTo(2.0164, 12);
    // Stufe 0: natürliche Zahlen 1, 2 (1 < 2 < 4)
    expect(nestProbes(2, 0).map((p) => [p.t, p.sq, p.cmp])).toEqual([
      [1, 1, -1],
      [2, 4, 1],
    ]);
    // √3: 1,7² = 2,89 < 3 < 3,24 = 1,8²
    const p3 = nestProbes(3, 1);
    expect(p3.at(-2)!.sq).toBeCloseTo(2.89, 12);
    expect(p3.at(-1)!.sq).toBeCloseTo(3.24, 12);
    expect(nestInterval(3, 1)).toEqual([1.7, 1.8]);
  });

  it('jede Stufe: lo² ≤ a < hi², Länge 10^−k, Intervalle ineinander geschachtelt', () => {
    const rnd = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const a = 1 + Math.floor(rnd() * 200);
      let prev: [number, number] = [-Infinity, Infinity];
      for (let k = 0; k <= 6; k++) {
        const [lo, hi] = nestInterval(a, k);
        expect(hi - lo).toBeCloseTo(10 ** -k, 12);
        expect(lo).toBeGreaterThanOrEqual(prev[0] - 1e-12);
        expect(hi).toBeLessThanOrEqual(prev[1] + 1e-12);
        expect(lo).toBeLessThanOrEqual(Math.sqrt(a) + 1e-12);
        expect(hi).toBeGreaterThan(Math.sqrt(a));
        // die letzte Probe ist die obere Grenze (oder ein Volltreffer)
        const pr = nestProbes(a, k);
        if (pr.length) {
          const last = pr.at(-1)!;
          if (last.cmp === 1) expect(last.t).toBeCloseTo(hi, 12);
          else expect(last.t).toBeCloseTo(lo, 12);
          for (const p of pr.slice(0, -1)) expect(p.cmp).toBe(-1);
        }
        prev = [lo, hi];
      }
    }
  });

  it('Quadratzahlen: √49 = 7, √144 = 12 – die Schachtelung endet', () => {
    expect(isPerfectSquare(49)).toBe(true);
    expect(isPerfectSquare(144)).toBe(true);
    expect(isPerfectSquare(50)).toBe(false);
    expect(floorSqrt(144)).toBe(12);
    expect(floorSqrt(143)).toBe(11);
    expect(exactAt(49, 0)).toBe(true);
    expect(exactAt(2, 5)).toBe(false);
    expect(nestInterval(49, 2)).toEqual([7, 7.01]);
    expect(nestProbes(49, 0).at(-1)).toEqual({ t: 7, sq: 49, cmp: 0 });
    expect(nestProbes(49, 1)).toEqual([]);
  });
});

describe('Modell: Quadratwurzel – Zahlen', () => {
  it('ganzzahlige Wurzel exakt, auch für große Zahlen', () => {
    expect(isqrt(0n)).toBe(0n);
    expect(isqrt(1n)).toBe(1n);
    expect(isqrt(2n)).toBe(1n);
    expect(isqrt(99n)).toBe(9n);
    expect(isqrt(100n)).toBe(10n);
    const big = 12345678901234567890n;
    expect(isqrt(big * big)).toBe(big);
    expect(isqrt(big * big - 1n)).toBe(big - 1n);
  });

  it('Dezimalstellen von √2 stimmen (50 Stellen), √10 ≈ 3,162278 (abgeschnitten 3,162277)', () => {
    expect(sqrtDigits(2, 50)).toBe(SQRT2_50);
    expect(sqrtDigits(2, 0)).toBe('1');
    expect(sqrtDigits(10, 6)).toBe('3.162277');
    expect(sqrtDigits(49, 3)).toBe('7.000');
    expect(Number(SQRT2_50)).toBeCloseTo(Math.SQRT2, 15);
  });

  it('teilweise Wurzelziehen: √50 = 5·√2 ≈ 7,071; √72 = 6√2; √12 = 2√3; √49 = 7; √7 bleibt', () => {
    expect(squareFactor(50)).toEqual({ k: 5, m: 2 });
    expect(5 * Math.SQRT2).toBeCloseTo(7.071, 3);
    expect(Math.sqrt(50)).toBeCloseTo(5 * Math.SQRT2, 13);
    expect(squareFactor(72)).toEqual({ k: 6, m: 2 });
    expect(squareFactor(12)).toEqual({ k: 2, m: 3 });
    expect(squareFactor(49)).toEqual({ k: 7, m: 1 });
    expect(squareFactor(200)).toEqual({ k: 10, m: 2 });
    expect(squareFactor(7)).toEqual({ k: 1, m: 7 });
    for (let a = 1; a <= 200; a++) {
      const { k, m } = squareFactor(a);
      expect(k * k * m).toBe(a);
      // m enthält keinen Quadratfaktor mehr
      expect(squareFactor(m).k).toBe(1);
    }
  });

  it('√2 irrational: Fast-Treffer p² − 2q² = ±1, nie 0 (1/1, 3/2, 7/5, 17/12, …)', () => {
    const list = nearMisses(8);
    expect(list.map((r) => `${r.p}/${r.q}`)).toEqual(['1/1', '3/2', '7/5', '17/12', '41/29', '99/70', '239/169', '577/408']);
    list.forEach((r, i) => {
      expect(r.diff).toBe(i % 2 === 0 ? -1 : 1);
      expect(r.p2 - r.q2x2).toBe(r.diff);
    });
    // die Heron-Näherungen 3/2, 17/12, 577/408 sind darunter
    const names = new Set(list.map((r) => `${r.p}/${r.q}`));
    for (const [p, q] of heronFractions(2, 2, 1, 3).slice(1)) expect(names.has(`${p}/${q}`)).toBe(true);
    // keine kleine Quadratzahl ist das Doppelte einer Quadratzahl
    for (let q = 1; q <= 2000; q++) expect(isPerfectSquare(2 * q * q)).toBe(false);
  });

  it('Kästchen: a Einheitsquadrate, Winkelhaken 1 + 3 + 5 + …, Rest im nächsten Haken', () => {
    const c50 = squareCells(50);
    expect(c50.length).toBe(50);
    expect(c50.filter((c) => !c.rest).length).toBe(49);
    expect(c50.filter((c) => c.rest).map((c) => [c.i, c.j])).toEqual([[7, 0]]);
    const c9 = squareCells(9);
    expect([1, 2, 3].map((L) => c9.filter((c) => c.layer === L).length)).toEqual([1, 3, 5]);
    expect(c9.every((c) => c.i < 3 && c.j < 3 && !c.rest)).toBe(true);
    for (let a = 1; a <= 200; a++) {
      const cells = squareCells(a);
      expect(cells.length).toBe(a);
      expect(new Set(cells.map((c) => `${c.i},${c.j}`)).size).toBe(a);
      const k = floorSqrt(a);
      expect(cells.filter((c) => !c.rest).length).toBe(k * k);
    }
  });
});
