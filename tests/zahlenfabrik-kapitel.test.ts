import { describe, expect, it } from 'vitest';
import { allOps, clampNum, KIT, kitItem, opAllowed, specFor, testAllowed } from '../src/spiele/zahlenfabrik/kit';
import { ALL_LEVELS, CHAPTERS, chapterOf, kitFor, newIn, PARTS, type LevelInfo } from '../src/spiele/zahlenfabrik/levels';
import { accepts, apply, applySeq, emitCount, passes, isFixed, key, opLabel, run, shortestPath, sourceValue, targetsOf, totalNeed, withFixed, type Dir, type Grid, type Op, type Part, type Test } from '../src/spiele/zahlenfabrik/model';
import { beltsOver } from '../src/spiele/zahlenfabrik/rules';
import { ascii, bestSort, lay, own, straight } from './zahlenfabrik-loeser';

const level = (id: string) => ALL_LEVELS.find((l) => l.id === id)!;
const op = (sym: Op['sym'], n = 2): Op => ({ sym, n });
const even: Test = { kind: 'even' };
const prime: Test = { kind: 'prime' };
const div = (n: number): Test => ({ kind: 'div', n });
const gt = (n: number): Test => ({ kind: 'gt', n });

/** Musterlösung je Level. */
type Solution =
  | { kind: 'chain'; ops: Op[] }
  | { kind: 'pick'; answer: number }
  | { kind: 'sort'; test: Test; ops?: Op[]; yes?: Op[]; no?: Op[] }
  | { kind: 'three'; first: Test; second: Test; ops?: Op[] }
  | { kind: 'grid'; grid: Grid; answer?: number };

const chain = (...ops: Op[]): Solution => ({ kind: 'chain', ops });
const pick = (answer: number): Solution => ({ kind: 'pick', answer });
const sort = (test: Test, ops: Op[] = [], yes: Op[] = [], no: Op[] = []): Solution => ({ kind: 'sort', test, ops, yes, no });
const three = (first: Test, second: Test, ops: Op[] = []): Solution => ({ kind: 'three', first, second, ops });
const drawn = (rows: string[], legend: Record<string, Part> = {}): Solution => ({ kind: 'grid', grid: ascii(rows, legend) });
const m = (o: Op, dir: Dir): Part => ({ op: o, dir });
const merger = (mode: '+' | '−' | '×' | '÷'): Part => ({ op: null, dir: 0, merge: mode });
const sqTest: Test = { kind: 'square' };
const whole: Test = { kind: 'int' };

/** Verteiler-Karte: Kopie nach oben (Lager oben), weiter nach rechts und unten. */
const SPLIT2 = ['............', '..>>>>>>>>..', '..^.........', '..a.........', '..Sb........', '...v........', '...v........', '...>>>>>>>..'];
/** Zusammenführer-Karte: Kopie oben herum, unten geradeaus, Zusammenführer bei (7, 3). */
const MERGE = (up = '>>>>', straight = '>>>', after = '>>>') => ['.............', '.............', `...${up}v.....`, `..>S${straight}M${after}..`];
/** Zwei Quellen: A (1, 3) geradeaus, B (1, 1) oben herum, Zusammenführer M bei (7, 3). */
const TWO = (b = '>>>>>', a = '>>>>>', after = '>>>') => ['.............', `..${b}v.....`, '.......v.....', `..${a}M${after}..`];
/** Waage (Gleichungen): beide Reihen mit Bändern, feste Teile bleiben stehen. */
const EQ = ['.............', '..>>>>>v.....', '.......v.....', '..>>>>>.>>>..'];
/** Brücken-Karte: Weiche/Verteiler fest bei (4, 4), Brücke bei (7, 3). */
const CROSS = (top = '>>', side = '>>>') => ['............', '.......>>>>.', '.......^....', `....${side}B>v..`, `..>>.${top}^.v..`, '.........v..', '.........v..', '.........>>.'];
const bridge: Part = { op: null, dir: 0, bridge: true };
const split = (dir: Dir, side: 1 | 3): Part => ({ op: null, dir, split: true, side });
/** Einfache Schleife: Einstieg (2, 3), Verteiler S (3, 3) → Lager, Rückweg über (3, 4) und (2, 4). */
const LOOP = (top = '..>S>>>>>>..', back = '..^a........') => ['............', '............', '............', top, back];
/** Schleife mit zwei Verteilern (S: Kopie ins Lager, T: Kopie über a), Zusammenführer M bei (3, 5), Rückweg über b (2, 5). */
const LOOP2 = ['............', '............', '............', '..>>S>>>>>..', '..^aT.......', '..bM<.......'];
const alt = (dir: Dir, side: 1 | 3): Part => ({ op: null, dir, alt: true, side });

