/**
 * Rechenlogik für Richtungsfelder und Differenzialgleichungen:
 * rechte Seite f(x, y) bzw. f(x, y, y′) als Term lesen (ohne eval), Lösungen
 * mit Euler, Heun und Runge-Kutta, exakte Lösungen der Schul-Modelle
 * (exponentiell, beschränkt, logistisch, Schwingung) und Hilfen für das Feld.
 * Geprüft in tests/richtungsfeld.test.ts.
 */

/* ------------------------------------------------------------------ */
/* Terme mit x, y und y′ lesen                                          */
/* ------------------------------------------------------------------ */

/** Ausgewerteter Term: f(x, y, v) mit v = y′. */
export type Fn3 = (x: number, y: number, v: number) => number;

export type TermResult = { ok: true; f: Fn3; uses: { x: boolean; y: boolean; v: boolean } } | { ok: false; pos: number; msg: 'empty' | 'token' | 'paren' | 'end' | 'func' };

type Tok = { t: 'num'; v: number; p: number } | { t: 'id'; v: string; p: number } | { t: 'op'; v: string; p: number };

const FUNCS: Record<string, (a: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
};

function tokenize(src: string): Tok[] | { pos: number } {
  const s = src.replace(/−/g, '-').replace(/[·×]/g, '*').replace(/√/g, 'sqrt').replace(/[’′]/g, "'");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (c === ' ' || c === '\t') {
      i++;
      continue;
    }
    const num = /^(\d+([.,]\d+)?|[.,]\d+)/.exec(s.slice(i));
    if (num) {
      out.push({ t: 'num', v: parseFloat(num[0].replace(',', '.')), p: i });
      i += num[0].length;
      continue;
    }
    const id = /^[a-zA-Zπ]+'?/.exec(s.slice(i));
    if (id) {
      // Bezeichner in bekannte Teile zerlegen: „xy“ → x·y, „2pi“ usw.
      let w = id[0];
      let p = i;
      while (w.length) {
        const m = /^(sqrt|sin|cos|tan|exp|ln|log|abs|pi|π|y'|v|x|y|t|e)/i.exec(w);
        if (!m) return { pos: p };
        out.push({ t: 'id', v: m[0].toLowerCase(), p });
        w = w.slice(m[0].length);
        p += m[0].length;
      }
      i += id[0].length;
      continue;
    }
    if ('+-*/^()'.includes(c)) {
      out.push({ t: 'op', v: c, p: i });
      i++;
      continue;
    }
    return { pos: i };
  }
  return out;
}

/**
 * Liest die rechte Seite einer DGL, z. B. „0,5·y“, „0,2·y·(10 − y)“,
 * „x − y“ oder (2. Ordnung) „−4y − 0,5y′“. Variablen: x (oder t), y,
 * y′ (oder v). Konstanten e, π. Funktionen sin, cos, tan, exp, ln, sqrt, abs.
 */
