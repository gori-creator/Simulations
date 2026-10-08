/**
 * Rechenlogik „Hebelgesetz“.
 *
 * Ein Hebel ist im Gleichgewicht, wenn die linksdrehenden und die
 * rechtsdrehenden Drehmomente gleich groß sind:
 *
 *   F₁ · a₁ = F₂ · a₂      (Drehmoment M = F · a, a: Kraftarm)
 *
 * Der Kraftarm ist der Abstand der Wirkungslinie der Kraft von der
 * Drehachse. Zieht man schräg am Hebel, wird er kleiner: a = r · sin β
 * (r: Abstand des Angriffspunkts von der Achse, β: Winkel zwischen Hebel
 * und Zugrichtung).
 *
 * Vorzeichen: Winkel und Drehmomente sind mathematisch positiv, also gegen
 * den Uhrzeigersinn („linksdrehend“). Stellen auf dem Hebel werden in
 * Lochabständen gezählt, links negativ, rechts positiv.
 */

/** Ortsfaktor in N/kg. */
export const G = 9.81;
/** Masse eines Massestücks in kg. */
export const PIECE_MASS = 0.05;
/** Gewichtskraft eines Massestücks in N. */
export const PIECE_FORCE = PIECE_MASS * G;
/** Lochabstand in m. */
export const HOLE = 0.05;
/** Löcher auf jeder Seite der Drehachse. */
export const HOLES = 10;
/** Höchstens so weit kann der Hebel kippen (Anschlag), in rad. */
export const MAX_TILT = (13 * Math.PI) / 180;
/**
 * Rückstellmoment des Hebels selbst in N·m (Masse · g · Abstand des
 * Schwerpunkts unter der Achse). Der Zeiger mit dem kleinen Gegengewicht
 * liegt unter der Achse, deshalb kehrt ein Hebel im Gleichgewicht in die
 * Waagerechte zurück (stabiles Gleichgewicht).
 */
export const RESTORING = 0.075;
/**
 * Trägheit der Drehbewegung: leerer Hebel in kg·m² und Anteil, mit dem die
 * Massestücke zählen. Beides ist so gewählt, dass die Bewegung zügig und gut
 * sichtbar ist – der zeitliche Ablauf ist nur qualitativ.
 */
export const BEAM_INERTIA = 0.004;
export const LOAD_INERTIA_FACTOR = 0.3;
/** Dämpfungsgrad der Drehbewegung. */
export const DAMPING_RATIO = 0.33;
/**
 * Reibung in der Achse in N·m: Kleinere Unterschiede der Drehmomente (z. B.
 * durch das Runden der Kraftmesser-Anzeige) bewegen den Hebel nicht.
 */
export const AXLE_FRICTION = 0.003;

/** Massestücke an einer Stelle: Anzahl n, Stelle x in Lochabständen (−10 … 10). */
export interface Load {
  n: number;
  x: number;
}

/** Kraftmesser: Stelle x, Zugrichtung (Grad, gegen die Waagerechte nach rechts, gegen den Uhrzeigersinn), Kraft F in N. */
export interface Meter {
  x: number;
  dir: number;
  F: number;
}

export interface Lever {
  loads: Load[];
  meter: Meter | null;
}

/** Gewichtskraft von n Massestücken. */
export function loadForce(n: number): number {
  return Math.max(0, n) * PIECE_FORCE;
}

/** Abstand einer Stelle von der Achse in m. */
export function armOf(x: number): number {
  return Math.abs(x) * HOLE;
}

/** Drehmoment (gegen den Uhrzeigersinn positiv) von Massestücken bei waagerechtem Hebel. */
export function loadTorque(load: Load): number {
  return -loadForce(load.n) * load.x * HOLE;
}

/** Wirksamer Kraftarm des Kraftmessers (Abstand der Wirkungslinie von der Achse) bei waagerechtem Hebel. */
export function meterArm(meter: Meter): number {
  return Math.abs(meter.x * HOLE * Math.sin((meter.dir * Math.PI) / 180));
}

/** Drehmoment des Kraftmessers bei waagerechtem Hebel. */
export function meterTorque(meter: Meter): number {
  return meter.x * HOLE * meter.F * Math.sin((meter.dir * Math.PI) / 180);
}

export interface TorqueBalance {
  /** Summe der linksdrehenden Drehmomente (≥ 0). */
  ccw: number;
  /** Summe der rechtsdrehenden Drehmomente (≥ 0). */
  cw: number;
  /** Überschuss: positiv = dreht linksherum. */
  net: number;
}

/** Links- und rechtsdrehende Drehmomente bei waagerechtem Hebel. */
export function balance(lever: Lever): TorqueBalance {
  let ccw = 0;
  let cw = 0;
  const add = (m: number) => {
    if (m > 0) ccw += m;
    else cw -= m;
  };
  for (const load of lever.loads) add(loadTorque(load));
  if (lever.meter) add(meterTorque(lever.meter));
  return { ccw, cw, net: ccw - cw };
}

