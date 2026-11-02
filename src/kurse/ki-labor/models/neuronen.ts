/**
 * Welt „Neuronale Netze“, Teil 1: Schwellenneuronen (McCulloch & Pitts 1943),
 * Rosenblatts Perzeptron-Lernregel (1958) und das XOR-Netz mit einer
 * verborgenen Schicht.
 */
export type Gate = 'und' | 'oder' | 'nand' | 'xor';

export const INPUTS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

export const TARGET: Record<Gate, number[]> = {
  und: [0, 0, 0, 1],
  oder: [0, 1, 1, 1],
  nand: [1, 1, 1, 0],
  xor: [0, 1, 1, 0],
};

/** Schwellenneuron: feuert (1), wenn w1·x1 + w2·x2 ≥ θ. */
export function fire(w1: number, w2: number, theta: number, x: readonly [number, number]): number {
  return w1 * x[0] + w2 * x[1] >= theta - 1e-9 ? 1 : 0;
}

export function matches(gate: Gate, w1: number, w2: number, theta: number): number {
  return INPUTS.filter((x, i) => fire(w1, w2, theta, x) === TARGET[gate][i]).length;
}

/** Werte, die die Regler annehmen können (−2 … 2 in Halbschritten). */
export const KNOB_VALUES = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

/** Beste erreichbare Trefferzahl über alle Reglerstellungen (für XOR: 3). */
export function bestPossible(gate: Gate): number {
  let best = 0;
  for (const a of KNOB_VALUES) for (const b of KNOB_VALUES) for (const t of KNOB_VALUES) best = Math.max(best, matches(gate, a, b, t));
  return best;
}

// ---------- Perzeptron ----------

export interface LabeledPoint {
  x: number;
  y: number;
  /** Klasse +1 oder −1. */
  c: 1 | -1;
}

/** Trennbare Daten: zwei Gruppen in [0, 10]². */
export const SEPARABLE: LabeledPoint[] = [
  { x: 1.5, y: 7.5, c: 1 }, { x: 2.5, y: 8.8, c: 1 }, { x: 3.2, y: 6.6, c: 1 }, { x: 1.0, y: 5.2, c: 1 },
  { x: 4.2, y: 8.0, c: 1 }, { x: 2.2, y: 4.2, c: 1 }, { x: 5.0, y: 9.2, c: 1 }, { x: 3.6, y: 5.6, c: 1 },
  { x: 6.5, y: 2.5, c: -1 }, { x: 8.0, y: 4.2, c: -1 }, { x: 7.2, y: 1.2, c: -1 }, { x: 9.0, y: 2.8, c: -1 },
  { x: 5.6, y: 3.8, c: -1 }, { x: 8.6, y: 6.2, c: -1 }, { x: 6.2, y: 5.0, c: -1 }, { x: 4.6, y: 1.8, c: -1 },
];

/** Nicht trennbar: ein Punkt liegt mitten in der anderen Gruppe. */
export const NOT_SEPARABLE: LabeledPoint[] = [...SEPARABLE, { x: 7.6, y: 3.0, c: 1 }];

export interface Perceptron {
  w1: number;
  w2: number;
  b: number;
}

export const START: Perceptron = { w1: 0.2, w2: -1, b: 4 };

export function predict(p: Perceptron, q: { x: number; y: number }): 1 | -1 {
  return p.w1 * q.x + p.w2 * q.y + p.b >= 0 ? 1 : -1;
}

export function errors(p: Perceptron, data: readonly LabeledPoint[]): number {
  return data.filter((q) => predict(p, q) !== q.c).length;
}

/** Lernregel für einen falsch eingeordneten Punkt: w ← w + η·c·x. */
export function update(p: Perceptron, q: LabeledPoint, eta: number): Perceptron {
  return { w1: p.w1 + eta * q.c * q.x, w2: p.w2 + eta * q.c * q.y, b: p.b + eta * q.c };
}

/** Erster falsch eingeordneter Punkt ab Index `from` (zyklisch), sonst −1. */
export function nextMistake(p: Perceptron, data: readonly LabeledPoint[], from = 0): number {
  for (let k = 0; k < data.length; k++) {
    const i = (from + k) % data.length;
    if (predict(p, data[i]!) !== data[i]!.c) return i;
  }
  return -1;
}

/** Eine Epoche: jeden Punkt einmal ansehen, bei Fehlern korrigieren. */
export function epoch(p: Perceptron, data: readonly LabeledPoint[], eta: number): { p: Perceptron; updates: number } {
  let q = p;
  let updates = 0;
  for (const pt of data) {
    if (predict(q, pt) !== pt.c) {
      q = update(q, pt, eta);
      updates += 1;
    }
  }
  return { p: q, updates };
}

// ---------- XOR mit verborgener Schicht ----------

/**
 * Zwei verborgene Neuronen schauen beide auf x1 + x2: h1 feuert ab t1, h2 ab
 * t2. Ausgabe: h1 UND NICHT h2 (feuert, wenn h1 − h2 ≥ 0,5).
 */
export function xorNet(t1: number, t2: number, x: readonly [number, number]): { h1: number; h2: number; out: number } {
  const s = x[0] + x[1];
  const h1 = s >= t1 - 1e-9 ? 1 : 0;
  const h2 = s >= t2 - 1e-9 ? 1 : 0;
  return { h1, h2, out: h1 - h2 >= 0.5 ? 1 : 0 };
}

export function xorMatches(t1: number, t2: number): number {
  return INPUTS.filter((x, i) => xorNet(t1, t2, x).out === TARGET.xor[i]).length;
}
