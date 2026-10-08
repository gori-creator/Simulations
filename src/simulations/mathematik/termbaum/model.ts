/**
 * Termbaum: Terme zerlegen, gliedern und Schritt für Schritt auswerten.
 *
 * - Ein eigener, sicherer Parser (kein `eval`) für + − · : / ^, Klammern,
 *   Dezimalzahlen, Brüche (3/4), Hochzahlen (², ³) und Variablen.
 * - Rechnen mit exakten rationalen Zahlen (BigInt), damit 1/3 + 1/6 genau 1/2 ergibt.
 * - Rechenreihenfolge wie im Unterricht: Klammern zuerst, Potenz vor Punkt vor
 *   Strich, sonst von links nach rechts.
 * - Termart nach der zuletzt ausgeführten Rechnung, Glieder und Gliederung in Worten.
 */

export type Lang = 'de' | 'en';

/* ------------------------------------------------------------------ */
/* Rationale Zahlen                                                    */
/* ------------------------------------------------------------------ */

/** Gekürzter Bruch n/d mit d > 0. */
export interface Q {
  readonly n: bigint;
  readonly d: bigint;
}

/** Größte erlaubte Stellenzahl von Zähler und Nenner (sonst „zu groß“). */
const MAX_DIGITS = 40;

const abs = (a: bigint) => (a < 0n ? -a : a);

function gcd(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Bruch aus Zähler und Nenner (wird gekürzt, Nenner positiv). */
export function q(n: bigint | number, d: bigint | number = 1n): Q {
  let nn = BigInt(n);
  let dd = BigInt(d);
  if (dd === 0n) throw new Error('Nenner 0');
  if (dd < 0n) {
    nn = -nn;
    dd = -dd;
  }
  const g = gcd(nn, dd) || 1n;
  return { n: nn / g, d: dd / g };
}

export const add = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const neg = (a: Q): Q => ({ n: -a.n, d: a.d });
export const isInt = (a: Q): boolean => a.d === 1n;
export const isZero = (a: Q): boolean => a.n === 0n;
export const eq = (a: Q, b: Q): boolean => a.n === b.n && a.d === b.d;
export const toNumber = (a: Q): number => Number(a.n) / Number(a.d);

/** Dezimalzahl als Text („2,5“ oder „2.5“) exakt als Bruch. */
export function fromDecimal(text: string): Q {
  const [int = '0', frac = ''] = text.replace(',', '.').replace('−', '-').split('.');
  const negative = int.startsWith('-');
  const digits = BigInt((int.replace('-', '') || '0') + frac);
  const value = q(digits, 10n ** BigInt(frac.length));
  return negative ? neg(value) : value;
}

/** Zahl (z. B. ein Reglerwert wie 2.5) exakt als Bruch. */
export function fromNumber(x: number): Q {
  if (!Number.isFinite(x)) return q(0);
  return fromDecimal(x.toFixed(6).replace(/0+$/, '').replace(/\.$/, ''));
}

function tooBig(a: Q): boolean {
  return abs(a.n).toString().length > MAX_DIGITS || a.d.toString().length > MAX_DIGITS;
}

/* ------------------------------------------------------------------ */
/* Zahlen anzeigen                                                     */
/* ------------------------------------------------------------------ */

export type Shown = { kind: 'int' | 'dec'; neg: boolean; text: string } | { kind: 'frac'; neg: boolean; num: string; den: string };

/** Stellen nach dem Komma, falls a ein endlicher Dezimalbruch ist (sonst null). */
function terminatingDigits(a: Q): number | null {
  let d = a.d;
  let twos = 0;
  let fives = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    twos++;
  }
  while (d % 5n === 0n) {
    d /= 5n;
    fives++;
  }
  return d === 1n ? Math.max(twos, fives) : null;
}

/**
 * Wie eine Zahl angezeigt wird: ganze Zahl, Dezimalzahl (wenn der Term
 * Dezimalzahlen enthält und das Ergebnis abbricht) oder Bruch.
 */
export function show(a: Q, decimal: boolean, lang: Lang): Shown {
  const negative = a.n < 0n;
  const n = abs(a.n);
  if (a.d === 1n) return { kind: 'int', neg: negative, text: n.toString() };
  const digits = decimal ? terminatingDigits(a) : null;
  if (digits !== null && digits <= 12) {
    const scaled = (n * 10n ** BigInt(digits)) / a.d;
    const s = scaled.toString().padStart(digits + 1, '0');
    const text = `${s.slice(0, s.length - digits)}${lang === 'de' ? ',' : '.'}${s.slice(s.length - digits)}`;
    return { kind: 'dec', neg: negative, text };
  }
  return { kind: 'frac', neg: negative, num: n.toString(), den: a.d.toString() };
}

/** Zahl als einfacher Text: „−3“, „2,5“, „−3/4“. */
export function showText(a: Q, decimal: boolean, lang: Lang): string {
  const s = show(a, decimal, lang);
  const body = s.kind === 'frac' ? `${s.num}/${s.den}` : s.text;
  return s.neg ? `−${body}` : body;
}

/* ------------------------------------------------------------------ */
/* Zerlegen in Zeichen (Tokenizer)                                     */
/* ------------------------------------------------------------------ */

