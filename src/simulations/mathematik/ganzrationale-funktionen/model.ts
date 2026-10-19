/**
 * Rechenlogik „Ganzrationale Funktionen: Nullstellen, Vielfachheit und
 * Randverhalten“ (Jahrgangsstufe 10/11).
 *
 * Die Funktion wird in Linearfaktoren angegeben:
 *   f(x) = a · (x − x₁)^m₁ · (x − x₂)^m₂ · …
 * Grad n = m₁ + m₂ + …, Leitkoeffizient a.
 *
 * Verhalten an einer Nullstelle der Vielfachheit m:
 * - m ungerade: Vorzeichenwechsel (m = 1: Schnittpunkt, m ≥ 3: Terrassenpunkt
 *   bzw. Sattelpunkt, der Graph schmiegt sich an die x-Achse an),
 * - m gerade: kein Vorzeichenwechsel (Berührpunkt, Extrempunkt auf der x-Achse).
 *
 * Randverhalten: Für x → +∞ hat f(x) das Vorzeichen von a; für x → −∞ das
 * Vorzeichen von a · (−1)ⁿ.
 */

export interface Root {
  x: number;
  m: number;
}

export type ZeroKind = 'cross' | 'touch' | 'terrace';

/** Gleiche Nullstellen zusammenfassen (Vielfachheiten addieren), nach x sortiert. */
export function mergeRoots(roots: Root[], tol = 1e-9): Root[] {
  const out: Root[] = [];
  for (const r of [...roots].sort((p, q) => p.x - q.x)) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.x - r.x) <= tol) last.m += r.m;
    else out.push({ ...r });
  }
  return out;
}

export function degree(roots: Root[]): number {
  return roots.reduce((s, r) => s + r.m, 0);
}

/** f(x) = a · ∏ (x − xᵢ)^mᵢ */
export function evaluate(a: number, roots: Root[], x: number): number {
  let v = a;
  for (const r of roots) v *= (x - r.x) ** r.m;
  return v;
}

/** Koeffizienten der Normalform, von x⁰ aufwärts: [c₀, c₁, …, cₙ]. */
export function expand(a: number, roots: Root[]): number[] {
  let c = [a];
  for (const r of roots) {
    for (let k = 0; k < r.m; k++) {
      // mit (x − r.x) multiplizieren
      const next = new Array<number>(c.length + 1).fill(0);
      c.forEach((v, i) => {
        next[i + 1]! += v;
        next[i]! -= v * r.x;
      });
      c = next;
    }
  }
  return c.map((v) => (Math.abs(v) < 1e-12 ? 0 : v));
}

export function zeroKind(m: number): ZeroKind {
  if (m % 2 === 0) return 'touch';
  return m === 1 ? 'cross' : 'terrace';
}

/** Vorzeichen von f für x → −∞ und x → +∞. */
export function endBehaviour(a: number, n: number): { left: 1 | -1; right: 1 | -1 } {
  const right: 1 | -1 = a > 0 ? 1 : -1;
  const left: 1 | -1 = (n % 2 === 0 ? right : -right) as 1 | -1;
  return { left, right };
}

/**
 * Vorzeichen in den Intervallen zwischen den (zusammengefassten) Nullstellen:
 * signs[0] links der kleinsten Nullstelle, signs[k] rechts der k-ten.
 */
export function signChart(a: number, roots: Root[]): (1 | -1)[] {
  const rs = mergeRoots(roots);
  const n = degree(rs);
  const signs: (1 | -1)[] = [endBehaviour(a, n).left];
  for (const r of rs) {
    const last = signs[signs.length - 1]!;
    signs.push(r.m % 2 === 1 ? ((-last) as 1 | -1) : last);
  }
  return signs;
}
