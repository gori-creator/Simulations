import { MINUS, type Formatter } from './format';

/**
 * Kleine Bausteine, um Funktionsterme als HTML zu schreiben, z. B.
 * `f(x) = 0,5x − 2` oder `f(x) = 2 · sin(3(x − π/4)) + 1`.
 *
 * Die Ausgabe ist HTML (mit <var> und <sup>) und nur für Werte gedacht, die
 * aus dem eigenen Simulationscode stammen.
 */

export const x = '<var>x</var>';

export function v(name: string): string {
  return `<var>${name}</var>`;
}

export function sup(text: string | number): string {
  return `<sup>${text}</sup>`;
}

export interface Term {
  /** Koeffizient (0 → Summand entfällt). */
  coef: number;
  /** Rest des Summanden als HTML; leer für eine Konstante. */
  body: string;
  /** Malpunkt zwischen Koeffizient und Rest, z. B. "2 · sin(x)". */
  dot?: boolean;
  /** Eigene Darstellung des Koeffizientenbetrags (z. B. "π/4"). */
  coefText?: string;
}

function isOne(value: number): boolean {
  return Math.abs(Math.abs(value) - 1) < 1e-12;
}

/**
 * Summe von Termen mit korrekten Vorzeichen: Koeffizient 1 wird weggelassen,
 * Nullen entfallen, negative Koeffizienten werden zu " − ".
 */
export function sum(terms: Term[], fmt: Formatter, decimals = 2): string {
  const parts: string[] = [];
  for (const term of terms) {
    const rounded = Number(term.coef.toFixed(decimals));
    if (rounded === 0) continue;
    const negative = rounded < 0;
    const magnitude = term.coefText ?? fmt.num(Math.abs(rounded), decimals);
    let body: string;
    if (!term.body) body = magnitude;
    else if (isOne(rounded) && !term.coefText) body = term.body;
    else body = term.dot ? `${magnitude} · ${term.body}` : `${magnitude}${term.body}`;
    if (parts.length === 0) parts.push(negative ? `${MINUS}${body}` : body);
    else parts.push(negative ? ` ${MINUS} ${body}` : ` + ${body}`);
  }
  return parts.length ? parts.join('') : '0';
}

/** Polynom aus Koeffizienten (höchste Potenz zuerst), z. B. [1, -2, 3] → "x² − 2x + 3". */
export function polynomial(coefs: number[], fmt: Formatter, variable = x, decimals = 2): string {
  const degree = coefs.length - 1;
  return sum(
    coefs.map((coef, i) => {
      const power = degree - i;
      const body = power === 0 ? '' : power === 1 ? variable : `${variable}${sup(power)}`;
      return { coef, body };
    }),
    fmt,
    decimals,
  );
}

/** "x − 2", "x + 2" oder "x" – optional mit eigener Darstellung des Betrags. */
export function shifted(shift: number, fmt: Formatter, variable = x, shiftText?: string, decimals = 2): string {
  return sum([{ coef: 1, body: variable }, { coef: -shift, body: '', coefText: shiftText }], fmt, decimals);
}

/** Klammert einen Ausdruck, wenn er ein Plus oder Minus enthält. */
export function paren(expr: string): string {
  return / [+−] /.test(expr) ? `(${expr})` : expr;
}

/** "f(x) = …" */
export function fnDef(name: string, rhs: string, variable = x): string {
  return `${v(name)}(${variable}) = ${rhs}`;
}
