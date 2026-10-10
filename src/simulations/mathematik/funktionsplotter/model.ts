/**
 * Funktionsplotter: eigene Terme lesen, auswerten und numerisch untersuchen.
 *
 * - Sicherer Parser ohne `eval` für + − · : / ^, Klammern ( ) [ ], Betrags-
 *   striche | |, Dezimalzahlen (Komma oder Punkt), Hochzahlen (², ⁻¹),
 *   implizites Mal (2x, 3(x + 1), x sin x), die Konstanten π und e, die
 *   Parameter a und b sowie sin, cos, tan, √ / sqrt, abs, exp, ln, lg, log
 *   und log_b. Funktionen ohne Klammer nehmen das folgende Produkt als
 *   Argument („sin 2x“ = sin(2x)); „sin²x“ ist (sin x)².
 * - Fehler werden mit Position und Grund gemeldet (für freundliche Meldungen).
 * - Numerik auf dem sichtbaren Bereich: Abtasten mit Erkennung von Polstellen,
 *   Sprüngen und Rändern der Definitionsmenge (keine senkrechten
 *   Verbindungslinien), Nullstellen (auch Berührstellen), Extrempunkte,
 *   Schnittpunkte, hebbare Definitionslücken, Ableitung und Einpassen.
 */

export type Lang = 'de' | 'en';

/* ------------------------------------------------------------------ */
/* Syntaxbaum                                                          */
/* ------------------------------------------------------------------ */

export type FnName = 'sin' | 'cos' | 'tan' | 'sqrt' | 'exp' | 'ln' | 'lg' | 'log';
export type ParamName = 'a' | 'b';
export type Bracket = '(' | '[';

interface Base {
  /** Vom Benutzer gesetzte Klammer um diesen Teilterm (sonst null). */
  br: Bracket | null;
}

export type Node =
  | (Base & { k: 'num'; v: number; s: string })
  | (Base & { k: 'x' })
  | (Base & { k: 'par'; name: ParamName })
  | (Base & { k: 'const'; name: 'pi' | 'e' })
  | (Base & { k: 'neg'; arg: Node })
  | (Base & { k: 'add'; op: '+' | '-'; l: Node; r: Node })
  | (Base & { k: 'mul'; op: '*' | '/' | ':'; l: Node; r: Node; implicit: boolean })
  | (Base & { k: 'pow'; base: Node; exp: Node; sup: boolean })
  | (Base & { k: 'abs'; arg: Node })
  | (Base & {
      k: 'call';
      fn: FnName;
      arg: Node;
      /** Basis bei log_b. */
      logBase?: number;
      /** Hochzahl direkt am Funktionsnamen (sin²x). */
      power?: Node;
      /** Mit dem Zeichen √ geschrieben. */
      sym: boolean;
      /** Argument ohne Klammer geschrieben (sin x). */
      bare: boolean;
    });

export type ErrorCode =
  | 'badChar'
  | 'equals'
  | 'unknownName'
  | 'yVar'
  | 'otherVar'
  | 'decimal'
  | 'numTooLong'
  | 'expectOperand'
  | 'startOperator'
  | 'missingOp'
  | 'varDigit'
  | 'unclosed'
  | 'unexpectedClose'
  | 'mismatch'
  | 'emptyParens'
  | 'fnNoArg'
  | 'absUnclosed'
  | 'emptyAbs'
  | 'logBase'
  | 'tooLong'
  | 'tooDeep';

export interface ParseError {
  code: ErrorCode;
  /** Bereich im eingegebenen Text [pos, end). */
  pos: number;
  end: number;
  a?: string;
  b?: string;
}

export interface Parsed {
  node: Node;
  /** Vorkommende Parameter. */
  params: ParamName[];
  /** Kommen Winkelfunktionen vor? (dann bietet sich die π-Achse an) */
  trig: boolean;
}

export type ParseResult = { ok: true; term: Parsed } | { ok: false; error: ParseError } | { ok: 'empty' };

/* ------------------------------------------------------------------ */
/* Zerlegen in Zeichen (Tokens)                                        */
/* ------------------------------------------------------------------ */

type Op = '+' | '-' | '*' | '/' | ':' | '^';

type Tok =
  | { t: 'num'; v: number; s: string; raw: string; pos: number; end: number }
  | { t: 'x' | 'pi' | 'e'; pos: number; end: number }
  | { t: 'par'; name: ParamName; pos: number; end: number }
  | { t: 'fn'; fn: FnName | 'abs'; name: string; logBase?: number; pos: number; end: number }
  | { t: 'op'; op: Op; ch: string; pos: number; end: number }
  | { t: 'open'; br: Bracket; pos: number; end: number }
  | { t: 'close'; br: Bracket; ch: string; pos: number; end: number }
  | { t: 'bar'; pos: number; end: number }
  | { t: 'sup'; v: number; s: string; pos: number; end: number }
  | { t: 'root'; pos: number; end: number };

class TermError extends Error {
  constructor(readonly info: ParseError) {
    super(info.code);
  }
}

const fail = (code: ErrorCode, pos: number, end = pos + 1, a?: string, b?: string): never => {
  throw new TermError({ code, pos, end: Math.max(end, pos + 1), a, b });
};

const OPS: Record<string, Op> = {
  '+': '+',
  '-': '-',
  '−': '-',
  '–': '-',
  '*': '*',
  '·': '*',
  '⋅': '*',
  '∙': '*',
  '×': '*',
  '/': '/',
  '÷': ':',
  ':': ':',
  '^': '^',
};

const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
const SUB: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

/** Bekannte Namen (Kleinschreibung); längster Treffer zuerst. */
const NAMES: [string, Tok['t'] | FnName | 'abs' | ParamName][] = (
  [
    ['wurzel', 'sqrt'],
    ['betrag', 'abs'],
    ['sqrt', 'sqrt'],
    ['sin', 'sin'],
    ['cos', 'cos'],
    ['tan', 'tan'],
    ['abs', 'abs'],
    ['exp', 'exp'],
    ['log', 'log'],
    ['ln', 'ln'],
    ['lg', 'lg'],
    ['pi', 'pi'],
    ['x', 'x'],
    ['e', 'e'],
    ['a', 'a'],
    ['b', 'b'],
  ] as [string, Tok['t'] | FnName | 'abs' | ParamName][]
).sort((p, q) => q[0].length - p[0].length);

