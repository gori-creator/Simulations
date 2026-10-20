/**
 * Rechenlogik „Taylorpolynome“ (Jgst. 13 / Studium).
 *
 * Das Taylorpolynom n-ten Grades von f an der Entwicklungsstelle a
 *   Tₙ(x) = Σ_{k=0}^{n} f⁽ᵏ⁾(a) / k! · (x − a)ᵏ
 * stimmt bei a mit f in Funktionswert und den ersten n Ableitungen überein.
 * Für sin, cos und eˣ nähert es f mit wachsendem n auf ganz ℝ an; für
 * ln(1 + x) und 1/(1 − x) nur im Konvergenzintervall |x − a| < r, wobei r der
 * Abstand von a zur Polstelle bzw. Definitionslücke ist.
 */

export type FnKey = 'sin' | 'cos' | 'exp' | 'ln' | 'geo';

export interface Fn {
  f: (x: number) => number;
  /** k-te Ableitung an der Stelle a (gilt für jede Stelle im Definitionsbereich) */
  d: (k: number, a: number) => number;
  /** Konvergenzradius um a */
  radius: (a: number) => number;
  /** zulässige Entwicklungsstellen */
  aMin: number;
  aMax: number;
  /** Stelle, an der f nicht definiert ist (Polstelle bzw. Rand), sonst null */
  singular: number | null;
}

const fact = (k: number) => {
  let r = 1;
  for (let i = 2; i <= k; i++) r *= i;
  return r;
};
export { fact as factorial };

/** Rundungsreste wie sin π ≈ 1,2 · 10⁻¹⁶ auf 0 setzen. */
const tidy = (v: number) => (Math.abs(v) < 1e-13 ? 0 : v);

export const FNS: Record<FnKey, Fn> = {
  sin: { f: Math.sin, d: (k, a) => tidy(Math.sin(a + (k * Math.PI) / 2)), radius: () => Infinity, aMin: -3.2, aMax: 3.2, singular: null },
  cos: { f: Math.cos, d: (k, a) => tidy(Math.cos(a + (k * Math.PI) / 2)), radius: () => Infinity, aMin: -3.2, aMax: 3.2, singular: null },
  exp: { f: Math.exp, d: (_k, a) => Math.exp(a), radius: () => Infinity, aMin: -2, aMax: 2, singular: null },
  ln: {
    f: (x) => (x > -1 ? Math.log(1 + x) : NaN),
    d: (k, a) => (a <= -1 ? NaN : k === 0 ? Math.log(1 + a) : ((k % 2 === 1 ? 1 : -1) * fact(k - 1)) / (1 + a) ** k),
    radius: (a) => 1 + a,
    aMin: -0.9,
    aMax: 2,
    singular: -1,
  },
  geo: {
    f: (x) => (x === 1 ? NaN : 1 / (1 - x)),
    d: (k, a) => (a === 1 ? NaN : fact(k) / (1 - a) ** (k + 1)),
    radius: (a) => Math.abs(1 - a),
    aMin: -2,
    aMax: 0.5,
    singular: 1,
  },
};

/** Koeffizienten cₖ = f⁽ᵏ⁾(a)/k! für k = 0 … n. */
export function coefficients(fn: Fn, a: number, n: number): number[] {
  const out: number[] = [];
  for (let k = 0; k <= n; k++) {
    const c = fn.d(k, a) / fact(k);
    out.push(Math.abs(c) < 1e-15 ? 0 : c);
  }
  return out;
}

/** Tₙ(x) */
export function taylor(fn: Fn, a: number, n: number, x: number): number {
  const c = coefficients(fn, a, n);
  let y = 0;
  for (let k = n; k >= 0; k--) y = y * (x - a) + c[k]!;
  return y;
}

/** Fehler Rₙ(x) = f(x) − Tₙ(x). */
export function remainder(fn: Fn, a: number, n: number, x: number): number {
  return fn.f(x) - taylor(fn, a, n, x);
}

/** n-te Ableitung des Taylorpolynoms Tₙ an der Stelle a ist k! · cₖ = f⁽ᵏ⁾(a) für k ≤ n, sonst 0. */
export function polyDerivativeAtCentre(fn: Fn, a: number, n: number, k: number): number {
  if (k > n) return 0;
  return coefficients(fn, a, n)[k]! * fact(k);
}

