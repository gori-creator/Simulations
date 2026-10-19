import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { FNS, integralFn, stripMean, type FnKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const H_MS = 3500;

const VIEW: Record<FnKey, { y: [number, number]; Y: [number, number]; f: string; F: string }> = {
  lin: { y: [-4, 4], Y: [-6, 8], f: 'f(x) = x', F: 'F(x) = \\f{1}{2}x²' },
  par: { y: [-1.5, 5], Y: [-4, 4], f: 'f(x) = 0,5x² − 1', F: 'F(x) = \\f{1}{6}x³ − x' },
  cos: { y: [-1.6, 1.6], Y: [-2.5, 2.5], f: 'f(x) = \\t{cos} x', F: 'F(x) = \\t{sin} x' },
  exp: { y: [-0.5, 4.8], Y: [-2, 9], f: 'f(x) = e^{0,5x}', F: 'F(x) = 2e^{0,5x}' },
};

/**
 * Integralfunktion und Hauptsatz: oben die Fläche unter f von der (ziehbaren)
 * unteren Grenze a bis x und ein schmaler Streifen der Breite h, unten die
 * Integralfunktion I_a mit der Sekante über [x; x + h]. Lässt man h gegen 0
 * gehen, wird die Sekante zur Tangente und ihre Steigung zu f(x): I_a′ = f.
 * Daneben ∫ₐᵇ f(x) dx = F(b) − F(a) mit Zahlen.
 */
export default defineSimulation({
  id: 'hauptsatz',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.46 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion f', 'Function f'),
      options: [
        { value: 'lin', label: L('f(x) = x', 'f(x) = x') },
        { value: 'par', label: L('f(x) = 0,5x² − 1', 'f(x) = 0.5x² − 1') },
        { value: 'cos', label: L('f(x) = cos x', 'f(x) = cos x') },
        { value: 'exp', label: L('f(x) = e^(0,5x)', 'f(x) = e^(0.5x)') },
      ],
      default: 'par',
    },
    { key: 'a', type: 'number', label: L('untere Grenze a', 'Lower limit a'), min: -4, max: 4, step: 0.1, default: -1, help: L('Auch a und x auf der x-Achse ziehen.', 'You can also drag a and x along the x-axis.') },
    { key: 'x', type: 'number', label: L('obere Grenze x', 'Upper limit x'), min: -6, max: 6, step: 0.05, default: 2 },
    { key: 'h', type: 'number', label: L('Streifenbreite h', 'Strip width h'), min: 0.05, max: 1.5, step: 0.05, default: 0.8 },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Integral selbst berechnen.', 'Off: compute the integral yourself.'), default: true },
  ],
  actions: [{ id: 'shrink', label: L('h gegen 0 gehen lassen', 'Let h tend to 0'), primary: true }],
  readouts: [
    { key: 'int', label: L('Integral', 'Integral'), spoiler: true },
    { key: 'dq', label: L('Differenzenquotient', 'Difference quotient'), spoiler: true },
  ],
  presets: [
    { id: 'par', label: L('Parabel, a = −1', 'Parabola, a = −1'), values: {} },
    { id: 'lin', label: L('f(x) = x: Dreiecksflächen', 'f(x) = x: triangle areas'), values: { fn: 'lin', a: 0, x: 3, h: 1 } },
    { id: 'cos', label: L('cos x von 0 bis π', 'cos x from 0 to π'), values: { fn: 'cos', a: 0, x: 3.15, h: 0.6 } },
    { id: 'exp', label: L('e-Funktion', 'Exponential'), values: { fn: 'exp', a: -2, x: 1.5, h: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Oben der Graph von f mit der Fläche von der unteren Grenze a bis x und einem Streifen der Breite h; unten die Integralfunktion I_a mit einer Sekante über dem Streifen. Daneben der Hauptsatz mit Zahlen.',
      defT: 'Integralfunktion',
      hsT: 'Hauptsatz',
      part1: 'Ableitung der Integralfunktion:',
      part2: 'Berechnung mit einer Stammfunktion:',
      strip: 'Streifen:',
      zeroA: 'Die Integralfunktion hat bei x = a immer eine Nullstelle.',
    },
    en: {
      canvas: 'Top: the graph of f with the area from the lower limit a to x and a strip of width h; bottom: the integral function I_a with a secant over the strip. Next to it the fundamental theorem with numbers.',
      defT: 'Integral function',
      hsT: 'Fundamental theorem',
      part1: 'Derivative of the integral function:',
      part2: 'Evaluation with an antiderivative:',
      strip: 'strip:',
      zeroA: 'The integral function always has a zero at x = a.',
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
    const lim = (v: number) => clamp(v, fn().x[0] + 0.05, fn().x[1] - 0.05);

    const col = {
      f: () => th().series[0]!,
      I: () => th().series[3]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      h: () => th().series[4]!,
      a: () => th().series[5]!,
    };
    const n2 = (v: number) => fmt.num(Math.abs(v) < 5e-4 ? 0 : v, 2);
    const n3 = (v: number) => fmt.num(Math.abs(v) < 5e-5 ? 0 : v, 3);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { top: Rect; bot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 1.15, 300, h * 0.58));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.38, 270, 370));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      const t1 = Math.round(left.h * 0.5);
      return { top: { ...left, h: t1 }, bot: { x: left.x, y: left.y + t1 + 6, w: left.w, h: left.h - t1 - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [-3, 3], y: [-2, 2], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top });
    const plotI = new Plot(surface, { x: [-3, 3], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot, yAxis: { label: 'y' } });

    /* ---------- Zustand ---------- */
    let shown = { a: lim(p.a), x: lim(p.x), h: p.h };
    let lastFrame = performance.now();
    let dragging = 0;
    const shrink = new Tween(H_MS, ease.inOutCubic);
    let shrinkFrom = p.h;

    plot.addHandle({
      get: () => [shown.a, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ a: Math.round(clamp(lim(x), -4, 4) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked,
      color: () => col.a(),
    });
    plot.addHandle({
      get: () => [shown.x, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ x: Math.round(lim(x) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => !ctx.locked,
      color: () => col.I(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const a = lim(p.a);
      const x = lim(p.x);
      const eq = (v: number) => (Math.abs(v - Math.round(v * 1000) / 1000) < 1e-9 ? '=' : '≈');
      const iv = integralFn(fn(), a, x);
      const dq = stripMean(fn(), x, p.h);
      const fx = fn().f(x);
      ctx.readout('int', `∫ von ${n2(a)} bis ${n2(x)} ${eq(iv)} ${n3(iv)}`);
      ctx.readout('dq', `(I(x + h) − I(x)) / h ${eq(dq)} ${n3(dq)}, f(x) ${eq(fx)} ${n3(fx)}`);
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
      palette: { f: col.f(), I: col.I(), h: col.h(), a: col.a(), p: col.pos(), m: th().muted },
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
      const { a, x, h } = shown;
      const lo = Math.min(a, x);
      const hi = Math.max(a, x);
      plot.fillBetween((t) => Math.max(f.f(t), 0), () => 0, lo, hi, { fill: withAlpha(col.pos(), theme.dark ? 0.35 : 0.24) });
      plot.fillBetween((t) => Math.min(f.f(t), 0), () => 0, lo, hi, { fill: withAlpha(col.neg(), theme.dark ? 0.35 : 0.24) });
      // Streifen [x; x + h] und Rechteck f(x) · h
      const x2 = Math.min(x + h, f.x[1]);
      plot.fillBetween(f.f, () => 0, x, x2, { fill: withAlpha(col.h(), theme.dark ? 0.55 : 0.4) });
      plot.polygon(
        [
          [x, 0],
          [x2, 0],
          [x2, f.f(x)],
          [x, f.f(x)],
        ],
        { stroke: col.h(), width: 1.6, dash: [4, 3] },
      );
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f.f, { color: col.f(), width: 3 });
      g.restore();
      plot.segment([a, 0], [a, f.f(a)], { color: col.a(), width: 2 });
      plot.segment([x, 0], [x, f.f(x)], { color: col.I(), width: 2 });
      plot.point(a, 0, { color: col.a(), radius: 6.5 });
      plot.point(x, 0, { color: col.I(), radius: 6.5 });
      tag(plot, plot.px(a), plot.py(0) + 16, '\\c{a}{a}', col.a(), 'center', F(13, 12));
      tag(plot, plot.px(x), plot.py(0) + 16, '\\c{I}{x}', col.I(), 'center', F(13, 12));
      tag(plot, plot.px(x2) + 8, plot.py(f.f(x)) - 12, `\\c{h}{h = ${fmt.num(h, 2)}}`, col.h(), 'left', F(12, 11));
      tag(plot, r.x + 8, r.y + 14, `\\c{f}{${v.f}}`, col.f(), 'left', F(13, 12));
      plot.end();
    }

    function drawBottom(): void {
      const g = surface.g;
      const theme = th();
      const f = fn();
      const v = VIEW[key()];
      plotI.setRange(f.x, v.Y);
      plotI.begin();
      plotI.grid();
      plotI.axes();
      const r = plotI.rect;
      const { a, x, h } = shown;
      const I = (t: number) => integralFn(f, a, t);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.I(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plotI.fn(I, { color: col.I(), width: 3 });
      g.restore();
      // Sekante über [x; x + h] (verlängert)
      const x2 = Math.min(x + h, f.x[1]);
      const m = stripMean(f, x, x2 - x || 1e-9);
      const ext = (f.x[1] - f.x[0]) * 0.08;
      plotI.segment([x - ext, I(x) - m * ext], [x2 + ext, I(x) + m * (x2 - x + ext)], { color: col.h(), width: 2.2 });
      // Tangente (Steigung f(x)) dünn zum Vergleich
      plotI.segment([x - ext * 1.5, I(x) - f.f(x) * ext * 1.5], [x + ext * 2.5, I(x) + f.f(x) * ext * 2.5], { color: withAlpha(col.f(), 0.6), width: 1.4, dash: [5, 4] });
      plotI.point(x, I(x), { color: col.I(), radius: 5.5 });
      plotI.point(x2, I(x2), { color: col.h(), radius: 4.5 });
      plotI.point(a, 0, { color: col.a(), radius: 5.5 });
      tag(plotI, r.x + 8, r.y + 14, `\\c{I}{I_a(x) = \\t{∫}_a^x f(t) dt}`, col.I(), 'left', F(13, 12));
      if (p.show) tag(plotI, plotI.px(x) - 10, plotI.py(I(x)) - 14, `\\c{I}{(${n2(x)} | ${n2(I(x))})}`, col.I(), 'right', F(12, 11));
      plotI.end();
    }

    /* ---------- Karten ---------- */
    function defCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const f = fn();
      const { a, x, h } = shown;
      const fs = F(14, 13);
      const rows = [
        `\\c{I}{I_a(x) = \\t{∫}_a^x f(t) dt}`,
        `\\c{I}{I_{${n2(a)}}(${n2(x)})} ≈ ${Q(n3(integralFn(f, a, x)))}`,
        `\\c{h}{\\t{${ctx.t('strip')}}} \\t{∫}_x^{x+h} f(t) dt ≈ ${Q(n3(integralFn(f, x, x + h)))},  f(x) · h ≈ ${Q(n3(f.f(x) * h))}`,
      ];
      const boxes = rows.map((s) => fitFormula(s, maxW, fs));
      const nf = font(600, F(12, 11));
      const h0 = 28 + boxes.reduce((s, b) => s + b.asc + b.desc + 8, 0) + 18;
      if (R.h <= 0) return h0;
      card({ ...R, h: h0 }, col.I(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('defT'), col.I());
      let y = R.y + 28;
      for (const b of boxes) {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      }
      text(g, ctx.t('zeroA'), R.x + pad, y + 6, { font: nf, color: theme.muted, align: 'left' });
      return h0;
    }

    function hsCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.f(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('hsT'), col.f());
      const f = fn();
      const v = VIEW[key()];
      const { a, x, h } = shown;
      const maxW = R.w - 2 * pad;
      const fs = F(14, 13);
      const lf = font(700, F(12, 11));
      let y = R.y + 30;
      const line = (src: string) => {
        const b = fitFormula(src, maxW - 6, fs);
        b.draw(g, R.x + pad + 6, y + b.asc);
        y += b.asc + b.desc + 7;
      };
      text(g, ctx.t('part1'), R.x + pad, y + 6, { font: lf, color: theme.muted, align: 'left' });
      y += 16;
      line(`\\f{I_a(x + \\c{h}{h}) − I_a(x)}{\\c{h}{h}} ≈ ${Q(n3(stripMean(f, x, h)))}  →  \\c{f}{f(x) ≈ ${n3(f.f(x))}}`);
      line(`\\c{I}{I_a′(x)} = \\c{f}{f(x)}`);
      y += 4;
      text(g, ctx.t('part2'), R.x + pad, y + 6, { font: lf, color: theme.muted, align: 'left' });
      y += 16;
      line(`\\c{m}{${v.F}}`);
      line(`\\t{∫}_{${n2(a)}}^{${n2(x)}} f(x) dx = F(${n2(x)}) − F(${n2(a)}) ≈ ${Q(n3(f.F(x)))} − ${Q(n3(f.F(a)))} ≈ \\c{I}{${Q(n3(integralFn(f, a, x)))}}`);
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      const goal = { a: lim(p.a), x: lim(p.x), h: shrink.running ? shrinkFrom + (0.05 - shrinkFrom) * shrink.value : p.h };
      const k = dragging || reduced ? 1 : 1 - Math.exp(-dt * 9);
      const next = { ...shown };
      for (const key2 of ['a', 'x', 'h'] as const) {
        const d = goal[key2] - shown[key2];
        if (Math.abs(d) < 1e-4 || (key2 === 'h' && shrink.running)) next[key2] = goal[key2];
        else {
          next[key2] = shown[key2] + d * k;
          moving = true;
        }
      }
      shown = next;
      surface.begin();
      plot.resize();
      plotI.resize();
      drawTop();
      drawBottom();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = defCard({ ...C, h: 0 });
      defCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 120) hsCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(220, 210)) });
      if (moving || dragging || shrink.running) ctx.requestRender();
      else if (shrinkEnd) {
        shrinkEnd = false;
        ctx.set({ h: 0.05 });
      }
    }
    let shrinkEnd = false;

    return {
      update() {
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'shrink') return;
        shrinkFrom = p.h;
        shrink.play(reduced ? 1 : H_MS);
        shrinkEnd = true;
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
