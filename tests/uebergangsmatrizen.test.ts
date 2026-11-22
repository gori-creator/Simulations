import { describe, expect, it } from 'vitest';
import {
  classify,
  colSums,
  determinant,
  fixedVector,
  growthFactor,
  inverse,
  isStochastic,
  limitMatrix,
  matPow,
  mulMV,
  parseMatrix,
  parseNumber,
  parseVector,
  pathProbability,
  paths,
  rank,
  series,
  stateAt,
  toFraction,
  total,
  type Mat,
} from '../src/simulations/mathematik/uebergangsmatrizen/model';

// Spalten = „von“, Zeilen = „nach“
const WEATHER: Mat = [
  [0.9, 0.2],
  [0.1, 0.8],
];
const CUSTOMERS: Mat = [
  [0.8, 0.2, 0.1],
  [0.1, 0.7, 0.2],
  [0.1, 0.1, 0.7],
];
const STUDY: Mat = [
  [0.6, 0, 0],
  [0.3, 1, 0],
  [0.1, 0, 1],
];
const BEETLE: Mat = [
  [0, 0, 6],
  [0.5, 0, 0],
  [0, 1 / 3, 0],
];

describe('Modell: Übergangsmatrizen – ein Schritt', () => {
  it('Wetter: Start (1 | 0) → nach einem Schritt (0,9 | 0,1)', () => {
    const x1 = mulMV(WEATHER, [1, 0]);
    expect(x1[0]).toBeCloseTo(0.9, 12);
    expect(x1[1]).toBeCloseTo(0.1, 12);
  });
  it('Wetter nach zwei Schritten: (0,83 | 0,17)', () => {
    const x2 = stateAt(WEATHER, [1, 0], 2)!;
    expect(x2[0]).toBeCloseTo(0.83, 12);
    expect(x2[1]).toBeCloseTo(0.17, 12);
  });
  it('M² enthält die Wahrscheinlichkeiten für zwei Schritte', () => {
    const m2 = matPow(WEATHER, 2)!;
    expect(m2[0]![0]).toBeCloseTo(0.83, 12);
    expect(m2[0]![1]).toBeCloseTo(0.34, 12);
    expect(m2[1]![0]).toBeCloseTo(0.17, 12);
    expect(m2[1]![1]).toBeCloseTo(0.66, 12);
    // Summe aller Pfade von 2 nach 1 der Länge 2 = (M²)₁₂
    const sum = paths(WEATHER, 1, 0, 2).reduce((s, p) => s + p.p, 0);
    expect(sum).toBeCloseTo(0.34, 12);
    expect(pathProbability(WEATHER, [1, 0, 0])).toBeCloseTo(0.18, 12);
  });
  it('Gesamtbestand bleibt bei stochastischen Matrizen erhalten', () => {
    const x = stateAt(CUSTOMERS, [400, 350, 250], 7)!;
    expect(total(x)).toBeCloseTo(1000, 9);
  });
});

