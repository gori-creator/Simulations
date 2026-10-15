/**
 * Rechenlogik „Parabel durch drei Punkte“ (ohne Zeichnen).
 *
 * Gesucht ist f(x) = a·x² + b·x + c durch P₁(x₁ | y₁), P₂(x₂ | y₂), P₃(x₃ | y₃).
 * Einsetzen liefert ein lineares Gleichungssystem für a, b, c:
 *
 *   I:   x₁²·a + x₁·b + c = y₁
 *   II:  x₂²·a + x₂·b + c = y₂
 *   III: x₃²·a + x₃·b + c = y₃
 *
 * Es ist genau dann eindeutig lösbar, wenn die drei x-Werte verschieden sind.
 * Liegen die Punkte auf einer Geraden, ergibt sich a = 0 (Gerade, keine Parabel).
 *
 * Gerechnet wird exakt mit Brüchen (ganze Zähler und Nenner), damit Ergebnisse
 * wie a = −1/3 als gekürzter Bruch angezeigt werden können.
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
  // -0 vermeiden
  return { n: n / g || 0, d: d / g };
}

/** Dezimalzahl (höchstens drei Nachkommastellen, z. B. Reglerwert 1,5) als Bruch. */
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

/** Größter gemeinsamer Teiler zweier Brüche (z. B. ggT(3/2, 9/4) = 3/4). */
export function ratGcd(p: Rational, q: Rational): Rational {
  return rat(gcd(p.n * q.d, q.n * p.d), p.d * q.d);
}

/**
 * Anzahl Nachkommastellen, wenn der Bruch ein abbrechender Dezimalbruch mit
 * höchstens `max` Stellen ist (Nenner nur mit Primfaktoren 2 und 5), sonst null.
 */
export function decimals(p: Rational, max = 3): number | null {
  for (let k = 0; k <= max; k++) {
    if ((p.n * 10 ** k) % p.d === 0) return k;
  }
  return null;
}

/* ---------- Punkte und Fälle ---------- */

export interface Pt {
  x: number;
  y: number;
}

export type Points = readonly [Pt, Pt, Pt];

/** Lineare Gleichung coef[0]·a + coef[1]·b + coef[2]·c = rhs. */
export interface LinEq {
  coef: [Rational, Rational, Rational];
  rhs: Rational;
}

export type Kind = 'parabola' | 'line' | 'sameX' | 'samePoint';

/**
 * Art der Lösung:
 * - `parabola`: genau eine Parabel (a ≠ 0)
 * - `line`: die Punkte liegen auf einer Geraden (a = 0)
 * - `sameX`: zwei Punkte mit gleichem x, aber verschiedenem y – keine Funktion möglich
 * - `samePoint`: zwei (oder drei) Punkte fallen zusammen – unendlich viele Parabeln
 */
export interface Fit {
  kind: Kind;
  /** nur bei `parabola`/`line` */
  a: Rational;
  b: Rational;
  c: Rational;
  /** bei `sameX`/`samePoint`: die beiden betroffenen Punkte (Indizes 0…2) */
  pair: [number, number] | null;
}

const PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
];

/** Sonderfälle zuerst: gleiche x-Werte (keine Funktion) vor zusammenfallenden Punkten. */
export function degenerate(pts: Points): { kind: 'sameX' | 'samePoint'; pair: [number, number] } | null {
  for (const [i, j] of PAIRS) {
    if (pts[i]!.x === pts[j]!.x && pts[i]!.y !== pts[j]!.y) return { kind: 'sameX', pair: [i, j] };
  }
  for (const [i, j] of PAIRS) {
    if (pts[i]!.x === pts[j]!.x) return { kind: 'samePoint', pair: [i, j] };
  }
  return null;
}

/** Gleichungen I, II, III nach dem Einsetzen der Punkte. */
export function substitute(pts: Points): [LinEq, LinEq, LinEq] {
  return pts.map((p) => {
    const x = fromDecimal(p.x);
    return { coef: [mul(x, x), x, ONE], rhs: fromDecimal(p.y) };
  }) as [LinEq, LinEq, LinEq];
}

/**
 * Exakte Lösung (Lagrange-Form, gleichwertig zum Lösen des LGS):
 * a = Σ yᵢ / ((xᵢ − xⱼ)(xᵢ − xₖ)), b = −Σ yᵢ(xⱼ + xₖ) / (…), c = Σ yᵢ·xⱼ·xₖ / (…)
 */
