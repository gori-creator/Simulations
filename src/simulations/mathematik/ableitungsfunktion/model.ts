/**
 * Rechenlogik „Ableitungsfunktion grafisch“ (Jgst. 11/12).
 *
 * Für jede Stelle x ist f′(x) die Steigung der Tangente an den Graphen von f,
 * also der Grenzwert der Sekantensteigungen (Differenzenquotienten)
 *   f′(x) = lim_{h → 0} (f(x + h) − f(x)) / h.
 * Trägt man diese Steigungen auf, entsteht der Graph der Ableitungsfunktion:
 * - f steigt ⇔ f′ > 0, f fällt ⇔ f′ < 0 (streng genommen: f′ > 0 ⇒ f steigt streng)
 * - Nullstelle von f′ mit Vorzeichenwechsel ⇒ Extremstelle von f
 *   (+ → −: Hochpunkt, − → +: Tiefpunkt); ohne Vorzeichenwechsel: Terrassenpunkt
 * - Extremstelle von f′ (Vorzeichenwechsel von f″) ⇒ Wendestelle von f
 * - f″ > 0: f linksgekrümmt, f″ < 0: f rechtsgekrümmt
 * Stimmen der linksseitige und der rechtsseitige Grenzwert des
 * Differenzenquotienten nicht überein (z. B. |x| bei 0), ist f dort nicht
 * differenzierbar: Der Graph hat einen Knick.
 *
 * Alle Funktionen bringen ihre exakten Ableitungen f′ und f″ mit
 * (Schulformeln), damit Merkmale und Werte nicht numerisch geraten werden.
 */

export type FnKey = 'par' | 'cub' | 'quart' | 'sin' | 'cos' | 'exp' | 'ln' | 'sqrt' | 'abs' | 'inv' | 'own';
export type AppKey = 'car' | 'sprint' | 'lift' | 'ball' | 'temp' | 'pop' | 'cost' | 'hike' | 'tank';
export type RuleKey = 'fak' | 'sum' | 'pow' | 'prod' | 'chain';
export type Side = 'r' | 'l' | 'c';

export interface Fn {
  f: (x: number) => number;
  /** erste Ableitung f′ */
  d1: (x: number) => number;
  /** zweite Ableitung f″ */
  d2: (x: number) => number;
  /** dargestellter Bereich */
  x: [number, number];
  /** Bereich, in dem der Punkt P liegen darf (Definitionsbereich im Bild) */
  dom: [number, number];
  /** sieben Stützstellen für die eigene Skizze von f′ (Aufgabenmodus) */
  nodes: number[];
  /** Knickstellen: f stetig, aber nicht differenzierbar (f′ springt) */
  kinks?: number[];
  /** Polstellen (f nicht definiert) */
  poles?: number[];
  /** Sprungstellen von f″ (f′ hat dort einen Knick) */
  jumps2?: number[];
}

/* ---------------- Koeffizienten (Regler der Simulation) ---------------- */

export interface Coeffs {
  /** Parabel a·x² + b·x + c */
  pa: number;
  pb: number;
  pc: number;
  /** Polynom 3. Grades k₃x³ + k₂x² + k₁x + k₀ */
  k3: number;
  k2: number;
  k1: number;
  k0: number;
  /** Polynom 4. Grades u₄x⁴ + … + u₀ */
  u4: number;
  u3: number;
  u2: number;
  u1: number;
  u0: number;
  /** A·sin(bx) bzw. A·cos(bx) */
  sa: number;
  sb: number;
  /** c·e^(kx) */
  ea: number;
  eb: number;
  /** a·ln x */
  la: number;
  /** a·√x */
  wa: number;
  /** a·|x − s| */
  aa: number;
  ab: number;
  /** c/x */
  ia: number;
  /** gezeichnete Funktion: Werte an x = −3, −2, …, 3 */
  w1: number;
  w2: number;
  w3: number;
  w4: number;
  w5: number;
  w6: number;
  w7: number;
}

/** Standardwerte; sie geben die Funktionen der ersten Fassung wieder. */
export const DEFAULT_COEFFS: Coeffs = {
  pa: 0.5,
  pb: 0,
  pc: -2,
  k3: 0.25,
  k2: 0,
  k1: -1.5,
  k0: 0,
  u4: 0.1,
  u3: 0,
  u2: -1,
  u1: 0,
  u0: 1,
  sa: 1,
  sb: 1,
  ea: 1,
  eb: 1,
  la: 1,
  wa: 1,
  aa: 1,
  ab: 0,
  ia: 1,
  w1: -1,
  w2: 1,
  w3: 1.5,
  w4: 0.5,
  w5: -1,
  w6: -0.5,
  w7: 1,
};

