/**
 * Rechenlogik „Polstellen und Asymptoten gebrochen-rationaler Funktionen“ (Jgst. 11/12).
 *
 * f(x) = a · (x − z₁) · … · (x − zₘ) / ((x − p₁) · … · (x − pₙ))
 *
 * - Gemeinsame Linearfaktoren von Zähler und Nenner kürzen sich: dort liegt
 *   eine (stetig) behebbare Definitionslücke („Loch“ im Graphen).
 * - Übrige Nennernullstellen sind Polstellen; ungerade Ordnung → mit
 *   Vorzeichenwechsel, gerade Ordnung → ohne.
 * - Verhalten für x → ±∞ über den Grad: m < n → y = 0, m = n → y = a,
 *   m = n + 1 → schräge Asymptote (Polynomdivision), m > n + 1 → keine
 *   Gerade, aber eine ganzrationale Näherungskurve.
 *
 * Polynome als Koeffizientenlisten, niedrigster Grad zuerst.
 */

export type Poly = number[];

const EPS = 1e-9;
const same = (u: number, v: number) => Math.abs(u - v) < EPS;

export function fromRoots(a: number, roots: readonly number[]): Poly {
  let p: Poly = [a];
  for (const r of roots) p = mul(p, [-r, 1]);
  return p;
}

export function mul(p: Poly, q: Poly): Poly {
  const out = new Array<number>(p.length + q.length - 1).fill(0);
  p.forEach((u, i) => q.forEach((v, j) => (out[i + j]! += u * v)));
  return out;
}

export function evalPoly(p: Poly, x: number): number {
  let y = 0;
  for (let i = p.length - 1; i >= 0; i--) y = y * x + p[i]!;
  return y;
}

/** Grad (Nullpolynom: −1). */
export function degree(p: Poly): number {
  for (let i = p.length - 1; i >= 0; i--) if (Math.abs(p[i]!) > EPS) return i;
  return -1;
}

/** Polynomdivision p : q = s Rest r. */
export function divide(p: Poly, q: Poly): { q: Poly; r: Poly } {
  const dq = degree(q);
  const r = [...p];
  const dp = degree(p);
  if (dp < dq) return { q: [0], r: r.slice(0, Math.max(1, dp + 1)) };
  const s = new Array<number>(dp - dq + 1).fill(0);
  for (let k = dp - dq; k >= 0; k--) {
    const c = r[k + dq]! / q[dq]!;
    s[k] = c;
    for (let j = 0; j <= dq; j++) r[k + j]! -= c * q[j]!;
  }
  const rr = r.slice(0, Math.max(1, dq));
  return { q: s, r: rr.map((v) => (Math.abs(v) < EPS ? 0 : v)) };
}

export interface Rational {
  a: number;
  zeros: readonly number[];
  poles: readonly number[];
}

export interface Analysis {
  /** Definitionslücken (alle Nennernullstellen, ohne Wiederholung, sortiert) */
  gaps: number[];
  /** Nullstellen mit Vielfachheit */
  zeros: { x: number; k: number }[];
  /** Polstellen mit Ordnung */
  poles: { x: number; k: number; signChange: boolean }[];
  /** behebbare Lücken mit Grenzwert */
  holes: { x: number; y: number }[];
  /** Art des Verhaltens für |x| → ∞ */
  kind: 'zero' | 'const' | 'oblique' | 'curve';
  /** ganzrationaler Teil der Polynomdivision (Asymptote bzw. Näherungskurve) */
  asym: Poly;
  /** Rest der Polynomdivision */
  rest: Poly;
  num: Poly;
  den: Poly;
}

function group(xs: number[]): { x: number; k: number }[] {
  const out: { x: number; k: number }[] = [];
  for (const x of [...xs].sort((u, v) => u - v)) {
    const last = out[out.length - 1];
    if (last && same(last.x, x)) last.k++;
    else out.push({ x, k: 1 });
  }
  return out;
}

/** Gekürzte Faktoren: übrige Zähler- und Nennernullstellen. */
export function reduce(f: Rational): { zeros: number[]; poles: number[]; cancelled: number[] } {
  const zeros = [...f.zeros];
  const poles: number[] = [];
  const cancelled: number[] = [];
  for (const p of f.poles) {
    const i = zeros.findIndex((z) => same(z, p));
    if (i >= 0) {
      zeros.splice(i, 1);
      cancelled.push(p);
    } else poles.push(p);
  }
  return { zeros, poles, cancelled };
}

export function value(f: Rational, x: number): number {
  if (f.poles.some((p) => same(p, x))) return NaN;
  let y = f.a;
  for (const z of f.zeros) y *= x - z;
  for (const p of f.poles) y /= x - p;
  return y;
}

/** Wert der gekürzten Funktion (stetige Fortsetzung in den Löchern). */
export function reducedValue(f: Rational, x: number): number {
  const r = reduce(f);
  let y = f.a;
  for (const z of r.zeros) y *= x - z;
  for (const p of r.poles) {
    if (same(p, x)) return NaN;
    y /= x - p;
  }
  return y;
}

/** Vorzeichen von f links und rechts einer Polstelle (+1: gegen +∞, −1: gegen −∞). */
export function poleSides(f: Rational, x: number): { left: number; right: number } {
  const h = 1e-6;
  return { left: Math.sign(reducedValue(f, x - h)), right: Math.sign(reducedValue(f, x + h)) };
}

export function analyze(f: Rational): Analysis {
  if (f.a === 0) {
    // f ist die Nullfunktion mit Definitionslücken: keine Polstellen, nur Löcher auf der x-Achse
    const gaps = group([...f.poles]).map((g) => g.x);
    return { gaps, zeros: [], poles: [], holes: gaps.map((x) => ({ x, y: 0 })), kind: 'zero', asym: [0], rest: [0], num: [0], den: fromRoots(1, f.poles) };
  }
  const r = reduce(f);
  const poleG = group(r.poles);
  const holeXs = group(r.cancelled)
    .map((g) => g.x)
    .filter((x) => !poleG.some((p) => same(p.x, x)));
  const holes = holeXs.map((x) => ({ x, y: reducedValue(f, x) }));
  const zeros = group(r.zeros).filter((z) => !holeXs.some((h) => same(h, z.x)));
  const num = fromRoots(f.a, f.zeros);
  const den = fromRoots(1, f.poles);
  const m = f.zeros.length;
  const n = f.poles.length;
  const div = divide(num, den);
  let kind: Analysis['kind'];
  if (m < n) kind = 'zero';
  else if (m === n) kind = 'const';
  else if (m === n + 1) kind = 'oblique';
  else kind = 'curve';
  return {
    gaps: group([...f.poles]).map((g) => g.x),
    zeros,
    poles: poleG.map((p) => ({ x: p.x, k: p.k, signChange: p.k % 2 === 1 })),
    holes,
    kind,
    asym: kind === 'zero' ? [0] : div.q,
    rest: div.r,
    num,
    den,
  };
}
