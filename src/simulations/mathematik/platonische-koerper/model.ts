/**
 * Platonische Körper (und zum Vergleich Prisma und Pyramide): Ecken, Flächen,
 * Kanten, Eulerscher Polyedersatz e − k + f = 2 und duale Körper.
 */

export type V3 = [number, number, number];
export interface Poly {
  vertices: V3[];
  faces: number[][];
}

export type SolidId = 'tetra' | 'hexa' | 'okta' | 'dodeka' | 'ikosa' | 'prisma' | 'pyramide';
export const PLATONIC: SolidId[] = ['tetra', 'hexa', 'okta', 'dodeka', 'ikosa'];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.sqrt(dot(a, a));
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];

export function centroid(pts: V3[]): V3 {
  const s: V3 = [0, 0, 0];
  for (const p of pts) {
    s[0] += p[0];
    s[1] += p[1];
    s[2] += p[2];
  }
  return scale(s, 1 / pts.length);
}

/** Ecken einer Fläche um ihren Mittelpunkt ordnen, so dass die Normale nach außen zeigt (Körper um den Ursprung, konvex). */
function orderFace(vertices: V3[], idx: number[]): number[] {
  const pts = idx.map((i) => vertices[i]!);
  const c = centroid(pts);
  const n = c;
  const u0 = sub(pts[0]!, c);
  const u = scale(u0, 1 / len(u0));
  const w = cross(n, u);
  const wl = len(w) || 1;
  const v = scale(w, 1 / wl);
  const ang = (p: V3) => Math.atan2(dot(sub(p, c), v), dot(sub(p, c), u));
  return [...idx].sort((a, b) => ang(vertices[a]!) - ang(vertices[b]!));
}

/** Alle Flächen aus Eckenmengen bestimmen: Ecken, die in einer Stützebene des konvexen Körpers liegen. */
function hullFaces(vertices: V3[]): number[][] {
  const n = vertices.length;
  const seen = new Set<string>();
  const faces: number[][] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const a = vertices[i]!;
        let nrm = cross(sub(vertices[j]!, a), sub(vertices[k]!, a));
        const l = len(nrm);
        if (l < 1e-9) continue;
        nrm = scale(nrm, 1 / l);
        let pos = 0;
        let neg = 0;
        const on: number[] = [];
        for (let m = 0; m < n; m++) {
          const d = dot(sub(vertices[m]!, a), nrm);
          if (Math.abs(d) < 1e-6) on.push(m);
          else if (d > 0) pos++;
          else neg++;
        }
        if (pos > 0 && neg > 0) continue;
        const key = on.join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        faces.push(orderFace(vertices, on));
      }
  return faces;
}

function normalize(vertices: V3[]): V3[] {
  const r = Math.max(...vertices.map(len));
  return vertices.map((p) => scale(p, 1 / r));
}

const PHI = (1 + Math.sqrt(5)) / 2;

function rawVertices(id: SolidId, n: number): V3[] {
  switch (id) {
    case 'tetra':
      return [
        [1, 1, 1],
        [1, -1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
      ];
    case 'hexa': {
      const v: V3[] = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
      return v;
    }
    case 'okta':
      return [
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
        [0, 0, 1],
        [0, 0, -1],
      ];
    case 'ikosa': {
      const v: V3[] = [];
      for (const a of [-1, 1])
        for (const b of [-PHI, PHI]) {
          v.push([0, a, b]);
          v.push([a, b, 0]);
          v.push([b, 0, a]);
        }
      return v;
    }
    case 'dodeka': {
      const v: V3[] = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
      const ip = 1 / PHI;
      for (const a of [-ip, ip])
        for (const b of [-PHI, PHI]) {
          v.push([0, a, b]);
          v.push([a, b, 0]);
          v.push([b, 0, a]);
        }
      return v;
    }
    case 'prisma': {
      const v: V3[] = [];
      for (let i = 0; i < n; i++) {
        const t = (2 * Math.PI * i) / n;
        v.push([Math.cos(t), Math.sin(t), -0.7]);
        v.push([Math.cos(t), Math.sin(t), 0.7]);
      }
      return v;
    }
    case 'pyramide': {
      const v: V3[] = [[0, 0, 1]];
      for (let i = 0; i < n; i++) {
        const t = (2 * Math.PI * i) / n;
        v.push([Math.cos(t), Math.sin(t), -0.6]);
      }
      return v;
    }
  }
}

/** Körper mit Umkugelradius 1 um den Ursprung (n = Eckenzahl der Grundfläche bei Prisma und Pyramide). */
export function solid(id: SolidId, n = 5): Poly {
  const vertices = normalize(rawVertices(id, n));
  return { vertices, faces: hullFaces(vertices) };
}

export function edgeCount(p: Poly): number {
  return p.faces.reduce((s, f) => s + f.length, 0) / 2;
}

export interface Counts {
  e: number;
  k: number;
  f: number;
  /** Eckenzahl der Flächen (alle gleich?) */
  faceSides: number[];
  /** Anzahl Flächen an jeder Ecke */
  vertexDegrees: number[];
}

export function counts(p: Poly): Counts {
  const deg = p.vertices.map(() => 0);
  for (const f of p.faces) for (const i of f) deg[i]!++;
  return { e: p.vertices.length, k: edgeCount(p), f: p.faces.length, faceSides: [...new Set(p.faces.map((f) => f.length))].sort(), vertexDegrees: [...new Set(deg)].sort() };
}

/** Dualer Körper: Flächenmittelpunkte werden Ecken. */
export function dual(p: Poly): Poly {
  const vertices = p.faces.map((f) => centroid(f.map((i) => p.vertices[i]!)));
  return { vertices, faces: hullFaces(vertices) };
}

export const DUAL_OF: Partial<Record<SolidId, SolidId>> = { tetra: 'tetra', hexa: 'okta', okta: 'hexa', dodeka: 'ikosa', ikosa: 'dodeka' };
