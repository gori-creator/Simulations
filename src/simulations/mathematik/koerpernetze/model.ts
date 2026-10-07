import { foldNet, vec3, type NetFace3D, type Vec2, type Vec3 } from '../../../sim-core';

/**
 * Körpernetze: Würfel (alle 11 Würfelnetze und einige Fehlversuche), Quader,
 * dreiseitiges Prisma, quadratische Pyramide und Zylinder. Jedes Netz liegt in
 * der x₁x₂-Ebene; eine Fläche bleibt liegen, alle anderen klappen um ihre
 * Faltkante nach oben. Längen in cm.
 */

export type BodyId = 'wuerfel' | 'quader' | 'prisma' | 'pyramide' | 'zylinder';
export type FaceShape = 'square' | 'rect' | 'triangle' | 'circle' | 'strip';

export interface BodyFace extends NetFace3D {
  shape: FaceShape;
  /** Flächeninhalt in cm² (beim Zylindermantel: ganzer Mantel am mittleren Streifen, sonst 0). */
  area: number;
  /** Seitenlängen (Rechteck: Breite, Höhe; Dreieck: Grundseite, Höhe; Kreis: Radius). */
  dims: readonly number[];
  /** Farbgruppe: gegenüberliegende bzw. gleichartige Flächen. */
  group: number;
  /** Beschriftung mit dem Flächeninhalt an dieser Fläche zeigen. */
  label: boolean;
  /** Teil des Zylindermantels. */
  mantle?: boolean;
  /** Bemaßungen (Strecken im Netz) mit Text-Schlüssel. */
  marks?: Mark[];
}

/**
 * Bemaßung einer Strecke im Netz. `when`: nur im ebenen Netz (`flat`) bzw. nur
 * am gefalteten Körper (`folded`) zeigen; `dashed`: Höhe innerhalb der Fläche;
 * `inside`: Text innerhalb der Fläche statt außerhalb.
 */
export interface Mark {
  from: Vec2;
  to: Vec2;
  key: string;
  when?: 'flat' | 'folded';
  dashed?: boolean;
  inside?: boolean;
}

export interface BodyNet {
  body: BodyId;
  faces: BodyFace[];
  /** Mittelpunkt und Radius (umschließende Kugel) des gefalteten Körpers. */
  solidCenter: Vec3;
  solidRadius: number;
  /** Oberflächeninhalt in cm². */
  surface: number;
}

/* ------------------------------------------------------------------ */
/* Würfelnetze                                                         */
/* ------------------------------------------------------------------ */

/** Zelle eines Würfelnetzes: [Spalte, Zeile]. */
export type Cell = readonly [number, number];

/**
 * 15 Netze aus je sechs Quadraten, gemischt: die 11 Würfelnetze und 4 Netze,
 * die sich nicht zu einem Würfel falten lassen.
 */
export const CUBE_NETS: readonly (readonly Cell[])[] = [
  // 1: Kreuz (1-4-1)
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
  // 2: 1-4-1
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]],
  // 3: falsch – beide Deckel auf derselben Seite
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 0]],
  // 4: 1-4-1
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
  // 5: 1-4-1
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  // 6: 1-4-1
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
  // 7: falsch – fünf in einer Reihe
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [2, 0]],
  // 8: 1-4-1
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  // 9: 2-3-1
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]],
  // 10: falsch – Block aus vier Quadraten
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  // 11: 2-3-1
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  // 12: 2-3-1
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
  // 13: falsch – Treppe mit drei Stufen nach einer Seite
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2]],
  // 14: 2-2-2 (Treppe)
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
  // 15: 3-3
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
];

const neighbours = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

/**
 * Baut aus Zellen ein faltbares Netz mit Kantenlänge a. Liegen bleibt die
 * Zelle nahe der Mitte (mit den meisten Nachbarn); die übrigen hängen über
 * einen Breitensuch-Baum an ihr. Spalten laufen entlang x₂, Zeilen entlang x₁.
 */
