import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  angleAt,
  angleBetween,
  angleFromSides,
  counterPointX,
  dist,
  figure,
  lengths,
  measureCm,
  parallel,
  parallelByRatios,
  pieceRatios,
  pondGeometry,
  pondWidth,
  ratios,
  shadowLengths,
  sideAB,
  sideRange,
  solveProportion,
  solveTask,
  sunElevation,
  taskFigure,
  TASKS,
  treeHeight,
  validTriangle,
  type Ask,
} from '../src/simulations/mathematik/strahlensaetze/model';

describe('Modell: Strahlensätze – Figur', () => {
  it('Prüfwert V-Figur: |ZA| = 3, |ZB| = 4, k = 2 → |ZA′| = 6, |ZB′| = 8', () => {
    const L = lengths(figure(3, 4, 40, 2, 2));
    expect(L.za2).toBeCloseTo(6, 12);
    expect(L.zb2).toBeCloseTo(8, 12);
    expect(L.aa2).toBeCloseTo(3, 12);
    expect(L.bb2).toBeCloseTo(4, 12);
  });

  it('Prüfwert: bei 40° ist |AB| = √(25 − 24·cos 40°) ≈ 2,572 und |A′B′| ≈ 5,144', () => {
    const L = lengths(figure(3, 4, 40, 2, 2));
    expect(L.ab).toBeCloseTo(Math.sqrt(25 - 24 * Math.cos((40 * Math.PI) / 180)), 12);
    expect(L.ab).toBeCloseTo(2.572, 3);
    expect(L.a2b2).toBeCloseTo(5.144, 3);
    expect(sideAB(3, 4, 40)).toBeCloseTo(L.ab, 12);
  });

  it('V-Figur: alle drei Verhältnisse sind gleich k', () => {
    const f = figure(3, 4, 40, 2.5, 2.5);
    const r = ratios(f);
    expect(r.r1).toBeCloseTo(2.5, 12);
    expect(r.r2).toBeCloseTo(2.5, 12);
    expect(r.r3).toBeCloseTo(2.5, 12);
    expect(parallel(f)).toBe(true);
    expect(dist(f.z, f.b2)).toBeCloseTo(10, 12);
  });

  it('Abschnitte-Form: |ZA| : |AA′| = |ZB| : |BB′| (gilt nicht für die Parallelen)', () => {
    const f = figure(3, 4, 40, 2, 2);
    const pr = pieceRatios(f);
    expect(pr.pa).toBeCloseTo(1, 12);
    expect(pr.pb).toBeCloseTo(1, 12);
    // Stolperstein: |AB| : |A′B′| = 1 : 2, aber |ZA| : |AA′| = 1 : 1
    const L = lengths(f);
    expect(L.ab / L.a2b2).toBeCloseTo(0.5, 12);
    expect(L.ab / L.a2b2).not.toBeCloseTo(pr.pa, 3);
  });

  it('X-Figur: Verhältnisse gleich |k|, Punkte auf der anderen Seite von Z', () => {
    const f = figure(4, 5, 40, -0.75, -0.75);
    const r = ratios(f);
    expect(r.r1).toBeCloseTo(0.75, 12);
    expect(r.r2).toBeCloseTo(0.75, 12);
    expect(r.r3).toBeCloseTo(0.75, 12);
    expect(f.b2[0]).toBeLessThan(0);
    expect(f.a2[1]).toBeLessThan(0);
    expect(parallel(f)).toBe(true);
    // Abschnitte gehen hier über Z hinweg: |AA′| = |ZA| + |ZA′|
    const L = lengths(f);
    expect(L.aa2).toBeCloseTo(4 + 3, 12);
    expect(pieceRatios(f).pa).toBeCloseTo(pieceRatios(f).pb, 12);
  });

  it('Sonderfälle: k = 1 (A′ = A), k < 1 (Verkleinerung)', () => {
    const f = figure(3, 4, 40, 1, 1);
    expect(dist(f.a, f.a2)).toBe(0);
    expect(pieceRatios(f).pa).toBe(Infinity);
    const g = figure(6, 7, 40, 0.5, 0.5);
    expect(lengths(g).za2).toBeCloseTo(3, 12);
    expect(lengths(g).zb2).toBeCloseTo(3.5, 12);
    expect(ratios(g).r3).toBeCloseTo(0.5, 12);
  });

  it('Sonderfälle: sehr spitzer und sehr stumpfer Winkel', () => {
    for (const th of [10, 150]) {
      const f = figure(3, 4, th, 2, 2);
      const r = ratios(f);
      expect(r.r1).toBeCloseTo(2, 12);
      expect(r.r3).toBeCloseTo(2, 12);
      expect(parallel(f)).toBe(true);
    }
  });

  it('Prüfwert nicht parallel: Faktoren 2 und 1,4 → Verhältnisse verschieden', () => {
    const f = figure(3, 4, 40, 2, 1.4);
    expect(parallel(f, 1e-6)).toBe(false);
    expect(parallelByRatios(2, 1.4)).toBe(false);
    const r = ratios(f);
    expect(r.r1).toBeCloseTo(2, 12);
    expect(r.r2).toBeCloseTo(1.4, 12);
    expect(lengths(f).zb2).toBeCloseTo(5.6, 12);
    expect(angleBetween(f)).toBeGreaterThan(1);
    expect(angleBetween(figure(3, 4, 40, 2, 2))).toBeCloseTo(0, 9);
  });

  it('Umkehrung des 1. Strahlensatzes: gleiche Faktoren ⇒ parallel', () => {
    expect(parallelByRatios(1.6, 1.6)).toBe(true);
    expect(parallel(figure(2.5, 6, 70, 1.6, 1.6))).toBe(true);
    // gleicher Betrag, aber verschiedene Seiten von Z: nicht parallel
    expect(parallel(figure(3, 4, 40, 2, -2), 1e-6)).toBe(false);
  });

  it('Umkehrung des 2. Strahlensatzes gilt nicht: B″ mit |A′B″| : |AB| = k, aber nicht parallel', () => {
    const a = 3;
    const b = 4;
    const th = 40;
    const k = 2;
    const x2 = counterPointX(a, b, th, k);
    // 2 · 3 · cos 40° − 4 ≈ 0,596 → x ≈ 1,193
    expect(x2).toBeCloseTo(2 * (6 * Math.cos((40 * Math.PI) / 180) - 4), 12);
    expect(x2).toBeGreaterThan(0);
    const kb = x2 / b;
    const f = figure(a, b, th, k, kb);
    expect(ratios(f).r3).toBeCloseTo(k, 12);
    expect(parallel(f, 1e-6)).toBe(false);
  });

  it('Ähnliche Dreiecke: ZAB und ZA′B′ haben gleiche Winkel', () => {
    const f = figure(3, 4, 40, 2, 2);
    expect(angleAt(f.a, f.z, f.b)).toBeCloseTo(angleAt(f.a2, f.z, f.b2), 9);
    expect(angleAt(f.b, f.z, f.a)).toBeCloseTo(angleAt(f.b2, f.z, f.a2), 9);
    expect(angleAt(f.z, f.a, f.b)).toBeCloseTo(40, 9);
  });

  it('Plausibilität: 2000 zufällige Figuren (V und X)', () => {
    const rnd = seededRandom(9);
    for (let i = 0; i < 2000; i++) {
      const a = 1 + rnd() * 7;
      const b = 1 + rnd() * 7;
      const th = 10 + rnd() * 140;
      const k = (0.2 + rnd() * 2.8) * (rnd() < 0.5 ? -1 : 1);
      const f = figure(a, b, th, k, k);
      const r = ratios(f);
      expect(r.r1).toBeCloseTo(Math.abs(k), 9);
      expect(r.r2).toBeCloseTo(Math.abs(k), 9);
      expect(r.r3).toBeCloseTo(Math.abs(k), 9);
      expect(parallel(f, 1e-9)).toBe(true);
      const pr = pieceRatios(f);
      if (Math.abs(k - 1) > 1e-3) expect(pr.pa).toBeCloseTo(pr.pb, 6);
      // ein anderer Faktor für B′ zerstört die Parallelität
      const kb = k + (rnd() < 0.5 ? -0.3 : 0.3);
      expect(parallel(figure(a, b, th, k, kb), 1e-6)).toBe(false);
      // Rechenmodus: jede Aufgabe liefert genau die Länge aus der Figur
      for (const ask of Object.keys(TASKS) as Ask[]) {
        const s = solveTask(ask, f);
        expect(s.x).toBeCloseTo(s.exact, 9);
      }
    }
  });
});