/** Erlaubte Variablen (je ein Regler in der Simulation). */
export const VARIABLES = ['a', 'b', 'c', 'n', 'x', 'y', 'z'] as const;
export type VarName = (typeof VARIABLES)[number];

export type Op = '+' | '-' | '*' | ':' | '/' | '^';
type Bracket = '(' | '[';

interface Token {
  kind: 'num' | 'var' | 'op' | 'open' | 'close' | 'sup';
  pos: number;
  end: number;
  /** Zahl: Ziffern mit Punkt als Dezimaltrennzeichen; Variable: Name; Hochzahl: Ziffern. */
  text: string;
  op?: Op;
  bracket?: Bracket;
  decimal?: boolean;
}

export type ParseErrorCode =
  | 'empty'
  | 'badChar'
  | 'equals'
  | 'unknownVar'
  | 'decimal'
  | 'numTooLong'
  | 'expectOperand'
  | 'startOperator'
  | 'signAfterOp'
  | 'doubleSign'
  | 'signInExponent'
  | 'missingOp'
  | 'unclosed'
  | 'unexpectedClose'
  | 'mismatch'
  | 'emptyParens'
  | 'zeroDen'
  | 'tooLong'
  | 'tooDeep';

export interface ParseError {
  code: ParseErrorCode;
  /** Position im eingegebenen Text (für die Markierung). */
  pos: number;
  /** Zeichen, um die es geht (z. B. das Rechenzeichen vor der Lücke). */
  a?: string;
  b?: string;
}

class TermError extends Error {
  constructor(readonly info: ParseError) {
    super(info.code);
  }
}

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
  ':': ':',
  '÷': ':',
  '/': '/',
  '^': '^',
};
const SUPERSCRIPTS: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

/** Höchstens so viele Ziffern pro Zahl. */
const MAX_NUMBER_DIGITS = 9;
/** Höchstens so viele Zahlen und Variablen pro Term (sonst wird der Baum unübersichtlich). */
export const MAX_LEAVES = 16;
/** Höchstens so viele Ebenen. */
export const MAX_HEIGHT = 9;

/** Darstellung eines Zeichens in Fehlermeldungen. */
function symbolOf(t: Token | undefined): string {
  if (!t) return '';
  if (t.kind === 'op') return ({ '+': '+', '-': '−', '*': '·', ':': ':', '/': '/', '^': '^' } as const)[t.op!];
  if (t.kind === 'num') return t.text.replace('.', ',');
  return t.kind === 'sup' ? '²' : t.text;
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(ch) || ((ch === ',' || ch === '.') && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i;
      while (/[0-9]/.test(src[j] ?? '')) j++;
      let decimal = false;
      if (src[j] === ',' || src[j] === '.') {
        if (!/[0-9]/.test(src[j + 1] ?? '')) throw new TermError({ code: 'decimal', pos: j });
        decimal = true;
        j++;
        while (/[0-9]/.test(src[j] ?? '')) j++;
      }
      const raw = src.slice(i, j).replace(',', '.');
      const text = raw.startsWith('.') ? `0${raw}` : raw;
      if (text.replace('.', '').replace(/^0+(?=\d)/, '').length > MAX_NUMBER_DIGITS) throw new TermError({ code: 'numTooLong', pos: i });
      tokens.push({ kind: 'num', pos: i, end: j, text, decimal });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      const name = ch.toLowerCase();
      if (!(VARIABLES as readonly string[]).includes(name)) throw new TermError({ code: 'unknownVar', pos: i, a: ch });
      tokens.push({ kind: 'var', pos: i, end: i + 1, text: name });
      i++;
      continue;
    }
    if (SUPERSCRIPTS[ch]) {
      let j = i;
      let digits = '';
      while (SUPERSCRIPTS[src[j] ?? '']) digits += SUPERSCRIPTS[src[j++]!];
      tokens.push({ kind: 'sup', pos: i, end: j, text: digits });
      i = j;
      continue;
    }
    const op = OPS[ch];
    if (op) {
      tokens.push({ kind: 'op', pos: i, end: i + 1, text: ch, op });
      i++;
      continue;
    }
    if (ch === '(' || ch === '[') {
      tokens.push({ kind: 'open', pos: i, end: i + 1, text: ch, bracket: ch });
      i++;
      continue;
    }
    if (ch === ')' || ch === ']') {
      tokens.push({ kind: 'close', pos: i, end: i + 1, text: ch, bracket: ch === ')' ? '(' : '[' });
      i++;
      continue;
    }
    throw new TermError({ code: ch === '=' ? 'equals' : 'badChar', pos: i, a: ch });
  }
  return tokens;
}

/* ------------------------------------------------------------------ */
/* Termbaum                                                            */
/* ------------------------------------------------------------------ */

interface NodeBase {
  id: number;
  /** Bereich im eingegebenen Text (inklusive eigener Klammern). */
  start: number;
  end: number;
  /** Klammern, die ausdrücklich um diesen Teilterm gesetzt wurden (innerste zuerst). */
  brackets: Bracket[];
}

