import { describe, expect, it } from 'vitest';
import {
  AFFINE_ID,
  anchors,
  asymptotes,
  base,
  BASE_KINDS,
  domainOf,
  effectOf,
  formFromPoint,
  fromAffine,
  inSet,
  keyPoints,
  mapAffine,
  mapPoint,
  randomTask,
  rangeOf,
  sameGraph,
  sineData,
  specialPoint,
  stageAffines,
  stages,
  neutralSteps,
  stepKeys,
  storyPlan,
  storyAt,
  storyDuration,
  storyPos,
  storyTimeOf,
  swappedResult,
  symmetryOf,
  toAffine,
  transformed,
  unmapPoint,
  withoutB,
  yIntercept,
  zerosIn,
  type Base,
  type Trafo,
} from '../src/simulations/mathematik/transformationen/model';

const BASES: Base[] = ['sq', 'cub', 'sqrt', 'abs', 'inv', 'sin', 'exp'];

describe('Modell: Graphen transformieren', () => {
  it('g(x) = 2 · (x − 1)² − 2: Scheitel S(1 | −2), Nullstellen 0 und 2', () => {
    const t: Trafo = { a: 2, b: 1, c: 1, d: -2 };
    expect(transformed('sq', t, 1)).toBe(-2);
    expect(transformed('sq', t, 0)).toBe(0);
    expect(transformed('sq', t, 2)).toBe(0);
    expect(mapPoint(t, 0, 0)).toEqual([1, -2]);
    expect(mapPoint(t, 1, 1)).toEqual([2, 0]);
  });
  it('Sinus: g(x) = 2 sin(2x) + 1 hat Periode π, Maximum 3 bei π/4', () => {
    const t: Trafo = { a: 2, b: 2, c: 0, d: 1 };
    expect(transformed('sin', t, Math.PI / 4)).toBeCloseTo(3, 12);
    expect(transformed('sin', t, 0.3)).toBeCloseTo(transformed('sin', t, 0.3 + Math.PI), 12);
    const [x, y] = mapPoint(t, Math.PI / 2, 1);
    expect(x).toBeCloseTo(Math.PI / 4, 12);
    expect(y).toBe(3);
  });
  it('Spiegelung der Wurzel an der y-Achse: √(−(x − 2)) ist nur für x ≤ 2 definiert', () => {
    const t: Trafo = { a: 1, b: -1, c: 2, d: 0 };
    expect(transformed('sqrt', t, -2)).toBe(2);
    expect(transformed('sqrt', t, 2)).toBe(0);
    expect(Number.isNaN(transformed('sqrt', t, 3))).toBe(true);
  });
  it('Asymptoten verschieben sich mit c und d', () => {
    expect(asymptotes('inv', { a: 2, b: 1, c: -1, d: 1 })).toEqual({ x: -1, y: 1 });
    expect(asymptotes('exp', { a: -1, b: 1, c: 1, d: 3 })).toEqual({ y: 3 });
    expect(asymptotes('sq', { a: 1, b: 1, c: 0, d: 0 })).toEqual({});
  });
  it('Bildpunkte liegen auf dem Bildgraphen (viele Zufallswerte)', () => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 200; i++) {
      const t: Trafo = { a: (rnd() - 0.5) * 6 || 1, b: (rnd() < 0.5 ? -1 : 1) * (0.2 + rnd() * 2.8), c: (rnd() - 0.5) * 10, d: (rnd() - 0.5) * 10 };
      for (const k of BASES) {
        for (const [x, y] of keyPoints(k)) {
          expect(base(k, x)).toBeCloseTo(y, 12);
          const [X, Y] = mapPoint(t, x, y);
          expect(transformed(k, t, X)).toBeCloseTo(Y, 9);
          const back = unmapPoint(t, X, Y);
          expect(back[0]).toBeCloseTo(x, 9);
          expect(back[1]).toBeCloseTo(y, 9);
        }
      }
    }
  });
  it('Schrittfolge: erst b, dann c, dann a, dann d', () => {
    const s = stages({ a: 2, b: 3, c: 1, d: -2 });
    expect(s.map((t) => [t.a, t.b, t.c, t.d])).toEqual([
      [1, 1, 0, 0],
      [1, 3, 0, 0],
      [1, 3, 1, 0],
      [2, 3, 1, 0],
      [2, 3, 1, -2],
    ]);
  });
});

