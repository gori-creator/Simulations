/**
 * Rechenlogik zu Rotationskörpern: Der Graph einer Funktion f auf [a; b]
 * dreht sich um die x-Achse. Das Volumen ist
 *
 *   V = π · ∫ₐᵇ (f(x))² dx,
 *
 * denn der Querschnitt an der Stelle x ist ein Kreis mit dem Radius |f(x)|,
 * also mit dem Flächeninhalt A(x) = π · f(x)². Näherung durch n Zylinder-
 * scheiben der Dicke Δx = (b − a) : n:  V ≈ Σ π · rᵢ² · Δx.
 *
 * Alle Funktionen sind so gewählt, dass sich ∫ f² exakt angeben lässt.
 */

export type FnId = 'zyl' | 'kegel' | 'stumpf' | 'kugel' | 'para' | 'sin' | 'horn';

/** Parameter der Funktionen (nicht jede Funktion benutzt jeden). */
export interface FnParams {
  /** Radius (Zylinder, Kugel) */
  r: number;
  /** Steigung (Kegel, Kegelstumpf) */
  m: number;
  /** y-Achsenabschnitt (Kegelstumpf) */
  c: number;
  /** Streckfaktor (Wurzel, Sinus, Horn) */
  k: number;
}

export const FN_IDS: readonly FnId[] = ['zyl', 'kegel', 'stumpf', 'kugel', 'para', 'sin', 'horn'];

/** Größter Bereich der x-Werte, den die Regler für a und b erlauben. */
export const X_LIMITS: readonly [number, number] = [-4, 10];

interface FnDef {
  /** Definitionsbereich (in dem gedreht werden darf). */
  domain(p: FnParams): [number, number];
  f(x: number, p: FnParams): number;
  /** Eine Stammfunktion von f². */
  F2(x: number, p: FnParams): number;
  /** Stellen, an denen |f| ein Extremum haben kann (außer den Rändern). */
  critical(p: FnParams): number[];
  /** Standard-Intervall beim Auswählen der Funktion. */
  start(p: FnParams): [number, number];
}

const DEFS: Record<FnId, FnDef> = {
  zyl: {
    domain: () => [X_LIMITS[0], X_LIMITS[1]],
    f: (_x, p) => p.r,
    F2: (x, p) => p.r * p.r * x,
    critical: () => [],
    start: () => [0, 4],
  },
  kegel: {
    domain: () => [X_LIMITS[0], X_LIMITS[1]],
    f: (x, p) => p.m * x,
    F2: (x, p) => (p.m * p.m * x * x * x) / 3,
    critical: () => [0],
    start: () => [0, 4],
  },
  stumpf: {
    domain: () => [X_LIMITS[0], X_LIMITS[1]],
    f: (x, p) => p.m * x + p.c,
    F2: (x, p) => (p.m * p.m * x * x * x) / 3 + p.m * p.c * x * x + p.c * p.c * x,
    critical: (p) => (Math.abs(p.m) > 1e-12 ? [-p.c / p.m] : []),
    start: () => [0, 4],
  },
  kugel: {
    domain: (p) => [-p.r, p.r],
    f: (x, p) => Math.sqrt(Math.max(0, p.r * p.r - x * x)),
    F2: (x, p) => p.r * p.r * x - (x * x * x) / 3,
    critical: () => [0],
    start: (p) => [-p.r, p.r],
  },
  para: {
    domain: () => [0, X_LIMITS[1]],
    f: (x, p) => p.k * Math.sqrt(Math.max(0, x)),
    F2: (x, p) => (p.k * p.k * x * x) / 2,
    critical: () => [],
    start: () => [0, 4],
  },
  sin: {
    domain: () => [0, Math.PI],
    f: (x, p) => p.k * Math.sin(x),
    F2: (x, p) => p.k * p.k * (x / 2 - Math.sin(2 * x) / 4),
    critical: () => [Math.PI / 2],
    start: () => [0, Math.PI],
  },
  horn: {
    domain: () => [0.25, X_LIMITS[1]],
    f: (x, p) => p.k / x,
    F2: (x, p) => -(p.k * p.k) / x,
    critical: () => [],
    start: () => [1, 6],
  },
};

/** Funktionswert f(x). */
export function fValue(id: FnId, p: FnParams, x: number): number {
  return DEFS[id].f(x, p);
}

/** Radius des Körpers an der Stelle x (Betrag des Funktionswerts). */
export function radiusAt(id: FnId, p: FnParams, x: number): number {
  return Math.abs(DEFS[id].f(x, p));
}

