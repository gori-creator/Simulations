/**
 * Rechenlogik „Planetenbahnen und Keplersche Gesetze“.
 *
 * Ein Planet (Masse m ≪ M) bewegt sich nur unter der Gravitationskraft eines
 * Zentralsterns der Masse M:
 *
 *   F_G = G·M·m / r²   (zum Stern hin)   ⇒   a⃗ = −G·M · r⃗ / r³
 *
 * Die Bahn wird numerisch mit dem Leapfrog-Verfahren (Geschwindigkeits-Verlet,
 * „kick – drift – kick“) und fester Schrittweite berechnet. Das Verfahren ist
 * symplektisch: Die Energie schwankt nur minimal und driftet nicht weg, und
 * bei einer Zentralkraft bleibt der Drehimpuls sogar exakt erhalten – deshalb
 * überstreicht der Fahrstrahl in gleichen Zeiten exakt gleiche Flächen
 * (2. Keplersches Gesetz).
 *
 * Zum Vergleich liefert `orbitFromState` die exakte Kegelschnittbahn
 * (Kreis, Ellipse, Parabel, Hyperbel) aus Ort und Geschwindigkeit.
 *
 * Interne Einheiten: Länge in AE (astronomische Einheit), Zeit in
 * julianischen Jahren (a), Geschwindigkeit in AE/a. Umrechnung in SI über die
 * Konstanten unten.
 */

/** Astronomische Einheit in m (IAU 2012, exakt). */
export const AU = 1.495978707e11;
/** Tag in s. */
export const DAY = 86400;
/** Julianisches Jahr in s (365,25 d). */
export const YEAR = 365.25 * DAY;
/** Gravitationskonstante in N·m²/kg² (CODATA 2018). */
export const G = 6.6743e-11;
/** Heliozentrische Gravitationskonstante G·M☉ in m³/s² (IAU). */
export const GM_SUN = 1.32712440018e20;
/** Sonnenmasse in kg (≈ 1,988·10³⁰ kg). */
export const M_SUN = GM_SUN / G;
/** Sonnenradius in AE (6,957·10⁸ m). */
export const R_SUN = 6.957e8 / AU;
/** G·M☉ in AE³/a² (≈ 4π²). */
export const MU_SUN = (GM_SUN * YEAR * YEAR) / (AU * AU * AU);
/** 1 AE/a in km/s (≈ 4,74 km/s). */
export const KMS = AU / YEAR / 1000;

/** Toleranzen für die Einteilung der Bahnform. */
const CIRCLE_TOL = 0.005;
const PARABOLA_TOL = 1e-3;
/** Schritte pro dynamischer Zeitskala √(r_P³/(G·M)) im Perihel. */
const STEPS_PER_TAU = 320;

export type Vec = [number, number];

/** G·M in AE³/a² für eine Zentralmasse M (in Sonnenmassen). */
export function mu(M: number): number {
  return MU_SUN * M;
}

/** Geschwindigkeit von km/s in AE/a umrechnen. */
export function fromKms(v: number): number {
  return v / KMS;
}

/** Geschwindigkeit von AE/a in km/s umrechnen. */
export function toKms(v: number): number {
  return v * KMS;
}

/** Kreisbahngeschwindigkeit v_K = √(G·M/r) in km/s (r in AE, M in M☉). */
export function circularSpeed(r: number, M: number): number {
  return toKms(Math.sqrt(mu(M) / r));
}

/** Fluchtgeschwindigkeit v_F = √(2·G·M/r) = √2 · v_K in km/s. */
export function escapeSpeed(r: number, M: number): number {
  return toKms(Math.sqrt((2 * mu(M)) / r));
}

