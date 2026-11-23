/**
 * Rechenlogik für Wachstumsmodelle: linear, exponentiell, beschränkt und
 * logistisch – explizit (Funktionsterm) und rekursiv (Schritt für Schritt),
 * Änderungsraten, Kennwerte (Verdopplungszeit, Wendestelle …), Kennzeichen
 * in Tabellen (Differenzen, Quotienten) und Anpassen an Messdaten.
 * Geprüft in tests/wachstumsmodelle.test.ts.
 */

export type ModelKind = 'linear' | 'exp' | 'bounded' | 'logistic';

export interface Params {
  /** Anfangsbestand B(0). */
  B0: number;
  /** Zunahme pro Zeitschritt (linear). */
  d: number;
  /** Wachstumskonstante k bzw. r (exponentiell, beschränkt, logistisch). */
  k: number;
  /** Sättigungsgrenze S (beschränkt, logistisch). */
  S: number;
}

/* ------------------------------------------------------------------ */
/* Explizit                                                             */
/* ------------------------------------------------------------------ */

/** Bestand B(t) nach der expliziten Formel. */
export function value(kind: ModelKind, p: Params, t: number): number {
  switch (kind) {
    case 'linear':
      return p.B0 + p.d * t;
    case 'exp':
      return p.B0 * Math.exp(p.k * t);
    case 'bounded':
      return p.S - (p.S - p.B0) * Math.exp(-p.k * t);
    case 'logistic':
      if (p.B0 <= 0) return 0;
      return p.S / (1 + ((p.S - p.B0) / p.B0) * Math.exp(-p.k * t));
  }
}

/**
 * Änderungsrate B′(t) bzw. Differenzialgleichung:
 * linear B′ = d, exponentiell B′ = k·B, beschränkt B′ = k·(S − B),
 * logistisch B′ = k·B·(1 − B/S).
 */
export function rate(kind: ModelKind, p: Params, B: number): number {
  switch (kind) {
    case 'linear':
      return p.d;
    case 'exp':
      return p.k * B;
    case 'bounded':
      return p.k * (p.S - B);
    case 'logistic':
      return p.k * B * (1 - B / p.S);
  }
}

/* ------------------------------------------------------------------ */
/* Rekursiv                                                             */
/* ------------------------------------------------------------------ */

/**
 * Rekursive Folge mit Zeitschritt 1:
 * linear B(n+1) = B(n) + d, exponentiell B(n+1) = a·B(n) mit a = e^k,
 * beschränkt B(n+1) = B(n) + c·(S − B(n)) mit c = 1 − e^(−k) (stimmt an den
 * ganzen Stellen exakt mit der Formel überein), logistisch (diskret)
 * B(n+1) = B(n) + r·B(n)·(1 − B(n)/S).
 */
