/**
 * Fotos für Stromkreis-Simulationen (Einfacher Stromkreis, Reihen- und
 * Parallelschaltung verwenden dieselben Dateien).
 *
 * - `gluehlampe.webp` (250 × 445): klare Glühlampe, **leuchtend** fotografiert.
 *   Eine ausgeschaltete Lampe gibt es nicht als Foto; sie wird hier einmal aus
 *   dem Foto abgeleitet (`unlitBulbPixels`): Das warme Licht im Glas wird
 *   entfernt, helle Linien (glühender Draht) werden zu dunklem kaltem Draht,
 *   das Glas wird leicht durchsichtig. Beim Einschalten wird stufenlos
 *   zwischen beiden vorab gerenderten Bildern überblendet.
 * - `batterie.webp` (350 × 307): 4,5-V-Flachbatterie mit zwei Messingfahnen;
 *   die lange Fahne (links) ist der Minuspol, die kurze (rechts) der Pluspol.
 */
import { offscreenCanvas } from './sprites';

type Source = CanvasImageSource & { width: number; height: number };

/** Lage der Teile im Lampenfoto (Bildpixel). */
export const BULB_IMG = {
  w: 250,
  h: 445,
  /** Mitte des Glaskolbens und sein Radius (oberer, runder Teil) */
  glassX: 125,
  glassY: 118,
  glassR: 122,
  /** Unterkante des Glases = Beginn des Schraubsockels */
  neckY: 318,
  /** Breite des Sockels */
  baseL: 64,
  baseR: 186,
  /** Glühwendel (waagerecht) und Fuß der Haltedrähte */
  filY: 113,
  filL: 80,
  filR: 170,
  stemL: 107,
  stemR: 143,
  stemY: 222,
} as const;

/** Lage der Teile im Batteriefoto (Bildpixel). */
export const BATTERY_IMG = {
  w: 350,
  h: 307,
  /** Mitte und Oberkante der Fahnen: links lang (−), rechts kurz (+) */
  longX: 74.5,
  longTop: 2,
  shortX: 271.5,
  shortTop: 9,
  /** Vorderseite (für Aufdruck): links, rechts, oben, unten */
  frontL: 10,
  frontR: 238,
  frontTop: 78,
  frontBot: 288,
} as const;

/**
 * Leitet aus dem leuchtenden Lampenfoto eine ausgeschaltete Lampe ab
 * (RGBA-Pixel, wird verändert). `glassBottom`: Zeile, ab der der Sockel
 * beginnt (bleibt unverändert); `radius`: Glättung in Pixeln.
 */
export function unlitBulbPixels(data: Uint8ClampedArray, w: number, h: number, glassBottom: number, radius: number): void {
  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = (0.299 * data[i * 4]! + 0.587 * data[i * 4 + 1]! + 0.114 * data[i * 4 + 2]!) / 255;
  // Weichgezeichnete Helligkeit (dreifacher Kastenfilter ≈ Gauß): großflächiges Leuchten
  const blur = boxBlur(lum, w, h, Math.max(1, Math.round(radius / 1.7)), 3);
  const yb = Math.min(h, Math.max(0, Math.round(glassBottom)));
  for (let y = 0; y < yb; y++) {
    const fy = Math.min(1, Math.max(0, (y / h - 0.27) / 0.45));
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const fx = Math.min(1, Math.max(0, (x / w - 0.24) / 0.76));
      // ruhiger Grundton des Glases (Licht von links oben) …
      const base = 0.8 - 0.17 * fx - 0.08 * fy;
      // … plus feine Strukturen; Helles (Glühdraht) wird dunkel
      const d = lum[i]! - blur[i]!;
      const v = Math.min(1, Math.max(0, base + (d > 0 ? -1.05 * d : 1.25 * d)));
      data[i * 4] = Math.round(v * 236);
      data[i * 4 + 1] = Math.round(v * 242);
      data[i * 4 + 2] = Math.round(v * 252);
      data[i * 4 + 3] = Math.round(data[i * 4 + 3]! * 0.72);
    }
  }
}

function boxBlur(src: Float32Array, w: number, h: number, r: number, passes: number): Float32Array {
  let a = Float32Array.from(src);
  let b = new Float32Array(a.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += a[y * w + Math.min(w - 1, Math.max(0, x))]!;
      for (let x = 0; x < w; x++) {
        b[y * w + x] = acc / (2 * r + 1);
        acc += a[y * w + Math.min(w - 1, x + r + 1)]! - a[y * w + Math.max(0, x - r)]!;
      }
    }
    [a, b] = [b, a];
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += a[Math.min(h - 1, Math.max(0, y)) * w + x]!;
      for (let y = 0; y < h; y++) {
        b[y * w + x] = acc / (2 * r + 1);
        acc += a[Math.min(h - 1, y + r + 1) * w + x]! - a[Math.max(0, y - r) * w + x]!;
      }
    }
    [a, b] = [b, a];
  }
  return a;
}

const bulbCache = new WeakMap<object, Map<string, { on: HTMLCanvasElement; off: HTMLCanvasElement }>>();

/**
 * Lampe an und aus, vorab in der Größe w × h CSS-Pixel gerendert
 * (je Bild und Größe zwischengespeichert).
 */
