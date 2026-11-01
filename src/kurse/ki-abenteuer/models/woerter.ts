import type { Lang } from '../../../i18n/config';

/**
 * Lektion „Das nächste Wort“: ein winziges Sprachmodell. Bit zählt in ein
 * paar Sätzen, welches Wort auf welches folgt (Wortpaare), und schlägt das
 * nächste Wort nach diesen Häufigkeiten vor. Satzanfang = „^“, Satzende = „.“.
 */
export const CORPUS: Record<Lang, string[]> = {
  de: [
    'Bit ist ein Roboter.',
    'Bit ist sehr neugierig.',
    'Bit lernt jeden Tag etwas Neues.',
    'Bit wohnt in einem Labor.',
    'Bit mag Äpfel.',
    'Der Hund mag Knochen.',
    'Der Hund schläft im Garten.',
    'Die Katze schläft auf dem Sofa.',
    'Die Katze wohnt bei uns.',
    'Der Mond ist sehr weit weg.',
    'Die Astronautin fliegt zum Mond.',
  ],
  en: [
    'Bit is a robot.',
    'Bit is very curious.',
    'Bit learns something new every day.',
    'Bit lives in a lab.',
    'Bit likes apples.',
    'The dog likes bones.',
    'The dog sleeps in the garden.',
    'The cat sleeps on the sofa.',
    'The cat lives with us.',
    'The moon is very far away.',
    'The astronaut flies to the moon.',
  ],
};

export const START = '^';
export const END = '.';

export function tokenize(sentence: string): string[] {
  return [START, ...sentence.replace(/\./g, ' . ').split(/\s+/).filter(Boolean)];
}

export type Model = Map<string, Map<string, number>>;

/** Zählt Wortpaare. */
export function train(sentences: readonly string[]): Model {
  const model: Model = new Map();
  for (const s of sentences) {
    const t = tokenize(s);
    for (let i = 0; i < t.length - 1; i++) {
      const next = model.get(t[i]!) ?? new Map<string, number>();
      next.set(t[i + 1]!, (next.get(t[i + 1]!) ?? 0) + 1);
      model.set(t[i]!, next);
    }
  }
  return model;
}

export interface Candidate {
  word: string;
  p: number;
}

/** Nächste Wörter mit Wahrscheinlichkeit, häufigste zuerst (bei Gleichstand alphabetisch). */
export function candidates(model: Model, word: string): Candidate[] {
  const next = model.get(word);
  if (!next) return [];
  const total = [...next.values()].reduce((a, b) => a + b, 0);
  return [...next.entries()].map(([w, n]) => ({ word: w, p: n / total })).sort((a, b) => b.p - a.p || a.word.localeCompare(b.word));
}

/** Ein Wort nach den Wahrscheinlichkeiten ziehen (r zwischen 0 und 1). */
export function sample(list: readonly Candidate[], r: number): string {
  let acc = 0;
  for (const c of list) {
    acc += c.p;
    if (r < acc) return c.word;
  }
  return list[list.length - 1]!.word;
}

/** Satz bauen: höchstens maxWords Wörter, endet mit „.“. */
export function generate(model: Model, random: () => number, maxWords = 12): string[] {
  const out: string[] = [];
  let word = START;
  while (out.length < maxWords) {
    const list = candidates(model, word);
    if (list.length === 0) break;
    word = sample(list, random());
    out.push(word);
    if (word === END) break;
  }
  return out;
}

/** Text aus Wörtern („Bit ist ein Roboter.“). */
export function join(words: readonly string[]): string {
  return words.join(' ').replace(/ \./g, '.');
}

/** Steht der Satz genau so im Text? */
export function inCorpus(sentence: string, lang: Lang): boolean {
  return CORPUS[lang].includes(sentence);
}
