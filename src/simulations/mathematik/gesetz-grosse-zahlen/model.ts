/** Rechenlogik „Gesetz der großen Zahlen“. */
export type ExperimentId = 'coin' | 'die' | 'tack';

/** Wahrscheinlichkeiten der Ergebnisse eines Experiments. */
export function probabilities(experiment: ExperimentId, pTack: number): number[] {
  switch (experiment) {
    case 'coin':
      return [0.5, 0.5];
    case 'die':
      return [1, 1, 1, 1, 1, 1].map((x) => x / 6);
    case 'tack':
      return [pTack, 1 - pTack];
  }
}

/** Ein Ergebnis gemäß den Wahrscheinlichkeiten ziehen (Index). */
export function drawOutcome(probs: readonly number[], random: () => number): number {
  let u = random();
  for (let i = 0; i < probs.length; i++) {
    u -= probs[i]!;
    if (u < 0) return i;
  }
  return probs.length - 1;
}

/** Ungefähr 95 % der relativen Häufigkeiten liegen nach n Versuchen in p ± 1,96·√(p(1−p)/n). */
export function funnelHalfWidth(p: number, n: number): number {
  return n > 0 ? 1.96 * Math.sqrt((p * (1 - p)) / n) : 1;
}
