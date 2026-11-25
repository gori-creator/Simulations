/**
 * Mach-Zehnder-Interferometer mit einzelnen Photonen: Interferenz,
 * Welcher-Weg-Information, Delayed Choice (zweiter Strahlteiler).
 */

export interface Setup {
  /** Phasenunterschied zwischen den Wegen (rad) */
  phase: number;
  /** Zweiter Strahlteiler eingesetzt? */
  bs2: boolean;
  /** Welcher-Weg-Markierung (z. B. Polarisationsfilter oder Detektor) */
  marked: boolean;
}

/** Wahrscheinlichkeiten für Detektor 1 und 2. */
export function detectorProbabilities(s: Setup): [number, number] {
  if (!s.bs2) return [0.5, 0.5];
  if (s.marked) return [0.5, 0.5];
  const p1 = Math.cos(s.phase / 2) ** 2;
  return [p1, 1 - p1];
}

/** Ist eine Welcher-Weg-Information grundsätzlich vorhanden? */
export function whichWayKnown(s: Setup): boolean {
  return s.marked || !s.bs2;
}

/** Einfacher reproduzierbarer Zufallsgenerator (Mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Simuliert N einzelne Photonen; liefert die Zählraten an Detektor 1 und 2. */
export function countPhotons(s: Setup, N: number, random: () => number): [number, number] {
  const [p1] = detectorProbabilities(s);
  let c1 = 0;
  for (let k = 0; k < N; k++) if (random() < p1) c1++;
  return [c1, N - c1];
}