/** Stützstellen der gezeichneten Funktion. */
export const OWN_X = [-3, -2, -1, 0, 1, 2, 3];
const INT7 = [-3, -2, -1, 0, 1, 2, 3];
const HALF_PI7 = [-3, -2, -1, 0, 1, 2, 3].map((k) => (k * Math.PI) / 2);

/* ---------------- Glatte Kurve durch Stützpunkte ---------------- */

/**
 * Kubische Hermite-Interpolation mit Catmull-Rom-Tangenten (auch für
 * ungleiche Abstände): Wert, erste und zweite Ableitung. Lineare Daten werden
 * exakt wiedergegeben; außerhalb der Stützstellen linear fortgesetzt.
 */
export function spline(xs: readonly number[], ys: readonly number[]): { f: (x: number) => number; d: (x: number) => number; dd: (x: number) => number } {
  const n = xs.length - 1;
  const m: number[] = [];
  for (let i = 0; i <= n; i++) {
    if (i === 0) m.push((ys[1]! - ys[0]!) / (xs[1]! - xs[0]!));
    else if (i === n) m.push((ys[n]! - ys[n - 1]!) / (xs[n]! - xs[n - 1]!));
    else m.push((ys[i + 1]! - ys[i - 1]!) / (xs[i + 1]! - xs[i - 1]!));
  }
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
  const dd = (x: number): number => {
    if (x < xs[0]! || x > xs[n]!) return 0;
    const i = seg(x);
    const h = xs[i + 1]! - xs[i]!;
    const u = (x - xs[i]!) / h;
    const e00 = 12 * u - 6;
    const e10 = 6 * u - 4;
    const e01 = -12 * u + 6;
    const e11 = 6 * u - 2;
    return (e00 * ys[i]! + e01 * ys[i + 1]!) / (h * h) + (e10 * m[i]! + e11 * m[i + 1]!) / h;
  };
  return { f, d, dd };
}

/* ---------------- Mathematische Funktionen ---------------- */

/**
 * Bildbereich eines Polynoms an seine Merkmale anpassen: Extrem- und Wendestellen
 * sollen gut sichtbar sein, ohne dass steile Ränder alles zusammenstauchen.
 * Halbe Breite = 2,2 · größter Betrag einer Merkmalsstelle, zwischen 2,5 und `max`.
 * Die sieben Stützstellen der Skizze liegen gleichmäßig (auf Viertel gerundet).
 */
function autoRange(fn: Fn, max: number): Fn {
  const fe = features({ ...fn, x: [-max, max], dom: [-max, max] });
  const s = Math.max(0, ...fe.ext.map((e) => Math.abs(e.x)), ...fe.infl.map((w) => Math.abs(w.x)));
  const half = Math.min(max, Math.max(2.5, Math.ceil(2.2 * s * 10) / 10));
  const step = Math.round(((half * 0.86) / 3) * 4) / 4 || 0.25;
  return { ...fn, x: [-half, half], dom: [-half, half], nodes: [-3, -2, -1, 0, 1, 2, 3].map((k) => k * step) };
}

/** Mathematische Funktion nach Schlüssel und Koeffizienten, mit exakten Ableitungen. */
export function mathFn(key: FnKey, c: Coeffs = DEFAULT_COEFFS): Fn {
  const fn = mathFnRaw(key, c);
  if (key === 'cub') return autoRange(fn, 3.5);
  if (key === 'quart') return autoRange(fn, 3.6);
  return fn;
}

