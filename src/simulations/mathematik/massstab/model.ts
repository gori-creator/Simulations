/**
 * Rechenlogik zum Maßstab (Jahrgangsstufe 5).
 *
 * Alle Längen werden intern als ganze Zahl in Mikrometern (µm) geführt:
 * 1 mm = 1 000 µm, 1 cm = 10 000 µm, 1 m = 1 000 000 µm, 1 km = 10⁹ µm.
 * So bleiben alle Schulaufgaben exakt (auch 0,4 mm bei der Vergrößerung),
 * und 100 km passen bequem in den sicheren Ganzzahlbereich von JavaScript.
 *
 * Ein Maßstab ist ein Verhältnis „Bild : Wirklichkeit“ (bei Karten
 * „Karte : Wirklichkeit“): 1 : 25 000 heißt, 1 cm auf der Karte sind
 * 25 000 cm in Wirklichkeit; 10 : 1 heißt, 10 cm im Bild sind 1 cm in
 * Wirklichkeit (Vergrößerung).
 */

export type Lang = 'de' | 'en';

/** Längeneinheiten mit ihrem Wert in µm. */
export const UM = { mm: 1_000, cm: 10_000, dm: 100_000, m: 1_000_000, km: 1_000_000_000 } as const;
export type LenUnit = 'mm' | 'cm' | 'm' | 'km';

/** Maßstab „image : real“, beide positiv. Verkleinerung: image = 1, Vergrößerung: real = 1. */
export interface Scale {
  image: number;
  real: number;
}

export const reduction = (n: number): Scale => ({ image: 1, real: n });
export const enlargement = (n: number): Scale => ({ image: n, real: 1 });

/** Maßstäbe der Karte (Maßstabszahlen). */
export const MAP_SCALES = [5000, 25000, 50000, 100000] as const;
/** Vergrößerungen (Bild : Wirklichkeit = z : 1). */
export const ZOOM_SCALES = [2, 5, 10, 20, 50] as const;
/** Maßstäbe für Rechenaufgaben (vom Bauplan bis zur Straßenkarte). */
export const CALC_SCALES = [100, 1000, 5000, 10000, 25000, 50000, 100000, 200000] as const;

/** Gültiger Maßstab: zwei positive, endliche Zahlen. */
export function isValidScale(s: Scale | null | undefined): s is Scale {
  return !!s && Number.isFinite(s.image) && Number.isFinite(s.real) && s.image > 0 && s.real > 0;
}

/** Gültige Länge (µm): endlich und nicht negativ. */
export function isValidLength(um: number): boolean {
  return Number.isFinite(um) && um >= 0;
}

export interface Converted {
  /** Länge in µm (bei „exact = false“ gerundet auf ganze µm). */
  um: number;
  exact: boolean;
}

/** Bild- bzw. Kartenlänge → wirkliche Länge: Bildlänge · real : image. */
export function realFromImage(imageUm: number, s: Scale): Converted | null {
  if (!isValidLength(imageUm) || !isValidScale(s)) return null;
  const num = imageUm * s.real;
  if (num % s.image === 0) return { um: num / s.image, exact: true };
  return { um: Math.round(num / s.image), exact: false };
}

/** Wirkliche Länge → Bild- bzw. Kartenlänge: wirkliche Länge · image : real. */
export function imageFromReal(realUm: number, s: Scale): Converted | null {
  if (!isValidLength(realUm) || !isValidScale(s)) return null;
  const num = realUm * s.image;
  if (num % s.real === 0) return { um: num / s.real, exact: true };
  return { um: Math.round(num / s.real), exact: false };
}

/**
 * Maßstab aus Bild- und wirklicher Länge. Ist die Wirklichkeit größer, ergibt
 * sich eine Verkleinerung 1 : n, sonst eine Vergrößerung n : 1. Geht die
 * Division nicht auf, wird n auf eine ganze Zahl gerundet („exact = false“).
 */
export function scaleFromLengths(imageUm: number, realUm: number): { scale: Scale; exact: boolean } | null {
  if (!isValidLength(imageUm) || !isValidLength(realUm) || imageUm <= 0 || realUm <= 0) return null;
  if (realUm >= imageUm) {
    const exact = realUm % imageUm === 0;
    return { scale: reduction(exact ? realUm / imageUm : Math.round(realUm / imageUm)), exact };
  }
  const exact = imageUm % realUm === 0;
  return { scale: enlargement(exact ? imageUm / realUm : Math.round(imageUm / realUm)), exact };
}

