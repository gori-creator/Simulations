/**
 * Rechenlogik „Achsen- und Punktspiegelung“ (Jahrgangsstufe 7).
 *
 * Koordinaten in Kästchen des Karopapiers (1 Kästchen = 0,5 cm), y nach oben.
 *
 * Achsenspiegelung an der Achse s (Gerade durch zwei Punkte): Ein Punkt P und
 * sein Bildpunkt P' liegen auf einer Senkrechten zu s, und s halbiert die
 * Strecke [PP']. Punkte auf s bleiben fest (Fixpunkte).
 *
 * Punktspiegelung am Zentrum Z: Z ist der Mittelpunkt der Strecke [PP'],
 * also P' = 2·Z − P. Das ist dasselbe wie eine Drehung um 180° um Z.
 *
 * Beide Abbildungen erhalten Längen und Winkel. Die Achsenspiegelung kehrt den
 * Umlaufsinn um, die Punktspiegelung erhält ihn.
 */

export type Pt = readonly [number, number];

export const GRID_W = 20;
export const GRID_H = 14;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const dot = (u: Pt, v: Pt): number => u[0] * v[0] + u[1] * v[1];
const cross = (u: Pt, v: Pt): number => u[0] * v[1] - u[1] * v[0];

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Lotfußpunkt von P auf die Gerade durch A und B. */
export function foot(p: Pt, a: Pt, b: Pt): Pt {
  const u = sub(b, a);
  const k = dot(sub(p, a), u) / dot(u, u);
  return [a[0] + k * u[0], a[1] + k * u[1]];
}

/** Bildpunkt bei der Achsenspiegelung an der Geraden AB. */
export function reflectAcross(p: Pt, a: Pt, b: Pt): Pt {
  const f = foot(p, a, b);
  return [2 * f[0] - p[0], 2 * f[1] - p[1]];
}

/** Bildpunkt bei der Punktspiegelung am Zentrum Z. */
export function reflectPoint(p: Pt, z: Pt): Pt {
  return [2 * z[0] - p[0], 2 * z[1] - p[1]];
}

/** Abstand des Punktes P von der Geraden AB. */
export function lineDistance(p: Pt, a: Pt, b: Pt): number {
  const u = sub(b, a);
  return Math.abs(cross(u, sub(p, a))) / Math.hypot(u[0], u[1]);
}

/** Auf welcher Seite der Geraden AB liegt P? (+1 links, −1 rechts, 0 auf der Geraden) */
export function side(p: Pt, a: Pt, b: Pt): number {
  return Math.sign(cross(sub(b, a), sub(p, a)));
}

/** Doppelter orientierter Flächeninhalt eines Vielecks (positiv: gegen den Uhrzeigersinn). */
export function area2(pts: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) s += cross(pts[i]!, pts[(i + 1) % pts.length]!);
  return s;
}

/** Umlaufsinn: +1 gegen den Uhrzeigersinn (mathematisch positiv), −1 im Uhrzeigersinn. */
export function orientation(pts: readonly Pt[]): 1 | -1 | 0 {
  const a = area2(pts);
  return a > 1e-9 ? 1 : a < -1e-9 ? -1 : 0;
}

/** Innenwinkel (in Grad) bei Q im Dreieck bzw. zwischen den Strahlen QP und QR. */
export function angleAt(p: Pt, q: Pt, r: Pt): number {
  const u = sub(p, q);
  const v = sub(r, q);
  return (Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))))) * 180) / Math.PI;
}

/* ------------------------------------------------------------------ */
/* Figuren zum Spiegeln                                                */
/* ------------------------------------------------------------------ */

export type ShapeKind = 'dreieck' | 'viereck' | 'fahne';

/**
 * Fähnchen aus drei Punkten: Fuß A und Spitze B der Stange, Flaggenspitze C.
 * Das Tuch ist das Dreieck B, C, M mit M auf der Stange.
 */
export function flagCloth(a: Pt, b: Pt, c: Pt): [Pt, Pt, Pt] {
  const m: Pt = [b[0] + 0.45 * (a[0] - b[0]), b[1] + 0.45 * (a[1] - b[1])];
  return [b, c, m];
}

