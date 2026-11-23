/**
 * Rechenlogik für Übergangsmatrizen (Markov-Ketten) und Populationsmatrizen.
 *
 * Schreibweise wie im Unterricht: Die Matrix M wirkt von links auf den
 * Zustandsvektor (Spaltenvektor), x_{n+1} = M · x_n. Der Eintrag M[i][j]
 * (Zeile i, Spalte j) ist der Anteil, der in einem Schritt von Zustand j
 * nach Zustand i wechselt. Bei einer stochastischen Übergangsmatrix ist
 * deshalb jede **Spaltensumme** gleich 1.
 *
 * Alles hier ist reine Mathematik ohne Zeichnen und wird in
 * tests/uebergangsmatrizen.test.ts geprüft.
 */

/** Matrix als Liste von Zeilen: M[i][j] = Übergang von j nach i. */
export type Mat = number[][];
/** Zustandsvektor (Spaltenvektor). */
export type Vec = number[];

/** Toleranz für „gleich“ bei Gleitkommazahlen. */
export const EPS = 1e-9;

/** Einheitsmatrix der Größe n. */
export function identity(n: number): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

/** Matrix mal Vektor: (M · x)_i = Σ_j M[i][j] · x_j. */
export function mulMV(m: Mat, x: Vec): Vec {
  return m.map((row) => row.reduce((s, a, j) => s + a * (x[j] ?? 0), 0));
}

/** Matrix mal Matrix. */
export function mulMM(a: Mat, b: Mat): Mat {
  const n = a.length;
  const k = b[0]?.length ?? 0;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: k }, (_, j) => a[i]!.reduce((s, v, l) => s + v * (b[l]?.[j] ?? 0), 0)),
  );
}

/**
 * Matrixpotenz M^k für ganze k ≥ 0 (schnelles Potenzieren); für k < 0 die
 * Potenz der Inversen (null, wenn M nicht invertierbar ist).
 */
export function matPow(m: Mat, k: number): Mat | null {
  let base: Mat | null = m;
  let e = Math.round(k);
  if (e < 0) {
    base = inverse(m);
    if (!base) return null;
    e = -e;
  }
  let result = identity(m.length);
  while (e > 0) {
    if (e & 1) result = mulMM(result, base);
    base = mulMM(base, base);
    e >>= 1;
  }
  return result;
}

/** Spaltensummen (bei Übergangsmatrizen alle 1). */
export function colSums(m: Mat): number[] {
  return m[0]!.map((_, j) => m.reduce((s, row) => s + row[j]!, 0));
}

/** Summe der Einträge eines Vektors (Gesamtbestand). */
export function total(x: Vec): number {
  return x.reduce((s, v) => s + v, 0);
}

/**
 * Stochastische Übergangsmatrix? Alle Einträge zwischen 0 und 1 und jede
 * Spaltensumme gleich 1 (mit kleiner Toleranz für Rundungen der Eingabe).
 */
export function isStochastic(m: Mat, tol = 1e-6): boolean {
  if (m.some((row) => row.some((v) => v < -tol || v > 1 + tol))) return false;
  return colSums(m).every((s) => Math.abs(s - 1) <= tol);
}

/**
 * Lineares Gleichungssystem A · x = b (quadratisch) mit Gauß-Verfahren und
 * Spaltenpivotsuche; null, wenn A singulär ist.
 */
export function solve(a: Mat, b: Vec): Vec | null {
  const n = a.length;
  const m = a.map((row, i) => [...row, b[i]!]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) p = r;
    if (Math.abs(m[p]![c]!) < EPS) return null;
    [m[c], m[p]] = [m[p]!, m[c]!];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = m[r]![c]! / m[c]![c]!;
      if (f === 0) continue;
      for (let k = c; k <= n; k++) m[r]![k]! -= f * m[c]![k]!;
    }
  }
  return m.map((row, i) => row[n]! / row[i]!);
}

/** Inverse Matrix (Gauß-Jordan); null, wenn M nicht invertierbar ist. */
export function inverse(m: Mat): Mat | null {
  const n = m.length;
  const cols: Vec[] = [];
  for (let j = 0; j < n; j++) {
    const e = Array.from({ length: n }, (_, i) => (i === j ? 1 : 0));
    const c = solve(m, e);
    if (!c) return null;
    cols.push(c);
  }
  return Array.from({ length: n }, (_, i) => cols.map((c) => c[i]!));
}

