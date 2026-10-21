import { t } from '../i18n/utils';
import { Formatter, formatPiFraction, MINUS } from './format';
import { parseSubText } from './draw';
import { clamp } from './numeric';
import type { PointerTarget, Rect, Surface, SurfacePointer } from './surface';
import { minorStep, niceStep, piStep, ticksIn } from './ticks';

/* ------------------------------------------------------------------ */
/* Optionen und Stile                                                  */
/* ------------------------------------------------------------------ */

export interface AxisOptions {
  /** Beschriftung an der Pfeilspitze, z. B. "x" oder "t in s". */
  label?: string;
  /** Teilstriche als Vielfache von π beschriften. */
  pi?: boolean;
  /** Werte sind im Bogenmaß, beschriftet wird in Grad (30°, 90°, …). */
  degrees?: boolean;
  /** Eigene Beschriftung der Teilstriche (z. B. 10^v bei logarithmischer Achse). */
  format?: (value: number) => string;
  /** Teilstriche nie enger als dieser Abstand (in Einheiten). */
  minStep?: number;
  /** Zahlen an den Teilstrichen anzeigen (Standard: ja). */
  numbers?: boolean;
}

/** Optionen für `plot.axes()`. */
export interface AxesOptions {
  /**
   * Sperrbereiche in CSS-Pixeln (wie `plot.rect`): Achsenzahlen, die eines
   * dieser Rechtecke berühren, werden nicht gezeichnet – z. B. unter Anzeigen,
   * die über dem Koordinatensystem liegen. Teilstriche bleiben.
   */
  blocked?: readonly Rect[];
}

export interface PlotOptions {
  /** Anfangs mindestens sichtbarer Bereich. */
  x: readonly [number, number];
  y: readonly [number, number];
  /** Gleiche Einheit auf beiden Achsen (Standard: ja). */
  equalAspect?: boolean;
  /** Teilbereich der Zeichenfläche in CSS-Pixeln (Standard: alles). */
  region?: (width: number, height: number) => Rect;
  /** Verschieben per Ziehen (Standard: ja). */
  pan?: boolean;
  /** Zoomen per Strg+Mausrad, Pinch und Schaltflächen (Standard: ja). */
  zoom?: boolean;
  /** Zoom-Schaltflächen über dem Koordinatensystem (Standard: wie `zoom`). */
  controls?: boolean;
  xAxis?: AxisOptions;
  yAxis?: AxisOptions;
}

export interface StrokeStyle {
  color?: string;
  width?: number;
  dash?: number[];
  alpha?: number;
}

export interface FillStyle {
  fill?: string;
  stroke?: string;
  width?: number;
  dash?: number[];
  alpha?: number;
}

export interface TextStyle {
  color?: string;
  size?: number;
  weight?: 'normal' | 'bold' | '600';
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Verschiebung in Pixeln (x nach rechts, y nach unten). */
  offset?: readonly [number, number];
  /** Heller Rand um die Schrift für bessere Lesbarkeit (Standard: ja). */
  halo?: boolean;
  /** Kursive Mathe-Schrift (für Variablen und Punktnamen). */
  math?: boolean;
}

export interface PointStyle {
  color?: string;
  radius?: number;
  /** Hohler Punkt (z. B. für ausgeschlossene Werte). */
  hollow?: boolean;
}

export interface Handle {
  /** Aktuelle Position in Weltkoordinaten. */
  get(): readonly [number, number];
  /** Neue Position beim Ziehen (in Weltkoordinaten). */
  set(x: number, y: number): void;
  enabled?: () => boolean;
  color?: () => string;
  /** Nur waagerecht/senkrecht ziehbar. */
  axis?: 'x' | 'y' | 'both';
}

type Point = readonly [number, number];

/** Mögliche Lage einer Achsbeschriftung (Pixel, Ausrichtung wie im Canvas). */
interface LabelSpot {
  x: number;
  y: number;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
}

interface PendingLabel {
  label: string;
  font: (px: number) => string;
  size: number;
  width: number;
  spots: LabelSpot[];
}

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 40;

/* ------------------------------------------------------------------ */
/* Koordinatensystem                                                   */
/* ------------------------------------------------------------------ */

/**
 * Ein Koordinatensystem auf einer Zeichenfläche mit Gitter, Achsen,
 * Funktionsgraphen, Punkten und Texten – inklusive Zoomen, Verschieben und
 * ziehbaren Punkten (Maus, Finger, Stift).
 *
 * Gezeichnet wird im „Immediate Mode“: In `render()` der Simulation wird
 * zwischen `begin()` und `end()` alles neu gezeichnet.
 */
export class Plot implements PointerTarget {
  readonly fmt: Formatter;
  private options: PlotOptions;
  private center: [number, number];
  private zoom = 1;
  private sx = 1;
  private sy = 1;
  private r: Rect = { x: 0, y: 0, w: 1, h: 1 };
  private handles: Handle[] = [];
  private hoveredHandle: Handle | null = null;
  private pointers = new Map<number, { px: number; py: number }>();
  private drag:
    | { mode: 'handle'; handle: Handle; offset: [number, number] }
    | { mode: 'pan'; last: [number, number] }
    | { mode: 'pinch'; distance: number; zoom: number; world: [number, number] }
    | null = null;
  private controlsEl: HTMLElement | null = null;
  /** Im aktuellen Frame gezeichnete Kurven (Pixel, je Linienzug x0, y0, x1, y1, …) – zum Ausweichen der Achsbeschriftung. */
  private ink: number[][] = [];
  /** Gezeichnete Punkte als Kreise (x, y, Radius in Pixeln). */
  private dots: number[] = [];
  /** Belegte Rechtecke (Achsenzahlen, Texte). */
  private taken: Rect[] = [];
  /** Achsbeschriftungen, die erst in `end()` über den Kurven gezeichnet werden. */
  private pendingLabels: PendingLabel[] = [];
  private recordInk = true;
  /** Zwischen `begin()` und `end()`? Nur dann wird für das Ausweichen mitgeschrieben. */
  private inFrame = false;
  private viewChanged = false;
  private padded: {
    x: readonly [number, number];
    y: readonly [number, number];
    padding: { left?: number; right?: number; top?: number; bottom?: number };
  } | null = null;

