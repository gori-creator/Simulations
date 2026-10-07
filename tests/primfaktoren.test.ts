import { describe, expect, it } from 'vitest';
import {
  buildTree,
  digitSum,
  divisibilityChecks,
  divisors,
  factorPowers,
  gcd,
  isPrime,
  lcm,
  nodesOf,
  primeFactors,
  product,
  sharedFactors,
  sieve,
  splitOf,
  treeDepth,
} from '../src/simulations/mathematik/primfaktoren/model';
import { seededRandom } from '../src/sim-core/anim';

describe('Modell: Primfaktoren – Primzahlen und Zerlegung', () => {
  it('erkennt Primzahlen', () => {
    expect([1, 2, 3, 4, 9, 17, 51, 91, 97, 221].map(isPrime)).toEqual([false, true, true, false, false, true, false, false, true, false]);
  });

  it('zerlegt in Primfaktoren', () => {
    expect(primeFactors(360)).toEqual([2, 2, 2, 3, 3, 5]);
    expect(primeFactors(97)).toEqual([97]);
    expect(primeFactors(1)).toEqual([]);
    expect(factorPowers(360)).toEqual([
      { p: 2, e: 3 },
      { p: 3, e: 2 },
      { p: 5, e: 1 },
    ]);
    for (let n = 2; n <= 300; n++) {
      const f = primeFactors(n);
      expect(product(f)).toBe(n);
      expect(f.every(isPrime)).toBe(true);
    }
  });

  it('kennt Teiler, Quersumme, ggT und kgV', () => {
    expect(divisors(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
    expect(divisors(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
    expect(divisors(13)).toEqual([1, 13]);
    expect(digitSum(4527)).toBe(18);
    expect(gcd(24, 36)).toBe(12);
    expect(lcm(24, 36)).toBe(72);
    expect(gcd(8, 15)).toBe(1);
    expect(lcm(8, 15)).toBe(120);
  });
});

describe('Modell: Primfaktoren – Faktorbaum', () => {
  it('spaltet nach verschiedenen Strategien', () => {
    expect(splitOf(360, 'klein')).toEqual([2, 180]);
    expect(splitOf(360, 'mitte')).toEqual([18, 20]);
    expect(splitOf(49, 'mitte')).toEqual([7, 7]);
    expect(splitOf(13, 'klein')).toBeNull();
    expect(splitOf(2, 'mitte')).toBeNull();
  });

  it('endet immer bei denselben Primfaktoren', () => {
    const rand = seededRandom(3);
    for (const n of [12, 60, 360, 512, 840, 997, 999]) {
      for (const s of ['klein', 'mitte', 'zufall'] as const) {
        const leaves = nodesOf(buildTree(n, s, rand))
          .filter((x) => !x.children)
          .map((x) => x.value)
          .sort((a, b) => a - b);
        expect(leaves, `${n} ${s}`).toEqual(primeFactors(n));
      }
    }
  });

  it('hat eine passende Tiefe', () => {
    expect(treeDepth(buildTree(512, 'klein'))).toBe(8);
    expect(treeDepth(buildTree(512, 'mitte'))).toBeLessThanOrEqual(4);
    expect(treeDepth(buildTree(97, 'mitte'))).toBe(0);
  });
});

describe('Modell: Primfaktoren – Teilbarkeitsregeln', () => {
  it('prüft mit Endziffern und Quersumme', () => {
    const checks = Object.fromEntries(divisibilityChecks(360).map((c) => [c.divisor, c.divisible]));
    expect(checks).toEqual({ 2: true, 3: true, 4: true, 5: true, 6: true, 9: true, 10: true, 25: false });
    const c2 = Object.fromEntries(divisibilityChecks(4527).map((c) => [c.divisor, c.divisible]));
    expect(c2).toEqual({ 2: false, 3: true, 4: false, 5: false, 6: false, 9: true, 10: false, 25: false });
  });

  it('stimmt mit echter Teilbarkeit überein', () => {
    for (let n = 1; n <= 1000; n++) {
      for (const c of divisibilityChecks(n)) expect(c.divisible, `${n} : ${c.divisor}`).toBe(n % c.divisor === 0);
    }
  });
});

describe('Modell: Primfaktoren – Sieb und ggT/kgV', () => {
  it('findet die 25 Primzahlen bis 100', () => {
    const s = sieve(100);
    expect(s.primes).toHaveLength(25);
    expect(s.primes.slice(0, 6)).toEqual([2, 3, 5, 7, 11, 13]);
    expect(s.steps.map((x) => x.prime)).toEqual([2, 3, 5, 7]);
    expect(s.crossedBy[91]).toBe(7);
    expect(s.crossedBy[30]).toBe(2);
    expect(s.steps[1]!.already).toContain(6);
  });

  it('streicht jede zusammengesetzte Zahl mit ihrem kleinsten Primfaktor', () => {
    const s = sieve(200);
    for (let n = 2; n <= 200; n++) {
      if (isPrime(n)) expect(s.crossedBy[n]).toBe(0);
      else expect(s.crossedBy[n]).toBe(primeFactors(n)[0]);
    }
  });

  it('bestimmt gemeinsame Primfaktoren', () => {
    const f = sharedFactors(24, 36);
    expect(f).toEqual({ common: [2, 2, 3], onlyA: [2], onlyB: [3] });
    expect(product(f.common)).toBe(12);
    expect(product([...f.common, ...f.onlyA, ...f.onlyB])).toBe(72);
    for (const [a, b] of [
      [8, 15],
      [84, 90],
      [7, 49],
      [100, 75],
    ] as const) {
      const g = sharedFactors(a, b);
      expect(product(g.common)).toBe(gcd(a, b));
      expect(product([...g.common, ...g.onlyA, ...g.onlyB])).toBe(lcm(a, b));
    }
  });
});
