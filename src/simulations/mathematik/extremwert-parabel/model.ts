/**
 * Rechenlogik „Extremwertaufgaben mit Parabeln“ (ohne Zeichnen, ohne Ableitung).
 *
 * Jede Sachsituation führt auf eine quadratische Zielfunktion, die als Produkt
 * zweier linearer Faktoren entsteht (Rechteck: Seite · Seite, Erlös: Preis · Anzahl):
 *
 *   Z(x) = (u₀ + u₁·x) · (v₀ + v₁·x) = a·x² + b·x + c   mit a < 0.
 *
 * Die Nullstellen der beiden Faktoren sind die Ränder des Definitionsbereichs
 * (dort wird eine Seite bzw. der Preis oder die Anzahl null). Weil der Scheitel
 * einer Parabel genau in der Mitte zwischen ihren Nullstellen liegt, liegt das
 * Maximum immer im Definitionsbereich.
 *
 * Das Maximum wird ohne Ableitung über die quadratische Ergänzung bestimmt:
 *
 *   a·x² + b·x + c = a·(x² + p·x) + c                     (p = b/a)
 *                  = a·(x² + p·x + h² − h²) + c           (h = p/2)
 *                  = a·((x + h)² − h²) + c
 *                  = a·(x + h)² + (c − a·h²)
 *
 * Scheitel S(−h | c − a·h²). Gerechnet wird exakt mit Brüchen, damit z. B.
 * −3/4 als Bruch angezeigt werden kann.
 */

/* ---------- Brüche ---------- */

