/**
 * Rechenlogik „Prozentstreifen“ (Jahrgangsstufe 6/7).
 *
 * Grundwert G (≙ 100 %), Prozentsatz p % und Prozentwert W:
 *   W = G · p/100,   p = W/G · 100,   G = W · 100/p.
 *
 * Dreisatz am Streifen (Beispiel W gesucht): 100 % ≙ G → 1 % ≙ G : 100 → p % ≙ W.
 * Rückwärts (G gesucht): p % ≙ W → 1 % ≙ W : p → 100 % ≙ G.
 *
 * Sachsituationen:
 * - Anteil (ohne Sachzusammenhang, Umfrage in der Klasse): Prozentwert gehört zu p %.
 * - Zinsen für ein Jahr: Z = K · p/100 (K = Kapital als Grundwert).
 * - Rabatt (verminderter Grundwert): neuer Preis ≙ (100 − p) %.
 * - Preiserhöhung und Mehrwertsteuer (vermehrter Grundwert): neuer Preis ≙ (100 + p) %.
 *
 * In den Situationen mit Änderung ist der „Prozentwert“ der neue Preis; sein
 * Prozentsatz ist q = 100 ∓ p. Der Regler p ist immer der Änderungs- bzw.
 * Anteilssatz, so wie er in der Aufgabe steht („20 % Rabatt“).
 */

export type Find = 'W' | 'p' | 'G';
export type Sit = 'none' | 'rabatt' | 'mwst' | 'zins' | 'klasse' | 'erh';

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
/** Bruttopreis bei p % Mehrwertsteuer bzw. Preis nach p % Erhöhung. */
export function gross(G: number, p: number): number {
  return (G * (100 + p)) / 100;
}
/** Jahreszinsen: Z = K · p/100. */
export function interest(K: number, p: number): number {
  return (K * p) / 100;
}

/** Richtung der Änderung: −1 Rabatt, +1 Erhöhung/Mehrwertsteuer, 0 reiner Anteil. */
export function changeSign(sit: Sit): -1 | 0 | 1 {
  if (sit === 'rabatt') return -1;
  if (sit === 'mwst' || sit === 'erh') return 1;
  return 0;
}

/** Prozentsatz q, der zum Prozentwert gehört: p, 100 − p oder 100 + p. */
export function shareRate(sit: Sit, p: number): number {
  const s = changeSign(sit);
  return s === 0 ? p : 100 + s * p;
}

/** Wachstumsfaktor q/100, z. B. 0,8 bei 20 % Rabatt und 1,19 bei 19 % MwSt. */
export function factorOf(sit: Sit, p: number): number {
  return shareRate(sit, p) / 100;
}

/** Vollständige Aufgabe: alle Größen aus Grundwert G und Satz p. */
export interface Problem {
  sit: Sit;
  find: Find;
  /** Grundwert (≙ 100 %) */
  G: number;
  /** Satz aus der Aufgabe (Anteil, Rabatt, Erhöhung, Steuer, Zins) in % */
  p: number;
  /** Prozentsatz des Prozentwerts in % (p bzw. 100 ∓ p) */
  q: number;
  /** Prozentwert: Anteil bzw. neuer Preis */
  W: number;
  /** Betrag zu p %: Anteil, Rabatt, Aufschlag, Steuer oder Zinsen */
  D: number;
  /** Wert von 1 % */
  one: number;
  /** Ergebnis der gesuchten Größe (NaN, wenn nicht bestimmbar) */
  result: number;
}

export function problem(sit: Sit, find: Find, G: number, p: number): Problem {
  const q = shareRate(sit, p);
  const W = percentValue(G, q);
  const D = percentValue(G, p);
  const result = find === 'W' ? W : find === 'p' ? percentRate(G, W) : baseValue(W, q);
  return { sit, find, G, p, q, W, D, one: G / 100, result };
}

/**
 * Die drei Zeilen des Dreisatzes am Streifen als [Prozent, Wert].
 * W und p gesucht: 100 % ≙ G → 1 % ≙ G : 100 → q % ≙ W
 * (bei p gesucht: Wie oft passt der Wert von 1 % in W?).
 * G gesucht: q % ≙ W → 1 % ≙ W : q → 100 % ≙ G.
 */
