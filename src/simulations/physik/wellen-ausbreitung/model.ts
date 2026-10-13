/**
 * Rechenlogik „Transversal- und Longitudinalwellen“.
 *
 * Eine Kette aus gekoppelten Teilchen (Ruhelagen x = 0; 0,1 m; …; 4 m) wird
 * am linken Ende (x = 0) vom Erreger harmonisch angeregt:
 *
 *   y_E(τ) = ŷ · sin(ω · τ)   für τ ≥ 0 (vorher Ruhe), ω = 2π · f.
 *
 * Die Störung breitet sich mit der Geschwindigkeit c aus und kommt bei der
 * Stelle x nach der Laufzeit x / c an. Jedes Teilchen wiederholt also die
 * Bewegung des Erregers, nur verspätet (ideale, verlustfreie Kette ohne
 * Reflexion am Ende):
 *
 *   y(x, t) = y_E(t − x/c) = ŷ · sin(ω · (t − x/c)) = ŷ · sin(2π · (t/T − x/λ))
 *
 * für t ≥ x/c, sonst y = 0. Mit λ = c / f bzw. c = λ · f.
 *
 * Transversal: y ist die Auslenkung senkrecht zur Ausbreitungsrichtung.
 * Longitudinal: dieselbe Funktion beschreibt die Auslenkung in
 * Ausbreitungsrichtung; ein Teilchen mit Ruhelage x ist dann bei x + y(x, t).
 *
 * Einheiten: x, y, ŷ in m, t in s, f in Hz, c in m/s.
 */

/** Art der Anregung: Dauererregung, Einzelpuls (halbe Schwingung: Wellenberg), eine volle Schwingung. */
export type Excitation = 'cont' | 'pulse' | 'one';

export interface Wave {
  /** Frequenz des Erregers in Hz. */
  f: number;
  /** Ausbreitungsgeschwindigkeit in m/s. */
  c: number;
  /** Amplitude ŷ in m. */
  amp: number;
  /** Art der Anregung. */
  exc: Excitation;
}

/** Länge der Kette in m. */
export const CHAIN_LENGTH = 4;
/** Abstand benachbarter Teilchen (Ruhelagen) in m. */
export const SPACING = 0.1;
/** Anzahl der Teilchen (Nr. 0 … 40). */
export const PARTICLES = Math.round(CHAIN_LENGTH / SPACING) + 1;

const TAU = 2 * Math.PI;

/** Ruhelage des Teilchens Nr. i in m. */
export function restPosition(i: number): number {
  return i * SPACING;
}

/** Wellenlänge λ = c / f. */
export function wavelength(w: Pick<Wave, 'c' | 'f'>): number {
  return w.c / w.f;
}

/** Periodendauer T = 1 / f. */
export function period(w: Pick<Wave, 'f'>): number {
  return 1 / w.f;
}

/** Kreisfrequenz ω = 2π · f. */
export function omega(w: Pick<Wave, 'f'>): number {
  return TAU * w.f;
}

/** Wellenzahl k = 2π / λ. */
export function waveNumber(w: Pick<Wave, 'c' | 'f'>): number {
  return TAU / wavelength(w);
}

/** Dauer der Anregung (Phasenwinkel am Ende): Dauererregung ∞, Puls π, eine Schwingung 2π. */
export function excitationPhaseEnd(exc: Excitation): number {
  return exc === 'pulse' ? Math.PI : exc === 'one' ? TAU : Infinity;
}

/** Auslenkung des Erregers τ Sekunden nach dem Einschalten. */
export function sourceDisplacement(w: Wave, tau: number): number {
  if (tau <= 0) return 0;
  const ph = omega(w) * tau;
  if (ph >= excitationPhaseEnd(w.exc)) return 0;
  return w.amp * Math.sin(ph);
}

/** Geschwindigkeit des Erregers τ Sekunden nach dem Einschalten (vor dem Start und nach dem Puls 0). */
export function sourceVelocity(w: Wave, tau: number): number {
  if (tau < 0) return 0;
  const ph = omega(w) * tau;
  if (ph > excitationPhaseEnd(w.exc)) return 0;
  return w.amp * omega(w) * Math.cos(ph);
}

/** Laufzeit der Welle vom Erreger bis zur Stelle x: x / c. */
export function arrivalTime(w: Pick<Wave, 'c'>, x: number): number {
  return x / w.c;
}

/** Auslenkung y(x, t) des Teilchens mit der Ruhelage x zur Zeit t. */
export function displacement(w: Wave, x: number, t: number): number {
  return sourceDisplacement(w, t - x / w.c);
}

/** Schnelle (Teilchengeschwindigkeit) v(x, t) = ∂y/∂t. */
export function particleVelocity(w: Wave, x: number, t: number): number {
  return sourceVelocity(w, t - x / w.c);
}

/**
 * Phasenwinkel φ(x, t) = ω · (t − x/c) des Teilchens an der Stelle x;
 * `null`, solange die Welle die Stelle noch nicht erreicht hat.
 */