export function cubeNet(cells: readonly Cell[], a: number): BodyFace[] {
  const n = cells.length;
  const cx = cells.reduce((s, c) => s + c[0], 0) / n;
  const cy = cells.reduce((s, c) => s + c[1], 0) / n;
  const degree = (i: number) => cells.filter((c) => neighbours(c, cells[i]!)).length;
  let root = 0;
  let best = Infinity;
  cells.forEach((c, i) => {
    const score = Math.hypot(c[0] + 0.5 - cx - 0.5, c[1] + 0.5 - cy - 0.5) - degree(i) * 0.3;
    if (score < best - 1e-9) {
      best = score;
      root = i;
    }
  });
  const parent = new Array<number>(n).fill(-2);
  parent[root] = -1;
  const queue = [root];
  while (queue.length) {
    const i = queue.shift()!;
    cells.forEach((c, j) => {
      if (parent[j] === -2 && neighbours(c, cells[i]!)) {
        parent[j] = i;
        queue.push(j);
      }
    });
  }
  // Netz so verschieben, dass die liegen bleibende Fläche um den Ursprung liegt
  const [rc, rr] = cells[root]!;
  const pt = (col: number, row: number): Vec2 => [(row - rr - 0.5) * a, (col - rc - 0.5) * a];
  // Bemaßung an einer Randkante des Netzes, möglichst vorn (große Zeile) und rechts
  const has = (col: number, row: number) => cells.some((c) => c[0] === col && c[1] === row);
  let markCell = 0;
  cells.forEach(([col, row], i) => {
    const [bc, br] = cells[markCell]!;
    if (!has(col, row + 1) && (has(bc, br + 1) || row > br || (row === br && col > bc))) markCell = i;
  });
  return cells.map(([col, row], i) => {
    const p = parent[i]!;
    let hinge: [Vec2, Vec2] | undefined;
    if (p >= 0) {
      const [pc, pr] = cells[p]!;
      hinge = pc === col ? [pt(col, Math.max(row, pr)), pt(col + 1, Math.max(row, pr))] : [pt(Math.max(col, pc), row), pt(Math.max(col, pc), row + 1)];
    }
    return {
      points: [pt(col, row), pt(col + 1, row), pt(col + 1, row + 1), pt(col, row + 1)],
      parent: p,
      hinge,
      shape: 'square',
      area: a * a,
      dims: [a, a],
      group: 0,
      label: true,
      marks: [
        ...(i === markCell ? [{ from: pt(col, row + 1), to: pt(col + 1, row + 1), key: 'a', when: 'flat' as const }] : []),
        ...(i === root ? [{ from: pt(col, row + 1), to: pt(col + 1, row + 1), key: 'a', when: 'folded' as const }] : []),
      ],
    };
  });
}

export interface CubeCheck {
  /** Lässt sich das Netz zu einem Würfel falten? */
  valid: boolean;
  /** Flächen, die im gefalteten Zustand aufeinanderliegen. */
  overlaps: [number, number][];
  /** Mittelpunkte der Würfelflächen, die offen bleiben. */
  missing: Vec3[];
  /** Augenzahl je Fläche (gegenüberliegende Flächen ergeben 7). */
  pips: number[];
  /** Farbgruppe je Fläche (0: oben/unten, 1: vorn/hinten, 2: links/rechts). */
  groups: number[];
}

/** Faltet ein Würfelnetz vollständig und prüft, ob jede Würfelfläche genau einmal bedeckt ist. */
export function checkCubeNet(faces: readonly BodyFace[], a: number): CubeCheck {
  const folded = foldNet(faces, 1);
  const centers = folded.map((pts) => vec3.centroid(pts));
  const key = (p: Vec3) => p.map((v) => Math.round((v / a) * 1000)).join(',');
  const overlaps: [number, number][] = [];
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) if (key(centers[i]!) === key(centers[j]!)) overlaps.push([i, j]);
  }
  const h = a / 2;
  const slots: Vec3[] = [
    [0, 0, 0],
    [0, 0, a],
    [h, 0, h],
    [-h, 0, h],
    [0, h, h],
    [0, -h, h],
  ];
  const taken = new Set(centers.map(key));
  const missing = slots.filter((s) => !taken.has(key(s)));
  const pips: number[] = [];
  const groups: number[] = [];
  for (const c of centers) {
    const d: Vec3 = [c[0], c[1], c[2] - h];
    const axis = [Math.abs(d[0]), Math.abs(d[1]), Math.abs(d[2])].indexOf(Math.max(Math.abs(d[0]), Math.abs(d[1]), Math.abs(d[2])));
    const positive = d[axis]! > 0;
    if (axis === 2) {
      pips.push(positive ? 1 : 6);
      groups.push(0);
    } else if (axis === 0) {
      pips.push(positive ? 2 : 5);
      groups.push(1);
    } else {
      pips.push(positive ? 3 : 4);
      groups.push(2);
    }
  }
  return { valid: overlaps.length === 0 && missing.length === 0, overlaps, missing, pips, groups };
}

/* ------------------------------------------------------------------ */
/* Netze der übrigen Körper                                            */
/* ------------------------------------------------------------------ */

