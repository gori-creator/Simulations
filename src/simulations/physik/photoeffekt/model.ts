/**
 * Rechenlogik „Photoeffekt“ (ohne Zeichnen).
 *
 * Licht der Frequenz f besteht aus Photonen mit der Energie E_Ph = h · f.
 * Trifft ein Photon auf die Kathode einer Fotozelle, kann es ein Elektron
 * auslösen, wenn E_Ph größer als die Austrittsarbeit W_A des Metalls ist.
 * Das Elektron hat dann höchstens die Bewegungsenergie (Einstein)
 *
 *   E_kin,max = h · f − W_A.
 *
 * Gegenfeldmethode: Zwischen Anode und Kathode liegt eine Gegenspannung U.
 * Ein Elektron erreicht die Anode nur, wenn E_kin > e · U. Der Fotostrom
 * verschwindet bei U_G mit e · U_G = E_kin,max. Die Grenzfrequenz ist
 * f_G = W_A / h. Die Intensität ändert nur die Zahl der Elektronen, nicht
 * ihre Energie.
 *
 * Modell für den Fotostrom: Die Bewegungsenergien der Elektronen sind
 * gleichmäßig zwischen 0 und E_kin,max verteilt, also erreicht der Anteil
 * 1 − e · U / E_kin,max die Anode. Der Sättigungsstrom ist proportional zur
 * Intensität.
 *
 * Einheiten: Energien in eV, Wellenlängen in nm, Frequenzen in Hz, Strom in nA.
 */

export const PLANCK = 6.62607015e-34;
export const ELEMENTARY_CHARGE = 1.602176634e-19;
export const LIGHT_SPEED = 299792458;
/** h · c in eV · nm. */
export const HC_EV_NM = ((PLANCK * LIGHT_SPEED) / ELEMENTARY_CHARGE) * 1e9;
/** h in eV · s. */
export const PLANCK_EV = PLANCK / ELEMENTARY_CHARGE;
/** Sättigungsstrom bei voller Intensität in nA (Modell). */
export const I_SAT_MAX = 2;

export type MetalId = 'Cs' | 'K' | 'Na' | 'Li' | 'Zn' | 'Cu';

export interface Metal {
  id: MetalId;
  /** Austrittsarbeit in eV (Tabellenwerte der Schulbücher, gerundet). */
  W: number;
  /** Farbe der Metalloberfläche im Bild (hell, dunkel). */
  color: [string, string];
}

/** Austrittsarbeiten nach üblichen Schulbuchtabellen (z. B. Dorn-Bader, Kuchling). */
export const METALS: Record<MetalId, Metal> = {
  Cs: { id: 'Cs', W: 1.94, color: ['#e8d49a', '#a88a3a'] },
  K: { id: 'K', W: 2.25, color: ['#dfe3e8', '#8e98a5'] },
  Na: { id: 'Na', W: 2.28, color: ['#e4e6ea', '#949ca8'] },
  Li: { id: 'Li', W: 2.46, color: ['#d9dde3', '#848e9b'] },
  Zn: { id: 'Zn', W: 4.34, color: ['#c9d3dc', '#71808f'] },
  Cu: { id: 'Cu', W: 4.48, color: ['#f0b48a', '#a5562c'] },
};
export const METAL_IDS: readonly MetalId[] = ['Cs', 'K', 'Na', 'Li', 'Zn', 'Cu'];

export function metalOf(id: string): Metal {
  return (METALS as Record<string, Metal | undefined>)[id] ?? METALS.Cs;
}

/** Frequenz in Hz zur Wellenlänge in nm. */
export function frequencyOf(lambdaNm: number): number {
  return LIGHT_SPEED / (lambdaNm * 1e-9);
}

/** Photonenenergie in eV: E = h · f = h · c / λ. */
export function photonEnergy(lambdaNm: number): number {
  return HC_EV_NM / lambdaNm;
}

