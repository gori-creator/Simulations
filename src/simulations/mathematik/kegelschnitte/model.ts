/**
 * Rechenlogik für Kegelschnitte als Ortslinien: Ellipse (Abstandssumme),
 * Hyperbel (Abstandsdifferenz), Parabel (Brennpunkt und Leitlinie), die
 * gemeinsame Brennpunkt-Leitlinien-Darstellung mit der Exzentrizität ε und
 * der Schnitt einer Ebene mit einem Doppelkegel.
 * Geprüft in tests/kegelschnitte.test.ts.
 */

export type Pt = readonly [number, number];
export type P3 = readonly [number, number, number];

export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* ------------------------------------------------------------------ */
/* Ellipse                                                              */
/* ------------------------------------------------------------------ */

export interface Ellipse {
  a: number;
  b: number;
  /** lineare Exzentrizität e = √(a² − b²) */
  e: number;
  /** numerische Exzentrizität ε = e/a */
  eps: number;
  foci: [Pt, Pt];
  /** Leitlinien x = ±a/ε (für ε > 0) */
  directrix: number | null;
}

/** Ellipse x²/a² + y²/b² = 1 mit großer Halbachse auf der x-Achse (a ≥ b). */
export function ellipse(a: number, b: number): Ellipse {
  const A = Math.max(a, b);
  const B = Math.min(a, b);
  const e = Math.sqrt(A * A - B * B);
  return { a: A, b: B, e, eps: e / A, foci: [[-e, 0], [e, 0]], directrix: e > 0 ? (A * A) / e : null };
}
export const ellipsePoint = (E: Ellipse, t: number): Pt => [E.a * Math.cos(t), E.b * Math.sin(t)];

/* ------------------------------------------------------------------ */
/* Hyperbel                                                             */
/* ------------------------------------------------------------------ */

export interface Hyperbola {
  a: number;
  b: number;
  e: number;
  eps: number;
  foci: [Pt, Pt];
  /** Steigung der Asymptoten ±b/a */
  slope: number;
  directrix: number;
}

/** Hyperbel x²/a² − y²/b² = 1 (Äste links und rechts). */
export function hyperbola(a: number, b: number): Hyperbola {
  const e = Math.sqrt(a * a + b * b);
  return { a, b, e, eps: e / a, foci: [[-e, 0], [e, 0]], slope: b / a, directrix: (a * a) / e };
}
/** Punkt auf dem rechten (side = 1) oder linken (side = −1) Ast, Parameter u ∈ ℝ. */
export const hyperbolaPoint = (H: Hyperbola, u: number, side: 1 | -1 = 1): Pt => [side * H.a * Math.cosh(u), H.b * Math.sinh(u)];

/* ------------------------------------------------------------------ */
/* Parabel                                                              */
/* ------------------------------------------------------------------ */

export interface Parabola {
  /** Abstand Scheitel–Brennpunkt f (y = x²/(4f)) */
  f: number;
  focus: Pt;
  /** Leitlinie y = −f */
  directrix: number;
}
export const parabola = (f: number): Parabola => ({ f, focus: [0, f], directrix: -f });
export const parabolaPoint = (P: Parabola, x: number): Pt => [x, (x * x) / (4 * P.f)];
/** Aus y = c·x² den Brennpunktabstand f = 1/(4c). */
export const focalFromCoef = (c: number) => 1 / (4 * c);

/**
 * Ortslinien-Konstruktion der Parabel: Zu einem Punkt Q auf der Leitlinie
 * schneidet die Senkrechte durch Q die Mittelsenkrechte von F und Q im
 * Parabelpunkt P (gleich weit von F und von der Leitlinie).
 */
export function parabolaFromDirectrix(P: Parabola, qx: number): { Q: Pt; point: Pt; mid: Pt } {
  const Q: Pt = [qx, P.directrix];
  const point = parabolaPoint(P, qx);
  const mid: Pt = [(Q[0] + P.focus[0]) / 2, (Q[1] + P.focus[1]) / 2];
  return { Q, point, mid };
}

/* ------------------------------------------------------------------ */
/* Brennpunkt-Leitlinien-Darstellung                                    */
/* ------------------------------------------------------------------ */

export type Kind = 'circle' | 'ellipse' | 'parabola' | 'hyperbola';

export function kindOf(eps: number, tol = 1e-9): Kind {
  if (eps < tol) return 'circle';
  if (Math.abs(eps - 1) < tol) return 'parabola';
  return eps < 1 ? 'ellipse' : 'hyperbola';
}

/**
 * Kegelschnitt mit Brennpunkt im Ursprung und Leitlinie x = −d:
 * Abstand zu F = ε · Abstand zur Leitlinie. In Polarkoordinaten um F:
 * r(θ) = ε·d / (1 − ε·cos θ). Liefert null, wo der Nenner ≤ 0 ist.
 */
