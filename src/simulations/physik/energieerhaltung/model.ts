/**
 * Rechenlogik „Energieerhaltung an der Achterbahn“.
 *
 * Die Bahn ist eine Kurve in der Ebene, parametrisiert über die Bogenlänge s.
 * Der Wagen (Massenpunkt) bewegt sich entlang der Bahn:
 *   s'' = −g·sin θ − μ·|N|·sign(s')   mit   N = g·cos θ + v²·κ
 * (θ: Steigungswinkel, κ: Krümmung, N: Normalbeschleunigung durch die Schiene).
 * Die Reibungsarbeit pro kg wächst mit dW/dt = μ·|N|·|v|.
 *
 * Alle Energien werden pro kg gerechnet (J/kg) und erst in der Anzeige mit
 * der Masse m multipliziert – daran sieht man, dass v nicht von m abhängt.
 */
import { rk4 } from '../../../sim-core/numeric';

/** Ortsfaktor in m/s². */
export const G = 9.81;

/** Radius des Loopings in m. */
export const LOOP_RADIUS = 6;

/** Toleranz beim Abheben (Anteil von g) gegen Rundungsfehler der numerischen Fahrt. */
export const LIFT_TOL = 0.02;

export type TrackId = 'tal' | 'huegel' | 'looping' | 'eigen';

/** Waagerechte Lage der Stützpunkte der eigenen Bahn: Start, Punkte 1–4. */
export const CUSTOM_X = [-42, -26, -10, 6, 22] as const;
/** Höhe der Endwand der eigenen Bahn (höher als jede mögliche Starthöhe). */
const CUSTOM_WALL = 28;

export interface TrackPoint {
  x: number;
  y: number;
  /** Bogenlänge ab dem Anfang in m. */
  s: number;
  /** Steigungswinkel der Tangente (Bogenmaß). */
  theta: number;
  /** Krümmung dθ/ds in 1/m (positiv = Linkskurve). */
  kappa: number;
}

/** Besondere Stellen einer Bahn (Bogenlänge in m). */
export interface TrackFeatures {
  /** Höchster Punkt des Loopings. */
  loopTop?: number;
  /** Anfang und Ende des Kreises. */
  loopStart?: number;
  loopEnd?: number;
  /** Bogenlängen der Stützpunkte der eigenen Bahn. */
  supports?: number[];
}

export class Track {
  readonly points: TrackPoint[];
  readonly length: number;
  features: TrackFeatures = {};

