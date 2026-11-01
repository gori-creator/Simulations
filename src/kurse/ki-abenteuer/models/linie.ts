import type { Sample } from './knn';

/**
 * Lineare Trennung: Eine Gerade durch zwei Punkte teilt die Ebene in zwei
 * Seiten. Bit ordnet jeder Seite die Gruppe zu, die dort besser passt.
 */
export interface Pt {
  x: number;
  y: number;
}

/** Vorzeichen der Seite: > 0 links der Richtung p→q, < 0 rechts, 0 auf der Geraden. */
export function side(p: Pt, q: Pt, r: Pt): number {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

export interface Split<L extends string> {
  /** Gruppe links der Richtung p→q (die andere rechts). */
  left: L;
  right: L;
  correct: number;
  total: number;
}

/** Beste Zuordnung der zwei Seiten zu den Gruppen a und b. Punkte auf der Geraden zählen als falsch. */
export function bestSplit<L extends string>(p: Pt, q: Pt, samples: readonly Sample<L>[], a: L, b: L): Split<L> {
  let leftA = 0;
  let leftB = 0;
  for (const s of samples) {
    const v = side(p, q, s);
    if (v > 0 && s.label === a) leftA++;
    else if (v < 0 && s.label === b) leftB++;
  }
  let rightA = 0;
  let rightB = 0;
  for (const s of samples) {
    const v = side(p, q, s);
    if (v < 0 && s.label === a) rightA++;
    else if (v > 0 && s.label === b) rightB++;
  }
  const first = leftA + leftB; // links a, rechts b
  const second = rightA + rightB; // links b, rechts a
  return first >= second ? { left: a, right: b, correct: first, total: samples.length } : { left: b, right: a, correct: second, total: samples.length };
}
