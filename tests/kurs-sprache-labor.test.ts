import { describe, expect, it } from 'vitest';
import { seeded } from '../src/kurse/engine/dom';
import { CORPUS, END, generate, isCopied, nextDistribution, train } from '../src/kurse/gemeinsam/models/ngramm';
import { analogy, cosine, nearest, vec } from '../src/kurse/gemeinsam/models/vektoren';
import { PRONOUN, sentence, softmax, weights } from '../src/kurse/ki-labor/models/attention';
import { CHECKS, fitReward, lengthLover, PAIRS, reward } from '../src/kurse/ki-labor/models/belohnung';
import { encode, initial, merge, topPairs } from '../src/kurse/ki-labor/models/bpe';

/** KI-Labor, Welt „Maschinen sprechen“ (und gemeinsame Sprachmodelle). */
describe('Byte-Pair-Encoding', () => {
  it('verschmilzt das häufigste Paar und verkürzt den Text', () => {
    for (const lang of ['de', 'en'] as const) {
      let w = initial(lang);
      const len = () => w.reduce((s, x) => s + x.seg.length * x.count, 0);
      const before = len();
      const merges: [string, string][] = [];
      for (let k = 0; k < 6; k++) {
        const top = topPairs(w)[0]!;
        merges.push(top.pair);
        w = merge(w, top.pair);
      }
      expect(len()).toBeLessThan(before * 0.75);
      // Kodieren mit den Verschmelzungen ergibt dieselbe Zerlegung
      expect(encode(lang === 'de' ? 'lernen' : 'learning', merges)).toEqual(w[0]!.seg);
    }
  });
});

describe('Wortvektoren', () => {
  it('Analogien und Ähnlichkeit', () => {
    expect(analogy('koenig', 'mann', 'frau').word.id).toBe('koenigin');
    expect(analogy('prinz', 'junge', 'maedchen').word.id).toBe('prinzessin');
    expect(analogy('welpe', 'hund', 'katze').word.id).toBe('kaetzchen');
    expect(analogy('koenig', 'mann', 'junge').word.id).toBe('prinz');
    expect(cosine([1, 0], [1, 1])).toBeCloseTo(Math.SQRT1_2);
    expect(nearest(vec('hund'), ['hund'], 1)[0]!.word.id).toBe('welpe');
  });
});

describe('n-Gramm-Sprachmodell', () => {
  it('Wahrscheinlichkeiten summieren sich zu 1, T = 0 ist deterministisch', () => {
    const m = train(CORPUS.de, 2);
    for (const t of [0, 0.5, 1, 2.5]) {
      const d = nextDistribution(m, ['Die'], t);
      expect(d.reduce((s, c) => s + c.p, 0)).toBeCloseTo(1);
    }
    const a = generate(m, 0, seeded(1));
    const b = generate(m, 0, seeded(99));
    expect(a).toEqual(b);
  });

  it('hohe Temperatur macht die Verteilung flacher', () => {
    const m = train(CORPUS.de, 2);
    const cold = nextDistribution(m, [], 0.5)[0]!.p;
    const hot = nextDistribution(m, [], 2.5)[0]!.p;
    expect(hot).toBeLessThan(cold);
  });

  it('kurzer Kontext erfindet neue Sätze, langer kopiert eher', () => {
    const m2 = train(CORPUS.de, 2);
    const m3 = train(CORPUS.de, 3);
    const rnd = seeded(4);
    let novel2 = 0;
    let novel3 = 0;
    for (let k = 0; k < 60; k++) {
      if (!isCopied(m2, generate(m2, 1, rnd))) novel2 += 1;
      if (!isCopied(m3, generate(m3, 1, rnd))) novel3 += 1;
    }
    expect(novel2).toBeGreaterThan(novel3);
    expect(nextDistribution(m2, ['xyz'], 1)[0]!.word).toBe(END);
  });
});

describe('Aufmerksamkeit', () => {
  it('„er“ achtet je nach Adjektiv auf Ball oder Koffer', () => {
    const big = weights(sentence('gross'), PRONOUN);
    const small = weights(sentence('klein'), PRONOUN);
    expect(big.indexOf(Math.max(...big))).toBe(1);
    expect(small.indexOf(Math.max(...small))).toBe(6);
    expect(big.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(softmax([2, 0, 0])[0]).toBeCloseTo(Math.exp(2) / (Math.exp(2) + 2));
  });
});

describe('Belohnungsmodell', () => {
  it('lernt aus guten Bewertungen die richtigen Antworten', () => {
    const good = PAIRS.map((p) => {
      const score = (x: number[]) => x[0]! + x[1]! + x[3]!;
      return score(p.a.x) >= score(p.b.x) ? { better: p.a, worse: p.b } : { better: p.b, worse: p.a };
    });
    const theta = fitReward(good);
    expect(theta[0]).toBeGreaterThan(0);
    for (const c of CHECKS) expect(reward(theta, c.a) > reward(theta, c.b) ? c.a.x[0] : c.b.x[0]).toBe(1);
  });

  it('ein Bewerter mit Vorliebe für Länge führt zu Belohnungs-Hacking', () => {
    const theta = fitReward(lengthLover(PAIRS));
    expect(theta[4]).toBeGreaterThan(0);
    const c = CHECKS[0]!;
    // Die lange, falsche Antwort gewinnt
    expect(reward(theta, c.b)).toBeGreaterThan(reward(theta, c.a));
  });
});
