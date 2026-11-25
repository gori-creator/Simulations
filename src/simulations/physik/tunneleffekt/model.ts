/**
 * Tunneleffekt: Elektron an einer Rechteckbarriere (stationäre Lösung der
 * Schrödinger-Gleichung, Transmission) und Rastertunnelmikroskop.
 */

/** ħ²/(2mₑ) in eV·nm². */
export const H2M = 0.0381;

type Cx = [number, number];
const cadd = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]];
const csub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]];
const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cexp = (a: Cx): Cx => {
  const m = Math.exp(a[0]);
  return [m * Math.cos(a[1]), m * Math.sin(a[1])];
};
const half: Cx = [0.5, 0];

/** Komplexe Wellenzahl q = √((E − V)/(ħ²/2m)) in 1/nm (rein imaginär, wenn E < V). */
function wavenumber(E: number, V: number): Cx {
  const s = (E - V) / H2M;
  return s >= 0 ? [Math.sqrt(s), 0] : [0, Math.sqrt(-s)];
}

export interface BarrierSolution {
  /** Durchlasswahrscheinlichkeit. */
  T: number;
  /** Wellenfunktion ψ(x) (komplex) bei einlaufender Welle der Amplitude 1. */
  psi: (x: number) => Cx;
}

/**
 * Stationäre Lösung für eine Rechteckbarriere der Höhe V₀ (eV) zwischen
 * x = 0 und x = d (nm); Elektron mit Energie E (eV) läuft von links ein.
 */
export function solveBarrier(E0: number, V0: number, d: number): BarrierSolution {
  // genau E = V₀ vermeiden (dort ist q = 0)
  const E = Math.abs(E0 - V0) < 1e-6 ? E0 + 1e-6 : E0;
  const k = wavenumber(E, 0);
  const q = wavenumber(E, V0);
  const i: Cx = [0, 1];
  const ik = cmul(i, k);
  const iq = cmul(i, q);
  // rechts: ψ = e^{ikx} (Amplitude 1, wird später normiert)
  const psiD = cexp(cmul(ik, [d, 0]));
  const dpsiD = cmul(ik, psiD);
  // in der Barriere: ψ = A e^{iqx} + B e^{−iqx}
  const A = cmul(cmul(half, cadd(psiD, cdiv(dpsiD, iq))), cexp(cmul(iq, [-d, 0])));
  const B = cmul(cmul(half, csub(psiD, cdiv(dpsiD, iq))), cexp(cmul(iq, [d, 0])));
  const psi0 = cadd(A, B);
  const dpsi0 = cmul(iq, csub(A, B));
  // links: ψ = a e^{ikx} + b e^{−ikx}
  const a = cmul(half, cadd(psi0, cdiv(dpsi0, ik)));
  const b = cmul(half, csub(psi0, cdiv(dpsi0, ik)));
  const t = cdiv([1, 0], a);
  const T = t[0] * t[0] + t[1] * t[1];
  const n = (z: Cx) => cmul(z, t);
  const psi = (x: number): Cx => {
    if (x < 0) return n(cadd(cmul(a, cexp(cmul(ik, [x, 0]))), cmul(b, cexp(cmul(ik, [-x, 0])))));
    if (x <= d) return n(cadd(cmul(A, cexp(cmul(iq, [x, 0]))), cmul(B, cexp(cmul(iq, [-x, 0])))));
    return n(cexp(cmul(ik, [x, 0])));
  };
  return { T, psi };
}

/** Lehrbuchformel für die Transmission (zum Vergleich und für Tests). */
export function transmission(E: number, V0: number, d: number): number {
  if (E < V0) {
    const kappa = Math.sqrt((V0 - E) / H2M);
    const s = Math.sinh(kappa * d);
    return 1 / (1 + (V0 * V0 * s * s) / (4 * E * (V0 - E)));
  }
  if (E > V0) {
    const kk = Math.sqrt((E - V0) / H2M);
    const s = Math.sin(kk * d);
    return 1 / (1 + (V0 * V0 * s * s) / (4 * E * (E - V0)));
  }
  return 1 / (1 + (V0 * d * d) / (4 * H2M));
}

/** Abklingkonstante κ = √(2m(V₀ − E))/ħ in 1/nm. */
export function kappa(E: number, V0: number): number {
  return Math.sqrt(Math.max(0, V0 - E) / H2M);
}

/* ------------------------------------------------------------------ */
/* Rastertunnelmikroskop                                               */
/* ------------------------------------------------------------------ */

/** Austrittsarbeit (Barrierenhöhe) für das Rastertunnelmikroskop in eV. */
export const PHI = 4.5;
export const KAPPA_STM = kappa(0, PHI);

/** Tunnelstrom relativ: I ∝ e^{−2κs}; bei s = 0,5 nm genau 1 nA. */
export function stmCurrent(gap: number): number {
  return Math.exp(-2 * KAPPA_STM * (gap - 0.5));
}

export interface SurfaceAtom {
  x: number;
  /** Höhe des Mittelpunkts in nm. */
  y: number;
}

export const ATOM_R = 0.15;
export const SCAN_L = 3;

/** Oberfläche: Atomreihe mit einer Lücke und einem aufgesetzten Atom. */
export function surfaceAtoms(): SurfaceAtom[] {
  const atoms: SurfaceAtom[] = [];
  for (let j = 0; j <= 10; j++) {
    const x = j * 0.3;
    if (j === 3) continue; // Fehlstelle
    atoms.push({ x, y: 0 });
  }
  atoms.push({ x: 2.25, y: 0.26 }); // aufgesetztes Atom
  return atoms;
}

/** Höhe der Oberfläche (Oberkante der Atome) an der Stelle x. */
export function surfaceHeight(x: number, atoms: readonly SurfaceAtom[]): number {
  let h = -ATOM_R;
  for (const a of atoms) {
    const dx = x - a.x;
    if (Math.abs(dx) < ATOM_R) h = Math.max(h, a.y + Math.sqrt(ATOM_R * ATOM_R - dx * dx));
  }
  return h;
}
