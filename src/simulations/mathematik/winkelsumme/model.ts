/**
 * Rechenlogik „Innenwinkelsumme in Dreieck und Vieleck“ (Jahrgangsstufe 7).
 *
 * Punkte sind Paare [x, y] in Kästchen, y zeigt nach oben. Ein Vieleck ist
 * die Liste seiner Ecken in Umlaufreihenfolge P₀P₁…Pₙ₋₁ (geschlossen).
 * Winkel werden in Grad angegeben.
 *
 * Innenwinkel: Bei einem einfachen Vieleck (Seiten überkreuzen sich nicht)
 * liegt das Innere bei positivem Umlaufsinn (gegen den Uhrzeigersinn) links
 * jeder Seite. Der Innenwinkel bei Pᵢ ist dann der Winkel, um den man die
 * Richtung zu Pᵢ₊₁ gegen den Uhrzeigersinn drehen muss, bis sie zu Pᵢ₋₁
 * zeigt – bei einspringenden Ecken über 180°. Bei negativem Umlaufsinn wird
 * in die andere Richtung gedreht.
 *
 * Außenwinkel: Drehwinkel beim Umlaufen an jeder Ecke (Verlängerung der
 * ankommenden Seite → abgehende Seite), mit Vorzeichen bezogen auf den
 * Umlaufsinn. Für einfache Vielecke gilt Außenwinkel = 180° − Innenwinkel
 * und die Summe ist 360° (eine volle Drehung).
 */

export type Pt = readonly [number, number];

/** Breite und Höhe des Karopapiers in Kästchen (Koordinaten 0 … GRID_W bzw. 0 … GRID_H). */
export const GRID_W = 16;
export const GRID_H = 12;
/** Kleinste und größte Eckenzahl im Vieleck-Modus. */
export const N_MIN = 3;
export const N_MAX = 10;

const EPS = 1e-9;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Rest modulo 360 im Bereich [0, 360). */
export function norm360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Richtung von `a` nach `b` in Grad (0° nach rechts, gegen den Uhrzeigersinn). */
export function direction(a: Pt, b: Pt): number {
  return norm360(toDeg(Math.atan2(b[1] - a[1], b[0] - a[0])));
}

/** Drehung gegen den Uhrzeigersinn von Richtung `from` zu Richtung `to` (0 … < 360°). */
export function ccwTurn(from: number, to: number): number {
  return norm360(to - from);
}

/** Vorzeichenbehafteter Drehwinkel von `from` nach `to` im Bereich (−180°, 180°]. */
export function signedTurn(from: number, to: number): number {
  const d = norm360(to - from);
  return d > 180 ? d - 360 : d;
}

/** Doppelte orientierte Fläche (positiv = gegen den Uhrzeigersinn). */
export function signedArea2(poly: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    s += a[0] * b[1] - a[1] * b[0];
  }
  return s;
}

/** Umlaufsinn: 1 = gegen den Uhrzeigersinn, −1 = im Uhrzeigersinn, 0 = entartet. */
export function orientation(poly: readonly Pt[]): 1 | -1 | 0 {
  const a = signedArea2(poly);
  return a > EPS ? 1 : a < -EPS ? -1 : 0;
}

/** Orientierung des Dreiecks abc (Vorzeichen des Kreuzprodukts). */
function cross(a: Pt, b: Pt, c: Pt): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

function onSegment(a: Pt, b: Pt, p: Pt): boolean {
  return Math.min(a[0], b[0]) - EPS <= p[0] && p[0] <= Math.max(a[0], b[0]) + EPS && Math.min(a[1], b[1]) - EPS <= p[1] && p[1] <= Math.max(a[1], b[1]) + EPS;
}

/** Haben die Strecken [p1p2] und [q1q2] einen gemeinsamen Punkt (auch Berühren)? */
export function segmentsIntersect(p1: Pt, p2: Pt, q1: Pt, q2: Pt): boolean {
  const d1 = cross(q1, q2, p1);
  const d2 = cross(q1, q2, p2);
  const d3 = cross(p1, p2, q1);
  const d4 = cross(p1, p2, q2);
  const s = (v: number) => (v > EPS ? 1 : v < -EPS ? -1 : 0);
  if (s(d1) * s(d2) < 0 && s(d3) * s(d4) < 0) return true;
  if (s(d1) === 0 && onSegment(q1, q2, p1)) return true;
  if (s(d2) === 0 && onSegment(q1, q2, p2)) return true;
  if (s(d3) === 0 && onSegment(p1, p2, q1)) return true;
  if (s(d4) === 0 && onSegment(p1, p2, q2)) return true;
  return false;
}

