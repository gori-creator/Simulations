/**
 * Rechenlogik „Das Haus der Vierecke“ (Jahrgangsstufen 5–7).
 *
 * Die Ecken A, B, C, D liegen auf Gitterpunkten des Karopapiers (ganzzahlige
 * Koordinaten in Kästchen, 1 Kästchen = 0,5 cm). Damit lassen sich
 * „parallel“, „senkrecht“, „gleich lang“ und „achsensymmetrisch“ exakt mit
 * ganzen Zahlen entscheiden (Kreuz- und Skalarprodukt, Längenquadrate) –
 * ohne Rundungsfehler.
 *
 * Seiten wie im Unterricht: a = [AB], b = [BC], c = [CD], d = [DA];
 * Diagonalen e = [AC], f = [BD]; Innenwinkel α, β, γ, δ bei A, B, C, D.
 *
 * Definitionen (Ordnung nach Symmetrie, wie im bayerischen Unterricht):
 * - Trapez: (mindestens) ein Paar paralleler Gegenseiten.
 * - gleichschenkliges Trapez: achsensymmetrisch zu einer Achse durch die
 *   Mitten zweier Gegenseiten (also zur gemeinsamen Mittelsenkrechten).
 * - Drachenviereck: achsensymmetrisch zu einer Diagonalen (darf auch nicht
 *   konvex sein, „Pfeilform“).
 * - Parallelogramm: beide Paare von Gegenseiten parallel (punktsymmetrisch).
 * - Raute: vier gleich lange Seiten.
 * - Rechteck: vier rechte Winkel.
 * - Quadrat: Raute und Rechteck zugleich.
 */

export type Pt = readonly [number, number];
export type Quad = readonly [Pt, Pt, Pt, Pt];

/** Vierecksarten, vom Speziellen zum Allgemeinen geordnet. */
export type QuadClass = 'quadrat' | 'rechteck' | 'raute' | 'parallelogramm' | 'gltrapez' | 'drachen' | 'trapez' | 'viereck';
export const CLASSES: readonly QuadClass[] = ['quadrat', 'rechteck', 'raute', 'parallelogramm', 'gltrapez', 'drachen', 'trapez', 'viereck'];

/**
 * Haus der Vierecke: direkte Oberbegriffe. Ein Pfeil X → Y bedeutet
 * „X ist ein Spezialfall von Y“ (jedes X ist auch ein Y).
 */
export const PARENTS: Readonly<Record<QuadClass, readonly QuadClass[]>> = {
  quadrat: ['rechteck', 'raute'],
  rechteck: ['gltrapez', 'parallelogramm'],
  raute: ['parallelogramm', 'drachen'],
  parallelogramm: ['trapez'],
  gltrapez: ['trapez'],
  drachen: ['viereck'],
  trapez: ['viereck'],
  viereck: [],
};

/** Stockwerk im Haus (0 = Dachspitze). */
export const LEVEL: Readonly<Record<QuadClass, number>> = {
  quadrat: 0,
  rechteck: 1,
  raute: 1,
  gltrapez: 2,
  parallelogramm: 2,
  drachen: 2,
  trapez: 3,
  viereck: 4,
};

/** Größe des Karopapiers in Kästchen. */
export const GRID_W = 18;
export const GRID_H = 14;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
/** Kreuzprodukt (z-Komponente): 0 genau dann, wenn die Vektoren parallel sind. */
export const cross = (u: Pt, v: Pt): number => u[0] * v[1] - u[1] * v[0];
/** Skalarprodukt: 0 genau dann, wenn die Vektoren senkrecht sind. */
export const dot = (u: Pt, v: Pt): number => u[0] * v[0] + u[1] * v[1];
const len2 = (u: Pt): number => dot(u, u);
const same = (a: Pt, b: Pt): boolean => a[0] === b[0] && a[1] === b[1];

/* ------------------------------------------------------------------ */
/* Gültigkeit                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ist ABCD ein (einfaches) Viereck?
 * - `same`: zwei Ecken fallen zusammen,
 * - `collinear`: drei Ecken liegen auf einer Geraden (bei vier Ecken sind
 *   je drei immer „Nachbarn“ – das Viereck wäre ein Dreieck),
 * - `crossed`: zwei Gegenseiten schneiden sich (überschlagenes Viereck).
 */
export type Validity = 'ok' | 'same' | 'collinear' | 'crossed';