export function fitParabola(pts: Points): Fit {
  const deg = degenerate(pts);
  if (deg) return { kind: deg.kind, a: ZERO, b: ZERO, c: ZERO, pair: deg.pair };
  const X = pts.map((p) => fromDecimal(p.x));
  const Y = pts.map((p) => fromDecimal(p.y));
  let a = ZERO;
  let b = ZERO;
  let c = ZERO;
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    const k = (i + 2) % 3;
    const w = div(Y[i]!, mul(sub(X[i]!, X[j]!), sub(X[i]!, X[k]!)));
    a = add(a, w);
    b = sub(b, mul(w, add(X[j]!, X[k]!)));
    c = add(c, mul(w, mul(X[j]!, X[k]!)));
  }
  return { kind: isZero(a) ? 'line' : 'parabola', a, b, c, pair: null };
}

/** Schnelle Gleitkomma-Version für das Zeichnen (null bei gleichen x-Werten). */
export function coefficients(pts: Points): { a: number; b: number; c: number } | null {
  const [p, q, r] = pts;
  const d1 = (p.x - q.x) * (p.x - r.x);
  const d2 = (q.x - p.x) * (q.x - r.x);
  const d3 = (r.x - p.x) * (r.x - q.x);
  if (d1 === 0 || d2 === 0 || d3 === 0) return null;
  const w1 = p.y / d1;
  const w2 = q.y / d2;
  const w3 = r.y / d3;
  return {
    a: w1 + w2 + w3,
    b: -(w1 * (q.x + r.x) + w2 * (p.x + r.x) + w3 * (p.x + q.x)),
    c: w1 * q.x * r.x + w2 * p.x * r.x + w3 * p.x * q.x,
  };
}

/** Scheitelpunkt S(−b/(2a) | c − b²/(4a)) (nur für a ≠ 0). */
export function vertexOf(a: Rational, b: Rational, c: Rational): { x: Rational; y: Rational } | null {
  if (isZero(a)) return null;
  const x = div(neg(b), mul(rat(2), a));
  const y = sub(c, div(mul(b, b), mul(rat(4), a)));
  return { x, y };
}

/* ---------- Rechenweg: Gleichungssystem ---------- */

/** Eine Gleichung ohne c: p·a + q·b = r. */
export interface Eq2 {
  p: Rational;
  q: Rational;
  r: Rational;
}

export interface Derivation {
  /** I, II, III */
  base: [LinEq, LinEq, LinEq];
  /** Index eines Punkts mit x = 0 (dann gilt sofort c = y), sonst null */
  cDirect: number | null;
  /** Gleichungen IV und V ohne c mit ihrer Herkunft: [i, j] = Gleichung i − Gleichung j bzw. [i, −1] = c in Gleichung i eingesetzt */
  e4: Eq2;
  e5: Eq2;
  from4: [number, number];
  from5: [number, number];
  /** b eliminieren: k4 · IV − k5 · V ergibt coef · a = rhs */
  k4: Rational;
  k5: Rational;
  aCoef: Rational;
  aRhs: Rational;
  a: Rational;
  b: Rational;
  c: Rational;
  /** b aus IV: p₄·a + q₄·b = r₄ */
  pa4: Rational;
  /** c zurückrechnen in Gleichung cFrom (falls nicht direkt) */
  cFrom: number;
}

/**
 * Lösungsweg wie im Unterricht (Additionsverfahren):
 * 1. Einsetzen → I, II, III
 * 2. c eliminieren: IV = II − I, V = III − I
 *    (liegt ein Punkt auf der y-Achse, gilt sofort c = y und wird eingesetzt)
 * 3. b eliminieren: k₄ · IV − k₅ · V (kleinste Faktoren über den ggT) → a
 * 4. a in IV einsetzen → b, dann a und b in I → c
 * Nur für drei verschiedene x-Werte (sonst null).
 */