/** Stellen, an denen |f| einen Knick oder ein Extremum haben kann (für die Zeichnung). */
export function criticalPoints(id: FnId, p: FnParams): number[] {
  return DEFS[id].critical(p);
}

export function domainOf(id: FnId, p: FnParams): [number, number] {
  return DEFS[id].domain(p);
}

export function startInterval(id: FnId, p: FnParams): [number, number] {
  return DEFS[id].start(p);
}

/**
 * Wirksames Intervall: a und b in den Definitionsbereich geschoben und
 * geordnet (a < b). Liegt die Breite unter `minWidth`, wird b vergrößert
 * (bzw. a verkleinert, wenn b schon am Rand liegt).
 */
export function effectiveInterval(id: FnId, p: FnParams, a: number, b: number, minWidth = 0.1): [number, number] {
  const [d0, d1] = domainOf(id, p);
  let lo = Math.min(Math.max(Math.min(a, b), d0), d1);
  let hi = Math.min(Math.max(Math.max(a, b), d0), d1);
  if (hi - lo < minWidth) {
    hi = Math.min(d1, lo + minWidth);
    lo = Math.max(d0, hi - minWidth);
  }
  return [lo, hi];
}

/** Querschnittsfläche A(x) = π · f(x)². */
export function crossSection(id: FnId, p: FnParams, x: number): number {
  const f = DEFS[id].f(x, p);
  return Math.PI * f * f;
}

/** Exaktes Integral ∫ₐᵇ f(x)² dx (über die Stammfunktion). */
export function integralF2(id: FnId, p: FnParams, a: number, b: number): number {
  const d = DEFS[id];
  return d.F2(b, p) - d.F2(a, p);
}

/** Exaktes Volumen V = π · ∫ₐᵇ f(x)² dx. */
export function volume(id: FnId, p: FnParams, a: number, b: number): number {
  return Math.PI * integralF2(id, p, a, b);
}

/** Wahl der Scheibenradien: Mittelpunkt, kleinster Radius (innen) oder größter Radius (außen). */
export type DiscKind = 'mid' | 'lower' | 'upper';

export interface Disc {
  x0: number;
  x1: number;
  /** Radius der Scheibe */
  r: number;
}

/** Kleinster und größter Radius |f| auf [x0; x1] (exakt über Ränder und kritische Stellen). */
export function radiusRange(id: FnId, p: FnParams, x0: number, x1: number): [number, number] {
  const xs = [x0, x1, ...DEFS[id].critical(p).filter((x) => x > x0 && x < x1)];
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of xs) {
    const r = radiusAt(id, p, x);
    lo = Math.min(lo, r);
    hi = Math.max(hi, r);
  }
  return [lo, hi];
}

/** n Zylinderscheiben gleicher Dicke auf [a; b]. */
export function discs(id: FnId, p: FnParams, a: number, b: number, n: number, kind: DiscKind): Disc[] {
  const count = Math.max(1, Math.floor(n));
  const dx = (b - a) / count;
  const out: Disc[] = [];
  for (let i = 0; i < count; i++) {
    const x0 = a + i * dx;
    const x1 = i === count - 1 ? b : a + (i + 1) * dx;
    let r: number;
    if (kind === 'mid') r = radiusAt(id, p, (x0 + x1) / 2);
    else {
      const [lo, hi] = radiusRange(id, p, x0, x1);
      r = kind === 'lower' ? lo : hi;
    }
    out.push({ x0, x1, r });
  }
  return out;
}

/** Summe der Scheibenvolumina Σ π · rᵢ² · Δx. */
export function discSum(list: readonly Disc[]): number {
  let s = 0;
  for (const d of list) s += Math.PI * d.r * d.r * (d.x1 - d.x0);
  return s;
}

/** Bequem: Scheibensumme direkt aus den Angaben. */
export function discVolume(id: FnId, p: FnParams, a: number, b: number, n: number, kind: DiscKind): number {
  return discSum(discs(id, p, a, b, n, kind));
}

/* ------------------------------------------------------------------ */
/* Bekannte Körperformeln zur Kontrolle                                 */
/* ------------------------------------------------------------------ */

export type SolidName =
  | 'zylinder'
  | 'kegel'
  | 'kegelstumpf'
  | 'doppelkegel'
  | 'kugel'
  | 'kugelabschnitt'
  | 'kugelschicht'
  | 'paraboloid'
  | 'paraboloidstumpf'
  | 'spindel'
  | 'horn';

