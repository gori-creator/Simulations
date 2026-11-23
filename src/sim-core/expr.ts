/**
 * Terme (Kern): lesen, auswerten, vereinfachen, als Text ausgeben und
 * schrittweise nach den Ableitungsregeln ableiten. Benutzt von der
 * Ableitungs-Werkstatt und den Integrationsregeln.
 *
 * Ein Term ist ein Baum (`Expr`). `derive` liefert die Ableitung und eine
 * Liste von Schritten (`Step`): Welche Regel wurde auf welchen Teilterm
 * angewendet, mit welchen Teilen (u, v bzw. äußere und innere Funktion)?
 * Alles ohne Zeichnen, geprüft in tests/ableitungsregeln.test.ts
 * und tests/integrationsregeln.test.ts.
 */

export type Fn = 'sin' | 'cos' | 'tan' | 'exp' | 'ln' | 'sqrt' | 'abs';

export type Expr =
  | { k: 'num'; v: number }
  | { k: 'x' }
  | { k: 'e' }
  | { k: 'pi' }
  | { k: 'neg'; a: Expr }
  | { k: 'add'; a: Expr; b: Expr }
  | { k: 'sub'; a: Expr; b: Expr }
  | { k: 'mul'; a: Expr; b: Expr }
  | { k: 'div'; a: Expr; b: Expr }
  | { k: 'pow'; a: Expr; b: Expr }
  | { k: 'fn'; f: Fn; a: Expr };

/* ------------------------------------------------------------------ */
/* Bausteine                                                           */
/* ------------------------------------------------------------------ */

export const num = (v: number): Expr => ({ k: 'num', v });
export const X: Expr = { k: 'x' };
export const add = (a: Expr, b: Expr): Expr => ({ k: 'add', a, b });
export const sub = (a: Expr, b: Expr): Expr => ({ k: 'sub', a, b });
export const mul = (a: Expr, b: Expr): Expr => ({ k: 'mul', a, b });
export const div = (a: Expr, b: Expr): Expr => ({ k: 'div', a, b });
export const pow = (a: Expr, b: Expr): Expr => ({ k: 'pow', a, b });
export const neg = (a: Expr): Expr => ({ k: 'neg', a });
export const fn = (f: Fn, a: Expr): Expr => ({ k: 'fn', f, a });

/** Kommt x im Term vor? */
export function hasX(e: Expr): boolean {
  switch (e.k) {
    case 'x':
      return true;
    case 'num':
    case 'e':
    case 'pi':
      return false;
    case 'neg':
    case 'fn':
      return hasX(e.a);
    default:
      return hasX(e.a) || hasX(e.b);
  }
}

/** Gleiche Bäume? */
export function same(a: Expr, b: Expr): boolean {
  if (a.k !== b.k) return false;
  switch (a.k) {
    case 'num':
      return Math.abs(a.v - (b as { v: number }).v) < 1e-12;
    case 'x':
    case 'e':
    case 'pi':
      return true;
    case 'neg':
      return same(a.a, (b as { a: Expr }).a);
    case 'fn':
      return a.f === (b as { f: Fn }).f && same(a.a, (b as { a: Expr }).a);
    default:
      return same(a.a, (b as { a: Expr }).a) && same(a.b, (b as { b: Expr }).b);
  }
}

/* ------------------------------------------------------------------ */
/* Auswerten                                                           */
/* ------------------------------------------------------------------ */

