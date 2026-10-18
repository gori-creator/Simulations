/**
 * Rechenlogik „Umkreis, Inkreis und besondere Linien im Dreieck“ (Jgst. 7/8).
 *
 * Längen in cm, Punkte als (x | y), y nach oben. Bezeichnungen wie im
 * Unterricht: Seite a = [BC] gegenüber von A usw.
 *
 * - Mittelsenkrechten schneiden sich im Umkreismittelpunkt U (gleich weit von
 *   den Ecken entfernt).
 * - Winkelhalbierende schneiden sich im Inkreismittelpunkt I (gleich weit von
 *   den Seiten entfernt).
 * - Seitenhalbierende schneiden sich im Schwerpunkt S; er teilt jede
 *   Seitenhalbierende im Verhältnis 2 : 1 (von der Ecke aus).
 * - Höhen (bzw. ihre Verlängerungen) schneiden sich im Höhenschnittpunkt H.
 * - Euler-Gerade: U, S und H liegen auf einer Geraden, |HS| = 2·|SU|.
 */

export type Pt = readonly [number, number];
export type Tri = readonly [Pt, Pt, Pt];

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const dot = (u: Pt, v: Pt) => u[0] * v[0] + u[1] * v[1];
const cross = (u: Pt, v: Pt) => u[0] * v[1] - u[1] * v[0];

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}
export function mid(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Doppelter orientierter Flächeninhalt (> 0: gegen den Uhrzeigersinn). */
export function area2(t: Tri): number {
  return cross(sub(t[1], t[0]), sub(t[2], t[0]));
}
export function area(t: Tri): number {
  return Math.abs(area2(t)) / 2;
}
/** Entartet (Ecken auf einer Geraden oder zu eng)? */
export function degenerate(t: Tri, eps = 1e-6): boolean {
  return Math.abs(area2(t)) < eps;
}

/** Seitenlängen a = |BC|, b = |CA|, c = |AB|. */
export function sides(t: Tri): [number, number, number] {
  return [dist(t[1], t[2]), dist(t[2], t[0]), dist(t[0], t[1])];
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

/** Umkreismittelpunkt U (Schnitt der Mittelsenkrechten). */
export function circumcenter(t: Tri): Pt | null {
  const [a, b, c] = t;
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a[0] ** 2 + a[1] ** 2;
  const b2 = b[0] ** 2 + b[1] ** 2;
  const c2 = c[0] ** 2 + c[1] ** 2;
  return [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d];
}

/** Inkreismittelpunkt I: mit den Seitenlängen gewichtetes Mittel der Ecken. */
export function incenter(t: Tri): Pt {
  const [a, b, c] = sides(t);
  const s = a + b + c;
  return [(a * t[0][0] + b * t[1][0] + c * t[2][0]) / s, (a * t[0][1] + b * t[1][1] + c * t[2][1]) / s];
}
/** Inkreisradius ρ = A / s (s = halber Umfang). */
export function inradius(t: Tri): number {
  const [a, b, c] = sides(t);
  return (2 * area(t)) / (a + b + c);
}

/** Schwerpunkt S: Mittel der Ecken. */
export function centroid(t: Tri): Pt {
  return [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
}

/** Höhenschnittpunkt H. Es gilt H = A + B + C − 2·U (Euler). */
export function orthocenter(t: Tri): Pt | null {
  const u = circumcenter(t);
  if (!u) return null;
  return [t[0][0] + t[1][0] + t[2][0] - 2 * u[0], t[0][1] + t[1][1] + t[2][1] - 2 * u[1]];
}

/** Dreiecksart nach dem größten Winkel. */
export function kind(t: Tri, tolDeg = 1e-6): 'spitz' | 'recht' | 'stumpf' {
  const m = Math.max(...angles(t));
  if (Math.abs(m - 90) <= tolDeg) return 'recht';
  return m > 90 ? 'stumpf' : 'spitz';
}

/** Liegt p im Dreieck (Rand eingeschlossen)? */
export function inside(t: Tri, p: Pt, eps = 1e-9): boolean {
  const s = Math.sign(area2(t));
  for (let i = 0; i < 3; i++) {
    const a = t[i]!;
    const b = t[(i + 1) % 3]!;
    if (s * cross(sub(b, a), sub(p, a)) < -eps) return false;
  }
  return true;
}

/** Seitenmittelpunkte M_a (von [BC]), M_b, M_c. */
export function midpoints(t: Tri): [Pt, Pt, Pt] {
  return [mid(t[1], t[2]), mid(t[2], t[0]), mid(t[0], t[1])];
}

/** Höhenfußpunkte H_a (auf BC), H_b, H_c. */
export function altitudeFeet(t: Tri): [Pt, Pt, Pt] {
  return [foot(t[0], t[1], t[2]), foot(t[1], t[2], t[0]), foot(t[2], t[0], t[1])];
}

/** Berührpunkte des Inkreises auf a, b, c. */
export function touchPoints(t: Tri): [Pt, Pt, Pt] {
  const i = incenter(t);
  return [foot(i, t[1], t[2]), foot(i, t[2], t[0]), foot(i, t[0], t[1])];
}

/** Liegt der Fußpunkt f auf der Strecke [ab] (nicht auf der Verlängerung)? */
export function onSegment(f: Pt, a: Pt, b: Pt, eps = 1e-9): boolean {
  const d = sub(b, a);
  const k = dot(sub(f, a), d) / dot(d, d);
  return k >= -eps && k <= 1 + eps;
}

/** Schnittpunkt der Winkelhalbierenden von A mit der Gegenseite [BC]. */
export function bisectorFoot(t: Tri, i: 0 | 1 | 2): Pt {
  const p = t[i];
  const q = t[(i + 1) % 3]!;
  const r = t[(i + 2) % 3]!;
  // teilt die Gegenseite im Verhältnis der anliegenden Seiten
  const dq = dist(p, q);
  const dr = dist(p, r);
  const k = dq / (dq + dr);
  return [q[0] + (r[0] - q[0]) * k, q[1] + (r[1] - q[1]) * k];
}
