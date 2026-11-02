import { describe, expect, it } from 'vitest';
import { seeded } from '../src/kurse/engine/dom';
import { episode, greedyPath, newQ, parseWorld } from '../src/kurse/gemeinsam/models/gitterwelt';
import { bubble, mix, startWeights, watch } from '../src/kurse/ki-abenteuer/models/feed';
import { assign, FRUITS, moveFlags, pure, START_FLAGS } from '../src/kurse/ki-abenteuer/models/kmeans';
import { side } from '../src/kurse/ki-abenteuer/models/linie';
import { bitTake, learn, newBoxes, practiceGame, smartShare } from '../src/kurse/ki-abenteuer/models/menace';
import { groupAt, KNOWN, NEW_WORDS } from '../src/kurse/ki-abenteuer/models/wortkarte';

/** Neue Lektionen im KI-Abenteuer. */
describe('k-Means', () => {
  it('findet die drei Fruchtsorten', () => {
    let flags = START_FLAGS.map((f) => ({ ...f }));
    let groups = assign(FRUITS, flags);
    for (let k = 0; k < 10; k++) {
      flags = moveFlags(FRUITS, groups, flags);
      const next = assign(FRUITS, flags);
      if (next.every((g, i) => g === groups[i])) break;
      groups = next;
    }
    expect(pure(groups)).toBe(true);
  });
});

describe('MENACE', () => {
  it('lernt durch Übung den klugen Zug', () => {
    let boxes = newBoxes();
    const before = smartShare(boxes);
    const rnd = seeded(5);
    for (let k = 0; k < 200; k++) boxes = practiceGame(boxes, rnd).boxes;
    expect(smartShare(boxes)).toBeGreaterThan(before + 0.2);
  });

  it('Belohnen und Bestrafen ändert die Perlen, nie unter 1', () => {
    const b = learn(newBoxes(), [{ sticks: 5, take: 2 }], true);
    expect(b[5]).toEqual([3, 4]);
    let c = newBoxes();
    for (let k = 0; k < 10; k++) c = learn(c, [{ sticks: 5, take: 1 }], false);
    expect(c[5]![0]).toBe(1);
    expect(bitTake(newBoxes(), 1, seeded(1))).toBe(1);
  });
});

describe('Feed', () => {
  it('Anschauen macht ein Thema immer stärker (Filterblase), Vielfalt bremst', () => {
    let w = startWeights();
    for (let k = 0; k < 6; k++) w = watch(w, 'tiere');
    expect(bubble(w, 0)).toBeGreaterThan(0.6);
    expect(bubble(w, 0.5)).toBeLessThan(bubble(w, 0));
    const m = mix(w, 0.3);
    expect(Object.values(m).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
});

describe('Wörter-Landkarte', () => {
  it('neue Wörter liegen in ihrer Gruppe', () => {
    for (const w of NEW_WORDS) expect(groupAt(w.x, w.y), w.id).toBe(w.group);
    for (const w of KNOWN) expect(groupAt(w.x, w.y)).toBe(w.group);
  });
});

describe('Neuronen im Team', () => {
  it('drei Zäune können alle Schafe einschließen und alle Wölfe aussperren', () => {
    const sheep = [{ x: 5, y: 5 }, { x: 4.5, y: 5.5 }, { x: 5.6, y: 5.4 }, { x: 4.8, y: 4.2 }, { x: 5.4, y: 4.5 }, { x: 4.4, y: 4.8 }, { x: 5.2, y: 6.1 }, { x: 5.9, y: 4.8 }];
    const wolves = [{ x: 1.5, y: 8.5 }, { x: 5, y: 9 }, { x: 8.6, y: 8.2 }, { x: 9, y: 5 }, { x: 8.4, y: 1.6 }, { x: 5, y: 1.2 }, { x: 1.4, y: 1.8 }, { x: 1, y: 5 }, { x: 2.6, y: 7.6 }, { x: 7.3, y: 7 }, { x: 7.2, y: 3 }, { x: 2.8, y: 3 }];
    // Dreieck um die Schafe
    const fences = [
      [{ x: 3.3, y: 3.9 }, { x: 6.6, y: 3.9 }],
      [{ x: 3.3, y: 3.9 }, { x: 5.1, y: 7.0 }],
      [{ x: 6.6, y: 3.9 }, { x: 5.1, y: 7.0 }],
    ] as const;
    const center = { x: 5, y: 5 };
    const inside = (p: { x: number; y: number }) => fences.every(([a, b]) => side(a, b, p) * side(a, b, center) > 0);
    for (const s of sheep) expect(inside(s)).toBe(true);
    for (const w of wolves) expect(inside(w)).toBe(false);
  });
});

describe('Labyrinth', () => {
  it('Bit findet nach einigen Runden den kürzesten Weg zum Keks', () => {
    const world = parseWorld(['S..#.', '.#...', '.#.#.', '...#.', '#.F.K'], { K: 10, F: -10 });
    const q = newQ(world);
    const rnd = seeded(11);
    let rounds = 0;
    for (; rounds < 300; rounds++) {
      episode(world, q, 0.5, 0.9, 0.2, rnd, 200);
      const path = greedyPath(world, q);
      if (path.at(-1) === 24 && path.length - 1 === 8) break;
    }
    expect(rounds).toBeLessThan(300);
  });
});
