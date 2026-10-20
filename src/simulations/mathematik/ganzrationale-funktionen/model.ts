/**
 * Rechenlogik „Ganzrationale Funktionen: Nullstellen, Vielfachheit und
 * Randverhalten“ (Jahrgangsstufe 10/11).
 *
 * Die Funktion wird in Linearfaktoren angegeben:
 *   f(x) = a · (x − x₁)^m₁ · (x − x₂)^m₂ · …
 * Grad n = m₁ + m₂ + …, Leitkoeffizient a.
 *
 * Verhalten an einer Nullstelle der Vielfachheit m:
 * - m ungerade: Vorzeichenwechsel (m = 1: Schnittpunkt, m ≥ 3: Terrassenpunkt
 *   bzw. Sattelpunkt, der Graph schmiegt sich an die x-Achse an),
 * - m gerade: kein Vorzeichenwechsel (Berührpunkt, Extrempunkt auf der x-Achse).
 *
 * Nahe einer Nullstelle x₀ der Vielfachheit m verhält sich f wie
 *   c · (x − x₀)^m   mit   c = a · ∏ (x₀ − xⱼ)^mⱼ  (Produkt über die übrigen Nullstellen),
 * also wie eine Gerade (m = 1), eine Parabel (m = 2) oder eine kubische Parabel (m = 3).
 *
 * Randverhalten: Für große |x| ist f(x) / (a · xⁿ) = ∏ (1 − xᵢ/x)^mᵢ → 1, d. h. nur
 * der Summand mit der höchsten Potenz zählt. Für x → +∞ hat f(x) das Vorzeichen
 * von a; für x → −∞ das Vorzeichen von a · (−1)ⁿ.
 */

export interface Root {
  x: number;
  m: number;
}

export type ZeroKind = 'cross' | 'touch' | 'terrace';
export type Sign = 1 | -1;

/** Gleiche Nullstellen zusammenfassen (Vielfachheiten addieren), nach x sortiert. */
export function mergeRoots(roots: Root[], tol = 1e-9): Root[] {
  const out: Root[] = [];
  for (const r of [...roots].sort((p, q) => p.x - q.x)) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.x - r.x) <= tol) last.m += r.m;
    else out.push({ ...r });
  }
  return out;
}

export function degree(roots: Root[]): number {
  return roots.reduce((s, r) => s + r.m, 0);
}

/** f(x) = a · ∏ (x − xᵢ)^mᵢ */
export function evaluate(a: number, roots: Root[], x: number): number {
  let v = a;
  for (const r of roots) v *= (x - r.x) ** r.m;
  return v;
}

/** Koeffizienten der Normalform, von x⁰ aufwärts: [c₀, c₁, …, cₙ]. */
export function expand(a: number, roots: Root[]): number[] {
  let c = [a];
  for (const r of roots) {
    for (let k = 0; k < r.m; k++) {
      // mit (x − r.x) multiplizieren
      const next = new Array<number>(c.length + 1).fill(0);
      c.forEach((v, i) => {
        next[i + 1]! += v;
        next[i]! -= v * r.x;
      });
      c = next;
    }
  }
  return c.map((v) => (Math.abs(v) < 1e-12 ? 0 : v));
}

/** Wert der Normalform (Horner-Schema), Koeffizienten von x⁰ aufwärts. */
export function evalPoly(c: readonly number[], x: number): number {
  let v = 0;
  for (let i = c.length - 1; i >= 0; i--) v = v * x + c[i]!;
  return v;
}

export function zeroKind(m: number): ZeroKind {
  if (m % 2 === 0) return 'touch';
  return m === 1 ? 'cross' : 'terrace';
}

/** Wechselt f an einer Nullstelle der Vielfachheit m das Vorzeichen? (genau bei ungeradem m) */
export function changesSign(m: number): boolean {
  return m % 2 === 1;
}

/** Vorzeichen von f für x → −∞ und x → +∞. */
export function endBehaviour(a: number, n: number): { left: Sign; right: Sign } {
  const right: Sign = a > 0 ? 1 : -1;
  const left: Sign = (n % 2 === 0 ? right : -right) as Sign;
  return { left, right };
}

/**
 * Vorzeichen in den Intervallen zwischen den (zusammengefassten) Nullstellen:
 * signs[0] links der kleinsten Nullstelle, signs[k] rechts der k-ten.
 */
export function signChart(a: number, roots: Root[]): Sign[] {
  const rs = mergeRoots(roots);
  const n = degree(rs);
  const signs: Sign[] = [endBehaviour(a, n).left];
  for (const r of rs) {
    const last = signs[signs.length - 1]!;
    signs.push(r.m % 2 === 1 ? ((-last) as Sign) : last);
  }
  return signs;
}