/** Schnittpunkt der Geraden durch [p1p2] und [q1q2] (oder `null`, wenn parallel). */
export function lineIntersection(p1: Pt, p2: Pt, q1: Pt, q2: Pt): Pt | null {
  const rx = p2[0] - p1[0];
  const ry = p2[1] - p1[1];
  const sx = q2[0] - q1[0];
  const sy = q2[1] - q1[1];
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < EPS) return null;
  const t = ((q1[0] - p1[0]) * sy - (q1[1] - p1[1]) * sx) / den;
  return [p1[0] + t * rx, p1[1] + t * ry];
}

/** Zwei Ecken liegen aufeinander (Seite der Länge 0)? */
export function hasDuplicate(poly: readonly Pt[]): boolean {
  for (let i = 0; i < poly.length; i++)
    for (let j = i + 1; j < poly.length; j++) if (Math.abs(poly[i]![0] - poly[j]![0]) < EPS && Math.abs(poly[i]![1] - poly[j]![1]) < EPS) return true;
  return false;
}

/** Stellen, an denen sich zwei nicht benachbarte Seiten treffen (zum Markieren). */
export function crossings(poly: readonly Pt[]): Pt[] {
  const n = poly.length;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // benachbarte Seiten teilen eine Ecke und zählen nicht
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      const a = poly[i]!;
      const b = poly[(i + 1) % n]!;
      const c = poly[j]!;
      const d = poly[(j + 1) % n]!;
      if (!segmentsIntersect(a, b, c, d)) continue;
      const x = lineIntersection(a, b, c, d);
      out.push(x ?? c);
    }
  }
  return out;
}

/** Einfaches Vieleck: mindestens drei Ecken, keine doppelten Ecken, Fläche ≠ 0, keine Überschneidungen. */
export function isSimple(poly: readonly Pt[]): boolean {
  if (poly.length < 3 || hasDuplicate(poly) || orientation(poly) === 0) return false;
  return crossings(poly).length === 0;
}

/**
 * Innenwinkel an allen Ecken (Grad). `null`, wenn das Vieleck nicht einfach
 * ist – dann gibt es kein sauber begrenztes Inneres.
 */
export function interiorAngles(poly: readonly Pt[]): number[] | null {
  if (!isSimple(poly)) return null;
  const o = orientation(poly);
  const n = poly.length;
  return poly.map((p, i) => {
    const toNext = direction(p, poly[(i + 1) % n]!);
    const toPrev = direction(p, poly[(i + n - 1) % n]!);
    return o > 0 ? ccwTurn(toNext, toPrev) : ccwTurn(toPrev, toNext);
  });
}

/**
 * Außenwinkel (Drehwinkel beim Umlaufen) an allen Ecken, bezogen auf den
 * Umlaufsinn: positiv bei ausspringenden, negativ bei einspringenden Ecken.
 * `null` für nicht einfache Vielecke.
 */
export function exteriorAngles(poly: readonly Pt[]): number[] | null {
  if (!isSimple(poly)) return null;
  const o = orientation(poly);
  const n = poly.length;
  return poly.map((p, i) => {
    const din = direction(poly[(i + n - 1) % n]!, p);
    const dout = direction(p, poly[(i + 1) % n]!);
    return o * signedTurn(din, dout);
  });
}

/** Summe einer Zahlenliste. */
export const sum = (v: readonly number[]): number => v.reduce((s, x) => s + x, 0);

/** Innenwinkel α (bei A), β (bei B), γ (bei C) eines Dreiecks; `null`, wenn die Punkte auf einer Geraden liegen. */
export function triangleAngles(A: Pt, B: Pt, C: Pt): [number, number, number] | null {
  const a = interiorAngles([A, B, C]);
  return a ? [a[0]!, a[1]!, a[2]!] : null;
}

/** Dritter Winkel aus zwei bekannten: γ = 180° − α − β. */
export function thirdAngle(alpha: number, beta: number): number {
  return 180 - alpha - beta;
}

/** Anzahl der Dreiecke bei der Zerlegung eines n-Ecks: n − 2. */
export function triangleCount(n: number): number {
  return n - 2;
}

/** Innenwinkelsumme im n-Eck: (n − 2) · 180°. */
export function angleSum(n: number): number {
  return (n - 2) * 180;
}

/** Innenwinkel des regelmäßigen n-Ecks: (n − 2) · 180° : n. */
export function regularInterior(n: number): number {
  return angleSum(n) / n;
}

/** Außenwinkel des regelmäßigen n-Ecks: 360° : n. */
export function regularExterior(n: number): number {
  return 360 / n;
}

export type Shape = 'convex' | 'concave' | 'crossed' | 'degenerate';

