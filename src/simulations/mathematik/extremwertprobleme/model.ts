/**
 * Rechenlogik „Extremwertprobleme“ (Jgst. 13).
 *
 * Vorgehen: Zielfunktion aufstellen, mit der Nebenbedingung auf eine
 * Variable reduzieren, Definitionsbereich angeben, Ableitung null setzen,
 * Art des Extremums prüfen und die Randwerte vergleichen.
 *
 * - Schachtel: Aus einem Karton a × b werden an den Ecken Quadrate der
 *   Seitenlänge x ausgeschnitten: V(x) = x(a − 2x)(b − 2x), 0 < x < min(a, b)/2.
 * - Dose: Zylinder mit festem Volumen V; Oberfläche O(r) = 2πr² + 2V/r, r > 0.
 * - Rechteck unter f(x) = 3e^(−0,5x): A(u) = u · f(u), u > 0.
 * - Zylinder im Kegel (Radius R, Höhe H): V(r) = πr² · H(1 − r/R), 0 < r < R.
 * - Rettungsschwimmer: a m Sand bis zum Ufer, b m Wasser, seitlicher Abstand
 *   d; Laufen mit v₁, Schwimmen mit v₂. Zeit
 *   T(x) = √(a² + x²)/v₁ + √(b² + (d − x)²)/v₂, 0 ≤ x ≤ d.
 *   Im Optimum gilt das Brechungsgesetz sin α₁ / v₁ = sin α₂ / v₂.
 *
 * Alle Funktionen sind rein (ohne Zeichnen) und werden in
 * `tests/extremwertprobleme.test.ts` geprüft.
 */

export type ProbKey = 'box' | 'can' | 'rect' | 'cone' | 'life';

/* ---------- Schachtel ---------- */

export interface Box {
  a: number;
  b: number;
}

export function boxVolume(p: Box, x: number): number {
  return x * (p.a - 2 * x) * (p.b - 2 * x);
}
export function boxDeriv(p: Box, x: number): number {
  // V(x) = 4x³ − 2(a + b)x² + abx
  return 12 * x * x - 4 * (p.a + p.b) * x + p.a * p.b;
}
/** V″(x) = 24x − 4(a + b) */
export function boxSecond(p: Box, x: number): number {
  return 24 * x - 4 * (p.a + p.b);
}
/** Beide Nullstellen von V′ (aufsteigend); die größere liegt immer außerhalb des Definitionsbereichs (oder auf dem Rand). */
export function boxCritical(p: Box): [number, number] {
  const s = p.a + p.b;
  const w = Math.sqrt(s * s - 3 * p.a * p.b);
  return [(s - w) / 6, (s + w) / 6];
}
/** Maximalstelle im Definitionsbereich (kleinere Nullstelle von V′). */
export function boxOptimum(p: Box): number {
  const s = p.a + p.b;
  return (s - Math.sqrt(s * s - 3 * p.a * p.b)) / 6;
}
/** Polynomform V(x) = c₃x³ + c₂x² + c₁x (Koeffizienten [c₃, c₂, c₁]). */
export function boxPolynomial(p: Box): [number, number, number] {
  return [4, -2 * (p.a + p.b), p.a * p.b];
}
/** Die Gleichung V′(x) = 0 nach Division durch den größten gemeinsamen Teiler (ganzzahlige Seiten): [A, B, C] mit Ax² + Bx + C = 0. */
export function boxReducedQuadratic(p: Box): [number, number, number] {
  const c = [12, -4 * (p.a + p.b), p.a * p.b];
  if (!c.every((v) => Number.isInteger(v))) return c as [number, number, number];
  const gcd = (u: number, v: number): number => (v === 0 ? Math.abs(u) : gcd(v, u % v));
  const k = c.reduce((acc, v) => gcd(acc, v), 0) || 1;
  return c.map((v) => v / k) as [number, number, number];
}

/* ---------- Dose ---------- */

/** Sinnvoller Bereich für den Radius in der Darstellung (cm). */
export const CAN_DOMAIN: [number, number] = [1, 12];

export function canSurface(V: number, r: number): number {
  return 2 * Math.PI * r * r + (2 * V) / r;
}
export function canHeight(V: number, r: number): number {
  return V / (Math.PI * r * r);
}
export function canDeriv(V: number, r: number): number {
  return 4 * Math.PI * r - (2 * V) / (r * r);
}
/** O″(r) = 4π + 4V/r³ > 0 für alle r > 0 */
export function canSecond(V: number, r: number): number {
  return 4 * Math.PI + (4 * V) / (r * r * r);
}
export function canOptimum(V: number): number {
  return Math.cbrt(V / (2 * Math.PI));
}
/** Kleinste Oberfläche: mit h = 2r ist O = 2πr² + 2πr · 2r = 6πr². */
export function canMinSurface(V: number): number {
  const r = canOptimum(V);
  return 6 * Math.PI * r * r;
}

