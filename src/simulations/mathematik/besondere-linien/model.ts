/**
 * Rechenlogik „Umkreis, Inkreis und besondere Linien im Dreieck“ (Jgst. 7/8).
 *
 * Längen in cm, Punkte als (x | y), y nach oben. Bezeichnungen wie im
 * Unterricht: Ecken A, B, C; Seite a = [BC] gegenüber von A, b = [CA], c = [AB];
 * Winkel α bei A, β bei B, γ bei C.
 *
 * - Mittelsenkrechten m_a, m_b, m_c schneiden sich im Umkreismittelpunkt U
 *   (gleich weit von den Ecken entfernt, Radius r = |UA|).
 * - Winkelhalbierende w_α, w_β, w_γ schneiden sich im Inkreismittelpunkt W
 *   (im Englischen meist I; gleich weit von den Seiten entfernt, Radius ρ).
 * - Seitenhalbierende s_a, s_b, s_c schneiden sich im Schwerpunkt S; er teilt
 *   jede Seitenhalbierende im Verhältnis 2 : 1 (von der Ecke aus).
 * - Höhen h_a, h_b, h_c (bzw. ihre Verlängerungen) schneiden sich im
 *   Höhenschnittpunkt H.
 * - Euler-Gerade: U, S und H liegen auf einer Geraden, |HS| = 2·|SU|
 *   (gleichwertig: H = 3S − 2U = A + B + C − 2U).
 *
 * Die Konstruktionshilfen (Schnittpunkte der Zirkelbögen, Seitenmitten,
 * Lotfußpunkte) stehen ebenfalls hier, damit Zeichnung und Rechnung dieselben
 * Punkte benutzen.
 */

export type Pt = readonly [number, number];
export type Tri = readonly [Pt, Pt, Pt];
export type Idx = 0 | 1 | 2;
export type Kind = 'spitz' | 'recht' | 'stumpf';
export type Where = 'innen' | 'rand' | 'ecke' | 'aussen';

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const dot = (u: Pt, v: Pt) => u[0] * v[0] + u[1] * v[1];
const cross = (u: Pt, v: Pt) => u[0] * v[1] - u[1] * v[0];
/** Die beiden anderen Ecken (in zyklischer Reihenfolge) zur Ecke i. */
export const others = (i: Idx): [Idx, Idx] => [((i + 1) % 3) as Idx, ((i + 2) % 3) as Idx];

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}
export function mid(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Doppelter orientierter Flächeninhalt (> 0: Ecken gegen den Uhrzeigersinn). */
export function area2(t: Tri): number {
  return cross(sub(t[1], t[0]), sub(t[2], t[0]));
}
/** Flächeninhalt A. */
export function area(t: Tri): number {
  return Math.abs(area2(t)) / 2;
}
/** Entartet (Ecken auf einer Geraden oder fast)? */
export function degenerate(t: Tri, eps = 1e-6): boolean {
  return Math.abs(area2(t)) < eps;
}

/** Seitenlängen a = |BC|, b = |CA|, c = |AB|. */
export function sides(t: Tri): [number, number, number] {
  return [dist(t[1], t[2]), dist(t[2], t[0]), dist(t[0], t[1])];
}
/** Umfang u = a + b + c. */
export function perimeter(t: Tri): number {
  const [a, b, c] = sides(t);
  return a + b + c;
}

/** Innenwinkel bei A, B, C in Grad. */
export function angles(t: Tri): [number, number, number] {
  const at = (p: Pt, q: Pt, r: Pt) => {
    const u = sub(q, p);
    const v = sub(r, p);
    return (Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (Math.hypot(...u) * Math.hypot(...v))))) * 180) / Math.PI;
  };
  return [at(t[0], t[1], t[2]), at(t[1], t[2], t[0]), at(t[2], t[0], t[1])];
}

/** Lotfußpunkt von p auf die Gerade durch a und b. */
export function foot(p: Pt, a: Pt, b: Pt): Pt {
  const d = sub(b, a);
  const k = dot(sub(p, a), d) / dot(d, d);
  return [a[0] + k * d[0], a[1] + k * d[1]];
}
/** Abstand von p zur Geraden durch a und b. */
export function distToLine(p: Pt, a: Pt, b: Pt): number {
  return Math.abs(cross(sub(b, a), sub(p, a))) / dist(a, b);
}
/** Lage des Lotfußpunkts f auf der Geraden ab als Anteil: 0 bei a, 1 bei b. */
export function param(f: Pt, a: Pt, b: Pt): number {
  const d = sub(b, a);
  return dot(sub(f, a), d) / dot(d, d);
}
/** Liegt der Punkt f (auf der Geraden ab) auf der Strecke [ab] und nicht auf der Verlängerung? */
export function onSegment(f: Pt, a: Pt, b: Pt, eps = 1e-9): boolean {
  const k = param(f, a, b);
  return k >= -eps && k <= 1 + eps;
}

/* ------------------------------------------------------------------ */
/* Die vier besonderen Punkte                                          */
/* ------------------------------------------------------------------ */