export function validity(q: Quad): Validity {
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (same(q[i]!, q[j]!)) return 'same';
  for (let i = 0; i < 4; i++) {
    const p = q[(i + 3) % 4]!;
    const c = q[i]!;
    const n = q[(i + 1) % 4]!;
    if (cross(sub(c, p), sub(n, c)) === 0) return 'collinear';
  }
  if (segmentsCross(q[0], q[1], q[2], q[3]) || segmentsCross(q[1], q[2], q[3], q[0])) return 'crossed';
  return 'ok';
}

/** Schneiden sich die Strecken [PQ] und [RS]? (keine drei Punkte kollinear) */
function segmentsCross(p: Pt, q: Pt, r: Pt, s: Pt): boolean {
  const d1 = cross(sub(s, r), sub(p, r));
  const d2 = cross(sub(s, r), sub(q, r));
  const d3 = cross(sub(q, p), sub(r, p));
  const d4 = cross(sub(q, p), sub(s, p));
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/** Doppelter orientierter Flächeninhalt (positiv: Ecken gegen den Uhrzeigersinn). */
export function area2(q: Quad): number {
  let s = 0;
  for (let i = 0; i < 4; i++) s += cross(q[i]!, q[(i + 1) % 4]!);
  return s;
}

/** Konvex: Alle Ecken „knicken“ in dieselbe Richtung. */
export function isConvex(q: Quad): boolean {
  let pos = 0;
  let neg = 0;
  for (let i = 0; i < 4; i++) {
    const e1 = sub(q[(i + 1) % 4]!, q[i]!);
    const e2 = sub(q[(i + 2) % 4]!, q[(i + 1) % 4]!);
    const c = cross(e1, e2);
    if (c > 0) pos++;
    else if (c < 0) neg++;
  }
  return pos === 0 || neg === 0;
}

/** Innenwinkel α, β, γ, δ in Grad (bei nicht konvexen Vierecken ist einer größer als 180°). */
export function interiorAngles(q: Quad): [number, number, number, number] {
  const orient = area2(q) >= 0 ? 1 : -1;
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    const c = q[i]!;
    const toPrev = sub(q[(i + 3) % 4]!, c);
    const toNext = sub(q[(i + 1) % 4]!, c);
    // Gegen den Uhrzeigersinn umlaufen: Innenwinkel von „zur nächsten“ zu „zur vorigen“ Ecke
    let a = Math.atan2(cross(toNext, toPrev) * orient, dot(toNext, toPrev));
    if (a < 0) a += 2 * Math.PI;
    out.push((a * 180) / Math.PI);
  }
  return out as [number, number, number, number];
}

/* ------------------------------------------------------------------ */
/* Eigenschaften und Einordnung                                        */
/* ------------------------------------------------------------------ */

/**
 * Symmetrieachse: `e`/`f` = Diagonale AC bzw. BD, `ac` = gemeinsame
 * Mittelsenkrechte von a und c, `bd` = von b und d. `p`, `q` sind zwei
 * Punkte auf der Achse.
 */
export interface Axis {
  kind: 'e' | 'f' | 'ac' | 'bd';
  p: Pt;
  q: Pt;
}