const rect = (x1a: number, x1b: number, x2a: number, x2b: number): Vec2[] => [
  [x1a, x2a],
  [x1b, x2a],
  [x1b, x2b],
  [x1a, x2b],
];

/** Quader mit Länge a (entlang x₂), Breite b (entlang x₁) und Höhe c. Liegen bleibt die Grundfläche. */
export function cuboidNet(a: number, b: number, c: number): BodyFace[] {
  const A = a / 2;
  const B = b / 2;
  const face = (points: Vec2[], parent: number, hinge: [Vec2, Vec2] | undefined, dims: [number, number], group: number): BodyFace => ({
    points,
    parent,
    hinge,
    shape: 'rect',
    area: dims[0] * dims[1],
    dims,
    group,
    label: true,
  });
  return [
    // 0: Grundfläche
    {
      ...face(rect(-B, B, -A, A), -1, undefined, [a, b], 0),
      marks: [
        { from: [B, -A], to: [B, A], key: 'a', when: 'folded' },
        { from: [-B, A], to: [B, A], key: 'b', when: 'folded' },
      ],
    },
    // 1: vorn, 2: hinten
    {
      ...face(rect(B, B + c, -A, A), 0, [[B, -A], [B, A]], [a, c], 1),
      marks: [
        { from: [B + c, -A], to: [B + c, A], key: 'a', when: 'flat' },
        { from: [B, -A], to: [B + c, -A], key: 'c' },
      ],
    },
    face(rect(-B - c, -B, -A, A), 0, [[-B, -A], [-B, A]], [a, c], 1),
    // 3: rechts, 4: links
    face(rect(-B, B, A, A + c), 0, [[-B, A], [B, A]], [b, c], 2),
    { ...face(rect(-B, B, -A - c, -A), 0, [[-B, -A], [B, -A]], [b, c], 2), marks: [{ from: [-B, -A - c], to: [B, -A - c], key: 'b', when: 'flat' }] },
    // 5: Deckfläche (an der rechten Seitenfläche)
    face(rect(-B, B, A + c, A + c + a), 3, [[-B, A + c], [B, A + c]], [a, b], 0),
  ];
}

/** Dreiseitiges Prisma mit gleichseitigem Dreieck (Seite a) und Höhe h; es liegt auf einer Seitenfläche. */
export function prismNet(a: number, h: number): BodyFace[] {
  const A = a / 2;
  const H = h / 2;
  const t = (a * Math.sqrt(3)) / 2;
  const tri = (area: number): Omit<BodyFace, 'points' | 'parent' | 'hinge'> => ({ shape: 'triangle', area, dims: [a, t], group: 0, label: true });
  const side = { shape: 'rect' as const, area: a * h, dims: [a, h], group: 1, label: true, angle: (2 * Math.PI) / 3 };
  const triArea = (a * t) / 2;
  return [
    {
      points: rect(-H, H, -A, A),
      parent: -1,
      ...side,
      angle: undefined,
      marks: [
        { from: [H, -A], to: [H, A], key: 'a', when: 'folded' },
        { from: [-H, A], to: [H, A], key: 'h', when: 'folded' },
      ],
    },
    { points: rect(-H, H, -3 * A, -A), parent: 0, hinge: [[-H, -A], [H, -A]], ...side, marks: [{ from: [H, -3 * A], to: [H, -A], key: 'a', when: 'flat' }] },
    { points: rect(-H, H, A, 3 * A), parent: 0, hinge: [[-H, A], [H, A]], ...side, marks: [{ from: [-H, 3 * A], to: [H, 3 * A], key: 'h', when: 'flat' }] },
    {
      points: [
        [H, -A],
        [H + t, 0],
        [H, A],
      ],
      parent: 0,
      hinge: [[H, -A], [H, A]],
      ...tri(triArea),
      marks: [{ from: [H, 0], to: [H + t, 0], key: 'ht', dashed: true }],
    },
    {
      points: [
        [-H, -A],
        [-H - t, 0],
        [-H, A],
      ],
      parent: 0,
      hinge: [[-H, -A], [-H, A]],
      ...tri(triArea),
    },
  ];
}

/** Winkel zwischen Grundfläche und Seitenfläche einer quadratischen Pyramide (Bogenmaß). */
export function pyramidBaseAngle(a: number, ha: number): number {
  return Math.acos(Math.min(1, a / 2 / Math.max(ha, 1e-9)));
}

