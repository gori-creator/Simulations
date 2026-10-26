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
/* Dach (Zirkumflex) über einem Zeichen: „φ̂“, „v̂“, „x̂“                  */
/* ------------------------------------------------------------------ */

/** Kombinierendes Dach U+0302 (z. B. in „φ̂“ für die Amplitude). */
export const COMBINING_HAT = '\u0302';

/** Buchstabe oder Ziffer mit folgendem kombinierendem Dach. */
const HAT_PATTERN = /([\p{L}\p{N}])\u0302/gu;

/** Ein Stück Text: normal oder ein einzelnes Zeichen mit Dach (`hat`). */
export interface HatPart {
  text: string;
  hat: boolean;
}

/**
 * Zerlegt Text an Zeichen mit kombinierendem Dach (U+0302). Viele Schriften
 * setzen das Dach über Zeichen wie „φ“ verrutscht (neben oder halb in das
 * Zeichen); der Kern zeichnet es deshalb selbst. Text ohne Dach bleibt ein Teil.
 */
export function splitHats(value: string): HatPart[] {
  if (!value.includes(COMBINING_HAT)) return value ? [{ text: value, hat: false }] : [];
  const parts: HatPart[] = [];
  let last = 0;
  for (const match of value.matchAll(HAT_PATTERN)) {
    const index = match.index!;
    if (index > last) parts.push({ text: value.slice(last, index), hat: false });
    parts.push({ text: match[1]!, hat: true });
    last = index + match[0].length;
  }
  if (last < value.length) parts.push({ text: value.slice(last), hat: false });
  return parts;
}

/** Braucht der Text die Zeichenhilfen für Index oder Dach? */
export function hasRichText(value: string): boolean {
  return value.includes('_') || value.includes(COMBINING_HAT);
}

/** Breite eines Textstücks mit der aktuellen Schrift; Dächer haben keine eigene Breite. */
export function measureHatText(g: CanvasRenderingContext2D, value: string): number {
  if (!value.includes(COMBINING_HAT)) return g.measureText(value).width;
  return splitHats(value).reduce((sum, part) => sum + g.measureText(part.text).width, 0);
}

/**
 * Zeichnet ein Textstück mit der aktuellen Schrift, Ausrichtung links,
 * gefüllt (`fill`) oder als Rand (`halo`, Farbe und Breite wie gesetzt), und
 * setzt Dächer selbst: ein kleiner Winkel mittig über der Oberkante des
 * Zeichens (aus `actualBoundingBox…`). Gibt die Breite zurück.
 */
export function drawHatText(g: CanvasRenderingContext2D, value: string, x: number, y: number, pass: 'fill' | 'halo'): number {
  if (!value.includes(COMBINING_HAT)) {
    if (pass === 'halo') g.strokeText(value, x, y);
    else g.fillText(value, x, y);
    return g.measureText(value).width;
  }
  const size = Number(/(\d+(?:\.\d+)?)px/.exec(g.font)?.[1] ?? 14);
  const bold = /\b(?:[6-9]00|bold)\b/.test(g.font);
  let cx = x;
  for (const part of splitHats(value)) {
    if (pass === 'halo') g.strokeText(part.text, cx, y);
    else g.fillText(part.text, cx, y);
    const m = g.measureText(part.text);
    if (part.hat) {
      // Mitte und Oberkante des Zeichens; ohne Angaben grob aus der Schriftgröße
      const left = m.actualBoundingBoxLeft ?? 0;
      const right = m.actualBoundingBoxRight ?? m.width;
      const ascent = m.actualBoundingBoxAscent ?? size * 0.7;
      const mid = cx + (right - left) / 2 + size * 0.02;
      const bottom = y - ascent - size * 0.09;
      const half = size * 0.19;
      const height = size * 0.15;
      const width = size * (bold ? 0.085 : 0.07);
      g.save();
      g.beginPath();
      g.moveTo(mid - half, bottom);
      g.lineTo(mid, bottom - height);
      g.lineTo(mid + half, bottom);
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (pass === 'halo') {
        g.lineWidth += width;
      } else {
        g.lineWidth = width;
        g.strokeStyle = g.fillStyle;
      }
      g.stroke();
      g.restore();
    }
    cx += m.width;
  }
  return cx - x;
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
 *
 * Mit `{ prose: true }` (Hilfetexte und Tipps, die auch Eingabe-Schreibweisen
 * nennen) bleibt ein `_` außerdem stehen, wenn direkt davor zwei oder mehr
 * kleine lateinische Buchstaben stehen, also ein Wort wie in „log_2“, „log_b“
 * oder „snake_case“. Formelzeichen wie „F_Z“, „v_K“, „x_max“, „Δs_1“ oder
 * „E_pot“ bekommen weiter einen Index.
 */
export interface SubTextOptions {
  /** Wörter vor `_` (zwei oder mehr Kleinbuchstaben a–z) nicht als Formelzeichen werten. */
  prose?: boolean;
}

export function parseSubText(value: string, options: SubTextOptions = {}): SubTextPart[] {
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
    if (ch === '_' && !(options.prose && /[a-z]{2}$/.test(value.slice(0, i)))) {
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
    width += measureHatText(g, part.text);
  }
  return width;
}

/**
 * Zeichnet Text mit echtem tiefgestelltem Index, z. B.
 * `subText(g, 'F_G = 5 N', x, y, { size: 14, family: theme.font, color })`.
 * `align` bezieht sich auf die Gesamtbreite. Gibt die Breite in Pixeln zurück.
 * Ein kombinierendes Dach (U+0302, „φ̂_E“) zeichnet der Kern selbst über das
 * Zeichen (`drawHatText`), weil Schriften es oft verrutscht setzen.
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
      } else {
        g.fillStyle = style.color;
      }
      // Zeichen mit Dach („φ̂“) setzt drawHatText selbst; sonst wie fillText/strokeText
      cx += drawHatText(g, part.text, cx, yy, pass === 'halo' ? 'halo' : 'fill');
    }
  }
  g.restore();
  return total;
}
