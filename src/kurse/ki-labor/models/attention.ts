import type { Lang } from '../../../i18n/config';

/**
 * Lektion „Aufmerksamkeit“: Selbstaufmerksamkeit an einem Winograd-Satz.
 * Jedes Token hat eine Anfrage q und einen Schlüssel k (hier 2-dimensional,
 * von Hand gewählt). Gewicht von i auf j: softmax_j(q_i · k_j / √d).
 * Vereinfachung: „er“ hat aus einer früheren Schicht schon Information über
 * das Adjektiv (groß/klein) aufgenommen – darum hängt seine Anfrage davon ab.
 * Richtung 1 der Schlüssel: „passt hinein“ (Inhalt), Richtung 2: „nimmt auf“ (Behälter).
 */
export type Adj = 'gross' | 'klein';

interface Tok {
  text: Record<Lang, string>;
  k: [number, number];
  q: [number, number];
}

const T = (de: string, en: string, k: [number, number], q: [number, number] = [0.2, 0.2]): Tok => ({ text: { de, en }, k, q });

export function sentence(adj: Adj): Tok[] {
  const big = adj === 'gross';
  return [
    T('Der', 'The', [0.1, 0.1]),
    T('Ball', 'ball', [2.2, 0.2], [0.3, 1.2]),
    T('passte', 'didn’t', [0.3, 0.3], [1.0, 1.0]),
    T('nicht', 'fit', [0.2, 0.2], [0.6, 0.6]),
    T('in', 'into', [0.2, 0.4], [0.2, 1.0]),
    T('den', 'the', [0.1, 0.1]),
    T('Koffer', 'suitcase', [0.2, 2.2], [1.2, 0.3]),
    T('weil', 'because', [0.2, 0.2]),
    T('er', 'it', [0.1, 0.1], big ? [2.0, 0.2] : [0.2, 2.0]),
    T('zu', 'was', [0.2, 0.2]),
    T(big ? 'groß' : 'klein', big ? 'too big' : 'too small', [0.6, 0.6], [0.8, 0.8]),
    T('war', '.', [0.1, 0.1]),
  ];
}

export const PRONOUN = 8;

export function softmax(xs: readonly number[]): number[] {
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp(x - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / s);
}

export function scores(toks: readonly Tok[], i: number, scale = Math.SQRT2): number[] {
  const q = toks[i]!.q;
  return toks.map((t) => (q[0] * t.k[0] + q[1] * t.k[1]) / scale);
}

/** Aufmerksamkeitsgewichte von Token i auf alle Tokens. */
export function weights(toks: readonly Tok[], i: number, scale = Math.SQRT2): number[] {
  return softmax(scores(toks, i, scale));
}

/** Matrix aller Gewichte (Zeile = fragendes Token). */
export function matrix(toks: readonly Tok[], scale = Math.SQRT2): number[][] {
  return toks.map((_, i) => weights(toks, i, scale));
}
