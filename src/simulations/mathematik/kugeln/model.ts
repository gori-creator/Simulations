/**
 * Rechenlogik für „Kugeln, Geraden und Ebenen“: Kugelgleichung und
 * Punktprobe, Lage Kugel – Ebene (Abstand des Mittelpunkts, Lotfußpunkt,
 * Schnittkreis), Lage Kugel – Gerade (quadratische Gleichung in t mit
 * Diskriminante) und Tangentialebene in einem Kugelpunkt. Keine
 * Zeichenbefehle.
 *
 * Kugel K: (x⃗ − m⃗)² = r²; Ebene E: n₁x₁ + n₂x₂ + n₃x₃ = c;
 * Gerade g: x⃗ = a⃗ + t · u⃗.
 */

export type V3 = readonly [number, number, number];

export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const norm = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Toleranz für „liegt auf“ / „berührt“ (relativ zur Größenordnung der Werte). */
const tol = (scaleOf: number) => 1e-9 * Math.max(1, Math.abs(scaleOf));

/* ------------------------------------------------------------------ */
/* Kugel und Punktprobe                                                */
/* ------------------------------------------------------------------ */

/**
 * Linke Seite der Kugelgleichung für einen Punkt: (p₁ − m₁)² + (p₂ − m₂)² + (p₃ − m₃)²
 * (= Quadrat des Abstands |MP|).
 */
export const sphereLhs = (m: V3, p: V3): number => dot(sub(p, m), sub(p, m));

export type PointPos = 'inside' | 'on' | 'outside';

/** Punktprobe: liegt P innerhalb, auf oder außerhalb der Kugel? (Vergleich |MP|² mit r²) */
export function pointPosition(m: V3, r: number, p: V3): PointPos {
  const d = sphereLhs(m, p) - r * r;
  if (Math.abs(d) <= tol(r * r)) return 'on';
  return d < 0 ? 'inside' : 'outside';
}

/** Radiale Projektion eines Punktes auf die Kugel (für den Punkt B der Tangentialebene). */
export function projectToSphere(m: V3, r: number, p: V3): V3 {
  const v = sub(p, m);
  const l = norm(v);
  if (l < 1e-12) return add(m, [0, 0, r]);
  return add(m, scale(v, r / l));
}

/* ------------------------------------------------------------------ */
/* Kugel und Ebene                                                     */
/* ------------------------------------------------------------------ */

/**
 * Vorzeichenbehafteter Abstand des Punktes P von der Ebene n · x = c
 * (Hessesche Normalform): (n · p − c) / |n|. Null-Normalenvektor → NaN.
 */
export function signedDistance(p: V3, n: V3, c: number): number {
  const l = norm(n);
  if (l < 1e-12) return NaN;
  return (dot(n, p) - c) / l;
}

/** Lotfußpunkt von P auf der Ebene n · x = c. */
export function footOnPlane(p: V3, n: V3, c: number): V3 {
  const l = norm(n);
  if (l < 1e-12) return p;
  return sub(p, scale(n, (dot(n, p) - c) / (l * l)));
}

export type PlaneCut =
  | { kind: 'none'; d: number; foot: V3 }
  | { kind: 'tangent'; d: number; foot: V3; point: V3 }
  | { kind: 'circle'; d: number; foot: V3; rho: number };

/**
 * Lage Kugel – Ebene: Abstand d von M zur Ebene mit r vergleichen.
 * d > r: kein gemeinsamer Punkt; d = r: Berührpunkt (= Lotfußpunkt);
 * d < r: Schnittkreis mit Mittelpunkt M′ (Lotfußpunkt) und Radius ρ = √(r² − d²).
 * Ungültige Ebene (n = o) → null.
 */
export function spherePlane(m: V3, r: number, n: V3, c: number): PlaneCut | null {
  const s = signedDistance(m, n, c);
  if (!Number.isFinite(s)) return null;
  const d = Math.abs(s);
  const foot = footOnPlane(m, n, c);
  const diff = r * r - d * d;
  if (Math.abs(diff) <= tol(r * r)) return { kind: 'tangent', d, foot, point: foot };
  if (diff < 0) return { kind: 'none', d, foot };
  return { kind: 'circle', d, foot, rho: Math.sqrt(diff) };
}