export interface NumNode extends NodeBase {
  kind: 'num';
  value: Q;
  /** Ziffern mit Punkt als Dezimaltrennzeichen (ohne Vorzeichen). */
  digits: string;
  /** Eingegebener Bruch wie 3/4 (gilt als Zahl, nicht als Rechnung). */
  frac?: { num: string; den: string };
  negative: boolean;
  decimal: boolean;
}

export interface VarNode extends NodeBase {
  kind: 'var';
  name: VarName;
}

export interface OpNode extends NodeBase {
  kind: 'op';
  op: Op;
  left: TermNode;
  right: TermNode;
  /** Malpunkt weggelassen (2x, 3(a + b)). */
  implicit: boolean;
  /** Hochzahl als ² geschrieben. */
  sup: boolean;
  /** Position des Rechenzeichens. */
  opPos: number;
}

/** Gegenzahl: Minuszeichen vor einem Teilterm, z. B. −3² oder −(a + b). */
export interface NegNode extends NodeBase {
  kind: 'neg';
  child: TermNode;
  opPos: number;
}

export type TermNode = NumNode | VarNode | OpNode | NegNode;
export type InnerNode = OpNode | NegNode;

export interface ParsedTerm {
  root: TermNode;
  /** Alle Knoten, Index = id. */
  nodes: TermNode[];
  /** Vorkommende Variablen (in der Reihenfolge von VARIABLES). */
  vars: VarName[];
  /** Kommen Dezimalzahlen vor? Dann werden Ergebnisse möglichst als Dezimalzahl angezeigt. */
  decimal: boolean;
  /** Höhe des Baums (Zahlen und Variablen haben Höhe 0). */
  height: number;
}

export type ParseResult = { ok: true; term: ParsedTerm } | { ok: false; error: ParseError };

class Parser {
  private i = 0;
  readonly nodes: TermNode[] = [];

  constructor(private readonly toks: Token[]) {}

  private peek(k = 0): Token | undefined {
    return this.toks[this.i + k];
  }

  private prev(): Token | undefined {
    return this.toks[this.i - 1];
  }

  private next(): Token {
    return this.toks[this.i++]!;
  }

  private isOp(t: Token | undefined, ...ops: Op[]): boolean {
    return !!t && t.kind === 'op' && ops.includes(t.op!);
  }

  private add<T extends TermNode>(node: Omit<T, 'id'>): T {
    const full = { ...node, id: this.nodes.length } as T;
    this.nodes.push(full);
    return full;
  }

  private op(op: Op, left: TermNode, right: TermNode, opPos: number, implicit = false, sup = false): OpNode {
    return this.add<OpNode>({ kind: 'op', op, left, right, implicit, sup, opPos, start: left.start, end: right.end, brackets: [] });
  }

  parse(): TermNode {
    if (!this.toks.length) throw new TermError({ code: 'empty', pos: 0 });
    const root = this.expr();
    const t = this.peek();
    if (t) {
      if (t.kind === 'close') throw new TermError({ code: 'unexpectedClose', pos: t.pos, a: t.text });
      throw new TermError({ code: 'missingOp', pos: t.pos, a: symbolOf(this.prev()), b: symbolOf(t) });
    }
    return root;
  }

  /** Summen und Differenzen. */
  private expr(): TermNode {
    let left = this.term(true);
    while (this.isOp(this.peek(), '+', '-')) {
      const t = this.next();
      const right = this.term(false);
      left = this.op(t.op!, left, right, t.pos);
    }
    return left;
  }

  /** Produkte und Quotienten (auch mit weggelassenem Malpunkt). */
  private term(allowSign: boolean): TermNode {
    let left = this.signed(allowSign);
    for (;;) {
      const t = this.peek();
      if (this.isOp(t, '*', ':', '/')) {
        this.next();
        const right = this.signed(false);
        left = this.op(t!.op!, left, right, t!.pos);
        continue;
      }
      if (t && (t.kind === 'var' || t.kind === 'open' || t.kind === 'num')) {
        const before = this.prev()!;
        if (t.kind === 'num') throw new TermError({ code: 'missingOp', pos: t.pos, a: symbolOf(before), b: symbolOf(t) });
        const right = this.signed(false);
        left = this.op('*', left, right, t.pos, true);
        continue;
      }
      return left;
    }
  }

  /** Vorzeichen: nur am Anfang des Terms oder direkt nach einer öffnenden Klammer. */
  private signed(allowSign: boolean): TermNode {
    const t = this.peek();
    if (!this.isOp(t, '-')) return this.power(false);
    if (!allowSign) throw new TermError({ code: 'signAfterOp', pos: t!.pos, a: symbolOf(this.prev()) });
    this.next();
    const nt = this.peek();
    if (!nt) throw new TermError({ code: 'expectOperand', pos: t!.end, a: '−' });
    if (this.isOp(nt, '-', '+')) throw new TermError({ code: 'doubleSign', pos: nt.pos });
    // −3² ist die Gegenzahl von 3², (−3)² dagegen das Quadrat von −3
    const after = this.peek(1);
    const powered = this.isOp(after, '^') || after?.kind === 'sup';
    if (nt.kind === 'num' && !powered) {
      // Negative Zahl: −3 oder −3/4
      const num = this.primary(false) as NumNode;
      num.value = neg(num.value);
      num.negative = true;
      num.start = t!.pos;
      return num;
    }
    const child = this.power(false);
    return this.add<NegNode>({ kind: 'neg', child, opPos: t!.pos, start: t!.pos, end: child.end, brackets: [] });
  }

