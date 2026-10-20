import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, seededRandom, Surface, type Rect } from '../../../sim-core';
import {
  cellsFromTree,
  CONTEXT_DATA,
  eventCells,
  eventCount,
  GIVEN_SETS,
  independent,
  independentTree,
  reduce,
  reverseTree,
  solveStep,
  table,
  tableValues,
  treeBranches,
  vennGeometry,
  type Cells,
  type EventId,
  type SolveStep,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const TAU = Math.PI * 2;

type Ctx = 'pet' | 'club' | 'abc';
type Mode = 'sync' | 'fill' | 'tree' | 'mosaic';

const CTX_TEXT: Record<Ctx, { title: Loc; A: Loc; B: Loc }> = {
  pet: { title: L('Klasse 9a', 'Class 9a'), A: L('Haustier', 'pet'), B: L('Geschwister', 'siblings') },
  club: { title: L('200 Jugendliche', '200 teenagers'), A: L('Sportverein', 'sports club'), B: L('Instrument', 'instrument') },
  abc: { title: L('Ereignisse A und B', 'Events A and B'), A: L('A', 'A'), B: L('B', 'B') },
};

const EVENTS: { value: EventId; label: Loc; sym: string }[] = [
  { value: 'none', label: L('keins', 'none'), sym: '' },
  { value: 'A', label: L('A', 'A'), sym: 'A' },
  { value: 'B', label: L('B', 'B'), sym: 'B' },
  { value: 'nA', label: L('nicht A (Ā)', 'not A (Ā)'), sym: 'Ā' },
  { value: 'nB', label: L('nicht B (B̄)', 'not B (B̄)'), sym: 'B̄' },
  { value: 'AB', label: L('A und B (A ∩ B)', 'A and B (A ∩ B)'), sym: 'A ∩ B' },
  { value: 'AuB', label: L('A oder B (A ∪ B)', 'A or B (A ∪ B)'), sym: 'A ∪ B' },
  { value: 'AnB', label: L('A, aber nicht B', 'A but not B'), sym: 'A ∩ B̄' },
  { value: 'nAB', label: L('B, aber nicht A', 'B but not A'), sym: 'Ā ∩ B' },
  { value: 'xor', label: L('genau eins von beiden', 'exactly one of them'), sym: '(A ∩ B̄) ∪ (Ā ∩ B)' },
  { value: 'none2', label: L('keins von beiden', 'neither'), sym: 'Ā ∩ B̄' },
];
const evSym = (ev: EventId) => EVENTS.find((e) => e.value === ev)?.sym ?? '';
/** Ereignis eines inneren Felds bzw. einer Randsumme (Index wie `tableValues`). */
const EV_OF_INDEX: (EventId | null)[] = ['AB', 'AnB', 'A', 'nAB', 'none2', 'nA', 'B', 'nB', null];
/** Name eines Tafelwerts (Index wie `tableValues`). */
const NAME_OF_INDEX = ['A ∩ B', 'A ∩ B̄', 'A', 'Ā ∩ B', 'Ā ∩ B̄', 'Ā', 'B', 'B̄', 'Ω'];

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

interface Sample {
  x: number;
  y: number;
  t0: number;
}

const cellParam = <K extends string>(key: K, label: Loc, def: number) => ({ key, type: 'number' as const, group: 'data', label, min: 0, max: 99, step: 1, default: def, visibleIf: (v: Record<string, unknown>) => v.mode === 'sync' || v.mode === 'fill' });
const probMode = (v: Record<string, unknown>) => v.mode === 'tree' || v.mode === 'mosaic';

/**
 * Vierfeldertafel in vier Ansichten:
 * – Alles synchron: Tafel, flächentreues Mengendiagramm und Baum zeigen dieselben
 *   Daten; Felder, Randsummen, Kreisteile und Blätter antippen wählt das Ereignis.
 * – Tafel ergänzen: nur einige Werte sind bekannt; „?“ antippen erschließt einen
 *   Wert aus einer Zeilen- oder Spaltensumme (oder sagt, was noch fehlt).
 * – Baum umkehren: aus P(A), P_A(B), P_Ā(B) entstehen Tafel und umgekehrter Baum.
 * – Einheitsquadrat: Teilungslinien ziehen, Unabhängigkeit sehen, Personen auslosen.
 */
export default defineSimulation({
  id: 'vierfeldertafel',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  groups: [
    { id: 'data', label: L('Anzahlen', 'Counts') },
    { id: 'prob', label: L('Wahrscheinlichkeiten', 'Probabilities') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'sync', label: L('Alles synchron', 'All in sync') },
        { value: 'fill', label: L('Tafel ergänzen', 'Complete the table') },
        { value: 'tree', label: L('Baum umkehren', 'Reverse the tree') },
        { value: 'mosaic', label: L('Einheitsquadrat', 'Unit square') },
      ],
      default: 'sync',
    },
    {
      key: 'ctx',
      type: 'choice',
      label: L('Beispiel', 'Example'),
      options: [
        { value: 'pet', label: L('Haustier und Geschwister', 'Pet and siblings') },
        { value: 'club', label: L('Sportverein und Instrument', 'Sports club and instrument') },
        { value: 'abc', label: L('allgemein A und B', 'general A and B') },
      ],
      default: 'pet',
    },
    { key: 'ev', type: 'choice', label: L('Ereignis', 'Event'), help: L('Oder Feld, Randsumme, Kreisteil bzw. Blatt antippen.', 'Or tap a cell, total, part of a circle or leaf.'), options: EVENTS.map((e) => ({ value: e.value, label: e.label })), default: 'AuB', visibleIf: (v) => v.mode === 'sync' },
    {
      key: 'given',
      type: 'choice',
      label: L('Bekannt sind', 'Known values'),
      options: [
        { value: 'g1', label: L('A ∩ B, |A|, |B| und gesamt', 'A ∩ B, |A|, |B| and total') },
        { value: 'g2', label: L('|A|, A ∩ B̄, Ā ∩ B und gesamt', '|A|, A ∩ B̄, Ā ∩ B and total') },
        { value: 'g3', label: L('die vier inneren Felder', 'the four inner cells') },
      ],
      default: 'g1',
      visibleIf: (v) => v.mode === 'fill',
    },
    cellParam('c1', L('A und B', 'A and B'), 10),
    cellParam('c2', L('A, nicht B', 'A, not B'), 4),
    cellParam('c3', L('nicht A, B', 'not A, B'), 9),
    cellParam('c4', L('weder A noch B', 'neither A nor B'), 7),
    { key: 'pa', type: 'number', group: 'prob', label: L('P(A)', 'P(A)'), min: 0, max: 1, step: 0.01, default: 0.4, visibleIf: probMode },
    { key: 'pb1', type: 'number', group: 'prob', label: L('P_A(B): B, wenn A', 'P_A(B): B given A'), min: 0, max: 1, step: 0.01, default: 0.7, visibleIf: probMode },
    { key: 'pb2', type: 'number', group: 'prob', label: L('P_Ā(B): B, wenn nicht A', 'P_Ā(B): B given not A'), help: L('Im Einheitsquadrat auch die Linien ziehen.', 'In the unit square you can also drag the lines.'), min: 0, max: 1, step: 0.01, default: 0.2, visibleIf: probMode },
    {
      key: 'order',
      type: 'choice',
      group: 'view',
      label: L('Baum beginnt mit', 'Tree starts with'),
      options: [
        { value: 'AB', label: L('A', 'A') },
        { value: 'BA', label: L('B', 'B') },
      ],
      default: 'AB',
      visibleIf: (v) => v.mode === 'sync',
    },
    {
      key: 'num',
      type: 'choice',
      group: 'view',
      label: L('Darstellung', 'Show as'),
      options: [
        { value: 'abs', label: L('Anzahlen', 'counts') },
        { value: 'frac', label: L('Brüche', 'fractions') },
        { value: 'pct', label: L('Prozent', 'percent') },
      ],
      default: 'abs',
    },
    { key: 'nn', type: 'number', group: 'view', label: L('Natürliche Häufigkeiten: von …', 'Natural frequencies: out of …'), help: L('Bei „Anzahlen“: so viele Personen insgesamt.', 'With “counts”: this many people in total.'), min: 10, max: 1000, step: 10, default: 100, visibleIf: (v) => probMode(v) && v.num === 'abs' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Innere Felder anzeigen', 'Show inner cells'), default: true, help: L('Für Aufgaben ausblenden: Dann sind nur die Randsummen sichtbar.', 'Hide for tasks: then only the totals are visible.'), visibleIf: (v) => v.mode === 'sync' },
  ],
  actions: [
    { id: 'reveal', label: L('Nächsten Wert erschließen', 'Work out the next value'), primary: true, visibleIf: (v) => v.mode === 'fill' },
    { id: 'shuffle', label: L('Neue Zahlen', 'New numbers'), visibleIf: (v) => v.mode === 'fill' },
    { id: 'restart', label: L('Von vorn', 'Start again'), visibleIf: (v) => v.mode === 'fill' },
    { id: 'sample', label: L('100 Personen auslosen', 'Draw 100 people'), primary: true, visibleIf: (v) => v.mode === 'mosaic' },
    { id: 'indep', label: L('Unabhängig machen', 'Make independent'), visibleIf: (v) => v.mode === 'mosaic' },
    { id: 'sclear', label: L('Stichprobe löschen', 'Clear sample'), visibleIf: (v) => v.mode === 'mosaic' },
  ],
  readouts: [
    { key: 'ev', label: L('Ereignis', 'Event'), spoiler: true },
    { key: 'add', label: L('Additionssatz bzw. Summenregel', 'Addition rule or sum rule'), spoiler: true },
    { key: 'cond', label: L('Bedingte Wahrscheinlichkeit', 'Conditional probability'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('A oder B: Additionssatz', 'A or B: addition rule'), values: {} },
    { id: 'both', label: L('A und B', 'A and B'), values: { ev: 'AB' } },
    { id: 'reverse', label: L('Umgekehrter Baum', 'Reversed tree'), values: { order: 'BA', ev: 'AB' } },
    { id: 'club', label: L('200 Jugendliche in Prozent', '200 teenagers in percent'), values: { ctx: 'club', c1: 46, c2: 34, c3: 52, c4: 68, num: 'pct', ev: 'xor' } },
    { id: 'fill', label: L('Tafel ergänzen', 'Complete the table'), values: { mode: 'fill' } },
    { id: 'treeP', label: L('Baum umkehren: P(A) = 0,4', 'Reverse the tree: P(A) = 0.4'), values: { mode: 'tree', ctx: 'abc', num: 'frac' } },
    { id: 'mosaic', label: L('Einheitsquadrat', 'Unit square'), values: { mode: 'mosaic', ctx: 'abc', num: 'frac' } },
    { id: 'indep', label: L('Unabhängigkeit im Einheitsquadrat', 'Independence in the unit square'), values: { mode: 'mosaic', ctx: 'abc', num: 'frac', pb1: 0.6, pb2: 0.6 } },
  ],
  strings: {
    de: { canvas: 'Vierfeldertafel: wahlweise Tafel, Mengendiagramm und Baum derselben Daten synchron hervorgehoben, eine Tafel zum Ergänzen aus Zeilen- und Spaltensummen, ein Baum mit umgekehrtem Baum aus Wahrscheinlichkeiten oder das Einheitsquadrat mit ziehbaren Teilungslinien und ausgelosten Personen.' },
    en: { canvas: 'Two-way table: either table, Venn diagram and tree of the same data highlighted in sync, a table to complete from row and column totals, a tree with its reversed tree from probabilities, or the unit square with draggable dividing lines and randomly drawn people.' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const T = (l: Loc) => (de ? l.de : l.en);
    const reduced = () => prefersReducedMotion();
    const mode = () => p.mode as Mode;
    const cx = () => CTX_TEXT[p.ctx as Ctx] ?? CTX_TEXT.abc;
    const ev = () => p.ev as EventId;

    /* ---------- Farben ---------- */
    const C = () => {
      const s = th().series;
      return { A: s[0]!, B: s[3]!, ev: s[4]!, ok: s[2]!, warn: s[1]!, sel: s[5]! };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)');

    /* ---------- Zustand ---------- */
    const cells = (): Cells => [p.c1, p.c2, p.c3, p.c4];
    const cS = [p.c1, p.c2, p.c3, p.c4];
    let paS = p.pa;
    let pb1S = p.pb1;
    let pb2S = p.pb2;
    /** Hervorhebung je Tafelwert (0 … 1), weich nachgeführt. */
    const hlS = Array.from({ length: 9 }, () => 0);
    let hover: number | null = null;
    /** Ausgewähltes Blatt bzw. Feld in „Baum umkehren“ und „Einheitsquadrat“. */
    let sel: number | null = 0;
    const view = new Glide(1);
    let prevMode: Mode = mode();
    let curMode: Mode = mode();
    const order = new Glide(p.order === 'BA' ? 1 : 0);
    let intro: number | null = reduced() ? null : performance.now();
    let lastTime = performance.now();
    let cardT0 = -1e9;

    // Tafel ergänzen
    let known: boolean[] = [];
    let revealT = Array.from({ length: 9 }, () => -1e9);
    let steps: SolveStep[] = [];
    let msg: { text: string; t0: number; idx: number } | null = null;
    let lastStep: { st: SolveStep; t0: number } | null = null;
    function resetFill(): void {
      const set = GIVEN_SETS[(p.given as 'g1' | 'g2' | 'g3') ?? 'g1'] ?? GIVEN_SETS.g1;
      known = Array.from({ length: 9 }, (_, i) => set.includes(i));
      revealT = Array.from({ length: 9 }, () => -1e9);
      steps = [];
      msg = null;
      lastStep = null;
    }
    resetFill();
    let autoReveal = false;
    let autoT = 0;

    // Einheitsquadrat
    let samples: Sample[] = [];
    let seedN = 0;
    const nextRandom = () => seededRandom((Date.now() ^ (0x9e3779b9 * ++seedN)) >>> 0);
    let drag: 'pa' | 'pb1' | 'pb2' | null = null;

    /* ---------- Aufteilung ---------- */
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const baseSize = () => (wide() ? (surface.width < 900 ? 12 : 13) : 12);

    interface Lay {
      table?: Rect;
      venn?: Rect;
      tree?: Rect;
      tree2?: Rect;
      info?: Rect;
      square?: Rect;
      steps?: Rect;
    }
    function layout(m: Mode): Lay {
      const W = surface.width;
      const H = surface.height;
      const gap = 10;
      if (m === 'sync') {
        if (wide()) {
          const lw = Math.round(W * 0.5);
          const th0 = Math.round(H * 0.47);
          const treeH = Math.round(H * 0.72);
          return { table: { x: 0, y: 0, w: lw, h: th0 }, venn: { x: 0, y: th0 + gap, w: lw, h: H - th0 - gap }, tree: { x: lw + gap, y: 0, w: W - lw - gap, h: treeH }, info: { x: lw + gap, y: treeH + gap, w: W - lw - gap, h: H - treeH - gap } };
        }
        const a = Math.round(H * 0.25);
        const b = Math.round(H * 0.22);
        const c = Math.round(H * 0.33);
        return { table: { x: 0, y: 0, w: W, h: a }, venn: { x: 0, y: a + gap, w: W, h: b }, tree: { x: 0, y: a + b + 2 * gap, w: W, h: c }, info: { x: 0, y: a + b + c + 3 * gap, w: W, h: H - a - b - c - 3 * gap } };
      }
      if (m === 'fill') {
        if (wide()) {
          const lw = Math.round(W * 0.58);
          return { table: { x: 0, y: 0, w: lw, h: H }, steps: { x: lw + gap, y: 0, w: W - lw - gap, h: H } };
        }
        const a = Math.round(H * 0.46);
        return { table: { x: 0, y: 0, w: W, h: a }, steps: { x: 0, y: a + gap, w: W, h: H - a - gap } };
      }
      if (m === 'tree') {
        if (wide()) {
          const ih = Math.round(H * 0.26);
          const top = H - ih - gap;
          const tw = Math.round(W * 0.37);
          const mw = W - 2 * tw - 2 * gap;
          return { tree: { x: 0, y: 0, w: tw, h: top }, table: { x: tw + gap, y: 0, w: mw, h: top }, tree2: { x: tw + mw + 2 * gap, y: 0, w: tw, h: top }, info: { x: 0, y: top + gap, w: W, h: ih } };
        }
        const a = Math.round(H * 0.27);
        const b = Math.round(H * 0.22);
        const c = Math.round(H * 0.27);
        return { tree: { x: 0, y: 0, w: W, h: a }, table: { x: 0, y: a + gap, w: W, h: b }, tree2: { x: 0, y: a + b + 2 * gap, w: W, h: c }, info: { x: 0, y: a + b + c + 3 * gap, w: W, h: H - a - b - c - 3 * gap } };
      }
      // Einheitsquadrat
      if (wide()) {
        const lw = Math.round(W * 0.54);
        const th0 = Math.round(H * 0.5);
        return { square: { x: 0, y: 0, w: lw, h: H }, table: { x: lw + gap, y: 0, w: W - lw - gap, h: th0 }, info: { x: lw + gap, y: th0 + gap, w: W - lw - gap, h: H - th0 - gap } };
      }
      const a = Math.round(H * 0.47);
      const b = Math.round(H * 0.24);
      return { square: { x: 0, y: 0, w: W, h: a }, table: { x: 0, y: a + gap, w: W, h: b }, info: { x: 0, y: a + b + 2 * gap, w: W, h: H - a - b - 2 * gap } };
    }

    /* ---------- Text mit Brüchen, Hoch- und Tiefstellung ---------- */
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
    function fitSize(src: string, maxW: number, size: number, weight = 650, min = 9.5): number {
      let s = size;
      while (s > min && measure(src, s, weight) > maxW) s -= 0.5;
      return s;
    }

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
      if (title) rich(title, r.x + 14, r.y + 19, fitSize(title, sub ? r.w * 0.62 : r.w - 28, baseSize() + 0.5, 800), th().text, 'left', 800);
      if (sub) rich(sub, r.x + r.w - 14, r.y + 19, fitSize(sub, r.w * 0.34, baseSize() - 1.5, 600), th().muted, 'right', 600);
    }

    function pill(x: number, y: number, src: string, color: string, opts: { align?: 'left' | 'center' | 'right'; size?: number; fill?: boolean; clampTo?: Rect; alpha?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? baseSize() - 0.5;
      const w = measure(src, size, 750) + 18;
      const h = size + 12;
      let x0 = opts.align === 'left' ? x : opts.align === 'right' ? x - w : x - w / 2;
      if (opts.clampTo) x0 = clamp(x0, opts.clampTo.x + 6, opts.clampTo.x + opts.clampTo.w - 6 - w);
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
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

    /* ---------- Zahlen ---------- */
    const isProb = (m: Mode = mode()) => m === 'tree' || m === 'mosaic';
    /** Anzahl (Zählmodus) als Text je nach Darstellung. */
    function valCount(k: number, n: number): string {
      if (p.num === 'abs') return fmt.num(Math.round(k), 0);
      if (n <= 0) return '–';
      if (p.num === 'pct') return `${fmt.fixed((k / n) * 100, 1)} %`;
      const r = reduce(Math.round(k), n);
      return r.d === 1 ? String(r.n) : `\\f{${r.n}}{${r.d}}`;
    }
    /** Wahrscheinlichkeit (Wahrscheinlichkeitsmodus) als Text. */
    function valProb(v: number, forceProb = false): string {
      if (p.num === 'abs' && !forceProb) {
        const k = v * p.nn;
        return fmt.num(Math.round(k * 10) / 10, Math.abs(k - Math.round(k)) < 0.05 ? 0 : 1);
      }
      if (p.num === 'pct') return `${fmt.fixed(v * 100, 1)} %`;
      if (p.num === 'frac' && !forceProb) {
        const r = reduce(Math.round(v * 10000), 10000);
        return r.d === 1 ? String(r.n) : `\\f{${r.n}}{${r.d}}`;
      }
      return fmt.num(Math.round(v * 10000) / 10000, 4);
    }
    const dec = (v: number) => fmt.num(Math.round(v * 10000) / 10000, 4);

    /* ---------- Vierfeldertafel ---------- */
    interface TableGeo {
      x0: number;
      y0: number;
      cw: number;
      rh: number;
      hw: number;
      cell: (i: number) => Rect;
    }
    function tableGeo(R: Rect): TableGeo {
      const small = R.w < 360;
      const hw = clamp(R.w * 0.24, 44, 130);
      const cw = (R.w - 28 - hw) / 3;
      const top = R.y + (p.ctx !== 'abc' && !isProb() ? 58 : 48);
      const rh = clamp((R.y + R.h - 12 - top) / 3.2, 22, small ? 46 : 64);
      const y0 = top + Math.max(0, (R.y + R.h - 12 - top - rh * 3.2) / 2) + rh * 0.2;
      const x0 = R.x + 14;
      const cell = (i: number): Rect => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        return { x: x0 + hw + c * cw + 2, y: y0 + r * rh + 2, w: cw - 4, h: rh - 4 };
      };
      return { x0, y0, cw, rh, hw, cell };
    }

    interface TableOpts {
      values: string[];
      hidden?: (i: number) => boolean;
      /** zusätzliche Hervorhebung (z. B. Quelle beim Ergänzen). */
      extra?: (i: number) => { color: string; a: number } | null;
      pop?: (i: number) => number;
      alpha?: number;
    }
    function drawTable(R: Rect, title: string, opts: TableOpts): TableGeo {
      const g = surface.g;
      const c = C();
      cardFrame(R, title, isProb() ? undefined : T(cx().title));
      const tg = tableGeo(R);
      const small = R.w < 360;
      if (p.ctx !== 'abc' && !isProb()) rich(`A: ${T(cx().A)} · B: ${T(cx().B)}`, R.x + 14, R.y + 38, small ? 10.5 : 11.5, th().muted, 'left', 600);
      const colX = (j: number) => tg.x0 + tg.hw + j * tg.cw;
      const rowY = (i: number) => tg.y0 + i * tg.rh;
      const hs = small ? 12 : 13;
      ['B', 'B̄', 'Σ'].forEach((h, j) => rich(h, colX(j) + tg.cw / 2, tg.y0 - tg.rh * 0.2 - 4, hs, j < 2 ? c.B : th().muted, 'center', 800));
      const rowsL = [T(cx().A), `${tt('nicht', 'not')} ${T(cx().A)}`];
      ['A', 'Ā', 'Σ'].forEach((h, i) => {
        rich(h, tg.x0 + 4, rowY(i) + tg.rh / 2, hs, i < 2 ? c.A : th().muted, 'left', 800);
        if (tg.hw >= 96 && i < 2 && p.ctx !== 'abc') rich(rowsL[i]!, tg.x0 + 22, rowY(i) + tg.rh / 2, fitSize(rowsL[i]!, tg.hw - 26, 11, 600), th().muted, 'left', 600);
      });
      for (let i = 0; i < 9; i++) {
        const r = tg.cell(i);
        const inner = Math.floor(i / 3) < 2 && i % 3 < 2;
        const h = hlS[i]!;
        const pop = opts.pop ? opts.pop(i) : 1;
        g.save();
        g.fillStyle = mixColor(inner ? mixColor(th().text, th().bg, th().dark ? 0.93 : 0.96) : mixColor(th().text, th().bg, th().dark ? 0.96 : 0.98), c.ev, h * (th().dark ? 0.4 : 0.22));
        roundRect(g, r.x, r.y, r.w, r.h, 8);
        g.fill();
        const ex = opts.extra?.(i);
        if (ex && ex.a > 0.01) {
          g.globalAlpha *= ex.a;
          g.strokeStyle = ex.color;
          g.lineWidth = 2.4;
          roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 8);
          g.stroke();
          g.globalAlpha = 1;
        } else if (hover === i) {
          g.strokeStyle = th().text;
          g.lineWidth = 1.8;
          roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 8);
          g.stroke();
        } else if (h > 0.02) {
          g.strokeStyle = mixColor(c.ev, th().bg, 1 - h * 0.75);
          g.lineWidth = 1.3;
          roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 8);
          g.stroke();
        }
        g.restore();
        const hid = opts.hidden?.(i) ?? false;
        const src = hid ? '?' : opts.values[i]!;
        const size = Math.min(small ? 13 : 15, tg.rh * 0.38);
        const fs = fitSize(src, r.w - 8, inner ? size : size - 1, 800, 9);
        g.save();
        if (pop < 1) {
          g.translate(r.x + r.w / 2, r.y + r.h / 2);
          const s = 0.6 + 0.4 * ease.outBack(pop);
          g.scale(s, s);
          g.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
        }
        rich(src, r.x + r.w / 2, r.y + r.h / 2 + 0.5, fs, hid ? th().muted : inner ? th().text : mixColor(th().text, th().muted, 0.4), 'center', inner ? 800 : 700);
        g.restore();
      }
      // Trennlinien vor den Summen
      g.strokeStyle = mixColor(th().text, th().bg, 0.75);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(colX(2), tg.y0);
      g.lineTo(colX(2), tg.y0 + tg.rh * 3);
      g.moveTo(colX(0), rowY(2));
      g.lineTo(colX(3), rowY(2));
      g.stroke();
      return tg;
    }
    function tableIndexAt(R: Rect, px: number, py: number): number | null {
      const tg = tableGeo(R);
      for (let i = 0; i < 9; i++) {
        const r = tg.cell(i);
        if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
      }
      return null;
    }

    /* ---------- Mengendiagramm ---------- */
    interface VennGeo {
      box: Rect;
      ax: number;
      bx: number;
      y: number;
      rA: number;
      rB: number;
    }
    function vennGeo(R: Rect): VennGeo {
      const box = { x: R.x + 14, y: R.y + 32, w: R.w - 28, h: R.h - 44 };
      const c: Cells = [cS[0]!, cS[1]!, cS[2]!, cS[3]!];
      const area = box.w * box.h * 0.6;
      const vg = vennGeometry(c, area);
      const span = vg.rA + vg.d + vg.rB;
      const k = Math.min(1, (box.w - 24) / Math.max(1, span), (box.h - 16) / Math.max(1, 2 * Math.max(vg.rA, vg.rB)));
      const rA = vg.rA * k;
      const rB = vg.rB * k;
      const d = vg.d * k;
      const left = box.x + box.w / 2 - (rA + d + rB) / 2;
      const ax = left + rA;
      return { box, ax, bx: ax + d, y: box.y + box.h / 2, rA, rB };
    }
    function drawVenn(R: Rect, grow: number): void {
      const g = surface.g;
      const c = C();
      cardFrame(R, tt('Mengendiagramm', 'Venn diagram'), tt('Flächen ∝ Anzahlen', 'areas ∝ counts'));
      const v = vennGeo(R);
      const { box } = v;
      g.save();
      g.fillStyle = mixColor(th().text, th().bg, th().dark ? 0.95 : 0.975);
      roundRect(g, box.x, box.y, box.w, box.h, 10);
      g.fill();
      g.strokeStyle = mixColor(th().text, th().bg, 0.7);
      g.lineWidth = 1.2;
      g.stroke();
      g.restore();
      rich('Ω', box.x + 12, box.y + 12, 13, th().muted, 'left', 700);
      const rA = v.rA * grow;
      const rB = v.rB * grow;
      const fillCell = (ci: number, color: string) => {
        g.save();
        g.beginPath();
        g.rect(box.x, box.y, box.w, box.h);
        g.clip();
        const inA = ci === 0 || ci === 1;
        const inB = ci === 0 || ci === 2;
        g.beginPath();
        if (inA) g.arc(v.ax, v.y, Math.max(0.1, rA), 0, TAU);
        else {
          g.rect(box.x, box.y, box.w, box.h);
          g.arc(v.ax, v.y, Math.max(0.1, rA), 0, TAU, true);
        }
        g.clip('evenodd');
        g.beginPath();
        if (inB) g.arc(v.bx, v.y, Math.max(0.1, rB), 0, TAU);
        else {
          g.rect(box.x, box.y, box.w, box.h);
          g.arc(v.bx, v.y, Math.max(0.1, rB), 0, TAU, true);
        }
        g.clip('evenodd');
        g.fillStyle = color;
        g.fillRect(box.x, box.y, box.w, box.h);
        g.restore();
      };
      g.save();
      g.beginPath();
      g.arc(v.ax, v.y, Math.max(0.1, rA), 0, TAU);
      g.fillStyle = mixColor(c.A, th().bg, 0, th().dark ? 0.2 : 0.13);
      g.fill();
      g.beginPath();
      g.arc(v.bx, v.y, Math.max(0.1, rB), 0, TAU);
      g.fillStyle = mixColor(c.B, th().bg, 0, th().dark ? 0.2 : 0.13);
      g.fill();
      g.restore();
      const innerIdx = [0, 1, 3, 4];
      for (let ci = 0; ci < 4; ci++) {
        const h = hlS[innerIdx[ci]!]!;
        if (h > 0.01) fillCell(ci, mixColor(c.ev, th().bg, 0, (th().dark ? 0.45 : 0.32) * h));
        if (hover === innerIdx[ci]) fillCell(ci, mixColor(th().text, th().bg, 0, th().dark ? 0.18 : 0.12));
      }
      g.save();
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(v.ax, v.y, Math.max(0.1, rA), 0, TAU);
      g.strokeStyle = c.A;
      g.stroke();
      g.beginPath();
      g.arc(v.bx, v.y, Math.max(0.1, rB), 0, TAU);
      g.strokeStyle = c.B;
      g.stroke();
      g.restore();
      if (grow < 0.8) return;
      const N = table(cells()).N;
      if (N === 0) {
        rich(tt('Noch keine Daten – stelle die Anzahlen ein.', 'No data yet – set the counts.'), box.x + box.w / 2, box.y + box.h / 2, 12, th().muted, 'center', 600);
        return;
      }
      const size = R.w < 360 ? 11.5 : 12.5;
      const la = Math.max(box.x + 8 + measure(T(cx().A), 12, 800), v.ax - rA * 0.7);
      const lb = Math.min(box.x + box.w - 8 - measure(T(cx().B), 12, 800), v.bx + rB * 0.7);
      if (rA > 2) rich(T(cx().A), la, Math.max(box.y + 12, v.y - rA * 0.85 - 2), 12, c.A, 'right', 800);
      if (rB > 2) rich(T(cx().B), lb, Math.max(box.y + 12, v.y - rB * 0.85 - 2), 12, c.B, 'left', 800);
      const hidden = !p.show;
      const c4 = cells();
      const left = Math.min(v.ax - rA * 0.45, (v.ax - rA + Math.min(v.bx - rB, v.ax + rA)) / 2);
      const right = Math.max(v.bx + rB * 0.45, (Math.max(v.ax + rA, v.bx - rB) + v.bx + rB) / 2);
      const midX = (Math.max(v.ax - rA, v.bx - rB) + Math.min(v.ax + rA, v.bx + rB)) / 2;
      const lab = (k: number) => (hidden ? '?' : valCount(k, N));
      if (c4[1] > 0) rich(lab(c4[1]), left, v.y, size, th().text, 'center', 800);
      if (c4[2] > 0) rich(lab(c4[2]), right, v.y, size, th().text, 'center', 800);
      if (c4[0] > 0) rich(lab(c4[0]), midX, v.y, size, th().text, 'center', 800);
      rich(lab(c4[3]), box.x + box.w - 14, box.y + box.h - 14, size, th().text, 'right', 800);
    }
    function vennIndexAt(R: Rect, px: number, py: number): number | null {
      const v = vennGeo(R);
      const b = v.box;
      if (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h) return null;
      const inA = Math.hypot(px - v.ax, py - v.y) <= v.rA;
      const inB = Math.hypot(px - v.bx, py - v.y) <= v.rB;
      return inA ? (inB ? 0 : 1) : inB ? 3 : 4;
    }

    /* ---------- Baumdiagramm ---------- */
    interface TreeSpec {
      first: [string, string];
      firstCol: string;
      second: [string, string];
      secondCol: string;
      firstLab: [string, string];
      secondLab: [[string, string], [string, string]];
      firstW: [number, number];
      secondW: [[number, number], [number, number]];
      leafNames: string[];
      leafVals: string[];
      /** Tafelindex je Blatt. */
      leafIdx: number[];
      /** Erster Ast als berechnet markieren (umgekehrter Baum). */
      derived?: boolean;
    }
    interface TreeGeo {
      root: { x: number; y: number };
      mid: { x: number; y: number }[];
      leaf: { x: number; y: number }[];
      infoX: number;
    }
    function treeGeo(R: Rect): TreeGeo {
      const top = R.y + 40;
      const bot = R.y + R.h - 10;
      const rowH = (bot - top) / 4;
      const leafY = [0, 1, 2, 3].map((i) => top + (i + 0.5) * rowH);
      const x0 = R.x + 22;
      const infoW = clamp(R.w * 0.3, 74, 150);
      const x2 = R.x + R.w - infoW - 8;
      const x1 = (x0 + x2) / 2;
      return { root: { x: x0, y: (leafY[1]! + leafY[2]!) / 2 }, mid: [{ x: x1, y: (leafY[0]! + leafY[1]!) / 2 }, { x: x1, y: (leafY[2]! + leafY[3]!) / 2 }], leaf: leafY.map((y) => ({ x: x2, y })), infoX: x2 + 14 };
    }
    function drawTree(R: Rect, title: string, spec: TreeSpec, grow: number, alpha = 1, sub?: string): TreeGeo {
      const g = surface.g;
      const c = C();
      g.save();
      g.globalAlpha *= alpha;
      cardFrame(R, title, sub);
      const tg = treeGeo(R);
      const small = R.w < 360;
      const lsize = small ? 10.5 : 11.5;
      const edge = (a: { x: number; y: number }, b: { x: number; y: number }, col: string, hl: number, hov: boolean, label: string, w: number, derived: boolean) => {
        const mx = a.x + (b.x - a.x) * 0.4;
        const bx = a.x + (b.x - a.x) * grow;
        const by = a.y + (b.y - a.y) * grow;
        g.save();
        g.lineCap = 'round';
        if (hl > 0.02 || hov) {
          g.strokeStyle = mixColor(hov ? th().text : c.ev, th().bg, 0, (th().dark ? 0.32 : 0.2) * Math.max(hl, hov ? 1 : 0));
          g.lineWidth = 10;
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.bezierCurveTo(mx, a.y, mx, by, bx, by);
          g.stroke();
        }
        g.strokeStyle = mixColor(col, th().bg, 0.15);
        g.lineWidth = 1.5 + 3.5 * clamp01(w);
        if (derived) g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.bezierCurveTo(mx, a.y, mx, by, bx, by);
        g.stroke();
        g.restore();
        if (grow > 0.9) {
          const lx = a.x + (b.x - a.x) * 0.55;
          const ly = a.y + (b.y - a.y) * 0.6;
          const fs = fitSize(label, (b.x - a.x) * 0.9, lsize, 750, 8.5);
          const lw = measure(label, fs, 750) + 10;
          const lh = label.includes('\\f') ? fs * 2.3 + 4 : fs + 8;
          g.save();
          g.fillStyle = pillBg();
          roundRect(g, lx - lw / 2, ly - lh / 2, lw, lh, Math.min(9, lh / 2));
          g.fill();
          g.strokeStyle = mixColor(col, th().bg, 0.5);
          g.lineWidth = 1;
          if (derived) g.setLineDash([3, 2]);
          g.stroke();
          g.restore();
          rich(label, lx, ly + 0.5, fs, mixColor(col, th().text, 0.3), 'center', 750);
        }
      };
      for (let i = 0; i < 2; i++) {
        const kids = [spec.leafIdx[i * 2]!, spec.leafIdx[i * 2 + 1]!];
        const hl = Math.max(hlS[kids[0]!]!, hlS[kids[1]!]!);
        const hov = kids.includes(hover ?? -1);
        edge(tg.root, tg.mid[i]!, spec.firstCol, hl, hov, spec.firstLab[i]!, spec.firstW[i]!, !!spec.derived);
        for (let j = 0; j < 2; j++) {
          const li = i * 2 + j;
          const idx = spec.leafIdx[li]!;
          edge(tg.mid[i]!, tg.leaf[li]!, spec.secondCol, hlS[idx]!, hover === idx, spec.secondLab[i]![j]!, spec.secondW[i]![j]!, !!spec.derived);
        }
      }
      const node = (pt: { x: number; y: number }, name: string, col: string) => {
        g.beginPath();
        g.arc(pt.x, pt.y, small ? 10 : 11.5, 0, TAU);
        g.fillStyle = col;
        g.fill();
        rich(name, pt.x, pt.y + 0.5, small ? 10.5 : 11.5, '#ffffff', 'center', 800);
      };
      g.fillStyle = th().text;
      g.beginPath();
      g.arc(tg.root.x, tg.root.y, 4, 0, TAU);
      g.fill();
      if (grow > 0.9) {
        tg.mid.forEach((m, i) => node(m, spec.first[i]!, spec.firstCol));
        tg.leaf.forEach((lf, k) => node(lf, spec.second[k % 2]!, spec.secondCol));
        tg.leaf.forEach((lf, k) => {
          const idx = spec.leafIdx[k]!;
          const x = tg.infoX;
          const w = R.x + R.w - 10 - x;
          const h = hlS[idx]!;
          if (h > 0.02 || hover === idx) {
            g.save();
            g.fillStyle = hover === idx ? mixColor(th().text, th().bg, 0, th().dark ? 0.12 : 0.07) : mixColor(c.ev, th().bg, 0, (th().dark ? 0.24 : 0.13) * h);
            roundRect(g, x - 4, lf.y - 14, w, 28, 8);
            g.fill();
            g.restore();
          }
          const nm = spec.leafNames[k]!;
          const vv = spec.leafVals[k]!;
          const vw = measure(vv, 12.5, 800);
          rich(nm, x + 2, lf.y, fitSize(nm, w - vw - 14, 11, 700, 8.5), th().muted, 'left', 700);
          rich(vv, x + w - 6, lf.y, fitSize(vv, w * 0.6, 12.5, 800, 9), h > 0.5 ? c.ev : th().text, 'right', 800);
        });
      }
      g.restore();
      return tg;
    }
    function treeLeafAt(R: Rect, px: number, py: number, leafIdx: number[]): number | null {
      if (px < R.x || px > R.x + R.w || py < R.y || py > R.y + R.h) return null;
      const tg = treeGeo(R);
      if (px < tg.mid[0]!.x - 10) {
        // erster Ast: ganze Hälfte
        return null;
      }
      let best: number | null = null;
      let bd = 20;
      tg.leaf.forEach((lf, k) => {
        const d = Math.abs(py - lf.y);
        if (d < bd) {
          bd = d;
          best = leafIdx[k]!;
        }
      });
      return best;
    }
    /** Erster Ast antippen: welcher Knoten (0 oder 1)? */
    function treeFirstAt(R: Rect, px: number, py: number): number | null {
      if (px < R.x || px > R.x + R.w || py < R.y || py > R.y + R.h) return null;
      const tg = treeGeo(R);
      if (px >= tg.mid[0]!.x + 16) return null;
      return py < tg.root.y ? 0 : 1;
    }

    /** Baum aus Zähldaten (Ansicht „Alles synchron“). */
    function countTreeSpec(o: 'AB' | 'BA'): TreeSpec {
      const c = C();
      const cc: Cells = [cS[0]!, cS[1]!, cS[2]!, cS[3]!];
      const br = treeBranches(cells(), o);
      const brS = treeBranches(cc, o);
      const hidden = !p.show;
      const lab = (k: number, n: number) => {
        if (n <= 0) return '–';
        if (p.num === 'pct') return `${fmt.fixed((k / n) * 100, 1)} %`;
        return `\\f{${k}}{${n}}`;
      };
      const w = (k: number, n: number) => (n > 0 ? k / n : 0);
      const leafIdx = o === 'AB' ? [0, 1, 3, 4] : [0, 3, 1, 4];
      const N = table(cells()).N;
      return {
        first: o === 'AB' ? ['A', 'Ā'] : ['B', 'B̄'],
        firstCol: o === 'AB' ? c.A : c.B,
        second: o === 'AB' ? ['B', 'B̄'] : ['A', 'Ā'],
        secondCol: o === 'AB' ? c.B : c.A,
        firstLab: [lab(br.first[0].k, br.first[0].n), lab(br.first[1].k, br.first[1].n)],
        secondLab: [
          [hidden ? '?' : lab(br.second[0][0].k, br.second[0][0].n), hidden ? '?' : lab(br.second[0][1].k, br.second[0][1].n)],
          [hidden ? '?' : lab(br.second[1][0].k, br.second[1][0].n), hidden ? '?' : lab(br.second[1][1].k, br.second[1][1].n)],
        ],
        firstW: [w(brS.first[0].k, brS.first[0].n), w(brS.first[1].k, brS.first[1].n)],
        secondW: [
          [w(brS.second[0][0].k, brS.second[0][0].n), w(brS.second[0][1].k, brS.second[0][1].n)],
          [w(brS.second[1][0].k, brS.second[1][0].n), w(brS.second[1][1].k, brS.second[1][1].n)],
        ],
        leafNames: o === 'AB' ? ['A ∩ B', 'A ∩ B̄', 'Ā ∩ B', 'Ā ∩ B̄'] : ['B ∩ A', 'B ∩ Ā', 'B̄ ∩ A', 'B̄ ∩ Ā'],
        leafVals: leafIdx.map((ti) => {
          const k = ti === 0 ? p.c1 : ti === 1 ? p.c2 : ti === 3 ? p.c3 : p.c4;
          return hidden ? '?' : valCount(k, N);
        }),
        leafIdx,
      };
    }

    /** Bäume aus Wahrscheinlichkeiten (Ansicht „Baum umkehren“). */
    function probTreeSpec(reversed: boolean): TreeSpec {
      const c = C();
      const cellsP = cellsFromTree(p.pa, p.pb1, p.pb2);
      const r = reverseTree(p.pa, p.pb1, p.pb2);
      const rS = reverseTree(paS, pb1S, pb2S);
      const pv = (v: number) => (p.num === 'pct' ? `${fmt.fixed(v * 100, 1)} %` : dec(v));
      if (!reversed) {
        return {
          first: ['A', 'Ā'],
          firstCol: c.A,
          second: ['B', 'B̄'],
          secondCol: c.B,
          firstLab: [pv(p.pa), pv(1 - p.pa)],
          secondLab: [
            [pv(p.pb1), pv(1 - p.pb1)],
            [pv(p.pb2), pv(1 - p.pb2)],
          ],
          firstW: [paS, 1 - paS],
          secondW: [
            [pb1S, 1 - pb1S],
            [pb2S, 1 - pb2S],
          ],
          leafNames: ['A ∩ B', 'A ∩ B̄', 'Ā ∩ B', 'Ā ∩ B̄'],
          leafVals: [0, 1, 2, 3].map((k) => valProb(cellsP[k]!)),
          leafIdx: [0, 1, 3, 4],
        };
      }
      return {
        first: ['B', 'B̄'],
        firstCol: c.B,
        second: ['A', 'Ā'],
        secondCol: c.A,
        firstLab: [pv(r.pB), pv(1 - r.pB)],
        secondLab: [
          [pv(r.pAgB), pv(1 - r.pAgB)],
          [pv(r.pAgNB), pv(1 - r.pAgNB)],
        ],
        firstW: [rS.pB, 1 - rS.pB],
        secondW: [
          [rS.pAgB, 1 - rS.pAgB],
          [rS.pAgNB, 1 - rS.pAgNB],
        ],
        leafNames: ['B ∩ A', 'B ∩ Ā', 'B̄ ∩ A', 'B̄ ∩ Ā'],
        leafVals: [0, 2, 1, 3].map((k) => valProb(cellsP[k]!)),
        leafIdx: [0, 3, 1, 4],
        derived: true,
      };
    }

    /* ---------- Hervorhebung ---------- */
    /** Ziel der Hervorhebung je Tafelwert. */
    function hlTarget(): number[] {
      const out = Array.from({ length: 9 }, () => 0);
      const m = mode();
      if (m === 'sync') {
        const mask = eventCells(ev());
        [0, 1, 3, 4].forEach((ti, k) => (out[ti] = mask[k] ? 1 : 0));
        const e = ev();
        if (e === 'A') out[2] = 1;
        if (e === 'nA') out[5] = 1;
        if (e === 'B') out[6] = 1;
        if (e === 'nB') out[7] = 1;
      } else if ((m === 'tree' || m === 'mosaic') && sel !== null) out[sel] = 1;
      return out;
    }

    /* ---------- Ansicht 1: alles synchron ---------- */
    function drawSync(alpha: number, now: number, k: { grow: number }): void {
      const g = surface.g;
      const lay = layout('sync');
      g.save();
      g.globalAlpha *= alpha;
      const N = table(cells()).N;
      const vals = tableValues([cS[0]!, cS[1]!, cS[2]!, cS[3]!]).map((v, i) => {
        const real = tableValues(cells())[i]!;
        return p.num === 'abs' ? fmt.num(Math.round(v), 0) : valCount(real, N);
      });
      drawTable(lay.table!, tt('Vierfeldertafel', 'Two-way table'), { values: vals, hidden: (i) => !p.show && Math.floor(i / 3) < 2 && i % 3 < 2 });
      drawVenn(lay.venn!, k.grow);
      // Baum: beim Umdrehen gleitet der alte aus, der neue ein
      const u = order.at(now);
      const R = lay.tree!;
      g.save();
      g.beginPath();
      g.rect(R.x, R.y, R.w, R.h);
      g.clip();
      if (u > 0.001 && u < 0.999) {
        drawTree({ ...R, y: R.y - u * 18 }, tt('Baumdiagramm: erst A', 'Tree: A first'), countTreeSpec('AB'), k.grow, 1 - u);
        drawTree({ ...R, y: R.y + (1 - u) * 18 }, tt('Baumdiagramm: erst B', 'Tree: B first'), countTreeSpec('BA'), k.grow, u);
      } else drawTree(R, u < 0.5 ? tt('Baumdiagramm: erst A', 'Tree: A first') : tt('Baumdiagramm: erst B', 'Tree: B first'), countTreeSpec(u < 0.5 ? 'AB' : 'BA'), k.grow, 1, tt('Ast antippen', 'tap a branch'));
      g.restore();
      drawSyncInfo(lay.info!, now);
      g.restore();
    }
    function drawSyncInfo(R: Rect, now: number): void {
      const c = C();
      cardFrame(R);
      const e = ev();
      const cc = cells();
      const t = table(cc);
      const rows: { src: string; col: string }[] = [];
      const show = p.show;
      const v = (k: number) => valCount(k, t.N);
      if (e === 'none') rows.push({ src: tt('Feld, Randsumme oder Kreisteil antippen …', 'Tap a cell, a total or part of a circle …'), col: th().muted });
      else {
        const sym = evSym(e);
        if (!show && !['A', 'B', 'nA', 'nB'].includes(e)) rows.push({ src: `P(${sym}) = ?`, col: c.ev });
        else if (e === 'AuB') {
          rows.push({ src: `P(A ∪ B) = P(A) + P(B) − P(A ∩ B)`, col: th().text });
          rows.push({ src: `= ${v(t.A)} + ${v(t.B)} − ${v(cc[0])} = ${v(t.A + t.B - cc[0])}${p.num === 'abs' ? ` ${tt('von', 'of')} ${t.N}` : ''}`, col: c.ev });
        } else if (e === 'nA' || e === 'nB') {
          const base = e === 'nA' ? t.A : t.B;
          const s = e === 'nA' ? 'A' : 'B';
          rows.push({ src: `P(${sym}) = 1 − P(${s})`, col: th().text });
          rows.push({ src: p.num === 'abs' ? `= ${t.N} − ${base} = ${t.N - base} ${tt('von', 'of')} ${t.N}` : `= 1 − ${v(base)} = ${v(t.N - base)}`, col: c.ev });
        } else {
          const k = eventCount(cc, e);
          rows.push({ src: `P(${sym}) = \\f{${k}}{${t.N}}${t.N ? ` ≈ ${fmt.fixed((k / t.N) * 100, 1)} %` : ''}`, col: c.ev });
        }
        const cond = t.A > 0 && t.B > 0 ? `P_{A}(B) = \\f{${cc[0]}}{${t.A}}  ·  P_{B}(A) = \\f{${cc[0]}}{${t.B}}` : '';
        if (cond && show) rows.push({ src: cond, col: th().muted });
      }
      if (independent(cc) && t.N > 0 && show) rows.push({ src: tt('A und B sind unabhängig: P(A ∩ B) = P(A) · P(B)', 'A and B are independent: P(A ∩ B) = P(A) · P(B)'), col: c.ok });
      drawRows(R, rows, now);
    }
    function drawRows(R: Rect, rows: { src: string; col: string }[], now: number): void {
      const g = surface.g;
      const pad = 14;
      const fade = reduced() ? 1 : clamp01((now - cardT0) / 450);
      const lh = clamp((R.h - 2 * pad) / Math.max(1, rows.length), 18, 40);
      let y = R.y + pad + lh / 2;
      rows.forEach((row, i) => {
        const a = clamp01(fade * (rows.length + 1) - i);
        const s = fitSize(row.src, R.w - 2 * pad, Math.min(baseSize() + 0.5, lh * 0.48), 650, 9);
        g.save();
        g.globalAlpha *= 0.15 + 0.85 * ease.outCubic(a);
        rich(row.src, R.x + pad + (1 - ease.outCubic(a)) * 8, y, s, row.col, 'left', 650);
        g.restore();
        y += lh;
      });
    }

    /* ---------- Ansicht 2: Tafel ergänzen ---------- */
    function drawFill(alpha: number, now: number): void {
      const g = surface.g;
      const c = C();
      const lay = layout('fill');
      g.save();
      g.globalAlpha *= alpha;
      const vals = tableValues(cells()).map((v) => valCount(v, table(cells()).N));
      const ls = lastStep && now - lastStep.t0 < 2400 ? lastStep : null;
      const msgOn = msg && now - msg.t0 < 2200 ? msg : null;
      drawTable(lay.table!, tt('Tafel ergänzen', 'Complete the table'), {
        values: vals,
        hidden: (i) => !known[i],
        pop: (i) => (reduced() ? 1 : clamp01((now - revealT[i]!) / 420)),
        extra: (i) => {
          if (ls && (ls.st.from[0] === i || ls.st.from[1] === i)) return { color: c.sel, a: 1 - clamp01((now - ls.t0 - 1600) / 800) };
          if (ls && ls.st.target === i) return { color: c.ok, a: 1 - clamp01((now - ls.t0 - 1600) / 800) };
          if (msgOn && msgOn.idx === i) return { color: c.warn, a: 1 - clamp01((now - msgOn.t0 - 1400) / 800) };
          return null;
        },
      });
      // Pfeil von den Quellen zum Ziel
      const R = lay.table!;
      const tg = tableGeo(R);
      if (ls && !reduced()) {
        const u = clamp01((now - ls.t0) / 500);
        const a = 1 - clamp01((now - ls.t0 - 1600) / 800);
        const tr = tg.cell(ls.st.target);
        for (const f of ls.st.from) {
          const fr = tg.cell(f);
          const x0 = fr.x + fr.w / 2;
          const y0 = fr.y + fr.h / 2;
          const x1 = tr.x + tr.w / 2;
          const y1 = tr.y + tr.h / 2;
          g.save();
          g.globalAlpha *= a * 0.85;
          g.strokeStyle = c.sel;
          g.lineWidth = 2;
          g.setLineDash([5, 4]);
          g.beginPath();
          g.moveTo(x0, y0);
          const mx = (x0 + x1) / 2 + (y1 - y0) * 0.15;
          const my = (y0 + y1) / 2 - (x1 - x0) * 0.15;
          const ex = x0 + (x1 - x0) * u;
          const ey = y0 + (y1 - y0) * u;
          g.quadraticCurveTo(mx, my, ex, ey);
          g.stroke();
          g.restore();
        }
      }
      // Hinweis bei nicht erschließbarem Feld
      if (msgOn) {
        const r = tg.cell(msgOn.idx);
        const wob = reduced() ? 0 : Math.sin((now - msgOn.t0) / 40) * 4 * (1 - clamp01((now - msgOn.t0) / 400));
        pill(r.x + r.w / 2 + wob, r.y - 12, msgOn.text, c.warn, { clampTo: R, size: R.w < 360 ? 10.5 : 11.5, alpha: 1 - clamp01((now - msgOn.t0 - 1600) / 600) });
      }
      const done = known.every(Boolean);
      if (done) pill(R.x + R.w / 2, R.y + R.h - 20, tt('Tafel vollständig – alle Summen passen!', 'Table complete – all totals match!'), c.ok, { fill: true, size: R.w < 360 ? 11 : 12 });
      else rich(tt('Feld mit „?“ antippen', 'Tap a cell with “?”'), R.x + R.w / 2, R.y + R.h - 18, R.w < 360 ? 10.5 : 11.5, th().muted, 'center', 650);
      drawSteps(lay.steps!, now);
      g.restore();
    }
    function stepText(st: SolveStep): string {
      const v = tableValues(cells());
      const n = (i: number) => NAME_OF_INDEX[i]!;
      const nm = (i: number) => (i === 8 ? tt('gesamt', 'total') : `|${n(i)}|`);
      return `${nm(st.target)} = ${nm(st.from[0])} ${st.op} ${nm(st.from[1])} = ${v[st.from[0]]} ${st.op} ${v[st.from[1]]} = ${v[st.target]}`;
    }
    function drawSteps(R: Rect, now: number): void {
      const c = C();
      cardFrame(R, tt('Rechenweg', 'Working'), tt(`${steps.length} von ${9 - (GIVEN_SETS[p.given as 'g1'] ?? GIVEN_SETS.g1).length} Werten`, `${steps.length} of ${9 - (GIVEN_SETS[p.given as 'g1'] ?? GIVEN_SETS.g1).length} values`));
      const pad = 14;
      const rows: { src: string; col: string }[] = [];
      rows.push({ src: tt('Jede Zeile und jede Spalte ist eine Summe:', 'Every row and every column is a sum:'), col: th().muted });
      rows.push({ src: '|A ∩ B| + |A ∩ B̄| = |A|,   |A| + |Ā| = ' + tt('gesamt', 'total'), col: th().muted });
      steps.forEach((st, i) => rows.push({ src: `${i + 1}.  ${stepText(st)}`, col: i === steps.length - 1 && lastStep && now - lastStep.t0 < 2400 ? c.ok : th().text }));
      if (known.every(Boolean)) {
        const t = table(cells());
        rows.push({ src: tt(`Probe: ${t.A} + ${t.nA} = ${t.N} und ${t.B} + ${t.nB} = ${t.N} ✓`, `Check: ${t.A} + ${t.nA} = ${t.N} and ${t.B} + ${t.nB} = ${t.N} ✓`), col: c.ok });
      }
      const top = R.y + 40;
      const lh = clamp((R.y + R.h - pad - top) / Math.max(1, rows.length), 16, 30);
      let y = top + lh / 2;
      const g = surface.g;
      rows.forEach((row, i) => {
        const age = i >= 2 && i === steps.length + 1 && lastStep ? clamp01((now - lastStep.t0) / 400) : 1;
        const s = fitSize(row.src, R.w - 2 * pad, Math.min(baseSize(), lh * 0.6), 650, 9);
        g.save();
        g.globalAlpha *= reduced() ? 1 : ease.outCubic(age);
        rich(row.src, R.x + pad + (1 - ease.outCubic(age)) * 10, y, s, row.col, 'left', 650);
        g.restore();
        y += lh;
      });
    }
    function tryReveal(i: number, now: number): void {
      if (known[i]) return;
      const st = solveStep(known, i);
      if (!st) {
        // was fehlt? Eine Summe nennen, in der das Feld steckt
        msg = { text: tt('Dafür fehlen noch Werte in Zeile und Spalte', 'Values in its row and column are still missing'), t0: now, idx: i };
        return;
      }
      known[i] = true;
      revealT[i] = now;
      steps.push(st);
      lastStep = { st, t0: now };
      msg = null;
    }
    function revealNext(now: number): void {
      for (let i = 0; i < 9; i++) {
        if (known[i]) continue;
        if (solveStep(known, i)) {
          tryReveal(i, now);
          return;
        }
      }
    }

    /* ---------- Ansicht 3: Baum umkehren ---------- */
    function probTableValues(): string[] {
      const cp = cellsFromTree(p.pa, p.pb1, p.pb2);
      const r = reverseTree(p.pa, p.pb1, p.pb2);
      const v = [cp[0], cp[1], p.pa, cp[2], cp[3], 1 - p.pa, r.pB, 1 - r.pB, 1];
      return v.map((x) => valProb(x));
    }
    function drawTreeMode(alpha: number, now: number, k: { grow: number }): void {
      const g = surface.g;
      const lay = layout('tree');
      g.save();
      g.globalAlpha *= alpha;
      const sub = p.num === 'abs' ? tt(`von ${p.nn}`, `out of ${p.nn}`) : undefined;
      drawTree(lay.tree!, tt('Baum: erst A', 'Tree: A first'), probTreeSpec(false), k.grow, 1, tt('gegeben', 'given'));
      drawTable(lay.table!, sub ? tt(`Häufigkeiten ${sub}`, `frequencies ${sub}`) : tt('Vierfeldertafel', 'Two-way table'), { values: probTableValues() });
      const grow2 = reduced() ? 1 : clamp01((k.grow - 0.4) / 0.6);
      drawTree(lay.tree2!, tt('Umgekehrter Baum: erst B', 'Reversed tree: B first'), probTreeSpec(true), grow2, 1, tt('berechnet', 'computed'));
      drawTreeInfo(lay.info!, now);
      g.restore();
    }
    function drawTreeInfo(R: Rect, now: number): void {
      const c = C();
      cardFrame(R);
      const r = reverseTree(p.pa, p.pb1, p.pb2);
      const cp = cellsFromTree(p.pa, p.pb1, p.pb2);
      const d = (v: number) => dec(v);
      const rows: { src: string; col: string }[] = [];
      rows.push({ src: `P(B) = P(A) · P_{A}(B) + P(Ā) · P_{Ā}(B) = ${d(p.pa)} · ${d(p.pb1)} + ${d(1 - p.pa)} · ${d(p.pb2)} = ${d(r.pB)}`, col: c.B });
      const s = sel ?? 0;
      const names: Record<number, [string, string, number, number, string, string, number, number]> = {
        0: ['A ∩ B', 'P(A) · P_{A}(B)', p.pa, p.pb1, 'P(B) · P_{B}(A)', 'P_{B}(A)', r.pB, r.pAgB],
        1: ['A ∩ B̄', 'P(A) · P_{A}(B̄)', p.pa, 1 - p.pb1, 'P(B̄) · P_{B̄}(A)', 'P_{B̄}(A)', 1 - r.pB, r.pAgNB],
        3: ['Ā ∩ B', 'P(Ā) · P_{Ā}(B)', 1 - p.pa, p.pb2, 'P(B) · P_{B}(Ā)', 'P_{B}(Ā)', r.pB, 1 - r.pAgB],
        4: ['Ā ∩ B̄', 'P(Ā) · P_{Ā}(B̄)', 1 - p.pa, 1 - p.pb2, 'P(B̄) · P_{B̄}(Ā)', 'P_{B̄}(Ā)', 1 - r.pB, 1 - r.pAgNB],
      };
      const n = names[s] ?? names[0]!;
      const val = s === 0 ? cp[0] : s === 1 ? cp[1] : s === 3 ? cp[2] : cp[3];
      rows.push({ src: `P(${n[0]}) = ${n[1]} = ${d(n[2])} · ${d(n[3])} = ${d(val)}`, col: c.ev });
      rows.push({ src: `${n[5]} = \\f{P(${n[0]})}{${n[4].split(' · ')[0]}} = \\f{${d(val)}}{${d(n[6])}} = ${n[6] > 0 ? d(n[7]) : '–'}`, col: c.ev });
      if (independentTree(p.pb1, p.pb2)) rows.push({ src: tt(`P_{A}(B) = P_{Ā}(B) = ${d(p.pb1)}: A und B sind unabhängig`, `P_{A}(B) = P_{Ā}(B) = ${d(p.pb1)}: A and B are independent`), col: c.ok });
      drawRows(R, rows, now);
    }

    /* ---------- Ansicht 4: Einheitsquadrat ---------- */
    function squareGeo(R: Rect): Rect {
      const side = Math.max(60, Math.min(R.w - 78, R.h - 86));
      return { x: R.x + (R.w - side) / 2 + 12, y: R.y + 40 + (R.h - 86 - side) / 2, w: side, h: side };
    }
    function drawMosaic(alpha: number, now: number, k: { grow: number }): void {
      const g = surface.g;
      const c = C();
      const lay = layout('mosaic');
      const R = lay.square!;
      g.save();
      g.globalAlpha *= alpha;
      cardFrame(R, tt('Einheitsquadrat', 'Unit square'), tt('Linien ziehen', 'drag the lines'));
      const S = squareGeo(R);
      const xs = S.x + S.w * paS * k.grow;
      const y1 = S.y + S.h * (1 - pb1S);
      const y2 = S.y + S.h * (1 - pb2S);
      // Flächen: unten B, oben B̄
      const regions: { idx: number; r: Rect; col: string }[] = [
        { idx: 0, r: { x: S.x, y: y1, w: xs - S.x, h: S.y + S.h - y1 }, col: mixColor(c.A, c.B, 0.5) },
        { idx: 1, r: { x: S.x, y: S.y, w: xs - S.x, h: y1 - S.y }, col: c.A },
        { idx: 3, r: { x: xs, y: y2, w: S.x + S.w - xs, h: S.y + S.h - y2 }, col: c.B },
        { idx: 4, r: { x: xs, y: S.y, w: S.x + S.w - xs, h: y2 - S.y }, col: th().muted },
      ];
      for (const reg of regions) {
        const h = hlS[reg.idx]!;
        g.fillStyle = mixColor(mixColor(reg.col, th().bg, th().dark ? 0.7 : 0.78), c.ev, h * 0.35);
        g.fillRect(reg.r.x, reg.r.y, Math.max(0, reg.r.w), Math.max(0, reg.r.h));
        if (hover === reg.idx) {
          g.fillStyle = mixColor(th().text, th().bg, 0, th().dark ? 0.12 : 0.07);
          g.fillRect(reg.r.x, reg.r.y, Math.max(0, reg.r.w), Math.max(0, reg.r.h));
        }
      }
      // Stichprobe: Punkte fallen in die Flächen
      for (const s of samples) {
        const a = reduced() ? 1 : clamp01((now - s.t0) / 350);
        if (a <= 0) continue;
        const px = S.x + s.x * S.w;
        const py = S.y + s.y * S.h - (1 - ease.outCubic(a)) * 24;
        const inA = s.x < p.pa;
        const inB = 1 - s.y < (inA ? p.pb1 : p.pb2);
        const col = inA ? (inB ? mixColor(c.A, c.B, 0.5) : c.A) : inB ? c.B : th().muted;
        g.fillStyle = mixColor(col, th().text, 0.35);
        g.globalAlpha = alpha * clamp01(a * 2);
        g.beginPath();
        g.arc(px, py, Math.max(2.4, S.w / 100), 0, TAU);
        g.fill();
        g.strokeStyle = th().bg;
        g.lineWidth = 1;
        g.stroke();
        g.globalAlpha = alpha;
      }
      // Rahmen und Linien
      g.strokeStyle = th().axis;
      g.lineWidth = 1.5;
      g.strokeRect(S.x, S.y, S.w, S.h);
      const indep = independentTree(p.pb1, p.pb2, 0.005);
      const lineCol = (on: boolean) => (on ? th().text : mixColor(th().text, th().bg, 0.2));
      g.lineWidth = 2.5;
      g.strokeStyle = lineCol(drag === 'pa');
      g.beginPath();
      g.moveTo(xs, S.y);
      g.lineTo(xs, S.y + S.h);
      g.stroke();
      if (indep) {
        g.save();
        g.strokeStyle = c.ok;
        g.lineWidth = 3;
        g.shadowColor = mixColor(c.ok, th().bg, 0, 0.6);
        g.shadowBlur = 8;
        g.beginPath();
        g.moveTo(S.x, y1);
        g.lineTo(S.x + S.w, y2);
        g.stroke();
        g.restore();
      } else {
        g.strokeStyle = lineCol(drag === 'pb1');
        g.beginPath();
        g.moveTo(S.x, y1);
        g.lineTo(xs, y1);
        g.stroke();
        g.strokeStyle = lineCol(drag === 'pb2');
        g.beginPath();
        g.moveTo(xs, y2);
        g.lineTo(S.x + S.w, y2);
        g.stroke();
      }
      // Griffe
      const knob = (x: number, y: number, active: boolean) => {
        g.save();
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
        g.shadowBlur = active ? 10 : 5;
        g.fillStyle = th().bg;
        g.strokeStyle = th().text;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(x, y, active ? 8 : 6.5, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
      };
      if (!ctx.locked) {
        knob(xs, S.y + S.h + 10, drag === 'pa');
        knob((S.x + xs) / 2, y1, drag === 'pb1');
        knob((xs + S.x + S.w) / 2, y2, drag === 'pb2');
      }
      // Beschriftungen
      const fs = R.w < 360 ? 10.5 : 11.5;
      rich('A', (S.x + xs) / 2, S.y + S.h + 26, fs + 1, c.A, 'center', 800);
      rich('Ā', (xs + S.x + S.w) / 2, S.y + S.h + 26, fs + 1, c.A, 'center', 800);
      rich(`P(A) = ${dec(p.pa)}`, xs, S.y - 10, fs, th().text, xs < S.x + S.w * 0.3 ? 'left' : xs > S.x + S.w * 0.7 ? 'right' : 'center', 750);
      rich('B', S.x - 10, (y1 + S.y + S.h) / 2, fs + 1, c.B, 'right', 800);
      rich('B̄', S.x - 10, (S.y + y1) / 2, fs + 1, c.B, 'right', 800);
      rich('B', S.x + S.w + 10, (y2 + S.y + S.h) / 2, fs + 1, c.B, 'left', 800);
      rich('B̄', S.x + S.w + 10, (S.y + y2) / 2, fs + 1, c.B, 'left', 800);
      const cp = cellsFromTree(p.pa, p.pb1, p.pb2);
      for (const reg of regions) {
        if (reg.r.w < 44 || reg.r.h < 28) continue;
        const v = reg.idx === 0 ? cp[0] : reg.idx === 1 ? cp[1] : reg.idx === 3 ? cp[2] : cp[3];
        rich(NAME_OF_INDEX[reg.idx]!, reg.r.x + reg.r.w / 2, reg.r.y + reg.r.h / 2 - 8, fs - 0.5, th().muted, 'center', 700);
        rich(dec(v), reg.r.x + reg.r.w / 2, reg.r.y + reg.r.h / 2 + 8, fs + 1, th().text, 'center', 800);
      }
      if (indep) pill(S.x + S.w / 2, S.y + S.h * (1 - p.pb1) - 16, tt('Linien auf einer Höhe: unabhängig', 'Lines at one height: independent'), c.ok, { fill: true, size: fs, clampTo: R });
      // Tafel und Info
      drawTable(lay.table!, tt('Vierfeldertafel', 'Two-way table'), { values: probTableValues() });
      drawMosaicInfo(lay.info!, now);
      g.restore();
    }
    function drawMosaicInfo(R: Rect, now: number): void {
      const c = C();
      cardFrame(R);
      const r = reverseTree(p.pa, p.pb1, p.pb2);
      const cp = cellsFromTree(p.pa, p.pb1, p.pb2);
      const rows: { src: string; col: string }[] = [];
      rows.push({ src: tt(`Fläche = Wahrscheinlichkeit: P(A ∩ B) = ${dec(p.pa)} · ${dec(p.pb1)} = ${dec(cp[0])}`, `area = probability: P(A ∩ B) = ${dec(p.pa)} · ${dec(p.pb1)} = ${dec(cp[0])}`), col: th().text });
      rows.push({ src: `P(A) · P(B) = ${dec(p.pa)} · ${dec(r.pB)} = ${dec(p.pa * r.pB)}`, col: th().text });
      const indep = independentTree(p.pb1, p.pb2, 0.005);
      rows.push({ src: indep ? tt('gleich: A und B sind unabhängig', 'equal: A and B are independent') : tt(`ungleich (P_{A}(B) = ${dec(p.pb1)} ≠ P_{Ā}(B) = ${dec(p.pb2)}): abhängig`, `not equal (P_{A}(B) = ${dec(p.pb1)} ≠ P_{Ā}(B) = ${dec(p.pb2)}): dependent`), col: indep ? c.ok : c.warn });
      if (samples.length) {
        let ab = 0;
        let a = 0;
        let b = 0;
        for (const s of samples) {
          const inA = s.x < p.pa;
          const inB = 1 - s.y < (inA ? p.pb1 : p.pb2);
          if (inA) a++;
          if (inB) b++;
          if (inA && inB) ab++;
        }
        const n = samples.length;
        rows.push({ src: tt(`Stichprobe (${n}): |A ∩ B| = ${ab}, |A| = ${a}, |B| = ${b}`, `sample (${n}): |A ∩ B| = ${ab}, |A| = ${a}, |B| = ${b}`), col: c.sel });
        rows.push({ src: tt(`relative Häufigkeiten: ${fmt.fixed(ab / n, 2)} statt ${dec(cp[0])},  ${fmt.fixed(b / n, 2)} statt ${dec(r.pB)}`, `relative frequencies: ${fmt.fixed(ab / n, 2)} vs. ${dec(cp[0])},  ${fmt.fixed(b / n, 2)} vs. ${dec(r.pB)}`), col: c.sel });
      }
      drawRows(R, rows, now);
    }
    function mosaicHit(px: number, py: number): { drag?: 'pa' | 'pb1' | 'pb2'; idx?: number } | null {
      const R = layout('mosaic').square!;
      const S = squareGeo(R);
      const xs = S.x + S.w * p.pa;
      const y1 = S.y + S.h * (1 - p.pb1);
      const y2 = S.y + S.h * (1 - p.pb2);
      const tol = 12;
      if (py > S.y - 4 && py < S.y + S.h + 22 && Math.abs(px - xs) < tol) return { drag: 'pa' };
      if (px > S.x - 4 && px < xs && Math.abs(py - y1) < tol) return { drag: 'pb1' };
      if (px > xs && px < S.x + S.w + 4 && Math.abs(py - y2) < tol) return { drag: 'pb2' };
      if (px >= S.x && px <= S.x + S.w && py >= S.y && py <= S.y + S.h) {
        const inA = px < xs;
        const inB = py > (inA ? y1 : y2);
        return { idx: inA ? (inB ? 0 : 1) : inB ? 3 : 4 };
      }
      return null;
    }
    function dragMosaic(px: number, py: number): void {
      const R = layout('mosaic').square!;
      const S = squareGeo(R);
      const r2 = (v: number) => Math.round(clamp01(v) * 100) / 100;
      if (drag === 'pa') {
        const v = r2((px - S.x) / S.w);
        if (v !== p.pa) ctx.set({ pa: v });
      } else if (drag === 'pb1' || drag === 'pb2') {
        let v = r2(1 - (py - S.y) / S.h);
        // einrasten, wenn fast auf der Höhe der anderen Linie (Unabhängigkeit)
        const other = drag === 'pb1' ? p.pb2 : p.pb1;
        if (Math.abs(v - other) <= 0.02) v = other;
        if (v !== p[drag]) ctx.set({ [drag]: v } as Record<string, number>);
      }
    }

    /* ---------- Zeiger ---------- */
    type Hit = { kind: 'idx'; idx: number } | { kind: 'first'; node: number } | { kind: 'drag'; d: 'pa' | 'pb1' | 'pb2' };
    function hitAt(px: number, py: number): Hit | null {
      const m = mode();
      const lay = layout(m);
      if (m === 'sync') {
        const ti = tableIndexAt(lay.table!, px, py);
        if (ti !== null && ti !== 8) return { kind: 'idx', idx: ti };
        const vi = vennIndexAt(lay.venn!, px, py);
        if (vi !== null) return { kind: 'idx', idx: vi };
        const o = p.order === 'BA' ? 'BA' : 'AB';
        const li = treeLeafAt(lay.tree!, px, py, o === 'AB' ? [0, 1, 3, 4] : [0, 3, 1, 4]);
        if (li !== null) return { kind: 'idx', idx: li };
        const fi = treeFirstAt(lay.tree!, px, py);
        if (fi !== null) return { kind: 'first', node: fi };
        return null;
      }
      if (m === 'fill') {
        const ti = tableIndexAt(lay.table!, px, py);
        return ti !== null && !known[ti] ? { kind: 'idx', idx: ti } : null;
      }
      if (m === 'tree') {
        const a = treeLeafAt(lay.tree!, px, py, [0, 1, 3, 4]);
        if (a !== null) return { kind: 'idx', idx: a };
        const b = treeLeafAt(lay.tree2!, px, py, [0, 3, 1, 4]);
        if (b !== null) return { kind: 'idx', idx: b };
        const ti = tableIndexAt(lay.table!, px, py);
        if (ti !== null && [0, 1, 3, 4].includes(ti)) return { kind: 'idx', idx: ti };
        return null;
      }
      const mh = mosaicHit(px, py);
      if (mh?.drag && !ctx.locked) return { kind: 'drag', d: mh.drag };
      if (mh?.idx !== undefined) return { kind: 'idx', idx: mh.idx };
      const ti = tableIndexAt(lay.table!, px, py);
      if (ti !== null && [0, 1, 3, 4].includes(ti)) return { kind: 'idx', idx: ti };
      return null;
    }
    surface.addTarget({
      contains: (px, py) => hitAt(px, py) !== null,
      pointerDown: (pt) => {
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        const now = performance.now();
        const m = mode();
        if (h.kind === 'drag') {
          drag = h.d;
          surface.setCursor(h.d === 'pa' ? 'ew-resize' : 'ns-resize');
          ctx.requestRender();
          return true;
        }
        if (ctx.locked && m !== 'tree' && m !== 'mosaic') return false;
        if (m === 'sync') {
          if (h.kind === 'first') {
            const o = p.order === 'BA' ? 'BA' : 'AB';
            const e: EventId = o === 'AB' ? (h.node === 0 ? 'A' : 'nA') : h.node === 0 ? 'B' : 'nB';
            ctx.set({ ev: e });
          } else {
            const e = EV_OF_INDEX[h.idx];
            if (e) ctx.set({ ev: ev() === e ? 'none' : e });
          }
        } else if (m === 'fill' && h.kind === 'idx') {
          if (!ctx.locked) tryReveal(h.idx, now);
        } else if (h.kind === 'idx') {
          sel = h.idx;
          cardT0 = now;
        }
        updateReadouts();
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt) => {
        if (drag) dragMosaic(pt.px, pt.py);
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (pt) => {
        const h = pt ? hitAt(pt.px, pt.py) : null;
        let hv: number | null = null;
        let cur = '';
        if (h?.kind === 'idx') {
          hv = h.idx;
          cur = 'pointer';
        } else if (h?.kind === 'first') cur = 'pointer';
        else if (h?.kind === 'drag') cur = h.d === 'pa' ? 'ew-resize' : 'ns-resize';
        surface.setCursor(cur);
        if (hv !== hover) {
          hover = hv;
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------- Ergebnisse (Text) ---------- */
    function updateReadouts(): void {
      if (isProb()) {
        const r = reverseTree(p.pa, p.pb1, p.pb2);
        const cp = cellsFromTree(p.pa, p.pb1, p.pb2);
        ctx.readout('ev', `P(A ∩ B) = ${dec(p.pa)} · ${dec(p.pb1)} = ${dec(cp[0])}`);
        ctx.readout('add', `P(B) = ${dec(p.pa)} · ${dec(p.pb1)} + ${dec(1 - p.pa)} · ${dec(p.pb2)} = ${dec(r.pB)}`);
        ctx.readout('cond', `P_B(A) = ${dec(cp[0])} / ${dec(r.pB)} = ${r.pB > 0 ? dec(r.pAgB) : '–'}${independentTree(p.pb1, p.pb2) ? tt(' · A und B sind unabhängig', ' · A and B are independent') : ''}`);
        return;
      }
      const c = cells();
      const t = table(c);
      const e = ev();
      const nTxt = (k: number) => `${k}/${t.N} ≈ ${fmt.fixed(t.N ? (k / t.N) * 100 : 0, 1)} %`;
      ctx.readout('ev', e === 'none' ? null : `P(${evSym(e)}) = ${nTxt(eventCount(c, e))}`);
      ctx.readout('add', `P(A ∪ B) = ${t.A}/${t.N} + ${t.B}/${t.N} − ${c[0]}/${t.N} = ${nTxt(t.A + t.B - c[0])}`);
      const cond = t.A ? `P_A(B) = ${c[0]}/${t.A} ≈ ${fmt.fixed((c[0] / t.A) * 100, 1)} %` : 'P_A(B): –';
      const condB = t.B ? `P_B(A) = ${c[0]}/${t.B} ≈ ${fmt.fixed((c[0] / t.B) * 100, 1)} %` : 'P_B(A): –';
      ctx.readout('cond', `${cond} · ${condB}${independent(c) && t.N ? tt(' · A und B sind unabhängig', ' · A and B are independent') : ''}`);
    }
    function syncActions(): void {
      const done = known.every(Boolean);
      ctx.setAction('reveal', { enabled: !ctx.locked && !done });
      ctx.setAction('shuffle', { enabled: !ctx.locked });
      ctx.setAction('restart', { enabled: !ctx.locked && steps.length > 0 });
      ctx.setAction('sample', { enabled: !ctx.locked });
      ctx.setAction('indep', { enabled: !ctx.locked && !independentTree(p.pb1, p.pb2) });
      ctx.setAction('sclear', { enabled: !ctx.locked && samples.length > 0 });
    }

    /* ---------- Ablauf ---------- */
    function stepState(now: number, dt: number): boolean {
      let anim = false;
      const tau = reduced() ? 0 : 0.16;
      const goal = cells();
      for (let i = 0; i < 4; i++) {
        cS[i] = follow(cS[i]!, goal[i]!, dt, tau);
        if (cS[i] !== goal[i]) anim = true;
      }
      const fast = drag ? 0.03 : tau;
      paS = follow(paS, p.pa, dt, reduced() ? 0 : fast);
      pb1S = follow(pb1S, p.pb1, dt, reduced() ? 0 : fast);
      pb2S = follow(pb2S, p.pb2, dt, reduced() ? 0 : fast);
      if (paS !== p.pa || pb1S !== p.pb1 || pb2S !== p.pb2) anim = true;
      const ht = hlTarget();
      for (let i = 0; i < 9; i++) {
        hlS[i] = follow(hlS[i]!, ht[i]!, dt, reduced() ? 0 : 0.12);
        if (hlS[i] !== ht[i]) anim = true;
      }
      if (view.busy(now) || order.busy(now) || now - cardT0 < 700) anim = true;
      if (lastStep && now - lastStep.t0 < 2500) anim = true;
      if (msg && now - msg.t0 < 2300) anim = true;
      if (samples.length && now - samples[samples.length - 1]!.t0 < 400) anim = true;
      if (autoReveal) {
        anim = true;
        if (now - autoT > (reduced() ? 0 : 650)) {
          autoT = now;
          revealNext(now);
          if (known.every(Boolean)) autoReveal = false;
          syncActions();
        }
      }
      return anim;
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = stepState(now, dt);
      let grow = 1;
      let kAll = 1;
      if (intro !== null) {
        const t = now - intro;
        if (t > 1800) intro = null;
        else {
          anim = true;
          kAll = ease.outCubic(clamp01(t / 450));
          grow = ease.inOutCubic(clamp01((t - 200) / 1000));
        }
      }
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      const u = view.at(now);
      if (u < 1 && prevMode !== mode()) drawMode(prevMode, (1 - u) * kAll, now, { grow }, -u * 14);
      drawMode(mode(), u * kAll, now, { grow }, (1 - u) * 14 + (1 - kAll) * 10);
      if (anim) ctx.requestRender();
    }
    function drawMode(m: Mode, alpha: number, now: number, k: { grow: number }, dx: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      g.save();
      g.translate(dx, 0);
      if (m === 'sync') drawSync(alpha, now, k);
      else if (m === 'fill') drawFill(alpha, now);
      else if (m === 'tree') drawTreeMode(alpha, now, k);
      else drawMosaic(alpha, now, k);
      g.restore();
    }

    updateReadouts();
    syncActions();

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'input' && changed.has('ctx') && (mode() === 'sync' || mode() === 'fill')) {
          const d = CONTEXT_DATA[p.ctx as Ctx];
          if (d) ctx.set({ c1: d[0], c2: d[1], c3: d[2], c4: d[3] });
        }
        if (changed.has('mode') && source !== 'init' && mode() !== curMode) {
          prevMode = curMode;
          curMode = mode();
          if (reduced()) view.snap(1);
          else {
            view.snap(0);
            view.go(1, 520, now);
          }
          hover = null;
          sel = 0;
          cardT0 = now;
        }
        if (source === 'init') curMode = mode();
        if (changed.has('order')) {
          if (source === 'init' || reduced()) order.snap(p.order === 'BA' ? 1 : 0);
          else order.go(p.order === 'BA' ? 1 : 0, 650, now);
        }
        if (['given', 'c1', 'c2', 'c3', 'c4'].some((k) => changed.has(k)) && source !== 'init') {
          resetFill();
          autoReveal = false;
        }
        if (['pa', 'pb1', 'pb2', 'mode'].some((k) => changed.has(k)) && source !== 'init' && !drag) samples = [];
        if (changed.has('ev') || source === 'replace') cardT0 = now;
        if (source === 'init' || source === 'replace') {
          if (source === 'init') {
            for (let i = 0; i < 4; i++) cS[i] = cells()[i]!;
            paS = p.pa;
            pb1S = p.pb1;
            pb2S = p.pb2;
          }
        }
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'reveal') {
          autoReveal = false;
          revealNext(now);
        } else if (id === 'restart') {
          resetFill();
          autoReveal = false;
        } else if (id === 'shuffle') {
          const rnd = nextRandom();
          const r = () => 2 + Math.floor(rnd() * 28);
          ctx.set({ c1: r(), c2: r(), c3: r(), c4: r() });
        } else if (id === 'sample') {
          const rnd = nextRandom();
          const base = samples.length >= 400 ? [] : samples;
          const add: Sample[] = [];
          for (let i = 0; i < 100; i++) add.push({ x: rnd(), y: rnd(), t0: now + (reduced() ? -1e6 : i * 14) });
          samples = [...base, ...add];
        } else if (id === 'indep') {
          ctx.set({ pb2: p.pb1 });
        } else if (id === 'sclear') samples = [];
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
