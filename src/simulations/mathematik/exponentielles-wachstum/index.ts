import { defineSimulation, Plot, roundRect, seededRandom, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { characteristicTime, exponential, growthFactor, linearComparison } from './model';

const L = (de: string, en: string) => ({ de, en });
type Scenario = 'seerosen' | 'zinsen' | 'zerfall' | 'frei';
const POND = 1024;
const PADS = 520;
const ATOMS = 400;

const DEFAULTS: Record<Scenario, { a: number; p: number; span: number }> = {
  seerosen: { a: 1, p: 100, span: 12 },
  zinsen: { a: 1000, p: 5, span: 40 },
  zerfall: { a: 1000, p: -8, span: 40 },
  frei: { a: 2, p: 50, span: 10 },
};

function layout(w: number, h: number): { visual: Rect; chart: Rect } {
  if (w >= 700) {
    const vw = Math.min(w * 0.4, h * 1.05);
    return { visual: { x: 0, y: 0, w: vw, h }, chart: { x: vw + 8, y: 8, w: w - vw - 16, h: h - 16 } };
  }
  return { visual: { x: 0, y: 0, w, h: h * 0.48 }, chart: { x: 6, y: h * 0.48 + 6, w: w - 12, h: h * 0.52 - 12 } };
}

/**
 * Exponentielles Wachstum und Zerfall f(t) = a · bᵗ an drei Beispielen:
 * Seerosen auf einem Teich, Zinseszins und radioaktiver Zerfall – jeweils mit
 * Graph, Vergleich zum linearen Wachstum und Verdopplungs- bzw. Halbwertszeit.
 */
export default defineSimulation({
  id: 'exponentielles-wachstum',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.75, aspectNarrow: 0.72 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'scenario',
      type: 'choice',
      label: L('Beispiel', 'Example'),
      options: [
        { value: 'seerosen', label: L('Seerosen', 'Water lilies') },
        { value: 'zinsen', label: L('Zinseszins', 'Compound interest') },
        { value: 'zerfall', label: L('Radioaktiver Zerfall', 'Radioactive decay') },
        { value: 'frei', label: L('Frei', 'Free') },
      ],
      default: 'seerosen',
    },
    { key: 'a', type: 'number', label: L('Anfangswert a', 'Initial value a'), min: 1, max: 2000, step: 1, default: 1 },
    { key: 'p', type: 'number', label: L('Änderung pro Zeitschritt p', 'Change per time step p'), min: -60, max: 100, step: 1, default: 100, unit: '%' },
    { key: 'span', type: 'number', label: L('Dargestellter Zeitraum', 'Time span shown'), min: 5, max: 60, step: 1, default: 12 },
    { key: 'linear', type: 'boolean', group: 'view', label: L('Vergleich: lineares Wachstum', 'Compare: linear growth'), default: false },
    { key: 'steps', type: 'boolean', group: 'view', label: L('Verdopplungs- bzw. Halbwertszeit', 'Doubling time or half-life'), default: true },
    { key: 'log', type: 'boolean', group: 'view', label: L('y-Achse logarithmisch', 'Logarithmic y-axis'), default: false },
  ],
  images: { pond: 'teich.webp', lily: 'seerose.webp' },
  readouts: [
    { key: 'term', label: L('Funktionsterm', 'Function'), spoiler: true },
    { key: 'factor', label: L('Wachstumsfaktor', 'Growth factor') },
    { key: 'time', label: L('Verdopplungs- bzw. Halbwertszeit', 'Doubling time or half-life'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'lilies', label: L('Seerosen verdoppeln sich täglich', 'Water lilies double daily'), values: {} },
    { id: 'interest', label: L('5 % Zinsen', '5 % interest'), values: { scenario: 'zinsen', a: 1000, p: 5, span: 40, linear: true } },
    { id: 'decay', label: L('Iod-131 (Halbwertszeit 8 Tage)', 'Iodine-131 (half-life 8 days)'), values: { scenario: 'zerfall', a: 1000, p: -8, span: 40 } },
    { id: 'compare', label: L('Exponentiell gegen linear', 'Exponential versus linear'), values: { scenario: 'frei', a: 2, p: 50, span: 10, linear: true } },
    { id: 'log', label: L('Logarithmische Achse', 'Logarithmic axis'), values: { scenario: 'zinsen', a: 1000, p: 5, span: 60, log: true } },
  ],
  strings: {
    de: {
      canvas: 'Bild des Beispiels und Graph der exponentiellen Funktion',
      unitT_seerosen: 'Tage',
      unitT_zinsen: 'Jahre',
      unitT_zerfall: 'Tage',
      unitT_frei: 'Schritte',
      unitY_seerosen: 'm²',
      unitY_zinsen: '€',
      unitY_zerfall: 'Kerne',
      unitY_frei: '',
      axisT: 't',
      covered: '{v} m² von {k} m² bedeckt ({q} %)',
      full: 'Teich voll',
      coin: '1 Münze = {v} €',
      balance: 'Kontostand: {v} €',
      nuclei: 'noch {v} von {a} Kernen',
      doubling: 'Verdopplungszeit T_d = ln 2 / ln b ≈ {t} {u}',
      half: 'Halbwertszeit T_½ = ln 0,5 / ln b ≈ {t} {u}',
      constant: 'b = 1: keine Änderung',
      factor: 'b = 1 + p/100 = {b} ({p} % pro Schritt)',
      now: 't = {t} {u}: f(t) ≈ {f} {y}',
      linearNow: ' · linear: {g} {y}',
      times2: '· 2',
      half2: ': 2',
      table: 'Wertetabelle',
    },
    en: {
      canvas: 'Picture of the example and graph of the exponential function',
      unitT_seerosen: 'days',
      unitT_zinsen: 'years',
      unitT_zerfall: 'days',
      unitT_frei: 'steps',
      unitY_seerosen: 'm²',
      unitY_zinsen: '€',
      unitY_zerfall: 'nuclei',
      unitY_frei: '',
      axisT: 't',
      covered: '{v} m² of {k} m² covered ({q} %)',
      full: 'pond full',
      coin: '1 coin = {v} €',
      balance: 'Balance: {v} €',
      nuclei: '{v} of {a} nuclei left',
      doubling: 'Doubling time T_d = ln 2 / ln b ≈ {t} {u}',
      half: 'Half-life T_½ = ln 0.5 / ln b ≈ {t} {u}',
      constant: 'b = 1: no change',
      factor: 'b = 1 + p/100 = {b} ({p} % per step)',
      now: 't = {t} {u}: f(t) ≈ {f} {y}',
      linearNow: ' · linear: {g} {y}',
      times2: '× 2',
      half2: '÷ 2',
      table: 'Table of values',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 12],
      y: [0, 100],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => layout(w, h).chart,
    });

    let t = 0;
    const scenario = () => p.scenario as Scenario;
    const unitT = () => ctx.t(`unitT_${scenario()}`);
    const unitY = () => ctx.t(`unitY_${scenario()}`);
    const f = (x: number) => exponential(p.a, p.p, x);
    const lin = (x: number) => linearComparison(p.a, p.p, x);
    const big = (v: number) => (Math.abs(v) >= 1e6 ? fmt.num(v, 0) : fmt.num(v, v < 10 ? 2 : v < 1000 ? 1 : 0));

    // Seerosen-Plätze (gleichmäßig verteilt, von einer Stelle aus wachsend)
    const pads = (() => {
      const rnd = seededRandom(7);
      const pts: [number, number][] = [];
      let tries = 0;
      while (pts.length < PADS && tries++ < 40000) {
        const x = rnd() * 2 - 1;
        const y = rnd() * 2 - 1;
        if (x * x + y * y > 0.92) continue;
        if (pts.some(([qx, qy]) => (qx - x) ** 2 + (qy - y) ** 2 < 0.0042)) continue;
        pts.push([x, y]);
      }
      return pts.sort((a, b) => Math.hypot(a[0] + 0.45, a[1] - 0.3) - Math.hypot(b[0] + 0.45, b[1] - 0.3));
    })();
    // Zerfallszeitpunkte der Kerne (gleichverteilte Zufallszahlen U → τ = ln U / ln b)
    const uniforms = (() => {
      const rnd = seededRandom(11);
      return Array.from({ length: ATOMS }, () => Math.max(1e-9, rnd()));
    })();

    function fitRange(): void {
      const span = p.span;
      let max = Math.max(f(0), f(span));
      if (p.linear) max = Math.max(max, lin(0), lin(span));
      if (p.log) {
        let min = Math.min(f(0), f(span));
        if (p.linear) min = Math.min(min, Math.max(1e-3, Math.min(lin(0), lin(span))));
        const lo = Math.floor(Math.log10(Math.max(1e-6, min)));
        const hi = Math.ceil(Math.log10(Math.max(max, 1e-6)) + 0.05);
        plot.setRangePadded([0, span], [lo, Math.max(hi, lo + 1)], { left: 58, right: 16, top: 16, bottom: 26 });
        plot.setAxes({ x: { label: `t in ${unitT()}` }, y: { label: unitY() || 'f(t)', minStep: 1, format: (v) => fmt.num(10 ** v, v < 0 ? -v : 0) } });
      } else {
        plot.setRangePadded([0, span], [0, max * 1.08], { left: 58, right: 16, top: 16, bottom: 26 });
        plot.setAxes({ x: { label: `t in ${unitT()}` }, y: { label: unitY() || 'f(t)', format: (v) => big(v) } });
      }
    }

    const Y = (v: number) => (p.log ? Math.log10(Math.max(v, 1e-9)) : v);

    function updateReadouts(): void {
      const b = growthFactor(p.p);
      ctx.readout('term', { html: `<var>f</var>(<var>t</var>) = ${fmt.num(p.a, 0)} · ${fmt.num(b, 2)}<sup><var>t</var></sup>` });
      ctx.readout('factor', tr('factor', { b: fmt.num(b, 2), p: fmt.signed(p.p, 0) }));
      const tc = characteristicTime(p.p);
      ctx.readout('time', Number.isNaN(tc) ? ctx.t('constant') : tr(p.p > 0 ? 'doubling' : 'half', { t: fmt.num(tc, 2), u: unitT() }));
      ctx.readout('now', tr('now', { t: fmt.num(t, 1), u: unitT(), f: big(f(t)), y: unitY() }) + (p.linear ? tr('linearNow', { g: big(lin(t)), y: unitY() }) : ''));
    }

    // Zeitpunkt auf dem Graphen ziehen
    plot.addHandle({
      get: () => [t, Y(f(t))],
      set: (x) => {
        ctx.clock.pause();
        t = Math.min(p.span, Math.max(0, x));
        updateReadouts();
        ctx.requestRender();
      },
      axis: 'x',
      color: () => ctx.theme.series[3]!,
    });

    /* ---------- Bildteil ---------- */
    function drawPond(r: Rect): void {
      const g = surface.g;
      const size = Math.min(r.w, r.h) - 20;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2 - 8;
      const pond = ctx.images.get('pond');
      const water = { rx: size * 0.42, ry: size * 0.38 };
      if (pond) {
        g.save();
        roundRect(g, cx - size / 2, cy - size / 2, size, size, 16);
        g.clip();
        g.drawImage(pond, cx - size / 2, cy - size / 2, size, size);
        g.restore();
      } else {
        g.fillStyle = ctx.theme.dark ? '#26432a' : '#7fb662';
        roundRect(g, cx - size / 2, cy - size / 2, size, size, 16);
        g.fill();
        const grad = g.createRadialGradient(cx - size * 0.1, cy - size * 0.1, size * 0.05, cx, cy, size * 0.45);
        grad.addColorStop(0, '#3f8fc0');
        grad.addColorStop(1, '#1d5a82');
        g.fillStyle = grad;
        g.beginPath();
        g.ellipse(cx, cy, water.rx + 6, water.ry + 6, 0, 0, Math.PI * 2);
        g.fill();
      }
      const covered = Math.min(f(t), POND);
      const count = covered <= 0 ? 0 : Math.max(1, Math.round((PADS * covered) / POND));
      const lily = ctx.images.get('lily');
      const padR = Math.sqrt((Math.PI * water.rx * water.ry) / PADS / Math.PI) * 1.18;
      for (let i = 0; i < Math.min(count, pads.length); i++) {
        const [u, v] = pads[i]!;
        const x = cx + u * water.rx;
        const y = cy + v * water.ry;
        const rot = (i * 2.4) % (Math.PI * 2);
        if (lily) {
          g.save();
          g.translate(x, y);
          g.rotate(rot);
          g.drawImage(lily, -padR, -padR, padR * 2, padR * 2);
          g.restore();
        } else {
          g.fillStyle = i % 5 === 0 ? '#4f9a3a' : '#3f8a30';
          g.beginPath();
          g.moveTo(x, y);
          g.arc(x, y, padR, rot + 0.3, rot + Math.PI * 2 - 0.3);
          g.closePath();
          g.fill();
          if (i % 17 === 0) {
            g.fillStyle = '#f7c6d9';
            g.beginPath();
            g.arc(x, y, padR * 0.35, 0, Math.PI * 2);
            g.fill();
          }
        }
      }
      label(r, tr('covered', { v: big(covered), k: POND, q: fmt.num((covered / POND) * 100, 1) }));
    }

    function drawCoins(r: Rect): void {
      const g = surface.g;
      const amount = Math.max(0, f(t));
      let value = 100;
      while (amount / value > 160) value *= 2;
      const coins = Math.round(amount / value);
      const perColumn = 20;
      const columns = Math.max(1, Math.ceil(coins / perColumn));
      const coinW = Math.min(46, (r.w - 40) / Math.max(4, Math.ceil(160 / perColumn)) - 6);
      const coinH = coinW * 0.32;
      const step = coinH * 0.55;
      const baseY = r.y + r.h - 50;
      const x0 = r.x + (r.w - columns * (coinW + 6)) / 2;
      for (let c = 0; c < columns; c++) {
        const inCol = Math.min(perColumn, coins - c * perColumn);
        for (let k = 0; k < inCol; k++) {
          const x = x0 + c * (coinW + 6) + coinW / 2;
          const y = baseY - k * step;
          g.fillStyle = '#a77a14';
          g.beginPath();
          g.ellipse(x, y + step * 0.35, coinW / 2, coinH / 2, 0, 0, Math.PI * 2);
          g.fill();
          const grad = g.createLinearGradient(x - coinW / 2, 0, x + coinW / 2, 0);
          grad.addColorStop(0, '#f5d76e');
          grad.addColorStop(0.5, '#ffeaa0');
          grad.addColorStop(1, '#d9ac2c');
          g.fillStyle = grad;
          g.beginPath();
          g.ellipse(x, y, coinW / 2, coinH / 2, 0, 0, Math.PI * 2);
          g.fill();
        }
      }
      text(g, tr('coin', { v: fmt.num(value, 0) }), r.x + r.w / 2, r.y + 20, { font: `600 12px ${ctx.theme.font}`, color: ctx.theme.muted });
      label(r, tr('balance', { v: fmt.num(amount, 2) }));
    }

    function drawAtoms(r: Rect): void {
      const g = surface.g;
      const b = growthFactor(p.p);
      const cols = 20;
      const rows = ATOMS / cols;
      const cell = Math.min((r.w - 30) / cols, (r.h - 70) / rows);
      const x0 = r.x + (r.w - cell * cols) / 2;
      const y0 = r.y + 16 + (r.h - 70 - cell * rows) / 2;
      let alive = 0;
      for (let i = 0; i < ATOMS; i++) {
        const tau = b < 1 ? Math.log(uniforms[i]!) / Math.log(b) : Infinity;
        const intact = t < tau;
        if (intact) alive++;
        const x = x0 + (i % cols) * cell + cell / 2;
        const y = y0 + Math.floor(i / cols) * cell + cell / 2;
        const justNow = !intact && t - tau < 0.6;
        if (intact) {
          const grad = g.createRadialGradient(x - cell * 0.12, y - cell * 0.12, 1, x, y, cell * 0.42);
          grad.addColorStop(0, '#fff6a8');
          grad.addColorStop(1, '#e0a417');
          g.fillStyle = grad;
          g.beginPath();
          g.arc(x, y, cell * 0.38, 0, Math.PI * 2);
          g.fill();
        } else {
          g.fillStyle = withAlpha(ctx.theme.muted, 0.35);
          g.beginPath();
          g.arc(x, y, cell * 0.22, 0, Math.PI * 2);
          g.fill();
          if (justNow) {
            g.strokeStyle = `rgba(255,120,60,${1 - (t - tau) / 0.6})`;
            g.lineWidth = 2;
            g.beginPath();
            g.arc(x, y, cell * (0.3 + (t - tau)), 0, Math.PI * 2);
            g.stroke();
          }
        }
      }
      label(r, tr('nuclei', { v: fmt.num((alive / ATOMS) * p.a, 0), a: fmt.num(p.a, 0) }));
    }

    function drawTable(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const rows = 7;
      const rowH = Math.min(30, (r.h - 60) / (rows + 1));
      const x0 = r.x + r.w * 0.12;
      const colW = r.w * 0.26;
      const y0 = r.y + 40;
      text(g, ctx.t('table'), r.x + r.w / 2, r.y + 18, { font: `700 13px ${theme.font}`, color: theme.muted });
      const head = ['t', 'f(t)', p.linear ? 'g(t)' : ''];
      head.forEach((h, i) => text(g, h, x0 + i * colW + colW / 2, y0, { font: `italic 700 15px ${theme.mathFont}`, color: i === 2 ? theme.series[1]! : theme.text }));
      for (let k = 0; k < rows; k++) {
        const y = y0 + (k + 1) * rowH;
        const current = Math.floor(t) === k;
        if (current) {
          g.fillStyle = withAlpha(theme.series[3]!, 0.15);
          g.fillRect(x0, y - rowH / 2, colW * (p.linear ? 3 : 2), rowH);
        }
        text(g, String(k), x0 + colW / 2, y, { font: `600 14px ${theme.font}`, color: theme.text });
        text(g, big(f(k)), x0 + colW * 1.5, y, { font: `600 14px ${theme.font}`, color: theme.series[0]! });
        if (p.linear) text(g, big(lin(k)), x0 + colW * 2.5, y, { font: `600 14px ${theme.font}`, color: theme.series[1]! });
        if (k < rows - 1) {
          text(g, `· ${fmt.num(growthFactor(p.p), 2)}`, x0 + colW * 2 + (p.linear ? colW + 10 : 6), y + rowH / 2, { font: `600 12px ${theme.font}`, color: theme.series[0]!, align: 'left' });
        }
      }
    }

    function label(r: Rect, value: string): void {
      const g = surface.g;
      g.font = `700 13px ${ctx.theme.font}`;
      const w = g.measureText(value).width + 20;
      g.fillStyle = ctx.theme.dark ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.92)';
      roundRect(g, r.x + (r.w - w) / 2, r.y + r.h - 34, w, 24, 10);
      g.fill();
      text(g, value, r.x + r.w / 2, r.y + r.h - 22, { font: `700 13px ${ctx.theme.font}`, color: ctx.theme.text });
    }

    /* ---------- Graph ---------- */
    function drawChart(): void {
      const theme = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const span = p.span;
      if (scenario() === 'seerosen') {
        plot.hline(Y(POND), { color: theme.series[2], width: 1.5, dash: [6, 5] });
        plot.text(span, Y(POND), ctx.t('full'), { color: theme.series[2], size: 12, align: 'right', offset: [-6, -10], weight: '600' });
      }
      // Verdopplungs- bzw. Halbwertszeit als Treppe
      const tc = characteristicTime(p.p);
      if (p.steps && Number.isFinite(tc) && tc > 0) {
        const factor = p.p > 0 ? 2 : 0.5;
        for (let k = 0; (k + 1) * tc <= span + 1e-9 && k < 12; k++) {
          const v0 = p.a * factor ** k;
          const v1 = v0 * factor;
          plot.segment([k * tc, Y(v0)], [(k + 1) * tc, Y(v0)], { color: theme.series[4], width: 1.5, dash: [4, 4] });
          plot.segment([(k + 1) * tc, Y(v0)], [(k + 1) * tc, Y(v1)], { color: theme.series[4], width: 1.5, dash: [4, 4] });
          if (k < 4) plot.text((k + 1) * tc, (Y(v0) + Y(v1)) / 2, ctx.t(p.p > 0 ? 'times2' : 'half2'), { color: theme.series[4], size: 12, offset: [6, 0], align: 'left', weight: '600' });
        }
      }
      if (p.linear) plot.fn((x) => Y(lin(x)), { color: theme.series[1], width: 2.5, from: 0, to: span });
      plot.fn((x) => Y(f(x)), { color: theme.series[0], width: 3, from: 0, to: span });
      // Werte zu ganzzahligen Zeitpunkten (bei langen Zeiträumen nur jeden 5.)
      const every = span > 15 ? 5 : 1;
      for (let k = 0; k <= span; k += every) plot.point(k, Y(f(k)), { color: theme.series[0], radius: 3.5 });
      // aktueller Zeitpunkt
      plot.segment([t, plot.bounds.yMin], [t, Y(f(t))], { color: theme.series[3], width: 1.5, dash: [4, 4] });
      plot.point(t, Y(f(t)), { color: theme.series[3], radius: 6 });
      plot.text(t, Y(f(t)), `${big(f(t))} ${unitY()}`, { color: theme.series[3], size: 13, weight: 'bold', offset: [10, -12], align: 'left' });
      plot.end();
    }

    return {
      update(changed, source) {
        if (changed.has('scenario') && source === 'input') {
          const d = DEFAULTS[scenario()];
          ctx.set({ a: d.a, p: d.p, span: d.span });
        }
        t = Math.min(t, p.span);
        fitRange();
        updateReadouts();
      },

      tick(dt) {
        if (t >= p.span) t = 0;
        t = Math.min(p.span, t + (dt * p.span) / 10);
        if (t >= p.span) ctx.clock.pause();
        updateReadouts();
      },

      resetTime() {
        t = 0;
        updateReadouts();
      },

      render() {
        const { visual } = layout(surface.width, surface.height);
        surface.begin();
        const g = surface.g;
        g.fillStyle = ctx.theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(16,24,40,0.03)';
        roundRect(g, visual.x + 6, visual.y + 6, visual.w - 12, visual.h - 12, 14);
        g.fill();
        const inner: Rect = { x: visual.x + 10, y: visual.y + 10, w: visual.w - 20, h: visual.h - 20 };
        if (scenario() === 'seerosen') drawPond(inner);
        else if (scenario() === 'zinsen') drawCoins(inner);
        else if (scenario() === 'zerfall') drawAtoms(inner);
        else drawTable(inner);
        drawChart();
      },

      destroy: () => surface.destroy(),
    };
  },
});