/**
 * Kartenlänge in ganzen Millimetern für eine wirkliche Entfernung (in m) bei
 * der Maßstabszahl n – so, wie man sie mit dem Lineal abliest (auf 1 mm gerundet).
 */
export function mapMmFromMetres(metres: number, n: number): number {
  if (!Number.isFinite(metres) || metres <= 0 || !Number.isFinite(n) || n <= 0) return 0;
  return Math.round((metres * 1000) / n + 1e-9);
}

/** Wirkliche Länge (µm) für eine Kartenlänge in ganzen mm bei 1 : n. */
export function realUmFromMapMm(mapMm: number, n: number): number {
  return mapMm * UM.mm * n;
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

/** Tausendergliederung: DE mit schmalem Leerzeichen, EN mit Komma. */
export function groupDigits(int: string, lang: Lang): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'de' ? ' ' : ',');
}

/** Ganze Zahl gegliedert (ab 10 000 bzw. ab 1 000 bei EN; DE gliedert ab 1 000 wie im Schulbuch). */
export function intText(v: number, lang: Lang): string {
  const s = String(Math.round(Math.abs(v)));
  return `${v < 0 ? '−' : ''}${groupDigits(s, lang)}`;
}

/**
 * Länge in µm exakt als Dezimalzahl in der Einheit `unit` (ohne Einheit):
 * 1 500 000 000 µm in km → „1,5“. Nicht aufgehende Werte werden auf
 * `maxDec` Nachkommastellen gerundet.
 */
export function decimalIn(um: number, unit: LenUnit, lang: Lang, maxDec = 6): { text: string; exact: boolean } {
  if (!Number.isFinite(um)) return { text: '–', exact: false };
  const f = UM[unit];
  const neg = um < 0;
  let a = Math.abs(um);
  let exact = Number.isInteger(a);
  if (!exact) a = Math.round(a);
  let int = Math.floor(a / f);
  let frac = String(a % f)
    .padStart(String(f).length - 1, '0')
    .replace(/0+$/, '');
  if (frac.length > maxDec) {
    exact = false;
    const scaled = Math.round((a / f) * 10 ** maxDec);
    int = Math.floor(scaled / 10 ** maxDec);
    frac = String(scaled % 10 ** maxDec)
      .padStart(maxDec, '0')
      .replace(/0+$/, '');
  }
  const i = groupDigits(String(int), lang);
  const body = frac ? `${i}${lang === 'de' ? ',' : '.'}${frac}` : i;
  return { text: `${neg && (int > 0 || frac) ? '−' : ''}${body}`, exact };
}

/** Passende Einheit für eine Länge: ab 1 km in km, ab 1 m in m, ab 1 cm in cm, sonst mm. */
export function bestUnit(um: number): LenUnit {
  const a = Math.abs(um);
  if (a >= UM.km) return 'km';
  if (a >= UM.m) return 'm';
  if (a >= UM.cm) return 'cm';
  return 'mm';
}

/** Länge mit passender (oder vorgegebener) Einheit, z. B. „1,5 km“, „50 m“, „0,4 mm“. */
export function lengthText(um: number, lang: Lang, unit: LenUnit = bestUnit(um)): string {
  return `${decimalIn(um, unit, lang).text} ${unit}`;
}

/** Maßstab als Text: „1 : 25 000“ bzw. „10 : 1“. */
export function scaleText(s: Scale, lang: Lang): string {
  return `${intText(s.image, lang)} : ${intText(s.real, lang)}`;
}

/**
 * Darstellungen einer Länge in immer größeren (bzw. kleineren) Einheiten,
 * wie man sie in einer Rechnung hintereinander schreibt:
 * 100 000 cm = 1 000 m = 1 km. Beginnt bei `from` und endet bei der
 * passenden Einheit; Zwischenschritte nur, wenn sie aufgehen.
 */
export function unitChain(um: number, from: LenUnit = 'cm'): { unit: LenUnit; text: (lang: Lang) => string }[] {
  const order: LenUnit[] = ['mm', 'cm', 'm', 'km'];
  const target = bestUnit(um);
  const i0 = order.indexOf(from);
  const i1 = order.indexOf(um === 0 ? from : target);
  const units = i1 >= i0 ? order.slice(i0, i1 + 1) : order.slice(i1, i0 + 1).reverse();
  return units.map((unit) => ({ unit, text: (lang: Lang) => lengthText(um, lang, unit) }));
}

