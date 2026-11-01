import type { Sample } from './knn';

/**
 * Lektion „Das Neuron lernt“: Perzeptron-Lernregel. Das Neuron sagt
 * „Orange“, wenn w1·x + w2·y + b > 0, sonst „Zitrone“. Bei jedem Fehler
 * werden die Gewichte ein Stück in Richtung des richtigen Ergebnisses gedreht.
 * Eingaben werden durch 10 geteilt (Skala 0…1).
 */
export interface Weights {
  w1: number;
  w2: number;
  b: number;
}

export const START: Weights = { w1: 0.6, w2: -0.4, b: -0.1 };
export const RATE = 0.1;

const target = (s: Sample) => (s.label === 'orange' ? 1 : -1);

export function predict(w: Weights, p: { x: number; y: number }): 1 | -1 {
  return w.w1 * (p.x / 10) + w.w2 * (p.y / 10) + w.b > 0 ? 1 : -1;
}

export function errors(w: Weights, data: readonly Sample[]): number {
  return data.filter((s) => predict(w, s) !== target(s)).length;
}

export interface StepResult {
  weights: Weights;
  /** Index des Punkts, aus dem gelernt wurde (−1: kein Fehler mehr). */
  index: number;
  /** Wo die nächste Suche beginnt. */
  next: number;
}

/** Einen Lernschritt: ab `from` den nächsten falsch eingeordneten Punkt suchen und daraus lernen. */
export function learnStep(w: Weights, data: readonly Sample[], from: number): StepResult {
  for (let k = 0; k < data.length; k++) {
    const i = (from + k) % data.length;
    const s = data[i]!;
    const t = target(s);
    if (predict(w, s) === t) continue;
    return {
      weights: { w1: w.w1 + RATE * t * (s.x / 10), w2: w.w2 + RATE * t * (s.y / 10), b: w.b + RATE * t },
      index: i,
      next: (i + 1) % data.length,
    };
  }
  return { weights: w, index: -1, next: from };
}

/** Zwei Punkte der Grenzgeraden (Welt 0…10) oder null, wenn es keine gibt. */
export function boundary(w: Weights): [{ x: number; y: number }, { x: number; y: number }] | null {
  // w1·x/10 + w2·y/10 + b = 0
  if (Math.abs(w.w2) > 1e-9) {
    const y = (x: number) => (-(w.b * 10) - w.w1 * x) / w.w2;
    return [{ x: -20, y: y(-20) }, { x: 30, y: y(30) }];
  }
  if (Math.abs(w.w1) > 1e-9) {
    const x = -(w.b * 10) / w.w1;
    return [{ x, y: -20 }, { x, y: 30 }];
  }
  return null;
}
