/**
 * Optionale Bilder der KI-Kurse (Prompts und Abgabe: docs/KI-KURS-BILDER.md).
 *
 * - Titelbild je Kurs: `src/assets/kurse/<kurs>/titel.webp` (16 : 9)
 * - Bild je Welt: `src/assets/kurse/<kurs>/welten/<welt-id>.webp` (3 : 1, Motiv rechts)
 * - Bild je Wissenskarte: `src/assets/kurse/<kurs>/karten/<lektions-id>.webp` (1 : 1)
 *
 * Zu jedem Bild kann es eine dunkle Fassung `<name>-dunkel.webp` geben
 * (`npm run kurs:bilder` erzeugt sie). Fehlt ein Bild, bleibt die gezeichnete
 * Darstellung mit Symbolen und Farben. Nur beim Bauen (astro:assets).
 */
type Loader = () => Promise<{ default: ImageMetadata }>;

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/kurse/**/*.{webp,png,jpg}');

function find(path: string): Loader | null {
  for (const ext of ['webp', 'png', 'jpg']) {
    const file = files[`../assets/kurse/${path}.${ext}`];
    if (file) return file;
  }
  return null;
}

export interface Art {
  light: string;
  dark: string;
  width: number;
  height: number;
}

async function load(path: string, width: number): Promise<Art | null> {
  const light = find(path);
  if (!light) return null;
  const dark = find(`${path}-dunkel`);
  const { getImage } = await import('astro:assets');
  const render = async (file: Loader) => {
    const source = (await file()).default;
    const image = await getImage({ src: source, width: Math.min(width, source.width), format: 'webp', quality: 80 });
    return { src: image.src, width: Number(image.attributes.width ?? width), height: Number(image.attributes.height ?? Math.round((width * source.height) / source.width)) };
  };
  const l = await render(light);
  const d = dark ? await render(dark) : l;
  return { light: l.src, dark: d.src, width: l.width, height: l.height };
}

/** Pfade relativ zu `src/assets/kurse/` (für Doku, Tests und das Umwandlungsskript). */
export const artPath = {
  cover: (courseId: string) => `${courseId}/titel`,
  world: (courseId: string, chapterId: string) => `${courseId}/welten/${chapterId}`,
  card: (courseId: string, lessonId: string) => `${courseId}/karten/${lessonId}`,
};

export const coverArt = (courseId: string) => load(artPath.cover(courseId), 960);
export const worldArt = (courseId: string, chapterId: string) => load(artPath.world(courseId, chapterId), 1500);
export const cardArt = (courseId: string, lessonId: string) => load(artPath.card(courseId, lessonId), 480);
