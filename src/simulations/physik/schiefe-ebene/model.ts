/**
 * Rechenlogik „Schiefe Ebene“.
 *
 * Die Gewichtskraft F_G = m · g eines Körpers auf einer um α geneigten Ebene
 * wird in zwei Komponenten zerlegt:
 *   Hangabtriebskraft  F_H = F_G · sin α  (parallel zur Ebene, hangabwärts)
 *   Normalkraft        F_N = F_G · cos α  (senkrecht zur Ebene, drückt den Körper an)
 * Mit h/l = sin α gilt auch F_H = F_G · h / l.
 *
 * Reibung: Der Körper haftet, solange die Kraft parallel zur Ebene höchstens
 * F_R,max = μ_H · F_N beträgt. Gleitet er, bremst die Gleitreibungskraft
 * F_R = μ_G · F_N. Ohne Zugkraft rutscht er also ab dem Grenzwinkel
 * tan α_G = μ_H und gleitet dann mit a = g · (sin α − μ_G · cos α).
 *
 * Richtungen entlang der Ebene: hangabwärts positiv.
 */

/** Ortsfaktor in N/kg. */
export const G = 9.81;

export type MaterialId = 'wood' | 'steel' | 'rubber' | 'ice';

/** Richtwerte für Haft- und Gleitreibungszahlen (je nach Oberfläche sehr unterschiedlich). */
export const MATERIALS: Record<MaterialId, { muH: number; muG: number }> = {
  wood: { muH: 0.5, muG: 0.3 },
  steel: { muH: 0.15, muG: 0.1 },
  rubber: { muH: 0.9, muG: 0.8 },
  ice: { muH: 0.03, muG: 0.01 },
};

/** Sehr kleine Rollreibung des Wagens (als Reibungszahl). */
export const ROLLING = 0.005;

const rad = (deg: number) => (deg * Math.PI) / 180;

export interface InclineForces {
  FG: number;
  FH: number;
  FN: number;
  /** größte Haftreibungskraft μ_H · F_N */
  FRmax: number;
  /** Gleitreibungskraft μ_G · F_N */
  FRslide: number;
}

export function inclineForces(m: number, alphaDeg: number, muH: number, muG: number, g = G): InclineForces {
  const FG = m * g;
  const FH = FG * Math.sin(rad(alphaDeg));
  const FN = FG * Math.cos(rad(alphaDeg));
  return { FG, FH, FN, FRmax: muH * FN, FRslide: muG * FN };
}

/** Grenzwinkel der Haftreibung in Grad: tan α_G = μ_H. */
export function limitAngle(muH: number): number {
  return (Math.atan(Math.max(0, muH)) * 180) / Math.PI;
}

/** Beschleunigung beim Abwärtsgleiten ohne Zugkraft: a = g · (sin α − μ_G · cos α), höchstens 0 wenn er nicht rutscht. */
export function slideAcceleration(alphaDeg: number, muG: number, g = G): number {
  return g * (Math.sin(rad(alphaDeg)) - muG * Math.cos(rad(alphaDeg)));
}

/**
 * Bereich der Zugkraft (parallel zur Ebene, hangaufwärts), in dem ein
 * ruhender Körper liegen bleibt: von F_H − F_R,max (mindestens 0) bis F_H + F_R,max.
 */
export function holdRange(f: InclineForces): [number, number] {
  return [Math.max(0, f.FH - f.FRmax), f.FH + f.FRmax];
}

/** Zugkraft, um den Körper gleichförmig hangaufwärts zu ziehen: F_H + F_R (Gleitreibung). */
export function pullUpForce(f: InclineForces): number {
  return f.FH + f.FRslide;
}

export interface SlideState {
  /** Weg entlang der Ebene (hangabwärts positiv) in m. */
  s: number;
  /** Geschwindigkeit (hangabwärts positiv) in m/s. */
  v: number;
}

/**
 * Ein Zeitschritt der Bewegung entlang der Ebene mit Haft- und Gleitreibung.
 * `pull` ist die Zugkraft hangaufwärts in N. Gibt zusätzlich die Beschleunigung
 * und die momentane Reibungskraft (hangabwärts positiv) zurück.
 */
export function slideStep(state: SlideState, m: number, f: InclineForces, pull: number, h: number): SlideState & { a: number; friction: number; resting: boolean } {
  const D = f.FH - pull;
  const { s, v } = state;
  if (v === 0 && Math.abs(D) <= f.FRmax) return { s, v: 0, a: 0, friction: -D, resting: true };
  const dir = v !== 0 ? Math.sign(v) : Math.sign(D);
  const friction = -dir * f.FRslide;
  const a = (D + friction) / m;
  let v1 = v + a * h;
  // Kommt der Körper innerhalb des Schritts zum Stillstand, kann ihn die Haftreibung halten
  if (v !== 0 && Math.sign(v1) !== Math.sign(v) && Math.abs(D) <= f.FRmax) {
    const tStop = Math.abs(v / a);
    return { s: s + (v * tStop) / 2, v: 0, a: 0, friction: -D, resting: true };
  }
  if (v === 0 && Math.sign(v1) !== Math.sign(D)) v1 = 0;
  return { s: s + ((v + v1) / 2) * h, v: v1, a, friction, resting: false };
}
