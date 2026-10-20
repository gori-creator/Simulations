/**
 * Rechenlogik „Vom Graphen zur Stammfunktion“ (Jgst. 12/13).
 *
 * F ist Stammfunktion von f, wenn F′ = f. Die Werte von f sind also die
 * Steigungen von F. Daraus folgt für das grafische Aufleiten:
 * - f > 0 ⇒ F steigt, f < 0 ⇒ F fällt
 * - Nullstelle von f mit Vorzeichenwechsel ⇒ Extremstelle von F
 *   (+ → −: Hochpunkt, − → +: Tiefpunkt); ohne Vorzeichenwechsel ⇒ Terrassenpunkt
 * - Extremstelle von f ⇒ Wendestelle von F
 * - Fläche zwischen zwei Nullstellen von f = Höhenänderung von F dort
 * Alle Stammfunktionen unterscheiden sich nur um eine Konstante C:
 * F(x) = F₀(x) + C. Ein Anfangswert F(x₀) = y₀ legt C fest:
 * C = y₀ − F₀(x₀) (Anfangswertproblem).
 *
 * Jede Funktion bringt eine „Grundstammfunktion“ F₀ in Schulform mit
 * (z. B. eˣ zu eˣ, −cos x zu sin x). Für abschnittsweise definierte und
 * gezeichnete Funktionen ist F₀(x) = ∫₀ˣ f(t) dt (exakt berechnet).
 */

export type FnKey = 'lin' | 'par' | 'cub' | 'sin' | 'cos' | 'exp' | 'gauss' | 'bell' | 'step' | 'own';
export type AppKey = 'pool' | 'konto' | 'ballon' | 'lift' | 'heat' | 'akku' | 'park' | 'co2';

export interface Fn {
  f: (x: number) => number;
  /** Grundstammfunktion F₀ (alle Stammfunktionen: F₀ + C) */
  F: (x: number) => number;
  /** dargestellter Bereich */
  x: [number, number];
  /** sieben Stützstellen für die eigene Skizze von F (Aufgabenmodus) */
  nodes: number[];
  /** Sprungstellen von f (dort hat F einen Knick) */
  jumps?: number[];
  /** Knickstellen von f */
  kinks?: number[];
}

/** Koeffizienten der Funktionen (Regler der Simulation). */
export interface Coeffs {
  /** Gerade f(x) = m·x + t */
  lm: number;
  lt: number;
  /** Parabel f(x) = a·x² + b·x + c */
  pa: number;
  pb: number;
  pc: number;
  /** Polynom 3. Grades f(x) = k₃x³ + k₂x² + k₁x + k₀ */
  k3: number;
  k2: number;
  k1: number;
  k0: number;
  /** A·sin(bx) bzw. A·cos(bx) */
  sa: number;
  sb: number;
  /** c·e^(kx) */
  ea: number;
  eb: number;
  /** Breite σ der Glocken */
  gs: number;
  /** Treppe: s₁ (x < j₁), s₂ (j₁ ≤ x < j₂), s₃ (x ≥ j₂) */
  s1: number;
  s2: number;
  s3: number;
  j1: number;
  j2: number;
  /** gezeichnete Funktion: Werte an x = −3, −2, …, 3 */
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
}

export const DEFAULT_COEFFS: Coeffs = {
  lm: 0.5,
  lt: 0,
  pa: 1,
  pb: 0,
  pc: -1,
  k3: 0.25,
  k2: 0,
  k1: -1,
  k0: 0,
  sa: 1,
  sb: 1,
  ea: 1,
  eb: 1,
  gs: 1,
  s1: 1,
  s2: -1,
  s3: 0.5,
  j1: -1,
  j2: 1.5,
  q1: -1.5,
  q2: 0,
  q3: 1.5,
  q4: 1,
  q5: -0.5,
  q6: -1,
  q7: 0.5,
};

/** Stützstellen der gezeichneten Funktion. */
export const OWN_X = [-3, -2, -1, 0, 1, 2, 3];

