/**
 * Rechenlogik „Fourier-Reihen“ (Studium).
 *
 * Eine 2π-periodische Funktion wird als Summe von Sinus- und Kosinus-
 * schwingungen dargestellt:
 *   f(x) ≈ a₀/2 + Σ_{k=1}^{N} (aₖ cos kx + bₖ sin kx)
 * mit aₖ = (1/π) ∫ f(x) cos kx dx und bₖ = (1/π) ∫ f(x) sin kx dx über eine Periode.
 *
 * Für die Beispielsignale sind die Koeffizienten bekannt (alle auf (−π, π]):
 *   Rechteck  sign x                     bₖ = 4/(πk)            (k ungerade)
 *   Sägezahn  x/π                        bₖ = 2·(−1)^{k+1}/(πk)
 *   Dreieck   1 − 2|x|/π                 aₖ = 8/(π²k²)          (k ungerade)
 *   Trapez    Rechteck mit Rampen der halben Breite α = w·π/2
 *                                        bₖ = 4/(πk) · sin(kα)/(kα) (k ungerade)
 *   Puls      1 für |x| < πd, sonst 0    a₀/2 = d, aₖ = 2 sin(πkd)/(πk)
 *   Einweg    max(sin x, 0)              a₀/2 = 1/π, b₁ = 1/2, aₖ = −2/(π(k² − 1)) (k gerade)
 *   Zweiweg   |sin x|                    a₀/2 = 2/π, aₖ = −4/(π(k² − 1)) (k gerade)
 *   eigener Klang  Σ cₖ sin kx (k = 1 … 8)
 *
 * An Sprungstellen schießt die Partialsumme um rund 9 % der Sprunghöhe über
 * (Gibbs-Phänomen) – unabhängig davon, wie groß N ist. Glättungsfaktoren σₖ
 * (Fejér, Lanczos) dämpfen die hohen Glieder und verringern das Überschwingen.
 *
 * Parseval: Die mittlere Leistung P = (1/2π) ∫ f² dx verteilt sich auf die Glieder,
 *   P = (a₀/2)² + ½ Σ (aₖ² + bₖ²).
 */

export type SigKey = 'sq' | 'saw' | 'tri' | 'trap' | 'pulse' | 'half' | 'full' | 'own';
export type SmoothKey = 'none' | 'fejer' | 'lanczos';

/** Form-Parameter: Tastgrad d (Puls), Flankenanteil w (Trapez), Sinus-Amplituden c₁ … (eigener Klang). */
export interface Shape {
  d?: number;
  w?: number;
  c?: readonly number[];
}

const PI = Math.PI;
const TAU = 2 * PI;
const DEF_D = 0.5;
const DEF_W = 0.5;

/** Winkel auf (−π, π] zurückführen. */
export function wrap(x: number): number {
  let t = ((x + PI) % TAU + TAU) % TAU - PI;
  if (t === -PI) t = PI;
  return t;
}

const duty = (s?: Shape) => Math.min(0.999, Math.max(0.001, s?.d ?? DEF_D));
const flank = (s?: Shape) => Math.min(1, Math.max(0.001, s?.w ?? DEF_W));

/** Zielfunktion auf einer Periode (−π, π], periodisch fortgesetzt; an Sprüngen der Mittelwert. */
export function target(sig: SigKey, x: number, shape?: Shape): number {
  const t = wrap(x);
  const at = Math.abs(t);
  switch (sig) {
    case 'sq':
      return t === 0 || at === PI ? 0 : Math.sign(t);
    case 'saw':
      return at === PI ? 0 : t / PI;
    case 'tri':
      return 1 - (2 * at) / PI;
    case 'trap': {
      const a = (flank(shape) * PI) / 2;
      const u = at > PI / 2 ? PI - at : at;
      return Math.sign(t) * Math.min(1, u / a);
    }
    case 'pulse': {
      const e = PI * duty(shape);
      return at < e ? 1 : at === e ? 0.5 : 0;
    }
    case 'half':
      return Math.max(Math.sin(t), 0);
    case 'full':
      return Math.abs(Math.sin(t));
    case 'own': {
      const c = shape?.c ?? [];
      let y = 0;
      for (let k = 1; k <= c.length; k++) y += (c[k - 1] ?? 0) * Math.sin(k * t);
      return y;
    }
  }
}

