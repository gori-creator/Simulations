/**
 * Zeichenhilfen für Brüche auf der Zeichenfläche: gestapelte Brüche
 * (Zähler über Nenner) und Fließtext mit eingebetteten Brüchen, der bei
 * Bedarf umbricht.
 */

export interface FracToken {
  z: string;
  n: string;
  color?: string;
}

export interface TextToken {
  t: string;
  color?: string;
  bold?: boolean;
}

export type Token = TextToken | FracToken;

export const isFrac = (t: Token): t is FracToken => 'z' in t;

/** Bruch-Baustein für Fließtext. */
export const fr = (z: number | string, n: number | string, color?: string): FracToken => ({ z: String(z), n: String(n), color });

/** Breite eines gestapelten Bruchs in Pixeln. */
export function fracWidth(g: CanvasRenderingContext2D, z: string, n: string, size: number, font: string, weight = 800): number {
  g.font = `${weight} ${size}px ${font}`;
  return Math.max(g.measureText(z).width, g.measureText(n).width) + size * 0.36;
}

/** Halbe Höhe eines gestapelten Bruchs (Mitte des Bruchstrichs bis Ziffernoberkante). */
export const fracHalfHeight = (size: number) => size * 0.95;

/**
 * Gestapelter Bruch, zentriert um (cx, cy) = Mitte des Bruchstrichs.
 * Gibt die Breite zurück.
 */
export function drawFrac(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  z: string,
  n: string,
  size: number,
  color: string,
  font: string,
  weight = 800,
): number {
  const w = fracWidth(g, z, n, size, font, weight);
  const gap = size * 0.2;
  const cap = size * 0.73;
  g.font = `${weight} ${size}px ${font}`;
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillText(z, cx, cy - gap);
  g.fillText(n, cx, cy + gap + cap);
  const th = Math.max(1.6, size * 0.075);
  g.fillRect(cx - w / 2, cy - th / 2, w, th);
  return w;
}

interface Placed {
  token: Token;
  w: number;
}

interface Line {
  items: Placed[];
  w: number;
  hasFrac: boolean;
}

/** Text in Wörter (mit folgendem Leerzeichen) zerlegen, Brüche bleiben ganz. */
function words(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (const t of tokens) {
    if (isFrac(t)) out.push(t);
    else for (const piece of t.t.match(/[^ ]+ *| +/g) ?? []) out.push({ ...t, t: piece });
  }
  return out;
}

function layout(g: CanvasRenderingContext2D, tokens: Token[], size: number, font: string, maxW: number): Line[] {
  const fs = size * 0.82;
  // Umbrechen nur nach einem normalen Leerzeichen; Brüche, Satzzeichen und
  // geschützte Leerzeichen ( ) bleiben zusammen.
  const chunks: Placed[][] = [];
  let chunk: Placed[] = [];
  for (const token of words(tokens)) {
    let w: number;
    if (isFrac(token)) w = fracWidth(g, token.z, token.n, fs, font, 750) + 2;
    else {
      g.font = `${token.bold ? 750 : 560} ${size}px ${font}`;
      w = g.measureText(token.t).width;
    }
    chunk.push({ token, w });
    if (!isFrac(token) && / $/.test(token.t)) {
      chunks.push(chunk);
      chunk = [];
    }
  }
  if (chunk.length) chunks.push(chunk);
  const lines: Line[] = [];
  let cur: Line = { items: [], w: 0, hasFrac: false };
  for (const c of chunks) {
    const cw = c.reduce((s, x) => s + x.w, 0);
    if (cur.items.length && cur.w + cw > maxW) {
      lines.push(cur);
      cur = { items: [], w: 0, hasFrac: false };
    }
    for (const item of c) {
      cur.items.push(item);
      cur.w += item.w;
      if (isFrac(item.token)) cur.hasFrac = true;
    }
  }
  if (cur.items.length) lines.push(cur);
  for (const line of lines) {
    const last = line.items[line.items.length - 1];
    if (last && !isFrac(last.token) && / +$/.test(last.token.t)) {
      g.font = `${(last.token as TextToken).bold ? 750 : 560} ${size}px ${font}`;
      const trimmed = last.token.t.replace(/ +$/, '');
      const nw = g.measureText(trimmed).width;
      line.w -= last.w - nw;
      last.w = nw;
      last.token = { ...last.token, t: trimmed };
    }
  }
  return lines;
}

const lineHeight = (line: Line, size: number) => (line.hasFrac ? size * 1.95 : size * 1.4);

/** Höhe eines Fließtexts mit Brüchen (für das Layout vorab). */
export function richHeight(g: CanvasRenderingContext2D, tokens: Token[], size: number, font: string, maxW: number): number {
  return layout(g, tokens, size, font, maxW).reduce((s, l) => s + lineHeight(l, size), 0);
}

/**
 * Fließtext mit eingebetteten Brüchen zeichnen. `y` ist die Oberkante des
 * Blocks. Gibt die Höhe zurück.
 */
export function drawRich(
  g: CanvasRenderingContext2D,
  tokens: Token[],
  x: number,
  y: number,
  opts: { size: number; font: string; color: string; maxW: number; align?: 'center' | 'left' },
): number {
  const { size, font, color, maxW } = opts;
  const lines = layout(g, tokens, size, font, maxW);
  let top = y;
  for (const line of lines) {
    const lh = lineHeight(line, size);
    const cy = top + lh / 2;
    let px = opts.align === 'left' ? x : x - line.w / 2;
    for (const { token, w } of line.items) {
      if (isFrac(token)) {
        drawFrac(g, px + w / 2, cy, token.z, token.n, size * 0.82, token.color ?? color, font, 750);
      } else {
        g.font = `${token.bold ? 750 : 560} ${size}px ${font}`;
        g.fillStyle = token.color ?? color;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText(token.t, px, cy + size * 0.04);
      }
      px += w;
    }
    top += lh;
  }
  return top - y;
}

/**
 * Vorlage mit Platzhaltern in Bausteine verwandeln:
 * `fill('{a} ist kleiner als {b}.', { a: fr(3, 4), b: fr(5, 6) })`.
 * Ein Wert kann Text, ein Baustein oder eine Liste von Bausteinen sein.
 */
export function fill(template: string, vars: Record<string, string | number | Token | Token[]>, base: Partial<TextToken> = {}): Token[] {
  const out: Token[] = [];
  const re = /\{(\w+)\}/g;
  let last = 0;
  for (const m of template.matchAll(re)) {
    if (m.index! > last) out.push({ ...base, t: template.slice(last, m.index) });
    const v = vars[m[1]!];
    if (v === undefined) out.push({ ...base, t: m[0] });
    else if (typeof v === 'string' || typeof v === 'number') out.push({ ...base, t: String(v) });
    else if (Array.isArray(v)) out.push(...v);
    else out.push(v);
    last = m.index! + m[0].length;
  }
  if (last < template.length) out.push({ ...base, t: template.slice(last) });
  return out;
}
