import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { coefficients, factorial, FNS, remainder, taylor, type FnKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const NMAX = 15;
const RUN_N = 12;
const RUN_STEP_MS = 650;

/** Bildausschnitt und Name je Funktion. */
const VIEW: Record<FnKey, { x: [number, number]; y: [number, number]; name: string; plain: string }> = {
  sin: { x: [-7, 7], y: [-3, 3], name: '\\t{sin} x', plain: 'sin x' },
  cos: { x: [-7, 7], y: [-3, 3], name: '\\t{cos} x', plain: 'cos x' },
  exp: { x: [-4, 4], y: [-2, 10], name: 'e^x', plain: 'eˣ' },
  ln: { x: [-1.6, 4], y: [-4, 3], name: '\\t{ln}(1 + x)', plain: 'ln(1 + x)' },
  geo: { x: [-3, 3], y: [-4, 6], name: '\\f{1}{1 − x}', plain: '1/(1 − x)' },
};

/**
 * Taylorpolynome: Die Näherung Tₙ schmiegt sich an der Entwicklungsstelle a
 * an den Graphen von f. Grad erhöhen (mit Überblendung) oder alle Grade
 * durchlaufen lassen; ein Prüfpunkt zeigt den Fehler f(x) − Tₙ(x), ein
 * Balkendiagramm seine Größenordnung für n = 0 … 15. Für ln(1 + x) und
 * 1/(1 − x) wird das Konvergenzintervall markiert.
 */
export default defineSimulation({
  id: 'taylor-polynome',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'sin', label: L('sin x', 'sin x') },
        { value: 'cos', label: L('cos x', 'cos x') },
        { value: 'exp', label: L('eˣ', 'eˣ') },
        { value: 'ln', label: L('ln(1 + x)', 'ln(1 + x)') },
        { value: 'geo', label: L('1/(1 − x)', '1/(1 − x)') },
      ],
      default: 'sin',
    },
    { key: 'n', type: 'number', label: L('Grad n', 'Degree n'), min: 0, max: NMAX, step: 1, default: 3 },
    { key: 'a', type: 'number', label: L('Entwicklungsstelle a', 'Centre a'), min: -3.2, max: 3.2, step: 0.1, default: 0, help: L('Auch den Punkt auf dem Graphen ziehen.', 'You can also drag the point on the graph.') },
    { key: 'x', type: 'number', label: L('Prüfstelle x', 'Test point x'), min: -6, max: 6, step: 0.1, default: 2 },
    { key: 'err', type: 'boolean', group: 'view', label: L('Fehler und Konvergenzbereich zeigen', 'Show error and interval of convergence'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Koeffizienten zeigen', 'Show the coefficients'), help: L('Aus: Taylorpolynom selbst aufstellen.', 'Off: set up the Taylor polynomial yourself.'), default: true },
  ],
  actions: [
    { id: 'up', label: L('Grad erhöhen', 'Increase degree'), primary: true },
    { id: 'run', label: L('Alle Grade durchlaufen', 'Run through all degrees') },
  ],
  readouts: [
    { key: 'poly', label: L('Taylorpolynom', 'Taylor polynomial'), spoiler: true },
    { key: 'err', label: L('Fehler an der Prüfstelle', 'Error at the test point'), spoiler: true },
  ],
  presets: [
    { id: 'sin', label: L('sin x um 0', 'sin x about 0'), values: {} },
    { id: 'exp', label: L('eˣ: Näherung für e', 'eˣ: approximating e'), values: { fn: 'exp', n: 4, a: 0, x: 1 } },
    { id: 'cos', label: L('cos x um π', 'cos x about π'), values: { fn: 'cos', n: 2, a: 3.1, x: 2 } },
    { id: 'ln', label: L('ln(1 + x): nur für |x| < 1', 'ln(1 + x): only for |x| < 1'), values: { fn: 'ln', n: 6, a: 0, x: 1.5 } },
    { id: 'geo', label: L('Geometrische Reihe', 'Geometric series'), values: { fn: 'geo', n: 5, a: 0, x: 0.5 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen von f und dem Taylorpolynom Tₙ zur Entwicklungsstelle a (ziehbar); eine Prüfstelle x zeigt den Fehler zwischen beiden. Bei ln(1 + x) und 1/(1 − x) ist das Konvergenzintervall markiert. Daneben das Polynom mit Koeffizienten und ein Diagramm der Fehlergröße für verschiedene Grade.',
      polyT: 'Taylorpolynom',
      errT: 'Fehler an der Prüfstelle',
      general: 'allgemein',
      conv: 'Konvergenzintervall: |x − a| < {r}',
      convAll: 'Konvergiert für alle x.',
      outside: 'x liegt außerhalb – der Fehler wächst mit n!',
      chart: 'Fehler |f(x) − Tₙ(x)| für n = 0 … 15',
      dom: 'nicht definiert',
    },
    en: {
      canvas: 'Coordinate system with the graph of f and the Taylor polynomial Tₙ about the centre a (draggable); a test point x shows the error between them. For ln(1 + x) and 1/(1 − x) the interval of convergence is marked. Next to it the polynomial with its coefficients and a chart of the error for different degrees.',
      polyT: 'Taylor polynomial',
      errT: 'Error at the test point',
      general: 'in general',
      conv: 'interval of convergence: |x − a| < {r}',
      convAll: 'Converges for all x.',
      outside: 'x lies outside – the error grows with n!',
      chart: 'error |f(x) − Tₙ(x)| for n = 0 … 15',
      dom: 'not defined',
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
    const key = () => p.fn as FnKey;
    const fn = () => FNS[key()];
    /** Entwicklungsstelle im zulässigen Bereich der Funktion. */
    const aEff = () => clamp(p.a, fn().aMin, fn().aMax);

    const col = {
      f: () => th().series[0]!,
      T: () => th().series[3]!,
      a: () => th().series[4]!,
      x: () => th().series[1]!,
      conv: () => th().series[2]!,
    };

    /* ---------- Zahlen und Terme ---------- */
    const n2 = (v: number) => fmt.num(v, 2);
    /** Koeffizient als Formel: exakter Bruch, wenn möglich, sonst Dezimalzahl. */
    function coefSrc(c: number, k: number): { sign: number; body: string } {
      const sign = c < 0 ? -1 : 1;
      const v = Math.abs(c);
      for (const den of [1, k || 1, factorial(k)]) {
        const num = v * den;
        if (Math.abs(num - Math.round(num)) < 1e-9 && Math.round(num) <= 9999) {
          const nn = Math.round(num);
          if (den === 1) return { sign, body: String(nn) };
          return { sign, body: `\\f{${nn}}{${den}}` };
        }
      }
      return { sign, body: fmt.num(v, 3) };
    }
    function powSrc(a: number, k: number): string {
      const base = Math.abs(a) < 1e-9 ? 'x' : `(x ${a > 0 ? '−' : '+'} ${fmt.num(Math.abs(a), 1)})`;
      if (k === 0) return '';
      return k === 1 ? base : `${base}^${k}`;
    }
    /** Tₙ als Formelquelle (höchstens `maxTerms` Summanden ≠ 0, dann „+ …“). */
    function polySrc(n: number, maxTerms: number): string {
      const a = aEff();
      const c = coefficients(fn(), a, n);
      const parts: string[] = [];
      let shown = 0;
      let more = false;
      for (let k = 0; k <= n; k++) {
        if (c[k] === 0) continue;
        if (shown >= maxTerms) {
          more = true;
          break;
        }
        const { sign, body } = coefSrc(c[k]!, k);
        const pw = powSrc(a, k);
        const coef = pw && body === '1' ? '' : body;
        const term = pw ? `${coef}${coef && !coef.startsWith('\\f') ? ' · ' : ''}${pw}` : body;
        parts.push(parts.length ? ` ${sign < 0 ? '−' : '+'} ${term}` : `${sign < 0 ? '−' : ''}${term}`);
        shown++;
      }
      if (!parts.length) return '0';
      return parts.join('') + (more ? ' + …' : '');
    }
    const plain = (s: string) =>
      s
        .replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
        .replace(/\\t\{([^}]*)\}/g, '$1')
        .replace(/\^(\d+)/g, (_m, d: string) => d.split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join(''));

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.85, 250, h * 0.46));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.4, 280, 390));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-7, 7], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Zustand ---------- */
    let shownA = aEff();
    let lastFrame = performance.now();
    let dragging = 0;
    const blend = new Tween(700, ease.inOutCubic);
    let blendFrom = p.n;
    const run = new Tween(RUN_N * RUN_STEP_MS, ease.linear);

    /** Angezeigter Grad (beim Durchlaufen) und Überblendung zwischen zwei Graden. */
    function shownPoly(x: number): number {
      const a = shownA;
      if (run.running) {
        const t = run.value * RUN_N;
        const k = Math.floor(t);
        const u = ease.inOutCubic(clamp((t - k) / 0.6, 0, 1));
        return lerp(taylor(fn(), a, k, x), taylor(fn(), a, Math.min(k + 1, NMAX), x), u);
      }
      if (blend.running) return lerp(taylor(fn(), a, blendFrom, x), taylor(fn(), a, p.n, x), blend.value);
      return taylor(fn(), a, p.n, x);
    }
    const shownN = () => (run.running ? Math.min(RUN_N, Math.round(run.value * RUN_N)) : p.n);

    /* ---------- Griffe ---------- */
    plot.addHandle({
      get: () => [shownA, fn().f(shownA)],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ a: Math.round(clamp(x, fn().aMin, fn().aMax) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !run.running,
      color: () => col.a(),
    });
    plot.addHandle({
      get: () => [p.x, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ x: Math.round(clamp(x, -6, 6) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && p.err,
      color: () => col.x(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const sub = String(p.n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');
      ctx.readout('poly', `T${sub}(x) = ${plain(polySrc(p.n, 6))}`);
      const r = remainder(fn(), aEff(), p.n, p.x);
      ctx.readout('err', Number.isFinite(r) ? `f(${n2(p.x)}) − T(${n2(p.x)}) ≈ ${small(r)}` : ctx.t('dom'));
    }
    function small(v: number): string {
      if (v === 0) return '0';
      if (Math.abs(v) >= 1e-3 && Math.abs(v) < 1e6) return fmt.num(v, 4);
      const e = Math.floor(Math.log10(Math.abs(v)));
      const m = v / 10 ** e;
      return `${fmt.num(m, 2)} · 10${String(e).replace('-', '⁻').split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)] ?? c).join('')}`;
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
      palette: { f: col.f(), T: col.T(), a: col.a(), x: col.x(), c: col.conv(), m: th().muted },
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

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      const v = VIEW[key()];
      plot.setRange(v.x, v.y);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const f = fn();
      const a = shownA;
      // Konvergenzintervall
      const R = f.radius(a);
      if (p.err && Number.isFinite(R)) {
        const x0 = plot.px(a - R);
        const x1 = plot.px(a + R);
        g.save();
        g.fillStyle = withAlpha(col.conv(), theme.dark ? 0.12 : 0.08);
        g.fillRect(Math.max(r.x, x0), r.y, Math.min(r.x + r.w, x1) - Math.max(r.x, x0), r.h);
        g.strokeStyle = withAlpha(col.conv(), 0.7);
        g.setLineDash([6, 5]);
        g.lineWidth = 1.5;
        g.beginPath();
        for (const xx of [x0, x1]) {
          if (xx > r.x && xx < r.x + r.w) {
            g.moveTo(xx, r.y);
            g.lineTo(xx, r.y + r.h);
          }
        }
        g.stroke();
        g.restore();
      }
      // f
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      if (key() === 'geo') {
        plot.fn(f.f, { color: col.f(), width: 3, to: 1 - 1e-3 });
        plot.fn(f.f, { color: col.f(), width: 3, from: 1 + 1e-3 });
      } else plot.fn(f.f, { color: col.f(), width: 3, from: key() === 'ln' ? -1 + 1e-4 : undefined });
      g.restore();
      // Tₙ
      plot.fn(shownPoly, { color: col.T(), width: 3, dash: [9, 5] });
      // Fehler an der Prüfstelle
      if (p.err) {
        const x = p.x;
        const yf = f.f(x);
        const yt = shownPoly(x);
        const [px] = plot.toPx(x, 0);
        if (Number.isFinite(yf)) {
          const pf = clamp(plot.py(yf), r.y - 4, r.y + r.h + 4);
          const pt = clamp(plot.py(yt), r.y - 4, r.y + r.h + 4);
          g.save();
          g.strokeStyle = col.x();
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(px, pf);
          g.lineTo(px, pt);
          g.stroke();
          g.restore();
          plot.point(x, yf, { color: col.f(), radius: 4 });
          if (Number.isFinite(yt) && Math.abs(yt) < 1e6) plot.point(x, yt, { color: col.T(), radius: 4 });
        }
        plot.segment([x, 0], [x, Number.isFinite(yf) ? yf : 0], { color: withAlpha(col.x(), 0.5), width: 1.2, dash: [3, 3] });
        plot.point(x, 0, { color: col.x(), radius: 6.5 });
        tag(px + 8, plot.py(0) + 14, '\\c{x}{x}', col.x(), 'left', F(13, 12));
      }
      // Entwicklungsstelle
      plot.segment([a, 0], [a, f.f(a)], { color: withAlpha(col.a(), 0.6), width: 1.4, dash: [4, 4] });
      plot.point(a, f.f(a), { color: col.a(), radius: 7 });
      const [ax, ay] = plot.toPx(a, f.f(a));
      tag(ax + 10, ay - 16, `\\c{a}{a = ${fmt.num(a, 1)}}`, col.a(), 'left', F(13, 12));
      // Legende
      tag(r.x + 8, r.y + 14, `\\c{f}{f(x) = ${v.name}}`, col.f(), 'left', F(13.5, 12.5));
      tag(r.x + 8, r.y + 40, `\\c{T}{T_{${shownN()}}(x)}`, col.T(), 'left', F(13.5, 12.5));
      plot.end();
    }

    /* ---------- Karten ---------- */
    function polyCard(R: Rect): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const fs = F(15, 13.5);
      const rows: string[] = ['T_n(x) = \\c{m}{\\t{Σ}} \\f{f^{(k)}(a)}{k!} · (x − a)^k'];
      const n = shownN();
      rows.push(p.show ? `\\c{T}{T_{${n}}(x)} = ${polySrc(n, n > 6 ? 4 : 6)}` : `\\c{T}{T_{${n}}(x)} = ?`);
      const boxes = rows.map((src) => fitFormula(src, maxW, fs));
      const h = 30 + boxes.reduce((s, b) => s + b.asc + b.desc + 10, 0) + 2;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.T(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('polyT'), col.T());
      let y = R.y + 30;
      for (const b of boxes) {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 10;
      }
      return h;
    }

    function errCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('errT'));
      const f = fn();
      const a = aEff();
      const x = p.x;
      const yf = f.f(x);
      const yt = taylor(f, a, p.n, x);
      const fs = F(13.5, 12.5);
      let y = R.y + 30;
      const maxW = R.w - 2 * pad;
      const line = (src: string, color = theme.text) => {
        const b = fitFormula(src, maxW, fs, color);
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 6;
      };
      if (!Number.isFinite(yf)) line(`f(${n2(x)}) \\t{${ctx.t('dom')}}`, theme.muted);
      else {
        line(`\\c{f}{f(${n2(x)}) ≈ ${small(yf)}},   \\c{T}{T_{${p.n}}(${n2(x)}) ≈ ${small(yt)}}`);
        line(`\\c{x}{|f(x) − T_{${p.n}}(x)| ≈ ${small(Math.abs(yf - yt))}}`);
      }
      const Rr = f.radius(a);
      const inside = !Number.isFinite(Rr) || Math.abs(x - a) < Rr;
      const conv = Number.isFinite(Rr) ? tr('conv', { r: fmt.num(Rr, 1) }) : ctx.t('convAll');
      text(g, conv, R.x + pad, y + 8, { font: font(600, F(12, 11)), color: col.conv(), align: 'left' });
      y += 18;
      if (!inside) {
        text(g, ctx.t('outside'), R.x + pad, y + 8, { font: font(700, F(12, 11)), color: col.x(), align: 'left' });
        y += 18;
      }
      // Fehlerdiagramm (logarithmisch)
      const top = y + 28;
      const bottom = R.y + R.h - 22;
      if (bottom - top < 50 || !Number.isFinite(yf)) return;
      text(g, ctx.t('chart'), R.x + pad, top - 8, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: 'left' });
      const errs = Array.from({ length: NMAX + 1 }, (_, k) => Math.abs(remainder(f, a, k, x)));
      const lg = errs.map((e) => (e > 0 ? Math.log10(e) : -16));
      const hi = Math.max(1, Math.ceil(Math.max(...lg)));
      const lo = Math.min(-6, Math.floor(Math.min(...lg)));
      const x0 = R.x + pad + 30;
      const x1 = R.x + R.w - pad;
      const bw = (x1 - x0) / (NMAX + 1);
      const Y = (v: number) => lerp(bottom, top, (v - lo) / (hi - lo));
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      for (let e = lo; e <= hi; e += Math.max(1, Math.round((hi - lo) / 4))) {
        g.beginPath();
        g.moveTo(x0, Y(e));
        g.lineTo(x1, Y(e));
        g.stroke();
        text(g, `10${String(e).replace('-', '⁻').split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)] ?? c).join('')}`, x0 - 4, Y(e), { font: font(600, 9.5), color: theme.muted, align: 'right' });
      }
      lg.forEach((v, k) => {
        const yy = Y(Math.max(lo, v));
        const on = k === p.n;
        g.fillStyle = on ? col.x() : withAlpha(col.x(), 0.35);
        g.fillRect(x0 + k * bw + 1.5, yy, bw - 3, bottom - yy);
        if (k % 5 === 0 || on) text(g, String(k), x0 + (k + 0.5) * bw, bottom + 9, { font: font(on ? 700 : 600, 10), color: on ? col.x() : theme.muted });
      });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      const goalA = aEff();
      if (dragging || reduced || Math.abs(goalA - shownA) < 1e-3) shownA = goalA;
      else {
        shownA += (goalA - shownA) * (1 - Math.exp(-dt * 9));
        moving = true;
      }
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = polyCard({ ...C, h: 0 });
      polyCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (p.err && C.h - h1 - gap > 90) errCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, wideLayout() ? C.h : 260) });
      if (moving || dragging || blend.running || run.running) ctx.requestRender();
      else if (runPending) {
        runPending = false;
        ctx.set({ n: RUN_N });
      }
    }
    let runPending = false;

    return {
      update(changed, source) {
        if (changed.has('fn') && source === 'input' && Math.abs(aEff() - p.a) > 1e-9) ctx.set({ a: aEff() });
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'up') {
          if (p.n >= NMAX) return;
          blendFrom = p.n;
          ctx.set({ n: p.n + 1 });
          blend.play(reduced ? 1 : 700);
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
