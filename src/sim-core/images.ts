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

/**
 * Lädt die Bilder einer Simulation.
 *
 * Ladezeit: Ein Bild wird erst angefordert, wenn die Simulation es zum ersten
 * Mal mit `get()` abfragt – die Startansicht lädt also nur ihre eigenen Bilder.
 * Die übrigen (z. B. für andere Beispiele) folgen erst, wenn die Seite fertig
 * geladen ist und der Browser Zeit hat. So wechseln Beispiele später ohne
 * Ersatzgrafik, und die Simulation funktioniert offline vollständig.
 */
export class ImageStore {
  private loaded = new Map<string, HTMLImageElement>();
  private requested = new Set<string>();

  constructor(
    private readonly simId: string,
    private readonly files: Record<string, string>,
    private readonly onLoad: () => void,
  ) {
    if (typeof Image === 'undefined' || typeof window === 'undefined' || Object.keys(files).length === 0) return;
    // Im Datensparmodus nur laden, was wirklich gezeichnet wird.
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    const rest = () => {
      for (const key of Object.keys(this.files)) this.request(key);
    };
    // Safari kennt requestIdleCallback erst ab Version 18 – dann kurz warten.
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(rest, { timeout: 4000 });
      else setTimeout(rest, 1500);
    };
    if (document.readyState === 'complete') whenIdle();
    else window.addEventListener('load', whenIdle, { once: true });
  }

  private request(key: string): void {
    if (this.requested.has(key)) return;
    this.requested.add(key);
    const file = this.files[key];
    const url = file ? simAssetUrl(this.simId, file) : undefined;
    if (!url) return;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      this.loaded.set(key, img);
      this.onLoad();
    };
    img.src = url;
  }

  /** Das geladene Bild oder `null` (noch nicht geladen bzw. nicht vorhanden); stößt das Laden an. */
  get(key: string): HTMLImageElement | null {
    const img = this.loaded.get(key);
    if (img) return img;
    if (typeof Image !== 'undefined') this.request(key);
    return null;
  }
}
