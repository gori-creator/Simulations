/**
 * Rechenlogik für „Punkte und Körper im räumlichen Koordinatensystem“:
 * Lage eines Punktes (auf einer Achse, in einer Koordinatenebene, Oktant),
 * Projektionen in die Koordinatenebenen, Abstand vom Ursprung, Eckpunkte und
 * Kennwerte eines achsenparallelen Quaders. Keine Zeichenbefehle.
 *
 * Koordinaten wie im Unterricht: x₁ schräg nach vorn, x₂ nach rechts, x₃ nach oben.
 */

export type P3 = readonly [number, number, number];

const EPS = 1e-9;
const isZero = (v: number) => Math.abs(v) < EPS;

/** Abstand vom Ursprung |OP| = √(x₁² + x₂² + x₃²). */
export function distOrigin(p: P3): number {
  return Math.hypot(p[0], p[1], p[2]);
}

/** Abstand zweier Punkte. */
export function dist(a: P3, b: P3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export type Where =
  | { kind: 'origin' }
  | { kind: 'axis'; axis: 1 | 2 | 3 }
  | { kind: 'plane'; plane: 12 | 13 | 23 }
  | { kind: 'octant'; octant: number };

/**
 * Lage eines Punktes: Ursprung, auf einer Achse (zwei Koordinaten 0), in einer
 * Koordinatenebene (eine Koordinate 0) oder in einem Oktanten (I–VIII).
 */
export function where(p: P3): Where {
  const zeros = p.map(isZero);
  const n = zeros.filter(Boolean).length;
  if (n === 3) return { kind: 'origin' };
  if (n === 2) return { kind: 'axis', axis: (zeros.indexOf(false) + 1) as 1 | 2 | 3 };
  if (n === 1) {
    const z = zeros.indexOf(true);
    return { kind: 'plane', plane: z === 0 ? 23 : z === 1 ? 13 : 12 };
  }
  return { kind: 'octant', octant: octant(p) };
}

/**
 * Oktant (I–VIII als Zahl 1–8): oben (x₃ > 0) die Oktanten I–IV wie die
 * Quadranten der x₁x₂-Ebene gegen den Uhrzeigersinn, unten V–VIII darunter.
 * Liegt der Punkt in einer Koordinatenebene, ist das Ergebnis 0.
 */
export function octant(p: P3): number {
  const [x, y, z] = p;
  if (isZero(x) || isZero(y) || isZero(z)) return 0;
  const q = x > 0 ? (y > 0 ? 1 : 4) : y > 0 ? 2 : 3;
  return z > 0 ? q : q + 4;
}

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Senkrechte Projektionen in die drei Koordinatenebenen. */
export function projections(p: P3): { p12: P3; p13: P3; p23: P3 } {
  return { p12: [p[0], p[1], 0], p13: [p[0], 0, p[2]], p23: [0, p[1], p[2]] };
}

/** Spiegelpunkte am Ursprung, an den Koordinatenebenen und den Achsen. */
export function mirrors(p: P3): Record<'o' | 'e12' | 'e13' | 'e23' | 'a1' | 'a2' | 'a3', P3> {
  const [x, y, z] = p;
  return {
    o: [-x, -y, -z],
    e12: [x, y, -z],
    e13: [x, -y, z],
    e23: [-x, y, z],
    a1: [x, -y, -z],
    a2: [-x, y, -z],
    a3: [-x, -y, z],
  };
}

/** Koordinatenweg vom Ursprung: erst x₁, dann x₂, dann x₃. */
export function walk(p: P3): P3[] {
  return [
    [0, 0, 0],
    [p[0], 0, 0],
    [p[0], p[1], 0],
    [p[0], p[1], p[2]],
  ];
}

/** Punkt auf dem Koordinatenweg bei Fortschritt s ∈ [0, 3] (je Abschnitt 1). */
export function walkAt(p: P3, s: number): P3 {
  const w = walk(p);
  const k = Math.max(0, Math.min(2, Math.floor(s)));
  const t = Math.max(0, Math.min(1, s - k));
  const a = w[k]!;
  const b = w[k + 1]!;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/* ------------------------------------------------------------------ */
/* Quader                                                              */
/* ------------------------------------------------------------------ */

export const CORNER_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

/**
 * Eckpunkte des achsenparallelen Quaders mit Ecke A und Kantenlängen a (in
 * x₁-Richtung), b (x₂) und c (x₃). Grundfläche ABCD gegen den Uhrzeigersinn
 * (von oben gesehen), Deckfläche EFGH darüber (E über A usw.).
 */
export function boxCorners(A: P3, a: number, b: number, c: number): P3[] {
  const [x, y, z] = A;
  const base: P3[] = [
    [x, y, z],
    [x + a, y, z],
    [x + a, y + b, z],
    [x, y + b, z],
  ];
  return [...base, ...base.map((q) => [q[0], q[1], q[2] + c] as P3)];
}

/** Kanten des Quaders als Paare von Eckenindizes (Grundfläche, Deckfläche, senkrechte Kanten). */
export const BOX_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

/** Flächen des Quaders (Ecken gegen den Uhrzeigersinn von außen gesehen). */
export const BOX_FACES: readonly (readonly number[])[] = [
  [0, 3, 2, 1], // unten
  [4, 5, 6, 7], // oben
  [0, 1, 5, 4], // x₂ = y (links)
  [2, 3, 7, 6], // x₂ = y + b (rechts)
  [1, 2, 6, 5], // x₁ = x + a (vorn)
  [3, 0, 4, 7], // x₁ = x (hinten)
];

export function boxVolume(a: number, b: number, c: number): number {
  return a * b * c;
}

export function boxSurface(a: number, b: number, c: number): number {
  return 2 * (a * b + a * c + b * c);
}

/** Länge der Raumdiagonale √(a² + b² + c²). */
export function spaceDiagonal(a: number, b: number, c: number): number {
  return Math.hypot(a, b, c);
}

/** Mittelpunkt des Quaders (Schnittpunkt der Raumdiagonalen). */
export function boxCenter(A: P3, a: number, b: number, c: number): P3 {
  return [A[0] + a / 2, A[1] + b / 2, A[2] + c / 2];
}

/**
 * Wie viele Ecken des Quaders liegen genau auf einer Koordinatenachse bzw.
 * in einer Koordinatenebene? (Für Aufgaben „Welche Ecken liegen …?“)
 */
export function cornersOnPlanes(corners: readonly P3[]): { axis: number[]; plane: number[] } {
  const axis: number[] = [];
  const plane: number[] = [];
  corners.forEach((q, i) => {
    const w = where(q);
    if (w.kind === 'axis' || w.kind === 'origin') axis.push(i);
    if (w.kind === 'plane' || w.kind === 'axis' || w.kind === 'origin') plane.push(i);
  });
  return { axis, plane };
}

/** Kleiner deterministischer Zufallsgenerator (für „Neuer Punkt“). */
export function pseudoRandom(seed: number): number {
  const u = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return u - Math.floor(u);
}

/** Zufälliger Punkt mit ganzzahligen Koordinaten in [−r, r], nicht im Ursprung. */
export function randomPoint(seed: number, r = 4): P3 {
  const c = (k: number) => Math.round(pseudoRandom(seed * 3 + k) * 2 * r - r);
  let p: P3 = [c(0), c(1), c(2)];
  if (p.every(isZero)) p = [2, 3, 1];
  return p;
}
