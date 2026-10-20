/**
 * Rechenlogik „Fadenpendel“ (mathematisches Pendel).
 *
 * Ein punktförmiger Körper (Masse m) hängt an einem masselosen Faden der
 * Länge l. φ ist die Auslenkung aus der Senkrechten (rechts positiv),
 * ω = φ̇ die Winkelgeschwindigkeit. Mit der Rückstellkraft F_R = −m·g·sin φ
 * und optionaler geschwindigkeitsproportionaler Dämpfung (Abklingkonstante γ)
 * gilt die Bewegungsgleichung
 *
 *   φ̈ = −(g/l)·sin φ − 2γ·φ̇.
 *
 * Für kleine Winkel (sin φ ≈ φ) wird daraus die harmonische Schwingung mit
 * T₀ = 2π·√(l/g); die Amplitude nimmt dann mit e^(−γt) ab.
 *
 * Bei großen Auslenkungen ist die Periodendauer länger. Exakt gilt
 * T = T₀ / AGM(1, cos(φ₀/2)) mit dem arithmetisch-geometrischen Mittel
 * (gleichwertig zum vollständigen elliptischen Integral 1. Art).
 *
 * Für |φ₀| > 90° würde ein Faden schlaff (er kann nur ziehen) – die
 * Simulation rechnet dann mit einer masselosen starren Stange, die auch
 * drücken kann. Die Funktion `tension` liefert in diesem Fall negative Werte.
 */
import { rk4 } from '../../../sim-core/numeric';

/** Ortsfaktoren in m/s² (N/kg). */
export const PLANETS = {
  erde: { g: 9.81 },
  mond: { g: 1.62 },
  mars: { g: 3.71 },
  jupiter: { g: 24.79 },
} as const;
export type PlanetId = keyof typeof PLANETS;

/** Zustand: Auslenkung φ (rad) und Winkelgeschwindigkeit ω (rad/s). */
export type State = readonly [number, number];

const DEG = Math.PI / 180;

/* ---------- Periodendauer ---------- */

/** Kreisfrequenz der Kleinwinkelnäherung ω₀ = √(g/l) in 1/s. */
export function omega0(length: number, g: number): number {
  return Math.sqrt(g / length);
}

/** Periodendauer in der Kleinwinkelnäherung: T₀ = 2π·√(l/g). */
export function smallAnglePeriod(length: number, g: number): number {
  return 2 * Math.PI * Math.sqrt(length / g);
}

