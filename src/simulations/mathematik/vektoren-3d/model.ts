/**
 * Rechenlogik für „Vektoren addieren und vervielfachen (3D)“: Summe,
 * Differenz, Vielfaches, Linearkombination, Verbindungsvektor, Betrag,
 * Mittelpunkt und Kollinearität. Keine Zeichenbefehle.
 */

export type V3 = readonly [number, number, number];

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const neg = (a: V3): V3 => scale(a, -1);

/** Betrag (Länge) |a| = √(a₁² + a₂² + a₃²). */
export const norm = (a: V3): number => Math.hypot(a[0], a[1], a[2]);

/** Summe der Quadrate (für die Anzeige √…). */
export const normSq = (a: V3): number => a[0] * a[0] + a[1] * a[1] + a[2] * a[2];

/** Linearkombination r · a + s · b. */
export const linComb = (r: number, a: V3, s: number, b: V3): V3 => add(scale(a, r), scale(b, s));

/** Verbindungsvektor AB = B − A (Spitze minus Fuß). */
export const between = (A: V3, B: V3): V3 => sub(B, A);

/** Mittelpunkt der Strecke AB: M = ½ (A + B). */
export const midpoint = (A: V3, B: V3): V3 => scale(add(A, B), 0.5);

export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Sind a und b kollinear (parallel oder einer der Nullvektor)? */
export function collinear(a: V3, b: V3, eps = 1e-9): boolean {
  return norm(cross(a, b)) < eps * Math.max(1, norm(a) * norm(b));
}

/**
 * Faktor k mit b = k · a, falls b ein Vielfaches von a ist (a ≠ o), sonst null.
 */
export function multipleOf(a: V3, b: V3, eps = 1e-9): number | null {
  if (norm(a) < eps || !collinear(a, b, eps)) return null;
  const i = [0, 1, 2].reduce((m, j) => (Math.abs(a[j]!) > Math.abs(a[m]!) ? j : m), 0);
  return b[i]! / a[i]!;
}

export const isZero = (a: V3, eps = 1e-9): boolean => norm(a) < eps;

/** Einheitsvektor a / |a| (Nullvektor bleibt Nullvektor). */
export function unit(a: V3): V3 {
  const l = norm(a);
  return l < 1e-12 ? [0, 0, 0] : scale(a, 1 / l);
}

/**
 * Löst r · a + s · b = c (falls c in der von a und b aufgespannten Ebene
 * liegt und a, b nicht kollinear sind); sonst null. Methode der kleinsten
 * Quadrate über die Gramsche Matrix, danach Probe.
 */
export function solveLinComb(a: V3, b: V3, c: V3, eps = 1e-7): { r: number; s: number } | null {
  const aa = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
  const bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
  const ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const ac = a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
  const bc = b[0] * c[0] + b[1] * c[1] + b[2] * c[2];
  const det = aa * bb - ab * ab;
  if (Math.abs(det) < eps) return null;
  const r = (ac * bb - bc * ab) / det;
  const s = (aa * bc - ab * ac) / det;
  const back = linComb(r, a, s, b);
  return norm(sub(back, c)) < eps * Math.max(1, norm(c)) ? { r, s } : null;
}

/** Kleiner deterministischer Zufall für „Neue Vektoren“: ganzzahlige Komponenten in [−r, r]. */
export function randomVec(seed: number, r = 3): V3 {
  const f = (k: number) => {
    const u = Math.sin((seed * 3 + k) * 12.9898 + 78.233) * 43758.5453;
    return Math.round((u - Math.floor(u)) * 2 * r - r);
  };
  const v: V3 = [f(0), f(1), f(2)];
  return isZero(v) ? [1, 2, 1] : v;
}

/* ------------------------------------------------------------------ */
/* Ergänzungen: Linearkombination finden, Spat                        */
/* ------------------------------------------------------------------ */

/** Skalarprodukt (hier nur als Hilfsmittel für die Projektion). */
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Beste Faktoren r, s, sodass r · a + s · b möglichst nah an c liegt
 * (senkrechte Projektion von c in die Ebene von a und b), dazu der Restabstand.
 * Null, wenn a und b kollinear sind.
 */
export function bestRS(a: V3, b: V3, c: V3): { r: number; s: number; rest: number } | null {
  const aa = dot(a, a);
  const bb = dot(b, b);
  const ab = dot(a, b);
  const det = aa * bb - ab * ab;
  if (Math.abs(det) < 1e-9 * Math.max(1, aa * bb)) return null;
  const ac = dot(a, c);
  const bc = dot(b, c);
  const r = (ac * bb - bc * ab) / det;
  const s = (aa * bc - ab * ac) / det;
  return { r, s, rest: norm(sub(linComb(r, a, s, b), c)) };
}

/** Spatprodukt (a × b) · c – das (orientierte) Volumen des Spats. */
export const det3 = (a: V3, b: V3, c: V3): number => dot(cross(a, b), c);

/** Liegen a, b, c in einer Ebene (komplanar)? Dann ist der Spat flach. */
export const coplanar = (a: V3, b: V3, c: V3, eps = 1e-9): boolean => Math.abs(det3(a, b, c)) < eps * Math.max(1, norm(a) * norm(b) * norm(c));

/** Ecke des Spats zu den Faktoren (i, j, k) ∈ {0, 1}³: i · a + j · b + k · c. */
export function spatCorner(a: V3, b: V3, c: V3, i: number, j: number, k: number): V3 {
  return add(add(scale(a, i), scale(b, j)), scale(c, k));
}

