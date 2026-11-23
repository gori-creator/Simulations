import { describe, expect, it } from 'vitest';
import { derivative, evaluate, matchRound, MATCH_FUNCS, parse, ruleChoice, ruleQuiz, RULE_TERMS, sameValues, stationaryPoints, derive, mainStep } from '../src/simulations/mathematik/ableitungsregeln/model';

const E = (s: string) => {
  const r = parse(s);
  if (!r.ok) throw new Error(s);
  return r.e;
};
const first = (s: string) => ruleChoice(mainStep(derive(E(s)).steps)!.rule);

describe('Welche Regel zuerst?', () => {
  it('Lehrbuchbeispiele', () => {
    expect(first('x^7')).toBe('power');
    expect(first('x^4 + 3x^2')).toBe('sum');
    expect(first('5x^3')).toBe('factor');
    expect(first('x^2·sin(x)')).toBe('product');
    expect(first('(x+1)/(x^2+1)')).toBe('quotient');
    expect(first('sin(3x)')).toBe('chain');
    expect(first('(2x+1)^5')).toBe('chain');
    expect(first('cos(x)')).toBe('basic');
  });
  it('alle Übungsterme sind lesbar, Runden sind reproduzierbar', () => {
    for (const t of RULE_TERMS) expect(parse(t).ok).toBe(true);
    expect(ruleQuiz(3)).toEqual(ruleQuiz(3));
    const seen = new Set(Array.from({ length: 60 }, (_, n) => ruleQuiz(n + 1).answer));
    expect(seen.size).toBeGreaterThanOrEqual(6);
  });
});

describe('Paare finden', () => {
  it('genau ein Kandidat ist f′, alle vier verschieden', () => {
    for (let n = 1; n <= 40; n++) {
      const r = matchRound(n);
      const d = derivative(E(r.f));
      const hits = r.candidates.filter((c) => sameValues(c, d)).length;
      expect(hits).toBe(1);
      expect(sameValues(r.candidates[r.target]!, d)).toBe(true);
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(sameValues(r.candidates[i]!, r.candidates[j]!)).toBe(false);
    }
    expect(MATCH_FUNCS.every((s) => parse(s).ok)).toBe(true);
  });
});

describe('Extremstellen über f′', () => {
  it('x³ − 3x: Hochpunkt bei −1, Tiefpunkt bei 1', () => {
    const s = stationaryPoints(derivative(E('x^3 - 3x')), -5, 5);
    expect(s).toHaveLength(2);
    expect(s[0]!.x).toBeCloseTo(-1, 6);
    expect(s[0]!.kind).toBe('max');
    expect(s[1]!.x).toBeCloseTo(1, 6);
    expect(s[1]!.kind).toBe('min');
  });
  it('sin(x) zwischen −5 und 5: Extrema bei ±π/2 und ±3π/2', () => {
    const s = stationaryPoints(derivative(E('sin(x)')), -5, 5).map((q) => q.x);
    for (const want of [-1.5 * Math.PI, -0.5 * Math.PI, 0.5 * Math.PI, 1.5 * Math.PI]) expect(s.some((x) => Math.abs(x - want) < 1e-5)).toBe(true);
    expect(evaluate(derivative(E('sin(x)')), Math.PI / 2)).toBeCloseTo(0, 12);
  });
});
