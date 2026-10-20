/**
 * Rechenlogik für „Vierfeldertafel und Mengendiagramm“: Vierfeldertafel aus
 * vier Anzahlen, Randsummen, (bedingte) Wahrscheinlichkeiten als Brüche,
 * Ereignisse aus A und B (Schnitt, Vereinigung, Gegenereignis …),
 * Additionssatz und die Geometrie eines flächentreuen Mengendiagramms (zwei
 * Kreise mit passender Überlappung). Keine Zeichenbefehle.
 */

/** Zellen in fester Reihenfolge: A∩B, A∩B̄, Ā∩B, Ā∩B̄. */
export type Cells = readonly [number, number, number, number];
export const CELL_NAMES = ['A ∩ B', 'A ∩ B̄', 'Ā ∩ B', 'Ā ∩ B̄'] as const;

export interface Table {
  cells: Cells;
  /** Randsummen: |A|, |Ā|, |B|, |B̄| und Gesamtzahl. */
  A: number;
  nA: number;
  B: number;
  nB: number;
  N: number;
}

export function table(c: Cells): Table {
  const [ab, anb, nab, nanb] = c;
  return { cells: c, A: ab + anb, nA: nab + nanb, B: ab + nab, nB: anb + nanb, N: ab + anb + nab + nanb };
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Gekürzter Bruch k/n (für die Anzeige). */
export function reduce(k: number, n: number): { n: number; d: number } {
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(k, n);
  return { n: k / g, d: n / g };
}

export type EventId = 'none' | 'A' | 'B' | 'nA' | 'nB' | 'AB' | 'AuB' | 'AnB' | 'nAB' | 'xor' | 'none2';

/** Welche Zellen gehören zum Ereignis? (Reihenfolge wie `Cells`) */
export function eventCells(ev: EventId): boolean[] {
  switch (ev) {
    case 'A':
      return [true, true, false, false];
    case 'B':
      return [true, false, true, false];
    case 'nA':
      return [false, false, true, true];
    case 'nB':
      return [false, true, false, true];
    case 'AB':
      return [true, false, false, false];
    case 'AuB':
      return [true, true, true, false];
    case 'AnB':
      return [false, true, false, false];
    case 'nAB':
      return [false, false, true, false];
    case 'xor':
      return [false, true, true, false];
    case 'none2':
      return [false, false, false, true];
    default:
      return [false, false, false, false];
  }
}

/** Anzahl der Fälle im Ereignis. */
export function eventCount(c: Cells, ev: EventId): number {
  const m = eventCells(ev);
  return c.reduce((s, v, i) => s + (m[i] ? v : 0), 0);
}

/** P(E) = |E| / N. */
export function prob(c: Cells, ev: EventId): number {
  const N = table(c).N;
  return N > 0 ? eventCount(c, ev) / N : 0;
}

/** Additionssatz: P(A ∪ B) = P(A) + P(B) − P(A ∩ B). */
export function additionRule(c: Cells): { pA: number; pB: number; pAB: number; pAuB: number } {
  const t = table(c);
  const N = t.N || 1;
  return { pA: t.A / N, pB: t.B / N, pAB: c[0] / N, pAuB: (t.A + t.B - c[0]) / N };
}

/**
 * Bedingte Wahrscheinlichkeiten für den Baum. Reihenfolge 'AB': erst A/Ā,
 * dann B/B̄; 'BA': erst B/B̄, dann A/Ā. Ergebnis je Ast als (Zähler, Nenner)
 * in Anzahlen (ungekürzt), damit „7 von 14“ sichtbar bleibt.
 */
export function treeBranches(c: Cells, order: 'AB' | 'BA'): {
  first: [{ k: number; n: number }, { k: number; n: number }];
  second: [[{ k: number; n: number }, { k: number; n: number }], [{ k: number; n: number }, { k: number; n: number }]];
  /** Zellenindex je Blatt (oben nach unten). */
  leafCells: [number, number, number, number];
} {
  const t = table(c);
  if (order === 'AB') {
    return {
      first: [
        { k: t.A, n: t.N },
        { k: t.nA, n: t.N },
      ],
      second: [
        [
          { k: c[0], n: t.A },
          { k: c[1], n: t.A },
        ],
        [
          { k: c[2], n: t.nA },
          { k: c[3], n: t.nA },
        ],
      ],
      leafCells: [0, 1, 2, 3],
    };
  }
  return {
    first: [
      { k: t.B, n: t.N },
      { k: t.nB, n: t.N },
    ],
    second: [
      [
        { k: c[0], n: t.B },
        { k: c[2], n: t.B },
      ],
      [
        { k: c[1], n: t.nB },
        { k: c[3], n: t.nB },
      ],
    ],
    leafCells: [0, 2, 1, 3],
  };
}

/** Bedingte Wahrscheinlichkeit P_A(B) = |A ∩ B| / |A| (0, wenn |A| = 0). */
export function condBgivenA(c: Cells): number {
  const t = table(c);
  return t.A > 0 ? c[0] / t.A : 0;
}

/** Sind A und B (stochastisch) unabhängig? P(A ∩ B) = P(A) · P(B) bzw. |A∩B| · N = |A| · |B|. */
export function independent(c: Cells): boolean {
  const t = table(c);
  return c[0] * t.N === t.A * t.B;
}

/* ------------------------------------------------------------------ */
/* Flächentreues Mengendiagramm                                        */
/* ------------------------------------------------------------------ */

/** Fläche der Linse zweier Kreise mit Radien r1, r2 und Mittelpunktsabstand d. */
export function lensArea(r1: number, r2: number, d: number): number {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  const k = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  return a + b - k;
}

/**
 * Abstand der Kreismittelpunkte, sodass die Überlappung die Fläche `overlap`
 * hat (Bisektion; die Linsenfläche fällt mit wachsendem Abstand).
 */
export function distanceForOverlap(r1: number, r2: number, overlap: number): number {
  const lo0 = Math.abs(r1 - r2);
  const hi0 = r1 + r2;
  const maxA = Math.PI * Math.min(r1, r2) ** 2;
  if (overlap <= 0) return hi0;
  if (overlap >= maxA) return lo0;
  let lo = lo0;
  let hi = hi0;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (lensArea(r1, r2, mid) > overlap) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Geometrie des Mengendiagramms für Grundmenge der Fläche `area`: Radien so,
 * dass Kreisflächen ∝ |A| und |B|, Abstand so, dass Überlappung ∝ |A ∩ B|.
 */
export function vennGeometry(c: Cells, area: number): { rA: number; rB: number; d: number } {
  const t = table(c);
  const N = t.N || 1;
  const rA = Math.sqrt(((t.A / N) * area) / Math.PI);
  const rB = Math.sqrt(((t.B / N) * area) / Math.PI);
  const d = distanceForOverlap(rA, rB, (c[0] / N) * area);
  return { rA, rB, d };
}

/** Beispiel-Datensätze. */
export const CONTEXT_DATA: Record<'pet' | 'club' | 'abc', Cells> = {
  pet: [10, 4, 9, 7],
  club: [46, 34, 52, 68],
  abc: [12, 18, 8, 22],
};

/* ------------------------------------------------------------------ */
/* Wahrscheinlichkeiten aus dem Baum, umgekehrter Baum                 */
/* ------------------------------------------------------------------ */

/** Zellwahrscheinlichkeiten (A∩B, A∩B̄, Ā∩B, Ā∩B̄) aus P(A), P_A(B) und P_Ā(B) (Pfadregel). */
export function cellsFromTree(pA: number, pBgA: number, pBgNA: number): [number, number, number, number] {
  return [pA * pBgA, pA * (1 - pBgA), (1 - pA) * pBgNA, (1 - pA) * (1 - pBgNA)];
}

/** Umgekehrter Baum: P(B), P_B(A), P_B̄(A) (Summenregel und Formel von Bayes). */
export function reverseTree(pA: number, pBgA: number, pBgNA: number): { pB: number; pAgB: number; pAgNB: number } {
  const [ab, anb] = cellsFromTree(pA, pBgA, pBgNA);
  const pB = pA * pBgA + (1 - pA) * pBgNA;
  return { pB, pAgB: pB > 0 ? ab / pB : 0, pAgNB: pB < 1 ? anb / (1 - pB) : 0 };
}

/** Unabhängig genau dann, wenn P_A(B) = P_Ā(B) (dann ist beides gleich P(B)). */
export const independentTree = (pBgA: number, pBgNA: number, eps = 1e-9): boolean => Math.abs(pBgA - pBgNA) < eps;

/* ------------------------------------------------------------------ */
/* Tafel ergänzen: Werte aus Zeilen- und Spaltensummen erschließen    */
/* ------------------------------------------------------------------ */

/**
 * Die neun Werte der Tafel zeilenweise: [A∩B, A∩B̄, |A|, Ā∩B, Ā∩B̄, |Ā|, |B|, |B̄|, N].
 * Jede Zeile und jede Spalte ist eine Summe: a + b = Summe.
 */
export function tableValues(c: Cells): number[] {
  const t = table(c);
  return [c[0], c[1], t.A, c[2], c[3], t.nA, t.B, t.nB, t.N];
}

/** Summenbeziehungen der Tafel als [Summand, Summand, Summe] (Indizes wie `tableValues`). */
export const SUMS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

export interface SolveStep {
  /** Gesuchter Wert. */
  target: number;
  /** Die beiden bekannten Werte, aus denen er folgt. */
  from: [number, number];
  /** Summe zweier Werte oder Differenz (erster minus zweiter). */
  op: '+' | '−';
}

/** Lässt sich Wert `idx` aus den bekannten Werten direkt erschließen? */
export function solveStep(known: readonly boolean[], idx: number): SolveStep | null {
  for (const [a, b, s] of SUMS) {
    if (idx === s && known[a] && known[b]) return { target: idx, from: [a, b], op: '+' };
    if (idx === a && known[s] && known[b]) return { target: idx, from: [s, b], op: '−' };
    if (idx === b && known[s] && known[a]) return { target: idx, from: [s, a], op: '−' };
  }
  return null;
}

/** Reihenfolge, in der sich alle Werte erschließen lassen (leer bzw. unvollständig, wenn nicht lösbar). */
export function solveAll(known0: readonly boolean[]): SolveStep[] {
  const known = known0.slice();
  const steps: SolveStep[] = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < 9; i++) {
      if (known[i]) continue;
      const st = solveStep(known, i);
      if (st) {
        steps.push(st);
        known[i] = true;
        progress = true;
      }
    }
  }
  return steps;
}

/** Vorgaben für „Tafel ergänzen“: welche Werte bekannt sind. */
export const GIVEN_SETS: Record<'g1' | 'g2' | 'g3', number[]> = {
  /** Schnitt, beide Randsummen von A und B, Gesamtzahl. */
  g1: [0, 2, 6, 8],
  /** |A|, A ∩ B̄, Ā ∩ B, Gesamtzahl. */
  g2: [1, 2, 3, 8],
  /** die vier inneren Felder. */
  g3: [0, 1, 3, 4],
};