  constructor(
    readonly surface: Surface,
    options: PlotOptions,
  ) {
    this.options = options;
    this.fmt = new Formatter(surface.lang);
    this.center = this.initialCenter();
    surface.addTarget(this);
    if (options.controls ?? options.zoom ?? true) this.createControls();
    this.resize();
  }

  /* ---------- Ansicht ---------- */

  get rect(): Rect {
    return this.r;
  }

  /** Pixel pro Einheit in x- bzw. y-Richtung. */
  get scale(): { x: number; y: number } {
    return { x: this.sx, y: this.sy };
  }

  get bounds(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    const [cx, cy] = this.center;
    return {
      xMin: cx - this.r.w / 2 / this.sx,
      xMax: cx + this.r.w / 2 / this.sx,
      yMin: cy - this.r.h / 2 / this.sy,
      yMax: cy + this.r.h / 2 / this.sy,
    };
  }

  /** Hat die Person gezoomt oder verschoben? */
  get isViewChanged(): boolean {
    return this.viewChanged;
  }

  resize(): void {
    const { width, height } = this.surface;
    this.r = this.options.region ? this.options.region(width, height) : { x: 0, y: 0, w: width, h: height };
    if (this.padded) this.applyPadded();
    else this.updateScale();
    this.positionControls();
  }

  resetView(): void {
    this.applyInitialView();
    this.surface.host.requestRender();
  }

  private applyInitialView(): void {
    this.zoom = 1;
    this.center = this.initialCenter();
    this.viewChanged = false;
    this.updateScale();
  }

