import { seeded } from '../../engine/dom';
import type { Sample } from './knn';

/**
 * Daten für Bereich 2: Zitronen (A) und Orangen (B) mit x = Größe, y = Süße,
 * beides auf einer Skala von 0 bis 10. Zitronen liegen unterhalb der Geraden
 * x + y = 9,4, Orangen oberhalb von x + y = 10,6 – eine Linie kann sie trennen.
 */
export type Citrus = 'lemon' | 'orange';

function cloud(count: number, label: Citrus, seed: number, accept: (x: number, y: number) => boolean, box: [number, number, number, number]): Sample<Citrus>[] {
  const random = seeded(seed);
  const out: Sample<Citrus>[] = [];
  while (out.length < count) {
    const x = box[0] + random() * (box[1] - box[0]);
    const y = box[2] + random() * (box[3] - box[2]);
    if (!accept(x, y)) continue;
    // Mindestabstand, damit sich Punkte nicht verdecken
    if (out.some((p) => Math.hypot(p.x - x, p.y - y) < 0.75)) continue;
    out.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, label });
  }
  return out;
}

/** 24 Früchte, linear trennbar. */
export const CITRUS: Sample<Citrus>[] = [
  ...cloud(12, 'lemon', 7, (x, y) => x + y < 9.4, [1, 7.5, 0.8, 6.5]),
  ...cloud(12, 'orange', 11, (x, y) => x + y > 10.6, [3.5, 9.3, 3.5, 9.3]),
];

/**
 * Für „Falsche Daten“: dieselben Früchte, aber drei sind falsch beschriftet
 * (Index in CITRUS). Bit lernt mit dem nächsten Nachbarn.
 */
export const MISLABELED = [4, 9, 13] as const;

export function withMistakes(): Sample<Citrus>[] {
  return CITRUS.map((s, i) => ((MISLABELED as readonly number[]).includes(i) ? { ...s, label: s.label === 'lemon' ? 'orange' : 'lemon' } : { ...s }));
}

/** Neue Früchte für Bits Probe (gleiche Regel). */
export const CITRUS_TEST: Sample<Citrus>[] = [
  ...cloud(10, 'lemon', 23, (x, y) => x + y < 8.8, [1, 7.5, 0.8, 6.5]),
  ...cloud(10, 'orange', 29, (x, y) => x + y > 11.2, [3.5, 9.3, 3.5, 9.3]),
];
