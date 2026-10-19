/**
 * Rechenlogik „Sinus, Kosinus und Tangens im rechtwinkligen Dreieck“ (Jgst. 9/10).
 *
 * Dreieck ABC mit rechtem Winkel bei C, Hypotenuse c = AB,
 * Kathete a = BC (gegenüber von A) und Kathete b = AC (gegenüber von B).
 * Bezugswinkel α (bei A) oder β (bei B):
 *   sin = Gegenkathete : Hypotenuse
 *   cos = Ankathete : Hypotenuse
 *   tan = Gegenkathete : Ankathete
 *
 * Alle Winkel in Grad. Keine Zeichenlogik in dieser Datei.
 */

export type Ref = 'a' | 'b';
export type Fn = 'sin' | 'cos' | 'tan';
export type Role = 'opp' | 'adj' | 'hyp';

export const DEG = Math.PI / 180;

export interface RightTriangle {
  /** Winkel α in Grad (0 < α < 90) */
  alpha: number;
  /** Hypotenuse c */
  c: number;
}

/** Katheten a (gegenüber α) und b (gegenüber β) aus α und c. */
export function sides(t: RightTriangle): { a: number; b: number; c: number } {
  return { a: t.c * Math.sin(t.alpha * DEG), b: t.c * Math.cos(t.alpha * DEG), c: t.c };
}

/** Gegenkathete, Ankathete und Hypotenuse bezogen auf den gewählten Winkel. */
export function roles(t: RightTriangle, ref: Ref): { opp: number; adj: number; hyp: number; angle: number } {
  const s = sides(t);
  return ref === 'a' ? { opp: s.a, adj: s.b, hyp: s.c, angle: t.alpha } : { opp: s.b, adj: s.a, hyp: s.c, angle: 90 - t.alpha };
}

/** Rolle einer Seite (a, b oder c) bezogen auf den Bezugswinkel. */
export function roleOf(side: 'a' | 'b' | 'c', ref: Ref): Role {
  if (side === 'c') return 'hyp';
  if (ref === 'a') return side === 'a' ? 'opp' : 'adj';
  return side === 'b' ? 'opp' : 'adj';
}

/** Seite (a, b oder c), die bezogen auf den Bezugswinkel die Rolle `role` hat. */
export function sideOf(role: Role, ref: Ref): 'a' | 'b' | 'c' {
  if (role === 'hyp') return 'c';
  if (role === 'opp') return ref === 'a' ? 'a' : 'b';
  return ref === 'a' ? 'b' : 'a';
}

/** Zähler und Nenner des Verhältnisses. */
export function ratioParts(f: Fn): { num: 'opp' | 'adj'; den: 'adj' | 'hyp' } {
  if (f === 'sin') return { num: 'opp', den: 'hyp' };
  if (f === 'cos') return { num: 'adj', den: 'hyp' };
  return { num: 'opp', den: 'adj' };
}

/** Wert über das Seitenverhältnis. */
export function ratio(t: RightTriangle, ref: Ref, f: Fn): number {
  const r = roles(t, ref);
  if (f === 'sin') return r.opp / r.hyp;
  if (f === 'cos') return r.adj / r.hyp;
  return r.opp / r.adj;
}

/** sin, cos oder tan eines Winkels in Grad. tan 90° ist nicht definiert (Infinity). */
export function trig(f: Fn, deg: number): number {
  if (f === 'sin') return Math.sin(deg * DEG);
  if (f === 'cos') return Math.cos(deg * DEG);
  if (Math.abs(deg - 90) < 1e-12) return Infinity;
  return Math.tan(deg * DEG);
}

/** Winkel (Grad) aus einem Seitenverhältnis – „Umkehrtaste“ sin⁻¹ usw. NaN, wenn es keinen Winkel gibt. */
export function inverse(f: Fn, v: number): number {
  if (f === 'sin') return Math.asin(v) / DEG;
  if (f === 'cos') return Math.acos(v) / DEG;
  return Math.atan(v) / DEG;
}

/* ------------------------------------------------------------------ *
 * Ähnliche Dreiecke: Streckung mit Zentrum im Scheitel des Bezugswinkels
 * ------------------------------------------------------------------ */

/** Seiten der um k gestreckten Kopie; das Verhältnis ist für jedes k > 0 dasselbe. */
export function scaledRoles(t: RightTriangle, ref: Ref, k: number): { opp: number; adj: number; hyp: number } {
  const r = roles(t, ref);
  return { opp: k * r.opp, adj: k * r.adj, hyp: k * r.hyp };
}

/** Streckfaktoren der Kopien in der Animation „Ähnliche Dreiecke“. */
export const COPY_FACTORS = [0.25, 0.5, 0.75, 1] as const;

/* ------------------------------------------------------------------ *
 * Einheitskreis
 * ------------------------------------------------------------------ */

/**
 * Am Einheitskreis (Hypotenuse 1): P = (cos α | sin α), Lotfußpunkt F = (cos α | 0),
 * Tangentenpunkt T = (1 | tan α) auf der Tangente x = 1.
 */
export function unitCircle(alpha: number): { sin: number; cos: number; tan: number; P: [number, number]; F: [number, number]; T: [number, number] } {
  const s = Math.sin(alpha * DEG);
  const c = Math.cos(alpha * DEG);
  const t = trig('tan', alpha);
  return { sin: s, cos: c, tan: t, P: [c, s], F: [c, 0], T: [1, t] };
}

