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
export type Sign = 1 | -1;

const EPS = 1e-9;
const same = (u: number, v: number) => Math.abs(u - v) < EPS;
/** Rundungsreste (z. B. 2,9999999999) entfernen; Koeffizienten liegen hier auf Vielfachen von 1/2ᵏ. */
const tidy = (v: number) => (Math.abs(v) < EPS ? 0 : Math.abs(v - Math.round(v * 1e8) / 1e8) < 1e-11 ? Math.round(v * 1e8) / 1e8 : v);

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
  /** Zählergrad und Nennergrad des gegebenen (ungekürzten) Terms */
  m: number;
  n: number;
  /** Division geht auf (Rest 0): f ist nach dem Kürzen ganzrational, keine echte Asymptote */
  exact: boolean;
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

/**
 * Welche Faktoren kürzen sich gegenseitig? Paare (Index im Zähler, Index im
 * Nenner) in derselben Reihenfolge wie `reduce` (für das Durchstreichen im Term).
 */
export function cancelPairs(f: Rational): { zi: number; pi: number; x: number }[] {
  const used = new Set<number>();
  const out: { zi: number; pi: number; x: number }[] = [];
  f.poles.forEach((p, pi) => {
    const zi = f.zeros.findIndex((z, i) => !used.has(i) && same(z, p));
    if (zi >= 0) {
      used.add(zi);
      out.push({ zi, pi, x: p });
    }
  });
  return out;
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
  const m = f.zeros.length;
  const n = f.poles.length;
  if (f.a === 0) {
    // f ist die Nullfunktion mit Definitionslücken: keine Polstellen, nur Löcher auf der x-Achse
    const gaps = group([...f.poles]).map((g) => g.x);
    return { gaps, zeros: [], poles: [], holes: gaps.map((x) => ({ x, y: 0 })), kind: 'zero', asym: [0], rest: [0], num: [0], den: fromRoots(1, f.poles), m, n, exact: false };
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
    m,
    n,
    exact: kind !== 'zero' && degree(div.r) < 0,
  };
}

/* ---------------- Polynomdivision Schritt für Schritt ---------------- */

export interface DivStep {
  /** Potenz des neuen Quotienten-Summanden c · xᵏ */
  k: number;
  c: number;
  /** abgezogenes Produkt c · xᵏ · q */
  sub: Poly;
  /** Rest nach dem Abziehen (alle übrigen Glieder „heruntergeholt“) */
  rem: Poly;
}

/**
 * Polynomdivision wie an der Tafel: höchstes Glied des Rests durch das höchste
 * Glied des Divisors teilen, mit dem Divisor zurückmultiplizieren, abziehen.
 * Schritte mit Quotienten-Koeffizient 0 entfallen (wie beim Rechnen von Hand).
 */
export function divisionSteps(p: Poly, q: Poly): { steps: DivStep[]; quotient: Poly; rest: Poly } {
  const dq = degree(q);
  const dp = degree(p);
  let r = p.map(tidy);
  if (dq < 0) throw new Error('Division durch das Nullpolynom');
  if (dp < dq) return { steps: [], quotient: [0], rest: r.slice(0, Math.max(1, dp + 1)) };
  const quotient = new Array<number>(dp - dq + 1).fill(0);
  const steps: DivStep[] = [];
  for (let k = dp - dq; k >= 0; k--) {
    const c = tidy(r[k + dq]! / q[dq]!);
    if (c === 0) continue;
    quotient[k] = c;
    const sub = new Array<number>(k + dq + 1).fill(0);
    for (let j = 0; j <= dq; j++) sub[k + j] = tidy(c * q[j]!);
    r = r.map((v, i) => tidy(v - (sub[i] ?? 0)));
    r[k + dq] = 0;
    steps.push({ k, c, sub, rem: r.slice(0, Math.max(1, k + dq)) });
  }
  return { steps, quotient, rest: r.slice(0, Math.max(1, dq)) };
}

/** Abweichung von der Asymptote (bzw. Näherungskurve): f(x) − s(x) = r(x)/q(x). */
export function deviation(an: Analysis, x: number): number {
  return evalPoly(an.rest, x) / evalPoly(an.den, x);
}

/* ---------------- Verhalten an einer Polstelle ---------------- */

/**
 * Näherung nahe einer Polstelle x₀ der Ordnung k: f(x) ≈ c / (x − x₀)ᵏ mit
 * c = a · ∏ (x₀ − zᵢ) / ∏ (x₀ − qⱼ) über die übrigen (gekürzten) Faktoren.
 * Ist x₀ keine Polstelle, ist k = 0.
 */
export function poleApprox(f: Rational, x0: number): { k: number; c: number } {
  const r = reduce(f);
  let c = f.a;
  let k = 0;
  for (const z of r.zeros) c *= x0 - z;
  for (const q of r.poles) {
    if (same(q, x0)) k++;
    else c /= x0 - q;
  }
  return { k, c };
}

/** Wertetabelle bei x₀ ± h mit h = 0,1; 0,01; … (einseitige Annäherung). */
export function approachTable(f: Rational, x0: number, count = 4): { h: number; left: { x: number; y: number }; right: { x: number; y: number } }[] {
  const out: { h: number; left: { x: number; y: number }; right: { x: number; y: number } }[] = [];
  for (let k = 1; k <= count; k++) {
    const h = 10 ** -k;
    const xl = x0 - h;
    const xr = x0 + h;
    out.push({ h, left: { x: xl, y: value(f, xl) }, right: { x: xr, y: value(f, xr) } });
  }
  return out;
}

