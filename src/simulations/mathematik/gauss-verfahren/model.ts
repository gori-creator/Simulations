/**
 * Rechenlogik für das Gauß-Verfahren: Gleichungen lesen, exakt mit Brüchen
 * rechnen, Zeilenumformungen Schritt für Schritt (mit oder ohne Brüche),
 * Stufenform, Rang, Lösungsmenge (eindeutig, keine, unendlich viele mit
 * Parametern) und Rückwärtseinsetzen. Geprüft in tests/gauss-verfahren.test.ts.
 */

/* ------------------------------------------------------------------ */
/* Brüche                                                               */
/* ------------------------------------------------------------------ */

/** Exakter Bruch n/d mit d > 0, gekürzt. */
export interface Frac {
  readonly n: number;
  readonly d: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function frac(n: number, d = 1): Frac {
  if (d === 0) throw new RangeError('Nenner 0');
  if (!Number.isInteger(n) || !Number.isInteger(d)) return fromNumber(n / d);
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g === 0 ? 0 : n / g, d: d / g };
}

/** Dezimalzahl als Bruch (bis 6 Nachkommastellen exakt). */
export function fromNumber(v: number): Frac {
  if (Number.isInteger(v)) return { n: v, d: 1 };
  let d = 1;
  while (d < 1e6 && Math.abs(Math.round(v * d) - v * d) > 1e-9) d *= 10;
  return frac(Math.round(v * d), d);
}

export const ZERO = frac(0);
export const ONE = frac(1);
export const fadd = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const fsub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const fmul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
export const fdiv = (a: Frac, b: Frac) => {
  if (b.n === 0) throw new RangeError('Division durch 0');
  return frac(a.n * b.d, a.d * b.n);
};
export const fneg = (a: Frac) => frac(-a.n, a.d);
export const isZero = (a: Frac) => a.n === 0;
export const feq = (a: Frac, b: Frac) => a.n === b.n && a.d === b.d;
export const fval = (a: Frac) => a.n / a.d;

/** Bruch als Text: 3, −1/2 (mit echtem Minuszeichen). */
export function fracText(a: Frac, minus = '−'): string {
  const s = a.n < 0 ? minus : '';
  const n = Math.abs(a.n);
  return a.d === 1 ? `${s}${n}` : `${s}${n}/${a.d}`;
}

/* ------------------------------------------------------------------ */
/* Gleichungen lesen                                                    */
/* ------------------------------------------------------------------ */

export type Row = Frac[];
/** Erweiterte Koeffizientenmatrix: je Zeile k Koeffizienten und rechte Seite. */
export type Matrix = Row[];

export interface System {
  /** Namen der Unbekannten (x, y, z oder x₁ …). */
  vars: string[];
  m: Matrix;
}

export type ParseError = { ok: false; msg: 'empty' | 'token' | 'eq' | 'vars' | 'rows' | 'nonlinear'; line?: number; pos?: number };

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const toSub = (s: string) => s.replace(/\d/g, (c) => SUB[+c]!);
const fromSub = (s: string) => s.replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)));

/**
 * Liest ein Gleichungssystem, z. B. „x + y + z = 6; 2y + 5z = −4; 2x + 5y − z = 27“.
 * Unbekannte: Buchstaben (x, y, z, w, a, b, c …) oder x1, x₂ …; Zahlen mit
 * Komma oder Punkt, Brüche wie 1/2 x oder x/2. Beide Seiten dürfen Terme haben.
 */