const PI = Math.PI;
const SQRT_PI = Math.sqrt(PI);
const INT7 = [-3, -2, -1, 0, 1, 2, 3];
const HALF_PI7 = [-3, -2, -1, 0, 1, 2, 3].map((k) => (k * PI) / 2);

/**
 * Fehlerfunktion erf(x) = 2/√π ∫₀ˣ e^(−t²) dt.
 * |x| < 2,5: Taylorreihe, sonst Kettenbruch für erfc (Genauigkeit ≈ 1e−14).
 */
export function erf(x: number): number {
  const ax = Math.abs(x);
  if (ax < 2.5) {
    let term = x;
    let sum = x;
    const x2 = x * x;
    for (let n = 1; n < 80; n++) {
      term *= -x2 / n;
      const add = term / (2 * n + 1);
      sum += add;
      if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
    }
    return (2 / SQRT_PI) * sum;
  }
  let k = ax;
  for (let n = 60; n >= 1; n--) k = ax + n / 2 / k;
  const erfc = Math.exp(-ax * ax) / (SQRT_PI * k);
  return Math.sign(x) * (1 - erfc);
}

/* ---------------- Bausteine: abschnittsweise linear, Spline ---------------- */

/**
 * Abschnittsweise lineare Funktion durch die Punkte (x | y); ein doppelter
 * x-Wert erzeugt eine Sprungstelle (rechtsseitig stetig). Außerhalb konstant
 * fortgesetzt. F ist das exakte Integral mit F(anchor) = 0.
 */
export function piecewiseLinear(pts: readonly (readonly [number, number])[], anchor = 0): { f: (x: number) => number; F: (x: number) => number; jumps: number[]; kinks: number[] } {
  const segs: { a: number; b: number; va: number; vb: number }[] = [];
  const jumps: number[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [a, va] = pts[i]!;
    const [b, vb] = pts[i + 1]!;
    if (b - a <= 1e-12) {
      if (Math.abs(vb - va) > 1e-12) jumps.push(a);
      continue;
    }
    segs.push({ a, b, va, vb });
  }
  const kinks: number[] = [];
  for (let i = 0; i + 1 < segs.length; i++) {
    const s = segs[i]!;
    const t = segs[i + 1]!;
    if (Math.abs(s.b - t.a) > 1e-12) continue;
    const k1 = (s.vb - s.va) / (s.b - s.a);
    const k2 = (t.vb - t.va) / (t.b - t.a);
    if (Math.abs(s.vb - t.va) < 1e-12 && Math.abs(k1 - k2) > 1e-12) kinks.push(s.b);
  }
  const first = segs[0]!;
  const last = segs[segs.length - 1]!;
  const cum: number[] = [0];
  for (const s of segs) cum.push(cum[cum.length - 1]! + ((s.va + s.vb) / 2) * (s.b - s.a));
  const f = (x: number): number => {
    if (x < first.a) return first.va;
    for (const s of segs) if (x < s.b) return s.va + ((s.vb - s.va) * (x - s.a)) / (s.b - s.a);
    return last.vb;
  };
  const raw = (x: number): number => {
    if (x <= first.a) return first.va * (x - first.a);
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i]!;
      if (x <= s.b) {
        const d = x - s.a;
        const k = (s.vb - s.va) / (s.b - s.a);
        return cum[i]! + s.va * d + (k * d * d) / 2;
      }
    }
    return cum[segs.length]! + last.vb * (x - last.b);
  };
  const r0 = raw(anchor);
  return { f, F: (x) => raw(x) - r0, jumps, kinks };
}

/**
 * Glatte Kurve durch Stützpunkte (kubische Hermite-Interpolation mit
 * Catmull-Rom-Tangenten, auch für ungleiche Abstände). Lineare Daten werden
 * exakt wiedergegeben. F ist das exakte Integral mit F(anchor) = 0.
 * Außerhalb der Stützstellen linear fortgesetzt.
 */