/** Umkreismittelpunkt U (Schnitt der Mittelsenkrechten); null bei entartetem Dreieck. */
export function circumcenter(t: Tri): Pt | null {
  const [a, b, c] = t;
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a[0] ** 2 + a[1] ** 2;
  const b2 = b[0] ** 2 + b[1] ** 2;
  const c2 = c[0] ** 2 + c[1] ** 2;
  return [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d];
}
/** Umkreisradius r = |UA| (Formel r = a·b·c / (4·A)). */
export function circumradius(t: Tri): number {
  const [a, b, c] = sides(t);
  return (a * b * c) / (4 * area(t));
}

/** Inkreismittelpunkt W: mit den Gegenseiten gewichtetes Mittel der Ecken, W = (a·A + b·B + c·C) / (a + b + c). */
export function incenter(t: Tri): Pt {
  const [a, b, c] = sides(t);
  const s = a + b + c;
  return [(a * t[0][0] + b * t[1][0] + c * t[2][0]) / s, (a * t[0][1] + b * t[1][1] + c * t[2][1]) / s];
}
/** Inkreisradius ρ = A : s mit dem halben Umfang s = (a + b + c) : 2. */
export function inradius(t: Tri): number {
  return (2 * area(t)) / perimeter(t);
}

/** Schwerpunkt S = ((x_A + x_B + x_C) : 3 | (y_A + y_B + y_C) : 3). */
export function centroid(t: Tri): Pt {
  return [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
}

/** Höhenschnittpunkt H. Es gilt H = A + B + C − 2·U (Euler). */
export function orthocenter(t: Tri): Pt | null {
  const u = circumcenter(t);
  if (!u) return null;
  return [t[0][0] + t[1][0] + t[2][0] - 2 * u[0], t[0][1] + t[1][1] + t[2][1] - 2 * u[1]];
}

/* ------------------------------------------------------------------ */
/* Linien und ihre Hilfspunkte                                          */
/* ------------------------------------------------------------------ */

/** Seitenmittelpunkte M_a (von [BC]), M_b (von [CA]), M_c (von [AB]). */
export function midpoints(t: Tri): [Pt, Pt, Pt] {
  return [mid(t[1], t[2]), mid(t[2], t[0]), mid(t[0], t[1])];
}

/** Höhenfußpunkte H_a (auf der Geraden BC), H_b, H_c. */
export function altitudeFeet(t: Tri): [Pt, Pt, Pt] {
  return [foot(t[0], t[1], t[2]), foot(t[1], t[2], t[0]), foot(t[2], t[0], t[1])];
}
/** Höhen h_a = 2A : a, h_b = 2A : b, h_c = 2A : c. */
export function altitudes(t: Tri): [number, number, number] {
  const A2 = 2 * area(t);
  const [a, b, c] = sides(t);
  return [A2 / a, A2 / b, A2 / c];
}

/** Berührpunkte des Inkreises auf a, b, c (Lotfußpunkte von W). */
export function touchPoints(t: Tri): [Pt, Pt, Pt] {
  const i = incenter(t);
  return [foot(i, t[1], t[2]), foot(i, t[2], t[0]), foot(i, t[0], t[1])];
}

/** Schnittpunkt der Winkelhalbierenden von Ecke i mit der Gegenseite. */
export function bisectorFoot(t: Tri, i: Idx): Pt {
  const p = t[i];
  const [j, k] = others(i);
  const q = t[j];
  const r = t[k];
  // teilt die Gegenseite im Verhältnis der anliegenden Seiten
  const dq = dist(p, q);
  const dr = dist(p, r);
  const s = dq / (dq + dr);
  return [q[0] + (r[0] - q[0]) * s, q[1] + (r[1] - q[1]) * s];
}

/** Seitenhalbierende: Länge s_a = |A M_a| usw. */
export function medians(t: Tri): [number, number, number] {
  const m = midpoints(t);
  return [dist(t[0], m[0]), dist(t[1], m[1]), dist(t[2], m[2])];
}
/** Teilstücke der Seitenhalbierenden: [|Ecke S|, |S M|] für i = A, B, C. */
export function medianParts(t: Tri): [[number, number], [number, number], [number, number]] {
  const s = centroid(t);
  const m = midpoints(t);
  return [0, 1, 2].map((i) => [dist(t[i]!, s), dist(s, m[i]!)] as [number, number]) as [[number, number], [number, number], [number, number]];
}

/**
 * Konstruktion der Mittelsenkrechten von [PQ] mit dem Zirkel: Kreisbögen mit
 * demselben Radius r = k·|PQ| (k > 1/2) um P und Q schneiden sich in S₁ und S₂.
 * S₁ liegt links von P→Q (gegen den Uhrzeigersinn gedreht), S₂ rechts.
 */
export function bisectorArcs(P: Pt, Q: Pt, k = 0.72): { r: number; s1: Pt; s2: Pt } {
  const d = dist(P, Q);
  const r = Math.max(k, 0.5 + 1e-6) * d;
  const m = mid(P, Q);
  const h = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2));
  const n: Pt = [-(Q[1] - P[1]) / d, (Q[0] - P[0]) / d];
  return { r, s1: [m[0] + n[0] * h, m[1] + n[1] * h], s2: [m[0] - n[0] * h, m[1] - n[1] * h] };
}

