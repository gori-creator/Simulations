import { defineSimulation, formatPiFraction, Plot, Surface, term } from '../../../sim-core';
import { DEFAULT_VIEW, evaluate, firstPeakOffset, fitView, period, PI_TWELFTH, range, type SineParams } from './model';

const L = (de: string, en: string) => ({ de, en });

const piDisplay = (twelfths: number) => formatPiFraction(twelfths * PI_TWELFTH) ?? '';

/** Werte sichtbar? Im Aufgabenmodus (`info=0`) sind die Regler ausgeblendet, sonst wäre die Lösung ablesbar. */
const shown = (v: Record<string, unknown>) => v.info !== false;

/**
 * Allgemeine Sinusfunktion f(x) = a · sin(b(x − c)) + d (oder mit Kosinus).
 *
 * Ziehbare Punkte: Verschiebung (c, d), Amplitude (Hochpunkt) und Periodenende.
 * Bei π-Achse wird c in Vielfachen von π/12 eingestellt, sonst dezimal.
 * Mit `info=0` (Aufgabenmodus) sind Regler, Hilfslinien und Ergebnisse verdeckt.
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
      label: L('Faktor a (Amplitude |a|)', 'Factor a (amplitude |a|)'),
      help: L('a < 0 spiegelt den Graphen an der Mittellinie.', 'a < 0 reflects the graph in the midline.'),
      visibleIf: shown,
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
      visibleIf: shown,
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
      visibleIf: (v) => v.piAxis === true && shown(v),
    },
    {
      key: 'c',
      type: 'number',
      label: L('Verschiebung in x-Richtung c', 'Horizontal shift c'),
      min: -8,
      max: 8,
      step: 0.05,
      default: 0,
      visibleIf: (v) => v.piAxis !== true && shown(v),
    },
    { key: 'd', type: 'number', label: L('Verschiebung in y-Richtung d', 'Vertical shift d'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: shown },
    {
      key: 'notation',
      type: 'choice',
      group: 'view',
      label: L('Schreibweise', 'Notation'),
      options: [
        { value: 'minus', label: L('a · sin(b(x − c)) + d', 'a · sin(b(x − c)) + d') },
        { value: 'plus', label: L('a · sin(b(x + c)) + d', 'a · sin(b(x + c)) + d') },
      ],
      default: 'minus',
      help: L(
        'Bei „x + c“ (so z. B. im LehrplanPLUS Bayern) verschiebt ein positives c nach links.',
        'With “x + c”, a positive c shifts the graph to the left.',
      ),
    },
    { key: 'piAxis', type: 'boolean', group: 'view', label: L('x-Achse in Vielfachen von π', 'x-axis in multiples of π'), default: true },
    { key: 'compare', type: 'boolean', group: 'view', label: L('Grundfunktion zum Vergleich', 'Base function for comparison'), default: true },
    { key: 'period', type: 'boolean', group: 'view', label: L('Periode markieren', 'Mark the period'), default: true },
    { key: 'midline', type: 'boolean', group: 'view', label: L('Mittellinie und Amplitude', 'Midline and amplitude'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
    {
      key: 'info',
      type: 'boolean',
      group: 'view',
      label: L('Werte und Hilfslinien zeigen', 'Show values and guides'),
      help: L(
        'Aus: Aufgabenmodus – Regler, Hilfslinien und Ergebnisse sind verdeckt, die Parameter werden am Graphen abgelesen.',
        'Off: exercise mode – sliders, guides and results are hidden; read the parameters off the graph.',
      ),
      default: true,
    },
  ],
  resultsParam: 'info',
  readouts: [
    { key: 'f', label: L('Funktionsgleichung', 'Equation'), spoiler: true },
    { key: 'amplitude', label: L('Amplitude', 'Amplitude'), spoiler: true },
    { key: 'period', label: L('Periode', 'Period'), spoiler: true },
    { key: 'shift', label: L('Verschiebung', 'Shift'), spoiler: true },
    { key: 'range', label: L('Wertemenge', 'Range'), spoiler: true },
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
      canvas:
        'Koordinatensystem mit dem Graphen von f(x) = a · sin(b(x − c)) + d (durchgezogen) und der Grundfunktion zum Vergleich (gestrichelt). Hilfslinien: Mittellinie y = d, senkrechte Strecke für die Amplitude |a| am Hochpunkt, Klammer für die Periode p. Ziehbare Punkte: Beginn der Periode (c | d), Hochpunkt und Ende der Periode.',
      rangeSep: ';',
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
      canvas:
        'Coordinate system with the graph of f(x) = a · sin(b(x − c)) + d (solid) and the base function for comparison (dashed). Guides: midline y = d, vertical segment for the amplitude |a| at the maximum, bracket for the period p. Draggable points: start of the period (c, d), maximum and end of the period.',
      rangeSep: ',',
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
    const plot = new Plot(surface, { x: DEFAULT_VIEW.x, y: DEFAULT_VIEW.y, xAxis: { pi: true } });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const editable = () => !ctx.locked && p.info;
    const colorF = () => ctx.theme.series[0]!;
    const colorShift = () => ctx.theme.series[1]!;
    const colorAmp = () => ctx.theme.series[2]!;
    const colorPeriod = () => ctx.theme.series[4]!;

    /** Tatsächliche Verschiebung nach rechts; bei der Schreibweise „x + c“ ist sie −c. */
    const sign = () => (p.notation === 'plus' ? -1 : 1);
    const shift = () => sign() * (p.piAxis ? p.cPi * PI_TWELFTH : p.c);
    const params = (): SineParams => ({ base: p.base, a: p.a, b: p.b, c: shift(), d: p.d });
    const setShift = (x: number) =>
      p.piAxis ? ctx.set({ cPi: Math.round((sign() * x) / PI_TWELFTH) }) : ctx.set({ c: sign() * x });

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

    return {
      update(changed, source) {
        // Links, Beispiele und Zurücksetzen: Ausschnitt so wählen, dass die erste Periode sichtbar ist
        if (source === 'init' || source === 'replace') {
          const view = fitView(params(), p.period && p.info);
          plot.setRange(view.x, view.y);
        }
        if (changed.has('piAxis')) {
          plot.setAxes({ x: { pi: p.piAxis } });
          // Verschiebung beim Umschalten übernehmen – nur bei Bedienung von Hand
          // (Links und Beispiele bringen alle Werte mit).
          if (source === 'input') {
            if (p.piAxis) ctx.set({ cPi: Math.round(p.c / PI_TWELFTH) });
            else ctx.set({ c: p.cPi * PI_TWELFTH });
          }
        }
        // Schreibweise gewechselt: c umdrehen, damit der Graph bleibt
        if (changed.has('notation') && source === 'input') ctx.set(p.piAxis ? { cPi: -p.cPi } : { c: -p.c });
        const c = shift();
        ctx.readout('f', { html: formula() });
        ctx.readout('amplitude', `|a| = ${fmt.num(Math.abs(p.a))}${p.a < 0 ? ` – ${ctx.t('reflected')}` : ''}`);
        const per = period(p.b);
        // 2π/b ist nie eine endliche Dezimalzahl: exakt nur als Bruchteil von π
        const perPi = p.piAxis ? formatPiFraction(per) : null;
        ctx.readout('period', `p = 2π / b ${perPi ? `= ${perPi} ≈` : '≈'} ${fmt.num(per)}`);
        const xPart = c === 0 ? `${ctx.t('xShift')}: ${ctx.t('none')}` : `${ctx.t('by')} ${shiftText(c)} ${ctx.t(c > 0 ? 'right' : 'left')}`;
        const yPart = p.d === 0 ? `${ctx.t('yShift')}: ${ctx.t('none')}` : `${ctx.t('by')} ${fmt.num(Math.abs(p.d))} ${ctx.t(p.d > 0 ? 'up' : 'down')}`;
        ctx.readout('shift', `${xPart}; ${yPart}`);
        const [lo, hi] = range(p);
        ctx.readout('range', `W = [${fmt.num(lo)}${ctx.t('rangeSep')} ${fmt.num(hi)}]`);
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

        if (p.midline && p.info) {
          plot.hline(sp.d, { color: colorShift(), width: 1.2, dash: [4, 5], alpha: 0.8 });
          const peakX = c + firstPeakOffset(sp.base, sp.b);
          plot.segment([peakX, sp.d], [peakX, sp.d + sp.a], { color: colorAmp(), width: 2 });
          plot.text(peakX, sp.d + sp.a / 2, `|a| = ${fmt.num(Math.abs(sp.a), 1)}`, { color: colorAmp(), baseline: 'middle', offset: [8, 0], weight: '600', size: 13 });
        }

        if (p.period && p.info) {
          const y = sp.d - Math.abs(sp.a) - 0.45;
          const color = colorPeriod();
          plot.segment([c, y], [c + per, y], { color, width: 2 });
          plot.segment([c, y - 0.15], [c, y + 0.15], { color, width: 2 });
          plot.segment([c + per, y - 0.15], [c + per, y + 0.15], { color, width: 2 });
          plot.vline(c + per, { color, width: 1, dash: [3, 5], alpha: 0.6 });
          const perPi = p.piAxis ? formatPiFraction(per) : null;
          const label = perPi ? `p = ${perPi}` : `p ≈ ${fmt.num(per)}`;
          plot.text(c + per / 2, y, label, { color, align: 'center', baseline: 'top', offset: [0, 6], weight: '600', size: 13 });
        }

        plot.fn((x) => evaluate(sp, x), { color: colorF(), width: 3 });

        if (p.info) {
          plot.point(c, sp.d, { color: colorShift(), radius: 5 });
          plot.point(c + firstPeakOffset(sp.base, sp.b), sp.d + sp.a, { color: colorAmp(), radius: 5 });
          plot.point(c + per, sp.d, { color: colorPeriod(), radius: 5, hollow: true });
        }
        plot.end();
      },

      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
