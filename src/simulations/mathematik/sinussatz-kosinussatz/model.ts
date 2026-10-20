/**
 * Rechenlogik „Sinussatz und Kosinussatz“ (Jahrgangsstufe 10).
 *
 * Bezeichnungen wie im Unterricht: Dreieck ABC, Seite a = [BC] liegt der Ecke A
 * gegenüber, b = [CA] gegenüber B, c = [AB] gegenüber C; Winkel α bei A, β bei B,
 * γ bei C. Seite und Gegenwinkel gehören zusammen (a/α, b/β, c/γ).
 *
 *   Sinussatz:   a : sin α = b : sin β = c : sin γ = 2r   (r: Umkreisradius)
 *   Kosinussatz: c² = a² + b² − 2ab · cos γ   (für γ = 90° der Satz des Pythagoras)
 *   Flächeninhalt: A = ½ · a · b · sin γ
 *
 * Längen in cm (bzw. m in den Anwendungen), Winkel in Grad.
 */

export type Pt = readonly [number, number];
export type Tri = readonly [Pt, Pt, Pt];

export const DEG = Math.PI / 180;
const sinD = (w: number) => Math.sin(w * DEG);
const cosD = (w: number) => Math.cos(w * DEG);

export function dist(p: Pt, q: Pt): number {
  return Math.hypot(q[0] - p[0], q[1] - p[1]);
}

/** Seitenlängen [a, b, c] mit a = |BC|, b = |CA|, c = |AB|. */
export function sides(t: Tri): [number, number, number] {
  return [dist(t[1], t[2]), dist(t[2], t[0]), dist(t[0], t[1])];
}

/** Doppelter orientierter Flächeninhalt (positiv, wenn A, B, C gegen den Uhrzeigersinn liegen). */
export function area2(t: Tri): number {
  return (t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[1][1] - t[0][1]) * (t[2][0] - t[0][0]);
}

/** Kosinussatz umgestellt: Winkel gegenüber der Seite c aus den drei Seiten (Grad). */
export function angleFromSides(a: number, b: number, c: number): number {
  const v = (a * a + b * b - c * c) / (2 * a * b);
  return Math.acos(Math.max(-1, Math.min(1, v))) / DEG;
}

/** Innenwinkel [α, β, γ] in Grad (über den Kosinussatz). */
export function angles(t: Tri): [number, number, number] {
  const [a, b, c] = sides(t);
  return [angleFromSides(b, c, a), angleFromSides(c, a, b), angleFromSides(a, b, c)];
}

/** Kosinussatz: dritte Seite aus zwei Seiten und dem eingeschlossenen Winkel (Grad). */
export function lawOfCosines(a: number, b: number, gammaDeg: number): number {
  return Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * cosD(gammaDeg)));
}

/** Korrekturterm des Kosinussatzes 2ab · cos γ (negativ bei stumpfem γ). */
export function cosCorrection(a: number, b: number, gammaDeg: number): number {
  return 2 * a * b * cosD(gammaDeg);
}

/** Sinussatz: Seite gegenüber `oppDeg`, wenn die Seite `side` dem Winkel `sideDeg` gegenüberliegt. */
export function sineRuleSide(side: number, sideDeg: number, oppDeg: number): number {
  return (side * sinD(oppDeg)) / sinD(sideDeg);
}

/** Flächeninhalt aus zwei Seiten und dem eingeschlossenen Winkel: A = ½ · a · b · sin γ. */
export function areaSAS(a: number, b: number, gammaDeg: number): number {
  return 0.5 * a * b * sinD(gammaDeg);
}

/** Umkreisradius r = abc : (4 · Flächeninhalt). */
export function circumradius(t: Tri): number {
  const [a, b, c] = sides(t);
  return (a * b * c) / (2 * Math.abs(area2(t)));
}

/** Umkreismittelpunkt (Schnittpunkt der Mittelsenkrechten). */
export function circumcenter(t: Tri): Pt {
  const [A, B, C] = t;
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  const s = (p: Pt) => p[0] * p[0] + p[1] * p[1];
  return [(s(A) * (B[1] - C[1]) + s(B) * (C[1] - A[1]) + s(C) * (A[1] - B[1])) / d, (s(A) * (C[0] - B[0]) + s(B) * (A[0] - C[0]) + s(C) * (B[0] - A[0])) / d];
}

/** Sinussatz: die drei Quotienten a : sin α, b : sin β, c : sin γ. */
export function sineQuotients(t: Tri): [number, number, number] {
  const s = sides(t);
  const w = angles(t);
  return [s[0] / sinD(w[0]), s[1] / sinD(w[1]), s[2] / sinD(w[2])];
}