  constructor(raw: readonly (readonly [number, number])[]) {
    const pts: TrackPoint[] = [];
    let s = 0;
    raw.forEach(([x, y], i) => {
      if (i > 0) {
        const [px, py] = raw[i - 1]!;
        const d = Math.hypot(x - px, y - py);
        if (d < 1e-9) return;
        s += d;
      }
      pts.push({ x, y, s, theta: 0, kappa: 0 });
    });
    // Tangentenwinkel (stetig fortgesetzt, damit der Looping keine Sprünge hat)
    let previous = 0;
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)]!;
      const b = pts[Math.min(pts.length - 1, i + 1)]!;
      let theta = Math.atan2(b.y - a.y, b.x - a.x);
      if (i > 0) while (theta - previous > Math.PI) theta -= 2 * Math.PI;
      if (i > 0) while (theta - previous < -Math.PI) theta += 2 * Math.PI;
      p.theta = theta;
      previous = theta;
    });
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)]!;
      const b = pts[Math.min(pts.length - 1, i + 1)]!;
      p.kappa = b.s > a.s ? (b.theta - a.theta) / (b.s - a.s) : 0;
    });
    this.points = pts;
    this.length = s;
  }

  /** Index des Abschnitts, in dem s liegt (binäre Suche). */
  private index(s: number): number {
    const pts = this.points;
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid]!.s <= s) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  /** Lage, Steigungswinkel und Krümmung an der Stelle s. */
  at(s: number): Omit<TrackPoint, 's'> {
    const pts = this.points;
    const clamped = Math.min(this.length, Math.max(0, s));
    const i = this.index(clamped);
    const a = pts[i]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    const u = b.s > a.s ? (clamped - a.s) / (b.s - a.s) : 0;
    return {
      x: a.x + u * (b.x - a.x),
      y: a.y + u * (b.y - a.y),
      theta: a.theta + u * (b.theta - a.theta),
      kappa: a.kappa + u * (b.kappa - a.kappa),
    };
  }

  /** Erste Stelle (von links), an der die Bahn die Höhe h erreicht bzw. unterschreitet. */
  startAt(h: number): number {
    const pts = this.points;
    if (pts[0]!.y <= h) return 0;
    for (let i = 1; i < pts.length; i++) {
      const b = pts[i]!;
      if (b.y <= h) {
        const a = pts[i - 1]!;
        const u = (a.y - h) / (a.y - b.y || 1);
        return a.s + u * (b.s - a.s);
      }
    }
    return 0;
  }

  /** Bogenlänge des tiefsten Punkts vor dem ersten Wiederanstieg (Ende der Startrampe). */
  get firstValley(): number {
    const pts = this.points;
    let best = 0;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i]!.y > pts[best]!.y + 1e-6) break;
      if (pts[i]!.y <= pts[best]!.y) best = i;
    }
    return pts[best]!.s;
  }

  /** Nächster Bahnpunkt zu (x, y) im Bereich s ∈ [from, to]. */
  nearest(x: number, y: number, from = 0, to = Infinity): { s: number; d: number } {
    let best = { s: 0, d: Infinity };
    for (const q of this.points) {
      if (q.s < from || q.s > to) continue;
      const d = Math.hypot(q.x - x, q.y - y);
      if (d < best.d) best = { s: q.s, d };
    }
    return best;
  }

  /** Höchster Punkt im Inneren der Bahn (ohne Startrampe und Endwand): der „große Hügel“. */
  get crest(): { s: number; y: number } | null {
    const pts = this.points;
    const from = this.firstValley;
    let best: { s: number; y: number } | null = null;
    for (let i = 1; i < pts.length - 1; i++) {
      const q = pts[i]!;
      if (q.s <= from) continue;
      // nur echte Hochpunkte (Nachbarn niedriger oder gleich)
      if (q.y >= pts[i - 1]!.y && q.y >= pts[i + 1]!.y && (!best || q.y > best.y + 1e-9)) best = { s: q.s, y: q.y };
    }
    return best;
  }

  get maxHeight(): number {
    return Math.max(...this.points.map((p) => p.y));
  }

  get minHeight(): number {
    return Math.min(...this.points.map((p) => p.y));
  }
}

/** Hermite-Kurve zwischen zwei Punkten mit waagerechten Enden (bzw. Startsteigung m0). */
function hermite(x0: number, y0: number, x1: number, y1: number, n: number, m0 = 0): [number, number][] {
  const dx = x1 - x0;
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const h00 = 2 * u ** 3 - 3 * u * u + 1;
    const h10 = u ** 3 - 2 * u * u + u;
    const h01 = -2 * u ** 3 + 3 * u * u;
    return [x0 + dx * u, h00 * y0 + h10 * dx * m0 + h01 * y1];
  });
}

/** Catmull-Rom-Spline durch Kontrollpunkte. */
function catmullRom(points: readonly (readonly [number, number])[], perSegment: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    for (let j = 0; j < perSegment; j++) {
      const t = j / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, c2: number, d: number) =>
        0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push([...points[points.length - 1]!] as [number, number]);
  return out;
}

/** Standardhöhen der eigenen Bahn: Start h₀, dann Punkte 1–4. */
export const CUSTOM_DEFAULT = [20, 2, 14, 3, 10] as const;

/**
 * Eigene Bahn aus fünf Höhen (Start, Punkte 1–4). Zwischen den Punkten liegen
 * glatte Bögen mit waagerechten Tangenten an den Stützpunkten – jeder Punkt ist
 * damit genau ein Hügel, ein Tal oder eine Stufe. Der Start fällt schräg zu
 * Punkt 1 ab, hinter Punkt 4 steigt eine hohe Wand an.
 */
