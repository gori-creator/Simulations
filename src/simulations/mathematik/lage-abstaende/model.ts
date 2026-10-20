/**
 * Rechenlogik für „Lagebeziehungen und Abstände im Raum“: Lage zweier
 * Geraden (identisch, parallel, schneidend, windschief), Gerade und Ebene
 * (liegt in E, parallel, Durchstoßpunkt), zweier Ebenen (identisch, parallel,
 * Schnittgerade), Schnittwinkel und Abstände (Hesse-Normalform, Lotfußpunkt,
 * Spiegelpunkt, gemeinsames Lot windschiefer Geraden). Keine Zeichenbefehle.
 *
 * Geraden: x = a + t · u (Stützpunkt a, Richtung u).
 * Ebenen in Koordinatenform: n₁x₁ + n₂x₂ + n₃x₃ = c (Normalenvektor n).
 *
 * Alle Entscheidungen arbeiten mit einer relativen Toleranz, damit
 * Rundungsfehler (z. B. bei fast parallelen Richtungen aus Gleitkommazahlen)
 * nicht zu falschen Fällen führen.
 */

export type V3 = readonly [number, number, number];

export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const norm = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const normSq = (a: V3): number => dot(a, a);
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const normalize = (a: V3): V3 => {
  const l = norm(a);
  return l > 1e-12 ? scale(a, 1 / l) : [0, 0, 0];
};

/** Relative Toleranz für „gleich null“. */
export const EPS = 1e-9;

/** Ist der Vektor (praktisch) der Nullvektor? */
export const isZero = (a: V3, eps = 1e-12): boolean => norm(a) <= eps;

/** Sind u und v parallel (Vielfache voneinander)? Prüft |u × v| ≤ ε · |u| · |v|. */
export function parallel(u: V3, v: V3, eps = EPS): boolean {
  return norm(cross(u, v)) <= eps * norm(u) * norm(v);
}

/** Längenmaßstab für absolute Toleranzen (damit große Koordinaten nicht stören). */
const size = (...vs: V3[]): number => 1 + Math.max(...vs.map(norm));

/** Winkel in Grad zwischen 0° und 90° aus einem Kosinus- bzw. Sinuswert (Betrag). */
const acosDeg = (c: number): number => (Math.acos(Math.min(1, Math.abs(c))) * 180) / Math.PI;
const asinDeg = (s: number): number => (Math.asin(Math.min(1, Math.abs(s))) * 180) / Math.PI;

/** Lotfußpunkt von p auf die Gerade a + t · u (mit Parameter t). */
export function footOnLine(p: V3, a: V3, u: V3): { t: number; point: V3 } {
  const uu = normSq(u);
  const t = uu > 0 ? dot(sub(p, a), u) / uu : 0;
  return { t, point: add(a, scale(u, t)) };
}

/** Abstand des Punktes p von der Geraden a + t · u: |(p − a) × u| / |u|. */
export function pointLineDistance(p: V3, a: V3, u: V3): number {
  const l = norm(u);
  return l > 0 ? norm(cross(sub(p, a), u)) / l : norm(sub(p, a));
}

/* ------------------------------------------------------------------ */
/* Gerade – Gerade                                                     */
/* ------------------------------------------------------------------ */

export type LineLineKind = 'invalid' | 'identical' | 'parallel' | 'intersect' | 'skew';

export interface LineLineResult {
  kind: LineLineKind;
  /** Richtungen parallel? (erste Frage im Entscheidungsbaum) */
  parallelDirs: boolean;
  /** Abstand der Geraden (0 bei identisch/schneidend). */
  distance: number;
  /** Schnittwinkel der Geraden in Grad (0° … 90°), 0 bei parallelen Richtungen. */
  angleDeg: number;
  /** Parameter der Lotfußpunkte auf g (t) und h (s); bei parallelen Geraden: Lotfuß von B auf g (t) und s = 0. */
  t: number;
  s: number;
  /** Lotfußpunkte der kürzesten Verbindung auf g und auf h. */
  footG: V3;
  footH: V3;
  /** Schnittpunkt (nur bei `intersect`). */
  point: V3 | null;
}

/**
 * Lage zweier Geraden g: x = a + t · u und h: x = b + s · v.
 * Gleichsetzen a + t · u = b + s · v; die kürzeste Verbindung steht senkrecht
 * auf beiden Richtungen. Abstand windschiefer Geraden:
 * d = |(b − a) · (u × v)| / |u × v|.
 */
