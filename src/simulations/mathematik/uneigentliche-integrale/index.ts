import { defineSimulation, Plot, Surface } from '../../../sim-core';
import { f, improperValue, partial, type Kind } from './model';

const L = (de: string, en: string) => ({ de, en });

/**
 * Uneigentliche Integrale: Fläche bis zu einer wachsenden Grenze b (bzw. ab
 * einer schrumpfenden Grenze ε) und darunter der Integralwert in
 * Abhängigkeit von der Grenze – mit oder ohne Grenzwert.
 */
export default defineSimulation({
  id: 'uneigentliche-integrale',
  layout: { aspect: 1.35, aspectNarrow: 0.8 },
  params: [
    {
      key: 'typ',
      type: 'choice',
      label: L('Art', 'Type'),
      options: [
        { value: 'unendlich', label: L('∫₁^∞ x^(−p) dx', '∫₁^∞ x^(−p) dx') },
        { value: 'polstelle', label: L('∫₀¹ x^(−p) dx (Polstelle)', '∫₀¹ x^(−p) dx (pole)') },
        { value: 'exp', label: L('∫₀^∞ e^(−x) dx', '∫₀^∞ e^(−x) dx') },
      ],
      default: 'unendlich',
      display: 'buttons',
    },
    { key: 'p', type: 'number', label: L('Exponent p', 'Exponent p'), min: 0.25, max: 3, step: 0.25, default: 2, visibleIf: (v) => v.typ !== 'exp' },
    { key: 'lb', type: 'number', label: L('obere Grenze b = 10^…', 'upper limit b = 10^…'), min: 0, max: 4, step: 0.05, default: 0.6, visibleIf: (v) => v.typ !== 'polstelle' },
    { key: 'le', type: 'number', label: L('untere Grenze ε = 10^…', 'lower limit ε = 10^…'), min: -6, max: 0, step: 0.05, default: -0.6, visibleIf: (v) => v.typ === 'polstelle' },
  ],
  hint: (v) =>
    v.typ === 'polstelle'
      ? L('Schiebe ε gegen 0. Die Fläche reicht unendlich hoch – trotzdem kann ihr Inhalt endlich sein.', 'Push ε towards 0. The area reaches infinitely high – yet its size can still be finite.')
      : L('Schiebe b nach rechts. Nähert sich der Integralwert unten einer festen Zahl, hat die unendlich lange Fläche einen endlichen Inhalt.', 'Move b to the right. If the integral value below approaches a fixed number, the infinitely long area has a finite size.'),
  readouts: [
    { key: 'int', label: L('Integral', 'Integral') },
    { key: 'lim', label: L('Uneigentliches Integral', 'Improper integral'), spoiler: true },
  ],
  presets: [
    { id: 'p2', label: L('1/x² – konvergiert', '1/x² – converges'), values: { typ: 'unendlich', p: 2, lb: 1 } },
    { id: 'p1', label: L('1/x – divergiert', '1/x – diverges'), values: { typ: 'unendlich', p: 1, lb: 2 } },
    { id: 'wurzel', label: L('1/√x bei 0', '1/√x at 0'), values: { typ: 'polstelle', p: 0.5, le: -2 } },
    { id: 'exp', label: L('e^(−x)', 'e^(−x)'), values: { typ: 'exp', lb: 0.5 } },
  ],
  strings: {
    de: {
      canvas: 'Oben der Graph mit der eingefärbten Fläche bis zur Grenze, unten der Integralwert in Abhängigkeit von der Grenze mit dem Grenzwert als Linie',
      conv: '= {v} (konvergiert)',
      div: 'divergiert – der Wert wächst über alle Grenzen',
      more: 'Fläche reicht bis b = {b} →',
      lgB: 'lg b',
      lgE: 'lg ε',
      val: 'Integralwert',
    },
    en: {
      canvas: 'At the top the graph with the area shaded up to the limit, below the integral value as a function of the limit with the limiting value as a line',
      conv: '= {v} (converges)',
      div: 'diverges – the value grows without bound',
      more: 'area reaches to b = {b} →',
      lgB: 'lg b',
      lgE: 'lg ε',
      val: 'integral value',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const kind = () => p.typ as Kind;
    const n = (v: number, d = 4) => fmt.num(v, d);
    const split = (h: number) => Math.round(h * 0.56);

    const top = new Plot(surface, { x: [0, 8], y: [0, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: (w, h) => ({ x: 0, y: 0, w, h: split(h) }) });
    const bottom = new Plot(surface, { x: [0, 4], y: [0, 2], equalAspect: false, pan: false, zoom: false, controls: false, region: (w, h) => ({ x: 0, y: split(h) + 6, w, h: h - split(h) - 6 }) });

    /** variable Grenze: b bzw. ε */
    const z = () => (kind() === 'polstelle' ? Math.pow(10, p.le) : Math.pow(10, p.lb));
    const pp = () => (kind() === 'exp' ? 0 : p.p);
    const fx = (x: number) => f(kind(), pp(), x);
    const I = (zz: number) => partial(kind(), pp(), zz);
    const lgRange = (): [number, number] => (kind() === 'polstelle' ? [-6, 0] : [0, 4]);

    function window(): [number, number, number] {
      // x-Bereich und y-Obergrenze des oberen Diagramms
      if (kind() === 'polstelle') return [0, 1.3, Math.min(12, Math.max(4, fx(Math.max(z(), 0.02)) * 1.1))];
      if (kind() === 'exp') return [0, Math.min(12, Math.max(6, z() * 1.15)), 1.15];
      return [0, Math.min(12, Math.max(6, z() * 1.15)), 1.6];
    }

    function setRanges(): void {
      const [x0, x1, yTop] = window();
      top.setRangePadded([x0, x1], [0, yTop], { left: 36, right: 14, top: 14, bottom: 22 });
      top.setAxes({ x: { label: 'x' }, y: { label: 'y' } });
      const [l0, l1] = lgRange();
      const lim = improperValue(kind(), pp());
      const end = kind() === 'polstelle' ? I(Math.pow(10, l0)) : I(Math.pow(10, l1));
      const yMax = Math.max(lim !== null ? lim * 1.3 : 0, Math.min(end, 220) * 1.08, 1);
      bottom.setRangePadded([l0, l1], [0, yMax], { left: 36, right: kind() === 'polstelle' ? 96 : 14, top: 14, bottom: 22 });
      bottom.setAxes({ x: { label: ctx.t(kind() === 'polstelle' ? 'lgE' : 'lgB'), minStep: 1 }, y: { label: ctx.t('val') } });
    }

    function updateReadouts(): void {
      const zz = z();
      const zs = n(zz, zz < 0.01 ? 6 : zz < 10 ? 3 : 0);
      const fn = kind() === 'exp' ? 'e^(−x)' : `x^(−${n(pp(), 2)})`;
      const bounds = kind() === 'polstelle' ? `∫ ${zs} … 1` : `∫ ${kind() === 'exp' ? 0 : 1} … ${zs}`;
      ctx.readout('int', `${bounds}  ${fn} dx ≈ ${n(I(zz), 4)}`);
      const lim = improperValue(kind(), pp());
      ctx.readout('lim', lim === null ? ctx.t('div') : tr('conv', { v: n(lim, 4) }));
    }

    function drawTop(): void {
      const th = ctx.theme;
      const [, x1] = window();
      top.begin();
      top.grid({ minor: false });
      top.axes();
      const zz = z();
      const from = kind() === 'polstelle' ? zz : kind() === 'exp' ? 0 : 1;
      const to = kind() === 'polstelle' ? 1 : Math.min(zz, x1 + 1);
      top.fillBetween(fx, () => 0, from, to, { fill: th.series[0]!, alpha: 0.28 });
      const start = kind() === 'exp' ? 0 : 0.01;
      top.fn(fx, { color: th.series[0]!, width: 2.5, from: start, to: x1 + 1 });
      top.vline(kind() === 'polstelle' ? zz : Math.min(zz, x1 + 1), { color: th.series[1]!, width: 1.5, dash: [5, 4] });
      if (kind() !== 'polstelle' && zz > x1) {
        top.text(x1, 0, tr('more', { b: n(zz, 0) }), { color: th.series[1]!, align: 'right', offset: [-6, -40], size: 12, weight: 'bold' });
      }
      top.end();
    }

    function drawBottom(): void {
      const th = ctx.theme;
      const [l0, l1] = lgRange();
      bottom.begin();
      bottom.grid({ minor: false });
      bottom.axes();
      const lim = improperValue(kind(), pp());
      if (lim !== null) bottom.hline(lim, { color: th.series[2]!, width: 2, dash: [6, 4] });
      bottom.fn((lg) => I(Math.pow(10, lg)), { color: th.series[1]!, width: 2.5, from: l0, to: l1 });
      const lg = kind() === 'polstelle' ? p.le : p.lb;
      bottom.point(lg, I(Math.pow(10, lg)), { color: th.series[1]!, radius: 5 });
      bottom.end();
    }

    return {
      update() {
        setRanges();
        updateReadouts();
      },
      render() {
        surface.begin();
        top.resize();
        bottom.resize();
        drawTop();
        drawBottom();
      },
      destroy: () => surface.destroy(),
    };
  },
});