export interface Analysis {
  valid: Validity;
  convex: boolean;
  /** Seitenlängen a, b, c, d in Kästchen. */
  sides: [number, number, number, number];
  /** Längenquadrate (ganzzahlig, für exakte Vergleiche). */
  sides2: [number, number, number, number];
  angles: [number, number, number, number];
  /** a ∥ c bzw. b ∥ d. */
  parAC: boolean;
  parBD: boolean;
  /** Rechter Winkel bei A, B, C, D. */
  right: [boolean, boolean, boolean, boolean];
  /** Gruppen gleich langer Seiten (nur Gruppen mit mindestens zwei Seiten; 0 = a … 3 = d). */
  sideGroups: number[][];
  /** Größte Anzahl gleich langer Seiten (1 … 4). */
  maxEqual: number;
  /** Diagonalen: halbieren sich, stehen senkrecht, sind gleich lang. */
  diagBisect: boolean;
  diagPerp: boolean;
  diagEqual: boolean;
  /** Längen der Diagonalen e und f. */
  diag: [number, number];
  /** Schnittpunkt der Diagonalen (nur wenn sich die Strecken schneiden). */
  diagCross: Pt | null;
  axes: Axis[];
  /** Symmetriezentrum (bei Punktsymmetrie). */
  center: Pt | null;
  /** Alle zutreffenden Vierecksarten (vom Speziellen zum Allgemeinen). */
  classes: QuadClass[];
  /** Die speziellste zutreffende Art. */
  best: QuadClass;
}

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export function analyze(q: Quad): Analysis {
  const [A, B, C, D] = q;
  const ab = sub(B, A);
  const bc = sub(C, B);
  const cd = sub(D, C);
  const da = sub(A, D);
  const sides2: [number, number, number, number] = [len2(ab), len2(bc), len2(cd), len2(da)];
  const sides = sides2.map(Math.sqrt) as [number, number, number, number];
  const parAC = cross(ab, cd) === 0;
  const parBD = cross(bc, da) === 0;
  const right: [boolean, boolean, boolean, boolean] = [dot(da, ab) === 0, dot(ab, bc) === 0, dot(bc, cd) === 0, dot(cd, da) === 0];

  // Gruppen gleich langer Seiten
  const used = [false, false, false, false];
  const sideGroups: number[][] = [];
  let maxEqual = 1;
  for (let i = 0; i < 4; i++) {
    if (used[i]) continue;
    const grp = [i];
    for (let j = i + 1; j < 4; j++) if (!used[j] && sides2[j] === sides2[i]) grp.push(j);
    grp.forEach((k) => (used[k] = true));
    maxEqual = Math.max(maxEqual, grp.length);
    if (grp.length > 1) sideGroups.push(grp);
  }

  // Diagonalen
  const e = sub(C, A);
  const f = sub(D, B);
  const diagBisect = same(add(A, C), add(B, D));
  const diagPerp = dot(e, f) === 0;
  const diagEqual = len2(e) === len2(f);
  let diagCross: Pt | null = null;
  const den = cross(e, f);
  if (den !== 0) {
    const t = cross(sub(B, A), f) / den;
    const s = cross(sub(B, A), e) / den;
    if (t >= 0 && t <= 1 && s >= 0 && s <= 1) diagCross = [A[0] + t * e[0], A[1] + t * e[1]];
  }

  // Symmetrieachsen
  const axes: Axis[] = [];
  // Diagonale AC: B und D spiegelbildlich ⇔ |AB| = |AD| und |CB| = |CD|
  if (sides2[0] === sides2[3] && sides2[1] === sides2[2]) axes.push({ kind: 'e', p: A, q: C });
  if (sides2[0] === sides2[1] && sides2[3] === sides2[2]) axes.push({ kind: 'f', p: B, q: D });
  // Mittelsenkrechte von a: vertauscht A↔B und D↔C ⇔ c ∥ a und Mitte von c auf der Mittelsenkrechten von a
  if (parAC && dot(sub(add(A, B), add(C, D)), ab) === 0) axes.push({ kind: 'ac', p: mid(A, B), q: mid(C, D) });
  if (parBD && dot(sub(add(B, C), add(D, A)), bc) === 0) axes.push({ kind: 'bd', p: mid(B, C), q: mid(D, A) });
  const center = diagBisect ? mid(A, C) : null;

  const has = (k: Axis['kind']) => axes.some((x) => x.kind === k);
  const trapez = parAC || parBD;
  const parallelogramm = parAC && parBD;
  const gltrapez = has('ac') || has('bd');
  const drachen = has('e') || has('f');
  const raute = maxEqual === 4;
  const rechteck = right.every(Boolean);
  const quadrat = raute && rechteck;
  const flags: Record<QuadClass, boolean> = { quadrat, rechteck, raute, parallelogramm, gltrapez, drachen, trapez, viereck: true };
  const classes = CLASSES.filter((k) => flags[k]);

  return {
    valid: validity(q),
    convex: isConvex(q),
    sides,
    sides2,
    angles: interiorAngles(q),
    parAC,
    parBD,
    right,
    sideGroups,
    maxEqual,
    diagBisect,
    diagPerp,
    diagEqual,
    diag: [Math.sqrt(len2(e)), Math.sqrt(len2(f))],
    diagCross,
    axes,
    center,
    classes,
    best: classes[0]!,
  };
}

/* ------------------------------------------------------------------ */
/* Aufgaben: Was fehlt noch zur gewünschten Vierecksart?               */
/* ------------------------------------------------------------------ */

export type ReqId = 'onePar' | 'parAC' | 'parBD' | 'midAxis' | 'diagAxis' | 'sides4' | 'right4';

export interface Req {
  id: ReqId;
  ok: boolean;
  /** Fortschritt (z. B. 2 von 4 gleich langen Seiten). */
  have?: number;
  need?: number;
}

