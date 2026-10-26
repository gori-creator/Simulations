/**
 * Rechenlogik „Linienspektren und Energieniveaus“ (ohne Zeichnen).
 *
 * Ein Atom kann nur bestimmte Energien haben (Energieniveaus). Springt das
 * Elektron von einem höheren Niveau E_o auf ein tieferes E_u, sendet das Atom
 * genau ein Photon mit der Energie
 *
 *   ΔE = E_o − E_u = h · f,   also   f = ΔE / h   und   λ = c / f = h · c / ΔE
 *
 * aus (Emission). Umgekehrt nimmt es aus weißem Licht genau die Photonen mit
 * dieser Energie auf (Absorption) – im Spektrum fehlen dann dieselben Linien.
 *
 * Wasserstoff: E_n = −13,6 eV / n² (Bohr), daraus die Serien
 *   Lyman (Ende n = 1, UV), Balmer (n = 2, sichtbar), Paschen (n = 3, IR) …
 * Helium, Natrium und Quecksilber: ausgewählte Niveaus aus Tabellenwerten
 * (NIST, gerundet) und die Übergänge, die in den bekannten Spektren vorkommen.
 *
 * Energien in eV, bezogen auf die Ionisierung (E = 0: Elektron gerade frei),
 * Wellenlängen in nm (Vakuum), Frequenzen in Hz.
 */

/** Planck-Konstante in J·s. */
export const PLANCK = 6.62607015e-34;
/** Lichtgeschwindigkeit in m/s. */
export const LIGHT_SPEED = 299792458;
/** Elementarladung in C (1 eV = 1,602 · 10⁻¹⁹ J). */
export const ELEMENTARY_CHARGE = 1.602176634e-19;
/** h · c in eV · nm (≈ 1240 eV · nm). */
export const HC_EV_NM = ((PLANCK * LIGHT_SPEED) / ELEMENTARY_CHARGE) * 1e9;
/** Ionisierungsenergie von Wasserstoff im Bohr-Modell (Schulwert) in eV. */
export const RYDBERG_EV = 13.6;
/** Grenzen des sichtbaren Lichts in nm. */
export const VISIBLE_MIN = 380;
export const VISIBLE_MAX = 780;

export type ElementId = 'H' | 'He' | 'Na' | 'Hg';
export const ELEMENT_IDS: readonly ElementId[] = ['H', 'He', 'Na', 'Hg'];

export interface Level {
  /** Bezeichnung im Termschema, z. B. „n = 3“, „3p“, „2³P“. */
  label: string;
  /** Energie in eV (Ionisierung = 0, gebundene Zustände negativ). */
  E: number;
  /** Spalte im Termschema (Bahndrehimpuls bzw. Singulett/Triplett). */
  col: number;
}

export interface TransitionDef {
  /** Nummer des oberen und unteren Niveaus (1 = Grundzustand). */
  u: number;
  l: number;
  /** Relative Helligkeit der Linie (Richtwert, 1 = hellste Linie). */
  w: number;
}

export interface ElementData {
  id: ElementId;
  /** Ionisierungsenergie in eV. */
  ionization: number;
  levels: Level[];
  transitions: TransitionDef[];
  /** Spaltenköpfe des Termschemas (leer: keine Köpfe). */
  columns: string[];
}

/** Energie des Wasserstoff-Niveaus n (Bohr): E_n = −13,6 eV / n². */
export function hydrogenEnergy(n: number): number {
  return -RYDBERG_EV / (n * n);
}

/** Niveaus aus Energien über dem Grundzustand (Tabellenwerte) und der Ionisierungsenergie. */
function fromGround(ion: number, list: [string, number, number][]): Level[] {
  return list.map(([label, e, col]) => ({ label, E: e - ion, col }));
}

const H_MAX = 6;
const hydrogen: ElementData = {
  id: 'H',
  ionization: RYDBERG_EV,
  levels: Array.from({ length: H_MAX }, (_, i) => ({ label: `n = ${i + 1}`, E: hydrogenEnergy(i + 1), col: 0 })),
  // alle Sprünge nach unten sind möglich; Helligkeit grob wie die Balmer-Abnahme Hα : Hβ : Hγ ≈ 1 : 0,35 : 0,16
  transitions: (() => {
    const out: TransitionDef[] = [];
    for (let u = 2; u <= H_MAX; u++) for (let l = 1; l < u; l++) out.push({ u, l, w: Math.pow(u - l, -1.6) });
    return out;
  })(),
  columns: [],
};

