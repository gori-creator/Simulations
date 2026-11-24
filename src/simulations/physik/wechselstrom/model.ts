/**
 * Wechselstromkreise: Blindwiderstände, Scheinwiderstand (Impedanz),
 * Phasenverschiebung sowie Wirk-, Blind- und Scheinleistung einer Reihenschaltung.
 */

export type Circuit = 'R' | 'L' | 'C' | 'RL' | 'RC' | 'RLC';

/** Induktiver Blindwiderstand X_L = ωL in Ω (L in H, f in Hz). */
export function inductiveReactance(L: number, f: number): number {
  return 2 * Math.PI * f * L;
}

/** Kapazitiver Blindwiderstand X_C = 1/(ωC) in Ω (C in F, f in Hz). */
export function capacitiveReactance(C: number, f: number): number {
  return 1 / (2 * Math.PI * f * C);
}

export interface AcResult {
  /** Wirkwiderstand im Kreis (Ω) */
  R: number;
  XL: number;
  XC: number;
  /** Scheinwiderstand Z (Ω) */
  Z: number;
  /** Phasenverschiebung φ = φ_u − φ_i in rad (positiv: Strom eilt nach) */
  phi: number;
  Ieff: number;
  /** Teilspannungen (Effektivwerte, V) */
  UR: number;
  UL: number;
  UC: number;
  /** Wirkleistung (W), Blindleistung (var), Scheinleistung (VA) */
  P: number;
  Q: number;
  S: number;
}

/** Reihenschaltung aus den Bauteilen in `circuit` an der Effektivspannung U (V). */
export function seriesAc(circuit: Circuit, U: number, f: number, R: number, L: number, C: number): AcResult {
  const r = circuit.includes('R') ? R : 0;
  const XL = circuit.includes('L') ? inductiveReactance(L, f) : 0;
  const XC = circuit.includes('C') ? capacitiveReactance(C, f) : 0;
  const X = XL - XC;
  const Z = Math.hypot(r, X);
  const phi = Math.atan2(X, r);
  const Ieff = U / Z;
  return {
    R: r,
    XL,
    XC,
    Z,
    phi,
    Ieff,
    UR: Ieff * r,
    UL: Ieff * XL,
    UC: Ieff * XC,
    P: U * Ieff * Math.cos(phi),
    Q: U * Ieff * Math.sin(phi),
    S: U * Ieff,
  };
}

/** Resonanzfrequenz f₀ = 1 / (2π√(LC)) in Hz. */
export function resonanceFrequency(L: number, C: number): number {
  return 1 / (2 * Math.PI * Math.sqrt(L * C));
}

/** Momentanwerte bei Phase θ = ωt: u = Û sin θ, i = Î sin(θ − φ), p = u · i. */
export function instant(U: number, res: AcResult, theta: number): { u: number; i: number; p: number } {
  const u = Math.SQRT2 * U * Math.sin(theta);
  const i = Math.SQRT2 * res.Ieff * Math.sin(theta - res.phi);
  return { u, i, p: u * i };
}
