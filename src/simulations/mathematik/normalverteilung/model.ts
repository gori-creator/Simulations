/**
 * Rechenlogik „Normalverteilung“ (Jgst. 13 / Studium).
 *
 * Dichte φ(x) = 1/(σ√(2π)) · e^(−(x−μ)²/(2σ²)), Verteilungsfunktion
 * Φ(x) = P(X ≤ x). Wahrscheinlichkeiten sind Flächen unter der Dichte:
 * P(a ≤ X ≤ b) = Φ(b) − Φ(a). Sigma-Regeln: μ ± σ ≈ 68,3 %,
 * μ ± 2σ ≈ 95,4 %, μ ± 3σ ≈ 99,7 %.
 */

const SQRT2 = Math.SQRT2;
const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Fehlerfunktion erf(x), genau auf etwa 1e-14 (Reihe bzw. Kettenbruch). */
export function erf(x: number): number {
  if (x < 0) return -erf(-x);
  if (x > 6) return 1;
  if (x < 2.5) {
    // Taylorreihe erf(x) = 2/√π · Σ (−1)ⁿ x^(2n+1) / (n! (2n+1))
    let sum = 0;
    let term = x;
    for (let n = 0; n < 200; n++) {
      const add = term / (2 * n + 1);
      sum += add;
      if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
      term *= (-x * x) / (n + 1);
    }
    return (2 / Math.sqrt(Math.PI)) * sum;
  }
  return 1 - erfc(x);
}

/** Komplementäre Fehlerfunktion für x ≥ 2,5 (Kettenbruch nach Lentz). */
function erfc(x: number): number {
  // erfc(x) = e^(−x²)/√π · 1/(x + 1/2/(x + 1/(x + 3/2/(x + …))))
  const tiny = 1e-300;
  let f = x;
  let C = x;
  let D = 0;
  for (let n = 1; n < 300; n++) {
    const an = n / 2;
    D = x + an * D;
    D = Math.abs(D) < tiny ? tiny : D;
    C = x + an / C;
    C = Math.abs(C) < tiny ? tiny : C;
    D = 1 / D;
    const delta = C * D;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
}

export function pdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

export function cdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * SQRT2)));
}

/** P(a ≤ X ≤ b) */
export function prob(a: number, b: number, mu: number, sigma: number): number {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return cdf(hi, mu, sigma) - cdf(lo, mu, sigma);
}

/** Standardisierung z = (x − μ) / σ */
export function zScore(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma;
}

/** Wahrscheinlichkeit der k-σ-Umgebung. */
export function sigmaRule(k: number): number {
  return erf(k / SQRT2);
}

/* ------------------------------------------------------------------ */
/* Näherung der Binomialverteilung                                     */
/* ------------------------------------------------------------------ */

/** Alle Wahrscheinlichkeiten P(X = k), k = 0 … n, für X ~ B(n; p) (über Logarithmen, damit nichts unterläuft). */
export function binomPmf(n: number, p: number): number[] {
  const lf = [0];
  for (let i = 1; i <= n; i++) lf.push(lf[i - 1]! + Math.log(i));
  const out: number[] = [];
  for (let k = 0; k <= n; k++) {
    if (p <= 0) out.push(k === 0 ? 1 : 0);
    else if (p >= 1) out.push(k === n ? 1 : 0);
    else out.push(Math.exp(lf[n]! - lf[k]! - lf[n - k]! + k * Math.log(p) + (n - k) * Math.log(1 - p)));
  }
  return out;
}

/** P(X ≤ k) für X ~ B(n; p). */
export function binomCdf(n: number, p: number, k: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  const pmf = binomPmf(n, p);
  let s = 0;
  for (let i = 0; i <= k; i++) s += pmf[i]!;
  return Math.min(1, s);
}

/** Kenngrößen μ = n·p und σ = √(n·p·(1 − p)). */
export function binomMoments(n: number, p: number): { mu: number; sigma: number } {
  return { mu: n * p, sigma: Math.sqrt(n * p * (1 - p)) };
}

