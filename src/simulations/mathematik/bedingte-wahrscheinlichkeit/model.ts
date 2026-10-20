/**
 * Rechenlogik für „Bedingte Wahrscheinlichkeit am Beispiel medizinischer
 * Tests“: Prävalenz, Sensitivität und Spezifität ergeben die vier Gruppen
 * (richtig/falsch positiv/negativ), den positiven und negativen
 * Vorhersagewert (Satz von Bayes), natürliche Häufigkeiten für 1000 Personen
 * (gerundet mit dem Restverfahren, Summe immer genau 1000) und den Zweittest.
 * Alle Wahrscheinlichkeiten als Anteile zwischen 0 und 1. Keine Zeichenbefehle.
 */

/** Kenngrößen eines Tests in einer Bevölkerung (Anteile 0 … 1). */
export interface TestSetup {
  /** Prävalenz P(K): Anteil der Kranken. */
  prev: number;
  /** Sensitivität P_K(+): Anteil der Kranken mit positivem Test. */
  se: number;
  /** Spezifität P_K̄(−): Anteil der Gesunden mit negativem Test. */
  sp: number;
}

/** Wahrscheinlichkeiten der vier Felder (Summe 1). */
export interface Joint {
  /** krank und positiv (richtig positiv) */
  tp: number;
  /** krank und negativ (falsch negativ) */
  fn: number;
  /** gesund und positiv (falsch positiv) */
  fp: number;
  /** gesund und negativ (richtig negativ) */
  tn: number;
}

export function joint(t: TestSetup): Joint {
  return {
    tp: t.prev * t.se,
    fn: t.prev * (1 - t.se),
    fp: (1 - t.prev) * (1 - t.sp),
    tn: (1 - t.prev) * t.sp,
  };
}

/** P(+): Anteil der positiv Getesteten. */
export function pPositive(t: TestSetup): number {
  const j = joint(t);
  return j.tp + j.fp;
}

/**
 * Positiver Vorhersagewert nach Bayes:
 * P_+(K) = P(K) · P_K(+) / (P(K) · P_K(+) + P(K̄) · P_K̄(+)).
 * Ohne positiv Getestete (Nenner 0) ist er nicht definiert → NaN.
 */
export function ppv(t: TestSetup): number {
  const j = joint(t);
  const d = j.tp + j.fp;
  return d > 0 ? j.tp / d : NaN;
}

/** Negativer Vorhersagewert P_−(K̄) = P(K̄ ∩ −) / P(−); NaN ohne negativ Getestete. */
export function npv(t: TestSetup): number {
  const j = joint(t);
  const d = j.tn + j.fn;
  return d > 0 ? j.tn / d : NaN;
}

/**
 * Zweittest nach positivem Ersttest: Die Gruppe der positiv Getesteten hat
 * als neue Prävalenz den Vorhersagewert des ersten Tests (Tests als
 * unabhängig angenommen, gleiche Sensitivität und Spezifität).
 */
export function secondSetup(t: TestSetup): TestSetup {
  const p1 = ppv(t);
  return { prev: Number.isNaN(p1) ? 0 : p1, se: t.se, sp: t.sp };
}

/** Positiver Vorhersagewert nach zwei positiven Tests. */
export function ppvAfterTwo(t: TestSetup): number {
  return ppv(secondSetup(t));
}

/**
 * Positives Wahrscheinlichkeitsverhältnis (Likelihood-Quotient)
 * LR⁺ = P_K(+) / P_K̄(+). Bei Spezifität 100 % unendlich.
 */
export function likelihoodRatio(t: TestSetup): number {
  return t.sp >= 1 ? Infinity : t.se / (1 - t.sp);
}

/**
 * Restverfahren (Hare-Niemeyer): `total` ganze Einheiten im Verhältnis der
 * Gewichte verteilen; die Summe ist immer genau `total`. Bei gleichen Resten
 * gewinnt das frühere Feld.
 */
