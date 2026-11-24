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

/** Eine Versuchsreihe mit Trefferwahrscheinlichkeit p: Treffer k und Verlauf der relativen Häufigkeit. */
export function simulateRun(p: number, n: number, random: () => number): { k: number; history: number[] } {
  let k = 0;
  const history: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (random() < p) k++;
    history.push(k / i);
  }
  return { k, history };
}

/** Wie viele relative Häufigkeiten liegen im 95-%-Trichter um p? */
export function insideFunnel(values: readonly number[], p: number, n: number): number {
  const w = funnelHalfWidth(p, n);
  return values.filter((h) => Math.abs(h - p) <= w).length;
}

// ───────────────────────── Üben ─────────────────────────

export interface LawTask {
  /** erwartete absolute Häufigkeit n · p oder Wahrscheinlichkeit aus einer Versuchsreihe schätzen */
  kind: 'expected' | 'estimate';
  exp: ExperimentId;
  /** beobachtete Augenzahl (nur Würfel) */
  face: number;
  n: number;
  p: number;
  /** beobachtete Treffer (nur „estimate“) */
  k: number;
  answer: number;
  /** Verlauf der relativen Häufigkeit (nur „estimate“) */
  history?: number[];
}

const N_EXPECTED = [60, 120, 300, 600, 1200, 3000] as const;
const N_ESTIMATE = [200, 500, 1000, 2000] as const;
const P_TACK = [0.55, 0.6, 0.65, 0.7, 0.75] as const;

/**
 * Reproduzierbare Aufgabe Nr. q: ungerade Nummern fragen die erwartete Anzahl
 * (Münze oder Würfel), gerade die Schätzung der Wahrscheinlichkeit beim
 * Reißnagel aus einer simulierten Versuchsreihe.
 */
export function lawTask(q: number, rand: () => number): LawTask {
  if (q % 2 === 1) {
    const exp: ExperimentId = rand() < 0.5 ? 'coin' : 'die';
    const n = N_EXPECTED[Math.floor(rand() * N_EXPECTED.length)]!;
    const face = 1 + Math.floor(rand() * 6);
    const p = exp === 'coin' ? 0.5 : 1 / 6;
    return { kind: 'expected', exp, face, n, p, k: 0, answer: n * p };
  }
  const n = N_ESTIMATE[Math.floor(rand() * N_ESTIMATE.length)]!;
  const p = P_TACK[Math.floor(rand() * P_TACK.length)]!;
  const run = simulateRun(p, n, rand);
  return { kind: 'estimate', exp: 'tack', face: 1, n, p, k: run.k, answer: run.k / n, history: run.history };
}

/** Erste Zahl in der Eingabe; mit „%“ oder größer als 1 als Prozent gelesen (bei „estimate“). */
export function parseLawAnswer(task: LawTask, text: string): number | null {
  const m = text.replace(/\s/g, '').match(/\d+(?:[.,]\d+)?/);
  if (!m) return null;
  const v = Number(m[0].replace(',', '.'));
  if (task.kind === 'estimate' && (text.includes('%') || v > 1)) return v / 100;
  return v;
}

/** Erwartung: genau (± 0,5); Schätzung: höchstens 0,005 neben k/n. */
export function checkLaw(task: LawTask, text: string): { ok: boolean; got: number | null } {
  const got = parseLawAnswer(task, text);
  if (got === null) return { ok: false, got };
  const tol = task.kind === 'expected' ? 0.5 : 0.0051;
  return { ok: Math.abs(got - task.answer) <= tol, got };
}
