/**
 * Rechenlogik der Simulation „Lineare Funktion“ (ohne Zeichnen, gut testbar).
 *
 * Bezeichnungen wie in Bayern: f(x) = m·x + t (t = y-Achsenabschnitt). Der
 * Parameter-Schlüssel in geteilten Links heißt aus Kompatibilitätsgründen weiter `b`.
 */
export type LineRelation =
  | { kind: 'identical' }
  | { kind: 'parallel' }
  | { kind: 'intersect'; x: number; y: number; perpendicular: boolean };

/** Lage zweier Geraden y = m₁x + t₁ und y = m₂x + t₂. */
export function lineRelation(m1: number, t1: number, m2: number, t2: number, eps = 1e-9): LineRelation {
  if (Math.abs(m1 - m2) < eps) return Math.abs(t1 - t2) < eps ? { kind: 'identical' } : { kind: 'parallel' };
  const x = (t2 - t1) / (m1 - m2);
  return { kind: 'intersect', x, y: m1 * x + t1, perpendicular: Math.abs(m1 * m2 + 1) < 1e-6 };
}

/**
 * Nullstelle von f(x) = m·x + t: x₀ = −t : m.
 * Bei m = 0 gibt es keine (`null`) oder – für t = 0 – jede Stelle ist Nullstelle (`'all'`).
 */
export function zeroOf(m: number, t: number): number | null | 'all' {
  if (m === 0) return t === 0 ? 'all' : null;
  const x0 = -t / m;
  return x0 === 0 ? 0 : x0; // −0 vermeiden
}

/** true, wenn `value` beim Runden auf `decimals` Nachkommastellen verändert wird (Anzeige dann mit „≈“). */
export function isRounded(value: number, decimals: number): boolean {
  const f = 10 ** decimals;
  return Math.abs(Math.round(value * f) / f - value) > 1e-9;
}

/** Steigungswinkel α in Grad (−90° < α < 90°) mit tan α = m. */
export function slopeAngleDeg(m: number): number {
  return (Math.atan(m) * 180) / Math.PI;
}

/**
 * Gerade durch zwei Punkte: m = Δy : Δx, t = y₁ − m·x₁.
 * Bei x₁ = x₂ ist die Gerade senkrecht und keine Funktion → `null`.
 */
export function lineThrough(x1: number, y1: number, x2: number, y2: number): { m: number; t: number } | null {
  if (x1 === x2) return null;
  const m = (y2 - y1) / (x2 - x1);
  return { m, t: y1 - m * x1 };
}

/* ------------------------------------------------------------------ */
/* Wertetabelle                                                        */
/* ------------------------------------------------------------------ */

/** Zeilen einer Wertetabelle x, f(x) ab `from` mit Schrittweite `dx`. */
export function tableRows(m: number, t: number, from: number, count: number, dx = 1): { x: number; y: number }[] {
  const rows: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = from + i * dx;
    rows.push({ x, y: clean(m * x + t) });
  }
  return rows;
}

/** Rundungsrauschen entfernen (0,1 · 3 = 0,30000000000000004 → 0,3). */
export function clean(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

/* ------------------------------------------------------------------ */
/* Übung „Gerade treffen“                                              */
/* ------------------------------------------------------------------ */

/** Kleiner, reproduzierbarer Zufallsgenerator (Mulberry32). */
export function rng(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const QUIZ_M = [-3, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 3, -0.2, 0.2, 2.5, -2.5];

/** Zielgerade der Aufgabe Nr. n (Steigung und Achsenabschnitt gut ablesbar). */
export function targetLine(n: number): { m: number; t: number } {
  const r = rng(n * 7919 + 13);
  const m = QUIZ_M[Math.floor(r() * QUIZ_M.length)]!;
  // Achsenabschnitt ganzzahlig; bei m = ±0,2 bzw. ±2,5 eine Zahl, bei der ein Gitterpunkt gut zu sehen ist
  const t = Math.floor(r() * 11) - 5;
  return { m, t };
}

/** Getroffen, wenn Steigung und Achsenabschnitt auf eine Nachkommastelle stimmen. */
export function hits(m: number, t: number, target: { m: number; t: number }): boolean {
  return Math.abs(m - target.m) < 0.05 && Math.abs(t - target.t) < 0.05;
}

/* ------------------------------------------------------------------ */
/* Sachsituationen                                                     */
/* ------------------------------------------------------------------ */

export type ContextId = 'taxi' | 'candle' | 'tariff' | 'tank';

export interface ContextLine {
  /** Startwert (y-Achsenabschnitt) */
  t: number;
  /** Änderung pro Einheit von x (Steigung) */
  m: number;
}

export interface Context {
  id: ContextId;
  /** Sichtbarer Bereich */
  x: [number, number];
  y: [number, number];
  /** Startwert der Ablesestelle */
  x0: number;
  lines: ContextLine[];
  /** Nachkommastellen der y-Werte in der Anzeige */
  yDec: number;
  /** Schrittweite der Ablesestelle */
  step: number;
}

export const CONTEXTS: Record<ContextId, Context> = {
  // Taxi: 3,50 € Grundpreis, 2,00 € pro km
  taxi: { id: 'taxi', x: [0, 16], y: [0, 40], x0: 6, lines: [{ t: 3.5, m: 2 }], yDec: 2, step: 0.5 },
  // Kerze: 20 cm hoch, brennt 1,5 cm pro Stunde ab
  candle: { id: 'candle', x: [0, 16], y: [0, 24], x0: 4, lines: [{ t: 20, m: -1.5 }], yDec: 1, step: 0.5 },
  // Zwei Handytarife: A 5 € + 0,09 € pro Minute, B 15 € + 0,04 € pro Minute
  tariff: { id: 'tariff', x: [0, 400], y: [0, 45], x0: 100, lines: [{ t: 5, m: 0.09 }, { t: 15, m: 0.04 }], yDec: 2, step: 10 },
  // Wassertank: 40 l, Zulauf 15 l pro Minute
  tank: { id: 'tank', x: [0, 10], y: [0, 200], x0: 3, lines: [{ t: 40, m: 15 }], yDec: 0, step: 0.5 },
};

/** Wert der Geraden; bei der Kerze nicht unter 0 (abgebrannt). */
export function contextValue(c: Context, line: ContextLine, x: number): number {
  const v = clean(line.t + line.m * x);
  return c.id === 'candle' ? Math.max(0, v) : v;
}

/** Stelle, an der die erste Gerade den Wert y erreicht (z. B. Kerze abgebrannt bei y = 0). */
export function contextReach(line: ContextLine, y: number): number | null {
  if (line.m === 0) return null;
  return clean((y - line.t) / line.m);
}
