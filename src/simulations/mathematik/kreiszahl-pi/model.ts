/** Rechenlogik „Kreisumfang, Kreisfläche und die Zahl π“. */

/**
 * Archimedes: Umfang des einbeschriebenen bzw. umbeschriebenen n-Ecks geteilt
 * durch den Durchmesser – untere und obere Schranke für π.
 */
export function polygonBounds(n: number): { lower: number; upper: number } {
  return { lower: n * Math.sin(Math.PI / n), upper: n * Math.tan(Math.PI / n) };
}

/**
 * Ziellage von Sektor i (von n) beim Umlegen der Kreisfläche zu einem
 * „Parallelogramm“: Spitze und Drehung (zusätzlich zur Ausgangslage).
 * Sektoren mit geradem Index zeigen mit der Spitze nach oben, die anderen nach unten.
 * Die Seitenkanten benachbarter Sektoren liegen genau aufeinander.
 */
export function sectorTarget(i: number, n: number, r: number): { apex: [number, number]; rotation: number } {
  const delta = (2 * Math.PI) / n;
  const original = (i + 0.5) * delta;
  const up = i % 2 === 0;
  const target = up ? -Math.PI / 2 : Math.PI / 2;
  const half = r * Math.sin(delta / 2);
  return {
    apex: [i * half, up ? r * Math.cos(delta / 2) : 0],
    rotation: target - original,
  };
}

/** Breite der umgelegten Figur: n·r·sin(π/n) → π·r. */
export function rearrangedWidth(n: number, r: number): number {
  return n * r * Math.sin(Math.PI / n);
}

// ───────────────────────── Messen im Alltag ─────────────────────────

export type ObjectId = 'knopf' | 'dose' | 'tasse' | 'cd' | 'teller' | 'uhr';

export interface MeasuredObject {
  id: ObjectId;
  /** gemessener Durchmesser in cm */
  d: number;
  /** gemessener Umfang in cm (Maßband, mit kleinem Messfehler wie im Unterricht) */
  u: number;
}

/** Beispielmessungen (auf Millimeter gerundet, bewusst nicht exakt π · d). */
export const OBJECTS: readonly MeasuredObject[] = [
  { id: 'knopf', d: 2.0, u: 6.4 },
  { id: 'dose', d: 6.6, u: 20.6 },
  { id: 'tasse', d: 8.0, u: 25.3 },
  { id: 'cd', d: 12.0, u: 37.6 },
  { id: 'teller', d: 26.0, u: 81.9 },
  { id: 'uhr', d: 30.0, u: 94.0 },
];

/** Steigung der Ausgleichsgeraden U = k · d durch den Ursprung (kleinste Quadrate): k = Σ d·U / Σ d². */
export function slopeThroughOrigin(points: readonly { d: number; u: number }[]): number {
  let du = 0;
  let dd = 0;
  for (const { d, u } of points) {
    du += d * u;
    dd += d * d;
  }
  return dd > 0 ? du / dd : NaN;
}

// ───────────────────────── Üben ─────────────────────────

export type CircleQuantity = 'd' | 'r' | 'U' | 'A';

export interface CircleTask {
  given: CircleQuantity;
  value: number;
  find: CircleQuantity;
  /** exakte Lösung (mit π gerechnet) */
  answer: number;
}

const KINDS: readonly [CircleQuantity, CircleQuantity][] = [
  ['d', 'U'],
  ['r', 'A'],
  ['r', 'U'],
  ['d', 'A'],
  ['U', 'd'],
  ['A', 'r'],
];

/** Wert einer Kreisgröße aus dem Radius. */
export function fromRadius(q: CircleQuantity, r: number): number {
  switch (q) {
    case 'r':
      return r;
    case 'd':
      return 2 * r;
    case 'U':
      return 2 * Math.PI * r;
    case 'A':
      return Math.PI * r * r;
  }
}

/** Radius aus einer gegebenen Kreisgröße. */
export function toRadius(q: CircleQuantity, v: number): number {
  switch (q) {
    case 'r':
      return v;
    case 'd':
      return v / 2;
    case 'U':
      return v / (2 * Math.PI);
    case 'A':
      return Math.sqrt(v / Math.PI);
  }
}

/**
 * Reproduzierbare Aufgabe Nr. q. Die ersten vier Aufgaben (und danach jede
 * zweite) gehen „vorwärts“ (U oder A berechnen), die anderen „rückwärts“
 * (aus U bzw. A den Durchmesser bzw. Radius). Gegebene U und A sind auf eine
 * Nachkommastelle gerundet.
 */
export function circleTask(q: number, rand: () => number): CircleTask {
  const forward = q <= 4 || q % 2 === 1;
  const pool = KINDS.filter(([g]) => (forward ? g === 'd' || g === 'r' : g === 'U' || g === 'A'));
  const [given, find] = q <= 4 ? KINDS[(q - 1) % 4]! : pool[Math.floor(rand() * pool.length)]!;
  if (given === 'd' || given === 'r') {
    const value = given === 'd' ? 2 + 2 * Math.floor(rand() * 15) : 1 + Math.floor(rand() * 15);
    return { given, value, find, answer: fromRadius(find, toRadius(given, value)) };
  }
  // rückwärts: „runder“ Radius, gegebener Wert gerundet – gesucht wird aus dem gerundeten Wert
  const r = 2 + Math.floor(rand() * 14);
  const value = Math.round(fromRadius(given, r) * 10) / 10;
  return { given, value, find, answer: fromRadius(find, toRadius(given, value)) };
}

/** Erste Zahl in der Eingabe (Komma oder Punkt), sonst null. */
export function parseNumber(text: string): number | null {
  const m = text.replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(',', '.')) : null;
}

/** Richtig bei höchstens 0,5 % bzw. 0,05 Abweichung – Rechnen mit π ≈ 3,14 und Runden auf eine Nachkommastelle sind erlaubt. */
export function checkCircleAnswer(task: CircleTask, text: string): { ok: boolean; got: number | null } {
  const got = parseNumber(text);
  return { ok: got !== null && Math.abs(got - task.answer) <= Math.max(0.051, 0.005 * task.answer), got };
}
