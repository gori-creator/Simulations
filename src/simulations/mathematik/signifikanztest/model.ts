/**
 * Rechenlogik „Einseitiger Signifikanztest“ (Binomialverteilung).
 *
 * Testgröße X: Anzahl der Treffer bei n Versuchen, unter H₀ binomialverteilt
 * mit p₀. Rechtsseitiger Test: H₀: p ≤ p₀ gegen H₁: p > p₀, Ablehnung für
 * große X. Linksseitiger Test: H₀: p ≥ p₀ gegen H₁: p < p₀, Ablehnung für
 * kleine X. Das Signifikanzniveau α ist die Obergrenze für die
 * Wahrscheinlichkeit des Fehlers 1. Art; berechnet wird sie im ungünstigsten
 * Fall p = p₀.
 */

export type Side = 'right' | 'left';

/** Natürlicher Logarithmus von n! (exakt aufsummiert, für n ≤ einige Tausend völlig ausreichend). */
const LOG_FACT: number[] = [0];
function logFactorial(n: number): number {
  for (let i = LOG_FACT.length; i <= n; i++) LOG_FACT[i] = LOG_FACT[i - 1]! + Math.log(i);
  return LOG_FACT[n]!;
}

/** ln C(n, k) */
export function logBinomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}

/**
 * Alle Einzelwahrscheinlichkeiten P(X = k), k = 0 … n, für X ~ B(n; p).
 * Über Logarithmen berechnet, damit auch bei n = 200 nichts über- oder unterläuft.
 */
export function binomialPmf(n: number, p: number): number[] {
  const out = new Array<number>(n + 1).fill(0);
  if (p <= 0) {
    out[0] = 1;
    return out;
  }
  if (p >= 1) {
    out[n] = 1;
    return out;
  }
  const lp = Math.log(p);
  const lq = Math.log1p(-p);
  for (let k = 0; k <= n; k++) out[k] = Math.exp(logBinomialCoefficient(n, k) + k * lp + (n - k) * lq);
  return out;
}

/** P(X ≤ k) für X ~ B(n; p); k < 0 ergibt 0, k ≥ n ergibt 1. */
export function cdfLE(n: number, p: number, k: number, pmf = binomialPmf(n, p)): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let s = 0;
  for (let i = 0; i <= k; i++) s += pmf[i]!;
  return Math.min(1, s);
}

/** P(X ≥ k) für X ~ B(n; p) – direkt aufsummiert (nicht 1 − …), damit kleine Werte genau bleiben. */
export function cdfGE(n: number, p: number, k: number, pmf = binomialPmf(n, p)): number {
  if (k <= 0) return 1;
  if (k > n) return 0;
  let s = 0;
  for (let i = k; i <= n; i++) s += pmf[i]!;
  return Math.min(1, s);
}

/** Ergebnis der Bestimmung des Ablehnungsbereichs. */
export interface CriticalRegion {
  side: Side;
  n: number;
  p0: number;
  alpha: number;
  /**
   * Kritischer Wert k: rechtsseitig Ablehnung für X ≥ k (k = n + 1: kein
   * Ablehnungsbereich möglich), linksseitig Ablehnung für X ≤ k (k = −1: keiner).
   */
  k: number;
  /** Ablehnungsbereich als Intervall [lo; hi] ganzer Zahlen; leer, wenn lo > hi. */
  lo: number;
  hi: number;
  /** Ist überhaupt ein Ablehnungsbereich möglich? */
  possible: boolean;
  /** Tatsächliche Irrtumswahrscheinlichkeit (Fehler 1. Art bei p = p₀), immer ≤ α. */
  alphaActual: number;
  /** Wahrscheinlichkeit des nächstgrößeren Bereichs (eine Zahl mehr), > α – zeigt, dass k optimal ist. */
  alphaNext: number;
}

/**
 * Ablehnungsbereich bestimmen: rechtsseitig das kleinste k mit P(X ≥ k) ≤ α,
 * linksseitig das größte k mit P(X ≤ k) ≤ α (jeweils unter p = p₀).
 */
