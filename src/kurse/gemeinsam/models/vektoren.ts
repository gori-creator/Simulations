import type { Localized } from '../../../i18n/config';

/**
 * Wortvektoren (Einbettungen), von Hand gebaut, damit man sie verstehen kann:
 * sechs Bedeutungsrichtungen [Person, Adel, weiblich, jung, Tier, Katze],
 * dazu ein kleines festes „Rauschen“, damit es aussieht wie gelernt.
 * Echte Modelle lernen Hunderte solcher Richtungen aus Texten – ohne Namen.
 */
export const DIMS: Localized[] = [
  { de: 'Person', en: 'person' },
  { de: 'Adel', en: 'royalty' },
  { de: 'weiblich', en: 'female' },
  { de: 'jung', en: 'young' },
  { de: 'Tier', en: 'animal' },
  { de: 'katzenartig', en: 'cat-like' },
];

export interface WordVec {
  id: string;
  name: Localized;
  icon: string;
  v: number[];
}

const base: [string, string, string, string, number[]][] = [
  ['mann', 'Mann', 'man', '👨', [1, 0, 0, 0, 0, 0]],
  ['frau', 'Frau', 'woman', '👩', [1, 0, 1, 0, 0, 0]],
  ['junge', 'Junge', 'boy', '👦', [1, 0, 0, 1, 0, 0]],
  ['maedchen', 'Mädchen', 'girl', '👧', [1, 0, 1, 1, 0, 0]],
  ['koenig', 'König', 'king', '🤴', [1, 1, 0, 0, 0, 0]],
  ['koenigin', 'Königin', 'queen', '👸', [1, 1, 1, 0, 0, 0]],
  ['prinz', 'Prinz', 'prince', '🫅', [1, 1, 0, 1, 0, 0]],
  ['prinzessin', 'Prinzessin', 'princess', '👑', [1, 1, 1, 1, 0, 0]],
  ['hund', 'Hund', 'dog', '🐕', [0, 0, 0, 0, 1, 0]],
  ['welpe', 'Welpe', 'puppy', '🐶', [0, 0, 0, 1, 1, 0]],
  ['katze', 'Katze', 'cat', '🐈', [0, 0, 0, 0, 1, 1]],
  ['kaetzchen', 'Kätzchen', 'kitten', '🐱', [0, 0, 0, 1, 1, 1]],
];

/** Kleines, festes Rauschen (wiederholbar). */
function jitter(i: number, d: number): number {
  const x = Math.sin(i * 12.9898 + d * 78.233) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 0.16;
}

export const WORDS: WordVec[] = base.map(([id, de, en, icon, v], i) => ({ id, name: { de, en }, icon, v: v.map((x, d) => x + jitter(i, d)) }));

export function vec(id: string): number[] {
  return WORDS.find((w) => w.id === id)!.v;
}

export const add = (a: readonly number[], b: readonly number[]) => a.map((x, i) => x + b[i]!);
export const sub = (a: readonly number[], b: readonly number[]) => a.map((x, i) => x - b[i]!);
export const dot = (a: readonly number[], b: readonly number[]) => a.reduce((s, x, i) => s + x * b[i]!, 0);
export const norm = (a: readonly number[]) => Math.sqrt(dot(a, a));

/** Kosinus-Ähnlichkeit: 1 = gleiche Richtung, 0 = rechtwinklig. */
export function cosine(a: readonly number[], b: readonly number[]): number {
  return dot(a, b) / (norm(a) * norm(b) || 1);
}

/** Nächste Wörter zu einem Vektor (ohne die ausgeschlossenen). */
export function nearest(v: readonly number[], exclude: readonly string[] = [], k = 3): { word: WordVec; sim: number }[] {
  return WORDS.filter((w) => !exclude.includes(w.id))
    .map((word) => ({ word, sim: cosine(v, word.v) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, k);
}

/** a − b + c → bestes Wort (ohne a, b, c). */
export function analogy(a: string, b: string, c: string): { word: WordVec; sim: number } {
  return nearest(add(sub(vec(a), vec(b)), vec(c)), [a, b, c], 1)[0]!;
}