  /** Zoomt um `factor` um einen Pixelpunkt (Standard: Mitte). */
  zoomBy(factor: number, px = this.r.x + this.r.w / 2, py = this.r.y + this.r.h / 2): void {
    const [wx, wy] = this.toWorld(px, py);
    this.zoom = clamp(this.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    this.updateScale();
    this.center = [wx - (px - this.r.x - this.r.w / 2) / this.sx, wy + (py - this.r.y - this.r.h / 2) / this.sy];
    this.viewChanged = true;
    this.surface.host.requestRender();
  }

  /**
   * Setzt den sichtbaren Bereich neu (z. B. abhängig von der Größe der
   * Zeichenfläche). Darf auch während `render()` aufgerufen werden.
   */
  setRange(x: readonly [number, number], y: readonly [number, number]): void {
    this.padded = null;
    this.options = { ...this.options, x, y };
    this.applyInitialView();
  }

  /**
   * Wie `setRange`, lässt aber am Rand Platz in Pixeln – z. B. links für die
   * Zahlen an der y-Achse in Diagrammen. Bleibt bei Größenänderungen erhalten.
   * Gedacht für Diagramme mit `equalAspect: false`.
   */
  setRangePadded(
    x: readonly [number, number],
    y: readonly [number, number],
    padding: { left?: number; right?: number; top?: number; bottom?: number },
  ): void {
    this.padded = { x, y, padding };
    this.applyPadded();
  }

  private applyPadded(): void {
    if (!this.padded) return;
    const { x, y, padding } = this.padded;
    const { left = 0, right = 0, top = 0, bottom = 0 } = padding;
    const ux = (x[1] - x[0]) / Math.max(1, this.r.w - left - right);
    const uy = (y[1] - y[0]) / Math.max(1, this.r.h - top - bottom);
    this.options = { ...this.options, x: [x[0] - left * ux, x[1] + right * ux], y: [y[0] - bottom * uy, y[1] + top * uy] };
    this.applyInitialView();
  }

  private initialCenter(): [number, number] {
    const { x, y } = this.options;
    return [(x[0] + x[1]) / 2, (y[0] + y[1]) / 2];
  }

  private updateScale(): void {
    const { x, y, equalAspect = true } = this.options;
    const fx = this.r.w / (x[1] - x[0]);
    const fy = this.r.h / (y[1] - y[0]);
    if (equalAspect) {
      const s = Math.min(fx, fy) * this.zoom;
      this.sx = s;
      this.sy = s;
    } else {
      this.sx = fx * this.zoom;
      this.sy = fy * this.zoom;
    }
  }

  /* ---------- Umrechnung ---------- */

  px(x: number): number {
    return this.r.x + this.r.w / 2 + (x - this.center[0]) * this.sx;
  }

  py(y: number): number {
    return this.r.y + this.r.h / 2 - (y - this.center[1]) * this.sy;
  }

  toPx(x: number, y: number): [number, number] {
    return [this.px(x), this.py(y)];
  }

  toWorld(px: number, py: number): [number, number] {
    return [
      this.center[0] + (px - this.r.x - this.r.w / 2) / this.sx,
      this.center[1] - (py - this.r.y - this.r.h / 2) / this.sy,
    ];
  }

  /* ---------- Rahmen eines Frames ---------- */

  /** Beginnt das Zeichnen: Bereich ausschneiden und Hintergrund füllen. */
  begin(): CanvasRenderingContext2D {
    const g = this.surface.g;
    this.clearFrameRecords();
    this.inFrame = true;
    g.save();
    g.beginPath();
    g.rect(this.r.x, this.r.y, this.r.w, this.r.h);
    g.clip();
    g.fillStyle = this.surface.theme.bg;
    g.fillRect(this.r.x, this.r.y, this.r.w, this.r.h);
    return g;
  }

  /** Beendet das Zeichnen und markiert ziehbare Punkte. */
  end(): void {
    this.drawAxisLabels();
    this.drawHandles();
    this.surface.g.restore();
    this.clearFrameRecords();
    this.inFrame = false;
  }

  private clearFrameRecords(): void {
    this.ink = [];
    this.dots = [];
    this.taken = [];
    this.pendingLabels = [];
  }

  /* ---------- Gitter und Achsen ---------- */

  /** Achsen-Optionen zur Laufzeit ändern (z. B. Umschalten auf π-Beschriftung). */
  setAxes(axes: { x?: AxisOptions; y?: AxisOptions }): void {
    this.options = {
      ...this.options,
      xAxis: axes.x ?? this.options.xAxis,
      yAxis: axes.y ?? this.options.yAxis,
    };
  }

  private tickStep(axis: 'x' | 'y'): number {
    const opts = axis === 'x' ? this.options.xAxis : this.options.yAxis;
    const scale = axis === 'x' ? this.sx : this.sy;
    const angular = !!(opts?.pi || opts?.degrees);
    const minUnits = Math.max((angular ? 64 : 56) / scale, opts?.minStep ?? 0);
    return angular ? piStep(minUnits) : niceStep(minUnits);
  }

  grid(options: { minor?: boolean } = {}): void {
    const g = this.surface.g;
    const theme = this.surface.theme;
    const { xMin, xMax, yMin, yMax } = this.bounds;
    const sx = this.tickStep('x');
    const sy = this.tickStep('y');
    g.lineWidth = 1;

    if (options.minor ?? true) {
      const angularX = this.options.xAxis?.pi || this.options.xAxis?.degrees;
      const angularY = this.options.yAxis?.pi || this.options.yAxis?.degrees;
      const mx = angularX ? sx / 2 : minorStep(sx);
      const my = angularY ? sy / 2 : minorStep(sy);
      g.strokeStyle = theme.gridMinor;
      g.beginPath();
      if (mx * this.sx >= 10) for (const x of ticksIn(xMin, xMax, mx)) this.vLinePath(x);
      if (my * this.sy >= 10) for (const y of ticksIn(yMin, yMax, my)) this.hLinePath(y);
      g.stroke();
    }

    g.strokeStyle = theme.grid;
    g.beginPath();
    for (const x of ticksIn(xMin, xMax, sx)) this.vLinePath(x);
    for (const y of ticksIn(yMin, yMax, sy)) this.hLinePath(y);
    g.stroke();
  }

  private vLinePath(x: number): void {
    const p = Math.round(this.px(x)) + 0.5;
    this.surface.g.moveTo(p, this.r.y);
    this.surface.g.lineTo(p, this.r.y + this.r.h);
  }

  private hLinePath(y: number): void {
    const p = Math.round(this.py(y)) + 0.5;
    this.surface.g.moveTo(this.r.x, p);
    this.surface.g.lineTo(this.r.x + this.r.w, p);
  }

  private tickLabel(value: number, step: number, opts: AxisOptions): string {
    if (opts.format) return opts.format(value);
    if (opts.degrees) return `${this.fmt.num((value * 180) / Math.PI, 0)}°`;
    if (opts.pi) return formatPiFraction(value, [1, 2, 3, 4, 6, 12]) ?? this.fmt.num(value, 2);
    const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    return this.fmt.num(value, decimals);
  }

  axes(options: AxesOptions = {}): void {
    const g = this.surface.g;
    const blocked = options.blocked ?? [];
    /** Liegt eine Achsenzahl (mit Ausrichtung des Kontexts) in einem Sperrbereich? */
    const isBlocked = (text: string, x: number, y: number, size: number): boolean => {
      if (!blocked.length) return false;
      const q = labelRect({ x, y, align: g.textAlign, baseline: g.textBaseline }, g.measureText(text).width, size);
      return blocked.some((b) => rectsOverlap(q, b));
    };
    const theme = this.surface.theme;
    const { xMin, xMax, yMin, yMax } = this.bounds;
    const r = this.r;
    const xOpts = this.options.xAxis ?? {};
    const yOpts = this.options.yAxis ?? {};

    // Lage der Achsen (am Rand „festkleben“, wenn außerhalb)
    const axisY = clamp(this.py(0), r.y, r.y + r.h);
    const axisX = clamp(this.px(0), r.x, r.x + r.w);
    const xVisible = yMin <= 0 && yMax >= 0;
    const yVisible = xMin <= 0 && xMax >= 0;

    g.strokeStyle = theme.axis;
    g.fillStyle = theme.axis;
    g.lineWidth = 1.5;
    g.beginPath();
    if (xVisible) {
      g.moveTo(r.x, Math.round(axisY) + 0.5);
      g.lineTo(r.x + r.w, Math.round(axisY) + 0.5);
    }
    if (yVisible) {
      g.moveTo(Math.round(axisX) + 0.5, r.y + r.h);
      g.lineTo(Math.round(axisX) + 0.5, r.y);
    }
    g.stroke();

    // Pfeilspitzen
    if (xVisible) this.arrowHeadPx(r.x + r.w - 1, Math.round(axisY) + 0.5, 0);
    if (yVisible) this.arrowHeadPx(Math.round(axisX) + 0.5, r.y + 1, -Math.PI / 2);

    // Teilstriche und Zahlen
    const fontSize = 12;
    g.font = `${fontSize}px ${theme.font}`;
    const stepX = this.tickStep('x');
    const stepY = this.tickStep('y');

    if (xOpts.numbers ?? true) {
      const labelY = xVisible ? axisY + 5 : axisY > r.y + r.h / 2 ? r.y + r.h - fontSize - 6 : r.y + 4;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      for (const x of ticksIn(xMin, xMax, stepX)) {
        if (Math.abs(x) < stepX / 1e6) continue;
        const p = this.px(x);
        if (p < r.x + 12 || p > r.x + r.w - 18) continue;
        if (xVisible) {
          g.beginPath();
          g.moveTo(Math.round(p) + 0.5, axisY - 4);
          g.lineTo(Math.round(p) + 0.5, axisY + 4);
          g.stroke();
          // Teilstrich belegt: Die Achsbeschriftung über dem Achsenende weicht ihm (und damit der letzten Zahl) aus.
          if (this.inFrame) this.taken.push({ x: Math.round(p) - 0.5, y: axisY - 4, w: 2, h: 8 });
        }
        const text = this.tickLabel(x, stepX, xOpts);
        if (!isBlocked(text, p, labelY, fontSize)) this.haloText(text, p, labelY, theme.muted, fontSize);
      }
    }

    if (yOpts.numbers ?? true) {
      const leftSide = !yVisible && axisX > r.x + r.w / 2;
      const labelX = yVisible ? axisX - 6 : leftSide ? r.x + r.w - 6 : r.x + 6;
      g.textAlign = yVisible || leftSide ? 'right' : 'left';
      g.textBaseline = 'middle';
      for (const y of ticksIn(yMin, yMax, stepY)) {
        if (Math.abs(y) < stepY / 1e6) continue;
        const p = this.py(y);
        if (p < r.y + 14 || p > r.y + r.h - 10) continue;
        if (yVisible) {
          g.beginPath();
          g.moveTo(axisX - 4, Math.round(p) + 0.5);
          g.lineTo(axisX + 4, Math.round(p) + 0.5);
          g.stroke();
        }
        const text = this.tickLabel(y, stepY, yOpts);
        if (!isBlocked(text, labelX, p, fontSize)) this.haloText(text, labelX, p, theme.muted, fontSize);
      }
    }

    // Ursprung
    if (xVisible && yVisible) {
      g.textAlign = 'right';
      g.textBaseline = 'top';
      if (!isBlocked('0', axisX - 5, axisY + 5, fontSize)) this.haloText('0', axisX - 5, axisY + 5, theme.muted, fontSize);
    }

    // Achsenbeschriftungen: einzelne Variablen kursiv, längere Texte („t in s“) normal.
    // Gezeichnet wird erst in `end()`: Liegt dort eine Kurve oder ein Punkt, weicht die
    // Beschriftung aus (unter die Achse bzw. links neben die Achse, sonst etwas weiter weg).
    this.pendingLabels = [];
    if (xVisible) {
      const label = xOpts.label ?? 'x';
      const x = r.x + r.w - 6;
      const below = { x, y: axisY + 6, align: 'right' as const, baseline: 'top' as const };
      const above = (k: number) => ({ x, y: axisY - 6 - k * 4, align: 'right' as const, baseline: 'bottom' as const });
      this.queueAxisLabel(label, [above(0), below, ...[1, 2, 3, 4, 5, 6, 7, 8].map(above)]);
    }
    if (yVisible) {
      const label = yOpts.label ?? 'y';
      const y = r.y + 4;
      const right = (k: number) => ({ x: axisX + 9 + k * 6, y, align: 'left' as const, baseline: 'top' as const });
      const left = { x: axisX - 9, y, align: 'right' as const, baseline: 'top' as const };
      this.queueAxisLabel(label, [right(0), left, ...[1, 2, 3, 4, 5, 6, 7, 8].map(right)]);
    }
  }

  /** Merkt eine Achsbeschriftung mit möglichen Lagen (bevorzugte zuerst) für `end()` vor. */
  private queueAxisLabel(label: string, spots: LabelSpot[]): void {
    const theme = this.surface.theme;
    const plain = parseSubText(label).map((part) => part.text).join('');
    const size = plain.length <= 2 ? 15 : 13;
    const font = plain.length <= 2 ? (px: number) => `italic ${px}px ${theme.mathFont}` : (px: number) => `600 ${px}px ${theme.font}`;
    const g = this.surface.g;
    g.save();
    g.textAlign = 'left';
    const width = label.includes('_') ? measureRichText(g, label, font, size) : ((g.font = font(size)), g.measureText(label).width);
    g.restore();
    this.pendingLabels.push({ label, font, size, width, spots });
  }

  /** Zeichnet die vorgemerkten Achsbeschriftungen an der ersten freien Stelle. */
  private drawAxisLabels(): void {
    const g = this.surface.g;
    const theme = this.surface.theme;
    for (const item of this.pendingLabels) {
      const rects = item.spots.map((spot) => labelRect(spot, item.width, item.size));
      const inside = (q: Rect) => q.x >= this.r.x && q.y >= this.r.y && q.x + q.w <= this.r.x + this.r.w && q.y + q.h <= this.r.y + this.r.h;
      let index = rects.findIndex((q, i) => (i === 0 || inside(q)) && !this.isOccupied(q));
      if (index < 0) index = 0;
      const spot = item.spots[index]!;
      g.save();
      g.globalAlpha = 1;
      g.setLineDash([]);
      g.font = item.font(item.size);
      g.textAlign = spot.align;
      g.textBaseline = spot.baseline;
      if (item.label.includes('_')) drawRichText(g, item.label, spot.x, spot.y, { font: item.font, size: item.size, color: theme.text, halo: theme.bg, haloWidth: 3 });
      else this.haloText(item.label, spot.x, spot.y, theme.text);
      g.restore();
      this.taken.push(rects[index]!);
    }
    this.pendingLabels = [];
  }

  /** Liegt im Rechteck (mit kleinem Abstand) eine Kurve, ein Punkt, eine Zahl oder ein Text? */
  private isOccupied(q: Rect): boolean {
    const m = 3;
    const box = { x: q.x - m, y: q.y - m, w: q.w + 2 * m, h: q.h + 2 * m };
    for (const t of this.taken) if (t.x < box.x + box.w && t.x + t.w > box.x && t.y < box.y + box.h && t.y + t.h > box.y) return true;
    for (let i = 0; i < this.dots.length; i += 3) {
      const [cx, cy, rad] = [this.dots[i]!, this.dots[i + 1]!, this.dots[i + 2]!];
      const dx = Math.max(box.x - cx, 0, cx - box.x - box.w);
      const dy = Math.max(box.y - cy, 0, cy - box.y - box.h);
      if (dx * dx + dy * dy < rad * rad) return true;
    }
    for (const line of this.ink) {
      for (let i = 0; i + 3 < line.length; i += 2) {
        if (segmentHitsRect(line[i]!, line[i + 1]!, line[i + 2]!, line[i + 3]!, box)) return true;
      }
    }
    return false;
  }

  private haloText(text: string, x: number, y: number, color: string, reserve = 0): void {
    const g = this.surface.g;
    if (reserve && this.inFrame) this.taken.push(labelRect({ x, y, align: g.textAlign, baseline: g.textBaseline }, g.measureText(text).width, reserve));
    g.save();
    g.lineWidth = 3;
    g.lineJoin = 'round';
    g.strokeStyle = this.surface.theme.bg;
    g.strokeText(text, x, y);
    g.fillStyle = color;
    g.fillText(text, x, y);
    g.restore();
  }

  private arrowHeadPx(x: number, y: number, angle: number, size = 9): void {
    const g = this.surface.g;
    g.save();
    g.translate(x, y);
    g.rotate(angle);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-size, -size * 0.45);
    g.lineTo(-size, size * 0.45);
    g.closePath();
    g.fill();
    g.restore();
  }

