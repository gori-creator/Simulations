import { defineSimulation, formatPiFraction, Plot, Surface, term } from '../../../sim-core';
import { evaluate, firstPeakOffset, period, PI_TWELFTH, range, type SineParams } from './model';

const L = (de: string, en: string) => ({ de, en });

const piDisplay = (twelfths: number) => formatPiFraction(twelfths * PI_TWELFTH) ?? '';

/**
 * Allgemeine Sinusfunktion f(x) = a · sin(b(x − c)) + d (oder mit Kosinus).
 *
 * Ziehbare Punkte: Verschiebung (c, d), Amplitude (Hochpunkt) und Periodenende.
 * Bei π-Achse wird c in Vielfachen von π/12 eingestellt, sonst dezimal.
 */
export default defineSimulation({
  id: 'sinusfunktion',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'base',
      type: 'choice',
      label: L('Grundfunktion', 'Base function'),
      options: [
        { value: 'sin', label: L('Sinus', 'Sine') },
        { value: 'cos', label: L('Kosinus', 'Cosine') },
      ],
      default: 'sin',
    },
    {
      key: 'a',
      type: 'number',
      label: L('Amplitude a', 'Amplitude a'),
      help: L('a < 0 spiegelt den Graphen an der Mittellinie.', 'a < 0 reflects the graph in the midline.'),
      min: -4,
      max: 4,
      step: 0.1,
      default: 1,
    },
    {
      key: 'b',
      type: 'number',
      label: L('Faktor b (Periode p = 2π/b)', 'Factor b (period p = 2π/b)'),
      min: 0.1,
      max: 4,
      step: 0.01,
      default: 1,
    },
    {
      key: 'cPi',
      type: 'number',
      label: L('Verschiebung in x-Richtung c', 'Horizontal shift c'),
      min: -24,
      max: 24,
      step: 1,
      default: 0,
      display: (v) => piDisplay(v),
      visibleIf: (v) => v.piAxis === true,
    },
    {
      key: 'c',
      type: 'number',
      label: L('Verschiebung in x-Richtung c', 'Horizontal shift c'),
      min: -8,
      max: 8,
      step: 0.05,
      default: 0,
      visibleIf: (v) => v.piAxis !== true,
    },
    { key: 'd', type: 'number', label: L('Verschiebung in y-Richtung d', 'Vertical shift d'), min: -4, max: 4, step: 0.1, default: 0 },
    { key: 'piAxis', type: 'boolean', group: 'view', label: L('x-Achse in Vielfachen von π', 'x-axis in multiples of π'), default: true },
    { key: 'compare', type: 'boolean', group: 'view', label: L('Grundfunktion zum Vergleich', 'Base function for comparison'), default: true },
    { key: 'period', type: 'boolean', group: 'view', label: L('Periode markieren', 'Mark the period'), default: true },
    { key: 'midline', type: 'boolean', group: 'view', label: L('Mittellinie und Amplitude', 'Midline and amplitude'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  readouts: [
    { key: 'f', label: L('Funktionsgleichung', 'Equation'), spoiler: true },
    { key: 'amplitude', label: L('Amplitude', 'Amplitude'), spoiler: true },
    { key: 'period', label: L('Periode', 'Period'), spoiler: true },
    { key: 'shift', label: L('Verschiebung', 'Shift'), spoiler: true },
    { key: 'range', label: L('Wertebereich', 'Range'), spoiler: true },
  ],
  presets: [
    { id: 'base', label: L('Sinusfunktion', 'Sine function'), values: {} },
    { id: 'amp', label: L('Amplitude 2', 'Amplitude 2'), values: { a: 2 } },
    { id: 'fast', label: L('Halbe Periode', 'Half the period'), values: { b: 2 } },
    { id: 'shift', label: L('Verschoben', 'Shifted'), values: { cPi: 6, d: 1 } },
    { id: 'cos', label: L('Kosinus = verschobener Sinus', 'Cosine = shifted sine'), values: { cPi: -6 } },
    { id: 'model', label: L('Modell: Tageslänge', 'Model: day length'), values: { piAxis: false, a: 3.8, b: 0.52, c: 2.7, d: 0.2, compare: false } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen der allgemeinen Sinusfunktion',
      reflected: 'an der Mittellinie gespiegelt (a < 0)',
      right: 'nach rechts',
      left: 'nach links',
      up: 'nach oben',
      down: 'nach unten',
      none: 'keine',
      by: 'um',
      xShift: 'in x-Richtung',
      yShift: 'in y-Richtung',
    },
    en: {
      canvas: 'Coordinate system with the graph of the general sine function',
      reflected: 'reflected in the midline (a < 0)',
      right: 'to the right',
      left: 'to the left',
      up: 'up',
      down: 'down',
      none: 'none',
      by: 'by',
      xShift: 'horizontally',
      yShift: 'vertically',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-7, 7], y: [-4.2, 4.2], xAxis: { pi: true } });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const editable = () => !ctx.locked;
    const colorF = () => ctx.theme.series[0]!;
    const colorShift = () => ctx.theme.series[1]!;
    const colorAmp = () => ctx.theme.series[2]!;
    const colorPeriod = () => ctx.theme.series[4]!;

    const shift = () => (p.piAxis ? p.cPi * PI_TWELFTH : p.c);
    const params = (): SineParams => ({ base: p.base, a: p.a, b: p.b, c: shift(), d: p.d });
    const setShift = (x: number) => (p.piAxis ? ctx.set({ cPi: Math.round(x / PI_TWELFTH) }) : ctx.set({ c: x }));

    /** Verschiebung als Text: bei π-Achse als Bruchteil von π. */
    const shiftText = (value: number) => (p.piAxis ? (formatPiFraction(Math.abs(value)) ?? fmt.num(Math.abs(value))) : fmt.num(Math.abs(value)));

    // Verschiebung (c | d)
    plot.addHandle({ get: () => [shift(), p.d], set: (x, y) => { setShift(x); ctx.set({ d: y }); }, enabled: editable, color: colorShift });
    // Amplitude: Hochpunkt (bzw. Tiefpunkt bei a < 0)
    plot.addHandle({
      get: () => [shift() + firstPeakOffset(p.base, p.b), p.d + p.a],
      set: (_x, y) => ctx.set({ a: y - p.d }),
      axis: 'y',
      enabled: editable,
      color: colorAmp,
    });
    // Ende der ersten Periode
    plot.addHandle({
      get: () => [shift() + period(p.b), p.d],
      set: (x) => {
        const length = x - shift();
        if (length > 0.2) ctx.set({ b: (2 * Math.PI) / length });
      },
      axis: 'x',
      enabled: editable,
      color: colorPeriod,
    });

    function formula(): string {
      const c = shift();
      const inner = c === 0 ? term.x : term.shifted(c, fmt, term.x, shiftText(c));
      const b = Math.round(p.b * 100) / 100;
      const arg = b === 1 ? inner : `${fmt.num(b)}${c === 0 ? inner : `(${inner})`}`;
      const body = `${p.base}(${arg})`;
      return term.fnDef('f', term.sum([{ coef: p.a, body, dot: true }, { coef: p.d, body: '' }], fmt));
    }

    let initialized = false;

    return {
      update(changed) {
        if (changed.has('piAxis')) {
          plot.setAxes({ x: { pi: p.piAxis } });
          // Verschiebung beim Umschalten übernehmen (nicht beim Start, sonst
          // würden Werte aus einem geteilten Link überschrieben).
          if (initialized) {
            if (p.piAxis) ctx.set({ cPi: Math.round(p.c / PI_TWELFTH) });
            else ctx.set({ c: p.cPi * PI_TWELFTH });
          }
        }
        initialized = true;
        const c = shift();
        ctx.readout('f', { html: formula() });
        ctx.readout('amplitude', `|a| = ${fmt.num(Math.abs(p.a))}${p.a < 0 ? ` – ${ctx.t('reflected')}` : ''}`);
        const per = period(p.b);
        const perText = p.piAxis ? (formatPiFraction(per) ?? fmt.num(per)) : fmt.num(per);
        ctx.readout('period', `p = 2π / b = ${perText}${formatPiFraction(per) && p.piAxis ? ` ≈ ${fmt.num(per)}` : ''}`);
        const xPart = c === 0 ? `${ctx.t('xShift')}: ${ctx.t('none')}` : `${ctx.t('by')} ${shiftText(c)} ${ctx.t(c > 0 ? 'right' : 'left')}`;
        const yPart = p.d === 0 ? `${ctx.t('yShift')}: ${ctx.t('none')}` : `${ctx.t('by')} ${fmt.num(Math.abs(p.d))} ${ctx.t(p.d > 0 ? 'up' : 'down')}`;
        ctx.readout('shift', `${xPart}; ${yPart}`);
        const [lo, hi] = range(p);
        ctx.readout('range', `W = [${fmt.num(lo)}; ${fmt.num(hi)}]`);
      },

      render() {
        const sp = params();
        const c = sp.c;
        const per = period(sp.b);
        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        if (p.compare) {
          const base = p.base === 'sin' ? Math.sin : Math.cos;
          plot.fn(base, { color: ctx.theme.muted, width: 1.5, dash: [6, 5] });
        }

        if (p.midline) {
          plot.hline(sp.d, { color: colorShift(), width: 1.2, dash: [4, 5], alpha: 0.8 });
          const peakX = c + firstPeakOffset(sp.base, sp.b);
          plot.segment([peakX, sp.d], [peakX, sp.d + sp.a], { color: colorAmp(), width: 2 });
          plot.text(peakX, sp.d + sp.a / 2, `|a| = ${fmt.num(Math.abs(sp.a), 1)}`, { color: colorAmp(), baseline: 'middle', offset: [8, 0], weight: '600', size: 13 });
        }

        if (p.period) {
          const y = sp.d - Math.abs(sp.a) - 0.45;
          const color = colorPeriod();
          plot.segment([c, y], [c + per, y], { color, width: 2 });
          plot.segment([c, y - 0.15], [c, y + 0.15], { color, width: 2 });
          plot.segment([c + per, y - 0.15], [c + per, y + 0.15], { color, width: 2 });
          plot.vline(c + per, { color, width: 1, dash: [3, 5], alpha: 0.6 });
          const label = p.piAxis ? (formatPiFraction(per) ?? fmt.num(per)) : fmt.num(per);
          plot.text(c + per / 2, y, `p = ${label}`, { color, align: 'center', baseline: 'top', offset: [0, 6], weight: '600', size: 13 });
        }

        plot.fn((x) => evaluate(sp, x), { color: colorF(), width: 3 });

        plot.point(c, sp.d, { color: colorShift(), radius: 5 });
        plot.point(c + firstPeakOffset(sp.base, sp.b), sp.d + sp.a, { color: colorAmp(), radius: 5 });
        plot.point(c + per, sp.d, { color: colorPeriod(), radius: 5, hollow: true });
        plot.end();
      },

      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