/**
 * Näherung P(X ≤ k) ≈ Φ((k + 0,5 − μ)/σ) mit Stetigkeitskorrektur
 * bzw. Φ((k − μ)/σ) ohne.
 */
export function normalApproxCdf(n: number, p: number, k: number, continuity = true): number {
  const { mu, sigma } = binomMoments(n, p);
  return cdf(k + (continuity ? 0.5 : 0), mu, sigma);
}

/**
 * Laplace-Bedingung (Faustregel): σ > 3 – dann ist die Näherung brauchbar.
 * Die kleine Toleranz sorgt dafür, dass Rundungsfehler den Grenzfall σ = 3
 * (z. B. n = 100, p = 0,1) nicht fälschlich als „erfüllt“ werten.
 */
export function laplaceOk(n: number, p: number): boolean {
  return binomMoments(n, p).sigma > 3 + 1e-9;
}

/** Kleinstes n, für das die Laplace-Bedingung σ > 3 bei festem p gilt (n > 9/(p(1 − p))). */
export function laplaceMinN(p: number): number {
  if (p <= 0 || p >= 1) return Infinity;
  let n = Math.max(1, Math.floor(9 / (p * (1 - p))) - 2);
  while (!laplaceOk(n, p)) n++;
  return n;
}

/* ------------------------------------------------------------------ */
/* Stichproben                                                         */
/* ------------------------------------------------------------------ */

/** Normalverteilte Zufallszahl (Box-Muller) aus gleichverteilten Zahlen von `rnd`. */
export function normalSample(rnd: () => number, mu: number, sigma: number): number {
  let u = 0;
  while (u <= 1e-12) u = rnd();
  const v = rnd();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Mittelwert, (Stichproben-)Standardabweichung und Anteil im Intervall [lo, hi]. */
export function sampleStats(xs: readonly number[], lo: number, hi: number): { mean: number; sd: number; share: number } {
  const n = xs.length;
  if (!n) return { mean: NaN, sd: NaN, share: NaN };
  let s = 0;
  let inside = 0;
  for (const x of xs) {
    s += x;
    if (x >= lo && x <= hi) inside++;
  }
  const mean = s / n;
  let q = 0;
  for (const x of xs) q += (x - mean) ** 2;
  return { mean, sd: n > 1 ? Math.sqrt(q / (n - 1)) : 0, share: inside / n };
}

/* ------------------------------------------------------------------ */
/* Umkehrung: Quantile                                                 */
/* ------------------------------------------------------------------ */

/**
 * Umkehrfunktion von Φ: z mit Φ(z) = p (0 < p < 1). Startwert nach Acklam
 * (rationale Näherung), danach ein Halley-Schritt mit der genauen Φ – genau auf etwa 1e-12.
 */
export function invPhi(p: number): number {
  if (!(p > 0 && p < 1)) return p <= 0 ? -Infinity : Infinity;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  let x: number;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) / ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  } else if (p > 1 - lo) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) / ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  } else {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q) / (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1);
  }
  // Halley-Schritt
  const e = cdf(x, 0, 1) - p;
  const u = e * SQRT_2PI * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

/** Art der Umkehrfrage: P(X ≤ x) = p, P(X ≥ x) = p oder P(μ − c ≤ X ≤ μ + c) = p. */
export type QuantKind = 'le' | 'ge' | 'mid';

/**
 * Grenze(n) zu einer vorgegebenen Wahrscheinlichkeit p (0 < p < 1).
 * Liefert die Grenzen lo/hi (±∞ bei einseitigen Fragen), den z-Wert und den Wert Φ(z),
 * den man in der Tabelle rückwärts sucht.
 */
export function quantile(kind: QuantKind, p: number, mu: number, sigma: number): { lo: number; hi: number; z: number; phi: number } {
  if (kind === 'le') {
    const z = invPhi(p);
    return { lo: -Infinity, hi: mu + z * sigma, z, phi: p };
  }
  if (kind === 'ge') {
    const z = invPhi(1 - p);
    return { lo: mu + z * sigma, hi: Infinity, z, phi: 1 - p };
  }
  const z = invPhi((1 + p) / 2);
  return { lo: mu - z * sigma, hi: mu + z * sigma, z, phi: (1 + p) / 2 };
}

