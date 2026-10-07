/**
 * Rechenlogik „Binomische Formeln am Quadrat“: die Teilflächen der drei
 * binomischen Formeln als Rechtecke (x, y = linke untere Ecke).
 */
export type Formula = '1' | '2' | '3';

export interface Piece {
  key: 'a2' | 'ab' | 'b2' | 'rest';
  x: number;
  y: number;
  w: number;
  h: number;
}

/** (a + b)² = a² + 2ab + b² */
export function piecesFirst(a: number, b: number): Piece[] {
  return [
    { key: 'a2', x: 0, y: 0, w: a, h: a },
    { key: 'ab', x: a, y: 0, w: b, h: a },
    { key: 'ab', x: 0, y: a, w: a, h: b },
    { key: 'b2', x: a, y: a, w: b, h: b },
  ];
}

export function expand(formula: Formula, a: number, b: number): { left: number; terms: number[]; right: number } {
  switch (formula) {
    case '1':
      return { left: (a + b) ** 2, terms: [a * a, 2 * a * b, b * b], right: a * a + 2 * a * b + b * b };
    case '2':
      return { left: (a - b) ** 2, terms: [a * a, -2 * a * b, b * b], right: a * a - 2 * a * b + b * b };
    case '3':
      return { left: (a + b) * (a - b), terms: [a * a, -b * b], right: a * a - b * b };
  }
}
