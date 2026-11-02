import { seeded } from '../../engine/dom';

/**
 * Lektion „Fairness messen“: Ein Programm vergibt Punktzahlen (0…100), ab
 * einer Schwelle wird ein Antrag angenommen. Zwei Gruppen mit
 * unterschiedlicher Grundrate (Anteil, der den Kredit tatsächlich
 * zurückzahlt). Die Punktzahl ist in beiden Gruppen gleich gut kalibriert.
 * Kennzahlen je Gruppe: Annahmequote, Trefferquote (TPR), Fehlalarmquote (FPR).
 */
export interface Person {
  score: number;
  /** Zahlt tatsächlich zurück. */
  good: boolean;
}

function group(n: number, baseRate: number, seed: number): Person[] {
  const rnd = seeded(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-9, rnd()))) * Math.cos(2 * Math.PI * rnd());
  return Array.from({ length: n }, (_, i) => {
    const good = i < Math.round(n * baseRate);
    const score = Math.max(1, Math.min(99, (good ? 64 : 40) + 13 * gauss()));
    return { score: Math.round(score), good };
  });
}

export const GROUP_A: Person[] = group(100, 0.6, 31);
export const GROUP_B: Person[] = group(100, 0.35, 47);

export interface Rates {
  /** Anteil angenommen. */
  accept: number;
  /** Anteil der Zuverlässigen, die angenommen werden. */
  tpr: number;
  /** Anteil der Unzuverlässigen, die trotzdem angenommen werden. */
  fpr: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export function rates(people: readonly Person[], threshold: number): Rates {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (const p of people) {
    const yes = p.score >= threshold;
    if (yes && p.good) tp++;
    else if (yes) fp++;
    else if (p.good) fn++;
    else tn++;
  }
  const pos = tp + fn;
  const neg = fp + tn;
  return { accept: (tp + fp) / people.length, tpr: pos ? tp / pos : 0, fpr: neg ? fp / neg : 0, tp, fp, fn, tn };
}

export const close = (a: number, b: number, tol = 0.03) => Math.abs(a - b) <= tol;

/** Gleiche Annahmequoten (±3 Punkte) bei sinnvollen Schwellen (30–70 % angenommen). */
export function parityOk(a: Rates, b: Rates): boolean {
  const sensible = (r: Rates) => r.accept >= 0.3 && r.accept <= 0.7;
  return close(a.accept, b.accept) && sensible(a) && sensible(b);
}

/** Gleiche Trefferquoten (±3 Punkte) bei sinnvollen Schwellen (50–95 % der Zuverlässigen angenommen). */
export function opportunityOk(a: Rates, b: Rates): boolean {
  const sensible = (r: Rates) => r.tpr >= 0.5 && r.tpr <= 0.95;
  return close(a.tpr, b.tpr) && sensible(a) && sensible(b);
}
