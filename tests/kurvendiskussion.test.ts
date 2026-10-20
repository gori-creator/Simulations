import { describe, expect, it } from 'vitest';
import {
  analyze,
  degree,
  derive,
  deriveN,
  evalPoly,
  inflectionInfo,
  limits,
  realZeros,
  secondTest,
  sidesAt,
  signChart,
  signOf,
  symmetry,
  tangentLine,
  zeroOrder,
  zeros,
} from '../src/simulations/mathematik/kurvendiskussion/model';

/** Koeffizienten niedrigster Grad zuerst: [d, c, b, a, q] = d + c x + b x² + a x³ + q x⁴. */
const X3_3X = [0, -3, 0, 1];
const X4_2X2 = [0, 0, -2, 0, 1];
const X3 = [0, 0, 0, 1];
const X4 = [0, 0, 0, 0, 1];
const HILL = [0, 0, 3, -1];

describe('Modell: Monotonie, Extrem- und Wendestellen', () => {
  it('f(x) = x³ − 3x: H(−1 | 2), T(1 | −2), W(0 | 0)', () => {
    const a = analyze([0, -3, 0, 1]);
    expect(a.extrema.map((e) => [Number(e.x.toFixed(9)), Number(e.y.toFixed(9)), e.kind])).toEqual([
      [-1, 2, 'max'],
      [1, -2, 'min'],
    ]);
    expect(a.inflections.length).toBe(1);
    expect(a.inflections[0]!.x).toBeCloseTo(0, 9);
    expect(a.mono.map((m) => m.sign)).toEqual([1, -1, 1]);
    expect(a.curv.map((m) => m.sign)).toEqual([-1, 1]);
  });
  it('f(x) = −x³ + 3x²: T(0 | 0), H(2 | 4), W(1 | 2)', () => {
    const a = analyze([0, 0, 3, -1]);
    expect(a.extrema[0]!.kind).toBe('min');
    expect(a.extrema[1]!.x).toBeCloseTo(2, 9);
    expect(a.extrema[1]!.y).toBeCloseTo(4, 9);
    expect(a.inflections[0]!.y).toBeCloseTo(2, 9);
  });
  it('x³: Terrassenpunkt bei 0, streng monoton steigend', () => {
    const a = analyze([0, 0, 0, 1]);
    expect(a.extrema).toEqual([{ x: 0, y: 0, kind: 'saddle' }]);
    expect(a.mono.map((m) => m.sign)).toEqual([1]);
    expect(a.inflections[0]!.x).toBeCloseTo(0, 9);
  });
  it('x⁴: Tiefpunkt, obwohl f″(0) = 0 – und keine Wendestelle', () => {
    const a = analyze([0, 0, 0, 0, 1]);
    expect(a.extrema).toEqual([{ x: 0, y: 0, kind: 'min' }]);
    expect(evalPoly(a.d2, 0)).toBe(0);
    expect(a.inflections).toEqual([]);
  });
  it('0,5x⁴ − 2x²: Tiefpunkte bei ±√2, Hochpunkt bei 0', () => {
    const a = analyze([0, 0, -2, 0, 0.5]);
    expect(a.extrema.map((e) => e.kind)).toEqual(['min', 'max', 'min']);
    expect(a.extrema[2]!.x).toBeCloseTo(Math.SQRT2, 9);
    expect(a.extrema[2]!.y).toBeCloseTo(-2, 9);
  });
  it('doppelte Nullstelle wird gefunden: (x − 1)²(x + 2)', () => {
    // x³ − 3x + 2
    expect(realZeros([2, -3, 0, 1], -5, 5).map((x) => Number(x.toFixed(6)))).toEqual([-2, 1]);
  });
  it('Plausibilität: f′ ist an den Extremstellen 0, Monotonie passt zu f′', () => {
    for (let i = 0; i < 40; i++) {
      const f = [0, 1, 2, 3, 4].map(() => Math.round((Math.random() * 4 - 2) * 10) / 10);
      const a = analyze(f, -20, 20);
      for (const e of a.extrema) expect(Math.abs(evalPoly(derive(f), e.x))).toBeLessThan(1e-6);
      for (const m of a.mono) {
        if (!Number.isFinite(m.from) || !Number.isFinite(m.to)) continue;
        const x = (m.from + m.to) / 2;
        expect(Math.sign(evalPoly(a.d1, x))).toBe(m.sign);
      }
    }
  });

  /* ---------- aus der Fassung der Vertretung ---------- */

  it('Symmetrie: x³ − 3x punktsymmetrisch, 0,5x⁴ − 2x² achsensymmetrisch, −x³ + 3x² keine', () => {
    expect(symmetry([0, -3, 0, 1])).toBe('odd');
    expect(symmetry([0, 0, -2, 0, 0.5])).toBe('even');
    expect(symmetry([0, 0, 3, -1])).toBe('none');
    expect(symmetry([1, -3, 0, 1])).toBe('none');
    expect(symmetry([2])).toBe('even');
  });
  it('Verhalten im Unendlichen nach Grad und Leitkoeffizient', () => {
    expect(limits([0, -3, 0, 1])).toEqual([-1, 1]);
    expect(limits([0, 0, 3, -1])).toEqual([1, -1]);
    expect(limits([0, 0, -2, 0, 0.5])).toEqual([1, 1]);
    expect(limits([0, 0, 0, 0, -1])).toEqual([-1, -1]);
    expect(limits([4])).toEqual([0, 0]);
  });
  it('Nullstellen: x³ − 3x bei 0 und ±√3, −x³ + 3x² bei 0 (doppelt) und 3', () => {
    const z = zeros([0, -3, 0, 1]);
    expect(z).toHaveLength(3);
    expect(z[0]).toBeCloseTo(-Math.sqrt(3), 9);
    expect(z[1]).toBe(0);
    expect(z[2]).toBeCloseTo(Math.sqrt(3), 9);
    const z2 = zeros([0, 0, 3, -1]);
    expect(z2).toHaveLength(2);
    expect(z2[0]).toBeCloseTo(0, 9);
    expect(z2[1]).toBeCloseTo(3, 9);
    expect(zeros([1, 0, 1])).toEqual([]);
  });
  it('f″-Kriterium: x³ − 3x hat f″(−1) = −6 < 0 (Hochpunkt) und f″(1) = 6 > 0 (Tiefpunkt)', () => {
    const a = analyze([0, -3, 0, 1]);
    expect(evalPoly(a.d2, -1)).toBe(-6);
    expect(evalPoly(a.d2, 1)).toBe(6);
  });

  /* ---------- Prüfwerte der Leitung ---------- */

  it('Prüfwert x³ − 3x: f′ = 3x² − 3, steigend für x < −1 und x > 1, fallend dazwischen', () => {
    const a = analyze(X3_3X);
    expect(a.d1).toEqual([-3, 0, 3]);
    expect(a.d2).toEqual([0, 6]);
    expect(a.candidates.map((x) => Number(x.toFixed(9)))).toEqual([-1, 1]);
    expect(a.mono).toHaveLength(3);
    expect(a.mono[0]!.from).toBe(-Infinity);
    expect(a.mono[0]!.to).toBeCloseTo(-1, 9);
    expect(a.mono[0]!.sign).toBe(1);
    expect(a.mono[1]!.sign).toBe(-1);
    expect(a.mono[2]!.from).toBeCloseTo(1, 9);
    expect(a.mono[2]!.to).toBe(Infinity);
    expect(a.mono[2]!.sign).toBe(1);
    expect(a.inflections[0]!.y).toBeCloseTo(0, 12);
  });
  it('Prüfwert x⁴ − 2x²: T(±1 | −1), H(0 | 0), Wendestellen ±1/√3 mit f = −5/9', () => {
    const a = analyze(X4_2X2);
    expect(a.extrema.map((e) => e.kind)).toEqual(['min', 'max', 'min']);
    expect(a.extrema[0]!.x).toBeCloseTo(-1, 9);
    expect(a.extrema[0]!.y).toBeCloseTo(-1, 9);
    expect(a.extrema[1]!.x).toBeCloseTo(0, 9);
    expect(a.extrema[1]!.y).toBeCloseTo(0, 12);
    expect(a.extrema[2]!.x).toBeCloseTo(1, 9);
    expect(a.extrema[2]!.y).toBeCloseTo(-1, 9);
    expect(a.inflections).toHaveLength(2);
    expect(a.inflections[0]!.x).toBeCloseTo(-1 / Math.sqrt(3), 9);
    expect(a.inflections[1]!.x).toBeCloseTo(1 / Math.sqrt(3), 9);
    expect(a.inflections[1]!.x).toBeCloseTo(0.577, 3);
    for (const w of a.inflections) expect(w.y).toBeCloseTo(-5 / 9, 9);
    expect(a.inflections[0]!.y).toBeCloseTo(-0.556, 3);
    // Krümmung: links – rechts – links
    expect(a.curv.map((c) => c.sign)).toEqual([1, -1, 1]);
  });
  it('Prüfwert x³: Terrassenpunkt (0 | 0), kein Extremum', () => {
    const a = analyze(X3);
    expect(a.extrema.filter((e) => e.kind !== 'saddle')).toEqual([]);
    expect(a.extrema[0]!.kind).toBe('saddle');
    expect(sidesAt(a.d1, 0)).toEqual([1, 1]);
    const w = inflectionInfo(X3, 0);
    expect(w.change).toBe(true);
    expect(w.saddle).toBe(true);
    expect(w.d3).toBe(6);
  });
  it('Prüfwert x⁴: Tiefpunkt (0 | 0) trotz f″(0) = 0, keine Wendestelle', () => {
    const a = analyze(X4);
    expect(a.extrema).toEqual([{ x: 0, y: 0, kind: 'min' }]);
    expect(secondTest(X4, 0)).toBeNull();
    expect(sidesAt(a.d1, 0)).toEqual([-1, 1]);
    // f″ = 12x² hat bei 0 eine Nullstelle, aber ohne Vorzeichenwechsel
    expect(a.wCandidates).toEqual([0]);
    expect(inflectionInfo(X4, 0).change).toBe(false);
    expect(a.inflections).toEqual([]);
    expect(a.curv.map((c) => c.sign)).toEqual([1]);
  });
  it('Prüfwert −x³ + 3x²: T(0 | 0), H(2 | 4), W(1 | 2)', () => {
    const a = analyze(HILL);
    expect(a.extrema.map((e) => e.kind)).toEqual(['min', 'max']);
    expect(a.extrema[0]!.x).toBeCloseTo(0, 9);
    expect(a.extrema[0]!.y).toBeCloseTo(0, 12);
    expect(a.extrema[1]!.x).toBeCloseTo(2, 9);
    expect(a.extrema[1]!.y).toBeCloseTo(4, 9);
    expect(a.inflections).toHaveLength(1);
    expect(a.inflections[0]!.x).toBeCloseTo(1, 9);
    expect(a.inflections[0]!.y).toBeCloseTo(2, 9);
    expect(secondTest(HILL, 0)).toBe('min');
    expect(secondTest(HILL, 2)).toBe('max');
    // Wendetangente: Steigung f′(1) = −3 + 6 = 3
    expect(inflectionInfo(HILL, 1).slope).toBeCloseTo(3, 12);
  });

  /* ---------- weitere Bausteine ---------- */

  it('höhere Ableitungen: (x⁴)‴ = 24x, (x⁴)⁗ = 24', () => {
    expect(deriveN(X4, 0)).toEqual(X4);
    expect(deriveN(X4, 3)).toEqual([0, 24]);
    expect(deriveN(X4, 4)).toEqual([24]);
    expect(degree(deriveN(X4, 5))).toBe(-1);
  });
  it('Vielfachheit: x²(3 − x) doppelt bei 0, einfach bei 3; x³ dreifach; −0,25x⁴ + x³ dreifach bei 0', () => {
    expect(zeroOrder(HILL, 0)).toBe(2);
    expect(zeroOrder(HILL, 3)).toBe(1);
    expect(zeroOrder(HILL, 1)).toBe(0);
    expect(zeroOrder(X3, 0)).toBe(3);
    const full = [0, 0, 0, 1, -0.25];
    expect(zeroOrder(full, 0)).toBe(3);
    expect(zeroOrder(full, 4)).toBe(1);
    // numerisch gefundene doppelte Nullstelle (x − 1)²(x + 2)
    const dbl = realZeros([2, -3, 0, 1], -5, 5);
    expect(zeroOrder([2, -3, 0, 1], dbl[1]!)).toBe(2);
  });
  it('Vorzeichentabelle von f′ für x³ − 3x: + | 0 | − | 0 | +', () => {
    const a = analyze(X3_3X);
    const t = signChart(a.d1, a.candidates);
    expect(t.iv).toEqual([1, -1, 1]);
    expect(t.at).toEqual([0, 0]);
    // ohne Stellen: ein einziges Intervall ℝ
    expect(signChart([1, 0, 1], []).iv).toEqual([1]);
    // Stellen werden sortiert
    expect(signChart([0, 1], [2, -2]).xs).toEqual([-2, 2]);
  });
  it('Vorzeichentabelle von f″ für x⁴ − 2x²: + | − | + (links, rechts, links)', () => {
    const a = analyze(X4_2X2);
    const t = signChart(a.d2, a.wCandidates);
    expect(t.iv).toEqual([1, -1, 1]);
    expect(t.at).toEqual([0, 0]);
  });
  it('Tangente: an x³ − 3x in x₀ = 2 ist t(x) = 9x − 16', () => {
    const t = tangentLine(X3_3X, 2);
    expect(t.y).toBe(2);
    expect(t.m).toBe(9);
    expect(t.n).toBe(-16);
    // waagrechte Tangente im Hochpunkt
    expect(tangentLine(X3_3X, -1).m).toBe(0);
  });
  it('Terrassenpunkt verschoben: x³ − 3x² + 3x hat TP(1 | 1) und W(1 | 1)', () => {
    const f = [0, 3, -3, 1];
    const a = analyze(f);
    expect(a.extrema).toHaveLength(1);
    expect(a.extrema[0]!.kind).toBe('saddle');
    expect(a.extrema[0]!.x).toBeCloseTo(1, 6);
    expect(a.extrema[0]!.y).toBeCloseTo(1, 9);
    expect(a.inflections[0]!.x).toBeCloseTo(1, 9);
    expect(inflectionInfo(f, a.inflections[0]!.x).saddle).toBe(true);
    expect(a.mono.map((m) => m.sign)).toEqual([1]);
  });
  it('Vollständig −0,25x⁴ + x³: TP(0 | 0), H(3 | 6,75), W(0 | 0) und W(2 | 4)', () => {
    const f = [0, 0, 0, 1, -0.25];
    const a = analyze(f);
    expect(a.extrema.map((e) => e.kind)).toEqual(['saddle', 'max']);
    expect(a.extrema[1]!.x).toBeCloseTo(3, 9);
    expect(a.extrema[1]!.y).toBeCloseTo(6.75, 9);
    expect(secondTest(f, 3)).toBe('max');
    expect(evalPoly(a.d2, 3)).toBeCloseTo(-9, 12);
    expect(a.inflections.map((w) => Number(w.x.toFixed(9)))).toEqual([0, 2]);
    expect(a.inflections[1]!.y).toBeCloseTo(4, 9);
    expect(limits(f)).toEqual([-1, -1]);
    expect(zeros(f).map((x) => Number(x.toFixed(9)))).toEqual([0, 4]);
  });
  it('Gerade und Konstante: keine Kandidaten, Vorzeichen von f′ überall gleich', () => {
    const lin = analyze([1, 2]);
    expect(lin.candidates).toEqual([]);
    expect(lin.extrema).toEqual([]);
    expect(lin.mono.map((m) => m.sign)).toEqual([1]);
    const con = analyze([3]);
    expect(con.candidates).toEqual([]);
    expect(con.mono.map((m) => m.sign)).toEqual([0]);
    expect(signOf([3], 1)).toBe(1);
    expect(signOf([0], 1)).toBe(0);
  });
  it('Parabel: genau ein Extremum, keine Wendestelle (f″ konstant)', () => {
    const a = analyze([1, -2, 1]);
    expect(a.extrema).toEqual([{ x: 1, y: 0, kind: 'min' }]);
    expect(a.wCandidates).toEqual([]);
    expect(a.inflections).toEqual([]);
  });
  it('Plausibilität: Vorzeichentabelle von f′ passt zu den Monotonie-Intervallen und Extrema', () => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 60; i++) {
      const f = [0, 1, 2, 3, 4].map((k) => Math.round((rnd() * 4 - 2) * (k === 4 ? 20 : 10)) / (k === 4 ? 20 : 10));
      const a = analyze(f, -30, 30);
      const t = signChart(a.d1, a.candidates);
      expect(t.iv).toHaveLength(a.candidates.length + 1);
      a.extrema.forEach((e, j) => {
        const l = t.iv[j]!;
        const r = t.iv[j + 1]!;
        const want = l > 0 && r < 0 ? 'max' : l < 0 && r > 0 ? 'min' : 'saddle';
        expect(e.kind).toBe(want);
        // f″-Kriterium widerspricht dem Vorzeichenwechsel nie
        const s = secondTest(f, e.x);
        if (s) expect(s).toBe(e.kind);
      });
      for (const w of a.inflections) expect(inflectionInfo(f, w.x).change).toBe(true);
    }
  });
});
