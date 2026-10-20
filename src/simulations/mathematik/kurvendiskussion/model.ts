/**
 * Rechenlogik „Monotonie, Extrem- und Wendestellen“ (Jgst. 11/12).
 *
 * Ganzrationale Funktionen bis Grad 4, f(x) = q x⁴ + a x³ + b x² + c x + d.
 * - notwendige Bedingung für Extremstellen: f'(x) = 0
 * - hinreichend: Vorzeichenwechsel von f' (+ → −: Hochpunkt, − → +: Tiefpunkt);
 *   ohne Vorzeichenwechsel: Terrassenpunkt
 * - Wendestellen: f''(x) = 0 mit Vorzeichenwechsel von f''
 * - Monotonie: f' > 0 ⇒ streng monoton steigend, f' < 0 ⇒ fallend
 */

/** Koeffizienten, niedrigster Grad zuerst. */
export type Poly = number[];

export function evalPoly(p: Poly, x: number): number {
  let y = 0;
  for (let i = p.length - 1; i >= 0; i--) y = y * x + p[i]!;
  return y;
}

export function derive(p: Poly): Poly {
  const out = p.slice(1).map((c, i) => c * (i + 1));
  return out.length ? out : [0];
}

export function degree(p: Poly): number {
  for (let i = p.length - 1; i >= 0; i--) if (Math.abs(p[i]!) > 1e-12) return i;
  return -1;
}

/** Reelle Nullstellen auf [lo, hi]: Vorzeichenwechsel und Berührstellen (doppelte Nullstellen). */
export function realZeros(p: Poly, lo: number, hi: number): number[] {
  if (degree(p) < 0) return [];
  const g = (x: number) => evalPoly(p, x);
  const out: number[] = [];
  const bis = (a: number, b: number, h: (x: number) => number) => {
    let l = a;
    let r = b;
    for (let k = 0; k < 80; k++) {
      const m = (l + r) / 2;
      if (h(l) * h(m) <= 0) r = m;
      else l = m;
    }
    return (l + r) / 2;
  };
  const N = 4000;
  const dp = derive(p);
  const dg = (x: number) => evalPoly(dp, x);
  for (let i = 0; i < N; i++) {
    const a = lo + ((hi - lo) * i) / N;
    const b = lo + ((hi - lo) * (i + 1)) / N;
    const ya = g(a);
    const yb = g(b);
    if (ya === 0) out.push(a);
    else if (ya * yb < 0) out.push(bis(a, b, g));
    // Berührstelle: g' wechselt das Vorzeichen und |g| ist dort (fast) null
    else if (degree(dp) >= 0 && dg(a) * dg(b) < 0) {
      const m = bis(a, b, dg);
      if (Math.abs(g(m)) < 1e-9 * (1 + Math.max(...p.map(Math.abs)))) out.push(m);
    }
  }
  const sorted = out.sort((u, v) => u - v);
  return sorted.filter((x, i) => i === 0 || Math.abs(x - sorted[i - 1]!) > 1e-6).map((x) => (Math.abs(x) < 1e-9 ? 0 : x));
}

export type ExtKind = 'max' | 'min' | 'saddle';

export interface Point {
  x: number;
  y: number;
}

export interface Analysis {
  d1: Poly;
  d2: Poly;
  /** Nullstellen von f' (Kandidaten) */
  candidates: number[];
  extrema: (Point & { kind: ExtKind })[];
  inflections: Point[];
  /** Intervalle der Monotonie (Grenzen −∞ / +∞ als ±Infinity) */
  mono: { from: number; to: number; sign: 1 | -1 | 0 }[];
  curv: { from: number; to: number; sign: 1 | -1 | 0 }[];
}

function signAt(p: Poly, x: number): 1 | -1 | 0 {
  const v = evalPoly(p, x);
  return Math.abs(v) < 1e-12 ? 0 : v > 0 ? 1 : -1;
}

function intervals(p: Poly, cuts: number[]): { from: number; to: number; sign: 1 | -1 | 0 }[] {
  const bounds = [-Infinity, ...cuts, Infinity];
  const out: { from: number; to: number; sign: 1 | -1 | 0 }[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const a = bounds[i]!;
    const b = bounds[i + 1]!;
    const m = !Number.isFinite(a) ? (Number.isFinite(b) ? b - 1 : 0) : !Number.isFinite(b) ? a + 1 : (a + b) / 2;
    const s = signAt(p, m);
    const last = out[out.length - 1];
    if (last && last.sign === s) last.to = b;
    else out.push({ from: a, to: b, sign: s });
  }
  return out;
}

export function analyze(f: Poly, lo = -50, hi = 50): Analysis {
  const d1 = derive(f);
  const d2 = derive(d1);
  const candidates = realZeros(d1, lo, hi);
  const h = 1e-4;
  const extrema = candidates.map((x) => {
    const l = evalPoly(d1, x - h);
    const r = evalPoly(d1, x + h);
    const kind: ExtKind = l > 0 && r < 0 ? 'max' : l < 0 && r > 0 ? 'min' : 'saddle';
    return { x, y: evalPoly(f, x), kind };
  });
  const w = realZeros(d2, lo, hi).filter((x) => evalPoly(d2, x - h) * evalPoly(d2, x + h) < 0);
  return {
    d1,
    d2,
    candidates,
    extrema,
    inflections: w.map((x) => ({ x, y: evalPoly(f, x) })),
    mono: intervals(d1, candidates),
    curv: intervals(d2, w),
  };
}
