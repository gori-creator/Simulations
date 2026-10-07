/**
 * Optionale Bilder für Simulationen.
 *
 * Bilder liegen unter src/assets/sims/<simulations-id>/<datei>. Vite findet
 * beim Build nur die tatsächlich vorhandenen Dateien – fehlende Bilder führen
 * also nicht zu Fehlern; die Simulation zeichnet dann ihre Ersatzgrafik.
 */
const FILES = import.meta.glob('../assets/sims/**/*.{png,webp,jpg,jpeg,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Adresse eines Simulationsbildes oder `undefined`, wenn es (noch) fehlt. */
export function simAssetUrl(simId: string, file: string): string | undefined {
  return FILES[`../assets/sims/${simId}/${file}`];
}

/** Lädt die Bilder einer Simulation im Hintergrund. */
export class ImageStore {
  private loaded = new Map<string, HTMLImageElement>();

  constructor(simId: string, files: Record<string, string>, onLoad: () => void) {
    if (typeof Image === 'undefined') return;
    for (const [key, file] of Object.entries(files)) {
      const url = simAssetUrl(simId, file);
      if (!url) continue;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.loaded.set(key, img);
        onLoad();
      };
      img.src = url;
    }
  }

  /** Das geladene Bild oder `null` (noch nicht geladen bzw. nicht vorhanden). */
  get(key: string): HTMLImageElement | null {
    return this.loaded.get(key) ?? null;
  }
}
