import { clear, s } from '../../engine/dom';

/**
 * Streudiagramm für die Spiele (SVG): Weltkoordinaten 0…10 auf beiden Achsen.
 * Punkte der Gruppe A sind Kreise (blau), Gruppe B Rauten (orange) – so sind
 * sie auch ohne Farben unterscheidbar.
 */
export const VIEW = { w: 440, h: 330, left: 44, right: 14, top: 14, bottom: 40 };
const PW = VIEW.w - VIEW.left - VIEW.right;
const PH = VIEW.h - VIEW.top - VIEW.bottom;

export const sx = (x: number) => VIEW.left + (x / 10) * PW;
export const sy = (y: number) => VIEW.top + (1 - y / 10) * PH;
/** Bildschirm → Welt. */
export const wx = (px: number) => ((px - VIEW.left) / PW) * 10;
export const wy = (py: number) => (1 - (py - VIEW.top) / PH) * 10;

let clipCount = 0;

export interface Scatter {
  svg: SVGSVGElement;
  /** Ebenen in Zeichenreihenfolge. */
  shade: SVGGElement;
  under: SVGGElement;
  points: SVGGElement;
  over: SVGGElement;
  /** Mausposition in Weltkoordinaten. */
  toWorld(event: PointerEvent): { x: number; y: number };
}

export function scatter(label: string, xLabel: string, yLabel: string): Scatter {
  const svg = s('svg', { class: 'kplot', viewBox: `0 0 ${VIEW.w} ${VIEW.h}`, role: 'img', 'aria-label': label });
  const grid = s('g');
  for (let i = 0; i <= 10; i += 2) {
    grid.append(s('line', { class: 'kplot__grid', x1: sx(i), x2: sx(i), y1: sy(0), y2: sy(10) }));
    grid.append(s('line', { class: 'kplot__grid', x1: sx(0), x2: sx(10), y1: sy(i), y2: sy(i) }));
  }
  grid.append(s('line', { class: 'kplot__axis', x1: sx(0), x2: sx(10), y1: sy(0), y2: sy(0) }));
  grid.append(s('line', { class: 'kplot__axis', x1: sx(0), x2: sx(0), y1: sy(0), y2: sy(10) }));
  grid.append(s('text', { class: 'kplot__label', x: sx(10), y: VIEW.h - 10, 'text-anchor': 'end' }, `${xLabel} →`));
  grid.append(s('text', { class: 'kplot__label', x: 14, y: sy(10), 'text-anchor': 'end', transform: `rotate(-90 14 ${sy(10)})` }, `${yLabel} →`));
  // Linien und Flächen nur innerhalb des Diagramms zeichnen
  const clipId = `kclip-${++clipCount}`;
  const defs = s('defs', {}, s('clipPath', { id: clipId }, s('rect', { x: sx(0), y: sy(10), width: sx(10) - sx(0), height: sy(0) - sy(10) })));
  svg.append(defs);
  const shade = s('g', { 'clip-path': `url(#${clipId})` });
  const under = s('g', { 'clip-path': `url(#${clipId})` });
  const points = s('g');
  const over = s('g');
  svg.append(shade, grid, under, points, over);
  return {
    svg,
    shade,
    under,
    points,
    over,
    toWorld(event) {
      const box = svg.getBoundingClientRect();
      const px = ((event.clientX - box.left) / box.width) * VIEW.w;
      const py = ((event.clientY - box.top) / box.height) * VIEW.h;
      return { x: Math.max(0, Math.min(10, wx(px))), y: Math.max(0, Math.min(10, wy(py))) };
    },
  };
}

/** Punkt einer Gruppe: A = Kreis, B = Raute. */
export function marker(x: number, y: number, group: 'a' | 'b', r = 7): SVGElement {
  if (group === 'a') return s('circle', { class: 'kplot__a', cx: sx(x), cy: sy(y), r });
  const cx = sx(x);
  const cy = sy(y);
  const d = r * 1.25;
  return s('path', { class: 'kplot__b', d: `M${cx} ${cy - d}L${cx + d} ${cy}L${cx} ${cy + d}L${cx - d} ${cy}Z` });
}

/** Hintergrund nach Bits Entscheidung einfärben (Raster). */
export function paintShade(layer: SVGGElement, decide: (x: number, y: number) => 'a' | 'b' | null, cells = 25): void {
  clear(layer);
  const step = 10 / cells;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const g = decide((i + 0.5) * step, (j + 0.5) * step);
      if (!g) continue;
      layer.append(s('rect', { class: g === 'a' ? 'kplot__a-soft' : 'kplot__b-soft', x: sx(i * step), y: sy((j + 1) * step), width: sx(step) - sx(0) + 0.5, height: sy(0) - sy(step) + 0.5 }));
    }
  }
}

/** Kleine Legende unter dem Diagramm. */
export function legend(a: string, b: string): HTMLElement {
  const el = document.createElement('p');
  el.className = 'klegend';
  const dotA = document.createElement('span');
  dotA.className = 'klegend__a';
  const dotB = document.createElement('span');
  dotB.className = 'klegend__b';
  el.append(dotA, ` ${a}   `, dotB, ` ${b}`);
  return el;
}