describe('Modell: Strahlensätze – Rechnen mit der Unbekannten x', () => {
  it('Verhältnisgleichung x : d₁ = n₂ : d₂', () => {
    expect(solveProportion(4, 6, 3)).toBeCloseTo(8, 12);
  });

  it('Prüfwert 1. Strahlensatz: |ZA| = 3, |ZA′| = 6, |ZB| = 4 → |ZB′| = 8', () => {
    const s = solveTask('zb2', taskFigure(3, 4, 2.6, 2, false));
    expect(s.d1).toBeCloseTo(4, 12);
    expect(s.n2).toBeCloseTo(6, 12);
    expect(s.d2).toBeCloseTo(3, 12);
    expect(s.x).toBeCloseTo(8, 12);
  });

  it('Prüfwert Abschnitte: |ZA| = 2,5, |AA′| = 3,5, |ZB| = 3 → |BB′| = 3,5 · 3 : 2,5 = 4,2', () => {
    expect(solveProportion(3, 3.5, 2.5)).toBeCloseTo(4.2, 12);
    const s = solveTask('bb2', taskFigure(2.5, 3, 2, 2.4, false));
    expect(s.n2).toBeCloseTo(3.5, 12);
    expect(s.x).toBeCloseTo(4.2, 12);
    expect(s.spec.pieces).toBe(true);
  });

  it('Prüfwert 2. Strahlensatz: |ZA| = 4, |ZA′| = 10, |AB| = 3 → |A′B′| = 7,5', () => {
    expect(solveProportion(3, 10, 4)).toBeCloseTo(7.5, 12);
    const f = taskFigure(4, 5, 3, 2.5, false);
    // 3-4-5-Dreieck: Winkel bei Z mit cos = 0,8
    expect(dist(f.a, f.b)).toBeCloseTo(3, 12);
    expect(solveTask('a2b2', f).x).toBeCloseTo(7.5, 12);
  });

  it('Unbekannte im Nenner: |AB| aus |ZB|, |ZB′|, |A′B′| und |ZB| aus |ZA|, |ZA′|, |ZB′|', () => {
    const f = taskFigure(4, 5, 3, 2.5, false);
    expect(solveTask('ab', f).x).toBeCloseTo(3, 12);
    expect(solveTask('zb', f).x).toBeCloseTo(5, 12);
  });

  it('X-Figur im Rechenmodus: gleiche Längen, Punkte gespiegelt', () => {
    const f = taskFigure(4, 5, 3, 0.75, true);
    expect(f.a2[0]).toBeLessThan(0);
    expect(solveTask('zb2', f).x).toBeCloseTo(3.75, 12);
    expect(solveTask('a2b2', f).x).toBeCloseTo(2.25, 12);
    // Abschnitt über Z hinweg: |AA′| = 4 + 3 = 7, |BB′| = 7 · 5 : 4 = 8,75
    expect(solveTask('bb2', f).x).toBeCloseTo(8.75, 12);
  });

  it('Seiten des Dreiecks: Winkel aus drei Seiten, gültiger Bereich', () => {
    expect(angleFromSides(4, 5, 3)).toBeCloseTo((Math.acos(0.8) * 180) / Math.PI, 12);
    expect(angleFromSides(3, 4, 5)).toBeCloseTo(90, 12);
    expect(sideAB(3, 4, angleFromSides(3, 4, 2.6))).toBeCloseTo(2.6, 12);
    expect(validTriangle(3, 4, 5)).toBe(true);
    expect(validTriangle(3, 4, 7)).toBe(false);
    const [lo, hi] = sideRange(3, 4);
    expect(lo).toBeGreaterThan(1);
    expect(hi).toBeLessThan(7);
    // ungültiges c wird in den Bereich gelegt
    const f = taskFigure(3, 4, 9, 2, false);
    expect(dist(f.a, f.b)).toBeCloseTo(hi, 9);
  });
});

