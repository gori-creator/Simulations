/**
 * Rechenlogik für „Skalarprodukt und Vektorprodukt“: Skalarprodukt,
 * Winkel zwischen Vektoren, Orthogonalität, Projektion, Vektorprodukt mit
 * Parallelogramm- und Dreiecksfläche, Spatprodukt mit Volumen von Spat und
 * Pyramide. Keine Zeichenbefehle.
 */

export type V3 = readonly [number, number, number];

export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** Vektorprodukt a × b = (a₂b₃ − a₃b₂, a₃b₁ − a₁b₃, a₁b₂ − a₂b₁). */
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Einzelne Produkte für die Rechnung „über Kreuz“ (je Komponente: Minuend, Subtrahend). */
export function crossTerms(a: V3, b: V3): [number, number][] {
  return [
    [a[1] * b[2], a[2] * b[1]],
    [a[2] * b[0], a[0] * b[2]],
    [a[0] * b[1], a[1] * b[0]],
  ];
}

/**
 * Winkel zwischen a und b in Grad (0° … 180°) aus cos φ = a·b / (|a|·|b|).
 * Null bei einem Nullvektor (Winkel nicht definiert → NaN).
 */
export function angleDeg(a: V3, b: V3): number {
  const l = norm(a) * norm(b);
  if (l < 1e-12) return NaN;
  const c = Math.max(-1, Math.min(1, dot(a, b) / l));
  return (Math.acos(c) * 180) / Math.PI;
}

/** Wahr, wenn v auf `d` Nachkommastellen genau dargestellt werden kann (dann „=“ statt „≈“). */
export const exactTo = (v: number, d = 2): boolean => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

/**
 * Betrag für die Anzeige: als Zahl, wenn er exakt ist (|(2, 2, 1)| = 3),
 * als Wurzel, wenn das Betragsquadrat exakt ist (|(1, 2, 0)| = √5), sonst gerundet.
 */
export function normForm(v: V3): { kind: 'num' | 'root' | 'approx'; value: number; sq: number } {
  const sq = dot(v, v);
  const value = Math.sqrt(sq);
  if (exactTo(value)) return { kind: 'num', value, sq };
  return { kind: exactTo(sq) ? 'root' : 'approx', value, sq };
}

export const orthogonal = (a: V3, b: V3, eps = 1e-9): boolean => Math.abs(dot(a, b)) < eps;

/** Senkrechte Projektion von b auf die Richtung von a: (a·b / |a|²) · a. */
export function projection(b: V3, a: V3): V3 {
  const aa = dot(a, a);
  return aa < 1e-12 ? [0, 0, 0] : scale(a, dot(a, b) / aa);
}

/** Vorzeichenbehaftete Länge der Projektion von b auf a: a·b / |a|. */
export function projLength(b: V3, a: V3): number {
  const l = norm(a);
  return l < 1e-12 ? 0 : dot(a, b) / l;
}

/** Fläche des von a und b aufgespannten Parallelogramms |a × b| (= |a|·|b|·sin φ). */
export const parallelogramArea = (a: V3, b: V3): number => norm(cross(a, b));

/** Fläche des Dreiecks mit den Seiten a und b: ½ |a × b|. */
export const triangleArea = (a: V3, b: V3): number => parallelogramArea(a, b) / 2;

/** Spatprodukt (a × b) · c. */
export const triple = (a: V3, b: V3, c: V3): number => dot(cross(a, b), c);

/** Volumen des Spats |(a × b) · c|. */
export const spatVolume = (a: V3, b: V3, c: V3): number => Math.abs(triple(a, b, c));

/** Volumen der dreiseitigen Pyramide (Tetraeder) mit den Kanten a, b, c: ⅙ |(a × b) · c|. */
export const pyramidVolume = (a: V3, b: V3, c: V3): number => spatVolume(a, b, c) / 6;

/**
 * Bildet a, b, c ein Rechtssystem (Spatprodukt > 0), Linkssystem (< 0) oder
 * liegen sie in einer Ebene (= 0)?
 */
