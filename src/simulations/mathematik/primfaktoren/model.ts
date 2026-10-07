/**
 * Rechenlogik „Primfaktorzerlegung und Teilbarkeit“: Primzahlen, Faktorbäume,
 * Teilbarkeitsregeln, Sieb des Eratosthenes sowie ggT und kgV über
 * gemeinsame Primfaktoren.
 */

/** Ist n eine Primzahl? (1 ist keine Primzahl.) */
export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

/** Kleinster Primfaktor (für n ≥ 2). */
export function smallestPrimeFactor(n: number): number {
  if (n % 2 === 0) return 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return d;
  return n;
}

/** Primfaktoren mit Vielfachheit, aufsteigend: 360 → [2, 2, 2, 3, 3, 5]. */
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let rest = n;
  while (rest > 1) {
    const p = smallestPrimeFactor(rest);
    out.push(p);
    rest /= p;
  }
  return out;
}

/** Potenzschreibweise: 360 → [{p: 2, e: 3}, {p: 3, e: 2}, {p: 5, e: 1}]. */
export function factorPowers(n: number): { p: number; e: number }[] {
  const out: { p: number; e: number }[] = [];
  for (const p of primeFactors(n)) {
    const last = out[out.length - 1];
    if (last && last.p === p) last.e++;
    else out.push({ p, e: 1 });
  }
  return out;
}

/** Alle Teiler, aufsteigend. */
export function divisors(n: number): number[] {
  const small: number[] = [];
  const large: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      small.push(d);
      if (d * d !== n) large.unshift(n / d);
    }
  }
  return [...small, ...large];
}

export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

/** Quersumme. */
export function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((s, c) => s + Number(c), 0);
}

/* ------------------------------------------------------------------ */
/* Faktorbaum                                                          */
/* ------------------------------------------------------------------ */

export type SplitStrategy = 'klein' | 'mitte' | 'zufall';

export interface TreeNode {
  /** Eindeutige Nummer (Reihenfolge des Entstehens). */
  id: number;
  value: number;
  depth: number;
  children: [TreeNode, TreeNode] | null;
}

/**
 * Zerlegt n in zwei Faktoren > 1 oder liefert `null` für Primzahlen.
 * - `klein`: kleinster Primfaktor abspalten (360 = 2 · 180)
 * - `mitte`: zwei möglichst gleich große Faktoren (360 = 18 · 20)
 * - `zufall`: ein zufälliger echter Teiler
 */
export function splitOf(n: number, strategy: SplitStrategy, rand: () => number = Math.random): [number, number] | null {
  if (n < 4 || isPrime(n)) return null;
  if (strategy === 'klein') {
    const p = smallestPrimeFactor(n);
    return [p, n / p];
  }
  const proper = divisors(n).filter((d) => d > 1 && d < n);
  if (strategy === 'mitte') {
    let best = proper[0]!;
    for (const d of proper) if (d * d <= n) best = d;
    return [best, n / best];
  }
  const d = proper[Math.floor(rand() * proper.length)] ?? proper[0]!;
  const lo = Math.min(d, n / d);
  return [lo, n / lo];
}

/** Vollständiger Faktorbaum (Knoten in Breitensuche nummeriert). */
export function buildTree(n: number, strategy: SplitStrategy, rand: () => number = Math.random): TreeNode {
  let next = 0;
  const root: TreeNode = { id: next++, value: n, depth: 0, children: null };
  const queue: TreeNode[] = [root];
  while (queue.length) {
    const node = queue.shift()!;
    const split = splitOf(node.value, strategy, rand);
    if (!split) continue;
    node.children = [
      { id: next++, value: split[0], depth: node.depth + 1, children: null },
      { id: next++, value: split[1], depth: node.depth + 1, children: null },
    ];
    queue.push(...node.children);
  }
  return root;
}

/** Alle Knoten in Breitensuche. */
export function nodesOf(root: TreeNode): TreeNode[] {
  const out: TreeNode[] = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift()!;
    out.push(node);
    if (node.children) queue.push(...node.children);
  }
  return out;
}

