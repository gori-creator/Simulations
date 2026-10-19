/**
 * Rechenlogik „Integralfunktion und Hauptsatz“ (Jgst. 12/13 / Studium).
 *
 * Integralfunktion zur unteren Grenze a: I_a(x) = ∫ₐˣ f(t) dt.
 * Hauptsatz der Differential- und Integralrechnung:
 *   1. I_a'(x) = f(x) – der Zuwachs (I_a(x + h) − I_a(x)) / h ist die
 *      mittlere Höhe des Streifens und strebt für h → 0 gegen f(x).
 *      Die mittlere Höhe liegt immer zwischen dem kleinsten und dem größten
 *      Funktionswert auf dem Streifen (Mittelwertsatz der Integralrechnung).
 *   2. Für jede Stammfunktion F gilt ∫ₐᵇ f(x) dx = F(b) − F(a);
 *      eine additive Konstante C kürzt sich dabei heraus.
 *
 * Folgerungen für den Graphen von I_a: Nullstellen von f mit Vorzeichenwechsel
 * sind Extremstellen von I_a, Extremstellen von f sind Wendestellen von I_a,
 * I_a(a) = 0, und ein anderes a verschiebt den Graphen nur senkrecht.
 *
 * Dazu Riemann-Summen (links, rechts, Mitte, Trapez) und Anwendungen, in denen
 * eine Änderungsrate zu einem Bestand aufsummiert wird (Geschwindigkeit → Weg,
 * Zufluss → Wassermenge, Leistung → Energie, Grenzkosten → Kosten, …).
 */

export type FnKey = 'lin' | 'par' | 'sin' | 'cos' | 'exp' | 'inv' | 'gauss' | 'step';
export type AppKey = 'car' | 'lake' | 'solar' | 'cost' | 'pop' | 'drug' | 'rain' | 'breath';
export type RiemannKind = 'left' | 'right' | 'mid' | 'trap';

export interface Fn {
  f: (x: number) => number;
  /** eine Stammfunktion (bei Sprüngen: stetige Integralfunktion) */
  F: (x: number) => number;
  /** Definitionsbereich bzw. dargestellter Bereich */
  x: [number, number];
  /** Sprungstellen von f (dort ist F nicht differenzierbar) */
  jumps?: number[];
  /** Knickstellen von f (f stetig, aber nicht differenzierbar) */
  kinks?: number[];
}

/** Koeffizienten der Funktionen (Regler der Simulation). */
export interface Coeffs {
  /** Gerade f(x) = m·x + t */
  lm: number;
  lt: number;
  /** Polynom f(x) = k₃x³ + k₂x² + k₁x + k₀ */
  k3: number;
  k2: number;
  k1: number;
  k0: number;
  /** f(x) = A·sin(bx) bzw. A·cos(bx) */
  sa: number;
  sb: number;
  /** f(x) = c·e^(kx) */
  ea: number;
  eb: number;
  /** f(x) = c/x (x > 0) */
  ia: number;
  /** Gauß-Glocke e^(−(x − μ)²/(2σ²)) */
  gm: number;
  gs: number;
  /** Treppe: f = s₁ für x < x_s, f = s₂ für x ≥ x_s */
  s1: number;
  s2: number;
  sj: number;
}

export const DEFAULT_COEFFS: Coeffs = { lm: 1, lt: 0, k3: 0, k2: 0.5, k1: 0, k0: -1, sa: 1, sb: 1, ea: 1, eb: 0.5, ia: 1, gm: 0, gs: 1, s1: 1, s2: -0.5, sj: 1 };

const SQRT_PI = Math.sqrt(Math.PI);

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
  // erfc(x) = e^(−x²)/√π · 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + …))))
  let k = ax;
  for (let n = 60; n >= 1; n--) k = ax + n / 2 / k;
  const erfc = Math.exp(-ax * ax) / (SQRT_PI * k);
  return Math.sign(x) * (1 - erfc);
}