/**
 * Konstruktion der Winkelhalbierenden bei Ecke i: Bogen um die Ecke mit Radius
 * r schneidet die Schenkel in P₁ (Richtung nächste Ecke) und P₂ (übernächste).
 * Bögen mit demselben Radius um P₁ und P₂ schneiden sich in K: Ecke, P₁, K, P₂
 * bilden eine Raute, also K = P₁ + P₂ − Ecke.
 */
export function angleBisectorArcs(t: Tri, i: Idx, r: number): { p1: Pt; p2: Pt; k: Pt } {
  const v = t[i];
  const [j, l] = others(i);
  const u1 = sub(t[j], v);
  const u2 = sub(t[l], v);
  const l1 = Math.hypot(...u1);
  const l2 = Math.hypot(...u2);
  const p1: Pt = [v[0] + (u1[0] / l1) * r, v[1] + (u1[1] / l1) * r];
  const p2: Pt = [v[0] + (u2[0] / l2) * r, v[1] + (u2[1] / l2) * r];
  return { p1, p2, k: [p1[0] + p2[0] - v[0], p1[1] + p2[1] - v[1]] };
}

/* ------------------------------------------------------------------ */
/* Einordnung und Sonderfälle                                           */
/* ------------------------------------------------------------------ */

/** Dreiecksart nach dem größten Winkel (Toleranz in Grad). */
export function kind(t: Tri, tolDeg = 1e-6): Kind {
  const m = Math.max(...angles(t));
  if (Math.abs(m - 90) <= tolDeg) return 'recht';
  return m > 90 ? 'stumpf' : 'spitz';
}
/** Ecke mit dem größten Winkel (beim rechtwinkligen Dreieck die mit dem rechten Winkel). */
export function largestAngle(t: Tri): Idx {
  const w = angles(t);
  return (w[0] >= w[1] && w[0] >= w[2] ? 0 : w[1] >= w[2] ? 1 : 2) as Idx;
}

/** Gleichseitig (alle Seiten gleich, relative Toleranz)? */
export function isEquilateral(t: Tri, tol = 1e-9): boolean {
  const [a, b, c] = sides(t);
  const m = Math.max(a, b, c);
  return m - Math.min(a, b, c) <= tol * m;
}
/**
 * Gleichschenklig: Index der Spitze (Ecke zwischen den beiden gleich langen
 * Seiten) oder null. Bei gleichseitigen Dreiecken ebenfalls null.
 */
export function isoscelesApex(t: Tri, tol = 1e-9): Idx | null {
  if (isEquilateral(t, tol)) return null;
  const [a, b, c] = sides(t);
  const m = Math.max(a, b, c);
  if (Math.abs(b - c) <= tol * m) return 0;
  if (Math.abs(c - a) <= tol * m) return 1;
  if (Math.abs(a - b) <= tol * m) return 2;
  return null;
}

/** Liegt p im Dreieck (Rand eingeschlossen)? */
export function inside(t: Tri, p: Pt, eps = 1e-9): boolean {
  const s = Math.sign(area2(t));
  for (let i = 0; i < 3; i++) {
    const a = t[i]!;
    const b = t[(i + 1) % 3]!;
    if ((s * cross(sub(b, a), sub(p, a))) / dist(a, b) < -eps) return false;
  }
  return true;
}
/** Wo liegt p? innen, auf dem Rand (einer Seite), in einer Ecke oder außen (Toleranz in cm). */
export function whereIs(t: Tri, p: Pt, eps = 1e-6): Where {
  if (t.some((v) => dist(v, p) <= eps)) return 'ecke';
  if (!inside(t, p, eps)) return 'aussen';
  for (let i = 0; i < 3; i++) {
    const a = t[i]!;
    const b = t[(i + 1) % 3]!;
    if (distToLine(p, a, b) <= eps) return 'rand';
  }
  return 'innen';
}

/** Euler-Gerade: Abstände |HS| und |SU| (|HS| = 2·|SU|) und |HU|. */
export function euler(t: Tri): { u: Pt; s: Pt; h: Pt; hs: number; su: number; hu: number } | null {
  const u = circumcenter(t);
  const h = orthocenter(t);
  if (!u || !h) return null;
  const s = centroid(t);
  return { u, s, h, hs: dist(h, s), su: dist(s, u), hu: dist(h, u) };
}

/**
 * Pappdreieck auf einer Nadelspitze: Hebelarm vom Auflagepunkt zum Schwerpunkt.
 * Ist er (fast) 0, bleibt das Dreieck liegen; sonst kippt es in Richtung S.
 */
export function tipping(t: Tri, pin: Pt, eps = 1e-6): { arm: number; dir: Pt; balanced: boolean } {
  const s = centroid(t);
  const d = sub(s, pin);
  const arm = Math.hypot(...d);
  return { arm, dir: arm > 0 ? [d[0] / arm, d[1] / arm] : [0, 0], balanced: arm <= eps };
}