export function customTrack(heights: readonly number[]): Track {
  const h = CUSTOM_X.map((_, i) => heights[i] ?? CUSTOM_DEFAULT[i]!);
  const raw: [number, number][] = [];
  // Start: Steigung zur Hälfte zwischen Sekante und Monotoniegrenze (kein Überschwingen)
  const dx0 = CUSTOM_X[1] - CUSTOM_X[0];
  raw.push(...hermite(CUSTOM_X[0], h[0]!, CUSTOM_X[1], h[1]!, 160, (1.5 * (h[1]! - h[0]!)) / dx0));
  for (let i = 1; i < CUSTOM_X.length - 1; i++) raw.push(...hermite(CUSTOM_X[i]!, h[i]!, CUSTOM_X[i + 1]!, h[i + 1]!, 160).slice(1));
  raw.push(...hermite(CUSTOM_X[4], h[4]!, CUSTOM_X[4] + 18, CUSTOM_WALL, 160).slice(1));
  const track = new Track(raw);
  track.features.supports = CUSTOM_X.map((x, i) => track.nearest(x, h[i]!).s);
  return track;
}

export function buildTrack(id: TrackId, custom?: readonly number[]): Track {
  switch (id) {
    case 'tal':
      // Parabel y = x²/20: Rand bei ±23,5 m in 27,6 m Höhe
      return new Track(
        Array.from({ length: 941 }, (_, i) => {
          const x = -23.5 + (47 * i) / 940;
          return [x, 20 * (x / 20) ** 2] as [number, number];
        }),
      );
    case 'huegel':
      return new Track(
        catmullRom(
          [
            [-37, 27.5],
            [-31.5, 21],
            [-24, 9],
            [-16, 0.5],
            [-8, 6],
            [-2, 11],
            [4, 7],
            [11, 1],
            [17, 4],
            [23, 9],
            [28.5, 17],
            [31.5, 27.5],
          ],
          80,
        ),
      );
    case 'looping': {
      // Anfahrt, ein genauer Kreis (Radius r, unten tangential), Auslauf und Rampe
      const r = LOOP_RADIUS;
      const approach = hermite(-40, 27.5, 0, 0, 500);
      const loop: [number, number][] = Array.from({ length: 720 }, (_, i) => {
        const phi = (2 * Math.PI * (i + 1)) / 720;
        return [r * Math.sin(phi), r * (1 - Math.cos(phi))];
      });
      // Auslauf beginnt knapp hinter dem Tiefpunkt (Bahn kreuzt sich dort)
      const flat: [number, number][] = Array.from({ length: 60 }, (_, i) => [0.2 * (i + 1), 0]);
      const ramp = hermite(12, 0, 40, 27.5, 400).slice(1);
      const track = new Track([...approach, ...loop, ...flat, ...ramp]);
      const start = track.points.find((q) => q.x >= -1e-9 && q.s > 30)!.s;
      track.features = { loopStart: start, loopTop: start + Math.PI * r, loopEnd: start + 2 * Math.PI * r };
      return track;
    }
    case 'eigen':
      return customTrack(custom ?? CUSTOM_DEFAULT);
  }
}

/* ---------- Bewegung ---------- */

export interface CartState {
  /** Bogenlänge in m. */
  s: number;
  /** Geschwindigkeit entlang der Bahn in m/s. */
  v: number;
  /** Bisher durch Reibung umgewandelte Energie pro kg (J/kg). */
  w: number;
}

/** Normalbeschleunigung durch die Schiene (m/s²). Negativ: Wagen würde ohne Sicherung abheben. */
export function normalAcceleration(track: Track, s: number, v: number, g: number): number {
  const p = track.at(s);
  return g * Math.cos(p.theta) + v * v * p.kappa;
}

/** Hält die Haftreibung den ruhenden Wagen an der Stelle s fest? */
export function heldByFriction(track: Track, s: number, g: number, mu: number): boolean {
  const p = track.at(s);
  return Math.abs(g * Math.sin(p.theta)) <= mu * Math.abs(g * Math.cos(p.theta));
}

/** Ein Zeitschritt der Bewegung. */
export function stepCart(track: Track, state: CartState, g: number, mu: number, h: number): CartState {
  if (mu > 0 && state.v === 0 && heldByFriction(track, state.s, g, mu)) return state;
  const f = (_t: number, y: readonly number[]) => {
    const p = track.at(y[0]!);
    const n = Math.abs(g * Math.cos(p.theta) + y[1]! * y[1]! * p.kappa);
    const friction = mu * n;
    return [y[1]!, -g * Math.sin(p.theta) - friction * Math.sign(y[1]!), friction * Math.abs(y[1]!)];
  };
  const next = rk4(f, 0, [state.s, state.v, state.w], h);
  let [s, v, w] = next as [number, number, number];
  // Haftreibung: dreht sich die Bewegung auf einem flachen Stück um, bleibt der Wagen stehen.
  // Die winzige Restenergie des Schritts wird als innere Energie verbucht (Bilanz bleibt exakt).
  if (mu > 0 && state.v !== 0 && Math.sign(v) !== Math.sign(state.v) && heldByFriction(track, s, g, mu)) {
    w += 0.5 * v * v;
    v = 0;
  }
  // Prellböcke an den Enden: Restenergie wird beim Aufprall umgewandelt
  if (s < 0 || s > track.length) {
    const sc = Math.min(track.length, Math.max(0, s));
    w += 0.5 * v * v + g * (track.at(s).y - track.at(sc).y);
    s = sc;
    v = 0;
  }
  return { s, v, w };
}

