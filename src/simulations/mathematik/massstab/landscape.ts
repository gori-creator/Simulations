/**
 * Die erfundene Landschaft der Karte (keine echten Orte): ein Dorf mit
 * Kirche, Schule, Rathaus, Sportplatz und Bahnhof, ein Bach, ein See mit
 * Badestelle, Wälder, Hügel mit Höhenlinien, ein Aussichtsturm, eine
 * Burgruine, eine Mühle, ein Bauernhof und ein Nachbarort.
 *
 * Alle Koordinaten in Metern; x nach Osten, y nach Süden (Norden ist oben).
 * Die Orte sind so gesetzt, dass sich runde Prüfstrecken ergeben, z. B.
 * Kirche → Bahnhof 1 000 m, Kirche → Aussichtsturm 3 000 m.
 */
import { closestOnSegment, type Pt, type RoadGraph } from './model';

export const WORLD = { w: 18000, h: 15000 } as const;

type P = [number, number];
const pt = ([x, y]: P): Pt => ({ x, y });

/* ------------------------------------------------------------------ */
/* Orte                                                                */
/* ------------------------------------------------------------------ */

export type PoiKind = 'church' | 'school' | 'hall' | 'sport' | 'station' | 'beach' | 'tower' | 'mill' | 'farm' | 'castle' | 'village';

export interface Poi extends Pt {
  id: string;
  kind: PoiKind;
  name: { de: string; en: string };
  /** bis zu dieser Maßstabszahl wird der Ort gezeigt */
  maxN: number;
}

export const POIS: readonly Poi[] = [
  { id: 'church', kind: 'church', x: 8000, y: 7000, name: { de: 'Kirche', en: 'Church' }, maxN: 50000 },
  { id: 'school', kind: 'school', x: 8240, y: 6680, name: { de: 'Schule', en: 'School' }, maxN: 25000 },
  { id: 'hall', kind: 'hall', x: 7760, y: 6820, name: { de: 'Rathaus', en: 'Town hall' }, maxN: 25000 },
  { id: 'sport', kind: 'sport', x: 8480, y: 7360, name: { de: 'Sportplatz', en: 'Sports ground' }, maxN: 25000 },
  { id: 'station', kind: 'station', x: 7400, y: 7800, name: { de: 'Bahnhof', en: 'Station' }, maxN: 100000 },
  { id: 'beach', kind: 'beach', x: 9500, y: 5000, name: { de: 'Badestelle', en: 'Bathing spot' }, maxN: 50000 },
  { id: 'tower', kind: 'tower', x: 6200, y: 9400, name: { de: 'Aussichtsturm', en: 'Lookout tower' }, maxN: 100000 },
  { id: 'mill', kind: 'mill', x: 6800, y: 5400, name: { de: 'Mühle', en: 'Mill' }, maxN: 50000 },
  { id: 'farm', kind: 'farm', x: 9200, y: 8600, name: { de: 'Bauernhof', en: 'Farm' }, maxN: 50000 },
  { id: 'castle', kind: 'castle', x: 3200, y: 3400, name: { de: 'Burgruine', en: 'Castle ruin' }, maxN: 100000 },
  { id: 'village2', kind: 'village', x: 12800, y: 10600, name: { de: 'Eulenbrunn', en: 'Eulenbrunn' }, maxN: 100000 },
];

/* ------------------------------------------------------------------ */
/* Straßen                                                             */
/* ------------------------------------------------------------------ */

const NODE: Record<string, P> = {
  // Landstraße West–Ost
  w0: [0, 7600],
  w1: [2500, 7400],
  w2: [4600, 7300],
  w3: [6400, 7150],
  bridge: [7200, 7050],
  v1: [7600, 7040],
  vc: [8000, 7080],
  k1: [8160, 7064],
  v2: [8500, 7000],
  e1: [9000, 7150],
  e2: [10200, 7600],
  e3: [11600, 8600],
  e4: [14000, 8200],
  e5: [18000, 8000],
  // Straße nach Norden (Schule, See)
  s1: [8130, 6800],
  school: [8250, 6740],
  s2: [8500, 6400],
  s3: [9000, 5600],
  beach: [9400, 5100],
  s3b: [9300, 4600],
  s4: [9700, 3700],
  s5: [11000, 2600],
  s6: [12400, 0],
  // Querstraße am Rathaus
  c1: [7760, 6880],
  c2: [7300, 6700],
  // Bahnhofstraße und Weg zum Aussichtsturm
  t1: [7500, 7400],
  t2: [7400, 7720],
  t3: [7300, 8300],
  t4: [6800, 8900],
  tower: [6250, 9350],
  t5: [5600, 9900],
  t6: [4000, 11500],
  t7: [2000, 15000],
  // Mühle und Burg
  m1: [7050, 6450],
  mill: [6880, 5480],
  m2: [6000, 4800],
  m3: [4500, 4000],
  castle: [3300, 3480],
  m4: [1500, 2000],
  m5: [0, 1400],
  // Sportplatz, Bauernhof, Nachbarort
  sp1: [8640, 7280],
  f1: [8800, 7700],
  farm: [9180, 8520],
  f2: [10400, 9700],
  nb1: [12300, 9700],
  nb: [12800, 10560],
  nb2: [13600, 11600],
  nb3: [15500, 15000],
  // Ostgasse
  g1: [8800, 6700],
  // Feldwege
  x1: [4800, 6100],
  x2: [11000, 6200],
  x3: [5200, 8600],
};

