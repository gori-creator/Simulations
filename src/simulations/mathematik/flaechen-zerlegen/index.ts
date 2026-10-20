import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import {
  bounds,
  cutLines,
  doubled,
  envelope,
  figure,
  footOutside,
  formulaArea,
  halfTurnCopy,
  isRectangle,
  pivot,
  rectCells,
  rectPieces,
  rotatedCopy,
  strips,
  targetRect,
  trapezoidTriangles,
  type Dims,
  type Kind,
  type Piece,
  type Poly,
  type Pt,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Teilfortschritt von `u` im Abschnitt [a, b] (0 … 1). */
const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a), 0, 1);

type Step = 'fig' | 'erg' | 'rect' | 'drei';
const isFig =
  (...k: Kind[]) =>
  (v: Record<string, unknown>) =>
    k.includes(v.fig as Kind);

const G_MAX = 10;
const H_MAX = 8;
const S_MIN = -5;
const S_MAX = 10;

/**
 * Flächeninhalt von Parallelogramm, Dreieck und Trapez durch Zerlegen und
 * Ergänzen (Jahrgangsstufe 6): Figur auf Kästchenpapier mit ziehbaren Ecken,
 * Grundseite und Höhe beschriftet. Das Parallelogramm wird entlang der Höhe
 * zerlegt und zum Rechteck umgelegt (bei starker Neigung in mehreren
 * Streifen), Dreieck und Trapez werden durch eine um 180° gedrehte Kopie zum
 * Parallelogramm ergänzt, das Trapez alternativ in zwei Dreiecke zerlegt.
 * Dazu Kästchen zählen als Kontrolle und die Scherung: Spitze parallel zur
 * Grundseite verschieben – der Flächeninhalt bleibt.
 */