/** Ort und Geschwindigkeit (AE bzw. AE/a). */
export interface State {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Startzustand: Der Planet steht im Abstand r₀ rechts vom Stern (auf der
 * x-Achse). v₀ (in km/s) schließt mit dem Fahrstrahl (vom Stern weg) den
 * Winkel α ein; α = 90° heißt „senkrecht zum Fahrstrahl“, die Bahn läuft dann
 * gegen den Uhrzeigersinn (wie die Planeten, von Norden gesehen).
 */
export function startState(r0: number, v0: number, alphaDeg: number): State {
  const a = (alphaDeg * Math.PI) / 180;
  const v = fromKms(v0);
  return { x: r0, y: 0, vx: v * Math.cos(a), vy: v * Math.sin(a) };
}

export type OrbitKind = 'circle' | 'ellipse' | 'parabola' | 'hyperbola';

/** Bahnelemente der exakten Kegelschnittbahn. */
export interface Orbit {
  kind: OrbitKind;
  /** gebunden (Kreis oder Ellipse): Gesamtenergie < 0 */
  bound: boolean;
  /** numerische Exzentrizität ε (Kreis 0, Ellipse < 1, Parabel 1, Hyperbel > 1) */
  e: number;
  /** Bahnparameter p = L²/(G·M) in AE (Abstand bei 90° wahrer Anomalie) */
  p: number;
  /** große Halbachse a in AE (Ellipse; Hyperbel: Betrag; Parabel: ∞) */
  a: number;
  /** kleine Halbachse b in AE (nur Ellipse/Kreis) */
  b: number;
  /** lineare Exzentrizität (Abstand Mittelpunkt–Brennpunkt) e·a in AE */
  c: number;
  /** Perihelabstand r_P in AE */
  rP: number;
  /** Aphelabstand r_A in AE (∞ bei offenen Bahnen) */
  rA: number;
  /** Umlaufdauer T in a (∞ bei offenen Bahnen) */
  T: number;
  /** Richtung des Perihels (Winkel zur x-Achse) */
  omega: number;
  /** spezifische Gesamtenergie in (AE/a)² */
  energy: number;
  /** spezifischer Drehimpuls L/m = r·v·sin α in AE²/a (positiv: gegen den Uhrzeigersinn) */
  h: number;
  /** Geschwindigkeit im Perihel und im Aphel in km/s */
  vP: number;
  vA: number;
  /** Mittelpunkt der Ellipse (bzw. der Hyperbel) */
  center: Vec;
  /** zweiter Brennpunkt (nur Ellipse/Kreis) */
  focus2: Vec;
  /** Flächengeschwindigkeit dA/dt = L/(2m) in AE²/a */
  arealVelocity: number;
  /** Führt die Bahn in den Stern (Perihel innerhalb des Sternradius)? */
  hitsStar: boolean;
}

/** Exakte Bahn aus Ort und Geschwindigkeit (Zentralmasse M in M☉). */
export function orbitFromState(s: State, M: number): Orbit {
  const m = mu(M);
  const r = Math.hypot(s.x, s.y);
  const v2 = s.vx * s.vx + s.vy * s.vy;
  const h = s.x * s.vy - s.y * s.vx;
  const energy = v2 / 2 - m / r;
  const rv = s.x * s.vx + s.y * s.vy;
  // Exzentrizitätsvektor (zeigt zum Perihel)
  const ex = ((v2 - m / r) * s.x - rv * s.vx) / m;
  const ey = ((v2 - m / r) * s.y - rv * s.vy) / m;
  let e = Math.hypot(ex, ey);
  const omega = e > 1e-9 ? Math.atan2(ey, ex) : Math.atan2(s.y, s.x);
  const p = (h * h) / m;
  const ratio = Math.sqrt(v2 / ((2 * m) / r));
  let kind: OrbitKind;
  if (Math.abs(ratio - 1) < PARABOLA_TOL) kind = 'parabola';
  else if (ratio > 1) kind = 'hyperbola';
  else kind = e < CIRCLE_TOL ? 'circle' : 'ellipse';
  if (kind === 'parabola') e = Math.max(e, 1);
  const bound = kind === 'circle' || kind === 'ellipse';
  const rP = p / (1 + e);
  let a = Infinity;
  let b = NaN;
  let c = NaN;
  let rA = Infinity;
  let T = Infinity;
  let center: Vec = [NaN, NaN];
  let focus2: Vec = [NaN, NaN];
  const ux = Math.cos(omega);
  const uy = Math.sin(omega);
  if (bound) {
    a = -m / (2 * energy);
    b = a * Math.sqrt(Math.max(0, 1 - e * e));
    c = a * e;
    rA = a * (1 + e);
    T = 2 * Math.PI * Math.sqrt((a * a * a) / m);
    center = [-c * ux, -c * uy];
    focus2 = [-2 * c * ux, -2 * c * uy];
  } else if (kind === 'hyperbola') {
    a = m / (2 * energy);
    c = a * e;
    center = [(a + rP) * ux, (a + rP) * uy];
  }
  const aH = Math.abs(h);
  // „Fällt“ der Planet zum Perihel (gebunden oder noch auf dem Weg nach innen)?
  const reachesPerihelion = bound || rv < 0 || rP >= r * (1 - 1e-12);
  return {
    kind,
    bound,
    e,
    p,
    a,
    b,
    c,
    rP,
    rA,
    T,
    omega,
    energy,
    h,
    vP: toKms(aH / rP),
    vA: bound ? toKms(aH / rA) : NaN,
    center,
    focus2,
    arealVelocity: aH / 2,
    hitsStar: rP < R_SUN && reachesPerihelion,
  };
}

/** Abstand vom Stern bei der wahren Anomalie ν (Winkel vom Perihel aus). */
export function conicRadius(o: Orbit, nu: number): number {
  return o.p / (1 + o.e * Math.cos(nu));
}

/** Punkt der Bahn bei der wahren Anomalie ν. */
export function conicPoint(o: Orbit, nu: number): Vec {
  const r = conicRadius(o, nu);
  const a = o.omega + Math.sign(o.h || 1) * nu;
  return [r * Math.cos(a), r * Math.sin(a)];
}

/** Größter Betrag der wahren Anomalie, den eine offene Bahn erreicht (Asymptote). */
export function maxTrueAnomaly(o: Orbit): number {
  if (o.bound) return Math.PI;
  return Math.acos(Math.max(-1, -1 / o.e));
}

/**
 * Wahre Anomalie, bei der eine Bahn den Abstand r erreicht (0 … π), oder NaN,
 * wenn der Abstand nie erreicht wird.
 */
export function trueAnomalyAt(o: Orbit, r: number): number {
  if (o.e < 1e-12) return NaN;
  const cos = (o.p / r - 1) / o.e;
  if (cos > 1 || cos < -1) return NaN;
  return Math.acos(cos);
}

/**
 * Zeit (in a) vom Periheldurchgang bis zur wahren Anomalie ν (−π < ν < π)
 * über die Kepler-Gleichung: Ellipse M = E − ε·sin E, Hyperbel
 * M = ε·sinh F − F, Parabel nach Barker. Negativ vor dem Perihel.
 */
export function timeFromPerihelion(o: Orbit, nu: number, M: number): number {
  const m = mu(M);
  const half = Math.tan(nu / 2);
  if (o.kind === 'parabola') {
    return 0.5 * Math.sqrt((o.p * o.p * o.p) / m) * (half + (half * half * half) / 3);
  }
  if (o.bound) {
    const E = 2 * Math.atan(Math.sqrt((1 - o.e) / (1 + o.e)) * half);
    return (E - o.e * Math.sin(E)) * Math.sqrt((o.a * o.a * o.a) / m);
  }
  const F = 2 * Math.atanh(Math.sqrt((o.e - 1) / (o.e + 1)) * half);
  return (o.e * Math.sinh(F) - F) * Math.sqrt((o.a * o.a * o.a) / m);
}

/** Wahre Anomalie des Ortes (x, y) auf der Bahn (Winkel vom Perihel aus, −π … π). */
export function trueAnomalyOf(o: Orbit, x: number, y: number): number {
  const d = Math.sign(o.h || 1) * (Math.atan2(y, x) - o.omega);
  return Math.atan2(Math.sin(d), Math.cos(d));
}

/** Gravitationsbeschleunigung a⃗ = −G·M·r⃗/r³ in AE/a². */
export function gravity(x: number, y: number, m: number): Vec {
  const r2 = x * x + y * y;
  const k = -m / (r2 * Math.sqrt(r2));
  return [k * x, k * y];
}

/**
 * Ein Leapfrog-Schritt (Kick–Drift–Kick) der Länge h (in a), direkt am
 * Zustand. Ort und Geschwindigkeit sind danach wieder synchron.
 */
export function leapfrogStep(s: State, h: number, m: number): void {
  let [ax, ay] = gravity(s.x, s.y, m);
  s.vx += 0.5 * h * ax;
  s.vy += 0.5 * h * ay;
  s.x += h * s.vx;
  s.y += h * s.vy;
  [ax, ay] = gravity(s.x, s.y, m);
  s.vx += 0.5 * h * ax;
  s.vy += 0.5 * h * ay;
}

/** Spezifische Energien in J/kg (pro kg Planetenmasse). */
export function energies(s: State, M: number): { kin: number; pot: number; total: number } {
  const v = (Math.hypot(s.vx, s.vy) * AU) / YEAR;
  const r = Math.hypot(s.x, s.y) * AU;
  const kin = 0.5 * v * v;
  const pot = (-GM_SUN * M) / r;
  return { kin, pot, total: kin + pot };
}

/** Keplersche Konstante T²/a³ = 4π²/(G·M) in s²/m³ (M in M☉). */
export function keplerConstant(M: number): number {
  return (4 * Math.PI * Math.PI) / (GM_SUN * M);
}

/** T²/a³ in s²/m³ aus a (AE) und T (a). */
export function keplerRatio(a: number, T: number): number {
  const Ts = T * YEAR;
  const am = a * AU;
  return (Ts * Ts) / (am * am * am);
}

/** Umlaufdauer nach dem 3. Keplerschen Gesetz T = 2π·√(a³/(G·M)) in a. */
export function keplerPeriod(a: number, M: number): number {
  return 2 * Math.PI * Math.sqrt((a * a * a) / mu(M));
}

/**
 * Die acht Planeten: mittlere Bahnelemente (J2000) nach JPL
 * (E. M. Standish, „Keplerian Elements for Approximate Positions of the
 * Major Planets“, gültig 1800–2050). a in AE, ε, Länge des Perihels ϖ in
 * Grad und mittlere Bewegung n in Grad pro julianischem Jahrhundert;
 * daraus die siderische Umlaufdauer T = 36 000°/n in Jahren.
 */
export interface PlanetData {
  id: 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
  name: { de: string; en: string };
  a: number;
  e: number;
  varpi: number;
  n: number;
}

export const PLANETS: readonly PlanetData[] = [
  { id: 'mercury', name: { de: 'Merkur', en: 'Mercury' }, a: 0.38709927, e: 0.20563593, varpi: 77.45779628, n: 149472.67411175 },
  { id: 'venus', name: { de: 'Venus', en: 'Venus' }, a: 0.72333566, e: 0.00677672, varpi: 131.60246718, n: 58517.81538729 },
  { id: 'earth', name: { de: 'Erde', en: 'Earth' }, a: 1.00000261, e: 0.01671123, varpi: 102.93768193, n: 35999.37244981 },
  { id: 'mars', name: { de: 'Mars', en: 'Mars' }, a: 1.52371034, e: 0.0933941, varpi: -23.94362959, n: 19140.30268499 },
  { id: 'jupiter', name: { de: 'Jupiter', en: 'Jupiter' }, a: 5.202887, e: 0.04838624, varpi: 14.72847983, n: 3034.74612775 },
  { id: 'saturn', name: { de: 'Saturn', en: 'Saturn' }, a: 9.53667594, e: 0.05386179, varpi: 92.59887831, n: 1222.49362201 },
  { id: 'uranus', name: { de: 'Uranus', en: 'Uranus' }, a: 19.18916464, e: 0.04725744, varpi: 170.9542763, n: 428.48202785 },
  { id: 'neptune', name: { de: 'Neptun', en: 'Neptune' }, a: 30.06992276, e: 0.00859048, varpi: 44.96476227, n: 218.45945325 },
];

/** Siderische Umlaufdauer eines Planeten in Jahren. */
export function planetPeriod(pl: PlanetData): number {
  return 36000 / pl.n;
}

/* ------------------------------------------------------------------ */
/* Ablauf einer Bahn: Integration, Flächen, Messung                    */
/* ------------------------------------------------------------------ */

/** Fläche, die der Fahrstrahl in einem Zeitabschnitt überstreicht. */
export interface Sector {
  index: number;
  t0: number;
  t1: number;
  /** überstrichene Fläche in AE² (aus den exakten Dreiecken der Rechenschritte) */
  area: number;
  /** Bahnpunkte des Abschnitts (ausgedünnt, zum Zeichnen) */
  pts: Vec[];
  done: boolean;
}

/** Messwerte für Diagramme. */
export interface Sample {
  t: number;
  r: number;
  /** Bahngeschwindigkeit in km/s */
  v: number;
  /** spezifische Energien in J/kg */
  kin: number;
  pot: number;
}

/** Messung nach einem vollen Umlauf: T, kleinster und größter Abstand. */
export interface LapMeasurement {
  T: number;
  rMin: number;
  rMax: number;
  /** große Halbachse aus der Messung a = (r_min + r_max)/2 */
  a: number;
}

export interface RunOptions {
  r0: number;
  v0: number;
  alpha: number;
  M: number;
  /** Zahl der gleich langen Zeitabschnitte */
  n: number;
  /**
   * Geschlossene Bahn: Zeitabschnitt = T/n, nach einem Umlauf ist alles
   * aufgezeichnet. Offene (oder sehr weite) Bahn: Bezugszeit ist die
   * Umlaufdauer einer Kreisbahn bei r₀.
   */
  closed: boolean;
}

/**
 * Eine laufende Bahn. `advance(dt)` rechnet mit fester Schrittweite weiter
 * und zeichnet dabei Bahnspur, Flächenstücke und Messwerte auf.
 */
export class OrbitRun {
  readonly m: number;
  readonly orbit: Orbit;
  readonly closed: boolean;
  /** Bezugszeit in a: Umlaufdauer (geschlossen) bzw. Kreisbahn-Umlaufdauer bei r₀ */
  readonly tRef: number;
  /** Länge eines Zeitabschnitts Δt in a */
  readonly dtSector: number;
  /** feste Schrittweite in a (Δt ist ein ganzzahliges Vielfaches) */
  readonly h: number;
  readonly stepsPerSector: number;
  readonly n: number;
  readonly s: State;
  t = 0;
  steps = 0;
  /** überstrichener Winkel seit dem Start (fortlaufend) */
  theta = 0;
  crashed = false;
  /** Bahnspur (ausgedünnt) */
  trail: Vec[] = [];
  /** fertige und laufende Flächenstücke */
  sectors: Sector[] = [];
  samples: Sample[] = [];
  lap: LapMeasurement | null = null;
  /** größte und kleinste Bahngeschwindigkeit bisher (km/s) */
  vMax = 0;
  vMin = Infinity;
  private acc = 0;
  private rMin = Infinity;
  private rMax = 0;
  private lastTrail: { th: number; r: number } = { th: 0, r: 0 };
  private lastSectorPt: { th: number; r: number } = { th: 0, r: 0 };
  private lastSample: { t: number; r: number; v: number } = { t: -1, r: 0, v: 0 };
  private readonly M: number;

