import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core/anim';
import {
  canReduceBy,
  commonDenominator,
  commonNumerator,
  compare,
  denominatorName,
  equivalents,
  expand,
  fitsRow,
  gcd,
  isReduced,
  lcm,
  mixed,
  orderingTask,
  randomPair,
  reduce,
  reduceBy,
  reduceObstacle,
  reductionSteps,
  relationSign,
  sortAscending,
} from '../src/simulations/mathematik/brueche-vergleichen/model';

describe('Modell: Brüche erweitern, kürzen und vergleichen – Grundlagen', () => {
  it('berechnet ggT und kgV', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 13)).toBe(1);
    expect(gcd(0, 9)).toBe(9);
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(8, 5)).toBe(40);
    expect(lcm(12, 11)).toBe(132);
    for (let a = 1; a <= 30; a++) for (let b = 1; b <= 30; b++) expect(gcd(a, b) * lcm(a, b)).toBe(a * b);
  });

  it('kürzt vollständig', () => {
    expect(reduce(12, 18)).toEqual({ z: 2, n: 3 });
    expect(reduce(18, 12)).toEqual({ z: 3, n: 2 });
    expect(reduce(0, 7)).toEqual({ z: 0, n: 1 });
    expect(isReduced(2, 3)).toBe(true);
    expect(isReduced(6, 9)).toBe(false);
  });

  it('vergleicht exakt über Kreuz (auch knappe Fälle)', () => {
    expect(compare({ z: 3, n: 4 }, { z: 5, n: 6 })).toBe(-1);
    expect(compare({ z: 5, n: 8 }, { z: 3, n: 5 })).toBe(1);
    expect(compare({ z: 6, n: 8 }, { z: 9, n: 12 })).toBe(0);
    expect(compare({ z: 23, n: 12 }, { z: 21, n: 11 })).toBe(1);
    expect(relationSign(compare({ z: 1, n: 3 }, { z: 1, n: 2 }))).toBe('<');
  });

  it('macht gleichnamig mit dem Hauptnenner (kgV)', () => {
    expect(commonDenominator({ z: 3, n: 4 }, { z: 5, n: 6 })).toEqual({ n: 12, k1: 3, k2: 2 });
    expect(commonDenominator({ z: 2, n: 3 }, { z: 8, n: 12 })).toEqual({ n: 12, k1: 4, k2: 1 });
    const a = { z: 5, n: 8 };
    const b = { z: 3, n: 5 };
    const c = commonDenominator(a, b);
    expect(expand(a, c.k1)).toEqual({ z: 25, n: 40 });
    expect(expand(b, c.k2)).toEqual({ z: 24, n: 40 });
  });

  it('stellt gleiche Zähler her', () => {
    expect(commonNumerator({ z: 4, n: 9 }, { z: 6, n: 11 })).toEqual({ z: 12, k1: 3, k2: 2 });
    expect(commonNumerator({ z: 0, n: 5 }, { z: 2, n: 3 })).toBeNull();
  });

  it('prüft, ob man kürzen kann, und nennt den Grund', () => {
    const f = { z: 12, n: 18 };
    expect(canReduceBy(f, 2)).toBe(true);
    expect(canReduceBy(f, 6)).toBe(true);
    expect(canReduceBy(f, 4)).toBe(false);
    expect(reduceObstacle(f, 4)).toBe('nenner');
    expect(reduceObstacle({ z: 3, n: 12 }, 2)).toBe('zaehler');
    expect(reduceObstacle({ z: 5, n: 7 }, 3)).toBe('beide');
    expect(reduceBy(f, 3)).toEqual({ z: 4, n: 6 });
    expect(reductionSteps(f)).toEqual([2, 3]);
    expect(reductionSteps({ z: 36, n: 48 })).toEqual([2, 2, 3]);
  });

  it('findet gleichwertige Brüche und die passenden Zeilen der Bruchwand', () => {
    expect(equivalents({ z: 12, n: 18 }, 12)).toEqual([
      { z: 2, n: 3 },
      { z: 4, n: 6 },
      { z: 6, n: 9 },
      { z: 8, n: 12 },
    ]);
    expect(fitsRow({ z: 2, n: 3 }, 9)).toBe(6);
    expect(fitsRow({ z: 2, n: 3 }, 8)).toBeNull();
    expect(fitsRow({ z: 3, n: 2 }, 4)).toBe(6);
    expect(mixed({ z: 7, n: 4 })).toEqual({ whole: 1, rest: 3, n: 4 });
  });
});

