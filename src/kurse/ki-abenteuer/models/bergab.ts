/**
 * Lektion „Bergab lernen“: Gradientenabstieg auf einer Fehlerkurve
 * f(w) = a/2 · (w − 3)² + 0,5. Bit spürt nur die Steigung f'(w) = a · (w − 3)
 * und geht w ← w − Schrittweite · f'(w).
 */
export const VALLEY = 3;
export const START_W = -4;
export const MAX_STEPS = 10;
/** Im Tal, wenn |w − 3| darunter liegt. */
export const GOAL = 0.2;

export interface Terrain {
  /** Steilheit a */
  a: number;
}

export const ROUNDS: Terrain[] = [{ a: 1 }, { a: 3 }];

/** Wählbare Schrittweiten (Lernraten). */
export const RATES = [0.05, 0.3, 0.6, 1.2] as const;

export const height = (t: Terrain, w: number) => (t.a / 2) * (w - VALLEY) ** 2 + 0.5;
export const slope = (t: Terrain, w: number) => t.a * (w - VALLEY);
export const step = (t: Terrain, w: number, rate: number) => w - rate * slope(t, w);

export const inValley = (w: number) => Math.abs(w - VALLEY) < GOAL;
/** Aus dem Bild gefallen (Schritte werden immer größer). */
export const lost = (w: number) => w < -8 || w > 14;

/** Schritte bis ins Tal mit dieser Schrittweite (Infinity, wenn nicht in maxSteps). */
export function stepsToValley(t: Terrain, rate: number, maxSteps = 100): number {
  let w = START_W;
  for (let n = 1; n <= maxSteps; n++) {
    w = step(t, w, rate);
    if (lost(w)) return Infinity;
    if (inValley(w)) return n;
  }
  return Infinity;
}