export type RoadClass = 'main' | 'minor' | 'track';

/** Straßenzüge (für das Zeichnen) als Folgen von Knotennamen. */
const LINES: { cls: RoadClass; nodes: string[] }[] = [
  { cls: 'main', nodes: ['w0', 'w1', 'w2', 'w3', 'bridge', 'v1', 'vc', 'k1', 'v2', 'e1', 'e2', 'e3', 'e4', 'e5'] },
  { cls: 'minor', nodes: ['k1', 's1', 'school', 's2', 's3', 'beach', 's3b', 's4', 's5', 's6'] },
  { cls: 'minor', nodes: ['v1', 'c1', 's1'] },
  { cls: 'minor', nodes: ['c1', 'c2', 'm1'] },
  { cls: 'minor', nodes: ['bridge', 'm1', 'mill', 'm2', 'm3', 'castle', 'm4', 'm5'] },
  { cls: 'minor', nodes: ['v1', 't1', 't2', 't3', 't4', 'tower', 't5', 't6', 't7'] },
  { cls: 'minor', nodes: ['v2', 'sp1', 'f1', 'farm', 'f2', 'nb'] },
  { cls: 'main', nodes: ['e3', 'nb1', 'nb', 'nb2', 'nb3'] },
  { cls: 'minor', nodes: ['s2', 'g1', 'e1'] },
  { cls: 'track', nodes: ['w2', 'x1', 'm2'] },
  { cls: 'track', nodes: ['e2', 'x2', 's5'] },
  { cls: 'track', nodes: ['t5', 'x3', 'w3'] },
];

const NODE_KEYS = Object.keys(NODE);
const NODE_INDEX = new Map(NODE_KEYS.map((k, i) => [k, i]));

/** Straßennetz für die Wegstrecke. */
export const ROADS: RoadGraph = {
  nodes: NODE_KEYS.map((k) => pt(NODE[k]!)),
  edges: LINES.flatMap((l) => l.nodes.slice(1).map((k, i) => [NODE_INDEX.get(l.nodes[i]!)!, NODE_INDEX.get(k)!] as const)),
};

export const ROAD_LINES: { cls: RoadClass; pts: Pt[] }[] = LINES.map((l) => ({ cls: l.cls, pts: l.nodes.map((k) => pt(NODE[k]!)) }));

/* ------------------------------------------------------------------ */
/* Gewässer, Bahn, Flächen                                             */
/* ------------------------------------------------------------------ */

export const RIVER: Pt[] = (
  [
    [5200, 0],
    [5500, 1200],
    [5900, 2400],
    [6500, 3900],
    [6750, 4800],
    [6950, 5380],
    [7050, 6200],
    [7150, 6900],
    [7100, 7500],
    [6900, 8200],
    [7200, 9000],
    [8400, 9800],
    [10500, 10400],
    [13000, 11800],
    [16000, 13500],
    [18000, 14200],
  ] as P[]
).map(pt);

export const STREAMS: Pt[][] = [
  (
    [
      [10600, 1800],
      [10500, 3000],
      [10700, 3980],
    ] as P[]
  ).map(pt),
  (
    [
      [1200, 9800],
      [3200, 9300],
      [4800, 9700],
      [6050, 10600],
      [7200, 9000],
    ] as P[]
  ).map(pt),
];

export const LAKE: Pt[] = (
  [
    [9560, 4870],
    [9640, 4640],
    [9760, 4480],
    [9950, 4300],
    [10300, 4060],
    [10700, 3960],
    [10950, 4100],
    [10930, 4380],
    [10620, 4700],
    [10250, 4910],
    [9900, 5010],
    [9680, 5020],
  ] as P[]
).map(pt);

