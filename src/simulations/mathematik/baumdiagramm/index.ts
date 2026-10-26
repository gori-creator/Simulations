import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, seededRandom, Surface, type Rect } from '../../../sim-core';
import {
  band95,
  buildTree,
  drawPath,
  emptyAfter,
  eventProb,
  exhaustedColors,
  fadd,
  frac,
  fsub,
  fval,
  inEvent,
  leaves,
  ONE,
  parseSel,
  pathEdges,
  rawProduct,
  splitPaths,
  urnAfter,
  urnColors,
  urnTotal,
  ZERO,
  type Color,
  type EventId,
  type Frac,
  type TreeNode,
  type Urn,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Mode = 'draw' | 'compare' | 'rules' | 'sim';

const EVENTS: { value: EventId; label: { de: string; en: string } }[] = [
  { value: 'none', label: L('kein Ereignis', 'no event') },
  { value: 'same', label: L('alle gleichfarbig', 'all the same colour') },
  { value: 'diff', label: L('alle verschieden', 'all different') },
  { value: 'oneR', label: L('genau eine rote', 'exactly one red') },
  { value: 'minR', label: L('mindestens eine rote', 'at least one red') },
  { value: 'noR', label: L('keine rote', 'no red') },
  { value: 'firstR', label: L('die erste ist rot', 'the first is red') },
  { value: 'custom', label: L('selbst antippen', 'tap your own') },
];

/** Exponentielles Nachziehen eines angezeigten Werts (dt, tau in s). */
const follow = (v: number, goal: number, dt: number, tau: number) => {
  if (tau <= 0) return goal;
  const nv = v + (goal - v) * (1 - Math.exp(-dt / tau));
  return Math.abs(goal - nv) < 1e-4 * (1 + Math.abs(goal)) ? goal : nv;
};

/** Unterbrechbarer Übergang 0 … 1. */
class Glide {
  private from: number;
  private to: number;
  private t0 = 0;
  private ms = 0;
  constructor(v: number) {
    this.from = v;
    this.to = v;
  }
  at(now: number): number {
    if (this.ms <= 0) return this.to;
    const u = clamp01((now - this.t0) / this.ms);
    return this.from + (this.to - this.from) * ease.inOutCubic(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  go(to: number, ms: number, now: number): void {
    this.from = this.at(now);
    this.to = to;
    this.t0 = now;
    this.ms = ms;
  }
  snap(v: number): void {
    this.from = this.to = v;
    this.ms = 0;
  }
}

interface NodeGeo {
  node: TreeNode;
  x: number;
  y: number;
  depth: number;
  parent: NodeGeo | null;
}
interface GhostGeo {
  from: NodeGeo;
  color: Color;
  /** Kugeln insgesamt an diesem Knoten (Nenner). */
  d: number;
}
interface TreeGeo {
  nodes: NodeGeo[];
  ghosts: GhostGeo[];
  leafRows: { path: string; y: number; x: number }[];
  infoX: number;
  rowH: number;
  colW: number;
}

/**
 * Mehrstufige Zufallsexperimente mit der Urne, in vier Ansichten:
 * – Ziehen: Kugeln fliegen aus der Urne, der Pfad leuchtet im wachsenden Baum.
 * – Vergleich: ohne und mit Zurücklegen nebeneinander (gleiches Ereignis).
 * – Pfadregeln: Pfad für Pfad entsteht das Produkt (1. Pfadregel), dann die
 *   Summe (2. Pfadregel), wo sinnvoll über das Gegenereignis.
 * – Simulation: viele Ziehungen, die relative Häufigkeit nähert sich P.
 * Sonderfälle: aufgebrauchte Farben als gestrichelte 0-Äste, leere Urne.
 */
export default defineSimulation({
  id: 'baumdiagramm',
  dragHint: false,
  layout: { aspect: 1.55, aspectNarrow: 0.62 },
  images: { urn: 'urne.webp' },
  groups: [
    { id: 'urn', label: L('Urne', 'Urn') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'draw', label: L('Ziehen', 'Draw') },
        { value: 'compare', label: L('Mit / ohne Zurücklegen', 'With / without replacement') },
        { value: 'rules', label: L('Pfadregeln', 'Path rules') },
        { value: 'sim', label: L('Simulation', 'Simulation') },
      ],
      default: 'draw',
    },
    { key: 'r', type: 'number', group: 'urn', label: L('rote Kugeln', 'red balls'), min: 0, max: 8, step: 1, default: 3 },
    { key: 'b', type: 'number', group: 'urn', label: L('blaue Kugeln', 'blue balls'), min: 0, max: 8, step: 1, default: 2 },
    { key: 'g', type: 'number', group: 'urn', label: L('grüne Kugeln', 'green balls'), min: 0, max: 6, step: 1, default: 0 },
    { key: 'rep', type: 'boolean', label: L('mit Zurücklegen', 'with replacement'), default: false, visibleIf: (v) => v.mode !== 'compare' },
    { key: 'n', type: 'number', label: L('Anzahl der Züge', 'Number of draws'), min: 1, max: 3, step: 1, default: 2, help: L('Mit drei Farben höchstens zwei Züge.', 'With three colours at most two draws.') },
    { key: 'ev', type: 'choice', label: L('Ereignis', 'Event'), options: EVENTS, default: 'none' },
    { key: 'sel', type: 'text', label: L('Gewählte Pfade', 'Selected paths'), default: '', maxLength: 60, placeholder: L('z. B. rb, br', 'e.g. rb, br'), visibleIf: (v) => v.ev === 'custom', help: L('Pfade im Baum antippen; r = rot, b = blau, g = grün.', 'Tap paths in the tree; r = red, b = blue, g = green.') },
    {
      key: 'num',
      type: 'choice',
      group: 'view',
      label: L('Wahrscheinlichkeiten als', 'Probabilities as'),
      options: [
        { value: 'frac', label: L('Bruch', 'fraction') },
        { value: 'dec', label: L('Dezimalzahl', 'decimal') },
        { value: 'pct', label: L('Prozent', 'percent') },
      ],
      default: 'frac',
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeiten anzeigen', 'Show probabilities'), default: true },
  ],
  actions: [
    { id: 'draw', label: L('Einmal ziehen', 'Draw once'), primary: true, visibleIf: (v) => v.mode === 'draw' },
    { id: 'play', label: L('Rechnung abspielen', 'Play the calculation'), primary: true, visibleIf: (v) => v.mode === 'rules' },
    { id: 'many', label: L('100-mal ziehen', 'Draw 100 times'), visibleIf: (v) => v.mode === 'draw' || v.mode === 'sim' },
    { id: 'k1000', label: L('1000-mal ziehen', 'Draw 1000 times'), visibleIf: (v) => v.mode === 'sim' },
    { id: 'clear', label: L('Zähler löschen', 'Clear counts'), visibleIf: (v) => v.mode === 'draw' || v.mode === 'sim' },
  ],
  readouts: [
    { key: 'path', label: L('Pfad (1. Pfadregel)', 'Path (1st path rule)'), spoiler: true },
    { key: 'ev', label: L('Ereignis (2. Pfadregel)', 'Event (2nd path rule)'), spoiler: true },
    { key: 'sim', label: L('Simulation', 'Simulation') },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('3 rote, 2 blaue, ohne Zurücklegen', '3 red, 2 blue, without replacement'), values: {} },
    { id: 'rep', label: L('Mit Zurücklegen', 'With replacement'), values: { rep: true } },
    { id: 'cmp', label: L('Vergleich: P(rot, rot)', 'Comparison: P(red, red)'), values: { mode: 'compare', ev: 'custom', sel: 'rr' } },
    { id: 'same', label: L('Gleiche Farbe (2. Pfadregel)', 'Same colour (2nd path rule)'), values: { mode: 'rules', ev: 'same' } },
    { id: 'min', label: L('Mindestens eine rote: Gegenereignis', 'At least one red: complement'), values: { mode: 'rules', ev: 'minR' } },
    { id: 'sim', label: L('Simulation: gleiche Farbe', 'Simulation: same colour'), values: { mode: 'sim', ev: 'same' } },
    { id: 'three', label: L('Drei Farben', 'Three colours'), values: { r: 2, b: 3, g: 1, ev: 'diff' } },
    { id: 'small', label: L('Urne wird leer: 2 rote, 1 blaue', 'Urn runs empty: 2 red, 1 blue'), values: { r: 2, b: 1, n: 3 } },
  ],
  strings: {
    de: { canvas: 'Urne mit roten, blauen und grünen Kugeln und Baumdiagramm mit Wahrscheinlichkeiten an den Ästen: Ziehen mit fliegenden Kugeln, Vergleich mit und ohne Zurücklegen, Pfadregeln Schritt für Schritt oder Simulation vieler Ziehungen. Pfade lassen sich antippen.' },
    en: { canvas: 'Urn with red, blue and green balls and a tree diagram with probabilities on the branches: drawing with flying balls, comparison with and without replacement, path rules step by step or a simulation of many draws. Paths can be tapped.' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const reduced = () => prefersReducedMotion();
    const mode = () => p.mode as Mode;

    /* ---------- Zustand ---------- */
    const urn = (): Urn => ({ r: p.r, b: p.b, g: p.g });
    const stagesCap = () => Math.min(p.n, urnColors(urn()).length > 2 ? 2 : 3);
    const stagesFor = (rep: boolean) => (rep ? stagesCap() : Math.max(1, Math.min(stagesCap(), urnTotal(urn()))));
    const repNow = () => (mode() === 'compare' ? false : p.rep);
    let treeNo: TreeNode = buildTree(urn(), stagesFor(false), false);
    let treeRep: TreeNode = buildTree(urn(), stagesFor(true), true);
    const treeOf = (rep: boolean) => (rep ? treeRep : treeNo);
    const tree = () => treeOf(repNow());
    const leafList = () => leaves(tree());
    let structKey = '';
    let growStart = performance.now() + (reduced() ? -1e6 : 150);
    let hoverPath: string | null = null;
    let pickPath: string | null = null;
    /** Alle gezogenen Ergebnisse (für Häufigkeiten und die Häufigkeitskurve). */
    let drawn: string[] = [];
    const relS = new Map<string, number>();
    let draw: { path: string; t0: number } | null = null;
    const STEP_MS = 650;
    let burst = -1e9;
    let runner: { target: number; done: number; t0: number; dur: number } | null = null;
    let rulesT0 = performance.now();
    const view = new Glide(1);
    let prevMode: Mode = mode();
    let curMode: Mode = mode();
    const repG = new Glide(p.rep ? 1 : 0);
    let intro: number | null = reduced() ? null : performance.now();
    let lastTime = performance.now();
    let rnd = seededRandom((Date.now() ^ 0x51ed270b) >>> 0);

    function rebuild(now: number): void {
      treeNo = buildTree(urn(), stagesFor(false), false);
      treeRep = buildTree(urn(), stagesFor(true), true);
      const key = `${urnColors(urn()).join('')}|${stagesFor(false)}|${stagesFor(true)}`;
      if (key !== structKey) {
        if (structKey) growStart = now + (reduced() ? -1e6 : 60);
        structKey = key;
      }
    }

    /* ---------- Farben, Zahlen ---------- */
    const ballColor = (c: Color) => (c === 'r' ? th().series[1]! : c === 'b' ? th().series[0]! : th().series[2]!);
    const EV = () => th().series[4]!;
    const FREQ = () => th().series[5]!;
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)');
    const sel = () => parseSel(p.sel, leafList().map((l) => l.path));
    const evId = () => p.ev as EventId;
    const inEvT = (t: TreeNode, path: string) => inEvent(evId(), path, parseSel(p.sel, leaves(t).map((l) => l.path)));
    const inEv = (path: string) => inEvent(evId(), path, sel());
    /** Wahrscheinlichkeit als Text; `stack`: Bruch übereinander (\f). */
    function numText(f: Frac | { n: number; d: number }, reduce = true, stack = true): string {
      const v = f.d ? f.n / f.d : 0;
      if (p.num === 'dec') return fmt.num(Math.round(v * 1000) / 1000, 3);
      if (p.num === 'pct') return `${fmt.fixed(v * 100, 1)} %`;
      const r = reduce ? frac(f.n, f.d) : f;
      if (r.d === 1) return String(r.n);
      return stack ? `\\f{${r.n}}{${r.d}}` : `${r.n}/${r.d}`;
    }
    const evLabel = () => EVENTS.find((e) => e.value === evId())?.label[de ? 'de' : 'en'] ?? '';
    const pathName = (path: string) => path;
    function pathFormula(path: string, rep = repNow(), stack = true): string {
      const edges = pathEdges(urn(), path, rep);
      if (!p.show) return '?';
      const prod = rawProduct(edges);
      const red = frac(prod.n, prod.d);
      if (p.num !== 'frac') return `${edges.map((e) => numText(e, false, stack)).join(' · ')} = ${numText(red, true, stack)}`;
      const f = (n: number, d: number) => (stack ? `\\f{${n}}{${d}}` : `${n}/${d}`);
      const raw = edges.length > 1 ? ` = ${f(prod.n, prod.d)}` : '';
      const reducedTxt = red.n !== prod.n ? ` = ${numText(red, true, stack)}` : '';
      return `${edges.map((e) => f(e.n, e.d)).join(' · ')}${raw}${reducedTxt}`;
    }

    /* ---------- Text mit Brüchen ---------- */
    type Seg = { k: 't' | 'sup' | 'sub'; s: string } | { k: 'frac'; a: string; b: string };
    function parse(src: string): Seg[] {
      const out: Seg[] = [];
      let i = 0;
      let buf = '';
      const flush = () => {
        if (buf) out.push({ k: 't', s: buf });
        buf = '';
      };
      const group = (): string => {
        if (src[i] !== '{') return '';
        let depth = 0;
        const start = i + 1;
        for (; i < src.length; i++) {
          if (src[i] === '{') depth++;
          else if (src[i] === '}') {
            depth--;
            if (depth === 0) {
              const s = src.slice(start, i);
              i++;
              return s;
            }
          }
        }
        return src.slice(start);
      };
      while (i < src.length) {
        const ch = src[i]!;
        if (ch === '\\' && src[i + 1] === 'f' && src[i + 2] === '{') {
          flush();
          i += 2;
          const a = group();
          const b = group();
          out.push({ k: 'frac', a, b });
        } else if ((ch === '^' || ch === '_') && src[i + 1] === '{') {
          flush();
          i++;
          out.push({ k: ch === '^' ? 'sup' : 'sub', s: group() });
        } else {
          buf += ch;
          i++;
        }
      }
      flush();
      return out;
    }
    const fontOf = (size: number, weight: number) => `${weight} ${size}px ${th().font}`;
    function measure(src: string, size: number, weight = 650): number {
      const g = surface.g;
      let w = 0;
      for (const s of parse(src)) {
        if (s.k === 'frac') {
          g.font = fontOf(size * 0.82, weight);
          w += Math.max(g.measureText(s.a).width, g.measureText(s.b).width) + 6;
        } else {
          g.font = fontOf(s.k === 't' ? size : size * 0.72, weight);
          w += g.measureText(s.s).width;
        }
      }
      return w;
    }
    function rich(src: string, x: number, y: number, size: number, color: string, align: 'left' | 'center' | 'right' = 'left', weight = 650): number {
      const g = surface.g;
      const w = measure(src, size, weight);
      let x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.fillStyle = color;
      g.strokeStyle = color;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      for (const s of parse(src)) {
        if (s.k === 'frac') {
          g.font = fontOf(size * 0.82, weight);
          const fw = Math.max(g.measureText(s.a).width, g.measureText(s.b).width) + 6;
          g.textAlign = 'center';
          g.fillText(s.a, x0 + fw / 2, y - size * 0.5);
          g.fillText(s.b, x0 + fw / 2, y + size * 0.55);
          g.textAlign = 'left';
          g.lineWidth = 1.1;
          g.beginPath();
          g.moveTo(x0 + 1, y + 0.5);
          g.lineTo(x0 + fw - 1, y + 0.5);
          g.stroke();
          x0 += fw;
        } else {
          const sz = s.k === 't' ? size : size * 0.72;
          g.font = fontOf(sz, weight);
          const dy = s.k === 'sup' ? -size * 0.38 : s.k === 'sub' ? size * 0.3 : 0;
          g.fillText(s.s, x0, y + dy);
          x0 += g.measureText(s.s).width;
        }
      }
      return w;
    }
    function fitSize(src: string, maxW: number, size: number, weight = 650, min = 9): number {
      let s = size;
      while (s > min && measure(src, s, weight) > maxW) s -= 0.5;
      return s;
    }
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const baseSize = () => (wide() ? (surface.width < 900 ? 12 : 13) : 12);

    function cardFrame(r: Rect, title?: string, sub?: string): void {
      const g = surface.g;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.97)';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
      g.restore();
      if (title) rich(title, r.x + 14, r.y + 19, fitSize(title, sub ? r.w * 0.6 : r.w - 28, baseSize() + 0.5, 800), th().text, 'left', 800);
      if (sub) rich(sub, r.x + r.w - 14, r.y + 19, fitSize(sub, r.w * 0.36, baseSize() - 1.5, 600), th().muted, 'right', 600);
    }
    function pill(x: number, y: number, src: string, color: string, opts: { align?: 'left' | 'center' | 'right'; size?: number; fill?: boolean; clampTo?: Rect } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? baseSize() - 0.5;
      const w = measure(src, size, 750) + 18;
      const h = size + 12;
      let x0 = opts.align === 'left' ? x : opts.align === 'right' ? x - w : x - w / 2;
      if (opts.clampTo) x0 = clamp(x0, opts.clampTo.x + 6, opts.clampTo.x + opts.clampTo.w - 6 - w);
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = opts.fill ? color : pillBg();
      roundRect(g, x0, y - h / 2, w, h, h / 2);
      g.fill();
      g.shadowColor = 'transparent';
      if (!opts.fill) {
        g.strokeStyle = mixColor(color, th().bg, 0.35);
        g.lineWidth = 1.2;
        roundRect(g, x0 + 0.5, y - h / 2 + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      rich(src, x0 + 9, y + 0.5, size, opts.fill ? '#ffffff' : color, 'left', 750);
      g.restore();
      return { x: x0, y: y - h / 2, w, h };
    }
    /** Glänzende Kugel. */
    function ball(x: number, y: number, r: number, c: Color, a = 1): void {
      if (r <= 0.3) return;
      const g = surface.g;
      const col = ballColor(c);
      g.save();
      g.globalAlpha *= a;
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = r * 0.6;
      g.shadowOffsetY = r * 0.18;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
      grad.addColorStop(0, mixColor(col, '#ffffff', 0.55));
      grad.addColorStop(0.45, col);
      grad.addColorStop(1, mixColor(col, '#000000', 0.35));
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fillStyle = grad;
      g.fill();
      g.restore();
    }

    /* ---------- Aufteilung ---------- */
    interface Lay {
      urn?: Rect;
      tree?: Rect;
      tree2?: Rect;
      calc?: Rect;
      chart?: Rect;
    }
    function layout(m: Mode): Lay {
      const W = surface.width;
      const H = surface.height;
      const gap = 10;
      const uw = Math.round(clamp(W * 0.24, 170, 240));
      if (m === 'draw') {
        if (wide()) return { urn: { x: 0, y: 0, w: uw, h: H }, tree: { x: uw + gap, y: 0, w: W - uw - gap, h: H } };
        const uh = Math.round(clamp(H * 0.27, 130, 200));
        return { urn: { x: 0, y: 0, w: W, h: uh }, tree: { x: 0, y: uh + gap, w: W, h: H - uh - gap } };
      }
      if (m === 'compare') {
        if (wide()) {
          const rw = W - uw - gap;
          if (rw >= 560) {
            const tw = Math.round((rw - gap) / 2);
            return { urn: { x: 0, y: 0, w: uw, h: H }, tree: { x: uw + gap, y: 0, w: tw, h: H }, tree2: { x: uw + 2 * gap + tw, y: 0, w: rw - tw - gap, h: H } };
          }
          const th0 = Math.round((H - gap) / 2);
          return { urn: { x: 0, y: 0, w: uw, h: H }, tree: { x: uw + gap, y: 0, w: rw, h: th0 }, tree2: { x: uw + gap, y: th0 + gap, w: rw, h: H - th0 - gap } };
        }
        const uh = Math.round(clamp(H * 0.2, 110, 160));
        const th0 = Math.round((H - uh - 2 * gap) / 2);
        return { urn: { x: 0, y: 0, w: W, h: uh }, tree: { x: 0, y: uh + gap, w: W, h: th0 }, tree2: { x: 0, y: uh + th0 + 2 * gap, w: W, h: H - uh - th0 - 2 * gap } };
      }
      if (m === 'rules') {
        if (wide()) {
          const tw = Math.round(W * 0.56);
          return { tree: { x: 0, y: 0, w: tw, h: H }, calc: { x: tw + gap, y: 0, w: W - tw - gap, h: H } };
        }
        const th0 = Math.round(H * 0.5);
        return { tree: { x: 0, y: 0, w: W, h: th0 }, calc: { x: 0, y: th0 + gap, w: W, h: H - th0 - gap } };
      }
      if (wide()) {
        const ch = Math.round(H * 0.5);
        return { urn: { x: 0, y: 0, w: uw, h: H }, chart: { x: uw + gap, y: 0, w: W - uw - gap, h: ch }, tree: { x: uw + gap, y: ch + gap, w: W - uw - gap, h: H - ch - gap } };
      }
      const uh = Math.round(H * 0.2);
      const ch = Math.round(H * 0.32);
      return { urn: { x: 0, y: 0, w: W, h: uh }, chart: { x: 0, y: uh + gap, w: W, h: ch }, tree: { x: 0, y: uh + ch + 2 * gap, w: W, h: H - uh - ch - 2 * gap } };
    }

    /* ---------- Urne ---------- */
    interface UrnGeo {
      jar: Rect;
      r: number;
      slots: { x: number; y: number }[];
      tray: Rect;
    }
    function urnGeo(R: Rect, compact: boolean): UrnGeo {
      const tall = R.h > R.w * 1.2;
      const jarW = tall ? R.w - 40 : Math.min(R.w * 0.42, 190);
      const jarH = tall ? Math.min(R.h * (compact ? 0.5 : 0.4), jarW * 1.05) : R.h - 74;
      const jar = { x: R.x + (tall ? 20 : 16), y: R.y + 64, w: jarW, h: Math.max(30, jarH) };
      const n = Math.max(1, urnTotal(urn()));
      const cols = Math.max(3, Math.ceil(Math.sqrt(n * (jar.w / jar.h)) + 0.5));
      const r = Math.min((jar.w - 16) / cols / 2.1, 15);
      const slots: { x: number; y: number }[] = [];
      for (let i = 0; i < 24; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const off = row % 2 ? r * 0.9 : 0;
        slots.push({ x: jar.x + 8 + r + off + col * r * 2.1, y: jar.y + jar.h - 8 - r - row * r * 1.85 });
      }
      const tray = tall ? { x: R.x + 14, y: jar.y + jar.h + 40, w: R.w - 28, h: 54 } : { x: jar.x + jar.w + 20, y: R.y + 64, w: R.w - jar.w - 56, h: 54 };
      return { jar, r, slots, tray };
    }
    const urnBalls = (u: Urn): Color[] => [...Array<Color>(u.r).fill('r'), ...Array<Color>(u.b).fill('b'), ...Array<Color>(u.g).fill('g')];
    function currentDrawn(now: number): { path: string; k: number } {
      if (!draw) return { path: '', k: 0 };
      const k = clamp(Math.floor((now - draw.t0) / STEP_MS + 0.5), 0, draw.path.length);
      return { path: draw.path, k };
    }

    function drawUrn(R: Rect, now: number, opts: { tray: boolean; stats: boolean; note?: string }): void {
      const g = surface.g;
      const u = urn();
      const tot = urnTotal(u);
      cardFrame(R, tt('Urne', 'Urn'));
      const sub = opts.note ?? `${tot} ${tot === 1 ? tt('Kugel', 'ball') : tt('Kugeln', 'balls')} · ${repNow() ? tt('mit Zurücklegen', 'with replacement') : tt('ohne Zurücklegen', 'without replacement')}`;
      rich(sub, R.x + 14, R.y + 38, fitSize(sub, R.w - 28, 11, 600), th().muted, 'left', 600);
      const G0 = urnGeo(R, !opts.tray);
      const { jar, r, slots, tray } = G0;
      const urnImg = ctx.images.get('urn');
      // Foto: Hals oben bei jar.y − 10, Bauch auf die volle Breite, Boden auf jar.y + jar.h
      const drawJar = (alpha: number) => {
        g.save();
        g.globalAlpha *= alpha;
        g.drawImage(urnImg!, jar.x, jar.y - 10, jar.w, jar.h + 10);
        g.restore();
      };
      if (urnImg) drawJar(1);
      else {
        g.save();
        g.beginPath();
        const neck = jar.w * 0.16;
        g.moveTo(jar.x + neck, jar.y - 10);
        g.lineTo(jar.x + jar.w - neck, jar.y - 10);
        g.quadraticCurveTo(jar.x + jar.w - neck + 2, jar.y + 6, jar.x + jar.w, jar.y + 22);
        g.lineTo(jar.x + jar.w, jar.y + jar.h - 14);
        g.quadraticCurveTo(jar.x + jar.w, jar.y + jar.h, jar.x + jar.w - 14, jar.y + jar.h);
        g.lineTo(jar.x + 14, jar.y + jar.h);
        g.quadraticCurveTo(jar.x, jar.y + jar.h, jar.x, jar.y + jar.h - 14);
        g.lineTo(jar.x, jar.y + 22);
        g.quadraticCurveTo(jar.x + neck - 2, jar.y + 6, jar.x + neck, jar.y - 10);
        g.closePath();
        const glass = g.createLinearGradient(jar.x, 0, jar.x + jar.w, 0);
        glass.addColorStop(0, mixColor(th().series[5]!, th().bg, 0, th().dark ? 0.16 : 0.1));
        glass.addColorStop(0.5, mixColor(th().series[5]!, th().bg, 0, th().dark ? 0.06 : 0.03));
        glass.addColorStop(1, mixColor(th().series[5]!, th().bg, 0, th().dark ? 0.16 : 0.1));
        g.fillStyle = glass;
        g.fill();
        g.strokeStyle = mixColor(th().text, th().bg, 0, th().dark ? 0.35 : 0.3);
        g.lineWidth = 1.8;
        g.stroke();
        g.restore();
      }
      const dr = currentDrawn(now);
      const shown = draw && !p.rep && opts.tray ? urnAfter(u, dr.path.slice(0, dr.k), false) : u;
      const list = urnBalls(shown);
      const growU = reduced() ? 1 : clamp01((now - growStart + 200) / 500);
      list.slice(0, slots.length).forEach((c, i) => {
        const s = slots[i]!;
        const pop = ease.outBack(clamp01(growU * 1.4 - i * 0.03));
        ball(s.x, s.y, r * pop, c);
      });
      if (urnImg) drawJar(0.45);
      else {
        g.save();
        g.globalAlpha = th().dark ? 0.12 : 0.35;
        g.fillStyle = '#ffffff';
        roundRect(g, jar.x + 6, jar.y + 26, 6, jar.h * 0.55, 3);
        g.fill();
        g.restore();
      }
      if (tot === 0) rich(tt('Urne leer', 'Urn empty'), jar.x + jar.w / 2, jar.y + jar.h / 2, 12, th().muted, 'center', 700);
      else if (draw && !p.rep && urnTotal(shown) === 0) pill(jar.x + jar.w / 2, jar.y + jar.h / 2, tt('leer', 'empty'), th().muted, { size: 11 });
      if (!opts.tray) return;
      g.save();
      g.fillStyle = mixColor(th().text, th().bg, 0, th().dark ? 0.06 : 0.04);
      roundRect(g, tray.x, tray.y, tray.w, tray.h, 12);
      g.fill();
      g.restore();
      rich(tt('gezogen', 'drawn'), tray.x + 10, tray.y + 12, 10.5, th().muted, 'left', 700);
      const st = stagesFor(p.rep);
      const trr = Math.min(16, (tray.w - 20) / st / 2.6);
      for (let i = 0; i < st; i++) {
        const sx = tray.x + tray.w / 2 + (i - (st - 1) / 2) * trr * 2.6;
        const sy = tray.y + tray.h / 2 + 7;
        g.save();
        g.setLineDash([3, 3]);
        g.strokeStyle = mixColor(th().text, th().bg, 0.8);
        g.beginPath();
        g.arc(sx, sy, trr, 0, TAU);
        g.stroke();
        g.restore();
        if (draw) {
          const t = (now - draw.t0) / STEP_MS - i;
          if (t > 0 && i < draw.path.length) {
            const u1 = ease.inOutCubic(clamp01(t));
            const c = draw.path[i] as Color;
            const fx = jar.x + jar.w / 2;
            const fy = jar.y - 4;
            const x = lerp(fx, sx, u1);
            const y = lerp(fy, sy, u1) - Math.sin(u1 * Math.PI) * 40;
            const fade = 1 - clamp01(((now - draw.t0) / STEP_MS - draw.path.length - 1.2) / 0.5);
            ball(x, y, lerp(r, trr, u1), c, fade);
          }
        } else if (mode() === 'sim' && drawn.length) {
          const last = drawn[drawn.length - 1]!;
          if (i < last.length) ball(sx, sy, trr, last[i] as Color);
        }
      }
      if (!opts.stats) return;
      // Zähler
      const tall = R.h > R.w * 1.2;
      if (!tall) return;
      let y = tray.y + tray.h + 26;
      rich(tt('Simulation', 'Simulation'), R.x + 14, y, 12.5, th().text, 'left', 800);
      y += 22;
      const pulse = reduced() ? 0 : Math.max(0, 1 - (now - burst) / 600);
      const w = rich(fmt.num(drawn.length, 0), R.x + 14, y, 22 + pulse * 4, th().text, 'left', 800);
      rich(drawn.length === 1 ? tt('Durchgang', 'run') : tt('Durchgänge', 'runs'), R.x + 20 + w, y + 2, 12, th().muted, 'left', 600);
      y += 26;
      if (evId() !== 'none' && drawn.length) {
        const hits = drawn.filter((d) => inEv(d)).length;
        rich(`${tt('Ereignis', 'event')}: ${hits} = ${fmt.fixed((hits / drawn.length) * 100, 1)} %`, R.x + 14, y, 12, EV(), 'left', 700);
      } else if (!drawn.length) {
        const txt = tt('Neben jedem Ergebnis wächst ein Balken mit der relativen Häufigkeit.', 'A bar with the relative frequency grows next to each outcome.');
        wrap(txt, R.w - 28, 11.5).slice(0, Math.max(0, Math.floor((R.y + R.h - 8 - y) / 15) + 1)).forEach((l, i) => rich(l, R.x + 14, y + i * 15, 11.5, th().muted, 'left', 550));
      }
    }
    function wrap(value: string, maxW: number, size: number): string[] {
      const rows: string[] = [];
      let cur = '';
      for (const w of value.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (measure(next, size, 550) > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    /* ---------- Baum ---------- */
    function treeGeo(R: Rect, t: TreeNode, rep: boolean, infoW: number, bottomPad: number): TreeGeo {
      const lv = leaves(t);
      const nL = lv.length;
      const st = rep ? stagesFor(true) : stagesFor(false);
      const top = R.y + 52;
      const bottom = R.y + R.h - bottomPad;
      const rowH = (bottom - top) / Math.max(1, nL);
      const x0 = R.x + 20;
      const x1 = R.x + R.w - infoW - 12;
      const colW = (x1 - x0) / Math.max(1, st);
      const nodes: NodeGeo[] = [];
      const ghosts: GhostGeo[] = [];
      const leafRows: TreeGeo['leafRows'] = [];
      let li = 0;
      const place = (node: TreeNode, depth: number, parent: NodeGeo | null): NodeGeo => {
        const ng: NodeGeo = { node, x: x0 + depth * colW, y: 0, depth, parent };
        nodes.push(ng);
        if (!node.children.length) {
          ng.y = top + (li + 0.5) * rowH;
          li++;
          leafRows.push({ path: node.path, y: ng.y, x: ng.x });
        } else {
          const kids = node.children.map((c) => place(c, depth + 1, ng));
          ng.y = (kids[0]!.y + kids[kids.length - 1]!.y) / 2;
        }
        if (depth < st) for (const c of exhaustedColors(urn(), node.path, rep)) ghosts.push({ from: ng, color: c, d: urnTotal(urnAfter(urn(), node.path, rep)) });
        return ng;
      };
      place(t, 0, null);
      return { nodes, ghosts, leafRows, infoX: x1 + 16, rowH, colW };
    }
    function growOf(depth: number, now: number): number {
      if (reduced()) return 1;
      return ease.inOutCubic(clamp01((now - growStart - (depth - 1) * 380) / 520));
    }
    function drawGlow(path: string, now: number): number {
      if (!draw) return 0;
      if (!draw.path.startsWith(path)) return 0;
      const t = (now - draw.t0) / STEP_MS - (path.length - 1);
      const fade = 1 - clamp01(((now - draw.t0) / STEP_MS - draw.path.length - 1.2) / 0.5);
      return clamp01(t) * fade;
    }

    interface TreeOpts {
      rep: boolean;
      title: string;
      sub?: string;
      /** Häufigkeitsbalken an den Blättern. */
      bars: boolean;
      /** Zeile unten (Pfad- oder Ereignisrechnung). */
      footer: boolean;
      /** zusätzliche Hervorhebung einzelner Pfade (Pfadregeln). */
      spot?: (path: string) => number;
      glow: boolean;
    }
    function drawTreeCard(R: Rect, now: number, o: TreeOpts): TreeGeo | null {
      const g = surface.g;
      const t = treeOf(o.rep);
      const lv = leaves(t);
      cardFrame(R, o.title, o.sub);
      const narrow = R.w < 460;
      const st = stagesFor(o.rep);
      const infoW = o.bars ? (narrow ? Math.min(150, R.w * 0.42) : Math.min(240, R.w * 0.38)) : narrow ? Math.min(120, R.w * 0.34) : Math.min(170, R.w * 0.32);
      const focus = hoverPath ?? pickPath;
      const evOn = evId() !== 'none';
      const footerOn = o.footer && (evOn || focus !== null);
      const tg = treeGeo(R, t, o.rep, infoW, footerOn ? 58 : 14);
      for (let dd = 1; dd <= st; dd++) {
        const xs = tg.nodes.find((n) => n.depth === dd)?.x;
        if (xs === undefined) continue;
        rich(narrow ? `${dd}.` : tt(`${dd}. Zug`, `draw ${dd}`), xs, R.y + 40, 11, th().muted, 'center', 700);
      }
      if (urnTotal(urn()) === 0) {
        rich(tt('Lege Kugeln in die Urne.', 'Put balls into the urn.'), R.x + R.w / 2, R.y + R.h / 2, 13, th().muted, 'center', 600);
        return tg;
      }
      const stack = tg.rowH >= 36 && p.num === 'frac';
      // Äste
      for (const n of tg.nodes) {
        if (!n.parent) continue;
        const gr = growOf(n.depth, now);
        if (gr <= 0) continue;
        const a = n.parent;
        const c = n.node.path[n.node.path.length - 1] as Color;
        const col = ballColor(c);
        const leafPaths = lv.map((l) => l.path).filter((lp) => lp.startsWith(n.node.path));
        const isFocus = focus !== null && focus.startsWith(n.node.path);
        const isEv = evOn && leafPaths.some((lp) => inEvT(t, lp));
        const spot = o.spot ? Math.max(0, ...leafPaths.map((lp) => o.spot!(lp))) : 0;
        const glow = o.glow ? drawGlow(n.node.path, now) : 0;
        const bx = lerp(a.x, n.x, gr);
        const by = lerp(a.y, n.y, gr);
        const mx = a.x + (n.x - a.x) * 0.35;
        g.save();
        g.lineCap = 'round';
        const w0 = 1.6 + 4 * fval(frac(n.node.edge.n, n.node.edge.d));
        const hi = Math.max(isEv ? 0.6 : 0, isFocus ? 1 : 0, glow, spot);
        if (hi > 0.02) {
          g.strokeStyle = mixColor(isFocus || glow > 0 || spot > 0 ? th().text : EV(), th().bg, 0, (th().dark ? 0.3 : 0.18) * Math.min(1, hi * 1.4));
          g.lineWidth = w0 + 8;
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.bezierCurveTo(mx, a.y, mx, by, bx, by);
          g.stroke();
        }
        g.strokeStyle = mixColor(col, th().bg, evOn && !isEv && !isFocus && spot < 0.5 ? 0.6 : 0.12);
        g.lineWidth = w0 + glow * 2;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.bezierCurveTo(mx, a.y, mx, by, bx, by);
        g.stroke();
        g.restore();
        if (gr > 0.9 && p.show) {
          const lx = a.x + (n.x - a.x) * 0.55;
          const ly = a.y + (n.y - a.y) * 0.62;
          const lab = numText(n.node.edge, false, stack);
          const fs = narrow || tg.rowH < 22 ? 10.5 : 12;
          const lw = measure(lab, fs, 750) + 10;
          const lh = stack ? fs * 2.3 + 2 : fs * 1.5;
          g.save();
          g.fillStyle = pillBg();
          roundRect(g, lx - lw / 2, ly - lh / 2, lw, lh, Math.min(9, lh / 2));
          g.fill();
          g.strokeStyle = mixColor(col, th().bg, 0.5);
          g.lineWidth = 1;
          g.stroke();
          g.restore();
          rich(lab, lx, ly + 0.5, fs, mixColor(col, th().text, 0.3), 'center', 750);
        }
      }
      // Sonderfall: aufgebrauchte Farben als gestrichelte Stummel mit 0
      for (const gh of tg.ghosts) {
        const gr = growOf(gh.from.depth + 1, now);
        if (gr < 0.9) continue;
        const a = gh.from;
        const ex = a.x + tg.colW * 0.55;
        const kids = tg.nodes.filter((n) => n.parent === a);
        const ey = kids.length ? Math.max(...kids.map((k) => k.y)) + Math.min(tg.rowH * 0.45, 22) : a.y;
        g.save();
        g.setLineDash([4, 4]);
        g.strokeStyle = mixColor(ballColor(gh.color), th().bg, 0.45);
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.quadraticCurveTo(a.x + (ex - a.x) * 0.4, ey, ex, ey);
        g.stroke();
        g.restore();
        if (p.show) rich(p.num === 'frac' ? `0/${gh.d}` : '0', ex + 4, ey, 10, mixColor(ballColor(gh.color), th().text, 0.4), 'left', 750);
      }
      // Knoten
      const nodeR = clamp(tg.rowH * 0.26, 5, 11);
      for (const n of tg.nodes) {
        if (!n.parent) {
          g.fillStyle = th().text;
          g.beginPath();
          g.arc(n.x, n.y, 4, 0, TAU);
          g.fill();
          continue;
        }
        const gr = growOf(n.depth, now);
        if (gr < 0.85) continue;
        ball(n.x, n.y, nodeR * ease.outBack(clamp01((gr - 0.85) / 0.15)), n.node.path[n.node.path.length - 1] as Color);
      }
      if (growOf(st, now) < 0.9) return tg;
      // Ergebnisse
      const total = drawn.length;
      for (const row of tg.leafRows) {
        const leaf = lv.find((l) => l.path === row.path)!;
        const isEv = evOn && inEvT(t, row.path);
        const isFocus = focus === row.path;
        const spot = o.spot ? o.spot(row.path) : 0;
        const h = Math.min(tg.rowH - 3, 28);
        const x = tg.infoX;
        const w = R.x + R.w - 10 - x;
        if (isEv || isFocus || spot > 0.02) {
          g.save();
          g.fillStyle = isFocus || spot > 0.02 ? mixColor(th().text, th().bg, 0, (th().dark ? 0.12 : 0.07) * Math.max(isFocus ? 1 : 0, spot)) : mixColor(EV(), th().bg, 0, th().dark ? 0.22 : 0.12);
          roundRect(g, x - 6, row.y - h / 2, w + 2, h, 8);
          g.fill();
          if (isEv) {
            g.strokeStyle = mixColor(EV(), th().bg, 0.4);
            g.lineWidth = 1.2;
            g.stroke();
          }
          g.restore();
        }
        const br = clamp(h * 0.24, 3.5, 6.5);
        row.path.split('').forEach((c, i) => ball(x + br + i * br * 2.3, row.y, br, c as Color));
        const px = x + br * 2.3 * row.path.length + 6;
        const fs = narrow || tg.rowH < 20 ? 10.5 : 12;
        const prob = p.show ? numText(leaf.prob, true, stack) : '?';
        rich(prob, px, row.y + 0.5, fitSize(prob, Math.max(30, x + w - px - (o.bars && total ? 60 : 4)), fs, 800, 8.5), isEv ? EV() : th().text, 'left', 800);
        if (o.bars && total > 0) {
          const bx0 = px + (narrow ? 44 : 58);
          const bw = Math.max(10, x + w - bx0 - 6);
          const rel = relS.get(row.path) ?? 0;
          g.save();
          g.fillStyle = mixColor(th().text, th().bg, 0, 0.07);
          roundRect(g, bx0, row.y - 4, bw, 8, 4);
          g.fill();
          g.fillStyle = mixColor(isEv ? EV() : FREQ(), th().bg, 0, 0.85);
          roundRect(g, bx0, row.y - 4, Math.max(0, bw * rel), 8, 4);
          g.fill();
          const pv = fval(leaf.prob);
          g.strokeStyle = th().text;
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(bx0 + bw * pv, row.y - 7);
          g.lineTo(bx0 + bw * pv, row.y + 7);
          g.stroke();
          g.restore();
        }
      }
      if (footerOn) drawFooter(R, o.rep);
      return tg;
    }

    /** Zeile unten im Baum: Pfad- oder Ereigniswahrscheinlichkeit. */
    function drawFooter(R: Rect, rep: boolean): void {
      const g = surface.g;
      const t = treeOf(rep);
      const lv = leaves(t);
      const focus = hoverPath ?? pickPath;
      let line = '';
      let color = th().text;
      if (focus && lv.some((l) => l.path === focus)) line = `P(${pathName(focus)}) = ${pathFormula(focus, rep)}`;
      else if (evId() !== 'none') {
        const parts = lv.filter((l) => inEvT(t, l.path));
        const sum = parts.reduce((s, l) => fadd(s, l.prob), ZERO);
        const terms = parts.map((l) => numText(l.prob));
        const short = terms.length > 4 ? [terms[0], terms[1], '…', terms[terms.length - 1]] : terms;
        line = parts.length ? `P(${evLabel()}) = ${p.show ? `${short.join(' + ')} = ${numText(sum)}` : '?'}` : `P(${evLabel()}) = 0`;
        if (p.show && evId() === 'minR' && parts.length > 2) {
          const none = lv.filter((l) => !inEvT(t, l.path)).reduce((s2, l) => fadd(s2, l.prob), ZERO);
          line = `P(${evLabel()}) = 1 − P(${tt('keine rote', 'no red')}) = 1 − ${numText(none)} = ${numText(sum)}`;
        }
        color = EV();
      }
      if (!line) return;
      const x = R.x + 14;
      const y = R.y + R.h - 30;
      const maxW = R.w - 28;
      const fs = fitSize(line, maxW - 16, 13, 750, 9);
      g.save();
      g.fillStyle = mixColor(color === th().text ? th().series[0]! : color, th().bg, 0, th().dark ? 0.16 : 0.08);
      roundRect(g, x - 4, y - 18, Math.min(maxW + 8, measure(line, fs, 750) + 24), 36, 10);
      g.fill();
      g.restore();
      rich(line, x + 8, y + 0.5, fs, color, 'left', 750);
    }

    /* ---------- Ansicht: Ziehen ---------- */
    function drawDrawMode(alpha: number, now: number): void {
      const lay = layout('draw');
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      drawUrn(lay.urn!, now, { tray: true, stats: true });
      const st = stagesFor(p.rep);
      const sub = p.n > emptyAfter(urn(), p.rep) && urnTotal(urn()) > 0 ? tt(`Urne nach ${st} Zügen leer`, `urn empty after ${st} draws`) : tt('Pfad antippen', 'tap a path');
      drawTreeCard(lay.tree!, now, { rep: p.rep, title: tt('Baumdiagramm', 'Tree diagram'), sub, bars: true, footer: true, glow: true });
      g.restore();
    }

    /* ---------- Ansicht: Vergleich ---------- */
    function drawCompare(alpha: number, now: number): void {
      const lay = layout('compare');
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      drawUrn(lay.urn!, now, { tray: false, stats: false, note: tt(`${urnTotal(urn())} Kugeln · zweimal derselbe Versuch`, `${urnTotal(urn())} balls · the same experiment twice`) });
      const R = lay.urn!;
      // Vergleich der Ereigniswahrscheinlichkeiten in der Urnenkarte
      const tall = R.h > R.w * 1.2;
      if (evId() !== 'none' && tall) {
        const e0 = eventProb(treeNo, evId(), parseSel(p.sel, leaves(treeNo).map((l) => l.path)));
        const e1 = eventProb(treeRep, evId(), parseSel(p.sel, leaves(treeRep).map((l) => l.path)));
        let y = R.y + R.h - 104;
        rich(`P(${evLabel()})`, R.x + 14, y, fitSize(`P(${evLabel()})`, R.w - 28, 12.5, 800), EV(), 'left', 800);
        y += 30;
        rich(tt('ohne:', 'without:'), R.x + 14, y, 12, th().muted, 'left', 700);
        rich(p.show ? numText(e0) : '?', R.x + R.w - 14, y, 14, th().text, 'right', 800);
        y += 32;
        rich(tt('mit:', 'with:'), R.x + 14, y, 12, th().muted, 'left', 700);
        rich(p.show ? numText(e1) : '?', R.x + R.w - 14, y, 14, th().text, 'right', 800);
      }
      const noEmpty = p.n > emptyAfter(urn(), false) && urnTotal(urn()) > 0;
      drawTreeCard(lay.tree!, now, { rep: false, title: tt('ohne Zurücklegen', 'without replacement'), sub: noEmpty ? tt(`nach ${urnTotal(urn())} Zügen leer`, `empty after ${urnTotal(urn())} draws`) : tt('Nenner werden kleiner', 'denominators shrink'), bars: false, footer: true, glow: false });
      drawTreeCard(lay.tree2!, now, { rep: true, title: tt('mit Zurücklegen', 'with replacement'), sub: tt('Äste bleiben gleich', 'branches stay the same'), bars: false, footer: true, glow: false });
      g.restore();
    }

    /* ---------- Ansicht: Pfadregeln ---------- */
    const RULE_STEP = 1100;
    function rulesProgress(now: number, count: number): number {
      if (reduced()) return count + 2;
      return (now - rulesT0) / RULE_STEP;
    }
    function drawRules(alpha: number, now: number): void {
      const lay = layout('rules');
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      const t = tree();
      const evOn = evId() !== 'none';
      const sp = splitPaths(t, evId(), sel());
      const useComp = evOn && sp.outside.length > 0 && sp.outside.length < sp.inside.length;
      const listPaths = useComp ? sp.outside : sp.inside;
      const prog = rulesProgress(now, listPaths.length);
      const spot = (path: string) => {
        const i = listPaths.indexOf(path);
        if (i < 0 || !evOn) return 0;
        const u = prog - i;
        return u < 0 ? 0 : u < 1 ? clamp01(u * 3) : 0.55;
      };
      drawTreeCard(lay.tree!, now, { rep: repNow(), title: tt('Baumdiagramm', 'Tree diagram'), sub: repNow() ? tt('mit Zurücklegen', 'with replacement') : tt('ohne Zurücklegen', 'without replacement'), bars: false, footer: false, spot, glow: false });
      // Rechenkarte
      const R = lay.calc!;
      cardFrame(R, tt('Pfadregeln', 'Path rules'), evOn ? `P(${evLabel()})` : undefined);
      const pad = 14;
      const rows: { src: string; col: string; a: number }[] = [];
      if (!evOn) {
        rows.push({ src: tt('1. Pfadregel: Entlang eines Pfades', '1st path rule: along a path'), col: th().text, a: 1 });
        rows.push({ src: tt('werden die Wahrscheinlichkeiten multipliziert.', 'the probabilities are multiplied.'), col: th().muted, a: 1 });
        rows.push({ src: tt('2. Pfadregel: Die Pfade eines Ereignisses', '2nd path rule: the paths of an event'), col: th().text, a: 1 });
        rows.push({ src: tt('werden addiert.', 'are added.'), col: th().muted, a: 1 });
        rows.push({ src: tt('Wähle ein Ereignis oder tippe Pfade an.', 'Choose an event or tap paths.'), col: EV(), a: 1 });
        const focus = hoverPath ?? pickPath;
        if (focus) rows.push({ src: `P(${focus}) = ${pathFormula(focus)}`, col: th().text, a: 1 });
      } else {
        if (useComp) rows.push({ src: tt(`Gegenereignis hat weniger Pfade (${sp.outside.length} statt ${sp.inside.length}):`, `the complement has fewer paths (${sp.outside.length} instead of ${sp.inside.length}):`), col: th().muted, a: 1 });
        else rows.push({ src: tt(`${sp.inside.length} ${sp.inside.length === 1 ? 'Pfad gehört' : 'Pfade gehören'} zum Ereignis:`, `${sp.inside.length} ${sp.inside.length === 1 ? 'path belongs' : 'paths belong'} to the event:`), col: th().muted, a: 1 });
        listPaths.forEach((path, i) => rows.push({ src: `P(${path}) = ${pathFormula(path)}`, col: th().text, a: clamp01((prog - i) * 2.5) }));
        const sumParts = listPaths.map((path) => leaves(t).find((l) => l.path === path)!.prob);
        const sum = sumParts.reduce((s, f) => fadd(s, f), ZERO);
        const sa = clamp01((prog - listPaths.length) * 2.5);
        const terms = sumParts.map((f) => numText(f));
        const short = terms.length > 4 ? [terms[0], terms[1], '…', terms[terms.length - 1]] : terms;
        if (!listPaths.length) rows.push({ src: tt('Kein Pfad gehört dazu: P = 0', 'No path belongs to it: P = 0'), col: EV(), a: 1 });
        else if (useComp) {
          rows.push({ src: tt(`P(Gegenereignis) = ${p.show ? `${short.join(' + ')} = ${numText(sum)}` : '?'}`, `P(complement) = ${p.show ? `${short.join(' + ')} = ${numText(sum)}` : '?'}`), col: th().text, a: sa });
          rows.push({ src: `P(${evLabel()}) = 1 − ${p.show ? numText(sum) : '?'} = ${p.show ? numText(fsub(ONE, sum)) : '?'}`, col: EV(), a: clamp01((prog - listPaths.length - 0.5) * 2.5) });
        } else rows.push({ src: `P(${evLabel()}) = ${p.show ? `${short.join(' + ')} = ${numText(sum)}` : '?'}`, col: EV(), a: sa });
      }
      const top = R.y + 44;
      const lh = clamp((R.y + R.h - pad - top) / Math.max(1, rows.length), 20, 46);
      let y = top + lh / 2;
      for (const row of rows) {
        const s = fitSize(row.src, R.w - 2 * pad, Math.min(baseSize() + 0.5, lh * 0.42), 650, 8.5);
        g.save();
        g.globalAlpha *= 0.08 + 0.92 * ease.outCubic(row.a);
        rich(row.src, R.x + pad + (1 - ease.outCubic(row.a)) * 10, y, s, row.col, 'left', 700);
        g.restore();
        y += lh;
      }
      g.restore();
    }

    /* ---------- Ansicht: Simulation ---------- */
    function drawSim(alpha: number, now: number): void {
      const lay = layout('sim');
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      drawUrn(lay.urn!, now, { tray: true, stats: true });
      drawChart(lay.chart!, now);
      drawTreeCard(lay.tree!, now, { rep: p.rep, title: tt('Ergebnisse', 'Outcomes'), sub: tt('Balken: Häufigkeit, Strich: P', 'bar: frequency, mark: P'), bars: true, footer: false, glow: false });
      g.restore();
    }
    function drawChart(R: Rect, now: number): void {
      const g = surface.g;
      const evOn = evId() !== 'none';
      const target = evOn ? null : leafList()[0]?.path ?? null;
      const title = evOn ? tt(`Relative Häufigkeit: ${evLabel()}`, `Relative frequency: ${evLabel()}`) : tt(`Relative Häufigkeit des Ergebnisses ${target ?? ''}`, `Relative frequency of the outcome ${target ?? ''}`);
      cardFrame(R, title, `N = ${fmt.num(drawn.length, 0)}`);
      const A: Rect = { x: R.x + 46, y: R.y + 40, w: R.w - 64, h: R.h - 66 };
      if (A.h < 30) return;
      const isHit = (d: string) => (evOn ? inEv(d) : d === target);
      const P = evOn ? fval(eventProb(tree(), evId(), sel())) : target ? fval(leaves(tree()).find((l) => l.path === target)!.prob) : 0;
      const N = drawn.length;
      const xMax = Math.max(100, niceUp(N));
      const X = (x: number) => A.x + (x / xMax) * A.w;
      const Y = (v: number) => A.y + A.h - v * A.h;
      const size = baseSize() - 2;
      g.lineWidth = 1;
      for (const v of [0, 0.25, 0.5, 0.75, 1]) {
        g.strokeStyle = v === 0 ? th().axis : th().grid;
        g.beginPath();
        g.moveTo(A.x, Math.round(Y(v)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(v)) + 0.5);
        g.stroke();
        rich(`${fmt.num(v * 100, 0)} %`, A.x - 6, Y(v), size, th().muted, 'right', 600);
      }
      const step = niceStep(xMax / 5);
      for (let x = 0; x <= xMax + 1e-9; x += step) if (X(x) < A.x + A.w - 16) rich(fmt.num(x, 0), X(x), A.y + A.h + 12, size, th().muted, 'center', 600);
      rich('N', A.x + A.w + 8, A.y + A.h + 12, size + 1, th().muted, 'center', 700);
      g.save();
      g.beginPath();
      g.rect(A.x - 2, A.y - 4, A.w + 4, A.h + 6);
      g.clip();
      if (p.show) {
        g.fillStyle = mixColor(FREQ(), th().bg, 0, th().dark ? 0.2 : 0.13);
        g.beginPath();
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
          const n = Math.max(1, (xMax * i) / steps);
          const [, hi] = band95(P, n);
          if (i === 0) g.moveTo(X(n), Y(hi));
          else g.lineTo(X(n), Y(hi));
        }
        for (let i = steps; i >= 0; i--) {
          const n = Math.max(1, (xMax * i) / steps);
          g.lineTo(X(n), Y(band95(P, n)[0]));
        }
        g.closePath();
        g.fill();
        g.strokeStyle = th().text;
        g.lineWidth = 1.6;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(A.x, Y(P));
        g.lineTo(A.x + A.w, Y(P));
        g.stroke();
        g.setLineDash([]);
      }
      if (N) {
        g.strokeStyle = EV();
        g.lineWidth = 2.2;
        g.lineJoin = 'round';
        g.beginPath();
        let hits = 0;
        const stride = Math.max(1, Math.floor(N / 500));
        for (let i = 0; i < N; i++) {
          if (isHit(drawn[i]!)) hits++;
          if (i % stride === 0 || i === N - 1) {
            const y = Y(hits / (i + 1));
            if (i === 0) g.moveTo(X(1), y);
            else g.lineTo(X(i + 1), y);
          }
        }
        g.stroke();
        g.fillStyle = EV();
        g.beginPath();
        g.arc(X(N), Y(hits / N), 4.5, 0, TAU);
        g.fill();
      }
      g.restore();
      if (p.show) rich(`P = ${numText(eventOrLeaf(), true, false)}`, A.x + A.w - 4, Y(P) + (P > 0.85 ? 12 : -11), size + 0.5, th().text, 'right', 800);
      if (!N) rich(tt('„100-mal ziehen“ startet die Simulation.', '“Draw 100 times” starts the simulation.'), A.x + A.w / 2, A.y + A.h * 0.3, size + 1, th().muted, 'center', 650);
      void now;
    }
    function eventOrLeaf(): Frac {
      if (evId() !== 'none') return eventProb(tree(), evId(), sel());
      return leafList()[0]?.prob ?? ZERO;
    }
    const niceStep = (raw: number) => {
      const e = 10 ** Math.floor(Math.log10(Math.max(1e-9, raw)));
      const f = raw / e;
      return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
    };
    function niceUp(v: number): number {
      if (v <= 100) return 100;
      const e = 10 ** Math.floor(Math.log10(v));
      for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= v) return m * e;
      return 10 * e;
    }

    /* ---------- Zeiger ---------- */
    /** Bäume mit Lage der Blätter (zweiter Baum nur im Vergleich). */
    function leafGeos(): { R: Rect; tg: TreeGeo }[] {
      const m = mode();
      const lay = layout(m);
      const cands: [Rect | undefined, boolean, boolean][] = [
        [lay.tree, m === 'compare' ? false : repNow(), m === 'draw' || m === 'sim'],
        [lay.tree2, true, false],
      ];
      const out: { R: Rect; tg: TreeGeo }[] = [];
      for (const [R, rep, bars] of cands) {
        if (!R) continue;
        const narrow = R.w < 460;
        const infoW = bars ? (narrow ? Math.min(150, R.w * 0.42) : Math.min(240, R.w * 0.38)) : narrow ? Math.min(120, R.w * 0.34) : Math.min(170, R.w * 0.32);
        const footerOn = m !== 'rules' && m !== 'sim' && (evId() !== 'none' || hoverPath !== null || pickPath !== null);
        out.push({ R, tg: treeGeo(R, treeOf(rep), rep, infoW, footerOn ? 58 : 14) });
      }
      return out;
    }
    function leafAt(px: number, py: number): string | null {
      for (const { R, tg } of leafGeos()) {
        if (px < R.x || px > R.x + R.w || py < R.y || py > R.y + R.h) continue;
        let best: string | null = null;
        let bd = Infinity;
        for (const row of tg.leafRows) {
          const d = Math.abs(py - row.y);
          if (d < tg.rowH / 2 && px > row.x - 30 && d < bd) {
            bd = d;
            best = row.path;
          }
        }
        return best;
      }
      return null;
    }
    /** Pfad antippen: hervorheben (und bei „eigenes Ereignis“ hinzufügen/entfernen). */
    function tapLeaf(lp: string): void {
      if (evId() === 'custom' && !ctx.locked) {
        const cur = sel();
        const next = cur.includes(lp) ? cur.filter((s) => s !== lp) : [...cur, lp];
        ctx.set({ sel: next.join(', ') });
      }
      pickPath = pickPath === lp ? null : lp;
      updateReadouts();
      ctx.requestRender();
    }
    /** Tastatur: Pfade wie Antippen (Pfeiltasten wählen, Enter hebt hervor). */
    function updateKeyTargets(): void {
      const first = leafGeos()[0];
      if (!first) {
        ctx.setKeyTargets([]);
        return;
      }
      const { R, tg } = first;
      ctx.setKeyTargets(
        tg.leafRows.map((row) => ({
          id: row.path,
          label: `P(${pathName(row.path)})${evId() === 'custom' && sel().includes(row.path) ? ` – ${tt('im Ereignis', 'in the event')}` : ''}`,
          rect: { x: row.x - 30, y: row.y - tg.rowH / 2, w: R.x + R.w - (row.x - 30), h: tg.rowH },
          activate: () => tapLeaf(row.path),
        })),
      );
    }
    surface.addTarget({
      contains: (px, py) => {
        const lay = layout(mode());
        return [lay.tree, lay.tree2].some((R) => R && px >= R.x && px <= R.x + R.w && py >= R.y && py <= R.y + R.h);
      },
      pointerDown: (pt) => {
        const lp = leafAt(pt.px, pt.py);
        if (!lp) {
          if (pickPath) {
            pickPath = null;
            updateReadouts();
            ctx.requestRender();
          }
          return true;
        }
        tapLeaf(lp);
        return true;
      },
      pointerMove: () => undefined,
      pointerUp: () => undefined,
      hover: (pt) => {
        const lp = pt ? leafAt(pt.px, pt.py) : null;
        surface.setCursor(lp ? 'pointer' : '');
        if (lp !== hoverPath) {
          hoverPath = lp;
          updateReadouts();
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------- Ergebnisse (Text) ---------- */
    function updateReadouts(): void {
      const lv = leafList();
      const focus = hoverPath ?? pickPath ?? lv[0]?.path ?? null;
      ctx.readout('path', focus ? `P(${pathName(focus)}) = ${pathFormula(focus, repNow(), false)}` : null);
      if (evId() !== 'none') {
        const parts = lv.filter((l) => inEv(l.path));
        const sum = eventProb(tree(), evId(), sel());
        ctx.readout(
          'ev',
          parts.length === 1
            ? `P(${pathName(parts[0]!.path)}) = ${numText(sum, true, false)}`
            : parts.length
              ? `${parts.map((l) => `P(${pathName(l.path)})`).join(' + ')} = ${parts.map((l) => numText(l.prob, true, false)).join(' + ')} = ${numText(sum, true, false)}`
              : tt('Kein Pfad gehört zum Ereignis: P = 0', 'No path belongs to the event: P = 0'),
        );
      } else ctx.readout('ev', null);
      if (drawn.length) {
        const lines = lv.map((l) => `${l.path}: ${drawn.filter((d) => d === l.path).length}`).join(' · ');
        ctx.readout('sim', `${drawn.length} ${tt('Durchgänge', 'runs')} – ${lines}`);
      } else ctx.readout('sim', tt('noch nicht gezogen', 'no draws yet'));
    }
    function syncActions(): void {
      const ok = !ctx.locked && urnTotal(urn()) > 0;
      ctx.setAction('draw', { enabled: ok && !runner });
      ctx.setAction('many', { enabled: ok && !runner });
      ctx.setAction('k1000', { enabled: ok && !runner });
      ctx.setAction('play', { enabled: !ctx.locked && evId() !== 'none' });
      ctx.setAction('clear', { enabled: !ctx.locked && drawn.length > 0 && !runner });
    }

    /* ---------- Ablauf ---------- */
    function record(path: string): void {
      if (drawn.length < 50000) drawn.push(path);
    }
    function relTargets(): Map<string, number> {
      const m = new Map<string, number>();
      const N = drawn.length;
      for (const l of leafList()) m.set(l.path, 0);
      if (!N) return m;
      for (const d of drawn) m.set(d, (m.get(d) ?? 0) + 1);
      for (const [k, v] of m) m.set(k, v / N);
      return m;
    }
    function stepState(now: number, dt: number): boolean {
      let anim = false;
      if (draw && now - draw.t0 > STEP_MS * (draw.path.length + 1.8)) {
        record(draw.path);
        draw = null;
        updateReadouts();
        syncActions();
      }
      if (draw) anim = true;
      if (runner) {
        const u = runner.dur <= 0 ? 1 : clamp01((now - runner.t0) / runner.dur);
        const due = Math.round(runner.target * ease.inOutCubic(u));
        while (runner.done < due) {
          record(drawPath(urn(), stagesFor(p.rep), p.rep, rnd));
          runner.done++;
        }
        burst = now;
        anim = true;
        if (u >= 1) {
          runner = null;
          syncActions();
        }
        updateReadouts();
      }
      const tg = relTargets();
      for (const [k, v] of tg) {
        const cur = relS.get(k) ?? 0;
        const nv = follow(cur, v, dt, reduced() || runner ? 0 : 0.2);
        relS.set(k, nv);
        if (nv !== v) anim = true;
      }
      if (view.busy(now) || repG.busy(now)) anim = true;
      if (!reduced() && now - growStart < 380 * 3 + 900) anim = true;
      if (now - burst < 700) anim = true;
      if (mode() === 'rules' && !reduced() && now - rulesT0 < RULE_STEP * 12) anim = true;
      return anim;
    }

    function render(): void {
      updateKeyTargets();
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = stepState(now, dt);
      let kAll = 1;
      if (intro !== null) {
        const t = now - intro;
        if (t > 900) intro = null;
        else {
          anim = true;
          kAll = ease.outCubic(clamp01(t / 450));
        }
      }
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      const u = view.at(now);
      if (u < 1 && prevMode !== mode()) drawMode(prevMode, (1 - u) * kAll, now, -u * 14);
      drawMode(mode(), u * kAll, now, (1 - u) * 14 + (1 - kAll) * 10);
      if (anim) ctx.requestRender();
    }
    function drawMode(m: Mode, alpha: number, now: number, dx: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      g.save();
      g.translate(dx, 0);
      if (m === 'draw') drawDrawMode(alpha, now);
      else if (m === 'compare') drawCompare(alpha, now);
      else if (m === 'rules') drawRules(alpha, now);
      else drawSim(alpha, now);
      g.restore();
    }

    rebuild(performance.now());
    updateReadouts();
    syncActions();

    return {
      update(changed, source) {
        const now = performance.now();
        const structural = ['r', 'b', 'g', 'rep', 'n'].some((k) => changed.has(k));
        if (structural && source !== 'init') {
          drawn = [];
          relS.clear();
          draw = null;
          runner = null;
          pickPath = null;
        }
        if (changed.has('mode') && source !== 'init' && mode() !== curMode) {
          prevMode = curMode;
          curMode = mode();
          if (reduced()) view.snap(1);
          else {
            view.snap(0);
            view.go(1, 520, now);
          }
          draw = null;
          hoverPath = null;
          rulesT0 = now + 300;
        }
        if (source === 'init') curMode = mode();
        if (changed.has('ev') && source === 'input' && p.ev !== 'custom' && p.sel) ctx.set({ sel: '' });
        if ((changed.has('ev') || changed.has('sel') || structural) && source !== 'init') rulesT0 = now + 150;
        rebuild(now);
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },
      action(id) {
        const now = performance.now();
        if (ctx.locked) return;
        if (id === 'play') {
          rulesT0 = now;
          ctx.requestRender();
          return;
        }
        if (id === 'clear') {
          drawn = [];
          draw = null;
          runner = null;
          rnd = seededRandom((Date.now() ^ 0x2545f491) >>> 0);
          updateReadouts();
          syncActions();
          ctx.requestRender();
          return;
        }
        if (urnTotal(urn()) === 0) return;
        if (id === 'draw') {
          const path = drawPath(urn(), stagesFor(p.rep), p.rep, rnd);
          if (reduced()) record(path);
          else {
            if (draw) record(draw.path);
            draw = { path, t0: now };
          }
          pickPath = null;
        } else if (id === 'many' || id === 'k1000') {
          if (draw) {
            record(draw.path);
            draw = null;
          }
          const count = id === 'many' ? 100 : 1000;
          if (mode() === 'sim' && !reduced()) runner = { target: count, done: 0, t0: now, dur: count >= 1000 ? 3600 : 2200 };
          else {
            for (let i = 0; i < count; i++) record(drawPath(urn(), stagesFor(p.rep), p.rep, rnd));
            burst = now;
          }
        }
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
