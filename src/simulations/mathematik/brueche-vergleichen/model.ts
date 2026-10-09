/**
 * Rechenlogik „Brüche erweitern, kürzen und vergleichen“: ggT und kgV,
 * Hauptnenner und gemeinsamer Zähler, Erweitern und Kürzen mit Prüfung,
 * gleichwertige Brüche (Bruchwand) und Aufgaben für das Ordnen-Spiel.
 *
 * Alle Vergleiche rechnen exakt mit ganzen Zahlen (über Kreuz multiplizieren),
 * nie mit gerundeten Dezimalzahlen.
 */

export interface Fraction {
  z: number;
  n: number;
}

/** Größter gemeinsamer Teiler (ggT(0; n) = n, ggT(0; 0) = 1). */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Kleinstes gemeinsames Vielfaches zweier positiver ganzer Zahlen. */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

/** Vollständig gekürzter Bruch (0/n wird zu 0/1). */
export function reduce(z: number, n: number): Fraction {
  if (z === 0) return { z: 0, n: 1 };
  const d = gcd(z, n);
  return { z: z / d, n: n / d };
}

/** Ist der Bruch vollständig gekürzt? */
export function isReduced(z: number, n: number): boolean {
  return z === 0 ? n === 1 : gcd(z, n) === 1;
}

/**
 * Vergleich zweier Brüche ohne Rundung: −1 (z1/n1 < z2/n2), 0 (gleich),
 * 1 (größer). Über Kreuz multiplizieren: z1 · n2 ⋚ z2 · n1.
 */
export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const l = a.z * b.n;
  const r = b.z * a.n;
  return l < r ? -1 : l > r ? 1 : 0;
}

export function relationSign(c: -1 | 0 | 1): '<' | '=' | '>' {
  return c < 0 ? '<' : c > 0 ? '>' : '=';
}

/**
 * Gleichnamig machen: Hauptnenner N = kgV(n1; n2) und die Erweiterungszahlen
 * k1 = N / n1, k2 = N / n2.
 */
export function commonDenominator(a: Fraction, b: Fraction): { n: number; k1: number; k2: number } {
  const n = lcm(a.n, b.n);
  return { n, k1: n / a.n, k2: n / b.n };
}

/**
 * Gleiche Zähler herstellen: Z = kgV(z1; z2) und die Erweiterungszahlen.
 * Nur möglich, wenn beide Zähler größer als 0 sind (sonst `null`).
 */
export function commonNumerator(a: Fraction, b: Fraction): { z: number; k1: number; k2: number } | null {
  if (a.z <= 0 || b.z <= 0) return null;
  const z = lcm(a.z, b.z);
  return { z, k1: z / a.z, k2: z / b.z };
}

/** Erweitern mit k: Zähler und Nenner mit k multiplizieren. */
export function expand(f: Fraction, k: number): Fraction {
  return { z: f.z * k, n: f.n * k };
}

/** Kann man z/n mit k kürzen? (k ≥ 2 muss Zähler und Nenner teilen.) */
export function canReduceBy(f: Fraction, k: number): boolean {
  return k >= 2 && f.n % k === 0 && f.z % k === 0;
}

/** Warum Kürzen mit k nicht geht: Nenner bzw. Zähler nicht durch k teilbar. */
export function reduceObstacle(f: Fraction, k: number): 'ok' | 'nenner' | 'zaehler' | 'beide' {
  const n = f.n % k !== 0;
  const z = f.z % k !== 0;
  return n && z ? 'beide' : n ? 'nenner' : z ? 'zaehler' : 'ok';
}

/** Kürzen mit k (setzt voraus, dass es geht). */
export function reduceBy(f: Fraction, k: number): Fraction {
  return { z: f.z / k, n: f.n / k };
}

/** Primfaktoren mit Vielfachheit, aufsteigend (für „Kürzen in Schritten“). */
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let rest = Math.abs(Math.round(n));
  for (let p = 2; p * p <= rest; p++) {
    while (rest % p === 0) {
      out.push(p);
      rest /= p;
    }
  }
  if (rest > 1) out.push(rest);
  return out;
}