export function spline(xs: readonly number[], ys: readonly number[], anchor = 0): { f: (x: number) => number; F: (x: number) => number; d: (x: number) => number } {
  const n = xs.length - 1;
  const m: number[] = [];
  for (let i = 0; i <= n; i++) {
    if (i === 0) m.push((ys[1]! - ys[0]!) / (xs[1]! - xs[0]!));
    else if (i === n) m.push((ys[n]! - ys[n - 1]!) / (xs[n]! - xs[n - 1]!));
    else m.push((ys[i + 1]! - ys[i - 1]!) / (xs[i + 1]! - xs[i - 1]!));
  }
  /** Integral über das Teilstück [xᵢ; xᵢ + u·h] (exakt für das kubische Stück). */
  const segInt = (i: number, u: number): number => {
    const h = xs[i + 1]! - xs[i]!;
    const H00 = u ** 4 / 2 - u ** 3 + u;
    const H10 = u ** 4 / 4 - (2 * u ** 3) / 3 + (u * u) / 2;
    const H01 = -(u ** 4) / 2 + u ** 3;
    const H11 = u ** 4 / 4 - u ** 3 / 3;
    return h * (H00 * ys[i]! + H10 * h * m[i]! + H01 * ys[i + 1]! + H11 * h * m[i + 1]!);
  };
  const cum: number[] = [0];
  for (let i = 0; i < n; i++) cum.push(cum[i]! + segInt(i, 1));
  const seg = (x: number): number => {
    for (let i = 0; i < n - 1; i++) if (x < xs[i + 1]!) return i;
    return n - 1;
  };
  const f = (x: number): number => {
    if (x < xs[0]!) return ys[0]! + m[0]! * (x - xs[0]!);
    if (x > xs[n]!) return ys[n]! + m[n]! * (x - xs[n]!);
    const i = seg(x);
    const h = xs[i + 1]! - xs[i]!;
    const u = (x - xs[i]!) / h;
    const h00 = 2 * u ** 3 - 3 * u * u + 1;
    const h10 = u ** 3 - 2 * u * u + u;
    const h01 = -2 * u ** 3 + 3 * u * u;
    const h11 = u ** 3 - u * u;
    return h00 * ys[i]! + h10 * h * m[i]! + h01 * ys[i + 1]! + h11 * h * m[i + 1]!;
  };
  const d = (x: number): number => {
    if (x < xs[0]!) return m[0]!;
    if (x > xs[n]!) return m[n]!;
    const i = seg(x);
    const h = xs[i + 1]! - xs[i]!;
    const u = (x - xs[i]!) / h;
    const d00 = 6 * u * u - 6 * u;
    const d10 = 3 * u * u - 4 * u + 1;
    const d01 = -6 * u * u + 6 * u;
    const d11 = 3 * u * u - 2 * u;
    return (d00 * ys[i]! + d01 * ys[i + 1]!) / h + d10 * m[i]! + d11 * m[i + 1]!;
  };
  const raw = (x: number): number => {
    if (x < xs[0]!) {
      const dd = x - xs[0]!;
      return ys[0]! * dd + (m[0]! * dd * dd) / 2;
    }
    if (x > xs[n]!) {
      const dd = x - xs[n]!;
      return cum[n]! + ys[n]! * dd + (m[n]! * dd * dd) / 2;
    }
    const i = seg(x);
    return cum[i]! + segInt(i, (x - xs[i]!) / (xs[i + 1]! - xs[i]!));
  };
  const r0 = raw(anchor);
  return { f, F: (x) => raw(x) - r0, d };
}

/* ---------------- Mathematische Funktionen ---------------- */

