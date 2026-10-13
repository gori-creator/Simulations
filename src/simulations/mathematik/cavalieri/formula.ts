/**
 * Formeln auf der Zeichenfläche: Variablen kursiv, Indizes, Hochzahlen,
 * gestapelte Brüche und Wurzeln mit Überstrich – in einer kleinen Kurzschrift:
 *
 * - einzelne Buchstaben (a, h, r, ρ, α …) werden kursiv gesetzt (Variablen);
 *   π, Zahlen, Einheiten (cm, cm²) und Wörter bleiben aufrecht
 * - `h_a`, `V_{Zyl}`: Index; `x^2`, `r^{n+1}`: Hochzahl (² und ³ gehen auch direkt)
 * - `\f{1}{3}`: Bruch, `\r{h² + r²}`: Wurzel
 * - `\c{key}{…}`: Farbe aus der Palette, `\b{…}`: fett, `\t{…}`: aufrecht
 */

export interface FormulaStyle {
  size: number;
  font: string;
  mathFont: string;
  color: string;
  /** Schriftstärke für Text (Standard 600). */
  weight?: number;
  palette?: Record<string, string>;
}

type Node =
  | { t: 'str'; s: string }
  | { t: 'sub' | 'sup'; c: Node[] }
  | { t: 'frac'; n: Node[]; d: Node[] }
  | { t: 'sqrt'; c: Node[] }
  | { t: 'color'; key: string; c: Node[] }
  | { t: 'bold'; c: Node[] }
  | { t: 'up'; c: Node[] };

/** Gesetzter Formelteil: Breite, Ober- und Unterlänge (bezogen auf die Grundlinie), Zeichenfunktion. */
export interface FormulaBox {
  w: number;
  asc: number;
  desc: number;
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
}

interface Ctx {
  size: number;
  color: string;
  weight: number;
  upright: boolean;
}

const cache = new Map<string, Node[]>();

function parse(src: string): Node[] {
  const hit = cache.get(src);
  if (hit) return hit;
  let i = 0;
  const group = (): Node[] => {
    if (src[i] !== '{') {
      const ch = src[i] ?? '';
      i++;
      return ch ? [{ t: 'str', s: ch }] : [];
    }
    i++;
    const out = seq('}');
    i++;
    return out;
  };
  const textOf = (nodes: Node[]) => nodes.map((n) => (n.t === 'str' ? n.s : '')).join('');
  const seq = (end?: string): Node[] => {
    const out: Node[] = [];
    let buf = '';
    const flush = () => {
      if (buf) out.push({ t: 'str', s: buf });
      buf = '';
    };
    while (i < src.length && src[i] !== end) {
      const ch = src[i]!;
      if (ch === '\\' && i + 1 < src.length && 'frcbt'.includes(src[i + 1]!)) {
        const cmd = src[i + 1]!;
        i += 2;
        flush();
        if (cmd === 'f') {
          const n = group();
          out.push({ t: 'frac', n, d: group() });
        } else if (cmd === 'r') out.push({ t: 'sqrt', c: group() });
        else if (cmd === 'c') {
          const key = textOf(group());
          out.push({ t: 'color', key, c: group() });
        } else if (cmd === 'b') out.push({ t: 'bold', c: group() });
        else out.push({ t: 'up', c: group() });
      } else if (ch === '_' || ch === '^') {
        flush();
        i++;
        out.push({ t: ch === '_' ? 'sub' : 'sup', c: group() });
      } else {
        buf += ch;
        i++;
      }
    }
    flush();
    return out;
  };
  const nodes = seq();
  if (cache.size > 400) cache.clear();
  cache.set(src, nodes);
  return nodes;
}

const LETTER = /\p{L}/u;
/** Buchstabe (auch Umlaute); π zählt nicht, es bleibt aufrecht und trennt Variablen nicht. */
const isLetter = (c: string | undefined) => !!c && c !== 'π' && LETTER.test(c);

function hbox(boxes: FormulaBox[]): FormulaBox {
  let w = 0;
  let asc = 0;
  let desc = 0;
  for (const b of boxes) {
    w += b.w;
    asc = Math.max(asc, b.asc);
    desc = Math.max(desc, b.desc);
  }
  return {
    w,
    asc,
    desc,
    draw(g, x, y) {
      let cx = x;
      for (const b of boxes) {
        b.draw(g, cx, y);
        cx += b.w;
      }
    },
  };
}