/** Gilt das Hebelgesetz (innerhalb der Reibung in der Achse)? */
export function isBalanced(lever: Lever, tolerance = AXLE_FRICTION): boolean {
  return Math.abs(balance(lever).net) <= tolerance;
}

/**
 * Drehmoment auf den um φ (rad) geneigten Hebel. Die Massestücke hängen
 * immer senkrecht, ihr Kraftarm ist x · cos φ. Der Kraftmesser behält seine
 * Zugrichtung im Raum. Dazu kommt das Rückstellmoment des Hebels selbst.
 * Die Reibung in der Achse verschluckt sehr kleine Drehmomente.
 */
export function torqueAt(lever: Lever, phi: number): number {
  let m = 0;
  for (const load of lever.loads) m += loadTorque(load) * Math.cos(phi);
  if (lever.meter) {
    const { x, dir, F } = lever.meter;
    m += x * HOLE * F * Math.sin((dir * Math.PI) / 180 - phi);
  }
  const drive = Math.sign(m) * Math.max(0, Math.abs(m) - AXLE_FRICTION);
  return drive - RESTORING * Math.sin(phi);
}

/**
 * Neigung, in der der Hebel zur Ruhe kommt (rad): Nullstelle des
 * Drehmoments zwischen den Anschlägen oder der Anschlag selbst.
 */
export function restAngle(lever: Lever): number {
  let lo = -MAX_TILT;
  let hi = MAX_TILT;
  const fLo = torqueAt(lever, lo);
  const fHi = torqueAt(lever, hi);
  // Dreht der Hebel auch am Anschlag noch weiter, bleibt er dort liegen.
  if (fHi >= 0) return MAX_TILT;
  if (fLo <= 0) return -MAX_TILT;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (torqueAt(lever, mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Kraft, die der Kraftmesser aufbringen muss, damit der Hebel waagerecht
 * im Gleichgewicht ist. `null`, wenn das in dieser Zugrichtung nicht geht
 * (Wirkungslinie durch die Achse oder falsche Richtung).
 */
export function balancingForce(loads: readonly Load[], meter: Omit<Meter, 'F'>): number | null {
  const lever = meter.x * HOLE * Math.sin((meter.dir * Math.PI) / 180);
  if (Math.abs(lever) < 1e-9) return null;
  const m = loads.reduce((sum, load) => sum + loadTorque(load), 0);
  const F = -m / lever;
  return F >= 0 ? F : null;
}

/** Trägheitsmoment des Hebels mit Massestücken (Punktmassen an den Löchern, siehe LOAD_INERTIA_FACTOR). */
export function inertia(lever: Lever): number {
  const loads = lever.loads.reduce((sum, load) => sum + Math.max(0, load.n) * PIECE_MASS * (load.x * HOLE) ** 2, 0);
  return BEAM_INERTIA + LOAD_INERTIA_FACTOR * loads;
}

export interface Motion {
  phi: number;
  omega: number;
}

/**
 * Ein Zeitschritt der gedämpften Drehbewegung (semi-implizites Euler-
 * Verfahren) mit Anschlägen, an denen der Hebel kaum zurückprallt.
 */
export function stepMotion(lever: Lever, state: Motion, h: number): Motion {
  const I = inertia(lever);
  const c = 2 * DAMPING_RATIO * Math.sqrt(RESTORING * I);
  let omega = state.omega + ((torqueAt(lever, state.phi) - c * state.omega) / I) * h;
  let phi = state.phi + omega * h;
  if (phi > MAX_TILT) {
    phi = MAX_TILT;
    omega = omega > 0 ? -omega * 0.18 : omega;
  } else if (phi < -MAX_TILT) {
    phi = -MAX_TILT;
    omega = omega < 0 ? -omega * 0.18 : omega;
  }
  return { phi, omega };
}

/* ------------------------------------------------------------------ */
/* Hebel im Alltag                                                      */
/* ------------------------------------------------------------------ */

/**
 * Nötige Kraft am Kraftarm, damit ein Hebel die Last hält:
 * F_K = F_L · a_L / a_K.
 */
export function effortForce(load: number, loadArm: number, effortArm: number): number {
  if (!(effortArm > 0)) return Infinity;
  return (load * loadArm) / effortArm;
}

/**
 * Goldene Regel der Mechanik am Hebel: Bewegt sich die Hand um s_K, bewegt
 * sich die Last um s_L = s_K · a_L / a_K. Die Arbeit F · s ist auf beiden
 * Seiten gleich.
 */
export function loadTravel(effortTravel: number, loadArm: number, effortArm: number): number {
  if (!(effortArm > 0)) return 0;
  return (effortTravel * loadArm) / effortArm;
}
