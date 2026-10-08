/**
 * Rechenlogik „Punkte, Geraden und Kreise: Lagebeziehungen“ (Jahrgangsstufe 5).
 *
 * Alle Punkte liegen auf Gitterpunkten des Koordinatensystems (ganzzahlige
 * Koordinaten), der Radius ist ein Vielfaches von 0,5. Damit lassen sich
 * „senkrecht“, „parallel“ und „Tangente“ exakt mit ganzen Zahlen entscheiden
 * (Kreuz- und Skalarprodukt), ohne Rundungsfehler.
 *
 * Längen (Abstand, Streckenlänge) sind dagegen oft keine „schönen“ Zahlen.
 * In der 5. Klasse werden sie gemessen; die Simulation gibt sie deshalb auf
 * Millimeter gerundet an (1 Längeneinheit = 1 cm).
 */

export type Pt = readonly [number, number];
export type Lang = 'de' | 'en';

/** Sichtbarer Bereich des Koordinatensystems (1. Quadrant). */
export const X_MAX = 10;
export const Y_MAX = 8;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
/** Kreuzprodukt (z-Komponente): 0 genau dann, wenn die Vektoren parallel sind. */
export const cross = (u: Pt, v: Pt): number => u[0] * v[1] - u[1] * v[0];
/** Skalarprodukt: 0 genau dann, wenn die Vektoren senkrecht sind. */
export const dot = (u: Pt, v: Pt): number => u[0] * v[0] + u[1] * v[1];

export const samePoint = (a: Pt, b: Pt): boolean => a[0] === b[0] && a[1] === b[1];

/** Länge der Strecke [AB]. */
export function distance(a: Pt, b: Pt): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Lotfußpunkt F des Lots von P auf die Gerade AB. */
export function foot(p: Pt, a: Pt, b: Pt): Pt {
  const u = sub(b, a);
  const k = dot(sub(p, a), u) / dot(u, u);
  return [a[0] + k * u[0], a[1] + k * u[1]];
}

/** Abstand des Punktes P von der Geraden AB (Länge des Lots). */
export function pointLineDistance(p: Pt, a: Pt, b: Pt): number {
  const u = sub(b, a);
  return Math.abs(cross(u, sub(p, a))) / Math.hypot(u[0], u[1]);
}

/** Liegt P auf der Geraden AB? (exakt) */
export function onLine(p: Pt, a: Pt, b: Pt): boolean {
  return cross(sub(b, a), sub(p, a)) === 0;
}

/** Schnittpunkt der Geraden AB und CD (null, wenn parallel oder identisch). */
export function intersection(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const u = sub(b, a);
  const v = sub(d, c);
  const den = cross(u, v);
  if (den === 0) return null;
  const k = cross(sub(c, a), v) / den;
  return [a[0] + k * u[0], a[1] + k * u[1]];
}

/** Lage zweier Geraden g = AB und h = CD zueinander. */
export type LineRelation =
  | { kind: 'perpendicular'; s: Pt }
  | { kind: 'intersecting'; s: Pt; angle: number }
  | { kind: 'parallel'; distance: number }
  | { kind: 'identical' };

export function lineRelation(a: Pt, b: Pt, c: Pt, d: Pt): LineRelation {
  const u = sub(b, a);
  const v = sub(d, c);
  if (cross(u, v) === 0) {
    if (onLine(c, a, b)) return { kind: 'identical' };
    return { kind: 'parallel', distance: pointLineDistance(c, a, b) };
  }
  const s = intersection(a, b, c, d)!;
  if (dot(u, v) === 0) return { kind: 'perpendicular', s };
  // Kleinerer der beiden Schnittwinkel (zwischen 0° und 90°)
  const cos = Math.abs(dot(u, v)) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]));
  return { kind: 'intersecting', s, angle: (Math.acos(Math.min(1, cos)) * 180) / Math.PI };
}

/** Lage von Kreis (Mittelpunkt M, Radius r) und Gerade AB. */
export type CircleRelation =
  | { kind: 'passante'; distance: number; points: [] }
  | { kind: 'tangente'; distance: number; points: [Pt] }
  | { kind: 'sekante'; distance: number; points: [Pt, Pt] };

/**
 * Passante (kein gemeinsamer Punkt), Tangente (genau einer) oder Sekante
 * (zwei). Entschieden wird exakt: Abstand² = cross² / |AB|² wird mit r²
 * verglichen, beides mit 4 erweitert, damit r = k/2 ganzzahlig wird.
 */
export function circleLine(m: Pt, r: number, a: Pt, b: Pt): CircleRelation {
  const u = sub(b, a);
  const len2 = dot(u, u);
  const c = cross(u, sub(m, a));
  const r2 = Math.round(2 * r);
  const lhs = 4 * c * c; // (2·Abstand)² · |AB|²
  const rhs = r2 * r2 * len2; // (2r)² · |AB|²
  const d = Math.abs(c) / Math.sqrt(len2);
  const f = foot(m, a, b);
  if (lhs > rhs) return { kind: 'passante', distance: d, points: [] };
  if (lhs === rhs) return { kind: 'tangente', distance: d, points: [f] };
  // Halbe Sehnenlänge nach Pythagoras (nur für die Zeichnung)
  const h = Math.sqrt(Math.max(0, r * r - d * d));
  const k = h / Math.sqrt(len2);
  return {
    kind: 'sekante',
    distance: d,
    points: [
      [f[0] - k * u[0], f[1] - k * u[1]],
      [f[0] + k * u[0], f[1] + k * u[1]],
    ],
  };
}

