/**
 * Rechenlogik für die Integrations-Werkstatt: Stammfunktionen nach Regeln
 * finden (Schritt für Schritt), Formansatz mit Koeffizientenvergleich und
 * die Probe durch Ableiten.
 *
 * Terme, Lesen, Ableiten und Vereinfachen kommen aus dem Kern (`sim-core/expr`),
 * den auch die Ableitungs-Werkstatt benutzt – beide verstehen dieselben Terme.
 * Geprüft in tests/integrationsregeln.test.ts.
 */
import { add, derivative, div, evaluate, fn, hasX, mul, neg, num, pow, sameFunction, simplify, sub, X, type Expr } from '../../../sim-core/expr';

export type IntRule =
  | 'const' // ∫ c dx = c·x
  | 'power' // ∫ xⁿ dx = xⁿ⁺¹/(n + 1)
  | 'recip' // ∫ 1/x dx = ln|x|
  | 'exp' // ∫ eˣ dx = eˣ
  | 'sin' // ∫ sin x dx = −cos x
  | 'cos' // ∫ cos x dx = sin x
  | 'sqrt' // ∫ √x dx = ⅔ x^(3/2)
  | 'sum' // Summenregel
  | 'factor' // Faktorregel
  | 'linear' // lineare Verkettung: ∫ f(ax + b) dx = F(ax + b)/a
  | 'subst' // Substitution: ∫ g(u(x))·u′(x) dx = G(u(x))
  | 'logsubst' // ∫ u′/u dx = ln|u|
  | 'parts'; // partielle Integration: ∫ u·v′ dx = u·v − ∫ u′·v dx

export interface IntStep {
  rule: IntRule;
  /** Integrand dieses Schritts. */
  expr: Expr;
  /** Stammfunktion (vereinfacht). */
  result: Expr;
  depth: number;
  /** Zusatzangaben je Regel (für die Anzeige). */
  info?: {
    a?: number; // innere Ableitung bei linearer Verkettung
    inner?: Expr; // innere Funktion
    k?: number; // Faktor bei Substitution (Integrand = k · g(u) · u′)
    u?: Expr; // partielle Integration: u
    du?: Expr; // u′
    dv?: Expr; // v′
    v?: Expr; // v
    rest?: Expr; // u′ · v (verbleibendes Integral)
  };
}

export class NotIntegrable extends Error {}

const isNumExpr = (e: Expr): e is { k: 'num'; v: number } => e.k === 'num';
const constValue = (e: Expr) => evaluate(e, 0.37);

/** Ist der Term linear in x (a·x + b mit a ≠ 0)? Liefert a und b. */
export function linearCoeffs(e: Expr): { a: number; b: number } | null {
  if (!hasX(e)) return null;
  const d = derivative(e);
  if (hasX(d)) return null;
  const a = constValue(d);
  if (!Number.isFinite(a) || a === 0) return null;
  return { a, b: evaluate(e, 0) };
}

/** Ist der Term ein Polynom in x? (nur +, −, ·, Zahlen und x^n mit n ∈ ℕ) */
export function isPolynomial(e: Expr): boolean {
  switch (e.k) {
    case 'num':
    case 'x':
      return true;
    case 'e':
    case 'pi':
      return true;
    case 'neg':
      return isPolynomial(e.a);
    case 'add':
    case 'sub':
    case 'mul':
      return isPolynomial(e.a) && isPolynomial(e.b);
    case 'div':
      return isPolynomial(e.a) && !hasX(e.b);
    case 'pow':
      return isPolynomial(e.a) && isNumExpr(e.b) && Number.isInteger(e.b.v) && e.b.v >= 0;
    default:
      return false;
  }
}

/** Koeffizienten eines Polynoms (bis Grad 6): [c₀, c₁, …]. */
export function polyCoeffs(e: Expr): number[] {
  const out: number[] = [];
  let d = e;
  let fact = 1;
  for (let k = 0; k <= 6; k++) {
    if (k > 0) fact *= k;
    out.push(evaluate(d, 0) / fact);
    if (!hasX(d)) break;
    d = derivative(d);
  }
  while (out.length > 1 && Math.abs(out[out.length - 1]!) < 1e-12) out.pop();
  return out.map((c) => (Math.abs(c - Math.round(c * 1e9) / 1e9) < 1e-12 ? Math.round(c * 1e9) / 1e9 : c));
}

