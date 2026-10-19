/**
 * Rechenlogik „Newton-Verfahren“ (Jgst. 11).
 *
 * Von einem Startwert x₀ aus wird die Tangente an den Graphen gelegt; ihr
 * Schnittpunkt mit der x-Achse ist der nächste Näherungswert:
 *   x_{n+1} = x_n − f(x_n) / f'(x_n)
 * In der Nähe einer einfachen Nullstelle verdoppelt sich die Anzahl der
 * richtigen Stellen ungefähr mit jedem Schritt (quadratische Konvergenz).
 * Es kann aber auch scheitern: waagrechte Tangente, Zyklus, Divergenz.
 */

export type FnKey = 'sq2' | 'cubic' | 'cos' | 'three' | 'cycle';

export interface Fn {
  f: (x: number) => number;
  df: (x: number) => number;
  /** Nullstellen (genau genug für Vergleiche) */
  roots: number[];
}

export const FNS: Record<FnKey, Fn> = {
  sq2: { f: (x) => x * x - 2, df: (x) => 2 * x, roots: [-Math.SQRT2, Math.SQRT2] },
  cubic: { f: (x) => x ** 3 - 2 * x - 5, df: (x) => 3 * x * x - 2, roots: [2.0945514815423265] },
  cos: { f: (x) => Math.cos(x) - x, df: (x) => -Math.sin(x) - 1, roots: [0.7390851332151607] },
  three: { f: (x) => x ** 3 - 3 * x + 1, df: (x) => 3 * x * x - 3, roots: [-1.8793852415718169, 0.34729635533386066, 1.532088886237956] },
  cycle: { f: (x) => x ** 3 - 2 * x + 2, df: (x) => 3 * x * x - 2, roots: [-1.7692923542386314] },
};

export type Status = 'ok' | 'flat' | 'far';

export interface Step {
  x: number;
  fx: number;
  dfx: number;
  /** nächster Näherungswert (null, wenn die Tangente waagrecht ist) */
  next: number | null;
  status: Status;
}

/** Ein Newton-Schritt. */
export function newtonStep(fn: Fn, x: number): Step {
  const fx = fn.f(x);
  const dfx = fn.df(x);
  if (Math.abs(dfx) < 1e-12) return { x, fx, dfx, next: null, status: 'flat' };
  const next = x - fx / dfx;
  return { x, fx, dfx, next, status: Math.abs(next) > 1e6 ? 'far' : 'ok' };
}

/** n Schritte ab x₀ (bricht bei waagrechter Tangente oder Divergenz ab). */
export function iterate(fn: Fn, x0: number, n: number): Step[] {
  const out: Step[] = [];
  let x = x0;
  for (let i = 0; i < n; i++) {
    const s = newtonStep(fn, x);
    out.push(s);
    if (s.next === null || s.status !== 'ok') break;
    x = s.next;
  }
  return out;
}

/** Folge x₀, x₁, …, x_n (soweit berechenbar). */
export function sequence(fn: Fn, x0: number, n: number): number[] {
  const steps = iterate(fn, x0, n);
  const xs = [x0];
  for (const s of steps) if (s.next !== null) xs.push(s.next);
  return xs;
}

export function nearestRoot(fn: Fn, x: number): number {
  return fn.roots.reduce((best, r) => (Math.abs(r - x) < Math.abs(best - x) ? r : best), fn.roots[0]!);
}

/** Anzahl der richtigen Nachkommastellen (bezogen auf die nächste Nullstelle). */
export function correctDigits(fn: Fn, x: number, max = 12): number {
  const err = Math.abs(x - nearestRoot(fn, x));
  if (err === 0) return max;
  return Math.max(0, Math.min(max, Math.floor(-Math.log10(2 * err))));
}

/** Erkennt einen Zyklus der Länge 2 (x_{n+2} ≈ x_n, aber x_{n+1} weit weg). */
export function isCycle(xs: number[]): boolean {
  if (xs.length < 4) return false;
  const k = xs.length - 1;
  return Math.abs(xs[k]! - xs[k - 2]!) < 1e-6 && Math.abs(xs[k]! - xs[k - 1]!) > 1e-3;
}

/**
 * Einzugsbereich: Zu welcher Nullstelle (Index in fn.roots) läuft das Verfahren vom
 * Startwert x₀ aus? −1, wenn es abbricht (waagrechte Tangente), davonläuft oder
 * nach `maxIter` Schritten keine Nullstelle erreicht (z. B. Zyklus).
 */
export function basinOf(fn: Fn, x0: number, maxIter = 60, tol = 1e-9): number {
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const s = newtonStep(fn, x);
    if (s.next === null || s.status !== 'ok') return -1;
    x = s.next;
    for (let k = 0; k < fn.roots.length; k++) if (Math.abs(x - fn.roots[k]!) < tol) return k;
  }
  return -1;
}

/** Ein Intervall [a; b] um die Nullstelle r mit Vorzeichenwechsel und ohne weitere Nullstelle. */
export function bracketFor(fn: Fn, r: number): [number, number] {
  let w = 1;
  for (let i = 0; i < 30; i++) {
    const a = r - 0.6 * w;
    const b = r + 0.4 * w;
    const others = fn.roots.some((q) => q !== r && q > a && q < b);
    if (!others && fn.f(a) * fn.f(b) < 0) return [a, b];
    w /= 2;
  }
  return [r - 1e-3, r + 1e-3];
}

/** Intervallhalbierung: die ersten n Intervallmitten ausgehend von [a; b] (Vorzeichenwechsel vorausgesetzt). */
export function bisection(fn: Fn, a: number, b: number, n: number): number[] {
  const out: number[] = [];
  let lo = a;
  let hi = b;
  let flo = fn.f(lo);
  for (let i = 0; i < n; i++) {
    const m = (lo + hi) / 2;
    out.push(m);
    const fm = fn.f(m);
    if (fm === 0) {
      lo = hi = m;
    } else if (flo * fm < 0) hi = m;
    else {
      lo = m;
      flo = fm;
    }
  }
  return out;
}
