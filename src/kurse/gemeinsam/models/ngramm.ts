import type { Lang } from '../../../i18n/config';

/**
 * n-Gramm-Sprachmodell: zählt, welches Wort auf die letzten n−1 Wörter folgt,
 * und wählt das nächste Wort zufällig nach diesen Häufigkeiten. Mit der
 * Temperatur T wird die Verteilung schärfer (T < 1) oder flacher (T > 1):
 * p ∝ Anzahl^(1/T). T → 0 heißt: immer das häufigste Wort.
 * Satzanfang „^“, Satzende „.“.
 */
export const START = '^';
export const END = '.';

export function tokenize(sentence: string): string[] {
  return sentence
    .replace(/([.,!?])/g, ' $1 ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w === '!' || w === '?' ? END : w))
    .filter((w) => w !== ',');
}

export interface NGram {
  n: number;
  counts: Map<string, Map<string, number>>;
  sentences: string[][];
}

export function train(corpus: readonly string[], n: number): NGram {
  const counts = new Map<string, Map<string, number>>();
  const sentences = corpus.map((s) => tokenize(s));
  for (const words of sentences) {
    const seq = [...Array(n - 1).fill(START), ...words.filter((w) => w !== END), END];
    for (let i = n - 1; i < seq.length; i++) {
      const ctx = seq.slice(i - n + 1, i).join(' ');
      const next = seq[i]!;
      const m = counts.get(ctx) ?? new Map<string, number>();
      m.set(next, (m.get(next) ?? 0) + 1);
      counts.set(ctx, m);
    }
  }
  return { n, counts, sentences };
}

export interface Candidate {
  word: string;
  count: number;
  p: number;
}

/** Verteilung für das nächste Wort nach dem Kontext (letzte n−1 Wörter). */
export function nextDistribution(model: NGram, history: readonly string[], temperature: number): Candidate[] {
  const padded = [...Array(model.n - 1).fill(START), ...history];
  const ctx = padded.slice(padded.length - (model.n - 1)).join(' ');
  const m = model.counts.get(ctx);
  if (!m) return [{ word: END, count: 1, p: 1 }];
  const entries = [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (temperature <= 0.05) {
    return entries.map(([word, count], i) => ({ word, count, p: i === 0 ? 1 : 0 }));
  }
  const weights = entries.map(([, c]) => Math.pow(c, 1 / temperature));
  const total = weights.reduce((a, b) => a + b, 0);
  return entries.map(([word, count], i) => ({ word, count, p: weights[i]! / total }));
}

export function sample(dist: readonly Candidate[], random: () => number): string {
  let r = random();
  for (const c of dist) {
    r -= c.p;
    if (r <= 0) return c.word;
  }
  return dist.at(-1)!.word;
}

/** Ganzen Satz erzeugen (höchstens `max` Wörter). */
export function generate(model: NGram, temperature: number, random: () => number, max = 18): string[] {
  const out: string[] = [];
  while (out.length < max) {
    const w = sample(nextDistribution(model, out, temperature), random);
    if (w === END) break;
    out.push(w);
  }
  return out;
}

/** Kommt der Satz wörtlich in den Trainingsdaten vor? */
export function isCopied(model: NGram, words: readonly string[]): boolean {
  const s = words.join(' ');
  return model.sentences.some((t) => t.filter((w) => w !== END).join(' ') === s);
}

export const CORPUS: Record<Lang, string[]> = {
  de: [
    'Der Mond kreist um die Erde.',
    'Die Erde kreist um die Sonne.',
    'Die Sonne ist ein Stern.',
    'Der Mond ist kleiner als die Erde.',
    'Die Erde ist ein Planet.',
    'Der Mars ist ein Planet.',
    'Der Mars ist kleiner als die Erde.',
    'Die Sonne ist größer als die Erde.',
    'Ein Stern ist eine Kugel aus Gas.',
    'Ada ist ein Programm.',
    'Ein Programm rechnet mit Zahlen.',
    'Ada rechnet mit Zahlen und Wahrscheinlichkeiten.',
    'Die Katze schläft auf dem Sofa.',
    'Der Hund schläft im Garten.',
    'Die Katze jagt eine Maus.',
    'Der Hund jagt die Katze.',
    'Ein Roboter rechnet sehr schnell.',
    'Der Roboter kreist um den Tisch.',
  ],
  en: [
    'The moon orbits the earth.',
    'The earth orbits the sun.',
    'The sun is a star.',
    'The moon is smaller than the earth.',
    'The earth is a planet.',
    'Mars is a planet.',
    'Mars is smaller than the earth.',
    'The sun is bigger than the earth.',
    'A star is a ball of gas.',
    'Ada is a program.',
    'A program calculates with numbers.',
    'Ada calculates with numbers and probabilities.',
    'The cat sleeps on the sofa.',
    'The dog sleeps in the garden.',
    'The cat chases a mouse.',
    'The dog chases the cat.',
    'A robot calculates very fast.',
    'The robot orbits the table.',
  ],
};
