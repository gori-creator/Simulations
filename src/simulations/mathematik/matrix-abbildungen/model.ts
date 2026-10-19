/**
 * Rechenlogik „Matrizen als lineare Abbildungen“ (Jgst. 12–14 / Studium).
 *
 * A = (a b; c d) bildet x auf A·x ab. Die Spalten von A sind die Bilder der
 * Einheitsvektoren e₁ und e₂. det A = ad − bc ist der Faktor, mit dem sich
 * Flächeninhalte ändern (negativ: Orientierung kehrt sich um, 0: alles
 * landet auf einer Geraden oder im Ursprung). Eigenvektoren werden nur
 * gestreckt: A·v = λ·v.
 *
 * Dazu: Matrizen aus Abbildungstypen (Drehung, Spiegelung, Streckung,
 * Scherung, Projektion, Drehstreckung), Verkettung (Produkt), Inverse,
 * charakteristisches Polynom mit komplexen Eigenwerten, Iteration Aⁿ·x mit
 * Fixvektor bzw. stationärer Verteilung und die Figuren der Simulation.
 */

export type Vec = [number, number];
export interface Mat {
  a: number;
  b: number;
  c: number;
  d: number;
}

export const IDENTITY: Mat = { a: 1, b: 0, c: 0, d: 1 };
const DEG = Math.PI / 180;

/** Zahlen, die nur durch Rundungsfehler von einer „schönen“ Zahl abweichen, glätten. */
export function tidy(v: number): number {
  const r = Math.round(v * 1e6) / 1e6;
  const out = Math.abs(r - v) < 1e-12 ? r : v;
  return Object.is(out, -0) ? 0 : out;
}
const tidyMat = (m: Mat): Mat => ({ a: tidy(m.a), b: tidy(m.b), c: tidy(m.c), d: tidy(m.d) });
/** cos und sin im Gradmaß ohne Rundungsfehler bei 0°, 90°, 180° … */
export const cosd = (deg: number) => tidy(Math.cos(deg * DEG));
export const sind = (deg: number) => tidy(Math.sin(deg * DEG));

export function apply(m: Mat, v: Vec): Vec {
  return [m.a * v[0] + m.b * v[1], m.c * v[0] + m.d * v[1]];
}

export function det(m: Mat): number {
  return m.a * m.d - m.b * m.c;
}

export function trace(m: Mat): number {
  return m.a + m.d;
}

/** Matrixprodukt m · n (erst n, dann m anwenden). */
export function mul(m: Mat, n: Mat): Mat {
  return { a: m.a * n.a + m.b * n.c, b: m.a * n.b + m.b * n.d, c: m.c * n.a + m.d * n.c, d: m.c * n.b + m.d * n.d };
}

export function scale(m: Mat, k: number): Mat {
  return { a: m.a * k, b: m.b * k, c: m.c * k, d: m.d * k };
}

export function equal(m: Mat, n: Mat, eps = 1e-9): boolean {
  return Math.abs(m.a - n.a) < eps && Math.abs(m.b - n.b) < eps && Math.abs(m.c - n.c) < eps && Math.abs(m.d - n.d) < eps;
}

/** Inverse A⁻¹ = 1/det · (d −b; −c a); null, wenn det A = 0. */
export function inverse(m: Mat, eps = 1e-12): Mat | null {
  const D = det(m);
  if (Math.abs(D) < eps) return null;
  return tidyMat({ a: m.d / D, b: -m.b / D, c: -m.c / D, d: m.a / D });
}

/** Lineare Überblendung von m nach n (für die Animation). */
export function lerpMat(m: Mat, n: Mat, t: number): Mat {
  return { a: m.a + (n.a - m.a) * t, b: m.b + (n.b - m.b) * t, c: m.c + (n.c - m.c) * t, d: m.d + (n.d - m.d) * t };
}