/** Zwei zueinander senkrechte Einheitsvektoren in der Ebene mit Normale n (für Zeichnung und Kreis). */
export function planeBasis(n: V3): [V3, V3] {
  const l = norm(n);
  const nz: V3 = l < 1e-12 ? [0, 0, 1] : scale(n, 1 / l);
  const helper: V3 = Math.abs(nz[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const u0 = cross(helper, nz);
  const u = scale(u0, 1 / norm(u0));
  const v = cross(nz, u);
  return [u, v];
}

/** Punkte eines Kreises mit Mittelpunkt c und Radius ρ in der Ebene mit Normale n. */
export function circlePoints(center: V3, n: V3, rho: number, count = 72): V3[] {
  const [u, v] = planeBasis(n);
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = (i * 2 * Math.PI) / count;
    return add(center, add(scale(u, rho * Math.cos(t)), scale(v, rho * Math.sin(t))));
  });
}

/* ------------------------------------------------------------------ */
/* Kugel und Gerade                                                    */
/* ------------------------------------------------------------------ */

export type LineCut = {
  /** Koeffizienten von A t² + B t + C = 0 nach Einsetzen von g in K. */
  A: number;
  B: number;
  C: number;
  /** Diskriminante D = B² − 4AC. */
  D: number;
  kind: 'passante' | 'tangent' | 'secant';
  /** Parameterwerte der gemeinsamen Punkte (aufsteigend). */
  ts: number[];
  points: V3[];
  /** Punkt der Geraden, der M am nächsten liegt, und sein Abstand von M. */
  closest: V3;
  tClosest: number;
  dist: number;
};

/**
 * Lage Kugel – Gerade: g in die Kugelgleichung einsetzen,
 * (a⃗ + t·u⃗ − m⃗)² = r² ⇔ (u⃗·u⃗) t² + 2 u⃗·(a⃗ − m⃗) t + (a⃗ − m⃗)² − r² = 0.
 * D < 0: Passante, D = 0: Tangente, D > 0: Sekante. Richtungsvektor o → null.
 */
export function sphereLine(m: V3, r: number, a: V3, u: V3): LineCut | null {
  const A = dot(u, u);
  if (A < 1e-12) return null;
  const w = sub(a, m);
  const B = 2 * dot(u, w);
  const C = dot(w, w) - r * r;
  let D = B * B - 4 * A * C;
  if (Math.abs(D) <= tol(Math.max(B * B, Math.abs(4 * A * C)))) D = 0;
  const tClosest = -B / (2 * A);
  const closest = add(a, scale(u, tClosest));
  const dist = norm(sub(closest, m));
  const at = (t: number) => add(a, scale(u, t));
  if (D < 0) return { A, B, C, D, kind: 'passante', ts: [], points: [], closest, tClosest, dist };
  if (D === 0) return { A, B, C, D, kind: 'tangent', ts: [tClosest], points: [closest], closest, tClosest, dist };
  const s = Math.sqrt(D);
  const t1 = (-B - s) / (2 * A);
  const t2 = (-B + s) / (2 * A);
  return { A, B, C, D, kind: 'secant', ts: [t1, t2], points: [at(t1), at(t2)], closest, tClosest, dist };
}

/* ------------------------------------------------------------------ */
/* Tangentialebene                                                     */
/* ------------------------------------------------------------------ */

/**
 * Tangentialebene in B an die Kugel mit Mittelpunkt M:
 * (x⃗ − b⃗) · (b⃗ − m⃗) = 0, Normalenvektor n⃗ = MB⃗, Koordinatenform n⃗ · x⃗ = n⃗ · b⃗.
 */
export function tangentPlane(m: V3, b: V3): { n: V3; c: number } {
  const n = sub(b, m);
  return { n, c: dot(n, b) };
}

/** Größter gemeinsamer Teiler ganzzahliger Werte (für gekürzte Normalenvektoren). */
export function gcdAll(values: readonly number[]): number {
  const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
  return values.reduce((acc, v) => g(Math.abs(acc), Math.abs(Math.round(v))), 0);
}

/**
 * Ebene n · x = c mit möglichst kleinen ganzzahligen Koeffizienten, falls
 * alle Werte ganzzahlig sind (z. B. (0|0|3) · x = 18 → x₃ = 6); sonst unverändert.
 */
export function reducePlane(n: V3, c: number): { n: V3; c: number } {
  const all = [n[0], n[1], n[2], c];
  if (!all.every((v) => Math.abs(v - Math.round(v)) < 1e-9)) return { n, c };
  const g = gcdAll([n[0], n[1], n[2]]);
  if (g <= 1 || Math.abs(c / g - Math.round(c / g)) > 1e-9) return { n, c };
  return { n: scale(n, 1 / g), c: c / g };
}
