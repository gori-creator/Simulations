/**
 * Rechenlogik „Mittelsenkrechte und Winkelhalbierende“ (Jahrgangsstufe 7).
 *
 * Koordinaten in Kästchen des Karopapiers (1 Kästchen = 0,5 cm), y nach oben.
 *
 * Ortslinien:
 * - Die Mittelsenkrechte m der Strecke [AB] ist die Menge aller Punkte P mit
 *   |PA| = |PB|. Sie steht senkrecht auf [AB] und geht durch den Mittelpunkt M.
 * - Die Winkelhalbierende w eines Winkels ist (im Winkelfeld) die Menge aller
 *   Punkte, die von beiden Schenkeln gleich weit entfernt sind.
 *
 * Anwendung: Der Ort auf einer Straße, der von zwei Häusern gleich weit
 * entfernt ist, ist der Schnittpunkt der Straße mit der Mittelsenkrechten.
 *
 * Ausblick: Die drei Mittelsenkrechten eines Dreiecks schneiden sich im
 * Umkreismittelpunkt U, der von allen Ecken gleich weit entfernt ist.
 */

export type Pt = readonly [number, number];

export const GRID_W = 20;
export const GRID_H = 14;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const dot = (u: Pt, v: Pt): number => u[0] * v[0] + u[1] * v[1];
const cross = (u: Pt, v: Pt): number => u[0] * v[1] - u[1] * v[0];
const rad = (deg: number) => (deg * Math.PI) / 180;

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

