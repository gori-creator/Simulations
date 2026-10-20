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

/* ------------------------------------------------------------------ */
/* Text mit tiefgestelltem Index                                       */
/* ------------------------------------------------------------------ */

/** Ein Stück Text, normal oder tiefgestellt. */
export interface SubTextPart {
  text: string;
  sub: boolean;
}

/**
 * Zerlegt einen Text mit Indizes in Teile:
 * - `F_G`, `a_1`, `v_0`, `F_res`: Der Index reicht bis zum nächsten Zeichen,
 *   das kein Buchstabe und keine Ziffer ist (Leerzeichen, „=“, „,“ …).
 * - `F_{G,1}`: Geschweifte Klammern für Indizes mit anderen Zeichen.
 * - `\_` steht für einen echten Unterstrich.
 */
export function parseSubText(value: string): SubTextPart[] {
  const parts: SubTextPart[] = [];
  const push = (text: string, sub: boolean) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last && last.sub === sub) last.text += text;
    else parts.push({ text, sub });
  };
  let plain = '';
  let i = 0;
  while (i < value.length) {
    const ch = value[i]!;
    if (ch === '\\' && value[i + 1] === '_') {
      plain += '_';
      i += 2;
      continue;
    }
    if (ch === '_') {
      let sub = '';
      let end = i + 1;
      if (value[end] === '{') {
        const close = value.indexOf('}', end + 1);
        if (close > end) {
          sub = value.slice(end + 1, close);
          end = close + 1;
        }
      } else {
        const match = /^[\p{L}\p{N}]+/u.exec(value.slice(end));
        if (match) {
          sub = match[0];
          end += sub.length;
        }
      }
      if (sub) {
        push(plain, false);
        plain = '';
        push(sub, true);
        i = end;
        continue;
      }
    }
    plain += ch;
    i++;
  }
  push(plain, false);
  return parts;
}

export interface SubTextStyle {
  /** Schriftgröße in Pixeln (normaler Text). */
  size: number;
  /** Schriftfamilie, z. B. `ctx.theme.font`. */
  family: string;
  /** Schriftstärke (Standard 400). */
  weight?: number | string;
  color: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Farbe eines Randes um die Schrift (bessere Lesbarkeit auf Linien); ohne Angabe kein Rand. */
  halo?: string;
  /** Breite des Randes (Standard 3,5). */
  haloWidth?: number;
  /** Größe des Index relativ zur Schrift (Standard 0,74). */
  subScale?: number;
  /** Absenkung des Index relativ zur Schriftgröße (Standard 0,28). */
  subShift?: number;
}

function subFont(style: SubTextStyle, sub: boolean): string {
  const size = sub ? Math.round(style.size * (style.subScale ?? 0.74) * 2) / 2 : style.size;
  return `${style.weight ?? 400} ${size}px ${style.family}`;
}

/** Breite eines Textes mit Indizes (gleiche Schreibweise wie bei `subText`) in Pixeln. */
export function measureSubText(g: CanvasRenderingContext2D, value: string, style: SubTextStyle): number {
  let width = 0;
  for (const part of parseSubText(value)) {
    g.font = subFont(style, part.sub);
    width += g.measureText(part.text).width;
  }
  return width;
}

/**
 * Zeichnet Text mit echtem tiefgestelltem Index, z. B.
 * `subText(g, 'F_G = 5 N', x, y, { size: 14, family: theme.font, color })`.
 * `align` bezieht sich auf die Gesamtbreite. Gibt die Breite in Pixeln zurück.
 */
export function subText(g: CanvasRenderingContext2D, value: string, x: number, y: number, style: SubTextStyle): number {
  const parts = parseSubText(value);
  const total = measureSubText(g, value, style);
  const align = style.align ?? 'center';
  const left = align === 'left' || align === 'start' ? x : align === 'right' || align === 'end' ? x - total : x - total / 2;
  const shift = style.size * (style.subShift ?? 0.28);
  g.save();
  g.textAlign = 'left';
  g.textBaseline = style.baseline ?? 'middle';
  for (const pass of style.halo ? ['halo', 'fill'] : ['fill']) {
    let cx = left;
    for (const part of parts) {
      g.font = subFont(style, part.sub);
      const yy = y + (part.sub ? shift : 0);
      if (pass === 'halo') {
        g.lineJoin = 'round';
        g.lineWidth = style.haloWidth ?? 3.5;
        g.strokeStyle = style.halo!;
        g.strokeText(part.text, cx, yy);
      } else {
        g.fillStyle = style.color;
        g.fillText(part.text, cx, yy);
      }
      cx += g.measureText(part.text).width;
    }
  }
  g.restore();
  return total;
}
