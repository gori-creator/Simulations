/**
 * Rechenlogik „Quadratwurzeln und das Heron-Verfahren“ (Jahrgangsstufe 9).
 *
 * √a (für a ≥ 0) ist die nichtnegative Zahl, deren Quadrat a ist – geometrisch
 * die Seitenlänge eines Quadrats mit dem Flächeninhalt a.
 *
 * Heron-Verfahren: Aus einem Rechteck mit den Seiten x und a/x (Fläche a)
 * entsteht ein „quadratischeres“ Rechteck, indem man als neue Seite den
 * Mittelwert nimmt:  x_{n+1} = (x_n + a/x_n) : 2.  Die Seiten nähern sich sehr
 * schnell √a (die Zahl der richtigen Stellen verdoppelt sich ungefähr).
 *
 * Intervallschachtelung: √a liegt zwischen zwei Dezimalzahlen mit k
 * Nachkommastellen, deren Quadrate a einschließen; mit jeder Stelle wird das
 * Intervall zehnmal kürzer. Gerechnet wird ganzzahlig (BigInt), damit keine
 * Rundungsfehler die Probe durch Quadrieren verfälschen.
 *
 * Irrationalität: √2 ist kein Bruch. Die „Fast-Treffer“ p/q mit p² − 2q² = ±1
 * zeigen, wie nahe man kommt, ohne je zu treffen.
 */

/* ---------------------------------------------------------------------------
 * Quadratzahlen und Wurzeln natürlicher Zahlen
 * ------------------------------------------------------------------------- */

/** Ganzzahlige Wurzel: größtes n ≥ 0 mit n² ≤ N (Newton-Verfahren mit ganzen Zahlen). */
export function isqrt(N: bigint): bigint {
  if (N < 0n) throw new RangeError('isqrt: negative Zahl');
  if (N < 2n) return N;
  let x = BigInt(Math.floor(Math.sqrt(Number(N))));
  // Startwert aus der Gleitkommarechnung, dann exakt nachkorrigieren
  if (x <= 0n) x = 1n;
  for (;;) {
    const y = (x + N / x) / 2n;
    if (y >= x - 1n && y <= x + 1n) {
      x = y;
      break;
    }
    x = y;
  }
  while (x * x > N) x -= 1n;
  while ((x + 1n) * (x + 1n) <= N) x += 1n;
  return x;
}

/** Größte natürliche Zahl k mit k² ≤ a (a ≥ 0 ganzzahlig). */
export function floorSqrt(a: number): number {
  return Number(isqrt(BigInt(Math.max(0, Math.floor(a)))));
}

/** Ist a eine Quadratzahl (0, 1, 4, 9, …)? */
export function isPerfectSquare(a: number): boolean {
  if (!Number.isInteger(a) || a < 0) return false;
  const r = floorSqrt(a);
  return r * r === a;
}

/**
 * Teilweise Wurzelziehen: a = k² · m mit möglichst großem k, also √a = k · √m.
 * Beispiele: 50 = 5² · 2 ⇒ √50 = 5√2; 49 = 7² · 1 ⇒ √49 = 7.
 */
export function squareFactor(a: number): { k: number; m: number } {
  const n = Math.round(a);
  let k = 1;
  for (let f = Math.floor(Math.sqrt(n)); f >= 2; f--) {
    if (n % (f * f) === 0) {
      k = f;
      break;
    }
  }
  return { k, m: n / (k * k) };
}

/**
 * Dezimaldarstellung von √a mit genau `decimals` Nachkommastellen,
 * abgeschnitten (nicht gerundet), z. B. sqrtDigits(2, 5) = "1.41421".
 * Exakt, auch für viele Stellen.
 */
export function sqrtDigits(a: number, decimals: number): string {
  const s = 10n ** BigInt(decimals);
  const r = isqrt(BigInt(Math.round(a)) * s * s);
  if (decimals === 0) return r.toString();
  const str = r.toString().padStart(decimals + 1, '0');
  return `${str.slice(0, -decimals)}.${str.slice(-decimals)}`;
}

/* ---------------------------------------------------------------------------
 * Heron-Verfahren
 * ------------------------------------------------------------------------- */

export interface HeronStep {
  /** Länge x_n (waagerechte Seite) */
  x: number;
  /** Breite a / x_n (senkrechte Seite) */
  y: number;
}

/** Ein Heron-Schritt: Mittelwert aus x und a/x. */
export function heronNext(a: number, x: number): number {
  return (x + a / x) / 2;
}

