/**
 * Rechenlogik für Magnetfelder stromdurchflossener Leiter: gerader Leiter
 * (B = μ₀·I/(2π·r)), Überlagerung mehrerer Leiter, Kraft zwischen parallelen
 * Leitern, Kreisstrom (exakt mit vollständigen elliptischen Integralen),
 * Spule als Summe vieler Windungen und als ideale lange Spule
 * (B = μ₀·μ_r·N·I/l), Feld auf der Spulenachse, Feldlinien durch Integration,
 * Kompass im Erdfeld (Ørsted-Versuch), Relais und Gleichstrommotor.
 * Geprüft in tests/magnetfeld-spule.test.ts.
 */

/** Magnetische Feldkonstante μ₀ in T·m/A (Vs/(Am)) */
export const MU0 = 4e-7 * Math.PI;
/** Horizontalkomponente des Erdmagnetfelds in Mitteleuropa (etwa 20 µT) */
export const B_EARTH = 20e-6;

export type V2 = [number, number];

/* ------------------------------------------------------------------ */
/* Gerader Leiter                                                       */
/* ------------------------------------------------------------------ */

/** Betrag der Flussdichte um einen langen geraden Leiter: B = μ₀·I/(2π·r). */
export const wireB = (I: number, r: number) => (MU0 * I) / (2 * Math.PI * r);
/** Abstand, in dem der Leiter die Flussdichte B erzeugt. */
export const wireR = (I: number, B: number) => (MU0 * I) / (2 * Math.PI * B);

export interface Wire {
  x: number;
  y: number;
  /** Stromstärke in A, positiv = aus der Zeichenebene heraus (⊙) */
  I: number;
}

/**
 * Feld von senkrecht zur Zeichenebene verlaufenden Leitern (Überlagerung).
 * Strom aus der Ebene heraus (I > 0) erzeugt ein Feld gegen den
 * Uhrzeigersinn (Rechte-Faust-Regel). Koordinaten in m.
 */
export function wiresField(wires: readonly Wire[], x: number, y: number): V2 {
  let bx = 0;
  let by = 0;
  for (const w of wires) {
    const dx = x - w.x;
    const dy = y - w.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 1e-12) continue;
    const k = (MU0 * w.I) / (2 * Math.PI * r2);
    bx += -k * dy;
    by += k * dx;
  }
  return [bx, by];
}

/** Kraft pro Länge zwischen zwei parallelen Leitern: F/l = μ₀·I₁·I₂/(2π·d); positiv = Anziehung (gleiche Richtung). */
export const wireForcePerLength = (I1: number, I2: number, d: number) => (MU0 * I1 * I2) / (2 * Math.PI * d);

/* ------------------------------------------------------------------ */
/* Kompass (Ørsted)                                                     */
/* ------------------------------------------------------------------ */

/**
 * Ausschlag einer Kompassnadel, die ohne Strom nach Norden (y-Richtung)
 * zeigt, wenn zusätzlich das Feld (bx, by) wirkt. Winkel in rad gegen Norden,
 * positiv = nach Osten (x-Richtung, im Uhrzeigersinn gemessen).
 */
export function compassAngle(bx: number, by: number, bEarth = B_EARTH): number {
  return Math.atan2(bx, by + bEarth);
}

/* ------------------------------------------------------------------ */
/* Elliptische Integrale und Kreisstrom                                 */
/* ------------------------------------------------------------------ */

/** Vollständiges elliptisches Integral 1. Art K(m), m = k² (AGM). */
export function ellipK(m: number): number {
  let a = 1;
  let b = Math.sqrt(1 - m);
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-15; i++) {
    const an = (a + b) / 2;
    b = Math.sqrt(a * b);
    a = an;
  }
  return Math.PI / (2 * a);
}

/** Vollständiges elliptisches Integral 2. Art E(m), m = k² (AGM). */
export function ellipE(m: number): number {
  let a = 1;
  let b = Math.sqrt(1 - m);
  let c = Math.sqrt(m);
  let sum = (c * c) / 2;
  let pow = 0.5;
  for (let i = 0; i < 40 && Math.abs(c) > 1e-15; i++) {
    const an = (a + b) / 2;
    const bn = Math.sqrt(a * b);
    c = (a - b) / 2;
    pow *= 2;
    sum += pow * c * c;
    a = an;
    b = bn;
  }
  return (Math.PI / (2 * a)) * (1 - sum);
}

/**
 * Feld eines Kreisstroms (Radius R, Strom I, Achse = z) am Ort (ρ, z):
 * liefert [B_ρ, B_z] in T. Exakt mit elliptischen Integralen.
 */
