/**
 * Rechenlogik „Integral als Gesamtänderung“ (Jgst. 13).
 *
 * Kennt man die Änderungsrate r(t) einer Größe (Geschwindigkeit, Zufluss),
 * so ist die Änderung der Größe im Zeitraum [0; t] das Integral:
 *   B(t) = B(0) + ∫₀ᵗ r(u) du   („Rekonstruktion des Bestands“)
 * Näherung durch Rechtecke: Σ r(tᵢ) · Δt mit tᵢ am linken Rand, am rechten
 * Rand oder in der Mitte des Streifens.
 *
 * Wechselt die Rate das Vorzeichen (Abfluss, Rückwärtsfahrt), unterscheiden
 * sich die Gesamtänderung ∫ r und der insgesamt zurückgelegte Weg bzw. die
 * insgesamt bewegte Menge ∫ |r|.
 */

export type SitKey = 'car' | 'tank' | 'bike' | 'own' | 'back';
export type Rule = 'l' | 'r' | 'm';

export interface Situation {
  rate: (t: number) => number;
  /** exakte Änderung ∫₀ᵗ r(u) du */
  change: (t: number) => number;
  /** Ende des Zeitraums */
  T: number;
  /** exakt ∫₀ᵗ |r(u)| du (falls bekannt; sonst numerisch über distance()) */
  abs?: (t: number) => number;
  /** Knickstellen der Rate (dort ist B nur einseitig differenzierbar) */
  kinks?: number[];
}

const PI = Math.PI;
const clampT = (t: number, T: number) => Math.max(0, Math.min(T, t));

/* ---------------------------------------------------------------------------
 * Streckenzug als Rate: stückweise linear, Integrale exakt (Trapezflächen)
 * ------------------------------------------------------------------------- */

/**
 * Fläche unter einer Strecke von (0 | ya) bis (w | yb): orientiert
 * (Trapez) oder als Betrag (bei Vorzeichenwechsel zwei Dreiecke).
 */
export function segmentArea(ya: number, yb: number, w: number, absolute = false): number {
  if (w <= 0) return 0;
  if (!absolute) return ((ya + yb) / 2) * w;
  if (ya * yb >= 0) return (Math.abs(ya + yb) / 2) * w;
  const f = ya / (ya - yb);
  return (Math.abs(ya) * f * w) / 2 + (Math.abs(yb) * (1 - f) * w) / 2;
}

/**
 * Rate als Streckenzug durch die Punkte (tᵢ | rᵢ) mit t₀ = 0 < t₁ < …
 * Bestand und Betragsintegral sind exakte Summen von Trapez- bzw.
 * Dreiecksflächen.
 */
export function polylineSituation(knots: readonly (readonly [number, number])[]): Situation {
  const n = knots.length - 1;
  const T = knots[n]![0];
  const rate = (t: number): number => {
    const tc = clampT(t, T);
    for (let i = 0; i < n; i++) {
      const [a, ya] = knots[i]!;
      const [b, yb] = knots[i + 1]!;
      if (tc <= b || i === n - 1) {
        const f = b > a ? (tc - a) / (b - a) : 0;
        return ya + (yb - ya) * f;
      }
    }
    return knots[n]![1];
  };
  const integrate = (t: number, absolute: boolean): number => {
    const tc = clampT(t, T);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const [a, ya] = knots[i]!;
      if (tc <= a) break;
      const b = Math.min(tc, knots[i + 1]![0]);
      sum += segmentArea(ya, rate(b), b - a, absolute);
    }
    return sum;
  };
  return {
    rate,
    change: (t) => integrate(t, false),
    abs: (t) => integrate(t, true),
    T,
    kinks: knots.slice(1, -1).map((k) => k[0]),
  };
}

/** Abstand der Stützstellen bei der eigenen Rate (Minuten). */
export const OWN_STEP = 10;

/**
 * Eigene Zuflussrate: Streckenzug durch die Punkte (0 | r₀), (10 | r₁), …
 * Das Integral eines Streckenzugs ist eine Summe von Trapezflächen – also
 * exakt berechenbar.
 */
