import type { Lang } from '../../../i18n/config';

/**
 * Lektion „Tokens“: Byte-Pair-Encoding. Jedes Wort beginnt als Folge von
 * Buchstaben. In jeder Runde wird das häufigste benachbarte Paar (gewichtet
 * mit der Worthäufigkeit) zu einem neuen Token verschmolzen.
 */
export const WORD_COUNTS: Record<Lang, [string, number][]> = {
  de: [
    ['lernen', 6],
    ['lernt', 4],
    ['gelernt', 3],
    ['spielen', 5],
    ['spielt', 4],
    ['gespielt', 3],
    ['rechnen', 3],
    ['rechnet', 2],
  ],
  en: [
    ['learning', 6],
    ['learned', 4],
    ['learns', 3],
    ['playing', 5],
    ['played', 4],
    ['plays', 3],
    ['counting', 3],
    ['counted', 2],
  ],
};

export type Seg = string[];

export function initial(lang: Lang): { seg: Seg; count: number }[] {
  return WORD_COUNTS[lang].map(([w, count]) => ({ seg: [...w], count }));
}

export function pairCounts(words: readonly { seg: Seg; count: number }[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const { seg, count } of words) for (let i = 0; i < seg.length - 1; i++) {
    const key = `${seg[i]}|${seg[i + 1]}`;
    m.set(key, (m.get(key) ?? 0) + count);
  }
  return m;
}

/** Häufigste Paare (bei Gleichstand alle). */
export function topPairs(words: readonly { seg: Seg; count: number }[]): { pair: [string, string]; count: number }[] {
  const m = pairCounts(words);
  return [...m.entries()].map(([k, count]) => ({ pair: k.split('|') as [string, string], count })).sort((a, b) => b.count - a.count || a.pair.join('').localeCompare(b.pair.join('')));
}

export function merge(words: readonly { seg: Seg; count: number }[], pair: readonly [string, string]): { seg: Seg; count: number }[] {
  return words.map(({ seg, count }) => {
    const out: Seg = [];
    for (let i = 0; i < seg.length; i++) {
      if (i < seg.length - 1 && seg[i] === pair[0] && seg[i + 1] === pair[1]) {
        out.push(pair[0] + pair[1]);
        i += 1;
      } else out.push(seg[i]!);
    }
    return { seg: out, count };
  });
}

/** Neues Wort mit den gelernten Verschmelzungen (in Lernreihenfolge) zerlegen. */
export function encode(word: string, merges: readonly [string, string][]): Seg {
  let seg: Seg = [...word];
  for (const m of merges) seg = merge([{ seg, count: 1 }], m)[0]!.seg;
  return seg;
}