/** Funktionsnamen für Vorschläge bei Tippfehlern. */
const SUGGEST: [string, string][] = [
  ['sinus', 'sin'],
  ['sinx', 'sin'],
  ['cosinus', 'cos'],
  ['kosinus', 'cos'],
  ['tangens', 'tan'],
  ['root', 'sqrt'],
  ['wurzel', 'sqrt'],
  ['sqr', 'sqrt'],
  ['sqroot', 'sqrt'],
  ['betrag', 'abs'],
  ['log10', 'lg'],
  ['loga', 'log'],
  ['logn', 'ln'],
  ['exponential', 'exp'],
  ['arcsin', ''],
  ['arccos', ''],
  ['arctan', ''],
  ['asin', ''],
  ['acos', ''],
  ['atan', ''],
  ['sinh', ''],
  ['cosh', ''],
  ['tanh', ''],
  ['cot', ''],
  ['sec', ''],
  ['csc', ''],
];

/** Abstand zweier Wörter (Levenshtein mit Vertauschung), für „Meintest du …?“. */
function editDistance(s: string, t: string): number {
  const d = Array.from({ length: s.length + 1 }, (_, i) => [i, ...Array<number>(t.length).fill(0)]);
  for (let j = 1; j <= t.length; j++) d[0]![j] = j;
  for (let i = 1; i <= s.length; i++)
    for (let j = 1; j <= t.length; j++) {
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (s[i - 1] === t[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && s[i - 1] === t[j - 2] && s[i - 2] === t[j - 1]) d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + 1);
    }
  return d[s.length]![t.length]!;
}

/** Vorschlag für einen unbekannten Namen (oder ''). */
export function suggestName(name: string): string {
  const low = name.toLowerCase();
  const hit = SUGGEST.find(([w]) => w === low);
  if (hit) return hit[1];
  const fns = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'exp', 'ln', 'lg', 'log'];
  let best = '';
  let bestD = 3;
  for (const f of fns) {
    const dd = editDistance(low, f);
    if (dd < bestD && dd <= Math.max(1, Math.floor(f.length / 2))) {
      best = f;
      bestD = dd;
    }
  }
  return best;
}

/** Lässt sich ein Wort vollständig in bekannte Namen zerlegen? */
function splits(word: string): boolean {
  let k = 0;
  while (k < word.length) {
    const hit = NAMES.find(([n]) => word.startsWith(n, k));
    if (!hit) return false;
    k += hit[0].length;
  }
  return true;
}

/** Höchstens so viele Ziffern pro Zahl. */
const MAX_DIGITS = 12;
/** Höchstens so viele Zeichen (Tokens) pro Term. */
export const MAX_TOKENS = 80;
/** Höchste Verschachtelungstiefe. */
export const MAX_DEPTH = 24;

/**
 * Ein vorangestelltes „y =“ oder „f(x) =“ wird überlesen (durch Leerzeichen
 * ersetzt, damit die Fehlerpositionen stimmen).
 */
export function stripPrefix(src: string): string {
  const m = /^\s*(?:y|[fgh]\s*\(\s*x\s*\))\s*=/i.exec(src);
  return m ? ' '.repeat(m[0].length) + src.slice(m[0].length) : src;
}

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    // Zahlen: 12, 2,5, 2.5, ,5
    if (/[0-9]/.test(ch) || ((ch === ',' || ch === '.') && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i;
      while (/[0-9]/.test(src[j] ?? '')) j++;
      if (src[j] === ',' || src[j] === '.') {
        if (!/[0-9]/.test(src[j + 1] ?? '')) fail('decimal', j, j + 1, src.slice(i, j + 1));
        j++;
        while (/[0-9]/.test(src[j] ?? '')) j++;
      }
      const raw = src.slice(i, j).replace(',', '.');
      const s = raw.startsWith('.') ? `0${raw}` : raw;
      if (s.replace('.', '').replace(/^0+(?=\d)/, '').length > MAX_DIGITS) fail('numTooLong', i, j);
      toks.push({ t: 'num', v: Number(s), s, raw: src.slice(i, j), pos: i, end: j });
      i = j;
      continue;
    }
    // Namen: längster bekannter Name an jeder Stelle, sonst ist das ganze Wort unbekannt
    if (/[a-zA-ZäöüÄÖÜß]/.test(ch)) {
      let j = i;
      while (/[a-zA-ZäöüÄÖÜß]/.test(src[j] ?? '')) j++;
      const word = src.slice(i, j);
      const low = word.toLowerCase();
      const parts: Tok[] = [];
      let k = 0;
      while (k < low.length) {
        const hit = NAMES.find(([n]) => low.startsWith(n, k));
        if (!hit) {
          // Einzelner unbekannter Buchstabe (z. B. t in „tx“ oder y): als Variable melden
          if (splits(low.slice(k + 1))) fail(low[k] === 'y' ? 'yVar' : 'otherVar', i + k, i + k + 1, word[k]);
          fail('unknownName', i, j, word, suggestName(word));
        }
        const [n, kind] = hit!;
        const pos = i + k;
        const end = pos + n.length;
        if (kind === 'x' || kind === 'pi' || kind === 'e') parts.push({ t: kind, pos, end });
        else if (kind === 'a' || kind === 'b') parts.push({ t: 'par', name: kind, pos, end });
        else parts.push({ t: 'fn', fn: kind as FnName | 'abs', name: src.slice(pos, end).toLowerCase(), pos, end });
        k += n.length;
      }
      // log mit Basis: log_2, log₂ oder log2 (Ziffern direkt dahinter)
      const last = parts[parts.length - 1];
      if (last?.t === 'fn' && last.fn === 'log' && last.end === j) {
        let q = j;
        if (src[q] === '_') q++;
        let digits = '';
        for (;;) {
          const c = src[q];
          if (c === undefined) break;
          if (SUB[c]) digits += SUB[c];
          else if (/[0-9]/.test(c) || ((c === ',' || c === '.') && digits && /[0-9]/.test(src[q + 1] ?? ''))) digits += c === ',' ? '.' : c;
          else break;
          q++;
        }
        if (digits) {
          const base = Number(digits);
          if (!Number.isFinite(base) || base <= 0 || base === 1) fail('logBase', i + k - 3, q, digits.replace('.', ','));
          last.logBase = base;
          last.end = q;
          j = q;
        } else if (src[j] === '_') fail('logBase', j, j + 1, '');
      }
      toks.push(...parts);
      i = j;
      continue;
    }
    if (ch === 'π') {
      toks.push({ t: 'pi', pos: i, end: i + 1 });
      i++;
      continue;
    }
    if (ch === '√') {
      toks.push({ t: 'root', pos: i, end: i + 1 });
      i++;
      continue;
    }
    if (SUP[ch] !== undefined) {
      let j = i;
      let s = '';
      while (SUP[src[j] ?? ''] !== undefined) s += SUP[src[j++]!];
      const v = Number(s);
      if (!/^-?[0-9]+$/.test(s)) fail('expectOperand', i, j, '^');
      toks.push({ t: 'sup', v, s, pos: i, end: j });
      i = j;
      continue;
    }
    const op = OPS[ch];
    if (op) {
      toks.push({ t: 'op', op, ch: op === '-' ? '−' : op === '*' ? '·' : ch === '÷' ? ':' : ch, pos: i, end: i + 1 });
      i++;
      continue;
    }
    if (ch === '(' || ch === '[') {
      toks.push({ t: 'open', br: ch, pos: i, end: i + 1 });
      i++;
      continue;
    }
    if (ch === ')' || ch === ']') {
      toks.push({ t: 'close', br: ch === ')' ? '(' : '[', ch, pos: i, end: i + 1 });
      i++;
      continue;
    }
    if (ch === '|') {
      toks.push({ t: 'bar', pos: i, end: i + 1 });
      i++;
      continue;
    }
    fail(ch === '=' ? 'equals' : 'badChar', i, i + 1, ch);
  }
  if (toks.length > MAX_TOKENS) fail('tooLong', toks[MAX_TOKENS]!.pos, src.length);
  return toks;
}

