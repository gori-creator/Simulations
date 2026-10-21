import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { approachTable, distanceTo, quadrants, yIntercept, zero, type ApproachKind, type Hyperbola } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOutSine = (t: number) => (1 - Math.cos(Math.PI * clamp01(t))) / 2;
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
    if (Math.abs(this.goal - this.v) <= 1e-4 * (1 + Math.abs(this.goal))) {
      this.v = this.goal;
      return true;
    }
    return true;
  }
}

type PhaseKey = 'base' | 'stretch' | 'shiftX' | 'shiftY';
interface Phase {
  key: PhaseKey;
  start: number;
  dur: number;
  no: number;
}
/** Schritt-für-Schritt-Animation „erst strecken, dann verschieben“. */
interface Story {
  t0: number;
  from: Hyperbola;
  to: Hyperbola;
  phases: Phase[];
  end: number;
}
/** Punkt P läuft nach außen bzw. zur Polstelle (Zeit in ms, Lage logarithmisch). */
interface Run {
  kind: ApproachKind;
  side: 1 | -1;
  t0: number;
  l0: number;
  /** Zeitpunkte: Anlauf bis |x − b| = 1, Lauf, Halten, Rückweg */
  d0: number;
  d1: number;
  d2: number;
  d3: number;
}
interface Ghost {
  b: number;
  c: number;
  u: number;
  h: number;
  t: number;
}
interface Cell {
  f: string;
  swatch?: string;
  muted?: boolean;
  /** über die ganze Breite (bei zwei Spalten) */
  span?: boolean;
}

/** Zellen auf Zeilen verteilen (zwei Spalten, breite Zellen allein). */
function cellRows(cells: Cell[], cols: number): { cell: Cell; row: number; col: number }[] {
  const out: { cell: Cell; row: number; col: number }[] = [];
  let row = 0;
  let col = 0;
  for (const cell of cells) {
    if (cols === 1) {
      out.push({ cell, row: row++, col: 0 });
      continue;
    }
    if (cell.span) {
      if (col > 0) row++;
      out.push({ cell, row: row++, col: 0 });
      col = 0;
    } else {
      out.push({ cell, row, col });
      col++;
      if (col === 2) {
        col = 0;
        row++;
      }
    }
  }
  return out;
}

/**
 * Hyperbeln f(x) = a / (x − b) + c mit ihren Asymptoten x = b und y = c.
 * Griffe: Asymptotenkreuz Z (verschiebt), Punkt Q (Streckfaktor a), Punkt P
 * auf dem Graphen mit dem Rechteck (x − b) · (y − c) = a (indirekte
 * Proportionalität). Aktionen: Schritt-für-Schritt vom Graphen zu 1/x aus
 * „erst strecken, dann verschieben“ und Annäherung an die Asymptoten mit
 * Wertetabelle (x → ±∞ bzw. x → b).
 */
