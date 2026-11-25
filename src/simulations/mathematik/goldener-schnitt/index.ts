import { defineSimulation, Plot, Surface } from '../../../sim-core';
import { construction, division, fibonacci, goldenSquares, PHI } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'teilung' | 'konstruktion' | 'rechteck' | 'fibonacci';
const LEN = 10;

/**
 * Goldener Schnitt: Teilung einer Strecke mit beiden Verhältnissen,
 * Konstruktion mit Zirkel und Lineal, goldenes Rechteck mit Spirale und
 * Fibonacci-Quotienten.
 */
export default defineSimulation({
  id: 'goldener-schnitt',
  layout: { aspect: 1.5, aspectNarrow: 0.9 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'teilung', label: L('Strecke teilen', 'Dividing a segment') },
        { value: 'konstruktion', label: L('Konstruktion', 'Construction') },
        { value: 'rechteck', label: L('Goldenes Rechteck', 'Golden rectangle') },
        { value: 'fibonacci', label: L('Fibonacci-Zahlen', 'Fibonacci numbers') },
      ],
      default: 'teilung',
      display: 'buttons',
    },
    { key: 't', type: 'number', label: L('Teilpunkt (Anteil der Strecke)', 'Division point (share of the segment)'), min: 0.5, max: 0.9, step: 0.001, default: 0.7, visibleIf: (v) => v.mode === 'teilung' },
    { key: 'step', type: 'number', label: L('Konstruktionsschritt', 'Construction step'), min: 1, max: 5, step: 1, default: 5, visibleIf: (v) => v.mode === 'konstruktion' },
    { key: 'depth', type: 'number', label: L('Anzahl Quadrate', 'Number of squares'), min: 1, max: 10, step: 1, default: 6, visibleIf: (v) => v.mode === 'rechteck' },
    { key: 'spiral', type: 'boolean', label: L('Spirale zeichnen', 'Draw the spiral'), default: true, visibleIf: (v) => v.mode === 'rechteck' },
    { key: 'n', type: 'number', label: L('Anzahl Fibonacci-Zahlen', 'Number of Fibonacci numbers'), min: 3, max: 20, step: 1, default: 10, visibleIf: (v) => v.mode === 'fibonacci' },
  ],
  hint: (v) =>
    v.mode === 'konstruktion'
      ? L('Gehe die Schritte einzeln durch: Lot, Hypotenuse, zwei Kreisbögen.', 'Go through the steps one by one: perpendicular, hypotenuse, two arcs.')
      : v.mode === 'rechteck'
        ? L('Schneidet man von einem goldenen Rechteck ein Quadrat ab, bleibt wieder ein goldenes Rechteck übrig.', 'Cutting a square off a golden rectangle leaves another golden rectangle.')
        : v.mode === 'fibonacci'
          ? L('Jede Zahl ist die Summe der beiden davor. Ihre Quotienten pendeln sich bei φ ein.', 'Each number is the sum of the two before it. Their ratios settle down at φ.')
          : L('Verschiebe den Teilpunkt. Wann ist „großer Teil : kleiner Teil“ genauso groß wie „Ganzes : großer Teil“?', 'Move the division point. When is “larger part : smaller part” the same as “whole : larger part”?'),
  readouts: [
    { key: 'r1', label: L('großer Teil : kleiner Teil', 'larger part : smaller part') },
    { key: 'r2', label: L('Ganzes : großer Teil', 'whole : larger part') },
    { key: 'phi', label: L('Goldene Zahl φ', 'Golden ratio φ'), spoiler: true },
    { key: 'info', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'gold', label: L('Goldener Schnitt', 'Golden section'), values: { mode: 'teilung', t: 0.618 } },
    { id: 'kon', label: L('Konstruktion', 'Construction'), values: { mode: 'konstruktion', step: 1 } },
    { id: 'spirale', label: L('Goldene Spirale', 'Golden spiral'), values: { mode: 'rechteck', depth: 8, spiral: true } },
    { id: 'fib', label: L('Fibonacci-Quotienten', 'Fibonacci ratios'), values: { mode: 'fibonacci', n: 12 } },
  ],
  strings: {
    de: {
      canvas: 'Zeichnung zum goldenen Schnitt: geteilte Strecke mit Verhältnissen, Konstruktion, goldenes Rechteck mit Spirale oder Fibonacci-Quotienten',
      ratio: 'a : b ≈ {v}',
      ratio2: '(a + b) : a ≈ {v}',
      phiVal: 'φ = (1 + √5) / 2 ≈ 1,6180',
      equal: 'Beide Verhältnisse sind fast gleich – das ist der goldene Schnitt.',
      notEqual: 'Die Verhältnisse unterscheiden sich noch um {d}.',
      step1: 'Strecke AB',
      step2: 'Lot in B, BC = AB/2',
      step3: 'Verbindung AC',
      step4: 'Kreis um C mit Radius CB schneidet AC in D',
      step5: 'Kreis um A mit Radius AD schneidet AB in T',
      tDone: 'AT : TB ≈ {v} – T teilt AB im goldenen Schnitt.',
      rect: 'Seitenverhältnis jedes Rechtecks: φ : 1 ≈ 1,618',
      fibLast: 'F({n}) : F({m}) = {a} : {b} ≈ {v}',
      ab: 'a : b',
      whole: '(a + b) : a',
      share: 'Teilpunkt (Anteil)',
      quotient: 'Quotient',
      n: 'n',
    },
    en: {
      canvas: 'Drawing on the golden ratio: divided segment with ratios, construction, golden rectangle with spiral or Fibonacci ratios',
      ratio: 'a : b ≈ {v}',
      ratio2: '(a + b) : a ≈ {v}',
      phiVal: 'φ = (1 + √5) / 2 ≈ 1.6180',
      equal: 'Both ratios are almost equal – that is the golden section.',
      notEqual: 'The ratios still differ by {d}.',
      step1: 'segment AB',
      step2: 'perpendicular at B, BC = AB/2',
      step3: 'join AC',
      step4: 'circle about C with radius CB cuts AC at D',
      step5: 'circle about A with radius AD cuts AB at T',
      tDone: 'AT : TB ≈ {v} – T divides AB in the golden ratio.',
      rect: 'Aspect ratio of every rectangle: φ : 1 ≈ 1.618',
      fibLast: 'F({n}) : F({m}) = {a} : {b} ≈ {v}',
      ab: 'a : b',
      whole: '(a + b) : a',
      share: 'division point (share)',
      quotient: 'ratio',
      n: 'n',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const n = (v: number, d = 4) => fmt.num(v, d);
    const split = (h: number) => Math.round(h * 0.38);

    const plot = new Plot(surface, {
      x: [-1, 11],
      y: [-2, 6],
      equalAspect: true,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => ({ x: 0, y: 0, w, h: mode() === 'teilung' ? split(h) : h }),
    });
    const chart = new Plot(surface, {
      x: [0.5, 0.9],
      y: [1, 4],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'teilung' ? { x: 0, y: split(h) + 4, w, h: h - split(h) - 4 } : { x: 0, y: h - 1, w, h: 1 }),
    });
    const fibPlot = new Plot(surface, { x: [0, 20], y: [0.8, 2.2], equalAspect: false, pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'fibonacci' ? { x: 0, y: 0, w, h } : { x: 0, y: h - 1, w, h: 1 }) });

    plot.addHandle({
      get: () => [LEN * p.t, 0],
      set: (x) => ctx.set({ t: Math.max(0.5, Math.min(0.9, Math.round((x / LEN) * 1000) / 1000)) }),
      axis: 'x',
      enabled: () => !ctx.locked && mode() === 'teilung',
      color: () => ctx.theme.series[1]!,
    });

    function setRanges(): void {
      const pad = { left: 16, right: 16, top: 16, bottom: 16 };
      if (mode() === 'teilung') {
        plot.setRangePadded([-0.5, LEN + 0.5], [-1.6, 1.6], pad);
        chart.setRangePadded([0.5, 0.9], [1, 4], { left: 48, right: 14, top: 14, bottom: 24 });
        chart.setAxes({ x: { label: ctx.t('share') }, y: { label: ctx.t('quotient') } });
      } else if (mode() === 'konstruktion') {
        plot.setRangePadded([-0.8, 10.8], [-1.5, 6], pad);
      } else if (mode() === 'rechteck') {
        plot.setRangePadded([-0.05, PHI + 0.05], [-0.05, 1.05], pad);
      } else {
        fibPlot.setRangePadded([0.5, p.n - 0.5], [0.9, 2.1], { left: 54, right: 14, top: 14, bottom: 24 });
        fibPlot.setAxes({ x: { label: ctx.t('n'), minStep: 1 }, y: { label: 'F(n+1) : F(n)' } });
      }
    }

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      show.phi = ctx.t('phiVal');
      if (mode() === 'teilung') {
        const d = division(LEN, p.t);
        show.r1 = tr('ratio', { v: n(d.ab) });
        show.r2 = tr('ratio2', { v: n(d.whole) });
        const diff = Math.abs(d.ab - d.whole);
        show.info = diff < 0.01 ? ctx.t('equal') : tr('notEqual', { d: n(diff, 3) });
      } else if (mode() === 'konstruktion') {
        const c = construction(LEN);
        show.info = p.step >= 5 ? tr('tDone', { v: n(c.T[0] / (LEN - c.T[0])) }) : ctx.t(`step${p.step}`);
      } else if (mode() === 'rechteck') {
        show.info = ctx.t('rect');
      } else {
        const f = fibonacci(p.n);
        const k = f.length;
        show.info = tr('fibLast', { n: k, m: k - 1, a: f[k - 1]!, b: f[k - 2]!, v: n(f[k - 1]! / f[k - 2]!, 6) });
      }
      for (const key of ['r1', 'r2', 'phi', 'info']) ctx.readout(key, show[key] ?? null);
    }

    function drawDivision(): void {
      const th = ctx.theme;
      const x = LEN * p.t;
      plot.begin();
      plot.segment([0, 0], [x, 0], { color: th.series[0]!, width: 6 });
      plot.segment([x, 0], [LEN, 0], { color: th.series[3]!, width: 6 });
      for (const q of [0, LEN]) plot.point(q, 0, { color: th.text, radius: 4 });
      plot.text(x / 2, 0, 'a', { size: 16, weight: 'bold', color: th.series[0]!, offset: [0, -18] });
      plot.text((x + LEN) / 2, 0, 'b', { size: 16, weight: 'bold', color: th.series[3]!, offset: [0, -18] });
      plot.text(LEN / 2, 0, 'a + b', { size: 13, color: th.muted, offset: [0, 22] });
      plot.end();
      chart.begin();
      chart.grid({ minor: false });
      chart.axes();
      chart.fn((t) => t / (1 - t), { color: th.series[0]!, width: 2.5, from: 0.5, to: 0.9 });
      chart.fn((t) => 1 / t, { color: th.series[3]!, width: 2.5, from: 0.5, to: 0.9 });
      chart.vline(p.t, { color: th.series[1]!, width: 1.5, dash: [5, 4] });
      chart.hline(PHI, { color: th.muted, width: 1, dash: [3, 4] });
      chart.point(1 / PHI, PHI, { color: th.series[2]!, radius: 5 });
      chart.text(0.74, 0.74 / 0.26, ctx.t('ab'), { size: 12, color: th.series[0]!, align: 'right', offset: [-8, 0] });
      chart.text(0.89, 1 / 0.89, ctx.t('whole'), { size: 12, color: th.series[3]!, align: 'right', offset: [0, -12] });
      chart.text(0.5, PHI, 'φ', { size: 13, weight: 'bold', color: th.muted, align: 'left', offset: [6, -10] });
      chart.end();
    }

    function drawConstruction(): void {
      const th = ctx.theme;
      const c = construction(LEN);
      const s = p.step;
      const lbl = (P: [number, number], t: string, off: [number, number]) => plot.text(P[0], P[1], t, { size: 14, weight: 'bold', color: th.text, offset: off });
      plot.begin();
      plot.segment(c.A, c.B, { color: th.series[0]!, width: 3 });
      lbl(c.A, 'A', [-12, 14]);
      lbl(c.B, 'B', [12, 14]);
      if (s >= 2) {
        plot.segment(c.B, c.C, { color: th.muted, width: 2 });
        plot.polyline(
          [
            [LEN - 0.4, 0],
            [LEN - 0.4, 0.4],
            [LEN, 0.4],
          ],
          { color: th.muted, width: 1.2 },
        );
        lbl(c.C, 'C', [12, -6]);
      }
      if (s >= 3) plot.segment(c.A, c.C, { color: th.muted, width: 2 });
      if (s >= 4) {
        plot.arc(c.C[0], c.C[1], LEN / 2, Math.PI, 1.5 * Math.PI, { stroke: th.series[3]!, width: 2 });
        plot.point(c.D[0], c.D[1], { color: th.series[3]!, radius: 5 });
        lbl(c.D, 'D', [-4, -14]);
      }
      if (s >= 5) {
        const r = Math.hypot(c.D[0], c.D[1]);
        plot.arc(0, 0, r, -0.05, Math.atan2(c.D[1], c.D[0]) + 0.05, { stroke: th.series[1]!, width: 2 });
        plot.segment(c.A, c.T, { color: th.series[1]!, width: 5 });
        plot.point(c.T[0], c.T[1], { color: th.series[1]!, radius: 6 });
        lbl(c.T, 'T', [0, 16]);
      }
      plot.end();
    }

    function drawRectangle(): void {
      const th = ctx.theme;
      const sq = goldenSquares(p.depth);
      plot.begin();
      plot.polygon(
        [
          [0, 0],
          [PHI, 0],
          [PHI, 1],
          [0, 1],
        ],
        { stroke: th.text, width: 2 },
      );
      sq.forEach((q, i) => {
        plot.polygon(
          [
            [q.x, q.y],
            [q.x + q.s, q.y],
            [q.x + q.s, q.y + q.s],
            [q.x, q.y + q.s],
          ],
          { fill: th.series[i % 4]!, alpha: 0.18, stroke: th.series[i % 4]!, width: 1.5 },
        );
      });
      if (p.spiral) for (const q of sq) plot.arc(q.cx, q.cy, q.s, q.from, q.to, { stroke: th.series[1]!, width: 2.5 });
      plot.end();
    }

    function drawFib(): void {
      const th = ctx.theme;
      const f = fibonacci(p.n);
      fibPlot.begin();
      fibPlot.grid({ minor: false });
      fibPlot.axes();
      fibPlot.hline(PHI, { color: th.series[2]!, width: 2, dash: [6, 4] });
      fibPlot.text(p.n - 0.6, PHI, 'φ', { size: 14, weight: 'bold', color: th.series[2]!, offset: [0, -12] });
      const pts: [number, number][] = [];
      for (let i = 1; i < f.length; i++) pts.push([i, f[i]! / f[i - 1]!]);
      fibPlot.polyline(pts, { color: th.series[0]!, width: 1.5, alpha: 0.5 });
      for (const q of pts) fibPlot.point(q[0], q[1], { color: th.series[0]!, radius: 4.5 });
      fibPlot.end();
    }

    return {
      update() {
        setRanges();
        updateReadouts();
      },
      render() {
        surface.begin();
        plot.resize();
        chart.resize();
        fibPlot.resize();
        if (mode() === 'teilung') drawDivision();
        else if (mode() === 'konstruktion') drawConstruction();
        else if (mode() === 'rechteck') drawRectangle();
        else drawFib();
      },
      destroy: () => surface.destroy(),
    };
  },
});