/** Mathematische Funktion nach Schlüssel und Koeffizienten. */
export function mathFn(key: FnKey, c: Coeffs = DEFAULT_COEFFS): Fn {
  switch (key) {
    case 'lin':
      return { f: (x) => c.lm * x + c.lt, F: (x) => (c.lm * x * x) / 2 + c.lt * x, x: [-4, 4], nodes: INT7 };
    case 'par':
      return {
        f: (x) => (c.pa * x + c.pb) * x + c.pc,
        F: (x) => ((c.pa / 3) * x + c.pb / 2) * x * x + c.pc * x,
        x: [-3, 3],
        nodes: INT7,
      };
    case 'cub':
      return {
        f: (x) => ((c.k3 * x + c.k2) * x + c.k1) * x + c.k0,
        F: (x) => (((c.k3 / 4) * x + c.k2 / 3) * x + c.k1 / 2) * x * x + c.k0 * x,
        x: [-3.2, 3.2],
        nodes: INT7,
      };
    case 'sin': {
      const b = c.sb;
      return { f: (x) => c.sa * Math.sin(b * x), F: (x) => (-c.sa / b) * Math.cos(b * x), x: [-6.5, 6.5], nodes: HALF_PI7 };
    }
    case 'cos': {
      const b = c.sb;
      return { f: (x) => c.sa * Math.cos(b * x), F: (x) => (c.sa / b) * Math.sin(b * x), x: [-6.5, 6.5], nodes: HALF_PI7 };
    }
    case 'exp': {
      const k = c.eb;
      const nodes = [-4, -3, -2, -1, 0, 1, 2];
      if (Math.abs(k) < 1e-12) return { f: () => c.ea, F: (x) => c.ea * x, x: [-4, 2.4], nodes };
      return { f: (x) => c.ea * Math.exp(k * x), F: (x) => (c.ea / k) * Math.exp(k * x), x: [-4, 2.4], nodes };
    }
    case 'gauss': {
      // f(x) = x · e^(−x²/(2σ²)), F₀(x) = −σ² · e^(−x²/(2σ²))
      const s2 = c.gs * c.gs;
      return { f: (x) => x * Math.exp(-(x * x) / (2 * s2)), F: (x) => -s2 * Math.exp(-(x * x) / (2 * s2)), x: [-4, 4], nodes: INT7 };
    }
    case 'bell': {
      // Glockenkurve e^(−x²/(2σ²)); Stammfunktion nicht elementar (Fehlerfunktion)
      const s = c.gs;
      return { f: (x) => Math.exp(-(x * x) / (2 * s * s)), F: (x) => s * Math.sqrt(PI / 2) * erf(x / (s * Math.SQRT2)), x: [-4, 4], nodes: INT7 };
    }
    case 'step': {
      const a = Math.min(c.j1, c.j2);
      const b = Math.max(c.j1, c.j2);
      const pw = piecewiseLinear(
        [
          [-4, c.s1],
          [a, c.s1],
          [a, c.s2],
          [b, c.s2],
          [b, c.s3],
          [4, c.s3],
        ],
        0,
      );
      return { f: pw.f, F: pw.F, x: [-4, 4], nodes: INT7, jumps: pw.jumps.filter((j) => j > -4 && j < 4) };
    }
    case 'own': {
      const sp = spline(OWN_X, [c.q1, c.q2, c.q3, c.q4, c.q5, c.q6, c.q7], 0);
      return { f: sp.f, F: sp.F, x: [-3, 3], nodes: INT7 };
    }
  }
}

/* ---------------- Anwendungen ---------------- */

export interface App extends Fn {
  /** Startzeitpunkt (Anfangsstelle) */
  t0: number;
  /** Anfangsbestand */
  y0: number;
  /** Stufe für „Anfangsbestand verschieben“ */
  step: number;
}

/** Aufzug: Geschwindigkeit in m/s (anfahren, fahren, bremsen; Pause; abwärts). */
const LIFT = piecewiseLinear(
  [
    [0, 0],
    [2, 2],
    [8, 2],
    [10, 0],
    [13, 0],
    [15, -2],
    [17, -2],
    [19, 0],
    [20, 0],
  ],
  0,
);
/** CO₂ im Klassenzimmer: Änderung in ppm/min (Unterricht, 5 min Stoßlüften, Unterricht). */
const CO2 = piecewiseLinear(
  [
    [0, 20],
    [45, 20],
    [45, -160],
    [50, -160],
    [50, 20],
    [60, 20],
  ],
  0,
);

