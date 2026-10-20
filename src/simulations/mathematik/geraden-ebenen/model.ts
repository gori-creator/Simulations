/**
 * Rechenlogik für „Geraden und Ebenen im Raum“: Parameterform einer Geraden
 * mit Spurpunkten und Punktprobe, Parameterform einer Ebene, Normalenvektor
 * über das Vektorprodukt, Koordinatenform, Achsenabschnitte (Spurpunkte),
 * Spurgeraden und Spurdreieck sowie Hilfen zum Zuschneiden auf einen
 * sichtbaren Würfel. Keine Zeichenbefehle.
 */

export type V3 = readonly [number, number, number];

const EPS = 1e-9;

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const isZero = (a: V3, eps = EPS): boolean => norm(a) < eps;

/** Vektorprodukt u × v = (u₂v₃ − u₃v₂ | u₃v₁ − u₁v₃ | u₁v₂ − u₂v₁). */
export const cross = (u: V3, v: V3): V3 => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];

/** Sind u und v kollinear (parallel oder einer der Nullvektor)? */
export function collinear(u: V3, v: V3, eps = EPS): boolean {
  return norm(cross(u, v)) < eps * Math.max(1, norm(u) * norm(v));
}

/* ------------------------------------------------------------------ */
/* Geraden                                                              */
/* ------------------------------------------------------------------ */

/** Punkt X der Geraden g: x⃗ = a⃗ + t · u⃗. */
export const linePoint = (a: V3, u: V3, t: number): V3 => add(a, scale(u, t));

/** Koordinatenebenen: Index der Koordinate, die dort 0 ist, und Name. */
export const COORD_PLANES = [
  { zero: 2, name: 'x₁x₂' },
  { zero: 0, name: 'x₂x₃' },
  { zero: 1, name: 'x₁x₃' },
] as const;

export type LineTrace = { kind: 'point'; t: number; p: V3 } | { kind: 'parallel' } | { kind: 'inside' };

/**
 * Spurpunkt der Geraden mit der Koordinatenebene, in der die Koordinate
 * `zero` gleich 0 ist: aₖ + t · uₖ = 0 ⇒ t = −aₖ / uₖ. Für uₖ = 0 ist g
 * parallel zur Ebene (kein Spurpunkt) oder liegt ganz in ihr (aₖ = 0).
 */
export function lineTrace(a: V3, u: V3, zero: number): LineTrace {
  const ak = a[zero]!;
  const uk = u[zero]!;
  if (Math.abs(uk) < EPS) return Math.abs(ak) < EPS ? { kind: 'inside' } : { kind: 'parallel' };
  const t = -ak / uk;
  const p = linePoint(a, u, t);
  // exakte Null in der Spurkoordinate (keine Rundungsreste wie −0 oder 1e−17)
  const q: [number, number, number] = [p[0], p[1], p[2]];
  q[zero] = 0;
  return { kind: 'point', t, p: q };
}

/** Spurpunkte mit x₁x₂-, x₂x₃- und x₁x₃-Ebene (in dieser Reihenfolge). */
export function lineTraces(a: V3, u: V3): LineTrace[] {
  return COORD_PLANES.map((c) => lineTrace(a, u, c.zero));
}

export type ProbeComp = { kind: 't'; t: number } | { kind: 'fixed'; ok: boolean };

/**
 * Punktprobe: Liegt P auf g: x⃗ = a⃗ + t · u⃗? Je Koordinate mit uᵢ ≠ 0
 * ergibt sich tᵢ = (pᵢ − aᵢ) / uᵢ; für uᵢ = 0 muss pᵢ = aᵢ gelten.
 * P liegt auf g, wenn alle tᵢ gleich sind (und die festen Koordinaten passen).
 */
export function probeLine(a: V3, u: V3, p: V3, eps = 1e-9): { on: boolean; t: number | null; comps: ProbeComp[] } {
  const comps: ProbeComp[] = [0, 1, 2].map((i) => {
    const ui = u[i]!;
    if (Math.abs(ui) < EPS) return { kind: 'fixed', ok: Math.abs(p[i]! - a[i]!) < eps };
    return { kind: 't', t: (p[i]! - a[i]!) / ui };
  });
  const ts = comps.flatMap((c) => (c.kind === 't' ? [c.t] : []));
  const fixedOk = comps.every((c) => c.kind === 't' || c.ok);
  if (ts.length === 0) return { on: false, t: null, comps };
  const t0 = ts[0]!;
  const same = ts.every((t) => Math.abs(t - t0) < eps * Math.max(1, Math.abs(t0)));
  return { on: same && fixedOk, t: same && fixedOk ? t0 : null, comps };
}

