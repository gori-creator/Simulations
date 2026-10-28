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