export function mid(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Einheitsvektor in Richtung `deg` (Grad, gegen den Uhrzeigersinn, 0° = rechts). */
export function dir(deg: number): Pt {
  return [Math.cos(rad(deg)), Math.sin(rad(deg))];
}

/** Lotfußpunkt von P auf die Gerade durch S mit Richtung d. */
export function footOnLine(p: Pt, s: Pt, d: Pt): Pt {
  const k = dot(sub(p, s), d) / dot(d, d);
  return [s[0] + k * d[0], s[1] + k * d[1]];
}

/** Abstand des Punktes P von der Geraden durch S mit Richtung d. */
export function distToLine(p: Pt, s: Pt, d: Pt): number {
  return Math.abs(cross(d, sub(p, s))) / Math.hypot(d[0], d[1]);
}

/* ------------------------------------------------------------------ */
/* Mittelsenkrechte                                                    */
/* ------------------------------------------------------------------ */

/** Mittelsenkrechte von [AB]: Mittelpunkt M und Richtung (Einheitsvektor, senkrecht zu AB). */
export function perpBisector(a: Pt, b: Pt): { m: Pt; d: Pt } {
  const u = sub(b, a);
  const l = Math.hypot(u[0], u[1]) || 1;
  return { m: mid(a, b), d: [-u[1] / l, u[0] / l] };
}

/**
 * Welcher Punkt ist näher? Für Gitterpunkte exakt (Längenquadrate sind ganze
 * Zahlen), sonst mit kleiner Toleranz.
 */
export function closer(p: Pt, a: Pt, b: Pt, tol = 1e-9): 'A' | 'B' | 'equal' {
  const da = dot(sub(p, a), sub(p, a));
  const db = dot(sub(p, b), sub(p, b));
  if (Math.abs(da - db) <= tol * Math.max(1, da, db)) return 'equal';
  return da < db ? 'A' : 'B';
}

/**
 * Wie viele Nachkommastellen braucht man, damit zwei verschiedene Längen
 * (in cm) nicht gleich aussehen? Normal 1 (Millimeter); nur wenn beide auf
 * Millimeter gerundet gleich wären, 2 bzw. 3 Stellen.
 */
export function decimalsToTell(d1: number, d2: number, equal: boolean): number {
  if (equal) return 1;
  for (const k of [1, 2]) {
    const f = 10 ** k;
    if (Math.round(d1 * f) !== Math.round(d2 * f)) return k;
  }
  return 3;
}

/** Ganzzahlige Punkte des Gitters auf der Mittelsenkrechten (für die „Spur“). */
export function latticeOnBisector(a: Pt, b: Pt, w = GRID_W, h = GRID_H): Pt[] {
  const out: Pt[] = [];
  for (let x = 0; x <= w; x++) for (let y = 0; y <= h; y++) if (closer([x, y], a, b) === 'equal') out.push([x, y]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Winkelhalbierende                                                   */
/* ------------------------------------------------------------------ */

/** Winkel mit Scheitel S, erster Schenkel in Richtung th1, Größe al (beides in Grad). */
export interface Angle {
  s: Pt;
  th1: number;
  al: number;
}

/** Richtung der Winkelhalbierenden. */
export function bisectorDir(an: Angle): number {
  return an.th1 + an.al / 2;
}

/**
 * Nächster Punkt der Halbgeraden mit Anfangspunkt S und Richtung d: der
 * Lotfußpunkt, wenn er auf der Halbgeraden liegt, sonst S selbst.
 */
export function footOnRay(p: Pt, s: Pt, d: Pt): Pt {
  return dot(sub(p, s), d) >= 0 ? footOnLine(p, s, d) : s;
}

/** Abstand des Punktes P von der Halbgeraden mit Anfangspunkt S und Richtung d. */
export function distToRay(p: Pt, s: Pt, d: Pt): number {
  return dist(p, footOnRay(p, s, d));
}

/**
 * Abstände von P zu den beiden Schenkeln (Halbgeraden). Liegt der
 * Lotfußpunkt auf dem Schenkel, ist es die Länge des Lots, sonst der Abstand
 * zum Scheitel. So bleibt die Winkelhalbierende auch beim gestreckten Winkel
 * (180°) die einzige Ortslinie gleicher Abstände.
 */
export function armDistances(p: Pt, an: Angle): [number, number] {
  return [distToRay(p, an.s, dir(an.th1)), distToRay(p, an.s, dir(an.th1 + an.al))];
}

/** Liegt P im Winkelfeld (einschließlich Rand)? */
export function inField(p: Pt, an: Angle): boolean {
  const v = sub(p, an.s);
  if (Math.hypot(v[0], v[1]) < 1e-12) return true;
  let a = (Math.atan2(v[1], v[0]) * 180) / Math.PI - an.th1;
  a = ((a % 360) + 360) % 360;
  return a <= an.al + 1e-9 || a >= 360 - 1e-9;
}

/** P ins Winkelfeld holen (auf den nächsten Schenkel projizieren, wenn es außerhalb liegt). */
export function clampToField(p: Pt, an: Angle): Pt {
  if (inField(p, an)) return p;
  let best: Pt = an.s;
  let bd = Infinity;
  for (const th of [an.th1, an.th1 + an.al]) {
    const d = dir(th);
    const k = Math.max(0, dot(sub(p, an.s), d));
    const q: Pt = [an.s[0] + k * d[0], an.s[1] + k * d[1]];
    const dd = dist(p, q);
    if (dd < bd) {
      bd = dd;
      best = q;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Konstruktion mit Zirkel und Lineal                                  */
/* ------------------------------------------------------------------ */

/** Schnittpunkte zweier Kreise (0, 1 oder 2 Punkte). */
export function circleIntersections(c1: Pt, r1: number, c2: Pt, r2: number): Pt[] {
  const d = dist(c1, c2);
  if (d < 1e-12 || d > r1 + r2 + 1e-12 || d < Math.abs(r1 - r2) - 1e-12) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const ex = (c2[0] - c1[0]) / d;
  const ey = (c2[1] - c1[1]) / d;
  const px = c1[0] + a * ex;
  const py = c1[1] + a * ey;
  if (h < 1e-12) return [[px, py]];
  return [
    [px - h * ey, py + h * ex],
    [px + h * ey, py - h * ex],
  ];
}

/**
 * Mittelsenkrechte mit dem Zirkel: Kreisbögen mit gleichem Radius r um A
 * und B (r größer als die halbe Strecke), Schnittpunkte S₁ (links von AB)
 * und S₂ (rechts).
 */
export function constructBisector(a: Pt, b: Pt, factor = 0.7): { r: number; s1: Pt; s2: Pt; m: Pt } {
  const r = factor * dist(a, b);
  const [s1, s2] = circleIntersections(a, r, b, r) as [Pt, Pt];
  return { r, s1, s2, m: mid(a, b) };
}

/**
 * Winkelhalbierende mit dem Zirkel: Bogen um S mit Radius r1 schneidet die
 * Schenkel in P₁ und P₂; Bögen um P₁ und P₂ mit gleichem Radius r2 schneiden
 * sich im Winkelfeld in W.
 */
export function constructAngleBisector(an: Angle, r1: number): { p1: Pt; p2: Pt; r2: number; w: Pt } {
  const p1: Pt = [an.s[0] + r1 * dir(an.th1)[0], an.s[1] + r1 * dir(an.th1)[1]];
  const p2: Pt = [an.s[0] + r1 * dir(an.th1 + an.al)[0], an.s[1] + r1 * dir(an.th1 + an.al)[1]];
  const chord = dist(p1, p2);
  const r2 = Math.max(r1, 0.75 * chord);
  // Schnittpunkt auf der Winkelhalbierenden, weiter weg von S
  const t = r1 * Math.cos(rad(an.al / 2)) + Math.sqrt(Math.max(0, r2 * r2 - (r1 * Math.sin(rad(an.al / 2))) ** 2));
  const u = dir(bisectorDir(an));
  return { p1, p2, r2, w: [an.s[0] + t * u[0], an.s[1] + t * u[1]] };
}

/* ------------------------------------------------------------------ */
/* Anwendung: Treffpunkt an einer Straße                               */
/* ------------------------------------------------------------------ */

/**
 * Schnittpunkt der Geraden durch p mit Richtung d und der Geraden durch q
 * mit Richtung e (null, wenn sie parallel sind).
 */
export function lineIntersection(p: Pt, d: Pt, q: Pt, e: Pt): Pt | null {
  const den = cross(d, e);
  if (Math.abs(den) < 1e-12 * Math.max(1, dot(d, d), dot(e, e))) return null;
  const k = cross(sub(q, p), e) / den;
  return [p[0] + k * d[0], p[1] + k * d[1]];
}

/** Ergebnis der Suche nach dem Ort auf der Straße, der von A und B gleich weit entfernt ist. */
export type Meeting = { kind: 'point'; t: Pt } | { kind: 'none' } | { kind: 'all' };

/**
 * Ort auf der Straße g (Gerade durch G und H), der von A und B gleich weit
 * entfernt ist: der Schnittpunkt von g mit der Mittelsenkrechten von [AB].
 * Sonderfälle: g parallel zur Mittelsenkrechten (kein solcher Ort) oder
 * g ist selbst die Mittelsenkrechte (jeder Ort auf g passt).
 */
export function meetingPoint(a: Pt, b: Pt, g: Pt, h: Pt): Meeting {
  const { m, d } = perpBisector(a, b);
  const e = sub(h, g);
  const t = lineIntersection(m, d, g, e);
  if (t) return { kind: 'point', t };
  // parallel: liegt G auf der Mittelsenkrechten?
  return closer(g, a, b, 1e-9) === 'equal' ? { kind: 'all' } : { kind: 'none' };
}

/* ------------------------------------------------------------------ */
/* Ausblick: Umkreis                                                   */
/* ------------------------------------------------------------------ */

/** Umkreismittelpunkt (null, wenn die Punkte auf einer Geraden liegen). */
export function circumcenter(a: Pt, b: Pt, c: Pt): Pt | null {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a[0] ** 2 + a[1] ** 2;
  const b2 = b[0] ** 2 + b[1] ** 2;
  const c2 = c[0] ** 2 + c[1] ** 2;
  return [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d];
}

/** Dreiecksart nach dem größten Winkel (für Gitterpunkte exakt). */
export function triangleKind(a: Pt, b: Pt, c: Pt): 'spitz' | 'recht' | 'stumpf' {
  const ds = [dot(sub(b, a), sub(c, a)), dot(sub(a, b), sub(c, b)), dot(sub(a, c), sub(b, c))];
  if (ds.some((d) => Math.abs(d) < 1e-9)) return 'recht';
  return ds.some((d) => d < 0) ? 'stumpf' : 'spitz';
}

/** Liegen die drei Punkte auf einer Geraden (oder fallen zusammen)? */
export function collinear(a: Pt, b: Pt, c: Pt): boolean {
  return Math.abs(cross(sub(b, a), sub(c, a))) < 1e-9;
}