export const APPS: Record<AppKey, App> = {
  /** Regenrückhaltebecken: q(t) = −0,5(t − 1)(t − 7) m³/h, V(0) = 20 m³. */
  pool: {
    f: (t) => -0.5 * t * t + 4 * t - 3.5,
    F: (t) => -(t ** 3) / 6 + 2 * t * t - 3.5 * t,
    x: [0, 10],
    nodes: [0, 1, 2.5, 4, 5.5, 7, 10],
    t0: 0,
    y0: 20,
    step: 2,
  },
  /** Sparkonto: Einzahlungsrate r(t) = 100 − 20t €/Monat, K(0) = 200 €. */
  konto: { f: (t) => 100 - 20 * t, F: (t) => 100 * t - 10 * t * t, x: [0, 12], nodes: [0, 2, 4, 6, 8, 10, 12], t0: 0, y0: 200, step: 50 },
  /** Heißluftballon: v(t) = 30·sin(πt/10) m/min, Start am Boden. */
  ballon: { f: (t) => 30 * Math.sin((PI * t) / 10), F: (t) => (-300 / PI) * Math.cos((PI * t) / 10), x: [0, 20], nodes: [0, 4, 7, 10, 13, 16, 20], t0: 0, y0: 0, step: 25 },
  /** Aufzug: Trapezprofil, Etagen 4 m: Erdgeschoss → 16 m → 8 m. */
  lift: { f: LIFT.f, F: LIFT.F, x: [0, 20], nodes: [0, 4, 8, 10, 13, 17, 20], kinks: LIFT.kinks, t0: 0, y0: 0, step: 4 },
  /** Zimmer heizen: T′(t) = 4·e^(−t/2) − 0,5 K/h, T(0) = 16 °C. */
  heat: { f: (t) => 4 * Math.exp(-t / 2) - 0.5, F: (t) => -8 * Math.exp(-t / 2) - 0.5 * t, x: [0, 10], nodes: [0, 1, 2, 4, 6, 8, 10], t0: 0, y0: 16, step: 1 },
  /** Handy-Akku: Ladestrom I(t) = 2·e^(−t/2) A, Q(0) = 0,5 Ah. */
  akku: { f: (t) => 2 * Math.exp(-t / 2), F: (t) => -4 * Math.exp(-t / 2), x: [0, 8], nodes: [0, 1, 2, 3, 4, 6, 8], t0: 0, y0: 0.5, step: 0.25 },
  /** Parkhaus: r(t) = 100·sin(π(t − 7)/10) Autos/h, N(6 Uhr) = 40. */
  park: {
    f: (t) => 100 * Math.sin((PI * (t - 7)) / 10),
    F: (t) => (-1000 / PI) * Math.cos((PI * (t - 7)) / 10),
    x: [6, 20],
    nodes: [6, 8, 10, 12, 14, 17, 20],
    t0: 6,
    y0: 40,
    step: 20,
  },
  /** Klassenzimmer: CO₂-Änderung in ppm/min, K(0) = 500 ppm. */
  co2: { f: CO2.f, F: CO2.F, x: [0, 60], nodes: [0, 15, 30, 45, 50, 55, 60], jumps: CO2.jumps, t0: 0, y0: 500, step: 50 },
};

/* ---------------- Stammfunktionen und Anfangswertproblem ---------------- */

/** Konstante C, damit F₀ + C durch den Punkt (x₀ | y₀) geht. */
export function constantFor(fn: Fn, x0: number, y0: number): number {
  return y0 - fn.F(x0);
}

/** Stammfunktion F₀ + C an der Stelle x. */
export function anti(fn: Fn, C: number, x: number): number {
  return fn.F(x) + C;
}

/** Numerische Ableitung (zentraler Differenzenquotient). */
export function deriv(f: (x: number) => number, x: number, d = 1e-5): number {
  return (f(x + d) - f(x - d)) / (2 * d);
}

/** Numerisches Integral ∫ₐᵇ f(t) dt (Simpson), zum Prüfen. */
export function integrate(f: (x: number) => number, a: number, b: number, n = 400): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

/** Wertebereich einer Funktion auf [x0; x1] (abgetastet). */
export function rangeOf(f: (x: number) => number, x0: number, x1: number, samples = 300): { lo: number; hi: number } {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const y = f(x0 + ((x1 - x0) * i) / samples);
    if (!Number.isFinite(y)) continue;
    lo = Math.min(lo, y);
    hi = Math.max(hi, y);
  }
  if (!Number.isFinite(lo)) return { lo: -1, hi: 1 };
  return { lo, hi };
}

