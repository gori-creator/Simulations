/**
 * Rechenlogik für Prognose- und Konfidenzintervalle bei relativen
 * Häufigkeiten: Sicherheitswahrscheinlichkeit → z-Wert, Prognoseintervall
 * p ± z·σ, Konfidenzintervall nach Wald (h ± z·√(h(1−h)/n)) und über die
 * Konfidenzellipse (Wilson), nötiger Stichprobenumfang, Binomialverteilung,
 * Treffer-Wahrscheinlichkeit der Intervalle und Zufallsstichproben.
 * Geprüft in tests/konfidenzintervall.test.ts.
 */

/* ------------------------------------------------------------------ */
/* Normalverteilung                                                     */
/* ------------------------------------------------------------------ */

/** Verteilungsfunktion der Standardnormalverteilung Φ(z). */
export function phi(z: number): number {
  // Abramowitz-Stegun 7.1.26 über erf, Genauigkeit ~1e-7
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

/** Quantil der Standardnormalverteilung (Acklam), Fehler < 1e-9. */
export function phiInv(q: number): number {
  if (q <= 0) return -Infinity;
  if (q >= 1) return Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  let x: number;
  if (q < lo) {
    const r = Math.sqrt(-2 * Math.log(q));
    x = (((((c[0]! * r + c[1]!) * r + c[2]!) * r + c[3]!) * r + c[4]!) * r + c[5]!) / ((((d[0]! * r + d[1]!) * r + d[2]!) * r + d[3]!) * r + 1);
  } else if (q <= 1 - lo) {
    const r = q - 0.5;
    const s = r * r;
    x = ((((((a[0]! * s + a[1]!) * s + a[2]!) * s + a[3]!) * s + a[4]!) * s + a[5]!) * r) / (((((b[0]! * s + b[1]!) * s + b[2]!) * s + b[3]!) * s + b[4]!) * s + 1);
  } else {
    const r = Math.sqrt(-2 * Math.log(1 - q));
    x = -(((((c[0]! * r + c[1]!) * r + c[2]!) * r + c[3]!) * r + c[4]!) * r + c[5]!) / ((((d[0]! * r + d[1]!) * r + d[2]!) * r + d[3]!) * r + 1);
  }
  return x;
}

/** Schulübliche z-Werte (Sigma-Regeln): 90 % → 1,64, 95 % → 1,96, 99 % → 2,58. */
export const SCHOOL_Z: Record<number, number> = { 90: 1.64, 95: 1.96, 99: 2.58 };

/** z-Wert zur Sicherheitswahrscheinlichkeit γ (in Prozent), schulüblich gerundet. */
export function zFor(levelPercent: number, school = true): number {
  if (school && SCHOOL_Z[levelPercent]) return SCHOOL_Z[levelPercent]!;
  return phiInv(0.5 + levelPercent / 200);
}

/** Wahrscheinlichkeit P(|Z| ≤ z) zu einem z-Wert (z. B. 1σ ≈ 68,3 %). */
export const levelOf = (z: number) => 2 * phi(z) - 1;

/* ------------------------------------------------------------------ */
/* Intervalle                                                           */
/* ------------------------------------------------------------------ */

export type Interval = readonly [number, number];

/** Prognoseintervall für die relative Häufigkeit: p ± z·√(p(1 − p)/n). */
export function predictionInterval(p: number, n: number, z: number): Interval {
  const r = z * Math.sqrt((p * (1 - p)) / n);
  return [p - r, p + r];
}

/** Prognoseintervall für die absolute Häufigkeit X: μ ± z·σ. */
export function predictionIntervalCount(p: number, n: number, z: number): Interval {
  const mu = n * p;
  const s = Math.sqrt(n * p * (1 - p));
  return [mu - z * s, mu + z * s];
}

/** Konfidenzintervall nach Wald (Näherung, σ mit h statt p): h ± z·√(h(1 − h)/n). */
export function waldInterval(h: number, n: number, z: number): Interval {
  const r = z * Math.sqrt((h * (1 - h)) / n);
  return [Math.max(0, h - r), Math.min(1, h + r)];
}

/**
 * Konfidenzintervall über die Konfidenzellipse: alle p mit
 * |h − p| ≤ z·√(p(1 − p)/n). Quadrieren ergibt eine quadratische
 * Ungleichung in p (Wilson-Intervall).
 */
export function wilsonInterval(h: number, n: number, z: number): Interval {
  const z2 = z * z;
  const den = 1 + z2 / n;
  const mid = (h + z2 / (2 * n)) / den;
  const r = (z * Math.sqrt((h * (1 - h)) / n + z2 / (4 * n * n))) / den;
  return [Math.max(0, mid - r), Math.min(1, mid + r)];
}

export type Method = 'wald' | 'wilson';
export const confInterval = (m: Method, h: number, n: number, z: number): Interval => (m === 'wald' ? waldInterval(h, n, z) : wilsonInterval(h, n, z));

/** Ränder der Konfidenzellipse zu p: h = p ± z·√(p(1 − p)/n). */
export function ellipseAt(p: number, n: number, z: number): Interval {
  return predictionInterval(p, n, z);
}

/** Halbe Breite des Wald-Intervalls (Fehlerschranke) ε = z·√(h(1 − h)/n). */
export const halfWidth = (h: number, n: number, z: number) => z * Math.sqrt((h * (1 - h)) / n);

/**
 * Nötiger Stichprobenumfang, damit das Intervall höchstens ±ε breit ist:
 * n ≥ z²·p(1 − p)/ε² (ohne Vorwissen p = 0,5: n ≥ (z / (2ε))²).
 */
export function requiredN(eps: number, z: number, p = 0.5): number {
  return Math.ceil((z * z * p * (1 - p)) / (eps * eps) - 1e-9);
}

/* ------------------------------------------------------------------ */
/* Binomialverteilung und Treffer                                       */
/* ------------------------------------------------------------------ */

/** Binomialverteilung B(n, p) als Liste P(X = k), numerisch stabil über Logarithmen. */
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
  const lq = Math.log(1 - p);
  let lc = 0; // log C(n, k)
  for (let k = 0; k <= n; k++) {
    if (k > 0) lc += Math.log(n - k + 1) - Math.log(k);
    out[k] = Math.exp(lc + k * lp + (n - k) * lq);
  }
  return out;
}