/* ------------------------------------------------------------------ */
/* Wegstrecke entlang der Straßen                                      */
/* ------------------------------------------------------------------ */

export interface Pt {
  x: number;
  y: number;
}

/** Straßennetz: Knoten (in m) und ungerichtete Kanten (gerade Abschnitte). */
export interface RoadGraph {
  nodes: readonly Pt[];
  edges: readonly (readonly [number, number])[];
}

export const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

/** Nächster Punkt auf einer Strecke ab. */
export function closestOnSegment(p: Pt, a: Pt, b: Pt): { pt: Pt; t: number; d: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  const pt = { x: a.x + dx * t, y: a.y + dy * t };
  return { pt, t, d: dist(p, pt) };
}

/** Nächster Punkt im Straßennetz. */
export function snapToGraph(g: RoadGraph, p: Pt): { pt: Pt; edge: number; t: number; d: number } | null {
  let best: { pt: Pt; edge: number; t: number; d: number } | null = null;
  g.edges.forEach(([i, j], e) => {
    const c = closestOnSegment(p, g.nodes[i]!, g.nodes[j]!);
    if (!best || c.d < best.d) best = { ...c, edge: e };
  });
  return best;
}

/**
 * Kürzester Weg im Straßennetz von a nach b (beide werden zuerst auf die
 * nächste Straße gesetzt). Ergebnis: Knickpunkte des Weges, beginnend am
 * Startpunkt, endend am Zielpunkt (Dijkstra).
 */
export function shortestRoute(g: RoadGraph, a: Pt, b: Pt): Pt[] {
  const sa = snapToGraph(g, a);
  const sb = snapToGraph(g, b);
  if (!sa || !sb) return [];
  const n = g.nodes.length;
  const S = n;
  const T = n + 1;
  const pts: Pt[] = [...g.nodes, sa.pt, sb.pt];
  const adj: [number, number][][] = Array.from({ length: n + 2 }, () => []);
  const link = (i: number, j: number) => {
    const w = dist(pts[i]!, pts[j]!);
    adj[i]!.push([j, w]);
    adj[j]!.push([i, w]);
  };
  g.edges.forEach(([i, j], e) => {
    if (e !== sa.edge && e !== sb.edge) link(i, j);
  });
  // Kanten mit Start- bzw. Zielpunkt aufteilen
  const split = (e: number, extra: { idx: number; t: number }[]) => {
    const [i, j] = g.edges[e]!;
    const seq = [{ idx: i, t: 0 }, ...extra.sort((p, q) => p.t - q.t), { idx: j, t: 1 }];
    for (let k = 0; k + 1 < seq.length; k++) link(seq[k]!.idx, seq[k + 1]!.idx);
  };
  if (sa.edge === sb.edge) split(sa.edge, [{ idx: S, t: sa.t }, { idx: T, t: sb.t }]);
  else {
    split(sa.edge, [{ idx: S, t: sa.t }]);
    split(sb.edge, [{ idx: T, t: sb.t }]);
  }
  const best = new Array<number>(n + 2).fill(Infinity);
  const prev = new Array<number>(n + 2).fill(-1);
  const done = new Array<boolean>(n + 2).fill(false);
  best[S] = 0;
  for (;;) {
    let u = -1;
    for (let i = 0; i < n + 2; i++) if (!done[i] && best[i]! < Infinity && (u < 0 || best[i]! < best[u]!)) u = i;
    if (u < 0 || u === T) break;
    done[u] = true;
    for (const [v, w] of adj[u]!) {
      if (best[u]! + w < best[v]!) {
        best[v] = best[u]! + w;
        prev[v] = u;
      }
    }
  }
  if (best[T] === Infinity) return [];
  const path: Pt[] = [];
  for (let v = T; v >= 0; v = prev[v]!) {
    path.push(pts[v]!);
    if (v === S) break;
  }
  path.reverse();
  // gleiche aufeinanderfolgende Punkte und gerade weiterlaufende Knicke entfernen
  const out: Pt[] = [];
  for (const p of path) {
    const last = out[out.length - 1];
    if (last && dist(last, p) < 0.5) continue;
    if (out.length >= 2) {
      const a0 = out[out.length - 2]!;
      const cross = (last!.x - a0.x) * (p.y - a0.y) - (last!.y - a0.y) * (p.x - a0.x);
      if (Math.abs(cross) < 1e-6 * Math.max(1, dist(a0, p) ** 2)) out.pop();
    }
    out.push(p);
  }
  return out;
}