/* ---------------- Merkmale ---------------- */

export interface Zero {
  x: number;
  /** Richtung des Vorzeichenwechsels von f: +1 (− → +), −1 (+ → −), 0 ohne Wechsel */
  sign: -1 | 0 | 1;
  /** Vorzeichenwechsel an einer Sprungstelle von f (F hat dort einen Knick) */
  jump?: boolean;
}

/** Nullstellen von f in [x0; x1]: mit Vorzeichenwechsel und Berührstellen. */
export function zeros(f: (x: number) => number, x0: number, x1: number, samples = 800): Zero[] {
  const out: Zero[] = [];
  const dx = (x1 - x0) / samples;
  let scale = 0;
  const ys: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const y = f(x0 + i * dx);
    ys.push(y);
    if (Number.isFinite(y)) scale = Math.max(scale, Math.abs(y));
  }
  const tiny = 1e-9 * Math.max(1, scale);
  for (let i = 0; i < samples; i++) {
    const ya = ys[i]!;
    const yb = ys[i + 1]!;
    if (!Number.isFinite(ya) || !Number.isFinite(yb)) continue;
    if (Math.abs(ya) <= tiny) {
      const prev = i > 0 ? ys[i - 1]! : ya;
      if (i > 0 && Math.abs(prev) > tiny && Math.abs(yb) > tiny) {
        const sign = Math.sign(prev) !== Math.sign(yb) ? (yb > 0 ? 1 : -1) : 0;
        out.push({ x: x0 + i * dx, sign });
      }
      continue;
    }
    if (Math.abs(yb) <= tiny) continue;
    if (ya * yb < 0) {
      let lo = x0 + i * dx;
      let hi = lo + dx;
      let flo = ya;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (fm * flo <= 0) hi = mid;
        else {
          lo = mid;
          flo = fm;
        }
      }
      // Sprung über null (Treppe) ist keine Nullstelle
      const xz = (lo + hi) / 2;
      if (Math.abs(f(xz)) < 1e-6 * Math.max(1, scale)) out.push({ x: xz, sign: yb > 0 ? 1 : -1 });
    } else if (i > 0 && ys[i - 1]! * ya > 0 && Math.abs(ya) < Math.abs(ys[i - 1]!) && Math.abs(ya) <= Math.abs(yb)) {
      // lokales Minimum von |f|: Berührstelle?
      let lo = x0 + (i - 1) * dx;
      let hi = x0 + (i + 1) * dx;
      for (let k = 0; k < 80; k++) {
        const m1 = lo + (hi - lo) / 3;
        const m2 = hi - (hi - lo) / 3;
        if (Math.abs(f(m1)) < Math.abs(f(m2))) hi = m2;
        else lo = m1;
      }
      const xm = (lo + hi) / 2;
      if (Math.abs(f(xm)) < 1e-7 * Math.max(1, scale)) out.push({ x: xm, sign: 0 });
    }
  }
  return out.filter((q, i) => i === 0 || Math.abs(q.x - out[i - 1]!.x) > dx * 0.5);
}

export interface Features {
  /** Nullstellen von f (und Vorzeichenwechsel an Sprüngen) = Extrem- bzw. Terrassenstellen von F */
  zeros: Zero[];
  /** Extremstellen von f = Wendestellen von F */
  ext: { x: number; kind: 'max' | 'min' }[];
}

/** Null- und Extremstellen von f im Bereich (Sprung- und Knickstellen ausgenommen). */
export function features(fn: Fn, x0 = fn.x[0], x1 = fn.x[1]): Features {
  const avoid = [...(fn.jumps ?? []), ...(fn.kinks ?? [])];
  const span = x1 - x0;
  const near = (x: number) => avoid.some((j) => Math.abs(x - j) < span * 0.004);
  const inner = (x: number) => x > x0 + span * 0.002 && x < x1 - span * 0.002;
  const z: Zero[] = zeros(fn.f, x0, x1).filter((q) => inner(q.x) && !near(q.x));
  // Vorzeichenwechsel an Sprungstellen
  for (const j of fn.jumps ?? []) {
    if (!inner(j)) continue;
    const l = fn.f(j - span * 1e-6);
    const r = fn.f(j + span * 1e-6);
    if (l * r < 0) z.push({ x: j, sign: r > 0 ? 1 : -1, jump: true });
  }
  z.sort((a, b) => a.x - b.x);
  const d = (x: number) => (near(x) ? NaN : deriv(fn.f, x, span * 1e-6));
  const ext = zeros(d, x0, x1, 600)
    .filter((q) => q.sign !== 0 && inner(q.x) && !near(q.x))
    .map((q) => ({ x: q.x, kind: (q.sign < 0 ? 'max' : 'min') as 'max' | 'min' }));
  return { zeros: z, ext };
}