/** Wahrscheinlichkeit, dass die relative Häufigkeit im Intervall [a, b] liegt (exakt mit der Binomialverteilung). */
export function probInside(n: number, p: number, iv: Interval, pmf = binomialPmf(n, p)): number {
  let s = 0;
  for (let k = 0; k <= n; k++) {
    const h = k / n;
    if (h >= iv[0] - 1e-12 && h <= iv[1] + 1e-12) s += pmf[k]!;
  }
  return s;
}

/**
 * Überdeckungswahrscheinlichkeit: Mit welcher Wahrscheinlichkeit enthält
 * das Konfidenzintervall das wahre p? (Summe über alle möglichen Stichproben.)
 */
export function coverage(method: Method, n: number, p: number, z: number, pmf = binomialPmf(n, p)): number {
  let s = 0;
  for (let k = 0; k <= n; k++) {
    const iv = confInterval(method, k / n, n, z);
    if (p >= iv[0] - 1e-12 && p <= iv[1] + 1e-12) s += pmf[k]!;
  }
  return s;
}

/** Eine binomialverteilte Zufallszahl (n Einzelversuche, für n ≤ 5000). */
export function sampleBinomial(n: number, p: number, random: () => number): number {
  let k = 0;
  for (let i = 0; i < n; i++) if (random() < p) k++;
  return k;
}

/** Einzelergebnisse einer Stichprobe (für die Kugel-Darstellung). */
export function sampleDraws(n: number, p: number, random: () => number): boolean[] {
  return Array.from({ length: n }, () => random() < p);
}

/** Laplace-Bedingung σ > 3 für die Näherung durch die Normalverteilung. */
export const laplaceOk = (n: number, p: number) => Math.sqrt(n * p * (1 - p)) > 3;

/* ------------------------------------------------------------------ */
/* Rechenweg und Tabellen                                               */
/* ------------------------------------------------------------------ */

/**
 * Quadratische Gleichung der Konfidenzellipse für festes h:
 * (h − p)² = z²·p(1 − p)/n  ⇔  a·p² + b·p + c = 0 mit
 * a = 1 + z²/n, b = −(2h + z²/n), c = h².
 */
export function ellipseQuadratic(h: number, n: number, z: number): { a: number; b: number; c: number; disc: number; roots: Interval | null } {
  const k = (z * z) / n;
  const a = 1 + k;
  const b = -(2 * h + k);
  const c = h * h;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return { a, b, c, disc, roots: null };
  const r = Math.sqrt(disc);
  return { a, b, c, disc, roots: [(-b - r) / (2 * a), (-b + r) / (2 * a)] };
}

/** Sigma-Regeln: exakte Wahrscheinlichkeit P(μ − kσ ≤ X ≤ μ + kσ) für k = 1, 2, 3 im Vergleich zur Näherung. */
export function sigmaTable(n: number, p: number, pmf = binomialPmf(n, p)): { k: number; exact: number; approx: number; lo: number; hi: number }[] {
  const mu = n * p;
  const s = Math.sqrt(n * p * (1 - p));
  return [1, 2, 3].map((k) => {
    const lo = mu - k * s;
    const hi = mu + k * s;
    let e = 0;
    for (let x = Math.max(0, Math.ceil(lo - 1e-9)); x <= Math.min(n, Math.floor(hi + 1e-9)); x++) e += pmf[x]!;
    return { k, exact: e, approx: levelOf(k), lo, hi };
  });
}

/** Dichte der Normalverteilung N(μ, σ²). */
export const normalPdf = (x: number, mu: number, s: number) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

/** Laufende Trefferquote nach jeder Stichprobe. */
export function runningRate(hits: readonly boolean[]): number[] {
  let k = 0;
  return hits.map((h, i) => {
    if (h) k++;
    return k / (i + 1);
  });
}