/** Ecken der Figur, deren Umlaufsinn betrachtet wird. */
export function orientedPoints(kind: ShapeKind, pts: readonly Pt[]): Pt[] {
  if (kind === 'fahne') return flagCloth(pts[0]!, pts[1]!, pts[2]!);
  return pts.slice(0, kind === 'viereck' ? 4 : 3);
}

/** Ist die Figur gültig (kein Punkt doppelt, nichts zusammengeklappt, nicht überschlagen)? */
export function shapeValid(kind: ShapeKind, pts: readonly Pt[]): boolean {
  const n = kind === 'viereck' ? 4 : 3;
  const q = pts.slice(0, n);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (dist(q[i]!, q[j]!) < 1e-9) return false;
  if (kind !== 'viereck') return Math.abs(cross(sub(q[1]!, q[0]!), sub(q[2]!, q[0]!))) > 1e-9;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(cross(sub(q[i]!, q[(i + 3) % 4]!), sub(q[(i + 1) % 4]!, q[i]!))) < 1e-9) return false;
  }
  const crosses = (p1: Pt, p2: Pt, p3: Pt, p4: Pt) =>
    cross(sub(p4, p3), sub(p1, p3)) * cross(sub(p4, p3), sub(p2, p3)) < 0 && cross(sub(p2, p1), sub(p3, p1)) * cross(sub(p2, p1), sub(p4, p1)) < 0;
  return !crosses(q[0]!, q[1]!, q[2]!, q[3]!) && !crosses(q[1]!, q[2]!, q[3]!, q[0]!);
}

/* ------------------------------------------------------------------ */
/* Symmetrie erkennen                                                  */
/* ------------------------------------------------------------------ */

export type FigId = 'H' | 'T' | 'E' | 'N' | 'F' | 'dreieck' | 'parallelogramm' | 'stern' | 'windrad';
export const FIG_IDS: readonly FigId[] = ['H', 'T', 'E', 'N', 'F', 'dreieck', 'parallelogramm', 'stern', 'windrad'];

const polar = (r: number, deg: number): Pt => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];

/** Figuren als geschlossene Vielecke (Kästchen, Mittelpunkt etwa im Ursprung). */
export const FIGURES: Readonly<Record<FigId, readonly (readonly Pt[])[]>> = {
  H: [
    [
      [-3, -4],
      [-1, -4],
      [-1, -1],
      [1, -1],
      [1, -4],
      [3, -4],
      [3, 4],
      [1, 4],
      [1, 1],
      [-1, 1],
      [-1, 4],
      [-3, 4],
    ],
  ],
  T: [
    [
      [-3.5, 4],
      [3.5, 4],
      [3.5, 2],
      [1, 2],
      [1, -4],
      [-1, -4],
      [-1, 2],
      [-3.5, 2],
    ],
  ],
  E: [
    [
      [-3, -4],
      [3, -4],
      [3, -2],
      [-1, -2],
      [-1, -1],
      [2, -1],
      [2, 1],
      [-1, 1],
      [-1, 2],
      [3, 2],
      [3, 4],
      [-3, 4],
    ],
  ],
  N: [
    [
      [-3, -4],
      [-1, -4],
      [-1, 1],
      [1, -4],
      [3, -4],
      [3, 4],
      [1, 4],
      [1, -1],
      [-1, 4],
      [-3, 4],
    ],
  ],
  F: [
    [
      [-3, -4],
      [-1, -4],
      [-1, -1],
      [2, -1],
      [2, 1],
      [-1, 1],
      [-1, 2],
      [3, 2],
      [3, 4],
      [-3, 4],
    ],
  ],
  dreieck: [[polar(4.8, 90), polar(4.8, 210), polar(4.8, 330)]],
  parallelogramm: [
    [
      [-4.5, -2.5],
      [1.5, -2.5],
      [4.5, 2.5],
      [-1.5, 2.5],
    ],
  ],
  stern: [Array.from({ length: 10 }, (_, i) => polar(i % 2 === 0 ? 5 : 2, 90 + i * 36))],
  windrad: [
    [0, 1, 2].flatMap((k) => {
      const rot = (p: Pt): Pt => {
        const a = (k * 120 * Math.PI) / 180;
        return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
      };
      return [rot([1, 0]), rot([4.8, 1.3]), rot([1.9, 2.6])];
    }),
  ],
};

