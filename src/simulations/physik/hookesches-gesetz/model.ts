/**
 * Rechenlogik „Hookesches Gesetz“.
 *
 * Im elastischen Bereich ist die Verlängerung s einer Schraubenfeder
 * proportional zur Kraft F:  F = D · s  (D: Federhärte in N/m).
 *
 * Wird eine Feder über ihre Elastizitätsgrenze hinaus gedehnt, gibt sie
 * deutlich leichter nach und bleibt danach verformt. Das wird hier mit einem
 * einfachen, bilinearen Modell beschrieben:
 *  - bis zur Fließkraft Y gilt s = p + F / D (p: bleibende Verlängerung),
 *  - darüber wird die Feder mit der kleineren Härte D · PLASTIC_FACTOR länger,
 *  - beim Entlasten geht sie elastisch (Härte D) zurück; die Fließkraft Y
 *    steigt auf die größte bisher wirkende Kraft.
 */

/** Ortsfaktor in N/kg. */
export const G = 9.81;
/** Verlängerung in m, bis zu der eine neue Feder elastisch bleibt. */
export const ELASTIC_LIMIT = 0.25;
/** Härte jenseits der Elastizitätsgrenze relativ zu D. */
export const PLASTIC_FACTOR = 0.5;

export type Setup = 'one' | 'series' | 'parallel';

/** Zustand einer Feder: Federhärte und aktuelle Fließkraft (steigt beim Überdehnen). */
export interface Spring {
  D: number;
  yieldF: number;
}

export function newSpring(D: number): Spring {
  return { D, yieldF: D * ELASTIC_LIMIT };
}

/** Kraft an der Elastizitätsgrenze einer neuen Feder. */
export function elasticLimitForce(D: number): number {
  return D * ELASTIC_LIMIT;
}

/** Bleibende Verlängerung nach dem Überdehnen (0, solange die Feder nie überdehnt wurde). */
export function permanentSet(spring: Spring): number {
  const limit = elasticLimitForce(spring.D);
  if (spring.yieldF <= limit) return 0;
  return (spring.yieldF - limit) * (1 / (spring.D * PLASTIC_FACTOR) - 1 / spring.D);
}

/** Verlängerung unter der Kraft F (ohne den Zustand zu ändern). */
export function extension(spring: Spring, F: number, limit: boolean): number {
  const f = Math.max(0, F);
  if (!limit) return f / spring.D;
  const p = permanentSet(spring);
  if (f <= spring.yieldF) return p + f / spring.D;
  return p + spring.yieldF / spring.D + (f - spring.yieldF) / (spring.D * PLASTIC_FACTOR);
}

/** Feder nach dem Belasten mit F (Fließkraft steigt, wenn F darüber liegt). */
export function loaded(spring: Spring, F: number, limit: boolean): Spring {
  if (!limit || F <= spring.yieldF) return spring;
  return { D: spring.D, yieldF: F };
}

/** Ist die Feder überdehnt (bleibend verformt)? */
export function isDeformed(spring: Spring): boolean {
  return permanentSet(spring) > 1e-9;
}

/** Federhärte zweier Federn hintereinander: 1/D = 1/D₁ + 1/D₂. */
export function seriesStiffness(D1: number, D2: number): number {
  return (D1 * D2) / (D1 + D2);
}

/** Federhärte zweier Federn nebeneinander: D = D₁ + D₂. */
export function parallelStiffness(D1: number, D2: number): number {
  return D1 + D2;
}

/** Gesamte (elastische) Federhärte der Anordnung. */
export function stiffness(setup: Setup, D1: number, D2: number): number {
  if (setup === 'series') return seriesStiffness(D1, D2);
  if (setup === 'parallel') return parallelStiffness(D1, D2);
  return D1;
}

export interface Equilibrium {
  /** Verlängerung der ganzen Anordnung in m. */
  s: number;
  /** Verlängerung jeder Feder in m. */
  parts: number[];
  /** Kraft auf jede Feder in N. */
  forces: number[];
}

/**
 * Gleichgewicht unter der Gewichtskraft F. Hintereinander tragen beide Federn
 * die volle Kraft, nebeneinander verteilt sie sich so, dass beide gleich weit
 * gedehnt werden (die Last hängt dort, wo die Querstange waagerecht bleibt).
 */
export function equilibrium(setup: Setup, springs: readonly Spring[], F: number, limit: boolean): Equilibrium {
  const [a, b] = springs as [Spring, Spring];
  if (setup === 'one') {
    const s = extension(a, F, limit);
    return { s, parts: [s], forces: [F] };
  }
  if (setup === 'series') {
    const s1 = extension(a, F, limit);
    const s2 = extension(b, F, limit);
    return { s: s1 + s2, parts: [s1, s2], forces: [F, F] };
  }
  // nebeneinander: F₁ so bestimmen, dass s₁(F₁) = s₂(F − F₁) (Bisektion, beide Seiten monoton)
  let lo = 0;
  let hi = Math.max(0, F);
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (extension(a, mid, limit) < extension(b, F - mid, limit)) lo = mid;
    else hi = mid;
  }
  const F1 = (lo + hi) / 2;
  const s = (extension(a, F1, limit) + extension(b, F - F1, limit)) / 2;
  return { s, parts: [s, s], forces: [F1, F - F1] };
}

/** Federn nach dem Belasten (Gleichgewicht) aktualisieren. */
export function settle(setup: Setup, springs: readonly Spring[], F: number, limit: boolean): Spring[] {
  const eq = equilibrium(setup, springs, F, limit);
  return springs.map((sp, i) => (i < eq.forces.length ? loaded(sp, eq.forces[i]!, limit) : sp));
}

/**
 * Federhärte als Steigung der Ursprungsgeraden durch Messpunkte (s in m,
 * F in N), nach der Methode der kleinsten Quadrate: D = Σ F·s / Σ s².
 */
export function fitThroughOrigin(points: readonly { s: number; F: number }[]): number | null {
  let fs = 0;
  let ss = 0;
  for (const p of points) {
    fs += p.F * p.s;
    ss += p.s * p.s;
  }
  return ss > 1e-12 ? fs / ss : null;
}
