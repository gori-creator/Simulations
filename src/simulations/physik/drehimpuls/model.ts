/**
 * Drehbewegungen: Trägheitsmoment, Drehimpuls L = J · ω und seine Erhaltung
 * (Pirouette), Rotationsenergie und das Wettrollen auf der schiefen Ebene.
 */

export const G = 9.81;

/**
 * Trägheitsmoment einer vereinfachten Eiskunstläuferin: Rumpf als Zylinder
 * (Masse mb, Radius rb) und zwei Arme als Punktmassen ma im Abstand r.
 */
export function skaterInertia(mb: number, rb: number, ma: number, r: number): number {
  return 0.5 * mb * rb * rb + 2 * ma * r * r;
}

/** Bei erhaltenem Drehimpuls: ω₂ = ω₁ · J₁ / J₂. */
export function omegaAfter(J1: number, w1: number, J2: number): number {
  return (J1 * w1) / J2;
}

/** Rotationsenergie E = ½ J ω². */
export function rotEnergy(J: number, w: number): number {
  return 0.5 * J * w * w;
}

export type BodyId = 'ring' | 'disk' | 'ball' | 'box';

/** Formfaktor k = J / (m r²): Ring 1, Scheibe/Vollzylinder ½, Vollkugel 2/5; gleitende Kiste ohne Reibung 0. */
export const SHAPE: Record<BodyId, number> = { ring: 1, disk: 0.5, ball: 0.4, box: 0 };

/** Beschleunigung beim Rollen ohne Gleiten auf der schiefen Ebene: a = g sin α / (1 + k). */
export function rollAcceleration(k: number, alpha: number, g = G): number {
  return (g * Math.sin(alpha)) / (1 + k);
}