export default defineSimulation({
  id: 'hyperbel',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.52 },
  groups: [
    { id: 'point', label: L('Punkt P und Wertetabelle', 'Point P and table of values') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'a',
      type: 'number',
      label: L('Streckfaktor a', 'Stretch factor a'),
      help: L('a > 0: Äste im I. und III. Quadranten, a < 0: im II. und IV. (bezogen auf die Asymptoten). Auch am grünen Punkt ziehen.', 'a > 0: branches in quadrants I and III, a < 0: in II and IV (relative to the asymptotes). You can also drag the green point.'),
      min: -8,
      max: 8,
      step: 0.1,
      default: 4,
    },
    {
      key: 'b',
      type: 'number',
      label: L('Verschiebung in x-Richtung b', 'Horizontal shift b'),
      help: L('Senkrechte Asymptote x = b. Auch am Kreuz Z ziehen.', 'Vertical asymptote x = b. You can also drag the cross Z.'),
      min: -6,
      max: 6,
      step: 0.1,
      default: 0,
    },
    {
      key: 'c',
      type: 'number',
      label: L('Verschiebung in y-Richtung c', 'Vertical shift c'),
      help: L('Waagrechte Asymptote y = c.', 'Horizontal asymptote y = c.'),
      min: -5,
      max: 5,
      step: 0.1,
      default: 0,
    },
    {
      key: 'u',
      type: 'number',
      group: 'point',
      label: L('Lage von P: x − b', 'Position of P: x − b'),
      help: L('Abstand des Punktes P von der Polstelle (negativ: linker Ast). Auch P auf dem Graphen ziehen.', 'Distance of P from the pole (negative: left branch). You can also drag P along the graph.'),
      min: -8,
      max: 8,
      step: 0.1,
      default: 2,
    },
    { key: 'rect', type: 'boolean', group: 'point', label: L('Rechteck mit (x − b) · (y − c) = a', 'Rectangle with (x − b) · (y − c) = a'), default: true },
    {
      key: 'lim',
      type: 'choice',
      group: 'point',
      label: L('Wertetabelle', 'Table of values'),
      options: [
        { value: 'off', label: L('Rechtecke (indirekte Proportionalität)', 'Rectangles (inverse proportion)') },
        { value: 'inf', label: L('x → ±∞: Annäherung an y = c', 'x → ±∞: approaching y = c') },
        { value: 'pole', label: L('x → b: Annäherung an x = b', 'x → b: approaching x = b') },
      ],
      default: 'off',
    },
    { key: 'base', type: 'boolean', group: 'view', label: L('Grundfunktion y = 1/x (blass)', 'Basic function y = 1/x (faint)'), default: true },
    { key: 'asym', type: 'boolean', group: 'view', label: L('Asymptoten', 'Asymptotes'), default: true },
    { key: 'quad', type: 'boolean', group: 'view', label: L('Quadranten bezüglich der Asymptoten', 'Quadrants relative to the asymptotes'), default: true },
    { key: 'info', type: 'boolean', group: 'view', label: L('Steckbrief und Werte im Bild', 'Key features and values in the picture'), help: L('Aus: Werte im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: values in the picture replaced by “?” (for tasks).'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'steps', label: L('Erst strecken, dann verschieben', 'First stretch, then shift'), primary: true },
    { id: 'inf', label: L('P nach außen laufen lassen', 'Let P run outwards') },
    { id: 'pole', label: L('P zur Polstelle laufen lassen', 'Let P run to the pole') },
  ],
  readouts: [
    { key: 'eq', label: L('Funktionsterm', 'Function'), spoiler: true },
    { key: 'D', label: L('Definitionsmenge', 'Domain'), spoiler: true },
    { key: 'W', label: L('Wertemenge', 'Range'), spoiler: true },
    { key: 'asym', label: L('Asymptoten', 'Asymptotes'), spoiler: true },
    { key: 'zero', label: L('Nullstelle', 'Zero'), spoiler: true },
    { key: 'yint', label: L('Schnittpunkt mit der y-Achse', 'y-intercept'), spoiler: true },
    { key: 'branch', label: L('Lage der Äste', 'Position of the branches'), spoiler: true },
    { key: 'rect', label: L('Rechteck an P', 'Rectangle at P'), spoiler: true },
  ],
  resultsParam: 'info',
  presets: [
    { id: 'start', label: L('Indirekte Proportionalität: x · y = 4', 'Inverse proportion: x · y = 4'), values: {} },
    { id: 'base', label: L('Grundfunktion y = 1/x', 'Basic function y = 1/x'), values: { a: 1, u: 1 } },
    { id: 'neg', label: L('a negativ: II. und IV. Quadrant', 'Negative a: quadrants II and IV'), values: { a: -3, u: 1.5 } },
    { id: 'shift', label: L('Verschobene Hyperbel', 'Shifted hyperbola'), values: { a: 3, b: 2, c: 1, u: 2 } },
    { id: 'inf', label: L('Annäherung an y = c', 'Approaching y = c'), values: { a: 2, b: -1, c: 1.5, u: 3, lim: 'inf' } },
    { id: 'pole', label: L('Polstelle x = b', 'Pole x = b'), values: { a: -2, b: 1, c: -1, u: 0.5, lim: 'pole' } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen der Hyperbel f(x) = a/(x − b) + c, den gestrichelten Asymptoten x = b und y = c, einem Punkt P auf dem Graphen mit Rechteck (x − b) · (y − c) = a. Daneben Steckbrief und Wertetabelle.',
      card: 'Steckbrief',
      D: 'Definitionsmenge',
      W: 'Wertemenge',
      asymV: 'senkr. Asymptote',
      asymH: 'waagr. Asymptote',
      zero: 'Nullstelle',
      noZero: 'keine (c = 0)',
      yint: 'y-Achse',
      noYint: 'kein Schnittpunkt (b = 0)',
      branches: 'Äste',
      q13: '\\t{I.} und \\t{III.} Quadrant, fallend',
      q24: '\\t{II.} und \\t{IV.} Quadrant, steigend',
      asym: 'Asymptoten',
      noZeroS: 'keine',
      noYintS: 'keiner',
      noHyp: 'a = 0: keine Hyperbel',
      tabRect: 'Rechtecke: Produkt immer a',
      tabRect0: 'Indirekt proportional: x · y = a',
      tabInf: 'x → {dir}∞: Annäherung an y = c',
      tabPole: 'x → b {dir}: Annäherung an x = b',
      fromRight: 'von rechts',
      fromLeft: 'von links',
      dist: 'Abstand',
      prod: 'Produkt',
      base: 'Grundfunktion: f(x) = \\f{1}{x}',
      stretch: 'Strecken mit a = {a}',
      stretchMirror: 'Strecken mit a = {a} (mit Spiegelung)',
      shiftX: 'Verschieben um {b} nach {dir} → Asymptote x = {b2}',
      shiftY: 'Verschieben um {c} nach {dir} → Asymptote y = {c2}',
      right: 'rechts',
      left: 'links',
      up: 'oben',
      down: 'unten',
      distTo: 'Abstand zu {name}',
      area: 'A = {v}',
    },
    en: {
      canvas: 'Coordinate system with the graph of the hyperbola f(x) = a/(x − b) + c, the dashed asymptotes x = b and y = c and a point P on the graph with the rectangle (x − b) · (y − c) = a. Next to it key features and a table of values.',
      card: 'Key features',
      D: 'Domain',
      W: 'Range',
      asymV: 'vert. asymptote',
      asymH: 'horiz. asymptote',
      zero: 'Zero',
      noZero: 'none (c = 0)',
      yint: 'y-axis',
      noYint: 'no intercept (b = 0)',
      branches: 'Branches',
      q13: 'quadrants \\t{I} and \\t{III}, decreasing',
      q24: 'quadrants \\t{II} and \\t{IV}, increasing',
      asym: 'Asymptotes',
      noZeroS: 'none',
      noYintS: 'none',
      noHyp: 'a = 0: not a hyperbola',
      tabRect: 'Rectangles: product always a',
      tabRect0: 'Inversely proportional: x · y = a',
      tabInf: 'x → {dir}∞: approaching y = c',
      tabPole: 'x → b {dir}: approaching x = b',
      fromRight: 'from the right',
      fromLeft: 'from the left',
      dist: 'Distance',
      prod: 'Product',
      base: 'Basic function: f(x) = \\f{1}{x}',
      stretch: 'Stretch by a = {a}',
      stretchMirror: 'Stretch by a = {a} (with reflection)',
      shiftX: 'Shift {b} to the {dir} → asymptote x = {b2}',
      shiftY: 'Shift {c} {dir} → asymptote y = {c2}',
      right: 'right',
      left: 'left',
      up: 'up',
      down: 'down',
      distTo: 'Distance to {name}',
      area: 'A = {v}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (all, k: string) => vars[k] ?? all);
    const editable = () => !ctx.locked;

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { f: s[0]!, asym: s[4]!, rect: s[2]!, P: s[3]!, pts: s[5]! };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.88)' : 'rgba(255,255,255,0.92)');

    /* ---------- Aufteilung ---------- */

    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (narrow()) {
        const ph = Math.round(h * 0.5);
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 4, y: ph + 8, w: w - 8, h: h - ph - 12 } };
      }
      const colW = Math.round(Math.min(340, Math.max(222, w * 0.33)));
      return { plot: { x: 0, y: 0, w: w - colW - 6, h }, col: { x: w - colW, y: 6, w: colW - 6, h: h - 12 } };
    }
    const textSize = () => {
      const w = surface.width;
      return narrow() ? 12.5 : w < 700 ? 12 : w < 900 ? 12.5 : 13.5;
    };

    const plot = new Plot(surface, { x: [-8, 8], y: [-6, 6], region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Zustand ---------- */

    const uOf = (u: number) => (Math.abs(u) < 0.05 ? 0.1 : u);
    const A = new Chan(p.a);
    const B = new Chan(p.b);
    const Cc = new Chan(p.c);
    const U = new Chan(uOf(p.u));
    let story: Story | null = null;
    let run: Run | null = null;
    let intro: number | null = reduced() ? null : performance.now();
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let lastQ = -Infinity;
    const ghosts: Ghost[] = [];
    let lastGhostU = U.v;

    const grab = () => {
      lastDrag = performance.now();
      cancelAnims();
    };
    const dragging = () => performance.now() - lastDrag < 300;

    /** Angezeigte Werte (gleiten weich), ggf. aus der Schritt-für-Schritt-Animation. */
    function shown(now: number): Hyperbola & { u: number } {
      if (story) {
        const s = storyValues(story, now);
        return { ...s, u: U.v };
      }
      return { a: A.v, b: B.v, c: Cc.v, u: U.v };
    }

    function cancelAnims(): void {
      const now = performance.now();
      if (story) {
        const s = storyValues(story, now);
        A.jump(s.a);
        B.jump(s.b);
        Cc.jump(s.c);
        story = null;
      }
      if (run) {
        U.jump(runU(run, now));
        run = null;
      }
    }

    /* ---------- Griffe ---------- */

    /** Q liegt 1 rechts von Z (bzw. 1 links, wenn P dort liegt): Q(b + 1 | c + a). */
    const qSide = () => (Math.abs(U.v - 1) < 0.6 ? -1 : 1);
    plot.addHandle({
      get: () => [B.v, Cc.v],
      set: (x, y) => {
        grab();
        ctx.set({ b: x, c: y });
      },
      enabled: () => editable() && !story,
      color: () => C().asym,
    });
    plot.addHandle({
      get: () => {
        const s = qSide();
        return [B.v + s, Cc.v + s * A.v];
      },
      set: (_x, y) => {
        grab();
        lastQ = performance.now();
        ctx.set({ a: (y - p.c) * qSide() });
      },
      axis: 'y',
      enabled: () => editable() && !story,
      color: () => C().rect,
    });
    plot.addHandle({
      get: () => {
        const u = U.v;
        return [B.v + u, Cc.v + A.v / u];
      },
      set: (x) => {
        grab();
        let u = x - p.b;
        if (Math.abs(u) < 0.1) u = u < 0 ? -0.1 : 0.1;
        ctx.set({ u });
      },
      axis: 'x',
      enabled: () => editable() && !story && !run && Math.abs(A.v) > 0.05,
      color: () => C().P,
    });

    /* ---------- Schritt-für-Schritt ---------- */

    function makeStory(now: number): Story {
      const from = { a: A.v, b: B.v, c: Cc.v };
      const to = { a: p.a, b: p.b, c: p.c };
      const phases: Phase[] = [];
      let t = 0;
      let no = 0;
      const atBase = Math.abs(from.a - 1) < 1e-6 && Math.abs(from.b) < 1e-6 && Math.abs(from.c) < 1e-6;
      phases.push({ key: 'base', start: t, dur: atBase ? 1 : 900, no: 0 });
      t += (atBase ? 0 : 900) + 900;
      phases.push({ key: 'stretch', start: t, dur: 1500, no: ++no });
      t += 1500 + 500;
      if (to.b !== 0) {
        phases.push({ key: 'shiftX', start: t, dur: 1300, no: ++no });
        t += 1300 + 500;
      }
      if (to.c !== 0) {
        phases.push({ key: 'shiftY', start: t, dur: 1300, no: ++no });
        t += 1300 + 500;
      }
      return { t0: now, from, to, phases, end: t + 1400 };
    }

    function storyValues(s: Story, now: number): Hyperbola {
      const t = now - s.t0;
      let v: Hyperbola = { ...s.from };
      for (const ph of s.phases) {
        if (t < ph.start) break;
        const e = ease.inOutCubic(clamp01((t - ph.start) / ph.dur));
        if (ph.key === 'base') v = { a: lerp(s.from.a, 1, e), b: lerp(s.from.b, 0, e), c: lerp(s.from.c, 0, e) };
        else if (ph.key === 'stretch') v.a = lerp(1, s.to.a, e);
        else if (ph.key === 'shiftX') v.b = lerp(0, s.to.b, e);
        else v.c = lerp(0, s.to.c, e);
      }
      return v;
    }

    /* ---------- Lauf von P ---------- */

    function makeRun(kind: ApproachKind, now: number): Run {
      const side: 1 | -1 = p.u < 0 ? -1 : 1;
      const l0 = Math.log10(Math.abs(U.v));
      const d0 = Math.abs(l0) > 0.02 ? 700 : 0;
      return { kind, side, t0: now, l0, d0, d1: d0 + 3800, d2: d0 + 3800 + 1100, d3: d0 + 3800 + 1100 + 1300 };
    }
    /** Lage von P als log10|x − b| zum Zeitpunkt now. */
    function runL(r: Run, now: number): number {
      const t = now - r.t0;
      const far = r.kind === 'inf' ? 3 : -3;
      if (t < r.d0) return lerp(r.l0, 0, ease.inOutCubic(t / r.d0));
      if (t < r.d1) return lerp(0, far, inOutSine((t - r.d0) / (r.d1 - r.d0)));
      if (t < r.d2) return far;
      return lerp(far, r.l0, ease.inOutCubic(clamp01((t - r.d2) / (r.d3 - r.d2))));
    }
    const runU = (r: Run, now: number) => r.side * 10 ** runL(r, now);

    /* ---------- Formeln ---------- */

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight });
    function fit(src: string, maxW: number, size: number, color: string, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    /** Parameterwerte (Schritt 0,1) und abgeleitete Werte als Text. */
    const P1 = (v: number) => fmt.num(Math.round(v * 10) / 10, 1);
    const N = (v: number, d = 2) => fmt.num(v, d);
    const hidden = () => !p.info;
    const Q = (s: string) => (hidden() ? '?' : s);

    function termSrc(h: Hyperbola, name = 'f(x)'): string {
      const a = Math.round(h.a * 10) / 10;
      const b = Math.round(h.b * 10) / 10;
      const c = Math.round(h.c * 10) / 10;
      if (a === 0) return `${name} = ${P1(c)}`;
      const den = b === 0 ? 'x' : `x ${b > 0 ? '−' : '+'} ${P1(Math.abs(b))}`;
      let s = `${name} = ${a < 0 ? '−' : ''}\\f{${P1(Math.abs(a))}}{${den}}`;
      if (c !== 0) s += ` ${c > 0 ? '+' : '−'} ${P1(Math.abs(c))}`;
      return s;
    }
    const setMinus = (v: number) => `\\t{ℝ} \\ {${P1(v)}}`;

    /* ---------- Ergebnisse (Text) ---------- */

    function updateReadouts(): void {
      const h: Hyperbola = { a: p.a, b: p.b, c: p.c };
      const de = ctx.lang === 'de';
      const v = (s: string) => `<var>${s}</var>`;
      const frac = (n: string, d: string) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
      const den = p.b === 0 ? v('x') : `${v('x')} ${p.b > 0 ? '−' : '+'} ${fmt.num(Math.abs(p.b))}`;
      const cPart = p.c === 0 ? '' : ` ${p.c > 0 ? '+' : '−'} ${fmt.num(Math.abs(p.c))}`;
      const R = '<strong>ℝ</strong>';
      if (p.a === 0) {
        ctx.readout('eq', { html: `${v('f')}(${v('x')}) = ${fmt.num(p.c)} &nbsp;(${de ? 'keine Hyperbel' : 'not a hyperbola'})` });
        ctx.readout('W', { html: `${v('W')} = {${fmt.num(p.c)}}` });
        ctx.readout('asym', de ? 'keine (a = 0)' : 'none (a = 0)');
        ctx.readout('branch', de ? 'a = 0: Der Graph ist die Gerade y = c mit einer Lücke bei x = b.' : 'a = 0: the graph is the line y = c with a gap at x = b.');
        ctx.readout('rect', null);
      } else {
        ctx.readout('eq', { html: `${v('f')}(${v('x')}) = ${p.a < 0 ? '−' : ''}${frac(fmt.num(Math.abs(p.a)), den)}${cPart}` });
        ctx.readout('W', { html: `${v('W')} = ${R} \\ {${fmt.num(p.c)}}` });
        ctx.readout('asym', { html: `${de ? 'senkrecht' : 'vertical'}: ${v('x')} = ${fmt.num(p.b)} (${de ? 'Polstelle' : 'pole'}), ${de ? 'waagrecht' : 'horizontal'}: ${v('y')} = ${fmt.num(p.c)}` });
        const q = quadrants(p.a)!;
        const qTxt = q[0] === 1 ? 'I. / III.' : 'II. / IV.';
        ctx.readout(
          'branch',
          de
            ? `a ${p.a > 0 ? '>' : '<'} 0: ${qTxt} Quadrant (bezüglich der Asymptoten), auf beiden Teilintervallen streng monoton ${p.a > 0 ? 'fallend' : 'steigend'}`
            : `a ${p.a > 0 ? '>' : '<'} 0: quadrants ${q[0] === 1 ? 'I / III' : 'II / IV'} (relative to the asymptotes), strictly ${p.a > 0 ? 'decreasing' : 'increasing'} on each interval`,
        );
        const u = uOf(p.u);
        const y = p.a / u;
        const xl = p.b === 0 ? v('x') : `(${v('x')} ${p.b > 0 ? '−' : '+'} ${fmt.num(Math.abs(p.b))})`;
        const yl = p.c === 0 ? v('y') : `(${v('y')} ${p.c > 0 ? '−' : '+'} ${fmt.num(Math.abs(p.c))})`;
        const par = (n: number) => (n < 0 ? `(${fmt.num(n)})` : fmt.num(n));
        ctx.readout('rect', { html: `P${fmt.point(p.b + u, p.c + y)}: ${xl} · ${yl} = ${par(u)} · ${par(y)} = <strong>${fmt.num(p.a)}</strong>` });
      }
      ctx.readout('D', { html: `${v('D')} = ${R} \\ {${fmt.num(p.b)}}` });
      const z = zero(h);
      // a = 0 und c = 0: f(x) = 0 – jede Stelle x ≠ b ist Nullstelle
      const zeroNone = p.a === 0 ? (p.c === 0 ? (de ? 'alle x ≠ b (f(x) = 0)' : 'every x ≠ b (f(x) = 0)') : de ? 'keine' : 'none') : de ? 'keine – für c = 0 ist die x-Achse Asymptote' : 'none – for c = 0 the x-axis is an asymptote';
      ctx.readout('zero', z === null ? zeroNone : { html: `${v('x')}<sub>0</sub> = ${v('b')} − ${frac(v('a'), v('c'))} = ${fmt.num(z)} &nbsp;→&nbsp; N${fmt.point(z, 0)}` });
      const s = yIntercept(h);
      const yintNone = p.a === 0 ? (de ? 'keiner – 0 gehört nicht zu D' : 'none – 0 is not in D') : de ? 'keiner – für b = 0 ist die y-Achse Asymptote' : 'none – for b = 0 the y-axis is an asymptote';
      ctx.readout('yint', s === null ? yintNone : { html: `${v('f')}(0) = ${fmt.num(s)} &nbsp;→&nbsp; S<sub>${v('y')}</sub>${fmt.point(0, s)}` });
    }

    function syncActions(): void {
      const ok = p.a !== 0;
      ctx.setAction('inf', { enabled: ok });
      ctx.setAction('pole', { enabled: ok });
    }

    /* ---------- Zeichnen: Hilfen ---------- */

    function pill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? textSize();
      const box = opts.maxW ? fit(src, opts.maxW, size, opts.color ?? th().text, 700) : formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      const align = opts.align ?? 'center';
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 10);
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.4;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 10);
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    /** Formel mit hellem Halo direkt im Koordinatensystem. */
    function label(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = textSize(), alpha = 1): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      g.save();
      g.globalAlpha = alpha * 0.82;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha = alpha;
      box.draw(g, left, base);
      g.restore();
    }

    /** Ein Ast der Hyperbel als Pfad; reveal (0…1) lässt ihn vom Scheitel aus wachsen. */
    function branchPath(h: Hyperbola, side: 1 | -1, reveal: number): [number, number][] {
      const { xMin, xMax, yMin, yMax } = plot.bounds;
      const aa = Math.max(Math.abs(h.a), 1e-6);
      const s0 = Math.sqrt(aa);
      const xs = Math.max(Math.abs(xMin - h.b), Math.abs(xMax - h.b)) + 1;
      const ys = Math.max(Math.abs(yMin - h.c), Math.abs(yMax - h.c)) + 1;
      const T = Math.max(0.6, Math.log(xs / s0), Math.log((s0 * ys) / aa)) + 0.3;
      const tr2 = T * reveal;
      const n = 420;
      const pts: [number, number][] = [];
      const yLo = yMin - (yMax - yMin);
      const yHi = yMax + (yMax - yMin);
      for (let i = 0; i <= n; i++) {
        const t = -tr2 + (2 * tr2 * i) / n;
        const u = side * s0 * Math.exp(t);
        const y = h.c + h.a / u;
        pts.push([h.b + u, Math.max(yLo, Math.min(yHi, y))]);
      }
      return pts;
    }

    function strokePath(pts: [number, number][], color: string, width: number, opts: { dash?: number[]; glow?: boolean; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const g = surface.g;
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
      pts.forEach(([x, y], i) => (i ? g.lineTo(plot.px(x), plot.py(y)) : g.moveTo(plot.px(x), plot.py(y))));
      g.stroke();
      g.restore();
    }

    function arrowHead(x: number, y: number, ang: number, color: string, size = 9): void {
      const g = surface.g;
      g.save();
      g.fillStyle = color;
      g.translate(x, y);
      g.rotate(ang);
      g.beginPath();
      g.moveTo(size * 0.5, 0);
      g.lineTo(-size * 0.6, -size * 0.55);
      g.lineTo(-size * 0.3, 0);
      g.lineTo(-size * 0.6, size * 0.55);
      g.closePath();
      g.fill();
      g.restore();
    }

    function dot(x: number, y: number, color: string, r: number, ring = true): void {
      const g = surface.g;
      g.save();
      if (ring) {
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
        g.shadowBlur = 5;
        g.shadowOffsetY = 1;
      }
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      if (ring) {
        g.strokeStyle = th().bg;
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.stroke();
      }
    }

    /* ---------- Szene ---------- */

    function drawPlot(now: number, h: Hyperbola & { u: number }, k: { asym: number; graph: number; rect: number; P: number; labels: number }): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const size = textSize();
      plot.begin();
      if (p.grid) plot.grid();
      plot.axes();
      const zx = plot.px(h.b);
      const zy = plot.py(h.c);
      const isHyp = Math.abs(h.a) > 1e-4;

      // Quadranten bezüglich der Asymptoten
      if (p.quad && p.asym && isHyp) {
        const w = Math.min(1, Math.abs(h.a) / 0.6) * k.asym;
        const pos = h.a > 0;
        g.save();
        g.fillStyle = c.f;
        g.globalAlpha = (th().dark ? 0.08 : 0.055) * w;
        const cx = Math.max(r.x, Math.min(r.x + r.w, zx));
        const cy = Math.max(r.y, Math.min(r.y + r.h, zy));
        if (pos) {
          g.fillRect(cx, r.y, r.x + r.w - cx, cy - r.y);
          g.fillRect(r.x, cy, cx - r.x, r.y + r.h - cy);
        } else {
          g.fillRect(r.x, r.y, cx - r.x, cy - r.y);
          g.fillRect(cx, cy, r.x + r.w - cx, r.y + r.h - cy);
        }
        g.restore();
        const names = ['I', 'II', 'III', 'IV'];
        const qs = [
          [1, -1],
          [-1, -1],
          [-1, 1],
          [1, 1],
        ] as const;
        qs.forEach(([sx, sy], i) => {
          const ex = sx > 0 ? r.x + r.w : r.x;
          const ey = sy > 0 ? r.y + r.h : r.y;
          const room = Math.min(Math.abs(ex - zx), Math.abs(ey - zy));
          if (room < 46) return;
          const d = Math.min(room * 0.72, 150);
          const on = (i % 2 === 0) === pos;
          let nx = zx + sx * d;
          const ny = zy + sy * d;
          if (nx > r.x + r.w - 64 && ny < r.y + 130) nx = r.x + r.w - 64;
          plot.textPx(nx, ny, names[i]!, {
            color: on ? mixColor(c.f, th().bg, 0.25, 0.85 * k.asym) : mixColor(th().muted, th().bg, 0.35, 0.6 * k.asym),
            size: on ? 22 : 18,
            weight: 'bold',
            align: 'center',
            baseline: 'middle',
            halo: false,
          });
        });
      }

      // Grundfunktion 1/x (blass)
      if (p.base) {
        const base = { a: 1, b: 0, c: 0 };
        const col = mixColor(th().muted, th().bg, 0.15);
        for (const s of [1, -1] as const) strokePath(branchPath(base, s, 1), col, 1.6, { dash: [6, 5], alpha: 0.75 * k.labels });
        const [lx, ly] = [plot.px(-0.45), plot.py(-1 / 0.45)];
        // nicht in das Rechteck an P schreiben (Rechteck zwischen Z und P)
        const rx0 = Math.min(zx, plot.px(h.b + h.u)) - 40;
        const rx1 = Math.max(zx, plot.px(h.b + h.u)) + 8;
        const ry0 = Math.min(zy, plot.py(h.c + h.a / h.u)) - 14;
        const ry1 = Math.max(zy, plot.py(h.c + h.a / h.u)) + 14;
        const inRect = p.rect && isHyp && lx > rx0 && lx < rx1 && ly > ry0 && ly < ry1;
        if (!inRect && lx > r.x + 30 && ly < r.y + r.h - 16 && ly > r.y + 16) label(lx - 6, ly, 'y = \\f{1}{x}', th().muted, 'right', size - 1, 0.9 * k.labels);
      }

      // Schritt-für-Schritt: gestreckter, noch nicht verschobener Graph als Geist
      if (story) {
        const t = now - story.t0;
        const sh = story.phases.find((q) => q.key === 'shiftX' || q.key === 'shiftY');
        if (sh && t > sh.start) {
          const fade = 1 - clamp01((t - (story.end - 900)) / 900);
          const ghost = { a: story.to.a, b: 0, c: 0 };
          for (const s of [1, -1] as const) strokePath(branchPath(ghost, s, 1), c.f, 2, { dash: [3, 5], alpha: 0.45 * fade });
          // Verschiebungspfeil von O nach Z
          const ox = plot.px(0);
          const oy = plot.py(0);
          if (Math.hypot(zx - ox, zy - oy) > 14) {
            g.save();
            g.globalAlpha = fade;
            g.strokeStyle = c.asym;
            g.lineWidth = 2.4;
            g.setLineDash([6, 4]);
            g.beginPath();
            g.moveTo(ox, oy);
            g.lineTo(zx, zy);
            g.stroke();
            g.restore();
            g.save();
            g.globalAlpha = fade;
            arrowHead(zx, zy, Math.atan2(zy - oy, zx - ox), c.asym, 12);
            g.restore();
          }
        }
      }

      // Asymptoten
      if (p.asym && isHyp) {
        const grow = k.asym;
        g.save();
        g.strokeStyle = c.asym;
        g.lineWidth = 2;
        g.setLineDash([8, 6]);
        g.globalAlpha = 0.95 * Math.min(1, Math.abs(h.a) / 0.15);
        g.beginPath();
        const vx = Math.round(zx) + 0.5;
        const hy = Math.round(zy) + 0.5;
        g.moveTo(vx, zy - (zy - r.y) * grow);
        g.lineTo(vx, zy + (r.y + r.h - zy) * grow);
        g.moveTo(zx - (zx - r.x) * grow, hy);
        g.lineTo(zx + (r.x + r.w - zx) * grow, hy);
        g.stroke();
        g.restore();
        const la = k.labels * Math.min(1, Math.abs(h.a) / 0.15);
        const xTxt = hidden() ? 'x = b' : `x = ${P1(h.b)}`;
        const yTxt = hidden() ? 'y = c' : `y = ${P1(h.c)}`;
        // senkrechte: oben, auf der Seite ohne Ast
        if (zx > r.x + 20 && zx < r.x + r.w - 20) {
          const right = h.a < 0;
          label(zx + (right ? 8 : -8), r.y + 22, xTxt, c.asym, right ? 'left' : 'right', size, la);
        }
        if (zy > r.y + 20 && zy < r.y + r.h - 20) {
          const below = h.a > 0;
          label(r.x + r.w - 10, zy + (below ? 14 : -14), yTxt, c.asym, 'right', size, la);
        }
      }

      // Rechteck-Geister (gleiche Fläche, andere Form)
      if (p.rect && isHyp) {
        for (let i = ghosts.length - 1; i >= 0; i--) {
          const gh = ghosts[i]!;
          const age = (now - gh.t) / 1500;
          if (age >= 1) {
            ghosts.splice(i, 1);
            continue;
          }
          const x0 = plot.px(gh.b);
          const y0 = plot.py(gh.c);
          const x1 = plot.px(gh.b + gh.u);
          const y1 = plot.py(gh.c + gh.h);
          g.save();
          g.globalAlpha = 0.5 * (1 - age) ** 1.5;
          g.strokeStyle = c.rect;
          g.lineWidth = 1.3;
          g.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
          g.restore();
        }
      }

      // Rechteck (x − b)(y − c) = a
      const u = h.u;
      const yP = h.c + h.a / u;
      const Px = plot.px(h.b + u);
      const Py = plot.py(yP);
      if (p.rect && isHyp && k.rect > 0) {
        const e = k.rect;
        const x1 = zx + (Px - zx) * e;
        const y1 = zy + (Py - zy) * e;
        g.save();
        g.globalAlpha = 0.35 + 0.65 * clamp01((Math.min(Math.abs(x1 - zx), Math.abs(y1 - zy)) - 1) / 5);
        const grad = g.createLinearGradient(zx, zy, x1, y1);
        grad.addColorStop(0, mixColor(c.rect, th().bg, 0, th().dark ? 0.16 : 0.12));
        grad.addColorStop(1, mixColor(c.rect, th().bg, 0, th().dark ? 0.32 : 0.26));
        g.fillStyle = grad;
        g.fillRect(Math.min(zx, x1), Math.min(zy, y1), Math.abs(x1 - zx), Math.abs(y1 - zy));
        g.strokeStyle = c.rect;
        g.lineWidth = 2;
        g.strokeRect(Math.min(zx, x1), Math.min(zy, y1), Math.abs(x1 - zx), Math.abs(y1 - zy));
        g.restore();
        // Seitenlängen und Flächeninhalt
        const wpx = Math.abs(x1 - zx);
        const hpx = Math.abs(y1 - zy);
        const la = k.rect * k.labels;
        if (e > 0.6 && Number.isFinite(Py)) {
          const below = yP > h.c; // Rechteck oberhalb von Z → Breite unten an Z beschriften
          if (wpx > 26) label((zx + x1) / 2, zy + (below ? 13 : -13), Q(N(Math.abs(u))), c.rect, 'center', size - 0.5, la);
          if (hpx > 22) label(x1 + (u > 0 ? 7 : -7), (zy + y1) / 2, Q(N(Math.abs(h.a / u))), c.rect, u > 0 ? 'left' : 'right', size - 0.5, la);
          if (wpx > 64 && hpx > 30) label((zx + x1) / 2, (zy + y1) / 2, tr('area', { v: Q(P1(Math.abs(h.a))) }), mixColor(c.rect, th().text, th().dark ? 0.1 : 0.35), 'center', size + 1, la);
        }
      }

      // Hilfe für a: von Z 1 nach rechts, a nach oben (beim Ziehen an Q und beim Strecken)
      let qGuide = clamp01(1 - (now - lastQ - 900) / 500);
      if (story) {
        const st = story.phases.find((q) => q.key === 'stretch')!;
        const t = now - story.t0;
        if (t > st.start - 200 && t < st.start + st.dur + 600) qGuide = Math.max(qGuide, clamp01(Math.min((t - st.start + 200) / 300, (st.start + st.dur + 600 - t) / 300)));
      }
      const qs = qSide();
      if (qGuide > 0 && isHyp) {
        const xq = plot.px(h.b + qs);
        const yq = plot.py(h.c + qs * h.a);
        g.save();
        g.globalAlpha = qGuide;
        g.strokeStyle = c.rect;
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(zx, zy);
        g.lineTo(xq, zy);
        g.lineTo(xq, yq);
        g.stroke();
        g.restore();
        label((zx + xq) / 2, zy + (qs * h.a > 0 ? 13 : -13), '1', c.rect, 'center', size, qGuide);
        label(xq + qs * 8, (zy + yq) / 2, `a = ${P1(h.a)}`, c.rect, qs > 0 ? 'left' : 'right', size, qGuide);
      }

      // Graph
      if (isHyp) {
        for (const s of [1, -1] as const) strokePath(branchPath(h, s, k.graph), c.f, 3.2, { glow: true });
      } else {
        // a = 0: Gerade y = c mit Lücke bei x = b
        plot.hline(h.c, { color: c.f, width: 3 });
        const g2 = surface.g;
        g2.fillStyle = th().bg;
        g2.strokeStyle = c.f;
        g2.lineWidth = 2;
        g2.beginPath();
        g2.arc(zx, zy, 5, 0, TAU);
        g2.fill();
        g2.stroke();
      }

      // Funktionsname am rechten Ast
      if (isHyp && k.graph > 0.95) {
        const xr = plot.bounds.xMax - 40 / plot.scale.x;
        if (xr > h.b + 0.3) {
          const yr = h.c + h.a / (xr - h.b);
          const py = plot.py(yr);
          const lx = plot.px(xr);
          const nearP = Math.abs(lx - Px) < 44 && Math.abs(py - Py) < 40;
          const nearCtl = lx > r.x + r.w - 56 && py < r.y + 130;
          if (py > r.y + 20 && py < r.y + r.h - 20 && !nearP && !nearCtl) label(plot.px(xr), py + (h.a > 0 ? -15 : 15), 'f', c.f, 'center', size + 4, k.labels);
        }
      }

      // Punkt Q (Streckfaktor a)
      if (isHyp && !story) {
        const xq = plot.px(h.b + qs);
        const yq = plot.py(h.c + qs * h.a);
        if (xq > r.x && xq < r.x + r.w && yq > r.y && yq < r.y + r.h) {
          g.save();
          g.globalAlpha = k.P;
          g.fillStyle = th().bg;
          g.strokeStyle = c.rect;
          g.lineWidth = 2.4;
          g.beginPath();
          g.arc(xq, yq, 5, 0, TAU);
          g.fill();
          g.stroke();
          g.restore();
        }
      }

      // Nullstelle und y-Achsenabschnitt
      if (p.info && isHyp) {
        const z = zero(h);
        if (z !== null) {
          const x = plot.px(z);
          const y = plot.py(0);
          if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) {
            dot(x, y, c.pts, 4.5 * k.labels);
            label(x + (h.a * h.c > 0 ? -8 : 8), y + 14, 'N', c.pts, h.a * h.c > 0 ? 'right' : 'left', size, k.labels);
          }
        }
        const s = yIntercept(h);
        if (s !== null) {
          const x = plot.px(0);
          const y = plot.py(s);
          if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) {
            dot(x, y, c.pts, 4.5 * k.labels);
            label(x + (h.b > 0 ? -8 : 8), y + (h.b * h.a > 0 ? 13 : -13), 'S_y', c.pts, h.b > 0 ? 'right' : 'left', size, k.labels);
          }
        }
      }

      // Abstand von P zur Asymptote
      const lim = p.lim as 'off' | ApproachKind;
      const onScreen = Px > r.x && Px < r.x + r.w && Py > r.y && Py < r.y + r.h;
      if (lim !== 'off' && isHyp && onScreen) {
        g.save();
        g.strokeStyle = c.P;
        g.lineWidth = 2.4;
        g.beginPath();
        if (lim === 'inf') {
          g.moveTo(Px, Py);
          g.lineTo(Px, zy);
        } else {
          g.moveTo(Px, Py);
          g.lineTo(zx, Py);
        }
        g.stroke();
        g.fillStyle = c.P;
        if (lim === 'inf' && Math.abs(Py - zy) > 8) {
          arrowHead(Px, zy, Py > zy ? -Math.PI / 2 : Math.PI / 2, c.P, 8);
          arrowHead(Px, Py, Py > zy ? Math.PI / 2 : -Math.PI / 2, c.P, 8);
        } else if (lim === 'pole' && Math.abs(Px - zx) > 8) {
          arrowHead(zx, Py, Px > zx ? Math.PI : 0, c.P, 8);
          arrowHead(Px, Py, Px > zx ? 0 : Math.PI, c.P, 8);
        }
        g.restore();
      }

      // Punkt P (am Rand mit Pfeil, wenn er das Bild verlässt)
      if (isHyp && k.P > 0) {
        if (onScreen) {
          dot(Px, Py, c.P, 6.5 * k.P);
          const up = h.a / u > 0;
          label(Px + (u > 0 ? 9 : -9), Py + (up ? -14 : 14), 'P', c.P, u > 0 ? 'left' : 'right', size + 1, k.P * k.labels);
        } else if (Number.isFinite(Px) && Number.isFinite(Py)) {
          const ex = Math.max(r.x + 16, Math.min(r.x + r.w - 16, Px));
          const ey = Math.max(r.y + 16, Math.min(r.y + r.h - 16, Py));
          const ang = Math.atan2(Py - ey, Px - ex);
          dot(ex, ey, c.P, 5.5);
          arrowHead(ex + Math.cos(ang) * 13, ey + Math.sin(ang) * 13, ang, c.P, 11);
        }
      }

      // Lauf: Anzeige x, f(x), Abstand
      if (lim !== 'off' && isHyp) {
        const x = h.b + u;
        const d = distanceTo(h, lim, u);
        const name = lim === 'inf' ? `y = ${hidden() ? 'c' : P1(h.c)}` : `x = ${hidden() ? 'b' : P1(h.b)}`;
        const xd = lim === 'pole' ? 4 : Math.abs(u) >= 100 ? 1 : 3;
        const src = `x = ${N(x, xd)}    f(x) = ${Q(N(yP, Math.abs(yP) >= 100 ? 1 : 3))}    ${tr('distTo', { name })}: ${Q(N(d, 4))}`;
        pill(r.x + r.w / 2, r.y + r.h - 24, src, { color: th().text, border: c.P, size: size - 0.5, maxW: r.w - 40 });
      }

      // Asymptotenkreuz Z
      if (isHyp && (p.asym || story)) {
        g.save();
        g.globalAlpha = k.asym;
        g.strokeStyle = c.asym;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(zx, zy, 5.5, 0, TAU);
        g.fillStyle = th().bg;
        g.fill();
        g.stroke();
        g.restore();
        const zTxt = hidden() ? 'Z' : `Z(${P1(h.b)} | ${P1(h.c)})`;
        // in den Quadranten ohne Ast und ohne Rechteck: waagrecht gegenüber von P
        const sx = u > 0 ? -1 : 1;
        const sy = h.a / u > 0 ? -1 : 1;
        label(zx + sx * 9, zy + sy * 14, zTxt, c.asym, sx < 0 ? 'right' : 'left', size - 1, k.labels);
      }

      plot.end();

      // Schrittanzeige
      if (story) drawCaption(now, story);
    }

    function drawCaption(now: number, s: Story): void {
      const r = plot.rect;
      const t = now - s.t0;
      let cur: Phase | null = null;
      for (const ph of s.phases) if (t >= ph.start - 150) cur = ph;
      if (!cur) return;
      const fadeIn = clamp01((t - cur.start + 150) / 300);
      const fadeOut = 1 - clamp01((t - (s.end - 500)) / 500);
      const alpha = Math.min(fadeIn, fadeOut);
      const to = s.to;
      let src = '';
      if (cur.key === 'base') src = ctx.t('base');
      else if (cur.key === 'stretch') src = tr(to.a < 0 ? 'stretchMirror' : 'stretch', { a: P1(to.a) });
      else if (cur.key === 'shiftX') src = tr('shiftX', { b: P1(Math.abs(to.b)), dir: ctx.t(to.b > 0 ? 'right' : 'left'), b2: P1(to.b) });
      else src = tr('shiftY', { c: P1(Math.abs(to.c)), dir: ctx.t(to.c > 0 ? 'up' : 'down'), c2: P1(to.c) });
      if (cur.no > 0) src = `${'①②③'[cur.no - 1]}  ${src}`;
      const color = cur.key === 'stretch' ? C().rect : cur.key === 'base' ? th().text : C().asym;
      pill(r.x + r.w / 2, r.y + 26 + (1 - ease.outCubic(fadeIn)) * -10, src, { color: th().text, border: color, size: textSize() + 0.5, alpha, maxW: r.w - 70 });
    }

    /* ---------- Karten ---------- */

    function cardFrame(r: Rect, alpha: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.97)';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      g.restore();
    }

    function infoCells(h: Hyperbola): { head: string; cells: Cell[] } {
      const c = C();
      const isHyp = Math.abs(h.a) > 0.049;
      const head = hidden() ? 'f(x) = \\f{a}{x − b} + c' : termSrc(h);
      const cells: Cell[] = [];
      cells.push({ f: `D = ${hidden() ? '?' : setMinus(h.b)}` });
      cells.push({ f: `W = ${hidden() ? '?' : isHyp ? setMinus(h.c) : `{${P1(h.c)}}`}` });
      const two = infoCols(regions().col.w) === 2;
      if (isHyp) {
        if (two) cells.push({ f: `${ctx.t('asym')}: x = ${Q(P1(h.b))},  y = ${Q(P1(h.c))}`, swatch: c.asym, span: true });
        else {
          cells.push({ f: `${ctx.t('asymV')}: x = ${Q(P1(h.b))}`, swatch: c.asym });
          cells.push({ f: `${ctx.t('asymH')}: y = ${Q(P1(h.c))}`, swatch: c.asym });
        }
        const hr = { a: Math.round(h.a * 10) / 10, b: Math.round(h.b * 10) / 10, c: Math.round(h.c * 10) / 10 };
        const z = zero(hr);
        cells.push({ f: `${ctx.t('zero')}: ${hidden() ? '?' : z === null ? ctx.t(two ? 'noZeroS' : 'noZero') : `x = ${N(z)}`}`, swatch: c.pts, muted: !hidden() && z === null });
        const s = yIntercept(hr);
        cells.push({ f: `${two ? 'S_y' : ctx.t('yint')}: ${hidden() ? '?' : s === null ? ctx.t(two ? 'noYintS' : 'noYint') : `${two ? '' : 'S_y'}(0 | ${N(s)})`}`, swatch: c.pts, muted: !hidden() && s === null });
        cells.push({ f: `${ctx.t('branches')}: ${hidden() ? '?' : ctx.t(h.a > 0 ? 'q13' : 'q24')}`, swatch: c.f, span: true });
      } else cells.push({ f: ctx.t('noHyp'), muted: true, span: true });
      return { head, cells };
    }

    function drawInfo(r: Rect, h: Hyperbola, size: number, alpha: number, stagger: number): void {
      const g = surface.g;
      const pad = narrow() ? 10 : 13;
      const { head, cells } = infoCells(h);
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const title = formula(g, ctx.t('card'), fstyle(size - 1, th().muted, 700));
      title.draw(g, r.x + pad, r.y + pad + title.asc);
      const hb = fit(head, r.w - 2 * pad, size + 4, C().f, 700);
      let y = r.y + pad + title.asc + title.desc + 8 + hb.asc;
      hb.draw(g, r.x + pad, y);
      y += hb.desc + 6;
      const cols = infoCols(r.w);
      const placed = cellRows(cells, cols);
      const rows = placed.length ? placed[placed.length - 1]!.row + 1 : 1;
      const cw = (r.w - 2 * pad) / cols;
      const lh = Math.min(size * 2.1, Math.max(size * 1.5, (r.y + r.h - pad + 2 - y) / rows));
      placed.forEach(({ cell, row, col }, i) => {
        const x = r.x + pad + col * cw;
        const cy = y + row * lh + lh / 2;
        const sw = cell.swatch ? 15 : 0;
        const a = clamp01(stagger * (cells.length + 2) - i);
        g.save();
        g.globalAlpha = alpha * ease.outCubic(a);
        const off = (1 - ease.outCubic(a)) * 8;
        if (cell.swatch) {
          g.fillStyle = cell.swatch;
          roundRect(g, x + off, cy - 4.5, 9, 9, 2.5);
          g.fill();
        }
        const box = fit(cell.f, (cell.span ? r.w - 2 * pad : cw) - sw - 6, size, cell.muted ? th().muted : th().text, 600);
        box.draw(g, x + sw + off, cy + (box.asc - box.desc) / 2);
        g.restore();
      });
      g.restore();
    }

    const infoCols = (w: number) => (narrow() || w > 420 ? 2 : 1);
    function infoHeight(size: number, w: number): number {
      const two = infoCols(w) === 2;
      const n = Math.abs(p.a) > 0.049 ? (two ? 4 : 7) : two ? 2 : 3;
      const pad = narrow() ? 10 : 13;
      return pad * 2 + size * 1.0 + 8 + size * 2.9 + 6 + n * size * 1.62;
    }

    interface TRow {
      cells: string[];
      alpha: number;
      on: boolean;
    }

    function tableData(now: number, h: Hyperbola & { u: number }): { title: string; headers: string[]; rows: TRow[] } {
      const lim = p.lim as 'off' | ApproachKind;
      const side: 1 | -1 = (run ? run.side : h.u < 0 ? -1 : 1) as 1 | -1;
      const isHyp = Math.abs(h.a) > 0.049;
      if (lim === 'off' || !isHyp) {
        const plain = Math.abs(h.b) < 0.05 && Math.abs(h.c) < 0.05;
        const title = plain ? ctx.t('tabRect0') : ctx.t('tabRect');
        const headers = plain ? ['x', 'y', 'x · y'] : ['x − b', 'y − c', ctx.t('prod')];
        const us = [0.5, 1, 2, 4, 8];
        const rows: TRow[] = us.map((d) => {
          const u = side * d;
          const y = h.a / u;
          return { cells: [N(u), Q(N(y, 3)), Q(P1(h.a))], alpha: 1, on: Math.abs(Math.abs(h.u) - d) < 0.05 };
        });
        if (!rows.some((rw) => rw.on) && isHyp) rows.push({ cells: [`P: ${N(h.u)}`, Q(N(h.a / h.u, 3)), Q(P1(h.a))], alpha: 1, on: true });
        return { title, headers, rows };
      }
      const dirInf = side > 0 ? '+' : '−';
      const title = lim === 'inf' ? tr('tabInf', { dir: dirInf }) : tr('tabPole', { dir: ctx.t(side > 0 ? 'fromRight' : 'fromLeft') });
      const headers = ['x', 'f(x)', ctx.t('dist')];
      const tab = approachTable(h, lim, side);
      const l = run ? Math.abs(runL(run, now)) : null;
      const back = run ? now - run.t0 > run.d2 : true;
      const rows: TRow[] = tab.map((row, i) => {
        const reached = l === null || back ? 1 : clamp01((l - i) / 0.15 + 1);
        const on = run !== null && !back && l !== null && l >= i - 0.02 && (i === tab.length - 1 || l < i + 1 - 0.02);
        return { cells: [N(row.x, 3), Q(N(row.y, 3)), Q(N(row.dist, 4))], alpha: 0.28 + 0.72 * reached, on };
      });
      return { title, headers, rows };
    }

    function drawTable(r: Rect, now: number, h: Hyperbola & { u: number }, size: number, alpha: number): void {
      const g = surface.g;
      const pad = narrow() ? 10 : 13;
      const { title, headers, rows } = tableData(now, h);
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const tb = fit(title, r.w - 2 * pad, size, th().text, 800);
      tb.draw(g, r.x + pad, r.y + pad + tb.asc);
      const top = r.y + pad + tb.asc + tb.desc + 10;
      const n = rows.length + 1;
      const lh = Math.min(size * 2, Math.max(size * 1.35, (r.y + r.h - pad - top) / n));
      const inner = r.w - 2 * pad;
      const colX = [r.x + pad + inner * 0.3, r.x + pad + inner * 0.64, r.x + pad + inner];
      // Kopfzeile
      headers.forEach((hd, j) => {
        const box = fit(hd, inner * (j === 0 ? 0.3 : 0.34) - 6, size - 0.5, th().muted, 700);
        box.draw(g, colX[j]! - box.w, top + lh / 2 + (box.asc - box.desc) / 2);
      });
      g.strokeStyle = th().dark ? '#2c3648' : '#e3e8ef';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + pad, Math.round(top + lh) + 0.5);
      g.lineTo(r.x + r.w - pad, Math.round(top + lh) + 0.5);
      g.stroke();
      const prodCol = (p.lim as string) === 'off';
      rows.forEach((row, i) => {
        const y = top + lh * (i + 1);
        g.save();
        g.globalAlpha = alpha * row.alpha;
        if (row.on) {
          g.fillStyle = mixColor(C().P, th().bg, 0, th().dark ? 0.2 : 0.13);
          roundRect(g, r.x + pad - 5, y + 2, inner + 10, lh - 4, 7);
          g.fill();
        }
        row.cells.forEach((cell, j) => {
          const color = j === 2 ? (prodCol ? C().rect : C().P) : th().text;
          const box = fit(cell, inner * (j === 0 ? 0.3 : 0.34) - 6, size, color, j === 2 ? 700 : 600);
          box.draw(g, colX[j]! - box.w, y + lh / 2 + (box.asc - box.desc) / 2);
        });
        g.restore();
      });
      g.restore();
    }

    /* ---------- Bild ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;

      if (story && now - story.t0 >= story.end) {
        A.jump(story.to.a);
        B.jump(story.to.b);
        Cc.jump(story.to.c);
        story = null;
      }
      if (story) anim = true;
      anim = A.step(now, dt) || anim;
      anim = B.step(now, dt) || anim;
      anim = Cc.step(now, dt) || anim;
      if (run) {
        if (now - run.t0 >= run.d3) {
          run = null;
          U.jump(uOf(p.u));
        } else {
          U.v = runU(run, now);
          anim = true;
        }
      } else anim = U.step(now, dt) || anim;

      // Rechteck-Geister beim Bewegen von P
      if (p.rect && Math.abs(Math.log(Math.abs(U.v) / Math.abs(lastGhostU))) > 0.2 && !reduced()) {
        ghosts.push({ b: B.v, c: Cc.v, u: lastGhostU, h: A.v / lastGhostU, t: now });
        if (ghosts.length > 14) ghosts.shift();
        lastGhostU = U.v;
      }
      if (Math.sign(U.v) !== Math.sign(lastGhostU)) lastGhostU = U.v;
      if (ghosts.length) anim = true;

      // Einstieg
      let k = { asym: 1, graph: 1, rect: 1, P: 1, labels: 1, cards: 1, stagger: 1 };
      if (intro !== null) {
        const t = now - intro;
        if (t > 2000) intro = null;
        else {
          anim = true;
          k = {
            asym: ease.outCubic(clamp01(t / 700)),
            graph: ease.inOutCubic(clamp01((t - 250) / 1100)),
            rect: ease.outBack(clamp01((t - 1050) / 600)),
            P: ease.outBack(clamp01((t - 1250) / 450)),
            labels: ease.outCubic(clamp01((t - 700) / 700)),
            cards: ease.outCubic(clamp01((t - 200) / 700)),
            stagger: clamp01((t - 450) / 1300),
          };
        }
      }

      const h = shown(now);
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      drawPlot(now, h, k);

      // Karten
      const col = regions().col;
      const gap = 10;
      let size = textSize() + 1;
      const tRows = (p.lim as string) === 'off' ? 6 : 5;
      const tableNeed = (s: number) => 26 + s * 1.4 + tRows * s * 1.5 + 12;
      while (size > 10 && infoHeight(size, col.w) + gap + tableNeed(size) > col.h) size -= 0.5;
      const th0 = Math.min(col.h - gap - infoHeight(size, col.w), tableNeed(size) * 1.22);
      const ih = col.h - gap - th0;
      const slide = (1 - k.cards) * 14;
      drawInfo({ x: col.x + slide, y: col.y, w: col.w, h: ih }, h, size, k.cards, k.stagger);
      drawTable({ x: col.x + slide, y: col.y + ih + gap, w: col.w, h: col.h - ih - gap }, now, h, size, k.cards);

      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge bei Änderungen ---------- */

    function retarget(source: string, changed: ReadonlySet<string>): void {
      const now = performance.now();
      const ua = uOf(p.u);
      if (reduced() || source === 'init') {
        A.jump(p.a);
        B.jump(p.b);
        Cc.jump(p.c);
        U.jump(ua);
        lastGhostU = ua;
        return;
      }
      if (source === 'replace') {
        A.glide(p.a, 750, 0, now);
        B.glide(p.b, 750, 130, now);
        Cc.glide(p.c, 750, 260, now);
        U.glide(ua, 750, 200, now);
        lastGhostU = ua;
        ghosts.length = 0;
        return;
      }
      const tau = dragging() ? 0.05 : 0.2;
      if (changed.has('a')) A.follow(p.a, tau);
      if (changed.has('b')) B.follow(p.b, tau);
      if (changed.has('c')) Cc.follow(p.c, tau);
      if (changed.has('u')) U.follow(ua, dragging() ? 0.04 : 0.22);
    }

    return {
      update(changed, source) {
        const user = source === 'input' || source === 'replace';
        if (user && ['a', 'b', 'c', 'u', 'lim'].some((key) => changed.has(key))) cancelAnims();
        retarget(source, changed);
        if (changed.has('a') && p.a === 0) run = null;
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'steps') {
          cancelAnims();
          if (reduced()) return;
          story = makeStory(now);
        } else if (id === 'inf' || id === 'pole') {
          if (p.a === 0) return;
          if (story) cancelAnims();
          if (p.lim !== id) ctx.set({ lim: id });
          run = null;
          if (reduced()) return;
          U.jump(U.v);
          run = makeRun(id, performance.now());
          lastGhostU = U.v;
        }
        ctx.requestRender();
      },

      render,
      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