export function bulbSprites(img: Source, w: number, h: number, dpr: number): { on: HTMLCanvasElement; off: HTMLCanvasElement } {
  const key = `${Math.round(w * 2)}|${Math.round(h * 2)}|${dpr}`;
  let map = bulbCache.get(img);
  if (!map) {
    map = new Map();
    bulbCache.set(img, map);
  }
  const hit = map.get(key);
  if (hit) return hit;
  if (map.size > 8) map.clear();
  const on = offscreenCanvas(w, h, dpr);
  on.g.drawImage(img, 0, 0, w, h);
  const off = offscreenCanvas(w, h, dpr);
  off.g.drawImage(on.canvas, 0, 0, w, h);
  try {
    const W = off.canvas.width;
    const H = off.canvas.height;
    const px = off.g.getImageData(0, 0, W, H);
    unlitBulbPixels(px.data, W, H, (BULB_IMG.neckY / BULB_IMG.h) * H, (20 / BULB_IMG.w) * W);
    off.g.putImageData(px, 0, 0);
  } catch {
    // Pixel nicht lesbar (sollte bei eigenen Dateien nicht vorkommen): grau statt leuchtend
    off.g.save();
    off.g.setTransform(1, 0, 0, 1, 0, 0);
    off.g.globalCompositeOperation = 'saturation';
    off.g.fillStyle = '#808080';
    off.g.fillRect(0, 0, off.canvas.width, off.canvas.height);
    off.g.restore();
  }
  const out = { on: on.canvas, off: off.canvas };
  map.set(key, out);
  return out;
}

let scratch: { canvas: HTMLCanvasElement; g: CanvasRenderingContext2D } | null = null;

export interface BulbDrawOptions {
  /** Lage des ganzen Fotos (CSS-Pixel). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Helligkeit 0 … 1 (darüber wie 1). */
  glow: number;
  dpr: number;
  /** Foto nur bis zu dieser Bildzeile zeichnen (Standard: ganz). */
  cutY?: number;
  /** Schatten der ausgeschalteten Lampe (CSS-Farbe). */
  shadow?: string;
}

/**
 * Glühlampe aus dem Foto zeichnen. Bei schwachem Strom glüht zuerst nur die
 * Wendel (das Leuchtbild wird um sie herum weich ausgeblendet), erst bei
 * voller Helligkeit leuchtet der ganze Kolben – wie bei einer echten Lampe.
 */
export function drawBulbPhoto(g: CanvasRenderingContext2D, img: Source, o: BulbDrawOptions): void {
  const sp = bulbSprites(img, o.w, o.h, o.dpr);
  const cut = Math.min(BULB_IMG.h, o.cutY ?? BULB_IMG.h);
  const sc = sp.on.width / BULB_IMG.w;
  const dh = (cut / BULB_IMG.h) * o.h;
  const put = (c: CanvasImageSource) => g.drawImage(c, 0, 0, sp.on.width, cut * sc, o.x, o.y, o.w, dh);
  const glow = Math.max(0, Math.min(1, o.glow));
  // ganzer Kolben erst ab mittlerer Helligkeit
  const full = Math.min(1, Math.max(0, (glow - 0.35) / 0.6));
  if (full < 0.995) {
    g.save();
    if (o.shadow) {
      g.shadowColor = o.shadow;
      g.shadowBlur = Math.max(3, o.w * 0.12);
      g.shadowOffsetY = Math.max(1, o.w * 0.04);
    }
    put(sp.off);
    g.restore();
  }
  const part = Math.min(1, glow * 2.2) * (1 - full);
  if (part > 0.004) {
    const W = sp.on.width;
    const H = sp.on.height;
    if (!scratch) {
      const canvas = document.createElement('canvas');
      scratch = { canvas, g: canvas.getContext('2d')! };
    }
    const s = scratch;
    if (s.canvas.width < W || s.canvas.height < H) {
      s.canvas.width = Math.max(W, s.canvas.width);
      s.canvas.height = Math.max(H, s.canvas.height);
    }
    const q = s.g;
    q.setTransform(1, 0, 0, 1, 0, 0);
    q.globalCompositeOperation = 'source-over';
    q.clearRect(0, 0, W, H);
    q.drawImage(sp.on, 0, 0);
    // Leuchtbild nur in einem weichen Kreis um die Wendel, der mit der Helligkeit wächst
    q.globalCompositeOperation = 'destination-in';
    const fx = ((BULB_IMG.filL + BULB_IMG.filR) / 2) * sc;
    const fy = BULB_IMG.filY * sc;
    const r = (0.45 + 0.9 * glow) * BULB_IMG.glassR * 0.55 * sc;
    const m = q.createRadialGradient(fx, fy, r * 0.15, fx, fy, r);
    m.addColorStop(0, 'rgba(0,0,0,1)');
    m.addColorStop(0.55, 'rgba(0,0,0,0.6)');
    m.addColorStop(1, 'rgba(0,0,0,0)');
    q.fillStyle = m;
    q.fillRect(0, 0, W, H);
    q.globalCompositeOperation = 'source-over';
    g.save();
    g.globalAlpha *= part;
    g.drawImage(s.canvas, 0, 0, W, cut * sc, o.x, o.y, o.w, dh);
    g.restore();
  }
  if (full > 0.004) {
    g.save();
    g.globalAlpha *= full;
    put(sp.on);
    g.restore();
  }
}