/** reproduzierbarer Zufall */
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
const IDENTITY_T: Trafo = { a: 1, b: 1, c: 0, d: 0 };

describe('Prüfwerte der Leitung', () => {
  it('x²: g(x) = 2(x − 1)² − 2, Scheitel (1 | −2), g(0) = 0, Nullstellen 0 und 2, (2 | 4) ↦ (3 | 6)', () => {
    const t: Trafo = { a: 2, b: 1, c: 1, d: -2 };
    expect(specialPoint('sq', t)).toEqual({ kind: 'vertex', x: 1, y: -2 });
    expect(yIntercept('sq', t)).toBe(0);
    expect(zerosIn('sq', t)).toEqual([0, 2]);
    expect(mapPoint(t, 2, 4)).toEqual([3, 6]);
    expect(transformed('sq', t, 3)).toBe(6);
    expect(symmetryOf('sq', t)).toEqual({ axis: 1 });
    expect(rangeOf('sq', t)).toEqual({ kind: 'interval', lo: -2, hi: Infinity, loIn: true, hiIn: false });
  });
  it('Sinus: a = 2, b = 2, d = 1 → Periode π, Amplitude 2, Wertemenge [−1; 3]', () => {
    const t: Trafo = { a: 2, b: 2, c: 0, d: 1 };
    const s = sineData(t);
    expect(s.period).toBeCloseTo(Math.PI, 12);
    expect(s.amplitude).toBe(2);
    expect(s.midline).toBe(1);
    expect(rangeOf('sin', t)).toEqual({ kind: 'interval', lo: -1, hi: 3, loIn: true, hiIn: true });
    // Nullstellen von 2 sin(2x) + 1 in [0; π]: sin(2x) = −0,5 → 2x = 7π/6 bzw. 11π/6
    const z = zerosIn('sin', t, 0, Math.PI) as number[];
    expect(z).toHaveLength(2);
    expect(z[0]).toBeCloseTo((7 * Math.PI) / 12, 12);
    expect(z[1]).toBeCloseTo((11 * Math.PI) / 12, 12);
    for (const x of z) expect(transformed('sin', t, x)).toBeCloseTo(0, 12);
  });
  it('Wurzel: a = 1, b = −1, c = 2 → g(x) = √(2 − x), D: x ≤ 2, g(−2) = 2', () => {
    const t: Trafo = { a: 1, b: -1, c: 2, d: 0 };
    const D = domainOf('sqrt', t);
    expect(D).toEqual({ kind: 'interval', lo: -Infinity, hi: 2, loIn: false, hiIn: true });
    expect(inSet(D, 2)).toBe(true);
    expect(inSet(D, 2.01)).toBe(false);
    expect(transformed('sqrt', t, -2)).toBe(2);
    for (const x of [-5, -1, 0, 1.5]) expect(transformed('sqrt', t, x)).toBeCloseTo(Math.sqrt(2 - x), 12);
    expect(zerosIn('sqrt', t)).toEqual([2]);
    expect(withoutB('sqrt', t)).toBeNull();
  });
  it('Hyperbel: g(x) = 2/(x + 1) + 1, Asymptoten x = −1 und y = 1, Nullstelle −3', () => {
    const t: Trafo = { a: 2, b: 1, c: -1, d: 1 };
    expect(transformed('inv', t, 1)).toBe(2);
    expect(asymptotes('inv', t)).toEqual({ x: -1, y: 1 });
    expect(zerosIn('inv', t)).toEqual([-3]);
    expect(domainOf('inv', t)).toEqual({ kind: 'except', x: -1 });
    expect(rangeOf('inv', t)).toEqual({ kind: 'except', x: 1 });
    expect(Number.isNaN(transformed('inv', t, -1))).toBe(true);
    expect(symmetryOf('inv', t)).toEqual({ center: [-1, 1] });
  });
  it('Exponentialfunktion: g(x) = −2^(x − 1) + 3, Asymptote y = 3, Nullstelle 1 + log₂ 3 ≈ 2,585', () => {
    const t: Trafo = { a: -1, b: 1, c: 1, d: 3 };
    expect(asymptotes('exp', t)).toEqual({ y: 3 });
    const z = zerosIn('exp', t) as number[];
    expect(z).toHaveLength(1);
    expect(z[0]).toBeCloseTo(1 + Math.log2(3), 12);
    expect(z[0]).toBeCloseTo(2.585, 3);
    expect(transformed('exp', t, z[0]!)).toBeCloseTo(0, 12);
    expect(rangeOf('exp', t)).toEqual({ kind: 'interval', lo: -Infinity, hi: 3, loIn: false, hiIn: false });
    expect(yIntercept('exp', t)).toBeCloseTo(2.5, 12);
  });
  it('Reihenfolge: (2(x − 1))² hat den Scheitel bei 1, (2x − 1)² bei 0,5', () => {
    const t: Trafo = { a: 1, b: 2, c: 1, d: 0 };
    const g = toAffine(t);
    const right = stageAffines(g, 'std')[4]!;
    const wrong = stageAffines(g, 'swap')[4]!;
    expect(mapAffine(right, 0, 0)).toEqual([1, 0]);
    expect(mapAffine(wrong, 0, 0)).toEqual([0.5, 0]);
    // f(bx − c) in Standardform: c/b
    expect(swappedResult(t)).toEqual({ a: 1, b: 2, c: 0.5, d: 0 });
    const h = fromAffine(wrong);
    for (const x of [-1, 0, 0.3, 2]) expect(transformed('sq', h, x)).toBeCloseTo((2 * x - 1) ** 2, 12);
    for (const x of [-1, 0, 0.3, 2]) expect(transformed('sq', fromAffine(right), x)).toBeCloseTo((2 * (x - 1)) ** 2, 12);
    expect(stepKeys('std')).toEqual(['b', 'c', 'a', 'd']);
    expect(stepKeys('swap')).toEqual(['c', 'b', 'a', 'd']);
  });
  it('Zwischenstufen enden genau bei g (alle Grundfunktionen, Zufallswerte)', () => {
    const rnd = lcg(11);
    for (let i = 0; i < 100; i++) {
      const t: Trafo = { a: Math.round((rnd() - 0.5) * 60) / 10, b: (rnd() < 0.5 ? -1 : 1) * (0.1 + Math.round(rnd() * 29) / 10), c: Math.round((rnd() - 0.5) * 100) / 10, d: Math.round((rnd() - 0.5) * 100) / 10 };
      const st = stageAffines(toAffine(t), 'std');
      expect(st[0]).toEqual(AFFINE_ID);
      const end = fromAffine(st[4]!);
      expect(end.a).toBe(t.a);
      expect(end.b).toBeCloseTo(t.b, 12);
      expect(end.c).toBe(t.c);
      expect(end.d).toBe(t.d);
      // die Trafo-Stufen und die affinen Stufen stimmen überein
      stages(t).forEach((s, k) => {
        const A = toAffine(s);
        const B = st[k]!;
        expect(A.a).toBeCloseTo(B.a, 12);
        expect(A.s).toBeCloseTo(B.s, 12);
        expect(A.h).toBeCloseTo(B.h, 12);
        expect(A.d).toBeCloseTo(B.d, 12);
      });
      for (const k of BASE_KINDS) {
        for (const [u, v] of keyPoints(k)) {
          const [X, Y] = mapAffine(st[4]!, u, v);
          const [X2, Y2] = mapPoint(t, u, v);
          expect(X).toBeCloseTo(X2, 9);
          expect(Y).toBeCloseTo(Y2, 9);
        }
      }
      // storyAt an ganzzahligen Stellen = Stufen
      for (let k = 0; k <= 4; k++) {
        const A = storyAt(toAffine(t), 'std', k).A;
        expect(A.s).toBeCloseTo(st[k]!.s, 12);
        expect(A.h).toBeCloseTo(st[k]!.h, 12);
      }
    }
  });
  it('unmapPoint(mapPoint(P)) = P für Zufallswerte', () => {
    const rnd = lcg(3);
    for (let i = 0; i < 500; i++) {
      const t: Trafo = { a: (rnd() < 0.5 ? -1 : 1) * (0.1 + rnd() * 2.9), b: (rnd() < 0.5 ? -1 : 1) * (0.1 + rnd() * 2.9), c: (rnd() - 0.5) * 10, d: (rnd() - 0.5) * 10 };
      const x = (rnd() - 0.5) * 20;
      const y = (rnd() - 0.5) * 20;
      const [X, Y] = mapPoint(t, x, y);
      const [u, v] = unmapPoint(t, X, Y);
      expect(u).toBeCloseTo(x, 9);
      expect(v).toBeCloseTo(y, 9);
    }
  });
});

