/**
 * Standardmodell der Teilchenphysik: Elementarteilchen mit Masse, Ladung
 * und Wechselwirkungen; Hadronen aus Quarks; Paarbildung.
 */

export type Kind = 'quark' | 'lepton' | 'boson';

export interface Particle {
  id: string;
  symbol: string;
  name: { de: string; en: string };
  kind: Kind;
  /** Generation 1–3 (Bosonen: 0). */
  gen: number;
  /** Ladung in Elementarladungen als Bruch [Zähler, Nenner]. */
  charge: [number, number];
  /** Masse in MeV/c² (0 = masselos; Neutrinos: obere Schranke). */
  mass: number;
  /** Wechselwirkungen: s = stark, e = elektromagnetisch, w = schwach. */
  forces: string;
}

const P = (id: string, symbol: string, de: string, en: string, kind: Kind, gen: number, charge: [number, number], mass: number, forces: string): Particle => ({
  id,
  symbol,
  name: { de, en },
  kind,
  gen,
  charge,
  mass,
  forces,
});

export const PARTICLES: readonly Particle[] = [
  P('u', 'u', 'Up-Quark', 'up quark', 'quark', 1, [2, 3], 2.2, 'sew'),
  P('c', 'c', 'Charm-Quark', 'charm quark', 'quark', 2, [2, 3], 1270, 'sew'),
  P('t', 't', 'Top-Quark', 'top quark', 'quark', 3, [2, 3], 172700, 'sew'),
  P('d', 'd', 'Down-Quark', 'down quark', 'quark', 1, [-1, 3], 4.7, 'sew'),
  P('s', 's', 'Strange-Quark', 'strange quark', 'quark', 2, [-1, 3], 96, 'sew'),
  P('b', 'b', 'Bottom-Quark', 'bottom quark', 'quark', 3, [-1, 3], 4180, 'sew'),
  P('e', 'e', 'Elektron', 'electron', 'lepton', 1, [-1, 1], 0.511, 'ew'),
  P('mu', 'μ', 'Myon', 'muon', 'lepton', 2, [-1, 1], 105.7, 'ew'),
  P('tau', 'τ', 'Tauon', 'tau', 'lepton', 3, [-1, 1], 1777, 'ew'),
  P('ve', 'ν_e', 'Elektron-Neutrino', 'electron neutrino', 'lepton', 1, [0, 1], 1e-6, 'w'),
  P('vmu', 'ν_μ', 'Myon-Neutrino', 'muon neutrino', 'lepton', 2, [0, 1], 1e-6, 'w'),
  P('vtau', 'ν_τ', 'Tau-Neutrino', 'tau neutrino', 'lepton', 3, [0, 1], 1e-6, 'w'),
  P('g', 'g', 'Gluon', 'gluon', 'boson', 0, [0, 1], 0, 's'),
  P('gamma', 'γ', 'Photon', 'photon', 'boson', 0, [0, 1], 0, 'e'),
  P('Z', 'Z', 'Z-Boson', 'Z boson', 'boson', 0, [0, 1], 91188, 'w'),
  P('W', 'W', 'W-Boson', 'W boson', 'boson', 0, [1, 1], 80377, 'w'),
  P('H', 'H', 'Higgs-Boson', 'Higgs boson', 'boson', 0, [0, 1], 125100, ''),
];

export function particle(id: string): Particle {
  const p = PARTICLES.find((q) => q.id === id);
  if (!p) throw new Error(`unbekanntes Teilchen ${id}`);
  return p;
}

/* ------------------------------------------------------------------ */
/* Hadronen aus Quarks                                                 */
/* ------------------------------------------------------------------ */

/** Quark-Bausteine: u, d, s und ihre Antiquarks (ub, db, sb). */
export type QuarkId = 'u' | 'd' | 's' | 'ub' | 'db' | 'sb';

/** Ladung in Dritteln der Elementarladung. */
export function quarkCharge3(q: QuarkId): number {
  const base = q[0] === 'u' ? 2 : -1;
  return q.length === 2 ? -base : base;
}

export const isAnti = (q: QuarkId) => q.length === 2;

export interface Hadron {
  /** Ladung in Elementarladungen (ganzzahlig, wenn erlaubt). */
  charge3: number;
  /** Baryonenzahl in Dritteln. */
  baryon3: number;
  /** Name des Teilchens oder `null` (z. B. nicht erlaubte Kombination). */
  name: string | null;
  kind: 'baryon' | 'antibaryon' | 'meson' | 'none' | 'invalid' | 'single';
}


const MESONS: Record<string, string> = {
  'u|d': 'π⁺',
  'd|u': 'π⁻',
  'u|u': 'π⁰',
  'd|d': 'π⁰',
  'u|s': 'K⁺',
  's|u': 'K⁻',
  'd|s': 'K⁰',
  's|d': 'K̄⁰',
  's|s': 'φ',
};

/** Baut aus bis zu drei Quarks ein Hadron und prüft, ob die Kombination erlaubt ist. */
export function combine(qs: readonly QuarkId[]): Hadron {
  const charge3 = qs.reduce((s, q) => s + quarkCharge3(q), 0);
  const nAnti = qs.filter(isAnti).length;
  const nQ = qs.length - nAnti;
  const baryon3 = nQ - nAnti;
  if (qs.length === 0) return { charge3: 0, baryon3: 0, name: null, kind: 'none' };
  if (qs.length === 1) return { charge3, baryon3, name: null, kind: 'single' };
  if (qs.length === 3 && (nAnti === 0 || nAnti === 3)) {
    const key = qs
      .map((q) => q[0]!)
      .sort()
      .join('');
    // Quarks alphabetisch sortiert (d < s < u): uud → „duu“
    const names: Record<string, string> = { duu: 'p', ddu: 'n', uuu: 'Δ⁺⁺', ddd: 'Δ⁻', dsu: 'Λ⁰', suu: 'Σ⁺', dds: 'Σ⁻', ssu: 'Ξ⁰', dss: 'Ξ⁻', sss: 'Ω⁻' };
    const n = names[key] ?? null;
    if (nAnti === 0) return { charge3, baryon3, name: n, kind: 'baryon' };
    return { charge3, baryon3, name: n ? `anti-${n}` : null, kind: 'antibaryon' };
  }
  if (qs.length === 2 && nAnti === 1) {
    const q = qs.find((x) => !isAnti(x))![0]!;
    const a = qs.find(isAnti)![0]!;
    return { charge3, baryon3, name: MESONS[`${q}|${a}`] ?? null, kind: 'meson' };
  }
  return { charge3, baryon3, name: null, kind: 'invalid' };
}

/* ------------------------------------------------------------------ */
/* Paarbildung                                                         */
/* ------------------------------------------------------------------ */

export const ME = 0.511; // MeV

/** Bewegungsenergie je Teilchen (Elektron und Positron teilen sich gleich auf). */
export function pairKinetic(Egamma: number): number {
  return Math.max(0, (Egamma - 2 * ME) / 2);
}

/** Impuls·c in MeV aus der Bewegungsenergie. */
export function momentumMeV(Ek: number): number {
  return Math.sqrt(Ek * Ek + 2 * Ek * ME);
}

/** Bahnradius in cm im Magnetfeld B (in Tesla): r = p/(e·B) mit p·c in MeV. */
export function radiusCm(pc: number, B: number): number {
  // r [m] = p [MeV/c] / (299,79 · B [T])
  return (pc / (299.79 * B)) * 100;
}
