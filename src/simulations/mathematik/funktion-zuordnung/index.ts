import { clamp, defineSimulation, ease, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  analyze,
  countProfile,
  curvePaths,
  curveYs,
  exampleMapping,
  IS_FUNCTION,
  R,
  REVERSE_RULE,
  reverseMapping,
  targetsOf,
  toggleArrow,
  WITNESS,
  type Analysis,
  type CurveId,
  type ExampleId,
  type Mapping,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const isMode = (m: 'map' | 'graph') => (v: Record<string, unknown>) => v.mode === m;

/** Text mit kursiven Variablen. */
interface Seg {
  t: string;
  v?: boolean;
  c?: string;
  w?: number;
}

interface Pill {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DiagramGeo {
  left: Pill[];
  right: Pill[];
  ovalL: { cx: number; cy: number; rx: number; ry: number };
  ovalR: { cx: number; cy: number; rx: number; ry: number };
  titleY: number;
}

const SAMPLES = 520;

/**
 * Funktion oder nicht? Zuordnungen als Pfeildiagramm, Wertetabelle und Graph
 * (synchron, Pfeile antippen oder ziehen) und der senkrechte Linientest an
 * Kurven wie Kreis, liegender Parabel oder Treppenfunktion.
 */
export default defineSimulation({
  id: 'funktion-zuordnung',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Darstellung', 'Representation'),
      options: [
        { value: 'map', label: L('Pfeildiagramm', 'Arrow diagram') },
        { value: 'graph', label: L('Graph & Linientest', 'Graph & line test') },
      ],
      default: 'map',
    },
    {
      key: 'ex',
      type: 'choice',
      label: L('Zuordnung', 'Relation'),
      options: [
        { value: 'square', label: L('x ↦ x²', 'x ↦ x²') },
        { value: 'lin', label: L('x ↦ 2x + 1', 'x ↦ 2x + 1') },
        { value: 'month', label: L('Kind ↦ Monat', 'Child ↦ month') },
        { value: 'own', label: L('Eigene', 'Your own') },
      ],
      default: 'square',
      visibleIf: isMode('map'),
    },
    { key: 'rev', type: 'boolean', label: L('Zuordnung umkehren (Pfeile andersherum)', 'Reverse the relation (arrows the other way)'), default: false, visibleIf: isMode('map') },
    {
      key: 'cur',
      type: 'choice',
      label: L('Graph', 'Graph'),
      options: [
        { value: 'parab', label: L('Parabel', 'Parabola') },
        { value: 'hyp', label: L('Hyperbel', 'Hyperbola') },
        { value: 'step', label: L('Treppe', 'Steps') },
        { value: 'semi', label: L('Halbkreis', 'Semicircle') },
        { value: 'circle', label: L('Kreis', 'Circle') },
        { value: 'sideways', label: L('Liegende Parabel', 'Sideways parabola') },
        { value: 'scurve', label: L('S-Kurve', 'S-curve') },
      ],
      default: 'circle',
      visibleIf: isMode('graph'),
    },
    { key: 'xl', type: 'number', label: L('Senkrechte Gerade bei x =', 'Vertical line at x ='), min: -6, max: 6, step: 0.05, default: 1, visibleIf: isMode('graph') },
    { key: 'pf', type: 'boolean', group: 'view', label: L('Zuordnungspfeile x ↦ y am Graphen', 'Arrows x ↦ y on the graph'), default: true, visibleIf: isMode('graph') },
    { key: 'dw', type: 'boolean', group: 'view', label: L('Definitions- und Wertemenge markieren', 'Mark domain and range'), default: true, visibleIf: isMode('graph') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Urteil „Funktion oder nicht?“ anzeigen', 'Show the verdict “function or not?”'), default: true },
  ],
  actions: [
    { id: 'flip', label: L('Umkehren', 'Reverse'), primary: true, visibleIf: isMode('map') },
    { id: 'clear', label: L('Alle Pfeile löschen', 'Delete all arrows'), visibleIf: isMode('map') },
    { id: 'reset', label: L('Pfeile zurücksetzen', 'Restore arrows'), visibleIf: isMode('map') },
    { id: 'scan', label: L('Linientest abtasten', 'Sweep the line test'), primary: true, visibleIf: isMode('graph') },
  ],
  readouts: [
    { key: 'rule', label: L('Zuordnung', 'Relation') },
    { key: 'table', label: L('Wertetabelle', 'Table of values') },
    { key: 'line', label: L('Senkrechte Gerade', 'Vertical line') },
    { key: 'verdict', label: L('Funktion?', 'Function?'), spoiler: true },
    { key: 'dw', label: L('Definitions- und Wertemenge', 'Domain and range'), spoiler: true },
  ],
  presets: [
    { id: 'square', label: L('Zahl ↦ Quadrat', 'Number ↦ square'), values: {} },
    { id: 'root', label: L('Quadrat ↦ Zahl', 'Square ↦ number'), values: { rev: true } },
    { id: 'monthrev', label: L('Monat ↦ Kind', 'Month ↦ child'), values: { ex: 'month', rev: true } },
    { id: 'circle', label: L('Kreis', 'Circle'), values: { mode: 'graph', cur: 'circle', xl: 1 } },
    { id: 'sideways', label: L('Liegende Parabel', 'Sideways parabola'), values: { mode: 'graph', cur: 'sideways', xl: 2 } },
    { id: 'step', label: L('Treppenfunktion', 'Step function'), values: { mode: 'graph', cur: 'step', xl: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Zuordnung als Pfeildiagramm mit Wertetabelle und Graph bzw. Graph mit senkrechter Gerade für den Linientest',
      tapHint: 'Tippe links, dann rechts (oder ziehe): Pfeil setzen oder entfernen.',
      tableTitle: 'Wertetabelle',
      graphTitle: 'Graph',
      isFn: 'Funktion',
      noFn: 'Keine Funktion',
      fnText: 'Von jedem Element links geht genau ein Pfeil aus – jedem Element ist genau ein Wert zugeordnet.',
      sharedText: 'Dass bei {list} mehrere Pfeile ankommen, ist erlaubt.',
      multiText: 'Von {list} gehen mehrere Pfeile aus – die Zuordnung ist nicht eindeutig.',
      missText: '{list}: kein Pfeil – hier fehlt der zugeordnete Wert.',
      hiddenTitle: 'Funktion oder nicht?',
      hiddenText: 'Prüfe selbst: Geht von jedem Element links genau ein Pfeil aus?',
      hiddenGraph: 'Prüfe selbst mit der senkrechten Geraden: Schneidet sie den Graphen nirgends mehr als einmal?',
      none: '–',
      edited: 'verändert',
      dwText: 'D = {{d}}   W = {{w}}',
      lineTitle: 'Gerade x = {x}',
      count0: 'kein Schnittpunkt',
      count1: '1 Schnittpunkt',
      countN: '{n} Schnittpunkte',
      line0Fn: '{x} gehört nicht zur Definitionsmenge.',
      line0: 'Die Gerade trifft den Graphen hier nicht.',
      lineMany: 'Der Stelle {x} wären {n} Werte zugeordnet.',
      graphFn: 'Funktionsgraph',
      graphNo: 'Kein Funktionsgraph',
      graphFnText: 'Jede senkrechte Gerade schneidet den Graphen höchstens einmal: Jedem x ist höchstens ein y zugeordnet.',
      graphNoText: 'Die Gerade x = {x} schneidet ihn {times}: {pts}. Einem x wären mehrere y zugeordnet.',
      times2: 'zweimal',
      times3: 'dreimal',
      timesN: '{n}-mal',
      ruleTitle: 'Merke',
      ruleText: 'Senkrechter Linientest: Ein Graph gehört genau dann zu einer Funktion, wenn jede Parallele zur y-Achse ihn höchstens einmal schneidet.',
      strip: 'Anzahl der Schnittpunkte',
      stripHint: 'Ziehe die Gerade oder tippe „Linientest abtasten“.',
      dTitle: 'Definitions- und Wertemenge',
      eqTitle: 'Gleichung',
      eq_parab: 'f(x) = 0,5x² − 2',
      eq_hyp: 'f(x) = 2 : x',
      eq_step: 'f(x) = ⌊x⌋',
      note_step: '⌊x⌋: x auf eine ganze Zahl abgerundet',
      eq_semi: 'f(x) = √(9 − x²)',
      eq_circle: 'x² + y² = 9',
      eq_sideways: 'x = 0,5y² − 2',
      eq_scurve: 'x = 0,25y³ − 2y',
      d_parab: 'D = ℝ',
      w_parab: 'W = {y | y ≥ −2}',
      d_hyp: 'D = ℝ \\ {0}',
      w_hyp: 'W = ℝ \\ {0}',
      d_step: 'D = ℝ',
      w_step: 'W = ℤ (ganze Zahlen)',
      d_semi: 'D = {x | −3 ≤ x ≤ 3}',
      w_semi: 'W = {y | 0 ≤ y ≤ 3}',
      dLabel: 'D',
      wLabel: 'W',
      sep: '; ',
      and: ' und ',
      ruleWith: '{rule}',
      sets: 'A = {{a}}, B = {{b}}',
    },
    en: {
      canvas: 'Relation as an arrow diagram with a table of values and a graph, or a graph with a vertical line for the line test',
      tapHint: 'Tap left, then right (or drag): add or remove an arrow.',
      tableTitle: 'Table of values',
      graphTitle: 'Graph',
      isFn: 'Function',
      noFn: 'Not a function',
      fnText: 'Exactly one arrow leaves every element on the left – each element is assigned exactly one value.',
      sharedText: 'Several arrows arriving at {list} is allowed.',
      multiText: 'Several arrows leave {list} – the relation is not unique.',
      missText: '{list}: no arrow – the assigned value is missing.',
      hiddenTitle: 'Function or not?',
      hiddenText: 'Check yourself: does exactly one arrow leave every element on the left?',
      hiddenGraph: 'Check yourself with the vertical line: does it never meet the graph more than once?',
      none: '–',
      edited: 'changed',
      dwText: 'D = {{d}}   R = {{w}}',
      lineTitle: 'Line x = {x}',
      count0: 'no intersection',
      count1: '1 intersection',
      countN: '{n} intersections',
      line0Fn: '{x} is not in the domain.',
      line0: 'The line does not meet the graph here.',
      lineMany: '{n} values would be assigned to {x}.',
      graphFn: 'Graph of a function',
      graphNo: 'Not the graph of a function',
      graphFnText: 'Every vertical line meets the graph at most once: each x is assigned at most one y.',
      graphNoText: 'The line x = {x} meets it {times}: {pts}. One x would get several y.',
      times2: 'twice',
      times3: 'three times',
      timesN: '{n} times',
      ruleTitle: 'Remember',
      ruleText: 'Vertical line test: a graph belongs to a function exactly when every line parallel to the y-axis meets it at most once.',
      strip: 'Number of intersections',
      stripHint: 'Drag the line or press “Sweep the line test”.',
      dTitle: 'Domain and range',
      eqTitle: 'Equation',
      eq_parab: 'f(x) = 0.5x² − 2',
      eq_hyp: 'f(x) = 2 ÷ x',
      eq_step: 'f(x) = ⌊x⌋',
      note_step: '⌊x⌋: x rounded down to a whole number',
      eq_semi: 'f(x) = √(9 − x²)',
      eq_circle: 'x² + y² = 9',
      eq_sideways: 'x = 0.5y² − 2',
      eq_scurve: 'x = 0.25y³ − 2y',
      d_parab: 'D = ℝ',
      w_parab: 'R = {y | y ≥ −2}',
      d_hyp: 'D = ℝ \\ {0}',
      w_hyp: 'R = ℝ \\ {0}',
      d_step: 'D = ℝ',
      w_step: 'R = ℤ (integers)',
      d_semi: 'D = {x | −3 ≤ x ≤ 3}',
      w_semi: 'R = {y | 0 ≤ y ≤ 3}',
      dLabel: 'D',
      wLabel: 'R',
      sep: ', ',
      and: ' and ',
      ruleWith: '{rule}',
      sets: 'A = {{a}}, B = {{b}}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    /** Handy-Layout nur bei schmaler und hoher Fläche (Tablets mit 560–640 px breiter, flacher Fläche bleiben beim Desktop-Layout). */
    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    const mode = () => p.mode as 'map' | 'graph';
    const cur = () => p.cur as CurveId;
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const teal = () => ctx.theme.series[5]!;

    /* ---------- Zustand: Pfeildiagramm ---------- */
    function baseMapping(): Mapping {
      const m = exampleMapping(p.ex as ExampleId);
      return p.rev ? reverseMapping(m, REVERSE_RULE[p.ex as ExampleId]) : m;
    }
    let map: Mapping = baseMapping();
    let info: Analysis = analyze(map);
    let edited = false;
    let selA: number | null = null;
    let hoverEl: { side: 'a' | 'b'; i: number } | null = null;
    let drag: { i: number; px: number; py: number; moved: boolean } | null = null;
    const born = new Map<string, number>();
    let gone: { i: number; j: number; t0: number }[] = [];
    let flip: { from: Mapping; start: number } | null = null;
    const FLIP_MS = 1100;
    const pop = new Tween(600, ease.outBack);

    /* ---------- Zustand: Linientest ---------- */
    let visited: [number, number][] = [];
    /** Abtasten: von der Ausgangsstelle zum linken Rand, gleichmäßig nach rechts, zurück. */
    let scan: { start: number; from: number; x0: number; x1: number; last: number } | null = null;
    const GO_MS = 450;
    const SWEEP_MS = 3200;
    const BACK_MS = 600;
    const SCAN_MS = GO_MS + SWEEP_MS + BACK_MS;
    let lineDrag = false;
    let profile: { key: string; counts: number[] } = { key: '', counts: [] };

    function visit(a: number, b: number): void {
      const lo = Math.min(a, b) - 0.04;
      const hi = Math.max(a, b) + 0.04;
      const all = [...visited, [lo, hi] as [number, number]].sort((u, v) => u[0] - v[0]);
      const out: [number, number][] = [];
      for (const iv of all) {
        const last = out[out.length - 1];
        if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
        else out.push([iv[0], iv[1]]);
      }
      visited = out;
    }
    const isVisited = (x: number) => visited.some(([a, b]) => x >= a && x <= b);

    /* ---------- Aufteilung ---------- */
    function mapRegions(): { diag: Rect; verdict: Rect; table: Rect; chart: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!narrow()) {
        const lw = Math.round(w * 0.5);
        const vh = Math.round(clamp(verdictHeight(lw), 84, 170));
        const th = 118;
        return {
          diag: { x: 0, y: 0, w: lw, h: h - vh - 10 },
          verdict: { x: 0, y: h - vh, w: lw, h: vh },
          table: { x: lw + 12, y: 0, w: w - lw - 12, h: th },
          chart: { x: lw + 12, y: th + 10, w: w - lw - 12, h: h - th - 10 },
        };
      }
      const dh = Math.round(h * 0.39);
      const vh = Math.round(clamp(verdictHeight(w), 70, 150));
      const th = 92;
      return {
        diag: { x: 0, y: 0, w, h: dh },
        verdict: { x: 0, y: dh + 8, w, h: vh },
        table: { x: 0, y: dh + vh + 16, w, h: th },
        chart: { x: 0, y: dh + vh + th + 24, w, h: h - (dh + vh + th + 24) },
      };
    }

    function graphRegions(): { plot: Rect; strip: Rect; panel: Rect } {
      const w = surface.width;
      const h = surface.height;
      const sh = 40;
      if (!narrow()) {
        const pw = Math.round(clamp(w * 0.33, 236, 300));
        return { plot: { x: 0, y: 0, w: w - pw - 12, h: h - sh - 6 }, strip: { x: 0, y: h - sh, w: w - pw - 12, h: sh }, panel: { x: w - pw, y: 0, w: pw, h } };
      }
      const ph = Math.round(Math.min(w * 0.94, h * 0.5));
      return { plot: { x: 0, y: 0, w, h: ph }, strip: { x: 0, y: ph + 6, w, h: sh }, panel: { x: 0, y: ph + sh + 14, w, h: h - ph - sh - 14 } };
    }

    const plot = new Plot(surface, {
      x: [-6.5, 6.5],
      y: [-4.6, 4.6],
      region: () => (mode() === 'graph' ? graphRegions().plot : { x: -500, y: -500, w: 1, h: 1 }),
      pan: false,
      zoom: false,
      controls: false,
    });

    /* ---------- Zeichenhilfen ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.5) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    function tag(x: number, y: number, label: string, color: string, align: 'center' | 'left' | 'right' = 'center', size = 12, filled = false): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const font = `700 ${size}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + size;
      const h = size + 9;
      const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      g.fillStyle = filled ? color : theme.dark ? '#141b26' : '#ffffff';
      roundRect(g, left, y - h / 2, w, h, h / 2);
      g.fill();
      g.restore();
      if (!filled) {
        g.strokeStyle = withAlpha(color, 0.75);
        g.lineWidth = 1.3;
        roundRect(g, left + 0.5, y - h / 2 + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      text(g, label, left + w / 2, y + 0.5, { font, color: filled ? '#ffffff' : color });
      return { x: left, y: y - h / 2, w, h };
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const rows: string[] = [];
      let line = '';
      for (const w of str.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          rows.push(line);
          line = w;
        } else line = next;
      }
      if (line) rows.push(line);
      return rows;
    }

    /** Formeltext: einzelne Buchstaben x, y, f kursiv. */
    function segs(s: string, c?: string): Seg[] {
      return s
        .split(/(?<![A-Za-zÄÖÜäöüß])([xyf])(?![A-Za-zÄÖÜäöüß])/)
        .filter((q) => q.length)
        .map((q) => (q === 'x' || q === 'y' || q === 'f' ? { t: q, v: true, c } : { t: q, c }));
    }

    const segFont = (q: Seg, size: number, weight: number) => (q.v ? `italic ${size * 1.12}px ${ctx.theme.mathFont}` : `${q.w ?? weight} ${size}px ${ctx.theme.font}`);

    function richWidth(list: Seg[], size: number, weight = 650): number {
      const g = surface.g;
      return list.reduce((sum, q) => {
        g.font = segFont(q, size, weight);
        return sum + g.measureText(q.t).width + (q.v ? size * 0.05 : 0);
      }, 0);
    }

    function drawRich(list: Seg[], x: number, y: number, size: number, weight = 650, align: 'left' | 'center' | 'right' = 'left', base = ctx.theme.text): number {
      const g = surface.g;
      const total = richWidth(list, size, weight);
      let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      for (const q of list) {
        const font = segFont(q, size, weight);
        g.font = font;
        text(g, q.t, cx, y, { font, color: q.c ?? base, align: 'left', baseline: 'middle' });
        cx += g.measureText(q.t).width + (q.v ? size * 0.05 : 0);
      }
      return total;
    }

    /** Text in einem Kasten umbrechen und zeichnen; liefert die Höhe. */
    function paragraph(str: string, x: number, y: number, maxW: number, size: number, color: string, weight = 600, draw = true): number {
      const font = `${weight} ${size}px ${ctx.theme.font}`;
      const rows = wrap(str, maxW, font);
      if (draw) rows.forEach((row, i) => text(surface.g, row, x, y + size * 0.7 + i * size * 1.34, { font, color, align: 'left' }));
      return rows.length * size * 1.34;
    }

    const label = (i: { label: Record<'de' | 'en', string> }) => i.label[lang];
    const listText = (items: string[]) => items.join(ctx.t('sep'));
    /** Aufzählung im Satz: „1, 2 und 3“. */
    const listAnd = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')}${ctx.t('and')}${items[items.length - 1]}`);

    /* ---------- Pfeildiagramm: Geometrie ---------- */
    function diagramGeo(m: Mapping, Rr: Rect): DiagramGeo {
      const g = surface.g;
      const small = narrow();
      const titleH = small ? 26 : 32;
      const hintFs = small ? 11 : 12;
      const hintRows = Math.min(2, wrap(ctx.t('tapHint'), Rr.w - 16, `600 ${hintFs}px ${ctx.theme.font}`).length);
      const hintH = hintRows * hintFs * 1.3 + 6;
      const top = Rr.y + titleH + 4;
      const bottom = Rr.y + Rr.h - hintH - 4;
      const ry = (bottom - top) / 2;
      const cy = (top + bottom) / 2;
      const rx = Math.min(Rr.w * 0.17, small ? 64 : 84);
      const cxL = Rr.x + Rr.w * 0.21;
      const cxR = Rr.x + Rr.w * 0.79;
      const fs = small ? 14 : 16;
      g.font = `700 ${fs}px ${ctx.theme.font}`;
      const pills = (items: { label: Record<'de' | 'en', string> }[], cx: number): Pill[] => {
        const n = items.length;
        const step = (ry * 2 * 0.84) / n;
        const h = Math.min(small ? 28 : 34, step * 0.74);
        const w = Math.min(rx * 1.7, Math.max(...items.map((it) => g.measureText(label(it)).width)) + fs * 1.6);
        return items.map((_, i) => ({ x: cx - w / 2, y: cy - ry * 0.84 + step * (i + 0.5) - h / 2, w, h }));
      };
      return {
        left: pills(m.a, cxL),
        right: pills(m.b, cxR),
        ovalL: { cx: cxL, cy, rx, ry },
        ovalR: { cx: cxR, cy, rx, ry },
        titleY: Rr.y + titleH / 2 + 2,
      };
    }

    function arrowPath(a: Pill, b: Pill): { p0: [number, number]; c1: [number, number]; c2: [number, number]; p1: [number, number] } {
      const p0: [number, number] = [a.x + a.w + 3, a.y + a.h / 2];
      const p1: [number, number] = [b.x - 5, b.y + b.h / 2];
      const dx = (p1[0] - p0[0]) * 0.45;
      return { p0, c1: [p0[0] + dx, p0[1]], c2: [p1[0] - dx, p1[1]], p1 };
    }

    function strokeArrow(a: Pill, b: Pill, color: string, width: number, alpha = 1, grow = 1): void {
      const g = surface.g;
      const { p0, c1, c2, p1 } = arrowPath(a, b);
      const bez = (t: number): [number, number] => {
        const u = 1 - t;
        return [u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0], u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]];
      };
      const k = clamp(grow, 0, 1);
      if (k <= 0.01) return;
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      const n = 28;
      for (let i = 0; i <= n; i++) {
        const [x, y] = bez((i / n) * k);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      // Pfeilspitze in Richtung der Kurve
      const [ex, ey] = bez(k);
      const [bx, by] = bez(Math.max(0, k - 0.04));
      const ang = Math.atan2(ey - by, ex - bx);
      const hs = 7 + width * 1.4;
      g.translate(ex, ey);
      g.rotate(ang);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(2, 0);
      g.lineTo(-hs, -hs * 0.5);
      g.lineTo(-hs * 0.75, 0);
      g.lineTo(-hs, hs * 0.5);
      g.closePath();
      g.fill();
      g.restore();
    }

    function drawOval(o: DiagramGeo['ovalL'], color: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.08)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      const grad = g.createLinearGradient(0, o.cy - o.ry, 0, o.cy + o.ry);
      grad.addColorStop(0, withAlpha(color, theme.dark ? 0.16 : 0.08));
      grad.addColorStop(1, withAlpha(color, theme.dark ? 0.08 : 0.04));
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      g.beginPath();
      g.ellipse(o.cx, o.cy, o.rx, o.ry, 0, 0, Math.PI * 2);
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = grad;
      g.fill();
      g.strokeStyle = withAlpha(color, 0.45);
      g.lineWidth = 1.6;
      g.stroke();
      g.restore();
    }

    function drawPill(pl: Pill, str: string, color: string, state: { sel?: boolean; hover?: boolean; bad?: boolean; dim?: boolean; good?: boolean }): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      const fs = small ? 14 : 16;
      g.save();
      g.globalAlpha = state.dim ? 0.55 : 1;
      if (state.sel) {
        g.shadowColor = withAlpha(color, 0.7);
        g.shadowBlur = 14;
      } else {
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.14)';
        g.shadowBlur = 5;
        g.shadowOffsetY = 1.5;
      }
      g.fillStyle = theme.dark ? '#1b2432' : '#ffffff';
      roundRect(g, pl.x, pl.y, pl.w, pl.h, pl.h / 2);
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = withAlpha(color, state.sel ? 0.28 : state.hover ? 0.2 : theme.dark ? 0.14 : 0.1);
      g.fill();
      g.strokeStyle = state.bad ? red() : withAlpha(color, state.sel ? 1 : 0.7);
      g.lineWidth = state.sel || state.bad ? 2.4 : 1.5;
      if (state.bad) g.setLineDash([5, 3]);
      roundRect(g, pl.x + 0.5, pl.y + 0.5, pl.w - 1, pl.h - 1, pl.h / 2);
      g.stroke();
      g.setLineDash([]);
      text(g, str, pl.x + pl.w / 2, pl.y + pl.h / 2 + 0.5, { font: `700 ${fs}px ${theme.font}`, color: theme.text });
      g.restore();
    }

    /** Kleines Abzeichen (Haken, Fragezeichen, Zahl) an einem Element. */
    function badge(x: number, y: number, str: string, color: string): void {
      const g = surface.g;
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = ctx.theme.bg;
      g.stroke();
      text(g, str, x, y + 0.5, { font: `800 11px ${ctx.theme.font}`, color: '#ffffff' });
    }

    function arrowColor(i: number, an: Analysis): string {
      if (!p.show) return blue();
      return an.out[i]! > 1 ? red() : green();
    }

    function drawDiagram(Rr: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      const geo = diagramGeo(map, Rr);
      const flipT = flip ? clamp((now - flip.start) / FLIP_MS, 0, 1) : 1;
      const k = ease.inOutCubic(flipT);
      drawOval(geo.ovalL, blue());
      drawOval(geo.ovalR, purple());
      // Titel der Mengen (beim Umkehren überblendet)
      const titles = (m: Mapping, alpha: number) => {
        g.save();
        g.globalAlpha = alpha;
        const fs = small ? 13 : 14;
        text(g, label({ label: m.titleA }), geo.ovalL.cx, geo.titleY, { font: `750 ${fs}px ${theme.font}`, color: blue() });
        text(g, label({ label: m.titleB }), geo.ovalR.cx, geo.titleY, { font: `750 ${fs}px ${theme.font}`, color: purple() });
        g.restore();
      };
      if (flip && flipT < 1) {
        titles(flip.from, 1 - clamp(k * 2, 0, 1));
        titles(map, clamp(k * 2 - 1, 0, 1));
      } else titles(map, 1);

      if (flip && flipT < 1) {
        // Umkehren: Elemente wechseln die Seite, Pfeile blenden um
        const from = flip.from;
        const geoOld = diagramGeo(from, Rr);
        const oldAn = analyze(from);
        const fadeOld = 1 - clamp(k * 3, 0, 1);
        const fadeNew = clamp(k * 3 - 2, 0, 1);
        if (fadeOld > 0) from.arrows.forEach(([i, j]) => strokeArrow(geoOld.left[i]!, geoOld.right[j]!, arrowColor(i, oldAn), 2.4, fadeOld));
        if (fadeNew > 0) map.arrows.forEach(([i, j]) => strokeArrow(geo.left[i]!, geo.right[j]!, arrowColor(i, info), 2.4, fadeNew));
        const mix = (a: Pill, b: Pill, lift: number): Pill => ({
          x: a.x + (b.x - a.x) * k,
          y: a.y + (b.y - a.y) * k + Math.sin(Math.PI * k) * lift,
          w: a.w + (b.w - a.w) * k,
          h: a.h + (b.h - a.h) * k,
        });
        from.a.forEach((it, i) => drawPill(mix(geoOld.left[i]!, geo.right[i]!, -26), label(it), k < 0.5 ? blue() : purple(), {}));
        from.b.forEach((it, j) => drawPill(mix(geoOld.right[j]!, geo.left[j]!, 26), label(it), k < 0.5 ? purple() : blue(), {}));
        return;
      }

      // Pfeile (verschwindende zuerst)
      gone = gone.filter((q) => now - q.t0 < 260);
      for (const q of gone) {
        const a = geo.left[q.i];
        const b = geo.right[q.j];
        if (a && b) strokeArrow(a, b, theme.muted, 2.2, 1 - (now - q.t0) / 260);
      }
      const focus = drag ? drag.i : hoverEl?.side === 'a' ? hoverEl.i : selA;
      map.arrows.forEach(([i, j]) => {
        const t0 = born.get(`${i}-${j}`);
        const grow = t0 === undefined || reduced ? 1 : ease.outCubic(clamp((now - t0) / 380, 0, 1));
        const strong = focus === i;
        strokeArrow(geo.left[i]!, geo.right[j]!, arrowColor(i, info), strong ? 3.4 : 2.4, focus === null || strong ? 1 : 0.35, grow);
      });
      // Gummiband beim Ziehen
      if (drag && drag.moved) {
        const a = geo.left[drag.i]!;
        g.save();
        g.strokeStyle = orange();
        g.lineWidth = 2.6;
        g.setLineDash([7, 5]);
        g.beginPath();
        g.moveTo(a.x + a.w + 3, a.y + a.h / 2);
        g.lineTo(drag.px, drag.py);
        g.stroke();
        g.setLineDash([]);
        g.beginPath();
        g.arc(drag.px, drag.py, 5, 0, Math.PI * 2);
        g.fillStyle = orange();
        g.fill();
        g.restore();
      }
      // Elemente
      const overB = drag ? hitSide(drag.px, drag.py, geo)?.side === 'b' : false;
      map.a.forEach((it, i) => {
        const bad = p.show && info.out[i] !== 1;
        drawPill(geo.left[i]!, label(it), blue(), { sel: selA === i || drag?.i === i, hover: hoverEl?.side === 'a' && hoverEl.i === i, bad });
        if (p.show) {
          const pl = geo.left[i]!;
          const cnt = info.out[i]!;
          if (cnt === 0) badge(pl.x + 2, pl.y + 2, '?', red());
          else if (cnt > 1) badge(pl.x + 2, pl.y + 2, String(cnt), red());
        }
      });
      map.b.forEach((it, j) => {
        const hovered = (hoverEl?.side === 'b' && hoverEl.i === j) || (overB && drag && hitSide(drag.px, drag.py, geo)?.i === j);
        const inRange = info.in[j]! > 0;
        drawPill(geo.right[j]!, label(it), purple(), { hover: !!hovered, dim: p.show && info.isFunction && !inRange, sel: !!hovered && !!drag });
      });
      // Hinweis unten
      const hint = ctx.t('tapHint');
      const fs = small ? 11 : 12;
      const rows = wrap(hint, Rr.w - 16, `600 ${fs}px ${theme.font}`).slice(0, 2);
      rows.forEach((row, i) => text(g, row, Rr.x + Rr.w / 2, Rr.y + Rr.h - fs * 0.8 - (rows.length - 1 - i) * fs * 1.3, { font: `600 ${fs}px ${theme.font}`, color: theme.muted }));
    }

    function hitSide(px: number, py: number, geo: DiagramGeo): { side: 'a' | 'b'; i: number } | null {
      const inside = (pl: Pill) => px >= pl.x - 8 && px <= pl.x + pl.w + 8 && py >= pl.y - 5 && py <= pl.y + pl.h + 5;
      const ia = geo.left.findIndex(inside);
      if (ia >= 0) return { side: 'a', i: ia };
      const ib = geo.right.findIndex(inside);
      if (ib >= 0) return { side: 'b', i: ib };
      return null;
    }

    /* ---------- Wertetabelle ---------- */
    function cellText(i: number): { text: string; bad: boolean } {
      const ts = targetsOf(map, i);
      if (!ts.length) return { text: ctx.t('none'), bad: true };
      return { text: listText(ts.map((j) => label(map.b[j]!))), bad: ts.length > 1 };
    }

    function drawTable(Rr: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      card(Rr);
      const pad = small ? 10 : 12;
      const fsT = small ? 11 : 12;
      text(g, ctx.t('tableTitle').toUpperCase(), Rr.x + pad, Rr.y + pad + 5, { font: `750 ${fsT}px ${theme.font}`, color: theme.muted, align: 'left' });
      const top = Rr.y + pad + 18;
      const rowH = (Rr.y + Rr.h - pad - top) / 2;
      const fs = small ? 13 : 14.5;
      const n = map.a.length;
      const headOf = (size: number) => {
        g.font = `750 ${size}px ${theme.font}`;
        return Math.max(g.measureText(label({ label: map.titleA })).width, g.measureText(label({ label: map.titleB })).width) + 18;
      };
      // Bei engen Spalten (Tablet) die Kopfspalte mit kleinerer Schrift setzen
      let fsHead = fs;
      let headW = headOf(fsHead);
      if ((Rr.w - 2 * pad - headW) / n < 46) {
        fsHead = Math.max(11, fs * 0.8);
        headW = headOf(fsHead);
      }
      const colW = (Rr.w - 2 * pad - headW) / n;
      // Kopfspalte
      const rowY = (r: number) => top + r * rowH;
      g.fillStyle = withAlpha(blue(), theme.dark ? 0.16 : 0.08);
      roundRect(g, Rr.x + pad, rowY(0), Rr.w - 2 * pad, rowH, 6);
      g.fill();
      text(g, label({ label: map.titleA }), Rr.x + pad + 8, rowY(0) + rowH / 2, { font: `750 ${fsHead}px ${theme.font}`, color: blue(), align: 'left' });
      text(g, label({ label: map.titleB }), Rr.x + pad + 8, rowY(1) + rowH / 2, { font: `750 ${fsHead}px ${theme.font}`, color: purple(), align: 'left' });
      g.strokeStyle = theme.dark ? '#2b3545' : '#dfe4ea';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(Rr.x + pad + headW, rowY(0));
      g.lineTo(Rr.x + pad + headW, rowY(2));
      g.stroke();
      const focus = drag ? drag.i : hoverEl?.side === 'a' ? hoverEl.i : selA;
      map.a.forEach((it, i) => {
        const cx = Rr.x + pad + headW + colW * (i + 0.5);
        if (focus === i) {
          g.fillStyle = withAlpha(orange(), theme.dark ? 0.2 : 0.12);
          roundRect(g, cx - colW / 2 + 2, rowY(0) + 1, colW - 4, rowH * 2 - 2, 6);
          g.fill();
        }
        const fA = fitFont(label(it), colW - 6, fs, 700);
        text(g, label(it), cx, rowY(0) + rowH / 2, { font: fA, color: theme.text });
        const c = cellText(i);
        const ts = targetsOf(map, i);
        g.font = `700 ${fs}px ${theme.font}`;
        const color = p.show && c.bad ? red() : theme.text;
        if (ts.length > 1 && g.measureText(c.text).width > colW - 8) {
          const fz = Math.min(fs * 0.86, (rowH - 2) / (ts.length * 1.08));
          ts.forEach((j, k) => {
            const yy = rowY(1) + rowH / 2 + (k - (ts.length - 1) / 2) * fz * 1.08;
            text(g, label(map.b[j]!), cx, yy, { font: fitFont(label(map.b[j]!), colW - 6, fz, 700), color });
          });
        } else text(g, c.text, cx, rowY(1) + rowH / 2, { font: fitFont(c.text, colW - 6, fs, 700), color });
        if (i > 0) {
          g.strokeStyle = theme.dark ? '#253041' : '#edf0f4';
          g.beginPath();
          g.moveTo(cx - colW / 2, rowY(0) + 4);
          g.lineTo(cx - colW / 2, rowY(2) - 4);
          g.stroke();
        }
      });
    }

    function fitFont(str: string, maxW: number, size: number, weight: number): string {
      const g = surface.g;
      let fs = size;
      g.font = `${weight} ${fs}px ${ctx.theme.font}`;
      const w = g.measureText(str).width;
      if (w > maxW) fs = Math.max(9.5, (fs * maxW) / w);
      return `${weight} ${fs}px ${ctx.theme.font}`;
    }

    /* ---------- Graph der Zuordnung (Punkte) ---------- */
    function drawRelChart(Rr: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      card(Rr);
      const pad = small ? 10 : 12;
      const fsT = small ? 11 : 12;
      text(g, ctx.t('graphTitle').toUpperCase(), Rr.x + pad, Rr.y + pad + 5, { font: `750 ${fsT}px ${theme.font}`, color: theme.muted, align: 'left' });
      const fs = small ? 11.5 : 12.5;
      g.font = `700 ${fs}px ${theme.font}`;
      const yLabW = Math.max(...map.b.map((it) => g.measureText(label(it)).width)) + 12;
      const area = { x: Rr.x + pad + yLabW, y: Rr.y + pad + 36, w: Rr.w - 2 * pad - yLabW - 14, h: Rr.h - pad * 2 - 36 - 30 };
      // Lage der Elemente (Zahlen maßstäblich, sonst gleichmäßig)
      const pos = (items: Mapping['a'], len: number): number[] => {
        if (map.numeric && items.every((it) => it.value !== undefined)) {
          const vs = items.map((it) => it.value!);
          const lo = Math.min(...vs);
          const hi = Math.max(...vs);
          return vs.map((v) => (hi === lo ? 0.5 : 0.08 + (0.84 * (v - lo)) / (hi - lo)) * len);
        }
        return items.map((_, i) => ((i + 0.5) / items.length) * len);
      };
      const xs = pos(map.a, area.w).map((v) => area.x + v);
      const ys = pos(map.b, area.h).map((v) => area.y + area.h - v);
      // Gitter und Achsen
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      g.beginPath();
      xs.forEach((x) => {
        g.moveTo(Math.round(x) + 0.5, area.y);
        g.lineTo(Math.round(x) + 0.5, area.y + area.h);
      });
      ys.forEach((y) => {
        g.moveTo(area.x, Math.round(y) + 0.5);
        g.lineTo(area.x + area.w, Math.round(y) + 0.5);
      });
      g.stroke();
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(area.x, area.y - 6);
      g.lineTo(area.x, area.y + area.h);
      g.lineTo(area.x + area.w + 8, area.y + area.h);
      g.stroke();
      g.fillStyle = theme.axis;
      g.beginPath();
      g.moveTo(area.x + area.w + 12, area.y + area.h);
      g.lineTo(area.x + area.w + 3, area.y + area.h - 4);
      g.lineTo(area.x + area.w + 3, area.y + area.h + 4);
      g.fill();
      g.beginPath();
      g.moveTo(area.x, area.y - 10);
      g.lineTo(area.x - 4, area.y - 1);
      g.lineTo(area.x + 4, area.y - 1);
      g.fill();
      map.a.forEach((it, i) => text(g, label(it), xs[i]!, area.y + area.h + 12, { font: fitFont(label(it), Math.max(24, area.w / map.a.length - 2), fs, 700), color: blue() }));
      map.b.forEach((it, j) => text(g, label(it), area.x - 7, ys[j]!, { font: `700 ${fs}px ${theme.font}`, color: purple(), align: 'right' }));
      text(g, label({ label: map.titleA }), area.x + area.w + 12, area.y + area.h + 26, { font: `750 ${fs}px ${theme.font}`, color: blue(), align: 'right' });
      text(g, label({ label: map.titleB }), area.x + 10, area.y - 9, { font: `750 ${fs}px ${theme.font}`, color: purple(), align: 'left' });
      // Senkrechter Linientest an den Spalten
      const focus = drag ? drag.i : hoverEl?.side === 'a' ? hoverEl.i : selA;
      map.a.forEach((_, i) => {
        const x = xs[i]!;
        const cnt = info.out[i]!;
        if (focus === i) {
          g.fillStyle = withAlpha(orange(), theme.dark ? 0.2 : 0.12);
          g.fillRect(x - 9, area.y, 18, area.h);
        }
        if (!p.show) return;
        if (cnt > 1) {
          g.fillStyle = withAlpha(red(), theme.dark ? 0.2 : 0.12);
          roundRect(g, x - 10, area.y - 2, 20, area.h + 4, 8);
          g.fill();
          g.strokeStyle = withAlpha(red(), 0.85);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x, area.y);
          g.lineTo(x, area.y + area.h);
          g.stroke();
        } else if (cnt === 0) {
          g.strokeStyle = withAlpha(red(), 0.7);
          g.lineWidth = 1.6;
          g.setLineDash([4, 4]);
          g.beginPath();
          g.moveTo(x, area.y);
          g.lineTo(x, area.y + area.h);
          g.stroke();
          g.setLineDash([]);
          badge(x, area.y + area.h - 12, '?', red());
        }
      });
      // Punkte
      map.arrows.forEach(([i, j]) => {
        const x = xs[i]!;
        const y = ys[j]!;
        const c = arrowColor(i, info);
        g.beginPath();
        g.arc(x, y, focus === i ? 7.5 : 6, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = theme.bg;
        g.stroke();
      });
    }

    /* ---------- Urteil (Pfeildiagramm) ---------- */
    function verdictLines(): { title: string; color: string; lines: string[]; ok: boolean | null } {
      if (!p.show) return { title: ctx.t('hiddenTitle'), color: orange(), lines: [ctx.t('hiddenText')], ok: null };
      const nameA = (i: number) => label(map.a[i]!);
      const nameB = (j: number) => label(map.b[j]!);
      if (info.isFunction) {
        const lines = [ctx.t('fnText')];
        if (info.shared.length) lines.push(tr('sharedText', { list: listAnd(info.shared.map(nameB)) }));
        return { title: ctx.t('isFn'), color: green(), lines, ok: true };
      }
      const lines: string[] = [];
      if (info.multi.length) lines.push(tr('multiText', { list: listAnd(info.multi.map(nameA)) }));
      if (info.missing.length) lines.push(tr('missText', { list: listAnd(info.missing.map(nameA)) }));
      return { title: ctx.t('noFn'), color: red(), lines, ok: false };
    }

    function dwText(): string | null {
      if (!info.isFunction) return null;
      return tr('dwText', { d: listText(map.a.map((it) => label(it))), w: listText(info.range.map((j) => label(map.b[j]!))) });
    }

    /** Benötigte Höhe der Urteilskarte bei Breite w. */
    function verdictHeight(w: number): number {
      const small = narrow();
      const pad = small ? 10 : 12;
      const icon = 13;
      const tw = w - 2 * pad - icon * 2 - 10;
      const fs = small ? 11.5 : 12.5;
      const v = verdictLines();
      const dw = p.show ? dwText() : null;
      let h = pad + icon - 1 + 12;
      for (const line of v.lines) h += paragraph(line, 0, 0, tw, fs, '', 600, false) + 2;
      if (dw) h += fs * 1.5 + 2;
      return h + pad;
    }

    function drawVerdict(Rr: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      const v = verdictLines();
      const k = pop.running ? clamp(pop.value, 0.5, 1.15) : 1;
      card(Rr, v.color, 0.05);
      const pad = small ? 10 : 12;
      const icon = 13;
      const ix = Rr.x + pad + icon;
      const iy = Rr.y + pad + icon - 1;
      g.save();
      g.translate(ix, iy);
      g.scale(k, k);
      g.beginPath();
      g.arc(0, 0, icon, 0, Math.PI * 2);
      g.fillStyle = v.color;
      g.fill();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      if (v.ok === true) {
        g.moveTo(-5.5, 0.5);
        g.lineTo(-1.5, 4.5);
        g.lineTo(6, -4);
      } else if (v.ok === false) {
        g.moveTo(-4.5, -4.5);
        g.lineTo(4.5, 4.5);
        g.moveTo(4.5, -4.5);
        g.lineTo(-4.5, 4.5);
      }
      g.stroke();
      if (v.ok === null) text(g, '?', 0, 1, { font: `800 16px ${theme.font}`, color: '#ffffff' });
      g.restore();
      const tx = Rr.x + pad + icon * 2 + 10;
      const tw = Rr.x + Rr.w - pad - tx;
      text(g, v.title, tx, iy, { font: `800 ${small ? 15 : 16}px ${theme.font}`, color: v.color, align: 'left' });
      let y = iy + 12;
      const fs = small ? 11.5 : 12.5;
      const dw = p.show ? dwText() : null;
      const all = dw ? [...v.lines, dw] : v.lines;
      for (const line of all) {
        const isDw = line === dw;
        const h = isDw ? fs * 1.5 : paragraph(line, tx, y, tw, fs, theme.text, 600, false);
        if (y + h > Rr.y + Rr.h - 4) break;
        if (isDw) drawRich(segs(line), tx, y + fs * 0.75, fs + 0.5, 700, 'left', purple());
        else paragraph(line, tx, y, tw, fs, theme.text, 600);
        y += h + 2;
      }
    }

    /* ---------- Linientest ---------- */
    const lineX = (now: number) => {
      if (!scan) return p.xl;
      let t = now - scan.start;
      if (t < GO_MS) return scan.from + (scan.x0 - scan.from) * ease.inOutCubic(t / GO_MS);
      t -= GO_MS;
      if (t < SWEEP_MS) return scan.x0 + ((scan.x1 - scan.x0) * t) / SWEEP_MS;
      t -= SWEEP_MS;
      return scan.x1 + (scan.from - scan.x1) * ease.inOutCubic(clamp(t / BACK_MS, 0, 1));
    };
    const countColor = (n: number) => (n === 1 ? green() : n === 0 ? ctx.theme.muted : red());
    /** Runden wie in der Schule (bei 5 vom Nullpunkt weg: −0,875 ≈ −0,88). */
    const round = (v: number, d = 2) => (Math.sign(v) * Math.round(Math.abs(v) * 10 ** d + 1e-9)) / 10 ** d;
    const nf = (v: number, d = 2) => fmt.num(round(v, d), d);
    /** „=“ bei exakten, „≈“ bei gerundeten Werten. */
    const rel = (v: number) => (Math.abs(round(v) - v) > 1e-9 ? '≈' : '=');
    const ptText = (x: number, y: number) => fmt.point(round(x), round(y));

    function drawCurve(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const id = cur();
      const c = blue();
      for (const path of curvePaths(id)) {
        g.save();
        g.shadowColor = withAlpha(c, theme.dark ? 0.5 : 0.3);
        g.shadowBlur = 6;
        plot.polyline(path, { color: c, width: 3.4 });
        g.restore();
      }
      if (id === 'step') {
        const b = plot.bounds;
        for (let k = Math.floor(b.xMin) - 1; k <= Math.ceil(b.xMax); k++) {
          plot.point(k, k, { color: c, radius: 5 });
          plot.point(k + 1, k, { color: c, radius: 5, hollow: true });
        }
      }
    }

    /** Definitions- und Wertemenge als Bänder auf den Achsen. */
    function drawDW(): void {
      if (!p.dw || !IS_FUNCTION[cur()] || !p.show) return;
      const g = surface.g;
      const b = plot.bounds;
      const id = cur();
      const dC = teal();
      const wC = purple();
      const band = (axis: 'x' | 'y', lo: number, hi: number, color: string) => {
        const a = Math.max(lo, axis === 'x' ? b.xMin : b.yMin);
        const z = Math.min(hi, axis === 'x' ? b.xMax : b.yMax);
        if (!(z > a)) return;
        g.save();
        g.strokeStyle = withAlpha(color, 0.6);
        g.lineWidth = 8;
        g.lineCap = 'butt';
        g.beginPath();
        if (axis === 'x') {
          g.moveTo(plot.px(a), plot.py(0));
          g.lineTo(plot.px(z), plot.py(0));
        } else {
          g.moveTo(plot.px(0), plot.py(a));
          g.lineTo(plot.px(0), plot.py(z));
        }
        g.stroke();
        g.restore();
      };
      const end = (axis: 'x' | 'y', v: number, color: string, filled: boolean) => {
        const [x, y] = axis === 'x' ? plot.toPx(v, 0) : plot.toPx(0, v);
        g.beginPath();
        g.arc(x, y, 5.5, 0, Math.PI * 2);
        g.fillStyle = filled ? color : ctx.theme.bg;
        g.fill();
        g.lineWidth = 2.2;
        g.strokeStyle = color;
        g.stroke();
      };
      const BIG = 1e3;
      if (id === 'parab') {
        band('x', -BIG, BIG, dC);
        band('y', -2, BIG, wC);
        end('y', -2, wC, true);
      } else if (id === 'hyp') {
        band('x', -BIG, BIG, dC);
        band('y', -BIG, BIG, wC);
        end('x', 0, dC, false);
        end('y', 0, wC, false);
      } else if (id === 'step') {
        band('x', -BIG, BIG, dC);
        for (let k = Math.ceil(b.yMin); k <= Math.floor(b.yMax); k++) {
          const [x, y] = plot.toPx(0, k);
          g.beginPath();
          g.arc(x, y, 4.5, 0, Math.PI * 2);
          g.fillStyle = withAlpha(wC, 0.85);
          g.fill();
        }
      } else if (id === 'semi') {
        band('x', -R, R, dC);
        band('y', 0, R, wC);
        end('x', -R, dC, true);
        end('x', R, dC, true);
        end('y', 0, wC, true);
        end('y', R, wC, true);
      }
      const r = plot.rect;
      tag(r.x + 18, plot.py(0) - 16, ctx.t('dLabel'), dC, 'center', 12, true);
      tag(plot.px(0) - 16, r.y + 48, ctx.t('wLabel'), wC, 'center', 12, true);
    }

    function drawLineTest(now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = plot.rect;
      const x = lineX(now);
      const ys = curveYs(cur(), x);
      const n = ys.length;
      const c = countColor(n);
      const px = plot.px(x);
      // Gerade mit weichem Schein
      g.save();
      g.strokeStyle = withAlpha(c, 0.18);
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(px, r.y);
      g.lineTo(px, r.y + r.h);
      g.stroke();
      g.strokeStyle = c;
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(px, r.y);
      g.lineTo(px, r.y + r.h);
      g.stroke();
      g.restore();
      // Zuordnungspfeile x ↦ y
      if (p.pf) {
        const ax = plot.py(0);
        ys.forEach((y) => {
          const py = plot.py(y);
          if (py < r.y - 4 || py > r.y + r.h + 4) return;
          g.save();
          g.strokeStyle = withAlpha(c, 0.9);
          g.fillStyle = withAlpha(c, 0.9);
          g.lineWidth = 2;
          g.setLineDash([6, 4]);
          g.beginPath();
          g.moveTo(px + 0.01, ax);
          g.lineTo(px, py + (py < ax ? 9 : -9));
          g.moveTo(px + (plot.px(0) < px ? -9 : 9), py);
          g.lineTo(plot.px(0) + (plot.px(0) < px ? 9 : -9), py);
          g.stroke();
          g.setLineDash([]);
          const head = (hx: number, hy: number, ang: number) => {
            g.save();
            g.translate(hx, hy);
            g.rotate(ang);
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(-10, -5);
            g.lineTo(-10, 5);
            g.closePath();
            g.fill();
            g.restore();
          };
          if (Math.abs(py - ax) > 14) head(px, py + (py < ax ? 7 : -7), py < ax ? -Math.PI / 2 : Math.PI / 2);
          if (Math.abs(plot.px(0) - px) > 18) head(plot.px(0) + (plot.px(0) < px ? 2 : -2), py, plot.px(0) < px ? Math.PI : 0);
          g.restore();
          if (Math.abs(plot.px(0) - px) > 30) tag(plot.px(0) + (plot.px(0) < px ? -8 : 8), py, nf(y), c, plot.px(0) < px ? 'right' : 'left', 11.5);
        });
      }
      // Schnittpunkte
      ys.forEach((y) => {
        const [qx, qy] = plot.toPx(x, y);
        if (qy < r.y - 8 || qy > r.y + r.h + 8) return;
        g.beginPath();
        g.arc(qx, qy, 13, 0, Math.PI * 2);
        g.fillStyle = withAlpha(c, 0.2);
        g.fill();
        g.beginPath();
        g.arc(qx, qy, 7, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = theme.bg;
        g.stroke();
      });
      // Anzahl oben, Griff unten
      const label = n === 0 ? ctx.t('count0') : n === 1 ? ctx.t('count1') : tr('countN', { n });
      g.font = `700 12px ${theme.font}`;
      const lw = g.measureText(label).width + 12;
      const gy = r.y + r.h - 18;
      tag(clamp(px, r.x + lw / 2 + 4, r.x + r.w - lw / 2 - 4), gy - 27, label, c, 'center', 12, n !== 0);
      const xl = `x = ${nf(x)}`;
      g.font = `700 12px ${theme.font}`;
      const gw = g.measureText(xl).width + 34;
      const gx = clamp(px, r.x + gw / 2 + 3, r.x + r.w - gw / 2 - 3);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = c;
      roundRect(g, gx - gw / 2, gy - 12, gw, 24, 12);
      g.fill();
      g.restore();
      text(g, `‹ ${xl} ›`, gx, gy + 0.5, { font: `700 12px ${theme.font}`, color: '#ffffff' });
    }

    function drawStrip(Rr: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const b = plot.bounds;
      const key = `${cur()}|${b.xMin.toFixed(4)}|${b.xMax.toFixed(4)}`;
      if (profile.key !== key) profile = { key, counts: countProfile(cur(), b.xMin, b.xMax, SAMPLES) };
      const pr = plot.rect;
      const bar = { x: pr.x, y: Rr.y + 4, w: pr.w, h: Rr.h - 8 };
      g.save();
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.04)' : 'rgba(16,24,40,0.04)';
      roundRect(g, bar.x, bar.y, bar.w, bar.h, 8);
      g.fill();
      g.clip();
      // Abschnitte gleicher Anzahl (nur besuchte Stellen)
      const counts = profile.counts;
      let i = 0;
      const segsDone: { a: number; z: number; n: number }[] = [];
      while (i <= SAMPLES) {
        const xi = b.xMin + ((b.xMax - b.xMin) * i) / SAMPLES;
        if (!isVisited(xi)) {
          i++;
          continue;
        }
        const nn = counts[i]!;
        let j = i;
        while (j + 1 <= SAMPLES && counts[j + 1] === nn && isVisited(b.xMin + ((b.xMax - b.xMin) * (j + 1)) / SAMPLES)) j++;
        segsDone.push({ a: i, z: j, n: nn });
        i = j + 1;
      }
      const px = (k: number) => bar.x + (bar.w * k) / SAMPLES;
      for (const s of segsDone) {
        const x0 = px(s.a - 0.5);
        const x1 = px(s.z + 0.5);
        g.fillStyle = withAlpha(countColor(s.n), s.n === 0 ? 0.22 : theme.dark ? 0.5 : 0.36);
        g.fillRect(x0, bar.y, x1 - x0, bar.h);
        if (x1 - x0 > 16) text(g, String(s.n), (x0 + x1) / 2, bar.y + bar.h / 2 + 0.5, { font: `800 12px ${theme.font}`, color: s.n === 0 ? theme.muted : theme.text });
      }
      g.restore();
      g.strokeStyle = theme.dark ? '#2b3545' : '#d5dce5';
      g.lineWidth = 1;
      roundRect(g, bar.x + 0.5, bar.y + 0.5, bar.w - 1, bar.h - 1, 8);
      g.stroke();
      if (!segsDone.length || (visited.length === 1 && visited[0]![1] - visited[0]![0] < 0.3 && !scan)) {
        const hf = `600 ${narrow() ? 11 : 11.5}px ${theme.font}`;
        g.font = hf;
        const long = `${ctx.t('strip')}: ${ctx.t('stripHint')}`;
        text(g, g.measureText(long).width <= bar.w - 16 ? long : ctx.t('stripHint'), bar.x + bar.w / 2, bar.y + bar.h / 2, { font: hf, color: theme.muted });
      } else text(g, ctx.t('strip'), bar.x + 8, bar.y - 0.5, { font: `700 10px ${theme.font}`, color: theme.muted, align: 'left', baseline: 'bottom' });
      // Marke der aktuellen Stelle
      const mx = plot.px(lineX(now));
      g.fillStyle = theme.text;
      g.beginPath();
      g.moveTo(mx, bar.y + 1);
      g.lineTo(mx - 5, bar.y - 5);
      g.lineTo(mx + 5, bar.y - 5);
      g.fill();
    }

    /* ---------- Karten (Linientest) ---------- */
    interface Block {
      h: number;
      draw(x: number, y: number, w: number): void;
    }

    function titleBlock(str: string, color?: string, upper = true): Block {
      const fs = narrow() ? 11 : 12;
      return { h: fs + 9, draw: (x, y) => text(surface.g, upper ? str.toUpperCase() : str, x, y + fs / 2 + 2, { font: `750 ${upper ? fs : fs + 1}px ${ctx.theme.font}`, color: color ?? ctx.theme.muted, align: 'left' }) };
    }
    function richBlock(list: Seg[], size: number, maxW: number, color?: string): Block {
      let fs = size;
      const w = richWidth(list, fs, 700);
      if (w > maxW) fs = Math.max(10.5, (fs * maxW) / w);
      return { h: fs * 1.55, draw: (x, y) => drawRich(list, x, y + fs * 0.78, fs, 700, 'left', color) };
    }
    function textBlock(str: string, maxW: number, color?: string, size?: number, weight = 600): Block {
      const fs = size ?? (narrow() ? 11.5 : 12.5);
      const h = paragraph(str, 0, 0, maxW, fs, '', weight, false) + 3;
      return { h, draw: (x, y) => paragraph(str, x, y, maxW, fs, color ?? ctx.theme.muted, weight) };
    }
    function blocksHeight(bs: Block[]): number {
      return bs.reduce((s, b) => s + b.h, 0);
    }
    function drawBlocks(Rr: Rect, bs: Block[], pad: number, accent?: string, tint = 0): void {
      card(Rr, accent, tint);
      let y = Rr.y + pad - 2;
      for (const b of bs) {
        if (y + b.h > Rr.y + Rr.h + 2) break;
        b.draw(Rr.x + pad, y, Rr.w - 2 * pad);
        y += b.h;
      }
    }

    function linePanel(w: number, now: number): Block[] {
      const x = lineX(now);
      const ys = curveYs(cur(), x);
      const n = ys.length;
      const c = countColor(n);
      const bs: Block[] = [titleBlock(tr('lineTitle', { x: nf(x) }), c, false)];
      bs.push(textBlock(n === 0 ? ctx.t('count0') : n === 1 ? ctx.t('count1') : tr('countN', { n }), w, c, narrow() ? 13 : 14, 750));
      if (n > 0) {
        // Ein Pfeil je Schnittpunkt: x ↦ y₁, ↦ y₂ … (untereinander)
        const head = segs(`x = ${nf(x)} `);
        const indent = richWidth(head, narrow() ? 14 : 15, 700);
        ys.forEach((y, i) => {
          const row: Seg[] = [...(i === 0 ? head : []), { t: '↦ ' }, ...segs(`y ${rel(y)} ${nf(y)}`, c)];
          const blk = richBlock(row, narrow() ? 14 : 15, w - (i === 0 ? 0 : indent));
          bs.push(i === 0 ? blk : { h: blk.h * 0.92, draw: (xx, yy, ww) => blk.draw(xx + indent, yy - blk.h * 0.08, ww) });
        });
      }
      if (n === 0) bs.push(textBlock(IS_FUNCTION[cur()] ? tr('line0Fn', { x: nf(x) }) : ctx.t('line0'), w));
      else if (n > 1) bs.push(textBlock(tr('lineMany', { x: nf(x), n }), w, red()));
      return bs;
    }

    function verdictPanel(w: number, now: number): Block[] {
      const id = cur();
      if (!p.show) return [titleBlock(ctx.t('hiddenTitle'), orange()), textBlock(ctx.t('hiddenGraph'), w, ctx.theme.text)];
      const ok = IS_FUNCTION[id];
      const c = ok ? green() : red();
      const bs: Block[] = [titleBlock(ctx.t(ok ? 'graphFn' : 'graphNo'), c)];
      if (ok) bs.push(textBlock(ctx.t('graphFnText'), w, ctx.theme.text));
      else {
        bs.push(textBlock(witnessText(lineX(now)), w, ctx.theme.text));
      }
      return bs;
    }

    /** Begründung: an der aktuellen Geraden, wenn sie mehrfach schneidet, sonst an einer bekannten Stelle. */
    function witnessText(x: number): string {
      const id = cur();
      const wx = curveYs(id, x).length > 1 ? x : (WITNESS[id] ?? 0);
      const ys = curveYs(id, wx);
      const times = ctx.t(ys.length === 2 ? 'times2' : ys.length === 3 ? 'times3' : 'timesN').replace('{n}', String(ys.length));
      return tr('graphNoText', { x: nf(wx), times, pts: ys.map((y) => `${rel(y) === '≈' ? '≈ ' : ''}${ptText(wx, y)}`).join(ctx.t('sep')) });
    }

    function eqPanel(w: number): Block[] {
      const id = cur();
      const bs: Block[] = [titleBlock(ctx.t('eqTitle')), richBlock(segs(ctx.t(`eq_${id}`)), narrow() ? 15 : 17, w, blue())];
      if (id === 'step') bs.push(textBlock(ctx.t('note_step'), w, ctx.theme.muted, narrow() ? 11 : 11.5));
      if (p.show && IS_FUNCTION[id]) {
        bs.push({ h: 4, draw: () => {} });
        bs.push(richBlock(segs(ctx.t(`d_${id}`)), narrow() ? 13 : 14, w, teal()));
        bs.push(richBlock(segs(ctx.t(`w_${id}`)), narrow() ? 13 : 14, w, purple()));
      }
      return bs;
    }

    function rulePanel(w: number): Block[] {
      return [titleBlock(ctx.t('ruleTitle')), textBlock(ctx.t('ruleText'), w, ctx.theme.text)];
    }

    function drawGraphPanel(Rr: Rect, now: number): void {
      const pad = narrow() ? 10 : 13;
      const gap = narrow() ? 8 : 10;
      const inner = Rr.w - 2 * pad;
      const cards: { bs: Block[]; accent?: string }[] = [
        { bs: eqPanel(inner) },
        { bs: linePanel(inner, now), accent: countColor(curveYs(cur(), lineX(now)).length) },
        { bs: verdictPanel(inner, now), accent: !p.show ? orange() : IS_FUNCTION[cur()] ? green() : red() },
      ];
      if (narrow()) {
        // Handy: Gleichung und Gerade nebeneinander, Urteil darunter
        const half = (Rr.w - gap) / 2;
        const hi = Math.max(blocksHeight(eqPanel(half - 2 * pad)), blocksHeight(linePanel(half - 2 * pad, now))) + pad * 2 - 4;
        drawBlocks({ x: Rr.x, y: Rr.y, w: half, h: hi }, eqPanel(half - 2 * pad), pad);
        drawBlocks({ x: Rr.x + half + gap, y: Rr.y, w: half, h: hi }, linePanel(half - 2 * pad, now), pad, cards[1]!.accent, 0.05);
        // Urteil füllt den Rest; der Merksatz steht – wenn Platz ist – unten in derselben Karte
        const vb = verdictPanel(inner, now);
        const vy = Rr.y + hi + gap;
        const vh = Rr.y + Rr.h - vy;
        drawBlocks({ x: Rr.x, y: vy, w: Rr.w, h: vh }, vb, pad, cards[2]!.accent, 0.05);
        const rb = rulePanel(inner);
        const rh = blocksHeight(rb);
        if (blocksHeight(vb) + pad * 2 + rh + 10 <= vh) {
          const g = surface.g;
          let y = vy + vh - pad + 2 - rh;
          g.strokeStyle = ctx.theme.dark ? '#2b3545' : '#e3e8ef';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(Rr.x + pad, Math.round(y - 5) + 0.5);
          g.lineTo(Rr.x + Rr.w - pad, Math.round(y - 5) + 0.5);
          g.stroke();
          for (const bl of rb) {
            bl.draw(Rr.x + pad, y, inner);
            y += bl.h;
          }
        }
        return;
      }
      cards.push({ bs: rulePanel(inner) });
      let y = Rr.y;
      for (const c of cards) {
        const need = blocksHeight(c.bs) + pad * 2 - 4;
        const h = Math.min(need, Rr.y + Rr.h - y);
        if (h < 30 || (c.bs === cards[cards.length - 1]!.bs && h < need)) break;
        drawBlocks({ x: Rr.x, y, w: Rr.w, h }, c.bs, pad, c.accent, c.accent ? 0.05 : 0);
        y += h + gap;
      }
    }

    /* ---------- Eingaben ---------- */
    function mapHit(px: number, py: number): { side: 'a' | 'b'; i: number } | null {
      const reg = mapRegions();
      return hitSide(px, py, diagramGeo(map, reg.diag));
    }

    function setArrows(next: [number, number][]): void {
      const before = new Set(map.arrows.map(([i, j]) => `${i}-${j}`));
      const after = new Set(next.map(([i, j]) => `${i}-${j}`));
      const now = performance.now();
      for (const [i, j] of next) if (!before.has(`${i}-${j}`)) born.set(`${i}-${j}`, now);
      for (const [i, j] of map.arrows) if (!after.has(`${i}-${j}`)) gone.push({ i, j, t0: now });
      const wasFn = info.isFunction;
      map = { ...map, arrows: next };
      info = analyze(map);
      edited = true;
      if (info.isFunction !== wasFn) pop.play();
      updateReadouts();
      syncActions();
      ctx.requestRender();
    }

    function lineTo(px: number): void {
      const x = plot.toWorld(px, 0)[0];
      ctx.set({ xl: clamp(x, -6, 6) });
    }

    surface.addTarget({
      contains: (px: number, py: number) => {
        if (mode() === 'map') return !flip && mapHit(px, py) !== null;
        const r = plot.rect;
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
      },
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked) return false;
        if (mode() === 'graph') {
          // Zugreifen beendet das Abtasten
          if (scan) {
            scan = null;
            syncActions();
          }
          lineDrag = true;
          lineTo(q.px);
          surface.setCursor('grabbing');
          return true;
        }
        const hit = mapHit(q.px, q.py);
        if (!hit) return false;
        if (hit.side === 'a') {
          drag = { i: hit.i, px: q.px, py: q.py, moved: false };
        } else if (selA !== null) {
          setArrows(toggleArrow(map.arrows, selA, hit.i));
        }
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (mode() === 'graph') {
          if (lineDrag) lineTo(q.px);
          return;
        }
        if (!drag) return;
        if (!drag.moved && Math.hypot(q.px - drag.px, q.py - drag.py) < 6) return;
        drag.moved = true;
        drag.px = q.px;
        drag.py = q.py;
        ctx.requestRender();
      },
      pointerUp: (q: { px: number; py: number }) => {
        if (mode() === 'graph') {
          lineDrag = false;
          surface.setCursor('ew-resize');
          return;
        }
        if (!drag) return;
        if (drag.moved) {
          const hit = mapHit(q.px, q.py);
          if (hit?.side === 'b') {
            setArrows(toggleArrow(map.arrows, drag.i, hit.i));
            selA = drag.i;
          }
        } else selA = selA === drag.i ? null : drag.i;
        drag = null;
        updateReadouts();
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        if (mode() === 'graph') {
          if (q) surface.setCursor(ctx.locked ? '' : 'ew-resize');
          return;
        }
        const hit = q ? mapHit(q.px, q.py) : null;
        if (JSON.stringify(hit) !== JSON.stringify(hoverEl)) {
          hoverEl = hit;
          ctx.requestRender();
        }
        if (q) surface.setCursor(hit && !ctx.locked && (hit.side === 'a' || selA !== null) ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ergebnisse ---------- */
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const varHtml = (s: string) => esc(s).replace(/(?<![A-Za-zÄÖÜäöüß])([xyf])(?![A-Za-zÄÖÜäöüß])/g, '<var>$1</var>');

    function updateReadouts(): void {
      if (mode() === 'map') {
        const rule = label({ label: map.rule });
        const sets = tr('sets', { a: listText(map.a.map((it) => label(it))), b: listText(map.b.map((it) => label(it))) });
        ctx.readout('rule', { html: `${varHtml(rule)}${edited ? ` (${esc(ctx.t('edited'))})` : ''}<br>${esc(sets)}` });
        const head = `<tr><th>${esc(label({ label: map.titleA }))}</th><th>${esc(label({ label: map.titleB }))}</th></tr>`;
        const rows = map.a.map((it, i) => `<tr><td>${esc(label(it))}</td><td>${esc(cellText(i).text)}</td></tr>`).join('');
        ctx.readout('table', { html: `<table class="mini-table">${head}${rows}</table>` });
        ctx.readout('line', null);
        const v = verdictLines();
        ctx.readout('verdict', p.show ? `${v.title}: ${v.lines.join(' ')}` : `${ctx.t(info.isFunction ? 'isFn' : 'noFn')}`);
        ctx.readout('dw', dwText());
      } else {
        const id = cur();
        ctx.readout('rule', { html: varHtml(ctx.t(`eq_${id}`) + (id === 'step' ? ` (${ctx.t('note_step').replace(/^⌊x⌋: /, '')})` : '')) });
        ctx.readout('table', null);
        const ys = curveYs(id, p.xl);
        const n = ys.length;
        ctx.readout('line', { html: varHtml(`x = ${nf(p.xl)}: ${n === 0 ? ctx.t('count0') : n === 1 ? ctx.t('count1') : tr('countN', { n })}${n ? ` – ${ys.map((y) => `${rel(y) === '≈' ? '≈ ' : ''}${ptText(p.xl, y)}`).join(ctx.t('sep'))}` : ''}`) });
        const ok = IS_FUNCTION[id];
        ctx.readout('verdict', `${ctx.t(ok ? 'graphFn' : 'graphNo')}: ${ok ? ctx.t('graphFnText') : witnessText(p.xl)}`);
        ctx.readout('dw', ok ? { html: varHtml(`${ctx.t(`d_${id}`)}, ${ctx.t(`w_${id}`)}`) } : null);
      }
    }

    function syncActions(): void {
      ctx.setAction('clear', { enabled: map.arrows.length > 0 && !ctx.locked });
      ctx.setAction('reset', { enabled: edited && !ctx.locked });
      ctx.setAction('flip', { enabled: !ctx.locked });
      ctx.setAction('scan', { enabled: !scan && !ctx.locked });
    }

    /* ---------- Zeichnen ---------- */
    let viewKey = '';
    function render(): void {
      const now = performance.now();
      surface.begin();
      if (mode() === 'map') {
        const reg = mapRegions();
        drawDiagram(reg.diag, now);
        drawVerdict(reg.verdict);
        drawTable(reg.table);
        drawRelChart(reg.chart);
        if (flip && now - flip.start >= FLIP_MS) {
          flip = null;
          updateReadouts();
        }
        const growing = [...born.values()].some((t0) => now - t0 < 400);
        if (flip || gone.length || pop.running || growing) ctx.requestRender();
        return;
      }
      plot.resize();
      const reg = graphRegions();
      const key = `${surface.width}x${surface.height}`;
      if (key !== viewKey) {
        viewKey = key;
        const r = plot.rect;
        const k = r.h / Math.max(1, r.w);
        const half = narrow() ? 5.2 : 6.5;
        plot.setRange([-half, half], [-half * k + 0.2, half * k + 0.2]);
      }
      if (scan) {
        const x = lineX(now);
        visit(scan.last, x);
        scan.last = x;
      }
      plot.begin();
      plot.grid();
      plot.axes();
      drawDW();
      drawCurve();
      drawLineTest(now);
      plot.end();
      drawStrip(reg.strip, now);
      drawGraphPanel(reg.panel, now);
      if (scan && now - scan.start >= SCAN_MS) {
        scan = null;
        syncActions();
        updateReadouts();
        ctx.requestRender();
      }
      if (scan) ctx.requestRender();
    }

    let lastXl = p.xl;

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || changed.has('ex') || changed.has('mode')) {
          map = baseMapping();
          info = analyze(map);
          edited = false;
          selA = null;
          flip = null;
          born.clear();
          gone = [];
        } else if (changed.has('rev')) {
          // Umkehren: Pfeile andersherum (auch selbst gesetzte bleiben erhalten)
          const from = map;
          map = reverseMapping(map, p.rev ? REVERSE_RULE[p.ex as ExampleId] : exampleMapping(p.ex as ExampleId).rule);
          info = analyze(map);
          selA = null;
          born.clear();
          if (!reduced) flip = { from, start: performance.now() };
          pop.play();
        }
        if (source === 'init' || source === 'replace' || changed.has('cur') || changed.has('mode')) {
          visited = [];
          scan = null;
          visit(p.xl, p.xl);
          viewKey = '';
        } else if (changed.has('xl')) {
          if (source === 'input') scan = null;
          visit(lastXl, p.xl);
        }
        lastXl = p.xl;
        syncActions();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'flip') ctx.set({ rev: !p.rev });
        else if (id === 'clear') {
          setArrows([]);
          selA = null;
        } else if (id === 'reset') {
          map = baseMapping();
          info = analyze(map);
          edited = false;
          born.clear();
          pop.play();
          updateReadouts();
        } else if (id === 'scan') {
          const b = plot.bounds;
          if (reduced) {
            visit(b.xMin, b.xMax);
          } else {
            scan = { start: performance.now(), from: p.xl, x0: b.xMin, x1: b.xMax, last: p.xl };
            visited = [];
          }
        }
        syncActions();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