const SOLUTIONS: Record<string, Solution> = {
  'c1-1': chain(),
  'c1-2': chain(),
  'c1-3': chain(),
  'c2-1': chain(op('+', 2)),
  'c2-2': chain(op('+', 7)),
  'c2-3': chain(op('+', 9), op('+', 9)),
  'c2-4': chain(op('+', 10), op('+', 10), op('+', 10)),
  'c3-1': chain(op('−', 5)),
  'c3-2': chain(op('−', 7)),
  'c3-3': chain(op('−', 10), op('−', 5)),
  'c3-4': chain(op('+', 10), op('+', 7)),
  'c4-1': chain(op('×', 3)),
  'c4-2': chain(op('+', 2), op('×', 10)),
  'c4-3': chain(op('×', 10), op('×', 10)),
  'c4-4': chain(op('×', 7), op('+', 1)),
  'c4-5': chain(op('+', 7), op('×', 9)),
  'c5-1': chain(op('÷', 4)),
  'c5-2': chain(op('÷', 2)),
  'c5-3': chain(op('÷', 9), op('÷', 4)),
  'c5-4': chain(op('÷', 10), op('−', 7)),
  'c5-5': chain(op('÷', 7), op('÷', 5), op('÷', 6)),
  'c6-1': pick(5),
  'c6-2': pick(8),
  'c6-3': pick(12),
  'c6-4': pick(9),
  'c6-5': pick(90),
  'c6-6': pick(13),
  'c6-7': pick(14),
  'c7-1': sort(even),
  'c7-2': sort(even, [], [op('×', 2)]),
  'c7-3': sort(even, [], [op('×', 10)], [op('+', 10)]),
  'c8-1': sort(div(3)),
  'c8-2': sort(div(4), [op('+', 1)]),
  'c8-3': three(div(3), even),
  'c8-4': three(div(5), even),
  'c9-1': sort(gt(10)),
  'c9-2': sort(gt(10), [op('×', 3)]),
  'c9-3': three(gt(5), gt(2)),
  'c10-1': sort(prime),
  'c10-2': sort(prime),
  'c10-3': sort(prime, [op('×', 2), op('+', 1)]),
  'c10-4': sort(even, [], [op('÷', 2)]),
  'c10-5': sort(prime, [op('+', 2)]),
  'c10-6': three(prime, even),
  'c11-1': chain(op('+', 3)),
  'c11-2': chain(op('×', 2)),
  'c11-3': chain(op('×', 3), op('+', 1)),
  'c11-4': chain(op('+', 1), op('×', 2)),
  'c11-5': chain(op('×', 5), op('−', 2)),
  'c11-6': chain(op('+', 1), op('×', 4)),
  'c11-7': chain(op('+', 2), op('×', 3), op('−', 1)),
  'c11-8': chain(op('−', 3), op('×', 4)),
  'c12-1': chain(op('²')),
  'c12-2': chain(op('²'), op('+', 1)),
  'c12-3': chain(op('+', 1), op('²')),
  'c12-4': chain(op('²'), op('×', 2)),
  'c12-5': chain(op('×', 3), op('−', 1)),
  'c12-6': chain(op('²'), op('−', 4)),
  'c12-7': chain(op('×', 2), op('²')),
  'c12-8': chain(op('−', 1), op('²'), op('−', 1)),
  'c14-1': chain(op('%', 5)),
  'c14-2': chain(op('%', 3)),
  'c14-3': sort(even, [op('%', 2)]),
  'c14-4': chain(op('%', 7)),
  'c14-5': chain(op('%', 6), op('×', 9)),
  'c15-1': chain(op('Σ')),
  'c15-2': sort(div(3), [op('Σ')]),
  'c15-3': chain(op('Σ'), op('Σ')),
  'c15-4': chain(op('Σ'), op('×', 6)),
  'c16-1': chain(op('√')),
  'c16-2': chain(op('√')),
  'c16-3': chain(op('√'), op('×', 7)),
  'c16-4': pick(49),
  'c17-1': sort(sqTest),
  'c17-2': sort(sqTest, [op('+', 1)]),
  'c17-3': three(sqTest, prime),
  'c20-1': drawn(CROSS(), { B: bridge }),
  'c20-2': drawn(CROSS('a>', 'b>>').map((r, y) => (y === 4 ? r.replace('..>>.', '..>>>') : r)), { B: bridge, a: m(op('²'), 0), b: m(op('+', 5), 0) }),
  'c20-3': drawn(CROSS('ab', 'cd>').map((r, y) => (y === 4 ? r.replace('..>>.', '..>>>') : r)), { B: bridge, a: m(op('+', 1), 0), b: m(op('²'), 0), c: m(op('×', 3), 0), d: m(op('−', 1), 0) }),
  'c19-1': drawn(TWO(), { M: merger('+') }),
  'c19-2': drawn(TWO(), { M: merger('×') }),
  'c19-3': drawn(TWO('a>>>>'), { M: merger('+'), a: m(op('²'), 0) }),
  'c19-4': drawn(TWO('a>>>>'), { M: merger('×'), a: m(op('²'), 0) }),
  'c19-5': drawn(TWO('a>>>>', 'b>>>>'), { M: merger('×'), a: m(op('+', 1), 0), b: m(op('−', 1), 0) }),
  'c19-6': drawn(TWO('a>>>>'), { M: merger('×'), a: m(op('+', 2), 0) }),
  'c19-7': drawn(TWO('ab>>>'), { M: merger('×'), a: m(op('²'), 0), b: m(op('−', 1), 0) }),
  'c19-8': drawn(TWO('a>>>>', 'bc>>>'), { M: merger('+'), a: m(op('²'), 0), b: m(op('+', 1), 0), c: m(op('²'), 0) }),
  'c24-2': drawn(TWO('a>>>>'), { M: merger('+'), a: m(op('⇄'), 0) }),
  'c28-1': drawn(TWO(), { M: merger('+') }),
  'c28-2': drawn(TWO(), { M: merger('×') }),
  'c28-3': drawn(TWO(), { M: merger('+') }),
  'c28-4': drawn(TWO(), { M: merger('−') }),
  'c28-5': drawn(TWO(), { M: merger('÷') }),
  'c28-6': drawn(TWO('a>>>>'), { M: merger('×'), a: m(op('+', 1), 0) }),
  'c28-7': drawn(TWO('>>>>>', 'a>>>>'), { M: merger('+'), a: m(op('×', 2), 0) }),
  'c21-1': chain(op('²'), op('−', 6)),
  'c21-2': chain(op('+', 4), op('²')),
  'c21-3': chain(op('+', 3), op('×', 4)),
  'c21-4': chain(op('×', 10), op('+', 2)),
  'c21-5': chain(op('²'), op('×', 3), op('−', 5)),
  'c21-6': chain(op('+', 4), op('²'), op('+', 2)),
  'c21-7': chain(op('×', 9), op('²'), op('+', 5)),
  'c21-8': chain(op('×', 3), op('−', 5), op('²')),
  'c21-9': chain(op('×', 9), op('×', 9), op('−', 3)),
  'c21-10': chain(op('−', 6), op('²'), op('+', 6)),
  'c22-1': chain(op('×', 4), op('+', 9)),
  'c22-2': chain(op('−', 1), op('²'), op('+', 2)),
  'c22-3': chain(op('+', 4), op('²'), op('+', 3)),
  'c22-4': chain(op('²'), op('×', 10), op('−', 5)),
  'c22-5': chain(op('²'), op('+', 10), op('×', 5)),
  'c22-6': chain(op('×', 4), op('+', 10), op('²')),
  'c22-7': chain(op('%', 5), op('+', 7), op('×', 2)),
  'c22-8': chain(op('×', 6), op('%', 10), op('−', 6)),
  'c22-9': chain(op('×', 4), op('−', 9), op('Σ')),
  'c23-1': chain(op('±')),
  'c23-2': chain(op('|')),
  'c23-3': chain(op('−', 10), op('|')),
  'c23-4': chain(op('²'), op('±')),
  'c24-1': chain(op('⇄')),
  'c24-3': chain(op('⇄'), op('²')),
  'c25-1': chain(op('≈', 1)),
  'c25-2': chain(op('≈', 2)),
  'c25-3': chain(op('≈', 1), op('×', 2)),
  'c25-4': chain(op('+', 8), op('×', 6), op('≈', 1)),
  'c26-1': drawn(SPLIT2.map((r) => r.replace('a', '^').replace('b', 'v')), { S: alt(3, 1) }),
  'c26-2': drawn(SPLIT2, { S: alt(3, 1), a: m(op('×', 10), 3), b: m(op('+', 10), 1) }),
  'c26-3': drawn(MERGE(), { S: alt(0, 3), M: merger('×') }),
  'c27-1': chain(op('⇄'), op('²'), op('+', 2)),
  'c27-2': chain(op('+', 10), op('²'), op('±')),
  'c27-3': chain(op('²'), op('≈', 2), op('+', 6)),
  'c27-4': chain(op('×', 8), op('+', 1), op('⇄')),
  'c27-5': chain(op('−', 6), op('²'), op('≈', 1)),
  'c27-6': chain(op('×', 8), op('+', 10), op('|')),
  'c27-7': drawn(MERGE(), { S: alt(0, 3), M: merger('+') }),
  'c27-8': drawn(MERGE('>>>>', '>>>', 'a>>'), { S: alt(0, 3), M: merger('×'), a: m(op('−', 1), 0) }),
  'c27-9': chain(op('×', 4), op('+', 7), op('⇄')),
  'c27-10': chain(op('²'), op('≈', 3), op('+', 4)),
  'c29-1': chain(op(':', 2)),
  'c29-2': chain(op(':', 4)),
  'c29-3': chain(op(':', 9)),
  'c29-4': chain(op('⅟')),
  'c29-5': drawn(TWO('a>>>>', 'b>>>>'), { M: merger('+'), a: m(op('⅟'), 0), b: m(op('⅟'), 0) }),
  'c29-6': drawn(TWO('ab>>>'), { M: merger('×'), a: m(op('+', 1), 0), b: m(op('⅟'), 0) }),
  'c29-7': drawn(TWO('a>>>>', 'b>>>>'), { M: merger('+'), a: m(op(':', 3), 0), b: m(op(':', 2), 0) }),
  'c30-1': pick(5),
  'c30-2': pick(7),
  'c30-3': pick(5),
  'c30-4': pick(8),
  'c30-5': { ...drawn(EQ), answer: 4 } as Solution,
  'c30-6': { ...drawn(EQ), answer: 5 } as Solution,
  'c30-7': { ...drawn(EQ), answer: 5 } as Solution,
  'c13-1': pick(7),
  'c13-2': chain(op('×', 5), op('×', 10), op('×', 10)),
  'c13-3': chain(op('²'), op('×', 2), op('−', 3)),
  'c13-4': pick(7),
  'c13-5': chain(op('×', 5), op('²'), op('+', 6)),
  'c13-6': three(gt(50), even, [op('²')]),
  'c31-1': chain(op('cnt')),
  'c31-2': chain(op('cnt'), op('×', 2)),
  'c31-3': chain(op('cnt'), op('²')),
  'c31-4': chain(op('cnt'), op('×', 2), op('−', 1)),
  'c31-5': sort(even, [op('cnt')]),
  'c31-6': drawn(TWO('a>>>>'), { M: merger('×'), a: m(op('cnt'), 0) }),
  'c32-1': chain(op('acc')),
  'c32-2': chain(op('acc')),
  'c32-3': chain(op('acc')),
  'c32-4': sort(gt(40), [op('acc')]),
  'c32-5': chain(op('acc'), op('acc')),
  'c32-6': chain(op('cnt'), op('acc')),
  'c32-7': drawn(TWO('a>>>>'), { M: merger('−'), a: m(op('acc'), 0) }),
  'c33-1': chain(op('prev')),
  'c33-2': chain(op('prev'), op('×', 2)),
  'c33-3': drawn(TWO('a>>>>'), { M: merger('−'), a: m(op('prev'), 0) }),
  'c33-4': drawn(TWO('a>>>>'), { M: merger('+'), a: m(op('prev'), 0) }),
  'c33-5': drawn(TWO('a>>>>'), { M: merger('−'), a: m(op('prev'), 0) }),
  'c33-6': chain(op('prev'), op('prev')),
  'c33-7': drawn(TWO('a>>>>'), { M: merger('×'), a: m(op('prev'), 0) }),
  'c35-1': drawn(LOOP(), { S: split(0, 1), a: m(op('+', 2), 2) }),
  'c35-2': drawn(LOOP(), { S: split(0, 1), a: m(op('×', 2), 2) }),
  'c35-3': drawn(LOOP('..aS>>>>>>..', '..^<........'), { S: split(0, 1), a: m(op('cnt'), 0) }),
  'c35-4': drawn(LOOP('..aSb>>>>>..', '..^<........'), { S: split(0, 1), a: m(op('cnt'), 0), b: m(op('²'), 0) }),
  'c35-5': drawn(LOOP2, { S: split(0, 1), T: split(1, 1), a: m(op('prev'), 1), M: { op: null, dir: 2, merge: '+' }, b: { op: null, dir: 3 } }),
  'c35-6': drawn(LOOP2, { S: split(0, 1), T: split(1, 1), a: m(op('cnt'), 1), M: { op: null, dir: 2, merge: '+' }, b: m(op('+', 1), 3) }),
  'c35-7': drawn(['............', '............', '............', '..>>S>>>>>..', '..^dW.......', '..^pt.......'], { S: split(0, 1), W: { op: null, dir: 2, sort: even, side: 3 }, d: m(op('÷', 2), 3), p: m(op('+', 1), 2), t: m(op('×', 3), 2) }),
  'c36-1': chain(op('+', 1), op('−', 1), op('±'), op('±')),
  'c36-2': chain(op('+', 4), op('²')),
  'c36-3': chain(op('²'), op('−', 5)),
  'c36-4': chain(op('²'), op('−', 4)),
  'c36-5': chain(op('×', 2), op('×', 2), op('|'), op('|'), op('|')),
  'c36-6': chain(op('×', 3), op('⇄'), op('×', 5)),
  'c36-7': chain(op('+', 10), op('⇄'), op('+', 5)),
  'c36-8': chain(op('²'), op('²'), op('≈', 1)),
  'c36-9': chain(op('+', 8), op('²'), op('|'), op('|'), op('|'), op('|')),
  'c37-1': drawn(['.............', '....>>>>>>...', '....^........', '....q........', '..c>Wav......', '......v......', '......v......', '......>>>>...'], { c: m(op('cnt'), 0), W: { op: null, dir: 3, sort: even, side: 1 }, q: m(op('²'), 3), a: m(op('acc'), 0) }),
  'c37-2': drawn(['.............', '......>>>>...', '......r......', '..>S>>Wd>>...', '..^a.........'], { S: split(0, 1), a: m(op('×', 2), 2), W: { op: null, dir: 3, sort: sqTest, side: 1 }, r: m(op('√'), 3), d: m(op('Σ'), 0) }),
  'c37-3': drawn(['.............', '.......>>>...', '.......^.....', '..>>S>>W>>...', '..^aT........', '..bM<........'], { S: split(0, 1), T: split(1, 1), a: m(op('prev'), 1), M: { op: null, dir: 2, merge: '+' }, b: { op: null, dir: 3 }, W: { op: null, dir: 3, sort: even, side: 1 } }),
  'c37-4': drawn(['..............', '..............', '..>>MT>>N>>>..', '....^p>>^.....', '..q>^.........'], { M: merger('−'), N: merger('−'), T: split(0, 1), p: m(op('prev'), 0), q: m(op('prev'), 0) }),
  'c37-5': drawn(['..............', '..............', '..............', '..>>v.........', '..A>MT>>>>>>..', '.....m........', '.....p........', '.....r>>>>>>..'], { A: alt(0, 3), M: merger('×'), T: split(0, 1), m: m(op('×', 4), 1), p: m(op('+', 1), 1), r: m(op('√'), 0) }),
  'c34-1': sort(whole),
  'c34-2': sort(whole, [op(':', 3)]),
  'c34-3': sort(whole, [op(':', 2)], [], [op('×', 2)]),
  'c34-4': sort(whole, [op('⅟')]),
};