/** Mathematische Funktion nach Schlüssel und Koeffizienten. */
export function mathFn(key: FnKey, c: Coeffs = DEFAULT_COEFFS): Fn {
  switch (key) {
    case 'lin':
      return { f: (x) => c.lm * x + c.lt, F: (x) => (c.lm * x * x) / 2 + c.lt * x, x: [-4, 4] };
    case 'par':
      return {
        f: (x) => ((c.k3 * x + c.k2) * x + c.k1) * x + c.k0,
        F: (x) => (((c.k3 / 4) * x + c.k2 / 3) * x + c.k1 / 2) * x * x + c.k0 * x,
        x: [-4, 4],
      };
    case 'sin': {
      const b = c.sb;
      return { f: (x) => c.sa * Math.sin(b * x), F: (x) => (-c.sa / b) * Math.cos(b * x), x: [-6.5, 6.5] };
    }
    case 'cos': {
      const b = c.sb;
      return { f: (x) => c.sa * Math.cos(b * x), F: (x) => (c.sa / b) * Math.sin(b * x), x: [-6.5, 6.5] };
    }
    case 'exp': {
      const k = c.eb;
      if (Math.abs(k) < 1e-12) return { f: () => c.ea, F: (x) => c.ea * x, x: [-3, 3] };
      return { f: (x) => c.ea * Math.exp(k * x), F: (x) => (c.ea / k) * Math.exp(k * x), x: [-3, 3] };
    }
    case 'inv':
      return { f: (x) => c.ia / x, F: (x) => c.ia * Math.log(x), x: [0.2, 6] };
    case 'gauss': {
      const s = c.gs;
      const m = c.gm;
      return {
        f: (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)),
        F: (x) => s * Math.sqrt(Math.PI / 2) * erf((x - m) / (s * Math.SQRT2)),
        x: [-4, 4],
      };
    }
    case 'step': {
      const j = c.sj;
      return {
        f: (x) => (x < j ? c.s1 : c.s2),
        F: (x) => c.s1 * Math.min(x, j) + c.s2 * Math.max(0, x - j),
        x: [-4, 4],
        jumps: Math.abs(c.s1 - c.s2) > 1e-12 ? [j] : [],
      };
    }
  }
}

/* ---------------- Anwendungen ---------------- */

export interface App extends Fn {
  /** Voreinstellungen beim Wechsel auf die Anwendung */
  a: number;
  b: number;
  h: number;
  n: number;
  /** Konstante C (z. B. Fixkosten) */
  c: number;
}

const PI = Math.PI;
/** Logistisches Wachstum: Grenze K (Tausend), Rate k, Wendezeitpunkt t₀. */
const POP = { K: 12, k: 0.5, t0: 10 };

export const APPS: Record<AppKey, App> = {
  /** Auto: anfahren (3 m/s²), 15 s mit 15 m/s, bremsen (−3 m/s²). Weg 300 m. */
  car: {
    f: (t) => (t <= 5 ? 3 * t : t <= 20 ? 15 : t <= 25 ? 15 - 3 * (t - 20) : 0),
    F: (t) => {
      if (t <= 5) return 1.5 * t * t;
      if (t <= 20) return 37.5 + 15 * (t - 5);
      if (t <= 25) return 262.5 + 15 * (t - 20) - 1.5 * (t - 20) ** 2;
      return 300;
    },
    x: [0, 30],
    kinks: [5, 20, 25],
    a: 0,
    b: 25,
    h: 2,
    n: 6,
    c: 0,
  },
  /** Stausee: Netto-Zufluss q(t) = 3·cos(πt/6) in Mio. m³ pro Monat. */
  lake: { f: (t) => 3 * Math.cos((PI * t) / 6), F: (t) => (18 / PI) * Math.sin((PI * t) / 6), x: [0, 12], a: 0, b: 12, h: 1, n: 6, c: 0 },
  /** Solaranlage: P(t) = 4·sin(π(t − 6)/12) kW zwischen 6 und 18 Uhr. Tagesertrag 96/π ≈ 30,56 kWh. */
  solar: {
    f: (t) => (t < 6 || t > 18 ? 0 : 4 * Math.sin((PI * (t - 6)) / 12)),
    F: (t) => (t < 6 ? 0 : t > 18 ? 96 / PI : (48 / PI) * (1 - Math.cos((PI * (t - 6)) / 12))),
    x: [0, 24],
    kinks: [6, 18],
    a: 0,
    b: 24,
    h: 1,
    n: 12,
    c: 0,
  },
  /** Grenzkosten K'(x) = 0,3x² − 3x + 10 (GE pro ME); Gesamtkosten K(x) = 0,1x³ − 1,5x² + 10x + K_fix. */
  cost: { f: (x) => 0.3 * x * x - 3 * x + 10, F: (x) => 0.1 * x ** 3 - 1.5 * x * x + 10 * x, x: [0, 12], a: 0, b: 10, h: 1, n: 5, c: 20 },
  /** Neubaugebiet: logistische Wachstumsrate (Tausend Einwohner pro Jahr). */
  pop: {
    f: (t) => {
      const e = Math.exp(-POP.k * (t - POP.t0));
      return (POP.K * POP.k * e) / (1 + e) ** 2;
    },
    F: (t) => POP.K / (1 + Math.exp(-POP.k * (t - POP.t0))),
    x: [0, 20],
    a: 0,
    b: 20,
    h: 1,
    n: 10,
    c: 0,
  },
  /** Medikament: Aufnahmerate r(t) = 40·t·e^(−t/2) mg/h; insgesamt höchstens 160 mg. */
  drug: {
    f: (t) => 40 * t * Math.exp(-t / 2),
    F: (t) => -80 * t * Math.exp(-t / 2) - 160 * Math.exp(-t / 2),
    x: [0, 12],
    a: 0,
    b: 8,
    h: 1,
    n: 8,
    c: 0,
  },
  /** Gewitter: Regenintensität i(t) = 10·e^(−(t − 3)²/2) mm/h; Regenmenge ≈ 25 mm. */
  rain: {
    f: (t) => 10 * Math.exp(-((t - 3) ** 2) / 2),
    F: (t) => 10 * Math.sqrt(PI / 2) * erf((t - 3) / Math.SQRT2),
    x: [0, 6],
    a: 0,
    b: 6,
    h: 0.5,
    n: 6,
    c: 0,
  },
  /** Atmung: Volumenstrom v(t) = 0,5·sin(2πt/5) L/s; ein Atemzug dauert 5 s. */
  breath: { f: (t) => 0.5 * Math.sin((2 * PI * t) / 5), F: (t) => (-1.25 / PI) * Math.cos((2 * PI * t) / 5), x: [0, 10], a: 0, b: 2.5, h: 0.5, n: 5, c: 0 },
};