describe('Modell: Übergangsmatrizen – stabile Verteilung', () => {
  it('Wetter: Fixvektor (2/3 | 1/3)', () => {
    const f = fixedVector(WEATHER);
    expect(f.dim).toBe(1);
    expect(f.unique![0]).toBeCloseTo(2 / 3, 12);
    expect(f.unique![1]).toBeCloseTo(1 / 3, 12);
    expect(toFraction(f.unique![0]!)).toEqual([2, 3]);
  });
  it('Kunden: Fixvektor (7/16 | 5/16 | 1/4), bei 1000 Kunden 437,5 | 312,5 | 250', () => {
    const f = fixedVector(CUSTOMERS).unique!;
    expect(f[0]).toBeCloseTo(7 / 16, 12);
    expect(f[1]).toBeCloseTo(5 / 16, 12);
    expect(f[2]).toBeCloseTo(1 / 4, 12);
    const far = stateAt(CUSTOMERS, [400, 350, 250], 200)!;
    expect(far[0]).toBeCloseTo(437.5, 6);
  });
  it('Pfadregel: alle Wege über drei Schritte ergeben genau den Eintrag von M³ (Kunden)', () => {
    const m3 = matPow(CUSTOMERS, 3)!;
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 3; i++) {
        const sum = paths(CUSTOMERS, j, i, 3).reduce((s, q) => s + q.p, 0);
        expect(sum, `${j} → ${i}`).toBeCloseTo(m3[i]![j]!, 12);
      }
    expect(paths(CUSTOMERS, 0, 0, 3).length).toBe(9);
  });
  it('Grenzmatrix einer regulären Kette hat gleiche Spalten', () => {
    const lim = limitMatrix(WEATHER)!;
    for (const row of lim) expect(row[0]).toBeCloseTo(row[1]!, 9);
    expect(lim[0]![0]).toBeCloseTo(2 / 3, 9);
    expect(classify(WEATHER).kind).toBe('regular');
  });
  it('Absorbierende Kette (Studium): Abschluss 75 %, Abbruch 25 %', () => {
    const info = classify(STUDY);
    expect(info.kind).toBe('absorbing');
    expect(info.absorbing).toEqual([1, 2]);
    expect(fixedVector(STUDY).dim).toBe(2);
    const far = stateAt(STUDY, [1, 0, 0], 200)!;
    expect(far[0]).toBeCloseTo(0, 9);
    expect(far[1]).toBeCloseTo(0.75, 9);
    expect(far[2]).toBeCloseTo(0.25, 9);
  });
  it('Zyklische Population: M³ = E, Bestand wiederholt sich', () => {
    const m3 = matPow(BEETLE, 3)!;
    m3.forEach((row, i) => row.forEach((v, j) => expect(v).toBeCloseTo(i === j ? 1 : 0, 12)));
    const info = classify(BEETLE);
    expect(info.kind).toBe('population');
    expect(info.period).toBe(3);
    const x = series(BEETLE, [600, 0, 0], 0, 3).map((s) => s.x!);
    expect(x[1]).toEqual([0, 300, 0]);
    expect(x[2]![2]).toBeCloseTo(100, 12);
    expect(x[3]![0]).toBeCloseTo(600, 12);
    expect(growthFactor(BEETLE, [600, 0, 0])).toBeCloseTo(1, 9);
  });
  it('Zyklische Übergangsmatrix kommt nicht zur Ruhe', () => {
    const swap: Mat = [
      [0, 1],
      [1, 0],
    ];
    expect(limitMatrix(swap)).toBeNull();
    expect(classify(swap).kind).toBe('periodic');
    expect(classify(swap).period).toBe(2);
    // Fixvektor existiert trotzdem
    expect(fixedVector(swap).unique![0]).toBeCloseTo(0.5, 12);
  });
  it('Wachsende Population: Wachstumsfaktor 1,2', () => {
    // Zwei Altersstufen: Jungtiere bekommen keine Nachkommen, Erwachsene 1,2;
    // 60 % der Jungtiere werden erwachsen, 60 % der Erwachsenen überleben
    const m: Mat = [
      [0, 1.2],
      [0.6, 0.6],
    ];
    // charakteristisches Polynom λ² − 0,6λ − 0,72 = 0 → λ = 1,2
    expect(growthFactor(m, [100, 100])).toBeCloseTo(1.2, 6);
  });
});