/* ---------- Rechteck unter der e-Funktion ---------- */

export const RECT_DOMAIN: [number, number] = [0, 7];
export const rectF = (x: number) => 3 * Math.exp(-0.5 * x);
export function rectArea(u: number): number {
  return u * rectF(u);
}
export function rectDeriv(u: number): number {
  return rectF(u) * (1 - 0.5 * u);
}
/** A″(u) = 3e^(−0,5u) · (0,25u − 1) */
export function rectSecond(u: number): number {
  return rectF(u) * (0.25 * u - 1);
}
export const rectOptimum = 2;

/* ---------- Zylinder im Kegel ---------- */

export interface Cone {
  R: number;
  H: number;
}
/** Höhe des einbeschriebenen Zylinders (Strahlensatz). */
export function coneCylHeight(c: Cone, r: number): number {
  return c.H * (1 - r / c.R);
}
export function coneVolume(c: Cone, r: number): number {
  return Math.PI * r * r * coneCylHeight(c, r);
}
export function coneDeriv(c: Cone, r: number): number {
  // V(r) = πH(r² − r³/R)  ⇒  V′(r) = πH(2r − 3r²/R)
  return Math.PI * c.H * (2 * r - (3 * r * r) / c.R);
}
/** V″(r) = πH(2 − 6r/R) */
export function coneSecond(c: Cone, r: number): number {
  return Math.PI * c.H * (2 - (6 * r) / c.R);
}
export function coneOptimum(c: Cone): number {
  return (2 * c.R) / 3;
}
/** Größtes Volumen: V(2R/3) = π · 4R²/9 · H/3 = 4πR²H/27. */
export function coneMaxVolume(c: Cone): number {
  return (4 * Math.PI * c.R * c.R * c.H) / 27;
}
/** Volumen des Kegels selbst. */
export function coneOwnVolume(c: Cone): number {
  return (Math.PI * c.R * c.R * c.H) / 3;
}

/* ---------- Rettungsschwimmer ---------- */

export interface Life {
  /** Abstand zum Ufer auf dem Sand (m) */
  a: number;
  /** Abstand der Person im Wasser vom Ufer (m) */
  b: number;
  /** seitlicher Abstand (m) */
  d: number;
  /** Laufgeschwindigkeit (m/s) */
  v1: number;
  /** Schwimmgeschwindigkeit (m/s) */
  v2: number;
}
/** Feste Maße am Strand (m): Sand, Wasser, seitlicher Abstand. */
export const LIFE_GEOM = { a: 20, b: 30, d: 60 } as const;