/** Darstellung eines Tokens in Fehlermeldungen. */
function symbol(t: Tok | undefined): string {
  if (!t) return '';
  switch (t.t) {
    case 'num':
      return t.raw;
    case 'x':
      return 'x';
    case 'pi':
      return 'π';
    case 'e':
      return 'e';
    case 'par':
      return t.name;
    case 'fn':
      return t.name;
    case 'op':
      return t.ch;
    case 'open':
      return t.br;
    case 'close':
      return t.ch;
    case 'bar':
      return '|';
    case 'sup':
      return t.s.replace('-', '⁻');
    case 'root':
      return '√';
  }
}

/* ------------------------------------------------------------------ */
/* Parser (rekursiver Abstieg)                                         */
/* ------------------------------------------------------------------ */

class Parser {
  private i = 0;
  private absDepth = 0;
  private depth = 0;

  constructor(private readonly toks: Tok[]) {}

  private peek(k = 0): Tok | undefined {
    return this.toks[this.i + k];
  }

  private prev(): Tok | undefined {
    return this.toks[this.i - 1];
  }

  private isOp(t: Tok | undefined, ...ops: Op[]): boolean {
    return !!t && t.t === 'op' && ops.includes(t.op);
  }

  private enter(): void {
    if (++this.depth > MAX_DEPTH) {
      const t = this.peek() ?? this.prev();
      fail('tooDeep', t?.pos ?? 0, t?.end ?? 1);
    }
  }

  parse(): Node {
    const node = this.expr();
    const t = this.peek();
    if (t) {
      if (t.t === 'close') fail('unexpectedClose', t.pos, t.end, t.ch);
      if (t.t === 'bar') fail('emptyAbs', t.pos, t.end);
      fail('missingOp', t.pos, t.end, symbol(this.prev()), symbol(t));
    }
    return node;
  }

  /** Summen und Differenzen. */
  private expr(): Node {
    this.enter();
    let left = this.term();
    while (this.isOp(this.peek(), '+', '-')) {
      const t = this.peek() as Extract<Tok, { t: 'op' }>;
      this.i++;
      const right = this.term();
      left = { k: 'add', op: t.op as '+' | '-', l: left, r: right, br: null };
    }
    this.depth--;
    return left;
  }

  /** Beginnt hier ein Faktor, der ohne Malpunkt angehängt werden darf? */
  private startsImplicit(t: Tok | undefined): boolean {
    if (!t) return false;
    if (t.t === 'bar') return this.absDepth === 0;
    return t.t === 'x' || t.t === 'pi' || t.t === 'e' || t.t === 'par' || t.t === 'fn' || t.t === 'open' || t.t === 'root';
  }

  /** Zahl direkt nach einem Faktor: Rechenzeichen fehlt. */
  private checkNumberAfter(): void {
    const t = this.peek();
    if (t?.t !== 'num') return;
    const before = this.prev();
    if (before && (before.t === 'x' || before.t === 'par' || before.t === 'pi' || before.t === 'e') && before.end === t.pos) {
      fail('varDigit', before.pos, t.end, symbol(before), t.s);
    }
    fail('missingOp', t.pos, t.end, symbol(before), symbol(t));
  }

  /** Produkte und Quotienten, auch mit weggelassenem Malpunkt. */
  private term(): Node {
    let left = this.unary();
    for (;;) {
      const t = this.peek();
      if (this.isOp(t, '*', '/', ':')) {
        this.i++;
        const right = this.unary();
        left = { k: 'mul', op: (t as Extract<Tok, { t: 'op' }>).op as '*' | '/' | ':', l: left, r: right, implicit: false, br: null };
        continue;
      }
      this.checkNumberAfter();
      if (this.startsImplicit(t)) {
        const right = this.power();
        left = { k: 'mul', op: '*', l: left, r: right, implicit: true, br: null };
        continue;
      }
      return left;
    }
  }

  /** Vorzeichen (am Anfang, nach Klammern und – großzügig – nach Rechenzeichen). */
  private unary(): Node {
    const t = this.peek();
    if (this.isOp(t, '+', '-')) {
      this.i++;
      if (!this.peek()) fail('expectOperand', t!.pos, t!.end, symbol(t));
      this.enter();
      const arg = this.unary();
      this.depth--;
      return this.isOp(t, '-') ? { k: 'neg', arg, br: null } : arg;
    }
    return this.power();
  }

  /** Potenzen (rechtsassoziativ) und hochgestellte Zahlen. */
  private power(): Node {
    const base = this.primary();
    return this.exponents(base);
  }

  private exponents(base: Node): Node {
    const t = this.peek();
    if (this.isOp(t, '^')) {
      this.i++;
      if (!this.peek()) fail('expectOperand', t!.pos, t!.end, '^');
      this.enter();
      const exp = this.unaryPower();
      this.depth--;
      return { k: 'pow', base, exp, sup: false, br: null };
    }
    if (t?.t === 'sup') {
      this.i++;
      const exp: Node = t.v < 0 ? { k: 'neg', arg: { k: 'num', v: -t.v, s: String(-t.v), br: null }, br: null } : { k: 'num', v: t.v, s: String(t.v), br: null };
      return this.exponents({ k: 'pow', base, exp, sup: true, br: null });
    }
    return base;
  }

  /** Exponent: Vorzeichen erlaubt (2^−x), dann wieder eine Potenz. */
  private unaryPower(): Node {
    const t = this.peek();
    if (this.isOp(t, '+', '-')) {
      this.i++;
      if (!this.peek()) fail('expectOperand', t!.pos, t!.end, symbol(t));
      const arg = this.unaryPower();
      return this.isOp(t, '-') ? { k: 'neg', arg, br: null } : arg;
    }
    return this.power();
  }

