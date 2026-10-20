/**
 * Rechenlogik „Monotonie, Extrem- und Wendestellen“ (Jgst. 11/12).
 *
 * Ganzrationale Funktionen bis Grad 4, f(x) = q x⁴ + a x³ + b x² + c x + d.
 * - notwendige Bedingung für Extremstellen: f'(x) = 0
 * - hinreichend: Vorzeichenwechsel von f' (+ → −: Hochpunkt, − → +: Tiefpunkt);
 *   ohne Vorzeichenwechsel: Terrassenpunkt
 * - Wendestellen: f''(x) = 0 mit Vorzeichenwechsel von f''
 * - Monotonie: f' > 0 ⇒ streng monoton steigend, f' < 0 ⇒ fallend
 * - Krümmung: f'' > 0 ⇒ linksgekrümmt (Linkskurve), f'' < 0 ⇒ rechtsgekrümmt
 * - zusätzlich: Symmetrie, Verhalten im Unendlichen, Nullstellen mit
 *   Vielfachheit, Vorzeichentabellen, f''-Kriterium, Tangente in einem Punkt
 */

/** Koeffizienten, niedrigster Grad zuerst. */
export type Poly = number[];

export function evalPoly(p: Poly, x: number): number {
  let y = 0;
  for (let i = p.length - 1; i >= 0; i--) y = y * x + p[i]!;
  return y;
}

export function derive(p: Poly): Poly {
  const out = p.slice(1).map((c, i) => c * (i + 1));
  return out.length ? out : [0];
}

export function degree(p: Poly): number {
  for (let i = p.length - 1; i >= 0; i--) if (Math.abs(p[i]!) > 1e-12) return i;
  return -1;
}

/** Reelle Nullstellen auf [lo, hi]: Vorzeichenwechsel und Berührstellen (doppelte Nullstellen). */
export function realZeros(p: Poly, lo: number, hi: number): number[] {
  if (degree(p) < 0) return [];
  const g = (x: number) => evalPoly(p, x);
  const out: number[] = [];
  const bis = (a: number, b: number, h: (x: number) => number) => {
    let l = a;
    let r = b;
    for (let k = 0; k < 80; k++) {
      const m = (l + r) / 2;
      if (h(l) * h(m) <= 0) r = m;
      else l = m;
    }
    return (l + r) / 2;
  };
  const N = 4000;
  const dp = derive(p);
  const dg = (x: number) => evalPoly(dp, x);
  for (let i = 0; i < N; i++) {
    const a = lo + ((hi - lo) * i) / N;
    const b = lo + ((hi - lo) * (i + 1)) / N;
    const ya = g(a);
    const yb = g(b);
    if (ya === 0) out.push(a);
    else if (ya * yb < 0) out.push(bis(a, b, g));
    // Berührstelle: g' wechselt das Vorzeichen und |g| ist dort (fast) null
    else if (degree(dp) >= 0 && dg(a) * dg(b) < 0) {
      const m = bis(a, b, dg);
      if (Math.abs(g(m)) < 1e-9 * (1 + Math.max(...p.map(Math.abs)))) out.push(m);
    }
  }
  const sorted = out.sort((u, v) => u - v);
  return sorted.filter((x, i) => i === 0 || Math.abs(x - sorted[i - 1]!) > 1e-6).map((x) => (Math.abs(x) < 1e-9 ? 0 : x));
}

export type ExtKind = 'max' | 'min' | 'saddle';

export interface Point {
  x: number;
  y: number;
}

export interface Analysis {
  d1: Poly;
  d2: Poly;
  /** Nullstellen von f' (Kandidaten) */
  candidates: number[];
  /** Nullstellen von f'' (Kandidaten für Wendestellen, auch ohne Vorzeichenwechsel) */
  wCandidates: number[];
  extrema: (Point & { kind: ExtKind })[];
  inflections: Point[];
  /** Intervalle der Monotonie (Grenzen −∞ / +∞ als ±Infinity) */
  mono: { from: number; to: number; sign: 1 | -1 | 0 }[];
  curv: { from: number; to: number; sign: 1 | -1 | 0 }[];
}

function signAt(p: Poly, x: number): 1 | -1 | 0 {
  const v = evalPoly(p, x);
  return Math.abs(v) < 1e-12 ? 0 : v > 0 ? 1 : -1;
}

/**
 * Vorzeichen von p im Intervall ]a; b[ (Grenzen dürfen ±∞ sein). Getestet wird
 * in der Mitte; liegt dort zufällig eine Nullstelle ohne Vorzeichenwechsel
 * (z. B. 12x² bei 0), weicht der Testwert ein Stück aus.
 */