/** Gespeicherter Zustand einer vorausberechneten Fahrt. */
export interface RunSample {
  t: number;
  s: number;
  v: number;
  w: number;
}

export interface LiftOff {
  t: number;
  s: number;
  x: number;
  y: number;
  /** Geschwindigkeit in x- und y-Richtung beim Abheben (m/s). */
  vx: number;
  vy: number;
}

export interface Run {
  samples: RunSample[];
  /** Ende der Fahrt in s (Stillstand oder Zeitgrenze). */
  end: number;
  /** Kam der Wagen mit Reibung endgültig zum Stehen? */
  rest: boolean;
  /** Erste Stelle, an der der Wagen ohne Sicherungsräder abheben würde. */
  liftOff: LiftOff | null;
  /** Umkehrpunkte (v wechselt das Vorzeichen). */
  turns: { t: number; s: number; y: number }[];
  /** Größte erreichte Bogenlänge. */
  maxS: number;
}

export interface RunOptions {
  g?: number;
  /** Längste berechnete Fahrzeit in s. */
  tMax?: number;
  /** Rechenschritt in s. */
  h?: number;
  /** Abstand der gespeicherten Zustände in s. */
  every?: number;
  /** Vorzeitig abbrechen, wenn die Bedingung erfüllt ist. */
  stop?: (st: CartState, run: Run) => boolean;
}

/** Berechnet eine ganze Fahrt ab der Stelle s0 aus der Ruhe. */
export function simulate(track: Track, s0: number, mu: number, opts: RunOptions = {}): Run {
  const g = opts.g ?? G;
  const tMax = opts.tMax ?? 45;
  const h = opts.h ?? 0.002;
  const every = opts.every ?? 0.02;
  const perSample = Math.max(1, Math.round(every / h));
  let st: CartState = { s: s0, v: 0, w: 0 };
  const run: Run = { samples: [{ t: 0, s: s0, v: 0, w: 0 }], end: tMax, rest: false, liftOff: null, turns: [], maxS: s0 };
  let still = 0;
  let lastSign = 0;
  const steps = Math.round(tMax / h);
  for (let i = 1; i <= steps; i++) {
    const before = st;
    st = stepCart(track, st, g, mu, h);
    const t = i * h;
    run.maxS = Math.max(run.maxS, st.s);
    const sign = Math.sign(st.v);
    if (sign !== 0 && lastSign !== 0 && sign !== lastSign) {
      // Umkehrpunkt zwischen den Schritten (linear eingegrenzt)
      const u = before.v / (before.v - st.v || 1);
      const s = before.s + u * (st.s - before.s);
      run.turns.push({ t: t - h + u * h, s, y: track.at(s).y });
    } else if (sign === 0 && lastSign !== 0 && mu > 0) {
      run.turns.push({ t, s: st.s, y: track.at(st.s).y });
    }
    if (sign !== 0) lastSign = sign;
    // kleine Toleranz: genau an der Grenze (N = 0, z. B. h₀ = 2,5·r) gilt der Wagen als „gerade geschafft“
    if (!run.liftOff && Math.abs(st.v) > 1e-6 && normalAcceleration(track, st.s, st.v, g) < -LIFT_TOL * g) {
      const p = track.at(st.s);
      run.liftOff = { t, s: st.s, x: p.x, y: p.y, vx: st.v * Math.cos(p.theta), vy: st.v * Math.sin(p.theta) };
    }
    if (i % perSample === 0) run.samples.push({ t, s: st.s, v: st.v, w: st.w });
    still = st.v === 0 && mu > 0 ? still + h : 0;
    if (still >= 0.6) {
      run.rest = true;
      run.end = t;
      if (run.samples[run.samples.length - 1]!.t < t) run.samples.push({ t, s: st.s, v: st.v, w: st.w });
      break;
    }
    if (opts.stop?.(st, run)) {
      run.end = t;
      if (run.samples[run.samples.length - 1]!.t < t) run.samples.push({ t, s: st.s, v: st.v, w: st.w });
      break;
    }
  }
  return run;
}