  /** Potenzen (rechtsassoziativ: 2^3^2 = 2^(3^2)). */
  private power(inExponent: boolean): TermNode {
    const base = this.primary(inExponent);
    const t = this.peek();
    if (this.isOp(t, '^')) {
      this.next();
      const nt = this.peek();
      if (this.isOp(nt, '-', '+')) throw new TermError({ code: 'signInExponent', pos: nt!.pos });
      const exp = this.power(true);
      return this.op('^', base, exp, t!.pos);
    }
    if (t?.kind === 'sup') {
      this.next();
      const exp = this.add<NumNode>({ kind: 'num', value: q(BigInt(t.text)), digits: t.text, negative: false, decimal: false, start: t.pos, end: t.end, brackets: [] });
      return this.op('^', base, exp, t.pos, false, true);
    }
    return base;
  }

  private primary(inExponent: boolean): TermNode {
    const t = this.peek();
    if (!t) {
      const p = this.prev();
      throw new TermError({ code: 'expectOperand', pos: p ? p.end : 0, a: symbolOf(p) });
    }
    if (t.kind === 'num') {
      this.next();
      const n1 = this.peek(1);
      const after = this.peek(2);
      // 3/4 zwischen zwei ganzen Zahlen ist ein Bruch (eine Zahl), keine Rechnung
      if (!inExponent && !t.decimal && this.isOp(this.peek(), '/') && n1?.kind === 'num' && !n1.decimal && !(this.isOp(after, '^') || after?.kind === 'sup')) {
        this.next();
        this.next();
        if (BigInt(n1.text) === 0n) throw new TermError({ code: 'zeroDen', pos: n1.pos });
        return this.add<NumNode>({
          kind: 'num',
          value: q(BigInt(t.text), BigInt(n1.text)),
          digits: `${t.text}/${n1.text}`,
          frac: { num: t.text, den: n1.text },
          negative: false,
          decimal: false,
          start: t.pos,
          end: n1.end,
          brackets: [],
        });
      }
      return this.add<NumNode>({ kind: 'num', value: fromDecimal(t.text), digits: t.text, negative: false, decimal: !!t.decimal, start: t.pos, end: t.end, brackets: [] });
    }
    if (t.kind === 'var') {
      this.next();
      return this.add<VarNode>({ kind: 'var', name: t.text as VarName, start: t.pos, end: t.end, brackets: [] });
    }
    if (t.kind === 'open') {
      this.next();
      if (this.peek()?.kind === 'close') throw new TermError({ code: 'emptyParens', pos: t.pos });
      const inner = this.expr();
      const c = this.peek();
      if (!c) throw new TermError({ code: 'unclosed', pos: t.pos, a: t.text });
      if (c.kind !== 'close') throw new TermError({ code: 'missingOp', pos: c.pos, a: symbolOf(this.prev()), b: symbolOf(c) });
      if (c.bracket !== t.bracket) throw new TermError({ code: 'mismatch', pos: c.pos, a: t.text, b: c.text });
      this.next();
      inner.brackets.push(t.bracket!);
      inner.start = t.pos;
      inner.end = c.end;
      return inner;
    }
    if (t.kind === 'close') {
      const p = this.prev();
      if (!p || p.kind === 'open') throw new TermError({ code: 'unexpectedClose', pos: t.pos, a: t.text });
      throw new TermError({ code: 'expectOperand', pos: t.pos, a: symbolOf(p) });
    }
    if (t.kind === 'sup') throw new TermError({ code: 'expectOperand', pos: t.pos, a: symbolOf(this.prev()) });
    // Rechenzeichen an einer Stelle, an der eine Zahl stehen müsste
    const p = this.prev();
    if (!p || p.kind === 'open') throw new TermError({ code: 'startOperator', pos: t.pos, a: symbolOf(t) });
    throw new TermError({ code: 'expectOperand', pos: t.pos, a: symbolOf(p) });
  }
}

/** Kinder eines Knotens (von links nach rechts). */
export function children(node: TermNode): TermNode[] {
  if (node.kind === 'op') return [node.left, node.right];
  if (node.kind === 'neg') return [node.child];
  return [];
}

export function isInner(node: TermNode): node is InnerNode {
  return node.kind === 'op' || node.kind === 'neg';
}

/** Höhe eines Teilbaums: Zahlen 0, sonst 1 + größte Höhe der Kinder. */
export function heightOf(node: TermNode): number {
  const c = children(node);
  return c.length ? 1 + Math.max(...c.map(heightOf)) : 0;
}

/** Blätter (Zahlen und Variablen) von links nach rechts. */
export function leavesOf(node: TermNode): TermNode[] {
  const c = children(node);
  return c.length ? c.flatMap(leavesOf) : [node];
}