/**
 * j-te Ableitung von Tₙ an einer beliebigen Stelle x:
 *   Tₙ⁽ʲ⁾(x) = Σ_{k=j}^{n} cₖ · k!/(k − j)! · (x − a)^(k − j).
 * Für j > n ist sie 0.
 */
export function taylorDerivative(fn: Fn, a: number, n: number, j: number, x: number): number {
  if (j > n) return 0;
  const c = coefficients(fn, a, n);
  let y = 0;
  for (let k = n; k >= j; k--) y = y * (x - a) + c[k]! * (fact(k) / fact(k - j));
  return y;
}

/** j-te Ableitung von f an der Stelle x (NaN außerhalb des Definitionsbereichs). */
export function fnDerivative(fn: Fn, j: number, x: number): number {
  if (fn.singular !== null && ((fn.singular === -1 && x <= -1) || x === fn.singular)) return NaN;
  return fn.d(j, x);
}

/**
 * Wie viele Ableitungen stimmen bei a überein? Liefert das größte m, für das
 * Tₙ⁽ʲ⁾(a) = f⁽ʲ⁾(a) für alle j ≤ m gilt (gesucht bis n + 6). Mindestens n –
 * mehr, wenn die nächsten Koeffizienten 0 sind (z. B. sin um 0 mit n = 3: m = 4).
 */
export function matchOrder(fn: Fn, a: number, n: number): number {
  const c = coefficients(fn, a, n + 6);
  let m = n;
  while (m + 1 <= n + 6 && c[m + 1] === 0) m++;
  return m;
}

/** Ist Tₙ = Tₙ₋₁, weil der neue Koeffizient cₙ verschwindet? (n ≥ 1) */
export function sameAsPrevious(fn: Fn, a: number, n: number): boolean {
  return n >= 1 && coefficients(fn, a, n)[n] === 0;
}

/** Partialsummen T₀(x), T₁(x), …, Tₙ(x) – so rechnet man Schritt für Schritt. */
export function partialSums(fn: Fn, a: number, n: number, x: number): number[] {
  const c = coefficients(fn, a, n);
  const out: number[] = [];
  let s = 0;
  let pw = 1;
  for (let k = 0; k <= n; k++) {
    s += c[k]! * pw;
    out.push(s);
    pw *= x - a;
  }
  return out;
}

/**
 * Anzahl richtiger Nachkommastellen: das größte d (0 … maxD), für das
 * |Näherung − genau| < 0,5 · 10⁻ᵈ gilt; −1, wenn nicht einmal die Einerstelle stimmt.
 */
export function correctDecimals(approx: number, exact: number, maxD = 12): number {
  const e = Math.abs(approx - exact);
  if (!Number.isFinite(e)) return -1;
  let d = -1;
  while (d < maxD && e < 0.5 * 10 ** -(d + 1)) d++;
  return d;
}

/** Kleinster Grad n (≤ nMax), für den Tₙ(x) auf d Nachkommastellen genau ist; null, wenn keiner reicht. */
export function degreeForDecimals(fn: Fn, a: number, x: number, d: number, nMax = 40): number | null {
  const exact = fn.f(x);
  for (let n = 0; n <= nMax; n++) if (Math.abs(taylor(fn, a, n, x) - exact) < 0.5 * 10 ** -d) return n;
  return null;
}

/** Fehler |Rₙ(x)| für n = 0 … nMax (für das Fehlerdiagramm). */
export function errorsOverN(fn: Fn, a: number, x: number, nMax: number): number[] {
  return Array.from({ length: nMax + 1 }, (_, n) => Math.abs(remainder(fn, a, n, x)));
}

/**
 * Lage der Prüfstelle zum Konvergenzintervall: 'inside' (|x − a| < r),
 * 'edge' (|x − a| = r), 'outside' (|x − a| > r). Bei r = ∞ immer 'inside'.
 */
export function convergenceAt(fn: Fn, a: number, x: number): 'inside' | 'edge' | 'outside' {
  const r = fn.radius(a);
  if (!Number.isFinite(r)) return 'inside';
  const q = Math.abs(x - a);
  if (Math.abs(q - r) < 1e-9) return 'edge';
  return q < r ? 'inside' : 'outside';
}

/**
 * Größtes Intervall [l, r] um a, in dem |f(x) − Tₙ(x)| < ε gilt („Gültigkeitsbereich“ der
 * Näherung). Gesucht wird schrittweise von a nach außen bis höchstens [lo, hi]; die Ränder
 * werden per Intervallhalbierung verfeinert. Liegt a selbst außerhalb von [lo, hi] oder
 * ist f dort nicht definiert, wird [a, a] geliefert.
 */
