/**
 * Bauzeichnungen: Körper als Kantenmodell, senkrechte Parallelprojektion in
 * Grund-, Auf- und Seitenriss, schräge Parallelprojektion (Schrägbild) und
 * wahre Größen schräger Flächen und Kanten.
 */

export type V3 = [number, number, number];
export type P2 = [number, number];
export type BodyId = 'haus' | 'walm' | 'winkel';

export interface Body {
  vertices: V3[];
  edges: [number, number][];
}

/**
 * Haus mit Satteldach (Länge a in x-Richtung, Breite b in y-Richtung,
 * Wandhöhe h, Dachhöhe d), Walmdach-Haus oder Winkelbau (L-förmig, Flachdach).
 */
export function body(id: BodyId, a: number, b: number, h: number, d: number): Body {
  const box: V3[] = [
    [0, 0, 0],
    [a, 0, 0],
    [a, b, 0],
    [0, b, 0],
    [0, 0, h],
    [a, 0, h],
    [a, b, h],
    [0, b, h],
  ];
  const boxEdges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  if (id === 'haus') {
    const v: V3[] = [...box, [0, b / 2, h + d], [a, b / 2, h + d]];
    return { vertices: v, edges: [...boxEdges, [8, 9], [4, 8], [7, 8], [5, 9], [6, 9]] };
  }
  if (id === 'walm') {
    const inset = Math.min(b / 2, a / 2);
    const v: V3[] = [...box, [inset, b / 2, h + d], [a - inset, b / 2, h + d]];
    return { vertices: v, edges: [...boxEdges, [8, 9], [4, 8], [7, 8], [5, 9], [6, 9]] };
  }
  // Winkelbau: L-förmige Grundfläche, Flachdach
  const w = b / 2;
  const base: P2[] = [
    [0, 0],
    [a, 0],
    [a, w],
    [w, w],
    [w, b],
    [0, b],
  ];
  const v: V3[] = [...base.map(([x, y]) => [x, y, 0] as V3), ...base.map(([x, y]) => [x, y, h] as V3)];
  const e: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    e.push([i, (i + 1) % 6], [i + 6, ((i + 1) % 6) + 6], [i, i + 6]);
  }
  return { vertices: v, edges: e };
}

/** Grundriss (Blick von oben): (x, y). */
export const top = (p: V3): P2 => [p[0], p[1]];
/** Aufriss (Blick von vorn, gegen die y-Richtung): (x, z). */
export const front = (p: V3): P2 => [p[0], p[2]];
/** Seitenriss (Blick von links, gegen die x-Richtung): (y, z). */
export const side = (p: V3): P2 => [p[1], p[2]];

/** Schrägbild: Tiefen (y) unter dem Winkel α und mit dem Faktor k verkürzt. */
export function oblique(p: V3, alphaDeg: number, k: number): P2 {
  const al = (alphaDeg * Math.PI) / 180;
  return [p[0] + k * p[1] * Math.cos(al), p[2] + k * p[1] * Math.sin(al)];
}

const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Wahre Länge der Dachschräge (Traufe bis First) und wie lang sie in Grund- und Aufriss/Seitenriss erscheint. */
export function roofSlope(id: BodyId, a: number, b: number, h: number, d: number): { real: number; inTop: number; inSide: number; inFront: number } | null {
  if (id === 'winkel') return null;
  const B = body(id, a, b, h, d);
  const P = B.vertices[4]!; // Traufe vorn links
  const Q: V3 = [P[0] + (id === 'walm' ? Math.min(b / 2, a / 2) : 0), b / 2, h + d];
  // Fallinie der vorderen Dachfläche: senkrecht zur Traufe
  const R: V3 = [Q[0], 0, h];
  const real = dist(R, Q);
  return { real, inTop: b / 2, inSide: real, inFront: d };
}

/** Wahre Größe (Flächeninhalt) der vorderen Dachfläche und ihre scheinbare Größe im Grundriss. */
export function roofArea(id: BodyId, a: number, b: number, h: number, d: number): { real: number; inTop: number } | null {
  const s = roofSlope(id, a, b, h, d);
  if (!s) return null;
  if (id === 'haus') return { real: a * s.real, inTop: a * (b / 2) };
  const inset = Math.min(b / 2, a / 2);
  const ridge = a - 2 * inset;
  // Trapez: Traufe a, First ridge, Höhe = Fallinie
  return { real: ((a + ridge) / 2) * s.real, inTop: ((a + ridge) / 2) * (b / 2) };
}
