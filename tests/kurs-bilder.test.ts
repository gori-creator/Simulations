import { describe, expect, it } from 'vitest';
import { seeded } from '../src/kurse/engine/dom';
import { POOL, START as FAIR_START, TEST as FAIR_TEST } from '../src/kurse/ki-abenteuer/models/fair';
import { accuracy } from '../src/kurse/ki-abenteuer/models/knn';
import { rowsOf, sameCells, SIZE, SMILEY } from '../src/kurse/ki-abenteuer/models/pixel';
import { candidates, CORPUS, END, generate, inCorpus, join, sample, START, train } from '../src/kurse/ki-abenteuer/models/woerter';
import { distance, recognise, SYMBOLS, TEMPLATES, TEST_DRAWINGS } from '../src/kurse/ki-abenteuer/models/zeichen';

describe('Bilder sind Zahlen', () => {
  it('Smiley hat 49 Kästchen und 11 ausgemalte', () => {
    expect(SMILEY).toHaveLength(SIZE * SIZE);
    expect(SMILEY.filter((v) => v === 1)).toHaveLength(11);
    expect(sameCells(SMILEY, SMILEY)).toBe(49);
    expect(sameCells(SMILEY, new Array(49).fill(0))).toBe(38);
    expect(rowsOf(SMILEY)[1]).toBe('0 1 0 0 0 1 0');
  });
});

describe('Zeichen erkennen', () => {
  it('Abstand zählt verschiedene Kästchen', () => {
    expect(distance(TEMPLATES.cross, TEMPLATES.cross)).toBe(0);
    expect(distance([1, 0, 1], [0, 0, 1])).toBe(1);
  });
  it('mit den Vorlagen erkennt Bit alle Probe-Zeichnungen', () => {
    const examples = SYMBOLS.map((label) => ({ label, cells: TEMPLATES[label] }));
    for (const d of TEST_DRAWINGS) expect(recognise(d.cells, examples)?.label).toBe(d.label);
  });
  it('ohne Beispiele kein Ergebnis, mit nur Kreuzen immer Kreuz', () => {
    expect(recognise(TEMPLATES.line, [])).toBeNull();
    expect(recognise(TEMPLATES.line, [{ label: 'cross', cells: TEMPLATES.cross }])!.label).toBe('cross');
  });
});

describe('Das nächste Wort', () => {
  const de = train(CORPUS.de);
  it('zählt Wortpaare', () => {
    // „Bit“ steht in 5 Sätzen am Anfang, 2-mal folgt „ist“
    const next = candidates(de, 'Bit');
    expect(next[0]).toEqual({ word: 'ist', p: 2 / 5 });
    expect(next.reduce((a, c) => a + c.p, 0)).toBeCloseTo(1);
    expect(candidates(de, START).map((c) => c.word)).toEqual(['Bit', 'Der', 'Die']);
  });
  it('zieht Wörter nach Wahrscheinlichkeit', () => {
    const list = [{ word: 'a', p: 0.25 }, { word: 'b', p: 0.75 }];
    expect(sample(list, 0.1)).toBe('a');
    expect(sample(list, 0.5)).toBe('b');
  });
  it('erzeugt Sätze, die nicht im Text stehen – grammatisch, aber erfunden', () => {
    const random = seeded(3);
    const made = Array.from({ length: 40 }, () => join(generate(de, random)));
    expect(made.every((s) => s.endsWith(END))).toBe(true);
    expect(made.some((s) => !inCorpus(s, 'de'))).toBe(true);
    expect(made.some((s) => inCorpus(s, 'de'))).toBe(true);
  });
  it('Englisch ebenso', () => {
    expect(candidates(train(CORPUS.en), START).map((c) => c.word)).toEqual(['The', 'Bit']);
  });
});
describe('Ist das fair?', () => {
  const group = (g: string) => FAIR_TEST.filter((x) => x.group === g);
  it('am Anfang: Turnschuhe und Stiefel richtig, Sandalen falsch', () => {
    expect(accuracy(group('sneaker'), FAIR_START, 1)).toBe(1);
    expect(accuracy(group('boot'), FAIR_START, 1)).toBe(1);
    expect(accuracy(group('sandal'), FAIR_START, 1)).toBe(0);
    expect(accuracy(group('other'), FAIR_START, 1)).toBe(1);
  });
  it('mit einer Sandale als Beispiel werden alle Sandalen erkannt', () => {
    const more = [...FAIR_START, POOL.find((p) => p.id === 'sandale-1')!];
    expect(accuracy(group('sandal'), more, 1)).toBe(1);
    expect(accuracy(FAIR_TEST, more, 1)).toBe(1);
  });
  it('mehr Turnschuhe helfen den Sandalen nicht', () => {
    const more = [...FAIR_START, ...POOL.filter((p) => p.group === 'sneaker' || p.group === 'other')];
    expect(accuracy(group('sandal'), more, 1)).toBe(0);
  });
});