/** Drei Lager mit zwei Weichen: feste Musterlösung (16 Teile), Maschinen auf die ersten Bänder. */
function threeGrid(l: LevelInfo, first: Test, second: Test, ops: Op[]): Grid {
  const g: Grid = new Map();
  lay(l, g, [[2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4]], [9, 4], ops);
  g.set(key(9, 4), { op: null, dir: 3, sort: first, side: 1 });
  lay(l, g, [[9, 3], [9, 2], [9, 1], [10, 1]], [11, 1]);
  g.set(key(10, 4), { op: null, dir: 0, sort: second, side: 1 });
  lay(l, g, [[10, 5], [10, 6], [10, 7]], [11, 7]);
  return g;
}

/** Fabrik zur Musterlösung bauen. */
function build(l: LevelInfo, s: Solution): Grid {
  if (s.kind === 'chain') return straight(l, s.ops);
  if (s.kind === 'pick') return straight(l);
  if (s.kind === 'sort') return bestSort(l, s.test, s.ops, s.yes, s.no)!;
  if (s.kind === 'grid') return s.grid;
  return threeGrid(l, s.first, s.second, s.ops ?? []);
}

/** Eigene Teile einer gebauten Fabrik (ohne vorgegebene). */
const ownParts = (l: LevelInfo, g: Grid): Part[] => [...g].filter(([k]) => !isFixed(l, ...(k.split(',').map(Number) as [number, number]))).map(([, p]) => p);

