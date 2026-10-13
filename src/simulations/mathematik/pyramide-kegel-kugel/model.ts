/**
 * Pyramide, Kegel und Kugel: Maße mit dem Satz des Pythagoras, Volumen
 * (V = ⅓ · G · h bzw. V = 4/3 · π · r³), Mantel und Oberfläche.
 *
 * Dazu die Geometrie für den Umschüttversuch: Ein Gefäß (umgedrehte
 * Pyramide, umgedrehter Kegel, Halbkugelschale) wird gekippt; das Wasser
 * darin bildet immer den Teil des Gefäßes unterhalb einer waagerechten
 * Ebene. Dafür werden konvexe Körper an einer Ebene abgeschnitten und ihr
 * Volumen bestimmt.
 */

import type { Vec3 } from '../../../sim-core';

export type BodyId = 'pyramide' | 'kegel' | 'kugel';
export type Pt = readonly [number, number];

/* ------------------------------------------------------------------ */
/* Regelmäßiges Vieleck                                                */
/* ------------------------------------------------------------------ */

export interface RegularPolygon {
  n: number;
  /** Seitenlänge. */
  a: number;
  /** Inkreisradius (Abstand Mitte – Seitenmitte). */
  rho: number;
  /** Umkreisradius (Abstand Mitte – Ecke). */
  R: number;
  area: number;
  perimeter: number;
}

/** Regelmäßiges n-Eck mit der Seitenlänge a. */
export function polygonBySide(n: number, a: number): RegularPolygon {
  const rho = a / (2 * Math.tan(Math.PI / n));
  const R = a / (2 * Math.sin(Math.PI / n));
  return { n, a, rho, R, area: 0.5 * n * a * rho, perimeter: n * a };
}

/**
 * Eckpunkte (x₁ | x₂) eines regelmäßigen n-Ecks mit Umkreisradius R, gegen
 * den Uhrzeigersinn. Die erste Seite liegt senkrecht zur x₂-Achse auf der
 * Seite `side` (+1: bei x₂ = +ρ, −1: bei x₂ = −ρ).
 */
export function polygonPoints(n: number, R: number, side: 1 | -1 = 1): Pt[] {
  const start = (side > 0 ? Math.PI / 2 : -Math.PI / 2) - Math.PI / n;
  return Array.from({ length: n }, (_, i) => {
    const t = start + (2 * Math.PI * i) / n;
    return [R * Math.cos(t), R * Math.sin(t)] as Pt;
  });
}

/* ------------------------------------------------------------------ */
/* Pyramide, Kegel, Kugel                                              */
/* ------------------------------------------------------------------ */

export interface PyramidData {
  base: RegularPolygon;
  h: number;
  /** Grundfläche. */
  G: number;
  /** Seitenhöhe (Höhe einer Seitenfläche): h_a² = h² + ρ². */
  ha: number;
  /** Seitenkante (Spitze – Ecke): s² = h² + R² = h_a² + (a/2)². */
  s: number;
  /** Inhalt einer Seitenfläche ½ · a · h_a. */
  face: number;
  /** Mantel M = n · ½ · a · h_a. */
  M: number;
  /** Oberfläche O = G + M. */
  O: number;
  /** Volumen V = ⅓ · G · h. */
  V: number;
  /** Neigungswinkel einer Seitenfläche gegen die Grundfläche (Bogenmaß). */
  faceAngle: number;
}

/** Gerade Pyramide über einem regelmäßigen n-Eck mit Grundkante a und Höhe h. */
export function pyramid(n: number, a: number, h: number): PyramidData {
  const base = polygonBySide(n, a);
  const ha = Math.hypot(h, base.rho);
  const s = Math.hypot(h, base.R);
  const face = 0.5 * a * ha;
  const M = n * face;
  return { base, h, G: base.area, ha, s, face, M, O: base.area + M, V: (base.area * h) / 3, faceAngle: Math.atan2(h, base.rho) };
}

export interface ConeData {
  r: number;
  h: number;
  G: number;
  /** Umfang der Grundfläche 2πr. */
  u: number;
  /** Mantellinie s² = h² + r². */
  s: number;
  /** Mantel M = π · r · s. */
  M: number;
  O: number;
  V: number;
  /** Mittelpunktswinkel des abgewickelten Mantels (Kreissektor) im Bogenmaß: α = 2π · r / s. */
  sector: number;
  /** Derselbe Winkel in Grad: α = 360° · r / s. */
  sectorDeg: number;
}

