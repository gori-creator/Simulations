import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { FUNCS, hasLimit, limitOf, table, tableXs, threshold, type Dir, type FnKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Terme in Formel-Kurzschrift. */
const TERMS: Record<FnKey, string> = {
  inv: 'f(x) = \\f{1}{x} + 1',
  rat: 'f(x) = \\f{2x + 1}{x − 1}',
  rat2: 'f(x) = \\f{3x^2 + 1}{x^2 + 1}',
  osc: 'f(x) = \\f{\\t{sin} x}{x}',
  exp: 'f(x) = 2^x',
  poly: 'f(x) = 0,1x^3 − x',
};
/** Umformung, an der man den Grenzwert abliest. */
const WHY: Record<FnKey, { de: string; en: string } | null> = {
  inv: L('\\f{1}{x} → 0, also f(x) → 1', '\\f{1}{x} → 0, so f(x) → 1'),
  rat: L('f(x) = 2 + \\f{3}{x − 1} → 2', 'f(x) = 2 + \\f{3}{x − 1} → 2'),
  rat2: L('f(x) = 3 − \\f{2}{x^2 + 1} → 3', 'f(x) = 3 − \\f{2}{x^2 + 1} → 3'),
  osc: L('|f(x)| ≤ \\f{1}{|x|} → 0', '|f(x)| ≤ \\f{1}{|x|} → 0'),
  exp: null,
  poly: null,
};

/**
 * Grenzverhalten für x → ±∞: Graph mit waagrechter Asymptote, ε-Streifen
 * (Rand ziehbar) und der Stelle x_ε, ab der der Graph im Streifen bleibt;
 * ein Punkt läuft nach außen, die Ansicht zoomt mit, eine Wertetabelle mit
 * x = 1, 10, 100, … zeigt die Annäherung. Gegenbeispiele ohne Grenzwert.
 */
export default defineSimulation({
  id: 'grenzverhalten',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'f',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'inv', label: L('1/x + 1', '1/x + 1') },
        { value: 'rat', label: L('(2x + 1)/(x − 1)', '(2x + 1)/(x − 1)') },
        { value: 'rat2', label: L('(3x² + 1)/(x² + 1)', '(3x² + 1)/(x² + 1)') },
        { value: 'osc', label: L('sin(x)/x', 'sin(x)/x') },
        { value: 'exp', label: L('2ˣ', '2ˣ') },
        { value: 'poly', label: L('0,1x³ − x', '0.1x³ − x') },
      ],
      default: 'rat',
    },
    {
      key: 'dir',
      type: 'choice',
      label: L('Richtung', 'Direction'),
      options: [
        { value: 'p', label: L('x → +∞', 'x → +∞') },
        { value: 'm', label: L('x → −∞', 'x → −∞') },
      ],
      default: 'p',
    },
    { key: 'eps', type: 'number', label: L('Streifenbreite ε', 'Strip width ε'), min: 0.05, max: 1, step: 0.05, default: 0.5, help: L('Auch am Rand des Streifens ziehen.', 'You can also drag the edge of the strip.') },
    { key: 'band', type: 'boolean', group: 'view', label: L('ε-Streifen um die Asymptote', 'ε-strip around the asymptote'), default: true },
    { key: 'info', type: 'boolean', group: 'view', label: L('Grenzwert zeigen', 'Show the limit'), help: L('Aus: Grenzwert und Asymptote selbst finden.', 'Off: find the limit and the asymptote yourself.'), default: true },
  ],
  actions: [
    { id: 'run', label: L('x nach außen laufen lassen', 'Let x run outwards'), primary: true },
    { id: 'back', label: L('Zurück zur Ausgangsansicht', 'Back to the start view') },
  ],
  readouts: [
    { key: 'lim', label: L('Grenzverhalten', 'Behaviour'), spoiler: true },
    { key: 'asym', label: L('Asymptote', 'Asymptote'), spoiler: true },
    { key: 'xe', label: L('ε-Streifen', 'ε-strip'), spoiler: true },
  ],
  presets: [
    { id: 'rat', label: L('Bruchfunktion → 2', 'Rational function → 2'), values: {} },
    { id: 'inv', label: L('1/x + 1 von beiden Seiten', '1/x + 1 from both sides'), values: { f: 'inv', dir: 'm', eps: 0.25 } },
    { id: 'rat2', label: L('Annäherung von unten', 'Approach from below'), values: { f: 'rat2', eps: 0.2 } },
    { id: 'osc', label: L('sin(x)/x schneidet die Asymptote', 'sin(x)/x crosses the asymptote'), values: { f: 'osc', eps: 0.1 } },
    { id: 'exp', label: L('2ˣ: nur für x → −∞', '2ˣ: only for x → −∞'), values: { f: 'exp', dir: 'm', eps: 0.25 } },
    { id: 'poly', label: L('Kein Grenzwert', 'No limit'), values: { f: 'poly' } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen einer Funktion, ihrer waagrechten Asymptote und einem ε-Streifen um die Asymptote; ab der markierten Stelle bleibt der Graph im Streifen. Ein Punkt läuft nach außen, die Ansicht zoomt mit. Daneben Grenzwert, Streifen und Wertetabelle.',
      limT: 'Grenzverhalten',
      stripT: 'ε-Streifen',
      tabT: 'Wertetabelle',
      noLimit: 'Kein Grenzwert: f(x) wächst über jede Schranke.',
      noLimitNeg: 'Kein Grenzwert: f(x) fällt unter jede Schranke.',
      asym: 'Waagrechte Asymptote: y = {l}',
      noAsym: 'keine waagrechte Asymptote',
      stripText: 'Für alle x {rel} {x} gilt |f(x) − {l}| < {e}.',
      stripNo: 'Der Graph verlässt jeden Streifen – es gibt kein x_ε.',
      hidden: 'Gegen welchen Wert strebt f(x)? Lass x nach außen laufen und beobachte die Wertetabelle.',
      xeLabel: 'x_ε ≈ {x}',
      inside: 'im Streifen',
      dist: 'Abstand',
      limRead: 'lim f(x) = {l} für x → {d}∞',
      limReadInf: 'f(x) → {s}∞ für x → {d}∞ (kein Grenzwert)',
      asymRead: 'y = {l}',
      xeRead: 'ε = {e}: ab x {rel} {x} bleibt der Graph im Streifen',
      crosses: 'Der Graph darf die Asymptote schneiden – er muss ihr nur beliebig nahe kommen.',
      from: 'Annäherung von {s}',
      above: 'oben',
      below: 'unten',
      both: 'beiden Seiten (schwingt)',
    },
    en: {
      canvas: 'Coordinate system with the graph of a function, its horizontal asymptote and an ε-strip around the asymptote; beyond the marked position the graph stays in the strip. A point runs outwards while the view zooms out. Next to it the limit, the strip and a table of values.',
      limT: 'Behaviour',
      stripT: 'ε-strip',
      tabT: 'Table of values',
      noLimit: 'No limit: f(x) grows beyond every bound.',
      noLimitNeg: 'No limit: f(x) falls below every bound.',
      asym: 'Horizontal asymptote: y = {l}',
      noAsym: 'no horizontal asymptote',
      stripText: 'For all x {rel} {x}: |f(x) − {l}| < {e}.',
      stripNo: 'The graph leaves every strip – there is no x_ε.',
      hidden: 'Which value does f(x) approach? Let x run outwards and watch the table.',
      xeLabel: 'x_ε ≈ {x}',
      inside: 'in the strip',
      dist: 'Distance',
      limRead: 'lim f(x) = {l} for x → {d}∞',
      limReadInf: 'f(x) → {s}∞ for x → {d}∞ (no limit)',
      asymRead: 'y = {l}',
      xeRead: 'ε = {e}: for x {rel} {x} the graph stays in the strip',
      crosses: 'The graph may cross the asymptote – it only has to get arbitrarily close.',
      from: 'approach from {s}',
      above: 'above',
      below: 'below',
      both: 'both sides (oscillating)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const wide = () => surface.width >= 640;
    const F = (w: number, n: number) => (wide() ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    const key = () => p.f as FnKey;
    const dir = (): Dir => (p.dir === 'm' ? -1 : 1);

    const col = {
      f: () => th().series[0]!,
      asym: () => th().series[4]!,
      ok: () => th().series[2]!,
      out: () => th().series[1]!,
      P: () => th().series[3]!,
    };

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (narrow()) {
        const ph = Math.round(clamp(w * 0.78, 240, h * 0.5));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 8, w: w - 4, h: h - ph - 10 } };
      }
      const colW = Math.round(clamp(w * 0.34, 240, 330));
      return { plot: { x: 0, y: 0, w: w - colW - 10, h }, col: { x: w - colW, y: 2, w: colW - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-10, 10], y: [-4, 6], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Zustand ---------- */
    /** Ansicht: x-Ausdehnung nach außen (X) und y-Bereich. */
    let view = { X: 12, y0: -3, y1: 5 };
    let epsShown = p.eps;
    let run: { t0: number } | null = null;
    const RUN = 6500;
    let runX = 0;
    let lastFrame = performance.now();
    let intro = reduced ? 1 : 0;
    let dragging = 0;
    let xeCache: { k: string; v: number } | null = null;

    function xEps(): number {
      const k = `${p.f}|${p.dir}|${p.eps}`;
      if (xeCache?.k !== k) xeCache = { k, v: threshold(key(), dir(), p.eps) };
      return xeCache.v;
    }
    const Lim = () => limitOf(key(), dir());

    /** Zielansicht ohne Lauf: Asymptote und interessanter Bereich gut sichtbar. */
    function baseView(): { X: number; y0: number; y1: number } {
      const L0 = Lim();
      const k = key();
      if (k === 'poly') return { X: 7, y0: -8, y1: 8 };
      if (k === 'exp') return dir() > 0 ? { X: 6, y0: -2, y1: 12 } : { X: 8, y0: -1.5, y1: 4.5 };
      const xe = Math.abs(xEps());
      const X = clamp(Math.max(10, xe * 1.35), 10, 100);
      const span = k === 'osc' ? 1.4 : 3.5;
      return { X, y0: L0 - span, y1: L0 + span + (k === 'osc' ? 0.3 : 0) };
    }
    /** Während des Laufs: P bei x mit |x| bis 10 000, Ansicht zoomt mit. */
    function runView(x: number): { X: number; y0: number; y1: number } {
      const b = baseView();
      const X = Math.max(b.X, Math.abs(x) * 1.25);
      if (!hasLimit(key(), dir())) {
        const y = FUNCS[key()].f(x);
        return { X, y0: Math.min(b.y0, y * 1.15), y1: Math.max(b.y1, y * 1.15) };
      }
      return { X, y0: b.y0, y1: b.y1 };
    }
    function runPos(now: number): number {
      const t = clamp((now - run!.t0) / RUN, 0, 1);
      // logarithmisch: |x| von 1 bis 10 000
      const lg = 4 * ease.inOutCubic(t);
      const lim = key() === 'exp' ? 1.35 : hasLimit(key(), dir()) ? 4 : 1.6;
      return dir() * 10 ** ((lg / 4) * lim);
    }

    function step(dt: number, now: number): boolean {
      let target = baseView();
      if (run) {
        runX = runPos(now);
        target = runView(runX);
        if (now - run.t0 > RUN + 1500) run = null;
      }
      const k = reduced ? 1 : 1 - Math.exp(-dt * (run ? 14 : 5));
      const app = (v: number, g: number) => (Math.abs(g - v) < 1e-4 * (1 + Math.abs(g)) ? g : v + (g - v) * k);
      const nv = { X: Math.exp(app(Math.log(view.X), Math.log(target.X))), y0: app(view.y0, target.y0), y1: app(view.y1, target.y1) };
      const moving = Math.abs(nv.X - view.X) > 1e-4 * view.X || nv.y0 !== view.y0 || nv.y1 !== view.y1;
      view = nv;
      epsShown = reduced || dragging ? p.eps : app(epsShown, p.eps);
      return moving || epsShown !== p.eps || !!run;
    }

    /* ---------- Griff: Rand des Streifens ---------- */
    plot.addHandle({
      get: () => {
        const xs = dir() > 0 ? view.X * 0.88 : -view.X * 0.88;
        return [xs, Lim() + epsShown];
      },
      set: (_x, y) => {
        dragging = performance.now();
        ctx.set({ eps: Math.round(clamp(Math.abs(y - Lim()), 0.05, 1) * 20) / 20 });
      },
      axis: 'y',
      enabled: () => !ctx.locked && p.band && p.info && hasLimit(key(), dir()) && !run,
      color: () => col.asym(),
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: { L: col.asym(), f: col.f() } });
    function fitFormula(src: string, maxW: number, size: number, color = th().text, weight = 600) {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    const n = (v: number, d = 2) => fmt.num(v, d);
    const xNum = (v: number) => (Math.abs(v) >= 1000 ? fmt.num(v, 0) : fmt.num(v, 2));
    const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    /** Kleine Zahlen in Zehnerpotenz-Schreibweise, sonst bis zu 6 Nachkommastellen. */
    function small(v: number): string {
      if (!Number.isFinite(v)) return '–';
      const a = Math.abs(v);
      if (a === 0) return '0';
      if (a >= 1e-4) return fmt.num(v, 6);
      const e = Math.floor(Math.log10(a));
      const m = v / 10 ** e;
      return `${fmt.num(m, 2)} · 10${String(e).split('').map((c) => SUP[c] ?? c).join('')}`.replace('-', '−');
    }
    const dSym = () => (dir() > 0 ? '+' : '−');

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const L0 = Lim();
      if (hasLimit(key(), dir())) {
        ctx.readout('lim', tr('limRead', { l: n(L0), d: dSym() }));
        ctx.readout('asym', tr('asymRead', { l: n(L0) }));
        ctx.readout('xe', tr('xeRead', { e: n(p.eps), rel: dir() > 0 ? '>' : '<', x: n(xEps(), 2) }));
      } else {
        ctx.readout('lim', tr('limReadInf', { s: L0 > 0 ? '+' : '−', d: dSym() }));
        ctx.readout('asym', ctx.t('noAsym'));
        ctx.readout('xe', ctx.t('stripNo'));
      }
      ctx.setAction('run', { enabled: !ctx.locked });
      ctx.setAction('back', { enabled: !ctx.locked });
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = th();
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
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }
    function title(x: number, y: number, label: string, color = th().muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    function label(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12)): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const r = plot.rect;
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      left = clamp(left, r.x + 4, r.x + r.w - box.w - 4);
      const base = clamp(y + (box.asc - box.desc) / 2, r.y + box.asc + 4, r.y + r.h - box.desc - 4);
      g.save();
      g.globalAlpha = 0.88;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha = 1;
      box.draw(g, left, base);
      g.restore();
    }

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      const d = dir();
      const X = view.X;
      const inner = X * 0.18;
      plot.setRange(d > 0 ? [-inner, X] : [-X, inner], [view.y0, view.y1]);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const k = key();
      const fn = FUNCS[k].f;
      const lim = hasLimit(k, d);
      const L0 = Lim();
      const show = p.info;
      // ε-Streifen
      const xe = lim ? xEps() : NaN;
      if (lim && p.band && show) {
        const e = epsShown;
        const y0 = plot.py(L0 + e);
        const y1 = plot.py(L0 - e);
        g.save();
        g.fillStyle = withAlpha(col.asym(), theme.dark ? 0.16 : 0.1);
        g.fillRect(r.x, y0, r.w, y1 - y0);
        g.strokeStyle = withAlpha(col.asym(), 0.6);
        g.lineWidth = 1.2;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(r.x, y0);
        g.lineTo(r.x + r.w, y0);
        g.moveTo(r.x, y1);
        g.lineTo(r.x + r.w, y1);
        g.stroke();
        g.restore();
        // Bereich ab x_ε
        const px = plot.px(xe);
        if (px > r.x && px < r.x + r.w) {
          g.save();
          g.fillStyle = withAlpha(col.ok(), theme.dark ? 0.16 : 0.1);
          if (d > 0) g.fillRect(px, y0, r.x + r.w - px, y1 - y0);
          else g.fillRect(r.x, y0, px - r.x, y1 - y0);
          g.strokeStyle = col.ok();
          g.lineWidth = 2;
          g.setLineDash([6, 4]);
          g.beginPath();
          g.moveTo(px, r.y);
          g.lineTo(px, r.y + r.h);
          g.stroke();
          g.restore();
          label(px + (d > 0 ? 6 : -6), r.y + r.h - 16, tr('xeLabel', { x: n(xe, 1) }), col.ok(), d > 0 ? 'left' : 'right', F(12.5, 11.5));
        }
        label(d > 0 ? r.x + r.w - 8 : r.x + 8, plot.py(L0 + e) - 12, `ε = ${n(p.eps)}`, col.asym(), d > 0 ? 'right' : 'left', F(12, 11));
      }
      // Asymptote
      if (lim && show) {
        g.save();
        g.strokeStyle = col.asym();
        g.lineWidth = 2;
        g.setLineDash([8, 6]);
        const y = plot.py(L0);
        g.beginPath();
        g.moveTo(r.x, y);
        g.lineTo(r.x + r.w, y);
        g.stroke();
        g.restore();
        label(d > 0 ? r.x + 8 : r.x + r.w - 8, plot.py(L0) - 14, `y = ${n(L0)}`, col.asym(), d > 0 ? 'left' : 'right', F(13, 12));
      }
      // Graph (wächst beim Start)
      const { xMin, xMax } = plot.bounds;
      const reveal = ease.inOutCubic(intro);
      const from = d > 0 ? xMin : lerp(xMax, xMin, reveal);
      const to = d > 0 ? lerp(xMin, xMax, reveal) : xMax;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(fn, { color: col.f(), width: 3, from, to });
      g.restore();
      // Teil im Streifen grün nachzeichnen
      if (lim && p.band && show && reveal >= 1) {
        const a = d > 0 ? Math.max(xe, xMin) : xMin;
        const b = d > 0 ? xMax : Math.min(xe, xMax);
        if (b > a) plot.fn(fn, { color: col.ok(), width: 3.4, from: a, to: b });
      }
      // laufender Punkt
      if (run) {
        const x = runX;
        const y = fn(x);
        if (Number.isFinite(y)) {
          const px = clamp(plot.px(x), r.x + 6, r.x + r.w - 6);
          const py = clamp(plot.py(y), r.y + 6, r.y + r.h - 6);
          g.save();
          g.beginPath();
          g.arc(px, py, 12, 0, Math.PI * 2);
          g.fillStyle = withAlpha(col.P(), 0.22);
          g.fill();
          g.beginPath();
          g.arc(px, py, 6, 0, Math.PI * 2);
          g.fillStyle = col.P();
          g.fill();
          g.strokeStyle = theme.bg;
          g.lineWidth = 2;
          g.stroke();
          g.restore();
          const lab = `x = ${xNum(x)}, f(x) ≈ ${Math.abs(y) > 1e6 ? fmt.num(y, 0) : small(Math.round(y * 1e6) === 0 ? y : Math.round(y * 1e4) / 1e4)}`;
          label(px + (d > 0 ? -10 : 10), py + (y > (lim ? L0 : 0) ? -26 : 26), lab, col.P(), d > 0 ? 'right' : 'left', F(12.5, 11.5));
        }
      }
      plot.end();
    }

    /* ---------- Karten ---------- */
    function limCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.asym(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('limT'), col.asym());
      const b0 = fitFormula(TERMS[key()], R.w - 2 * pad, F(15, 14), theme.text, 650);
      b0.draw(g, R.x + pad, R.y + 30 + b0.asc);
      let y = R.y + 30 + b0.asc + b0.desc + 10;
      if (!p.info) {
        const f = font(500, F(12.5, 12));
        wrap(ctx.t('hidden'), R.w - 2 * pad, f).forEach((row, i) => text(g, row, R.x + pad, y + 8 + i * 16, { font: f, color: theme.text, align: 'left' }));
        return;
      }
      const lim = hasLimit(key(), dir());
      const L0 = Lim();
      const src = lim ? `\\t{lim}_{x → ${dSym()}∞} f(x) = \\c{L}{${n(L0)}}` : `f(x) → ${L0 > 0 ? '+' : '−'}∞ \\t{für} x → ${dSym()}∞`;
      const b1 = fitFormula(src, R.w - 2 * pad, F(16, 14.5), theme.text, 700);
      b1.draw(g, R.x + pad, y + b1.asc);
      y += b1.asc + b1.desc + 10;
      const why = WHY[key()];
      if (lim && why) {
        const b2 = fitFormula(why[ctx.lang], R.w - 2 * pad, F(13, 12), theme.muted, 600);
        b2.draw(g, R.x + pad, y + b2.asc);
        y += b2.asc + b2.desc + 8;
      }
      const f = font(600, F(12, 11.5));
      const msg = lim ? tr('asym', { l: n(L0) }) : ctx.t(L0 > 0 ? 'noLimit' : 'noLimitNeg');
      wrap(msg, R.w - 2 * pad, f).forEach((row, i) => text(g, row, R.x + pad, y + 8 + i * 15, { font: f, color: lim ? col.asym() : col.out(), align: 'left' }));
    }

    function stripCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const lim = hasLimit(key(), dir());
      card(R, lim ? col.ok() : col.out(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('stripT'), lim ? col.ok() : col.out());
      const f = font(500, F(12.5, 12));
      let msg: string;
      if (!p.info) msg = '?';
      else if (!lim) msg = ctx.t('stripNo');
      else msg = tr('stripText', { rel: dir() > 0 ? '>' : '<', x: n(xEps(), 2), l: n(Lim()), e: n(p.eps) });
      if (p.info && lim && key() === 'osc') msg += ` ${ctx.t('crosses')}`;
      wrap(msg, R.w - 2 * pad, f).forEach((row, i) => text(g, row, R.x + pad, R.y + 36 + i * 16, { font: f, color: theme.text, align: 'left' }));
    }
    const stripH = (w: number) => {
      const lim = hasLimit(key(), dir());
      let msg = !p.info ? '?' : !lim ? ctx.t('stripNo') : tr('stripText', { rel: '>', x: n(xEps(), 2), l: n(Lim()), e: n(p.eps) });
      if (p.info && lim && key() === 'osc') msg += ` ${ctx.t('crosses')}`;
      return 30 + wrap(msg, w - 2 * F(14, 12), font(500, F(12.5, 12))).length * 16 + 8;
    };

    function tableCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('tabT'));
      const rows = table(key(), dir());
      const lim = hasLimit(key(), dir());
      const cols = [R.x + pad, R.x + pad + (R.w - 2 * pad) * 0.32, R.x + pad + (R.w - 2 * pad) * (lim ? 0.68 : 1)];
      const hy = R.y + 36;
      const fh = font(700, F(12, 11));
      text(g, 'x', cols[0]!, hy, { font: `italic 700 ${F(13, 12)}px ${theme.mathFont}`, color: theme.muted, align: 'left' });
      text(g, 'f(x)', cols[1]!, hy, { font: `italic 700 ${F(13, 12)}px ${theme.mathFont}`, color: theme.muted, align: 'left' });
      if (lim && p.info) text(g, `|f(x) − ${n(Lim())}|`, R.x + R.w - pad, hy, { font: fh, color: theme.muted, align: 'right' });
      const lh = Math.min(F(22, 20), (R.h - 52) / rows.length);
      const xs = tableXs(key());
      const cur = run ? xs.reduce((best, v, i) => (Math.abs(Math.log(Math.abs(runX)) - Math.log(v)) < Math.abs(Math.log(Math.abs(runX)) - Math.log(xs[best]!)) ? i : best), 0) + (Math.abs(runX) < xs[0]! * 0.7 ? -1 : 0) : -1;
      rows.forEach((rw, i) => {
        const y = hy + 10 + lh * (i + 0.5);
        const active = run && cur === i;
        const reached = !run || cur >= i;
        if (active) {
          g.fillStyle = withAlpha(col.P(), theme.dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - lh / 2 + 1, R.w - 2 * pad + 12, lh - 2, 6);
          g.fill();
        }
        const c = reached ? theme.text : withAlpha(theme.text, 0.25);
        const fv = font(600, F(12.5, 11.5));
        text(g, xNum(rw.x), cols[0]!, y, { font: fv, color: c, align: 'left' });
        const yv = Math.abs(rw.y) > 1e6 ? (rw.y > 0 ? '> 10⁶' : '< −10⁶') : small(rw.y);
        text(g, yv, cols[1]!, y, { font: fv, color: c, align: 'left' });
        if (lim && p.info) text(g, small(rw.d), R.x + R.w - pad, y, { font: fv, color: reached ? col.ok() : withAlpha(col.ok(), 0.3), align: 'right' });
      });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const moving = step(dt, now);
      if (intro < 1) intro = Math.min(1, intro + dt * 1.1);
      surface.begin();
      plot.resize();
      drawPlot();
      const R = regions().col;
      const gap = F(10, 8);
      const lH = p.info ? F(150, 140) : F(110, 104);
      limCard({ x: R.x, y: R.y, w: R.w, h: lH });
      const sH = stripH(R.w);
      stripCard({ x: R.x, y: R.y + lH + gap, w: R.w, h: sH });
      const tY = R.y + lH + gap + sH + gap;
      if (R.y + R.h - tY >= 120) tableCard({ x: R.x, y: tY, w: R.w, h: R.y + R.h - tY });
      if (moving || intro < 1 || run || dragging) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('f') || changed.has('dir') || source === 'replace') {
          run = null;
          if (changed.has('f') || changed.has('dir')) intro = reduced ? 1 : 0;
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'run') run = reduced ? null : { t0: performance.now() };
        if (id === 'back') run = null;
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