describe('Modell: Namen der Bruchteile', () => {
  it('bildet deutsche Namen richtig', () => {
    expect(denominatorName(2, 3, 'de')).toBe('Halbe');
    expect(denominatorName(2, 1, 'de')).toBe('Halbes');
    expect(denominatorName(3, 2, 'de')).toBe('Drittel');
    expect(denominatorName(4, 2, 'de')).toBe('Viertel');
    expect(denominatorName(7, 2, 'de')).toBe('Siebtel');
    expect(denominatorName(8, 2, 'de')).toBe('Achtel');
    expect(denominatorName(12, 2, 'de')).toBe('Zwölftel');
    expect(denominatorName(16, 2, 'de')).toBe('Sechzehntel');
    expect(denominatorName(17, 2, 'de')).toBe('Siebzehntel');
    expect(denominatorName(20, 2, 'de')).toBe('Zwanzigstel');
    expect(denominatorName(21, 2, 'de')).toBe('Einundzwanzigstel');
    expect(denominatorName(36, 2, 'de')).toBe('Sechsunddreißigstel');
    expect(denominatorName(100, 2, 'de')).toBe('Hundertstel');
    expect(denominatorName(132, 2, 'de')).toBe('Hundertzweiunddreißigstel');
    expect(denominatorName(108, 2, 'de')).toBeNull();
  });

  it('bildet englische Namen richtig', () => {
    expect(denominatorName(2, 3, 'en')).toBe('halves');
    expect(denominatorName(4, 1, 'en')).toBe('quarter');
    expect(denominatorName(12, 5, 'en')).toBe('twelfths');
    expect(denominatorName(20, 2, 'en')).toBe('twentieths');
    expect(denominatorName(22, 2, 'en')).toBe('twenty-seconds');
    expect(denominatorName(40, 1, 'en')).toBe('fortieth');
  });
});

describe('Modell: Aufgaben zum Vergleichen und Ordnen', () => {
  it('erzeugt Bruchpaare mit verschiedenen Nennern', () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const [a, b] = randomPair(rand);
      expect(a.n).not.toBe(b.n);
      expect(a.z).toBeGreaterThan(0);
      expect(a.z).toBeLessThan(a.n);
      expect(lcm(a.n, b.n)).toBeLessThanOrEqual(60);
    }
  });

  it('erzeugt Brüche mit lauter verschiedenen Werten auf jeder Stufe', () => {
    const rand = seededRandom(42);
    for (const level of ['leicht', 'mittel', 'schwer'] as const) {
      for (let count = 3; count <= 6; count++) {
        for (let i = 0; i < 40; i++) {
          const list = orderingTask(level, count, rand);
          expect(list).toHaveLength(count);
          const values = new Set(list.map((f) => f.z / f.n));
          expect(values.size).toBe(count);
          for (const f of list) {
            expect(f.n).toBeGreaterThanOrEqual(2);
            expect(f.n).toBeLessThanOrEqual(12);
            expect(f.z).toBeGreaterThan(0);
            expect(f.z / f.n).toBeLessThan(2);
          }
          if (level === 'leicht') {
            const sameN = list.every((f) => f.n === list[0]!.n);
            const sameZ = list.every((f) => f.z === list[0]!.z);
            expect(sameN || sameZ).toBe(true);
          }
          if (level === 'mittel') for (const f of list) expect(f.z).toBeLessThan(f.n);
          if (level === 'schwer') expect(list.some((f) => f.z > f.n)).toBe(true);
        }
      }
    }
  });

  it('sortiert aufsteigend', () => {
    const sorted = sortAscending([
      { z: 3, n: 4 },
      { z: 1, n: 3 },
      { z: 5, n: 8 },
      { z: 3, n: 5 },
    ]);
    expect(sorted.map((f) => `${f.z}/${f.n}`)).toEqual(['1/3', '3/5', '5/8', '3/4']);
  });
});
