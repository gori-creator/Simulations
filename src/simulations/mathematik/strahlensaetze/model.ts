/**
 * Rechenlogik „Strahlensätze“ (Jahrgangsstufe 9).
 *
 * Zwei Strahlen (bzw. Geraden) mit dem gemeinsamen Punkt Z werden von zwei
 * Parallelen geschnitten: auf dem ersten Strahl in A und A′, auf dem zweiten
 * in B und B′. Dann gilt (k = Streckfaktor):
 *
 * 1. Strahlensatz: |ZA′| : |ZA| = |ZB′| : |ZB|   (= |k|)
 *    (gleichwertig: |ZA| : |AA′| = |ZB| : |BB′| bei der V-Figur)
 * 2. Strahlensatz: |A′B′| : |AB| = |ZA′| : |ZA|
 *
 * V-Figur: A′, B′ liegen auf derselben Seite von Z wie A, B (k > 0).
 * X-Figur: A′, B′ liegen auf der anderen Seite von Z (k < 0).
 * Umkehrung des 1. Strahlensatzes: Sind die Verhältnisse gleich, sind AB und
 * A′B′ parallel. (Die Umkehrung des 2. Strahlensatzes gilt nicht allgemein.)
 *
 * Koordinaten: Z = (0 | 0), erster Strahl unter dem Winkel th (Grad) zur
 * x-Achse, zweiter Strahl entlang der positiven x-Achse.
 */

export type Pt = readonly [number, number];

export interface Figure {
  z: Pt;
  a: Pt;
  b: Pt;
  a2: Pt;
  b2: Pt;
}

const rad = (d: number) => (d * Math.PI) / 180;

export function dist(p: Pt, q: Pt): number {
  return Math.hypot(q[0] - p[0], q[1] - p[1]);
}

/**
 * Figur aus |ZA| = a, |ZB| = b, Winkel th zwischen den Strahlen, Faktor ka
 * für A′ (A′ = ka·A) und kb für B′ (B′ = kb·B). Parallel genau dann, wenn
 * ka = kb. Negative Faktoren ergeben die X-Figur.
 */
export function figure(a: number, b: number, th: number, ka: number, kb: number): Figure {
  const A: Pt = [a * Math.cos(rad(th)), a * Math.sin(rad(th))];
  const B: Pt = [b, 0];
  return { z: [0, 0], a: A, b: B, a2: [ka * A[0], ka * A[1]], b2: [kb * B[0], kb * B[1]] };
}

/** Die drei Verhältnisse |ZA′|/|ZA|, |ZB′|/|ZB| und |A′B′|/|AB|. */
export function ratios(f: Figure): { r1: number; r2: number; r3: number } {
  return { r1: dist(f.z, f.a2) / dist(f.z, f.a), r2: dist(f.z, f.b2) / dist(f.z, f.b), r3: dist(f.a2, f.b2) / dist(f.a, f.b) };
}

/** Sind AB und A′B′ parallel (Kreuzprodukt der Richtungen ≈ 0)? */
export function parallel(f: Figure, tol = 1e-9): boolean {
  const u = [f.b[0] - f.a[0], f.b[1] - f.a[1]];
  const v = [f.b2[0] - f.a2[0], f.b2[1] - f.a2[1]];
  const cr = u[0]! * v[1]! - u[1]! * v[0]!;
  return Math.abs(cr) <= tol * Math.hypot(u[0]!, u[1]!) * Math.hypot(v[0]!, v[1]!);
}

/** Winkel zwischen AB und A′B′ in Grad (0 = parallel). */
export function angleBetween(f: Figure): number {
  const u = Math.atan2(f.b[1] - f.a[1], f.b[0] - f.a[0]);
  const v = Math.atan2(f.b2[1] - f.a2[1], f.b2[0] - f.a2[0]);
  let d = Math.abs(((v - u) * 180) / Math.PI) % 180;
  if (d > 90) d = 180 - d;
  return d;
}

/* ------------------------------------------------------------------ */
/* Anwendung: Baumhöhe über den Schatten                               */
/* ------------------------------------------------------------------ */

/**
 * Sonnenstrahlen sind parallel. Stellt man einen Stab (Höhe s) so auf, dass
 * die Schattenspitzen von Stab und Baum im Punkt Z zusammenfallen, gilt nach
 * dem 2. Strahlensatz: Baumhöhe / s = (Abstand Z–Baum) / (Abstand Z–Stab).
 */
export function shadowLengths(height: number, stick: number, elevDeg: number): { dStick: number; dTree: number } {
  const t = Math.tan(rad(elevDeg));
  return { dStick: stick / t, dTree: height / t };
}

/** Baumhöhe aus den gemessenen Größen (2. Strahlensatz). */
export function treeHeight(stick: number, dStick: number, dTree: number): number {
  return (stick * dTree) / dStick;
}

/* ------------------------------------------------------------------ */
/* Anwendung: Teichbreite mit der X-Figur                              */
/* ------------------------------------------------------------------ */

/**
 * A und B liegen an gegenüberliegenden Ufern. Man peilt von A über Z und
 * von B über Z und steckt A′ und B′ so ab, dass |ZA′| = |ZA| : k und
 * |ZB′| = |ZB| : k. Dann ist A′B′ parallel zu AB und |AB| = k · |A′B′|.
 */
export function pondWidth(k: number, measured: number): number {
  return k * measured;
}