/** Figur gedreht (Grad), vergrößert und verschoben. */
export function placeFigure(id: FigId, rot: number, center: Pt, scale = 1): Pt[][] {
  const a = (rot * Math.PI) / 180;
  const c = Math.cos(a) * scale;
  const s = Math.sin(a) * scale;
  return FIGURES[id].map((poly) => poly.map(([x, y]) => [center[0] + x * c - y * s, center[1] + x * s + y * c] as Pt));
}

export interface SymAxis {
  /** Punkt auf der Achse (Schwerpunkt der Ecken). */
  p: Pt;
  /** Richtung als Winkel in Grad (0 … 180). */
  angle: number;
}

export interface Symmetry {
  axes: SymAxis[];
  /** Symmetriezentrum (bei Punktsymmetrie), sonst null. */
  center: Pt | null;
  /** Schwerpunkt der Ecken – liegt auf jeder Achse. */
  centroid: Pt;
}

const TOL = 1e-6;

/** Wird die Figur durch die Abbildung `map` auf sich selbst abgebildet? (Kanten als Mengen) */
export function mapsOntoItself(polys: readonly (readonly Pt[])[], map: (p: Pt) => Pt, tol = TOL): boolean {
  const edges: [Pt, Pt][] = [];
  for (const poly of polys) for (let i = 0; i < poly.length; i++) edges.push([poly[i]!, poly[(i + 1) % poly.length]!]);
  const near = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;
  return edges.every(([a, b]) => {
    const a2 = map(a);
    const b2 = map(b);
    return edges.some(([c, d]) => (near(a2, c) && near(b2, d)) || (near(a2, d) && near(b2, c)));
  });
}

/** Alle Symmetrieachsen und das Symmetriezentrum einer Figur. */
export function symmetryOf(polys: readonly (readonly Pt[])[]): Symmetry {
  const pts = polys.flat();
  const c: Pt = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  // Eine Spiegelung bildet die erste Ecke auf irgendeine Ecke ab: Achse ist die Mittelsenkrechte (bzw. geht durch die Ecke).
  const v0 = pts[0]!;
  const angles: number[] = [];
  for (const v of pts) {
    let ang: number;
    if (dist(v, v0) < TOL) ang = (Math.atan2(v0[1] - c[1], v0[0] - c[0]) * 180) / Math.PI;
    else ang = (Math.atan2(v[1] - v0[1], v[0] - v0[0]) * 180) / Math.PI + 90;
    ang = ((ang % 180) + 180) % 180;
    if (ang > 180 - 1e-7) ang = 0;
    if (!angles.some((a) => Math.abs(a - ang) < 1e-6)) angles.push(ang);
  }
  const axes: SymAxis[] = [];
  for (const ang of angles.sort((a, b) => a - b)) {
    const d: Pt = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)];
    const q: Pt = [c[0] + d[0], c[1] + d[1]];
    if (mapsOntoItself(polys, (p) => reflectAcross(p, c, q))) axes.push({ p: c, angle: Math.round(ang * 1e6) / 1e6 });
  }
  const center = mapsOntoItself(polys, (p) => reflectPoint(p, c)) ? c : null;
  return { axes, center, centroid: c };
}

/** Winkelunterschied zweier Geradenrichtungen (0 … 90°). */
export function lineAngleDiff(a: number, b: number): number {
  const d = Math.abs((((a - b) % 180) + 180) % 180);
  return Math.min(d, 180 - d);
}

/**
 * Passt eine gezeichnete Gerade (durch P1 und P2) zu einer Symmetrieachse?
 * Gibt den Index der Achse zurück, sonst −1.
 */
export function matchAxis(p1: Pt, p2: Pt, axes: readonly SymAxis[], tolDeg = 8, tolDist = 0.8): number {
  if (dist(p1, p2) < 1e-9) return -1;
  const ang = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
  let best = -1;
  let bestScore = Infinity;
  axes.forEach((ax, i) => {
    const da = lineAngleDiff(ang, ax.angle);
    const dd = lineDistance(ax.p, p1, p2);
    if (da <= tolDeg && dd <= tolDist && da + dd * 5 < bestScore) {
      best = i;
      bestScore = da + dd * 5;
    }
  });
  return best;
}
