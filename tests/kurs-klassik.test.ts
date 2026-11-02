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

import { seeded } from '../src/kurse/engine/dom';
import { connected, monteCarlo, neighbours as hexNeighbours, playout, SIZE, winnerOf, type Stone } from '../src/kurse/ki-labor/models/hex';
import { MAP, manhattan, parseMap, runSearch } from '../src/kurse/ki-labor/models/suche';
import { decide, heuristic, winner, type Board } from '../src/kurse/ki-labor/models/tictactoe';

describe('Wegsuche', () => {
  const g = parseMap(MAP);
  const r = Object.fromEntries((['bfs', 'dfs', 'greedy', 'astar'] as const).map((a) => [a, runSearch(g, a)]));
  const len = (a: string) => r[a]!.path.length - 1;

  it('Breitensuche und A* finden den kürzesten Weg', () => {
    expect(len('astar')).toBe(len('bfs'));
    expect(len('dfs')).toBeGreaterThan(len('bfs'));
    expect(len('greedy')).toBeGreaterThan(len('bfs'));
  });

  it('A* untersucht deutlich weniger Felder als die Breitensuche', () => {
    expect(r.astar!.expanded.length).toBeLessThan(0.6 * r.bfs!.expanded.length);
  });

  it('Wege sind zusammenhängend und meiden Mauern', () => {
    for (const run of Object.values(r)) {
      expect(run.path[0]).toBe(g.start);
      expect(run.path.at(-1)).toBe(g.goal);
      for (let k = 1; k < run.path.length; k++) expect(manhattan({ ...g, goal: run.path[k]! }, run.path[k - 1]!)).toBe(1);
      for (const i of run.path) expect(g.walls.has(i)).toBe(false);
    }
  });
});

describe('Tic-Tac-Toe', () => {
  const empty = (): Board => Array(9).fill(null);

  it('vollständiger Spielbaum vom leeren Brett: 549 946 Knoten', () => {
    expect(decide(empty(), 9, false).nodes).toBe(549946);
  });

  it('Alpha-Beta: gleiches Ergebnis, viel weniger Knoten', () => {
    const b = empty();
    b[0] = 'X';
    const plain = decide(b, 9, false);
    const ab = decide(b, 9, true);
    expect(ab.best).toBe(plain.best);
    expect(ab.value).toBe(plain.value);
    expect(ab.nodes).toBeLessThan(plain.nodes / 5);
    // Auf eine Ecke antwortet die volle Suche mit der Mitte (alles andere verliert)
    expect(plain.best).toBe(4);
    expect(plain.value).toBe(0);
  });

  it('blockt eine Zweier-Reihe bei voller Suche', () => {
    const b = empty();
    b[0] = 'X';
    b[4] = 'O';
    b[1] = 'X';
    expect(decide(b, 9, true).best).toBe(2);
  });

  it('Bewertung und Gewinner', () => {
    expect(heuristic(empty())).toBe(0);
    const b = empty();
    b[4] = 'O';
    expect(heuristic(b)).toBe(4);
    expect(winner(['O', 'O', 'O', null, null, null, null, null, null])).toBe('O');
  });
});

describe('Hex und Monte-Carlo', () => {
  it('Nachbarn im Rautenbrett', () => {
    expect(hexNeighbours(0).sort((a, b) => a - b)).toEqual([1, 5]);
    expect(hexNeighbours(12)).toHaveLength(6);
  });

  it('volles Brett: genau einer gewinnt', () => {
    const rnd = seeded(3);
    for (let k = 0; k < 50; k++) {
      const winnerSide = playout(Array(SIZE * SIZE).fill(null), 'blue', rnd);
      expect(['blue', 'orange']).toContain(winnerSide);
    }
  });

  it('erkennt Verbindungen', () => {
    const b: Stone[] = Array(SIZE * SIZE).fill(null);
    for (let c = 0; c < SIZE; c++) b[2 * SIZE + c] = 'blue';
    expect(connected(b, 'blue')).toBe(true);
    expect(winnerOf(b)).toBe('blue');
    expect(connected(b, 'orange')).toBe(false);
  });

  it('Siegquoten: sofortiger Gewinnzug hat 100 %', () => {
    // Orange fehlt genau ein Stein zur Verbindung oben–unten (Zeile 4: Feld 21 oder 22)
    const b: Stone[] = Array(SIZE * SIZE).fill(null);
    for (let r = 0; r < SIZE - 1; r++) b[r * SIZE + 2] = 'orange';
    const res = monteCarlo(b, 50, seeded(1));
    expect(res.rates.get(4 * SIZE + 2)).toBe(1);
    expect(res.rates.get(4 * SIZE + 1)).toBe(1);
    expect(res.rates.get(res.best)).toBe(1);
    expect(res.games).toBe(50 * (SIZE * SIZE - 4));
  });
});