export const RAIL: Pt[] = (
  [
    [0, 8600],
    [3000, 8200],
    [5500, 7900],
    [6800, 7800],
    [7400, 7870],
    [8200, 7950],
    [9600, 8150],
    [11000, 8900],
    [13500, 9800],
    [15000, 10200],
    [18000, 10800],
  ] as P[]
).map(pt);

const poly = (a: P[]) => a.map(pt);

export const FORESTS: Pt[][] = [
  poly([
    [2800, 5800],
    [3500, 5350],
    [4200, 5200],
    [5000, 5300],
    [5600, 5500],
    [6100, 5900],
    [6300, 6300],
    [6450, 6900],
    [6250, 7500],
    [5700, 7750],
    [5200, 8000],
    [4200, 8350],
    [3400, 8150],
    [2900, 7700],
    [2400, 7000],
  ]),
  poly([
    [5300, 9000],
    [5900, 8700],
    [6550, 8800],
    [6900, 9400],
    [6700, 10200],
    [6100, 10450],
    [5500, 10350],
    [5100, 9800],
  ]),
  poly([
    [11500, 1500],
    [12400, 900],
    [13500, 1000],
    [14700, 1500],
    [15500, 2200],
    [15800, 3200],
    [15200, 4100],
    [14000, 4600],
    [12900, 4300],
    [12300, 3700],
    [11800, 2700],
  ]),
  poly([
    [9800, 9500],
    [10500, 9250],
    [11200, 9500],
    [11300, 10100],
    [10800, 10600],
    [10100, 10650],
    [9650, 10200],
  ]),
  poly([
    [2200, 2400],
    [2900, 2050],
    [3700, 2250],
    [4400, 3100],
    [4200, 4000],
    [3500, 4500],
    [2700, 4450],
    [2100, 3700],
  ]),
  poly([
    [15600, 5800],
    [16700, 5500],
    [17600, 6200],
    [17500, 7300],
    [16400, 7500],
    [15500, 6900],
  ]),
  poly([
    [600, 11000],
    [1800, 10600],
    [2600, 11300],
    [2400, 12600],
    [1200, 13000],
    [400, 12200],
  ]),
];

export interface Village {
  id: string;
  name: { de: string; en: string } | null;
  outline: Pt[];
  /** Mittelpunkt für die Beschriftung */
  label: Pt;
}

export const VILLAGES: Village[] = [
  {
    id: 'v1',
    name: { de: 'Sonnwiesen', en: 'Sonnwiesen' },
    label: { x: 8350, y: 6250 },
    outline: poly([
      [7230, 6450],
      [7700, 6380],
      [8250, 6380],
      [8700, 6420],
      [8920, 6800],
      [8950, 7150],
      [8780, 7550],
      [8250, 7720],
      [7800, 7740],
      [7600, 8000],
      [7250, 7950],
      [7280, 7400],
      [7250, 6900],
    ]),
  },
  {
    id: 'v2',
    name: null,
    label: { x: 12800, y: 10600 },
    outline: poly([
      [12350, 10250],
      [12900, 10150],
      [13300, 10450],
      [13250, 10950],
      [12750, 11100],
      [12300, 10850],
    ]),
  },
];

/* ------------------------------------------------------------------ */
/* Hügel und Höhenlinien                                               */
/* ------------------------------------------------------------------ */

export interface Hill {
  c: Pt;
  /** Gipfelhöhe in m */
  peak: number;
  /** Radius der 400-m-Linie */
  r: number;
  /** Streckung (Ost–West : Nord–Süd) und Drehung */
  sx: number;
  rot: number;
  seed: number;
}

export const BASE_LEVEL = 400;
export const CONTOUR_STEP = 20;

export const HILLS: Hill[] = [
  { c: { x: 6200, y: 9400 }, peak: 512, r: 1700, sx: 1.25, rot: 0.4, seed: 1 },
  { c: { x: 3200, y: 3400 }, peak: 548, r: 2000, sx: 1.1, rot: -0.3, seed: 2 },
  { c: { x: 14200, y: 2800 }, peak: 604, r: 2900, sx: 1.6, rot: 0.2, seed: 3 },
  { c: { x: 16400, y: 6600 }, peak: 466, r: 1300, sx: 1.2, rot: 0.9, seed: 4 },
  { c: { x: 1600, y: 11800 }, peak: 486, r: 1500, sx: 1.0, rot: 0, seed: 5 },
];

