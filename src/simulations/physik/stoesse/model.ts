/**
 * Rechenlogik „Elastische und unelastische Stöße“.
 *
 * Zwei Gleiter (Massen m₁, m₂) bewegen sich reibungsfrei auf einer
 * Luftkissenbahn und stoßen zentral (gerader Stoß). Gleiter 1 ist immer der
 * linke. Der Stoß selbst wird als augenblicklich angenommen.
 *
 * Für jede Stoßart gilt die Impulserhaltung
 *   m₁·v₁ + m₂·v₂ = m₁·v₁' + m₂·v₂'.
 * Die Stoßzahl k beschreibt, wie schnell sich die Körper nach dem Stoß
 * wieder voneinander entfernen:
 *   v₂' − v₁' = k · (v₁ − v₂)
 * (k = 1: elastisch, k = 0: vollkommen unelastisch, dazwischen teilelastisch).
 * Mit der Schwerpunktsgeschwindigkeit v_S = (m₁v₁ + m₂v₂)/(m₁ + m₂) folgt
 *   v₁' = v_S − k·(v₁ − v_S),   v₂' = v_S − k·(v₂ − v_S).
 */

export type CollisionType = 'el' | 'inel' | 'part';

/** Stoßzahl k zur Stoßart (bei „teilelastisch“ der eingestellte Wert). */
export function restitution(type: CollisionType, k: number): number {
  if (type === 'el') return 1;
  if (type === 'inel') return 0;
  return Math.min(1, Math.max(0, k));
}

/** Impuls p = m · v in kg·m/s. */
export function momentum(m: number, v: number): number {
  return m * v;
}

/** Bewegungsenergie E = ½ · m · v² in J. */
export function kineticEnergy(m: number, v: number): number {
  return 0.5 * m * v * v;
}

/** Geschwindigkeit des gemeinsamen Schwerpunkts v_S = (m₁v₁ + m₂v₂)/(m₁ + m₂). */
export function centerOfMassVelocity(m1: number, v1: number, m2: number, v2: number): number {
  return (m1 * v1 + m2 * v2) / (m1 + m2);
}

/** Stoßen die Gleiter überhaupt zusammen? Gleiter 1 (links) muss schneller nach rechts sein als Gleiter 2. */
export function approaching(v1: number, v2: number): boolean {
  return v1 - v2 > 1e-9;
}

/** Geschwindigkeiten nach einem geraden Stoß mit der Stoßzahl k. */
export function collide(m1: number, v1: number, m2: number, v2: number, k: number): { v1: number; v2: number } {
  const vs = centerOfMassVelocity(m1, v1, m2, v2);
  return { v1: vs - k * (v1 - vs), v2: vs - k * (v2 - vs) };
}

/**
 * Bewegungsenergie, die beim Stoß in innere Energie (Verformung, Wärme)
 * umgewandelt wird: ΔE = ½ · m₁m₂/(m₁ + m₂) · (1 − k²) · (v₁ − v₂)².
 */
export function energyLoss(m1: number, v1: number, m2: number, v2: number, k: number): number {
  const mu = (m1 * m2) / (m1 + m2);
  return 0.5 * mu * (1 - k * k) * (v1 - v2) ** 2;
}

/** Abmessungen der Luftkissenbahn in m. */
export interface TrackGeometry {
  /** Nutzbare Länge der Bahn. */
  length: number;
  /** Länge eines Gleiters. */
  glider: number;
  /** Abstand der Gleiter zu den Bahnenden, der frei bleiben soll. */
  margin: number;
}

export const TRACK: TrackGeometry = { length: 1.6, glider: 0.2, margin: 0.05 };

/**
 * Ablauf eines Versuchs: Startorte (Mitten der Gleiter), Zeitpunkt des Stoßes
 * und Ende der Messung. Die Startorte werden so gewählt, dass die Bewegung die
 * Bahn gut ausnutzt und kein Gleiter das Bahnende erreicht.
 */
export interface Run {
  m1: number;
  m2: number;
  /** Geschwindigkeiten vor dem Stoß in m/s. */
  v1: number;
  v2: number;
  /** Geschwindigkeiten nach dem Stoß in m/s (ohne Stoß gleich v1, v2). */
  w1: number;
  w2: number;
  /** Stoßzahl. */
  k: number;
  /** Findet ein Stoß statt? */
  collides: boolean;
  /** Zeitpunkt des Stoßes in s (ohne Stoß: Infinity). */
  tc: number;
  /** Ende der Messung in s. */
  tEnd: number;
  /** Mitten der Gleiter zu Beginn in m. */
  x1: number;
  x2: number;
}