/** Folge der Rechtecke x_0 … x_n, jeweils mit der passenden Breite a / x. */
export function heronSteps(a: number, x0: number, n: number): HeronStep[] {
  const out: HeronStep[] = [];
  let x = x0;
  for (let i = 0; i <= n; i++) {
    out.push({ x, y: a / x });
    x = heronNext(a, x);
  }
  return out;
}

/** Größter gemeinsamer Teiler (BigInt, nichtnegativ). */
export function gcd(a: bigint, b: bigint): bigint {
  let u = a < 0n ? -a : a;
  let v = b < 0n ? -b : b;
  while (v) [u, v] = [v, u % v];
  return u;
}

/**
 * Heron-Folge exakt als gekürzte Brüche p/q, Start x₀ = p₀/q₀:
 * x_{n+1} = (x_n + a/x_n) / 2 = (p² + a·q²) / (2·p·q).
 * Für √2 ab x₀ = 2: 2, 3/2, 17/12, 577/408, 665857/470832, …
 */
export function heronFractions(a: number, p0: number, q0: number, n: number): [bigint, bigint][] {
  const A = BigInt(Math.round(a));
  let p = BigInt(p0);
  let q = BigInt(q0);
  const g0 = gcd(p, q);
  p /= g0;
  q /= g0;
  const out: [bigint, bigint][] = [[p, q]];
  for (let i = 0; i < n; i++) {
    let np = p * p + A * q * q;
    let nq = 2n * p * q;
    const g = gcd(np, nq);
    np /= g;
    nq /= g;
    p = np;
    q = nq;
    out.push([p, q]);
  }
  return out;
}

/**
 * Geometrie des Umlegens für das Bild „Streifen abschneiden und anlegen“:
 * Vom Rechteck mit der langen Seite L und der kurzen Seite S schneidet man
 * einen Streifen der Breite d = (L − S)/2 ab und legt ihn an die kurze Seite.
 * So entsteht fast ein Quadrat mit der Seite (L + S)/2 – es fehlt nur ein
 * kleines Eckquadrat mit der Seite d. Darum ist der Mittelwert immer etwas
 * größer als √a (oder gleich, wenn das Rechteck schon ein Quadrat war).
 */
export interface HeronCut {
  long: number;
  short: number;
  /** Breite des umgelegten Streifens */
  d: number;
  /** neue Seite (Mittelwert) */
  next: number;
  /** Fläche des fehlenden Eckquadrats d² */
  corner: number;
  /** true, wenn die lange Seite die waagerechte Seite x ist */
  longIsX: boolean;
}

export function heronCut(a: number, x: number): HeronCut {
  const y = a / x;
  const longIsX = x >= y;
  const long = longIsX ? x : y;
  const short = longIsX ? y : x;
  const d = (long - short) / 2;
  return { long, short, d, next: (long + short) / 2, corner: d * d, longIsX };
}

/**
 * Anzahl der Nachkommastellen, in denen v mit r übereinstimmt (abgeschnitten
 * verglichen; höchstens `max`). −1, wenn nicht einmal der ganzzahlige Teil passt.
 */
export function matchingDecimals(v: number, r: number, max = 12): number {
  for (let d = max; d >= 0; d--) {
    const s = 10 ** d;
    if (Math.floor(v * s + 1e-9) === Math.floor(r * s + 1e-9) && Math.abs(v - r) < 1 / s) return d;
  }
  return -1;
}

/* ---------------------------------------------------------------------------
 * Intervallschachtelung
 * ------------------------------------------------------------------------- */

/**
 * Intervall mit k Nachkommastellen: [lo, lo + 10^−k] mit lo² ≤ a < (lo + 10^−k)².
 * Mit ganzzahliger Rechnung (Skalierung mit 10^k), damit keine Rundungsfehler
 * entstehen. Bei einer Quadratzahl ist lo = √a genau.
 */
export function nestInterval(a: number, k: number): [number, number] {
  const s = 10n ** BigInt(k);
  const n = isqrt(BigInt(Math.round(a)) * s * s);
  const den = 10 ** k;
  return [Number(n) / den, (Number(n) + 1) / den];
}

/** Liegt √a genau auf der linken Grenze (Quadratzahl)? */
export function exactAt(a: number, k: number): boolean {
  const s = 10n ** BigInt(k);
  const target = BigInt(Math.round(a)) * s * s;
  const n = isqrt(target);
  return n * n === target;
}