export function criticalRegion(n: number, p0: number, alpha: number, side: Side): CriticalRegion {
  const pmf = binomialPmf(n, p0);
  // Kleine Toleranz gegen Rundung in der letzten Stelle (z. B. Summe exakt = α)
  const ok = (v: number) => v <= alpha * (1 + 1e-12);
  if (side === 'right') {
    let tail = 0;
    let k = n + 1;
    // von oben her aufsummieren, solange die Wahrscheinlichkeit ≤ α bleibt
    for (let i = n; i >= 0; i--) {
      const t = tail + pmf[i]!;
      if (!ok(t)) break;
      tail = t;
      k = i;
    }
    const next = k - 1 >= 0 ? tail + pmf[k - 1]! : 1;
    return { side, n, p0, alpha, k, lo: k, hi: n, possible: k <= n, alphaActual: Math.min(1, tail), alphaNext: Math.min(1, next) };
  }
  let tail = 0;
  let k = -1;
  for (let i = 0; i <= n; i++) {
    const t = tail + pmf[i]!;
    if (!ok(t)) break;
    tail = t;
    k = i;
  }
  const next = k + 1 <= n ? tail + pmf[k + 1]! : 1;
  return { side, n, p0, alpha, k, lo: 0, hi: k, possible: k >= 0, alphaActual: Math.min(1, tail), alphaNext: Math.min(1, next) };
}

/** Liegt x im Ablehnungsbereich? */
export function rejects(cr: CriticalRegion, x: number): boolean {
  return cr.possible && x >= cr.lo && x <= cr.hi;
}

/** Wahrscheinlichkeit, H₀ abzulehnen, wenn in Wirklichkeit p gilt (Gütefunktion). */
export function rejectProb(cr: CriticalRegion, p: number, pmf = binomialPmf(cr.n, p)): number {
  if (!cr.possible) return 0;
  return cr.side === 'right' ? cdfGE(cr.n, p, cr.lo, pmf) : cdfLE(cr.n, p, cr.hi, pmf);
}

/** Wahrscheinlichkeit, H₀ beizubehalten (Annahmebereich), wenn in Wirklichkeit p gilt. */
export function acceptProb(cr: CriticalRegion, p: number, pmf = binomialPmf(cr.n, p)): number {
  if (!cr.possible) return 1;
  return cr.side === 'right' ? cdfLE(cr.n, p, cr.lo - 1, pmf) : cdfGE(cr.n, p, cr.hi + 1, pmf);
}

/** Gilt in Wirklichkeit (mit wahrem p) die Gegenhypothese H₁? */
export function h1True(side: Side, p0: number, p: number): boolean {
  const eps = 1e-12;
  return side === 'right' ? p > p0 + eps : p < p0 - eps;
}

/** Fehler 2. Art β und Macht 1 − β für ein wahres p aus H₁ (sonst null). */
export function typeTwo(cr: CriticalRegion, p: number): { beta: number; power: number } | null {
  if (!h1True(cr.side, cr.p0, p)) return null;
  const pmf = binomialPmf(cr.n, p);
  const beta = acceptProb(cr, p, pmf);
  return { beta, power: 1 - beta };
}

/** Gütefunktion an vielen Stellen p ∈ [0; 1] (für das kleine Diagramm). */
export function powerCurve(cr: CriticalRegion, samples = 120): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const p = i / samples;
    out.push([p, rejectProb(cr, p)]);
  }
  return out;
}

/** Erwartungswert und Standardabweichung von B(n; p). */
export function meanSd(n: number, p: number): { mu: number; sigma: number } {
  return { mu: n * p, sigma: Math.sqrt(n * p * (1 - p)) };
}

/**
 * Sichtbarer Ausschnitt der k-Achse: beide Verteilungen (je μ ± 4,5σ),
 * die Grenze des Ablehnungsbereichs und der Beobachtungswert, auf [0; n] begrenzt.
 */
export function viewWindow(n: number, p0: number, p1: number, cr: CriticalRegion, x: number | null): [number, number] {
  const a = meanSd(n, p0);
  const b = meanSd(n, p1);
  let lo = Math.min(a.mu - 4.5 * a.sigma - 1, b.mu - 4.5 * b.sigma - 1);
  let hi = Math.max(a.mu + 4.5 * a.sigma + 1, b.mu + 4.5 * b.sigma + 1);
  if (cr.possible) {
    const edge = cr.side === 'right' ? cr.lo : cr.hi;
    lo = Math.min(lo, edge - 2);
    hi = Math.max(hi, edge + 2);
  }
  if (x !== null) {
    lo = Math.min(lo, x - 1);
    hi = Math.max(hi, x + 1);
  }
  lo = Math.max(0, Math.floor(lo));
  hi = Math.min(n, Math.ceil(hi));
  // mindestens 11 Säulen, damit kleine n nicht zu breit werden
  while (hi - lo < 10 && (lo > 0 || hi < n)) {
    if (lo > 0) lo--;
    if (hi < n && hi - lo < 10) hi++;
  }
  return [lo, hi];
}

/** Zufällige Stichprobe: Anzahl der Treffer bei n Versuchen mit Trefferwahrscheinlichkeit p. */
export function sampleBinomial(n: number, p: number, random: () => number): number {
  let x = 0;
  for (let i = 0; i < n; i++) if (random() < p) x++;
  return x;
}