export function handedness(a: V3, b: V3, c: V3, eps = 1e-9): 'right' | 'left' | 'flat' {
  const t = triple(a, b, c);
  return t > eps ? 'right' : t < -eps ? 'left' : 'flat';
}

/* ---------------- Erweiterungen für die Ansichten ---------------- */

/** Anteil von b senkrecht zu a: b − Projektion von b auf a. */
export const perpPart = (b: V3, a: V3): V3 => sub(b, projection(b, a));

/** Einheitsvektor in Richtung a (Nullvektor bleibt Nullvektor). */
export function unit(a: V3): V3 {
  const l = norm(a);
  return l < 1e-12 ? [0, 0, 0] : scale(a, 1 / l);
}

/**
 * Irgendein Einheitsvektor senkrecht zu a – bevorzugt in Richtung des
 * Anteils von `ref` senkrecht zu a, sonst senkrecht zur Koordinatenachse,
 * zu der a am wenigsten parallel ist.
 */
export function perpUnit(a: V3, ref: V3): V3 {
  const r = perpPart(ref, a);
  if (norm(r) > 1e-9) return unit(r);
  const e = unit(a);
  const ax: V3 = Math.abs(e[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return unit(cross(cross(e, ax), e));
}

/**
 * Vektor der Länge `len`, der mit a den Winkel φ (Grad) einschließt und in der
 * Ebene liegt, die a und `ref` aufspannen: len · (cos φ · â + sin φ · û).
 */
export function rotateFrom(a: V3, ref: V3, phiDeg: number, len: number): V3 {
  const e = unit(a);
  const u = perpUnit(a, ref);
  const t = (phiDeg * Math.PI) / 180;
  return add(scale(e, len * Math.cos(t)), scale(u, len * Math.sin(t)));
}

/** Winkel (Grad, 0 … 180) eines Punktes q in der Ebene aus a und `ref`, gemessen von a aus. */
export function angleInPlane(a: V3, ref: V3, q: V3): number {
  const e = unit(a);
  const u = perpUnit(a, ref);
  const t = Math.atan2(Math.abs(dot(q, u)), dot(q, e));
  return (t * 180) / Math.PI;
}

/** Skalarprodukt und Parallelogrammfläche für Längen |a|, |b| und Winkel φ (Grad). */
export function dotAndArea(la: number, lb: number, phiDeg: number): { dot: number; area: number } {
  const t = (phiDeg * Math.PI) / 180;
  return { dot: la * lb * Math.cos(t), area: la * lb * Math.sin(t) };
}

/** Summanden des Skalarprodukts a₁b₁, a₂b₂, a₃b₃. */
export const contributions = (a: V3, b: V3): V3 => [a[0] * b[0], a[1] * b[1], a[2] * b[2]];

/** Lage zweier Vektoren zueinander. */
export type Relation = 'zero' | 'parallel' | 'antiparallel' | 'perpendicular' | 'acute' | 'obtuse';

export function relation(a: V3, b: V3, eps = 1e-9): Relation {
  if (norm(a) < eps || norm(b) < eps) return 'zero';
  if (norm(cross(a, b)) < eps * Math.max(1, norm(a) * norm(b))) return dot(a, b) > 0 ? 'parallel' : 'antiparallel';
  const d = dot(a, b);
  if (Math.abs(d) < eps) return 'perpendicular';
  return d > 0 ? 'acute' : 'obtuse';
}

/**
 * Schema „über Kreuz“: Komponente k des Vektorprodukts nutzt die Zeilen
 * k + 1 und k + 2 (zyklisch). Liefert je Komponente die beiden Zeilen
 * (0-basiert) und die beiden Produkte.
 */
export function crossScheme(a: V3, b: V3): { rows: [number, number]; plus: number; minus: number; value: number }[] {
  return [0, 1, 2].map((k) => {
    const i = (k + 1) % 3;
    const j = (k + 2) % 3;
    const plus = a[i]! * b[j]!;
    const minus = a[j]! * b[i]!;
    return { rows: [i, j], plus, minus, value: plus - minus };
  });
}

/** Höhenvektor des Spats: Projektion von c auf a × b (Länge = Höhe über der Grundfläche). */
export function spatHeight(a: V3, b: V3, c: V3): V3 {
  return projection(c, cross(a, b));
}

/**
 * Scherung nach Cavalieri: c wird parallel zur Grundfläche verschoben, bis es
 * senkrecht steht (t = 1). Grundfläche und Höhe bleiben, das Volumen auch.
 */
export function shearC(a: V3, b: V3, c: V3, t: number): V3 {
  const h = spatHeight(a, b, c);
  if (norm(cross(a, b)) < 1e-12) return c;
  return add(scale(c, 1 - t), scale(h, t));
}

/* ---------------- Entdeckungsaufgaben ---------------- */

export type TaskId = 'perp' | 'angle' | 'area' | 'vol' | 'flat';

export interface TaskDef {
  /** Fest vorgegebene Vektoren (der gesuchte ist `free`). */
  a: V3;
  b?: V3;
  free: 'b' | 'c';
  /** Startwert für den gesuchten Vektor. */
  start: V3;
  /** Zielgröße und ihr Wert. */
  target: number;
  /** Erlaubte Abweichung. */
  tol: number;
}

export const TASKS: Record<TaskId, TaskDef> = {
  perp: { a: [2, 1, 0], free: 'b', start: [1, 1, 2], target: 0, tol: 1e-9 },
  angle: { a: [1, 1, 0], free: 'b', start: [1, 0, 1], target: 120, tol: 0.05 },
  area: { a: [2, 0, 0], free: 'b', start: [1, 1, 1], target: 6, tol: 1e-9 },
  vol: { a: [2, 0, 0], b: [0, 3, 0], free: 'c', start: [1, 1, 1], target: 12, tol: 1e-9 },
  flat: { a: [1, 0, 1], b: [0, 1, 1], free: 'c', start: [1, 1, 1], target: 0, tol: 1e-9 },
};

/** Aktueller Wert der Zielgröße einer Aufgabe für den gesuchten Vektor v. */
export function taskValue(id: TaskId, v: V3): number {
  const t = TASKS[id];
  switch (id) {
    case 'perp':
      return dot(t.a, v);
    case 'angle':
      return angleDeg(t.a, v);
    case 'area':
      return parallelogramArea(t.a, v);
    case 'vol':
      return spatVolume(t.a, t.b!, v);
    case 'flat':
      return triple(t.a, t.b!, v);
  }
}

/**
 * Löst v die Aufgabe? Der Nullvektor zählt nie (er wäre eine „billige“ Lösung),
 * bei „flach“ auch kein bloßes Vielfaches von a oder b – gesucht ist ein
 * echter dritter Vektor in der Ebene.
 */
export function taskSolved(id: TaskId, v: V3): boolean {
  const t = TASKS[id];
  if (norm(v) < 1e-9) return false;
  const val = taskValue(id, v);
  if (!Number.isFinite(val)) return false;
  if (id === 'flat' && (norm(cross(t.a, v)) < 1e-9 || norm(cross(t.b!, v)) < 1e-9)) return false;
  return Math.abs(val - t.target) <= t.tol;
}

/** Wie weit ist v vom Ziel entfernt? 0 = getroffen, 1 = weit weg (für eine Anzeige „warm/kalt“). */
export function taskCloseness(id: TaskId, v: V3): number {
  const t = TASKS[id];
  const val = taskValue(id, v);
  if (!Number.isFinite(val)) return 1;
  const span = id === 'angle' ? 90 : id === 'vol' ? 24 : id === 'area' ? 12 : id === 'flat' ? 12 : 8;
  return Math.min(1, Math.abs(val - t.target) / span);
}

/** Ist v schon unter den gefundenen Lösungen? */
export const hasSolution = (list: readonly V3[], v: V3): boolean => list.some((q) => norm(sub(q, v)) < 1e-9);