/**
 * Parameterbereich [t₀, t₁] des Teils der Geraden a⃗ + t · u⃗, der im Würfel
 * [lo, hi]³ liegt (Schnitt der „Platten“); null, wenn sie ihn verfehlt.
 */
export function clipLineToBox(a: V3, u: V3, lo: number, hi: number): [number, number] | null {
  let t0 = -Infinity;
  let t1 = Infinity;
  for (let i = 0; i < 3; i++) {
    const ai = a[i]!;
    const ui = u[i]!;
    if (Math.abs(ui) < EPS) {
      if (ai < lo - EPS || ai > hi + EPS) return null;
      continue;
    }
    let ta = (lo - ai) / ui;
    let tb = (hi - ai) / ui;
    if (ta > tb) [ta, tb] = [tb, ta];
    t0 = Math.max(t0, ta);
    t1 = Math.min(t1, tb);
  }
  if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 < t0 - EPS) return null;
  return [t0, t1];
}

/* ------------------------------------------------------------------ */
/* Ebenen                                                               */
/* ------------------------------------------------------------------ */

/** Punkt X der Ebene E: x⃗ = a⃗ + r · u⃗ + s · v⃗. */
export const planePoint = (a: V3, u: V3, v: V3, r: number, s: number): V3 => add(add(a, scale(u, r)), scale(v, s));

const gcd = (x: number, y: number): number => {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (b > 0.5) [a, b] = [b, a % b];
  return a;
};

/**
 * Normalenvektor kürzen: Sind alle Komponenten ganzzahlig, wird durch ihren
 * größten gemeinsamen Teiler geteilt (z. B. (9 | 9 | 9) → (1 | 1 | 1)).
 * `factor` ist der Teiler (1 = nichts gekürzt).
 */
export function simplifyNormal(n: V3): { n: V3; factor: number } {
  const ints = n.every((x) => Math.abs(x - Math.round(x)) < 1e-9);
  if (!ints || isZero(n)) return { n, factor: 1 };
  const g = n.map((x) => Math.round(x)).reduce((acc, x) => gcd(acc, x), 0);
  if (g <= 1) return { n: n.map((x) => Math.round(x)) as unknown as V3, factor: 1 };
  return { n: n.map((x) => Math.round(x) / g) as unknown as V3, factor: g };
}

export type PlaneForms = { ok: false; reason: 'zero' | 'parallel' } | { ok: true; raw: V3; n: V3; factor: number; d: number };

/**
 * Von der Parameterform zur Koordinatenform: n⃗ = u⃗ × v⃗ (gekürzt), dann
 * d = n⃗ · a⃗ und n₁x₁ + n₂x₂ + n₃x₃ = d. Sind u⃗ und v⃗ parallel (oder einer
 * der Nullvektor), spannen sie keine Ebene auf.
 */
export function planeForms(a: V3, u: V3, v: V3): PlaneForms {
  if (isZero(u) || isZero(v)) return { ok: false, reason: 'zero' };
  if (collinear(u, v)) return { ok: false, reason: 'parallel' };
  const raw = cross(u, v);
  const { n, factor } = simplifyNormal(raw);
  return { ok: true, raw, n, factor, d: dot(n, a) };
}

/** Punktprobe für die Ebene n⃗ · x⃗ = d. */
export function probePlane(n: V3, d: number, p: V3, eps = 1e-9): { value: number; on: boolean } {
  const value = dot(n, p);
  return { value, on: Math.abs(value - d) < eps * Math.max(1, Math.abs(d), norm(n) * norm(p)) };
}

export type Intercept = { kind: 'point'; p: V3 } | { kind: 'none' } | { kind: 'contains' };

/**
 * Spurpunkte (Achsenabschnitte) der Ebene n⃗ · x⃗ = d mit den Achsen
 * x₁, x₂, x₃: Sᵢ hat die Koordinate d / nᵢ. Für nᵢ = 0 ist die Ebene parallel
 * zur Achse (kein Spurpunkt) oder enthält sie (d = 0).
 */
export function planeIntercepts(n: V3, d: number): Intercept[] {
  return [0, 1, 2].map((i) => {
    const ni = n[i]!;
    if (Math.abs(ni) < EPS) return Math.abs(d) < EPS ? { kind: 'contains' } : { kind: 'none' };
    const p: [number, number, number] = [0, 0, 0];
    p[i] = d / ni;
    return { kind: 'point', p };
  });
}

/** Spurdreieck S₁S₂S₃, falls alle drei Spurpunkte existieren und verschieden sind (d ≠ 0). */
export function traceTriangle(n: V3, d: number): [V3, V3, V3] | null {
  if (Math.abs(d) < EPS) return null;
  const s = planeIntercepts(n, d);
  if (!s.every((x) => x.kind === 'point')) return null;
  return s.map((x) => (x as { p: V3 }).p) as [V3, V3, V3];
}