/** Höhenlinien eines Hügels (geschlossene Linienzüge) mit ihrer Höhe. */
export function contours(h: Hill): { level: number; pts: Pt[] }[] {
  const out: { level: number; pts: Pt[] }[] = [];
  const ph = [h.seed * 1.7, h.seed * 2.9, h.seed * 4.3];
  for (let level = BASE_LEVEL + CONTOUR_STEP; level < h.peak; level += CONTOUR_STEP) {
    const f = Math.pow((h.peak - level) / (h.peak - BASE_LEVEL), 0.75);
    const pts: Pt[] = [];
    const N = 72;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      // gleiche „Beulen“ in allen Höhen, damit die Linien sauber ineinander liegen
      const wob = 1 + 0.16 * Math.sin(2 * a + ph[0]!) + 0.09 * Math.sin(3 * a + ph[1]!) + 0.05 * Math.sin(5 * a + ph[2]!) * (0.5 + f);
      const rr = h.r * f * wob;
      const lx = Math.cos(a) * rr * h.sx;
      const ly = Math.sin(a) * rr;
      pts.push({ x: h.c.x + lx * Math.cos(h.rot) - ly * Math.sin(h.rot), y: h.c.y + lx * Math.sin(h.rot) + ly * Math.cos(h.rot) });
    }
    out.push({ level, pts });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Häuser und Felder (erzeugt, aber immer gleich)                      */
/* ------------------------------------------------------------------ */

export interface House {
  x: number;
  y: number;
  /** Länge entlang der Straße, Tiefe (m) */
  w: number;
  d: number;
  /** Richtung der Straße (rad) */
  a: number;
  /** Seite der Straße (+1/−1), für den Garten */
  side: number;
}

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function inPolygon(p: Pt, pts: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]!;
    const b = pts[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function distToLine(p: Pt, line: readonly Pt[]): number {
  let d = Infinity;
  for (let i = 1; i < line.length; i++) d = Math.min(d, closestOnSegment(p, line[i - 1]!, line[i]!).d);
  return d;
}

/** Häuser entlang der Dorfstraßen, mit Abstand zu Bach, Bahn, Orten und anderen Häusern. */
export function buildHouses(): House[] {
  const rnd = rng(11);
  const out: House[] = [];
  const near = (p: Pt, r: number) => out.some((h) => Math.hypot(h.x - p.x, h.y - p.y) < r);
  const roads = ROAD_LINES.filter((l) => l.cls !== 'track');
  for (const v of VILLAGES) {
    for (const line of roads) {
      for (let i = 1; i < line.pts.length; i++) {
        const a = line.pts[i - 1]!;
        const b = line.pts[i]!;
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const nx = -Math.sin(ang);
        const ny = Math.cos(ang);
        for (let s = 18; s < len - 12; s += 30 + rnd() * 10) {
          for (const side of [-1, 1]) {
            if (rnd() < 0.16) continue;
            const off = 21 + rnd() * 6;
            const p = { x: a.x + Math.cos(ang) * s + nx * off * side, y: a.y + Math.sin(ang) * s + ny * off * side };
            if (!inPolygon(p, v.outline)) continue;
            if (POIS.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < (q.kind === 'sport' ? 85 : q.kind === 'village' ? 0 : 55))) continue;
            if (distToLine(p, RIVER) < 32 || distToLine(p, RAIL) < 26) continue;
            if (roads.some((l) => l !== line && distToLine(p, l.pts) < 15)) continue;
            if (near(p, 19)) continue;
            out.push({ x: p.x, y: p.y, w: 11 + rnd() * 7, d: 8 + rnd() * 4, a: ang, side });
          }
        }
      }
    }
  }
  return out;
}

export interface Field {
  pts: Pt[];
  tone: number;
}

/** Feldflur: leicht verschobene Vierecke mit wechselnder Tönung. */
export function buildFields(): Field[] {
  const rnd = rng(23);
  const cell = 650;
  const cols = Math.ceil(WORLD.w / cell) + 1;
  const rows = Math.ceil(WORLD.h / cell) + 1;
  const grid: Pt[][] = [];
  for (let j = 0; j <= rows; j++) {
    const row: Pt[] = [];
    for (let i = 0; i <= cols; i++) row.push({ x: i * cell + (rnd() - 0.5) * cell * 0.5 - cell / 2, y: j * cell + (rnd() - 0.5) * cell * 0.5 - cell / 2 });
    grid.push(row);
  }
  const out: Field[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const tone = rnd();
      if (tone < 0.3) continue;
      out.push({ pts: [grid[j]![i]!, grid[j]![i + 1]!, grid[j + 1]![i + 1]!, grid[j + 1]![i]!], tone });
    }
  return out;
}