/** Tiefe des Baums (nur die Wurzel: 0). */
export function treeDepth(root: TreeNode): number {
  return Math.max(...nodesOf(root).map((n) => n.depth));
}

/* ------------------------------------------------------------------ */
/* Teilbarkeitsregeln                                                  */
/* ------------------------------------------------------------------ */

export type RuleKind = 'last' | 'last2' | 'sum' | 'both';

export interface DivisibilityCheck {
  divisor: number;
  divisible: boolean;
  rule: RuleKind;
  /** Geprüfte Zahl: Endziffer, Zahl aus den letzten zwei Ziffern oder Quersumme. */
  value: number;
}

/** Teilbarkeitsregeln für 2, 3, 4, 5, 6, 9, 10 und 25 (Endstellen- und Quersummenregeln). */
export function divisibilityChecks(n: number): DivisibilityCheck[] {
  const last = n % 10;
  const last2 = n % 100;
  const qs = digitSum(n);
  return [
    { divisor: 2, divisible: last % 2 === 0, rule: 'last', value: last },
    { divisor: 3, divisible: qs % 3 === 0, rule: 'sum', value: qs },
    { divisor: 4, divisible: last2 % 4 === 0, rule: 'last2', value: last2 },
    { divisor: 5, divisible: last === 0 || last === 5, rule: 'last', value: last },
    { divisor: 6, divisible: last % 2 === 0 && qs % 3 === 0, rule: 'both', value: qs },
    { divisor: 9, divisible: qs % 9 === 0, rule: 'sum', value: qs },
    { divisor: 10, divisible: last === 0, rule: 'last', value: last },
    { divisor: 25, divisible: last2 % 25 === 0, rule: 'last2', value: last2 },
  ];
}

/* ------------------------------------------------------------------ */
/* Sieb des Eratosthenes                                               */
/* ------------------------------------------------------------------ */

export interface SieveStep {
  prime: number;
  /** Vielfache, die in diesem Schritt neu gestrichen werden. */
  crossed: number[];
  /** Vielfache, die schon vorher gestrichen waren. */
  already: number[];
}

/**
 * Sieb bis `max`: Für jede Primzahl p mit p² ≤ max werden ihre Vielfachen
 * gestrichen. Alles, was danach übrig bleibt (außer 1), ist prim.
 */
export function sieve(max: number): { steps: SieveStep[]; primes: number[]; crossedBy: number[] } {
  const crossedBy = Array.from({ length: max + 1 }, () => 0);
  const steps: SieveStep[] = [];
  for (let p = 2; p * p <= max; p++) {
    if (crossedBy[p]) continue;
    const step: SieveStep = { prime: p, crossed: [], already: [] };
    for (let m = 2 * p; m <= max; m += p) {
      if (crossedBy[m]) step.already.push(m);
      else {
        crossedBy[m] = p;
        step.crossed.push(m);
      }
    }
    steps.push(step);
  }
  const primes: number[] = [];
  for (let k = 2; k <= max; k++) if (!crossedBy[k]) primes.push(k);
  return { steps, primes, crossedBy };
}

/* ------------------------------------------------------------------ */
/* ggT und kgV über Primfaktoren                                       */
/* ------------------------------------------------------------------ */

/**
 * Aufteilung der Primfaktoren für das Mengenbild: gemeinsame Faktoren
 * (Schnittmenge, ergibt den ggT) und die übrigen Faktoren von a bzw. b.
 * Alle zusammen ergeben den kgV.
 */
export function sharedFactors(a: number, b: number): { common: number[]; onlyA: number[]; onlyB: number[] } {
  const fb = primeFactors(b);
  const common: number[] = [];
  const onlyA: number[] = [];
  for (const p of primeFactors(a)) {
    const i = fb.indexOf(p);
    if (i >= 0) {
      common.push(p);
      fb.splice(i, 1);
    } else onlyA.push(p);
  }
  return { common, onlyA, onlyB: fb };
}

export const product = (xs: readonly number[]) => xs.reduce((s, x) => s * x, 1);