/** Polynom aus Koeffizienten als Term. */
export function polyExpr(c: number[]): Expr {
  let e: Expr | null = null;
  for (let k = c.length - 1; k >= 0; k--) {
    const v = c[k]!;
    if (Math.abs(v) < 1e-12) continue;
    const term: Expr = k === 0 ? num(v) : mul(num(v), k === 1 ? X : pow(X, num(k)));
    e = e ? add(e, term) : term;
  }
  return simplify(e ?? num(0));
}

/** Ist die Grundfunktion von g eine der Funktionen, die partiell integriert werden? */
function isPartsPartner(e: Expr): boolean {
  if (e.k === 'fn' && (e.f === 'exp' || e.f === 'sin' || e.f === 'cos')) return !!linearCoeffs(e.a) || e.a.k === 'x';
  return false;
}

/** Konstantes Verhältnis a/b (an mehreren Stellen gleich)? */
function constRatio(a: Expr, b: Expr): number | null {
  let r: number | null = null;
  for (const x of [0.31, 0.77, 1.43, 2.11, -0.6]) {
    const va = evaluate(a, x);
    const vb = evaluate(b, x);
    if (!Number.isFinite(va) || !Number.isFinite(vb) || Math.abs(vb) < 1e-9) continue;
    const q = va / vb;
    if (r === null) r = q;
    else if (Math.abs(q - r) > 1e-7 * Math.max(1, Math.abs(r))) return null;
  }
  return r;
}

/**
 * Stammfunktion mit Schritten. Wirft `NotIntegrable`, wenn keine der Regeln
 * passt (dann gibt es oft keine elementare Stammfunktion, z. B. e^(x²)).
 */
export function integrate(e: Expr): { F: Expr; steps: IntStep[] } {
  const steps: IntStep[] = [];
  let F = simplify(go(simplify(e), 0, steps));
  steps.sort((a, b) => a.depth - b.depth);
  // Nach partieller Integration mit e-Funktion: kompakt als q(x) · e^(ax + b) schreiben
  if (steps[0]?.rule === 'parts') {
    const A = expAnsatz(e);
    if (A && A.degree >= 1) {
      const nice = simplify(mul(polyExpr(A.q), A.expPart));
      if (sameFunction(derivative(nice), e).equal) {
        F = nice;
        steps[0] = { ...steps[0], result: nice };
      }
    }
  }
  return { F, steps };
}

function rec(steps: IntStep[], rule: IntRule, expr: Expr, result: Expr, depth: number, info?: IntStep['info']): Expr {
  const r = simplify(result);
  steps.push({ rule, expr, result: r, depth, info });
  return r;
}

/** Grundintegral von f(z) für die Verkettung. */
function basicIntegral(f: 'exp' | 'sin' | 'cos' | 'sqrt', z: Expr): Expr {
  switch (f) {
    case 'exp':
      return fn('exp', z);
    case 'sin':
      return neg(fn('cos', z));
    case 'cos':
      return fn('sin', z);
    case 'sqrt':
      return mul(num(2 / 3), pow(z, num(1.5)));
  }
}