/** Wert des Terms an der Stelle x (NaN außerhalb der Definitionsmenge). */
export function evaluate(e: Expr, x: number): number {
  switch (e.k) {
    case 'num':
      return e.v;
    case 'x':
      return x;
    case 'e':
      return Math.E;
    case 'pi':
      return Math.PI;
    case 'neg':
      return -evaluate(e.a, x);
    case 'add':
      return evaluate(e.a, x) + evaluate(e.b, x);
    case 'sub':
      return evaluate(e.a, x) - evaluate(e.b, x);
    case 'mul':
      return evaluate(e.a, x) * evaluate(e.b, x);
    case 'div': {
      const d = evaluate(e.b, x);
      return d === 0 ? NaN : evaluate(e.a, x) / d;
    }
    case 'pow': {
      const b = evaluate(e.a, x);
      const p = evaluate(e.b, x);
      // ungerade Wurzeln negativer Zahlen: (−8)^(1/3) = −2
      if (b < 0 && !Number.isInteger(p)) {
        const q = Math.round(1 / p);
        if (Math.abs(1 / p - q) < 1e-9 && q % 2 !== 0) return -Math.pow(-b, p);
        return NaN;
      }
      return Math.pow(b, p);
    }
    case 'fn': {
      const a = evaluate(e.a, x);
      switch (e.f) {
        case 'sin':
          return Math.sin(a);
        case 'cos':
          return Math.cos(a);
        case 'tan':
          return Math.abs(Math.cos(a)) < 1e-12 ? NaN : Math.tan(a);
        case 'exp':
          return Math.exp(a);
        case 'ln':
          return a > 0 ? Math.log(a) : NaN;
        case 'sqrt':
          return a >= 0 ? Math.sqrt(a) : NaN;
        case 'abs':
          return Math.abs(a);
      }
    }
  }
}

/** Steigung über den symmetrischen Differenzenquotienten (zur Kontrolle). */
export function numericSlope(e: Expr, x: number, h = 1e-5): number {
  return (evaluate(e, x + h) - evaluate(e, x - h)) / (2 * h);
}

/* ------------------------------------------------------------------ */
/* Lesen                                                               */
/* ------------------------------------------------------------------ */

type Tok =
  | { t: 'num'; v: number; p: number }
  | { t: 'id'; v: string; p: number }
  | { t: 'op'; v: string; p: number }
  | { t: '('; p: number }
  | { t: ')'; p: number }
  | { t: 'end'; p: number };

export type ParseResult = { ok: true; e: Expr } | { ok: false; pos: number; msg: 'empty' | 'token' | 'paren' | 'end' | 'func' };

const FN_NAMES: Record<string, Fn> = { sin: 'sin', cos: 'cos', tan: 'tan', exp: 'exp', ln: 'ln', sqrt: 'sqrt', wurzel: 'sqrt', root: 'sqrt', '√': 'sqrt', abs: 'abs', betrag: 'abs' };
const SUPER: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };

function tokenize(src: string): Tok[] | { pos: number } {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || ((c === ',' || c === '.') && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j]!)) j++;
      if ((src[j] === ',' || src[j] === '.') && /[0-9]/.test(src[j + 1] ?? '')) {
        j++;
        while (j < src.length && /[0-9]/.test(src[j]!)) j++;
      }
      out.push({ t: 'num', v: Number(src.slice(i, j).replace(',', '.')), p: i });
      i = j;
      continue;
    }
    if (c in SUPER) {
      // Hochzahlen wie x² → ^2
      let j = i;
      let s = '';
      while (j < src.length && src[j]! in SUPER) s += SUPER[src[j++]!];
      out.push({ t: 'op', v: '^', p: i });
      if (s.startsWith('-')) out.push({ t: 'op', v: '-', p: i });
      const digits = s.replace('-', '');
      if (!digits) return { pos: i };
      out.push({ t: 'num', v: Number(digits), p: i });
      i = j;
      continue;
    }
    if (c === '√') {
      out.push({ t: 'id', v: '√', p: i });
      i++;
      continue;
    }
    if (c === 'π') {
      out.push({ t: 'id', v: 'pi', p: i });
      i++;
      continue;
    }
    if (/[a-zA-ZäöüÄÖÜ]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-ZäöüÄÖÜ]/.test(src[j]!)) j++;
      const word = src.slice(i, j).toLowerCase();
      // Wörter zerlegen: „xsin“ → x sin, „ex“ → e x
      let k = 0;
      while (k < word.length) {
        const rest = word.slice(k);
        const name = ['sqrt', 'wurzel', 'root', 'betrag', 'abs', 'sin', 'cos', 'tan', 'exp', 'ln', 'pi'].find((n) => rest.startsWith(n));
        if (name) {
          out.push({ t: 'id', v: name, p: i + k });
          k += name.length;
        } else if (rest[0] === 'x' || rest[0] === 'e') {
          out.push({ t: 'id', v: rest[0], p: i + k });
          k += 1;
        } else return { pos: i + k };
      }
      i = j;
      continue;
    }
    if ('+-−*·×/:^'.includes(c)) {
      const v = c === '−' ? '-' : c === '·' || c === '×' ? '*' : c === ':' ? '/' : c;
      out.push({ t: 'op', v, p: i });
      i++;
      continue;
    }
    if (c === '(' || c === '[') {
      out.push({ t: '(', p: i });
      i++;
      continue;
    }
    if (c === ')' || c === ']') {
      out.push({ t: ')', p: i });
      i++;
      continue;
    }
    return { pos: i };
  }
  out.push({ t: 'end', p: src.length });
  return out;
}