  /* ---------- Zeichenwerkzeuge ---------- */

  private applyStroke(style: StrokeStyle, fallbackColor: string, fallbackWidth = 2): void {
    const g = this.surface.g;
    g.strokeStyle = style.color ?? fallbackColor;
    g.lineWidth = style.width ?? fallbackWidth;
    g.setLineDash(style.dash ?? []);
    g.globalAlpha = style.alpha ?? 1;
    g.lineJoin = 'round';
    g.lineCap = 'round';
  }

  private resetStyle(): void {
    const g = this.surface.g;
    g.setLineDash([]);
    g.globalAlpha = 1;
  }

  /** Funktionsgraph y = f(x); Sprünge und Definitionslücken werden erkannt. */
  fn(f: (x: number) => number, style: StrokeStyle & { from?: number; to?: number } = {}): void {
    const { xMin, xMax } = this.bounds;
    const from = Math.max(xMin, style.from ?? -Infinity);
    const to = Math.min(xMax, style.to ?? Infinity);
    if (!(to > from)) return;
    const g = this.surface.g;
    const n = Math.max(2, Math.ceil(((to - from) * this.sx) / 1.5));
    const limit = this.r.h * 4;
    this.applyStroke(style, this.surface.theme.series[0]!, 2.5);
    g.beginPath();
    let pen = false;
    let lastPy = 0;
    let trace: number[] = [];
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      const y = f(x);
      if (!Number.isFinite(y)) {
        pen = false;
        continue;
      }
      const py = clamp(this.py(y), this.r.y - limit, this.r.y + this.r.h + limit);
      const px = this.px(x);
      if (pen && Math.abs(py - lastPy) > this.r.h * 1.5) pen = false;
      if (pen) g.lineTo(px, py);
      else g.moveTo(px, py);
      if (!pen && trace.length) {
        if (this.inFrame) this.ink.push(trace);
        trace = [];
      }
      trace.push(px, py);
      pen = true;
      lastPy = py;
    }
    if (trace.length && this.inFrame) this.ink.push(trace);
    g.stroke();
    this.resetStyle();
  }

  /** Kurve in Parameterform (x(t), y(t)). */
  parametric(
    fx: (t: number) => number,
    fy: (t: number) => number,
    t0: number,
    t1: number,
    style: StrokeStyle & { samples?: number } = {},
  ): void {
    const n = style.samples ?? 300;
    const points: Point[] = [];
    for (let i = 0; i <= n; i++) {
      const tt = t0 + ((t1 - t0) * i) / n;
      points.push([fx(tt), fy(tt)]);
    }
    this.polyline(points, style);
  }

  polyline(points: readonly Point[], style: StrokeStyle = {}): void {
    if (points.length < 2) return;
    const g = this.surface.g;
    if (this.recordInk && this.inFrame) this.ink.push(points.flatMap(([x, y]) => [this.px(x), this.py(y)]));
    this.applyStroke(style, this.surface.theme.series[0]!);
    g.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? g.moveTo(this.px(x), this.py(y)) : g.lineTo(this.px(x), this.py(y))));
    g.stroke();
    this.resetStyle();
  }

  segment(a: Point, b: Point, style: StrokeStyle = {}): void {
    this.polyline([a, b], style);
  }

  /** Unendliche Gerade durch zwei Punkte (auf den sichtbaren Bereich zugeschnitten). */
  line(a: Point, b: Point, style: StrokeStyle = {}): void {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    if (len === 0) return;
    const { xMin, xMax, yMin, yMax } = this.bounds;
    const reach = Math.hypot(xMax - xMin, yMax - yMin) + Math.hypot(a[0] - (xMin + xMax) / 2, a[1] - (yMin + yMax) / 2);
    const ux = dx / len;
    const uy = dy / len;
    // Hilfslinien über den ganzen Bereich zählen nicht als Kurve (Achsbeschriftung weicht ihnen nicht aus).
    this.recordInk = false;
    this.segment([a[0] - ux * reach, a[1] - uy * reach], [a[0] + ux * reach, a[1] + uy * reach], style);
    this.recordInk = true;
  }

  vline(x: number, style: StrokeStyle = {}): void {
    this.line([x, 0], [x, 1], style);
  }

  hline(y: number, style: StrokeStyle = {}): void {
    this.line([0, y], [1, y], style);
  }

  /** Pfeil von a nach b. */
  arrow(a: Point, b: Point, style: StrokeStyle & { head?: number } = {}): void {
    this.segment(a, b, style);
    const [ax, ay] = this.toPx(a[0], a[1]);
    const [bx, by] = this.toPx(b[0], b[1]);
    if (Math.hypot(bx - ax, by - ay) < 2) return;
    const g = this.surface.g;
    g.fillStyle = style.color ?? this.surface.theme.series[0]!;
    g.globalAlpha = style.alpha ?? 1;
    this.arrowHeadPx(bx, by, Math.atan2(by - ay, bx - ax), style.head ?? 10);
    this.resetStyle();
  }

  polygon(points: readonly Point[], style: FillStyle = {}): void {
    if (points.length < 2) return;
    const g = this.surface.g;
    g.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? g.moveTo(this.px(x), this.py(y)) : g.lineTo(this.px(x), this.py(y))));
    g.closePath();
    this.fillAndStroke(style);
  }

  /** Kreis mit Radius in Weltkoordinaten. */
  circle(cx: number, cy: number, radius: number, style: FillStyle = {}): void {
    const g = this.surface.g;
    g.beginPath();
    g.ellipse(this.px(cx), this.py(cy), Math.abs(radius * this.sx), Math.abs(radius * this.sy), 0, 0, Math.PI * 2);
    this.fillAndStroke(style);
  }

  /** Kreisbogen; Winkel im Bogenmaß, mathematisch positiv (gegen den Uhrzeigersinn). */
  arc(cx: number, cy: number, radius: number, from: number, to: number, style: FillStyle & { sector?: boolean } = {}): void {
    const g = this.surface.g;
    const [px, py] = this.toPx(cx, cy);
    g.beginPath();
    if (style.sector) g.moveTo(px, py);
    g.ellipse(px, py, Math.abs(radius * this.sx), Math.abs(radius * this.sy), 0, -from, -to, to > from);
    if (style.sector) g.closePath();
    this.fillAndStroke(style);
  }

  /** Kreisbogen mit Radius in Pixeln (z. B. Winkelmarkierungen). */
  arcPx(cx: number, cy: number, radiusPx: number, from: number, to: number, style: FillStyle & { sector?: boolean } = {}): void {
    const g = this.surface.g;
    const [px, py] = this.toPx(cx, cy);
    g.beginPath();
    if (style.sector) g.moveTo(px, py);
    g.arc(px, py, radiusPx, -from, -to, to > from);
    if (style.sector) g.closePath();
    this.fillAndStroke(style);
  }

  /** Fläche zwischen zwei Funktionsgraphen auf [from, to]. */
  fillBetween(f: (x: number) => number, g2: (x: number) => number, from: number, to: number, style: FillStyle = {}): void {
    const n = Math.max(2, Math.ceil(((to - from) * this.sx) / 2));
    const top: Point[] = [];
    const bottom: Point[] = [];
    for (let i = 0; i <= n; i++) {
      const xx = from + ((to - from) * i) / n;
      top.push([xx, f(xx)]);
      bottom.push([xx, g2(xx)]);
    }
    this.polygon([...top, ...bottom.reverse()], style);
  }

  private fillAndStroke(style: FillStyle): void {
    const g = this.surface.g;
    g.globalAlpha = style.alpha ?? 1;
    if (style.fill) {
      g.fillStyle = style.fill;
      g.fill();
    }
    if (style.stroke) {
      g.globalAlpha = 1;
      g.strokeStyle = style.stroke;
      g.lineWidth = style.width ?? 2;
      g.setLineDash(style.dash ?? []);
      g.stroke();
    }
    this.resetStyle();
  }

  point(x: number, y: number, style: PointStyle = {}): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const g = this.surface.g;
    const color = style.color ?? this.surface.theme.series[0]!;
    const radius = style.radius ?? 5;
    if (this.inFrame) this.dots.push(this.px(x), this.py(y), radius + 1);
    g.beginPath();
    g.arc(this.px(x), this.py(y), radius, 0, Math.PI * 2);
    if (style.hollow) {
      g.fillStyle = this.surface.theme.bg;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = color;
      g.stroke();
    } else {
      g.fillStyle = color;
      g.fill();
      g.lineWidth = 1.5;
      g.strokeStyle = this.surface.theme.bg;
      g.stroke();
    }
  }

  /**
   * Text an einer Weltkoordinate. Minuszeichen werden typografisch korrekt gesetzt.
   * `_` setzt wie bei `subText` einen tiefgestellten Index (`F_R`, `F_{G,1}`);
   * `\_` (im Quelltext `'\\_'`) steht für einen echten Unterstrich.
   */
  text(x: number, y: number, text: string, style: TextStyle = {}): void {
    this.textPx(this.px(x), this.py(y), text, style);
  }

  /** Text an einer Pixelposition (Schreibweise wie bei `text`). */
  textPx(px: number, py: number, text: string, style: TextStyle = {}): void {
    const g = this.surface.g;
    const theme = this.surface.theme;
    const size = style.size ?? 14;
    const family = style.math ? theme.mathFont : theme.font;
    const fontStyle = style.math ? 'italic ' : '';
    const font = (px: number) => `${fontStyle}${style.weight ?? 'normal'} ${px}px ${family}`;
    g.font = font(size);
    g.textAlign = style.align ?? 'left';
    g.textBaseline = style.baseline ?? 'alphabetic';
    const [dx, dy] = style.offset ?? [0, 0];
    const content = text.replace(/-(?=[\d.,])/g, MINUS);
    if (content.includes('_')) {
      const width = drawRichText(g, content, px + dx, py + dy, { font, size, halo: (style.halo ?? true) ? theme.bg : null, haloWidth: 4, color: style.color ?? theme.text });
      if (this.inFrame) this.taken.push(labelRect({ x: px + dx, y: py + dy, align: g.textAlign, baseline: g.textBaseline }, width, size));
      return;
    }
    if (this.inFrame) this.taken.push(labelRect({ x: px + dx, y: py + dy, align: g.textAlign, baseline: g.textBaseline }, g.measureText(content).width, size));
    if (style.halo ?? true) {
      g.lineWidth = 4;
      g.lineJoin = 'round';
      g.strokeStyle = theme.bg;
      g.strokeText(content, px + dx, py + dy);
    }
    g.fillStyle = style.color ?? theme.text;
    g.fillText(content, px + dx, py + dy);
  }

  /* ---------- Ziehbare Punkte ---------- */

  /** Macht einen Punkt ziehbar. Gibt eine Funktion zum Entfernen zurück. */
  addHandle(handle: Handle): () => void {
    this.handles.push(handle);
    return () => {
      this.handles = this.handles.filter((h) => h !== handle);
    };
  }

  private isEnabled(handle: Handle): boolean {
    return handle.enabled ? handle.enabled() : true;
  }

  private handleAt(px: number, py: number, touch: boolean): Handle | null {
    const radius = touch ? 26 : 15;
    let best: Handle | null = null;
    let bestDist = radius;
    for (const handle of this.handles) {
      if (!this.isEnabled(handle)) continue;
      const [hx, hy] = handle.get();
      const d = Math.hypot(this.px(hx) - px, this.py(hy) - py);
      if (d <= bestDist) {
        best = handle;
        bestDist = d;
      }
    }
    return best;
  }

  private drawHandles(): void {
    const g = this.surface.g;
    for (const handle of this.handles) {
      if (!this.isEnabled(handle)) continue;
      const [hx, hy] = handle.get();
      if (!Number.isFinite(hx) || !Number.isFinite(hy)) continue;
      const active = this.hoveredHandle === handle || (this.drag?.mode === 'handle' && this.drag.handle === handle);
      const color = handle.color?.() ?? this.surface.theme.series[0]!;
      g.beginPath();
      g.arc(this.px(hx), this.py(hy), active ? 14 : 11, 0, Math.PI * 2);
      g.globalAlpha = active ? 0.28 : 0.16;
      g.fillStyle = color;
      g.fill();
      g.globalAlpha = 1;
    }
  }

  /* ---------- Zeigerereignisse ---------- */

  contains(px: number, py: number): boolean {
    const r = this.r;
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  pointerDown(p: SurfacePointer): boolean {
    this.pointers.set(p.id, { px: p.px, py: p.py });

    if (this.pointers.size === 2 && (this.options.zoom ?? true)) {
      const [a, b] = [...this.pointers.values()] as [{ px: number; py: number }, { px: number; py: number }];
      this.drag = {
        mode: 'pinch',
        distance: Math.hypot(a.px - b.px, a.py - b.py) || 1,
        zoom: this.zoom,
        world: this.toWorld((a.px + b.px) / 2, (a.py + b.py) / 2),
      };
      return true;
    }
    if (this.pointers.size > 1) return true;

    const handle = this.handleAt(p.px, p.py, p.type === 'touch');
    if (handle) {
      const [hx, hy] = handle.get();
      const [wx, wy] = this.toWorld(p.px, p.py);
      this.drag = { mode: 'handle', handle, offset: [hx - wx, hy - wy] };
      this.surface.setCursor('grabbing');
      this.surface.host.requestRender();
      return true;
    }
    if (this.options.pan ?? true) {
      this.drag = { mode: 'pan', last: [p.px, p.py] };
      this.surface.setCursor('grabbing');
      return true;
    }
    this.pointers.delete(p.id);
    return false;
  }

  pointerMove(p: SurfacePointer): void {
    if (!this.pointers.has(p.id)) return;
    this.pointers.set(p.id, { px: p.px, py: p.py });
    const drag = this.drag;
    if (!drag) return;

    if (drag.mode === 'handle') {
      const [wx, wy] = this.toWorld(p.px, p.py);
      const [hx, hy] = drag.handle.get();
      const axis = drag.handle.axis ?? 'both';
      const nx = axis === 'y' ? hx : wx + drag.offset[0];
      const ny = axis === 'x' ? hy : wy + drag.offset[1];
      drag.handle.set(nx, ny);
      this.surface.host.requestRender();
    } else if (drag.mode === 'pan') {
      const dx = p.px - drag.last[0];
      const dy = p.py - drag.last[1];
      drag.last = [p.px, p.py];
      this.center = [this.center[0] - dx / this.sx, this.center[1] + dy / this.sy];
      this.viewChanged = true;
      this.surface.host.requestRender();
    } else if (drag.mode === 'pinch' && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()] as [{ px: number; py: number }, { px: number; py: number }];
      const distance = Math.hypot(a.px - b.px, a.py - b.py) || 1;
      const mx = (a.px + b.px) / 2;
      const my = (a.py + b.py) / 2;
      this.zoom = clamp((drag.zoom * distance) / drag.distance, MIN_ZOOM, MAX_ZOOM);
      this.updateScale();
      this.center = [
        drag.world[0] - (mx - this.r.x - this.r.w / 2) / this.sx,
        drag.world[1] + (my - this.r.y - this.r.h / 2) / this.sy,
      ];
      this.viewChanged = true;
      this.surface.host.requestRender();
    }
  }

  pointerUp(p: SurfacePointer): void {
    this.pointers.delete(p.id);
    if (this.pointers.size === 0) {
      this.drag = null;
      this.hover(p);
      this.surface.host.requestRender();
    } else if (this.drag?.mode === 'pinch') {
      const [rest] = [...this.pointers.values()];
      this.drag = rest && (this.options.pan ?? true) ? { mode: 'pan', last: [rest.px, rest.py] } : null;
    }
  }

  hover(p: SurfacePointer | null): void {
    if (this.drag) return;
    const handle = p ? this.handleAt(p.px, p.py, false) : null;
    if (handle !== this.hoveredHandle) {
      this.hoveredHandle = handle;
      this.surface.host.requestRender();
    }
    if (!p) return;
    this.surface.setCursor(handle ? 'grab' : (this.options.pan ?? true) ? 'move' : '');
  }

  wheel(px: number, py: number, deltaY: number): boolean {
    if (!(this.options.zoom ?? true)) return false;
    this.zoomBy(Math.exp(-deltaY * 0.0025), px, py);
    return true;
  }

  /* ---------- Zoom-Schaltflächen ---------- */

  private createControls(): void {
    const lang = this.surface.lang;
    const el = document.createElement('div');
    el.className = 'plot-controls';
    const button = (label: string, icon: string, action: () => void) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'plot-controls__btn';
      b.title = label;
      b.setAttribute('aria-label', label);
      b.innerHTML = icon;
      b.addEventListener('click', action);
      el.append(b);
    };
    const svg = (path: string) =>
      `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    button(t(lang, 'sim.zoomIn'), svg('M12 5v14M5 12h14'), () => this.zoomBy(1.4));
    button(t(lang, 'sim.zoomOut'), svg('M5 12h14'), () => this.zoomBy(1 / 1.4));
    button(t(lang, 'sim.viewReset'), svg('M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4'), () => this.resetView());
    this.surface.host.stage.append(el);
    this.controlsEl = el;
  }

  private positionControls(): void {
    if (!this.controlsEl) return;
    const r = this.r;
    const right = this.surface.width - (r.x + r.w);
    this.controlsEl.style.top = `${r.y + 8}px`;
    this.controlsEl.style.right = `${right + 8}px`;
  }
}

/* ------------------------------------------------------------------ */
/* Text mit tiefgestelltem Index                                       */
/* ------------------------------------------------------------------ */

/** Größe und Absenkung des Index wie bei `subText` in `draw.ts`. */
const SUB_SCALE = 0.74;
const SUB_SHIFT = 0.28;

/**
 * Zeichnet Text mit Indizes (`F_R`, `F_{G,1}`, `\_` = Unterstrich) mit der
 * aktuellen Ausrichtung (`textAlign`, `textBaseline`) des Kontexts.
 * `font(px)` liefert die Schriftangabe für eine Größe in Pixeln.
 * Gibt die Gesamtbreite zurück. Der Zustand des Kontexts bleibt erhalten.
 */
export function drawRichText(
  g: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  opts: { font: (px: number) => string; size: number; color: string; halo?: string | null; haloWidth?: number },
): number {
  const parts = parseSubText(value);
  const subSize = Math.round(opts.size * SUB_SCALE * 2) / 2;
  const fontOf = (sub: boolean) => opts.font(sub ? subSize : opts.size);
  let total = 0;
  for (const part of parts) {
    g.font = fontOf(part.sub);
    total += g.measureText(part.text).width;
  }
  const align = g.textAlign;
  const left = align === 'left' || align === 'start' ? x : align === 'right' || align === 'end' ? x - total : x - total / 2;
  const shift = opts.size * SUB_SHIFT;
  g.save();
  g.textAlign = 'left';
  for (const pass of opts.halo ? ['halo', 'fill'] : ['fill']) {
    let cx = left;
    for (const part of parts) {
      g.font = fontOf(part.sub);
      const yy = y + (part.sub ? shift : 0);
      if (pass === 'halo') {
        g.lineJoin = 'round';
        g.lineWidth = opts.haloWidth ?? 4;
        g.strokeStyle = opts.halo!;
        g.strokeText(part.text, cx, yy);
      } else {
        g.fillStyle = opts.color;
        g.fillText(part.text, cx, yy);
      }
      cx += g.measureText(part.text).width;
    }
  }
  g.restore();
  return total;
}

/** Breite eines Textes mit Indizes (wie `drawRichText`). */
function measureRichText(g: CanvasRenderingContext2D, value: string, font: (px: number) => string, size: number): number {
  const subSize = Math.round(size * SUB_SCALE * 2) / 2;
  let total = 0;
  for (const part of parseSubText(value)) {
    g.font = font(part.sub ? subSize : size);
    total += g.measureText(part.text).width;
  }
  return total;
}

/** Ungefähres Rechteck eines Textes der Breite `width` und Schriftgröße `size` an einer Lage. */
export function labelRect(spot: LabelSpot, width: number, size: number): Rect {
  const { x, y, align, baseline } = spot;
  const left = align === 'right' || align === 'end' ? x - width : align === 'center' ? x - width / 2 : x;
  const top =
    baseline === 'top' || baseline === 'hanging' ? y : baseline === 'middle' ? y - size / 2 : baseline === 'bottom' || baseline === 'ideographic' ? y - size : y - size * 0.8;
  return { x: left, y: top, w: width, h: size };
}

/** Überlappen sich zwei Rechtecke (Berühren der Kanten zählt nicht)? */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Schneidet die Strecke (x1|y1)–(x2|y2) das Rechteck? (Liang-Barsky) */
export function segmentHitsRect(x1: number, y1: number, x2: number, y2: number, q: Rect): boolean {
  if (![x1, y1, x2, y2].every(Number.isFinite)) return false;
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, x1 - q.x],
    [dx, q.x + q.w - x1],
    [-dy, y1 - q.y],
    [dy, q.y + q.h - y1],
  ];
  for (const [p, d] of edges) {
    if (p === 0) {
      if (d < 0) return false;
    } else {
      const t = d / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}
