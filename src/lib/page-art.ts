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

/** Bannerbild eines Bereichs oder `null` (dunkel: `<bereich>-dunkel`, automatisch aus dem hellen erzeugt). */
export function bannerFile(area: string, scheme: 'hell' | 'dunkel' = 'hell'): Loader | null {
  return find(banners, 'bereiche', scheme === 'dunkel' ? `${area}-dunkel` : area);
}

/**
 * CSS-Variablen für den Kopfbereich mit Bereichsbild (`--hero-banner`, im
 * Dunkelmodus `--hero-banner-dark`), oder `null`, wenn es für den Bereich kein
 * Bild gibt. Nur beim Bauen (astro:assets).
 */
export async function bannerStyle(area: string): Promise<string | null> {
  const light = bannerFile(area);
  if (!light) return null;
  const { getImage } = await import('astro:assets');
  const load = async (file: Loader) => (await getImage({ src: (await file()).default, width: 1800, format: 'webp', quality: 82 })).src;
  const dark = bannerFile(area, 'dunkel');
  const lightUrl = await load(light);
  return `--hero-banner:url(${lightUrl});--hero-banner-dark:url(${dark ? await load(dark) : lightUrl})`;
}

/** Abschnitte des Lernmaterials in ihrer festen Reihenfolge (alle Texte haben diese vier Überschriften). */
export const SECTION_KEYS = ['worum-geht-es', 'ausprobieren', 'aufgaben', 'unterricht'] as const;
export type SectionKey = (typeof SECTION_KEYS)[number] | 'weiter-lernen';

/** Illustration eines Abschnitts oder `null`. */
export function sectionFile(key: SectionKey): Loader | null {
  return find(sections, 'abschnitte', key);
}