/** Gerader Kreiskegel mit Radius r und Höhe h. */
export function cone(r: number, h: number): ConeData {
  const s = Math.hypot(r, h);
  const G = Math.PI * r * r;
  const M = Math.PI * r * s;
  return { r, h, G, u: 2 * Math.PI * r, s, M, O: G + M, V: (G * h) / 3, sector: (2 * Math.PI * r) / s, sectorDeg: (360 * r) / s };
}

export interface SphereData {
  r: number;
  d: number;
  V: number;
  O: number;
  /** Großkreisfläche π · r². */
  disc: number;
  /** Umschriebener Zylinder (Radius r, Höhe 2r): Volumen 2πr³ und Oberfläche 6πr². */
  cylV: number;
  cylO: number;
  /** Archimedes-Vergleich (Zylinder mit Radius r und Höhe r): Zylinder πr³, Kegel ⅓πr³, Halbkugel ⅔πr³. */
  archimedes: { cylinder: number; cone: number; hemisphere: number };
}

export function sphere(r: number): SphereData {
  const r3 = r * r * r;
  return {
    r,
    d: 2 * r,
    V: (4 / 3) * Math.PI * r3,
    O: 4 * Math.PI * r * r,
    disc: Math.PI * r * r,
    cylV: 2 * Math.PI * r3,
    cylO: 6 * Math.PI * r * r,
    archimedes: { cylinder: Math.PI * r3, cone: (Math.PI * r3) / 3, hemisphere: (2 * Math.PI * r3) / 3 },
  };
}

/* ------------------------------------------------------------------ */
/* Kegelmantel abwickeln                                               */
/* ------------------------------------------------------------------ */

/**
 * Zwischenstufe beim Abwickeln des Kegelmantels (t = 0: Kegel, t = 1: ebener
 * Kreissektor). Der aufgeschnittene Mantel bleibt ein Kegelmantel mit
 * derselben Mantellinie s und derselben Bogenlänge 2πr, nur mit größerem
 * Grundkreis ρ (von r bis s): Er umfasst dann nur noch den Winkel φ = 2πr/ρ,
 * und die Spitze sinkt auf die Höhe √(s² − ρ²). Bei ρ = s liegt er flach.
 */
export function unrollCone(r: number, s: number, t: number): { rho: number; wrap: number; height: number } {
  const q = Math.max(0, Math.min(1, t));
  const rho = r + (s - r) * q;
  return { rho, wrap: (2 * Math.PI * r) / rho, height: Math.sqrt(Math.max(0, s * s - rho * rho)) };
}

/* ------------------------------------------------------------------ */
/* Konvexe Körper: abschneiden und Volumen                             */
/* ------------------------------------------------------------------ */

/** Konvexer Körper als Liste ebener Flächen (Eckpunkte von außen gesehen gegen den Uhrzeigersinn). */
export type Solid = Vec3[][];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Normale einer ebenen Fläche (Newell-Verfahren, nicht normiert). */
function faceNormal(face: readonly Vec3[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < face.length; i++) {
    const p = face[i]!;
    const q = face[(i + 1) % face.length]!;
    x += (p[1] - q[1]) * (p[2] + q[2]);
    y += (p[2] - q[2]) * (p[0] + q[0]);
    z += (p[0] - q[0]) * (p[1] + q[1]);
  }
  return [x, y, z];
}

/** Dreht Flächen so, dass ihre Normalen nach außen zeigen (für konvexe Körper). */
export function orientOutward(faces: Vec3[][]): Solid {
  const all = faces.flat();
  const c: Vec3 = [0, 1, 2].map((k) => all.reduce((s, p) => s + p[k]!, 0) / all.length) as unknown as Vec3;
  return faces.map((f) => {
    const fc: Vec3 = [0, 1, 2].map((k) => f.reduce((s, p) => s + p[k]!, 0) / f.length) as unknown as Vec3;
    return dot(faceNormal(f), sub(fc, c)) < 0 ? [...f].reverse() : f;
  });
}

/** Volumen eines geschlossenen Körpers mit nach außen orientierten Flächen (Gaußscher Integralsatz). */
export function solidVolume(solid: Solid): number {
  let v = 0;
  for (const f of solid) {
    const p0 = f[0]!;
    for (let i = 1; i + 1 < f.length; i++) v += dot(p0, cross(f[i]!, f[i + 1]!));
  }
  return v / 6;
}

/**
 * Teil eines konvexen Körpers unterhalb der Höhe z (x₃ ≤ z) als neuer
 * geschlossener Körper mit Deckfläche (die Deckfläche ist die letzte Fläche).
 */