  constructor(opts: RunOptions) {
    this.M = opts.M;
    this.m = mu(opts.M);
    this.s = startState(opts.r0, opts.v0, opts.alpha);
    this.orbit = orbitFromState(this.s, opts.M);
    this.closed = opts.closed && this.orbit.bound;
    this.n = Math.max(1, Math.round(opts.n));
    this.tRef = this.closed ? this.orbit.T : 2 * Math.PI * Math.sqrt(opts.r0 ** 3 / this.m);
    this.dtSector = this.tRef / this.n;
    this.h = stepFor(this.orbit, this.m, this.dtSector);
    this.stepsPerSector = Math.max(1, Math.round(this.dtSector / this.h));
    const r = Math.hypot(this.s.x, this.s.y);
    this.trail.push([this.s.x, this.s.y]);
    this.lastTrail = { th: 0, r };
    this.lastSectorPt = { th: 0, r };
    this.sectors.push({ index: 0, t0: 0, t1: this.dtSector, area: 0, pts: [[this.s.x, this.s.y]], done: false });
    this.rMin = this.rMax = r;
    this.sample(true);
  }

  /** Ist die erste Runde (bei geschlossenen Bahnen) vollständig aufgezeichnet? */
  get complete(): boolean {
    return this.closed && this.lap !== null;
  }