export function apportion(total: number, weights: readonly number[]): number[] {
  const sum = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (sum <= 0 || total <= 0) return weights.map(() => 0);
  const exact = weights.map((w) => (Math.max(0, w) / sum) * total);
  const out = exact.map((e) => Math.floor(e + 1e-9));
  let rest = total - out.reduce((s, v) => s + v, 0);
  const order = exact.map((e, i) => ({ i, r: e - out[i]! })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; rest > 0 && order.length; k = (k + 1) % order.length, rest--) out[order[k]!.i]!++;
  return out;
}

/** Natürliche Häufigkeiten (ganze Personen) für eine Gruppe von N Personen. */
export interface Counts {
  N: number;
  sick: number;
  healthy: number;
  tp: number;
  fn: number;
  fp: number;
  tn: number;
  pos: number;
  neg: number;
}

/**
 * Natürliche Häufigkeiten, schrittweise gerundet wie im Baum: erst krank/gesund
 * (Summe N), dann innerhalb der Kranken positiv/negativ (Summe = Kranke), dann
 * innerhalb der Gesunden (Summe = Gesunde). So passen Baum und Symbolbild
 * immer zusammen.
 */
export function naturalCounts(t: TestSetup, N = 1000): Counts {
  const [sick, healthy] = apportion(N, [t.prev, 1 - t.prev]) as [number, number];
  const [tp, fn] = apportion(sick, [t.se, 1 - t.se]) as [number, number];
  const [fp, tn] = apportion(healthy, [1 - t.sp, t.sp]) as [number, number];
  return { N, sick, healthy, tp, fn, fp, tn, pos: tp + fp, neg: fn + tn };
}

/** Rohe (ungerundete) Erwartungswerte der vier Felder für N Personen. */
export function expectedCounts(t: TestSetup, N = 1000): Joint {
  const j = joint(t);
  return { tp: j.tp * N, fn: j.fn * N, fp: j.fp * N, tn: j.tn * N };
}

/** Prozentangaben (0 … 100) aus der Simulation in Anteile umrechnen. */
export function setupFromPercent(prev: number, se: number, sp: number): TestSetup {
  return { prev: prev / 100, se: se / 100, sp: sp / 100 };
}

/** Vierfeldertafel (als Anteile) aus dem Test: [K ∩ +, K ∩ −, K̄ ∩ +, K̄ ∩ −]. */
export function fourFold(t: TestSetup): [number, number, number, number] {
  const j = joint(t);
  return [j.tp, j.fn, j.fp, j.tn];
}

/**
 * Gegenprobe: bedingte Wahrscheinlichkeit P_+(K) direkt aus einer
 * Vierfeldertafel (Zellen in der Reihenfolge von `fourFold`).
 */
export function ppvFromTable(c: readonly [number, number, number, number]): number {
  const pos = c[0] + c[2];
  return pos > 0 ? c[0] / pos : NaN;
}

/**
 * Feste Pseudozufallszahlen (mulberry32) für die Anordnung der Personen,
 * damit dieselbe Einstellung immer dasselbe Bild ergibt.
 */
export function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Role = 'tp' | 'fn' | 'fp' | 'tn';

/**
 * Rollen der N Personen: Person i ist krank, wenn ihre Zufallszahl u[i] zu den
 * `sick` kleinsten gehört; innerhalb der Kranken bzw. Gesunden entscheidet v[i]
 * über das Testergebnis. Ändert sich ein Regler, wechseln nur wenige Personen
 * die Gruppe (stabiles Bild).
 */
export function assignRoles(u: readonly number[], v: readonly number[], c: Counts): Role[] {
  const n = u.length;
  const idx = [...Array(n).keys()].sort((a, b) => u[a]! - u[b]! || a - b);
  const sickSet = idx.slice(0, c.sick);
  const healthySet = idx.slice(c.sick);
  const byV = (arr: number[]) => [...arr].sort((a, b) => v[a]! - v[b]! || a - b);
  const roles: Role[] = Array<Role>(n).fill('tn');
  byV(sickSet).forEach((i, k) => (roles[i] = k < c.tp ? 'tp' : 'fn'));
  byV(healthySet).forEach((i, k) => (roles[i] = k < c.fp ? 'fp' : 'tn'));
  return roles;
}
