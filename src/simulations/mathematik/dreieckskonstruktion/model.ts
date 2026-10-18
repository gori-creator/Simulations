/**
 * Rechenlogik „Kongruenzsätze und Dreieckskonstruktionen“ (Jahrgangsstufe 7).
 *
 * Bezeichnungen wie im Unterricht: Ecken A, B, C gegen den Uhrzeigersinn,
 * Seiten a = [BC], b = [CA], c = [AB] (jeweils der Ecke gegenüber), Winkel
 * α bei A, β bei B, γ bei C. Längen in cm, Winkel in Grad.
 *
 * Konstruiert wird immer von der Grundseite c = [AB] aus: A = (0 | 0),
 * B = (c | 0), C liegt oberhalb (y > 0).
 *
 * Kongruenzsätze: Ein Dreieck ist (bis auf Lage) eindeutig festgelegt durch
 * - SSS: drei Seiten (wenn die Dreiecksungleichung gilt),
 * - SWS: zwei Seiten und den eingeschlossenen Winkel,
 * - WSW: eine Seite und die beiden anliegenden Winkel (Summe < 180°),
 * - SsW: zwei Seiten und den Winkel, der der größeren Seite gegenüberliegt.
 * Liegt der Winkel der kleineren Seite gegenüber (SSW), gibt es keine, eine
 * oder zwei Lösungen. Drei Winkel (WWW) legen nur die Form fest, nicht die
 * Größe: ähnliche, aber nicht kongruente Dreiecke.
 */

export type Pt = readonly [number, number];
export type Case = 'sss' | 'sws' | 'wsw' | 'ssw' | 'www';

/** Gegebene Stücke (nicht alle werden in jedem Fall benutzt). */
export interface Given {
  a: number;
  b: number;
  c: number;
  al: number;
  be: number;
}

/**
 * Ergebnis einer Konstruktion:
 * - one: genau ein Dreieck (C),
 * - two: zwei verschiedene Dreiecke (C und C2, nur bei SSW),
 * - none: kein Dreieck (mit Grund),
 * - many: unendlich viele (WWW, nur die Form ist festgelegt).
 */
export type Solution =
  | { kind: 'one'; c: Pt }
  | { kind: 'two'; c: Pt; c2: Pt }
  | { kind: 'none'; reason: NoneReason }
  | { kind: 'many'; c: Pt };

export type NoneReason = 'triangle' | 'angles' | 'short' | 'touchA';

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const EPS = 1e-9;

export function dist(p: Pt, q: Pt): number {
  return Math.hypot(q[0] - p[0], q[1] - p[1]);
}

/** Punkt auf dem Strahl von A aus unter dem Winkel `deg` zur Grundseite. */
export function onRayA(len: number, angleDeg: number): Pt {
  return [len * Math.cos(rad(angleDeg)), len * Math.sin(rad(angleDeg))];
}

/** Punkt auf dem Strahl von B = (c | 0) aus, der mit [BA] den Winkel β einschließt. */
export function onRayB(c: number, len: number, betaDeg: number): Pt {
  return [c - len * Math.cos(rad(betaDeg)), len * Math.sin(rad(betaDeg))];
}

/** Dreiecksungleichung (streng): Jede Seite ist kürzer als die Summe der beiden anderen. */
export function triangleInequality(a: number, b: number, c: number): boolean {
  return a + b > c + EPS && a + c > b + EPS && b + c > a + EPS;
}

/** SSS: C aus |AC| = b und |BC| = a (Schnitt der Kreise um A und B). */
export function solveSSS(a: number, b: number, c: number): Solution {
  if (!triangleInequality(a, b, c)) return { kind: 'none', reason: 'triangle' };
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return { kind: 'one', c: [x, y] };
}

/** SWS: c, α und b; C liegt auf dem freien Schenkel von α im Abstand b von A. */
export function solveSWS(b: number, al: number): Solution {
  if (al <= 0 || al >= 180) return { kind: 'none', reason: 'angles' };
  return { kind: 'one', c: onRayA(b, al) };
}

/** WSW: c, α und β; C ist der Schnittpunkt der beiden freien Schenkel. */
export function solveWSW(c: number, al: number, be: number): Solution {
  if (al + be >= 180 - EPS) return { kind: 'none', reason: 'angles' };
  // Sinussatz: b / sin β = c / sin γ mit γ = 180° − α − β
  const b = (c * Math.sin(rad(be))) / Math.sin(rad(al + be));
  return { kind: 'one', c: onRayA(b, al) };
}