export default defineSimulation({
  id: 'flaechen-zerlegen',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.62 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fig',
      type: 'choice',
      label: L('Figur', 'Shape'),
      options: [
        { value: 'para', label: L('Parallelogramm', 'Parallelogram') },
        { value: 'tri', label: L('Dreieck', 'Triangle') },
        { value: 'trap', label: L('Trapez', 'Trapezium') },
      ],
      default: 'para',
    },
    { key: 'sp', type: 'choice', label: L('Herleitung', 'Derivation'), options: [{ value: 'fig', label: L('Parallelogramm', 'Parallelogram') }, { value: 'rect', label: L('Rechteck', 'Rectangle') }], default: 'fig', visibleIf: isFig('para') },
    {
      key: 'st',
      type: 'choice',
      label: L('Herleitung', 'Derivation'),
      options: [
        { value: 'fig', label: L('Dreieck', 'Triangle') },
        { value: 'erg', label: L('Verdoppelt', 'Doubled') },
        { value: 'rect', label: L('Rechteck', 'Rectangle') },
      ],
      default: 'fig',
      visibleIf: isFig('tri'),
    },
    {
      key: 'sz',
      type: 'choice',
      label: L('Herleitung', 'Derivation'),
      options: [
        { value: 'fig', label: L('Trapez', 'Trapezium') },
        { value: 'erg', label: L('Verdoppelt', 'Doubled') },
        { value: 'rect', label: L('Rechteck', 'Rectangle') },
        { value: 'drei', label: L('2 Dreiecke', '2 triangles') },
      ],
      default: 'fig',
      visibleIf: isFig('trap'),
    },
    { key: 'g', type: 'number', label: L('Grundseite g', 'Base g'), min: 1, max: G_MAX, step: 1, default: 6, unit: 'cm', visibleIf: isFig('para', 'tri') },
    { key: 'a', type: 'number', label: L('Grundseite a (unten)', 'Base a (bottom)'), min: 1, max: G_MAX, step: 1, default: 7, unit: 'cm', visibleIf: isFig('trap') },
    { key: 'c', type: 'number', label: L('Grundseite c (oben)', 'Base c (top)'), min: 0, max: G_MAX, step: 1, default: 3, unit: 'cm', visibleIf: isFig('trap') },
    { key: 'h', type: 'number', label: L('Höhe h', 'Height h'), min: 1, max: H_MAX, step: 1, default: 4, unit: 'cm' },
    {
      key: 's',
      type: 'number',
      label: L('Versatz der oberen Ecke', 'Offset of the top corner'),
      help: L('So weit liegt D (beim Dreieck C) rechts von A. Negativ: nach links.', 'How far D (C for the triangle) lies to the right of A. Negative: to the left.'),
      min: S_MIN,
      max: S_MAX,
      step: 1,
      default: 2,
      unit: 'cm',
    },
    {
      key: 'sch',
      type: 'boolean',
      label: L('Obere Ecken nur parallel zur Grundseite ziehen', 'Drag the top corners only parallel to the base'),
      help: L('Die Höhe bleibt fest – und damit auch der Flächeninhalt.', 'The height stays fixed – and so does the area.'),
      default: false,
    },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Kästchen (1 Kästchen = 1 cm²)', 'Grid squares (1 square = 1 cm²)'), default: true },
    { key: 'hgt', type: 'boolean', group: 'view', label: L('Höhe einzeichnen', 'Draw the height'), default: true },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Flächeninhalt sofort zeigen', 'Show the area right away'),
      help: L('Ausgeschaltet erscheint das Ergebnis erst nach dem Zerlegen, Ergänzen oder Zählen.', 'When off, the result only appears after decomposing, completing or counting.'),
      default: true,
    },
  ],
  actions: [
    { id: 'go', label: L('Zerlegen und verschieben', 'Cut and move'), primary: true },
    { id: 'split', label: L('In zwei Dreiecke zerlegen', 'Split into two triangles'), visibleIf: isFig('trap') },
    { id: 'count', label: L('Kästchen zählen', 'Count the squares') },
    { id: 'shear', label: L('Spitze verschieben', 'Slide the top') },
  ],
  readouts: [
    { key: 'fig', label: L('Figur', 'Shape') },
    { key: 'area', label: L('Flächeninhalt', 'Area'), spoiler: true },
    { key: 'way', label: L('Herleitung', 'Derivation'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Parallelogramm → Rechteck', 'Parallelogram → rectangle'), values: {} },
    { id: 'steil', label: L('Stark geneigtes Parallelogramm', 'Steeply slanted parallelogram'), values: { g: 3, h: 4, s: 7 } },
    { id: 'dreieck', label: L('Dreieck verdoppeln', 'Doubling a triangle'), values: { fig: 'tri' } },
    { id: 'stumpf', label: L('Stumpfwinkliges Dreieck', 'Obtuse triangle'), values: { fig: 'tri', g: 4, h: 3, s: 7 } },
    { id: 'trapez', label: L('Trapez a = 7 cm, c = 3 cm', 'Trapezium a = 7 cm, c = 3 cm'), values: { fig: 'trap' } },
    { id: 'scher', label: L('Spitze verschieben: gleiche Fläche', 'Sliding the top: same area'), values: { fig: 'tri', sch: true } },
  ],
  strings: {
    de: {
      canvas:
        'Kästchenpapier mit einem Parallelogramm, Dreieck oder Trapez, dessen Ecken man ziehen kann, mit Grundseite und Höhe. Die Figur wird zerlegt und zu einem Rechteck umgelegt oder durch eine gedrehte Kopie zu einem Parallelogramm ergänzt; daneben die Formel für den Flächeninhalt mit eingesetzten Werten.',
    },
    en: {
      canvas:
        'Squared paper with a parallelogram, triangle or trapezium whose corners can be dragged, showing base and height. The shape is cut up and rearranged into a rectangle or completed to a parallelogram by a rotated copy; next to it the area formula with the values filled in.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const T = (d: string, e: string) => (de ? d : e);
    const reduced = prefersReducedMotion();
    const kind = () => p.fig as Kind;
    const stepKey = (): 'sp' | 'st' | 'sz' => (kind() === 'para' ? 'sp' : kind() === 'tri' ? 'st' : 'sz');
    const step = (): Step => (kind() === 'para' ? p.sp : kind() === 'tri' ? p.st : p.sz) as Step;
    const dims = (): Dims => ({ g: kind() === 'trap' ? p.a : p.g, h: p.h, s: p.s, c: kind() === 'trap' ? p.c : 0 });
    const num = (v: number) => fmt.num(Math.round(v * 100) / 100, 2);
    const cm = (v: number) => `${num(v)} cm`;
    const cm2 = (v: number) => `${num(v)} cm²`;
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mathFont = (s: number) => `italic 700 ${s}px ${ctx.theme.mathFont}`;
    const alpha = (c: string, a: number) => shade(c, 0, a);

    /* ---------------- Farben ---------------- */
    const cFig = () => ctx.theme.series[0]!;
    const cCopy = () => ctx.theme.series[2]!;
    const cG = () => shade(ctx.theme.series[3]!, ctx.theme.dark ? 0.08 : -0.12);
    const cC = () => shade(ctx.theme.series[5]!, ctx.theme.dark ? 0.08 : -0.18);
    const cH = () => shade(ctx.theme.series[4]!, ctx.theme.dark ? 0.15 : -0.05);
    const cMoved = () => mixColor(ctx.theme.series[0]!, ctx.theme.series[5]!, 0.55);
    const cOk = () => shade(ctx.theme.series[2]!, ctx.theme.dark ? 0.1 : -0.15);
    const paperColor = () => (ctx.theme.dark ? '#131a26' : '#fffefb');
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    /* ---------------- weich gleitende Werte ---------------- */
    class Glide {
      private from: number;
      private to: number;
      private t0 = 0;
      private ms = 0;
      constructor(v: number) {
        this.from = v;
        this.to = v;
      }
      get target(): number {
        return this.to;
      }
      at(t: number): number {
        if (this.ms <= 0) return this.to;
        const u = clamp((t - this.t0) / this.ms, 0, 1);
        return this.from + (this.to - this.from) * ease.inOutCubic(u);
      }
      busy(t: number): boolean {
        return this.ms > 0 && t < this.t0 + this.ms;
      }
      go(to: number, ms = 600): void {
        const t = performance.now();
        if (to === this.to && !this.busy(t)) return;
        this.from = this.at(t);
        this.to = to;
        this.t0 = t;
        this.ms = reduced ? 0 : ms;
      }
      snap(v: number): void {
        this.from = v;
        this.to = v;
        this.ms = 0;
      }
    }

    let now = performance.now();
    let lastFrame = now;
    let introAt = now + (reduced ? -1e6 : 60);
    const intro = () => (reduced ? 1 : clamp((now - introAt) / 1100, 0, 1));

    /* ---------------- angezeigte Maße (weich nachgeführt) ---------------- */
    const shown: Dims = { ...dims() };
    function stepShown(dt: number): boolean {
      const d = dims();
      const k = reduced ? 1 : Math.min(1, dt * (drag ? 22 : 11));
      let moving = false;
      for (const key of ['g', 'h', 's', 'c'] as const) {
        const diff = d[key] - shown[key];
        if (Math.abs(diff) > 0.002) {
          shown[key] += diff * k;
          moving = true;
        } else shown[key] = d[key];
      }
      return moving;
    }

    /* ---------------- Ablauf der Herleitung ---------------- */
    // R: Kopie drehen (0 … 1), K: zerlegen und verschieben (0 … 1), Q: Trapez in zwei Dreiecke (0 … 1)
    const prog = { R: 0, K: 0, Q: 0 };
    function targets(): { R: number; K: number; Q: number } {
      const st = step();
      if (st === 'drei' && kind() === 'trap') return { R: 0, K: 0, Q: 1 };
      if (st === 'erg' && kind() !== 'para') return { R: 1, K: 0, Q: 0 };
      if (st === 'rect') return { R: kind() === 'para' ? 0 : 1, K: 1, Q: 0 };
      return { R: 0, K: 0, Q: 0 };
    }
    function snapProgress(): void {
      Object.assign(prog, targets());
    }
    /** Anzahl der Streifen, die beim Umlegen verschoben werden. */
    function movingGroups(d: Dims): number {
      const D = doubled(kind(), d);
      return strips(D.G, D.s).filter((s) => Math.abs(s.shift) > 1e-9).length;
    }
    const kDur = () => 2.2 + 0.3 * Math.min(4, Math.max(0, movingGroups(dims()) - 1));
    function stepProgress(dt: number): boolean {
      const t = targets();
      const para = kind() === 'para';
      const toward = (key: 'R' | 'K' | 'Q', target: number, dur: number) => {
        const v = dt / dur;
        prog[key] = target > prog[key] ? Math.min(target, prog[key] + v) : Math.max(target, prog[key] - v);
      };
      if (reduced) {
        Object.assign(prog, t);
        return false;
      }
      if (prog.Q > 0 && (t.R > 0 || t.K > 0 || t.Q < prog.Q)) toward('Q', t.R > 0 || t.K > 0 ? 0 : t.Q, 1.3);
      else if (prog.K > t.K) toward('K', t.K, kDur());
      else if (prog.R > t.R && prog.K <= 0) toward('R', t.R, 1.4);
      else if (prog.Q < t.Q && prog.R <= 0 && prog.K <= 0) toward('Q', t.Q, 1.3);
      else if (prog.R < t.R) toward('R', t.R, 1.6);
      else if (prog.K < t.K && (para || prog.R >= 1)) toward('K', t.K, kDur());
      else return false;
      return true;
    }
    const animIdle = () => {
      const t = targets();
      return prog.R === t.R && prog.K === t.K && prog.Q === t.Q;
    };
    const atFigure = () => prog.R === 0 && prog.K === 0 && prog.Q === 0;

    /* ---------------- Kästchen zählen und Spitze verschieben ---------------- */
    let pendingCount = false;
    let countAt = -1;
    let counted = false;
    const countStep = () => {
      const D = doubled(kind(), dims());
      return clamp(2.6 / (D.G * D.h), 0.035, 0.16);
    };
    const countTotal = () => {
      const D = doubled(kind(), dims());
      return D.G * D.h * countStep() + 0.5;
    };
    const counting = () => countAt >= 0 && (now - countAt) / 1000 < countTotal();
    let pendingSweep = false;
    let sweep: { t0: number; s0: number; R: number; dur: number } | null = null;
    let sweepFade = -1;
    function sweepS(): number | null {
      if (!sweep) return null;
      const u = clamp((now - sweep.t0) / sweep.dur, 0, 1);
      return sweep.s0 + sweep.R * Math.sin(2 * Math.PI * ease.inOutCubic(u));
    }
    function sweepRange(d: Dims): number {
      return clamp(Math.round(Math.max(3, d.g * 0.75)), 3, 6);
    }

    /** Was der Flächeninhalt schon „verraten“ darf. */
    const areaKnown = () => p.show || prog.K >= 1 || prog.Q >= 1 || counted;
    /** Stand von areaKnown() beim letzten Füllen der Ergebnisliste. */
    let readoutKnown = areaKnown();
    const areaGlide = new Glide(formulaArea(kind(), dims()));

    /* ---------------- Aufteilung und Ansicht ---------------- */
    interface Geo {
      W: number;
      H: number;
      wide: boolean;
      paper: Rect;
      panel: Rect;
    }
    let geo: Geo | null = null;
    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.31, 215, 330));
        return { W, H, wide, paper: { x: 2, y: 2, w: W - pw - 16, h: H - 4 }, panel: { x: W - pw - 2, y: 2, w: pw, h: H - 4 } };
      }
      const ph = Math.round(H * 0.52);
      return { W, H, wide, paper: { x: 2, y: 2, w: W - 4, h: ph }, panel: { x: 2, y: ph + 10, w: W - 4, h: H - ph - 12 } };
    }
    const small = () => !!geo && !geo.wide;

    interface View {
      cell: number;
      ox: number;
      oy: number;
    }
    const vCell = new Glide(30);
    const vOx = new Glide(0);
    const vOy = new Glide(0);
    let view: View = { cell: 30, ox: 0, oy: 0 };
    let viewKey = '';

    function worldBox(): { x0: number; y0: number; x1: number; y1: number } {
      const d = dims();
      const k = kind();
      const boxes = [envelope(k, d)];
      if (p.sch || sweep || pendingSweep) {
        const R = sweep ? sweep.R : sweepRange(d);
        const s0 = sweep ? sweep.s0 : d.s;
        boxes.push(bounds([figure(k, { ...d, s: s0 - R }), figure(k, { ...d, s: s0 + R })]));
      }
      const b = {
        x0: Math.min(...boxes.map((q) => q.x0)),
        y0: Math.min(...boxes.map((q) => q.y0)),
        x1: Math.max(...boxes.map((q) => q.x1)),
        y1: Math.max(...boxes.map((q) => q.y1)),
      };
      // Mindestgröße, damit kleine Figuren nicht riesig werden
      const minW = small() ? 7 : 8;
      const minH = small() ? 4.5 : 5;
      if (b.x1 - b.x0 < minW) {
        const m = (minW - (b.x1 - b.x0)) / 2;
        b.x0 -= m;
        b.x1 += m;
      }
      if (b.y1 - b.y0 < minH) b.y1 = b.y0 + minH;
      return b;
    }

    function fitView(): View {
      const R = geo!.paper;
      const b = worldBox();
      const sm = small();
      const mL = sm ? 40 : 56;
      const mR = sm ? 64 : 80;
      const mT = sm ? 30 : 40;
      const mB = sm ? 40 : 52;
      const bw = b.x1 - b.x0;
      const bh = b.y1 - b.y0;
      const cell = Math.min((R.w - mL - mR) / bw, (R.h - mT - mB) / bh, sm ? 46 : 60);
      const ox = R.x + mL + (R.w - mL - mR - bw * cell) / 2 - b.x0 * cell;
      const oy = R.y + mT + (R.h - mT - mB - bh * cell) / 2 + b.y1 * cell;
      return { cell, ox, oy };
    }

    function aimView(ms: number): void {
      const v = fitView();
      if (ms <= 0) {
        vCell.snap(v.cell);
        vOx.snap(v.ox);
        vOy.snap(v.oy);
      } else {
        vCell.go(v.cell, ms);
        vOx.go(v.ox, ms);
        vOy.go(v.oy, ms);
      }
    }
    const X = (x: number) => view.ox + x * view.cell;
    const Y = (y: number) => view.oy - y * view.cell;
    const toWorld = (px: number, py: number): Pt => [(px - view.ox) / view.cell, (view.oy - py) / view.cell];

    /* ---------------- Treffer und Ziehen ---------------- */
    interface Hit {
      id: string;
      x: number;
      y: number;
      r: number;
    }
    let hits: Hit[] = [];
    let hover: string | null = null;
    let drag: string | null = null;
    const canDrag = () => !ctx.locked && atFigure() && animIdle() && !sweep && !pendingSweep && !counting();

    /* ---------------- Zeichenhelfer ---------------- */
    function measure(str: string, f: string): number {
      surface.g.font = f;
      return surface.g.measureText(str).width;
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const rows: string[] = [];
      let cur = '';
      const words = str.replace(/ (cm²|cm)(?=[\s.,;:)–]|$)/g, ' $1').replace(/ ([=·:+−]) /g, ' $1 ').split(' ');
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w;
        if (measure(next, f) > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    function halo(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center', a = 1): void {
      const g = surface.g;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = alpha(paperColor(), 0.92);
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      if (accent && tint > 0) {
        g.fillStyle = alpha(accent, theme.dark ? tint * 1.6 : tint);
        g.fill();
      }
      g.strokeStyle = accent ? alpha(accent, 0.45) : alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }
    function pill(label: string, x: number, y: number, fill: string, color: string, size: number, a = 1, scale = 1): Rect {
      const g = surface.g;
      const f = font(800, size);
      const w = measure(label, f) + size * 1.2;
      const h = size * 1.8;
      g.save();
      g.globalAlpha *= a;
      g.translate(x, y);
      g.scale(scale, scale);
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill;
      roundRect(g, -w / 2, -h / 2, w, h, h / 2);
      g.fill();
      g.shadowColor = 'transparent';
      text(g, label, 0, 0.5, { font: f, color });
      g.restore();
      return { x: x - w / 2, y: y - h / 2, w, h };
    }

    /* ---------------- Papier ---------------- */
    function drawPaper(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = paperColor();
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.fill();
      g.restore();
      if (p.grid && view.cell >= 6) {
        g.save();
        roundRect(g, R.x, R.y, R.w, R.h, 12);
        g.clip();
        const blue = theme.series[0]!;
        g.strokeStyle = alpha(blue, theme.dark ? 0.2 : 0.22);
        g.lineWidth = 1;
        g.beginPath();
        const c = view.cell;
        for (let i = Math.ceil((R.x - view.ox) / c); i <= Math.floor((R.x + R.w - view.ox) / c); i++) {
          const x = Math.round(view.ox + i * c) + 0.5;
          g.moveTo(x, R.y);
          g.lineTo(x, R.y + R.h);
        }
        for (let j = Math.ceil((view.oy - R.y - R.h) / c); j <= Math.floor((view.oy - R.y) / c); j++) {
          const y = Math.round(view.oy - j * c) + 0.5;
          g.moveTo(R.x, y);
          g.lineTo(R.x + R.w, y);
        }
        g.stroke();
        g.restore();
      }
      g.strokeStyle = theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 12);
      g.stroke();
    }

    /* ---------------- Vielecke ---------------- */
    function tracePoly(poly: Poly, dx = 0, dy = 0): void {
      const g = surface.g;
      g.beginPath();
      poly.forEach((q, i) => (i ? g.lineTo(X(q[0]) + dx, Y(q[1]) + dy) : g.moveTo(X(q[0]) + dx, Y(q[1]) + dy)));
      g.closePath();
    }
    interface PolyStyle {
      a?: number;
      dx?: number;
      dy?: number;
      lift?: number;
      stroke?: number;
      grow?: number;
    }
    /** Gefülltes Vieleck mit Verlauf, Umriss und (beim Anheben) Schatten. */
    function drawPoly(poly: Poly, color: string, st: PolyStyle = {}): void {
      if (poly.length < 3) return;
      const g = surface.g;
      const theme = ctx.theme;
      const a = st.a ?? 1;
      if (a <= 0.01) return;
      const dx = st.dx ?? 0;
      const dy = st.dy ?? 0;
      const lift = st.lift ?? 0;
      const xs = poly.map((q) => X(q[0]) + dx);
      const ys = poly.map((q) => Y(q[1]) + dy);
      const grad = g.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
      const fa = theme.dark ? 0.36 : 0.3;
      grad.addColorStop(0, alpha(color, fa));
      grad.addColorStop(1, alpha(color, fa * 0.55));
      g.save();
      g.globalAlpha *= a;
      tracePoly(poly, dx, dy);
      if (lift > 0) {
        g.shadowColor = theme.dark ? `rgba(0,0,0,${0.55 * lift})` : `rgba(16,24,40,${0.28 * lift})`;
        g.shadowBlur = 6 + 14 * lift;
        g.shadowOffsetY = 3 + 6 * lift;
        g.fillStyle = theme.dark ? shade(paperColor(), 0.02) : '#ffffff';
        g.fill();
        g.shadowColor = 'transparent';
      }
      g.fillStyle = grad;
      g.fill();
      g.strokeStyle = theme.dark ? shade(color, 0.25) : shade(color, -0.25);
      g.lineWidth = st.stroke ?? 2.6;
      g.lineJoin = 'round';
      if (st.grow !== undefined && st.grow < 1) {
        // Umriss wächst beim Einstieg
        let per = 0;
        for (let i = 0; i < xs.length; i++) per += Math.hypot(xs[(i + 1) % xs.length]! - xs[i]!, ys[(i + 1) % ys.length]! - ys[i]!);
        g.setLineDash([per * st.grow, per + 10]);
      }
      g.stroke();
      g.restore();
    }

    /** Umriss gestrichelt (z. B. die Lage vor dem Verschieben). */
    function ghost(poly: Poly, color: string, a: number, dash: number[] = [5, 5]): void {
      if (a <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      tracePoly(poly);
      g.strokeStyle = color;
      g.lineWidth = 1.6;
      g.setLineDash(dash);
      g.stroke();
      g.restore();
    }

    function segLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number, a = 1, dash?: number[]): void {
      if (a <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.restore();
    }

    /** Rechter Winkel (Viertelkreis mit Punkt) bei (px, py), Schenkel nach oben und zur Seite `side` (±1). */
    function rightMark(px: number, py: number, side: number, color: string, a = 1, r = 11): void {
      if (a <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      const a0 = side > 0 ? -Math.PI / 2 : Math.PI;
      const a1 = side > 0 ? 0 : (3 * Math.PI) / 2;
      g.beginPath();
      g.moveTo(px, py);
      g.arc(px, py, r, a0, a1);
      g.closePath();
      g.fillStyle = alpha(color, 0.16);
      g.fill();
      g.beginPath();
      g.arc(px, py, r, a0, a1);
      g.strokeStyle = color;
      g.lineWidth = 1.6;
      g.stroke();
      const m = (a0 + a1) / 2;
      g.beginPath();
      g.arc(px + Math.cos(m) * r * 0.5, py + Math.sin(m) * r * 0.5, 1.9, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.restore();
    }

    /** Höhe von (x | top) auf die Gerade y = base: gestrichelt, rechter Winkel, Beschriftung. */
    function drawHeight(x: number, top: number, base: number, baseX0: number, baseX1: number, a: number, labelSide: number, label: string | null, grow = 1): void {
      if (a <= 0.01) return;
      const col = cH();
      const px = X(x);
      const yTop = Y(top);
      const yBase = Y(base);
      // Grundseite bis zum Fußpunkt verlängern
      if (x < baseX0 - 1e-6 || x > baseX1 + 1e-6) {
        const from = x < baseX0 ? baseX0 : baseX1;
        segLine(X(from), yBase, px, yBase, ctx.theme.muted, 1.6, a * 0.9, [3, 5]);
      }
      const yEnd = lerp(yTop, yBase, grow);
      segLine(px, yTop, px, yEnd, col, 2.4, a, [7, 5]);
      if (grow >= 0.98) {
        // Viertelkreis zur Grundseite hin (bei verlängerter Grundseite zu ihr)
        const side = x <= baseX0 + 1e-6 ? 1 : x >= baseX1 - 1e-6 ? -1 : labelSide > 0 ? 1 : -1;
        rightMark(px, yBase, side, col, a);
      }
      if (label) {
        const sz = small() ? 12 : 14;
        besideText(label, px, lerp(yTop, yBase, 0.4), labelSide, font(800, sz), col, a * seg(grow, 0.6, 1));
      }
    }

    /* ---------------- Griffe ---------------- */
    function handleDot(x: number, y: number, color: string, id: string): void {
      const g = surface.g;
      const r = small() ? 8.5 : 9.5;
      const active = hover === id || drag === id;
      if (active) {
        g.fillStyle = alpha(color, 0.2);
        g.beginPath();
        g.arc(x, y, r + 8, 0, Math.PI * 2);
        g.fill();
      }
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = paperColor();
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(x, y, r - 0.5, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = onColor();
      const dirs = id === 'B' ? [0, Math.PI] : p.sch && id !== 'B' ? [0, Math.PI] : [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      for (const a of dirs) {
        const cx = x + Math.cos(a) * r * 0.45;
        const cy = y + Math.sin(a) * r * 0.45;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6);
        g.lineTo(cx + Math.cos(a + 2.2) * 2.2, cy + Math.sin(a + 2.2) * 2.2);
        g.lineTo(cx + Math.cos(a - 2.2) * 2.2, cy + Math.sin(a - 2.2) * 2.2);
        g.closePath();
        g.fill();
      }
      hits.push({ id, x, y, r: small() ? 22 : 18 });
    }

    /* ---------------- Beschriftungen ---------------- */
    const names = () => (kind() === 'tri' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']);
    function vertexNames(poly: Poly, a: number): void {
      if (a <= 0.01) return;
      const nm = names();
      const f = font(800, small() ? 13 : 15);
      const d = small() ? 13 : 15;
      const minX = Math.min(...poly.map((q) => q[0]));
      const maxX = Math.max(...poly.map((q) => q[0]));
      poly.forEach((q, i) => {
        if (kind() === 'trap' && i === 2 && shown.c < 0.05) return; // C = D
        let label = nm[i]!;
        if (kind() === 'trap' && i === 3 && shown.c < 0.05) label = 'C = D';
        const bottom = q[1] < 1e-6;
        // links bzw. rechts außen: von der Figur weg; dazwischen gerade nach oben/unten
        const others = poly.filter((v, j) => j !== i && Math.abs(v[1] - q[1]) < 1e-6);
        let sx = 0;
        if (others.length) sx = others.every((v) => v[0] >= q[0] - 1e-6) ? -1 : others.every((v) => v[0] <= q[0] + 1e-6) ? 1 : 0;
        else sx = q[0] <= minX + 1e-6 ? -1 : q[0] >= maxX - 1e-6 ? 1 : 0;
        const x = X(q[0]) + sx * d * 1.05;
        const y = Y(q[1]) + (bottom ? d * 0.8 : sx === 0 ? -d * 1.35 : -d * 0.9);
        halo(label, x, y, f, ctx.theme.text, 'center', a);
      });
    }

    /** Text neben einer senkrechten Linie bei px; weicht auf die andere Seite aus, wenn er sonst aus dem Papier ragt. */
    function besideText(str: string, px: number, py: number, side: number, f: string, color: string, a: number): void {
      const R = geo!.paper;
      const w = measure(str, f);
      let sd = side;
      if (sd > 0 && px + 9 + w > R.x + R.w - 6) sd = -1;
      else if (sd < 0 && px - 9 - w < R.x + 6) sd = 1;
      halo(str, px + sd * 9, py, f, color, sd > 0 ? 'left' : 'right', a);
    }

    /** Farbig hervorgehobene Seite mit Beschriftung darunter (`below` = 1) bzw. darüber (−1). */
    function sideLabel(x0: number, x1: number, y: number, label: string, color: string, below: number, a: number, dy = 0): void {
      if (a <= 0.01) return;
      segLine(X(x0), Y(y) + dy, X(x1), Y(y) + dy, color, small() ? 3.6 : 4.2, a);
      if (!label) return;
      const sz = small() ? 12 : 14;
      // sehr kurze Seite: Beschriftung weiter weg, damit sie nicht auf den Eckennamen liegt
      const extra = measure(label, font(800, sz)) + 34 > Math.abs(X(x1) - X(x0)) ? (small() ? 12 : 14) : 0;
      halo(label, (X(x0) + X(x1)) / 2, Y(y) + dy + below * ((small() ? 15 : 18) + extra), font(800, sz), color, 'center', a);
    }

    /* ---------------- Geometrie pro Bild ---------------- */
    function geometry(): {
      d: Dims;
      F: Pt[];
      G: number;
      copy: Pt[] | null;
      pieces: Piece[];
      rect: { x0: number; w: number; h: number };
    } {
      const k = kind();
      const sw = sweepS();
      const d: Dims = { ...shown, s: sw ?? shown.s };
      const F = figure(k, d);
      const D = doubled(k, d);
      const copy = k === 'para' ? null : halfTurnCopy(k, d);
      const pieces = rectPieces(D.G, D.s, copy ? [F, copy] : [F]);
      return { d, F, G: D.G, copy, pieces, rect: targetRect(D.G, D.h, D.s) };
    }

    /** Bewegte Gruppen (Streifen) mit Start und Dauer im Abschnitt „Verschieben“. */
    function groupTiming(pieces: Piece[]): Map<number, [number, number]> {
      const js = [...new Set(pieces.filter((q) => Math.abs(q.shift) > 1e-9).map((q) => q.j))];
      // nächste Streifen zuerst
      js.sort((a, b) => Math.abs(a) - Math.abs(b));
      const n = js.length;
      const delta = n > 1 ? 0.25 / (n - 1) : 0;
      const dur = n > 1 ? 0.42 : 0.66;
      const m = new Map<number, [number, number]>();
      js.forEach((j, i) => m.set(j, [0.3 + i * delta, dur]));
      return m;
    }

    function drawScene(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const k = kind();
      const geom = geometry();
      const { d, F, G, copy, pieces, rect } = geom;
      const ia = intro();
      const known = areaKnown();
      const sm = small();
      const figA = seg(ia, 0, 0.35);
      const lblA = seg(ia, 0.55, 0.9);
      const center = F.reduce((s, q) => s + q[0], 0) / F.length;

      // 1) Trapez in zwei Dreiecke
      if (prog.Q > 0 && k === 'trap') {
        drawSplit(d, prog.Q);
        return;
      }

      // 2) Zerlegen und verschieben
      if (prog.K > 0) {
        const K = prog.K;
        const timing = groupTiming(pieces);
        // ursprüngliche Lage gestrichelt
        const orig = copy ? [...F] : F;
        ghost(orig, theme.muted, 0.55 * seg(K, 0, 0.2));
        if (copy) ghost(copy, theme.muted, 0.55 * seg(K, 0, 0.2));
        // Ziel-Rechteck zart vorzeichnen
        const rpoly: Pt[] = [
          [rect.x0, 0],
          [rect.x0 + rect.w, 0],
          [rect.x0 + rect.w, rect.h],
          [rect.x0, rect.h],
        ];
        ghost(rpoly, cG(), 0.6 * seg(K, 0.15, 0.3) * (1 - seg(K, 0.85, 1)), [2, 5]);
        // zuerst die ruhenden, dann die bewegten Teile (oben)
        const order = [...pieces].sort((a, b) => Number(Math.abs(a.shift) > 1e-9) - Number(Math.abs(b.shift) > 1e-9));
        for (const pc of order) {
          const moving = Math.abs(pc.shift) > 1e-9;
          let e = 0;
          if (moving) {
            const [t0, dur] = timing.get(pc.j) ?? [0.25, 0.7];
            e = ease.inOutCubic(seg(K, t0, t0 + dur));
          }
          const lift = moving ? Math.sin(Math.PI * e) : 0;
          const base = pc.src === 1 ? cCopy() : moving && k === 'para' ? cMoved() : cFig();
          drawPoly(pc.poly, base, { dx: pc.shift * e * view.cell, dy: -lift * 10, lift, stroke: 2.2 });
        }
        // Schnittlinien (Höhen)
        const cuts = cutLines(G, d.h, d.s);
        const cutA = seg(K, 0, 0.12) * (1 - 0.65 * seg(K, 0.8, 1));
        cuts.forEach((c, i) => {
          const grow = seg(K, 0.03 + i * 0.03, 0.24 + i * 0.03);
          if (grow <= 0) return;
          const y0 = Y(c.y1);
          const y1 = lerp(Y(c.y1), Y(c.y0), grow);
          segLine(X(c.x), y0, X(c.x), y1, cH(), 2.8, cutA, [7, 5]);
          // Schere: kleiner Keil an der Spitze der wachsenden Linie
          if (grow < 1) {
            g.save();
            g.globalAlpha *= cutA;
            g.fillStyle = cH();
            g.beginPath();
            g.arc(X(c.x), y1, 4, 0, Math.PI * 2);
            g.fill();
            g.restore();
          } else if (Math.abs(c.y0) < 1e-9) rightMark(X(c.x), Y(0), 1, cH(), cutA);
        });
        // Beschriftungen am Rechteck
        const endA = seg(K, 0.86, 1);
        if (endA > 0) {
          const gl = k === 'trap' ? `a + c = ${cm(G)}` : `g = ${cm(G)}`;
          sideLabel(rect.x0, rect.x0 + rect.w, 0, gl, cG(), 1, endA);
          const hx = X(rect.x0 + rect.w);
          segLine(hx, Y(0), hx, Y(rect.h), cH(), sm ? 3.6 : 4.2, endA);
          besideText(`h = ${cm(d.h)}`, hx, Y(rect.h / 2), 1, font(800, sm ? 12 : 14), cH(), endA);
          drawCount(rect, endA);
          if (!counting() && !counted && known) {
            const label = k === 'para' ? `A = ${cm2(G * d.h)}` : `2 · A = ${cm2(G * d.h)}`;
            fitPill(label, X(rect.x0 + rect.w / 2), Y(rect.h / 2), rect.w * view.cell * 0.72, rect.h * view.cell * 0.7, endA);
          }
        }
        return;
      }

      // 3) Figur (und gedrehte Kopie)
      const R = prog.R;
      const ang = Math.PI * ease.inOutCubic(seg(R, 0.12, 1));
      // Spuren beim Verschieben der Spitze
      drawSweepTrail(d);
      // Parallele zur Grundseite (Scherung)
      if (p.sch || sweep) drawParallel(d.h, lblA);
      drawPoly(F, cFig(), { a: figA, grow: ia < 1 ? seg(ia, 0, 0.6) : undefined });
      if (copy && R > 0) {
        const cp = rotatedCopy(k, d, ang);
        const lift = Math.sin(Math.PI * seg(R, 0.12, 1));
        const appear = seg(R, 0, 0.12);
        drawPoly(cp, cCopy(), { a: appear, lift: lift * 0.8, dy: -lift * 8 });
        drawPivot(pivot(k, d), ang, R);
      }
      // Grundseite(n), Höhe, Beschriftungen
      const showLbl = lblA;
      const doubledA = seg(R, 0.85, 1);
      if (k === 'trap') {
        sideLabel(0, d.g, 0, `a = ${cm(d.g)}`, cG(), 1, showLbl * (1 - doubledA));
        if (d.c > 0.05) sideLabel(d.s, d.s + d.c, d.h, `c = ${cm(d.c)}`, cC(), -1, showLbl * (1 - doubledA));
        if (doubledA > 0) {
          sideLabel(0, d.g, 0, 'a', cG(), 1, doubledA);
          if (d.c > 0.05) sideLabel(d.g, d.g + d.c, 0, 'c', cC(), 1, doubledA);
          halo(`a + c = ${cm(d.g + d.c)}`, X((d.g + d.c) / 2), Y(0) + (sm ? 32 : 38), font(800, sm ? 12 : 14), theme.text, 'center', doubledA);
          if (d.c > 0.05) {
            sideLabel(d.s, d.s + d.c, d.h, '', cC(), -1, doubledA * 0.9);
            sideLabel(d.s + d.c, d.s + d.c + d.g, d.h, '', cG(), -1, doubledA * 0.9);
          }
        }
      } else sideLabel(0, d.g, 0, `g = ${cm(d.g)}`, cG(), 1, showLbl);
      if (p.hgt) {
        const side = center > d.s ? -1 : 1;
        const baseX1 = R >= 1 ? G : d.g;
        drawHeight(d.s, d.h, 0, 0, baseX1, showLbl, side, `h = ${cm(d.h)}`, ia < 1 ? seg(ia, 0.45, 0.85) : 1);
      }
      vertexNames(F, lblA * (1 - seg(R, 0, 0.15)));
      // Flächeninhalt in der Figur
      if (known && R === 0) {
        const bb = bounds([F]);
        const area = areaGlide.at(now);
        // auf einem Drittel der Höhe, in der Mitte der Figur in dieser Höhe (die Höhe ist darüber beschriftet)
        const yy = d.h * 0.3;
        const ch = verticalExtent(F, yy);
        const cx = ch ? (ch[0] + ch[1]) / 2 : (bb.x0 + bb.x1) / 2;
        const cy = yy;
        fitPill(`A = ${cm2(area)}`, X(cx), Y(cy), (bb.x1 - bb.x0) * view.cell * 0.6, (bb.y1 - bb.y0) * view.cell * 0.55, lblA, sweep !== null);
      }
      if (known && R >= 1 && copy) {
        const P = doubled(k, d);
        const cx = P.s / 2 + P.G / 2;
        fitPill(`2 · A = ${cm2(P.G * P.h)}`, X(cx), Y(d.h / 2), P.G * view.cell * 0.8, d.h * view.cell * 0.6, doubledA);
      }
      // Griffe
      if (canDrag()) drawHandles(F);
    }

    /** Waagerechte Ausdehnung eines konvexen Vielecks in der Höhe y. */
    function verticalExtent(poly: Poly, y: number): [number, number] | null {
      const xs: number[] = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i]!;
        const b = poly[(i + 1) % poly.length]!;
        if ((a[1] - y) * (b[1] - y) <= 0 && Math.abs(b[1] - a[1]) > 1e-9) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      return xs.length >= 2 ? [Math.min(...xs), Math.max(...xs)] : null;
    }

    /** Pille nur zeigen, wenn sie in den verfügbaren Platz passt. */
    function fitPill(label: string, x: number, y: number, w: number, h: number, a: number, strong = false): void {
      const sz = small() ? 12 : 14;
      const pw = measure(label, font(800, sz)) + sz * 1.2;
      if (pw > w + 10 || sz * 1.8 > h + 6) return;
      pill(label, x, y, strong ? cFig() : alpha(paperColor(), 0.94), strong ? onColor() : ctx.theme.text, sz, a);
    }

    function drawHandles(F: Pt[]): void {
      const k = kind();
      const ink = ctx.theme.text;
      handleDot(X(F[1]![0]), Y(F[1]![1]), cG(), 'B');
      if (k === 'tri') handleDot(X(F[2]![0]), Y(F[2]![1]), ink, 'C');
      else {
        handleDot(X(F[3]![0]), Y(F[3]![1]), ink, 'D');
        handleDot(X(F[2]![0]), Y(F[2]![1]), k === 'trap' ? cC() : ink, 'C');
      }
    }

    /** Drehpunkt M mit Drehpfeil. */
    function drawPivot(m: Pt, ang: number, R: number): void {
      const g = surface.g;
      const a = seg(R, 0, 0.1) * (1 - seg(R, 0.88, 1));
      if (a <= 0.01) return;
      const px = X(m[0]);
      const py = Y(m[1]);
      const col = ctx.theme.text;
      g.save();
      g.globalAlpha *= a;
      if (R < 1) {
        const r = small() ? 18 : 22;
        g.strokeStyle = alpha(col, 0.75);
        g.lineWidth = 2;
        g.beginPath();
        // Bildschirm-y nach unten: gegen den Uhrzeigersinn = negative Winkel
        g.arc(px, py, r, -0.2, -0.2 - Math.max(0.05, ang), true);
        g.stroke();
        const e = -0.2 - Math.max(0.05, ang);
        const ex = px + Math.cos(e) * r;
        const ey = py + Math.sin(e) * r;
        const tx = Math.sin(e);
        const ty = -Math.cos(e);
        g.fillStyle = alpha(col, 0.75);
        g.beginPath();
        g.moveTo(ex + tx * 6, ey + ty * 6);
        g.lineTo(ex - ty * 4 - tx * 2, ey + tx * 4 - ty * 2);
        g.lineTo(ex + ty * 4 - tx * 2, ey - tx * 4 - ty * 2);
        g.closePath();
        g.fill();
        halo('180°', px + r + 6, py - r * 0.6, font(800, small() ? 11.5 : 12.5), col, 'left');
      }
      g.fillStyle = paperColor();
      g.beginPath();
      g.arc(px, py, 5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = col;
      g.lineWidth = 2.2;
      g.stroke();
      g.restore();
      halo('M', px - 12, py + 12, font(800, small() ? 12 : 14), col, 'center', a);
    }

    /** Gestrichelte Parallele zur Grundseite in Höhe h. */
    function drawParallel(h: number, a: number): void {
      const R = geo!.paper;
      const y = Y(h);
      segLine(R.x + 8, y, R.x + R.w - 8, y, alpha(cH(), 0.8), 1.6, a, [10, 6]);
      segLine(R.x + 8, Y(0), R.x + R.w - 8, Y(0), alpha(cG(), 0.6), 1.4, a, [10, 6]);
      halo(T('parallel zur Grundseite', 'parallel to the base'), R.x + R.w - 14, y - 12, font(700, small() ? 11 : 12), cH(), 'right', a);
    }

    /** Spuren der Spitze beim Verschieben. */
    function drawSweepTrail(d: Dims): void {
      if (!sweep && sweepFade < 0) return;
      const k = kind();
      const fade = sweep ? 1 : 1 - clamp((now - sweepFade) / 900, 0, 1);
      if (fade <= 0) {
        sweepFade = -1;
        return;
      }
      const s = sweep ?? lastSweep!;
      const u = sweep ? clamp((now - s.t0) / s.dur, 0, 1) : 1;
      const N = 9;
      for (let i = 0; i <= N; i++) {
        const ui = i / N;
        if (ui > u) break;
        const si = s.s0 + s.R * Math.sin(2 * Math.PI * ease.inOutCubic(ui));
        ghost(figure(k, { ...d, s: si }), cFig(), 0.35 * fade, [4, 4]);
      }
    }
    let lastSweep: { t0: number; s0: number; R: number; dur: number } | null = null;

    /** Trapez: Diagonale BD, zwei Dreiecke mit ihren Höhen. */
    function drawSplit(d: Dims, Q: number): void {
      const [t1, t2] = trapezoidTriangles(d);
      const sm = small();
      const diagGrow = seg(Q, 0, 0.3);
      const sep = ease.inOutCubic(seg(Q, 0.3, 0.75));
      // T2 rückt ein Stück nach oben rechts (senkrecht zur Diagonalen)
      const B = t1[1]!;
      const Dp = t1[2]!;
      let nx = Dp[1] - B[1];
      let ny = -(Dp[0] - B[0]);
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      // Richtung zu C hin
      const C = t2[1]!;
      if ((C[0] - B[0]) * nx + (C[1] - B[1]) * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      const off = sep * (sm ? 12 : 18);
      const dx = nx * off;
      const dy = -ny * off;
      drawPoly(t1, cFig());
      drawPoly(t2, cCopy(), { dx, dy, lift: Math.sin(Math.PI * seg(Q, 0.3, 0.75)) * 0.7 });
      // Diagonale
      if (diagGrow < 1) segLine(X(B[0]), Y(B[1]), lerp(X(B[0]), X(Dp[0]), diagGrow), lerp(Y(B[1]), Y(Dp[1]), diagGrow), ctx.theme.text, 2.4, 1, [6, 4]);
      const la = seg(Q, 0.7, 1);
      // Höhen: h1 von D auf AB, h2 von B auf DC (verlängert)
      if (la > 0) {
        drawHeight(d.s, d.h, 0, 0, d.g, la, d.s > d.g / 2 ? 1 : -1, sm ? 'h' : `h = ${cm(d.h)}`, seg(Q, 0.7, 0.9));
        // zweite Höhe im verschobenen Dreieck: von B (unten) nach oben auf die Gerade durch D und C
        const g = surface.g;
        g.save();
        g.translate(dx, dy);
        const px = X(d.g);
        segLine(px, Y(0), px, lerp(Y(0), Y(d.h), seg(Q, 0.75, 0.95)), cH(), 2.4, la, [7, 5]);
        if (d.g < d.s - 1e-6 || d.g > d.s + d.c + 1e-6) {
          const from = d.g < d.s ? d.s : d.s + d.c;
          segLine(X(from), Y(d.h), px, Y(d.h), ctx.theme.muted, 1.6, la * 0.9, [3, 5]);
        }
        // rechter Winkel oben (nach unten geöffnet)
        const r = 11;
        const side = d.g > d.s + d.c / 2 ? -1 : 1;
        g.save();
        g.globalAlpha *= la;
        g.beginPath();
        const a0 = Math.PI / 2;
        const a1 = side > 0 ? 0 : Math.PI;
        g.moveTo(px, Y(d.h));
        g.arc(px, Y(d.h), r, a0, a1, side > 0);
        g.closePath();
        g.fillStyle = alpha(cH(), 0.16);
        g.fill();
        g.beginPath();
        g.arc(px, Y(d.h), r, a0, a1, side > 0);
        g.strokeStyle = cH();
        g.lineWidth = 1.6;
        g.stroke();
        g.restore();
        g.restore();
        sideLabel(0, d.g, 0, `a = ${cm(d.g)}`, cG(), 1, la);
        if (d.c > 0.05) {
          // Seite c gehört zum verschobenen Dreieck BCD: mit ihm versetzen
          g.save();
          g.translate(dx, dy);
          sideLabel(d.s, d.s + d.c, d.h, `c = ${cm(d.c)}`, cC(), -1, la);
          g.restore();
        }
        if (areaKnown()) {
          const c1 = t1.reduce((s, q) => [s[0] + q[0] / 3, s[1] + q[1] / 3] as Pt, [0, 0] as Pt);
          const c2 = t2.reduce((s, q) => [s[0] + q[0] / 3, s[1] + q[1] / 3] as Pt, [0, 0] as Pt);
          const b1 = bounds([t1]);
          const b2 = bounds([t2]);
          fitPill(`A₁ = ${cm2((d.g * d.h) / 2)}`, X(c1[0]), Y(c1[1]), (b1.x1 - b1.x0) * view.cell * 0.55, (b1.y1 - b1.y0) * view.cell * 0.4, la);
          if (d.c > 0.05) fitPill(`A₂ = ${cm2((d.c * d.h) / 2)}`, X(c2[0]) + dx, Y(c2[1]) + dy, (b2.x1 - b2.x0) * view.cell * 0.55, (b2.y1 - b2.y0) * view.cell * 0.4, la);
        }
      }
      vertexNames(figure('trap', d), 1 - seg(Q, 0.2, 0.4) * 0.6);
    }

    /* ---------------- Kästchen zählen ---------------- */
    function drawTile(x: number, y: number, base: string, a: number, scale: number, label: string | null): void {
      const g = surface.g;
      const theme = ctx.theme;
      const c = view.cell;
      const px = X(x);
      const py = Y(y + 1);
      g.save();
      g.globalAlpha *= a;
      g.translate(px + c / 2, py + c / 2);
      g.scale(scale, scale);
      const inset = Math.max(1, c * 0.06);
      const s = c - 2 * inset;
      const r = Math.min(6, c * 0.14);
      g.fillStyle = theme.dark ? mixColor(base, '#0e1420', 0.4) : mixColor(base, '#ffffff', 0.5);
      roundRect(g, -c / 2 + inset, -c / 2 + inset, s, s, r);
      g.fill();
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.45)';
      roundRect(g, -c / 2 + inset + 1, -c / 2 + inset + 1, s - 2, s * 0.32, Math.max(1, r - 1));
      g.fill();
      if (label && c >= 17) {
        const fs = Math.min(15, Math.round(c * 0.4));
        text(g, label, 0, 0.5, { font: font(700, fs), color: theme.dark ? 'rgba(230,238,252,0.92)' : mixColor(base, '#000000', 0.5) });
      }
      g.restore();
    }

    function drawCount(rect: { x0: number; w: number; h: number }, a: number): void {
      if (countAt < 0 || a <= 0) return;
      const cells = rectCells(rect.x0, Math.round(rect.w), Math.round(rect.h));
      const t = (now - countAt) / 1000;
      const dc = countStep();
      const k = kind();
      // Bei Dreieck und Trapez: Kästchen in der Farbe der Hälfte, in der ihre Mitte liegt
      const geom = geometry();
      const own = geom.pieces.filter((q) => q.src === 0).map((q) => q.poly.map((v) => [v[0] + q.shift, v[1]] as Pt));
      cells.forEach(([x, y], i) => {
        const e = counted && !counting() ? 1 : clamp((t - i * dc) / 0.3, 0, 1);
        if (e <= 0) return;
        let col = cFig();
        if (k !== 'para') {
          const inOwn = own.some((poly) => inside(poly, x + 0.5, y + 0.5));
          col = inOwn ? cFig() : cCopy();
        }
        drawTile(x, y, col, a * Math.min(1, e * 2.2) * 0.92, Math.max(0.01, ease.outBack(e)), e > 0.4 ? String(i + 1) : null);
      });
      // Ergebnis-Pille
      const n = cells.length;
      const shownN = Math.min(n, Math.max(0, Math.floor(t / dc + 0.4)));
      const done = counted && !counting();
      const label = done ? (k === 'para' ? T(`${n} Kästchen = ${cm2(n)}`, `${n} squares = ${cm2(n)}`) : T(`${n} : 2 = ${num(n / 2)} Kästchen`, `${n} : 2 = ${num(n / 2)} squares`)) : T(`${shownN} Kästchen …`, `${shownN} squares …`);
      const sz = small() ? 12 : 14;
      const py = Y(rect.h) - (small() ? 20 : 24);
      pill(label, X(rect.x0 + rect.w / 2), py, done ? cOk() : ctx.theme.text, onColor(), sz, a);
    }
    function inside(poly: Poly, x: number, y: number): boolean {
      let ins = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i]!;
        const [xj, yj] = poly[j]!;
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
      }
      return ins;
    }

    /* ---------------- Legende ---------------- */
    function drawLegend(R: Rect): void {
      if (!p.grid) return;
      const g = surface.g;
      const theme = ctx.theme;
      const c = Math.min(view.cell, 26);
      const fs = small() ? 11 : 12;
      const lab = T('1 Kästchen = 1 cm²', '1 square = 1 cm²');
      const tw = measure(lab, font(700, fs));
      const w = c + 8 + tw + 16;
      const h = Math.max(c, fs * 1.4) + 12;
      const b = worldBox();
      const fx0 = X(b.x0) - 30;
      const fx1 = X(b.x1) + 60;
      const fy0 = Y(b.y1) - 30;
      const fy1 = Y(b.y0) + 50;
      const spots: [number, number][] = [
        [R.x + 10, R.y + 10],
        [R.x + R.w - w - 10, R.y + 10],
        [R.x + 10, R.y + R.h - h - 10],
        [R.x + R.w - w - 10, R.y + R.h - h - 10],
      ];
      const spot = spots.find(([x, y]) => x + w < fx0 || x > fx1 || y + h < fy0 || y > fy1);
      if (!spot) return;
      const [x, y] = spot;
      g.save();
      g.globalAlpha *= intro();
      g.fillStyle = alpha(paperColor(), 0.94);
      roundRect(g, x, y, w, h, 8);
      g.fill();
      g.strokeStyle = theme.dark ? '#2a3445' : '#dbe2ea';
      g.lineWidth = 1;
      g.stroke();
      g.fillStyle = alpha(cFig(), theme.dark ? 0.35 : 0.22);
      g.fillRect(x + 8, y + (h - c) / 2, c, c);
      g.strokeStyle = alpha(cFig(), 0.6);
      g.strokeRect(x + 8.5, y + (h - c) / 2 + 0.5, c - 1, c - 1);
      text(g, lab, x + 8 + c + 8, y + h / 2 + 0.5, { font: font(700, fs), color: theme.text, align: 'left' });
      g.restore();
    }

    /* ================================================================== */
    /* Karten                                                              */
    /* ================================================================== */
    interface Seg {
      t: string;
      c?: string;
      w?: number;
      v?: boolean;
    }
    type Item =
      | { kind: 'title'; text: string; color?: string }
      | { kind: 'rich'; segs: Seg[]; size: number; a?: number; dy?: number }
      | { kind: 'big'; segs: Seg[]; size: number; a?: number; pop?: number }
      | { kind: 'note'; text: string; color?: string; a?: number }
      | { kind: 'step'; n: number; text: string; state: 'done' | 'now' | 'todo' };
    interface CardSpec {
      items: Item[];
      accent?: string;
      tint?: number;
      optional?: boolean;
    }
    const S = (t: string, c?: string, w?: number): Seg => ({ t, c, w });
    const V = (t: string, c?: string): Seg => ({ t, c, v: true });
    const noteSize = () => (small() ? 11.5 : 12.5);
    const segFont = (s: Seg, size: number, weight: number) => (s.v ? mathFont(Math.round(size * 1.1)) : font(s.w ?? weight, size));
    function segWidth(segs: Seg[], size: number, weight: number): number {
      return segs.reduce((sum, s) => sum + measure(s.t, segFont(s, size, weight)), 0);
    }
    function drawSegs(segs: Seg[], x: number, y: number, size: number, weight: number, maxW: number): void {
      let sz = size;
      const w0 = segWidth(segs, sz, weight);
      if (w0 > maxW) sz = Math.max(10.5, (sz * maxW) / w0);
      let cx = x;
      for (const s of segs) {
        const f = segFont(s, sz, weight);
        text(surface.g, s.t, cx, y, { font: f, color: s.c ?? ctx.theme.text, align: 'left' });
        cx += measure(s.t, f);
      }
    }
    function itemHeight(it: Item, w: number): number {
      switch (it.kind) {
        case 'title':
          return 20;
        case 'rich':
          return it.size * 1.5;
        case 'big':
          return it.size * 1.45;
        case 'note':
          return wrap(it.text, w, font(600, noteSize())).length * noteSize() * 1.38 + 4;
        case 'step':
          return Math.max(24, wrap(it.text, w - 30, font(650, noteSize())).length * noteSize() * 1.35 + 8);
      }
    }
    function drawItem(it: Item, x: number, y: number, w: number): number {
      const g = surface.g;
      const th = ctx.theme;
      const h = itemHeight(it, w);
      switch (it.kind) {
        case 'title':
          {
            const base = small() ? 11 : 12;
            const tw = measure(it.text, font(750, base));
            text(g, it.text, x, y + 9, { font: font(750, tw > w ? Math.max(10, (base * w) / tw) : base), color: it.color ?? th.muted, align: 'left' });
          }
          break;
        case 'rich': {
          const a = it.a ?? 1;
          if (a <= 0.01) break;
          g.save();
          g.globalAlpha *= a;
          drawSegs(it.segs, x, y + h / 2 + (it.dy ?? 0), it.size, 650, w);
          g.restore();
          break;
        }
        case 'big': {
          const a = it.a ?? 1;
          if (a <= 0.01) break;
          g.save();
          g.globalAlpha *= a;
          const k = it.pop ?? 1;
          g.translate(x, y + h / 2);
          g.scale(k, k);
          drawSegs(it.segs, 0, 0, it.size, 800, w / k);
          g.restore();
          break;
        }
        case 'note': {
          const f = font(600, noteSize());
          g.save();
          g.globalAlpha *= it.a ?? 1;
          wrap(it.text, w, f).forEach((row, i) => text(g, row, x, y + noteSize() * 0.75 + i * noteSize() * 1.38, { font: f, color: it.color ?? th.muted, align: 'left' }));
          g.restore();
          break;
        }
        case 'step': {
          const f = font(it.state === 'now' ? 750 : 600, noteSize());
          const r = 9;
          const cy = y + 4 + r;
          const col = it.state === 'done' ? cOk() : it.state === 'now' ? cFig() : alpha(th.text, 0.35);
          g.beginPath();
          g.arc(x + r, cy, r, 0, Math.PI * 2);
          if (it.state === 'todo') {
            g.strokeStyle = col;
            g.lineWidth = 1.5;
            g.stroke();
            text(g, String(it.n), x + r, cy + 0.5, { font: font(750, 10.5), color: th.muted });
          } else {
            g.fillStyle = col;
            g.fill();
            text(g, it.state === 'done' ? '✓' : String(it.n), x + r, cy + 0.5, { font: font(800, 11), color: onColor() });
          }
          wrap(it.text, w - 30, f).forEach((row, i) => text(g, row, x + 28, cy + i * noteSize() * 1.35, { font: f, color: it.state === 'todo' ? th.muted : th.text, align: 'left' }));
          break;
        }
      }
      return h;
    }
    const cardPad = () => (small() ? 10 : 14);
    function cardHeight(c: CardSpec, inner: number): number {
      return c.items.reduce((s, it) => s + itemHeight(it, inner), 0) + cardPad() + 8;
    }
    function drawCards(R: Rect, cards: CardSpec[]): void {
      const pad = cardPad();
      const gap = small() ? 8 : 10;
      const inner = R.w - 2 * pad;
      let list = cards;
      const total = (l: CardSpec[]) => l.reduce((s, c) => s + cardHeight(c, inner), 0) + gap * (l.length - 1);
      while (list.length > 1 && total(list) > R.h) {
        const idx = list.map((c) => !!c.optional).lastIndexOf(true);
        list = idx >= 0 ? list.filter((_, i) => i !== idx) : list.slice(0, -1);
      }
      const extra = Math.max(0, R.h - total(list));
      let y = R.y;
      list.forEach((c, i) => {
        let h = cardHeight(c, inner);
        if (i === list.length - 1) h += extra;
        card({ x: R.x, y, w: R.w, h }, c.accent, c.tint ?? 0);
        let yy = y + pad - 2;
        for (const it of c.items) {
          if (yy + itemHeight(it, inner) > y + h + 2) break;
          yy += drawItem(it, R.x + pad, yy, inner);
        }
        y += h + gap;
      });
    }

    /** Rechenschritte blenden nacheinander ein. */
    let chainAt = now + 500;
    const chainBusy = () => !reduced && now < chainAt + 4 * 360 + 500;
    function stepItems(rows: Seg[][], big: Seg[], sz: number, bigSz: number): Item[] {
      const out: Item[] = [];
      const pr = (t0: number, ms: number) => (reduced || drag ? 1 : clamp((now - t0) / ms, 0, 1));
      rows.forEach((segs, i) => {
        const u = pr(chainAt + i * 360, 340);
        out.push({ kind: 'rich', segs, size: sz, a: u, dy: (1 - ease.outCubic(u)) * 6 });
      });
      const u = pr(chainAt + rows.length * 360, 420);
      out.push({ kind: 'big', segs: big, size: bigSz, a: clamp(u * 1.6, 0, 1), pop: 0.85 + 0.15 * ease.outBack(u) });
      return out;
    }

    const FIGNAME: Record<Kind, string> = { para: T('Parallelogramm', 'Parallelogram'), tri: T('Dreieck', 'Triangle'), trap: T('Trapez', 'Trapezium') };

    function formulaCard(): CardSpec {
      const k = kind();
      const d = dims();
      const sm = small();
      const sz = sm ? 13.5 : 15;
      const bigSz = sm ? 19 : 24;
      const known = areaKnown();
      const th = ctx.theme;
      const vA = V('A', cFig());
      const vg = V(k === 'trap' ? 'a' : 'g', cG());
      const vc = V('c', cC());
      const vh = V('h', cH());
      let rows: Seg[][];
      if (k === 'para') rows = [[vA, S(' = '), vg, S(' · '), vh], [S('= '), S(cm(d.g), cG(), 750), S(' · '), S(cm(d.h), cH(), 750)]];
      else if (k === 'tri') rows = [[vA, S(' = '), vg, S(' · '), vh, S(' : 2')], [S('= '), S(cm(d.g), cG(), 750), S(' · '), S(cm(d.h), cH(), 750), S(' : 2')]];
      else if (step() === 'drei')
        rows = [
          [vA, S(' = '), vg, S(' · '), vh, S(' : 2 + '), vc, S(' · '), vh, S(' : 2')],
          [S('= '), S(num(d.g), cG(), 750), S(' · '), S(num(d.h), cH(), 750), S(' : 2 + '), S(num(d.c), cC(), 750), S(' · '), S(num(d.h), cH(), 750), S(' : 2')],
          ...(known ? [[S('= '), S(cm2((d.g * d.h) / 2)), S(' + '), S(cm2((d.c * d.h) / 2))]] : []),
        ];
      else
        rows = [
          [vA, S(' = ('), vg, S(' + '), vc, S(') · '), vh, S(' : 2')],
          [S('= ('), S(cm(d.g), cG(), 750), S(' + '), S(cm(d.c), cC(), 750), S(') · '), S(cm(d.h), cH(), 750), S(' : 2')],
        ];
      const big: Seg[] = [S('= '), S(known ? cm2(areaGlide.at(now)) : '?', known ? cFig() : th.muted)];
      const items: Item[] = [{ kind: 'title', text: T(`Flächeninhalt ${k === 'trap' ? 'des Trapezes' : k === 'para' ? 'des Parallelogramms' : 'des Dreiecks'}`, `Area of the ${FIGNAME[k].toLowerCase()}`) }, ...stepItems(rows, big, sz, bigSz)];
      if (p.sch || sweep) items.push({ kind: 'note', text: T('Gleiche Grundseite, gleiche Höhe – gleicher Flächeninhalt.', 'Same base, same height – same area.'), color: cH() });
      return { items, accent: cFig(), tint: known ? 0.04 : 0 };
    }

    function stepsCard(): CardSpec {
      const k = kind();
      const d = dims();
      const st = step();
      const R = prog.R;
      const K = prog.K;
      const Q = prog.Q;
      const state = (doneAt: boolean, nowAt: boolean): 'done' | 'now' | 'todo' => (doneAt ? 'done' : nowAt ? 'now' : 'todo');
      const items: Item[] = [{ kind: 'title', text: T('Herleitung', 'Derivation') }];
      const D = doubled(k, d);
      const nStrips = strips(D.G, D.s).filter((s) => Math.abs(s.shift) > 1e-9).length;
      const cutText = isRectangle(D.s)
        ? T('Kein Schnitt nötig – es ist schon ein Rechteck.', 'No cut needed – it is already a rectangle.')
        : nStrips > 1
          ? T(`Entlang von Höhen in ${nStrips + 1} Teile zerlegen und verschieben.`, `Cut along heights into ${nStrips + 1} pieces and move them.`)
          : T('Entlang der Höhe zerlegen, das Dreieck auf die andere Seite schieben.', 'Cut along the height and slide the triangle to the other side.');
      const gName = k === 'trap' ? 'a + c' : 'g';
      if (k === 'para') {
        items.push({ kind: 'step', n: 1, text: T('Höhe h einzeichnen.', 'Draw the height h.'), state: state(K > 0, K === 0) });
        items.push({ kind: 'step', n: 2, text: cutText, state: state(K >= 1, K > 0 && K < 1) });
        items.push({ kind: 'step', n: 3, text: T('Rechteck mit Länge g und Breite h: A = g · h.', 'A rectangle g long and h wide: A = g · h.'), state: state(K >= 1 && !counting(), false) });
      } else if (st === 'drei' && k === 'trap') {
        items.push({ kind: 'step', n: 1, text: T('Diagonale BD einzeichnen.', 'Draw the diagonal BD.'), state: state(Q >= 0.3, Q < 0.3) });
        items.push({ kind: 'step', n: 2, text: T('Dreieck ABD: Grundseite a, Höhe h.', 'Triangle ABD: base a, height h.'), state: state(Q >= 1, Q >= 0.3 && Q < 1) });
        items.push({ kind: 'step', n: 3, text: T('Dreieck BCD: Grundseite c, gleiche Höhe h.', 'Triangle BCD: base c, the same height h.'), state: state(Q >= 1, false) });
        items.push({ kind: 'step', n: 4, text: T('Addieren: a · h : 2 + c · h : 2 = (a + c) · h : 2.', 'Add: a · h : 2 + c · h : 2 = (a + c) · h : 2.'), state: state(Q >= 1, false) });
      } else {
        items.push({ kind: 'step', n: 1, text: T('Kopie um 180° um M (Mitte von BC) drehen.', 'Rotate a copy by 180° about M (midpoint of BC).'), state: state(R >= 1, R < 1) });
        items.push({ kind: 'step', n: 2, text: T(`Parallelogramm mit Grundseite ${gName} und Höhe h.`, `A parallelogram with base ${gName} and height h.`), state: state(R >= 1 && (K > 0 || st === 'erg'), false) });
        items.push({ kind: 'step', n: 3, text: T(`Zum Rechteck umlegen: ${gName} lang, h breit.`, `Rearrange into a rectangle: ${gName} long, h wide.`), state: state(K >= 1, K > 0 && K < 1) });
        items.push({ kind: 'step', n: 4, text: k === 'tri' ? T('Das Dreieck ist die Hälfte davon: g · h : 2.', 'The triangle is half of it: g · h : 2.') : T('Das Trapez ist die Hälfte davon: (a + c) · h : 2.', 'The trapezium is half of it: (a + c) · h : 2.'), state: state(K >= 1 || (R >= 1 && st === 'erg'), false) });
      }
      // Sonderfälle
      const notes: string[] = [];
      if (k === 'trap' && d.c === 0) notes.push(T('c = 0 cm: Das Trapez ist ein Dreieck – die Formel wird zu a · h : 2.', 'c = 0 cm: the trapezium is a triangle – the formula becomes a · h : 2.'));
      else if (k === 'trap' && d.c === d.g) notes.push(T('c = a: Das Trapez ist ein Parallelogramm – (a + a) · h : 2 = a · h.', 'c = a: the trapezium is a parallelogram – (a + a) · h : 2 = a · h.'));
      if (footOutside(d) && atFigure()) notes.push(k === 'tri' ? T('Stumpfer Winkel: Der Fußpunkt der Höhe liegt außerhalb – Grundseite verlängern.', 'Obtuse angle: the foot of the height lies outside – extend the base.') : T('Der Fußpunkt der Höhe liegt außerhalb der Grundseite – Grundseite verlängern.', 'The foot of the height lies outside the base – extend the base.'));
      if (k === 'para' && isRectangle(d.s)) notes.push(T('s = 0: Das Parallelogramm ist ein Rechteck.', 's = 0: the parallelogram is a rectangle.'));
      for (const n of notes) items.push({ kind: 'note', text: n, color: ctx.theme.text });
      if (small()) {
        // Handy: nur der aktuelle (bzw. zuletzt erledigte) Schritt
        const st = items.filter((it): it is Extract<Item, { kind: 'step' }> => it.kind === 'step');
        const cur = st.find((it) => it.state === 'now') ?? [...st].reverse().find((it) => it.state === 'done') ?? st[0]!;
        const out: Item[] = [{ kind: 'title', text: T(`Herleitung · Schritt ${cur.n} von ${st.length}`, `Derivation · step ${cur.n} of ${st.length}`) }, cur];
        if (notes[0]) out.push({ kind: 'note', text: notes[0], color: ctx.theme.text });
        return { items: out };
      }
      return { items };
    }

    function checkCard(): CardSpec {
      const k = kind();
      const d = dims();
      const D = doubled(k, d);
      const n = D.G * D.h;
      const items: Item[] = [{ kind: 'title', text: T('Kontrolle', 'Check') }];
      if (countAt >= 0 && (counting() || counted)) {
        if (k === 'para') items.push({ kind: 'note', text: T(`${n} Kästchen à 1 cm² – genau g · h = ${num(d.g)} · ${num(d.h)}.`, `${n} squares of 1 cm² – exactly g · h = ${num(d.g)} · ${num(d.h)}.`), color: ctx.theme.text });
        else items.push({ kind: 'note', text: T(`Das Rechteck hat ${n} Kästchen, ${k === 'tri' ? 'das Dreieck' : 'das Trapez'} die Hälfte: ${num(n / 2)} cm². Blau: ${k === 'tri' ? 'Dreieck' : 'Trapez'}, grün: Kopie – zerschnittene Kästchen gehören zu beiden.`, `The rectangle has ${n} squares, the ${k === 'tri' ? 'triangle' : 'trapezium'} half of it: ${num(n / 2)} cm². Blue: ${k === 'tri' ? 'triangle' : 'trapezium'}, green: copy – cut squares belong to both.`), color: ctx.theme.text });
      } else if (p.sch || sweep) {
        items.push({ kind: 'note', text: T('Ziehe eine obere Ecke: Die Figur wird schief, aber Grundseite und Höhe bleiben – die Zahl bleibt stehen.', 'Drag a top corner: the shape leans, but base and height stay – so does the number.'), color: ctx.theme.text });
      } else items.push({ kind: 'note', text: T('„Kästchen zählen“ legt das Rechteck mit Einheitsquadraten aus und zählt nach.', '“Count the squares” tiles the rectangle with unit squares and counts them.') });
      return { items, optional: true, accent: cOk(), tint: counted ? 0.05 : 0 };
    }

    /* ================================================================== */
    /* Ergebnisse und Knöpfe                                               */
    /* ================================================================== */
    function updateReadouts(): void {
      const k = kind();
      const d = dims();
      const F = figure(k, d);
      const nm = names();
      const pts = F.map((q, i) => `${nm[i]}${fmt.point(q[0], q[1])}`)
        .filter((_, i) => !(k === 'trap' && d.c === 0 && i === 2))
        .join(', ');
      ctx.readout('fig', `${FIGNAME[k]} ${pts}`);
      const A = formulaArea(k, d);
      let html: string;
      if (k === 'para') html = `<var>A</var> = <var>g</var> · <var>h</var> = ${cm(d.g)} · ${cm(d.h)} = <strong>${cm2(A)}</strong>`;
      else if (k === 'tri') html = `<var>A</var> = <var>g</var> · <var>h</var> : 2 = ${cm(d.g)} · ${cm(d.h)} : 2 = <strong>${cm2(A)}</strong>`;
      else html = `<var>A</var> = (<var>a</var> + <var>c</var>) · <var>h</var> : 2 = (${cm(d.g)} + ${cm(d.c)}) · ${cm(d.h)} : 2 = <strong>${cm2(A)}</strong>`;
      // Ergebnis erst, wenn es auch im Bild steht („Flächeninhalt sofort zeigen“ oder nach Zerlegen, Ergänzen, Zählen)
      readoutKnown = areaKnown();
      if (!readoutKnown) {
        ctx.readout('area', null);
        ctx.readout('way', null);
        return;
      }
      ctx.readout('area', { html });
      const st = step();
      const D = doubled(k, d);
      let way: string;
      if (k === 'trap' && st === 'drei') way = T(`Zwei Dreiecke: ${cm2((d.g * d.h) / 2)} + ${cm2((d.c * d.h) / 2)} = ${cm2(A)}`, `Two triangles: ${cm2((d.g * d.h) / 2)} + ${cm2((d.c * d.h) / 2)} = ${cm2(A)}`);
      else if (k === 'para') way = st === 'rect' ? T(`Umgelegt zum Rechteck ${cm(d.g)} × ${cm(d.h)} = ${cm2(A)}`, `Rearranged into a rectangle ${cm(d.g)} × ${cm(d.h)} = ${cm2(A)}`) : T('Noch nicht zerlegt', 'Not yet cut up');
      else if (st === 'fig') way = T('Noch nicht ergänzt', 'Not yet completed');
      else way = T(`Mit gedrehter Kopie: Parallelogramm bzw. Rechteck ${cm(D.G)} × ${cm(D.h)} = ${cm2(D.G * D.h)}, die Hälfte davon: ${cm2(A)}`, `With a rotated copy: parallelogram or rectangle ${cm(D.G)} × ${cm(D.h)} = ${cm2(D.G * D.h)}, half of it: ${cm2(A)}`);
      ctx.readout('way', way);
    }

    function goLabel(): string {
      const k = kind();
      const st = step();
      if (k === 'para') return st === 'rect' ? T('Zurück zum Parallelogramm', 'Back to the parallelogram') : T('Zerlegen und verschieben', 'Cut and move');
      const back = k === 'tri' ? T('Zurück zum Dreieck', 'Back to the triangle') : T('Zurück zum Trapez', 'Back to the trapezium');
      if (st === 'fig' || st === 'drei') return k === 'tri' ? T('Verdoppeln', 'Double it') : T('Kopie drehen', 'Rotate a copy');
      if (st === 'erg') return T('Zum Rechteck umlegen', 'Rearrange into a rectangle');
      return back;
    }
    function updateActions(): void {
      ctx.setAction('go', { label: goLabel(), enabled: !ctx.locked });
      ctx.setAction('split', { label: step() === 'drei' ? T('Zurück zum Trapez', 'Back to the trapezium') : T('In zwei Dreiecke zerlegen', 'Split into two triangles'), enabled: !ctx.locked });
      ctx.setAction('count', { enabled: !ctx.locked && !(kind() === 'trap' && step() === 'drei') });
      ctx.setAction('shear', { enabled: !ctx.locked });
    }

    function setStep(v: Step): void {
      const key = stepKey();
      ctx.set({ [key]: v } as never);
    }

    /* ================================================================== */
    /* Zeiger                                                              */
    /* ================================================================== */
    function hitAt(px: number, py: number): Hit | null {
      if (!canDrag()) return null;
      let best: Hit | null = null;
      let bd = Infinity;
      for (const h of hits) {
        const dd = Math.hypot(px - h.x, py - h.y);
        if (dd <= h.r && dd < bd) {
          bd = dd;
          best = h;
        }
      }
      return best;
    }

    function dragTo(px: number, py: number): void {
      const R = geo!.paper;
      const [wx, wy] = toWorld(clamp(px, R.x + 6, R.x + R.w - 6), clamp(py, R.y + 6, R.y + R.h - 6));
      const k = kind();
      const xr = Math.round(wx);
      const yr = clamp(Math.round(wy), 1, H_MAX);
      const h = p.sch ? p.h : yr;
      if (drag === 'B') {
        const v = clamp(xr, 1, G_MAX);
        if (k === 'trap') ctx.set({ a: v });
        else ctx.set({ g: v });
      } else if (drag === 'D' || (drag === 'C' && k === 'tri')) {
        ctx.set({ s: clamp(xr, S_MIN, S_MAX), h });
      } else if (drag === 'C' && k === 'para') {
        ctx.set({ s: clamp(xr - p.g, S_MIN, S_MAX), h });
      } else if (drag === 'C' && k === 'trap') {
        ctx.set({ c: clamp(xr - p.s, 0, G_MAX), h });
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const h = hitAt(q.px, q.py);
        if (!h) return false;
        drag = h.id;
        countAt = -1;
        counted = false;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (drag) dragTo(q.px, q.py);
      },
      pointerUp: () => {
        if (!drag) return;
        drag = null;
        surface.setCursor(hover ? 'grab' : '');
        aimView(700);
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitAt(q.px, q.py) : null;
        const id = h?.id ?? null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        if (!drag) surface.setCursor(id ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ================================================================== */
    /* Ablauf                                                              */
    /* ================================================================== */
    function resetCount(): void {
      countAt = -1;
      counted = false;
      pendingCount = false;
    }
    function stopSweep(): void {
      if (sweep) {
        lastSweep = sweep;
        sweepFade = now;
      }
      sweep = null;
      pendingSweep = false;
    }

    let lastKind = kind();
    let lastDrei = kind() === 'trap' && step() === 'drei';
    snapProgress();
    updateReadouts();
    updateActions();

    return {
      update(changed, source) {
        now = performance.now();
        const k = kind();
        if (changed.has('fig') && k !== lastKind) {
          lastKind = k;
          if (source === 'input') {
            // neue Figur: von vorn beginnen
            if (step() !== 'fig') ctx.set({ [stepKey()]: 'fig' } as never);
          }
          Object.assign(shown, dims());
          resetCount();
          stopSweep();
          sweepFade = -1;
          if (source !== 'init') {
            introAt = now + (reduced ? -1e6 : 40);
            snapProgress();
            chainAt = now + 500;
            geo = null;
          }
        }
        if (source === 'init') {
          Object.assign(shown, dims());
          snapProgress();
        }
        const geomKeys = ['g', 'a', 'c', 'h', 's'];
        const geomChanged = geomKeys.some((x) => changed.has(x));
        if (geomChanged && source !== 'sim') {
          resetCount();
          stopSweep();
        }
        if (['sp', 'st', 'sz'].some((x) => changed.has(x)) && source !== 'init') {
          if (!pendingCount) resetCount();
          const isDrei = k === 'trap' && step() === 'drei';
          if (isDrei !== lastDrei) chainAt = now + (reduced ? -1e6 : 200);
          if (source === 'replace' && changed.has('fig')) snapProgress();
        }
        if (source === 'replace') {
          resetCount();
          stopSweep();
        }
        lastDrei = k === 'trap' && step() === 'drei';
        const A = formulaArea(k, dims());
        if (source === 'init' || changed.has('fig')) areaGlide.snap(A);
        else areaGlide.go(A, 550);
        if (!drag && geo && source !== 'init') aimView(changed.has('fig') ? 0 : 750);
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        now = performance.now();
        const k = kind();
        const st = step();
        stopSweep();
        if (id === 'go') {
          resetCount();
          if (k === 'para') setStep(st === 'rect' ? 'fig' : 'rect');
          else if (st === 'fig' || st === 'drei') setStep('erg');
          else if (st === 'erg') setStep('rect');
          else setStep('fig');
        } else if (id === 'split') {
          resetCount();
          setStep(st === 'drei' ? 'fig' : 'drei');
        } else if (id === 'count') {
          if (k === 'trap' && st === 'drei') return;
          resetCount();
          if (st !== 'rect') setStep('rect');
          pendingCount = true;
        } else if (id === 'shear') {
          resetCount();
          if (!p.sch) ctx.set({ sch: true });
          if (st !== 'fig') setStep('fig');
          pendingSweep = true;
          aimView(700);
        }
        updateActions();
        ctx.requestRender();
      },

      render() {
        now = performance.now();
        const dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        const morphing = stepShown(dt);
        const progressing = stepProgress(dt);
        if (!geo || geo.W !== surface.width || geo.H !== surface.height) {
          geo = computeGeo();
          aimView(0);
          viewKey = '';
        }
        // Ansicht nachführen, wenn sich der Ausschnitt ändert (nicht während des Ziehens)
        const b = worldBox();
        const key = `${b.x0}|${b.y0}|${b.x1}|${b.y1}`;
        if (key !== viewKey && !drag) {
          if (viewKey) aimView(700);
          viewKey = key;
        }
        view = { cell: vCell.at(now), ox: vOx.at(now), oy: vOy.at(now) };
        // Ergebnisliste nachziehen, sobald der Flächeninhalt im Bild bekannt wird
        if (areaKnown() !== readoutKnown) updateReadouts();
        // Abläufe starten, sobald die Herleitung steht
        if (pendingCount && animIdle() && prog.K >= 1) {
          pendingCount = false;
          countAt = now + (reduced ? -1e6 : 150);
          counted = true;
          if (reduced) countAt = now - 1e6;
        }
        if (pendingSweep && animIdle() && atFigure()) {
          pendingSweep = false;
          const d = dims();
          sweep = { t0: now, s0: d.s, R: sweepRange(d), dur: reduced ? 1 : 5200 };
          if (reduced) stopSweep();
        }
        if (sweep && now - sweep.t0 >= sweep.dur) stopSweep();

        hits = [];
        surface.begin();
        const gm = geo;
        const g = surface.g;
        drawPaper(gm.paper);
        g.save();
        roundRect(g, gm.paper.x, gm.paper.y, gm.paper.w, gm.paper.h, 12);
        g.clip();
        drawScene();
        drawLegend(gm.paper);
        g.restore();
        g.save();
        g.globalAlpha *= seg(intro(), 0.2, 0.7);
        drawCards(gm.panel, [formulaCard(), stepsCard(), checkCard()]);
        g.restore();

        const busy =
          morphing ||
          progressing ||
          intro() < 1 ||
          vCell.busy(now) ||
          vOx.busy(now) ||
          vOy.busy(now) ||
          areaGlide.busy(now) ||
          chainBusy() ||
          pendingCount ||
          pendingSweep ||
          sweep !== null ||
          sweepFade >= 0 ||
          (countAt >= 0 && (now - countAt) / 1000 < countTotal() + 0.2);
        if (busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