/** a₀ (der konstante Anteil ist a₀/2). */
export function a0(sig: SigKey, shape?: Shape): number {
  if (sig === 'half') return 2 / PI;
  if (sig === 'full') return 4 / PI;
  if (sig === 'pulse') return 2 * duty(shape);
  return 0;
}

/** Koeffizienten aₖ, bₖ für k ≥ 1. */
export function coef(sig: SigKey, k: number, shape?: Shape): { a: number; b: number } {
  const odd = k % 2 === 1;
  switch (sig) {
    case 'sq':
      return { a: 0, b: odd ? 4 / (PI * k) : 0 };
    case 'saw':
      return { a: 0, b: ((odd ? 1 : -1) * 2) / (PI * k) };
    case 'tri':
      return { a: odd ? 8 / (PI * PI * k * k) : 0, b: 0 };
    case 'trap': {
      if (!odd) return { a: 0, b: 0 };
      const ka = (k * flank(shape) * PI) / 2;
      return { a: 0, b: ((4 / (PI * k)) * Math.sin(ka)) / ka };
    }
    case 'pulse':
      return { a: (2 * Math.sin(PI * k * duty(shape))) / (PI * k), b: 0 };
    case 'half':
      if (k === 1) return { a: 0, b: 0.5 };
      return { a: odd ? 0 : -2 / (PI * (k * k - 1)), b: 0 };
    case 'full':
      return { a: odd ? 0 : -4 / (PI * (k * k - 1)), b: 0 };
    case 'own':
      return { a: 0, b: shape?.c?.[k - 1] ?? 0 };
  }
}

/** Amplitude der k-ten Teilschwingung √(aₖ² + bₖ²). */
export function amplitude(sig: SigKey, k: number, shape?: Shape): number {
  const c = coef(sig, k, shape);
  return Math.hypot(c.a, c.b);
}

/** k-te Teilschwingung an der Stelle x. */
export function harmonic(sig: SigKey, k: number, x: number, shape?: Shape): number {
  const c = coef(sig, k, shape);
  return c.a * Math.cos(k * x) + c.b * Math.sin(k * x);
}

/** Partialsumme S_N(x). */
export function partial(sig: SigKey, N: number, x: number, shape?: Shape): number {
  let y = a0(sig, shape) / 2;
  for (let k = 1; k <= N; k++) y += harmonic(sig, k, x, shape);
  return y;
}

/** Größter Wert der Partialsumme auf (0, π) (für das Gibbs-Phänomen). */
export function maxPartial(sig: SigKey, N: number, samples = 4000, shape?: Shape): number {
  let m = -Infinity;
  for (let i = 1; i < samples; i++) m = Math.max(m, partial(sig, N, (PI * i) / samples, shape));
  return m;
}

/** Mittlere Leistung P = (1/2π) ∫ f(x)² dx über eine Periode (exakt). */
export function power(sig: SigKey, shape?: Shape): number {
  switch (sig) {
    case 'sq':
      return 1;
    case 'saw':
    case 'tri':
      return 1 / 3;
    case 'trap':
      return 1 - (2 * flank(shape)) / 3;
    case 'pulse':
      return duty(shape);
    case 'half':
      return 1 / 4;
    case 'full':
      return 1 / 2;
    case 'own':
      return (shape?.c ?? []).reduce((s, c) => s + (c * c) / 2, 0);
  }
}

/**
 * Anteil der Leistung in den ersten N Gliedern (Parseval), Gleichanteil eingerechnet:
 *   [(a₀/2)² + ½ Σ_{k≤N} (aₖ² + bₖ²)] / P.
 */