function mathFnRaw(key: FnKey, c: Coeffs): Fn {
  switch (key) {
    case 'par':
      return { f: (x) => (c.pa * x + c.pb) * x + c.pc, d1: (x) => 2 * c.pa * x + c.pb, d2: () => 2 * c.pa, x: [-4, 4], dom: [-4, 4], nodes: INT7 };
    case 'cub':
      return {
        f: (x) => ((c.k3 * x + c.k2) * x + c.k1) * x + c.k0,
        d1: (x) => (3 * c.k3 * x + 2 * c.k2) * x + c.k1,
        d2: (x) => 6 * c.k3 * x + 2 * c.k2,
        x: [-3.5, 3.5],
        dom: [-3.5, 3.5],
        nodes: INT7,
      };
    case 'quart':
      return {
        f: (x) => (((c.u4 * x + c.u3) * x + c.u2) * x + c.u1) * x + c.u0,
        d1: (x) => ((4 * c.u4 * x + 3 * c.u3) * x + 2 * c.u2) * x + c.u1,
        d2: (x) => (12 * c.u4 * x + 6 * c.u3) * x + 2 * c.u2,
        x: [-3.6, 3.6],
        dom: [-3.6, 3.6],
        nodes: INT7,
      };
    case 'sin': {
      const { sa: A, sb: b } = c;
      return { f: (x) => A * Math.sin(b * x), d1: (x) => A * b * Math.cos(b * x), d2: (x) => -A * b * b * Math.sin(b * x), x: [-6.5, 6.5], dom: [-6.5, 6.5], nodes: HALF_PI7 };
    }
    case 'cos': {
      const { sa: A, sb: b } = c;
      return { f: (x) => A * Math.cos(b * x), d1: (x) => -A * b * Math.sin(b * x), d2: (x) => -A * b * b * Math.cos(b * x), x: [-6.5, 6.5], dom: [-6.5, 6.5], nodes: HALF_PI7 };
    }
    case 'exp': {
      const { ea: a, eb: k } = c;
      return { f: (x) => a * Math.exp(k * x), d1: (x) => a * k * Math.exp(k * x), d2: (x) => a * k * k * Math.exp(k * x), x: [-4, 2], dom: [-4, 2], nodes: [-4, -3, -2, -1, 0, 1, 2] };
    }
    case 'ln': {
      const a = c.la;
      const pos = (g: (x: number) => number) => (x: number) => (x > 0 ? g(x) : NaN);
      return { f: pos((x) => a * Math.log(x)), d1: pos((x) => a / x), d2: pos((x) => -a / (x * x)), x: [0, 6], dom: [0.1, 6], nodes: [0.5, 1, 2, 3, 4, 5, 6] };
    }
    case 'sqrt': {
      const a = c.wa;
      return {
        f: (x) => (x >= 0 ? a * Math.sqrt(x) : NaN),
        d1: (x) => (x > 0 ? a / (2 * Math.sqrt(x)) : NaN),
        d2: (x) => (x > 0 ? -a / (4 * x * Math.sqrt(x)) : NaN),
        x: [0, 6],
        dom: [0.05, 6],
        nodes: [0.25, 0.5, 1, 2, 3, 4, 6],
      };
    }
    case 'abs': {
      const { aa: a, ab: s } = c;
      return {
        f: (x) => a * Math.abs(x - s),
        d1: (x) => (x > s ? a : x < s ? -a : NaN),
        d2: (x) => (x === s ? NaN : 0),
        x: [-4, 4],
        dom: [-4, 4],
        nodes: INT7,
        kinks: Math.abs(a) > 1e-12 ? [s] : [],
      };
    }
    case 'inv': {
      const a = c.ia;
      const nz = (g: (x: number) => number) => (x: number) => (x === 0 ? NaN : g(x));
      return { f: nz((x) => a / x), d1: nz((x) => -a / (x * x)), d2: nz((x) => (2 * a) / (x * x * x)), x: [-4, 4], dom: [-4, 4], nodes: [0.5, 1, 1.5, 2, 2.5, 3, 4], poles: [0] };
    }
    case 'own': {
      const sp = spline(OWN_X, [c.w1, c.w2, c.w3, c.w4, c.w5, c.w6, c.w7]);
      return { f: sp.f, d1: sp.d, d2: sp.dd, x: [-3, 3], dom: [-3, 3], nodes: INT7, jumps2: OWN_X.slice(1, -1) };
    }
  }
}

/* ---------------- Alltagsbeispiele ---------------- */

const PI = Math.PI;