function go(e: Expr, depth: number, steps: IntStep[]): Expr {
  if (!hasX(e)) return rec(steps, 'const', e, mul(e, X), depth);
  switch (e.k) {
    case 'x':
      return rec(steps, 'power', e, mul(num(0.5), pow(X, num(2))), depth);
    case 'add':
    case 'sub': {
      const A = go(e.a, depth + 1, steps);
      const B = go(e.b, depth + 1, steps);
      return rec(steps, 'sum', e, e.k === 'add' ? add(A, B) : sub(A, B), depth);
    }
    case 'neg':
      return rec(steps, 'factor', e, neg(go(e.a, depth + 1, steps)), depth, { k: -1 });
    case 'mul': {
      if (!hasX(e.a) || !hasX(e.b)) {
        const c = hasX(e.a) ? e.b : e.a;
        const u = hasX(e.a) ? e.a : e.b;
        return rec(steps, 'factor', e, mul(c, go(u, depth + 1, steps)), depth, { k: constValue(c) });
      }
      return product(e, e.a, e.b, depth, steps);
    }
    case 'div': {
      if (!hasX(e.b)) return rec(steps, 'factor', e, div(go(e.a, depth + 1, steps), e.b), depth, { k: 1 / constValue(e.b) });
      // c / x^n → c · x^(−n)
      if (!hasX(e.a) && e.b.k === 'pow' && e.b.a.k === 'x' && isNumExpr(e.b.b)) return go(mul(e.a, pow(X, num(-e.b.b.v))), depth, steps);
      // u′ / u → ln|u|
      const k = constRatio(e.a, derivative(e.b));
      if (k !== null) {
        const r = mul(num(k), fn('ln', fn('abs', e.b)));
        if (e.b.k === 'x') return rec(steps, 'recip', e, r, depth);
        const lin = linearCoeffs(e.b);
        return rec(steps, lin ? 'linear' : 'logsubst', e, r, depth, { inner: e.b, k, a: lin?.a });
      }
      // Produkt mit negativer Potenz (z. B. x / (x² + 1)²)
      if (e.b.k === 'pow' && isNumExpr(e.b.b)) return product(e, e.a, pow(e.b.a, num(-e.b.b.v)), depth, steps);
      if (e.b.k !== 'pow') return product(e, e.a, pow(e.b, num(-1)), depth, steps);
      throw new NotIntegrable();
    }
    case 'pow': {
      if (hasX(e.b)) {
        // a^u: nur e^u (bereits als exp) bzw. a^(linear)
        if (!hasX(e.a)) {
          const lin = linearCoeffs(e.b);
          if (lin) {
            const lnA = Math.log(constValue(e.a));
            return rec(steps, 'linear', e, div(e, num(lin.a * lnA)), depth, { a: lin.a, inner: e.b });
          }
        }
        throw new NotIntegrable();
      }
      const n = constValue(e.b);
      if (e.a.k === 'x') {
        if (Math.abs(n + 1) < 1e-12) return rec(steps, 'recip', e, fn('ln', fn('abs', X)), depth);
        return rec(steps, 'power', e, div(pow(X, num(n + 1)), num(n + 1)), depth);
      }
      const lin = linearCoeffs(e.a);
      if (lin) {
        const r = Math.abs(n + 1) < 1e-12 ? div(fn('ln', fn('abs', e.a)), num(lin.a)) : div(pow(e.a, num(n + 1)), num((n + 1) * lin.a));
        return rec(steps, 'linear', e, r, depth, { a: lin.a, inner: e.a });
      }
      // Polynom in Klammern mit natürlicher Hochzahl: ausmultiplizieren
      if (isPolynomial(e.a) && Number.isInteger(n) && n >= 0 && n <= 6) return go(polyExpr(polyCoeffs(e)), depth, steps);
      throw new NotIntegrable();
    }
    case 'fn': {
      const f = e.f;
      if (f === 'ln') {
        // ∫ ln x dx partiell mit u = ln x, v′ = 1
        if (e.a.k === 'x') {
          const r = sub(mul(X, fn('ln', X)), X);
          return rec(steps, 'parts', e, r, depth, { u: e, du: div(num(1), X), dv: num(1), v: X, rest: num(1) });
        }
        throw new NotIntegrable();
      }
      if (f !== 'exp' && f !== 'sin' && f !== 'cos' && f !== 'sqrt') throw new NotIntegrable();
      if (e.a.k === 'x') return rec(steps, f, e, basicIntegral(f, X), depth);
      const lin = linearCoeffs(e.a);
      if (lin) return rec(steps, 'linear', e, div(basicIntegral(f, e.a), num(lin.a)), depth, { a: lin.a, inner: e.a });
      throw new NotIntegrable();
    }
    default:
      throw new NotIntegrable();
  }
}

/** Produkt zweier x-abhängiger Faktoren: Substitution, sonst partielle Integration. */
function product(e: Expr, A: Expr, B: Expr, depth: number, steps: IntStep[]): Expr {
  // Substitution: g(u(x)) · k · u′(x)
  for (const [outer, other] of [
    [A, B],
    [B, A],
  ] as const) {
    let inner: Expr | null = null;
    let G: ((z: Expr) => Expr) | null = null;
    if (outer.k === 'fn' && (outer.f === 'exp' || outer.f === 'sin' || outer.f === 'cos' || outer.f === 'sqrt') && outer.a.k !== 'x') {
      inner = outer.a;
      const f = outer.f;
      G = (z) => basicIntegral(f, z);
    } else if (outer.k === 'pow' && !hasX(outer.b) && outer.a.k !== 'x' && hasX(outer.a)) {
      inner = outer.a;
      const n = constValue(outer.b);
      G = (z) => (Math.abs(n + 1) < 1e-12 ? fn('ln', fn('abs', z)) : div(pow(z, num(n + 1)), num(n + 1)));
    }
    if (inner && G) {
      const k = constRatio(other, derivative(inner));
      if (k !== null) return rec(steps, 'subst', e, mul(num(k), G(inner)), depth, { inner, k });
    }
  }
  // Partielle Integration: Polynom · (e^(ax+b) | sin(ax+b) | cos(ax+b)), ln(x) · Polynom
  for (const [u, dv] of [
    [A, B],
    [B, A],
  ] as const) {
    if (isPolynomial(u) && isPartsPartner(dv)) {
      const v = go(dv, depth + 2, []);
      const du = derivative(u);
      const rest = simplify(mul(du, v));
      const restF = go(rest, depth + 1, steps);
      return rec(steps, 'parts', e, sub(mul(u, v), restF), depth, { u, du, dv, v, rest });
    }
  }
  for (const [lnPart, poly] of [
    [A, B],
    [B, A],
  ] as const) {
    if (lnPart.k === 'fn' && lnPart.f === 'ln' && lnPart.a.k === 'x' && isPolynomial(poly)) {
      const v = go(poly, depth + 2, []);
      const du = div(num(1), X);
      // v ist ein Polynom ohne Absolutglied, also ist v/x wieder ein Polynom
      const rest = polyExpr(polyCoeffs(v).slice(1));
      const restF = go(rest, depth + 1, steps);
      return rec(steps, 'parts', e, sub(mul(lnPart, v), restF), depth, { u: lnPart, du, dv: poly, v, rest });
    }
  }
  // Polynom mal Polynom: ausmultiplizieren
  if (isPolynomial(A) && isPolynomial(B)) return go(polyExpr(polyCoeffs(e)), depth, steps);
  throw new NotIntegrable();
}

