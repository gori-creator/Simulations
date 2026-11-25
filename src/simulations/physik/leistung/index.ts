import { defineSimulation, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { power, PS, REFERENCES, work } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Höhe einer Treppenstufe in m. */
const STEP_H = 0.17;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.52);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Arbeit und Leistung: Wer eine Treppe hinaufläuft, verrichtet Hubarbeit.
 * Die Leistung wird mit Geräten und Maschinen verglichen.
 */
export default defineSimulation({
  id: 'leistung',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1.1 },
  params: [
    { key: 'm', type: 'number', label: L('Masse', 'Mass'), min: 20, max: 120, step: 1, default: 55, unit: 'kg' },
    { key: 'h', type: 'number', label: L('Höhe der Treppe', 'Height of the stairs'), min: 1, max: 20, step: 0.5, default: 6, unit: 'm' },
    { key: 't', type: 'number', label: L('Zeit', 'Time'), min: 2, max: 60, step: 0.5, default: 8, unit: 's' },
  ],
  hint: L(
    'Miss an einer Treppe: Höhe (Stufen zählen, je etwa 17 cm), Zeit und deine Masse. Drücke Start und vergleiche deine Leistung mit Geräten.',
    'Measure on real stairs: height (count the steps, about 17 cm each), time and your mass. Press play and compare your power with devices.',
  ),
  readouts: [
    { key: 'W', label: L('Hubarbeit', 'Work done lifting'), spoiler: true },
    { key: 'P', label: L('Leistung', 'Power'), spoiler: true },
    { key: 'cmp', label: L('Vergleich', 'Comparison') },
  ],
  presets: [
    { id: 'gehen', label: L('Gemütlich gehen', 'Walking calmly'), values: { m: 55, h: 6, t: 15 } },
    { id: 'rennen', label: L('Hochrennen', 'Running up'), values: { m: 55, h: 6, t: 5 } },
    { id: 'turm', label: L('Kirchturm (40 m)', 'Church tower (40 m)'), values: { m: 70, h: 20, t: 60 } },
  ],
  strings: {
    de: {
      canvas: 'Eine Person läuft eine Treppe hinauf, Höhe und Zeit sind angegeben; daneben ein Balkendiagramm, das die Leistung mit Geräten und Maschinen vergleicht',
      WVal: 'W = m·g·h ≈ {W} J',
      PVal: 'P = W/t ≈ {P} W ({ps} PS)',
      cmpVal: 'so viel wie {n} LED-Lampen',
      you: 'du',
      steps: '{n} Stufen',
      axis: 'Leistung in W (jeder Strich: zehnmal so viel)',
      axisShort: 'Leistung in W (Zehnerschritte)',
    },
    en: {
      canvas: 'A person runs up a staircase, height and time are given; next to it a bar chart comparing the power with devices and machines',
      WVal: 'W = m·g·h ≈ {W} J',
      PVal: 'P = W/t ≈ {P} W ({ps} hp)',
      cmpVal: 'as much as {n} LED lamps',
      you: 'you',
      steps: '{n} steps',
      axis: 'power in W (each mark: ten times as much)',
      axisShort: 'power in W (steps of ten)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let t = 0;
    let done = true;

    function updateReadouts(): void {
      const P = power(p.m, p.h, p.t);
      ctx.readout('W', tr('WVal', { W: fmt.num(work(p.m, p.h), 0) }));
      ctx.readout('P', tr('PVal', { P: fmt.num(P, 0), ps: fmt.num(P / PS, 2) }));
      ctx.readout('cmp', tr('cmpVal', { n: fmt.num(P / 10, 0) }));
    }

    function drawStairs(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const n = Math.max(1, Math.round(p.h / STEP_H));
      const shown = Math.min(n, 24);
      const left = r.x + 30;
      const right = r.x + r.w - 20;
      const bottom = r.y + r.h - 26;
      const H = Math.max(30, Math.min(70, r.h * 0.28));
      const top = r.y + 26 + H;
      const sw = (right - left) / (shown + 1);
      const sh = Math.min(sw * 0.9, (bottom - top) / shown);
      g.fillStyle = withAlpha(th.muted, 0.18);
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(left, bottom);
      for (let i = 0; i < shown; i++) {
        g.lineTo(left + (i + 1) * sw, bottom - i * sh);
        g.lineTo(left + (i + 1) * sw, bottom - (i + 1) * sh);
      }
      g.lineTo(right, bottom - shown * sh);
      g.lineTo(right, bottom);
      g.closePath();
      g.fill();
      g.stroke();
      // Person: Fortschritt entlang der Treppe
      const u = done ? 1 : Math.min(1, t / p.t);
      const k = u * shown;
      const px = left + sw * (k + 0.5);
      const py = bottom - Math.floor(Math.min(k, shown - 1e-6) + 1e-9) * sh - (k >= shown ? sh : 0);
      const swing = Math.sin(k * Math.PI * 2) * 0.35 * (done ? 0 : 1);
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(px, py - H * 0.88, H * 0.1, 0, Math.PI * 2);
      g.moveTo(px, py - H * 0.78);
      g.lineTo(px, py - H * 0.4);
      g.lineTo(px + H * 0.2 * Math.sin(swing + 0.3), py);
      g.moveTo(px, py - H * 0.4);
      g.lineTo(px - H * 0.2 * Math.sin(swing + 0.3), py);
      g.moveTo(px, py - H * 0.7);
      g.lineTo(px + H * 0.2, py - H * 0.5 + H * 0.1 * swing);
      g.moveTo(px, py - H * 0.7);
      g.lineTo(px - H * 0.2, py - H * 0.5 - H * 0.1 * swing);
      g.stroke();
      // Höhenpfeil
      const ax = right + 8;
      g.strokeStyle = th.muted;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(ax, bottom);
      g.lineTo(ax, bottom - shown * sh);
      g.stroke();
      subText(g, `h = ${fmt.num(p.h, 1)} m`, ax - 6, bottom - shown * sh * 0.35, { size: 13, family: th.mathFont, weight: 700, color: th.text, align: 'right', halo: th.bg });
      subText(g, tr('steps', { n }), left, bottom + 16, { size: 12, family: th.font, weight: 600, color: th.muted, align: 'left', halo: th.bg });
      const tt = done ? p.t : Math.min(t, p.t);
      subText(g, `t = ${fmt.num(tt, 1)} s`, left, r.y + 20, { size: 14, family: th.mathFont, weight: 700, color: th.text, align: 'left', halo: th.bg });
    }

    function drawBars(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const P = power(p.m, p.h, p.t);
      const items = [...REFERENCES.map((q) => ({ name: ctx.lang === 'de' ? q.de : q.en, P: q.P, you: false })), { name: ctx.t('you'), P, you: true }].sort((a, b) => a.P - b.P);
      const lMin = 0;
      const lMax = 7;
      const labW = Math.min(150, r.w * 0.38);
      const x0 = r.x + labW + 12;
      const x1 = r.x + r.w - 16;
      const top = r.y + 20;
      const bottom = r.y + r.h - 40;
      const bh = Math.min(26, (bottom - top) / items.length - 6);
      const X = (v: number) => x0 + ((Math.log10(Math.max(v, 1)) - lMin) / (lMax - lMin)) * (x1 - x0);
      // Gitterlinien je Zehnerpotenz
      g.strokeStyle = withAlpha(th.muted, 0.35);
      g.lineWidth = 1;
      for (let e = lMin; e <= lMax; e++) {
        g.beginPath();
        g.moveTo(X(10 ** e), top - 4);
        g.lineTo(X(10 ** e), bottom + 4);
        g.stroke();
        const lab = e === 0 ? '1' : e < 3 ? String(10 ** e) : e < 6 ? `${10 ** (e - 3)}k` : `${10 ** (e - 6)}M`;
        text(g, lab, X(10 ** e), bottom + 16, { font: `500 11px ${th.font}`, color: th.muted });
      }
      g.font = `600 11px ${th.font}`;
      const ax = g.measureText(ctx.t('axis')).width < r.w - 16 ? ctx.t('axis') : ctx.t('axisShort');
      text(g, ax, r.x + r.w / 2, bottom + 32, { font: `600 11px ${th.font}`, color: th.muted });
      items.forEach((it, i) => {
        const y = top + i * ((bottom - top) / items.length);
        g.fillStyle = it.you ? th.series[0]! : withAlpha(th.series[1]!, 0.55);
        g.fillRect(x0, y, Math.max(2, X(it.P) - x0), bh);
        subText(g, it.name, x0 - 8, y + bh / 2, { size: 12, family: th.font, weight: it.you ? 700 : 500, color: it.you ? th.series[0]! : th.text, align: 'right', halo: th.bg });
      });
    }

    return {
      update() {
        updateReadouts();
      },
      tick(dt) {
        if (done) {
          done = false;
          t = 0;
        }
        t += Math.min(dt, 0.05);
        if (t >= p.t) {
          done = true;
          ctx.clock.pause();
        }
      },
      resetTime() {
        t = 0;
        done = false;
      },
      render() {
        surface.begin();
        const sp = split(surface.width, surface.height);
        drawStairs(sp.scene);
        drawBars(sp.chart);
      },
      destroy: () => surface.destroy(),
    };
  },
});