/**
 * Längen t > 0 auf dem Strahl von A (Winkel α), deren Punkt von B = (c | 0)
 * den Abstand a hat: t² − 2·c·cos α · t + c² − a² = 0.
 */
export function rayCircleParams(c: number, a: number, al: number): number[] {
  const p = c * Math.cos(rad(al));
  const disc = a * a - c * c * Math.sin(rad(al)) ** 2;
  if (disc < -EPS) return [];
  const r = Math.sqrt(Math.max(0, disc));
  if (r < 1e-7) return p > EPS ? [p] : [];
  return [p + r, p - r].filter((t) => t > 1e-7).sort((u, v) => v - u);
}

/**
 * SsW bzw. SSW: c, α und a (die Seite gegenüber von α). Der Kreis um B mit
 * Radius a schneidet den freien Schenkel von α in keinem, einem oder zwei
 * Punkten. Ist a ≥ c (größere Seite gegenüber), gibt es genau eine Lösung.
 */
export function solveSSW(c: number, a: number, al: number): Solution {
  if (al <= 0 || al >= 180) return { kind: 'none', reason: 'angles' };
  const ts = rayCircleParams(c, a, al);
  if (ts.length === 0) {
    // Kreis berührt den Strahl nur in A (a = c, α ≥ 90°) oder erreicht ihn gar nicht
    return { kind: 'none', reason: Math.abs(a - c) < 1e-7 ? 'touchA' : 'short' };
  }
  if (ts.length === 1) return { kind: 'one', c: onRayA(ts[0]!, al) };
  return { kind: 'two', c: onRayA(ts[0]!, al), c2: onRayA(ts[1]!, al) };
}

/** WWW: α und β (γ folgt); jede Grundseite liefert ein ähnliches Dreieck. */
export function solveWWW(c: number, al: number, be: number): Solution {
  const s = solveWSW(c, al, be);
  return s.kind === 'one' ? { kind: 'many', c: s.c } : s;
}

export function solve(cs: Case, g: Given): Solution {
  switch (cs) {
    case 'sss':
      return solveSSS(g.a, g.b, g.c);
    case 'sws':
      return solveSWS(g.b, g.al);
    case 'wsw':
      return solveWSW(g.c, g.al, g.be);
    case 'ssw':
      return solveSSW(g.c, g.a, g.al);
    case 'www':
      return solveWWW(g.c, g.al, g.be);
  }
}

/** Ist SSW hier der „sichere“ Fall SsW (gegebener Winkel liegt der größeren Seite gegenüber)? */
export function isSsW(a: number, c: number): boolean {
  return a >= c - EPS;
}

/** Innenwinkel bei p im Dreieck p, q, r (Grad). */
export function angleAt(p: Pt, q: Pt, r: Pt): number {
  const u = [q[0] - p[0], q[1] - p[1]];
  const v = [r[0] - p[0], r[1] - p[1]];
  const cosv = (u[0]! * v[0]! + u[1]! * v[1]!) / (Math.hypot(u[0]!, u[1]!) * Math.hypot(v[0]!, v[1]!));
  return deg(Math.acos(Math.max(-1, Math.min(1, cosv))));
}

/** Alle sechs Stücke des Dreiecks ABC mit A = (0 | 0), B = (c | 0). */
export function pieces(c: number, C: Pt): { a: number; b: number; c: number; al: number; be: number; ga: number } {
  const A: Pt = [0, 0];
  const B: Pt = [c, 0];
  return { a: dist(B, C), b: dist(A, C), c, al: angleAt(A, B, C), be: angleAt(B, C, A), ga: angleAt(C, A, B) };
}

/** Flächeninhalt (Grundseite c, Höhe = y-Koordinate von C). */
export function area(c: number, C: Pt): number {
  return 0.5 * c * Math.abs(C[1]);
}

/** Schnittpunkte zweier Kreise (0, 1 oder 2 Punkte), der obere zuerst. */
export function circleIntersections(c1: Pt, r1: number, c2: Pt, r2: number): Pt[] {
  const d = dist(c1, c2);
  if (d < 1e-12 || d > r1 + r2 + 1e-9 || d < Math.abs(r1 - r2) - 1e-9) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const ex = (c2[0] - c1[0]) / d;
  const ey = (c2[1] - c1[1]) / d;
  const px = c1[0] + a * ex;
  const py = c1[1] + a * ey;
  if (h < 1e-9) return [[px, py]];
  const s: Pt[] = [
    [px - h * ey, py + h * ex],
    [px + h * ey, py - h * ex],
  ];
  return s.sort((u, v) => v[1] - u[1]);
}
