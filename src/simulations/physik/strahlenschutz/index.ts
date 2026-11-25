import { defineSimulation, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { distanceFactor, transmission, type Absorber, type Ray } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Zählrate ohne Absorber in 10 cm Abstand (Impulse pro Sekunde) und Nullrate. */
const R0 = 200;
const BG = 0.4;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.58);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Particle {
  x: number;
  y: number;
  stop: number;
}

/**
 * Ionisierende Strahlung: Alpha, Beta und Gamma durchdringen Papier,
 * Aluminium, Blei oder Beton unterschiedlich gut; Zählrohr mit Abstandsgesetz.
 */
export default defineSimulation({
  id: 'strahlenschutz',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'ray',
      type: 'choice',
      label: L('Strahlung', 'Radiation'),
      options: [
        { value: 'alpha', label: L('Alpha (α)', 'alpha (α)') },
        { value: 'beta', label: L('Beta (β)', 'beta (β)') },
        { value: 'gamma', label: L('Gamma (γ)', 'gamma (γ)') },
      ],
      default: 'beta',
    },
    {
      key: 'abs',
      type: 'choice',
      label: L('Absorber', 'Absorber'),
      options: [
        { value: 'none', label: L('keiner (nur Luft)', 'none (air only)') },
        { value: 'paper', label: L('Papier', 'paper') },
        { value: 'aluminium', label: L('Aluminium', 'aluminium') },
        { value: 'lead', label: L('Blei', 'lead') },
        { value: 'concrete', label: L('Beton', 'concrete') },
      ],
      default: 'aluminium',
    },
    { key: 'd', type: 'number', label: L('Dicke des Absorbers', 'Thickness of the absorber'), min: 0, max: 60, step: 0.1, default: 1, unit: 'mm', visibleIf: (v) => v.abs !== 'none' },
    { key: 'r', type: 'number', label: L('Abstand Quelle – Zählrohr', 'Distance source – counter'), min: 5, max: 50, step: 1, default: 10, unit: 'cm' },
  ],
  hint: L(
    'Jeder Punkt ist ein Teilchen bzw. Quant. Das Zählrohr knackt bei jedem Treffer – auch ohne Quelle kommt ab und zu etwas an (Nullrate).',
    'Each dot is a particle or quantum. The counter clicks at every hit – even without a source something arrives now and then (background).',
  ),
  readouts: [
    { key: 'rate', label: L('Zählrate', 'Count rate'), spoiler: true },
    { key: 'T', label: L('Durchgelassen', 'Transmitted'), spoiler: true },
    { key: 'info', label: L('Wirkung', 'Effect') },
  ],
  presets: [
    { id: 'alpha', label: L('Alpha und Papier', 'Alpha and paper'), values: { ray: 'alpha', abs: 'paper', d: 0.1 } },
    { id: 'beta', label: L('Beta und Aluminium', 'Beta and aluminium'), values: { ray: 'beta', abs: 'aluminium', d: 2 } },
    { id: 'gamma', label: L('Gamma und Blei', 'Gamma and lead'), values: { ray: 'gamma', abs: 'lead', d: 6.5 } },
    { id: 'abstand', label: L('Abstand verdoppeln', 'Double the distance'), values: { ray: 'gamma', abs: 'none', r: 20 } },
  ],
  strings: {
    de: {
      canvas: 'Strahlenquelle, Absorberplatte und Zählrohr mit fliegenden Teilchen; daneben ein Diagramm der Zählrate über der Absorberdicke',
      rateVal: '≈ {n} Impulse pro Sekunde (davon {bg} Nullrate)',
      Tval: '{t} % der Strahlung kommen durch den Absorber; Abstandsfaktor (10 cm / r)² = {f}',
      alphaInfo: 'Alpha: Heliumkerne, sehr kurze Reichweite (wenige cm Luft), aber innerlich (eingeatmet) besonders schädlich – Wichtungsfaktor 20.',
      betaInfo: 'Beta: schnelle Elektronen, Reichweite einige Meter in Luft; wenige Millimeter Aluminium oder Plexiglas schirmen ab.',
      gammaInfo: 'Gamma: energiereiche Photonen, nie ganz abzuschirmen; Blei oder Beton schwächen sie exponentiell (Halbwertsdicke).',
      d: 'd in mm',
      n: 'Impulse/s',
      source: 'Quelle',
      counter: 'Zählrohr',
    },
    en: {
      canvas: 'Radiation source, absorber plate and Geiger counter with flying particles; next to it a graph of the count rate against absorber thickness',
      rateVal: '≈ {n} counts per second (of which {bg} background)',
      Tval: '{t} % of the radiation pass through the absorber; distance factor (10 cm / r)² = {f}',
      alphaInfo: 'Alpha: helium nuclei, very short range (a few cm of air), but especially harmful inside the body – weighting factor 20.',
      betaInfo: 'Beta: fast electrons, range a few metres in air; a few millimetres of aluminium or acrylic shield them.',
      gammaInfo: 'Gamma: high-energy photons, never shielded completely; lead or concrete weaken them exponentially (half-value thickness).',
      d: 'd in mm',
      n: 'counts/s',
      source: 'source',
      counter: 'counter',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 60],
      y: [0, 200],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });
    const random = rng(7);
    let parts: Particle[] = [];
    let spawn = 0;
    let flash = 0;

    const ray = () => p.ray as Ray;
    const abs = () => p.abs as Absorber;
    const T = () => transmission(ray(), abs(), p.d);
    const rate = () => R0 * distanceFactor(p.r / 100) * T() + BG;
    const dMax = () => (ray() === 'alpha' ? 0.2 : ray() === 'beta' ? 6 : 60);

    function setupPlot(): void {
      plot.setRangePadded([0, dMax()], [0, R0 * distanceFactor(p.r / 100) * 1.1 + 1], { left: 46, right: 14, top: 22, bottom: 24 });
      plot.setAxes({ x: { label: ctx.t('d') }, y: { label: ctx.t('n') } });
    }

    function updateReadouts(): void {
      ctx.readout('rate', tr('rateVal', { n: fmt.num(rate(), rate() < 10 ? 1 : 0), bg: fmt.num(BG, 1) }));
      ctx.readout('T', tr('Tval', { t: fmt.num(100 * T(), 1), f: fmt.num(distanceFactor(p.r / 100), 2) }));
      ctx.readout('info', ctx.t(`${ray()}Info`));
    }

    function geom(r: Rect) {
      const sx = r.x + 40;
      const cy = r.y + r.h / 2;
      // Zählrohr zwischen 35 % (5 cm) und ganz rechts (50 cm); Absorber in der Mitte dazwischen
      const left = sx + Math.max(90, (r.w - 120) * 0.35);
      const dx = left + ((p.r - 5) / 45) * (r.x + r.w - 90 - left);
      const ax = sx + 20 + 0.45 * (dx - sx - 20);
      return { sx, cy, dx, ax };
    }

    function draw(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const G = geom(r);
      // Quelle
      roundRect(g, G.sx - 26, G.cy - 18, 30, 36, 6);
      g.fillStyle = th.text;
      g.fill();
      text(g, ctx.t('source'), G.sx - 11, G.cy + 30, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, ray() === 'alpha' ? 'α' : ray() === 'beta' ? 'β' : 'γ', G.sx - 11, G.cy, { font: `700 16px ${th.font}`, color: th.bg });
      // Absorber
      if (abs() !== 'none') {
        const w = Math.max(3, Math.min(40, (p.d / dMax()) * 40));
        const col: Record<Absorber, string> = { none: th.muted, paper: '#f5f5f4', skin: '#fca5a5', aluminium: '#cbd5e1', lead: '#475569', concrete: '#a8a29e' };
        g.fillStyle = col[abs()];
        g.fillRect(G.ax, G.cy - 50, w, 100);
        g.strokeStyle = th.text;
        g.lineWidth = 1;
        g.strokeRect(G.ax, G.cy - 50, w, 100);
      }
      // Zählrohr
      roundRect(g, G.dx, G.cy - 14, 70, 28, 14);
      g.fillStyle = flash > 0 ? th.series[2]! : withAlpha(th.muted, 0.6);
      g.fill();
      text(g, ctx.t('counter'), G.dx + 35, G.cy + 28, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, `r = ${fmt.num(p.r, 0)} cm`, (G.sx + G.dx) / 2, G.cy + 70, { font: `600 12px ${th.font}`, color: th.text });
      // Teilchen
      const col = ray() === 'alpha' ? th.series[1]! : ray() === 'beta' ? th.series[0]! : th.series[3]!;
      g.fillStyle = col;
      g.strokeStyle = col;
      for (const q of parts) {
        if (ray() === 'gamma') {
          g.lineWidth = 2;
          g.beginPath();
          for (let i = 0; i <= 8; i++) {
            const x = q.x - 16 + i * 2;
            const y = q.y + 3 * Math.sin(i * 1.6);
            if (i) g.lineTo(x, y);
            else g.moveTo(x, y);
          }
          g.stroke();
        } else {
          g.beginPath();
          g.arc(q.x, q.y, ray() === 'alpha' ? 5 : 3, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (abs() !== 'none') {
        plot.fn((d) => R0 * distanceFactor(p.r / 100) * transmission(ray(), abs(), d) + BG, { color: th.series[0]!, width: 3, from: 0, to: dMax() });
        plot.point(Math.min(p.d, dMax()), rate(), { color: th.series[1]!, radius: 6 });
      } else plot.hline(rate(), { color: th.series[0]!, width: 3 });
      plot.end();
    }

    return {
      update() {
        parts = [];
        setupPlot();
        updateReadouts();
      },
      tick(dt) {
        const r: Rect = split(surface.width, surface.height).scene;
        const G = geom(r);
        // sichtbare Teilchen: etwa 12 pro Sekunde
        spawn += dt * 12;
        while (spawn > 1) {
          spawn -= 1;
          const yOff = (random() - 0.5) * 40;
          // wird im Absorber gestoppt? (Luft: Alpha nach ~5 cm)
          let stop = Infinity;
          if (abs() !== 'none' && random() > T()) stop = G.ax + 4;
          else if (ray() === 'alpha' && p.r > 5 && random() < Math.min(1, (p.r - 4) / 4)) stop = G.sx + 30 + random() * 40;
          else if (random() > distanceFactor(p.r / 100) * 6) stop = G.dx - 20 - random() * 60; // geht am Zählrohr vorbei
          parts.push({ x: G.sx, y: G.cy + yOff * 0.2, stop });
        }
        const speed = ray() === 'alpha' ? 120 : 240;
        for (const q of parts) {
          q.x += speed * dt;
          q.y += (q.y - G.cy) * dt * 0.8;
        }
        const hit = parts.some((q) => q.x >= G.dx && q.stop === Infinity);
        if (hit) flash = 0.08;
        flash = Math.max(0, flash - dt);
        parts = parts.filter((q) => q.x < Math.min(q.stop, G.dx + 10));
      },
      resetTime() {
        parts = [];
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        draw(s.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