export function ownSituation(values: readonly number[]): Situation {
  return polylineSituation(values.map((v, i) => [i * OWN_STEP, v] as const));
}

/** Knoten der Fahrt „vor und zurück“: 60 m vorwärts, dann 30 m rückwärts. */
export const BACK_KNOTS: readonly (readonly [number, number])[] = [
  [0, 0],
  [5, 4],
  [15, 4],
  [20, 0],
  [25, -2],
  [35, -2],
  [40, 0],
];

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
    // v ≥ 0: Weg und Gesamtänderung stimmen überein
    abs: (t) => SITS.car.change(t),
    kinks: [10, 40, 50],
  },
  // Wassertank: Zufluss 4 L/min, linear abnehmend, ab 20 min Abfluss
  tank: {
    rate: (t) => 4 - 0.2 * t,
    change: (t) => 4 * t - 0.1 * t * t,
    T: 40,
    // bis 20 min fließen 40 L zu, danach fließen 0,1 · (t − 20)² Liter ab
    abs: (t) => (t <= 20 ? 4 * t - 0.1 * t * t : 40 + 0.1 * (t - 20) * (t - 20)),
  },
  // Radfahrt mit schwankender Geschwindigkeit (immer ≥ 2 m/s)
  bike: {
    rate: (t) => 5 + 3 * Math.sin((PI * t) / 30),
    change: (t) => 5 * t + (90 / PI) * (1 - Math.cos((PI * t) / 30)),
    T: 120,
    abs: (t) => SITS.bike.change(t),
  },
  // Rangieren: 20 s vorwärts (bis 4 m/s), dann 20 s rückwärts (bis 2 m/s)
  back: polylineSituation(BACK_KNOTS),
};

/* ---------------------------------------------------------------------------
 * Rechtecksummen
 * ------------------------------------------------------------------------- */

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

/** Höhen r(tᵢ) der n Rechtecke (für die Rechnung „Δt · (r(t₀) + r(t₁) + …)“). */
export function sampleHeights(s: Situation, t: number, n: number, rule: Rule = 'l'): number[] {
  if (n <= 0 || t <= 0) return [];
  const dt = t / n;
  return Array.from({ length: n }, (_, i) => s.rate(samplePoint(i, dt, rule)));
}

/** Alle drei Rechtecksummen und das exakte Integral auf [0; t]. */
export function ruleSums(s: Situation, t: number, n: number): { l: number; r: number; m: number; exact: number } {
  return { l: riemannSum(s, t, n, 'l'), r: riemannSum(s, t, n, 'r'), m: riemannSum(s, t, n, 'm'), exact: s.change(t) };
}

/** Streifenzahlen beim Verdoppeln. */
export const DOUBLING = [1, 2, 4, 8, 16, 32, 64] as const;

/** Nächste Streifenzahl beim Verdoppeln (0 → 1, dann · 2, höchstens max). */
export function nextDouble(n: number, max = 64): number {
  return n <= 0 ? 1 : Math.min(max, n * 2);
}

/** Fehler der Rechtecksumme für mehrere Streifenzahlen (Standard: 1, 2, 4, …, 64). */
export function errorLadder(s: Situation, t: number, rule: Rule, ns: readonly number[] = DOUBLING): { n: number; sum: number; err: number }[] {
  const exact = s.change(t);
  return ns.map((n) => {
    const sum = riemannSum(s, t, n, rule);
    return { n, sum, err: sum - exact };
  });
}

/**
 * Ist die Rate auf [a; b] monoton? 'inc' (wachsend), 'dec' (fallend),
 * 'const' (konstant) oder null. Dann schließen linke und rechte Summe das
 * Integral ein.
 */
