/**
 * Rechenlogik „Flächen durch Zerlegen und Ergänzen“ (Jahrgangsstufe 6).
 *
 * Koordinaten in cm auf Kästchenpapier (1 Kästchen = 1 cm, also 1 cm²),
 * y nach oben. Die Grundseite liegt immer waagerecht auf der x-Achse und
 * beginnt in A(0 | 0):
 *
 * - Parallelogramm ABCD: A(0 | 0), B(g | 0), C(g + s | h), D(s | h)
 * - Dreieck ABC:         A(0 | 0), B(g | 0), C(s | h)
 * - Trapez ABCD:         A(0 | 0), B(a | 0), C(s + c | h), D(s | h)
 *
 * `s` ist der Versatz der oberen Ecke(n) nach rechts. Die Höhe h ist der
 * Abstand der oberen Ecken von der Grundseite (Punkt-Gerade-Abstand); ihr
 * Fußpunkt (s | 0) liegt außerhalb der Grundseite, wenn s < 0 oder s > g.
 *
 * Herleitungen:
 * - Parallelogramm → Rechteck: entlang von Höhen (senkrechten Schnitten im
 *   Abstand g) zerlegen und die Teile um Vielfache von g verschieben. Bei
 *   schwach geneigtem Parallelogramm ist es ein einziges Dreieck, bei stark
 *   geneigtem (Höhenfußpunkt außerhalb) entstehen mehrere Streifen.
 * - Dreieck bzw. Trapez: eine Kopie um 180° um den Mittelpunkt der Seite BC
 *   drehen. Sie ergänzt die Figur zu einem Parallelogramm mit der Grundseite
 *   g bzw. a + c und derselben Höhe h – die Figur ist dessen Hälfte.
 * - Trapez alternativ: die Diagonale BD zerlegt es in zwei Dreiecke mit den
 *   Grundseiten a und c und derselben Höhe h.
 */

export type Pt = readonly [number, number];
export type Poly = readonly Pt[];
export type Kind = 'para' | 'tri' | 'trap';

/** Maße einer Figur in cm (beim Trapez ist `g` die Grundseite a). */
export interface Dims {
  g: number;
  h: number;
  s: number;
  c: number;
}

const EPS = 1e-9;

/* ------------------------------------------------------------------ */
/* Grundlagen                                                          */
/* ------------------------------------------------------------------ */

/** Orientierter Flächeninhalt (Schuhbandformel, positiv gegen den Uhrzeigersinn). */
export function signedArea(poly: Poly): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

/** Flächeninhalt eines Vielecks (Schuhbandformel). */
export function polyArea(poly: Poly): number {
  return Math.abs(signedArea(poly));
}

/** Abstand des Punktes P von der Geraden durch A und B. */
export function pointLineDistance(p: Pt, a: Pt, b: Pt): number {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  return Math.abs(ux * (p[1] - a[1]) - uy * (p[0] - a[0])) / Math.hypot(ux, uy);
}

/** Lotfußpunkt von P auf die Gerade durch A und B. */
export function footOfPerpendicular(p: Pt, a: Pt, b: Pt): Pt {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const k = ((p[0] - a[0]) * ux + (p[1] - a[1]) * uy) / (ux * ux + uy * uy);
  return [a[0] + k * ux, a[1] + k * uy];
}

/** Punkt P um den Winkel `angle` (Bogenmaß, gegen den Uhrzeigersinn) um M drehen. */
export function rotateAbout(p: Pt, m: Pt, angle: number): Pt {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const dx = p[0] - m[0];
  const dy = p[1] - m[1];
  return [m[0] + c * dx - s * dy, m[1] + s * dx + c * dy];
}

/** Halbdrehung (Punktspiegelung) von P an M: P' = 2·M − P. */
export function halfTurn(p: Pt, m: Pt): Pt {
  return [2 * m[0] - p[0], 2 * m[1] - p[1]];
}

export const midpoint = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/**
 * Konvexes Vieleck an einer Halbebene abschneiden (Sutherland–Hodgman):
 * behalten wird, was `n · p ≤ d` erfüllt.
 */
export function clipHalfPlane(poly: Poly, nx: number, ny: number, d: number): Pt[] {
  const out: Pt[] = [];
  const f = (p: Pt) => nx * p[0] + ny * p[1] - d;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const fp = f(p);
    const fq = f(q);
    if (fp <= EPS) out.push(p);
    if ((fp < -EPS && fq > EPS) || (fp > EPS && fq < -EPS)) {
      const t = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return dedupe(out);
}

/** Aufeinanderfolgende (fast) gleiche Punkte entfernen. */
function dedupe(poly: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of poly) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last[0] - p[0]) > 1e-9 || Math.abs(last[1] - p[1]) > 1e-9) out.push(p);
  }
  while (out.length > 1 && Math.abs(out[0]![0] - out[out.length - 1]![0]) < 1e-9 && Math.abs(out[0]![1] - out[out.length - 1]![1]) < 1e-9) out.pop();
  return out;
}