  private primary(): Node {
    const t = this.peek();
    if (!t) {
      const p = this.prev();
      return fail('expectOperand', p ? p.end : 0, p ? p.end + 1 : 1, symbol(p));
    }
    switch (t.t) {
      case 'num':
        this.i++;
        return { k: 'num', v: t.v, s: t.s, br: null };
      case 'x':
        this.i++;
        return { k: 'x', br: null };
      case 'pi':
      case 'e':
        this.i++;
        return { k: 'const', name: t.t, br: null };
      case 'par':
        this.i++;
        return { k: 'par', name: t.name, br: null };
      case 'open': {
        this.i++;
        const c0 = this.peek();
        if (c0?.t === 'close') fail('emptyParens', t.pos, c0.end);
        const savedAbs = this.absDepth;
        this.absDepth = 0;
        const inner = this.expr();
        this.absDepth = savedAbs;
        const c = this.peek();
        if (!c) fail('unclosed', t.pos, t.end, t.br);
        if (c!.t === 'bar') fail('unclosed', t.pos, t.end, t.br);
        if (c!.t !== 'close') fail('missingOp', c!.pos, c!.end, symbol(this.prev()), symbol(c));
        const cc = c as Extract<Tok, { t: 'close' }>;
        if (cc.br !== t.br) fail('mismatch', cc.pos, cc.end, t.br, cc.ch);
        this.i++;
        // Doppelte Klammern ((x)) werden einfach angezeigt
        if (!inner.br) inner.br = t.br;
        return inner;
      }
      case 'bar': {
        this.i++;
        const c0 = this.peek();
        if (!c0) fail('absUnclosed', t.pos, t.end);
        if (c0!.t === 'bar') {
          // „||x| − 1|“ beginnt mit einem inneren Betrag, „||“ allein ist leer
          const n1 = this.peek(1);
          if (!n1 || n1.t === 'bar' || n1.t === 'close' || (n1.t === 'op' && n1.op !== '-' && n1.op !== '+')) fail('emptyAbs', t.pos, c0!.end);
        }
        this.absDepth++;
        const inner = this.expr();
        this.absDepth--;
        const c = this.peek();
        if (c?.t !== 'bar') {
          if (!c) fail('absUnclosed', t.pos, t.end);
          if (c!.t === 'close') fail('unexpectedClose', c!.pos, c!.end, (c as Extract<Tok, { t: 'close' }>).ch);
          fail('missingOp', c!.pos, c!.end, symbol(this.prev()), symbol(c));
        }
        this.i++;
        return { k: 'abs', arg: inner, br: null };
      }
      case 'root': {
        this.i++;
        const nt = this.peek();
        if (!nt || nt.t === 'op' || nt.t === 'close' || (nt.t === 'bar' && this.absDepth > 0)) fail('fnNoArg', t.pos, t.end, '√');
        this.enter();
        const arg = this.power();
        this.depth--;
        return { k: 'call', fn: 'sqrt', arg, sym: true, bare: arg.br === null, br: null };
      }
      case 'fn':
        return this.call(t);
      case 'close': {
        const p = this.prev();
        if (!p || p.t === 'open') fail('unexpectedClose', t.pos, t.end, t.ch);
        return fail('expectOperand', t.pos, t.end, symbol(p));
      }
      case 'sup':
        return fail('expectOperand', t.pos, t.end, symbol(this.prev()) || '^');
      case 'op': {
        const p = this.prev();
        if (!p || p.t === 'open' || p.t === 'bar') return fail('startOperator', t.pos, t.end, t.ch);
        return fail('expectOperand', t.pos, t.end, symbol(p));
      }
    }
  }

  /** Funktionsaufruf: sin(x), sin x, sin 2x, sin²(x), sin^2 x, abs(x), log_2(x). */
  private call(t: Extract<Tok, { t: 'fn' }>): Node {
    this.i++;
    this.enter();
    // Hochzahl direkt am Namen
    let power: Node | undefined;
    const pt = this.peek();
    if (pt?.t === 'sup') {
      this.i++;
      power = pt.v < 0 ? { k: 'neg', arg: { k: 'num', v: -pt.v, s: String(-pt.v), br: null }, br: null } : { k: 'num', v: pt.v, s: String(pt.v), br: null };
    } else if (this.isOp(pt, '^') && (this.peek(1)?.t === 'num' || (this.isOp(this.peek(1), '-') && this.peek(2)?.t === 'num'))) {
      this.i++;
      const neg = this.isOp(this.peek(), '-');
      if (neg) this.i++;
      const n = this.peek() as Extract<Tok, { t: 'num' }>;
      this.i++;
      const num: Node = { k: 'num', v: n.v, s: n.s, br: null };
      power = neg ? { k: 'neg', arg: num, br: null } : num;
    }
    const nt = this.peek();
    const noArg = !nt || nt.t === 'close' || (nt.t === 'op' && nt.op !== '-') || nt.t === 'sup' || (nt.t === 'bar' && this.absDepth > 0);
    if (noArg) fail('fnNoArg', t.pos, t.end, t.name);
    let arg: Node;
    let bare = false;
    if (nt!.t === 'open') {
      arg = this.primary();
      // sin(x)² wird außen als Potenz gelesen (exponents im Aufrufer)
    } else {
      // Argument ohne Klammer: Vorzeichen, dann Faktoren ohne Malpunkt bis zum nächsten Funktionsnamen
      bare = true;
      arg = this.bareArg();
    }
    this.depth--;
    if (t.fn === 'abs') {
      const node: Node = { k: 'abs', arg: arg.br === '(' && !bare ? { ...arg, br: null } : arg, br: null };
      return power ? { k: 'pow', base: node, exp: power, sup: true, br: null } : node;
    }
    return { k: 'call', fn: t.fn, arg, logBase: t.logBase, power, sym: false, bare, br: null };
  }

  private bareArg(): Node {
    const t = this.peek();
    if (this.isOp(t, '-')) {
      this.i++;
      if (!this.peek()) fail('expectOperand', t!.pos, t!.end, symbol(t));
      return { k: 'neg', arg: this.bareArg(), br: null };
    }
    let left = this.power();
    for (;;) {
      const n = this.peek();
      if (!n || n.t === 'fn' || n.t === 'root') return left;
      this.checkNumberAfter();
      if (!this.startsImplicit(n)) return left;
      const right = this.power();
      left = { k: 'mul', op: '*', l: left, r: right, implicit: true, br: null };
    }
  }
}

