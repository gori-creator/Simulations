/**
 * Bilder für die Simulationsseiten (docs/BEREICHSBILDER.md):
 * - Bereichsbilder (src/assets/bereiche/<bereich>.webp) für den Kopfbereich,
 * - Abschnitts-Illustrationen (src/assets/abschnitte/<abschnitt>.webp) neben
 *   den Überschriften des Lernmaterials.
 * Beides ist optional; fehlt ein Bild, gibt es eine Ersatzdarstellung.
 */
type Loader = () => Promise<{ default: ImageMetadata }>;

const banners = import.meta.glob<{ default: ImageMetadata }>('../assets/bereiche/*.{webp,png,jpg}');
const sections = import.meta.glob<{ default: ImageMetadata }>('../assets/abschnitte/*.{webp,png}');

function find(files: Record<string, Loader>, dir: string, name: string): Loader | null {
  for (const ext of ['webp', 'png', 'jpg']) {
    const file = files[`../assets/${dir}/${name}.${ext}`];
    if (file) return file;
  }
  return null;
}

/** Bannerbild eines Bereichs oder `null`. */
export function bannerFile(area: string): Loader | null {
  return find(banners, 'bereiche', area);
}

/** Abschnitte des Lernmaterials in ihrer festen Reihenfolge (alle Texte haben diese vier Überschriften). */
export const SECTION_KEYS = ['worum-geht-es', 'ausprobieren', 'aufgaben', 'unterricht'] as const;
export type SectionKey = (typeof SECTION_KEYS)[number] | 'weiter-lernen';

/** Illustration eines Abschnitts oder `null`. */
export function sectionFile(key: SectionKey): Loader | null {
  return find(sections, 'abschnitte', key);
}