export function parseSystem(src: string): { ok: true; sys: System } | ParseError {
  const lines = src
    .split(/[;\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { ok: false, msg: 'empty' };
  if (lines.length > 5) return { ok: false, msg: 'rows' };
  const parsed: Map<string, Frac>[] = [];
  const order: string[] = [];
  for (let li = 0; li < lines.length; li++) {
    const line = fromSub(lines[li]!).replace(/−/g, '-').replace(/[·*×]/g, '*').replace(/,/g, '.');
    const parts = line.split('=');
    if (parts.length !== 2) return { ok: false, msg: 'eq', line: li };
    const left = linear(parts[0]!);
    const right = linear(parts[1]!);
    if (!left.ok) return { ok: false, msg: left.msg, line: li, pos: left.pos };
    if (!right.ok) return { ok: false, msg: right.msg, line: li, pos: parts[0]!.length + 1 + right.pos };
    const coef = new Map<string, Frac>();
    for (const [k, v] of left.terms) coef.set(k, fadd(coef.get(k) ?? ZERO, v));
    for (const [k, v] of right.terms) coef.set(k, fsub(coef.get(k) ?? ZERO, v));
    for (const k of coef.keys()) if (k !== '' && !order.includes(k)) order.push(k);
    parsed.push(coef);
  }
  if (order.length < 1 || order.length > 5) return { ok: false, msg: 'vars' };
  const vars = sortVars(order);
  const m: Matrix = parsed.map((c) => [...vars.map((v) => c.get(v) ?? ZERO), fneg(c.get('') ?? ZERO)]);
  return { ok: true, sys: { vars: vars.map(prettyVar), m } };
}

/** Übliche Reihenfolge: x, y, z, w bzw. x1, x2 …, sonst alphabetisch. */
function sortVars(vs: string[]): string[] {
  const rank = (v: string) => {
    const m = /^([a-z])(\d*)$/.exec(v);
    const base = 'xyzw'.indexOf(m?.[1] ?? '');
    return m && m[2] ? 100 + +m[2] : base >= 0 ? base : 10 + v.charCodeAt(0);
  };
  return [...vs].sort((a, b) => rank(a) - rank(b));
}
const prettyVar = (v: string) => (/^[a-z]\d+$/.test(v) ? v[0] + toSub(v.slice(1)) : v);

type LinResult = { ok: true; terms: Map<string, Frac> } | { ok: false; msg: 'token' | 'nonlinear'; pos: number };

/** Linearer Term: Summe von (Zahl)·(Unbekannte) und Zahlen. */
function linear(s: string): LinResult {
  const terms = new Map<string, Frac>();
  let i = 0;
  const ws = () => {
    while (s[i] === ' ' || s[i] === '\t') i++;
  };
  const num = (): Frac | null => {
    ws();
    const m = /^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return fromNumber(parseFloat(m[0]));
  };
  ws();
  if (i >= s.length) return { ok: false, msg: 'token', pos: i };
  let first = true;
  while (true) {
    ws();
    if (i >= s.length) break;
    let sign = 1;
    let gotSign = false;
    while (s[i] === '+' || s[i] === '-') {
      if (s[i] === '-') sign = -sign;
      gotSign = true;
      i++;
      ws();
    }
    if (!first && !gotSign) return { ok: false, msg: 'token', pos: i };
    first = false;
    let c: Frac = frac(sign);
    let any = false;
    // Faktoren: Zahl, Bruch, Klammer mit Zahl, Malpunkt
    const n1 = num();
    if (n1) {
      c = fmul(c, n1);
      any = true;
      ws();
      if (s[i] === '/') {
        i++;
        const n2 = num();
        if (!n2 || isZero(n2)) return { ok: false, msg: 'token', pos: i };
        c = fdiv(c, n2);
      }
    }
    ws();
    if (s[i] === '*') {
      i++;
      ws();
    }
    const vm = /^[a-zA-Z]\d*/.exec(s.slice(i));
    let name = '';
    if (vm) {
      name = vm[0].toLowerCase();
      if (name === 'e') return { ok: false, msg: 'token', pos: i };
      i += vm[0].length;
      any = true;
      ws();
      if (s[i] === '^' || s[i] === '²' || s[i] === '³') return { ok: false, msg: 'nonlinear', pos: i };
      // x/2
      if (s[i] === '/') {
        i++;
        const n2 = num();
        if (!n2 || isZero(n2)) return { ok: false, msg: 'token', pos: i };
        c = fdiv(c, n2);
      }
      ws();
      if (s[i] === '*' || /^[a-zA-Z]/.test(s.slice(i))) return { ok: false, msg: 'nonlinear', pos: i };
    }
    if (!any) return { ok: false, msg: 'token', pos: i };
    terms.set(name, fadd(terms.get(name) ?? ZERO, c));
  }
  return { ok: true, terms };
}

/* ------------------------------------------------------------------ */
/* Zeilenumformungen                                                    */
/* ------------------------------------------------------------------ */

/**
 * Eine Zeilenumformung:
 * - `swap`: Zeilen i und j tauschen,
 * - `comb`: Zeile i ← a · Zeile i + b · Zeile j (a ≠ 0),
 * - `scale`: Zeile i ← a · Zeile i (a ≠ 0).
 */
export type Op =
  | { kind: 'swap'; i: number; j: number }
  | { kind: 'comb'; i: number; a: Frac; j: number; b: Frac }
  | { kind: 'scale'; i: number; a: Frac };

export function applyOp(m: Matrix, op: Op): Matrix {
  const out = m.map((r) => [...r]);
  switch (op.kind) {
    case 'swap':
      [out[op.i], out[op.j]] = [out[op.j]!, out[op.i]!];
      return out;
    case 'scale':
      if (isZero(op.a)) throw new RangeError('Faktor 0');
      out[op.i] = out[op.i]!.map((v) => fmul(v, op.a));
      return out;
    case 'comb':
      if (isZero(op.a)) throw new RangeError('Faktor 0');
      out[op.i] = out[op.i]!.map((v, c) => fadd(fmul(op.a, v), fmul(op.b, m[op.j]![c]!)));
      return out;
  }
}

/** Römische Zeilennamen wie im Schulbuch. */
export const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

/** Umformung als Text, z. B. „II − 2 · I“ oder „3 · III + 2 · I“. */
export function opText(op: Op, minus = '−'): string {
  const R = (i: number) => ROMAN[i] ?? String(i + 1);
  const coef = (f: Frac) => (feq(f, ONE) ? '' : feq(f, frac(-1)) ? minus : `${fracText(f, minus)} · `);
  switch (op.kind) {
    case 'swap':
      return `${R(op.i)} ↔ ${R(op.j)}`;
    case 'scale':
      // Teilen durch eine ganze Zahl: „III : 7“ statt „1/7 · III“
      if (op.a.n === 1 && op.a.d > 1) return `${R(op.i)} : ${op.a.d}`;
      if (op.a.n === -1 && op.a.d > 1) return `${R(op.i)} : (${minus}${op.a.d})`;
      return `${coef(op.a)}${R(op.i)}`.replace(/ · $/, '');
    case 'comb': {
      const left = `${coef(op.a)}${R(op.i)}`;
      const neg = op.b.n < 0;
      const babs = neg ? fneg(op.b) : op.b;
      const right = `${feq(babs, ONE) ? '' : `${fracText(babs, minus)} · `}${R(op.j)}`;
      return `${left} ${neg ? minus : '+'} ${right}`;
    }
  }
}

export interface GaussStep {
  op: Op;
  /** Matrix nach dem Schritt. */
  m: Matrix;
  /** Pivotstelle, um die es geht (Zeile, Spalte). */
  pivot: [number, number];
  /** Phase: Stufenform (vorwärts) oder Rückwärts (Gauß-Jordan). */
  phase: 'forward' | 'backward' | 'normalize';
}

export interface GaussOptions {
  /** Ganzzahlig: Zeile i ← p · Zeile i − q · Zeile j statt Brüchen. */
  integer?: boolean;
  /** Auch nach oben eliminieren und Pivots auf 1 bringen (Gauß-Jordan). */
  jordan?: boolean;
}

const isIntRow = (r: Row) => r.every((v) => v.d === 1);

/** Gemeinsamen Faktor einer ganzzahligen Zeile herausteilen (für kleine Zahlen). */
function rowGcd(r: Row): number {
  let g = 0;
  for (const v of r) if (v.n) g = g ? gcd(g, v.n) : Math.abs(v.n);
  return g || 1;
}

/**
 * Gauß-Verfahren Schritt für Schritt. Vorwärts bis zur Stufenform, auf Wunsch
 * weiter bis zur reduzierten Stufenform. Pivot: erste Zeile mit Eintrag ≠ 0,
 * bevorzugt mit Betrag 1 (weniger Brüche).
 */
export function gauss(m0: Matrix, opt: GaussOptions = {}): GaussStep[] {
  const steps: GaussStep[] = [];
  let m = m0.map((r) => [...r]);
  const rows = m.length;
  const cols = (m[0]?.length ?? 1) - 1;
  const push = (op: Op, pivot: [number, number], phase: GaussStep['phase']) => {
    m = applyOp(m, op);
    steps.push({ op, m, pivot, phase });
  };
  const pivots: [number, number][] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    // Pivotzeile suchen (|a| = 1 bevorzugt, sonst erste ≠ 0)
    let best = -1;
    for (let k = r; k < rows; k++) {
      if (isZero(m[k]![c]!)) continue;
      if (best < 0) best = k;
      const v = m[k]![c]!;
      if (Math.abs(v.n) === 1 && v.d === 1 && !(Math.abs(m[best]![c]!.n) === 1 && m[best]![c]!.d === 1)) best = k;
    }
    if (best < 0) continue;
    if (best !== r) push({ kind: 'swap', i: r, j: best }, [r, c], 'forward');
    for (let k = r + 1; k < rows; k++) {
      const v = m[k]![c]!;
      if (isZero(v)) continue;
      const p = m[r]![c]!;
      if (opt.integer && isIntRow(m[k]!) && isIntRow(m[r]!)) {
        // k ← (p/g) · k − (v/g) · r  mit g = ggT
        const g = gcd(p.n, v.n);
        let a = frac(p.n / g);
        let b = frac(-v.n / g);
        if (a.n < 0) {
          a = fneg(a);
          b = fneg(b);
        }
        push({ kind: 'comb', i: k, a, j: r, b }, [r, c], 'forward');
        // große Zahlen klein halten
        const rg = rowGcd(m[k]!);
        if (rg > 1) push({ kind: 'scale', i: k, a: frac(1, rg) }, [r, c], 'forward');
      } else {
        push({ kind: 'comb', i: k, a: ONE, j: r, b: fneg(fdiv(v, p)) }, [r, c], 'forward');
      }
    }
    pivots.push([r, c]);
    r++;
  }
  if (opt.jordan) {
    for (let q = pivots.length - 1; q >= 0; q--) {
      const [pr, pc] = pivots[q]!;
      const p = m[pr]![pc]!;
      if (!feq(p, ONE)) push({ kind: 'scale', i: pr, a: fdiv(ONE, p) }, [pr, pc], 'normalize');
      for (let k = 0; k < pr; k++) {
        const v = m[k]![pc]!;
        if (isZero(v)) continue;
        push({ kind: 'comb', i: k, a: ONE, j: pr, b: fneg(v) }, [pr, pc], 'backward');
      }
    }
  }
  return steps;
}

/** Stufenform? (Unter jeder führenden Zahl nur Nullen, Nullzeilen unten.) */
export function isEchelon(m: Matrix): boolean {
  const cols = (m[0]?.length ?? 1) - 1;
  let last = -1;
  let zeroSeen = false;
  for (const r of m) {
    const lead = r.slice(0, cols).findIndex((v) => !isZero(v));
    if (lead < 0) {
      zeroSeen = true;
      continue;
    }
    if (zeroSeen || lead <= last) return false;
    last = lead;
  }
  return true;
}

/** Rang der Koeffizientenmatrix und der erweiterten Matrix. */
export function ranks(m: Matrix): { rank: number; rankAug: number } {
  const st = gauss(m);
  const e = st.length ? st[st.length - 1]!.m : m;
  const cols = (m[0]?.length ?? 1) - 1;
  let rank = 0;
  let rankAug = 0;
  for (const r of e) {
    if (r.slice(0, cols).some((v) => !isZero(v))) rank++;
    if (r.some((v) => !isZero(v))) rankAug++;
  }
  return { rank, rankAug };
}

export type Solution =
  | { kind: 'unique'; x: Frac[] }
  | { kind: 'none'; row: number }
  | {
      kind: 'infinite';
      /** Stützvektor (alle Parameter 0). */
      p: Frac[];
      /** Richtungsvektoren je freier Variable. */
      dirs: Frac[][];
      /** Spalten der freien Variablen. */
      free: number[];
    };

/** Lösungsmenge aus der (reduzierten) Stufenform. */
export function solve(m0: Matrix): Solution {
  const steps = gauss(m0, { jordan: true });
  const m = steps.length ? steps[steps.length - 1]!.m : m0;
  const cols = (m0[0]?.length ?? 1) - 1;
  const pivotCol: number[] = [];
  for (let r = 0; r < m.length; r++) {
    const lead = m[r]!.slice(0, cols).findIndex((v) => !isZero(v));
    if (lead < 0) {
      if (!isZero(m[r]![cols]!)) return { kind: 'none', row: r };
      continue;
    }
    pivotCol[r] = lead;
  }
  const pivots = new Set(pivotCol.filter((c) => c !== undefined));
  const free: number[] = [];
  for (let c = 0; c < cols; c++) if (!pivots.has(c)) free.push(c);
  const p: Frac[] = Array.from({ length: cols }, () => ZERO);
  const dirs: Frac[][] = free.map(() => Array.from({ length: cols }, () => ZERO));
  free.forEach((f, k) => (dirs[k]![f] = ONE));
  for (let r = 0; r < m.length; r++) {
    const c = pivotCol[r];
    if (c === undefined) continue;
    p[c] = m[r]![cols]!;
    free.forEach((f, k) => (dirs[k]![c] = fneg(m[r]![f]!)));
  }
  if (!free.length) return { kind: 'unique', x: p };
  return { kind: 'infinite', p, dirs, free };
}

/** Erfüllt der Vektor x alle Gleichungen? */
export function satisfies(m: Matrix, x: Frac[]): boolean {
  const cols = (m[0]?.length ?? 1) - 1;
  return m.every((r) => {
    let s = ZERO;
    for (let c = 0; c < cols; c++) s = fadd(s, fmul(r[c]!, x[c]!));
    return feq(s, r[cols]!);
  });
}

/* ------------------------------------------------------------------ */
/* Rückwärtseinsetzen (für die Anzeige)                                 */
/* ------------------------------------------------------------------ */

export interface BackStep {
  /** Zeile der Stufenform. */
  row: number;
  /** Unbekannte, nach der aufgelöst wird. */
  col: number;
  /** schon bekannte Werte, die eingesetzt werden (Spalte → Wert). */
  known: [number, Frac][];
  /** Ergebnis. */
  value: Frac;
}

/** Rückwärtseinsetzen aus der Stufenform (nur bei eindeutiger Lösung). */
export function backSubstitution(m: Matrix): BackStep[] | null {
  const cols = (m[0]?.length ?? 1) - 1;
  const val: (Frac | undefined)[] = Array(cols).fill(undefined);
  const out: BackStep[] = [];
  for (let r = m.length - 1; r >= 0; r--) {
    const row = m[r]!;
    const lead = row.slice(0, cols).findIndex((v) => !isZero(v));
    if (lead < 0) {
      if (!isZero(row[cols]!)) return null;
      continue;
    }
    const known: [number, Frac][] = [];
    let rhs = row[cols]!;
    for (let c = lead + 1; c < cols; c++) {
      if (isZero(row[c]!)) continue;
      const v = val[c];
      if (v === undefined) return null;
      known.push([c, v]);
      rhs = fsub(rhs, fmul(row[c]!, v));
    }
    const x = fdiv(rhs, row[lead]!);
    val[lead] = x;
    out.push({ row: r, col: lead, known, value: x });
  }
  if (val.some((v) => v === undefined)) return null;
  return out;
}

/* ------------------------------------------------------------------ */
/* Geometrie (3 Unbekannte: Ebenen, 2 Unbekannte: Geraden)              */
/* ------------------------------------------------------------------ */

export type V3 = readonly [number, number, number];

/**
 * Schnittvieleck der Ebene n · x = d mit dem Würfel [lo, hi]³ (Ecken der Reihe
 * nach). Leer, wenn die Ebene den Würfel verfehlt oder n = 0 ist.
 */
export function planeBoxPolygon(n: V3, d: number, lo: number, hi: number): V3[] {
  if (Math.hypot(n[0], n[1], n[2]) < 1e-12) return [];
  const pts: [number, number, number][] = [];
  const c = [lo, hi];
  for (let k = 0; k < 3; k++) {
    const i = (k + 1) % 3;
    const j = (k + 2) % 3;
    for (const p of c) {
      for (const q of c) {
        const nk = n[k]!;
        if (Math.abs(nk) < 1e-12) continue;
        const x = (d - n[i]! * p - n[j]! * q) / nk;
        if (x < lo - 1e-9 || x > hi + 1e-9) continue;
        const v: [number, number, number] = [0, 0, 0];
        v[k] = x;
        v[i] = p;
        v[j] = q;
        if (!pts.some((w) => Math.hypot(w[0] - v[0], w[1] - v[1], w[2] - v[2]) < 1e-7)) pts.push(v);
      }
    }
  }
  if (pts.length < 3) return [];
  const ctr = pts.reduce((s, q) => [s[0] + q[0] / pts.length, s[1] + q[1] / pts.length, s[2] + q[2] / pts.length] as [number, number, number], [0, 0, 0] as [number, number, number]);
  const e1 = [pts[0]![0] - ctr[0], pts[0]![1] - ctr[1], pts[0]![2] - ctr[2]] as const;
  const e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]] as const;
  const ang = (q: V3) => {
    const v = [q[0] - ctr[0], q[1] - ctr[1], q[2] - ctr[2]];
    return Math.atan2(v[0]! * e2[0] + v[1]! * e2[1] + v[2]! * e2[2], v[0]! * e1[0] + v[1]! * e1[1] + v[2]! * e1[2]);
  };
  return [...pts].sort((A, B) => ang(A) - ang(B));
}