describe('Schrittfolge und Zeitleiste', () => {
  it('Zeitleiste: Pausen nach jeder Stufe, Anfang 0, Ende 4', () => {
    expect(storyPos(0)).toBe(0);
    expect(storyPos(-1)).toBe(0);
    expect(storyPos(storyDuration())).toBe(4);
    expect(storyPos(storyDuration() + 5)).toBe(4);
    for (let k = 1; k <= 3; k++) {
      // nach jeder Stufe kurz stehen bleiben
      expect(storyPos(storyTimeOf(k))).toBeCloseTo(k, 9);
      expect(storyPos(storyTimeOf(k) - 0.3)).toBeCloseTo(k, 9);
    }
    let last = 0;
    for (let t = 0; t <= storyDuration(); t += 0.05) {
      const v = storyPos(t);
      expect(v).toBeGreaterThanOrEqual(last - 1e-12);
      last = v;
    }
    // Umkehrung auch mitten in einer Stufe
    expect(storyPos(storyTimeOf(2.37))).toBeCloseTo(2.37, 6);
  });
  it('Vertauschte Reihenfolge: Strecken nach dem Verschieben verkleinert die Verschiebung auf c/b', () => {
    const g = toAffine({ a: 1, b: 2, c: 1, d: 0 });
    const st = stageAffines(g, 'swap');
    expect(mapAffine(st[1]!, 0, 0)).toEqual([1, 0]);
    expect(mapAffine(st[2]!, 0, 0)).toEqual([0.5, 0]);
    // zwischen Stufe 1 und 2 bleibt der Scheitel auf h = c·s (Streckung an der y-Achse)
    for (const tl of [1.2, 1.5, 1.8]) {
      const A = storyAt(g, 'swap', tl).A;
      expect(A.h).toBeCloseTo(1 * A.s, 12);
    }
  });
  it('Spiegelung b < 0 als Umklappen: s läuft durch 0, ohne zu teilen', () => {
    const g = toAffine({ a: 1, b: -1, c: 2, d: 0 });
    const mid = storyAt(g, 'std', 0.5);
    expect(mid.stage).toBe(0);
    expect(mid.A.s).toBeCloseTo(0, 12);
    expect(mapAffine(mid.A, 4, 2)).toEqual([0, 2]);
  });
});

