/**
 * Waagemodell für lineare Gleichungen der Form a·x + b = c·x + d.
 *
 * Links liegen a Päckchen (jedes wiegt x) und b Gewichtsstücke (je 1),
 * rechts c Päckchen und d Gewichtsstücke. Äquivalenzumformungen sind
 * Handlungen, die das Gleichgewicht erhalten: auf beiden Seiten dasselbe
 * wegnehmen oder beide Seiten in gleich viele gleiche Teile teilen.
 */

/** Inhalt einer Waagschale: Anzahl der x-Päckchen und der Gewichtsstücke. */
export interface Side {
  x: number;
  c: number;
}

export interface Pans {
  left: Side;
  right: Side;
}

export function pans(a: number, b: number, c: number, d: number): Pans {
  return { left: { x: a, c: b }, right: { x: c, c: d } };
}

export function samePans(p: Pans, q: Pans): boolean {
  return p.left.x === q.left.x && p.left.c === q.left.c && p.right.x === q.right.x && p.right.c === q.right.c;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Gekürzter Bruch (Nenner positiv). */
export interface Frac {
  num: number;
  den: number;
}

export function frac(num: number, den: number): Frac {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den) || 1;
  return { num: num / g, den: den / g };
}

export const fracValue = (f: Frac) => f.num / f.den;

/** Lösungsmenge der Gleichung a·x + b = c·x + d. */
export type Solution = { kind: 'unique'; x: Frac } | { kind: 'none' } | { kind: 'all' };

export function solve(p: Pans): Solution {
  const k = p.left.x - p.right.x;
  const r = p.right.c - p.left.c;
  if (k === 0) return r === 0 ? { kind: 'all' } : { kind: 'none' };
  return { kind: 'unique', x: frac(r, k) };
}

/**
 * Passt die Gleichung ins Waagemodell? Päckchen müssen ein positives Gewicht
 * haben – bei x ≤ 0 kann keine Waage das Gleichgewicht zeigen.
 */
export type ModelFit = 'ok' | 'negative' | 'zero' | 'none' | 'all';

export function modelFit(p: Pans): ModelFit {
  const s = solve(p);
  if (s.kind !== 'unique') return s.kind;
  if (s.x.num === 0) return 'zero';
  return s.x.num < 0 ? 'negative' : 'ok';
}

/** Gewicht einer Waagschale bei Päckchengewicht w. */
export function weight(s: Side, w: number): number {
  return s.x * w + s.c;
}

/**
 * Das „wahre“ Päckchengewicht, mit dem die Waage gezeichnet wird: die Lösung,
 * wenn sie positiv ist, sonst 1 (dann zeigt die Waage für jedes positive
 * Gewicht dieselbe Richtung).
 */
export function packageWeight(start: Pans): number {
  const s = solve(start);
  return s.kind === 'unique' && s.x.num > 0 ? fracValue(s.x) : 1;
}

/** Zielwinkel des Waagebalkens in Grad (positiv: links unten), weich begrenzt. */
export function tiltTarget(p: Pans, w: number, maxDeg = 13): number {
  const diff = weight(p.left, w) - weight(p.right, w);
  if (Math.abs(diff) < 1e-9) return 0;
  return maxDeg * Math.tanh(diff / 2.2);
}

/* ------------------------------------------------------------------ */
/* Umformungen                                                         */
/* ------------------------------------------------------------------ */

/** Auf beiden Seiten wegnehmen: k Päckchen und m Gewichtsstücke. */
export interface SubOp {
  kind: 'sub';
  x: number;
  c: number;
}
export interface DivOp {
  kind: 'div';
  n: number;
}
export type Op = SubOp | DivOp;

export function canSubtract(p: Pans, x: number, c: number): boolean {
  return p.left.x >= x && p.right.x >= x && p.left.c >= c && p.right.c >= c;
}

export function subtract(p: Pans, x: number, c: number): Pans {
  return { left: { x: p.left.x - x, c: p.left.c - c }, right: { x: p.right.x - x, c: p.right.c - c } };
}

export function canDivide(p: Pans, n: number): boolean {
  return n > 1 && [p.left.x, p.left.c, p.right.x, p.right.c].every((v) => v % n === 0) && p.left.x + p.left.c + p.right.x + p.right.c > 0;
}

export function divide(p: Pans, n: number): Pans {
  return { left: { x: p.left.x / n, c: p.left.c / n }, right: { x: p.right.x / n, c: p.right.c / n } };
}

/**
 * Sinnvoller Teiler für „beide Seiten teilen“: Steht auf einer Seite nur
 * k·x und auf der anderen nur eine Zahl, ist es k; sonst der größte
 * gemeinsame Teiler aller Anzahlen. `null`, wenn sich nichts teilen lässt.
 */