/* ---------------- Vorzeichentabelle (Zeile pro Faktor) ---------------- */

export interface SignRow {
  /** Nullstelle des Faktors (x − x₀)^m */
  x: number;
  m: number;
  /** Vorzeichen des Faktors in den Intervallen (K + 1 Stück bei K Nullstellen) */
  signs: Sign[];
}

export interface SignTable {
  /** zusammengefasste Nullstellen, aufsteigend */
  zeros: Root[];
  /** eine Zeile pro Linearfaktor-Potenz */
  rows: SignRow[];
  /** Vorzeichen von a (in allen Intervallen gleich) */
  lead: Sign;
  /** Ergebniszeile: Vorzeichen von f in den Intervallen */
  result: Sign[];
}

/**
 * Vorzeichentabelle wie im Unterricht: (x − x₀)^m ist links von x₀ negativ hoch m,
 * also (−1)^m, rechts davon positiv. f hat in jedem Intervall das Produkt der
 * Vorzeichen aller Zeilen (einschließlich der Zeile für a).
 */
export function signTable(a: number, roots: Root[]): SignTable {
  const zeros = mergeRoots(roots);
  const K = zeros.length;
  const rows: SignRow[] = zeros.map((z, j) => ({
    x: z.x,
    m: z.m,
    signs: Array.from({ length: K + 1 }, (_, k) => (k <= j ? ((z.m % 2 === 0 ? 1 : -1) as Sign) : 1)),
  }));
  const lead: Sign = a > 0 ? 1 : -1;
  const result: Sign[] = Array.from({ length: K + 1 }, (_, k) => rows.reduce<Sign>((s, r) => (s * r.signs[k]!) as Sign, lead));
  return { zeros, rows, lead, result };
}

/* ---------------- Lokales Verhalten und Randverhalten ---------------- */

export type LocalShape = 'line' | 'parabola' | 'cubic' | 'quartic' | 'higher';

/**
 * Näherung nahe der (zusammengefassten) Nullstelle Nummer i:
 * f(x) ≈ c · (x − x₀)^m mit c = a · ∏ (x₀ − xⱼ)^mⱼ über die übrigen Nullstellen.
 */
export function localApprox(a: number, roots: Root[], i: number): { x0: number; m: number; c: number } {
  const rs = mergeRoots(roots);
  const r = rs[i]!;
  let c = a;
  rs.forEach((q, j) => {
    if (j !== i) c *= (r.x - q.x) ** q.m;
  });
  return { x0: r.x, m: r.m, c };
}

/** Form der Näherungskurve c · (x − x₀)^m. */
export function localShape(m: number): LocalShape {
  return m === 1 ? 'line' : m === 2 ? 'parabola' : m === 3 ? 'cubic' : m === 4 ? 'quartic' : 'higher';
}

/** Verhältnis f(x) / (a · xⁿ) = ∏ (1 − xᵢ/x)^mᵢ (für x ≠ 0); strebt für |x| → ∞ gegen 1. */
export function leadingRatio(roots: Root[], x: number): number {
  let v = 1;
  for (const r of roots) v *= (1 - r.x / x) ** r.m;
  return v;
}

/** y-Achsenabschnitt f(0) = a · ∏ (−xᵢ)^mᵢ. */
export function yIntercept(a: number, roots: Root[]): number {
  return evaluate(a, roots, 0);
}

/* ---------------- Exakte Koeffizienten (Brüche) ---------------- */

export interface Rational {
  /** Zähler (mit Vorzeichen) */
  n: number;
  /** Nenner (positiv) */
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Bruch kürzen, Nenner positiv. */
export function reduce(n: number, d: number): Rational {
  if (n === 0) return { n: 0, d: 1 };
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { n: (s * n) / g, d: (s * d) / g };
}

/**
 * Dezimalzahl aus einem Regler (z. B. 0,30000000000000004) als Bruch mit kleinem Nenner.
 * Sucht den kleinsten Nenner bis maxDen, der die Zahl auf 1e-9 genau trifft.
 */
export function toRational(v: number, maxDen = 10000): Rational {
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9 * Math.max(1, Math.abs(v))) return reduce(n, d);
  }
  return reduce(Math.round(v * maxDen), maxDen);
}

/**
 * Exakte Normalform: Koeffizienten (von x⁰ aufwärts) als gekürzte Brüche.
 * Gerechnet wird ganzzahlig: Jeder Faktor (x − p/q) wird als (q·x − p) multipliziert,
 * am Ende durch das Produkt der Nenner geteilt.
 */