/** Drehstreckung? (a = d, b = −c): dann gilt A = r · Drehung(φ). */
export function asRotScale(m: Mat, eps = 1e-9): { r: number; phi: number } | null {
  if (Math.abs(m.a - m.d) > eps || Math.abs(m.b + m.c) > eps) return null;
  const r = Math.hypot(m.a, m.c);
  if (r < eps) return null;
  return { r, phi: Math.atan2(m.c, m.a) / DEG };
}

/**
 * Weg von E nach A für die Animation „E verformt sich zu A“. Bei Drehungen und
 * Drehstreckungen wird Winkel und Faktor überblendet (das Bild dreht sich
 * sichtbar, statt durch eine singuläre Matrix zu laufen), sonst linear.
 */
export function morphMat(target: Mat, t: number, from: Mat = IDENTITY): Mat {
  const rs = asRotScale(target);
  const rs0 = asRotScale(from);
  if (rs && rs0 && Math.abs(Math.abs(rs.phi) - 180) > 1e-6) {
    const r = rs0.r * Math.pow(rs.r / rs0.r, t);
    let dphi = rs.phi - rs0.phi;
    while (dphi > 180) dphi -= 360;
    while (dphi < -180) dphi += 360;
    const phi = (rs0.phi + dphi * t) * DEG;
    return { a: r * Math.cos(phi), b: -r * Math.sin(phi), c: r * Math.sin(phi), d: r * Math.cos(phi) };
  }
  if (rs && rs0) {
    // 180°: links herum drehen (positiver Drehsinn)
    const r = rs0.r * Math.pow(rs.r / rs0.r, t);
    const phi = (rs0.phi + 180 * t) * DEG;
    return { a: r * Math.cos(phi), b: -r * Math.sin(phi), c: r * Math.sin(phi), d: r * Math.cos(phi) };
  }
  return lerpMat(from, target, t);
}

/* ------------------------------------------------------------------ */
/* Matrizen aus Abbildungstypen                                         */
/* ------------------------------------------------------------------ */

export type TypeKey = 'free' | 'rot' | 'refl' | 'scale' | 'shear' | 'proj' | 'rs';
export interface TypeParams {
  /** Drehwinkel φ in Grad */
  phi: number;
  /** Winkel α der Spiegel- bzw. Projektionsachse gegen die x-Achse in Grad */
  al: number;
  /** Streckfaktoren in x- und y-Richtung */
  kx: number;
  ky: number;
  /** Scherfaktor und Scherrichtung */
  k: number;
  sd: 'x' | 'y';
  /** Faktor der Drehstreckung */
  r: number;
}

export function rotation(phi: number): Mat {
  return tidyMat({ a: cosd(phi), b: -sind(phi), c: sind(phi), d: cosd(phi) });
}
/** Spiegelung an der Ursprungsgeraden mit dem Winkel α: (cos 2α  sin 2α; sin 2α  −cos 2α). */
export function reflection(al: number): Mat {
  return tidyMat({ a: cosd(2 * al), b: sind(2 * al), c: sind(2 * al), d: -cosd(2 * al) });
}
/** Senkrechte Projektion auf die Ursprungsgerade mit dem Winkel α: u·uᵀ mit u = (cos α | sin α). */
export function projection(al: number): Mat {
  const c = cosd(al);
  const s = sind(al);
  return tidyMat({ a: c * c, b: s * c, c: s * c, d: s * s });
}
export function shear(k: number, dir: 'x' | 'y'): Mat {
  return dir === 'x' ? { a: 1, b: k, c: 0, d: 1 } : { a: 1, b: 0, c: k, d: 1 };
}

export function matrixOf(typ: TypeKey, p: TypeParams, free: Mat): Mat {
  switch (typ) {
    case 'free':
      return free;
    case 'rot':
      return rotation(p.phi);
    case 'refl':
      return reflection(p.al);
    case 'scale':
      return { a: p.kx, b: 0, c: 0, d: p.ky };
    case 'shear':
      return shear(p.k, p.sd);
    case 'proj':
      return projection(p.al);
    case 'rs':
      return tidyMat(scale(rotation(p.phi), p.r));
  }
}

