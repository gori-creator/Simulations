import { defineSimulation, ease, mixColor, offscreenCanvas, Plot, prefersReducedMotion, roundRect, scaledSprite, seededRandom, Surface, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  argMax,
  decimals,
  completeSquare,
  equals,
  inDomain,
  isZero,
  linValue,
  niceAtLeast,
  ONE,
  probeSequence,
  problem,
  rat,
  tableXs,
  toNumber,
  value,
  type Inputs,
  type Lin,
  type Problem,
  type Rational,
  type Situation,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    this.goal = goal;
    this.tau = tau;
    this.tw = null;
  }
  glide(goal: number, dur: number, delay: number, now: number): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur };
  }
  get moving(): boolean {
    return this.tw !== null || this.v !== this.goal;
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, ease.inOutCubic(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return false;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

type RowKind = 'eq' | 'result' | 'text' | 'hint' | 'try' | 'thead' | 'trow';
interface Cell {
  f: string;
  color?: string;
  weight?: number;
}
/** Eine Zeile der Karte (Rechenweg, Probieren oder Wertetabelle). */
interface Row {
  key: string;
  kind: RowKind;
  /** Formel (Kurzschrift aus formula.ts) bzw. Text bei text/hint */
  f: string;
  note?: string;
  tag?: string;
  cells?: Cell[];
  /** Hervorhebung in der Tabelle */
  hl?: 'max' | 'cur' | 'both';
  /** Erscheinzeitpunkt in der Schritt-Animation (ms nach Beginn) */
  at?: number;
  /** Überschrift des Abschnitts, der mit dieser Zeile beginnt (Animation) */
  cap?: string;
  sep?: boolean;
}
interface RowState {
  row: Row;
  src: string;
  prev: string | null;
  tc: number;
  y: number;
  alpha: number;
  live: boolean;
  h: number;
  lines: string[];
  idx: number;
}
interface ProbeKey {
  from: number;
  x: number;
  t0: number;
  t1: number;
}
/** „Maximum suchen“: erst probieren, dann rechnen, dann den Scheitel zeigen. */
interface Story {
  t0: number;
  sit: Situation;
  keys: ProbeKey[];
  probeEnd: number;
  calcAt: Map<string, number>;
  resultAt: number;
  end: number;
  xv: number;
}
interface Swap {
  from: Situation;
  inp: Inputs;
  x: number;
  t0: number;
}
/** Ziehbarer Griff in der Szene: läuft auf der Strecke A (x = lo) → B (x = hi). */
interface Knob {
  px: number;
  py: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  lo: number;
  hi: number;
}
interface Num {
  a: number;
  b: number;
  c: number;
  lo: number;
  hi: number;
  f1: [number, number];
  f2: [number, number];
  xv: number;
  yv: number;
}

const X_KEY: Record<Situation, 'x' | 'xt' | 'xp' | 'xg'> = { wall: 'x', free: 'x', tri: 'xt', price: 'xp', gutter: 'xg' };

/**
 * Extremwertaufgaben mit Parabeln (ohne Ableitung): Gehege an der Mauer bzw.
 * ohne Mauer, Rechteck im rechtwinkligen Dreieck, Eintrittspreis und Erlös,
 * Regenrinne. Links die Sachsituation als Bild, daneben der Graph der
 * quadratischen Zielfunktion – beide über die Variable x gekoppelt (Regler,
 * Griff in der Szene, Punkt auf dem Graphen). „Maximum suchen“ probiert erst
 * und rechnet dann mit quadratischer Ergänzung die Scheitelform aus.
 */
export default defineSimulation({
  id: 'extremwert-parabel',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.42 },
  images: { grass: 'wiese.webp', wall: 'mauer.webp', wood: 'holzdreieck.webp', metal: 'blech.webp' },
  groups: [
    { id: 'data', label: L('Angaben der Aufgabe', 'Given data') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'sit',
      type: 'choice',
      label: L('Sachsituation', 'Situation'),
      options: [
        { value: 'wall', label: L('Gehege an einer Mauer', 'Enclosure against a wall') },
        { value: 'free', label: L('Gehege ohne Mauer (Umfang fest)', 'Enclosure without a wall (fixed perimeter)') },
        { value: 'tri', label: L('Rechteck im Dreieck', 'Rectangle in a triangle') },
        { value: 'price', label: L('Eintrittspreis und Erlös', 'Ticket price and revenue') },
        { value: 'gutter', label: L('Regenrinne aus einem Blechstreifen', 'Gutter from a metal strip') },
      ],
      default: 'wall',
    },
    {
      key: 'x',
      type: 'number',
      label: L('Breite x des Geheges', 'Width x of the enclosure'),
      help: L('Auch am Griff im Bild oder am Punkt auf dem Graphen ziehen.', 'You can also drag the handle in the picture or the point on the graph.'),
      min: 0,
      max: 50,
      step: 0.1,
      default: 6,
      unit: 'm',
      visibleIf: (v) => v.sit === 'wall' || v.sit === 'free',
    },
    {
      key: 'xt',
      type: 'number',
      label: L('Breite x des Rechtecks', 'Width x of the rectangle'),
      help: L('Auch an der Ecke auf der Hypotenuse ziehen.', 'You can also drag the corner on the hypotenuse.'),
      min: 0,
      max: 120,
      step: 0.5,
      default: 20,
      unit: 'cm',
      visibleIf: (v) => v.sit === 'tri',
    },
    {
      key: 'xp',
      type: 'number',
      label: L('Preiserhöhung x', 'Price increase x'),
      help: L('Negativ: Preissenkung. Auch an der Ecke im Bild ziehen.', 'Negative: price cut. You can also drag the corner in the picture.'),
      min: -30,
      max: 60,
      step: 0.1,
      default: 0,
      unit: '€',
      visibleIf: (v) => v.sit === 'price',
    },
    {
      key: 'xg',
      type: 'number',
      label: L('Höhe x des Randes', 'Height x of the side'),
      help: L('Auch am Rand der Rinne ziehen.', 'You can also drag the edge of the gutter.'),
      min: 0,
      max: 50,
      step: 0.1,
      default: 4,
      unit: 'cm',
      visibleIf: (v) => v.sit === 'gutter',
    },
    { key: 'L', type: 'number', group: 'data', label: L('Zaunlänge L', 'Fence length L'), min: 8, max: 100, step: 2, default: 40, unit: 'm', visibleIf: (v) => v.sit === 'wall' || v.sit === 'free' },
    { key: 'a', type: 'number', group: 'data', label: L('Kathete a (waagrecht)', 'Leg a (horizontal)'), min: 20, max: 120, step: 2, default: 80, unit: 'cm', visibleIf: (v) => v.sit === 'tri' },
    { key: 'b', type: 'number', group: 'data', label: L('Kathete b (senkrecht)', 'Leg b (vertical)'), min: 20, max: 120, step: 2, default: 60, unit: 'cm', visibleIf: (v) => v.sit === 'tri' },
    { key: 'p', type: 'number', group: 'data', label: L('Preis bisher', 'Current price'), min: 2, max: 30, step: 0.5, default: 8, unit: '€', visibleIf: (v) => v.sit === 'price' },
    { key: 'n', type: 'number', group: 'data', label: L('Besucher bisher', 'Current visitors'), min: 50, max: 600, step: 10, default: 300, visibleIf: (v) => v.sit === 'price' },
    {
      key: 'k',
      type: 'number',
      group: 'data',
      label: L('Besucher weniger je 1 € mehr', 'Fewer visitors per €1 more'),
      min: 5,
      max: 60,
      step: 1,
      default: 20,
      visibleIf: (v) => v.sit === 'price',
    },
    { key: 's', type: 'number', group: 'data', label: L('Breite des Blechstreifens', 'Width of the metal strip'), min: 10, max: 100, step: 2, default: 30, unit: 'cm', visibleIf: (v) => v.sit === 'gutter' },
    {
      key: 'card',
      type: 'choice',
      group: 'view',
      label: L('Karte rechts', 'Card on the right'),
      options: [
        { value: 'calc', label: L('Rechenweg (quadratische Ergänzung)', 'Working (completing the square)') },
        { value: 'table', label: L('Wertetabelle', 'Table of values') },
      ],
      default: 'calc',
    },
    {
      key: 'sol',
      type: 'boolean',
      group: 'view',
      label: L('Maximum und Rechenweg zeigen', 'Show maximum and working'),
      help: L('Aus: Scheitel und Rechnung verdeckt (für Aufgaben). „Maximum suchen“ zeigt sie.', 'Off: vertex and working hidden (for tasks). “Find the maximum” shows them.'),
      default: true,
    },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz im Graphen', 'Grid in the graph'), default: true },
  ],
  actions: [{ id: 'search', label: L('Maximum suchen', 'Find the maximum'), primary: true }],
  readouts: [
    { key: 'f', label: L('Zielfunktion', 'Objective function') },
    { key: 'D', label: L('Definitionsbereich', 'Domain') },
    { key: 'now', label: L('Aktuell', 'Right now') },
    { key: 'vf', label: L('Scheitelform', 'Vertex form'), spoiler: true },
    { key: 'max', label: L('Maximum', 'Maximum'), spoiler: true },
  ],
  resultsParam: 'sol',
  presets: [
    { id: 'start', label: L('Gehege an der Mauer: 40 m Zaun', 'Enclosure against a wall: 40 m of fence'), values: {} },
    { id: 'free', label: L('Ohne Mauer: das Quadrat gewinnt', 'Without a wall: the square wins'), values: { sit: 'free', x: 4 } },
    { id: 'tri', label: L('Rechteck aus einem dreieckigen Brett', 'Rectangle cut from a triangular board'), values: { sit: 'tri', xt: 16 } },
    { id: 'price', label: L('Eintrittspreis: höher oder nicht?', 'Ticket price: raise it or not?'), values: { sit: 'price', xp: 0 } },
    { id: 'cut', label: L('Hier lohnt eine Preissenkung', 'Here a price cut pays off'), values: { sit: 'price', p: 12, n: 200, k: 25, xp: 0 } },
    { id: 'gutter', label: L('Regenrinne mit größtem Querschnitt', 'Gutter with the largest cross-section'), values: { sit: 'gutter', xg: 3 } },
  ],
  strings: {
    de: {
      canvas: 'Links eine Sachsituation (z. B. ein rechteckiges Gehege an einer Mauer mit fester Zaunlänge), rechts der Graph der quadratischen Zielfunktion. Die Variable x lässt sich am Griff im Bild, am Punkt auf dem Graphen oder am Regler verändern. Daneben der Rechenweg mit quadratischer Ergänzung bzw. eine Wertetabelle.',
      calc: 'Rechenweg',
      table: 'Wertetabelle',
      probe: 'Probieren',
      wall: 'Gehege an der Mauer',
      free: 'Gehege ohne Mauer',
      tri: 'Rechteck im Dreieck',
      price: 'Eintrittspreis',
      gutter: 'Regenrinne',
      nArea: 'Fläche',
      nRev: 'Erlös',
      nSect: 'Querschnitt',
      nFence: 'Zaun',
      nStrip: 'Blechstreifen',
      nLine: 'Strahlensatz',
      nDemand: 'Preis und Besucher',
      nTarget: 'Zielfunktion',
      nExp: 'ausmultiplizieren',
      nFac: '{a} ausklammern',
      nAdd: 'quadratisch ergänzen',
      nBin: 'binomische Formel',
      nVf: 'Scheitelform',
      nMax: 'a < 0 ⇒ Maximum',
      capProbe: 'Probieren',
      capTarget: 'Zielfunktion aufstellen',
      capSquare: 'Quadratisch ergänzen',
      capMax: 'Maximum ablesen',
      better: 'besser',
      worse: 'schlechter',
      first: 'Start',
      probeHint: 'Welches x liefert den größten Wert? Wir probieren …',
      hidden: 'Wo liegt das Maximum? Probiere mit dem Regler oder klicke auf „Maximum suchen“.',
      tabMax: 'Größter Wert in der Tabelle bei x = {x}.',
      tabMaxSym: 'Größter Wert bei x = {x} – links und rechts davon sind die Werte symmetrisch.',
      tabNear: 'Größter Tabellenwert bei x = {x}. Das Maximum liegt in der Nähe – genauer mit dem Rechenweg.',
      resWall: 'Größte Fläche {z} bei Breite {x} und Länge {y}: Das Gehege ist doppelt so lang wie breit.',
      resFree: 'Größte Fläche {z} bei {x} mal {y}: Das beste Rechteck ist ein Quadrat.',
      resTri: 'Größte Fläche {z} bei Breite {x} und Höhe {y}: Die Ecke liegt in der Mitte der Hypotenuse, das Rechteck ist halb so groß wie das Dreieck.',
      resPriceUp: 'Größter Erlös {z} beim Preis {p} statt {p0}: Dann kommen {n} Besucher.',
      resPriceDown: 'Eine Preissenkung lohnt sich: größter Erlös {z} beim Preis {p} statt {p0}, dann kommen {n} Besucher.',
      resPriceSame: 'Der bisherige Preis {p0} ist schon optimal: größter Erlös {z}.',
      resGutter: 'Größter Querschnitt {z} bei {x} hohen Rändern und {y} breitem Boden: Der Boden ist doppelt so breit wie ein Rand hoch.',
      optWall: '✓ Länge = 2 · Breite',
      optFree: '✓ Quadrat',
      optTri: '✓ Ecke in der Mitte',
      optPrice: '✓ größter Erlös',
      optGutter: '✓ Boden = 2 · Höhe',
      edge: 'Randwert: keine Fläche mehr',
      fence: 'Zaun {L}',
      strip: 'Streifen {s}',
      visitors: 'Besucher',
      priceAxis: 'Preis',
      before: 'bisher',
      wallWord: 'Mauer',
      board: 'Brett',
      axX: 'x in {u}',
      axY: '{z} in {u}',
      people: '1 Figur = {k} Besucher',
    },
    en: {
      canvas: 'On the left a real-world situation (e.g. a rectangular enclosure against a wall with a fixed length of fence), on the right the graph of the quadratic objective function. The variable x can be changed with the handle in the picture, the point on the graph or the slider. Next to it the working by completing the square or a table of values.',
      calc: 'Working',
      table: 'Table of values',
      probe: 'Trial and error',
      wall: 'Enclosure at a wall',
      free: 'Free enclosure',
      tri: 'Rectangle in a triangle',
      price: 'Ticket price',
      gutter: 'Gutter',
      nArea: 'area',
      nRev: 'revenue',
      nSect: 'cross-section',
      nFence: 'fence',
      nStrip: 'metal strip',
      nLine: 'intercept theorem',
      nDemand: 'price and visitors',
      nTarget: 'objective function',
      nExp: 'expand',
      nFac: 'factor out {a}',
      nAdd: 'complete the square',
      nBin: 'binomial formula',
      nVf: 'vertex form',
      nMax: 'a < 0 ⇒ maximum',
      capProbe: 'Trial and error',
      capTarget: 'Set up the objective function',
      capSquare: 'Complete the square',
      capMax: 'Read off the maximum',
      better: 'better',
      worse: 'worse',
      first: 'start',
      probeHint: 'Which x gives the largest value? Let us try …',
      hidden: 'Where is the maximum? Try the slider or click “Find the maximum”.',
      tabMax: 'Largest value in the table at x = {x}.',
      tabMaxSym: 'Largest value at x = {x} – the values on either side are symmetric.',
      tabNear: 'Largest table value at x = {x}. The maximum is nearby – the working gives it exactly.',
      resWall: 'Largest area {z} for width {x} and length {y}: the enclosure is twice as long as it is wide.',
      resFree: 'Largest area {z} for {x} by {y}: the best rectangle is a square.',
      resTri: 'Largest area {z} for width {x} and height {y}: the corner lies at the midpoint of the hypotenuse, the rectangle is half the triangle.',
      resPriceUp: 'Largest revenue {z} at a price of {p} instead of {p0}: then {n} visitors come.',
      resPriceDown: 'A price cut pays off: largest revenue {z} at a price of {p} instead of {p0}, then {n} visitors come.',
      resPriceSame: 'The current price {p0} is already optimal: largest revenue {z}.',
      resGutter: 'Largest cross-section {z} with sides {x} high and a bottom {y} wide: the bottom is twice as wide as a side is high.',
      optWall: '✓ length = 2 · width',
      optFree: '✓ square',
      optTri: '✓ corner at the midpoint',
      optPrice: '✓ largest revenue',
      optGutter: '✓ bottom = 2 · height',
      edge: 'boundary value: no area left',
      fence: 'Fence {L}',
      strip: 'Strip {s}',
      visitors: 'visitors',
      priceAxis: 'price',
      before: 'before',
      wallWord: 'wall',
      board: 'board',
      axX: 'x in {u}',
      axY: '{z} in {u}',
      people: '1 figure = {k} visitors',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const P = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (all, k: string) => vars[k] ?? all);
    const editable = () => !ctx.locked;
    const sit = () => P.sit as Situation;

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { f: s[0]!, warn: s[1]!, opt: s[2]!, area: s[3]!, x: s[4]!, y: s[5]! };
    };
    const palette = (): Record<string, string> => {
      const c = C();
      return { f: c.f, a: c.area, x: c.x, y: c.y, o: c.opt, w: c.warn, m: th().muted };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)');

    /* ---------- Fotos (optional, sonst gezeichnete Ersatzgrafik) ---------- */

    /** Mauer: Rollschicht oben und zwei Ziegelreihen (Bildzeilen 0–50, endet an einer Fuge). */
    const WALL_CROP: Rect = { x: 0, y: 0, w: 677, h: 50 };
    /** Blech: ganzes Foto (gleichmäßig hell, ohne Lichtfleck). */
    const METAL_CROP: Rect = { x: 0, y: 0, w: 1536, h: 512 };
    const patterns = new Map<string, { key: string; p: CanvasPattern }>();
    /**
     * Gekachelte Fototextur, Kachelbreite tileW CSS-Pixel (Seitenverhältnis wie im Foto);
     * bei mirror wird jede zweite Kachel gespiegelt, damit keine Naht entsteht.
     */
    function photoPattern(name: string, img: HTMLImageElement, tileW: number, crop: Rect | undefined, mirror: boolean): CanvasPattern | null {
      const dpr = surface.dpr;
      const tw = Math.max(8, Math.round(tileW));
      const cw = crop ? crop.w : img.width;
      const chh = crop ? crop.h : img.height;
      const tileH = Math.max(4, Math.round((tw * chh) / cw));
      const key = `${tw}|${tileH}|${dpr}`;
      const hit = patterns.get(name);
      if (hit && hit.key === key) return hit.p;
      const o = offscreenCanvas(mirror ? 2 * tw : tw, tileH, dpr);
      const sp = scaledSprite(img, tw, tileH, dpr, { crop });
      o.g.drawImage(sp, 0, 0, tw, tileH);
      if (mirror) o.g.drawImage(scaledSprite(img, tw, tileH, dpr, { crop, flipX: true }), tw, 0, tw, tileH);
      const p = surface.g.createPattern(o.canvas, 'repeat');
      if (!p) return null;
      p.setTransform(new DOMMatrix().scale(1 / dpr));
      patterns.set(name, { key, p });
      return p;
    }
    /** Fotoausschnitt gleichmäßig skaliert so, dass er das Rechteck r ganz bedeckt (mittig). */
    function drawCover(img: HTMLImageElement, crop: Rect, r: Rect): void {
      const k = Math.max(r.w / crop.w, r.h / crop.h);
      const w = Math.ceil(crop.w * k);
      const h = Math.ceil(crop.h * k);
      surface.g.drawImage(scaledSprite(img, w, h, surface.dpr, { crop }), r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
    }

    /* ---------- Aufteilung ---------- */

    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { scene: Rect; graph: Rect; card: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wide()) {
        const sh = Math.round(h * 0.28);
        const gh = Math.round(h * 0.27);
        return {
          scene: { x: 0, y: 0, w, h: sh },
          graph: { x: 0, y: sh + 6, w, h: gh },
          card: { x: 4, y: sh + gh + 14, w: w - 8, h: h - sh - gh - 18 },
        };
      }
      const colW = Math.round(Math.min(390, Math.max(232, w * 0.355)));
      const left = w - colW - 4;
      const sh = Math.round(h * 0.5);
      return {
        scene: { x: 0, y: 0, w: left, h: sh },
        graph: { x: 0, y: sh + 4, w: left, h: h - sh - 4 },
        card: { x: left + 8, y: 6, w: colW - 10, h: h - 12 },
      };
    }
    const textSize = () => {
      const w = surface.width;
      return !wide() ? 12.5 : w < 700 ? 11.5 : w < 900 ? 12.5 : 13.5;
    };

    const plot = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().graph,
      xAxis: { label: 'x' },
      yAxis: { label: 'A' },
    });

    /* ---------- Zustand ---------- */

    const exactInputs = (): Inputs => ({ L: P.L, a: P.a, b: P.b, p: P.p, n: P.n, k: P.k, s: P.s });
    const xParam = (s: Situation = sit()): number => P[X_KEY[s]];
    const D = { L: new Chan(P.L), a: new Chan(P.a), b: new Chan(P.b), p: new Chan(P.p), n: new Chan(P.n), k: new Chan(P.k), s: new Chan(P.s) };
    const shownInputs = (): Inputs => ({ L: D.L.v, a: D.a.v, b: D.b.v, p: D.p.v, n: D.n.v, k: D.k.v, s: D.s.v });
    const exact = (): Problem => problem(sit(), exactInputs());

    /** Zahlenwerte der Zielfunktion (für das Zeichnen, mit gleitenden Angaben). */
    function numOf(s: Situation, inp: Inputs): Num {
      const pr = problem(s, inp);
      const a = toNumber(pr.q.a);
      const b = toNumber(pr.q.b);
      const c = toNumber(pr.q.c);
      const xv = -b / (2 * a);
      return {
        a,
        b,
        c,
        lo: toNumber(pr.lo),
        hi: toNumber(pr.hi),
        f1: [toNumber(pr.f1[0]), toNumber(pr.f1[1])],
        f2: [toNumber(pr.f2[0]), toNumber(pr.f2[1])],
        xv,
        yv: (a * xv + b) * xv + c,
      };
    }
    const fv = (d: Num, x: number) => (d.a * x + d.b) * x + d.c;
    const clampX = (d: { lo: number; hi: number }, x: number) => Math.max(d.lo, Math.min(d.hi, x));

    const n0 = numOf(sit(), exactInputs());
    const X = new Chan(clampX(n0, xParam()));
    // Bereich des Graphen (gleitet)
    const G = { x0: new Chan(0), x1: new Chan(1), y1: new Chan(1) };
    // Bild-Ausschnitt der Szene (gleitet in Stufen, damit Größenänderungen sichtbar bleiben)
    const E = { w: new Chan(1), h: new Chan(1) };
    const kSol = new Chan(P.sol ? 1 : 0);
    const kOpt = new Chan(0);
    const kTable = new Chan(P.card === 'table' ? 1 : 0);

    let story: Story | null = null;
    let swap: Swap | null = null;
    let intro: number | null = reduced() ? null : performance.now();
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let knob: Knob | null = null;
    let knobHover = false;
    let knobDrag = false;
    const rowStates = new Map<string, RowState>();
    let cardH: number | null = null;

    const dragging = () => performance.now() - lastDrag < 300;
    const grab = () => {
      lastDrag = performance.now();
      cancelStory();
    };

    function setX(v: number): void {
      const key = X_KEY[sit()];
      if (key === 'x') ctx.set({ x: v });
      else if (key === 'xt') ctx.set({ xt: v });
      else if (key === 'xp') ctx.set({ xp: v });
      else ctx.set({ xg: v });
    }

    function cancelStory(): void {
      if (!story) return;
      X.jump(storyX(story, performance.now()) ?? X.v);
      story = null;
    }

    /* ---------- Griffe ---------- */

    plot.addHandle({
      get: () => {
        const d = numOf(sit(), shownInputs());
        return [X.v, fv(d, X.v)];
      },
      set: (x) => {
        grab();
        setX(clampX(numOf(sit(), exactInputs()), x));
      },
      axis: 'x',
      enabled: () => editable() && !swap,
      color: () => C().area,
    });

    // Griff in der Szene (Ecke bzw. Rand): läuft auf einer Strecke
    const knobT = (px: number, py: number): number | null => {
      if (!knob) return null;
      const dx = knob.bx - knob.ax;
      const dy = knob.by - knob.ay;
      const len2 = dx * dx + dy * dy;
      if (len2 < 1) return null;
      const t = clamp01(((px - knob.ax) * dx + (py - knob.ay) * dy) / len2);
      return lerp(knob.lo, knob.hi, t);
    };
    const onKnob = (px: number, py: number, touch = false) => !!knob && Math.hypot(px - knob.px, py - knob.py) < (touch ? 28 : 18);
    surface.addTarget({
      contains: (px: number, py: number) => editable() && onKnob(px, py, true),
      pointerDown: (q: { px: number; py: number; type: string }) => {
        if (!editable() || !onKnob(q.px, q.py, q.type === 'touch')) return false;
        knobDrag = true;
        grab();
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!knobDrag) return;
        const x = knobT(q.px, q.py);
        if (x === null) return;
        lastDrag = performance.now();
        setX(clampX(numOf(sit(), exactInputs()), x));
      },
      pointerUp: () => {
        knobDrag = false;
        surface.setCursor(knobHover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = !!q && editable() && onKnob(q.px, q.py);
        if (h !== knobHover) {
          knobHover = h;
          surface.setCursor(h ? 'grab' : '');
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------- Texte und Formeln ---------- */

    const unitX = (s: Situation = sit()) => (s === 'wall' || s === 'free' ? 'm' : s === 'price' ? '€' : 'cm');
    const unitZ = (s: Situation = sit()) => (s === 'wall' || s === 'free' ? 'm²' : s === 'price' ? '€' : 'cm²');
    const zName = (s: Situation = sit()) => (s === 'price' ? 'E' : 'A');
    const yName = (s: Situation = sit()) => (s === 'tri' ? 'h' : s === 'price' ? 'n' : 'y');
    const N = (v: number, d = 2) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, d);
    const money = (v: number) => {
      const r = Math.round(v * 100) / 100;
      return Math.abs(r - Math.round(r)) < 1e-9 ? fmt.num(r, 0) : fmt.fixed(r, 2);
    };
    const withU = (v: string, u: string) => (u === '€' ? `${v} €` : `${v} ${u}`);
    const fU = (v: string, u: string) => `${v} \\t{${u}}`;

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fitF(src: string, maxW: number, size: number, color: string, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /** Bruch als Formeltext: abbrechende Dezimalzahl (≤ 3 Stellen) oder gekürzter Bruch. */
    function rs(q: Rational): string {
      const dec = decimals(q, 3);
      if (q.d === 1 || dec !== null) return fmt.num(toNumber(q), 3);
      return `${q.n < 0 ? '−' : ''}\\f{${Math.abs(q.n)}}{${q.d}}`;
    }
    const absR = (q: Rational) => rat(Math.abs(q.n), q.d);
    interface Term {
      q: Rational;
      v: string;
    }
    /** Summe von Termen wie „−2x² + 40x“ (Nullen fallen weg, Einsen vor Variablen auch). */
    function sumSrc(terms: Term[]): string {
      let s = '';
      for (const t of terms) {
        if (isZero(t.q)) continue;
        const negT = t.q.n < 0;
        const abs = absR(t.q);
        const num = t.v && equals(abs, ONE) ? '' : rs(abs);
        if (!s) s = `${negT ? '−' : ''}${num}${t.v}`;
        else s += `${negT ? ' − ' : ' + '}${num}${t.v}`;
      }
      return s || '0';
    }
    const linSrc = (l: Lin) =>
      sumSrc([
        { q: l[0], v: '' },
        { q: l[1], v: 'x' },
      ]);
    const factorSrc = (l: Lin) => (isZero(l[0]) && equals(l[1], ONE) ? 'x' : `(${linSrc(l)})`);
    /** Faktor vor einer Klammer: „−2·“, „−“ bzw. „−\f{3}{4}·“ */
    const coefSrc = (a: Rational) => (equals(a, rat(-1)) ? '−' : equals(a, ONE) ? '' : `${rs(a)}·`);
    const sq = (q: Rational) => (q.d === 1 || decimals(q, 3) !== null ? `${rs(q)}²` : `(${rs(q)})²`);

    /** Haupt- und Nebenbedingung je nach Situation. */
    function modelRows(pr: Problem): Row[] {
      const s = pr.sit;
      const z = zName(s);
      const inp = exactInputs();
      const yLin = pr.f2;
      const out: Row[] = [];
      if (s === 'price') {
        out.push({ key: 'main', kind: 'eq', f: `\\c{a}{E} = \\c{x}{p} · \\c{y}{n}`, note: ctx.t('nRev') });
        out.push({ key: 'side', kind: 'eq', f: `\\c{x}{p} = ${linSrc(pr.f1)},  \\c{y}{n} = ${linSrc(yLin)}`, note: ctx.t('nDemand') });
      } else if (s === 'tri') {
        out.push({ key: 'main', kind: 'eq', f: `\\c{a}{A} = \\c{x}{x} · \\c{y}{h}`, note: ctx.t('nArea') });
        out.push({ key: 'side', kind: 'eq', f: `\\c{y}{h} = ${fmt.num(inp.b, 0)} − \\f{${fmt.num(inp.b, 0)}}{${fmt.num(inp.a, 0)}}x`, note: ctx.t('nLine') });
      } else {
        out.push({ key: 'main', kind: 'eq', f: `\\c{a}{${z}} = \\c{x}{x} · \\c{y}{y}`, note: ctx.t(s === 'gutter' ? 'nSect' : 'nArea') });
        const total = s === 'gutter' ? inp.s : inp.L;
        const cond = s === 'free' ? `2x + 2y = ${fmt.num(total, 0)}` : `2x + y = ${fmt.num(total, 0)}`;
        out.push({ key: 'side', kind: 'eq', f: `${cond}  ⇒  \\c{y}{y} = ${linSrc(yLin)}`, note: ctx.t(s === 'gutter' ? 'nStrip' : 'nFence') });
      }
      out.push({ key: 'target', kind: 'eq', f: `${z}(x) = ${factorSrc(pr.f1)} · ${factorSrc(pr.f2)}`, note: ctx.t('nTarget'), sep: true, cap: ctx.t('capTarget') });
      out.push({ key: 'exp', kind: 'eq', f: `= ${polySrc(pr)}`, note: ctx.t('nExp') });
      return out;
    }
    const polySrc = (pr: Problem) =>
      sumSrc([
        { q: pr.q.a, v: 'x²' },
        { q: pr.q.b, v: 'x' },
        { q: pr.q.c, v: '' },
      ]);

    /** Rechenweg: quadratische Ergänzung bis zur Scheitelform, Maximum, Deutung. */
    function calcRows(pr: Problem): Row[] {
      const rows = modelRows(pr);
      if (!P.sol) {
        rows.push({ key: 'hidden', kind: 'hint', f: ctx.t('hidden'), sep: true });
        return rows;
      }
      const z = zName(pr.sit);
      const st = completeSquare(pr.q);
      const a = coefSrc(st.a);
      const cTail = isZero(st.c) ? '' : ` ${st.c.n < 0 ? '−' : '+'} ${rs(absR(st.c))}`;
      const hAbs = absR(st.h);
      const shift = isZero(st.h) ? 'x' : `(x ${st.h.n < 0 ? '−' : '+'} ${rs(hAbs)})`;
      const yTail = isZero(st.yS) ? '' : ` ${st.yS.n < 0 ? '−' : '+'} ${rs(absR(st.yS))}`;
      if (!isZero(st.p)) {
        const inner = sumSrc([
          { q: ONE, v: 'x²' },
          { q: st.p, v: 'x' },
        ]);
        rows.push({ key: 'fac', kind: 'eq', f: `= ${a}(${inner})${cTail}`, note: tr('nFac', { a: fmt.num(toNumber(st.a), 3) }), sep: true, cap: ctx.t('capSquare') });
        rows.push({ key: 'add', kind: 'eq', f: `= ${a}(${inner} \\c{o}{+ ${sq(hAbs)} − ${sq(hAbs)}})${cTail}`, note: ctx.t('nAdd') });
        rows.push({ key: 'bin', kind: 'eq', f: `= ${a}(\\c{o}{${shift}²} − ${rs(st.h2)})${cTail}`, note: ctx.t('nBin') });
      }
      rows.push({ key: 'vf', kind: 'eq', f: `${z}(x) = ${a}${shift}²${yTail}`, note: ctx.t('nVf'), sep: isZero(st.p), cap: isZero(st.p) ? ctx.t('capSquare') : undefined });
      rows.push({ key: 'res', kind: 'result', f: `\\c{o}{S(${rs(st.xS)} | ${rs(st.yS)})}`, note: ctx.t('nMax'), cap: ctx.t('capMax') });
      rows.push({ key: 'txt', kind: 'text', f: resultText(pr), sep: true });
      return rows;
    }

    function resultText(pr: Problem): string {
      const st = completeSquare(pr.q);
      const xs = toNumber(st.xS);
      const yOther = linValue(pr.f2, xs);
      const u = unitX(pr.sit);
      const ux = (v: number) => withU(N(v, 2), u);
      const z = pr.sit === 'price' ? `${money(toNumber(st.yS))} €` : withU(N(toNumber(st.yS), 2), unitZ(pr.sit));
      if (pr.sit === 'price') {
        const p0 = `${money(P.p)} €`;
        const pNew = `${money(P.p + xs)} €`;
        const key = Math.abs(xs) < 1e-9 ? 'resPriceSame' : xs > 0 ? 'resPriceUp' : 'resPriceDown';
        return tr(key, { p: pNew, p0, n: N(yOther, 1), z });
      }
      const key = pr.sit === 'wall' ? 'resWall' : pr.sit === 'free' ? 'resFree' : pr.sit === 'tri' ? 'resTri' : 'resGutter';
      return tr(key, { x: ux(xs), y: ux(yOther), z });
    }

    /** Wertetabelle mit der aktuellen Zeile und dem größten Wert. */
    function tableRows(pr: Problem): Row[] {
      const rows = modelRows(pr).filter((r) => r.key === 'target');
      rows[0] = { ...rows[0]!, cap: undefined, sep: false };
      const s = pr.sit;
      const xs = tableXs(pr);
      const best = argMax(pr.q, xs);
      const c = C();
      const z = zName(s);
      const cols = (x: number): Cell[] => {
        const cells: Cell[] = [{ f: N(x, 2), color: c.x }];
        if (s === 'price') cells.push({ f: money(P.p + x), color: c.x });
        cells.push({ f: N(linValue(pr.f2, x), 2), color: c.y });
        cells.push({ f: N(value(pr.q, x), 2), color: c.area, weight: 700 });
        return cells;
      };
      const head: Cell[] = [{ f: `x \\t{in ${unitX(s)}}` }];
      if (s === 'price') head.push({ f: 'p' });
      head.push({ f: yName(s) });
      head.push({ f: `${z}(x)` });
      rows.push({ key: 'thead', kind: 'thead', f: '', cells: head, sep: true });
      const cur = Math.round(xParam() * 1000) / 1000;
      const cx = clampX({ lo: toNumber(pr.lo), hi: toNumber(pr.hi) }, cur);
      let curIn = false;
      const all: { x: number; cur: boolean }[] = xs.map((x) => {
        const isCur = Math.abs(x - cx) < 1e-6;
        if (isCur) curIn = true;
        return { x, cur: isCur };
      });
      if (!curIn) all.push({ x: cx, cur: true });
      all.sort((p1, p2) => p1.x - p2.x);
      // größter Wert unter allen angezeigten Zeilen – auch die eingeschobene aktuelle Zeile
      // kann größer sein als jeder Rasterwert (z. B. x = 4 zwischen 2,5 und 5)
      let bx = xs[best]!;
      if (!curIn && value(pr.q, cx) > value(pr.q, bx) + 1e-9) bx = cx;
      const onGrid = xs.includes(bx);
      for (const it of all) {
        const isMax = Math.abs(it.x - bx) < 1e-9;
        const hl = isMax && it.cur ? 'both' : isMax ? 'max' : it.cur ? 'cur' : undefined;
        rows.push({ key: it.cur && !xs.includes(it.x) ? 'tcur' : `t${it.x}`, kind: 'trow', f: '', cells: cols(it.x), hl });
      }
      const xv = toNumber(completeSquare(pr.q).xS);
      const exactHit = Math.abs(bx - xv) < 1e-9;
      // „symmetrisch“ nur, wenn das Maximum ein Rasterwert ist (dann liegt das Raster symmetrisch dazu)
      const hintKey = exactHit ? (onGrid ? 'tabMaxSym' : 'tabMax') : P.sol ? 'tabNear' : 'tabMax';
      rows.push({ key: 'thint', kind: 'hint', f: tr(hintKey, { x: withU(N(bx, 2), unitX(s)) }), sep: true });
      return rows;
    }

    /** Zeilen beim Probieren (Schritt-Animation). */
    function probeRows(pr: Problem, st: Story): Row[] {
      const rows = modelRows(pr).filter((r) => r.key === 'target');
      rows[0] = { ...rows[0]!, cap: undefined, sep: false };
      rows.push({ key: 'phint', kind: 'hint', f: ctx.t('probeHint'), sep: true, at: 0 });
      const z = zName(pr.sit);
      let prev: number | null = null;
      st.keys.forEach((k, i) => {
        const v = value(pr.q, k.x);
        const note = prev === null ? ctx.t('first') : v > prev + 1e-9 ? `↑ ${ctx.t('better')}` : `↓ ${ctx.t('worse')}`;
        prev = v;
        rows.push({ key: `try${i}`, kind: 'try', tag: `${i + 1}.`, f: `x = ${fU(N(k.x, 2), unitX(pr.sit))}  →  ${z} = ${fU(N(v, 2), unitZ(pr.sit))}`, note, at: k.t1 });
      });
      return rows;
    }

    function currentRows(now: number): { title: string; rows: Row[] } {
      const pr = exact();
      if (story) {
        const t = now - story.t0;
        if (t < story.probeEnd) return { title: ctx.t('probe'), rows: probeRows(pr, story) };
        // die Zielfunktion steht schon da und bleibt einfach stehen
        const rows = calcRows(pr).map((r) => ({ ...r, at: r.key === 'target' ? undefined : (story!.calcAt.get(r.key) ?? 0) }));
        return { title: ctx.t('calc'), rows };
      }
      if (P.card === 'table') return { title: ctx.t('table'), rows: tableRows(pr) };
      return { title: ctx.t('calc'), rows: calcRows(pr) };
    }

    /* ---------- Ergebnisse (Text) ---------- */

    function htmlRat(q: Rational): string {
      if (q.d === 1 || decimals(q, 3) !== null) return fmt.num(toNumber(q), 3);
      return `${q.n < 0 ? '−' : ''}<span class="frac"><span>${Math.abs(q.n)}</span><span>${q.d}</span></span>`;
    }
    function htmlSum(terms: { q: Rational; v: string }[]): string {
      const parts: string[] = [];
      for (const t of terms) {
        if (isZero(t.q)) continue;
        const abs = absR(t.q);
        const num = t.v && equals(abs, ONE) ? '' : htmlRat(abs);
        parts.push(`${parts.length ? (t.q.n < 0 ? ' − ' : ' + ') : t.q.n < 0 ? '−' : ''}${num}${t.v}`);
      }
      return parts.join('') || '0';
    }
    const hx = '<var>x</var>';
    const hLin = (l: Lin) =>
      htmlSum([
        { q: l[0], v: '' },
        { q: l[1], v: hx },
      ]);
    const hFac = (l: Lin) => (isZero(l[0]) && equals(l[1], ONE) ? hx : `(${hLin(l)})`);

    function updateReadouts(): void {
      const pr = exact();
      const s = pr.sit;
      const z = `<var>${zName(s)}</var>`;
      const poly = htmlSum([
        { q: pr.q.a, v: `${hx}<sup>2</sup>` },
        { q: pr.q.b, v: hx },
        { q: pr.q.c, v: '' },
      ]);
      ctx.readout('f', { html: `${z}(${hx}) = ${hFac(pr.f1)} · ${hFac(pr.f2)} = ${poly}` });
      const lo = htmlRat(pr.lo);
      const hi = htmlRat(pr.hi);
      const de = ctx.lang === 'de';
      const dom = pr.open ? (de ? `]${lo}; ${hi}[` : `(${lo}, ${hi})`) : de ? `[${lo}; ${hi}]` : `[${lo}, ${hi}]`;
      ctx.readout('D', { html: `<var>D</var> = ${dom} &nbsp;(${unitX(s)})` });
      const x = clampX({ lo: toNumber(pr.lo), hi: toNumber(pr.hi) }, xParam());
      const yv = linValue(pr.f2, x);
      const zv = value(pr.q, x);
      const yPart = s === 'price' ? `<var>p</var> = ${money(P.p + x)} €, <var>n</var> = ${N(yv, 1)}` : `<var>${yName(s)}</var> = ${withU(N(yv, 2), unitX(s))}`;
      ctx.readout('now', { html: `${hx} = ${withU(N(x, 2), unitX(s))}: ${yPart}, ${z} = ${withU(N(zv, 2), unitZ(s))}` });
      const st = completeSquare(pr.q);
      const sh = isZero(st.h) ? hx : `(${hx} ${st.h.n < 0 ? '−' : '+'} ${htmlRat(absR(st.h))})<sup>2</sup>`;
      const coef = equals(st.a, rat(-1)) ? '−' : `${htmlRat(st.a)} · `;
      const yTail = isZero(st.yS) ? '' : ` ${st.yS.n < 0 ? '−' : '+'} ${htmlRat(absR(st.yS))}`;
      ctx.readout('vf', { html: `${z}(${hx}) = ${coef}${sh}${isZero(st.h) ? '<sup>2</sup>' : ''}${yTail}` });
      ctx.readout('max', {
        html: `S(${htmlRat(st.xS)} | ${htmlRat(st.yS)}): ${hx} = ${withU(N(toNumber(st.xS), 3), unitX(s))}, ${z}<sub>max</sub> = ${withU(N(toNumber(st.yS), 3), unitZ(s))}`,
      });
    }

    /* ---------- Zeichnen: Hilfen ---------- */

    function pill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; weight?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? textSize();
      const color = opts.color ?? th().text;
      const box = opts.maxW ? fitF(src, opts.maxW, size, color, opts.weight ?? 700) : formula(g, src, fstyle(size, color, opts.weight ?? 700));
      const align = opts.align ?? 'center';
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha = a;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 9;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, rr.h / 2);
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.4;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, rr.h / 2);
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    const pillW = (src: string, size: number) => formula(surface.g, src, fstyle(size, th().text, 700)).w + 16;

    function dot(x: number, y: number, color: string, r: number, alpha = 1): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01) return;
      g.save();
      g.globalAlpha = alpha;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.38));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
      g.restore();
    }

    /** Ziehbarer Griff in der Szene (Halo, Kugel, beim Überfahren größer). */
    function drawKnob(x: number, y: number, color: string, alpha: number): void {
      const g = surface.g;
      if (alpha <= 0.01) return;
      const active = knobHover || knobDrag;
      g.save();
      g.globalAlpha = alpha * (active ? 0.3 : 0.17);
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, active ? 15 : 12, 0, TAU);
      g.fill();
      g.restore();
      dot(x, y, color, active ? 7.5 : 6.5, alpha);
    }

    /** Maßlinie mit Pfeilspitzen und Beschriftung in der Mitte. */
    function dim(x0: number, y0: number, x1: number, y1: number, color: string, label: string, alpha: number, opts: { labelAt?: 'mid' | 'left' | 'right'; size?: number } = {}): Rect | null {
      const g = surface.g;
      if (alpha <= 0.01) return null;
      const len = Math.hypot(x1 - x0, y1 - y0);
      const ux = len > 0 ? (x1 - x0) / len : 1;
      const uy = len > 0 ? (y1 - y0) / len : 0;
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 1.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      // Endstriche
      g.moveTo(x0 - uy * 5, y0 + ux * 5);
      g.lineTo(x0 + uy * 5, y0 - ux * 5);
      g.moveTo(x1 - uy * 5, y1 + ux * 5);
      g.lineTo(x1 + uy * 5, y1 - ux * 5);
      g.stroke();
      if (len > 18) {
        for (const [px, py, dx, dy] of [
          [x0, y0, ux, uy],
          [x1, y1, -ux, -uy],
        ] as const) {
          g.beginPath();
          g.moveTo(px, py);
          g.lineTo(px + dx * 7 - dy * 3.2, py + dy * 7 + dx * 3.2);
          g.lineTo(px + dx * 7 + dy * 3.2, py + dy * 7 - dx * 3.2);
          g.closePath();
          g.fill();
        }
      }
      g.restore();
      const size = opts.size ?? textSize() - 0.5;
      const at = opts.labelAt ?? 'mid';
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      if (at === 'mid') return pill(mx, my, label, { color, size, alpha, border: mixColor(color, th().bg, 0.55) });
      return pill(at === 'left' ? Math.min(x0, x1) - 10 : Math.max(x0, x1) + 10, my, label, { color, size, alpha, align: at === 'left' ? 'right' : 'left', border: mixColor(color, th().bg, 0.55) });
    }

    function softPanel(r: Rect, fill: string | CanvasGradient, alpha: number, radius = 14): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.13)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      g.fillStyle = fill;
      roundRect(g, r.x, r.y, r.w, r.h, radius);
      g.fill();
      g.restore();
    }

    /** Ergebnis-Zahl in der Szene, z. B. „A = 192 m²“ – zählt mit den gleitenden Werten weich mit. */
    function areaLabel(cx: number, cy: number, v: number, s: Situation, alpha: number, size: number): Rect {
      const u = unitZ(s);
      const num = s === 'price' ? money(v) : N(v, 2);
      return pill(cx, cy, `${zName(s)} = ${fU(num, u)}`, { color: C().area, size, alpha, border: mixColor(C().area, th().bg, 0.45), weight: 800 });
    }

    /* ---------- Szenen ---------- */

    // Grasbüschel (fest, damit nichts flackert)
    const tufts = (() => {
      const rnd = seededRandom(7);
      return Array.from({ length: 120 }, () => ({ x: rnd(), y: rnd(), h: 2.5 + rnd() * 3, l: rnd() < 0.5 ? -1 : 1 }));
    })();
    const band = (v: number, step: number) => Math.max(step, Math.ceil(v / step - 1e-9) * step);

    /** Gehege von oben: an der Mauer (drei Seiten Zaun) oder frei (vier Seiten). */
    function drawPen(r: Rect, inp: Inputs, x: number, alpha: number, free: boolean, setKnob: boolean): void {
      const g = surface.g;
      const c = C();
      const dark = th().dark;
      const Lv = inp.L;
      const half = Lv / 2;
      const y = Math.max(0, free ? half - x : Lv - 2 * x);
      const W = free ? E.w.v / 2 : E.w.v;
      const H = E.w.v / 2;
      const small = r.w < 420;
      const size = textSize() - (small ? 1 : 0.5);
      const field = { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 10 };
      const grassImg = ctx.images.get('grass');
      const wallImg = ctx.images.get('wall');
      const wallH = free ? 0 : wallImg ? 22 : 15;
      const barH = r.h > 180 ? 30 : 0;
      // links Platz für die Maßangabe (x an der Mauer, y ohne Mauer), auch mit zwei Nachkommastellen
      const padL = Math.max(small ? 74 : 92, pillW(`x = ${fU(`${N(half, 0)},75`, 'm')}`, size) + 18);
      const padR = 16;
      const padT = wallH + (free ? 26 : 2);
      const padB = 30 + barH;
      const s = Math.max(0.01, Math.min((field.w - padL - padR) / W, (field.h - padT - padB) / H));
      const ax = field.x + padL;
      const aw = field.w - padL - padR;
      const cx = ax + aw / 2;

      // Wiese
      const grass = c.opt;
      const grad = g.createLinearGradient(0, field.y, 0, field.y + field.h);
      grad.addColorStop(0, mixColor(grass, th().bg, dark ? 0.74 : 0.76));
      grad.addColorStop(1, mixColor(grass, th().bg, dark ? 0.84 : 0.86));
      softPanel(field, grad, alpha);
      const turf = grassImg ? photoPattern('grass', grassImg, Math.min(360, Math.max(220, field.w * 0.5)), undefined, false) : null;
      if (turf) {
        // Rasen von oben, aufgehellt bzw. abgedunkelt, damit Zaun, Maße und Fläche klar bleiben
        g.save();
        g.globalAlpha = alpha;
        g.beginPath();
        roundRect(g, field.x, field.y, field.w, field.h, 14);
        g.clip();
        g.fillStyle = turf;
        g.fillRect(field.x, field.y, field.w, field.h);
        g.fillStyle = dark ? mixColor(th().bg, th().bg, 0, 0.5) : mixColor(grass, '#ffffff', 0.86, 0.5);
        g.fillRect(field.x, field.y, field.w, field.h);
        if (barH) {
          // ruhiger Streifen unten für die Zaun-Leiste
          const vb = g.createLinearGradient(0, field.y + field.h - barH - 12, 0, field.y + field.h);
          vb.addColorStop(0, mixColor(th().bg, th().bg, 0, 0));
          vb.addColorStop(0.45, mixColor(th().bg, th().bg, 0, dark ? 0.55 : 0.62));
          vb.addColorStop(1, mixColor(th().bg, th().bg, 0, dark ? 0.7 : 0.78));
          g.fillStyle = vb;
          g.fillRect(field.x, field.y + field.h - barH - 12, field.w, barH + 12);
        }
        g.restore();
      }
      g.save();
      g.globalAlpha = alpha * (turf ? 0 : 0.55);
      g.strokeStyle = mixColor(grass, th().bg, dark ? 0.45 : 0.5);
      g.lineWidth = 1.2;
      g.lineCap = 'round';
      g.beginPath();
      for (const t of tufts) {
        const px = field.x + 8 + t.x * (field.w - 16);
        const py = field.y + wallH + 8 + t.y * (field.h - wallH - 14);
        g.moveTo(px, py);
        g.lineTo(px + t.l * 1.6, py - t.h);
        g.moveTo(px + 2, py);
        g.lineTo(px + 2 - t.l * 1.2, py - t.h * 0.8);
      }
      g.stroke();
      g.restore();

      // Mauer
      if (!free) {
        g.save();
        g.globalAlpha = alpha;
        g.beginPath();
        roundRect(g, field.x, field.y, field.w, field.h, 14);
        g.clip();
        const brick = dark ? '#7d4936' : '#c27453';
        g.fillStyle = brick;
        g.fillRect(field.x, field.y, field.w, wallH);
        const bricks = wallImg ? photoPattern('wall', wallImg, (wallH * WALL_CROP.w) / WALL_CROP.h, WALL_CROP, true) : null;
        if (bricks) {
          g.save();
          g.translate(field.x, field.y);
          g.fillStyle = bricks;
          g.fillRect(0, 0, field.w, wallH);
          if (dark) {
            g.fillStyle = 'rgba(10,12,20,0.32)';
            g.fillRect(0, 0, field.w, wallH);
          }
          g.restore();
        }
        g.strokeStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,240,225,0.75)';
        g.lineWidth = 1;
        g.beginPath();
        const rowH = wallH / 2;
        for (let row = 0; row < (bricks ? 0 : 2); row++) {
          const yy = field.y + row * rowH;
          g.moveTo(field.x, Math.round(yy + rowH) + 0.5);
          g.lineTo(field.x + field.w, Math.round(yy + rowH) + 0.5);
          for (let bx = field.x + (row ? 11 : 0); bx < field.x + field.w; bx += 22) {
            g.moveTo(Math.round(bx) + 0.5, yy);
            g.lineTo(Math.round(bx) + 0.5, yy + rowH);
          }
        }
        g.stroke();
        // Schatten unter der Mauer
        const sg = g.createLinearGradient(0, field.y + wallH, 0, field.y + wallH + 9);
        sg.addColorStop(0, dark ? 'rgba(0,0,0,0.45)' : 'rgba(40,30,20,0.22)');
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = sg;
        g.fillRect(field.x, field.y + wallH, field.w, 9);
        g.restore();
        g.save();
        g.globalAlpha = alpha * 0.9;
        g.font = `700 ${Math.max(10, size - 2.5)}px ${th().font}`;
        g.fillStyle = '#ffffff';
        if (bricks) {
          g.shadowColor = 'rgba(40,16,8,0.85)';
          g.shadowBlur = 4;
        }
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText(ctx.t('wallWord').toUpperCase(), field.x + field.w - 14, field.y + wallH / 2 + 0.5);
        g.restore();
      }

      // Rechteck (Gehege)
      let rect: Rect;
      let A: [number, number];
      let B: [number, number];
      if (!free) {
        const top = field.y + wallH;
        rect = { x: cx - (y * s) / 2, y: top, w: y * s, h: x * s };
        A = [cx + (Lv * s) / 2, top];
        B = [cx, top + half * s];
      } else {
        const bottom = field.y + padT + H * s;
        const left = cx - (W * s) / 2;
        rect = { x: left, y: bottom - y * s, w: x * s, h: y * s };
        A = [left, bottom - half * s];
        B = [left + half * s, bottom];
      }
      // mögliche Lagen der Ecke (gestrichelt)
      g.save();
      g.globalAlpha = alpha * (turf ? 0.85 : 0.5);
      g.strokeStyle = mixColor(c.area, th().bg, turf ? 0.05 : 0.2);
      g.lineWidth = turf ? 1.6 : 1.3;
      g.setLineDash([3, 5]);
      g.beginPath();
      g.moveTo(A[0], A[1]);
      g.lineTo(B[0], B[1]);
      g.stroke();
      g.restore();

      // Boden des Geheges (Stroh)
      if (rect.w > 0.5 && rect.h > 0.5) {
        g.save();
        g.globalAlpha = alpha;
        const sgr = g.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
        sgr.addColorStop(0, mixColor(c.area, th().bg, dark ? 0.5 : 0.55));
        sgr.addColorStop(1, mixColor(c.area, th().bg, dark ? 0.62 : 0.7));
        g.fillStyle = sgr;
        g.fillRect(rect.x, rect.y, rect.w, rect.h);
        // feine Strohstriche
        g.beginPath();
        g.rect(rect.x, rect.y, rect.w, rect.h);
        g.clip();
        g.strokeStyle = mixColor(c.area, th().bg, dark ? 0.3 : 0.35, 0.35);
        g.lineWidth = 1;
        g.beginPath();
        for (const t of tufts) {
          const px = rect.x + t.x * rect.w;
          const py = rect.y + t.y * rect.h;
          g.moveTo(px - 3, py + t.l);
          g.lineTo(px + 3, py - t.l);
        }
        g.stroke();
        g.restore();
      }

      // Zaun: Querlatte und Pfosten
      const wood = dark ? '#b08960' : '#8a5a2f';
      const path: [number, number][] = free
        ? [
            [rect.x, rect.y + rect.h],
            [rect.x, rect.y],
            [rect.x + rect.w, rect.y],
            [rect.x + rect.w, rect.y + rect.h],
            [rect.x, rect.y + rect.h],
          ]
        : [
            [rect.x, rect.y],
            [rect.x, rect.y + rect.h],
            [rect.x + rect.w, rect.y + rect.h],
            [rect.x + rect.w, rect.y],
          ];
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(40,30,20,0.3)';
      g.shadowBlur = 4;
      g.shadowOffsetY = 2;
      g.strokeStyle = wood;
      g.lineWidth = 3;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.beginPath();
      path.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
      g.restore();
      const stepM = niceAtLeast(18 / s);
      g.save();
      g.globalAlpha = alpha;
      g.fillStyle = mixColor(wood, '#000000', 0.25);
      for (let i = 0; i + 1 < path.length; i++) {
        const [x0, y0] = path[i]!;
        const [x1, y1] = path[i + 1]!;
        const len = Math.hypot(x1 - x0, y1 - y0) / s;
        const n = Math.max(1, Math.round(len / stepM));
        for (let j = 0; j <= n; j++) {
          if (j === n && i + 2 < path.length) continue;
          const t = j / n;
          const px = lerp(x0, x1, t);
          const py = lerp(y0, y1, t);
          g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
        }
      }
      g.restore();

      // Maße
      const lab = (v: number) => fU(N(v, 2), 'm');
      if (!free) {
        const dx = field.x + padL - 14;
        if (rect.h > 1) {
          g.save();
          g.globalAlpha = alpha * 0.5;
          g.strokeStyle = c.x;
          g.lineWidth = 1;
          g.setLineDash([2, 3]);
          g.beginPath();
          g.moveTo(rect.x - 4, rect.y + rect.h);
          g.lineTo(dx - 4, rect.y + rect.h);
          g.stroke();
          g.restore();
        }
        dim(dx, rect.y, dx, rect.y + rect.h, c.x, `x = ${lab(x)}`, alpha, { labelAt: 'left', size });
        dim(rect.x, rect.y + rect.h + 16, rect.x + rect.w, rect.y + rect.h + 16, c.y, `y = ${lab(y)}`, alpha, { size });
      } else {
        dim(rect.x, rect.y + rect.h + 16, rect.x + rect.w, rect.y + rect.h + 16, c.x, `x = ${lab(x)}`, alpha, { size });
        dim(rect.x - 14, rect.y, rect.x - 14, rect.y + rect.h, c.y, `y = ${lab(y)}`, alpha, { labelAt: 'left', size });
      }

      // Fläche
      const zA = x * y;
      const big = Math.min(19, Math.max(12.5, size + 3));
      const lw = pillW(`A = ${fU(N(zA, 2), 'm²')}`, big);
      const fits = rect.h > big * 2.4 && rect.w > lw + 6;
      if (fits) areaLabel(rect.x + rect.w / 2, rect.y + rect.h / 2, zA, free ? 'free' : 'wall', alpha, big);
      else if (!free) {
        // rechts neben dem Gehege kein Platz (breit und flach): unter die Maßlinie y, sonst läge die Zahl auf dem Griff
        const right = rect.x + rect.w + lw + 14 <= field.x + field.w - 8;
        if (right) areaLabel(rect.x + rect.w + lw / 2 + 14, field.y + wallH + 22, zA, 'wall', alpha, big - 1);
        else areaLabel(rect.x + rect.w / 2, rect.y + rect.h + 44, zA, 'wall', alpha, big - 1);
      }
      else {
        // rechts kein Platz: über das Gehege, links vom Griff (Ecke oben rechts)
        const right = rect.x + rect.w + lw + 16 <= field.x + field.w - 8;
        if (right) areaLabel(rect.x + rect.w + lw / 2 + 16, rect.y + rect.h / 2, zA, 'free', alpha, big - 1);
        else areaLabel(Math.max(field.x + lw / 2 + 8, Math.min(rect.x + rect.w / 2, rect.x + rect.w - lw / 2 - 16)), Math.max(field.y + 16, rect.y - 20), zA, 'free', alpha, big - 1);
      }

      // Zaun als Streifen (Nebenbedingung)
      if (barH) {
        const by = field.y + field.h - 17;
        const segs = free ? [x, y, x, y] : [x, y, x];
        const bs = Math.min(s, (aw - 8) / Lv);
        const total = Lv * bs;
        let bx = cx - total / 2;
        g.save();
        g.globalAlpha = alpha;
        segs.forEach((v, i) => {
          const w = v * bs;
          const col = i % 2 === 0 ? c.x : c.y;
          g.fillStyle = mixColor(col, th().bg, dark ? 0.35 : 0.3);
          roundRect(g, bx + 1, by - 6, Math.max(0, w - 2), 12, 6);
          g.fill();
          if (w > 26) {
            const box = formula(g, i % 2 === 0 ? 'x' : 'y', fstyle(size - 1, dark ? '#0b1020' : '#ffffff', 800));
            box.draw(g, bx + w / 2 - box.w / 2, by + (box.asc - box.desc) / 2);
          }
          bx += w;
        });
        g.restore();
        g.save();
        g.globalAlpha = alpha;
        g.font = `600 ${size - 1}px ${th().font}`;
        g.fillStyle = th().muted;
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText(tr('fence', { L: withU(N(Lv, 0), 'm') }), cx - total / 2 - 8, by);
        g.restore();
      }

      // Lösungshinweis
      const ko = kOpt.v * alpha;
      if (ko > 0.01) pill(field.x + field.w - 12, field.y + wallH + (free ? 16 : 20), ctx.t(free ? 'optFree' : 'optWall'), { color: c.opt, border: mixColor(c.opt, th().bg, 0.4), align: 'right', size, alpha: ko });

      const kx = !free ? rect.x + rect.w : rect.x + rect.w;
      const ky = !free ? rect.y + rect.h : rect.y;
      if (setKnob) knob = { px: kx, py: ky, ax: A[0], ay: A[1], bx: B[0], by: B[1], lo: 0, hi: half };
      drawKnob(kx, ky, c.area, alpha);
    }

    /** Dreieckiges Brett mit dem Rechteck, dessen Ecke auf der Hypotenuse liegt. */
    function drawTri(r: Rect, inp: Inputs, x: number, alpha: number, setKnob: boolean): void {
      const g = surface.g;
      const c = C();
      const dark = th().dark;
      const a = inp.a;
      const b = inp.b;
      const h = Math.max(0, b - (b / a) * x);
      const small = r.w < 420;
      const size = textSize() - (small ? 1 : 0.5);
      // links Platz für die Maßangabe h (rechtsbündig neben der Maßlinie), rechts für „a = … cm“
      const hLabW = pillW(`h = ${fU(`${N(b, 0)},75`, 'cm')}`, size);
      g.save();
      g.font = `600 ${size - 1}px ${th().font}`;
      const aLabel = `a = ${N(a, 0)} cm`;
      const aLabW = g.measureText(aLabel).width;
      g.restore();
      const padL = Math.max(small ? 82 : 100, hLabW + 24);
      const padB = 38;
      const padT = 16;
      const padR = Math.max(20, aLabW + 14);
      const s = Math.max(0.01, Math.min((r.w - padL - padR) / E.w.v, (r.h - padT - padB) / E.h.v));
      const ox = r.x + padL + Math.max(0, (r.w - padL - padR - E.w.v * s) / 2);
      const oy = r.y + r.h - padB;
      const P0: [number, number] = [ox, oy];
      const PA: [number, number] = [ox + a * s, oy];
      const PB: [number, number] = [ox, oy - b * s];

      // Brett
      g.save();
      g.globalAlpha = alpha;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(40,30,20,0.25)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 5;
      const wg = g.createLinearGradient(ox, oy - b * s, ox + a * s, oy);
      wg.addColorStop(0, dark ? '#8a6a48' : '#e2c296');
      wg.addColorStop(1, dark ? '#6e5236' : '#cfa772');
      g.fillStyle = wg;
      g.beginPath();
      g.moveTo(...P0);
      g.lineTo(...PA);
      g.lineTo(...PB);
      g.closePath();
      g.fill();
      g.restore();
      const woodImg = ctx.images.get('wood');
      if (woodImg) {
        // Holzmaserung aus dem Inneren des Fotos, in die rechtwinklige Form eingeschnitten (unverzerrt)
        g.save();
        g.beginPath();
        g.moveTo(...P0);
        g.lineTo(...PA);
        g.lineTo(...PB);
        g.closePath();
        g.clip();
        // Foto des Dreiecksbretts (rechter Winkel unten links, Katheten an den Bildrändern): gleichmäßig so groß
        // skaliert und am rechten Winkel angelegt, dass es das gezeichnete Dreieck ganz enthält – unverzerrt
        const kw = Math.max((a * s) / woodImg.naturalWidth, (b * s) / woodImg.naturalHeight);
        const ww = woodImg.naturalWidth * kw;
        const wh = woodImg.naturalHeight * kw;
        g.drawImage(scaledSprite(woodImg, ww, wh, surface.dpr), ox, oy - wh, ww, wh);
        // leichte Schattierung wie beim gezeichneten Brett, im Dunkelmodus gedämpft
        const sh = g.createLinearGradient(ox, oy - b * s, ox + a * s, oy);
        sh.addColorStop(0, dark ? 'rgba(20,12,6,0.32)' : 'rgba(255,250,240,0.08)');
        sh.addColorStop(1, dark ? 'rgba(20,12,6,0.5)' : 'rgba(120,80,40,0.14)');
        g.fillStyle = sh;
        g.fillRect(ox, oy - b * s, a * s, b * s);
        g.restore();
      }
      // Maserung
      g.save();
      if (woodImg) g.globalAlpha = 0;
      g.beginPath();
      g.moveTo(...P0);
      g.lineTo(...PA);
      g.lineTo(...PB);
      g.closePath();
      g.clip();
      g.strokeStyle = dark ? 'rgba(30,18,8,0.35)' : 'rgba(120,80,40,0.22)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 14; i++) {
        const yy = oy - ((i + 0.5) / 14) * b * s;
        g.beginPath();
        for (let px = ox; px <= ox + a * s; px += 8) {
          const wv = Math.sin(px / 37 + i * 1.7) * 2.2 + Math.sin(px / 13 + i) * 0.8;
          if (px === ox) g.moveTo(px, yy + wv);
          else g.lineTo(px, yy + wv);
        }
        g.stroke();
      }
      g.restore();
      g.strokeStyle = dark ? '#4b3826' : '#a57d4b';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(...P0);
      g.lineTo(...PA);
      g.lineTo(...PB);
      g.closePath();
      g.stroke();
      g.restore();

      // Rechteck
      const rw = x * s;
      const rh = h * s;
      if (rw > 0.5 && rh > 0.5) {
        g.save();
        g.globalAlpha = alpha;
        g.fillStyle = mixColor(c.area, '#ffffff', dark ? 0.1 : 0.35, dark ? 0.62 : 0.72);
        g.fillRect(ox, oy - rh, rw, rh);
        g.strokeStyle = dark ? '#f1e6d6' : '#3b2a1a';
        g.lineWidth = 1.6;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(ox, oy - rh);
        g.lineTo(ox + rw, oy - rh);
        g.lineTo(ox + rw, oy);
        g.stroke();
        g.restore();
      }
      // rechter Winkel
      g.save();
      g.globalAlpha = alpha * 0.8;
      g.strokeStyle = dark ? '#f1e6d6' : '#3b2a1a';
      g.lineWidth = 1.2;
      g.strokeRect(ox + 1, oy - 11, 10, 10);
      g.restore();

      // Maße
      dim(ox, oy + 16, ox + rw, oy + 16, c.x, `x = ${fU(N(x, 2), 'cm')}`, alpha, { size });
      dim(ox - 16, oy - rh, ox - 16, oy, c.y, `h = ${fU(N(h, 2), 'cm')}`, alpha, { labelAt: 'left', size });
      g.save();
      g.globalAlpha = alpha;
      g.font = `600 ${size - 1}px ${th().font}`;
      g.fillStyle = th().muted;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      g.fillText(aLabel, PA[0] + 8, oy);
      g.textAlign = 'right';
      g.fillText(`b = ${N(b, 0)} cm`, ox - 8, PB[1] + 2);
      g.restore();

      // Fläche
      const zA = x * h;
      const big = Math.min(18, Math.max(12, size + 2.5));
      const lw = pillW(`A = ${fU(N(zA, 2), 'cm²')}`, big);
      if (rh > big * 2.4 && rw > lw + 6) areaLabel(ox + rw / 2, oy - rh / 2, zA, 'tri', alpha, big);
      else areaLabel(Math.min(r.x + r.w - lw / 2 - 8, ox + a * s * 0.62 + lw / 2), r.y + padT + 12, zA, 'tri', alpha, big - 1);

      const ko = kOpt.v * alpha;
      if (ko > 0.01) pill(r.x + r.w - 12, r.y + padT + (rh > big * 2.4 && rw > lw + 6 ? 10 : 42), ctx.t('optTri'), { color: c.opt, border: mixColor(c.opt, th().bg, 0.4), align: 'right', size, alpha: ko });
      const kx = ox + rw;
      const ky = oy - rh;
      if (setKnob) knob = { px: kx, py: ky, ax: PB[0], ay: PB[1], bx: PA[0], by: PA[1], lo: 0, hi: a };
      drawKnob(kx, ky, c.area, alpha);
    }

    /** Erlös als Rechteck: Breite = Besucher, Höhe = Preis. Figuren zeigen die Besucher. */
    function drawPrice(r: Rect, inp: Inputs, x: number, alpha: number, setKnob: boolean): void {
      const g = surface.g;
      const c = C();
      const dark = th().dark;
      const price = inp.p + x;
      const nn = Math.max(0, inp.n - inp.k * x);
      const pMax = inp.p + inp.n / inp.k;
      const nMax = inp.n + inp.k * inp.p;
      const small = r.w < 420;
      const size = textSize() - (small ? 1 : 0.5);
      const padL = small ? 84 : 100;
      const padB = 52;
      const padT = 22;
      const padR = 26;
      const field = { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 10 };
      const sx = (field.w - padL - padR) / E.w.v;
      const sy = (field.h - padT - padB) / E.h.v;
      const ox = field.x + padL;
      const oy = field.y + field.h - padB;
      softPanel(field, th().dark ? 'rgba(30,38,52,0.85)' : 'rgba(255,255,255,0.9)', alpha);

      // Achsen
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = th().axis;
      g.fillStyle = th().axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(ox, oy);
      g.lineTo(field.x + field.w - 12, oy);
      g.moveTo(ox, oy);
      g.lineTo(ox, field.y + 10);
      g.stroke();
      for (const [px, py, ang] of [
        [field.x + field.w - 12, oy, 0],
        [ox, field.y + 10, -Math.PI / 2],
      ] as const) {
        g.save();
        g.translate(px, py);
        g.rotate(ang);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(-7, -3.5);
        g.lineTo(-7, 3.5);
        g.closePath();
        g.fill();
        g.restore();
      }
      g.font = `600 ${size - 1.5}px ${th().font}`;
      g.fillStyle = th().muted;
      g.textAlign = 'right';
      g.textBaseline = 'bottom';
      g.fillText(ctx.t('visitors'), field.x + field.w - 14, oy - 4);
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText(ctx.t('priceAxis'), ox + 8, field.y + 8);
      g.restore();

      // Preis-Besucher-Gerade
      const PA: [number, number] = [ox, oy - pMax * sy];
      const PB: [number, number] = [ox + nMax * sx, oy];
      g.save();
      g.globalAlpha = alpha * 0.6;
      g.strokeStyle = th().muted;
      g.lineWidth = 1.4;
      g.setLineDash([5, 5]);
      g.beginPath();
      g.moveTo(...PA);
      g.lineTo(...PB);
      g.stroke();
      g.restore();

      // bisher (gestrichelt)
      const r0 = { x: ox, y: oy - inp.p * sy, w: inp.n * sx, h: inp.p * sy };
      g.save();
      g.globalAlpha = alpha * 0.55;
      g.strokeStyle = th().muted;
      g.lineWidth = 1.2;
      g.setLineDash([3, 4]);
      g.strokeRect(r0.x, r0.y, r0.w, r0.h);
      g.restore();

      // Erlös-Rechteck
      const rw = nn * sx;
      const rh = price * sy;
      if (rw > 0.5 && rh > 0.5) {
        g.save();
        g.globalAlpha = alpha;
        const gr = g.createLinearGradient(0, oy - rh, 0, oy);
        gr.addColorStop(0, mixColor(c.area, th().bg, dark ? 0.45 : 0.5));
        gr.addColorStop(1, mixColor(c.area, th().bg, dark ? 0.6 : 0.68));
        g.fillStyle = gr;
        g.fillRect(ox, oy - rh, rw, rh);
        g.strokeStyle = c.area;
        g.lineWidth = 2;
        g.strokeRect(ox, oy - rh, rw, rh);
        g.restore();
      }
      // „bisher“-Marke
      if (Math.abs(x) > 0.05) {
        g.save();
        g.globalAlpha = alpha * 0.85;
        g.font = `600 ${size - 2}px ${th().font}`;
        g.fillStyle = th().muted;
        g.textAlign = 'left';
        const lowRoom = r0.y - 2 < field.y + 26;
        g.textBaseline = lowRoom ? 'top' : 'bottom';
        g.fillText(ctx.t('before'), r0.x + r0.w + 4, lowRoom ? r0.y + 3 : r0.y - 2);
        g.restore();
      }

      // Besucher als Figuren unter der Achse
      const axisW = nMax * sx;
      const per = niceAtLeast((nMax / Math.max(6, axisW / 11)) * 1.0001);
      const count = Math.floor(nMax / per);
      const fw = per * sx;
      g.save();
      for (let i = 0; i < count; i++) {
        const cxp = ox + (i + 0.5) * fw;
        const on = clamp01((nn - i * per) / per);
        const was = i * per < inp.n ? 1 : 0;
        const a = on > 0.01 ? 0.25 + 0.75 * on : was ? 0.16 : 0;
        if (a <= 0.01) continue;
        const sc = Math.min(1, fw / 10);
        g.globalAlpha = alpha * a;
        g.fillStyle = on > 0.01 ? c.y : th().muted;
        const yy = oy + 14;
        g.beginPath();
        g.arc(cxp, yy - 5.5 * sc, 2.6 * sc, 0, TAU);
        g.fill();
        roundRect(g, cxp - 3.6 * sc, yy - 2.2 * sc, 7.2 * sc, 7 * sc, 2.8 * sc);
        g.fill();
      }
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.font = `500 ${size - 2.5}px ${th().font}`;
      g.fillStyle = th().muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      g.fillText(tr('people', { k: N(per, 0) }), field.x + field.w - 12, oy + 34);
      g.restore();

      // Maße
      dim(ox - 16, oy - rh, ox - 16, oy, c.x, `p = ${money(price)} €`, alpha, { labelAt: 'left', size });
      pill(ox + Math.min(rw / 2, axisW), oy + 34, `n = ${N(nn, 1)}`, { color: c.y, size, alpha, border: mixColor(c.y, th().bg, 0.55) });

      // Erlös
      const zE = price * nn;
      const big = Math.min(18, Math.max(12, size + 2.5));
      const lw = pillW(`E = ${fU(money(zE), '€')}`, big);
      if (rh > big * 2.4 && rw > lw + 6) areaLabel(ox + rw / 2, oy - rh / 2, zE, 'price', alpha, big);
      else areaLabel(Math.min(field.x + field.w - lw / 2 - 10, ox + rw + lw / 2 + 14), Math.max(field.y + 22, oy - rh - 16), zE, 'price', alpha, big - 1);

      const ko = kOpt.v * alpha;
      if (ko > 0.01) pill(field.x + field.w - 12, field.y + 20, ctx.t('optPrice'), { color: c.opt, border: mixColor(c.opt, th().bg, 0.4), align: 'right', size, alpha: ko });
      const kx = ox + rw;
      const ky = oy - rh;
      if (setKnob) knob = { px: kx, py: ky, ax: PB[0], ay: PB[1], bx: PA[0], by: PA[1], lo: -inp.p, hi: inp.n / inp.k };
      drawKnob(kx, ky, c.area, alpha);
    }

    /** Regenrinne im Querschnitt (schräg gesehen) mit Wasser; darunter der abgewickelte Streifen. */
    function drawGutter(r: Rect, inp: Inputs, x: number, alpha: number, setKnob: boolean): void {
      const g = surface.g;
      const c = C();
      const dark = th().dark;
      const S = inp.s;
      const y = Math.max(0, S - 2 * x);
      const small = r.w < 420;
      const size = textSize() - (small ? 1 : 0.5);
      const padL = small ? 84 : 100;
      const barH = r.h > 170 ? 34 : 0;
      const padB = 34 + barH;
      const padT = 18;
      const padR = 22;
      const field = { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 10 };
      const depthX = Math.min(64, (field.w - padL - padR) * 0.16);
      const depthY = -Math.min(34, field.h * 0.13);
      const s = Math.max(0.01, Math.min((field.w - padL - padR - depthX) / E.w.v, (field.h - padT - padB + depthY) / (E.w.v / 2)));
      const cx = field.x + padL + (field.w - padL - padR - depthX) / 2;
      const oy = field.y + field.h - padB;
      softPanel(field, dark ? 'rgba(30,38,52,0.85)' : 'rgba(255,255,255,0.9)', alpha);

      const bw = y * s;
      const hh = x * s;
      const lx = cx - bw / 2;
      const rx = cx + bw / 2;
      const front: [number, number][] = [
        [lx, oy - hh],
        [lx, oy],
        [rx, oy],
        [rx, oy - hh],
      ];
      const back = front.map(([px, py]) => [px + depthX, py + depthY] as [number, number]);
      const metal = dark ? '#9aa7b8' : '#7b8796';
      const metalLight = dark ? '#5a6474' : '#dfe5ec';
      const metalMid = dark ? '#4a5362' : '#c7cfd9';
      g.save();
      g.globalAlpha = alpha;
      g.lineJoin = 'round';
      // Boden innen
      const quad = (p: [number, number][], fill: string) => {
        g.fillStyle = fill;
        g.beginPath();
        p.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.fill();
      };
      const metalImg = ctx.images.get('metal');
      /** Blechfoto in eine Fläche eingeschnitten; die gezeichnete Grundfarbe bleibt als Schattierung. */
      const sheet = (p: [number, number][], fill: string) => {
        quad(p, fill);
        if (!metalImg) return;
        const xs = p.map((q) => q[0]);
        const ys = p.map((q) => q[1]);
        const x0 = Math.min(...xs);
        const y0 = Math.min(...ys);
        const w = Math.max(...xs) - x0;
        const h = Math.max(...ys) - y0;
        if (w < 1 || h < 1) return;
        g.save();
        g.beginPath();
        p.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.clip();
        g.globalAlpha = alpha * (dark ? 0.3 : 0.5);
        g.globalCompositeOperation = dark ? 'soft-light' : 'multiply';
        drawCover(metalImg, METAL_CROP, { x: x0, y: y0, w, h });
        g.restore();
      };
      sheet([front[1]!, front[2]!, back[2]!, back[1]!], metalLight);
      sheet([front[0]!, front[1]!, back[1]!, back[0]!], metalMid);
      sheet([front[2]!, front[3]!, back[3]!, back[2]!], mixColor(metalMid, metalLight, 0.5));
      // hintere Kante
      g.strokeStyle = mixColor(metal, th().bg, 0.35);
      g.lineWidth = 1.6;
      g.beginPath();
      back.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      for (let i = 0; i < 4; i++) {
        g.moveTo(front[i]![0], front[i]![1]);
        g.lineTo(back[i]![0], back[i]![1]);
      }
      g.stroke();
      // Wasser
      if (hh > 0.5 && bw > 0.5) {
        const water = c.f;
        quad([front[0]!, front[3]!, back[3]!, back[0]!], mixColor(water, th().bg, dark ? 0.5 : 0.62, 0.75));
        const wg = g.createLinearGradient(0, oy - hh, 0, oy);
        wg.addColorStop(0, mixColor(water, th().bg, dark ? 0.35 : 0.45, 0.82));
        wg.addColorStop(1, mixColor(water, th().bg, dark ? 0.2 : 0.3, 0.88));
        g.fillStyle = wg;
        g.fillRect(lx, oy - hh, bw, hh);
      }
      // vorderes Profil
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.strokeStyle = metal;
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      front.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
      g.restore();
      g.strokeStyle = mixColor(metal, '#ffffff', 0.45);
      g.lineWidth = 1.2;
      g.beginPath();
      front.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
      g.restore();

      // Maße
      dim(lx - 16, oy - hh, lx - 16, oy, c.x, `x = ${fU(N(x, 2), 'cm')}`, alpha, { labelAt: 'left', size });
      dim(lx, oy + 18, rx, oy + 18, c.y, `y = ${fU(N(y, 2), 'cm')}`, alpha, { size });

      // abgewickelter Streifen
      if (barH) {
        const by = field.y + field.h - 16;
        const total = S * s;
        let bx = cx - total / 2;
        g.save();
        g.globalAlpha = alpha;
        [x, y, x].forEach((v, i) => {
          const w = v * s;
          const col = i % 2 === 0 ? c.x : c.y;
          g.fillStyle = mixColor(col, th().bg, dark ? 0.35 : 0.3);
          roundRect(g, bx + 1, by - 6, Math.max(0, w - 2), 12, 4);
          g.fill();
          if (w > 26) {
            const box = formula(g, i % 2 === 0 ? 'x' : 'y', fstyle(size - 1, dark ? '#0b1020' : '#ffffff', 800));
            box.draw(g, bx + w / 2 - box.w / 2, by + (box.asc - box.desc) / 2);
          }
          bx += w;
        });
        g.font = `600 ${size - 1}px ${th().font}`;
        g.fillStyle = th().muted;
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText(tr('strip', { s: withU(N(S, 0), 'cm') }), cx - total / 2 - 8, by);
        g.restore();
      }

      // Querschnitt
      const zA = x * y;
      const big = Math.min(18, Math.max(12, size + 2.5));
      const lw = pillW(`A = ${fU(N(zA, 2), 'cm²')}`, big);
      if (hh > big * 2.4 && bw > lw + 6) areaLabel(cx, oy - hh / 2, zA, 'gutter', alpha, big);
      else areaLabel(Math.min(field.x + field.w - lw / 2 - 10, rx + depthX + lw / 2 + 12), Math.max(field.y + 22, oy - hh - 12 + depthY), zA, 'gutter', alpha, big - 1);

      const ko = kOpt.v * alpha;
      if (ko > 0.01) pill(field.x + 12, field.y + 20, ctx.t('optGutter'), { color: c.opt, border: mixColor(c.opt, th().bg, 0.4), align: 'left', size, alpha: ko });
      const kx = rx;
      const ky = oy - hh;
      if (setKnob) knob = { px: kx, py: ky, ax: cx + (S * s) / 2, ay: oy, bx: cx, by: oy - (S / 2) * s, lo: 0, hi: S / 2 };
      drawKnob(kx, ky, c.area, alpha);
    }

    function drawScene(r: Rect, s: Situation, inp: Inputs, x: number, alpha: number, setKnob: boolean): void {
      if (alpha <= 0.01) return;
      if (s === 'wall' || s === 'free') drawPen(r, inp, x, alpha, s === 'free', setKnob);
      else if (s === 'tri') drawTri(r, inp, x, alpha, setKnob);
      else if (s === 'price') drawPrice(r, inp, x, alpha, setKnob);
      else drawGutter(r, inp, x, alpha, setKnob);
    }

    /** Bild-Ausschnitt der Szene (in Stufen, damit man Größenänderungen sieht). */
    function extentFor(s: Situation, inp: Inputs): { w: number; h: number } {
      if (s === 'wall' || s === 'free') return { w: band(inp.L, 10), h: 1 };
      if (s === 'tri') return { w: band(inp.a, 20), h: band(inp.b, 20) };
      if (s === 'gutter') return { w: band(inp.s, 10), h: 1 };
      return { w: inp.n + inp.k * inp.p, h: inp.p + inp.n / inp.k };
    }

    /* ---------- Graph ---------- */

    function graphRange(d: Num): { x0: number; x1: number; y1: number } {
      const w = d.hi - d.lo;
      return { x0: d.lo - 0.1 * w, x1: d.hi + 0.1 * w, y1: d.yv * 1.16 };
    }

    function strokeFn(f: (x: number) => number, x0: number, x1: number, color: string, width: number, opts: { dash?: number[]; glow?: boolean; alpha?: number } = {}): void {
      if (x1 <= x0) return;
      const g = surface.g;
      const { yMin, yMax } = plot.bounds;
      const span = yMax - yMin;
      const n = Math.max(24, Math.round((plot.px(x1) - plot.px(x0)) / 2.5));
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      if (opts.glow) {
        g.shadowColor = th().dark ? mixColor(color, '#000000', 0, 0.55) : mixColor(color, '#ffffff', 0, 0.35);
        g.shadowBlur = th().dark ? 10 : 6;
      }
      g.beginPath();
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        const y = Math.max(yMin - span, Math.min(yMax + span, f(x)));
        if (i) g.lineTo(plot.px(x), plot.py(y));
        else g.moveTo(plot.px(x), plot.py(y));
      }
      g.stroke();
      g.restore();
    }

    function drawCurve(d: Num, alpha: number, reveal: number): void {
      const g = surface.g;
      const c = C();
      const f = (x: number) => fv(d, x);
      const { xMin, xMax } = plot.bounds;
      const xr = xMin + (xMax - xMin) * reveal;
      if (alpha <= 0.01 || reveal <= 0) return;
      // Fläche unter dem sinnvollen Teil
      const a0 = d.lo;
      const a1 = Math.min(d.hi, xr);
      if (a1 > a0) {
        g.save();
        g.globalAlpha = alpha;
        const top = plot.py(d.yv);
        const grad = g.createLinearGradient(0, top, 0, plot.py(0));
        grad.addColorStop(0, mixColor(c.f, th().bg, 0, th().dark ? 0.2 : 0.14));
        grad.addColorStop(1, mixColor(c.f, th().bg, 0, 0.02));
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(plot.px(a0), plot.py(0));
        const n = 60;
        for (let i = 0; i <= n; i++) {
          const x = a0 + ((a1 - a0) * i) / n;
          g.lineTo(plot.px(x), plot.py(f(x)));
        }
        g.lineTo(plot.px(a1), plot.py(0));
        g.closePath();
        g.fill();
        g.restore();
      }
      // außerhalb des Definitionsbereichs blass
      strokeFn(f, xMin, Math.min(d.lo, xr), th().muted, 2, { dash: [5, 6], alpha: alpha * 0.55 });
      if (xr > d.hi) strokeFn(f, d.hi, xr, th().muted, 2, { dash: [5, 6], alpha: alpha * 0.55 });
      strokeFn(f, d.lo, Math.min(d.hi, xr), c.f, 3.4, { glow: true, alpha });
    }

    function drawGraph(now: number, d: Num, k: { curve: number; point: number; labels: number }): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const size = textSize();
      const s = sit();
      plot.begin();
      if (P.grid) plot.grid();
      plot.axes();

      // Definitionsbereich auf der x-Achse
      const ay = plot.py(0);
      const dl = plot.px(d.lo);
      const dr = plot.px(d.hi);
      g.save();
      g.globalAlpha = k.labels * 0.9;
      g.fillStyle = mixColor(c.x, th().bg, 0, th().dark ? 0.45 : 0.32);
      roundRect(g, dl, ay - 3, Math.max(0, dr - dl), 6, 3);
      g.fill();
      const ep = exact().open;
      for (const px of [dl, dr]) {
        g.beginPath();
        g.arc(px, ay, 4.2, 0, TAU);
        g.fillStyle = ep ? th().bg : c.x;
        g.fill();
        g.strokeStyle = c.x;
        g.lineWidth = 2;
        g.stroke();
      }
      g.restore();

      // Kurve (beim Umschalten blendet die alte aus)
      let curveA = 1;
      if (swap) {
        const e = clamp01((now - swap.t0) / 900);
        const od = numOf(swap.from, swap.inp);
        drawCurve(od, 1 - ease.outCubic(clamp01(e / 0.5)), 1);
        curveA = ease.inOutCubic(clamp01((e - 0.3) / 0.7));
      }
      drawCurve(d, curveA, swap ? 1 : k.curve);

      // Tabellenwerte als Punkte
      const kt = kTable.v * curveA;
      if (kt > 0.01 && !story) {
        const xs = tableXs(exact());
        xs.forEach((x, i) => {
          const e = intro !== null ? 1 : clamp01(kt * 1.6 - i * 0.08);
          dot(plot.px(x), plot.py(fv(d, x)), c.f, 4 * ease.outBack(e), kt);
        });
      }

      // Probier-Versuche
      if (story) {
        const t = now - story.t0;
        const fade = t > story.probeEnd ? 1 - clamp01((t - story.probeEnd) / 1500) * 0.6 : 1;
        story.keys.forEach((kk, i) => {
          if (t < kk.t1) return;
          const e = clamp01((t - kk.t1) / 400);
          const px = plot.px(kk.x);
          const py = plot.py(fv(d, kk.x));
          g.save();
          g.globalAlpha = fade * 0.9;
          g.strokeStyle = c.area;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(px, py, 5 + (1 - ease.outCubic(e)) * 10, 0, TAU);
          g.stroke();
          g.restore();
          if (t < story!.probeEnd) {
            const lbl = `${i + 1}`;
            g.save();
            g.globalAlpha = fade * ease.outCubic(e);
            g.font = `700 ${size - 2}px ${th().font}`;
            g.fillStyle = c.area;
            g.textAlign = 'center';
            g.textBaseline = 'bottom';
            g.fillText(lbl, px, py - 9);
            g.restore();
          }
        });
      }

      // Scheitel (Maximum)
      let kv = kSol.v * k.labels;
      if (story) kv = clamp01((now - story.t0 - story.resultAt) / 600);
      kv *= curveA;
      const xNow = X.v;
      const yNow = fv(d, xNow);
      if (kv > 0.01) {
        const px = plot.px(d.xv);
        const py = plot.py(d.yv);
        g.save();
        g.globalAlpha = kv * 0.75;
        g.strokeStyle = c.opt;
        g.lineWidth = 1.5;
        g.setLineDash([4, 5]);
        g.beginPath();
        g.moveTo(px, ay);
        g.lineTo(px, py);
        g.moveTo(plot.px(0) > r.x ? plot.px(0) : r.x, py);
        g.lineTo(px, py);
        g.stroke();
        g.restore();
        const pop = story ? ease.outBack(clamp01((now - story.t0 - story.resultAt) / 500)) : 1;
        g.save();
        g.globalAlpha = kv;
        g.fillStyle = th().bg;
        g.strokeStyle = c.opt;
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(px, py, 7 * pop, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        const near = Math.abs(plot.px(xNow) - px) < 70;
        const srcS = `S(${N(d.xv, 2)} | ${N(d.yv, 2)})`;
        const wS = pillW(srcS, size - 0.5);
        const right = px + wS + 14 < r.x + r.w;
        if (!near || kOpt.v > 0.5) pill(right ? px + 12 : px - 12, py - 20, srcS, { color: c.opt, border: mixColor(c.opt, th().bg, 0.4), align: right ? 'left' : 'right', size: size - 0.5, alpha: kv });
      }

      // aktueller Punkt mit „Höhe = Wert“
      const kp = k.point * curveA;
      if (kp > 0.01) {
        const px = plot.px(xNow);
        const py = plot.py(yNow);
        g.save();
        g.globalAlpha = kp * 0.85;
        const bg = g.createLinearGradient(0, py, 0, ay);
        bg.addColorStop(0, c.area);
        bg.addColorStop(1, mixColor(c.area, th().bg, 0.55));
        g.fillStyle = bg;
        roundRect(g, px - 3, Math.min(py, ay), 6, Math.abs(ay - py), 3);
        g.fill();
        g.restore();
        g.save();
        g.globalAlpha = kp;
        g.beginPath();
        g.arc(px, ay, 4, 0, TAU);
        g.fillStyle = c.x;
        g.fill();
        g.restore();
        dot(px, py, c.area, 6.5 * ease.outBack(clamp01(k.point)), kp);
        if (!(kOpt.v > 0.5 && kv > 0.5)) {
          const src = `${zName(s)}(${N(xNow, 2)}) = ${s === 'price' ? money(yNow) : N(yNow, 2)}`;
          const wl = pillW(src, size - 0.5);
          const leftSide = xNow < d.xv;
          let lx = leftSide ? px - 12 : px + 12;
          let align: 'left' | 'right' = leftSide ? 'right' : 'left';
          const yAx = plot.px(0);
          const hitsAxis = align === 'right' && yAx > r.x && lx - wl < yAx + 4 && lx > yAx - 46;
          let below = false;
          if (align === 'right' && (lx - wl < r.x + 50 || hitsAxis)) {
            lx = px + 12;
            align = 'left';
            // rechts davon läge der Scheitel: dann unter den Punkt
            below = kv > 0.01 && lx + wl > plot.px(d.xv) - 10;
          }
          if (align === 'left' && lx + wl > r.x + r.w - 4) {
            lx = px - 12;
            align = 'right';
          }
          const ly = below ? Math.min(ay - 26, py + 22) : Math.min(ay - 26, Math.max(r.y + 16, py - 18));
          pill(lx, ly, src, { color: c.area, border: mixColor(c.area, th().bg, 0.45), align, size: size - 0.5, alpha: kp * k.labels });
        }
      }

      plot.end();
    }

    /** Überschrift des aktuellen Abschnitts der Schritt-Animation (für den Kartenkopf). */
    function captionOf(now: number, st: Story, rows: Row[]): { src: string; start: number } {
      const t = now - st.t0;
      if (t < st.probeEnd - 150) return { src: `①  ${ctx.t('capProbe')}`, start: 0 };
      let cap = ctx.t('capTarget');
      let start = st.probeEnd;
      let no = 2;
      rows.forEach((row) => {
        if (row.cap && row.at !== undefined && t >= row.at - 150) {
          cap = row.cap;
          start = row.at;
          no++;
        }
      });
      return { src: `${'①②③④⑤⑥'[no - 1] ?? ''}  ${cap}`, start };
    }

    /* ---------- Karte ---------- */

    function cardFrame(r: Rect, alpha: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.97)' : 'rgba(255,255,255,0.98)';
      roundRect(g, r.x, r.y, r.w, r.h, 13);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 13);
      g.stroke();
      g.restore();
    }

    function wrap(textStr: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const words = textStr.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    const rowWeight = (row: Row, lines: number) =>
      row.kind === 'text' || row.kind === 'hint' ? 0.25 + lines * 0.62 : row.kind === 'result' ? 1.25 : row.kind === 'trow' || row.kind === 'thead' ? 0.82 : row.kind === 'try' ? 0.9 : 1;

    function drawCard(col: Rect, now: number, dt: number, alpha: number, introT: number | null): boolean {
      const g = surface.g;
      let anim = false;
      const { title, rows } = currentRows(now);
      let size = textSize() + (wide() ? 0.5 : 0);
      const pad = wide() ? 14 : 11;
      const inner = col.w - 2 * pad;
      const head = size * 2.5;
      let lh = 0;
      let lineSets: string[][] = [];
      for (let tries = 0; tries < 10; tries++) {
        const font = `500 ${size - 0.5}px ${th().font}`;
        lineSets = rows.map((row) => (row.kind === 'text' || row.kind === 'hint' ? wrap(row.f, inner, font) : []));
        const units = rows.reduce((sum, row, i) => sum + rowWeight(row, lineSets[i]!.length), 0);
        lh = (col.h - head - pad) / units;
        if (lh >= size * 1.95 || size <= 10) break;
        size -= 0.5;
      }
      lh = Math.min(lh, size * 2.7);
      const units = rows.reduce((sum, row, i) => sum + rowWeight(row, lineSets[i]!.length), 0);
      const targetH = Math.min(col.h, head + pad + units * lh);
      if (cardH === null || reduced()) cardH = targetH;
      cardH += (targetH - cardH) * (1 - Math.exp(-dt / 0.14));
      if (Math.abs(cardH - targetH) > 0.5) anim = true;
      else cardH = targetH;
      const card = { x: col.x, y: col.y, w: col.w, h: cardH };
      cardFrame(card, alpha);

      g.save();
      g.beginPath();
      g.rect(card.x, card.y, card.w, card.h);
      g.clip();
      g.globalAlpha = alpha;
      let tbox = formula(g, `\\t{${title}}`, fstyle(size - 0.5, th().muted, 800));
      const ty = card.y + pad + tbox.asc;
      if (story) {
        // Schritt-Animation: Abschnitt als Überschrift, blendet bei jedem Wechsel weich ein
        const cap = captionOf(now, story, rows);
        const e = clamp01((now - story.t0 - cap.start + 150) / 380);
        tbox = fitF(`\\t{${cap.src}}`, inner, size, C().f, 800);
        g.save();
        g.globalAlpha = alpha * ease.outCubic(e);
        tbox.draw(g, card.x + pad + (1 - ease.outCubic(e)) * 10, ty);
        g.restore();
      } else tbox.draw(g, card.x + pad, ty);
      const chip = formula(g, `\\t{${ctx.t(sit())}}`, fstyle(size - 1.5, C().f, 700));
      if (!story && chip.w < inner - tbox.w - 30) {
        const cx = card.x + card.w - pad - chip.w - 8;
        g.fillStyle = mixColor(C().f, th().bg, 0, th().dark ? 0.2 : 0.11);
        roundRect(g, cx - 2, ty - chip.asc - 4, chip.w + 12, chip.asc + chip.desc + 8, 8);
        g.fill();
        chip.draw(g, cx + 4, ty);
      }

      // Ziellagen
      let y = card.y + head;
      const st = story;
      const tS = st ? now - st.t0 : 0;
      const seen = new Set<string>();
      rows.forEach((row, i) => {
        const hgt = rowWeight(row, lineSets[i]!.length) * lh;
        const ty2 = y;
        y += hgt;
        const src = row.kind === 'trow' || row.kind === 'thead' ? row.cells!.map((cl) => cl.f).join('|') : row.f;
        let rs2 = rowStates.get(row.key);
        if (!rs2) {
          rs2 = { row, src, prev: null, tc: -Infinity, y: ty2, alpha: 0, live: true, h: hgt, lines: [], idx: i };
          rowStates.set(row.key, rs2);
        }
        if (rs2.src !== src) {
          rs2.prev = rs2.src;
          rs2.src = src;
          rs2.tc = now;
        }
        rs2.row = row;
        rs2.live = true;
        rs2.h = hgt;
        rs2.lines = lineSets[i]!;
        rs2.idx = i;
        seen.add(row.key);
        const kk = 1 - Math.exp(-dt / 0.11);
        rs2.y += (ty2 - rs2.y) * kk;
        if (Math.abs(ty2 - rs2.y) < 0.3) rs2.y = ty2;
        else anim = true;
        let goal = 1;
        if (introT !== null) goal = clamp01((introT - 500 - i * 70) / 380);
        rs2.alpha += (goal - rs2.alpha) * (1 - Math.exp(-dt / 0.09));
        if (Math.abs(goal - rs2.alpha) < 0.01) rs2.alpha = goal;
        else anim = true;
        if (reduced()) {
          rs2.y = ty2;
          rs2.alpha = goal;
        }
      });
      for (const [key, rs2] of rowStates) {
        if (seen.has(key)) continue;
        rs2.live = false;
        rs2.alpha -= dt / 0.2;
        if (rs2.alpha <= 0 || reduced()) rowStates.delete(key);
        else anim = true;
      }

      const noteFont = `600 ${size - 2}px ${th().font}`;
      const tagW = size * 1.9;
      for (const rs2 of rowStates.values()) {
        const row = rs2.row;
        let a = rs2.alpha;
        let slide = 0;
        let active = 0;
        if (st && rs2.live && row.at !== undefined) {
          const e = clamp01((tS - row.at) / 450);
          a *= ease.outCubic(e);
          slide = (1 - ease.outCubic(e)) * 14;
          const nextAt = rows[rs2.idx + 1]?.at ?? st.end - 800;
          active = row.kind === 'try' ? 0 : clamp01(Math.min((tS - row.at) / 250, (nextAt - tS) / 300));
        }
        if (a <= 0.01) continue;
        const h = rs2.h;
        const top = rs2.y;
        const mid = top + h / 2;
        g.save();
        g.globalAlpha = alpha * a;
        if (row.sep) {
          g.strokeStyle = th().dark ? '#2c3648' : '#e9edf3';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(card.x + pad, Math.round(top) + 0.5);
          g.lineTo(card.x + card.w - pad, Math.round(top) + 0.5);
          g.stroke();
        }
        if (active > 0) {
          g.save();
          g.globalAlpha = alpha * a * active;
          g.fillStyle = mixColor(C().f, th().bg, 0, th().dark ? 0.2 : 0.11);
          roundRect(g, card.x + 6, top + 3, card.w - 12, h - 6, 8);
          g.fill();
          g.restore();
        }
        if (row.kind === 'result') {
          const colr = C().opt;
          g.fillStyle = mixColor(colr, th().bg, 0, th().dark ? 0.18 : 0.1);
          roundRect(g, card.x + pad - 6, top + 4, inner + 12, h - 8, 9);
          g.fill();
          g.strokeStyle = mixColor(colr, th().bg, 0.35, 0.8);
          g.lineWidth = 1.3;
          roundRect(g, card.x + pad - 5.5, top + 4.5, inner + 11, h - 9, 9);
          g.stroke();
        }
        if (row.kind === 'text' || row.kind === 'hint') {
          g.font = `500 ${size - 0.5}px ${th().font}`;
          g.fillStyle = row.kind === 'hint' ? th().muted : th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          const step = lh * 0.62;
          const y0 = mid - ((rs2.lines.length - 1) * step) / 2;
          rs2.lines.forEach((ln, li) => g.fillText(ln, card.x + pad + slide, y0 + li * step));
          g.restore();
          continue;
        }
        if (row.kind === 'thead' || row.kind === 'trow') {
          const cells = row.cells!;
          const nC = cells.length;
          const colW = inner / nC;
          if (row.kind === 'trow' && row.hl) {
            const hc = row.hl === 'cur' ? C().area : C().opt;
            g.fillStyle = mixColor(hc, th().bg, 0, th().dark ? 0.22 : 0.13);
            roundRect(g, card.x + pad - 6, top + 1.5, inner + 12, h - 3, 7);
            g.fill();
            if (row.hl === 'both' || row.hl === 'cur') {
              g.strokeStyle = mixColor(C().area, th().bg, 0.2, 0.9);
              g.lineWidth = 1.4;
              roundRect(g, card.x + pad - 5.5, top + 2, inner + 11, h - 4, 7);
              g.stroke();
            }
          }
          const e = rs2.prev !== null ? clamp01((now - rs2.tc) / 220) : 1;
          if (e >= 1) rs2.prev = null;
          else anim = true;
          cells.forEach((cl, j) => {
            const isMax = row.hl === 'max' || row.hl === 'both';
            const color = row.kind === 'thead' ? th().muted : isMax && j === nC - 1 ? C().opt : (cl.color ?? th().text);
            const box = fitF(cl.f, colW - 8, row.kind === 'thead' ? size - 1 : size - 0.5, color, row.kind === 'thead' ? 700 : (cl.weight ?? 600));
            const right = card.x + pad + colW * (j + 1) - 6;
            box.draw(g, right - box.w, mid + (box.asc - box.desc) / 2);
          });
          g.restore();
          continue;
        }
        let fx = card.x + pad + slide;
        if (row.tag !== undefined) {
          const tb = formula(g, `\\t{${row.tag}}`, fstyle(size - 1, C().area, 800));
          tb.draw(g, fx, mid + (tb.asc - tb.desc) / 2);
          fx += tagW;
        }
        const fsize = row.kind === 'result' ? size + 2 : size;
        const color = row.kind === 'result' ? C().opt : th().text;
        const weight = row.kind === 'result' ? 800 : 600;
        // Erläuterung rechts nur, wenn die Formel dann noch in voller Größe passt
        let noteW = 0;
        if (row.note) {
          g.font = noteFont;
          const nw = g.measureText(row.note).width;
          const need = formula(g, rs2.src, fstyle(fsize, color, weight)).w;
          if (need + nw + 12 <= card.x + card.w - pad - fx) {
            noteW = nw;
            g.font = noteFont;
            g.fillStyle = row.kind === 'try' ? (row.note.startsWith('↑') ? C().opt : row.note.startsWith('↓') ? C().warn : th().muted) : th().muted;
            g.textAlign = 'right';
            g.textBaseline = 'middle';
            g.fillText(row.note, card.x + card.w - pad - (row.kind === 'result' ? 4 : 0), mid);
          }
        }
        const maxW = card.x + card.w - pad - fx - (noteW ? noteW + 12 : 0);
        const e = rs2.prev !== null ? clamp01((now - rs2.tc) / 260) : 1;
        if (e < 1) {
          anim = true;
          const pb = fitF(rs2.prev!, maxW, fsize, color, weight);
          g.save();
          g.globalAlpha = alpha * a * (1 - e);
          pb.draw(g, fx, mid + (pb.asc - pb.desc) / 2 - e * 7);
          g.restore();
        } else rs2.prev = null;
        const box = fitF(rs2.src, maxW, fsize, color, weight);
        g.globalAlpha = alpha * a * ease.outCubic(e);
        box.draw(g, fx, mid + (box.asc - box.desc) / 2 + (1 - e) * 7);
        g.restore();
      }
      g.restore();
      return anim;
    }

    /* ---------- Schritt-Animation ---------- */

    function makeStory(now: number): Story {
      const pr = exact();
      const d = numOf(pr.sit, exactInputs());
      const x0 = X.v;
      const seq = probeSequence(pr, x0).slice(0, -1);
      const w = d.hi - d.lo;
      const keys: ProbeKey[] = [];
      let t = 350;
      let prev = x0;
      for (const x of seq) {
        const dur = 620 + 380 * Math.min(1, Math.abs(x - prev) / (0.5 * w));
        keys.push({ from: prev, x, t0: t, t1: t + dur });
        t += dur + 480;
        prev = x;
      }
      const probeEnd = t + 250;
      const calcAt = new Map<string, number>();
      let resultAt = probeEnd;
      t = probeEnd + 200;
      for (const row of calcRows(pr)) {
        if (row.cap) t += 260;
        calcAt.set(row.key, t);
        if (row.kind === 'result') resultAt = t;
        t += row.kind === 'result' ? 1300 : row.kind === 'text' ? 1600 : 850;
      }
      return { t0: now, sit: pr.sit, keys, probeEnd, calcAt, resultAt, end: t + 900, xv: d.xv };
    }

    /** x in der Schritt-Animation: Probier-Bewegung, danach Gleiten zum Scheitel. */
    function storyX(st: Story, now: number): number | null {
      const t = now - st.t0;
      for (const k of st.keys) {
        if (t < k.t0) return k.from;
        if (t <= k.t1) return lerp(k.from, k.x, ease.inOutCubic((t - k.t0) / (k.t1 - k.t0)));
      }
      const last = st.keys.length ? st.keys[st.keys.length - 1]!.x : X.v;
      if (t < st.resultAt) return last;
      return lerp(last, st.xv, ease.inOutCubic(clamp01((t - st.resultAt) / 900)));
    }

    /* ---------- Bild ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;

      if (story && now - story.t0 >= story.end) {
        X.jump(story.xv);
        X.follow(clampX(numOf(sit(), exactInputs()), xParam()), 0.35);
        story = null;
      }
      if (story) {
        anim = true;
        X.jump(storyX(story, now) ?? X.v);
      }
      if (swap && now - swap.t0 > 900) swap = null;
      if (swap) anim = true;
      for (const ch of [...Object.values(D), X, kSol, kTable, E.w, E.h]) anim = ch.step(now, dt) || anim;

      const inp = shownInputs();
      const d = numOf(sit(), inp);
      // Graph-Bereich gleitet
      const gr = graphRange(numOf(sit(), exactInputs()));
      const gTau = reduced() ? 0 : 0.22;
      if (G.x0.goal !== gr.x0) G.x0.follow(gr.x0, gTau);
      if (G.x1.goal !== gr.x1) G.x1.follow(gr.x1, gTau);
      if (G.y1.goal !== gr.y1) G.y1.follow(gr.y1, gTau);
      for (const ch of [G.x0, G.x1, G.y1]) anim = ch.step(now, dt) || anim;
      // Lösungshinweis in der Szene
      const w = d.hi - d.lo;
      const atOpt = P.sol && !story && !swap && Math.abs(X.v - d.xv) < 0.004 * w + 1e-9 ? 1 : 0;
      if (kOpt.goal !== atOpt) kOpt.follow(atOpt, 0.18);
      anim = kOpt.step(now, dt) || anim;
      if (knobDrag || dragging()) anim = true;

      // Einstieg
      let k = { scene: 1, curve: 1, point: 1, labels: 1, card: 1 };
      let introT: number | null = null;
      if (intro !== null) {
        const t = now - intro;
        if (t > 2600) intro = null;
        else {
          anim = true;
          introT = t;
          k = {
            scene: ease.outCubic(clamp01(t / 650)),
            curve: ease.inOutCubic(clamp01((t - 250) / 1100)),
            point: ease.outBack(clamp01((t - 900) / 500)),
            labels: ease.outCubic(clamp01((t - 700) / 600)),
            card: ease.outCubic(clamp01((t - 300) / 650)),
          };
        }
      }

      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      const reg = regions();

      // Szene (beim Umschalten: alte aus-, neue einblenden)
      knob = null;
      const sr = reg.scene;
      if (swap) {
        const e = clamp01((now - swap.t0) / 900);
        const eo = ease.outCubic(clamp01(e / 0.45));
        const ei = ease.outCubic(clamp01((e - 0.35) / 0.65));
        g.save();
        g.translate(0, -eo * 8);
        drawScene(sr, swap.from, swap.inp, swap.x, 1 - eo, false);
        g.restore();
        g.save();
        g.translate(0, (1 - ei) * 12);
        drawScene(sr, sit(), inp, X.v, ei, ei > 0.9);
        g.restore();
      } else {
        g.save();
        g.translate(0, (1 - k.scene) * 12);
        drawScene(sr, sit(), inp, X.v, k.scene, true);
        g.restore();
      }
      // Randwert-Hinweis
      const ex = exact();
      if (!inDomain(ex, xParam()) && !story) pill(sr.x + sr.w / 2, sr.y + sr.h / 2, ctx.t('edge'), { color: C().warn, border: mixColor(C().warn, th().bg, 0.45), size: textSize() - 1 });

      // Graph
      // schmal: rechts mehr Platz, damit die Achsenbeschriftung „x in …“ nicht über dem rechten Rand des Definitionsbereichs liegt
      const xExtra = wide() ? 0 : 0.1 * (G.x1.v - G.x0.v);
      plot.setRangePadded([G.x0.v, G.x1.v + xExtra], [-0.1 * G.y1.v, G.y1.v], { left: 52, bottom: 24, top: 30, right: 18 });
      plot.resize();
      drawGraph(now, d, k);

      // Karte
      const col = reg.card;
      const slide = (1 - k.card) * 16;
      anim = drawCard({ x: col.x + (wide() ? slide : 0), y: col.y + (wide() ? 0 : slide), w: col.w, h: col.h }, now, dt, k.card, introT) || anim;

      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge bei Änderungen ---------- */

    function syncAxes(): void {
      const s = sit();
      plot.setAxes({ x: { label: tr('axX', { u: unitX(s) }) }, y: { label: tr('axY', { z: zName(s), u: unitZ(s) }) } });
    }

    function retarget(source: string, changed: ReadonlySet<string>, prevSit: Situation): void {
      const now = performance.now();
      const inst = reduced() || source === 'init';
      const inp = exactInputs();
      const ext = extentFor(sit(), inp);
      const ex = numOf(sit(), inp);
      const xTarget = clampX(ex, xParam());
      const sitChanged = changed.has('sit') && prevSit !== sit();
      if (inst) {
        for (const [key, ch] of Object.entries(D)) ch.jump(inp[key as keyof Inputs]);
        E.w.jump(ext.w);
        E.h.jump(ext.h);
        kSol.jump(P.sol ? 1 : 0);
        kTable.jump(P.card === 'table' ? 1 : 0);
        const gr = graphRange(ex);
        G.x0.jump(gr.x0);
        G.x1.jump(gr.x1);
        G.y1.jump(gr.y1);
        if (source === 'init' && intro !== null) {
          // Einstieg: x gleitet vom Rand des Definitionsbereichs zum Startwert
          X.jump(ex.lo + 0.04 * (ex.hi - ex.lo));
          X.glide(xTarget, 1500, 700, now);
        } else X.jump(xTarget);
        swap = null;
        return;
      }
      if (sitChanged) {
        swap = { from: prevSit, inp: shownInputs(), x: X.v, t0: now };
        for (const [key, ch] of Object.entries(D)) ch.jump(inp[key as keyof Inputs]);
        E.w.jump(ext.w);
        E.h.jump(ext.h);
        X.jump(ex.lo + 0.04 * (ex.hi - ex.lo));
        X.glide(xTarget, 1000, 380, now);
      } else {
        const tau = dragging() ? 0.08 : 0.24;
        const repl = source === 'replace';
        let i = 0;
        for (const [key, ch] of Object.entries(D)) {
          const v = inp[key as keyof Inputs];
          if (ch.goal === v && !ch.moving) continue;
          if (repl) ch.glide(v, 800, 90 * i++, now);
          else ch.follow(v, tau);
        }
        if (repl) {
          E.w.glide(ext.w, 800, 0, now);
          E.h.glide(ext.h, 800, 0, now);
          X.glide(xTarget, 900, 150, now);
        } else {
          E.w.follow(ext.w, 0.3);
          E.h.follow(ext.h, 0.3);
          if (!story) X.follow(xTarget, dragging() ? 0.06 : 0.22);
        }
      }
      kSol.follow(P.sol ? 1 : 0, 0.2);
      kTable.follow(P.card === 'table' ? 1 : 0, 0.25);
    }

    let lastSit: Situation = sit();

    return {
      update(changed, source) {
        const user = source === 'input' || source === 'replace';
        const prevSit = lastSit;
        lastSit = sit();
        if (user && [...changed].some((key) => key !== 'grid')) cancelStory();
        // x im Definitionsbereich halten (nur bei eigener Eingabe, nicht bei Beispielen/Links)
        if (source === 'input') {
          const ex = numOf(sit(), exactInputs());
          const xv = xParam();
          const cl = clampX(ex, xv);
          if (Math.abs(cl - xv) > 1e-9) setX(cl);
        }
        retarget(source, changed, prevSit);
        syncAxes();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id !== 'search') return;
        cancelStory();
        swap = null;
        const vals: { sol?: boolean; card?: 'calc' } = {};
        if (!P.sol) vals.sol = true;
        if (P.card !== 'calc') vals.card = 'calc';
        if (Object.keys(vals).length) ctx.set(vals);
        const d = numOf(sit(), exactInputs());
        if (reduced()) {
          setX(d.xv);
          ctx.requestRender();
          return;
        }
        const now = performance.now();
        story = makeStory(now);
        setX(d.xv);
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