/** Helium (Energien über dem Grundzustand in eV, NIST): Singulett links, Triplett rechts. */
const HE_ION = 24.5874;
const helium: ElementData = {
  id: 'He',
  ionization: HE_ION,
  levels: fromGround(HE_ION, [
    ['1¹S', 0, 0],
    ['2³S', 19.8196, 3],
    ['2¹S', 20.6158, 0],
    ['2³P', 20.9641, 4],
    ['2¹P', 21.218, 1],
    ['3³S', 22.7185, 3],
    ['3³D', 23.0736, 5],
    ['3¹D', 23.0741, 2],
    ['3¹P', 23.087, 1],
    ['4³D', 23.7361, 5],
  ]),
  transitions: [
    { u: 7, l: 4, w: 1 }, // 587,6 nm gelb
    { u: 8, l: 5, w: 0.5 }, // 667,8 nm rot
    { u: 6, l: 4, w: 0.4 }, // 706,5 nm dunkelrot
    { u: 9, l: 3, w: 0.35 }, // 501,6 nm grün
    { u: 10, l: 4, w: 0.35 }, // 447,1 nm blau
    { u: 4, l: 2, w: 0.8 }, // 1083 nm IR
    { u: 5, l: 1, w: 0.6 }, // 58,4 nm UV
    { u: 9, l: 1, w: 0.3 }, // 53,7 nm UV
    { u: 5, l: 3, w: 0.15 }, // 2059 nm IR
  ],
  columns: ['¹S', '¹P', '¹D', '³S', '³P', '³D'],
};

/** Natrium (Leuchtelektron, NIST). */
const NA_ION = 5.1391;
const sodium: ElementData = {
  id: 'Na',
  ionization: NA_ION,
  levels: fromGround(NA_ION, [
    ['3s', 0, 0],
    ['3p', 2.1044, 1],
    ['4s', 3.1913, 0],
    ['3d', 3.617, 2],
    ['4p', 3.753, 1],
    ['5s', 4.1164, 0],
    ['4d', 4.2838, 2],
    ['6s', 4.5096, 0],
    ['5d', 4.592, 2],
  ]),
  transitions: [
    { u: 2, l: 1, w: 1 }, // 589 nm (D-Linie)
    { u: 7, l: 2, w: 0.25 }, // 568,8 nm
    { u: 6, l: 2, w: 0.2 }, // 615,4 nm
    { u: 8, l: 2, w: 0.1 }, // 515,3 nm
    { u: 9, l: 2, w: 0.12 }, // 498,3 nm
    { u: 4, l: 2, w: 0.4 }, // 819 nm IR
    { u: 3, l: 2, w: 0.3 }, // 1140 nm IR
    { u: 5, l: 1, w: 0.2 }, // 330 nm UV
  ],
  columns: ['s', 'p', 'd'],
};

/** Quecksilber (NIST). */
const HG_ION = 10.4375;
const mercury: ElementData = {
  id: 'Hg',
  ionization: HG_ION,
  levels: fromGround(HG_ION, [
    ['6¹S₀', 0, 0],
    ['6³P₀', 4.6667, 4],
    ['6³P₁', 4.8864, 4],
    ['6³P₂', 5.4606, 4],
    ['6¹P₁', 6.7037, 1],
    ['7³S₁', 7.7305, 3],
    ['7¹S₀', 7.9261, 0],
    ['6¹D₂', 8.8442, 2],
    ['6³D₂', 8.852, 5],
    ['6³D₃', 8.8563, 5],
  ]),
  transitions: [
    { u: 3, l: 1, w: 1 }, // 253,7 nm UV (Resonanzlinie)
    { u: 5, l: 1, w: 0.6 }, // 184,9 nm UV
    { u: 6, l: 2, w: 0.35 }, // 404,7 nm violett
    { u: 6, l: 3, w: 0.7 }, // 435,8 nm blau
    { u: 6, l: 4, w: 1 }, // 546,1 nm grün
    { u: 8, l: 5, w: 0.35 }, // 579,1 nm gelb
    { u: 9, l: 5, w: 0.3 }, // 577,0 nm gelb
    { u: 10, l: 4, w: 0.4 }, // 365,0 nm UV
    { u: 7, l: 3, w: 0.1 }, // 407,8 nm violett
    { u: 7, l: 5, w: 0.15 }, // 1014 nm IR
  ],
  columns: ['¹S', '¹P', '¹D', '³S', '³P', '³D'],
};