/**
 * Spurgerade der Ebene n⃗ · x⃗ = d in der Koordinatenebene xₖ = 0 (k = `zero`):
 * Stützpunkt (der Punkt mit kleinstem Abstand zum Ursprung) und Richtung
 * n⃗ × e⃗ₖ. null, wenn die Ebene parallel zur Koordinatenebene ist (oder mit
 * ihr übereinstimmt).
 */
export function traceLine(n: V3, d: number, zero: number): { p: V3; dir: V3 } | null {
  const m: [number, number, number] = [n[0], n[1], n[2]];
  m[zero] = 0;
  const mm = dot(m, m);
  if (mm < EPS) return null;
  const e: [number, number, number] = [0, 0, 0];
  e[zero] = 1;
  return { p: scale(m, d / mm), dir: cross(n, e) };
}

/**
 * Schnittvieleck der Ebene n⃗ · x⃗ = d mit dem Würfel [lo, hi]³ (Eckpunkte der
 * Reihe nach um die Mitte). Leer, wenn die Ebene den Würfel verfehlt.
 */
export function planeBoxPolygon(n: V3, d: number, lo: number, hi: number): V3[] {
  if (isZero(n)) return [];
  const pts: V3[] = [];
  const c = [lo, hi];
  // zwölf Kanten: zwei Koordinaten fest, die dritte läuft
  for (let k = 0; k < 3; k++) {
    for (const p of c) {
      for (const q of c) {
        const i = (k + 1) % 3;
        const j = (k + 2) % 3;
        const nk = n[k]!;
        const rest = n[i]! * p + n[j]! * q;
        if (Math.abs(nk) < EPS) continue;
        const x = (d - rest) / nk;
        if (x < lo - 1e-9 || x > hi + 1e-9) continue;
        const v: [number, number, number] = [0, 0, 0];
        v[k] = x;
        v[i] = p;
        v[j] = q;
        if (!pts.some((w) => norm(sub(w, v)) < 1e-7)) pts.push(v);
      }
    }
  }
  if (pts.length < 3) return [];
  // nach dem Winkel in der Ebene ordnen
  const ctr = scale(pts.reduce((s, q) => add(s, q), [0, 0, 0] as V3), 1 / pts.length);
  const e1 = sub(pts[0]!, ctr);
  const e2 = cross(n, e1);
  return [...pts].sort((A, B) => {
    const da = sub(A, ctr);
    const db = sub(B, ctr);
    return Math.atan2(dot(da, e2), dot(da, e1)) - Math.atan2(dot(db, e2), dot(db, e1));
  });
}

/**
 * Parameter r, s mit a⃗ + r · u⃗ + s · v⃗ möglichst nahe an x⃗ (für x⃗ in der
 * Ebene exakt). Lösung über die Gramsche Matrix; null bei parallelen u⃗, v⃗.
 */
export function solvePlaneParams(a: V3, u: V3, v: V3, x: V3): { r: number; s: number } | null {
  const w = sub(x, a);
  const uu = dot(u, u);
  const vv = dot(v, v);
  const uv = dot(u, v);
  const det = uu * vv - uv * uv;
  if (Math.abs(det) < 1e-9 * Math.max(1, uu * vv)) return null;
  const wu = dot(w, u);
  const wv = dot(w, v);
  return { r: (wu * vv - wv * uv) / det, s: (uu * wv - uv * wu) / det };
}

/**
 * Koordinatenform als Text, z. B. „2x₁ + 3x₂ + 6x₃ = 12“ oder „x₁ − x₃ = 0“:
 * Summanden mit Koeffizient 0 entfallen, 1 und −1 werden nicht geschrieben.
 * `num` formatiert Beträge (Dezimalkomma); das Minus ist immer „−“.
 */
export function coordinateFormText(n: V3, d: number, num: (v: number) => string): string {
  const names = ['x₁', 'x₂', 'x₃'];
  let s = '';
  n.forEach((c, i) => {
    if (Math.abs(c) < EPS) return;
    const abs = Math.abs(c);
    const coef = Math.abs(abs - 1) < EPS ? '' : num(abs);
    if (!s) s = `${c < 0 ? '−' : ''}${coef}${names[i]}`;
    else s += ` ${c < 0 ? '−' : '+'} ${coef}${names[i]}`;
  });
  if (!s) s = '0';
  const dd = Math.abs(d) < EPS ? 0 : d;
  return `${s} = ${dd < 0 ? '−' : ''}${num(Math.abs(dd))}`;
}
