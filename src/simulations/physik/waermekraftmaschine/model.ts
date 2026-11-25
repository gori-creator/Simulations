/**
 * Wärmekraftmaschine und Wärmepumpe: Carnot-Kreisprozess eines idealen
 * Gases (einatomig, γ = 5/3), Wirkungsgrad, Leistungszahl und Entropie.
 */

export const R = 8.314;
export const GAMMA = 5 / 3;

export interface Carnot {
  /** Volumina der vier Eckpunkte (L) */
  V: [number, number, number, number];
  /** zugeführte Wärme bei T_h, abgegebene bei T_c, Arbeit (J) – für den Motor */
  Qh: number;
  Qc: number;
  W: number;
  eta: number;
}

/**
 * Carnot-Prozess mit n mol Gas zwischen T_h und T_c (K): isotherme Expansion
 * V1 → V2 bei T_h, adiabatische Expansion auf T_c, isotherme Kompression,
 * adiabatische Kompression zurück.
 */
export function carnot(n: number, Th: number, Tc: number, V1: number, V2: number): Carnot {
  const k = (Th / Tc) ** (1 / (GAMMA - 1));
  const V3 = V2 * k;
  const V4 = V1 * k;
  const Qh = n * R * Th * Math.log(V2 / V1);
  const Qc = n * R * Tc * Math.log(V3 / V4);
  return { V: [V1, V2, V3, V4], Qh, Qc, W: Qh - Qc, eta: 1 - Tc / Th };
}

/** Carnot-Wirkungsgrad η = 1 − T_c / T_h. */
export function carnotEfficiency(Th: number, Tc: number): number {
  return 1 - Tc / Th;
}

/** Leistungszahl einer idealen Wärmepumpe ε = T_h / (T_h − T_c). */
export function heatPumpCop(Th: number, Tc: number): number {
  return Th / (Th - Tc);
}

/**
 * Zustand auf dem Kreisprozess für den Fortschritt s ∈ [0, 4):
 * 0–1 isotherm heiß, 1–2 adiabatisch, 2–3 isotherm kalt, 3–4 adiabatisch.
 * Liefert Volumen (L), Temperatur (K) und Druck (kPa).
 */
export function stateAt(c: Carnot, n: number, Th: number, Tc: number, s: number): { V: number; T: number; p: number; stage: number } {
  const t = ((s % 4) + 4) % 4;
  const stage = Math.floor(t);
  const f = t - stage;
  const [V1, V2, V3, V4] = c.V;
  const geo = (a: number, b: number) => a * (b / a) ** f;
  let V: number;
  let T: number;
  if (stage === 0) {
    V = geo(V1, V2);
    T = Th;
  } else if (stage === 1) {
    V = geo(V2, V3);
    T = Th * (V2 / V) ** (GAMMA - 1);
  } else if (stage === 2) {
    V = geo(V3, V4);
    T = Tc;
  } else {
    V = geo(V4, V1);
    T = Tc * (V4 / V) ** (GAMMA - 1);
  }
  // p in kPa bei V in L: p = nRT / V
  return { V, T, p: (n * R * T) / V, stage };
}

/** Entropieänderung bei direkter Wärmeleitung von T_h nach T_c: ΔS = Q / T_c − Q / T_h > 0. */
export function entropyDirect(Q: number, Th: number, Tc: number): { hot: number; cold: number; total: number } {
  return { hot: -Q / Th, cold: Q / Tc, total: Q / Tc - Q / Th };
}
