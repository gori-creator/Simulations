/**
 * Rechenlogik „Direkte und indirekte Proportionalität“ (Jahrgangsstufe 6–8).
 *
 * - direkt proportional: y = k · x  (quotientengleich: y : x = k);
 *   Graph: Halbgerade durch den Ursprung. Verdoppelt man x, verdoppelt sich y.
 * - indirekt proportional: y = k : x  (produktgleich: x · y = k);
 *   Graph: Hyperbelast. Verdoppelt man x, halbiert sich y. Die Rechtecke
 *   unter den Punkten haben alle den Flächeninhalt k.
 * - weder noch (Gegenbeispiel): y = m · x + b mit b ≠ 0, z. B. Taxi mit
 *   Grundgebühr: „je mehr – desto mehr“, aber nicht proportional.
 *
 * Alles ohne Zeichencode, damit es in `tests/proportional.test.ts` geprüft
 * werden kann.
 */

export type Kind = 'dir' | 'ind' | 'lin';

export interface Relation {
  kind: Kind;
  /** Proportionalitätsfaktor (dir), Produkt (ind) bzw. Preis pro Einheit (lin) */
  k: number;
  /** Grundgebühr (nur lin) */
  b: number;
}

/** Zugeordneter Wert y zu x. */
export function value(r: Relation, x: number): number {
  if (r.kind === 'dir') return r.k * x;
  if (r.kind === 'ind') return x === 0 ? NaN : r.k / x;
  return r.k * x + r.b;
}

/** Quotient y : x (bei direkter Proportionalität überall gleich k). */
export function quotient(r: Relation, x: number): number {
  return value(r, x) / x;
}

/** Produkt x · y (bei indirekter Proportionalität überall gleich k). */
export function product(r: Relation, x: number): number {
  return x * value(r, x);
}

/** Sind alle Zahlen (bis auf Rundung) gleich? */
function allEqual(v: number[], tol: number): boolean {
  if (v.length === 0) return false;
  return v.every((q) => Number.isFinite(q) && Math.abs(q - v[0]!) <= tol * Math.max(1, Math.abs(v[0]!)));
}

/** Ist eine Wertetabelle quotientengleich bzw. produktgleich? */
export function check(pairs: [number, number][], tol = 1e-9): { quotient: boolean; product: boolean } {
  const qs = pairs.filter(([x]) => x !== 0).map(([x, y]) => y / x);
  const ps = pairs.map(([x, y]) => x * y);
  return { quotient: allEqual(qs, tol), product: allEqual(ps, tol) };
}

/**
 * Dreisatz von x₁ auf x₂: Faktor, mit dem x multipliziert wird, und der
 * zugehörige Faktor für y (direkt: gleich, indirekt: Kehrwert).
 */
export function ruleFactors(r: Relation, x1: number, x2: number): { fx: number; fy: number } {
  const fx = x2 / x1;
  const fy = value(r, x2) / value(r, x1);
  return { fx, fy };
}

/* ------------------------------------------------------------------ */
/* Bereiche der Situationen                                            */
/* ------------------------------------------------------------------ */

/** Größter sinnvoller x-Wert je Situation (Äpfel 10 kg, 12 Pumpen, 10 km). */
export const X_MAX: Record<Kind, number> = { dir: 10, ind: 12, lin: 10 };
/** Kleinster x-Wert je Situation. */
export const X_MIN: Record<Kind, number> = { dir: 0.5, ind: 1, lin: 0.5 };

/**
 * x in den Bereich der Situation bringen: Masse und Strecke in Schritten von
 * 0,5; Pumpen (bzw. Personen) nur ganzzahlig.
 */
export function clampX(kind: Kind, x: number): number {
  const lo = X_MIN[kind];
  const hi = X_MAX[kind];
  const v = kind === 'ind' ? Math.round(x) : Math.round(x * 2) / 2;
  return Math.min(hi, Math.max(lo, v));
}

/* ------------------------------------------------------------------ */
/* Dreisatz                                                            */
/* ------------------------------------------------------------------ */

/** Rechenschritt im Dreisatz: „· f“ oder „: f“. */
export interface Op {
  op: '·' | ':';
  f: number;
}

export interface RuleOfThree {
  /** Zeilen (x | y): bekannte Menge, eine Einheit, gesuchte Menge */
  rows: [[number, number], [number, number], [number, number]];
  /** Schritte links (bei x) von Zeile 1 → 2 und 2 → 3 */
  left: [Op, Op];
  /** Schritte rechts (bei y) */
  right: [Op, Op];
  /** gleiche Richtung (direkt) oder Gegenrichtung (indirekt) */
  same: boolean;
}

/**
 * Dreisatz „bekannte Menge x₀ → eine Einheit → gesuchte Menge x“.
 * Direkt: links und rechts dieselbe Rechenart („gleiche Richtung“).
 * Indirekt: rechts die Gegenrechnung („Gegenrichtung“).
 * Für das Taxi (nicht proportional) gibt es keinen Dreisatz: `null`.
 */