export function lineLine(a: V3, u: V3, b: V3, v: V3, eps = EPS): LineLineResult {
  const invalid: LineLineResult = { kind: 'invalid', parallelDirs: false, distance: NaN, angleDeg: NaN, t: NaN, s: NaN, footG: a, footH: b, point: null };
  if (isZero(u) || isZero(v)) return invalid;
  const tol = eps * size(a, b, u, v) * 10;
  if (parallel(u, v, eps)) {
    const f = footOnLine(b, a, u);
    const d = norm(sub(b, f.point));
    const same = d <= tol;
    return { kind: same ? 'identical' : 'parallel', parallelDirs: true, distance: same ? 0 : d, angleDeg: 0, t: f.t, s: 0, footG: f.point, footH: b, point: null };
  }
  // Lotfußpunkte der gemeinsamen Senkrechten
  const w0 = sub(a, b);
  const A = dot(u, u);
  const B = dot(u, v);
  const C = dot(v, v);
  const D = dot(u, w0);
  const E = dot(v, w0);
  const den = A * C - B * B;
  const t = (B * E - C * D) / den;
  const s = (A * E - B * D) / den;
  const footG = add(a, scale(u, t));
  const footH = add(b, scale(v, s));
  const n = cross(u, v);
  const d = Math.abs(dot(sub(b, a), n)) / norm(n);
  const angleDeg = acosDeg(dot(u, v) / (norm(u) * norm(v)));
  if (d <= tol) return { kind: 'intersect', parallelDirs: false, distance: 0, angleDeg, t, s, footG, footH, point: footG };
  return { kind: 'skew', parallelDirs: false, distance: d, angleDeg, t, s, footG, footH, point: null };
}

/* ------------------------------------------------------------------ */
/* Gerade – Ebene                                                      */
/* ------------------------------------------------------------------ */

export type LinePlaneKind = 'invalid' | 'inPlane' | 'parallel' | 'intersect';

export interface LinePlaneResult {
  kind: LinePlaneKind;
  /** n · u (= 0 ⇔ Gerade parallel zur Ebene oder in ihr). */
  nu: number;
  /** n · a − c (Einsetzen des Stützpunkts). */
  na: number;
  /** Parameter des Durchstoßpunkts. */
  t: number;
  point: V3 | null;
  /** Schnittwinkel Gerade–Ebene in Grad über sin φ = |n · u| / (|n| · |u|). */
  angleDeg: number;
  /** Abstand bei paralleler Lage (sonst 0). */
  distance: number;
}

/**
 * Lage der Geraden x = a + t · u zur Ebene n · x = c. Einsetzen:
 * n · (a + t · u) = c ⇒ t · (n · u) = c − n · a.
 */
export function linePlane(a: V3, u: V3, n: V3, c: number, eps = EPS): LinePlaneResult {
  if (isZero(u) || isZero(n)) return { kind: 'invalid', nu: NaN, na: NaN, t: NaN, point: null, angleDeg: NaN, distance: NaN };
  const nu = dot(n, u);
  const na = dot(n, a) - c;
  const ln = norm(n);
  if (Math.abs(nu) <= eps * ln * norm(u)) {
    const dist = Math.abs(na) / ln;
    const inPlane = dist <= eps * size(a) * 10 * (1 + Math.abs(c) / ln);
    return { kind: inPlane ? 'inPlane' : 'parallel', nu: 0, na, t: NaN, point: null, angleDeg: 0, distance: inPlane ? 0 : dist };
  }
  const t = -na / nu;
  return { kind: 'intersect', nu, na, t, point: add(a, scale(u, t)), angleDeg: asinDeg(nu / (ln * norm(u))), distance: 0 };
}

/* ------------------------------------------------------------------ */
/* Ebene – Ebene                                                       */
/* ------------------------------------------------------------------ */

export type PlanePlaneKind = 'invalid' | 'identical' | 'parallel' | 'intersect';

export interface PlanePlaneResult {
  kind: PlanePlaneKind;
  /** Punkt der Schnittgeraden (der dem Ursprung am nächsten liegt). */
  point: V3 | null;
  /** Richtung der Schnittgeraden n × m. */
  dir: V3 | null;
  /** Schnittwinkel der Ebenen in Grad über cos φ = |n · m| / (|n| · |m|). */
  angleDeg: number;
  /** Abstand paralleler Ebenen (sonst 0). */
  distance: number;
}

/**
 * Lage der Ebenen E: n · x = c und F: m · x = k. Schnittgerade mit Richtung
 * w = n × m durch den Punkt ((c·|m|² − k·(n·m)) · n + (k·|n|² − c·(n·m)) · m) / |w|².
 */
export function planePlane(n: V3, c: number, m: V3, k: number, eps = EPS): PlanePlaneResult {
  if (isZero(n) || isZero(m)) return { kind: 'invalid', point: null, dir: null, angleDeg: NaN, distance: NaN };
  const ln = norm(n);
  const lm = norm(m);
  if (parallel(n, m, eps)) {
    // m = λ · n ⇒ F: n · x = k / λ; Abstand |k/λ − c| / |n|
    const lambda = dot(m, n) / dot(n, n);
    const dist = Math.abs(k / lambda - c) / ln;
    const same = dist <= eps * 10 * (1 + Math.abs(c) / ln + Math.abs(k) / lm);
    return { kind: same ? 'identical' : 'parallel', point: null, dir: null, angleDeg: 0, distance: same ? 0 : dist };
  }
  const w = cross(n, m);
  const nm = dot(n, m);
  const ww = dot(w, w);
  const point = scale(add(scale(n, c * dot(m, m) - k * nm), scale(m, k * dot(n, n) - c * nm)), 1 / ww);
  return { kind: 'intersect', point, dir: w, angleDeg: acosDeg(nm / (ln * lm)), distance: 0 };
}