/**
 * Term lesen: + − · * / : ^, Klammern ( ) [ ], Dezimalkomma, Hochzahlen
 * wie x², Funktionen sin, cos, tan, exp, ln, sqrt (√), Konstanten e und π.
 * Malpunkte dürfen fehlen: „2x“, „3sin(x)“, „x(x+1)“.
 */
export function parse(src: string): ParseResult {
  if (!src.trim()) return { ok: false, pos: 0, msg: 'empty' };
  const toks = tokenize(src);
  if (!Array.isArray(toks)) return { ok: false, pos: toks.pos, msg: 'token' };
  let i = 0;
  const peek = () => toks[i]!;
  const fail = (msg: 'token' | 'paren' | 'end' | 'func'): never => {
    throw { pos: peek().p, msg };
  };
  const startsFactor = (t: Tok) => t.t === 'num' || t.t === 'id' || t.t === '(';

  function expr(): Expr {
    let e = term();
    for (;;) {
      const t = peek();
      if (t.t === 'op' && (t.v === '+' || t.v === '-')) {
        i++;
        const b = term();
        e = t.v === '+' ? add(e, b) : sub(e, b);
      } else return e;
    }
  }
  function term(): Expr {
    let e = unary();
    for (;;) {
      const t = peek();
      if (t.t === 'op' && (t.v === '*' || t.v === '/')) {
        i++;
        const b = unary();
        e = t.v === '*' ? mul(e, b) : div(e, b);
      } else if (startsFactor(t)) {
        e = mul(e, power());
      } else return e;
    }
  }
  function unary(): Expr {
    const t = peek();
    if (t.t === 'op' && (t.v === '-' || t.v === '+')) {
      i++;
      const a = unary();
      return t.v === '-' ? (a.k === 'num' ? num(-a.v) : neg(a)) : a;
    }
    return power();
  }
  function power(): Expr {
    const base = primary();
    const t = peek();
    if (t.t === 'op' && t.v === '^') {
      i++;
      return pow(base, unary());
    }
    return base;
  }
  function primary(): Expr {
    const t = peek();
    if (t.t === 'num') {
      i++;
      return num(t.v);
    }
    if (t.t === '(') {
      i++;
      const e = expr();
      if (peek().t !== ')') fail('paren');
      i++;
      return e;
    }
    if (t.t === 'id') {
      i++;
      if (t.v === 'x') return X;
      if (t.v === 'e') return { k: 'e' };
      if (t.v === 'pi') return { k: 'pi' };
      const f = FN_NAMES[t.v];
      if (!f) return fail('token');
      // Funktion: mit Klammer oder direkt vor einem Faktor („sin x“, „√x“)
      if (peek().t === '(') {
        i++;
        const a = expr();
        if (peek().t !== ')') fail('paren');
        i++;
        // sin(x)^2 = (sin x)^2
        return fn(f, a);
      }
      if (!startsFactor(peek())) fail('func');
      return fn(f, power());
    }
    if (t.t === 'end') return fail('end');
    return fail('token');
  }
  try {
    const e = expr();
    if (peek().t !== 'end') fail(peek().t === ')' ? 'paren' : 'token');
    return { ok: true, e };
  } catch (err) {
    const o = err as { pos: number; msg: 'token' | 'paren' | 'end' | 'func' };
    return { ok: false, pos: o.pos, msg: o.msg };
  }
}

/* ------------------------------------------------------------------ */
/* Vereinfachen                                                        */
/* ------------------------------------------------------------------ */

