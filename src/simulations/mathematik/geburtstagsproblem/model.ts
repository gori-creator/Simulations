/**
 * Rechenlogik für „Geburtstagsproblem simulieren“: Wahrscheinlichkeit, dass
 * in einer Gruppe von n Personen mindestens zwei am selben Tag Geburtstag
 * haben (Modell: 365 gleich wahrscheinliche Tage, keine Schalttage, keine
 * Zwillinge), im Vergleich zu „jemand hat am selben Tag Geburtstag wie ich“;
 * Simulation einzelner Klassen und Kalenderhilfen. Keine Zeichenbefehle.
 */

export const DAYS = 365;
export const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/**
 * P(alle verschieden) = 365/365 · 364/365 · … · (365 − n + 1)/365.
 * Als Produkt berechnet (keine riesigen Fakultäten).
 */
export function pAllDifferent(n: number, days = DAYS): number {
  if (n > days) return 0;
  let p = 1;
  for (let k = 0; k < n; k++) p *= (days - k) / days;
  return p;
}

/** P(mindestens zwei haben am selben Tag Geburtstag) = 1 − P(alle verschieden). */
export function pShared(n: number, days = DAYS): number {
  return 1 - pAllDifferent(n, days);
}

/** P(mindestens eine der n anderen Personen hat an meinem Geburtstag Geburtstag) = 1 − (364/365)ⁿ. */
export function pMine(n: number, days = DAYS): number {
  return 1 - ((days - 1) / days) ** n;
}

/** Kleinste Gruppengröße, ab der die Wahrscheinlichkeit mindestens `p` ist. */
export function smallestN(p: number, f: (n: number) => number = pShared, max = 2000): number {
  for (let n = 1; n <= max; n++) if (f(n) >= p) return n;
  return Infinity;
}

/** Anzahl der Paare in einer Gruppe: n · (n − 1) / 2. */
export const pairs = (n: number): number => (n * (n - 1)) / 2;

/** Tag im Jahr (0 … 364) → Monat (0 … 11) und Tag (1 … 31). */
export function monthDay(dayOfYear: number): { month: number; day: number } {
  let d = ((Math.floor(dayOfYear) % DAYS) + DAYS) % DAYS;
  for (let m = 0; m < 12; m++) {
    if (d < MONTH_LENGTHS[m]!) return { month: m, day: d + 1 };
    d -= MONTH_LENGTHS[m]!;
  }
  return { month: 11, day: 31 };
}

/** Monat (0 … 11) und Tag (1 … 31) → Tag im Jahr (0 … 364). */
export function dayOfYear(month: number, day: number): number {
  let d = 0;
  for (let m = 0; m < month; m++) d += MONTH_LENGTHS[m]!;
  return d + day - 1;
}

/** Eine zufällige Klasse: n Geburtstage (Tage im Jahr). `rnd` liefert Zahlen in [0, 1). */
export function randomClass(n: number, rnd: () => number, days = DAYS): number[] {
  return Array.from({ length: n }, () => Math.floor(rnd() * days));
}

/** Tage, an denen mehr als eine Person Geburtstag hat, mit Anzahl. */
export function duplicates(bdays: readonly number[]): Map<number, number> {
  const count = new Map<number, number>();
  for (const b of bdays) count.set(b, (count.get(b) ?? 0) + 1);
  for (const [k, v] of count) if (v < 2) count.delete(k);
  return count;
}

export const hasShared = (bdays: readonly number[]): boolean => duplicates(bdays).size > 0;

/** Hat jemand in der Klasse an `mine` Geburtstag? */
export const hasMine = (bdays: readonly number[], mine: number): boolean => bdays.includes(mine);

/** Kleiner, schneller, reproduzierbarer Zufallsgenerator (mulberry32). */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Ergänzungen: Rechnung mit Gegenereignis, Paare, andere Tageszahlen ---------- */

/**
 * Faktoren der Pfadregel für „alle verschieden“: Person k (1, 2, …) muss einen
 * der noch freien Tage treffen, also (days − (k − 1)) / days.
 */
export function factors(n: number, days = DAYS): number[] {
  return Array.from({ length: n }, (_, k) => Math.max(0, days - k) / days);
}

/** P(alle verschieden) für 0, 1, …, n Personen (Index = Personenzahl). */
export function allDifferentSeries(n: number, days = DAYS): number[] {
  const out = [1];
  let prod = 1;
  for (let k = 0; k < n; k++) {
    prod *= Math.max(0, days - k) / days;
    out.push(prod);
  }
  return out;
}

/**
 * Näherung über die Paare: Jedes der n(n − 1)/2 Paare hat mit Wahrscheinlichkeit
 * 1/days denselben Tag. Tut man so, als wären die Paare unabhängig:
 * P ≈ 1 − (1 − 1/days)^(Anzahl der Paare).
 */
export function pApprox(n: number, days = DAYS): number {
  return 1 - (1 - 1 / days) ** pairs(n);
}

/** Erwartete Anzahl von Paaren mit gleichem Tag: n(n − 1)/2 · 1/days. */
export const expectedSharedPairs = (n: number, days = DAYS): number => pairs(n) / days;

/** Anzahl der Paare mit gleichem Tag in einer Klasse (ein Tag mit c Personen liefert c(c − 1)/2 Paare). */
export function sharedPairs(bdays: readonly number[]): number {
  let s = 0;
  for (const c of duplicates(bdays).values()) s += pairs(c);
  return s;
}

/** Schubfachprinzip: Ab days + 1 Personen ist ein gemeinsamer Tag sicher. */
export const certainFrom = (days = DAYS): number => days + 1;

/**
 * Personen nacheinander auf verschiedene Tage setzen (zufällige Reihenfolge ohne Wiederholung,
 * höchstens `days` Personen) – für die schrittweise Rechnung „alle verschieden“.
 */
export function distinctDays(n: number, rnd: () => number, days = DAYS): number[] {
  const pool = Array.from({ length: days }, (_, i) => i);
  const out: number[] = [];
  for (let k = 0; k < Math.min(n, days); k++) {
    const j = k + Math.floor(rnd() * (days - k));
    [pool[k], pool[j]] = [pool[j]!, pool[k]!];
    out.push(pool[k]!);
  }
  return out;
}

/** 95-%-Bereich der relativen Häufigkeit nach N Versuchen: p ± 1,96 · √(p(1 − p)/N). */
export function band95(p: number, N: number): [number, number] {
  if (N <= 0) return [0, 1];
  const h = 1.96 * Math.sqrt((p * (1 - p)) / N);
  return [Math.max(0, p - h), Math.min(1, p + h)];
}