export const APPS: Record<AppKey, Fn> = {
  /** Auto: s(t) = −0,05t³ + 1,5t² (m), anfahren und bis zum Stillstand bremsen. */
  car: {
    f: (t) => -0.05 * t ** 3 + 1.5 * t * t,
    d1: (t) => -0.15 * t * t + 3 * t,
    d2: (t) => -0.3 * t + 3,
    x: [0, 20],
    dom: [0, 20],
    nodes: [0, 3, 6, 10, 14, 17, 20],
  },
  /** 100-m-Sprint: s(t) = 11,5(t − 1,25(1 − e^(−0,8t))) (m). */
  sprint: {
    f: (t) => 11.5 * (t - 1.25 * (1 - Math.exp(-0.8 * t))),
    d1: (t) => 11.5 * (1 - Math.exp(-0.8 * t)),
    d2: (t) => 9.2 * Math.exp(-0.8 * t),
    x: [0, 10],
    dom: [0, 10],
    nodes: [0, 1, 2, 3, 5, 7.5, 10],
  },
  /** Fahrstuhl: h(t) = 10(1 − cos(πt/16)) (m), Erdgeschoss → 5. Stock in 16 s. */
  lift: {
    f: (t) => 10 * (1 - Math.cos((PI * t) / 16)),
    d1: (t) => ((10 * PI) / 16) * Math.sin((PI * t) / 16),
    d2: (t) => ((10 * PI * PI) / 256) * Math.cos((PI * t) / 16),
    x: [0, 16],
    dom: [0, 16],
    nodes: [0, 2, 5, 8, 11, 14, 16],
  },
  /** Hochwurf: h(t) = 1,5 + 12t − 4,905t² (m). */
  ball: {
    f: (t) => 1.5 + 12 * t - 4.905 * t * t,
    d1: (t) => 12 - 9.81 * t,
    d2: () => -9.81,
    x: [0, 2.5],
    dom: [0, 2.5],
    nodes: [0, 0.4, 0.8, 1.2, 1.6, 2, 2.5],
  },
  /** Temperatur über den Tag: T(t) = 14 + 6·sin(π(t − 9)/12) (°C). */
  temp: {
    f: (t) => 14 + 6 * Math.sin((PI * (t - 9)) / 12),
    d1: (t) => (PI / 2) * Math.cos((PI * (t - 9)) / 12),
    d2: (t) => -((PI * PI) / 24) * Math.sin((PI * (t - 9)) / 12),
    x: [0, 24],
    dom: [0, 24],
    nodes: [0, 3, 6, 9, 15, 20, 24],
  },
  /** Infektionen (logistisch): N(t) = 10 000 / (1 + 199·e^(−0,4t)). */
  pop: {
    f: (t) => 10000 / (1 + 199 * Math.exp(-0.4 * t)),
    d1: (t) => {
      const N = 10000 / (1 + 199 * Math.exp(-0.4 * t));
      return 0.4 * N * (1 - N / 10000);
    },
    d2: (t) => {
      const N = 10000 / (1 + 199 * Math.exp(-0.4 * t));
      return 0.4 * (0.4 * N * (1 - N / 10000)) * (1 - (2 * N) / 10000);
    },
    x: [0, 30],
    dom: [0, 30],
    nodes: [0, 5, 10, 13, 16, 20, 30],
  },
  /** Kosten: K(x) = 0,1x³ − 1,5x² + 10x + 20 (GE), Grenzkosten K′. */
  cost: {
    f: (x) => 0.1 * x ** 3 - 1.5 * x * x + 10 * x + 20,
    d1: (x) => 0.3 * x * x - 3 * x + 10,
    d2: (x) => 0.6 * x - 3,
    x: [0, 12],
    dom: [0, 12],
    nodes: [0, 2, 4, 6, 8, 10, 12],
  },
  /** Wanderung: Höhenprofil h(x) = 800 + 400·e^(−(x − 5)²/4) (m über NN, x in km). */
  hike: {
    f: (x) => 800 + 400 * Math.exp(-((x - 5) ** 2) / 4),
    d1: (x) => -200 * (x - 5) * Math.exp(-((x - 5) ** 2) / 4),
    d2: (x) => (100 * (x - 5) ** 2 - 200) * Math.exp(-((x - 5) ** 2) / 4),
    x: [0, 10],
    dom: [0, 10],
    nodes: [0, 2, 3.5, 5, 6.5, 8, 10],
  },
  /** Badewanne: V(t) = 75(1 − cos(πt/10)) (L), füllen und ablassen. */
  tank: {
    f: (t) => 75 * (1 - Math.cos((PI * t) / 10)),
    d1: (t) => 7.5 * PI * Math.sin((PI * t) / 10),
    d2: (t) => 0.75 * PI * PI * Math.cos((PI * t) / 10),
    x: [0, 20],
    dom: [0, 20],
    nodes: [0, 3, 5, 10, 15, 17, 20],
  },
};

/* ---------------- Differenzenquotient und Grenzwert ---------------- */