const isNum = (e: Expr): e is { k: 'num'; v: number } => e.k === 'num';
/** Zahl mit genau diesem Wert? (kein Typwächter, damit `else`-Zweige nicht eingeengt werden) */
const isVal = (e: Expr, v: number): boolean => e.k === 'num' && Math.abs(e.v - v) < 1e-12;

/** Faktoren eines Produkts (verschachtelte mul aufgelöst). */
function factors(e: Expr): Expr[] {
  return e.k === 'mul' ? [...factors(e.a), ...factors(e.b)] : [e];
}

/** Vereinfacht einen Term (Zahlen zusammenfassen, 0 und 1 entfernen, Zahlen nach vorn). */
export function simplify(e: Expr): Expr {
  let prev = e;
  for (let k = 0; k < 12; k++) {
    const next = step(prev);
    if (same(next, prev)) return next;
    prev = next;
  }
  return prev;
}

function step(e: Expr): Expr {
  switch (e.k) {
    case 'num':
    case 'x':
    case 'e':
    case 'pi':
      return e;
    case 'neg': {
      const a = step(e.a);
      if (isNum(a)) return num(-a.v);
      if (a.k === 'neg') return a.a;
      if (a.k === 'mul' && isNum(a.a)) return mul(num(-a.a.v), a.b);
      return neg(a);
    }
    case 'fn': {
      const a = step(e.a);
      if (e.f === 'ln' && a.k === 'e') return num(1);
      if (e.f === 'ln' && isVal(a, 1)) return num(0);
      if (e.f === 'exp' && isVal(a, 0)) return num(1);
      if ((e.f === 'sin' || e.f === 'tan') && isVal(a, 0)) return num(0);
      if (e.f === 'cos' && isVal(a, 0)) return num(1);
      return fn(e.f, a);
    }
    case 'add': {
      const a = step(e.a);
      const b = step(e.b);
      if (isNum(a) && isNum(b)) return num(a.v + b.v);
      if (isVal(a, 0)) return b;
      if (isVal(b, 0)) return a;
      if (b.k === 'neg') return sub(a, b.a);
      if (isNum(b) && b.v < 0) return sub(a, num(-b.v));
      if (b.k === 'mul' && isNum(b.a) && b.a.v < 0) return sub(a, mul(num(-b.a.v), b.b));
      if (same(a, b)) return mul(num(2), a);
      return add(a, b);
    }
    case 'sub': {
      const a = step(e.a);
      const b = step(e.b);
      if (isNum(a) && isNum(b)) return num(a.v - b.v);
      if (isVal(b, 0)) return a;
      if (isVal(a, 0)) return neg(b);
      if (b.k === 'neg') return add(a, b.a);
      if (isNum(b) && b.v < 0) return add(a, num(-b.v));
      if (b.k === 'mul' && isNum(b.a) && b.a.v < 0) return add(a, mul(num(-b.a.v), b.b));
      if (same(a, b)) return num(0);
      return sub(a, b);
    }
    case 'mul': {
      // Faktoren sammeln: Zahlen multiplizieren und nach vorn, Vorzeichen herausziehen
      const fs = factors(mul(step(e.a), step(e.b))).map((f) => f);
      let c = 1;
      const rest: Expr[] = [];
      for (const f of fs) {
        if (isNum(f)) c *= f.v;
        else if (f.k === 'neg') {
          c = -c;
          rest.push(f.a);
        } else rest.push(f);
      }
      if (c === 0) return num(0);
      // gleiche Faktoren zu Potenzen: x · x → x², x · x² → x³
      const merged: Expr[] = [];
      for (const f of rest) {
        const base = f.k === 'pow' && isNum(f.b) ? f.a : f;
        const ex = f.k === 'pow' && isNum(f.b) ? f.b.v : 1;
        const idx = merged.findIndex((m) => same(m.k === 'pow' && isNum(m.b) ? m.a : m, base));
        if (idx >= 0 && (base.k === 'x' || base.k === 'fn')) {
          const m = merged[idx]!;
          const mex = m.k === 'pow' && isNum(m.b) ? m.b.v : 1;
          merged[idx] = pow(base, num(mex + ex));
        } else merged.push(f);
      }
      // Reihenfolge: Potenzen von x vor Funktionen (2x·sin x statt sin x·2x)
      merged.sort((p, q) => rank(p) - rank(q));
      if (merged.length === 0) return num(c);
      // Zahl an den ersten Faktor: 2x · sin(x) statt 2 · (x · sin(x))
      let out: Expr = c === 1 || c === -1 ? merged[0]! : mul(num(c), merged[0]!);
      for (const f of merged.slice(1)) out = mul(out, f);
      return c === -1 ? neg(out) : out;
    }
    case 'div': {
      const a = step(e.a);
      const b = step(e.b);
      if (isVal(b, 1)) return a;
      if (isVal(a, 0)) return num(0);
      if (isNum(a) && isNum(b) && b.v !== 0) return num(a.v / b.v);
      if (isNum(b) && b.v !== 0) return mul(num(1 / b.v), a);
      if (same(a, b)) return num(1);
      if (a.k === 'neg') return neg(div(a.a, b));
      return div(a, b);
    }
    case 'pow': {
      const a = step(e.a);
      const b = step(e.b);
      if (isVal(b, 1)) return a;
      if (isVal(b, 0)) return num(1);
      if (isNum(a) && isNum(b)) {
        const v = Math.pow(a.v, b.v);
        if (Number.isFinite(v) && Math.abs(v - Math.round(v * 1e9) / 1e9) < 1e-9) return num(v);
      }
      if (a.k === 'pow' && isNum(a.b) && isNum(b)) return pow(a.a, num(a.b.v * b.v));
      if (a.k === 'e') return fn('exp', b);
      return pow(a, b);
    }
  }
}

