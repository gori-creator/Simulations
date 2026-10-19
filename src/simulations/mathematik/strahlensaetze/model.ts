/**
 * Rechenlogik „Strahlensätze“ (Jahrgangsstufe 9).
 *
 * Zwei Strahlen (bzw. Geraden) mit dem gemeinsamen Punkt Z werden von zwei
 * Geraden geschnitten: auf dem ersten Strahl in A und A′, auf dem zweiten
 * in B und B′. Sind AB und A′B′ parallel, gilt mit dem Faktor k = |ZA′| : |ZA|:
 *
 * 1. Strahlensatz: |ZA′| : |ZA| = |ZB′| : |ZB|
 *    (gleichwertig, nur für die Abschnitte auf den Strahlen:
 *    |ZA| : |AA′| = |ZB| : |BB′|)
 * 2. Strahlensatz: |A′B′| : |AB| = |ZA′| : |ZA| (= |ZB′| : |ZB|)
 *    Achtung: |A′B′| : |AB| ist im Allgemeinen NICHT |AA′| : |ZA|.
 *
 * V-Figur: A′, B′ liegen auf derselben Seite von Z wie A, B (Faktor k > 0).
 * X-Figur: A′, B′ liegen auf der anderen Seite von Z (Faktor k < 0); die
 * Strahlensätze gelten mit den Längen, also mit |k|.
 * Umkehrung des 1. Strahlensatzes: Sind die Verhältnisse |ZA′| : |ZA| und
 * |ZB′| : |ZB| gleich (und liegen A′, B′ auf derselben Seite von Z bzw. beide
 * auf der anderen), dann sind AB und A′B′ parallel.
 * Die Umkehrung des 2. Strahlensatzes gilt nicht: Zu |A′B′| : |AB| = k gibt es
 * auf dem zweiten Strahl im Allgemeinen zwei Punkte B′, nur einer davon
 * liefert eine Parallele.
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
const deg = (r: number) => (r * 180) / Math.PI;

export function dist(p: Pt, q: Pt): number {
  return Math.hypot(q[0] - p[0], q[1] - p[1]);
}

/**
 * Figur aus |ZA| = a, |ZB| = b, Winkel th zwischen den Strahlen, Faktor ka
 * für A′ (A′ = ka·A, zentrische Streckung von Z aus) und kb für B′ (B′ = kb·B).
 * Parallel genau dann, wenn ka = kb. Negative Faktoren ergeben die X-Figur.
 */
export function figure(a: number, b: number, th: number, ka: number, kb: number): Figure {
  const A: Pt = [a * Math.cos(rad(th)), a * Math.sin(rad(th))];
  const B: Pt = [b, 0];
  return { z: [0, 0], a: A, b: B, a2: [ka * A[0], ka * A[1]], b2: [kb * B[0], kb * B[1]] };
}

/** Alle Strecken der Figur (Längen). */
export interface Lengths {
  za: number;
  zb: number;
  za2: number;
  zb2: number;
  ab: number;
  a2b2: number;
  /** Abschnitte zwischen den beiden Schnittpunkten auf einem Strahl */
  aa2: number;
  bb2: number;
}

export function lengths(f: Figure): Lengths {
  return {
    za: dist(f.z, f.a),
    zb: dist(f.z, f.b),
    za2: dist(f.z, f.a2),
    zb2: dist(f.z, f.b2),
    ab: dist(f.a, f.b),
    a2b2: dist(f.a2, f.b2),
    aa2: dist(f.a, f.a2),
    bb2: dist(f.b, f.b2),
  };
}

/** Die drei Verhältnisse |ZA′|/|ZA|, |ZB′|/|ZB| und |A′B′|/|AB|. */
export function ratios(f: Figure): { r1: number; r2: number; r3: number } {
  const L = lengths(f);
  return { r1: L.za2 / L.za, r2: L.zb2 / L.zb, r3: L.a2b2 / L.ab };
}

/**
 * Abschnitte-Form des 1. Strahlensatzes: |ZA| : |AA′| und |ZB| : |BB′|.
 * Bei A′ = A (k = 1) ist der Abschnitt 0 – dann ist das Verhältnis nicht definiert (Infinity).
 */