/** Art des Vielecks: konvex, nicht konvex (einspringende Ecke), überschlagen oder entartet. */
export function classify(poly: readonly Pt[]): Shape {
  if (poly.length < 3 || hasDuplicate(poly)) return 'degenerate';
  if (poly.length > 3 && crossings(poly).length) return 'crossed';
  if (orientation(poly) === 0 || crossings(poly).length) return 'degenerate';
  const ext = exteriorAngles(poly)!;
  return ext.some((e) => e < -1e-7) ? 'concave' : 'convex';
}

/** Indizes der einspringenden Ecken (Innenwinkel über 180°). */
export function reflexVertices(poly: readonly Pt[]): number[] {
  const a = interiorAngles(poly);
  if (!a) return [];
  return a.map((v, i) => (v > 180 + 1e-7 ? i : -1)).filter((i) => i >= 0);
}

/** Punkt im Inneren des Vielecks? (Strahlverfahren) */
export function pointInPolygon(poly: readonly Pt[], p: Pt): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export type Tri = readonly [number, number, number];

/** Dreiecke der Zerlegung von Ecke k aus (Fächer): (k, k+1, k+2), (k, k+2, k+3), … */
export function fanTriangles(n: number, k: number): Tri[] {
  const out: Tri[] = [];
  for (let i = 1; i < n - 1; i++) out.push([k, (k + i) % n, (k + i + 1) % n]);
  return out;
}

/**
 * Geht die Zerlegung von Ecke k aus? Das ist genau dann der Fall, wenn alle
 * Fächerdreiecke denselben Umlaufsinn wie das Vieleck haben (keines ist
 * „umgeklappt“ oder entartet) – dann überlappen sie sich nicht und füllen
 * das Vieleck genau aus.
 */
export function fanValid(poly: readonly Pt[], k: number): boolean {
  if (!isSimple(poly)) return false;
  const o = orientation(poly);
  return fanTriangles(poly.length, k).every(([a, b, c]) => cross(poly[a]!, poly[b]!, poly[c]!) * o > EPS);
}

/** Erste Ecke (ab `prefer`), von der aus die Fächerzerlegung geht, sonst `null`. */
export function fanVertex(poly: readonly Pt[], prefer = 0): number | null {
  const n = poly.length;
  for (let s = 0; s < n; s++) {
    const k = (prefer + s) % n;
    if (fanValid(poly, k)) return k;
  }
  return null;
}

/** Zerlegung durch „Ohren abschneiden“ (für jedes einfache Vieleck möglich, n − 2 Dreiecke). */
export function earClip(poly: readonly Pt[]): Tri[] {
  if (!isSimple(poly)) return [];
  const o = orientation(poly);
  const idx = poly.map((_, i) => i);
  const out: Tri[] = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 1000) {
    let cut = false;
    for (let s = 0; s < idx.length; s++) {
      const i0 = idx[(s + idx.length - 1) % idx.length]!;
      const i1 = idx[s]!;
      const i2 = idx[(s + 1) % idx.length]!;
      const a = poly[i0]!;
      const b = poly[i1]!;
      const c = poly[i2]!;
      if (cross(a, b, c) * o <= EPS) continue;
      // kein anderer Eckpunkt darf im Ohr liegen
      const inside = idx.some((j) => {
        if (j === i0 || j === i1 || j === i2) return false;
        const p = poly[j]!;
        return cross(a, b, p) * o >= -EPS && cross(b, c, p) * o >= -EPS && cross(c, a, p) * o >= -EPS;
      });
      if (inside) continue;
      out.push([i0, i1, i2]);
      idx.splice(s, 1);
      cut = true;
      break;
    }
    if (!cut) return [];
  }
  if (idx.length === 3) out.push([idx[0]!, idx[1]!, idx[2]!]);
  return out;
}

export interface Triangulation {
  /** Ecke, von der aus zerlegt wurde, oder `null` (Ohren abgeschnitten). */
  fan: number | null;
  tris: Tri[];
}

/** Zerlegung in n − 2 Dreiecke: wenn möglich von einer Ecke aus (bevorzugt `prefer`). */
export function triangulate(poly: readonly Pt[], prefer = 0): Triangulation | null {
  if (!isSimple(poly)) return null;
  const k = fanVertex(poly, prefer);
  if (k !== null) return { fan: k, tris: fanTriangles(poly.length, k) };
  const tris = earClip(poly);
  return tris.length === poly.length - 2 ? { fan: null, tris } : null;
}