/** Grenzfrequenz f_G = W_A / h in Hz. */
export function thresholdFrequency(W: number): number {
  return W / PLANCK_EV;
}

/** Grenzwellenlänge λ_G = h · c / W_A in nm. */
export function thresholdWavelength(W: number): number {
  return HC_EV_NM / W;
}

/** Größte Bewegungsenergie in eV (0, wenn keine Elektronen ausgelöst werden). */
export function maxKineticEnergy(lambdaNm: number, W: number): number {
  return Math.max(0, photonEnergy(lambdaNm) - W);
}

/** Werden Elektronen ausgelöst? */
export function emits(lambdaNm: number, W: number): boolean {
  return photonEnergy(lambdaNm) > W;
}

/** Gegenspannung, bei der der Strom verschwindet: U_G = E_kin,max / e (in V). */
export function stoppingVoltage(lambdaNm: number, W: number): number {
  return maxKineticEnergy(lambdaNm, W);
}

/**
 * Kleinste Gegenspannung auf dem Reglerraster (Schritt 0,01 V, höchstens 4 V),
 * bei der kein Strom mehr fließt: U_G aufgerundet. Abrunden ließe einen kleinen
 * Reststrom übrig.
 */
export function zeroVoltage(lambdaNm: number, W: number, step = 0.01, max = 4): number {
  const k = Math.ceil(stoppingVoltage(lambdaNm, W) / step - 1e-9);
  // Math.max(0, …) vermeidet −0 (würde als „−0,00 V“ erscheinen)
  return Math.max(0, Math.min(max, Math.round(k * step * 1e6) / 1e6));
}

/** Sättigungsstrom in nA bei der Intensität P (0 … 100 %). */
export function saturationCurrent(P: number): number {
  return (I_SAT_MAX * Math.max(0, Math.min(100, P))) / 100;
}

/** Fotostrom in nA bei Gegenspannung U (V), Wellenlänge λ, Austrittsarbeit W und Intensität P (%). */
export function photoCurrent(U: number, lambdaNm: number, W: number, P: number): number {
  const ek = maxKineticEnergy(lambdaNm, W);
  if (ek <= 0) return 0;
  const share = U <= 0 ? 1 : Math.max(0, 1 - U / ek);
  return saturationCurrent(P) * share;
}

/** Ausgleichsgerade y = m · x + b (kleinste Quadrate); null bei weniger als zwei verschiedenen x. */
export function fitLine(points: readonly (readonly [number, number])[]): { m: number; b: number } | null {
  const k = points.length;
  if (k < 2) return null;
  const mx = points.reduce((s, q) => s + q[0], 0) / k;
  const my = points.reduce((s, q) => s + q[1], 0) / k;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
  }
  if (sxx < 1e-30) return null;
  const m = sxy / sxx;
  return { m, b: my - m * mx };
}

/** Sichtbarer Bereich in nm. */
export const VISIBLE_MIN = 380;
export const VISIBLE_MAX = 780;

/** Bildschirmfarbe zur Wellenlänge (Näherung nach Bruton); außerhalb des Sichtbaren null. */
export function wavelengthToRgb(l: number): [number, number, number] | null {
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
  let k = 1;
  if (l < 420) k = 0.3 + (0.7 * (l - VISIBLE_MIN)) / 40;
  else if (l > 700) k = 0.3 + (0.7 * (VISIBLE_MAX - l)) / 80;
  const c = (v: number) => Math.round(255 * Math.pow(Math.max(0, v * k), 0.8));
  return [c(r), c(g), c(b)];
}

/**
 * Bewegung eines Elektrons im Gegenfeld (Ort x von 0 = Kathode bis 1 = Anode):
 * Energie E(x) = E₀ − U · x. Umkehrpunkt bei x = E₀ / U (falls < 1).
 */
export function turningPoint(E0: number, U: number): number {
  if (U <= 0) return Infinity;
  return E0 / U;
}