/* ---------------- Vorzeichentabelle ---------------- */

export interface SignRow {
  /** Nullstelle des Faktors (x − x₀)ᵐ */
  x: number;
  m: number;
  /** Faktor im Zähler oder im Nenner */
  part: 'num' | 'den';
  /** Vorzeichen des Faktors in den Intervallen (K + 1 Stück bei K kritischen Stellen) */
  signs: Sign[];
}

export interface SignTable {
  /** kritische Stellen (Zähler- und Nennernullstellen), aufsteigend */
  xs: number[];
  /** was an der kritischen Stelle passiert */
  marks: ('zero' | 'pole' | 'hole')[];
  rows: SignRow[];
  /** Vorzeichen von a */
  lead: Sign;
  /** Vorzeichen von f in den Intervallen */
  result: Sign[];
}

/**
 * Vorzeichentabelle aus den Faktoren des gegebenen Terms (eine Zeile pro
 * Faktor bzw. Potenz). (x − x₀)ᵐ ist links von x₀ gleich (−1)ᵐ, rechts positiv;
 * Nennerfaktoren gehen genauso ein (1/y hat das Vorzeichen von y).
 */
export function signTable(f: Rational): SignTable {
  const zs = group([...f.zeros]);
  const ps = group([...f.poles]);
  const xs = group([...f.zeros, ...f.poles]).map((g) => g.x);
  const K = xs.length;
  const idx = (x: number) => xs.findIndex((v) => same(v, x));
  const mk = (g: { x: number; k: number }, part: 'num' | 'den'): SignRow => {
    const j = idx(g.x);
    return { x: g.x, m: g.k, part, signs: Array.from({ length: K + 1 }, (_, k) => (k <= j ? ((g.k % 2 === 0 ? 1 : -1) as Sign) : 1)) };
  };
  const rows = [...zs.map((g) => mk(g, 'num')), ...ps.map((g) => mk(g, 'den'))];
  const lead: Sign = f.a < 0 ? -1 : 1;
  const result = Array.from({ length: K + 1 }, (_, k) => rows.reduce<Sign>((s, r) => (s * r.signs[k]!) as Sign, lead));
  const an = analyze(f);
  const marks = xs.map((x) => (an.poles.some((p) => same(p.x, x)) ? 'pole' : an.holes.some((h) => same(h.x, x)) ? 'hole' : 'zero') as 'zero' | 'pole' | 'hole');
  return { xs, marks, rows, lead, result };
}

/* ---------------- Weitere Eigenschaften ---------------- */

/** Reelle Nullstellen eines Polynoms vom Grad ≤ 2 (aufsteigend); Nullpolynom: leer. */
export function realRoots(p: Poly): number[] {
  const d = degree(p);
  if (d <= 0) return [];
  if (d === 1) return [-p[0]! / p[1]!];
  if (d === 2) {
    const [c, b, a] = [p[0]!, p[1]!, p[2]!];
    const D = b * b - 4 * a * c;
    if (D < -EPS) return [];
    if (Math.abs(D) <= EPS) return [-b / (2 * a)];
    const s = Math.sqrt(D);
    return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((u, v) => u - v);
  }
  throw new Error('nur bis Grad 2');
}

/**
 * Schnittstellen des Graphen mit der Asymptote bzw. Näherungskurve:
 * f(x) = s(x) ⇔ r(x) = 0 (und x ∈ D). Bei aufgehender Division leer.
 */
export function asymptoteCrossings(f: Rational, an: Analysis = analyze(f)): { x: number; y: number }[] {
  if (f.a === 0 || an.exact) return [];
  return realRoots(an.rest)
    .filter((x) => !an.gaps.some((g) => same(g, x)))
    .map((x) => ({ x: tidy(x), y: tidy(evalPoly(an.asym, x)) }));
}

/** y-Achsenabschnitt f(0) (NaN, wenn 0 nicht zur Definitionsmenge gehört). */
export function yIntercept(f: Rational): number {
  return value(f, 0);
}

/**
 * Symmetrie des Graphen: 'even' (achsensymmetrisch zur y-Achse), 'odd'
 * (punktsymmetrisch zum Ursprung) oder null. Voraussetzung: D ist
 * symmetrisch; geprüft an Stichproben (f ist durch wenige Werte festgelegt).
 */
export function symmetry(f: Rational): 'even' | 'odd' | null {
  if (f.a === 0) return null;
  const an = analyze(f);
  if (!an.gaps.every((g) => an.gaps.some((h) => same(h, -g)))) return null;
  const xs = [0.37, 1.13, 1.71, 2.29, 3.9, 4.63, 6.3, 7.7];
  let even = true;
  let odd = true;
  for (const x of xs) {
    const u = value(f, x);
    const v = value(f, -x);
    if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
    const tol = 1e-9 * Math.max(1, Math.abs(u));
    if (Math.abs(u - v) > tol) even = false;
    if (Math.abs(u + v) > tol) odd = false;
  }
  return even ? 'even' : odd ? 'odd' : null;
}