/**
 * Kürzen Schritt für Schritt mit den gemeinsamen Primfaktoren:
 * 12/18 → [2, 3] (erst mit 2, dann mit 3).
 */
export function reductionSteps(f: Fraction): number[] {
  if (f.z === 0) return [];
  return primeFactors(gcd(f.z, f.n));
}

/** Gleichwertige Brüche mit Nenner bis `maxN` (aufsteigend nach Nenner). */
export function equivalents(f: Fraction, maxN: number): Fraction[] {
  const r = reduce(f.z, f.n);
  const out: Fraction[] = [];
  for (let k = 1; r.n * k <= maxN; k++) out.push({ z: r.z * k, n: r.n * k });
  return out;
}

/** Lässt sich der Wert z/n in der Zeile mit Nenner `row` der Bruchwand ablesen? */
export function fitsRow(f: Fraction, row: number): number | null {
  const z = (f.z * row) / f.n;
  return Number.isInteger(z) ? z : null;
}

/** Gemischte Zahl: 7/4 = 1 3/4. */
export function mixed(f: Fraction): { whole: number; rest: number; n: number } {
  return { whole: Math.floor(f.z / f.n), rest: f.z % f.n, n: f.n };
}

/* ------------------------------------------------------------------ */
/* Aufgaben                                                            */
/* ------------------------------------------------------------------ */

export type Level = 'leicht' | 'mittel' | 'schwer';