/** Welche Parameter und Funktionen kommen vor? */
function scan(node: Node, params: Set<ParamName>, flags: { trig: boolean }): void {
  switch (node.k) {
    case 'par':
      params.add(node.name);
      return;
    case 'neg':
    case 'abs':
      scan(node.arg, params, flags);
      return;
    case 'add':
    case 'mul':
      scan(node.l, params, flags);
      scan(node.r, params, flags);
      return;
    case 'pow':
      scan(node.base, params, flags);
      scan(node.exp, params, flags);
      return;
    case 'call':
      if (node.fn === 'sin' || node.fn === 'cos' || node.fn === 'tan') flags.trig = true;
      scan(node.arg, params, flags);
      if (node.power) scan(node.power, params, flags);
      return;
    default:
      return;
  }
}

/** Liest einen Term. Leere Eingabe ergibt `{ ok: 'empty' }`. */
export function parseTerm(input: string): ParseResult {
  const src = stripPrefix(input);
  if (!src.trim()) return { ok: 'empty' };
  try {
    const node = new Parser(tokenize(src)).parse();
    const params = new Set<ParamName>();
    const flags = { trig: false };
    scan(node, params, flags);
    return { ok: true, term: { node, params: (['a', 'b'] as const).filter((p) => params.has(p)), trig: flags.trig } };
  } catch (error) {
    if (error instanceof TermError) return { ok: false, error: error.info };
    throw error;
  }
}

/** Welche Parameter benutzt ein (ggf. fehlerhafter) Term? Für die Sichtbarkeit der Regler. */
export function paramsIn(input: string): ParamName[] {
  const found = new Set<string>();
  for (const m of stripPrefix(input).toLowerCase().matchAll(/[a-zäöüß]+/g)) {
    const word = m[0];
    let k = 0;
    while (k < word.length) {
      const hit = NAMES.find(([n]) => word.startsWith(n, k));
      if (!hit) {
        k++;
        continue;
      }
      if (hit[1] === 'a' || hit[1] === 'b') found.add(hit[1]);
      k += hit[0].length;
    }
  }
  return (['a', 'b'] as const).filter((p) => found.has(p));
}

/* ------------------------------------------------------------------ */
/* Auswerten                                                           */
/* ------------------------------------------------------------------ */

export interface Env {
  a: number;
  b: number;
}

export type Fn1 = (x: number) => number;
type Compiled = (x: number, env: Env) => number;

const LOG10 = Math.LN10;

/** Potenz wie in der Schule: negative Basis nur mit ganzzahligem Exponenten, 0 hoch negativ undefiniert. */
export function power(u: number, v: number): number {
  if (u === 0 && v < 0) return NaN;
  if (u < 0 && !Number.isInteger(v)) return NaN;
  return Math.pow(u, v);
}

function compileNode(node: Node): Compiled {
  switch (node.k) {
    case 'num': {
      const v = node.v;
      return () => v;
    }
    case 'x':
      return (x) => x;
    case 'par': {
      const n = node.name;
      return (_x, env) => env[n];
    }
    case 'const': {
      const v = node.name === 'pi' ? Math.PI : Math.E;
      return () => v;
    }
    case 'neg': {
      const a = compileNode(node.arg);
      return (x, env) => -a(x, env);
    }
    case 'add': {
      const l = compileNode(node.l);
      const r = compileNode(node.r);
      return node.op === '+' ? (x, env) => l(x, env) + r(x, env) : (x, env) => l(x, env) - r(x, env);
    }
    case 'mul': {
      const l = compileNode(node.l);
      const r = compileNode(node.r);
      if (node.op === '*') return (x, env) => l(x, env) * r(x, env);
      return (x, env) => {
        const d = r(x, env);
        return d === 0 ? NaN : l(x, env) / d;
      };
    }
    case 'pow': {
      const b = compileNode(node.base);
      const e = compileNode(node.exp);
      return (x, env) => power(b(x, env), e(x, env));
    }
    case 'abs': {
      const a = compileNode(node.arg);
      return (x, env) => Math.abs(a(x, env));
    }
    case 'call': {
      const a = compileNode(node.arg);
      const p = node.power ? compileNode(node.power) : null;
      let f: (u: number) => number;
      switch (node.fn) {
        case 'sin':
          f = Math.sin;
          break;
        case 'cos':
          f = Math.cos;
          break;
        case 'tan':
          // An den Polstellen (π/2 + kπ) liefert Math.tan riesige Werte – die Abtastung erkennt den Pol
          f = Math.tan;
          break;
        case 'sqrt':
          f = (u) => (u < 0 ? NaN : Math.sqrt(u));
          break;
        case 'exp':
          f = Math.exp;
          break;
        case 'ln':
          f = (u) => (u > 0 ? Math.log(u) : NaN);
          break;
        case 'lg':
          f = (u) => (u > 0 ? Math.log(u) / LOG10 : NaN);
          break;
        case 'log': {
          const lb = Math.log(node.logBase ?? 10);
          f = (u) => (u > 0 ? Math.log(u) / lb : NaN);
          break;
        }
      }
      return p ? (x, env) => power(f(a(x, env)), p(x, env)) : (x, env) => f(a(x, env));
    }
  }
}

/** Übersetzt den Baum in eine Funktion; nicht definierte Stellen liefern NaN. */
export function compile(node: Node): (x: number, env: Env) => number {
  const c = compileNode(node);
  return (x, env) => {
    const y = c(x, env);
    return Number.isFinite(y) ? y : NaN;
  };
}

/* ------------------------------------------------------------------ */
/* Term als Text (Ergebnisse, Tests)                                   */
/* ------------------------------------------------------------------ */

const MINUS = '−';
const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const toSup = (s: string) => s.replace(/[0-9]/g, (c) => SUP_DIGITS[Number(c)]!).replace('-', '⁻');

/** Ganzzahliger Exponent (auch negativ), wenn er direkt als Zahl dasteht. */
export function intExponent(e: Node): number | null {
  if (e.br) return null;
  if (e.k === 'num' && Number.isInteger(e.v)) return e.v;
  if (e.k === 'neg' && e.arg.k === 'num' && !e.arg.br && Number.isInteger(e.arg.v)) return -e.arg.v;
  return null;
}

export function numberText(s: string, lang: Lang): string {
  return lang === 'de' ? s.replace('.', ',') : s;
}

/** Name einer Funktion in der Anzeige. */
export function fnLabel(node: Extract<Node, { k: 'call' }>): string {
  if (node.fn === 'log' && node.logBase !== undefined) return `log${String(node.logBase).replace(/[0-9]/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]!).replace('.', ',')}`;
  return node.fn === 'sqrt' ? '√' : node.fn;
}