/** Bedingungen der Definition, jeweils mit „erfüllt?“. */
export function requirements(goal: QuadClass, a: Analysis): Req[] {
  const rights = a.right.filter(Boolean).length;
  const onePar: Req = { id: 'onePar', ok: a.parAC || a.parBD };
  const sides4: Req = { id: 'sides4', ok: a.maxEqual === 4, have: a.maxEqual, need: 4 };
  const right4: Req = { id: 'right4', ok: rights === 4, have: rights, need: 4 };
  switch (goal) {
    case 'trapez':
      return [onePar];
    case 'gltrapez':
      return [onePar, { id: 'midAxis', ok: a.axes.some((x) => x.kind === 'ac' || x.kind === 'bd') }];
    case 'drachen':
      return [{ id: 'diagAxis', ok: a.axes.some((x) => x.kind === 'e' || x.kind === 'f') }];
    case 'parallelogramm':
      return [
        { id: 'parAC', ok: a.parAC },
        { id: 'parBD', ok: a.parBD },
      ];
    case 'raute':
      return [sides4];
    case 'rechteck':
      return [right4];
    case 'quadrat':
      return [sides4, right4];
    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* Beispiele und Zufallsvierecke                                       */
/* ------------------------------------------------------------------ */

/** Ein schönes Beispiel je Vierecksart (gegen den Uhrzeigersinn beschriftet). */
export const EXAMPLES: Readonly<Record<QuadClass, Quad>> = {
  viereck: [
    [3, 3],
    [13, 2],
    [15, 10],
    [6, 12],
  ],
  trapez: [
    [2, 3],
    [15, 3],
    [13, 10],
    [5, 10],
  ],
  gltrapez: [
    [2, 3],
    [16, 3],
    [12, 10],
    [6, 10],
  ],
  drachen: [
    [9, 1],
    [14, 8],
    [9, 13],
    [4, 8],
  ],
  parallelogramm: [
    [2, 3],
    [12, 3],
    [16, 10],
    [6, 10],
  ],
  raute: [
    [9, 1],
    [13, 7],
    [9, 13],
    [5, 7],
  ],
  rechteck: [
    [4, 1],
    [14, 6],
    [11, 12],
    [1, 7],
  ],
  quadrat: [
    [6, 1],
    [13, 4],
    [10, 11],
    [3, 8],
  ],
};

const randInt = (rand: () => number, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = <T>(rand: () => number, list: readonly T[]): T => list[Math.floor(rand() * list.length)]!;

/** Ganzzahlige Richtungen (Kästchenschritte) für schräge und gerade Lagen. */
const DIRS: readonly Pt[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
  [2, 1],
  [1, 2],
  [2, -1],
  [1, -2],
  [3, 1],
  [1, 3],
  [3, -1],
  [1, -3],
];

/** Verschiebt das Viereck so, dass es im Karopapier liegt (mit Rand); null, wenn es zu groß ist. */
function placeInGrid(q: Quad, rand: () => number, margin = 1): Quad | null {
  const xs = q.map((p) => p[0]);
  const ys = q.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  if (w > GRID_W - 2 * margin || h > GRID_H - 2 * margin) return null;
  const ox = randInt(rand, margin, GRID_W - margin - w) - Math.min(...xs);
  const oy = randInt(rand, margin, GRID_H - margin - h) - Math.min(...ys);
  return q.map((p) => [p[0] + ox, p[1] + oy] as Pt) as unknown as Quad;
}

/** Ecken so umordnen, dass sie gegen den Uhrzeigersinn laufen (A bleibt A). */
function ccw(q: Quad): Quad {
  return area2(q) >= 0 ? q : [q[0], q[3], q[2], q[1]];
}

/** Zufällige Startlage für A: Die Beschriftung beginnt an einer beliebigen Ecke. */
function rotateLabels(q: Quad, rand: () => number): Quad {
  const k = randInt(rand, 0, 3);
  return [q[k % 4]!, q[(k + 1) % 4]!, q[(k + 2) % 4]!, q[(k + 3) % 4]!];
}

/** Rohform einer Vierecksart (ohne Lage im Gitter). */
function rawShape(kind: QuadClass, rand: () => number): Quad {
  const O: Pt = [0, 0];
  const w = pick(rand, DIRS);
  const n: Pt = [-w[1], w[0]];
  const at = (s: number, t: number): Pt => [O[0] + s * w[0] + t * n[0], O[1] + s * w[1] + t * n[1]];
  switch (kind) {
    case 'quadrat': {
      const u: Pt = [randInt(rand, 2, 7), randInt(rand, 0, 4)];
      const v: Pt = [-u[1], u[0]];
      return [O, u, add(u, v), v];
    }
    case 'rechteck': {
      // Senkrechte Richtung zu u mit ganzzahligen, möglichst kleinen Schritten, dann vervielfacht
      const u: Pt = [randInt(rand, 2, 8), randInt(rand, 0, 3)];
      const g = gcd(u[0], u[1]);
      const base: Pt = [-u[1] / g, u[0] / g];
      const m = randInt(rand, 1, Math.max(1, Math.floor(7 / Math.hypot(base[0], base[1]))));
      const v: Pt = [base[0] * m, base[1] * m];
      return [O, u, add(u, v), v];
    }
    case 'raute': {
      const [u, v] = equalPair(rand);
      return [O, u, add(u, v), v];
    }
    case 'parallelogramm': {
      const u: Pt = [randInt(rand, 3, 8), randInt(rand, -2, 2)];
      const v: Pt = [randInt(rand, -4, 4), randInt(rand, 3, 7)];
      return [O, u, add(u, v), v];
    }
    case 'drachen': {
      // Achse in Richtung w; B, D spiegelbildlich, C weiter außen auf der Achse
      const s = randInt(rand, 1, 4);
      const t = randInt(rand, 2, 4);
      const r = randInt(rand, s + 2, s + 7);
      return [at(0, 0), at(s, -t), at(r, 0), at(s, t)];
    }
    case 'gltrapez': {
      const p = randInt(rand, 3, 6);
      const qq = randInt(rand, 1, p - 1);
      const h = randInt(rand, 2, 5);
      return [at(-p, 0), at(p, 0), at(qq, h), at(-qq, h)];
    }
    case 'trapez': {
      const p = randInt(rand, 5, 10);
      const s = randInt(rand, -2, 4);
      const qq = randInt(rand, 2, 7);
      const h = randInt(rand, 2, 5);
      return [at(0, 0), at(p, 0), at(s + qq, h), at(s, h)];
    }
    default:
      return [
        [randInt(rand, 0, 2), randInt(rand, 0, 2)],
        [randInt(rand, 8, 12), randInt(rand, -2, 2)],
        [randInt(rand, 9, 14), randInt(rand, 6, 10)],
        [randInt(rand, -2, 3), randInt(rand, 6, 11)],
      ];
  }
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Zwei gleich lange, weder parallele noch senkrechte Gittervektoren (für Rauten). */
function equalPair(rand: () => number): [Pt, Pt] {
  const byLen = new Map<number, Pt[]>();
  for (let x = -7; x <= 7; x++) {
    for (let y = 0; y <= 7; y++) {
      const l = x * x + y * y;
      if (l < 13 || l > 65 || (y === 0 && x < 0)) continue;
      if (!byLen.has(l)) byLen.set(l, []);
      byLen.get(l)!.push([x, y]);
    }
  }
  const pairs: [Pt, Pt][] = [];
  for (const list of byLen.values()) {
    for (const u of list) {
      for (const v of list) {
        if (cross(u, v) <= 0 || dot(u, v) === 0) continue;
        const ang = Math.acos(dot(u, v) / len2(u));
        if (ang < 0.6 || ang > 2.55) continue;
        pairs.push([u, v]);
      }
    }
  }
  return pick(rand, pairs);
}

/**
 * Zufälliges Viereck genau dieser Art (speziellste Art = `kind`), im
 * Karopapier, gegen den Uhrzeigersinn beschriftet.
 */
export function randomOf(kind: QuadClass, rand: () => number): Quad {
  for (let tries = 0; tries < 400; tries++) {
    const raw = ccw(rotateLabels(rawShape(kind, rand), rand));
    const q = placeInGrid(raw, rand);
    if (!q || validity(q) !== 'ok') continue;
    const a = analyze(q);
    if (a.best !== kind || !a.convex) continue;
    // gut erkennbar: keine zu kurzen Seiten, keine zu spitzen oder fast gestreckten Winkel
    if (Math.min(...a.sides) < 2.5 || Math.min(...a.angles) < 28 || Math.max(...a.angles) > 155) continue;
    // Allgemeines Viereck: ganz ohne besondere Eigenschaften (kein rechter Winkel, keine gleich langen Seiten)
    if (kind === 'viereck' && (a.right.some(Boolean) || a.maxEqual > 1)) continue;
    return q;
  }
  return EXAMPLES[kind];
}

/** Gibt es diese Vierecke in derselben Lage? */
export function sameQuad(p: Quad, q: Quad): boolean {
  return p.every((pt, i) => same(pt, q[i]!));
}