export function focalRadius(eps: number, d: number, theta: number): number | null {
  const den = 1 - eps * Math.cos(theta);
  if (den <= 1e-9) return null;
  return (eps * d) / den;
}

/** Punkte der Kurve (nur der Ast um den Brennpunkt), in Stücken ohne Sprünge. */
export function focalCurve(eps: number, d: number, n = 720, rMax = 1e3): Pt[][] {
  const parts: Pt[][] = [];
  let cur: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const th = -Math.PI + (2 * Math.PI * i) / n;
    const r = focalRadius(eps, d, th);
    if (r === null || r > rMax) {
      if (cur.length > 1) parts.push(cur);
      cur = [];
      continue;
    }
    cur.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  if (cur.length > 1) parts.push(cur);
  return parts;
}

/* ------------------------------------------------------------------ */
/* Schnitt mit dem Doppelkegel                                          */
/* ------------------------------------------------------------------ */

/**
 * Art des Schnitts eines Doppelkegels (halber Öffnungswinkel α, Achse
 * senkrecht) mit einer Ebene, die um β gegen die Waagerechte geneigt ist
 * (β = 0: waagerecht → Kreis). Ebene nicht durch die Spitze.
 * β < 90° − α: Ellipse, β = 90° − α: Parabel, β > 90° − α: Hyperbel.
 */
export function coneSectionKind(alphaDeg: number, betaDeg: number, tol = 1e-6): Kind {
  if (Math.abs(betaDeg) < tol) return 'circle';
  const crit = 90 - alphaDeg;
  if (Math.abs(betaDeg - crit) < tol) return 'parabola';
  return betaDeg < crit ? 'ellipse' : 'hyperbola';
}

/** Exzentrizität des Schnitts: ε = sin β / cos α (Dandelin). */
export const coneEccentricity = (alphaDeg: number, betaDeg: number) => Math.sin((betaDeg * Math.PI) / 180) / Math.cos((alphaDeg * Math.PI) / 180);

/**
 * Schnittpunkte von Kegel x² + y² = (z·tan α)² (beide Hälften) und Ebene
 * z = h + tan β · x, je Richtung φ um die Achse. Liefert Kurvenstücke
 * (|z| ≤ zMax), für die obere (s = 1) und untere (s = −1) Kegelhälfte.
 */
