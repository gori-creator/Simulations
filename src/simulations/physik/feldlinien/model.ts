/**
 * Rechenlogik „Feldlinien von Punktladungen“ (ohne Zeichnen).
 *
 * Eine Punktladung Q erzeugt im Abstand r die Feldstärke
 *
 *   E = k · Q / r²   mit k = 1 / (4π ε₀) ≈ 8,99 · 10⁹ N m²/C²,
 *
 * gerichtet von der Ladung weg (Q > 0) bzw. zu ihr hin (Q < 0). Mehrere
 * Ladungen überlagern sich als Vektorsumme. Das Potential ist φ = Σ k · Qᵢ / rᵢ.
 * Feldlinien folgen der Richtung von E (von + nach −), Äquipotentiallinien
 * verbinden Punkte gleichen Potentials und stehen senkrecht auf den Feldlinien.
 *
 * Plattenkondensator (idealisiert): homogenes Feld E = U / d zwischen den
 * Platten, außen kein Feld.
 *
 * Einheiten: SI (m, C, N/C = V/m, V).
 */

/** Elektrische Feldkonstante ε₀ in C²/(N m²). */
export const EPSILON0 = 8.8541878128e-12;
/** Coulomb-Konstante k = 1/(4π ε₀) in N m²/C². */
export const COULOMB_K = 1 / (4 * Math.PI * EPSILON0);

export interface Charge {
  x: number;
  y: number;
  /** Ladung in C. */
  q: number;
}

/** Betrag der Feldstärke einer Punktladung: E = k · |Q| / r². */
export function pointField(q: number, r: number): number {
  return (COULOMB_K * Math.abs(q)) / (r * r);
}

/** Feldstärke-Vektor am Ort (x, y) als Überlagerung aller Ladungen. */
export function fieldAt(charges: readonly Charge[], x: number, y: number): [number, number] {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 1e-12) continue;
    const r = Math.sqrt(r2);
    const s = (COULOMB_K * c.q) / (r2 * r);
    ex += s * dx;
    ey += s * dy;
  }
  return [ex, ey];
}

/** Potential am Ort (x, y) in V (Bezug: unendlich fern). */
export function potentialAt(charges: readonly Charge[], x: number, y: number): number {
  let v = 0;
  for (const c of charges) {
    const r = Math.hypot(x - c.x, y - c.y);
    if (r < 1e-9) continue;
    v += (COULOMB_K * c.q) / r;
  }
  return v;
}

/** Coulombkraft auf eine Probeladung q₀: F = q₀ · E. */
export function forceOn(q0: number, E: [number, number]): [number, number] {
  return [q0 * E[0], q0 * E[1]];
}

/** Homogenes Feld im Plattenkondensator: E = U / d. */
export function plateField(U: number, d: number): number {
  return d > 0 ? U / d : 0;
}

/** Zahl der Feldlinien, die von einer Ladung ausgehen (proportional zur Ladung). */
export function lineCount(q: number, perNanoCoulomb = 8): number {
  return Math.max(0, Math.min(40, Math.round(Math.abs(q) * 1e9 * perNanoCoulomb)));
}

export interface TraceOptions {
  /** Schrittweite in m. */
  step: number;
  maxSteps: number;
  /** Abbruch, wenn näher als `stopRadius` an einer Ladung (außer der Startladung am Anfang). */
  stopRadius: number;
  /** Bereich: Abbruch außerhalb. */
  bounds: { x0: number; x1: number; y0: number; y1: number };
  /** Rückwärts (gegen die Feldrichtung) verfolgen. */
  backward?: boolean;
}

export interface TraceResult {
  points: [number, number][];
  /** Index der Ladung, an der die Linie endet (oder −1). */
  end: number;
}

/** Eine Feldlinie verfolgen (Runge-Kutta 4 entlang der Richtung von E). */
export function traceLine(charges: readonly Charge[], x0: number, y0: number, start: number, o: TraceOptions): TraceResult {
  const pts: [number, number][] = [[x0, y0]];
  const dir = o.backward ? -1 : 1;
  const unit = (x: number, y: number): [number, number] => {
    const [ex, ey] = fieldAt(charges, x, y);
    const m = Math.hypot(ex, ey);
    return m < 1e-30 ? [0, 0] : [(dir * ex) / m, (dir * ey) / m];
  };
  let x = x0;
  let y = y0;
  const h = o.step;
  for (let i = 0; i < o.maxSteps; i++) {
    const k1 = unit(x, y);
    const k2 = unit(x + (h / 2) * k1[0], y + (h / 2) * k1[1]);
    const k3 = unit(x + (h / 2) * k2[0], y + (h / 2) * k2[1]);
    const k4 = unit(x + h * k3[0], y + h * k3[1]);
    const dx = (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    const dy = (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (Math.hypot(dx, dy) < h * 1e-3) break;
    x += dx;
    y += dy;
    pts.push([x, y]);
    for (let c = 0; c < charges.length; c++) {
      if (c === start && i < 4) continue;
      if (Math.hypot(x - charges[c]!.x, y - charges[c]!.y) < o.stopRadius) {
        pts.push([charges[c]!.x, charges[c]!.y]);
        return { points: pts, end: c };
      }
    }
    const b = o.bounds;
    if (x < b.x0 || x > b.x1 || y < b.y0 || y > b.y1) break;
  }
  return { points: pts, end: -1 };
}