export function loopField(R: number, I: number, rho: number, z: number): V2 {
  const r = Math.abs(rho);
  const s = rho < 0 ? -1 : 1;
  const Q = (R + r) ** 2 + z * z;
  const m = (4 * R * r) / Q;
  if (m >= 1 - 1e-12) return [0, 0]; // auf dem Draht
  const K = ellipK(m);
  const E = ellipE(m);
  const pre = (MU0 * I) / (2 * Math.PI * Math.sqrt(Q));
  const D = (R - r) ** 2 + z * z;
  const Bz = pre * (K + ((R * R - r * r - z * z) / D) * E);
  const Br = r < 1e-12 ? 0 : ((pre * z) / r) * (-K + ((R * R + r * r + z * z) / D) * E);
  return [s * Br, Bz];
}

/** Feld in der Mitte eines Kreisstroms: B = μ₀·I/(2R). */
export const loopCenterB = (R: number, I: number) => (MU0 * I) / (2 * R);
/** Feld auf der Achse eines Kreisstroms: B = μ₀·I·R²/(2·(R² + z²)^{3/2}). */
export const loopAxisB = (R: number, I: number, z: number) => (MU0 * I * R * R) / (2 * Math.pow(R * R + z * z, 1.5));

/* ------------------------------------------------------------------ */
/* Spule                                                                */
/* ------------------------------------------------------------------ */

/** Ideale lange Spule: B = μ₀·μ_r·N·I / l. */
export const solenoidB = (N: number, I: number, l: number, mur = 1) => (MU0 * mur * N * I) / l;
/** Windungszahl pro Länge n = N/l (1/m). */
export const turnDensity = (N: number, l: number) => N / l;

/**
 * Feld auf der Achse einer Spule endlicher Länge (Länge l, Radius R) im
 * Abstand z von der Mitte: B = μ₀·N·I/(2l)·[(z + l/2)/√((z + l/2)² + R²) − (z − l/2)/√((z − l/2)² + R²)].
 */
export function solenoidAxisB(N: number, I: number, l: number, R: number, z: number): number {
  const a = z + l / 2;
  const b = z - l / 2;
  return ((MU0 * N * I) / (2 * l)) * (a / Math.hypot(a, R) - b / Math.hypot(b, R));
}

export interface Coil {
  /** Windungszahl (echt) */
  N: number;
  I: number;
  /** Länge und Radius in m */
  l: number;
  R: number;
  /** Zahl der gerechneten Ersatzwindungen (für das Feldbild) */
  loops?: number;
}

/**
 * Feld einer Spule (Achse = x) im Längsschnitt am Ort (x, y): Summe von
 * Ersatz-Kreisströmen, die zusammen N·I tragen. Liefert [B_x, B_y].
 */
export function coilField(c: Coil, x: number, y: number): V2 {
  const n = Math.max(1, Math.round(c.loops ?? Math.min(c.N, 40)));
  const Ieach = (c.N * c.I) / n;
  let bx = 0;
  let by = 0;
  for (let i = 0; i < n; i++) {
    const zi = n === 1 ? 0 : -c.l / 2 + (c.l * (i + 0.5)) / n;
    const [br, bz] = loopField(c.R, Ieach, y, x - zi);
    bx += bz;
    by += br;
  }
  return [bx, by];
}

/* ------------------------------------------------------------------ */
/* Feldlinien                                                           */
/* ------------------------------------------------------------------ */

export interface TraceOpts {
  step: number;
  maxSteps: number;
  box: { x0: number; x1: number; y0: number; y1: number };
  /** Abbruch, wenn die Linie einem dieser Punkte zu nahe kommt */
  stops?: readonly { x: number; y: number; r: number }[];
  /** Abbruch, wenn die Linie zum Start zurückkehrt (geschlossene Linie) */
  closeTol?: number;
}

/**
 * Feldlinie ab (x, y) in Feldrichtung (dir = 1) oder dagegen (dir = −1),
 * RK4 mit normierter Richtung. Liefert die Punkte und ob die Linie sich
 * geschlossen hat.
 */