export function coneSection(alphaDeg: number, betaDeg: number, h: number, zMax: number, n = 360): P3[][] {
  const ta = Math.tan((alphaDeg * Math.PI) / 180);
  const m = Math.tan((betaDeg * Math.PI) / 180);
  const parts: P3[][] = [];
  for (const s of [1, -1]) {
    let cur: P3[] = [];
    for (let i = 0; i <= n; i++) {
      const phi = (2 * Math.PI * i) / n;
      // Punkt auf dem Kegel: (r cos φ, r sin φ, s·r/tan α); Ebene: s·r/ta = h + m·r·cos φ
      const den = s / ta - m * Math.cos(phi);
      const r = Math.abs(den) < 1e-12 ? -1 : h / den;
      const z = (s * r) / ta;
      if (r <= 0 || Math.abs(z) > zMax) {
        if (cur.length > 1) parts.push(cur);
        cur = [];
        continue;
      }
      cur.push([r * Math.cos(phi), r * Math.sin(phi), z]);
    }
    if (cur.length > 1) parts.push(cur);
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/* Tangenten und Spiegelung (Brennpunkteigenschaft)                     */
/* ------------------------------------------------------------------ */

export const norm = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};
export const dot = (u: Pt, v: Pt) => u[0] * v[0] + u[1] * v[1];
const sub = (u: Pt, v: Pt): Pt => [u[0] - v[0], u[1] - v[1]];

/** Einheits-Tangentenrichtung der Ellipse im Punkt zum Parameter t. */
export const ellipseTangent = (E: Ellipse, t: number): Pt => norm([-E.a * Math.sin(t), E.b * Math.cos(t)]);
/** Einheits-Tangentenrichtung der Hyperbel (Parameter u, Ast side). */
export const hyperbolaTangent = (H: Hyperbola, u: number, side: 1 | -1 = 1): Pt => norm([side * H.a * Math.sinh(u), H.b * Math.cosh(u)]);
/** Einheits-Tangentenrichtung der Parabel y = x²/(4f) an der Stelle x. */
export const parabolaTangent = (P: Parabola, x: number): Pt => norm([1, x / (2 * P.f)]);

/**
 * Spiegelt die Richtung d an einer Geraden mit Richtung tangent
 * (Einfallswinkel = Ausfallswinkel): r = 2(d·t)t − d.
 */
export function reflect(d: Pt, tangent: Pt): Pt {
  const t = norm(tangent);
  const k = 2 * dot(d, t);
  return [k * t[0] - d[0], k * t[1] - d[1]];
}

/** Nicht orientierter Winkel zwischen zwei Richtungen (0 … π). */
export function angleBetween(u: Pt, v: Pt): number {
  const c = dot(norm(u), norm(v));
  return Math.acos(Math.max(-1, Math.min(1, c)));
}

/**
 * Winkel zwischen der Tangente und den Brennstrahlen PF₁, PF₂ (spitze
 * Winkel zur Tangentengeraden). Bei Ellipse und Hyperbel sind beide gleich:
 * Die Tangente halbiert den Außen- bzw. Innenwinkel bei P.
 */
export function focalAngles(P: Pt, F1: Pt, F2: Pt, tangent: Pt): [number, number] {
  const acute = (w: number) => Math.min(w, Math.PI - w);
  return [acute(angleBetween(sub(F1, P), tangent)), acute(angleBetween(sub(F2, P), tangent))];
}

/**
 * Schnitt eines Strahls (Start S, Richtung d) mit der Geraden durch A in
 * Richtung u; liefert den Strahlparameter s ≥ 0 oder null.
 */
export function rayLineParam(S: Pt, d: Pt, A: Pt, u: Pt): number | null {
  const det = d[0] * -u[1] - d[1] * -u[0];
  if (Math.abs(det) < 1e-12) return null;
  const rx = A[0] - S[0];
  const ry = A[1] - S[1];
  const s = (rx * -u[1] - ry * -u[0]) / det;
  return s >= 0 ? s : null;
}

/* ------------------------------------------------------------------ */
/* Leitkreis-Konstruktion                                               */
/* ------------------------------------------------------------------ */

/**
 * Leitkreis um F₁ mit Radius R = 2a. Zu Q = F₁ + R·(cos φ, sin φ) schneidet
 * die Mittelsenkrechte von Q und F₂ die Gerade F₁Q im Kurvenpunkt P:
 * |PF₂| = |PQ|, also |PF₁| + |PF₂| = 2a (Ellipse, F₂ im Kreis) bzw.
 * ||PF₁| − |PF₂|| = 2a (Hyperbel, F₂ außerhalb). P = F₁ + s·u mit
 * s = (R² − |F₁F₂|²) / (2·(R + (F₁ − F₂)·u)). Für die Hyperbel gibt es
 * Richtungen ohne Schnittpunkt (Mittelsenkrechte parallel zu F₁Q): null.
 */
export function directorCirclePoint(F1: Pt, F2: Pt, R: number, phi: number): { Q: Pt; P: Pt; mid: Pt; s: number } | null {
  const u: Pt = [Math.cos(phi), Math.sin(phi)];
  const w = sub(F1, F2);
  const den = 2 * (R + dot(w, u));
  if (Math.abs(den) < 1e-9) return null;
  const s = (R * R - dot(w, w)) / den;
  const Q: Pt = [F1[0] + R * u[0], F1[1] + R * u[1]];
  const P: Pt = [F1[0] + s * u[0], F1[1] + s * u[1]];
  return { Q, P, mid: [(Q[0] + F2[0]) / 2, (Q[1] + F2[1]) / 2], s };
}

/* ------------------------------------------------------------------ */
/* Übungsaufgaben: Brennpunkte finden                                   */
/* ------------------------------------------------------------------ */

export interface ConicTask {
  kind: 'ellipse' | 'hyperbola' | 'parabola';
  /** Mittelpunkt (Ellipse, Hyperbel) bzw. Scheitel (Parabel) */
  cx: number;
  cy: number;
  a: number;
  b: number;
  /** Parabel: Brennweite f (> 0 nach oben offen, < 0 nach unten offen) */
  f: number;
  /** Hauptachse senkrecht (Ellipse, Hyperbel)? */
  vertical: boolean;
}

/** Halbachsen mit „glatter“ linearer Exzentrizität (pythagoreische Tripel). */
const ELL_TRIPLES: [number, number][] = [
  [5, 4],
  [5, 3],
  [2.5, 2],
  [2.5, 1.5],
  [4, 2.4],
  [6.5, 2.5],
];
const HYP_TRIPLES: [number, number][] = [
  [3, 4],
  [4, 3],
  [1.5, 2],
  [2, 1.5],
  [1.2, 1.6],
  [2.4, 1],
];

/** Kleiner, reproduzierbarer Zufallsgenerator (für Aufgabennummern in Links). */
export function rng(seed: number): () => number {
  let s = (Math.floor(seed) * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** Aufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): ConicTask {
  const r = rng(n * 7 + 3);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(r() * xs.length) % xs.length]!;
  const kind = pick(['ellipse', 'hyperbola', 'parabola'] as const);
  const cx = pick([-2, -1, 0, 0, 1, 2]);
  const cy = pick([-1, 0, 0, 1]);
  if (kind === 'parabola') {
    const f = pick([0.25, 0.5, 1, 1.25, 2.5]) * (r() < 0.75 ? 1 : -1);
    return { kind, cx, cy: f > 0 ? cy - 2 : cy + 2, a: 0, b: 0, f, vertical: true };
  }
  const [a, b] = pick(kind === 'ellipse' ? ELL_TRIPLES : HYP_TRIPLES);
  return { kind, cx, cy, a, b, f: 0, vertical: kind === 'ellipse' ? r() < 0.25 : r() < 0.2 };
}

/** Brennpunkte der Aufgabe (Parabel: einer). */
export function taskFoci(T: ConicTask): Pt[] {
  if (T.kind === 'parabola') return [[T.cx, T.cy + T.f]];
  const e = T.kind === 'ellipse' ? Math.sqrt(Math.abs(T.a * T.a - T.b * T.b)) : Math.sqrt(T.a * T.a + T.b * T.b);
  return T.vertical
    ? [
        [T.cx, T.cy - e],
        [T.cx, T.cy + e],
      ]
    : [
        [T.cx - e, T.cy],
        [T.cx + e, T.cy],
      ];
}

/** Lineare Exzentrizität der Aufgabe (Parabel: |f|). */
export function taskE(T: ConicTask): number {
  if (T.kind === 'parabola') return Math.abs(T.f);
  return T.kind === 'ellipse' ? Math.sqrt(T.a * T.a - T.b * T.b) : Math.sqrt(T.a * T.a + T.b * T.b);
}

/** Kurvenpunkte der Aufgabe als Polylinien. */
export function taskCurve(T: ConicTask, extent = 12): Pt[][] {
  if (T.kind === 'parabola') {
    const pts: Pt[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = -extent + (2 * extent * i) / 200;
      pts.push([T.cx + x, T.cy + (x * x) / (4 * T.f)]);
    }
    return [pts];
  }
  const map = (x: number, y: number): Pt => (T.vertical ? [T.cx + y, T.cy + x] : [T.cx + x, T.cy + y]);
  if (T.kind === 'ellipse') return [Array.from({ length: 181 }, (_, i) => map(T.a * Math.cos((i / 180) * 2 * Math.PI), T.b * Math.sin((i / 180) * 2 * Math.PI)))];
  const uMax = Math.asinh(extent / T.b);
  return ([1, -1] as const).map((side) => Array.from({ length: 121 }, (_, i) => {
    const u = -uMax + (2 * uMax * i) / 120;
    return map(side * T.a * Math.cosh(u), T.b * Math.sinh(u));
  }));
}

/**
 * Gleichung der Aufgabe in Scheitel-/Mittelpunktform; fmt formatiert Zahlen
 * (deutsch mit Komma). Beispiel: (x − 1)²/25 + (y + 2)²/16 = 1.
 */
export function taskEquation(T: ConicTask, fmt: (v: number) => string): string {
  const sh = (v: string, c: number) => (c === 0 ? `${v}²` : `(${v} ${c > 0 ? '−' : '+'} ${fmt(Math.abs(c))})²`);
  const X = sh('x', T.cx);
  const Y = sh('y', T.cy);
  if (T.kind === 'parabola') {
    const k = T.cy === 0 ? '' : ` ${T.cy > 0 ? '+' : '−'} ${fmt(Math.abs(T.cy))}`;
    const c = 1 / (4 * T.f);
    return `y = ${c < 0 ? '−' : ''}${fmt(Math.abs(c))} · ${X}${k}`;
  }
  const A = fmt(T.a * T.a);
  const B = fmt(T.b * T.b);
  if (T.kind === 'ellipse') return T.vertical ? `${X}/${B} + ${Y}/${A} = 1` : `${X}/${A} + ${Y}/${B} = 1`;
  return T.vertical ? `${Y}/${A} − ${X}/${B} = 1` : `${X}/${A} − ${Y}/${B} = 1`;
}

/**
 * Bewertet geratene Brennpunkte: größter Abstand bei bester Zuordnung
 * (Reihenfolge egal). ok, wenn höchstens tol daneben.
 */
export function checkFoci(T: ConicTask, guess: readonly Pt[], tol = 0.25): { err: number; ok: boolean } {
  const F = taskFoci(T);
  let err: number;
  if (F.length === 1) err = dist(F[0]!, guess[0]!);
  else {
    const e1 = Math.max(dist(F[0]!, guess[0]!), dist(F[1]!, guess[1]!));
    const e2 = Math.max(dist(F[0]!, guess[1]!), dist(F[1]!, guess[0]!));
    err = Math.min(e1, e2);
  }
  return { err, ok: err <= tol };
}
