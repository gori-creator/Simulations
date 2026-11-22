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
