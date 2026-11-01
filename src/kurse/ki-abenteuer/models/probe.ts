import { seeded } from '../../engine/dom';
import type { Sample } from './knn';

/**
 * Lektion „Üben und Prüfen“: zwei Gruppen, die sich überlappen, dazu etwas
 * Rauschen. Übungsdaten (Training) und Prüfungsdaten (Test) stammen aus
 * derselben Quelle, sind aber verschiedene Punkte.
 */
export type Team = 'a' | 'b';

function cloud(n: number, label: Team, cx: number, cy: number, spread: number, random: () => number): Sample<Team>[] {
  const out: Sample<Team>[] = [];
  while (out.length < n) {
    // Box-Muller: normalverteilte Punkte
    const u = Math.max(1e-9, random());
    const v = random();
    const r = Math.sqrt(-2 * Math.log(u)) * spread;
    const x = cx + r * Math.cos(2 * Math.PI * v);
    const y = cy + r * Math.sin(2 * Math.PI * v);
    if (x < 0.3 || x > 9.7 || y < 0.3 || y > 9.7) continue;
    out.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, label });
  }
  return out;
}

function make(seed: number, n: number): Sample<Team>[] {
  const random = seeded(seed);
  return [...cloud(n, 'a', 3.8, 4.2, 1.7, random), ...cloud(n, 'b', 6.2, 5.8, 1.7, random)];
}

export const TRAIN = make(5, 20);
export const TEST = make(77, 30);

/** Wählbare Zahl an Nachbarn. */
export const K_VALUES = [1, 3, 5, 7, 9, 11, 15, 21, 31] as const;