  /** Abstand vom Stern. */
  get r(): number {
    return Math.hypot(this.s.x, this.s.y);
  }

  /** Bahngeschwindigkeit in km/s. */
  get v(): number {
    return toKms(Math.hypot(this.s.vx, this.s.vy));
  }

  /** Index des Zeitabschnitts, in dem sich der Planet gerade befindet. */
  get sectorIndex(): number {
    if (!this.closed) return Math.floor(this.t / this.dtSector + 1e-9);
    return Math.min(this.n - 1, Math.floor((this.t % this.tRef) / this.dtSector + 1e-9));
  }

  /**
   * Rechnet die Bewegung um dt (in a) weiter. Gibt zurück, ob gerechnet wurde.
   * `maxSteps` begrenzt die Rechenschritte pro Aufruf (die Zeit läuft dann langsamer).
   */
  advance(dt: number, maxSteps = 60000): boolean {
    if (this.crashed) return false;
    this.acc += dt;
    let k = 0;
    while (this.acc >= this.h && k < maxSteps) {
      this.step();
      this.acc -= this.h;
      k++;
      if (this.crashed) break;
    }
    if (k >= maxSteps) this.acc = 0;
    return k > 0;
  }

  private step(): void {
    const s = this.s;
    const x0 = s.x;
    const y0 = s.y;
    leapfrogStep(s, this.h, this.m);
    this.steps++;
    this.t = this.steps * this.h;
    const r = Math.hypot(s.x, s.y);
    if (r < R_SUN) {
      this.crashed = true;
      this.trail.push([s.x, s.y]);
      return;
    }
    // Dreieck Stern – alter Ort – neuer Ort
    const cross = x0 * s.y - y0 * s.x;
    const dot = x0 * s.x + y0 * s.y;
    const dTheta = Math.atan2(cross, dot);
    const thetaBefore = this.theta;
    this.theta += dTheta;
    const area = 0.5 * Math.abs(cross);
    const v = toKms(Math.hypot(s.vx, s.vy));
    this.vMax = Math.max(this.vMax, v);
    this.vMin = Math.min(this.vMin, v);

    const firstLap = !this.lap;
    if (firstLap) {
      this.rMin = Math.min(this.rMin, r);
      this.rMax = Math.max(this.rMax, r);
    }

    // Flächenstücke (bei geschlossenen Bahnen nur im ersten Umlauf)
    const recording = !this.closed || firstLap;
    if (recording) {
      const cur = this.sectors[this.sectors.length - 1]!;
      if (!cur.done) {
        cur.area += area;
        const closes = this.steps % this.stepsPerSector === 0;
        if (closes || this.farFrom(this.lastSectorPt, r)) {
          cur.pts.push([s.x, s.y]);
          this.lastSectorPt = { th: this.theta, r };
        }
        if (closes) {
          cur.done = true;
          cur.t1 = this.t;
          const next = cur.index + 1;
          if (!this.closed || next < this.n) {
            this.sectors.push({ index: next, t0: this.t, t1: this.t + this.dtSector, area: 0, pts: [[s.x, s.y]], done: false });
            // offene Bahnen: nur die letzten n Abschnitte behalten
            if (!this.closed && this.sectors.length > this.n + 1) this.sectors.shift();
          }
        }
      }
      if (this.farFrom(this.lastTrail, r)) {
        this.trail.push([s.x, s.y]);
        this.lastTrail = { th: this.theta, r };
      }
    }

    // Umlauf vollendet: Umlaufdauer messen (lineare Interpolation des Winkels)
    if (firstLap && this.closed && Math.abs(this.theta) >= 2 * Math.PI) {
      const full = 2 * Math.PI * Math.sign(this.theta);
      const f = (full - thetaBefore) / (this.theta - thetaBefore);
      const T = this.t - this.h + f * this.h;
      this.lap = { T, rMin: this.rMin, rMax: this.rMax, a: (this.rMin + this.rMax) / 2 };
      this.trail.push([s.x, s.y]);
      this.sample(true);
      // letzter Abschnitt endet genau mit dem Umlauf
      const last = this.sectors[this.sectors.length - 1]!;
      if (!last.done) {
        last.done = true;
        last.t1 = this.t;
        last.pts.push([s.x, s.y]);
      }
    }
    if (firstLap || !this.closed) this.sample(false);
  }