/** Eine Probe durch Quadrieren: Zahl t mit t² im Vergleich zu a. */
export interface Probe {
  t: number;
  /** t² (für die Anzeige) */
  sq: number;
  /** −1: t² < a, 0: t² = a, 1: t² > a */
  cmp: -1 | 0 | 1;
}

/**
 * Proben, die von Stufe k − 1 zu Stufe k führen: Man quadriert die Zahlen
 * lo + 1·10^−k, lo + 2·10^−k, … der Reihe nach, bis das Quadrat a erreicht
 * oder überschreitet. Stufe 0: die natürlichen Zahlen 1, 2, 3, …
 * Ist √a schon auf Stufe k − 1 genau getroffen, gibt es keine Proben mehr.
 */
export function nestProbes(a: number, k: number): Probe[] {
  const A = BigInt(Math.round(a));
  const out: Probe[] = [];
  if (k <= 0) {
    for (let t = 1n; ; t++) {
      const sq = t * t;
      const cmp = sq < A ? -1 : sq === A ? 0 : 1;
      out.push({ t: Number(t), sq: Number(sq), cmp });
      if (cmp >= 0) return out;
    }
  }
  if (exactAt(a, k - 1)) return out;
  const base = isqrt(A * 10n ** BigInt(2 * (k - 1))) * 10n;
  const target = A * 10n ** BigInt(2 * k);
  const den = 10 ** k;
  for (let j = 1n; j <= 10n; j++) {
    const m = base + j;
    const sq = m * m;
    const cmp = sq < target ? -1 : sq === target ? 0 : 1;
    const t = Number(m) / den;
    out.push({ t, sq: Number(sq) / den / den, cmp });
    if (cmp >= 0) break;
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * √2 ist irrational
 * ------------------------------------------------------------------------- */

/** √2 auf 50 Nachkommastellen (abgeschnitten). */
export const SQRT2_50 = '1.41421356237309504880168872420969807856967187537694';

/**
 * „Fast-Treffer“ für √2: Brüche p/q mit p² − 2q² = ±1 (1/1, 3/2, 7/5, 17/12, …).
 * Bildungsregel: (p, q) → (p + 2q, p + q). Näher kann ein Bruch mit so kleinem
 * Nenner nicht kommen – aber p² = 2q² gilt nie.
 */
export function nearMisses(count: number): { p: number; q: number; p2: number; q2x2: number; diff: number }[] {
  const out: { p: number; q: number; p2: number; q2x2: number; diff: number }[] = [];
  let p = 1;
  let q = 1;
  for (let i = 0; i < count; i++) {
    out.push({ p, q, p2: p * p, q2x2: 2 * q * q, diff: p * p - 2 * q * q });
    [p, q] = [p + 2 * q, p + q];
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * Quadrat aus Einheitsquadraten legen
 * ------------------------------------------------------------------------- */

/** Ein Einheitsquadrat auf dem Kästchenpapier (Spalte i von links, Zeile j von unten). */
export interface Cell {
  i: number;
  j: number;
  /** Winkelhaken (1, 3, 5, … Kästchen), zu dem es gehört (1-basiert) */
  layer: number;
  /** true: gehört nicht mehr zum größten Quadrat („passt nicht genau“) */
  rest: boolean;
}

/**
 * a Einheitsquadrate, gelegt als wachsende Quadrate: Jede neue Schicht ist ein
 * Winkelhaken aus 2k − 1 Kästchen (1 + 3 + 5 + … + (2k − 1) = k²). Was nach dem
 * größten Quadrat k² ≤ a übrig bleibt, liegt im nächsten, unvollständigen Haken.
 */
export function squareCells(a: number): Cell[] {
  const n = Math.max(0, Math.round(a));
  const k = floorSqrt(n);
  const out: Cell[] = [];
  const layerCells = (L: number, rest: boolean, limit: number) => {
    const c = L - 1;
    const list: [number, number][] = [];
    for (let j = 0; j <= c; j++) list.push([c, j]);
    for (let i = c - 1; i >= 0; i--) list.push([i, c]);
    for (const [i, j] of list.slice(0, limit)) out.push({ i, j, layer: L, rest });
  };
  for (let L = 1; L <= k; L++) layerCells(L, false, 2 * L - 1);
  if (n > k * k) layerCells(k + 1, true, n - k * k);
  return out;
}
