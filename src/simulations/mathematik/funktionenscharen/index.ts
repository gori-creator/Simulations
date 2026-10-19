import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { FAMS, type FamKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const KMIN = -3;
const KMAX = 3;
const SWEEP_MS = 7000;

/** Darstellung und Texte je Schar. */
const INFO: Record<FamKey, { x: [number, number]; y: [number, number]; term: string; ext: string; locus: string; kFromX: (x: number) => number }> = {
  cub: { x: [-3, 3], y: [-6, 6], term: 'f_k(x) = x³ − kx', ext: 'x_{1,2} = ±\\r{\\f{k}{3}}  \\t{(für} k > 0\\t{)}', locus: 'y = −2x³', kFromX: (x) => 3 * x * x },
  par: { x: [-3, 4], y: [-8, 4], term: 'f_k(x) = x² − 2kx + k', ext: 'T(k | k − k²)', locus: 'y = x − x²', kFromX: (x) => x },
  exp: { x: [-3, 6], y: [-1.6, 2.2], term: 'f_k(x) = x · e^{−kx}', ext: '(\\f{1}{k} | \\f{1}{k · e})  \\t{(für} k ≠ 0\\t{)}', locus: 'y = \\f{x}{e}', kFromX: (x) => 1 / x },
  quart: { x: [-3, 3], y: [-3, 3.5], term: 'f_k(x) = kx² − x^4', ext: 'H(±\\r{\\f{k}{2}} | \\f{k²}{4})  \\t{(für} k > 0\\t{)}', locus: 'y = x^4', kFromX: (x) => 2 * x * x },
};

/**
 * Funktionenscharen: Viele Graphen einer Schar f_k blass im Hintergrund, der
 * aktuelle kräftig. Die Extrempunkte wandern beim Ändern von k auf ihrer
 * Ortskurve (auch direkt ziehbar); gemeinsame Punkte aller Scharkurven sind
 * markiert. Daneben die Fallunterscheidung nach k.
 */
export default defineSimulation({
  id: 'funktionenscharen',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fam',
      type: 'choice',
      label: L('Schar', 'Family'),
      options: [
        { value: 'cub', label: L('f_k(x) = x³ − kx', 'f_k(x) = x³ − kx') },
        { value: 'par', label: L('f_k(x) = x² − 2kx + k', 'f_k(x) = x² − 2kx + k') },
        { value: 'exp', label: L('f_k(x) = x · e^(−kx)', 'f_k(x) = x · e^(−kx)') },
        { value: 'quart', label: L('f_k(x) = kx² − x⁴', 'f_k(x) = kx² − x⁴') },
      ],
      default: 'cub',
    },
    { key: 'k', type: 'number', label: L('Parameter k', 'Parameter k'), min: KMIN, max: KMAX, step: 0.1, default: 1.5, help: L('Auch einen Extrempunkt ziehen.', 'You can also drag an extremum.') },
    { key: 'many', type: 'boolean', group: 'view', label: L('Weitere Scharkurven zeigen', 'Show more members of the family'), default: true },
    { key: 'loc', type: 'boolean', group: 'view', label: L('Ortskurve der Extrempunkte', 'Locus of the extrema'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnisse zeigen', 'Show the results'), help: L('Aus: Extrempunkte und Ortskurve selbst bestimmen.', 'Off: find the extrema and the locus yourself.'), default: true },
  ],
  actions: [{ id: 'sweep', label: L('k durchlaufen lassen', 'Run through k'), primary: true }],
  readouts: [
    { key: 'ext', label: L('Extrempunkte', 'Extrema'), spoiler: true },
    { key: 'loc', label: L('Ortskurve', 'Locus'), spoiler: true },
  ],
  presets: [
    { id: 'cub', label: L('x³ − kx', 'x³ − kx'), values: {} },
    { id: 'cubneg', label: L('x³ − kx mit k < 0: keine Extrema', 'x³ − kx with k < 0: no extrema'), values: { fam: 'cub', k: -1.5 } },
    { id: 'par', label: L('Parabelschar mit gemeinsamem Punkt', 'Parabolas with a common point'), values: { fam: 'par', k: 1 } },
    { id: 'exp', label: L('x · e^(−kx)', 'x · e^(−kx)'), values: { fam: 'exp', k: 1 } },
    { id: 'quart', label: L('kx² − x⁴: W oder umgedrehtes U', 'kx² − x⁴: M shape or upside-down U'), values: { fam: 'quart', k: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit mehreren Graphen einer Funktionenschar (blass) und dem Graphen für den gewählten Parameter k (kräftig); die Extrempunkte liegen auf einer gestrichelten Ortskurve und lassen sich entlang dieser ziehen; gemeinsame Punkte aller Scharkurven sind markiert. Daneben Scharterm, Extrempunkte in Abhängigkeit von k und die Fallunterscheidung.',
      famT: 'Funktionenschar',
      extT: 'Extrempunkte',
      locT: 'Ortskurve',
      comT: 'Gemeinsamer Punkt aller Scharkurven',
      general: 'allgemein:',
      forK: 'für k = {k}:',
      none: 'keine Extrempunkte',
      max: 'H',
      min: 'T',
      saddle: 'TP',
      c_cub_neg: 'k < 0: f′(x) = 3x² − k > 0 – streng monoton steigend, keine Extrempunkte.',
      c_cub_0: 'k = 0: f(x) = x³ – Terrassenpunkt bei (0 | 0).',
      c_cub_pos: 'k > 0: ein Hoch- und ein Tiefpunkt.',
      c_par: 'Für jedes k ein Tiefpunkt (Scheitel).',
      c_exp_pos: 'k > 0: Hochpunkt.',
      c_exp_neg: 'k < 0: Tiefpunkt.',
      c_exp_0: 'k = 0: f(x) = x – keine Extrempunkte.',
      c_quart_pos: 'k > 0: zwei Hochpunkte und ein Tiefpunkt (M-Form).',
      c_quart_neg: 'k ≤ 0: nur ein Hochpunkt bei (0 | 0).',
      locNote: 'Aus x = … nach k auflösen und in y einsetzen.',
    },
    en: {
      canvas: 'Coordinate system with several graphs of a family of functions (faint) and the graph for the chosen parameter k (bold); the extrema lie on a dashed locus and can be dragged along it; points common to all members are marked. Next to it the general term, the extrema depending on k and the case analysis.',
      famT: 'Family of functions',
      extT: 'Extrema',
      locT: 'Locus',
      comT: 'Point common to all members',
      general: 'in general:',
      forK: 'for k = {k}:',
      none: 'no extrema',
      max: 'H',
      min: 'T',
      saddle: 'TP',
      c_cub_neg: 'k < 0: f′(x) = 3x² − k > 0 – strictly increasing, no extrema.',
      c_cub_0: 'k = 0: f(x) = x³ – terrace point at (0 | 0).',
      c_cub_pos: 'k > 0: one maximum and one minimum.',
      c_par: 'For every k a minimum (vertex).',
      c_exp_pos: 'k > 0: maximum.',
      c_exp_neg: 'k < 0: minimum.',
      c_exp_0: 'k = 0: f(x) = x – no extrema.',
      c_quart_pos: 'k > 0: two maxima and one minimum (M shape).',
      c_quart_neg: 'k ≤ 0: only a maximum at (0 | 0).',
      locNote: 'Solve x = … for k and substitute into y.',
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
    const key = () => p.fam as FamKey;
    const fam = () => FAMS[key()];

    const col = {
      f: () => th().series[0]!,
      many: () => th().series[4]!,
      ext: () => th().series[1]!,
      loc: () => th().series[3]!,
      com: () => th().series[2]!,
    };
    const n2 = (v: number) => fmt.num(Math.abs(v) < 5e-4 ? 0 : v, 2);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.9, 260, h * 0.48));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.38, 270, 370));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-3, 3], y: [-6, 6], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Zustand ---------- */
    let shownK = p.k;
    let lastFrame = performance.now();
    let dragging = 0;
    const sweep = new Tween(SWEEP_MS, ease.linear);
    let sweepFrom = p.k;
    /** Spur der Extrempunkte während des Durchlaufs */
    let trail: [number, number][] = [];

    /** k während des Durchlaufs: von k nach KMIN, dann bis KMAX und zurück zu k. */
    function sweepK(t: number): number {
      const a = Math.abs(sweepFrom - KMIN);
      const b = KMAX - KMIN;
      const c = KMAX - sweepFrom;
      const s = t * (a + b + c);
      if (s < a) return sweepFrom - s;
      if (s < a + b) return KMIN + (s - a);
      return KMAX - (s - a - b);
    }

    /* ---------- Griff: Extrempunkt auf der Ortskurve ---------- */
    const dragExt = () => fam().extrema(shownK).find((e) => e.kind !== 'saddle' && !(key() === 'quart' && e.x === 0));
    plot.addHandle({
      get: () => {
        const e = dragExt();
        return e ? [e.x, e.y] : [1e6, 1e6];
      },
      set: (x) => {
        dragging = performance.now();
        if (key() === 'exp' && Math.abs(x) < 1 / KMAX) x = Math.sign(x || 1) / KMAX;
        const k = clamp(INFO[key()].kFromX(x), KMIN, KMAX);
        ctx.set({ k: Math.round(k * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !sweep.running && !!dragExt(),
      color: () => col.ext(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const e = fam().extrema(p.k);
      ctx.readout('ext', e.length ? e.map((q) => `${ctx.t(q.kind)}(${n2(q.x)} | ${n2(q.y)})`).join('; ') : ctx.t('none'));
      ctx.readout('loc', INFO[key()].locus.replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\^4/g, '⁴'));
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
      palette: { f: col.f(), x: col.ext(), l: col.loc(), c: col.com(), m: th().muted },
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
    function tag(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12)): void {
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
    /** Term mit eingesetztem k, z. B. x³ − 1,5x. */
    function termK(k: number): string {
      const kk = Math.round(k * 10) / 10;
      const s = (v: number, body: string, first = false) => {
        if (Math.abs(v) < 1e-9) return '';
        const sign = v < 0 ? '−' : first ? '' : '+';
        const abs = Math.abs(v);
        const c = Math.abs(abs - 1) < 1e-9 && body ? '' : fmt.num(abs, 1);
        return `${first ? sign : ` ${sign} `}${c}${body}`;
      };
      switch (key()) {
        case 'cub':
          return `x³${s(-kk, 'x')}`;
        case 'par':
          return `x²${s(-2 * kk, 'x')}${s(kk, '')}`;
        case 'exp':
          return Math.abs(kk) < 1e-9 ? 'x' : `x · e^{${kk > 0 ? '−' : ''}${Math.abs(kk) === 1 ? '' : fmt.num(Math.abs(kk), 1)}x}`;
        case 'quart':
          return `${s(kk, 'x²', true) || ''}${kk === 0 ? '−x^4' : ' − x^4'}`;
      }
    }
    function caseText(k: number): string {
      const kk = Math.round(k * 10) / 10;
      switch (key()) {
        case 'cub':
          return ctx.t(kk < 0 ? 'c_cub_neg' : kk === 0 ? 'c_cub_0' : 'c_cub_pos');
        case 'par':
          return ctx.t('c_par');
        case 'exp':
          return ctx.t(kk > 0 ? 'c_exp_pos' : kk < 0 ? 'c_exp_neg' : 'c_exp_0');
        case 'quart':
          return ctx.t(kk > 0 ? 'c_quart_pos' : 'c_quart_neg');
      }
    }

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      const info = INFO[key()];
      const fa = fam();
      plot.setRange(info.x, info.y);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      // weitere Scharkurven
      if (p.many) {
        for (let k = KMIN; k <= KMAX + 1e-9; k += 0.5) {
          if (Math.abs(k - shownK) < 0.05) continue;
          plot.fn((x) => fa.f(k, x), { color: withAlpha(col.many(), theme.dark ? 0.3 : 0.22), width: 1.4 });
        }
      }
      // Ortskurve
      if (p.loc && p.show) {
        g.save();
        g.setLineDash([8, 5]);
        plot.fn(fa.locus, { color: withAlpha(col.loc(), 0.9), width: 2.2 });
        g.restore();
        // Beschriftung
        const xs = info.x[1] - (info.x[1] - info.x[0]) * 0.12;
        let xl = xs;
        // Punkt auf der Ortskurve im Bild suchen
        for (let i = 0; i < 60; i++) {
          const yv = fa.locus(xl);
          if (yv > info.y[0] && yv < info.y[1]) break;
          xl -= (info.x[1] - info.x[0]) / 80;
        }
        const [lx, ly] = plot.toPx(xl, fa.locus(xl));
        tag(lx - 6, ly - 14, `\\c{l}{${info.locus}}`, col.loc(), 'right', F(12.5, 11.5));
      }
      // Spur beim Durchlauf
      for (const [x, y] of trail) plot.point(x, y, { color: withAlpha(col.ext(), 0.35), radius: 2.5 });
      // aktuelle Kurve
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn((x) => fa.f(shownK, x), { color: col.f(), width: 3.2 });
      g.restore();
      // gemeinsame Punkte
      for (const [cx, cy] of fa.common) {
        plot.point(cx, cy, { color: col.com(), radius: 5.5, hollow: true });
        const onExt = fa.extrema(shownK).some((e) => Math.hypot(e.x - cx, e.y - cy) < 0.05);
        if (p.show && !onExt) {
          const [px, py] = plot.toPx(cx, cy);
          tag(px - 10, py - 16, `\\c{c}{(${n2(cx)} | ${n2(cy)})}`, col.com(), 'right', F(12, 11));
        }
      }
      // Extrempunkte
      for (const e of fa.extrema(shownK)) {
        if (e.x < info.x[0] || e.x > info.x[1] || e.y < info.y[0] || e.y > info.y[1]) continue;
        plot.point(e.x, e.y, { color: col.ext(), radius: 6.5, hollow: e.kind === 'saddle' });
        const [px, py] = plot.toPx(e.x, e.y);
        const lab = p.show ? `\\c{x}{${ctx.t(e.kind)}(${n2(e.x)} | ${n2(e.y)})}` : `\\c{x}{${ctx.t(e.kind)}}`;
        tag(px, py + (e.kind === 'max' ? -18 : 18), lab, col.ext(), 'center', F(12.5, 11.5));
      }
      tag(r.x + 8, r.y + 14, `\\c{f}{f_{${fmt.num(Math.round(shownK * 10) / 10, 1)}}(x) = ${termK(shownK)}}`, col.f(), 'left', F(13.5, 12.5));
      plot.end();
    }

    /* ---------- Karten ---------- */
    function famCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const info = INFO[key()];
      const fs = F(14.5, 13);
      const ext = fam().extrema(p.k);
      const rows: { src?: string; label?: string; color?: string }[] = [
        { src: `\\c{f}{${info.term}}` },
        { label: ctx.t('extT') },
        { src: `\\t{${ctx.t('general')}} ${p.show ? info.ext : '?'}` },
        { src: `\\t{${tr('forK', { k: fmt.num(p.k, 1) })}} ${ext.length ? ext.map((e) => `${ctx.t(e.kind)}(${Q(n2(e.x))} | ${Q(n2(e.y))})`).join(', ') : `\\t{${ctx.t('none')}}`}`, color: col.ext() },
      ];
      const boxes = rows.map((r) => (r.src ? fitFormula(r.src, maxW - 6, fs, r.color ?? theme.text) : null));
      const cf = font(600, F(12.5, 11.5));
      const caseRows = wrap(caseText(p.k), maxW, cf);
      const h = 28 + rows.reduce((s, r, i) => s + (r.label ? 20 : boxes[i]!.asc + boxes[i]!.desc + 7), 0) + caseRows.length * 16 + 10;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.f(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('famT'), col.f());
      let y = R.y + 28;
      rows.forEach((r, i) => {
        if (r.label) {
          text(g, r.label, R.x + pad, y + 10, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
          y += 20;
        } else {
          const b = boxes[i]!;
          b.draw(g, R.x + pad + (i === 0 ? 0 : 6), y + b.asc);
          y += b.asc + b.desc + 7;
        }
      });
      for (const row of caseRows) {
        text(g, row, R.x + pad, y + 7, { font: cf, color: theme.text, align: 'left' });
        y += 16;
      }
      return h;
    }

    function locCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('locT'), col.loc());
      const info = INFO[key()];
      const fs = F(15, 13.5);
      let y = R.y + 28;
      const b = fitFormula(`\\c{l}{${p.show ? info.locus : 'y = ?'}}`, R.w - 2 * pad, fs);
      b.draw(g, R.x + pad + 6, y + b.asc);
      y += b.asc + b.desc + 8;
      const nf = font(600, F(12, 11));
      for (const row of wrap(ctx.t('locNote'), R.w - 2 * pad, nf)) {
        text(g, row, R.x + pad, y + 6, { font: nf, color: theme.muted, align: 'left' });
        y += 15;
      }
      y += 8;
      if (y + 40 > R.y + R.h) return;
      title(R.x + pad, y + 6, ctx.t('comT'), col.com());
      y += 16;
      const c = fam().common.map(([x0, y0]) => `(${Q(n2(x0))} | ${Q(n2(y0))})`).join(', ');
      const b2 = fitFormula(`\\c{c}{${c}}`, R.w - 2 * pad, fs);
      b2.draw(g, R.x + pad + 6, y + b2.asc);
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      if (sweep.running) {
        shownK = sweepK(sweep.value);
        for (const e of fam().extrema(shownK)) if (e.kind !== 'saddle') trail.push([e.x, e.y]);
        if (trail.length > 1500) trail = trail.slice(-1500);
      } else if (dragging || reduced || Math.abs(p.k - shownK) < 1e-3) shownK = p.k;
      else {
        shownK += (p.k - shownK) * (1 - Math.exp(-dt * 8));
        moving = true;
      }
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = famCard({ ...C, h: 0 });
      famCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 90) locCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(170, 160)) });
      if (moving || dragging || sweep.running) ctx.requestRender();
    }

    return {
      update(changed) {
        if (changed.has('fam')) {
          trail = [];
          shownK = p.k;
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'sweep') return;
        trail = [];
        sweepFrom = p.k;
        sweep.play(reduced ? 1 : SWEEP_MS);
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