export function parseTerm(src: string): TermResult {
  const tz = tokenize(src);
  if (!Array.isArray(tz)) return { ok: false, pos: tz.pos, msg: 'token' };
  const toks: Tok[] = tz;
  if (!toks.length) return { ok: false, pos: 0, msg: 'empty' };
  let k = 0;
  const uses = { x: false, y: false, v: false };
  type R = Fn3;
  const peek = () => toks[k];
  const fail = (msg: 'token' | 'paren' | 'end' | 'func', pos?: number): never => {
    throw { msg, pos: pos ?? peek()?.p ?? src.length };
  };
  const startsFactor = (tk: Tok | undefined) => !!tk && (tk.t === 'num' || tk.t === 'id' || (tk.t === 'op' && tk.v === '('));

  function expr(): R {
    let a = term();
    while (peek()?.t === 'op' && (peek()!.v === '+' || peek()!.v === '-')) {
      const op = toks[k++]!.v;
      const b = term();
      const l = a;
      a = op === '+' ? (x, y, v) => l(x, y, v) + b(x, y, v) : (x, y, v) => l(x, y, v) - b(x, y, v);
    }
    return a;
  }
  function term(): R {
    let a = unary();
    while (true) {
      const tk = peek();
      if (tk?.t === 'op' && (tk.v === '*' || tk.v === '/')) {
        k++;
        const b = unary();
        const l = a;
        a = tk.v === '*' ? (x, y, v) => l(x, y, v) * b(x, y, v) : (x, y, v) => l(x, y, v) / b(x, y, v);
      } else if (startsFactor(tk)) {
        // Malpunkt darf fehlen: 2x, 0,5y(10 − y)
        const b = power();
        const l = a;
        a = (x, y, v) => l(x, y, v) * b(x, y, v);
      } else return a;
    }
  }
  function unary(): R {
    const tk = peek();
    if (tk?.t === 'op' && (tk.v === '-' || tk.v === '+')) {
      k++;
      const a = unary();
      return tk.v === '-' ? (x, y, v) => -a(x, y, v) : a;
    }
    return power();
  }
  function power(): R {
    const base = atom();
    if (peek()?.t === 'op' && peek()!.v === '^') {
      k++;
      const ex = unary();
      return (x, y, v) => Math.pow(base(x, y, v), ex(x, y, v));
    }
    return base;
  }
  function atom(): R {
    const tk = peek();
    if (!tk) return fail('end', src.length);
    if (tk.t === 'num') {
      k++;
      const c = tk.v;
      return () => c;
    }
    if (tk.t === 'op' && tk.v === '(') {
      k++;
      const a = expr();
      if (peek()?.t !== 'op' || peek()!.v !== ')') fail('paren');
      k++;
      return a;
    }
    if (tk.t === 'id') {
      k++;
      switch (tk.v) {
        case 'x':
        case 't':
          uses.x = true;
          return (x) => x;
        case 'y':
          uses.y = true;
          return (_x, y) => y;
        case "y'":
        case 'v':
          uses.v = true;
          return (_x, _y, v) => v;
        case 'e':
          return () => Math.E;
        case 'pi':
        case 'π':
          return () => Math.PI;
        default: {
          const fn = FUNCS[tk.v];
          if (!fn) return fail('token', tk.p);
          if (peek()?.t !== 'op' || peek()!.v !== '(') {
            // sin x ohne Klammer: nächster Faktor
            if (!startsFactor(peek())) fail('func', tk.p);
            const a = power();
            return (x, y, v) => fn(a(x, y, v));
          }
          k++;
          const a = expr();
          if (peek()?.t !== 'op' || peek()!.v !== ')') fail('paren');
          k++;
          return (x, y, v) => fn(a(x, y, v));
        }
      }
    }
    return fail('token', tk.p);
  }
  try {
    const f = expr();
    if (k < toks.length) fail(toks[k]!.v === ')' ? 'paren' : 'token', toks[k]!.p);
    return { ok: true, f, uses };
  } catch (e) {
    const er = e as { msg: 'token' | 'paren' | 'end' | 'func'; pos: number };
    if (er && typeof er.pos === 'number') return { ok: false, pos: er.pos, msg: er.msg };
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* Lösungsverfahren                                                     */
/* ------------------------------------------------------------------ */

export type Method = 'euler' | 'heun' | 'rk4';

/** System y⃗′ = F(x, y⃗) (1. Ordnung: y⃗ = (y), 2. Ordnung: y⃗ = (y, y′)). */
export type Sys = (x: number, s: readonly number[]) => number[];

export function system(f: Fn3, order: 1 | 2): Sys {
  return order === 1 ? (x, s) => [f(x, s[0]!, 0)] : (x, s) => [s[1]!, f(x, s[0]!, s[1]!)];
}

/** Ein Schritt des Verfahrens. */
export function step(F: Sys, method: Method, x: number, s: readonly number[], h: number): number[] {
  const add = (a: readonly number[], b: readonly number[], c: number) => a.map((v, i) => v + c * b[i]!);
  switch (method) {
    case 'euler': {
      const k1 = F(x, s);
      return add(s, k1, h);
    }
    case 'heun': {
      const k1 = F(x, s);
      const k2 = F(x + h, add(s, k1, h));
      return s.map((v, i) => v + (h / 2) * (k1[i]! + k2[i]!));
    }
    case 'rk4': {
      const k1 = F(x, s);
      const k2 = F(x + h / 2, add(s, k1, h / 2));
      const k3 = F(x + h / 2, add(s, k2, h / 2));
      const k4 = F(x + h, add(s, k3, h));
      return s.map((v, i) => v + (h / 6) * (k1[i]! + 2 * k2[i]! + 2 * k3[i]! + k4[i]!));
    }
  }
}

export interface Trajectory {
  /** x-Werte. */
  x: number[];
  /** Zustände (y bzw. y, y′). */
  s: number[][];
  /** Abbruch wegen Unendlich/NaN oder Verlassen des Bereichs. */
  stopped: boolean;
}

/**
 * Lösung von x0 bis x1 (auch rückwärts, wenn x1 < x0) mit Schrittweite h.
 * Bricht ab, wenn die Werte nicht endlich sind oder |y| > limit wird.
 */
export function solveIVP(F: Sys, method: Method, x0: number, s0: readonly number[], x1: number, h: number, limit = 1e6): Trajectory {
  const dir = x1 >= x0 ? 1 : -1;
  const hh = Math.abs(h) * dir;
  const xs = [x0];
  const ss = [[...s0]];
  let x = x0;
  let s = [...s0];
  const n = Math.min(100000, Math.ceil(Math.abs(x1 - x0) / Math.abs(h) - 1e-9));
  for (let i = 0; i < n; i++) {
    const hi = i === n - 1 ? x1 - x : hh;
    const next = step(F, method, x, s, hi);
    if (!next.every((v) => Number.isFinite(v) && Math.abs(v) <= limit)) return { x: xs, s: ss, stopped: true };
    x += hi;
    s = next;
    xs.push(x);
    ss.push(s);
  }
  return { x: xs, s: ss, stopped: false };
}

/** Feine Lösung (RK4, kleine Schritte) in beide Richtungen ab dem Startpunkt. */
export function fineCurve(F: Sys, x0: number, s0: readonly number[], xMin: number, xMax: number, h = 0.01, limit = 1e6): { x: number[]; s: number[][] } {
  const fw = solveIVP(F, 'rk4', x0, s0, xMax, h, limit);
  const bw = solveIVP(F, 'rk4', x0, s0, xMin, h, limit);
  return { x: [...bw.x.slice(1).reverse(), ...fw.x], s: [...bw.s.slice(1).reverse(), ...fw.s] };
}

/* ------------------------------------------------------------------ */
/* Exakte Lösungen der Schul-Modelle                                    */
/* ------------------------------------------------------------------ */

export type Model =
  | { kind: 'exp'; k: number } // y′ = k·y
  | { kind: 'bounded'; k: number; S: number } // y′ = k·(S − y)
  | { kind: 'logistic'; k: number; S: number } // y′ = k·y·(S − y)
  | { kind: 'linear'; a: number; b: number } // y′ = a·x + b (Stammfunktion)
  | { kind: 'oscillation'; omega: number; delta: number }; // y″ = −ω²y − 2δy′

/** Exakte Lösung y(x) mit y(x0) = y0 (bzw. y′(x0) = v0 bei Schwingung). */
export function exact(m: Model, x0: number, y0: number, v0 = 0): (x: number) => number {
  switch (m.kind) {
    case 'exp':
      return (x) => y0 * Math.exp(m.k * (x - x0));
    case 'bounded':
      return (x) => m.S - (m.S - y0) * Math.exp(-m.k * (x - x0));
    case 'logistic':
      if (y0 === 0) return () => 0;
      return (x) => (m.S * y0) / (y0 + (m.S - y0) * Math.exp(-m.k * m.S * (x - x0)));
    case 'linear':
      return (x) => y0 + (m.a / 2) * (x * x - x0 * x0) + m.b * (x - x0);
    case 'oscillation': {
      const { omega: w, delta: d } = m;
      const disc = d * d - w * w;
      if (Math.abs(disc) < 1e-12) {
        // aperiodischer Grenzfall
        const c1 = y0;
        const c2 = v0 + d * y0;
        return (x) => (c1 + c2 * (x - x0)) * Math.exp(-d * (x - x0));
      }
      if (disc < 0) {
        const wd = Math.sqrt(-disc);
        const A = y0;
        const B = (v0 + d * y0) / wd;
        return (x) => Math.exp(-d * (x - x0)) * (A * Math.cos(wd * (x - x0)) + B * Math.sin(wd * (x - x0)));
      }
      const r = Math.sqrt(disc);
      const l1 = -d + r;
      const l2 = -d - r;
      const c1 = (v0 - l2 * y0) / (l1 - l2);
      const c2 = y0 - c1;
      return (x) => c1 * Math.exp(l1 * (x - x0)) + c2 * Math.exp(l2 * (x - x0));
    }
  }
}

/** Formel der exakten Lösung als Text (deutsche Zahlen über `num`). */
export function exactText(m: Model, x0: number, y0: number, num: (v: number) => string, v0 = 0): string {
  const sh = x0 === 0 ? 'x' : `(x ${x0 > 0 ? '−' : '+'} ${num(Math.abs(x0))})`;
  switch (m.kind) {
    case 'exp':
      return `y = ${num(y0)} · e^(${num(m.k)}·${sh})`;
    case 'bounded':
      return m.S - y0 < 0 ? `y = ${num(m.S)} + ${num(y0 - m.S)} · e^(−${num(m.k)}·${sh})` : `y = ${num(m.S)} − ${num(m.S - y0)} · e^(−${num(m.k)}·${sh})`;
    case 'logistic':
      return `y = ${num(m.S * y0)} / (${num(y0)} + ${num(m.S - y0)} · e^(−${num(m.k * m.S)}·${sh}))`;
    case 'linear':
      return `y = ${num(m.a / 2)}x² + ${num(m.b)}x + ${num(y0 - (m.a / 2) * x0 * x0 - m.b * x0)}`;
    case 'oscillation': {
      const d = m.delta;
      const disc = d * d - m.omega * m.omega;
      if (disc < 0) {
        const wd = Math.sqrt(-disc);
        const B = (v0 + d * y0) / wd;
        const amp = Math.hypot(y0, B);
        const phi = Math.atan2(B, y0) + wd * x0;
        const arg = Math.abs(phi) < 1e-9 ? `${num(wd)}·x` : `${num(wd)}·x ${phi > 0 ? '−' : '+'} ${num(Math.abs(phi))}`;
        const damp = d === 0 ? '' : ` · e^(−${num(d)}·${sh})`;
        return `y = ${num(amp)}${damp} · cos(${arg})`;
      }
      return disc === 0 ? 'y = (c₁ + c₂x) · e^(−δx)' : 'y = c₁ · e^(λ₁x) + c₂ · e^(λ₂x)';
    }
  }
}

/** Erkennt ein Schul-Modell aus Stichproben der rechten Seite (nur von y bzw. y, y′ abhängig). */
export function detectModel(f: Fn3, order: 1 | 2, uses: { x: boolean; y: boolean; v: boolean }): Model | null {
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  if (order === 2) {
    if (uses.x) return null;
    // y″ = a·y + b·v ?
    const c = f(0, 0, 0);
    const a = f(0, 1, 0) - c;
    const b = f(0, 0, 1) - c;
    if (!near(c, 0)) return null;
    for (const [y, v] of [
      [2.3, -1.1],
      [-0.7, 3.2],
      [5, 4],
    ] as const)
      if (!near(f(0, y, v), a * y + b * v)) return null;
    if (a >= 0) return null;
    return { kind: 'oscillation', omega: Math.sqrt(-a), delta: -b / 2 };
  }
  if (uses.v) return null;
  if (!uses.y) {
    // y′ = a·x + b ?
    const b = f(0, 0, 0);
    const a = f(1, 0, 0) - b;
    for (const x of [-2.5, 0.7, 3.3]) if (!near(f(x, 0, 0), a * x + b)) return null;
    return { kind: 'linear', a, b };
  }
  if (uses.x) return null;
  // Polynom vom Grad ≤ 2 in y: f(y) = c0 + c1·y + c2·y²
  const c0 = f(0, 0, 0);
  const f1 = f(0, 1, 0);
  const fm = f(0, -1, 0);
  const c2 = (f1 + fm) / 2 - c0;
  const c1 = (f1 - fm) / 2;
  for (const y of [2.5, -3.1, 7.7]) if (!near(f(0, y, 0), c0 + c1 * y + c2 * y * y)) return null;
  if (near(c2, 0)) {
    if (near(c0, 0)) return near(c1, 0) ? null : { kind: 'exp', k: c1 };
    // y′ = c0 + c1·y = −c1·(−c0/c1 − y) → k = −c1, S = −c0/c1
    if (c1 < 0) return { kind: 'bounded', k: -c1, S: -c0 / c1 };
    return null;
  }
  // logistisch: y′ = c1·y + c2·y² = k·y·(S − y) mit k = −c2, S = c1/k
  if (near(c0, 0) && c2 < 0) return { kind: 'logistic', k: -c2, S: c1 / -c2 };
  return null;
}

/* ------------------------------------------------------------------ */
/* Feld und Isoklinen                                                   */
/* ------------------------------------------------------------------ */

/** Gitterpunkte des Richtungsfelds im Bereich. */
export function fieldGrid(xMin: number, xMax: number, yMin: number, yMax: number, nx: number, ny: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ny; j++) out.push([xMin + ((i + 0.5) * (xMax - xMin)) / nx, yMin + ((j + 0.5) * (yMax - yMin)) / ny]);
  return out;
}

/**
 * Euler-Tabelle: x_n, y_n, Steigung m_n = f(x_n, y_n), y_(n+1) = y_n + h·m_n.
 * Für die Anzeige der ersten Schritte.
 */
export function eulerTable(f: Fn3, x0: number, y0: number, h: number, n: number): { x: number; y: number; m: number; next: number }[] {
  const out: { x: number; y: number; m: number; next: number }[] = [];
  let x = x0;
  let y = y0;
  for (let i = 0; i < n; i++) {
    const m = f(x, y, 0);
    const next = y + h * m;
    out.push({ x, y, m, next });
    if (!Number.isFinite(next)) break;
    x += h;
    y = next;
  }
  return out;
}

/** Fehlerordnung grob schätzen: Fehler bei h und h/2 → p = log₂(e_h / e_(h/2)). */
export function errorOrder(F: Sys, method: Method, x0: number, s0: readonly number[], x1: number, h: number, exactY: number): number {
  const e1 = Math.abs(solveIVP(F, method, x0, s0, x1, h).s.at(-1)![0]! - exactY);
  const e2 = Math.abs(solveIVP(F, method, x0, s0, x1, h / 2).s.at(-1)![0]! - exactY);
  return Math.log2(e1 / e2);
}

/* ------------------------------------------------------------------ */
/* Rechenweg (Trennung der Variablen bzw. Exponentialansatz)            */
/* ------------------------------------------------------------------ */

export interface Derivation {
  /** Zeilen des Rechenwegs. */
  lines: string[];
  /** Kennwerte (Halbwertszeit, Wendestelle, Periode …). */
  facts: { label: string; value: string }[];
}

/**
 * Rechenweg für die Schul-Modelle. `num` formatiert Zahlen (deutsches Komma),
 * `lang` wählt die Sprache der Beschriftungen.
 */
export function derivation(m: Model, x0: number, y0: number, v0: number, num: (v: number) => string, lang: 'de' | 'en' = 'de'): Derivation {
  const de = lang === 'de';
  const k = 'k' in m ? m.k : 0;
  const facts: Derivation['facts'] = [];
  const lines: string[] = [];
  switch (m.kind) {
    case 'exp': {
      lines.push(`dy/dx = ${num(k)} · y`);
      lines.push(`${de ? 'trennen' : 'separate'}:  dy / y = ${num(k)} dx`);
      lines.push(`${de ? 'integrieren' : 'integrate'}:  ln|y| = ${num(k)}·x + c`);
      lines.push(`y = C · e^(${num(k)}·x)`);
      const C = y0 * Math.exp(-k * x0);
      lines.push(`y(${num(x0)}) = ${num(y0)}  ⇒  C = ${num(C)}`);
      const T = Math.log(2) / Math.abs(k);
      facts.push({ label: k > 0 ? (de ? 'Verdopplungszeit ln 2 / k' : 'doubling time ln 2 / k') : de ? 'Halbwertszeit ln 2 / |k|' : 'half-life ln 2 / |k|', value: num(T) });
      facts.push({ label: de ? 'Wachstumsfaktor je Einheit e^k' : 'growth factor per unit e^k', value: num(Math.exp(k)) });
      break;
    }
    case 'bounded': {
      const S = m.S;
      lines.push(`dy/dx = ${num(k)} · (${num(S)} − y)`);
      lines.push(`${de ? 'trennen' : 'separate'}:  dy / (${num(S)} − y) = ${num(k)} dx`);
      lines.push(`${de ? 'integrieren' : 'integrate'}:  −ln|${num(S)} − y| = ${num(k)}·x + c`);
      lines.push(`${num(S)} − y = C · e^(−${num(k)}·x)  ⇒  y = ${num(S)} − C · e^(−${num(k)}·x)`);
      const C = (S - y0) * Math.exp(k * x0);
      lines.push(`y(${num(x0)}) = ${num(y0)}  ⇒  C = ${num(C)}`);
      facts.push({ label: de ? 'Schranke S' : 'limit S', value: num(S) });
      facts.push({ label: de ? 'Abstand zu S halbiert nach ln 2 / k' : 'distance to S halves after ln 2 / k', value: num(Math.log(2) / k) });
      break;
    }
    case 'logistic': {
      const S = m.S;
      lines.push(`dy/dx = ${num(k)} · y · (${num(S)} − y)`);
      lines.push(`${de ? 'trennen' : 'separate'}:  dy / (y·(${num(S)} − y)) = ${num(k)} dx`);
      lines.push(`${de ? 'Partialbrüche' : 'partial fractions'}:  1/(y(S − y)) = (1/S) · (1/y + 1/(S − y))`);
      lines.push(`ln|y / (${num(S)} − y)| = ${num(k * S)}·x + c`);
      lines.push(`y = ${num(S)} / (1 + C · e^(−${num(k * S)}·x))`);
      const C = y0 > 0 ? ((S - y0) / y0) * Math.exp(k * S * x0) : NaN;
      if (Number.isFinite(C)) lines.push(`y(${num(x0)}) = ${num(y0)}  ⇒  C = ${num(C)}`);
      facts.push({ label: de ? 'Schranke S' : 'limit S', value: num(S) });
      if (y0 > 0 && y0 < S) {
        const xw = x0 + Math.log((S - y0) / y0) / (k * S);
        facts.push({ label: de ? 'Wendestelle (y = S/2)' : 'inflection point (y = S/2)', value: `x = ${num(xw)}` });
        facts.push({ label: de ? 'größte Steigung k·S²/4' : 'largest slope k·S²/4', value: num((k * S * S) / 4) });
      }
      break;
    }
    case 'linear': {
      lines.push(`dy/dx = ${num(m.a)}·x + ${num(m.b)}`);
      lines.push(`${de ? 'Stammfunktion' : 'antiderivative'}:  y = ${num(m.a / 2)}·x² + ${num(m.b)}·x + c`);
      const c = y0 - (m.a / 2) * x0 * x0 - m.b * x0;
      lines.push(`y(${num(x0)}) = ${num(y0)}  ⇒  c = ${num(c)}`);
      facts.push({ label: de ? 'Alle Lösungen sind verschobene Kopien' : 'all solutions are shifted copies', value: '' });
      break;
    }
    case 'oscillation': {
      const w = m.omega;
      const d = m.delta;
      lines.push(`y″ + ${num(2 * d)}·y′ + ${num(w * w)}·y = 0`);
      lines.push(`${de ? 'Ansatz' : 'ansatz'} y = e^(λx):  λ² + ${num(2 * d)}·λ + ${num(w * w)} = 0`);
      const disc = d * d - w * w;
      if (disc < -1e-12) {
        const wd = Math.sqrt(-disc);
        lines.push(`λ = ${num(-d)} ± ${num(wd)}·i`);
        lines.push(d === 0 ? `y = A·cos(${num(wd)}x) + B·sin(${num(wd)}x)` : `y = e^(−${num(d)}x) · (A·cos(${num(wd)}x) + B·sin(${num(wd)}x))`);
        const B = (v0 + d * y0) / wd;
        lines.push(`${de ? 'Startwerte' : 'start values'}  ⇒  A = ${num(y0)}, B = ${num(B)}`);
        facts.push({ label: de ? 'Periode 2π / ω' : 'period 2π / ω', value: num((2 * Math.PI) / wd) });
        if (d > 0) facts.push({ label: de ? 'Amplitude halbiert nach ln 2 / δ' : 'amplitude halves after ln 2 / δ', value: num(Math.log(2) / d) });
      } else if (Math.abs(disc) <= 1e-12) {
        lines.push(`λ = ${num(-d)} (${de ? 'doppelt' : 'double'})`);
        lines.push(`y = (A + B·x) · e^(−${num(d)}x)`);
        facts.push({ label: de ? 'aperiodischer Grenzfall' : 'critically damped', value: '' });
      } else {
        const r = Math.sqrt(disc);
        lines.push(`λ₁ = ${num(-d + r)},  λ₂ = ${num(-d - r)}`);
        lines.push(`y = A·e^(${num(-d + r)}x) + B·e^(${num(-d - r)}x)`);
        facts.push({ label: de ? 'Kriechfall: keine Schwingung' : 'overdamped: no oscillation', value: '' });
      }
      break;
    }
  }
  return { lines, facts };
}

/* ------------------------------------------------------------------ */
/* Systeme aus zwei (bzw. drei) Größen                                  */
/* ------------------------------------------------------------------ */

export type SysKind = 'lv' | 'sir' | 'fall';

export interface SysParams {
  /** Räuber-Beute: Vermehrung der Beute a, Sterberate der Räuber c (b = d fest) */
  a: number;
  c: number;
  b: number;
  d: number;
  /** Epidemie: Basisreproduktionszahl R₀, Genesungsrate γ (pro Tag), Bevölkerung N */
  R0: number;
  gamma: number;
  N: number;
  /** Fall: Fallbeschleunigung g, Reibungsfaktor k (pro m) */
  g: number;
  k: number;
}

/**
 * Rechte Seiten:
 * Räuber-Beute (Lotka-Volterra): x′ = a·x − b·x·y, y′ = −c·y + d·x·y.
 * Epidemie (SIR): S′ = −β·S·I/N, I′ = β·S·I/N − γ·I, R′ = γ·I mit β = R₀·γ.
 * Fall mit Luftwiderstand: v′ = g − k·v² (Zustand [s, v]).
 */
export function sysRhs(kind: SysKind, p: SysParams): Sys {
  switch (kind) {
    case 'lv':
      return (_t, [x, y]) => [p.a * x! - p.b * x! * y!, -p.c * y! + p.d * x! * y!];
    case 'sir': {
      const beta = p.R0 * p.gamma;
      return (_t, [S, I]) => {
        const inf = (beta * S! * I!) / p.N;
        return [-inf, inf - p.gamma * I!, p.gamma * I!];
      };
    }
    case 'fall':
      return (_t, [, v]) => [v!, p.g - p.k * v! * Math.abs(v!)];
  }
}

/** Lösung mit RK4 von t = 0 bis t1 (Zeitpunkte und Zustände). */
export function solveSys(F: Sys, s0: readonly number[], t1: number, h: number): { t: number[]; s: number[][] } {
  const t = [0];
  const s = [[...s0]];
  let cur = [...s0];
  let x = 0;
  const n = Math.ceil(t1 / h);
  for (let i = 0; i < n; i++) {
    cur = step(F, 'rk4', x, cur, h);
    x += h;
    t.push(x);
    s.push(cur);
  }
  return { t, s };
}

/** Räuber-Beute: Gleichgewicht (c/d | a/b) und Erhaltungsgröße V = d·x − c·ln x + b·y − a·ln y. */
export const lvEquilibrium = (p: SysParams): [number, number] => [p.c / p.d, p.a / p.b];
export const lvInvariant = (p: SysParams, x: number, y: number) => p.d * x - p.c * Math.log(x) + p.b * y - p.a * Math.log(y);

/** Epidemie: Herdenimmunität 1 − 1/R₀ (Anteil, ab dem I abnimmt). */
export const herdImmunity = (R0: number) => Math.max(0, 1 - 1 / R0);

/** Fall: Endgeschwindigkeit √(g/k) und exakte Lösung aus der Ruhe v(t) = v_E·tanh(g·t/v_E). */
export const terminalSpeed = (g: number, k: number) => Math.sqrt(g / k);
export const fallSpeed = (g: number, k: number, t: number) => {
  const vt = terminalSpeed(g, k);
  return vt * Math.tanh((g * t) / vt);
};

/* ------------------------------------------------------------------ */
/* Rätsel: Welches Feld gehört zur Gleichung?                           */
/* ------------------------------------------------------------------ */

/** Auswahl an Gleichungen y′ = f(x, y) mit gut unterscheidbaren Feldern. */
export const QUIZ_EQS: readonly string[] = ['y', '-y', 'x', '-x', 'x - y', 'x + y', 'y·(2 - y)', '2 - y', 'x·y', 'sin(x)', 'y - x^2', '-x/y'];

/** Runde Nummer n: vier verschiedene Gleichungen und die gesuchte (Index 0 … 3). */
export function quizRound(n: number): { eqs: string[]; target: number } {
  let s = (Math.floor(n) * 2654435761 + 777) >>> 0 || 1;
  const r = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  const pool = [...QUIZ_EQS];
  const eqs: string[] = [];
  while (eqs.length < 4) eqs.push(pool.splice(Math.floor(r() * pool.length) % pool.length, 1)[0]!);
  return { eqs, target: Math.floor(r() * 4) % 4 };
}