function rank(e: Expr): number {
  if (e.k === 'x' || (e.k === 'pow' && e.a.k === 'x')) return 0;
  if (e.k === 'pow') return 1;
  if (e.k === 'fn') return e.f === 'exp' ? 3 : 2;
  return 1;
}

/* ------------------------------------------------------------------ */
/* Ableiten mit Schritten                                              */
/* ------------------------------------------------------------------ */

export type RuleId =
  | 'const' // Konstante
  | 'x' // (x)′ = 1
  | 'sum' // Summen- bzw. Differenzregel
  | 'factor' // Faktorregel
  | 'power' // Potenzregel (x^n)′ = n·x^(n−1)
  | 'product' // Produktregel
  | 'quotient' // Quotientenregel
  | 'chain' // Kettenregel
  | 'sin'
  | 'cos'
  | 'tan'
  | 'exp'
  | 'ln'
  | 'sqrt'
  | 'abs'
  | 'expA'; // (a^x)′ = a^x · ln a

export interface Part {
  /** Rolle: u, v (Produkt/Quotient/Summe), c (Faktor), outer/inner (Kette). */
  role: 'u' | 'v' | 'c' | 'outer' | 'inner';
  expr: Expr;
  /** Ableitung des Teils (bei c und outer nicht nötig). */
  d?: Expr;
}

export interface Step {
  rule: RuleId;
  /** Abgeleiteter Teilterm. */
  expr: Expr;
  /** Teile (u, v, innere, äußere Funktion). */
  parts: Part[];
  /** Ergebnis nach der Regel (noch nicht vereinfacht). */
  raw: Expr;
  /** Ergebnis vereinfacht. */
  result: Expr;
  /** Tiefe im Baum (0 = ganzer Term). */
  depth: number;
}

export class NotSupported extends Error {}

/** Ableitung mit allen Schritten (Schritte in der Reihenfolge von außen nach innen). */
export function derive(e: Expr): { d: Expr; steps: Step[] } {
  const steps: Step[] = [];
  const d = simplify(go(e, 0, steps));
  // Reihenfolge: zuerst der ganze Term, dann die Teile
  steps.sort((a, b) => a.depth - b.depth);
  return { d, steps };
}

function record(steps: Step[], rule: RuleId, expr: Expr, parts: Part[], raw: Expr, depth: number): Expr {
  steps.push({ rule, expr, parts, raw, result: simplify(raw), depth });
  return raw;
}