export function recursive(kind: ModelKind, p: Params, steps: number): number[] {
  const out = [p.B0];
  let B = p.B0;
  for (let n = 0; n < steps; n++) {
    switch (kind) {
      case 'linear':
        B = B + p.d;
        break;
      case 'exp':
        B = B * Math.exp(p.k);
        break;
      case 'bounded':
        B = B + (1 - Math.exp(-p.k)) * (p.S - B);
        break;
      case 'logistic':
        B = B + p.k * B * (1 - B / p.S);
        break;
    }
    out.push(B);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Kennwerte                                                            */
/* ------------------------------------------------------------------ */

/** Verdopplungszeit (k > 0) bzw. Halbwertszeit (k < 0) beim exponentiellen Modell. */
export const doublingTime = (k: number) => Math.log(2) / Math.abs(k);

/** Wachstumsfaktor pro Zeitschritt a = e^k und prozentuale Änderung. */
export const growthFactor = (k: number) => Math.exp(k);

/** Beschränkt: Zeit, bis der Abstand zu S auf die Hälfte geschrumpft ist. */
export const halfGapTime = (k: number) => Math.log(2) / k;

/** Logistisch: Wendestelle t_w (dort ist B = S/2 und die Zunahme am größten). */
export function inflection(p: Params): { t: number; B: number; rate: number } | null {
  if (p.B0 <= 0 || p.B0 >= p.S || p.k <= 0) return null;
  return { t: Math.log((p.S - p.B0) / p.B0) / p.k, B: p.S / 2, rate: (p.k * p.S) / 4 };
}

/** Zeitpunkt, zu dem der Bestand den Wert target erreicht (oder null). */
export function timeTo(kind: ModelKind, p: Params, target: number): number | null {
  let t: number;
  switch (kind) {
    case 'linear':
      if (p.d === 0) return null;
      t = (target - p.B0) / p.d;
      break;
    case 'exp':
      if (target / p.B0 <= 0 || p.k === 0) return null;
      t = Math.log(target / p.B0) / p.k;
      break;
    case 'bounded':
      if ((p.S - target) / (p.S - p.B0) <= 0) return null;
      t = -Math.log((p.S - target) / (p.S - p.B0)) / p.k;
      break;
    case 'logistic': {
      if (target <= 0 || target >= p.S || p.B0 <= 0) return null;
      t = Math.log(((p.S - p.B0) / p.B0) * (target / (p.S - target))) / p.k;
      break;
    }
  }
  return Number.isFinite(t) && t >= 0 ? t : null;
}

/* ------------------------------------------------------------------ */
/* Kennzeichen in Tabellen                                              */
/* ------------------------------------------------------------------ */

export interface TableRow {
  t: number;
  B: number;
  /** Differenz zum Vorgänger ΔB. */
  diff: number | null;
  /** Quotient zum Vorgänger B(t)/B(t−1). */
  quot: number | null;
  /** ΔB / (S − B_vorher) (beschränkt) bzw. ΔB / (B·(S − B)) (logistisch). */
  ratio: number | null;
}

export function table(kind: ModelKind, p: Params, n: number, dt = 1): TableRow[] {
  const rows: TableRow[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    const B = value(kind, p, t);
    const prev = i > 0 ? rows[i - 1]!.B : null;
    const diff = prev === null ? null : B - prev;
    rows.push({
      t,
      B,
      diff,
      quot: prev === null || prev === 0 ? null : B / prev,
      ratio:
        prev === null || diff === null
          ? null
          : kind === 'bounded'
            ? diff / (p.S - prev)
            : kind === 'logistic'
              ? diff / (prev * (p.S - prev))
              : null,
    });
  }
  return rows;
}

/**
 * Welches Modell passt zu einer Wertetabelle (gleiche Zeitschritte)?
 * Prüft konstante Differenzen, konstante Quotienten, ΔB proportional zum
 * Abstand zu einer Grenze (S geschätzt) – sonst null.
 */
export function classify(values: readonly number[], tol = 0.02): ModelKind | null {
  if (values.length < 4) return null;
  const d = values.slice(1).map((v, i) => v - values[i]!);
  const q = values.slice(1).map((v, i) => v / values[i]!);
  const near = (arr: number[]) => {
    const m = arr.reduce((s, v) => s + v, 0) / arr.length;
    return arr.every((v) => Math.abs(v - m) <= tol * Math.max(1e-9, Math.abs(m)));
  };
  if (near(d)) return 'linear';
  if (near(q)) return 'exp';
  // beschränkt: Differenzen fallen mit konstantem Quotienten
  const dq = d.slice(1).map((v, i) => v / d[i]!);
  if (dq.every((v) => v > 0 && v < 1) && near(dq)) return 'bounded';
  // logistisch: Differenzen steigen erst, dann fallen
  const maxI = d.indexOf(Math.max(...d));
  if (maxI > 0 && maxI < d.length - 1 && d.every((v) => v > 0)) return 'logistic';
  return null;
}

/* ------------------------------------------------------------------ */
/* Anpassen an Daten                                                    */
/* ------------------------------------------------------------------ */

export interface DataPoint {
  t: number;
  B: number;
}

/** Summe der quadrierten Abweichungen. */
export function sse(kind: ModelKind, p: Params, data: readonly DataPoint[]): number {
  return data.reduce((s, d) => s + (value(kind, p, d.t) - d.B) ** 2, 0);
}

/**
 * Passt die freien Parameter eines Modells an (Nelder-Mead, einfache
 * Startwerte aus den Daten). Liefert die besten Parameter und die SSE.
 */
export function fit(kind: ModelKind, data: readonly DataPoint[], start: Params): { p: Params; sse: number } {
  const keys: (keyof Params)[] = kind === 'linear' ? ['B0', 'd'] : kind === 'exp' ? ['B0', 'k'] : ['B0', 'k', 'S'];
  const toP = (x: number[]): Params => {
    const p = { ...start };
    keys.forEach((k, i) => (p[k] = x[i]!));
    return p;
  };
  const f = (x: number[]) => {
    const p = toP(x);
    if ((kind === 'bounded' || kind === 'logistic') && (p.S <= 0 || p.k <= 0)) return 1e30;
    if (kind === 'logistic' && (p.B0 <= 0 || p.B0 >= p.S)) return 1e30;
    const v = sse(kind, p, data);
    return Number.isFinite(v) ? v : 1e30;
  };
  // Startwerte
  const first = data[0]!;
  const last = data[data.length - 1]!;
  const maxB = Math.max(...data.map((d) => d.B));
  const x0 = keys.map((k) => {
    if (k === 'B0') return first.B;
    if (k === 'd') return (last.B - first.B) / Math.max(1e-9, last.t - first.t);
    if (k === 'S') return maxB * 1.1;
    return kind === 'exp' ? Math.log(Math.max(1e-9, last.B / first.B)) / Math.max(1e-9, last.t - first.t) : 0.3;
  });
  const best = nelderMead(f, x0, 2500);
  return { p: toP(best), sse: f(best) };
}

/** Nelder-Mead-Verfahren (minimiert f), ohne Ableitungen. */
export function nelderMead(f: (x: number[]) => number, x0: number[], iters = 2000): number[] {
  const n = x0.length;
  let simplex = [x0, ...x0.map((_, i) => x0.map((v, j) => (i === j ? (v === 0 ? 0.1 : v * 1.2) : v)))];
  let vals = simplex.map(f);
  for (let it = 0; it < iters; it++) {
    const order = vals.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
    simplex = order.map(([, i]) => simplex[i]!);
    vals = order.map(([v]) => v);
    if (Math.abs(vals[n]! - vals[0]!) < 1e-12 * (1 + Math.abs(vals[0]!))) break;
    const c = Array.from({ length: n }, (_, j) => simplex.slice(0, n).reduce((s, p) => s + p[j]!, 0) / n);
    const worst = simplex[n]!;
    const xr = c.map((v, j) => v + (v - worst[j]!));
    const fr = f(xr);
    if (fr < vals[0]!) {
      const xe = c.map((v, j) => v + 2 * (v - worst[j]!));
      const fe = f(xe);
      if (fe < fr) {
        simplex[n] = xe;
        vals[n] = fe;
      } else {
        simplex[n] = xr;
        vals[n] = fr;
      }
    } else if (fr < vals[n - 1]!) {
      simplex[n] = xr;
      vals[n] = fr;
    } else {
      const xc = c.map((v, j) => v + 0.5 * (worst[j]! - v));
      const fc = f(xc);
      if (fc < vals[n]!) {
        simplex[n] = xc;
        vals[n] = fc;
      } else {
        // schrumpfen
        const b = simplex[0]!;
        simplex = simplex.map((p, i) => (i === 0 ? p : p.map((v, j) => b[j]! + 0.5 * (v - b[j]!))));
        vals = simplex.map(f);
      }
    }
  }
  let bi = 0;
  for (let i = 1; i <= n; i++) if (vals[i]! < vals[bi]!) bi = i;
  return simplex[bi]!;
}

/* ------------------------------------------------------------------ */
/* Beispieldaten (ausgedacht, aber typisch)                             */
/* ------------------------------------------------------------------ */

export interface Dataset {
  id: string;
  name: { de: string; en: string };
  unit: { de: string; en: string };
  time: { de: string; en: string };
  data: DataPoint[];
  /** Modell, aus dem die Daten (mit kleinem Rauschen) entstanden sind. */
  truth: ModelKind;
}

export const DATASETS: Dataset[] = [
  {
    id: 'sunflower',
    name: { de: 'Höhe einer Sonnenblume', en: 'Height of a sunflower' },
    unit: { de: 'cm', en: 'cm' },
    time: { de: 'Wochen', en: 'weeks' },
    truth: 'logistic',
    data: [
      { t: 0, B: 18 },
      { t: 1, B: 29 },
      { t: 2, B: 47 },
      { t: 3, B: 72 },
      { t: 4, B: 104 },
      { t: 5, B: 138 },
      { t: 6, B: 170 },
      { t: 7, B: 195 },
      { t: 8, B: 212 },
      { t: 9, B: 224 },
      { t: 10, B: 231 },
      { t: 11, B: 235 },
    ],
  },
  {
    id: 'tea',
    name: { de: 'Tee kühlt ab (Raum 20 °C)', en: 'Tea cooling down (room 20 °C)' },
    unit: { de: '°C', en: '°C' },
    time: { de: 'Minuten', en: 'minutes' },
    truth: 'bounded',
    data: [
      { t: 0, B: 90 },
      { t: 2, B: 77.5 },
      { t: 4, B: 67 },
      { t: 6, B: 58.5 },
      { t: 8, B: 51.6 },
      { t: 10, B: 45.8 },
      { t: 15, B: 35.6 },
      { t: 20, B: 29.4 },
      { t: 30, B: 23.5 },
    ],
  },
  {
    id: 'bacteria',
    name: { de: 'Bakterien in einer Nährlösung', en: 'Bacteria in a nutrient solution' },
    unit: { de: 'Tausend', en: 'thousand' },
    time: { de: 'Stunden', en: 'hours' },
    truth: 'exp',
    data: [
      { t: 0, B: 2 },
      { t: 1, B: 2.9 },
      { t: 2, B: 4.1 },
      { t: 3, B: 5.8 },
      { t: 4, B: 8.3 },
      { t: 5, B: 11.9 },
      { t: 6, B: 16.9 },
    ],
  },
  {
    id: 'savings',
    name: { de: 'Sparschwein (feste Einzahlung)', en: 'Piggy bank (fixed deposits)' },
    unit: { de: '€', en: '€' },
    time: { de: 'Monate', en: 'months' },
    truth: 'linear',
    data: [
      { t: 0, B: 40 },
      { t: 1, B: 55 },
      { t: 2, B: 70 },
      { t: 3, B: 85 },
      { t: 4, B: 100 },
      { t: 5, B: 115 },
      { t: 6, B: 130 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Eigene Messwerte und Rätsel                                          */
/* ------------------------------------------------------------------ */

/**
 * Liest Messwerte als Paare „t;B“ bzw. „t B“, getrennt durch Zeilenumbruch,
 * „|“ oder zwei Leerzeichen; Dezimalkomma erlaubt. Ohne t werden 0, 1, 2 …
 * angenommen („18 29 47“). Liefert null bei weniger als 3 Werten.
 */
export function parseData(src: string): DataPoint[] | null {
  const s = src.trim();
  if (!s) return null;
  const pairs = s.split(/\s*[|\n]\s*|\s{2,}|\s*\/\s*/).filter(Boolean);
  let out: DataPoint[] = [];
  const num = (x: string) => Number(x.replace(',', '.'));
  if (pairs.every((p) => /[;:]/.test(p))) {
    for (const p of pairs) {
      const [a, b] = p.split(/\s*[;:]\s*/);
      const t = num(a ?? '');
      const B = num(b ?? '');
      if (!Number.isFinite(t) || !Number.isFinite(B)) return null;
      out.push({ t, B });
    }
  } else {
    const vals = s.split(/[\s;|]+/).filter(Boolean).map(num);
    if (vals.some((v) => !Number.isFinite(v))) return null;
    out = vals.map((B, t) => ({ t, B }));
  }
  out.sort((a, b) => a.t - b.t);
  return out.length >= 3 ? out : null;
}

/** Zufällige Wertetabelle für das Rätsel „Welches Modell ist das?“ (gerundet). */
export function puzzle(rnd: () => number): { kind: ModelKind; p: Params; values: number[] } {
  const kinds: ModelKind[] = ['linear', 'exp', 'bounded', 'logistic'];
  const kind = kinds[Math.floor(rnd() * 4)]!;
  const B0 = [5, 10, 20, 40][Math.floor(rnd() * 4)]!;
  const p: Params = { B0, d: 3 + Math.floor(rnd() * 6), k: [0.15, 0.2, 0.3, 0.4][Math.floor(rnd() * 4)]!, S: B0 * (4 + Math.floor(rnd() * 4)) };
  if (kind === 'logistic') p.k = [0.5, 0.7, 0.9][Math.floor(rnd() * 3)]!;
  const values = Array.from({ length: 9 }, (_, t) => Math.round(value(kind, p, t) * 100) / 100);
  return { kind, p, values };
}

/* ------------------------------------------------------------------ */
/* Anwendungen                                                          */
/* ------------------------------------------------------------------ */

/** Zinseszins: K(n) = K₀·(1 + p/(100·m))^(m·n) bei m Zinsterminen pro Jahr. */
export const compound = (K0: number, pct: number, years: number, perYear = 1) => K0 * Math.pow(1 + pct / 100 / perYear, perYear * years);
/** Stetige Verzinsung K(t) = K₀·e^(p/100·t). */
export const continuousCompound = (K0: number, pct: number, t: number) => K0 * Math.exp((pct / 100) * t);
/** Einfache Verzinsung (ohne Zinseszins): K(n) = K₀·(1 + p/100·n) – linear. */
export const simpleInterest = (K0: number, pct: number, years: number) => K0 * (1 + (pct / 100) * years);
/** Faustregel: Verdopplung nach etwa 72/p Jahren. */
export const rule72 = (pct: number) => 72 / pct;
/** Genaue Verdopplungszeit bei jährlicher Verzinsung: n = ln 2 / ln(1 + p/100). */
export const exactDoubling = (pct: number) => Math.log(2) / Math.log(1 + pct / 100);

/**
 * Medikament: Alle τ Stunden wird die Dosis D eingenommen, dazwischen baut
 * der Körper exponentiell ab (Halbwertszeit h). Liefert den Verlauf der Menge
 * im Körper (direkt nach jeder Einnahme springt sie um D nach oben).
 */
export function doseCurve(D: number, halfLife: number, tau: number, hours: number, dt = 0.1): { t: number[]; c: number[] } {
  const lambda = Math.log(2) / halfLife;
  const t: number[] = [];
  const c: number[] = [];
  let amount = 0;
  let next = 0;
  for (let i = 0; i * dt <= hours + 1e-9; i++) {
    const time = i * dt;
    if (time >= next - 1e-9) {
      // Wert kurz vor der Einnahme, dann der Sprung
      t.push(time);
      c.push(amount);
      amount += D;
      next += tau;
    }
    t.push(time);
    c.push(amount);
    amount *= Math.exp(-lambda * dt);
  }
  return { t, c };
}
/** Restanteil nach τ Stunden q = 0,5^(τ/h). */
export const keepFraction = (halfLife: number, tau: number) => Math.pow(0.5, tau / halfLife);
/** Höchstwert im Gleichgewicht (direkt nach der Einnahme): D / (1 − q). */
export const steadyPeak = (D: number, halfLife: number, tau: number) => D / (1 - keepFraction(halfLife, tau));
/** Tiefstwert im Gleichgewicht (direkt vor der Einnahme): D·q / (1 − q). */
export const steadyTrough = (D: number, halfLife: number, tau: number) => steadyPeak(D, halfLife, tau) * keepFraction(halfLife, tau);
/** Höchstwert nach der n-ten Einnahme: D·(1 − qⁿ)/(1 − q) (geometrische Reihe). */
export const peakAfter = (D: number, halfLife: number, tau: number, n: number) => {
  const q = keepFraction(halfLife, tau);
  return (D * (1 - Math.pow(q, n))) / (1 - q);
};

/**
 * Gerücht in einer Schule mit N Personen (diskret logistisch): Jeden Tag
 * erzählen es die Wissenden weiter, neu informiert werden k·I·(N − I)/N.
 */
export function rumor(N: number, I0: number, k: number, days: number): number[] {
  const out = [I0];
  let I = I0;
  for (let d = 0; d < days; d++) {
    I = Math.min(N, I + (k * I * (N - I)) / N);
    out.push(I);
  }
  return out;
}

/** Newtonsches Abkühlungsgesetz: T(t) = T_U + (T₀ − T_U)·e^(−k·t). */
export const coolingTemp = (T0: number, Tr: number, k: number, t: number) => Tr + (T0 - Tr) * Math.exp(-k * t);
/** Zeit, bis die Temperatur T erreicht ist: t = ln((T₀ − T_U)/(T − T_U)) / k, sonst null. */
export function coolingTime(T0: number, Tr: number, k: number, T: number): number | null {
  if ((T0 - Tr) * (T - Tr) <= 0 || Math.abs(T - Tr) >= Math.abs(T0 - Tr)) return null;
  return Math.log((T0 - Tr) / (T - Tr)) / k;
}

/* ------------------------------------------------------------------ */
/* Spinnwebdiagramm (rekursive Folge als Treppe)                        */
/* ------------------------------------------------------------------ */

/** Ein Schritt der rekursiven Vorschrift B(n+1) = f(B(n)) wie in recursive(). */
export function stepFn(kind: ModelKind, p: Params, B: number): number {
  switch (kind) {
    case 'linear':
      return B + p.d;
    case 'exp':
      return B * Math.exp(p.k);
    case 'bounded':
      return B + (1 - Math.exp(-p.k)) * (p.S - B);
    case 'logistic':
      return B + p.k * B * (1 - B / p.S);
  }
}

/**
 * Treppenzug des Spinnwebdiagramms: (B₀|0) → (B₀|B₁) → (B₁|B₁) → (B₁|B₂) …
 */
export function cobweb(kind: ModelKind, p: Params, steps: number): [number, number][] {
  const pts: [number, number][] = [[p.B0, 0]];
  let B = p.B0;
  for (let n = 0; n < steps; n++) {
    const next = stepFn(kind, p, B);
    if (!Number.isFinite(next) || Math.abs(next) > 1e9) break;
    pts.push([B, next], [next, next]);
    B = next;
  }
  return pts;
}

/**
 * Verhalten der diskreten logistischen Folge abhängig von r = k (für
 * 0 < B₀ < S): monoton gegen S (r ≤ 1), gedämpft schwingend gegen S
 * (1 < r < 2), Zweier-Zyklus (2 < r < √6 ≈ 2,449), Viererzyklus und mehr
 * (bis ≈ 2,57), danach chaotisch, über 3 läuft sie aus dem Ruder.
 */
export function logisticBehaviour(r: number): 'decline' | 'monotone' | 'damped' | 'cycle2' | 'cycle4' | 'chaos' | 'explode' {
  if (r <= 0) return 'decline';
  if (r <= 1) return 'monotone';
  if (r < 2) return 'damped';
  if (r < Math.sqrt(6)) return 'cycle2';
  if (r < 2.5699) return 'cycle4';
  if (r <= 3) return 'chaos';
  return 'explode';
}

/* ------------------------------------------------------------------ */
/* Übung: Modell aus einem Text aufstellen                              */
/* ------------------------------------------------------------------ */

export interface Task {
  kind: ModelKind;
  /** Text mit Platzhaltern sind schon eingesetzt */
  de: string;
  en: string;
  answer: Params;
}

/** Textaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): Task {
  let s = (Math.floor(n) * 2654435761 + 97) >>> 0 || 1;
  const r = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(r() * xs.length) % xs.length]!;
  const type = Math.floor(r() * 6) % 6;
  const deNum = (v: number) => String(v).replace('.', ',');
  switch (type) {
    case 0: {
      const B0 = pick([200, 500, 800, 1000]);
      const T = pick([2, 3, 4, 5]);
      return {
        kind: 'exp',
        de: `Eine Bakterienkultur besteht anfangs aus ${B0} Bakterien und verdoppelt sich alle ${T} Stunden (t in Stunden).`,
        en: `A culture starts with ${B0} bacteria and doubles every ${T} hours (t in hours).`,
        answer: { B0, d: 0, k: Math.log(2) / T, S: 100 },
      };
    }
    case 1: {
      const B0 = pick([80, 100, 120, 200]);
      const T = pick([4, 5, 6, 8]);
      return {
        kind: 'exp',
        de: `Im Blut sind ${B0} mg eines Wirkstoffs. Die Menge halbiert sich alle ${T} Stunden.`,
        en: `There are ${B0} mg of a drug in the blood. The amount halves every ${T} hours.`,
        answer: { B0, d: 0, k: -Math.log(2) / T, S: 100 },
      };
    }
    case 2: {
      const B0 = pick([20, 24, 30]);
      const d = pick([1.5, 2, 2.5, 3]);
      return {
        kind: 'linear',
        de: `Eine Kerze ist ${B0} cm hoch und brennt pro Stunde ${deNum(d)} cm ab.`,
        en: `A candle is ${B0} cm tall and burns down ${d} cm per hour.`,
        answer: { B0, d: -d, k: 0, S: 100 },
      };
    }
    case 3: {
      const B0 = pick([5, 8, 10]);
      const S = pick([20, 22, 25]);
      const pct = pick([10, 20, 30]);
      return {
        kind: 'bounded',
        de: `Ein Getränk mit ${B0} °C steht in einem Raum mit ${S} °C. Pro Minute verringert sich der Abstand zur Raumtemperatur um ${pct} %.`,
        en: `A drink at ${B0} °C stands in a room at ${S} °C. Each minute the gap to room temperature shrinks by ${pct} %.`,
        answer: { B0, d: 0, k: -Math.log(1 - pct / 100), S },
      };
    }
    case 4: {
      const S = pick([100, 200, 500]);
      const B0 = pick([2, 5, 10]);
      const pct = pick([30, 40, 50, 60]);
      return {
        kind: 'logistic',
        de: `Auf einem Teich haben höchstens ${S} Seerosen Platz. Anfangs sind es ${B0}; solange es wenige sind, nimmt ihre Zahl pro Tag um etwa ${pct} % zu (diskret logistisch, k = Zuwachsrate).`,
        en: `A pond has room for at most ${S} water lilies. At first there are ${B0}; while they are few, their number grows by about ${pct} % per day (discrete logistic, k = growth rate).`,
        answer: { B0, d: 0, k: pct / 100, S },
      };
    }
    default: {
      const B0 = pick([500, 1000, 2000]);
      const pct = pick([2, 3, 4, 5]);
      return {
        kind: 'exp',
        de: `Ein Guthaben von ${B0} € wird jährlich mit ${pct} % verzinst (t in Jahren).`,
        en: `A balance of €${B0} earns ${pct} % interest per year (t in years).`,
        answer: { B0, d: 0, k: Math.log(1 + pct / 100), S: 100 },
      };
    }
  }
}

/**
 * Prüft eine Antwort: Art muss stimmen, die nötigen Größen bis auf 3 %
 * (bzw. 0,01 bei k, 0,5 bei d, 1 bei B₀ und S). Liefert die falschen Größen.
 */
export function checkTask(t: Task, kind: ModelKind, p: Params): { ok: boolean; wrong: string[] } {
  const wrong: string[] = [];
  if (kind !== t.kind) return { ok: false, wrong: ['kind'] };
  const near = (a: number, b: number, abs: number) => Math.abs(a - b) <= Math.max(abs, Math.abs(b) * 0.03);
  if (!near(p.B0, t.answer.B0, 1)) wrong.push('B0');
  if (t.kind === 'linear' && !near(p.d, t.answer.d, 0.5)) wrong.push('d');
  if (t.kind !== 'linear' && !near(p.k, t.answer.k, 0.01)) wrong.push('k');
  if ((t.kind === 'bounded' || t.kind === 'logistic') && !near(p.S, t.answer.S, 1)) wrong.push('S');
  return { ok: wrong.length === 0, wrong };
}
