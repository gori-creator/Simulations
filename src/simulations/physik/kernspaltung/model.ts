/**
 * Kernspaltung und Kernfusion: Bindungsenergie pro Nukleon (Tröpfchenmodell
 * nach Weizsäcker), Massendefekt, Energie bei Spaltung und Fusion,
 * Kettenreaktion mit Vermehrungsfaktor k.
 */

/** Koeffizienten des Tröpfchenmodells in MeV (übliche Lehrbuchwerte). */
const AV = 15.75;
const AS = 17.8;
const AC = 0.711;
const AA = 23.7;
const AP = 11.18;

/** Bindungsenergie in MeV nach der Weizsäcker-Formel. */
export function bindingEnergy(A: number, Z: number): number {
  const N = A - Z;
  let pair = 0;
  if (Z % 2 === 0 && N % 2 === 0) pair = AP / Math.sqrt(A);
  else if (Z % 2 === 1 && N % 2 === 1) pair = -AP / Math.sqrt(A);
  return AV * A - AS * A ** (2 / 3) - (AC * Z * (Z - 1)) / A ** (1 / 3) - (AA * (A - 2 * Z) ** 2) / A + pair;
}

/** Stabilste Protonenzahl zu A (aus der Formel, gerundet). */
export function stableZ(A: number): number {
  return Math.round(A / (2 + (AC / (2 * AA)) * A ** (2 / 3)));
}

/** Bindungsenergie pro Nukleon (MeV) für den stabilsten Kern mit A Nukleonen. */
export function bindingPerNucleon(A: number): number {
  if (A < 2) return 0;
  return bindingEnergy(A, stableZ(A)) / A;
}

/**
 * Gemessene Bindungsenergien pro Nukleon (MeV) für leichte Kerne, bei denen
 * das Tröpfchenmodell versagt.
 */
export const LIGHT: Record<number, number> = { 1: 0, 2: 1.112, 3: 2.827, 4: 7.074, 6: 5.332, 7: 5.606, 9: 6.463, 12: 7.68, 16: 7.976 };

/** Glatte Modellkurve (ohne Paarungsterm, Z kontinuierlich) für A ≥ 12. */
function smooth(A: number): number {
  const Z = A / (2 + (AC / (2 * AA)) * A ** (2 / 3));
  const B = AV * A - AS * A ** (2 / 3) - (AC * Z * (Z - 1)) / A ** (1 / 3) - (AA * (A - 2 * Z) ** 2) / A;
  return B / A;
}

/**
 * Bindungsenergie pro Nukleon zum Zeichnen: bei leichten Kernen (A < 12)
 * zwischen Messwerten interpoliert, sonst glatte Modellkurve.
 */
export function curve(A: number): number {
  if (A >= 12) return smooth(A);
  const keys = Object.keys(LIGHT)
    .map(Number)
    .sort((x, y) => x - y);
  if (A <= keys[0]!) return LIGHT[keys[0]!]!;
  for (let i = 1; i < keys.length; i++) {
    const k0 = keys[i - 1]!;
    const k1 = keys[i]!;
    if (A <= k1) {
      const f = (A - k0) / (k1 - k0);
      const end = k1 === 12 ? smooth(12) : LIGHT[k1]!;
      return LIGHT[k0]! + f * (end - LIGHT[k0]!);
    }
  }
  return smooth(A);
}

/** Energie bei der Spaltung U-235 + n → Ba-141 + Kr-92 + 3 n (aus den Bindungsenergien, MeV). */
export function fissionEnergy(): number {
  return bindingEnergy(141, 56) + bindingEnergy(92, 36) - bindingEnergy(235, 92);
}

/** Energie bei der Fusion D + T → He-4 + n aus gemessenen Bindungsenergien (MeV). */
export function fusionEnergy(): number {
  return 4 * LIGHT[4]! - 2 * LIGHT[2]! - 3 * LIGHT[3]!;
}

/** Erwartete Zahl der Neutronen nach g Generationen: N_g = N₀ · k^g. */
export function chain(N0: number, k: number, g: number): number {
  return N0 * k ** g;
}