function go(e: Expr, depth: number, steps: Step[]): Expr {
  if (!hasX(e)) return num(0);
  switch (e.k) {
    case 'x':
      return num(1);
    case 'neg': {
      const da = go(e.a, depth + 1, steps);
      return record(steps, 'factor', e, [{ role: 'c', expr: num(-1) }, { role: 'u', expr: e.a, d: da }], neg(da), depth);
    }
    case 'add':
    case 'sub': {
      const da = go(e.a, depth + 1, steps);
      const db = go(e.b, depth + 1, steps);
      const raw = e.k === 'add' ? add(da, db) : sub(da, db);
      return record(steps, 'sum', e, [{ role: 'u', expr: e.a, d: da }, { role: 'v', expr: e.b, d: db }], raw, depth);
    }
    case 'mul': {
      if (!hasX(e.a) || !hasX(e.b)) {
        const c = hasX(e.a) ? e.b : e.a;
        const u = hasX(e.a) ? e.a : e.b;
        const du = go(u, depth + 1, steps);
        return record(steps, 'factor', e, [{ role: 'c', expr: c }, { role: 'u', expr: u, d: du }], mul(c, du), depth);
      }
      const du = go(e.a, depth + 1, steps);
      const dv = go(e.b, depth + 1, steps);
      return record(steps, 'product', e, [{ role: 'u', expr: e.a, d: du }, { role: 'v', expr: e.b, d: dv }], add(mul(du, e.b), mul(e.a, dv)), depth);
    }
    case 'div': {
      if (!hasX(e.b)) {
        const du = go(e.a, depth + 1, steps);
        return record(steps, 'factor', e, [{ role: 'c', expr: div(num(1), e.b) }, { role: 'u', expr: e.a, d: du }], div(du, e.b), depth);
      }
      const du = go(e.a, depth + 1, steps);
      const dv = go(e.b, depth + 1, steps);
      return record(steps, 'quotient', e, [{ role: 'u', expr: e.a, d: du }, { role: 'v', expr: e.b, d: dv }], div(sub(mul(du, e.b), mul(e.a, dv)), pow(e.b, num(2))), depth);
    }
    case 'pow': {
      if (hasX(e.a) && !hasX(e.b)) {
        // Potenzregel, bei innerer Funktion zusammen mit der Kettenregel
        const n = e.b;
        const outer = mul(n, pow(e.a, sub(n, num(1))));
        if (e.a.k === 'x') return record(steps, 'power', e, [], outer, depth);
        const di = go(e.a, depth + 1, steps);
        return record(steps, 'chain', e, [{ role: 'outer', expr: pow(X, n), d: mul(n, pow(X, sub(n, num(1)))) }, { role: 'inner', expr: e.a, d: di }], mul(outer, di), depth);
      }
      if (!hasX(e.a) && hasX(e.b)) {
        // a^u: bei e^u Kettenregel mit e^x, sonst (a^x)′ = a^x · ln a
        const isE = e.a.k === 'e';
        const outerD = isE ? e : mul(e, fn('ln', e.a));
        if (e.b.k === 'x') return record(steps, isE ? 'exp' : 'expA', e, [], outerD, depth);
        const di = go(e.b, depth + 1, steps);
        return record(steps, 'chain', e, [{ role: 'outer', expr: pow(e.a, X), d: isE ? pow(e.a, X) : mul(pow(e.a, X), fn('ln', e.a)) }, { role: 'inner', expr: e.b, d: di }], mul(outerD, di), depth);
      }
      throw new NotSupported('x^x');
    }
    case 'fn': {
      const a = e.a;
      if (e.f === 'ln' && a.k === 'fn' && a.f === 'abs') {
        // (ln|u|)′ = u′ / u
        if (a.a.k === 'x') return record(steps, 'ln', e, [], div(num(1), X), depth);
        const di = go(a.a, depth + 1, steps);
        return record(steps, 'chain', e, [{ role: 'outer', expr: fn('ln', fn('abs', X)), d: div(num(1), X) }, { role: 'inner', expr: a.a, d: di }], div(di, a.a), depth);
      }
      const outerD = basicDerivative(e.f, a);
      const rule: RuleId = e.f;
      if (a.k === 'x') return record(steps, rule, e, [], outerD, depth);
      const di = go(a, depth + 1, steps);
      return record(steps, 'chain', e, [{ role: 'outer', expr: fn(e.f, X), d: basicDerivative(e.f, X) }, { role: 'inner', expr: a, d: di }], mul(outerD, di), depth);
    }
    default:
      return num(0);
  }
}