export interface SignInterval {
  a: number;
  b: number;
  /** Vorzeichen von f: F steigt (+1) bzw. fällt (−1) */
  f: -1 | 0 | 1;
  /** Vorzeichen von f′: F linksgekrümmt (+1) bzw. rechtsgekrümmt (−1) */
  d: -1 | 0 | 1;
}

/** Vorzeichentabelle: Intervalle zwischen Null-, Extrem- und Sprungstellen von f. */
export function signTable(fn: Fn, x0 = fn.x[0], x1 = fn.x[1]): SignInterval[] {
  const fe = features(fn, x0, x1);
  const cuts = [x0, ...fe.zeros.map((z) => z.x), ...fe.ext.map((e) => e.x), ...(fn.jumps ?? []).filter((j) => j > x0 && j < x1), x1].sort((a, b) => a - b);
  const out: SignInterval[] = [];
  const span = x1 - x0;
  const sgn = (v: number, eps: number): -1 | 0 | 1 => (v > eps ? 1 : v < -eps ? -1 : 0);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i]!;
    const b = cuts[i + 1]!;
    if (b - a < span * 1e-4) continue;
    const m = (a + b) / 2;
    const scale = Math.max(1e-9, rangeOf((x) => Math.abs(fn.f(x)), x0, x1, 120).hi);
    out.push({ a, b, f: sgn(fn.f(m), 1e-9 * scale), d: sgn(deriv(fn.f, m, span * 1e-5), 1e-7 * scale) });
  }
  // gleiche Nachbarn zusammenfassen
  const merged: SignInterval[] = [];
  for (const s of out) {
    const last = merged[merged.length - 1];
    if (last && last.f === s.f && last.d === s.d) last.b = s.b;
    else merged.push({ ...s });
  }
  return merged;
}

export interface Piece {
  a: number;
  b: number;
  /** orientierte Fläche = Höhenänderung F(b) − F(a) */
  area: number;
}

/** Flächenstücke zwischen den Vorzeichenwechseln von f auf [lo; hi]. */
export function pieces(fn: Fn, lo = fn.x[0], hi = fn.x[1]): Piece[] {
  const fe = features(fn, lo, hi);
  const cuts = [lo, ...fe.zeros.filter((z) => z.sign !== 0).map((z) => z.x), hi];
  // Vorzeichenwechsel über ein Stück, auf dem f = 0 ist (z. B. Aufzug hält): in der Mitte trennen
  const n = 2000;
  const dx = (hi - lo) / n;
  let lastX = NaN;
  let lastS = 0;
  for (let i = 0; i <= n; i++) {
    const x = lo + i * dx;
    const v = fn.f(x);
    const s = Math.abs(v) < 1e-12 ? 0 : Math.sign(v);
    if (s === 0) continue;
    if (lastS !== 0 && s !== lastS && x - lastX > 2.5 * dx) cuts.push((lastX + x) / 2);
    lastS = s;
    lastX = x;
  }
  cuts.sort((a, b) => a - b);
  const out: Piece[] = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i]!;
    const b = cuts[i + 1]!;
    if (b - a < (hi - lo) * 1e-4) continue;
    out.push({ a, b, area: fn.F(b) - fn.F(a) });
  }
  return out;
}

/* ---------------- Eigene Skizze von F (Aufgabenmodus) ---------------- */