/** Rechtsseitiger Differenzenquotient (Sekante durch x und x + h). */
export function dqRight(f: (x: number) => number, x: number, h: number): number {
  return (f(x + h) - f(x)) / h;
}
/** Linksseitiger Differenzenquotient (Sekante durch x − h und x). */
export function dqLeft(f: (x: number) => number, x: number, h: number): number {
  return (f(x) - f(x - h)) / h;
}
/** Beidseitiger (zentraler) Differenzenquotient (Sekante durch x − h und x + h). */
export function dqCentral(f: (x: number) => number, x: number, h: number): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}
/** Differenzenquotient nach Seite. */
export function dq(f: (x: number) => number, x: number, h: number, side: Side): number {
  return side === 'r' ? dqRight(f, x, h) : side === 'l' ? dqLeft(f, x, h) : dqCentral(f, x, h);
}
/** Die beiden Sekantenpunkte (linker und rechter x-Wert) nach Seite. */
export function secantEnds(x: number, h: number, side: Side): [number, number] {
  return side === 'r' ? [x, x + h] : side === 'l' ? [x - h, x] : [x - h, x + h];
}

export interface QuotientRow {
  h: number;
  r: number;
  l: number;
  c: number;
}

/** Tabelle der Differenzenquotienten für kleiner werdendes h. */
export function quotientTable(f: (x: number) => number, x: number, hs: readonly number[]): QuotientRow[] {
  return hs.map((h) => ({ h, r: dqRight(f, x, h), l: dqLeft(f, x, h), c: dqCentral(f, x, h) }));
}

/**
 * Einseitige Grenzwerte des Differenzenquotienten (Näherung mit sehr kleinem h)
 * und ob f an der Stelle differenzierbar ist (beide stimmen überein).
 */
export function oneSided(fn: Fn, x: number): { left: number; right: number; differentiable: boolean } {
  const span = fn.x[1] - fn.x[0];
  const h = span * 1e-7;
  const right = dqRight(fn.f, x, h);
  const left = dqLeft(fn.f, x, h);
  const atKink = (fn.kinks ?? []).some((k) => Math.abs(k - x) < span * 1e-6);
  const ok = Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= 1e-4 * Math.max(1, Math.abs(left), Math.abs(right));
  // differenzierbar: beide Grenzwerte sind genau f′(x)
  const d = fn.d1(x);
  if (ok && !atKink && Number.isFinite(d)) return { left: d, right: d, differentiable: true };
  return { left, right, differentiable: ok && !atKink };
}

/** Steigung der Sekante durch (x | f(x)) und (x + h | f(x + h)) – nähert f′(x) für kleines h (Fassung 1). */
export function secantSlope(fn: { f: (x: number) => number }, x: number, h: number): number {
  return dqRight(fn.f, x, h);
}

/* ---------------- Werte und Bereiche ---------------- */

/** Numerische Ableitung (zentraler Differenzenquotient), zum Prüfen. */
export function deriv(f: (x: number) => number, x: number, d = 1e-5): number {
  return (f(x + d) - f(x - d)) / (2 * d);
}

/** Wertebereich einer Funktion auf [x0; x1] (abgetastet, nicht endliche Werte übersprungen). */
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

/* ---------------- Nullstellen mit Vorzeichenwechsel ---------------- */

export interface SignZero {
  x: number;
  /** Richtung des Vorzeichenwechsels: +1 (− → +), −1 (+ → −), 0 ohne Wechsel */
  sign: -1 | 0 | 1;
  /** Vorzeichenwechsel über einen Sprung (keine echte Nullstelle) */
  jump?: boolean;
}

/**
 * Nullstellen von g auf [x0; x1]: mit Vorzeichenwechsel (Halbierung) und
 * Berührstellen (lokales Minimum von |g|). Wechselt g an einer Sprungstelle das
 * Vorzeichen, wird die Stelle mit `jump` gemeldet, wenn `jumps` erlaubt ist.
 */
