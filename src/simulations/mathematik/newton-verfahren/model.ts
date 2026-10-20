/**
 * Rechenlogik „Newton-Verfahren“ (Jgst. 11).
 *
 * Von einem Startwert x₀ aus wird die Tangente an den Graphen gelegt; ihr
 * Schnittpunkt mit der x-Achse ist der nächste Näherungswert:
 *   x_{n+1} = x_n − f(x_n) / f′(x_n)
 * Herleitung über das Steigungsdreieck: Die Tangente im Punkt (x_n | f(x_n))
 * hat die Steigung f′(x_n) = f(x_n) : (x_n − x_{n+1}).
 *
 * In der Nähe einer einfachen Nullstelle x* gilt e_{n+1} ≈ C · e_n² mit
 * C = |f″(x*) / (2 f′(x*))| (quadratische Konvergenz): Die Anzahl der richtigen
 * Stellen verdoppelt sich ungefähr. An einer doppelten Nullstelle halbiert sich
 * der Fehler nur noch (lineare Konvergenz). Das Verfahren kann auch scheitern:
 * waagrechte Tangente, Zyklus, Davonlaufen oder Sprung zu einer anderen Nullstelle.
 */

export type FnKey = 'sq2' | 'cubic' | 'cos' | 'three' | 'cycle' | 'dbl';
export const FN_KEYS: FnKey[] = ['sq2', 'cubic', 'cos', 'three', 'cycle', 'dbl'];

export interface Fn {
  f: (x: number) => number;
  /** erste Ableitung */
  df: (x: number) => number;
  /** zweite Ableitung (für die Konstante der quadratischen Konvergenz) */
  d2f: (x: number) => number;
  /** reelle Nullstellen, aufsteigend (genau genug für Vergleiche) */
  roots: number[];
  /** Vielfachheit der Nullstellen (gleiche Reihenfolge) */
  mult: number[];
}