export function monotony(s: Situation, a: number, b: number, steps = 400): 'inc' | 'dec' | 'const' | null {
  if (!(b > a)) return null;
  let up = false;
  let down = false;
  let prev = s.rate(a);
  for (let i = 1; i <= steps; i++) {
    const v = s.rate(a + ((b - a) * i) / steps);
    if (v > prev + 1e-12) up = true;
    if (v < prev - 1e-12) down = true;
    prev = v;
  }
  if (up && down) return null;
  return up ? 'inc' : down ? 'dec' : 'const';
}

/* ---------------------------------------------------------------------------
 * Flächen, Betrag, Extremstellen
 * ------------------------------------------------------------------------- */

/** Flächenanteile oberhalb (pos) und unterhalb (neg ≤ 0) der Zeitachse auf [0; t]. */
export function signedAreas(s: Situation, t: number, steps = 2000): { pos: number; neg: number } {
  if (t <= 0) return { pos: 0, neg: 0 };
  if (s.abs) {
    // exakt: ∫ r = pos + neg und ∫ |r| = pos − neg; wie bei distance()
    // nur bis zum Ende T des Zeitraums (dahinter ist die Situation zu Ende)
    const tc = Math.min(t, s.T);
    const c = s.change(tc);
    const a = s.abs(tc);
    const pos = (a + c) / 2;
    const neg = (c - a) / 2;
    return { pos: Math.abs(pos) < 1e-12 ? 0 : pos, neg: Math.abs(neg) < 1e-12 ? 0 : neg };
  }
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
 * Insgesamt zurückgelegter Weg bzw. insgesamt bewegte Menge ∫₀ᵗ |r(u)| du
 * (exakt, falls bekannt, sonst Mittelpunktsregel).
 */
export function distance(s: Situation, t: number, steps = 4000): number {
  if (t <= 0) return 0;
  if (s.abs) return s.abs(Math.min(t, s.T));
  const h = t / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) sum += Math.abs(s.rate((i + 0.5) * h)) * h;
  return sum;
}

/** Mittlere Änderungsrate auf [0; t]: Gesamtänderung durch Zeit (z. B. Durchschnittsgeschwindigkeit). */
export function meanRate(s: Situation, t: number): number {
  return t > 0 ? s.change(t) / t : s.rate(0);
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

/** Kleinster und größter Wert der Rate auf [0; T]. */
export function rateExtent(s: Situation, steps = 400): { lo: number; hi: number } {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= steps; i++) {
    const v = s.rate((s.T * i) / steps);
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return { lo, hi };
}

/** Kleinster und größter Bestand B(t) = b0 + ∫₀ᵗ r auf [0; T]. */
export function stockExtent(s: Situation, b0: number, steps = 400): { lo: number; hi: number } {
  let lo = b0;
  let hi = b0;
  for (let i = 0; i <= steps; i++) {
    const v = b0 + s.change((s.T * i) / steps);
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  for (const e of signChanges(s)) {
    const v = b0 + s.change(e.t);
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return { lo, hi };
}

/** Erster Zeitpunkt in [0; T], an dem der Bestand unter 0 fällt (Tank leer), sonst null. */
export function emptyAt(s: Situation, b0: number, steps = 800): number | null {
  if (b0 < 0) return 0;
  let prev = 0;
  for (let i = 1; i <= steps; i++) {
    const t = (s.T * i) / steps;
    if (b0 + s.change(t) < -1e-9) {
      let a = prev;
      let b = t;
      for (let k = 0; k < 60; k++) {
        const m = (a + b) / 2;
        if (b0 + s.change(m) < 0) b = m;
        else a = m;
      }
      return (a + b) / 2;
    }
    prev = t;
  }
  return null;
}

/** Ein Streifen-Rechteck als Rechteck in Weltkoordinaten (l, r, Höhe, Stelle der Höhe). */
export function boxes(s: Situation, t: number, n: number, rule: Rule = 'l'): { l: number; r: number; h: number; at: number }[] {
  if (n <= 0 || t <= 0) return [];
  const dt = t / n;
  return Array.from({ length: n }, (_, i) => {
    const at = samplePoint(i, dt, rule);
    return { l: i * dt, r: (i + 1) * dt, h: s.rate(at), at };
  });
}