const randInt = (rand: () => number, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

/** Zufälliges Bruchpaar zum Vergleichen (verschiedene Nenner, nicht trivial). */
export function randomPair(rand: () => number = Math.random): [Fraction, Fraction] {
  for (let tries = 0; tries < 200; tries++) {
    const n1 = randInt(rand, 2, 12);
    const n2 = randInt(rand, 2, 12);
    if (n1 === n2) continue;
    const z1 = randInt(rand, 1, n1 - 1);
    const z2 = randInt(rand, 1, n2 - 1);
    const a = { z: z1, n: n1 };
    const b = { z: z2, n: n2 };
    // Nicht zu weit auseinander (sonst sieht man es sofort) und nicht immer gleich.
    const diff = Math.abs(z1 / n1 - z2 / n2);
    if (diff > 0.2) continue;
    if (diff === 0 && rand() < 0.75) continue;
    if (lcm(n1, n2) > 60) continue;
    return [a, b];
  }
  return [
    { z: 3, n: 4 },
    { z: 5, n: 6 },
  ];
}

/**
 * Brüche für das Ordnen-Spiel: `count` Brüche mit paarweise verschiedenen
 * Werten.
 * - leicht: gleicher Nenner oder gleicher Zähler
 * - mittel: echte Brüche mit Nennern bis 10
 * - schwer: Nenner bis 12, auch unechte Brüche bis 2 und eng beieinander
 */
export function orderingTask(level: Level, count: number, rand: () => number = Math.random): Fraction[] {
  for (let attempt = 0; attempt < 500; attempt++) {
    const out: Fraction[] = [];
    if (level === 'leicht') {
      const sameDen = rand() < 0.5;
      if (sameDen) {
        const n = randInt(rand, Math.max(count + 1, 5), 12);
        const zs = shuffle(range(1, n - 1), rand).slice(0, count);
        for (const z of zs) out.push({ z, n });
      } else {
        const z = randInt(rand, 1, 4);
        const ns = shuffle(range(z + 1, 12), rand).slice(0, count);
        for (const n of ns) out.push({ z, n });
      }
    } else {
      const maxN = level === 'mittel' ? 10 : 12;
      const maxV = level === 'mittel' ? 1 : 2;
      let guard = 0;
      while (out.length < count && guard++ < 400) {
        const n = randInt(rand, 2, maxN);
        const z = randInt(rand, 1, Math.min(maxV * n - 1, 2 * n - 1));
        const f = { z, n };
        if (level === 'mittel' && z >= n) continue;
        if (out.some((g) => compare(g, f) === 0)) continue;
        // Mittel: nicht zu eng beieinander; schwer: ruhig eng
        const minGap = level === 'mittel' ? 1 / 24 : 1 / 80;
        if (out.some((g) => Math.abs(g.z / g.n - z / n) < minGap)) continue;
        out.push(f);
      }
      if (level === 'schwer' && out.length === count) {
        // Mindestens ein Paar eng beieinander (Abstand < 1/10) und ein unechter Bruch
        const vals = out.map((f) => f.z / f.n).sort((a, b) => a - b);
        const close = vals.some((v, i) => i > 0 && v - vals[i - 1]! < 0.1);
        const improper = out.some((f) => f.z > f.n);
        if (!close || !improper) continue;
      }
    }
    if (out.length === count && new Set(out.map((f) => f.z / f.n)).size === count) return out;
  }
  // Rückfall (sollte nie gebraucht werden)
  return range(1, count).map((z) => ({ z, n: count + 1 }));
}

/** Aufsteigend sortiert (stabil, exakt). */
export function sortAscending(list: readonly Fraction[]): Fraction[] {
  return [...list].sort((a, b) => compare(a, b));
}

export function range(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

export function shuffle<T>(list: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Namen der Bruchteile (Zwölftel, twelfths …)                          */
/* ------------------------------------------------------------------ */

const DE_UNITS = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const DE_TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
const EN_ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const EN_TENS_ORD = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth'];

/** Zahlwort (klein, in Zusammensetzungen „ein“) für 1 … 199, sonst `null`. */
function germanWord(n: number): string | null {
  if (n < 1 || n > 199 || !Number.isInteger(n)) return null;
  if (n < 20) return DE_UNITS[n]!;
  if (n < 100) {
    const u = n % 10;
    return (u ? `${DE_UNITS[u]}und` : '') + DE_TENS[Math.floor(n / 10)]!;
  }
  const rest = n - 100;
  if (rest === 0) return 'hundert';
  const tail = germanWord(rest);
  return tail ? `hundert${tail}` : null;
}

/**
 * Name des Bruchteils 1/n (Einzahl, wenn `count` = 1, sonst Mehrzahl):
 * DE „Zwölftel“, „Halbe“/„Halbes“, „Zwanzigstel“; EN „twelfths“, „halves“.
 * Für Nenner mit ungebräuchlichem Namen (z. B. 101 … 119) `null`.
 */
export function denominatorName(n: number, count: number, lang: 'de' | 'en'): string | null {
  const one = count === 1;
  if (lang === 'de') {
    if (n === 1) return one ? 'Ganzes' : 'Ganze';
    if (n === 2) return one ? 'Halbes' : 'Halbe';
    if (n > 100 && n % 100 < 20) return null;
    let stem: string | null;
    if (n === 3) stem = 'drittel';
    else if (n === 7) stem = 'siebtel';
    else if (n === 8) stem = 'achtel';
    else if (n < 20) stem = `${germanWord(n)}tel`;
    else {
      const w = germanWord(n);
      stem = w ? `${w}stel` : null;
    }
    return stem ? stem[0]!.toUpperCase() + stem.slice(1) : null;
  }
  if (n === 1) return one ? 'whole' : 'wholes';
  if (n === 2) return one ? 'half' : 'halves';
  if (n === 4) return one ? 'quarter' : 'quarters';
  let ord: string | null = null;
  if (n < 20) ord = EN_ORD[n]!;
  else if (n < 100) {
    const u = n % 10;
    ord = u ? `${EN_TENS[Math.floor(n / 10)]}-${EN_ORD[u]}` : EN_TENS_ORD[Math.floor(n / 10)]!;
  } else if (n === 100) ord = 'hundredth';
  if (!ord) return null;
  return one ? ord : `${ord}s`;
}