describe('Modell: Übergangsmatrizen – rückwärts', () => {
  it('Wetter: aus (0,9 | 0,1) folgt der Vorgänger (1 | 0)', () => {
    const inv = inverse(WEATHER)!;
    const x0 = mulMV(inv, [0.9, 0.1]);
    expect(x0[0]).toBeCloseTo(1, 12);
    expect(x0[1]).toBeCloseTo(0, 12);
    expect(determinant(WEATHER)).toBeCloseTo(0.7, 12);
    // Inverse: 1/0,7 · ((0,8 | −0,2), (−0,1 | 0,9))
    expect(inv[0]![0]).toBeCloseTo(0.8 / 0.7, 12);
    expect(inv[0]![1]).toBeCloseTo(-0.2 / 0.7, 12);
  });
  it('Zu weit zurück: negative Anteile zeigen, dass es keinen sinnvollen Vorgänger gibt', () => {
    const back = stateAt(WEATHER, [1, 0], -1)!;
    expect(back[0]).toBeGreaterThan(1);
    expect(back[1]).toBeLessThan(0);
  });
  it('Reihe rückwärts und vorwärts passt zusammen', () => {
    const s = series(CUSTOMERS, [400, 350, 250], -2, 2);
    expect(s.map((e) => e.n)).toEqual([-2, -1, 0, 1, 2]);
    const fwd = mulMV(CUSTOMERS, s[0]!.x!);
    s[1]!.x!.forEach((v, i) => expect(fwd[i]).toBeCloseTo(v, 9));
  });
  it('Nicht invertierbare Matrix: kein Rückwärtsschritt', () => {
    const m: Mat = [
      [0.5, 0.5],
      [0.5, 0.5],
    ];
    expect(inverse(m)).toBeNull();
    expect(stateAt(m, [1, 0], -1)).toBeNull();
    expect(rank(m)).toBe(1);
  });
});

describe('Modell: Übergangsmatrizen – Eingabe', () => {
  it('liest Zahlen mit Komma, Punkt, Bruch und Prozent', () => {
    expect(parseNumber('0,25')).toBe(0.25);
    expect(parseNumber('0.25')).toBe(0.25);
    expect(parseNumber('1/3')).toBeCloseTo(1 / 3, 12);
    expect(parseNumber('−0,5')).toBe(-0.5);
    expect(parseNumber('25 %')).toBe(0.25);
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('1/0')).toBeNull();
  });
  it('liest eine Matrix zeilenweise', () => {
    const r = parseMatrix('0,9 0,2; 0,1 0,8');
    expect(r.m).toEqual(WEATHER);
    expect(isStochastic(r.m!)).toBe(true);
    expect(colSums(r.m!)).toEqual([1, 1]);
  });
  it('meldet Fehler', () => {
    expect(parseMatrix('').error).toBe('empty');
    expect(parseMatrix('0,5 x; 1 0').error).toBe('number');
    expect(parseMatrix('1 0 0; 0 1').error).toBe('square');
    expect(parseMatrix('1').error).toBe('size');
    expect(parseVector('1; 2', 3).error).toBe('size');
    expect(parseVector('100; 0; 0', 3).x).toEqual([100, 0, 0]);
  });
  it('erkennt nicht-stochastische Matrizen', () => {
    expect(isStochastic([[0.9, 0.2], [0.2, 0.8]])).toBe(false);
    expect(isStochastic([[1.2, 0], [-0.2, 1]])).toBe(false);
  });
  it('Zufallsprüfung: stochastische Matrizen erhalten die Summe, Fixvektor ist Fixpunkt', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 200; k++) {
      const n = 2 + (k % 3);
      const cols = Array.from({ length: n }, () => {
        const c = Array.from({ length: n }, () => 0.05 + rnd());
        const s = c.reduce((a, b) => a + b, 0);
        return c.map((v) => v / s);
      });
      const m: Mat = Array.from({ length: n }, (_, i) => cols.map((c) => c[i]!));
      expect(isStochastic(m)).toBe(true);
      const f = fixedVector(m).unique!;
      const mf = mulMV(m, f);
      f.forEach((v, i) => expect(mf[i]).toBeCloseTo(v, 9));
      expect(total(f)).toBeCloseTo(1, 9);
      expect(classify(m).kind).toBe('regular');
    }
  });
});