/** Term als einfacher Text: „0,5x² − 2“, „sin(2x)“, „√(x + 1)“, „(x² − 1)/(x − 2)“. */
export function termText(node: Node, lang: Lang): string {
  const inner = ((): string => {
    switch (node.k) {
      case 'num':
        return numberText(node.s, lang);
      case 'x':
        return 'x';
      case 'par':
        return node.name;
      case 'const':
        return node.name === 'pi' ? 'π' : 'e';
      case 'neg':
        return `${MINUS}${termText(node.arg, lang)}`;
      case 'add':
        return `${termText(node.l, lang)} ${node.op === '+' ? '+' : MINUS} ${termText(node.r, lang)}`;
      case 'mul': {
        const l = termText(node.l, lang);
        const r = termText(node.r, lang);
        if (node.op === '/') return `${l}/${r}`;
        if (node.op === ':') return `${l} : ${r}`;
        if (!node.implicit) return `${l} · ${r}`;
        return `${l}${node.r.k === 'call' && !node.r.sym && !node.r.br ? ' ' : ''}${r}`;
      }
      case 'pow': {
        const b = termText(node.base, lang);
        const n = intExponent(node.exp);
        if (n !== null) return `${b}${toSup(String(n))}`;
        return `${b}^${termText(node.exp, lang)}`;
      }
      case 'abs':
        return `|${termText(node.arg, lang)}|`;
      case 'call': {
        const name = fnLabel(node);
        const pw = node.power ? (intExponent(node.power) !== null ? toSup(String(intExponent(node.power))) : `^${termText(node.power, lang)}`) : '';
        const arg = termText(node.arg, lang);
        if (node.fn === 'sqrt') {
          const atomic = node.arg.k === 'x' || node.arg.k === 'num' || node.arg.k === 'par' || node.arg.k === 'const';
          return `√${atomic ? termText({ ...node.arg, br: null }, lang) : node.arg.br ? arg : `(${arg})`}`;
        }
        return `${name}${pw}${node.arg.br ? arg : `(${arg})`}`;
      }
    }
  })();
  if (!node.br) return inner;
  return node.br === '(' ? `(${inner})` : `[${inner}]`;
}

/* ------------------------------------------------------------------ */
/* Abtasten mit Unstetigkeiten                                         */
/* ------------------------------------------------------------------ */

export type BreakKind = 'pole' | 'jump' | 'edge';

export interface Break {
  x: number;
  kind: BreakKind;
}

export interface Trace {
  /** Linienzüge als [x0, y0, x1, y1, …] (zusammenhängende Stücke des Graphen). */
  segments: number[][];
  breaks: Break[];
}

const finite = Number.isFinite;

/**
 * Letzte definierte Stelle zwischen `inside` (definiert) und `outside`
 * (nicht definiert), per Intervallhalbierung.
 */
export function edgePoint(f: Fn1, inside: number, outside: number): { x: number; y: number } {
  let a = inside;
  let b = outside;
  let ya = f(a);
  for (let k = 0; k < 64; k++) {
    const m = (a + b) / 2;
    if (m === a || m === b) break;
    const ym = f(m);
    if (finite(ym)) {
      a = m;
      ya = ym;
    } else b = m;
  }
  return { x: a, y: ya };
}

/** Wächst |f| beim Annähern an x0 von der Seite `dir` (±1) über alle Grenzen? */
export function divergesAt(f: Fn1, x0: number, dir: 1 | -1, width: number): boolean {
  const ds = [1e-3, 1e-6, 1e-9].map((d) => d * Math.max(width, 1e-6));
  const vs = ds.map((d) => Math.abs(f(x0 + dir * d)));
  if (!vs.every(finite)) return false;
  const [v1, v2, v3] = vs as [number, number, number];
  if (!(v3 > v2 && v2 > v1)) return false;
  // Konvergente Annäherung schrumpft die Zuwächse stark (√x: Faktor 1000), Pole nicht
  return v3 - v2 >= 0.3 * (v2 - v1) && v3 > 1;
}

interface Disc {
  xl: number;
  yl: number;
  xr: number;
  yr: number;
}

/**
 * Prüft, ob f zwischen a und b stetig ist (bei großem Unterschied der Werte).
 * Liefert null (stetig) oder die beiden Ränder der Unstetigkeitsstelle.
 */
export function locateJump(f: Fn1, a: number, ya: number, b: number, yb: number, tol: number): Disc | null {
  for (let k = 0; k < 60; k++) {
    if (Math.abs(yb - ya) <= tol * 0.25) return null;
    const m = (a + b) / 2;
    if (m <= a || m >= b) break;
    const ym = f(m);
    if (!finite(ym)) {
      const L = edgePoint(f, a, m);
      const R = edgePoint(f, b, m);
      return { xl: L.x, yl: L.y, xr: R.x, yr: R.y };
    }
    if (Math.abs(ym - ya) >= Math.abs(yb - ym)) {
      b = m;
      yb = ym;
    } else {
      a = m;
      ya = ym;
    }
  }
  if (Math.abs(yb - ya) <= tol * 0.25) return null;
  return { xl: a, yl: ya, xr: b, yr: yb };
}

/**
 * Tastet f auf [xMin, xMax] mit n Schritten ab. Polstellen, Sprünge und
 * Ränder der Definitionsmenge trennen die Linienzüge; die Ränder werden
 * genau bestimmt (√x beginnt bei 0, 1/x läuft bis an den Rand).
 */
export function traceFunction(f: Fn1, xMin: number, xMax: number, yMin: number, yMax: number, n: number): Trace {
  const H = Math.max(1e-12, yMax - yMin);
  const tol = H * 0.012;
  const lim = (y: number) => Math.max(yMin - 40 * H, Math.min(yMax + 40 * H, y));
  const width = xMax - xMin;
  const segments: number[][] = [];
  const breaks: Break[] = [];
  let seg: number[] | null = null;
  const push = (x: number, y: number) => {
    if (!seg) seg = [];
    seg.push(x, lim(y));
  };
  const end = () => {
    if (seg && seg.length >= 2) segments.push(seg);
    seg = null;
  };
  const step = width / n;
  let x0 = xMin;
  let y0 = f(x0);
  if (finite(y0)) push(x0, y0);
  for (let i = 1; i <= n; i++) {
    const x1 = i === n ? xMax : xMin + i * step;
    const y1 = f(x1);
    if (finite(y0) && finite(y1)) {
      if (Math.abs(y1 - y0) > tol) {
        const d = locateJump(f, x0, y0, x1, y1, tol);
        if (d) {
          if (finite(d.yl)) push(d.xl, d.yl);
          end();
          const pole = divergesAt(f, d.xl, -1, width) || divergesAt(f, d.xr, 1, width);
          breaks.push({ x: (d.xl + d.xr) / 2, kind: pole ? 'pole' : 'jump' });
          if (finite(d.yr) && d.xr < x1) push(d.xr, d.yr);
        }
      }
      push(x1, y1);
    } else if (finite(y0) && !finite(y1)) {
      const e = edgePoint(f, x0, x1);
      if (e.x > x0) push(e.x, e.y);
      end();
      breaks.push({ x: e.x, kind: divergesAt(f, e.x, -1, width) ? 'pole' : 'edge' });
    } else if (!finite(y0) && finite(y1)) {
      const e = edgePoint(f, x1, x0);
      breaks.push({ x: e.x, kind: divergesAt(f, e.x, 1, width) ? 'pole' : 'edge' });
      if (e.x < x1) push(e.x, e.y);
      push(x1, y1);
    }
    x0 = x1;
    y0 = y1;
  }
  end();
  // Pol genau auf einer Abtaststelle: zwei Ränder fast an derselben Stelle zusammenfassen
  const merged: Break[] = [];
  for (const b of breaks) {
    const last = merged[merged.length - 1];
    if (last && Math.abs(last.x - b.x) <= step * 1.01) {
      if (b.kind === 'pole') last.kind = 'pole';
      last.x = (last.x + b.x) / 2;
    } else merged.push({ ...b });
  }
  return { segments, breaks: merged };
}

