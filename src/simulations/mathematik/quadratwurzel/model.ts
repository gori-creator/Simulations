/**
 * Rechenlogik „Quadratwurzeln und das Heron-Verfahren“ (Jahrgangsstufe 9).
 *
 * √a ist die nichtnegative Zahl, deren Quadrat a ist – geometrisch die
 * Seitenlänge eines Quadrats mit dem Flächeninhalt a.
 *
 * Heron-Verfahren: Aus einem Rechteck mit den Seiten x und a/x (Fläche a)
 * entsteht ein „quadratischeres“ Rechteck, indem man als neue Länge den
 * Mittelwert nimmt:  x_{n+1} = (x_n + a/x_n) / 2.  Die Seiten nähern sich
 * sehr schnell √a (die Zahl der richtigen Stellen verdoppelt sich ungefähr).
 *
 * Intervallschachtelung: √a liegt zwischen zwei Dezimalzahlen mit k
 * Nachkommastellen, deren Quadrate a einschließen; mit jeder Stelle wird das
 * Intervall zehnmal kürzer.
 */

export interface HeronStep {
  /** Länge x_n */
  x: number;
  /** Breite a / x_n */
  y: number;
}

export function heronNext(a: number, x: number): number {
  return (x + a / x) / 2;
}

/** Folge der Rechtecke, beginnend mit x₀ (Länge) und a/x₀ (Breite). */
export function heronSteps(a: number, x0: number, n: number): HeronStep[] {
  const out: HeronStep[] = [];
  let x = x0;
  for (let i = 0; i <= n; i++) {
    out.push({ x, y: a / x });
    x = heronNext(a, x);
  }
  return out;
}

/** Ist a eine Quadratzahl? */
export function isPerfectSquare(a: number): boolean {
  const r = Math.round(Math.sqrt(a));
  return r * r === a;
}

/**
 * Intervall mit k Nachkommastellen: [lo, lo + 10^−k] mit lo² ≤ a < (lo + 10^−k)².
 * Mit ganzzahliger Rechnung (Skalierung mit 10^k), damit keine Rundungsfehler
 * entstehen.
 */
export function nestInterval(a: number, k: number): [number, number] {
  const s = 10 ** k;
  // größte ganze Zahl n mit n² ≤ a · s²
  const target = BigInt(Math.round(a)) * BigInt(s) * BigInt(s);
  let n = BigInt(Math.floor(Math.sqrt(a) * s));
  while (n * n > target) n -= 1n;
  while ((n + 1n) * (n + 1n) <= target) n += 1n;
  const lo = Number(n) / s;
  return [lo, (Number(n) + 1) / s];
}

/** Liegt √a genau auf der linken Grenze (Quadratzahl bzw. endliche Wurzel)? */
export function exactAt(a: number, k: number): boolean {
  const [lo] = nestInterval(a, k);
  return Math.abs(lo * lo - a) < 1e-12;
}

/**
 * Wurzelspirale des Theodorus: rechtwinklige Dreiecke mit den Katheten √n
 * und 1 werden aneinandergelegt; nach Pythagoras ist die neue Hypotenuse
 * √(n + 1). Ecke k (k = 1 … n + 1) liegt im Abstand √k vom Mittelpunkt,
 * gedreht um θ_{k−1} = Σ_{i < k} arctan(1/√i).
 */
export function spiralVertices(n: number): [number, number][] {
  const out: [number, number][] = [];
  let theta = 0;
  for (let k = 1; k <= n + 1; k++) {
    const r = Math.sqrt(k);
    out.push([r * Math.cos(theta), r * Math.sin(theta)]);
    theta += Math.atan(1 / r);
  }
  return out;
}

/** Gesamtwinkel (Grad) der ersten n Dreiecke. */
export function spiralAngle(n: number): number {
  let t = 0;
  for (let i = 1; i <= n; i++) t += Math.atan(1 / Math.sqrt(i));
  return (t * 180) / Math.PI;
}
