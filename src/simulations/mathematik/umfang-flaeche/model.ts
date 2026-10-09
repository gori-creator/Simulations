/**
 * Rechenlogik „Umfang und Flächeninhalt von Rechtecken“ (Jahrgangsstufe 5).
 *
 * Figuren sind Vielecke mit ganzzahligen Ecken und waagerechten bzw.
 * senkrechten Seiten (Rechteck, L-Form). Der Flächeninhalt ist die Anzahl der
 * Einheitsquadrate (1 cm²), die hineinpassen, der Umfang die Länge des Wegs
 * einmal um die Figur herum. Alle Längen in cm, Koordinaten mit y nach oben,
 * die linke untere Ecke der Figur liegt im Ursprung.
 */

export type Pt = readonly [number, number];

/** Achsenparalleles Rechteck: linke untere Ecke (x | y), Breite w, Höhe h. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/* ------------------------------------------------------------------ */
/* Rechteck                                                            */
/* ------------------------------------------------------------------ */

/** Flächeninhalt eines Rechtecks: A = a · b. */
export function rectArea(a: number, b: number): number {
  return a * b;
}

/** Umfang eines Rechtecks: U = 2 · a + 2 · b = 2 · (a + b). */
export function rectPerimeter(a: number, b: number): number {
  return 2 * a + 2 * b;
}

/** Rechteck als Vieleck, gegen den Uhrzeigersinn ab der linken unteren Ecke. */
export function rectPolygon(a: number, b: number): Pt[] {
  return [
    [0, 0],
    [a, 0],
    [a, b],
    [0, b],
  ];
}

/* ------------------------------------------------------------------ */
/* L-Form                                                              */
/* ------------------------------------------------------------------ */

/**
 * L-Form: Rechteck a × b, aus dem rechts oben ein Rechteck c × d
 * herausgeschnitten ist (0 < c < a, 0 < d < b). Ecken gegen den
 * Uhrzeigersinn ab der linken unteren Ecke.
 */
export function lPolygon(a: number, b: number, c: number, d: number): Pt[] {
  return [
    [0, 0],
    [a, 0],
    [a, b - d],
    [a - c, b - d],
    [a - c, b],
    [0, b],
  ];
}

/** Lässt sich aus a × b überhaupt eine L-Form ausschneiden? (mindestens 1 cm Rand) */
export function canCut(a: number, b: number): boolean {
  return a >= 2 && b >= 2;
}

/** Gültige Ausschnittsgröße für die L-Form (mindestens 1 cm Ausschnitt und 1 cm Rand). */
export function clampCut(a: number, b: number, c: number, d: number): [number, number] {
  return [Math.max(1, Math.min(a - 1, c)), Math.max(1, Math.min(b - 1, d))];
}

/** Seitenlängen der L-Form in Laufrichtung: a, b − d, c, d, a − c, b. */
export function lSides(a: number, b: number, c: number, d: number): number[] {
  return sideLengths(lPolygon(a, b, c, d));
}

/** Flächeninhalt der L-Form: großes Rechteck minus Ausschnitt. */
export function lArea(a: number, b: number, c: number, d: number): number {
  return a * b - c * d;
}

/**
 * Umfang der L-Form. Er ist genauso groß wie der des umgebenden Rechtecks
 * a × b: Die beiden inneren Kanten (c und d) lassen sich nach außen schieben
 * und füllen dort genau die Lücken am Rand.
 */
export function lPerimeter(a: number, b: number, c: number, d: number): number {
  return polygonPerimeter(lPolygon(a, b, c, d));
}

/** Wege, den Flächeninhalt der L-Form zu bestimmen. */
export type Method = 'keine' | 'waag' | 'senk' | 'erg';

/**
 * Zerlegen oder Ergänzen der L-Form:
 * - `waag`: waagerechter Schnitt → unten a × (b − d), oben (a − c) × d,
 * - `senk`: senkrechter Schnitt → links (a − c) × b, rechts c × (b − d),
 * - `erg`: zum Rechteck a × b ergänzen und den Ausschnitt c × d abziehen.
 * Flächeninhalt = Summe von `parts` minus `minus`.
 */
export function lDecomposition(a: number, b: number, c: number, d: number, method: Method): { parts: Box[]; minus: Box | null } {
  if (method === 'waag')
    return {
      parts: [
        { x: 0, y: 0, w: a, h: b - d },
        { x: 0, y: b - d, w: a - c, h: d },
      ],
      minus: null,
    };
  if (method === 'senk')
    return {
      parts: [
        { x: 0, y: 0, w: a - c, h: b },
        { x: a - c, y: 0, w: c, h: b - d },
      ],
      minus: null,
    };
  if (method === 'erg') return { parts: [{ x: 0, y: 0, w: a, h: b }], minus: { x: a - c, y: b - d, w: c, h: d } };
  return { parts: [], minus: null };
}

/** Flächeninhalt aus einer Zerlegung (Summe der Teile minus Ausschnitt). */
export function decompositionArea(dec: { parts: Box[]; minus: Box | null }): number {
  return dec.parts.reduce((s, q) => s + q.w * q.h, 0) - (dec.minus ? dec.minus.w * dec.minus.h : 0);
}

/* ------------------------------------------------------------------ */
/* Allgemeine Vielecke                                                 */
/* ------------------------------------------------------------------ */

/** Flächeninhalt eines Vielecks (Gaußsche Trapezformel). */
export function polygonArea(poly: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!;
    const [x2, y2] = poly[(i + 1) % poly.length]!;
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}