describe('Zahlenfabrik: Kapitel und Werkzeugkasten', () => {
  it('31 Kapitel, über 170 Level; jedes Bauteil wird genau einmal eingeführt; Kennungen eindeutig; Abschnitte vollständig', () => {
    expect(CHAPTERS).toHaveLength(36);
    expect(ALL_LEVELS.length).toBeGreaterThanOrEqual(202);
    // der Verteiler kommt erst im Schleifen-Kapitel: vorher kommen mehrere Ausgaben aus mehreren Quellen
    const loopAt = CHAPTERS.findIndex((c) => c.id === 'c35');
    expect(CHAPTERS[loopAt]!.teaches).toEqual(['split']);
    for (const c of CHAPTERS.slice(0, loopAt)) expect(kitFor(c.levels[0]!).some((k) => k.kind === 'split'), c.id).toBe(false);
    expect(PARTS.flatMap((p) => p.chapters)).toEqual(CHAPTERS.map((c) => c.id));
    const taught = CHAPTERS.flatMap((c) => c.teaches);
    expect(new Set(taught).size).toBe(taught.length);
    for (const k of KIT) expect(taught).toContain(k.id);
    expect(new Set(ALL_LEVELS.map((l) => l.id)).size).toBe(ALL_LEVELS.length);
    for (const c of CHAPTERS) expect(c.levels.length).toBeGreaterThanOrEqual(3);
  });
  it('der Werkzeugkasten wächst: was einmal da ist, bleibt', () => {
    let before: string[] = [];
    for (const c of CHAPTERS) {
      const now = kitFor(c.levels[0]!).map((k) => k.id);
      for (const id of before) expect(now).toContain(id);
      for (const k of newIn(c)) expect(now).toContain(k.id);
      before = now;
    }
    expect(kitFor(ALL_LEVELS[0]!)).toEqual([]);
    // am Ende sind alle Bauteile da (Rätsel mit Regeln verbieten einzelne: dort fehlen genau die verbotenen)
    expect(kitFor([...ALL_LEVELS].reverse().find((l) => !l.ban)!)).toHaveLength(KIT.length);
    for (const l of ALL_LEVELS.filter((x) => x.ban)) expect(kitFor(l), l.id).toHaveLength(kitFor({ ...l, ban: undefined, kit: KIT.filter((k) => kitFor(l).some((q) => q.id === k.id) || l.ban!.includes(k.id)).map((k) => k.id) }).length - l.ban!.length);
  });
  it('einstellbare Zahlen: Bereich und Bauteile', () => {
    expect(clampNum(kitItem('plus'), 15)).toBe(10);
    expect(clampNum(kitItem('times'), 1)).toBe(2);
    expect(clampNum(kitItem('gt'), 2.4)).toBe(2);
    expect(specFor(kitItem('plus'), 3)).toMatchObject({ id: '+3', kind: 'op', op: { sym: '+', n: 3 } });
    expect(specFor(kitItem('square'), 7)).toMatchObject({ id: 'x²', op: { sym: '²', n: 2 } });
    expect(specFor(kitItem('div'), 4)).toMatchObject({ id: 'div4', kind: 'sort', test: { kind: 'div', n: 4 } });
    expect(specFor(kitItem('gt'), 50)).toMatchObject({ id: 'gt50', test: { kind: 'gt', n: 50 } });
    expect(opAllowed(kitItem('plus'), op('+', 11))).toBe(false);
    expect(testAllowed(kitItem('div'), div(11))).toBe(false);
    expect(allOps([kitItem('plus'), kitItem('square')])).toHaveLength(11);
  });
  it('jedes Level hat eine Musterlösung', () => {
    for (const l of ALL_LEVELS) expect(SOLUTIONS[l.id], l.id).toBeDefined();
  });
});

