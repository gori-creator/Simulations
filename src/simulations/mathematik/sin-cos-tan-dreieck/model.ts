/**
 * Rechenlogik „Sinus, Kosinus und Tangens im rechtwinkligen Dreieck“ (Jgst. 9/10).
 *
 * Dreieck ABC mit rechtem Winkel bei C, Hypotenuse c = AB,
 * Kathete a = BC (gegenüber von A) und Kathete b = AC (gegenüber von B).
 * Bezugswinkel α (bei A) oder β (bei B):
 *   sin = Gegenkathete : Hypotenuse
 *   cos = Ankathete : Hypotenuse
 *   tan = Gegenkathete : Ankathete
 */

export type Ref = 'a' | 'b';
export type Fn = 'sin' | 'cos' | 'tan';

export const DEG = Math.PI / 180;

export interface RightTriangle {
  /** Winkel α in Grad (0 < α < 90) */
  alpha: number;
  /** Hypotenuse c */
  c: number;
}

export function sides(t: RightTriangle): { a: number; b: number; c: number } {
  return { a: t.c * Math.sin(t.alpha * DEG), b: t.c * Math.cos(t.alpha * DEG), c: t.c };
}

/** Gegenkathete, Ankathete und Hypotenuse bezogen auf den gewählten Winkel. */
export function roles(t: RightTriangle, ref: Ref): { opp: number; adj: number; hyp: number; angle: number } {
  const s = sides(t);
  return ref === 'a' ? { opp: s.a, adj: s.b, hyp: s.c, angle: t.alpha } : { opp: s.b, adj: s.a, hyp: s.c, angle: 90 - t.alpha };
}

/** Wert über das Seitenverhältnis. */
export function ratio(t: RightTriangle, ref: Ref, f: Fn): number {
  const r = roles(t, ref);
  if (f === 'sin') return r.opp / r.hyp;
  if (f === 'cos') return r.adj / r.hyp;
  return r.opp / r.adj;
}

export function trig(f: Fn, deg: number): number {
  if (f === 'sin') return Math.sin(deg * DEG);
  if (f === 'cos') return Math.cos(deg * DEG);
  return Math.tan(deg * DEG);
}

/** Winkel (Grad) aus einem Seitenverhältnis – „Umkehrtaste“ sin⁻¹ usw. */
export function inverse(f: Fn, v: number): number {
  if (f === 'sin') return Math.asin(v) / DEG;
  if (f === 'cos') return Math.acos(v) / DEG;
  return Math.atan(v) / DEG;
}