/** Lotfußpunkt von p auf die Gerade durch q und r und der Parameter (0 = q, 1 = r). */
export function foot(p: Pt, q: Pt, r: Pt): { at: Pt; t: number } {
  const dx = r[0] - q[0];
  const dy = r[1] - q[1];
  const t = ((p[0] - q[0]) * dx + (p[1] - q[1]) * dy) / (dx * dx + dy * dy);
  return { at: [q[0] + t * dx, q[1] + t * dy], t };
}

/** Kleinster Innenwinkel (Grad) – zum Erkennen zu flacher Dreiecke. */
export function minAngle(t: Tri): number {
  return Math.min(...angles(t));
}

/** Zu flach zum sinnvollen Rechnen und Zeichnen (fast auf einer Geraden). */
export function isFlat(t: Tri): boolean {
  return Math.abs(area2(t)) < 0.6 || minAngle(t) < 5;
}

/**
 * Beweisidee Sinussatz: Höhe h_c von C auf die Gerade AB.
 * Im Teildreieck mit A gilt h_c = b · sin α, im Teildreieck mit B gilt h_c = a · sin β
 * (bei stumpfem α oder β liegt der Fußpunkt außerhalb von [AB]; dann hilft sin(180° − α) = sin α).
 */
export function sineProof(t: Tri): { foot: Pt; t: number; hc: number; viaB: number; viaA: number } {
  const f = foot(t[2], t[0], t[1]);
  const [a, b] = sides(t);
  const [al, be] = angles(t);
  return { foot: f.at, t: f.t, hc: dist(t[2], f.at), viaB: b * sinD(al), viaA: a * sinD(be) };
}

/* ------------------------------------------------------------------ */
/* Kosinussatz als Flächen: Quadrate an den Seiten                     */
/* ------------------------------------------------------------------ */

/** Viereck mit Ecken und vorzeichenbehaftetem Flächeninhalt (negativ: liegt außerhalb des Quadrats). */
export interface Quad {
  pts: [Pt, Pt, Pt, Pt];
  area: number;
}

const add = (p: Pt, v: Pt, k = 1): Pt => [p[0] + v[0] * k, p[1] + v[1] * k];
const unit = (p: Pt, q: Pt): Pt => {
  const l = dist(p, q) || 1;
  return [(q[0] - p[0]) / l, (q[1] - p[1]) / l];
};
/** Einheitsnormale zu PQ, die von `away` weg zeigt. */
function outward(P: Pt, Q: Pt, away: Pt): Pt {
  const u = unit(P, Q);
  let n: Pt = [-u[1], u[0]];
  const m: Pt = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
  if (n[0] * (away[0] - m[0]) + n[1] * (away[1] - m[1]) > 0) n = [-n[0], -n[1]];
  return n;
}

/** Quadrat über der Strecke PQ, nach außen (von `away` weg). Ecken: P, Q, Q + n·s, P + n·s. */
export function squareOn(P: Pt, Q: Pt, away: Pt): [Pt, Pt, Pt, Pt] {
  const s = dist(P, Q);
  const n = outward(P, Q, away);
  return [P, Q, add(Q, n, s), add(P, n, s)];
}

/**
 * Streifen im Quadrat über PQ: beginnt bei P, reicht `w` (vorzeichenbehaftet) in Richtung Q
 * und ist so tief wie das Quadrat. Negatives `w`: Streifen liegt jenseits von P (außerhalb).
 */
function strip(P: Pt, Q: Pt, away: Pt, w: number): Quad {
  const s = dist(P, Q);
  const u = unit(P, Q);
  const n = outward(P, Q, away);
  const P2 = add(P, u, w);
  return { pts: [P, P2, add(P2, n, s), add(P, n, s)], area: w * s };
}

/**
 * Kosinussatz als Flächenbild (Euklid, Elemente II.12/13, verallgemeinert):
 * Die Höhen teilen die Quadrate über den Seiten in Rechtecke.
 * - Im Quadrat über a liegt bei C das Rechteck a · (b · cos γ) = ab · cos γ (`corrA`),
 *   der Rest `restA` hat den Inhalt a² − ab · cos γ = ac · cos β.
 * - Im Quadrat über b liegt bei C ebenso ab · cos γ (`corrB`), Rest b² − ab · cos γ = bc · cos α.
 * - Das Quadrat über c zerfällt (Höhe h_c) in bc · cos α (bei A) und ac · cos β (bei B).
 * Also c² = (a² − ab · cos γ) + (b² − ab · cos γ) = a² + b² − 2ab · cos γ.
 * Bei stumpfem γ ist cos γ < 0: Die beiden Rechtecke bei C liegen außerhalb der Quadrate und
 * kommen dazu. `splitC` ist null, wenn α oder β stumpf ist (Fußpunkt von h_c außerhalb von [AB]).
 */
