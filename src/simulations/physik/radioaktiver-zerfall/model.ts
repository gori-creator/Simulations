/**
 * Rechenlogik „Radioaktiver Zerfall und Halbwertszeit“.
 *
 * Jeder noch nicht zerfallene Kern zerfällt in einem kleinen Zeitschritt Δt mit
 * der Wahrscheinlichkeit p = 1 − e^(−λ·Δt), unabhängig von den anderen Kernen
 * und davon, wie lange er schon existiert. Daraus folgt im Mittel das
 * Zerfallsgesetz N(t) = N₀ · (1/2)^(t/T½) = N₀ · e^(−λ·t) mit λ = ln 2 / T½.
 */

export const LN2 = Math.LN2;
/** Avogadro-Konstante in 1/mol. */
export const AVOGADRO = 6.02214076e23;
/** Ein Jahr (julianisch) in Sekunden, ein Tag in Sekunden. */
export const YEAR_S = 365.25 * 86400;
export const DAY_S = 86400;

export type NuclideId = 'rn220' | 'i131' | 'cs137' | 'c14' | 'u238';
export type DecayKind = 'alpha' | 'beta';
/** Zeiteinheit, in der die Halbwertszeit angegeben ist ('Ga' = 10⁹ Jahre). */
export type TimeUnit = 's' | 'd' | 'a' | 'Ga';

export interface Nucleus {
  symbol: string;
  /** Massenzahl A (Nukleonen). */
  A: number;
  /** Kernladungszahl Z (Protonen). */
  Z: number;
}

export interface Nuclide extends Nucleus {
  id: NuclideId;
  /** Halbwertszeit in der Einheit `unit`. */
  halfLife: number;
  unit: TimeUnit;
  kind: DecayKind;
  /** Wird beim Zerfall zusätzlich γ-Strahlung ausgesandt (I-131, Cs-137 über Ba-137m)? */
  gamma: boolean;
  daughter: Nucleus;
  /** Ist der Tochterkern selbst radioaktiv (Zerfallsreihe)? */
  daughterRadioactive: boolean;
}

export const NUCLIDES: Record<NuclideId, Nuclide> = {
  rn220: { id: 'rn220', symbol: 'Rn', A: 220, Z: 86, halfLife: 55.6, unit: 's', kind: 'alpha', gamma: false, daughter: { symbol: 'Po', A: 216, Z: 84 }, daughterRadioactive: true },
  i131: { id: 'i131', symbol: 'I', A: 131, Z: 53, halfLife: 8.02, unit: 'd', kind: 'beta', gamma: true, daughter: { symbol: 'Xe', A: 131, Z: 54 }, daughterRadioactive: false },
  cs137: { id: 'cs137', symbol: 'Cs', A: 137, Z: 55, halfLife: 30.1, unit: 'a', kind: 'beta', gamma: true, daughter: { symbol: 'Ba', A: 137, Z: 56 }, daughterRadioactive: false },
  c14: { id: 'c14', symbol: 'C', A: 14, Z: 6, halfLife: 5730, unit: 'a', kind: 'beta', gamma: false, daughter: { symbol: 'N', A: 14, Z: 7 }, daughterRadioactive: false },
  u238: { id: 'u238', symbol: 'U', A: 238, Z: 92, halfLife: 4.47, unit: 'Ga', kind: 'alpha', gamma: false, daughter: { symbol: 'Th', A: 234, Z: 90 }, daughterRadioactive: true },
};

export const NUCLIDE_IDS: readonly NuclideId[] = ['rn220', 'i131', 'cs137', 'c14', 'u238'];

/** Tochterkern nach den Erhaltungssätzen: α: A − 4, Z − 2; β⁻: A gleich, Z + 1. */
export function daughterOf(parent: Nucleus, kind: DecayKind): { A: number; Z: number } {
  return kind === 'alpha' ? { A: parent.A - 4, Z: parent.Z - 2 } : { A: parent.A, Z: parent.Z + 1 };
}

/** Sekunden je Zeiteinheit. */
export function unitSeconds(unit: TimeUnit): number {
  return unit === 's' ? 1 : unit === 'd' ? DAY_S : unit === 'a' ? YEAR_S : 1e9 * YEAR_S;
}

/** Zerfallskonstante λ = ln 2 / T½ (in 1 / Einheit der Halbwertszeit). */
export function decayConstant(halfLife: number): number {
  return LN2 / halfLife;
}

/** Halbwertszeit aus der Zerfallskonstante. */
export function halfLifeOf(lambda: number): number {
  return LN2 / lambda;
}

/** Wahrscheinlichkeit, dass ein Kern im Zeitschritt Δt zerfällt: p = 1 − e^(−λ·Δt). */
export function decayProbability(lambda: number, dt: number): number {
  if (!(lambda > 0) || !(dt > 0)) return 0;
  return -Math.expm1(-lambda * dt);
}

/** Erwarteter Restanteil N/N₀ = (1/2)^(t/T½). */
export function remainingFraction(t: number, halfLife: number): number {
  return 2 ** (-t / halfLife);
}

/** Erwartete Zahl der noch nicht zerfallenen Kerne: N(t) = N₀ · (1/2)^(t/T½). */
export function expectedRemaining(N0: number, t: number, halfLife: number): number {
  return N0 * remainingFraction(t, halfLife);
}

