import { defineSimulation, Plot, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { budget } from './model';

const L = (de: string, en: string) => ({ de, en });

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.6);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.6);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Treibhauseffekt: Strahlungshaushalt der Erde im Ein-Schicht-Modell mit
 * Albedo und Treibhausgasen; Pfeilbreiten entsprechen den Energieströmen.
 */
export default defineSimulation({
  id: 'treibhauseffekt',
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    { key: 'eps', type: 'number', label: L('Treibhausgase: Anteil der Wärmestrahlung, den die Luft aufnimmt', 'Greenhouse gases: share of thermal radiation absorbed by the air'), min: 0, max: 1, step: 0.01, default: 0.78 },
    { key: 'alb', type: 'number', label: L('Albedo (Anteil des zurückgeworfenen Sonnenlichts)', 'Albedo (share of sunlight reflected)'), min: 0.1, max: 0.7, step: 0.01, default: 0.3 },
  ],
  hint: L(
    'Die Breite der Pfeile zeigt, wie viel Energie fließt (in Watt je Quadratmeter Erdoberfläche).',
    'The width of the arrows shows how much energy flows (in watts per square metre of the Earth’s surface).',
  ),
  readouts: [
    { key: 'T', label: L('Mittlere Bodentemperatur', 'Mean surface temperature'), spoiler: true },
    { key: 'flows', label: L('Bilanz am Boden', 'Budget at the ground'), spoiler: true },
    { key: 'top', label: L('Bilanz oben', 'Budget at the top'), spoiler: true },
  ],
  presets: [
    { id: 'none', label: L('Ohne Treibhausgase', 'No greenhouse gases'), values: { eps: 0, alb: 0.3 } },
    { id: 'today', label: L('Heute', 'Today'), values: { eps: 0.78, alb: 0.3 } },
    { id: 'more', label: L('Mehr Treibhausgase', 'More greenhouse gases'), values: { eps: 0.82, alb: 0.3 } },
    { id: 'ice', label: L('Weniger Eis (dunkler)', 'Less ice (darker)'), values: { eps: 0.78, alb: 0.27 } },
    { id: 'snow', label: L('Schneeball-Erde', 'Snowball Earth'), values: { eps: 0.78, alb: 0.6 } },
  ],
  strings: {
    de: {
      canvas: 'Strahlungshaushalt der Erde: Sonnenlicht trifft auf den Boden, ein Teil wird zurückgeworfen; der Boden strahlt Wärme ab, die Atmosphäre nimmt einen Teil auf und strahlt ihn nach oben und unten ab; daneben ein Diagramm der Bodentemperatur',
      space: 'Weltall',
      atm: 'Atmosphäre',
      ground: 'Boden',
      sun: 'Sonnenlicht',
      refl: 'zurückgeworfen',
      surf: 'Boden strahlt',
      win: 'direkt ins All',
      up: 'Luft strahlt nach oben',
      down: 'Gegenstrahlung',
      eps: 'Treibhausgase ε',
      Ts: 'ϑ in °C',
      today: 'heute 15 °C',
      Tval: '{T} °C ({K} K)',
      flowsVal: 'Sonne {a} + Gegenstrahlung {d} = Abstrahlung {s} W/m²',
      topVal: 'aufgenommen {a} = direkt {w} + Atmosphäre {u} W/m²',
    },
    en: {
      canvas: 'Radiation budget of the Earth: sunlight reaches the ground, part of it is reflected; the ground emits heat radiation, the atmosphere absorbs part of it and emits it upwards and downwards; next to it a graph of the surface temperature',
      space: 'space',
      atm: 'atmosphere',
      ground: 'ground',
      sun: 'sunlight',
      refl: 'reflected',
      surf: 'ground emits',
      win: 'straight to space',
      up: 'air emits upwards',
      down: 'back radiation',
      eps: 'greenhouse gases ε',
      Ts: 'ϑ in °C',
      today: 'today 15 °C',
      Tval: '{T} °C ({K} K)',
      flowsVal: 'sun {a} + back radiation {d} = emission {s} W/m²',
      topVal: 'absorbed {a} = direct {w} + atmosphere {u} W/m²',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 1],
      y: [-40, 50],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });
    plot.setRangePadded([0, 1], [-60, 60], { left: 46, right: 14, top: 22, bottom: 24 });

    function updateReadouts(): void {
      const b = budget(p.alb, p.eps);
      const n = (v: number) => fmt.num(v, 0);
      ctx.readout('T', tr('Tval', { T: fmt.num(b.surfaceK - 273.15, 1), K: fmt.num(b.surfaceK, 0) }));
      ctx.readout('flows', tr('flowsVal', { a: n(b.absorbed), d: n(b.atmosphereEach), s: n(b.surfaceEmission) }));
      ctx.readout('top', tr('topVal', { a: n(b.absorbed), w: n(b.window), u: n(b.atmosphereEach) }));
    }

    function arrow(g: CanvasRenderingContext2D, x: number, y0: number, y1: number, width: number, color: string, wavy: boolean): void {
      const dir = Math.sign(y1 - y0);
      const head = Math.max(10, width * 1.1);
      const yEnd = y1 - dir * head;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = width;
      g.lineCap = 'butt';
      g.beginPath();
      if (wavy) {
        const n = Math.max(2, Math.floor(Math.abs(yEnd - y0) / 4));
        for (let i = 0; i <= n; i++) {
          const y = y0 + ((yEnd - y0) * i) / n;
          const xx = x + 5 * Math.sin((i / n) * Math.PI * 2 * Math.max(1, Math.abs(yEnd - y0) / 40));
          if (i) g.lineTo(xx, y);
          else g.moveTo(xx, y);
        }
      } else {
        g.moveTo(x, y0);
        g.lineTo(x, yEnd);
      }
      g.stroke();
      g.beginPath();
      g.moveTo(x - width / 2 - 6, yEnd);
      g.lineTo(x + width / 2 + 6, yEnd);
      g.lineTo(x, y1);
      g.closePath();
      g.fill();
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const b = budget(p.alb, p.eps);
      const top = r.y + 30;
      const atmY0 = r.y + r.h * 0.38;
      const atmY1 = r.y + r.h * 0.52;
      const groundY = r.y + r.h * 0.82;
      // Hintergrund
      g.fillStyle = withAlpha(th.series[0]!, 0.06);
      g.fillRect(r.x, r.y, r.w, atmY0 - r.y);
      g.fillStyle = withAlpha(th.series[0]!, 0.08 + 0.3 * p.eps);
      g.fillRect(r.x, atmY0, r.w, atmY1 - atmY0);
      g.fillStyle = withAlpha(th.series[2]!, 0.35 + 0.5 * (p.alb - 0.1));
      g.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);
      // Schnee/Eis: heller Anteil je nach Albedo
      g.fillStyle = 'rgba(255,255,255,0.75)';
      g.fillRect(r.x, groundY, r.w * Math.max(0, (p.alb - 0.1) / 0.6), 8);
      const fs = narrow ? 10 : 12;
      text(g, ctx.t('space'), r.x + r.w - 8, (top + atmY0) / 2, { font: `600 ${fs}px ${th.font}`, color: th.muted, align: 'right' });
      text(g, ctx.t('atm'), r.x + r.w - 8, (atmY0 + atmY1) / 2, { font: `600 ${fs}px ${th.font}`, color: th.muted, align: 'right' });
      text(g, ctx.t('ground'), r.x + 10, groundY + 18, { font: `600 ${fs}px ${th.font}`, color: th.text, align: 'left' });
      const wOf = (flux: number) => 2 + (16 * flux) / 450;
      const sun = th.series[3]!;
      const ir = th.series[1]!;
      const cols = narrow ? [0.08, 0.2, 0.33, 0.46, 0.6, 0.73] : [0.08, 0.21, 0.35, 0.49, 0.63, 0.77];
      const X = (k: number) => r.x + r.w * cols[k]!;
      // Sonne herein, zurückgeworfen
      arrow(g, X(0), top, groundY, wOf(b.incoming), sun, false);
      if (b.reflected > 0) arrow(g, X(1), groundY, top, wOf(b.reflected), withAlpha(sun, 0.6), false);
      // Boden strahlt (bis zur Atmosphäre), direkt ins All
      arrow(g, X(2), groundY, atmY1, wOf(b.surfaceEmission - b.window), ir, true);
      if (b.window > 1) arrow(g, X(3), groundY, top, wOf(b.window), withAlpha(ir, 0.6), true);
      if (b.atmosphereEach > 1) {
        arrow(g, X(4), atmY0, top, wOf(b.atmosphereEach), ir, true);
        arrow(g, X(5), atmY1, groundY, wOf(b.atmosphereEach), ir, true);
      }
      // Beschriftungen mit Zahlen
      const lab = (k: number, y: number, key: string, v: number) => {
        if (v < 1) return;
        text(g, `${fmt.num(v, 0)}`, X(k), y, { font: `700 ${fs + 1}px ${th.font}`, color: th.text });
        // Beschreibung senkrecht neben dem Pfeil
        g.save();
        g.translate(X(k) + 18, (top + atmY0) / 2);
        g.rotate(-Math.PI / 2);
        text(g, ctx.t(key), 0, 0, { font: `${fs - 1}px ${th.font}`, color: th.muted });
        g.restore();
      };
      const yLab = top - 14;
      lab(0, yLab, 'sun', b.incoming);
      lab(1, yLab, 'refl', b.reflected);
      lab(3, yLab, 'win', b.window);
      lab(4, yLab, 'up', b.atmosphereEach);
      text(g, fmt.num(b.surfaceEmission, 0), X(2), groundY + 18, { font: `700 ${fs + 1}px ${th.font}`, color: ir });
      if (b.atmosphereEach >= 1) text(g, fmt.num(b.atmosphereEach, 0), X(5), groundY + 18, { font: `700 ${fs + 1}px ${th.font}`, color: ir });
      if (!narrow) {
        text(g, ctx.t('surf'), X(2), groundY + 32, { font: `${fs - 1}px ${th.font}`, color: th.muted });
        if (b.atmosphereEach >= 1) text(g, ctx.t('down'), X(5), groundY + 32, { font: `${fs - 1}px ${th.font}`, color: th.muted });
      }
      text(g, `${fmt.num(b.surfaceK - 273.15, 1)} °C`, r.x + r.w - 10, groundY + 22, { font: `700 ${narrow ? 15 : 18}px ${th.font}`, color: th.text, align: 'right' });
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.hline(15, { color: withAlpha(th.muted, 0.8), width: 1.5, dash: [6, 5] });
      plot.text(0.02, 15, ctx.t('today'), { color: th.muted, size: 12, offset: [0, -8] });
      plot.fn((e) => budget(p.alb, e).surfaceK - 273.15, { color: th.series[1]!, width: 3, from: 0, to: 1 });
      if (p.alb !== 0.3) plot.fn((e) => budget(0.3, e).surfaceK - 273.15, { color: withAlpha(th.muted, 0.6), width: 1.5, from: 0, to: 1 });
      plot.point(p.eps, budget(p.alb, p.eps).surfaceK - 273.15, { color: th.series[1]!, radius: 6 });
      plot.end();
    }

    return {
      update(_changed, source) {
        if (source === 'init') plot.setAxes({ x: { label: ctx.t('eps') }, y: { label: ctx.t('Ts') } });
        updateReadouts();
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        drawScene(s.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});