export function energyShare(sig: SigKey, N: number, shape?: Shape): number {
  const P = power(sig, shape);
  if (P <= 0) return 1;
  const m = a0(sig, shape) / 2;
  let s = m * m;
  for (let k = 1; k <= N; k++) {
    const c = coef(sig, k, shape);
    s += (c.a * c.a + c.b * c.b) / 2;
  }
  return Math.min(1, s / P);
}

/** Höhe der Sprünge (0: stetiges Signal). */
export function jumpHeight(sig: SigKey): number {
  if (sig === 'sq' || sig === 'saw') return 2;
  if (sig === 'pulse') return 1;
  return 0;
}

/** Glättungsfaktor σₖ für die Partialsumme S_N (Fejér: arithmetisches Mittel, Lanczos: sinc). */
export function sigma(kind: SmoothKey, k: number, N: number): number {
  if (k > N) return 0;
  if (kind === 'fejer') return 1 - k / (N + 1);
  if (kind === 'lanczos') {
    const u = (PI * k) / (N + 1);
    return Math.sin(u) / u;
  }
  return 1;
}

/* ---------- Signal mit Amplitude und Phasenverschiebung ---------- */

/** Vollständige Beschreibung des dargestellten Signals g(x) = A · f(x − φ). */
export interface SeriesSpec {
  sig: SigKey;
  shape?: Shape;
  /** Amplitude A (Streckfaktor). */
  A: number;
  /** Phasenverschiebung φ in rad (Verschiebung nach rechts). */
  phi: number;
}

/** Koeffizienten eines Signals bis K (Index 0 ungenutzt). */
export interface Coeffs {
  mean: number;
  a: Float64Array;
  b: Float64Array;
  K: number;
}

/**
 * Koeffizienten von g(x) = A · f(x − φ):
 *   aₖ' = A (aₖ cos kφ − bₖ sin kφ),  bₖ' = A (aₖ sin kφ + bₖ cos kφ).
 * Die Amplituden bleiben (bis auf A) gleich, nur die Phasen ändern sich.
 */
export function coefficients(spec: SeriesSpec, K: number): Coeffs {
  const a = new Float64Array(K + 1);
  const b = new Float64Array(K + 1);
  for (let k = 1; k <= K; k++) {
    const c = coef(spec.sig, k, spec.shape);
    const cs = Math.cos(k * spec.phi);
    const sn = Math.sin(k * spec.phi);
    a[k] = clean(spec.A * (c.a * cs - c.b * sn));
    b[k] = clean(spec.A * (c.a * sn + c.b * cs));
  }
  return { mean: (spec.A * a0(spec.sig, spec.shape)) / 2, a, b, K };
}

const clean = (v: number) => (Math.abs(v) < 1e-13 ? 0 : v);

/** Zielsignal g(x) = A · f(x − φ). */
export function targetOf(spec: SeriesSpec, x: number): number {
  return spec.A * target(spec.sig, x - spec.phi, spec.shape);
}

/** Mittlere Leistung von g. */
export function powerOf(spec: SeriesSpec): number {
  return spec.A * spec.A * power(spec.sig, spec.shape);
}

/**
 * Wert der (gewichteten) Partialsumme: mean + Σ wₖ (aₖ cos kx + bₖ sin kx).
 * Ohne Gewichte: alle Glieder bis N mit Gewicht 1.
 */
export function evalSeries(co: Coeffs, N: number, x: number, w?: ArrayLike<number>): number {
  let y = co.mean;
  const n = Math.min(N, co.K);
  for (let k = 1; k <= n; k++) {
    const wk = w ? w[k]! : 1;
    if (wk === 0) continue;
    const ak = co.a[k]!;
    const bk = co.b[k]!;
    if (ak === 0 && bk === 0) continue;
    y += wk * (ak * Math.cos(k * x) + bk * Math.sin(k * x));
  }
  return y;
}

