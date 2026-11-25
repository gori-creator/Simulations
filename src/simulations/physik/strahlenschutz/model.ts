/**
 * Ionisierende Strahlung und Strahlenschutz: Reichweite von Alpha-, Beta-
 * und Gammastrahlung in Materialien, Abstandsgesetz und Dosis.
 */

export type Ray = 'alpha' | 'beta' | 'gamma';
export type Absorber = 'none' | 'paper' | 'skin' | 'aluminium' | 'lead' | 'concrete';

/**
 * Durchgelassener Anteil (vereinfachte Lehrbuchwerte, Dicke in mm):
 * Alpha wird schon von Papier fast vollständig gestoppt, Beta von wenigen
 * Millimetern Aluminium, Gamma wird exponentiell geschwächt (Halbwertsdicke).
 */
export function transmission(ray: Ray, absorber: Absorber, d: number): number {
  if (absorber === 'none' || d <= 0) return 1;
  if (ray === 'alpha') {
    // Reichweite: Papier ~0,05 mm, Haut ~0,05 mm, alles andere stoppt sofort
    const range = absorber === 'paper' || absorber === 'skin' ? 0.04 : 0.02;
    return d >= range ? 0 : 1 - d / range;
  }
  if (ray === 'beta') {
    const range: Record<Absorber, number> = { none: Infinity, paper: 3, skin: 4, aluminium: 3, lead: 1, concrete: 2 };
    const r = range[absorber];
    return d >= r ? 0.002 : Math.exp(-4 * (d / r));
  }
  // Gamma (Cs-137, 662 keV): Halbwertsdicken in mm
  const hvl: Record<Absorber, number> = { none: Infinity, paper: 90, skin: 90, aluminium: 33, lead: 6.5, concrete: 48 };
  return 0.5 ** (d / hvl[absorber]);
}

/** Abstandsgesetz für eine punktförmige Quelle: Zählrate ∝ 1/r². */
export function distanceFactor(r: number, r0 = 0.1): number {
  return (r0 / r) ** 2;
}

/** Äquivalentdosis H = D · w_R mit Strahlungs-Wichtungsfaktor (Alpha 20, Beta und Gamma 1). */
export function weighting(ray: Ray): number {
  return ray === 'alpha' ? 20 : 1;
}

/** Halbwertsdicke aus zwei Zählraten (gleiche Geometrie): d½ = d · ln 2 / ln(N₀/N). */
export function halfValueThickness(d: number, N0: number, N: number): number {
  return (d * Math.LN2) / Math.log(N0 / N);
}