export function cosineFigure(t: Tri): {
  sq: [[Pt, Pt, Pt, Pt], [Pt, Pt, Pt, Pt], [Pt, Pt, Pt, Pt]];
  corrA: Quad;
  corrB: Quad;
  restA: Quad;
  restB: Quad;
  splitC: [Quad, Quad] | null;
} {
  const [A, B, C] = t;
  const [a, b] = sides(t);
  const [al, be, ga] = angles(t);
  const dA = b * cosD(ga); // Abstand C → Fußpunkt der Höhe h_a auf BC
  const dB = a * cosD(ga); // Abstand C → Fußpunkt der Höhe h_b auf CA
  const corrA = strip(C, B, A, dA);
  const corrB = strip(C, A, B, dB);
  const restA = strip(B, C, A, a - dA);
  const restB = strip(A, C, B, b - dB);
  const splitC: [Quad, Quad] | null = al < 90 && be < 90 ? [strip(A, B, C, b * cosD(al)), strip(B, A, C, a * cosD(be))] : null;
  return { sq: [squareOn(B, C, A), squareOn(C, A, B), squareOn(A, B, C)], corrA, corrB, restA, restB, splitC };
}

/** Flächeninhalt eines Vielecks (Gaußsche Trapezformel, ohne Vorzeichen). */
export function polygonArea(pts: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % pts.length]!;
    s += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(s) / 2;
}

/**
 * Ecke B, wenn C und die Richtung C → A fest bleiben, |CB| = a und der Winkel bei C γ ist.
 * `orient` = +1 / −1: auf welcher Seite von CA die Ecke B liegt (wie im Ausgangsdreieck).
 */
export function placeB(C: Pt, A: Pt, a: number, gammaDeg: number, orient: number): Pt {
  const u = unit(C, A);
  const w = -orient * gammaDeg * DEG;
  return [C[0] + a * (u[0] * Math.cos(w) - u[1] * Math.sin(w)), C[1] + a * (u[0] * Math.sin(w) + u[1] * Math.cos(w))];
}

/* ------------------------------------------------------------------ */
/* Löser: Welcher Satz passt?                                          */
/* ------------------------------------------------------------------ */

/**
 * Gegebene Stücke:
 * - sss: drei Seiten a, b, c → Kosinussatz (umgestellt nach dem Winkel)
 * - sws: a, b und der eingeschlossene Winkel γ → Kosinussatz
 * - wsw: c und die beiden anliegenden Winkel α, β → Winkelsumme, dann Sinussatz
 * - ssw: a, c und der Winkel α, der a gegenüberliegt → Sinussatz (0, 1 oder 2 Lösungen)
 */
export type Case = 'sss' | 'sws' | 'wsw' | 'ssw';
export const CASES: Case[] = ['sss', 'sws', 'wsw', 'ssw'];

export interface Given {
  a: number;
  b: number;
  c: number;
  al: number;
  be: number;
  ga: number;
}

/** Ein vollständig berechnetes Dreieck. */
export interface Solved {
  a: number;
  b: number;
  c: number;
  al: number;
  be: number;
  ga: number;
}

/**
 * Gründe für „kein Dreieck“:
 * - triangle: Dreiecksungleichung verletzt (SSS),
 * - angles: α + β ≥ 180° (WSW),
 * - short: SSW, a ist kürzer als der Abstand von B zum freien Schenkel (sin γ > 1),
 * - obtuse: SSW mit stumpfem (oder rechtem) α, aber a ≤ c.
 */
export type NoneReason = 'triangle' | 'angles' | 'short' | 'obtuse';
export type SolveResult = { kind: 'ok'; tris: Solved[]; sinG?: number } | { kind: 'none'; reason: NoneReason; sinG?: number };

/** Welcher Satz zuerst? */
export const lawFor = (k: Case): 'cos' | 'sin' => (k === 'sss' || k === 'sws' ? 'cos' : 'sin');

const EPS = 1e-9;