/** Determinante (über Gauß-Elimination). */
export function determinant(m: Mat): number {
  const n = m.length;
  const a = m.map((row) => [...row]);
  let det = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r]![c]!) > Math.abs(a[p]![c]!)) p = r;
    if (Math.abs(a[p]![c]!) < EPS) return 0;
    if (p !== c) {
      [a[c], a[p]] = [a[p]!, a[c]!];
      det = -det;
    }
    det *= a[c]![c]!;
    for (let r = c + 1; r < n; r++) {
      const f = a[r]![c]! / a[c]![c]!;
      for (let k = c; k < n; k++) a[r]![k]! -= f * a[c]![k]!;
    }
  }
  return det;
}

/** Rang einer (beliebigen) Matrix. */
export function rank(m: Mat, tol = 1e-9): number {
  const a = m.map((row) => [...row]);
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r;
    for (let i = r + 1; i < rows; i++) if (Math.abs(a[i]![c]!) > Math.abs(a[p]![c]!)) p = i;
    if (Math.abs(a[p]![c]!) < tol) continue;
    [a[r], a[p]] = [a[p]!, a[r]!];
    for (let i = r + 1; i < rows; i++) {
      const f = a[i]![c]! / a[r]![c]!;
      for (let k = c; k < cols; k++) a[i]![k]! -= f * a[r]![k]!;
    }
    r++;
  }
  return r;
}

/**
 * Fixvektoren (stationäre Verteilungen) einer Übergangsmatrix:
 * (M − E) · x = 0 mit x_1 + … + x_n = 1.
 * `dim` ist die Dimension der Lösungsmenge von (M − E) · x = 0. Bei dim = 1
 * gibt es genau eine stationäre Verteilung (`unique`), bei dim > 1 (z. B.
 * mehrere absorbierende Zustände) hängt die Grenzverteilung vom Start ab.
 */
export function fixedVector(m: Mat): { dim: number; unique: Vec | null } {
  const n = m.length;
  const a = m.map((row, i) => row.map((v, j) => v - (i === j ? 1 : 0)));
  const dim = n - rank(a, 1e-9);
  if (dim !== 1) return { dim, unique: null };
  // Eine Gleichung durch die Summenbedingung ersetzen (die Zeilen von M − E
  // sind bei stochastischem M linear abhängig)
  let best: Vec | null = null;
  for (let drop = n - 1; drop >= 0 && !best; drop--) {
    const sys = a.map((row) => [...row]);
    sys[drop] = Array(n).fill(1);
    const rhs = Array(n).fill(0);
    rhs[drop] = 1;
    best = solve(sys, rhs);
  }
  return { dim, unique: best };
}

/** Größte Abweichung zweier Matrizen (Maximumnorm). */
export function maxDiff(a: Mat, b: Mat): number {
  let d = 0;
  a.forEach((row, i) => row.forEach((v, j) => (d = Math.max(d, Math.abs(v - b[i]![j]!)))));
  return d;
}

/**
 * Grenzmatrix lim M^n, falls sie existiert (durch wiederholtes Quadrieren).
 * `null`, wenn die Potenzen nicht zur Ruhe kommen (z. B. zyklische Ketten).
 */
export function limitMatrix(m: Mat, rounds = 40, tol = 1e-10): Mat | null {
  let p = m;
  for (let r = 0; r < rounds; r++) {
    const next = mulMM(p, p);
    // M^(2k) und M^(2k+1) müssen beide gleich sein, sonst schwankt die Folge
    if (maxDiff(next, p) < tol && maxDiff(mulMM(next, m), next) < tol) return next;
    if (next.some((row) => row.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e12))) return null;
    p = next;
  }
  return null;
}

