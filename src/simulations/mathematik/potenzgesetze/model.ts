/**
 * Rechenlogik für Potenz- und Wurzelgesetze: exakte Brüche als Exponenten,
 * Potenzen mit rationalen Exponenten (wo möglich exakt), Termumformung von
 * Produkten und Quotienten von Potenzen Schritt für Schritt mit dem jeweils
 * angewandten Gesetz, Zahlen werden dazu in Primfaktoren zerlegt
 * (√2 · √8 = 2^(1/2) · 2^(3/2) = 2² = 4).
 * Geprüft in tests/potenzgesetze.test.ts.
 */

/* ------------------------------------------------------------------ */
/* Brüche                                                               */
/* ------------------------------------------------------------------ */

export interface Q {
  readonly n: number;
  readonly d: number;
}
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
export function q(n: number, d = 1): Q {
  if (d === 0) throw new RangeError('Nenner 0');
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g || 0, d: d / g };
}
export const qadd = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qsub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qmul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
export const qdiv = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
export const qval = (a: Q) => a.n / a.d;
export const qeq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
export const qint = (a: Q) => a.d === 1;

/* ------------------------------------------------------------------ */
/* Hochgestellt und Text                                                */
/* ------------------------------------------------------------------ */

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '−': '⁻' };
export const sup = (s: string) => s.replace(/[0-9\-−]/g, (ch) => SUP[ch] ?? ch);

/** Exponent als Text: ganze Zahlen hochgestellt, Brüche als ^(2/3). */
export function expText(e: Q): string {
  if (qint(e)) return sup(String(e.n));
  return `^(${e.n < 0 ? '−' : ''}${Math.abs(e.n)}/${e.d})`;
}
/** Bruch als Text mit echtem Minus. */
export const qText = (a: Q) => (a.d === 1 ? `${a.n < 0 ? '−' : ''}${Math.abs(a.n)}` : `${a.n < 0 ? '−' : ''}${Math.abs(a.n)}/${a.d}`);

/** Potenz „aⁿ“ bzw. „a^(2/3)“; Basis bei Bedarf geklammert. */
export function powText(base: string, e: Q): string {
  if (qeq(e, q(1))) return base;
  const b = /^[a-z0-9]+$/i.test(base) ? base : `(${base})`;
  return `${b}${expText(e)}`;
}

/* ------------------------------------------------------------------ */
/* Zahlen hoch rationale Exponenten                                     */
/* ------------------------------------------------------------------ */

/** Ganzzahlige n-te Wurzel, falls exakt; sonst null. */
export function intRoot(v: number, n: number): number | null {
  if (v < 0) return n % 2 === 1 ? (intRoot(-v, n) === null ? null : -intRoot(-v, n)!) : null;
  const r = Math.round(v ** (1 / n));
  for (const c of [r - 1, r, r + 1]) if (c >= 0 && c ** n === v) return c;
  return null;
}

/**
 * a^(p/q) für einen Bruch a > 0: exakt als Bruch, wenn Zähler und Nenner
 * q-te Potenzen sind, sonst null. Dazu der Dezimalwert.
 */
export function powQ(a: Q, e: Q): { exact: Q | null; value: number } {
  const value = qval(a) ** qval(e);
  if (a.n <= 0) return { exact: a.n === 0 && e.n > 0 ? q(0) : null, value };
  const rn = intRoot(a.n, e.d);
  const rd = intRoot(a.d, e.d);
  if (rn === null || rd === null) return { exact: null, value };
  const k = Math.abs(e.n);
  const num = rn ** k;
  const den = rd ** k;
  if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den)) return { exact: null, value };
  return { exact: e.n >= 0 ? q(num, den) : q(den, num), value };
}

/** Primfaktorzerlegung einer positiven ganzen Zahl (bis 10⁹). */
export function factorize(n: number): Map<number, number> {
  const out = new Map<number, number>();
  let m = Math.abs(Math.round(n));
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.set(p, (out.get(p) ?? 0) + 1);
      m /= p;
    }
  }
  if (m > 1) out.set(m, (out.get(m) ?? 0) + 1);
  return out;
}

/* ------------------------------------------------------------------ */
/* Potenzprodukte (Monome)                                              */
/* ------------------------------------------------------------------ */

