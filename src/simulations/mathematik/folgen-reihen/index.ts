import { defineSimulation, Plot, Surface, withAlpha } from '../../../sim-core';
import { indexFor, limit, partialSum, seriesSum, term, type SeqType, type SeriesType } from './model';

const L = (de: string, en: string) => ({ de, en });
const N_SHOW = 30;

/**
 * Folgen und Reihen: Folgenglieder mit Grenzwert und ε-Streifen,
 * Teilsummen von Reihen mit Glied-Säulen.
 */
export default defineSimulation({
  id: 'folgen-reihen',
  layout: { aspect: 1.6, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'folge', label: L('Folge', 'Sequence') },
        { value: 'reihe', label: L('Reihe (Teilsummen)', 'Series (partial sums)') },
      ],
      default: 'folge',
      display: 'buttons',
    },
    {
      key: 'typ',
      type: 'choice',
      label: L('Folge', 'Sequence'),
      options: [
        { value: 'inv', label: L('aₙ = 1/n', 'aₙ = 1/n') },
        { value: 'ratio', label: L('aₙ = n/(n+1)', 'aₙ = n/(n+1)') },
        { value: 'geom', label: L('geometrisch aₙ = a·qⁿ⁻¹', 'geometric aₙ = a·qⁿ⁻¹') },
        { value: 'arith', label: L('arithmetisch aₙ = a + (n−1)·d', 'arithmetic aₙ = a + (n−1)·d') },
        { value: 'euler', label: L('aₙ = (1 + 1/n)ⁿ', 'aₙ = (1 + 1/n)ⁿ') },
        { value: 'alt', label: L('aₙ = (−1)ⁿ', 'aₙ = (−1)ⁿ') },
      ],
      default: 'inv',
      display: 'menu',
      visibleIf: (v) => v.mode === 'folge',
    },
    {
      key: 'rt',
      type: 'choice',
      label: L('Reihe', 'Series'),
      options: [
        { value: 'geom', label: L('geometrisch', 'geometric') },
        { value: 'arith', label: L('arithmetisch', 'arithmetic') },
        { value: 'harm', label: L('harmonisch 1 + 1/2 + 1/3 + …', 'harmonic 1 + 1/2 + 1/3 + …') },
      ],
      default: 'geom',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'reihe',
    },
    { key: 'a', type: 'number', label: L('Anfangsglied a', 'First term a'), min: -5, max: 5, step: 0.5, default: 1, visibleIf: (v) => (v.mode === 'folge' && (v.typ === 'geom' || v.typ === 'arith')) || (v.mode === 'reihe' && v.rt !== 'harm') },
    { key: 'd', type: 'number', label: L('Differenz d', 'Difference d'), min: -2, max: 2, step: 0.1, default: 0.5, visibleIf: (v) => (v.mode === 'folge' && v.typ === 'arith') || (v.mode === 'reihe' && v.rt === 'arith') },
    { key: 'q', type: 'number', label: L('Quotient q', 'Ratio q'), min: -1.5, max: 1.5, step: 0.05, default: 0.5, visibleIf: (v) => (v.mode === 'folge' && v.typ === 'geom') || (v.mode === 'reihe' && v.rt === 'geom') },
    { key: 'eps', type: 'number', label: L('ε-Umgebung', 'ε-neighbourhood'), min: 0.01, max: 0.5, step: 0.01, default: 0.1, visibleIf: (v) => v.mode === 'folge' },
  ],
  hint: (v) =>
    v.mode === 'reihe'
      ? L('Die Säulen sind die Glieder, die Punkte die Teilsummen. Kommen die Teilsummen einem Wert beliebig nahe, hat die Reihe eine Summe.', 'The bars are the terms, the dots the partial sums. If the partial sums get arbitrarily close to a value, the series has a sum.')
      : L('Verkleinere ε: Ab einem Index N liegen alle weiteren Glieder im Streifen – das ist Konvergenz.', 'Make ε smaller: from some index N on, all further terms lie inside the strip – that is convergence.'),
  readouts: [
    { key: 'g', label: L('Grenzwert', 'Limit'), spoiler: true },
    { key: 'N', label: L('Im ε-Streifen ab', 'Inside the ε-strip from'), spoiler: true },
    { key: 's', label: L('Teilsumme', 'Partial sum') },
    { key: 'S', label: L('Summe der Reihe', 'Sum of the series'), spoiler: true },
  ],
  presets: [
    { id: 'inv', label: L('1/n', '1/n'), values: { mode: 'folge', typ: 'inv', eps: 0.1 } },
    { id: 'euler', label: L('Folge zur Zahl e', 'Sequence for e'), values: { mode: 'folge', typ: 'euler', eps: 0.1 } },
    { id: 'alt', label: L('Divergent: (−1)ⁿ', 'Divergent: (−1)ⁿ'), values: { mode: 'folge', typ: 'alt', eps: 0.1 } },
    { id: 'halb', label: L('1 + 1/2 + 1/4 + …', '1 + 1/2 + 1/4 + …'), values: { mode: 'reihe', rt: 'geom', a: 1, q: 0.5 } },
    { id: 'harm', label: L('Harmonische Reihe', 'Harmonic series'), values: { mode: 'reihe', rt: 'harm' } },
  ],
  strings: {
    de: {
      canvasF: 'Punktdiagramm der Folgenglieder aₙ über n mit waagerechter Linie beim Grenzwert und einem Streifen der Breite ε darum',
      canvasR: 'Säulen der Reihenglieder und Punkte der Teilsummen sₙ über n, mit Linie bei der Summe der Reihe',
      gVal: 'g = {g}',
      noLimit: 'keiner – die Folge divergiert',
      NVal: 'n ≥ {N}',
      sVal: 's₃₀ ≈ {s}',
      SVal: 'a/(1 − q) = {S}',
      Sdiv: 'keine – die Reihe divergiert',
      nAx: 'n',
      aAx: 'aₙ',
      sAx: 'sₙ',
    },
    en: {
      canvasF: 'Dot plot of the terms aₙ against n with a horizontal line at the limit and a strip of width ε around it',
      canvasR: 'Bars of the series terms and dots of the partial sums sₙ against n, with a line at the sum of the series',
      gVal: 'g = {g}',
      noLimit: 'none – the sequence diverges',
      NVal: 'n ≥ {N}',
      sVal: 's₃₀ ≈ {s}',
      SVal: 'a/(1 − q) = {S}',
      Sdiv: 'none – the series diverges',
      nAx: 'n',
      aAx: 'aₙ',
      sAx: 'sₙ',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasF'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, { x: [0, N_SHOW], y: [-1, 2], equalAspect: false, pan: false, zoom: false, controls: false });

    const typ = () => p.typ as SeqType;
    const rt = () => p.rt as SeriesType;
    const a = (n: number) => term(typ(), n, p.a, p.d, p.q);
    const g = () => limit(typ(), p.a, p.d, p.q);
    const sTerm = (n: number) => (rt() === 'harm' ? 1 / n : rt() === 'geom' ? p.a * Math.pow(p.q, n - 1) : p.a + (n - 1) * p.d);
    const s = (n: number) => partialSum(rt(), n, p.a, p.d, p.q);

    function yRange(): [number, number] {
      const vals: number[] = [0];
      for (let n = 1; n <= N_SHOW; n++) {
        const v = p.mode === 'folge' ? a(n) : s(n);
        if (Number.isFinite(v)) vals.push(v);
        if (p.mode === 'reihe') vals.push(sTerm(n));
      }
      if (p.mode === 'folge' && g() !== null) vals.push(g()! + p.eps, g()! - p.eps);
      let lo = Math.min(...vals);
      let hi = Math.max(...vals);
      lo = Math.max(lo, -60);
      hi = Math.min(hi, 60);
      if (hi - lo < 1) hi = lo + 1;
      return [lo, hi];
    }

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      if (p.mode === 'folge') {
        const lim = g();
        show.g = lim === null ? ctx.t('noLimit') : tr('gVal', { g: fmt.num(lim, 4) });
        if (lim !== null) {
          const N = indexFor(p.eps, lim, a, 200000);
          show.N = N === null ? '–' : tr('NVal', { N: fmt.num(N, 0) });
        }
      } else {
        show.s = tr('sVal', { s: fmt.num(s(N_SHOW), 4) });
        const S = seriesSum(rt(), p.a, p.d, p.q);
        show.S = S === null ? ctx.t('Sdiv') : tr('SVal', { S: fmt.num(S, 4) });
      }
      for (const k of ['g', 'N', 's', 'S']) ctx.readout(k, show[k] ?? null);
    }

    function draw(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'folge') {
        const lim = g();
        if (lim !== null) {
          plot.fillBetween(() => lim + p.eps, () => lim - p.eps, 0, N_SHOW + 1, { fill: th.series[2]!, alpha: 0.2 });
          plot.hline(lim, { color: th.series[2]!, width: 1.5, dash: [6, 4] });
          const N = indexFor(p.eps, lim, a, 200000);
          if (N !== null && N <= N_SHOW) plot.vline(N, { color: th.series[3]!, width: 1.5, dash: [4, 4] });
        }
        for (let n = 1; n <= N_SHOW; n++) {
          const v = a(n);
          if (!Number.isFinite(v)) continue;
          const inside = lim !== null && Math.abs(v - lim) < p.eps;
          plot.point(n, v, { color: inside ? th.series[2]! : th.series[0]!, radius: 4 });
        }
      } else {
        for (let n = 1; n <= N_SHOW; n++) {
          const v = sTerm(n);
          plot.polygon(
            [
              [n - 0.3, 0],
              [n + 0.3, 0],
              [n + 0.3, v],
              [n - 0.3, v],
            ],
            { fill: withAlpha(th.series[0]!, 0.35), stroke: withAlpha(th.series[0]!, 0.8), width: 1 },
          );
        }
        const S = seriesSum(rt(), p.a, p.d, p.q);
        if (S !== null) plot.hline(S, { color: th.series[2]!, width: 1.5, dash: [6, 4] });
        const pts: [number, number][] = [];
        for (let n = 1; n <= N_SHOW; n++) pts.push([n, s(n)]);
        plot.polyline(pts, { color: withAlpha(th.series[1]!, 0.5), width: 1.5 });
        for (const [n, v] of pts) plot.point(n, v, { color: th.series[1]!, radius: 4 });
      }
      plot.end();
    }

    return {
      update() {
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'reihe' ? 'canvasR' : 'canvasF'));
        const [lo, hi] = yRange();
        const pad = (hi - lo) * 0.08;
        plot.setRangePadded([0, N_SHOW + 1], [lo - pad, hi + pad], { left: 40, right: 12, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('nAx'), minStep: 1 }, y: { label: ctx.t(p.mode === 'reihe' ? 'sAx' : 'aAx') } });
        updateReadouts();
      },
      render() {
        surface.begin();
        plot.resize();
        draw();
      },
      destroy: () => surface.destroy(),
    };
  },
});