export function ruleOfThree(find: Find, G: number, q: number): [number, number][] {
  const W = percentValue(G, q);
  if (find === 'G') return [
    [q, W],
    [1, q === 0 ? NaN : W / q],
    [100, G],
  ];
  return [
    [100, G],
    [1, G / 100],
    [q, W],
  ];
}

/**
 * Typischer Fehler beim Zurückrechnen: den Prozentsatz vom neuen Wert W abziehen
 * bzw. aufschlagen, als wäre W der Grundwert. Beispiel: 84 € nach +20 % →
 * falsch 84 € − 20 % von 84 € = 67,20 € (richtig: 70 €).
 */
export function wrongBase(sit: Sit, W: number, p: number): number {
  return (W * (100 - changeSign(sit) * p)) / 100;
}

/** Gesamtfaktor mehrerer Änderungen nacheinander, z. B. [+20, −20] → 1,2 · 0,8 = 0,96. */
export function chainFactor(changes: number[]): number {
  return changes.reduce((f, c) => f * (1 + c / 100), 1);
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** p % als gekürzter Bruch [Zähler, Nenner]; p mit höchstens zwei Nachkommastellen (2,5 % = 1/40). */
export function asFraction(p: number): [number, number] {
  const n = Math.round(p * 100);
  const d = 10000;
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

/** Bruch → Prozent, z. B. 3/4 → 75. */
export function fractionToPercent(n: number, d: number): number {
  return d === 0 ? NaN : (n / d) * 100;
}

/** Ist x (bis auf Rundung) eine Zahl mit höchstens d Nachkommastellen? */
export function isNice(x: number, d = 2): boolean {
  if (!Number.isFinite(x)) return false;
  const f = 10 ** d;
  return Math.abs(x * f - Math.round(x * f)) < 1e-6;
}

/** Hunderterfeld: volle Kästchen und Anteil des angefangenen Kästchens für q %. */
export function gridFill(q: number): { full: number; part: number } {
  const v = Math.max(0, q);
  const full = Math.floor(v + 1e-9);
  return { full, part: Math.max(0, v - full) };
}

/* ---------- Zufallsaufgaben mit „schönen“ Zahlen ---------- */

const POOLS: Record<Sit, { G: number[]; p: number[] }> = {
  none: { G: [20, 40, 50, 60, 80, 120, 150, 200, 240, 250, 300, 400, 500], p: [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80] },
  rabatt: { G: [20, 24, 30, 40, 45, 60, 80, 90, 120, 150, 200], p: [10, 15, 20, 25, 30, 40, 50] },
  mwst: { G: [10, 20, 40, 50, 100, 200, 300, 500, 1000], p: [7, 19] },
  zins: { G: [200, 400, 500, 800, 1000, 1200, 1500, 2000], p: [0.5, 1, 1.5, 2, 2.5, 3, 4] },
  klasse: { G: [20, 24, 25, 28, 30, 32, 40, 48, 50, 60, 80, 100], p: [5, 10, 12.5, 20, 25, 30, 40, 50, 60, 75, 80] },
  erh: { G: [40, 50, 60, 70, 80, 100, 120, 150, 200], p: [5, 10, 15, 20, 25, 30, 50] },
};

/**
 * Zufällige Aufgabe mit glatten Ergebnissen: Geld auf Cent, Personen ganzzahlig,
 * reine Zahlen mit höchstens einer Nachkommastelle. `rnd` liefert Zahlen in [0; 1).
 */
export function randomTask(sit: Sit, rnd: () => number): { find: Find; G: number; p: number } {
  const pool = POOLS[sit];
  const pick = <T>(a: T[]): T => a[Math.min(a.length - 1, Math.floor(rnd() * a.length))]!;
  const finds: Find[] = ['W', 'p', 'G'];
  const find = pick(finds);
  for (let i = 0; i < 200; i++) {
    const G = pick(pool.G);
    const p = pick(pool.p);
    const pr = problem(sit, find, G, p);
    const okW = sit === 'klasse' ? isNice(pr.W, 0) : sit === 'none' ? isNice(pr.W, 1) : isNice(pr.W, 2) && isNice(pr.D, 2);
    if (okW && pr.q > 0) return { find, G, p };
  }
  return { find, G: 80, p: 25 };
}