export const ELEMENTS: Record<ElementId, ElementData> = { H: hydrogen, He: helium, Na: sodium, Hg: mercury };

/** Element zu einer (eventuell ungültigen) Kennung; Standard Wasserstoff. */
export function elementOf(id: string): ElementData {
  return (ELEMENTS as Record<string, ElementData | undefined>)[id] ?? hydrogen;
}

/* ------------------------------------------------------------------ */
/* Photon: E = h · f, λ = c / f                                         */
/* ------------------------------------------------------------------ */

/** Frequenz in Hz zur Photonenenergie in eV: f = E / h. */
export function frequencyOf(energyEV: number): number {
  return (energyEV * ELEMENTARY_CHARGE) / PLANCK;
}

/** Wellenlänge in nm zur Photonenenergie in eV: λ = h · c / E. */
export function wavelengthOf(energyEV: number): number {
  return HC_EV_NM / energyEV;
}

/** Photonenenergie in eV zur Wellenlänge in nm. */
export function energyOf(lambdaNm: number): number {
  return HC_EV_NM / lambdaNm;
}

/** Energie in J zu eV. */
export function joule(energyEV: number): number {
  return energyEV * ELEMENTARY_CHARGE;
}

export interface Line {
  u: number;
  l: number;
  /** Photonenenergie ΔE = E_o − E_u in eV. */
  dE: number;
  /** Frequenz in Hz und Wellenlänge in nm. */
  f: number;
  lambda: number;
  w: number;
}

/** Linie eines Übergangs (u > l). */
export function lineOf(el: ElementData, u: number, l: number, w = 1): Line {
  const dE = el.levels[u - 1]!.E - el.levels[l - 1]!.E;
  return { u, l, dE, f: frequencyOf(dE), lambda: wavelengthOf(dE), w };
}

/** Alle Linien eines Elements (in der Reihenfolge der Übergänge). */
export function linesOf(el: ElementData): Line[] {
  return el.transitions.map((t) => lineOf(el, t.u, t.l, t.w));
}

/** Ist der Übergang u → l bei diesem Element vorgesehen? */
export function isAllowed(el: ElementData, u: number, l: number): boolean {
  return el.transitions.some((t) => t.u === u && t.l === l);
}

/**
 * Gültiger Übergang zu einer Wahl (u, l): unverändert, wenn vorgesehen;
 * sonst (mit u höchstens gleich der Zahl der Niveaus) die hellste Linie vom Niveau u nach unten; sonst die hellste Linie
 * nach l hinunter; sonst die hellste Linie überhaupt.
 */
export function resolveTransition(el: ElementData, u: number, l: number): TransitionDef {
  // zu große Nummern (Regler bis 10, Wasserstoff hat 6 Niveaus) auf das höchste Niveau setzen
  u = Math.min(u, el.levels.length);
  const exact = el.transitions.find((t) => t.u === u && t.l === l);
  if (exact) return exact;
  const best = (list: TransitionDef[]) => list.reduce<TransitionDef | null>((a, t) => (!a || t.w > a.w ? t : a), null);
  return best(el.transitions.filter((t) => t.u === u)) ?? best(el.transitions.filter((t) => t.l === l)) ?? best(el.transitions)!;
}

/** Übergänge, die vom Niveau u nach unten führen (für Kaskaden). */
export function downFrom(el: ElementData, u: number): TransitionDef[] {
  return el.transitions.filter((t) => t.u === u);
}