export function signZeros(g: (x: number) => number, x0: number, x1: number, samples = 800, jumps = false): SignZero[] {
  const out: SignZero[] = [];
  const dx = (x1 - x0) / samples;
  let scale = 0;
  const ys: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const y = g(x0 + i * dx);
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
      if (i > 0 && Math.abs(prev) > tiny && Math.abs(yb) > tiny && Number.isFinite(prev)) {
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
      for (let k = 0; k < 64; k++) {
        const mid = (lo + hi) / 2;
        const fm = g(mid);
        if (!Number.isFinite(fm)) break;
        if (fm * flo <= 0) hi = mid;
        else {
          lo = mid;
          flo = fm;
        }
      }
      const xz = (lo + hi) / 2;
      const gz = g(xz);
      const isZero = Number.isFinite(gz) && Math.abs(gz) < 1e-6 * Math.max(1, scale);
      if (isZero) out.push({ x: xz, sign: yb > 0 ? 1 : -1 });
      else if (jumps) out.push({ x: xz, sign: yb > 0 ? 1 : -1, jump: true });
    } else if (i > 0 && Number.isFinite(ys[i - 1]!) && ys[i - 1]! * ya > 0 && Math.abs(ya) < Math.abs(ys[i - 1]!) && Math.abs(ya) <= Math.abs(yb)) {
      // lokales Minimum von |g|: Berührstelle?
      let lo = x0 + (i - 1) * dx;
      let hi = x0 + (i + 1) * dx;
      for (let k = 0; k < 80; k++) {
        const m1 = lo + (hi - lo) / 3;
        const m2 = hi - (hi - lo) / 3;
        if (Math.abs(g(m1)) < Math.abs(g(m2))) hi = m2;
        else lo = m1;
      }
      const xm = (lo + hi) / 2;
      if (Math.abs(g(xm)) < 1e-7 * Math.max(1, scale)) out.push({ x: xm, sign: 0 });
    }
  }
  return out.filter((q, i) => i === 0 || Math.abs(q.x - out[i - 1]!.x) > dx * 0.5);
}

/* ---------------- Merkmale ---------------- */

export interface Extremum {
  x: number;
  /** Hochpunkt, Tiefpunkt oder Terrassenpunkt (waagrechte Tangente ohne Vorzeichenwechsel) */
  kind: 'max' | 'min' | 'saddle';
  /** Extremstelle an einem Knick (f′ springt, keine waagrechte Tangente) */
  kink?: boolean;
}
export interface Inflection {
  x: number;
  /** Wendestelle mit waagrechter Tangente (Terrassenpunkt) */
  saddle: boolean;
}
export interface Features {
  ext: Extremum[];
  infl: Inflection[];
}

/** Extrem-, Terrassen- und Wendestellen von f (über f′ und f″) im Bereich [x0; x1]. */
export function features(fn: Fn, x0 = fn.dom[0], x1 = fn.dom[1]): Features {
  const span = x1 - x0;
  const avoid = [...(fn.kinks ?? []), ...(fn.poles ?? [])];
  const near = (x: number, list = avoid) => list.some((j) => Math.abs(x - j) < span * 0.004);
  const inner = (x: number) => x > x0 + span * 0.002 && x < x1 - span * 0.002;
  const ext: Extremum[] = signZeros(fn.d1, x0, x1)
    .filter((q) => inner(q.x) && !near(q.x))
    .map((q) => ({ x: q.x, kind: q.sign < 0 ? 'max' : q.sign > 0 ? 'min' : 'saddle' }));
  // Knick: f′ wechselt das Vorzeichen ohne Nullstelle
  for (const k of fn.kinks ?? []) {
    if (!inner(k)) continue;
    const l = fn.d1(k - span * 1e-6);
    const r = fn.d1(k + span * 1e-6);
    if (l * r < 0) ext.push({ x: k, kind: l > 0 ? 'max' : 'min', kink: true });
  }
  ext.sort((a, b) => a.x - b.x);
  const saddles = ext.filter((e) => e.kind === 'saddle').map((e) => e.x);
  const infl: Inflection[] = signZeros(fn.d2, x0, x1, 800, !!fn.jumps2)
    .filter((q) => q.sign !== 0 && inner(q.x) && !near(q.x))
    .filter((q) => !q.jump || (fn.jumps2 ?? []).some((j) => Math.abs(j - q.x) < span * 0.004))
    .map((q) => ({ x: q.x, saddle: near(q.x, saddles) }));
  return { ext, infl };
}

/** Art einer Nullstelle von f′ (Hoch-, Tiefpunkt oder Terrassenpunkt) über den Vorzeichenwechsel (Fassung 1). */
export function extremumKind(fn: { d1: (x: number) => number }, x: number, h = 1e-4): 'max' | 'min' | 'saddle' {
  const l = fn.d1(x - h);
  const r = fn.d1(x + h);
  if (l > 0 && r < 0) return 'max';
  if (l < 0 && r > 0) return 'min';
  return 'saddle';
}

export interface SignInterval {
  a: number;
  b: number;
  /** Vorzeichen von f′: f steigt (+1) bzw. fällt (−1) */
  d1: -1 | 0 | 1;
  /** Vorzeichen von f″: linksgekrümmt (+1) bzw. rechtsgekrümmt (−1) */
  d2: -1 | 0 | 1;
}