function layout(g: CanvasRenderingContext2D, nodes: Node[], ctx: Ctx, style: FormulaStyle): FormulaBox {
  const boxes: FormulaBox[] = [];
  for (const node of nodes) {
    switch (node.t) {
      case 'str':
        boxes.push(...strBoxes(g, node.s, ctx, style));
        break;
      case 'up':
        boxes.push(layout(g, node.c, { ...ctx, upright: true }, style));
        break;
      case 'bold':
        boxes.push(layout(g, node.c, { ...ctx, weight: 800 }, style));
        break;
      case 'color':
        boxes.push(layout(g, node.c, { ...ctx, color: style.palette?.[node.key] ?? ctx.color }, style));
        break;
      case 'sub':
      case 'sup': {
        const inner = layout(g, node.c, { ...ctx, size: ctx.size * 0.7 }, style);
        const shift = node.t === 'sub' ? ctx.size * 0.26 : -ctx.size * 0.42;
        boxes.push({
          w: inner.w + 1,
          asc: Math.max(0, inner.asc - shift),
          desc: Math.max(0, inner.desc + shift),
          draw: (g2, x, y) => inner.draw(g2, x + 0.5, y + shift),
        });
        break;
      }
      case 'frac': {
        const inner = { ...ctx, size: ctx.size * 0.84 };
        const n = layout(g, node.n, inner, style);
        const d = layout(g, node.d, inner, style);
        const axis = ctx.size * 0.3;
        const gap = ctx.size * 0.14;
        const bar = Math.max(1.2, ctx.size * 0.07);
        const w = Math.max(n.w, d.w) + ctx.size * 0.3;
        const color = ctx.color;
        boxes.push({
          w: w + ctx.size * 0.16,
          asc: axis + gap + n.desc + n.asc,
          desc: Math.max(0, gap + d.asc + d.desc - axis),
          draw: (g2, x, y) => {
            const cx = x + ctx.size * 0.08 + w / 2;
            n.draw(g2, cx - n.w / 2, y - axis - gap - n.desc);
            d.draw(g2, cx - d.w / 2, y - axis + gap + d.asc);
            g2.fillStyle = color;
            g2.fillRect(x + ctx.size * 0.08, y - axis - bar / 2, w, bar);
          },
        });
        break;
      }
      case 'sqrt': {
        const body = layout(g, node.c, ctx, style);
        const pad = ctx.size * 0.12;
        const top = body.asc + pad + 1;
        const bottom = body.desc + 1;
        const sign = ctx.size * 0.62;
        const color = ctx.color;
        const lw = Math.max(1.2, ctx.size * 0.075);
        boxes.push({
          w: sign + body.w + ctx.size * 0.12,
          asc: top + lw,
          desc: bottom,
          draw: (g2, x, y) => {
            g2.save();
            g2.strokeStyle = color;
            g2.lineWidth = lw;
            g2.lineJoin = 'round';
            g2.lineCap = 'round';
            g2.beginPath();
            g2.moveTo(x + sign * 0.06, y - (top + bottom) * 0.42 + bottom);
            g2.lineTo(x + sign * 0.26, y - (top + bottom) * 0.5 + bottom);
            g2.lineTo(x + sign * 0.52, y + bottom);
            g2.lineTo(x + sign * 0.9, y - top);
            g2.lineTo(x + sign + body.w + ctx.size * 0.06, y - top);
            g2.stroke();
            g2.restore();
            body.draw(g2, x + sign, y);
          },
        });
        break;
      }
    }
  }
  return hbox(boxes);
}

/** Zeichenkette in aufrechte Textstücke und kursive Variablen zerlegen. */
function strBoxes(g: CanvasRenderingContext2D, s: string, ctx: Ctx, style: FormulaStyle): FormulaBox[] {
  const out: FormulaBox[] = [];
  let buf = '';
  const textFont = `${ctx.weight} ${ctx.size}px ${style.font}`;
  const varFont = `italic ${ctx.weight >= 700 ? 700 : 500} ${Math.round(ctx.size * 1.12 * 10) / 10}px ${style.mathFont}`;
  const push = (str: string, font: string, italic: boolean) => {
    if (!str) return;
    g.font = font;
    const w = g.measureText(str).width + (italic ? ctx.size * 0.06 : 0);
    const color = ctx.color;
    out.push({
      w,
      asc: ctx.size * 0.76,
      desc: ctx.size * 0.22,
      draw: (g2, x, y) => {
        g2.font = font;
        g2.fillStyle = color;
        g2.textAlign = 'left';
        g2.textBaseline = 'alphabetic';
        g2.fillText(str, x, y);
      },
    });
  };
  const chars = [...s];
  chars.forEach((c, k) => {
    if (!ctx.upright && isLetter(c) && !isLetter(chars[k - 1]) && !isLetter(chars[k + 1])) {
      push(buf, textFont, false);
      buf = '';
      push(c, varFont, true);
    } else buf += c;
  });
  push(buf, textFont, false);
  return out;
}

/** Formel setzen (zum Messen und späteren Zeichnen an der Grundlinie). */
export function formula(g: CanvasRenderingContext2D, src: string, style: FormulaStyle): FormulaBox {
  return layout(g, parse(src), { size: style.size, color: style.color, weight: style.weight ?? 600, upright: false }, style);
}

/** Formel zeichnen; `y` ist die Grundlinie. Gibt die Breite zurück. */
export function drawFormula(g: CanvasRenderingContext2D, src: string, x: number, y: number, style: FormulaStyle, align: 'left' | 'center' | 'right' = 'left'): number {
  const box = formula(g, src, style);
  const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
  box.draw(g, left, y);
  return box.w;
}
