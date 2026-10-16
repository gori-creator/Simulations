/**
 * Vorab skalierte Bilder für flüssige Animationen.
 *
 * Fotos werden einmal in der benötigten Größe (mal Pixeldichte) auf eine
 * eigene Zeichenfläche gerendert und danach nur noch kopiert. Das sieht beim
 * starken Verkleinern besser aus (hohe Glättungsqualität) und spart Rechenzeit
 * auf schwachen Geräten.
 */
import type { Rect } from './surface';

type Source = CanvasImageSource & { width: number; height: number };

export interface SpriteOptions {
  /** Waagerecht spiegeln. */
  flipX?: boolean;
  /** Nur diesen Ausschnitt des Bildes verwenden (Bildpixel). */
  crop?: Rect;
}

const caches = new WeakMap<object, Map<string, HTMLCanvasElement>>();

/** Leere Zeichenfläche in Gerätepixeln (für eigene vorgerenderte Grafiken). */
export function offscreenCanvas(w: number, h: number, dpr: number): { canvas: HTMLCanvasElement; g: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(w * dpr));
  canvas.height = Math.max(1, Math.ceil(h * dpr));
  const g = canvas.getContext('2d')!;
  g.scale(dpr, dpr);
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  return { canvas, g };
}

/**
 * Bild (oder Ausschnitt) in der Größe w × h CSS-Pixel. Das Ergebnis wird je
 * Bild und Größe zwischengespeichert; zeichnen mit
 * `g.drawImage(sprite, x, y, w, h)`.
 */
export function scaledSprite(img: Source, w: number, h: number, dpr: number, opts: SpriteOptions = {}): HTMLCanvasElement {
  const c = opts.crop;
  const key = `${Math.round(w * 2)}|${Math.round(h * 2)}|${dpr}|${opts.flipX ? 1 : 0}|${c ? `${c.x},${c.y},${c.w},${c.h}` : ''}`;
  let cache = caches.get(img);
  if (!cache) {
    cache = new Map();
    caches.set(img, cache);
  }
  const hit = cache.get(key);
  if (hit) return hit;
  if (cache.size > 24) cache.clear();
  const { canvas, g } = offscreenCanvas(w, h, dpr);
  if (opts.flipX) {
    g.translate(w, 0);
    g.scale(-1, 1);
  }
  if (c) g.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, w, h);
  else g.drawImage(img, 0, 0, w, h);
  cache.set(key, canvas);
  return canvas;
}
