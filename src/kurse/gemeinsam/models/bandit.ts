/**
 * Erkunden oder ausnutzen: das Banditen-Problem (Robbins 1952).
 * Mehrere Möglichkeiten mit unbekannter Erfolgswahrscheinlichkeit; jede Wahl
 * liefert 1 (Erfolg) oder 0. Die ε-gierige Strategie wählt mit
 * Wahrscheinlichkeit ε zufällig, sonst die bisher beste.
 */
export function pull(p: number, random: () => number): 0 | 1 {
  return random() < p ? 1 : 0;
}

export interface ArmStats {
  pulls: number;
  wins: number;
}

export function estimate(s: ArmStats): number {
  return s.pulls ? s.wins / s.pulls : 0;
}

/** Index der Möglichkeit mit der besten Schätzung (unbekannte zuerst ausprobieren). */
export function greedyArm(stats: readonly ArmStats[], random: () => number): number {
  const untried = stats.map((s, i) => (s.pulls === 0 ? i : -1)).filter((i) => i >= 0);
  if (untried.length) return untried[Math.floor(random() * untried.length)]!;
  let best = 0;
  for (let i = 1; i < stats.length; i++) if (estimate(stats[i]!) > estimate(stats[best]!)) best = i;
  return best;
}

/** Eine Runde mit n Zügen nach ε-gierig; liefert Gesamtgewinn. */
export function runEpsilon(probs: readonly number[], n: number, eps: number, random: () => number): number {
  const stats: ArmStats[] = probs.map(() => ({ pulls: 0, wins: 0 }));
  let total = 0;
  for (let t = 0; t < n; t++) {
    const arm = random() < eps ? Math.floor(random() * probs.length) : greedyArm(stats, random);
    const r = pull(probs[arm]!, random);
    stats[arm]!.pulls += 1;
    stats[arm]!.wins += r;
    total += r;
  }
  return total;
}

/** Mittlerer Gewinn über viele Durchläufe. */
export function averageEpsilon(probs: readonly number[], n: number, eps: number, runs: number, random: () => number): number {
  let sum = 0;
  for (let k = 0; k < runs; k++) sum += runEpsilon(probs, n, eps, random);
  return sum / runs;
}

/** „Beim ersten Erfolg bleiben“: der Reihe nach probieren, nach dem ersten Erfolg nur noch dort. */
export function runSticky(probs: readonly number[], n: number, random: () => number): number {
  let arm = 0;
  let stuck = false;
  let total = 0;
  for (let t = 0; t < n; t++) {
    const r = pull(probs[arm]!, random);
    total += r;
    if (!stuck) {
      if (r) stuck = true;
      else arm = (arm + 1) % probs.length;
    }
  }
  return total;
}

export function averageSticky(probs: readonly number[], n: number, runs: number, random: () => number): number {
  let sum = 0;
  for (let k = 0; k < runs; k++) sum += runSticky(probs, n, random);
  return sum / runs;
}