/* ------------------------------------------------------------------ */
/* Spektralbereiche und Farben                                          */
/* ------------------------------------------------------------------ */

export type Region = 'uv' | 'vis' | 'ir';

export function regionOf(lambdaNm: number): Region {
  if (lambdaNm < VISIBLE_MIN) return 'uv';
  if (lambdaNm > VISIBLE_MAX) return 'ir';
  return 'vis';
}

/** Farbname (Schlüssel) zur Wellenlänge im sichtbaren Bereich. */
export type ColorName = 'violet' | 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | 'red';

export function colorNameOf(lambdaNm: number): ColorName | null {
  if (lambdaNm < VISIBLE_MIN || lambdaNm > VISIBLE_MAX) return null;
  if (lambdaNm < 430) return 'violet';
  if (lambdaNm < 480) return 'blue';
  // Hβ (486 nm) heißt im Unterricht meist „blaugrün“ bzw. „türkis“
  if (lambdaNm < 510) return 'cyan';
  if (lambdaNm < 565) return 'green';
  if (lambdaNm < 590) return 'yellow';
  if (lambdaNm < 625) return 'orange';
  return 'red';
}

/**
 * Bildschirmfarbe (sRGB, 0 … 255) zu einer Wellenlänge, Näherung nach Bruton:
 * reine Spektralfarben, zu den Rändern des sichtbaren Bereichs hin dunkler.
 * Außerhalb des sichtbaren Bereichs: null.
 */
export function wavelengthToRgb(lambdaNm: number): [number, number, number] | null {
  const l = lambdaNm;
  if (!(l >= VISIBLE_MIN && l <= VISIBLE_MAX)) return null;
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
  // Empfindlichkeit des Auges fällt zu den Rändern ab
  let k = 1;
  if (l < 420) k = 0.3 + (0.7 * (l - VISIBLE_MIN)) / 40;
  else if (l > 700) k = 0.3 + (0.7 * (VISIBLE_MAX - l)) / 80;
  const c = (v: number) => Math.round(255 * Math.pow(Math.max(0, v * k), 0.8));
  return [c(r), c(g), c(b)];
}

/** Name der Wasserstoff-Serie nach dem unteren Niveau. */
export type Series = 'lyman' | 'balmer' | 'paschen' | 'brackett' | 'pfund';
export function hydrogenSeries(lower: number): Series | null {
  return (['lyman', 'balmer', 'paschen', 'brackett', 'pfund'] as const)[lower - 1] ?? null;
}

/** Rydberg-Formel für Wasserstoff: 1/λ = R · (1/l² − 1/u²) mit R = 13,6 eV / (h · c); λ in nm. */
export function rydbergWavelength(u: number, l: number): number {
  return 1 / ((RYDBERG_EV / HC_EV_NM) * (1 / (l * l) - 1 / (u * u)));
}

/**
 * Zufällige Kaskade vom Niveau `start` in den Grundzustand (bzw. bis kein
 * Übergang mehr möglich ist); die Übergänge werden nach Helligkeit gewichtet.
 */
export function cascade(el: ElementData, start: number, rand: () => number): TransitionDef[] {
  const out: TransitionDef[] = [];
  let at = start;
  for (let guard = 0; guard < 12; guard++) {
    const list = downFrom(el, at);
    if (!list.length) break;
    const sum = list.reduce((s, t) => s + t.w, 0);
    let r = rand() * sum;
    let pick = list[list.length - 1]!;
    for (const t of list) {
      r -= t.w;
      if (r <= 0) {
        pick = t;
        break;
      }
    }
    out.push(pick);
    at = pick.l;
  }
  return out;
}

/** Startniveau einer zufälligen Anregung: gewichtet nach der Helligkeit der Linien, die dort beginnen. */
export function randomUpper(el: ElementData, rand: () => number): number {
  const sums = new Map<number, number>();
  for (const t of el.transitions) sums.set(t.u, (sums.get(t.u) ?? 0) + t.w);
  const total = [...sums.values()].reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (const [u, s] of sums) {
    r -= s;
    if (r <= 0) return u;
  }
  return [...sums.keys()].pop()!;
}
