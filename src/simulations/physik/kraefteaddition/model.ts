/**
 * Rechenlogik „Kräfte addieren und zerlegen“.
 *
 * Kräfte sind gerichtete Größen (Vektoren): Betrag F in N und Richtung,
 * hier als Winkel in Grad gegen die Waagerechte nach rechts (gegen den
 * Uhrzeigersinn positiv). Kräfte mit gemeinsamem Angriffspunkt werden mit
 * dem Kräfteparallelogramm bzw. durch Aneinanderhängen (Kräftepolygon)
 * addiert; rechnerisch addiert man die Komponenten.
 */

/** Ortsfaktor in N/kg. */
export const G = 9.81;

export type Vec = [number, number];

export interface Force {
  /** Betrag in N. */
  F: number;
  /** Richtung in Grad. */
  deg: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Kraft als Vektor (x nach rechts, y nach oben). */
export function toVec(force: Force): Vec {
  return [force.F * Math.cos(rad(force.deg)), force.F * Math.sin(rad(force.deg))];
}

/** Vektor als Betrag und Richtung (Richtung im Bereich −180° < φ ≤ 180°). */
export function toForce(v: Vec): Force {
  const F = Math.hypot(v[0], v[1]);
  if (F < 1e-12) return { F: 0, deg: 0 };
  let d = deg(Math.atan2(v[1], v[0]));
  if (d <= -180 + 1e-9) d = 180;
  return { F, deg: d };
}

export function addVec(...vs: Vec[]): Vec {
  return vs.reduce<Vec>((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
}

/** Resultierende mehrerer Kräfte mit gemeinsamem Angriffspunkt. */
export function resultant(forces: readonly Force[]): Force & { x: number; y: number } {
  const [x, y] = addVec(...forces.map(toVec));
  return { ...toForce([x, y]), x, y };
}

/** Winkel zwischen zwei Richtungen (0° … 180°). */
export function angleBetween(deg1: number, deg2: number): number {
  const d = Math.abs((((deg2 - deg1) % 360) + 540) % 360 - 180);
  return d;
}

/**
 * Betrag der Resultierenden zweier Kräfte, die den Winkel γ einschließen:
 * F_R² = F₁² + F₂² + 2 · F₁ · F₂ · cos γ (bei γ = 90° der Satz des Pythagoras).
 */
export function resultantMagnitude(F1: number, F2: number, gammaDeg: number): number {
  return Math.sqrt(Math.max(0, F1 * F1 + F2 * F2 + 2 * F1 * F2 * Math.cos(rad(gammaDeg))));
}

/**
 * Zerlegt eine Kraft in Komponenten entlang zweier Richtungen d₁ und d₂:
 * F = a · e₁ + b · e₂ (e: Einheitsvektoren). a und b haben ein Vorzeichen:
 * negativ heißt, die Komponente zeigt entgegen der gewählten Richtung.
 * `null`, wenn die Richtungen parallel sind.
 */
export function decompose(force: Force, d1: number, d2: number): { a: number; b: number } | null {
  const [fx, fy] = toVec(force);
  const e1: Vec = [Math.cos(rad(d1)), Math.sin(rad(d1))];
  const e2: Vec = [Math.cos(rad(d2)), Math.sin(rad(d2))];
  const det = e1[0] * e2[1] - e1[1] * e2[0];
  if (Math.abs(det) < 1e-3) return null;
  return { a: (fx * e2[1] - fy * e2[0]) / det, b: (e1[0] * fy - e1[1] * fx) / det };
}

/**
 * Seilkraft, wenn eine Last mit der Gewichtskraft F_G in der Mitte zwischen
 * zwei gleich hohen Aufhängepunkten hängt und jedes Seil unter dem Winkel α
 * gegen die Waagerechte verläuft: F_S = F_G / (2 · sin α).
 */
export function ropeForce(weight: number, alphaDeg: number): number {
  const s = Math.sin(rad(alphaDeg));
  return s > 0 ? weight / (2 * s) : Infinity;
}

/** Winkel der Seile gegen die Waagerechte aus halbem Abstand der Aufhängepunkte und Durchhang. */
export function sagAngle(halfSpan: number, sag: number): number {
  return deg(Math.atan2(Math.max(0, sag), halfSpan));
}