/** Vorzeichentabelle von f′ und f″: Intervalle zwischen Extrem-, Wende-, Knick- und Polstellen. */
export function signTable(fn: Fn, x0 = fn.dom[0], x1 = fn.dom[1]): SignInterval[] {
  const fe = features(fn, x0, x1);
  const cuts = [x0, ...fe.ext.map((e) => e.x), ...fe.infl.map((e) => e.x), ...[...(fn.kinks ?? []), ...(fn.poles ?? [])].filter((j) => j > x0 && j < x1), x1].sort((a, b) => a - b);
  const span = x1 - x0;
  const s1 = Math.max(1e-9, rangeOf((x) => Math.abs(fn.d1(x)), x0, x1, 120).hi);
  const s2 = Math.max(1e-9, rangeOf((x) => Math.abs(fn.d2(x)), x0, x1, 120).hi);
  const sgn = (v: number, eps: number): -1 | 0 | 1 => (v > eps ? 1 : v < -eps ? -1 : 0);
  const out: SignInterval[] = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i]!;
    const b = cuts[i + 1]!;
    if (b - a < span * 1e-4) continue;
    const m = (a + b) / 2;
    out.push({ a, b, d1: sgn(fn.d1(m), 1e-9 * s1), d2: sgn(fn.d2(m), 1e-9 * s2) });
  }
  const merged: SignInterval[] = [];
  for (const s of out) {
    const last = merged[merged.length - 1];
    if (last && last.d1 === s.d1 && last.d2 === s.d2 && Math.abs(last.b - s.a) < 1e-12 && !(fn.poles ?? []).some((p) => Math.abs(p - s.a) < 1e-9)) last.b = s.b;
    else merged.push({ ...s });
  }
  return merged;
}

/* ---------------- Eigene Skizze von f′ (Aufgabenmodus) ---------------- */

export interface Check {
  x: number;
  /** richtiger Wert f′(x) */
  want: number;
  /** Wert der Skizze */
  got: number;
  ok: boolean;
}
export interface Rating {
  /** mittlere Abweichung |Skizze − f′| */
  mean: number;
  /** mittlere Abweichung bezogen auf die Spannweite von f′ */
  rel: number;
  /** 3 sehr gut, 2 gut, 1 ungefähr, 0 noch weit weg */
  grade: 0 | 1 | 2 | 3;
  checks: Check[];
}

/** Vergleich der Skizze (Stützpunkte nodes | ys) mit dem Graphen von f′. */
export function rateSketch(fn: Fn, nodes: readonly number[], ys: readonly number[], samples = 240): Rating {
  const sk = spline(nodes, ys);
  const a = nodes[0]!;
  const b = nodes[nodes.length - 1]!;
  let sum = 0;
  let cnt = 0;
  for (let i = 0; i <= samples; i++) {
    const x = a + ((b - a) * i) / samples;
    const w = fn.d1(x);
    if (!Number.isFinite(w)) continue;
    sum += Math.abs(sk.f(x) - w);
    cnt++;
  }
  const mean = cnt ? sum / cnt : 0;
  const r = rangeOf(fn.d1, a, b, 200);
  const scale = Math.max(r.hi - r.lo, 0.05 * Math.max(1, Math.abs(r.hi), Math.abs(r.lo)));
  const rel = mean / scale;
  const grade: 0 | 1 | 2 | 3 = rel < 0.05 ? 3 : rel < 0.12 ? 2 : rel < 0.25 ? 1 : 0;
  const checks: Check[] = nodes.map((x, i) => {
    const want = fn.d1(x);
    const got = ys[i]!;
    const ok = Number.isFinite(want) && Math.abs(got - want) <= 0.15 * Math.abs(want) + 0.08 * scale;
    return { x, want, got, ok };
  });
  const okFrac = checks.filter((c) => c.ok).length / checks.length;
  const capped = (okFrac < 0.3 ? 0 : okFrac < 0.6 ? Math.min(grade, 1) : grade) as 0 | 1 | 2 | 3;
  return { mean, rel, grade: capped, checks };
}

/* ---------------- Ableitungsregeln anschaulich ---------------- */

/** Summenregel: g(x) = 0,25x², h(x) = sin x, (g + h)′ = g′ + h′. */
export const SUM = {
  g: (x: number) => 0.25 * x * x,
  dg: (x: number) => 0.5 * x,
  h: (x: number) => Math.sin(x),
  dh: (x: number) => Math.cos(x),
  x: [-4, 4] as [number, number],
};