describe('Modell: Strahlensätze – Anwendungen', () => {
  it('Prüfwert Baumhöhe: Stab 1,5 m, |ZB| = 2 m, |ZB′| = 16 m → h = 12 m', () => {
    expect(treeHeight(1.5, 2, 16)).toBeCloseTo(12, 12);
    const el = sunElevation(1.5, 2);
    expect(el).toBeCloseTo(36.8699, 3);
    // Beispiel der Simulation mit Sonnenhöhe 36,87° (auf Zentimeter gemessen)
    const { dStick, dTree } = shadowLengths(12, 1.5, 36.87);
    expect(measureCm(dStick)).toBeCloseTo(2, 12);
    expect(measureCm(dTree)).toBeCloseTo(16, 12);
    expect(treeHeight(1.5, measureCm(dStick), measureCm(dTree))).toBeCloseTo(12, 12);
  });

  it('Prüfwert: bei Sonnenhöhe 45° ist der Schatten so lang wie der Baum hoch', () => {
    expect(shadowLengths(10, 2, 45).dTree).toBeCloseTo(10, 10);
    expect(shadowLengths(12, 1.5, 45).dStick).toBeCloseTo(1.5, 10);
  });

  it('Baumhöhe: das Ergebnis hängt nicht von der Sonnenhöhe ab', () => {
    for (const el of [20, 30, 35, 45, 60]) {
      const { dStick, dTree } = shadowLengths(12, 1.5, el);
      expect(dTree / dStick).toBeCloseTo(8, 12);
      expect(treeHeight(1.5, dStick, dTree)).toBeCloseTo(12, 10);
    }
  });

  it('Prüfwert Teich: k = 4, |A′B′| = 6 m → |AB| = 24 m', () => {
    expect(pondWidth(4, 6)).toBe(24);
    const t = pondGeometry(24, 4);
    expect(dist(t.A2, t.B2)).toBeCloseTo(6, 12);
    expect(dist(t.Z, t.A) / dist(t.Z, t.A2)).toBeCloseTo(4, 12);
    expect(dist(t.Z, t.B) / dist(t.Z, t.B2)).toBeCloseTo(4, 12);
    // A′B′ parallel zu AB (Umkehrung des 1. Strahlensatzes)
    expect(t.A2[1]).toBeCloseTo(t.B2[1], 12);
  });

  it('Teich: für alle k ist k · |A′B′| die wahre Breite', () => {
    for (const k of [2, 3, 4, 5, 6]) {
      for (const w of [8, 15.5, 40]) {
        const t = pondGeometry(w, k);
        expect(pondWidth(k, dist(t.A2, t.B2))).toBeCloseTo(w, 10);
      }
    }
  });
});