describe('Wirkung der Parameter', () => {
  it('b = 2: in x-Richtung auf die Hälfte gestaucht; b = −0,5: mit 2 gestreckt und gespiegelt', () => {
    expect(effectOf('b', { a: 1, b: 2, c: 0, d: 0 })).toEqual({ key: 'b', kind: 'squash', amount: 0.5, mirror: false });
    expect(effectOf('b', { a: 1, b: -0.5, c: 0, d: 0 })).toEqual({ key: 'b', kind: 'stretch', amount: 2, mirror: true });
    expect(effectOf('b', { a: 1, b: -1, c: 0, d: 0 }).kind).toBe('mirror');
    expect(effectOf('b', IDENTITY_T).kind).toBe('none');
  });
  it('a: Streckung, Stauchung, Spiegelung, a = 0', () => {
    expect(effectOf('a', { a: 3, b: 1, c: 0, d: 0 })).toEqual({ key: 'a', kind: 'stretch', amount: 3, mirror: false });
    expect(effectOf('a', { a: -0.5, b: 1, c: 0, d: 0 })).toEqual({ key: 'a', kind: 'squash', amount: 0.5, mirror: true });
    expect(effectOf('a', { a: 0, b: 1, c: 0, d: 0 }).kind).toBe('zero');
  });
  it('c und d: Richtung und Betrag', () => {
    expect(effectOf('c', { a: 1, b: 1, c: -2.5, d: 0 })).toEqual({ key: 'c', kind: 'left', amount: 2.5, mirror: false });
    expect(effectOf('d', { a: 1, b: 1, c: 0, d: 4 })).toEqual({ key: 'd', kind: 'up', amount: 4, mirror: false });
    expect(effectOf('d', { a: 1, b: 1, c: 0, d: 0 }).kind).toBe('none');
  });
});