export function solve(k: Case, g: Given): SolveResult {
  if (k === 'sss') {
    const { a, b, c } = g;
    if (a + b <= c + EPS || b + c <= a + EPS || c + a <= b + EPS) return { kind: 'none', reason: 'triangle' };
    const ga = angleFromSides(a, b, c);
    const al = angleFromSides(b, c, a);
    return { kind: 'ok', tris: [{ a, b, c, al, be: 180 - al - ga, ga }] };
  }
  if (k === 'sws') {
    const { a, b, ga } = g;
    const c = lawOfCosines(a, b, ga);
    const al = angleFromSides(b, c, a);
    return { kind: 'ok', tris: [{ a, b, c, al, be: 180 - al - ga, ga }] };
  }
  if (k === 'wsw') {
    const { c, al, be } = g;
    if (al + be >= 180 - EPS) return { kind: 'none', reason: 'angles' };
    const ga = 180 - al - be;
    return { kind: 'ok', tris: [{ a: sineRuleSide(c, ga, al), b: sineRuleSide(c, ga, be), c, al, be, ga }] };
  }
  // ssw: a, c, α (α liegt a gegenüber); Sinussatz: sin γ = c · sin α : a
  const { a, c, al } = g;
  const sinG = (c * sinD(al)) / a;
  const make = (ga: number): Solved => {
    const be = 180 - al - ga;
    return { a, b: sineRuleSide(a, al, be), c, al, be, ga };
  };
  if (al >= 90 - EPS) {
    if (a <= c + EPS) return { kind: 'none', reason: 'obtuse', sinG };
    return { kind: 'ok', tris: [make(Math.asin(sinG) / DEG)], sinG };
  }
  if (sinG > 1 + EPS) return { kind: 'none', reason: 'short', sinG };
  if (sinG >= 1 - EPS) return { kind: 'ok', tris: [make(90)], sinG: 1 };
  const g1 = Math.asin(sinG) / DEG;
  if (a >= c - EPS) return { kind: 'ok', tris: [make(g1)], sinG };
  return { kind: 'ok', tris: [make(g1), make(180 - g1)], sinG };
}

/** Lage zum Zeichnen: A = (0 | 0), B = (c | 0), C oberhalb von AB. */
export function placeSolved(s: Solved): Tri {
  return [
    [0, 0],
    [s.c, 0],
    [s.b * cosD(s.al), s.b * sinD(s.al)],
  ];
}

/* ------------------------------------------------------------------ */
/* Anwendungen                                                          */
/* ------------------------------------------------------------------ */

/**
 * Vermessung über einen Fluss (WSW): Standlinie [AB] der Länge s am Ufer, in A und B werden
 * die Winkel α und β zum Baum T am anderen Ufer gepeilt. Winkelsumme: τ = 180° − α − β.
 * Sinussatz: |AT| = s · sin β : sin τ, |BT| = s · sin α : sin τ.
 * Flussbreite (Abstand von T zur Standlinie): |AT| · sin α.
 */
export function survey(s: number, alDeg: number, beDeg: number): { tau: number; at: number; bt: number; width: number; along: number } {
  const tau = 180 - alDeg - beDeg;
  const at = sineRuleSide(s, tau, beDeg);
  const bt = sineRuleSide(s, tau, alDeg);
  return { tau, at, bt, width: at * sinD(alDeg), along: at * cosD(alDeg) };
}

/**
 * Entfernung über einen See (SWS): Von C aus misst man |CA| = b und |CB| = a sowie den Winkel γ
 * zwischen beiden Richtungen. Kosinussatz: |AB| = √(a² + b² − 2ab · cos γ).
 */
export function lakeDistance(a: number, b: number, gammaDeg: number): number {
  return lawOfCosines(a, b, gammaDeg);
}

/* ------------------------------------------------------------------ */
/* Zufallsdreieck                                                       */
/* ------------------------------------------------------------------ */

/** Gut ablesbares Zufallsdreieck im Bereich 0…12 × 0…8 (Koordinaten auf 0,1 gerundet). */
export function randomTriangle(rnd: () => number): Tri {
  const r1 = (lo: number, hi: number) => Math.round((lo + rnd() * (hi - lo)) * 10) / 10;
  let best: Tri = [
    [1, 1],
    [10, 1],
    [4, 6],
  ];
  for (let n = 0; n < 300; n++) {
    const t: Tri = [
      [r1(0.5, 4.5), r1(0.5, 3.5)],
      [r1(7, 11.5), r1(0.5, 3.5)],
      [r1(1, 11), r1(4.5, 7.5)],
    ];
    if (minAngle(t) >= 25 && Math.abs(area2(t)) > 20) return t;
    best = t;
  }
  return best;
}