/** Alle Knoten eines Teilbaums. */
export function subtree(node: TermNode): TermNode[] {
  return [node, ...children(node).flatMap(subtree)];
}

/** Liest einen Term. Fehler werden mit Position und Grund zurückgegeben. */
export function parseTerm(src: string): ParseResult {
  try {
    const parser = new Parser(tokenize(src));
    const root = parser.parse();
    const nodes = parser.nodes;
    const leaves = leavesOf(root);
    if (leaves.length > MAX_LEAVES) throw new TermError({ code: 'tooLong', pos: leaves[MAX_LEAVES]!.start });
    const height = heightOf(root);
    if (height > MAX_HEIGHT) throw new TermError({ code: 'tooDeep', pos: 0 });
    const used = new Set(nodes.filter((n): n is VarNode => n.kind === 'var').map((n) => n.name));
    return {
      ok: true,
      term: {
        root,
        nodes,
        vars: VARIABLES.filter((v) => used.has(v)),
        decimal: nodes.some((n) => n.kind === 'num' && n.decimal),
        height,
      },
    };
  } catch (error) {
    if (error instanceof TermError) return { ok: false, error: error.info };
    throw error;
  }
}

/** Welche Variablen kommen in einem (ggf. fehlerhaften) Term vor? Schnell, für die Sichtbarkeit der Regler. */
export function usesVariable(src: string, name: VarName): boolean {
  return src.toLowerCase().includes(name);
}

/* ------------------------------------------------------------------ */
/* Auswerten                                                           */
/* ------------------------------------------------------------------ */

export type EvalError = 'divZero' | 'zeroPowZero' | 'fracExp' | 'tooBig';
export type NodeValue = { ok: true; value: Q } | { ok: false; error: EvalError | 'blocked' };

/** Wert einer einzelnen Rechnung. */
export function compute(op: Op | 'neg', a: Q, b?: Q): NodeValue {
  let r: Q;
  switch (op) {
    case 'neg':
      r = neg(a);
      break;
    case '+':
      r = add(a, b!);
      break;
    case '-':
      r = sub(a, b!);
      break;
    case '*':
      r = mul(a, b!);
      break;
    case ':':
    case '/':
      if (isZero(b!)) return { ok: false, error: 'divZero' };
      r = q(a.n * b!.d, a.d * b!.n);
      break;
    case '^': {
      const e = b!;
      if (!isInt(e)) return { ok: false, error: 'fracExp' };
      if (isZero(a) && e.n <= 0n) return { ok: false, error: e.n === 0n ? 'zeroPowZero' : 'divZero' };
      const k = abs(e.n);
      // Abschätzung der Stellenzahl, bevor gerechnet wird
      const digits = Math.max(Math.log10(Number(abs(a.n))), Math.log10(Number(a.d))) * Number(k);
      if (k > 400n || digits > MAX_DIGITS + 2) return { ok: false, error: 'tooBig' };
      const p = q(a.n ** k, a.d ** k);
      r = e.n < 0n ? q(p.d, p.n) : p;
      break;
    }
  }
  return tooBig(r) ? { ok: false, error: 'tooBig' } : { ok: true, value: r };
}

/** Werte aller Knoten (Index = id). Variablen werden mit `vars` belegt. */
export function evaluateAll(term: ParsedTerm, vars: Partial<Record<VarName, Q>>): NodeValue[] {
  const out: NodeValue[] = [];
  const visit = (node: TermNode): NodeValue => {
    let v: NodeValue;
    if (node.kind === 'num') v = { ok: true, value: node.value };
    else if (node.kind === 'var') v = { ok: true, value: vars[node.name] ?? q(0) };
    else if (node.kind === 'neg') {
      const c = visit(node.child);
      v = c.ok ? compute('neg', c.value) : { ok: false, error: 'blocked' };
    } else {
      const l = visit(node.left);
      const r = visit(node.right);
      v = l.ok && r.ok ? compute(node.op, l.value, r.value) : { ok: false, error: 'blocked' };
    }
    out[node.id] = v;
    return v;
  };
  visit(term.root);
  return out;
}

/* ------------------------------------------------------------------ */
/* Rechenreihenfolge                                                   */
/* ------------------------------------------------------------------ */

/** Rechenstufe: Strich 1, Punkt 2, Gegenzahl 3, Potenz 4. */
export type OpClass = 'line' | 'point' | 'sign' | 'power';
export function opClass(node: InnerNode): OpClass {
  if (node.kind === 'neg') return 'sign';
  if (node.op === '^') return 'power';
  return node.op === '+' || node.op === '-' ? 'line' : 'point';
}
const CLASS_RANK: Record<OpClass, number> = { line: 1, point: 2, sign: 3, power: 4 };

/** Warum eine Rechnung jetzt dran ist. */
export type Reason = 'bracket' | 'power' | 'sign' | 'point' | 'leftToRight' | 'last';

export interface Step {
  id: number;
  reason: Reason;
}

/** Klammertiefe jeder Rechnung (eigene Klammern zählen mit). */
export function bracketDepths(term: ParsedTerm): number[] {
  const depth: number[] = [];
  const visit = (node: TermNode, outer: number) => {
    const d = outer + node.brackets.length;
    depth[node.id] = d;
    for (const c of children(node)) visit(c, d);
  };
  visit(term.root, 0);
  return depth;
}