/** Ableitung der Grundfunktion f an der Stelle a (ohne innere Ableitung). */
function basicDerivative(f: Fn, a: Expr): Expr {
  switch (f) {
    case 'sin':
      return fn('cos', a);
    case 'cos':
      return neg(fn('sin', a));
    case 'tan':
      return div(num(1), pow(fn('cos', a), num(2)));
    case 'exp':
      return fn('exp', a);
    case 'ln':
      return div(num(1), a);
    case 'sqrt':
      return div(num(1), mul(num(2), fn('sqrt', a)));
    case 'abs':
      // (|u|)′ = u / |u| (für u ≠ 0)
      return div(a, fn('abs', a));
  }
}

/** Ableitung ohne Schritte (bequem für Tests und Kontrollen). */
export function derivative(e: Expr): Expr {
  return derive(e).d;
}

/**
 * Stimmen zwei Terme als Funktionen überein? Vergleich an vielen Stellen,
 * an denen beide definiert sind (für die Kontrolle einer eigenen Ableitung).
 */
export function sameFunction(a: Expr, b: Expr): { equal: boolean; at?: number } {
  let tested = 0;
  // zuerst runde Stellen (für eine verständliche Rückmeldung), dann ein feines Raster
  const nice = [1, 0, -1, 2, -2, 0.5, 3, -3, 1.5, -0.5];
  const xs = [...nice, ...Array.from({ length: 41 }, (_, k) => -4.05 + k * 0.2 + 0.013 * Math.sin(k))];
  for (const x of xs) {
    const va = evaluate(a, x);
    const vb = evaluate(b, x);
    if (!Number.isFinite(va) || !Number.isFinite(vb)) {
      if (Number.isFinite(va) !== Number.isFinite(vb) && Math.abs(Number.isFinite(va) ? va : vb) < 1e6) return { equal: false, at: x };
      continue;
    }
    tested++;
    const tol = 1e-6 * Math.max(1, Math.abs(va), Math.abs(vb));
    if (Math.abs(va - vb) > tol) return { equal: false, at: x };
  }
  return { equal: tested >= 5 };
}

/* ------------------------------------------------------------------ */
/* Schreiben                                                           */
/* ------------------------------------------------------------------ */

const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/** Zahl als Text: Dezimalkomma (de), echtes Minus, höchstens 4 Nachkommastellen. */
export function numText(v: number, lang: 'de' | 'en' = 'de'): string {
  if (Math.abs(v - Math.PI) < 1e-12) return 'π';
  let s = String(Math.round(v * 1e4) / 1e4);
  if (s === '-0') s = '0';
  s = s.replace('-', '−');
  return lang === 'de' ? s.replace('.', ',') : s;
}

function supText(v: number): string | null {
  if (!Number.isInteger(v) || Math.abs(v) > 99) return null;
  const s = String(Math.abs(v))
    .split('')
    .map((d) => SUP_DIGITS[Number(d)])
    .join('');
  return (v < 0 ? '⁻' : '') + s;
}

/** Vorrang zum Klammern: Summe 1, Produkt 2, Vorzeichen 3, Potenz 4, Atom 5. */
function prec(e: Expr): number {
  switch (e.k) {
    case 'add':
    case 'sub':
      return 1;
    case 'mul':
    case 'div':
      return 2;
    case 'neg':
      return 3;
    case 'num':
      return e.v < 0 ? 3 : 5;
    case 'pow':
      return 4;
    default:
      return 5;
  }
}

/**
 * Term als gut lesbarer Text: „2x · sin(x)“, „x²“, „e^(2x + 1)“, „−3x⁴“.
 * Malpunkte entfallen zwischen Zahl und x bzw. x-Potenz.
 */