/* ------------------------------------------------------------------ */
/* Besondere Punkte                                                    */
/* ------------------------------------------------------------------ */

export interface Root {
  x: number;
  /** Berührstelle (kein Vorzeichenwechsel). */
  touch: boolean;
}

/** Intervallhalbierung bei Vorzeichenwechsel. */
export function bisect(f: Fn1, a: number, b: number): number {
  let fa = f(a);
  for (let k = 0; k < 100; k++) {
    const m = (a + b) / 2;
    if (m === a || m === b) break;
    const fm = f(m);
    if (fm === 0) return m;
    if (!finite(fm)) return m;
    if (Math.sign(fm) === Math.sign(fa)) {
      a = m;
      fa = fm;
    } else b = m;
  }
  return Math.abs(f(a)) <= Math.abs(f(b)) ? a : b;
}

/** Goldener Schnitt: Minimum (oder Maximum) von f auf [a, b]. */
export function golden(f: Fn1, a: number, b: number, max = false): number {
  const g = (x: number) => (max ? -f(x) : f(x));
  const r = (Math.sqrt(5) - 1) / 2;
  let c = b - r * (b - a);
  let d = a + r * (b - a);
  let fc = g(c);
  let fd = g(d);
  for (let k = 0; k < 120; k++) {
    if (Math.abs(b - a) <= 1e-15 * Math.max(1, Math.abs(a) + Math.abs(b))) break;
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - r * (b - a);
      fc = g(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + r * (b - a);
      fd = g(d);
    }
  }
  return (a + b) / 2;
}

/** Glatte Zahl in der Nähe (z. B. 2 statt 1,9999999997), wenn sie f(x) = 0 genauso gut erfüllt. */
export function snapRoot(f: Fn1, x: number): number {
  const fx = Math.abs(f(x));
  for (let d = 0; d <= 8; d++) {
    const c = Math.round(x * 10 ** d) / 10 ** d;
    if (Math.abs(c - x) > 1e-7 * Math.max(1, Math.abs(x))) continue;
    const fc = Math.abs(f(c));
    if (finite(fc) && fc <= Math.max(fx * 4, 1e-14)) return c + 0;
  }
  return x;
}

/** Sind (fast) alle Werte 0? (dann hat f unendlich viele Nullstellen, z. B. f = x − x) */
function mostlyZero(ys: number[], scale: number): boolean {
  const fin = ys.filter(finite);
  return fin.length > 10 && fin.filter((y) => Math.abs(y) <= 1e-12 * scale).length > fin.length * 0.5;
}

export interface ZeroResult {
  roots: Root[];
  /** f ist auf dem Bereich (fast) überall 0. */
  everywhere: boolean;
}

/**
 * Nullstellen auf [xMin, xMax]: Vorzeichenwechsel (ohne Polstellen und
 * Sprünge) und Berührstellen (|f| hat ein Minimum mit dem Wert 0).
 * `scale` ist eine typische Größe der Werte (z. B. Höhe des Ausschnitts).
 */
export function findZeros(f: Fn1, xMin: number, xMax: number, n = 1200, scale = 10): ZeroResult {
  const xs = Array.from({ length: n + 1 }, (_, i) => (i === n ? xMax : xMin + ((xMax - xMin) * i) / n));
  const ys = xs.map(f);
  if (mostlyZero(ys, Math.max(1, scale))) return { roots: [], everywhere: true };
  const zTol = 1e-9 * Math.max(1, scale);
  const out: Root[] = [];
  const add = (x: number, touch: boolean) => {
    const s = snapRoot(f, x);
    if (out.some((r) => Math.abs(r.x - s) <= 1e-7 * Math.max(1, Math.abs(s)))) return;
    out.push({ x: s, touch });
  };
  for (let i = 0; i <= n; i++) {
    const y = ys[i]!;
    if (y === 0) {
      const l = ys[i - 1];
      const r = ys[i + 1];
      const touch = l !== undefined && r !== undefined && finite(l) && finite(r) && Math.sign(l) === Math.sign(r) && l !== 0;
      add(xs[i]!, touch);
      continue;
    }
    if (i < n) {
      const y1 = ys[i + 1]!;
      if (finite(y) && finite(y1) && y1 !== 0 && Math.sign(y) !== Math.sign(y1)) {
        const r = bisect(f, xs[i]!, xs[i + 1]!);
        const fr = f(r);
        // Pole und Sprünge über die x-Achse sind keine Nullstellen
        const near = Math.min(Math.abs(f(xs[i]!)), Math.abs(f(xs[i + 1]!)));
        if (finite(fr) && Math.abs(fr) <= Math.max(zTol * 1e3, near * 1e-6)) add(r, false);
      }
    }
    // Berührstellen
    if (i > 0 && i < n) {
      const l = ys[i - 1]!;
      const r = ys[i + 1]!;
      if (!finite(l) || !finite(r) || !finite(y)) continue;
      if (Math.sign(l) !== Math.sign(y) || Math.sign(r) !== Math.sign(y)) continue;
      if (!(Math.abs(y) <= Math.abs(l) && Math.abs(y) <= Math.abs(r))) continue;
      const m = golden((x) => Math.abs(f(x)), xs[i - 1]!, xs[i + 1]!);
      const fm = f(m);
      if (finite(fm) && Math.abs(fm) <= zTol) add(m, true);
    }
  }
  return { roots: out.sort((p, q) => p.x - q.x), everywhere: false };
}

export interface Extremum {
  x: number;
  y: number;
  kind: 'max' | 'min';
}