export function pieceRatios(f: Figure): { pa: number; pb: number } {
  const L = lengths(f);
  return { pa: L.aa2 > 1e-12 ? L.za / L.aa2 : Infinity, pb: L.bb2 > 1e-12 ? L.zb / L.bb2 : Infinity };
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

/**
 * Umkehrung des 1. Strahlensatzes als Rechenregel: Bei gleichen Faktoren
 * (gleiches Vorzeichen, gleicher Betrag) sind AB und A′B′ parallel.
 */
export function parallelByRatios(ka: number, kb: number, tol = 1e-9): boolean {
  return Math.abs(ka - kb) <= tol * Math.max(1, Math.abs(ka), Math.abs(kb));
}

/**
 * Gegenbeispiel zur Umkehrung des 2. Strahlensatzes: Der Kreis um A′ = k·A mit
 * dem Radius |k|·|AB| schneidet die Gerade ZB in B′ = k·B (Parallele) und in
 * einem zweiten Punkt B″ = k·(2·A_x − b | 0) – Spiegelbild von B′ am Lotfußpunkt
 * von A′. Auch dort ist |A′B″| : |AB| = |k|, aber A′B″ ist nicht parallel zu AB.
 * Rückgabe: x-Koordinate von B″ (liegt auf dem Strahl, wenn sie dasselbe
 * Vorzeichen wie k·b hat).
 */
export function counterPointX(a: number, b: number, th: number, k: number): number {
  const ax = a * Math.cos(rad(th));
  return k * (2 * ax - b);
}

/** Innenwinkel eines Dreiecks PQR am Punkt P (Grad). */
export function angleAt(p: Pt, q: Pt, r: Pt): number {
  const u = [q[0] - p[0], q[1] - p[1]];
  const v = [r[0] - p[0], r[1] - p[1]];
  const c = (u[0]! * v[0]! + u[1]! * v[1]!) / (Math.hypot(u[0]!, u[1]!) * Math.hypot(v[0]!, v[1]!));
  return deg(Math.acos(Math.max(-1, Math.min(1, c))));
}

/** Länge |AB| aus |ZA| = a, |ZB| = b und dem Winkel th bei Z (Kosinussatz). */
export function sideAB(a: number, b: number, th: number): number {
  return Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * Math.cos(rad(th))));
}

/** Gibt es ein Dreieck mit den Seiten a, b, c (Dreiecksungleichung, echt)? */
export function validTriangle(a: number, b: number, c: number): boolean {
  return a > 0 && b > 0 && c > 0 && c < a + b && a < b + c && b < a + c;
}

/** Kleinste und größte mögliche Länge |AB| bei |ZA| = a und |ZB| = b (mit etwas Abstand zum entarteten Dreieck). */
export function sideRange(a: number, b: number, margin = 0.05): [number, number] {
  const lo = Math.abs(a - b);
  const hi = a + b;
  const m = Math.min(margin * (hi - lo), 0.25 * (hi - lo));
  return [lo + m, hi - m];
}

/** Winkel bei Z aus den drei Seiten (Kosinussatz), in Grad. */
export function angleFromSides(a: number, b: number, c: number): number {
  const cos = (a * a + b * b - c * c) / (2 * a * b);
  return deg(Math.acos(Math.max(-1, Math.min(1, cos))));
}

/* ------------------------------------------------------------------ */
/* Rechenmodus: unbekannte Strecke x                                    */
/* ------------------------------------------------------------------ */

/** Namen der Strecken (für Anzeige und Aufgaben). */
export type SegKey = keyof Lengths;

/** Welche Strecke ist gesucht? */
export type Ask = 'zb2' | 'bb2' | 'a2b2' | 'ab' | 'zb';

/**
 * Verhältnisgleichung, so aufgestellt, dass die Unbekannte im Zähler links steht:
 *   x : den1 = num2 : den2   ⇒   x = num2 · den1 : den2
 */
export interface TaskSpec {
  /** gesuchte Strecke */
  x: SegKey;
  den1: SegKey;
  num2: SegKey;
  den2: SegKey;
  /** Welcher Satz liefert die Gleichung? */
  theorem: 1 | 2;
  /** Abschnitte-Form des 1. Strahlensatzes? */
  pieces: boolean;
}

export const TASKS: Record<Ask, TaskSpec> = {
  zb2: { x: 'zb2', den1: 'zb', num2: 'za2', den2: 'za', theorem: 1, pieces: false },
  bb2: { x: 'bb2', den1: 'zb', num2: 'aa2', den2: 'za', theorem: 1, pieces: true },
  a2b2: { x: 'a2b2', den1: 'ab', num2: 'za2', den2: 'za', theorem: 2, pieces: false },
  ab: { x: 'ab', den1: 'a2b2', num2: 'zb', den2: 'zb2', theorem: 2, pieces: false },
  zb: { x: 'zb', den1: 'zb2', num2: 'za', den2: 'za2', theorem: 1, pieces: false },
};

