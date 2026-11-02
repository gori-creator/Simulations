import { describe, expect, it } from 'vitest';
import { ELIZA_RULES, elizaReply, newElizaState, reflect } from '../src/kurse/gemeinsam/models/eliza';
import { bitMove, search, winningTake } from '../src/kurse/gemeinsam/models/nim';
import { CASES, checkStraussRule, conclusions, infer, RULES } from '../src/kurse/ki-labor/models/regeln';

/** Klassische KI: ELIZA, Expertensystem, Spielbaum (Nim). */
describe('ELIZA', () => {
  it('spiegelt Pronomen', () => {
    expect(reflect('meine Schwester nervt mich', 'de')).toBe('deine Schwester nervt dich');
    expect(reflect('my sister annoys me', 'en')).toBe('your sister annoys you');
  });

  it('antwortet mit der Regel mit dem höchsten Rang', () => {
    const st = newElizaState();
    expect(elizaReply('Ich bin müde.', 'de', st).reply).toBe('Warum bist du müde?');
    expect(elizaReply('Meine Mutter mag meine Musik nicht.', 'de', st).rule.id).toBe('familie');
    expect(elizaReply('Du bist doof', 'de', st).reply).toBe('Warum glaubst du, dass ich doof bin?');
    expect(elizaReply('I am tired', 'en', newElizaState()).reply).toBe('Why are you tired?');
    expect(elizaReply('Was ist die Hauptstadt von Frankreich?', 'de', st).rule.id).toBe('sonst');
  });

  it('wechselt die Vorlagen ab', () => {
    const st = newElizaState();
    const a = elizaReply('Ich bin müde', 'de', st).reply;
    const b = elizaReply('Ich bin müde', 'de', st).reply;
    expect(a).not.toBe(b);
  });

  it('Schutzregel hat Vorrang und spiegelt nicht', () => {
    const st = newElizaState();
    const r = elizaReply('ich bin traurig und will sterben', 'de', st);
    expect(r.rule.safety).toBe(true);
    expect(r.reply).toContain('116 111');
    expect(elizaReply('I want to die', 'en', st).rule.safety).toBe(true);
  });

  it('jede Regel hat Vorlagen in beiden Sprachen', () => {
    for (const rule of ELIZA_RULES) {
      expect(rule.replies.de.length, rule.id).toBeGreaterThan(0);
      expect(rule.replies.en.length, rule.id).toBeGreaterThan(0);
    }
  });
});

describe('Expertensystem', () => {
  it('erkennt die bekannten Tiere durch Vorwärtsverkettung', () => {
    for (const c of CASES.filter((x) => x.id !== 'strauss')) expect(conclusions(c.facts), c.id).toEqual([c.answer]);
    const { trace } = infer(CASES[0]!.facts);
    expect(trace.map((t) => t.rule.id)).toEqual(['R1', 'R5', 'R8']);
  });

  it('kennt den Strauß zunächst nicht', () => {
    expect(conclusions(CASES.find((c) => c.id === 'strauss')!.facts)).toEqual([]);
    expect(RULES.some((r) => r.then === 'strauss')).toBe(false);
  });

  it('prüft neue Regeln: zu allgemein bricht andere Fälle', () => {
    expect(checkStraussRule(['vogel', 'fliegt-nicht']).every((c) => c.ok)).toBe(false);
    expect(checkStraussRule(['beine']).every((c) => c.ok)).toBe(false);
    expect(checkStraussRule(['vogel', 'beine']).every((c) => c.ok)).toBe(true);
    expect(checkStraussRule(['vogel', 'hals', 'fliegt-nicht']).every((c) => c.ok)).toBe(true);
  });
});

describe('Nim', () => {
  it('Vierer-Regel stimmt mit der Suche überein', () => {
    for (let n = 1; n <= 12; n++) {
      const r = search(n);
      expect(r.value, `n=${n}`).toBe(n % 4 === 0 ? -1 : 1);
      if (r.value === 1) expect(r.best).toBe(winningTake(n));
    }
  });

  it('bei 10 Steinen schaut die Suche einige Hundert Stellungen an', () => {
    const { nodes } = search(10);
    expect(nodes).toBeGreaterThan(50);
    expect(nodes).toBeLessThan(2000);
  });

  it('Bit nimmt bei voller Suche immer den Gewinnzug', () => {
    for (const n of [5, 6, 7, 9, 10, 11]) expect(bitMove(n, 'voll').take).toBe(winningTake(n));
    expect(bitMove(3, 'kurz').take).toBe(3);
  });
});
