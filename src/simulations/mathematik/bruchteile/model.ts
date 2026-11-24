/** Rechenlogik „Bruchteile darstellen“. */

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Vollständig gekürzter Bruch. */
export function reduce(z: number, n: number): { z: number; n: number } {
  const d = gcd(z, n);
  return { z: z / d, n: n / d };
}

/** Gemischte Zahl: z/n = whole + rest/n. */
export function mixed(z: number, n: number): { whole: number; rest: number } {
  return { whole: Math.floor(z / n), rest: z % n };
}

/**
 * Dezimaldarstellung durch schriftliches Dividieren: ganzzahliger Teil,
 * Vorperiode und Periode (leer, wenn der Dezimalbruch endlich ist).
 */
export function decimalExpansion(z: number, n: number, maxDigits = 60): { integer: number; pre: string; period: string } {
  const integer = Math.floor(z / n);
  let remainder = z % n;
  const seen = new Map<number, number>();
  let digits = '';
  while (remainder !== 0 && !seen.has(remainder) && digits.length < maxDigits) {
    seen.set(remainder, digits.length);
    remainder *= 10;
    digits += String(Math.floor(remainder / n));
    remainder %= n;
  }
  if (remainder === 0 || !seen.has(remainder)) return { integer, pre: digits, period: '' };
  const start = seen.get(remainder)!;
  return { integer, pre: digits.slice(0, start), period: digits.slice(start) };
}

/** Kleinstes gemeinsames Vielfaches. */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Vergleich a/b mit c/d: −1 (kleiner), 0 (gleich), 1 (größer). */
export function compareFractions(a: number, b: number, c: number, d: number): -1 | 0 | 1 {
  const diff = a * d - c * b;
  return diff < 0 ? -1 : diff > 0 ? 1 : 0;
}

/** Beide Brüche auf den Hauptnenner erweitert. */
export function commonDenominator(a: number, b: number, c: number, d: number): { n: number; z1: number; z2: number } {
  const n = lcm(b, d);
  return { n, z1: (a * n) / b, z2: (c * n) / d };
}

// ───────────────────────── Üben ─────────────────────────

export interface FractionTask {
  /** ablesen (Bruch eintippen) oder einfärben (Stücke antippen) */
  kind: 'read' | 'color';
  /** Anzahl der Stücke */
  pieces: number;
  /** ablesen: so viele Stücke sind gefärbt; einfärben: so viele müssen gefärbt werden */
  count: number;
  /** einfärben: gesuchter Bruch (gekürzt) */
  target: { z: number; n: number };
  /** Form der Darstellung */
  shape: 'pizza' | 'strip';
}

/**
 * Reproduzierbare Aufgabe Nr. q: ungerade Nummern „Welcher Bruch ist gefärbt?“,
 * gerade „Färbe z/n ein“ – dabei ist die Anzahl der Stücke ein Vielfaches des
 * Nenners (z. B. 2/3 auf 6 Stücken), damit man erweitern muss.
 */
export function fractionTask(q: number, rand: () => number): FractionTask {
  const shape = rand() < 0.5 ? 'pizza' : 'strip';
  if (q % 2 === 1) {
    const pieces = 2 + Math.floor(rand() * 11);
    const count = 1 + Math.floor(rand() * (pieces - 1));
    return { kind: 'read', pieces, count, target: reduce(count, pieces), shape };
  }
  const n = 2 + Math.floor(rand() * 5);
  const z = 1 + Math.floor(rand() * (n - 1));
  const t = reduce(z, n);
  const maxM = Math.floor(12 / t.n);
  // ab Aufgabe 4 mindestens zwei Stücke je Teil, damit man erweitern muss
  const m = q <= 2 || maxM < 2 ? 1 : 2 + Math.floor(rand() * (maxM - 1));
  return { kind: 'color', pieces: t.n * m, count: t.z * m, target: t, shape };
}

/** „3/4“, „3 / 4“ oder „3:4“ → {z, n}; sonst null. */
export function parseFraction(text: string): { z: number; n: number } | null {
  const m = text.replace(/\s/g, '').match(/^(\d+)[/:÷](\d+)$/);
  if (!m) return null;
  const z = Number(m[1]);
  const n = Number(m[2]);
  return n > 0 ? { z, n } : null;
}

/** Ablesen: richtig ist jeder gleichwertige Bruch (auch gekürzt oder erweitert). */
export function checkRead(task: FractionTask, text: string): { ok: boolean; got: { z: number; n: number } | null } {
  const got = parseFraction(text);
  return { ok: got !== null && got.z * task.pieces === task.count * got.n, got };
}

/** Einfärben: Zahl der gesetzten Bits einer Auswahl (Stück i = Bit i). */
export function selectedCount(mask: number, pieces: number): number {
  let c = 0;
  for (let i = 0; i < pieces; i++) if (mask & (1 << i)) c++;
  return c;
}