/**
 * Vermehrungsfaktor k: Jede Spaltung setzt im Mittel ν Neutronen frei; jedes
 * davon spaltet mit Wahrscheinlichkeit p einen weiteren Kern (abhängig von
 * Anreicherung, Moderator, Steuerstäben und Entweichen).
 */
export function multiplication(nu: number, p: number): number {
  return nu * p;
}

/* ------------------------------------------------------------------ */
/* Ein Spaltungsereignis: mögliche Spaltprodukte                       */
/* ------------------------------------------------------------------ */

export interface Nuclide {
  sym: string;
  A: number;
  Z: number;
}

export interface FissionChannel {
  id: string;
  a: Nuclide;
  b: Nuclide;
  /** freigesetzte Neutronen */
  n: number;
}

/** U-235 + n → U-236* → zwei Spaltprodukte + Neutronen (Nukleonen- und Ladungszahl bleiben erhalten). */
export const CHANNELS: readonly FissionChannel[] = [
  { id: 'baKr', a: { sym: 'Ba', A: 141, Z: 56 }, b: { sym: 'Kr', A: 92, Z: 36 }, n: 3 },
  { id: 'xeSr', a: { sym: 'Xe', A: 140, Z: 54 }, b: { sym: 'Sr', A: 94, Z: 38 }, n: 2 },
  { id: 'csRb', a: { sym: 'Cs', A: 137, Z: 55 }, b: { sym: 'Rb', A: 97, Z: 37 }, n: 2 },
  { id: 'teZr', a: { sym: 'Te', A: 134, Z: 52 }, b: { sym: 'Zr', A: 100, Z: 40 }, n: 2 },
];

/** Bilanz prüfen: 236 Nukleonen und 92 Protonen. */
export function channelBalanced(c: FissionChannel): boolean {
  return c.a.A + c.b.A + c.n === 236 && c.a.Z + c.b.Z === 92;
}

/** Energie eines Spaltkanals aus den Bindungsenergien (MeV); das Neutron bringt keine Bindung mit. */
export function channelEnergy(c: FissionChannel): number {
  return bindingEnergy(c.a.A, c.a.Z) + bindingEnergy(c.b.A, c.b.Z) - bindingEnergy(235, 92);
}

/* ------------------------------------------------------------------ */
/* Massendefekt und E = m·c²                                           */
/* ------------------------------------------------------------------ */

/** Atomare Masseneinheit in MeV/c². */
export const U_MEV = 931.494;

export type ReactionId = 'spaltung' | 'dt' | 'sonne';

/** Massen vor und nach der Reaktion in u (gemessene Werte, gerundet). */
export const REACTIONS: Record<ReactionId, { before: number; after: number; de: string; en: string }> = {
  spaltung: { before: 235.0439 + 1.00866, after: 140.9144 + 91.9262 + 3 * 1.00866, de: 'U-235 + n → Ba-141 + Kr-92 + 3 n', en: 'U-235 + n → Ba-141 + Kr-92 + 3 n' },
  dt: { before: 2.0141 + 3.01605, after: 4.0026 + 1.00866, de: 'D + T → He-4 + n', en: 'D + T → He-4 + n' },
  sonne: { before: 4 * 1.007276, after: 4.001506 + 2 * 0.000549, de: '4 p → He-4 + 2 e⁺ (Sonne)', en: '4 p → He-4 + 2 e⁺ (Sun)' },
};

/** Massendefekt Δm (u) und freigesetzte Energie (MeV) einer Reaktion. */
export function massDefect(id: ReactionId): { dm: number; E: number; share: number } {
  const r = REACTIONS[id];
  const dm = r.before - r.after;
  return { dm, E: dm * U_MEV, share: dm / r.before };
}

/* ------------------------------------------------------------------ */
/* Kraftwerk: Energie aus Uran im Vergleich                            */
/* ------------------------------------------------------------------ */

/** Avogadro-Konstante. */
export const NA = 6.02214076e23;
/** Energie je Spaltung in J (rund 200 MeV). */
export const E_FISSION_J = 200 * 1.602176634e-13;
/** Heizwert von Steinkohle in J/kg. */
export const COAL_J_PER_KG = 29e6;
/** Jahresverbrauch eines Haushalts in kWh (Strom). */
export const HOUSEHOLD_KWH = 3500;
/** Wirkungsgrad eines Kraftwerks (Wärme → Strom). */
export const PLANT_ETA = 0.33;