export function clipBelow(solid: Solid, z: number): Solid {
  const out: Solid = [];
  const cut: Vec3[] = [];
  for (const f of solid) {
    const poly: Vec3[] = [];
    for (let i = 0; i < f.length; i++) {
      const p = f[i]!;
      const q = f[(i + 1) % f.length]!;
      const pin = p[2] <= z;
      const qin = q[2] <= z;
      if (pin) poly.push(p);
      if (pin !== qin) {
        const t = (z - p[2]) / (q[2] - p[2]);
        const x: Vec3 = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, z];
        poly.push(x);
        cut.push(x);
      }
    }
    if (poly.length >= 3) out.push(poly);
  }
  // Deckfläche: Schnittpunkte nach Winkel ordnen (von oben gesehen gegen den Uhrzeigersinn)
  if (cut.length >= 3) {
    const cx = cut.reduce((s, p) => s + p[0], 0) / cut.length;
    const cy = cut.reduce((s, p) => s + p[1], 0) / cut.length;
    const sorted = cut.map((p) => ({ p, a: Math.atan2(p[1] - cy, p[0] - cx) })).sort((u, v) => u.a - v.a);
    const cap: Vec3[] = [];
    for (const { p } of sorted) {
      const last = cap[cap.length - 1];
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-9) cap.push(p);
    }
    if (cap.length > 2 && Math.hypot(cap[0]![0] - cap[cap.length - 1]![0], cap[0]![1] - cap[cap.length - 1]![1]) <= 1e-9) cap.pop();
    if (cap.length >= 3) out.push(cap);
  }
  return out;
}

/** Tiefster und höchster Punkt eines Körpers. */
export function zRange(solid: Solid): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const f of solid) for (const p of f) {
    lo = Math.min(lo, p[2]);
    hi = Math.max(hi, p[2]);
  }
  return [lo, hi];
}

/** Volumen des Körpers unterhalb der Höhe z. */
export function volumeBelow(solid: Solid, z: number): number {
  const [lo, hi] = zRange(solid);
  if (z <= lo) return 0;
  if (z >= hi) return solidVolume(solid);
  return solidVolume(clipBelow(solid, z));
}

/** Höhe des Wasserspiegels, bei der `volume` Wasser im Körper steht (Bisektion). */
export function levelForVolume(solid: Solid, volume: number, iterations = 40): number {
  let [lo, hi] = zRange(solid);
  if (volume <= 0) return lo;
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (volumeBelow(solid, mid) < volume) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ------------------------------------------------------------------ */
/* Gefäße für den Umschüttversuch                                      */
/* ------------------------------------------------------------------ */

export interface Vessel {
  /** Eckpunkte in eigenen Koordinaten (tiefster Punkt bei x₃ = 0, Rand oben). */
  vertices: Vec3[];
  /** Flächen als Indexlisten, nach außen orientiert; die letzte Fläche ist die Öffnung. */
  faces: number[][];
  /** Flächen ohne die Öffnung (für die Glaswand). */
  walls: number[][];
  /** Indizes der Randpunkte. */
  rim: number[];
  /** Ausgusspunkt am Rand (in Kipprichtung). */
  lip: Vec3;
  /** Volumen des Vielflachs (zum Normieren der Wassermenge). */
  volume: number;
}

/** Körper aus Eckpunkten und Indexflächen. */
export function solidOf(vertices: readonly Vec3[], faces: readonly (readonly number[])[]): Solid {
  return faces.map((f) => f.map((i) => vertices[i]!));
}

function makeVessel(vertices: Vec3[], faces: number[][], rim: number[], lip: Vec3): Vessel {
  // Flächen nach außen drehen (Schwerpunkt der Ecken liegt im Inneren)
  const c: Vec3 = [0, 1, 2].map((k) => vertices.reduce((s, p) => s + p[k]!, 0) / vertices.length) as unknown as Vec3;
  const oriented = faces.map((f) => {
    const pts = f.map((i) => vertices[i]!);
    const fc: Vec3 = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k]!, 0) / pts.length) as unknown as Vec3;
    return dot(faceNormal(pts), sub(fc, c)) < 0 ? [...f].reverse() : f;
  });
  return { vertices, faces: oriented, walls: oriented.slice(0, -1), rim, lip, volume: solidVolume(solidOf(vertices, oriented)) };
}

/**
 * Umgedrehte Pyramide (Spitze unten bei (0 | 0 | 0), offene Grundfläche oben
 * in der Höhe h); mit vielen Ecken ein umgedrehter Kegel. Ausguss: Mitte der
 * Seite, die am weitesten in Kipprichtung `dir` liegt (+1: Richtung +x₂).
 */
