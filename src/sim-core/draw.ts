import type { Rect } from './surface';

/**
 * Zeichenhilfen in Pixel-Koordinaten (für Simulationen ohne Koordinatensystem,
 * z. B. Spiele, Experimente, Diagramme).
 */

export function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + radius, y);
  g.arcTo(x + w, y, x + w, y + h, radius);
  g.arcTo(x + w, y + h, x, y + h, radius);
  g.arcTo(x, y + h, x, y, radius);
  g.arcTo(x, y, x + w, y, radius);
  g.closePath();
}

/** Bild in ein Rechteck einpassen („contain“) oder es ausfüllen („cover“). */
export function drawImageFit(
  g: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  rect: Rect,
  mode: 'contain' | 'cover' = 'contain',
): void {
  const scale = mode === 'contain' ? Math.min(rect.w / img.width, rect.h / img.height) : Math.max(rect.w / img.width, rect.h / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  g.drawImage(img, rect.x + (rect.w - w) / 2, rect.y + (rect.h - h) / 2, w, h);
}

/** Text mit Schrift, Farbe und Ausrichtung in einem Aufruf. */
export function text(
  g: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  style: { font: string; color: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline },
): void {
  g.font = style.font;
  g.fillStyle = style.color;
  g.textAlign = style.align ?? 'center';
  g.textBaseline = style.baseline ?? 'middle';
  g.fillText(value, x, y);
}

/** Weicher Schatten für das nächste Zeichnen (mit `g.save()`/`g.restore()` verwenden). */
export function softShadow(g: CanvasRenderingContext2D, dark: boolean, blur = 14, offsetY = 4): void {
  g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.18)';
  g.shadowBlur = blur;
  g.shadowOffsetY = offsetY;
}

/** Farbe mit Deckkraft versehen (für Hex-Farben aus dem Theme). */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
      .toString(16)
      .padStart(2, '0');
    return hex + a;
  }
  return color;
}