/** Gekürzter Bruch n/d mit d > 0. */
export interface Rational {
  n: number;
  d: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function rat(n: number, d = 1): Rational {
  if (d === 0) throw new Error('Nenner 0');
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  // −0 vermeiden
  return { n: n / g || 0, d: d / g };
}

/** Dezimalzahl (höchstens drei Nachkommastellen, z. B. Reglerwert 7,5) als Bruch. */
export function fromDecimal(x: number): Rational {
  return rat(Math.round(x * 1000), 1000);
}

export const add = (p: Rational, q: Rational) => rat(p.n * q.d + q.n * p.d, p.d * q.d);
export const sub = (p: Rational, q: Rational) => rat(p.n * q.d - q.n * p.d, p.d * q.d);
export const mul = (p: Rational, q: Rational) => rat(p.n * q.n, p.d * q.d);
export const div = (p: Rational, q: Rational) => rat(p.n * q.d, p.d * q.n);
export const neg = (p: Rational) => rat(-p.n, p.d);
export const isZero = (p: Rational) => p.n === 0;
export const equals = (p: Rational, q: Rational) => p.n === q.n && p.d === q.d;
export const toNumber = (p: Rational) => p.n / p.d;
export const ZERO = rat(0);
export const ONE = rat(1);

/**
 * Anzahl Nachkommastellen, wenn der Bruch ein abbrechender Dezimalbruch mit
 * höchstens `max` Stellen ist, sonst null (dann besser als Bruch schreiben).
 */
export function decimals(p: Rational, max = 3): number | null {
  for (let k = 0; k <= max; k++) {
    if ((p.n * 10 ** k) % p.d === 0) return k;
  }
  return null;
}

/* ---------- Sachsituationen ---------- */

/**
 * - `wall`: rechteckiges Gehege an einer Mauer, Zaun (Länge L) auf drei Seiten
 * - `free`: rechteckiges Gehege ohne Mauer, Zaun (Länge L) ist der Umfang
 * - `tri`: Rechteck in einem rechtwinkligen Dreieck (Katheten a, b), eine Ecke auf der Hypotenuse
 * - `price`: Eintrittspreis p₀ + x, Besucherzahl n₀ − k·x, Erlös = Preis · Besucher
 * - `gutter`: Regenrinne aus einem Blechstreifen der Breite s, Ränder der Höhe x hochgebogen
 */
export type Situation = 'wall' | 'free' | 'tri' | 'price' | 'gutter';
export const SITUATIONS: readonly Situation[] = ['wall', 'free', 'tri', 'price', 'gutter'];

export interface Inputs {
  /** Zaunlänge in m (wall, free) */
  L: number;
  /** waagrechte Kathete in cm (tri) */
  a: number;
  /** senkrechte Kathete in cm (tri) */
  b: number;
  /** bisheriger Preis in € (price) */
  p: number;
  /** bisherige Besucherzahl (price) */
  n: number;
  /** Besucher weniger je 1 € Preiserhöhung (price) */
  k: number;
  /** Breite des Blechstreifens in cm (gutter) */
  s: number;
}

/** Linearer Term u₀ + u₁·x */
export type Lin = readonly [Rational, Rational];

/** Quadratische Funktion a·x² + b·x + c */
export interface Quadratic {
  a: Rational;
  b: Rational;
  c: Rational;
}

export interface Problem {
  sit: Situation;
  /** Zielfunktion als Produkt zweier linearer Faktoren */
  f1: Lin;
  f2: Lin;
  /** ausmultipliziert */
  q: Quadratic;
  /** Definitionsbereich [lo; hi] bzw. ]lo; hi[ */
  lo: Rational;
  hi: Rational;
  /** offenes Intervall (Rechteck mit Seite 0 ist kein Rechteck) */
  open: boolean;
}

const R = fromDecimal;

/** Zielfunktion der Situation als Produkt (u₀ + u₁x)(v₀ + v₁x) mit Definitionsbereich. */
export function problem(sit: Situation, inp: Inputs): Problem {
  const X: Lin = [ZERO, ONE];
  let f1: Lin;
  let f2: Lin;
  let open = true;
  switch (sit) {
    case 'wall':
      // Breite x (zweimal), Länge L − 2x (parallel zur Mauer)
      f1 = X;
      f2 = [R(inp.L), rat(-2)];
      break;
    case 'free':
      // Umfang 2x + 2y = L  ⇒  y = L/2 − x
      f1 = X;
      f2 = [div(R(inp.L), rat(2)), rat(-1)];
      break;
    case 'tri':
      // Ecke auf der Hypotenuse: h = b − (b/a)·x (Strahlensatz bzw. Geradengleichung)
      f1 = X;
      f2 = [R(inp.b), neg(div(R(inp.b), R(inp.a)))];
      break;
    case 'price':
      // Preis p₀ + x, Besucher n₀ − k·x
      f1 = [R(inp.p), ONE];
      f2 = [R(inp.n), neg(R(inp.k))];
      open = false;
      break;
    case 'gutter':
      // Höhe x (zweimal hochgebogen), Boden s − 2x
      f1 = X;
      f2 = [R(inp.s), rat(-2)];
      break;
  }
  const q = expand(f1, f2);
  const z1 = linZero(f1);
  const z2 = linZero(f2);
  const lo = toNumber(z1) <= toNumber(z2) ? z1 : z2;
  const hi = lo === z1 ? z2 : z1;
  return { sit, f1, f2, q, lo, hi, open };
}

/** Nullstelle von u₀ + u₁·x (u₁ ≠ 0). */
export function linZero(f: Lin): Rational {
  return neg(div(f[0], f[1]));
}

/** (u₀ + u₁x)(v₀ + v₁x) = u₁v₁·x² + (u₀v₁ + u₁v₀)·x + u₀v₀ */
export function expand(f1: Lin, f2: Lin): Quadratic {
  return {
    a: mul(f1[1], f2[1]),
    b: add(mul(f1[0], f2[1]), mul(f1[1], f2[0])),
    c: mul(f1[0], f2[0]),
  };
}

export const linValue = (f: Lin, x: number) => toNumber(f[0]) + toNumber(f[1]) * x;
export const value = (q: Quadratic, x: number) => (toNumber(q.a) * x + toNumber(q.b)) * x + toNumber(q.c);

/** Liegt x im Definitionsbereich? */
export function inDomain(pr: Problem, x: number, eps = 1e-9): boolean {
  const lo = toNumber(pr.lo);
  const hi = toNumber(pr.hi);
  return pr.open ? x > lo + eps && x < hi - eps : x >= lo - eps && x <= hi + eps;
}

/** x in die abgeschlossene Hülle des Definitionsbereichs holen. */
export function clampToDomain(pr: Problem, x: number): number {
  return Math.max(toNumber(pr.lo), Math.min(toNumber(pr.hi), x));
}

/* ---------- Quadratische Ergänzung ---------- */

export interface SquareSteps {
  /** Leitkoeffizient (wird ausgeklammert) */
  a: Rational;
  /** p = b/a: Klammer x² + p·x */
  p: Rational;
  /** h = p/2 (halber Koeffizient): (x + h)² */
  h: Rational;
  /** h² (ergänzt und wieder abgezogen) */
  h2: Rational;
  /** Absolutglied */
  c: Rational;
  /** Scheitel S(xS | yS) */
  xS: Rational;
  yS: Rational;
}

/** Quadratische Ergänzung a·x² + b·x + c = a·(x + h)² + (c − a·h²). Voraussetzung a ≠ 0. */
export function completeSquare(q: Quadratic): SquareSteps {
  if (isZero(q.a)) throw new Error('keine quadratische Funktion');
  const p = div(q.b, q.a);
  const h = div(p, rat(2));
  const h2 = mul(h, h);
  return { a: q.a, p, h, h2, c: q.c, xS: neg(h), yS: sub(q.c, mul(q.a, h2)) };
}

/** Scheitel S(xS | yS) der Zielfunktion (für a < 0 das Maximum). */
export function vertex(q: Quadratic): { x: Rational; y: Rational } {
  const s = completeSquare(q);
  return { x: s.xS, y: s.yS };
}

/* ---------- Probieren und Wertetabelle ---------- */

const NICE = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500];

