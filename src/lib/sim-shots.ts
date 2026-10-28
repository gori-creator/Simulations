/**
 * Fotos der Simulationsbühnen aus den Bildtests (tests/bildtests/referenz/,
 * hell und dunkel, erzeugt in GitHub Actions – docs/BILDTESTS.md). Sie dienen
 * als Vorschaubilder der Karten (SimShot.astro).
 */
const shots = import.meta.glob<{ default: ImageMetadata }>('../../tests/bildtests/referenz/*.png');

export type ShotScheme = 'hell' | 'dunkel';

/** Lädt das Foto einer Simulation (oder `null`, wenn es noch keins gibt). */
export function shotFile(id: string, scheme: ShotScheme): (() => Promise<{ default: ImageMetadata }>) | null {
  return shots[`../../tests/bildtests/referenz/${id}-${scheme}.png`] ?? null;
}

/** Gibt es für diese Simulation ein Foto? */
export function hasShot(id: string): boolean {
  return shotFile(id, 'hell') !== null;
}

/**
 * Ausschnitt des Vorschaubilds: Gezeigt wird nicht die ganze Bühne (rechts
 * stehen oft Infokästen mit kleiner Schrift), sondern ein vergrößerter Teil.
 * `x`/`y` in Prozent (Bezugspunkt der Vergrößerung), `zoom` als Faktor.
 * Standard: links, etwas über der Mitte, 1,5-fach. Abweichungen je Simulation.
 */
export interface ShotFocus {
  x: number;
  y: number;
  zoom: number;
}

export const DEFAULT_FOCUS: ShotFocus = { x: 0, y: 40, zoom: 1.5 };

const FOCUS: Record<string, Partial<ShotFocus>> = {};

export function shotFocus(id: string): ShotFocus {
  return { ...DEFAULT_FOCUS, ...FOCUS[id] };
}