/** Lage eines Punktes zum Kreis. */
export function pointCircle(p: Pt, m: Pt, r: number): 'inside' | 'on' | 'outside' {
  // exakt: (2·|PM|)² mit (2r)² vergleichen
  const d2 = 4 * ((p[0] - m[0]) ** 2 + (p[1] - m[1]) ** 2);
  const r2 = Math.round(2 * r) ** 2;
  return d2 < r2 ? 'inside' : d2 === r2 ? 'on' : 'outside';
}

/* ------------------------------------------------------------------ */
/* Messen                                                              */
/* ------------------------------------------------------------------ */

/** Gemessene Länge in cm: auf Millimeter gerundet. */
export function measured(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Ist die Länge exakt (auf Millimeter genau) ablesbar, also ohne Rundung? */
export function isExactLength(v: number): boolean {
  return Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
}

/* ------------------------------------------------------------------ */
/* Punkte-Spiel                                                        */
/* ------------------------------------------------------------------ */

export type TaskKind = 'set' | 'read';

export interface Task {
  kind: TaskKind;
  /** Gesuchter bzw. abzulesender Punkt. */
  x: number;
  y: number;
  /** Antwortmöglichkeiten beim Ablesen (genau eine ist richtig). */
  options: Pt[];
}

/** Antwort einordnen – für eine gezielte Rückmeldung. */
export type Verdict = 'correct' | 'swapped' | 'near' | 'wrong';

export function judge(target: Pt, answer: Pt): Verdict {
  if (samePoint(target, answer)) return 'correct';
  if (target[0] !== target[1] && answer[0] === target[1] && answer[1] === target[0]) return 'swapped';
  if (Math.abs(answer[0] - target[0]) + Math.abs(answer[1] - target[1]) === 1) return 'near';
  return 'wrong';
}

const randInt = (rand: () => number, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

/**
 * Antwortmöglichkeiten beim Ablesen: die richtige, die vertauschte (typischer
 * Fehler) und Nachbarpunkte (um eins verzählt), gemischt.
 */
export function readOptions(x: number, y: number, rand: () => number): Pt[] {
  const inside = (p: Pt) => p[0] >= 0 && p[0] <= X_MAX && p[1] >= 0 && p[1] <= Y_MAX;
  const cands: Pt[] = [];
  if (x !== y && inside([y, x])) cands.push([y, x]);
  const near: Pt[] = [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
    [y + 1, x],
    [y, x + 1],
    [x + 1, y + 1],
    [x - 1, y - 1],
  ];
  // Nachbarn zufällig mischen, dann auffüllen
  for (let i = near.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [near[i], near[j]] = [near[j]!, near[i]!];
  }
  // Am Rand fehlen manche Nachbarn: dann weiter entfernte Punkte nehmen
  const far: Pt[] = [
    [x + 1, y - 1],
    [x - 1, y + 1],
    [x + 2, y],
    [x - 2, y],
    [x, y + 2],
    [x, y - 2],
  ];
  for (const p of [...near, ...far]) {
    if (cands.length >= 3) break;
    if (!inside(p) || samePoint(p, [x, y]) || cands.some((q) => samePoint(q, p))) continue;
    cands.push(p);
  }
  const all: Pt[] = [[x, y], ...cands];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  return all;
}

/**
 * Neue Aufgabe. Etwa jede fünfte Aufgabe liegt auf einer Achse (z. B. (0 | 4)),
 * weil das erfahrungsgemäß schwerer fällt. Der Punkt wiederholt sich nicht.
 */
export function makeTask(rand: () => number, kind: TaskKind, prev?: Pt): Task {
  let x = 0;
  let y = 0;
  for (let tries = 0; tries < 20; tries++) {
    const onAxis = rand() < 0.2;
    if (onAxis) {
      if (rand() < 0.5) {
        x = 0;
        y = randInt(rand, 1, Y_MAX);
      } else {
        x = randInt(rand, 1, X_MAX);
        y = 0;
      }
    } else {
      x = randInt(rand, 1, X_MAX);
      y = randInt(rand, 1, Y_MAX);
    }
    if (!prev || !samePoint(prev, [x, y])) break;
  }
  return { kind, x, y, options: kind === 'read' ? readOptions(x, y, rand) : [] };
}

/** Punkt in Schulschreibweise: DE „(3 | 5)“, EN „(3, 5)“. */
export function pointText(x: number, y: number, lang: Lang): string {
  const n = (v: number) => {
    const s = String(Math.round(v * 100) / 100);
    return (lang === 'de' ? s.replace('.', ',') : s).replace('-', '−');
  };
  return lang === 'de' ? `(${n(x)} | ${n(y)})` : `(${n(x)}, ${n(y)})`;
}
