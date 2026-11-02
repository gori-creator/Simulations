import { seeded } from '../../engine/dom';

/**
 * Lektion „Überanpassung“: Polynome vom Grad 0 bis 9 per kleinster Quadrate
 * an 10 verrauschte Trainingspunkte anpassen und an 40 Testpunkten prüfen.
 * Gerechnet wird mit x auf [−1, 1] skaliert (stabilere Normalgleichungen).
 */
export interface Pt {
  x: number;
  y: number;
}

export const X_RANGE: [number, number] = [0, 10];

/** Die „wahre“ Kurve hinter den Daten (unbekannt für das Modell). */
export function truth(x: number): number {
  return 2 + 0.9 * x - 0.07 * x * x + 1.2 * Math.sin(x / 1.6);
}

function sample(n: number, seed: number, noise: number): Pt[] {
  const rnd = seeded(seed);
  const gauss = () => {
    const u = Math.max(1e-9, rnd());
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return Array.from({ length: n }, (_, i) => {
    const x = X_RANGE[0] + ((i + 0.3 + 0.4 * rnd()) / n) * (X_RANGE[1] - X_RANGE[0]);
    return { x, y: truth(x) + noise * gauss() };
  });
}

export const TRAIN: Pt[] = sample(10, 11, 0.6);
export const TRAIN_BIG: Pt[] = sample(40, 23, 0.6);
export const TEST: Pt[] = sample(40, 97, 0.6);

const scale = (x: number) => (2 * (x - X_RANGE[0])) / (X_RANGE[1] - X_RANGE[0]) - 1;

/** Lineares Gleichungssystem lösen (Gauß mit Spaltenpivot). */
export function solve(A: number[][], y: number[]): number[] {
  const n = y.length;
  const M = A.map((row, i) => [...row, y[i]!]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r]![c]!) > Math.abs(M[p]![c]!)) p = r;
    [M[c], M[p]] = [M[p]!, M[c]!];
    const piv = M[c]![c]!;
    if (Math.abs(piv) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r]![c]! / piv;
      for (let k = c; k <= n; k++) M[r]![k]! -= f * M[c]![k]!;
    }
  }
  return M.map((row, i) => (Math.abs(row[i]!) < 1e-12 ? 0 : row[n]! / row[i]!));
}

export interface Poly {
  degree: number;
  coef: number[];
  at(x: number): number;
}

/** Polynom vom Grad d durch die Punkte (kleinste Quadrate, optional mit Strafterm λ). */
export function polyfit(points: readonly Pt[], degree: number, lambda = 0): Poly {
  const d = degree + 1;
  const A = Array.from({ length: d }, () => Array<number>(d).fill(0));
  const v = Array<number>(d).fill(0);
  for (const p of points) {
    const t = scale(p.x);
    const pw = Array.from({ length: d }, (_, k) => t ** k);
    for (let i = 0; i < d; i++) {
      v[i]! += pw[i]! * p.y;
      for (let j = 0; j < d; j++) A[i]![j]! += pw[i]! * pw[j]!;
    }
  }
  for (let i = 1; i < d; i++) A[i]![i]! += lambda;
  const coef = solve(A, v);
  return { degree, coef, at: (x) => coef.reduce((s, c, k) => s + c * scale(x) ** k, 0) };
}

export function mseOf(poly: Poly, points: readonly Pt[]): number {
  return points.reduce((s, p) => s + (p.y - poly.at(p.x)) ** 2, 0) / points.length;
}

export interface DegreeRow {
  degree: number;
  train: number;
  test: number;
}

/** Trainings- und Testfehler für alle Grade 0…max. */
export function errorCurve(train: readonly Pt[], max = 9): DegreeRow[] {
  return Array.from({ length: max + 1 }, (_, degree) => {
    const p = polyfit(train, degree);
    return { degree, train: mseOf(p, train), test: mseOf(p, TEST) };
  });
}

/** Grad mit dem kleinsten Testfehler. */
export function bestDegree(train: readonly Pt[] = TRAIN): number {
  const rows = errorCurve(train);
  return rows.reduce((a, b) => (b.test < a.test ? b : a)).degree;
}