export interface KnownSolid {
  name: SolidName;
  /** Werte für die Formel (Radien, Höhe). */
  values: Record<string, number>;
  /** Volumen nach der Körperformel (ohne Integral), sofern es eine gibt. */
  volume: number | null;
}

const EPS = 1e-9;

/**
 * Welcher bekannte Körper entsteht, und welches Volumen liefert die
 * Körperformel aus der Mittelstufe? (Kontrolle des Integrals)
 */
export function knownSolid(id: FnId, p: FnParams, a: number, b: number): KnownSolid {
  const h = b - a;
  const ra = radiusAt(id, p, a);
  const rb = radiusAt(id, p, b);
  switch (id) {
    case 'zyl':
      return { name: 'zylinder', values: { r: Math.abs(p.r), h }, volume: Math.PI * p.r * p.r * h };
    case 'kegel':
    case 'stumpf': {
      const fa = fValue(id, p, a);
      const fb = fValue(id, p, b);
      if (fa * fb < -EPS) {
        // Nullstelle im Inneren: zwei Kegel, Spitze an Spitze
        const x0 = id === 'kegel' ? 0 : -p.c / p.m;
        const h1 = x0 - a;
        const h2 = b - x0;
        return { name: 'doppelkegel', values: { r1: ra, h1, r2: rb, h2 }, volume: (Math.PI / 3) * (ra * ra * h1 + rb * rb * h2) };
      }
      const R = Math.max(ra, rb);
      const r = Math.min(ra, rb);
      if (Math.abs(R - r) < EPS) return { name: 'zylinder', values: { r: R, h }, volume: Math.PI * R * R * h };
      if (r < EPS) return { name: 'kegel', values: { r: R, h }, volume: (Math.PI / 3) * R * R * h };
      return { name: 'kegelstumpf', values: { R, r, h }, volume: (Math.PI / 3) * h * (R * R + R * r + r * r) };
    }
    case 'kugel': {
      const R = Math.abs(p.r);
      const full = a <= -R + EPS && b >= R - EPS;
      if (full) return { name: 'kugel', values: { r: R }, volume: (4 / 3) * Math.PI * R * R * R };
      if (a <= -R + EPS || b >= R - EPS) return { name: 'kugelabschnitt', values: { r: R, h }, volume: (Math.PI / 3) * h * h * (3 * R - h) };
      return { name: 'kugelschicht', values: { r1: ra, r2: rb, h }, volume: (Math.PI * h * (3 * ra * ra + 3 * rb * rb + h * h)) / 6 };
    }
    case 'para':
      if (a < EPS) return { name: 'paraboloid', values: { r: rb, h }, volume: 0.5 * Math.PI * rb * rb * h };
      return { name: 'paraboloidstumpf', values: { r1: ra, r2: rb, h }, volume: 0.5 * Math.PI * h * (ra * ra + rb * rb) };
    case 'sin':
      return { name: 'spindel', values: { h }, volume: null };
    case 'horn':
      return { name: 'horn', values: { a, b }, volume: null };
  }
}

/** Grenzwert des Horn-Volumens für b → ∞: π · k² : a (endlich!). */
export function hornLimit(p: FnParams, a: number): number {
  return (Math.PI * p.k * p.k) / a;
}

/* ------------------------------------------------------------------ */
/* Darstellung exakter Werte                                           */
/* ------------------------------------------------------------------ */

/** Ein Volumen als Bruch mal π bzw. π²: V = (num : den) · π^pow. */
export interface PiForm {
  num: number;
  den: number;
  pow: 1 | 2;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/**
 * Versucht, V als (num : den) · π oder (num : den) · π² mit kleinem Nenner
 * zu schreiben (z. B. 32/3 · π für die Kugel mit r = 2). Sonst `null`.
 */
export function piForm(value: number, maxDen = 48): PiForm | null {
  if (!Number.isFinite(value)) return null;
  for (const pow of [1, 2] as const) {
    const q = value / Math.PI ** pow;
    for (let den = 1; den <= maxDen; den++) {
      const num = Math.round(q * den);
      if (Math.abs(num) > 100000) break;
      if (Math.abs(q * den - num) < 1e-7 * Math.max(1, Math.abs(num))) {
        if (num === 0) return { num: 0, den: 1, pow };
        const g = gcd(num, den);
        return { num: num / g, den: den / g, pow };
      }
    }
  }
  return null;
}