/** Gerade a·x + b·y = c im Rechteck [lo, hi]²: Endpunkte oder null. */
export function lineInBox(a: number, b: number, c: number, lo: number, hi: number): [[number, number], [number, number]] | null {
  const pts: [number, number][] = [];
  if (Math.abs(b) > 1e-12) {
    for (const x of [lo, hi]) {
      const y = (c - a * x) / b;
      if (y >= lo - 1e-9 && y <= hi + 1e-9) pts.push([x, y]);
    }
  }
  if (Math.abs(a) > 1e-12) {
    for (const y of [lo, hi]) {
      const x = (c - b * y) / a;
      if (x >= lo - 1e-9 && x <= hi + 1e-9 && !pts.some((q) => Math.hypot(q[0] - x, q[1] - y) < 1e-7)) pts.push([x, y]);
    }
  }
  return pts.length >= 2 ? [pts[0]!, pts[1]!] : null;
}

/** Zufällige Aufgabe mit ganzzahliger, eindeutiger Lösung (Werte −5 … 5). */
export function randomSystem(n: number, rnd: () => number, kind: 'unique' | 'none' | 'infinite' = 'unique'): Matrix {
  const ri = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  for (let tries = 0; tries < 400; tries++) {
    const x = Array.from({ length: n }, () => ri(-5, 5));
    const A = Array.from({ length: n }, () => Array.from({ length: n }, () => ri(-3, 4)));
    if (kind !== 'unique') {
      // letzte Zeile = Summe aus zwei anderen (ggf. rechte Seite verfälscht)
      const p = ri(1, 2);
      A[n - 1] = A[0]!.map((v, c) => v + p * A[1]![c]!);
    }
    const m: Matrix = A.map((r) => [...r.map((v) => frac(v)), frac(r.reduce((s, v, c) => s + v * x[c]!, 0))]);
    if (kind === 'none') m[n - 1]![n] = fadd(m[n - 1]![n]!, frac(ri(1, 3)));
    const { rank } = ranks(m);
    const sol = solve(m);
    if (kind === 'unique' && rank === n && A.every((r) => r.filter((v) => v !== 0).length >= 2)) return m;
    if (kind === sol.kind && kind !== 'unique') return m;
  }
  return [
    [frac(1), frac(1), frac(1), frac(6)],
    [frac(0), frac(2), frac(5), frac(-4)],
    [frac(2), frac(5), frac(-1), frac(27)],
  ];
}