/** Potenzfunktion xⁿ mit Ableitung n·xⁿ⁻¹ (n ganzzahlig); für n < 0 nur x > 0. */
export function powFn(n: number): Fn {
  const pw = (e: number) => (x: number) => (e === 0 ? 1 : x ** e);
  if (n < 0) {
    return { f: pw(n), d1: (x) => n * x ** (n - 1), d2: (x) => n * (n - 1) * x ** (n - 2), x: [0, 3], dom: [0.35, 3], nodes: [0.5, 0.75, 1, 1.5, 2, 2.5, 3] };
  }
  return { f: pw(n), d1: (x) => (n === 0 ? 0 : n * pw(n - 1)(x)), d2: (x) => (n <= 1 ? 0 : n * (n - 1) * pw(n - 2)(x)), x: [-2, 2], dom: [-2, 2], nodes: [-2, -1.5, -1, 0, 1, 1.5, 2] };
}

/** Produktregel: u(x) = 1 + 0,5x (Breite), v(x) = 1 + 0,25x² (Höhe), Fläche f = u·v. */
export const PROD = {
  u: (x: number) => 1 + 0.5 * x,
  du: () => 0.5,
  v: (x: number) => 1 + 0.25 * x * x,
  dv: (x: number) => 0.5 * x,
  x: [0, 4] as [number, number],
};

/** Zuwachs der Rechteckfläche u·v, wenn x um Δx wächst: drei Streifen. */
export function productIncrement(x: number, dx: number): { u: number; v: number; du: number; dv: number; vdu: number; udv: number; dudv: number; total: number } {
  const u = PROD.u(x);
  const v = PROD.v(x);
  const du = PROD.u(x + dx) - u;
  const dv = PROD.v(x + dx) - v;
  return { u, v, du, dv, vdu: v * du, udv: u * dv, dudv: du * dv, total: PROD.u(x + dx) * PROD.v(x + dx) - u * v };
}

/** Kettenregel: f(x) = sin(kx), f′(x) = k·cos(kx) (innere Ableitung k). */
export function chainFn(k: number): Fn {
  return { f: (x) => Math.sin(k * x), d1: (x) => k * Math.cos(k * x), d2: (x) => -k * k * Math.sin(k * x), x: [-4, 4], dom: [-4, 4], nodes: [-3, -2, -1, 0, 1, 2, 3] };
}

/* ---------------- Fassung 1 (für Tests und Verweise) ---------------- */

/** Die fünf Beispielfunktionen der ersten Fassung. */
export interface LegacyFn {
  f: (x: number) => number;
  d1: (x: number) => number;
  d2: (x: number) => number;
  x: [number, number];
}

export const FNS: Record<'par' | 'cub' | 'quart' | 'sin' | 'exp', LegacyFn> = {
  par: { f: (x) => 0.5 * x * x - 2, d1: (x) => x, d2: () => 1, x: [-4, 4] },
  cub: { f: (x) => (x ** 3 - 6 * x) / 4, d1: (x) => (3 * x * x - 6) / 4, d2: (x) => 1.5 * x, x: [-3.5, 3.5] },
  quart: { f: (x) => 0.1 * x ** 4 - x * x + 1, d1: (x) => 0.4 * x ** 3 - 2 * x, d2: (x) => 1.2 * x * x - 2, x: [-3.6, 3.6] },
  sin: { f: Math.sin, d1: Math.cos, d2: (x) => -Math.sin(x), x: [-6.5, 6.5] },
  exp: { f: Math.exp, d1: Math.exp, d2: Math.exp, x: [-4, 2] },
};

/** Nullstellen von g auf [a, b] (Vorzeichenwechsel, Halbierung) – Fassung 1. */
export function zeros(g: (x: number) => number, a: number, b: number, n = 2000): number[] {
  const out: number[] = [];
  let x0 = a;
  let y0 = g(a);
  if (Math.abs(y0) < 1e-12) out.push(a);
  for (let i = 1; i <= n; i++) {
    const x1 = a + ((b - a) * i) / n;
    const y1 = g(x1);
    if (Math.abs(y1) < 1e-12) out.push(x1);
    else if (y0 * y1 < 0) {
      let lo = x0;
      let hi = x1;
      for (let k = 0; k < 60; k++) {
        const m = (lo + hi) / 2;
        if (g(lo) * g(m) <= 0) hi = m;
        else lo = m;
      }
      out.push((lo + hi) / 2);
    }
    x0 = x1;
    y0 = y1;
  }
  return out.filter((x, i) => i === 0 || Math.abs(x - out[i - 1]!) > 1e-6);
}