/* ------------------------------------------------------------------ */
/* Eigenwerte                                                           */
/* ------------------------------------------------------------------ */

/** Reelle Eigenwerte mit Eigenvektoren (normiert); leer bei komplexen Eigenwerten. */
export function eigen(m: Mat): { value: number; vector: Vec }[] {
  const tr = m.a + m.d;
  const D = det(m);
  const disc = tr * tr - 4 * D;
  if (disc < -1e-12) return [];
  const s = Math.sqrt(Math.max(0, disc));
  const values = disc <= 1e-12 ? [tr / 2] : [(tr + s) / 2, (tr - s) / 2];
  const out: { value: number; vector: Vec }[] = [];
  for (const l of values) {
    // (A − λE)v = 0
    let v: Vec;
    if (Math.abs(m.b) > 1e-12) v = [m.b, l - m.a];
    else if (Math.abs(m.c) > 1e-12) v = [l - m.d, m.c];
    else v = Math.abs(m.a - l) < 1e-12 ? [1, 0] : [0, 1];
    const n = Math.hypot(v[0], v[1]);
    out.push({ value: l, vector: [v[0] / n, v[1] / n] });
    // Vielfaches der Einheitsmatrix: jede Richtung ist Eigenrichtung – zweite Richtung ergänzen
    if (disc <= 1e-12 && Math.abs(m.b) < 1e-12 && Math.abs(m.c) < 1e-12) out.push({ value: l, vector: [0, 1] });
  }
  return out;
}

/** Jede Richtung ist Eigenrichtung (A = λ·E). */
export function isScalar(m: Mat, eps = 1e-9): boolean {
  return Math.abs(m.b) < eps && Math.abs(m.c) < eps && Math.abs(m.a - m.d) < eps;
}

/**
 * Charakteristisches Polynom det(A − λE) = λ² − (Spur)·λ + det A mit
 * Diskriminante und Lösungen; bei negativer Diskriminante komplex: λ = re ± im·i.
 */
export function charPoly(m: Mat): { tr: number; det: number; disc: number; real: number[]; re: number; im: number } {
  const tr = trace(m);
  const D = det(m);
  const disc = tr * tr - 4 * D;
  if (disc < -1e-12) return { tr, det: D, disc, real: [], re: tr / 2, im: Math.sqrt(-disc) / 2 };
  const s = Math.sqrt(Math.max(0, disc));
  return { tr, det: D, disc, real: disc <= 1e-12 ? [tr / 2] : [(tr + s) / 2, (tr - s) / 2], re: tr / 2, im: 0 };
}

/** sin des orientierten Winkels zwischen v und A·v (0 genau für Eigenrichtungen oder A·v = 0). */
export function sinAngle(m: Mat, v: Vec): number {
  const w = apply(m, v);
  const n = Math.hypot(v[0], v[1]) * Math.hypot(w[0], w[1]);
  if (n < 1e-12) return 0;
  return (v[0] * w[1] - v[1] * w[0]) / n;
}

/** Halbachsen σ₁ ≥ σ₂ der Bildellipse des Einheitskreises (Singulärwerte). */
export function singular(m: Mat): [number, number] {
  const p = m.a * m.a + m.c * m.c;
  const q = m.b * m.b + m.d * m.d;
  const r = m.a * m.b + m.c * m.d;
  const s = Math.sqrt(Math.max(0, ((p - q) / 2) ** 2 + r * r));
  const l1 = (p + q) / 2 + s;
  const l2 = Math.max(0, (p + q) / 2 - s);
  return [Math.sqrt(l1), Math.sqrt(l2)];
}

/* ------------------------------------------------------------------ */
/* Einordnung                                                           */
/* ------------------------------------------------------------------ */