/** Zustände x_from … x_to (from ≤ 0 ≤ to); negative Schritte rechnen rückwärts. */
export function series(m: Mat, x0: Vec, from: number, to: number): { n: number; x: Vec | null }[] {
  const out: { n: number; x: Vec | null }[] = [];
  const inv = from < 0 ? inverse(m) : null;
  const back: (Vec | null)[] = [];
  let x: Vec | null = x0;
  for (let n = -1; n >= from; n--) {
    x = x && inv ? mulMV(inv, x) : null;
    back.push(x);
  }
  for (let n = from; n < 0; n++) out.push({ n, x: back[-n - 1] ?? null });
  x = x0;
  for (let n = 0; n <= to; n++) {
    out.push({ n, x });
    x = mulMV(m, x);
  }
  return out;
}

/** Zustand nach n Schritten (n < 0: rückwärts mit der Inversen). */
export function stateAt(m: Mat, x0: Vec, n: number): Vec | null {
  const p = matPow(m, n);
  return p ? mulMV(p, x0) : null;
}

/** Art der Kette, wie sie im Unterricht unterschieden wird. */
export type ChainKind =
  | 'regular' // stochastisch, M^n konvergiert gegen eine Matrix mit gleichen Spalten
  | 'absorbing' // stochastisch, konvergiert, Grenze hängt vom Start ab (absorbierende Zustände)
  | 'periodic' // stochastisch, M^n kommt nicht zur Ruhe (zyklisch)
  | 'population'; // keine Übergangsmatrix (Spaltensummen ≠ 1), z. B. Leslie-Matrix

export interface ChainInfo {
  kind: ChainKind;
  /** Grenzmatrix, falls vorhanden. */
  limit: Mat | null;
  /** Eindeutige stationäre Verteilung, falls vorhanden. */
  fixed: Vec | null;
  /** Indizes absorbierender Zustände (M[i][i] = 1). */
  absorbing: number[];
  /** Periode, falls M^p = E für ein kleines p (sonst null). */
  period: number | null;
}

/** Ordnet eine Matrix ein (regulär, absorbierend, zyklisch, Population). */
export function classify(m: Mat): ChainInfo {
  const n = m.length;
  const absorbing = m.map((_, i) => i).filter((i) => Math.abs(m[i]![i]! - 1) < 1e-12 && m.every((row, r) => r === i || Math.abs(row[i]!) < 1e-12));
  let period: number | null = null;
  let p = m;
  for (let k = 1; k <= 12; k++) {
    if (maxDiff(p, identity(n)) < 1e-9) {
      period = k;
      break;
    }
    p = mulMM(p, m);
  }
  const stochastic = isStochastic(m);
  const limit = limitMatrix(m);
  const fixed = stochastic ? fixedVector(m).unique : null;
  if (!stochastic) return { kind: 'population', limit, fixed: null, absorbing: [], period };
  if (!limit) return { kind: 'periodic', limit: null, fixed, absorbing, period };
  const sameCols = limit.every((row) => row.every((v) => Math.abs(v - row[0]!) < 1e-7));
  return { kind: sameCols ? 'regular' : 'absorbing', limit, fixed: sameCols ? fixed : null, absorbing, period };
}

/**
 * Langfristiger Wachstumsfaktor einer Populationsmatrix (Faktor, um den der
 * Gesamtbestand pro Schritt auf lange Sicht wächst). Für zyklische Matrizen
 * mit M^p = E ist das 1. Rechnet mit dem p-ten Schritt, damit Schwankungen
 * innerhalb eines Zyklus nicht stören.
 */
export function growthFactor(m: Mat, x0: Vec, steps = 240): number | null {
  const t0 = total(x0);
  if (!(Math.abs(t0) > EPS)) return null;
  let x = x0;
  const totals: number[] = [t0];
  for (let k = 0; k < steps; k++) {
    x = mulMV(m, x);
    const t = total(x);
    if (!Number.isFinite(t)) return null;
    totals.push(t);
    // Normieren gegen Über- oder Unterlauf
    if (Math.abs(t) > 1e100 || (Math.abs(t) < 1e-100 && t !== 0)) return null;
  }
  // Mittel über die letzten 12 Schritte (fängt Zyklen bis Länge 12 ab)
  const a = totals[totals.length - 13]!;
  const b = totals[totals.length - 1]!;
  if (!(a > 0) || !(b > 0)) return null;
  return Math.pow(b / a, 1 / 12);
}