/**
 * Hoch- und Tiefpunkte im Inneren von [xMin, xMax] (auch an Knickstellen wie
 * bei |x|). Ränder der Definitionsmenge und Polstellen zählen nicht.
 */
export function findExtrema(f: Fn1, xMin: number, xMax: number, n = 1200, scale = 10): Extremum[] {
  const h = (xMax - xMin) / n;
  const xs = Array.from({ length: n + 1 }, (_, i) => (i === n ? xMax : xMin + h * i));
  const ys = xs.map(f);
  const tol = Math.max(1e-12, scale) * 0.012;
  const out: Extremum[] = [];
  for (let i = 1; i < n; i++) {
    const l = ys[i - 1]!;
    const y = ys[i]!;
    const r = ys[i + 1]!;
    if (!finite(l) || !finite(y) || !finite(r)) continue;
    const isMax = y > l && y >= r;
    const isMin = y < l && y <= r;
    if (!isMax && !isMin) continue;
    if (locateJump(f, xs[i - 1]!, l, xs[i]!, y, tol) || locateJump(f, xs[i]!, y, xs[i + 1]!, r, tol)) continue;
    const xe = golden(f, xs[i - 1]!, xs[i + 1]!, isMax);
    const ye = f(xe);
    if (!finite(ye)) continue;
    // Echte Erhebung/Senke (nicht nur Rundungsrauschen wie bei sin² + cos²)
    const eps = 1e-10 * Math.max(1, Math.abs(ye), scale);
    const side = [f(xe - 3 * h), f(xe + 3 * h)].filter(finite);
    if (side.length < 2) continue;
    if (!side.every((v) => (isMax ? ye - v > eps : v - ye > eps))) continue;
    if (out.some((e) => Math.abs(e.x - xe) <= 2 * h)) continue;
    const xs2 = snapExtremum(f, xe, isMax);
    out.push({ x: xs2, y: f(xs2), kind: isMax ? 'max' : 'min' });
  }
  return out;
}

/** Glatte Stelle eines Extrempunkts, wenn sie gleich gut ist (z. B. 0 statt 1e−9). */
function snapExtremum(f: Fn1, x: number, isMax: boolean): number {
  const fx = f(x);
  for (let d = 0; d <= 6; d++) {
    const c = Math.round(x * 10 ** d) / 10 ** d;
    if (Math.abs(c - x) > 2e-6 * Math.max(1, Math.abs(x))) continue;
    const fc = f(c);
    if (finite(fc) && (isMax ? fc >= fx - 1e-12 * Math.max(1, Math.abs(fx)) : fc <= fx + 1e-12 * Math.max(1, Math.abs(fx)))) return c + 0;
  }
  return x;
}

export interface Intersection {
  x: number;
  y: number;
  touch: boolean;
}

/** Schnittpunkte zweier Graphen (Nullstellen von f − g, wo beide definiert sind). */
export function findIntersections(f: Fn1, g: Fn1, xMin: number, xMax: number, n = 1200, scale = 10): { points: Intersection[]; same: boolean } {
  const d = (x: number) => f(x) - g(x);
  const z = findZeros(d, xMin, xMax, n, scale);
  if (z.everywhere) return { points: [], same: true };
  return { points: z.roots.map((r) => ({ x: r.x, y: f(r.x), touch: r.touch })), same: false };
}

export interface Hole {
  x: number;
  y: number;
}

/**
 * Hebbare Definitionslücken: Stellen auf einem Raster (Vielfache von 1/4),
 * an denen f nicht definiert ist, der Graph aber von beiden Seiten auf
 * denselben Punkt zuläuft (z. B. (x² − 1)/(x − 1) bei x = 1).
 */
export function findHoles(f: Fn1, xMin: number, xMax: number, grid = 0.25, maxCount = 2000): Hole[] {
  const out: Hole[] = [];
  const k0 = Math.ceil(xMin / grid);
  const k1 = Math.floor(xMax / grid);
  if (k1 - k0 > maxCount) return out;
  for (let k = k0; k <= k1; k++) {
    const c = k * grid;
    if (finite(f(c))) continue;
    const d = 1e-6 * Math.max(1, Math.abs(c));
    const yl = f(c - d);
    const yr = f(c + d);
    if (!finite(yl) || !finite(yr)) continue;
    if (Math.abs(yl - yr) > 1e-4 * Math.max(1, Math.abs(yl))) continue;
    // Grenzwert sauber abschätzen (Mittel der beiden Seiten, auf glatte Zahl runden)
    const y = (yl + yr) / 2;
    const yr6 = Math.round(y * 1e5) / 1e5;
    out.push({ x: c + 0, y: Math.abs(yr6 - y) < 1e-4 * Math.max(1, Math.abs(y)) ? yr6 + 0 : y });
  }
  return out;
}

/** Ableitung (zentraler Differenzenquotient); null an Knicken und Lücken. */
export function derivative(f: Fn1, x: number): number | null {
  const h = 1e-5 * Math.max(1, Math.abs(x));
  const y = f(x);
  const yl = f(x - h);
  const yr = f(x + h);
  if (!finite(y) || !finite(yl) || !finite(yr)) return null;
  const left = (y - yl) / h;
  const right = (yr - y) / h;
  if (Math.abs(left - right) > 1e-2 * Math.max(1, Math.abs(left), Math.abs(right))) return null;
  const m = (yr - yl) / (2 * h);
  return Math.abs(m) < 1e-9 ? 0 : m;
}

/**
 * Passender y-Bereich für die Graphen auf [xMin, xMax]: der mittlere Teil der
 * Werte (15 % bis 85 %, ohne die Ausreißer an Polstellen und an den Rändern)
 * und alle y-Werte in `must` (z. B. Hoch-, Tief- und Schnittpunkte), etwas
 * Rand, die x-Achse möglichst im Bild.
 */
export function fitRange(fs: Fn1[], xMin: number, xMax: number, n = 400, must: number[] = []): [number, number] | null {
  const ys: number[] = [];
  for (const f of fs) for (let i = 0; i <= n; i++) {
    const y = f(xMin + ((xMax - xMin) * i) / n);
    if (finite(y)) ys.push(y);
  }
  if (!ys.length) return null;
  ys.sort((p, q) => p - q);
  const q = (t: number) => ys[Math.min(ys.length - 1, Math.max(0, Math.round(t * (ys.length - 1))))]!;
  const extra = must.filter(finite);
  let lo = Math.min(q(0.15), ...extra);
  let hi = Math.max(q(0.85), ...extra);
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  if (lo > 0 && lo < span * 0.6) lo = 0;
  if (hi < 0 && -hi < span * 0.6) hi = 0;
  const pad = (hi - lo) * 0.12;
  return [lo - pad, hi + pad];
}