export type Kind = 'identity' | 'rotation' | 'reflection' | 'scaling' | 'shear' | 'projection' | 'rotscale' | 'general';

/** Grobe Einordnung der Abbildung. */
export function classify(m: Mat, eps = 1e-9): Kind {
  const D = det(m);
  const near = (x: number, y: number) => Math.abs(x - y) < eps;
  if (near(m.a, 1) && near(m.b, 0) && near(m.c, 0) && near(m.d, 1)) return 'identity';
  if (Math.abs(D) < eps) return 'projection';
  const orth = near(m.a * m.b + m.c * m.d, 0) && near(m.a * m.a + m.c * m.c, 1) && near(m.b * m.b + m.d * m.d, 1);
  if (orth) return D > 0 ? 'rotation' : 'reflection';
  if (near(m.b, 0) && near(m.c, 0)) return 'scaling';
  if (near(D, 1) && ((near(m.a, 1) && near(m.d, 1)) || near(m.a + m.d, 2)) && (near(m.b, 0) || near(m.c, 0))) return 'shear';
  if (asRotScale(m, eps)) return 'rotscale';
  return 'general';
}

/** Einordnung mit Kenngrößen (Drehwinkel, Achse, Faktoren). */
export interface Description {
  kind: Kind;
  /** Drehwinkel in Grad (Drehung, Drehstreckung) */
  angle?: number;
  /** Faktor (Drehstreckung, zentrische Streckung) */
  factor?: number;
  /** Achsenwinkel in Grad (Spiegelung, Projektion auf diese Gerade) */
  axis?: number;
  /** Projektion: senkrecht (orthogonal) oder schräg (Parallelprojektion); 'zero' für die Nullmatrix */
  proj?: 'orth' | 'oblique' | 'zero' | 'rank1';
  /** Streckung: Faktoren in x- und y-Richtung */
  kx?: number;
  ky?: number;
  /** Scherung: Faktor und Richtung (die Fixgerade) */
  shear?: number;
  shearDir?: 'x' | 'y';
}

const angleOfLine = (v: Vec) => {
  let a = Math.atan2(v[1], v[0]) / DEG;
  if (a < 0) a += 180;
  if (a >= 180 - 1e-9) a -= 180;
  return tidy(a);
};

export function describe(m: Mat, eps = 1e-9): Description {
  const kind = classify(m, eps);
  switch (kind) {
    case 'rotation':
      return { kind, angle: tidy(Math.atan2(m.c, m.a) / DEG) };
    case 'reflection': {
      // Achse = Eigenrichtung zum Eigenwert 1
      const e = eigen(m).find((q) => Math.abs(q.value - 1) < 1e-6);
      return { kind, axis: e ? angleOfLine(e.vector) : tidy(Math.atan2(m.c, m.a) / DEG / 2) };
    }
    case 'scaling':
      return { kind, kx: m.a, ky: m.d, factor: Math.abs(m.a - m.d) < eps ? m.a : undefined };
    case 'shear':
      return Math.abs(m.c) < eps ? { kind, shear: m.b, shearDir: 'x' } : { kind, shear: m.c, shearDir: 'y' };
    case 'rotscale': {
      const rs = asRotScale(m, eps)!;
      return { kind, angle: tidy(rs.phi), factor: tidy(rs.r) };
    }
    case 'projection': {
      if (Math.abs(m.a) < eps && Math.abs(m.b) < eps && Math.abs(m.c) < eps && Math.abs(m.d) < eps) return { kind, proj: 'zero' };
      // Projektion im engeren Sinn: A² = A (Bild bleibt fest)
      const idem = equal(mul(m, m), m, 1e-6);
      const col: Vec = Math.hypot(m.a, m.c) > Math.hypot(m.b, m.d) ? [m.a, m.c] : [m.b, m.d];
      const axis = angleOfLine(col);
      if (!idem) return { kind, proj: 'rank1', axis };
      const sym = Math.abs(m.b - m.c) < 1e-6;
      return { kind, proj: sym ? 'orth' : 'oblique', axis };
    }
    default:
      return { kind };
  }
}