/* ------------------------------------------------------------------ */
/* Eingabe: Matrix und Vektor als Text                                  */
/* ------------------------------------------------------------------ */

/** Eine Zahl wie „0,25“, „0.25“, „1/3“, „−0,5“ oder „25 %“. */
export function parseNumber(token: string): number | null {
  let t = token.trim().replace(/−/g, '-').replace(/\s+/g, '');
  if (!t) return null;
  let percent = false;
  if (t.endsWith('%')) {
    percent = true;
    t = t.slice(0, -1);
  }
  t = t.replace(',', '.');
  let v: number;
  const frac = /^([+-]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t);
  if (frac) {
    const d = Number(frac[2]);
    if (d === 0) return null;
    v = Number(frac[1]) / d;
  } else if (/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(t)) v = Number(t);
  else return null;
  if (!Number.isFinite(v)) return null;
  return percent ? v / 100 : v;
}

export type ParseError = 'empty' | 'number' | 'square' | 'size';

/**
 * Matrix aus Text: Zeilen durch „;“ (oder „|“) getrennt, Einträge einer
 * Zeile durch Leerzeichen. Dezimalkomma erlaubt, ebenso Brüche wie 1/3.
 * Beispiel: „0,9 0,2; 0,1 0,8“. Erlaubt sind 2 × 2 bis 4 × 4.
 */
export function parseMatrix(text: string): { m: Mat | null; error?: ParseError } {
  const rows = text
    .split(/[;|\n]/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
  if (rows.length === 0) return { m: null, error: 'empty' };
  const m: Mat = [];
  for (const r of rows) {
    const cells = r.split(/\s+/).map(parseNumber);
    if (cells.some((c) => c === null)) return { m: null, error: 'number' };
    m.push(cells as number[]);
  }
  if (m.some((row) => row.length !== m.length)) return { m: null, error: 'square' };
  if (m.length < 2 || m.length > 4) return { m: null, error: 'size' };
  return { m };
}

/** Vektor aus Text: Einträge durch „;“ oder Leerzeichen getrennt. */
export function parseVector(text: string, n: number): { x: Vec | null; error?: ParseError } {
  const cells = text
    .split(/[;|\s]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  if (cells.length === 0) return { x: null, error: 'empty' };
  const x = cells.map(parseNumber);
  if (x.some((v) => v === null)) return { x: null, error: 'number' };
  if (x.length !== n) return { x: null, error: 'size' };
  return { x: x as number[] };
}

/**
 * Bruch zu einer Dezimalzahl (Nenner bis maxDen), z. B. 0,6667 → [2, 3];
 * null, wenn kein Bruch mit kleinem Nenner passt.
 */
export function toFraction(v: number, maxDen = 60, tol = 1e-7): [number, number] | null {
  if (!Number.isFinite(v)) return null;
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < tol) return [n, d];
  }
  return null;
}

/** Wahrscheinlichkeit eines bestimmten Pfades j → … → i (Produkt der Übergänge). */
export function pathProbability(m: Mat, path: number[]): number {
  let p = 1;
  for (let k = 1; k < path.length; k++) p *= m[path[k]!]![path[k - 1]!]!;
  return p;
}

/**
 * Alle Pfade der Länge n (n Übergänge) von j nach i mit positiver
 * Wahrscheinlichkeit, nach Wahrscheinlichkeit absteigend. Ihre Summe ist
 * der Eintrag (M^n)[i][j]. Höchstens `limit` Pfade (für die Anzeige).
 */
export function paths(m: Mat, j: number, i: number, n: number, limit = 64): { path: number[]; p: number }[] {
  const out: { path: number[]; p: number }[] = [];
  const size = m.length;
  const walk = (path: number[], p: number): void => {
    if (out.length > 4000) return;
    const last = path[path.length - 1]!;
    if (path.length === n + 1) {
      if (last === i && p > 0) out.push({ path: [...path], p });
      return;
    }
    for (let k = 0; k < size; k++) {
      const q = m[k]![last]!;
      if (q > 0) {
        path.push(k);
        walk(path, p * q);
        path.pop();
      }
    }
  };
  if (n >= 0 && n <= 8) walk([j], 1);
  out.sort((a, b) => b.p - a.p);
  return out.slice(0, limit);
}