export function validInterval(fn: Fn, a: number, n: number, eps: number, lo: number, hi: number): [number, number] {
  const ok = (x: number) => {
    const r = remainder(fn, a, n, x);
    return Number.isFinite(r) && Math.abs(r) < eps;
  };
  const edge = (dir: 1 | -1, limit: number): number => {
    const steps = 400;
    const h = Math.abs(limit - a) / steps;
    if (h === 0) return a;
    let inside = a;
    for (let i = 1; i <= steps; i++) {
      const x = a + dir * h * i;
      if (!ok(x)) {
        let good = inside;
        let bad = x;
        for (let j = 0; j < 40; j++) {
          const m = (good + bad) / 2;
          if (ok(m)) good = m;
          else bad = m;
        }
        return good;
      }
      inside = x;
    }
    return limit;
  };
  if (a < lo || a > hi || !ok(a)) return [a, a];
  return [edge(-1, lo), edge(1, hi)];
}

/**
 * Lagrange-Abschätzung des Restglieds |Rₙ(x)| ≤ M · |x − a|ⁿ⁺¹ / (n + 1)!, wobei M eine
 * Schranke für |f⁽ⁿ⁺¹⁾| zwischen a und x ist: bei sin und cos M = 1, bei eˣ M = e^max(a, x).
 * Für ln(1 + x) und 1/(1 − x) gibt es hier keine einfache Schranke (null).
 */
export function lagrangeBound(key: FnKey, a: number, n: number, x: number): number | null {
  const d = Math.abs(x - a) ** (n + 1) / fact(n + 1);
  if (key === 'sin' || key === 'cos') return d;
  if (key === 'exp') return Math.exp(Math.max(a, x)) * d;
  return null;
}

/**
 * Schärfere Lagrange-Schranke: Ist Tₙ = Tₙ₊₁ = … = Tₘ (die nächsten Koeffizienten sind 0),
 * darf man mit dem Grad m abschätzen. Beispiel sin um 0, n = 3: T₃ = T₄, also
 * |R₃(x)| ≤ |x|⁵/5!. Liefert den Grad m und die Schranke (oder null).
 */
export function lagrangeSharp(key: FnKey, a: number, n: number, x: number): { m: number; bound: number } | null {
  const m = matchOrder(FNS[key], a, n);
  const b = lagrangeBound(key, a, m, x);
  return b === null ? null : { m, bound: b };
}

/* ------------------------------------------------------------------ */
/* Kleinwinkelnäherung sin φ ≈ φ                                       */
/* ------------------------------------------------------------------ */

/** Absoluter Fehler der Kleinwinkelnäherung φ − sin φ (φ im Bogenmaß). */
export function smallAngleError(phi: number): number {
  return phi - Math.sin(phi);
}

/** Relativer Fehler (φ − sin φ)/sin φ (für 0 < φ < π). Bei φ = 0 ist er 0. */
export function smallAngleRelError(phi: number): number {
  if (Math.abs(phi) < 1e-12) return 0;
  return (phi - Math.sin(phi)) / Math.sin(phi);
}

/** Bisektion auf [0, hi] für eine in φ wachsende Funktion g mit g(0) < 0 < g(hi). */
function bisect(g: (x: number) => number, hi: number): number {
  let lo = 0;
  let up = hi;
  for (let i = 0; i < 80; i++) {
    const m = (lo + up) / 2;
    if (g(m) < 0) lo = m;
    else up = m;
  }
  return (lo + up) / 2;
}

/** Größtes φ > 0 mit |sin φ − φ| < ε (für ε = 0,01: φ ≈ 0,392493 ≈ 22,5°). */
export function smallAngleLimit(eps: number): number {
  return bisect((x) => smallAngleError(x) - eps, Math.PI);
}

/** Größtes φ > 0 mit relativem Fehler < rel (für 1 %: φ ≈ 0,2444 ≈ 14,0°). */
export function smallAngleRelLimit(rel: number): number {
  return bisect((x) => smallAngleRelError(x) - rel, 3);
}

/** Bogenmaß ↔ Gradmaß */
export const toRad = (deg: number) => (deg * Math.PI) / 180;
export const toDeg = (rad: number) => (rad * 180) / Math.PI;