/** Probe: Ist F′ = f? */
export function checkAntiderivative(F: Expr, f: Expr): boolean {
  return sameFunction(derivative(F), f).equal;
}

/** Bestimmtes Integral über die Stammfunktion: F(b) − F(a). */
export function definite(F: Expr, a: number, b: number): number {
  return evaluate(F, b) - evaluate(F, a);
}

/** Integral numerisch (Simpson), zur Kontrolle. */
export function simpson(f: Expr, a: number, b: number, n = 400): number {
  const h = (b - a) / n;
  let s = evaluate(f, a) + evaluate(f, b);
  for (let k = 1; k < n; k++) s += evaluate(f, a + k * h) * (k % 2 ? 4 : 2);
  return (s * h) / 3;
}

/* ------------------------------------------------------------------ */
/* Formansatz mit Koeffizientenvergleich                               */
/* ------------------------------------------------------------------ */

export interface Ansatz {
  /** Grad des Polynoms im Ansatz. */
  degree: number;
  /** a in e^(ax + b). */
  a: number;
  /** e^(ax + b) als Term. */
  expPart: Expr;
  /** Koeffizienten des gegebenen Polynoms p (f = p · e^(ax+b)). */
  p: number[];
  /** gefundene Koeffizienten des Ansatzpolynoms q (F = q · e^(ax+b)). */
  q: number[];
  /** Gleichungen des Koeffizientenvergleichs, je Potenz von x von oben nach unten. */
  equations: { power: number; lhs: number[]; rhs: number }[];
}

/**
 * Formansatz für f(x) = p(x) · e^(ax + b): F(x) = q(x) · e^(ax + b) mit
 * Grad q = Grad p. Wegen F′ = (a·q + q′) · e^(ax + b) folgt durch
 * Koeffizientenvergleich a·q_k + (k + 1)·q_(k+1) = p_k (von oben nach unten).
 */
export function expAnsatz(f: Expr): Ansatz | null {
  const e = simplify(f);
  const factors = e.k === 'mul' ? [e.a, e.b] : [e];
  const ex = factors.find((q) => q.k === 'fn' && q.f === 'exp');
  if (!ex || ex.k !== 'fn') return null;
  const lin = ex.a.k === 'x' ? { a: 1, b: 0 } : linearCoeffs(ex.a);
  if (!lin) return null;
  const rest = factors.filter((q) => q !== ex);
  const poly: Expr = rest.length ? rest[0]! : num(1);
  if (!isPolynomial(poly)) return null;
  const p = polyCoeffs(poly);
  const n = p.length - 1;
  if (n > 3) return null;
  const q = Array<number>(n + 1).fill(0);
  const equations: Ansatz['equations'] = [];
  for (let k = n; k >= 0; k--) {
    const next = k + 1 <= n ? q[k + 1]! : 0;
    q[k] = (p[k]! - (k + 1) * next) / lin.a;
    const lhs = Array<number>(n + 1).fill(0);
    lhs[k] = lin.a;
    if (k + 1 <= n) lhs[k + 1] = k + 1;
    equations.push({ power: k, lhs, rhs: p[k]! });
  }
  return { degree: n, a: lin.a, expPart: ex, p, q, equations };
}