/** Zustand der Fahrt zur Zeit t (linear zwischen den gespeicherten Zuständen). */
export function sampleAt(run: Run, t: number): RunSample {
  const list = run.samples;
  const tt = Math.min(run.end, Math.max(0, t));
  let lo = 0;
  let hi = list.length - 1;
  if (tt >= list[hi]!.t) return list[hi]!;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (list[mid]!.t <= tt) lo = mid;
    else hi = mid;
  }
  const a = list[lo]!;
  const b = list[hi]!;
  const u = b.t > a.t ? (tt - a.t) / (b.t - a.t) : 0;
  return { t: tt, s: a.s + u * (b.s - a.s), v: a.v + u * (b.v - a.v), w: a.w + u * (b.w - a.w) };
}

/** Erster Zeitpunkt, an dem der Wagen die Stelle s erreicht (null: nie). */
export function firstPass(run: Run, s: number): RunSample | null {
  const list = run.samples;
  if (Math.abs(list[0]!.s - s) < 1e-9) return list[0]!;
  for (let i = 1; i < list.length; i++) {
    const a = list[i - 1]!;
    const b = list[i]!;
    if ((a.s - s) * (b.s - s) <= 0 && a.s !== b.s) {
      const u = (s - a.s) / (b.s - a.s);
      return { t: a.t + u * (b.t - a.t), s, v: a.v + u * (b.v - a.v), w: a.w + u * (b.w - a.w) };
    }
  }
  return null;
}

/* ---------- Energien und Formeln ---------- */

export interface Energies {
  pot: number;
  kin: number;
  heat: number;
  total: number;
}

/** Energien (in J) des Wagens der Masse m an der Stelle eines Fahrtzustands. */
export function energiesAt(track: Track, st: { s: number; v: number; w: number }, m: number, g = G): Energies {
  const pot = m * g * track.at(st.s).y;
  const kin = 0.5 * m * st.v * st.v;
  const heat = m * st.w;
  return { pot, kin, heat, total: pot + kin + heat };
}

/** Lageenergie E_pot = m·g·h (Bezug: Höhe 0). */
export function potentialEnergy(m: number, h: number, g = G): number {
  return m * g * h;
}

/** Bewegungsenergie E_kin = ½·m·v². */
export function kineticEnergy(m: number, v: number): number {
  return 0.5 * m * v * v;
}

/** Geschwindigkeit in der Höhe h nach dem Start aus der Ruhe in h₀ (ohne Reibung); null, wenn unerreichbar. */
export function speedAtHeight(h0: number, h: number, g = G): number | null {
  if (h > h0 + 1e-12) return null;
  return Math.sqrt(2 * g * Math.max(0, h0 - h));
}

/** Kleinste Geschwindigkeit im höchsten Punkt des Loopings: v² = g·r. */
export function loopMinSpeed(r = LOOP_RADIUS, g = G): number {
  return Math.sqrt(g * r);
}

/** Kleinste Starthöhe (über dem Tiefpunkt) für den Looping ohne Reibung: 2,5·r. */
export function loopMinHeight(r = LOOP_RADIUS): number {
  return 2.5 * r;
}

/** Geschwindigkeit im höchsten Punkt (Höhe 2r) ohne Reibung; null, wenn er nicht erreicht wird. */
export function loopTopSpeed(h0: number, r = LOOP_RADIUS, g = G): number | null {
  return speedAtHeight(h0, 2 * r, g);
}

/**
 * Kräfte im höchsten Punkt des Loopings (ohne Reibung), in N:
 * Gewichtskraft F_G = m·g, nötige Zentripetalkraft F_Z = m·v²/r und die
 * Kraft der Schiene F_N = F_Z − F_G (negativ: die Schiene müsste ziehen).
 */
export function loopTopForces(m: number, h0: number, r = LOOP_RADIUS, g = G): { weight: number; centripetal: number; normal: number } | null {
  const v = loopTopSpeed(h0, r, g);
  if (v === null) return null;
  const weight = m * g;
  const centripetal = (m * v * v) / r;
  return { weight, centripetal, normal: centripetal - weight };
}