/** Größter Wert der Partialsumme über eine ganze Periode (Abtasten und Verfeinern). */
export function maxOfSeries(co: Coeffs, N: number, w?: ArrayLike<number>, samples = 1600): { x: number; y: number } {
  let bx = 0;
  let by = -Infinity;
  for (let i = 0; i < samples; i++) {
    const x = -PI + (TAU * i) / samples;
    const y = evalSeries(co, N, x, w);
    if (y > by) {
      by = y;
      bx = x;
    }
  }
  // Goldener Schnitt im Nachbarintervall
  let lo = bx - TAU / samples;
  let hi = bx + TAU / samples;
  const gr = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 40; i++) {
    const m1 = hi - gr * (hi - lo);
    const m2 = lo + gr * (hi - lo);
    if (evalSeries(co, N, m1, w) > evalSeries(co, N, m2, w)) hi = m2;
    else lo = m1;
  }
  const x = (lo + hi) / 2;
  return { x, y: Math.max(by, evalSeries(co, N, x, w)) };
}

/**
 * Sinusform einer Teilschwingung: aₖ cos kx + bₖ sin kx = Âₖ · sin(kx + φₖ)
 * mit Âₖ = √(aₖ² + bₖ²) und φₖ = atan2(aₖ, bₖ) (Nullphase, in rad, (−π, π]).
 */
export function polar(a: number, b: number): { amp: number; phase: number } {
  const amp = Math.hypot(a, b);
  return { amp, phase: amp < 1e-12 ? 0 : Math.atan2(a, b) };
}

/** Leistungsanteil der ersten N Glieder für ein Signal mit Gewichten (Glättung) – Gleichanteil eingerechnet. */
export function shareOf(co: Coeffs, P: number, N: number, w?: ArrayLike<number>): number {
  if (P <= 0) return 1;
  let s = co.mean * co.mean;
  const n = Math.min(N, co.K);
  for (let k = 1; k <= n; k++) {
    const wk = w ? w[k]! : 1;
    s += (wk * wk * (co.a[k]! ** 2 + co.b[k]! ** 2)) / 2;
  }
  return s / P;
}

/* ---------- Merkmale (Symmetrie, Abfall der Amplituden) ---------- */

export interface Features {
  /** gerade Funktion: nur Kosinusglieder (alle bₖ = 0) */
  even: boolean;
  /** ungerade Funktion: nur Sinusglieder (alle aₖ = 0 und kein Gleichanteil) */
  odd: boolean;
  /** Halbwellensymmetrie g(x + π) = −g(x): nur ungerade k */
  halfWave: boolean;
  /** nur gerade k (Periode π) */
  evenOnly: boolean;
  /** Abfall der Amplituden: 1 (Sprünge), 2 (Knicke), 0 (endlich viele Glieder) */
  decay: 0 | 1 | 2;
}

/** Symmetrien aus den Koeffizienten ablesen (bis K), Abfall aus der Signalart. */
export function features(spec: SeriesSpec, K = 24): Features {
  const co = coefficients(spec, K);
  const eps = 1e-9 * Math.max(1, Math.abs(spec.A));
  let anyA = false;
  let anyB = false;
  let anyEven = false;
  let anyOdd = false;
  for (let k = 1; k <= K; k++) {
    const nz = Math.hypot(co.a[k]!, co.b[k]!) > eps;
    if (Math.abs(co.a[k]!) > eps) anyA = true;
    if (Math.abs(co.b[k]!) > eps) anyB = true;
    if (nz && k % 2 === 0) anyEven = true;
    if (nz && k % 2 === 1) anyOdd = true;
  }
  const dc = Math.abs(co.mean) > eps;
  const decay: 0 | 1 | 2 = spec.sig === 'own' ? 0 : jumpHeight(spec.sig) > 0 ? 1 : 2;
  return { even: !anyB, odd: !anyA && !dc, halfWave: !anyEven && !dc, evenOnly: !anyOdd, decay };
}