/**
 * Ein Potenzprodukt: Vorzeichen · ∏ Basisᵉ. Basen sind Variablen (a, b, x …)
 * oder Primzahlen (als Ziffernfolge), Exponenten rationale Zahlen.
 */
export interface Mono {
  sign: 1 | -1;
  pow: Map<string, Q>;
}

const isPrimeKey = (k: string) => /^\d+$/.test(k);

export function monoOfNumber(v: number): Mono {
  const pow = new Map<string, Q>();
  if (v === 0) throw new RangeError('0 als Basis');
  for (const [p, e] of factorize(v)) pow.set(String(p), q(e));
  return { sign: v < 0 ? -1 : 1, pow };
}
export const monoOfVar = (name: string): Mono => ({ sign: 1, pow: new Map([[name, q(1)]]) });

function clean(m: Mono): Mono {
  const pow = new Map<string, Q>();
  for (const [k, e] of m.pow) if (e.n !== 0) pow.set(k, e);
  return { sign: m.sign, pow };
}
export function monoMul(a: Mono, b: Mono): Mono {
  const pow = new Map(a.pow);
  for (const [k, e] of b.pow) pow.set(k, pow.has(k) ? qadd(pow.get(k)!, e) : e);
  return clean({ sign: (a.sign * b.sign) as 1 | -1, pow });
}
export function monoDiv(a: Mono, b: Mono): Mono {
  const pow = new Map(a.pow);
  for (const [k, e] of b.pow) pow.set(k, pow.has(k) ? qsub(pow.get(k)!, e) : qmul(e, q(-1)));
  return clean({ sign: (a.sign * b.sign) as 1 | -1, pow });
}
export function monoPow(a: Mono, e: Q): Mono {
  const pow = new Map<string, Q>();
  for (const [k, x] of a.pow) pow.set(k, qmul(x, e));
  let sign: 1 | -1 = 1;
  if (a.sign < 0) {
    if (!qint(e)) throw new RangeError('Wurzel aus negativer Zahl');
    sign = Math.abs(e.n) % 2 === 1 ? -1 : 1;
  }
  return clean({ sign, pow });
}

/** Zahlenwert (für Variablen die gegebenen Werte). */
export function monoValue(m: Mono, vars: Record<string, number> = {}): number {
  let v: number = m.sign;
  for (const [k, e] of m.pow) v *= (isPrimeKey(k) ? +k : (vars[k] ?? NaN)) ** qval(e);
  return v;
}

export function monoEqual(a: Mono, b: Mono): boolean {
  if (a.sign !== b.sign || a.pow.size !== b.pow.size) return false;
  for (const [k, e] of a.pow) if (!b.pow.has(k) || !qeq(b.pow.get(k)!, e)) return false;
  return true;
}

/**
 * Text eines Potenzprodukts. Primzahlen mit ganzem Exponenten werden zu
 * einer Zahl (im Zähler bzw. Nenner) zusammengefasst; Variablen und
 * gebrochene Exponenten bleiben als Potenz stehen.
 * `roots`: gebrochene Exponenten als Wurzeln schreiben (x^(3/2) = √(x³)).
 */
