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

/* ------------------------------------------------------------------ */
/* Abstand zweier Punkte mit zweimal Pythagoras                       */
/* ------------------------------------------------------------------ */

/** Differenzen der Koordinaten Q − P. */
export function deltas(P: P3, Q: P3): P3 {
  return [Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]];
}

/**
 * Abstand in zwei Schritten: erst in der waagerechten Ebene durch P
 * (d₁₂ = √(Δx₁² + Δx₂²)), dann mit der Höhe (d = √(d₁₂² + Δx₃²)).
 * `corner` ist der Hilfspunkt H(q₁ | q₂ | p₃) mit dem rechten Winkel.
 */
export function distSteps(P: P3, Q: P3): { d12: number; d: number; corner: P3; sq: number } {
  const [a, b, c] = deltas(P, Q);
  const d12 = Math.hypot(a, b);
  return { d12, d: Math.hypot(d12, c), corner: [Q[0], Q[1], P[2]], sq: a * a + b * b + c * c };
}

/** Flächendiagonale der Grundfläche √(a² + b²). */
export function faceDiagonal(a: number, b: number): number {
  return Math.hypot(a, b);
}

/** Spiegelpunkt nach Wahl: am Ursprung oder an einer Koordinatenebene. */
export function mirrorOf(p: P3, kind: 'o' | 'e12' | 'e13' | 'e23'): P3 {
  return mirrors(p)[kind];
}

/** Stimmen zwei Punkte (bis auf Rundung) überein? Je Koordinate. */
export function matches(a: P3, b: P3, eps = 1e-6): [boolean, boolean, boolean] {
  return [Math.abs(a[0] - b[0]) < eps, Math.abs(a[1] - b[1]) < eps, Math.abs(a[2] - b[2]) < eps];
}

/* ------------------------------------------------------------------ */
/* Oktanten: Vorzeichen, Punkt hineinspiegeln, Zufallspunkte zählen    */
/* ------------------------------------------------------------------ */

/** Vorzeichen der Koordinaten im Oktanten n (1–8). */
export function octantSigns(n: number): [number, number, number] {
  const q = ((n - 1) % 4) + 1;
  const sx = q === 1 || q === 4 ? 1 : -1;
  const sy = q === 1 || q === 2 ? 1 : -1;
  const sz = n <= 4 ? 1 : -1;
  return [sx, sy, sz];
}

/**
 * Punkt in den Oktanten n bringen: Beträge bleiben, die Vorzeichen werden
 * angepasst (eine Koordinate 0 wird zu ±1, sonst läge der Punkt auf einer Ebene).
 */
export function intoOctant(p: P3, n: number): P3 {
  const s = octantSigns(n);
  return [0, 1, 2].map((k) => s[k]! * (isZero(p[k]!) ? 1 : Math.abs(p[k]!))) as unknown as P3;
}

/** Wie viele Punkte liegen in welchem Oktanten? Index 0 = auf einer Koordinatenebene. */
export function octantCounts(points: readonly P3[]): number[] {
  const c = new Array<number>(9).fill(0);
  for (const q of points) c[octant(q)]!++;
  return c;
}

/**
 * Zufallspunkt auf dem Halbschritt-Gitter im Würfel [−r, r]³ (jede der
 * 4r + 1 Stufen gleich wahrscheinlich, also auch die 0).
 */
export function gridRandom(u: () => number, r = 4): P3 {
  const n = 4 * r + 1;
  const c = () => Math.floor(u() * n) / 2 - r;
  return [c(), c(), c()];
}

/** Wahrscheinlichkeit, dass ein solcher Gitterpunkt auf keiner Koordinatenebene liegt. */
export function pInsideOctant(r = 4): number {
  const n = 4 * r + 1;
  return ((n - 1) / n) ** 3;
}

/* ------------------------------------------------------------------ */
/* Dreitafelprojektion: Grundriss, Aufriss, Seitenriss                */
/* ------------------------------------------------------------------ */

/**
 * Die drei Risse eines Punktes als ebene Koordinatenpaare:
 * Grundriss (von oben) (x₁ | x₂), Aufriss (von vorn) (x₂ | x₃),
 * Seitenriss (von der Seite) (x₁ | x₃).
 */
export function risse(p: P3): { grund: [number, number]; auf: [number, number]; seit: [number, number] } {
  return { grund: [p[0], p[1]], auf: [p[1], p[2]], seit: [p[0], p[2]] };
}

/**
 * Punkt aus Grundriss (x₁ | x₂) und Aufriss (x₂ | x₃) zurückgewinnen. Beide
 * Risse enthalten x₂ – stimmt es nicht überein, passen die Risse nicht
 * zusammen (null).
 */
export function fromRisse(grund: readonly [number, number], auf: readonly [number, number], eps = 1e-9): P3 | null {
  if (Math.abs(grund[1] - auf[0]) > eps) return null;
  return [grund[0], grund[1], auf[1]];
}

/** Welche Risse von p stimmen mit denen von t überein? */
export function rissMatch(p: P3, t: P3, eps = 1e-6): { grund: boolean; auf: boolean; seit: boolean } {
  const ok = (a: readonly number[], b: readonly number[]) => Math.abs(a[0]! - b[0]!) < eps && Math.abs(a[1]! - b[1]!) < eps;
  const rp = risse(p);
  const rt = risse(t);
  return { grund: ok(rp.grund, rt.grund), auf: ok(rp.auf, rt.auf), seit: ok(rp.seit, rt.seit) };
}

/** Einfache Körper für die Risse: Ecken und Kanten. */
export interface Figure {
  points: P3[];
  edges: (readonly [number, number])[];
  names: string[];
}

export const FIGURES: Record<'house' | 'pyr', Figure> = {
  // Haus: Quader 2 × 3 × 2 mit Satteldach (First in x₂-Richtung, Höhe 3), etwas vom Ursprung abgerückt
  house: {
    points: [
      [1, 1, 0],
      [3, 1, 0],
      [3, 4, 0],
      [1, 4, 0],
      [1, 1, 2],
      [3, 1, 2],
      [3, 4, 2],
      [1, 4, 2],
      [2, 1, 3],
      [2, 4, 3],
    ],
    edges: [
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
      [4, 8],
      [5, 8],
      [7, 9],
      [6, 9],
      [8, 9],
    ],
    names: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'S', 'T'],
  },
  // quadratische Pyramide mit Grundseite 3 und Spitze S(2,5 | 2,5 | 3)
  pyr: {
    points: [
      [1, 1, 0],
      [4, 1, 0],
      [4, 4, 0],
      [1, 4, 0],
      [2.5, 2.5, 3],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 4],
      [1, 4],
      [2, 4],
      [3, 4],
    ],
    names: ['A', 'B', 'C', 'D', 'S'],
  },
};