describe('Sonderfälle und Eigenschaften', () => {
  it('a = 0: konstante Funktion y = d', () => {
    const t: Trafo = { a: 0, b: 2, c: 1, d: 1.5 };
    for (const k of ['sq', 'cub', 'abs', 'sin', 'exp'] as Base[]) expect(transformed(k, t, 0.7)).toBe(1.5);
    expect(rangeOf('sq', t)).toEqual({ kind: 'point', x: 1.5 });
    expect(zerosIn('sq', t)).toEqual([]);
    expect(zerosIn('sq', { ...t, d: 0 })).toBe('all');
    expect(symmetryOf('sq', t)).toEqual({});
  });
  it('Parabel: b wirkt wie b² vor f, (2x)² = 4x²', () => {
    const t: Trafo = { a: 1, b: 2, c: 1, d: -1 };
    const w = withoutB('sq', t)!;
    expect(w).toEqual({ a: 4, b: 1, c: 1, d: -1 });
    expect(sameGraph('sq', t, w)).toBe(true);
    expect(sameGraph('abs', { a: 1, b: -3, c: 0, d: 0 }, { a: 3, b: 1, c: 0, d: 0 })).toBe(true);
    expect(sameGraph('cub', { a: 1, b: 2, c: 0, d: 0 }, withoutB('cub', { a: 1, b: 2, c: 0, d: 0 })!)).toBe(true);
    expect(sameGraph('inv', { a: 2, b: 4, c: 0, d: 0 }, { a: 0.5, b: 1, c: 0, d: 0 })).toBe(true);
    expect(sameGraph('sin', { a: 1, b: 2, c: 0, d: 0 }, { a: 4, b: 1, c: 0, d: 0 })).toBe(false);
    expect(withoutB('sin', t)).toBeNull();
  });
  it('Exponentialfunktion: Verschieben in x-Richtung ist Strecken in y-Richtung', () => {
    expect(sameGraph('exp', { a: 1, b: 1, c: 1, d: 0 }, { a: 0.5, b: 1, c: 0, d: 0 })).toBe(true);
  });
  it('Nullstellen liegen auf dem Graphen (alle Grundfunktionen, Zufallswerte)', () => {
    const rnd = lcg(29);
    for (let i = 0; i < 300; i++) {
      const t: Trafo = { a: (rnd() < 0.5 ? -1 : 1) * (0.1 + Math.round(rnd() * 29) / 10), b: (rnd() < 0.5 ? -1 : 1) * (0.1 + Math.round(rnd() * 29) / 10), c: Math.round((rnd() - 0.5) * 100) / 10, d: Math.round((rnd() - 0.5) * 100) / 10 };
      for (const k of BASE_KINDS) {
        const z = zerosIn(k, t, -30, 30);
        expect(z).not.toBe('all');
        for (const x of z as number[]) {
          expect(inSet(domainOf(k, t), x)).toBe(true);
          expect(Math.abs(transformed(k, t, x))).toBeLessThan(1e-7 * Math.max(1, Math.abs(t.d)));
        }
      }
    }
  });
  it('Wertemenge enthält die Funktionswerte (Stichprobe)', () => {
    const rnd = lcg(5);
    for (let i = 0; i < 100; i++) {
      const t: Trafo = { a: (rnd() < 0.5 ? -1 : 1) * (0.1 + rnd() * 2.9), b: (rnd() < 0.5 ? -1 : 1) * (0.1 + rnd() * 2.9), c: (rnd() - 0.5) * 10, d: (rnd() - 0.5) * 10 };
      for (const k of BASE_KINDS) {
        const W = rangeOf(k, t);
        const D = domainOf(k, t);
        for (let j = 0; j < 40; j++) {
          const x = (rnd() - 0.5) * 16;
          const y = transformed(k, t, x);
          expect(Number.isFinite(y)).toBe(inSet(D, x));
          if (Number.isFinite(y) && W.kind === 'interval') {
            expect(y).toBeGreaterThanOrEqual(W.lo - 1e-9);
            expect(y).toBeLessThanOrEqual(W.hi + 1e-9);
          }
        }
      }
    }
  });
  it('Formpunkt ziehen: aus der Lage des Bildes von p1 folgen a und b', () => {
    const t: Trafo = { a: 2, b: 0.5, c: 1, d: -2 };
    for (const k of BASE_KINDS) {
      const [u1, v1] = anchors(k).p1;
      const [X, Y] = mapPoint(t, u1, v1);
      const r = formFromPoint(k, t.c, t.d, X, Y);
      expect(r.a).toBeCloseTo(2, 12);
      expect(r.b).toBeCloseTo(0.5, 12);
      // Ankerpunkt ist immer der Ursprung, sein Bild (c | d)
      const [u0, v0] = anchors(k).p0;
      expect(mapPoint(t, u0, v0)).toEqual([1, -2]);
    }
    expect(formFromPoint('sq', 1, 0, 1, 3).b).toBeNull();
  });
  it('Aufgaben „Term erraten“: gültige Werte, nicht die Grundfunktion, eindeutig ablesbar', () => {
    const rnd = lcg(42);
    for (const k of BASE_KINDS) {
      for (let i = 0; i < 60; i++) {
        const t = randomTask(k, rnd);
        expect(t.a).not.toBe(0);
        expect(t.b).not.toBe(0);
        expect(Math.abs(t.a)).toBeLessThanOrEqual(3);
        expect(Math.abs(t.b)).toBeLessThanOrEqual(3);
        expect(Math.abs(t.c)).toBeLessThanOrEqual(5);
        expect(Math.abs(t.d)).toBeLessThanOrEqual(5);
        expect(sameGraph(k, t, IDENTITY_T)).toBe(false);
        // wo b wie ein Faktor vor f wirkt, bleibt b = 1
        if (withoutB(k, t) && k !== 'sqrt') expect(t.b).toBe(1);
        if (k === 'sqrt') expect(Math.abs(t.b)).toBe(1);
        if (k === 'sin' || k === 'exp') expect(t.c).toBe(0);
      }
    }
  });
});