/** Vor dem Stoß etwa so lange wie danach (Verhältnis der Zeitabschnitte). */
const PRE = 1;
const POST = 1.25;
/** Höchstdauer der Abschnitte bei sehr langsamen Gleitern (in s). */
const MAX_SCALE = 2.4;
/** Abstand der Gleiter, wenn sie nicht zusammenstoßen (in m). */
const FREE_GAP = 0.3;

export function planRun(m1: number, v1: number, m2: number, v2: number, k: number, geo: TrackGeometry = TRACK): Run {
  const room = geo.length - 2 * geo.margin - geo.glider;
  if (approaching(v1, v2)) {
    const after = collide(m1, v1, m2, v2, k);
    // Ausdehnung der Bewegung relativ zur Stoßstelle (pro Zeiteinheit des Maßstabs s)
    const a = Math.min(-v1 * PRE, after.v1 * POST, 0);
    const b = Math.max(-v2 * PRE, after.v2 * POST, 0);
    const spread = b - a;
    const s = Math.min(MAX_SCALE, spread > 1e-12 ? (room - geo.glider) / spread : MAX_SCALE);
    // Berührpunkt so legen, dass die ganze Bewegung mittig auf der Bahn liegt
    const contact = geo.length / 2 - (s * (a + b)) / 2;
    const tc = PRE * s;
    return {
      m1,
      m2,
      v1,
      v2,
      w1: after.v1,
      w2: after.v2,
      k,
      collides: true,
      tc,
      tEnd: tc + POST * s,
      x1: contact - geo.glider / 2 - v1 * tc,
      x2: contact + geo.glider / 2 - v2 * tc,
    };
  }
  // Kein Stoß: Die Gleiter starten mit kleinem Abstand und entfernen sich (oder fahren gleich schnell).
  const a = Math.min(v1, 0);
  const b = Math.max(v2, 0);
  const spread = b - a;
  const s = Math.min(MAX_SCALE, spread > 1e-12 ? (room - geo.glider - FREE_GAP) / spread : MAX_SCALE);
  const middle = geo.length / 2 - (s * (a + b)) / 2;
  const d = geo.glider + FREE_GAP;
  return { m1, m2, v1, v2, w1: v1, w2: v2, k, collides: false, tc: Infinity, tEnd: s, x1: middle - d / 2, x2: middle + d / 2 };
}

export interface RunState {
  t: number;
  /** Mitten der Gleiter in m. */
  x1: number;
  x2: number;
  /** Geschwindigkeiten in m/s. */
  v1: number;
  v2: number;
  /** Ort und Geschwindigkeit des Schwerpunkts. */
  xs: number;
  vs: number;
  /** Ist der Stoß schon geschehen? */
  after: boolean;
}

/** Zustand zur Zeit t (zwischen 0 und tEnd). */
export function stateAt(run: Run, t: number): RunState {
  const time = Math.min(Math.max(0, t), run.tEnd);
  const M = run.m1 + run.m2;
  let x1: number;
  let x2: number;
  let v1 = run.v1;
  let v2 = run.v2;
  const after = run.collides && time >= run.tc;
  if (after) {
    const c1 = run.x1 + run.v1 * run.tc;
    const c2 = run.x2 + run.v2 * run.tc;
    v1 = run.w1;
    v2 = run.w2;
    x1 = c1 + v1 * (time - run.tc);
    x2 = c2 + v2 * (time - run.tc);
  } else {
    x1 = run.x1 + v1 * time;
    x2 = run.x2 + v2 * time;
  }
  return { t: time, x1, x2, v1, v2, xs: (run.m1 * x1 + run.m2 * x2) / M, vs: (run.m1 * v1 + run.m2 * v2) / M, after };
}

/** Bilanz vor und nach dem Stoß (Impulse in kg·m/s, Energien in J). */
export interface Balance {
  p1: number;
  p2: number;
  q1: number;
  q2: number;
  e1: number;
  e2: number;
  f1: number;
  f2: number;
  /** In innere Energie umgewandelt. */
  loss: number;
}

export function balance(run: Run): Balance {
  return {
    p1: momentum(run.m1, run.v1),
    p2: momentum(run.m2, run.v2),
    q1: momentum(run.m1, run.w1),
    q2: momentum(run.m2, run.w2),
    e1: kineticEnergy(run.m1, run.v1),
    e2: kineticEnergy(run.m2, run.v2),
    f1: kineticEnergy(run.m1, run.w1),
    f2: kineticEnergy(run.m2, run.w2),
    loss: run.collides ? energyLoss(run.m1, run.v1, run.m2, run.v2, run.k) : 0,
  };
}