/** Quadratische Pyramide mit Grundkante a und Höhe hₐ der Seitendreiecke (hₐ > a/2). */
export function pyramidNet(a: number, ha: number): BodyFace[] {
  const A = a / 2;
  const fold = Math.PI - pyramidBaseAngle(a, ha);
  const tri = (points: Vec2[], hinge: [Vec2, Vec2], marks?: BodyFace['marks']): BodyFace => ({
    points,
    parent: 0,
    hinge,
    angle: fold,
    shape: 'triangle',
    area: (a * ha) / 2,
    dims: [a, ha],
    group: 1,
    label: true,
    marks,
  });
  return [
    {
      points: rect(-A, A, -A, A),
      parent: -1,
      shape: 'square',
      area: a * a,
      dims: [a, a],
      group: 0,
      label: true,
      marks: [
        { from: [A, -A], to: [A, A], key: 'a', inside: true, when: 'flat' },
        { from: [A, -A], to: [A, A], key: 'a', when: 'folded' },
      ],
    },
    tri(
      [
        [A, -A],
        [A + ha, 0],
        [A, A],
      ],
      [
        [A, -A],
        [A, A],
      ],
      [{ from: [A, 0], to: [A + ha, 0], key: 'ha', dashed: true }],
    ),
    tri(
      [
        [-A, -A],
        [-A - ha, 0],
        [-A, A],
      ],
      [
        [-A, -A],
        [-A, A],
      ],
    ),
    tri(
      [
        [-A, A],
        [0, A + ha],
        [A, A],
      ],
      [
        [-A, A],
        [A, A],
      ],
    ),
    tri(
      [
        [-A, -A],
        [0, -A - ha],
        [A, -A],
      ],
      [
        [-A, -A],
        [A, -A],
      ],
    ),
  ];
}

/** Anzahl der Streifen, aus denen der Zylindermantel gefaltet wird (ungerade: ein Streifen liegt mittig). */
export const CYLINDER_STRIPS = 61;

/**
 * Zylinder mit Radius r und Höhe h. Der Mantel (Rechteck 2πr × h) besteht aus
 * schmalen Streifen, die sich nacheinander um je 360°/n biegen; die Kreise
 * werden als n-Ecke mit gleichem Umfang gezeichnet. Liegen bleibt der Grundkreis.
 */
export function cylinderNet(r: number, h: number, n = CYLINDER_STRIPS): BodyFace[] {
  const w = (2 * Math.PI * r) / n;
  const H = h / 2;
  const m = (n - 1) / 2;
  const apothem = w / (2 * Math.tan(Math.PI / n));
  const circumradius = w / (2 * Math.sin(Math.PI / n));
  const circle = (cx1: number, attachSign: number): Vec2[] =>
    Array.from({ length: n }, (_, i) => {
      // eine Seite liegt genau auf der Kante des mittleren Streifens
      const angle = (attachSign > 0 ? Math.PI : 0) + Math.PI / n + (i * 2 * Math.PI) / n;
      return [cx1 + circumradius * Math.cos(angle), circumradius * Math.sin(angle)] as Vec2;
    });
  const faces: BodyFace[] = [];
  // 0: Grundkreis (liegt), vor dem Mantel (Richtung +x₁)
  faces.push({ points: circle(H + apothem, 1), parent: -1, shape: 'circle', area: Math.PI * r * r, dims: [r], group: 0, label: true, marks: [{ from: [H + apothem, 0], to: [H + apothem, r], key: 'r' }] });
  // Mantelstreifen: Index 1 + i
  const x2 = (i: number) => (i - m - 0.5) * w;
  for (let i = 0; i < n; i++) {
    const parent = i === m ? 0 : i < m ? 1 + i + 1 : 1 + i - 1;
    const hinge: [Vec2, Vec2] =
      i === m
        ? [
            [H, x2(i)],
            [H, x2(i + 1)],
          ]
        : i < m
          ? [
              [-H, x2(i + 1)],
              [H, x2(i + 1)],
            ]
          : [
              [-H, x2(i)],
              [H, x2(i)],
            ];
    faces.push({
      points: rect(-H, H, x2(i), x2(i + 1)),
      parent,
      hinge,
      angle: i === m ? Math.PI / 2 : (2 * Math.PI) / n,
      shape: 'strip',
      area: i === m ? 2 * Math.PI * r * h : 0,
      dims: [2 * Math.PI * r, h],
      group: 1,
      label: i === m,
      mantle: true,
      marks: i === 0 ? [{ from: [-H, x2(0)], to: [H, x2(0)], key: 'h', when: 'flat' }] : undefined,
    });
  }
  // Deckkreis am mittleren Streifen (hinten)
  faces.push({
    points: circle(-H - apothem, -1),
    parent: 1 + m,
    hinge: [
      [-H, x2(m)],
      [-H, x2(m + 1)],
    ],
    shape: 'circle',
    area: Math.PI * r * r,
    dims: [r],
    group: 0,
    label: true,
  });
  return faces;
}

