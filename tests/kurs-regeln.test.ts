import { describe, expect, it } from 'vitest';
import { bestScore, classify, CONDITIONS, PETS, ruleKey, score } from '../src/kurse/ki-abenteuer/models/regeln';

describe('KI-Abenteuer: Regeln für Katze und Hund', () => {
  it('hat 4 Katzen und 5 Hunde', () => {
    expect(PETS.filter((p) => p.kind === 'cat')).toHaveLength(4);
    expect(PETS.filter((p) => p.kind === 'dog')).toHaveLength(5);
  });

  it('ordnet nach der Regel ein', () => {
    const husky = PETS.find((p) => p.id === 'husky')!;
    expect(classify(husky, [{ feature: 'ears', value: 'pointy' }])).toBe('cat');
    expect(classify(husky, [{ feature: 'ears', value: 'pointy' }, { feature: 'size', value: 'small' }])).toBe('dog');
  });

  it('zählt richtige Antworten', () => {
    // „spitze Ohren → Katze“: 3 Katzen richtig, Dackel, Labrador, Pudel richtig = 6
    expect(score([{ feature: 'ears', value: 'pointy' }])).toBe(6);
    // „klein → Katze“: Hauskatze, Perser, Faltohr; Husky, Labrador = 5
    expect(score([{ feature: 'size', value: 'small' }])).toBe(5);
    // „spitz UND klein“: Hauskatze, Perser; Dackel, Husky, Labrador, Pudel = 6
    expect(score([{ feature: 'ears', value: 'pointy' }, { feature: 'size', value: 'small' }])).toBe(6);
    // ohne Regel: immer Katze = 4
    expect(score([])).toBe(4);
  });

  it('keine Regel schafft alle Tiere', () => {
    expect(bestScore()).toBeLessThan(PETS.length);
    expect(bestScore()).toBe(6);
  });

  it('Schlüssel ist unabhängig von der Reihenfolge', () => {
    expect(ruleKey([CONDITIONS[0]!, CONDITIONS[2]!])).toBe(ruleKey([CONDITIONS[2]!, CONDITIONS[0]!]));
  });
});