/** Rechnungen, deren Teilterme schon ausgerechnet sind (oder Zahlen sind). */
export function readyNodes(term: ParsedTerm, done: ReadonlySet<number>): InnerNode[] {
  return term.nodes.filter((n): n is InnerNode => isInner(n) && !done.has(n.id) && children(n).every((c) => !isInner(c) || done.has(c.id)));
}

/** Die nach den Regeln als Nächstes auszuführende Rechnung. */
export function conventionalNext(term: ParsedTerm, done: ReadonlySet<number>, depths = bracketDepths(term)): InnerNode | null {
  const ready = readyNodes(term, done);
  ready.sort((a, b) => depths[b.id]! - depths[a.id]! || CLASS_RANK[opClass(b)] - CLASS_RANK[opClass(a)] || a.opPos - b.opPos);
  return ready[0] ?? null;
}

/** Begründung für eine Rechnung, wenn `remaining` noch offen sind (ohne sie selbst). */
export function reasonFor(node: InnerNode, remaining: readonly InnerNode[], depth: number): Reason {
  if (!remaining.length) return 'last';
  if (depth > 0) return 'bracket';
  const cls = opClass(node);
  if (cls === 'power') return 'power';
  if (cls === 'sign') return 'sign';
  if (cls === 'point' && remaining.some((r) => opClass(r) === 'line')) return 'point';
  return 'leftToRight';
}

/** Die ganze Rechenreihenfolge nach den Regeln. */
export function evaluationOrder(term: ParsedTerm): Step[] {
  const depths = bracketDepths(term);
  const done = new Set<number>();
  const steps: Step[] = [];
  for (;;) {
    const next = conventionalNext(term, done, depths);
    if (!next) return steps;
    const remaining = term.nodes.filter((n): n is InnerNode => isInner(n) && !done.has(n.id) && n.id !== next.id);
    steps.push({ id: next.id, reason: reasonFor(next, remaining, depths[next.id]!) });
    done.add(next.id);
  }
}

/* ------------------------------------------------------------------ */
/* Termart und Gliederung                                              */
/* ------------------------------------------------------------------ */

export type Kind = 'sum' | 'difference' | 'product' | 'quotient' | 'power' | 'negation' | 'number' | 'variable';

export function kindOf(node: TermNode): Kind {
  if (node.kind === 'num') return 'number';
  if (node.kind === 'var') return 'variable';
  if (node.kind === 'neg') return 'negation';
  return ({ '+': 'sum', '-': 'difference', '*': 'product', ':': 'quotient', '/': 'quotient', '^': 'power' } as const)[node.op];
}

export const KIND_NAMES: Record<Kind, Record<Lang, string>> = {
  sum: { de: 'Summe', en: 'sum' },
  difference: { de: 'Differenz', en: 'difference' },
  product: { de: 'Produkt', en: 'product' },
  quotient: { de: 'Quotient', en: 'quotient' },
  power: { de: 'Potenz', en: 'power' },
  negation: { de: 'Gegenzahl', en: 'opposite' },
  number: { de: 'Zahl', en: 'number' },
  variable: { de: 'Variable', en: 'variable' },
};

/** Namen der beiden Glieder, z. B. Minuend und Subtrahend. */
export const PART_NAMES: Partial<Record<Kind, [Record<Lang, string>, Record<Lang, string>]>> = {
  sum: [
    { de: '1. Summand', en: 'First addend' },
    { de: '2. Summand', en: 'Second addend' },
  ],
  difference: [
    { de: 'Minuend', en: 'Minuend' },
    { de: 'Subtrahend', en: 'Subtrahend' },
  ],
  product: [
    { de: '1. Faktor', en: 'First factor' },
    { de: '2. Faktor', en: 'Second factor' },
  ],
  quotient: [
    { de: 'Dividend', en: 'Dividend' },
    { de: 'Divisor', en: 'Divisor' },
  ],
  power: [
    { de: 'Basis', en: 'Base' },
    { de: 'Exponent', en: 'Exponent' },
  ],
};

/* ------------------------------------------------------------------ */
/* Satz („Box“) für die Anzeige                                        */
/* ------------------------------------------------------------------ */

export type Role = 'num' | 'var' | 'op' | 'paren' | 'value';

export type Box =
  | { t: 'text'; s: string; role: Role; node: number; cls?: OpClass; fresh?: boolean }
  | { t: 'row'; items: Box[]; node: number }
  | { t: 'frac'; num: Box; den: Box; node: number; role?: Role; bar?: OpClass; fresh?: boolean }
  | { t: 'sup'; base: Box; exp: Box; node: number };

export interface TypesetOptions {
  lang: Lang;
  decimal: boolean;
  /** Schon ausgerechnete Rechnungen (id → Wert): Sie erscheinen als Zahl. */
  values?: ReadonlyMap<number, Q>;
  /** Variablen durch Zahlen ersetzen. */
  subst?: Partial<Record<VarName, Q>>;
  /** Diese Rechnung ist gerade neu ausgerechnet (wird hervorgehoben). */
  fresh?: number;
}

