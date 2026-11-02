/**
 * Lektion „Mein Feed“: Ein einfacher Empfehlungs-Algorithmus. Jedes Thema hat
 * ein Gewicht; wer etwas anschaut, erhöht das Gewicht dieses Themas. Der Feed
 * zeigt Themen nach Gewicht² – wer viel bekommt, bekommt noch mehr. So
 * entsteht schnell eine Filterblase. Ein Vielfalt-Regler mischt Zufall dazu.
 */
export const TOPICS = ['fussball', 'tiere', 'musik', 'gaming', 'natur', 'wissen'] as const;
export type Topic = (typeof TOPICS)[number];

export type Weights = Record<Topic, number>;

export function startWeights(): Weights {
  return { fussball: 1, tiere: 1, musik: 1, gaming: 1, natur: 1, wissen: 1 };
}

export function watch(w: Weights, t: Topic): Weights {
  return { ...w, [t]: w[t] + 1 };
}

/** Wahrscheinlichkeit je Thema für den nächsten Beitrag (Vielfalt 0…1). */
export function mix(w: Weights, variety: number): Record<Topic, number> {
  const pow = TOPICS.map((t) => w[t] ** 2);
  const sum = pow.reduce((a, b) => a + b, 0);
  return Object.fromEntries(TOPICS.map((t, i) => [t, (1 - variety) * (pow[i]! / sum) + variety / TOPICS.length])) as Record<Topic, number>;
}

/** Feed mit n Beiträgen ziehen. */
export function feed(w: Weights, variety: number, n: number, random: () => number): Topic[] {
  const m = mix(w, variety);
  return Array.from({ length: n }, () => {
    let r = random();
    for (const t of TOPICS) {
      r -= m[t];
      if (r <= 0) return t;
    }
    return TOPICS.at(-1)!;
  });
}

/** Anteil des häufigsten Themas im Mix. */
export function bubble(w: Weights, variety: number): number {
  return Math.max(...Object.values(mix(w, variety)));
}