export function toText(e: Expr, lang: 'de' | 'en' = 'de'): string {
  const wrap = (s: string, need: boolean) => (need ? `(${s})` : s);
  const t = (x: Expr) => toText(x, lang);
  switch (e.k) {
    case 'num':
      return numText(e.v, lang);
    case 'x':
      return 'x';
    case 'e':
      return 'e';
    case 'pi':
      return 'π';
    case 'neg':
      return `−${wrap(t(e.a), prec(e.a) <= 2 && e.a.k !== 'mul')}`;
    case 'add':
      return `${t(e.a)} + ${wrap(t(e.b), prec(e.b) <= 1 || (e.b.k === 'num' && e.b.v < 0) || e.b.k === 'neg')}`;
    case 'sub':
      return `${t(e.a)} − ${wrap(t(e.b), prec(e.b) <= 1 || (e.b.k === 'num' && e.b.v < 0) || e.b.k === 'neg')}`;
    case 'mul': {
      const a = e.a;
      const b = e.b;
      // Zahl vor x, x-Potenz oder Klammer: ohne Malpunkt („2x“, „3x²“)
      const tight = a.k === 'num' && (b.k === 'x' || (b.k === 'pow' && b.a.k === 'x'));
      if (a.k === 'num' && a.v === -1) return `−${wrap(t(b), prec(b) <= 2 && b.k !== 'mul')}`;
      const left = wrap(t(a), prec(a) <= 1 || a.k === 'div');
      const right = wrap(t(b), prec(b) <= 1 || (b.k === 'num' && b.v < 0) || b.k === 'neg');
      return tight ? `${left}${right}` : `${left} · ${right}`;
    }
    case 'div': {
      const left = wrap(t(e.a), prec(e.a) <= 2);
      const right = wrap(t(e.b), prec(e.b) <= 3);
      return `${left} / ${right}`;
    }
    case 'pow': {
      const base = e.a;
      const ex = e.b;
      // sin²(x) statt (sin(x))²
      if (base.k === 'fn' && base.f !== 'exp' && base.f !== 'sqrt' && ex.k === 'num' && ex.v > 0) {
        const s = supText(ex.v);
        if (s) return `${base.f}${s}(${t(base.a)})`;
      }
      const baseT = wrap(t(base), prec(base) <= 4 || base.k === 'fn');
      if (ex.k === 'num') {
        const s = supText(ex.v);
        if (s) return `${baseT}${s}`;
      }
      return `${baseT}^${wrap(t(ex), prec(ex) < 5)}`;
    }
    case 'fn': {
      if (e.f === 'exp') return `e^${wrap(t(e.a), prec(e.a) < 5 || e.a.k === 'fn')}`;
      if (e.f === 'sqrt') return `√${wrap(t(e.a), e.a.k !== 'x' && e.a.k !== 'num')}`;
      if (e.f === 'abs') return `|${t(e.a)}|`;
      return `${e.f}(${t(e.a)})`;
    }
  }
}

/** Setzt für x einen Term ein (äußere Funktion an der Stelle der inneren). */
export function substitute(e: Expr, inner: Expr): Expr {
  switch (e.k) {
    case 'x':
      return inner;
    case 'num':
    case 'e':
    case 'pi':
      return e;
    case 'neg':
      return neg(substitute(e.a, inner));
    case 'fn':
      return fn(e.f, substitute(e.a, inner));
    default:
      return { k: e.k, a: substitute(e.a, inner), b: substitute(e.b, inner) } as Expr;
  }
}

/**
 * Hauptschritt für die Anzeige: Eine Summe mit einer Konstanten
 * („2 sin(3(x − 1)) + 1“) ist didaktisch uninteressant – dann zählt der
 * Schritt für den nicht konstanten Teil.
 */
export function mainStep(steps: Step[]): Step | undefined {
  let top = steps[0];
  for (let guard = 0; top && guard < 6; guard++) {
    if (top.rule !== 'sum') return top;
    const nonConst = top.parts.filter((q) => hasX(q.expr));
    if (nonConst.length !== 1) return top;
    const next = steps.find((st) => st.expr === nonConst[0]!.expr);
    if (!next) return top;
    top = next;
  }
  return top;
}