export const FNS: Record<FnKey, Fn> = {
  /** x² − 2: Newton ist hier genau das Heron-Verfahren für √2. */
  sq2: { f: (x) => x * x - 2, df: (x) => 2 * x, d2f: () => 2, roots: [-Math.SQRT2, Math.SQRT2], mult: [1, 1] },
  /** Newtons eigenes Beispiel (1669): x³ − 2x − 5 = 0. */
  cubic: { f: (x) => x ** 3 - 2 * x - 5, df: (x) => 3 * x * x - 2, d2f: (x) => 6 * x, roots: [2.0945514815423265], mult: [1] },
  /** cos x = x (Bogenmaß): nicht nach x auflösbar. */
  cos: { f: (x) => Math.cos(x) - x, df: (x) => -Math.sin(x) - 1, d2f: (x) => -Math.cos(x), roots: [0.7390851332151607], mult: [1] },
  /** x³ − 3x + 1: drei Nullstellen, waagrechte Tangenten bei x = ±1. */
  three: { f: (x) => x ** 3 - 3 * x + 1, df: (x) => 3 * x * x - 3, d2f: (x) => 6 * x, roots: [-1.8793852415718169, 0.34729635533386066, 1.532088886237956], mult: [1, 1, 1] },
  /** x³ − 2x + 2: ab x₀ = 0 der Zyklus 0 → 1 → 0 → … */
  cycle: { f: (x) => x ** 3 - 2 * x + 2, df: (x) => 3 * x * x - 2, d2f: (x) => 6 * x, roots: [-1.7692923542386314], mult: [1] },
  /**
   * x³ − 3x + 2 = (x − 1)² · (x + 2): doppelte Nullstelle bei 1.
   * In Produktform gerechnet, damit nahe x = 1 keine Auslöschung stört.
   */
  dbl: { f: (x) => (x - 1) * (x - 1) * (x + 2), df: (x) => 3 * (x - 1) * (x + 1), d2f: (x) => 6 * x, roots: [-2, 1], mult: [1, 2] },
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

/** |next| darüber: Die Folge „läuft davon“. */
export const FAR = 1e6;

/** Ein Newton-Schritt: Tangente in (x | f(x)) mit der x-Achse schneiden. */
export function newtonStep(fn: Fn, x: number): Step {
  const fx = fn.f(x);
  const dfx = fn.df(x);
  if (Math.abs(dfx) < 1e-12) return { x, fx, dfx, next: null, status: 'flat' };
  const next = x - fx / dfx;
  return { x, fx, dfx, next, status: Math.abs(next) > FAR ? 'far' : 'ok' };
}

/** n Schritte ab x₀ (bricht bei waagrechter Tangente oder Davonlaufen ab). */
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

/** Tangente in (x | f(x)) als y = m · x + b. */
export function tangent(fn: Fn, x: number): { m: number; b: number } {
  const m = fn.df(x);
  return { m, b: fn.f(x) - m * x };
}

/** Heron-Verfahren für √a: Mittelwert von x und a : x. */
export function heronStep(a: number, x: number): number {
  return (x + a / x) / 2;
}

/** Index der Nullstelle, die am nächsten an x liegt. */
export function nearestRootIndex(fn: Fn, x: number): number {
  let best = 0;
  fn.roots.forEach((r, i) => {
    if (Math.abs(r - x) < Math.abs(fn.roots[best]! - x)) best = i;
  });
  return best;
}

export function nearestRoot(fn: Fn, x: number): number {
  return fn.roots[nearestRootIndex(fn, x)]!;
}

/** Anzahl der richtigen Nachkommastellen über den Fehler (bezogen auf die nächste Nullstelle). */
export function correctDigits(fn: Fn, x: number, max = 12): number {
  const err = Math.abs(x - nearestRoot(fn, x));
  if (err === 0) return max;
  return Math.max(0, Math.min(max, Math.floor(-Math.log10(2 * err))));
}

/**
 * Richtige Nachkommastellen „wie in der Tabelle“: Wie viele Nachkommastellen von
 * v stimmen (abgeschnitten, nicht gerundet) mit r überein? −1: nicht einmal der
 * ganzzahlige Teil stimmt.
 */
export function matchingDecimals(v: number, r: number, max = 12): number {
  for (let d = max; d >= 0; d--) {
    const s = 10 ** d;
    if (Math.trunc(v * s + Math.sign(v) * 1e-9) === Math.trunc(r * s + Math.sign(r) * 1e-9) && Math.abs(v - r) < 1 / s) return d;
  }
  return -1;
}

/** Erkennt einen Zyklus der Länge 2 (x_{n+2} ≈ x_n, aber x_{n+1} weit weg). */
export function isCycle(xs: number[]): boolean {
  if (xs.length < 3) return false;
  const k = xs.length - 1;
  return Math.abs(xs[k]! - xs[k - 2]!) < 1e-6 && Math.abs(xs[k]! - xs[k - 1]!) > 1e-3;
}

/** Wohin führt das Verfahren ab x₀ auf lange Sicht? */
export type Outcome =
  | { kind: 'root'; root: number; index: number; steps: number }
  | { kind: 'flat'; at: number; steps: number }
  | { kind: 'cycle'; period: number; values: number[] }
  | { kind: 'far'; steps: number }
  | { kind: 'open' };

/**
 * Klassifiziert den Verlauf ab x₀ (höchstens maxIter Schritte):
 * Konvergenz gegen eine Nullstelle, waagrechte Tangente, Zyklus (Länge 2 bis 4),
 * Davonlaufen oder unentschieden.
 */
export function classify(fn: Fn, x0: number, maxIter = 80): Outcome {
  const xs = [x0];
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const s = newtonStep(fn, x);
    if (s.next === null) return { kind: 'flat', at: x, steps: i };
    if (s.status === 'far' || !Number.isFinite(s.next)) return { kind: 'far', steps: i + 1 };
    x = s.next;
    xs.push(x);
    // angekommen: sehr nahe an einer Nullstelle
    for (let j = 0; j < fn.roots.length; j++) {
      const r = fn.roots[j]!;
      const tol = fn.mult[j]! > 1 ? 1e-7 : 1e-10;
      if (Math.abs(x - r) < tol * Math.max(1, Math.abs(r))) return { kind: 'root', root: r, index: j, steps: i + 1 };
    }
    // Zyklus: Wert wiederholt sich nach p Schritten, ohne Nullstelle zu sein
    if (i >= 6) {
      for (let p = 2; p <= 4; p++) {
        const a = xs[xs.length - 1]!;
        const b = xs[xs.length - 1 - p]!;
        const c = xs[xs.length - 2]!;
        if (Math.abs(a - b) < 1e-7 && Math.abs(a - c) > 1e-4) {
          return { kind: 'cycle', period: p, values: xs.slice(xs.length - p).sort((u, v) => u - v) };
        }
      }
    }
  }
  return { kind: 'open' };
}

/**
 * Einzugsbereiche: Für jeden Startwert der Index der erreichten Nullstelle,
 * −1, wenn das Verfahren keine Nullstelle findet (Zyklus, waagrechte Tangente,
 * Davonlaufen, unentschieden).
 */
export function basinMap(fn: Fn, starts: number[], maxIter = 60): number[] {
  return starts.map((x0) => {
    const o = classify(fn, x0, maxIter);
    return o.kind === 'root' ? o.index : -1;
  });
}

/**
 * Konstante der quadratischen Konvergenz an einer einfachen Nullstelle r:
 * e_{n+1} ≈ C · e_n² mit C = |f″(r) / (2 f′(r))|. Bei mehrfacher Nullstelle NaN.
 */
export function quadConstant(fn: Fn, r: number): number {
  const d = fn.df(r);
  if (Math.abs(d) < 1e-9) return NaN;
  return Math.abs(fn.d2f(r) / (2 * d));
}

/** Fehler |x_n − r| für die ganze Folge. */
export function errors(xs: number[], r: number): number[] {
  return xs.map((x) => Math.abs(x - r));
}