/** Länge eines Linienzugs (in m). */
export function polylineLength(pts: readonly Pt[]): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1]!, pts[i]!);
  return s;
}

/**
 * Wegstrecke abschnittsweise messen: Jeder gerade Abschnitt wird auf der
 * Karte auf 1 mm gerundet, dann werden die Abschnitte addiert – so wie man es
 * mit dem Lineal macht. Abschnitte, die auf 0 mm fallen, werden an den
 * nächsten angehängt.
 */
export function routePiecesMm(pts: readonly Pt[], n: number): { mm: number[]; total: number; from: number[] } {
  const mm: number[] = [];
  const from: number[] = [];
  let carry = 0;
  let start = 0;
  for (let i = 1; i < pts.length; i++) {
    carry += dist(pts[i - 1]!, pts[i]!);
    const m = mapMmFromMetres(carry, n);
    if (m > 0 || i === pts.length - 1) {
      if (m > 0 || mm.length === 0) {
        mm.push(m);
        from.push(start);
      }
      carry = 0;
      start = i;
    }
  }
  return { mm, total: mm.reduce((a, b) => a + b, 0), from };
}

/* ------------------------------------------------------------------ */
/* Rechenaufgaben                                                      */
/* ------------------------------------------------------------------ */

export type Sought = 'real' | 'map' | 'scale';

export interface CalcTask {
  sought: Sought;
  /** Kartenlänge in mm */
  mapMm: number;
  /** Maßstabszahl n (1 : n) */
  n: number;
}

/** Zufällige, gut rechenbare Aufgabe: Kartenlänge in halben bzw. ganzen cm, wirkliche Länge ab 1 m. */
export function randomCalcTask(rnd: () => number, sought?: Sought): CalcTask {
  const kinds: Sought[] = ['real', 'map', 'scale'];
  const s = sought ?? kinds[Math.floor(rnd() * kinds.length) % kinds.length]!;
  for (let guard = 0; guard < 50; guard++) {
    const n = CALC_SCALES[Math.floor(rnd() * CALC_SCALES.length) % CALC_SCALES.length]!;
    const half = rnd() < 0.35;
    const mapMm = half ? 5 * (3 + Math.floor(rnd() * 28)) : 10 * (1 + Math.floor(rnd() * 15));
    const real = realUmFromMapMm(mapMm, n);
    if (real < UM.m || real > 60 * UM.km) continue;
    return { sought: s, mapMm, n };
  }
  return { sought: s, mapMm: 40, n: 25000 };
}

/**
 * Lösung einer Rechenaufgabe aus Kartenlänge (µm), wirklicher Länge (µm) und
 * Maßstabszahl n – je nachdem, was gesucht ist, werden die anderen beiden
 * benutzt.
 */
export function solve(sought: Sought, mapUm: number, realUm: number, n: number): { mapUm: number; realUm: number; n: number; exact: boolean } | null {
  if (sought === 'real') {
    const r = realFromImage(mapUm, reduction(n));
    return r ? { mapUm, realUm: r.um, n, exact: r.exact } : null;
  }
  if (sought === 'map') {
    const m = imageFromReal(realUm, reduction(n));
    return m ? { mapUm: m.um, realUm, n, exact: m.exact } : null;
  }
  const s = scaleFromLengths(mapUm, realUm);
  if (!s || s.scale.image !== 1) return null;
  return { mapUm, realUm, n: s.scale.real, exact: s.exact };
}

/* ------------------------------------------------------------------ */
/* Vergrößerung                                                        */
/* ------------------------------------------------------------------ */

export type ObjId = 'bug' | 'ant' | 'stamp' | 'sand';

/** Kleine Objekte mit typischer (gerundeter) Länge in µm. */
export const OBJECTS: Record<ObjId, { lengthUm: number }> = {
  stamp: { lengthUm: 20 * UM.mm },
  bug: { lengthUm: 7 * UM.mm },
  ant: { lengthUm: 5 * UM.mm },
  sand: { lengthUm: 400 },
};