export function monoText(m: Mono, roots = false): string {
  let numInt = 1;
  let denInt = 1;
  const numParts: string[] = [];
  const denParts: string[] = [];
  const keys = [...m.pow.keys()].sort((a, b) => (isPrimeKey(a) === isPrimeKey(b) ? (isPrimeKey(a) ? +a - +b : a.localeCompare(b)) : isPrimeKey(a) ? -1 : 1));
  // Primzahlen mit gleichem gebrochenem Exponenten zusammenfassen (2^(1/2)·3^(1/2) = 6^(1/2))
  const fracGroups = new Map<string, number>();
  for (const k of keys) {
    const e = m.pow.get(k)!;
    if (isPrimeKey(k)) {
      const whole = Math.trunc(e.n / e.d);
      const rest = qsub(e, q(whole));
      if (whole > 0) numInt *= (+k) ** whole;
      if (whole < 0) denInt *= (+k) ** -whole;
      if (rest.n !== 0) {
        // Rest immer positiv halten: 2^(−1/2) = 2^(1/2) / 2
        if (rest.n < 0) {
          denInt *= +k;
          const r2 = qadd(rest, q(1));
          const key = `${r2.n}/${r2.d}`;
          fracGroups.set(key, (fracGroups.get(key) ?? 1) * +k);
        } else {
          const key = `${rest.n}/${rest.d}`;
          fracGroups.set(key, (fracGroups.get(key) ?? 1) * +k);
        }
      }
      continue;
    }
    if (e.n > 0) numParts.push(roots && !qint(e) ? rootText(k, e) : powText(k, e));
    else denParts.push(roots && !qint(e) ? rootText(k, qmul(e, q(-1))) : powText(k, qmul(e, q(-1))));
  }
  const fracParts: string[] = [];
  for (const [key, base] of fracGroups) {
    const [n, d] = key.split('/').map(Number) as [number, number];
    fracParts.push(roots ? rootText(String(base), q(n, d)) : powText(String(base), q(n, d)));
  }
  const num = [numInt !== 1 || (!numParts.length && !fracParts.length) ? String(numInt) : '', ...fracParts, ...numParts].filter(Boolean).join(' · ');
  const den = [denInt !== 1 ? String(denInt) : '', ...denParts].filter(Boolean).join(' · ');
  const s = m.sign < 0 ? '−' : '';
  if (!den) return `${s}${num}`;
  const wrap = (t: string) => (t.includes(' · ') ? `(${t})` : t);
  return `${s}${wrap(num)} / ${wrap(den)}`;
}

/** Potenzform ohne Zusammenfassen der Zahlen: „2⁷“, „a² · b⁻¹“. */
export function monoPowerForm(m: Mono): string {
  const keys = [...m.pow.keys()].sort((a, b) => (isPrimeKey(a) === isPrimeKey(b) ? (isPrimeKey(a) ? +a - +b : a.localeCompare(b)) : isPrimeKey(a) ? -1 : 1));
  const parts = keys.map((k) => powText(k, m.pow.get(k)!));
  return `${m.sign < 0 ? '−' : ''}${parts.length ? parts.join(' · ') : '1'}`;
}

/** „2⁷ = 128“ bzw. nur „a⁷“, wenn beides gleich aussieht. */
export function monoResultText(m: Mono): string {
  const a = monoPowerForm(m);
  const b = monoText(m);
  return a === b ? a : `${a} = ${b}`;
}

/** Wurzeltext: x^(m/n) = ⁿ√(xᵐ). */
export function rootText(base: string, e: Q): string {
  const idx = e.d === 2 ? '√' : `${sup(String(e.d))}√`;
  const inner = e.n === 1 ? base : `${/^[a-z0-9]+$/i.test(base) ? base : `(${base})`}${sup(String(e.n))}`;
  return `${idx}${inner.length > 1 ? `(${inner})` : inner}`;
}

/* ------------------------------------------------------------------ */
/* Terme lesen und Schritt für Schritt vereinfachen                     */
/* ------------------------------------------------------------------ */

export type Law =
  | 'mulSame' // aᵐ · aⁿ = a^(m+n)
  | 'divSame' // aᵐ : aⁿ = a^(m−n)
  | 'powPow' // (aᵐ)ⁿ = a^(m·n)
  | 'prodPow' // (a·b)ⁿ = aⁿ · bⁿ
  | 'quotPow' // (a/b)ⁿ = aⁿ / bⁿ
  | 'root' // ⁿ√a = a^(1/n)
  | 'neg' // a^(−n) = 1/aⁿ
  | 'zero' // a⁰ = 1
  | 'factor'; // Zahl in Primfaktoren

export interface Step {
  law: Law;
  /** Teilterm vorher und nachher (Text). */
  from: string;
  to: string;
}

type Node =
  | { k: 'num'; v: number }
  | { k: 'var'; name: string }
  | { k: 'mul'; a: Node; b: Node }
  | { k: 'div'; a: Node; b: Node }
  | { k: 'pow'; a: Node; e: Q }
  | { k: 'root'; a: Node; n: number };

export type ParseResult = { ok: true; node: Node } | { ok: false; pos: number; msg: 'empty' | 'token' | 'paren' | 'exp' | 'zero' };

/**
 * Liest Terme wie „a^3 · a^4“, „(x^2)^3 / x^4“, „√2 · √8“, „8^(2/3)“,
 * „root(3, a^6)“, „(2a)^3“. Malpunkte dürfen fehlen.
 */
