import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { extremumKind, FNS, zeros, type FnKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SWEEP_MS = 6000;

/** Bildausschnitte und Terme je Funktion. */
const VIEW: Record<FnKey, { y: [number, number]; dy: [number, number]; f: string; d: string }> = {
  par: { y: [-3, 5], dy: [-4.5, 4.5], f: 'f(x) = 0,5x² − 2', d: 'f′(x) = x' },
  cub: { y: [-4, 4], dy: [-2.5, 6], f: 'f(x) = \\f{1}{4}(x³ − 6x)', d: 'f′(x) = \\f{3}{4}x² − 1,5' },
  quart: { y: [-2, 4], dy: [-6, 6], f: 'f(x) = 0,1x^4 − x² + 1', d: 'f′(x) = 0,4x³ − 2x' },
  sin: { y: [-1.6, 1.6], dy: [-1.6, 1.6], f: 'f(x) = \\t{sin} x', d: 'f′(x) = \\t{cos} x' },
  exp: { y: [-0.8, 6], dy: [-0.8, 6], f: 'f(x) = e^x', d: 'f′(x) = e^x' },
};

/**
 * Ableitungsfunktion grafisch: Ein Punkt P läuft über den Graphen von f, die
 * Tangentensteigung wird mit einem Steigungsdreieck gezeigt und unten als
 * Punkt (x | f′(x)) eingetragen – so entsteht der Graph von f′ Stück für
 * Stück. Extrem- und Wendestellen werden über beide Graphen hinweg markiert.
 */
export default defineSimulation({
  id: 'ableitungsfunktion',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'par', label: L('Parabel', 'Parabola') },
        { value: 'cub', label: L('Polynom 3. Grades', 'Cubic') },
        { value: 'quart', label: L('Polynom 4. Grades', 'Quartic') },
        { value: 'sin', label: L('Sinus', 'Sine') },
        { value: 'exp', label: L('e-Funktion', 'Exponential') },
      ],
      default: 'cub',
    },
    { key: 'x', type: 'number', label: L('Stelle x von P', 'Position x of P'), min: -6.5, max: 6.5, step: 0.05, default: -2.5, help: L('Auch P auf dem Graphen ziehen.', 'You can also drag P along the graph.') },
    { key: 'full', type: 'boolean', group: 'view', label: L('Graph von f′ ganz zeigen', 'Show all of the graph of f′'), help: L('Aus: f′ entsteht nur dort, wo P schon war.', 'Off: f′ only appears where P has been.'), default: false },
    { key: 'marks', type: 'boolean', group: 'view', label: L('Extrem- und Wendestellen markieren', 'Mark extrema and inflection points'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Terme und Werte zeigen', 'Show terms and values'), help: L('Aus: den Graphen von f′ selbst skizzieren.', 'Off: sketch the graph of f′ yourself.'), default: true },
  ],
  actions: [
    { id: 'sweep', label: L('P durchlaufen lassen', 'Let P run along'), primary: true },
    { id: 'clear', label: L('Spur löschen', 'Clear the trace') },
  ],
  readouts: [
    { key: 'slope', label: L('Steigung in P', 'Slope at P'), spoiler: true },
    { key: 'deriv', label: L('Ableitungsfunktion', 'Derivative'), spoiler: true },
  ],
  presets: [
    { id: 'cub', label: L('Polynom 3. Grades', 'Cubic'), values: {} },
    { id: 'par', label: L('Parabel → Gerade', 'Parabola → line'), values: { fn: 'par', x: -3 } },
    { id: 'quart', label: L('Polynom 4. Grades: drei Extrema', 'Quartic: three extrema'), values: { fn: 'quart', x: -3.4 } },
    { id: 'sin', label: L('Sinus → Kosinus', 'Sine → cosine'), values: { fn: 'sin', x: -6 } },
    { id: 'exp', label: L('eˣ ist seine eigene Ableitung', 'eˣ is its own derivative'), values: { fn: 'exp', x: -3.5, full: true } },
  ],
  strings: {
    de: {
      canvas: 'Oben der Graph von f mit einem ziehbaren Punkt P, seiner Tangente und einem Steigungsdreieck; unten der Graph der Ableitungsfunktion f′, der beim Bewegen von P als Spur entsteht. Senkrechte Linien verbinden Extremstellen von f mit Nullstellen von f′ und Wendestellen von f mit Extremstellen von f′.',
      atT: 'An der Stelle P',
      relT: 'Zusammenhänge',
      up: 'f steigt',
      down: 'f fällt',
      flat: 'waagrechte Tangente',
      r1: 'f′(x) > 0  ⇔  f steigt',
      r2: 'f′(x) < 0  ⇔  f fällt',
      r3: 'f′ hat Nullstelle mit VZW  ⇔  Extremstelle von f',
      r4: 'f′ hat Extremstelle  ⇔  Wendestelle von f',
      ext: 'Extremstelle',
      infl: 'Wendestelle',
      tangent: 'Tangente',
      slope: 'Steigung',
    },
    en: {
      canvas: 'Top: the graph of f with a draggable point P, its tangent and a slope triangle; bottom: the graph of the derivative f′, which appears as a trace when P moves. Vertical lines link extrema of f with zeros of f′ and inflection points of f with extrema of f′.',
      atT: 'At the point P',
      relT: 'Relationships',
      up: 'f is increasing',
      down: 'f is decreasing',
      flat: 'horizontal tangent',
      r1: 'f′(x) > 0  ⇔  f is increasing',
      r2: 'f′(x) < 0  ⇔  f is decreasing',
      r3: 'f′ has a zero with sign change  ⇔  extremum of f',
      r4: 'f′ has an extremum  ⇔  inflection point of f',
      ext: 'extremum',
      infl: 'inflection',
      tangent: 'tangent',
      slope: 'slope',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const key = () => p.fn as FnKey;
    const fn = () => FNS[key()];
    const xP = () => clamp(p.x, fn().x[0] + 0.05, fn().x[1] - 0.05);

    const col = {
      f: () => th().series[0]!,
      d: () => th().series[3]!,
      tan: () => th().series[1]!,
      ext: () => th().series[2]!,
      infl: () => th().series[4]!,
    };
    const n2 = (v: number) => fmt.num(Math.abs(v) < 5e-3 ? 0 : v, 2);

    /* ---------- Aufteilung ---------- */
    function regions(): { top: Rect; bot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 1.15, 300, h * 0.6));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.36, 260, 360));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      const th1 = Math.round(left.h * 0.52);
      return { top: { ...left, h: th1 }, bot: { x: left.x, y: left.y + th1 + 6, w: left.w, h: left.h - th1 - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [-4, 4], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top });
    const plotD = new Plot(surface, { x: [-4, 4], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot, yAxis: { label: 'y′' } });

    /* ---------- Zustand ---------- */
    let shownX = xP();
    let lastFrame = performance.now();
    let dragging = 0;
    const sweep = new Tween(SWEEP_MS, ease.inOutCubic);
    /** besuchter Bereich von P (für die Spur von f′) */
    let visited: [number, number] = [p.show ? fn().x[0] : shownX, shownX];
    const intro = new Tween(700, ease.outCubic);

    /* ---------- Griffe ---------- */
    plot.addHandle({
      get: () => [shownX, fn().f(shownX)],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ x: Math.round(clamp(x, fn().x[0] + 0.05, fn().x[1] - 0.05) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !sweep.running,
      color: () => col.f(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const x = xP();
      ctx.readout('slope', `f′(${n2(x)}) ≈ ${n2(fn().d1(x))}`);
      ctx.readout('deriv', VIEW[key()].d.replace(/\\t\{([^}]*)\}/g, '$1').replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)').replace(/\^x/g, 'ˣ'));
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
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), d: col.d(), t: col.tan(), e: col.ext(), w: col.infl(), m: th().muted },
    });
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
    function tag(pl: Plot, x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12)): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const r = pl.rect;
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

    /* ---------- Markierungen ---------- */
    function marks(): { x: number; kind: 'ext' | 'infl' }[] {
      const f = fn();
      const [a, b] = f.x;
      const ex = zeros(f.d1, a, b, 800).filter((x) => extremumKind(f, x) !== 'saddle');
      const inf = zeros(f.d2, a, b, 800);
      return [...ex.map((x) => ({ x, kind: 'ext' as const })), ...inf.map((x) => ({ x, kind: 'infl' as const }))];
    }

    /* ---------- Plots ---------- */
    function drawTop(): void {
      const g = surface.g;
      const theme = th();
      const f = fn();
      const v = VIEW[key()];
      plot.setRange(f.x, v.y);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      if (p.marks) {
        for (const m of marks()) {
          plot.vline(m.x, { color: withAlpha(m.kind === 'ext' ? col.ext() : col.infl(), 0.55), width: 1.5, dash: [5, 4] });
          plot.point(m.x, f.f(m.x), { color: m.kind === 'ext' ? col.ext() : col.infl(), radius: 4.5 });
        }
      }
      const reveal = intro.running ? intro.value : 1;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f.f, { color: col.f(), width: 3, to: lerp(f.x[0], f.x[1], reveal) });
      g.restore();
      // Tangente mit Steigungsdreieck
      const x = shownX;
      const y = f.f(x);
      const m = f.d1(x);
      const span = (f.x[1] - f.x[0]) * 0.22;
      plot.segment([x - span, y - m * span], [x + span, y + m * span], { color: col.tan(), width: 2.4 });
      const run1 = (f.x[1] - f.x[0]) / 10;
      const sx = x + run1 > f.x[1] - 0.1 ? -run1 : run1;
      plot.polyline(
        [
          [x, y],
          [x + sx, y],
          [x + sx, y + m * sx],
        ],
        { color: withAlpha(col.tan(), 0.85), width: 1.6 },
      );
      if (p.show) {
        const [mx, my] = plot.toPx(x + sx, y + (m * sx) / 2);
        tag(plot, mx + (sx > 0 ? 6 : -6), my, `m ≈ ${n2(m)}`, col.tan(), sx > 0 ? 'left' : 'right', F(12, 11));
      }
      plot.point(x, y, { color: col.f(), radius: 6.5 });
      const [px, py] = plot.toPx(x, y);
      tag(plot, px - 10, py - 16, '\\c{f}{P}', col.f(), 'right', F(13, 12));
      tag(plot, r.x + 8, r.y + 14, `\\c{f}{${p.show ? v.f : 'f(x)'}}`, col.f(), 'left', F(13, 12));
      // Führungslinie nach unten
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px, r.y + r.h);
      g.stroke();
      g.restore();
      plot.end();
    }

    function drawBottom(): void {
      const g = surface.g;
      const theme = th();
      const f = fn();
      const v = VIEW[key()];
      plotD.setRange(f.x, v.dy);
      plotD.begin();
      plotD.grid();
      plotD.axes();
      const r = plotD.rect;
      if (p.marks) {
        for (const m of marks()) {
          plotD.vline(m.x, { color: withAlpha(m.kind === 'ext' ? col.ext() : col.infl(), 0.55), width: 1.5, dash: [5, 4] });
          plotD.point(m.x, f.d1(m.x), { color: m.kind === 'ext' ? col.ext() : col.infl(), radius: 4.5 });
        }
      }
      // Vorzeichenbereiche von f′ andeuten
      plotD.fillBetween(f.d1, () => 0, visited[0], visited[1], { fill: withAlpha(col.d(), theme.dark ? 0.14 : 0.08) });
      if (p.full) plotD.fn(f.d1, { color: withAlpha(col.d(), 0.35), width: 2, dash: [6, 5] });
      plotD.fn(f.d1, { color: col.d(), width: 3, from: visited[0], to: visited[1] });
      const x = shownX;
      const d = f.d1(x);
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(plotD.px(x), r.y);
      g.lineTo(plotD.px(x), plotD.py(d));
      g.stroke();
      g.restore();
      plotD.point(x, d, { color: col.d(), radius: 6 });
      tag(plotD, r.x + 8, r.y + 14, `\\c{d}{${p.show ? v.d : 'f′(x)'}}`, col.d(), 'left', F(13, 12));
      if (p.show) tag(plotD, plotD.px(x) + 10, plotD.py(d) - 14, `\\c{d}{(${n2(x)} | ${n2(d)})}`, col.d(), 'left', F(12, 11));
      plotD.end();
    }

    /* ---------- Karten ---------- */
    function atCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const h = F(108, 100);
      if (R.h <= 0) return h;
      card({ ...R, h }, col.tan(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('atT'), col.tan());
      const x = shownX;
      const f = fn();
      const m = f.d1(x);
      const fs = F(14, 13);
      const b1 = fitFormula(`x = ${n2(x)},   \\c{f}{f(x) ≈ ${n2(f.f(x))}}`, R.w - 2 * pad, fs);
      b1.draw(g, R.x + pad, R.y + 30 + b1.asc);
      const b2 = fitFormula(`\\t{${ctx.t('slope')}} = \\c{d}{f′(x) ≈ ${p.show ? n2(m) : '?'}}`, R.w - 2 * pad, fs);
      b2.draw(g, R.x + pad, R.y + 58 + b2.asc);
      const state = Math.abs(m) < 0.03 ? ctx.t('flat') : m > 0 ? ctx.t('up') : ctx.t('down');
      text(g, `→ ${state}`, R.x + pad, R.y + h - 14, { font: font(700, F(12.5, 11.5)), color: Math.abs(m) < 0.03 ? col.ext() : theme.text, align: 'left' });
      return h;
    }

    function relCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('relT'));
      const x = shownX;
      const f = fn();
      const m = f.d1(x);
      const near = (xs: number[]) => xs.some((z) => Math.abs(z - x) < (f.x[1] - f.x[0]) * 0.015);
      const ms = marks();
      const active = [m > 0.03, m < -0.03, near(ms.filter((q) => q.kind === 'ext').map((q) => q.x)), near(ms.filter((q) => q.kind === 'infl').map((q) => q.x))];
      const colors = [theme.text, theme.text, col.ext(), col.infl()];
      const lh = Math.min(F(26, 24), (R.h - 34) / 4);
      ['r1', 'r2', 'r3', 'r4'].forEach((k, i) => {
        const y = R.y + 30 + i * lh;
        if (active[i]) {
          g.fillStyle = withAlpha(i >= 2 ? colors[i]! : col.tan(), theme.dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y, R.w - 2 * pad + 12, lh - 3, 6);
          g.fill();
        }
        const b = fitFormula(`\\t{${ctx.t(k)}}`, R.w - 2 * pad, F(13, 12), active[i] ? (i >= 2 ? colors[i]! : theme.text) : withAlpha(theme.text, 0.75), active[i] ? 700 : 600);
        b.draw(g, R.x + pad, y + (lh - 3) / 2 + (b.asc - b.desc) / 2);
      });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      const f = fn();
      if (sweep.running) shownX = lerp(f.x[0] + 0.05, f.x[1] - 0.05, sweep.value);
      else {
        const goal = xP();
        if (dragging || reduced || Math.abs(goal - shownX) < 1e-3) shownX = goal;
        else {
          shownX += (goal - shownX) * (1 - Math.exp(-dt * 9));
          moving = true;
        }
      }
      visited = [Math.min(visited[0], shownX), Math.max(visited[1], shownX)];
      surface.begin();
      plot.resize();
      plotD.resize();
      drawTop();
      drawBottom();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = atCard({ ...C, h: 0 });
      atCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 110) relCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(150, 140)) });
      if (moving || dragging || sweep.running || intro.running) ctx.requestRender();
      else if (sweepEnd) {
        sweepEnd = false;
        ctx.set({ x: Math.round((f.x[1] - 0.05) * 20) / 20 });
      }
    }
    let sweepEnd = false;

    return {
      update(changed) {
        if (changed.has('fn')) {
          intro.play(reduced ? 1 : 700);
          shownX = xP();
          visited = [p.show ? fn().x[0] : shownX, shownX];
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'clear') {
          visited = [shownX, shownX];
          ctx.requestRender();
          return;
        }
        if (id !== 'sweep') return;
        sweep.play(reduced ? 1 : SWEEP_MS);
        sweepEnd = true;
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