/** Kern (Richtung, die auf 0 abgebildet wird) einer singulären Matrix ≠ 0. */
export function kernel(m: Mat, eps = 1e-9): Vec | null {
  if (Math.abs(det(m)) > eps) return null;
  let v: Vec;
  if (Math.hypot(m.a, m.b) > eps) v = [-m.b, m.a];
  else if (Math.hypot(m.c, m.d) > eps) v = [-m.d, m.c];
  else return null;
  const n = Math.hypot(v[0], v[1]);
  return [v[0] / n, v[1] / n];
}

/* ------------------------------------------------------------------ */
/* Iteration und Übergangsmatrizen                                     */
/* ------------------------------------------------------------------ */

/** x₀, A·x₀, A²·x₀, …, Aⁿ·x₀. */
export function iterate(m: Mat, x0: Vec, n: number): Vec[] {
  const out: Vec[] = [x0];
  let v = x0;
  for (let i = 0; i < n; i++) {
    v = apply(m, v);
    out.push(v);
  }
  return out;
}

export function power(m: Mat, n: number): Mat {
  let r = IDENTITY;
  for (let i = 0; i < n; i++) r = mul(m, r);
  return r;
}

/** Spaltenstochastisch (Übergangsmatrix): Einträge ≥ 0, jede Spalte hat die Summe 1. */
export function isStochastic(m: Mat, eps = 1e-9): boolean {
  return m.a >= -eps && m.b >= -eps && m.c >= -eps && m.d >= -eps && Math.abs(m.a + m.c - 1) < eps && Math.abs(m.b + m.d - 1) < eps;
}

/**
 * Stationäre Verteilung einer Übergangsmatrix: A·x = x mit x₁ + x₂ = 1.
 * Für A = (1−c  b; c  1−b) ist x = (b | c) / (b + c).
 */
export function stationary(m: Mat): Vec | null {
  if (!isStochastic(m)) return null;
  const s = m.b + m.c;
  if (s < 1e-12) return null;
  return [m.b / s, m.c / s];
}

/** Betragsgrößter reeller Eigenwert mit Eigenvektor (für das Langzeitverhalten). */
export function dominant(m: Mat): { value: number; vector: Vec } | null {
  const e = eigen(m);
  if (!e.length) return null;
  let best = e[0]!;
  for (const q of e) if (Math.abs(q.value) > Math.abs(best.value) + 1e-12) best = q;
  // gleich große Beträge (z. B. ±1): kein eindeutiges Langzeitverhalten
  if (e.length === 2 && Math.abs(Math.abs(e[0]!.value) - Math.abs(e[1]!.value)) < 1e-9 && !isScalar(m)) return null;
  // Richtung in den ersten Quadranten legen, wenn möglich
  let v = best.vector;
  if (v[0] < -1e-12 || (Math.abs(v[0]) < 1e-12 && v[1] < 0)) v = [-v[0], -v[1]];
  return { value: best.value, vector: v };
}

/* ------------------------------------------------------------------ */
/* Figuren                                                              */
/* ------------------------------------------------------------------ */

export type FigKey = 'f' | 'house' | 'circle' | 'smile' | 'rocket' | 'cloud';
export interface Figure {
  /** geschlossene, gefüllte Umrisse */
  fills: Vec[][];
  /** offene Linien (z. B. Mund, Fenster) */
  lines: Vec[][];
  /** einzelne Punkte (Punktwolke) */
  dots: Vec[];
}

const circlePts = (cx: number, cy: number, r: number, n = 72, ry = r): Vec[] => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)] as Vec);

/** Reproduzierbare Pseudozufallszahlen (für die Punktwolke). */
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Figuren in Weltkoordinaten. F, Haus, Smiley und Rakete stehen im ersten
 * Quadranten am Einheitsquadrat, Kreis (Einheitskreis) und Punktwolke
 * liegen um den Ursprung.
 */