/* ------------------------------------------------------------------ */
/* Punkt – Ebene (Hesse-Normalform)                                    */
/* ------------------------------------------------------------------ */

export interface PointPlaneResult {
  /** n · p − c (Einsetzen in die Koordinatenform). */
  value: number;
  /** Vorzeichenbehafteter Abstand (n · p − c) / |n| (positiv: auf der Seite, in die n zeigt). */
  signed: number;
  /** Abstand d(P; E) = |n · p − c| / |n|. */
  distance: number;
  /** Parameter der Lotgeraden x = p + t · n im Lotfußpunkt: t = −(n · p − c) / |n|². */
  t: number;
  /** Lotfußpunkt F = p + t · n. */
  foot: V3;
  /** Spiegelpunkt P′ = p + 2t · n. */
  mirror: V3;
  /** Liegt P in der Ebene? */
  onPlane: boolean;
}

/** Abstand eines Punktes von der Ebene n · x = c mit Lotfußpunkt und Spiegelpunkt. */
export function pointPlane(p: V3, n: V3, c: number, eps = EPS): PointPlaneResult | null {
  if (isZero(n)) return null;
  const value = dot(n, p) - c;
  const ln = norm(n);
  const t = -value / (ln * ln);
  const distance = Math.abs(value) / ln;
  return { value, signed: value / ln, distance, t, foot: add(p, scale(n, t)), mirror: add(p, scale(n, 2 * t)), onPlane: distance <= eps * 10 * size(p) };
}

/* ------------------------------------------------------------------ */
/* Hilfen für die Darstellung                                          */
/* ------------------------------------------------------------------ */

/** Punkt der Ebene n · x = c, der q am nächsten liegt (Lotfußpunkt von q). */
export function projectOntoPlane(q: V3, n: V3, c: number): V3 {
  const nn = dot(n, n);
  return nn > 0 ? sub(q, scale(n, (dot(n, q) - c) / nn)) : q;
}

/**
 * Zwei Richtungsvektoren der Länge 1, die die Ebene mit Normale n aufspannen
 * (e₂ zeigt möglichst „bergauf“ in x₃-Richtung, e₁ = e₂ × n̂ waagerecht).
 */
export function planeBasis(n: V3): [V3, V3] {
  const nh = normalize(n);
  let e2 = sub([0, 0, 1], scale(nh, nh[2]));
  if (norm(e2) < 1e-6) e2 = sub([-1, 0, 0], scale(nh, -nh[0]));
  e2 = normalize(e2);
  return [normalize(cross(e2, nh)), e2];
}

/**
 * Parameterbereich [t₀, t₁], in dem die Gerade a + t · u im Würfel
 * [−L, L]³ verläuft (Verfahren mit „Platten“), oder `null`.
 */
export function clipLineToBox(a: V3, u: V3, L: number): [number, number] | null {
  let t0 = -Infinity;
  let t1 = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(u[i]!) < 1e-12) {
      if (Math.abs(a[i]!) > L) return null;
      continue;
    }
    let lo = (-L - a[i]!) / u[i]!;
    let hi = (L - a[i]!) / u[i]!;
    if (lo > hi) [lo, hi] = [hi, lo];
    t0 = Math.max(t0, lo);
    t1 = Math.min(t1, hi);
  }
  return t0 < t1 ? [t0, t1] : null;
}

/**
 * Koordinatenform als Text, z. B. (2, −1, 2), 3 → „2x₁ − x₂ + 2x₃ = 3“.
 * `num` formatiert die Beträge (z. B. mit Dezimalkomma).
 */
export function coordForm(n: V3, c: number, num: (v: number) => string = String): string {
  const subs = ['₁', '₂', '₃'];
  let s = '';
  n.forEach((v, i) => {
    if (Math.abs(v) < 1e-12) return;
    const abs = Math.abs(v);
    const coef = Math.abs(abs - 1) < 1e-12 ? '' : num(abs);
    const term = `${coef}x${subs[i]}`;
    if (!s) s = v < 0 ? `−${term}` : term;
    else s += v < 0 ? ` − ${term}` : ` + ${term}`;
  });
  if (!s) s = '0';
  const rhs = c < 0 ? `−${num(Math.abs(c))}` : num(c);
  return `${s} = ${rhs}`;
}