export function invertedPyramidVessel(base: readonly Pt[], h: number, dir: 1 | -1): Vessel {
  const n = base.length;
  const vertices: Vec3[] = [[0, 0, 0], ...base.map(([x, y]) => [x, y, h] as Vec3)];
  const faces: number[][] = base.map((_, i) => [0, 1 + ((i + 1) % n), 1 + i]);
  const rim = base.map((_, i) => 1 + i);
  faces.push([...rim]);
  let lip: Vec3 = vertices[1]!;
  let best = -Infinity;
  base.forEach((p, i) => {
    const q = base[(i + 1) % n]!;
    const m: Vec3 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, h];
    if (m[1] * dir > best + 1e-9) {
      best = m[1] * dir;
      lip = m;
    }
  });
  return makeVessel(vertices, faces, rim, lip);
}

/** Halbkugelschale mit Radius r (tiefster Punkt bei (0 | 0 | 0), Rand oben in der Höhe r); Ausguss bei x₂ = dir · r. */
export function bowlVessel(r: number, dir: 1 | -1, segments = 36, rings = 9): Vessel {
  const vertices: Vec3[] = [];
  // Ring j = 0 ist der Rand (Äquator), j = rings − 1 der unterste Ring
  for (let j = 0; j < rings; j++) {
    const phi = (j / rings) * (Math.PI / 2);
    const rr = r * Math.cos(phi);
    const z = r - r * Math.sin(phi);
    for (let i = 0; i < segments; i++) {
      const t = (2 * Math.PI * i) / segments;
      vertices.push([rr * Math.cos(t), rr * Math.sin(t), z]);
    }
  }
  const bottom = vertices.length;
  vertices.push([0, 0, 0]);
  const at = (j: number, i: number) => j * segments + (i % segments);
  const faces: number[][] = [];
  for (let j = 0; j < rings - 1; j++) for (let i = 0; i < segments; i++) faces.push([at(j, i), at(j, i + 1), at(j + 1, i + 1), at(j + 1, i)]);
  for (let i = 0; i < segments; i++) faces.push([at(rings - 1, i), at(rings - 1, i + 1), bottom]);
  const rim = Array.from({ length: segments }, (_, i) => at(0, i));
  faces.push([...rim]);
  return makeVessel(vertices, faces, rim, [0, dir * r, r]);
}

/** Lage eines Gefäßes: Verschiebung und Kippwinkel um die waagerechte Achse (x₁-Richtung) durch den Ausguss. */
export interface VesselPose {
  /** Verschiebung der eigenen Koordinaten in die Welt (ungekippt). */
  offset: Vec3;
  /** Kippwinkel (Bogenmaß, ≥ 0). */
  tilt: number;
  /** Kipprichtung: +1 Öffnung nach +x₂, −1 nach −x₂. */
  dir: 1 | -1;
}

/** Punkt des Gefäßes (eigene Koordinaten) in Weltkoordinaten. */
export function posePoint(vessel: Vessel, pose: VesselPose, p: Vec3): Vec3 {
  const lip: Vec3 = [vessel.lip[0] + pose.offset[0], vessel.lip[1] + pose.offset[1], vessel.lip[2] + pose.offset[2]];
  const q: Vec3 = [p[0] + pose.offset[0] - lip[0], p[1] + pose.offset[1] - lip[1], p[2] + pose.offset[2] - lip[2]];
  // Drehung um die x₁-Achse durch den Ausguss; die Öffnung (oben) kippt in Richtung dir
  const phi = -pose.dir * pose.tilt;
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return [lip[0] + q[0], lip[1] + q[1] * c - q[2] * s, lip[2] + q[1] * s + q[2] * c];
}

/** Alle Eckpunkte in Weltkoordinaten. */
export function poseVertices(vessel: Vessel, pose: VesselPose): Vec3[] {
  return vessel.vertices.map((p) => posePoint(vessel, pose, p));
}

/** Wie viel Wasser hält das Gefäß in dieser Lage höchstens? (Teil unterhalb des tiefsten Randpunkts) */
export function capacityAt(vessel: Vessel, vertices: readonly Vec3[]): number {
  let rimZ = Infinity;
  for (const i of vessel.rim) rimZ = Math.min(rimZ, vertices[i]![2]);
  return volumeBelow(solidOf(vertices, vessel.faces), rimZ);
}

export function capacity(vessel: Vessel, pose: VesselPose): number {
  return capacityAt(vessel, poseVertices(vessel, pose));
}

/** Kleinster Kippwinkel, bei dem das Gefäß leer ist (Bisektion). */
export function emptyTilt(vessel: Vessel, dir: 1 | -1): number {
  const pose = (tilt: number): VesselPose => ({ offset: [0, 0, 0], tilt, dir });
  let lo = 0;
  let hi = Math.PI;
  const eps = vessel.volume * 1e-5;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (capacity(vessel, pose(mid)) > eps) lo = mid;
    else hi = mid;
  }
  return hi;
}