/** Ecken eines regelmäßigen n-Ecks um (cx | cy) mit Umkreisradius r, eine Seite waagerecht unten. */
export function regularPolygon(n: number, cx: number, cy: number, r: number): Pt[] {
  const start = -90 - 180 / n;
  return Array.from({ length: n }, (_, i) => {
    const a = ((start + (360 * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });
}

/** Regelmäßiges n-Eck in der Mitte des Karopapiers (Radius so, dass es mit Rand hineinpasst). */
export function regularOnGrid(n: number): Pt[] {
  return regularPolygon(n, GRID_W / 2, GRID_H / 2, n === 3 ? 5.6 : 5.2).map((p) => [round(p[0], 4), round(p[1], 4)] as Pt);
}

/** Alle Seiten und alle Winkel gleich (im Rahmen von `tol`)? */
export function isRegular(poly: readonly Pt[], tol = 1e-3): boolean {
  const a = interiorAngles(poly);
  if (!a || classify(poly) !== 'convex') return false;
  const n = poly.length;
  const sides = poly.map((p, i) => Math.hypot(poly[(i + 1) % n]![0] - p[0], poly[(i + 1) % n]![1] - p[1]));
  const s0 = sides[0]!;
  return sides.every((s) => Math.abs(s - s0) <= tol * s0) && a.every((v) => Math.abs(v - a[0]!) <= tol * 100);
}

export function round(v: number, dec: number): number {
  const f = 10 ** dec;
  return Math.round(v * f) / f;
}

/**
 * Rundet Werte auf `dec` Nachkommastellen so, dass ihre Summe genau `total`
 * (gerundet) ergibt (Verfahren der größten Reste). So zeigen z. B. drei
 * gerundete Dreieckswinkel zusammen wirklich 180,0°.
 */
export function roundToSum(values: readonly number[], dec: number, total = sum(values)): number[] {
  const f = 10 ** dec;
  const target = Math.round(total * f);
  const scaled = values.map((v) => v * f);
  const floors = scaled.map((v) => Math.floor(v + 1e-9));
  let rest = target - sum(floors);
  const order = scaled.map((v, i) => ({ i, r: v - floors[i]! })).sort((a, b) => b.r - a.r || a.i - b.i);
  const out = [...floors];
  for (let k = 0; rest > 0 && k < order.length; k++, rest--) out[order[k]!.i]! += 1;
  for (let k = order.length - 1; rest < 0 && k >= 0; k--, rest++) out[order[k]!.i]! -= 1;
  return out.map((v) => v / f);
}

/** Text „x,y;x,y;…“ → Punkte (nur 3 … 10 gültige Punkte im Karopapier, sonst `null`). */
export function parsePoints(text: string): Pt[] | null {
  const parts = text.split(';').map((s) => s.trim()).filter(Boolean);
  if (parts.length < N_MIN || parts.length > N_MAX) return null;
  const pts: Pt[] = [];
  for (const part of parts) {
    const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(part.replace(/\s+/g, ''));
    if (!m) return null;
    const x = Number(m[1]);
    const y = Number(m[2]);
    if (!(x >= 0 && x <= GRID_W && y >= 0 && y <= GRID_H)) return null;
    pts.push([x, y]);
  }
  return pts;
}

/** Punkte → Text „x,y;x,y;…“ (höchstens `dec` Nachkommastellen, Dezimalpunkt). */
export function formatPoints(pts: readonly Pt[], dec = 4): string {
  return pts.map((p) => `${round(p[0], dec)},${round(p[1], dec)}`).join(';');
}

/**
 * Verteilt `m` Punkte gleichmäßig (nach Weglänge) auf dem Rand des Vielecks,
 * beginnend bei der ersten Ecke – als Startlage für einen weichen Übergang
 * zu einem Vieleck mit anderer Eckenzahl.
 */
export function resample(poly: readonly Pt[], m: number): Pt[] {
  const n = poly.length;
  if (n === m) return poly.map((p) => [p[0], p[1]] as Pt);
  const lens = poly.map((p, i) => Math.hypot(poly[(i + 1) % n]![0] - p[0], poly[(i + 1) % n]![1] - p[1]));
  const total = sum(lens) || 1;
  const out: Pt[] = [];
  for (let k = 0; k < m; k++) {
    let d = (total * k) / m;
    let i = 0;
    while (i < n - 1 && d > lens[i]!) d -= lens[i++]!;
    const a = poly[i]!;
    const b = poly[(i + 1) % n]!;
    const t = lens[i]! > 0 ? Math.min(1, d / lens[i]!) : 0;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

/** Abstand des Punkts p von der Geraden durch a und b. */
export function distToLine(p: Pt, a: Pt, b: Pt): number {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return l < EPS ? Math.hypot(p[0] - a[0], p[1] - a[1]) : Math.abs(cross(a, b, p)) / l;
}

/** Punktspiegelung von p am Zentrum z. */
export function reflectPoint(p: Pt, z: Pt): Pt {
  return [2 * z[0] - p[0], 2 * z[1] - p[1]];
}