describe('Modell: Strahlensätze – Prüfrunde (Reglergrenzen, Beispiele)', () => {
  it('Beispiel „Nicht parallel“: |ZA| = 3, |ZB| = 4, 40°, Faktoren 2 und 1,4 → Abweichung ≈ 26,8°', () => {
    const f = figure(3, 4, 40, 2, 1.4);
    expect(angleBetween(f)).toBeCloseTo(26.8, 1);
    const L = lengths(f);
    expect(L.zb2).toBeCloseTo(5.6, 12);
    // |A′B′| ≈ 3,99 cm wie in der Anzeige
    expect(Math.round(L.a2b2 * 100) / 100).toBe(3.99);
  });

  it('Gegenbeispiel B″: gleicher Abstand von A′ wie B′ = k · B', () => {
    for (const [a, b, th, k] of [
      [3, 4, 40, 2],
      [5, 3, 60, 1.5],
      [8, 8, 10, 3],
    ] as [number, number, number, number][]) {
      const f = figure(a, b, th, k, k);
      const x2 = counterPointX(a, b, th, k);
      expect(dist(f.a2, [x2, 0])).toBeCloseTo(dist(f.a2, f.b2), 9);
    }
  });

  it('Rechenmodus an den Reglergrenzen (|ZA|, |ZB| = 1 … 8, k = 0,2 … 3, |AB| = 0,5 … 15, V und X)', () => {
    for (const a of [1, 4.5, 8])
      for (const b of [1, 4.5, 8])
        for (const c of [0.5, 2.6, 15])
          for (const k of [0.2, 1, 3])
            for (const xf of [false, true]) {
              const f = taskFigure(a, b, c, k, xf);
              const [lo, hi] = sideRange(a, b);
              const ab = dist(f.a, f.b);
              expect(ab).toBeGreaterThanOrEqual(lo - 1e-9);
              expect(ab).toBeLessThanOrEqual(hi + 1e-9);
              for (const ask of Object.keys(TASKS) as Ask[]) {
                const s = solveTask(ask, f);
                expect(Number.isFinite(s.x)).toBe(true);
                expect(s.x).toBeCloseTo(s.exact, 9);
              }
            }
  });

  it('Baumhöhe mit auf Zentimeter gemessenen Schatten: höchstens 0,2 m neben der wahren Höhe', () => {
    for (let el = 20; el <= 60; el += 0.5)
      for (const ht of [5, 12, 20])
        for (const st of [1, 1.5, 2.5]) {
          const { dStick, dTree } = shadowLengths(ht, st, el);
          const h = treeHeight(st, measureCm(dStick), measureCm(dTree));
          expect(Math.abs(h - ht)).toBeLessThanOrEqual(0.2);
        }
  });
});