/** Umgekehrt: Wahrscheinlichkeit p, die zur Grenze x (bzw. Halbbreite |x − μ|) gehört. */
export function probOfBound(kind: QuantKind, x: number, mu: number, sigma: number): number {
  if (kind === 'le') return cdf(x, mu, sigma);
  if (kind === 'ge') return 1 - cdf(x, mu, sigma);
  const c = Math.abs(x - mu);
  return prob(mu - c, mu + c, mu, sigma);
}

/* ------------------------------------------------------------------ */
/* Standardisieren als Überblendung                                    */
/* ------------------------------------------------------------------ */

/**
 * Zwischenstand t ∈ [0; 1] zwischen N(μ; σ²) (t = 0) und der Standardnormalverteilung (t = 1).
 * Jeder Wert x wandert linear zu z = (x − μ)/σ: x_t = (1 − t)·x + t·z.
 * Das ist selbst eine lineare Abbildung, die Verteilung bleibt normal mit
 * μ_t = (1 − t)·μ und σ_t = (1 − t)·σ + t – und jede markierte Fläche bleibt gleich groß.
 */
export function morphStandard(t: number, mu: number, sigma: number): { mu: number; sigma: number; map: (x: number) => number; unmap: (xt: number) => number } {
  const k = 1 - t + t / sigma;
  return {
    mu: (1 - t) * mu,
    sigma: (1 - t) * sigma + t,
    map: (x: number) => (Number.isFinite(x) ? x * k - (t * mu) / sigma : x),
    unmap: (xt: number) => (xt + (t * mu) / sigma) / k,
  };
}

/* ------------------------------------------------------------------ */
/* Eigenschaften der Glockenkurve                                      */
/* ------------------------------------------------------------------ */

/** Hochpunkt der Dichte: φ(μ) = 1/(σ√(2π)). */
export function pdfMax(sigma: number): number {
  return 1 / (sigma * SQRT_2PI);
}

/** Ableitung der Dichte φ'(x) = −(x − μ)/σ² · φ(x). */
export function pdfSlope(x: number, mu: number, sigma: number): number {
  return (-(x - mu) / (sigma * sigma)) * pdf(x, mu, sigma);
}

/**
 * Wendetangenten an den Wendestellen μ ± σ: Punkt, Steigung und Nullstelle.
 * Die Wendetangenten schneiden die x-Achse genau bei μ ± 2σ.
 */
export function inflectionTangents(mu: number, sigma: number): { x: number; y: number; slope: number; root: number }[] {
  return [-1, 1].map((s) => {
    const x = mu + s * sigma;
    const y = pdf(x, mu, sigma);
    const slope = pdfSlope(x, mu, sigma);
    return { x, y, slope, root: x - y / slope };
  });
}

/* ------------------------------------------------------------------ */
/* Zwei Verteilungen vergleichen (Toleranz)                            */
/* ------------------------------------------------------------------ */

/** Anteil im Toleranzbereich [lo; hi], Ausschuss unten/oben und gesamt. */
export function tolerance(mu: number, sigma: number, lo: number, hi: number): { inside: number; below: number; above: number; reject: number } {
  const a = Math.min(lo, hi);
  const b = Math.max(lo, hi);
  const below = cdf(a, mu, sigma);
  const above = 1 - cdf(b, mu, sigma);
  return { inside: prob(a, b, mu, sigma), below, above, reject: below + above };
}

/**
 * Größte Standardabweichung, mit der eine mittig eingestellte Anlage (μ in der Mitte
 * von [lo; hi]) noch den Anteil `share` im Toleranzbereich hält: σ = (hi − lo)/2 / z.
 */
export function maxSigmaFor(lo: number, hi: number, share: number): number {
  return Math.abs(hi - lo) / 2 / invPhi((1 + share) / 2);
}