/**
 * Höhe, in der der Wagen ohne Sicherungsräder aus dem Kreis fällt (ohne
 * Reibung, Start in h₀ über dem Tiefpunkt): N = 0 ⇔ h = (2·h₀ + r)/3.
 * Nur für r < h₀ < 2,5·r; sonst null (schafft es bzw. bleibt in der unteren Hälfte).
 */
export function liftOffHeight(h0: number, r = LOOP_RADIUS): number | null {
  if (h0 <= r || h0 >= 2.5 * r) return null;
  return (2 * h0 + r) / 3;
}

/* ---------- Entdeckungsaufgabe ---------- */

export type Goal = 'loop' | 'hill';
export type Outcome = 'ok' | 'fail' | 'none';

/** Ziel der Aufgabe auf einer Bahn: Looping durchfahren oder über den höchsten Hügel. */
export function goalOf(track: Track): Goal | null {
  if (track.features.loopTop !== undefined) return 'loop';
  return track.crest ? 'hill' : null;
}

/** Wertet eine Fahrt aus: geschafft oder nicht. */
export function judgeRun(track: Track, run: Run, goal: Goal): Outcome {
  if (goal === 'loop') {
    const end = track.features.loopEnd ?? Infinity;
    const top = track.features.loopTop ?? Infinity;
    const lifted = run.liftOff !== null && run.liftOff.s <= top + 0.5;
    return run.maxS >= end && !lifted ? 'ok' : 'fail';
  }
  const crest = track.crest;
  if (!crest) return 'none';
  return run.maxS > crest.s + 0.05 ? 'ok' : 'fail';
}

/** Bricht die Fahrt ab, sobald das Ergebnis feststeht. */
function decided(track: Track, goal: Goal): (st: CartState, run: Run) => boolean {
  const target = goal === 'loop' ? (track.features.loopEnd ?? Infinity) : (track.crest?.s ?? Infinity) + 0.05;
  return (st, run) => st.s >= target || (goal === 'loop' && run.liftOff !== null) || run.turns.length > 0;
}

/**
 * Kleinste Starthöhe, mit der das Ziel erreicht wird (Bisektion über
 * vollständige Fahrten). `make(h0)` liefert Bahn und Startstelle.
 * null, wenn selbst h_max nicht reicht.
 */
export function minStartHeight(make: (h0: number) => { track: Track; s0: number }, mu: number, goal: Goal, hMin = 2, hMax = 26, g = G): number | null {
  const ok = (h0: number) => {
    const { track, s0 } = make(h0);
    const run = simulate(track, s0, mu, { g, tMax: 25, every: 0.05, stop: decided(track, goal) });
    return judgeRun(track, run, goal) === 'ok';
  };
  if (!ok(hMax)) return null;
  if (ok(hMin)) return hMin;
  let lo = hMin;
  let hi = hMax;
  for (let i = 0; i < 18 && hi - lo > 0.005; i++) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** Bahn und Startstelle zur Starthöhe h₀ (eigene Bahn: der Startpunkt selbst liegt in h₀). */
export function placeStart(id: TrackId, h0: number, custom?: readonly number[]): { track: Track; s0: number; h: number } {
  if (id === 'eigen') {
    const heights = [h0, ...(custom ?? CUSTOM_DEFAULT).slice(1)];
    const track = customTrack(heights);
    return { track, s0: 0, h: h0 };
  }
  const track = buildTrack(id);
  const h = Math.min(h0, track.maxHeight - 0.5);
  const s0 = track.startAt(h);
  return { track, s0, h: track.at(s0).y };
}

/** Gesucht ist ein Grenzwert: liegt er zwischen einem Misserfolg und einem Erfolg, die höchstens `tol` auseinander sind? */
export function bracket(series: readonly { h0: number; ok: boolean }[], tol = 0.5): { lo: number; hi: number } | null {
  const fails = series.filter((q) => !q.ok).map((q) => q.h0);
  const oks = series.filter((q) => q.ok).map((q) => q.h0);
  if (!fails.length || !oks.length) return null;
  const lo = Math.max(...fails);
  const hi = Math.min(...oks);
  return hi > lo && hi - lo <= tol + 1e-9 ? { lo, hi } : null;
}