export function figure(key: FigKey): Figure {
  const f = rawFigure(key);
  if (key === 'circle' || key === 'cloud') return f;
  // kleiner und näher am Ursprung, damit auch große Bilder ins Bild passen
  const sc = (v: Vec): Vec => [Math.round(v[0] * FIG_SCALE * 1e6) / 1e6, Math.round(v[1] * FIG_SCALE * 1e6) / 1e6];
  return { fills: f.fills.map((poly) => poly.map(sc)), lines: f.lines.map((ln) => ln.map(sc)), dots: f.dots.map(sc) };
}
/** Maßstab der Figuren F, Haus, Smiley und Raumschiff. */
export const FIG_SCALE = 0.65;

function rawFigure(key: FigKey): Figure {
  switch (key) {
    case 'f':
      return {
        fills: [
          [
            [1.3, 0.2],
            [1.75, 0.2],
            [1.75, 1.15],
            [2.4, 1.15],
            [2.4, 1.6],
            [1.75, 1.6],
            [1.75, 2.05],
            [2.7, 2.05],
            [2.7, 2.5],
            [1.3, 2.5],
          ],
        ],
        lines: [],
        dots: [],
      };
    case 'house':
      return {
        fills: [
          [
            [1.3, 0.2],
            [2.9, 0.2],
            [2.9, 1.4],
            [2.1, 2.3],
            [1.3, 1.4],
          ],
        ],
        lines: [
          [
            [1.55, 0.2],
            [1.55, 0.95],
            [1.95, 0.95],
            [1.95, 0.2],
          ],
          [
            [2.25, 0.65],
            [2.65, 0.65],
            [2.65, 1.05],
            [2.25, 1.05],
            [2.25, 0.65],
          ],
          [
            [2.45, 1.85],
            [2.45, 2.25],
            [2.7, 2.25],
            [2.7, 1.62],
          ],
        ],
        dots: [],
      };
    case 'circle':
      return { fills: [circlePts(0, 0, 1)], lines: [[[0, 0], [0.7071, 0.7071]]], dots: [] };
    case 'smile': {
      const mouth: Vec[] = Array.from({ length: 21 }, (_, i) => {
        const t = Math.PI * (1.15 + (0.7 * i) / 20);
        return [2.1 + 0.52 * Math.cos(t), 1.3 + 0.52 * Math.sin(t)] as Vec;
      });
      return { fills: [circlePts(2.1, 1.3, 0.9), circlePts(1.8, 1.55, 0.11, 24), circlePts(2.4, 1.55, 0.11, 24)], lines: [mouth], dots: [] };
    }
    case 'rocket':
      return {
        fills: [
          [
            [1.85, 0.45],
            [2.35, 0.45],
            [2.35, 1.75],
            [2.1, 2.45],
            [1.85, 1.75],
          ],
          [
            [1.85, 0.45],
            [1.5, 0.2],
            [1.5, 0.75],
            [1.85, 1.0],
          ],
          [
            [2.35, 0.45],
            [2.7, 0.2],
            [2.7, 0.75],
            [2.35, 1.0],
          ],
        ],
        lines: [circlePts(2.1, 1.45, 0.14, 24).concat([[2.24, 1.45]])],
        dots: [],
      };
    case 'cloud': {
      const r = rand(7);
      const dots: Vec[] = [];
      while (dots.length < 90) {
        const x = r() * 4 - 2;
        const y = r() * 4 - 2;
        if (x * x + y * y <= 4) dots.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
      }
      return { fills: [], lines: [], dots };
    }
  }
}

/** Orientierter Flächeninhalt eines Polygons (Gaußsche Trapezformel); positiv gegen den Uhrzeigersinn. */
export function signedArea(pts: Vec[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % pts.length]!;
    s += p[0] * q[1] - q[0] * p[1];
  }
  return s / 2;
}