/** Matrix als Gleichungstext (für Links und das Eingabefeld). */
export function systemText(vars: string[], m: Matrix): string {
  const cols = vars.length;
  return m
    .map((r) => {
      let s = '';
      for (let c = 0; c < cols; c++) {
        const v = r[c]!;
        if (isZero(v)) continue;
        const neg = v.n < 0;
        const a = neg ? fneg(v) : v;
        const coef = feq(a, ONE) ? '' : a.d === 1 ? String(a.n) : `${a.n}/${a.d} `;
        s += s ? (neg ? ' - ' : ' + ') : neg ? '-' : '';
        s += coef + vars[c];
      }
      return `${s || '0'} = ${fracText(r[cols]!, '-')}`;
    })
    .join('; ');
}

/* ------------------------------------------------------------------ */
/* Eigene Umformungen lesen                                             */
/* ------------------------------------------------------------------ */

export type OpParse = { ok: true; op: Op } | { ok: false; msg: 'empty' | 'token' | 'row' | 'zero' | 'target' };

/**
 * Liest eine Zeilenumformung wie „II − 2·I“, „2·III + 3·I“, „I ↔ III“,
 * „1/2·II“ oder „II : 2“. Zeilen römisch (I … V) oder als Zahl in Klammern
 * nicht nötig: „Z2 − 2 Z1“ geht auch. Die links stehende Zeile wird ersetzt.
 */