export function parseTerm(src: string): ParseResult {
  const s = src.replace(/−/g, '-').replace(/[·×*]/g, '*').replace(/:/g, '/').replace(/\s+/g, '').replace(/,(?=\d)/g, '.').replace(/²/g, '^2').replace(/³/g, '^3');
  if (!s) return { ok: false, pos: 0, msg: 'empty' };
  let i = 0;
  const fail = (msg: 'token' | 'paren' | 'exp' | 'zero'): never => {
    throw { pos: i, msg };
  };
  const startsAtom = () => i < s.length && /[0-9a-z(√∛∜.]/i.test(s[i]!);
  function expr(): Node {
    let a = power();
    while (i < s.length) {
      if (s[i] === '*') {
        i++;
        a = { k: 'mul', a, b: power() };
      } else if (s[i] === '/') {
        i++;
        a = { k: 'div', a, b: power() };
      } else if (startsAtom()) a = { k: 'mul', a, b: power() };
      else break;
    }
    return a;
  }
  function exponent(): Q {
    let sign = 1;
    if (s[i] === '-') {
      sign = -1;
      i++;
    }
    if (s[i] === '(') {
      i++;
      let sg = 1;
      if (s[i] === '-') {
        sg = -1;
        i++;
      }
      const m = /^\d+/.exec(s.slice(i));
      if (!m) fail('exp');
      i += m![0].length;
      let d = 1;
      if (s[i] === '/') {
        i++;
        const md = /^\d+/.exec(s.slice(i));
        if (!md) fail('exp');
        i += md![0].length;
        d = +md![0];
        if (d === 0) fail('zero');
      }
      if (s[i] !== ')') fail('paren');
      i++;
      return q(sign * sg * +m![0], d);
    }
    const m = /^\d+/.exec(s.slice(i));
    if (!m) fail('exp');
    i += m![0].length;
    return q(sign * +m![0]);
  }
  function power(): Node {
    let a = atom();
    while (s[i] === '^') {
      i++;
      a = { k: 'pow', a, e: exponent() };
    }
    return a;
  }
  function atom(): Node {
    const ch = s[i];
    if (ch === undefined) return fail('token');
    if (ch === '(') {
      i++;
      const a = expr();
      if (s[i] !== ')') fail('paren');
      i++;
      return a;
    }
    if (ch === '√' || ch === '∛' || ch === '∜') {
      i++;
      const n = ch === '√' ? 2 : ch === '∛' ? 3 : 4;
      return { k: 'root', a: atom(), n };
    }
    if (s.startsWith('sqrt(', i)) {
      i += 5;
      const a = expr();
      if (s[i] !== ')') fail('paren');
      i++;
      return { k: 'root', a, n: 2 };
    }
    if (s.startsWith('root(', i)) {
      i += 5;
      const m = /^\d+/.exec(s.slice(i));
      if (!m) fail('exp');
      i += m![0].length;
      if (s[i] !== ';' && s[i] !== ',' && s[i] !== '.') fail('token');
      i++;
      const a = expr();
      if (s[i] !== ')') fail('paren');
      i++;
      const n = +m![0];
      if (n < 1) fail('zero');
      return { k: 'root', a, n };
    }
    const num = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (num) {
      i += num[0].length;
      const v = parseFloat(num[0]);
      if (!Number.isInteger(v)) {
        // Dezimalzahl als Bruch
        const d = 10 ** (num[1]!.length - 1);
        return { k: 'div', a: { k: 'num', v: Math.round(v * d) }, b: { k: 'num', v: d } };
      }
      if (v === 0) fail('zero');
      return { k: 'num', v };
    }
    if (/[a-z]/i.test(ch)) {
      i++;
      return { k: 'var', name: ch.toLowerCase() };
    }
    return fail('token');
  }
  try {
    const node = expr();
    if (i < s.length) fail(s[i] === ')' ? 'paren' : 'token');
    return { ok: true, node };
  } catch (e) {
    const er = e as { pos: number; msg: 'token' | 'paren' | 'exp' | 'zero' };
    if (er && typeof er.pos === 'number') return { ok: false, pos: er.pos, msg: er.msg };
    throw e;
  }
}

/** Text eines Teilbaums (für die Schritte). */
export function nodeText(n: Node): string {
  switch (n.k) {
    case 'num':
      return String(n.v);
    case 'var':
      return n.name;
    case 'mul':
      return `${nodeText(n.a)} · ${wrapDiv(n.b)}`;
    case 'div':
      return `${wrapMul(n.a)} : ${wrapMul(n.b)}`;
    case 'pow': {
      const base = n.a.k === 'num' || n.a.k === 'var' ? nodeText(n.a) : `(${nodeText(n.a)})`;
      return `${base}${expText(n.e)}`;
    }
    case 'root':
      return `${n.n === 2 ? '√' : `${sup(String(n.n))}√`}${n.a.k === 'num' || n.a.k === 'var' ? nodeText(n.a) : `(${nodeText(n.a)})`}`;
  }
}
const wrapMul = (n: Node) => (n.k === 'mul' || n.k === 'div' ? `(${nodeText(n)})` : nodeText(n));
const wrapDiv = (n: Node) => (n.k === 'div' ? `(${nodeText(n)})` : nodeText(n));

/**
 * Vereinfacht einen Term zu einem Potenzprodukt und protokolliert die
 * angewandten Gesetze (von innen nach außen).
 */
export function simplify(n: Node): { mono: Mono; steps: Step[] } {
  const steps: Step[] = [];
  const mono = go(n, steps);
  return { mono, steps };
}

function sharedBases(a: Mono, b: Mono): string[] {
  return [...a.pow.keys()].filter((k) => b.pow.has(k));
}

function go(n: Node, steps: Step[]): Mono {
  switch (n.k) {
    case 'num': {
      const m = monoOfNumber(n.v);
      return m;
    }
    case 'var':
      return monoOfVar(n.name);
    case 'mul': {
      const A = go(n.a, steps);
      const B = go(n.b, steps);
      const r = monoMul(A, B);
      if (sharedBases(A, B).length && (n.a.k !== 'num' || n.b.k !== 'num')) steps.push({ law: 'mulSame', from: nodeText(n), to: monoResultText(r) });
      return r;
    }
    case 'div': {
      const A = go(n.a, steps);
      const B = go(n.b, steps);
      const r = monoDiv(A, B);
      if (sharedBases(A, B).length && (n.a.k !== 'num' || n.b.k !== 'num')) steps.push({ law: 'divSame', from: nodeText(n), to: monoResultText(r) });
      return r;
    }
    case 'pow': {
      const A = go(n.a, steps);
      const r = monoPow(A, n.e);
      if (n.e.n === 0) steps.push({ law: 'zero', from: nodeText(n), to: '1' });
      else if (A.pow.size > 1 && hasDiv(A)) steps.push({ law: 'quotPow', from: nodeText(n), to: monoResultText(r) });
      else if (A.pow.size > 1 && !isPlainNumber(A)) steps.push({ law: 'prodPow', from: nodeText(n), to: monoResultText(r) });
      else if (n.a.k === 'pow' || (A.pow.size === 1 && !qeq([...A.pow.values()][0]!, q(1)))) steps.push({ law: 'powPow', from: nodeText(n), to: monoResultText(r) });
      else if (n.e.n < 0) steps.push({ law: 'neg', from: nodeText(n), to: monoResultText(r) });
      return r;
    }
    case 'root': {
      const A = go(n.a, steps);
      const r = monoPow(A, q(1, n.n));
      const inner = `${A.pow.size === 1 && !hasDiv(A) && monoText(A).length <= 3 ? monoText(A) : `(${monoText(A)})`}^(1/${n.n})`;
      const chain = [inner, monoPowerForm(r), monoText(r)].filter((t, k, all) => k === 0 || t !== all[k - 1]);
      steps.push({ law: 'root', from: nodeText(n), to: chain.join(' = ') });
      return r;
    }
  }
}
const hasDiv = (m: Mono) => [...m.pow.values()].some((e) => e.n < 0) && [...m.pow.values()].some((e) => e.n > 0);
const isPlainNumber = (m: Mono) => [...m.pow.entries()].every(([k, e]) => isPrimeKey(k) && qint(e) && e.n > 0);

/** Prüft, ob zwei Terme gleichwertig sind (gleiches Potenzprodukt). */
export function sameTerm(a: Node, b: Node): boolean {
  try {
    return monoEqual(simplify(a).mono, simplify(b).mono);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Potenzfunktionen f(x) = x^(m/n)                                     */
/* ------------------------------------------------------------------ */

/**
 * Wert von x^(m/n) für reelles x (gekürzter Bruch). Für negatives x nur,
 * wenn n ungerade ist (z. B. x^(1/3)); sonst null. x = 0 mit negativem
 * Exponenten: null (Polstelle).
 */
export function powReal(x: number, m: number, n = 1): number | null {
  const e = q(m, n);
  if (x === 0) return qval(e) > 0 ? 0 : qval(e) === 0 ? 1 : null;
  if (x > 0) return Math.pow(x, qval(e));
  if (e.d % 2 === 0) return null;
  const v = Math.pow(-x, qval(e));
  return e.n % 2 === 0 ? v : -v;
}

export type Symmetry = 'axis' | 'point' | 'none';
/** Symmetrie des Graphen von x^(m/n): gerade/ungerade bei ganzem Exponenten bzw. ungeradem Nenner. */
export function symmetryOf(m: number, n = 1): Symmetry {
  const e = q(m, n);
  if (e.d % 2 === 0) return 'none';
  return e.n % 2 === 0 ? 'axis' : 'point';
}

/** Definitionsbereich als Kurztext-Schlüssel. */
export function domainOf(m: number, n = 1): 'R' | 'R0+' | 'R+' | 'R\\0' {
  const e = q(m, n);
  if (e.d % 2 === 0) return qval(e) > 0 ? 'R0+' : 'R+';
  return qval(e) < 0 ? 'R\\0' : 'R';
}

/* ------------------------------------------------------------------ */
/* Zehnerpotenzen und wissenschaftliche Schreibweise                    */
/* ------------------------------------------------------------------ */

/** Zerlegung v = a · 10ᵏ mit 1 ≤ |a| < 10. */
export function sciParts(v: number): { a: number; k: number } {
  if (v === 0 || !Number.isFinite(v)) return { a: v, k: 0 };
  let k = Math.floor(Math.log10(Math.abs(v)));
  let a = v / Math.pow(10, k);
  if (Math.abs(a) >= 10 - 1e-12) {
    a /= 10;
    k += 1;
  }
  return { a, k };
}

export interface Prefix {
  sym: string;
  de: string;
  en: string;
  exp: number;
}
export const PREFIXES: readonly Prefix[] = [
  { sym: 'f', de: 'Femto', en: 'femto', exp: -15 },
  { sym: 'p', de: 'Piko', en: 'pico', exp: -12 },
  { sym: 'n', de: 'Nano', en: 'nano', exp: -9 },
  { sym: 'µ', de: 'Mikro', en: 'micro', exp: -6 },
  { sym: 'm', de: 'Milli', en: 'milli', exp: -3 },
  { sym: '', de: '', en: '', exp: 0 },
  { sym: 'k', de: 'Kilo', en: 'kilo', exp: 3 },
  { sym: 'M', de: 'Mega', en: 'mega', exp: 6 },
  { sym: 'G', de: 'Giga', en: 'giga', exp: 9 },
  { sym: 'T', de: 'Tera', en: 'tera', exp: 12 },
  { sym: 'P', de: 'Peta', en: 'peta', exp: 15 },
  { sym: 'E', de: 'Exa', en: 'exa', exp: 18 },
];
/** Passende Vorsilbe für eine Länge in m (größte mit Wert ≥ 1). */
export function prefixFor(v: number): Prefix {
  const k = sciParts(v).k;
  let best = PREFIXES[0]!;
  for (const pr of PREFIXES) if (pr.exp <= k) best = pr;
  return best;
}

export interface Thing {
  id: string;
  /** typische Größe in m */
  size: number;
  de: string;
  en: string;
}
/** Größenordnungen von Dingen (gerundete Beispielwerte). */
export const THINGS: readonly Thing[] = [
  { id: 'proton', size: 1.7e-15, de: 'Proton', en: 'proton' },
  { id: 'atom', size: 1e-10, de: 'Atom', en: 'atom' },
  { id: 'dna', size: 2e-9, de: 'DNA-Strang (Breite)', en: 'DNA strand (width)' },
  { id: 'virus', size: 1e-7, de: 'Virus', en: 'virus' },
  { id: 'bacterium', size: 2e-6, de: 'Bakterium', en: 'bacterium' },
  { id: 'hair', size: 7e-5, de: 'Haar (Dicke)', en: 'hair (thickness)' },
  { id: 'ant', size: 5e-3, de: 'Ameise', en: 'ant' },
  { id: 'human', size: 1.7, de: 'Mensch', en: 'human' },
  { id: 'tower', size: 330, de: 'Eiffelturm', en: 'Eiffel Tower' },
  { id: 'everest', size: 8.8e3, de: 'Mount Everest', en: 'Mount Everest' },
  { id: 'earth', size: 1.27e7, de: 'Erde (Durchmesser)', en: 'Earth (diameter)' },
  { id: 'sun', size: 1.39e9, de: 'Sonne (Durchmesser)', en: 'Sun (diameter)' },
  { id: 'au', size: 1.5e11, de: 'Abstand Erde–Sonne', en: 'Earth–Sun distance' },
  { id: 'ly', size: 9.46e15, de: 'Lichtjahr', en: 'light year' },
  { id: 'galaxy', size: 1e21, de: 'Milchstraße', en: 'Milky Way' },
];
/** Wie oft passt das Kleinere in das Größere (Verhältnis als Zehnerpotenz)? */
export const orderRatio = (big: number, small: number) => Math.round(Math.log10(big / small));

/* ------------------------------------------------------------------ */
/* Übung: kurze Aufgaben zu den Potenzgesetzen                          */
/* ------------------------------------------------------------------ */

export interface Drill {
  /** Aufgabentext mit Lücke „?“ */
  task: string;
  /** gesuchte Zahl */
  answer: number;
  /** Regel-Schlüssel für den Tipp */
  rule: 'mul' | 'div' | 'powpow' | 'neg' | 'frac' | 'sci' | 'zero';
}

/** Aufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeDrill(num: number): Drill {
  let s = (Math.floor(num) * 2654435761 + 31337) >>> 0 || 1;
  const r = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + (Math.floor(r() * (hi - lo + 1)) % (hi - lo + 1));
  const kind = int(0, 6);
  const S = (v: number) => sup(String(v));
  switch (kind) {
    case 0: {
      const m = int(2, 7);
      const n = int(2, 7);
      return { task: `a${S(m)} · a${S(n)} = a^?`, answer: m + n, rule: 'mul' };
    }
    case 1: {
      const m = int(5, 12);
      const n = int(1, 9);
      return { task: `x${S(m)} : x${S(n)} = x^?`, answer: m - n, rule: 'div' };
    }
    case 2: {
      const m = int(2, 5);
      const n = int(2, 4);
      return { task: `(b${S(m)})${S(n)} = b^?`, answer: m * n, rule: 'powpow' };
    }
    case 3: {
      const a = int(2, 5);
      const n = int(1, 3);
      return { task: `${a}${S(-n)} = 1 : ?`, answer: a ** n, rule: 'neg' };
    }
    case 4: {
      const pick = [
        ['8^(2/3)', 4],
        ['27^(1/3)', 3],
        ['16^(3/4)', 8],
        ['9^(3/2)', 27],
        ['32^(2/5)', 4],
        ['4^(5/2)', 32],
      ] as const;
      const [t, a] = pick[int(0, pick.length - 1)]!;
      return { task: `${t} = ?`, answer: a, rule: 'frac' };
    }
    case 5: {
      const mant = int(12, 98) / 10;
      const k = int(-6, 8);
      const v = mant * 10 ** k;
      const txt = k >= 0 ? Math.round(v).toLocaleString('de-DE') : v.toFixed(-k + 1).replace('.', ',');
      return { task: `${txt} = ${String(mant).replace('.', ',')} · 10^?`, answer: k, rule: 'sci' };
    }
    default: {
      const a = int(2, 9);
      const m = int(2, 6);
      return { task: `${a}${S(m)} : ${a}${S(m)} = ${a}^?`, answer: 0, rule: 'zero' };
    }
  }
}

/** Antwort prüfen (ganze Zahl, auch mit Minuszeichen „−“). */
export function checkDrill(d: Drill, text: string): boolean | null {
  const t = text.trim().replace('−', '-').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Math.abs(Number(t) - d.answer) < 1e-9;
}
