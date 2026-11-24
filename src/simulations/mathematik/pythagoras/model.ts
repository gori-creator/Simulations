/**
 * Rechenlogik „Satz des Pythagoras“: Ergänzungsbeweis mit vier
 * kongruenten Dreiecken im Quadrat der Seitenlänge a + b.
 *
 * Jedes Dreieck ist als [R, A, B] gegeben: R = rechter Winkel,
 * A = Ende der Kathete a, B = Ende der Kathete b. Beide Anordnungen
 * haben dieselbe Orientierung, daher gibt es zu jedem Dreieck eine
 * Drehung + Verschiebung von Anordnung 1 nach Anordnung 2.
 */
export type Point = readonly [number, number];
export type Triangle = readonly [Point, Point, Point];

/** Anordnung 1: Die Dreiecke liegen in den Ecken, in der Mitte bleibt c². */
export function arrangementC(a: number, b: number): Triangle[] {
  const s = a + b;
  return [
    [[0, 0], [a, 0], [0, b]],
    [[s, 0], [s, a], [a, 0]],
    [[s, s], [b, s], [s, a]],
    [[0, s], [0, b], [b, s]],
  ];
}

/** Anordnung 2: Die Dreiecke bilden zwei Rechtecke, frei bleiben a² und b². */
export function arrangementAB(a: number, b: number): Triangle[] {
  const s = a + b;
  return [
    [[a, a], [a, 0], [s, a]],
    [[s, 0], [s, a], [a, 0]],
    [[a, s], [0, s], [a, a]],
    [[0, a], [a, a], [0, s]],
  ];
}

function centroid(t: Triangle): [number, number] {
  return [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
}

function direction(t: Triangle): number {
  return Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
}

/** Dreieck auf dem Weg von `from` nach `to` (starre Bewegung), Fortschritt 0…1. */
export function interpolate(from: Triangle, to: Triangle, progress: number): Triangle {
  const c1 = centroid(from);
  const c2 = centroid(to);
  let delta = direction(to) - direction(from);
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  const angle = delta * progress;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cx = c1[0] + (c2[0] - c1[0]) * progress;
  const cy = c1[1] + (c2[1] - c1[1]) * progress;
  return from.map(([x, y]) => {
    const dx = x - c1[0];
    const dy = y - c1[1];
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos] as const;
  }) as unknown as Triangle;
}

// ───────────────────────── Umkehrung: beliebiger Winkel γ ─────────────────────────

/** Dritte Seite c aus a, b und dem eingeschlossenen Winkel γ (Grad), Kosinussatz. */
export function thirdSide(a: number, b: number, gammaDeg: number): number {
  const g = (gammaDeg * Math.PI) / 180;
  return Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * Math.cos(g)));
}

export type AngleKind = 'acute' | 'right' | 'obtuse';

/** Art des Winkels gegenüber von c: Vergleich von c² mit a² + b². */
export function classify(a: number, b: number, c: number, tol = 1e-9): AngleKind {
  const d = c * c - (a * a + b * b);
  if (Math.abs(d) <= tol * Math.max(1, a * a + b * b)) return 'right';
  return d < 0 ? 'acute' : 'obtuse';
}

/**
 * Quadrat nach außen über der Strecke PQ: Ecken P, Q, Q + n, P + n, wobei n
 * senkrecht auf PQ steht und von R (dritter Dreieckspunkt) weg zeigt.
 */
export function squareOutward(P: Point, Q: Point, R: Point): [Point, Point, Point, Point] {
  const ux = Q[0] - P[0];
  const uy = Q[1] - P[1];
  let nx = -uy;
  let ny = ux;
  const mx = (P[0] + Q[0]) / 2;
  const my = (P[1] + Q[1]) / 2;
  if (nx * (R[0] - mx) + ny * (R[1] - my) > 0) {
    nx = -nx;
    ny = -ny;
  }
  return [P, Q, [Q[0] + nx, Q[1] + ny], [P[0] + nx, P[1] + ny]];
}

// ───────────────────────── Pythagoreische Tripel ─────────────────────────

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Ganzzahlige Hypotenuse zu ganzzahligen Katheten a, b – oder null. */
export function integerHypotenuse(a: number, b: number): number | null {
  const s = a * a + b * b;
  const c = Math.round(Math.sqrt(s));
  return c * c === s ? c : null;
}

export interface Triple {
  a: number;
  b: number;
  c: number;
  primitive: boolean;
}

/** Alle Tripel mit 1 ≤ a, b ≤ n (beide Reihenfolgen), aufsteigend nach c. */
export function triplesUpTo(n: number): Triple[] {
  const out: Triple[] = [];
  for (let a = 1; a <= n; a++) {
    for (let b = 1; b <= n; b++) {
      const c = integerHypotenuse(a, b);
      if (c !== null) out.push({ a, b, c, primitive: gcd(gcd(a, b), c) === 1 });
    }
  }
  return out.sort((x, y) => x.c - y.c || x.a - y.a);
}

// ───────────────────────── Üben: Aufgaben ─────────────────────────

export interface QuizTask {
  /** gesuchte Seite: Hypotenuse c oder Kathete b */
  find: 'c' | 'b';
  a: number;
  b: number;
  c: number;
  /** exakte Lösung (Länge der gesuchten Seite) */
  answer: number;
  /** true, wenn die Lösung auf zwei Nachkommastellen gerundet werden muss */
  rounded: boolean;
}

const BASE_TRIPLES: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [20, 21, 29],
  [12, 16, 20],
];
const SCALES = [0.5, 1, 1, 1.5, 2] as const;

/** Reproduzierbare Aufgabe Nr. q (1 …): ungerade q mit glatter Lösung, gerade q mit Rundung. */
export function quizTask(q: number, rand: () => number): QuizTask {
  const find: 'c' | 'b' = rand() < 0.5 ? 'c' : 'b';
  if (q % 2 === 1) {
    const t = BASE_TRIPLES[Math.floor(rand() * BASE_TRIPLES.length)]!;
    let k = SCALES[Math.floor(rand() * SCALES.length)]!;
    if (t[2] * k > 30) k = 1;
    const [a, b, c] = [t[0] * k, t[1] * k, t[2] * k];
    return { find, a, b, c, answer: find === 'c' ? c : b, rounded: false };
  }
  const a = 2 + Math.floor(rand() * 9);
  const b = 2 + Math.floor(rand() * 9);
  if (find === 'c') {
    const c = Math.hypot(a, b);
    return { find, a, b, c, answer: c, rounded: integerHypotenuse(a, b) === null };
  }
  // Kathete gesucht: c ganzzahlig größer als a
  const c = a + 1 + Math.floor(rand() * 6);
  const bb = Math.sqrt(c * c - a * a);
  return { find, a, b: bb, c, answer: bb, rounded: Math.abs(bb - Math.round(bb)) > 1e-9 };
}

/** Erste Zahl in der Eingabe (Komma oder Punkt), sonst null. */
export function parseAnswer(text: string): number | null {
  const m = text.replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(',', '.')) : null;
}

/** Richtig, wenn höchstens 0,01 daneben (Rundung auf zwei Stellen erlaubt). */
export function checkAnswer(task: QuizTask, text: string): { ok: boolean; got: number | null } {
  const got = parseAnswer(text);
  return { ok: got !== null && Math.abs(got - task.answer) <= 0.0051 + 1e-9, got };
}
