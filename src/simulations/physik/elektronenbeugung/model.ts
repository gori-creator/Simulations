/**
 * Rechenlogik „Elektronenbeugung an Graphit“ (ohne Zeichnen).
 *
 * In der Elektronenbeugungsröhre werden Elektronen mit der Spannung U
 * beschleunigt: e · U = ½ · m · v². Ihr Impuls ist p = m · v = √(2 · m · e · U),
 * ihre de-Broglie-Wellenlänge
 *
 *   λ = h / p = h / √(2 · m · e · U)        (≈ 1,226 nm / √(U/V)).
 *
 * Sie treffen auf eine dünne Graphitfolie aus vielen kleinen, zufällig
 * gedrehten Kristallen. An Netzebenen mit dem Abstand d wird die Welle nach
 * Bragg reflektiert, wenn 2 · d · sin θ = n · λ gilt; der Strahl wird dabei um
 * 2θ abgelenkt. Weil die Kristalle in allen Richtungen liegen, entsteht auf dem
 * Schirm im Abstand L ein Ring mit dem Radius
 *
 *   r = L · tan(2θ) ≈ L · 2θ ≈ L · λ / d      (kleine Winkel),
 *
 * für den Ringdurchmesser D = 2r also D ≈ 2 · L · λ / d.
 *
 * Graphit: d₁ = 0,213 nm (innerer Ring), d₂ = 0,123 nm (äußerer Ring).
 * Röhre: L = 13,5 cm (typisches Schulgerät).
 *
 * Einheiten: SI (m, V, s), wo nicht anders angegeben.
 */

/** Planck-Konstante in J·s. */
export const PLANCK = 6.62607015e-34;
/** Elementarladung in C. */
export const ELEMENTARY_CHARGE = 1.602176634e-19;
/** Masse des Elektrons in kg. */
export const ELECTRON_MASS = 9.1093837015e-31;
/** Lichtgeschwindigkeit in m/s. */
export const LIGHT_SPEED = 299792458;

/** Netzebenenabstände von Graphit in m (innerer und äußerer Ring). */
export const D1 = 0.213e-9;
export const D2 = 0.123e-9;
/** Abstand Graphitfolie – Schirm in m. */
export const SCREEN_DISTANCE = 0.135;

/** Einstellbereich der Beschleunigungsspannung in kV. */
export const U_MIN = 2;
export const U_MAX = 8;

/** Geschwindigkeit nach Durchlaufen der Spannung U (V), nicht relativistisch: v = √(2 · e · U / m). */
export function electronSpeed(U: number): number {
  return Math.sqrt((2 * ELEMENTARY_CHARGE * Math.max(0, U)) / ELECTRON_MASS);
}

/** Impuls p = √(2 · m · e · U) in kg·m/s. */
export function momentum(U: number): number {
  return Math.sqrt(2 * ELECTRON_MASS * ELEMENTARY_CHARGE * Math.max(0, U));
}

/** de-Broglie-Wellenlänge in m: λ = h / √(2 · m · e · U). */
export function deBroglie(U: number): number {
  return PLANCK / momentum(U);
}

/** Relativistisch korrigierte Wellenlänge: p = √(2 m e U · (1 + e U / (2 m c²))). */
export function deBroglieRelativistic(U: number): number {
  const eU = ELEMENTARY_CHARGE * Math.max(0, U);
  const mc2 = ELECTRON_MASS * LIGHT_SPEED * LIGHT_SPEED;
  return PLANCK / Math.sqrt(2 * ELECTRON_MASS * eU * (1 + eU / (2 * mc2)));
}

/** Kinetische Energie in J: E = e · U. */
export function kineticEnergy(U: number): number {
  return ELEMENTARY_CHARGE * U;
}

/** Bragg-Winkel θ (Glanzwinkel) aus 2 · d · sin θ = n · λ; null, wenn keine Reflexion möglich ist. */
export function braggAngle(d: number, lambda: number, order = 1): number | null {
  const s = (order * lambda) / (2 * d);
  if (!(s > 0) || s > 1) return null;
  return Math.asin(s);
}

/** Ringradius auf einem ebenen Schirm im Abstand L: r = L · tan(2θ). */
export function ringRadius(U: number, d: number, L = SCREEN_DISTANCE): number | null {
  const th = braggAngle(d, deBroglie(U));
  return th === null ? null : L * Math.tan(2 * th);
}

/** Kleinwinkelnäherung r ≈ L · λ / d. */
export function ringRadiusApprox(U: number, d: number, L = SCREEN_DISTANCE): number {
  return (L * deBroglie(U)) / d;
}

/** Netzebenenabstand aus gemessenem Ringradius: d ≈ L · λ / r. */
export function latticeFromRing(r: number, U: number, L = SCREEN_DISTANCE): number {
  return (L * deBroglie(U)) / r;
}

/** Steigung k der Ursprungsgeraden r = k · (1/√U) (kleinste Quadrate). */
export function fitOrigin(points: readonly (readonly [number, number])[]): number | null {
  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of points) {
    sxy += x * y;
    sxx += x * x;
  }
  return sxx > 0 ? sxy / sxx : null;
}

/**
 * Netzebenenabstand aus der Steigung k von r über 1/√U (r in m, U in V):
 * r = L h / (d √(2 m e)) · 1/√U  ⇒  d = L h / (k √(2 m e)).
 */
export function latticeFromSlope(k: number, L = SCREEN_DISTANCE): number {
  return (L * PLANCK) / (k * Math.sqrt(2 * ELECTRON_MASS * ELEMENTARY_CHARGE));
}

/** Messwert mit relativem Messfehler (Normalverteilung, Standardabweichung `rel`). */
export function noisy(value: number, rel: number, rand: () => number): number {
  if (rel <= 0) return value;
  const u = Math.max(1e-12, rand());
  const v = rand();
  return value * (1 + rel * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
}

/** Wo trifft ein Elektron auf? 0: ungebeugt (Mitte), 1: innerer Ring, 2: äußerer Ring, 3: Streuuntergrund. */
export type Target = 0 | 1 | 2 | 3;

/** Anteile der Elektronen (Richtwerte für die Darstellung). */
export const SHARES: Record<Target, number> = { 0: 0.36, 1: 0.36, 2: 0.2, 3: 0.08 };

/** Zufälliges Ziel nach den Anteilen. */
export function pickTarget(rand: () => number): Target {
  let r = rand();
  for (const k of [0, 1, 2, 3] as const) {
    r -= SHARES[k];
    if (r <= 0) return k;
  }
  return 3;
}
