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
  /** k-te Ableitung an der Stelle a */
  d: (k: number, a: number) => number;
  /** Konvergenzradius um a */
  radius: (a: number) => number;
  /** zulässige Entwicklungsstellen */
  aMin: number;
  aMax: number;
}

const fact = (k: number) => {
  let r = 1;
  for (let i = 2; i <= k; i++) r *= i;
  return r;
};
export { fact as factorial };

export const FNS: Record<FnKey, Fn> = {
  sin: { f: Math.sin, d: (k, a) => Math.sin(a + (k * Math.PI) / 2), radius: () => Infinity, aMin: -3.2, aMax: 3.2 },
  cos: { f: Math.cos, d: (k, a) => Math.cos(a + (k * Math.PI) / 2), radius: () => Infinity, aMin: -3.2, aMax: 3.2 },
  exp: { f: Math.exp, d: (_k, a) => Math.exp(a), radius: () => Infinity, aMin: -2, aMax: 2 },
  ln: {
    f: (x) => (x > -1 ? Math.log(1 + x) : NaN),
    d: (k, a) => (k === 0 ? Math.log(1 + a) : ((k % 2 === 1 ? 1 : -1) * fact(k - 1)) / (1 + a) ** k),
    radius: (a) => 1 + a,
    aMin: -0.5,
    aMax: 2,
  },
  geo: {
    f: (x) => (x === 1 ? NaN : 1 / (1 - x)),
    d: (k, a) => fact(k) / (1 - a) ** (k + 1),
    radius: (a) => Math.abs(1 - a),
    aMin: -2,
    aMax: 0.5,
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