describe('Zahlenfabrik: alle Level lösbar mit dem eigenen Werkzeugkasten', () => {
  for (const l of ALL_LEVELS) {
    const s = SOLUTIONS[l.id];
    if (!s) continue;
    it(`${l.id}: Karte stimmig, Lösung nur mit erlaubten Teilen, Teile-Ziel = kleinste Fabrik`, () => {
      // Karte
      const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < l.cols && y < l.rows;
      expect(inside(l.source.x, l.source.y)).toBe(true);
      for (const t of targetsOf(l)) {
        expect(inside(t.x, t.y)).toBe(true);
        expect(l.walls.some(([x, y]) => x === t.x && y === t.y)).toBe(false);
      }
      for (const f of l.fixed ?? []) expect(l.walls.some(([x, y]) => x === f.x && y === f.y)).toBe(false);
      expect(totalNeed(l)).toBeGreaterThan(0);
      expect(l.title.de.length * l.title.en.length * l.hint.de.length * l.hint.en.length).toBeGreaterThan(0);
      // Lösung bauen
      const g = build(l, s);
      expect(g).not.toBeNull();
      // Nur Teile aus dem Werkzeugkasten dieses Kapitels, mit erlaubten Zahlen
      const kit = kitFor(l);
      const has = (id: string) => kit.some((k) => k.id === id);
      const parts = ownParts(l, g);
      for (const p of parts) {
        if (p.op) expect(kit.some((k) => opAllowed(k, p.op!)), `${l.id}: ${p.op.sym}${p.op.n}`).toBe(true);
        if (p.sort) expect(kit.some((k) => testAllowed(k, p.sort!)), `${l.id}: ${p.sort.kind}`).toBe(true);
        if (p.split) expect(has('split'), `${l.id}: Verteiler`).toBe(true);
      if (p.alt) expect(has('alt'), `${l.id}: Wechsel-Weiche`).toBe(true);
        if (p.merge) expect(has({ '+': 'sum', '−': 'diff', '×': 'product', '÷': 'quot' }[p.merge]), `${l.id}: Zusammenführer`).toBe(true);
        if (p.bridge) expect(has('bridge'), `${l.id}: Brücke`).toBe(true);
      }
      if (l.maxMachines !== undefined) expect(parts.filter((p) => p.op).length).toBeLessThanOrEqual(l.maxMachines);
      // Nebenbedingung „höchstens n Bänder“ (verbotene Bauteile fehlen schon im Werkzeugkasten)
      expect(beltsOver(l, new Map([...g].filter(([k]) => !isFixed(l, ...(k.split(',').map(Number) as [number, number]))))), `${l.id}: Bänder`).toBe(0);
      for (const id of l.ban ?? []) expect(has(id), `${l.id}: ${id} verboten`).toBe(false);
      // Startzahl-Level: nur Bänder
      if (l.source.pick) expect(l.maxMachines).toBe(0);
      const r = run(l, withFixed(l, g), s.kind === 'pick' || s.kind === 'grid' ? s.answer : undefined);
      expect(r.error).toBeNull();
      expect(r.won).toBe(true);
      targetsOf(l).forEach((t, i) => expect(r.got[i]).toBe(t.need));
      expect(own(l, g)).toBe(l.par);
    });
  }
});

