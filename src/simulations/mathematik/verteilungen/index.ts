import { defineSimulation, Plot, Surface, withAlpha } from '../../../sim-core';
import { binomial, cumulative, expCdf, expDensity, hypergeometric, poisson } from './model';

const L = (de: string, en: string) => ({ de, en });

/**
 * Weitere Verteilungen: Poisson (mit Binomial-Vergleich), hypergeometrisch
 * (Ziehen ohne Zurücklegen, mit Binomial-Vergleich) und exponentiell.
 */
export default defineSimulation({
  id: 'verteilungen',
  layout: { aspect: 1.6, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Verteilung', 'Distribution'),
      options: [
        { value: 'poisson', label: L('Poisson', 'Poisson') },
        { value: 'hyper', label: L('Hypergeometrisch', 'Hypergeometric') },
        { value: 'exp', label: L('Exponential', 'Exponential') },
      ],
      default: 'poisson',
      display: 'buttons',
    },
    { key: 'lam', type: 'number', label: L('Erwartungswert λ', 'Expected value λ'), min: 0.2, max: 20, step: 0.1, default: 3, visibleIf: (v) => v.mode === 'poisson' },
    { key: 'n', type: 'number', label: L('Binomial zum Vergleich: n', 'Binomial for comparison: n'), min: 5, max: 500, step: 5, default: 20, visibleIf: (v) => v.mode === 'poisson' && v.vgl === true },
    { key: 'N', type: 'number', label: L('Kugeln in der Urne N', 'Balls in the urn N'), min: 5, max: 100, step: 1, default: 49, visibleIf: (v) => v.mode === 'hyper' },
    { key: 'M', type: 'number', label: L('davon Treffer M', 'of which hits M'), min: 1, max: 100, step: 1, default: 6, visibleIf: (v) => v.mode === 'hyper' },
    { key: 'z', type: 'number', label: L('gezogen (ohne Zurücklegen) n', 'drawn (without replacement) n'), min: 1, max: 30, step: 1, default: 6, visibleIf: (v) => v.mode === 'hyper' },
    { key: 'vgl', type: 'boolean', label: L('mit Binomialverteilung vergleichen', 'compare with binomial distribution'), default: true, visibleIf: (v) => v.mode !== 'exp' },
    { key: 'k', type: 'number', label: L('Anzahl k', 'Number k'), min: 0, max: 40, step: 1, default: 3, visibleIf: (v) => v.mode !== 'exp' },
    { key: 'rate', type: 'number', label: L('Rate λ (pro Stunde)', 'Rate λ (per hour)'), min: 0.1, max: 3, step: 0.05, default: 0.5, visibleIf: (v) => v.mode === 'exp' },
    { key: 't', type: 'number', label: L('Wartezeit t', 'Waiting time t'), min: 0, max: 20, step: 0.1, default: 2, unit: 'h', visibleIf: (v) => v.mode === 'exp' },
  ],
  hint: (v) =>
    v.mode === 'exp'
      ? L('Die Fläche unter der Dichte bis t ist die Wahrscheinlichkeit, höchstens t zu warten.', 'The area under the density up to t is the probability of waiting at most t.')
      : v.mode === 'hyper'
        ? L('Ziehen ohne Zurücklegen: Jede gezogene Kugel verändert den Inhalt der Urne.', 'Drawing without replacement: every ball drawn changes what is left in the urn.')
        : L('Seltene Ereignisse: Mit großem n und kleinem p sieht die Binomialverteilung fast aus wie die Poisson-Verteilung.', 'Rare events: with large n and small p the binomial distribution looks almost like the Poisson distribution.'),
  readouts: [
    { key: 'pk', label: L('P(X = k)', 'P(X = k)'), spoiler: true },
    { key: 'ck', label: L('P(X ≤ k)', 'P(X ≤ k)'), spoiler: true },
    { key: 'cmp', label: L('Binomial zum Vergleich', 'Binomial for comparison') },
    { key: 'pt', label: L('P(T ≤ t)', 'P(T ≤ t)'), spoiler: true },
    { key: 'ev', label: L('Erwartungswert', 'Expected value') },
  ],
  presets: [
    { id: 'anrufe', label: L('3 Anrufe pro Minute', '3 calls per minute'), values: { mode: 'poisson', lam: 3, k: 5, vgl: false } },
    { id: 'naeh', label: L('Poisson ≈ Binomial (n = 200)', 'Poisson ≈ binomial (n = 200)'), values: { mode: 'poisson', lam: 3, n: 200, vgl: true, k: 3 } },
    { id: 'lotto', label: L('Lotto 6 aus 49', 'Lottery 6 out of 49'), values: { mode: 'hyper', N: 49, M: 6, z: 6, k: 3, vgl: true } },
    { id: 'kontrolle', label: L('Qualitätskontrolle', 'Quality control'), values: { mode: 'hyper', N: 20, M: 4, z: 5, k: 0, vgl: true } },
    { id: 'warten', label: L('Wartezeit', 'Waiting time'), values: { mode: 'exp', rate: 0.5, t: 2 } },
  ],
  strings: {
    de: {
      canvasD: 'Säulendiagramm der Wahrscheinlichkeiten P(X = k), die Säule für k ist hervorgehoben; zum Vergleich die Binomialverteilung als Umriss',
      canvasE: 'Dichte der Exponentialverteilung; die Fläche von 0 bis t ist eingefärbt',
      pkVal: '{p}',
      cmpVal: 'B(n; p) mit p = {p}: P(X = k) ≈ {b}',
      ptVal: '1 − e^(−λt) ≈ {p}',
      evPois: 'μ = λ = {m}',
      evHyp: 'μ = n·M/N ≈ {m}',
      evExp: 'μ = 1/λ = {m} h',
      kAx: 'k',
      PAx: 'P(X = k)',
      tAx: 't in h',
      fAx: 'Dichte',
      binom: 'Binomial',
    },
    en: {
      canvasD: 'Bar chart of the probabilities P(X = k), the bar for k is highlighted; the binomial distribution as an outline for comparison',
      canvasE: 'Density of the exponential distribution; the area from 0 to t is shaded',
      pkVal: '{p}',
      cmpVal: 'B(n; p) with p = {p}: P(X = k) ≈ {b}',
      ptVal: '1 − e^(−λt) ≈ {p}',
      evPois: 'μ = λ = {m}',
      evHyp: 'μ = n·M/N ≈ {m}',
      evExp: 'μ = 1/λ = {m} h',
      kAx: 'k',
      PAx: 'P(X = k)',
      tAx: 't in h',
      fAx: 'density',
      binom: 'binomial',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasD'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, { x: [0, 10], y: [0, 0.3], equalAspect: false, pan: false, zoom: false, controls: false });

    const M = () => Math.min(p.M, p.N);
    const z = () => Math.min(p.z, p.N);
    const pmf = (k: number) => (p.mode === 'hyper' ? hypergeometric(p.N, M(), z(), k) : poisson(p.lam, k));
    const bin = (k: number) => (p.mode === 'hyper' ? binomial(z(), M() / p.N, k) : binomial(p.n, p.lam / p.n, k));
    const kMax = () => (p.mode === 'hyper' ? z() : Math.max(8, Math.ceil(p.lam + 4 * Math.sqrt(p.lam) + 2)));

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      if (p.mode === 'exp') {
        show.pt = tr('ptVal', { p: fmt.num(expCdf(p.rate, p.t), 4) });
        show.ev = tr('evExp', { m: fmt.num(1 / p.rate, 2) });
      } else {
        show.pk = fmt.num(pmf(p.k), 4);
        show.ck = fmt.num(Math.min(1, cumulative(pmf, p.k)), 4);
        if (p.vgl) {
          const pp = p.mode === 'hyper' ? M() / p.N : p.lam / p.n;
          show.cmp = tr('cmpVal', { p: fmt.num(pp, 3), b: fmt.num(bin(p.k), 4) });
        }
        show.ev = p.mode === 'hyper' ? tr('evHyp', { m: fmt.num((z() * M()) / p.N, 2) }) : tr('evPois', { m: fmt.num(p.lam, 2) });
      }
      for (const k of ['pk', 'ck', 'cmp', 'pt', 'ev']) ctx.readout(k, show[k] ?? null);
    }

    function setRange(): void {
      if (p.mode === 'exp') {
        const xMax = Math.max(5 / p.rate, p.t * 1.15, 1);
        plot.setRangePadded([0, xMax], [0, p.rate * 1.1], { left: 44, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tAx') }, y: { label: ctx.t('fAx') } });
        return;
      }
      const km = kMax();
      let yMax = 0;
      for (let k = 0; k <= km; k++) yMax = Math.max(yMax, pmf(k), p.vgl ? bin(k) : 0);
      plot.setRangePadded([-0.6, km + 0.6], [0, yMax * 1.15], { left: 44, right: 14, top: 22, bottom: 24 });
      plot.setAxes({ x: { label: ctx.t('kAx'), minStep: 1 }, y: { label: ctx.t('PAx') } });
    }

    function drawDiscrete(): void {
      const th = ctx.theme;
      const km = kMax();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      for (let k = 0; k <= km; k++) {
        const v = pmf(k);
        const fill = k === p.k ? th.series[1]! : k < p.k ? withAlpha(th.series[1]!, 0.45) : withAlpha(th.series[0]!, 0.45);
        plot.polygon(
          [
            [k - 0.38, 0],
            [k + 0.38, 0],
            [k + 0.38, v],
            [k - 0.38, v],
          ],
          { fill, stroke: th.series[0]!, width: 1 },
        );
        if (p.vgl) {
          const b = bin(k);
          plot.segment([k - 0.45, b], [k + 0.45, b], { color: th.series[3]!, width: 2.5 });
        }
      }
      if (p.vgl) plot.text(km + 0.4, bin(km) + 0.001, ctx.t('binom'), { color: th.series[3]!, align: 'right', offset: [0, -14], size: 12 });
      plot.end();
    }

    function drawExp(): void {
      const th = ctx.theme;
      const xMax = Math.max(5 / p.rate, p.t * 1.15, 1);
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fillBetween((x) => expDensity(p.rate, x), () => 0, 0, Math.min(p.t, xMax), { fill: th.series[1]!, alpha: 0.35 });
      plot.fn((x) => expDensity(p.rate, x), { color: th.series[0]!, width: 2.5, from: 0, to: xMax });
      plot.vline(1 / p.rate, { color: th.muted, dash: [5, 4], width: 1 });
      plot.text(1 / p.rate, p.rate * 1.02, 'μ', { color: th.muted, align: 'left', offset: [4, 0], size: 12 });
      plot.point(p.t, expDensity(p.rate, p.t), { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    return {
      update() {
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'exp' ? 'canvasE' : 'canvasD'));
        setRange();
        updateReadouts();
      },
      render() {
        surface.begin();
        plot.resize();
        if (p.mode === 'exp') drawExp();
        else drawDiscrete();
      },
      destroy: () => surface.destroy(),
    };
  },
});