export function suggestedDivisor(p: Pans): number | null {
  const counts = [p.left.x, p.left.c, p.right.x, p.right.c];
  const g = counts.reduce((acc, v) => gcd(acc, v), 0);
  const isolated = (s: Side, o: Side) => s.x > 1 && s.c === 0 && o.x === 0;
  if (isolated(p.left, p.right) && canDivide(p, p.left.x)) return p.left.x;
  if (isolated(p.right, p.left) && canDivide(p, p.right.x)) return p.right.x;
  return g > 1 ? g : null;
}

/** Ist die Gleichung gelöst (x = Zahl oder Zahl = x)? */
export function isSolved(p: Pans): boolean {
  const one = (s: Side, o: Side) => s.x === 1 && s.c === 0 && o.x === 0;
  return one(p.left, p.right) || one(p.right, p.left);
}

/** Bleiben nur Zahlen übrig (x ist herausgefallen)? Dann ist die Gleichung wahr oder falsch. */
export function noVariableLeft(p: Pans): boolean {
  return p.left.x === 0 && p.right.x === 0;
}

/**
 * Vergleicht den Zustand nach einseitigen Änderungen mit dem letzten
 * Gleichgewicht: Wurde auf beiden Seiten genau dasselbe weggenommen, ist es
 * eine Äquivalenzumformung.
 */
export function stepBetween(before: Pans, after: Pans): SubOp | null {
  const lx = before.left.x - after.left.x;
  const lc = before.left.c - after.left.c;
  const rx = before.right.x - after.right.x;
  const rc = before.right.c - after.right.c;
  if (lx !== rx || lc !== rc || lx < 0 || lc < 0 || lx + lc === 0) return null;
  return { kind: 'sub', x: lx, c: lc };
}

/** Lassen sich zwei aufeinanderfolgende Umformungen zusammenfassen (− 1 und − 1 zu − 2)? */
export function mergeable(a: Op, b: Op): boolean {
  if (a.kind !== 'sub' || b.kind !== 'sub') return false;
  return (a.x === 0 && b.x === 0) || (a.c === 0 && b.c === 0);
}

/* ------------------------------------------------------------------ */
/* Texte                                                               */
/* ------------------------------------------------------------------ */

const MINUS = '−';

/** Eine Seite als Term: „3x + 2“, „x“, „8“, „0“. */
export function sideText(s: Side): string {
  const parts: string[] = [];
  if (s.x > 0) parts.push(s.x === 1 ? 'x' : `${s.x}x`);
  if (s.c > 0) parts.push(String(s.c));
  return parts.length ? parts.join(' + ') : '0';
}

export function equationText(p: Pans, rel = '='): string {
  return `${sideText(p.left)} ${rel} ${sideText(p.right)}`;
}

/** Umformung als Randnotiz: „− x“, „− 2x“, „− 3“, „− (x + 2)“, „: 2“. */
export function opText(op: Op): string {
  if (op.kind === 'div') return `: ${op.n}`;
  const body = sideText({ x: op.x, c: op.c });
  return op.x > 0 && op.c > 0 ? `${MINUS} (${body})` : `${MINUS} ${body}`;
}

/** Bruch als Text: „3“, „−2“, „3/2“. */
export function fracText(f: Frac, lang: 'de' | 'en'): string {
  const sign = f.num < 0 ? MINUS : '';
  const n = Math.abs(f.num);
  if (f.den === 1) return `${sign}${n}`;
  const dec = n / f.den;
  const terminating = [2, 4, 5, 8, 10, 16, 20, 25].includes(f.den);
  const decText = terminating ? ` = ${sign}${String(dec).replace('.', lang === 'de' ? ',' : '.')}` : '';
  return `${sign}${n}/${f.den}${decText}`;
}

/* ------------------------------------------------------------------ */
/* Zufällige Aufgaben                                                  */
/* ------------------------------------------------------------------ */

/** Grenzen der Regler. */
export const LIMITS = { x: 6, c: 15 } as const;

/**
 * Zufällige Gleichung mit natürlicher Lösung 1…6, die ins Modell passt und
 * nicht schon gelöst ist. `random` liefert Zahlen in [0, 1).
 */
export function randomEquation(random: () => number): { a: number; b: number; c: number; d: number } {
  const int = (lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1));
  for (let tries = 0; tries < 500; tries++) {
    const x = int(1, 6);
    const a = int(1, 5);
    const c = int(0, 4);
    if (a === c) continue;
    const b = int(0, 7);
    const d = (a - c) * x + b;
    if (d < 0 || d > LIMITS.c) continue;
    const eq = pans(a, b, c, d);
    if (isSolved(eq) || a + c < 2 || b + d < 3) continue;
    // Linke Seite soll die Seite mit mehr Päckchen sein oder es ist gemischt – beides üben
    return random() < 0.3 ? { a: c, b: d, c: a, d: b } : { a, b, c, d };
  }
  return { a: 3, b: 2, c: 1, d: 8 };
}