describe('Zahlenfabrik: Rückwärts – genau eine Startzahl passt', () => {
  for (const l of ALL_LEVELS.filter((x) => x.source.pick)) {
    it(`${l.id}`, () => {
      const s = SOLUTIONS[l.id] as { kind: 'pick'; answer: number } | { kind: 'grid'; grid: Grid; answer: number };
      if (s.kind === 'grid') {
        // Waage: genau ein x macht beide Seiten gleich
        const fits = [];
        for (let v = l.source.pick!.min; v <= l.source.pick!.max; v++) if (run(l, withFixed(l, s.grid), v).won) fits.push(v);
        expect(fits).toEqual([s.answer]);
        return;
      }
      const g = straight(l);
      const path = shortestPath(l)!;
      for (const f of l.fixed!) expect(path.some(([x, y]) => x === f.x && y === f.y)).toBe(true);
      const fits = [];
      for (let v = l.source.pick!.min; v <= l.source.pick!.max; v++) if (run(l, withFixed(l, g), v).won) fits.push(v);
      expect(fits).toEqual([s.answer]);
    });
  }
});

/** Alle Ketten aus höchstens `max` Maschinen des Werkzeugkastens, die das Level lösen (nur Rechnen, ohne Karte). */
function chains(l: LevelInfo, max: number): string[] {
  const ops = allOps(kitFor(l));
  const xs = Array.from({ length: totalNeed(l) }, (_, i) => sourceValue(l, i));
  const t = targetsOf(l)[0]!;
  const out: string[] = [];
  const walk = (vals: number[], used: Op[]) => {
    if (vals.every((v, i) => accepts(t, v, i))) out.push(used.map(opLabel).join(' '));
    if (used.length === max) return;
    for (const o of ops) {
      // der Reihe nach (Zähler und Sammler rechnen mit der ganzen Folge)
      const next = applySeq(o, vals);
      if (next.some((v) => v === null || Math.abs(v) > 1e6)) continue;
      walk(next as number[], [...used, o]);
    }
  };
  walk(xs, []);
  return out;
}