const OP_TEXT: Record<Exclude<Op, '/' | '^'>, string> = { '+': '+', '-': '−', '*': '·', ':': ':' };

function numberBox(value: Q, node: number, o: TypesetOptions, role: Role, fresh: boolean): { box: Box; negative: boolean } {
  const s = show(value, o.decimal, o.lang);
  if (s.kind === 'frac') {
    const frac: Box = { t: 'frac', num: { t: 'text', s: s.num, role, node }, den: { t: 'text', s: s.den, role, node }, node, role, fresh };
    return { box: s.neg ? { t: 'row', items: [{ t: 'text', s: '−', role, node, fresh }, frac], node } : frac, negative: s.neg };
  }
  return { box: { t: 'text', s: s.neg ? `−${s.text}` : s.text, role, node, fresh }, negative: s.neg };
}

function wrap(box: Box, node: number, brackets: readonly Bracket[]): Box {
  let out = box;
  for (const b of brackets) {
    out = {
      t: 'row',
      items: [{ t: 'text', s: b, role: 'paren', node }, out, { t: 'text', s: b === '(' ? ')' : ']', role: 'paren', node }],
      node,
    };
  }
  return out;
}

/** Beginnt die Darstellung mit einer Zahl (oder einem Bruch)? Dann braucht der weggelassene Malpunkt wieder einen Punkt. */
function startsWithNumber(box: Box): boolean {
  if (box.t === 'text') return box.role === 'num' || box.role === 'value' || /^[0-9−]/.test(box.s);
  if (box.t === 'frac') return true;
  if (box.t === 'sup') return startsWithNumber(box.base);
  const first = box.items[0];
  return !!first && startsWithNumber(first);
}

/**
 * Setzt einen Term (ggf. teilweise ausgerechnet) als verschachtelte Boxen.
 * `first`: Steht der Teilterm ganz am Anfang? Dann braucht eine negative Zahl keine Klammer.
 */
export function typeset(node: TermNode, o: TypesetOptions, first = true, base = false): Box {
  const done = o.values?.get(node.id);
  if (done !== undefined) {
    const { box, negative } = numberBox(done, node.id, o, 'value', o.fresh === node.id);
    const needs = (negative && !first) || (base && (negative || box.t === 'frac'));
    return needs ? wrap(box, node.id, ['(']) : box;
  }
  if (node.kind === 'num') {
    const role: Role = 'num';
    let box: Box;
    if (node.frac) {
      const frac: Box = { t: 'frac', num: { t: 'text', s: node.frac.num, role, node: node.id }, den: { t: 'text', s: node.frac.den, role, node: node.id }, node: node.id, role };
      box = node.negative ? { t: 'row', items: [{ t: 'text', s: '−', role, node: node.id }, frac], node: node.id } : frac;
    } else {
      const digits = o.lang === 'de' ? node.digits.replace('.', ',') : node.digits;
      box = { t: 'text', s: node.negative ? `−${digits}` : digits, role, node: node.id };
    }
    return wrap(box, node.id, node.brackets);
  }
  if (node.kind === 'var') {
    const value = o.subst?.[node.name];
    if (value !== undefined) {
      const { box, negative } = numberBox(value, node.id, o, 'value', false);
      // Negative Zahlen werden beim Einsetzen immer eingeklammert
      return wrap(negative ? wrap(box, node.id, ['(']) : box, node.id, node.brackets);
    }
    return wrap({ t: 'text', s: node.name, role: 'var', node: node.id }, node.id, node.brackets);
  }
  const inner = node.brackets.length > 0;
  if (node.kind === 'neg') {
    const child = typeset(node.child, o, false);
    return wrap({ t: 'row', items: [{ t: 'text', s: '−', role: 'op', node: node.id, cls: 'sign' }, child], node: node.id }, node.id, node.brackets);
  }
  const cls = opClass(node);
  if (node.op === '^') {
    const baseBox = typeset(node.left, o, false, true);
    const exp = typeset(node.right, o, true);
    return wrap({ t: 'sup', base: baseBox, exp, node: node.id }, node.id, node.brackets);
  }
  if (node.op === '/') {
    // Zähler und Bruchstrich trennen die Teile – dort braucht eine negative Zahl keine Klammer
    const frac: Box = { t: 'frac', num: typeset(node.left, o, true), den: typeset(node.right, o, true), node: node.id, bar: cls };
    return wrap(frac, node.id, node.brackets);
  }
  const left = typeset(node.left, o, first && !inner);
  const right = typeset(node.right, o, false);
  const items: Box[] = [left];
  const isValue = (n: TermNode) => o.values?.has(n.id) || (n.kind === 'var' && o.subst?.[n.name] !== undefined);
  if (!node.implicit || startsWithNumber(right) || isValue(node.left) || isValue(node.right)) {
    items.push({ t: 'text', s: OP_TEXT[node.op], role: 'op', node: node.id, cls });
  }
  items.push(right);
  return wrap({ t: 'row', items, node: node.id }, node.id, node.brackets);
}