/** Wärme in J, wenn m Gramm U-235 vollständig gespalten werden. */
export function uraniumHeat(grams: number): number {
  return (grams / 235) * NA * E_FISSION_J;
}

/** Kohle in kg mit derselben Wärme. */
export function coalEquivalent(J: number): number {
  return J / COAL_J_PER_KG;
}

/** Haushaltsjahre Strom (bei Wirkungsgrad PLANT_ETA). */
export function householdYears(J: number): number {
  return (J * PLANT_ETA) / 3.6e6 / HOUSEHOLD_KWH;
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'neutrons' | 'k' | 'state' | 'energy' | 'side' | 'mass';

export interface NuclearTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  /** zulässige relative Abweichung (0 = genau) */
  tol: number;
  choices: Loc[] | null;
  solution: Loc;
}

function taskRng(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zahl mit Dezimalkomma (de) bzw. Punkt (en). */
export function numText(x: number, lang: 'de' | 'en', d = 2): string {
  const s = String(Math.round(x * 10 ** d) / 10 ** d);
  return lang === 'de' ? s.replace('.', ',') : s;
}

/** Übungsaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): NuclearTask {
  const r = taskRng(n * 67 + 5);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['neutrons', 'k', 'state', 'side', 'energy', 'mass'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const nt = numText;
  if (kind === 'neutrons') {
    const c = pick(CHANNELS);
    return {
      kind,
      text: {
        de: `U-235 + n → ${c.a.sym}-${c.a.A} + ${c.b.sym}-${c.b.A} + ? n. Wie viele Neutronen werden frei?`,
        en: `U-235 + n → ${c.a.sym}-${c.a.A} + ${c.b.sym}-${c.b.A} + ? n. How many neutrons are released?`,
      },
      answer: c.n,
      tol: 0,
      choices: null,
      solution: { de: `236 − ${c.a.A} − ${c.b.A} = ${c.n}. Die Zahl der Nukleonen bleibt erhalten.`, en: `236 − ${c.a.A} − ${c.b.A} = ${c.n}. The number of nucleons is conserved.` },
    };
  }
  if (kind === 'k') {
    const p = pick([0.3, 0.4, 0.5, 0.6]);
    const nu = 2.5;
    const kk = nu * p;
    return {
      kind,
      text: {
        de: `Jede Spaltung setzt im Mittel 2,5 Neutronen frei. ${nt(p * 100, 'de', 0)} % davon lösen eine neue Spaltung aus. Wie groß ist der Vermehrungsfaktor k?`,
        en: `Each fission releases 2.5 neutrons on average. ${nt(p * 100, 'en', 0)} % of them cause a new fission. What is the multiplication factor k?`,
      },
      answer: kk,
      tol: 0.01,
      choices: null,
      solution: { de: `k = 2,5 · ${nt(p, 'de')} = ${nt(kk, 'de')}`, en: `k = 2.5 · ${nt(p, 'en')} = ${nt(kk, 'en')}` },
    };
  }
  if (kind === 'state') {
    const kk = pick([0.8, 1, 1.25]);
    return {
      kind,
      text: {
        de: `Ein Reaktor hat den Vermehrungsfaktor k = ${nt(kk, 'de')}. Wie verhält sich die Kettenreaktion?`,
        en: `A reactor has the multiplication factor k = ${nt(kk, 'en')}. How does the chain reaction behave?`,
      },
      answer: kk < 1 ? 1 : kk === 1 ? 2 : 3,
      tol: 0,
      choices: [
        { de: 'sie erlischt (unterkritisch)', en: 'it dies out (subcritical)' },
        { de: 'sie bleibt gleich (kritisch)', en: 'it stays constant (critical)' },
        { de: 'sie wächst an (überkritisch)', en: 'it grows (supercritical)' },
      ],
      solution: {
        de: 'k < 1: weniger Neutronen je Generation; k = 1: gleich viele (Normalbetrieb); k > 1: immer mehr.',
        en: 'k < 1: fewer neutrons each generation; k = 1: the same number (normal operation); k > 1: more and more.',
      },
    };
  }
  if (kind === 'side') {
    const items: [Loc, number][] = [
      [{ de: 'Uran-235 wird gespalten.', en: 'Uranium-235 is split.' }, 1],
      [{ de: 'In der Sonne verschmelzen Wasserstoffkerne zu Helium.', en: 'In the Sun hydrogen nuclei fuse into helium.' }, 2],
      [{ de: 'Eisen-56 wird gespalten.', en: 'Iron-56 is split.' }, 3],
      [{ de: 'Deuterium und Tritium verschmelzen.', en: 'Deuterium and tritium fuse.' }, 2],
    ];
    const [t, a] = pick(items);
    return {
      kind,
      text: { de: `Wird bei diesem Vorgang Energie frei? „${t.de}“`, en: `Is energy released in this process? “${t.en}”` },
      answer: a,
      tol: 0,
      choices: [
        { de: 'ja, durch Spaltung schwerer Kerne', en: 'yes, by splitting heavy nuclei' },
        { de: 'ja, durch Verschmelzen leichter Kerne', en: 'yes, by fusing light nuclei' },
        { de: 'nein, Eisen ist am festesten gebunden', en: 'no, iron is the most tightly bound' },
      ],
      solution: {
        de: 'Energie wird frei, wenn die Kerne in Richtung Eisen (höchste Bindungsenergie pro Nukleon) wandern.',
        en: 'Energy is released when nuclei move towards iron (highest binding energy per nucleon).',
      },
    };
  }
  if (kind === 'energy') {
    const g = pick([1, 2, 5]);
    const MWh = uraniumHeat(g) / 3.6e9;
    return {
      kind,
      text: {
        de: `Wie viel Wärme in MWh entsteht, wenn ${g} g Uran-235 vollständig gespalten werden? (200 MeV je Spaltung)`,
        en: `How much heat in MWh is produced when ${g} g of uranium-235 are completely split? (200 MeV per fission)`,
      },
      answer: MWh,
      tol: 0.04,
      choices: null,
      solution: {
        de: `N = ${g} g : 235 g/mol · 6,02 · 10²³ ≈ ${nt((g / 235) * 6.022, 'de', 3)} · 10²³ Kerne; E ≈ ${nt(MWh, 'de', 1)} MWh – so viel wie etwa ${nt(coalEquivalent(uraniumHeat(g)) / 1000, 'de', 1)} t Kohle.`,
        en: `N = ${g} g / 235 g/mol · 6.02 · 10²³ ≈ ${nt((g / 235) * 6.022, 'en', 3)} · 10²³ nuclei; E ≈ ${nt(MWh, 'en', 1)} MWh – as much as about ${nt(coalEquivalent(uraniumHeat(g)) / 1000, 'en', 1)} t of coal.`,
      },
    };
  }
  const id = pick(['dt', 'spaltung'] as ReactionId[]);
  const md = massDefect(id);
  return {
    kind: 'mass',
    text: {
      de: `Bei ${REACTIONS[id].de} verschwinden ${nt(md.dm, 'de', 4)} u Masse. Wie viel Energie in MeV wird frei? (1 u entspricht 931,5 MeV)`,
      en: `In ${REACTIONS[id].en} a mass of ${nt(md.dm, 'en', 4)} u disappears. How much energy in MeV is released? (1 u corresponds to 931.5 MeV)`,
    },
    answer: md.E,
    tol: 0.02,
    choices: null,
    solution: { de: `E = Δm · c² = ${nt(md.dm, 'de', 4)} · 931,5 MeV ≈ ${nt(md.E, 'de', 1)} MeV`, en: `E = Δm · c² = ${nt(md.dm, 'en', 4)} · 931.5 MeV ≈ ${nt(md.E, 'en', 1)} MeV` },
  };
}

/** Antwort prüfen: null bei unlesbarer Eingabe. */
export function checkTask(task: NuclearTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[a-zA-Z]+$/, '');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
