/**
 * Rechenlogik „Sinussatz und Kosinussatz“ (Jgst. 10).
 *
 * Dreieck ABC, Seite a = |BC| gegenüber von A usw., Winkel α bei A usw.
 *   Sinussatz:   a : sin α = b : sin β = c : sin γ = 2r  (r: Umkreisradius)
 *   Kosinussatz: c² = a² + b² − 2ab · cos γ   (für γ = 90°: Pythagoras)
 */

export type Pt = readonly [number, number];
export type Tri = readonly [Pt, Pt, Pt];

export const DEG = Math.PI / 180;

export function dist(p: Pt, q: Pt): number {
  return Math.hypot(q[0] - p[0], q[1] - p[1]);
}

/** Seitenlängen [a, b, c] mit a = |BC|, b = |CA|, c = |AB|. */
export function sides(t: Tri): [number, number, number] {
  return [dist(t[1], t[2]), dist(t[2], t[0]), dist(t[0], t[1])];
}

/** Doppelter orientierter Flächeninhalt. */
export function area2(t: Tri): number {
  return (t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[1][1] - t[0][1]) * (t[2][0] - t[0][0]);
}

/** Innenwinkel [α, β, γ] in Grad (über den Kosinussatz). */
export function angles(t: Tri): [number, number, number] {
  const [a, b, c] = sides(t);
  return [angleFromSides(b, c, a), angleFromSides(c, a, b), angleFromSides(a, b, c)];
}

/** Kosinussatz: dritte Seite aus zwei Seiten und dem eingeschlossenen Winkel (Grad). */
export function lawOfCosines(a: number, b: number, gammaDeg: number): number {
  return Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * Math.cos(gammaDeg * DEG)));
}

/** Kosinussatz umgestellt: Winkel γ gegenüber von c aus den drei Seiten (Grad). */
export function angleFromSides(a: number, b: number, c: number): number {
  const v = (a * a + b * b - c * c) / (2 * a * b);
  return Math.acos(Math.max(-1, Math.min(1, v))) / DEG;
}

/** Umkreisradius r = abc / (4 · Flächeninhalt). */
export function circumradius(t: Tri): number {
  const [a, b, c] = sides(t);
  return (a * b * c) / (2 * Math.abs(area2(t)));
}

/** Umkreismittelpunkt. */
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
  return [s[0] / Math.sin(w[0] * DEG), s[1] / Math.sin(w[1] * DEG), s[2] / Math.sin(w[2] * DEG)];
}

/** Lotfußpunkt von p auf die Gerade durch q und r und der Parameter (0 = q, 1 = r). */
export function foot(p: Pt, q: Pt, r: Pt): { at: Pt; t: number } {
  const dx = r[0] - q[0];
  const dy = r[1] - q[1];
  const t = ((p[0] - q[0]) * dx + (p[1] - q[1]) * dy) / (dx * dx + dy * dy);
  return { at: [q[0] + t * dx, q[1] + t * dy], t };
}

/** Kleinster Innenwinkel (Grad) – zum Aussortieren zu spitzer Dreiecke. */
export function minAngle(t: Tri): number {
  return Math.min(...angles(t));
}