export function parseOp(src: string, rows: number): OpParse {
  let s = src.replace(/−/g, '-').replace(/[·*×]/g, '*').replace(/,/g, '.').replace(/<->|<=>|⇄|⇔/g, '↔').trim();
  if (!s) return { ok: false, msg: 'empty' };
  s = s.replace(/\s+/g, ' ');
  const rowIdx = (t: string): number => {
    const r = t.trim().toUpperCase();
    const z = /^Z\s*(\d)$/.exec(r);
    if (z) return +z[1]! - 1;
    return ROMAN.indexOf(r);
  };
  const okRow = (i: number) => i >= 0 && i < rows;
  // Tausch
  if (s.includes('↔')) {
    const [a, b] = s.split('↔');
    const i = rowIdx(a ?? '');
    const j = rowIdx(b ?? '');
    if (!okRow(i) || !okRow(j)) return { ok: false, msg: 'row' };
    if (i === j) return { ok: false, msg: 'target' };
    return { ok: true, op: { kind: 'swap', i, j } };
  }
  // Summanden: [±][Zahl[/Zahl]][*]Zeile  oder  Zeile [: Zahl | / Zahl]
  const terms: { c: Frac; row: number }[] = [];
  const re = /([+-]?)\s*(?:(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?\s*\*?\s*)?(Z\s*\d|[IVX]+)(?:\s*[:/]\s*(\d+(?:\.\d+)?))?\s*/giy;
  let m: RegExpExecArray | null;
  let pos = 0;
  while (pos < s.length && (m = re.exec(s))) {
    if (m[0] === '') break;
    pos = re.lastIndex;
    const row = rowIdx(m[4]!);
    if (!okRow(row)) return { ok: false, msg: 'row' };
    let c = m[2] ? fromNumber(parseFloat(m[2])) : ONE;
    if (m[3]) {
      const d = fromNumber(parseFloat(m[3]));
      if (isZero(d)) return { ok: false, msg: 'zero' };
      c = fdiv(c, d);
    }
    if (m[5]) {
      const d = fromNumber(parseFloat(m[5]));
      if (isZero(d)) return { ok: false, msg: 'zero' };
      c = fdiv(c, d);
    }
    if (m[1] === '-') c = fneg(c);
    terms.push({ c, row });
  }
  if (pos < s.length || !terms.length) return { ok: false, msg: 'token' };
  const first = terms[0]!;
  if (isZero(first.c)) return { ok: false, msg: 'zero' };
  if (terms.length === 1) return { ok: true, op: { kind: 'scale', i: first.row, a: first.c } };
  if (terms.length !== 2) return { ok: false, msg: 'token' };
  const second = terms[1]!;
  if (second.row === first.row) return { ok: false, msg: 'target' };
  return { ok: true, op: { kind: 'comb', i: first.row, a: first.c, j: second.row, b: second.c } };
}

/** Liste von Umformungen (mit „;“ getrennt) auf eine Matrix anwenden. */
export function applyOps(m: Matrix, src: string): { m: Matrix; ops: Op[]; history: Matrix[]; error?: number } {
  const ops: Op[] = [];
  const history: Matrix[] = [m];
  let cur = m;
  const parts = src
    .split(';')
    .map((t) => t.trim())
    .filter(Boolean);
  for (let k = 0; k < parts.length; k++) {
    const r = parseOp(parts[k]!, m.length);
    if (!r.ok) return { m: cur, ops, history, error: k };
    cur = applyOp(cur, r.op);
    ops.push(r.op);
    history.push(cur);
  }
  return { m: cur, ops, history };
}
