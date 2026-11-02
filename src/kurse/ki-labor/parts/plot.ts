import { s } from '../../engine/dom';

/**
 * Koordinatensystem als SVG für das KI-Labor: beliebige Wertebereiche,
 * beschriftete Achsen, Ebenen zum Zeichnen. Umrechnung Welt ↔ Bildschirm.
 */
export interface PlotOptions {
  x: [number, number];
  y: [number, number];
  xLabel: string;
  yLabel: string;
  label: string;
  /** Abstand der Gitterlinien. */
  xStep?: number;
  yStep?: number;
  width?: number;
  height?: number;
  /** Zahlen an den Achsen formatieren. */
  fmt?: (v: number) => string;
}

export interface Plot {
  svg: SVGSVGElement;
  back: SVGGElement;
  mid: SVGGElement;
  front: SVGGElement;
  px(x: number): number;
  py(y: number): number;
  wx(px: number): number;
  wy(py: number): number;
  /** Mausposition in Weltkoordinaten. */
  toWorld(event: PointerEvent): { x: number; y: number };
  opts: Required<Pick<PlotOptions, 'width' | 'height'>> & PlotOptions;
}

let clips = 0;

export function plot(o: PlotOptions): Plot {
  const width = o.width ?? 480;
  const height = o.height ?? 320;
  const L = 52;
  const R = 14;
  const T = 14;
  const B = 42;
  const px = (x: number) => L + ((x - o.x[0]) / (o.x[1] - o.x[0])) * (width - L - R);
  const py = (y: number) => T + (1 - (y - o.y[0]) / (o.y[1] - o.y[0])) * (height - T - B);
  const wx = (p: number) => o.x[0] + ((p - L) / (width - L - R)) * (o.x[1] - o.x[0]);
  const wy = (p: number) => o.y[0] + (1 - (p - T) / (height - T - B)) * (o.y[1] - o.y[0]);
  const fmt = o.fmt ?? ((v: number) => String(Math.round(v * 100) / 100));
  const svg = s('svg', { class: 'kplot kplot--lab', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': o.label });
  const grid = s('g');
  const xs = o.xStep ?? (o.x[1] - o.x[0]) / 5;
  const ys = o.yStep ?? (o.y[1] - o.y[0]) / 5;
  for (let v = Math.ceil(o.x[0] / xs) * xs; v <= o.x[1] + 1e-9; v += xs) {
    grid.append(s('line', { class: 'kplot__grid', x1: px(v), x2: px(v), y1: py(o.y[0]), y2: py(o.y[1]) }));
    grid.append(s('text', { class: 'kplot__tick', x: px(v), y: height - B + 16, 'text-anchor': 'middle' }, fmt(v)));
  }
  for (let v = Math.ceil(o.y[0] / ys) * ys; v <= o.y[1] + 1e-9; v += ys) {
    grid.append(s('line', { class: 'kplot__grid', x1: px(o.x[0]), x2: px(o.x[1]), y1: py(v), y2: py(v) }));
    grid.append(s('text', { class: 'kplot__tick', x: L - 6, y: py(v) + 4, 'text-anchor': 'end' }, fmt(v)));
  }
  grid.append(s('line', { class: 'kplot__axis', x1: px(o.x[0]), x2: px(o.x[1]), y1: py(o.y[0]), y2: py(o.y[0]) }));
  grid.append(s('line', { class: 'kplot__axis', x1: px(o.x[0]), x2: px(o.x[0]), y1: py(o.y[0]), y2: py(o.y[1]) }));
  grid.append(s('text', { class: 'kplot__label', x: px(o.x[1]), y: height - 6, 'text-anchor': 'end' }, `${o.xLabel} →`));
  grid.append(s('text', { class: 'kplot__label', x: 12, y: py(o.y[1]), 'text-anchor': 'end', transform: `rotate(-90 12 ${py(o.y[1])})` }, `${o.yLabel} →`));
  const id = `klab-clip-${++clips}`;
  svg.append(s('defs', {}, s('clipPath', { id }, s('rect', { x: px(o.x[0]), y: py(o.y[1]), width: px(o.x[1]) - px(o.x[0]), height: py(o.y[0]) - py(o.y[1]) }))));
  const back = s('g', { 'clip-path': `url(#${id})` });
  const mid = s('g', { 'clip-path': `url(#${id})` });
  const front = s('g');
  svg.append(back, grid, mid, front);
  return {
    svg,
    back,
    mid,
    front,
    px,
    py,
    wx,
    wy,
    toWorld(event) {
      const box = svg.getBoundingClientRect();
      return { x: wx(((event.clientX - box.left) / box.width) * width), y: wy(((event.clientY - box.top) / box.height) * height) };
    },
    opts: { ...o, width, height },
  };
}

/** Linienzug durch Weltpunkte als `points`-Attribut. */
export function polyline(p: Plot, pts: readonly { x: number; y: number }[]): string {
  return pts.map((q) => `${p.px(q.x).toFixed(1)},${p.py(q.y).toFixed(1)}`).join(' ');
}