export function phaseAt(w: Wave, x: number, t: number): number | null {
  const tau = t - x / w.c;
  if (tau < 0) return null;
  return omega(w) * tau;
}

/** Phasenunterschied Δφ = 2π · Δx / λ zwischen den Stellen x1 und x2 > x1 (im Bogenmaß). */
export function phaseDifference(w: Pick<Wave, 'c' | 'f'>, x1: number, x2: number): number {
  return (TAU * (x2 - x1)) / wavelength(w);
}

/** Lage der Wellenfront zur Zeit t: x = c · t (höchstens bis zum Ende der Kette). */
export function frontPosition(w: Pick<Wave, 'c'>, t: number, length = CHAIN_LENGTH): number {
  return Math.min(length, Math.max(0, w.c * t));
}

/**
 * Dehnung ∂y/∂x der Kette bei einer Longitudinalwelle (= −v / c).
 * Negativ: Verdichtung, positiv: Verdünnung. Die Teilchendichte ist
 * proportional zu 1 / (1 + ∂y/∂x).
 */
export function strain(w: Wave, x: number, t: number): number {
  return -particleVelocity(w, x, t) / w.c;
}

/** Relative Teilchendichte n / n₀ = 1 / (1 + ∂y/∂x) (bei Überholen: Infinity). */
export function relativeDensity(w: Wave, x: number, t: number): number {
  const s = 1 + strain(w, x, t);
  return s > 0 ? 1 / s : Infinity;
}

/**
 * Größte Dehnung ŷ · ω / c = 2π · ŷ / λ. Ab 1 würden sich benachbarte Teilchen
 * einer Longitudinalwelle überholen – dann ist die Amplitude für diese
 * Wellenlänge zu groß.
 */
export function maxStrain(w: Wave): number {
  return (w.amp * omega(w)) / w.c;
}

/** Stellen (in [0; length]) zur Zeit t, an denen der Erreger den Phasenwinkel `phase0 + 2π·n` hatte (n ≥ 0, innerhalb der Anregung). */
export function positionsOfPhase(w: Wave, t: number, phase0: number, length = CHAIN_LENGTH): number[] {
  const out: number[] = [];
  const end = excitationPhaseEnd(w.exc);
  const wv = omega(w);
  for (let n = 0; ; n++) {
    const ph = phase0 + TAU * n;
    if (ph > end + 1e-12) break;
    const x = w.c * (t - ph / wv);
    if (x < -1e-12) break;
    if (x <= length + 1e-12) out.push(x);
  }
  return out;
}

/** Wellenberge (Phasenwinkel π/2 + 2πn) zur Zeit t. */
export function crestPositions(w: Wave, t: number, length = CHAIN_LENGTH): number[] {
  return positionsOfPhase(w, t, Math.PI / 2, length);
}

/** Wellentäler (Phasenwinkel 3π/2 + 2πn) zur Zeit t. */
export function troughPositions(w: Wave, t: number, length = CHAIN_LENGTH): number[] {
  return positionsOfPhase(w, t, (3 * Math.PI) / 2, length);
}

/**
 * Verdichtungen einer Longitudinalwelle (größte Teilchendichte: Phasenwinkel 2πn,
 * dort bewegen sich die Teilchen am schnellsten in Ausbreitungsrichtung).
 */
export function compressionPositions(w: Wave, t: number, length = CHAIN_LENGTH): number[] {
  return positionsOfPhase(w, t, 0, length);
}

/** Verdünnungen (kleinste Dichte: Phasenwinkel π + 2πn). */
export function rarefactionPositions(w: Wave, t: number, length = CHAIN_LENGTH): number[] {
  return positionsOfPhase(w, t, Math.PI, length);
}

/**
 * Der am weitesten gelaufene Wellenberg, der noch auf der Kette ist
 * (zum Verfolgen; `null`, wenn keiner da ist).
 */
export function leadingCrest(w: Wave, t: number, length = CHAIN_LENGTH): number | null {
  const list = crestPositions(w, t, length);
  return list.length ? list[0]! : null;
}

/** Nächste Zahl eines Teilchens zur Stelle x (0 … PARTICLES − 1). */
export function nearestParticle(x: number): number {
  return Math.min(PARTICLES - 1, Math.max(0, Math.round(x / SPACING)));
}

/**
 * Gleichphasige Stelle zum Teilchen an der Stelle x: um eine Wellenlänge weiter
 * (rechts), sonst eine Wellenlänge zurück (links); `null`, wenn beides außerhalb liegt.
 */
export function inPhasePartner(w: Pick<Wave, 'c' | 'f'>, x: number, length = CHAIN_LENGTH): number | null {
  const lam = wavelength(w);
  if (x + lam <= length + 1e-9) return x + lam;
  if (x - lam >= -1e-9) return x - lam;
  return null;
}

/** Teilchennummer an der Stelle x, falls dort genau ein Teilchen sitzt (sonst null). */
export function particleAt(x: number): number | null {
  const i = Math.round(x / SPACING);
  if (i < 0 || i >= PARTICLES) return null;
  return Math.abs(i * SPACING - x) < 1e-6 ? i : null;
}
