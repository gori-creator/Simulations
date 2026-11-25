/**
 * Aussagenlogik: Verknüpfungen zweier Aussagen, Wahrheitstafeln und
 * Vergleich zweier Formeln (Äquivalenz, Tautologie, Kontradiktion).
 */

export type Op = 'and' | 'or' | 'not' | 'impl' | 'equiv' | 'xor' | 'nand' | 'nor';
export const OPS: Op[] = ['and', 'or', 'not', 'impl', 'equiv', 'xor', 'nand', 'nor'];

export const SYMBOL: Record<Op, string> = { and: 'A ∧ B', or: 'A ∨ B', not: '¬A', impl: 'A → B', equiv: 'A ↔ B', xor: 'A ⊕ B', nand: '¬(A ∧ B)', nor: '¬(A ∨ B)' };

export function apply(op: Op, a: boolean, b: boolean): boolean {
  switch (op) {
    case 'and':
      return a && b;
    case 'or':
      return a || b;
    case 'not':
      return !a;
    case 'impl':
      return !a || b;
    case 'equiv':
      return a === b;
    case 'xor':
      return a !== b;
    case 'nand':
      return !(a && b);
    case 'nor':
      return !(a || b);
  }
}

export type Formula = (v: { A: boolean; B: boolean; C: boolean }) => boolean;

export interface Pair {
  id: string;
  left: string;
  right: string;
  vars: 2 | 3;
  f: Formula;
  g: Formula;
}

export const PAIRS: Pair[] = [
  { id: 'demorgan1', left: '¬(A ∧ B)', right: '¬A ∨ ¬B', vars: 2, f: ({ A, B }) => !(A && B), g: ({ A, B }) => !A || !B },
  { id: 'demorgan2', left: '¬(A ∨ B)', right: '¬A ∧ ¬B', vars: 2, f: ({ A, B }) => !(A || B), g: ({ A, B }) => !A && !B },
  { id: 'impl', left: 'A → B', right: '¬A ∨ B', vars: 2, f: ({ A, B }) => !A || B, g: ({ A, B }) => !A || B },
  { id: 'kontra', left: 'A → B', right: '¬B → ¬A', vars: 2, f: ({ A, B }) => !A || B, g: ({ A, B }) => B || !A },
  { id: 'umkehr', left: 'A → B', right: 'B → A', vars: 2, f: ({ A, B }) => !A || B, g: ({ A, B }) => !B || A },
  { id: 'distr', left: 'A ∧ (B ∨ C)', right: '(A ∧ B) ∨ (A ∧ C)', vars: 3, f: ({ A, B, C }) => A && (B || C), g: ({ A, B, C }) => (A && B) || (A && C) },
  { id: 'nand', left: '¬(A ∧ A)', right: '¬A', vars: 2, f: ({ A }) => !(A && A), g: ({ A }) => !A },
  { id: 'taut', left: 'A ∨ ¬A', right: 'A ∧ ¬A', vars: 2, f: ({ A }) => A || !A, g: ({ A }) => A && !A },
];

export interface Row {
  A: boolean;
  B: boolean;
  C: boolean;
}

/** Belegungen in der üblichen Reihenfolge (w … f). */
export function rows(vars: 2 | 3): Row[] {
  const out: Row[] = [];
  const n = 1 << vars;
  for (let i = 0; i < n; i++) {
    const bit = (k: number) => ((i >> (vars - 1 - k)) & 1) === 0;
    out.push({ A: bit(0), B: bit(1), C: vars === 3 ? bit(2) : false });
  }
  return out;
}

export type Kind = 'tautologie' | 'kontradiktion' | 'erfuellbar';

export function classify(f: Formula, vars: 2 | 3): Kind {
  const vals = rows(vars).map(f);
  if (vals.every(Boolean)) return 'tautologie';
  if (vals.every((v) => !v)) return 'kontradiktion';
  return 'erfuellbar';
}

export function equivalent(p: Pair): boolean {
  return rows(p.vars).every((r) => p.f(r) === p.g(r));
}
