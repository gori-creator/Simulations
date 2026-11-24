/** Rechenlogik „Satz des Thales“. */
export type Point = readonly [number, number];

/** Winkel bei C im Dreieck ABC in Grad. */
export function angleAt(c: Point, a: Point, b: Point): number {
  const ux = a[0] - c[0];
  const uy = a[1] - c[1];
  const vx = b[0] - c[0];
  const vy = b[1] - c[1];
  const lu = Math.hypot(ux, uy);
  const lv = Math.hypot(vx, vy);
  if (lu < 1e-12 || lv < 1e-12) return NaN;
  const cos = Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (lu * lv)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Lage eines Punktes zum Kreis um m mit Radius r. */
export function positionToCircle(p: Point, m: Point, r: number, tolerance = 1e-6): 'on' | 'inside' | 'outside' {
  const d = Math.hypot(p[0] - m[0], p[1] - m[1]);
  if (Math.abs(d - r) <= tolerance * Math.max(1, r)) return 'on';
  return d < r ? 'inside' : 'outside';
}

export type AngleKind = 'right' | 'obtuse' | 'acute' | 'degenerate';

/**
 * Art des Winkels bei C im Dreieck ABC, bestimmt über die Lage von C zum
 * Thaleskreis über [AB]: auf dem Kreis rechtwinklig, innen stumpf, außen spitz.
 * Liegt C auf der Geraden AB (auch C = A oder C = B), gibt es kein Dreieck.
 * So passen Winkelart und angezeigte Lage immer zusammen.
 */
export function angleKind(c: Point, a: Point, b: Point, tolerance = 1e-9): AngleKind {
  const ab = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  if (ab < 1e-12 || Math.abs(cross) <= tolerance * ab * ab) return 'degenerate';
  const m: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const position = positionToCircle(c, m, ab / 2, tolerance);
  return position === 'on' ? 'right' : position === 'inside' ? 'obtuse' : 'acute';
}

/* ------------------------------------------------------------------ */
/* Konstruktionen mit dem Thaleskreis                                  */
/* ------------------------------------------------------------------ */

/** Schnittpunkte zweier Kreise (0, 1 oder 2 Punkte). */
export function circleIntersections(c1: Point, r1: number, c2: Point, r2: number): Point[] {
  const dx = c2[0] - c1[0];
  const dy = c2[1] - c1[1];
  const d = Math.hypot(dx, dy);
  if (d < 1e-12 || d > r1 + r2 + 1e-12 || d < Math.abs(r1 - r2) - 1e-12) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const mx = c1[0] + (a * dx) / d;
  const my = c1[1] + (a * dy) / d;
  if (h < 1e-12) return [[mx, my]];
  return [
    [mx + (h * dy) / d, my - (h * dx) / d],
    [mx - (h * dy) / d, my + (h * dx) / d],
  ];
}

/**
 * Berührpunkte der Tangenten von P an den Kreis um O mit Radius r:
 * Schnittpunkte des Kreises mit dem Thaleskreis über [OP].
 * Liegt P im Kreis, gibt es keine Tangente; auf dem Kreis genau eine.
 */
export function tangentPoints(o: Point, r: number, p: Point): Point[] {
  const m: Point = [(o[0] + p[0]) / 2, (o[1] + p[1]) / 2];
  const d = Math.hypot(p[0] - o[0], p[1] - o[1]);
  if (d < r - 1e-9) return [];
  return circleIntersections(o, r, m, d / 2);
}

/**
 * Rechtwinkliges Dreieck aus Hypotenuse c = |AB| und Kathete a = |BC|:
 * C ist der (obere) Schnittpunkt des Thaleskreises mit dem Kreis um B mit Radius a.
 */
export function rightTriangle(c: number, a: number): { A: Point; B: Point; C: Point; b: number; alpha: number; beta: number } | null {
  if (!(a > 0) || !(c > 0) || a >= c) return null;
  const A: Point = [-c / 2, 0];
  const B: Point = [c / 2, 0];
  const pts = circleIntersections([0, 0], c / 2, B, a);
  const C = pts.find((q) => q[1] > 0);
  if (!C) return null;
  const b = Math.sqrt(c * c - a * a);
  const alpha = (Math.asin(a / c) * 180) / Math.PI;
  return { A, B, C, b, alpha, beta: 90 - alpha };
}

/**
 * Geodreieck auf dem Kreis (Mittelpunkt 0, Radius r): Scheitel V bei Winkel `theta`,
 * erster Schenkel in Richtung `rot` (Bogenmaß), zweiter senkrecht dazu.
 * Liefert die zweiten Schnittpunkte der Schenkel mit dem Kreis – nach Thales ein Durchmesser.
 */
export function setSquareChord(r: number, theta: number, rot: number): { V: Point; P: Point; Q: Point } {
  const V: Point = [r * Math.cos(theta), r * Math.sin(theta)];
  const hit = (ang: number): Point => {
    const d: Point = [Math.cos(ang), Math.sin(ang)];
    const t = -2 * (V[0] * d[0] + V[1] * d[1]);
    return [V[0] + t * d[0], V[1] + t * d[1]];
  };
  return { V, P: hit(rot), Q: hit(rot + Math.PI / 2) };
}

/** Schnittpunkt der Geraden P1P2 und Q1Q2 (null bei parallelen Geraden). */
export function lineIntersection(p1: Point, p2: Point, q1: Point, q2: Point): Point | null {
  const d1x = p2[0] - p1[0];
  const d1y = p2[1] - p1[1];
  const d2x = q2[0] - q1[0];
  const d2y = q2[1] - q1[1];
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((q1[0] - p1[0]) * d2y - (q1[1] - p1[1]) * d2x) / den;
  return [p1[0] + t * d1x, p1[1] + t * d1y];
}

/* ------------------------------------------------------------------ */
/* Übung „spitz, recht oder stumpf?“                                    */
/* ------------------------------------------------------------------ */

export function rng(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Punkt C der Aufgabe Nr. n (Kreisradius r): reproduzierbar, je etwa ein Drittel
 * spitz, recht und stumpf; nie zu knapp am Kreis, damit man es sehen kann.
 */
export function quizPoint(n: number, r: number): { C: Point; kind: Exclude<AngleKind, 'degenerate'> } {
  const rand = rng(n * 104729 + 7);
  const k = Math.floor(rand() * 3);
  const ang = ((25 + rand() * 130) * Math.PI) / 180;
  const f = k === 0 ? 1.25 + rand() * 0.25 : k === 1 ? 1 : 0.5 + rand() * 0.3;
  const C: Point = [r * f * Math.cos(ang), r * f * Math.sin(ang)];
  return { C, kind: k === 0 ? 'acute' : k === 1 ? 'right' : 'obtuse' };
}
