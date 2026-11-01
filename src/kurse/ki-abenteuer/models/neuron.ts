/**
 * Lektion „Ein Neuron“: Ein künstliches Neuron rechnet
 * Summe = w1·x1 + w2·x2 + w3·x3 und „feuert“, wenn die Summe die Schwelle erreicht.
 * Bit will ins Kino, je nachdem, ob Freunde mitkommen, der Film lustig ist
 * und ob noch Hausaufgaben offen sind.
 */
export interface Situation {
  x: [number, number, number];
  /** Bits Entscheidung (Ziel). */
  go: boolean;
}

export const SITUATIONS: Situation[] = [
  { x: [1, 1, 0], go: true },
  { x: [1, 0, 0], go: true },
  { x: [0, 1, 0], go: true },
  { x: [0, 0, 0], go: false },
  { x: [1, 1, 1], go: false },
  { x: [1, 0, 1], go: false },
];

export const WEIGHT_RANGE = [-3, 3] as const;
export const THRESHOLD_RANGE = [0, 5] as const;

export function weightedSum(w: readonly number[], x: readonly number[]): number {
  return w.reduce((sum, wi, i) => sum + wi * (x[i] ?? 0), 0);
}

export function fires(w: readonly number[], threshold: number, x: readonly number[]): boolean {
  return weightedSum(w, x) >= threshold;
}

/** Wie viele Situationen das Neuron so entscheidet wie Bit. */
export function matches(w: readonly number[], threshold: number, items: readonly Situation[] = SITUATIONS): number {
  return items.filter((s) => fires(w, threshold, s.x) === s.go).length;
}