/** Die vier Beispielfunktionen der ersten Fassung (für Tests und Verweise). */
export const FNS: Record<'lin' | 'par' | 'cos' | 'exp', Fn> = {
  lin: { ...mathFn('lin'), x: [-4, 4] },
  par: { ...mathFn('par'), x: [-3.5, 3.5] },
  cos: { ...mathFn('cos'), x: [-6.5, 6.5] },
  exp: { ...mathFn('exp'), x: [-4, 3] },
};

/* ---------------- Integralfunktion und Hauptsatz ---------------- */

/** I_a(x) = F(x) − F(a) */
export function integralFn(fn: Fn, a: number, x: number): number {
  return fn.F(x) - fn.F(a);
}

/** Differenzenquotient der Integralfunktion (mittlere Streifenhöhe). */
export function stripMean(fn: Fn, x: number, h: number): number {
  return (fn.F(x + h) - fn.F(x)) / h;
}

/** Kleinster und größter Funktionswert auf dem Streifen zwischen x und x + h (abgetastet). */
export function stripRange(fn: Fn, x: number, h: number, samples = 96): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  const lo = Math.min(x, x + h);
  const hi = Math.max(x, x + h);
  for (let i = 0; i <= samples; i++) {
    const t = lo + ((hi - lo) * i) / samples;
    const v = fn.f(i === samples && fn.jumps?.some((j) => Math.abs(j - hi) < 1e-12) ? hi - 1e-9 : t);
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

/** Numerisches Integral (Simpson). */
export function integrate(f: (x: number) => number, a: number, b: number, n = 400): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

/** Riemann-Summe mit n Streifen gleicher Breite (h = (b − a)/n, darf negativ sein). */
export function riemann(f: (x: number) => number, a: number, b: number, n: number, kind: RiemannKind): number {
  const k = Math.max(1, Math.round(n));
  const h = (b - a) / k;
  let s = 0;
  for (let i = 0; i < k; i++) {
    const l = a + i * h;
    const r = a + (i + 1) * h;
    if (kind === 'left') s += f(l);
    else if (kind === 'right') s += f(r);
    else if (kind === 'mid') s += f((l + r) / 2);
    else s += (f(l) + f(r)) / 2;
  }
  return s * h;
}

/** Stützstellen und Höhen der Riemann-Streifen (zum Zeichnen). */
export function riemannBoxes(f: (x: number) => number, a: number, b: number, n: number, kind: RiemannKind): { l: number; r: number; yl: number; yr: number }[] {
  const k = Math.max(1, Math.round(n));
  const h = (b - a) / k;
  const out: { l: number; r: number; yl: number; yr: number }[] = [];
  for (let i = 0; i < k; i++) {
    const l = a + i * h;
    const r = a + (i + 1) * h;
    if (kind === 'trap') out.push({ l, r, yl: f(l), yr: f(r) });
    else {
      const y = kind === 'left' ? f(l) : kind === 'right' ? f(r) : f((l + r) / 2);
      out.push({ l, r, yl: y, yr: y });
    }
  }
  return out;
}

/** Nullstellen von f in [x0, x1]: mit Vorzeichenwechsel (sign = Richtung) und Berührstellen (sign = 0). */
export function zeros(f: (x: number) => number, x0: number, x1: number, samples = 800): { x: number; sign: -1 | 0 | 1 }[] {
  const out: { x: number; sign: -1 | 0 | 1 }[] = [];
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
      // Nullstelle direkt an einer Stützstelle
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
      // Sprung über null (z. B. Treppe) ist keine Nullstelle
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
  // doppelte Treffer (z. B. Nullstelle genau zwischen zwei Abschnitten) zusammenfassen
  return out.filter((q, i) => i === 0 || Math.abs(q.x - out[i - 1]!.x) > dx * 0.5);
}

/** Numerische Ableitung (zentraler Differenzenquotient). */
export function deriv(f: (x: number) => number, x: number, d = 1e-5): number {
  return (f(x + d) - f(x - d)) / (2 * d);
}

export interface Features {
  /** Nullstellen von f = Extremstellen (bzw. Terrassenstellen) von I_a */
  zeros: { x: number; sign: -1 | 0 | 1 }[];
  /** Extremstellen von f = Wendestellen von I_a (kind: Hoch- bzw. Tiefpunkt von f) */
  ext: { x: number; kind: 'max' | 'min' }[];
}

/** Null- und Extremstellen von f im Bereich (ohne Sprung- und Knickstellen). */
export function features(fn: Fn, x0 = fn.x[0], x1 = fn.x[1]): Features {
  const avoid = [...(fn.jumps ?? []), ...(fn.kinks ?? [])];
  const near = (x: number) => avoid.some((j) => Math.abs(x - j) < (x1 - x0) * 0.004);
  const inner = (x: number) => x > x0 + (x1 - x0) * 0.002 && x < x1 - (x1 - x0) * 0.002;
  const z = zeros(fn.f, x0, x1).filter((q) => inner(q.x) && !near(q.x));
  // Stücke, auf denen f konstant ist, haben keine Extremstellen im Sinne der Kurvendiskussion
  const d = (x: number) => (near(x) ? NaN : deriv(fn.f, x, (x1 - x0) * 1e-6));
  const ext = zeros(d, x0, x1, 600)
    .filter((q) => q.sign !== 0 && inner(q.x) && !near(q.x))
    .map((q) => ({ x: q.x, kind: (q.sign < 0 ? 'max' : 'min') as 'max' | 'min' }));
  return { zeros: z, ext };
}

/**
 * Flächenbilanz zwischen a und b: Anteile oberhalb (pos) und unterhalb (neg) der
 * x-Achse als positive Zahlen; das Integral ist ±(pos − neg), der Flächeninhalt pos + neg.
 */
export function areaParts(fn: Fn, a: number, b: number): { pos: number; neg: number; integral: number; area: number } {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const cuts = [lo, ...zeros(fn.f, lo, hi, 600).map((q) => q.x), ...(fn.jumps ?? []).filter((j) => j > lo && j < hi), hi].sort((p, q) => p - q);
  let pos = 0;
  let neg = 0;
  for (let i = 0; i + 1 < cuts.length; i++) {
    const l = cuts[i]!;
    const r = cuts[i + 1]!;
    if (r - l < 1e-12) continue;
    const v = fn.F(r) - fn.F(l);
    if (v >= 0) pos += v;
    else neg -= v;
  }
  const integral = (b >= a ? 1 : -1) * (pos - neg);
  return { pos, neg, integral, area: pos + neg };
}

/** Wertebereich einer Funktion auf [x0, x1] (abgetastet, nur endliche Werte). */
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

/** Folge der Differenzenquotienten für kleiner werdende h (Tabelle h → 0). */
export function quotientTable(fn: Fn, x: number, hs: readonly number[] = [1, 0.5, 0.1, 0.01, 0.001]): { h: number; q: number; err: number }[] {
  const fx = fn.f(x);
  return hs.map((h) => {
    const q = stripMean(fn, x, h);
    return { h, q, err: q - fx };
  });
}
