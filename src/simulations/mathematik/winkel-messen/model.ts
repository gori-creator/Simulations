/**
 * Rechenlogik „Winkel schätzen und messen“ (Jahrgangsstufe 5).
 *
 * Richtungen werden in Grad gegen den Uhrzeigersinn angegeben (0° zeigt nach
 * rechts). Der Winkel α = ∢ASB ist – wie im bayerischen Unterricht üblich –
 * der Winkel, um den man den Schenkel [SA gegen den Uhrzeigersinn drehen muss,
 * bis er auf [SB liegt. Er liegt zwischen 0° und 360°.
 *
 * Das Geodreieck hat zwei Winkelskalen von 0° bis 180°: Die äußere beginnt
 * am rechten Ende der Zeichenkante, die innere am linken. Liegt der
 * Nullpunkt auf dem Scheitel und die Zeichenkante auf einem Schenkel, liest
 * man an der Skala ab, die auf diesem Schenkel bei 0 beginnt.
 */

export type AngleType = 'null' | 'spitz' | 'recht' | 'stumpf' | 'gestreckt' | 'ueberstumpf' | 'voll';
export type Leg = 'A' | 'B';

/** Rest modulo 360 im Bereich [0, 360). */
export function norm(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Kleinster Unterschied zweier Richtungen (0…180°). */
export function dirDiff(a: number, b: number): number {
  const d = norm(a - b);
  return d > 180 ? 360 - d : d;
}

/** ∢ASB: Drehung von der Richtung des ersten zum zweiten Schenkel gegen den Uhrzeigersinn. */
export function angleBetween(dirA: number, dirB: number): number {
  return norm(dirB - dirA);
}

/** Winkelart nach der Größe. */
export function angleType(alpha: number): AngleType {
  if (alpha <= 0) return 'null';
  if (alpha < 90) return 'spitz';
  if (alpha === 90) return 'recht';
  if (alpha < 180) return 'stumpf';
  if (alpha === 180) return 'gestreckt';
  if (alpha < 360) return 'ueberstumpf';
  return 'voll';
}

/**
 * Neuer Winkel beim Ziehen des zweiten Schenkels: Über die Lage des ersten
 * Schenkels hinweg springt der Wert nicht von 359° auf 0°, sondern bleibt
 * bei 360° bzw. 0° stehen. In der Nähe von 90°, 180° und 270° rastet er ein.
 */
export function dragAngle(prev: number, raw: number, magnet = 2): number {
  let a = norm(raw);
  if (prev > 270 && a < 90) a = 360;
  else if (prev < 90 && a > 270) a = 0;
  for (const m of [0, 90, 180, 270, 360]) if (Math.abs(a - m) <= magnet) return m;
  return Math.round(a);
}

/* ------------------------------------------------------------------ */
/* Messen mit dem Geodreieck und dem Vollkreis-Winkelmesser            */
/* ------------------------------------------------------------------ */

export interface ToolPose {
  /** Liegt der Nullpunkt auf dem Scheitel? */
  atS: boolean;
  /** Richtung vom Nullpunkt zum rechten Ende der Zeichenkante (Geodreieck) bzw. zur Nulllinie (Vollkreis). */
  phi: number;
}

export type Measurement =
  | { ok: false; reason: 'notAtS' | 'noEdge' | 'notUnder' }
  | {
      ok: true;
      /** Schenkel, auf dem die Zeichenkante (bzw. Nulllinie) liegt. */
      edge: Leg;
      /** Abgelesene Skala beim Geodreieck: außen (beginnt rechts) oder innen (beginnt links). */
      scale: 'outer' | 'inner' | 'full';
      /** Abgelesener Wert. */
      reading: number;
      /** Wert auf der jeweils anderen Skala (nur Geodreieck). */
      other: number | null;
      /** Ist der abgelesene Winkel α selbst oder seine Ergänzung zu 360°? */
      what: 'alpha' | 'complement';
    };

/**
 * Was zeigt das Messgerät an? `a1` ist die Richtung von [SA, `alpha` der
 * Winkel ∢ASB, `tol` die Toleranz in Grad für „liegt auf dem Schenkel“.
 */
export function measure(tool: 'geo' | 'voll', pose: ToolPose, a1: number, alpha: number, tol = 0.5): Measurement {
  if (!pose.atS) return { ok: false, reason: 'notAtS' };
  const dirs: Record<Leg, number> = { A: norm(a1), B: norm(a1 + alpha) };
  const legs: Leg[] = ['A', 'B'];
  if (tool === 'voll') {
    const edge = legs.find((l) => dirDiff(dirs[l], pose.phi) <= tol);
    if (!edge) return { ok: false, reason: 'noEdge' };
    const otherLeg: Leg = edge === 'A' ? 'B' : 'A';
    let reading = Math.round(norm(dirs[otherLeg] - dirs[edge]));
    // Gleiche Richtung: Vollwinkel bzw. Nullwinkel
    if (reading === 0 && alpha === 360) reading = 360;
    const what = edge === 'A' ? 'alpha' : 'complement';
    return { ok: true, edge, scale: 'full', reading, other: null, what: reading === alpha ? 'alpha' : what };
  }
  // Geodreieck: Zeichenkante auf einem Schenkel, Nullpunkt der äußeren (phi) oder inneren (phi + 180) Skala
  let edge: Leg | null = null;
  let scale: 'outer' | 'inner' = 'outer';
  for (const l of legs) {
    if (dirDiff(dirs[l], pose.phi) <= tol) {
      edge = l;
      scale = 'outer';
      break;
    }
    if (dirDiff(dirs[l], pose.phi + 180) <= tol) {
      edge = l;
      scale = 'inner';
      break;
    }
  }
  if (!edge) return { ok: false, reason: 'noEdge' };
  const otherLeg: Leg = edge === 'A' ? 'B' : 'A';
  // Lage des anderen Schenkels über der Zeichenkante (0° rechts … 180° links)
  let theta = norm(dirs[otherLeg] - pose.phi);
  if (theta > 359.5) theta = 0;
  if (theta > 180 + tol) return { ok: false, reason: 'notUnder' };
  theta = Math.min(180, theta);
  const outer = Math.round(theta);
  const inner = 180 - outer;
  const reading = scale === 'outer' ? outer : inner;
  const otherVal = scale === 'outer' ? inner : outer;
  // Welcher Winkel ist das? Der vom Kantenschenkel aus über das Geodreieck gemessene.
  const what: 'alpha' | 'complement' = reading === alpha || (alpha === 360 && reading === 0) ? 'alpha' : 'complement';
  return { ok: true, edge, scale, reading, other: otherVal, what };
}

/** Wie das Messgerät richtig angelegt wird: bis 180° an [SA, sonst Ergänzungswinkel an [SB. */
export function idealPose(tool: 'geo' | 'voll', a1: number, alpha: number): { leg: Leg; phi: number } {
  if (tool === 'voll' || alpha <= 180) return { leg: 'A', phi: norm(a1) };
  return { leg: 'B', phi: norm(a1 + alpha) };
}

/* ------------------------------------------------------------------ */
/* Schätzspiel                                                         */
/* ------------------------------------------------------------------ */

export type TaskKind = 'schaetzen' | 'zeichnen';

export interface Task {
  kind: TaskKind;
  /** Gesuchter (zeichnen) bzw. gezeigter (schätzen) Winkel in Grad. */
  target: number;
  /** Richtung des ersten Schenkels. */
  a1: number;
}

/**
 * Neue Aufgabe: etwa 35 % spitze, 35 % stumpfe und 30 % überstumpfe Winkel.
 * Zum Zeichnen werden Vielfache von 5° verlangt.
 */
export function makeTask(rand: () => number, kind: TaskKind, prev?: number): Task {
  let target = 0;
  for (let i = 0; i < 20; i++) {
    const r = rand();
    const [lo, hi] = r < 0.35 ? [12, 85] : r < 0.7 ? [95, 170] : [190, 345];
    target = lo + Math.floor(rand() * (hi - lo + 1));
    if (kind === 'zeichnen') target = Math.max(lo, Math.min(hi, Math.round(target / 5) * 5));
    if (prev === undefined || Math.abs(target - prev) >= 15) break;
  }
  // Erster Schenkel in beliebiger Lage, aber nicht immer waagerecht
  const a1 = rand() < 0.25 ? 0 : Math.floor(rand() * 72) * 5;
  return { kind, target, a1 };
}

/** Punkte nach Abweichung: ≤ 3° Volltreffer (3), ≤ 10° (2), ≤ 20° (1), sonst 0. */
export function points(deviation: number): 0 | 1 | 2 | 3 {
  const d = Math.abs(deviation);
  if (d <= 3) return 3;
  if (d <= 10) return 2;
  if (d <= 20) return 1;
  return 0;
}

/** Abweichung zweier Winkel (beide 0…360°). */
export function deviation(a: number, b: number): number {
  return Math.abs(a - b);
}