export interface Check {
  a: number;
  b: number;
  /** mittlere Steigung der richtigen Lösung (= Mittelwert von f) */
  want: number;
  /** Steigung der Skizze */
  got: number;
  ok: boolean;
}

export interface Rating {
  /** mittlere Abweichung |Skizze − F| */
  mean: number;
  /** größte Abweichung */
  max: number;
  /** mittlere Abweichung bezogen auf die Spannweite von F */
  rel: number;
  /** 3 sehr gut, 2 gut, 1 ungefähr, 0 noch weit weg */
  grade: 0 | 1 | 2 | 3;
  checks: Check[];
}

/** Vergleich der Skizze (Stützpunkte nodes | ys) mit der richtigen Stammfunktion F₀ + C. */
export function rateSketch(fn: Fn, C: number, nodes: readonly number[], ys: readonly number[], samples = 240): Rating {
  const sk = spline(nodes, ys, nodes[0]!);
  const G = (x: number) => fn.F(x) + C;
  const a = nodes[0]!;
  const b = nodes[nodes.length - 1]!;
  let sum = 0;
  let max = 0;
  for (let i = 0; i <= samples; i++) {
    const x = a + ((b - a) * i) / samples;
    const e = Math.abs(sk.f(x) - G(x));
    sum += e;
    max = Math.max(max, e);
  }
  const mean = sum / (samples + 1);
  const r = rangeOf(G, a, b, 200);
  // Spannweite von F (bei fast konstantem F ein Mindestmaß, damit nicht durch 0 geteilt wird)
  const scale = Math.max(r.hi - r.lo, 0.05 * Math.max(1, Math.abs(r.hi), Math.abs(r.lo)));
  const rel = mean / scale;
  const grade: 0 | 1 | 2 | 3 = rel < 0.04 ? 3 : rel < 0.1 ? 2 : rel < 0.2 ? 1 : 0;
  const typical = scale / (b - a);
  const checks: Check[] = [];
  for (let i = 0; i + 1 < nodes.length; i++) {
    const xa = nodes[i]!;
    const xb = nodes[i + 1]!;
    const want = (G(xb) - G(xa)) / (xb - xa);
    const got = (ys[i + 1]! - ys[i]!) / (xb - xa);
    const ok = Math.abs(got - want) <= 0.25 * Math.abs(want) + 0.12 * typical;
    checks.push({ a: xa, b: xb, want, got, ok });
  }
  // Passen die Steigungen in weniger als der Hälfte der Abschnitte, ist die Skizze höchstens „ungefähr“
  const okFrac = checks.filter((c) => c.ok).length / checks.length;
  const capped = (okFrac < 0.2 ? 0 : okFrac < 0.5 ? Math.min(grade, 1) : grade) as 0 | 1 | 2 | 3;
  return { mean, max, rel, grade: capped, checks };
}

/* ---------------- Fassung 1 (für Tests und Verweise) ---------------- */

/** Die fünf Beispielfunktionen der ersten Fassung (F0 mit F0(0) = 0). */
export interface LegacyFn {
  f: (x: number) => number;
  /** Stammfunktion mit F(0) = 0 */
  F0: (x: number) => number;
  x: [number, number];
}

export const FNS: Record<'lin' | 'par' | 'cub' | 'cos' | 'gauss', LegacyFn> = {
  lin: { f: (x) => 0.5 * x, F0: (x) => 0.25 * x * x, x: [-4, 4] },
  par: { f: (x) => x * x - 1, F0: (x) => x ** 3 / 3 - x, x: [-3, 3] },
  cub: { f: (x) => 0.25 * x ** 3 - x, F0: (x) => x ** 4 / 16 - (x * x) / 2, x: [-3.2, 3.2] },
  cos: { f: Math.cos, F0: Math.sin, x: [-6.5, 6.5] },
  gauss: { f: (x) => x * Math.exp(-(x * x) / 2), F0: (x) => 1 - Math.exp(-(x * x) / 2), x: [-4, 4] },
};

/** Stammfunktion mit Integrationskonstante C: F(x) = C + ∫₀ˣ f(t) dt (Fassung 1). */
export function F(fn: LegacyFn, C: number, x: number): number {
  return C + fn.F0(x);
}