/** Teil eines konvexen Vielecks im senkrechten Streifen x0 ≤ x ≤ x1. */
export function clipToStrip(poly: Poly, x0: number, x1: number): Pt[] {
  return clipHalfPlane(clipHalfPlane(poly, -1, 0, -x0), 1, 0, x1);
}

/** Senkrechte Sehne eines konvexen Vielecks bei x = X: [y unten, y oben] oder null. */
export function verticalChord(poly: Poly, X: number): [number, number] | null {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const x0 = Math.min(p[0], q[0]);
    const x1 = Math.max(p[0], q[0]);
    if (X < x0 - EPS || X > x1 + EPS) continue;
    if (Math.abs(q[0] - p[0]) < EPS) {
      lo = Math.min(lo, p[1], q[1]);
      hi = Math.max(hi, p[1], q[1]);
    } else {
      const y = p[1] + ((X - p[0]) / (q[0] - p[0])) * (q[1] - p[1]);
      lo = Math.min(lo, y);
      hi = Math.max(hi, y);
    }
  }
  return hi - lo > EPS ? [lo, hi] : null;
}

/* ------------------------------------------------------------------ */
/* Figuren und Formeln                                                 */
/* ------------------------------------------------------------------ */

/** Eckpunkte der Figur (gegen den Uhrzeigersinn, Grundseite AB unten). */
export function figure(kind: Kind, d: Dims): Pt[] {
  const { g, h, s, c } = d;
  if (kind === 'para') return parallelogram(g, h, s);
  if (kind === 'tri')
    return [
      [0, 0],
      [g, 0],
      [s, h],
    ];
  return [
    [0, 0],
    [g, 0],
    [s + c, h],
    [s, h],
  ];
}

/** Parallelogramm mit Grundseite G (von A(0 | 0)), Höhe h und Versatz s. */
export function parallelogram(G: number, h: number, s: number): Pt[] {
  return [
    [0, 0],
    [G, 0],
    [G + s, h],
    [s, h],
  ];
}

export const parallelogramArea = (g: number, h: number) => g * h;
export const triangleArea = (g: number, h: number) => (g * h) / 2;
export const trapezoidArea = (a: number, c: number, h: number) => ((a + c) * h) / 2;

/** Flächeninhalt nach der Formel. */
export function formulaArea(kind: Kind, d: Dims): number {
  if (kind === 'para') return parallelogramArea(d.g, d.h);
  if (kind === 'tri') return triangleArea(d.g, d.h);
  return trapezoidArea(d.g, d.c, d.h);
}

/** Obere Ecke, von der aus die Höhe eingezeichnet wird (D bzw. beim Dreieck C), und ihr Fußpunkt. */
export function heightLine(d: Dims): { top: Pt; foot: Pt } {
  return { top: [d.s, d.h], foot: [d.s, 0] };
}

/** Liegt der Höhenfußpunkt außerhalb der Grundseite (stumpfer Winkel bzw. stark geneigt)? */
export function footOutside(d: Dims): boolean {
  return d.s < -EPS || d.s > d.g + EPS;
}

/* ------------------------------------------------------------------ */
/* Ergänzen: Kopie um 180° drehen                                      */
/* ------------------------------------------------------------------ */

/** Drehpunkt: Mittelpunkt der Seite BC. */
export function pivot(kind: Kind, d: Dims): Pt {
  const f = figure(kind, d);
  return midpoint(f[1]!, f[2]!);
}

/** Um 180° um den Mittelpunkt von BC gedrehte Kopie der Figur. */
export function halfTurnCopy(kind: Kind, d: Dims): Pt[] {
  const m = pivot(kind, d);
  return figure(kind, d).map((p) => halfTurn(p, m));
}

/** Kopie im Zwischenzustand (Drehwinkel 0 … π). */
export function rotatedCopy(kind: Kind, d: Dims, angle: number): Pt[] {
  const m = pivot(kind, d);
  return figure(kind, d).map((p) => rotateAbout(p, m, angle));
}

/**
 * Das Parallelogramm aus Figur und gedrehter Kopie: Grundseite G (beim
 * Dreieck g, beim Trapez a + c), gleiche Höhe h und gleicher Versatz s.
 * Beim Parallelogramm selbst ist es die Figur.
 */
export function doubled(kind: Kind, d: Dims): { G: number; h: number; s: number } {
  return { G: kind === 'trap' ? d.g + d.c : d.g, h: d.h, s: d.s };
}

/* ------------------------------------------------------------------ */
/* Zerlegen: Parallelogramm → Rechteck                                 */
/* ------------------------------------------------------------------ */

/**
 * Lage des Rechtecks G × h nach dem Verschieben: Es beginnt bei x0 = s − m·G
 * und überdeckt einen Teil der Grundseite. Bei s ≥ 0 ist 0 ≤ x0 < G, bei
 * s < 0 gespiegelt −G < x0 ≤ 0. So bleibt bei schwacher Neigung das große
 * Teil liegen und nur das abgeschnittene Dreieck wird verschoben – auch bei
 * Neigung nach links.
 */
