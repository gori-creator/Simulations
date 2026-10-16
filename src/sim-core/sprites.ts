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

export interface TintOptions extends SpriteOptions {
  /** Vorher aufhellen (0 … 1, „Screen“ mit Weiß), damit dunkle Fotos hellere Farben tragen können. */
  lift?: number;
  /** Deckkraft der Einfärbung (Standard 1 = Farbton und Sättigung ganz aus `color`). */
  amount?: number;
  /** Nur diesen Teil einfärben (CSS-Pixel im Ergebnis, vor dem Spiegeln). */
  region?: Rect;
}

/**
 * Wie `scaledSprite`, aber eingefärbt: Helligkeit und Glanzlichter bleiben
 * aus dem Foto, Farbton und Sättigung kommen aus `color` (Mischmodus „color“,
 * funktioniert in allen Browsern ohne `filter`). Ergebnis wird zwischengespeichert.
 */
export function tintedSprite(img: Source, w: number, h: number, dpr: number, color: string, opts: TintOptions = {}): HTMLCanvasElement {
  const c = opts.crop;
  const rg = opts.region;
  const key = `t|${color}|${opts.lift ?? 0}|${opts.amount ?? 1}|${rg ? `${rg.x},${rg.y},${rg.w},${rg.h}` : ''}|${Math.round(w * 2)}|${Math.round(h * 2)}|${dpr}|${opts.flipX ? 1 : 0}|${c ? `${c.x},${c.y},${c.w},${c.h}` : ''}`;
  let cache = caches.get(img);
  if (!cache) {
    cache = new Map();
    caches.set(img, cache);
  }
  const hit = cache.get(key);
  if (hit) return hit;
  if (cache.size > 24) cache.clear();
  const base = scaledSprite(img, w, h, dpr, { crop: c });
  const { canvas, g } = offscreenCanvas(w, h, dpr);
  g.drawImage(base, 0, 0, w, h);
  g.save();
  if (rg) {
    g.beginPath();
    g.rect(rg.x, rg.y, rg.w, rg.h);
    g.clip();
  }
  if (opts.lift) {
    g.globalCompositeOperation = 'screen';
    g.fillStyle = `rgba(255,255,255,${opts.lift})`;
    g.fillRect(0, 0, w, h);
  }
  g.globalCompositeOperation = 'color';
  g.globalAlpha = opts.amount ?? 1;
  g.fillStyle = color;
  g.fillRect(0, 0, w, h);
  g.restore();
  // Durchsichtige Stellen des Fotos wiederherstellen
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(base, 0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  if (!opts.flipX) {
    cache.set(key, canvas);
    return canvas;
  }
  const flipped = offscreenCanvas(w, h, dpr);
  flipped.g.translate(w, 0);
  flipped.g.scale(-1, 1);
  flipped.g.drawImage(canvas, 0, 0, w, h);
  cache.set(key, flipped.canvas);
  return flipped.canvas;
}