function intervalSign(p: Poly, a: number, b: number): 1 | -1 | 0 {
  const m = !Number.isFinite(a) ? (Number.isFinite(b) ? b - 1 : 0) : !Number.isFinite(b) ? a + 1 : (a + b) / 2;
  const half = Number.isFinite(a) && Number.isFinite(b) ? (b - a) / 2 : 1;
  for (const t of [0, 0.37, -0.37, 0.71, -0.71]) {
    const s = signAt(p, m + t * half);
    if (s !== 0) return s;
  }
  return 0;
}

function intervals(p: Poly, cuts: number[]): { from: number; to: number; sign: 1 | -1 | 0 }[] {
  const bounds = [-Infinity, ...cuts, Infinity];
  const out: { from: number; to: number; sign: 1 | -1 | 0 }[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const a = bounds[i]!;
    const b = bounds[i + 1]!;
    const s = intervalSign(p, a, b);
    const last = out[out.length - 1];
    if (last && last.sign === s) last.to = b;
    else out.push({ from: a, to: b, sign: s });
  }
  return out;
}

export function analyze(f: Poly, lo = -50, hi = 50): Analysis {
  const d1 = derive(f);
  const d2 = derive(d1);
  const candidates = realZeros(d1, lo, hi);
  const h = 1e-4;
  const extrema = candidates.map((x) => {
    const l = evalPoly(d1, x - h);
    const r = evalPoly(d1, x + h);
    const kind: ExtKind = l > 0 && r < 0 ? 'max' : l < 0 && r > 0 ? 'min' : 'saddle';
    return { x, y: evalPoly(f, x), kind };
  });
  const wCandidates = realZeros(d2, lo, hi);
  const w = wCandidates.filter((x) => evalPoly(d2, x - h) * evalPoly(d2, x + h) < 0);
  return {
    d1,
    d2,
    candidates,
    wCandidates,
    extrema,
    inflections: w.map((x) => ({ x, y: evalPoly(f, x) })),
    mono: intervals(d1, candidates),
    curv: intervals(d2, w),
  };
}

/* ---------------- Symmetrie, Verhalten im Unendlichen, Nullstellen ---------------- */

export type Symmetry = 'even' | 'odd' | 'none';

/**
 * Symmetrie einer ganzrationalen Funktion: nur gerade Exponenten ⇒
 * achsensymmetrisch zur y-Achse, nur ungerade ⇒ punktsymmetrisch zum
 * Ursprung. (Die Nullfunktion zählt als achsensymmetrisch.)
 */
export function symmetry(p: Poly): Symmetry {
  const nz = (i: number) => Math.abs(p[i] ?? 0) > 1e-12;
  const hasEven = p.some((_, i) => i % 2 === 0 && nz(i));
  const hasOdd = p.some((_, i) => i % 2 === 1 && nz(i));
  if (!hasOdd) return 'even';
  if (!hasEven) return 'odd';
  return 'none';
}

/** Verhalten für x → −∞ und x → +∞: Vorzeichen des Grenzwerts (±1 für ±∞, 0 bei konstanter Funktion). */
export function limits(p: Poly): [number, number] {
  const n = degree(p);
  if (n <= 0) return [0, 0];
  const lead = Math.sign(p[n]!);
  return [n % 2 === 0 ? lead : -lead, lead];
}

/** Nullstellen von f (Vorzeichenwechsel und Berührstellen). */
export function zeros(p: Poly, lo = -50, hi = 50): number[] {
  if (degree(p) <= 0) return [];
  return realZeros(p, lo, hi);
}

/* ---------------- Höhere Ableitungen, Vielfachheit ---------------- */

/** n-te Ableitung (n = 0: p selbst). */
export function deriveN(p: Poly, n: number): Poly {
  let q = p;
  for (let i = 0; i < n; i++) q = derive(q);
  return q;
}

/** Größter Betrag der Koeffizienten (Maßstab für Toleranzen). */
function scaleOf(p: Poly): number {
  return 1 + Math.max(0, ...p.map((c) => Math.abs(c)));
}

/**
 * Vielfachheit einer Nullstelle x₀: kleinste Ordnung k mit p⁽ᵏ⁾(x₀) ≠ 0.
 * Beispiel: x²(x − 3) hat bei 0 eine doppelte (2), bei 3 eine einfache (1)
 * Nullstelle. Ist x₀ keine Nullstelle, ergibt sich 0.
 */
export function zeroOrder(p: Poly, x0: number, tol = 1e-7): number {
  const n = degree(p);
  if (n <= 0) return 0;
  const s = scaleOf(p) * (1 + Math.abs(x0)) ** n;
  let q = p;
  for (let k = 0; k < n; k++) {
    if (Math.abs(evalPoly(q, x0)) > tol * s) return k;
    q = derive(q);
  }
  return n;
}