  /** Neuer Punkt für Spur bzw. Flächenrand, wenn sich Winkel oder Abstand genug geändert haben. */
  private farFrom(last: { th: number; r: number }, r: number): boolean {
    return Math.abs(this.theta - last.th) >= 0.01 || Math.abs(r - last.r) >= 0.006 * Math.max(r, last.r);
  }

  private sample(force: boolean): void {
    const r = this.r;
    const v = this.v;
    const l = this.lastSample;
    if (!force && this.t - l.t < this.tRef / 360 && Math.abs(v - l.v) < 0.008 * l.v && Math.abs(r - l.r) < 0.008 * l.r) return;
    const en = energies(this.s, this.M);
    this.samples.push({ t: this.t, r, v, kin: en.kin, pot: en.pot });
    this.lastSample = { t: this.t, r, v };
  }
}

/**
 * Feste Schrittweite: ein kleiner Bruchteil der dynamischen Zeitskala im
 * Perihel (dort ist der Planet am schnellsten), so gewählt, dass ein
 * Zeitabschnitt Δt aus einer ganzen Zahl von Schritten besteht.
 */
export function stepFor(o: Orbit, m: number, dtSector: number): number {
  const rRef = Math.max(o.rP, R_SUN);
  const h0 = Math.sqrt((rRef * rRef * rRef) / m) / STEPS_PER_TAU;
  const k = Math.max(1, Math.ceil(dtSector / h0));
  return dtSector / k;
}
