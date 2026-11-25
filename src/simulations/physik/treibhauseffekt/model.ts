/**
 * Strahlungshaushalt der Erde im Ein-Schicht-Modell: Sonnenstrahlung,
 * Albedo, Abstrahlung nach Stefan-Boltzmann und eine Atmosphäre, die einen
 * Teil ε der Wärmestrahlung des Bodens aufnimmt und je zur Hälfte nach oben
 * und unten wieder abgibt.
 */

export const SIGMA = 5.670_374e-8;
/** Solarkonstante in W/m² */
export const SOLAR = 1361;

export interface Budget {
  /** Einstrahlung im Mittel über die Erdoberfläche S/4 */
  incoming: number;
  reflected: number;
  absorbed: number;
  /** Bodentemperatur in K */
  surfaceK: number;
  /** Abstrahlung des Bodens σT⁴ */
  surfaceEmission: number;
  /** Teil der Bodenstrahlung, der ungehindert ins All geht */
  window: number;
  /** Abstrahlung der Atmosphäre nach oben bzw. unten (je gleich) */
  atmosphereEach: number;
  /** Temperatur der Atmosphärenschicht in K (0 ohne Atmosphäre) */
  atmosphereK: number;
}

/** Strahlungsgleichgewicht für Albedo a (0…1) und Absorptionsgrad ε (0…1) der Atmosphäre. */
export function budget(albedo: number, eps: number, solar = SOLAR): Budget {
  const incoming = solar / 4;
  const absorbed = (1 - albedo) * incoming;
  const surfaceEmission = (absorbed * 2) / (2 - eps);
  const surfaceK = (surfaceEmission / SIGMA) ** 0.25;
  const atmosphereEach = (eps * surfaceEmission) / 2;
  const atmosphereK = eps > 0 ? (atmosphereEach / (eps * SIGMA)) ** 0.25 : 0;
  return {
    incoming,
    reflected: albedo * incoming,
    absorbed,
    surfaceK,
    surfaceEmission,
    window: (1 - eps) * surfaceEmission,
    atmosphereEach,
    atmosphereK,
  };
}

/** Absorptionsgrad ε, bei dem sich die Bodentemperatur T (K) einstellt. */
export function epsForTemperature(albedo: number, surfaceK: number, solar = SOLAR): number {
  const absorbed = ((1 - albedo) * solar) / 4;
  return 2 - (2 * absorbed) / (SIGMA * surfaceK ** 4);
}