/** Box als einfacher Text (für Gliederung und Tests): Brüche als a/b, Hochzahlen mit ^. */
export function boxText(box: Box): string {
  switch (box.t) {
    case 'text':
      return box.s;
    case 'frac': {
      const simple = (b: Box) => b.t === 'text';
      const n = boxText(box.num);
      const d = boxText(box.den);
      return `${simple(box.num) ? n : `(${n})`}/${simple(box.den) ? d : `(${d})`}`;
    }
    case 'sup': {
      const e = boxText(box.exp);
      const sup = /^[0-9]+$/.test(e) ? e.replace(/[0-9]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!) : `^${box.exp.t === 'text' ? e : `(${e})`}`;
      return `${boxText(box.base)}${sup}`;
    }
    case 'row': {
      let out = '';
      box.items.forEach((item, i) => {
        const s = boxText(item);
        const spaced = item.t === 'text' && item.role === 'op' && !(item.cls === 'sign' && i === 0);
        out += spaced ? ` ${s} ` : s;
      });
      return out;
    }
  }
}

/** Teilterm als Text, so wie er eingegeben wurde (ohne Werte). */
export function termText(node: TermNode, lang: Lang, decimal = false): string {
  return boxText(typeset(node, { lang, decimal }));
}

/* ------------------------------------------------------------------ */
/* Gliederung in Worten                                                */
/* ------------------------------------------------------------------ */

type Case = 'nom' | 'dat' | 'gen';

const DE_ARTICLE: Record<Exclude<Kind, 'number' | 'variable'> | 'square' | 'nth', Record<Case, string>> = {
  sum: { nom: 'die Summe', dat: 'der Summe', gen: 'der Summe' },
  difference: { nom: 'die Differenz', dat: 'der Differenz', gen: 'der Differenz' },
  product: { nom: 'das Produkt', dat: 'dem Produkt', gen: 'des Produkts' },
  quotient: { nom: 'der Quotient', dat: 'dem Quotienten', gen: 'des Quotienten' },
  power: { nom: 'die Potenz', dat: 'der Potenz', gen: 'der Potenz' },
  negation: { nom: 'die Gegenzahl', dat: 'der Gegenzahl', gen: 'der Gegenzahl' },
  square: { nom: 'das Quadrat', dat: 'dem Quadrat', gen: 'des Quadrats' },
  nth: { nom: 'die {n}. Potenz', dat: 'der {n}. Potenz', gen: 'der {n}. Potenz' },
};

/** Exponent als ganze Zahl ≥ 2, wenn er direkt als Zahl dasteht. */
function literalExponent(node: OpNode): number | null {
  const e = node.right;
  if (e.kind !== 'num' || e.frac || e.negative || e.decimal || e.brackets.length) return null;
  const k = Number(e.digits);
  return Number.isInteger(k) && k >= 2 && k <= 12 ? k : null;
}

/**
 * Gliederung eines Terms in Worten, z. B. „die Differenz aus der Summe aus 12
 * und 4 und dem Produkt aus 3 und 2“. Ab `maxDepth` werden Teilterme als
 * Term in Anführungszeichen genannt, damit der Satz lesbar bleibt.
 */
export function describe(node: TermNode, lang: Lang, maxDepth = 3, kase: Case = 'nom', depth = 0): string {
  const leaf = node.kind === 'num' || node.kind === 'var';
  if (leaf) return termText(node, lang);
  if (depth >= maxDepth) {
    const text = termText({ ...node, brackets: [] }, lang);
    return lang === 'de' ? `„${text}“` : `“${text}”`;
  }
  const kind = kindOf(node);
  if (lang === 'en') {
    const d = (n: TermNode) => describe(n, lang, maxDepth, 'nom', depth + 1);
    if (node.kind === 'neg') return `the opposite of ${d(node.child)}`;
    if (node.op === '^') {
      const k = literalExponent(node);
      if (k === 2) return `the square of ${d(node.left)}`;
      if (k === 3) return `the cube of ${d(node.left)}`;
      return `the power with base ${d(node.left)} and exponent ${d(node.right)}`;
    }
    return `the ${KIND_NAMES[kind].en} of ${d(node.left)} and ${d(node.right)}`;
  }
  const dat = (n: TermNode) => describe(n, lang, maxDepth, 'dat', depth + 1);
  const gen = (n: TermNode) => (n.kind === 'num' || n.kind === 'var' || depth + 1 >= maxDepth ? `von ${describe(n, lang, maxDepth, 'dat', depth + 1)}` : describe(n, lang, maxDepth, 'gen', depth + 1));
  if (node.kind === 'neg') return `${DE_ARTICLE.negation[kase]} ${gen(node.child)}`;
  if (node.op === '^') {
    const k = literalExponent(node);
    if (k === 2) return `${DE_ARTICLE.square[kase]} ${gen(node.left)}`;
    if (k !== null) return `${DE_ARTICLE.nth[kase].replace('{n}', String(k))} ${gen(node.left)}`;
    return `${DE_ARTICLE.power[kase]} mit der Basis ${dat(node.left)} und dem Exponenten ${dat(node.right)}`;
  }
  return `${DE_ARTICLE[kind as 'sum'][kase]} aus ${dat(node.left)} und ${dat(node.right)}`;
}