/** Alle acht Ecken des Spats mit ihren Faktoren (O zuerst, G = a + b + c zuletzt). */
export function spatCorners(a: V3, b: V3, c: V3): { f: [number, number, number]; p: V3 }[] {
  const out: { f: [number, number, number]; p: V3 }[] = [];
  for (const f of [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ] as [number, number, number][])
    out.push({ f, p: spatCorner(a, b, c, f[0], f[1], f[2]) });
  return out;
}

/* ---------------- Länge und Einheitsvektor ---------------- */

/** Länge in zwei Schritten Pythagoras: erst in der x₁x₂-Ebene (d₁₂), dann mit der Höhe. */
export function lengthSteps(a: V3): { sq12: number; d12: number; sq: number; d: number } {
  const sq12 = a[0] * a[0] + a[1] * a[1];
  const sq = sq12 + a[2] * a[2];
  return { sq12, d12: Math.sqrt(sq12), sq, d: Math.sqrt(sq) };
}

/** Alle Vektoren mit ganzzahligen Komponenten in [−max, max] und |v|² = r2 (Gitterpunkte auf einer Kugel). */
export function latticeOnSphere(r2: number, max: number): V3[] {
  const out: V3[] = [];
  for (let x = -max; x <= max; x++) for (let y = -max; y <= max; y++) for (let z = -max; z <= max; z++) if (x * x + y * y + z * z === r2) out.push([x, y, z]);
  return out;
}

/** Ist v (bis auf Rundung) schon in der Liste? */
export const hasVec = (list: readonly V3[], v: V3): boolean => list.some((q) => norm(sub(q, v)) < 1e-9);

/* ---------------- Dreieck: Mittelpunkte und Schwerpunkt ---------------- */

/** Punkt, der die Strecke AB im Verhältnis t : (1 − t) teilt: A + t · AB. */
export const divide = (A: V3, B: V3, t: number): V3 => add(A, scale(sub(B, A), t));

/** Schwerpunkt S = ⅓ (A + B + C). */
export const centroid = (A: V3, B: V3, C: V3): V3 => scale(add(add(A, B), C), 1 / 3);

/** Seitenmitten des Dreiecks ABC. */
export function triangleMids(A: V3, B: V3, C: V3): { ab: V3; bc: V3; ca: V3 } {
  return { ab: midpoint(A, B), bc: midpoint(B, C), ca: midpoint(C, A) };
}

/** Liegen A, B, C auf einer Geraden (oder fallen zusammen)? Dann gibt es kein Dreieck. */
export const degenerate = (A: V3, B: V3, C: V3): boolean => collinear(sub(B, A), sub(C, A));

/* ---------------- Zufallsweg: viele Vektoren addieren ---------------- */

/** Einer der sechs Einheitsschritte ±e₁, ±e₂, ±e₃, gleich wahrscheinlich. */
export function axisStep(u: number): V3 {
  const k = Math.min(5, Math.floor(u * 6));
  const v: [number, number, number] = [0, 0, 0];
  v[k % 3] = k < 3 ? 1 : -1;
  return v;
}

/** Positionen nach jedem Schritt (beginnend im Ursprung). */
export function walkPositions(steps: readonly V3[]): V3[] {
  const out: V3[] = [[0, 0, 0]];
  for (const s of steps) out.push(add(out[out.length - 1]!, s));
  return out;
}

/** Schritte nach Achse und Richtung sortiert: erst alle ±e₁, dann ±e₂, dann ±e₃ (stabil). */
export function sortSteps(steps: readonly V3[]): V3[] {
  const key = (s: V3) => {
    const k = s[0] !== 0 ? 0 : s[1] !== 0 ? 1 : 2;
    return k * 2 + (s[k]! > 0 ? 0 : 1);
  };
  return steps.map((s, i) => ({ s, i, k: key(s) })).sort((a, b) => a.k - b.k || a.i - b.i).map((x) => x.s);
}

/** Wie oft wurde je Achse in plus- und minus-Richtung gegangen? */
export function stepCounts(steps: readonly V3[]): { plus: [number, number, number]; minus: [number, number, number] } {
  const plus: [number, number, number] = [0, 0, 0];
  const minus: [number, number, number] = [0, 0, 0];
  for (const s of steps)
    for (let k = 0; k < 3; k++) {
      if (s[k]! > 0) plus[k]!++;
      else if (s[k]! < 0) minus[k]!++;
    }
  return { plus, minus };
}

/** Summe aller Schritte (= Endpunkt des Weges). */
export const sumOf = (steps: readonly V3[]): V3 => steps.reduce<V3>((s, v) => add(s, v), [0, 0, 0]);

/** Endpunkt eines Zufallswegs mit n Schritten. */
export function walkEnd(n: number, u: () => number): V3 {
  let s: V3 = [0, 0, 0];
  for (let i = 0; i < n; i++) s = add(s, axisStep(u()));
  return s;
}

/** Mittelwert von |s|² über viele Endpunkte – für Einheitsschritte genau n im Mittel. */
export function meanSq(points: readonly V3[]): number {
  return points.length ? points.reduce((t, q) => t + normSq(q), 0) / points.length : 0;
}

/** Häufigkeiten von |s| in Klassen der Breite w (Klasse i: i·w ≤ |s| < (i + 1)·w). */
export function histogram(values: readonly number[], w: number, bins: number): number[] {
  const h = new Array<number>(bins).fill(0);
  for (const v of values) h[Math.min(bins - 1, Math.max(0, Math.floor(v / w)))]!++;
  return h;
}