/** Löst x : d1 = n2 : d2 nach x auf. */
export function solveProportion(d1: number, n2: number, d2: number): number {
  return (n2 * d1) / d2;
}

/**
 * Figur des Rechenmodus aus drei Seiten des Dreiecks ZAB (|ZA| = a, |ZB| = b,
 * |AB| = c) und dem Faktor k; xFig = true legt A′, B′ auf die andere Seite von Z.
 * Ist das Dreieck nicht möglich, wird c in den gültigen Bereich gelegt.
 */
export function taskFigure(a: number, b: number, c: number, k: number, xFig: boolean): Figure {
  const [lo, hi] = sideRange(a, b);
  const cc = Math.max(lo, Math.min(hi, c));
  const s = xFig ? -k : k;
  return figure(a, b, angleFromSides(a, b, cc), s, s);
}

/** Gegebene Werte und Lösung einer Aufgabe. */
export function solveTask(ask: Ask, f: Figure): { spec: TaskSpec; d1: number; n2: number; d2: number; x: number; exact: number } {
  const spec = TASKS[ask];
  const L = lengths(f);
  const d1 = L[spec.den1];
  const n2 = L[spec.num2];
  const d2 = L[spec.den2];
  return { spec, d1, n2, d2, x: solveProportion(d1, n2, d2), exact: L[spec.x] };
}

/* ------------------------------------------------------------------ */
/* Anwendung: Baumhöhe über den Schatten                               */
/* ------------------------------------------------------------------ */

/**
 * Sonnenstrahlen sind (nahezu) parallel. Stellt man einen Stab (Höhe s) so auf,
 * dass die Schattenspitzen von Stab und Baum im Punkt Z zusammenfallen, gilt
 * nach dem 2. Strahlensatz: Baumhöhe : s = |ZB′| : |ZB|
 * (B Fußpunkt des Stabs, B′ Fußpunkt des Baums).
 * Die Funktion liefert die Schattenlängen bei der Sonnenhöhe elevDeg.
 */
export function shadowLengths(height: number, stick: number, elevDeg: number): { dStick: number; dTree: number } {
  const t = Math.tan(rad(elevDeg));
  return { dStick: stick / t, dTree: height / t };
}

/** Baumhöhe aus den gemessenen Größen (2. Strahlensatz). */
export function treeHeight(stick: number, dStick: number, dTree: number): number {
  return (stick * dTree) / dStick;
}

/** Sonnenhöhe (Grad), bei der ein Stab der Höhe s einen Schatten der Länge d wirft. */
export function sunElevation(stick: number, shadow: number): number {
  return deg(Math.atan2(stick, shadow));
}

/** Auf Zentimeter gerundet, wie mit dem Maßband gemessen. */
export function measureCm(v: number): number {
  return Math.round(v * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Anwendung: Teichbreite mit der X-Figur                              */
/* ------------------------------------------------------------------ */

/**
 * A und B liegen an gegenüberliegenden Ufern. Man peilt von A über Z und
 * von B über Z und steckt A′ und B′ so ab, dass |ZA′| = |ZA| : k und
 * |ZB′| = |ZB| : k. Nach der Umkehrung des 1. Strahlensatzes ist A′B′
 * parallel zu AB, nach dem 2. Strahlensatz gilt |AB| = k · |A′B′|.
 */
export function pondWidth(k: number, measured: number): number {
  return k * measured;
}

/** Lage der Punkte beim Teich (Draufsicht, Meter): A und B an den Ufern, Z auf dem Land. */
export function pondGeometry(w: number, k: number): { A: Pt; B: Pt; Z: Pt; A2: Pt; B2: Pt } {
  const A: Pt = [0, 0];
  const B: Pt = [w, 0];
  const Z: Pt = [w * 0.42, -w * 0.62];
  const A2: Pt = [Z[0] + (Z[0] - A[0]) / k, Z[1] + (Z[1] - A[1]) / k];
  const B2: Pt = [Z[0] + (Z[0] - B[0]) / k, Z[1] + (Z[1] - B[1]) / k];
  return { A, B, Z, A2, B2 };
}