describe('Zeitplan mit Stufen ohne Wirkung', () => {
  it('neutrale Stufen (b = 1, c = 0, …) laufen kürzer, ganze Stufen bleiben exakt', () => {
    const t: Trafo = { a: 2, b: 1, c: 1, d: -2 };
    const n = neutralSteps(t);
    expect(n).toEqual([true, false, false, false]);
    expect(neutralSteps(t, 'swap')).toEqual([false, true, false, false]);
    const plan = storyPlan(n);
    expect(storyDuration(plan)).toBeLessThan(storyDuration());
    expect(storyPos(0, plan)).toBe(0);
    expect(storyPos(storyDuration(plan), plan)).toBe(4);
    for (let k = 1; k <= 3; k++) expect(storyPos(storyTimeOf(k, plan), plan)).toBeCloseTo(k, 9);
    expect(storyPos(storyTimeOf(1.5, plan), plan)).toBeCloseTo(1.5, 6);
  });
});

describe('Prüfrunde Paket 3: Definitions- und Wertemengen, Bildpunkte, Reihenfolge', () => {
  it('Wurzel: D und W je nach Vorzeichen von a und b (Randpunkt (c | d) gehört dazu)', () => {
    // g(x) = −2 · √(−(x + 1)) + 3: D = ]−∞; −1], W = ]−∞; 3]
    const t: Trafo = { a: -2, b: -1, c: -1, d: 3 };
    expect(domainOf('sqrt', t)).toEqual({ kind: 'interval', lo: -Infinity, hi: -1, loIn: false, hiIn: true });
    expect(rangeOf('sqrt', t)).toEqual({ kind: 'interval', lo: -Infinity, hi: 3, loIn: false, hiIn: true });
    expect(transformed('sqrt', t, -1)).toBe(3);
    expect(Number.isNaN(transformed('sqrt', t, -0.9))).toBe(true);
    // Nullstelle: √(−(x + 1)) = 1,5 ⇒ x = −1 − 2,25 = −3,25
    expect(zerosIn('sqrt', t)).toEqual([-3.25]);
    expect(withoutB('sqrt', t)).toBeNull();
  });
  it('Exponentialfunktion: Wertemenge offen, die Asymptote y = d gehört nicht dazu', () => {
    const t: Trafo = { a: -1, b: 1, c: 1, d: 3 };
    const W = rangeOf('exp', t);
    expect(W).toEqual({ kind: 'interval', lo: -Infinity, hi: 3, loIn: false, hiIn: false });
    expect(inSet(W, 3)).toBe(false);
    expect(inSet(W, 2.999)).toBe(true);
    expect(asymptotes('exp', t)).toEqual({ y: 3 });
  });
  it('Hyperbel: D = ℝ \\ {c}, W = ℝ \\ {d}, auch bei b < 0', () => {
    const t: Trafo = { a: 1, b: -2, c: 2, d: -1 };
    expect(domainOf('inv', t)).toEqual({ kind: 'except', x: 2 });
    expect(rangeOf('inv', t)).toEqual({ kind: 'except', x: -1 });
    // 1/(−2(x − 2)) − 1 = 0 ⇒ −2(x − 2) = 1 ⇒ x = 1,5
    expect(zerosIn('inv', t)).toEqual([1.5]);
    expect(transformed('inv', t, 1.5)).toBeCloseTo(0, 12);
  });
  it('Bildpunkt (x/b + c | a·y + d) mit b = 3 und a < 0 liegt auf g', () => {
    const t: Trafo = { a: -0.5, b: 3, c: -1, d: 2 };
    const [X, Y] = mapPoint(t, 3, 9);
    expect(X).toBeCloseTo(0, 12); // 3/3 − 1
    expect(Y).toBeCloseTo(-2.5, 12); // −0,5 · 9 + 2
    expect(transformed('sq', t, X)).toBeCloseTo(Y, 12);
  });
  it('Vertauschte Reihenfolge: (2x − 4)² ist um 2, nicht um 4 verschoben', () => {
    const t: Trafo = { a: 1, b: 2, c: 4, d: 0 };
    const h = swappedResult(t);
    expect(h.c).toBe(2);
    const st = stageAffines(toAffine(t), 'swap');
    expect(st[4]!.h).toBe(2);
    for (const x of [-1, 0, 1.5, 3]) expect(transformed('sq', h, x)).toBeCloseTo((2 * x - 4) ** 2, 12);
  });
  it('Sinus: Nullstellen in einer Periode ab c (Anzeige in der Karte)', () => {
    // 2 sin(2x) + 1 = 0 ⇒ sin(2x) = −1/2 ⇒ x = 7π/12, 11π/12
    const t: Trafo = { a: 2, b: 2, c: 0, d: 1 };
    const z = zerosIn('sin', t, 0, Math.PI - 1e-9) as number[];
    expect(z).toHaveLength(2);
    expect(z[0]).toBeCloseTo((7 * Math.PI) / 12, 12);
    expect(z[1]).toBeCloseTo((11 * Math.PI) / 12, 12);
  });
});