/* ------------------------------------------------------------------ *
 * Besondere Werte (exakt)
 * ------------------------------------------------------------------ */

/** Exakter Wert der Form (n / d) · √r; null = nicht definiert. */
export interface Exact {
  n: number;
  d: number;
  r: number;
}

export const SPECIAL_ANGLES = [0, 30, 45, 60, 90] as const;

const EXACT: Record<Fn, Record<number, Exact | null>> = {
  sin: { 0: { n: 0, d: 1, r: 1 }, 30: { n: 1, d: 2, r: 1 }, 45: { n: 1, d: 2, r: 2 }, 60: { n: 1, d: 2, r: 3 }, 90: { n: 1, d: 1, r: 1 } },
  cos: { 0: { n: 1, d: 1, r: 1 }, 30: { n: 1, d: 2, r: 3 }, 45: { n: 1, d: 2, r: 2 }, 60: { n: 1, d: 2, r: 1 }, 90: { n: 0, d: 1, r: 1 } },
  tan: { 0: { n: 0, d: 1, r: 1 }, 30: { n: 1, d: 3, r: 3 }, 45: { n: 1, d: 1, r: 1 }, 60: { n: 1, d: 1, r: 3 }, 90: null },
};

/** Exakter Wert bei 0°, 30°, 45°, 60°, 90° (undefined für andere Winkel, null für tan 90°). */
export function exactValue(f: Fn, deg: number): Exact | null | undefined {
  return EXACT[f][deg];
}

/** Zahlenwert eines exakten Werts. */
export function exactNumber(e: Exact): number {
  return (e.n / e.d) * Math.sqrt(e.r);
}

/* ------------------------------------------------------------------ *
 * Rückwärts: Winkel aus zwei Seiten
 * ------------------------------------------------------------------ */

export interface InverseResult {
  /** gibt es ein Dreieck? (Kathete kürzer als Hypotenuse) */
  ok: boolean;
  /** Seitenverhältnis (bei !ok auch > 1 möglich) */
  value: number;
  /** gesuchter Winkel in Grad (NaN, wenn !ok) */
  angle: number;
  /** alle drei Seiten bezogen auf den gesuchten Winkel (bei !ok: dritte Seite NaN) */
  opp: number;
  adj: number;
  hyp: number;
}

/**
 * Aus den beiden zum Verhältnis f gehörenden Seiten den Winkel bestimmen:
 * sin: Gegenkathete go und Hypotenuse hy, cos: Ankathete an und Hypotenuse hy,
 * tan: Gegenkathete go und Ankathete an. Nicht benötigte Werte werden ignoriert.
 */
export function angleFromSides(f: Fn, go: number, an: number, hy: number): InverseResult {
  if (f === 'tan') {
    const value = go / an;
    return { ok: go > 0 && an > 0, value, angle: inverse('tan', value), opp: go, adj: an, hyp: Math.hypot(go, an) };
  }
  const leg = f === 'sin' ? go : an;
  const value = leg / hy;
  const ok = leg > 0 && hy > 0 && leg < hy;
  const other = ok ? Math.sqrt(hy * hy - leg * leg) : NaN;
  const angle = ok ? inverse(f, value) : NaN;
  return f === 'sin' ? { ok, value, angle, opp: go, adj: other, hyp: hy } : { ok, value, angle, opp: other, adj: an, hyp: hy };
}

/* ------------------------------------------------------------------ *
 * Anwendungen
 * ------------------------------------------------------------------ */

/** Steigung in Prozent → Steigungswinkel in Grad: tan α = p / 100. */
export function angleFromPercent(percent: number): number {
  return Math.atan(percent / 100) / DEG;
}

/** Steigungswinkel in Grad → Steigung in Prozent. */
export function percentFromAngle(deg: number): number {
  return Math.tan(deg * DEG) * 100;
}

/**
 * Rampe mit Höhenunterschied h (m) und Steigung p (%):
 * waagrechte Länge l = h : (p/100), Länge der schiefen Rampe s = √(l² + h²), Winkel α.
 */
export function ramp(percent: number, h: number): { tan: number; angle: number; run: number; slope: number } {
  const tan = percent / 100;
  const run = h / tan;
  return { tan, angle: angleFromPercent(percent), run, slope: Math.hypot(run, h) };
}

/** Sicherheitsbereich für den Anstellwinkel einer Anlegeleiter (Faustregel). */
export const LADDER_MIN = 65;
export const LADDER_MAX = 75;

/** Leiter der Länge L (m) mit Anstellwinkel α zum Boden: Höhe an der Wand, Fußabstand, Bewertung. */
export function ladder(L: number, alpha: number): { height: number; foot: number; safety: 'flat' | 'ok' | 'steep' } {
  const height = L * Math.sin(alpha * DEG);
  const foot = L * Math.cos(alpha * DEG);
  const safety = alpha < LADDER_MIN ? 'flat' : alpha > LADDER_MAX ? 'steep' : 'ok';
  return { height, foot, safety };
}

/** Augenhöhe bzw. Höhe des Messgeräts über dem Boden in m. */
export const EYE_HEIGHT = 1.5;

/**
 * Turmhöhe aus der Entfernung d (m) zum Fußpunkt und dem Höhenwinkel α, gemessen in Augenhöhe e:
 * x = d · tan α (über Augenhöhe), h = x + e.
 */
export function tower(d: number, alpha: number, eye = EYE_HEIGHT): { above: number; height: number } {
  const above = d * Math.tan(alpha * DEG);
  return { above, height: above + eye };
}