/* ---------------- Vorzeichentabellen ---------------- */

export type Sign = 1 | -1 | 0;

/** Vorzeichen von p an der Stelle x; Werte nahe 0 (relativ zu den Koeffizienten) zählen als 0. */
export function signOf(p: Poly, x: number): Sign {
  const v = evalPoly(p, x);
  const tol = 1e-9 * scaleOf(p) * (1 + Math.abs(x)) ** Math.max(0, degree(p));
  return Math.abs(v) <= tol ? 0 : v > 0 ? 1 : -1;
}

export interface SignChart {
  /** Stellen (aufsteigend), an denen das Vorzeichen wechseln kann */
  xs: number[];
  /** Vorzeichen in den Intervallen ]−∞; x₁[, ]x₁; x₂[, …, ]xₙ; ∞[ (n + 1 Einträge) */
  iv: Sign[];
  /** Vorzeichen an den Stellen selbst (meist 0) */
  at: Sign[];
}

/**
 * Vorzeichentabelle von p bezüglich der Stellen xs: Zwischen zwei
 * benachbarten Stellen hat p (ohne weitere Nullstelle) überall dasselbe
 * Vorzeichen, deshalb genügt ein Testwert je Intervall.
 */
export function signChart(p: Poly, xs: number[]): SignChart {
  const s = [...xs].sort((u, v) => u - v);
  const iv: Sign[] = [];
  for (let i = 0; i <= s.length; i++) {
    const a = i === 0 ? -Infinity : s[i - 1]!;
    const b = i === s.length ? Infinity : s[i]!;
    const m = !Number.isFinite(a) ? (Number.isFinite(b) ? b - 1 : 0) : !Number.isFinite(b) ? a + 1 : (a + b) / 2;
    const half = Number.isFinite(a) && Number.isFinite(b) ? (b - a) / 2 : 1;
    let sg: Sign = 0;
    for (const t of [0, 0.37, -0.37, 0.71, -0.71]) {
      sg = signOf(p, m + t * half);
      if (sg !== 0) break;
    }
    iv.push(sg);
  }
  return { xs: s, iv, at: s.map((x) => signOf(p, x)) };
}

/** Vorzeichen von p kurz links und kurz rechts von x₀ (für „+ → −“). */
export function sidesAt(p: Poly, x0: number, h = 1e-3): [Sign, Sign] {
  // ohne Toleranz: neben einer mehrfachen Nullstelle (z. B. 4x³ bei 0) sind die Werte sehr klein
  const s = (v: number): Sign => (v > 0 ? 1 : v < 0 ? -1 : 0);
  return [s(evalPoly(p, x0 - h)), s(evalPoly(p, x0 + h))];
}

/* ---------------- Kriterien ---------------- */

/**
 * f″-Kriterium an einer Stelle x₀ mit f′(x₀) = 0:
 * f″(x₀) < 0 ⇒ Hochpunkt, f″(x₀) > 0 ⇒ Tiefpunkt, f″(x₀) = 0 ⇒ keine Aussage
 * (dann entscheidet der Vorzeichenwechsel von f′, z. B. x⁴ bei 0: Tiefpunkt).
 */
export function secondTest(f: Poly, x0: number): 'max' | 'min' | null {
  const s = signOf(deriveN(f, 2), x0);
  return s < 0 ? 'max' : s > 0 ? 'min' : null;
}

export interface InflectionInfo {
  x: number;
  y: number;
  /** f″ wechselt das Vorzeichen (dann Wendestelle) */
  change: boolean;
  /** f‴(x₀); f‴(x₀) ≠ 0 ist hinreichend für eine Wendestelle */
  d3: number;
  /** Steigung der Wendetangente f′(x₀) */
  slope: number;
  /** Wendepunkt mit waagrechter Tangente (Terrassenpunkt) */
  saddle: boolean;
}

/** Untersuchung einer Nullstelle x₀ von f″. */
export function inflectionInfo(f: Poly, x0: number): InflectionInfo {
  const d1 = derive(f);
  const d2 = derive(d1);
  const [l, r] = sidesAt(d2, x0);
  const change = l !== 0 && r !== 0 && l !== r;
  const slope = evalPoly(d1, x0);
  return { x: x0, y: evalPoly(f, x0), change, d3: evalPoly(derive(d2), x0), slope, saddle: change && signOf(d1, x0) === 0 };
}

/** Tangente an den Graphen von f in x₀: t(x) = m · x + n mit m = f′(x₀). */
export function tangentLine(f: Poly, x0: number): { y: number; m: number; n: number } {
  const y = evalPoly(f, x0);
  const m = evalPoly(derive(f), x0);
  return { y, m, n: y - m * x0 };
}
