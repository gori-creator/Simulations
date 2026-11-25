/**
 * Lineare Optimierung mit zwei Variablen: Planungsvieleck aus Ungleichungen
 * a·x + b·y ≤ c (dazu x, y ≥ 0), Zielfunktion z = p·x + q·y, Optimum in einer Ecke.
 */

export type Pt = [number, number];
export interface Constraint {
  a: number;
  b: number;
  c: number;
}

/** Halbebene a·x + b·y ≤ c an einem Vieleck abschneiden (Sutherland-Hodgman). */
function clip(poly: Pt[], k: Constraint): Pt[] {
  const out: Pt[] = [];
  const val = (p: Pt) => k.a * p[0] + k.b * p[1] - k.c;
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i]!;
    const Q = poly[(i + 1) % poly.length]!;
    const vp = val(P);
    const vq = val(Q);
    if (vp <= 1e-9) out.push(P);
    if ((vp < -1e-9 && vq > 1e-9) || (vp > 1e-9 && vq < -1e-9)) {
      const t = vp / (vp - vq);
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
    }
  }
  // doppelte Punkte entfernen
  return out.filter((p, i) => {
    const q = out[(i + 1) % out.length]!;
    return out.length < 2 || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-9;
  });
}

/** Zulässiger Bereich innerhalb des Kastens [0, M]². */
export function feasible(cons: Constraint[], M: number): Pt[] {
  let poly: Pt[] = [
    [0, 0],
    [M, 0],
    [M, M],
    [0, M],
  ];
  for (const k of cons) {
    poly = clip(poly, k);
    if (poly.length === 0) break;
  }
  return poly;
}

export interface Optimum {
  point: Pt;
  z: number;
  /** liegt am Rand des Zeichenkastens → Bereich in Zielrichtung unbeschränkt */
  unbounded: boolean;
  /** mehrere optimale Ecken (Kante parallel zur Zielgeraden) */
  tie: boolean;
}

export function optimum(poly: Pt[], p: number, q: number, goal: 'max' | 'min', M: number): Optimum | null {
  if (poly.length === 0) return null;
  const sgn = goal === 'max' ? 1 : -1;
  let best = poly[0]!;
  let bz = -Infinity;
  for (const v of poly) {
    const z = sgn * (p * v[0] + q * v[1]);
    if (z > bz + 1e-9) {
      bz = z;
      best = v;
    }
  }
  const ties = poly.filter((v) => Math.abs(sgn * (p * v[0] + q * v[1]) - bz) < 1e-9).length;
  const onBox = Math.abs(best[0] - M) < 1e-6 || Math.abs(best[1] - M) < 1e-6;
  return { point: best, z: sgn * bz, unbounded: onBox, tie: ties > 1 };
}

/** Ganzzahlige Punkte im zulässigen Bereich. */
export function latticePoints(cons: Constraint[], M: number): Pt[] {
  const out: Pt[] = [];
  for (let x = 0; x <= M; x++) for (let y = 0; y <= M; y++) if (cons.every((k) => k.a * x + k.b * y <= k.c + 1e-9)) out.push([x, y]);
  return out;
}

export function bestLattice(points: Pt[], p: number, q: number, goal: 'max' | 'min'): { point: Pt; z: number } | null {
  if (!points.length) return null;
  const sgn = goal === 'max' ? 1 : -1;
  let best = points[0]!;
  for (const v of points) if (sgn * (p * v[0] + q * v[1]) > sgn * (p * best[0] + q * best[1]) + 1e-9) best = v;
  return { point: best, z: p * best[0] + q * best[1] };
}
