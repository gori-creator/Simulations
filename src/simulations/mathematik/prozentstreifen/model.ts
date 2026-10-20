/**
 * Rechenlogik „Prozentstreifen“ (Jahrgangsstufe 6/7).
 *
 * Grundwert G (≙ 100 %), Prozentsatz p % und Prozentwert W:
 *   W = G · p/100,   p = W/G · 100,   G = W · 100/p.
 *
 * Dreisatz (Beispiel W gesucht): 100 % ≙ G → 1 % ≙ G/100 → p % ≙ W.
 *
 * Anwendungen: Rabatt (neuer Preis = G · (100 − p)/100),
 * Mehrwertsteuer (Bruttopreis = G · (100 + p)/100), Zinsen für ein Jahr
 * (Z = K · p/100) und Anteile (z. B. Kinder einer Klasse).
 */

export type Find = 'W' | 'p' | 'G';

export function percentValue(G: number, p: number): number {
  return (G * p) / 100;
}
export function percentRate(G: number, W: number): number {
  return G === 0 ? NaN : (W / G) * 100;
}
export function baseValue(W: number, p: number): number {
  return p === 0 ? NaN : (W * 100) / p;
}

/** Neuer Preis nach p % Rabatt. */
export function discounted(G: number, p: number): number {
  return (G * (100 - p)) / 100;
}
/** Bruttopreis bei p % Mehrwertsteuer. */
export function gross(G: number, p: number): number {
  return (G * (100 + p)) / 100;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** p % als gekürzter Bruch (nur für ganze p). */
export function asFraction(p: number): [number, number] {
  const g = gcd(Math.round(p), 100) || 1;
  return [Math.round(p) / g, 100 / g];
}

/** Die drei Zeilen des Dreisatzes: [Prozent, Wert] je Zeile. */
export function ruleOfThree(find: Find, G: number, p: number): [number, number][] {
  const W = percentValue(G, p);
  if (find === 'W') return [
    [100, G],
    [1, G / 100],
    [p, W],
  ];
  if (find === 'G') return [
    [p, W],
    [1, p === 0 ? NaN : W / p],
    [100, G],
  ];
  // p gesucht: vom Wert her denken
  return [
    [100, G],
    [G === 0 ? NaN : 100 / G, 1],
    [p, W],
  ];
}

/** Ist x (bis auf Rundung) eine Zahl mit höchstens d Nachkommastellen? */
export function isNice(x: number, d = 2): boolean {
  const f = 10 ** d;
  return Math.abs(x * f - Math.round(x * f)) < 1e-6;
}
