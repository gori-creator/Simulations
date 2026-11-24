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

// ───────────────────────── Kopfrechnen ─────────────────────────

/** n² über die nächste Zehnerzahl r: n = r + d, n² = r² + 2rd + d² (d darf negativ sein). */
export function mentalSquare(n: number): { r: number; d: number; r2: number; twoRD: number; d2: number; result: number } {
  const r = Math.round(n / 10) * 10;
  const d = n - r;
  return { r, d, r2: r * r, twoRD: 2 * r * d, d2: d * d, result: n * n };
}

/** (r + d)(r − d) = r² − d², z. B. 52 · 48 = 2500 − 4. */
export function mentalProduct(r: number, d: number): { x: number; y: number; r2: number; d2: number; result: number } {
  return { x: r + d, y: r - d, r2: r * r, d2: d * d, result: (r + d) * (r - d) };
}

// ───────────────────────── Quadratische Ergänzung ─────────────────────────

/** x² + px + q = (x + p/2)² − (p/2)² + q; Scheitel S(−p/2 | q − (p/2)²). */
export function completeSquare(p: number, q: number): { h: number; h2: number; sx: number; sy: number } {
  const h = p / 2;
  return { h, h2: h * h, sx: -h, sy: q - h * h };
}

// ───────────────────────── Üben: Welcher Term passt? ─────────────────────────

const SUP2 = '²';
const MINUS = '−';

/** Zahl als Text mit echtem Minus (ganze Zahlen). */
function num(v: number): string {
  return v < 0 ? `${MINUS}${-v}` : String(v);
}

/** Koeffizient vor x bzw. x²: 1 → '', −1 → '−'. */
function coefText(c: number, variable: string): string {
  if (c === 1) return variable;
  if (c === -1) return `${MINUS}${variable}`;
  return `${num(c)}${variable}`;
}

/** Polynom a·x² + b·x + c als Text, z. B. „4x² − 12x + 9“. */
export function polyText(a: number, b: number, c: number): string {
  const parts: string[] = [];
  const push = (value: number, body: string) => {
    if (value === 0) return;
    const abs = Math.abs(value);
    const text = body ? (abs === 1 ? body : `${abs}${body}`) : String(abs);
    if (parts.length === 0) parts.push(value < 0 ? `${MINUS}${text}` : text);
    else parts.push(value < 0 ? ` ${MINUS} ${text}` : ` + ${text}`);
  };
  push(a, `x${SUP2}`);
  push(b, 'x');
  push(c, '');
  return parts.join('') || '0';
}

/** „(kx + m)“ bzw. „(kx − m)“. */
export function linText(k: number, m: number): string {
  return `(${coefText(k, 'x')} ${m < 0 ? MINUS : '+'} ${Math.abs(m)})`;
}

export type Mistake = 'middle' | 'double' | 'square' | 'sign' | 'formula';

export interface QuizOption {
  text: string;
  ok: boolean;
  /** typischer Fehler, der zu dieser falschen Antwort führt */
  mistake?: Mistake;
}

export interface TermQuiz {
  /** ausmultiplizieren (expand) oder faktorisieren (factor) */
  kind: 'expand' | 'factor';
  formula: Formula;
  question: string;
  options: QuizOption[];
}

/** Reproduzierbare Aufgabe Nr. q mit vier Antworten (eine richtig, drei typische Fehler). */
export function termQuiz(q: number, rand: () => number): TermQuiz {
  const formula = (['1', '2', '3'] as const)[Math.floor(rand() * 3)]!;
  const k = [1, 1, 2, 3][Math.floor(rand() * 4)]!;
  let m = 2 + Math.floor(rand() * 5); // ab 2, damit sich alle Antworten unterscheiden (1² = 1)
  if (k > 1 && m % k === 0) m += 1; // gemeinsame Teiler vermeiden
  const kind: 'expand' | 'factor' = q % 2 === 1 ? 'expand' : 'factor';
  const k2 = k * k;
  const m2 = m * m;
  let question: string;
  let options: QuizOption[];
  if (kind === 'expand') {
    if (formula === '1') {
      question = `${linText(k, m)}${SUP2}`;
      options = [
        { text: polyText(k2, 2 * k * m, m2), ok: true },
        { text: polyText(k2, 0, m2), ok: false, mistake: 'middle' },
        { text: polyText(k2, k * m, m2), ok: false, mistake: 'double' },
        { text: k === 1 ? polyText(1, 2 * m, m) : polyText(k, 2 * k * m, m2), ok: false, mistake: 'square' },
      ];
    } else if (formula === '2') {
      question = `${linText(k, -m)}${SUP2}`;
      options = [
        { text: polyText(k2, -2 * k * m, m2), ok: true },
        { text: polyText(k2, 0, -m2), ok: false, mistake: 'middle' },
        { text: polyText(k2, -2 * k * m, -m2), ok: false, mistake: 'sign' },
        { text: polyText(k2, -k * m, m2), ok: false, mistake: 'double' },
      ];
    } else {
      question = `${linText(k, m)}${linText(k, -m)}`;
      options = [
        { text: polyText(k2, 0, -m2), ok: true },
        { text: polyText(k2, 0, m2), ok: false, mistake: 'sign' },
        { text: polyText(k2, -2 * k * m, -m2), ok: false, mistake: 'formula' },
        { text: k === 1 ? polyText(1, 0, -m) : polyText(k, 0, -m2), ok: false, mistake: 'square' },
      ];
    }
  } else {
    if (formula === '1') {
      question = polyText(k2, 2 * k * m, m2);
      options = [
        { text: `${linText(k, m)}${SUP2}`, ok: true },
        { text: `${linText(k, -m)}${SUP2}`, ok: false, mistake: 'sign' },
        { text: `${linText(k, m)}${linText(k, -m)}`, ok: false, mistake: 'formula' },
        { text: `${linText(k, 2 * m)}${SUP2}`, ok: false, mistake: 'double' },
      ];
    } else if (formula === '2') {
      question = polyText(k2, -2 * k * m, m2);
      options = [
        { text: `${linText(k, -m)}${SUP2}`, ok: true },
        { text: `${linText(k, m)}${SUP2}`, ok: false, mistake: 'sign' },
        { text: `${linText(k, m)}${linText(k, -m)}`, ok: false, mistake: 'formula' },
        { text: `${linText(k, -2 * m)}${SUP2}`, ok: false, mistake: 'double' },
      ];
    } else {
      question = polyText(k2, 0, -m2);
      options = [
        { text: `${linText(k, m)}${linText(k, -m)}`, ok: true },
        { text: `${linText(k, -m)}${SUP2}`, ok: false, mistake: 'formula' },
        { text: `${linText(k, m)}${SUP2}`, ok: false, mistake: 'sign' },
        { text: `${linText(k2, m2)}${linText(k2, -m2)}`, ok: false, mistake: 'square' },
      ];
    }
  }
  // mischen (Fisher-Yates)
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  return { kind, formula, question, options };
}
