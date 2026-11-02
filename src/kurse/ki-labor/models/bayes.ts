/**
 * Lektion „Der Spamfilter“: naiver Bayes-Klassifikator.
 * P(Spam | Wörter) ∝ P(Spam) · Π P(Wort | Spam); Wörter gelten als
 * unabhängig („naiv“). Zählungen mit Laplace-Glättung (+1), damit ein
 * nie gesehenes Wort nicht alles auf 0 setzt. Die Trainingsmails sind erfunden.
 */
export interface Mail {
  words: string[];
  spam: boolean;
}

/** Wörter, die der Filter kennt (Merkmale: kommt vor / kommt nicht vor). */
export const VOCAB = ['gratis', 'gewinn', 'klick', 'angebot', 'jetzt', 'morgen', 'hausaufgaben', 'treffen', 'mama', 'foto'] as const;
export type Word = (typeof VOCAB)[number];

/** Anzeige der Wörter in beiden Sprachen. */
export const WORD_NAMES: Record<Word, { de: string; en: string }> = {
  gratis: { de: 'gratis', en: 'free' },
  gewinn: { de: 'Gewinn', en: 'prize' },
  klick: { de: 'klick', en: 'click' },
  angebot: { de: 'Angebot', en: 'offer' },
  jetzt: { de: 'jetzt', en: 'now' },
  morgen: { de: 'morgen', en: 'tomorrow' },
  hausaufgaben: { de: 'Hausaufgaben', en: 'homework' },
  treffen: { de: 'treffen', en: 'meet' },
  mama: { de: 'Mama', en: 'mum' },
  foto: { de: 'Foto', en: 'photo' },
};

export const TRAIN: Mail[] = [
  { spam: true, words: ['gratis', 'gewinn', 'klick', 'jetzt'] },
  { spam: true, words: ['angebot', 'gratis', 'klick'] },
  { spam: true, words: ['gewinn', 'jetzt', 'klick'] },
  { spam: true, words: ['angebot', 'jetzt', 'foto'] },
  { spam: true, words: ['gratis', 'angebot', 'gewinn'] },
  { spam: false, words: ['hausaufgaben', 'morgen'] },
  { spam: false, words: ['treffen', 'morgen', 'jetzt'] },
  { spam: false, words: ['mama', 'foto', 'treffen'] },
  { spam: false, words: ['hausaufgaben', 'treffen'] },
  { spam: false, words: ['mama', 'morgen', 'foto'] },
  { spam: false, words: ['gratis', 'treffen', 'morgen'] },
  { spam: false, words: ['foto', 'hausaufgaben'] },
];

export interface WordStats {
  word: Word;
  inSpam: number;
  inHam: number;
  /** P(Wort kommt vor | Spam) bzw. | kein Spam, geglättet. */
  pSpam: number;
  pHam: number;
}

export function wordStats(train: readonly Mail[] = TRAIN): WordStats[] {
  const spam = train.filter((m) => m.spam);
  const ham = train.filter((m) => !m.spam);
  return VOCAB.map((word) => {
    const inSpam = spam.filter((m) => m.words.includes(word)).length;
    const inHam = ham.filter((m) => m.words.includes(word)).length;
    return { word, inSpam, inHam, pSpam: (inSpam + 1) / (spam.length + 2), pHam: (inHam + 1) / (ham.length + 2) };
  });
}

/** Anteil Spam in den Trainingsdaten (A-priori-Wahrscheinlichkeit). */
export function priorSpam(train: readonly Mail[] = TRAIN): number {
  return train.filter((m) => m.spam).length / train.length;
}

export interface Posterior {
  /** P(Spam | Mail) */
  p: number;
  /** Faktoren je Wort: Likelihood-Verhältnis P(w|S)/P(w|H). */
  factors: { word: Word; ratio: number }[];
}

/**
 * Spam-Wahrscheinlichkeit einer Mail, die genau die Wörter in `present`
 * enthält (nur die vorhandenen Wörter zählen – wie bei vielen echten Filtern).
 */
export function posterior(present: readonly Word[], prior = priorSpam(), stats = wordStats()): Posterior {
  let logOdds = Math.log(prior / (1 - prior));
  const factors: Posterior['factors'] = [];
  for (const w of present) {
    const st = stats.find((s) => s.word === w)!;
    const ratio = st.pSpam / st.pHam;
    logOdds += Math.log(ratio);
    factors.push({ word: w, ratio });
  }
  return { p: 1 / (1 + Math.exp(-logOdds)), factors };
}