/** Kleinste „schöne“ Schrittweite ≥ raw. */
export function niceAtLeast(raw: number): number {
  for (const s of NICE) if (s >= raw - 1e-12) return s;
  return NICE[NICE.length - 1]!;
}

/**
 * x-Werte für eine Wertetabelle: Vielfache einer schönen Schrittweite im
 * Definitionsbereich (bei offenem Bereich ohne die Ränder), höchstens `max` Stück.
 */
export function tableXs(pr: Problem, max = 8): number[] {
  const lo = toNumber(pr.lo);
  const hi = toNumber(pr.hi);
  for (const s of NICE) {
    const xs: number[] = [];
    const first = Math.ceil(lo / s - 1e-9);
    const last = Math.floor(hi / s + 1e-9);
    for (let i = first; i <= last; i++) {
      const x = Math.round(i * s * 1000) / 1000;
      if (inDomain(pr, x)) xs.push(x);
    }
    if (xs.length <= max && xs.length >= 2) return xs;
  }
  return [lo, (lo + hi) / 2, hi];
}

/**
 * Probier-Folge beim „Maximum suchen“: von x₀ aus abwechselnd links und rechts
 * vom Scheitel, immer näher dran (wie beim Ausprobieren), auf schöne Werte
 * gerundet, zuletzt genau der Scheitel. Alle Werte liegen im Definitionsbereich.
 */
export function probeSequence(pr: Problem, x0: number, tries = 4): number[] {
  const lo = toNumber(pr.lo);
  const hi = toNumber(pr.hi);
  const xv = toNumber(vertex(pr.q).x);
  const w = hi - lo;
  const step = niceAtLeast(w / 40);
  let d = x0 - xv;
  if (Math.abs(d) < 0.2 * w) d = (xv - lo > hi - xv ? -1 : 1) * 0.36 * w;
  const out: number[] = [];
  const inner = (x: number) => Math.max(lo + step, Math.min(hi - step, x));
  let f = -0.62;
  for (let i = 0; i < tries; i++) {
    let x = Math.round(inner(xv + d * f) / step) * step;
    x = Math.round(x * 1000) / 1000;
    const prev = out.length ? out[out.length - 1]! : x0;
    if (Math.abs(x - prev) > 1e-9 && Math.abs(x - xv) > 1e-9 && inDomain(pr, x)) out.push(x);
    f *= -0.55;
  }
  out.push(xv);
  return out;
}

/** Größter Wert einer Wertetabelle (Index). */
export function argMax(q: Quadratic, xs: readonly number[]): number {
  let best = 0;
  xs.forEach((x, i) => {
    if (value(q, x) > value(q, xs[best]!) + 1e-9) best = i;
  });
  return best;
}