export function lifeTime(l: Life, x: number): number {
  return Math.hypot(l.a, x) / l.v1 + Math.hypot(l.b, l.d - x) / l.v2;
}
export function lifeDeriv(l: Life, x: number): number {
  return x / (l.v1 * Math.hypot(l.a, x)) - (l.d - x) / (l.v2 * Math.hypot(l.b, l.d - x));
}
/** T″(x) = a²/(v₁(a² + x²)^{3/2}) + b²/(v₂(b² + (d − x)²)^{3/2}) > 0 */
export function lifeSecond(l: Life, x: number): number {
  const s1 = Math.hypot(l.a, x);
  const s2 = Math.hypot(l.b, l.d - x);
  return (l.a * l.a) / (l.v1 * s1 * s1 * s1) + (l.b * l.b) / (l.v2 * s2 * s2 * s2);
}
/** Optimum per Bisektion: T′ wächst streng, T′(0) < 0 < T′(d). */
export function lifeOptimum(l: Life): number {
  let lo = 0;
  let hi = l.d;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    if (lifeDeriv(l, m) < 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
/** Newton-Verfahren für T′(x) = 0: x_{n+1} = x_n − T′(x_n)/T″(x_n). Liefert x₀, x₁, …, x_steps (im Bereich [0; d] gehalten). */
export function lifeNewton(l: Life, x0: number, steps: number): number[] {
  const out = [x0];
  let x = x0;
  for (let i = 0; i < steps; i++) {
    x = Math.min(l.d, Math.max(0, x - lifeDeriv(l, x) / lifeSecond(l, x)));
    out.push(x);
  }
  return out;
}
/** sin α₁ und sin α₂ (Winkel zum Lot auf die Uferlinie). */
export function lifeSines(l: Life, x: number): [number, number] {
  return [x / Math.hypot(l.a, x), (l.d - x) / Math.hypot(l.b, l.d - x)];
}
/** Wo die gerade Linie vom Start zur Person das Ufer schneidet (Strahlensatz). */
export function lifeStraight(l: Life): number {
  return (l.a * l.d) / (l.a + l.b);
}

/* ---------- allgemein ---------- */

/** Zweite Ableitung numerisch aus der ersten (zur Art des Extremums). */
export function secondDeriv(d: (x: number) => number, x: number, h = 1e-4): number {
  return (d(x + h) - d(x - h)) / (2 * h);
}

/** Alle Größen, die ein Problem festlegen (Regler der Simulation). */
export interface ProbParams {
  a: number;
  b: number;
  v: number;
  ch: number;
  cr: number;
  v1: number;
  v2: number;
}

/** Verhalten am Rand: endlicher Wert, Grenzwert (offener Rand) oder „wächst über alle Grenzen“. */
export type Edge = { kind: 'value'; x: number; y: number } | { kind: 'limit'; x: number; y: number } | { kind: 'inf'; x: number };

/** Zielfunktion eines Problems samt Definitionsbereich, Ableitungen, Optimum und Randverhalten. */
export interface Objective {
  key: ProbKey;
  /** Bereich der Darstellung (bei der Dose und beim Rechteck ein Ausschnitt von r > 0 bzw. u > 0) */
  lo: number;
  hi: number;
  /** Ränder gehören zum Definitionsbereich (nur beim Rettungsschwimmer) */
  closed: boolean;
  kind: 'max' | 'min';
  f: (x: number) => number;
  d1: (x: number) => number;
  d2: (x: number) => number;
  opt: number;
  ends: [Edge, Edge];
}

export function objective(key: ProbKey, q: ProbParams): Objective {
  switch (key) {
    case 'box': {
      const p = { a: q.a, b: q.b };
      const hi = Math.min(q.a, q.b) / 2;
      return { key, lo: 0, hi, closed: false, kind: 'max', f: (x) => boxVolume(p, x), d1: (x) => boxDeriv(p, x), d2: (x) => boxSecond(p, x), opt: boxOptimum(p), ends: [{ kind: 'limit', x: 0, y: 0 }, { kind: 'limit', x: hi, y: 0 }] };
    }
    case 'can':
      return { key, lo: CAN_DOMAIN[0], hi: CAN_DOMAIN[1], closed: false, kind: 'min', f: (r) => canSurface(q.v, r), d1: (r) => canDeriv(q.v, r), d2: (r) => canSecond(q.v, r), opt: canOptimum(q.v), ends: [{ kind: 'inf', x: 0 }, { kind: 'inf', x: Infinity }] };
    case 'rect':
      return { key, lo: RECT_DOMAIN[0], hi: RECT_DOMAIN[1], closed: false, kind: 'max', f: rectArea, d1: rectDeriv, d2: rectSecond, opt: rectOptimum, ends: [{ kind: 'limit', x: 0, y: 0 }, { kind: 'limit', x: Infinity, y: 0 }] };
    case 'cone': {
      const c = { R: q.cr, H: q.ch };
      return { key, lo: 0, hi: c.R, closed: false, kind: 'max', f: (r) => coneVolume(c, r), d1: (r) => coneDeriv(c, r), d2: (r) => coneSecond(c, r), opt: coneOptimum(c), ends: [{ kind: 'limit', x: 0, y: 0 }, { kind: 'limit', x: c.R, y: 0 }] };
    }
    case 'life': {
      const l: Life = { ...LIFE_GEOM, v1: q.v1, v2: q.v2 };
      return { key, lo: 0, hi: l.d, closed: true, kind: 'min', f: (x) => lifeTime(l, x), d1: (x) => lifeDeriv(l, x), d2: (x) => lifeSecond(l, x), opt: lifeOptimum(l), ends: [{ kind: 'value', x: 0, y: lifeTime(l, 0) }, { kind: 'value', x: l.d, y: lifeTime(l, l.d) }] };
    }
  }
}

/** Ist das Optimum wirklich global? Vergleich mit den Randwerten bzw. Grenzwerten. */
export function isGlobal(o: Objective): boolean {
  const best = o.f(o.opt);
  return o.ends.every((e) => (e.kind === 'inf' ? o.kind === 'min' : o.kind === 'max' ? e.y <= best + 1e-12 : e.y >= best - 1e-12));
}

/** Gütegrad: aktueller Wert im Verhältnis zum Optimum (1 = optimal; bei Minima Optimum/Wert). */
export function quality(o: Objective, x: number): number {
  const best = o.f(o.opt);
  const cur = o.f(x);
  if (o.kind === 'max') return best > 0 ? Math.max(0, cur / best) : 0;
  return cur > 0 ? Math.min(1, best / cur) : 0;
}

/**
 * Vorzeichenwechsel der Ableitung an der Stelle x₀: Werte links und rechts
 * in einem kleinen Abstand (für die Anzeige „+ → −“).
 */
export function signChange(o: Objective, x0: number, h?: number): { left: number; right: number; kind: 'max' | 'min' | 'none' } {
  const step = h ?? (o.hi - o.lo) * 0.05;
  const left = o.d1(Math.max(o.lo + 1e-6, x0 - step));
  const right = o.d1(Math.min(o.hi - 1e-6, x0 + step));
  const kind = left > 0 && right < 0 ? 'max' : left < 0 && right > 0 ? 'min' : 'none';
  return { left, right, kind };
}