export function ruleOfThree(r: Relation, x0: number, x: number): RuleOfThree | null {
  if (r.kind === 'lin') return null;
  const rows: RuleOfThree['rows'] = [
    [x0, value(r, x0)],
    [1, value(r, 1)],
    [x, value(r, x)],
  ];
  const left: [Op, Op] = [
    { op: ':', f: x0 },
    { op: '·', f: x },
  ];
  if (r.kind === 'dir') return { rows, left, right: [{ op: ':', f: x0 }, { op: '·', f: x }], same: true };
  return { rows, left, right: [{ op: '·', f: x0 }, { op: ':', f: x }], same: false };
}

/** Einen Rechenschritt ausführen. */
export function applyOp(v: number, o: Op): number {
  return o.op === '·' ? v * o.f : v / o.f;
}

/**
 * Der (falsche) proportionale Schluss y₀ · x : x₀ – beim Taxi der typische
 * Fehler „doppelte Strecke, doppelter Preis“.
 */
export function naiveGuess(r: Relation, x0: number, x: number): number {
  return (value(r, x0) * x) / x0;
}

/* ------------------------------------------------------------------ */
/* Verdoppeln und Wertetabelle                                         */
/* ------------------------------------------------------------------ */

/**
 * Ausgangswert und Faktoren der Animation „Verdoppeln“: von u aus auf 2u
 * und – wenn es noch in den Bereich passt – auf 3u. Ist die bekannte Menge
 * x₀ zu groß zum Verdoppeln, wird von ihrer Hälfte aus gestartet.
 */
export function storyBase(kind: Kind, x0: number): { u: number; factors: number[] } {
  const xmax = X_MAX[kind];
  let u = clampX(kind, x0);
  if (2 * u > xmax) u = kind === 'ind' ? Math.max(1, Math.floor(u / 2)) : Math.max(0.5, Math.floor(u) / 2);
  const factors = [1, 2];
  if (3 * u <= xmax + 1e-9) factors.push(3);
  return { u, factors };
}

/**
 * Spalten der Wertetabelle: 1 (die Einheit), u, 2u und ggf. 3u aus der
 * Verdoppeln-Animation, bei Bedarf mit 2 bzw. 3 auf mindestens vier Spalten
 * aufgefüllt. Aufsteigend sortiert.
 */
export function tableXs(kind: Kind, x0: number): number[] {
  const { u, factors } = storyBase(kind, x0);
  const set = new Set<number>([1, ...factors.map((f) => f * u)]);
  for (const extra of [2, 3, 4]) if (set.size < 4) set.add(extra);
  return [...set].sort((a, b) => a - b);
}

/** Was passiert mit y, wenn x mit f multipliziert wird? */
export function scaleY(r: Relation, u: number, f: number): { y0: number; y1: number; fy: number } {
  const y0 = value(r, u);
  const y1 = value(r, f * u);
  return { y0, y1, fy: y1 / y0 };
}

/* ------------------------------------------------------------------ */
/* Test „Ist das proportional?“                                        */
/* ------------------------------------------------------------------ */

export type Verdict = 'dir' | 'ind' | 'none';

export interface Classification {
  verdict: Verdict;
  /** Proportionalitätsfaktor (dir) bzw. Produkt (ind); sonst null */
  k: number | null;
  quotients: number[];
  products: number[];
}

/**
 * Wertetabelle prüfen: Sind alle Quotienten y : x gleich, ist die Zuordnung
 * direkt proportional; sind alle Produkte x · y gleich, indirekt
 * proportional; sonst keines von beiden. (Beides zugleich ist bei mindestens
 * zwei verschiedenen x-Werten mit y ≠ 0 unmöglich.)
 */
export function classify(pairs: [number, number][], tol = 1e-9): Classification {
  const quotients = pairs.map(([x, y]) => y / x);
  const products = pairs.map(([x, y]) => x * y);
  const c = check(pairs, tol);
  if (c.quotient) return { verdict: 'dir', k: quotients[0]!, quotients, products };
  if (c.product) return { verdict: 'ind', k: products[0]!, quotients, products };
  return { verdict: 'none', k: null, quotients, products };
}

export type TabId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
export const TAB_IDS: TabId[] = ['a', 'b', 'c', 'd', 'e', 'f'];

/**
 * Wertetabellen für den Test (Texte zur Situation stehen in index.ts):
 * a Eintrittskarten (3 € pro Karte), b 24 Pizzastücke gerecht verteilt,
 * c ohne Sachzusammenhang (y = 2x + 3), d Taxi (3 € + 2 € pro km),
 * e Alter ↔ Körpergröße (ungefähre Durchschnittswerte), f 120 km Fahrt:
 * Geschwindigkeit ↔ Fahrzeit.
 */
export const TABLES: Record<TabId, [number, number][]> = {
  a: [
    [1, 3],
    [2, 6],
    [5, 15],
  ],
  b: [
    [2, 12],
    [3, 8],
    [6, 4],
  ],
  c: [
    [1, 5],
    [2, 7],
    [3, 9],
  ],
  d: [
    [2, 7],
    [5, 13],
    [10, 23],
  ],
  e: [
    [1, 75],
    [2, 87],
    [4, 103],
    [8, 128],
  ],
  f: [
    [40, 3],
    [60, 2],
    [80, 1.5],
    [120, 1],
  ],
};

/** Liegt v (bis auf Rundung) auf einer ganzen Zahl von Hundertsteln? */
export function isCents(v: number): boolean {
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
}
