/**
 * Rechenlogik „Interferenz zweier Kreiswellen“ (Wellenwanne von oben).
 *
 * Zwei punktförmige Erreger E₁ und E₂ liegen im Abstand d auf der x-Achse,
 * E₁ = (−d/2 | 0), E₂ = (d/2 | 0). Beide schwingen mit derselben Frequenz f und
 * Amplitude ŷ, E₂ eilt E₁ um den Phasenunterschied Δφ voraus. Jeder Erreger sendet
 * Kreiswellen der Wellenlänge λ = c/f aus (Dämpfung vernachlässigt):
 *
 *   y₁(P, t) = ŷ · sin(2π · (t/T − s₁/λ))
 *   y₂(P, t) = ŷ · sin(2π · (t/T − s₂/λ) + Δφ)
 *
 * s₁, s₂ sind die Wegstrecken von den Erregern zum Punkt P. Mit dem
 * Gangunterschied Δs = s₁ − s₂ ist der Phasenunterschied der beiden Wellen in P
 *
 *   δ = 2π · Δs/λ + Δφ,
 *
 * und die Überlagerung y = y₁ + y₂ schwingt mit der Amplitude
 *
 *   A = 2ŷ · |cos(δ/2)|.
 *
 * Bei gleichphasigen Erregern (Δφ = 0):
 *   Maximum (Bauchlinie)  für Δs = k · λ,
 *   Minimum (Knotenlinie) für Δs = (k + ½) · λ,   k ∈ ℤ.
 * Allgemein verschieben sich alle Linien um −Δφ/(2π) · λ.
 *
 * Alle Punkte mit festem Δs liegen auf einem Hyperbelast mit den Brennpunkten
 * E₁ und E₂ (|Δs| < d). Weil |Δs| ≤ d gilt (Dreiecksungleichung), gibt es nur
 * endlich viele Linien; für |Δs| = d entartet die Hyperbel zur Verbindungsachse
 * außerhalb der Erreger. Die Asymptoten gehen durch die Mitte M und bilden mit der
 * Mittelsenkrechten den Winkel α mit sin α = Δs/d – im Fernfeld also
 * sin α_k = k · λ/d (wie beim Doppelspalt).
 *
 * Einheiten: Längen in cm, Zeiten in s, Winkel im Bogenmaß.
 */

/** Ausbreitungsgeschwindigkeit der Wasserwellen in der Wellenwanne (cm/s, typischer Wert). */
export const WAVE_SPEED = 20;

const TAU = 2 * Math.PI;

/** Frequenz der Erreger: f = c/λ (Hz, λ in cm). */
export function frequency(lambda: number, c = WAVE_SPEED): number {
  return c / lambda;
}

/** Wegstrecken und Gangunterschied zum Punkt P = (x | y) bei Erregerabstand d. */
export interface Paths {
  s1: number;
  s2: number;
  /** Gangunterschied Δs = s₁ − s₂ (positiv: P liegt näher an E₂). */
  ds: number;
}

export function paths(x: number, y: number, d: number): Paths {
  const s1 = Math.hypot(x + d / 2, y);
  const s2 = Math.hypot(x - d / 2, y);
  return { s1, s2, ds: s1 - s2 };
}

/** Phasenunterschied der beiden Wellen am Ort: δ = 2π · Δs/λ + Δφ. */
export function phaseDifference(ds: number, lambda: number, dphi = 0): number {
  return (TAU * ds) / lambda + dphi;
}

/** Amplitude der Überlagerung zweier gleich großer Wellen: A = 2ŷ · |cos(δ/2)|. */
export function resultantAmplitude(ds: number, lambda: number, dphi = 0, yhat = 1): number {
  return 2 * yhat * Math.abs(Math.cos(phaseDifference(ds, lambda, dphi) / 2));
}

/** Amplitude der Überlagerung zweier Schwingungen mit Amplituden a₁, a₂ und Phasenunterschied δ (Zeigeraddition). */
export function phasorSum(a1: number, a2: number, delta: number): number {
  return Math.sqrt(Math.max(0, a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(delta)));
}

/** Gangunterschied der Bauchlinie k-ter Ordnung: Δs = (k − Δφ/2π) · λ. */
export function maxPathDifference(k: number, lambda: number, dphi = 0): number {
  return (k - dphi / TAU) * lambda;
}

/** Gangunterschied der Knotenlinie k-ter Ordnung: Δs = (k + ½ − Δφ/2π) · λ. */
export function minPathDifference(k: number, lambda: number, dphi = 0): number {
  return (k + 0.5 - dphi / TAU) * lambda;
}

/** Eine Interferenzlinie (Hyperbelast) mit ihrer Ordnung k und ihrem Gangunterschied. */
export interface Line {
  k: number;
  ds: number;
  /** true: entartet zur Verbindungsachse außerhalb der Erreger (|Δs| = d). */
  axis: boolean;
}