/** Aktivität A = λ · N (Zerfälle je Zeiteinheit). */
export function activity(lambda: number, N: number): number {
  return lambda * N;
}

/** Vergangene Zeit aus dem Restanteil (Altersbestimmung): t = T½ · log₂(N₀/N). */
export function ageFromFraction(fraction: number, halfLife: number): number {
  if (!(fraction > 0) || fraction > 1) return NaN;
  return halfLife * Math.log2(1 / fraction);
}

/** Mittlere Lebensdauer τ = 1/λ = T½ / ln 2 ≈ 1,44 · T½. */
export function meanLifetime(halfLife: number): number {
  return halfLife / LN2;
}

/** Wahrscheinlichkeit, dass ein Kern zwischen a und b (in T½) zerfällt: 2^(−a) − 2^(−b). */
export function decayBetween(a: number, b: number): number {
  return 2 ** -a - 2 ** -b;
}

/** Aktivität von 1 g des Nuklids in Bq (Molmasse näherungsweise A g/mol). */
export function specificActivity(n: Nuclide): number {
  const atoms = AVOGADRO / n.A;
  const lambdaPerSecond = LN2 / (n.halfLife * unitSeconds(n.unit));
  return lambdaPerSecond * atoms;
}

/** Zahl der Kerne in 1 g (Molmasse näherungsweise A g/mol). */
export function atomsPerGram(n: Nuclide): number {
  return AVOGADRO / n.A;
}

/**
 * Ein Zeitschritt für ein Präparat: Jeder noch nicht zerfallene Kern (alive[i] = 1)
 * zerfällt mit der Wahrscheinlichkeit p. Gibt die Nummern der zerfallenen Kerne zurück.
 * Die Zufallszahlen werden immer in derselben Reihenfolge gezogen, deshalb ist der
 * Verlauf bei gleichem Startwert reproduzierbar.
 */
export function stepDecay(alive: Uint8Array, p: number, rand: () => number): number[] {
  const out: number[] = [];
  for (let i = 0; i < alive.length; i++) {
    if (alive[i] && rand() < p) {
      alive[i] = 0;
      out.push(i);
    }
  }
  return out;
}

/** Ganzer Zerfallsverlauf: Anzahl nach 0, 1, …, steps Schritten. */
export function simulateCounts(N0: number, p: number, steps: number, rand: () => number): number[] {
  const alive = new Uint8Array(N0).fill(1);
  let N = N0;
  const out = [N];
  for (let k = 0; k < steps; k++) {
    N -= stepDecay(alive, p, rand).length;
    out.push(N);
  }
  return out;
}

/**
 * Lebensdauer eines einzelnen Kerns (in Einheiten von Δt · Schrittzahl): so lange
 * würfeln, bis er zerfällt. Gibt die Zeit bis zum Zerfall zurück (Ende des Schritts),
 * höchstens maxSteps · dt.
 */
export function simulateLifetime(p: number, dt: number, rand: () => number, maxSteps = 1e6): number {
  for (let k = 1; k <= maxSteps; k++) if (rand() < p) return k * dt;
  return maxSteps * dt;
}

/** Arithmetisches Mittel (leer: NaN). */
export function mean(values: readonly number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
}

/** Median (leer: NaN). */
export function median(values: readonly number[]): number {
  if (!values.length) return NaN;
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

/** Anteil der Werte, die größer als t sind (empirische „Überlebenskurve“). */
export function survivingShare(values: readonly number[], t: number): number {
  if (!values.length) return NaN;
  let k = 0;
  for (const v of values) if (v > t) k++;
  return k / values.length;
}

/**
 * Gleichmäßige Verteilung von n Punkten in einer Kreisscheibe mit Radius 1
 * (Sonnenblumen-Muster nach Vogel): r = √((i + ½)/n), Winkel i · goldener Winkel.
 */
export function sunflower(n: number): Float64Array {
  const out = new Float64Array(2 * n);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt((i + 0.5) / n);
    const a = i * golden;
    out[2 * i] = r * Math.cos(a);
    out[2 * i + 1] = r * Math.sin(a);
  }
  return out;
}

/**
 * Trifft ein Strahl ab (x, y) in Richtung (dx, dy) (Einheitsvektor) die Strecke
 * von (ax, ay) nach (bx, by)? Gibt die Entfernung bis zum Treffpunkt zurück, sonst null.
 */
export function raySegment(x: number, y: number, dx: number, dy: number, ax: number, ay: number, bx: number, by: number): number | null {
  const ex = bx - ax;
  const ey = by - ay;
  const den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-12) return null;
  const wx = ax - x;
  const wy = ay - y;
  const t = (wx * ey - wy * ex) / den;
  const u = (wx * dy - wy * dx) / den;
  if (t <= 0 || u < 0 || u > 1) return null;
  return t;
}

/** Zehnerpotenz-Zerlegung für die Anzeige: v = m · 10^e mit 1 ≤ |m| < 10. */
export function sciParts(v: number): { m: number; e: number } {
  if (v === 0 || !Number.isFinite(v)) return { m: v, e: 0 };
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / 10 ** e;
  if (Math.abs(m) >= 9.995) {
    m /= 10;
    e += 1;
  }
  return { m, e };
}
