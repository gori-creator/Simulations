import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { F, FNS, type FnKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SWEEP_MS = 6000;

/** Bildausschnitte und Terme je Funktion. */
const VIEW: Record<FnKey, { y: [number, number]; Y: [number, number]; f: string; F: string }> = {
  lin: { y: [-2.5, 2.5], Y: [-3, 5], f: 'f(x) = 0,5x', F: 'F(x) = 0,25x² + C' },
  par: { y: [-2, 6], Y: [-5, 5], f: 'f(x) = x² − 1', F: 'F(x) = \\f{1}{3}x³ − x + C' },
  cub: { y: [-2.5, 2.5], Y: [-3, 3], f: 'f(x) = 0,25x³ − x', F: 'F(x) = \\f{1}{16}x^4 − \\f{1}{2}x² + C' },
  cos: { y: [-1.6, 1.6], Y: [-3, 3], f: 'f(x) = \\t{cos} x', F: 'F(x) = \\t{sin} x + C' },
  gauss: { y: [-1, 1], Y: [-2, 3], f: 'f(x) = x · e^{−x²/2}', F: 'F(x) = 1 − e^{−x²/2} + C' },
};

/**
 * Vom Graphen zur Stammfunktion: Ein Punkt P läuft über den Graphen von f, die
 * orientierte Fläche von 0 bis P ist eingefärbt und wird als Zuwachs von F
 * eingetragen – so entsteht der Graph einer Stammfunktion. Die Konstante C
 * verschiebt F; weitere Stammfunktionen erscheinen blass.
 */
export default defineSimulation({
  id: 'stammfunktion-grafisch',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion f', 'Function f'),
      options: [
        { value: 'lin', label: L('Gerade', 'Line') },
        { value: 'par', label: L('Parabel', 'Parabola') },
        { value: 'cub', label: L('Polynom 3. Grades', 'Cubic') },
        { value: 'cos', label: L('Kosinus', 'Cosine') },
        { value: 'gauss', label: L('x · e^(−x²/2)', 'x · e^(−x²/2)') },
      ],
      default: 'par',
    },
    { key: 'x', type: 'number', label: L('Stelle x von P', 'Position x of P'), min: -6.5, max: 6.5, step: 0.05, default: 2, help: L('Auch P auf dem Graphen ziehen.', 'You can also drag P along the graph.') },
    { key: 'c', type: 'number', label: L('Konstante C = F(0)', 'Constant C = F(0)'), min: -3, max: 3, step: 0.1, default: 0 },
    { key: 'fam', type: 'boolean', group: 'view', label: L('Weitere Stammfunktionen zeigen', 'Show other antiderivatives'), default: true },
    { key: 'full', type: 'boolean', group: 'view', label: L('Graph von F ganz zeigen', 'Show all of the graph of F'), help: L('Aus: F entsteht nur dort, wo P schon war.', 'Off: F only appears where P has been.'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Terme und Werte zeigen', 'Show terms and values'), help: L('Aus: Stammfunktion selbst skizzieren.', 'Off: sketch the antiderivative yourself.'), default: true },
  ],
  actions: [
    { id: 'sweep', label: L('P durchlaufen lassen', 'Let P run along'), primary: true },
    { id: 'clear', label: L('Spur löschen', 'Clear the trace') },
  ],
  readouts: [
    { key: 'area', label: L('Fläche von 0 bis x', 'Area from 0 to x'), spoiler: true },
    { key: 'F', label: L('Stammfunktion', 'Antiderivative'), spoiler: true },
  ],
  presets: [
    { id: 'par', label: L('Parabel → Polynom 3. Grades', 'Parabola → cubic'), values: {} },
    { id: 'lin', label: L('Gerade → Parabel', 'Line → parabola'), values: { fn: 'lin', x: -3.5, c: -1 } },
    { id: 'cos', label: L('Kosinus → Sinus', 'Cosine → sine'), values: { fn: 'cos', x: -6, c: 0 } },
    { id: 'cub', label: L('Polynom 3. Grades: zwei Tiefpunkte', 'Cubic: two minima'), values: { fn: 'cub', x: -3, c: 0 } },
    { id: 'shift', label: L('Andere Konstante C', 'Another constant C'), values: { fn: 'par', c: 2, full: true } },
  ],
  strings: {
    de: {
      canvas: 'Oben der Graph von f mit einem ziehbaren Punkt P; die orientierte Fläche von 0 bis P ist eingefärbt (oberhalb der x-Achse positiv, unterhalb negativ). Unten der Graph einer Stammfunktion F, der als Spur entsteht, mit der Tangente in P und blassen weiteren Stammfunktionen. Daneben Werte und Zusammenhänge.',
      atT: 'An der Stelle P',
      relT: 'Zusammenhänge',
      area: 'Fläche von 0 bis x',
      r1: 'f(x) > 0  ⇔  F steigt',
      r2: 'f(x) < 0  ⇔  F fällt',
      r3: 'f hat Nullstelle mit VZW  ⇔  Extremstelle von F',
      r4: 'f hat Extremstelle  ⇔  Wendestelle von F',
      slope: 'Steigung von F = f(x)',
    },
    en: {
      canvas: 'Top: the graph of f with a draggable point P; the signed area from 0 to P is coloured (positive above the x-axis, negative below). Bottom: the graph of an antiderivative F appearing as a trace, with the tangent at P and faint further antiderivatives. Next to it values and relationships.',
      atT: 'At the point P',
      relT: 'Relationships',
      area: 'area from 0 to x',
      r1: 'f(x) > 0  ⇔  F is increasing',
      r2: 'f(x) < 0  ⇔  F is decreasing',
      r3: 'f has a zero with sign change  ⇔  extremum of F',
      r4: 'f has an extremum  ⇔  inflection point of F',
      slope: 'slope of F = f(x)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const Fz = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const key = () => p.fn as FnKey;
    const fn = () => FNS[key()];
    const xP = () => clamp(p.x, fn().x[0] + 0.05, fn().x[1] - 0.05);

    const col = {
      f: () => th().series[0]!,
      F: () => th().series[3]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      fam: () => th().series[4]!,
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
      const t1 = Math.round(left.h * 0.48);
      return { top: { ...left, h: t1 }, bot: { x: left.x, y: left.y + t1 + 6, w: left.w, h: left.h - t1 - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [-3, 3], y: [-2, 2], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top });
    const plotF = new Plot(surface, { x: [-3, 3], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot, yAxis: { label: 'Y' } });

    /* ---------- Zustand ---------- */
    let shownX = xP();
    let shownC = p.c;
    let lastFrame = performance.now();
    let dragging = 0;
    const sweep = new Tween(SWEEP_MS, ease.inOutCubic);
    let sweepEnd = false;
    let visited: [number, number] = [p.show ? fn().x[0] : shownX, shownX];

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
    plotF.addHandle({
      get: () => [0, F(fn(), shownC, 0)],
      set: (_x, y) => {
        dragging = performance.now();
        ctx.set({ c: Math.round(clamp(y, -3, 3) * 10) / 10 });
      },
      axis: 'y',
      enabled: () => !ctx.locked,
      color: () => col.F(),
    });

    /* ---------- Ergebnisse ---------- */
    const plain = (s: string) => s.replace(/\\t\{([^}]*)\}/g, '$1').replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)').replace(/\^4/g, '⁴').replace(/\^\{([^}]*)\}/g, '^($1)');
    function updateReadouts(): void {
      const x = xP();
      ctx.readout('area', `∫₀^${n2(x)} f(t) dt ≈ ${n2(fn().F0(x))}`);
      ctx.readout('F', plain(VIEW[key()].F));
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
      text(surface.g, label, x, y, { font: font(700, Fz(12, 11)), color, align: 'left' });
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), F: col.F(), p: col.pos(), n: col.neg(), m: th().muted },
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
    function tag(pl: Plot, x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = Fz(13, 12)): void {
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
      const x = shownX;
      // orientierte Fläche von 0 bis x, getrennt nach Vorzeichen
      const a = Math.min(0, x);
      const b = Math.max(0, x);
      if (b - a > 1e-6) {
        plot.fillBetween((t) => Math.max(f.f(t), 0), () => 0, a, b, { fill: withAlpha(col.pos(), theme.dark ? 0.42 : 0.3) });
        plot.fillBetween((t) => Math.min(f.f(t), 0), () => 0, a, b, { fill: withAlpha(col.neg(), theme.dark ? 0.42 : 0.3) });
      }
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f.f, { color: col.f(), width: 3 });
      g.restore();
      plot.segment([x, 0], [x, f.f(x)], { color: withAlpha(col.f(), 0.6), width: 1.4, dash: [4, 3] });
      plot.point(x, f.f(x), { color: col.f(), radius: 6.5 });
      const [px, py] = plot.toPx(x, f.f(x));
      tag(plot, px + 10, py - 14, `\\c{f}{P}`, col.f(), 'left', Fz(13, 12));
      tag(plot, r.x + 8, r.y + 14, `\\c{f}{${v.f}}`, col.f(), 'left', Fz(13, 12));
      if (p.show) {
        const area = f.F0(x);
        const [mx] = plot.toPx((a + b) / 2, 0);
        tag(plot, mx, plot.py(0) + (area >= 0 ? -16 : 16), `\\c{${area >= 0 ? 'p' : 'n'}}{${n2(area)}}`, area >= 0 ? col.pos() : col.neg(), 'center', Fz(12.5, 11.5));
      }
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
      plotF.setRange(f.x, v.Y);
      plotF.begin();
      plotF.grid();
      plotF.axes();
      const r = plotF.rect;
      if (p.fam) {
        for (let c = -3; c <= 3; c += 1) {
          if (Math.abs(c - shownC) < 0.05) continue;
          plotF.fn((t) => F(f, c, t), { color: withAlpha(col.fam(), theme.dark ? 0.3 : 0.22), width: 1.4 });
        }
      }
      if (p.full) plotF.fn((t) => F(f, shownC, t), { color: withAlpha(col.F(), 0.35), width: 2, dash: [6, 5] });
      plotF.fn((t) => F(f, shownC, t), { color: col.F(), width: 3, from: visited[0], to: visited[1] });
      // Startwert F(0) = C (ziehbar)
      plotF.point(0, shownC, { color: col.F(), radius: 5.5, hollow: true });
      // Tangente in P mit Steigung f(x)
      const x = shownX;
      const y = F(f, shownC, x);
      const m = f.f(x);
      const span = (f.x[1] - f.x[0]) * 0.12;
      plotF.segment([x - span, y - m * span], [x + span, y + m * span], { color: withAlpha(col.f(), 0.9), width: 2 });
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(plotF.px(x), r.y);
      g.lineTo(plotF.px(x), plotF.py(y));
      g.stroke();
      g.restore();
      plotF.point(x, y, { color: col.F(), radius: 6 });
      tag(plotF, r.x + 8, r.y + 14, `\\c{F}{${p.show ? v.F.replace('C', `C, C = ${fmt.num(shownC, 1)}`) : 'F(x)'}}`, col.F(), 'left', Fz(13, 12));
      if (p.show) tag(plotF, plotF.px(x) + 10, plotF.py(y) - 14, `\\c{F}{(${n2(x)} | ${n2(y)})}`, col.F(), 'left', Fz(12, 11));
      plotF.end();
    }

    /* ---------- Karten ---------- */
    function atCard(R: Rect): number {
      const g = surface.g;
      const pad = Fz(14, 12);
      const h = Fz(116, 108);
      if (R.h <= 0) return h;
      card({ ...R, h }, col.F(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('atT'), col.F());
      const f = fn();
      const x = shownX;
      const fs = Fz(14, 13);
      const Q = (s: string) => (p.show ? s : '?');
      const rows = [
        `\\c{f}{f(${n2(x)}) ≈ ${n2(f.f(x))}}  \\t{(${ctx.t('slope')})}`,
        `\\t{∫}_0^{${n2(x)}} f(t) dt ≈ ${Q(n2(f.F0(x)))}`,
        `\\c{F}{F(${n2(x)}) = C + ${Q(n2(f.F0(x)))} ≈ ${Q(n2(F(f, shownC, x)))}}`,
      ];
      let y = R.y + 30;
      for (const src of rows) {
        const b = fitFormula(src, R.w - 2 * pad, fs);
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 9;
      }
      return h;
    }

    function relCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = Fz(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('relT'));
      const f = fn();
      const v = f.f(shownX);
      const active = [v > 0.02, v < -0.02, Math.abs(v) < 0.08, false];
      const lh = Math.min(Fz(26, 24), (R.h - 34) / 4);
      ['r1', 'r2', 'r3', 'r4'].forEach((k, i) => {
        const y = R.y + 30 + i * lh;
        if (active[i]) {
          g.fillStyle = withAlpha(i === 0 ? col.pos() : i === 1 ? col.neg() : col.F(), theme.dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y, R.w - 2 * pad + 12, lh - 3, 6);
          g.fill();
        }
        const b = fitFormula(`\\t{${ctx.t(k)}}`, R.w - 2 * pad, Fz(13, 12), active[i] ? theme.text : withAlpha(theme.text, 0.75), active[i] ? 700 : 600);
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
      if (dragging || reduced || Math.abs(p.c - shownC) < 1e-3) shownC = p.c;
      else {
        shownC += (p.c - shownC) * (1 - Math.exp(-dt * 9));
        moving = true;
      }
      visited = [Math.min(visited[0], shownX), Math.max(visited[1], shownX)];
      surface.begin();
      plot.resize();
      plotF.resize();
      drawTop();
      drawBottom();
      const C = regions().col;
      const gap = Fz(10, 8);
      const h1 = atCard({ ...C, h: 0 });
      atCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 110) relCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, Fz(150, 140)) });
      if (moving || dragging || sweep.running) ctx.requestRender();
      else if (sweepEnd) {
        sweepEnd = false;
        ctx.set({ x: Math.round((f.x[1] - 0.05) * 20) / 20 });
      }
    }

    return {
      update(changed) {
        if (changed.has('fn')) {
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