export function expandExact(a: number, roots: Root[]): Rational[] {
  const A = toRational(a, 1000);
  let P = [1];
  let D = 1;
  for (const r of roots) {
    const R = toRational(r.x, 1000);
    for (let k = 0; k < r.m; k++) {
      const next = new Array<number>(P.length + 1).fill(0);
      P.forEach((v, i) => {
        next[i + 1]! += v * R.d;
        next[i]! -= v * R.n;
      });
      P = next;
      D *= R.d;
    }
  }
  const safe = P.every((v) => Math.abs(v * A.n) < Number.MAX_SAFE_INTEGER) && Math.abs(D * A.d) < Number.MAX_SAFE_INTEGER;
  if (!safe) return expand(a, roots).map((v) => toRational(v, 100000));
  return P.map((v) => reduce(v * A.n, D * A.d));
}

/** Wert eines Bruchs. */
export const ratValue = (r: Rational) => r.n / r.d;

/**
 * Anzahl der Nachkommastellen, wenn der Bruch eine abbrechende Dezimalzahl ist
 * (Nenner nur mit den Primfaktoren 2 und 5), sonst null.
 */
export function decimalPlaces(r: Rational): number | null {
  let d = r.d;
  let two = 0;
  let five = 0;
  while (d % 2 === 0) {
    d /= 2;
    two++;
  }
  while (d % 5 === 0) {
    d /= 5;
    five++;
  }
  return d === 1 ? Math.max(two, five) : null;
}

/**
 * Darstellung eines Koeffizienten: als Dezimalzahl, wenn sie abbricht und höchstens
 * maxDec Nachkommastellen hat, sonst als gekürzter Bruch.
 */
export function coefForm(r: Rational, maxDec = 4): { dec: number; places: number } | { num: number; den: number } {
  const p = decimalPlaces(r);
  if (p !== null && p <= maxDec) return { dec: r.n / r.d, places: p };
  return { num: r.n, den: r.d };
}

/* ---------------- Ausmultiplizieren Schritt für Schritt ---------------- */

export interface ExpandStep {
  /** wie viele Linearfaktor-Potenzen schon ausmultipliziert sind */
  used: number;
  /** Koeffizienten des bisherigen Produkts (ohne a, bzw. im letzten Schritt mit a) */
  coeffs: Rational[];
  /** im letzten Schritt ist a hineinmultipliziert */
  withA: boolean;
}

/**
 * Zwischenschritte beim Ausmultiplizieren: erst die Potenzen der Linearfaktoren
 * nacheinander, zuletzt mal a. Gearbeitet wird mit den zusammengefassten Nullstellen.
 */
export function expandSteps(a: number, roots: Root[]): ExpandStep[] {
  const rs = mergeRoots(roots);
  const steps: ExpandStep[] = [];
  for (let k = 1; k <= rs.length; k++) steps.push({ used: k, coeffs: expandExact(1, rs.slice(0, k)), withA: false });
  if (Math.abs(a - 1) > 1e-12) steps.push({ used: rs.length, coeffs: expandExact(a, rs), withA: true });
  return steps;
}

/* ---------------- Bildausschnitt ---------------- */

/** Bereich der x-Werte, in dem „etwas passiert“: alle Nullstellen mit etwas Rand. */
export function relevantInterval(roots: Root[], margin = 0.8): [number, number] {
  const xs = roots.map((r) => r.x);
  return [Math.min(...xs) - margin, Math.max(...xs) + margin];
}

/** Kleinster und größter Funktionswert auf [x0; x1] (abgetastet). */
export function rangeOn(f: (x: number) => number, x0: number, x1: number, samples = 240): { lo: number; hi: number } {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const y = f(x0 + ((x1 - x0) * i) / samples);
    if (!Number.isFinite(y)) continue;
    lo = Math.min(lo, y);
    hi = Math.max(hi, y);
  }
  return Number.isFinite(lo) ? { lo, hi } : { lo: -1, hi: 1 };
}

/** Zahl in Mantisse und Zehnerpotenz zerlegen: 2 500 000 → 2,5 · 10⁶. */
export function sciSplit(v: number): { mant: number; exp: number } {
  if (v === 0 || !Number.isFinite(v)) return { mant: v, exp: 0 };
  let exp = Math.floor(Math.log10(Math.abs(v)));
  let mant = v / 10 ** exp;
  if (Math.abs(Math.abs(mant) - 10) < 1e-9) {
    mant /= 10;
    exp++;
  }
  return { mant, exp };
}
