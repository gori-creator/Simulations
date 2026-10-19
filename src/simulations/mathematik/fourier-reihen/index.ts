import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { amplitude, harmonic, maxPartial, partial, target, type SigKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const NMAX = 30;
const RUN_N = 25;
const RUN_STEP_MS = 420;
const PI = Math.PI;

/** Reihe in Kurzform je Signal. */
const SERIES: Record<SigKey, string> = {
  sq: 'f(x) = \\f{4}{π}(\\t{sin} x + \\f{1}{3}\\t{sin} 3x + \\f{1}{5}\\t{sin} 5x + …)',
  saw: 'f(x) = \\f{2}{π}(\\t{sin} x − \\f{1}{2}\\t{sin} 2x + \\f{1}{3}\\t{sin} 3x − …)',
  tri: 'f(x) = \\f{8}{π²}(\\t{cos} x + \\f{1}{9}\\t{cos} 3x + \\f{1}{25}\\t{cos} 5x + …)',
  half: 'f(x) = \\f{1}{π} + \\f{1}{2}\\t{sin} x − \\f{2}{π}(\\f{1}{3}\\t{cos} 2x + \\f{1}{15}\\t{cos} 4x + …)',
};

/**
 * Fourier-Reihen: Rechteck-, Sägezahn-, Dreieck- und Einweg-Signal werden
 * aus Sinus- und Kosinusschwingungen aufgebaut. Oben die Partialsumme S_N
 * über dem Zielsignal, unten die einzelnen Teilschwingungen, daneben die
 * Reihe, das Amplitudenspektrum und das Gibbs-Phänomen an Sprungstellen.
 */
export default defineSimulation({
  id: 'fourier-reihen',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.46 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'sig',
      type: 'choice',
      label: L('Signal', 'Signal'),
      options: [
        { value: 'sq', label: L('Rechteck', 'Square wave') },
        { value: 'saw', label: L('Sägezahn', 'Sawtooth') },
        { value: 'tri', label: L('Dreieck', 'Triangle') },
        { value: 'half', label: L('Einweggleichrichtung', 'Half-wave rectified sine') },
      ],
      default: 'sq',
    },
    { key: 'n', type: 'number', label: L('Anzahl Teilschwingungen N', 'Number of harmonics N'), min: 1, max: NMAX, step: 1, default: 3 },
    { key: 'x', type: 'number', label: L('Prüfstelle x', 'Test point x'), min: -6, max: 6, step: 0.05, default: 1.2, help: L('Auch auf der x-Achse ziehen.', 'You can also drag it along the x-axis.') },
    { key: 'parts', type: 'boolean', group: 'view', label: L('Teilschwingungen zeigen', 'Show the harmonics'), default: true },
    { key: 'spec', type: 'boolean', group: 'view', label: L('Amplitudenspektrum zeigen', 'Show the amplitude spectrum'), default: true },
  ],
  actions: [
    { id: 'add', label: L('Nächste Teilschwingung', 'Next harmonic'), primary: true },
    { id: 'run', label: L('Aufbau abspielen', 'Play the build-up') },
  ],
  readouts: [
    { key: 'val', label: L('An der Prüfstelle', 'At the test point'), spoiler: true },
    { key: 'gibbs', label: L('Größter Wert von S_N', 'Largest value of S_N'), spoiler: true },
  ],
  presets: [
    { id: 'sq', label: L('Rechteck mit 3 Teilschwingungen', 'Square wave with 3 harmonics'), values: {} },
    { id: 'gibbs', label: L('Gibbs-Phänomen', 'Gibbs phenomenon'), values: { sig: 'sq', n: 30, x: 0.1 } },
    { id: 'saw', label: L('Sägezahn', 'Sawtooth'), values: { sig: 'saw', n: 6 } },
    { id: 'tri', label: L('Dreieck: schnelle Konvergenz', 'Triangle: fast convergence'), values: { sig: 'tri', n: 3 } },
    { id: 'half', label: L('Gleichgerichteter Wechselstrom', 'Rectified alternating current'), values: { sig: 'half', n: 6 } },
  ],
  strings: {
    de: {
      canvas: 'Oben die Partialsumme der Fourier-Reihe über dem Zielsignal mit einer ziehbaren Prüfstelle, unten die einzelnen Teilschwingungen. Daneben die Reihe als Formel, das Amplitudenspektrum und ein Hinweis zum Gibbs-Phänomen.',
      seriesT: 'Fourier-Reihe',
      specT: 'Amplitudenspektrum',
      partsT: 'Teilschwingungen',
      general: 'allgemein:',
      gibbs: 'Gibbs-Phänomen: An der Sprungstelle schießt S_N auf {m} hinaus (Ziel: 1) – auch bei großem N bleiben etwa 9 % der Sprunghöhe.',
      kink: 'Die Amplituden fallen wie 1/k² (nur Knicke, keine Sprünge) – die Reihe konvergiert schnell.',
      jump: 'Sprünge im Signal: Die Amplituden fallen nur wie 1/k, die Reihe konvergiert langsam.',
      terms: '{n} Teilschwingungen, davon {m} ≠ 0',
    },
    en: {
      canvas: 'Top: the partial sum of the Fourier series over the target signal with a draggable test point; below: the individual harmonics. Next to it the series as a formula, the amplitude spectrum and a note on the Gibbs phenomenon.',
      seriesT: 'Fourier series',
      specT: 'Amplitude spectrum',
      partsT: 'Harmonics',
      general: 'in general:',
      gibbs: 'Gibbs phenomenon: at the jump S_N overshoots to {m} (target: 1) – even for large N about 9 % of the jump remains.',
      kink: 'The amplitudes fall like 1/k² (only kinks, no jumps) – the series converges quickly.',
      jump: 'Jumps in the signal: the amplitudes only fall like 1/k, the series converges slowly.',
      terms: '{n} harmonics, {m} of them ≠ 0',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const sig = () => p.sig as SigKey;
    const hasJump = () => sig() === 'sq' || sig() === 'saw';

    const col = {
      S: () => th().series[0]!,
      f: () => th().muted,
      h: (k: number) => th().series[[3, 1, 4, 2, 5][(k - 1) % 5]!]!,
      x: () => th().series[1]!,
    };

    /* ---------- Aufteilung ---------- */
    function regions(): { main: Rect; parts: Rect | null; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * (p.parts ? 1.0 : 0.65), 230, h * 0.52));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.38, 270, 370));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      if (!p.parts) return { main: left, parts: null, col: colR };
      const mh = Math.round(left.h * 0.62);
      return { main: { ...left, h: mh }, parts: { x: left.x, y: left.y + mh + 6, w: left.w, h: left.h - mh - 6 }, col: colR };
    }
    const X: [number, number] = [-2 * PI - 0.3, 2 * PI + 0.3];
    const plot = new Plot(surface, { x: X, y: [-1.6, 1.6], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().main });
    const plotH = new Plot(surface, { x: X, y: [-1.4, 1.4], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().parts ?? { x: -10, y: -10, w: 1, h: 1 }, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- Zustand ---------- */
    let dragging = 0;
    const grow = new Tween(650, ease.inOutCubic);
    let growFrom = p.n;
    const run = new Tween(RUN_N * RUN_STEP_MS, ease.linear);
    let runPending = false;

    /** Angezeigte (ggf. überblendete) Partialsumme. */
    function shownSum(x: number): number {
      if (run.running) {
        const t = run.value * (RUN_N - 1) + 1;
        const k = Math.floor(t);
        const u = clamp((t - k) / 0.7, 0, 1);
        return lerp(partial(sig(), k, x), partial(sig(), Math.min(k + 1, NMAX), x), ease.inOutCubic(u));
      }
      if (grow.running) return lerp(partial(sig(), growFrom, x), partial(sig(), p.n, x), grow.value);
      return partial(sig(), p.n, x);
    }
    const shownN = () => (run.running ? Math.min(RUN_N, Math.round(run.value * (RUN_N - 1) + 1)) : p.n);

    /* ---------- Griff ---------- */
    plot.addHandle({
      get: () => [p.x, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ x: Math.round(clamp(x, -6, 6) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => !ctx.locked,
      color: () => col.x(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const s = partial(sig(), p.n, p.x);
      const f = target(sig(), p.x);
      ctx.readout('val', `S(${fmt.num(p.x, 2)}) ≈ ${fmt.num(s, 4)}, f(${fmt.num(p.x, 2)}) ${Math.abs(f - Math.round(f * 1e4) / 1e4) < 1e-12 ? '=' : '≈'} ${fmt.num(f, 4)}`);
      ctx.readout('gibbs', `≈ ${fmt.num(maxPartial(sig(), p.n, 1500), 3)}`);
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
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { S: col.S(), x: col.x(), m: th().muted },
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
    function drawMain(): void {
      const g = surface.g;
      const theme = th();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      // Zielsignal (gestrichelt; Sprünge nicht verbinden)
      g.save();
      g.setLineDash([6, 5]);
      plot.fn((x) => target(sig(), x), { color: withAlpha(col.f(), 0.9), width: 2 });
      g.restore();
      // Partialsumme
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.S(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(shownSum, { color: col.S(), width: 3 });
      g.restore();
      // Gibbs-Linie bei Sprüngen
      if (hasJump()) {
        const m = maxPartial(sig(), p.n, 800);
        if (m > 1.02) {
          plot.hline(m, { color: withAlpha(col.x(), 0.5), width: 1.2, dash: [3, 4] });
          tag(plot, r.x + r.w - 8, plot.py(m) - 12, `max ≈ ${fmt.num(m, 3)}`, col.x(), 'right', F(12, 11));
        }
      }
      // Prüfstelle
      const x = p.x;
      const s = shownSum(x);
      const f = target(sig(), x);
      plot.segment([x, f], [x, s], { color: col.x(), width: 3 });
      plot.segment([x, 0], [x, Math.min(f, s)], { color: withAlpha(col.x(), 0.4), width: 1.2, dash: [3, 3] });
      plot.point(x, s, { color: col.S(), radius: 4.5 });
      plot.point(x, 0, { color: col.x(), radius: 6.5 });
      // Legende
      tag(plot, r.x + 8, r.y + 14, `\\c{S}{S_{${shownN()}}(x)}`, col.S(), 'left', F(13.5, 12.5));
      tag(plot, r.x + 8, r.y + 38, `\\c{m}{f(x)}`, col.f(), 'left', F(13, 12));
      plot.end();
    }

    function drawParts(R: Rect): void {
      const g = surface.g;
      plotH.begin();
      plotH.grid();
      plotH.axes();
      const n = shownN();
      const newest = run.running ? n : p.n;
      for (let k = 1; k <= n; k++) {
        if (amplitude(sig(), k) < 1e-12) continue;
        const on = k === newest;
        plotH.fn((x) => harmonic(sig(), k, x), { color: withAlpha(col.h(k), on ? 1 : 0.45), width: on ? 2.6 : 1.3 });
      }
      text(g, ctx.t('partsT'), plotH.rect.x + 8, R.y + 10, { font: font(700, F(11.5, 10.5)), color: th().muted, align: 'left' });
      plotH.end();
    }

    /* ---------- Karten ---------- */
    function seriesCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const rows = [`\\t{${ctx.t('general')}} f(x) ≈ \\f{a_0}{2} + \\t{Σ} (a_k \\t{cos} kx + b_k \\t{sin} kx)`, SERIES[sig()]];
      const boxes = rows.map((src, i) => fitFormula(src, maxW, i === 0 ? F(13, 12) : F(15, 13.5), i === 0 ? theme.muted : theme.text));
      const nz = Array.from({ length: p.n }, (_, i) => amplitude(sig(), i + 1)).filter((a) => a > 1e-12).length;
      const h = 30 + boxes.reduce((s, b) => s + b.asc + b.desc + 8, 0) + 20;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.S(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('seriesT'), col.S());
      let y = R.y + 28;
      for (const b of boxes) {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      }
      text(g, tr('terms', { n: p.n, m: nz }), R.x + pad, y + 6, { font: font(600, F(12, 11)), color: theme.muted, align: 'left' });
      return h;
    }

    function specCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('specT'));
      const note = hasJump() ? `${ctx.t('jump')} ${tr('gibbs', { m: fmt.num(maxPartial(sig(), p.n, 800), 3) })}` : ctx.t('kink');
      const nf = font(600, F(12, 11));
      const rows = wrap(note, R.w - 2 * pad, nf);
      const noteH = rows.length * 15 + 6;
      const top = R.y + 30;
      const bottom = R.y + R.h - noteH - 18;
      const K = Math.max(12, Math.min(NMAX, p.n + 2));
      if (p.spec && bottom - top > 40) {
        const x0 = R.x + pad + 4;
        const x1 = R.x + R.w - pad;
        const bw = (x1 - x0) / K;
        const amax = Math.max(...Array.from({ length: K }, (_, i) => amplitude(sig(), i + 1)));
        for (let k = 1; k <= K; k++) {
          const a = amplitude(sig(), k);
          const hgt = ((bottom - top) * a) / amax;
          const used = k <= shownN();
          g.fillStyle = used ? col.h(k) : withAlpha(theme.muted, 0.25);
          if (a > 1e-12) g.fillRect(x0 + (k - 1) * bw + bw * 0.18, bottom - hgt, bw * 0.64, hgt);
          if (k === 1 || k % 5 === 0) text(g, String(k), x0 + (k - 0.5) * bw, bottom + 9, { font: font(600, 10), color: theme.muted });
        }
        g.strokeStyle = withAlpha(theme.text, 0.4);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x0, bottom);
        g.lineTo(x1, bottom);
        g.stroke();
      }
      rows.forEach((row, i) => text(g, row, R.x + pad, R.y + R.h - noteH + 6 + i * 15, { font: nf, color: hasJump() ? col.x() : theme.muted, align: 'left' }));
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      if (dragging && now - dragging > 250) dragging = 0;
      surface.begin();
      plot.resize();
      plotH.resize();
      drawMain();
      const R = regions();
      if (R.parts) drawParts(R.parts);
      const C = R.col;
      const gap = F(10, 8);
      const h1 = seriesCard({ ...C, h: 0 });
      seriesCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 90) specCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, wideLayout() ? C.h : 230) });
      if (dragging || grow.running || run.running) ctx.requestRender();
      else if (runPending) {
        runPending = false;
        ctx.set({ n: RUN_N });
      }
    }

    return {
      update() {
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'add') {
          if (p.n >= NMAX) return;
          growFrom = p.n;
          ctx.set({ n: p.n + 1 });
          grow.play(reduced ? 1 : 650);
        } else if (id === 'run') {
          run.play(reduced ? 1 : RUN_N * RUN_STEP_MS);
          runPending = true;
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