/* ------------------------------------------------------------------ */
/* Zusammenfassung                                                     */
/* ------------------------------------------------------------------ */

export interface BodyParams {
  net: number;
  a: number;
  b: number;
  c: number;
  h: number;
  ha: number;
  r: number;
}

/** Oberflächeninhalt des Körpers in cm². */
export function surfaceArea(body: BodyId, p: BodyParams): number {
  switch (body) {
    case 'wuerfel':
      return 6 * p.a * p.a;
    case 'quader':
      return 2 * (p.a * p.b + p.a * p.c + p.b * p.c);
    case 'prisma':
      return 2 * ((Math.sqrt(3) / 4) * p.a * p.a) + 3 * p.a * p.h;
    case 'pyramide':
      return p.a * p.a + 4 * ((p.a * p.ha) / 2);
    case 'zylinder':
      return 2 * Math.PI * p.r * p.r + 2 * Math.PI * p.r * p.h;
  }
}

/** Höhe einer quadratischen Pyramide aus Grundkante a und Höhe hₐ der Seitendreiecke (Pythagoras). */
export function pyramidHeight(a: number, ha: number): number {
  return Math.sqrt(Math.max(0, ha * ha - (a / 2) ** 2));
}

export function buildNet(body: BodyId, p: BodyParams): BodyNet {
  const surface = surfaceArea(body, p);
  switch (body) {
    case 'wuerfel': {
      const cells = CUBE_NETS[Math.min(CUBE_NETS.length, Math.max(1, Math.round(p.net))) - 1]!;
      return { body, faces: cubeNet(cells, p.a), solidCenter: [0, 0, p.a / 2], solidRadius: (p.a * Math.sqrt(3)) / 2, surface };
    }
    case 'quader':
      return { body, faces: cuboidNet(p.a, p.b, p.c), solidCenter: [0, 0, p.c / 2], solidRadius: Math.hypot(p.a, p.b, p.c) / 2, surface };
    case 'prisma': {
      const t = (p.a * Math.sqrt(3)) / 2;
      return { body, faces: prismNet(p.a, p.h), solidCenter: [0, 0, t / 2], solidRadius: Math.hypot(p.a, p.h, t) / 2, surface };
    }
    case 'pyramide': {
      const hp = pyramidHeight(p.a, p.ha);
      return { body, faces: pyramidNet(p.a, p.ha), solidCenter: [0, 0, hp / 2], solidRadius: Math.max(Math.hypot(p.a / Math.SQRT2, hp / 2), hp * 0.6), surface };
    }
    case 'zylinder': {
      const n = CYLINDER_STRIPS;
      const w = (2 * Math.PI * p.r) / n;
      const apothem = w / (2 * Math.tan(Math.PI / n));
      return { body, faces: cylinderNet(p.r, p.h), solidCenter: [p.h / 2 + apothem, 0, p.h / 2], solidRadius: Math.hypot(2 * p.r, p.h) / 2, surface };
    }
  }
}

/** Bildet einen Punkt des ebenen Netzes auf die gefaltete Lage einer Fläche ab (die Fläche bewegt sich starr). */
export function mapNetPoint(net: readonly Vec2[], folded: readonly Vec3[], q: Vec2): Vec3 {
  const p0 = net[0]!;
  const p1 = net[1]!;
  // dritter Punkt, der nicht auf der Geraden p0p1 liegt
  let k = 2;
  const cross = (i: number) => (p1[0] - p0[0]) * (net[i]![1] - p0[1]) - (p1[1] - p0[1]) * (net[i]![0] - p0[0]);
  while (k < net.length - 1 && Math.abs(cross(k)) < 1e-9) k++;
  const p2 = net[k]!;
  // q = p0 + α(p1 − p0) + β(p2 − p0)
  const ux = p1[0] - p0[0];
  const uy = p1[1] - p0[1];
  const vx = p2[0] - p0[0];
  const vy = p2[1] - p0[1];
  const det = ux * vy - uy * vx;
  const dx = q[0] - p0[0];
  const dy = q[1] - p0[1];
  const alpha = (dx * vy - dy * vx) / det;
  const beta = (ux * dy - uy * dx) / det;
  const f0 = folded[0]!;
  return vec3.add(f0, vec3.add(vec3.scale(vec3.sub(folded[1]!, f0), alpha), vec3.scale(vec3.sub(folded[k]!, f0), beta)));
}