const EPS = 1e-9;

function linesOf(d: number, lambda: number, at: (k: number) => number): Line[] {
  const out: Line[] = [];
  if (!(d > 0) || !(lambda > 0)) return out;
  // |Δs| ≤ d: Δs wächst mit k um je λ, also nur endlich viele Ordnungen
  const tol = 1e-7 * Math.max(1, d);
  const k0 = Math.round(-at(0) / lambda);
  const reach = Math.ceil(d / lambda) + 2;
  for (let k = k0 - reach; k <= k0 + reach; k++) {
    const ds = at(k);
    if (Math.abs(ds) <= d + tol) out.push({ k, ds: Math.abs(ds) < EPS ? 0 : ds, axis: Math.abs(Math.abs(ds) - d) <= tol });
  }
  return out;
}

/** Alle Bauchlinien (Maxima) bei Erregerabstand d: |Δs_k| ≤ d. Bei Δφ = 0: |k| ≤ d/λ. */
export function maxLines(d: number, lambda: number, dphi = 0): Line[] {
  return linesOf(d, lambda, (k) => maxPathDifference(k, lambda, dphi));
}

/** Alle Knotenlinien (Minima) bei Erregerabstand d. */
export function minLines(d: number, lambda: number, dphi = 0): Line[] {
  return linesOf(d, lambda, (k) => minPathDifference(k, lambda, dphi));
}

/** Größte Ordnung der Maxima bei gleichphasigen Erregern: k_max = ⌊d/λ⌋. */
export function maxOrder(d: number, lambda: number): number {
  return Math.floor(d / lambda + 1e-9);
}

/**
 * Punkte des Hyperbelastes s₁ − s₂ = Δs (Brennpunkte (±d/2 | 0)) für y von yMin bis yMax.
 * Für Δs = 0 ist das die Mittelsenkrechte, für |Δs| ≥ d die Verbindungsachse
 * außerhalb der Erreger (dann von der Quelle bis xMax nach außen).
 */
export function hyperbola(d: number, ds: number, yMin: number, yMax: number, n = 64, xMax = 50): [number, number][] {
  const c = d / 2;
  const a = Math.abs(ds) / 2;
  const sgn = ds >= 0 ? 1 : -1;
  if (a >= c - 1e-9) {
    // entartet: Strahl auf der Achse, von E₂ nach rechts bzw. von E₁ nach links
    return [
      [sgn * c, 0],
      [sgn * Math.max(c, xMax), 0],
    ];
  }
  const b = Math.sqrt(c * c - a * a);
  const out: [number, number][] = [];
  // gleichmäßig im Parameter u (y = b·sinh u): dichte Punkte am Scheitel
  const u0 = Math.asinh(yMin / b);
  const u1 = Math.asinh(yMax / b);
  for (let i = 0; i <= n; i++) {
    const u = u0 + ((u1 - u0) * i) / n;
    out.push([sgn * a * Math.cosh(u), b * Math.sinh(u)]);
  }
  return out;
}

/**
 * Richtung der Linie mit Gangunterschied Δs im Fernfeld (Winkel zur Mittelsenkrechten):
 * sin α = Δs/d – genau die Richtung der Asymptoten. null, wenn |Δs| > d.
 */
export function farFieldAngle(ds: number, d: number): number | null {
  if (!(d > 0)) return null;
  const s = ds / d;
  if (Math.abs(s) > 1 + 1e-12) return null;
  return Math.asin(Math.max(-1, Math.min(1, s)));
}

/** Art der Überlagerung an einem Ort nach dem Verhältnis A/(2ŷ). */
export type Kind = 'max' | 'min' | 'partial';

export function classify(ampRel: number, tol = 0.02): Kind {
  if (ampRel >= 1 - tol) return 'max';
  if (ampRel <= tol) return 'min';
  return 'partial';
}

/**
 * Auslenkung einer Kreiswelle am Ort mit Abstand r vom Erreger, wenn der Erreger
 * seit n Perioden schwingt (Wellenfront bei r = n · λ): sin(2π · (n − r/λ) + φ₀) · Hülle.
 * Die Hülle blendet die Front über eine halbe Wellenlänge weich ein.
 */
export function circularWave(n: number, r: number, lambda: number, phi0 = 0): number {
  return Math.sin(TAU * (n - r / lambda) + phi0) * frontEnvelope(n * lambda - r, lambda);
}

/** Weiche Wellenfront: 0 vor der Front, 1 ab einer halben Wellenlänge dahinter. */
export function frontEnvelope(behind: number, lambda: number): number {
  const q = Math.max(0, Math.min(1, behind / (0.5 * lambda)));
  return q * q * (3 - 2 * q);
}