/** Arithmetisch-geometrisches Mittel zweier positiver Zahlen. */
export function agm(a: number, b: number): number {
  for (let i = 0; i < 60 && Math.abs(a - b) > 1e-15 * Math.max(a, 1e-300); i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return a;
}

/**
 * Verlängerungsfaktor T/T₀ bei der Amplitude φ₀ (Bogenmaß):
 * T/T₀ = 1 / AGM(1, cos(φ₀/2)). Bei φ₀ → 180° geht er gegen unendlich.
 */
export function periodFactor(amplitude: number): number {
  const c = Math.cos(Math.min(Math.abs(amplitude), Math.PI) / 2);
  return c < 1e-12 ? Infinity : 1 / agm(1, c);
}

/** Exakte Periodendauer des ungedämpften Pendels bei der Amplitude φ₀ (Bogenmaß). */
export function exactPeriod(length: number, g: number, amplitude: number): number {
  return smallAnglePeriod(length, g) * periodFactor(amplitude);
}

/** Reihenentwicklung T/T₀ ≈ 1 + φ₀²/16 + 11·φ₀⁴/3072 (gut bis etwa 60°). */
export function seriesFactor(amplitude: number, terms: 1 | 2 = 2): number {
  const a2 = amplitude * amplitude;
  return 1 + a2 / 16 + (terms === 2 ? (11 * a2 * a2) / 3072 : 0);
}

/**
 * Amplitude (Bogenmaß), ab der die exakte Periodendauer um den Anteil `rel`
 * (z. B. 0,01 für 1 %) über der Kleinwinkelnäherung liegt.
 */
export function amplitudeForDeviation(rel: number): number {
  let lo = 0;
  let hi = Math.PI - 1e-9;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (periodFactor(mid) - 1 < rel) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Länge, bei der die Kleinwinkel-Periodendauer T ist: l = g·T²/(4π²). */
export function lengthForPeriod(T: number, g: number): number {
  return (g * T * T) / (4 * Math.PI * Math.PI);
}

/** Sekundenpendel: jede Halbschwingung dauert 1 s, also T = 2 s (l = g/π²). */
export function secondsPendulumLength(g: number): number {
  return lengthForPeriod(2, g);
}

/* ---------- Bewegung ---------- */

/** Winkelbeschleunigung φ̈ = −(g/l)·sin φ − 2γ·ω. */
export function angularAcceleration(state: State, length: number, g: number, gamma: number): number {
  return -(g / length) * Math.sin(state[0]) - 2 * gamma * state[1];
}

/** Ein Zeitschritt der exakten Bewegungsgleichung (Runge-Kutta 4. Ordnung). */
export function step(state: State, length: number, g: number, gamma: number, h: number): [number, number] {
  const k = g / length;
  const f = (_t: number, y: readonly number[]) => [y[1]!, -k * Math.sin(y[0]!) - 2 * gamma * y[1]!];
  const next = rk4(f, 0, state, h);
  return [next[0]!, next[1]!];
}

/**
 * Lösung der Kleinwinkelnäherung φ̈ = −ω₀²·φ − 2γ·φ̇ nach dem Loslassen aus der
 * Ruhe bei φ₀ (Bogenmaß): φ(t) = φ₀·e^(−γt)·(cos ω_d·t + γ/ω_d · sin ω_d·t),
 * ω_d = √(ω₀² − γ²). Liefert [φ, φ̇].
 */
export function harmonic(t: number, amplitude: number, length: number, g: number, gamma: number): [number, number] {
  const w0 = omega0(length, g);
  const wd2 = w0 * w0 - gamma * gamma;
  const e = Math.exp(-gamma * t);
  if (wd2 <= 1e-12) {
    // aperiodischer Grenzfall (kommt mit den Reglerwerten nicht vor)
    return [amplitude * e * (1 + gamma * t), -amplitude * e * gamma * gamma * t];
  }
  const wd = Math.sqrt(wd2);
  const c = Math.cos(wd * t);
  const s = Math.sin(wd * t);
  return [amplitude * e * (c + (gamma / wd) * s), (-amplitude * e * (w0 * w0) * s) / wd];
}

/** Einhüllende der gedämpften Schwingung: |φ₀|·e^(−γt). */
export function envelope(t: number, amplitude: number, gamma: number): number {
  return Math.abs(amplitude) * Math.exp(-gamma * t);
}

/** Halbwertszeit der Amplitude t½ = ln 2 / γ (Infinity ohne Dämpfung). */
export function amplitudeHalfLife(gamma: number): number {
  return gamma > 0 ? Math.LN2 / gamma : Infinity;
}

/* ---------- Energie und Kräfte ---------- */

export interface Energies {
  /** Höhe über dem tiefsten Punkt h = l·(1 − cos φ) in m. */
  height: number;
  /** Bahngeschwindigkeit v = l·|ω| in m/s. */
  speed: number;
  /** Lageenergie m·g·h in J. */
  pot: number;
  /** Bewegungsenergie ½·m·v² in J. */
  kin: number;
}

export function energies(state: State, length: number, g: number, mass: number): Energies {
  const height = length * (1 - Math.cos(state[0]));
  const speed = length * Math.abs(state[1]);
  return { height, speed, pot: mass * g * height, kin: 0.5 * mass * speed * speed };
}

/** Lageenergie im Umkehrpunkt (Anfangsenergie beim Loslassen aus der Ruhe). */
export function releaseEnergy(amplitude: number, length: number, g: number, mass: number): number {
  return mass * g * length * (1 - Math.cos(amplitude));
}

/** Höchstgeschwindigkeit im tiefsten Punkt (ohne Dämpfung): v = √(2·g·h). */
export function maxSpeed(amplitude: number, length: number, g: number): number {
  return Math.sqrt(2 * g * length * (1 - Math.cos(amplitude)));
}

export interface Forces {
  /** Gewichtskraft m·g (N, Betrag, nach unten). */
  weight: number;
  /** Rückstellkraft (tangential) −m·g·sin φ – Vorzeichen in Richtung wachsender φ. */
  restoring: number;
  /** Komponente der Gewichtskraft längs des Fadens m·g·cos φ (nach außen positiv). */
  radial: number;
  /** Fadenkraft F_S = m·g·cos φ + m·v²/l (zum Aufhängepunkt positiv; negativ: Stange drückt). */
  tension: number;
  /** Zentripetalkraft m·v²/l = F_S − m·g·cos φ. */
  centripetal: number;
}

export function forces(state: State, length: number, g: number, mass: number): Forces {
  const [phi, w] = state;
  const centripetal = mass * length * w * w;
  const radial = mass * g * Math.cos(phi);
  return { weight: mass * g, restoring: -mass * g * Math.sin(phi), radial, tension: radial + centripetal, centripetal };
}

/**
 * Fadenkraft ohne Dämpfung an der Stelle φ beim Loslassen aus der Ruhe bei φ₀
 * (Energiesatz v² = 2gl(cos φ − cos φ₀)): F_S = m·g·(3·cos φ − 2·cos φ₀).
 */
export function tension(phi: number, amplitude: number, g: number, mass: number): number {
  return mass * g * (3 * Math.cos(phi) - 2 * Math.cos(amplitude));
}

/**
 * Ab welchem Winkel |φ| (Bogenmaß) wäre der Faden schlaff (F_S < 0)?
 * Nur für |φ₀| > 90° gibt es solche Stellen: |φ| > arccos(⅔·cos φ₀).
 * Gibt `null` zurück, wenn der Faden immer gespannt bleibt.
 */
export function slackAngle(amplitude: number): number | null {
  const c = Math.cos(amplitude);
  if (c >= 0) return null;
  return Math.acos((2 / 3) * c);
}

/** Geschwindigkeit an der Stelle φ (ohne Dämpfung): v = √(2gl(cos φ − cos φ₀)); NaN außerhalb. */
export function speedAt(phi: number, amplitude: number, length: number, g: number): number {
  const d = Math.cos(phi) - Math.cos(amplitude);
  return d >= -1e-12 ? Math.sqrt(2 * g * length * Math.max(0, d)) : NaN;
}

/* ---------- Messung ---------- */

/** Zeitpunkt, an dem eine Größe zwischen (t0, a0) und (t1, a1) durch null geht (linear). */
export function crossingTime(t0: number, a0: number, t1: number, a1: number): number {
  return a1 === a0 ? t1 : t0 + ((t1 - t0) * a0) / (a0 - a1);
}

/**
 * Integriert ab dem Loslassen aus der Ruhe bei φ₀ und liefert die Zeitpunkte,
 * zu denen das Pendel wieder am Startumkehrpunkt ist (je eine volle Schwingung).
 */
export function returnTimes(length: number, g: number, amplitude: number, gamma: number, count: number, h = 0.0005): number[] {
  const out: number[] = [];
  if (amplitude === 0) return out;
  const side = Math.sign(amplitude);
  let s: [number, number] = [amplitude, 0];
  let t = 0;
  let prev = 0;
  const tMax = (count + 2) * exactPeriod(length, g, amplitude) * 2;
  while (out.length < count && t < tMax) {
    s = step(s, length, g, gamma, h);
    t += h;
    const w = side * s[1];
    // Rückkehr zum Startumkehrpunkt: Winkelgeschwindigkeit wechselt von „hin“ zu „zurück“
    if (prev > 0 && w <= 0) out.push(crossingTime(t - h, prev, t, w));
    prev = w;
  }
  return out;
}

/**
 * Zufälliger Fehler der Handstoppung in s (Start und Stopp je etwa ±0,1 s
 * Reaktionszeit, zusammen höchstens ±0,18 s, Dreiecksverteilung).
 */
export function reactionError(rand: () => number): number {
  return 0.18 * (rand() + rand() - 1);
}

export interface Measurement {
  /** Pendellänge in m. */
  l: number;
  /** gemessene Periodendauer T in s. */
  T: number;
}

/** Steigung k einer Ursprungsgeraden y = k·x durch die Punkte (kleinste Quadrate). */
export function slopeThroughOrigin(xs: readonly number[], ys: readonly number[]): number {
  let sxy = 0;
  let sxx = 0;
  xs.forEach((x, i) => {
    sxy += x * ys[i]!;
    sxx += x * x;
  });
  return sxx > 0 ? sxy / sxx : NaN;
}

/**
 * Auswertung einer Messreihe: T² über l ist eine Ursprungsgerade mit der
 * Steigung k = 4π²/g, also g = 4π²/k.
 */
export function fitSeries(list: readonly Measurement[]): { slope: number; g: number; lengths: number } | null {
  const lengths = new Set(list.map((q) => Math.round(q.l * 1000))).size;
  if (lengths < 2) return null;
  const slope = slopeThroughOrigin(
    list.map((q) => q.l),
    list.map((q) => q.T * q.T),
  );
  return { slope, g: (4 * Math.PI * Math.PI) / slope, lengths };
}

/** Grad ↔ Bogenmaß. */
export const toRad = (deg: number) => deg * DEG;
export const toDeg = (rad: number) => rad / DEG;
