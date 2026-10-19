/**
 * Rechenlogik „Integral als Gesamtänderung“ (Jgst. 13).
 *
 * Kennt man die Änderungsrate r(t) einer Größe (Geschwindigkeit, Zufluss),
 * so ist die Änderung der Größe im Zeitraum [0; t] das Integral:
 *   B(t) = B(0) + ∫₀ᵗ r(u) du   („Rekonstruktion des Bestands“)
 * Näherung durch Rechtecke: Σ r(tᵢ) · Δt mit tᵢ am linken Rand, am rechten
 * Rand oder in der Mitte des Streifens.
 */

export type SitKey = 'car' | 'tank' | 'bike' | 'own';
export type Rule = 'l' | 'r' | 'm';

export interface Situation {
  rate: (t: number) => number;
  /** exakte Änderung ∫₀ᵗ r(u) du */
  change: (t: number) => number;
  T: number;
}

const PI = Math.PI;

export const SITS: Record<Exclude<SitKey, 'own'>, Situation> = {
  // Auto: 10 s beschleunigen auf 20 m/s, 30 s konstant, 10 s bremsen, 10 s stehen
  car: {
    rate: (t) => (t <= 10 ? 2 * t : t <= 40 ? 20 : t <= 50 ? 20 - 2 * (t - 40) : 0),
    change: (t) => {
      if (t <= 10) return t * t;
      if (t <= 40) return 100 + 20 * (t - 10);
      if (t <= 50) {
        const u = t - 40;
        return 700 + 20 * u - u * u;
      }
      return 800;
    },
    T: 60,
  },
  // Wassertank: Zufluss 4 L/min, linear abnehmend, ab 20 min Abfluss
  tank: { rate: (t) => 4 - 0.2 * t, change: (t) => 4 * t - 0.1 * t * t, T: 40 },
  // Radfahrt mit schwankender Geschwindigkeit
  bike: { rate: (t) => 5 + 3 * Math.sin((PI * t) / 30), change: (t) => 5 * t + (90 / PI) * (1 - Math.cos((PI * t) / 30)), T: 120 },
};

/** Abstand der Stützstellen bei der eigenen Rate (Minuten). */
export const OWN_STEP = 10;

/**
 * Eigene Zuflussrate: Streckenzug durch die Punkte (0 | r₀), (10 | r₁), …
 * Das Integral eines Streckenzugs ist eine Summe von Trapezflächen – also
 * exakt berechenbar.
 */
export function ownSituation(values: readonly number[]): Situation {
  const n = values.length - 1;
  const T = n * OWN_STEP;
  const rate = (t: number): number => {
    const u = Math.max(0, Math.min(T, t)) / OWN_STEP;
    const i = Math.min(n - 1, Math.floor(u));
    const f = u - i;
    return values[i]! + (values[i + 1]! - values[i]!) * f;
  };
  const change = (t: number): number => {
    const tc = Math.max(0, Math.min(T, t));
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const a = i * OWN_STEP;
      if (tc <= a) break;
      const b = Math.min(tc, a + OWN_STEP);
      sum += ((values[i]! + rate(b)) / 2) * (b - a);
    }
    return sum;
  };
  return { rate, change, T };
}

/** Stelle tᵢ im i-ten Streifen (links, rechts, Mitte). */
export function samplePoint(i: number, dt: number, rule: Rule): number {
  return (i + (rule === 'l' ? 0 : rule === 'r' ? 1 : 0.5)) * dt;
}

/** Rechtecksumme mit n Streifen auf [0; t]. */
export function riemannSum(s: Situation, t: number, n: number, rule: Rule = 'l'): number {
  if (n <= 0 || t <= 0) return 0;
  const dt = t / n;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += s.rate(samplePoint(i, dt, rule)) * dt;
  return sum;
}

/** Linke Rechtecksumme (Kurzform). */
export function leftSum(s: Situation, t: number, n: number): number {
  return riemannSum(s, t, n, 'l');
}

/** Teilsummen nach jedem Streifen: [0, r(t₀)Δt, r(t₀)Δt + r(t₁)Δt, …] (n + 1 Werte). */
export function partialSums(s: Situation, t: number, n: number, rule: Rule = 'l'): number[] {
  const out = [0];
  if (n <= 0 || t <= 0) return out;
  const dt = t / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += s.rate(samplePoint(i, dt, rule)) * dt;
    out.push(sum);
  }
  return out;
}

/** Flächenanteile oberhalb (pos) und unterhalb (neg ≤ 0) der Zeitachse auf [0; t]. */
export function signedAreas(s: Situation, t: number, steps = 2000): { pos: number; neg: number } {
  if (t <= 0) return { pos: 0, neg: 0 };
  const h = t / steps;
  let pos = 0;
  let neg = 0;
  // Mittelpunktsregel auf feinem Gitter; Vorzeichenwechsel innerhalb eines
  // Schritts fallen bei 2000 Schritten nicht ins Gewicht.
  for (let i = 0; i < steps; i++) {
    const v = s.rate((i + 0.5) * h) * h;
    if (v > 0) pos += v;
    else neg += v;
  }
  return { pos, neg };
}

/**
 * Stellen, an denen die Rate das Vorzeichen wechselt: Dort hat der Bestand
 * ein Maximum (+ → −) oder ein Minimum (− → +). Nullstellen ohne
 * Vorzeichenwechsel (Auto steht) zählen nicht.
 */
export function signChanges(s: Situation, steps = 1200): { t: number; kind: 'max' | 'min' }[] {
  const out: { t: number; kind: 'max' | 'min' }[] = [];
  const h = s.T / steps;
  let lastSign = 0;
  let lastT = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i * h;
    const v = s.rate(t);
    const sign = Math.abs(v) < 1e-12 ? 0 : Math.sign(v);
    if (sign === 0) continue;
    if (lastSign !== 0 && sign !== lastSign) {
      // Bisektion zwischen letztem Wert mit Vorzeichen und jetzt
      let a = lastT;
      let b = t;
      for (let k = 0; k < 60; k++) {
        const m = (a + b) / 2;
        const vm = s.rate(m);
        if (Math.sign(vm) === lastSign) a = m;
        else b = m;
      }
      // Liegt dazwischen ein Nullplateau, ist der Wechsel an dessen Anfang.
      out.push({ t: (a + b) / 2, kind: lastSign > 0 ? 'max' : 'min' });
    }
    lastSign = sign;
    lastT = t;
  }
  return out;
}
