/**
 * Rechenlogik zur Hyperbel f(x) = a / (x − b) + c (ohne Zeichnen).
 *
 * - a: Streckfaktor (a < 0: zusätzlich an der waagrechten Asymptote gespiegelt)
 * - b: Verschiebung in x-Richtung → senkrechte Asymptote x = b (Polstelle)
 * - c: Verschiebung in y-Richtung → waagrechte Asymptote y = c
 *
 * Für a = 0 ist f keine Hyperbel, sondern die konstante Funktion y = c
 * (mit Definitionslücke bei x = b).
 */

export interface Hyperbola {
  a: number;
  b: number;
  c: number;
}

/** Funktionswert f(x) = a / (x − b) + c; an der Definitionslücke x = b: NaN. */
export function valueAt(h: Hyperbola, x: number): number {
  const u = x - h.b;
  if (u === 0) return NaN;
  return h.a / u + h.c;
}

/** Ist der Graph eine Hyperbel (a ≠ 0)? */
export function isHyperbola(h: Hyperbola): boolean {
  return h.a !== 0;
}

/** Senkrechte Asymptote x = b und waagrechte Asymptote y = c (nur für a ≠ 0 echte Asymptoten). */
export function asymptotes(h: Hyperbola): { vertical: number; horizontal: number } {
  return { vertical: h.b, horizontal: h.c };
}

/**
 * Nullstelle: a / (x − b) + c = 0 ⇔ x − b = −a / c ⇔ x = b − a / c.
 * Keine Nullstelle, wenn c = 0 (die x-Achse ist dann Asymptote) oder a = 0.
 */
export function zero(h: Hyperbola): number | null {
  if (h.a === 0 || h.c === 0) return null;
  return h.b - h.a / h.c;
}

/** Schnittpunkt mit der y-Achse: f(0) = c − a / b; keiner, wenn b = 0 (y-Achse ist Asymptote). */
export function yIntercept(h: Hyperbola): number | null {
  if (h.b === 0) return null;
  return h.c - h.a / h.b;
}

/**
 * Quadranten, in denen die Äste liegen – bezogen auf das Achsenkreuz der
 * Asymptoten (Schnittpunkt Z(b | c)): a > 0 → I und III, a < 0 → II und IV.
 */
export function quadrants(a: number): [number, number] | null {
  if (a > 0) return [1, 3];
  if (a < 0) return [2, 4];
  return null;
}

/** Monotonie auf jedem der beiden Teilintervalle ]−∞; b[ und ]b; ∞[. */
export function monotony(a: number): 'decreasing' | 'increasing' | 'constant' {
  if (a > 0) return 'decreasing';
  if (a < 0) return 'increasing';
  return 'constant';
}

/**
 * Rechteck zwischen dem Asymptotenkreuz Z(b | c) und dem Kurvenpunkt
 * P(b + u | f(b + u)): Seiten u und a/u (mit Vorzeichen), das Produkt ist
 * immer a – das ist die indirekte Proportionalität (x − b) · (y − c) = a.
 */
export function rectangle(h: Hyperbola, u: number): { width: number; height: number; product: number; area: number } {
  const height = u === 0 ? NaN : h.a / u;
  return { width: u, height, product: u * height, area: Math.abs(u * height) };
}

/** Scheitelpunkte (die Punkte der Äste, die Z am nächsten liegen): u = ±√|a|. */
export function vertices(h: Hyperbola): [number, number][] {
  if (h.a === 0) return [];
  const s = Math.sqrt(Math.abs(h.a));
  return [
    [h.b + s, h.c + h.a / s],
    [h.b - s, h.c - h.a / s],
  ];
}

export type ApproachKind = 'inf' | 'pole';

export interface ApproachRow {
  /** Abstand der Stelle von der Polstelle (x − b, mit Vorzeichen) */
  u: number;
  x: number;
  y: number;
  /** Abstand des Kurvenpunkts von der Asymptote, der er sich nähert */
  dist: number;
}

/** Abstände x − b der Wertetabelle (Zehnerpotenzen). */
export const APPROACH_STEPS: Record<ApproachKind, number[]> = {
  inf: [1, 10, 100, 1000],
  pole: [1, 0.1, 0.01, 0.001],
};

/**
 * Wertetabelle zur Annäherung an eine Asymptote.
 * - `inf`: x → ±∞; der Abstand zur waagrechten Asymptote y = c ist |a| / |x − b| → 0.
 * - `pole`: x → b; der Abstand zur senkrechten Asymptote x = b ist |x − b| → 0,
 *   dabei wird |f(x) − c| = |a| / |x − b| beliebig groß.
 * `side` = +1: rechter Ast (x > b), −1: linker Ast (x < b).
 */
export function approachTable(h: Hyperbola, kind: ApproachKind, side: 1 | -1): ApproachRow[] {
  return APPROACH_STEPS[kind].map((d) => {
    const u = side * d;
    const y = valueAt(h, h.b + u);
    return { u, x: h.b + u, y, dist: kind === 'inf' ? Math.abs(y - h.c) : Math.abs(u) };
  });
}

/** Abstand eines Kurvenpunkts (x − b = u) zur Asymptote, der er sich nähert. */
export function distanceTo(h: Hyperbola, kind: ApproachKind, u: number): number {
  return kind === 'inf' ? Math.abs(h.a / u) : Math.abs(u);
}