export function traceLine(field: (x: number, y: number) => V2, x0: number, y0: number, o: TraceOpts, dir: 1 | -1 = 1): { pts: V2[]; closed: boolean } {
  const pts: V2[] = [[x0, y0]];
  const f = (x: number, y: number): V2 => {
    const [bx, by] = field(x, y);
    const L = Math.hypot(bx, by);
    if (!(L > 0) || !Number.isFinite(L)) return [0, 0];
    return [(dir * bx) / L, (dir * by) / L];
  };
  let x = x0;
  let y = y0;
  const h = o.step;
  let travelled = 0;
  for (let i = 0; i < o.maxSteps; i++) {
    const k1 = f(x, y);
    if (k1[0] === 0 && k1[1] === 0) break;
    const k2 = f(x + (h / 2) * k1[0], y + (h / 2) * k1[1]);
    const k3 = f(x + (h / 2) * k2[0], y + (h / 2) * k2[1]);
    const k4 = f(x + h * k3[0], y + h * k3[1]);
    x += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    travelled += h;
    pts.push([x, y]);
    if (x < o.box.x0 || x > o.box.x1 || y < o.box.y0 || y > o.box.y1) break;
    if (o.stops?.some((s) => Math.hypot(x - s.x, y - s.y) < s.r)) break;
    if (o.closeTol && travelled > 6 * h && Math.hypot(x - x0, y - y0) < o.closeTol) {
      pts.push([x0, y0]);
      return { pts, closed: true };
    }
  }
  return { pts, closed: false };
}

/* ------------------------------------------------------------------ */
/* Relais                                                               */
/* ------------------------------------------------------------------ */

export interface RelaySpec {
  /** Windungszahl der Relaisspule */
  N: number;
  /** Durchflutung N·I, ab der der Anker anzieht (A) */
  pullIn: number;
  /** Durchflutung, unter der der Anker wieder abfällt (A), kleiner als pullIn (Hysterese) */
  dropOut: number;
}
export const RELAY: RelaySpec = { N: 400, pullIn: 60, dropOut: 35 };

/** Neuer Zustand des Ankers (angezogen?) bei Stromstärke I mit Hysterese. */
export function relayState(spec: RelaySpec, I: number, wasOn: boolean): boolean {
  const theta = spec.N * Math.abs(I);
  return wasOn ? theta >= spec.dropOut : theta >= spec.pullIn;
}

/** Zugkraft auf den Anker (vereinfacht ∝ (N·I)², bei kleinem Luftspalt größer), in N. */
export function relayForce(spec: RelaySpec, I: number, gap: number): number {
  const theta = spec.N * I;
  return (2.5e-5 * theta * theta) / Math.pow(0.4 + gap / 1e-3, 2);
}

/* ------------------------------------------------------------------ */
/* Gleichstrommotor                                                     */
/* ------------------------------------------------------------------ */

export interface MotorSpec {
  /** Windungen der Läuferspule */
  N: number;
  /** Fläche der Spule in m² */
  A: number;
  /** Flussdichte des Feldmagneten in T */
  B: number;
  /** Trägheitsmoment in kg·m² */
  J: number;
  /** Reibung (Drehmoment pro Winkelgeschwindigkeit) in N·m·s */
  k: number;
}
export const MOTOR: MotorSpec = { N: 50, A: 0.0012, B: 0.25, J: 2e-5, k: 4e-5 };

/**
 * Drehmoment auf die Läuferspule beim Winkel φ (φ = 0: Spulenfläche
 * senkrecht zum Feld, Totpunkt). Mit Stromwender (Kommutator) wird der Strom
 * jede halbe Umdrehung umgepolt: M = N·B·I·A·|sin φ| (immer gleiche Richtung).
 * Ohne Stromwender: M = N·B·I·A·sin φ (Pendeln um den Totpunkt).
 */
export function motorTorque(m: MotorSpec, I: number, phi: number, commutator = true): number {
  const s = Math.sin(phi);
  return m.N * m.B * I * m.A * (commutator ? Math.abs(s) : s);
}

/** Stromrichtung in der Spule beim Winkel φ mit Stromwender (+1/−1). */
export const commutatorSign = (phi: number) => (Math.sin(phi) >= 0 ? 1 : -1);

/** Ein Zeitschritt der Drehbewegung (semi-implizites Euler-Verfahren). */
export function motorStep(m: MotorSpec, I: number, phi: number, omega: number, dt: number, commutator = true): [number, number] {
  const M = motorTorque(m, I, phi, commutator) - m.k * omega;
  const w = omega + (M / m.J) * dt;
  return [phi + w * dt, w];
}

/** Größtes Drehmoment N·B·I·A. */
export const motorMaxTorque = (m: MotorSpec, I: number) => m.N * m.B * I * m.A;

/* ------------------------------------------------------------------ */
/* Messreihe                                                            */
/* ------------------------------------------------------------------ */

/** Messreihe B(I) einer Spule (ideal) für I = 0 … Imax. */
export function seriesBI(N: number, l: number, mur: number, Imax: number, n = 6): V2[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const I = (Imax * i) / n;
    return [I, solenoidB(N, I, l, mur)];
  });
}
