/**
 * Rechenlogik der Ableitungs-Werkstatt. Der Term-Baum, das Lesen, Ableiten
 * und Vereinfachen liegen im Kern (`sim-core/expr`), weil auch die
 * Integrationsregeln sie brauchen.
 */
export * from '../../../sim-core/expr';

import { derive, derivative, evaluate, mainStep, parse, type Expr, type RuleId } from '../../../sim-core/expr';

/* ------------------------------------------------------------------ */
/* Übung: Welche Regel zuerst?                                          */
/* ------------------------------------------------------------------ */

/** Antwortmöglichkeiten der Übung (Grundableitungen zusammengefasst). */
export type RuleChoice = 'sum' | 'factor' | 'power' | 'product' | 'quotient' | 'chain' | 'basic';

export function ruleChoice(rule: RuleId): RuleChoice {
  if (rule === 'sum' || rule === 'factor' || rule === 'power' || rule === 'product' || rule === 'quotient' || rule === 'chain') return rule;
  return 'basic';
}

/** Terme der Übung; die richtige Antwort ergibt sich aus dem ersten (äußersten) Ableitungsschritt. */
export const RULE_TERMS: readonly string[] = [
  'x^7',
  '5x^3',
  'x^4 + 3x^2',
  'sin(x) + cos(x)',
  'x^2·sin(x)',
  'x·e^x',
  'x^3·ln(x)',
  '(x+1)/(x^2+1)',
  'sin(x)/x',
  'e^x/(x+2)',
  'sin(3x)',
  '(2x+1)^5',
  'e^(x^2)',
  'ln(x^2+1)',
  'sqrt(4x+1)',
  'cos(x^2)',
  '4·sin(x)',
  '3·e^(2x)',
  'x^2·e^(-x)',
  'cos(x)',
  'e^x',
  'ln(x)',
  '(x^2−1)^3',
  'x/(1+x^2)',
];

/** Zufall mit festem Startwert. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/** Term und richtige Antwort für Runde n. */
export function ruleQuiz(n: number): { term: string; answer: RuleChoice; rule: RuleId } {
  const r = rng(7919 + n * 104729);
  const term = RULE_TERMS[Math.floor(r() * RULE_TERMS.length)]!;
  const res = parse(term);
  if (!res.ok) throw new Error(`Übungsterm nicht lesbar: ${term}`);
  const top = mainStep(derive(res.e).steps);
  const rule: RuleId = top ? top.rule : 'const';
  return { term, answer: ruleChoice(rule), rule };
}

/* ------------------------------------------------------------------ */
/* Paare finden: f und der Graph von f′                                 */
/* ------------------------------------------------------------------ */

export const MATCH_FUNCS: readonly string[] = [
  'x^2',
  'x^3 − 3x',
  '−x^2 + 2x',
  'sin(x)',
  'cos(x)',
  'e^x',
  'x^3',
  '0,5x^2 − 2',
  'x^4 − 4x^2',
  '2x + 1',
  'e^(−x)',
  'x·e^(−x)',
];

/**
 * Runde n: Funktion f und vier Kandidaten für f′ (Terme). Einer ist f′,
 * die anderen sind typische Verwechslungen: f selbst, −f′ und die
 * Ableitung einer anderen Funktion.
 */
export function matchRound(n: number): { f: string; candidates: Expr[]; target: number } {
  const r = rng(31337 + n * 7919);
  const i = Math.floor(r() * MATCH_FUNCS.length);
  const fSrc = MATCH_FUNCS[i]!;
  const fe = expr(fSrc);
  const d = derivative(fe);
  let j = Math.floor(r() * MATCH_FUNCS.length);
  if (j === i) j = (j + 1) % MATCH_FUNCS.length;
  const other = derivative(expr(MATCH_FUNCS[j]!));
  const negD: Expr = { k: 'neg', a: d };
  const options: Expr[] = [d, fe, negD, other];
  // gleiche Kandidaten vermeiden (z. B. f = eˣ: f′ = f)
  const distinct: Expr[] = [];
  for (const o of options) if (!distinct.some((q) => sameValues(q, o))) distinct.push(o);
  let extra = 0;
  while (distinct.length < 4) {
    const cand = derivative(expr(MATCH_FUNCS[(j + 1 + extra++) % MATCH_FUNCS.length]!));
    if (!distinct.some((q) => sameValues(q, cand))) distinct.push(cand);
  }
  // mischen, Ziel merken
  const order = [0, 1, 2, 3];
  for (let k = 3; k > 0; k--) {
    const m = Math.floor(r() * (k + 1));
    [order[k], order[m]] = [order[m]!, order[k]!];
  }
  const candidates = order.map((o) => distinct[o]!);
  return { f: fSrc, candidates, target: order.indexOf(0) };
}

function expr(src: string): Expr {
  const res = parse(src);
  if (!res.ok) throw new Error(`Term nicht lesbar: ${src}`);
  return res.e;
}

/** Stimmen zwei Terme an vielen Stellen überein? */
export function sameValues(a: Expr, b: Expr): boolean {
  for (let k = 0; k <= 20; k++) {
    const x = -3.7 + k * 0.37;
    const va = evaluate(a, x);
    const vb = evaluate(b, x);
    if (Number.isFinite(va) !== Number.isFinite(vb)) return false;
    if (Number.isFinite(va) && Math.abs(va - vb) > 1e-6 * (1 + Math.abs(va))) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Graph von f′: Extremstellen und Wendestellen                         */
/* ------------------------------------------------------------------ */

export interface Special {
  x: number;
  kind: 'max' | 'min' | 'saddle';
}

/**
 * Nullstellen von f′ im Intervall (Vorzeichenwechsel, Bisektion) und ihre Art:
 * f′ wechselt von + nach − → Hochpunkt, von − nach + → Tiefpunkt.
 * Berührt f′ die Achse ohne Wechsel → Sattelpunkt.
 */
export function stationaryPoints(d: Expr, a: number, b: number, n = 800): Special[] {
  const out: Special[] = [];
  const f = (x: number) => evaluate(d, x);
  let x0 = a;
  let y0 = f(a);
  for (let k = 1; k <= n; k++) {
    const x1 = a + ((b - a) * k) / n;
    const y1 = f(x1);
    if (Number.isFinite(y0) && Number.isFinite(y1)) {
      if (y0 === 0 || y0 * y1 < 0) {
        let lo = x0;
        let hi = x1;
        for (let i = 0; i < 60 && y0 !== 0; i++) {
          const mid = (lo + hi) / 2;
          if (f(lo) * f(mid) <= 0) hi = mid;
          else lo = mid;
        }
        const x = y0 === 0 ? x0 : (lo + hi) / 2;
        const left = f(x - 1e-3);
        const right = f(x + 1e-3);
        const kind: Special['kind'] = left > 0 && right < 0 ? 'max' : left < 0 && right > 0 ? 'min' : 'saddle';
        if (!out.some((s) => Math.abs(s.x - x) < 1e-4)) out.push({ x, kind });
      } else if (Math.abs(y1) < 1e-9 && Math.abs(y0) > 1e-9) {
        // Berührung ohne Vorzeichenwechsel (z. B. x³ bei 0): wird beim nächsten Schritt mit y0 === 0 erfasst
      }
    }
    x0 = x1;
    y0 = y1;
  }
  return out;
}