/** Seitenlängen in Laufrichtung. */
export function sideLengths(poly: readonly Pt[]): number[] {
  return poly.map((p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    return Math.hypot(q[0] - p[0], q[1] - p[1]);
  });
}

/** Umfang: Summe der Seitenlängen. */
export function polygonPerimeter(poly: readonly Pt[]): number {
  return sideLengths(poly).reduce((s, l) => s + l, 0);
}

/** Liegt der Punkt im Vieleck? (Strahlverfahren) */
export function inside(poly: readonly Pt[], x: number, y: number): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/**
 * Einheitsquadrate in der Figur (linke untere Ecke jedes Quadrats), Reihe für
 * Reihe von unten nach oben und in jeder Reihe von links nach rechts – so,
 * wie man sie auslegen würde.
 */
export function unitCells(poly: readonly Pt[]): Pt[] {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const cells: Pt[] = [];
  for (let y = Math.floor(Math.min(...ys)); y < Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x < Math.ceil(Math.max(...xs)); x++) {
      if (inside(poly, x + 0.5, y + 0.5)) cells.push([x, y]);
    }
  }
  return cells;
}

/* ------------------------------------------------------------------ */
/* Weg um die Figur (für die Ameise)                                   */
/* ------------------------------------------------------------------ */

export interface WalkPoint {
  x: number;
  y: number;
  /** Laufrichtung in Grad (0 = nach rechts, gegen den Uhrzeigersinn). */
  dir: number;
  /** Index der Seite, auf der die Ameise gerade läuft. */
  side: number;
}

/** Position nach der Weglänge s (0 … Umfang) entlang des Vielecks. */
export function walkAt(poly: readonly Pt[], s: number): WalkPoint {
  const lens = sideLengths(poly);
  let rest = Math.max(0, s);
  for (let i = 0; i < poly.length; i++) {
    const l = lens[i]!;
    const [x1, y1] = poly[i]!;
    const [x2, y2] = poly[(i + 1) % poly.length]!;
    const dir = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    if (rest <= l || i === poly.length - 1) {
      const t = l > 0 ? Math.min(1, rest / l) : 0;
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, dir, side: i };
    }
    rest -= l;
  }
  return { x: poly[0]![0], y: poly[0]![1], dir: 0, side: 0 };
}

/* ------------------------------------------------------------------ */
/* Vergleichen: gleicher Umfang bzw. gleicher Flächeninhalt            */
/* ------------------------------------------------------------------ */

/** Alle Rechtecke mit ganzzahligen Seiten und dem Umfang u (a = 1, 2, …). */
export function rectsWithPerimeter(u: number): [number, number][] {
  const half = u / 2;
  const out: [number, number][] = [];
  if (!Number.isInteger(half)) return out;
  for (let a = 1; a < half; a++) out.push([a, half - a]);
  return out;
}

/** Alle Rechtecke mit ganzzahligen Seiten und dem Flächeninhalt A (a teilt A). */
export function rectsWithArea(area: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a <= area; a++) if (area % a === 0) out.push([a, area / a]);
  return out;
}

/** Nächstgelegene erlaubte Länge a in einer Liste von Rechtecken (bei Gleichstand die kleinere). */
export function nearestSide(list: readonly (readonly [number, number])[], a: number): number {
  let best = list[0]?.[0] ?? 1;
  for (const [x] of list) if (Math.abs(x - a) < Math.abs(best - a)) best = x;
  return best;
}

/** Rechtecke mit dem größten Flächeninhalt bei festem Umfang (das Quadrat bzw. die „quadratnächsten“). */
export function maxAreaRects(u: number): [number, number][] {
  const list = rectsWithPerimeter(u);
  const best = Math.max(...list.map(([a, b]) => a * b));
  return list.filter(([a, b]) => a * b === best);
}

/** Rechtecke mit dem kleinsten Umfang bei festem Flächeninhalt. */
export function minPerimeterRects(area: number): [number, number][] {
  const list = rectsWithArea(area);
  const best = Math.min(...list.map(([a, b]) => rectPerimeter(a, b)));
  return list.filter(([a, b]) => rectPerimeter(a, b) === best);
}

/**
 * Für eine Zeigerposition (x | y) das nächste Rechteck mit festem Umfang u:
 * Die Ecken aller dieser Rechtecke liegen auf der Geraden a + b = u / 2.
 */
export function snapToPerimeter(u: number, x: number, y: number): number {
  const half = u / 2;
  // Lotfußpunkt auf der Geraden a + b = half
  const a = (x - y + half) / 2;
  return Math.max(1, Math.min(half - 1, Math.round(a)));
}

/**
 * Für eine Zeigerposition (x | y) das nächste Rechteck mit festem
 * Flächeninhalt (die Ecken liegen auf der Kurve b = A / a).
 */
export function snapToArea(area: number, x: number, y: number): number {
  let best = 1;
  let bestD = Infinity;
  for (const [a, b] of rectsWithArea(area)) {
    const d = Math.hypot(a - x, b - y);
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Darstellung                                                         */
/* ------------------------------------------------------------------ */

/** „Schöne“ Schrittweite für eine Achse mit höchstens etwa `count` Teilstrichen. */
export function niceStep(max: number, count = 5): number {
  const raw = Math.max(1e-9, max / count);
  const p = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) if (m * p >= raw) return Math.max(1, m * p);
  return 10 * p;
}
