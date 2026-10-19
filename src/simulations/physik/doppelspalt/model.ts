/**
 * Rechenlogik „Doppelspalt und Gitter“ (ohne Zeichnen).
 *
 * Monochromatisches Licht der Wellenlänge λ fällt auf N gleiche Spalte im
 * Abstand g (Gitterkonstante) mit der Spaltbreite b. In Richtung α haben
 * benachbarte Spalte den Gangunterschied Δs = g · sin α. Hauptmaxima entstehen
 * für Δs = k · λ, also
 *
 *   sin α_k = k · λ / g,     k = 0, ±1, ±2, …   (nur |k · λ / g| < 1).
 *
 * Auf einem Schirm im Abstand a liegt das k-te Maximum bei x_k = a · tan α_k,
 * für kleine Winkel ist der Abstand benachbarter Maxima Δx ≈ λ · a / g.
 *
 * Intensität (Fraunhofer, auf 1 in der Mitte normiert):
 *
 *   I(α) = [sin(N · φ/2) / (N · sin(φ/2))]² · [sin(β/2) / (β/2)]²
 *   mit φ = 2π · g · sin α / λ und β = 2π · b · sin α / λ.
 *
 * Zwischen zwei Hauptmaxima liegen N − 1 Nullstellen und N − 2 Nebenmaxima;
 * mit wachsendem N werden die Hauptmaxima schärfer.
 *
 * Einheiten: λ in nm, g und b in m, a und x in m.
 */

/** Spaltbreite im Modell als Anteil der Gitterkonstante (b = g / 6). */
export const SLIT_RATIO = 1 / 6;

/** Gitterkonstante in m aus Strichen pro mm. */
export function gratingConstant(linesPerMm: number): number {
  return 1e-3 / linesPerMm;
}

/** sin α_k = k · λ / g. */
export function sinMax(k: number, lambdaNm: number, g: number): number {
  return (k * lambdaNm * 1e-9) / g;
}

/** Winkel des k-ten Hauptmaximums in rad; null, wenn |sin α| ≥ 1 (nicht sichtbar). */
export function maxAngle(k: number, lambdaNm: number, g: number): number | null {
  const s = sinMax(k, lambdaNm, g);
  if (Math.abs(s) >= 1 - 1e-12) return null;
  return Math.asin(s);
}

/** Höchste sichtbare Ordnung: größtes k mit k · λ / g < 1. */
export function maxOrder(lambdaNm: number, g: number): number {
  const q = g / (lambdaNm * 1e-9);
  const k = Math.floor(q);
  return Math.abs(q - k) < 1e-9 ? k - 1 : k;
}

/** Ort auf dem Schirm (m) zur Richtung α: x = a · tan α. */
export function screenPosition(alpha: number, a: number): number {
  return a * Math.tan(alpha);
}

/** Abstand benachbarter Maxima für kleine Winkel: Δx ≈ λ · a / g. */
export function spacingSmallAngle(lambdaNm: number, a: number, g: number): number {
  return (lambdaNm * 1e-9 * a) / g;
}

/** Wellenlänge (nm) aus einem gemessenen Abstand des k-ten Maximums: λ = g · sin(arctan(x/a)) / k. */
export function wavelengthFromMeasurement(x: number, a: number, g: number, k = 1): number {
  return (g * Math.sin(Math.atan(x / a))) / k / 1e-9;
}

/** Gitterfaktor [sin(Nφ/2) / (N sin(φ/2))]² (stetig ergänzt). */
export function arrayFactor(N: number, phi: number): number {
  const h = phi / 2;
  const s = Math.sin(h);
  if (Math.abs(s) < 1e-9) return 1;
  const r = Math.sin(N * h) / (N * s);
  return r * r;
}

/** Einzelspaltfaktor [sin(β/2) / (β/2)]². */
export function slitFactor(beta: number): number {
  const h = beta / 2;
  if (Math.abs(h) < 1e-9) return 1;
  const r = Math.sin(h) / h;
  return r * r;
}

/** Normierte Intensität in Richtung α (rad). */
export function intensity(alpha: number, N: number, lambdaNm: number, g: number, b = g * SLIT_RATIO): number {
  const s = Math.sin(alpha);
  const lam = lambdaNm * 1e-9;
  const phi = (2 * Math.PI * g * s) / lam;
  const beta = (2 * Math.PI * b * s) / lam;
  return (N > 1 ? arrayFactor(N, phi) : 1) * slitFactor(beta);
}

/** Normierte Intensität am Schirmort x (m) im Abstand a. */
export function intensityAt(x: number, a: number, N: number, lambdaNm: number, g: number): number {
  return intensity(Math.atan2(x, a), N, lambdaNm, g);
}

/** Bildschirmfarbe zur Wellenlänge (Näherung nach Bruton). */
export function wavelengthToRgb(l: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  if (l < 440) {
    r = -(l - 440) / 60;
    b = 1;
  } else if (l < 490) {
    g = (l - 440) / 50;
    b = 1;
  } else if (l < 510) {
    g = 1;
    b = -(l - 510) / 20;
  } else if (l < 580) {
    r = (l - 510) / 70;
    g = 1;
  } else if (l < 645) {
    r = 1;
    g = -(l - 645) / 65;
  } else r = 1;
  let k = 1;
  if (l < 420) k = 0.3 + (0.7 * (l - 380)) / 40;
  else if (l > 700) k = 0.3 + (0.7 * (780 - l)) / 80;
  const c = (v: number) => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v * k)), 0.8));
  return [c(r), c(g), c(b)];
}