describe('Zahlenfabrik: Rätsel mit wenigen Maschinen', () => {
  it('c4-5: aus 4 wird 99 mit zwei Maschinen – nur ein Weg', () => {
    expect(chains(level('c4-5'), 2)).toEqual(['+7 ×9']);
  });
  it('c5-4: aus 100 wird 3 mit zwei Maschinen – nur ein Weg', () => {
    expect(chains(level('c5-4'), 2)).toEqual(['÷10 −7']);
  });
  it('c4-4 und c5-3: mehrere Wege', () => {
    expect(chains(level('c4-4'), 2).length).toBeGreaterThanOrEqual(2);
    expect(chains(level('c5-3'), 2).length).toBeGreaterThanOrEqual(3);
  });
  it('c2-3: mit einer Maschine geht es nicht (höchstens +10)', () => {
    expect(chains(level('c2-3'), 1)).toEqual([]);
  });
  it('Level mit Maschinen-Grenze sind mit dieser Grenze lösbar, mit einer weniger nicht', () => {
    for (const l of ALL_LEVELS.filter((x) => x.maxMachines && !x.targets && !x.fixed)) {
      expect(chains(l, l.maxMachines!).length, l.id).toBeGreaterThan(0);
      expect(chains(l, l.maxMachines! - 1), l.id).toEqual([]);
    }
  });
  it('Wertetabellen mit mehreren Wegen (z. B. 2 · (x + 1) = 2x + 2)', () => {
    expect(chains(level('c11-4'), 2)).toEqual(expect.arrayContaining(['+1 ×2', '×2 +2']));
    expect(chains(level('c12-7'), 2)).toEqual(expect.arrayContaining(['×2 x²', 'x² ×4']));
  });
  it('Rätsel-Werkstatt und Funktionen-Detektiv: mit der Grenze genau ein Weg, mit einer Maschine weniger keiner', () => {
    const graded = CHAPTERS.find((c) => c.id === 'c27')!.levels.filter((l) => SOLUTIONS[l.id]!.kind === 'chain');
    for (const l of [...CHAPTERS.find((c) => c.id === 'c21')!.levels, ...CHAPTERS.find((c) => c.id === 'c22')!.levels, ...graded, level('c25-4')]) {
      const s = SOLUTIONS[l.id] as { kind: 'chain'; ops: Op[] };
      const name = s.ops.map(opLabel).join(' ');
      expect(chains(l, l.maxMachines!), l.id).toEqual([name]);
      expect(chains(l, l.maxMachines! - 1), l.id).toEqual([]);
    }
  });
  it('Maschinen mit Gedächtnis: Zähler und Sammler rechnen der Reihe nach', () => {
    expect(applySeq(op('cnt'), [7, 7, 7, 7])).toEqual([1, 2, 3, 4]);
    expect(applySeq(op('acc'), [1, 2, 3, 4, 5])).toEqual([1, 3, 6, 10, 15]);
    expect(applySeq(op('acc'), [1, 3, 5, 7, 9])).toEqual([1, 4, 9, 16, 25]);
    expect(applySeq(op('acc'), [0.5, 0.25])).toEqual([0.5, 0.75]);
    // ohne Vorgeschichte wie die erste Zahl (für den Rechenweg)
    expect(apply(op('cnt'), 9)).toBe(1);
    expect(apply(op('acc'), 9)).toBe(9);
    // Zähler und Sammler: mit der Grenze lösbar, aber nicht mit anderen Maschinen allein
    expect(chains(level('c31-1'), 1)).toEqual(['1,2,3']);
    expect(chains(level('c31-2'), 2)).toEqual(['1,2,3 ×2']);
    expect(chains(level('c31-3'), 2)).toEqual(['1,2,3 x²']);
    expect(chains(level('c32-1'), 1)).toEqual(['Σx']);
    expect(chains(level('c32-3'), 1)).toEqual(['Σx']);
    expect(chains(level('c32-5'), 2)).toEqual(['Σx Σx']);
    expect(chains(level('c32-6'), 2)).toEqual(['1,2,3 Σx']);
    // jede Maschine zählt für sich: zwei Zähler hintereinander zählen beide von 1 an
    expect(chains(level('c31-1'), 2)).toContain('1,2,3 1,2,3');
    // Puffer: gibt die vorige Zahl weiter, am Anfang die 0; zwei Puffer verschieben um zwei
    expect(applySeq(op('prev'), [4, 9, 2, 7])).toEqual([0, 4, 9, 2]);
    expect(apply(op('prev'), 9)).toBe(0);
    expect(chains(level('c33-1'), 1)).toEqual(['x₋₁']);
    expect(chains(level('c33-6'), 2)).toEqual(['x₋₁ x₋₁']);
    // Weiche „ganze Zahl?“: Brüche mit Rundungsrest zählen richtig
    expect(passes(whole, 1 / 3 + 1 / 3 + 1 / 3)).toBe(true);
    expect(passes(whole, 0.5)).toBe(false);
    expect(passes(whole, -4)).toBe(true);
  });
  it('Schleife: Die Quelle gibt nur eine Zahl aus; ohne Rückführung (Band statt Verteiler) kommt die Folge nicht zustande', () => {
    for (const l of CHAPTERS.find((c) => c.id === 'c35')!.levels) {
      expect(emitCount(l), l.id).toBe(1);
      const g = new Map((SOLUTIONS[l.id] as { grid: Grid }).grid);
      for (const [k, p] of g) if (p.split) g.set(k, { op: null, dir: p.dir });
      expect(run(l, g).won, l.id).toBe(false);
    }
    // Fibonacci: genau ein Puffer als Maschine, zwei Verteiler, ein Zusammenführer
    const fib = [...(SOLUTIONS['c35-5'] as { grid: Grid }).grid.values()];
    expect(fib.filter((p) => p.op).map((p) => p.op!.sym)).toEqual(['prev']);
    expect(fib.filter((p) => p.split)).toHaveLength(2);
    expect(fib.filter((p) => p.merge)).toHaveLength(1);
  });
  it('Endgegner: das letzte Kapitel, jede Musterlösung braucht mindestens drei verschiedene Bauteil-Arten, zusammen fast alle', () => {
    const boss = CHAPTERS[CHAPTERS.length - 1]!;
    expect(boss.id).toBe('c37');
    expect(boss.levels.length).toBeGreaterThanOrEqual(5);
    const kindsOf = (g: Grid) => new Set([...g.values()].map((p) => (p.op ? `op${p.op.sym}` : p.sort ? `sort${p.sort.kind}` : p.merge ? `merge${p.merge}` : p.split ? 'split' : p.alt ? 'alt' : p.bridge ? 'bridge' : 'belt')));
    const all = new Set<string>();
    for (const l of boss.levels) {
      expect(l.pro, l.id).toBe(true);
      const kinds = kindsOf((SOLUTIONS[l.id] as { grid: Grid }).grid);
      kinds.delete('belt');
      expect(kinds.size, l.id).toBeGreaterThanOrEqual(3);
      for (const k of kinds) all.add(k);
    }
    // Zähler, Sammler, Puffer, Quadrat, Wurzel, Quersumme, ×, +, Weichen (gerade, Quadratzahl), Wechsel-Weiche, Verteiler, Summe, Differenz, Produkt
    expect(all.size).toBeGreaterThanOrEqual(15);
    // ohne den Verteiler bzw. die Weiche geht es nicht: Band an ihrer Stelle verliert
    for (const l of boss.levels) {
      const g = new Map((SOLUTIONS[l.id] as { grid: Grid }).grid);
      for (const [k, p] of g) if (p.split || p.sort || p.alt) g.set(k, { op: null, dir: p.dir });
      expect(run(l, g).won, l.id).toBe(false);
    }
  });
  it('neue Bausteine: eindeutige Rätsel (mod, Quersumme, Wurzel)', () => {
    expect(chains(level('c14-4'), 1)).toEqual(['mod 7']);
    expect(chains(level('c14-5'), 2)).toEqual(['mod 6 ×9']);
    expect(chains(level('c15-4'), 2)).toEqual(['QS ×6']);
    expect(chains(level('c16-3'), 2)).toEqual(['√x ×7']);
    expect(chains(level('c13-5'), 3)).toEqual(['×5 x² +6']);
  });
  it('Zusammenführer: x · (x + 2) geht mit einer Maschine, ohne Zusammenführer nicht', () => {
    const l = level('c19-6');
    expect(chains(l, 1)).toEqual([]);
    expect(run(l, (SOLUTIONS['c19-6'] as { grid: Grid }).grid).won).toBe(true);
  });
  it('Zwei Quellen: geben gleichzeitig aus, so viele wie gebraucht werden', () => {
    expect(emitCount(level('c28-3'))).toBe(5);
    expect(emitCount(level('c19-1'))).toBe(5);
    expect(emitCount(level('c28-1'))).toBe(3);
    expect(emitCount(level('c2-1'))).toBe(3);
  });
  it('neue Maschinen rechnen richtig', () => {
    expect(apply(op('±'), 5)).toBe(-5);
    expect(apply(op('±'), 0)).toBe(0);
    expect(apply(op('|'), -7)).toBe(7);
    expect(apply(op('⇄'), 120)).toBe(21);
    expect(apply(op('⇄'), -123)).toBe(-321);
    expect(apply(op('≈', 1), 45)).toBe(50);
    expect(apply(op('≈', 1), 44)).toBe(40);
    expect(apply(op('≈', 2), 150)).toBe(200);
    expect(apply(op('≈', 1), -45)).toBe(-50);
    expect(apply(op('≈', 3), 400)).toBe(0);
  });
  it('Wechsel-Weiche: ohne sie geht 5, 5, 8, 8, 3, 3 nicht auf zwei Lager (Verteiler liefert doppelt)', () => {
    const l = level('c26-1');
    const g = new Map((SOLUTIONS['c26-1'] as { grid: Grid }).grid);
    g.set(key(2, 4), { op: null, dir: 3, split: true, side: 1 });
    expect(run(l, g).won).toBe(false);
  });
  it('Brücke: ohne Brücke kreuzen sich die Wege nicht (Band statt Brücke scheitert)', () => {
    const l = level('c20-1');
    const g = new Map((SOLUTIONS['c20-1'] as { grid: Grid }).grid);
    g.set(key(7, 3), { op: null, dir: 3 });
    expect(run(l, withFixed(l, g)).won).toBe(false);
  });
  it('vorgegebene Teile zählen nicht zum Teile-Ziel', () => {
    expect(isFixed(level('c6-1'), 5, 3)).toBe(true);
  });
  it('jedes Level gehört zu genau einem Kapitel', () => {
    for (const l of ALL_LEVELS) expect(chapterOf(l).levels).toContain(l);
  });
});
