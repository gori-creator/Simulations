/**
 * Rechenlogik zu den Vorzeichenregeln beim Multiplizieren und Dividieren
 * ganzer Zahlen.
 */

export type Sign = 1 | -1 | 0;

export function sign(x: number): Sign {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

/** Vorzeichen eines Produkts oder Quotienten aus den Vorzeichen der Faktoren. */
export function signRule(a: number, b: number): Sign {
  return (sign(a) * sign(b) || 0) as Sign;
}

/** Quotient a : b; null bei Division durch 0. */
export function quotient(a: number, b: number): number | null {
  if (b === 0) return null;
  const q = a / b;
  return q === 0 ? 0 : q;
}

export interface PatternRow {
  a: number;
  value: number;
}

/**
 * Permanenzprinzip: Zeilen a · b für a = from, from − 1, …, to.
 * Von Zeile zu Zeile ändert sich das Ergebnis immer um −b.
 */
export function patternRows(b: number, from = 3, to = -3): PatternRow[] {
  const rows: PatternRow[] = [];
  for (let a = from; a >= to; a--) {
    const v = a * b;
    rows.push({ a, value: v === 0 ? 0 : v });
  }
  return rows;
}

/**
 * Schuldenmodell: Der Kontostand ändert sich um k · w, wenn k Karten mit dem
 * Wert w hinzukommen (k > 0) oder weggenommen werden (k < 0).
 */
export function balanceAfter(start: number, k: number, w: number): number {
  const v = start + k * w;
  return v === 0 ? 0 : v;
}

/**
 * Sprünge am Zahlenstrahl für a · b: |a| Sprünge der Länge b ab 0.
 * Bei negativem a wird anschließend an der Null gespiegelt (Gegenzahl).
 */
export function jumps(a: number, b: number): { from: number; to: number }[] {
  const out: { from: number; to: number }[] = [];
  for (let i = 0; i < Math.abs(a); i++) out.push({ from: i * b || 0, to: (i + 1) * b || 0 });
  return out;
}

/* ------------------------------------------------------------------ */
/* Viele Faktoren und Potenzen                                         */
/* ------------------------------------------------------------------ */

/** Vorzeichen eines Produkts vieler Faktoren: gerade Zahl negativer Faktoren → +, ungerade → −. */
export function productSign(factors: readonly number[]): Sign {
  if (factors.some((f) => f === 0)) return 0;
  const neg = factors.filter((f) => f < 0).length;
  return neg % 2 === 0 ? 1 : -1;
}

/** Produkt mit sauberer Null. */
export function product(factors: readonly number[]): number {
  const v = factors.reduce((s, f) => s * f, 1);
  return v === 0 ? 0 : v;
}

/** Zwischenergebnisse beim Multiplizieren von links nach rechts. */
export function partialProducts(factors: readonly number[]): number[] {
  const out: number[] = [];
  let v = 1;
  for (const f of factors) {
    v *= f;
    out.push(v === 0 ? 0 : v);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Alltag: Änderung pro Stunde mal Zeit                               */
/* ------------------------------------------------------------------ */

/**
 * Temperatur nach t Stunden, wenn sie sich um r Grad pro Stunde ändert
 * (r < 0: sie fällt; t < 0: Blick in die Vergangenheit).
 */
export function tempAfter(start: number, rate: number, hours: number): number {
  const v = start + rate * hours;
  return v === 0 ? 0 : v;
}

/* ------------------------------------------------------------------ */
/* Kopfrechnen                                                         */
/* ------------------------------------------------------------------ */

export type DrillKind = 'mul' | 'div' | 'three' | 'pow' | 'mix' | 'sign' | 'order' | 'bracket';

export interface Drill {
  kind: DrillKind;
  /** Aufgabe mit Klammern um negative Zahlen; deutsch mit „:“ */
  task: string;
  answer: number;
}

function rng(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const MINUS = '−';
const fmtInt = (x: number) => (x < 0 ? `${MINUS}${-x}` : String(x));
const par = (x: number) => (x < 0 ? `(${fmtInt(x)})` : fmtInt(x));

/** Kopfrechenaufgabe Nummer n; Arten reihum, Zahlen zufällig aber fest je Nummer. */
export function makeDrill(n: number): Drill {
  const r = rng(n * 89 + 17);
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const nz = (lo: number, hi: number) => {
    let v = 0;
    while (v === 0) v = int(lo, hi);
    return v;
  };
  const kinds: DrillKind[] = ['mul', 'div', 'mul', 'three', 'div', 'pow', 'mix', 'sign', 'order', 'bracket'];
  const kind = kinds[(n - 1) % kinds.length]!;
  // Mindestens ein negativer Faktor, sonst übt die Aufgabe keine Vorzeichenregel
  const withNeg = (xs: number[]) => (xs.some((x) => x < 0) ? xs : [-xs[0]!, ...xs.slice(1)]);
  if (kind === 'mul') {
    const [a, b] = withNeg([nz(-9, 9), nz(-9, 9)]) as [number, number];
    return { kind, task: `${fmtInt(a)} · ${par(b)}`, answer: a * b };
  }
  if (kind === 'div') {
    const [q, d] = withNeg([nz(-9, 9), nz(-9, 9)]) as [number, number];
    return { kind, task: `${fmtInt(q * d)} : ${par(d)}`, answer: q };
  }
  if (kind === 'three') {
    const f = withNeg([nz(-5, 5), nz(-5, 5), nz(-4, 4)]);
    return { kind, task: `${fmtInt(f[0]!)} · ${par(f[1]!)} · ${par(f[2]!)}`, answer: product(f) };
  }
  if (kind === 'pow') {
    const b = -int(1, 3);
    const e = int(2, b === -1 ? 9 : b === -2 ? 5 : 3);
    const sup = String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
    return { kind, task: `(${fmtInt(b)})${sup}`, answer: b ** e };
  }
  if (kind === 'mix') {
    const [a, b] = withNeg([nz(-6, 6), nz(-6, 6)]) as [number, number];
    const c = nz(-9, 9);
    return { kind, task: `${fmtInt(a)} · ${par(b)} + ${par(c)}`, answer: a * b + c };
  }
  if (kind === 'order') {
    const e = makeExpr(n);
    return { kind, task: e.steps[0]!, answer: e.value };
  }
  if (kind === 'bracket') {
    const k = nz(-4, 4) < 0 ? -1 : -int(2, 4);
    const t = [nz(-7, 7), nz(-7, 7), nz(-7, 7)];
    return { kind, task: bracketText(k, t), answer: k * (t[0]! + t[1]! + t[2]!) };
  }
  // Vorzeichen bestimmen: Antwort 1 (plus) oder −1 (minus)
  const f = Array.from({ length: int(3, 6) }, () => nz(-9, 9));
  return { kind: 'sign', task: f.map((x, i) => (i ? par(x) : fmtInt(x))).join(' · '), answer: productSign(f) };
}

/** Liest eine ganze Zahl (auch mit „−“ oder „+“); null, wenn keine Zahl. */
export function parseInt2(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace('−', '-').replace(/^\+/, '');
  if (!/^-?\d+$/.test(s)) return null;
  return Number(s);
}

export function checkDrill(d: Drill, input: string): boolean | null {
  const t = input.trim();
  if (d.kind === 'sign') {
    if (t === '+' || t === 'plus') return d.answer === 1;
    if (t === '−' || t === '-' || t === 'minus') return d.answer === -1;
  }
  const x = parseInt2(t);
  if (x === null) return null;
  return x === d.answer;
}

/* ------------------------------------------------------------------ */
/* Punkt vor Strich mit Vorzeichen                                     */
/* ------------------------------------------------------------------ */

export interface Expr {
  /** Rechenschritte als Text, vom Ausdruck bis zum Ergebnis */
  steps: string[];
  /** Erklärung zu jedem Schritt (Schlüssel für Texte) */
  notes: ('start' | 'dot' | 'signs' | 'sum')[];
  value: number;
}

/** Summand mit Vorzeichen als Text: „+ 3“, „− 3“, „+ (−3)“ */
function joinSigned(op: '+' | '−', x: string): string {
  return ` ${op} ${x}`;
}

/** Ausdruck a ± b·c ± d:e mit ganzzahligen Ergebnissen und den Rechenschritten. */
export function makeExpr(n: number): Expr {
  const r = rng(n * 131 + 7);
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const nz = (lo: number, hi: number) => {
    let v = 0;
    while (v === 0) v = int(lo, hi);
    return v;
  };
  const a = nz(-9, 9);
  const b = nz(-6, 6);
  const c = -int(2, 6) * (r() < 0.6 ? 1 : -1);
  const e = int(2, 4) * (r() < 0.5 ? 1 : -1);
  const d = e * nz(-5, 5);
  const op1: '+' | '−' = r() < 0.5 ? '+' : '−';
  const op2: '+' | '−' = r() < 0.5 ? '+' : '−';
  const bc = b * c;
  const de = d / e;
  const s0 = `${fmtInt(a)}${joinSigned(op1, `${par(b)} · ${par(c)}`)}${joinSigned(op2, `${par(d)} : ${par(e)}`)}`;
  const s1 = `${fmtInt(a)}${joinSigned(op1, par(bc))}${joinSigned(op2, par(de))}`;
  // Rechen- und Vorzeichen zusammenfassen: + (−x) = − x, − (−x) = + x
  const t1 = op1 === '+' ? bc : -bc;
  const t2 = op2 === '+' ? de : -de;
  const sg = (x: number) => (x < 0 ? ` − ${-x}` : ` + ${x}`);
  const s2 = `${fmtInt(a)}${sg(t1)}${sg(t2)}`;
  const value = a + t1 + t2;
  // Ohne Klammern im zweiten Schritt gibt es nichts zusammenzufassen
  if (s1 === s2) return { steps: [s0, s1, fmtInt(value)], notes: ['start', 'dot', 'sum'], value };
  return { steps: [s0, s1, s2, fmtInt(value)], notes: ['start', 'dot', 'signs', 'sum'], value };
}

/* ------------------------------------------------------------------ */
/* Klammern auflösen                                                   */
/* ------------------------------------------------------------------ */

/** k · (t₁ + t₂ + t₃) als Text, z. B. „−2 · (3 − 5 + 1)“ bzw. „−(3 − 5 + 1)“. */
export function bracketText(k: number, t: readonly number[]): string {
  const inner = t.map((x, i) => (i === 0 ? fmtInt(x) : x < 0 ? ` − ${-x}` : ` + ${x}`)).join('');
  if (k === -1) return `${MINUS}(${inner})`;
  if (k === 1) return `+(${inner})`;
  return `${fmtInt(k)} · (${inner})`;
}

/** Aufgelöste Klammer: jeder Summand mit k multipliziert. */
export function expandBracket(k: number, t: readonly number[]): number[] {
  return t.map((x) => k * x);
}

/** Summe als Text ohne Klammern: „−6 + 10 − 2“. */
export function sumText(t: readonly number[]): string {
  return t.map((x, i) => (i === 0 ? fmtInt(x) : x < 0 ? ` − ${-x}` : ` + ${x}`)).join('');
}