export function targetRect(G: number, h: number, s: number): { x0: number; w: number; h: number } {
  const m = s >= 0 ? Math.floor(s / G + 1e-12) : Math.ceil(s / G - 1e-12);
  const x0 = s - m * G;
  return { x0: Math.abs(x0) < 1e-12 ? 0 : x0, w: G, h };
}

/** Senkrechte Streifen der Breite G, entlang derer zerlegt wird (Grenzen x = s + j·G). */
export function strips(G: number, s: number): { j: number; x0: number; x1: number; shift: number }[] {
  const xmin = Math.min(0, s);
  const xmax = Math.max(G, G + s);
  const { x0: target } = targetRect(G, 1, s);
  const j0 = Math.floor((xmin - s) / G + 1e-12);
  const j1 = Math.ceil((xmax - s) / G - 1e-12) - 1;
  const out: { j: number; x0: number; x1: number; shift: number }[] = [];
  for (let j = j0; j <= j1; j++) {
    const a = s + j * G;
    out.push({ j, x0: a, x1: a + G, shift: target - a });
  }
  return out;
}

/** Ein Teilstück beim Zerlegen: Vieleck, Herkunft (0 = Figur, 1 = Kopie) und Verschiebung nach rechts. */
export interface Piece {
  poly: Pt[];
  src: number;
  shift: number;
  j: number;
}

/**
 * Zerlegt die Teilfiguren `sources` (zusammen ein Parallelogramm G, h, s)
 * (Grundseite G, Versatz s) entlang der Streifen. Verschiebt man jedes Stück um `shift`, entsteht das
 * Rechteck aus `targetRect`.
 */
export function rectPieces(G: number, s: number, sources: readonly Poly[]): Piece[] {
  const out: Piece[] = [];
  for (const st of strips(G, s)) {
    sources.forEach((src, i) => {
      const poly = clipToStrip(src, st.x0, st.x1);
      if (poly.length >= 3 && polyArea(poly) > 1e-9) out.push({ poly, src: i, shift: st.shift, j: st.j });
    });
  }
  return out;
}

/** Schnittlinien (Höhen) im Inneren des Parallelogramms G, h, s: x und senkrechte Ausdehnung. */
export function cutLines(G: number, h: number, s: number): { x: number; y0: number; y1: number }[] {
  const poly = parallelogram(G, h, s);
  const xmin = Math.min(0, s);
  const xmax = Math.max(G, G + s);
  const out: { x: number; y0: number; y1: number }[] = [];
  for (const st of strips(G, s)) {
    // Schnitte auf dem Rand (bei s = 0 bzw. am Ende) entfallen
    if (st.x0 <= xmin + EPS || st.x0 >= xmax - EPS) continue;
    const ch = verticalChord(poly, st.x0);
    if (ch) out.push({ x: st.x0, y0: ch[0], y1: ch[1] });
  }
  return out;
}

/** Braucht das Parallelogramm gar keinen Schnitt (es ist schon ein Rechteck)? */
export function isRectangle(s: number): boolean {
  return Math.abs(s) < EPS;
}

/* ------------------------------------------------------------------ */
/* Trapez: Zerlegen in zwei Dreiecke                                   */
/* ------------------------------------------------------------------ */

/** Die Diagonale BD zerlegt das Trapez in ABD (Grundseite a) und BCD (Grundseite c). */
export function trapezoidTriangles(d: Dims): [Pt[], Pt[]] {
  const A: Pt = [0, 0];
  const B: Pt = [d.g, 0];
  const C: Pt = [d.s + d.c, d.h];
  const D: Pt = [d.s, d.h];
  return [
    [A, B, D],
    [B, C, D],
  ];
}

/* ------------------------------------------------------------------ */
/* Kästchen zählen                                                     */
/* ------------------------------------------------------------------ */

/** Einheitsquadrate des Rechtecks (linke untere Ecken), Reihe für Reihe von unten links. */
export function rectCells(x0: number, w: number, h: number): Pt[] {
  const out: Pt[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out.push([x0 + x, y]);
  return out;
}

/** Achsenparalleler Rahmen um mehrere Vielecke. */
export function bounds(polys: readonly Poly[]): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const poly of polys)
    for (const p of poly) {
      x0 = Math.min(x0, p[0]);
      y0 = Math.min(y0, p[1]);
      x1 = Math.max(x1, p[0]);
      y1 = Math.max(y1, p[1]);
    }
  return { x0, y0, x1, y1 };
}

/** Alle Lagen, die die Figur bei den Herleitungen einnehmen kann (für einen festen Bildausschnitt). */
export function envelope(kind: Kind, d: Dims): { x0: number; y0: number; x1: number; y1: number } {
  const polys: Poly[] = [figure(kind, d)];
  if (kind !== 'para') polys.push(halfTurnCopy(kind, d));
  const D = doubled(kind, d);
  const r = targetRect(D.G, D.h, D.s);
  polys.push([
    [r.x0, 0],
    [r.x0 + r.w, 0],
    [r.x0 + r.w, r.h],
    [r.x0, r.h],
  ]);
  return bounds(polys);
}