export function derive(pts: Points): Derivation | null {
  if (degenerate(pts)) return null;
  const base = substitute(pts);
  const toEq2 = (e: LinEq): Eq2 => ({ p: e.coef[0], q: e.coef[1], r: e.rhs });
  const minus = (e: LinEq, f: LinEq): Eq2 => ({ p: sub(e.coef[0], f.coef[0]), q: sub(e.coef[1], f.coef[1]), r: sub(e.rhs, f.rhs) });
  const zeroIdx = pts.findIndex((p) => p.x === 0);
  const cDirect = zeroIdx >= 0 ? zeroIdx : null;
  let e4: Eq2;
  let e5: Eq2;
  let from4: [number, number];
  let from5: [number, number];
  if (cDirect !== null) {
    const c0 = base[cDirect]!.rhs;
    const others = [0, 1, 2].filter((i) => i !== cDirect) as [number, number];
    const withC = (i: number): Eq2 => {
      const e = toEq2(base[i]!);
      return { ...e, r: sub(e.r, c0) };
    };
    e4 = withC(others[0]);
    e5 = withC(others[1]);
    from4 = [others[0], -1];
    from5 = [others[1], -1];
  } else {
    e4 = minus(base[1], base[0]);
    e5 = minus(base[2], base[0]);
    from4 = [1, 0];
    from5 = [2, 0];
  }
  // b eliminieren: k4·q4 = k5·q5 mit kleinstmöglichen Faktoren
  const g = ratGcd(e4.q, e5.q);
  let k4 = div(e5.q, g);
  let k5 = div(e4.q, g);
  if (k4.n < 0) {
    k4 = neg(k4);
    k5 = neg(k5);
  }
  const aCoef = sub(mul(k4, e4.p), mul(k5, e5.p));
  const aRhs = sub(mul(k4, e4.r), mul(k5, e5.r));
  const a = div(aRhs, aCoef);
  const pa4 = mul(e4.p, a);
  const b = div(sub(e4.r, pa4), e4.q);
  const cFrom = cDirect ?? 0;
  const eI = base[cFrom]!;
  const c = sub(eI.rhs, add(mul(eI.coef[0], a), mul(eI.coef[1], b)));
  return { base, cDirect, e4, e5, from4, from5, k4, k5, aCoef, aRhs, a, b, c, pa4, cFrom };
}

/** Widerspruch bzw. 0 = 0 bei gleichem x: Gleichung j − Gleichung i = (0 = y_j − y_i). */
export function pairDifference(pts: Points, pair: [number, number]): Rational {
  const [i, j] = pair;
  return sub(fromDecimal(pts[j]!.y), fromDecimal(pts[i]!.y));
}

/* ---------- Andere Wege ---------- */

/**
 * Scheitelform: Ist einer der Punkte der Scheitel S der Parabel, genügt
 * y = a(x − x_S)² + y_S und ein weiterer Punkt für a. Gibt den Index des
 * Scheitelpunkts zurück (sonst null).
 */
export function vertexIndex(pts: Points): number | null {
  const fit = fitParabola(pts);
  if (fit.kind !== 'parabola') return null;
  const s = vertexOf(fit.a, fit.b, fit.c)!;
  const i = pts.findIndex((p) => equals(fromDecimal(p.x), s.x) && equals(fromDecimal(p.y), s.y));
  return i >= 0 ? i : null;
}

export interface VertexWay {
  s: number;
  /** Punkt zum Bestimmen von a */
  j: number;
  /** Punkt für die Probe */
  k: number;
  /** (x_j − x_S)² */
  sq: Rational;
  /** y_j − y_S */
  dy: Rational;
  a: Rational;
  b: Rational;
  c: Rational;
}

export function vertexWay(pts: Points): VertexWay | null {
  const s = vertexIndex(pts);
  if (s === null) return null;
  const [j, k] = [0, 1, 2].filter((i) => i !== s) as [number, number];
  const xs = fromDecimal(pts[s]!.x);
  const ys = fromDecimal(pts[s]!.y);
  const dx = sub(fromDecimal(pts[j]!.x), xs);
  const sq = mul(dx, dx);
  const dy = sub(fromDecimal(pts[j]!.y), ys);
  const a = div(dy, sq);
  // a(x − x_S)² + y_S = a·x² − 2a·x_S·x + a·x_S² + y_S
  const b = mul(rat(-2), mul(a, xs));
  const c = add(mul(a, mul(xs, xs)), ys);
  return { s, j, k, sq, dy, a, b, c };
}

/**
 * Nullstellenform: Liegen zwei Punkte auf der x-Achse (verschiedene x) und der
 * dritte nicht, gilt y = a(x − x₁)(x − x₂); der dritte Punkt liefert a.
 */
export interface RootsWay {
  i: number;
  j: number;
  k: number;
  /** (x_k − x_i)(x_k − x_j) */
  prod: Rational;
  a: Rational;
  b: Rational;
  c: Rational;
}

export function rootsWay(pts: Points): RootsWay | null {
  if (degenerate(pts)) return null;
  const on = [0, 1, 2].filter((i) => pts[i]!.y === 0);
  if (on.length !== 2) return null;
  const [i, j] = on as [number, number];
  const k = 3 - i - j;
  const xi = fromDecimal(pts[i]!.x);
  const xj = fromDecimal(pts[j]!.x);
  const xk = fromDecimal(pts[k]!.x);
  const prod = mul(sub(xk, xi), sub(xk, xj));
  const a = div(fromDecimal(pts[k]!.y), prod);
  return { i, j, k, prod, a, b: neg(mul(a, add(xi, xj))), c: mul(a, mul(xi, xj)) };
}
